# Spec — Unit V1: Store Adjacency (`RagStore` adjacency methods + `createSnapshotStore`)

- **Status:** SPEC (the scoped-load fix, Unit 1 of 3). Gate reference:
  `docs/specs/load-bug-scoped-traversal-review.md` §5 (the amendments), §6
  (the unit split — Unit 1 = store adjacency). Decisions:
  `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**,
  **SOURCE-SWITCHABLE**, **SUBTREE-OWNERSHIP**, **MULTI-PARENT-DUPLICATE**,
  **DERIVED-DOC-FLOW**, **DOC-CHILD**, **CROSS-DOCUMENT-SHARED**.
- **Scope:** the new `RagStore` adjacency methods (`edgesFrom`, `edgesTo`,
  `edgesByKind`, `edgesForDocument`, `docHeadForDocument`) on the JSON store
  (`src/main/rag-store.ts`), the lazy O(E) adjacency indexes (invalidated on
  mutation), the shared PURE adjacency core (the single implementation both the
  JSON store and the snapshot adapter delegate to — in the NODE-FREE
  `src/main/adjacency.ts`, re-exported by `src/main/rag-store.ts`), and the new
  read-only `createSnapshotStore(nodes, edges)` adapter (also in
  `src/main/adjacency.ts`). This unit is SELF-CONTAINED — it
  adds the adjacency surface + the adapter; it does NOT change `buildTraversal`
  (Unit V2) or the doc-nav (Unit V3). It is the dependency both later units
  build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/rag-store.ts` (the
  JSON-store adjacency methods) + `src/main/adjacency.ts` (the shared PURE
  adjacency core + `createSnapshotStore`) from §5.8/§5.9 before any
  implementation.

---

## 1. What the proposal asks

1. **New `RagStore` adjacency methods** (`src/main/rag-store.ts`):
   `edgesFrom(source)`, `edgesTo(target)`, `edgesByKind(kind)`,
   `edgesForDocument(documentId)`, `docHeadForDocument(documentId)`. The JSON
   store builds **lazy O(E) indexes** (one O(E) pass, built on first adjacency
   query), **invalidated on mutation** (any write through the single-writer
   queue). These turn the scoped walk's O(E²)/O(S·E)/O(N·E) full-edge scans
   (Unit V2) into O(E) index build + O(adjacency) lookups.
2. **A shared PURE adjacency core** — the single implementation of the
   adjacency semantics, used by BOTH the JSON store AND the snapshot adapter
   (amendment 3 — HIGH: `createSnapshotStore` must delegate to the SAME pure
   adjacency functions, not a re-implementation, so the renderer's traversal
   cannot diverge from main's).
3. **A new read-only `createSnapshotStore(nodes, edges)` adapter** — the
   established read-only-adapter pattern (`rebuildBackRefs`'s inline adapter at
   `traversal.ts:490` and the host's `buildTraversalEnvelope` adapter at
   `sidebar-panes.ts:824` currently implement only `listNodes`/`listEdges`).
   Once `buildTraversal` calls the new adjacency methods (Unit V2), BOTH
   existing adapters MUST be replaced by `createSnapshotStore` (or implement the
   new methods), or `buildTraversal` throws (amendment 4 — HIGH). This unit
   provides `createSnapshotStore` so Unit V2 can make that replacement.

## 2. Feasibility verdict

**Feasible — grounded in the existing `RagStore` interface (Unit A §5.4) and
the established read-only-adapter pattern.**

- **Adjacency methods are additive to the `RagStore` interface** (Unit A §5.4).
  The JSON store already holds `nodes`/`edges` Maps; a lazy `edgesFrom`/`edgesTo`/
  `edgesByKind`/`edgesForDocument`/`docHeadForDocument` index (one O(E) build,
  invalidated on mutation) is a small, self-contained change. Reads are
  lock-free (Unit A §5.5); mutations go through the single-writer queue, so the
  index invalidation happens inside the queue.
- **`createSnapshotStore`** is the established read-only-adapter pattern
  (`rebuildBackRefs` at `traversal.ts:490`, the host at `sidebar-panes.ts:824`).
  It must implement the SAME adjacency semantics as the JSON store — which the
  shared PURE adjacency core guarantees (amendment 3).
- **The shared PURE adjacency core** is a pure data structure over `RagEdge[]`
  (a `Map`-based index + pure query helpers) — no Electron, no engine
  primitive, fully testable in isolation.

No engine/foundation gap blocks this unit. The adjacency methods, the lazy
indexes, the shared core, and the snapshot adapter are all project-specific
(additive to the Unit A interface).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `RagStore` adjacency methods + lazy indexes | Project-specific (additive to the Unit A interface) | Medium cost; the O(E²)/O(S·E)/O(N·E) walk becomes O(E) build + O(adjacency) lookups — the core timeout fix. |
| The shared PURE adjacency core | Project-specific (a pure data structure) | Low cost; the single implementation both the JSON store and the snapshot adapter delegate to (amendment 3). |
| `createSnapshotStore` read-only adapter | Project-specific (the established adapter pattern) | Low cost; must share the JSON store's adjacency implementation to avoid renderer/main divergence (amendment 3). |
| The two existing adapters replaced by `createSnapshotStore` | Project-specific (a mechanical replacement) | Low cost; required so `buildTraversal` does not throw once it calls the new methods (amendment 4). |

No engine gap. The fix is entirely host-side (`src/`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

The post-green adversarial pass (RCA-3) ran after this unit landed. All findings
below are HOST findings in `src/main/rag-store.ts` — fixed here and
regression-tested in `tests/unit-v1-store-adjacency-adversarial.test.ts`.

- **MED-1 — `createSnapshotStore` aliased the caller's input arrays → internal
  inconsistency.** It stored references to the caller's `nodes`/`edges` arrays
  and built the adjacency index once eagerly. A caller mutating the source
  arrays after construction made the read methods and the adjacency methods
  diverge within the same store. **Fixed:** `createSnapshotStore` defensively
  copies `nodes`/`edges` at construction (`nodes.map(copyNode)` /
  `edges.map(copyEdge)`), so the snapshot is a captured, immutable view. The
  read methods and the adjacency methods both read the copies. **Regression
  test:** construct a snapshot, mutate the source arrays, assert the snapshot's
  read + adjacency methods stay consistent (the mutation is NOT reflected).
- **MED-2 — duplicate `documentIds` → duplicate edges in `edgesForDocument`
  (parity gap).** `buildAdjacencyIndex` pushed an edge to `document[d]` once per
  entry in `documentIds`, with no dedup. The JSON store dedupes `documentIds` on
  write (`validateEdgeShape` → `[...new Set(e.documentIds)]`), so a JSON edge
  with `['doc','doc']` returned once while `createSnapshotStore` over the same
  raw edge returned twice — a violation of the amendment-3 parity requirement.
  **Fixed:** `buildAdjacencyIndex` dedupes `documentIds` (iterates
  `new Set(e.documentIds)`) for both the `document` map and the `docHead` map.
  **Regression test:** `edgesForDocument` returns the edge ONCE for a duplicate
  `documentIds` array, and the JSON store + snapshot adapter return identical
  results.
- **MED-3 — "Global" `doc-child` scoping is incomplete for documents with no
  doc-flow edges.** `buildAdjacencyIndex` scopes each `doc-child` edge to every
  document in `docKeys`, where `docKeys` is collected only from edges'
  `documentIds`. A document that exists but has no doc-flow edge is absent from
  `docKeys`, so the "global" `doc-child` edge is not returned for it. **Chosen
  resolution (lower-cost):** document the limitation in the spec — a valid
  document always has a `doc-head` edge (the doc-flow model), so every valid
  document is in `docKeys`. **Regression test:** pins the actual behavior — a
  document with no doc-flow edge is NOT in `docKeys`, so a global `doc-child`
  edge is not returned for it.
- **LOW-4 — throw-message divergence between the two stores.** The JSON store
  threw `rag edgesFrom: source must be a non-empty string` /
  `rag edgesByKind: invalid kind`, while `createSnapshotStore` delegated to the
  pure helpers and threw `edgesFromIndex: ...` / `edgesByKindIndex: ...`.
  **Chosen resolution (lower-cost):** the adapter validates with the
  `rag <method>` prefix (matching the JSON store) before delegating to the pure
  helpers, so the two stores throw identical caller-error messages. **Regression
  test:** the snapshot adapter throws the `rag <method>` prefix messages.
- **LOW-5 — `docHeadForDocument` can return a dangling source id in
  `createSnapshotStore`.** A `doc-head` edge whose `source` node is absent from
  the `nodes` array returns that id; the caller's `getNode(id)` returns
  `undefined`. **Chosen resolution (lower-cost):** document that the adapter
  trusts its input (it is a read-only projection of the given snapshot, not a
  validating store). **Regression test:** pins the actual behavior — a `doc-head`
  edge whose source is absent from the nodes array returns that id.
- **LOW-6 — unnecessary index invalidation on no-op mutations (perf nit).**
  `removeEdgeSync`/`removeNodeSync`/`undoSync`/`redoSync`/`applyBatchSync`
  called `invalidateAdjacency()` even when the mutation was a no-op. **Fixed:**
  gate invalidation on an actual edge-set change — `removeEdgeSync`/`removeNodeSync`
  invalidate only after confirming the record exists; `undoSync`/`redoSync`
  invalidate only after an actually-applied inverse/forward; `applyBatchSync`
  invalidates only on a successful non-empty batch. **Regression test:** no-op
  `removeEdge`/`removeNode`/empty `applyBatch` leave the adjacency index correct
  (no correctness regression).

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** (`docs/specs/load-bug-scoped-traversal-review.md`).
The amendments this unit folds in:

- **Amendment 3 (HIGH) — `createSnapshotStore` shares the adjacency
  implementation.** The read-only adapter MUST delegate to the SAME pure
  adjacency functions the JSON store uses (not a re-implementation). Pinned in
  §5.3 (the shared core) + §5.8 happy-path 12 (the parity test).
- **Amendment 4 (HIGH) — the adapters must implement the new methods.**
  `rebuildBackRefs`'s inline adapter (`traversal.ts:490`) and the host's
  `buildTraversalEnvelope` adapter (`sidebar-panes.ts:824`) currently implement
  only `listNodes`/`listEdges`. Once `buildTraversal` calls the new adjacency
  methods (Unit V2), both MUST be replaced by `createSnapshotStore` (or implement
  the new methods), or `buildTraversal` throws. This unit provides
  `createSnapshotStore`; the replacement itself lands in Unit V2 (the traversal
  change) + Unit V3 (the host change). Pinned in §5.3 + §5.8 happy-path 13.

## 4. Design decisions pinned by this spec

- **ADJACENCY-INDEXED (new):** the `RagStore` exposes the five adjacency methods
  backed by a lazy O(E) index, invalidated on mutation. The index is a pure
  projection of the store's edges — never a separate source of truth.
- **SHARED-ADJACENCY-CORE (new):** the adjacency semantics live in ONE pure
  implementation (`buildAdjacencyIndex` + the query helpers). The JSON store and
  `createSnapshotStore` BOTH delegate to it — the renderer's traversal cannot
  diverge from main's (amendment 3).
- **READ-ONLY-SNAPSHOT-ADAPTER (new):** `createSnapshotStore(nodes, edges)` is a
  read-only `RagStore` adapter. Its mutating methods throw (fail-closed — a
  read-only adapter must not silently accept a write). It is the replacement for
  the two inline `listNodes`/`listEdges`-only adapters (amendment 4).
- **SINGLE-WRITER-STORE (consumed):** the JSON store's adjacency index is
  invalidated inside the single-writer queue (all mutations route through it —
  Unit A §5.5). Reads are lock-free and rebuild the index lazily if dirty.

## 5. The exhaustive contract

### 5.1 The shared PURE adjacency core (`src/main/adjacency.ts`)

The adjacency semantics are implemented ONCE as a pure data structure over
`RagEdge[]`. Both the JSON store's adjacency methods and `createSnapshotStore`'s
adjacency methods delegate to these functions (amendment 3). PURE — no Electron,
no store state; importable in main and renderer. The core lives in the NODE-FREE
`src/main/adjacency.ts` module (so the renderer bundle can import it without
dragging in the main-process builtins) and is re-exported by
`src/main/rag-store.ts`.

```ts
// src/main/adjacency.ts (project-specific; pure, no Electron).

/** The lazy adjacency index — a pure projection of the store's edges. Built in
 *  one O(E) pass. */
export interface AdjacencyIndex {
  /** source → the edges whose `source` is that id (store order). */
  from: Map<string, RagEdge[]>
  /** target → the edges whose `target` is that id (store order). */
  to: Map<string, RagEdge[]>
  /** kind → the edges of that kind (store order). */
  kind: Map<RagEdgeKind, RagEdge[]>
  /** documentId → the edges scoped to that document (store order): the
   *  doc-flow edges (doc-head/next-section/doc-end) whose `documentIds`
   *  includes the id + ALL `doc-child` edges (hierarchical nesting, no
   *  documentIds — Unit B §5.2 Finding 7 scopes them globally). */
  document: Map<string, RagEdge[]>
  /** documentId → the head node id (the source of the FIRST `doc-head` edge
   *  whose `documentIds` includes the id, in store order). Absent when the
   *  document has no `doc-head` edge. */
  docHead: Map<string, string>
}

/** Build the adjacency index from the store's edges in ONE O(E) pass. PURE. */
export function buildAdjacencyIndex(edges: RagEdge[]): AdjacencyIndex

/** The edges whose `source` is `source`, in store order. PURE. */
export function edgesFromIndex(index: AdjacencyIndex, source: string): RagEdge[]
/** The edges whose `target` is `target`, in store order. PURE. */
export function edgesToIndex(index: AdjacencyIndex, target: string): RagEdge[]
/** The edges of `kind`, in store order. PURE. */
export function edgesByKindIndex(index: AdjacencyIndex, kind: RagEdgeKind): RagEdge[]
/** The edges scoped to `documentId` (the doc-flow edges whose `documentIds`
 *  includes it + ALL `doc-child` edges), in store order. PURE. */
export function edgesForDocumentIndex(index: AdjacencyIndex, documentId: string): RagEdge[]
/** The head node id for `documentId` (the source of the FIRST `doc-head` edge
 *  whose `documentIds` includes it), or `undefined` if none. PURE. */
export function docHeadForDocumentIndex(index: AdjacencyIndex, documentId: string): string | undefined
```

**Return-shape rules (the shared core):**

- `buildAdjacencyIndex(edges)` returns a fresh `AdjacencyIndex`. A `null`/
  `undefined`/non-array `edges` → throws `Error('buildAdjacencyIndex: edges must be an array')`.
  An empty array → an index with all-empty maps (no throw).
- `edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/`edgesForDocumentIndex`
  return a fresh array of the matching edges in store order (the order the edges
  appear in the `edges` array passed to `buildAdjacencyIndex`). An unmatched id
  → an empty array (no throw). A `null`/`undefined` index → throws
  `Error('edgesFromIndex: index required')` (and the analogous message per
  helper). A non-string/empty-string `source`/`target`/`documentId` → throws
  `Error('edgesFromIndex: source must be a non-empty string')` (and the
  analogous message per helper). An invalid `kind` (not a `RagEdgeKind`) →
  throws `Error('edgesByKindIndex: invalid kind')`.
- `docHeadForDocumentIndex` returns the head node id (a string) or `undefined`
  (no `doc-head` edge for the document). A `null`/`undefined` index → throws
  `Error('docHeadForDocumentIndex: index required')`. A non-string/empty-string
  `documentId` → throws `Error('docHeadForDocumentIndex: documentId must be a non-empty string')`.
- **Multiple-heads rule:** when a document has MORE than one `doc-head` edge
  (a structural violation — Unit B §5.2 fail-state 7), `docHeadForDocumentIndex`
  returns the source of the FIRST such edge in store order (deterministic). The
  multiple-heads case is a `validateDocFlow` fail-state, not an adjacency
  concern.

### 5.2 The `RagStore` interface additions (Unit A §5.4 amendment)

The `RagStore` interface (Unit A §5.4) gains five adjacency methods. They are
**additive** — the existing methods are unchanged.

```ts
export interface RagStore {
  // ... (the existing Unit A §5.4 methods, unchanged) ...

  // ---- adjacency (Unit V1) -------------------------------------------------
  /** All edges whose `source` is `source`, in store order. */
  edgesFrom(source: string): RagEdge[]
  /** All edges whose `target` is `target`, in store order. */
  edgesTo(target: string): RagEdge[]
  /** All edges of `kind`, in store order. */
  edgesByKind(kind: RagEdgeKind): RagEdge[]
  /** The edges scoped to `documentId` (the doc-flow edges whose `documentIds`
   *  includes it + ALL `doc-child` edges), in store order. */
  edgesForDocument(documentId: string): RagEdge[]
  /** The head node id for `documentId` (the source of the FIRST `doc-head`
   *  edge whose `documentIds` includes it), or `undefined` if none. */
  docHeadForDocument(documentId: string): string | undefined
}
```

**Return-shape rules (the JSON store):**

- Each adjacency method returns a **fresh array of shallow copies** of the
  matching edges (the Unit A §5.4 `listEdges` discipline — never the internal
  records). An unmatched id → an empty array (no throw).
- `docHeadForDocument` returns a string (the head node id) or `undefined`.
- **Throw patterns (caller errors):** a non-string/empty-string `source`/
  `target`/`documentId` → throws `Error('rag edgesFrom: source must be a non-empty string')`
  (and the analogous message per method). An invalid `kind` (not a `RagEdgeKind`)
  → throws `Error('rag edgesByKind: invalid kind')`. These mirror the
  `validateDocFlow` caller-error discipline (Unit B §5.2 fail-state 6) — a
  malformed input is a caller error, never a silent empty result.

### 5.3 The lazy index + invalidation (the JSON store)

- **Lazy build:** the JSON store builds the `AdjacencyIndex` on the FIRST
  adjacency query after a mutation (or at construction). The build is one O(E)
  pass over the store's active (non-quarantined) edges. A `dirty` flag tracks
  whether the index is stale.
- **Invalidation on mutation:** ANY mutation that changes the edge set — `putEdge`,
  `removeEdge`, `removeNode` (cascade), `applyBatch`, `undo`, `redo` — sets the
  `dirty` flag. Because all mutations route through the single-writer queue
  (Unit A §5.5), the invalidation happens inside the queue; a read that runs
  after the mutation settles sees the fresh index (rebuilt lazily on the next
  adjacency query). A read that runs DURING a mutation cannot observe a
  half-applied write (the queue serializes).
- **Quarantine exclusion:** the index is built over the ACTIVE (non-quarantined)
  edges only — a quarantined edge is never returned by an adjacency query
  (mirrors `listEdges`'s quarantine filter, Unit A §5.7).
- **Reads are lock-free:** the adjacency methods are synchronous and do NOT go
  through the queue (they read the in-memory store + the lazily-rebuilt index).
- **The shared core is the implementation:** the JSON store's adjacency methods
  delegate to `edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/
  `edgesForDocumentIndex`/`docHeadForDocumentIndex` over the lazily-built index
  (amendment 3 — the SAME pure functions `createSnapshotStore` uses).

### 5.4 `createSnapshotStore(nodes, edges)` — the read-only adapter

```ts
// src/main/adjacency.ts (project-specific; pure, no Electron).

/** A read-only `RagStore` adapter over a snapshot (nodes + edges). Implements
 *  the FULL `RagStore` interface so `buildTraversal` (which reads
 *  `listNodes`/`listEdges` + the adjacency methods) can run against it. The
 *  adjacency methods delegate to the SAME pure adjacency functions the JSON
 *  store uses (amendment 3). The mutating methods THROW (fail-closed — a
 *  read-only adapter must not silently accept a write). */
export function createSnapshotStore(nodes: RagNode[], edges: RagEdge[]): RagStore
```

**Behavior:**

- **Read methods:** `getNode(id)` returns a shallow copy of the node with that
  id (or `undefined`); `listNodes()` returns a fresh array of shallow copies;
  `getEdge(id)`/`listEdges()` likewise. `status()` returns
  `{ corrupt: false, quarantined: [], loadedNodes: <node ids>, loadedEdges: <edge ids> }`.
  `journal()` returns `[]`. `undoDepth()`/`redoDepth()` return `0`.
- **Adjacency methods:** `edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/
  `docHeadForDocument` delegate to the SAME pure functions
  (`edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/`edgesForDocumentIndex`/
  `docHeadForDocumentIndex`) over an `AdjacencyIndex` built ONCE from the given
  `edges` (eagerly at construction, or lazily on the first adjacency query — the
  spec pins: **eagerly at construction** for determinism). The returned edges are
  shallow copies (the `listEdges` discipline).
- **Mutating methods (fail-closed):** `putNode`/`removeNode`/`putEdge`/
  `removeEdge`/`undo`/`redo`/`enqueue`/`applyBatch` throw
  `Error('createSnapshotStore: read-only')`. A read-only adapter must not
  silently accept a write.
- **Throw patterns (construction):** a `null`/`undefined` `nodes` or `edges`,
  or a non-array `nodes`/`edges` → throws
  `Error('createSnapshotStore: nodes/edges must be arrays')`. An empty `nodes`/
  `edges` → a valid empty adapter (no throw).

### 5.5 The two existing adapters replaced (amendment 4)

- **`rebuildBackRefs`'s inline adapter** (`traversal.ts:490`):
  `const store = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore`.
  Once `buildTraversal` calls the new adjacency methods (Unit V2), this adapter
  MUST be replaced by `createSnapshotStore(nodes, edges)` (or implement the new
  methods), or `buildTraversal` throws. The replacement lands in Unit V2.
- **The host's `buildTraversalEnvelope` adapter** (`sidebar-panes.ts:831`):
  `const store = { listNodes: () => snapshot.nodes, listEdges: () => snapshot.edges } as never`.
  Once `buildTraversal` calls the new adjacency methods, this adapter MUST be
  replaced by `createSnapshotStore(snapshot.nodes, snapshot.edges)` (or implement
  the new methods), or `buildTraversal` throws. The replacement landed in Unit V2.
- **Contract (pinned):** after Unit V2/V3, NO `listNodes`/`listEdges`-only
  adapter remains in the codebase. Every `buildTraversal` call site passes a
  store that implements the full adjacency surface (the JSON store or
  `createSnapshotStore`).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **`buildAdjacencyIndex` empty:** `buildAdjacencyIndex([])` → an index with
   all-empty maps (no throw).
2. **`buildAdjacencyIndex` populated:** an index over a fixture with
   `parent-child`/`doc-head`/`next-section`/`doc-end`/`doc-child` edges → the
   `from`/`to`/`kind`/`document`/`docHead` maps are populated correctly (one
   O(E) pass).
3. **`edgesFromIndex` happy:** an edge `e1` with `source: 'a'` → `edgesFromIndex(index, 'a')`
   returns `[e1]` (store order).
4. **`edgesToIndex` happy:** an edge `e1` with `target: 'b'` → `edgesToIndex(index, 'b')`
   returns `[e1]`.
5. **`edgesByKindIndex` happy:** two `doc-child` edges → `edgesByKindIndex(index, 'doc-child')`
   returns both, in store order.
6. **`edgesForDocumentIndex` happy:** a `doc-head` edge with `documentIds: ['doc']`
   + a `doc-child` edge → `edgesForDocumentIndex(index, 'doc')` returns the
   `doc-head` edge (scoped by `documentIds`) AND the `doc-child` edge (global).
7. **`docHeadForDocumentIndex` happy:** a `doc-head` edge `source: 'head'`,
   `documentIds: ['doc']` → `docHeadForDocumentIndex(index, 'doc')` returns
   `'head'`.
8. **`docHeadForDocumentIndex` no head:** a document with no `doc-head` edge →
   returns `undefined`.
9. **JSON store `edgesFrom` happy:** after seeding a JSON store, `edgesFrom('a')`
   returns the matching edges (fresh shallow copies, store order).
10. **JSON store `edgesForDocument` happy:** `edgesForDocument('doc')` returns the
    doc-flow edges scoped by `documentIds` + all `doc-child` edges.
11. **JSON store `docHeadForDocument` happy:** `docHeadForDocument('doc')` returns
    the head node id.
12. **`createSnapshotStore` parity (amendment 3):** the SAME adjacency queries
    (`edgesFrom`/`edgesTo`/`edgesByKind`/`edgesForDocument`/`docHeadForDocument`)
    run against a JSON store AND a `createSnapshotStore` over the same
    nodes/edges return IDENTICAL results (the adapter delegates to the SAME pure
    functions).
13. **`createSnapshotStore` read methods:** `getNode`/`listNodes`/`getEdge`/
    `listEdges`/`status`/`journal`/`undoDepth`/`redoDepth` behave as a read-only
    store over the snapshot.
14. **Lazy index invalidation:** after a `putEdge`/`removeEdge`/`removeNode`
    (cascade)/`applyBatch`/`undo`/`redo`, the next adjacency query reflects the
    mutation (the `dirty` flag triggers a rebuild).
15. **Quarantine exclusion:** a quarantined edge is NOT returned by any
    adjacency query (mirrors `listEdges`).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`buildAdjacencyIndex` with a null/undefined/non-array `edges`** → throws
   `Error('buildAdjacencyIndex: edges must be an array')`.
2. **`edgesFromIndex`/`edgesToIndex`/`edgesByKindIndex`/`edgesForDocumentIndex`/
   `docHeadForDocumentIndex` with a null/undefined index** → throws the
   documented `...Index: index required` error.
3. **`edgesFromIndex`/`edgesToIndex`/`edgesForDocumentIndex` with a
   non-string/empty-string argument** → throws the documented
   `...: <arg> must be a non-empty string` error.
4. **`edgesByKindIndex` with an invalid kind** → throws
   `Error('edgesByKindIndex: invalid kind')`.
5. **`docHeadForDocumentIndex` with a non-string/empty-string `documentId`** →
   throws `Error('docHeadForDocumentIndex: documentId must be a non-empty string')`.
6. **JSON store `edgesFrom`/`edgesTo`/`edgesForDocument`/`docHeadForDocument`
   with a non-string/empty-string argument** → throws the documented
   `rag <method>: <arg> must be a non-empty string` error.
7. **JSON store `edgesByKind` with an invalid kind** → throws
   `Error('rag edgesByKind: invalid kind')`.
8. **`createSnapshotStore` with a null/undefined/non-array `nodes` or `edges`** →
   throws `Error('createSnapshotStore: nodes/edges must be arrays')`.
9. **`createSnapshotStore` mutating methods** (`putNode`/`removeNode`/`putEdge`/
   `removeEdge`/`undo`/`redo`/`enqueue`/`applyBatch`) → throw
   `Error('createSnapshotStore: read-only')` (fail-closed — a read-only adapter
   must not silently accept a write).

### 5.8 Census / numeric claims

- **New `RagStore` interface methods:** 5 (`edgesFrom`, `edgesTo`, `edgesByKind`,
  `edgesForDocument`, `docHeadForDocument`).
- **New factories:** 1 (`createSnapshotStore`).
- **Shared PURE adjacency core:** 1 index builder (`buildAdjacencyIndex`) + 5
  query helpers (`edgesFromIndex`, `edgesToIndex`, `edgesByKindIndex`,
  `edgesForDocumentIndex`, `docHeadForDocumentIndex`).
- **Index build cost:** one O(E) pass over the active (non-quarantined) edges.
- **Index invalidation triggers:** 6 mutation paths (`putEdge`, `removeEdge`,
  `removeNode` cascade, `applyBatch`, `undo`, `redo`).
- **Existing adapters replaced (amendment 4):** 2 (`rebuildBackRefs` inline at
  `traversal.ts:490`; the host's `buildTraversalEnvelope` at `sidebar-panes.ts:831`).
- **`createSnapshotStore` mutating methods that throw:** 8 (`putNode`,
  `removeNode`, `putEdge`, `removeEdge`, `undo`, `redo`, `enqueue`, `applyBatch`).

### 5.9 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.4 (the `RagStore` interface this
  unit extends), §5.5 (the single-writer queue — the index invalidation home),
  §5.7 (quarantine exclusion), §5.1 (the `RagEdge`/`RagEdgeKind` shapes).
- Unit B: `docs/specs/unit-b-document-model.md` §5.2 (the `validateDocFlow`
  scoping note — Finding 7 — that `edgesForDocument` mirrors; the multiple-heads
  fail-state that `docHeadForDocument`'s first-wins rule defers to).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`buildTraversal` — the
  consumer of the adjacency methods in Unit V2). `rebuildBackRefs`'s inline
  adapter (the `listNodes`/`listEdges`-only adapter this unit's
  `createSnapshotStore` replaces) is at `src/main/traversal.ts:490`.
- Unit K: `docs/specs/unit-k-sidebar-panes-host.md` §5.1 (the snapshot adapter
  the host's `buildTraversalEnvelope` uses — replaced by `createSnapshotStore`
  in Unit V3).
- Gate: `docs/specs/load-bug-scoped-traversal-review.md` §5 (amendments 3 + 4),
  §6 (Unit 1 = store adjacency).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE**, **SOURCE-SWITCHABLE**, **SUBTREE-OWNERSHIP**,
  **MULTI-PARENT-DUPLICATE**, **DERIVED-DOC-FLOW**, **DOC-CHILD**,
  **CROSS-DOCUMENT-SHARED**. New rows pinned by this spec (added when the unit
  lands): **ADJACENCY-INDEXED**, **SHARED-ADJACENCY-CORE**,
  **READ-ONLY-SNAPSHOT-ADAPTER**.
- Host patterns: `src/main/adjacency.ts` (the shared PURE adjacency core +
  `createSnapshotStore` — re-exported by `src/main/rag-store.ts`),
  `src/main/rag-store.ts` (the JSON store + the adjacency methods),
  `src/main/traversal.ts` (`rebuildBackRefs`'s inline adapter — replaced in Unit V2),
  `src/renderer/sidebar-panes.ts` (`buildTraversalEnvelope`'s adapter — replaced
  in Unit V2).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/main/rag-store.ts` (the adjacency
methods + the shared core + `createSnapshotStore`) from §5.6/§5.7. The red set
(recorded in the next-steps DONE row for this unit):

- **Shared core:** `buildAdjacencyIndex` (empty + populated), the five query
  helpers (happy + unmatched + throw patterns), the multiple-heads first-wins
  rule.
- **JSON store adjacency:** `edgesFrom`/`edgesTo`/`edgesByKind`/
  `edgesForDocument`/`docHeadForDocument` (happy + unmatched + throw patterns),
  the lazy index invalidation across all 6 mutation paths, the quarantine
  exclusion.
- **`createSnapshotStore`:** the read methods, the adjacency methods (parity
  with the JSON store — amendment 3), the fail-closed mutating methods, the
  construction throw patterns.
- **Amendment 4 (pinned):** a test asserting that a `listNodes`/`listEdges`-only
  adapter (the current `rebuildBackRefs`/`buildTraversalEnvelope` shape) does
  NOT satisfy the adjacency surface — i.e. `buildTraversal` against it would
  throw once the new methods are called (the replacement is required). This test
  is written in Unit V2 (the traversal change) but the contract is pinned here.
