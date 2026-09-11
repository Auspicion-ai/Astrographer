# Blind-test Greens — Unit GN: Gnosis Engine Integration (`createEngineRagStore` proxy)

- **Blind-test writer run:** 2026-09-10 (fresh agent, DOCUMENTATION ONLY —
  `docs/specs/unit-gn-engine-integration.md` + `../Gnosis/docs/specs/engine-wire-contract.md`
  + `../Gnosis/docs/integrations/astrographer-interface-implementation.md`; NO
  implementation read).
- **Re-run (this record):** after the Implementer fixed the transport-path
  `cause` regression — full suite re-run, **63 / 63 PASS, 0 FAIL** (F19, F20,
  F33, F36 now PASS).
- **Run file:** `tests/blind-unit-gn-engine-integration-greens.test.ts` (vitest).
- **Source under test (LIVE module):** `src/main/engine-rag-store.js` (the
  `createEngineRagStore` proxy + the decode/SSE/status helpers).
- **Runner invocation:** `npx vitest run tests/blind-unit-gn-engine-integration-greens.test.ts`
  from the Astrographer repo root.

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## Factory + proxy surface (§5.1, §5.8-1/14, §5.9-1/2/3)

### G1. Factory happy — 5-method proxy surface; no network I/O at construction
`createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: <throws-if-called> })`
→ returns a proxy exposing `ragQuery`/`ragStream`/`getEngineStatus`/`health`/
`waitForReady`; the injected fetch is NOT called at construction.
**Result: PASS**

### G2. Loopback enforcement — 127.0.0.1 and localhost accepted
`http://127.0.0.1:8080` and `http://localhost:8080` both construct without
throwing (LOOPBACK-AUTH-TLS; `localhost` accepted per §5.8-14 / H11).
**Result: PASS**

### G2b. `ENGINE_ENDPOINTS` pins the three paths
`{ ragQuery: '/rag/query', ragStream: '/rag/stream', engineStatus: '/engine/status' }`.
**Result: PASS**

### F1. null/undefined opts
`createEngineRagStore(null)` / `(undefined)` → throws
`Error('engine rag store: opts required')`.
**Result: PASS**

### F2. missing/empty baseUrl
`createEngineRagStore({})` / `({ baseUrl: '' })` → throws
`Error('engine rag store: baseUrl required')`.
**Result: PASS**

### F3. non-loopback baseUrl
`createEngineRagStore({ baseUrl: 'http://192.168.1.1:8080' })` → throws
`Error('engine rag store: baseUrl must be loopback')`.
**Result: PASS**

---

## Golden-vector decode conformance (§5.2, wire contract §12)

### G3. V-1 (done chunk)
`decodeEnvelope(V-1)` → `{schemaVersion:1, idFormat:'opaque-string-v1',
payload:{type:'done'}}`; `decodeChunk(payload)` → `{type:'done'}`.
**Result: PASS**

### G4. V-2 (conflict error chunk)
`decodeChunk(V-2 payload)` → `{type:'error', code:'conflict',
message:'optimistic-concurrency conflict: stale base revision'}`.
**Result: PASS**

### G5. V-3 (validation_error chunk)
`decodeChunk(V-3 payload)` → `{type:'error', code:'validation_error',
message:'empty query'}`.
**Result: PASS**

### G6. V-4 (standalone wiki_not_found error)
`decodeError(V-4 payload)` → `EngineWireError` with `code:'wiki_not_found'`,
`httpStatus:404`.
**Result: PASS**

### G7. V-5 (flat result → EngineRagResult)
`decodeRagResult(V-5 payload)` → the pinned mapped value: camelCase keys,
lowercase enums, `mode:'flat'` trace, `engine:'gnosis'`, `blockedBy` absent
(`blocked_by:null`).
**Result: PASS**

### G8. V-6 (three SSE frames)
`parseSseFrame`/`decodeSseChunk` on the `done`/`error`/`result` frames → the
pinned `RagChunk` values (incl. the `result` frame decoding to the V-5 mapped
`EngineRagResult`).
**Result: PASS**

### G9. V-8 (Ready + Degraded health reports)
`decodeHealthReport` on both V-8 reports → the pinned `HealthReport` values
(Ready: all subsystems true, `lastError:null`; Degraded: `embedding:false`,
non-null `lastError`).
**Result: PASS**

---

## decode-then-validate precedence (§5.3, §5.8-8/9, §5.9-5/6/7/8)

### G10. Happy decode-then-validate
A well-formed body with `trace` present + `engine:'gnosis'` → `decodeRagResult`
returns the mapped `EngineRagResult`.
**Result: PASS**

### G11. Vector/hybrid/graph trace decode
`{"Vector":{…}}` → `{mode:'vector',…}`; `{"Hybrid":{…}}` →
`{mode:'hybrid', legs:['graph','vector','lexical'],…}`; `{"Graph":[…]}` →
`{mode:'graph', entries:[…]}` (the proxy preserves the full wire trace).
**Result: PASS**

### G12. blocked_by with a Graph trace
`blocked_by:[{document_id,node_id,state:'BROKEN'}]` + `{"Graph":[]}` →
`blockedBy:[{documentId,nodeId,state:'BROKEN'}]` (uppercase state passed through).
**Result: PASS**

### F4. Body missing trace → TraceUnavailable (502)
`decodeRagResult({query,results,engine,citations})` (no `trace` key) → throws
`TraceUnavailable` (`code:'trace_unavailable'`, `httpStatus:502`).
**Result: PASS**

### F5. Structurally malformed body WITH a trace key → EngineError (502)
`decodeRagResult({query:123, trace:{Flat:…}})` → throws `EngineError` (502).
**Result: PASS**

### F6. Precedence — body BOTH missing trace AND malformed → TraceUnavailable
`decodeRagResult({query:123})` (no `trace` key, malformed) → throws
`TraceUnavailable` (trace-key-presence checked FIRST, §12 V-9).
**Result: PASS**

### F7. Non-"gnosis" engine → EngineError (502)
`decodeRagResult({…, engine:'other', …})` → throws `EngineError` (502).
**Result: PASS**

### F8. blocked_by present but a non-Graph trace → EngineError (502)
`decodeRagResult({…, trace:{Flat:…}, blocked_by:[…]})` → throws `EngineError` (502).
**Result: PASS**

---

## HTTP-status map (§5.4, §5.8-10, §5.9-11/12)

### G13. All 21 codes map to their §11 status; conflict = 409 (mandated)
`ENGINE_HTTP_STATUS` has exactly 21 entries; every code maps to its §11 status;
`ENGINE_HTTP_STATUS.conflict === 409`.
**Result: PASS**

### G14. wireCodeToError maps known codes to the typed error with the §11 status
`conflict` → `ConflictError` (409); `not_found` → 404; `engine_error` →
`EngineError` (502); `trace_unavailable` → `TraceUnavailable` (502).
**Result: PASS**

### G15. engine_unavailable wire code → EngineUnavailable with cause "unavailable-state"
`wireCodeToError('engine_unavailable', msg)` → `EngineUnavailable` subclass,
`code:'engine_unavailable'`, `httpStatus:503`, `cause:'unavailable-state'`.
**Result: PASS**

### F9. Unknown/foreign code → EngineError (502)
`wireCodeToError('bogus_code', msg)` → `EngineError` (`code:'engine_error'`,
`httpStatus:502`).
**Result: PASS**

---

## ragQuery proxy behavior (§5.8-2/3, §5.9-4..15)

### G16. ragQuery happy
A `POST /rag/query` returning a V-5 envelope (after a Ready gate) → resolves to
the mapped `EngineRagResult`.
**Result: PASS**

### G17. ragQuery with a wire error chunk (conflict)
A `POST /rag/query` returning `{"type":"error","code":"conflict",…}` → rejects
with `ConflictError` (409).
**Result: PASS**

### F10. Malformed envelope → EngineError (502)
A `POST /rag/query` returning `{schemaVersion:1}` (missing `idFormat`/`payload`)
→ rejects with `EngineError` (502).
**Result: PASS**

### F11. Result body missing trace → TraceUnavailable (502)
A `POST /rag/query` returning a body with no `trace` → rejects with
`TraceUnavailable` (502).
**Result: PASS**

### F12. Structurally malformed body (with a trace key) → EngineError (502)
A `POST /rag/query` returning `{query:123, trace:{Flat:…}}` → rejects with
`EngineError` (502).
**Result: PASS**

### F13. Non-"gnosis" engine → EngineError (502)
A `POST /rag/query` returning `engine:'other'` → rejects with `EngineError` (502).
**Result: PASS**

### F14. blocked_by present but a non-Graph trace → EngineError (502)
A `POST /rag/query` returning `blocked_by` with a `Flat` trace → rejects with
`EngineError` (502).
**Result: PASS**

### F15. Unknown schemaVersion (99) → EngineError (502)
A `POST /rag/query` returning `schemaVersion:99` → rejects with `EngineError`
(502) (`UnsupportedSchemaVersion`).
**Result: PASS**

### F16. Unknown idFormat ("uuid-v4") → EngineError (502)
A `POST /rag/query` returning `idFormat:'uuid-v4'` → rejects with `EngineError`
(502) (`UnknownIdFormat`).
**Result: PASS**

### F17. Wire error chunk for engine_unavailable → EngineUnavailable (503, cause unavailable-state)
A `POST /rag/query` returning `{"type":"error","code":"engine_unavailable",…}` →
rejects with `EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'unavailable-state'`).
**Result: PASS**

### F18. Wire error chunk for an UNKNOWN code → EngineError (502)
A `POST /rag/query` returning `{"type":"error","code":"bogus_code",…}` → rejects
with `EngineError` (502).
**Result: PASS**

### F19. ragQuery connection-refused → EngineUnavailable (503, cause connection-refused)
A fetch that throws `ECONNREFUSED` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`).
**Result: PASS** — the transport-path `cause` regression (previously FAIL) was
fixed by the Implementer: the proxy now rejects with the `EngineUnavailable`
subclass and `cause:'connection-refused'` per §5.6/§5.9-13.

### F20. ragQuery engine-not-spawned → EngineUnavailable (503, cause engine-not-spawned)
A fetch that throws `ENOTFOUND` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'engine-not-spawned'`).
**Result: PASS** — the transport-path `cause` regression (previously FAIL) was
fixed by the Implementer: the proxy now rejects with the `EngineUnavailable`
subclass and `cause:'engine-not-spawned'` per §5.6/§5.9-14.

### F21. ragQuery when the observed state is Starting → EngineUnavailable (503, cause not-ready)
A gate returning `state:'Starting'` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'not-ready'`).
**Result: PASS**

### F22. ragQuery when the observed state is Degraded → EngineUnavailable (503, cause not-ready)
A gate returning a Degraded report → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'not-ready'`). There is
NO non-throw path for a RAG call in a non-`Ready` state.
**Result: PASS**

### F23. ragQuery when the observed state is Unavailable → EngineUnavailable (503, cause unavailable-state)
A gate returning `state:'Unavailable'` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'unavailable-state'`).
**Result: PASS**

---

## ragStream proxy behavior (§5.5, §5.8-4/5/11/12, §5.9-16..20)

### G18. ragStream happy — result-then-done
The SSE stream emits `event: result` + `data: {"type":"result",…}` then
`event: done` + `data: {"type":"done"}` → the iterable yields
`[{type:'result',result}, {type:'done'}]` in order.
**Result: PASS**

### G19. ragStream error-then-done
The SSE stream emits `event: error` + `data: {"type":"error","code":
"validation_error","message":"empty query"}` then `event: done` → the iterable
yields `[{type:'error',code:'validation_error',message:'empty query'},
{type:'done'}]`.
**Result: PASS**

### G20. Single-shot honesty
A stream with exactly one `result` then `done` → the iterable yields exactly
those two chunks and closes.
**Result: PASS**

### G21. Mid-stream cancel
The consumer cancels the iterable (`it.return()`) → the SSE connection closes
cleanly; no error is thrown.
**Result: PASS**

### F24. ragStream when the observed state is not Ready → EngineUnavailable (not-ready)
A gate returning `state:'Starting'` → the iterable throws `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'not-ready'`).
**Result: PASS**

### F25. ragStream with a dropped connection before done → EngineUnavailable (503, cause connection-refused)
The SSE connection closes (`onClose`) before any `done` event → the iterable
throws `EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'connection-refused'`); no partial result is committed.
**Result: PASS**

---

## SSE frame parsing (pure functions — §5.5, §5.9-17/18/20)

### F26. Malformed frame (no event:/data: lines) → EngineError
`parseSseFrame('garbage\n\n')` → throws `EngineError` (502).
**Result: PASS**

### F27. Incomplete-but-open frame (event: line with NO data: line) → EngineError
`parseSseFrame('event: result\n')` → throws `EngineError` (502) (the connection
is healthy; the frame is structurally invalid — §5.5 boundary note).
**Result: PASS**

### F28. Frame with a data: line but no event: line → EngineError
`parseSseFrame('data: {"type":"done"}\n\n')` → throws `EngineError` (502).
**Result: PASS**

### F29. Trailing non-blank content → EngineError
`parseSseFrame('event: done\ndata: {"type":"done"}\n\nextra')` → throws
`EngineError` (502).
**Result: PASS**

### F30. Event/data type mismatch → EngineError
`decodeSseChunk('event: result\ndata: {"type":"done"}\n\n')` → throws
`EngineError` (502).
**Result: PASS**

### F31. Unparseable data: line → EngineError
`decodeSseChunk('event: done\ndata: not-json\n\n')` → throws `EngineError` (502).
**Result: PASS**

---

## getEngineStatus / health (§5.8-6, §5.9-21/22)

### G22. getEngineStatus/health happy
A `GET /engine/status` returning the Ready report → both `getEngineStatus()` and
`health()` resolve to the SAME `HealthReport` with `state:'Ready'`, all
subsystems true, `lastError:null`.
**Result: PASS**

### G23. Degraded is observed faithfully (not an error)
A `GET /engine/status` returning a Degraded report → `getEngineStatus()` resolves
to a `HealthReport` with `state:'Degraded'` and the non-null `lastError` (a
faithful projection, never invented).
**Result: PASS**

### F32. Malformed health report → EngineError (502)
A `GET /engine/status` returning `{schemaVersion:1, idFormat:'opaque-string-v1',
state:'Ready'}` (missing `version`/`subsystems`/`lastError`) → rejects with
`EngineError` (502).
**Result: PASS**

### F33. getEngineStatus connection-refused → EngineUnavailable (503, cause connection-refused)
A fetch that throws `ECONNREFUSED` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`).
**Result: PASS** — the transport-path `cause` regression (previously FAIL) was
fixed by the Implementer: the proxy now rejects with the `EngineUnavailable`
subclass and `cause:'connection-refused'` per §5.9-22.

---

## waitForReady (§5.8-7, §5.9-23/24/25)

### G24. waitForReady happy — Starting then Ready
`getEngineStatus` returns `Starting` then `Ready` → `waitForReady` polls and
resolves to the `Ready` report.
**Result: PASS**

### G25. waitForReady keeps polling through Starting AND Degraded
`getEngineStatus` returns `Starting`, then `Degraded`, then `Ready` →
`waitForReady` keeps polling through both non-terminal states and resolves to
the `Ready` report.
**Result: PASS**

### F34. waitForReady when the state stays non-Ready past maxAttempts → EngineUnavailable (503, cause not-ready)
`getEngineStatus` always returns `Starting`; `maxAttempts:3` → rejects with
`EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'not-ready'`).
**Result: PASS**

### F35. waitForReady when the state becomes Unavailable → EngineUnavailable (503, cause unavailable-state)
`getEngineStatus` returns `Unavailable` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'unavailable-state'`).
**Result: PASS**

### F36. waitForReady connection-refused during polling → EngineUnavailable immediately (503, cause connection-refused); no retry
A fetch that throws `ECONNREFUSED` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`);
the fetch is called exactly ONCE (no retry).
**Result: PASS** — the transport-path `cause` regression (previously FAIL) was
fixed by the Implementer: the proxy now rejects with the `EngineUnavailable`
subclass and `cause:'connection-refused'` per §5.9-25, and the no-retry
behavior (fetch called exactly once) remains correct.

---

## Request timeout (§3a H4)

### F37. A request that never resolves times out → EngineUnavailable (503)
A fetch that never resolves but rejects on the `AbortSignal` (the proxy's
`fetchWithTimeout` aborts after `requestTimeoutMs:5`) → `getEngineStatus()`
rejects with `EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`).
**Result: PASS**

---

## Summary

- Happy paths: **26 / 26 PASS** (G1–G25, incl. G2b).
- Fail-states: **37 / 37 PASS** (F1–F37).
- **Total: 63 / 63 PASS, 0 FAIL.**

### Previously-failing scenarios — now PASS (transport-path `cause` regression fixed)

The 4 scenarios that failed on the prior run (F19, F20, F33, F36) all PASS on
this re-run. The single root cause — the transport path (connection-refused /
engine-not-spawned) throwing a plain `EngineWireError` with NO `cause` field
instead of the `EngineUnavailable` subclass with the pinned `cause` — was fixed
by the Implementer. The `code`/`httpStatus` were already correct; the missing
`cause` is now set per §5.6 and §5.9 fail-states 13/14/22/25.

| Scenario | Doc source | Result |
| --- | --- | --- |
| F19. ragQuery connection-refused | §5.6, §5.9-13 | **PASS** — `EngineUnavailable` with `cause:'connection-refused'` |
| F20. ragQuery engine-not-spawned | §5.6, §5.9-14 | **PASS** — `EngineUnavailable` with `cause:'engine-not-spawned'` |
| F33. getEngineStatus connection-refused | §5.9-22 | **PASS** — `EngineUnavailable` with `cause:'connection-refused'` |
| F36. waitForReady connection-refused | §5.9-25 | **PASS** — `EngineUnavailable` with `cause:'connection-refused'`; no-retry correct |

The gate path (not-ready / unavailable-state) already set the cause correctly
(F21/F22/F23/F34/F35 pass) and continues to do so. The full suite is now green.
