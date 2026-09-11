# Unit GN — Gnosis Engine Integration (`createEngineRagStore` proxy): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-10.**
- **Source contract:** `docs/specs/unit-gn-engine-integration.md` — §5.1 (the
  factory + the 5-method proxy surface + the pinned `ENGINE_ENDPOINTS`), §5.2
  (the wire shapes + the golden-vector decode conformance), §5.3
  (decode-then-validate precedence), §5.4 (the §11 HTTP-status map + the
  wire-code → typed-error translation), §5.5 (the SSE client / `ragStream`),
  §5.6 (READY observation + D2 engine-absent behavior), §5.8 (15 happy states),
  §5.9 (25 fail-states), §5.10 (the census), §5.11 (cross-references). The
  wire shapes + golden vectors are pinned in
  `../Gnosis/docs/specs/engine-wire-contract.md` §4–§12 (V-1..V-9).
- **Greens battery (blind-test, already run against the LIVE MODULE):**
  `docs/specs/unit-gn-engine-integration-greens.md` — **63 / 63 PASS, 0 FAIL**
  (the recorded run: `tests/blind-unit-gn-engine-integration-greens.test.ts`,
  vitest, exit 0; source under test `src/main/engine-rag-store.js`).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-ms2-store-wiring-live-pending-battery.md` (the
  same surface-absence park shape). This battery is the handoff for a LATER
  iteration of the live-scenario runner, to be executed once the
  **`gnosis-server` binary crate + a live Gnosis engine** are available.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-10 ~06:45 UTC)

The `createEngineRagStore` proxy is a **CLIENT** — it needs a live Gnosis
engine + HTTP server to exercise the retrieval trio (`ragQuery`/`ragStream`/
`getEngineStatus` + `health`/`waitForReady`) end-to-end over a real transport.
The proposal gate (Architecture A1) **deferred the server-host binary crate**,
so there is no live engine endpoint to connect to. The park is a
**surface-absence park**, verified live:

### 1.1 No `gnosis-server` binary crate exists (the decisive probe)

`../Gnosis/Cargo.toml` declares exactly **two** `[[bin]]` targets — `gnosis`
(`src/main.rs`) and `gnosis-eval` (`src/bin/gnosis_eval.rs`). There is **no
`gnosis-server` bin**. `src/main.rs` is a **scaffold**: it prints
`Gnosis engine starting — the headless graph/vector engine of the Auspicion
Suite.` and returns `Ok(())`. It does **NOT** bind a socket, does **NOT**
listen, and does **NOT** serve `/rag/query`, `/rag/stream`, or
`/engine/status`. The wire contract itself confirms the deferral
(`../Gnosis/docs/specs/engine-wire-contract.md` §11): *"F2 ships **no** HTTP
code and **no** status rendering."* The server host is a separate, later unit.

### 1.2 No running engine process and no live engine endpoint

- `ps aux | grep -i gnosis` → **no gnosis process**.
- `ss -ltnp` / `netstat -ltnp` → **no listener** on the engine's loopback bind
  (no `127.0.0.1:PORT` serving the F2 wire surface).

### 1.3 The proxy is NOT wired into the running app, and no MCP/UI tool drives it

- `src/main/engine-rag-store.ts` EXISTS (the client module, 37865 bytes,
  2026-09-10 01:44) and exports `createEngineRagStore` + `ENGINE_ENDPOINTS`
  (`ragQuery: '/rag/query'`, `ragStream: '/rag/stream'`,
  `engineStatus: '/engine/status'`).
- `createEngineRagStore` is **NOT imported** by `src/main/main.ts` or
  `src/main/mcp-server.ts` — the proxy is not wired into the app.
- **No MCP/UI tool** exposes `ragQuery`/`ragStream`/`getEngineStatus`/`health`/
  `waitForReady` (the only `ragQuery` hits in `mcp-server.ts` are comments
  referencing the LOCAL `ragQuery` module, not the engine proxy). There is no
  live MCP/UI surface to drive the retrieval trio.

**Conclusion:** the live surface required to exercise the retrieval trio +
health wire client end-to-end (a running Gnosis engine + an HTTP server
serving the F2 wire contract) is **not available**. Per the live-runner
contract these scenarios are **parked** (not failures) and recorded here. The
greens themselves are already **63/63 against the live module** — the park is
a transport-surface absence, not a module regression.

---

## 2. The live surfaces that WILL exercise the GN behavior (after the server-host binary + a live engine are available)

| Live surface | GN behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running `gnosis-server` binary bound to loopback, serving the F2 wire contract | The retrieval trio + health over a real transport: `POST /rag/query`, `GET /rag/stream` (SSE), `GET /engine/status` | `curl` / a Node fetch client against `http://127.0.0.1:<port>`; or the proxy itself with the injectable `fetch`/`sse` pointed at the live endpoint |
| The engine's boot→READY lifecycle | READY observation + gating: `getEngineStatus` state transitions (`Starting` → `Ready`/`Degraded`/`Unavailable`), `waitForReady` polling | Observe the live `GET /engine/status` across the engine's boot; drive `ragQuery`/`ragStream` in each observed state |
| The engine's real transport failure modes | The `EngineUnavailable`/`EngineError` split: connection-refused, engine-not-spawned, malformed frames, unknown `schemaVersion`/`idFormat`, mid-stream cancel | Point the proxy at a dead port (refused), a non-spawned address (not-found), and a live-but-malformed server |
| The app's MCP/UI surface (once the proxy is wired in) | The GUI/MCP presentation of the retrieval trio + health | `tools/call` on the engine-backed rag/health tools (a LATER wiring unit) |

**Prerequisites for the later run (MANDATORY):**

1. The **`gnosis-server` binary crate** must exist and build (the deferred
   server-host unit). It must bind to **loopback** (`127.0.0.1` or `::1`) per
   the LOOPBACK-AUTH-TLS policy and serve the F2 wire contract paths
   (`/rag/query`, `/rag/stream`, `/engine/status`).
2. A **live Gnosis engine** must be running behind that server (the engine
   boot→READY lifecycle must be reachable via `GET /engine/status`).
3. The proxy must be **wired into the app** (a later unit) for the MCP/UI
   surface to be drivable; until then the live probes drive the proxy directly
   against the live endpoint.

---

## 3. The concrete live probes to run once the server-host binary + a live engine are available

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a regression or a doc/spec drift) — never a pass.

### 3.1 P0 — the live endpoint must be reachable (proves the server-host binary is live)

| Step | Expected |
| --- | --- |
| `curl -sS http://127.0.0.1:<port>/engine/status` | A `HealthReport` JSON (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `state` ∈ `{Ready,Starting,Degraded,Unavailable}`, `version`, `subsystems` (6 flags), `lastError`). If the port is refused/not-found, the server-host binary is not live ⇒ re-park. |
| `curl -sS -X POST http://127.0.0.1:<port>/rag/query -d '{"query":"…"}'` | A V-5-style envelope (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `payload` = the result body with `trace` present, `engine:'gnosis'`). |

### 3.2 Class RQ — `ragQuery` over a real transport (greens G16, G17; F10–F23)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G16 | `ragQuery('…')` against a Ready engine | Resolves to the mapped `EngineRagResult` (camelCase, lowercase enums, `mode`-discriminated `EngineRagTrace`, `engine:'gnosis'`). |
| G17 | A `POST /rag/query` returning a `{"type":"error","code":"conflict",…}` chunk | Rejects with `ConflictError` (409). |
| F10 | A `POST /rag/query` returning `{schemaVersion:1}` (missing `idFormat`/`payload`) | Rejects with `EngineError` (502). |
| F11 | A result body with no `trace` key | Rejects with `TraceUnavailable` (502). |
| F12 | A structurally malformed body WITH a `trace` key | Rejects with `EngineError` (502). |
| F13 | A body with `engine:'other'` | Rejects with `EngineError` (502). |
| F14 | A body with `blocked_by` present but a non-Graph trace | Rejects with `EngineError` (502). |
| F15 | A body with `schemaVersion:99` | Rejects with `EngineError` (502) (`UnsupportedSchemaVersion`). |
| F16 | A body with `idFormat:'uuid-v4'` | Rejects with `EngineError` (502) (`UnknownIdFormat`). |
| F17 | A wire error chunk `{"type":"error","code":"engine_unavailable",…}` | Rejects with `EngineUnavailable` (503, `cause:'unavailable-state'`). |
| F18 | A wire error chunk with an UNKNOWN code | Rejects with `EngineError` (502). |
| F19 | Point the proxy at a refused port | Rejects with `EngineUnavailable` (503, `cause:'connection-refused'`). |
| F20 | Point the proxy at a non-spawned address (`ENOTFOUND`) | Rejects with `EngineUnavailable` (503, `cause:'engine-not-spawned'`). |
| F21 | `ragQuery` when the observed state is `Starting` | Rejects with `EngineUnavailable` (503, `cause:'not-ready'`). |
| F22 | `ragQuery` when the observed state is `Degraded` | Rejects with `EngineUnavailable` (503, `cause:'not-ready'`); NO non-throw path. |
| F23 | `ragQuery` when the observed state is `Unavailable` | Rejects with `EngineUnavailable` (503, `cause:'unavailable-state'`). |

### 3.3 Class RS — `ragStream` over a real transport (greens G18–G21; F24, F25)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G18 | Subscribe to `GET /rag/stream`; the engine emits `event: result` + `data: {"type":"result",…}` then `event: done` + `data: {"type":"done"}` | The iterable yields `[{type:'result',result}, {type:'done'}]` in order. |
| G19 | The engine emits `event: error` + `data: {"type":"error","code":"validation_error","message":"empty query"}` then `event: done` | The iterable yields `[{type:'error',code:'validation_error',message:'empty query'}, {type:'done'}]`. |
| G20 | A stream with exactly one `result` then `done` | The iterable yields exactly those two chunks and closes (single-shot honesty). |
| G21 | The consumer cancels the iterable (`it.return()`) | The SSE connection closes cleanly; no error is thrown. |
| F24 | `ragStream` when the observed state is not `Ready` | The iterable throws `EngineUnavailable` (503, `cause:'not-ready'`). |
| F25 | The SSE connection closes before any `done` event | The iterable throws `EngineUnavailable` (503, `cause:'connection-refused'`); no partial result is committed. |

### 3.4 Class HS — `getEngineStatus`/`health` over a real transport (greens G22, G23; F32, F33)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G22 | `GET /engine/status` returning the Ready report | Both `getEngineStatus()` and `health()` resolve to the SAME `HealthReport` with `state:'Ready'`, all subsystems true, `lastError:null`. |
| G23 | `GET /engine/status` returning a Degraded report | `getEngineStatus()` resolves to a `HealthReport` with `state:'Degraded'` and the non-null `lastError` (a faithful projection, never invented). |
| F32 | A malformed report (missing `version`/`subsystems`/`lastError`) | Rejects with `EngineError` (502). |
| F33 | Point the proxy at a refused port | Rejects with `EngineUnavailable` (503, `cause:'connection-refused'`). |

### 3.5 Class WR — `waitForReady` over a real transport (greens G24, G25; F34–F36)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G24 | `getEngineStatus` returns `Starting` then `Ready` | `waitForReady` polls and resolves to the `Ready` report. |
| G25 | `getEngineStatus` returns `Starting`, then `Degraded`, then `Ready` | `waitForReady` keeps polling through both non-terminal states and resolves to the `Ready` report. |
| F34 | The state stays non-`Ready` past `maxAttempts` | Rejects with `EngineUnavailable` (503, `cause:'not-ready'`). |
| F35 | The state becomes `Unavailable` | Rejects with `EngineUnavailable` (503, `cause:'unavailable-state'`). |
| F36 | A connection-refused during polling | Rejects immediately with `EngineUnavailable` (503, `cause:'connection-refused'`); the fetch is called exactly ONCE (no retry). |

### 3.6 Class TO — request timeout (greens F37)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| F37 | A request that never resolves (the proxy's `fetchWithTimeout` aborts after `requestTimeoutMs`) | `getEngineStatus()` rejects with `EngineUnavailable` (503). |

### 3.7 Module-level pure scenarios — already verified against the live module (NOT re-attempted live)

These are pure decode/status-map/factory functions with **no network I/O**; they
were already verified against the live module (`src/main/engine-rag-store.js`)
in the greens run and do NOT require a live engine+server. They are NOT parked
for the transport run:

- **Factory + proxy surface:** G1, G2, G2b, F1, F2, F3 (construction-time
  throws + loopback enforcement + the 5-method surface + `ENGINE_ENDPOINTS`).
- **Golden-vector decode conformance:** G3–G9 (V-1..V-6, V-8 decode to the
  pinned typed values).
- **decode-then-validate precedence:** G10–G12, F4–F8 (trace-key-presence
  checked FIRST; `engine=='gnosis'`; `blocked_by ⇒ Graph`).
- **HTTP-status map:** G13–G15, F9 (all 21 codes; `conflict`=409 mandated;
  unknown code → `EngineError`).
- **SSE frame parsing (pure):** F26–F31 (`parseSseFrame`/`decodeSseChunk`
  malformed-frame rejection).

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 63 (all PASS at the module level —
  `docs/specs/unit-gn-engine-integration-greens.md`, 63/63).
- **Parked for the later live run (require a live engine+server — the
  retrieval trio + health over a real transport):** G16, G17, F10–F23
  (`ragQuery`, 16); G18–G21, F24, F25 (`ragStream`, 6); G22, G23, F32, F33
  (`getEngineStatus`/`health`, 4); G24, G25, F34–F36 (`waitForReady`, 5); F37
  (request timeout, 1) = **32 scenario ids** across classes RQ/RS/HS/WR/TO.
- **Module-level pure (already verified against the live module; no live
  server required):** G1, G2, G2b, F1, F2, F3, G3–G9, G10–G12, F4–F8, G13–G15,
  F9, F26–F31 = **31 scenario ids** (§3.7).
- **Total parked:** 32 of 63 rows (the transport-exercisable set). **Run live
  this iteration: 0.**
- **Not a failure:** the module is green (63/63 against the live module); the
  park is a **transport-surface absence** — the `gnosis-server` binary crate
  is deferred (Architecture A1), so there is no live engine endpoint to connect
  to and no MCP/UI tool drives the proxy.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the **`gnosis-server` binary
   crate** exists and builds, a **live Gnosis engine** is running behind it,
   and the server serves the F2 wire contract on **loopback** (`127.0.0.1`).
   The live check that ends the park: `curl http://127.0.0.1:<port>/engine/status`
   returns a `HealthReport` JSON AND `POST /rag/query` returns a V-5-style
   envelope. Until then the transport surface is absent (§1.1/§1.2).
2. **P0 first:** re-run the §3.1 reachability probe. If the endpoint is
   refused/not-found, the server-host binary is not live and the battery
   re-parks.
3. **Constraints to honor (recorded):**
   - **Loopback bind:** the server MUST bind to `127.0.0.1` or `::1`
     (LOOPBACK-AUTH-TLS). The proxy throws at construction on a non-loopback
     `baseUrl` (`Error('engine rag store: baseUrl must be loopback')`).
   - **F2 wire shapes:** the server MUST serve the pinned paths
     (`/rag/query` POST, `/rag/stream` GET-SSE, `/engine/status` GET) and emit
     the frozen shapes — the versioned envelope
     (`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":…}`), the
     canonical chunk JSON (`{"type":"result"|"done"|"error",…}`), the canonical
     error JSON (`{"code","message"}`), the single-event SSE frame
     (`event: <type>\ndata: <json>\n\n`), and the `HealthReport` (6 fields, 6
     subsystem flags, `state` PascalCase).
   - **Golden vectors as the conformance target:** the server's responses
     should reproduce the wire contract §12 vectors **V-1..V-6 and V-8**
     byte-exactly; the proxy's decode functions parse them into the pinned
     typed values (the decode-side conformance target — there is no encode
     surface in this unit).
   - **READY gating:** each RAG call issues a fresh `GET /engine/status` and
     gates on `state == Ready`; a non-`Ready` state → `EngineUnavailable`
     (503, `cause:'not-ready'` for `Starting`/`Degraded`,
     `cause:'unavailable-state'` for `Unavailable`).
   - **D2 engine-absent:** connection-refused → `EngineUnavailable` (503,
     `cause:'connection-refused'`); engine-not-spawned → `EngineUnavailable`
     (503, `cause:'engine-not-spawned'`).
4. **MCP/UI parity:** the proxy is NOT yet wired into the app (§1.3), so the
   live probes drive the proxy directly against the live endpoint (injectable
   `fetch`/`sse`). Once a later unit wires the proxy into the app's MCP/UI
   surface, re-run the same scenarios through `tools/call` for full MCP/UI
   feature parity.
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.9 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned messages: assert the exact strings (the factory
   throws per §5.9 fail-states 1–3, the `EngineUnavailable` `cause` values per
   §5.6/§5.9, the `EngineError`/`TraceUnavailable` 502 outcomes).
6. **Doc-staleness:** before running, reconcile this battery against the
   actual repo/build state (spec section numbers, byte-pinned strings, the
   live tool list — new tools may have landed) and the trackers
   (`docs/next-steps.md`, `docs/pending.md`). The greens' harness notes carry
   over for any direct-proxy probing.
