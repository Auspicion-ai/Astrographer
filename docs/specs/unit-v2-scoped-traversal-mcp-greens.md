# Unit V2 — Scoped Traversal + MCP Refactor: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-v2-scoped-traversal-mcp.md` ONLY — §5.1–§5.7 + §3a adversarial
  resolutions — no implementation reading).
- **Source contract:** `docs/specs/unit-v2-scoped-traversal-mcp.md` §5.1–§5.7;
  the `TraversalInput`/`TraversalResult`/envelope shapes from
  `docs/specs/unit-c-rendering-spine.md` §5.1–§5.3 (unchanged); the adjacency
  methods + `createSnapshotStore` from `docs/specs/unit-v1-store-adjacency.md`
  §5.2/§5.4; the `validateDocFlow` verdict shape from
  `docs/specs/unit-b-document-model.md` §5.2.
- **Module under test:** `src/main/traversal.ts` (`buildTraversal` +
  `computeDocumentSubgraph` + `rebuildBackRefs`), `src/main/mcp-server.ts`
  (`handleRagTool` → the `rag.get_document` case), `src/main/doc-flow.ts`
  (`validateDocFlow` — the pre-scoping verdict-match reference).
- **Harness:** a vitest file in the repo
  (`tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts`), run under
  `vitest run`. `buildTraversal`/`computeDocumentSubgraph`/`rebuildBackRefs`
  are PURE — imported directly. A `RagStore` is constructed via
  `createJsonRagStore` (seeded with `putNode`/`putEdge`) for the traversal +
  MCP scenarios, and via `createSnapshotStore(nodes, edges)` for the pure
  `computeDocumentSubgraph`/`rebuildBackRefs`/`validateDocFlow` scenarios.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. The scoped `buildTraversal` walk (§5.1 / §5.6 happy 1–7, 12 / §5.7 fail 1, 2, 7–10)

Fixture helpers: `N(id, type, content, props)` = a `RagNode`
`{ id, type, content, props, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. `root`/`root1`/
`root2`/`B-root`/`C-root` are `div` document-root nodes. `documentIds` are the
document-root node ids. `contentRootIds(r)` = the RAG ids that got a content
root in the envelope (`envelope.content[*].content[0].props.id` minus the
`rag-` prefix) — the observable `materialized` set.

### A1. Single document, single zone (happy 1)
- **Setup:** nodes `root, H(h1,'Title')`; edges `doc-head H→root`,
  `doc-end H→root` (both `documentIds:['root']`).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** envelope `template.root` is a `div` with `props.id='wiki-root'`
  and one container producer (`placement.placementName:'main'`); exactly one
  `ContentPayload` (the H subtree root, `props.id='rag-H'`,
  `props['data-doc-head']=true`, `placement.targetPlacement:['main']`);
  `clientConfig={runInstantiation:true,runRendering:true}`; backRefs has one
  entry (`H` → non-empty node-id array); lineMap has one range (`H`,
  `startLine<endLine`).

### A2. Multiple documents, one zone (happy 2)
- **Setup:** nodes `root1, H1, root2, H2`; edges `doc-head H1→root1`,
  `doc-end H1→root1` (doc1), `doc-head H2→root2`, `doc-end H2→root2` (doc2).
- **Ops:** `buildTraversal({ store, documentIds:['root1','root2'], zoneName:'main' })`.
- **Expected:** one container producer (`main`); two `ContentPayload`s
  (`rag-H1`, `rag-H2`); backRefs two entries; lineMap two ranges.

### A3. Valid doc-flow — doc-head marker via `docHeadForDocument` (happy 3)
- **Setup:** nodes `root, H(h1), A(p), B(p), E(p)`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** the head node H's subtree root carries
  `props['data-doc-head']===true` (via `docHeadForDocument`, O(1)); the
  non-head subtree roots (A, B, E) do NOT carry it (`undefined`).

### A4. Doc-flow violation (next-section cycle) → fallback (happy 4)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→A` (cycle), `doc-end E→root`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** no throw; the envelope has content payloads (family-pre-order
  fallback, Unit B §5.2).

### A5. Multi-parent node → duplicate subtrees (happy 5)
- **Setup:** nodes `root, H, A, B, E, M`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`),
  `parent-child A→M`, `parent-child B→M` (M has two parents, both sections).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** M is materialized as TWO duplicate subtrees (two content roots
  with `props.id='rag-M'`, one per parent); backRefs has one entry for M (both
  duplicates share the RAG id in the backRefs map).

### A6. Doc-child nesting (ul + 4 li) (happy 6)
- **Setup:** nodes `root, H(h1), UL(ul,'List'), LI1..LI4(li), E(p)`; edges
  `doc-head H→root`, `next-section H→UL, UL→E`, `doc-end E→root`,
  `doc-child UL→LI1(order:0), UL→LI2(order:1), UL→LI3(order:2), UL→LI4(order:3)`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the UL content root is a `ul` whose `li` children are the four
  doc-child subtrees at their `order` positions (`rag-LI1..rag-LI4`); backRefs
  has one entry for UL + one per li doc-child (7 entries total: H, UL, LI1-4,
  E); lineMap maps each li's lines to its own doc-child RAG object (4 li
  ranges).

### A7. E2E cross-document shared node (B/C → A → D) (happy 7)
- **Setup:** nodes `B-root, C-root, B-head, B-use, C-head, C-use, A, D`; edges
  `doc-head B-head→B-root`, `doc-head C-head→C-root`,
  `next-section B-head→B-use, B-use→A, A→D` (`documentIds:['B-root']`),
  `next-section C-head→C-use, C-use→A, A→D` (`documentIds:['C-root']`),
  `doc-end D→B-root`, `doc-end D→C-root`, `parent-child B-use→A`,
  `parent-child C-use→A`.
- **Ops:** `buildTraversal({ store, documentIds:['B-root','C-root'], zoneName:'main' })`.
- **Expected:** A is materialized as TWO duplicate subtrees (two `rag-A` content
  roots, one per document); D is materialized in both documents (two `rag-D`
  roots); backRefs has one entry for A (both duplicates share the RAG id).

### A8. Cycle protection — a doc-child cycle terminates via the family-pre-order fallback (happy 12 / HOST-5)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root`, `doc-child A→B`,
  `doc-child B→A` (nesting cycle).
- **Ops:** `buildTraversal(...)`.
- **Expected:** terminates (no infinite loop) and does not throw; the
  `validateDocFlow` `cycle` verdict fell back to family pre-order (the `seen`
  set is defense-in-depth, effectively unreachable — §5.1 step 9).

### A9. Edit-surface shrink — a node not reachable from the head is dropped (amendment 1 / HOST-4)
- **Setup:** nodes `root, H, A, B, E, STRAY, X`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`),
  `next-section STRAY→X` (`documentIds:['root']`). STRAY is a source of a
  doc-flow edge scoped to the document (so it is in the document's node set)
  but is NOT reachable from the head.
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`;
  also `computeDocumentSubgraph(store, 'root')`.
- **Expected:** the reachable nodes (H, A, B, E) are materialized;
  `computeDocumentSubgraph` puts STRAY in `docNodeIds` (it is in the document's
  node set) but STRAY is NOT reachable from the head → dropped from the
  envelope content roots and from backRefs (the accepted edit-surface change —
  §5.4).

### A10. `buildTraversal` null/undefined/missing-field input throws (fail 1)
- **Ops:** `buildTraversal(null)`, `(undefined)`, `({})`,
  `({ store, documentIds:[], zoneName:'' })`,
  `({ store:undefined, documentIds:['root'], zoneName:'main' })`.
- **Expected:** each throws `Error('traversal: store/documentIds/zoneName required')`.

### A11. `buildTraversal` with a `listNodes`/`listEdges`-only adapter throws (amendment 4 / fail 2)
- **Setup:** a store object exposing only `listNodes`/`listEdges` (the old
  `rebuildBackRefs`/`buildTraversalEnvelope` adapter shape).
- **Ops:** `buildTraversal({ store: only, documentIds:['root'], zoneName:'main' })`.
- **Expected:** the adjacency call fails → `buildTraversal` throws (the
  `createSnapshotStore` replacement is required).

### A12. Empty document → no ContentPayload, no throw (fail 8)
- **Setup:** store with only a `root` node (no content nodes, no edges).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** no throw; the envelope still has the container producer
  (`main`); no `ContentPayload` for the empty document.

### A13. Doc-flow missing-head → fallback, no throw (fail 9)
- **Setup:** nodes `root, A, B`; edges `next-section A→B`, `doc-end B→root`
  (no `doc-head` edge).
- **Ops:** `buildTraversal(...)`.
- **Expected:** no throw; the envelope has content payloads (family-pre-order
  fallback).

### A14. HARD PRECONDITION — every `targetPlacement` zone has a container producer (fail 7)
- **Setup:** nodes `root, H, A`; edges `doc-head H→root`,
  `next-section H→A`, `doc-end A→root`.
- **Ops:** `buildTraversal(...)`; inspect every content root's `targetPlacement`
  against the container producers.
- **Expected:** every content root's `targetPlacement` zone has a matching
  container producer in `template.root.children` (the traversal MUST NOT emit a
  `targetPlacement` naming a zone it does not also produce a container for).

---

## B. `computeDocumentSubgraph` (§5.2 / §5.6 happy 8, 9 / §5.7 fail 3, 4 / HOST-3)

### B1. Happy — doc root + flow nodes + transitive doc-children; scoped edges (happy 8)
- **Setup:** nodes `root, H, A, B, E, LI`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`),
  `doc-child A→LI`.
- **Ops:** `computeDocumentSubgraph(createSnapshotStore(nodes, edges), 'root')`.
- **Expected:** `docNodeIds` = `{ root, H, A, B, E, LI }` (doc root + flow nodes
  + the transitive doc-child); `edges` = the scoped doc-flow edges + the
  `doc-child` edge among the document's nodes.

### B2. Empty document → `docNodeIds = { documentId }`, `edges = []` (happy 9)
- **Setup:** nodes `root` (only), no edges.
- **Ops:** `computeDocumentSubgraph(store, 'root')`.
- **Expected:** `docNodeIds` = `{ root }`; `edges` = `[]`.

### B3. Unknown document id → `docNodeIds = { documentId }`, `edges = []` (HOST-3)
- **Setup:** nodes `root`, no edges.
- **Ops:** `computeDocumentSubgraph(store, 'ghost')`.
- **Expected:** `docNodeIds` = `{ ghost }`; `edges` = `[]` (no crash).

### B4. Malformed — a `doc-head` edge with a missing target does not crash (HOST-3)
- **Setup:** nodes `H`; edges `doc-head H→missing-root` (`documentIds:['root']`).
- **Ops:** `computeDocumentSubgraph(store, 'root')`.
- **Expected:** no crash; the closure adds the edge endpoints (`H`,
  `missing-root`) to `docNodeIds` (the `validateDocFlow` fallback handles the
  missing node downstream).

### B5. Null/undefined `store` throws (fail 3)
- **Ops:** `computeDocumentSubgraph(null, 'root')`, `(undefined, 'root')`.
- **Expected:** each throws `Error('computeDocumentSubgraph: store required')`.

### B6. Non-string/empty-string `documentId` throws (fail 4)
- **Ops:** `computeDocumentSubgraph(store, '')`, `(store, null)`.
- **Expected:** each throws
  `Error('computeDocumentSubgraph: documentId must be a non-empty string')`.

---

## C. The `rag.get_document` MCP refactor (§5.3 / §5.6 happy 10, 11 / §5.7 fail 5, 6 / HOST-6)

Invoked via `handleRagTool(store, 'rag.get_document', { documentId })`.

### C1. Happy — `{ documentId, nodes, edges }` with the document node set + scoped edges (happy 10)
- **Setup:** nodes `root, H, A, LI`; edges `doc-head H→root`,
  `next-section H→A`, `doc-end A→root` (all `documentIds:['root']`),
  `doc-child A→LI`.
- **Ops:** `handleRagTool(store, 'rag.get_document', { documentId:'root' })`.
- **Expected:** returns `{ documentId:'root', nodes:[root,H,A,LI], edges:[the
  scoped doc-flow edges + the doc-child edge] }`.

### C2. Empty document → `{ documentId, nodes: [<doc root>], edges: [] }` (happy 11)
- **Setup:** nodes `root` (only), no edges.
- **Ops:** `handleRagTool(store, 'rag.get_document', { documentId:'root' })`.
- **Expected:** `{ documentId:'root', nodes:[root], edges:[] }`.

### C3. Unknown document id → `{ documentId, nodes: [], edges: [] }` (HOST-6)
- **Setup:** nodes `root`, no edges.
- **Ops:** `handleRagTool(store, 'rag.get_document', { documentId:'ghost' })`.
- **Expected:** `{ documentId:'ghost', nodes:[], edges:[] }` — NOT `[<doc root>]`.

### C4. Missing/empty `documentId` throws (fail 5)
- **Ops:** `handleRagTool(store, 'rag.get_document', {})`,
  `({ documentId:'' })`.
- **Expected:** each throws `Error('rag.get_document: documentId required')`.

### C5. Null store throws (fail 6)
- **Ops:** `handleRagTool(null, 'rag.get_document', { documentId:'root' })`.
- **Expected:** throws `Error('rag.get_document: no rag store configured')`.

---

## D. Cross-cutting amendments (§5.4, §5.5 / happy 13–18 / HOST-8)

### D1. `materialized`-set equivalence — the scoped walk materializes the reachable set (amendment 1 / happy 14)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`).
- **Ops:** `buildTraversal(...)`.
- **Expected:** for the standard valid-doc-flow fixture, the materialized set
  (the content roots) is exactly the reachable nodes `{H, A, B, E}` — the doc
  root is the container, not a content root; backRefs keys are the same set.

### D2. Single-source identity — `computeDocumentSubgraph.docNodeIds` == `rag.get_document` node set (amendment 2 / happy 15)
- **Setup:** nodes `root, H, A, LI`; edges `doc-head H→root`,
  `next-section H→A`, `doc-end A→root`, `doc-child A→LI`.
- **Ops:** `computeDocumentSubgraph(store, 'root')` and
  `handleRagTool(store, 'rag.get_document', { documentId:'root' })`.
- **Expected:** `[...subgraph.docNodeIds]` equals the returned `nodes` id set —
  the traversal and the MCP tool share the SINGLE derivation (neither re-derives
  inline).

### D3. Adapter replacement — `rebuildBackRefs` uses `createSnapshotStore`; a `listNodes`/`listEdges`-only adapter throws (amendment 4 / happy 16)
- **Setup:** nodes `root, H`; edges `doc-head H→root`, `doc-end H→root`.
- **Ops:** `rebuildBackRefs(nodes, edges, 'main')`; and
  `buildTraversal({ store: only, ... })` with a `listNodes`/`listEdges`-only
  adapter.
- **Expected:** `rebuildBackRefs` returns the backRefs map (its adapter is
  `createSnapshotStore`, not the inline one); the `listNodes`/`listEdges`-only
  adapter passed to `buildTraversal` throws (the replacement is required).

### D4. `rag.get_document` identical result — the refactored handler returns the documented contract (amendment 6 / happy 17)
- **Setup:** nodes `root, H, A, LI`; edges `doc-head H→root`,
  `next-section H→A`, `doc-end A→root`, `doc-child A→LI`.
- **Ops:** `handleRagTool(store, 'rag.get_document', { documentId:'root' })`.
- **Expected:** the returned `nodes` = the store's nodes whose id is in
  `docNodeIds`; the returned `edges` = the doc-flow edges scoped by
  `documentId` + the `doc-child` edges among the document's nodes (both
  endpoints in `docNodeIds`) — the exact `{ documentId, nodes, edges }` contract.

### D5. `validateDocFlow` pre-scoping verdict match (amendment 7 / happy 18)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`).
- **Ops:** `validateDocFlow(nodes, store.listEdges(), 'root')` (full-edge call)
  vs `validateDocFlow(nodes, store.edgesForDocument('root'), 'root')`
  (pre-scoped call).
- **Expected:** the pre-scoped verdict equals the full-edge verdict (both
  `ok:true` with the same order) — `edgesForDocument` returns EXACTLY the set
  `validateDocFlow` scopes internally (Unit B §5.2 Finding 7).

### D6. `rebuildBackRefs` via `createSnapshotStore` returns the backRefs map (happy 13)
- **Setup:** nodes `root, H, A`; edges `doc-head H→root`,
  `next-section H→A`, `doc-end A→root`.
- **Ops:** `rebuildBackRefs(nodes, edges, 'main')`.
- **Expected:** returns a `Map` with entries for H and A (the adapter is
  `createSnapshotStore`).

### D7. `rebuildBackRefs` empty-snapshot path → empty `Map`, never throws (HOST-8)
- **Ops:** `rebuildBackRefs([], [], 'main')`.
- **Expected:** returns an empty `Map` (never throws).

---

## Run record

| # | Scenario | Result |
| --- | --- | --- |
| A1 | Single doc / single zone | ✅ PASS |
| A2 | Multiple docs / one zone | ✅ PASS |
| A3 | Valid doc-flow / doc-head marker | ✅ PASS |
| A4 | Doc-flow cycle → fallback | ✅ PASS |
| A5 | Multi-parent → duplicate subtrees | ✅ PASS |
| A6 | Doc-child nesting (ul + 4 li) | ✅ PASS |
| A7 | E2E cross-document shared node (B/C → A → D) | ✅ PASS |
| A8 | Doc-child cycle → fallback (no infinite loop) | ✅ PASS |
| A9 | Edit-surface shrink (node not reachable from head dropped) | ✅ PASS |
| A10 | Null/undefined input throws | ✅ PASS |
| A11 | listNodes/listEdges-only adapter throws | ✅ PASS |
| A12 | Empty document → no ContentPayload | ✅ PASS |
| A13 | Doc-flow missing-head → fallback | ✅ PASS |
| A14 | HARD PRECONDITION — targetPlacement has a container | ✅ PASS |
| B1 | computeDocumentSubgraph happy | ✅ PASS |
| B2 | computeDocumentSubgraph empty document | ✅ PASS |
| B3 | computeDocumentSubgraph unknown id | ✅ PASS |
| B4 | computeDocumentSubgraph missing-node (no crash) | ✅ PASS |
| B5 | computeDocumentSubgraph null store throws | ✅ PASS |
| B6 | computeDocumentSubgraph empty documentId throws | ✅ PASS |
| C1 | rag.get_document happy | ✅ PASS |
| C2 | rag.get_document empty document | ✅ PASS |
| C3 | rag.get_document unknown id → `{documentId, [], []}` | ✅ PASS |
| C4 | rag.get_document missing documentId throws | ✅ PASS |
| C5 | rag.get_document null store throws | ✅ PASS |
| D1 | materialized-set equivalence | ✅ PASS |
| D2 | single-source identity (traversal == MCP node set) | ✅ PASS |
| D3 | adapter replacement (createSnapshotStore; only-adapter throws) | ✅ PASS |
| D4 | rag.get_document identical result (contract) | ✅ PASS |
| D5 | validateDocFlow pre-scoping verdict match | ✅ PASS |
| D6 | rebuildBackRefs via createSnapshotStore | ✅ PASS |
| D7 | rebuildBackRefs empty-snapshot path | ✅ PASS |

**Run summary:** 32 scenarios — 32 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-v2-scoped-traversal-mcp.md` §5.1–§5.7 + §3a passed against
  the live `buildTraversal`/`computeDocumentSubgraph`/`rebuildBackRefs` and the
  `rag.get_document` handler. The scoped walk, the shared `computeDocumentSubgraph`
  derivation, the `{ documentId, nodes, edges }` MCP contract (including the
  unknown-id `nodes: []` case), the `validateDocFlow` pre-scoping verdict match,
  the `createSnapshotStore` adapter replacement, and the `rebuildBackRefs`
  empty-snapshot path all match the spec.

### Test-authoring notes (not drifts)

- **The `materialized` set is observed via the envelope content roots + the
  backRefs keys** (`TraversalResult` does not expose a `materialized` field).
  The equivalence claim (amendment 1) is asserted as: for the standard
  valid-doc-flow fixture, the content-root set equals the reachable set, and a
  node in `docNodeIds` but not reachable from the head is dropped (A9).
- **A multi-parent node's backRefs value is the union of BOTH duplicate
  subtrees' owned node ids** (each duplicate subtree includes the node's
  textarea child — Unit L). The MULTI-PARENT-DUPLICATE claim is asserted via
  the content-root count (two `rag-<id>` roots) + the single shared backRefs
  entry, not a hardcoded value length.
- **The UL doc-child children are direct objects with `props.id`** (not wrapped
  in a `base` node). A6 extracts the `li` children by `type === 'li'` and reads
  `props.id`.
- **`createSnapshotStore` is used for the pure `computeDocumentSubgraph`/
  `rebuildBackRefs`/`validateDocFlow` scenarios** (synchronous, no seeding); the
  JSON store is used for the traversal + MCP scenarios (seeded via
  `putNode`/`putEdge`). Both are valid `RagStore` implementations
  (SOURCE-SWITCHABLE).
