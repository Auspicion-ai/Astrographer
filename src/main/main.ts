// src/main/main.ts — the Electron main process entry. Creates the BrowserWindow
// (the renderer owns the provident-ssr graph + DOM), starts the MCP server
// (stdio or Streamable HTTP), and bridges MCP tool calls to the renderer via
// IPC.
import { app, BrowserWindow, ipcMain, Menu, dialog, type MenuItemConstructorOptions } from 'electron'
import { join, basename } from 'node:path'
import { IPC_INVOKE, IPC_REPLY, IPC_READY, IPC_SECURITY_GET, IPC_SECURITY_SET, IPC_NOTIFY, IPC_MODULE_GET, IPC_MODULE_SET_DISABLED, IPC_MODULE_TOOL_LIST, IPC_MODULE_TOOL_INVOKE, IPC_EDIT_COMMIT, IPC_EDIT_BATCH, IPC_EDIT_RICH_COMMIT, IPC_RAG_STORE_CHANGED, IPC_RAG_QUERY, IPC_RAG_SNAPSHOT, IPC_RAG_BACKLINKS, IPC_RAG_DOC_HEADS, IPC_RAG_STORE_LISTING, IPC_RAG_STORE_MANAGE, IPC_TEMPLATE_GET, IPC_TEMPLATE_VALIDATE, IPC_TEMPLATE_SET, IPC_TEMPLATE_CREATE, IPC_TEMPLATE_DELETE, IPC_TEMPLATE_RESET, IPC_TEMPLATE_CHANGED, IPC_OPERATOR_SETTINGS_GET, IPC_OPERATOR_SETTINGS_SET, IPC_OPERATOR_SETTINGS_CHANGED, IPC_GNOSIS_STATUS, IPC_GNOSIS_QUERY, IPC_GNOSIS_DOCUMENTS, IPC_GNOSIS_WIKIS, IPC_PANE_CATALOG, IPC_PANE_VISIBILITY, type RpcReply, type NotifyPayload, type ModuleToolInvokePayload, type EditCommitPayload, type EditBatchPayload, type EditRichCommitPayload, type RagQueryPayload, type RagBacklinksPayload, type OperatorSettingsPatch, type RagStoreChangedPayload, type PaneCatalogEntry } from '../shared/types.js'
import { ProvidentMcpServer, RendererBackend, handleRagQueryIpc, handleRagBacklinksIpc, handleRagDocHeadsIpc, handleRagStoreListingIpc, handleRagStoreManageIpc, handleGnosisTool, handleTemplateTool, type McpTransportKind } from './mcp-server.js'
import { createSecurityStore, gatePatchFromStoreResult, type SecurityStore } from './security-store.js'
import { createOperatorSettingsStore } from './operator-settings-store.js'
import { createEngineConfigStore, setEngineConfigBaseUrl, getEngineConfigBaseUrl } from './engine-config.js'
import { createModuleStore } from './module-store.js'
import { type BatchOp, type BatchOpResult, type RagNode } from './rag-store.js'
import { createTemplateStore } from './template-store.js'
import { buildMenuTemplate, normalizePaneCatalog, importSelectionFromDialog, IMPORT_DIALOG_FILTERS, IMPORT_DIALOG_PROPERTIES, type AppMenuActions } from './app-menu.js'
import { handleEditCommit, handleEditBatch, handleRichCommit, handleRichCommitIpc, deriveBatchBroadcast, deriveRichCommitBroadcast } from './edit-ops.js'
import { parsePositiveIntEnv, type EmbeddingProvider, type EmbeddingProviderConfig } from './embeddings.js'
import { warmUpEmbeddingProvider } from './vector-boot.js'
import { loadRagStoreRegistry } from './rag-store-registry.js'
import { buildRagStoreDirectory, storeLoadStatus } from './rag-store-directory.js'
import { createRagStoreRuntimeController } from './rag-store-runtime.js'
import { CapabilityRouter } from '../renderer/extensions.js'
import { syncModuleRouter } from './mcp-server.js'
import { SecurityGate, type ToolGroup } from './security.js'
import { createQueryAuditLog } from './query-audit.js'
import { createEngineRagStore } from './engine-rag-store.js'
import { createEngineCrudRagStore } from './engine-crud-rag-store.js'
import { createAuthorityStore } from './authority-store.js'
import { createIdempotencyRegistry } from './idempotency-registry.js'

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

/** Unit GN-MCP-UI §5.4 — resolve the Gnosis engine's baseUrl A4 in the pinned
 *  3-step priority. 1. the CONFIG SEAM (a config value, NOT a credential — the
 *  operator-owned engine-config value; when set it wins), 2. the env var
 *  `PROVIDENT_ENGINE_BASE_URL`, 3. the documented default `http://127.0.0.1:8080`.
 *  The resolved URL must be loopback (the proxy enforces it at construction). */
function resolveEngineBaseUrl(): string {
  const fromConfig = getEngineConfigBaseUrl()
  if (fromConfig) return fromConfig
  const fromEnv = process.env.PROVIDENT_ENGINE_BASE_URL
  if (fromEnv) return fromEnv
  return 'http://127.0.0.1:8080'
}

/** Unit A2 §5.4 — load the shell-side `AuthorityStore` mapping (H3): the
 *  callerId → edit-authority-credential mapping. It is a boot-time, in-memory
 *  mapping loaded from the shell's operator settings (the same operator-settings
 *  store that holds the engine `baseUrl` config seam — `src/main/engine-config.ts`).
 *  It is NOT a credential store (the credentials are opaque application-level
 *  strings, not secrets); it is the shell's "who may edit" RBAC mapping. The
 *  mapping is populated at boot and is immutable for the process lifetime (a
 *  change requires a restart). A callerId with no entry (or a null/empty
 *  credential) has NO edit authority. */
function loadAuthorityMapping(): Record<string, string> {
  // The operator settings seam (the same engine-config store family). The
  // mapping is read from the operator-owned config; a callerId with no entry
  // has no edit authority. The fixed GUI operator identity ('operator') maps to
  // the operator's edit-authority credential.
  const mapping: Record<string, string> = {}
  const operatorCredential = process.env.PROVIDENT_OPERATOR_CREDENTIAL
  if (typeof operatorCredential === 'string' && operatorCredential !== '') {
    mapping['operator'] = operatorCredential
  }
  return mapping
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
  // Unit U-MENU-1 §2 — the native application-menu surface. The renderer pushes
  // the live pane catalog over `IPC_PANE_CATALOG` (boot + registry change); main
  // rebuilds the View → Panes submenu from the latest catalog. The menu bar is
  // the AGENTS.md shell carve-out: actions route to the host over IPC (pane
  // visibility — U-SHELL-8 owns apply/persist) or run the fs-only Import dialog
  // (U-IMPORT-1 owns the directory expansion + handler).
  let latestPaneCatalog: PaneCatalogEntry[] = []
  let mainWindow: BrowserWindow | null = null
  /** File → Import… — open the fs-only dialog and hand the raw selection to
   *  U-IMPORT-1 (this unit only carries the selection across the boundary). A
   *  cancel/dismiss is a no-op (§3.7/F3). */
  const openImportDialog = (): void => {
    const options = {
      properties: [...IMPORT_DIALOG_PROPERTIES] as Array<'openFile' | 'openDirectory'>,
      filters: IMPORT_DIALOG_FILTERS.map((f) => ({ name: f.name, extensions: [...f.extensions] })),
    }
    const pending = mainWindow
      ? dialog.showOpenDialog(mainWindow, options)
      : dialog.showOpenDialog(options)
    void pending
      .then((result) => {
        const selection = importSelectionFromDialog(result)
        if (selection == null) return
        // U-IMPORT-1 owns the directory → `.md` expansion + the import handler;
        // this unit forwards the selection only.
        console.error('[provident-main] import selection (U-IMPORT-1 pending):', selection)
      })
      .catch((e) => {
        console.error('[provident-main] import dialog failed:', e)
      })
  }
  /** Build the application menu from the latest catalog and install it. */
  const rebuildApplicationMenu = (): void => {
    const actions: AppMenuActions = {
      openImport: () => openImportDialog(),
      togglePane: (id, enabled) => {
        const entry = latestPaneCatalog.find((p) => p.id === id)
        if (entry) entry.enabled = enabled
        backend.broadcast(IPC_PANE_VISIBILITY, { id, enabled })
        rebuildApplicationMenu()
      },
    }
    const template = buildMenuTemplate(latestPaneCatalog, { actions }) as MenuItemConstructorOptions[]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
  // §2.2 — the renderer pushes the catalog at boot + on every registry change;
  // main stores the normalised catalog (F1/F4) and rebuilds the submenu.
  ipcMain.on(IPC_PANE_CATALOG, (_event, catalog: unknown) => {
    latestPaneCatalog = normalizePaneCatalog(catalog)
    rebuildApplicationMenu()
  })
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
  // U-MS2 §5.4 step 1 — the multi-store registry loads ONCE at boot (U-MS1's
  // loader) from `join(userData, 'provident-rag-stores.json')`, at today's
  // single-store position (main.ts:116-120 replaced). Outcomes (U-MS1's
  // contract): file absent OR corrupt/unreadable ⇒ the fail-soft implicit
  // entry `{ name: 'main', default: true }` (persistence
  // `provident-rag.json`, no corpusRoot) + U-MS1's pinned log — boot
  // CONTINUES; valid-JSON-but-invalid ⇒ the loader THROWS, propagating out of
  // `main()` into the existing fatal path (`console.error('[provident-main]
  // fatal:', e)` + `app.exit(1)`) BEFORE the window, before `mcp.start()`,
  // before `vectorBoot.start()`, and before ANY store file is created or
  // written. The registry is read exactly ONCE per boot (D8): no IPC surface
  // below re-reads it, and a registry file changed while running is observed
  // only after restart.
  const registry = loadRagStoreRegistry({
    path: join(app.getPath('userData'), 'provident-rag-stores.json'),
  })
  // Unit I — the main-process template store (docs/specs/unit-i-template.md
  // §5.2). SEPARATE from the RAG store (the template is the envelope's
  // `template`, not RAG content). The MCP `code.template.*` tools and the UI
  // template IPC both route through it (MCP/UI equivalence — §8.2).
  const templateStore = createTemplateStore({
    path: join(app.getPath('userData'), 'provident-template.json'),
  })
  // Unit K §5.4 M9 — the operator-settings store (operator-owned, persisted to
  // userData). The `settings` pane reads/writes it over the operator-settings
  // IPC; it is NEVER an MCP tool (an agent must not change the operator's
  // view/retrieval defaults).
  const operatorSettingsStore = createOperatorSettingsStore({
    path: join(app.getPath('userData'), 'provident-operator-settings.json'),
  })
  // Unit GN-MCP-UI §5.4 A4 — the Gnosis-engine baseUrl config seam (STEP 1 of
  // resolveEngineBaseUrl). Persisted to userData (operator-owned; NOT a
  // credential). The seam is mounted into `resolveEngineBaseUrl`'s registry;
  // null → falls through to env `PROVIDENT_ENGINE_BASE_URL` → the default.
  const engineConfigStore = createEngineConfigStore({
    path: join(app.getPath('userData'), 'provident-engine-config.json'),
  })
  setEngineConfigBaseUrl(engineConfigStore.get().engineBaseUrl)
  // Unit E §5.6/§5.7 — the maintained retrieval engines, created ONCE per
  // store with the store + the selected embedder (U-MS2 §5.4 step 3 —
  // ENGINE-PER-STORE, the directory's per-name entries). F1: `rag.query` (MCP)
  // and the `rag-query` IPC both use the DEFAULT entry's engine; the index is
  // reconciled incrementally on `rag-store-changed` (never rebuilt from
  // scratch per query).
  // Unit F §5.7 — the embedder selection (`retrieval.embedder`): 'lexical'
  // (default) uses the lexical embedder; 'vector' uses the vector embedder
  // (created from the REQUIRED `retrieval.embeddingProvider` config). A
  // 'vector' selection with a missing/invalid provider config FAILS (the
  // provider-creation error propagates; the app does NOT silently fall back to
  // lexical).
  const embedderKind = retrievalEmbedderFromArgs(process.argv.slice(1))
  // U-MS2 §5.4 step 2 — the vector provider config + warm-up: UNCHANGED
  // position and semantics (the null-config check + the ONE warm-up probe stay
  // SYNC-BEFORE-WINDOW, for the DEFAULT store's branch only). The registry
  // load above precedes this, so an invalid registry aborts before the
  // embedder probe (§5.4 step 1).
  let provider: EmbeddingProvider | null = null
  if (embedderKind === 'vector') {
    const providerConfig = embeddingProviderConfigFromEnv()
    if (!providerConfig) {
      throw new Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')
    }
    provider = await warmUpEmbeddingProvider(providerConfig)
  }
  // U-MS2 §5.4 step 3 — construct the N stores + N engines (the directory plan
  // — the U-MS1 registry view consumed here). The DEFAULT store follows
  // today's exact lexical/vector branch (the vector branch via the ONE
  // plan.vectorBoot controller with the byte-equal explicit cache path);
  // non-default stores are ALWAYS lexical in Phase 1 (A6/R10).
  const plan = buildRagStoreDirectory(registry, {
    userDataPath: app.getPath('userData'),
    embedderKind,
    provider,
  })
  // U-MS2 §5.4 step 4 — the DEFAULT bindings: every existing binding site
  // below (the server options, the UI edit/batch/rich-commit reconciles, the
  // rag-query/backlinks/doc-heads/snapshot IPCs) keeps binding the DEFAULT
  // store's store/engine — now derived from the plan's default entry (the
  // legacy locals' names are kept so every binding site stays byte-equal).
  // All IPC surfaces remain DEFAULT-STORE-BOUND in Phase 1 (D9/
  // UI-SELECTOR-DEFERRED; the RagQueryPayload.store FIELD is U-MS5's).
  const defaultEntry = plan.directory.entries.get(plan.defaultName)
  if (!defaultEntry) throw new Error('rag-store-directory: default store not found')
  // U-MS2 §5.4 step 6 — vectorBoot is now the plan's at-most-ONE controller
  // (the default store's — A6); the background start() + the failure-logged
  // stay-pending behavior below are UNCHANGED.
  const vectorBoot = plan.vectorBoot
  // U-H2b §5.8 — the injected runtime seam (A-P2-1). Construct the runtime
  // controller ONCE at boot around the boot plan (the SAME directory object,
  // the SAME default entry, the SAME vectorBoot — NO-OP byte-equal, §4). No
  // rebuild/fs/read side effect at construction; the normal boot loader path
  // still reads the registry EXACTLY ONCE per boot (D8). Every LIVE closure
  // below reads the runtime's accessors per call.
  const registryPath = join(app.getPath('userData'), 'provident-rag-stores.json')
  const runtime = createRagStoreRuntimeController({
    registry,
    directory: plan.directory,
    defaultEntry: plan.directory.entries.get(plan.defaultName)!,
    vectorBoot: plan.vectorBoot,
    registryPath,
    userDataPath: app.getPath('userData'),
    embedderKind,
    provider,
  })
  // U-MS2 §5.4 step 5 — the server options gain the wired store directory
  // (`ragStores`); `ragStore`/`retrievalEngine` stay (backward-compatible) and
  // are the default entry's objects (the wiring invariant, §5.4 step 5).
  // Unit X §5.7 — the query audit log is created ONCE in main and shared by the
  // MCP `rag.query`/`rag-stream` handlers + the `rag-query` IPC + the
  // `get_query_audit_log` tool (the shared-handler seam).
  const auditLog = createQueryAuditLog()
  // Unit GN-MCP-UI §5.4 — construct the engine proxy at boot UNCONDITIONALLY
  // (the factory does NO network I/O — §5.8-7) and inject it into the MCP
  // server. The `gnosis.*` tools are handled in MAIN against it. The engine may
  // be absent (D2): `waitForReady` is NOT awaited at boot (the boot does not
  // block on an absent engine) and is NOT exposed as a tool.
  const engineRagStore = createEngineRagStore({ baseUrl: resolveEngineBaseUrl() })
  // Unit A2 §5.4 — construct the CRUD proxy + the shell-side AuthorityStore (H3)
  // + the caller-side IdempotencyRegistry (P4) at boot UNCONDITIONALLY (the CRUD
  // factory does NO network I/O — A1 §5.1) and inject them into the MCP server.
  // The `gnosis.document.*`/`gnosis.wiki.*` tools are handled in MAIN against the
  // CRUD proxy. The engine may be absent (D2): `waitForReady` is NOT awaited at
  // boot (the boot does not block on an absent engine) and is NOT exposed as a
  // tool. The AuthorityStore mapping is a boot-time, in-memory mapping (a change
  // requires a restart); a callerId with no entry has no edit authority.
  const engineCrudRagStore = createEngineCrudRagStore({ baseUrl: resolveEngineBaseUrl() })
  const authorityStore = createAuthorityStore(loadAuthorityMapping())
  const idempotency = createIdempotencyRegistry({ maxEntries: 100 })
  const mcp = new ProvidentMcpServer({ backend, transport, port, gate, moduleStore, router: moduleRouter, ragStore: runtime.getDefaultStore(), retrievalEngine: runtime.getDefaultEngine(), templateStore, ragStores: runtime.getDirectory(), runtime, auditLog, engineRagStore, engineCrudRagStore, authorityStore, idempotency })

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
  // W1-N6 (PG12) — the operator-only module-tool runner IPC. Manual-UI only:
  // the MCP tool handlers never route here, so this is not an agent surface.
  // `listTools` reports the live `CapabilityRouter`'s registered
  // `module:<name>.<tool>` names; `invoke` routes through the server's live-gate
  // `invokeTool` — the EXISTING module + code two-gate (the SAME seam the MCP
  // SDK calls use, so the live gate and the runner never diverge). No new tool.
  ipcMain.handle(IPC_MODULE_TOOL_LIST, () => moduleRouter.listTools())
  ipcMain.handle(IPC_MODULE_TOOL_INVOKE, (_event, payload: ModuleToolInvokePayload) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    if (tool === '') throw new Error('module-tools-invoke: tool required')
    return mcp.invokeTool(tool, payload.args)
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
    const result = await handleEditCommit(runtime.getDefaultStore(), { nodeId: payload.nodeId, content: payload.content })
    if (result.ok) {
      // F1 — reconcile the maintained retrieval index incrementally, then
      // broadcast the `rag-store-changed` re-traversal trigger to the renderer.
      // The reconcile is fire-and-forget, but a rejection (e.g. the vector
      // embedder's provider is down) MUST be caught — never an unhandled
      // rejection. The lexical index is already reconciled inside the engine's
      // `onStoreChanged` before the embedder hook runs, so a hook failure only
      // leaves the vector index stale (logged), not the lexical index.
      void runtime.getDefaultEngine().onStoreChanged('content', [payload.nodeId], []).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      const changedPayload: RagStoreChangedPayload = { kind: 'content', nodeIds: [payload.nodeId], edgeIds: [], store: runtime.getDefaultName() }
      backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
    }
    return result
  })

  // Unit P §5.1/§5.4 — the UI batch write-back. The renderer sends an
  // `edit-batch` IPC carrying a batch of `BatchOp` values; main validates the
  // payload, calls the SAME `applyBatch` transaction primitive as the MCP
  // `edit.batch` tool (MCP/UI equivalence — §8.2 BINDING), then broadcasts the
  // `rag-store-changed` re-traversal trigger (§5.4) on success. A malformed
  // payload or a failed batch is a domain result (never a throw) and broadcasts
  // 0 times (A1/A2); a successful batch broadcasts EXACTLY ONCE (A4).
  ipcMain.handle(IPC_EDIT_BATCH, async (_event, payload: EditBatchPayload) => {
    // A1 — a malformed payload is a domain result, never a throw.
    if (!payload || !Array.isArray(payload.ops)) {
      return { ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }
    }
    // Capture the pre-batch node snapshot for the broadcast derivation (A6).
    const preBatchNodes = new Map<string, RagNode>()
    for (const op of payload.ops) {
      if (op && op.op === 'putNode' && op.node && typeof op.node.id === 'string') {
        const n = runtime.getDefaultStore().getNode(op.node.id)
        if (n) preBatchNodes.set(op.node.id, n)
      }
    }
    const result = await handleEditBatch(runtime.getDefaultStore(), payload)
    if (result.ok) {
      // A4 — a successful batch broadcasts EXACTLY ONCE. Reconcile the
      // maintained retrieval index incrementally, then broadcast the
      // `rag-store-changed` re-traversal trigger. The reconcile is
      // fire-and-forget, but a rejection (e.g. the vector embedder's provider
      // is down) MUST be caught — never an unhandled rejection (the same
      // pattern as the `IPC_EDIT_COMMIT` handler, Unit D §5.1.10).
      const { kind, nodeIds, edgeIds } = deriveBatchBroadcast(payload.ops, result.results, preBatchNodes)
      void runtime.getDefaultEngine().onStoreChanged(kind, nodeIds, edgeIds).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: runtime.getDefaultName() }
      backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
    }
    return result
  })

  // Unit U5 §1.3 — the atomic rich-text write-back (decision A). The renderer
  // sends an `edit-rich-commit` IPC carrying the FULL decomposed `{content,
  // children}` of a contenteditable blur (Unit U2/U4); main calls the SAME
  // `setRichText` op once (one atomic putNode), then derives + broadcasts the
  // `rag-store-changed` re-traversal trigger on a REAL change. A no-op commit
  // broadcasts 0 times (idempotent — no redundant re-derive); a failed op or
  // malformed payload broadcasts 0 times.
  ipcMain.handle(IPC_EDIT_RICH_COMMIT, (_event, payload: EditRichCommitPayload) => {
    // F1 — the derive→reconcile→broadcast-once body is the node-testable
    // `handleRichCommitIpc` (edit-ops.ts, Unit U5 §1.3 — §2.1 states 24-27 +
    // ADR-2/3/11, F2 ADR-9 before-guard). This handler binds the Electron
    // boundary (the retrieval-index reconcile + the `rag-store-changed`
    // broadcast). The boundary check (A1) lives INSIDE `handleRichCommitIpc`,
    // so the malformed/failed/no-op/real-change broadcast contract is covered
    // by the F1 regression tests against the shared handler.
    return handleRichCommitIpc(runtime.getDefaultStore(), payload, {
      reconcile: (kind, nodeIds, edgeIds) => runtime.getDefaultEngine().onStoreChanged(kind, nodeIds, edgeIds),
      broadcast: (kind, nodeIds, edgeIds) => {
        const changedPayload: RagStoreChangedPayload = { kind, nodeIds, edgeIds, store: runtime.getDefaultName() }
        backend.broadcast(IPC_RAG_STORE_CHANGED, changedPayload)
      },
    })
  })

  // Unit E §5.7/§8.2 — the UI retrieval path. The `rag-query` IPC calls the SAME
  // maintained retrieval engine as the MCP `rag.query` tool (MCP/UI
  // equivalence — a BINDING constraint). The renderer never computes retrieval
  // itself. U-MS2 §5.4 step 4 (F4) — the SAME directory injection as the MCP
  // path: the resolver behaves IDENTICALLY on both surfaces (at U-MS2 the
  // payload carries no `store` field ⇒ the omitted ⇒ default-entry rule
  // applies; U-MS5's additive field resolves through the SAME resolver).
  ipcMain.handle(IPC_RAG_QUERY, (_event, payload: RagQueryPayload) => {
    // W1-N9 — forward the advanced-search args (mode/maxHops/expand/
    // maxParentContext/filters) alongside query/topK/store/stores so the UI IPC
    // and the MCP `rag.query` tool resolve/validate the SAME field set.
    return handleRagQueryIpc(
      runtime.getDefaultEngine(),
      runtime.getDefaultStore(),
      {
        query: payload?.query,
        topK: payload?.topK,
        store: payload?.store,
        stores: payload?.stores,
        mode: payload?.mode,
        maxHops: payload?.maxHops,
        expand: payload?.expand,
        maxParentContext: payload?.maxParentContext,
        filters: payload?.filters,
      },
      runtime.getDirectory(),
      auditLog,
    )
  })

  // Unit G §5.4/§8.2 — the UI backlink path. The `rag-backlinks` IPC calls the
  // SAME host-side enumeration (`enumerateLinks`) as the MCP `rag.backlinks`
  // tool (MCP/UI equivalence — a BINDING constraint). The renderer never
  // computes the enumeration itself.
  ipcMain.handle(IPC_RAG_BACKLINKS, (_event, payload: RagBacklinksPayload) => {
    return handleRagBacklinksIpc(runtime.getDefaultStore(), { nodeId: payload?.nodeId })
  })

  // Unit V3 §5.1 — the UI doc-nav path. The `rag-doc-heads` IPC calls the SAME
  // shared handler (`handleRagDocHeadsIpc`) as the doc-nav data source, returning
  // the document list (the `doc-head` edges' targets + the head node content) — a
  // strict subset of the snapshot. The renderer never computes the doc-heads
  // derivation itself.
  ipcMain.handle(IPC_RAG_DOC_HEADS, () => {
    return handleRagDocHeadsIpc(runtime.getDefaultStore())
  })

  // U-MS5 — the read-only settings-pane store listing. Manual-UI ONLY: the MCP
  // tool handlers never route to this channel, so an agent cannot enumerate the
  // configured store names (B9/A9). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED,
  // decisions.md:45) and NOT a five-seam gate seam — no RpcMethod, no TOOL_GROUPS
  // row, no ALL_TOOLS row, no MUTATING_METHODS member, no renderer-switch method
  // (the MCP tool census stays 12). U-H2b §5.8/A-P2-3 — the handler projects the
  // runtime's CURRENT resolved projection (`currentStores()` + `statusOf`), NOT
  // the boot `registry` const: a renderer pull after a registry apply shows the fresh
  // state (refresh-on-apply). The registry file is still NEVER re-read on this
  // idle path (D8 — the boot path re-reads nothing; the runtime's apply seam is
  // the ONLY re-read).
  ipcMain.handle(IPC_RAG_STORE_LISTING, () => {
    // U-H2b §5.8/B12 — the runtime's CURRENT resolved projection (A-P2-3): the
    // fresh `loaded.stores` after an apply, the boot registry at boot. The FILE
    // NAME (basename) + `corpusRoot ?? null` projection is byte-equal to the
    // previous boot-cached projection.
    const listingEntries = runtime.currentStores().map((s) => ({
      name: s.name,
      default: s.default,
      persistenceFile: basename(s.persistenceFile),
      corpusRoot: s.corpusRoot ?? null,
    }))
    return handleRagStoreListingIpc(
      listingEntries,
      // U-H2b §5.8/B12 — the per-store load status is resolved via the
      // runtime's `statusOf` (the U-MS2 D7 matrix over the LIVE entries: loaded
      // / failed-corrupt / failed-missing). An unknown store throws
      // `rag-store-runtime: unknown store '<name>'` (byte-pinned R-status-unknown).
      (name) => runtime.statusOf(name),
    )
  })

  // Unit U-H8 §5.4 — the operator-registry MANAGE wiring (the review §2 D6's ONE
  // operator-UI IPC exemption: the operator editor). The shared
  // `handleRagStoreManageIpc` validates the request, reads the live projection per
  // call (A-P2-1), runs the two-phase confirmation (a destructive op without
  // `confirmed:true` returns `{ confirmationRequired: true, summary }` and invokes
  // NO seam), and invokes the LANDED hot-* seams with `confirmed:true` — routing
  // add/remove/rename to a listing-refresh and setDefault/renameDefault to the
  // app re-derive. Manual-UI only: never an MCP tool — an agent cannot manage the
  // registry over MCP (A-P2-6/A-P2-7). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED).
  ipcMain.handle(IPC_RAG_STORE_MANAGE, (_event, request: unknown) => {
    return handleRagStoreManageIpc(runtime, request)
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

  // Unit K §5.4 M9 — the operator-settings IPC surface. Manual-UI only: the
  // `settings` pane reads/writes the operator-owned config over these channels;
  // the MCP tool handlers never route to them, so an agent cannot change the
  // operator's view/retrieval defaults.
  ipcMain.handle(IPC_OPERATOR_SETTINGS_GET, () => operatorSettingsStore.get())
  ipcMain.handle(IPC_OPERATOR_SETTINGS_SET, (_event, patch: OperatorSettingsPatch) => {
    const updated = operatorSettingsStore.set(patch)
    // Unit U1 §1.3 — the operator-settings-change broadcast (the re-derive
    // trigger). Payload = the store's filtered/coerced result (single source of
    // truth = the main store), NOT the raw patch. One-way notification, fired
    // exactly once per SET (the store's set never throws for a domain failure).
    // GET never broadcasts.
    backend.broadcast(IPC_OPERATOR_SETTINGS_CHANGED, updated)
    return updated
  })

  // Unit GN-MCP-UI §5.5 — the gnosis GUI bridge IPC (D4 MCP/UI parity). The
  // `gnosis-status` operator pane + the `gnosis-query` app-graph pane reach the
  // SAME main-process handler as the `gnosis.*` MCP tools (MCP/UI equivalence via
  // the LANDED proxy — the renderer never computes engine retrieval itself). A
  // rejection (e.g. the D2 engine-absent `EngineUnavailable`) propagates as the
  // invoke rejection so the pane handler catches it and renders the unavailable
  // state (never a crash). Manual-UI only: the MCP tool handlers never route to
  // these channels (an agent cannot grant itself the gnosis group).
  ipcMain.handle(IPC_GNOSIS_STATUS, () => {
    return handleGnosisTool(engineRagStore, 'gnosis.status', {})
  })
  ipcMain.handle(IPC_GNOSIS_QUERY, (_event, args: Record<string, unknown>) => {
    return handleGnosisTool(engineRagStore, 'gnosis.query', args ?? {})
  })

  // Unit A2 §5.5 — the gnosis document/wiki GUI bridge IPC (D4 MCP/UI parity).
  // The `gnosis-documents`/`gnosis-wikis` app-graph panes reach the SAME
  // main-process handler as the `gnosis.document.*`/`gnosis.wiki.*` MCP tools
  // (MCP/UI equivalence via the LANDED CRUD proxy — the renderer never computes
  // document/wiki CRUD itself). The mutating tools resolve the caller's
  // edit-authority credential from the `authorityStore`; the create tools dedup
  // via the `idempotency` registry. A rejection (e.g. the D2 engine-absent
  // `EngineUnavailable`, or a `ConflictError` 409) propagates as the invoke
  // rejection so the pane handler catches it and renders the unavailable/conflict
  // state (never a crash). Manual-UI only: the MCP tool handlers never route to
  // these channels (an agent cannot grant itself the gnosis/gnosis-edit groups).
  ipcMain.handle(IPC_GNOSIS_DOCUMENTS, (_event, payload: { tool?: string; args?: Record<string, unknown> }) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    return handleGnosisTool(engineRagStore, tool, (payload?.args ?? {}) as Record<string, unknown>, auditLog, engineCrudRagStore, authorityStore, idempotency)
  })
  ipcMain.handle(IPC_GNOSIS_WIKIS, (_event, payload: { tool?: string; args?: Record<string, unknown> }) => {
    const tool = typeof payload?.tool === 'string' ? payload.tool : ''
    return handleGnosisTool(engineRagStore, tool, (payload?.args ?? {}) as Record<string, unknown>, auditLog, engineCrudRagStore, authorityStore, idempotency)
  })

  // Finding 3 — the re-traversal data source. The renderer's `onRebuild`
  // re-traversal (Unit C `buildTraversal`) needs the RAG store's nodes/edges,
  // which live in MAIN (the single-writer store). This IPC returns a read-only
  // snapshot so the renderer can re-derive the graph + back-reference map after
  // a `rag-store-changed` broadcast.
  ipcMain.handle(IPC_RAG_SNAPSHOT, () => ({
    nodes: runtime.getDefaultStore().listNodes(),
    edges: runtime.getDefaultStore().listEdges(),
    store: runtime.getDefaultName(),
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
  // U-MENU-1 §2.1 — install the application menu once the window exists (the
  // dialog is parented to it). Rebuilt on every `IPC_PANE_CATALOG` push.
  mainWindow = win
  rebuildApplicationMenu()

  const rendererHtml = join(here, '..', 'renderer', 'index.html')
  await win.loadFile(rendererHtml)

  await mcp.start()

  // Unit F §5.12 — the fire-and-forget background build (F1 discipline): the
  // window + MCP server started immediately (the pending phase serves
  // LEXICALLY through the shared engine); a build failure is LOGGED and the
  // engine STAYS pending — never an unhandled rejection.
  if (vectorBoot) {
    void vectorBoot.start().catch((e) => {
      console.error('[provident-main] vector boot build failed (staying pending):', e)
    })
  }

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