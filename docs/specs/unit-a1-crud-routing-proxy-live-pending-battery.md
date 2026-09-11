# Unit A1 — Document-CRUD Routing Proxy (`createEngineCrudRagStore` proxy): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-10.**
- **Source contract:** `docs/specs/unit-a1-crud-routing-proxy.md` — §5.1 (the
  factory + the 11-method proxy surface + the pinned `ENGINE_CRUD_ENDPOINTS`),
  §5.2 (the encode+decode wire shapes + the golden-vector conformance V-10..V-12),
  §5.3 (decode-then-validate for CRUD responses), §5.4 (the §11 HTTP-status map +
  the error model + NEW-2 + RBAC `caller` threading), §5.5 (the transport: the
  request envelope in the JSON body, `:id` substitution, the READY gate, D2
  engine-absent, per-request timeout, P4 retry), §5.6 (READY observation + D2
  engine-absent behavior), §5.8 (16 happy states), §5.9 (18 fail-states + the
  pinned non-throws), §5.10 (the census). The wire shapes + golden vectors are
  pinned in `../Gnosis/docs/specs/p1a-document-crud-wire.md` §4/§9 (V-10..V-12);
  the server the client talks to is pinned in
  `../Gnosis/docs/specs/p2-gnosis-server.md` §5.2 (the 11 CRUD endpoints) / §7
  (status rendering + NEW-2) / §8 (RBAC `caller` threading).
- **Greens battery (blind-test, docs-only, already run against the LIVE MODULE):**
  `docs/specs/unit-a1-crud-routing-proxy-greens.md` — **26 PASS, 18 NOT-VERIFIED,
  0 FAIL** (a docs-only analysis; the run file
  `tests/blind-unit-a1-crud-routing-proxy-greens.test.ts` is a future artifact —
  the module-level pure scenarios are verified by the unit tests
  `tests/unit-a1-crud-routing-proxy.test.ts` + `tests/props-a1-crud-routing-proxy.test.ts`;
  source under test `src/main/engine-crud-rag-store.js`). The 18
  NOT-VERIFIED scenarios are the **live REST transport** cases (the 11 CRUD-method
  happy paths, the READY-gate happy path, the P4-retry happy path, and the
  transport-dependent fail-states F4/F5/F6/F17/F18).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-gn-engine-integration-live-pending-battery.md` (the
  same surface-absence park shape). This battery is the handoff for a LATER
  iteration of the live-scenario runner, to be executed once the **A2 unit lands**
  (the document-CRUD MCP tools + GUI screens wired over the A1 proxy), the
  **Astrographer app runs with the CRUD routing**, and a **live `gnosis-server`
  binary serves the CRUD endpoints on loopback**.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-10)

The `createEngineCrudRagStore` proxy is a **CLIENT** — it needs a live
`gnosis-server` binary serving the 11 document-CRUD endpoints AND the app's MCP/UI
surface wired over the proxy to exercise the CRUD methods end-to-end over a real
transport. The A2 unit (the document-CRUD MCP tools + GUI screens) is the **final
MVP unit, queued after A1** and is **NOT yet landed**. The park is a
**surface-absence park**, verified live:

### 1.1 A2 is NOT landed — no document-CRUD MCP/UI surface exists (the decisive probe)

- `docs/specs/unit-a2*` → **no A2 spec file exists** (the A2 unit is queued after
  A1, not yet written/landed).
- `src/main/main.ts` and `src/main/mcp-server.ts` → **do NOT import**
  `engine-crud-rag-store` / `createEngineCrudRagStore` (grep returns no match).
  The A1 proxy is **NOT wired into the app**.
- **No MCP/UI tool** exposes the 11 document-CRUD methods (`createDocument`,
  `getDocument`, `updateDocument`, `deleteDocument`, `publishDocument`,
  `unpublishDocument`, `archiveDocument`, `listDocuments`, `createWiki`,
  `getWiki`, `listWikis`). There is no live MCP/UI surface to drive the CRUD
  routing.

### 1.2 The A1 module IS landed (the client exists), but nothing drives it live

- `src/main/engine-crud-rag-store.ts` **EXISTS** (2026-09-10) and exports
  `createEngineCrudRagStore`, `encodeCrudRequest`, `decodeCrudRequest`,
  `decodeCrudResponse`, `validateCrudResult`, `ENGINE_CRUD_ENDPOINTS` (11 paths),
  and the full typed surface. The module is green at the module level (the greens
  run).
- The only reference to `createEngineCrudRagStore` / `engine-crud-rag-store` in
  `src/` is the module itself — it is **not imported** by `main.ts` or
  `mcp-server.ts`.

### 1.3 No live `gnosis-server` process and no live CRUD endpoint

- `ps aux | grep -i gnosis` → **no gnosis process**.
- `ss -ltnp` → **no listener** on a loopback port serving the document-CRUD wire
  surface (no `127.0.0.1:<port>` bound to `/documents`, `/wikis`, or
  `/engine/status`). The `gnosis-server` `[[bin]]` crate EXISTS in the Gnosis
  workspace (`../Gnosis/Cargo.toml`; `src/bin/gnosis_server.rs`) and the P1a/P2
  specs exist, but **no server is running**.

**Conclusion:** the live surface required to exercise the 11 CRUD methods
end-to-end (a running `gnosis-server` serving the CRUD endpoints on loopback AND
the app's MCP/UI surface wired over the A1 proxy) is **not available**. Per the
live-runner contract these scenarios are **parked** (not failures) and recorded
here. The greens themselves are already **26 PASS / 18 NOT-VERIFIED against the
live module** — the park is a transport-surface + wiring absence, not a module
regression.

---

## 2. The live surfaces that WILL exercise the A1 behavior (after A2 lands + a live `gnosis-server` is running)

| Live surface | A1 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running `gnosis-server` binary bound to loopback (`127.0.0.1:<port>`), serving the 11 document-CRUD endpoints + `GET /engine/status` | The 11 CRUD-method happy paths + the READY gate + D2 engine-absent over a real transport: `POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`, `DELETE /documents/:id`, `POST /documents/:id/publish`, `POST /documents/:id/unpublish`, `POST /documents/:id/archive`, `GET /documents`, `POST /wikis`, `GET /wikis/:id`, `GET /wikis` | `curl` / a Node fetch client against `http://127.0.0.1:<port>`; or the proxy itself with the injectable `fetch` pointed at the live endpoint |
| The engine's boot→READY lifecycle | READY observation + gating: `getEngineStatus` state transitions (`Starting` → `Ready`/`Degraded`/`Unavailable`); each CRUD call issues a fresh `GET /engine/status` gate | Observe the live `GET /engine/status` across the engine's boot; drive each CRUD method in each observed state |
| The engine's real transport failure modes | The `EngineUnavailable`/`EngineError` split: connection-refused, engine-not-spawned, non-2xx non-envelope body | Point the proxy at a dead port (refused), a non-spawned address (not-found), and a live-but-malformed server |
| The app's MCP/UI surface (once A2 wires the proxy in) | The GUI/MCP presentation of the 11 document-CRUD methods | `tools/call` on the engine-backed document-CRUD tools (the A2 wiring unit) |
| The live wire's RBAC `caller` threading | The encoded request envelope reflects the args type: mutating carries `caller`, read-only carries no `caller` | Observe the request envelope the server receives for a mutating vs a read-only call |

**Prerequisites for the later run (MANDATORY):**

1. The **A2 unit must land**: the document-CRUD MCP tools + GUI screens wired over
   the A1 proxy (`createEngineCrudRagStore` imported by `main.ts`/`mcp-server.ts`,
   the 11 CRUD methods exposed as MCP tools + GUI actions).
2. The **Astrographer app must run with the CRUD routing** wired in.
3. A **live `gnosis-server` binary** must be running, bound to **loopback**
   (`127.0.0.1` per the LOOPBACK-AUTH-TLS policy), serving the 11 document-CRUD
   endpoints + `GET /engine/status` (the P2 server spec §5.2/§6).

---

## 3. The concrete live probes to run once A2 lands + a live `gnosis-server` is running

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a regression or a doc/spec drift) — never a pass.

### 3.1 P0 — the live endpoint must be reachable (proves the `gnosis-server` binary is live)

| Step | Expected |
| --- | --- |
| `curl -sS http://127.0.0.1:<port>/engine/status` | A `HealthReport` JSON (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `state` ∈ `{Ready,Starting,Degraded,Unavailable}`, `version`, `subsystems` (6 flags), `lastError`). If the port is refused/not-found, the server is not live ⇒ re-park. |
| `curl -sS -X POST http://127.0.0.1:<port>/documents -d '<V-10 request envelope>'` | A V-11-style response envelope (`schemaVersion:1`, `idFormat:'opaque-string-v1'`, `payload` = the `createDocument` result body). |

### 3.2 Class L1 — the 11 CRUD-method happy paths over a real transport (greens G6–G16)

Each probe issues the CRUD call through the proxy (or the app's MCP/UI tool once
A2 wires it) against a **Ready** engine, with the request envelope in the JSON
request body and the `:id` substitution applied. The expected typed result is the
snake→camel projection of the wire body (§5.2).

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G6 | `createDocument({caller:'user:alice', wikiId:'w1', body:{title:'Getting Started', tags:['guide'], author:'alice'}})` → `POST /documents` | Resolves to the typed `Document` (`revision:0`, `state:'Draft'`). |
| G7 | `getDocument({documentId:'d1'})` → `GET /documents/d1` | Resolves to the typed `Document`. |
| G8 | `updateDocument({caller:'user:alice', documentId:'d1', body:{baseRevision:0, graph:{nodes:[],edges:[]}, title:'…', tags:['guide']}})` → `POST /documents/d1/update` | Resolves to the typed `Document`. |
| G9 | `deleteDocument({caller:'user:alice', documentId:'d1'})` → `DELETE /documents/d1` | Resolves to `void` (the wire `result:null`). |
| G10 | `publishDocument({caller:'user:alice', documentId:'d1'})` → `POST /documents/d1/publish` | Resolves to the typed `Document` (`state:'Published'`). |
| G11 | `unpublishDocument({caller:'user:alice', documentId:'d1'})` → `POST /documents/d1/unpublish` | Resolves to the typed `Document` (`state:'Draft'`). |
| G12 | `archiveDocument({caller:'user:alice', documentId:'d1'})` → `POST /documents/d1/archive` | Resolves to the typed `Document` (`state:'Archived'`). |
| G13 | `listDocuments({wikiId:'w1', body:{state:null, tag:null, page:1, pageSize:20}})` → `GET /documents` | Resolves to the typed `DocumentList` (`page>=1`, `1<=pageSize<=100`). |
| G14 | `createWiki({caller:'user:alice', name:'My Wiki'})` → `POST /wikis` | Resolves to the typed `Wiki`. |
| G15 | `getWiki({wikiId:'w1'})` → `GET /wikis/w1` | Resolves to the typed `Wiki`. |
| G16 | `listWikis({})` → `GET /wikis` | Resolves to the typed `Wiki[]`. |

### 3.3 Class L2 — READY gate happy over a real transport (greens G17)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G17 | A CRUD call (all 11 methods, mutating AND read-only) against a **Ready** engine | The call issues a **fresh** `GET /engine/status` immediately before proceeding; when the freshly-observed state is `Ready` → the call proceeds to the REST call. The gate is NOT a cached observation and NOT caller-supplied. |

### 3.4 Class L3 — P4 retry happy over a real transport (greens G19)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| G19 | `createDocument`/`createWiki` with `retry.maxRetries > 0` against an engine that returns `EngineUnavailable` (503) on the first attempt(s) then succeeds | Retries on `EngineUnavailable` up to `maxRetries` times with `backoffMs` (default 100) between attempts; each retry re-issues a fresh READY gate + the same request envelope; a retry attempt that succeeds resolves to the typed result. A non-`EngineUnavailable` error is NOT retried. |

### 3.5 Class L4 — transport-dependent fail-states over a real transport (greens F4, F5, F6, F17, F18)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| F4 | A CRUD call when the freshly-observed state is `Starting` or `Degraded` | Rejects with `EngineUnavailable` (503, `cause:'not-ready'`); NO non-throw path. |
| F4 | A CRUD call when the freshly-observed state is `Unavailable` | Rejects with `EngineUnavailable` (503, `cause:'unavailable-state'`). |
| F5 | Point the proxy at a refused port (a fetch that throws `ECONNREFUSED`) | Rejects with `EngineUnavailable` (503, `cause:'connection-refused'`). |
| F6 | Point the proxy at a non-spawned address (a fetch that throws `ENOTFOUND`) | Rejects with `EngineUnavailable` (503, `cause:'engine-not-spawned'`). |
| F17 | A non-2xx response whose body is NOT a decodable response envelope (e.g. a transport-level NEW-2 400/422 body that is not a `StoreError` envelope) | Rejects with `EngineError` (502) — the client cannot classify a non-`StoreError` transport body into the typed error model. |
| F18 | A mutating create (`createDocument`/`createWiki`) with `retry.maxRetries > 0` that keeps hitting `EngineUnavailable` past the retry budget | Rejects with `EngineUnavailable` (503). The retry is bounded (never infinite) and only on `EngineUnavailable` (a non-`EngineUnavailable` error is NOT retried). |

### 3.6 Class L5 — D2 engine-absent behavior when the server is stopped (additional live scenario)

| Live probe | Expected (live) |
| --- | --- |
| Stop the `gnosis-server` process, then drive a CRUD call through the app's MCP/UI surface (or the proxy) | The call rejects with `EngineUnavailable` (503, `cause:'connection-refused'`); the app surfaces the engine-absent state gracefully (D2 — engine-absent = UNAVAILABLE) and does NOT crash. The shell's local-first store (`createJsonRagStore`, Unit A) continues to work without the engine; engine-backed document-store features surface `EngineUnavailable`. |

### 3.7 Class L6 — RBAC `caller` threading over the live wire (additional live scenario)

| Live probe | Expected (live) |
| --- | --- |
| Drive a mutating CRUD call (e.g. `createDocument`) and a read-only CRUD call (e.g. `getDocument`) through the live wire; observe the request envelope the server receives | The mutating request envelope carries `caller` (the server's request-decode layer threads it); the read-only request envelope carries **no** `caller`. The client never emits a mutating request without `caller` and never emits a read-only request with `caller` (the type-level guarantee holds over the live wire). |

### 3.8 Module-level pure scenarios — already verified against the live module (NOT re-attempted live)

These are pure encode/decode/validate/factory functions with **no network I/O**;
they were already verified against the live module (`src/main/engine-crud-rag-store.js`)
in the greens run and do NOT require a live engine+server. They are NOT parked for
the transport run:

- **Factory + proxy surface:** G1, G2, G2b, F1, F2, F3 (construction-time throws +
  loopback enforcement + the 11-method surface + `ENGINE_CRUD_ENDPOINTS`).
- **Golden-vector conformance:** G3, G4, G5 (V-10 encode; V-11/V-12 decode).
- **RBAC caller threading (pure round-trip):** G18, G20 (the encoded request
  envelope reflects the args type — verifiable via the pure
  `encodeCrudRequest`/`decodeCrudRequest` round-trip).
- **decode-then-validate precedence:** F7–F16 (malformed envelope, unknown
  schemaVersion/idFormat, missing/unknown method discriminator, both/neither
  result+error, known/unknown wire codes, malformed result body, CRUD validation
  failures, method/result mismatch).
- **Pinned non-throws / type-level guarantees:** G21 (the client never triggers
  the NEW-2 request-decode 400/422 path from its own well-formed requests).

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 44 (26 PASS, 18 NOT-VERIFIED, 0 FAIL —
  `docs/specs/unit-a1-crud-routing-proxy-greens.md`).
- **Parked for the later live run (require a live engine+server + the app's
  MCP/UI surface — the 11 CRUD methods + READY gate + P4 retry + transport
  fail-states over a real transport):** G6–G16 (the 11 CRUD-method happy paths,
  11); G17 (READY gate happy, 1); G19 (P4 retry happy, 1); F4, F5, F6, F17, F18
  (transport-dependent fail-states, 5) = **18 scenario ids** across classes
  L1/L2/L3/L4.
- **Additional live scenarios (require the full app + a live server, not in the
  greens' NOT-VERIFIED set):** L5 (D2 engine-absent when the server is stopped, 1);
  L6 (RBAC `caller` threading over the live wire, 1) = **2 scenario ids**.
- **Total parked:** **20 scenario ids** (18 greens NOT-VERIFIED + 2 additional
  live scenarios). **Run live this iteration: 0.**
- **Module-level pure (already verified against the live module; no live server
  required):** G1, G2, G2b, G3, G4, G5, G18, G20, G21, F1, F2, F3, F7–F16 = **28
  scenario ids** (G1, G2, G2b, G3, G4, G5, G18, G20, G21 = 9; F1, F2, F3 = 3;
  F7–F16 with F15a–F15g as 7 sub-cases = 16; total 28). G20/G21 are the pinned
  non-throws / type-level guarantees (§3.8).
- **Not a failure:** the module is green (26 PASS / 18 NOT-VERIFIED against the
  live module); the park is a **surface-absence** — A2 (the document-CRUD MCP/UI
  wiring) is NOT landed, the proxy is not wired into the app, and no live
  `gnosis-server` is running.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the **A2 unit lands** (the
   document-CRUD MCP tools + GUI screens wired over the A1 proxy), the
   **Astrographer app runs with the CRUD routing**, AND a **live `gnosis-server`
   binary** serves the CRUD endpoints on **loopback** (`127.0.0.1`). The live
   check that ends the park: `curl http://127.0.0.1:<port>/engine/status` returns
   a `HealthReport` JSON AND `POST /documents` returns a V-11-style envelope AND
   the app's MCP/UI surface exposes the 11 document-CRUD tools. Until then the
   transport + wiring surface is absent (§1.1/§1.2/§1.3).
2. **P0 first:** re-run the §3.1 reachability probe. If the endpoint is
   refused/not-found, the server is not live and the battery re-parks.
3. **Constraints to honor (recorded):**
   - **Loopback bind:** the server MUST bind to `127.0.0.1` (LOOPBACK-AUTH-TLS).
     The proxy throws at construction on a non-loopback `baseUrl`
     (`Error('engine crud rag store: baseUrl must be loopback')`).
   - **P1a wire shapes:** the server MUST serve the pinned 11 paths
     (`POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`,
     `DELETE /documents/:id`, `POST /documents/:id/publish`,
     `POST /documents/:id/unpublish`, `POST /documents/:id/archive`,
     `GET /documents`, `POST /wikis`, `GET /wikis/:id`, `GET /wikis`) and emit
     the frozen shapes — the versioned envelope
     (`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":…}`), the
     request envelope (`{"method","args"}`), the response envelope
     (`{"method","result"}` or `{"method","error":{"code","message"}}`), and the
     `HealthReport` (6 fields, 6 subsystem flags, `state` PascalCase).
   - **Envelope-in-body transport:** the request envelope is the **JSON request
     body** for ALL methods (POST/GET/DELETE) — the `gnosis-server` `crud_handler`
     extracts the body and parses it via `Envelope::from_json` for every CRUD
     endpoint regardless of HTTP verb (a GET-with-body is the established
     transport; the server does not read a query param).
   - **`:id` substitution:** the client replaces the `:id` placeholder with the
     URL-encoded `documentId`/`wikiId` from the args; the path id and the
     envelope's id must agree.
   - **Golden vectors as the conformance target:** the server's responses should
     reproduce the wire contract §9 vectors **V-10..V-12** byte-exactly; the
     proxy's encode/decode functions reproduce them (V-10 = request encode;
     V-11 = response decode; V-12 = error decode).
   - **READY gating:** each CRUD call issues a fresh `GET /engine/status` and
     gates on `state == Ready`; a non-`Ready` state → `EngineUnavailable`
     (503, `cause:'not-ready'` for `Starting`/`Degraded`,
     `cause:'unavailable-state'` for `Unavailable`).
   - **D2 engine-absent:** connection-refused → `EngineUnavailable` (503,
     `cause:'connection-refused'`); engine-not-spawned → `EngineUnavailable`
     (503, `cause:'engine-not-spawned'`).
   - **P4 retry:** `createDocument`/`createWiki` with `retry.maxRetries > 0`
     retry on `EngineUnavailable` (503) up to `maxRetries` times with `backoffMs`
     (default 100) between attempts; each retry re-issues a fresh READY gate + the
     same request envelope; a non-`EngineUnavailable` error is NOT retried; after
     the budget → `EngineUnavailable` (503).
   - **RBAC `caller` threading:** mutating requests carry `caller`; read-only
     requests carry no `caller` (the type-level guarantee holds over the live
     wire).
4. **MCP/UI parity:** the proxy is NOT yet wired into the app (§1.1), so the
   live probes drive the proxy directly against the live endpoint (injectable
   `fetch`). Once A2 wires the proxy into the app's MCP/UI surface, re-run the
   same scenarios through `tools/call` for full MCP/UI feature parity.
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.9 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned messages: assert the exact strings (the factory
   throws per §5.9 fail-states 1–3, the `EngineUnavailable` `cause` values per
   §5.6/§5.9, the `EngineError` 502 outcomes, the `ConflictError` 409 outcome).
6. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers, byte-pinned strings, the live tool
   list — new tools may have landed) and the trackers (`docs/next-steps.md`,
   `docs/pending.md`). The greens' harness notes carry over for any direct-proxy
   probing.
