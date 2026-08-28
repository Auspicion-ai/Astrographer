// src/shared/types.ts — the IPC + MCP contract between the Electron main
// process (MCP server) and the renderer (provident-ssr graph + DOM render).
//
// This is the "Phase C" seam (the upstream project's parked cross-process
// MCP/Electron endpoint — docs/pending.md, ssr-synthetic-event.md §3): the
// payloads crossing the IPC boundary MUST be JSON-safe (structured-clone
// args). The renderer owns the producing graph; the main process owns the MCP
// server and forwards tool calls over IPC (renderer DOM + IPC bridge).
import type { BacklinkResult } from '../main/backlinks.js'
import type { ContentWindowTemplate, TemplateSource } from '../main/template-shape.js'
import type { BatchOp, RagNode, RagNodeChild } from '../main/rag-store.js'

/** A render target in the producing graph. Two vocabularies per the Phase B
 *  synthetic-event contract (docs/specs/ssr-synthetic-event.md §2.2):
 *  ERGONOMIC — an authored `css.id`; AUTHORITATIVE — a `nodeId`/`wire`. */
export type DispatchTarget =
  | { kind: 'cssId'; cssId: string }
  | { kind: 'nodeId'; nodeId: string }
  | { kind: 'wire'; wire: string }

/** The synthetic-event dispatch request (Phase C: idempotent requestId +
 *  structured-clone JSON args + flush-before-response). */
export interface DispatchRequest {
  /** Caller-supplied idempotency key. The ENGINE applies the opt-in bounded
   *  `requestId` dedup (ssr-synthetic-event.md §3.3): a duplicate within the
   *  window (same requestId AND same (target, event)) returns the first
   *  caller's report — the idempotent echo an MCP host wants. */
  requestId?: string
  target: DispatchTarget | string
  event: string
  args?: unknown[]
}

export interface DispatchResult {
  /** The contained `HandlerResult[]` from the shared dispatch-report surface
   *  (`Supervisor.dispatchAndReport` — ssr-synthetic-event.md §3). */
  results: unknown[]
  /** Node ids dirtied by the dispatch's apply cascade (engine-derived:
   *  `apply().dirtied ∪ keys(takePass2States())`, awaited-flush-bounded). */
  dirtied: string[]
  /** The live `#app` innerHTML after the re-render. */
  renderedHtml: string
  /** The SSR re-emit (SSRFragmentAdapter) after the re-render. */
  ssrHtml: string
}

export interface RenderedHtmlResult {
  /** The live `#app` innerHTML (the DOM view). */
  renderedHtml: string
  /** The SSR fragment re-emitted from the same graph (the build-time view). */
  ssrHtml: string
  /** Node/compile census snapshot for debugging exposure. */
  census: Census
}

/** 0.2 Feature 2 — the MarkdownAdapter endpoint result (`provident.get_markdown`):
 *  the simplified text-only output document for agentic consumers. */
export interface MarkdownResult {
  /** The markdown text re-emitted from the current graph (non-interactive:
   *  on:* and data:* props dropped). */
  markdown: string
  /** Node/compile census snapshot. */
  census: Census
}

export interface NodeInfo {
  nodeId: string
  cssId?: string
  propsId?: string
  type: string
  content?: unknown
  state: string
  inTree: boolean
  handlers: Array<{ name?: string; event?: string; phase?: string }>
}

export interface ListTargetsResult {
  nodes: NodeInfo[]
}

export interface NodeStateResult {
  nodeId: string
  /** The node's pass-2 resolved states (read-only snapshot, JSON-safe). */
  states: unknown[]
  census: Census
}

export interface Census {
  registered: number
  inTree: number
  unplaced: number
  destroyed: number
  prototypes: number
}

// ---- battery tool payloads (docs/specs/e2e-test-battery.md §3) -------------

export interface LoadResult {
  census: Census
  renderedHtml: string
  ssrHtml: string
  warnings: unknown[]
}

export interface LoadPayload {
  kind: 'envelope' | 'doc' | 'commands'
  envelope?: unknown
  doc?: unknown
  commands?: unknown[]
  userData?: unknown
}

export interface OpResult {
  status: string
  dirtied?: string[]
  minted?: string[]
  renderedHtml: string
  ssrHtml: string
  warnings: unknown[]
}

export interface ExportResult {
  export: unknown
  census: Census
}

export interface ValidateResult {
  valid: boolean
  censusMatch: boolean
  treeSigMatch: boolean
  warnings: unknown[]
}

export interface TeardownResult {
  census: Census
  renderedHtml: string
  warnings: unknown[]
}

/** J (journal-endpoint-review.md J2/J3) — the `provident.journal` result. The
 *  engine's `UndoRedoReport` (provident-ssr 0.2.1) is surfaced faithfully:
 *  `status` ('applied'|'no-op'|'base-boundary'), `scheduledDirtied` (the
 *  markPass2-SCHEDULED pending-flush set), `stackTopKind`/`redoTopKind`, and
 *  `baseBoundary`. The host re-renders after the op and returns both views +
 *  warnings. */
export interface JournalResult {
  status: 'applied' | 'no-op' | 'base-boundary'
  /** The markPass2-SCHEDULED (pending-flush) set from the engine report. */
  scheduledDirtied: string[]
  /** kind of the post-op undoStack top (next undoable), if any. */
  stackTopKind?: string
  /** kind of the post-op redoStack top, if any (replay may clear it). */
  redoTopKind?: string
  /** true when the undo cursor sits at the condensed base. */
  baseBoundary: boolean
  /** The live `#app` innerHTML after the re-render. */
  renderedHtml: string
  /** The SSR re-emit (SSRFragmentAdapter) after the re-render. */
  ssrHtml: string
  warnings: unknown[]
}

export interface CodeGetResult {
  path: string
  value: unknown
}

export interface CodeSetResult {
  ok: boolean
  path: string
  wrote: unknown
}

export interface CodeCreateResult {
  ok: boolean
  path: string
  appendedAt: number
}

export interface CodeDeleteResult {
  ok: boolean
  removed: unknown
}

export interface CodeValidateResult {
  valid: boolean
  warnings: unknown[]
  shape: string
}

/** B4 (loadbatch-review.md) — a single `code.loadBatch` op. A discriminated
 *  union: `set`/`create`/`delete`, mirroring the individual `code.*` tools.
 *  The `delete` addressing rule (path-index vs `index` arg, mutually exclusive)
 *  is pinned. */
export type CodeBatchOp =
  | { op: 'set'; path: string; value: unknown }
  | { op: 'create'; path: string; entry: unknown }
  | { op: 'delete'; path: string; index?: number }

/** B5 — the `code.loadBatch` result: the re-derive `LoadResult` + a per-op
 *  status array (or, on rejection, the failing op index + code). */
export interface CodeLoadBatchResult extends LoadResult {
  /** per-op status, in order (`applied` for each successful op). */
  ops: Array<{ op: string; path: string; status: 'applied' }>
}

// ---- module.* extension system (docs/specs/module-import-proposal.md §2/§3) --

/** A module's declared capability surface. */
export interface ModuleCapabilities {
  tools?: string[]
  hooks?: string[]
  transforms?: string[]
}

/** A module dependency (M-r9 — declared, no resolver this pass). */
export interface ModuleDependency {
  name: string
  versionRange: string
}

/** The loaded-module contract (module-import-proposal.md §2). */
export interface ModuleManifest {
  name: string
  version: string
  capabilities: ModuleCapabilities
  /** Executable host-side JS (function-STRING). Requires the `code` group. */
  entry?: string
  /** True if `entry` carries executable code (authoritative: entry !== ''). */
  needsCode?: boolean
  /** Declared deps (M-r9 — no resolver; a dep on an absent module is a no-op). */
  dependsOn?: ModuleDependency[]
}

/** The `module.install`/`module.update` payload. */
export interface ModuleInstallPayload {
  name: string
  source: string
  version?: string
  force?: boolean
}

/** The `module.install`/`module.update` result. */
export interface ModuleInstallResult {
  status: 'installed' | 'updated' | 'no-op' | 'rejected'
  name: string
  version?: string
  reason?: string
}

/** A listed module (module.list). */
export interface ModuleListEntry {
  name: string
  version: string
  capabilities?: ModuleCapabilities
  disabled?: boolean
  quarantined?: boolean
}

// ---- IPC request envelope ------------------------------------------------

export type RpcMethod =
  | 'dispatch'
  | 'renderedHtml'
  | 'markdown'
  | 'listTargets'
  | 'nodeState'
  | 'load'
  | 'op'
  | 'export'
  | 'validate'
  | 'teardown'
  | 'code.get'
  | 'code.set'
  | 'code.create'
  | 'code.delete'
  | 'code.validate'
  | 'code.load'
  | 'code.loadBatch'
  | 'journal'
  | 'module.install'
  | 'module.update'
  | 'module.list'
  // Unit B (docs/specs/unit-b-document-model.md §5.3) — the main-handled
  // `rag`/`edit` tool methods. They are handled in MAIN (the RAG store), never
  // routed to the renderer, but still declare their method names here for the
  // shared IPC contract.
  | 'rag.query'
  | 'rag.get_document'
  | 'rag.list_nodes'
  | 'rag.get_edges'
  | 'rag.backlinks'
  | 'edit.set_content'
  | 'edit.create_node'
  | 'edit.delete_node'
  | 'edit.split_node'
  | 'edit.merge_node'
  | 'edit.set_edge'
  // Unit I (docs/specs/unit-i-template.md §5.3) — the main-handled
  // `code.template.*` tool methods. They are handled in MAIN (the template
  // store), never routed to the renderer, but still declare their method names
  // here for the shared IPC contract (like the `rag.*`/`edit.*` methods).
  | 'code.template.get'
  | 'code.template.validate'
  | 'code.template.set'
  | 'code.template.create'
  | 'code.template.delete'
  | 'code.template.reset'

export interface RpcRequest {
  id: number
  method: RpcMethod
  payload: unknown
}

export interface RpcReply {
  id: number
  ok: boolean
  value?: unknown
  error?: string
}

// IPC channel names
export const IPC_INVOKE = 'provident:invoke'
export const IPC_REPLY = 'provident:reply'
export const IPC_READY = 'provident:ready'
/** N4 (live-notification-review.md) — the renderer→main "app graph changed"
 *  push channel. Sourced ONLY from the app Runtime re-render (never the
 *  isolated SecurePanels graph — an operator action must not leak to the
 *  agent through a push). The MCP server maps it into a resource-updated
 *  notification over stdio. */
export const IPC_NOTIFY = 'provident:notify'
export interface NotifyPayload {
  /** the changed resource URI (e.g. `mcp://provident/app`) */
  uri: string
}

// ---- security settings IPC (the manual-UI surface, mcp-endpoint.md §6.4) ----

/** The persisted security config the manual-UI settings pane reads/writes.
 *  Transported main→renderer→main ONLY (never an MCP tool — an agent must not
 *  be able to grant itself capabilities). */
export interface SecuritySettings {
  token: string | null
  /** The enabled tool groups (`read`/`dispatch`/`graph`/`code`/`module`/`rag`/`edit`). */
  enabled: string[]
  /** Maximum journal entries before auto-condense (undefined = never condense).
   *  Passed to the provident-ssr Supervisor constructor. */
  maxJournalLength?: number
}

export const IPC_SECURITY_GET = 'provident:security:get'
export const IPC_SECURITY_SET = 'provident:security:set'
export const IPC_MODULE_GET = 'provident:module:get'
export const IPC_MODULE_SET_DISABLED = 'provident:module:set-disabled'

// ---- Unit D editing IPC (docs/specs/unit-d-editing.md §5.1.9/§5.1.10) ----

/** The main→renderer `rag-store-changed` event (the re-traversal trigger,
 *  §5.1.9). Payload: `{ kind: 'content' | 'structural', nodeIds: string[],
 *  edgeIds: string[] }`. Broadcast after ANY successful RAG-store mutation via
 *  an MCP `edit.*` tool OR a UI commit-on-blur. */
export const IPC_RAG_STORE_CHANGED = 'provident:rag-store-changed'
/** The renderer→main `edit-commit` IPC (the UI commit-on-blur write-back,
 *  §5.1.10). Payload: `{ nodeId: string, content: string }`. Main calls
 *  `setContent` on the store (the SAME edit op as the MCP tool), then
 *  broadcasts `rag-store-changed`. */
export const IPC_EDIT_COMMIT = 'provident:edit-commit'
export interface EditCommitPayload {
  nodeId: string
  content: string
}

/** The renderer→main `edit-batch` IPC (the batch channel for the rich-text
 *  editing machinery — RICH-TEXT-EDITING-GATE). Payload: `{ ops: BatchOp[] }`.
 *  Main calls `applyBatch` on the store (the SAME transaction primitive as the
 *  MCP `edit.batch` tool — MCP/UI equivalence, §8.2 BINDING), then broadcasts
 *  `rag-store-changed` on success. */
export const IPC_EDIT_BATCH = 'provident:edit-batch'
export interface EditBatchPayload {
  /** The batch of edit operations to apply atomically (a `BatchOp[]` — Unit N
   *  §5.1). Applied via `applyBatch` — all or nothing. */
  ops: BatchOp[]
}

/** Unit U5 §1.3 — the renderer→main `edit-rich-commit` IPC (the atomic
 *  rich-text write-back, decision A). Payload: `{ nodeId, content, children }`
 *  — the FULL decomposed result of the contenteditable blur (Unit U2). Main
 *  calls the SAME `setRichText` edit op the renderer's `edit.commitRich` bridge
 *  wraps (one call — the host decomposes ONCE in `editorBlur`, Unit U4), then
 *  derives + broadcasts `rag-store-changed` on success. */
export const IPC_EDIT_RICH_COMMIT = 'provident:edit-rich-commit'
export interface EditRichCommitPayload {
  nodeId: string
  content: string
  children: RagNodeChild[] // REQUIRED — a valid RagNodeChild[] (possibly [])
}

// ---- Unit E retrieval IPC (docs/specs/unit-e-rag-index.md §5.7/§8.2) ----

/** The renderer→main `rag-query` IPC (the UI retrieval path, §5.7 — MCP/UI
 *  equivalence, §8.2 a BINDING constraint). Payload: `{ query: string, topK?:
 *  number }`. Main calls the SAME retrieval engine as the MCP `rag.query` tool
 *  (the maintained engine, §5.6) and returns the retrieval result. */
export const IPC_RAG_QUERY = 'provident:rag-query'
export interface RagQueryPayload {
  query: string
  topK?: number
}

/** The renderer→main `rag-snapshot` IPC (the re-traversal data source). The
 *  renderer's `onRebuild` re-traversal (Unit C `buildTraversal`) needs the RAG
 *  store's nodes/edges, which live in MAIN (the single-writer store). This IPC
 *  returns a read-only snapshot so the renderer can re-derive the graph +
 *  back-reference map after a `rag-store-changed` broadcast. */
export const IPC_RAG_SNAPSHOT = 'provident:rag-snapshot'
export interface RagSnapshotPayload {
  nodes: Array<{
    id: string
    type: string
    content: string
    props?: Record<string, unknown>
    /** Unit U3 §1.4 — the inline rich-text children of the snapshot node
     *  (mirrors the store's `RagNodeChild` shape but uses `type: string` to
     *  match this node's existing `type: string` convention). ADDITIVE +
     *  OPTIONAL — a node WITHOUT `children` (the v1 plain-text default) is
     *  valid. No runtime change: the `IPC_RAG_SNAPSHOT` handler already returns
     *  full `RagNode` objects that carry `children`. */
    children?: Array<{ type: string; content: string; props?: Record<string, unknown> }>
    ownedNodeIds: string[]
    createdAt: string
    updatedAt: string
  }>
  edges: Array<{ id: string; kind: string; source: string; target: string; order?: number; documentIds?: string[]; createdAt: string; updatedAt: string }>
}

/** Unit U3 §1.3/§1.4 — the rich-text editing mode. Decision D: `'textarea'`
 *  is the safe default. Unit U1 later adds an `editingMode` field to
 *  `OperatorSettings` using this SAME type. */
export type EditingMode = 'textarea' | 'contenteditable'

/** The Unit D §5.1.10 commit result (the `edit-commit` IPC reply). Mirrors the
 *  controller's `CommitResult`; a deleted-node race surfaces as
 *  `reason:'deleted-node'` (not `store-error`). */
export type EditCommitResult =
  | { ok: true; nodeId: string }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }

/** Unit U5 §1.3 — the `edit-rich-commit` IPC reply. Mirrors `EditCommitResult`
 *  (a deleted-node race surfaces as `reason:'deleted-node'`, not `store-error`)
 *  and additionally returns the UPDATED node on success (so the
 *  renderer/controller can observe the written state + refreshed `updatedAt`). */
export type RichCommitResult =
  | { ok: true; nodeId: string; node: RagNode }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }

/** The `rag-query` IPC result — the JSON-safe transport of the retrieval
 *  engine's `RetrievalResult` (ranked + assembled context + markdown + line map
 *  + k). Mirrors the MCP `rag.query` result so both surfaces are equivalent. */
export interface RagQueryResult {
  query: string
  ranked: Array<{ nodeId: string; score: number }>
  context: unknown[]
  markdown: string
  lineMap: { ranges: Array<{ nodeId: string; startLine: number; endLine: number }> }
  k: number
}

// ---- Unit G backlink IPC (docs/specs/unit-g-crosslink-backlink.md §5.4) ----

/** The renderer→main `rag-backlinks` IPC (the UI enumeration path, §5.4 —
 *  MCP/UI equivalence, §8.2 a BINDING constraint). Payload: `{ nodeId: string }`.
 *  Main calls the SAME host-side enumeration as the MCP `rag.backlinks` tool
 *  (`enumerateLinks`, §5.3) and returns the `BacklinkResult`. */
export const IPC_RAG_BACKLINKS = 'provident:rag-backlinks'
export interface RagBacklinksPayload {
  nodeId: string
}
/** The `rag-backlinks` IPC result — the JSON-safe transport of the enumeration's
 *  `BacklinkResult`. Mirrors the MCP `rag.backlinks` result so both surfaces are
 *  equivalent. */
export type RagBacklinksResult = BacklinkResult

// ---- Unit I template IPC (docs/specs/unit-i-template.md §5.4) -------------

/** The renderer→main `code.template.*`-equivalent IPC channels. Each is handled
 *  in `src/main/main.ts` by delegating to `handleTemplateTool` with the SAME
 *  template store as the MCP tools (MCP/UI equivalence — §8.2 a BINDING
 *  constraint). The renderer never computes template CRUD itself. */
export const IPC_TEMPLATE_GET = 'provident:template:get'
export const IPC_TEMPLATE_VALIDATE = 'provident:template:validate'
export const IPC_TEMPLATE_SET = 'provident:template:set'
export const IPC_TEMPLATE_CREATE = 'provident:template:create'
export const IPC_TEMPLATE_DELETE = 'provident:template:delete'
export const IPC_TEMPLATE_RESET = 'provident:template:reset'
/** The main→renderer template-change broadcast (the whole-graph re-derive
 *  trigger, §5.5). Payload carries the current template so the renderer
 *  re-derives without a follow-up fetch. */
export const IPC_TEMPLATE_CHANGED = 'provident:template-changed'
export interface TemplateChangedPayload {
  source: TemplateSource
  template: ContentWindowTemplate
}

// ---- Unit K operator-settings IPC (docs/specs/unit-k-sidebar-panes-host.md
// §5.4 M9) ----------------------------------------------------------------

/** The operator-owned settings the `settings` pane reads/writes. Transported
 *  main→renderer→main ONLY (never an MCP tool — an agent must not be able to
 *  change the operator's view/retrieval defaults). */
export interface OperatorSettings {
  /** The sidebar panes enabled for the operator view (subset of the pane ids). */
  enabledPanes: string[]
  /** The default document root id on boot (null = all documents). */
  defaultDocumentId: string | null
  /** The retrieval topK default. */
  topK: number
  /** Unit U1 §1.2 — the rich-text editing mode. The safe default is
   *  `'textarea'` (decision D); `'contenteditable'` is the operator opt-in
   *  (the rich-eligible subtree-root splice target). */
  editingMode: EditingMode
}

/** A partial patch applied by `bridge.operatorSettings.set`. */
export interface OperatorSettingsPatch {
  enabledPanes?: string[]
  defaultDocumentId?: string | null
  topK?: number
  /** Unit U1 §1.2 — a patch WITHOUT `editingMode` leaves the stored mode
   *  unchanged. */
  editingMode?: EditingMode
}

export const IPC_OPERATOR_SETTINGS_GET = 'provident:operator-settings:get'
export const IPC_OPERATOR_SETTINGS_SET = 'provident:operator-settings:set'
/** Unit U1 §1.2 — the main→renderer broadcast channel. Payload: the current
 *  `OperatorSettings` (the store's filtered result — the exact return of
 *  `operatorSettingsStore.set(patch)`). One-way notification (the re-derive
 *  trigger for a settings change), NOT a request/response. */
export const IPC_OPERATOR_SETTINGS_CHANGED = 'provident:operator-settings-changed'
