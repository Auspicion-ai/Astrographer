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
  enabledZonePaneCounts,
  SIDEBAR_ZONE,
  docNavContent,
  crosslinksContent,
  searchContent,
  landingContent,
  searchTabContent,
  editorToolbarContent,
  EDITOR_TOOLBAR_TOGGLE_HANDLER,
  type AppGraphAssemblyResult,
  type SearchResult,
} from './pane-graph.js'
import { createTemplateEditorPane, type TemplatePaneContext } from './template-pane.js'
import { clickableClasses } from './render-shared.js'
import { LAYOUT_PANE_ZONES, coerceLayout, defaultLayout, deriveLayout, isLayoutZoneName, type LayoutState, type LayoutZoneName } from './layout-state.js'
import {
  createDragController,
  insertionIndexForPoint,
  movePane,
  setZoneMinimized,
  type DragController,
  type DragPoint,
  type DropResult,
  type ZoneBounds,
} from './pane-drag.js'
import {
  createGutterController,
  isGutterResizable,
  setZoneSize,
  type GutterController,
} from './pane-gutter.js'
import type { EditController, CaretState, RichCaretEdge, RebuildKind } from './edit-controller.js'
import { reconcileDocumentRoots, type DocumentRoot, type ReconcileChange } from './content-reconcile.js'
import { buildTraversal, type CrosslinkWiring } from '../main/traversal.js'
import { HoverPreviewController } from './hover-preview.js'
import { createSnapshotStore } from '../main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate, type TemplateVerdict } from '../main/template-shape.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  RagDocHeadsPayload,
  RagStoreListingPayload,
  RagStoreChangedPayload,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
  RagStoreManageRequest,
  RagStoreManageResult,
  RagStoreManageOp,
  PaneCatalogEntry,
} from '../shared/types.js'
import type { BacklinkResult } from '../main/backlinks.js'
import type { LocalRagQueryFilters } from '../main/retrieval.js'
import type { RagNodeType, RagNode, RagEdge } from '../main/rag-store.js'
import { isRichEditableRoot } from './rich-eligibility.js'
import { decomposeRichHtml } from '../main/rich-decompose.js'
import { type TabDefaultContext, type TabEntry, type TabSearchParams } from './tab-state.js'

/** U-PARITY-C18 — the advanced-search args the `search` pane's disclosure
 *  collects. Mirrors the `rag.query` argument surface (W1-Q9): the extended
 *  engine options (`RagQueryOptions` minus `topK`/`wikiId`, which the pane
 *  supplies separately) + `stores:'all'`. Routed through the SAME
 *  `bridge.rag.query` seam as the basic submit (MCP/UI equivalence). */
export interface AdvancedSearchQueryOptions {
  mode?: 'flat' | 'graph'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
  filters?: LocalRagQueryFilters
  stores?: 'all'
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
    /** U-MS5 — the third optional `store` param (MCP/UI mechanical symmetry,
     *  UI-SELECTOR-DEFERRED). Omitted ⇒ the default store (zero-config
     *  byte-equal; the settings/search pane's own path never passes it).
     *  U-PARITY-C18 — the fourth optional `options` param carries the
     *  advanced-search `rag.query` args (mode/maxHops/expand/maxParentContext/
     *  filters/stores) through this SAME seam. */
    query(query: string, topK?: number, store?: string, options?: AdvancedSearchQueryOptions): Promise<RagQueryResult>
    snapshot(): Promise<RagSnapshotPayload>
    backlinks(nodeId: string): Promise<BacklinkResult>
    /** Unit V3 — the doc-nav data source. Returns the document list (the
     *  `doc-head` edges' targets + the head node content) — a strict subset of
     *  the snapshot. */
    docHeads(): Promise<RagDocHeadsPayload>
    /** U-MS5 — the read-only settings-pane store listing. Returns the registry's
     *  presentation view (one entry per configured store: name, default flag,
     *  persistence file name, corpus root, per-store load status). Manual-UI
     *  only: never an MCP tool — an agent must not enumerate the configured
     *  store names (B9/A9). */
    stores(): Promise<RagStoreListingPayload>
    /** U-H8 — the operator-registry management surface (the review §2 D6 ONE
     *  exemption). Sends the `rag-store-manage` IPC to main, which validates
     *  the request, reads the live projection, runs the two-phase confirmation
     *  (a destructive op without `confirmed:true` returns `{ confirmationRequired:
     *  true, summary }`), and invokes the LANDED hot-* seams. Manual-UI only:
     *  never an MCP tool — an agent must not add/remove/rename/re-default a
     *  store (A-P2-6/A-P2-7). */
    manage(request: RagStoreManageRequest): Promise<RagStoreManageResult>
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
  /** Unit U-MENU-1 §2.2 — the renderer→main pane-catalog push. Optional so
   *  older host/test bridges (which predate the menu surface) still boot. */
  pushPaneCatalog?(catalog: PaneCatalogEntry[]): void
  /** Unit U-MENU-1 §2.3 / U-SHELL-8 §2.6 pin 2 — subscribe to the
   *  `IPC_PANE_VISIBILITY` action the native View → Panes checkbox sends.
   *  Optional so older host/test bridges still boot. */
  onPaneVisibility?(handler: (change: { id: string; enabled: boolean }) => void): () => void
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
  /** Unit GN-MCP-UI §5.5 — the optional gnosis GUI delegate (the D4-parity
   *  panes, wired by the renderer via `GnosisPanes`). When present, the
   *  `window.provident.sidebar.gnosisStatus`/`gnosisQuery` handler bodies route
   *  here. Absent (tests / pre-Gnosis hosts) → the sidebar gnosis methods are
   *  no-ops (never throw). */
  gnosis?: { status(): void; query(value: string): void }
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
  /** Unit U-SHELL-9a §2.6 — the optional main-focus tab-strip delegate. The
   *  search pane's `pane-search-expand-tab` handler reaches it to open the
   *  current query as a full tab; a result click opens a NEW `document` tab
   *  (HOST-4); an in-tab query edit reuses the search tab (HOST-5). Absent
   *  (tests / pre-tabs hosts) → a no-op. */
  tabs?: {
    expandSearchTab(query: string): void
    openDocumentTab?(documentId: string): void
    editSearchQuery?(tabId: string, params: TabSearchParams): void
  }
}

// ---- handler bodies (function-STRING data). They reach the IPC bridge via
// `window.provident.sidebar` — NEVER an MCP tool. The host installs the
// `window.provident.sidebar` surface at boot (M2).

/** U-SHELL-8 (C11/V4-V5) — order-insensitive class-set equality (the zone
 *  mirror classes are a set; the authored order is not semantically
 *  significant). PURE. */
function sameClassSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (const c of a) if (!b.includes(c)) return false
  return true
}

/** U-STATE-1b — coalesce two rebuild kinds by precedence
 *  (template > operator > content). */
const REBUILD_RANK: Record<RebuildKind, number> = { content: 0, operator: 1, template: 2 }
function mergeRebuildKind(a: RebuildKind | null, b: RebuildKind): RebuildKind {
  if (a == null) return b
  return REBUILD_RANK[b] > REBUILD_RANK[a] ? b : a
}

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
// Unit U-EDIT-1 (C8) — the APP-GRAPH editor-toolbar toggle handler. The toolbar
// button's `data-mode` reflects the CURRENT mode (spec §2 reflection); the
// handler FLIPS to the other union member and routes through the SAME shared
// operator-change seam (`sidebar.operatorSet`) → main SET → broadcast →
// `requestRebuild('operator')`. FULL function-expression form (the
// `compileHandlerBody`-compatible representation the app Runtime's
// `resolveNameReferencedHandlerBodies` requires). A missing/invalid `data-mode`
// is DROPPED (coerced at the boundary — never a junk write, never a throw).
const EDITOR_TOOLBAR_TOGGLE_HANDLER_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var mode = ctx && ctx.node && ctx.node.props && ctx.node.props['data-mode'];
  if (mode !== 'textarea' && mode !== 'contenteditable') return;
  var next = mode === 'contenteditable' ? 'textarea' : 'contenteditable';
  s.operatorSet({ editingMode: next });
}`
// Unit U-H8 — the 7 operator-registry-manage handler bodies (the review §2 D6
// ONE operator-UI IPC exemption). Each reaches `window.provident.sidebar.registryManage`/
// `registryManageDismiss` (the U1 `sidebar.operatorSet` convention) — NEVER an MCP
// tool. Registered via `registerHandlerDef` (additive + harmless in the app graph)
// in the FULL function-expression form (the `compileHandlerBody`-compatible
// representation, the U1 F3 convention). The operator isolated scope uses the SAME
// full form as its INLINE handler bodies. Each body reads the target data from
// `ctx.node.props['data-*']` + the DOM input values (`getElementById(...).value`),
// TRIMS the operator-typed name (OPERATOR-INPUT-HYGIENE — a whitespace-only value
// is DROPPED, no dispatch), and dispatches.
const OPERATOR_RAG_ADD_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var el = document.getElementById('operator-rag-manage-add-name'); var name = el ? el.value : '';
  if (name && String(name).trim() !== '') s.registryManage({ op: 'add', name: String(name).trim() });
}`
const OPERATOR_RAG_REMOVE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
  if (name) s.registryManage({ op: 'remove', name: name });
}`
const OPERATOR_RAG_RENAME_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
  var el = name ? document.getElementById('operator-rag-manage-rename-input-' + name) : null; var to = el ? el.value : '';
  if (name && to && String(to).trim() !== '') s.registryManage({ op: 'rename', from: name, to: String(to).trim() });
}`
const OPERATOR_RAG_SET_DEFAULT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var name = ctx && ctx.node && ctx.node.props && ctx.node.props['data-store'];
  if (name) s.registryManage({ op: 'setDefault', name: name });
}`
const OPERATOR_RAG_RENAME_DEFAULT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var el = document.getElementById('operator-rag-manage-renamedefault-input'); var to = el ? el.value : '';
  if (to && String(to).trim() !== '') s.registryManage({ op: 'renameDefault', to: String(to).trim() });
}`
// Reconstructs the CONFIRMED request from the confirmation strip's data-* props
// (Q7 — SAME-channel two-phase: the Confirm re-invokes the SAME op with
// `confirmed:true`).
const OPERATOR_RAG_CONFIRM_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return;
  var o = ctx && ctx.node && ctx.node.props; if (!o) return; var op = o['data-op'];
  if (op === 'remove') s.registryManage({ op: 'remove', name: o['data-store'], confirmed: true });
  else if (op === 'rename') s.registryManage({ op: 'rename', from: o['data-from'], to: o['data-to'], confirmed: true });
  else if (op === 'setDefault') s.registryManage({ op: 'setDefault', name: o['data-store'], confirmed: true });
  else if (op === 'renameDefault') s.registryManage({ op: 'renameDefault', to: o['data-to'], confirmed: true });
}`
const OPERATOR_RAG_DISMISS_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar; if (!s) return; s.registryManageDismiss();
}`
const SEARCH_SUBMIT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var input = ctx && ctx.node && ctx.node.props && ctx.node.props['value'];
  var value = input != null ? String(input) : '';
  s.submitQuery(value);
}`
const TEMPLATE_ZONE_ADD_BODY = `function (ctx, value) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  // The Add-zone button carries no value prop; read the zone from (1) a
  // dispatch-provided value arg (MCP path), (2) the template-zone-input's
  // CURRENT DOM value (UI path, M4 — the typed value lives in the DOM).
  var input = ctx && ctx.node && ctx.node.props && ctx.node.props['value'];
  if (input === undefined && value !== undefined) input = value;
  if (input === undefined) {
    var el = document.getElementById('template-zone-input');
    input = el ? el.value : '';
  }
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
  /** Unit GN-MCP-UI §5.5 — the optional gnosis GUI delegate (see the options
   *  doc). Null when not provided (the sidebar gnosis methods become no-ops). */
  private readonly gnosis: { status(): void; query(value: string): void } | null
  /** Unit U-SHELL-9a §2.6 — the optional main-focus tab-strip delegate (the
   *  search pane's pane-first expand-to-tab control + the result/open/edit
   *  seams reach it; HOST-4/HOST-5). */
  private readonly tabs: {
    expandSearchTab(query: string): void
    openDocumentTab?(documentId: string): void
    editSearchQuery?(tabId: string, params: TabSearchParams): void
  } | null

  /** U-PARITY-C19 — the shell hover-preview timing controller (W1-Q10: the
   *  content is provident, the 0.5 s dismissal is shell). onChange re-renders
   *  the EXISTING app graph so the popup subtree appears/clears. */
  private readonly hoverPreview: HoverPreviewController = new HoverPreviewController({
    onChange: () => this.rerenderAppGraph(),
  })
  /** U-PARITY-C19 — the shell-computed popup position (F3 best-effort; above
   *  by default, flipped below on a viewport overflow). */
  private hoverPreviewPosition: 'above' | 'below' = 'above'

  /** Host-owned mutable state (M5). */
  private _currentDocumentId: string | null = null
  private _currentNodeId: string | null = null

  /** U-SHELL-9a §2.3 (HOST-1) — the last mounted stage descriptor key (the
   *  single active tab body). Guards the stage mount so a redundant
   *  `onActiveChange` (e.g. a non-active tab close) never re-renders the
   *  already-mounted body. */
  private mountedStageKey: string | null = null

  /** U-SHELL-9b §2.1 (C14) — the simultaneously mounted document ids. A
   *  `mountTabs` call mounts ALL open document bodies (distinct roots) and
   *  records them here so a later content change repopulates every mounted root
   *  in place through the U-STATE-1e N-root reconcile. Empty / single-entry ⇒
   *  the landed single-active path is unchanged. */
  private mountedDocumentIds: string[] = []

  /** The host's pane-data cache (M7/M9). */
  private lastSnapshot: RagSnapshotPayload | null = null
  /** Unit MS3 — the host's boot store (the store this host renders + edits).
   *  Captured from the `rag-snapshot` payload's REQUIRED `store` field at BOTH
   *  snapshot-commit points (boot + re-derive), committed TOGETHER with
   *  lastSnapshot/lastDocHeads (the LOW-5 discipline, three-way). Null until the
   *  first successful snapshot commit. Read by the foreign-store drop guard. */
  private lastStore: string | null = null
  /** Unit V3 — the doc-heads cache (the doc-nav's data source, amendment 5).
   *  Set by the boot/re-derive (fetched over the `rag-doc-heads` IPC) and read
   *  by `buildContext()` (which populates `ctx.docHeads`). */
  private lastDocHeads: RagDocHeadsPayload['documents'] | null = null
  private lastCrosslinks: CrosslinkWiring[] = []
  private lastBacklinks: BacklinkResult | null = null
  private lastQueryResult: RagQueryResult | null = null
  private lastOperatorSettings: OperatorSettings | null = null
  /** W2-N1 (§2.5) — the persisted serialized layout the app graph assembles
   *  against. Set from `OperatorSettings.layout` at boot/refresh + on a settings
   *  broadcast; omitted (`null`) → the assembler derives the registry default. */
  private layout: LayoutState | null = null
  /** U-SHELL-4 (C11) — the zones the shell drag controller currently reveals as
   *  provisional drop targets. Passed to the assembler so the zone container
   *  carries `is-revealed`; cleared by the controller's `onRevealChange`. */
  private revealedZones: LayoutZoneName[] = []
  /** U-SHELL-4 (C4/§3.1) — the last pointer position + zone bounds observed by
   *  `movePaneDrag`. `commitPaneDrop` derives the within-zone insertion index
   *  from this (so a drop lands where the pointer is, not always at the zone's
   *  end); it is reset at the start/cancel/commit of each gesture. */
  private lastDragPoint: DragPoint | null = null
  private lastDragZones: readonly ZoneBounds[] = []
  /** U-SHELL-4 — the shell pointer drag controller (C4 reorder/relocate + C11
   *  proximity reveal). The `onRevealChange` write re-renders the app graph with
   *  the fresh reveal set (ONE managed write per threshold-crossing — W2-Q7). */
  private readonly dragController: DragController
  /** U-SHELL-5 (C7) — the shell gutter resize controller. `onCommit` applies the
   *  clamped `ZoneLayout.size` and writes ONCE through `setLayout` at gesture
   *  end (W2-Q7/§2.1, never per-move); the `isResizable` gate is the §2.3
   *  empty/minimized rule (a zone with no gutter). */
  private readonly gutterController: GutterController
  /** U-PARITY-C18 — the advanced-search disclosure state (collapsed by default).
   *  Flipped by the `pane-search-advanced-toggle` handler → re-derive. */
  private advancedSearchOpen = false
  /** U-PARITY-C18 — the C15 document-metadata fields are present in this build
   *  (LocalRagQueryFilters), so the `documentPathPrefix`/`tags` controls render.
   *  A pre-C15 host would set this false → the controls are omitted (F2). */
  private readonly advancedSearchDocumentFilters = true
  /** U-PARITY-C18 — the last advanced-search engine fail-state (F1/state 6).
   *  Rendered inline by the search pane; cleared on the next success. */
  private advancedSearchError: string | null = null
  /** U-MS5 — the host's cached store listing (the operator's Phase-1 census).
   *  Fetched ONCE at boot (D8 — boot-time-only registry); the operator pane
   *  re-renders this cache on every mount/refresh/re-derive, never re-fetching. */
  private lastStoreListing: RagStoreListingPayload | null = null
  /** U-H8 — the pending destructive op awaiting the operator's provident-authored
   *  confirmation (the two-phase request step's result). null = nothing pending. */
  private pendingRegMgmt: { request: RagStoreManageRequest; summary: string } | null = null
  /** U-H8 — the operator-facing error surface (a manage `{ ok:false, error }` or
   *  a failed confirm). null = no error. Rendered as `p#operator-rag-manage-error`. */
  private registryManageError: string | null = null
  /** HOST-H8-4 (LOW) — a transient in-flight guard: while a CONFIRMED apply for an
   *  op is in flight (the bridge call is pending), a SECOND confirmed apply of the
   *  SAME op is IGNORED — a rapid double-click on Confirm must NOT re-fire the seam
   *  (which would leave a stale `registryManageError` after the store was actually
   *  removed). Cleared when the confirmed apply settles (ok / error / bridge reject). */
  private regMgmtConfirmingOp: RagStoreManageOp | null = null

  /** The cached security settings (fetched at boot) — the M13 handler gate reads
   *  this SYNCHRONOUSLY so a dispatchable pane handler cannot bypass the
   *  `rag`/`code` default-off gates (fail-closed when the group is off). */
  private security: SecuritySettings | null = null

  /** U-PARITY-DOCNAV — the doc-nav expanded-folder set (each key a
   *  `JSON.stringify(path[])`). Toggled by the `pane-doc-nav-toggle` handler and
   *  read by the doc-nav render on every re-derive. Folders default collapsed. */
  private readonly expandedDocFolders = new Set<string>()

  /** The stored content-window template (updated on boot + template-changed). */
  private template: ContentWindowTemplate = DEFAULT_CONTENT_WINDOW_TEMPLATE
  /** W1-N5 (U-PARITY-PARTIALS §1.1) — the last `code.template.validate`
   *  verdict. Set by the `templateValidateResult` host seam (the pane's
   *  Validate handler resolves `bridge.template.validate` then hands the
   *  verdict here); rendered inline by the template-editor pane. `null` until a
   *  validate runs (no feedback block). The verdict is display-only: the actual
   *  validation + group gate live in main (`handleTemplateTool`). */
  private templateValidation: TemplateVerdict | null = null
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
  /** The strongest queued rebuild kind (precedence template > operator >
   *  content) — preserved across the reDerive in-flight coalescing. */
  private reDeriveQueuedKind: RebuildKind | null = null
  /** U-STATE-1b — true once the app graph has been materialized (post-boot);
   *  gates the content-only reconcile path (vs the boot full load). */
  private appLoaded = false
  /** U-STATE-1b — the RAG change descriptor captured by `onRagStoreChanged`
   *  for the content reconciler. */
  private pendingContentChange: ReconcileChange | null = null

  /** U-SHELL-8 §2.7 H3 — set when a pane-visibility toggle lands; used to
   *  suppress the boot `applyPersistedPaneVisibility` so a toggle that fired
   *  while boot was awaiting the settings fetch is not clobbered by the stale
   *  boot-fetched enable sets. Reset at the top of `boot`. */
  private paneVisibilityTouched = false

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
  private editingMode: EditingMode = 'contenteditable'

  /** The subscription cleanup handles. */
  private unsubRag: (() => void) | null = null
  private unsubTemplate: (() => void) | null = null
  private unsubSettings: (() => void) | null = null
  /** Unit U-MENU-1 — the PaneRegistry change subscription (re-push the catalog
   *  to the native menu on every enable/disable). Null until boot. */
  private unsubRegistry: (() => void) | null = null
  /** U-SHELL-8 §2.6 pin 2 — the `IPC_PANE_VISIBILITY` subscription (the native
   *  View → Panes checkbox apply seam). Null until boot / when the bridge
   *  predates the menu surface. */
  private unsubPaneVisibility: (() => void) | null = null

  constructor(opts: SidebarPanesOptions) {
    this.mount = opts.mount
    this.operatorMount = opts.operatorMount
    this.registry = opts.registry
    this.bridge = opts.bridge
    this.backRefs = opts.backRefs
    this.editController = opts.editController
    this.zoneName = opts.zoneName ?? 'main'
    this.sidebarZone = opts.sidebarZone ?? SIDEBAR_ZONE
    this.gnosis = opts.gnosis ?? null
    this.tabs = opts.tabs ?? null
    // U-SHELL-4 — the shell drag controller. The scope of the dragged pane gates
    // reveal + drop legality (an operator pane never targets an app-graph zone);
    // each threshold-crossing commits ONE reveal write (W2-Q7/F4).
    this.dragController = createDragController({
      threshold: 24,
      scopeOf: (paneId) => this.registry.get(paneId)?.scope ?? null,
      onRevealChange: (zones) => {
        this.revealedZones = [...zones]
        this.rerenderAppGraph()
      },
    })
    // U-SHELL-5 (C7) — the shell gutter controller. The commit seam applies the
    // clamped size + persists via ONE `setLayout`; the resizability gate reads
    // the same enabled+placed census the assembler uses for `is-empty` (§2.3).
    this.gutterController = createGutterController({
      onCommit: (zone, size) => this.commitGutterSize(zone, size),
      isResizable: (zone) => {
        const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
        const count = enabledZonePaneCounts(this.registry, base)[zone]
        return isGutterResizable(count === 0, base.zones[zone]?.minimized === true)
      },
    })
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

  /** U-SHELL-9a §2.4 (HOST-2) — the REAL default-resolution context for the
   *  first-tab default: the focused store's documents (the doc-heads snapshot)
   *  + the previous session's most-recently-focused document. `hasStore` is
   *  true once a store snapshot or any document is known. */
  getTabContext(): TabDefaultContext {
    const documents = (this.lastDocHeads ?? []).map((d) => ({ documentId: d.documentId, title: d.title }))
    return {
      hasStore: this.lastStore != null || documents.length > 0,
      lastFocusedDocumentId: this.lastOperatorSettings?.defaultDocumentId ?? this._currentDocumentId,
      documents,
    }
  }

  /** U-SHELL-9a §2.3 (HOST-1) — the host stage-mount seam. Mounts the active
   *  `TabEntry`'s provident body in the central stage and unmounts the previous
   *  one (single-active render): a `document` target drives the existing
   *  single-document render path (the scoped traversal); the landing target
   *  renders the landing/wikis listing; a `search` target renders the search
   *  body; parked kinds render a placeholder. `null` clears the mounted body. */
  mountTab(entry: TabEntry | null): void {
    if (entry == null) {
      this.mountedStageKey = null
      this.mountedDocumentIds = []
      return
    }
    const key = JSON.stringify(entry)
    if (key === this.mountedStageKey) return
    const target = entry.target
    if (target.kind === 'document') {
      this.mountedStageKey = key
      this.mountedDocumentIds = [target.documentId]
      this.mountDocumentStage(target.documentId)
      return
    }
    if (target.kind === 'search') {
      this.mountedStageKey = key
      this.mountedDocumentIds = []
      void this.mountSearchStage(entry)
      return
    }
    this.mountedStageKey = key
    this.mountedDocumentIds = []
    const isLanding = target.kind === 'other' && target.id === 'landing'
    const body = isLanding
      ? landingContent({
          documents: this.lastDocHeads ?? [],
          stores: this.lastStoreListing?.stores ?? [],
        })
      : { type: 'div', props: { id: 'stage-placeholder-' + target.kind, 'data-stage': 'placeholder' }, children: [{ type: 'p', content: `(${target.kind})` }] }
    this.applyStageBody(body)
  }

  /** U-SHELL-9b §2.1 (C14) — mount ALL open document tabs simultaneously. The
   *  9a single-active policy is superseded here: every open `document` tab's
   *  body is materialized as a distinct root in the one graph (the
   *  CROSS-DOCUMENT-SHARED prerequisite), and the mounted set is recorded so a
   *  later content change repopulates every root in place through the
   *  U-STATE-1e N-root reconcile (no `loadEnvelope`/teardown). Non-document
   *  entries in the list are ignored (they are not document bodies). */
  mountTabs(entries: TabEntry[]): void {
    const ids: string[] = []
    for (const e of Array.isArray(entries) ? entries : []) {
      if (e?.target?.kind === 'document' && typeof e.target.documentId === 'string' && e.target.documentId !== '') {
        if (!ids.includes(e.target.documentId)) ids.push(e.target.documentId)
      }
    }
    this.mountedDocumentIds = ids
    if (ids.length === 0) {
      this.mountedStageKey = null
      return
    }
    this.mountedStageKey = null // a multi/simultaneous mount — no single-active key
    if (this.runtime == null || this.lastSnapshot == null) return
    this.applyDocumentSet(this.lastSnapshot, ids, null)
  }

  /** The scoped single-document render for a `document` tab target (reuses the
   *  same `buildTraversalEnvelope` scoping boot/re-derive use). Falls back to
   *  the async `selectDocument` seam when no snapshot is cached yet. */
  private mountDocumentStage(documentId: string): void {
    if (this.lastSnapshot == null || !this.lastDocHeads?.some((d) => d.documentId === documentId)) {
      // No cached snapshot or an unknown document — reuse the async scoped
      // selection seam (it validates against the doc-heads and re-derives).
      this.selectDocument(documentId)
      return
    }
    if (this.runtime == null) return
    this.setCurrentDocumentId(documentId)
    const traversalEnvelope = this.buildTraversalEnvelope(this.lastSnapshot, [documentId])
    this.loadAppGraph(this.runtime, traversalEnvelope)
  }

  /** The search-tab body: re-run the tab's stored query and render the derived
   *  results (HOST-5). Re-runs in place; the tab is not re-created. */
  private async mountSearchStage(entry: TabEntry): Promise<void> {
    const params = entry.search
    const query = params?.query ?? ''
    let results: unknown[] = []
    let error: string | null = null
    if (query !== '') {
      try {
        const result = (await this.bridge.rag.query(query, params?.topK, undefined, {
          mode: params?.mode,
          maxHops: params?.maxHops,
          expand: params?.expand,
          maxParentContext: params?.maxParentContext,
          filters: params?.filters as never,
          stores: params?.stores,
        })) as SearchResult
        results = (result?.results ?? result?.ranked ?? []) as unknown[]
      } catch (e) {
        error = e instanceof Error ? e.message : String(e)
      }
    }
    if (this.runtime == null) return
    this.applyStageBody(searchTabContent(entry, { results, error }))
  }

  /** Wrap a stage body node in a content payload targeting the traversal zone
   *  and assemble/load it into the app Runtime (panes included). */
  private applyStageBody(body: LegacyNodeData): void {
    if (this.runtime == null) return
    const envelope: LegacyInitialData = {
      template: this.template,
      content: [{ content: [{ ...body, placement: { targetPlacement: [this.zoneName] } }] }],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    this.loadAppGraph(this.runtime, envelope)
  }

  /** W2-N1 (§2.5) — the layout write-through seam. A layout mutation
   *  (U-SHELL-3/4/5/8/9) calls this ONCE per gesture: the coerced layout is
   *  cached for the next assemble AND committed through
   *  `bridge.operatorSettings.set({ layout })` (the main store persists; the
   *  broadcast drives the re-derive). A failed write still applies for the
   *  session (F7 — the in-memory layout is authoritative until restart). */
  setLayout(layout: LayoutState): void {
    this.layout = coerceLayout(layout)
    // H5 (adversarial) — the persist is best-effort: a bridge (or test host)
    // that predates/lacks the `operatorSettings` surface must NOT throw — the
    // in-memory layout stays authoritative for the session (F7). The guard
    // wraps the property access AND the call (an absent/short surface).
    const surface = this.bridge.operatorSettings
    const set = surface?.set
    if (typeof set !== 'function') return
    void set.call(surface, { layout: this.layout }).catch((e) => {
      console.error('[sidebar-panes] operator settings layout set failed', e)
    })
  }

  /** Register the concrete panes (doc-nav/crosslinks/search/template-editor
   *  app-graph + settings operator) + enable the app-graph panes + the settings
   *  pane. */
  registerPanes(): void {
    this.registry.register({
      id: 'doc-nav',
      title: 'Documents',
      scope: 'app-graph',
      render: (ctx: PaneContext) =>
        docNavContent(ctx, { expandedPaths: [...this.expandedDocFolders] }),
    })
    this.registry.register({
      id: 'crosslinks',
      title: 'Links',
      scope: 'app-graph',
      render: (ctx: PaneContext) =>
        crosslinksContent(ctx, this.lastBacklinks, {
          hoverPreviewId: this.hoverPreview.activeId,
          hoverPreviewPosition: this.hoverPreviewPosition,
        }),
    })
    this.registry.register({
      id: 'search',
      title: 'Search',
      scope: 'app-graph',
      render: (ctx: PaneContext) =>
        searchContent(ctx, this.lastQueryResult, {
          expanded: this.advancedSearchOpen,
          documentFilters: this.advancedSearchDocumentFilters,
          error: this.advancedSearchError,
        }),
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

  /** Unit U-MENU-1 §2.2 — project the live registry into the catalog the native
   *  View → Panes submenu consumes. */
  private paneCatalog(): PaneCatalogEntry[] {
    return this.registry.list().map((p) => ({
      id: p.id,
      title: p.title,
      scope: p.scope,
      enabled: this.registry.isEnabled(p.id),
    }))
  }

  /** Unit U-MENU-1 §2.2 — push the catalog to main. A no-op when the bridge
   *  predates the menu surface; a bridge throw never aborts boot/registration. */
  private pushPaneCatalog(): void {
    const push = this.bridge.pushPaneCatalog?.bind(this.bridge)
    if (!push) return
    try {
      push(this.paneCatalog())
    } catch {
      // never abort boot / a registry change on a bridge error
    }
  }

  /** U-SHELL-8 §2.6 pin 1 — the scope-correct persisted enable sets, computed
   *  from the live registry. `enabledPanes` = the enabled app-graph ids;
   *  `enabledOperatorPanes` = the enabled operator ids. Both are written on
   *  every visibility change so the C9 carrier round-trips regardless of scope. */
  private persistEnabledPanes(): void {
    const surface = this.bridge.operatorSettings
    const set = surface?.set
    if (typeof set !== 'function') return
    const enabledPanes = this.registry
      .listByScope('app-graph')
      .filter((p) => this.registry.isEnabled(p.id))
      .map((p) => p.id)
    const enabledOperatorPanes = this.registry
      .listByScope('operator')
      .filter((p) => this.registry.isEnabled(p.id))
      .map((p) => p.id)
    const patch: OperatorSettingsPatch = { enabledPanes, enabledOperatorPanes, panesInitialized: true }
    // F7 — the persist is best-effort: a failed/throwing write must NOT undo the
    // in-memory enablement (the registry is already updated before this call).
    try {
      const result = set.call(surface, patch)
      if (result != null && typeof (result as Promise<unknown>).catch === 'function') {
        void (result as Promise<unknown>).catch((e) => {
          console.error('[sidebar-panes] operator settings pane-visibility set failed', e)
        })
      }
    } catch (e) {
      console.error('[sidebar-panes] operator settings pane-visibility set failed', e)
    }
  }

  /** U-SHELL-8 §2.6 pin 1 — apply the persisted scope enable sets at boot. An
   *  EMPTY list for a scope keeps the registration defaults (all enabled) until
   *  the operator's FIRST visibility write sets `panesInitialized`; from then on
   *  an empty list means NONE enabled (H2 — so "hide every pane" round-trips).
   *  A non-empty list is authoritative for that scope. An id that is not a
   *  registered pane (F3/H1) or whose registry scope does not match the list
   *  (H4) is dropped + warned BEFORE the authority computation — an unknown-only
   *  list therefore drops to empty (defaults) instead of blinding the scope. */
  private applyPersistedPaneVisibility(settings: OperatorSettings | null): void {
    // H3 — a toggle that landed while boot awaited the settings fetch wins; do
    // not overwrite it with the stale boot-fetched sets.
    if (this.paneVisibilityTouched) return
    const appDefs = this.registry.listByScope('app-graph')
    const opDefs = this.registry.listByScope('operator')
    const appIds = new Set(appDefs.map((p) => p.id))
    const opIds = new Set(opDefs.map((p) => p.id))
    const allIds = new Set(this.registry.list().map((p) => p.id))
    const scopeList = (raw: unknown, scopeIds: Set<string>, scope: string): string[] => {
      if (!Array.isArray(raw)) return []
      const kept: string[] = []
      for (const p of raw) {
        if (typeof p !== 'string' || p === '') continue
        if (scopeIds.has(p)) {
          if (!kept.includes(p)) kept.push(p)
          continue
        }
        if (typeof console !== 'undefined' && typeof console.warn === 'function') {
          // Distinguish a registered wrong-scope id (H4) from an unregistered id
          // (F3) — both are dropped, but the diagnostic says which.
          const reason = allIds.has(p) ? `registered in a different scope, not "${scope}"` : 'unregistered'
          console.warn(`[sidebar-panes] dropping persisted pane-visibility id "${p}" (${reason})`)
        }
      }
      return kept
    }
    const appList = scopeList(settings?.enabledPanes, appIds, 'app-graph')
    const opList = scopeList(settings?.enabledOperatorPanes, opIds, 'operator')
    // H2 — the first-run default is all-enabled; once `panesInitialized` is set
    // the operator has expressed an explicit set, so empty means none.
    const emptyMeansEnabled = settings?.panesInitialized !== true
    for (const p of appDefs) {
      this.registry.setEnabled(p.id, appList.length === 0 ? emptyMeansEnabled : appList.includes(p.id))
    }
    for (const p of opDefs) {
      this.registry.setEnabled(p.id, opList.length === 0 ? emptyMeansEnabled : opList.includes(p.id))
    }
  }

  /** U-SHELL-8 §2.6 pin 2 — the `IPC_PANE_VISIBILITY` handler (spec §2.2). A
   *  malformed payload is ignored (F2); an unregistered id is ignored (F1). For
   *  an app-graph pane the visibility toggle routes through the edit
   *  controller's dirty-edit guard → the U-STATE-1 content reconcile
   *  (pane-additive, no `loadEnvelope`); an operator pane re-mounts only its
   *  isolated scope. The C9 carrier is persisted in both cases. */
  private onPaneVisibilityChange = (change: unknown): void => {
    if (change == null || typeof change !== 'object') return
    const rec = change as { id?: unknown; enabled?: unknown }
    if (typeof rec.id !== 'string' || rec.id === '') return
    if (typeof rec.enabled !== 'boolean') return
    const def = this.registry.get(rec.id)
    if (def == null) return // F1 — an unregistered id is ignored (no phantom, no write)
    // H3 — mark that a toggle landed so a boot apply still awaiting its stale
    // settings fetch cannot clobber it.
    this.paneVisibilityTouched = true
    this.registry.setEnabled(rec.id, rec.enabled)
    this.persistEnabledPanes()
    if (def.scope === 'operator') {
      this.refreshOperator()
    } else {
      // F4 — the dirty-edit guard queues the additive content reconcile while an
      // edit is dirty (never a full `loadEnvelope`).
      this.editController.requestRebuild('content')
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
    // Unit U-EDIT-1 (C8) — the APP-GRAPH editor-toolbar toggle handler. Unlike
    // the operator handler, this one IS MCP-reachable: the app Runtime resolves
    // the name-referenced body so `provident.dispatch` on `editor-toolbar-toggle`
    // flips the mode. Registered in the FULL function-expression form.
    registerHandlerDef(EDITOR_TOOLBAR_TOGGLE_HANDLER, { name: EDITOR_TOOLBAR_TOGGLE_HANDLER, body: EDITOR_TOOLBAR_TOGGLE_HANDLER_BODY })
    // Unit U-H8 — the 7 operator-registry-manage handlers are NOT registered in
    // the global app-graph registry (HOST-H8-1, HIGH security): the operator
    // isolate scope's nodes carry INLINE full-expression bodies (the operator
    // scope does not need the global name-addressable table). Registering them
    // globally let a `code.set`-crafted template whose `main` zone carries
    // `handlers:[{name:'operator-rag-manage-confirm'}]` + `props:{'data-op':
    // 'remove','data-store':'<non-default>'}` name-resolve the DESTRUCTIVE body
    // in the APP Runtime after a re-derive → `provident.dispatch` could drive
    // hotRemove/hotSetDefault/etc. with `confirmed:true` (a falsified A-P2-6/
    // A-P2-7 + §5.8 boundary). The 7 defs are therefore NEVER registered here —
    // the app Runtime's `resolveNameReferencedHandlerBodies` has nothing to
    // resolve, so the operator-UI IPC surface stays operator-only.
  }

  /** Build the base PaneContext from the current host-owned state + backRefs +
   *  the traversal crosslinks + the last-fetched pane data. */
  buildContext(): PaneContext {
    return {
      snapshot: this.lastSnapshot,
      docHeads: this.lastDocHeads,
      currentDocumentId: this._currentDocumentId,
      currentNodeId: this._currentNodeId,
      backRefs: this.backRefs,
      crosslinks: this.lastCrosslinks,
    }
  }

  /** Build the TemplatePaneContext (PaneContext + template + targetedZones +
   *  the last validate verdict). */
  buildTemplateContext(): TemplatePaneContext {
    return {
      ...this.buildContext(),
      template: this.template,
      targetedZones: this.targetedZones,
      validation: this.templateValidation,
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
      // W2-N1 (§2.5) — the persisted layout overlay (null → derive the default).
      layout: this.layout ?? undefined,
      // U-SHELL-4 (C11) — the drag-time provisional drop-target zones.
      revealedZones: this.revealedZones,
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
    // Unit U-EDIT-1 (C8) — author the central-stage editor-toolbar toggle into
    // the assembled APP graph (independent of mode — the control is present in
    // both textarea + contenteditable modes and reflects the current one). Runs
    // AFTER applyEditingMode and BEFORE recomputeBackRefs (the toolbar is not a
    // `rag-`-prefixed root, so it contributes nothing to the backRefs).
    this.applyEditorToolbar(result.envelope, this.editingMode)
    // M14 — recompute the backRefs from the ASSEMBLED envelope (the node ids the
    // loaded graph actually mints), AFTER assembly and BEFORE load.
    const assembledBackRefs = this.recomputeBackRefs(result.envelope)
    this.backRefs.clear()
    for (const [k, v] of assembledBackRefs) this.backRefs.set(k, v)
    this.lastTraversalEnvelope = traversalEnvelope
    runtime.loadEnvelope(result.envelope)
    this.appLoaded = true
    return result
  }

  /** U-STATE-1b — the CONTENT-only repopulation path. Processes the traversal
   *  envelope (textarea readOnly + editingMode, as the assembly path does),
   *  reconciles the document content roots against the LIVE graph, and applies
   *  only the changed roots via `Runtime.applyContentReconcile` — no teardown,
   *  node identity + graph-resident state survive, the operator pane untouched.
   *  backRefs is recomputed from the new content (Decision 3). */
  private applyContentChange(traversalEnvelope: LegacyInitialData): void {
    if (!this.runtime) return
    // Assemble the PANE-INCLUSIVE envelope (documents + app-graph panes) so the
    // panes are reconciled alongside the document roots (HOST-PANE-STALE-ON-
    // CONTENT-CHANGE) — not just the `rag-` document subtrees.
    const assembled = assembleAppGraphEnvelope({
      traversalEnvelope,
      registry: this.registry,
      ctx: this.buildTemplateContext(),
      sidebarZone: this.sidebarZone,
      // W2-N1 (§2.5) — keep the persisted layout on a content-only repopulate.
      layout: this.layout ?? undefined,
      // U-SHELL-4 (C11) — keep the drag-time reveal set on a content repopulate.
      revealedZones: this.revealedZones,
    })
    const env = assembled.envelope
    this.setTextareaReadOnly(env)
    this.applyEditingMode(env, this.editingMode)
    // Unit U-EDIT-1 (C8) — keep the app-graph editor toolbar in the reconciled
    // envelope (the toolbar is a non-`rag-`/`pane-` root → NOT a reconcile
    // bucket; it must already be present from boot and survives the content-only
    // reconcile). Author it fresh so the reflected mode is current.
    this.applyEditorToolbar(env, this.editingMode)
    // U-STATE-1e — reconcile through the N-root (document-scoped) surface. The
    // current document is the open-document scope; the merged pane-inclusive
    // `env` is the runtime's `next` payload supply. (The simultaneous
    // multi-document mount is U-SHELL-9b; this host path already accepts N
    // scoped envelopes.)
    const documentId = this._currentDocumentId ?? ''
    const previous: DocumentRoot[] = this.runtime
      .materializedContentRoots()
      .map((root) => ({ documentId, root }))
    const result = reconcileDocumentRoots({
      previous,
      next: [{ documentId, envelope: env }],
      change: this.pendingContentChange,
      documentIds: [documentId],
    })
    this.runtime.applyContentReconcile({
      result,
      next: env,
      documents: [{ documentId, envelope: env }],
    })
    // U-SHELL-8 (C11/V4-V5) — the content reconcile refreshes the `rag-`/`pane-`
    // content roots ONLY. A pane-visibility toggle that empties (or repopulates)
    // a zone must also re-emit that zone container's state-derived
    // `is-empty`/`is-minimized` mirror; otherwise the zone's mirror drifts from
    // the census (V4/V5). The assembler computed the fresh classes into `env`'s
    // template, so sync them onto the LIVE zone nodes through the managed
    // state-slice channel — pane-additive, no `loadEnvelope`/teardown, stable
    // `zone:*` identities (C10/§2.5).
    this.syncZoneMirrors(env)
    const refs = this.recomputeBackRefs(env)
    this.backRefs.clear()
    for (const [k, v] of refs) this.backRefs.set(k, v)
    this.lastTraversalEnvelope = traversalEnvelope
    this.pendingContentChange = null
  }

  /** U-SHELL-9b §2.1 (C14) — the simultaneous multi-document mount/repopulate
   *  path. Builds one traversal envelope PER open document (so each root is
   *  unambiguously scoped), assembles the pane-inclusive envelope from the
   *  first document (+ appends the remaining documents' content), and reconciles
   *  ALL roots through the U-STATE-1e N-root `reconcileDocumentRoots` →
   *  `Runtime.applyContentReconcile` (no `loadEnvelope`/teardown; every mounted
   *  root survives a content change). */
  private applyDocumentSet(
    snapshot: RagSnapshotPayload,
    documentIds: string[],
    change: ReconcileChange | null,
  ): void {
    if (this.runtime == null || documentIds.length === 0) return
    // The merged traversal envelope (the refresh() re-load source).
    const mergedTraversal = this.buildTraversalEnvelope(snapshot, documentIds)
    // One envelope per document (the N-root `next` scoping).
    const perDoc = documentIds.map((documentId) => ({
      documentId,
      envelope: this.buildTraversalEnvelope(snapshot, [documentId]),
    }))
    const assembled = assembleAppGraphEnvelope({
      traversalEnvelope: perDoc[0].envelope,
      registry: this.registry,
      ctx: this.buildTemplateContext(),
      sidebarZone: this.sidebarZone,
      layout: this.layout ?? undefined,
      revealedZones: this.revealedZones,
    })
    const env = assembled.envelope
    // Append the remaining documents' content so `applyContentReconcile`'s
    // `next` payload supplies every root's node data.
    for (let i = 1; i < perDoc.length; i += 1) {
      env.content = [...(env.content ?? []), ...(perDoc[i].envelope.content ?? [])]
    }
    this.setTextareaReadOnly(env)
    this.applyEditingMode(env, this.editingMode)
    this.applyEditorToolbar(env, this.editingMode)
    // The first document's envelope is the assembled env (it carries the panes
    // so pane roots are in the reconcile set); the remaining are their scoped
    // traversals. Panes are `pane-`-prefixed → reconciled globally by the
    // N-root reconciler regardless of their tracked document scope.
    perDoc[0] = { documentId: perDoc[0].documentId, envelope: env }
    const result = reconcileDocumentRoots({
      previous: this.runtime.materializedDocumentRoots(),
      next: perDoc,
      change,
      documentIds,
    })
    this.runtime.applyContentReconcile({ result, next: env, documents: perDoc })
    this.syncZoneMirrors(env)
    const refs = this.recomputeBackRefs(env)
    this.backRefs.clear()
    for (const [k, v] of refs) this.backRefs.set(k, v)
    this.lastTraversalEnvelope = mergedTraversal
    this.pendingContentChange = null
  }

  /** U-SHELL-8 (C11/V4-V5) — re-emit the `zone:<name>` container mirror classes
   *  after a pane-additive content reconcile. `applyContentReconcile` reconciles
   *  only content roots (`rag-`/`pane-`), so a visibility toggle that empties or
   *  repopulates a zone leaves that zone container's state-derived
   *  `is-empty`/`is-minimized` mirror stale (a fresh boot renders it correctly;
   *  the toggle path did not). The assembler authored the fresh classes into the
   *  assembled template; apply them to the LIVE zone nodes through the managed
   *  `state-slice` channel (pane-additive — no `loadEnvelope`/teardown, `zone:*`
   *  identities stable). A zone whose mirror already matches is untouched (no
   *  redundant managed write). */
  private syncZoneMirrors(envelope: LegacyInitialData): void {
    if (this.runtime == null) return
    const children = (envelope.template?.root?.children ?? []) as Array<{
      props?: { id?: unknown }
      placement?: { placementName?: unknown }
      css?: { classes?: unknown }
    }>
    for (const zone of LAYOUT_PANE_ZONES) {
      const container = children.find(
        (c) => c?.placement?.placementName === zone || c?.props?.id === `zone:${zone}`,
      )
      const desired = Array.isArray(container?.css?.classes)
        ? (container.css.classes as unknown[]).map(String)
        : []
      if (sameClassSet(this.currentZoneMirror(zone), desired)) continue
      this.runtime.applyCommand({
        kind: 'state-slice',
        node: `zone:${zone}`,
        mutation: [{ targetProp: 'css.classes', mode: 'replace', value: desired }],
      })
    }
  }

  /** The live `zone:<name>` container's resolved mirror classes (empty when the
   *  runtime/zone is not resolvable — never throws). */
  private currentZoneMirror(zone: LayoutZoneName): string[] {
    if (this.runtime == null) return []
    try {
      const states = this.runtime.nodeState(`zone:${zone}`).states as Array<{
        css?: { classes?: unknown }
      }>
      const classes = states[0]?.css?.classes
      return Array.isArray(classes) ? classes.map(String) : []
    } catch {
      return []
    }
  }

  /** Mount the operator settings pane in its OWN isolated GraphScope (the
   *  SecurePanels pattern) from the enabled operator panes. U-STATE-1c:
   *  IDEMPOTENT — the isolated scope + adapter are created ONCE; later calls
   *  rebuild only the operator CONTENT (so `settingsContent` re-evaluates with
   *  fresh settings) and re-render the EXISTING scope/adapter (no
   *  `createIsolatedScope`/`replaceChildren`/new `DomAdapter`). */
  mountOperator(): void {
    if (this.operatorScope == null || this.operatorAdapter == null) {
      // The DomAdapter's endBatch APPENDS roots to the mount and never clears
      // it, so the FIRST mount (fresh adapter + prevMap=null) must clear the
      // container — otherwise the settings element duplicates. On later calls
      // the retained prevMap drives a proper diff (no clear, no duplicate).
      const mount = this.operatorMount as unknown as { replaceChildren?: () => void; children?: unknown[] }
      if (typeof mount.replaceChildren === 'function') mount.replaceChildren()
      else if (Array.isArray(mount.children)) mount.children.length = 0
      this.operatorScope = createIsolatedScope()
      this.operatorAdapter = new DomAdapter(this.operatorMount, { onEvent: this.handleOperatorEvent })
      this.operatorPrevMap = null
    }
    const envelope = buildOperatorEnvelope(this.registry, this.buildTemplateContext())
    const hub = createLinkHub()
    const t = translateLegacy(envelope, { hub, graphScope: this.operatorScope })
    // provident-ssr 0.4.1 — release the previous operator Supervisor's module-
    // level finalize hook + node maps before replacing it (ENG-SUPERVISOR-HOOK-
    // ACCUMULATION). Idempotent; a no-op on the first mount.
    this.operatorSupervisor?.dispose()
    this.operatorSupervisor = new Supervisor({ events: new EventBridge(), graphScope: this.operatorScope })
    for (const n of t.nodes) this.operatorSupervisor.registerNode(n)
    this.operatorRoot = t.root
    this.operatorNodes = t.nodes
    this.renderOperator()
  }

  /** U-STATE-1c — re-render the EXISTING operator graph (no scope/adapter
   *  re-create). Rebuilds the operator content so settings re-evaluate. */
  refreshOperator(): void {
    this.mountOperator()
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
      // W2-N1 (§2.5) — refresh the layout overlay alongside the settings.
      if (this.lastOperatorSettings.layout != null) {
        this.layout = coerceLayout(this.lastOperatorSettings.layout)
      }
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
    // H3 — a fresh boot: clear the toggle-during-boot guard before the pane
    // registration + settings fetch below.
    this.paneVisibilityTouched = false
    this.registerPanes()
    this.bindHandlers()
    this.installSidebarBridge()
    // U-SHELL-8 §2.6 pin 2 — subscribe to the native View → Panes visibility
    // action at boot (the `IPC_PANE_VISIBILITY` seam U-MENU-1 routes). Guarded
    // for hosts/tests whose bridge predates the menu surface.
    if (typeof this.bridge.onPaneVisibility === 'function') {
      this.unsubPaneVisibility = this.bridge.onPaneVisibility((change) => this.onPaneVisibilityChange(change))
    }
    // Unit U-MENU-1 §2.2 — push the pane catalog (boot) so the native
    // View → Panes submenu is data-driven, then re-push on every registry
    // change. Guarded for hosts/tests whose bridge predates the menu surface.
    this.pushPaneCatalog()
    if (typeof this.registry.onChanged === 'function') {
      this.unsubRegistry = this.registry.onChanged(() => this.pushPaneCatalog())
    }
    // Fetch the RAG snapshot (a bridge error ABORTS the boot — caught + logged).
    let snapshot: RagSnapshotPayload
    try {
      snapshot = await this.bridge.rag.snapshot()
    } catch (e) {
      console.error('[sidebar-panes] snapshot fetch failed', e)
      return
    }
    this.lastSnapshot = snapshot
    this.lastStore = snapshot.store
    // Unit V3 — fetch the doc-heads (the doc-nav's data source). A bridge error
    // ABORTS the boot (the placeholder envelope stays rendered; caught + logged,
    // never a crash — the same discipline as the snapshot fetch).
    try {
      const docHeads = await this.bridge.rag.docHeads()
      this.lastDocHeads = docHeads.documents
    } catch (e) {
      console.error('[sidebar-panes] doc-heads fetch failed', e)
      return
    }
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
    // without this fetch `this.editingMode` would stay 'contenteditable' until a
    // broadcast, and a later re-derive would flip the control without the graph.
    // Same coercion as onOperatorSettingsChanged: only 'textarea' passes, else
    // 'contenteditable' (the default edit mode). A bridge error keeps the
    // default (contenteditable) + null lastOperatorSettings (never a crash).
    try {
      const settings = await this.bridge.operatorSettings.get()
      this.lastOperatorSettings = settings
      this.editingMode = settings.editingMode === 'textarea' ? 'textarea' : 'contenteditable'
      // W2-N1 (§2.5) — honor the persisted layout from the very first assemble.
      this.layout = settings.layout != null ? coerceLayout(settings.layout) : null
      // U-SHELL-8 §3 state 1 — apply the persisted pane-visibility enable sets
      // BEFORE the first assemble/mount so the first render reflects them.
      this.applyPersistedPaneVisibility(settings)
    } catch {
      // keep the default editingMode (contenteditable) + null lastOperatorSettings
    }
    // U-MS5 — the read-only store listing (the operator's Phase-1 census). A
    // bridge error does NOT abort the boot (a display-only surface — the boot
    // must not depend on it; keep null → the '(stores unavailable)' placeholder).
    // Deliberately DIVERGES from the snapshot/docHeads/template abort discipline
    // for exactly this reason.
    try {
      this.lastStoreListing = await this.bridge.rag.stores()
    } catch (e) {
      console.error('[sidebar-panes] store-listing fetch failed', e)
    }
    // SCOPED-LOAD (live finding) — render ONLY the current document at boot, not
    // the whole corpus. The document list (doc-nav) shows all heads; the content
    // window renders ONE document at a time, walking from its head via the
    // document links (the scoped-load fix). At boot the current document is the
    // first doc-head (sorted by id — the doc-nav's order), so the initial load
    // is a single-document traversal, not a full-graph render (which times out
    // on a large corpus). The current document is derived from the SNAPSHOT's
    // doc-head edges (the authoritative source), not `lastDocHeads` (the doc-nav
    // IPC can be empty even when the snapshot has documents). A persisted/
    // selected current document (set before boot) is honored.
    const documentIds = this.deriveDocumentIds(snapshot).sort((a, b) => a.localeCompare(b))
    const current = this._currentDocumentId ?? documentIds[0] ?? null
    if (current) this.setCurrentDocumentId(current)
    const renderIds = current ? [current] : []
    // U-SHELL-9b — record the boot-mounted document set (a single doc at boot;
    // a later `mountTabs` supersedes it with the simultaneous set).
    this.mountedDocumentIds = [...renderIds]
    const traversalEnvelope = this.buildTraversalEnvelope(snapshot, renderIds)
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
   *  template), then apply the change. `kind` (U-STATE-1b):
   *  - **content** — repopulate the document content roots ONLY via
   *    `reconcileDocumentRoots` + `Runtime.applyContentReconcile` (no teardown,
   *    no operator remount; node identity + graph-resident state survive).
   *  - **operator** — re-render the operator pane + the app graph (editingMode).
   *  - **template** — a full reload (the page structure changed).
   *  Async. */
  async reDerive(kind: RebuildKind = 'content'): Promise<void> {
    if (this.reDeriveInFlight) {
      this.reDeriveQueued = true
      this.reDeriveQueuedKind = mergeRebuildKind(this.reDeriveQueuedKind, kind)
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
      // Unit V3 — fetch the doc-heads (the doc-nav's data source). A bridge
      // error ABORTS the re-derive (the current graph stays rendered; caught +
      // logged, never a crash).
      let docHeads: RagDocHeadsPayload
      try {
        docHeads = await this.bridge.rag.docHeads()
      } catch (e) {
        console.error('[sidebar-panes] re-derive doc-heads fetch failed', e)
        return
      }
      // LOW-5 (adversarial): commit lastSnapshot + lastDocHeads TOGETHER, only
      // after BOTH fetches succeed — an aborted doc-heads fetch never leaves
      // lastSnapshot fresh while lastDocHeads is stale (a transient state
      // inconsistency).
      this.lastSnapshot = snapshot
      this.lastDocHeads = docHeads.documents
      this.lastStore = snapshot.store
      // F2 — refresh the M13 security cache on each re-derive so a runtime
      // security tightening (a group turned OFF after boot) is honored by the
      // handler gates. A bridge error leaves the gate fail-closed (null).
      try {
        this.security = await this.bridge.security.get()
      } catch {
        this.security = null
      }
      // M6 — the current-document state is the documentIds source.
      // U-SHELL-9b §2.1 (C14) — when several documents are mounted
      // simultaneously, they are ALL the document scope: a content change must
      // repopulate every mounted root (never unmount a sibling tab).
      const multi = this.mountedDocumentIds.length > 1
      const current = this._currentDocumentId
      const documentIds = multi
        ? [...this.mountedDocumentIds]
        : current
          ? [current]
          : this.deriveDocumentIds(snapshot)
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
      // U-STATE-1b — content changes repopulate the document content roots
      // ONLY (no teardown, no operator remount); operator/template/boot keep the
      // full reload path.
      if (kind === 'content' && this.appLoaded) {
        if (multi) this.applyDocumentSet(snapshot, documentIds, this.pendingContentChange)
        else this.applyContentChange(traversalEnvelope)
      } else {
        await this.refresh()
      }
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
        const queuedKind = this.reDeriveQueuedKind ?? 'content'
        this.reDeriveQueuedKind = null
        await this.reDerive(queuedKind)
      }
    }
  }

  /** The rag-store-changed handler: routes through the edit controller's
   *  dirty-edit guard (requestRebuild). */
  onRagStoreChanged(payload: RagStoreChangedPayload): void {
    // B5 — the fail-closed foreign-store drop: a broadcast for a store this
    // host is NOT rendering must NOT re-derive the unchanged default graph.
    // Fail-closed diagnostics (F-MS3-1): distinguish the drop branches so an
    // untyped/malformed producer cannot SILENTLY starve the re-derive —
    // (a) a malformed store (missing/undefined/non-string/empty) OR an
    // uncaptured host (`lastStore === null`) emits ONE pinned `console.warn`
    // (the malformed case and the null-lastStore defense case carry DISTINCT
    // messages); (b) a FOREIGN-store drop (a valid string !== the captured
    // name) stays SILENT by design (routine). The drop OUTCOME is unchanged
    // in every branch — the warn is diagnostic-only.
    if (this.lastStore === null) {
      console.warn('[sidebar] rag-store-changed dropped: no captured boot store (lastStore null)')
      return
    }
    if (typeof payload.store !== 'string' || payload.store === '') {
      console.warn(`[sidebar] rag-store-changed dropped: malformed store (payload had '${payload.store}')`)
      return
    }
    if (payload.store !== this.lastStore) return
    // U-STATE-1b — ACCUMULATE the change descriptor (a coalesced content change
    // may cover several broadcasts; overwriting would drop the earlier roots'
    // ids and miss their repopulation — adversarial finding 2). A structural
    // change is sticky.
    const prev = this.pendingContentChange
    this.pendingContentChange = {
      kind: payload.kind === 'structural' || prev?.kind === 'structural' ? 'structural' : 'content',
      nodeIds: [...new Set([...(prev?.nodeIds ?? []), ...(payload.nodeIds ?? [])])],
      edgeIds: [...new Set([...(prev?.edgeIds ?? []), ...(payload.edgeIds ?? [])])],
    }
    this.editController.requestRebuild('content')
  }

  /** The template-changed handler: updates the stored template + routes through
   *  the edit controller's dirty-edit guard (requestRebuild('template') — a
   *  template change alters the page structure, so a full reload). */
  onTemplateChanged(payload: TemplateChangedPayload): void {
    this.template = payload.template
    // A template change supersedes any pending content change descriptor.
    this.pendingContentChange = null
    this.editController.requestRebuild('template')
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
    // dereferenced (never throw); it coerces to the contenteditable default and
    // the handler STILL rebuilds (the broadcast is authoritative, not dropped).
    payload = (payload ?? { editingMode: 'contenteditable' }) as OperatorSettings
    this.lastOperatorSettings = payload
    this.editingMode = payload.editingMode === 'textarea' ? 'textarea' : 'contenteditable'
    // W2-N1 (§2.5) — the broadcast is authoritative; a payload carrying the
    // layout slice updates the overlay (a payload without it keeps the current).
    if (payload.layout != null) this.layout = coerceLayout(payload.layout)
    this.editController.requestRebuild('operator') // → reDerive('operator'): operator pane + app graph (editingMode)
    // An operator rebuild is not a content change; drop any stale descriptor so
    // it is not applied on a later content pass (adversarial finding 6).
    this.pendingContentChange = null
  }

  // ---- private helpers ----------------------------------------------------

  /** The operator settings pane content (M9 — the render reads
   *  `this.lastOperatorSettings`, NOT ctx). */
  private settingsContent(): LegacyNodeData {
    const s = this.lastOperatorSettings
    // U-MS5 — the read-only store listing (the operator's Phase-1 census).
    // Provident-authored data (PANE-PROVIDENT-AUTHORING); NO handlers on any
    // listing node (read-only; NO switcher — UI-SELECTOR-DEFERRED).
    const listing = this.lastStoreListing
    const storeRows: LegacyNodeData[] =
      listing == null
        ? [{ type: 'p', content: '(stores unavailable)' }]
        : listing.stores.length === 0
          ? [{ type: 'p', content: '(no stores)' }]
          : listing.stores.map((s) => ({
              type: 'div',
              props: {
                id: `operator-rag-store-${s.name}`,
                'data-store': s.name,
                'data-default': s.default ? 'true' : 'false',
                'data-status': s.status,
              },
              content: `${s.name} — default: ${s.default ? 'yes' : 'no'} — persistence: ${s.persistenceFile} — corpus: ${s.corpusRoot ?? '(project root)'} — status: ${s.status}`,
            }))
    return {
      type: 'section',
      children: [
        { type: 'h2', content: 'Settings' },
        { type: 'div', props: { id: 'operator-enabled-panes' }, content: (Array.isArray(s?.enabledPanes) ? s.enabledPanes : []).join(', ') },
        { type: 'div', props: { id: 'operator-default-document' }, content: s?.defaultDocumentId ?? '(all)' },
        { type: 'div', props: { id: 'operator-topk' }, content: `topK: ${s?.topK ?? 5}` },
        // Unit U1 §1.4 — the editingMode button-toggle. A text div shows the
        // CURRENT mode; a button (NOT a form control — the pivot) carries the
        // TOGGLED (other union member) mode in `data-mode` + the toggle-action
        // label. NO checked/selected boolean-attribute props are authored.
        {
          type: 'div',
          props: { id: 'operator-editing-mode' },
          content: `editingMode: ${s?.editingMode ?? 'contenteditable'}`,
        },
        {
          type: 'button',
          props: {
            id: 'operator-editing-mode-toggle',
            'data-mode': (s?.editingMode ?? 'contenteditable') === 'contenteditable' ? 'textarea' : 'contenteditable',
          },
          css: { classes: clickableClasses() },
          content: (s?.editingMode ?? 'contenteditable') === 'contenteditable' ? 'Switch to textarea' : 'Switch to contenteditable',
          handlers: [{ name: 'operator-editing-mode-toggle', event: 'click', body: OPERATOR_EDITING_MODE_TOGGLE_HANDLER }],
        },
        // U-MS5 — the read-only store-listing section (APPENDED as the LAST
        // child; NO handlers on any node — read-only, no switcher).
        {
          type: 'div',
          props: { id: 'operator-rag-stores' },
          children: [{ type: 'h3', content: 'RAG stores' }, ...storeRows],
        },
        // U-H8 — the operator registry-management section (provident-authored;
        // operator isolated scope; the ONLY registry-mutation surface — D6/A-P2-6).
        // Every control is envelope data + a function-string handler body reaching
        // `window.provident.sidebar.registryManage`/`registryManageDismiss`.
        ...this.buildOperatorManageSection(listing),
      ],
    }
  }

  /** U-H8 §5.5 — the provident-authored operator `registry-manage` section: the
   *  name-only ADD form, the per-store action rows (the default row carries ONLY
   *  Rename-default; non-default rows carry Remove/Rename/Set-default), the
   *  pending-confirmation strip (rendered ONLY when `pendingRegMgmt !== null`),
   *  and the error strip (rendered ONLY when `registryManageError !== null`).
   *  All nodes are provident envelope data — NO hand-written HTML/DOM. */
  private buildOperatorManageSection(listing: RagStoreListingPayload | null): LegacyNodeData[] {
    const rows: LegacyNodeData[] = (listing?.stores ?? []).map((s) => {
      const isDefault = s.default
      const named = s.name
      return {
        type: 'div',
        props: { id: `operator-rag-manage-row-${named}`, 'data-store': named },
        content: `${named}${isDefault ? ' (default)' : ''}`,
        children: [
          isDefault
            ? {
                type: 'div',
                props: { id: `operator-rag-manage-actions-${named}` },
                children: [
                  { type: 'input', props: { id: 'operator-rag-manage-renamedefault-input', value: '' } },
                  {
                    type: 'button',
                    props: { id: 'operator-rag-manage-renamedefault' },
                    css: { classes: clickableClasses() },
                    content: 'Rename default',
                    handlers: [{ name: 'operator-rag-manage-renamedefault', event: 'click', body: OPERATOR_RAG_RENAME_DEFAULT_BODY }],
                  },
                ],
              }
            : {
                type: 'div',
                props: { id: `operator-rag-manage-actions-${named}` },
                children: [
                  {
                    type: 'button',
                    props: { id: `operator-rag-manage-remove-${named}`, 'data-store': named },
                    css: { classes: clickableClasses() },
                    content: 'Remove',
                    handlers: [{ name: 'operator-rag-manage-remove', event: 'click', body: OPERATOR_RAG_REMOVE_BODY }],
                  },
                  { type: 'input', props: { id: `operator-rag-manage-rename-input-${named}`, value: '' } },
                  {
                    type: 'button',
                    props: { id: `operator-rag-manage-rename-${named}`, 'data-store': named },
                    css: { classes: clickableClasses() },
                    content: 'Rename',
                    handlers: [{ name: 'operator-rag-manage-rename', event: 'click', body: OPERATOR_RAG_RENAME_BODY }],
                  },
                  {
                    type: 'button',
                    props: { id: `operator-rag-manage-setdefault-${named}`, 'data-store': named },
                    css: { classes: clickableClasses() },
                    content: 'Set default',
                    handlers: [{ name: 'operator-rag-manage-setdefault', event: 'click', body: OPERATOR_RAG_SET_DEFAULT_BODY }],
                  },
                ],
              },
        ],
      }
    })
    const addForm: LegacyNodeData = {
      type: 'div',
      props: { id: 'operator-rag-manage-add' },
      children: [
        { type: 'input', props: { id: 'operator-rag-manage-add-name', value: '' } },
        {
          type: 'button',
          props: { id: 'operator-rag-manage-add-submit' },
          css: { classes: clickableClasses() },
          content: 'Add store',
          handlers: [{ name: 'operator-rag-manage-add', event: 'click', body: OPERATOR_RAG_ADD_BODY }],
        },
      ],
    }
    const p = this.pendingRegMgmt
    const confirmStrip: LegacyNodeData | null =
      p === null
        ? null
        : {
            type: 'div',
            props: {
              id: 'operator-rag-manage-confirm',
              'data-op': p.request.op,
              'data-store':
                p.request.op === 'add' || p.request.op === 'remove' || p.request.op === 'setDefault'
                  ? (p.request as { name?: string }).name ?? ''
                  : '',
              'data-from': (p.request as { from?: string }).from ?? '',
              'data-to': (p.request as { to?: string }).to ?? '',
            },
            children: [
              { type: 'p', content: p.summary },
              {
                type: 'button',
                props: { id: 'operator-rag-manage-confirm-yes' },
                css: { classes: clickableClasses() },
                content: 'Confirm',
                handlers: [{ name: 'operator-rag-manage-confirm', event: 'click', body: OPERATOR_RAG_CONFIRM_BODY }],
              },
              {
                type: 'button',
                props: { id: 'operator-rag-manage-confirm-no' },
                css: { classes: clickableClasses() },
                content: 'Cancel',
                handlers: [{ name: 'operator-rag-manage-dismiss', event: 'click', body: OPERATOR_RAG_DISMISS_BODY }],
              },
            ],
          }
    const errorStrip: LegacyNodeData[] =
      this.registryManageError === null
        ? []
        : [{ type: 'p', props: { id: 'operator-rag-manage-error' }, content: this.registryManageError }]
    const section: LegacyNodeData = {
      type: 'div',
      props: { id: 'operator-rag-manage' },
      children: [
        { type: 'h3', content: 'Manage RAG stores' },
        addForm,
        { type: 'div', props: { 'data-store-rows': '' }, children: rows },
        ...(confirmStrip == null ? [] : [confirmStrip]),
        ...errorStrip,
      ],
    }
    return [section]
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
    // The scoped walk reads the adjacency methods (edgesForDocument/edgesFrom/
    // edgesTo/docHeadForDocument), so the snapshot adapter MUST be
    // `createSnapshotStore` (amendment 4, Unit V1 §5.4) — a listNodes/
    // listEdges-only adapter would throw. The snapshot's `type` fields are
    // `string` (the IPC shape); the main process returns full `RagNode`/`RagEdge`
    // objects, so the cast is structural-only.
    const store = createSnapshotStore(snapshot.nodes as RagNode[], snapshot.edges as RagEdge[])
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
        // CONTENTEDITABLE MODE — do NOT produce the textarea editing overlay in
        // the render for ANY rag root (the user's requirement: no textareas in
        // contenteditable mode). The textarea is a textarea-mode artifact; in
        // contenteditable mode the rich editor (or plain text for non-eligible
        // roots) replaces it. Removed for ALL roots, not just rich-eligible ones.
        n.children = (n.children ?? []).filter(
          (child) => (child as LegacyNodeData).props?.id !== `textarea-${ragId}`,
        )
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

  /** Unit U-EDIT-1 (C8) — author the central-stage editor-toolbar toggle into
   *  the assembled app-graph envelope. The toolbar is a content root placed in
   *  the traversal's `zoneName` (MCP-visible, `provident.dispatch`-reachable);
   *  it reflects the CURRENT `editingMode` and its name-referenced click handler
   *  flips it. Appended fresh on every assemble so the reflected mode is current
   *  and no stale toolbar accumulates (the `content` array is a new array per
   *  assembly — the traversal envelope is never mutated). PURE authoring —
   *  provident data only, no hand-written DOM. */
  private applyEditorToolbar(envelope: LegacyInitialData, editingMode: EditingMode): void {
    if (!Array.isArray(envelope.content)) envelope.content = []
    envelope.content.push({ content: [editorToolbarContent(editingMode, this.zoneName)] })
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
      // U-SHELL-3 (C5) — the per-pane collapse toggle seam (the
      // `togglePaneCollapse` handler body reaches it).
      togglePaneCollapse: (id: string) => this.togglePaneCollapse(id),
      // U-SHELL-4 (C12) — the zone minimize/expand + tab-expand/select seams
      // (the inline `pane-zone-minimize-toggle`/`pane-tab-expand` handler bodies
      // reach them). Each commits ONE `setLayout` write-through.
      zoneMinimizeToggle: (zone: string) => this.zoneMinimizeToggle(zone),
      paneTabExpand: (zone: string, paneId: string) => this.paneTabExpand(zone, paneId),
      // U-PARITY-DOCNAV — the doc-nav folder toggle seam (the
      // `pane-doc-nav-toggle` handler body reaches it; same add/remove
      // re-derive path as selectDocument).
      docNavToggle: (key: string) => this.docNavToggle(key),
      submitQuery: (value: string) => void this.submitQuery(value),
      // U-PARITY-C18 — the advanced-search disclosure toggle + submit seams (the
      // `pane-search-advanced-*` handler bodies reach them).
      searchAdvancedToggle: () => this.searchAdvancedToggle(),
      submitAdvancedQuery: (value: string, options: AdvancedSearchQueryOptions) =>
        void this.submitAdvancedQuery(value, options ?? {}),
      // U-SHELL-9a §2.6 — the pane-first expand-to-tab seam.
      expandSearchTab: (value: string) => this.expandSearchTab(value),
      // HOST-4/HOST-5 — the search-result open + in-tab query edit seams.
      openDocumentTab: (id: string) => { this.tabs?.openDocumentTab?.(id) },
      searchTabQuery: (tabId: string, query: string) => { this.tabs?.editSearchQuery?.(tabId, { query }) },
      // U-PARITY-C19 — the link hover-preview shell seams (the
      // `hover-preview-*` handler bodies reach them). `enter`/`leave` cancel or
      // schedule the 0.5 s dismissal; the popup's own enter/leave are hoverable.
      hoverPreviewEnter: (id: string) => this.hoverPreview.enter(id),
      hoverPreviewLeave: () => this.hoverPreview.leave(),
      hoverPreviewPopupEnter: () => this.hoverPreview.enterPopup(),
      hoverPreviewPopupLeave: () => this.hoverPreview.leavePopup(),
      templateAdd: (zone: string) => void this.templateAdd(zone),
      templateRemove: (zone: string) => void this.templateRemove(zone),
      templateReset: () => void this.templateReset(),
      // W1-N5 — the template Validate result seam (the pane's `template-validate`
      // handler body reaches it). Records the verdict + re-derives so the pane's
      // inline valid/error feedback renders.
      templateValidateResult: (verdict: TemplateVerdict) => this.templateValidateResult(verdict),
      operatorSet: (patch: OperatorSettingsPatch) => void this.operatorSet(patch),
      // U-H8 — the operator-registry manage surface (the review §2 D6 ONE
      // operator-UI IPC exemption). The OPERATOR_RAG_* handler bodies reach these.
      registryManage: (request: RagStoreManageRequest) => void this.registryManage(request),
      registryManageDismiss: () => void this.registryManageDismiss(),
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
      // Unit GN-MCP-UI §5.5 — the gnosis GUI handler methods. The
      // `gnosis-status`/`gnosis-query` pane handler bodies reach them via the M2
      // `window.provident.sidebar` surface; they DELEGATE to the renderer-wired
      // `GnosisPanes` delegate (a no-op when no delegate is provided — never throw).
      gnosisStatus: () => { this.gnosis?.status?.() },
      gnosisQuery: (value: string) => { this.gnosis?.query?.(value) },
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
    // F8 (amendment 5) — validate against the doc-heads list (the doc-nav's data
    // source), not lastSnapshot.edges. A crafted/bogus id is ignored (no
    // re-derive with a phantom documentIds).
    if (!this.lastDocHeads || !this.lastDocHeads.some((d) => d.documentId === id)) return
    this.setCurrentDocumentId(id)
    this.editController.requestRebuild()
  }

  /** U-SHELL-3 (C5) — the per-pane collapse toggle. Flips
   *  `PaneLayoutEntry.collapsed` for the pane in the coerced layout and commits
   *  ONCE through the U-SHELL-1 `setLayout` write-through (the serialized
   *  `layout` update + persist). A pane not in the registry is a NO-OP (a stale
   *  id never mutates a sibling — F5). SYNCHRONOUS (the managed write fires; the
   *  settings broadcast drives the re-render). */
  private togglePaneCollapse(paneId: string): void {
    if (typeof paneId !== 'string' || paneId === '') return
    // F5 — a stale/unregistered pane id is a no-op (identity is stable).
    const def = this.registry.get(paneId)
    // H3 (adversarial) — only an ENABLED app-graph pane may write the persisted
    // layout; an operator-scope (isolated, never app-graph) pane or a disabled
    // pane is ignored, so it can never pollute the app-graph layout.
    if (def == null || def.scope !== 'app-graph' || !this.registry.isEnabled(paneId)) return
    const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
    const index = base.panes.findIndex((p) => p.id === paneId)
    if (index >= 0) {
      // H1 (adversarial) — an EXISTING entry is COLLAPSED-ONLY: its zone/order
      // are preserved (the toggle must never relocate/reorder the pane).
      const panes = base.panes.map((p, i) => (i === index ? { ...p, collapsed: p.collapsed !== true } : p))
      this.setLayout({ ...base, panes })
      return
    }
    // H1 (adversarial) — no entry yet: backfill the pane's DEFAULT placement
    // from `defaultZone`/`defaultOrder` (via `deriveLayout`, the same source
    // the assembler uses) instead of hardcoding `left`/`panes.length`.
    const enabledAppGraph = this.registry
      .listByScope('app-graph')
      .filter((p) => this.registry.isEnabled(p.id))
    const derived = deriveLayout(enabledAppGraph).panes.find((p) => p.id === paneId)
    const panes = [
      ...base.panes,
      {
        id: paneId,
        zone: derived?.zone ?? ('left' as const),
        order: derived?.order ?? base.panes.length,
        collapsed: true,
      },
    ]
    this.setLayout({ ...base, panes })
  }

  /** U-SHELL-4 (C12) — toggle a zone's stored `minimized` flag. A non-empty
   *  zone minimizes to a tab strip; an empty zone ignores minimize (F5 — C11
   *  empty-hidden wins). Commits ONCE through `setLayout`. A malformed zone is a
   *  NO-OP. SYNCHRONOUS. */
  private zoneMinimizeToggle(zone: string): void {
    if (!isLayoutZoneName(zone)) return
    const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
    // H2 (adversarial) — the acceptance census is the SAME enabled+placed count
    // the assembler uses for `is-empty` (post overlay + default fallback), NOT
    // the raw overlay: a fallback-placed pane makes the zone minimizable.
    const count = enabledZonePaneCounts(this.registry, base)[zone]
    this.setLayout(setZoneMinimized(base, zone, base.zones[zone].minimized !== true, count))
  }

  /** U-SHELL-4 (C12) — expand a minimized zone + select the clicked tab's pane.
   *  Expands (`minimized:false`, restoring the retained `size`) and commits ONCE
   *  through `setLayout`. The pane's `data-pane-id` identifies the selection (the
   *  live selection highlight is deferred to the battery block — no
   *  `LayoutState` selection field). A malformed zone is a NO-OP. SYNCHRONOUS. */
  private paneTabExpand(zone: string, paneId: string): void {
    if (!isLayoutZoneName(zone) || typeof paneId !== 'string' || paneId === '') return
    const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
    const count = base.panes.filter((p) => p.zone === zone).length
    this.setLayout(setZoneMinimized(base, zone, false, count))
  }

  /** U-SHELL-4 (C4) — the shell pointer wiring entry points. The renderer's
   *  pointer listeners drive the drag controller through these; a commit
   *  applies `movePane` and persists via ONE `setLayout` (spec §2.1 Table B). */
  startPaneDrag(paneId: string): void {
    // Re-hide any prior provisional reveal (one write if one was active), then
    // begin the new gesture.
    this.dragController.cancel()
    this.lastDragPoint = null
    this.lastDragZones = []
    this.dragController.start(paneId)
  }

  movePaneDrag(point: DragPoint, zones: readonly ZoneBounds[]): void {
    // U-SHELL-4 (C4/§3.1) — record the live pointer/zone geometry so the commit
    // can derive the insertion index (a within-zone drop lands where the pointer
    // is, not always at the end).
    this.lastDragPoint = point
    this.lastDragZones = Array.isArray(zones) ? zones : []
    this.dragController.move(point, zones)
  }

  revealZones(): readonly LayoutZoneName[] {
    return this.dragController.reveal()
  }

  cancelPaneDrag(): void {
    this.lastDragPoint = null
    this.lastDragZones = []
    this.dragController.cancel()
  }

  /** Commit the active drop: resolve the controller's `DropResult`, derive the
   *  within-zone insertion index from the recorded drop point (§3.1), apply
   *  `movePane` to the current layout, and persist via ONE `setLayout`. A
   *  self-drop that lands in the pane's current zone/order is a NO-OP (F2):
   *  zero `operatorSettings.set` writes and no order change. Returns the
   *  committed descriptor (null when the drop is rejected — no mutation). */
  commitPaneDrop(payload?: unknown): DropResult | null {
    const result = this.dragController.drop(payload)
    if (result == null) return null
    // A committed drop ends the gesture; clear the revealed drop-target mirror
    // (the controller reset its internal set silently — no extra crossing write).
    this.revealedZones = []
    const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
    // U-SHELL-4 (C4/§3.1) — when the controller did not pin an order, derive it
    // from the recorded drop point within the target zone's bounds. No recorded
    // point (a synthetic/index-less drop) → append (the prior behavior).
    let order = result.order
    if (order === undefined && this.lastDragPoint != null) {
      const bounds = this.lastDragZones.find((z) => z.zone === result.zone)
      if (bounds != null) {
        const slots =
          base.panes.filter((p) => p.zone === result.zone && p.id !== result.paneId).length + 1
        order = insertionIndexForPoint(this.lastDragPoint, bounds, slots)
      }
    }
    this.lastDragPoint = null
    this.lastDragZones = []
    const next = movePane(base, result.paneId, result.zone, order)
    // F2 — a drop of a pane onto its own current position changes neither the
    // zone nor the effective order → a no-op (0 writes, no order change).
    const before = base.panes.find((p) => p.id === result.paneId)
    const after = next.panes.find((p) => p.id === result.paneId)
    if (before != null && after != null && before.zone === after.zone && before.order === after.order) {
      return result
    }
    this.setLayout(next)
    return result
  }

  /** U-SHELL-5 (C7) — the shell gutter pointer wiring entry points. The
   *  renderer's pointer listeners drive the controller through these; the ONE
   *  commit at gesture end applies `setZoneSize` and persists via a single
   *  `setLayout` (W2-Q7/§2.1 — no per-move stream). */
  startGutter(zone: LayoutZoneName): void {
    this.gutterController.start(zone)
  }

  moveGutter(size: number): void {
    this.gutterController.move(size)
  }

  endGutter(): number | null {
    return this.gutterController.end()
  }

  cancelGutter(): void {
    this.gutterController.cancel()
  }

  resetGutter(zone?: LayoutZoneName): number | null {
    return this.gutterController.reset(zone)
  }

  previewGutter(): number | null {
    return this.gutterController.preview()
  }

  activeGutter(): LayoutZoneName | null {
    return this.gutterController.active()
  }

  /** U-SHELL-5 (C7) — apply a committed gutter size to the current layout and
   *  persist via ONE `setLayout` write-through (the U-SHELL-1 seam). */
  private commitGutterSize(zone: LayoutZoneName, size: number): void {
    const base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()
    this.setLayout(setZoneSize(base, zone, size))
  }

  /** `pane-doc-nav-toggle` — flip a folder's expanded state + re-derive (the
   *  doc-nav tree re-renders from the refreshed state; the revealed children are
   *  real app-graph nodes). The key is the folder's `data-folder-path`
   *  (`JSON.stringify(path[])`). An empty/malformed key is ignored. */
  private docNavToggle(key: string): void {
    if (typeof key !== 'string' || key === '') return
    if (this.expandedDocFolders.has(key)) this.expandedDocFolders.delete(key)
    else this.expandedDocFolders.add(key)
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

  /** `pane-search-advanced-toggle` — flip the disclosure state + re-derive (the
   *  search pane re-renders with the fields revealed/hidden). Mirrors the
   *  `docNavToggle` host seam. SYNCHRONOUS. */
  private searchAdvancedToggle(): void {
    this.advancedSearchOpen = !this.advancedSearchOpen
    this.editController.requestRebuild()
  }

  /** U-SHELL-9a §2.6 — the `pane-search-expand-tab` host seam: open the pane's
   *  current query as a full search tab (the optional tab-strip delegate). A
   *  missing delegate is a no-op (never throw). SYNCHRONOUS. */
  private expandSearchTab(value: string): void {
    this.tabs?.expandSearchTab(String(value ?? ''))
  }

  /** U-PARITY-C19 — re-render the EXISTING app graph after a hover-preview
   *  visibility change (the crosslinks pane re-authors the popup subtree from
   *  the controller's active id). No RAG re-traversal + no operator remount; the
   *  dirty-edit guard still applies (a re-render must not clobber an in-progress
   *  edit). SYNCHRONOUS. */
  private rerenderAppGraph(): void {
    if (this.editController.anyDirty()) return
    if (this.runtime && this.lastTraversalEnvelope) {
      this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)
    }
  }

  /** `pane-search-advanced-submit` — gate (M13) → `bridge.rag.query` with the
   *  advanced `options` → store the result → re-render the search pane. An
   *  empty query does nothing. F1/state 6 — a REJECTED engine call surfaces its
   *  message inline (`advancedSearchError`) and re-renders; it never throws. */
  private submitAdvancedQuery(value: string, options: AdvancedSearchQueryOptions): void {
    if (!value) return
    if (!this.security?.enabled.includes('rag')) return // fail-closed (M13)
    const rerender = (): void => {
      if (this.editController.anyDirty()) return
      if (this.runtime && this.lastTraversalEnvelope) {
        this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)
      }
    }
    void this.bridge.rag
      .query(value, this.lastOperatorSettings?.topK ?? 5, undefined, options ?? {})
      .then((result) => {
        this.lastQueryResult = result
        this.advancedSearchError = null
        rerender()
      })
      .catch((e: unknown) => {
        // Surface the engine fail-state inline (never an unhandled rejection).
        this.advancedSearchError = e instanceof Error ? e.message : String(e)
        rerender()
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

  /** W1-N5 (U-PARITY-PARTIALS §1.1) — the template Validate result seam. The
   *  pane's `template-validate` handler resolves `bridge.template.validate` in
   *  main (group-gated there) and hands the verdict here; the host records it as
   *  the template pane's `validation` context and requests a rebuild so the next
   *  render shows the inline valid/error feedback. A null/malformed verdict
   *  clears the feedback (never throws). SYNCHRONOUS (the rebuild is guarded). */
  private templateValidateResult(verdict: TemplateVerdict | null): void {
    this.templateValidation = verdict ?? null
    this.editController.requestRebuild()
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

  /** U-H8 — the operator-registry manage dispatch. Fires `bridge.rag.manage(request)`.
   *  A `{ confirmationRequired: true, summary }` result sets pendingRegMgmt + re-renders
   *  the operator pane (the provident-authored confirm strip appears); a `{ ok: true,
   *  done }` result clears the pending + re-fetches the listing + re-renders, AND for a
   *  default-changing op calls `requestRebuild()` (fresh app re-derive against the new
   *  default); a `{ ok: false, error }` result clears the pending + shows the error.
   *  SYNCHRONOUS (the IPC is fired; the result routes on resolution). */
  private registryManage(request: RagStoreManageRequest): void {
    // HOST-H8-4 — a rapid double-click on Confirm fires the SAME confirmed apply
    // twice; while one is in flight a second confirmed apply of the SAME op is
    // ignored (it would just re-drive the seam + could clobber the feedback strip).
    // NB: `confirmed` lives only on the destructive (non-add) variants of the
    // RagStoreManageRequest union — narrow via `op !== 'add'` before touching it.
    const confirmedApply = request.op !== 'add' && request.confirmed === true
    if (confirmedApply) {
      if (this.regMgmtConfirmingOp === request.op) return
      this.regMgmtConfirmingOp = request.op
    }
    void this.bridge.rag.manage(request).then((res) => {
      if (confirmedApply) this.regMgmtConfirmingOp = null
      if ('confirmationRequired' in res && res.confirmationRequired) {
        this.pendingRegMgmt = { request, summary: res.summary }
        this.registryManageError = null
        this.mountOperator()
      } else if ('ok' in res && res.ok) {
        this.pendingRegMgmt = null
        this.registryManageError = null
        this.refreshRegistryManage()
        const op = request.op
        if (op === 'setDefault' || op === 'renameDefault') this.editController.requestRebuild()
      } else if ('ok' in res && !res.ok) {
        this.pendingRegMgmt = null
        this.registryManageError = res.error
        this.mountOperator()
      }
    }).catch((e) => {
      // HOST-H8-4 — clear the in-flight guard on a bridge reject too.
      if (confirmedApply) this.regMgmtConfirmingOp = null
      // a bridge/rejection — leave the pending state + log (never a crash)
      console.error('[sidebar-panes] registry manage failed', e)
      this.pendingRegMgmt = null
      this.mountOperator()
    })
  }

  /** U-H8 — cancel/clear a pending confirmation without invoking any seam. */
  private registryManageDismiss(): void {
    this.pendingRegMgmt = null
    this.registryManageError = null
    this.mountOperator()
  }

  /** U-H8 — re-fetch the read-only listing (refresh-on-apply) + re-render the pane. */
  private refreshRegistryManage(): void {
    void this.bridge.rag.stores().then((p) => {
      this.lastStoreListing = p
      this.mountOperator()
    }).catch(() => {
      // keep the last-known listing (never a crash) — the F-MS5-3 non-abort discipline
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
