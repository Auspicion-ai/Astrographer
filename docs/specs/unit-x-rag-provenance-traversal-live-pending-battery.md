# Unit X — RAG Provenance Traversal — LIVE PENDING SCENARIO BATTERY

**Status:** PENDING — the live app was NOT running when this battery was written
(2026-09-08). Port `3787` was not listening and no Astrographer Electron process
was present, so the Unit X MCP tools (`rag.query` extended, `rag-stream`,
`get_query_audit_log`) were NOT live. This is a **parked** battery, not a
failure. A later iteration of the Live-Scenario Runner executes this battery once
the app is running.

**Source scenarios:** `docs/specs/unit-x-rag-provenance-traversal-greens.md`
(27 scenarios) authored from `docs/specs/unit-x-rag-provenance-traversal.md`
§5.1–§5.8. The Unit X MCP tools are implemented in `src/main/mcp-server.ts`
(registered in the `rag` group, main-handled) but were not reachable because the
app was down.

---

## 1. Prerequisites (the later iteration must confirm these first)

1. **The app is running with the HTTP MCP transport.** Launch via
   `scripts/start-app.sh` (defaults to `http` on `127.0.0.1:3787`). For an
   isolated, disposable store use `HOME=$(mktemp -d) scripts/start-app.sh
   --mode=lexical` (never the operator's real persisted store).
2. **Probe reachability (read-only):**
   ```
   curl -s -m 3 -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3787/mcp
   ```
   Expect a non-`000` HTTP response (the Streamable HTTP endpoint answers the
   request; a `405`/`400` on a bare GET is fine — the endpoint is up).
3. **The `rag` and `edit` tool groups are ENABLED.** Both are default-off
   (Unit B §5.3). The battery requires them. Confirm the tools are registered:
   ```
   node scripts/mcp-cli.mjs --target http --port 3787 tools
   ```
   Expect `rag.query`, `rag-stream`, `get_query_audit_log`, and the `edit.*`
   tools in the returned list. If the `rag` group is disabled, the Unit X tools
   are not registered — that is a gating finding, not a battery failure.
4. **Driver:** all steps below run through `scripts/mcp-cli.mjs` against the
   live HTTP target. The `run` command executes an array of `{cmd, args}` steps
   against ONE persistent host (so a prior `edit.*` step is visible to a later
   `rag.query` step):
   ```
   node scripts/mcp-cli.mjs --target http --port 3787 run <steps.json>
   ```
   Each step's result prints; the last step's result is the exit value.

---

## 2. Setup — build the reference→fact graph (one-time, before the scenarios)

The greens scenarios need a store containing `content` nodes (in documents),
`reference` nodes, `fact` nodes, `reference→fact` edges, `embed` edges, and
`doc-head` edges. Build it with the `edit.*` tools. The exact node/edge ids are
returned by each `edit.create_node`/`edit.set_edge` call; capture them and
substitute into the scenario steps below.

```json
[
  { "cmd": "edit.create_node", "args": { "type": "content", "content": "The capital of France is Paris." } },
  { "cmd": "edit.create_node", "args": { "type": "content", "content": "Paris is the capital of France." } },
  { "cmd": "edit.create_node", "args": { "type": "fact", "content": "France's capital is Paris." } },
  { "cmd": "edit.create_node", "args": { "type": "reference", "content": "See the France capital fact." } },
  { "cmd": "edit.create_node", "args": { "type": "fact", "content": "Paris lies on the Seine." } },
  { "cmd": "edit.create_node", "args": { "type": "reference", "content": "See the Seine fact." } },
  { "cmd": "edit.set_edge", "args": { "kind": "doc-head", "source": "<contentNode1>", "target": "<contentNode2>", "documentIds": ["doc-1"] } },
  { "cmd": "edit.set_edge", "args": { "kind": "crosslink", "source": "<referenceNode1>", "target": "<factNode1>" } },
  { "cmd": "edit.set_edge", "args": { "kind": "crosslink", "source": "<factNode1>", "target": "<factNode2>" } },
  { "cmd": "edit.set_edge", "args": { "kind": "crosslink", "source": "<referenceNode2>", "target": "<factNode2>" } },
  { "cmd": "edit.set_edge", "args": { "kind": "embed", "source": "<contentNode1>", "target": "<factNode1>" } }
]
```

> **Note for the later iteration:** the `edit.create_node` tool takes `type`
> (`content`/`fact`/`reference`) and `edit.set_edge` takes `kind`
> (`doc-head`/`crosslink`/`embed`/`link`). The store derives `nodeKind` from the
> node and `edgeType`/`state` from the edge. If a step's exact id/kind mapping
> differs from the above, reconcile against the live `rag.list_nodes` /
> `rag.get_edges` output and adjust the scenario steps accordingly — the
> *behavioral* expectations below are the contract.

---

## 3. The 27 scenarios — live MCP tool calls + expected results

### §5.1 Additive store fields (scenarios 1–4)

These are store-substrate behaviors (`putNode`/`putEdge`). On the live MCP
surface they are exercised **indirectly** through the `edit.*` tools + the
`rag.*` readers.

- **S1 — putNode nodeKind stored.** `edit.create_node` with `type:"fact"`; then
  `rag.list_nodes` (or `rag.get_document`) must return the node with
  `nodeKind:"fact"`. **Expected:** the created node is present with
  `nodeKind:"fact"`.
- **S2 — putNode invalid nodeKind.** `edit.create_node` with `type:"bogus"` must
  be rejected (the tool returns an error / the store throws
  `'rag putNode: nodeKind required/invalid'`). **Expected:** the call fails; no
  node is created.
- **S3 — putEdge edgeType/state stored.** `edit.set_edge` with `kind:"embed"`
  (an embed edge defaults to `edgeType:"embed"`, `state:"FRESH"`); then
  `rag.get_edges` must return the edge with `edgeType:"embed"` and its `state`.
  **Expected:** the edge is present with `edgeType:"embed"` and a valid `state`.
- **S4 — putEdge invalid edgeType.** `edit.set_edge` with an invalid `kind`
  must be rejected (the store throws
  `'rag putEdge: edgeType/state required/invalid'`). **Expected:** the call
  fails; no edge is created.

### §5.3 Provenance builders (scenarios 5–8)

Exercised through the `rag.query` result fields (`citations`, `trace`).

- **S5 — documentIdsForNode happy.** `rag.query` on a query matching the
  document's content node → the result's `citations` include the document id
  whose `docNodeIds` contain the node, sorted ascending. **Expected:** the
  citation set is non-empty and includes the owning document id.
- **S6 — documentIdsForNode no document.** `rag.query` on a node in no document
  → that node contributes no citation. **Expected:** the result's `citations`
  do not include a phantom document id for the orphan node.
- **S7 — buildCitations dedup.** `rag.query` returning duplicate
  `(documentId, nodeId)` items → `citations` is the deduplicated set in
  first-appearance order. **Expected:** no duplicate `(documentId, nodeId)`
  pairs in `citations`.
- **S8 — buildFlatTrace.** `rag.query` in default (flat) mode → `trace` is
  `{ mode:"flat", engine:"local", topK:<n>, source:"local" }`. **Expected:** the
  flat trace object with `mode:"flat"`, `engine:"local"`, `source:"local"`.

### §5.4 walkReferenceGraph (scenarios 9–13)

Exercised through `rag.query` with `mode:"graph"`.

- **S9 — walk happy + resolve-through.** `rag.query` with `mode:"graph"` on a
  query matching the reference node → `results` contain the resolved target
  `fact` nodes (incl. the fact-to-fact dependency), `trace` is the ordered
  `reference→fact` path, `citations` = the deduped resolved targets.
  **Expected:** non-empty `results` of `fact` nodes; graph-mode `trace`; no
  `blockedBy`.
- **S10 — walk surface-BROKEN/STALE.** Build a `crosslink` edge with a
  `BROKEN`/`STALE` state (via `edit.set_edge` + the store's state field); run
  `rag.query` `mode:"graph"` through it. **Expected:** the `BROKEN`/`STALE` edge
  is NOT traversed; it appears in `trace`; if no target resolves, `blockedBy`
  is populated with `{documentId, nodeId, state}`.
- **S11 — walk HopLimitExceeded.** Build a `reference` chain longer than
  `maxHops` with no resolved target; `rag.query` `mode:"graph"` with
  `maxHops:1` → the tool rejects with
  `'walkReferenceGraph: HopLimitExceeded'`. **Expected:** the call fails with
  the HopLimitExceeded message.
- **S12 — walk CycleDetected.** Build a `reference→fact→reference` cycle;
  `rag.query` `mode:"graph"` → the tool rejects with
  `'walkReferenceGraph: CycleDetected'`. **Expected:** the call fails with the
  CycleDetected message.
- **S13 — walk determinism.** Run the SAME `rag.query` `mode:"graph"` twice on
  the same store/seeds/options. **Expected:** byte-identical results (same
  `results`, `trace`, `citations`).

### §5.5 expandParentContext (scenarios 14–15)

Exercised through `rag.query` with `expand:"parent"`.

- **S14 — expandParentContext happy.** `rag.query` with `expand:"parent"` and a
  small `maxParentContext` → the top `maxParentContext` items carry a `parent`
  (owning document title + snippet); items beyond the cap are returned without
  one. **Expected:** the first `maxParentContext` results have a `parent`
  object; the rest do not.
- **S15 — expandParentContext stale.** A child reached via a `STALE` embed edge
  → its `parent.stale === true`. **Expected:** the `parent` object carries
  `stale:true` for the stale-reached child.

### §5.6 ragQuery (scenarios 16–21)

Exercised through the `rag.query` MCP tool.

- **S16 — ragQuery flat happy.** `rag.query` (default flat) → `results` (each
  `{documentId, nodeId, score, snippet, source:"local"}`), `citations`, flat
  `trace`, and the preserved `ranked`/`context`/`markdown`/`lineMap`/`k`.
  **Expected:** all fields present; each result has `source:"local"`.
- **S17 — ragQuery graph happy.** `rag.query` `mode:"graph"` → resolved target
  `fact` nodes, graph-mode `trace`, `citations` = the deduped resolved targets.
  **Expected:** as in S9.
- **S18 — ragQuery graph blocked.** `rag.query` `mode:"graph"` resolving no
  target → `{ results:[], citations:[], trace, blockedBy:[...] }` (a valid
  state, not an error). **Expected:** the tool returns successfully with empty
  `results`/`citations` and a populated `blockedBy`.
- **S19 — ragQuery filters.** `rag.query` with `filters:{nodeKind:"fact"}` in
  flat mode → only `fact`-kind nodes in `results`. **Expected:** every result
  node is a `fact` node.
- **S20 — ragQuery parent-context.** `rag.query` with `expand:"parent"` → the
  top `maxParentContext` items carry a `parent`. **Expected:** as in S14.
- **S21 — ragQuery validation fail.** `rag.query` with `query:""` (or
  whitespace) → the tool rejects with
  `'rag.query: query must be a non-empty string'`. **Expected:** the call fails
  with that message.

### §5.7 Query audit log (scenarios 22–23)

Exercised through `get_query_audit_log` (the MCP reader) + the `rag.query`/
`rag-stream` recorders.

- **S22 — audit record/list/clear.** Run several `rag.query` calls, then
  `get_query_audit_log` → `{ entries: [...] }` newest-first, each entry
  `{query, filters, mode, resultCount, timestamp, requester}` with
  `requester:"mcp"`. **Expected:** the log contains the recorded queries,
  newest first. (`clear()` is a module-level method with no MCP tool; verify it
  via the module test suite — the live surface only reads.)
- **S23 — audit bounded.** Drive > `maxEntries` (default 1000) `rag.query` calls
  → the log never throws and drops the OLDEST entry. **Expected:** the log
  stays at `maxEntries`; the oldest entry is gone. (Boundedness is a
  module-level ring-buffer behavior; the live surface confirms the log is
  non-throwing and bounded via `get_query_audit_log`.)

### §5.8 MCP tools (scenarios 24–27)

Directly exercised through the MCP surface.

- **S24 — rag.query extended.** `rag.query` with `{query, mode, maxHops, expand,
  filters}` → the extended result with the `store` stamp (the U-MS2 F3 field)
  AND records the call in the shared audit log (visible via
  `get_query_audit_log`). **Expected:** the result carries `store`; a matching
  audit entry appears.
- **S25 — rag-stream.** `rag-stream` with a valid query → the degenerate stream
  `[{ type:"result", result }, { type:"done" }]`. **Expected:** exactly two
  chunks, `result` then `done`. On a fail-state (e.g. empty query) → the stream
  is `[{ type:"error", error:"rag.query: query must be a non-empty string" }]`.
- **S26 — get_query_audit_log.** `get_query_audit_log` → `{ entries:
  auditLog.list() }`. **Expected:** the entries array (newest-first) matching
  the recorded calls.
- **S27 — rag.query empty query.** `rag.query` with `query:""` → the tool
  rejects with `'rag.query: query must be a non-empty string'`. **Expected:** the
  call fails with that message.

---

## 4. Result recording

For each scenario, record **PASS** (the live output matches the expected result)
or **FAIL** (a live contradiction of the greens — a real regression or a
doc/spec drift, never a pass). A scenario whose MCP tool is not yet live stays
parked here and is NOT a failure.

**Expected outcome when the app is live:** 27 scenarios — 27 PASS / 0 FAIL,
matching the greens set. Any live FAIL is a finding to report to the supervisor.

---

## 5. Handoff notes for the later iteration

- The Unit X tools are **implemented** in `src/main/mcp-server.ts` (registered
  in the `rag` group, main-handled; `handleRagTool` handles `rag.query`/
  `rag-stream`/`get_query_audit_log` with the shared `auditLog`). The only
  blocker is that the app was not running.
- The `rag` group is **default-off** (Unit B §5.3). If the app boots with the
  group disabled, the Unit X tools are not registered — enable the group before
  running the battery.
- Scenarios S1–S4, S22–S23 (and the `clear()`/boundedness internals) are
  store/audit-log module behaviors exercised indirectly through the MCP surface;
  their exact module-level fail-states are covered by the module test suite.
  The live battery confirms the MCP-reachable behavior.
- Use an isolated store (`HOME=$(mktemp -d)`) so the battery never touches the
  operator's real persisted RAG store.
