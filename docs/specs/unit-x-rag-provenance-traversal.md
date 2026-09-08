# Spec — Unit X: RAG-Surface Provenance + Multi-Hop Traversal

- **Status:** SPEC (the RAG-surface contract handoff from the Auspicion Suite
  top-level architecture repo). Gate reference: the canonical contract
  `../Auspicion Suite/docs/specs/astrographer.md` §4.3.2 (the RAG query
  operations), §4.3.4 (result-level provenance — A1), §4.3.5 (multi-hop
  traversal + relationship filtering + parent-context — A2), §4.5.1 (the MCP
  tool set — `get_query_audit_log` + the new `rag_query`/`rag_stream` params),
  §4.6.2 (the GUI parity mapping — the RAG audit panel + the RAG query panel
  params), §6 (FS-16 `TraceUnavailable`, FS-17 `HopLimitExceeded`, FS-18
  `CycleDetected`, FS-3 extended `ValidationError`), §7.6 (GAP-7 — the
  multi-hop traversal is re-scoped to Astrographer, NOT an Incanter change).
  Project gate reference: `docs/specs/astrographer-review.md` §8.2 (MCP/UI
  equivalence — a BINDING constraint on every unit that touches retrieval),
  §9.2.10 (retrieval selection), §9.2.6 (SINGLE-WRITER-STORE), §9.2.7
  (RAG-EDIT-MCP-GROUPS). Decisions: `docs/decisions.md` rows
  **LEXICAL-FIRST-RETRIEVAL**, **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE**,
  **MCP-UI-EQUIVALENCE**, **SOURCE-SWITCHABLE**, **CROSSLINK-EDGE-KIND**,
  **CROSS-DOCUMENT-SHARED**, **CHILDREN-ADDITIVE-STORE-FORMAT** (the additive
  store-format precedent this unit's additive fields follow). New decision rows
  pinned by this spec (added when the unit lands): **RESULT-LEVEL-PROVENANCE**,
  **QUERY-AUDIT-LOG**, **GRAPH-MODE-WALK**, **PARENT-CONTEXT-EXPAND**,
  **REFERENCE-GRAPH-ADDITIVE-FIELDS**.
- **Scope:** the RAG-surface contract changes — (A1) result-level provenance
  (`citations` + `trace` on the `rag.query` result, the query audit log
  `getQueryAuditLog` + MCP `get_query_audit_log` + the GUI audit panel, the
  `TraceUnavailable` fail-state); (A2) multi-hop traversal + relationship
  filtering + parent-context (`mode: 'graph'` walk over the `reference`→`fact`
  graph, the pinned `filters?` shape, `expand: 'parent'` parent-context, the
  `HopLimitExceeded`/`CycleDetected` fail-states + the extended
  `ValidationError`). The unit extends `src/main/retrieval.ts` (the retrieval
  module), `src/main/mcp-server.ts` (the `rag.query` handler + the new
  `get_query_audit_log`/`rag-stream` tools), adds `src/main/query-audit.ts`
  (the audit log), and extends the store substrate (`src/main/rag-store.ts` +
  `src/main/adjacency.ts`) with the additive `nodeKind`/`edgeType`/`state`
  fields the `reference`→`fact` graph traversal operates on. It does NOT
  implement the Incanter HTTP client (the engine is the current local
  lexical/vector retrieval engine — the contract's `'incanter'` value is the
  Auspicion Suite's framing, reconciled when the Incanter edge lands, F4), does
  NOT implement the Zodiac source, and does NOT change the document-store /
  cross-link consistency enforcement (§4.2 of the contract — the `FRESH`/
  `STALE`/`RESOLVED`/`BROKEN` state *maintenance* is a separate concern; this
  unit only *reads* the states the traversal surfaces).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/retrieval.ts` (the
  extended result + the graph walk + parent-context + filters), the NEW
  `src/main/query-audit.ts`, and `src/main/mcp-server.ts` (the extended
  `rag.query` handler + the `get_query_audit_log`/`rag-stream` tools) from
  §5.9/§5.10 before any implementation.

---

## 1. What the proposal asks

The Auspicion Suite top-level architecture repo amended its canonical
Astrographer contract (`../Auspicion Suite/docs/specs/astrographer.md`) with
two RAG-surface contract changes that the Astrographer project must implement:

**A1 — Result-level provenance (MUST, first).**
1. Extend the `rag.query` result to carry **`citations`** — the deduplicated
   grounding set `[{documentId, nodeId}]` — and **`trace`** — per-mode:
   flat mode = `{mode:'flat', engine, topK, source}`; graph mode =
   `[{from:{documentId,nodeId}, to:{documentId,nodeId}, edge:'link'|'embed',
   state:'FRESH'|'RESOLVED'|'STALE'|'BROKEN'}]` (the ordered `reference`→`fact`
   path walked).
2. Add a **query audit log** — `getQueryAuditLog` →
   `[{query, filters, mode, resultCount, timestamp, requester}]`; the MCP
   `get_query_audit_log` tool; the GUI audit panel. D4 parity (both surfaces).
3. New fail-state **`TraceUnavailable`** — the engine returns results without a
   `trace`.

**A2 — Multi-hop traversal + relationship filtering + parent-context (SHOULD).**
4. Extend `rag.query`/`rag-stream` to accept `mode?: 'flat'|'graph'`,
   `maxHops?` (1–5, default 3), `expand?: 'none'|'parent'`,
   `maxParentContext?` (default 5), and a pinned **`filters?`** shape
   `{nodeKind?: 'content'|'fact'|'reference', edgeType?: 'link'|'embed',
   target?: {documentId, nodeId}, state?: 'FRESH'|'RESOLVED'|'STALE'|'BROKEN'}`.
5. **`mode: 'graph'`** — a deterministic, hop-limited walk over the
   `reference`→`fact` graph (GAP-7, re-scoped to Astrographer — NOT an Incanter
   change). Resolve through `FRESH`/`RESOLVED`; surface `BROKEN`/`STALE` in the
   trace (never silently traverse a stale embed). A traversal that resolves no
   target returns an empty result with `blockedBy: [{documentId, nodeId, state}]`
   (a valid state, not an error).
6. **`expand: 'parent'`** — parent-context return (return the parent
   Document/node-cluster for a retrieved child), capped (`maxParentContext`) and
   stale-propagating.
7. New fail-states **`HopLimitExceeded`**, **`CycleDetected`**, and an extended
   `ValidationError` (invalid `mode`, `maxHops` out of range, malformed
   `filters`).

## 2. Feasibility verdict

**Feasible — grounded in the existing retrieval module (`src/main/retrieval.ts`,
Unit E/F), the MCP `rag.query` handler (`src/main/mcp-server.ts`), and the
`RagStore` adjacency substrate (`src/main/rag-store.ts` + `src/main/adjacency.ts`,
Unit V1).**

- **A1 provenance is additive.** The current `rag.query` result
  (`{query, ranked, context, markdown, lineMap, k, store}`) is extended with
  `citations`, `trace`, `blockedBy?`, and the contract's `results` array — a
  backward-compatible additive extension. The `trace`/`citations` are derivable
  from the existing retrieval output + the store's adjacency methods. The audit
  log is a NEW pure module (`src/main/query-audit.ts`) — a bounded in-memory
  ring buffer, no I/O, no engine gap.
- **A2 traversal is a local, deterministic walk.** The `reference`→`fact` graph
  is realized on the existing `RagStore` substrate via the additive
  `nodeKind`/`edgeType`/`state` fields (the CHILDREN-ADDITIVE-STORE-FORMAT
  precedent) + the existing `crosslink` edge kind + the Unit V1 adjacency
  methods (`edgesFrom`/`edgesTo`/`edgesByKind`). The walk is pure, hop-limited,
  cycle-protected, and deterministic — no graph DB, no query language, no
  external service (D2). The `expand: 'parent'` parent-context is a capped
  lookup over the store.
- **No engine/foundation gap.** The RAG surface is project-specific (the
  contract §7.6 re-scopes GAP-7 to Astrographer). The `'incanter'`/`'zodiac'`
  source values are the Auspicion Suite's framing; the current Astrographer
  engine is local (`'local'`), and the union is reconciled when the Incanter
  edge lands (F4). The `FRESH`/`STALE`/`RESOLVED`/`BROKEN` state *maintenance*
  (the §4.2 consistency mechanism) is a separate concern — this unit only reads
  the states the traversal surfaces.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `citations` + `trace` on the `rag.query` result | Project-specific (extends the retrieval module) | Low cost; the explainability/governance surface (A1). |
| The query audit log (`getQueryAuditLog` + MCP `get_query_audit_log` + the GUI audit panel) | Project-specific (a NEW pure module + the MCP tool + the GUI panel) | Low cost; the auditability axis of governance (D4 parity). |
| The `TraceUnavailable` fail-state | Project-specific (a defensive fail-state on the result shape) | Low cost; a result without a trace is not a valid `RagResult`. |
| The `mode: 'graph'` multi-hop walk over the `reference`→`fact` graph | Project-specific (composes the store + the adjacency methods) | Medium cost; the GAP-7 resolution (A2). |
| The pinned `filters?` shape + the extended `ValidationError` | Project-specific (input validation + the walk's node/edge restriction) | Low cost; deterministic filtering. |
| The `expand: 'parent'` parent-context return | Project-specific (a capped lookup over the store) | Low cost; capped + stale-propagating. |
| The additive `nodeKind`/`edgeType`/`state` fields on the store substrate | Project-specific (the CHILDREN-ADDITIVE-STORE-FORMAT precedent) | Low cost; additive + hash-covered, no migration/re-hash. |
| The `rag-stream` MCP tool | Project-specific (a degenerate stream over the MCP SDK) | Low cost; the contract's SSE framing is materialized as a chunk array. |

No engine gap. The `'incanter'`/`'zodiac'` source values are the Auspicion
Suite's framing; the current Astrographer engine is local (`'local'`), and the
union is reconciled when the Incanter edge lands (F4). The `FRESH`/`STALE`/
`RESOLVED`/`BROKEN` state *maintenance* (the §4.2 consistency mechanism) is a
separate concern, NOT this unit.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.9/§5.10 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

_(Empty at the spec gate — populated by the adversarial pass when the unit
lands.)_

**Adversarial findings (2026-09-08, RCA-3 — all HOST, fixed + regression-tested):**

- **F-X-1 (HIGH):** `walkReferenceGraph` threw `HopLimitExceeded` whenever
  `hops >= maxHops` regardless of whether a target was resolved (off-by-one; a
  chain of exactly `maxHops` hops resolved a target then threw). **FIXED:** the
  throw is gated on `hops > maxHops && !resolved` (spec §5.4 "exceeds maxHops
  WITHOUT resolving a target"). Regression-tested (F-X-1a/b).
- **F-X-2 (MEDIUM):** `blockedBy` was populated for a `BROKEN`/`STALE` edge even
  when a target was already resolved. **FIXED:** `blockedBy` is present ONLY
  when `targets` is empty (spec §5.4/§5.2). Regression-tested (F-X-2).
- **F-X-3 (MEDIUM):** `rag-stream` validation fail-states threw OUTSIDE the
  `try`, surfacing as MCP errors instead of the spec §5.8-mandated
  `[{type:'error', error:<message>}]` chunk. **FIXED:** validation moved inside
  the `try` so all fail-states return an error chunk. Regression-tested (F-X-3).
- **F-X-4 (LOW):** the walk filtered `e.kind === 'crosslink'` but did not
  require the target to be a `reference`/`fact` node, so a malformed crosslink to
  a `content` node was traversed. **FIXED (refined):** the walk traverses a
  crosslink whose target is a `reference` OR `fact` node (a `content` target is
  NON-traversable); a `reference` target is a WAYPOINT (not a resolved target),
  which is what makes `HopLimitExceeded`/`CycleDetected` reachable. Spec §5.4
  amended. Regression-tested (F-X-4).
- **F-X-5 (LOW):** `buildCitations`/`expandParentContext` guarded only the array
  itself, not individual elements; a `null` element threw an unpinned
  `TypeError`. **FIXED:** a `null` element is skipped. Regression-tested (F-X-5).
- **F-X-6 (INFO):** `buildFlatTrace` validates `source` only as a string,
  accepting values outside the `'local'|'incanter'|'zodiac'` union. Matches the
  spec's pinned fail-state — NO fix (recorded for awareness).

No PACKAGE/UPSTREAM findings — all issues were host-side (`src/`).

## 4. Design decisions pinned by this spec

- **RESULT-LEVEL-PROVENANCE (new):** every `rag.query`/`rag-stream` result
  carries `citations` (the deduplicated grounding set `[{documentId, nodeId}]`)
  and `trace` (per-mode). A result without a `trace` is not a valid `RagResult`
  — it fails with `TraceUnavailable`. The existing `ranked`/`context`/`markdown`/
  `lineMap`/`k`/`store` fields are PRESERVED (a backward-compatible additive
  extension).
- **QUERY-AUDIT-LOG (new):** every `ragQuery`/`ragStream` call is recorded in a
  bounded in-memory audit log (`getQueryAuditLog` → `[{query, filters, mode,
  resultCount, timestamp, requester}]`). Exposed via BOTH the MCP
  `get_query_audit_log` tool AND the GUI audit panel (D4 parity). The log is
  bounded (a ring buffer, default 1000 entries) and never throws on a full log
  (oldest entries are dropped).
- **GRAPH-MODE-WALK (new):** `mode: 'graph'` is a deterministic, hop-limited
  local walk over the `reference`→`fact` graph (GAP-7, re-scoped to
  Astrographer — NOT an Incanter change). It resolves through `FRESH`/`RESOLVED`
  references and surfaces `BROKEN`/`STALE` in the trace (never silently
  traverses a stale embed). A traversal that resolves no target returns an
  empty result with `blockedBy` (a valid state, not an error). `HopLimitExceeded`
  when the walk exceeds `maxHops` without resolving a target; `CycleDetected`
  when the walk detects a `reference`→`fact` cycle.
- **PARENT-CONTEXT-EXPAND (new):** `expand: 'parent'` returns the parent
  Document/node-cluster for a retrieved child, capped by `maxParentContext`
  (default 5) and stale-propagating (a `STALE` embed's parent carries
  `stale: true`).
- **REFERENCE-GRAPH-ADDITIVE-FIELDS (new):** the `reference`→`fact` graph is
  realized on the existing `RagStore` substrate via ADDITIVE fields —
  `RagNode.nodeKind?: 'content'|'fact'|'reference'` (default `'content'`),
  `RagEdge.edgeType?: 'link'|'embed'` (default `'link'`), and
  `RagEdge.state?: 'FRESH'|'RESOLVED'|'STALE'|'BROKEN'` (default `'RESOLVED'`
  for `link`, `'FRESH'` for `embed`). These follow the
  CHILDREN-ADDITIVE-STORE-FORMAT precedent: additive, hash-covered, no
  migration/re-hash. The `reference`→`fact` graph is the subgraph of
  `crosslink`-kind edges (the existing cross-document reference mechanism)
  whose source is a `reference` node and target is a `fact` node.
- **ENGINE-IS-LOCAL (consumed):** the current Astrographer retrieval engine is
  the local lexical/vector engine (`src/main/retrieval.ts` + `src/main/embeddings.ts`).
  The contract's `engine: 'incanter'` and the `source: 'local'|'incanter'|'zodiac'`
  union are the Auspicion Suite's framing; the Astrographer values are
  `engine: 'local'` and `source: 'local'` until the Incanter/Zodiac edges land
  (F4). The `'incanter'`/`'zodiac'` values are reserved in the union but not
  produced by the current engine.
- **MCP-UI-EQUIVALENCE (consumed):** the RAG query + the audit log are reachable
  equivalently through the MCP `rag` group and the UI (the `rag-query` IPC + the
  GUI audit panel), both calling the same retrieval module + the same audit log
  (§8.2, a BINDING constraint).

## 5. The exhaustive contract

### 5.1 The additive store-substrate fields (the `reference`→`fact` graph)

The `reference`→`fact` graph the traversal operates on is realized on the
existing `RagStore` substrate via ADDITIVE fields (the
CHILDREN-ADDITIVE-STORE-FORMAT precedent). These are store-format changes the
implementer lands in `src/main/rag-store.ts` (the `RagNode`/`RagEdge` interfaces
+ the shape validation + the hash source + the `RAG_NODE_KINDS`/
`RAG_EDGE_TYPES`/`RAG_REFERENCE_STATES` runtime sets). `src/main/adjacency.ts`
holds only the pre-existing `RAG_EDGE_KINDS` (the edge-kind set) + the pure
helpers — the additive `nodeKind`/`edgeType`/`state` runtime sets live in
`rag-store.ts`, not `adjacency.ts`.

```ts
// src/main/rag-store.ts (extended — additive fields)

/** The RAG node kind — the contract's node-kind taxonomy (A2 filters). ADDITIVE
 *  field on RagNode (default 'content'). */
export type RagNodeKind = 'content' | 'fact' | 'reference'

/** The reference edge type — the contract's link/embed reference modes (A2
 *  filters + the graph-mode trace). ADDITIVE field on RagEdge (default 'link'). */
export type RagEdgeType = 'link' | 'embed'

/** The reference state — the contract's consistency states (A2 filters + the
 *  graph-mode trace + blockedBy). ADDITIVE field on RagEdge (default 'RESOLVED'
 *  for link, 'FRESH' for embed). */
export type RagReferenceState = 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'

// RagNode gains: nodeKind?: RagNodeKind   (default 'content')
// RagEdge gains: edgeType?: RagEdgeType   (default 'link')
//                state?: RagReferenceState (default 'RESOLVED' for link, 'FRESH' for embed)
```

**Additive-field rules (pinned):**

- `RagNode.nodeKind` is OPTIONAL and ADDITIVE — a node without it is `'content'`.
  It is deep-copied on BOTH write and read, validated at write (a value outside
  the closed union → `rag putNode: nodeKind required/invalid`), skipped at boot
  (a malformed value → the node is skipped, never loaded), and included in
  `nodeSource` (the SHA-256 hash covers it — a tampered `nodeKind` is
  QUARANTINED at boot). A node WITHOUT `nodeKind` hashes identically to a node
  with `nodeKind: undefined` (the ADDITIVE guarantee).
- `RagEdge.edgeType` and `RagEdge.state` are OPTIONAL and ADDITIVE — an edge
  without them defaults to `edgeType: 'link'` and `state: 'RESOLVED'` (for a
  `link`) / `'FRESH'` (for an `embed`). They are deep-copied on BOTH write and
  read, validated at write (a value outside the closed union →
  `rag putEdge: edgeType/state required/invalid`), skipped at boot, and included
  in `edgeSource` (the SHA-256 hash covers them). An edge WITHOUT them hashes
  identically to an edge with them `undefined` (the ADDITIVE guarantee).
- **The `reference`→`fact` graph:** the subgraph of `crosslink`-kind edges (the
  existing cross-document reference mechanism, CROSSLINK-EDGE-KIND) whose
  source is a `reference` node and target is a `fact` node. A `reference` node
  points at a `fact` node via a `link` or `embed` edge. The traversal reads this
  subgraph via the Unit V1 adjacency methods (`edgesFrom`/`edgesTo`/`edgesByKind`).

**Fail-states:**

- `putNode` with a `nodeKind` outside the closed union → throws
  `Error('rag putNode: nodeKind required/invalid')`.
- `putEdge` with an `edgeType` or `state` outside the closed union → throws
  `Error('rag putEdge: edgeType/state required/invalid')`.
- A boot record with a malformed `nodeKind`/`edgeType`/`state` → the record is
  SKIPPED (never loaded), consistent with the existing boot-skip discipline.

### 5.2 The extended RAG query options + result (A1 + A2)

```ts
// src/main/retrieval.ts (extended)

/** The pinned filters shape (A2). */
export interface RagQueryFilters {
  nodeKind?: 'content' | 'fact' | 'reference'
  edgeType?: 'link' | 'embed'
  target?: { documentId: string; nodeId: string }
  state?: 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'
}

/** The per-result item (the contract's `results` array element). */
export interface RagResultItem {
  documentId: string
  nodeId: string
  score: number
  snippet: string
  source: 'local' | 'incanter' | 'zodiac'
  parent?: { documentId: string; title: string; snippet: string; stale: boolean }
}

/** The flat-mode trace (A1). */
export interface FlatTrace {
  mode: 'flat'
  engine: string
  topK: number
  source: 'local' | 'incanter' | 'zodiac'
}

/** The graph-mode trace entry (A1). */
export interface GraphTraceEntry {
  from: { documentId: string; nodeId: string }
  to: { documentId: string; nodeId: string }
  edge: 'link' | 'embed'
  state: 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'
}

/** The trace — per-mode (A1). */
export type RagTrace = FlatTrace | GraphTraceEntry[]

/** The blocked-by entry (graph mode, empty result — a valid state, not an
 *  error). */
export interface BlockedByEntry {
  documentId: string
  nodeId: string
  state: 'BROKEN' | 'STALE'
}

/** The extended RAG query options (A1 + A2). */
export interface RagQueryOptions {
  wikiId?: string
  topK?: number
  filters?: RagQueryFilters
  mode?: 'flat' | 'graph'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
}

/** The extended RAG result (A1 + A2). The existing RetrievalResult fields
 *  (ranked/context/markdown/lineMap/k) are PRESERVED — a backward-compatible
 *  additive extension. */
export interface RagResult {
  query: string
  /** The contract's per-result items (A1/A2). */
  results: RagResultItem[]
  /** The engine identifier. The current Astrographer value is 'local' (the
   *  contract's 'incanter' is the Auspicion Suite's framing — F4). */
  engine: string
  /** The deduplicated grounding set (A1). */
  citations: Array<{ documentId: string; nodeId: string }>
  /** The per-mode trace (A1). */
  trace: RagTrace
  /** Present ONLY in graph mode when the traversal resolves no target (A2). */
  blockedBy?: BlockedByEntry[]
  // ---- the preserved existing surface (backward-compatible) ----
  ranked: ScoredNode[]
  context: RagNode[]
  markdown: string
  lineMap: LineNodeMap
  k: number
}
```

**The `snippet` field:** the node's `content` truncated to a fixed length
(`SNIPPET_MAX_LENGTH`, default 200 chars). A node with content longer than the
cap is truncated; a node with empty content yields `''`. Deterministic.

**The `engine` field:** the current Astrographer value is `'local'` (the local
lexical/vector retrieval engine). The contract's `'incanter'` is the Auspicion
Suite's framing, reconciled when the Incanter edge lands (F4). The `engine`
value is a module constant (`RAG_ENGINE_ID = 'local'`).

**The `source` field:** the current Astrographer value is `'local'`. The
`'incanter'`/`'zodiac'` values are reserved in the union but not produced by the
current engine (F4 / §5.7 of the contract).

**Fail-states:**

- `ragQuery` with a null/undefined `store`/`embedder`/`index`, a non-string
  `query`, or null/undefined `opts` → rejects
  `Error('ragQuery: store/embedder/index/query/opts required')`.
- An empty/whitespace `query` → rejects
  `Error('ragQuery: query must be a non-empty string')`.
- `opts.topK` < 1 or > 50 → rejects
  `Error('ragQuery: topK must be an integer in [1, 50]')`.
- `opts.mode` not `'flat'`/`'graph'` → rejects
  `Error('ragQuery: mode must be "flat" or "graph"')` (the extended
  `ValidationError` — FS-3).
- `opts.maxHops` not an integer in [1, 5] → rejects
  `Error('ragQuery: maxHops must be an integer in [1, 5]')` (the extended
  `ValidationError` — FS-3).
- `opts.expand` not `'none'`/`'parent'` → rejects
  `Error('ragQuery: expand must be "none" or "parent"')` (the extended
  `ValidationError` — FS-3).
- `opts.maxParentContext` not a positive integer → rejects
  `Error('ragQuery: maxParentContext must be a positive integer')` (the
  extended `ValidationError` — FS-3).
- `opts.filters` malformed (a `nodeKind`/`edgeType`/`state` outside the closed
  union, a `target` missing `documentId`/`nodeId`, a non-object `filters`) →
  rejects `Error('ragQuery: filters malformed')` (the extended
  `ValidationError` — FS-3).
- **`TraceUnavailable` (FS-16):** if the engine returns results without a
  `trace` (a defensive fail-state — the current local engine always produces a
  trace), `ragQuery`/`rag-stream` fail with
  `Error('ragQuery: TraceUnavailable — result has no trace')`.
  **Testability (Architect arbitration 2026-09-08):** the local engine always
  produces a trace, so FS-16 is NOT reachable through the normal path. It is a
  defensive guard in `ragQuery`/the MCP handler, verified by a defensive
  assertion that the happy result carries a `trace` (the TestWriter's approach).

### 5.3 The document-id derivation + the citations builder

```ts
// src/main/retrieval.ts (extended)

/** Derive the document id(s) for a node: the document(s) whose docNodeIds (via
 *  computeDocumentSubgraph) include the node. Returns [] if the node belongs to
 *  no document. Deterministic (sorted ascending). */
export function documentIdsForNode(store: RagStore, nodeId: string): string[]

/** Build the deduplicated grounding set from the result items. Order is by
 *  first appearance in the result set; duplicates (same documentId+nodeId) are
 *  removed. */
export function buildCitations(items: RagResultItem[]): Array<{ documentId: string; nodeId: string }>

/** Build the flat-mode trace. */
export function buildFlatTrace(engine: string, topK: number, source: 'local' | 'incanter' | 'zodiac'): FlatTrace
```

**`documentIdsForNode(store, nodeId)` behavior:**

- For each `documentId` in the store's document set (the targets of the
  `doc-head` edges, via `edgesByKind('doc-head')`), compute
  `computeDocumentSubgraph(store, documentId).docNodeIds` and include
  `documentId` if it contains `nodeId`.
- Returns the matching document ids sorted ascending (deterministic).
- A node in no document → `[]`.

**`buildCitations(items)` behavior:**

- Iterates the result items in order; for each `{documentId, nodeId}`, adds it
  to the output if not already present (dedup by the `(documentId, nodeId)`
  tuple). Order is by first appearance.

**`buildFlatTrace(engine, topK, source)` behavior:**

- Returns `{ mode: 'flat', engine, topK, source }`.

**Fail-states:**

- `documentIdsForNode` with a null/undefined `store` or a non-string `nodeId` →
  throws `Error('documentIdsForNode: store/nodeId required')`.
- `buildCitations` with null/undefined `items` → throws
  `Error('buildCitations: items required')`.
- `buildFlatTrace` with a non-string `engine`/`source` or a non-positive-integer
  `topK` → throws `Error('buildFlatTrace: engine/topK/source required')`.

### 5.4 The graph-mode walk (`walkReferenceGraph`)

```ts
// src/main/retrieval.ts (extended)

export interface WalkOptions {
  maxHops: number
  filters?: RagQueryFilters
}

export interface WalkResult {
  /** The resolved target nodes the traversal reached (deduped by
   *  (documentId, nodeId)). */
  targets: RagResultItem[]
  /** The ordered reference→fact path walked (the graph-mode trace). */
  trace: GraphTraceEntry[]
  /** Present when the traversal resolves no target (a valid state, not an
   *  error). */
  blockedBy?: BlockedByEntry[]
}

/** Walk the reference→fact graph from the seed nodes, hop-limited, resolving
 *  through FRESH/RESOLVED and surfacing BROKEN/STALE. Deterministic. */
export function walkReferenceGraph(
  store: RagStore,
  seeds: RagResultItem[],
  opts: WalkOptions,
): WalkResult
```

**Behavior (pinned):**

- **Seeds:** the top-k scored nodes (from `selectTopK`, filtered to score > 0).
- **The walk:** from each seed, follow the `reference`→`fact` edges (the
  `crosslink`-kind edges whose target is a `reference` OR `fact` node — a
  `content` target is NON-traversable) via the Unit V1 adjacency methods
  (`edgesFrom`/`edgesTo`/`edgesByKind`). A `reference` node resolves to its
  target `fact` node; a `fact` node that is the source of a `reference`→`fact`
  edge resolves to its target `fact` (a fact-to-fact dependency). A `reference`
  target is a WAYPOINT (not a resolved target) — this is what makes
  `HopLimitExceeded` (a reference chain longer than `maxHops`) and
  `CycleDetected` (a reference→fact→reference cycle) reachable.
  **Continuation rule (Architect arbitration 2026-09-08):** the walk continues
  hop-by-hop from a resolved `fact` node along its outgoing `reference`→`fact`
  edges, so a chain `reference → fact → fact → …` is traversed until it resolves
  a target, exceeds `maxHops`, or detects a cycle.
- **Resolve-through-FRESH/RESOLVED:** the walk proceeds through `FRESH`/`RESOLVED`
  edges and resolves the target `fact` nodes.
- **Surface-BROKEN/STALE:** a `BROKEN`/`STALE` edge is NOT traversed; it is
  recorded in the trace (never silently traversed). A traversal that resolves
  no target returns `{ targets: [], trace, blockedBy: [{documentId, nodeId,
  state}] }` (a valid state, not an error).
- **Hop limit:** the walk stops when it exceeds `maxHops` (default 3, range
  [1, 5]) without resolving a target → `HopLimitExceeded`.
- **Cycle protection:** the walk detects a `reference`→`fact` cycle (a node
  revisited on the current path) → `CycleDetected`.
- **Filters:** a `filters.nodeKind`/`edgeType`/`state`/`target` restricts the
  walk's node/edge set.
- **Determinism:** the same store + same seeds + same options → the same result
  (twice). The walk is deterministic (a fixed seed order, a fixed edge order via
  the adjacency methods).

**Fail-states:**

- `walkReferenceGraph` with a null/undefined `store`/`seeds`/`opts` → throws
  `Error('walkReferenceGraph: store/seeds/opts required')`.
- `opts.maxHops` not an integer in [1, 5] → throws
  `Error('walkReferenceGraph: maxHops must be an integer in [1, 5]')`.
- **`HopLimitExceeded` (FS-17):** the walk exceeds `maxHops` without resolving a
  target → throws `Error('walkReferenceGraph: HopLimitExceeded')`.
- **`CycleDetected` (FS-18):** the walk detects a `reference`→`fact` cycle →
  throws `Error('walkReferenceGraph: CycleDetected')`.

### 5.5 The parent-context expansion (`expandParentContext`)

```ts
// src/main/retrieval.ts (extended)

/** Expand the top-capped result items with their parent Document/node-cluster
 *  context. Capped by maxParentContext; stale-propagating. Deterministic. */
export function expandParentContext(
  store: RagStore,
  items: RagResultItem[],
  maxParentContext: number,
): RagResultItem[]
```

**Behavior (pinned):**

- **Cap:** only the top `maxParentContext` items (by the result order) are
  expanded; items beyond the cap are returned WITHOUT a `parent`.
- **Parent:** for a retrieved child node, the parent is the node's owning
  Document (the `documentId` from `documentIdsForNode`) — the parent Document's
  `title` (the `doc-head` edge's source node's `content`) and a `snippet` (the
  parent Document's head node content, truncated to `SNIPPET_MAX_LENGTH`). If
  the child has no owning document, the `parent` is omitted.
- **Stale-propagating (Architect arbitration 2026-09-08):** a child's
  `parent.stale` is `true` if ANY incoming `reference`→`fact` edge to the child
  has `state: 'STALE'`; otherwise `false`. (A `STALE` edge is not traversed by
  the walk, so a child reached via a `RESOLVED` edge can still carry `stale:
  true` if it ALSO has a `STALE` incoming reference→fact edge.)
- **Determinism:** the parent lookup is deterministic (the same store + the same
  items + the same cap → the same result).

**Fail-states:**

- `expandParentContext` with a null/undefined `store`/`items` → throws
  `Error('expandParentContext: store/items required')`.
- `maxParentContext` not a positive integer → throws
  `Error('expandParentContext: maxParentContext must be a positive integer')`.

### 5.6 The extended retrieval entry point (`ragQuery`)

```ts
// src/main/retrieval.ts (extended)

/** The extended retrieval entry point (A1 + A2). Selects the top-k, then either
 *  (flat mode) assembles the context + builds the flat trace, or (graph mode)
 *  walks the reference→fact graph + builds the graph trace. Applies the filters
 *  and the parent-context expansion. ASYNC. */
export async function ragQuery(
  store: RagStore,
  embedder: Embedder,
  index: LexicalIndex,
  query: string,
  opts: RagQueryOptions,
): Promise<RagResult>
```

**Behavior (pinned):**

- Validates the options (§5.2 fail-states).
- `mode` defaults to `'flat'`; `maxHops` defaults to 3; `expand` defaults to
  `'none'`; `maxParentContext` defaults to 5; `topK` defaults to 5.
- **Flat mode:** selects the top-k via `selectTopK`, filters to score > 0 (the
  existing `retrieve` behavior), assembles the context via `assembleContext`,
  builds the `results` array (each item = `{documentId, nodeId, score, snippet,
  source: 'local'}`), builds `citations` via `buildCitations`, and builds the
  flat trace via `buildFlatTrace('local', topK, 'local')`.
- **Graph mode:** selects the top-k via `selectTopK`, filters to score > 0, then
  walks the `reference`→`fact` graph via `walkReferenceGraph`. The `results`
  array is the resolved target nodes the traversal reached (deduped by
  `(documentId, nodeId)`); `citations` is the same deduped set; `trace` is the
  graph-mode trace; `blockedBy` is present when the traversal resolves no
  target.
- **Filters:** the `filters` restrict which nodes/edges the walk (or the flat
  retrieval) considers. In graph mode, a `filters.nodeKind`/`edgeType`/`state`/
  `target` restricts the walk's node/edge set. In flat mode, a
  `filters.nodeKind` restricts the scored node set (a node whose `nodeKind`
  does not match is excluded from the results).
- **Parent-context:** when `expand: 'parent'`, the `results` array is passed
  through `expandParentContext(store, results, maxParentContext)`.
- **`TraceUnavailable` (FS-16):** if the result has no `trace` (a defensive
  fail-state), `ragQuery` rejects with `Error('ragQuery: TraceUnavailable —
  result has no trace')`.
- **The preserved surface:** the result carries the existing
  `ranked`/`context`/`markdown`/`lineMap`/`k` fields (from the flat-mode
  assembly; in graph mode, `context`/`markdown`/`lineMap` are the flat-mode
  assembly of the resolved target nodes).

**Fail-states:** all §5.2 fail-states, plus the `walkReferenceGraph` fail-states
(`HopLimitExceeded`, `CycleDetected`) in graph mode.

### 5.7 The query audit log (`getQueryAuditLog` + MCP `get_query_audit_log` + the GUI audit panel)

```ts
// src/main/query-audit.ts (NEW — pure, no Electron)

export interface QueryAuditEntry {
  query: string
  filters: RagQueryFilters | null
  mode: 'flat' | 'graph'
  resultCount: number
  timestamp: string  // ISO-8601 UTC
  requester: string
}

export interface QueryAuditLog {
  /** Record a query. Bounded — when the log is full, the OLDEST entry is
   *  dropped (never throws). */
  record(entry: QueryAuditEntry): void
  /** Return a copy of the entries, newest first. */
  list(): QueryAuditEntry[]
  /** Clear the log. */
  clear(): void
}

/** Create the bounded audit log (a ring buffer, default 1000 entries). */
export function createQueryAuditLog(maxEntries?: number): QueryAuditLog
```

**Behavior (pinned):**

- `record(entry)` appends the entry; when the log exceeds `maxEntries` (default
  1000), the OLDEST entry is dropped (a ring buffer). Never throws on a full
  log.
- `list()` returns a COPY of the entries, newest first (a fresh array; the
  caller cannot mutate the log through it).
- `clear()` empties the log.
- **The `requester` field:** the GUI user id or the MCP caller identity. The
  current Astrographer has no user-identity concept; the MCP path records
  `'mcp'` (or a caller-supplied identity if one is threaded), the GUI path
  records `'gui'`. Best-effort.
- **The `filters` field:** the `filters` used (or `null` when none).
- **The `resultCount` field:** the number of result items returned.
- **The `timestamp` field:** ISO-8601 UTC.

**Fail-states:**

- `createQueryAuditLog` with a non-positive-integer `maxEntries` → throws
  `Error('createQueryAuditLog: maxEntries must be a positive integer')`.
- `record` with a null/undefined `entry` → throws
  `Error('query audit: entry required')`.

**The MCP `get_query_audit_log` tool (`src/main/mcp-server.ts`):**

- **Input schema (zod):** `{}` (no inputs).
- **Handler:** returns `{ entries: auditLog.list() }`.
- **Gating:** the tool is in the `rag` group (read-only, default-off — Unit B
  §5.3). A call with the group disabled → not registered, not callable.
- **The audit log is created ONCE in main** and shared by the MCP `rag.query`/
  `rag-stream` handlers + the `rag-query` IPC + the `get_query_audit_log` tool.
  **Threading (Architect arbitration 2026-09-08):** `handleRagTool` gains an
  optional `auditLog?: QueryAuditLog | null` param (after `dir`). The
  `rag.query`/`rag-stream` handlers record to it; the `get_query_audit_log` tool
  reads from it. The `rag-query` IPC handler (`handleRagQueryIpc`) also threads
  the same `auditLog` through to `handleRagTool`. When `auditLog` is null/absent,
  the handlers skip recording (no throw).

**The GUI audit panel (D4 parity):**

- The GUI audit panel renders the `getQueryAuditLog` entries (`query`,
  `filters`, `mode`, `resultCount`, `timestamp`, `requester`). It reads the SAME
  audit log via a `rag-query-audit` IPC (the UI path), so the MCP
  `get_query_audit_log` tool and the GUI audit panel are equivalent (§8.2, a
  BINDING constraint).

**Fail-states:**

- `get_query_audit_log` with the `rag` group disabled → not registered, not
  callable (Unit B §5.3).
- A `get_query_audit_log` that reaches the renderer switch → `unknown method`
  throw (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.8 The extended `rag.query` MCP tool + the `rag-stream` tool

**The `rag.query` tool (`src/main/mcp-server.ts`):**

- **Input schema (zod):** `{ query: string, topK?: number, store?: string,
  mode?: 'flat'|'graph', maxHops?: number, expand?: 'none'|'parent',
  maxParentContext?: number, filters?: RagQueryFilters }`.
- **Handler (main-handled, `handleRagTool`):**
  - Validates the input against the zod schema.
  - `query` must be a non-empty string; `topK` (if given) must be a positive
    integer in [1, 50] (default 5); `mode` must be `'flat'`/`'graph'` (default
    `'flat'`); `maxHops` must be an integer in [1, 5] (default 3); `expand` must
    be `'none'`/`'parent'` (default `'none'`); `maxParentContext` must be a
    positive integer (default 5); `filters` must be well-formed.
  - Calls the retrieval engine's `await ragQuery(store, embedder, index, query,
    opts)` (the SAME module the UI `rag-query` IPC calls — §8.2 MCP/UI
    equivalence).
  - Records the call in the audit log (`record({ query, filters, mode,
    resultCount, timestamp, requester: 'mcp' })`).
  - Returns the JSON result: `{ ...ragResult, store }` (the `store` field is the
    U-MS2 F3 stamp, preserved).
- **Gating:** the tool is callable only when the `rag` group is enabled
  (default-off — Unit B §5.3).

**The `rag-stream` tool (`src/main/mcp-server.ts`):**

- **Input schema (zod):** the same as `rag.query` (`{ query, topK?, store?,
  mode?, maxHops?, expand?, maxParentContext?, filters? }`).
- **Handler:** runs the SAME `ragQuery` and returns a DEGENERATE stream — an
  array of `RagChunk` values: `[{ type: 'result', result: RagResult },
  { type: 'done' }]`. On a fail-state, it returns
  `[{ type: 'error', error: <message> }]` (the stream closes after the error
  chunk). **Error-chunk message (Architect arbitration 2026-09-08):** the error
  chunk carries the SAME `rag.query:`-prefixed reject message as the `rag.query`
  tool (e.g. `'rag.query: query must be a non-empty string'`). The contract's
  SSE framing is the Auspicion Suite's framing; the Astrographer MCP surface
  materializes the stream as a chunk array (the MCP SDK does not natively stream
  tool results).
- **Gating:** the tool is in the `rag` group (read-only, default-off).

**Fail-states:**

- `rag.query`/`rag-stream` with a non-string/empty `query` → the tool rejects it
  (`'rag.query: query must be a non-empty string'`).
- `rag.query`/`rag-stream` with a non-positive-integer `topK` or `topK > 50` →
  the tool rejects it (`'rag.query: topK must be an integer in [1, 50]'`).
- `rag.query`/`rag-stream` with an invalid `mode`/`maxHops`/`expand`/
  `maxParentContext`/`filters` → the tool rejects it (the extended
  `ValidationError` — FS-3).
- `rag.query`/`rag-stream` with the `rag` group disabled → not registered, not
  callable (Unit B §5.3).
- A `rag.query`/`rag-stream` that reaches the renderer switch → `unknown method`
  throw (fail-closed, the negative contract — Unit B §5.3 Seam 4).

### 5.9 Happy-path states (TestWriter red set — valid paths)

1. **`documentIdsForNode` happy:** a node in a document → the document id(s)
   whose `docNodeIds` include the node.
2. **`documentIdsForNode` no document:** a node in no document → `[]`.
3. **`buildCitations` happy:** result items with duplicates → the deduplicated
   grounding set, first-appearance order.
4. **`buildFlatTrace` happy:** `buildFlatTrace('local', 5, 'local')` →
   `{ mode: 'flat', engine: 'local', topK: 5, source: 'local' }`.
5. **`ragQuery` flat happy:** a query → the result with `results`, `citations`,
   the flat `trace`, and the preserved `ranked`/`context`/`markdown`/`lineMap`/
   `k`.
6. **`ragQuery` graph happy:** a query in `mode: 'graph'` → the result with the
   resolved target nodes, the graph-mode `trace`, and `citations` = the deduped
   resolved targets.
7. **`ragQuery` graph blocked:** a graph traversal that resolves no target →
   `{ results: [], citations: [], trace, blockedBy: [{documentId, nodeId,
   state}] }` (a valid state, not an error).
8. **`ragQuery` filters:** a `filters.nodeKind`/`edgeType`/`state`/`target`
   restricts the walk's node/edge set.
9. **`ragQuery` parent-context:** `expand: 'parent'` → the top `maxParentContext`
   items carry a `parent` field; items beyond the cap are returned without one.
10. **`ragQuery` parent-context stale:** a child reached via a `STALE` embed →
    the `parent` carries `stale: true`.
11. **`walkReferenceGraph` happy:** seeds → the ordered `reference`→`fact` path
    walked, in traversal order.
12. **`walkReferenceGraph` resolve-through-FRESH/RESOLVED:** the walk proceeds
    through `FRESH`/`RESOLVED` edges and resolves the target `fact` nodes.
13. **`walkReferenceGraph` surface-BROKEN/STALE:** a `BROKEN`/`STALE` edge is
    NOT traversed; it is recorded in the trace.
14. **`walkReferenceGraph` determinism:** the same store + same seeds + same
    options → the same result (twice).
15. **`expandParentContext` happy:** items + a cap → the top-capped items carry a
    `parent`; the rest do not.
16. **`createQueryAuditLog` + `record` + `list` happy:** recorded entries are
    returned newest-first.
17. **`createQueryAuditLog` bounded:** a log exceeding `maxEntries` drops the
    OLDEST entries (never throws).
18. **`get_query_audit_log` happy:** the MCP tool returns `{ entries }` from the
    shared audit log.
19. **MCP/UI equivalence happy:** an MCP `rag.query` and a UI `rag-query` IPC
    with the same params → the same result (both awaited); the MCP
    `get_query_audit_log` and the GUI audit panel read the SAME audit log.

### 5.10 Fail-states (TestWriter red set — documented fail-states)

1. **`ragQuery` null/undefined store/embedder/index, non-string query, or
   null/undefined opts** → rejects
   `Error('ragQuery: store/embedder/index/query/opts required')`.
2. **`ragQuery` empty/whitespace query** → rejects
   `Error('ragQuery: query must be a non-empty string')`.
3. **`ragQuery` topK < 1 or > 50** → rejects
   `Error('ragQuery: topK must be an integer in [1, 50]')`.
4. **`ragQuery` invalid mode** → rejects
   `Error('ragQuery: mode must be "flat" or "graph"')` (FS-3).
5. **`ragQuery` maxHops out of range** → rejects
   `Error('ragQuery: maxHops must be an integer in [1, 5]')` (FS-3).
6. **`ragQuery` invalid expand** → rejects
   `Error('ragQuery: expand must be "none" or "parent"')` (FS-3).
7. **`ragQuery` invalid maxParentContext** → rejects
   `Error('ragQuery: maxParentContext must be a positive integer')` (FS-3).
8. **`ragQuery` malformed filters** → rejects
   `Error('ragQuery: filters malformed')` (FS-3).
9. **`ragQuery` TraceUnavailable (FS-16)** → rejects
   `Error('ragQuery: TraceUnavailable — result has no trace')`.
10. **`walkReferenceGraph` null/undefined store/seeds/opts** → throws
    `Error('walkReferenceGraph: store/seeds/opts required')`.
11. **`walkReferenceGraph` maxHops out of range** → throws
    `Error('walkReferenceGraph: maxHops must be an integer in [1, 5]')`.
12. **`walkReferenceGraph` HopLimitExceeded (FS-17)** → throws
    `Error('walkReferenceGraph: HopLimitExceeded')`.
13. **`walkReferenceGraph` CycleDetected (FS-18)** → throws
    `Error('walkReferenceGraph: CycleDetected')`.
14. **`expandParentContext` null/undefined store/items** → throws
    `Error('expandParentContext: store/items required')`.
15. **`expandParentContext` invalid maxParentContext** → throws
    `Error('expandParentContext: maxParentContext must be a positive integer')`.
16. **`documentIdsForNode` null/undefined store or non-string nodeId** → throws
    `Error('documentIdsForNode: store/nodeId required')`.
17. **`buildCitations` null/undefined items** → throws
    `Error('buildCitations: items required')`.
18. **`buildFlatTrace` non-string engine/source or non-positive-integer topK** →
    throws `Error('buildFlatTrace: engine/topK/source required')`.
19. **`createQueryAuditLog` non-positive-integer maxEntries** → throws
    `Error('createQueryAuditLog: maxEntries must be a positive integer')`.
20. **`record` null/undefined entry** → throws
    `Error('query audit: entry required')`.
21. **`rag.query`/`rag-stream` non-string/empty query** → the tool rejects it
    (`'rag.query: query must be a non-empty string'`).
22. **`rag.query`/`rag-stream` non-positive-integer topK or topK > 50** → the
    tool rejects it (`'rag.query: topK must be an integer in [1, 50]'`).
23. **`rag.query`/`rag-stream` invalid mode/maxHops/expand/maxParentContext/
    filters** → the tool rejects it (FS-3).
24. **`rag.query`/`rag-stream`/`get_query_audit_log` with the `rag` group
    disabled** → not registered, not callable (Unit B §5.3).
25. **`rag.query`/`rag-stream`/`get_query_audit_log` reaching the renderer
    switch** → `unknown method` throw (fail-closed, the negative contract —
    Unit B §5.3 Seam 4).
26. **`putNode` with a `nodeKind` outside the closed union** → throws
    `Error('rag putNode: nodeKind required/invalid')`.
27. **`putEdge` with an `edgeType`/`state` outside the closed union** → throws
    `Error('rag putEdge: edgeType/state required/invalid')`.

### 5.11 Census / numeric claims

- **New exported functions:** `ragQuery`, `walkReferenceGraph`,
  `expandParentContext`, `documentIdsForNode`, `buildCitations`,
  `buildFlatTrace` (in `src/main/retrieval.ts`); `createQueryAuditLog` (in the
  NEW `src/main/query-audit.ts`).
- **New exported types:** `RagQueryFilters`, `RagResultItem`, `FlatTrace`,
  `GraphTraceEntry`, `RagTrace`, `BlockedByEntry`, `RagQueryOptions`, `RagResult`
  (in `src/main/retrieval.ts`); `QueryAuditEntry`, `QueryAuditLog` (in
  `src/main/query-audit.ts`); `RagNodeKind`, `RagEdgeType`, `RagReferenceState`
  (in `src/main/rag-store.ts`).
- **New MCP tools:** 2 (`get_query_audit_log`, `rag-stream`); the `rag.query`
  tool is EXTENDED (the new params + the `citations`/`trace`/`blockedBy`/
  `results` result fields).
- **New fail-states:** 3 (`TraceUnavailable` FS-16, `HopLimitExceeded` FS-17,
  `CycleDetected` FS-18) + the extended `ValidationError` (FS-3: invalid `mode`,
  `maxHops` out of range, malformed `filters`).
- **Defaults:** `mode` = `'flat'`; `maxHops` = 3; `expand` = `'none'`;
  `maxParentContext` = 5; `topK` = 5.
- **Bounds:** `maxHops` ∈ [1, 5]; `topK` ∈ [1, 50]; `maxParentContext` ≥ 1.
- **Audit log bound:** `maxEntries` = 1000 (default).
- **Snippet cap:** `SNIPPET_MAX_LENGTH` = 200 (default).
- **Engine id:** `RAG_ENGINE_ID` = `'local'` (the contract's `'incanter'` is the
  Auspicion Suite's framing — F4).
- **Additive store fields:** 3 (`RagNode.nodeKind`, `RagEdge.edgeType`,
  `RagEdge.state`), all hash-covered, no migration/re-hash.
- **The `reference`→`fact` graph:** the subgraph of `crosslink`-kind edges whose
  source is a `reference` node and target is a `fact` node.

### 5.12 Cross-references

- The canonical contract: `../Auspicion Suite/docs/specs/astrographer.md` §4.3.2
  (the RAG query operations), §4.3.4 (result-level provenance — A1), §4.3.5
  (multi-hop traversal + relationship filtering + parent-context — A2), §4.5.1
  (the MCP tool set — `get_query_audit_log` + the new `rag_query`/`rag_stream`
  params), §4.6.2 (the GUI parity mapping — the RAG audit panel + the RAG query
  panel params), §6 (FS-16/17/18, FS-3), §7.6 (GAP-7 — re-scoped to
  Astrographer).
- Unit E: `docs/specs/unit-e-rag-index.md` §5.2 (the `Embedder` interface),
  §5.3 (`selectTopK`), §5.4 (`assembleContext`), §5.5 (`retrieve`), §5.6 (the
  retrieval engine), §5.7 (the `rag.query` MCP tool + MCP/UI equivalence).
- Unit F: `docs/specs/unit-f-embeddings.md` §5.1 (the async `Embedder`
  interface).
- Unit V1: `docs/specs/unit-v1-store-adjacency.md` §5.1 (the shared PURE
  adjacency core), §5.2 (the `RagStore` adjacency methods), §5.4
  (`createSnapshotStore`).
- Unit V2: `docs/specs/unit-v2-scoped-traversal-mcp.md` §5.2
  (`computeDocumentSubgraph` — the document-id derivation uses it).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (the five-seam gate — the
  `rag` group).
- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (the RAG node/edge shapes), §5.4
  (the `RagStore` interface).
- Unit G: `docs/specs/unit-g-crosslink-backlink.md` §4 (the `crosslink` edge
  kind — the `reference`→`fact` graph substrate).
- Unit M: `docs/specs/unit-m-children-field.md` §4/§5.1 (the
  CHILDREN-ADDITIVE-STORE-FORMAT precedent the additive fields follow).
- Gate: `docs/specs/astrographer-review.md` §8.2 (MCP/UI equivalence — a BINDING
  constraint), §9.2.10 (retrieval selection), §9.2.6 (SINGLE-WRITER-STORE),
  §9.2.7 (RAG-EDIT-MCP-GROUPS).
- Decisions: `docs/decisions.md` rows **LEXICAL-FIRST-RETRIEVAL**,
  **RAG-EDIT-MCP-GROUPS**, **SINGLE-WRITER-STORE**, **MCP-UI-EQUIVALENCE**,
  **SOURCE-SWITCHABLE**, **CROSSLINK-EDGE-KIND**, **CROSS-DOCUMENT-SHARED**,
  **CHILDREN-ADDITIVE-STORE-FORMAT**. New rows pinned by this spec (added when
  the unit lands): **RESULT-LEVEL-PROVENANCE**, **QUERY-AUDIT-LOG**,
  **GRAPH-MODE-WALK**, **PARENT-CONTEXT-EXPAND**,
  **REFERENCE-GRAPH-ADDITIVE-FIELDS**.
- Host patterns: `src/main/retrieval.ts` (the extended result + the graph walk +
  parent-context + filters), `src/main/query-audit.ts` (NEW — the audit log),
  `src/main/mcp-server.ts` (the extended `rag.query` handler + the
  `get_query_audit_log`/`rag-stream` tools), `src/main/rag-store.ts` (the
  additive `nodeKind`/`edgeType`/`state` fields).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/main/retrieval.ts` (the extended
result + the graph walk + parent-context + filters), the NEW
`src/main/query-audit.ts`, and `src/main/mcp-server.ts` (the extended
`rag.query` handler + the `get_query_audit_log`/`rag-stream` tools) from
§5.9/§5.10. The red set (recorded in the next-steps DONE row for this unit):

- **The additive store fields:** the `putNode`/`putEdge` fail-states (26, 27),
  the additive-load + hash-coverage behavior.
- **The provenance builders:** `documentIdsForNode` (1, 2, 16), `buildCitations`
  (3, 17), `buildFlatTrace` (4, 18).
- **The extended entry point:** `ragQuery` flat/graph happy (5, 6), the blocked
  state (7), the filters (8), the parent-context (9, 10), the fail-states
  (1–9).
- **The graph walk:** `walkReferenceGraph` happy (11–14), the fail-states
  (10–13).
- **The parent-context:** `expandParentContext` happy (15), the fail-states
  (14, 15).
- **The audit log:** `createQueryAuditLog` + `record` + `list` happy (16, 17),
  the fail-states (19, 20).
- **The MCP tools:** `get_query_audit_log` happy (18), the `rag.query`/
  `rag-stream` fail-states (21–25), the MCP/UI equivalence (19).
