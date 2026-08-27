// src/shared/types.ts — the IPC + MCP contract between the Electron main
// process (MCP server) and the renderer (provident-ssr graph + DOM render).
//
// This is the "Phase C" seam (the upstream project's parked cross-process
// MCP/Electron endpoint — docs/pending.md, ssr-synthetic-event.md §3): the
// payloads crossing the IPC boundary MUST be JSON-safe (structured-clone
// args). The renderer owns the producing graph; the main process owns the MCP
// server and forwards tool calls over IPC (renderer DOM + IPC bridge).

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
