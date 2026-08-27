# Unit B — Document Model + Doc-Flow + MCP Gating: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-b-document-model.md`
  ONLY — no implementation reading).
- **Source contract:** `docs/specs/unit-b-document-model.md` §5.2 (`validateDocFlow`),
  §5.3/§5.4 (the five-seam `rag`/`edit` gate), §5.5 (census); persisted shapes from
  `docs/specs/unit-a-rag-store.md` §5.1.
- **Modules under test:** `src/main/doc-flow.ts` (`validateDocFlow`),
  `src/main/security.ts` (`groupForTool`/`toolAllowed`/`defaultSecurityConfig`/
  `applyPatch`/`SecurityGate`), `src/main/mcp-server.ts`
  (`ProvidentMcpServer.ALL_TOOLS`/`registeredToolNames`/`toolForName`).
- **Harness:** a throwaway ESM script in `/tmp` (NOT in the repo), bundled with
  esbuild and run under `node`. `validateDocFlow` is a PURE function — imported
  directly with `RagNode`/`RagEdge` fixtures (Unit A §5.1 shape).
- **Renderer negative contracts** (Seam 4/5) are browser-entry, not node-testable;
  they are verified by static grep on `src/renderer/renderer.ts` (see G9).

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.2 `validateDocFlow` (13)

Fixture helpers: `N(id, type)` = a `RagNode` `{ id, type, content:'', ownedNodeIds:[], createdAt:'', updatedAt:'' }`;
`E(id, kind, source, target, extra)` = a `RagEdge` `{ id, kind, source, target, createdAt:'', updatedAt:'', ...extra }`.
`root` = a `div` document-root node. `documentId` = `'doc1'` unless noted.

### V1. Happy path (head-first order)
- **Setup:** nodes `root, H(h1), A, B, C, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→C, C→E`, `doc-end E→root` (all `documentIds:['doc1']`).
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: true, order: ['H','A','B','C','E'] }` — head-first, acyclic,
  reaches the end.

### V2. Missing-head (no doc-head edge)
- **Setup:** nodes `root, A, B, C, E`; edges `next-section A→B, B→C, C→E`,
  `doc-end E→root`. No `doc-head` edge.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-head' }`.

### V3. Missing-head (head node missing — rule 1 precedence)
- **Setup:** nodes `root, A, B, C, E`; edges `doc-head GHOST→root`,
  `next-section A→B, B→C, C→E`, `doc-end E→root`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-head' }` — a `doc-head` edge
  referencing a nonexistent node is `missing-head` (rule 1), NOT `missing-node`.

### V4. Missing-node (next-section references ghost)
- **Setup:** nodes `root, H, A, C, E`; edges `doc-head H→root`,
  `next-section H→A, A→GHOST`, `doc-end E→root`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-node' }`.

### V5. Missing-node (doc-end references ghost)
- **Setup:** nodes `root, H, A, B`; edges `doc-head H→root`,
  `next-section H→A, A→B`, `doc-end GHOST→root`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-node' }`.

### V6. Missing-node (doc-child references ghost)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root`, `doc-child A→GHOST (order:0)`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-node' }`.

### V7. Missing-node (doc-head target ghost)
- **Setup:** nodes `H, A, B, E` (no root); edges `doc-head H→GHOST`,
  `next-section H→A, A→B, B→E`, `doc-end E→GHOST`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-node' }` — the `doc-head` edge's
  TARGET (the document root) is checked here (rule 2), not as `missing-head`.

### V8. Cycle (next-section A→B→A)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→A`, `doc-end E→root`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'cycle' }`.

### V9. Cycle (doc-child nesting cycle)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B, B→E`, `doc-end E→root`, `doc-child A→B`, `doc-child B→A`.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'cycle' }` — a `doc-child` nesting cycle is a
  structural violation (the `cycle` reason covers BOTH `next-section` and
  `doc-child` cycles).

### V10. Missing-end (dangling chain)
- **Setup:** nodes `root, H, A, B, E`; edges `doc-head H→root`,
  `next-section H→A, A→B`, `doc-end E→root` (E is NOT the chain terminal).
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-end' }`.

### V10b. Missing-end (no doc-end edge)
- **Setup:** nodes `root, H, A, B`; edges `doc-head H→root`,
  `next-section H→A, A→B`. No `doc-end` edge.
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')`.
- **Expected:** `{ ok: false, reason: 'missing-end' }`.

### V11. Throw on null/undefined inputs
- **Setup:** `validateDocFlow(null, edges, 'doc1')`, `(undefined, edges, 'doc1')`,
  `(nodes, null, 'doc1')`, `(nodes, undefined, 'doc1')`, `(nodes, edges, null)`,
  `(nodes, edges, undefined)`.
- **Ops:** each call.
- **Expected:** each throws `Error('validateDocFlow: nodes/edges/documentId required')`
  (a malformed input is a caller error, never a silent fallback).

### V12. Cross-document scoping (shared node validated independently per documentId)
- **Setup:** shared node `S` in both `doc1` and `doc2`. nodes `root1, H1, A1, S,
  root2, H2, B2`. doc1 edges: `doc-head H1→root1`, `next-section H1→S, S→A1`,
  `doc-end A1→root1` (all `documentIds:['doc1']`). doc2 edges: `doc-head H2→root2`,
  `next-section H2→S, S→B2, B2→S` (cycle), `doc-end B2→root2` (all
  `documentIds:['doc2']`).
- **Ops:** `validateDocFlow(nodes, edges, 'doc1')` and `validateDocFlow(nodes, edges, 'doc2')`.
- **Expected:** doc1 → `{ ok: true, order: ['H1','S','A1'] }`; doc2 →
  `{ ok: false, reason: 'cycle' }`. A shared node is validated independently per
  `documentId` (the doc2 cycle does not poison doc1).

---

## B. §5.3/§5.4 five-seam gate (9)

`RAG_TOOLS` = `rag.query, rag.get_document, rag.list_nodes, rag.get_edges, rag.backlinks`.
`EDIT_TOOLS` = `edit.set_content, edit.create_node, edit.delete_node, edit.split_node, edit.merge_node, edit.set_edge`.

### G1. `groupForTool` maps all 11 names
- **Ops:** `groupForTool(t)` for each of the 11 names.
- **Expected:** each `rag.*` → `'rag'`; each `edit.*` → `'edit'`.

### G2. `defaultSecurityConfig()` is default-off
- **Ops:** `defaultSecurityConfig()`.
- **Expected:** `{ token: null, enabled: ['read','dispatch'] }` — `rag`/`edit` are
  NOT enabled by default.

### G3. `applyPatch` / `SecurityGate.apply` can enable `rag`/`edit`
- **Setup:** `applyPatch(defaultSecurityConfig(), { groups: ['read','dispatch','rag','edit'] })`;
  `new SecurityGate(defaultSecurityConfig()).apply({ groups: ['rag','edit'] })`.
- **Ops:** inspect the patched `enabled`; `gate.toolAllowed('rag.query')` /
  `gate.toolAllowed('edit.set_content')`.
- **Expected:** `enabled` includes `rag` and `edit`; both `toolAllowed` calls are
  `true`. (`VALID_GROUPS` accepts `rag`/`edit`; a bogus group is dropped.)

### G4. A `rag.*`/`edit.*` tool with its group disabled is not callable
- **Setup:** default config; and a config with only `read` enabled.
- **Ops:** `toolAllowed(t, enabled)` for each of the 11 names.
- **Expected:** all `false` under default; `rag.query`/`edit.set_content` `false`
  under read-only.

### G5. An `edit.*` tool with only `code` enabled is denied
- **Setup:** `applyPatch(defaultSecurityConfig(), { groups: ['code'] })` → `enabled`
  includes `code`.
- **Ops:** `toolAllowed(t, enabled)` for each `edit.*` name (and `rag.query`).
- **Expected:** all `false` — editing is NEVER a `code`-group op.

### G6. The tools are main-handled (never routed to the renderer)
- **Setup:** `registeredToolNames(gate, ProvidentMcpServer.ALL_TOOLS)` with the
  gate off (default) and on (`rag`+`edit` enabled).
- **Ops:** inspect the registered set.
- **Expected:** with the gate off, none of the 11 names are registered; with the
  gate on, all 11 are registered. The `rag`/`edit` tools register in MAIN (like
  `module.*`) only when their group is allowed.

### G7. `ALL_TOOLS` census — 11 new names
- **Setup:** `ProvidentMcpServer.ALL_TOOLS`.
- **Ops:** check membership + count of `rag.`/`edit.` names.
- **Expected:** all 11 names present; exactly 11 `rag.`/`edit.` names (5 `rag` + 6
  `edit`).

### G8. `toolForName` throws on malformed names (fail-closed)
- **Setup:** `toolForName('rag.')`, `('edit.')`, `('rag.query.x')`,
  `('edit.set_content.x')`, `('rag..query')`.
- **Ops:** each call.
- **Expected:** each throws (empty rest / double prefix — the existing F2 guard).

### G9. Renderer negative contract (Seam 4/5 — static grep)
- **Setup:** `src/renderer/renderer.ts`.
- **Ops:** grep for `rag.` and `edit.`; inspect `MUTATING_METHODS`.
- **Expected:** NO `rag.`/`edit.` switch cases (a `rag.*`/`edit.*` method reaching
  the renderer hits the `default` branch → `unknown method`, fail-closed); `edit.*`
  are NOT in `MUTATING_METHODS` (they do not mutate the renderer graph).
- **Evidence (grep):** `rag.` → NONE; `edit.` → NONE;
  `MUTATING_METHODS = new Set(['dispatch','load','op','teardown','code.load','code.loadBatch','journal'])`
  — no `edit.*` member.

---

## C. Run record

| # | Scenario | Result |
| --- | --- | --- |
| V1 | Happy path (head-first order) | ✅ PASS |
| V2 | Missing-head (no doc-head edge) | ✅ PASS |
| V3 | Missing-head (head node missing — rule 1 precedence) | ✅ PASS |
| V4 | Missing-node (next-section ghost) | ✅ PASS |
| V5 | Missing-node (doc-end ghost) | ✅ PASS |
| V6 | Missing-node (doc-child ghost) | ✅ PASS |
| V7 | Missing-node (doc-head target ghost) | ✅ PASS |
| V8 | Cycle (next-section A→B→A) | ✅ PASS |
| V9 | Cycle (doc-child nesting cycle) | ✅ PASS |
| V10 | Missing-end (dangling chain) | ✅ PASS |
| V10b | Missing-end (no doc-end edge) | ✅ PASS |
| V11 | Throw on null/undefined inputs | ✅ PASS |
| V12 | Cross-document scoping (shared node per documentId) | ✅ PASS |
| G1 | `groupForTool` maps all 11 names | ✅ PASS |
| G2 | `defaultSecurityConfig()` default-off | ✅ PASS |
| G3 | `applyPatch`/`SecurityGate.apply` enable `rag`/`edit` | ✅ PASS |
| G4 | `rag`/`edit` tool with group disabled not callable | ✅ PASS |
| G5 | `edit.*` with only `code` enabled denied | ✅ PASS |
| G6 | Tools main-handled (registeredToolNames gating) | ✅ PASS |
| G7 | `ALL_TOOLS` census — 11 new names | ✅ PASS |
| G8 | `toolForName` throws on malformed names | ✅ PASS |
| G9 | Renderer negative contract (static grep) | ✅ PASS |

**Run summary:** 22 scenarios — 22 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None.** Every scenario derived from `docs/specs/unit-b-document-model.md`
  §5.2–§5.5 passed against the live modules. No spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **`applyPatch` patch shape.** The spec (§5.3) names `applyPatch` and `VALID_GROUPS`
  but not the patch argument shape. The live module takes `applyPatch(config, patch)`
  where `patch = { token?, groups: string[] }` (a `groups` array, not `enabled`).
  The blind run probed this black-box; the spec's contract (VALID_GROUPS gains
  `rag`/`edit`; a bogus group is dropped) holds.
- **`toolAllowed` uses full tool names.** `toolAllowed('rag.query', enabled)` works
  directly; the existing read/dispatch tools use the `provident.*` prefix
  (`provident.get_rendered_html`), so `toolAllowed('get_rendered_html', ...)` is
  `false` — the 11 new `rag.*`/`edit.*` names are the contract under test.
- **`validateDocFlow` fixtures need the document-root node present.** The `doc-head`
  edge's TARGET (the document root) must be a node in `nodes`; a missing root is
  `missing-node` (V7), not `missing-head`. The happy-path order is the `next-section`
  chain from head to end (the root node is not part of the order).
