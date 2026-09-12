// src/renderer/renderer.ts — browser entry for the Electron renderer.
// Bootstraps the provident-ssr producing process into #app and serves the
// MCP-facing operations over the preload bridge (main process = MCP server).
import { Runtime } from './runtime.js'
import { SidebarPanes } from './sidebar-panes.js'
import { GnosisPanes } from './gnosis-panes.js'
import { GnosisCrudPanes } from './gnosis-crud-panes.js'
import { createPaneRegistry } from './pane-registry.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../main/template-shape.js'
import type { LegacyInitialData } from 'provident-ssr'
import { SecurePanels } from './secure-panels.js'
import { createEditController } from './edit-controller.js'
import { applyThemeToRoot } from './theme.js'
import type { RpcRequest, RpcReply } from '../shared/types.js'

/** N3 (live-notification-review.md) — the MCP methods that mutate the APP graph
 *  (content/structural/re-derive). Only these trigger the app-graph-changed push
 *  AFTER the reply. Never triggered by the isolated SecurePanels graph. */
const MUTATING_METHODS = new Set(['dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch', 'journal'])

function handleRequest(runtime: Runtime, req: RpcRequest, notify: (p: { uri: string }) => void): Promise<RpcReply> {
  return (async (): Promise<RpcReply> => {
    try {
      let value: unknown
      switch (req.method) {
        case 'dispatch':
          value = await runtime.dispatch(req.payload as never)
          break
        case 'renderedHtml':
          value = runtime.renderedHtmlResult()
          break
        case 'markdown':
          value = runtime.markdownResult()
          break
        case 'listTargets':
          value = runtime.listTargets()
          break
        case 'nodeState':
          value = runtime.nodeState(req.payload as never)
          break
        case 'load':
          value = runtime.load(req.payload as never)
          break
        case 'op':
          value = runtime.op(req.payload as never)
          break
        case 'export':
          value = runtime.export((req.payload as { format: 'legacy' | 'serialized' }).format)
          break
        case 'validate':
          value = runtime.validate((req.payload as { kind: 'legacy' | 'serialized'; export: unknown }).kind, (req.payload as { export: unknown }).export)
          break
        case 'teardown':
          value = await runtime.teardownResult()
          break
        case 'code.get':
          value = runtime.codeGet((req.payload as { path: string }).path)
          break
        case 'code.set':
          value = runtime.codeSet((req.payload as { path: string; value: unknown }).path, (req.payload as { value: unknown }).value)
          break
        case 'code.create':
          value = runtime.codeCreate((req.payload as { path: string; entry: unknown }).path, (req.payload as { entry: unknown }).entry)
          break
        case 'code.delete':
          value = runtime.codeDelete((req.payload as { path: string; index?: number }).path, (req.payload as { index?: number }).index)
          break
        case 'code.validate':
          value = runtime.codeValidate((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.load':
          value = runtime.codeLoad((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.loadBatch':
          value = runtime.codeLoadBatch((req.payload as { ops: unknown[] }).ops as never)
          break
        case 'journal':
          value = runtime.journal((req.payload as { action?: 'undo' | 'redo' | 'replay' } | null)?.action as 'undo' | 'redo' | 'replay')
          break
        default:
          throw new Error(`unknown method: ${(req as { method: string }).method}`)
      }
      return { id: req.id, ok: true, value }
    } catch (e) {
      return {
        id: req.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }
    }
  })().then((reply) => {
    // N3/N6 — after a MUTATING app-graph op succeeds, emit ONE app-graph-changed
    // push (the resource content changed). App-Runtime-only: SecurePanels never
    // calls this. Coalesced to once per tool invocation (after the reply).
    if (reply.ok && MUTATING_METHODS.has(req.method)) {
      notify({ uri: 'mcp://provident/app' })
    }
    return reply
  })
}

/** Unit U-SHELL-2 §2.4 (W1-N1) — apply the persisted/streamed operator theme at
 *  boot and re-resolve it live while the setting is `system`. The shell applies
 *  the theme by setting `document.documentElement.dataset.theme` (§2.3); the OS
 *  preference is read from `matchMedia('(prefers-color-scheme: dark)')`.
 *  Fail-soft (F2): an environment without `matchMedia` degrades to the light
 *  default and never throws. */
function installTheme(): void {
  const themeBridge = (window.provident ?? {}) as unknown as {
    operatorSettings?: {
      get(): Promise<{ theme?: unknown }>
      onChanged?(handler: (settings: { theme?: unknown }) => void): () => void
    }
  }
  let media: MediaQueryList | null = null
  try {
    if (typeof window.matchMedia === 'function') media = window.matchMedia('(prefers-color-scheme: dark)')
  } catch {
    media = null
  }
  const prefersDark = (): boolean => {
    try {
      return media ? media.matches : false
    } catch {
      return false
    }
  }
  let setting: unknown = 'system'
  const apply = (): void => {
    applyThemeToRoot(document.documentElement, setting, prefersDark())
  }
  // The OS listener is attached ONCE; its handler is inert while the setting is
  // explicit (`light`/`dark`), so an OS flip only re-applies under `system`.
  if (media) {
    try {
      media.addEventListener('change', () => {
        if (setting !== 'light' && setting !== 'dark') apply()
      })
    } catch {
      // a matchMedia without addEventListener — degrade, never throw
    }
  }
  // Live operator-settings changes (the settings pane) — re-apply from the payload.
  try {
    themeBridge.operatorSettings?.onChanged?.((payload) => {
      setting = payload?.theme
      apply()
    })
  } catch {
    // older bridge surface without onChanged — ignore
  }
  // Boot: read the persisted setting and apply. A bridge error keeps `system`.
  void themeBridge.operatorSettings
    ?.get?.()
    .then((payload) => {
      setting = payload?.theme
      apply()
    })
    .catch(() => {
      // keep the `system` default on a bridge error
    })
}

async function main(): Promise<void> {
  const mount = document.getElementById('app')
  if (!mount) throw new Error('mount #app missing')
  const bridge = window.provident
  // Unit U-SHELL-2 §2.4 (W1-N1) — apply the persisted theme + watch the OS
  // preference live (`system`) before any graph mount.
  installTheme()
  // Read the persisted operator config (maxJournalLength) so the app Runtime's
  // Supervisor is constructed with the journal-condense threshold. The config
  // is manual-UI-only (never an MCP tool); the Runtime reads it at boot.
  let maxJournalLength: number | undefined
  if (bridge?.security) {
    try {
      const cfg = await bridge.security.get()
      maxJournalLength = cfg.maxJournalLength
    } catch {
      // keep the default (never condense) on a bridge error
    }
  }
  // Unit K §5.1 — the placeholder bootstrap envelope: the default content-window
  // template envelope (a bare `wiki-root` + one `main` zone container, NO content
  // payloads) so the Runtime is constructible synchronously. The `demoEnvelope()`
  // bootstrap is REMOVED — the SidebarPanes host loads the pane-inclusive
  // envelope (derived from the RAG store + the stored template) at boot.
  const placeholderEnvelope: LegacyInitialData = {
    template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope, maxJournalLength })
  runtime.bootstrap()
  if (!bridge) {
    console.warn('[provident-renderer] no preload bridge — MCP endpoints unavailable (running as a plain page?)')
    return
  }
  // The operator-only Security + Debug panes render in their OWN isolated
  // provident graph (secure-panels.ts) — a separate GraphScope, so the MCP
  // endpoints (which read the app Runtime) can never see/dispatch them.
  //
  // W1-N6 (PG12) — wire the operator-only module-tool runner: list the live
  // main-process `CapabilityRouter`'s tools over IPC (boot snapshot — the list is
  // authored into the isolated pane graph at construction) and invoke a selected
  // tool through the main-process two-gate (`module` AND `code`). Operator scope
  // only: this runner never appears in the app graph and is never an MCP tool.
  const moduleBridge = (bridge as unknown as {
    module?: {
      listTools?(): Promise<string[]>
      invoke?(tool: string, args: unknown): Promise<unknown>
    }
  }).module
  let moduleToolNames: string[] = []
  try {
    moduleToolNames = (await moduleBridge?.listTools?.()) ?? []
  } catch {
    // keep the empty list on a bridge error → the '(no module tools)' placeholder
    moduleToolNames = []
  }
  const moduleRunner = {
    listTools: (): string[] => moduleToolNames,
    invoke: (tool: string, args: unknown): unknown => {
      // Fail-closed: an older bridge without the runner surface must not read as
      // a successful no-op — surface a real error to the operator.
      if (!moduleBridge?.invoke) throw new Error('module-tool bridge unavailable')
      return moduleBridge.invoke(tool, args)
    },
  }
  const panesMount = document.getElementById('panes')
  const panels = panesMount ? new SecurePanels(panesMount, { moduleRunner }) : null
  if (panels) {
    void panels.refresh()
    // the Debug pane's live census + SSR preview, sourced from the APP graph
    panels.refreshDebug(runtime)
  }
  bridge.onRequest((req) => {
    void handleRequest(runtime, req, (p) => bridge!.notify(p)).then((reply) => {
      panels?.refreshDebug(runtime)
      bridge.sendReply(reply)
    })
  })
  // Unit D §5.1.9/§5.1.10 — the re-traversal trigger. On `rag-store-changed`
  // (broadcast by main after ANY successful RAG-store mutation via an MCP
  // `edit.*` tool OR a UI commit-on-blur), the renderer calls `requestRebuild()`
  // on the edit controller (the dirty-edit guard queues it if a control is
  // dirty). The injected `commit` routes through the SAME edit op (`setContent`)
  // as the MCP tool (MCP/UI equivalence — §5.7).
  //
  // Finding 3 — the re-traversal is REAL (not a no-op). `onRebuild` fetches the
  // RAG store snapshot over the `rag-snapshot` IPC, re-derives the graph via
  // `buildTraversal` (Unit C), and feeds the resulting back-reference map back
  // into the controller's `backRefs` (the SOLE authoritative carrier, §5.3).
  // The controller holds the SAME Map reference, so mutating it in place is
  // visible to `isEditable`/`commit`/`restoreCaret`. The re-traversal is
  // fire-and-forget (the `onRebuild` signature is sync); a fetch/re-derive
  // failure leaves the current backRefs in place (never a crash).
  const backRefs = new Map<string, string[]>()
  // Unit K §5.1 step 4 — the edit controller's `onRebuild` IS the host's
  // `reDerive` (the pane-inclusive re-traversal). `host` is declared before the
  // controller so the closure can reference it; the closure only runs after the
  // host is constructed + booted (a store change → requestRebuild → reDerive).
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: (nodeId, content) => bridge!.edit!.commit(nodeId, content),
    onRebuild: (kind) => void host.reDerive(kind),
  })
  // Unit K §5.1 — the SidebarPanes host. The renderer constructs the host with
  // the app mount (#app), the operator mount (#operator-panes — a NEW element,
  // NOT #panes which stays SecurePanels'; M3), the pane registry, the bridge,
  // the backRefs map, and the edit controller. The host owns the current-
  // document/node state. Then calls `host.boot(runtime)` (the pane-inclusive
  // envelope replaces the demoEnvelope() bootstrap). The host's boot subscribes
  // to rag-store-changed/template-changed and routes them through the edit
  // controller's dirty-edit guard → reDerive (the SOLE subscription; the old
  // renderer-level onRagStoreChanged closure is removed to avoid double-firing).
  const operatorMount = document.getElementById('operator-panes')
  const registry = createPaneRegistry()
  const pvBridge = bridge as never as {
    gnosis: {
      status(): Promise<import('../main/engine-rag-store.js').HealthReport>
      query(query: string, opts?: Record<string, unknown>): Promise<import('../main/engine-rag-store.js').EngineRagResult>
      // Unit A2 §5.5 — the document/wiki CRUD bridge surface (the SAME
      // `handleGnosisTool` handler as the `gnosis.document.*`/`gnosis.wiki.*`
      // MCP tools — MCP/UI equivalence).
      documents(tool: string, args: Record<string, unknown>): Promise<unknown>
      wikis(tool: string, args: Record<string, unknown>): Promise<unknown>
    }
    security: { get(): Promise<import('../shared/types.js').SecuritySettings> }
  }
  // Unit GN-MCP-UI §5.5 — the D4-parity gnosis GUI panes. Registered into the
  // SHARED registry BEFORE SidebarPanes.boot so the sidebars assemble the
  // `gnosis-status` operator pane (isolated scope, MCP-invisible) + the
  // `gnosis-query` app-graph pane (fail-closed on the `gnosis` group) into the
  // app-graph/operator envelopes. The pane handlers reach the bridge via
  // `window.provident.sidebar.gnosisStatus`/`gnosisQuery` (the M2 pattern).
  const gnosisPanes = new GnosisPanes({
    registry,
    bridge: pvBridge,
    // Re-render the pane-inclusive envelopes after a status/query settles so the
    // updated gnosis data renders (the host re-assembles + re-mounts).
    onChanged: () => {
      if (host) void host.refresh()
    },
  })
  gnosisPanes.registerPanes()
  // Unit A2 §5.5 — the D4-parity gnosis document-editor/wiki GUI panes.
  // Registered into the SHARED registry BEFORE SidebarPanes.boot so the
  // sidebars assemble the `gnosis-documents` + `gnosis-wikis` app-graph panes
  // (fail-closed on the `gnosis`/`gnosis-edit` groups) into the app-graph
  // envelope. The pane handlers reach the bridge via
  // `window.provident.sidebar.gnosisDocuments`/`gnosisWikis` (the M2 pattern).
  const gnosisCrudPanes = new GnosisCrudPanes({
    registry,
    bridge: pvBridge,
    // Re-render the pane-inclusive envelopes after a document/wiki call settles
    // so the updated CRUD data renders (the host re-assembles + re-mounts).
    onChanged: () => {
      if (host) void host.refresh()
    },
  })
  gnosisCrudPanes.registerPanes()
  host = new SidebarPanes({
    mount,
    operatorMount: operatorMount as HTMLElement,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
    gnosis: {
      status: () => gnosisPanes.refreshStatus(),
      query: (value: string) => gnosisPanes.submitQuery(value),
    },
  })
  void host.boot(runtime)
  void gnosisPanes.boot()
  void gnosisCrudPanes.boot()
  bridge.ready()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void main())
  } else {
    void main()
  }
}