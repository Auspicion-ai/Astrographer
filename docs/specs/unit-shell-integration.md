# Spec — Unit: Shell-Integration (the re-scoped Option B) — the shared `engine-transport.ts` module (TLS application + the extracted transport helpers + the `isLoopbackHost` superset), the fetch-based SSE client (SSE-path auth + the H10 no-reconnect contract), the bind/auth/TLS policy record, the D2-fallback clarification, and the e2e transport test / live-battery revisit

- **Status:** **LANDED — GREEN** (the unit is landed; the re-scoped Option B is
  realized). The full TDD + PBT + adversarial + blind-greens + live-scenario + trio
  gates PASSED. Test counts (verified against the build): 
  `tests/unit-shell-integration.test.ts` **42 pass + 1 skipped** (the e2e descriptor
  is opt-in + gated on the engine), `tests/props-shell-integration.test.ts` **8 pass**
  (the §5.7 register — all rows HELD), 
  `tests/blind-unit-shell-integration-greens.test.ts` **44 pass + 1 skipped** (the
  blind greens; the e2e block opt-in + gated). The post-green adversarial pass
  (RCA-3) recorded three HOST findings (**H1/H2/H3 — all HELD**) + a PBT
  negative-generator audit (all register rows HELD) in §3a, and **no package
  defects** in §3b (the GET-with-body transport divergence is a HOST / confirm-in-app
  live-investigation item, NOT a package finding). The proposal-review record is
  `docs/specs/shell-integration-review.md` (REJECT the full 7-item unit as written;
  PROCEED-WITH-AMENDMENTS with the re-scoped Option B — the five genuine remaining
  deliverables + the three mandatory amendments).
- **Scope (the five deliverables + the three amendments):** (1) **TLS application**
  — a shared `src/main/engine-transport.ts` module (extract the duplicated
  `isLoopbackHost`/`assertLoopback`/`transportError`/`fetchWithTimeout`/`headers()`
  from both proxies) + an https-agent-backed injectable `createEngineFetch(auth)`
  that applies `auth.tls` (`{ca,cert,key}`) via the undici `dispatcher`; both
  proxies consume it; the existing `opts.fetch` injectable seam stays as the test
  seam. (2) **SSE-path auth** — a fetch-based SSE client (replaces `EventSource` as
  the default; sends the `Authorization: Bearer` header on the stream; does NOT
  auto-reconnect; preserves the H10 premature-close `EngineUnavailable` semantics);
  the `SseClient` interface is unchanged. (3) **A concrete bind/auth/TLS policy
  record** — a policy section in this spec (§5.3) + a DECIDED/ACTIVE decision row
  (`ENGINE-TRANSPORT-POLICY`). (4) **The D2-fallback clarification** — the
  document-CRUD surface surfaces `EngineUnavailable` (503) when the engine is absent
  (it does NOT fall back to the local store — the data models differ); the local
  `rag.*` surface is the parallel D2 fallback for the shell's local graph/cross-link
  features. (5) **The e2e transport test / live-battery revisit** — extend the
  parked live batteries (P2 M1-M20, A2, GN, GN-MCP-UI) for the document-CRUD live
  round-trips; opt-in + gated on the engine (the `gnosis-server` running on
  loopback + the app running). **The three mandatory amendments (folded in):**
  (1) **`isLoopbackHost` superset reconciliation** — the shared module's
  `isLoopbackHost` is the union of both proxies' implementations (adding the hex
  `::ffff:7f00:1` form to `engine-rag-store.ts`), with the GN loopback tests
  re-verified; (2) **undici dependency scoping** — the TLS `dispatcher` dependency
  is justified and scoped (shell-side only; the engine lib stays at zero new runtime
  deps); (3) **SSE premature-close semantics** — the fetch-based client preserves
  the H10 no-reconnect contract and is tested against it.
- **TestWriter contract:** every method/API signature, return shape, throw pattern,
  happy-path state, and fail-state below is derivable from this spec ALONE. The
  TestWriter writes the red set for the shared transport module + the fetch-based
  SSE client + the policy record + the D2-fallback clarification from §5.8/§5.9
  before any implementation, and asserts the PBT register (§5.7) holds. This red set
  has been written, landed, and its trio turned green (the landed test census is
  reported in §5.10 and §6).
- **Page-design note (repo divergence):** this unit is a **transport module** — it
  adds **NO GUI screens** and changes **NO page design**. Per the established
  sibling convention (roadmap §-header note; `docs/specs/unit-a2-document-crud-wiring.md`
  §-header note), **NO `docs/skills/designing-pages.md` update is made** and **no
  test-use-case coverage matrix / demo-page index is touched** (the file does not
  exist in this repo — the `docs/skills/` directory is EMPTY). The base instruction
  to update `docs/skills/designing-pages.md` only applies when that file exists; it
  does not.

**Spec-gate review record (2026-09-10):** the reviewer loop (architecture review +
change-analysis) returned **no MAJOR findings** on the re-scoped Option B. The
residual risks (accepted in the proposal review) are: the deferred ~45-method
graph/fact/consistency surface stays deferred per `GNOSIS-CRUD-MVP-SCOPE`; the e2e
transport test is opt-in + gated on the engine (non-deterministic in CI); the TLS
path is lightly tested (only exercised when `auth.tls` is set, GUI-only); the undici
dependency is a shell-side runtime cost (the engine lib stays at zero new runtime
deps). None blocks delegation.

**Landing record (post-green):** the re-scoped Option B is realized and green. The
landed test census: `tests/unit-shell-integration.test.ts` **42 + 1 skipped**
(covers the §5.1 shared-module surface, the §5.2 fetch-based SSE client, the §5.3/§5.4
policy-record + D2-fallback clarification, the pinned non-throws, and the three
adversarial regressions H1/H2/H3); `tests/props-shell-integration.test.ts` **8**
(the §5.7 register — P-IM-1..3, P-SM-1..3, P-TP-1..2, all HELD, with the
negative-generator gaps closed per §3a); `tests/blind-unit-shell-integration-greens.test.ts`
**44 + 1 skipped** (the blind verification of §5.1–§5.11 + the PBT rows + the opt-in
e2e block). The e2e blocks in both test files are `skipIf`-gated on the live engine
and are NOT part of the deterministic suite. The full trio gate is green. See §3a
(the adversarial §3a register is now POPULATED — all HOST findings HELD) and §3b
(no package defect; one HOST/confirm-in-app live-investigation item recorded).

---

## 1. What the proposal asks

The proposal asked for the shell-integration unit — the transport mechanism
connecting the Astrographer shell to the Gnosis engine — as a 7-item unit. The
review found **5 of the 7 items already landed** (the HTTP-over-native-IPC decision
+ server host, the shell-side SSE client, bind-loopback + auth/TLS options, the §11
HTTP-status map, and the D2 engine-absent behavior) and **re-scoped to Option B**:
the five genuine remaining deliverables + the three mandatory amendments. This spec
pins the re-scoped Option B.

Concretely, the re-scoped unit delivers:

1. **TLS application** — a shared `src/main/engine-transport.ts` module (extract the
   duplicated `isLoopbackHost`/`assertLoopback`/`transportError`/`fetchWithTimeout`/
   `headers()` from both proxies) + an https-agent-backed injectable
   `createEngineFetch(auth)` that applies `auth.tls` via the undici `dispatcher`.
   Both proxies consume it. The existing `opts.fetch` injectable seam stays as the
   test seam.
2. **SSE-path auth** — a fetch-based SSE client (replaces `EventSource` as the
   default; sends the `Authorization: Bearer` header on the stream; does NOT
   auto-reconnect; preserves the H10 premature-close `EngineUnavailable` semantics).
   The `SseClient` interface is unchanged.
3. **A concrete bind/auth/TLS policy record** — a policy section in this spec (§5.3)
   + a DECIDED/ACTIVE decision row (`ENGINE-TRANSPORT-POLICY`).
4. **The D2-fallback clarification** — the document-CRUD surface surfaces
   `EngineUnavailable` (503) when the engine is absent (it does NOT fall back to the
   local store — the data models differ); the local `rag.*` surface is the parallel
   D2 fallback for the shell's local graph/cross-link features.
5. **The e2e transport test / live-battery revisit** — extend the parked live
   batteries (P2 M1-M20, A2, GN, GN-MCP-UI) for the document-CRUD live round-trips;
   opt-in + gated on the engine.

**The three mandatory amendments (folded into this spec):**
1. **`isLoopbackHost` superset reconciliation** — the shared module's `isLoopbackHost`
   is the union of both proxies' implementations (adding the hex `::ffff:7f00:1`
   form to `engine-rag-store.ts`), with the GN loopback tests re-verified (§5.1).
2. **undici dependency scoping** — the TLS `dispatcher` dependency is justified and
   scoped (shell-side only; the engine lib stays at zero new runtime deps) (§5.1).
3. **SSE premature-close semantics** — the fetch-based client preserves the H10
   no-reconnect contract and is tested against it (§5.2).

**Explicitly OUT of scope (deferred):** the graph/fact/consistency/RAG-companion
surfaces (A3–A5, P1b–P1e — deferred per `GNOSIS-CRUD-MVP-SCOPE`); any change to the
frozen document-CRUD wire shapes (P1a); any change to the `SseClient` interface; any
change to the §11 HTTP-status map or the error model; the server host (P2, landed);
the RBAC **enforcement** semantics (the engine is the enforcer).

## 2. Feasibility verdict

**Feasible — a pure shell-side transport refactor + two additive seams; no
engine/foundation gap.**

- **The duplicated helpers are byte-identical in both proxies.** `isLoopbackHost`/
  `assertLoopback`/`transportError`/`fetchWithTimeout`/`headers()` are duplicated
  across `engine-rag-store.ts` (Unit GN) and `engine-crud-rag-store.ts` (Unit A1)
  with identical logic (the ONE divergence: the CRUD `isLoopbackHost` already has the
  hex `::ffff:7f00:1` form; the GN one does not). Extracting them to a shared module
  is a mechanical refactor with no behavior change (the superset is the union).
- **The `opts.fetch` injectable seam is already the test seam.** Both proxies accept
  `opts.fetch`; the unit tests inject a mock `fetch`. `createEngineFetch(auth)` is
  the DEFAULT (used when `opts.fetch` is absent), so the existing test seam is
  unchanged and the TLS path is exercised only when `auth.tls` is set (GUI-only).
- **The `SseClient` interface is frozen.** The fetch-based SSE client implements the
  unchanged `SseClient` interface (`subscribe(url, handlers): { close(): void }`).
  The proxy's `ragStream` consumption logic (the READY gate, the H10 premature-close
  handling) is unchanged; only the default client's transport changes.
- **The undici `dispatcher` is the standard way to apply a custom CA/cert/key.**
  The standard `fetch` API does not accept a custom CA/cert/key without an https
  agent; undici's `fetch` accepts a `dispatcher` (an `Agent` with `connect: { ca,
  cert, key }`). The dependency is scoped to the shell (the engine lib stays at zero
  new runtime deps).
- **No engine/foundation gap.** The refactor composes the LANDED proxies + the
  LANDED error model + the LANDED `SseClient` interface. The D2-fallback
  clarification is a documentation/decision pin (the behavior already exists — the
  document-CRUD surface already surfaces `EngineUnavailable`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The shared `src/main/engine-transport.ts` module (the 5 extracted helpers + `createEngineFetch(auth)`) | Project-specific (shell-side; the engine lib is untouched) | Low cost; removes the duplicated transport logic + applies `auth.tls` (the genuine remaining gap). |
| The `isLoopbackHost` superset reconciliation (the hex `::ffff:7f00:1` form added to `engine-rag-store.ts`) | Project-specific (shell-side) | Low cost; the shared module is the union of both proxies' implementations; the GN loopback tests re-verified. |
| The undici `dispatcher` dependency (TLS application) | Project-specific (shell-side only; the engine lib stays at zero new runtime deps) | Low-Medium cost (one shell-side runtime dep); the TLS path is exercised only when `auth.tls` is set (GUI-only). |
| The fetch-based SSE client (SSE-path auth + the H10 no-reconnect contract) | Project-specific (shell-side) | Low cost; sends the Bearer header on the stream + preserves the premature-close `EngineUnavailable` semantics. |
| The bind/auth/TLS policy record + the DECIDED/ACTIVE decision row | Project-specific (doc) | Low cost; pins the concrete policy (bind loopback-only, Bearer-on-header, TLS-via-dispatcher, GUI-only carve-out). |
| The D2-fallback clarification | Project-specific (doc/decision) | Low cost; pins that the document-CRUD surface surfaces `EngineUnavailable` (no local-store fallback) and the local `rag.*` surface is the parallel D2 fallback. |
| The e2e transport test / live-battery revisit | Project-specific (opt-in + gated on the engine) | Low cost; extends the parked live batteries for the document-CRUD live round-trips. |

No engine gap. The refactor composes the LANDED proxies + the LANDED error model +
the LANDED `SseClient` interface. The undici dependency is a shell-side runtime cost
(the engine lib stays at zero new runtime deps).

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3). It was
> EMPTY at the spec gate and is now **POPULATED** (the unit is LANDED). Host findings
> are recorded here (fixed + regression-tested); package/upstream findings are routed
> to `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

**Adversarial findings (RCA-3 — post-green, all HOST, fixed + regression-tested, all HELD):**

- **H1 (FIXED + regression-tested):** the fetch-based SSE client had sent
  `content-type: application/json` on the GET stream — it initially reused the
  shared `headers(auth)` helper, which always adds `content-type`, violating §5.2 (a
  GET stream is `method: 'GET'` and sends ONLY `authorization: Bearer <token>` when a
  token is set, and NO `content-type` header — a GET stream needs none). FIXED to the
  §5.2 literal: `createSseClient.subscribe` (`engine-rag-store.ts`) issues the fetch
  with ONLY the Bearer header (`{ ...(auth?.token ? { authorization: Bearer ${token}
  } : {}) }`) and never reuses `headers(auth)`. Regression-tested by two tests in
  `tests/unit-shell-integration.test.ts` that assert the SSE GET's captured
  `init.headers` contains NO `content-type` key (both with and without a token), plus
  the blind-green G11/G11b rows.
- **H2 (pinned):** the `{ tls: {} }` empty-object edge — because
  `createEngineFetch`'s gate is `!auth?.tls` (a truthiness check, NOT a
  presence-of-fields check), an empty-but-truthy `auth.tls = {}` takes the TLS path
  (an undici `Agent` with an EMPTY `connect: {}`), NOT `globalThis.fetch`. Pinned in
  §5.1 (the no-TLS return applies only when `auth.tls` is absent/undefined) and
  regression-tested by the H2 test in `tests/unit-shell-integration.test.ts`, the
  `{tls:{}}` variant of the P-TP-1 register row, and blind-green G4b.
- **H3 (assertion added):** a direct GN-factory hex-loopback no-throw — the GN
  factory `createEngineRagStore({ baseUrl: 'http://[::ffff:7f00:1]:8080' })` accepts
  the hex IPv4-mapped loopback form at construction (no-throw) via the shared
  `isLoopbackHost` superset (§5.1 amendment 1). Regression-tested directly against
  the factory (the H3 re-verification test in `tests/unit-shell-integration.test.ts`
  + blind-green G13).
- **PBT audit verdict — the negative-generator gaps are CLOSED; all register rows
  HELD.** The post-green read-only PBT audit requested negative-generator coverage
  (the original PBT register held mostly positive cases for the superset / no-silent-
  reconnect assertions). `tests/props-shell-integration.test.ts` closed every gap:
  **P-IM-1** hex 2-part NON-loopback hosts (`::ffff:8000:1`, `::ffff:7e00:1` — first
  16 bits ≠ `0x7f`) return `false`; **P-SM-1** a dropped/failing SSE connection
  (a reject OR a non-2xx) fires EXACTLY ONE terminal `onError` with `fetchCount === 1`
  (no auto-reconnect); **P-SM-2** PROXY-layer premature close — `createEngineRagStore()`
  `.ragStream` against a premature-close stream (it ends before a `done` chunk) throws
  `EngineUnavailable` (503, `cause:'connection-refused'`) with NO partial commit and
  NO re-fetch; **P-TP-1** PARTIAL-tls variants (`{tls:{ca}}`, `{tls:{cert}}`,
  `{tls:{key}}`, `{tls:{ca,cert}}`, `{tls:{}}`) return NOT `globalThis.fetch` and
  their undici `dispatcher.connect` carries EXACTLY the present `ca`/`cert`/`key`
  (absent fields omitted); **P-IM-3** SSE-Bearer facet — a `createSseClient` call with
  a token carries `authorization: Bearer <token>` on the stream init. **All 8 register
  rows (P-IM-1..3, P-SM-1..3, P-TP-1..2) HELD.**

### 3b. Package findings register (provident-ssr / Gnosis — recorded, never patched)

> Package/upstream findings from the post-green adversarial pass are recorded here
> and routed to `docs/defects.md` + `docs/HANDOFF.md` (never patched in this repo —
> the package code is upstream-owned).

- **NONE** (no package/upstream defect was found in this unit).
- **Live-investigation item (HOST/confirm-in-app, NOT a package finding):** the
  **GET-with-body transport divergence** — this unit's fetch-based SSE client
  deliberately sends NO body on the GET stream, while the request/response CRUD
  proxies send a JSON *request envelope* with methods whose HTTP verb is GET (e.g.
  the `getDocument`/`listDocuments`/`getWiki`/`listWikis` GET endpoints carry a JSON
  body). Whether the engine's GET endpoints accept, ignore, or error on a request
  body is a **host / confirm-in-app** question to be confirmed against the live F2
  wire on loopback (§5.5 / §5.11) — it is NOT a package defect and NOT a documented
  deviation introduced here. It is tracked as a live-investigation item, not a
  package finding; **no `defects.md`/`HANDOFF.md` package entry was created.**

## 4. Design decisions pinned by this spec

The NEW decision rows this spec pins (each is expanded in §5):

- **ENGINE-TRANSPORT-SHARED-MODULE (new):** a shared `src/main/engine-transport.ts`
  module exports the 5 extracted transport helpers (`isLoopbackHost`/`assertLoopback`/
  `transportError`/`fetchWithTimeout`/`headers`) + the new `createEngineFetch(auth)`;
  both proxies consume it (§5.1).
- **ENGINE-TLS-UNDICI (new):** the TLS `dispatcher` dependency is justified and
  scoped — the `undici` package is a shell-side runtime dep (the engine lib stays at
  zero new runtime deps); `createEngineFetch(auth)` applies `auth.tls` via the undici
  `dispatcher` (§5.1).
- **ENGINE-SSE-FETCH-CLIENT (new):** a fetch-based SSE client (a `createSseClient(auth)`
  factory) replaces `EventSource` as the default; it sends the `Authorization: Bearer`
  header on the stream, does NOT auto-reconnect, and preserves the H10 premature-close
  `EngineUnavailable` semantics; the `SseClient` interface is unchanged (§5.2).
- **ENGINE-TRANSPORT-POLICY (new, DECIDED/ACTIVE):** the concrete bind/auth/TLS
  policy record — bind loopback-only (enforced at construction), auth Bearer-on-the-
  `Authorization`-header for all request/response calls AND the SSE stream (never in
  the URL), TLS via the shared https-agent-backed fetch, and the GUI-only carve-out
  (engine credentials/TLS are GUI-only at the shell, blocked from MCP access; `baseUrl`
  is NOT a credential) (§5.3).

The CONSUMED decisions (already LANDED):

- **TRANSPORT-HTTP-SSE-LOOPBACK (consumed):** the transport is HTTP/REST + SSE over
  loopback; the endpoint paths are pinned as constants (§5.1/§5.3).
- **ASSERT-LOOPBACK-INTERNAL (consumed, UPDATED):** `assertLoopback` is extracted to
  the shared `engine-transport.ts` module and exported from THERE (it is no longer
  internal to `engine-rag-store.ts`); the proxies still do NOT export it. Loopback
  enforcement is still tested through the factory throw pattern (§5.1).
- **TRANSPORT-CAUSE-MAPPING (consumed):** the transport-path `cause` mapping
  (connection-refused → `EngineUnavailable` `cause:'connection-refused'`;
  engine-not-spawned → `cause:'engine-not-spawned'`; the wire-code path assigns
  `cause:'unavailable-state'`) is preserved by the shared `transportError` (§5.1).
- **GNOSIS-SUPPLANTS-DOCUMENT-STORE (consumed):** the document-CRUD surface is the
  document surface over the engine (no second editor, no sync); the local
  `createJsonRagStore` is the D2 fallback for the shell's OTHER document features
  (§5.4).
- **GNOSIS-D2-ENGINE-ABSENT (consumed):** `EngineUnavailable` is surfaced
  consistently across the MCP + GUI surfaces (§5.4).
- **GNOSIS-SECURITY-CARVE-OUT (consumed):** the GUI-only boundary — engine
  credentials/TLS are GUI-only at the shell, blocked from MCP access; `baseUrl` is
  NOT a credential (§5.3).
- **GNOSIS-CRUD-MVP-SCOPE (consumed):** the deferred ~45-method surface stays
  deferred; the document-CRUD surface is the MVP slice (§5.4).

## 5. The exhaustive contract

### 5.1 The `engine-transport.ts` module surface

**Module:** `src/main/engine-transport.ts` (NEW). It exports the 5 extracted
transport helpers + the new `createEngineFetch(auth)`. Both proxies
(`engine-rag-store.ts` — Unit GN, and `engine-crud-rag-store.ts` — Unit A1) consume
it; the duplicated local copies are REMOVED from both proxies.

**The `engine-transport.ts` ↔ `engine-rag-store.ts` import cycle (pinned — safe):**
`engine-transport.ts` imports the error model (`EngineWireError`/`EngineUnavailable`)
from `engine-rag-store.ts` (for `transportError`/`fetchWithTimeout`), and
`engine-rag-store.ts` imports the transport helpers from `engine-transport.ts`. This
is an **intentional, safe ESM cycle**: neither module uses the other's bindings at
module-evaluation time (the error classes are referenced only inside function bodies,
resolved at call time). The Implementer MUST NOT "fix" the cycle by moving the error
model (a larger refactor) or by duplicating the helpers.

**The exported surface (exact):**

```ts
/** Unit shell-integration §5.1 — the loopback-host superset (the union of both
 *  proxies' implementations, incl. the hex ::ffff:7f00:1 form). PURE. */
export function isLoopbackHost(host: string): boolean

/** Unit shell-integration §5.1 — assert the baseUrl resolves to a loopback host.
 *  Throws `Error('${prefix}: baseUrl must be loopback')` on a non-loopback or
 *  unparseable baseUrl. SYNCHRONOUS (no network I/O at construction). */
export function assertLoopback(baseUrl: string, prefix: string): void

/** Unit shell-integration §5.1 — the D2 engine-absent transport split. Returns an
 *  EngineWireError unchanged; ECONNREFUSED → EngineUnavailable('connection-refused');
 *  ENOTFOUND → EngineUnavailable('engine-not-spawned'); any other transport failure
 *  → EngineWireError('engine_unavailable', 503, String(err)). PURE. */
export function transportError(err: unknown): unknown

/** Unit shell-integration §5.1 — the per-request timeout wrapper. On a timeout the
 *  fetch is aborted and EngineUnavailable('connection-refused', 'request timed out
 *  after ${requestTimeoutMs}ms') is thrown (never a raw AbortError). */
export async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  requestTimeoutMs: number,
): Promise<Response>

/** Unit shell-integration §5.1 — the request headers: { 'content-type':
 *  'application/json' } plus 'authorization': 'Bearer <token>' when auth.token is
 *  set. PURE. */
export function headers(auth?: { token?: string }): Record<string, string>

/** Unit shell-integration §5.1 — an https-agent-backed injectable fetch that
 *  applies auth.tls ({ca,cert,key}) via the undici dispatcher. When auth.tls is
 *  NOT set, returns globalThis.fetch (no dispatcher). The returned function has the
 *  standard fetch signature. */
export function createEngineFetch(
  auth?: { token?: string; tls?: { ca?: string; cert?: string; key?: string } },
): typeof fetch
```

**`isLoopbackHost(host: string): boolean` — the superset (amendment 1, pinned):**

The shared `isLoopbackHost` is the **union** of both proxies' implementations. It
returns `true` for exactly the following host strings (and `false` for all others):

1. `host === '127.0.0.1'` → `true`.
2. `host === '::1'` → `true`.
3. `host.startsWith('::ffff:')` (the IPv4-mapped IPv6 loopback forms):
   - `v4 = host.slice('::ffff:'.length)`.
   - `v4 === '127.0.0.1'` → `true`.
   - `v4.split('.')` has length 4 and `parts[0] === '127'` → `true` (covers
     `::ffff:127.x.y.z`, the whole IPv4 loopback /8).
   - `v4.split(':')` has length 2 and `parseInt(hexParts[0], 16)` is not `NaN` and
     `(first >>> 8) === 0x7f` → `true`. By this rule the hex IPv4-mapped loopback
     forms in the 127/8 block — `::ffff:7f00:1`, `::ffff:7f01:1` (the compressed
     forms the URL parser normalizes `::ffff:127.0.0.1` / `::ffff:127.1.0.1` to) —
     are accepted, and a hex 2-part form whose first 16 bits are NOT `0x7f` (e.g.
     `::ffff:7e00:1`, `::ffff:8000:1`) is NOT.
4. `host === 'localhost'` → `true` (the loopback alias; the factory is synchronous —
   no DNS resolution is performed at construction, so `localhost` is accepted as the
   loopback alias per the pinned happy state).
5. else → `false`.

**The superset reconciliation (amendment 1):** the shared `isLoopbackHost` is the
union of both proxies' implementations. The CRUD proxy's `isLoopbackHost`
(`engine-crud-rag-store.ts`) already has the hex `::ffff:7f00:1` form; the GN
proxy's (`engine-rag-store.ts`) does NOT. The shared module uses the CRUD version
(the superset), and the GN proxy gains the hex form by consuming the shared module.
**The GN loopback tests are re-verified** (the GN factory's loopback enforcement
now accepts the hex `::ffff:7f00:1` form — a superset, so no previously-valid
loopback baseUrl is rejected).

**`assertLoopback(baseUrl: string, prefix: string): void` (pinned):**

```ts
export function assertLoopback(baseUrl: string, prefix: string): void {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    throw new Error(`${prefix}: baseUrl must be loopback`)
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (isLoopbackHost(host)) return
  throw new Error(`${prefix}: baseUrl must be loopback`)
}
```

The `prefix` parameter preserves the byte-pinned messages: the GN proxy passes
`'engine rag store'` (→ `'engine rag store: baseUrl must be loopback'`); the CRUD
proxy passes `'engine crud rag store'` (→ `'engine crud rag store: baseUrl must be
loopback'`). The proxies call `assertLoopback(opts.baseUrl, 'engine rag store')` /
`assertLoopback(opts.baseUrl, 'engine crud rag store')` respectively.

**`transportError(err: unknown): unknown` (pinned — the D2 engine-absent split):**

```ts
export function transportError(err: unknown): unknown {
  if (err instanceof EngineWireError) return err
  const code =
    err && typeof err === 'object'
      ? (err as any).code ?? (err as any).cause?.code
      : undefined
  if (code === 'ECONNREFUSED') {
    return new EngineUnavailable('connection-refused', String((err as any).message))
  }
  if (code === 'ENOTFOUND') {
    return new EngineUnavailable('engine-not-spawned', String((err as any).message))
  }
  return new EngineWireError('engine_unavailable', 503, String(err))
}
```

The `cause` mapping is preserved (TRANSPORT-CAUSE-MAPPING, consumed): `ECONNREFUSED`
→ `EngineUnavailable` `cause:'connection-refused'`; `ENOTFOUND` →
`EngineUnavailable` `cause:'engine-not-spawned'`; any other transport failure → the
typed `EngineWireError` (H6 — a typed `EngineWireError` on any fail-state, never a
raw `Error`). The `code` is read from both the direct `err.code` shape (the shape the
unit tests inject) and the nested `err.cause.code` shape (the real transport shape —
a `TypeError: fetch failed` whose `cause` is the underlying socket error).

**`fetchWithTimeout(fetchImpl, url, init, requestTimeoutMs): Promise<Response>`
(pinned):**

```ts
export async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  requestTimeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs)
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new EngineUnavailable(
        'connection-refused',
        `request timed out after ${requestTimeoutMs}ms`,
      )
    }
    throw transportError(err)
  } finally {
    clearTimeout(timer)
  }
}
```

H4 (the per-request timeout applied to every fetch) is preserved: on a timeout the
fetch is aborted and a typed `EngineUnavailable` is thrown (never a raw
`AbortError`); on any other failure `transportError(err)` is thrown.

**`headers(auth?: { token?: string }): Record<string, string>` (pinned):**

```ts
export function headers(auth?: { token?: string }): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' }
  if (auth?.token) h['authorization'] = `Bearer ${auth.token}`
  return h
}
```

The Bearer token is sent on the `Authorization` header for ALL request/response
calls (never in the URL). When `auth.token` is absent, no `authorization` key is
present. `headers()` is request/response-only — the SSE GET stream does NOT reuse it
(it would add a `content-type`, which §5.2 forbids on a GET stream — see the H1
adversarial finding in §3a).

**`createEngineFetch(auth): typeof fetch` (pinned — the TLS application):**

```ts
import { Agent, fetch as undiciFetch } from 'undici'

export function createEngineFetch(
  auth?: { token?: string; tls?: { ca?: string; cert?: string; key?: string } },
): typeof fetch {
  if (!auth?.tls) return globalThis.fetch
  const dispatcher = new Agent({
    connect: {
      ...(auth.tls.ca !== undefined ? { ca: auth.tls.ca } : {}),
      ...(auth.tls.cert !== undefined ? { cert: auth.tls.cert } : {}),
      ...(auth.tls.key !== undefined ? { key: auth.tls.key } : {}),
    },
  })
  return (input, init) => undiciFetch(input, { ...init, dispatcher })
}
```

- **When `auth.tls` is NOT set** (or `auth` is absent): returns `globalThis.fetch`
  (the plain fetch — no TLS customization needed for a loopback HTTP connection).
- **When `auth.tls` is set** (any of `ca`/`cert`/`key` present): returns a wrapper
  that calls `undiciFetch(input, { ...init, dispatcher })` where `dispatcher` is an
  undici `Agent` with `connect: { ca, cert, key }` (only the PRESENT fields are
  passed — an absent field is omitted, never passed as `undefined`).
- The returned function has the standard `fetch` signature
  `(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>`; the undici
  `dispatcher` is an undici-specific `RequestInit` extension passed through by the
  wrapper.
- **The empty-object edge (H2, pinned):** the gate is `!auth?.tls` (a truthiness
  check). An empty-but-truthy `auth.tls = {}` takes the TLS path — an undici `Agent`
  with an EMPTY `connect: {}` — NOT `globalThis.fetch`. The no-TLS return applies
  ONLY when `auth.tls` is absent/undefined. (Pinned + regression-tested — see §3a
  and the §5.8 happy state 3.)

**The undici dependency scoping (amendment 2, pinned):** the `undici` package is
added to the **Astrographer shell's** dependencies (shell-side only). The **Gnosis
engine lib stays at zero new runtime deps** (the Rust engine lib is untouched; the
`dispatcher`/`Agent` API is a Node-side concern). The dependency is justified: the
standard `fetch` API does not accept a custom CA/cert/key without an https agent, and
undici's `fetch` accepts a `dispatcher` (an `Agent` with `connect: { ca, cert, key }`)
— the standard way to apply a custom CA/cert/key in Node. The TLS path is exercised
only when `auth.tls` is set (GUI-only).

**The proxy consumption (pinned):** both proxies replace their local duplicated
helpers with the shared module and use `createEngineFetch` as the default fetch:

- **GN (`engine-rag-store.ts`):** `const fetchImpl = opts.fetch ?? createEngineFetch(opts.auth)`.
- **CRUD (`engine-crud-rag-store.ts`):** `const fetchImpl = opts.fetch ?? createEngineFetch(opts.auth)`.

The **`opts.fetch` injectable seam stays as the test seam** — when `opts.fetch` is
provided (the unit tests inject a mock `fetch`), it wins; `createEngineFetch(auth)`
is only the default (used when `opts.fetch` is absent). The `headers()`/`fetchWithTimeout`
calls in both proxies are replaced with the shared `headers(auth)`/`fetchWithTimeout(fetchImpl, url, init, requestTimeoutMs)`.

**The `SseClient` interface (unchanged — §5.2):** the `SseClient` interface in
`engine-rag-store.ts` is UNCHANGED. The proxy's `ragStream` consumption logic (the
READY gate, the H10 premature-close handling) is UNCHANGED; only the default client's
transport changes (§5.2).

### 5.2 The fetch-based SSE client surface

**The `SseClient` interface (UNCHANGED — pinned):**

```ts
export interface SseClient {
  subscribe(
    url: string,
    handlers: {
      onEvent: (event: string, data: string) => void
      onError: (err: unknown) => void
      onClose: () => void
    },
  ): { close(): void }
}
```

**The fetch-based SSE client factory (pinned):** the module exports
`createSseClient(auth?: { token?: string }): SseClient` — the fetch-based SSE client
factory. The proxy's default is `opts.sse ?? createSseClient(auth)`. The
EventSource-based `defaultSseClient` constant is REMOVED (replaced by the factory —
the `SseClient` interface is unchanged, but the default implementation is now
fetch-based and captures the auth at construction).

```ts
/** Unit shell-integration §5.2 — the fetch-based SSE client factory. Sends the
 *  Authorization: Bearer header on the stream (when auth.token is set), does NOT
 *  auto-reconnect, and preserves the H10 premature-close semantics (a dropped
 *  connection before done → onError/onClose → EngineUnavailable, never a silent
 *  reconnect). The SseClient interface is unchanged. */
export function createSseClient(auth?: { token?: string }): SseClient
```

**`subscribe(url, handlers)` behavior (pinned):**

1. Creates an `AbortController`.
2. Issues `fetch(url, { method: 'GET', headers: { ...(auth?.token ? { authorization: `Bearer ${auth.token}` } : {}) }, signal: controller.signal })`. The SSE client sends the **`Authorization: Bearer <token>`** header on the stream when `auth.token` is set (the SSE-path auth — the token is NEVER in the URL). It sends **NO `content-type` header** (a GET stream needs none; it MUST NOT reuse the shared `headers(auth)` helper, which always adds `content-type` — the H1 adversarial finding, §3a).
3. **On a fetch rejection** (connection refused, etc.) → `handlers.onError(err)`.
4. **On a non-2xx response** (`res.ok === false`) → `handlers.onError(new Error('sse: non-2xx response'))`.
5. **On a successful response:** reads `res.body` as a stream, buffers the incoming text, splits on the SSE frame delimiter `\n\n`, and for each complete frame calls `parseSseFrame(frame)` (the existing pure parser from `engine-rag-store.ts`) → `handlers.onEvent(event, data)`. A **malformed frame** (parseSseFrame throws) → `handlers.onError(err)`.
6. **On the stream ending cleanly** (the body stream ends) → `handlers.onClose()`.
7. **On a mid-stream error** → `handlers.onError(err)`.
8. **`close()`** → `controller.abort()`; after `close()`, the client is torn down and fires NO further `onEvent`/`onError`/`onClose` callbacks (a consumer-initiated teardown is NOT an `onClose`).

**The no-reconnect contract (pinned):** the fetch-based client opens EXACTLY ONE
fetch and does NOT re-open on failure. A dropped connection is **terminal** — the
client fires `onError`/`onClose` exactly once and never re-opens. This is the
no-auto-reconnect contract (the `EventSource` auto-reconnect behavior is gone).

**The H10 premature-close semantics (amendment 3, pinned):** the fetch-based client
preserves the H10 no-reconnect contract. The proxy's `ragStream` `onClose` handler
(UNCHANGED) fires the H10 logic: a clean close is only one that follows a `done`
chunk; a dropped connection before `done` that fires `onClose` (rather than
`onError`) is a premature drop → `EngineUnavailable('connection-refused', 'sse
connection closed before done')`, never a clean end. The fetch-based client fires
`onClose` when the stream ends (so the proxy's H10 logic runs) and `onError` when the
fetch rejects or the stream errors (so the proxy's `onError` handler sets
`streamError = EngineUnavailable('connection-refused', 'sse transport error: …')`).
Either path surfaces `EngineUnavailable` — never a silent reconnect. **The H10
no-reconnect contract is tested against the fetch-based client** (the §5.7 P-SM-2
row + the §5.9 fail-states).

**The proxy consumption (pinned):** the GN proxy's `ragStream` uses
`sse = opts.sse ?? createSseClient(auth)`. The `buildStreamUrl` builds the URL with
the RAG query params (query, topK, mode, maxHops, expand, maxParentContext, filters)
— the Bearer token is sent via the header, NEVER in the URL. The `SseClient`
interface is unchanged, so the proxy's `ragStream` consumption logic (the READY
gate, the H10 premature-close handling) is UNCHANGED.

### 5.3 The bind/auth/TLS policy record

**The concrete bind/auth/TLS policy (pinned — the `ENGINE-TRANSPORT-POLICY`
DECIDED/ACTIVE decision row):**

**Bind policy (loopback-only, enforced at construction):**
- The engine's `baseUrl` MUST resolve to a loopback address. The loopback set is the
  `isLoopbackHost` superset (§5.1): `127.0.0.1`, `::1`, the IPv4-mapped IPv6 loopback
  forms (`::ffff:127.0.0.1`, `::ffff:127.x.y.z`, the hex `::ffff:7f00:1`), and
  `localhost` (the loopback alias — no DNS resolution at construction).
- `assertLoopback` is called at construction (synchronous, no network I/O). A
  non-loopback `baseUrl` throws at construction (`Error('${prefix}: baseUrl must be
  loopback')`).

**Auth policy (Bearer token on the `Authorization` header):**
- The `auth.token` is sent as `Authorization: Bearer <token>` on ALL request/response
  calls (via `headers(auth)`) AND on the SSE stream (via the fetch-based SSE client).
- The token is NEVER in the URL (the query params carry only the RAG query/filters,
  never the token).
- The token is GUI-only at the shell (blocked from MCP access — the A7 carve-out).

**TLS policy (`auth.tls` applied via the shared https-agent-backed fetch):**
- `auth.tls` (`{ca, cert, key}`) is applied via `createEngineFetch(auth)` — the
  undici `dispatcher` (an `Agent` with `connect: { ca, cert, key }`).
- The TLS options are GUI-only at the shell (blocked from MCP access).

**The GUI-only carve-out (pinned):**
- Engine credentials (the `auth.token` bearer + the TLS `ca`/`cert`/`key`) are
  GUI-only at the shell, blocked from MCP access. No `gnosis.*` MCP tool
  `inputSchema` accepts a credential arg (no `token`/`tls`/`ca`/`cert`/`key`/`apiKey`).
- `baseUrl` is NOT a credential (env/CLI config — the `resolveEngineBaseUrl()` seam).

**The policy-record consistency (pinned):** the policy record is consistent with the
module surface — the loopback-only bind (enforced by `assertLoopback`), the
Bearer-on-header auth (enforced by `headers`/`createSseClient`), the TLS-via-
dispatcher application (enforced by `createEngineFetch`), and the GUI-only carve-out
(no MCP credential args) are all consistent with the exported surface (§5.7 P-IM-3).

### 5.4 The D2-fallback clarification

**The document-CRUD surface (pinned):** the document-CRUD surface (the A1/A2
document/wiki tools + the GUI document-editor/wiki screens) surfaces
`EngineUnavailable` (503) when the engine is absent. It does **NOT** fall back to
the local store — the data models differ (the engine's document store vs the local
`RagStore` RagNode/RagEdge graph). A fallback would be a second editor / a sync
(GNOSIS-SUPPLANTS-DOCUMENT-STORE, consumed).

**The local `rag.*` surface (pinned):** the local `rag.*` surface (the
`createJsonRagStore` RagNode/RagEdge graph) is the **parallel D2 fallback** for the
shell's local graph/cross-link features, which continue to work without the engine
(gnosis.md §4.6.2). It is NOT a fallback for the document store.

**The distinction (pinned):** the document-CRUD surface and the local `rag.*`
surface are **distinct surfaces with distinct data models**. The document-CRUD
surface is the PRIMARY document surface over the engine (surfaces `EngineUnavailable`
when the engine is absent); the local `rag.*` surface is the parallel D2 fallback for
the shell's OTHER (non-document-CRUD) features. The two are never conflated (§5.7
P-SM-3).

### 5.5 The e2e transport test / live-battery revisit

**The parked live batteries (pinned):** the parked live batteries (P2 M1-M20, A2, GN,
GN-MCP-UI) are **extended** for the **document-CRUD live round-trips**. The revisit
condition (the park ends when): the `gnosis-server` binary crate exists and builds, a
live Gnosis engine runs behind it, and the server serves the F2 wire contract + the
document-CRUD endpoints on loopback (`127.0.0.1`). The live check that ends the park:
`curl http://127.0.0.1:<port>/engine/status` returns a `HealthReport` JSON AND `POST
/rag/query` returns a V-5-style envelope AND the document-CRUD endpoints respond.

**The battery extension (pinned):** the extended battery adds the document-CRUD live
round-trips over a real transport: `createDocument`/`getDocument`/`updateDocument`/
`deleteDocument`/`publishDocument`/`unpublishDocument`/`archiveDocument`/
`listDocuments`/`createWiki`/`getWiki`/`listWikis` against the live `gnosis-server`
endpoints, plus the `EngineUnavailable`/`EngineError` split over a real transport
(connection-refused, engine-not-spawned, malformed frames, unknown
`schemaVersion`/`idFormat`).

**Opt-in + gated on the engine (pinned):** the e2e transport test is **opt-in** and
**gated on the engine** (the `gnosis-server` running on loopback + the app running).
It is non-deterministic in CI (a live engine is required), so it is NOT part of the
deterministic unit/props suite. A live result that CONTRADICTS the greens or this
spec is a finding (a regression or a doc/spec drift) — never a pass.

### 5.6 The three mandatory amendments (consolidated)

1. **`isLoopbackHost` superset reconciliation** — the shared module's `isLoopbackHost`
   is the union of both proxies' implementations (adding the hex `::ffff:7f00:1` form
   to `engine-rag-store.ts`); the GN loopback tests are re-verified (§5.1, §5.7
   P-IM-1).
2. **undici dependency scoping** — the TLS `dispatcher` dependency is justified and
   scoped (shell-side only; the engine lib stays at zero new runtime deps) (§5.1).
3. **SSE premature-close semantics** — the fetch-based client preserves the H10
   no-reconnect contract and is tested against it (§5.2, §5.7 P-SM-2).

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is mandatory. Rows are typed **P-IM**
(input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER F-rows, NEVER
§6/FS-n rows. **At most 8 rows.** Each row: id, the invariant it pins, the
generator/strategy that exercises it, and the deterministic pinned seed + attempt
budget (≤100 attempts/row, ≤400 total, stop-after-5). The register is genuinely
invariant-bearing (the `isLoopbackHost` superset totality; the `createEngineFetch`
TLS application; the SSE client's no-reconnect + Bearer-header + premature-close
semantics; the D2-fallback distinction; the policy-record consistency).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
|---|---|---|---|---|
| `P-IM-1` | IM | **The `isLoopbackHost` superset is total.** Every loopback form in the superset set (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`, `::ffff:127.x.y.z`, the hex `::ffff:7f00:1`, `localhost`) returns `true`; every generated non-loopback host (e.g. `192.168.1.1`, `10.0.0.1`, `example.com`, `::ffff:8.8.8.8`, `::ffff:7e00:1`) returns `false`. | `strat:loopback-superset-total` | ∀ `host ∈ {127.0.0.1, ::1, ::ffff:127.0.0.1, ::ffff:127.0.0.2, ::ffff:7f00:1, ::ffff:7f01:1, localhost}`: `isLoopbackHost(host) === true`; ∀ generated non-loopback `host` (incl. the hex 2-part `::ffff:7e00:1`, `::ffff:8000:1` — first 16 bits ≠ `0x7f`): `isLoopbackHost(host) === false`. |
| `P-IM-2` | IM | **`assertLoopback` enforces the loopback-only bind at construction.** A generated non-loopback `baseUrl` → `assertLoopback(baseUrl, prefix)` throws `Error('${prefix}: baseUrl must be loopback')`; a generated loopback `baseUrl` → `assertLoopback` returns without throwing. | `strat:loopback-assert` | ∀ generated non-loopback `baseUrl`: `assertLoopback(baseUrl, prefix)` throws `Error('${prefix}: baseUrl must be loopback')`; ∀ generated loopback `baseUrl`: `assertLoopback(baseUrl, prefix)` returns (no throw). |
| `P-IM-3` | IM | **The policy record is consistent with the module surface.** The loopback-only bind (enforced by `assertLoopback`), the Bearer-on-header auth (enforced by `headers`/`createSseClient`), the TLS-via-dispatcher application (enforced by `createEngineFetch`), and the GUI-only carve-out (no MCP credential args) are all consistent with the exported surface. | `strat:policy-record-consistent` | ∀ generated `auth` (with/without `token`/`tls`): `headers(auth)` carries the Bearer iff `auth.token` is set; `createEngineFetch(auth)` applies the dispatcher iff `auth.tls` is set; `assertLoopback` enforces loopback-only; no `gnosis.*` MCP tool `inputSchema` accepts a credential arg. |
| `P-SM-1` | SM | **The fetch-based SSE client sends the Bearer header on the stream and does NOT auto-reconnect.** When `auth.token` is set, the client's `subscribe` issues a fetch with `authorization: Bearer <token>`; a dropped connection is terminal (the client fires `onError`/`onClose` exactly once and never re-opens). | `strat:sse-no-reconnect-bearer` | ∀ generated `auth.token`: the client's `subscribe` fetch carries `authorization: Bearer <token>`; after a dropped connection, the client fires `onError`/`onClose` exactly once and issues NO further fetch. |
| `P-SM-2` | SM | **The SSE premature-close semantics (H10) are preserved.** A dropped connection before `done` → the proxy's `ragStream` surfaces `EngineUnavailable` (503, `cause:'connection-refused'`), never a silent reconnect or a clean end. | `strat:sse-premature-close` | ∀ generated premature-close (the stream ends before a `done` chunk): the `ragStream` iterable throws `EngineUnavailable` (503, `cause:'connection-refused'`); no partial result is committed; no reconnect is attempted. |
| `P-SM-3` | SM | **The D2-fallback distinction holds.** The document-CRUD surface surfaces `EngineUnavailable` (503) when the engine is absent; it does NOT fall back to the local `createJsonRagStore`. The local `rag.*` surface is the parallel D2 fallback for the shell's local graph/cross-link features. | `strat:d2-fallback-distinct` | ∀ generated engine-absent transport (connection-refused): the document-CRUD surface throws `EngineUnavailable` (503, `cause:'connection-refused'`); the local `rag.*` surface continues to work (no engine dependency). |
| `P-TP-1` | TP | **`createEngineFetch` applies `auth.tls` via the undici dispatcher.** When `auth.tls` is set, the returned fetch passes a `dispatcher` (an undici `Agent` with `connect: { ca, cert, key }`) to the underlying undici fetch; when `auth.tls` is NOT set, the returned fetch is `globalThis.fetch` (no dispatcher). | `strat:create-engine-fetch-tls` | ∀ generated `auth.tls` (with/without `ca`/`cert`/`key`, incl. the partial `{ca}`/`{cert}`/`{key}`/`{ca,cert}` forms and the empty `{tls:{}}` edge): `createEngineFetch(auth)` returns a fetch that passes a `dispatcher` with `connect` carrying exactly the present `ca`/`cert`/`key`; ∀ generated `auth` with NO `tls`: `createEngineFetch(auth) === globalThis.fetch`. |
| `P-TP-2` | TP | **`headers(auth)` applies the Bearer token on the `Authorization` header.** ∀ generated `auth.token`: `headers(auth)['authorization'] === 'Bearer <token>'` and `headers(auth)['content-type'] === 'application/json'`; when `auth.token` is absent, `headers(auth)` has NO `authorization` key. | `strat:headers-bearer` | ∀ generated `auth.token`: `headers(auth)['authorization'] === 'Bearer <token>'`; `headers(auth)['content-type'] === 'application/json'`; ∀ generated `auth` with NO `token`: `'authorization' in headers(auth) === false`. |

**Class tally:** IM ×3, SM ×3, TP ×2 = **8 rows ≤ 8** ✔.

**PBT-gate note (determinism/seeding):** the TestWriter's executed property layer
runs under the test runner with a **deterministic pinned seed** (`0x5E11E11E` — the
unit's mnemonic "SHELL"), **≤100 generated cases per register row**, **≤400 total
cases** across the unit's whole property layer, **stop-after-5** (report ≤5 distinct
held/broken counterexamples per row), and records each row as **held** or **broken**
together with its `Strategy-id`. The adversarial reviewer then reads this register
with the executed artifacts and performs a read-only PBT audit (per-row over-strength
reasoning, generator-coverage check, prose counterexamples, negative-generator
requests); reviewers never run generators. **LANDED: the executed property layer
(`tests/props-shell-integration.test.ts`) asserts all 8 register rows with the
negative-generator gaps closed per the §3a audit — all rows HELD.**

**Reserved-variant discipline applied.** The loopback host set and the `auth` shape
are **closed** — there are no reserved hosts/auth fields. The generator restriction
is **well-formedness on the transport side**: never generate a non-loopback host as a
"valid" input (that is the P-IM-1/P-IM-2 invariant, not a fail-state), never generate
a `createEngineFetch` TLS case that is not a real `auth.tls` (that is the P-TP-1
invariant), never generate a premature-close that is not a real dropped connection
(that is the P-SM-2 invariant), and never generate a non-`EngineUnavailable` transport
error (that is the proxy's own fail-state, Unit GN §5.9 — NOT an invariant row here).
The unit has **no** reserved fail-variant rows (no `FS-*` rows) by the invariant-only
rule.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`isLoopbackHost` superset happy:** every loopback form in the superset set
   (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`, `::ffff:127.0.0.2`, the hex `::ffff:7f00:1`,
   `localhost`) returns `true`.
2. **`assertLoopback` happy:** `assertLoopback('http://127.0.0.1:8080', 'engine rag
   store')` returns without throwing; `assertLoopback('http://[::1]:8080', 'engine
   crud rag store')` returns without throwing.
3. **`createEngineFetch` no-TLS happy:** `createEngineFetch({})` returns
   `globalThis.fetch` (no dispatcher).
4. **`createEngineFetch` TLS happy:** `createEngineFetch({ tls: { ca, cert, key } })`
   returns a fetch that passes a `dispatcher` (an undici `Agent` with `connect: { ca,
   cert, key }`) to the underlying undici fetch.
5. **`headers` with a token happy:** `headers({ token: 'abc' })` returns
   `{ 'content-type': 'application/json', authorization: 'Bearer abc' }`.
6. **`headers` without a token happy:** `headers({})` returns
   `{ 'content-type': 'application/json' }` with NO `authorization` key.
7. **`transportError` on `ECONNREFUSED` happy:** `transportError({ code:
   'ECONNREFUSED', message: 'x' })` returns `EngineUnavailable('connection-refused')`.
8. **`transportError` on `ENOTFOUND` happy:** `transportError({ code: 'ENOTFOUND',
   message: 'x' })` returns `EngineUnavailable('engine-not-spawned')`.
9. **`transportError` on an `EngineWireError` happy:** `transportError(err)` where
   `err instanceof EngineWireError` returns `err` unchanged.
10. **`fetchWithTimeout` happy:** `fetchWithTimeout(fetchImpl, url, init, 10_000)`
    resolves on a successful fetch (the timer is cleared).
11. **The fetch-based SSE client Bearer-header happy:** `createSseClient({ token:
    'abc' }).subscribe(url, handlers)` issues a fetch with `authorization: Bearer
    abc` on the stream.
12. **The fetch-based SSE client frame-dispatch happy:** the client reads
    `event: result\ndata: {"type":"result",…}\n\n` and dispatches `onEvent('result',
    '{"type":"result",…}')`.
13. **The fetch-based SSE client no-reconnect happy:** a dropped connection is
    terminal — the client fires `onError`/`onClose` exactly once and issues NO
    further fetch.
14. **The proxy's `ragStream` premature-close happy (H10):** a dropped connection
    before `done` → the `ragStream` iterable throws `EngineUnavailable` (503,
    `cause:'connection-refused'`), never a silent reconnect or a clean end.
15. **The document-CRUD surface engine-absent happy:** the document-CRUD surface
    surfaces `EngineUnavailable` (503) when the engine is absent (no local-store
    fallback).
16. **The local `rag.*` surface D2-fallback happy:** the local `rag.*` surface (the
    `createJsonRagStore` RagNode/RagEdge graph) continues to work without the engine
    (the parallel D2 fallback for the shell's local graph/cross-link features).
17. **The policy-record consistency happy:** the bind/auth/TLS policy record is
    consistent with the module surface (loopback-only bind, Bearer-on-header auth,
    TLS-via-dispatcher, GUI-only carve-out).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`assertLoopback` on a non-loopback `baseUrl`** → throws
   `Error('${prefix}: baseUrl must be loopback')` (e.g. `assertLoopback('http://192.168.1.1:8080', 'engine rag store')` → `Error('engine rag store: baseUrl must be loopback')`).
2. **`assertLoopback` on an unparseable `baseUrl`** → throws
   `Error('${prefix}: baseUrl must be loopback')` (the `new URL(baseUrl)` throws).
3. **`transportError` on an unknown transport error** → returns
   `EngineWireError('engine_unavailable', 503, String(err))` (a typed `EngineWireError`
   on any fail-state, never a raw `Error` — H6).
4. **`fetchWithTimeout` on a timeout** → throws
   `EngineUnavailable('connection-refused', 'request timed out after ${requestTimeoutMs}ms')`
   (never a raw `AbortError`).
5. **`fetchWithTimeout` on a connection-refused** → throws
   `EngineUnavailable('connection-refused')` (via `transportError`).
6. **The fetch-based SSE client on a fetch rejection** → `onError(err)` (e.g. a
   connection-refused at open).
7. **The fetch-based SSE client on a non-2xx response** → `onError(new Error('sse:
   non-2xx response'))`.
8. **The fetch-based SSE client on a malformed SSE frame** → `onError(err)` (the
   `parseSseFrame` throw).
9. **The fetch-based SSE client on a mid-stream error** → `onError(err)`.
10. **The fetch-based SSE client after `close()`** → fires NO further
    `onEvent`/`onError`/`onClose` callbacks (a consumer-initiated teardown is NOT an
    `onClose`).
11. **The proxy's `ragStream` on a premature close before `done` (H10)** → the
    iterable throws `EngineUnavailable` (503, `cause:'connection-refused'`); no
    partial result is committed; no reconnect is attempted.
12. **The document-CRUD surface on engine-absent** → surfaces `EngineUnavailable`
    (503); it does NOT fall back to the local `createJsonRagStore` (the data models
    differ — no second editor, no sync).
13. **The GN factory on a non-loopback `baseUrl`** → throws
    `Error('engine rag store: baseUrl must be loopback')` (the byte-pinned message
    preserved via the shared `assertLoopback`).
14. **The CRUD factory on a non-loopback `baseUrl`** → throws
    `Error('engine crud rag store: baseUrl must be loopback')` (the byte-pinned
    message preserved via the shared `assertLoopback`).

**Pinned non-throws / type-level guarantees:**

- The `opts.fetch` injectable seam stays as the test seam — when `opts.fetch` is
  provided, it wins; `createEngineFetch(auth)` is only the default.
- The `SseClient` interface is UNCHANGED; the proxy's `ragStream` consumption logic
  (the READY gate, the H10 premature-close handling) is UNCHANGED.
- The Bearer token is NEVER in the URL (the query params carry only the RAG
  query/filters, never the token).
- The `isLoopbackHost` superset is a strict superset of both proxies' prior
  implementations — no previously-valid loopback `baseUrl` is rejected.
- The document-CRUD surface does NOT fall back to the local `createJsonRagStore`
  (H1 — no second editor, no sync); the local `rag.*` surface is the parallel D2
  fallback for the shell's OTHER document features.
- The SSE GET stream sends NO `content-type` header (§5.2 — the H1 adversarial fix).

### 5.10 Census / numeric claims

- **New module:** **1** (`src/main/engine-transport.ts`).
- **Extracted transport helpers:** **5** (`isLoopbackHost`, `assertLoopback`,
  `transportError`, `fetchWithTimeout`, `headers`).
- **New function:** **1** (`createEngineFetch(auth)`).
- **New SSE client factory:** **1** (`createSseClient(auth)`).
- **`SseClient` interface changes:** **0** (unchanged).
- **`isLoopbackHost` superset delta:** the hex `::ffff:7f00:1` form is added to
  `engine-rag-store.ts` (the CRUD proxy already has it); the shared module is the
  union.
- **undici dependency:** **1** new shell-side runtime dep (`undici`); the engine lib
  stays at **0** new runtime deps.
- **Proxies consuming the shared module:** **2** (`engine-rag-store.ts`,
  `engine-crud-rag-store.ts`).
- **`opts.fetch` injectable seam:** **unchanged** (stays as the test seam).
- **PBT register:** **8 rows** (IM ×3, SM ×3, TP ×2), ≤100 attempts/row, ≤400 total,
  stop-after-5, deterministic pinned seed `0x5E11E11E`.
- **LANDED test census:** `tests/unit-shell-integration.test.ts` **42 pass + 1
  skipped** (the e2e descriptor — opt-in + gated on the engine);
  `tests/props-shell-integration.test.ts` **8 pass** (the §5.7 register — all rows
  HELD); `tests/blind-unit-shell-integration-greens.test.ts` **44 pass + 1 skipped**
  (the blind greens; the e2e block opt-in + gated on the engine). The skipped blocks
  in both files are NOT part of the deterministic unit/props suite.
- **Live-battery extension:** the parked live batteries (P2 M1-M20, A2, GN,
  GN-MCP-UI) are extended for the document-CRUD live round-trips (the 11 §4.1
  document/wiki methods over a real transport); opt-in + gated on the engine.

### 5.11 Cross-references

- **The proposal-review record (the approved re-scope + the three mandatory
  amendments):** `docs/specs/shell-integration-review.md` — the verdict (REJECT the
  full 7-item unit; PROCEED-WITH-AMENDMENTS with the re-scoped Option B), the five
  deliverables, the three mandatory amendments, the residual risk.
- **The roadmap (the MVP scope + the D2 fallback):**
  `docs/specs/unblock-gnosis-remaining-endpoints.md` — §6.2 (A2), §7.2 (auth/TLS),
  §7.3 (D2 engine-absent), §7.4 (the live-scenario battery), §8 (the execution
  order), §11 (cross-refs).
- **The GN proxy (the retrieval-trio proxy):** `docs/specs/unit-gn-engine-integration.md`
  — §5.1 (the factory + the 5-method proxy surface), §5.4 (the §11 map + the
  wire-code → typed-error translation), §5.5 (the SSE client / `ragStream`), §5.6
  (READY observation + D2 engine-absent), §5.9 (the fail-states). The implementation:
  `src/main/engine-rag-store.ts`.
- **The A1 proxy (the document-CRUD proxy):** `docs/specs/unit-a1-crud-routing-proxy.md`
  — §5.1 (the factory + the 11-method proxy surface), §5.4 (RBAC caller threading),
  §5.6 (READY observation + D2 engine-absent). The implementation:
  `src/main/engine-crud-rag-store.ts`.
- **The A2 wiring (the document-CRUD D4 wiring):** `docs/specs/unit-a2-document-crud-wiring.md`
  — §5.2 (the `gnosis-edit` group + the A7 security carve-out), §5.6 (D2 engine-absent
  + H1 store authority), §5.7 (the PBT register format), §5.8/§5.9 (happy/fail
  states), §5.10 (census), §5.11 (cross-refs).
- **The local `RagStore` (the D2 fallback):** `src/main/rag-store.ts` — the
  `RagStore` interface (the RagNode/RagEdge graph model, ~22 methods), the
  `createJsonRagStore` factory.
- **The live-pending battery (the parked live battery):**
  `docs/specs/unit-gn-engine-integration-live-pending-battery.md` — the revisit
  condition (the `gnosis-server` binary crate + a live engine + the F2 wire contract
  on loopback), the parked-scenario census (32 of 63 rows parked).
- **The behavior contract:** `../Gnosis/docs/specs/gnosis.md` — §4.6.2 (no engine
  MCP/GUI; the "engine is optional" framing), §6 (FS-1..FS-26).
- **The wire contract:** `../Gnosis/docs/specs/engine-wire-contract.md` — §4–§12 (the
  F2 wire + golden vectors + §11 map), §14 (the later-units ownership list).
- **The decision rows to add when the unit lands:** `docs/decisions.md` —
  **ENGINE-TRANSPORT-SHARED-MODULE**, **ENGINE-TLS-UNDICI**, **ENGINE-SSE-FETCH-CLIENT**,
  **ENGINE-TRANSPORT-POLICY** (DECIDED/ACTIVE); consumed **TRANSPORT-HTTP-SSE-LOOPBACK**,
  **ASSERT-LOOPBACK-INTERNAL** (UPDATED — the helper is now exported from
  `engine-transport.ts`), **TRANSPORT-CAUSE-MAPPING**, **GNOSIS-SUPPLANTS-DOCUMENT-STORE**,
  **GNOSIS-D2-ENGINE-ABSENT**, **GNOSIS-SECURITY-CARVE-OUT**, **GNOSIS-CRUD-MVP-SCOPE**.

## 6. Test plan (the red set the TestWriter will write)

> **LANDED note:** this red set has been written and turned green. The executed test
> census is: `tests/unit-shell-integration.test.ts` **42 pass + 1 skipped**,
> `tests/props-shell-integration.test.ts` **8 pass** (the §5.7 register — all rows
> HELD), `tests/blind-unit-shell-integration-greens.test.ts` **44 pass + 1 skipped**.
> The adversarial regressions H1/H2/H3 and the PBT negative-generator additions are
> recorded in §3a; there are **no package findings** (§3b).

The TestWriter writes the red set for the shared transport module + the fetch-based
SSE client + the policy record + the D2-fallback clarification from §5.8/§5.9, and
asserts the PBT register (§5.7) holds. The red set (recorded in the next-steps DONE
row for this unit):

- **The `engine-transport.ts` module surface:** the happy states 1–10 + the fail-states
  1–5, 13, 14 (the `isLoopbackHost` superset totality; `assertLoopback` enforcement;
  `createEngineFetch` TLS application; `headers` Bearer application; `transportError`
  cause mapping; `fetchWithTimeout` timeout/refused).
- **The fetch-based SSE client:** the happy states 11–14 + the fail-states 6–11 (the
  Bearer header on the stream; the frame dispatch; the no-reconnect contract; the H10
  premature-close semantics; the `close()` teardown).
- **The bind/auth/TLS policy record:** the happy state 17 + the PBT register P-IM-3
  (the policy record is consistent with the module surface).
- **The D2-fallback clarification:** the happy states 15, 16 + the fail-state 12 +
  the PBT register P-SM-3 (the document-CRUD surface surfaces `EngineUnavailable`; the
  local `rag.*` surface is the parallel D2 fallback).
- **The PBT register (§5.7):** the 8 invariant rows (deterministic pinned seed
  `0x5E11E11E`, ≤100 attempts/row, ≤400 total, stop-after-5).
- **The e2e transport test / live-battery revisit:** opt-in + gated on the engine
  (the `gnosis-server` running on loopback + the app running); NOT part of the
  deterministic unit/props suite.

## 7. What the spec does NOT do (constraints honored)

- This is a **TDD unit spec** — it includes the §5.x Property register (PBT gate) but
  does **NOT** author the property tests (the TestWriter does) and does **NOT** author
  implementation.
- It does **NOT** touch `src/` or `tests/` in the Astrographer repo — it writes
  **only** the staged spec file (the orchestrator copies it to the Astrographer repo).
- It does **NOT** change the `SseClient` interface, the §11 HTTP-status map, or the
  error model.
- It does **NOT** change the frozen document-CRUD wire shapes (P1a) or the server host
  (P2, landed).
- It does **NOT** re-implement the RBAC **enforcement** semantics (the engine is the
  enforcer).
- It does **NOT** author the graph/fact/consistency/RAG-companion surfaces (A3–A5,
  P1b–P1e — deferred follow-ons) or the live-scenario battery (a separate artifact,
  opt-in + gated on the engine).
- It does **NOT** update `docs/skills/designing-pages.md` (the file does not exist in
  this repo — the `docs/skills/` directory is EMPTY) and does **NOT** touch a
  test-use-case coverage matrix / demo-page index (the sibling convention).
