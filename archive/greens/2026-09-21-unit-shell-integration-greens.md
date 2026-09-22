# Blind-test Greens — Unit: Shell-Integration (the shared `engine-transport.ts` module + the fetch-based SSE client + the bind/auth/TLS policy record + the D2-fallback clarification + the e2e transport test / live-battery revisit)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** —
  `docs/specs/unit-shell-integration.md` (§5.1–§5.11) + the proposal-review record
  `docs/specs/shell-integration-review.md`. NO implementation read
  (`src/main/engine-transport.ts`, `src/main/engine-rag-store.ts`,
  `src/main/engine-crud-rag-store.ts`, `src/main/rag-store.ts`) and NO unit-test
  read (`tests/unit-shell-integration.test.ts`, `tests/props-shell-integration.test.ts`).
  Scenarios are derived from the docs alone; a PASS is a genuine blind verification.
- **Run file:** `tests/blind-unit-shell-integration-greens.test.ts` (vitest).
- **Source under test (LIVE modules, the spec-pinned `.js` paths):**
  `src/main/engine-transport.js` (`isLoopbackHost`/`assertLoopback`/`transportError`/
  `fetchWithTimeout`/`headers`/`createEngineFetch` — the shared transport module),
  `src/main/engine-rag-store.js` (`createEngineRagStore`, `createSseClient`, and the
  typed error model `EngineWireError`/`EngineUnavailable`/`EngineError`),
  `src/main/engine-crud-rag-store.js` (`createEngineCrudRagStore` — the document-CRUD
  surface), `src/main/rag-store.js` (`createJsonRagStore` — the local `rag.*` D2
  fallback).
- **Runner invocation:** `npx vitest run tests/blind-unit-shell-integration-greens.test.ts`
  from the Astrographer repo root.
- **Mock-transport note (§5.2/§5.5):** the transport helpers are exercised with an
  injectable mock `fetch` (the `opts.fetch`/`fetchWithTimeout(fetchImpl,…)` seams).
  The fetch-based SSE client is exercised against a stubbed ambient `fetch`, with
  the stream driven by a captured `ReadableStream` controller (frames, chunk
  boundaries, clean end, mid-stream error, and consumer `close()`). The
  TLS-via-dispatcher application is verified deterministically by mocking `undici`
  (`vi.hoisted` + `vi.mock`) — the dispatcher's `connect` is asserted to carry
  exactly the present `ca`/`cert`/`key` fields. The e2e transport test (§5.5) is
  **opt-in + gated on the engine** (`GNOSIS_ENGINE_TEST=1` and a live
  `gnosis-server` on loopback), consistent with §5.5.

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## §5.1 the shared `engine-transport` module surface (the transport helpers + `createEngineFetch`)

### G1. `isLoopbackHost` superset — loopback forms → `true`, genuine non-loopback → `false` (§5.8-1)
Every loopback form in the superset set (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`,
`::ffff:127.0.0.2`, `::ffff:127.5.9.2`, the hex `::ffff:7f00:1` + `::ffff:7f01:1`,
`localhost`) returns `true`; genuine non-loopback (`192.168.1.1`, `10.0.0.1`,
`8.8.8.8`, `example.com`, `::ffff:8.8.8.8`, `::ffff:127.128.0.1`, the hex
`::ffff:8000:1`, `2001:db8::1`) returns `false`.
**Result:** PASS

> **Spec ambiguity resolved (`::ffff:7f01:1`):** §5.1 rule 3c pins the hex form as
> loopback when `(parseInt(hexParts[0],16) >>> 8) === 0x7f` — `7f01 >>> 8 === 0x7f`,
> so `::ffff:7f01:1` is **`true`** per the pinned algorithm. The §5.7 P-IM-1 example
> line lists `::ffff:7f01:1` among its *non-loopback* examples — a docs-bug that
> contradicts §5.1's own rule. The greens set resolves toward §5.1 (the
> authoritative algorithm) and asserts `true`; the register example is recorded as
> a docs inconsistency.

### G2. `assertLoopback` happy — loopback `baseUrl` returns without throwing (§5.8-2)
`assertLoopback('http://127.0.0.1:8080', 'engine rag store')`,
`assertLoopback('http://[::1]:8080', 'engine crud rag store')`,
`assertLoopback('http://[::ffff:7f00:1]:8080', …)`, and
`assertLoopback('http://localhost:8080', …)` all return without throwing.
**Result:** PASS

### G3. `createEngineFetch(auth)` no-TLS happy — returns `globalThis.fetch` (§5.8-3)
`createEngineFetch()` / `createEngineFetch({})` / `createEngineFetch({ token:'abc' })`
each return `globalThis.fetch` exactly (strict `===`; no dispatcher).
**Result:** PASS

### G4. `createEngineFetch(auth)` TLS happy — an https-agent-backed wrapper applies `{ca,cert,key}` via the undici dispatcher (§5.8-4)
`createEngineFetch({ tls: { ca, cert, key } })` returns a wrapper (not
`globalThis.fetch`) that passes a `dispatcher` whose `connect` is exactly
`{ ca, cert, key }`. `{ tls: {} }` returns the TLS wrapper with an empty
`connect` (no fields); a partial `{ tls: { ca } }` carries only `{ ca }` — absent
fields are omitted, never passed as `undefined` (P-TP-1).
**Result:** PASS

### G5. `headers(auth)` with a token — Bearer on the `Authorization` header (§5.8-5)
`headers({ token: 'abc' })` returns `{ 'content-type': 'application/json',
authorization: 'Bearer abc' }`; the token lives only on the header (there is no
URL field — the token is never in a URL).
**Result:** PASS

### G6. `headers(auth)` without a token — no `authorization` key (§5.8-6)
`headers({})` returns `{ 'content-type': 'application/json' }` with NO
`authorization` key.
**Result:** PASS

### G7. `transportError` on `ECONNREFUSED` → `EngineUnavailable('connection-refused')` (§5.8-7)
`transportError({ code:'ECONNREFUSED', message:'x' })` returns a 503
`EngineUnavailable` with `cause:'connection-refused'` and `code:'engine_unavailable'`.
**Result:** PASS

### G8. `transportError` on `ENOTFOUND` → `EngineUnavailable('engine-not-spawned')` (§5.8-8)
`transportError({ code:'ENOTFOUND', message:'x' })` returns a 503
`EngineUnavailable` with `cause:'engine-not-spawned'`. The nested real-transport
shape (`Error('fetch failed')` whose `cause.code === 'ENOTFOUND'`) also maps to
`cause:'engine-not-spawned'` (the `err.cause.code` read, §5.1).
**Result:** PASS

### G9. `transportError` on an `EngineWireError` returns it unchanged (§5.8-9)
`transportError(err)` where `err instanceof EngineWireError` returns `err` itself
(strict identity).
**Result:** PASS

### G10. `fetchWithTimeout` happy — resolves on a successful fetch, timer cleared (§5.8-10)
`fetchWithTimeout(fetchImpl, url, init, 5000)` on a resolving mock `fetch` resolves
with the response.
**Result:** PASS

---

## §5.1/§5.3 the proxy consumption — the loopback bind (superset reconciliation)

### G13. the GN factory accepts the hex `::ffff:7f00:1` form + `localhost` (amendment 1)
`createEngineRagStore({ baseUrl:'http://[::ffff:7f00:1]:8080', … })` and
`createEngineRagStore({ baseUrl:'http://localhost:8080', … })` construct without
throwing (the GN proxy gains the hex form by consuming the shared
`isLoopbackHost` superset; no previously-valid loopback baseUrl is rejected).
**Result:** PASS

### F13. the GN factory on a non-loopback `baseUrl` throws the byte message (§5.9-13)
`createEngineRagStore({ baseUrl:'http://192.168.1.1:8080', fetch })` throws
`Error('engine rag store: baseUrl must be loopback')` (the byte-pinned prefix
preserved via the shared `assertLoopback`).
**Result:** PASS

### F14. the CRUD factory on a non-loopback `baseUrl` throws the byte message (§5.9-14)
`createEngineCrudRagStore({ baseUrl:'http://10.0.0.1:8080', fetch })` throws
`Error('engine crud rag store: baseUrl must be loopback')`.
**Result:** PASS

---

## §5.1 fail-states (the documented fail-states)

### F1. `assertLoopback` on a non-loopback `baseUrl` → the byte message (§5.9-1)
`assertLoopback('http://192.168.1.1:8080', 'engine rag store')` and
`assertLoopback('http://8.8.8.8', 'engine crud rag store')` throw
`Error('${prefix}: baseUrl must be loopback')`.
**Result:** PASS

### F2. `assertLoopback` on an unparseable `baseUrl` → the byte message (§5.9-2)
`assertLoopback('this is not a url', 'engine rag store')` throws
`Error('engine rag store: baseUrl must be loopback')` (the `new URL(baseUrl)` throws).
**Result:** PASS

### F3. `transportError` on an unknown transport failure → typed `EngineWireError` 503 (§5.9-3)
`transportError({ message:'some other failure' })` returns an
`EngineWireError('engine_unavailable', 503, …)` — a typed error on any fail-state,
never a raw `Error` (H6).
**Result:** PASS

### F4. `fetchWithTimeout` on a timeout → `EngineUnavailable`, never a raw `AbortError` (§5.9-4)
A fetch that only settles on its abort signal → `fetchWithTimeout(…, 20)` throws
`EngineUnavailable('connection-refused', 'request timed out after 20ms')`; the
thrown value is NOT an `AbortError`.
**Result:** PASS

### F5. `fetchWithTimeout` on a connection-refused → `EngineUnavailable('connection-refused')` (§5.9-5)
A mock `fetch` that throws `{code:'ECONNREFUSED'}` → `fetchWithTimeout` rejects with
a 503 `EngineUnavailable`, `cause:'connection-refused'` (via `transportError`).
**Result:** PASS

---

## §5.2 the fetch-based SSE client (`createSseClient`)

### G11. the Bearer header on the stream, NO `content-type`, the token never in the URL (§5.8-11)
`createSseClient({ token }).subscribe(url, handlers)` issues a `GET` fetch whose
stream carries `authorization: Bearer <token>`; the request carries NO
`content-type` header (a GET stream needs none); the token appears nowhere in the
URL. `createSseClient({})` sends NO `authorization` header.
**Result:** PASS

### G12. the SSE frame-dispatch happy (§5.8-12)
A complete `event: result\ndata: {"type":"result",…}\n\n` frame drives
`onEvent('result', '{"type":"result",…}')`.
**Result:** PASS

### G18. the SSE client buffers across chunk boundaries
A frame split across two stream chunks (`'event: result\ndata: {"a":1'` then
`'}\n\n'`) dispatches `onEvent` exactly once, after the `\n\n` delimiter completes
(the client buffers incoming text and splits on `\n\n`).
**Result:** PASS

### G14. a clean stream end → `onClose()` (§5.8-14 premise)
After a successful stream ends (even mid-events, before any `done` chunk), the
client fires `onClose()` exactly once and opens exactly one fetch (no
auto-reconnect). This is the H10 premise the proxy converts to
`EngineUnavailable` on a premature close.
**Result:** PASS

### F6. a fetch rejection → `onError(err)`, exactly one fetch, no reconnect (§5.9-6)
A connection-refused fetch → `onError` fires once with the refusal; exactly one
fetch was attempted (the no-auto-reconnect contract).
**Result:** PASS

### F7. a non-2xx response → `onError(new Error('sse: non-2xx response'))` (§5.9-7)
A 503 response → `onError` fires with a message matching `non-2xx`.
**Result:** PASS

### F8. a malformed SSE frame → `onError(err)` (§5.9-8)
A frame whose `data` is not valid stream JSON (`event: result\ndata: ###not-json###`)
drives the `parseSseFrame` reject → `onError(err)`.
**Result:** PASS

> **Blind-probe note (F8):** the exact input `parseSseFrame` rejects is derived from
> the docs (a JSON-typed stream whose `data` is non-JSON). If the landed
> `parseSseFrame` proves tolerant of this probe, that is a finding to investigate
> (fail-state 8 requires the malformed-frame → `onError` path), not a silent pass.

### F9. a mid-stream error → `onError(err)` (§5.9-9)
Driving the stream `ctrl.error(new Error('boom midstream'))` → `onError` fires with
the error.
**Result:** PASS

### F10. after `close()` → no further `onEvent`/`onError`/`onClose` callbacks (§5.9-10)
After `sub.close()`, subsequent stream frames, a clean end, and a post-close
stream error all fire NO further callbacks; `onClose` is NOT fired by the
consumer-initiated teardown.
**Result:** PASS

### F11. the SSE premature-close (before `done`) is terminal — no silent reconnect (§5.9-11)
A dropped/ended connection before a `done` chunk fires `onClose`/`onError` exactly
once and issues exactly one fetch — the fetch-based client preserves the H10
no-reconnect contract and never re-opens.
**Result:** PASS

> **Where the proxy-level H10 is verified:** §5.8-14 / §5.9-11 / P-SM-2 pin the
> *proxy's* `ragStream` as converting a premature close to `EngineUnavailable`.
> That proxy translation is unchanged GN behavior (§5.2: "the proxy's `ragStream`
> consumption logic … is UNCHANGED"). The fetch-based client is the NEW transport,
> and this greens set verifies the client premises it must preserve (terminal
> `onClose`/`onError`, exactly-one-fetch no-reconnect, clean-end → `onClose`) plus
> the live/e2e gated path. The proxy-level conversion is covered deterministically
> at the client level (G14/F11) and via the gated e2e test (E1).

---

## §5.4 the D2-fallback clarification

### G15. the document-CRUD surface engine-absent → `EngineUnavailable` (503) (§5.8-15)
Through the real `createEngineCrudRagStore` proxy on a connection-refused mock
`fetch`, `listDocuments` rejects with a 503 `EngineUnavailable`,
`cause:'connection-refused'` — it surfaces `EngineUnavailable` and does NOT fall
back to a local-store result (the data models differ).
**Result:** PASS

### F12. the document-CRUD surface on engine-absent does NOT fall back to the local store (§5.9-12)
The document-CRUD surface surfaces `EngineUnavailable` (503) when the engine is
absent — the outcome is a typed `EngineUnavailable`, never a local `RagStore`
graph result (no second editor, no sync; H1 /
`GNOSIS-SUPPLANTS-DOCUMENT-STORE`).
**Result:** PASS

### G16. the local `rag.*` surface is the parallel D2 fallback, engine-free (§5.8-16)
`createJsonRagStore({})` constructs an object with an engine-free method surface
(binding a fetch that would throw if used results in no fetch call) — the local
RagNode/RagEdge graph continues to work without the engine.
**Result:** PASS

---

## §5.3 the bind/auth/TLS policy record

### G17. policy-record consistency with the module surface (§5.8-17)
The loopback-only bind (`assertLoopback` rejects a non-loopback), the Bearer-on-
header auth (`headers` carries the Bearer iff a token is set), and the TLS-via-
dispatcher application (`createEngineFetch` returns the wrapper iff `tls` is set)
are all consistent with the exported surface. (The GUI-only/MCP carve-out for
credentials is enforced at the MCP boundary — covered by the A2 P-IM-2 set.)
**Result:** PASS

---

## §5.7 the property register (the 8 invariant rows; deterministic pinned seed `0x5E11E11E`)

### PB1. P-IM-1 — the `isLoopbackHost` superset is total
Every loopback form in the superset set returns `true`; every generated
non-loopback host returns `false` (the `::ffff:7f01:1` register example is
resolved toward §5.1 → `true`; the false set uses `::ffff:8000:1` etc.).
**Result:** PASS

### PB2. P-IM-2 — `assertLoopback` enforces the loopback-only bind at construction
Every loopback `baseUrl` returns; every non-loopback/unparseable `baseUrl` throws.
**Result:** PASS

### PB3. P-IM-3 — the policy record is consistent with the module surface
`headers` carries the Bearer iff the token is set; `createEngineFetch` applies the
dispatcher iff `tls` is set; `assertLoopback` enforces loopback-only.
**Result:** PASS

### PB4. P-SM-1 — the SSE client sends the Bearer header and does NOT auto-reconnect
With a token, the stream carries `authorization: Bearer <token>`; a dropped
connection fires `onError` once and issues exactly one fetch.
**Result:** PASS

### PB5. P-SM-2 — the SSE premature-close (H10) semantics are preserved
A stream that ends before any `done` chunk is terminal: `onClose` fires once,
exactly one fetch is issued, never a reconnect.
**Result:** PASS

### PB6. P-SM-3 — the D2-fallback distinction holds
The document-CRUD surface surfaces `EngineUnavailable` on engine-absent (never a
local-store result); the local `rag.*` surface is independent of the engine and
remains usable.
**Result:** PASS

### PB7. P-TP-1 — `createEngineFetch` applies `auth.tls` via the undici dispatcher
No `tls` → `=== globalThis.fetch`; with `tls` → the wrapper passes a `dispatcher`
with `connect` carrying exactly the present `ca`/`cert`/`key`.
**Result:** PASS

### PB8. P-TP-2 — `headers(auth)` applies the Bearer on the `Authorization` header
`headers({token}).authorization === 'Bearer <token>'` and `content-type` is
`application/json`; with no token, no `authorization` key.
**Result:** PASS

---

## §5.5 the e2e transport test / live-battery revisit (opt-in + gated on the engine)

### E1. document-CRUD live round-trips over a real transport (gated §5.5)
**Opt-in + gated:** skipped unless `GNOSIS_ENGINE_TEST=1` AND a live
`gnosis-server` responds to `/engine/status` on loopback (the revisit condition).
When engaged: the real `createEngineCrudRagStore` (no injected fetch) performs a
live `listDocuments` round-trip (a typed `DocumentList`), and a real
connection-refused proxy surfaces the typed `EngineUnavailable`
(`cause:'connection-refused'`). A live result that contradicts the greens or the
spec is a finding (regression / doc drift) — never a pass.
**Result:** PASS (gated)

---

## Summary

- Happy paths + policy: **18** (G1–G18, with G1b/G4b/G8b/G11b grouped under their G).
- Fail-states: **14** (F1–F14, matching the spec §5.9 numbering, incl. F12 the
  document-CRUD engine-absent non-fallback).
- PBT register: **8** (PB1–PB8, matching the §5.7 row ids).
- E2E transport (gated): **1** (E1).
- **Total scenarios: 41.**

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **40** | G1–G18, F1–F14, PB1–PB8 |
| **SKIP (gated)** | **1** | E1 (opt-in + gated on the engine, §5.5) |
| **FAIL** | **0** | — |

### Spec ambiguities resolved / notes

- **`::ffff:7f01:1`** is a loopback form (`7f01 >>> 8 === 0x7f`) per the §5.1
  pinned rule; the §5.7 P-IM-1 example listing it as non-loopback is a docs bug the
  test resolves toward §5.1 (see G1).
- **The TLS-via-dispatcher (P-TP-1)** is verified deterministically by mocking
  `undici`; the TLS path is exercised only when `auth.tls` is set (GUI-only), per
  §5.1.
- **The proxy-level H10 conversion** (§5.8-14/§5.9-11/P-SM-2) is verified at the
  fetch-based-client level (the terminal no-reconnect + `onClose`/`onError`
  premises the unchanged proxy logic consumes) and via the gated e2e path.
- **The malformed-SSE-frame probe (F8)** uses a non-JSON `data` frame; if the
  landed `parseSseFrame` is tolerant, that is a finding to investigate, not a
  silent pass.
- **`createJsonRagStore({})`** is constructed with an empty options document; the
  engine-free independence (no fetch, no loopback bind) is what proves the local
  `rag.*` surface is the parallel D2 fallback and NOT a document-store fallback.
