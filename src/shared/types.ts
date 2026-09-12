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
import type { LocalRagQueryFilters } from '../main/retrieval.js'

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
  | 'rag.list_documents'
  | 'edit.set_content'
  | 'edit.create_node'
  | 'edit.delete_node'
  | 'edit.split_node'
  | 'edit.merge_node'
  | 'edit.set_edge'
  | 'edit.set_doc_meta'
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

// ---- W1-N6 — the operator-only module-tool runner IPC (docs/specs/
// wave-1-open-decisions.md §E W1-N6; unit-u-parity-decisions.md §1 PG12) ------
// Manual-UI only: the operator runner lists the main-process `CapabilityRouter`'s
// registered dynamic `module:<name>.<tool>` tools and invokes one through the
// EXISTING two-gate (`module` AND `code`). Never an MCP tool; no new tool.

/** List the live router's registered `module:<name>.<tool>` tool names. */
export const IPC_MODULE_TOOL_LIST = 'provident:module:tools-list'

/** Invoke one registered dynamic module tool through the invocation two-gate. */
export const IPC_MODULE_TOOL_INVOKE = 'provident:module:tools-invoke'

/** The `module-tools-invoke` IPC payload: the tool name + its structured-clone
 *  args (the SAME call signature as `CapabilityRouter.invokeTool`). */
export interface ModuleToolInvokePayload {
  tool: string
  args?: unknown
}

// ---- Unit D editing IPC (docs/specs/unit-d-editing.md §5.1.9/§5.1.10) ----

/** The main→renderer `rag-store-changed` event (the re-traversal trigger,
 *  §5.1.9). Payload: `{ kind: 'content' | 'structural', nodeIds: string[],
 *  edgeIds: string[] }`. Broadcast after ANY successful RAG-store mutation via
 *  an MCP `edit.*` tool OR a UI commit-on-blur. */
export const IPC_RAG_STORE_CHANGED = 'provident:rag-store-changed'

// src/shared/types.ts — the ONE canonical declaration (Unit MS3 §5.1; the
// three structural copies in preload.ts/mcp-server.ts/sidebar-panes.ts are
// DELETED — A3's collapse resolution).
/** The main→renderer `rag-store-changed` event payload (the re-traversal
 *  trigger, Unit D §5.1.9). Broadcast after ANY successful RAG-store mutation
 *  via an MCP `edit.*` tool OR a UI commit-on-blur/batch/rich commit.
 *  Unit MS3 — `store` is REQUIRED: the registry-resolved name of the store the
 *  mutation landed on (the default store's name for the UI paths + an omitted
 *  `store` selector; the addressed store's name otherwise). The renderer host
 *  DROPS payloads whose `store` is not the store it renders (the B5 guard). */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
  /** REQUIRED (A3) — the registry name of the store the mutation landed on. */
  store: string
}

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
  /** U-MS5 — the optional store selector (MCP/UI mechanical symmetry,
   *  UI-SELECTOR-DEFERRED). Omitted ⇒ the default store (zero-config
   *  byte-equal). The settings/search pane's own query path NEVER passes it;
   *  a UI-passed non-default store's results are display-only
   *  (RAG-QUERY-STORE-DISPLAY-ASYMMETRY). */
  store?: string
  /** U-F3 — `stores: 'all'` runs the cross-store fan-out. Mutually exclusive
   *  with `store` (A-F3). Omitted ⇒ today's single-store path. */
  stores?: 'all'
  /** W1-N9 — the advanced-search `rag.query` args (U-PARITY-C18 / W1-Q9). The
   *  renderer's advanced-search disclosure collects these and the preload
   *  `rag.query` 4th `options` param threads them through the SAME IPC to the
   *  SAME `handleRagTool` the MCP `rag.query` tool reaches (MCP/UI equivalence).
   *  All optional: an omitted field keeps the engine default. */
  mode?: 'flat' | 'graph'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
  filters?: LocalRagQueryFilters
}

/** The renderer→main `rag-snapshot` IPC (the re-traversal data source). The
 *  renderer's `onRebuild` re-traversal (Unit C `buildTraversal`) needs the RAG
 *  store's nodes/edges, which live in MAIN (the single-writer store). This IPC
 *  returns a read-only snapshot so the renderer can re-derive the graph +
 *  back-reference map after a `rag-store-changed` broadcast. */
export const IPC_RAG_SNAPSHOT = 'provident:rag-snapshot'
export interface RagSnapshotPayload {
  /** Unit MS3 — REQUIRED: the registry-resolved name of the store this
   *  snapshot was taken from. The `rag-snapshot` IPC stays DEFAULT-STORE-BOUND
   *  (A2) — this names the default store ('main' zero-config). The renderer
   *  host captures its boot store from this field (§5.4). */
  store: string
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

/** Unit U-SHELL-2 §2.2 — the tri-state appearance setting (C1). `'system'`
 *  follows the OS preference live (resolved by the renderer's `resolveTheme`);
 *  `'light'`/`'dark'` are explicit operator choices. Serialized through the
 *  C9 UI-config carrier (`OperatorSettings`) — never an MCP tool. */
export type ThemeSetting = 'system' | 'light' | 'dark'

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
 *  + k). Mirrors the MCP `rag.query` result so both surfaces are equivalent.
 *  U-MS2 §5.9 (F3) — the ONE additive query-RESULT field `store` (the review
 *  §4 "Tool results" row, U-MS2-owned): the field is stamped through the SHARED
 *  handler (`handleRagTool` — the ONE stamp point serving the MCP `rag.query`
 *  tool and this IPC — MCP-UI-EQUIVALENCE) and carries the ADDRESSED entry's
 *  registry name ('main' zero-config; a non-default store's name when
 *  addressed; '' for the legacy directory-less sentinel). */
export interface RagQueryResult {
  query: string
  ranked: Array<{ nodeId: string; score: number }>
  context: unknown[]
  markdown: string
  lineMap: { ranges: Array<{ nodeId: string; startLine: number; endLine: number }> }
  k: number
  /** U-MS2 §5.9 F3 — the additive store stamp (see the interface doc above). */
  store: string
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

// ---- Unit V3 doc-heads IPC (docs/specs/unit-v3-doc-heads-docnav.md §5.1) ----

/** The renderer→main `rag-doc-heads` IPC (the doc-nav data source). Returns the
 *  document list (the `doc-head` edges' targets + the head node content) — a
 *  strict subset of the `rag-snapshot` payload. The doc-nav reads this, not the
 *  full snapshot. */
export const IPC_RAG_DOC_HEADS = 'provident:rag-doc-heads'
export interface RagDocHeadsPayload {
  /** One entry per document, sorted by document root id (lexicographic
   *  ascending, deterministic). Each entry carries the display-only
   *  `path`/`tags` projected from the document ROOT node (`e.target`); `[]`
   *  when the root has none (legacy / root-level / untagged). */
  documents: Array<{
    documentId: string
    title: string
    /** U-D4 (M7/M13) — the document root's corpus-relative DIRECTORY segments
     *  (the root's `documentPath ?? []`). DISPLAY-ONLY: never persisted, never
     *  derived by splitting `documentId` (C9). A legacy document (no
     *  `documentPath`) displays as root-level `[]`. */
    path: string[]
    /** U-D4 (M7/Q7) — the document root's `tags ?? []`. DISPLAY-ONLY. */
    tags: string[]
  }>
}

// ---- U-MS5 store-listing IPC (docs/specs/unit-ms5-settings-listing.md §5.1) --

/** U-MS5 — a store's load status as presented in the settings-pane listing.
 *  The THREE members and their meanings are the D7 failed-store matrix
 *  (multi-document-store-config-review.md §2 D7): `loaded` (the store loaded
 *  normally); `failed-corrupt` (loads empty + corrupt flag — serves EMPTY, the
 *  per-store fail-disabled semantics); `failed-missing` (absent file = first-run
 *  empty store — NOT an error state). This shared declaration is the SINGLE
 *  source, coordinated with U-MS2's per-store status derivation
 *  (docs/specs/unit-ms2-store-wiring.md) — a divergent re-declaration is a
 *  review finding (the A3/RCA-6 drift class). */
export type RagStoreLoadStatus = 'loaded' | 'failed-corrupt' | 'failed-missing'

/** One entry of the registry's presentation view. `persistenceFile` is the
 *  persistence file NAME — the BASENAME of U-MS1's resolved absolute path,
 *  projected by the §5.4 wiring adapter (`basename(entry.persistenceFile)`,
 *  F7): the derived names are `provident-rag-<name>.json`, or the legacy
 *  `provident-rag.json` for the name `main` (U-MS1's derivation rules), and
 *  an explicitly configured absolute path contributes its basename (e.g.
 *  `<dir>/scratch.json` → `scratch.json`). `corpusRoot` is
 *  the CONFIGURED absolute corpus root, or `null` when the entry configures
 *  none (the importer's own `process.cwd()` resolution at import time is the
 *  importer's rule, NOT the listing's — the listing displays the config, and
 *  the pane renders null as `(project root)`). */
export interface RagStoreListingEntry {
  name: string
  default: boolean
  persistenceFile: string
  corpusRoot: string | null
  status: RagStoreLoadStatus
}

/** The `rag-store-listing` IPC result — the registry's presentation view (one
 *  entry per configured store, in the registry's own array order). */
export interface RagStoreListingPayload {
  stores: RagStoreListingEntry[]
}

/** The renderer→main `rag-store-listing` IPC (the operator settings pane's
 *  read-only store census). Manual-UI ONLY: the MCP tool handlers never route
 *  to this channel, so an agent cannot enumerate the configured store names
 *  (B9/A9). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED) and NOT a five-seam
 *  gate seam — no RpcMethod, no TOOL_GROUPS entry, no ALL_TOOLS row. */
export const IPC_RAG_STORE_LISTING = 'provident:rag-store-listing'

// ---- U-H8 operator-registry-manage IPC (docs/specs/unit-h8-operator-editor.md §5.1)
// The renderer→main `rag-store-manage` IPC — the operator-registry management
// channel (the review §2 D6's ONE operator-UI IPC exemption). Manual-UI ONLY: the
// MCP tool handlers NEVER route to this channel, so an agent cannot add/remove/
// rename/re-default a store (A-P2-6/A-P2-7). NOT group-gated (IPC-SURFACE-NOT-GROUP-GATED)
// and NOT a five-seam gate seam — no RpcMethod, no TOOL_GROUPS entry, no ALL_TOOLS
// row, no MUTATING_METHODS member. The DESTRUCTIVE ops (remove/rename/setDefault/
// renameDefault) require the two-phase confirmation (D3): a request WITHOUT
// `confirmed:true` returns `{ confirmationRequired: true, summary }` and invokes NO
// seam; a request WITH `confirmed:true` invokes the LANDED hot-* seam, whose own
// rejection propagates fail-closed on a stale target. `add` is NON-destructive and
// executes immediately.

export type RagStoreManageOp = 'add' | 'remove' | 'rename' | 'setDefault' | 'renameDefault'

export type RagStoreManageRequest =
  | { op: 'add'; name: string }                                          // non-destructive — executes immediately
  | { op: 'remove'; name: string; confirmed?: boolean }                  // D3 ORPHAN — confirmation required
  | { op: 'rename'; from: string; to: string; confirmed?: boolean }      // destructive — confirmation required
  | { op: 'setDefault'; name: string; confirmed?: boolean }              // high-impact — confirmation required
  | { op: 'renameDefault'; to: string; confirmed?: boolean }             // default rename — confirmation required

/** The `rag-store-manage` IPC RESULT. Three members:
 *  1. `{ confirmationRequired: true; summary }` — a destructive request WITHOUT
 *     `confirmed:true`; the UI prompts before the real execution. NO seam ran.
 *  2. `{ ok: true; done }` — a mutation succeeded; `done` is the byte-pinned
 *     operator-readable summary (§5.4). The live registry now reflects the change.
 *  3. `{ ok: false; error }` — a domain failure (a malformed request, an advisory
 *     request-step rejection, or a PROPAGATED seam rejection on the confirm step —
 *     e.g. a now-stale target). The live registry is UNCHANGED on a failure. */
export type RagStoreManageResult =
  | { confirmationRequired: true; summary: string }
  | { ok: true; done: string }
  | { ok: false; error: string }

export const IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'

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
  /** Unit U-SHELL-2 §2.2 — the tri-state appearance setting (C1). The default
   *  is `'system'` (follow the OS preference live). */
  theme: ThemeSetting
}

/** A partial patch applied by `bridge.operatorSettings.set`. */
export interface OperatorSettingsPatch {
  enabledPanes?: string[]
  defaultDocumentId?: string | null
  topK?: number
  /** Unit U1 §1.2 — a patch WITHOUT `editingMode` leaves the stored mode
   *  unchanged. */
  editingMode?: EditingMode
  /** Unit U-SHELL-2 §2.2 — a patch WITHOUT `theme` leaves the stored theme
   *  unchanged. */
  theme?: ThemeSetting
}

export const IPC_OPERATOR_SETTINGS_GET = 'provident:operator-settings:get'
export const IPC_OPERATOR_SETTINGS_SET = 'provident:operator-settings:set'

// ---- Unit GN-MCP-UI §5.5 — the gnosis GUI bridge IPC (D4 MCP/UI parity) ----
// The operator `gnosis-status` pane + the app-graph `gnosis-query` pane reach
// the LANDED `createEngineRagStore` proxy (main-process) over these channels:
// `bridge.gnosis.status()`/`bridge.gnosis.query()` → IPC → MAIN → the SAME
// `handleGnosisTool` handler as the `gnosis.*` MCP tools (MCP/UI equivalence).
// The IPC surface is NOT an MCP tool — the renderer (a trusted surface) calls
// main directly; an MCP agent never routes to these channels.
export const IPC_GNOSIS_STATUS = 'provident:gnosis:status'
export const IPC_GNOSIS_QUERY = 'provident:gnosis:query'
/** Unit A2 §5.5 — the gnosis document/wiki GUI bridge IPC channels (D4 MCP/UI
 *  parity). The `gnosis-documents`/`gnosis-wikis` app-graph panes reach the
 *  LANDED `createEngineCrudRagStore` proxy (main-process) over these channels:
 *  `bridge.gnosis.documents(tool, args)`/`bridge.gnosis.wikis(tool, args)` →
 *  IPC → MAIN → the SAME `handleGnosisTool` handler as the `gnosis.document.*`/
 *  `gnosis.wiki.*` MCP tools (MCP/UI equivalence). The IPC surface is NOT an MCP
 *  tool — the renderer (a trusted surface) calls main directly; an MCP agent
 *  never routes to these channels. */
export const IPC_GNOSIS_DOCUMENTS = 'provident:gnosis:documents'
export const IPC_GNOSIS_WIKIS = 'provident:gnosis:wikis'
/** Unit U1 §1.2 — the main→renderer broadcast channel. Payload: the current
 *  `OperatorSettings` (the store's filtered result — the exact return of
 *  `operatorSettingsStore.set(patch)`). One-way notification (the re-derive
 *  trigger for a settings change), NOT a request/response. */
export const IPC_OPERATOR_SETTINGS_CHANGED = 'provident:operator-settings-changed'

// ---- Unit U-MENU-1 application-menu IPC (docs/specs/unit-u-menu-1-application-menus.md
// §2.2/§2.3) ----------------------------------------------------------------

/** One entry of the live pane catalog the native View → Panes submenu is built
 *  from. The renderer pushes the catalog at boot + on every `PaneRegistry`
 *  change (`IPC_PANE_CATALOG`), so the menu is data-driven — never a hard-coded
 *  list (W1-Q2). `scope` mirrors the `PaneScope` union. */
export interface PaneCatalogEntry {
  id: string
  title: string
  scope: 'app-graph' | 'operator'
  enabled: boolean
}

/** The renderer→main pane-catalog push channel. Payload:
 *  `Array<{ id, title, scope, enabled }>`. */
export const IPC_PANE_CATALOG = 'provident:pane-catalog'

/** The main→renderer pane-visibility action channel. Payload:
 *  `{ id: string, enabled: boolean }` — sent when a View → Panes checkbox is
 *  toggled. U-SHELL-8 owns the apply + persistence. */
export const IPC_PANE_VISIBILITY = 'provident:pane-visibility'
