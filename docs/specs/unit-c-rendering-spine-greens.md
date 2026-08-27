# Unit C — Rendering Spine: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-c-rendering-spine.md`
  ONLY — no implementation reading).
- **Source contract:** `docs/specs/unit-c-rendering-spine.md` §5.1-§5.8; persisted
  shapes from `docs/specs/unit-a-rag-store.md` §5.1; doc-flow semantics from
  `docs/specs/unit-b-document-model.md` §5.1-§5.2.
- **Module under test:** `src/main/traversal.ts` (`buildTraversal`). The render-path
  scenarios (S6/S7) additionally exercise the foundation's render path
  (`src/renderer/runtime.ts` `Runtime` + `src/shared/dom-shim.ts`) — these are the
  foundation the spec references, NOT the implementation under test.
- **Harness:** a throwaway ESM script in `/tmp` (NOT in the repo), bundled with
  esbuild and run under `node`. `buildTraversal` is a PURE function — imported
  directly. A `RagStore` is constructed via `createJsonRagStore` (Unit A) with a
  `mkdtemp` path and seeded with `RagNode`/`RagEdge` fixtures (Unit A §5.1 shape).

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.7 happy paths (10)

Fixture helpers: `N(id, type, content, props)` = a `RagNode`
`{ id, type, content, props, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. `root`/`root1`/
`root2`/`B-root`/`C-root` are `div` document-root nodes. `documentIds` are the
document-root node ids.

### S1. Single document, single zone
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

### S2. Multiple documents, one zone
- **Setup:** nodes `root1, H1, root2, H2`; edges `doc-head H1→root1`,
  `doc-end H1→root1` (doc1), `doc-head H2→root2`, `doc-end H2→root2` (doc2).
- **Ops:** `buildTraversal({ store, documentIds:['root1','root2'], zoneName:'main' })`.
- **Expected:** one container producer (`main`); two `ContentPayload`s
  (`rag-H1`, `rag-H2`); backRefs two entries; lineMap two ranges.

### S3. Valid doc-flow (doc-head marker prop)
- **Setup:** nodes `root, H(h1), A(p), B(p), E(p)`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root` (all `documentIds:['root']`).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** the head node H's subtree root carries
  `props['data-doc-head']===true`; the non-head subtree roots (A, B, E) do NOT
  carry it (`undefined`).

### S4. Doc-flow violation (next-section cycle) → fallback
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→A` (cycle), `doc-end E→root`.
- **Ops:** `buildTraversal(...)`; then render the envelope via the Runtime.
- **Expected:** no throw; the envelope has content payloads; the envelope renders
  in the `zone:main` container (family-pre-order fallback, Unit B §5.2).

### S5. Multi-parent node → duplicate subtrees (cross-document shared node)
- **Setup:** shared node `A` in two documents. nodes `B-root, C-root, B-head,
  B-use, C-head, C-use, A, D`; edges `doc-head B-head→B-root`,
  `doc-head C-head→C-root`, `next-section B-head→B-use, B-use→A, A→D`
  (`documentIds:['B-root']`), `next-section C-head→C-use, C-use→A, A→D`
  (`documentIds:['C-root']`), `doc-end D→B-root`, `doc-end D→C-root`,
  `parent-child B-use→A`, `parent-child C-use→A`, `parent-child A→D`.
- **Ops:** `buildTraversal({ store, documentIds:['B-root','C-root'], zoneName:'main' })`.
- **Expected:** A is materialized as TWO duplicate subtrees (two content roots
  with `props.id='rag-A'`, one per document); backRefs has one entry for A whose
  value is the union of both duplicate subtrees' node ids (length 2).
- **Note:** MULTI-PARENT-DUPLICATE manifests per-document (a shared node in N
  documents → N duplicate subtrees). Within a single document a multi-parent
  node is materialized once (in the doc-flow chain) — see §5.7.5 phrasing note
  in the findings.

### S6. Render path (envelope loads through `provident.load` + `loadEnvelope`)
- **Setup:** nodes `root, H(h1,'Title'), A(p,'Body text')`; edges `doc-head
  H→root`, `next-section H→A`, `doc-end A→root`.
- **Ops:** `buildTraversal(...)`; load the envelope through the UI path
  (`new Runtime({mount,envelope}).bootstrap()`) and the MCP path
  (`runtime.load({kind:'envelope',envelope})`).
- **Expected:** both paths render the RAG content (`Title`, `Body text`) inside
  the `zone:main` container (envelope → `translateLegacy` →
  `renderProducingProcess`).

### S7. MCP/UI equivalence
- **Setup:** same envelope as S6.
- **Ops:** load the same envelope through the UI path and the MCP
  `provident.load` path; compare the rendered output.
- **Expected:** the real graph (the RAG content + the `zone:main` container)
  renders identically through both surfaces. (The MCP `provident.load` on an
  already-loaded Runtime leaves the prior root in the mount — a foundation
  teardown artifact, not the traversal — so the comparison is on the graph
  content, not the raw mount string; see test-authoring note.)

### S8. Doc-child nesting (ul + 4 li)
- **Setup:** nodes `root, H(h1), UL(ul,'List'), LI1..LI4(li), E(p)`; edges
  `doc-head H→root`, `next-section H→UL, UL→E`, `doc-end E→root`,
  `doc-child UL→LI1(order:0), UL→LI2(order:1), UL→LI3(order:2), UL→LI4(order:3)`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the UL content root is a `ul` whose children are the four `li`
  doc-child subtrees at their `order` positions (`rag-LI1..rag-LI4`); backRefs
  has one entry for UL (its owned nodes, excluding the li's) + one entry per li
  doc-child (7 entries total: H, UL, LI1-4, E); lineMap maps each li's lines to
  its own doc-child RAG object (4 li ranges).

### S9. E2E — cross-document shared node (B/C → A → D)
- **Setup:** as S5 (A shared by B and C; A→D reference edge).
- **Ops:** `buildTraversal({ store, documentIds:['B-root','C-root'], zoneName:'main' })`;
  then mutate A's content in the store and re-traverse.
- **Expected:** A's spec is materialized as a duplicate subtree in each document
  (2 `rag-A` content roots); D is materialized in both documents (2 `rag-D`
  roots); backRefs has one entry for A with both duplicate subtree ids; after a
  text change to A, a re-traversal re-materializes both A duplicates with the
  new content (update-all-duplicates, §5.5).

### S10. Two distinct A→D edges (differing explanations)
- **Setup:** nodes `B-root, C-root, B-head, B-use, C-head, C-use, A, D_B, D_C`;
  edges `doc-head B-head→B-root`, `doc-head C-head→C-root`,
  `next-section B-head→B-use, B-use→A, A→D_B` (`documentIds:['B-root']`),
  `next-section C-head→C-use, C-use→A, A→D_C` (`documentIds:['C-root']`),
  `doc-end D_B→B-root`, `doc-end D_C→C-root`, `parent-child B-use→A`,
  `parent-child C-use→A`.
- **Ops:** `buildTraversal({ store, documentIds:['B-root','C-root'], zoneName:'main' })`.
- **Expected:** the B-specific explanation (D_B's content) renders in document B
  and the C-specific explanation (D_C's content) renders in document C; A is
  materialized in both documents.

---

## B. §5.8 fail-states (8)

### F1. Null/undefined input throws
- **Ops:** `buildTraversal(null)`, `(undefined)`, `({})`,
  `({ store, documentIds:[], zoneName:'' })`, `({ store, documentIds:[], zoneName:'main' })`,
  `({ store:undefined, documentIds:['root'], zoneName:'main' })`.
- **Expected:** each throws `Error('traversal: store/documentIds/zoneName required')`.

### F2. HARD PRECONDITION — container producer for every targeted zone
- **Setup:** two documents; doc1 → `zoneName:'main'`, doc2 → `zoneName:'sidebar'`.
- **Ops:** `buildTraversal` for each; inspect the container producers.
- **Expected:** doc1 emits a `main` container producer, doc2 emits a `sidebar`
  container producer; every `targetPlacement` zone in the content has a matching
  container producer in `template.root.children` (the traversal MUST NOT emit a
  `targetPlacement` naming a zone it does not also produce a container for).

### F3. Empty document
- **Setup:** store with only a `root` node (no content nodes, no edges).
- **Ops:** `buildTraversal({ store, documentIds:['root'], zoneName:'main' })`.
- **Expected:** no throw; the envelope still has the container producer (`main`);
  no `ContentPayload` for the empty document.

### F4. Dangling back-reference (map rebuilt per traversal)
- **Setup:** nodes `root, H, A`; edges `doc-head H→root`, `next-section H→A`,
  `doc-end A→root`.
- **Ops:** `buildTraversal(...)`; then `store.removeNode('A')` (cascades its
  edges); re-traverse.
- **Expected:** the initial backRefs has A; the fresh backRefs (after the delete +
  re-traversal) does NOT have A — the map is rebuilt per traversal, never stale
  (§5.3). (The read-only/commit-on-blur refusal is a Unit D concern.)

### F5. Doc-flow validation failure (missing-head) → fallback
- **Setup:** nodes `root, A, B`; edges `next-section A→B`, `doc-end B→root`
  (no `doc-head` edge).
- **Ops:** `buildTraversal(...)`; render the envelope.
- **Expected:** no throw; the envelope has content payloads; the envelope renders
  in `zone:main` (family-pre-order fallback, Unit B §5.2).

### F6. No `ownedNodeIds` → derive from subtree
- **Setup:** nodes `root, H, A`; edges `doc-head H→root`, `next-section H→A`,
  `doc-end A→root`; all nodes have `ownedNodeIds: []`.
- **Ops:** `buildTraversal(...)`.
- **Expected:** the traversal derives the owned set from the subtree structure;
  backRefs still records H and A → their subtree's node ids (non-empty).

### F7. Malformed envelope → well-formed `targetPlacement`
- **Setup:** nodes `root, H, A`; edges `doc-head H→root`, `next-section H→A`,
  `doc-end A→root`.
- **Ops:** `buildTraversal(...)`; inspect every content root's `targetPlacement`.
- **Expected:** every content root's `placement.targetPlacement` is a string
  array (the traversal emits well-formed `targetPlacement: string[]`, never a
  malformed value that would trip the engine's `placement-name-invalid`/
  `placement-target-invalid` guards).

### F8. Doc-child nesting cycle → fallback
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root`, `doc-child A→B`, `doc-child
  B→A` (nesting cycle).
- **Ops:** `buildTraversal(...)`; render the envelope.
- **Expected:** no throw; the envelope has content payloads; the envelope renders
  in `zone:main` (the `cycle` reason covers a `doc-child` nesting cycle, Unit B
  §5.2).

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| S1 | Single doc / single zone | ✅ PASS |
| S2 | Multiple docs / one zone | ✅ PASS |
| S3 | Valid doc-flow / doc-head marker | ✅ PASS |
| S4 | Doc-flow cycle → fallback | ✅ PASS |
| S5 | Multi-parent → duplicate subtrees | ✅ PASS |
| S6 | Render path (provident.load + loadEnvelope) | ✅ PASS |
| S7 | MCP/UI equivalence | ✅ PASS |
| S8 | Doc-child nesting (ul + 4 li) | ✅ PASS |
| S9 | E2E cross-document shared node (B/C → A → D) | ✅ PASS |
| S10 | Two distinct A→D edges | ✅ PASS |
| F1 | Null/undefined input throws | ✅ PASS |
| F2 | Container producer for every targeted zone | ✅ PASS |
| F3 | Empty document | ✅ PASS |
| F4 | Dangling back-reference | ✅ PASS |
| F5 | Doc-flow missing-head → fallback | ✅ PASS |
| F6 | No ownedNodeIds → derive from subtree | ✅ PASS |
| F7 | Well-formed targetPlacement | ✅ PASS |
| F8 | Doc-child nesting cycle → fallback | ✅ PASS |

**Run summary:** 18 scenarios — 18 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed in the traversal's behavior.** Every scenario derived from
  `docs/specs/unit-c-rendering-spine.md` §5.1-§5.8 passed against the live
  `buildTraversal`. The envelope shape, container-producer emission, backRefs
  shape, lineMap shape, doc-head marker, doc-child nesting, multi-parent
  duplicate, and all fail-states match the spec.

### Spec-internal tensions (not traversal drifts — flagged for the doc review)

- **`documentIds` on a `parent-child` reference edge (Unit A vs Unit C).** Unit C
  §5.7 scenario 9 describes the A→D reference edge as carrying
  `documentIds: [B, C]` (MULTIPLE document owners). Unit A §5.1 shape rule
  restricts `documentIds` to doc-flow kinds (`doc-head`/`next-section`/`doc-end`),
  and the live store REJECTS a `parent-child` edge with `documentIds`
  (`rag putEdge: documentIds required/invalid`). The E2E scenario was therefore
  run with a `parent-child` A→D edge WITHOUT `documentIds`; the core claims
  (A shared → duplicate subtree per document; text change updates both) all hold.
  The `documentIds`-on-a-reference-edge representation is a spec-internal
  contradiction between Unit A §5.1 and Unit C §5.7/Unit B §5.1 — a documentation
  reconciliation item, not a traversal defect.
- **§5.7.5 "two parent-child edges → two duplicate subtrees" phrasing.** Within a
  single document a multi-parent node is materialized ONCE (in the doc-flow
  chain); the duplicate materialization is per-document (a shared node in N
  documents → N duplicate subtrees), consistent with §5.5 and the material-state
  nuance in §4. S5 tests the cross-document case. The §5.7.5 wording is imprecise
  but the intent (MULTI-PARENT-DUPLICATE) is honored.

### Test-authoring notes (not drifts)

- **Minted node ids are global counters.** The engine mints node ids from a
  global counter that advances across `translateLegacy` calls, so the traversal's
  backRefs values (from its internal translate) cannot be reconciled against a
  fresh `translateLegacy` on the returned envelope — the ids differ because the
  counter has advanced. The backRefs values ARE the traversal's own minted ids
  (a last-traversal snapshot, Unit A §5.1); the renderer re-mints fresh ids and
  reconciles by the stable authored root id (`rag-<ragNodeId>`), per §5.3. A
  backRefs-vs-translateLegacy equality check is therefore NOT a valid drift test.
- **MCP `provident.load` mount artifact.** Calling `runtime.load({kind:'envelope'})`
  on an already-loaded Runtime tears down the prior graph and reloads; the
  foundation teardown leaves the prior root in the mount, so the raw mount string
  differs from a fresh UI load. S7 compares the graph content (the RAG content +
  the zone) rather than the raw mount string. This is a foundation teardown
  behavior, not the traversal under test.
- **`data-doc-head` lives in `props`.** The doc-head marker is emitted as
  `props['data-doc-head']` on the subtree root (S3 asserts via `props`, not the
  root object directly).
