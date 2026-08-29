# Spec — Unit V2: Scoped Traversal + MCP Refactor

- **Status:** SPEC (the scoped-load fix, Unit 2 of 3). Gate reference:
  `docs/specs/load-bug-scoped-traversal-review.md` §5 (the amendments), §6
  (the unit split — Unit 2 = scoped traversal + MCP refactor). Decisions:
  `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SUBTREE-OWNERSHIP**,
  **MULTI-PARENT-DUPLICATE**, **DERIVED-DOC-FLOW**, **DOC-CHILD**,
  **CROSS-DOCUMENT-SHARED**, **SINGLE-WRITER-STORE**, **SOURCE-SWITCHABLE**.
- **Scope:** the scoped `buildTraversal` walk (`src/main/traversal.ts`) — only
  the reachable subgraph from the head via `doc-head` → `next-section` →
  `doc-end` + `doc-child` + `parent-child` for multi-parent, with cycle
  protection and O(1) `isDocHead` via `docHeadForDocument`; the shared
  `computeDocumentSubgraph(store, documentId)` helper; the `rag.get_document`
  MCP tool refactored onto it; and the accepted edit-surface change (the scoped
  walk shrinks `materialized` → `backRefs`/`crosslinks` drop nodes not reachable
  from the head). This unit DEPENDS on Unit V1 (the adjacency methods +
  `createSnapshotStore`). It does NOT change the doc-nav (Unit V3).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/traversal.ts` (the
  scoped walk + `computeDocumentSubgraph`) + `src/main/mcp-server.ts` (the
  `rag.get_document` refactor) from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **A scoped `buildTraversal` walk** (`src/main/traversal.ts`): per document,
   build `docNodeIds` via `edgesForDocument` + a transitive `doc-child` closure
   via `edgesFrom`; scope the edges passed to `validateDocFlow`; build subtrees
   via `edgesFrom` filtered by kind; MULTI-PARENT-DUPLICATE via
   `edgesFrom(sectionId)` filtered by `parent-child`; crosslinks via
   `edgesFrom(materializedId)`; cycle protection via a `seen` set; `isDocHead`
   replaced by `docHeadForDocument` (O(1)). The walk touches ONLY the reachable
   subgraph from the head — the load-bug fix (the current walk copies the whole
   store and runs multiple full-edge passes per document).
2. **A shared `computeDocumentSubgraph(store, documentId)` helper** — the SINGLE
   shared derivation of the document's node set, used by BOTH the scoped
   `buildTraversal` walk AND the `rag.get_document` MCP tool (amendment 2 —
   HIGH). This prevents the traversal and the MCP contract from diverging.
3. **The `rag.get_document` MCP tool refactored onto `computeDocumentSubgraph`**
   (`src/main/mcp-server.ts`), preserving the `{ documentId, nodes, edges }`
   return contract (amendment 6 — MEDIUM).
4. **The accepted edit-surface change:** the scoped walk shrinks `materialized`,
   so `backRefs`/`crosslinks` drop nodes not reachable from the head. This is a
   documented, regression-tested behavior change (amendment 1 — HIGH).

## 2. Feasibility verdict

**Feasible — grounded in the existing `buildTraversal` (Unit C §5.1-§5.9), the
Unit V1 adjacency methods, and the current `rag.get_document` scoping.**

- **Scoped walk:** the current `buildTraversal` already computes `docNodeIds`
  (the document node set) and scopes the doc-child exclusion per document
  (HOST-C3). The scoped walk replaces the full-edge scans with adjacency
  lookups — a mechanical, well-understood transformation. The `rag.get_document`
  handler (`mcp-server.ts:151-165`) already implements the exact `docNodeIds`
  closure; `computeDocumentSubgraph` is a clean extraction.
- **`computeDocumentSubgraph`:** a pure function over the `RagStore` interface
  (Unit A §5.3 — SOURCE-SWITCHABLE), using the Unit V1 adjacency methods. Both
  the traversal and the MCP tool call it (amendment 2).
- **`rag.get_document` refactor:** the handler's node/edge scoping
  (`mcp-server.ts:151-165`) is preserved exactly (amendment 6).

No engine/foundation gap blocks this unit. The scoped walk, the shared helper,
and the MCP refactor are all project-specific (compose the Unit V1 adjacency
methods).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The scoped `buildTraversal` walk | Project-specific (composes the Unit V1 adjacency methods) | Medium-high cost; the load-bearing fix, but the `materialized`-set change is a behavior change that must be pinned + regression-tested (amendment 1). |
| `computeDocumentSubgraph` (the single shared derivation) | Project-specific (a pure helper over the `RagStore` interface) | Low cost; prevents the traversal and the MCP contract from diverging (amendment 2). |
| The `rag.get_document` refactor | Project-specific (a shared-helper extraction) | Low cost; must preserve the `{ documentId, nodes, edges }` contract (amendment 6). |
| The edit-surface change (shrunk `materialized`) | Project-specific (a behavior change) | Medium cost; `backRefs`/`crosslinks` drop nodes not reachable from the head — must be pinned + regression-tested, and the greens docs reconciled (amendment 8). |

No engine gap. The fix is entirely host-side (`src/`).

### 3a. Adversarial findings (host findings, fixed + regression-tested)

The post-green adversarial pass (RCA-3) surfaced HOST test-gap findings. Each
host finding is fixed here + regression-tested in
`tests/unit-v2-scoped-traversal-mcp-adversarial.test.ts`. HOST-1 (tracker
staleness) and HOST-7 (informational) are handled by the supervisor/doc-review,
NOT fixed here.

- **HOST-1 (MED) — tracker staleness.** The active trackers
  (`docs/next-steps.md`, `docs/defects.md`, `docs/decisions.md`) were not
  reconciled against the actual build state. **Resolution:** handled by the
  supervisor/doc-review (RCA-6 documentation review), not this pass.
- **HOST-2 (MED) — cross-document shared fixture not covered by the
  amendment-1 equivalence test.** The happy-14 equivalence test covered
  `validDoc`/`docChildDoc`/`multiParentDoc` but NOT the cross-document shared
  fixture (B/C → A → D, §5.6 happy 7). **Resolution:** a regression test
  (`HOST-2 — cross-document shared fixture equivalence`) asserts the scoped
  walk's `materialized` set equals the old all-edges walk's (per-document
  reference unioned) for a node shared across two documents.
- **HOST-3 (MED) — `computeDocumentSubgraph` malformed-input cases untested.**
  No test covered a `doc-head` edge with a missing target, a `doc-child` edge
  with a missing target, a document id not in the store, or an empty document
  with doc-child edges present elsewhere. **Resolution:** four regression tests
  (`HOST-3 — computeDocumentSubgraph malformed-input cases`) pin the documented
  behavior: missing-node → `validateDocFlow` fallback (no crash); unknown id →
  `{documentId}` + `[]`; no crash.
- **HOST-4 (LOW) — the "edit-surface change" test does not exercise the
  accepted shrink.** The current test used a `stray` node not materialized by
  EITHER walk. **Resolution:** a regression test (`HOST-4 — the edit-surface
  change drops a node the OLD walk materializes`) constructs a node the OLD
  all-edges walk materializes but the scoped walk drops (reachable only via a
  path not reachable from the head — a doc-child edge carrying `documentIds`
  whose source is not reachable from the head, under a `validateDocFlow`
  fallback) and asserts it is absent from `backRefs`/envelope/crosslinks in the
  scoped walk.
- **HOST-5 (LOW) — the `seen`-set cycle protection is never exercised.** A
  `doc-child` cycle short-circuits to the family-pre-order fallback before the
  `seen` set is reached (`validateDocFlow` Rule 4 detects ANY doc-child nesting
  cycle). **Resolution:** §5.1 step 9 reconciled to state the `seen` set is
  defense-in-depth, effectively unreachable; a regression test (`HOST-5 — a
  doc-child cycle terminates via the family-pre-order fallback`) pins that a
  doc-child cycle terminates via the fallback (no infinite loop).
- **HOST-6 (LOW) — `rag.get_document` with a document id not in the store
  returns `nodes: []`, not `[<doc root>]`.** **Resolution:** the behavior is
  pinned with a regression test (`HOST-6 — rag.get_document with an unknown
  document id` → `{ documentId, nodes: [], edges: [] }`) and documented in §5.3.
- **HOST-7 (informational) — informational finding.** **Resolution:** handled by
  the supervisor/doc-review, not this pass.
- **HOST-8 (LOW) — `rebuildBackRefs` empty-snapshot path untested.**
  **Resolution:** a regression test (`HOST-8 — rebuildBackRefs empty-snapshot
  path`) asserts `rebuildBackRefs([], [], 'main')` returns an empty `Map`
  (never throws).

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** (`docs/specs/load-bug-scoped-traversal-review.md`).
The amendments this unit folds in:

- **Amendment 1 (HIGH) — pin the `materialized`-set equivalence.** The scoped
  walk must produce the SAME `materialized` set as the current all-edges walk
  for the existing fixtures (sections + doc-children + multi-parent nodes), OR
  the difference must be a documented, regression-tested behavior change. Pinned
  in §5.4 (the edit-surface change) + §5.8 happy-path 14 (the equivalence test).
- **Amendment 2 (HIGH) — single source for the document node set.**
  `computeDocumentSubgraph(store, documentId)` must be the SINGLE shared
  derivation of the document's node set, used by BOTH the scoped `buildTraversal`
  walk AND the `rag.get_document` MCP tool. Pinned in §5.2 + §5.8 happy-path 15
  (the identity test).
- **Amendment 4 (HIGH) — the adapters must implement the new methods.**
  `rebuildBackRefs`'s inline adapter (`traversal.ts:540-550`) MUST be replaced by
  `createSnapshotStore` (or implement the new methods), or `buildTraversal`
  throws. Pinned in §5.5 + §5.8 happy-path 16.
- **Amendment 6 (MEDIUM) — preserve the `rag.get_document` return contract.**
  The refactor must keep `{ documentId, nodes, edges }` with the exact
  node/edge scoping (doc-flow edges scoped by `documentId` + doc-child edges
  among the document's nodes — `mcp-server.ts:151-165`). Pinned in §5.3 +
  §5.8 happy-path 17 (the identical-result test).
- **Amendment 7 (MEDIUM) — pin the `validateDocFlow` pre-scoping.** The scoped
  walk passes a pre-scoped edge set to `validateDocFlow`; the pre-scoping must
  produce the SAME verdict as the current full-edge call (Unit B §5.2 Finding 7
  scopes internally). Pinned in §5.1 + §5.8 happy-path 18 (the verdict-match
  test).
- **Amendment 8 (MEDIUM) — reconcile the greens docs + trackers (RCA-6).** The
  scoped-walk behavior change drifts `unit-c-rendering-spine-greens.md`,
  `unit-d-editing-greens.md`, `unit-g-crosslink-backlink-greens.md`,
  `unit-r-traversal-inline-children-greens.md`, and the census claims in the
  specs. These must be reconciled in the SAME pass as the code, and
  `docs/defects.md`/`docs/next-steps.md` updated. Pinned in §5.9.
- **Amendment 9 (LOW) — document the snapshot-transfer limitation.** The
  boot/re-derive still fetches the full `RagSnapshotPayload`; the scoped walk
  reduces the WALK cost, not the IPC transfer. Pinned in §5.9 + `docs/pending.md`.

## 4. Design decisions pinned by this spec

- **SCOPED-WALK (new):** `buildTraversal` walks ONLY the reachable subgraph from
  each document's head via the adjacency methods — never a full-edge scan per
  document. The walk is O(E) index build (Unit V1) + O(adjacency) lookups.
- **SINGLE-DOCUMENT-SUBGRAPH (new):** `computeDocumentSubgraph(store,
  documentId)` is the SINGLE shared derivation of a document's node set, used by
  BOTH the scoped walk AND the `rag.get_document` MCP tool (amendment 2).
- **MATERIALIZED-SHRINK (new, the accepted edit-surface change):** the scoped
  walk's `materialized` set is the set of nodes REACHABLE from the head (via
  `doc-head` → `next-section` → `doc-end` + `doc-child` + multi-parent
  `parent-child`). Nodes not reachable from the head are NOT materialized, so
  `backRefs`/`crosslinks` drop them. This is a documented, regression-tested
  behavior change (amendment 1).
- **RAG-AUTHORITATIVE (consumed):** the RAG store is authoritative; the
  provident graph is a transient render materialization. The scoped walk reads
  through the `RagStore` interface (Unit A §5.3 — SOURCE-SWITCHABLE).

## 5. The exhaustive contract

### 5.1 The scoped `buildTraversal` walk (`src/main/traversal.ts`)

The `TraversalInput`/`TraversalResult` shapes (Unit C §5.1) are UNCHANGED. The
walk's INTERNALS change from full-edge scans to adjacency lookups.

```ts
// src/main/traversal.ts (project-specific; pure, no Electron).

export function buildTraversal(input: TraversalInput): TraversalResult
```

**Throws:** unchanged — `buildTraversal` throws
`Error('traversal: store/documentIds/zoneName required')` if `input` is
null/undefined or any required field is missing/invalid. It does NOT throw on a
doc-flow validation failure (it falls back to family pre-order — Unit B §5.2).

**The scoped walk (pinned):**

1. **Dedup `documentIds`** (preserve order) — unchanged (Unit C finding 6).
2. **Read the store once:** `const nodes = store.listNodes()`, `const edges =
   store.listEdges()`, `const nodeById = new Map(...)`. (The adjacency methods
   are used for the per-document scans; the full `listNodes`/`listEdges` are
   still read ONCE for the node map + the crosslink wiring.)
3. **Per document, build `docNodeIds` via `computeDocumentSubgraph`** (amendment
   2 — the SINGLE shared derivation, §5.2). The scoped walk does NOT re-derive
   the node set inline.
4. **Scope the edges passed to `validateDocFlow`** (amendment 7): the scoped
   walk passes `store.edgesForDocument(documentId)` as the `edges` argument to
   `validateDocFlow(nodes, scopedEdges, documentId)`. Because
   `edgesForDocument` returns the doc-flow edges scoped by `documentId` + ALL
   `doc-child` edges — EXACTLY the set `validateDocFlow` computes internally
   (Unit B §5.2 Finding 7) — the pre-scoped call produces the SAME verdict as
   the current full-edge call.
5. **Sections + fallback:** on `verdict.ok`, `sections = verdict.order.filter(id
   => id !== documentId)`; on failure, the family-pre-order fallback over
   `docNodeIds` (unchanged — Unit C §5.7.4, store insertion order).
6. **Build subtrees via `edgesFrom` filtered by kind:** `buildSubtree(ragId)`
   reads `store.edgesFrom(ragId)` and filters by `doc-child` (for the nested
   doc-children, sorted by `order`) — replacing the per-section `edges.filter`
   (O(S·E) → O(adjacency)). The subtree root's props/children construction is
   UNCHANGED (Unit C §5.2 + Unit R inline children + Unit L textarea).
7. **`isDocHead` via `docHeadForDocument` (O(1)):** the subtree root's
   `data-doc-head` marker is set when
   `store.docHeadForDocument(documentId) === ragId` — replacing the O(E)
   `isDocHead` scan. The `isDocHead` helper function is REMOVED.
8. **MULTI-PARENT-DUPLICATE via `edgesTo(node.id)` filtered by
   `parent-child`:** for each non-section, non-doc-child node in `docNodeIds`,
   the parents are `store.edgesTo(node.id).filter(e => e.kind === 'parent-child' &&
   sectionSet.has(e.source)).map(e => e.source)`; when `parents.length >= 2`,
   materialize a duplicate subtree per parent (unchanged semantics — Unit C
   §5.7.5).
9. **Cycle protection via a `seen` set (defense-in-depth, effectively
   unreachable):** the `buildSubtree` recursion tracks a `seen` set of RAG ids;
   a `doc-child` cycle (a RAG object is a doc-child of itself, transitively) is
   broken by NOT recursing into an already-seen id. In practice the `seen` set
   is effectively UNREACHABLE: `validateDocFlow` Rule 4 (Unit B §5.2) detects
   ANY `doc-child` nesting cycle and returns the `cycle` verdict, which falls
   back to family pre-order with `nestDocChildren = false` — so `buildSubtree`
   never recurses into doc-children and the `seen` set is never consulted. The
   `seen` set remains as defense-in-depth (never a throw) for the theoretical
   case where a doc-child cycle exists without being detected; it is NOT the
   primary cycle guard (HOST-5).
10. **Crosslinks via the full-edge filter (outgoing-only, source materialized):**
    the crosslink wiring is `edges.filter(e => e.kind === 'crosslink' &&
    materialized.has(e.source))` over the full `listEdges` read ONCE in step 2 —
    emitting a wiring entry ONLY for a `crosslink` edge whose SOURCE RAG node is
    materialized (Unit G §5.2, outgoing-only). A missing target (a dangling
    reference) is valid — no throw.
11. **The envelope/backRefs/lineMap construction is UNCHANGED** (Unit C §5.2,
    §5.3, §5.6) — the template root, the container producers, the
    `translateLegacy` backRefs, and the markdown line-map all stay as-is.

**The `materialized` set (the edit-surface change, amendment 1):** the scoped
walk's `materialized` set is the set of RAG ids REACHABLE from the head via the
scoped walk (sections + nested doc-children + multi-parent duplicates). A node
NOT reachable from the head is NOT materialized. This is the accepted behavior
change: `backRefs`/`crosslinks` drop nodes not reachable from the head. The
equivalence to the current all-edges walk is pinned in §5.8 happy-path 14.

### 5.2 `computeDocumentSubgraph(store, documentId)` — the single shared derivation

```ts
// src/main/traversal.ts (project-specific; pure, no Electron).

/** The document's node set + its scoped edges — the SINGLE shared derivation
 *  used by BOTH the scoped `buildTraversal` walk AND the `rag.get_document`
 *  MCP tool (amendment 2). PURE. */
export interface DocumentSubgraph {
  /** The document's node ids: the doc root (documentId) + the sources/targets
   *  of the edges scoped by documentId + their doc-children (transitively). */
  docNodeIds: Set<string>
  /** The document's edges: the doc-flow edges scoped by documentId + the
   *  doc-child edges among the document's nodes. */
  edges: RagEdge[]
}

export function computeDocumentSubgraph(store: RagStore, documentId: string): DocumentSubgraph
```

**Behavior (pinned):**

1. **`docNodeIds`:** starts as `new Set([documentId])`. Adds the sources/targets
   of `store.edgesForDocument(documentId)` (the doc-flow edges scoped by
   `documentId`). Then a transitive `doc-child` closure: for each `doc-child`
   edge whose source is in `docNodeIds` (via `store.edgesFrom(source)` filtered
   by `kind === 'doc-child'`), add the target; repeat until no change. This is
   EXACTLY the pre-refactor `buildTraversal` `docNodeIds` closure and the
   pre-refactor `rag.get_document` closure — extracted into ONE shared function
   (now `computeDocumentSubgraph`, `traversal.ts:230-268`).
2. **`edges`:** the doc-flow edges scoped by `documentId` (those whose
   `documentIds` includes it) + the `doc-child` edges whose source AND target
   are both in `docNodeIds`. This is EXACTLY the pre-refactor `rag.get_document`
   edge scoping — preserved by the refactored handler (`mcp-server.ts:151-165`).
3. **Throw patterns:** a `null`/`undefined` `store` → throws
   `Error('computeDocumentSubgraph: store required')`. A non-string/empty-string
   `documentId` → throws
   `Error('computeDocumentSubgraph: documentId must be a non-empty string')`.
   A `store` that does NOT implement the adjacency methods (a
   `listNodes`/`listEdges`-only adapter) → the adjacency call throws (the
   documented Unit V1 fail-state) — this is the amendment-4 enforcement point.

**The single-source contract (amendment 2):** the scoped `buildTraversal` walk
(§5.1 step 3) and the `rag.get_document` MCP tool (§5.3) BOTH call
`computeDocumentSubgraph` — neither re-derives the node set inline. A test
asserts the traversal's `docNodeIds` and the MCP tool's returned node set are
identical on the same fixtures (§5.8 happy-path 15).

### 5.3 The `rag.get_document` MCP tool refactor (`src/main/mcp-server.ts`)

The `rag.get_document` handler (`mcp-server.ts:151-165`) is refactored onto
`computeDocumentSubgraph`:

```ts
case 'rag.get_document': {
  const documentId = typeof args.documentId === 'string' ? args.documentId : ''
  if (documentId === '') throw new Error('rag.get_document: documentId required')
  const subgraph = computeDocumentSubgraph(store, documentId)
  const nodes = store.listNodes().filter((n) => subgraph.docNodeIds.has(n.id))
  return { documentId, nodes, edges: subgraph.edges }
}
```

**Return contract (amendment 6, pinned):** the refactored handler returns
`{ documentId, nodes, edges }` with the EXACT node/edge scoping of the current
handler:
- `nodes` = the store's nodes whose id is in `docNodeIds` (the document's node
  set).
- `edges` = the doc-flow edges scoped by `documentId` + the `doc-child` edges
  among the document's nodes (both endpoints in `docNodeIds`).
- A test asserts the refactored handler returns the IDENTICAL result to the
  current handler on the same fixtures (§5.8 happy-path 17).

**Throw patterns (unchanged):** a missing/empty `documentId` → throws
`Error('rag.get_document: documentId required')`. A `null` store → the
`handleRagTool` top guard throws `${name}: no rag store configured`.

**Unknown document id (HOST-6, pinned):** a `documentId` that is NOT in the
store (no node with that id, no edges scoped to it) returns
`{ documentId, nodes: [], edges: [] }` — NOT `[<doc root>]`. `computeDocumentSubgraph`
returns `docNodeIds = { documentId }` + `edges = []` for an unknown id, and the
handler's `nodes` filter (`store.listNodes().filter(n => docNodeIds.has(n.id))`)
matches no node. Regression-tested in
`tests/unit-v2-scoped-traversal-mcp-adversarial.test.ts` (HOST-6).

### 5.4 The edit-surface change (amendment 1 — the `materialized`-set equivalence)

The scoped walk's `materialized` set is the set of nodes REACHABLE from the
head. The current all-edges walk's `materialized` set is the set of nodes that
get a content root under the current full-edge logic. The contract:

- **For the existing fixtures** (sections + doc-children + multi-parent nodes),
  the scoped walk MUST produce the SAME `materialized` set as the current
  all-edges walk — OR the difference must be a documented, regression-tested
  behavior change.
- **The pinned behavior change:** a node NOT reachable from the head (via
  `doc-head` → `next-section` → `doc-end` + `doc-child` + multi-parent
  `parent-child`) is NOT materialized. Concretely: `backRefs` and `crosslinks`
  drop such nodes. This is the accepted edit-surface change (the review's item
  6).
- **The equivalence test (§5.8 happy-path 14):** a test runs BOTH walks (the
  current all-edges walk and the scoped walk) on the same fixtures and asserts
  the `materialized` set (or the exact delta). For the fixtures where the sets
  are equal, the test asserts equality; for the fixtures where they differ, the
  test asserts the EXACT delta (the nodes dropped are precisely those not
  reachable from the head).

### 5.5 The `rebuildBackRefs` adapter replacement (amendment 4)

`rebuildBackRefs` (`traversal.ts:540-550`) previously built a
`listNodes`/`listEdges`-only adapter:
`const store = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore`.
Once `buildTraversal` calls the new adjacency methods, that adapter MUST be
replaced by `createSnapshotStore(nodes, edges)` (Unit V1 §5.4), or
`buildTraversal` throws. The replacement is pinned (now in place):

```ts
export function rebuildBackRefs(nodes: RagNode[], edges: RagEdge[], zoneName: string): Map<string, string[]> {
  const documentIds = [...new Set(edges.filter((e) => e.kind === 'doc-head').map((e) => e.target))]
  if (documentIds.length === 0) return new Map<string, string[]>()
  const store = createSnapshotStore(nodes, edges)
  const result = buildTraversal({ store, documentIds, zoneName })
  return result.backRefs
}
```

**Contract (pinned):** after this unit, NO `listNodes`/`listEdges`-only adapter
remains in `traversal.ts`. The host's `buildTraversalEnvelope` adapter
(`sidebar-panes.ts:831`) is ALSO replaced in this unit — it now builds its
snapshot store via `createSnapshotStore` (the same amendment-4 replacement).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Single document, single zone:** a document with one RAG subtree →
   `buildTraversal` returns an envelope with one container producer (`main`) +
   one `ContentPayload`; the backRefs map has one entry; the lineMap has one
   range (unchanged — Unit C §5.7.1).
2. **Multiple documents, one zone:** several documents → one container producer
   per distinct zone + one `ContentPayload` per RAG subtree (unchanged — Unit C
   §5.7.2).
3. **Valid doc-flow:** a document with a valid `doc-head`/`next-section`/
   `doc-end` chain → the head node's subtree root carries
   `props['data-doc-head'] = true` (via `docHeadForDocument`, O(1)).
4. **Doc-flow violation → fallback:** a document with a `next-section` cycle →
   the traversal falls back to family pre-order (no throw); the envelope still
   renders (unchanged — Unit C §5.7.4).
5. **Multi-parent node:** a RAG node with two `parent-child` edges →
   materialized as two duplicate subtrees, both sharing the RAG id in the
   backRefs map (unchanged — Unit C §5.7.5).
6. **Doc-child nesting:** a `ul` RAG object with four paragraph-length `li`
   doc-children → the `ul` content root with the four `li` doc-child subtrees
   nested at their `order` positions; the backRefs map has one entry for the
   `ul` (excluding the `li`s) + one per `li` (unchanged — Unit C §5.7.8).
7. **E2E — cross-document shared node (B/C → A → D):** A's spec is called by
   both Class B and Class C → A's spec is materialized as a duplicate subtree in
   each document, both sharing the RAG id in the backRefs map (unchanged — Unit
   C §5.7.9).
8. **`computeDocumentSubgraph` happy:** a document with a valid flow + doc-child
   nesting → `docNodeIds` is the doc root + the flow nodes + the transitive
   doc-children; `edges` is the scoped doc-flow edges + the doc-child edges
   among the document's nodes.
9. **`computeDocumentSubgraph` empty document:** a document with no edges →
   `docNodeIds` is `{ documentId }`; `edges` is `[]`.
10. **`rag.get_document` happy:** `rag.get_document({ documentId })` returns
    `{ documentId, nodes, edges }` with the document's node set + scoped edges.
11. **`rag.get_document` empty document:** a document with no edges →
    `{ documentId, nodes: [<the doc root>], edges: [] }`.
12. **Cycle protection (defense-in-depth):** a `doc-child` cycle → the `seen`
    set breaks the recursion (no infinite loop, no throw); the `validateDocFlow`
    `cycle` verdict already fell back to family pre-order.
13. **`rebuildBackRefs` via `createSnapshotStore`:** `rebuildBackRefs` returns
    the backRefs map for a snapshot (the adapter is `createSnapshotStore`).
14. **`materialized`-set equivalence (amendment 1):** a test runs BOTH the
    current all-edges walk and the scoped walk on the same fixtures and asserts
    the `materialized` set (or the exact delta). For the fixtures where the sets
    are equal, the test asserts equality; for the fixtures where they differ,
    the test asserts the EXACT delta (the nodes dropped are precisely those not
    reachable from the head).
15. **Single-source identity (amendment 2):** a test asserts the scoped walk's
    `docNodeIds` and the `rag.get_document` tool's returned node set are
    IDENTICAL on the same fixtures.
16. **Adapter replacement (amendment 4):** `rebuildBackRefs` uses
    `createSnapshotStore`; a `listNodes`/`listEdges`-only adapter passed to
    `buildTraversal` throws (the adjacency call fails) — the replacement is
    required.
17. **`rag.get_document` identical result (amendment 6):** a test asserts the
    refactored handler returns the IDENTICAL result to the current handler on
    the same fixtures.
18. **`validateDocFlow` pre-scoping verdict match (amendment 7):** a test asserts
    the scoped walk's verdict (via `edgesForDocument`) matches the current
    full-edge call's verdict on the same fixtures — for the valid case AND each
    fail-state (cycle/missing-node/missing-head/missing-end).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`buildTraversal` with null/undefined input or missing required field** →
   throws `Error('traversal: store/documentIds/zoneName required')` (unchanged —
   Unit C §5.8.1).
2. **`buildTraversal` with a `listNodes`/`listEdges`-only adapter** (a store that
   does NOT implement the adjacency methods) → the adjacency call throws the
   documented Unit V1 fail-state (amendment 4 — the replacement is required).
3. **`computeDocumentSubgraph` with a null/undefined `store`** → throws
   `Error('computeDocumentSubgraph: store required')`.
4. **`computeDocumentSubgraph` with a non-string/empty-string `documentId`** →
   throws `Error('computeDocumentSubgraph: documentId must be a non-empty string')`.
5. **`rag.get_document` with a missing/empty `documentId`** → throws
   `Error('rag.get_document: documentId required')` (unchanged).
6. **`rag.get_document` with a null store** → the `handleRagTool` top guard
   throws `${name}: no rag store configured` (unchanged).
7. **HARD PRECONDITION violation:** a `targetPlacement` naming a zone with no
   container producer → the subtree stays `unplaced` (unchanged — Unit C §5.8.2).
8. **Empty document:** a document with no RAG nodes → no `ContentPayload` for it
   (no throw); the envelope still has the container producers (unchanged — Unit
   C §5.8.3).
9. **Doc-flow validation failure** (cycle/missing-node/missing-head/missing-end)
   → the traversal falls back to family pre-order (no throw) — Unit B §5.2
   (unchanged).
10. **Doc-child nesting cycle** → the traversal falls back to family pre-order
    (no throw); the `seen` set breaks the recursion (defense-in-depth) — Unit B
    §5.2 (unchanged).

### 5.8 Census / numeric claims

- **New exported functions:** 1 (`computeDocumentSubgraph`) + 1 exported type
  (`DocumentSubgraph`).
- **Removed helper:** 1 (`isDocHead` — replaced by `docHeadForDocument`, O(1)).
- **`buildTraversal` walk cost:** O(E) index build (Unit V1) + O(adjacency)
  lookups per document — replacing the O(E²)/O(S·E)/O(N·E) full-edge scans.
- **`computeDocumentSubgraph` call sites:** 2 (the scoped `buildTraversal` walk
  + the `rag.get_document` MCP tool) — the SINGLE shared derivation (amendment 2).
- **Adapters replaced in this unit:** 2 (`rebuildBackRefs`'s inline adapter →
  `createSnapshotStore` + the host's `buildTraversalEnvelope` adapter →
  `createSnapshotStore`).
- **`rag.get_document` return shape:** `{ documentId, nodes, edges }` (unchanged —
  amendment 6).
- **`materialized`-set behavior change:** 1 (the scoped walk drops nodes not
  reachable from the head — amendment 1).

### 5.9 Cross-references

- Unit V1: `docs/specs/unit-v1-store-adjacency.md` §5.1 (the shared PURE
  adjacency core), §5.2 (the `RagStore` adjacency methods), §5.3 (the lazy
  index), §5.4 (`createSnapshotStore`), §5.5 (the adapters replaced).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalInput`/
  `TraversalResult` — unchanged), §5.2 (the envelope rules), §5.3 (the
  back-reference map), §5.6 (the line→node map), §5.7/§5.8 (the happy/fail
  states the scoped walk preserves), `rebuildBackRefs` (`src/main/traversal.ts:540`).
- Unit B: `docs/specs/unit-b-document-model.md` §5.2 (the `validateDocFlow`
  scoping note — Finding 7 — that `edgesForDocument` mirrors; the fail-states
  the pre-scoping must match).
- Unit G: `docs/specs/unit-g-crosslink-backlink.md` §5.2 (the crosslink wiring —
  outgoing-only, via `edgesFrom`).
- Unit R: `docs/specs/unit-r-traversal-inline-children.md` §5.1 (the inline
  children — unchanged).
- Unit L: `docs/specs/unit-l-textarea-editing-ui.md` §5.1 (the textarea child —
  unchanged).
- Gate: `docs/specs/load-bug-scoped-traversal-review.md` §5 (amendments 1, 2, 4,
  6, 7, 8, 9), §6 (Unit 2 = scoped traversal + MCP refactor).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MULTI-PARENT-DUPLICATE**, **DERIVED-DOC-FLOW**,
  **DOC-CHILD**, **CROSS-DOCUMENT-SHARED**, **SINGLE-WRITER-STORE**,
  **SOURCE-SWITCHABLE**. New rows pinned by this spec (added when the unit
  lands): **SCOPED-WALK**, **SINGLE-DOCUMENT-SUBGRAPH**,
  **MATERIALIZED-SHRINK**.
- Host patterns: `src/main/traversal.ts` (the scoped walk +
  `computeDocumentSubgraph` + `rebuildBackRefs`), `src/main/mcp-server.ts` (the
  `rag.get_document` refactor), `src/main/adjacency.ts` (the Unit V1 shared PURE
  adjacency core + `createSnapshotStore` — re-exported by `src/main/rag-store.ts`).
- **Amendment 8 (RCA-6) — the greens docs + trackers to reconcile in the SAME
  pass:** `unit-c-rendering-spine-greens.md`, `unit-d-editing-greens.md`,
  `unit-g-crosslink-backlink-greens.md`, `unit-r-traversal-inline-children-greens.md`,
  and the census claims in the specs. `docs/defects.md`/`docs/next-steps.md`
  updated.
- **Amendment 9 (LOW) — the snapshot-transfer limitation:** the boot/re-derive
  still fetches the full `RagSnapshotPayload`; the scoped walk reduces the WALK
  cost, not the IPC transfer. Noted in `docs/pending.md` as a follow-up
  (main-side traversal or a scoped snapshot).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/main/traversal.ts` (the scoped walk +
`computeDocumentSubgraph`) + `src/main/mcp-server.ts` (the `rag.get_document`
refactor) from §5.6/§5.7. The red set (recorded in the next-steps DONE row for
this unit):

- **Scoped walk:** the happy paths (1-7, 12), the fail-states (1, 2, 7-10), the
  `materialized`-set equivalence (14), the `validateDocFlow` pre-scoping verdict
  match (18).
- **`computeDocumentSubgraph`:** the happy paths (8, 9), the fail-states (3, 4),
  the single-source identity (15).
- **`rag.get_document` refactor:** the happy paths (10, 11), the fail-states
  (5, 6), the identical-result test (17).
- **`rebuildBackRefs` adapter replacement:** the happy path (13), the
  amendment-4 enforcement (16).
- **Amendment 8 (RCA-6):** the greens docs + trackers reconciled in the SAME
  pass as the code.
