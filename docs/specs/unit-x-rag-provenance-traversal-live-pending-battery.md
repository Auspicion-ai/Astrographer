# Unit X — RAG Provenance Traversal — LIVE PENDING SCENARIO BATTERY

**Status:** PENDING — the live app was NOT running when this battery was written
(2026-09-08). Port `3787` was not listening and no Astrographer Electron process
was present, so the Unit X MCP tools (`rag.query` extended, `rag-stream`,
`get_query_audit_log`) were NOT live. This is a **parked** battery, not a
failure. A later iteration of the Live-Scenario Runner executes this battery once
the app is running.

**CORRECTED 2026-09-08 (live-testing finding F5 — HOST-LIVE-UX-SETUP):** the
graph-mode provenance scenarios (S9–S13) and the nodeKind-classified setup
(S1–S4) are **NOT live-exercisable** — there is **NO live MCP path that mints
`nodeKind:'fact'`/`'reference'` nodes**. `edit.create_node` is a STRUCTURAL op
(validates `type` against `RAG_NODE_TYPES` = h1-h6/p/ul/ol/li/blockquote/pre/code/
strong/em/a/img/div/table…, `edit-ops.ts:173-174`) and rejects RAG kinds with
`edit.create_node: invalid type`; markdown import does NOT set `nodeKind`
(no `nodeKind` in `markdown-parse.ts`/`markdown-import.ts` — imported nodes are
`nodeKind`-undefined ⇒ 'content'); the ONLY place RAG kinds are created is the
module test suite via direct `store.putNode(makeNode(…, { nodeKind: 'fact' }))`
(`tests/unit-x-rag-provenance-traversal.test.ts`). The **runnable MCP subset**
(flat-mode `rag.query`, `rag-stream`, `get_query_audit_log`, the `store` stamp,
the validation fails) IS live. The graph-mode provenance is covered by the
module-level greens and is parked here as not-live-exercisable (the V2-battery
A10/A11/B5/B6/C5 pattern).

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

## 2. Setup — the runnable MCP subset (one-time, before the scenarios)

The graph-mode provenance scenarios (S9–S13) and the nodeKind-classified setup
(S1–S4) are **NOT live-exercisable** (no live MCP path mints
`nodeKind:'fact'`/`'reference'` nodes — see the header correction). The runnable
MCP subset needs only a store with `content` nodes (in documents). Seed via
`edit.import_markdown` (which produces `content` nodes) or `edit.create_node`
with a STRUCTURAL `type`:

```json
[
  { "cmd": "edit.create_node", "args": { "type": "p", "content": "The capital of France is Paris." } },
  { "cmd": "edit.create_node", "args": { "type": "p", "content": "Paris is the capital of France." } }
]
```

> **Note for the later iteration:** `edit.create_node` takes a STRUCTURAL `type`
> (`p`/`div`/`h1`…), NOT a RAG kind (`fact`/`reference`/`content`). RAG
> `nodeKind` is a separate provenance field with NO live minting path. The
> graph-mode provenance scenarios are parked as not-live-exercisable (covered
> by the module-level greens).

---

## 3. The scenarios — live MCP tool calls + expected results

### §5.1 Additive store fields (scenarios 1–4) — NOT live-exercisable

These are store-substrate behaviors (`putNode`/`putEdge`) requiring
`nodeKind:'fact'`/`'reference'` nodes, which have NO live MCP minting path.
**Parked as not-live-exercisable** (covered by the module-level greens
`tests/unit-x-rag-provenance-traversal.test.ts`). The live `edit.create_node`
rejects RAG kinds with `edit.create_node: invalid type` (NOT the recorded
`rag putNode: nodeKind required/invalid`).

### §5.3 Provenance builders (scenarios 5–8) — NOT live-exercisable

Exercised through the `rag.query` result fields (`citations`, `trace`), which
require fact/reference nodes. **Parked as not-live-exercisable** (no live
minting path; covered by the module-level greens).

### §5.4 walkReferenceGraph (scenarios 9–13) — NOT live-exercisable

Graph-mode provenance requires fact/reference nodes + crosslink edges. **Parked
as not-live-exercisable** (no live minting path; covered by the module-level
greens).

### §5.5 expandParentContext (scenarios 14–15) — NOT live-exercisable

Requires embed edges to fact nodes. **Parked as not-live-exercisable** (covered
by the module-level greens).

### §5.6 ragQuery (scenarios 16–21)

- **S16 — ragQuery flat happy.** `rag.query` (default flat) on a content-only
  store → `results` (each `{documentId, nodeId, score, snippet, source:"local"}`),
  `citations`, flat `trace`, and the preserved `ranked`/`context`/`markdown`/
  `lineMap`/`k`. **Expected:** all fields present; each result has
  `source:"local"`. **LIVE.**
- **S17 — ragQuery graph happy.** **NOT live-exercisable** (needs fact nodes).
- **S18 — ragQuery graph blocked.** **NOT live-exercisable** (needs fact nodes).
- **S19 — ragQuery filters.** `rag.query` with `filters:{nodeKind:"fact"}` —
  **NOT live-exercisable** (no fact nodes live; the `filters` schema accepts
  `nodeKind` but a content-only store returns no fact-kind results).
- **S20 — ragQuery parent-context.** **NOT live-exercisable** (needs embed edges
  to fact nodes).
- **S21 — ragQuery validation fail.** `rag.query` with `query:""` (or
  whitespace) → the tool rejects with
  `'rag.query: query must be a non-empty string'`. **LIVE.**

### §5.7 Query audit log (scenarios 22–23) — LIVE

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
  audit entry appears. **LIVE** (the graph-mode fields are present but return
  empty on a content-only store).
- **S25 — rag-stream.** `rag-stream` with a valid query → the degenerate stream
  `[{ type:"result", result }, { type:"done" }]`. **Expected:** exactly two
  chunks, `result` then `done`. On a fail-state (e.g. empty query) → the stream
  is `[{ type:"error", error:"rag.query: query must be a non-empty string" }]`.
  **LIVE.**
- **S26 — get_query_audit_log.** `get_query_audit_log` → `{ entries:
  auditLog.list() }`. **Expected:** the entries array (newest-first) matching
  the recorded calls. **LIVE.**
- **S27 — rag.query empty query.** `rag.query` with `query:""` → the tool
  rejects with `'rag.query: query must be a non-empty string'`. **Expected:** the
  call fails with that message. **LIVE.**

---

## 4. Result recording

For each scenario, record **PASS** (the live output matches the expected result)
or **FAIL** (a live contradiction of the greens — a real regression or a
doc/spec drift, never a pass). A scenario whose MCP tool is not yet live stays
parked here and is NOT a failure.

**Expected outcome when the app is live:** the runnable MCP subset (S16, S21,
S22, S23, S24, S25, S26, S27) — **8 PASS / 0 FAIL**; the graph-mode provenance
(S1–S15, S17–S20) is parked as not-live-exercisable (covered by the module-level
greens) and is NOT a failure. Any live FAIL is a finding to report to the
supervisor.

---

## 5. Handoff notes for the later iteration

- The Unit X tools are **implemented** in `src/main/mcp-server.ts` (registered
  in the `rag` group, main-handled; `handleRagTool` handles `rag.query`/
  `rag-stream`/`get_query_audit_log` with the shared `auditLog`). The only
  blocker is that the app was not running.
- The `rag` group is **default-off** (Unit B §5.3). If the app boots with the
  group disabled, the Unit X tools are not registered — enable the group before
  running the battery.
- **Graph-mode provenance (S9–S13) + the nodeKind-classified setup (S1–S4) are
  NOT live-exercisable** — there is NO live MCP path that mints
  `nodeKind:'fact'`/`'reference'` nodes (`edit.create_node` is structural;
  markdown import does NOT set `nodeKind`; RAG kinds are created only via direct
  `store.putNode` in the module test suite). They are covered by the module-level
  greens and are NOT re-attempted live. Extending `edit.create_node` to mint RAG
  kinds is a SEPARATE feature addition (see `docs/defects.md` HOST-LIVE-UX-SETUP).
- Scenarios S22–S23 (and the `clear()`/boundedness internals) are store/audit-log
  module behaviors exercised indirectly through the MCP surface; their exact
  module-level fail-states are covered by the module test suite. The live battery
  confirms the MCP-reachable behavior.
- Use an isolated store (`HOME=$(mktemp -d)`) so the battery never touches the
  operator's real persisted RAG store.
