# Unit G — Crosslink/Backlink: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-g-crosslink-backlink.md`
  ONLY — no implementation reading of the scenario content).
- **Source contract:** `docs/specs/unit-g-crosslink-backlink.md` §5.1–§5.10
  (the `crosslink` RAG edge kind, the custom `CROSSLINK_LINK_CONFIG` + the
  traversal `crosslinks` output, the host-side enumeration
  `listBacklinks`/`listOutlinks`/`enumerateLinks` + `documentOf`, the
  `rag.backlinks` MCP tool + the `rag-backlinks` IPC, the five-seam gate, §5.8
  happy paths, §5.9 fail-states, §5.10 census).
- **Modules under test:** `src/main/backlinks.ts` (`listBacklinks`,
  `listOutlinks`, `enumerateLinks`, `documentOf`), the `crosslink` edge kind in
  `src/main/rag-store.ts` (`RagEdgeKind` + the store's per-kind field
  enforcement), `CROSSLINK_LINK_CONFIG` + the `crosslinks` output in
  `src/main/traversal.ts` (`buildTraversal`), the `rag.backlinks` MCP handler +
  `handleRagBacklinksIpc` in `src/main/mcp-server.ts`, the `'crosslink'` kind in
  `src/main/edit-ops.ts` (`setEdge`), the `IPC_RAG_BACKLINKS` wiring in
  `src/shared/types.ts`, the gating predicate `groupForTool`/`toolAllowed`/
  `defaultSecurityConfig` (`src/main/security.ts`), and the engine's `Link`
  class (`provident-ssr/core/link.js`) for the defensive role-mismatch fail-state.
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The enumeration + traversal are exercised
  against a minimal read-only `RagStore` adapter over plain node/edge arrays
  (the same adapter pattern `rebuildBackRefs` uses — the enumeration + traversal
  only read `listNodes()`/`listEdges()`), so store order is controlled directly.
  The store-write scenarios (`putEdge`/`putNode`), the MCP/IPC handlers, and the
  `edit.set_edge` op are exercised against the concrete JSON store
  (`createJsonRagStore`), whose mutating methods are async and queue-serialized
  (awaited). The renderer negative contract (F7) is verified by static grep on
  `src/renderer/renderer.ts` (comments stripped), matching the Unit E F22 / Unit
  B G9 convention.
- **Run:** 38 scenarios — 38 pass, 0 fail. No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (15)

Fixture helpers: `N(id, type, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. The two-document
fixture has docA (`headA`→`sA1`→`endA`) and docB (`headB`→`sB1`→`endB`) flows, a
crosslink `cl1` (`sA1`→`sB1`, cross-document), and an unscoped `parent-child`
edge `pc1` (`nX`→`nY`) between two nodes with no document membership.

### H1. `listBacklinks` happy
- **Setup:** the two-document fixture.
- **Ops:** `listBacklinks(store, 'sB1')`.
- **Expected:** the edges that TARGET `sB1` — `eB-n1` (next-section,
  intra-document) then `cl1` (crosslink, cross-document) — in store order, each
  with its scope classification.

### H2. `listOutlinks` happy
- **Setup:** the two-document fixture.
- **Ops:** `listOutlinks(store, 'sA1')`.
- **Expected:** the edges that `sA1` SOURCES — `eA-n2` (next-section,
  intra-document) then `cl1` (crosslink, cross-document) — in store order, each
  with its scope classification.

### H3. `enumerateLinks` happy
- **Setup:** the two-document fixture.
- **Ops:** `enumerateLinks(store, 'sB1')`.
- **Expected:** the combined result — `nodeId === 'sB1'`, `backlinks` =
  `['eB-n1','cl1']`, `outlinks` = `['eB-n2']`, `crosslinkBacklinks` =
  `['cl1']`, `crosslinkOutlinks` = `[]`.

### H4. Cross-document classification
- **Setup:** the two-document fixture.
- **Ops:** `listBacklinks(store, 'sB1')`, find the `cl1` entry.
- **Expected:** `scope === 'cross-document'` (the crosslink's source `sA1` is in
  docA, its target `sB1` in docB — different documents).

### H5. Intra-document classification
- **Setup:** the two-document fixture.
- **Ops:** `listBacklinks(store, 'sB1')`, find the `eB-n1` entry.
- **Expected:** `scope === 'intra-document'` (a `next-section` edge within one
  document).

### H6. Unscoped classification
- **Setup:** the two-document fixture.
- **Ops:** `listOutlinks(store, 'nX')`.
- **Expected:** `['pc1']` with `scope === 'unscoped'` (the source `nX` has no
  document membership — indeterminate).

### H7. `documentOf` happy
- **Setup:** the two-document fixture.
- **Ops:** `documentOf(store, 'sA1')`, `documentOf(store, 'headA')`,
  `documentOf(store, 'docA')`, `documentOf(store, 'sB1')`,
  `documentOf(store, 'nX')`.
- **Expected:** `['docA']`, `['docA']`, `['docA']`, `['docB']`, `[]` (a node
  with no doc-flow membership → an empty set).

### H8. `rag.backlinks` happy
- **Setup:** a JSON store with `src`/`tgt` nodes + a `crosslink` edge `cl`
  (`src`→`tgt`).
- **Ops:** `handleRagTool(store, 'rag.backlinks', { nodeId: 'tgt' })`.
- **Expected:** the tool returns the `BacklinkResult` — `nodeId === 'tgt'`,
  `backlinks` = `['cl']`, `crosslinkBacklinks` = `['cl']`.

### H9. `rag-backlinks` IPC happy
- **Setup:** a JSON store with `src`/`tgt` nodes + a `crosslink` edge `cl`.
- **Ops:** `handleRagBacklinksIpc(store, { nodeId: 'tgt' })`.
- **Expected:** the IPC returns the same `BacklinkResult` — `nodeId === 'tgt'`,
  `backlinks` = `['cl']`.

### H10. MCP/UI equivalence happy
- **Setup:** a JSON store with `src`/`tgt` nodes + a `crosslink` edge `cl`.
- **Ops:** `handleRagTool(store, 'rag.backlinks', { nodeId: 'tgt' })` and
  `handleRagBacklinksIpc(store, { nodeId: 'tgt' })`.
- **Expected:** both produce the IDENTICAL result (the same `BacklinkResult`) —
  MCP/UI equivalence, §8.2 a BINDING constraint.

### H11. Traversal crosslink materialization happy
- **Setup:** the two-document fixture; traverse docA only.
- **Ops:** `buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' })`.
- **Expected:** the result has a `crosslinks: CrosslinkWiring[]` output with
  exactly `[{ edgeId: 'cl1', sourceRagNodeId: 'sA1', targetRagNodeId: 'sB1' }]`
  (the outgoing crosslink whose source `sA1` is materialized).

### H12. Traversal crosslink with a dangling target
- **Setup:** the two-document fixture; traverse docA only (cl1's target `sB1` is
  in docB, not materialized).
- **Ops:** `buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' })`.
- **Expected:** the wiring is still emitted (`cl1` present) — the source anchor
  is materialized, the target is a dangling reference; no throw.

### H13. `edit.set_edge` creating a crosslink
- **Setup:** a JSON store with `src`/`tgt` nodes.
- **Ops:** `handleEditTool(store, 'edit.set_edge', { kind: 'crosslink', source:
  'src', target: 'tgt' })`.
- **Expected:** `{ ok: true, edge }` with `edge.kind === 'crosslink'`; the edge
  exists in the store (a structural op → journaled → re-traversal).

### H14. Crosslink edge in the journal
- **Setup:** a JSON store with `src`/`tgt` nodes.
- **Ops:** `putEdge(E('cl', 'crosslink', 'src', 'tgt'))`; inspect the journal.
- **Expected:** a structural `edge-add` journal entry whose `edge.kind ===
  'crosslink'` (a structural entry → re-traversal).

### H15. A `crosslink` edge with `documentIds`
- **Setup:** a JSON store with `src`/`tgt` nodes; `putEdge` a crosslink with
  `documentIds: ['docA','docB','docA']`.
- **Expected:** the stored `documentIds` is deduped to `['docA','docB']`; the
  enumeration's `LinkEntry.documentIds` surfaces the owners (a crosslink with
  `documentIds: ['docA','docB']` → the outlink entry's `documentIds` equals
  `['docA','docB']`).

---

## B. §5.9 Fail-states (13)

### F1. `listBacklinks`/`listOutlinks`/`enumerateLinks` with a null/undefined `store`
- **Ops:** `listBacklinks(null, 'x')`, `listOutlinks(undefined, 'x')`,
  `enumerateLinks(null, 'x')`.
- **Expected:** each throws `Error('backlinks: store required')`.

### F2. `listBacklinks`/`listOutlinks`/`enumerateLinks` with a non-string/empty `nodeId`
- **Ops:** `listBacklinks(store, '')`, `listOutlinks(store, 42)`,
  `enumerateLinks(store, '')`.
- **Expected:** each throws `Error('backlinks: nodeId required')`.

### F3. `documentOf` with a null/undefined `store` or a non-string `nodeId`
- **Ops:** `documentOf(null, 'x')`, `documentOf(store, 42)`.
- **Expected:** each throws `Error('documentOf: store/nodeId required')`.

### F4. A nonexistent `nodeId` → an empty result (no throw)
- **Setup:** the two-document fixture.
- **Ops:** `listBacklinks(store, 'ghost')`, `listOutlinks(store, 'ghost')`,
  `enumerateLinks(store, 'ghost')`.
- **Expected:** `[]`, `[]`, and `{ nodeId: 'ghost', backlinks: [], outlinks: [],
  crosslinkBacklinks: [], crosslinkOutlinks: [] }` — no throw.

### F5. `rag.backlinks` with a missing/empty `nodeId`
- **Setup:** a JSON store.
- **Ops:** `handleRagTool(store, 'rag.backlinks', {})`,
  `handleRagTool(store, 'rag.backlinks', { nodeId: '' })`,
  `handleRagBacklinksIpc(store, { nodeId: '' })`.
- **Expected:** each rejects with `Error('rag.backlinks: nodeId required')` (the
  IPC mirrors the MCP tool's fail-state).

### F6. `rag.backlinks` with the `rag` group disabled → not callable
- **Setup:** `defaultSecurityConfig()` (default-off).
- **Ops:** `toolAllowed('rag.backlinks', ['read','dispatch'])`,
  `toolAllowed('rag.backlinks', ['rag'])`, `defaultSecurityConfig()`.
- **Expected:** `false`, `true`; `defaultSecurityConfig().enabled ===
  ['read','dispatch']` (no `rag`).

### F7. A `rag.backlinks` that reaches the renderer switch → `unknown method` (static grep)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** read the renderer source, strip comments, grep for a `rag.backlinks`
  switch case.
- **Expected:** NO `case 'rag.backlinks'` switch case exists — a `rag.backlinks`
  that reaches the renderer switch hits the `default` branch → `unknown method`
  (fail-closed, the negative contract, Unit B §5.3 Seam 4).

### F8. A `crosslink` edge with `order` → rejected
- **Setup:** a JSON store with `src`/`tgt` nodes.
- **Ops:** `putEdge(E('cl', 'crosslink', 'src', 'tgt', { order: 1 }))`.
- **Expected:** rejects with `Error('rag putEdge: order required/invalid')` (the
  per-kind field enforcement — `order` is only valid on `doc-child`).

### F9. A self-referential `crosslink` edge (`source === target`) → rejected
- **Setup:** a JSON store with a `src` node.
- **Ops:** `putEdge(E('cl', 'crosslink', 'src', 'src'))`.
- **Expected:** rejects with `Error('rag putEdge: source required/invalid')`
  (Unit A §5.1).

### F10. A `crosslink` edge referencing a nonexistent/quarantined node → rejected
- **Setup:** a JSON store with a `src` node.
- **Ops:** `putEdge(E('cl', 'crosslink', 'src', 'missing'))`.
- **Expected:** rejects with `Error('rag putEdge: source/target node not found
  or quarantined')` (Unit A fail-state — referential integrity).

### F11. `edit.set_edge` with `kind: 'crosslink'` referencing a nonexistent node
- **Setup:** a JSON store with a `src` node.
- **Ops:** `handleEditTool(store, 'edit.set_edge', { kind: 'crosslink', source:
  'src', target: 'missing' })`.
- **Expected:** `{ ok: false, error: 'edit.set_edge: source/target node not
  found or quarantined' }` (Unit D §5.1.7).

### F12. A `crosslinks` wiring entry whose source root is NOT found in the translated tree → the renderer SKIPS it (no throw)
- **Setup:** the two-document fixture + an INCOMING crosslink `cl2` (`sB1`→`sA1`,
  source in docB).
- **Ops:** `buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' })`.
- **Expected:** the traversal emits wiring ONLY for materialized sources
  (outgoing-only materialization) — `cl1` (source `sA1` in docA) is emitted,
  `cl2` (source `sB1` in docB, not materialized) is NOT. The renderer's
  defensive skip (a wiring entry whose source root is not in the translated
  tree) is therefore never triggered; the graph still renders, no throw.

### F13. A `Link` created with a config whose `roles` does not include `'source'`/`'target'` → `Link.addAnchor` throws `LinkConfigError('role-mismatch')`
- **Setup:** the engine's `Link` class (`provident-ssr/core/link.js`).
- **Ops:** `new Link({ name: 'crosslink', roles: ['parent','child'] })` then
  `addAnchor({ role: 'source', target: fakeNode, options: {} })`.
- **Expected:** throws `LinkConfigError('role-mismatch')` (a defensive
  fail-state). The spec pins `CROSSLINK_LINK_CONFIG` with the correct roles —
  `CROSSLINK_LINK_CONFIG.roles` contains `'source'` and `'target'`, and a `Link`
  created with it accepts a `source` anchor (no throw).

---

## C. §5.10 Census / numeric claims (10)

### C1. Edge kinds — 6
- **Ops:** inspect the store's accepted `RagEdgeKind` union.
- **Expected:** exactly 6 kinds — `parent-child`, `doc-head`, `next-section`,
  `doc-end`, `doc-child`, `crosslink` (the 5 existing + `crosslink`). A
  `crosslink` edge is accepted by the store (verified in H13/H14).

### C2. Custom `LinkConfig` — 1
- **Ops:** inspect `CROSSLINK_LINK_CONFIG`.
- **Expected:** exactly `{ name: 'crosslink', roles: ['source', 'target'] }`.

### C3. Enumeration functions — 3 + 1 helper
- **Ops:** inspect `listBacklinks`, `listOutlinks`, `enumerateLinks`,
  `documentOf`.
- **Expected:** all 4 are functions (3 enumeration functions + 1 helper).

### C4. `LinkScope` values — 3
- **Ops:** enumerate the scopes produced across the fixture.
- **Expected:** exactly `cross-document`, `intra-document`, `unscoped` (all three
  are produced by the fixture's edges).

### C5. `LinkEntry` fields — 6
- **Ops:** inspect a `LinkEntry` from `listBacklinks`.
- **Expected:** exactly `edge`, `kind`, `source`, `target`, `documentIds?`,
  `scope` (6 fields).

### C6. `BacklinkResult` fields — 5
- **Ops:** inspect `enumerateLinks`'s result.
- **Expected:** exactly `nodeId`, `backlinks`, `outlinks`, `crosslinkBacklinks`,
  `crosslinkOutlinks` (5 fields).

### C7. MCP tool — 1 (`rag.backlinks`)
- **Ops:** `groupForTool('rag.backlinks')`.
- **Expected:** `'rag'` (the tool is registered in the `rag` group — Unit B §5.3;
  Unit G implements the FULL handler).

### C8. IPC — 1 (`rag-backlinks`)
- **Ops:** inspect `IPC_RAG_BACKLINKS`.
- **Expected:** `IPC_RAG_BACKLINKS === 'provident:rag-backlinks'` (the single
  renderer→main backlink IPC).

### C9. Traversal output — 1 new field (`crosslinks`)
- **Ops:** inspect `buildTraversal`'s result.
- **Expected:** the `TraversalResult` has a `crosslinks: CrosslinkWiring[]` field
  (an array).

### C10. `CrosslinkWiring` fields — 3
- **Ops:** inspect a `CrosslinkWiring` entry from `buildTraversal`.
- **Expected:** exactly `edgeId`, `sourceRagNodeId`, `targetRagNodeId` (3 fields).

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | `listBacklinks` happy | ✅ PASS |
| H2 | `listOutlinks` happy | ✅ PASS |
| H3 | `enumerateLinks` happy | ✅ PASS |
| H4 | Cross-document classification | ✅ PASS |
| H5 | Intra-document classification | ✅ PASS |
| H6 | Unscoped classification | ✅ PASS |
| H7 | `documentOf` happy | ✅ PASS |
| H8 | `rag.backlinks` happy | ✅ PASS |
| H9 | `rag-backlinks` IPC happy | ✅ PASS |
| H10 | MCP/UI equivalence happy | ✅ PASS |
| H11 | Traversal crosslink materialization happy | ✅ PASS |
| H12 | Traversal crosslink with a dangling target | ✅ PASS |
| H13 | `edit.set_edge` creating a crosslink | ✅ PASS |
| H14 | Crosslink edge in the journal | ✅ PASS |
| H15 | A `crosslink` edge with `documentIds` | ✅ PASS |
| F1 | Enumeration null/undefined store | ✅ PASS |
| F2 | Enumeration non-string/empty nodeId | ✅ PASS |
| F3 | `documentOf` null/undefined store or non-string nodeId | ✅ PASS |
| F4 | Nonexistent nodeId → empty result | ✅ PASS |
| F5 | `rag.backlinks` missing/empty nodeId | ✅ PASS |
| F6 | `rag.backlinks` with the `rag` group disabled | ✅ PASS |
| F7 | `rag.backlinks` reaching the renderer switch → unknown method | ✅ PASS |
| F8 | A `crosslink` edge with `order` → rejected | ✅ PASS |
| F9 | Self-referential `crosslink` → rejected | ✅ PASS |
| F10 | `crosslink` referencing a nonexistent/quarantined node → rejected | ✅ PASS |
| F11 | `edit.set_edge` kind crosslink referencing a nonexistent node | ✅ PASS |
| F12 | Crosslinks wiring entry whose source root is NOT found → renderer skips | ✅ PASS |
| F13 | `Link` with roles omitting source/target → `LinkConfigError('role-mismatch')` | ✅ PASS |
| C1 | Edge kinds (6) | ✅ PASS |
| C2 | Custom `LinkConfig` (1) | ✅ PASS |
| C3 | Enumeration functions (3 + 1 helper) | ✅ PASS |
| C4 | `LinkScope` values (3) | ✅ PASS |
| C5 | `LinkEntry` fields (6) | ✅ PASS |
| C6 | `BacklinkResult` fields (5) | ✅ PASS |
| C7 | MCP tool (1) | ✅ PASS |
| C8 | IPC (1) | ✅ PASS |
| C9 | Traversal output (1 new field) | ✅ PASS |
| C10 | `CrosslinkWiring` fields (3) | ✅ PASS |

**Run summary:** 38 scenarios — 38 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-g-crosslink-backlink.md` §5.1–§5.10 passed against the live
  modules. The `crosslink` RAG edge kind + its per-kind field enforcement (§5.1),
  the custom `CROSSLINK_LINK_CONFIG` + the traversal's `crosslinks` output +
  outgoing-only materialization (§5.2), the backlink/outlink enumeration +
  `documentOf` + the scope classification (§5.3), the `rag.backlinks` MCP tool +
  the `rag-backlinks` IPC + MCP/UI equivalence (§5.4), the five-seam gate (§5.5),
  the `edit.set_edge` crosslink creation (§5.6), all 15 happy paths (§5.8), all
  13 fail-states (§5.9), and every census claim (§5.10) match the spec. No
  spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **F12 (renderer defensive skip).** The spec's F12 is a RENDERER behavior (a
  wiring entry whose source root is not in the translated tree → the renderer
  skips that crosslink's materialization, no throw). The renderer is a
  browser-entry construct, not node-testable. The scenario verifies the
  traversal's guarantee that makes the defensive skip unreachable: the traversal
  emits wiring ONLY for materialized sources (outgoing-only materialization), so
  a wiring entry whose source is not in the translated tree never occurs. This is
  the closest node-testable verification of the fail-state's premise.
- **F13 (engine role-mismatch).** The engine's `Link.addAnchor` guard is
  exercised directly via `provident-ssr/core/link.js` (the `Link` class) + the
  `LinkConfigError` from `provident-ssr/core/errors.js`. The spec pins
  `CROSSLINK_LINK_CONFIG` with the correct roles, so the scenario asserts both
  the defensive throw (a config omitting `source`/`target`) AND that the pinned
  config accepts a `source` anchor (no throw).
- **F7 (renderer negative contract).** The renderer switch is a browser-entry
  construct, not node-testable; the scenario verifies the negative contract by
  static grep on `src/renderer/renderer.ts` (comments stripped), matching the
  Unit E F22 / Unit B G9 convention — no `case 'rag.backlinks'` exists, so a
  call reaching the renderer falls through to the `default` branch → `unknown
  method` (fail-closed).
- **F6 (rag group disabled).** Verified via `defaultSecurityConfig()` +
  `toolAllowed` from `src/main/security.ts`, matching the Unit E F21 convention.
