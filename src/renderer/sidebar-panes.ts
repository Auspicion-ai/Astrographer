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
import type { EditController, CaretState, RichCaretEdge } from './edit-controller.js'
import { buildTraversal, type CrosslinkWiring } from '../main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../main/template-shape.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../shared/types.js'
import type { BacklinkResult } from '../main/backlinks.js'
import type { RagNodeType } from '../main/rag-store.js'
import { isRichEditableRoot } from './rich-eligibility.js'
import { decomposeRichHtml } from '../main/rich-decompose.js'

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
    /** Unit U5 §1.4 — the atomic rich-text write-back the contenteditable blur
     *  commits through. */
    commitRich(
      nodeId: string,
      content: string,
      children: import('../main/rag-store.js').RagNodeChild[],
    ): Promise<import('../shared/types.js').RichCommitResult>
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
    onChanged(handler: (settings: OperatorSettings) => void): () => void
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

// Unit U1 §1.4 — the editingMode button-toggle click handler. Reads the TOGGLED
// mode from the button node's `data-mode` prop (a `<button>` target's `value` is
// the empty string via handleOperatorEvent, so the dispatched click arg is
// unusable), validates it against the two-member union, and routes it through
// the shared operator-change → `sidebar.operatorSet({ editingMode })` bridge
// path. Mirrors DOC_NAV_SELECT_BODY.
//
// Two representations of the SAME handler:
//   - `OPERATOR_EDITING_MODE_TOGGLE_BODY` — the INNER STATEMENTS. This is what the
//     harness registers via `registerHandlerDef` and reads back with
//     `handlerDef(...).body`, executing it as `new Function('ctx', body)`.
//   - `OPERATOR_EDITING_MODE_TOGGLE_HANDLER` — the FULL function-expression string
//     the operator isolated scope's INLINE handler needs (the engine
//     instantiates inline handler bodies via `return (${src})`).
const OPERATOR_EDITING_MODE_TOGGLE_BODY = `var s = window && window.provident && window.provident.sidebar;
if (!s) return;
var mode = ctx && ctx.node && ctx.node.props && ctx.node.props['data-mode'];
if (mode === 'textarea' || mode === 'contenteditable') s.operatorSet({ editingMode: mode });`
const OPERATOR_EDITING_MODE_TOGGLE_HANDLER = `function (ctx) {
${OPERATOR_EDITING_MODE_TOGGLE_BODY}
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

// Unit U4 §1.3 — the contenteditable rich-text handler defs (decision G). They
// reach the host via `window.provident.sidebar` — NEVER an MCP tool (the Unit K
// M2 pattern). The blur body prefers a dispatch-provided `html` arg (MCP path,
// decision G) and falls back to the DOM contenteditable root's `innerHTML`
// (`document.getElementById('rag-' + ragId)`, UI path).
const RAG_EDITOR_INPUT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorInput(ragId);
}`
const RAG_EDITOR_BLUR_BODY = `function (ctx, html) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (!ragId) return;
  // G — prefer a dispatch-provided html arg (MCP path); else read the DOM
  // contenteditable root's innerHTML (UI path).
  if (html === undefined) {
    var el = document.getElementById('rag-' + ragId);
    html = el ? el.innerHTML : '';
  }
  s.editorBlur(ragId, html);
}`
const RAG_EDITOR_COMPOSITIONSTART_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorCompositionStart(ragId);
}`
const RAG_EDITOR_COMPOSITIONEND_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var ragId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-rag-node-id'];
  if (ragId) s.editorCompositionEnd(ragId);
}`

// Unit U4 §1.3 — the 4 name-referenced rich handler defs attached to every
// RICH-ELIGIBLE root by the U3 `applyEditingMode` splice (contenteditable mode).
// minor #5 (adversarial) — APPEND-IF-ABSENT: no authored template or traversal
// ever places a handler on a rich root (verified — the traversal authors
// handlers ONLY on the textarea child, traversal.ts; the content-window template
// authors zone containers only, no rag-root handlers), but the splice merges
// these in NAME-DEDUPLICATED rather than replacing `n.handlers`, so a future or
// extended authored handler on the root is never clobbered.
const RAG_EDITOR_HANDLER_DEFS = [
  { name: 'rag-editor-input', event: 'input' },
  { name: 'rag-editor-blur', event: 'blur' },
  { name: 'rag-editor-compositionstart', event: 'compositionstart' },
  { name: 'rag-editor-compositionend', event: 'compositionend' },
] as const

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

  /** Unit U4 §1.4 (decision H) — the IME composition guard fields. `composingRagId`
   *  is the RAG node id currently IME-composing; `pendingCommitRagId` is a blur
   *  deferred mid-composition, keyed by ragId; `committingRagIds` is the per-ragId
   *  commit-in-flight latch (ADR-1 no-double-commit race). */
  private composingRagId: string | null = null
  private pendingCommitRagId: string | null = null
  private committingRagIds: Set<string> = new Set()

  /** Unit U3 §1.3 — the rich-text editing mode (the U1 wiring point). The safe
   *  default is `'textarea'` (decision D). Unit U1 later wires this field to the
   *  operator-settings value + the re-derive broadcast; the U3 integration test
   *  INJECTS the mode by setting this field before calling `loadAppGraph`. */
  private editingMode: EditingMode = 'textarea'

  /** The subscription cleanup handles. */
  private unsubRag: (() => void) | null = null
  private unsubTemplate: (() => void) | null = null
  private unsubSettings: (() => void) | null = null

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
    // Unit U4 §1.3 — the 4 contenteditable rich-text handler defs (decision G).
    // Registered in the app-graph scope so `provident.dispatch` can drive them
    // (MCP/UI equivalence — the contenteditable is MCP-visible, §3). FULL
    // function-expression bodies (the compileHandlerBody-compatible form, the
    // U1 F3 convention).
    registerHandlerDef('rag-editor-input', { name: 'rag-editor-input', body: RAG_EDITOR_INPUT_BODY })
    registerHandlerDef('rag-editor-blur', { name: 'rag-editor-blur', body: RAG_EDITOR_BLUR_BODY })
    registerHandlerDef('rag-editor-compositionstart', { name: 'rag-editor-compositionstart', body: RAG_EDITOR_COMPOSITIONSTART_BODY })
    registerHandlerDef('rag-editor-compositionend', { name: 'rag-editor-compositionend', body: RAG_EDITOR_COMPOSITIONEND_BODY })
    // Unit U1 §1.4 — the editingMode button-toggle click handler. Additive +
    // harmless in the app graph (the operator scope uses the INLINE body; the
    // app graph never references this handler name). F3 (adversarial): register
    // the FULL function-expression form (`OPERATOR_EDITING_MODE_TOGGLE_HANDLER`)
    // so the registered body is `compileHandlerBody`-compatible (the app Runtime
    // resolves `registerHandlerDef` bodies via
    // `compileHandlerBody(src) = new Function('return (' + src + ')')()`, which
    // SyntaxErrors on the inner-statements form) — matching every other
    // `registerHandlerDef` body in this file.
    registerHandlerDef('operator-editing-mode-toggle', { name: 'operator-editing-mode-toggle', body: OPERATOR_EDITING_MODE_TOGGLE_HANDLER })
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
    // Unit U3 §1.3 (decision C) — the host post-assembly splice runs AFTER the
    // Unit L readOnly pass (so it still sees the textarea) and BEFORE
    // recomputeBackRefs (so the backRefs are recomputed from the POST-splice
    // envelope — a removed `textarea-<ragId>` never lingers in the map).
    this.applyEditingMode(result.envelope, this.editingMode)
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
    // Unit U1 §1.4 — REBUILD the operator envelope (not just re-render the
    // cached translated nodes) so `settingsContent` re-evaluates with the
    // re-fetched `lastOperatorSettings` — the editingMode text-div + button
    // label/`data-mode` update on every re-derive/re-fetch.
    this.mountOperator()
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
    // F1 (adversarial) — fetch the PERSISTED operator settings at boot so a
    // persisted `editingMode` (e.g. 'contenteditable') is honored from the very
    // first load. The only other get is in `refresh()`, which boot never calls —
    // without this fetch `this.editingMode` would stay 'textarea' until a
    // broadcast, and a later re-derive would flip the control without the graph.
    // Same coercion as onOperatorSettingsChanged: only 'contenteditable' passes,
    // else 'textarea'. A bridge error keeps the default (textarea) + null
    // lastOperatorSettings (never a crash).
    try {
      const settings = await this.bridge.operatorSettings.get()
      this.lastOperatorSettings = settings
      this.editingMode = settings.editingMode === 'contenteditable' ? 'contenteditable' : 'textarea'
    } catch {
      // keep the default editingMode (textarea) + null lastOperatorSettings
    }
    // Derive the document ids from the doc-head edges' targets.
    const documentIds = this.deriveDocumentIds(snapshot)
    const traversalEnvelope = this.buildTraversalEnvelope(snapshot, documentIds)
    this.loadAppGraph(runtime, traversalEnvelope)
    this.mountOperator()
    // Subscribe to the re-derive triggers.
    this.unsubRag = this.bridge.edit.onRagStoreChanged((p) => this.onRagStoreChanged(p))
    this.unsubTemplate = this.bridge.template.onTemplateChanged((p) => this.onTemplateChanged(p))
    // Unit U1 §1.3 — the operator-settings-change re-derive trigger. Guarded so
    // a bridge whose `operatorSettings` predates the `onChanged` subscription
    // (e.g. an older host/test surface) still boots — the settings-change
    // broadcast simply has no subscriber in that case.
    if (typeof this.bridge.operatorSettings.onChanged === 'function') {
      this.unsubSettings = this.bridge.operatorSettings.onChanged((p) => void this.onOperatorSettingsChanged(p))
    }
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
      // CRITICAL #1 (adversarial) — a SINGLE final graph load. Stash the fresh
      // traversal envelope and let `refresh()` perform the ONE loadAppGraph
      // (re-assemble + re-load → `runtime.loadEnvelope` → `tearDownGraph` (destroys
      // every node) → `resetRenderState` → a full fresh `render()`) + the operator
      // re-mount + the data re-fetch. The caret-restore loop BELOW runs AFTER that
      // single final render, so the selection it applies is set on the FINAL
      // render and survives. Previously `reDerive` called `loadAppGraph` itself AND
      // then `refresh()` called `loadAppGraph` AGAIN — the second load's
      // `tearDownGraph` + fresh `render()` destroyed the selection the restore loop
      // had just set on the prior render's elements (a real-browser bug the
      // dom-shim's persistent getElementById masked).
      this.lastTraversalEnvelope = traversalEnvelope
      await this.refresh()
      // Unit U4 §1.7 — after the re-derive's FINAL re-load of the pane-inclusive
      // envelope, restore the saved caret for each node with a saved caret, GATED
      // by the node's RENDERED control type (amendment 4 / U3 F2 / ADR-8). A
      // dangling back-reference clears the stale caret (restoreCaret returns
      // undefined — Unit D §5.3 L5); the host does NOT re-apply a stale caret (A4).
      for (const ragId of [...this.caretNodes]) {
        const caret = this.editController.restoreCaret(ragId)
        if (caret === undefined) {
          this.caretNodes.delete(ragId) // dangling backRef — stale caret cleared (L5)
          continue
        }
        // ONE-SHOT (H2) — remove the node after a SUCCESSFUL restore AND after a
        // dropped/mismatched restore, so only the re-derive immediately following
        // the edit re-focuses — not every subsequent re-derive.
        this.caretNodes.delete(ragId)
        if (caret.kind === 'rich') {
          // Gate — ONLY restore a rich caret into a REAL contenteditable root. The
          // `rag-<ragId>` element is authored by the traversal UNCONDITIONALLY (it
          // exists in BOTH modes), so ELEMENT PRESENCE is NOT a valid gate (U3 F2).
          // The real indicator is `this.editingMode === 'contenteditable'` AND the
          // rendered root carrying the `contenteditable` attribute that
          // `applyEditingMode` authors ONLY for eligible roots in contenteditable mode.
          const root = document.getElementById('rag-' + ragId) as HTMLElement | null
          const rootIsContenteditable =
            this.editingMode === 'contenteditable' &&
            !!root &&
            ((root as { isContentEditable?: boolean }).isContentEditable === true || root.getAttribute?.('contenteditable') === 'true')
          if (rootIsContenteditable) {
            this.restoreRichCaret(ragId, caret)
          }
          // else: editingMode is 'textarea', the node is ineligible, or the rendered
          // root is not contenteditable (a contenteditable→textarea toggle) — the
          // rich caret is DROPPED, never applied to a textarea/non-contenteditable
          // node (amendment 4 / U3 F2 / ADR-8).
        } else {
          // Gate — ONLY restore a textarea caret into a `textarea-<ragId>` element.
          const el = document.getElementById('textarea-' + ragId) as HTMLTextAreaElement | null
          if (el) {
            el.selectionStart = caret.offset
            el.selectionEnd = caret.offset
            if (caret.focused && typeof el.focus === 'function') el.focus()
          }
          // else: the node now renders contenteditable — the textarea caret is
          // DROPPED, never applied to a contenteditable node (amendment 4 / U3 F2).
        }
      }
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

  /** Unit U1 §1.3 (amendment A) — the operator-settings-changed handler. The
   *  broadcast payload IS the authoritative store state (main broadcasts
   *  `operatorSettingsStore.set()`'s result post-SET), so the host does NOT
   *  re-fetch — a re-fetch is redundant and creates an async race with the sync
   *  requestRebuild requirement. FULLY SYNCHRONOUS: set lastOperatorSettings +
   *  editingMode from the PAYLOAD (defensive coercion — only 'contenteditable'
   *  passes), then route through the edit controller's dirty-edit guard
   *  (requestRebuild) → the SAME single re-derive as rag-store-changed /
   *  template-changed (a FRESH traversal — never refresh() over the cached
   *  envelope). A malformed/absent editingMode is coerced to 'textarea' and the
   *  handler STILL rebuilds (the payload is authoritative, not dropped). */
  private onOperatorSettingsChanged(payload: OperatorSettings): void {
    // F2 (adversarial) — defensive guard: a null/undefined payload is never
    // dereferenced (never throw); it coerces to the textarea default and the
    // handler STILL rebuilds (the broadcast is authoritative, not dropped).
    payload = (payload ?? { editingMode: 'textarea' }) as OperatorSettings
    this.lastOperatorSettings = payload
    this.editingMode = payload.editingMode === 'contenteditable' ? 'contenteditable' : 'textarea'
    this.editController.requestRebuild() // → reDerive (FRESH traversal — never refresh() over the cached envelope)
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
        // Unit U1 §1.4 — the editingMode button-toggle. A text div shows the
        // CURRENT mode; a button (NOT a form control — the pivot) carries the
        // TOGGLED (other union member) mode in `data-mode` + the toggle-action
        // label. NO checked/selected boolean-attribute props are authored.
        {
          type: 'div',
          props: { id: 'operator-editing-mode' },
          content: `editingMode: ${s?.editingMode ?? 'textarea'}`,
        },
        {
          type: 'button',
          props: {
            id: 'operator-editing-mode-toggle',
            'data-mode': (s?.editingMode ?? 'textarea') === 'contenteditable' ? 'textarea' : 'contenteditable',
          },
          content: (s?.editingMode ?? 'textarea') === 'contenteditable' ? 'Switch to textarea' : 'Switch to contenteditable',
          handlers: [{ name: 'operator-editing-mode-toggle', event: 'click', body: OPERATOR_EDITING_MODE_TOGGLE_HANDLER }],
        },
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
    const walk = (n?: LegacyNodeData): void => {
      if (!n) return // F3 (adversarial) — a malformed payload root must not throw
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
    for (const p of envelope.content ?? []) walk(p.content?.[0])
  }

  /** Unit U3 §1.3 — the host post-assembly splice. When `editingMode ===
   *  'contenteditable'`, walk every subtree root in the assembled envelope's
   *  content payloads: for each RICH-ELIGIBLE root, REMOVE the
   *  traversal-authored `textarea-<ragId>` child and set `contenteditable:
   *  true` on the root's props (authored as provident data). Ineligible roots
   *  keep their textarea (the fallback control). When `editingMode ===
   *  'textarea'`, no-op. Idempotent (mirrors setTextareaReadOnly's H4): on a
   *  repeated splice of the SAME envelope, an already-removed textarea is not
   *  found → the removal no-ops; `contenteditable: true` is set again. Recurse
   *  into `rag-`-prefixed subtree roots only (doc-children); inline children
   *  (`inline-…`) and textareas are never subtree roots. */
  private applyEditingMode(envelope: LegacyInitialData, editingMode: EditingMode): void {
    if (editingMode !== 'contenteditable') return
    const walk = (n?: LegacyNodeData): void => {
      if (!n) return // F3 (adversarial) — a malformed payload root must not throw
      const pid = n.props?.id
      if (typeof pid === 'string' && pid.startsWith('rag-')) {
        const ragId = pid.slice(4)
        // `ownsDocChildren` mirrors the traversal's `rag-`-prefix rule
        // (collectSubtreeIds / recomputeBackRefs): a DIRECT child whose
        // authored `props.id` is a `rag-`-prefixed string is a doc-child
        // subtree root. Inline children (`inline-…`) and the textarea
        // (`textarea-…`) are NOT `rag-`-prefixed → never doc-children.
        const ownsDocChildren = (n.children ?? []).some((c) => {
          const cid = (c as LegacyNodeData).props?.id
          return typeof cid === 'string' && cid.startsWith('rag-')
        })
        if (isRichEditableRoot(n.type as RagNodeType, ownsDocChildren)) {
          n.children = (n.children ?? []).filter(
            (child) => (child as LegacyNodeData).props?.id !== `textarea-${ragId}`,
          )
          // Preserve the root's existing props (authored id, data-rag-node-id,
          // data-doc-head); overwrite any stale authored `contenteditable`.
          n.props = { ...(n.props ?? {}), contenteditable: true }
          // Unit U4 §1.3 — ATTACH the 4 name-referenced rich handler defs to the
          // eligible root. minor #5 (adversarial) — APPEND-IF-ABSENT, name-
          // deduplicated, instead of REPLACE: `n.handlers = RAG_EDITOR_HANDLER_DEFS`
          // would clobber any authored handler already on the root. No authored
          // template/traversal places a handler on a rich root today (verified),
          // but the merge makes the splice robust to one. Idempotent (H4) — a
          // repeated splice of the SAME envelope cannot duplicate the 4 defs (the
          // existing names are excluded).
          const existingHandlerNames = new Set(
            (n.handlers ?? []).map((h) => (h as { name?: string }).name),
          )
          n.handlers = [
            ...(n.handlers ?? []),
            ...RAG_EDITOR_HANDLER_DEFS.filter((d) => !existingHandlerNames.has(d.name)),
          ]
        }
      }
      for (const c of n.children ?? []) {
        const cid = (c as LegacyNodeData).props?.id
        if (typeof cid === 'string' && cid.startsWith('rag-')) walk(c as LegacyNodeData)
      }
    }
    for (const p of envelope.content ?? []) walk(p.content?.[0])
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
      // Unit U4 §1.4 (decisions G/H) — the 4 rich-text bridge methods. minor #6
      // (adversarial) — each PUBLIC bridge method guards against a null/undefined
      // ragId (a malformed/craftable dispatch that omits the `data-rag-node-id`
      // prop) and NO-OPs: it never throws, never marks a phantom node dirty, never
      // commits an id-less blur, and never starts/ends a composition on a phantom
      // node. `editorBlur` also defaults a missing `html` to '' (the same fallback
      // the handler body applies when the DOM root is absent).
      editorInput: (ragId?: string) => { if (ragId == null) return; this.editorInput(ragId) },
      editorBlur: (ragId?: string, html?: string) => { if (ragId == null) return; void this.editorBlur(ragId, html ?? '') },
      editorCompositionStart: (ragId?: string) => { if (ragId == null) return; void this.editorCompositionStart(ragId) },
      editorCompositionEnd: (ragId?: string) => { if (ragId == null) return; void this.editorCompositionEnd(ragId) },
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

  /** `operatorSet` — Unit U1 §1.4 — `bridge.operatorSettings.set` → main
   *  broadcasts `operator-settings-changed` → the host re-derives (fresh
   *  traversal) + `refresh()` re-renders the operator graph. SYNCHRONOUS (the IPC
   *  is fired; the broadcast drives the re-render — no inline re-mount). */
  private operatorSet(patch: OperatorSettingsPatch): void {
    // F5 (adversarial) — catch a REJECTED set so a store/bridge failure is
    // logged, never an unhandled rejection (mirrors the submitQuery / refresh
    // bridge-error-catch pattern). The broadcast drives the re-render, so a
    // failed set simply leaves the prior mode in place.
    void this.bridge.operatorSettings.set(patch).catch((e) => {
      console.error('[sidebar-panes] operator settings set failed', e)
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
    this.editController.saveCaret(ragId, { kind: 'textarea', offset, focused: dirty })
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

  /** Unit U4 §1.4 — `rag-editor-input`: mark the RAG node's control dirty. A
   *  re-derive while the contenteditable is dirty is QUEUED (the dirty-edit
   *  guard, Unit D §5.2) — the in-progress edit is never destroyed. */
  private editorInput(ragId: string): void {
    this.editController.markDirty(ragId)
  }

  /** Unit U4 §1.4 (decisions G/I) — `rag-editor-blur`: capture + save the rich
   *  caret BEFORE the commit, then decompose-ONCE + commit-ONCE when dirty. A
   *  non-dirty blur is a no-op (caret saved, NO commit/NO IPC). A mid-composition
   *  blur is DEFERRED (decision H) — the caret was already captured + saved; the
   *  commit runs on `compositionend`-then-blur. */
  private editorBlur(ragId: string, html: string): void {
    // I — capture the rich caret (selection) from the DOM BEFORE the commit; the
    // re-derive re-renders and destroys the selection.
    const anchor = this.captureRichCaret(ragId, 'anchor')
    const focus = this.captureRichCaret(ragId, 'focus')
    const dirty = this.editController.isDirty(ragId)
    this.editController.saveCaret(ragId, { kind: 'rich', ragId, anchor, focus, focused: dirty })
    this.caretNodes.add(ragId)
    if (!dirty) return // no-op blur: caret saved, NO commit (no-op blur contract)
    if (this.composingRagId === ragId) {
      // H — a mid-composition blur is DEFERRED (commit suppressed until
      // compositionend); the selection was already captured + saved above.
      this.pendingCommitRagId = ragId
      return
    }
    this.editorBlurCommit(ragId, html)
  }

  /** The decompose-ONCE + commit-ONCE body (shared by the normal blur and the
   *  compositionend-deferred blur). Pinned with a per-ragId commit-in-flight
   *  latch (ADR-1 — the no-double-commit race) + a `.catch` (ADR-4 — a rejected
   *  invoke is logged, never an unhandled rejection). */
  private editorBlurCommit(ragId: string, html: string): void {
    if (this.committingRagIds.has(ragId)) return // ADR-1 — a commit is already in flight for this node
    const result = decomposeRichHtml(html) // U2 — decompose ONCE (decision G)
    if (!result.ok) return // defensive fail-state — NO commit; the DOM content is preserved (§2.2)
    this.committingRagIds.add(ragId) // ADR-1 — latch the in-flight commit BEFORE the async settle
    void this.bridge.edit.commitRich(ragId, result.content, result.children)
      .then((r) => {
        // I/L6 — on success clear the dirty flag (which may trigger a queued
        // rebuild). On `deleted-node` ALSO clear it (H5 — the node is gone, the
        // edit is unrecoverable). On `store-error` keep it (the edit is not lost).
        if (r.ok || r.reason === 'deleted-node') {
          this.editController.clearDirty(ragId)
        }
        // ADR-1 — release the latch once the commit settles (the success path).
        this.committingRagIds.delete(ragId)
      })
      .catch((e) => {
        // ADR-4 — a rejected invoke is logged, NEVER an unhandled rejection; the
        // dirty flag STAYS (the edit is not lost — a later blur may retry).
        console.error('[sidebar-panes] rich commit failed', e)
        // ADR-1 — release the latch on a rejected settle too (the node may retry).
        this.committingRagIds.delete(ragId)
      })
  }

  /** Unit U4 §1.4 (decision H) — `rag-editor-compositionstart`: begin the IME
   *  composition window for this node. The IME text lands via `input` events
   *  (which mark the node dirty); the composition events themselves do NOT mark
   *  dirty. a-med #2 (adversarial) — a SUPERSEDING composition: if a blur was
   *  deferred mid-composition for a DIFFERENT node (its `compositionend` will
   *  never fire because this composition supersedes it), run that orphaned
   *  deferred commit NOW so its dirty flag clears — the dirty-edit guard is never
   *  permanently wedged. With the single-slot `pendingCommitRagId`, the sequence
   *  blur-deferred-for-A → compositionstart B → compositionend B (pending !== B)
   *  would otherwise orphan A's deferred commit and leave dirty(A) set forever,
   *  permanently queuing every re-derive. The orphan's commit reads its CURRENT
   *  innerHTML (the same read `compositionend` would have used); a re-composition
   *  of the SAME node (`pendingCommitRagId === ragId`) is NOT orphaned here. */
  private editorCompositionStart(ragId: string): void {
    if (this.pendingCommitRagId && this.pendingCommitRagId !== ragId) {
      const orphan = this.pendingCommitRagId
      this.pendingCommitRagId = null
      const el = document.getElementById('rag-' + orphan) as HTMLElement | null
      const html = el ? el.innerHTML : ''
      this.editorBlurCommit(orphan, html)
    }
    this.composingRagId = ragId
  }

  /** Unit U4 §1.4 (decision H) — `rag-editor-compositionend`: clear the
   *  composition window AND, if a blur was deferred for the SAME ragId
   *  (`pendingCommitRagId === ragId`), run the deferred commit ONCE. Guarded
   *  keyed by ragId — a spurious/unmatched `compositionend` clears nothing. */
  private editorCompositionEnd(ragId: string): void {
    if (this.composingRagId !== ragId) return // only the composing node's end clears
    this.composingRagId = null
    if (this.pendingCommitRagId === ragId) {
      // A blur was deferred mid-composition; run the deferred commit NOW
      // (the final commit happens on compositionend-then-blur).
      this.pendingCommitRagId = null
      const el = document.getElementById('rag-' + ragId) as HTMLElement | null
      const html = el ? el.innerHTML : ''
      this.editorBlurCommit(ragId, html)
    }
  }

  // ---- Unit U4 §1.6 — the rich caret capture/restore machinery -------------

  /** Capture the anchor or focus edge of the current selection as a
   *  `RichCaretEdge` (a child-index path from the root down to the target text
   *  node + an offset). ADR-13 — the dom-shim supplies neither `getSelection`
   *  nor `createRange`; their absence NO-OPs into the fallback, never throws. */
  private captureRichCaret(ragId: string, which: 'anchor' | 'focus'): RichCaretEdge {
    const sel = typeof window.getSelection === 'function' ? window.getSelection() : null
    const node = which === 'anchor' ? sel?.anchorNode : sel?.focusNode
    const offset = which === 'anchor' ? sel?.anchorOffset : sel?.focusOffset
    const root = document.getElementById('rag-' + ragId) as HTMLElement | null
    if (!sel || !node || !root || !(typeof root.contains === 'function' ? root.contains(node) : false)) {
      return { path: [0], offset: 0 } // fallback — the start of the root's first text run
    }
    return { path: this.domPathToRoot(root, node), offset: typeof offset === 'number' ? offset : 0 }
  }

  /** Compute the child-index path from `root` down to `node` by walking
   *  `node.parentNode` up to `root`, collecting the `childNodes` index at each
   *  level, and reversing. The path targets a TEXT NODE (the caret lives in a
   *  text node). */
  private domPathToRoot(root: Node, node: Node): number[] {
    const path: number[] = []
    let cur: Node | null = node
    while (cur && cur !== root && cur.parentNode) {
      const parent: Node = cur.parentNode
      let index = 0
      for (let i = 0; i < parent.childNodes.length; i++) {
        if (parent.childNodes[i] === cur) {
          index = i
          break
        }
      }
      path.push(index)
      cur = parent
    }
    return path.reverse()
  }

  /** Re-resolve a `RichCaretEdge.path` (child-index steps) from `root`. Returns
   *  the resolved node or `null` if any step is out of range. `[]` (empty path)
   *  addresses the root element itself; for caret restore the host resolves it to
   *  the root's FIRST text node. a-med #3 (adversarial) — an ELEMENT-node edge
   *  (a caret whose anchor/focus lands on a strong/em/a element boundary) is
   *  CLAMPED to the nearest text node in document order, so a real-DOM boundary
   *  selection is restored instead of silently dropped. An element with no text
   *  node descendant (e.g. an empty `<br>`) still resolves to `null` (dropped —
   *  there is no text run to place a caret in). */
  private resolveDomPath(root: Node, path: number[]): Node | null {
    let cur: Node = root
    for (const step of path) {
      const kids = cur.childNodes
      if (!kids || step >= kids.length) return null
      cur = kids[step]
    }
    // `[]` addresses the root element; for caret restore resolve to the root's
    // FIRST text node in document order.
    if (path.length === 0 && cur.childNodes && cur.childNodes.length > 0) {
      const firstText = this.firstTextNode(cur)
      if (firstText) return firstText
    }
    if (cur.nodeType === 3) return cur // a text node
    // a-med #3 — clamp an element-node edge to its nearest text node (the caret
    // lives in a text node; a boundary selection on strong/em/a must be restored,
    // not dropped).
    const nearest = this.firstTextNode(cur)
    if (nearest) return nearest
    return null
  }

  /** Find the first text node in document order within `node` (including
   *  `node` itself if it is a text node). */
  private firstTextNode(node: Node): Node | null {
    if (node.nodeType === 3) return node
    const kids = node.childNodes
    if (kids) {
      for (let i = 0; i < kids.length; i++) {
        const found = this.firstTextNode(kids[i])
        if (found) return found
      }
    }
    return null
  }

  /** Unit U4 §1.6 — restore a saved rich caret into a re-rendered
   *  contenteditable root. The anchor/focus edges are re-resolved against the
   *  RE-RENDERED DOM, offsets CLAMPED to the text node's length. ADR-13 — the
   *  dom-shim supplies neither `getSelection` nor `createRange`; their absence
   *  NO-OPs the restore (never throws). A path that no longer resolves → NO-OP. */
  private restoreRichCaret(ragId: string, caret: Extract<CaretState, { kind: 'rich' }>): void {
    const root = document.getElementById('rag-' + ragId) as HTMLElement | null
    if (!root) return // no contenteditable root — dropped (stale)
    const anchorNode = this.resolveDomPath(root, caret.anchor.path)
    const focusNode = this.resolveDomPath(root, caret.focus.path)
    if (!anchorNode || !focusNode) return // path invalid after re-derive — dropped (§2.2)
    // ADR-13 — the dom-shim supplies neither `getSelection` nor `createRange`;
    // their absence NO-OPs the restore (never throws, never an unhandled error).
    if (typeof window.getSelection !== 'function') return
    const sel = window.getSelection()
    if (!sel) return
    if (typeof document.createRange !== 'function') return
    const range = document.createRange()
    const aLen = (anchorNode as Text).data?.length ?? 0
    const fLen = (focusNode as Text).data?.length ?? 0
    range.setStart(anchorNode, Math.min(caret.anchor.offset, aLen))
    range.setEnd(focusNode, Math.min(caret.focus.offset, fLen))
    sel.removeAllRanges()
    sel.addRange(range)
    if (caret.focused && typeof root.focus === 'function') root.focus()
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
