// src/main/main.ts — the Electron main process entry. Creates the BrowserWindow
// (the renderer owns the provident-ssr graph + DOM), starts the MCP server
// (stdio or Streamable HTTP), and bridges MCP tool calls to the renderer via
// IPC.
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { IPC_INVOKE, IPC_REPLY, IPC_READY, IPC_SECURITY_GET, IPC_SECURITY_SET, IPC_NOTIFY, IPC_MODULE_GET, IPC_MODULE_SET_DISABLED, IPC_EDIT_COMMIT, IPC_RAG_STORE_CHANGED, IPC_RAG_QUERY, IPC_RAG_SNAPSHOT, IPC_RAG_BACKLINKS, IPC_TEMPLATE_GET, IPC_TEMPLATE_VALIDATE, IPC_TEMPLATE_SET, IPC_TEMPLATE_CREATE, IPC_TEMPLATE_DELETE, IPC_TEMPLATE_RESET, IPC_TEMPLATE_CHANGED, type RpcReply, type NotifyPayload, type EditCommitPayload, type RagQueryPayload, type RagBacklinksPayload } from '../shared/types.js'
import { ProvidentMcpServer, RendererBackend, handleRagQueryIpc, handleRagBacklinksIpc, handleTemplateTool, type McpTransportKind } from './mcp-server.js'
import { createSecurityStore, gatePatchFromStoreResult, type SecurityStore } from './security-store.js'
import { createModuleStore } from './module-store.js'
import { createJsonRagStore } from './rag-store.js'
import { createTemplateStore } from './template-store.js'
import { handleEditCommit } from './edit-ops.js'
import { createLexicalIndex, createLexicalEmbedder, createRetrieval } from './retrieval.js'
import type { RetrievalEngine } from './retrieval.js'
import { createVectorEmbedder, parsePositiveIntEnv, type EmbeddingProviderConfig } from './embeddings.js'
import { CapabilityRouter } from '../renderer/extensions.js'
import { syncModuleRouter } from './mcp-server.js'
import { SecurityGate, type ToolGroup } from './security.js'

// The main process is bundled as CJS (Electron runs it reliably that way), so
// `__dirname` is available.
const here = __dirname

function transportFromArgs(argv: string[]): McpTransportKind {
  const flag = argv.find((a) => a.startsWith('--mcp-transport='))
  if (flag) {
    const v = flag.slice('--mcp-transport='.length)
    if (v === 'http' || v === 'stdio') return v
  }
  const env = process.env.PROVIDENT_MCP_TRANSPORT
  if (env === 'http' || env === 'stdio') return env
  return 'http'
}

function portFromArgs(argv: string[]): number {
  const flag = argv.find((a) => a.startsWith('--mcp-port='))
  if (flag) {
    const v = Number(flag.slice('--mcp-port='.length))
    if (Number.isFinite(v)) return v
  }
  const env = Number(process.env.PROVIDENT_MCP_PORT)
  if (Number.isFinite(env)) return env
  return 3787
}

/** Unit F §5.7 — the retrieval embedder selection (`retrieval.embedder`).
 *  Default 'lexical'. Read from `--retrieval-embedder=` / env. */
function retrievalEmbedderFromArgs(argv: string[]): 'lexical' | 'vector' {
  const flag = argv.find((a) => a.startsWith('--retrieval-embedder='))
  if (flag) {
    const v = flag.slice('--retrieval-embedder='.length)
    if (v === 'vector' || v === 'lexical') return v
  }
  const env = process.env.PROVIDENT_RETRIEVAL_EMBEDDER
  if (env === 'vector' || env === 'lexical') return env
  return 'lexical'
}

/** Unit F §5.7 — the embedding provider config (`retrieval.embeddingProvider`),
 *  read from env. REQUIRED when `retrieval.embedder === 'vector'`. */
function embeddingProviderConfigFromEnv(): EmbeddingProviderConfig | null {
  const provider = process.env.PROVIDENT_EMBEDDING_PROVIDER
  const baseUrl = process.env.PROVIDENT_EMBEDDING_BASE_URL
  const model = process.env.PROVIDENT_EMBEDDING_MODEL
  if (!provider || !baseUrl || !model) return null
  return {
    provider,
    baseUrl,
    model,
    apiKey: process.env.PROVIDENT_EMBEDDING_API_KEY,
    // F5 — validate the numeric env fields: a NaN/negative/non-integer value
    // is dropped (undefined) rather than passed through as a malformed
    // dimension/timeout.
    dimension: parsePositiveIntEnv(process.env.PROVIDENT_EMBEDDING_DIMENSION),
    timeoutMs: parsePositiveIntEnv(process.env.PROVIDENT_EMBEDDING_TIMEOUT_MS),
  }
}

async function main(): Promise<void> {
  console.error(`[provident-main] node ${process.versions.node} electron ${process.versions.electron} crypto=${typeof globalThis.crypto}`)
  const transport = transportFromArgs(process.argv.slice(1))
  const port = portFromArgs(process.argv.slice(1))

  // The manual-UI security settings (mcp-endpoint.md §6.4): persisted to
  // userData so a restart restores them. The MCP server gate is built from the
  // persisted config (read+dispatch ON by default on first run).
  const securityStore: SecurityStore = createSecurityStore({
    path: join(app.getPath('userData'), 'provident-security.json'),
  })
  const persisted = securityStore.get()
  const gate = new SecurityGate({ token: persisted.token, enabled: persisted.enabled as ToolGroup[] })
  // L3 (adversarial) — track the last-known persisted enabled set so the live
  // gate is re-patched from the STORE's FILTERED result (not the raw IPC patch).
  // The store drops unknown/invalid groups; if the live gate consumed the raw
  // patch it could enable a group the persisted config drops → live/persisted
  // divergence on restart. Deriving the add/remove diff from the store's result
  // keeps the live gate exactly in sync with what is persisted.
  let currentEnabled = persisted.enabled
  const backend = new RendererBackend()
  // U8 — the module store (operator-owned, persisted to userData). The MCP
  // server handles module.* tools against it; the pane reads/writes it over IPC.
  const moduleStore = createModuleStore({
    path: join(app.getPath('userData'), 'provident-modules.json'),
  })
  // U9-FIX — the live capability router (main-process). Synced from the module
  // store so installed modules' declared tools become callable. Passed to the
  // MCP server so dynamic module tools are registered + two-gated.
  const moduleRouter = new CapabilityRouter()
  syncModuleRouter(moduleRouter, moduleStore)
  // Unit B — the main-process RAG store (Unit A §5.3, SOURCE-SWITCHABLE). The
  // MCP server handles the rag.*/edit.* tools against it (never the renderer).
  const ragStore = createJsonRagStore({
    path: join(app.getPath('userData'), 'provident-rag.json'),
  })
  // Unit I — the main-process template store (docs/specs/unit-i-template.md
  // §5.2). SEPARATE from the RAG store (the template is the envelope's
  // `template`, not RAG content). The MCP `code.template.*` tools and the UI
  // template IPC both route through it (MCP/UI equivalence — §8.2).
  const templateStore = createTemplateStore({
    path: join(app.getPath('userData'), 'provident-template.json'),
  })
  // Unit E §5.6/§5.7 — the maintained retrieval engine, created ONCE with the
  // store + the selected embedder. F1: `rag.query` (MCP) and the `rag-query`
  // IPC both use THIS engine; the index is reconciled incrementally on
  // `rag-store-changed` (never rebuilt from scratch per query).
  // Unit F §5.7 — the embedder selection (`retrieval.embedder`): 'lexical'
  // (default) uses the lexical embedder; 'vector' uses the vector embedder
  // (created from the REQUIRED `retrieval.embeddingProvider` config). A
  // 'vector' selection with a missing/invalid provider config FAILS (the
  // provider-creation error propagates; the app does NOT silently fall back to
  // lexical).
  const embedderKind = retrievalEmbedderFromArgs(process.argv.slice(1))
  let retrievalEngine: RetrievalEngine
  if (embedderKind === 'vector') {
    const providerConfig = embeddingProviderConfigFromEnv()
    if (!providerConfig) {
      throw new Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')
    }
    const vectorEmbedder = await createVectorEmbedder(ragStore, { provider: providerConfig })
    retrievalEngine = createRetrieval(ragStore, vectorEmbedder)
  } else {
    retrievalEngine = createRetrieval(ragStore, createLexicalEmbedder(createLexicalIndex(ragStore.listNodes())))
  }
  const mcp = new ProvidentMcpServer({ backend, transport, port, gate, moduleStore, router: moduleRouter, ragStore, retrievalEngine, templateStore })

  // The manual-UI settings IPC: main owns the config + re-wires the MCP server
  // tool-gating on change. This is manual-UI-ONLY — it is NOT reachable over an
  // MCP tool (the MCP tool handlers never route to it), so an agent cannot grant
  // itself capabilities.
  ipcMain.handle(IPC_SECURITY_GET, () => securityStore.get())
  ipcMain.handle(IPC_SECURITY_SET, (_event, patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }) => {
    const updated = securityStore.set(patch)
    // L3 — re-gate the live MCP server from the STORE's FILTERED result (the
    // diff of the persisted enabled set), NOT the raw patch. This keeps the
    // live gate and the persisted config in sync: a group the store drops
    // (unknown/invalid) is never enabled live, and a group it keeps is enabled
    // live exactly as persisted.
    const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
    // The store only keeps VALID groups (all of which are ToolGroup), so the
    // cast is safe — the store's filtered result is the source of truth.
    mcp.applyGatePatch({ token: gatePatch.token, groups: gatePatch.groups as ToolGroup[], disable: gatePatch.disable as ToolGroup[] })
    currentEnabled = updated.enabled
    return updated
  })

  // U8 — the module management IPC (module-feature-list.md §4). Manual-UI only:
  // the module store is operator-owned; an agent never reaches it over MCP.
  const moduleBridgeResult = () => {
    const status = moduleStore.status()
    return {
      corrupt: status.corrupt,
      quarantined: status.quarantined,
      loaded: status.loaded,
      modules: moduleStore.list().map((r) => ({
        name: r.name,
        version: r.version,
        capabilities: r.capabilities,
        disabled: r.disabled,
        quarantined: r.quarantined,
      })),
    }
  }
  ipcMain.handle(IPC_MODULE_GET, () => moduleBridgeResult())
  ipcMain.handle(IPC_MODULE_SET_DISABLED, (_event, payload: { name?: string; disabled?: boolean }) => {
    if (typeof payload?.name === 'string' && payload.name !== '') {
      moduleStore.setDisabled(payload.name, payload.disabled === true)
      // U9-FIX (#2) — disabling/enabling a module must re-sync the live router
      // so its tools are registered/deregistered accordingly.
      syncModuleRouter(moduleRouter, moduleStore)
    }
    return moduleBridgeResult()
  })

  // Unit D §5.1.10 — the UI commit-on-blur write-back. The renderer sends an
  // `edit-commit` IPC on blur; main calls the SAME edit op (`setContent`) as
  // the MCP tool (MCP/UI equivalence — §5.7), then broadcasts the
  // `rag-store-changed` re-traversal trigger (§5.1.9). Returns a CommitResult
  // shape so the renderer's injected commit can surface store errors.
  ipcMain.handle(IPC_EDIT_COMMIT, async (_event, payload: EditCommitPayload) => {
    if (!payload || typeof payload.nodeId !== 'string' || typeof payload.content !== 'string') {
      return { ok: false, reason: 'store-error', error: 'edit-commit: nodeId and content required' }
    }
    // Unit D §5.1.10 — the SAME edit op (`setContent`) as the MCP tool
    // (MCP/UI equivalence — §5.7). `handleEditCommit` maps a deleted-node race
    // (setContent's `'edit.set_content: node not found'`) to
    // `reason:'deleted-node'` (Finding 4), NOT `store-error`.
    const result = await handleEditCommit(ragStore, { nodeId: payload.nodeId, content: payload.content })
    if (result.ok) {
      // F1 — reconcile the maintained retrieval index incrementally, then
      // broadcast the `rag-store-changed` re-traversal trigger to the renderer.
      // The reconcile is fire-and-forget, but a rejection (e.g. the vector
      // embedder's provider is down) MUST be caught — never an unhandled
      // rejection. The lexical index is already reconciled inside the engine's
      // `onStoreChanged` before the embedder hook runs, so a hook failure only
      // leaves the vector index stale (logged), not the lexical index.
      void retrievalEngine.onStoreChanged('content', [payload.nodeId], []).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      backend.broadcast(IPC_RAG_STORE_CHANGED, { kind: 'content', nodeIds: [payload.nodeId], edgeIds: [] })
    }
    return result
  })

  // Unit E §5.7/§8.2 — the UI retrieval path. The `rag-query` IPC calls the SAME
  // maintained retrieval engine as the MCP `rag.query` tool (MCP/UI
  // equivalence — a BINDING constraint). The renderer never computes retrieval
  // itself.
  ipcMain.handle(IPC_RAG_QUERY, (_event, payload: RagQueryPayload) => {
    return handleRagQueryIpc(retrievalEngine, ragStore, { query: payload?.query, topK: payload?.topK })
  })

  // Unit G §5.4/§8.2 — the UI backlink path. The `rag-backlinks` IPC calls the
  // SAME host-side enumeration (`enumerateLinks`) as the MCP `rag.backlinks`
  // tool (MCP/UI equivalence — a BINDING constraint). The renderer never
  // computes the enumeration itself.
  ipcMain.handle(IPC_RAG_BACKLINKS, (_event, payload: RagBacklinksPayload) => {
    return handleRagBacklinksIpc(ragStore, { nodeId: payload?.nodeId })
  })

  // Unit I §5.4/§8.2 — the UI template IPC surface. Each renderer→main
  // `code.template.*`-equivalent channel delegates to `handleTemplateTool` with
  // the SAME template store as the MCP tools (MCP/UI equivalence — a BINDING
  // constraint). The mutating handlers broadcast `template-changed` on success
  // (the whole-graph re-derive trigger). The IPC surface is NOT group-gated
  // (the renderer is a trusted surface; the `code` group gates the MCP agent
  // path).
  const handleTemplateIpc = (name: string) => (_event: unknown, payload: unknown) => {
    return handleTemplateTool(templateStore, name, (payload ?? {}) as Record<string, unknown>, (p) => {
      backend.broadcast(IPC_TEMPLATE_CHANGED, p)
    })
  }
  ipcMain.handle(IPC_TEMPLATE_GET, handleTemplateIpc('code.template.get'))
  ipcMain.handle(IPC_TEMPLATE_VALIDATE, handleTemplateIpc('code.template.validate'))
  ipcMain.handle(IPC_TEMPLATE_SET, handleTemplateIpc('code.template.set'))
  ipcMain.handle(IPC_TEMPLATE_CREATE, handleTemplateIpc('code.template.create'))
  ipcMain.handle(IPC_TEMPLATE_DELETE, handleTemplateIpc('code.template.delete'))
  ipcMain.handle(IPC_TEMPLATE_RESET, handleTemplateIpc('code.template.reset'))

  // Finding 3 — the re-traversal data source. The renderer's `onRebuild`
  // re-traversal (Unit C `buildTraversal`) needs the RAG store's nodes/edges,
  // which live in MAIN (the single-writer store). This IPC returns a read-only
  // snapshot so the renderer can re-derive the graph + back-reference map after
  // a `rag-store-changed` broadcast.
  ipcMain.handle(IPC_RAG_SNAPSHOT, () => ({
    nodes: ragStore.listNodes(),
    edges: ragStore.listEdges(),
  }))

  // The MCP stdio transport is spawned by a client (the battery, a test, or an
  // agent). When that client disconnects, stdin closes. Exit so a test run does
  // NOT leave an orphaned Electron app instance open on the machine — otherwise
  // every test spawn leaves a live BrowserWindow behind.
  if (transport === 'stdio') {
    process.stdin.on('end', () => {
      console.error('[provident-main] stdin closed — MCP client disconnected; exiting')
      void mcp.close().finally(() => app.exit(0))
    })
    process.stdin.on('error', () => {
      void mcp.close().finally(() => app.exit(0))
    })
  }

  ipcMain.on(IPC_READY, () => {
    backend.markReady()
    console.error('[provident-main] renderer ready — MCP backend armed')
  })
  ipcMain.on(IPC_REPLY, (_event, reply: RpcReply) => {
    backend.handleReply(reply)
  })
  // N4 (live-notification-review.md) — the app-graph-changed push from the
  // renderer. Maps it into a resource-updated notification over the stdio MCP
  // server (N2: HTTP is stateless → no-op). Sourced ONLY from the app Runtime
  // re-render; SecurePanels never emits here.
  ipcMain.on(IPC_NOTIFY, (_event, payload: NotifyPayload) => {
    void mcp.notifyGraphChanged()
  })

  const win = new BrowserWindow({
    width: 980,
    height: 720,
    webPreferences: {
      preload: join(here, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  backend.attachWindow(win)

  const rendererHtml = join(here, '..', 'renderer', 'index.html')
  await win.loadFile(rendererHtml)

  await mcp.start()

  win.on('closed', () => {
    void mcp.close()
    app.quit()
  })
}

app.whenReady().then(() => {
  void main().catch((e) => {
    console.error('[provident-main] fatal:', e)
    app.exit(1)
  })
})

app.on('window-all-closed', () => {
  app.quit()
})