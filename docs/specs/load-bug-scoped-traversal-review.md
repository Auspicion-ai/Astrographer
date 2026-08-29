# Proposal Review — Load Bug: Scoped Document Rendering + Doc-Head Doc-Nav

- **Status:** REVIEWED — **PROCEED-WITH-AMENDMENTS** (2026-08-29). The proposal
  is a sound, well-grounded fix for a real load bug, but it is a multi-unit
  deliverable with a high-risk behavior change (the scoped walk's `materialized`
  set) and several coupling points (the `RagStore` interface, the snapshot
  adapter, the doc-nav's snapshot dependency, the `rag.get_document` contract)
  that must be pinned before code. Conditional on the user's go-ahead before the
  spec gate opens.
- **Proposal source:** a user-reported load bug — "Application is trying to parse
  entire graph and timing out. Correct behavior is that the document list only
  needs to find the document heads, and the document rendering only needs to
  walk the graph based on the document links from the head." The fix is host-side
  (`src/`), scoped to BOTH the document list AND document rendering.
- **Gate reference:** `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MULTI-PARENT-DUPLICATE**, **DERIVED-DOC-FLOW**,
  **DOC-CHILD**, **SINGLE-WRITER-STORE**, **MCP-UI-EQUIVALENCE**;
  `docs/specs/unit-a-rag-store.md` §5.3 (the `RagStore` interface — the
  abstraction layer), `docs/specs/unit-b-document-model.md` §5.4 (`rag.get_document`),
  `docs/specs/unit-c-rendering-spine.md` §5.1-§5.9 (`buildTraversal`),
  `docs/specs/unit-h-sidebar-panes.md` §5.3 (`deriveDocNavDocuments`/`docNavContent`),
  `docs/specs/unit-k-sidebar-panes-host.md` §5.1-§5.6 (the host + the snapshot
  adapter + `selectDocument`).

---

## 1. What the proposal asks

1. **New `RagStore` adjacency methods** (`src/main/rag-store.ts`):
   `edgesFrom(source)`, `edgesTo(target)`, `edgesByKind(kind)`,
   `edgesForDocument(documentId)`, `docHeadForDocument(documentId)`. The JSON
   store builds lazy indexes (one O(E) pass), invalidated on mutation. A new
   `createSnapshotStore(nodes, edges)` read-only adapter implements them for the
   renderer's snapshot.
2. **A lighter `rag-doc-heads` IPC** for the doc-nav: returns
   `{ documents: [{ documentId, title }] }` from the `doc-head` edges + head
   node content. The doc-nav (`PaneContext.snapshot` → `ctx.docHeads`,
   `deriveDocNavDocuments`, `selectDocument`) switches to it. The existing
   `RagSnapshotPayload` is preserved for `buildTraversal`.
3. **Scoped `buildTraversal` walk** (`src/main/traversal.ts`): per document,
   build `docNodeIds` via `edgesForDocument` + transitive `doc-child` closure via
   `edgesFrom`; scope the edges passed to `validateDocFlow`; build subtrees via
   `edgesFrom` filtered by kind; MULTI-PARENT-DUPLICATE via
   `edgesFrom(sectionId)` filtered by `parent-child`; crosslinks via
   `edgesFrom(materializedId)`; cycle protection via a `seen` set; `isDocHead`
   replaced by `docHeadForDocument` (O(1)).
4. **Line-map rendering:** keep per-subtree markdown rendering (the scoped walk
   reduces the subtree count).
5. **`rag.get_document` MCP tool:** refactor onto a shared
   `computeDocumentSubgraph(store, documentId)` helper using the adjacency
   methods (in scope — same O(E) scan pattern).
6. **Edit-surface change (accepted):** the scoped walk shrinks `materialized`,
   so `backRefs`/`crosslinks` drop nodes not reachable from the head; a
   regression test covers it.
7. **Test plan:** red→green→adversarial→greens→doc-review cycle. New tests for
   the adjacency methods, the scoped walk, the doc-heads IPC, the edit-surface
   change, cycle protection, and `createSnapshotStore`. Existing tests in
   `sidebar-panes.test.ts`, `sidebar-panes-host.test.ts`, `traversal.test.ts`,
   `traversal-e2e.test.ts` change.

## 2. The three-agent gate verdicts

| Review | Verdict | Key findings |
| --- | --- | --- |
| Validity | VALID-WITH-AMENDMENTS | The bug is real and the diagnosis is correct: `buildTraversal` (`traversal.ts:236-237`) copies the whole store (`listNodes()`/`listEdges()`) and then runs multiple full-edge passes per document — the `docNodeIds` scan (O(E)), the `while(changed)` doc-child closure (O(E) per iteration, O(E²) worst case), `validateDocFlow`, per-section `edges.filter` (O(S·E)), and the multi-parent loop (O(N·E)). The doc-nav derives documents from the full snapshot (`deriveDocNavDocuments` reads `snapshot.nodes` + `snapshot.edges`). Both halves of the fix are legitimate. |
| Critique | SOUND-WITH-AMENDMENTS | The scoped walk is the right mechanism (adjacency indexes turn the O(E²)/O(S·E)/O(N·E) passes into O(E) index build + O(adjacency) lookups). But the proposal under-specifies the `materialized`-set equivalence (item 6 is a behavior change, not just a perf win), the `createSnapshotStore`/JSON-store parity, the `selectDocument` validation source, and the `rag.get_document` return contract. |
| Architecture | SOUND-WITH-AMENDMENTS | Alternative A is architecturally sound: the adjacency methods are additive to the `RagStore` interface (Unit A §5.3), the snapshot adapter is the established pattern (`rebuildBackRefs` at `traversal.ts:490` + the host's `buildTraversalEnvelope` at `sidebar-panes.ts:824`), and `computeDocumentSubgraph` is a clean shared helper. The coupling points (the adapters must implement the new methods, the doc-nav loses the full snapshot, the scoped walk changes `materialized`) are all resolvable but must be pinned. |
| Change-analysis | **PROCEED-WITH-AMENDMENTS** | Feasible and worth doing; NOT buildable as written without the amendments below. The scoped walk is the load-bearing fix; the doc-heads IPC is a secondary but correct half. Conditional on the user's go-ahead before the spec gate opens. |

## 3. Feasibility verdict

**Feasible — grounded in the existing `RagStore` interface, the snapshot-adapter
pattern, and the current `rag.get_document` scoping.**

- **Adjacency methods:** additive to the `RagStore` interface (Unit A §5.3). The
  JSON store already holds `nodes`/`edges` Maps; a lazy `edgesFrom`/`edgesTo`/
  `edgesByKind` index (one O(E) build, invalidated on mutation) is a small,
  self-contained change. `edgesForDocument`/`docHeadForDocument` reuse the
  existing `documentIds` scoping semantics (Unit B §5.2 Finding 7).
- **`createSnapshotStore`:** the established read-only-adapter pattern
  (`rebuildBackRefs` at `traversal.ts:490`, the host at `sidebar-panes.ts:824`).
  It must implement the SAME adjacency semantics as the JSON store.
- **Scoped walk:** the current `buildTraversal` already computes `docNodeIds`
  (the document node set) and scopes the doc-child exclusion per document
  (HOST-C3). The scoped walk replaces the full-edge scans with adjacency
  lookups — a mechanical, well-understood transformation. The `rag.get_document`
  handler (`mcp-server.ts:150-192`) already implements the exact `docNodeIds`
  closure; `computeDocumentSubgraph` is a clean extraction.
- **Doc-heads IPC:** the doc-nav only needs `documentId` + `title` (the doc-head
  source node's content) — a strict subset of the snapshot. A lighter IPC is
  correct.

**Limitation (must be documented, not a blocker):** the boot/re-derive STILL
fetches the full `RagSnapshotPayload` for `buildTraversal` (the rendering half).
The scoped walk reduces the WALK cost (the O(E²)/O(S·E)/O(N·E) passes + the
per-subtree markdown renders), which is the dominant timeout cost, but the
snapshot IPC still serializes the whole store to the renderer. For a very large
graph the transfer remains a full-graph cost. The proposal should note this and
leave a follow-up (e.g. a main-side traversal or a scoped snapshot) in
`docs/pending.md`.

## 4. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `RagStore` adjacency methods + lazy indexes | Project-specific (additive to the Unit A interface) | Medium cost; the O(E²)/O(S·E)/O(N·E) walk becomes O(E) build + O(adjacency) lookups — the core timeout fix. |
| `createSnapshotStore` read-only adapter | Project-specific (the established adapter pattern) | Low cost; must share the JSON store's adjacency implementation to avoid renderer/main divergence. |
| The scoped `buildTraversal` walk | Project-specific (composes the adjacency methods) | Medium-high cost; the load-bearing fix, but the `materialized`-set change is a behavior change that must be pinned + regression-tested. |
| The `rag-doc-heads` IPC + doc-nav switch | Project-specific (a new IPC channel + `PaneContext.docHeads`) | Low cost; the doc-nav no longer needs the full snapshot. |
| The `rag.get_document` refactor onto `computeDocumentSubgraph` | Project-specific (a shared helper) | Low cost; must preserve the `{ documentId, nodes, edges }` contract (Unit B §5.4). |
| The edit-surface change (shrunk `materialized`) | Project-specific (a behavior change) | Medium cost; `backRefs`/`crosslinks` drop nodes not reachable from the head — must be pinned + regression-tested, and the greens docs reconciled. |

No engine gap. The fix is entirely host-side (`src/`).

## 5. The amendments (make it PROCEED-WITH-AMENDMENTS)

1. **HIGH — pin the `materialized`-set equivalence.** The scoped walk must
   produce the SAME `materialized` set as the current all-edges walk for the
   existing fixtures (sections + doc-children + multi-parent nodes), OR the
   difference must be a documented, regression-tested behavior change. Add a
   test that runs both walks on the same fixtures and asserts the materialized
   set (or the exact delta). The current walk's set is pinned by
   `traversal.test.ts`, `traversal-e2e.test.ts`, and the greens docs — the
   proposal's "a regression test covers it" is not enough; the equivalence (or
   the precise delta) must be asserted.
2. **HIGH — single source for the document node set.** `computeDocumentSubgraph
   (store, documentId)` must be the SINGLE shared derivation of the document's
   node set, used by BOTH the scoped `buildTraversal` walk AND the
   `rag.get_document` MCP tool. This prevents the traversal and the MCP contract
   from diverging. Pin a test that asserts the traversal's `docNodeIds` and the
   MCP tool's returned node set are identical on the same fixtures.
3. **HIGH — `createSnapshotStore` shares the adjacency implementation.** The
   read-only adapter must delegate to the SAME pure adjacency functions the JSON
   store uses (not a re-implementation), so the renderer's traversal cannot
   diverge from main's. Pin a test that runs the same adjacency queries against
   both the JSON store and the snapshot adapter and asserts identical results.
4. **HIGH — the adapters must implement the new methods.** `rebuildBackRefs`'s
   inline adapter (`traversal.ts:490`) and the host's `buildTraversalEnvelope`
   adapter (`sidebar-panes.ts:824`) currently implement only `listNodes`/
   `listEdges`. Once `buildTraversal` calls the new adjacency methods, both MUST
   be replaced by `createSnapshotStore` (or implement the new methods), or
   `buildTraversal` throws. Pin this in the spec.
5. **MEDIUM — `selectDocument` validation source.** When the doc-nav switches to
   `ctx.docHeads`, `selectDocument` (`sidebar-panes.ts:998-1004`) validates the
   id against `lastSnapshot.edges`; it must validate against the doc-heads list
   instead, and the host must retain a doc-heads cache. Update the F8 adversarial
   test (`unit-k-sidebar-panes-host.md` §3a F8) accordingly.
6. **MEDIUM — preserve the `rag.get_document` return contract.** The refactor
   must keep `{ documentId, nodes, edges }` with the exact node/edge scoping
   (doc-flow edges scoped by `documentId` + doc-child edges among the document's
   nodes — `mcp-server.ts:184-191`). Add a test asserting the refactored handler
   returns the identical result to the current handler on the same fixtures.
7. **MEDIUM — pin the `validateDocFlow` pre-scoping.** The scoped walk passes a
   pre-scoped edge set to `validateDocFlow`; the pre-scoping must produce the
   SAME verdict as the current full-edge call (Unit B §5.2 Finding 7 scopes
   internally). Pin a test that the scoped walk's verdict matches the current
   walk's verdict on the same fixtures (valid + each fail-state).
8. **MEDIUM — reconcile the greens docs + trackers (RCA-6).** The scoped-walk
   behavior change and the doc-nav IPC drift `unit-c-rendering-spine-greens.md`,
   `unit-d-editing-greens.md`, `unit-g-crosslink-backlink-greens.md`,
   `unit-h-sidebar-panes-greens.md`, `unit-k-sidebar-panes-host-greens.md`,
   `unit-r-traversal-inline-children-greens.md`, and the census claims in the
   specs. These must be reconciled in the SAME pass as the code (RCA-6 doc
   review), and `docs/defects.md`/`docs/next-steps.md` updated.
9. **LOW — document the snapshot-transfer limitation.** The boot/re-derive still
   fetches the full `RagSnapshotPayload`; the scoped walk reduces the walk cost,
   not the IPC transfer. Note this in the spec + `docs/pending.md` as a follow-up
   (main-side traversal or a scoped snapshot).

## 6. Sequencing (RCA-2 — split PER UNIT)

This is a multi-unit deliverable. Per AGENTS.md RCA-2/RCA-5, it MUST be split
into separate red→green→adversarial→greens→doc-review cycles, each delegated to
sub-agents, each landing as its own DONE row. Recommended split (3 units, in
dependency order):

- **Unit 1 — store adjacency** (`rag-store.ts` + `createSnapshotStore`): the new
  `RagStore` adjacency methods + the lazy indexes + invalidation + the read-only
  adapter. Self-contained; no consumer changes. Red→green→adversarial→greens→
  doc-review.
- **Unit 2 — scoped traversal + MCP refactor** (`traversal.ts` + `mcp-server.ts`):
  the scoped `buildTraversal` walk + `computeDocumentSubgraph` + the
  `rag.get_document` refactor + the edit-surface change. Depends on Unit 1. This
  is the highest-risk unit (the `materialized`-set change). Red→green→
  adversarial→greens→doc-review.
- **Unit 3 — doc-heads doc-nav** (`shared/types.ts` + `preload.ts` + `main.ts` +
  `pane-graph.ts` + `sidebar-panes.ts`): the `rag-doc-heads` IPC + the doc-nav
  switch (`PaneContext.docHeads`, `deriveDocNavDocuments`, `docNavContent`,
  `selectDocument`). Depends on Unit 1 (the doc-heads derivation can use
  `docHeadForDocument`/`edgesByKind`); independent of Unit 2, so it can run in
  parallel after Unit 1.

Each unit is its own red→green→adversarial→greens→doc-review cycle (RCA-1 red
set run + reported BEFORE implementation; RCA-3 adversarial pass mandatory;
RCA-6 doc review mandatory). Do NOT implement Units 1-3 in one inline pass.

## 7. Verdict

**PROCEED-WITH-AMENDMENTS.** The proposal is a sound, well-grounded fix for a
real load bug, and Alternative A is the right architecture. It is NOT buildable
as written — the amendments in §5 (especially the `materialized`-set
equivalence, the single `computeDocumentSubgraph` source, the
`createSnapshotStore` parity, and the adapter updates) must be folded into the
spec before code. The deliverable must be split into the three units in §6, each
with its own red→green→adversarial→greens→doc-review cycle. Only a passing
review PLUS the user's go-ahead may proceed to the spec gate.
