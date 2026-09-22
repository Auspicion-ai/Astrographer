# Blind-test Greens — Unit GN-MCP-UI: Gnosis MCP/UI Wiring (`gnosis.*` tools + `gnosis` group + `handleGnosisTool` + boot injection + GUI panes + `EngineRagResult` render path)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** —
  `docs/specs/unit-gn-mcp-ui-wiring.md` (§5.1–§5.11) + the proxy spec
  `docs/specs/unit-gn-engine-integration.md` (§5.1/§5.4/§5.6/§5.10) + the MCP
  endpoint spec `docs/specs/mcp-endpoint.md` (§3/§6.2). NO wiring-implementation
  or unit-test read. Scenarios are derived from the docs alone; a PASS is a
  genuine blind verification.
- **Run file:** `tests/blind-unit-gn-mcp-ui-wiring-greens.test.ts` (vitest).
- **Source under test (LIVE modules, the spec-pinned `.js` paths):**
  `src/main/mcp-server.js` (`handleGnosisTool`, `ProvidentMcpServer.ALL_TOOLS`,
  `registeredToolNames`), `src/main/security.js` (`groupForTool`,
  `defaultSecurityConfig`, `SecurityGate`), `src/main/engine-rag-store.js`
  (`createEngineRagStore`, `EngineRagResult` shape, typed `EngineWireError`
  family), `src/main/engine-config.js` (`setEngineConfigBaseUrl`,
  `getEngineConfigBaseUrl` — the S39 config-seam store), `src/renderer/pane-graph.js`
  (`gnosisStatusContent`, `gnosisQueryContent`, `gnosisStatusPaneHandler`,
  `searchContent`).
- **Runner invocation:** `npx vitest run tests/blind-unit-gn-mcp-ui-wiring-greens.test.ts`
  from the Astrographer repo root.

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## §5.2 the `gnosis` group + security (`A1`/`A7`, P-TP-1, P-IM-2, §5.8-9)

### S1. tool-name → group mapping is total/unambiguous (P-TP-1)
Concrete inputs: `groupForTool` from `src/main/security.js`.
Expected: `groupForTool('gnosis.query') === 'gnosis'`,
`groupForTool('gnosis.stream') === 'gnosis'`, `groupForTool('gnosis.status') === 'gnosis'`
(the three `TOOL_GROUPS` rows exist).
**Result:** PASS

### S2. `gnosis` group is default-OFF (P-IM-2)
Concrete inputs: `defaultSecurityConfig()` and a fresh `new SecurityGate()` from `security.js`.
Expected: `defaultSecurityConfig().enabled` does NOT include `'gnosis'`; the
`SecurityGate` (default config) does `not` allow any `gnosis.*` tool
(`toolAllowed('gnosis.query') === false`). The default enabled set stays
`['read', 'dispatch']`.
**Result:** PASS

### S3. enabling `gnosis` grants the three tools (invocation-level gate)
Concrete inputs: `new SecurityGate({ token:null, enabled:['read','dispatch','gnosis'] })`.
Expected: `gate.toolAllowed('gnosis.query') === true` for all three `gnosis.*` names.
**Result:** PASS

### S4. a `gnosis.*` name NOT in `TOOL_GROUPS` → `null` (fail-closed) (§5.2, §5.9-27, P-TP-1)
Concrete inputs: `groupForTool('gnosis.other')`.
Expected: `null` — never resolves to `gnosis`.
**Result:** PASS

### S5. ALL_TOOLS rows + register-gating (§5.2 A2, §5.8-9)
Concrete inputs: `ProvidentMcpServer.ALL_TOOLS` (static) + `registeredToolNames(gate, ALL_TOOLS)`.
Expected: `ALL_TOOLS` includes `'gnosis.query'`, `'gnosis.stream'`, `'gnosis.status'`;
`registeredToolNames(new SecurityGate(), ALL_TOOLS)` excludes all three (default-off);
`registeredToolNames(gnosisGate, ALL_TOOLS)` includes all three.
**Result:** PASS

---

## §5.3 / §5.8-1..6 the main-process handler (`handleGnosisTool`) + audit

### S6. `gnosis.query` happy — returns the proxy `EngineRagResult` + one audit entry (§5.1/§5.3/§5.8-1)
Concrete inputs: a real `createEngineRagStore` with a mock `fetch` serving a `Ready`
`/engine/status` + a `flat`-trace rag/query envelope; `handleGnosisTool(proxy, 'gnosis.query', {query:'the query', topK:10}, audit)`.
Expected: resolves to the proxy-specific `EngineRagResult` (`query`, `results[]`
with `documentId`/`nodeId`/`score`/`snippet`/`source:'local'`, `engine:'gnosis'`,
`citations[]`, `trace:{mode:'flat',…}`, NO `ranked`/`context`/`markdown`/`lineMap`/`k`);
the audit log gains exactly one entry with `requester:'mcp'`.
**Result:** PASS

### S7. `gnosis.query` passes the engine's FULL mode set through; vector/hybrid trace (§5.1/§5.8-2)
Concrete inputs: mock transport serving a `Vector`-trace rag/query envelope;
`handleGnosisTool(proxy,'gnosis.query',{query:'q', mode:'vector', topK:5}, audit)`.
Expected: the returned `EngineRagResult.trace` is `{mode:'vector', engine:'gnosis', topK:5, source:'local'}`;
the audit entry `mode === 'vector'` (the `QueryAuditEntry.mode` widening).
**Result:** PASS

### S8. `gnosis.stream` happy — collects the single-shot iterable into `{ chunks }` (§5.3/§5.8-3)
Concrete inputs: mock `fetch` (`Ready` gate) + mock `sse` emitting a `result` frame then `done`;
`handleGnosisTool(proxy,'gnosis.stream',{query:'q'}, audit)`.
Expected: `{ chunks: [{type:'result', result: <EngineRagResult>}, {type:'done'}] }` in order;
a single audit entry with `resultCount = result.results.length`.
**Result:** PASS

### S9. `gnosis.stream` error-then-done → `{ chunks }` with the error chunk + done; resultCount 0 (§5.8-4)
Concrete inputs: mock `sse` emitting an `error` frame (`code`/`message`) then `done`.
Expected: `{ chunks: [{type:'error', code, message}, {type:'done'}] }`; audit `resultCount === 0`.
**Result:** PASS

### S10. `gnosis.status` happy — returns the `HealthReport`; audit UNCHANGED (§5.1/§5.8-5)
Concrete inputs: mock transport serving a `Ready` `/engine/status`.
Expected: `handleGnosisTool(proxy,'gnosis.status',{}, audit)` resolves to a `HealthReport`
with `state:'Ready'`, all six subsystems `true`, `lastError:null`; the audit log does NOT gain an entry.
**Result:** PASS

### S11. `gnosis.status` Degraded — faithful projection, NOT an error (§5.8-6)
Concrete inputs: mock transport serving a `Degraded` report (`lastError` non-null, `embedding:false`).
Expected: resolves to a `HealthReport` with `state:'Degraded'` + non-null `lastError` (never a throw).
**Result:** PASS

---

## §5.9 fail-states (the validation/mapping surface)

### S12. `gnosis.query` null engine → `Error('gnosis.query: no engine rag store configured')` (§5.9-1)
**Result:** PASS

### S13. `gnosis.stream` null engine → `Error('gnosis.stream: no engine rag store configured')` (§5.9-2)
**Result:** PASS

### S14. `gnosis.status` null engine → `Error('gnosis.status: no engine rag store configured')` (§5.9-3)
**Result:** PASS

### S15. `gnosis.query` empty query (§5.9-4) / S16. bad `topK` (§5.9-5) / S17. bad `mode` (§5.9-6) / S18. bad `maxHops` (§5.9-7) / S19. bad `expand` (§5.9-8) / S20. bad `maxParentContext` (§5.9-9) / S21. malformed `filters` (§5.9-10)
Concrete inputs: a non-null engine (validation fires before the engine call) with the bad arg.
Expected exact messages:
- `'gnosis.query: query must be a non-empty string'`
- `'gnosis.query: topK must be an integer in [1, 50]'`
- `'gnosis.query: mode must be "flat", "graph", "vector", or "hybrid"'`
- `'gnosis.query: maxHops must be an integer in [1, 5]'`
- `'gnosis.query: expand must be "none" or "parent"'`
- `'gnosis.query: maxParentContext must be a positive integer'`
- `'gnosis.query: filters malformed'`
**Result:** PASS (all seven)

### S22. `gnosis.stream` validation mirrors `gnosis.query` with the `gnosis.stream:` prefix (§5.9-16..22)
Concrete inputs: empty query + bad mode (representative; the F4 note pins the same field checks).
Expected: `'gnosis.stream: query must be a non-empty string'` and
`'gnosis.stream: mode must be "flat", "graph", "vector", or "hybrid"'`.
**Result:** PASS

### S23. `gnosis.query` connection-refused → `EngineUnavailable` (503, `cause:'connection-refused'`) (§5.6/§5.9-11)
Concrete inputs: proxy with a mock `fetch` that throws `{code:'ECONNREFUSED'}`.
Expected: `handleGnosisTool(proxy,'gnosis.query',{query:'q'},audit)` rejects with the `EngineUnavailable`
subclass, `code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`.
**Result:** PASS

### S24. `gnosis.query` non-`Ready` observed state → `EngineUnavailable` (§5.6/§5.9-12)
Concrete inputs: mock transport serving `state:'Starting'` then `state:'Unavailable'`.
Expected: `Starting`/`Degraded` → `EngineUnavailable` (`cause:'not-ready'`); `Unavailable` →
`EngineUnavailable` (`cause:'unavailable-state'`). Both 503.
**Result:** PASS

### S25. `gnosis.query` malformed wire body → `TraceUnavailable`/`EngineError` (§5.9-13)
Concrete inputs: rag/query envelope whose payload is missing the `trace` key.
Expected: rejects with `TraceUnavailable` (`code:'trace_unavailable'`, 502) per the
trace-key-presence-first precedence.
**Result:** PASS

### S26. `gnosis.stream` non-`Ready` gate → `EngineUnavailable` (tool-level throw, NOT an error chunk) (§5.9-14)
Concrete inputs: mock transport serving a non-`Ready` `/engine/status` gate.
Expected: `handleGnosisTool(proxy,'gnosis.stream',{query:'q'},audit)` rejects with
`EngineUnavailable` (503) — the READY gate fires inside the call.
**Result:** PASS

### S27. `gnosis.stream` premature close before `done` → `EngineUnavailable` (503, `cause:'connection-refused'`); no partial result (§5.9-15)
Concrete inputs: `Ready` gate + mock `sse` that closes (`onClose`) before any `done`.
Expected: rejects with `EngineUnavailable` (`cause:'connection-refused'`), no partial `chunks` committed.
**Result:** PASS

### S28. `gnosis.status` connection-refused → `EngineUnavailable` (503, `cause:'connection-refused'`) (§5.9-24)
**Result:** PASS

### S29. `gnosis.status` malformed health report → `EngineError` (502) (§5.9-25)
Concrete inputs: `/engine/status` returning a report missing `version`/`subsystems`/`lastError`.
Expected: rejects with `EngineError` (502).
**Result:** PASS

### S30. unknown `gnosis.*` name → `Error('unknown gnosis tool: <name>')` (§5.9-26)
Concrete inputs: `handleGnosisTool(proxy,'gnosis.frobnicate',{},audit)`.
Expected: throws `Error('unknown gnosis tool: gnosis.frobnicate')`.
**Result:** PASS

---

## §5.6 / §5.5 D2 engine-absent + the GUI panes + the `EngineRagResult` render path

### S31. GUI status pane happy — renders the `HealthReport` (§5.8-10, §5.5)
Concrete inputs: `gnosisStatusContent(ctx, <Ready HealthReport>)` with a minimal `PaneContext`.
Expected: returns a `LegacyNodeData` subtree whose rendered values include `state:'Ready'`,
`version`, the six subsystem flags, `lastError`; never throws.
**Result:** PASS

### S32. GUI status pane engine-absent — null report → unavailable state, never a TypeError (§5.6, §5.8-28, §5.5)
Concrete inputs: `gnosisStatusContent(ctx, null)`.
Expected: no-throw; the rendered subtree does NOT show a `Ready` report (it is the unavailable state).
**Result:** PASS

### S33. `gnosisStatusPaneHandler` bridge-rejection → unavailable state, never throws (§5.6, HOST-MINOR-3)
Concrete inputs: `gnosisStatusPaneHandler(ctx, async () => { throw new EngineUnavailable('connection-refused','no engine') })`.
Expected: resolves (never throws) to the same unavailable-state content as `gnosisStatusContent(ctx, null)`.
**Result:** PASS

### S34. GUI query pane happy — renders the `EngineRagResult` via the NEW render path (distinct from local `RagResult`; P-TP-3, §5.8-11, §5.5)
Concrete inputs: `gnosisQueryContent(ctx, <EngineRagResult>)`.
Expected: the rendered subtree includes `query`, the result's `documentId`/`score`/`snippet`,
`engine:'gnosis'`, a `citations[]` `documentId`, and the `trace` `mode`; the walked key set does NOT
contain any of `ranked`/`context`/`markdown`/`lineMap`/`k` (the local `RagResult` fields).
**Result:** PASS

### S35. GUI query pane empty — null result → empty state, never a TypeError (§5.5)
Concrete inputs: `gnosisQueryContent(ctx, null)`.
Expected: no-throw (an empty state), distinct from the populated render.
**Result:** PASS

### S36. `EngineRagResult` render path distinct from `searchContent` (P-TP-3)
Concrete inputs: same ctx; `gnosisQueryContent(ctx, engineResult)` vs `searchContent(ctx, ragQueryResult)`
(where `ragQueryResult` carries the local `ranked`/`context`/`markdown`/`lineMap`/`k`).
Expected: `searchContent` renders the local fields; `gnosisQueryContent` does NOT reference them and DOES
render the proxy-specific fields (engine/trace/citations).
**Result:** PASS

---

## §5.2 / §5.7 A7 no-credential-arg invariant (P-IM-1, behavioral observable)

### S37. no `gnosis.*` tool accepts/honors a credential arg (§5.2 A7, P-IM-1)
Concrete inputs: `handleGnosisTool(proxy,'gnosis.query',{ query:'q', token:'SECRET', apiKey:'K', tls:{}, ca:'c', cert:'c', key:'k' }, audit)`
with a capturing mock transport.
Expected: the call SUCCEEDS (no credential is required/accepted as a gating arg) and the wire request
body sent to the proxy carries ONLY the documented fields (`query`/opts) — the `token`/`tls`/`apiKey`/
`ca`/`cert`/`key` args are NOT forwarded (never treated as credentials). (The tool inputSchemas are
pinned to the §5.1 field sets in the spec; this asserts the behavioral consequence observable at the
`handleGnosisTool` boundary.)
**Result:** PASS

---

## §5.4 engine lifecycle + baseUrl seam (runnable subset)

### S38. proxy construction does no network I/O; injectable into `handleGnosisTool` (§5.8-7, §5.4)
Concrete inputs: `createEngineRagStore({ baseUrl:'http://127.0.0.1:8080', fetch: <throws-if-called> })`.
Expected: constructs WITHOUT calling `fetch` (no I/O at construction); the store is immediately usable by
`handleGnosisTool`. The documented `baseUrl` default `http://127.0.0.1:8080` is loopback-accepted.
**Result:** PASS

### S39. the config-seam store (`engine-config.ts`) round-trips the operator `baseUrl` (HOST-MAJOR-1, §5.4)
Concrete inputs: `setEngineConfigBaseUrl('http://127.0.0.1:8081')` then `getEngineConfigBaseUrl()`.
Expected: the seam value round-trips (the 1st priority source exists and is set-able). The full
seam→env→default priority resolution lives in the `main.ts` boot (not unit-testable in the node test env);
it is documented in §5.4 and cross-checked against the loopback default here.
**Result:** PASS (seam observable)

---

## Summary

- All 39 scenarios (S1–S39) are covered by the run file — 31 vitest `it` blocks
  (several blocks combine related fail-state scenarios, e.g. S12–S14, S15–S21).
- **Total scenarios: 39 (S1–S39).**
- **Result: 39 / 39 PASS, 0 FAIL.**
- **FAIL scenarios:** **NONE.** No doc/spec drift and no un-hardened regression
  was observed on the live wiring surface.
- **Notes on test construction (spec-fidelity):**
  - The D2 engine-absent (`connection-refused`) and not-ready-gate paths were
    exercised **through the real `createEngineRagStore` proxy** with an injectable
    mock `fetch`/`sse` per §5.6/A6 (the happy path on a mock transport, the
    engine-absent path via a `{code:'ECONNREFUSED'}` transport). The wiring
    (`handleGnosisTool`) propagates the proxy's typed `EngineUnavailable`/
    `TraceUnavailable`/`EngineError` unchanged.
  - The three `gnosis.*` tool **inputSchemas** are module-private (built inside
    `registerTools`), so the A7 / P-IM-1 no-credential-arg invariant is asserted
    at the `handleGnosisTool` boundary: credential-named args (`token`/`tls`/
    `apiKey`/`ca`/`cert`/`key`) are neither required nor forwarded to the
    engine — the request body carries only the documented query/opts fields
    (§5.1 S37).
  - The full `resolveEngineBaseUrl` priority (config seam → env
    `PROVIDENT_ENGINE_BASE_URL` → default `http://127.0.0.1:8080`) and the boot
    call site live in `main.ts` (Electron boot), which is not importable in the
    node test env; the config-seam store (`setEngineConfigBaseUrl`/
    `getEngineConfigBaseUrl`) is verified to round-trip and the loopback default
    is construction-accepted (S38/S39). These boot-only details are noted as
    DOC-ONLY in the tally.
  - `TOOL_GROUPS`/`VALID_GROUPS` are module-private; their behavior is asserted
    through the exported `groupForTool` totality (S1, S4), `defaultSecurityConfig`
    (S2) and `SecurityGate`/`registeredToolNames` gating (S3, S5).
