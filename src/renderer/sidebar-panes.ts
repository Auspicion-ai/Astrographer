// src/renderer/sidebar-panes.ts — Unit K: the `SidebarPanes` renderer host
// (docs/specs/unit-k-sidebar-panes-host.md §5.6). The host wires the app-graph
// panes (doc-nav/crosslinks/search/template-editor) + the operator `settings`
// pane into the live renderer: the boot wiring (replacing the `demoEnvelope()`
// bootstrap), the re-derive wiring (rag-store-changed + template-changed), the
// pane registration + handler binding, and the operator mount (the isolated
// `createIsolatedScope()` GraphScope settings pane).
//
// NOTE: this module must NOT import from `src/main/preload.ts` (which imports
// `electron`) — the renderer bundle is built for the browser platform. The
// bridge surface is declared structurally here (the `SidebarBridge` type).
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
  type RenderOptions,
} from 'provident-ssr'
import { createIsolatedScope, registerHandlerDef, type GraphScope } from 'provident-ssr/core/registry.js'
import type { Runtime } from './runtime.js'
import type { PaneContext, PaneRegistry } from './pane-registry.js'
import {
  assembleAppGraphEnvelope,
  buildOperatorEnvelope,
  SIDEBAR_ZONE,
  docNavContent,
  crosslinksContent,
  searchContent,
  type AppGraphAssemblyResult,
} from './pane-graph.js'
import { createTemplateEditorPane, type TemplatePaneContext } from './template-pane.js'
import type { EditController } from './edit-controller.js'
import { buildTraversal, type CrosslinkWiring } from '../main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../main/template-shape.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
} from '../shared/types.js'
import type { BacklinkResult } from '../main/backlinks.js'

/** The Unit D §5.1.9 `rag-store-changed` payload (declared structurally here —
 *  the canonical type lives in `src/main/preload.ts`, which the renderer bundle
 *  cannot import). */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

/** The preload IPC bridge surface the host consumes (structural — the canonical
 *  `ProvidentBridge` lives in `src/main/preload.ts`, which the renderer bundle
 *  cannot import). */
export interface SidebarBridge {
  security: {
    get(): Promise<SecuritySettings>
  }
  edit: {
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void
  }
  rag: {
    query(query: string, topK?: number): Promise<RagQueryResult>
    snapshot(): Promise<RagSnapshotPayload>
    backlinks(nodeId: string): Promise<BacklinkResult>
  }
  template: {
    get(): Promise<{ source: string; template: ContentWindowTemplate }>
    create(zone: string, id?: string): Promise<{ source: string; template: ContentWindowTemplate }>
    delete(zone: string): Promise<{ source: string; template: ContentWindowTemplate }>
    reset(): Promise<{ source: string; template: ContentWindowTemplate }>
    onTemplateChanged(handler: (payload: TemplateChangedPayload) => void): () => void
  }
  operatorSettings: {
    get(): Promise<OperatorSettings>
    set(patch: OperatorSettingsPatch): Promise<OperatorSettings>
  }
}

export interface SidebarPanesOptions {
  /** The app graph mount (#app) — the app Runtime renders the pane-inclusive
   *  envelope here. */
  mount: HTMLElement
  /** The operator mount (#operator-panes — NOT #panes, which is SecurePanels';
   *  M3) — the settings pane renders in its isolated GraphScope here. */
  operatorMount: HTMLElement
  /** The pane registry (the single authority over enabled panes). */
  registry: PaneRegistry
  /** The preload IPC bridge (window.provident). */
  bridge: SidebarBridge
  /** The back-reference map (the edit controller's map — the SOLE authoritative
   *  carrier). The host clears + repopulates it after each buildTraversal. */
  backRefs: Map<string, string[]>
  /** The edit controller (the dirty-edit guard + the re-traversal trigger). The
   *  host's reDerive is the controller's onRebuild callback. */
  editController: EditController
  /** The traversal zone name (default 'main'). */
  zoneName?: string
  /** The sidebar zone name (default SIDEBAR_ZONE). */
  sidebarZone?: string
}

// ---- handler bodies (function-STRING data). They reach the IPC bridge via
// `window.provident.sidebar` — NEVER an MCP tool. The host installs the
// `window.provident.sidebar` surface at boot (M2).
const DOC_NAV_SELECT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (id) s.selectDocument(id);
}`
const SEARCH_SUBMIT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var input = ctx && ctx.node && ctx.node.props && ctx.node.props['value'];
  var value = input != null ? String(input) : '';
  s.submitQuery(value);
}`
const TEMPLATE_ZONE_ADD_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var input = ctx && ctx.node && ctx.node.props && ctx.node.props['value'];
  var zone = input != null ? String(input) : '';
  if (zone) s.templateAdd(zone);
}`
const TEMPLATE_ZONE_REMOVE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var zone = ctx && ctx.node && ctx.node.props && ctx.node.props['data-template-zone'];
  if (zone) s.templateRemove(zone);
}`
const TEMPLATE_RESET_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  s.templateReset();
}`
// Unit L — the textarea handler defs (docs/specs/unit-l-textarea-editing-ui.md
// §5.2). They reach the edit controller via `window.provident.sidebar` — NEVER
// an MCP tool. The blur body reads the DOM textarea's CURRENT `.value` (M4 —
// the engine's node `props.value` is the initial value; the typed value lives
// in the DOM).
const TEXTAREA_INPUT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.textareaInput(ragId);
}`
const TEXTAREA_BLUR_BODY = `function (ctx, value) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (!ragId) return;
  // H6 — prefer a dispatch-provided value arg (MCP path) when present; fall
  // back to the DOM textarea's current value (UI path, M4).
  if (value === undefined) {
    var el = document.getElementById('textarea-' + ragId);
    value = el ? el.value : '';
  }
  s.textareaBlur(ragId, value);
}`

/** Collect a translated node's subtree node ids (root-first, tree order),
 *  STOPPING at each doc-child subtree root (a child carrying the stable
 *  authored `rag-<id>` id — the same rule `buildTraversal` uses). */
function collectSubtreeIds(
  node: { id: string; children: unknown[]; base?: { props?: { id?: unknown } } },
  out: string[],
): void {
  out.push(node.id)
  for (const c of node.children) {
    const pid = (c as { base?: { props?: { id?: unknown } } }).base?.props?.id
    if (typeof pid === 'string' && pid.startsWith('rag-')) continue
    collectSubtreeIds(c as { id: string; children: unknown[]; base?: { props?: { id?: unknown } } }, out)
  }
}

export class SidebarPanes {
  private readonly mount: HTMLElement
  private readonly operatorMount: HTMLElement
  private readonly registry: PaneRegistry
  private readonly bridge: SidebarBridge
  private readonly backRefs: Map<string, string[]>
  private readonly editController: EditController
  private readonly zoneName: string
  private readonly sidebarZone: string

  /** Host-owned mutable state (M5). */
  private _currentDocumentId: string | null = null
  private _currentNodeId: string | null = null

  /** The host's pane-data cache (M7/M9). */
  private lastSnapshot: RagSnapshotPayload | null = null
  private lastCrosslinks: CrosslinkWiring[] = []
  private lastBacklinks: BacklinkResult | null = null
  private lastQueryResult: RagQueryResult | null = null
  private lastOperatorSettings: OperatorSettings | null = null

  /** The cached security settings (fetched at boot) — the M13 handler gate reads
   *  this SYNCHRONOUSLY so a dispatchable pane handler cannot bypass the
   *  `rag`/`code` default-off gates (fail-closed when the group is off). */
  private security: SecuritySettings | null = null

  /** The stored content-window template (updated on boot + template-changed). */
  private template: ContentWindowTemplate = DEFAULT_CONTENT_WINDOW_TEMPLATE
  /** The host-pinned targeted zones (M8). */
  private readonly targetedZones: string[] = ['main']

  /** The app Runtime the host loads the pane-inclusive envelope into. */
  private runtime: Runtime | null = null
  /** The last traversal envelope passed to loadAppGraph (used by refresh +
   *  submitQuery to re-assemble + re-load without a RAG re-traversal). */
  private lastTraversalEnvelope: LegacyInitialData | null = null

  /** The operator isolated-scope graph (M3/M17). */
  private operatorScope: GraphScope | null = null
  private operatorSupervisor: Supervisor | null = null
  private operatorAdapter: DomAdapter | null = null
  private operatorRoot: unknown = null
  private operatorNodes: unknown[] = []
  private operatorPrevMap: Map<string, unknown> | null = null

  /** The re-derive in-flight coalescing (M11/S19). */
  private reDeriveInFlight = false
  private reDeriveQueued = false

  /** Unit L — the set of RAG node ids with a saved caret (the caret restore
   *  after a re-derive, §5.4). On `saveCaret` (in `textareaBlur`) the node id is
   *  added; on restore/clear it is removed. */
  private caretNodes = new Set<string>()

  /** The subscription cleanup handles. */
  private unsubRag: (() => void) | null = null
  private unsubTemplate: (() => void) | null = null

  constructor(opts: SidebarPanesOptions) {
    this.mount = opts.mount
    this.operatorMount = opts.operatorMount
    this.registry = opts.registry
    this.bridge = opts.bridge
    this.backRefs = opts.backRefs
    this.editController = opts.editController
    this.zoneName = opts.zoneName ?? 'main'
    this.sidebarZone = opts.sidebarZone ?? SIDEBAR_ZONE
  }

  /** Host-owned mutable state (M5): the host owns the current-document/node
   *  state and exposes these setters the handler bodies reach via the
   *  `window.provident.sidebar` bridge (M2). The host determines which document
   *  is loaded + displayed. */
  setCurrentDocumentId(id: string | null): void {
    this._currentDocumentId = id
  }

  setCurrentNodeId(id: string | null): void {
    this._currentNodeId = id
  }

  /** Register the concrete panes (doc-nav/crosslinks/search/template-editor
   *  app-graph + settings operator) + enable the app-graph panes + the settings
   *  pane. */
  registerPanes(): void {
    this.registry.register({
      id: 'doc-nav',
      title: 'Documents',
      scope: 'app-graph',
      render: (ctx: PaneContext) => docNavContent(ctx),
    })
    this.registry.register({
      id: 'crosslinks',
      title: 'Links',
      scope: 'app-graph',
      render: (ctx: PaneContext) => crosslinksContent(ctx, this.lastBacklinks),
    })
    this.registry.register({
      id: 'search',
      title: 'Search',
      scope: 'app-graph',
      render: (ctx: PaneContext) => searchContent(ctx, this.lastQueryResult),
    })
    this.registry.register({
      id: 'template-editor',
      title: 'Template',
      scope: 'app-graph',
      render: () => createTemplateEditorPane().render(this.buildTemplateContext()),
    })
    this.registry.register({
      id: 'settings',
      title: 'Settings',
      scope: 'operator',
      render: () => this.settingsContent(),
    })
    for (const id of ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings']) {
      this.registry.enable(id)
    }
  }

  /** Bind the pane handlers to the IPC bridge (register the handler defs). */
  bindHandlers(): void {
    registerHandlerDef('pane-doc-nav-select', { name: 'pane-doc-nav-select', body: DOC_NAV_SELECT_BODY })
    registerHandlerDef('pane-search-submit', { name: 'pane-search-submit', body: SEARCH_SUBMIT_BODY })
    registerHandlerDef('template-zone-add', { name: 'template-zone-add', body: TEMPLATE_ZONE_ADD_BODY })
    registerHandlerDef('template-zone-remove', { name: 'template-zone-remove', body: TEMPLATE_ZONE_REMOVE_BODY })
    registerHandlerDef('template-reset', { name: 'template-reset', body: TEMPLATE_RESET_BODY })
    // Unit L — the textarea handler defs (§5.2). Registered in the app-graph
    // scope so `provident.dispatch` can drive them (MCP/UI equivalence — the
    // textarea is MCP-visible, §5.6).
    registerHandlerDef('rag-textarea-input', { name: 'rag-textarea-input', body: TEXTAREA_INPUT_BODY })
    registerHandlerDef('rag-textarea-blur', { name: 'rag-textarea-blur', body: TEXTAREA_BLUR_BODY })
  }

  /** Build the base PaneContext from the current host-owned state + backRefs +
   *  the traversal crosslinks + the last-fetched pane data. */
  buildContext(): PaneContext {
    return {
      snapshot: this.lastSnapshot,
      currentDocumentId: this._currentDocumentId,
      currentNodeId: this._currentNodeId,
      backRefs: this.backRefs,
      crosslinks: this.lastCrosslinks,
    }
  }

  /** Build the TemplatePaneContext (PaneContext + template + targetedZones). */
  buildTemplateContext(): TemplatePaneContext {
    return {
      ...this.buildContext(),
      template: this.template,
      targetedZones: this.targetedZones,
    }
  }

  /** Assemble the pane-inclusive app-graph envelope from a traversal envelope
   *  + the enabled app-graph panes, recompute the backRefs from the ASSEMBLED
   *  envelope (M14), and LOAD it into the app Runtime. Returns the assembly
   *  result. */
  loadAppGraph(runtime: Runtime, traversalEnvelope: LegacyInitialData): AppGraphAssemblyResult {
    // §5.9.4 — a null runtime/traversalEnvelope → the assemble guard error (the
    // host surfaces the SAME message the pure assembler throws).
    if (runtime == null || traversalEnvelope == null) {
      throw new Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')
    }
    const result = assembleAppGraphEnvelope({
      traversalEnvelope,
      registry: this.registry,
      ctx: this.buildTemplateContext(),
      sidebarZone: this.sidebarZone,
    })
    // Unit L §5.3 — the `readOnly` prop is HOST-SET at render time from
    // `editController.isEditable(ragId)` (the traversal is pure and cannot see
    // the edit controller). It runs BEFORE recomputeBackRefs so it reflects the
    // PRE-EXISTING backRefs (a dangling back-reference is absent from the
    // pre-existing map; the recomputed map would re-add every materialized node,
    // making every textarea editable). The authoritative deleted-node check
    // lives in `commit` (Unit D §5.4 M9).
    this.setTextareaReadOnly(result.envelope)
    // M14 — recompute the backRefs from the ASSEMBLED envelope (the node ids the
    // loaded graph actually mints), AFTER assembly and BEFORE load.
    const assembledBackRefs = this.recomputeBackRefs(result.envelope)
    this.backRefs.clear()
    for (const [k, v] of assembledBackRefs) this.backRefs.set(k, v)
    this.lastTraversalEnvelope = traversalEnvelope
    runtime.loadEnvelope(result.envelope)
    return result
  }

  /** Mount the operator settings pane in its OWN isolated GraphScope (the
   *  SecurePanels pattern) from the enabled operator panes. */
  mountOperator(): void {
    const envelope = buildOperatorEnvelope(this.registry, this.buildTemplateContext())
    this.operatorScope = createIsolatedScope()
    const hub = createLinkHub()
    const t = translateLegacy(envelope, { hub, graphScope: this.operatorScope })
    this.operatorSupervisor = new Supervisor({ events: new EventBridge(), graphScope: this.operatorScope })
    for (const n of t.nodes) this.operatorSupervisor.registerNode(n)
    this.operatorAdapter = new DomAdapter(this.operatorMount, { onEvent: this.handleOperatorEvent })
    this.operatorRoot = t.root
    this.operatorNodes = t.nodes
    this.operatorPrevMap = null
    this.renderOperator()
  }

  /** Re-fetch the pane data (snapshot/backlinks/query/operator-settings) over
   *  the bridge and re-render. Re-renders the EXISTING app graph + the EXISTING
   *  operator graph (M17) — it NEVER rebuilds the operator envelope or re-runs a
   *  RAG re-traversal. Async. */
  async refresh(): Promise<void> {
    const nodeId = this._currentNodeId
    if (nodeId) {
      try {
        this.lastBacklinks = await this.bridge.rag.backlinks(nodeId)
      } catch {
        // keep the last-known backlinks on a bridge error (never a crash)
      }
    }
    try {
      this.lastOperatorSettings = await this.bridge.operatorSettings.get()
    } catch {
      // keep the last-known operator settings on a bridge error
    }
    // M17 — re-render the EXISTING app graph (re-assemble + re-load the stored
    // traversal envelope — NOT a RAG re-traversal) + the EXISTING operator graph.
    if (this.runtime && this.lastTraversalEnvelope) {
      this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)
    }
    this.renderOperator()
  }

  /** The full boot wiring: register + enable the panes, bind the handlers,
   *  fetch the snapshot + template, buildTraversal → assemble → load the
   *  pane-inclusive envelope, mount the operator pane, subscribe to
   *  rag-store-changed + template-changed. Async. */
  async boot(runtime: Runtime): Promise<void> {
    if (runtime == null) throw new Error('SidebarPanes.boot: runtime required')
    this.runtime = runtime
    this.registerPanes()
    this.bindHandlers()
    this.installSidebarBridge()
    // Fetch the RAG snapshot (a bridge error ABORTS the boot — caught + logged).
    let snapshot: RagSnapshotPayload
    try {
      snapshot = await this.bridge.rag.snapshot()
    } catch (e) {
      console.error('[sidebar-panes] snapshot fetch failed', e)
      return
    }
    this.lastSnapshot = snapshot
    // Fetch the stored template (a bridge error ABORTS the boot).
    let template: ContentWindowTemplate
    try {
      const t = await this.bridge.template.get()
      template = t.template
    } catch (e) {
      console.error('[sidebar-panes] template fetch failed', e)
      return
    }
    this.template = template
    // Cache the security settings (the M13 handler gate reads this
    // synchronously). A bridge error leaves the gate fail-closed (null → no
    // group is enabled → every gated handler fails closed).
    try {
      this.security = await this.bridge.security.get()
    } catch {
      this.security = null
    }
    // Derive the document ids from the doc-head edges' targets.
    const documentIds = this.deriveDocumentIds(snapshot)
    const traversalEnvelope = this.buildTraversalEnvelope(snapshot, documentIds)
    this.loadAppGraph(runtime, traversalEnvelope)
    this.mountOperator()
    // Subscribe to the re-derive triggers.
    this.unsubRag = this.bridge.edit.onRagStoreChanged((p) => this.onRagStoreChanged(p))
    this.unsubTemplate = this.bridge.template.onTemplateChanged((p) => this.onTemplateChanged(p))
  }

  /** The re-derive wiring: fetch the snapshot, buildTraversal (with the stored
   *  template), assemble the pane-inclusive envelope, re-load it into the app
   *  Runtime, repopulate the backRefs map. Async. */
  async reDerive(): Promise<void> {
    if (this.reDeriveInFlight) {
      this.reDeriveQueued = true
      return
    }
    this.reDeriveInFlight = true
    try {
      let snapshot: RagSnapshotPayload
      try {
        snapshot = await this.bridge.rag.snapshot()
      } catch (e) {
        console.error('[sidebar-panes] re-derive snapshot fetch failed', e)
        return
      }
      this.lastSnapshot = snapshot
      // F2 — refresh the M13 security cache on each re-derive so a runtime
      // security tightening (a group turned OFF after boot) is honored by the
      // handler gates. A bridge error leaves the gate fail-closed (null).
      try {
        this.security = await this.bridge.security.get()
      } catch {
        this.security = null
      }
      // M6 — the current-document state is the documentIds source.
      const current = this._currentDocumentId
      const documentIds = current ? [current] : this.deriveDocumentIds(snapshot)
      const traversalEnvelope = this.buildTraversalEnvelope(snapshot, documentIds)
      if (this.runtime) {
        this.loadAppGraph(this.runtime, traversalEnvelope)
      }
      // Unit L §5.4 — after a re-derive re-loads the pane-inclusive envelope,
      // restore the saved caret for each node with a saved caret. A dangling
      // back-reference clears the stale caret (restoreCaret returns undefined —
      // Unit D §5.3 L5); the host does NOT re-apply a stale caret (A4).
      for (const ragId of [...this.caretNodes]) {
        const caret = this.editController.restoreCaret(ragId)
        if (caret === undefined) {
          this.caretNodes.delete(ragId)
        } else {
          // One-shot restore (adversarial H2): remove the node after a
          // SUCCESSFUL restore too, so only the re-derive immediately following
          // the edit re-focuses — not every subsequent re-derive.
          this.caretNodes.delete(ragId)
          const el = document.getElementById('textarea-' + ragId) as HTMLTextAreaElement | null
          if (el) {
            el.selectionStart = caret.offset
            el.selectionEnd = caret.offset
            // Guard the focus call — the dom-shim element (test env) has no
            // `focus`; the real DOM does.
            if (caret.focused && typeof el.focus === 'function') el.focus()
          }
        }
      }
      await this.refresh()
    } finally {
      this.reDeriveInFlight = false
      if (this.reDeriveQueued) {
        this.reDeriveQueued = false
        await this.reDerive()
      }
    }
  }

  /** The rag-store-changed handler: routes through the edit controller's
   *  dirty-edit guard (requestRebuild). */
  onRagStoreChanged(_payload: RagStoreChangedPayload): void {
    this.editController.requestRebuild()
  }

  /** The template-changed handler: updates the stored template + routes through
   *  the edit controller's dirty-edit guard (requestRebuild). */
  onTemplateChanged(payload: TemplateChangedPayload): void {
    this.template = payload.template
    this.editController.requestRebuild()
  }

  // ---- private helpers ----------------------------------------------------

  /** The operator settings pane content (M9 — the render reads
   *  `this.lastOperatorSettings`, NOT ctx). */
  private settingsContent(): LegacyNodeData {
    const s = this.lastOperatorSettings
    return {
      type: 'section',
      children: [
        { type: 'h2', content: 'Settings' },
        { type: 'div', props: { id: 'operator-enabled-panes' }, content: (s?.enabledPanes ?? []).join(', ') },
        { type: 'div', props: { id: 'operator-default-document' }, content: s?.defaultDocumentId ?? '(all)' },
        { type: 'div', props: { id: 'operator-topk' }, content: `topK: ${s?.topK ?? 5}` },
      ],
    }
  }

  /** Derive the document ids from the snapshot's `doc-head` edges' targets
   *  (the document roots), deduped, in store order. */
  private deriveDocumentIds(snapshot: RagSnapshotPayload): string[] {
    // F11 — guard against a malformed snapshot (a trusted-but-unvalidated bridge).
    const edges = snapshot?.edges ?? []
    return [...new Set(edges.filter((e) => e.kind === 'doc-head').map((e) => e.target))]
  }

  /** The empty-store envelope (M1) — the placeholder/default content-window
   *  template envelope (a bare `wiki-root` + one `main` zone container, NO
   *  content payloads). */
  private emptyStoreEnvelope(): LegacyInitialData {
    return {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
  }

  /** Build the traversal envelope from the snapshot + document ids. When
   *  `documentIds` is empty, buildTraversal is SKIPPED (M1) and the empty-store
   *  envelope is used. Repopulates the backRefs map (provisional — loadAppGraph
   *  recomputes it from the ASSEMBLED envelope, M14). */
  private buildTraversalEnvelope(snapshot: RagSnapshotPayload, documentIds: string[]): LegacyInitialData {
    if (documentIds.length === 0) {
      this.backRefs.clear()
      this.lastCrosslinks = []
      return this.emptyStoreEnvelope()
    }
    const store = { listNodes: () => snapshot.nodes, listEdges: () => snapshot.edges } as never
    const result = buildTraversal({
      store,
      documentIds,
      zoneName: this.zoneName,
      template: this.template,
    })
    this.lastCrosslinks = result.crosslinks
    this.backRefs.clear()
    for (const [k, v] of result.backRefs) this.backRefs.set(k, v)
    return result.envelope
  }

  /** Recompute the backRefs map from an envelope's translate (M14) — the node
   *  ids the loaded graph actually mints. Mirrors `buildTraversal`'s backRefs
   *  computation (traversal.ts:370-386). */
  private recomputeBackRefs(envelope: LegacyInitialData): Map<string, string[]> {
    const backRefs = new Map<string, string[]>()
    const translated = translateLegacy(envelope)
    const rootsByRagId = new Map<string, Array<{ id: string; children: unknown[]; base?: { props?: { id?: unknown } } }>>()
    for (const n of translated.nodes) {
      const pid = (n as { base?: { props?: { id?: unknown } } }).base?.props?.id
      if (typeof pid === 'string' && pid.startsWith('rag-')) {
        const ragId = pid.slice(4)
        const arr = rootsByRagId.get(ragId) ?? []
        arr.push(n as never)
        rootsByRagId.set(ragId, arr)
      }
    }
    for (const [ragId, roots] of rootsByRagId) {
      const ids: string[] = []
      for (const root of roots) collectSubtreeIds(root, ids)
      backRefs.set(ragId, ids)
    }
    return backRefs
  }

  /** Unit L §5.3 — walk the assembled envelope's content payloads and set the
   *  textarea `readOnly` prop to the CORRECT value on every pass: `true` when
   *  the `data-rag-node-id` is NOT editable (`!editController.isEditable(ragId)`
   *  — a dangling back-reference), and OMITTED (editable by default) otherwise.
   *  The traversal emits no `readOnly` prop (adversarial H1 — emitting
   *  `readOnly: false` would render as the `readonly` boolean attribute and make
   *  the textarea uneditable); the host sets it at render time. Setting the
   *  correct value on every pass (not just flipping to `true`) keeps the
   *  mutation idempotent across re-assembles (adversarial H4). */
  private setTextareaReadOnly(envelope: LegacyInitialData): void {
    const walk = (n: LegacyNodeData): void => {
      if (n.type === 'textarea') {
        const ragId = n.props?.['data-rag-node-id']
        if (typeof ragId === 'string') {
          const props = { ...(n.props ?? {}) }
          if (this.editController.isEditable(ragId)) {
            delete props.readOnly
          } else {
            props.readOnly = true
          }
          n.props = props
        }
      }
      for (const c of n.children ?? []) walk(c as LegacyNodeData)
    }
    for (const p of envelope.content ?? []) walk(p.content[0])
  }

  /** Install the `window.provident.sidebar` bridge surface (M2) the compiled
   *  handler bodies call. Unit L §5.2 — extended with the textarea bridge
   *  methods (`textareaInput`/`textareaBlur`) the textarea handlers reach.
   *
   *  contextIsolation fix — the REAL Electron renderer FREEZES the
   *  contextBridge-exposed `window.provident`, so attaching `sidebar` to it here
   *  throws ("Cannot add property sidebar, object is not extensible") and aborts
   *  boot (the test dom-shim leaves `window.provident` a plain object, so tests
   *  never hit it). The preload OWNS `sidebar` + exposes `installSidebar(methods)`;
   *  when present, the host REGISTERS its methods through it (delegated back by
   *  the preload). Fall back to a direct attach only for the non-contextBridge
   *  test/dom-shim environment. */
  private installSidebarBridge(): void {
    const methods = {
      selectDocument: (id: string) => this.selectDocument(id),
      submitQuery: (value: string) => void this.submitQuery(value),
      templateAdd: (zone: string) => void this.templateAdd(zone),
      templateRemove: (zone: string) => void this.templateRemove(zone),
      templateReset: () => void this.templateReset(),
      operatorSet: (patch: OperatorSettingsPatch) => void this.operatorSet(patch),
      textareaInput: (ragId: string) => this.textareaInput(ragId),
      textareaBlur: (ragId: string, value: string) => void this.textareaBlur(ragId, value),
    }
    const provident = (globalThis as { window?: { provident?: Record<string, unknown> } }).window?.provident
    const install = provident && (provident as { installSidebar?: (m: typeof methods) => void }).installSidebar
    if (typeof install === 'function') {
      install(methods)
      return
    }
    // Non-contextBridge fallback (test dom-shim): attach `sidebar` directly.
    const w = globalThis as unknown as { window?: { provident?: Record<string, unknown> } }
    if (!w.window) w.window = {} as never
    if (!w.window.provident) w.window.provident = {}
    ;(w.window.provident as Record<string, unknown>).sidebar = methods
  }

  /** `pane-doc-nav-select` — set the current document + trigger a document-switch
   *  re-traversal (the single-document view, M5/M6). */
  private selectDocument(id: string): void {
    // F8 — only accept a real doc-head target as the single-document view (M6);
    // a crafted/bogus id is ignored (no re-derive with a phantom documentIds).
    if (!this.lastSnapshot || !this.lastSnapshot.edges.some((e) => e.kind === 'doc-head' && e.target === id)) return
    this.setCurrentDocumentId(id)
    this.editController.requestRebuild()
  }

  /** `pane-search-submit` — gate (M13) → `bridge.rag.query` → store the result →
   *  re-render the search pane (M10). An empty query does nothing. SYNCHRONOUS
   *  (the gate reads the cached security; the IPC is fired, the result handled
   *  on resolution) so a dispatchable handler cannot bypass the gate. */
  private submitQuery(value: string): void {
    if (!value) return
    if (!this.security?.enabled.includes('rag')) return // fail-closed (M13)
    // F4 — the operator-settings topK feeds the search query (spec §5.4 M9).
    void this.bridge.rag.query(value, this.lastOperatorSettings?.topK ?? 5).then((result) => {
      this.lastQueryResult = result
      // F7 — route the search re-render through the dirty-edit guard: skip the
      // re-load while a control is dirty so an in-progress edit is not clobbered.
      if (this.editController.anyDirty()) return
      if (this.runtime && this.lastTraversalEnvelope) {
        this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)
      }
    })
  }

  /** `template-zone-add` — gate (M13) → markDirty (M16) → `bridge.template.create`
   *  → on success clearDirty. SYNCHRONOUS (see submitQuery). The gate runs BEFORE
   *  markDirty so a gated-off handler never leaves a permanent dirty flag (F3). */
  private templateAdd(zone: string): void {
    if (!this.security?.enabled.includes('code')) return // fail-closed (M13)
    this.editController.markDirty('template-editor')
    void this.bridge.template.create(zone).then(() => {
      this.editController.clearDirty('template-editor')
    })
  }

  /** `template-zone-remove` — gate (M13) → markDirty (M16) →
   *  `bridge.template.delete` → on success clearDirty. SYNCHRONOUS. */
  private templateRemove(zone: string): void {
    if (!this.security?.enabled.includes('code')) return // fail-closed (M13)
    this.editController.markDirty('template-editor')
    void this.bridge.template.delete(zone).then(() => {
      this.editController.clearDirty('template-editor')
    })
  }

  /** `template-reset` — gate (M13) → markDirty (M16) → `bridge.template.reset`
   *  → on success clearDirty. SYNCHRONOUS. */
  private templateReset(): void {
    if (!this.security?.enabled.includes('code')) return // fail-closed (M13)
    this.editController.markDirty('template-editor')
    void this.bridge.template.reset().then(() => {
      this.editController.clearDirty('template-editor')
    })
  }

  /** `operatorSet` — `bridge.operatorSettings.set` → update lastOperatorSettings
   *  → re-mount the operator scope (M9/M17). SYNCHRONOUS (the IPC is fired; the
   *  re-mount happens on resolution). */
  private operatorSet(patch: OperatorSettingsPatch): void {
    void this.bridge.operatorSettings.set(patch).then((settings) => {
      this.lastOperatorSettings = settings
      this.mountOperator()
    })
  }

  /** Unit L §5.2 — `rag-textarea-input`: mark the RAG node's control dirty. A
   *  re-derive while dirty is QUEUED (the dirty-edit guard, Unit D §5.2). */
  private textareaInput(ragId: string): void {
    this.editController.markDirty(ragId)
  }

  /** Unit L §5.2/§5.4 — `rag-textarea-blur`: save the caret (M5 — the offset
   *  captured from the DOM textarea's `selectionStart`), then commit if dirty.
   *  The commit routes through the SAME `edit-commit` IPC → `setContent` op as
   *  the MCP `edit.set_content` tool (MCP/UI equivalence, §5.6). A non-dirty
   *  textarea is a no-op blur (no commit, no IPC). */
  private textareaBlur(ragId: string, value: string): void {
    const el = document.getElementById('textarea-' + ragId) as HTMLTextAreaElement | null
    const offset = el && typeof el.selectionStart === 'number' ? el.selectionStart : 0
    // H3 — a non-dirty (no-op) blur saves the caret OFFSET but not focus, so a
    // re-derive restores the offset without stealing focus from the control the
    // user is now interacting with. Only a real edit (dirty) re-focuses.
    const dirty = this.editController.isDirty(ragId)
    this.editController.saveCaret(ragId, { offset, focused: dirty })
    this.caretNodes.add(ragId)
    if (dirty) {
      void this.editController.commit(ragId, value).then((result) => {
        // commit clears the dirty flag on success (Unit D §5.2 L6), which may
        // trigger a queued rebuild. On a `deleted-node` result the controller
        // ALSO clears the dirty flag (H5 — the node is gone, the edit is
        // unrecoverable, and the guard must not permanently block re-derives).
        // On `store-error` the dirty flag stays (the edit is not lost).
      })
    }
  }

  /** Wire a real DOM interaction on an operator control to the operator graph's
   *  synthetic dispatch (mirrors SecurePanels). */
  private handleOperatorEvent = (wire: string, domEvent: Event): void => {
    const node = this.operatorSupervisor?.getNode(wire)
    if (!node) return
    // F10 — a null/undefined DOM event is a no-op, not a malformed '' dispatch.
    if (!domEvent || !domEvent.type) return
    const eventName = domEvent.type
    const extra = domEvent.target && 'value' in domEvent.target
      ? [String((domEvent.target as HTMLInputElement).value)]
      : []
    this.operatorSupervisor?.dispatchEvent(node.id, eventName, ...extra)
    void this.operatorSupervisor?.flush().then(() => {
      this.renderOperator()
    })
  }

  /** Compile the operator graph root + re-render into the operator mount. */
  private renderOperator(): void {
    if (!this.operatorRoot || !this.operatorSupervisor || !this.operatorAdapter || !this.operatorScope) return
    const cr = (this.operatorRoot as { compile(nodes: unknown[]): { actionable: unknown[] } }).compile(this.operatorNodes as never)
    this.operatorSupervisor.recordResolved(cr.actionable as never)
    const byNode = new Map(this.operatorSupervisor.allNodes().map((n) => [n.id, n]))
    const renderOptions: RenderOptions = { nodeIdAttribute: true, graphScope: this.operatorScope }
    this.operatorAdapter.beginBatch()
    const dom = renderProducingProcess(cr.actionable as never, byNode as never, this.operatorAdapter, this.operatorPrevMap as never, renderOptions)
    this.operatorAdapter.endBatch()
    this.operatorPrevMap = dom.prevMap as unknown as Map<string, unknown>
  }
}
