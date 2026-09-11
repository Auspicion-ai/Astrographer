# Unit GN-MCP-UI — Gnosis MCP/UI Wiring (`gnosis.*` tools + `gnosis` group + `handleGnosisTool` + boot injection + D4 parity panes): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-10.**
- **Source contract:** `docs/specs/unit-gn-mcp-ui-wiring.md` — §5.1 (the three
  `gnosis.*` tools + inputSchemas), §5.2 (`gnosis` group + `security.ts`), §5.3
  (the main-process `handleGnosisTool` + audit wiring), §5.4
  (`McpServerOptions.engineRagStore` boot injection + `baseUrl` source), §5.5
  (the two GUI panes + the NEW `EngineRagResult` render path), §5.6 (D2
  engine-absent surfacing), §5.7 (PBT register), §5.8/§5.9 (happy/fail states),
  §5.10 (census), §5.11 (cross-references). Consumes the proxy surface pinned in
  `docs/specs/unit-gn-engine-integration.md` §5.1/§5.4/§5.6/§5.10 (Unit GN owns
  `src/main/engine-rag-store.ts`); the F2 wire shapes are pinned in
  `../Gnosis/docs/specs/engine-wire-contract.md` §4–§12.
- **Greens battery (blind-test, already run against the LIVE MODULE):**
  `docs/specs/unit-gn-mcp-ui-wiring-greens.md` — **39 / 39 PASS, 0 FAIL** (the
  recorded run: `tests/blind-unit-gn-mcp-ui-wiring-greens.test.ts`, vitest, 31
  `it` blocks, exit 0; re-verified 2026-09-10 this session: 31/31 tests pass).
  Source under test: `src/main/mcp-server.js` (`handleGnosisTool`,
  `ProvidentMcpServer.ALL_TOOLS`, `registeredToolNames`),
  `src/main/security.js` (`groupForTool`, `defaultSecurityConfig`,
  `SecurityGate`), `src/main/engine-rag-store.js` (`createEngineRagStore`,
  `EngineRagResult`, `EngineWireError` family),
  `src/renderer/pane-graph.js`/`gnosis-panes.ts` (`gnosisStatusContent`,
  `gnosisQueryContent`, `gnosisStatusPaneHandler`, `searchContent`).
- **Status:** **PARTIAL — the D2 engine-absent path was LIVE-exercised this
  iteration (PASS); the retrieval-trio happy path over a real transport +
  the healthy-engine fail-states + the full running-app MCP/UI + GUI-pane
  surface are PARKED** for a later iteration. Pattern precedent:
  `docs/specs/unit-gn-engine-integration-live-pending-battery.md` (the sibling
  proxy battery — the same `gnosis-server`-deferral park shape).

---

## 1. Why this battery is (partially) parked — the live-surface assessment, verified live 2026-09-10

The `gnosis.*` tools + the GUI panes route to the `createEngineRagStore`
**proxy — a CLIENT** that needs a live Gnosis engine + HTTP server for the
happy path (a real engine serving `/rag/query`, `/rag/stream`, `/engine/status`).
The proposal gate (Architecture A1) **deferred the server-host binary crate**,
so there is no live engine endpoint to connect to. Additionally, **the
Astrographer Electron app is NOT running**, so the app's MCP tool surface and
GUI panes are not exposed as a live session this iteration.

### 1.1 No `gnosis-server` binary crate exists (the decisive probe)

`../Gnosis/Cargo.toml` declares exactly **two** `[[bin]]` targets — `gnosis`
(`src/main.rs`) and `gnosis-eval` (`src/bin/gnosis_eval.rs`). There is **no
`gnosis-server` bin**. Mirroring the sibling battery §1.1, `src/main.rs` is a
scaffold that does **not** bind a socket, listen, or serve `/rag/query`,
`/rag/stream`, `/engine/status`; the wire contract §11 confirms F2 ships **no**
HTTP code / status rendering. No live engine endpoint exists.

### 1.2 No running app and no live engine endpoint (verified live)

- `ps aux | grep -iE 'gnosis|astrographer'` → **no Astrographer/Electron app
  process** (only unrelated Discord/OpenCode) and **no gnosis engine process**.
- `ss -ltnp` → **no listener** on the engine's loopback bind. The documented
  default `http://127.0.0.1:8080` (spec §5.4) is **not** in the listener set
  (no `127.0.0.1:8080`). The connection to it is refused.

### 1.3 The wiring IS present in the source (module-green) — but its live client-server happy path is not drivable

- The full wiring landed: `src/main/security.ts` has the three `gnosis.*`
  `TOOL_GROUPS` rows + the `'gnosis'` group; `src/main/mcp-server.ts` has
  `handleGnosisTool` (exported, §5.3), the three `gnosis.*` rows in `ALL_TOOLS`,
  the three tool definitions with the §5.1 inputSchemas, and the
  `name.startsWith('gnosis.')` routing branch; `src/main/main.ts` constructs
  `createEngineRagStore({ baseUrl: resolveEngineBaseUrl() })` **unconditionally
  at boot** (no I/O) and injects it into `ProvidentMcpServer` as
  `engineRagStore`, plus the IPC `gnosis.status`/`gnosis.query` routes to the
  same `handleGnosisTool`; `src/main/engine-config.ts` provides the config seam;
  `src/renderer/gnosis-panes.ts` + `pane-graph.ts` provide the two panes + the
  render helpers (`gnosisStatusContent`/`gnosisQueryContent`/
  `gnosisStatusPaneHandler`).
- Because the app is **not running** and there is **no engine**, the live
  client-server round-trips that return real `EngineRagResult`/`HealthReport`
  data (the happy path) cannot be observed. The **D2 engine-absent path CAN be —
  and was — exercised live** (§2.1): the real proxy pointed at the real (dead)
  loopback endpoint surfaces `EngineUnavailable` (503) over a **real network
  stack** (no mock).

**Conclusion:** the happy-path + healthy-engine fail-state scenarios (the
retrieval trio over a real transport, the not-ready/malformed-wire/stream
fail-states, the no-credential-on-success body-observation) and the full
running-app MCP/UI + GUI-pane surface are **parked** (not failures). The D2
engine-absent + null-engine + validation + unknown-name surface is
**live-verified this iteration** (all PASS).

---

## 2. What the live runner DID exercise this iteration (the D2 engine-absent path)

Because the app is not running, the live runner drove the **real production
wiring chain** through a main-process harness over the **real network**: a real
`createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080' })` (loopback; the
factory is the app-boot construction — it performs no I/O and was immediately
usable, S38) and the real `handleGnosisTool` routing. No mocks, no mock
`fetch`. The engine is absent, so the loopback endpoint is refused — this is a
genuine D2 execution over a real transport.

### 2.1 Live-executed PASS scenarios (S12–S14, S23, S28, S30 + S15 representative + S38 construction)

| Scenario | Live probe | Live result |
| --- | --- | --- |
| **S12** `gnosis.query` null engine | `handleGnosisTool(null,'gnosis.query',{query:'q'},null)` | Throws `Error('gnosis.query: no engine rag store configured')` — PASS |
| **S13** `gnosis.stream` null engine | `handleGnosisTool(null,'gnosis.stream',{query:'q'},null)` | Throws `Error('gnosis.stream: no engine rag store configured')` — PASS |
| **S14** `gnosis.status` null engine | `handleGnosisTool(null,'gnosis.status',{},null)` | Throws `Error('gnosis.status: no engine rag store configured')` — PASS |
| **S23** `gnosis.query` connection-refused | real proxy → `handleGnosisTool(proxy,'gnosis.query',{query:'q',topK:10},null)` | Rejects `EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`, `message:'fetch failed'`) — PASS |
| **S28** `gnosis.status` connection-refused | real proxy → `handleGnosisTool(proxy,'gnosis.status',{},null)` | Rejects `EngineUnavailable` (503, `cause:'connection-refused'`) — PASS |
| **S30** unknown `gnosis.*` name | `handleGnosisTool(proxy,'gnosis.frobnicate',{},null)` | Throws `Error('unknown gnosis tool: gnosis.frobnicate')` — PASS |
| **S15** (representative of the S15–S21 validation batch) | non-null engine, `{query:''}` | `Error('gnosis.query: query must be a non-empty string')` fires **before** any engine I/O — PASS |
| **S38** proxy construction does no I/O | real `createEngineRagStore({ baseUrl })` constructed the harness and was immediately used by `handleGnosisTool` | Construction performed no network I/O — PASS |

**Live-runner tally (this iteration): 8 scenarios confirmed PASS on the live
wiring** — 6 fully (S12, S13, S14, S23, S28, S30), plus S15 (representative of
the pure-validation batch S15–S21) and S38 (no-I/O construction) exercised live.
The D2 `connection-refused → EngineUnavailable(503)` surface that the task
flagged as live-exercisable **holds on the real network stack**.

### 2.2 Not driveable live in this harness — probe-environment artifact, NOT a regression

`LIVE:gnosis.stream` did not surface `EngineUnavailable`: `ragStream` uses the
**browser `EventSource` global** (`src/main/engine-rag-store.ts` line ~1094;
the default SSE client is commented "Never exercised by the unit tests" — the
greens inject a mock `sse`). In the plain Node probe there is no `EventSource`
global, so the stream transport cannot connect (`ReferenceError: EventSource is
not defined`) before any network I/O. This is a **probe-environment limitation
(Unit GN's stream uses the app's EventSource-capable runtime), not a wiring
finding**. The stream's live fail-states (S26/S27) and happy path (S8/S9) are
**parked** for the app runtime + live engine.

---

## 3. The live surfaces that WILL exercise the full GN-MCP-UI behavior (after the revisit condition)

| Live surface | GN-MCP-UI behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running `gnosis-server` binary bound to loopback serving the F2 wire contract | The retrieval-trio happy path over a real transport: `POST /rag/query` → `EngineRagResult`; `GET /rag/stream` (SSE) → `{ chunks }`; `GET /engine/status` → `HealthReport` | Point the real proxy (or the running app's MCP `tools/call`) at `http://127.0.0.1:<port>` |
| A running engine boot→READY lifecycle | The not-ready/Degraded/Unavailable surfacing (S24, S26) and the `Degraded` faithful projection (S11) | Observe `GET /engine/status` across boot; drive each tool in each observed state |
| A live-but-malformed / SSE-capable server | The malformed-wire fail-states (S25, S29) and the stream fail/happy states (S8, S9, S26, S27) | A test server emitting the frozen shapes / canonical SSE frames; a server that closes the stream before `done` |
| A live engine + the running Astrographer app | The no-credential-arg invariant on a REAL forwarded body (S37) | A capturing server logs the `/rag/query` body: assert ONLY the documented query/opts fields are forwarded (no token/tls/apiKey/ca/cert/key) |
| The running Astrographer app (Electron; MCP server + D4 panes exposed) | The app-level MCP/UI surface + the GUI panes (S31–S36): `tools/call` on the three `gnosis.*` tools; the `gnosis-status` operator pane + `gnosis-query` app-graph pane | `tools/call` through the app's MCP transport (or the IPC `gnosis.status`/`gnosis.query` bridge) with the `gnosis` group enabled |

**Prerequisites for the later run (MANDATORY):**

1. The **`gnosis-server` binary crate** must exist and build (the deferred
   server-host unit). It must bind to **loopback** (`127.0.0.1`/`::1`) per the
   LOOPBACK-AUTH-TLS policy and serve the pinned paths `/rag/query` (POST),
   `/rag/stream` (GET-SSE), `/engine/status` (GET) with the frozen F2 wire
   shapes (§4/§12 of the wire contract).
2. A **live Gnosis engine** must be running behind that server (boot→READY
   reachable via `GET /engine/status`).
3. For the app-level MCP/UI + GUI-pane scenarios: the **Astrographer Electron
   app must be running** with the `gnosis` group enabled (default-off) — the
   app's MCP transport (`--mcp-transport`, `npm run mcp`) + the D4 panes must
   be live.

---

## 4. The concrete live probes to run once the server-host binary + a live engine are available

### 4.1 P0 — the live endpoint must be reachable (proves the server-host binary is live)

| Step | Expected |
| --- | --- |
| `curl -sS http://127.0.0.1:<port>/engine/status` | A `HealthReport` JSON (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `state` ∈ `{Ready,Starting,Degraded,Unavailable}`, `version`, `subsystems` (6 flags), `lastError`). If refused/not-found ⇒ the server-host binary is not live ⇒ re-park. |
| `curl -sS -X POST http://127.0.0.1:<port>/rag/query -d '{"query":"…"}'` | A V-5-style envelope (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `payload` = result body with `trace` present, `engine:'gnosis'`). |

### 4.2 The `gnosis.*` MCP tools over a real transport (W1 – happy; W3 – engine state)

Drive `handleGnosisTool` with the real proxy (or `tools/call` through the
running app) against the live endpoint. The greens/spec expectation is given as
the live observable; a contradiction is a finding, never a pass.

| Scenario | Live probe | Expected (live) |
| --- | --- | --- |
| **S6** `gnosis.query` happy | `handleGnosisTool(proxy,'gnosis.query',{query:'the query',topK:10},audit)` against a Ready engine | Resolves to the proxy-specific `EngineRagResult` (query/results with documentId/nodeId/score/snippet/source:'local'/engine:'gnosis'/citations[]/trace:{mode:'flat',…}; NO ranked/context/markdown/lineMap/k); audit log gains exactly one entry (`requester:'mcp'`). |
| **S7** full mode set | `{query:'q', mode:'vector'|'hybrid', topK:5}` | Returns the mode-discriminated `EngineVectorTrace`/`EngineHybridTrace`; the audit entry's `mode` is the widened union value. |
| **S8** `gnosis.stream` happy | `handleGnosisTool(proxy,'gnosis.stream',{query:'q'},audit)` against a Ready engine streaming `result` then `done` | `{ chunks:[{type:'result',result}, {type:'done'}] }` in order; one audit entry, `resultCount = result.results.length`. |
| **S9** `gnosis.stream` error-then-done | Server streams `error` (`code`/`message`) then `done` | `{ chunks:[{type:'error',code,message},{type:'done'}] }`; audit `resultCount === 0`. |
| **S10** `gnosis.status` happy | `handleGnosisTool(proxy,'gnosis.status',{},audit)` against a Ready engine | Resolves to the `HealthReport` (`state:'Ready'`, all six subsystems true, `lastError:null`); audit log UNCHANGED. |
| **S11** `gnosis.status` Degraded | A Degraded report | Resolves to a `HealthReport` with `state:'Degraded'` + non-null `lastError` (faithful projection, never a throw). |
| **S24** `gnosis.query` non-`Ready` | `Starting` then `Unavailable` observed state | `Starting`/`Degraded` → `EngineUnavailable` (503, `cause:'not-ready'`); `Unavailable` → `EngineUnavailable` (503, `cause:'unavailable-state'`). |
| **S37** no-credential-arg invariant on a real success | A capturing server logs the `POST /rag/query` body | The call SUCCEEDS and the forwarded body carries ONLY the documented query/opts fields — the `token`/`tls`/`apiKey`/`ca`/`cert`/`key` args are NOT forwarded. |

### 4.3 The malformed-wire / SSE fail-states over a real transport

| Scenario | Live probe | Expected (live) |
| --- | --- | --- |
| **S25** `gnosis.query` malformed wire body | A rag/query envelope whose payload is missing `trace` | Rejects `TraceUnavailable` (502, `code:'trace_unavailable'`) per the trace-key-presence-first precedence. |
| **S26** `gnosis.stream` non-`Ready` gate | A non-`Ready` `/engine/status` gate | The tool rejects `EngineUnavailable` (503) — a tool-level throw, NOT an error chunk (READY gate fires inside the call). |
| **S27** `gnosis.stream` premature close before `done` | An SSE server that closes (`onClose`) before any `done` | Rejects `EngineUnavailable` (503, `cause:'connection-refused'`); no partial `chunks` committed. |
| **S29** `gnosis.status` malformed health report | `/engine/status` missing `version`/`subsystems`/`lastError` | Rejects `EngineError` (502). |

### 4.4 The GUI panes over the live app (D4 parity surface; requires the running Electron app)

| Scenario | Live probe | Expected (live) |
| --- | --- | --- |
| **S31** status pane happy | The `gnosis-status` operator pane rendering a live `HealthReport` | The rendered subtree shows `state:'Ready'`, `version`, the six subsystem flags, `lastError`; never throws. Operator isolated scope → NOT in `get_rendered_html`. |
| **S32** status pane engine-absent | The `gnosis-status` pane with a null/absent report (engine absent) | No-throw; the rendered subtree is the unavailable state (not a `Ready` report). |
| **S33** `gnosisStatusPaneHandler` bridge rejection | The pane's bridge rejects with `EngineUnavailable` | Resolves (never throws) to the same unavailable-state content as `gnosisStatusContent(ctx,null)`. |
| **S34** query pane happy | The `gnosis-query` app-graph pane rendering a live `EngineRagResult` | The subtree includes query/documentId/score/snippet/engine:'gnosis'/citations[]/trace.mode; the walked key set contains NONE of ranked/context/markdown/lineMap/k. |
| **S35** query pane empty | The `gnosis-query` pane with a null result | No-throw (empty state), distinct from the populated render. |
| **S36** `EngineRagResult` render path distinct | `gnosisQueryContent` vs `searchContent` over equivalent-shaped data | `searchContent` renders the local fields; `gnosisQueryContent` does NOT reference them and renders the proxy-specific fields (engine/trace/citations). |

---

## 5. Parked-scenario census

- **Total greens scenario rows:** 39 (all PASS at the module level —
  `docs/specs/unit-gn-mcp-ui-wiring-greens.md`, 39/39; re-verified this session:
  31/31 vitest `it` blocks, exit 0).
- **Parked for the later live run (require a live `gnosis-server` + engine + (for
  the GUI/MCP-app set) a running app):**
  - Retrieval-trio happy path + healthy-engine returns over a real transport
    (W1/W3): **S6, S7, S8, S9, S10, S11** (6);
  - Malformed/not-ready/stream fail-states needing a live or SSE-capable server:
    **S24, S25, S26, S27, S29** (5);
  - The no-credential-on-real-success body observation: **S37** (1);
  - The GUI D4 panes over the running app: **S31, S32, S33, S34, S35, S36** (6).
  - **Total parked: 18 scenario ids.**
- **Run live this iteration:** the D2 engine-absent / null-engine / validation /
  unknown-name / no-I/O-construction wiring — **8 scenarios confirmed PASS live**
  (S12, S13, S14, S23, S28, S30 fully + S15 representative + S38 construction).
- **Module-level pure (already verified against the live modules in the greens;
  no engine/app required — NOT parked):** S1–S5 (group/security mapping),
  S15–S22 (validation batch; S15 re-confirmed live), S38 (construction no-I/O,
  re-confirmed live), S39 (config-seam round-trip).
- **Not a failure:** the module is green (39/39); the park is a
  **transport-surface + running-app absence** — the `gnosis-server` binary crate
  is deferred (Architecture A1) and the Astrographer app is not running this
  iteration. The D2 engine-absent contract (the part the task marked
  live-exercisable) **holds over the real network stack**.

---

## 6. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the **`gnosis-server` binary
   crate** exists and builds, a **live Gnosis engine** runs behind it serving the
   F2 wire contract on **loopback** (`127.0.0.1`), AND (for the app-level
   MCP/UI + GUI-pane scenarios) the **Astrographer Electron app is running** with
   the `gnosis` group enabled. The live check that ends the park:
   `curl http://127.0.0.1:<port>/engine/status` returns a `HealthReport` JSON
   AND `POST /rag/query` returns a V-5-style envelope.
2. **P0 first:** re-run the §4.1 reachability probe. If the endpoint is
   refused/not-found, the server-host binary is not live and the battery re-parks.
3. **The D2 engine-absent part is NOT re-parked** — it was live-verified this
   iteration (§2.1) over a real refused endpoint. Do not re-run the refused-port
   probes as if unverified unless you want a belt-and-suspenders cross-check.
4. **Constraints to honor (recorded):**
   - **Loopback bind:** the server MUST bind `127.0.0.1`/`::1`
     (LOOPBACK-AUTH-TLS); `createEngineRagStore` throws on a non-loopback
     `baseUrl`.
   - **F2 wire shapes:** serve the pinned paths + frozen shapes — the versioned
     envelope (`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":…}`),
     canonical chunk JSON (`{"type":"result"|"done"|"error",…}`), canonical error
     JSON (`{"code","message"}`), single-event SSE frame
     (`event: <type>\ndata: <json>\n\n`), and the `HealthReport` (6 fields, 6
     subsystem flags, `state` PascalCase). Golden vectors V-1..V-6/V-8 (§12) are
     the decode conformance target.
   - **`gnosis` group default-off:** the three `gnosis.*` tools register ONLY
     when the `gnosis` group is enabled; enable it via the manual-UI settings /
     security config before driving them through the app.
   - **READY gating:** each RAG call issues a fresh `GET /engine/status` and
     gates on `state == Ready`; non-`Ready` → `EngineUnavailable`
     (`cause:'not-ready'` for `Starting`/`Degraded`,
     `cause:'unavailable-state'` for `Unavailable`); connection-refused →
     (`cause:'connection-refused'`), all 503.
   - **`gnosis.status` read-only:** no audit entry; `gnosis.query`/`gnosis.stream`
     record exactly one entry (`requester:'mcp'`).
   - **Stream needs an EventSource-capable runtime:** `ragStream` (Unit GN) uses
     the browser `EventSource` global — drive the stream through the app's actual
     runtime (or a Node with EventSource), NOT a plain Node harness.
5. **MCP/UI parity drive:** once the app runs, drive the same scenarios through
   `tools/call` on the three `gnosis.*` tools for full MCP/UI feature parity, and
   assert the GUI panes render per §4.4.
6. **A live result that CONTRADICTS the greens or spec §5.1–§5.10 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned messages: assert the exact strings (the null-engine
   guards, the validation messages, the `EngineUnavailable` `cause`/httpStatus
   values, the `EngineError`/`TraceUnavailable` 502 outcomes).
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers, byte-pinned strings, the live tool
   list) and the trackers (`docs/next-steps.md`, `docs/pending.md`,
   `docs/decisions.md`).
