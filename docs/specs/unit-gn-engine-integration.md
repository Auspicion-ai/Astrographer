# Spec — Unit GN: Gnosis Engine Integration — the `createEngineRagStore` Proxy (Retrieval Trio + Health Wire Client)

- **Status:** SPEC — **LANDED (2026-09-10)** — the shell-side Gnosis-engine wire
  client, scoped per the proposal gate Architecture A1. Proposal gate: the
  implementation guide
  `../Gnosis/docs/integrations/astrographer-interface-implementation.md`
  (PASS — scoped deliverable = the **retrieval trio + health** wire client;
  full `RagStore` CRUD routing, the server-host binary crate, and CRUD wire
  shapes are **deferred** — see §4.6/§10.4 of the guide). **LANDED:** the
  `createEngineRagStore` proxy + the decode/SSE/status helpers in
  `src/main/engine-rag-store.ts` — **70/70 unit** (`tests/unit-gn-engine-integration.test.ts`),
  **63/63 blind-greens** (`tests/blind-unit-gn-engine-integration-greens.test.ts`),
  trio **2958 pass / 41 skip**, typecheck + build clean; the RCA-3 adversarial
  findings H1–H14 are recorded in §3a (all HOST, fixed + regression-tested; H11
  PARTIAL — a documented loopback-localhost limitation; H13/H14 INFO doc-only);
  the live-scenario battery is PARKED (see
  `docs/specs/unit-gn-engine-integration-live-pending-battery.md` + the
  `docs/pending.md` DEFERRED row). Decisions consumed: **F2-WIRE-CONTRACT-A1** (the
  wire contract, `../Gnosis/docs/specs/engine-wire-contract.md`), the §11
  HTTP-status map (incl. the **mandated** `ConflictError` = **409**, FS-4),
  decode-then-validate §7 (FS-9/FS-10), the golden vectors **V-1..V-9** (the
  byte-exact conformance target), and the D2 engine-absent framing (engine-absent
  = **UNAVAILABLE**; the shell's local-first store is the D2 "document store works
  without the engine" claim, NOT the engine's `RagStore` persistence).
- **Scope:** a NEW shell-side module `src/main/engine-rag-store.ts` — the
  HTTP/SSE **wire client** that proxies the Gnosis engine's retrieval surface
  over the F2 wire contract. It implements the **retrieval trio + health**
  (`ragQuery`/`ragStream`/`getEngineStatus` + `health`), **decode-then-validate**
  (so `EngineError`/`TraceUnavailable` are real transport outcomes), the
  **HTTP-status rendering** of the §11 map (all 21 rows, incl. `ConflictError`=
  409), the **SSE client** for `ragStream` (single-event frames:
  `result`/`done`/`error`), **READY observation** via `getEngineStatus` (the
  shell observes READY, it does not drive engine-internal boot), **D2
  engine-absent = UNAVAILABLE** behavior (connection-refused →
  `EngineUnavailable`), **loopback + auth/TLS** policy, and the **end-to-end
  transport test** confirming the `EngineUnavailable`/`EngineError` split.
  **Explicitly OUT of scope (deferred):** full `RagStore` CRUD routing, the
  server-host binary crate, and CRUD wire shapes. The wire surface is the
  retrieval trio + health ONLY.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/engine-rag-store.ts`
  from §5.8/§5.9 before any implementation, and asserts the golden-vector
  conformance (§5.2) + the PBT register (§5.7) hold.

---

## 1. What the proposal asks

Gnosis is a **pure headless backend** — no MCP surface, no GUI surface (§4.6.2
of `../Gnosis/docs/specs/gnosis.md`; the guide's §1 makes the same claim). The
Astrographer Electron shell provides the GUI + MCP surfaces
that **proxy** Gnosis's API. The engine runs as a **separate process** (the
multithread-capable Rust engine); the shell talks to it over **HTTP/REST + SSE
over loopback** (the recommended transport, §2 of the guide). The shell's
`createEngineRagStore` proxy (generalizing Incanter's `createRemoteRagStore`) is
the **client**: it issues REST calls for the retrieval surface and subscribes to
SSE for `ragStream`.

The scoped deliverable (Architecture A1) is the **retrieval trio + health** wire
client:

1. **The wire client** — reproduce the envelope, chunk JSON, error JSON, SSE
   frame, and health report shapes exactly (the golden vectors V-1..V-9 are the
   byte-exact conformance reference).
2. **decode-then-validate** — so `EngineError`/`TraceUnavailable` are real
   transport outcomes, not silent deserialization gaps.
3. **HTTP-status rendering** of the §11 map (all 21 rows, incl. the **mandated**
   `ConflictError` = **409**).
4. **The SSE client** for `ragStream` — subscribe, parse the single-event
   frames, surface `result`/`done`/`error`.
5. **READY observation** via `getEngineStatus` — poll/subscribe on `state` +
   `subsystems`; gate RAG calls on `state == Ready`. (The engine's own boot
   wiring is engine-internal; the shell does not drive it.)
6. **D2 engine-absent = UNAVAILABLE** — connection-refused →
   `EngineUnavailable`; the shell's local-first store + cross-link features work
   without the engine; engine-backed RAG + engine document-store features surface
   `EngineUnavailable`.
7. **loopback + auth/TLS** policy — bind to loopback, own credentials.
8. **The end-to-end transport test** — confirm the
   `EngineUnavailable`/`EngineError` split matches the real transport's failure
   modes (connection-refused, malformed frames, unknown `schemaVersion`/
   `idFormat`, mid-stream cancel).

**Explicitly OUT of scope (deferred):** full `RagStore` CRUD routing, the
server-host binary crate, and CRUD wire shapes. The wire surface is the
retrieval trio + health ONLY.

## 2. Feasibility verdict

**Feasible — a pure shell-side HTTP/SSE client over a frozen wire contract; no
engine/foundation gap.**

- **The wire shapes are frozen.** The envelope, chunk JSON, error JSON, SSE
  frame, and health report are pinned byte-exactly in
  `../Gnosis/docs/specs/engine-wire-contract.md` §4–§12 (golden vectors V-1..V-9).
  The shell reproduces them; there is no shape ambiguity to resolve.
- **The HTTP-status map is frozen.** All 21 rows (§11) are documented; the shell
  renders them deterministically. `ConflictError` = **409** is mandated (FS-4).
- **decode-then-validate is a pure decoder concern.** The precedence
  (trace-key-presence checked FIRST) is pinned in the wire contract §7/§12 V-9;
  the shell's decoder reproduces it.
- **The transport is the shell's decision.** HTTP/REST + SSE over loopback is
  recommended (§2 of the guide) and is what this spec pins. The server host is a
  separate thin binary crate in the Gnosis workspace (deferred — out of scope);
  the shell does not host the Rust server.
- **No engine/foundation gap.** The proxy is project-specific shell code
  (`src/main/engine-rag-store.ts`). It composes the standard `fetch`/SSE
  primitives. The engine's boot→READY lifecycle is engine-internal; the shell
  only observes it via `getEngineStatus`.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The HTTP/SSE wire client (`createEngineRagStore`) | Project-specific (shell-side; Gnosis ships the codecs + engine, not the HTTP server/client) | Medium cost; the proxy seam (§5.1 of `docs/specs/gnosis.md`) — the shell's only surface to the engine. |
| decode-then-validate in the shell decoder | Project-specific (reproduces the wire contract §7) | Low cost; makes `EngineError`/`TraceUnavailable` real transport outcomes. |
| The HTTP-status rendering (21 rows) | Project-specific (the shell renders the §11 map) | Low cost; the deterministic wire-code → typed-error translation the GUI/MCP surfaces present. |
| The SSE client for `ragStream` | Project-specific (single-event frames) | Low cost; the streaming retrieval surface. |
| READY observation + D2 engine-absent behavior | Project-specific (the shell observes READY, degrades gracefully) | Low cost; the D2 optional-engine contract. |
| loopback + auth/TLS policy | Project-specific (shell-owned, D4 carve-out) | Low cost; the security surface. |
| The end-to-end transport test | Project-specific (the §7.2 F2 benefit) | Medium cost; confirms the `EngineUnavailable`/`EngineError` split against the real transport's failure modes. |

No engine gap. The engine's `RagStore` persistence and RAG features are
engine-side and unavailable when the engine is absent (D2 — engine-absent =
UNAVAILABLE); the D2 "document store works without the engine" claim refers to
the **shell's own local-first store** (`createJsonRagStore`, Unit A), NOT the
engine's `RagStore` persistence. The server-host binary crate is deferred (out of
scope); the shell does not host the Rust server.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

**Adversarial findings (RCA-3 — all HOST, fixed + regression-tested):**

- **H1 [MAJOR]:** malformed inputs produced raw `TypeError`s instead of the
  pinned `EngineError` — graph trace entries missing `from`/`to`, null/non-object
  results, non-2-tuple citations, non-array `blocked_by`, non-string `source`.
  **FIXED:** the decoder now routes every such malformed input to the pinned
  `EngineError` (502). Regression-tested (H1).
- **H2 [MAJOR]:** enum values were not validated — `results[].source`, trace
  `source`/`mode`, graph `edge`/`state`, and the hybrid `legs`. **FIXED:** an
  invalid enum value → `EngineError` (502). Regression-tested (H2).
- **H3 [MAJOR]:** `defaultSseClient` was broken for the wire's named events — it
  used `onmessage` instead of named listeners. **FIXED:** it now registers the
  `result`/`done`/`error` named listeners. Regression-tested (H3).
- **H4 [MAJOR]:** `requestTimeoutMs` was a no-op. **FIXED:** `fetchWithTimeout`
  via `AbortController`, default `10_000` ms; a timeout → `EngineUnavailable`
  (503). Regression-tested (H4).
- **H5 [MINOR]:** `auth.tls` options were ignored. **FIXED:** documented as
  accepted-but-not-yet-applied — standard `fetch` cannot take a custom CA without
  an `https` agent. Regression-tested (H5).
- **H6 [MINOR]:** `transportError` only mapped `ECONNREFUSED`/`ENOTFOUND`.
  **FIXED:** any transport failure → the typed `EngineWireError`. Regression-tested
  (H6).
- **H7 [MINOR]:** `decodeHealthReport` did not validate `schemaVersion`/`idFormat`.
  **FIXED:** a malformed report → `EngineError` (502). Regression-tested (H7).
- **H8 [MINOR]:** `decodeChunk` accepted a `done` chunk with extra payload.
  **FIXED:** only the exact `{"type":"done"}` is accepted. Regression-tested (H8).
- **H9 [MINOR]:** `ragStream` opened the SSE connection before the READY gate
  resolved. **FIXED:** the gate precedes proceeding; on gate failure the SSE
  connection is torn down and the typed gate error surfaces; the synchronous
  subscription is kept per §5.8-4. Regression-tested (H9).
- **H10 [MINOR]:** `ragStream` `onClose` treated any close as clean. **FIXED:**
  it tracks `doneReceived`; a close before `done` → `EngineUnavailable` (503).
  Regression-tested (H10).
- **H11 [MINOR]:** the loopback check accepted `localhost` unconditionally.
  **PARTIAL:** it now recognizes IPv4-mapped IPv6; `localhost` remains accepted
  per §5.8-14 with a documented limitation — sync DNS resolution is not feasible
  in the sync factory. Regression-tested (H11).
- **H12 [MINOR]:** `ragQuery` silently dropped an undefined query. **FIXED:** a
  non-string query → `EngineError` (502). Regression-tested (H12).
- **H13 [INFO]:** the `decodeError` doc said "Throws" but it returns. **FIXED:**
  doc aligned (code unchanged).
- **H14 [INFO]:** spec §5.2 `blocked_by` transform wording drift — it said
  lowercase, but the target is uppercase `'BROKEN'`/`'STALE'`. **FIXED:** spec
  wording corrected (code unchanged).

**PBT audit (read-only, §5.7 register):**

- No row over-strength.
- **P-SM-2 and P-TP-2** had hollow (dead) `runProperty` generators → **FIXED**
  (generators made real; explicit loops retained as guaranteed coverage).
- **P-IM-4 and P-SM-1** lacked negative generators → **ADDED** (malformed-frame
  rejection for P-IM-4; invented/dropped `lastError` rejection for P-SM-1).
- **P-SM-1** negative generator surfaced a test conflict — the Degraded gate
  tests used an invalid Degraded report with `null` `lastError` → **RESOLVED**
  (gate tests updated to use a valid Degraded report with non-null `lastError`).

### 3b. Package findings register (provident-ssr / Gnosis — recorded, never patched)

> Package/upstream findings from the post-green adversarial pass are recorded
> here and routed to `docs/defects.md` + `docs/HANDOFF.md` (never patched in
> this repo — the package code is upstream-owned).

- **NONE.** No defect found in the `provident-ssr` package or the Gnosis wire
  contract.

## 4. Design decisions pinned by this spec

- **ENGINE-WIRE-CLIENT (new):** the shell's Gnosis-engine access is a NEW
  module `src/main/engine-rag-store.ts` exporting the factory
  `createEngineRagStore(opts)` returning the retrieval-trio + health proxy
  surface. It generalizes Incanter's `createRemoteRagStore` (the pending
  `docs/pending.md` "remote RAG store" row) but is a **distinct surface** from
  the Astrographer `RagStore` interface (Unit A §5.4 — a node/edge CRUD store).
  The proxy is the retrieval trio + health ONLY; it does NOT implement the
  `RagStore` CRUD interface.
- **TRANSPORT-HTTP-SSE-LOOPBACK (new):** the transport is HTTP/REST + SSE over
  loopback (`127.0.0.1`). The proxy issues REST calls for `ragQuery`/
  `getEngineStatus`/`health` and subscribes to SSE for `ragStream`. The endpoint
  paths are pinned as constants (§5.1). The server host is a separate thin
  binary crate in the Gnosis workspace (deferred — out of scope).
- **DECODE-THEN-VALIDATE (consumed):** the proxy's decoder reproduces the wire
  contract §7: a malformed body → `EngineError`; a well-formed body missing
  `trace` → `TraceUnavailable`; `engine == "gnosis"`; `blocked_by ⇒
  RagTrace::Graph`. The trace-key-presence precedence (checked FIRST) is pinned
  (§5.3).
- **HTTP-STATUS-RENDERING (consumed):** the proxy renders the §11 map (all 21
  rows) deterministically; `ConflictError` = **409** is mandated (FS-4). The
  wire-code → typed-error translation is a pure, total function over the 21
  codes; an unknown code → `EngineError` (502).
- **SSE-SINGLE-SHOT (consumed):** `ragStream` is single-shot — at most one
  `result`/`error` then `done`. The proxy's SSE client parses single-event
  frames (`event: <type>\ndata: <json>\n\n`), enforces the event/data type
  match, and surfaces `result`/`done`/`error`. A partial frame or a dropped
  connection before `done` is a transport failure → `EngineUnavailable`/
  `EngineError`; no partial result is committed.
- **READY-OBSERVATION (new):** the shell observes the engine boot→READY
  lifecycle via `getEngineStatus` (the `state` + `subsystems` flags) and gates
  RAG calls on `state == Ready`. The proxy exposes `getEngineStatus`/`health`
  and a `waitForReady()` helper. The shell does NOT drive engine-internal boot.
- **D2-ENGINE-ABSENT-UNAVAILABLE (consumed):** engine-absent = UNAVAILABLE.
  Connection-refused and engine-not-spawned both map to `EngineUnavailable`
  (503) but are distinct shell-side paths (the proxy distinguishes them for
  diagnostics). DEGRADED is a distinct state (engine running, a non-core
  subsystem down); the proxy reports it faithfully. The shell's local-first
  store + cross-link features work without the engine; engine-backed RAG +
  engine document-store features surface `EngineUnavailable`.
- **LOOPBACK-AUTH-TLS (consumed):** the wire is loopback-only by contract. The
  proxy enforces a loopback `baseUrl` (throws at construction on a non-loopback
  address) and owns auth/TLS (the D4 security-configuration carve-out — engine
  credentials, TLS/secret management are GUI-only at the shell). The proxy is
  the only surface; the engine is never exposed as an unauthenticated public
  API.

## 5. The exhaustive contract

### 5.1 The factory + the proxy surface (`src/main/engine-rag-store.ts`)

```ts
// src/main/engine-rag-store.ts (NEW — the shell-side wire client)

/** The engine's bind address — LOOPBACK-ONLY by contract (§8 of the guide). */
export interface EngineRagStoreOptions {
  /** The engine's base URL, e.g. `http://127.0.0.1:PORT`. MUST resolve to a
   *  loopback address (127.0.0.1 or ::1). A non-loopback baseUrl throws at
   *  construction (LOOPBACK-AUTH-TLS). */
  baseUrl: string
  /** Per-request timeout in ms (default 10_000). */
  requestTimeoutMs?: number
  /** READY-poll interval in ms (default 500). */
  readyPollIntervalMs?: number
  /** Max READY-poll attempts before EngineUnavailable (default 60). */
  readyPollMaxAttempts?: number
  /** Shell-owned auth/TLS (D4 carve-out). */
  auth?: {
    /** Bearer token sent as `Authorization: Bearer <token>`. */
    token?: string
    /** TLS options (ca/cert/key) for the loopback connection. */
    tls?: { ca?: string; cert?: string; key?: string }
  }
  /** Injectable HTTP client (default global fetch). */
  fetch?: typeof fetch
  /** Injectable SSE client (default a built-in EventSource-based client). */
  sse?: SseClient
}

/** The retrieval-trio query options (proxy-specific — mirrors the Astrographer
 *  ragQuery opts but passes through the engine's FULL mode set, incl. the
 *  vector/hybrid modes the Astrographer `RagQueryOptions` does not carry). */
export interface EngineRagQueryOptions {
  topK?: number
  mode?: 'flat' | 'graph' | 'vector' | 'hybrid'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
  filters?: RagQueryFilters
}

**`RagQueryFilters` provenance (pinned):** `filters?: RagQueryFilters` uses the
`RagQueryFilters` type **imported from `src/main/retrieval.ts`** (Unit X §5.2) —
it is NOT a new type defined in this unit. The proxy reuses the existing
Astrographer filter shape (the `filters` object is serialized as a single
URL-encoded-JSON query param — §5.5). See the §5.10 census for the import
source.

/** The proxy surface — the retrieval trio + health + READY observation. */
export interface EngineRagStore {
  /** Issue a REST `ragQuery`. Decodes the envelope, decode-then-validates,
   *  maps the wire body to the proxy-specific `EngineRagResult` shape, and
   *  returns it. Throws a typed EngineWireError on any fail-state. ASYNC. */
  ragQuery(query: string, opts?: EngineRagQueryOptions): Promise<EngineRagResult>
  /** Subscribe to the SSE `ragStream`. Yields the single-shot chunks
   *  (result/done/error). ASYNC ITERABLE. */
  ragStream(query: string, opts?: EngineRagQueryOptions): AsyncIterable<RagChunk>
  /** Issue a REST `getEngineStatus`. Returns the HealthReport (the wire shape
   *  from §3.5 of the guide / §9 of the wire contract). ASYNC. */
  getEngineStatus(): Promise<HealthReport>
  /** Convenience alias for `getEngineStatus()` — returns the SAME HealthReport. */
  health(): Promise<HealthReport>
  /** Poll `getEngineStatus` until `state == Ready`, or throw EngineUnavailable
   *  after `maxAttempts` / on an `Unavailable` state. ASYNC. */
  waitForReady(opts?: { pollIntervalMs?: number; maxAttempts?: number }): Promise<HealthReport>
}

/** The versioned envelope (the wire shape §3.1 of the guide / §4.1 of the wire
 *  contract). `payload` is the canonical chunk/result/error JSON. */
export interface Envelope {
  schemaVersion: number
  idFormat: string
  payload: unknown
}

/** The canonical chunk (the wire shape §3.2 of the guide / §4.2 of the wire
 *  contract). A `result` chunk carries the proxy-specific `EngineRagResult`. */
export type RagChunk =
  | { type: 'result'; result: EngineRagResult }
  | { type: 'done' }
  | { type: 'error'; code: string; message: string }

/** The health report (the wire shape §3.5 of the guide / §9 of the wire
 *  contract). `state` is the PascalCase `EngineState`; `lastError` is `Some`
 *  exactly when the engine is `Degraded` (a faithful projection). */
export interface HealthReport {
  schemaVersion: number
  idFormat: string
  state: 'Ready' | 'Starting' | 'Degraded' | 'Unavailable'
  version: string
  subsystems: {
    store: boolean
    graph: boolean
    lexical: boolean
    vector: boolean
    embedding: boolean
    reranker: boolean
  }
  lastError: string | null
}

/** The injectable SSE client (default a built-in EventSource-based client).
 *  `subscribe` opens a connection to `url` and dispatches parsed single-event
 *  frames to `onEvent`; `onError` fires on a transport failure; `onClose` fires
 *  when the connection closes. Returns a handle whose `close()` tears the
 *  connection down cleanly. */
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

/** The proxy-specific result — the wire body mapped to a shell-consumable shape.
 *  This is NOT the full Astrographer `RagResult` (Unit X §5.2): the wire body
 *  carries none of the local fan-out's `ranked`/`context`/`markdown`/`lineMap`/
 *  `k` fields, and the wire `trace` covers all four engine modes (flat/vector/
 *  graph/hybrid) whereas the Astrographer `RagTrace` is flat/graph ONLY. The
 *  proxy therefore returns this proxy-specific type, which preserves the full
 *  wire trace. */
export interface EngineRagResult {
  query: string
  results: EngineRagResultItem[]
  engine: string
  citations: Array<{ documentId: string; nodeId: string }>
  trace: EngineRagTrace
  blockedBy?: BlockedByEntry[]
}

/** The per-result item (the wire `results[]` element, snake→camel mapped). The
 *  wire carries a top-level `stale` (absent `parent`/`stale` are `null`). */
export interface EngineRagResultItem {
  documentId: string
  nodeId: string
  score: number
  snippet: string
  source: 'local' | 'zodiac'
  parent?: { documentId: string; title: string; snippet: string; stale: boolean }
  stale?: boolean
}

/** The proxy-specific trace — a discriminated union over ALL FOUR wire trace
 *  variants (the Astrographer `RagTrace` is flat/graph ONLY and cannot carry
 *  vector/hybrid). The wire trace is externally-tagged (`{"Flat":{…}}`,
 *  `{"Vector":{…}}`, `{"Graph":[…]}`/`{"Hybrid":{…}}`); the external tag maps to
 *  the `mode` discriminator and the inner fields map snake→camel. */
export type EngineRagTrace =
  | EngineFlatTrace
  | EngineVectorTrace
  | EngineGraphTrace
  | EngineHybridTrace

export interface EngineFlatTrace {
  mode: 'flat'
  engine: string
  topK: number
  source: 'local' | 'zodiac'
}

export interface EngineVectorTrace {
  mode: 'vector'
  engine: string
  topK: number
  source: 'local' | 'zodiac'
}

export interface EngineGraphTrace {
  mode: 'graph'
  entries: EngineGraphTraceEntry[]
}

export interface EngineHybridTrace {
  mode: 'hybrid'
  engine: string
  legs: Array<'graph' | 'vector' | 'lexical'>
  topK: number
  source: 'local' | 'zodiac'
}

export interface EngineGraphTraceEntry {
  from: { documentId: string; nodeId: string }
  to: { documentId: string; nodeId: string }
  edge: 'link' | 'embed' | 'crosslink'
  state: 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'
}

/** Create the proxy. Throws on a null/undefined opts, a non-loopback baseUrl,
 *  or a missing baseUrl. Does NOT contact the engine at construction. */
export function createEngineRagStore(opts: EngineRagStoreOptions): EngineRagStore
```

**Pinned endpoint paths (the shell's transport decision):**

```ts
export const ENGINE_ENDPOINTS = {
  ragQuery: '/rag/query',        // POST — body { query, ...opts }
  ragStream: '/rag/stream',      // GET — SSE
  engineStatus: '/engine/status', // GET — health report
}
```

**Factory throw patterns:**

- `opts` null/undefined → throws `Error('engine rag store: opts required')`.
- `opts.baseUrl` not a non-empty string → throws
  `Error('engine rag store: baseUrl required')`.
- `opts.baseUrl` does not resolve to a loopback address (127.0.0.1 or ::1) →
  throws `Error('engine rag store: baseUrl must be loopback')`
  (LOOPBACK-AUTH-TLS).
- Construction does NOT contact the engine (no network I/O at construction).

**Return-shape rules:**

- `ragQuery` resolves to the proxy-specific `EngineRagResult` (NOT the full
  Astrographer `RagResult` — see the type note above and §5.2). The shell's
  GUI/MCP surfaces consume this proxy-specific shape; the local fan-out's
  `ranked`/`context`/`markdown`/`lineMap`/`k` fields are NOT produced here
  (they are the local store's, gated to `stores:"all"` — out of scope).
- `ragStream` returns an `AsyncIterable<RagChunk>` yielding the single-shot
  chunks in order: at most one `{type:'result'}` (carrying an `EngineRagResult`)
  or `{type:'error'}` then `{type:'done'}`.
- `getEngineStatus`/`health` resolve to a `HealthReport` (the wire shape §3.5).
- `waitForReady` resolves to the `HealthReport` whose `state == 'Ready'`.

### 5.2 The wire shapes the client reproduces (golden-vector conformance)

The proxy reproduces the wire shapes exactly. The golden vectors **V-1..V-9**
live in the wire contract **`../Gnosis/docs/specs/engine-wire-contract.md`
§12** — they are NOT self-contained in this spec. That §12 section is the
**byte-exact conformance target**; the TestWriter reads BOTH this spec and the
wire contract §12 and asserts the proxy's **decode** functions parse the exact
bytes of V-1..V-6 and V-8 into the pinned typed values below. The proxy is a
**decode-only client** (it consumes wire responses; it does NOT produce
envelopes/chunks/errors/health reports), so the conformance is **decode-side**:
the golden vectors are the byte-exact *inputs* the decoder must parse, not
outputs the proxy must emit. There is **no encode surface** in this unit (see
the §5.10 census).

**The versioned envelope (V-1..V-5):**

```json
{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":<chunk | result | error json>}
```

- `schemaVersion` = `1` (the current version; a future value is the
  extensibility seam).
- `idFormat` = `"opaque-string-v1"` (ids cross the wire as opaque strings;
  RFC-4122 is NOT implemented).
- `payload` = the canonical chunk/result/error JSON.

**Canonical chunk JSON (in `envelope.payload` and the SSE `data:` line):**

| Cargo variant | wire JSON | notes |
| --- | --- | --- |
| `RagChunk::Result(r)` | `{"type":"result","result":<RagResult body>}` | `trace` is required. |
| `RagChunk::Done` | `{"type":"done"}` | terminal, no payload. |
| `RagChunk::Error(e)` | `{"type":"error","code":"<wire_code>","message":"<Display text>"}` | `message` = `format!("{}", e)`. |

**Canonical error JSON (the non-chunk codec):**

`{"code":"<wire_code>","message":"<Display text>"}` — used when an error is
encoded on its own (e.g. as a query's error outcome); the chunk encoder adds the
`"type":"error"` discriminator on top.

**Canonical SSE frame (`ragStream`):**

```
event: <type>
data: <canonical chunk JSON, single line>
<blank line>
```

`<type>` ∈ `{result, done, error}` and **must equal** the `"type"` field of the
data JSON. `data:` is single-line JSON (no multi-line SSE continuation). No
`id:`/`retry:` fields. `ragStream` is **single-shot** — at most one `result`
(the full `EngineRagResult`) then `done`, or one `error` then `done`.

**Health report (`getEngineStatus`):**

```json
{"schemaVersion":1,"idFormat":"opaque-string-v1","state":"Ready","version":"…","subsystems":{"store":true,"graph":true,"lexical":true,"vector":true,"embedding":true,"reranker":true},"lastError":null}
```

- `state` ∈ `{"Ready","Starting","Degraded","Unavailable"}` (PascalCase).
- `subsystems` flags: `store`, `graph`, `lexical`, `vector`, `embedding`,
  `reranker`.
- `lastError` is `Some` exactly when the engine is `Degraded` (a faithful
  projection; the shell must not invent one).

**The wire body → `EngineRagResult` mapping (the proxy's decode output).**

The wire `<RagResult body>` is the serde-frozen Gnosis shape (snake_case keys,
PascalCase enum values, externally-tagged `RagTrace`, id newtypes as bare
strings, `null` for absent `parent`/`stale`/`blocked_by`). The proxy maps it to
the proxy-specific `EngineRagResult` shape (camelCase, lowercase enums,
`mode`-discriminated trace). The mapping is pinned field-by-field (V-5 is the
reference):

| wire field | `EngineRagResult` field | transform |
| --- | --- | --- |
| `query` | `query` | unchanged |
| `results[].document_id` | `results[].documentId` | key rename |
| `results[].node_id` | `results[].nodeId` | key rename |
| `results[].score` | `results[].score` | unchanged |
| `results[].snippet` | `results[].snippet` | unchanged |
| `results[].source` (`"Local"`/`"Zodiac"`) | `results[].source` (`'local'`/`'zodiac'`) | PascalCase → lowercase |
| `results[].parent` (`{document_id,title,snippet,stale}`) | `results[].parent` (`{documentId,title,snippet,stale}`) | key rename |
| `results[].stale` | `results[].stale` | unchanged (a top-level item field; `null` → absent) |
| `citations` (`[["d1","n1"],…]`) | `citations` (`[{documentId,nodeId},…]`) | tuple → object |
| `trace` (externally-tagged `{"Flat":{…}}`/`{"Vector":{…}}`/`{"Graph":[…]}`/`{"Hybrid":{…}}`) | `trace` (`EngineRagTrace` — see below) | external tag → `mode` discriminator |
| `blocked_by` (`[{document_id,node_id,state}]`) | `blockedBy` (`[{documentId,nodeId,state}]`) | key rename; `state` passed through unchanged (uppercase `'BROKEN'`/`'STALE'`) |
| `engine` | `engine` | must be `"gnosis"` (decode-then-validate) |

**The `trace` mapping (pinned — the Astrographer `RagTrace` is flat/graph ONLY
and CANNOT carry the wire's vector/hybrid variants, so the proxy uses the
proxy-specific `EngineRagTrace`):**

| wire trace (externally-tagged) | `EngineRagTrace` | transform |
| --- | --- | --- |
| `{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}}` | `{mode:'flat', engine:'gnosis', topK:10, source:'local'}` | tag → `mode`; `top_k`→`topK`; PascalCase→lowercase |
| `{"Vector":{"mode":"Vector","engine":"gnosis","top_k":10,"source":"Local"}}` | `{mode:'vector', engine:'gnosis', topK:10, source:'local'}` | tag → `mode`; `top_k`→`topK`; PascalCase→lowercase |
| `{"Graph":[{from,to,edge,state},…]}` | `{mode:'graph', entries:[{from,to,edge,state},…]}` | tag → `mode`; bare array → `entries`; inner keys snake→camel |
| `{"Hybrid":{"mode":"Hybrid","engine":"gnosis","legs":["graph","vector","lexical"],"top_k":10,"source":"Local"}}` | `{mode:'hybrid', engine:'gnosis', legs:['graph','vector','lexical'], topK:10, source:'local'}` | tag → `mode`; `top_k`→`topK`; PascalCase→lowercase |

The graph `entries[].edge` ∈ `{'link','embed','crosslink'}` and
`entries[].state` ∈ `{'FRESH','RESOLVED','STALE','BROKEN'}` (the engine's full
graph-step surface — the Astrographer `GraphTraceEntry` is a subset; the proxy
preserves the full wire surface).

**The `blocked_by` wire shape + transform (pinned):**

- Wire `blocked_by` is an array of `{document_id, node_id, state}` objects where
  `state` is the PascalCase `"BROKEN"`/`"STALE"` (the graph empty-result path).
- Transform: key rename (`document_id`→`documentId`, `node_id`→`nodeId`) only;
  the `state` is passed through **unchanged** (uppercase `'BROKEN'`/`'STALE'`) →
  the Astrographer `BlockedByEntry`
  (`{documentId, nodeId, state:'BROKEN'|'STALE'}` — Unit X §5.2). `blockedBy` is
  absent when the wire `blocked_by` is `null`.

**Pinned facts about the mapping:**

- The mapping is deterministic and total over well-formed wire bodies.
- `engine` must equal `"gnosis"` (a non-`"gnosis"` value is a validation failure
  → `EngineError`).
- `blocked_by` present but the trace is not `RagTrace::Graph` → a validation
  failure → `EngineError`.
- The proxy does NOT add `ranked`/`context`/`markdown`/`lineMap`/`k` (the
  Astrographer `RagResult`'s preserved local-fan-out surface — the wire body
  carries none of them) and does NOT add `store`/`storeContexts` (the local
  fan-out's, gated to `stores:"all"` — out of scope here). The proxy returns the
  proxy-specific `EngineRagResult`, which omits all of these by design.

### 5.3 decode-then-validate (the proxy's decoder)

The proxy's decoder reproduces the wire contract §7 (FS-9/FS-10):

```ts
/** Decode the envelope from a response body string. Throws EngineError on a
 *  malformed envelope (missing schemaVersion/idFormat/payload, or a wrong
 *  field type). */
export function decodeEnvelope(json: string): Envelope

/** Decode a RagResult body (the envelope payload) + decode-then-validate.
 *  Maps the wire body to the proxy-specific EngineRagResult shape. Throws
 *  TraceUnavailable / EngineError per the precedence below. */
export function decodeRagResult(payload: unknown): EngineRagResult

/** Decode a chunk payload (the envelope payload or the SSE data line).
 *  Returns the RagChunk. Throws EngineError on a malformed chunk. */
export function decodeChunk(payload: unknown): RagChunk

/** Decode a standalone error payload ({code,message}). Returns the typed
 *  EngineWireError. Throws EngineError on an unknown code. */
export function decodeError(payload: unknown): EngineWireError

/** Decode a health report payload. Returns the HealthReport. Throws
 *  EngineError on a malformed report. */
export function decodeHealthReport(payload: unknown): HealthReport
```

**decode-then-validate precedence (pinned, wire contract §7/§12 V-9):**

- A body with **NO `trace` KEY** (regardless of any other structural issue) →
  `TraceUnavailable` (FS-10 route). Trace-presence is checked FIRST.
- Otherwise structurally malformed (wrong field types, invalid enum, etc.) →
  `EngineError` (FS-9 route).
- A body that decodes but fails validation (`engine != "gnosis"`, or
  `blocked_by` present without a `RagTrace::Graph` trace) → `EngineError`.
- **Precedence (pinned):** a body that is BOTH missing `trace` AND structurally
  malformed (e.g. `{"query":123}`) yields `TraceUnavailable` (not `EngineError`)
  — trace-key-presence is checked before structural type-deserialization. Both
  codes map to HTTP 502 at the shell, so the rendered status is identical.

**The `engine == "gnosis"` + `blocked_by ⇒ RagTrace::Graph` validation:**

- `engine` must equal `"gnosis"`. A non-`"gnosis"` value → `EngineError`.
- `blocked_by` is only produced by the graph empty-result path; a present
  `blocked_by` implies a `RagTrace::Graph` trace. A present `blocked_by` with a
  non-Graph trace → `EngineError`.

### 5.4 The HTTP-status map + the wire-code → typed-error translation

The proxy renders the §11 map (all 21 rows) deterministically. `ConflictError` =
**409** is **mandated** (FS-4).

```ts
export type EngineErrorCode =
  | 'not_found' | 'wiki_not_found' | 'validation_error' | 'conflict'
  | 'doc_in_use' | 'invalid_state' | 'unresolved_reference'
  | 'engine_unavailable' | 'engine_error' | 'trace_unavailable'
  | 'hop_limit_exceeded' | 'cycle_detected' | 'embedding_unavailable'
  | 'vector_index_unavailable' | 'lexical_index_unavailable'
  | 'reranker_unavailable' | 'compression_failed'
  | 'hyde_generation_failed' | 'multi_query_expansion_failed'
  | 'community_not_found' | 'sub_task_dag_failed'

/** The §11 map — total over the 21 codes. Each code maps to exactly one
 *  status. ConflictError = 409 (mandated). */
export const ENGINE_HTTP_STATUS: Record<EngineErrorCode, number> = {
  not_found: 404, wiki_not_found: 404, validation_error: 400, conflict: 409,
  doc_in_use: 409, invalid_state: 409, unresolved_reference: 422,
  engine_unavailable: 503, engine_error: 502, trace_unavailable: 502,
  hop_limit_exceeded: 422, cycle_detected: 409, embedding_unavailable: 503,
  vector_index_unavailable: 503, lexical_index_unavailable: 503,
  reranker_unavailable: 503, compression_failed: 500,
  hyde_generation_failed: 500, multi_query_expansion_failed: 500,
  community_not_found: 404, sub_task_dag_failed: 500,
}

/** The typed error model. */
export class EngineWireError extends Error {
  constructor(
    readonly code: EngineErrorCode,
    readonly httpStatus: number,
    message: string,
  ) { super(message) }
}

export class EngineUnavailable extends EngineWireError {
  constructor(
    readonly cause: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state',
    message: string,
  ) { super('engine_unavailable', 503, message) }
}

export class EngineError extends EngineWireError {
  constructor(message: string) { super('engine_error', 502, message) }
}

export class TraceUnavailable extends EngineWireError {
  constructor(message: string) { super('trace_unavailable', 502, message) }
}

export class ConflictError extends EngineWireError {
  constructor(message: string) { super('conflict', 409, message) }
}

/** Translate a wire code + message to the typed error. A known code → the
 *  matching EngineWireError (with the §11 httpStatus). An UNKNOWN code →
 *  EngineError (502). PURE + DETERMINISTIC. */
export function wireCodeToError(code: string, message: string): EngineWireError
```

**The full §11 map (all 21 rows — the TestWriter's conformance target):**

| wire code | `StoreError` | HTTP status |
| --- | --- | --- |
| `"not_found"` | `DocumentNotFound` | 404 |
| `"wiki_not_found"` | `WikiNotFound` | 404 |
| `"validation_error"` | `ValidationError` | 400 |
| `"conflict"` | `ConflictError` | **409** (mandated) |
| `"doc_in_use"` | `DocumentInUse` | 409 |
| `"invalid_state"` | `InvalidState` | 409 |
| `"unresolved_reference"` | `UnresolvedReference` | 422 |
| `"engine_unavailable"` | `EngineUnavailable` | 503 |
| `"engine_error"` | `EngineError` | 502 |
| `"trace_unavailable"` | `TraceUnavailable` | 502 |
| `"hop_limit_exceeded"` | `HopLimitExceeded` | 422 |
| `"cycle_detected"` | `CycleDetected` | 409 |
| `"embedding_unavailable"` | `EmbeddingUnavailable` | 503 |
| `"vector_index_unavailable"` | `VectorIndexUnavailable` | 503 |
| `"lexical_index_unavailable"` | `LexicalIndexUnavailable` | 503 |
| `"reranker_unavailable"` | `RerankerUnavailable` | 503 |
| `"compression_failed"` | `CompressionFailed` | 500 |
| `"hyde_generation_failed"` | `HyDEGenerationFailed` | 500 |
| `"multi_query_expansion_failed"` | `MultiQueryExpansionFailed` | 500 |
| `"community_not_found"` | `CommunityNotFound` | 404 |
| `"sub_task_dag_failed"` | `SubTaskDagFailed` | 500 |

**Translation rules (pinned):**

- `wireCodeToError` is a pure, total function over the 21 codes. A known code →
  the matching `EngineWireError` with the §11 `httpStatus`. An unknown/foreign
  code → `EngineError` (502).
- The decoder's `decodeError`/`decodeChunk` route a wire `"error"` chunk through
  `wireCodeToError`; a `"conflict"` code → `ConflictError` (409).
- **`engine_unavailable` cause (pinned):** `wireCodeToError('engine_unavailable',
  msg)` returns the `EngineUnavailable` subclass with `cause:
  'unavailable-state'` — the engine reported `engine_unavailable` over the wire.
  This cause is SHARED with the §5.6 gate path: the gate ALSO assigns `cause:
  'unavailable-state'` when it observes the engine's `'Unavailable'` state (see
  §5.6). The two paths legitimately share the cause. By contrast, the
  `'connection-refused'` / `'engine-not-spawned'` / `'not-ready'` causes are
  assigned ONLY by the shell-side transport/gate paths in §5.5/§5.6, never by
  the wire-code translation. This is the ONE cause the wire-code path assigns;
  it is unambiguous and identical in §5.9 fail-state 11.
- `EngineError` and `TraceUnavailable` both render as HTTP 502 (the decoder
  outcomes).

### 5.5 The SSE client (`ragStream`)

```ts
/** Parse a single SSE frame. Returns the event type + data line. Throws
 *  EngineError on a malformed frame (no event:/data: lines, or trailing
 *  non-blank content). An incomplete-but-open frame (e.g. an `event:` line with
 *  NO `data:` line, connection still open) is a MALFORMED frame → EngineError
 *  (see the §5.5 boundary note). */
export function parseSseFrame(frame: string): { event: string; data: string }

/** Decode a single SSE frame to a RagChunk. Enforces the event/data type
 *  match. Throws EngineError on a mismatch or a malformed data line. */
export function decodeSseChunk(frame: string): RagChunk
```

**The `ragStream` behavior (pinned):**

- Subscribes to `GET ${baseUrl}/rag/stream` (SSE). The query params mirror the
  `ragQuery` opts (`query`, `topK`, `mode`, `maxHops`, `expand`,
  `maxParentContext`, `filters`).
- **`filters` serialization (pinned):** the `filters` object is serialized as a
  single `filters` query param holding the **URL-encoded JSON string** of the
  object, e.g. `filters=%7B%22nodeKind%22%3A%22fact%22%2C%22state%22%3A%22BROKEN%22%7D`
  (the raw value is `{"nodeKind":"fact","state":"BROKEN"}`). The scalar opts
  (`query`, `topK`, `mode`, `maxHops`, `expand`, `maxParentContext`) are plain
  query params. An absent `filters` → no `filters` param.
- Parses the single-event frames (`event: <type>\ndata: <json>\n\n`).
- **Single-shot honesty:** the stream emits at most one `result` (the full
  `EngineRagResult`) then `done`, or one `error` then `done`. The proxy yields
  the chunks in order and closes after `done`.
- **Event/data type match:** the `event:` value must equal the data JSON's
  `"type"` field. A mismatch → `EngineError`.
- **Mid-stream failure:** a dropped connection mid-frame (the connection closes
  before the terminal blank line / `\n\n` terminator) is a transport failure →
  **`EngineUnavailable`** (503, `cause: 'connection-refused'`); **no partial
  result is committed** (the proxy does not yield a partial `result`). An
  incomplete-but-open frame (e.g. an `event:` line with NO `data:` line, the
  connection still open) is a **malformed frame** → **`EngineError`** (see the
  boundary note below). This is the ONE pinned error for a dropped connection —
  it is never `EngineError`.
- **Partial-frame vs malformed-frame boundary (pinned):** the classification
  turns on whether the connection is still open when the frame is found
  incomplete. An **incomplete-but-open frame** — e.g. an `event:` line present
  with NO `data:` line, the connection still open (the terminal blank line has
  not arrived) — is a **malformed frame** → **`EngineError`** (the frame is
  structurally invalid; the connection is healthy). A **dropped connection
  mid-frame** — the connection closes before the terminal blank line (no
  `\n\n` terminator) — is a **partial frame** → **`EngineUnavailable`** (503,
  `cause: 'connection-refused'`). The same rule applies to a frame with a
  `data:` line but no `event:` line while the connection is still open →
  `EngineError`. This boundary is consistent with §5.9 fail-states 17 and 19.
- **Mid-stream cancel:** the consumer may cancel the iterable (break/return);
  the proxy closes the SSE connection cleanly. A cancel is NOT an error.

### 5.6 READY observation + D2 engine-absent behavior

**READY observation (the shell observes, it does not drive):**

- `getEngineStatus`/`health` return the `HealthReport` (the wire shape §3.5).
- **Gating mechanism (pinned):** each RAG call (`ragQuery`/`ragStream`) issues a
  **fresh `getEngineStatus`** (a REST `GET /engine/status`) immediately before
  proceeding. The gate is NOT a cached observation and NOT caller-supplied —
  every RAG call observes the engine's current state itself. A RAG call when the
  freshly-observed `state != 'Ready'` → `EngineUnavailable` with `cause:
  'not-ready'` (for `'Starting'`/`'Degraded'`) or `cause: 'unavailable-state'`
  (for `'Unavailable'`). The gate is a deterministic function of the observed
  state (P-SM-2).
- **Degraded is a gate, not an error to observe:** `getEngineStatus`/`health`
  report a `Degraded` state faithfully (a `HealthReport` with `state:
  'Degraded'` and a non-null `lastError` — a faithful projection, never
  invented). Observing `Degraded` is NOT an error. But a RAG call when the
  observed state is `Degraded` is **gated** → `EngineUnavailable` (503,
  `cause: 'not-ready'`), because RAG calls are gated on `state == Ready` (the
  guide's "gate RAG calls on `state == Ready`"). There is NO non-throw path for
  a RAG call in a `Degraded` state.
- `waitForReady` polls `getEngineStatus` every `pollIntervalMs` (default 500) up
  to `maxAttempts` (default 60). It resolves to the `HealthReport` whose
  `state == 'Ready'`.
- **`waitForReady` Degraded behavior (pinned):** it keeps polling through
  `'Starting'` AND `'Degraded'` (both are non-terminal — the engine may recover
  to `Ready`). It only stops on `'Ready'` (resolve) or `'Unavailable'` (reject
  with `cause: 'unavailable-state'`).
- **`waitForReady` connection-refused behavior (pinned):** a connection-refused
  during polling propagates **immediately** as `EngineUnavailable` (503,
  `cause: 'connection-refused'`) — it does NOT retry (a refused connection means
  no server process at the bind address; the D2 engine-absent framing surfaces
  it at once rather than burning the poll budget).
- The engine's own boot wiring (construct `Arc<Store>` → build `DerivedIndexes`
  → wire the embedding provider → transition to `READY`) is **engine-internal**;
  the shell does not drive it.

**D2 engine-absent = UNAVAILABLE:**

- **Connection-refused** (the fetch/SSE connection is refused — e.g.
  `ECONNREFUSED`) → `EngineUnavailable` with `cause: 'connection-refused'`.
- **Engine-not-spawned** (no server process at the bind address — a distinct
  shell-side diagnostic) → `EngineUnavailable` with `cause: 'engine-not-spawned'`.
  Both map to HTTP 503 but are distinct shell-side paths (the proxy distinguishes
  them for diagnostics).
- **DEGRADED vs UNAVAILABLE:** DEGRADED is a distinct state — the engine is
  running but a non-core subsystem (embedding/reranker) is down; core
  store/graph/lexical still work. UNAVAILABLE is engine-absent. The proxy
  reports the state faithfully (a faithful projection; it does not invent a
  `lastError`).
- **Local-first store vs engine store:** the shell's local-first store
  (`createJsonRagStore`, Unit A) and cross-link features work without the engine;
  engine-backed RAG + engine document-store features surface `EngineUnavailable`.
  The D2 "document store works without the engine" claim refers to the shell's
  OWN local-first store, NOT the engine's `RagStore` persistence (which is
  engine-side and unavailable when the engine is absent).

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §6/FS-n rows. **At most 8 rows.** Each row: id, the invariant it
pins, the generator/strategy that exercises it, and the deterministic pinned
seed + attempt budget (≤100 attempts/row, ≤400 total, stop-after-5). The
register is genuinely invariant-bearing (wire round-trip identity,
decode-then-validate determinism, HTTP-status map totality/uniqueness, SSE
single-shot honesty, health-report determinism, READY gating, engine-absent
determinism).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
|---|---|---|---|---|
| `P-IM-1` | IM | **Decode determinism + golden-vector conformance.** For ANY well-formed wire body, the decode functions return a deterministic typed value; the golden vectors **V-1..V-6 and V-8** (wire contract §12) decode to the pinned typed values. **V-7 and V-9 are NOT decode-to-typed-value targets** — V-7 is the three `wire_code` samples (a codec/status reference, not a decode-to-typed-value vector) and V-9 is the decode-then-validate fail-state vector (a `TraceUnavailable`/`EngineError` outcome, not a typed-value decode). The envelope decodes `schemaVersion`/`idFormat`/`payload`; the chunk decodes all three variants; the error decodes `code`/`message`; the health report decodes all six fields; V-6 (the three SSE event frames) decodes to `RagChunk` via `decodeSseChunk`/`parseSseFrame`. (The proxy is decode-only — there is no encode surface; see §5.2/§5.10.) | `strat:decode-determinism` | ∀ generated well-formed `env`/`chunk`/`err`/`report` body: `decodeEnvelope(json)` is deterministic; `decodeChunk(payload)` is deterministic; `decodeError(payload)` is deterministic; `decodeHealthReport(payload)` is deterministic; and `decodeRagResult(V-5 payload)` / `decodeChunk(V-1/V-2/V-3 payload)` / `decodeError(V-4 payload)` / `decodeHealthReport(V-8 payload)` / `decodeSseChunk(V-6 frame)` / `decodeEnvelope(V-1..V-5)` equal the pinned typed values. |
| `P-IM-2` | IM | **decode-then-validate determinism + precedence.** The same body always maps to the same outcome. A body with NO `trace` key → `TraceUnavailable`; a structurally malformed body WITH a `trace` key → `EngineError`; a body BOTH missing `trace` AND malformed → `TraceUnavailable` (trace-key-presence checked FIRST). | `strat:decode-determinism` | ∀ generated body: the decode outcome is a deterministic function of the body; the precedence holds (a body with no `trace` key → `TraceUnavailable` regardless of other structural issues). |
| `P-IM-3` | IM | **HTTP-status map totality + uniqueness + ConflictError=409.** The map is total over the 21 wire codes; each code maps to exactly one status; `conflict` → 409 (mandated). | `strat:status-map` | ∀ `code` in the 21-code set: `ENGINE_HTTP_STATUS[code]` is defined and unique; `ENGINE_HTTP_STATUS['conflict'] == 409`. |
| `P-IM-4` | IM | **SSE frame parse determinism + event/data type match.** A well-formed single-event frame parses to the correct `{event, data}`; the `event:` value equals the data JSON's `"type"`; the frame is single-line JSON with a terminal blank line. | `strat:sse-parse` | ∀ generated well-formed frame: `parseSseFrame(frame)` returns `{event, data}` with `event == JSON.parse(data).type`; `decodeSseChunk(frame)` returns the pinned chunk; the frame ends with `\n\n`. |
| `P-SM-1` | SM | **Health-report determinism + faithfulness.** Equal wire responses → equal reports; `lastError` is `Some` exactly when the wire says so (a faithful projection, never invented). | `strat:health-determinism` | ∀ generated wire report body: `decodeHealthReport(body)` is deterministic; `report.lastError != null` iff the wire `lastError` is non-null; a `Degraded` wire state yields a `Degraded` report with a non-null `lastError`. |
| `P-SM-2` | SM | **READY gating determinism.** A RAG call is gated on `state == Ready`; the gate is a deterministic function of the observed state. A non-`Ready` state → `EngineUnavailable`; `Ready` → the call proceeds. | `strat:ready-gate` | ∀ generated `state ∈ {Ready,Starting,Degraded,Unavailable}`: the gate outcome is deterministic; `Ready` → proceed, else → `EngineUnavailable`. |
| `P-TP-1` | TP | **wire-code → typed-error translation determinism.** The same wire code + message always yields the same typed error (code + httpStatus); an unknown code → `EngineError` (502). | `strat:code-translate` | ∀ `code` in the 21-code set + arbitrary `message`: `wireCodeToError(code, message)` has the matching `code` + §11 `httpStatus`; an unknown code → `EngineError` (502). |
| `P-TP-2` | TP | **Engine-absent → EngineUnavailable determinism.** Connection-refused and engine-not-spawned both map to `EngineUnavailable` (503) with the correct `cause`; the split is deterministic. | `strat:engine-absent` | ∀ generated transport failure (refused / not-spawned): the proxy throws `EngineUnavailable` (503) with `cause` `'connection-refused'` / `'engine-not-spawned'` respectively. |

**Class tally:** IM ×4, SM ×2, TP ×2 = **8 rows ≤ 8** ✔.

**PBT-gate note (determinism/seeding):** the TestWriter's executed property layer
runs under the test runner with a **deterministic pinned seed**, **≤100
generated cases per register row**, **≤400 total cases** across the unit's whole
property layer, **stop-after-5** (report ≤5 distinct held/broken
counterexamples per row), and records each row as **held** or **broken** together
with its `Strategy-id`. The adversarial reviewer then reads this register with
the executed artifacts and performs a read-only PBT audit (per-row
over-strength reasoning, generator-coverage check, prose counterexamples,
negative-generator requests); reviewers never run generators.

**Reserved-variant discipline applied.** The wire codes are total over the closed
21-code set — there are no reserved codes. The generator restriction is
**well-formedness on the decode side**: never generate a non-`"gnosis"` `engine`,
a `blocked_by: Some(..)` without a `RagTrace::Graph` trace, a trace-less/
mismatched body, an unknown `schema_version`/`id_format`, or a malformed SSE
frame — those are `EngineError`/`TraceUnavailable` fail-states (the auditor's
negative-generator requests), NOT invariant rows.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Factory happy:** `createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080' })`
   → returns a proxy; no network I/O at construction.
2. **`ragQuery` happy:** a `POST /rag/query` returns an envelope with a
   well-formed result body (V-5) → `ragQuery` resolves to the mapped
   proxy-specific `EngineRagResult` (camelCase, lowercase enums,
   `mode`-discriminated `EngineRagTrace`, `engine: 'gnosis'`).
3. **`ragQuery` with a wire error chunk:** a `POST /rag/query` returns an
   envelope with `{"type":"error","code":"conflict","message":"…"}` → `ragQuery`
   rejects with `ConflictError` (409).
4. **`ragStream` happy:** the SSE stream emits `event: result` + `data:
   {"type":"result","result":{…}}` then `event: done` + `data: {"type":"done"}`
   → the iterable yields `[{type:'result',result}, {type:'done'}]` in order.
5. **`ragStream` error-then-done:** the SSE stream emits `event: error` + `data:
   {"type":"error","code":"validation_error","message":"empty query"}` then
   `event: done` → the iterable yields `[{type:'error',code:'validation_error',
   message:'empty query'}, {type:'done'}]`.
6. **`getEngineStatus`/`health` happy:** a `GET /engine/status` returns the
   Ready health report (V-8) → both resolve to the same `HealthReport` with
   `state: 'Ready'`, all subsystems true, `lastError: null`.
7. **`waitForReady` happy:** `getEngineStatus` returns `Starting` then `Ready` →
   `waitForReady` polls and resolves to the `Ready` report.
8. **decode-then-validate happy:** a well-formed result body with `trace` present,
   `engine: 'gnosis'`, and a `blocked_by` (if present) paired with a Graph trace
   → `decodeRagResult` returns the mapped `EngineRagResult`.
9. **Vector/hybrid trace decode happy:** a well-formed result body whose `trace`
   is `{"Vector":{…}}` or `{"Hybrid":{…}}` → `decodeRagResult` returns the
   mapped `EngineRagResult` with the corresponding `EngineVectorTrace`/
   `EngineHybridTrace` (the proxy preserves the full wire trace — the Astrographer
   `RagTrace` cannot carry these modes).
10. **HTTP-status rendering happy:** `wireCodeToError('conflict', '…')` →
    `ConflictError` (409); `wireCodeToError('not_found', '…')` → `EngineWireError`
    (404); every one of the 21 codes maps to its §11 status.
11. **SSE single-shot honesty:** a stream with exactly one `result` then `done`
    → the proxy yields exactly those two chunks and closes.
12. **Mid-stream cancel:** the consumer breaks out of the `ragStream` iterable →
    the SSE connection closes cleanly; no error is thrown.
13. **D2 engine-absent:** a `ragQuery` whose fetch is connection-refused →
    rejects with `EngineUnavailable` (503, `cause: 'connection-refused'`).
14. **Loopback enforcement:** `createEngineRagStore({ baseUrl:
    'http://127.0.0.1:8080' })` → OK; `baseUrl: 'http://localhost:8080'` (if it
    resolves to loopback) → OK; a non-loopback address → throws.
15. **Golden-vector conformance:** the proxy's decode functions parse the exact
    bytes of V-1..V-6 and V-8 (wire contract §12) into the pinned typed values.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createEngineRagStore` with null/undefined opts** → throws
   `Error('engine rag store: opts required')`.
2. **`createEngineRagStore` with a missing/empty `baseUrl`** → throws
   `Error('engine rag store: baseUrl required')`.
3. **`createEngineRagStore` with a non-loopback `baseUrl`** → throws
   `Error('engine rag store: baseUrl must be loopback')` (LOOPBACK-AUTH-TLS).
4. **`ragQuery` with a malformed envelope** (missing `schemaVersion`/`idFormat`/
   `payload`, or a wrong field type) → rejects with `EngineError` (502).
5. **`ragQuery` with a result body missing `trace`** → rejects with
   `TraceUnavailable` (502).
6. **`ragQuery` with a structurally malformed result body (with a `trace` key)**
   → rejects with `EngineError` (502).
7. **`ragQuery` with a non-`"gnosis"` `engine`** → rejects with `EngineError`
   (502) (validation failure).
8. **`ragQuery` with a `blocked_by` present but a non-Graph trace** → rejects
   with `EngineError` (502) (validation failure).
9. **`ragQuery` with an unknown `schemaVersion`** (e.g. `99`) → rejects with
   `EngineError` (502) (`UnsupportedSchemaVersion`).
10. **`ragQuery` with an unknown `idFormat`** (e.g. `"uuid-v4"`) → rejects with
    `EngineError` (502) (`UnknownIdFormat`).
11. **`ragQuery` with a wire error chunk for a known code** → rejects with the
    matching typed error (e.g. `ConflictError` 409, `EngineUnavailable` 503).
    For the `engine_unavailable` code the typed error is the `EngineUnavailable`
    subclass with **`cause: 'unavailable-state'`** (pinned — the wire-code path
    assigns this cause; see §5.4).
12. **`ragQuery` with a wire error chunk for an UNKNOWN code** → rejects with
    `EngineError` (502).
13. **`ragQuery` connection-refused** → rejects with `EngineUnavailable` (503,
    `cause: 'connection-refused'`).
14. **`ragQuery` engine-not-spawned** → rejects with `EngineUnavailable` (503,
    `cause: 'engine-not-spawned'`).
15. **`ragQuery` when the observed state is not `Ready`** → rejects with
    `EngineUnavailable` (503, `cause: 'not-ready'` for `'Starting'`/`'Degraded'`,
    `cause: 'unavailable-state'` for `'Unavailable'`).
16. **`ragStream` when the observed state is not `Ready`** → the iterable throws
    `EngineUnavailable` (503, `cause: 'not-ready'` for `'Starting'`/`'Degraded'`,
    `cause: 'unavailable-state'` for `'Unavailable'`).
17. **`ragStream` with a malformed SSE frame** (no `event:`/`data:` lines, or
    trailing non-blank content) → the iterable throws `EngineError`. An
    **incomplete-but-open frame** (e.g. an `event:` line with NO `data:` line,
    or a `data:` line with no `event:` line, the connection still open) is ALSO a
    malformed frame → `EngineError` (the connection is healthy; the frame is
    structurally invalid — see the §5.5 boundary note).
18. **`ragStream` with an event/data type mismatch** (the `event:` value != the
    data `"type"`) → the iterable throws `EngineError`.
19. **`ragStream` with a dropped connection before `done`** → the iterable throws
    `EngineUnavailable` (503, `cause: 'connection-refused'`); **no partial result
    is committed**. A **dropped connection mid-frame** (the connection closes
    before the terminal blank line / `\n\n` terminator) is a **partial frame** →
    `EngineUnavailable` — DISTINCT from the incomplete-but-open malformed frame
    (fail-state 17 → `EngineError`); the boundary is pinned in §5.5.
20. **`ragStream` with an unparseable `data:` line** → the iterable throws
    `EngineError`.
21. **`getEngineStatus`/`health` with a malformed health report** → rejects with
    `EngineError` (502).
22. **`getEngineStatus`/`health` connection-refused** → rejects with
    `EngineUnavailable` (503, `cause: 'connection-refused'`).
23. **`waitForReady` when the state stays non-`Ready` past `maxAttempts`** →
    rejects with `EngineUnavailable` (503, `cause: 'not-ready'`).
24. **`waitForReady` when the state becomes `Unavailable`** → rejects with
    `EngineUnavailable` (503, `cause: 'unavailable-state'`).
25. **`waitForReady` connection-refused during polling** → rejects immediately
    with `EngineUnavailable` (503, `cause: 'connection-refused'`); it does NOT
    retry.

**Pinned non-throws:** a mid-stream cancel (the consumer breaks out of the
`ragStream` iterable) is NOT an error — the SSE connection closes cleanly.
Observing a `Degraded` state via `getEngineStatus`/`health` is NOT an error —
the proxy reports it faithfully (a `HealthReport` with `state: 'Degraded'` and a
non-null `lastError`, never invented). But a RAG call (`ragQuery`/`ragStream`)
in a `Degraded` state IS gated → `EngineUnavailable` (503, `cause: 'not-ready'`)
— there is NO non-throw path for a RAG call in a non-`Ready` state (RAG calls
are gated on `state == Ready`; see §5.6).

### 5.10 Census / numeric claims

- **New module:** `src/main/engine-rag-store.ts`.
- **New exported factory:** `createEngineRagStore(opts)`.
- **New exported types:** `EngineRagStoreOptions`, `EngineRagStore`,
  `EngineRagQueryOptions`, `Envelope`, `RagChunk`, `HealthReport`, `SseClient`,
  `EngineRagResult`, `EngineRagResultItem`, `EngineRagTrace`, `EngineFlatTrace`,
  `EngineVectorTrace`, `EngineGraphTrace`, `EngineGraphTraceEntry`,
  `EngineHybridTrace`, `EngineErrorCode`, `EngineWireError`, `EngineUnavailable`,
  `EngineError`, `TraceUnavailable`, `ConflictError`.
- **Imported type (NOT new in this unit):** `RagQueryFilters` is **imported from
  `src/main/retrieval.ts`** (Unit X §5.2) and used by `EngineRagQueryOptions.filters`
  (§5.1). It is NOT a new exported type of this unit and is NOT re-exported here.
- **New exported functions:** `decodeEnvelope`, `decodeRagResult`, `decodeChunk`,
  `decodeError`, `decodeHealthReport`, `parseSseFrame`, `decodeSseChunk`,
  `wireCodeToError`. **There is NO encode surface** — the proxy is a decode-only
  client (it consumes wire responses, it does not produce envelopes/chunks/
  errors/health reports); the golden-vector conformance (§5.2) is decode-side.
- **Internal (NOT exported):** `assertLoopback` (the loopback check helper) is
  INTERNAL — loopback enforcement is tested through the factory throw pattern
  (§5.9 fail-states 1–3), not through a direct call.
- **New exported constants:** `ENGINE_HTTP_STATUS` (21 entries),
  `ENGINE_ENDPOINTS` (3 paths).
- **Proxy surface method count:** 5 (`ragQuery`, `ragStream`, `getEngineStatus`,
  `health`, `waitForReady`). The retrieval trio + health = 4; `waitForReady` is
  the READY-observation helper — a **shell-side convenience** (it composes
  `getEngineStatus` polling; it is not a wire method).
- **HTTP-status map row count:** **21** (all §11 rows). `ConflictError` = **409**
  (mandated).
- **Wire-code count:** **21** (the closed `EngineErrorCode` union).
- **SSE event types:** **3** (`result`, `done`, `error`).
- **Envelope fields:** **3** (`schemaVersion`, `idFormat`, `payload`).
- **Health-report fields:** **6** (`schemaVersion`, `idFormat`, `state`,
  `version`, `subsystems`, `lastError`).
- **Subsystems flags:** **6** (`store`, `graph`, `lexical`, `vector`,
  `embedding`, `reranker`).
- **EngineState values:** **4** (`Ready`, `Starting`, `Degraded`, `Unavailable`).
- **Golden conformance vectors:** **V-1..V-6 and V-8** (the byte-exact
  reference, wire contract §12) — the decode-side conformance target (the
  proxy's decode functions parse them into the pinned typed values; there is no
  encode side).
- **PBT register:** **8 rows** (IM ×4, SM ×2, TP ×2), ≤100 attempts/row, ≤400
  total, stop-after-5, deterministic pinned seed.
- **Test-count expectation:** the TestWriter's red set covers §5.8 (15 happy
  states) + §5.9 (25 fail-states) + the §5.2 golden-vector conformance + the §5.7
  PBT register. The exact count is the TestWriter's; the spec pins the state
  surface, not the count.

### 5.11 Cross-references

- **The authoritative implementation guide:**
  `../Gnosis/docs/integrations/astrographer-interface-implementation.md` — §2
  (the transport decision), §3 (the wire shapes), §4.6 (the retrieval trio — the
  scoped deliverable), §5 (the HTTP-status map), §6 (error handling /
  fail-states), §7 (D2 engine-absent behavior), §8 (loopback + auth/TLS), §10
  (the implementation checklist), §11 (cross-references).
- **The wire contract (the frozen shapes):**
  `../Gnosis/docs/specs/engine-wire-contract.md` — §4 (the envelope, chunk JSON,
  error JSON, SSE frame), §5 (`wire_code` table), §6 (codecs), §7
  (decode-then-validate), §8 (SSE), §9 (health), §11 (the HTTP-status map),
  §12 (golden vectors V-1..V-9), §13 (valid/happy + fail states per function),
  §14 (ownership hand-off — the shell-owned items 1–7).
- **The PBT register (the model for §5.7):**
  `../Gnosis/docs/specs/7-2-wire-property-register.md` — the typed P-IM/P-SM/P-TP
  register format, the reserved-variant discipline, the determinism/seeding
  rules.
- **The Astrographer `RagStore` interface (DIFFERENT from the Gnosis `RagStore`
  trait):** `docs/specs/unit-a-rag-store.md` §5.4 — the node/edge CRUD store the
  shell's local-first store implements. The `createEngineRagStore` proxy is a
  NEW surface (the retrieval trio + health), NOT the `RagStore` CRUD interface.
- **The Astrographer `RagResult` family (the CONTEXT for the proxy-specific
  `EngineRagResult` — NOT the proxy's return type):**
  `docs/specs/unit-x-rag-provenance-traversal.md` §5.2 (`RagResult`,
  `RagResultItem`, `FlatTrace`, `GraphTraceEntry`, `BlockedByEntry`, `RagTrace`),
  §5.6 (`ragQuery` — the local producer), §5.8 (the `rag.query`/`rag-stream` MCP
  tools); `docs/specs/unit-f2-result-qualification.md` §5.1 (the extended
  `RagResult` with `store`/`storeContexts` — gated to `stores:"all"`, out of
  scope here). The proxy returns the proxy-specific `EngineRagResult` (§5.1/§5.2)
  because the wire body carries none of the Astrographer `RagResult`'s
  `ranked`/`context`/`markdown`/`lineMap`/`k` fields and the wire `trace` covers
  all four engine modes (flat/vector/graph/hybrid) whereas the Astrographer
  `RagTrace` is flat/graph ONLY. The `BlockedByEntry` shape is shared verbatim
  (the wire `blocked_by` maps to it — §5.2).
- **The pending remote-store row:** `docs/pending.md` "API access to a remote DB
  (remote RAG store)" — the `createRemoteRagStore` the `createEngineRagStore`
  proxy generalizes.
- **The Gnosis engine migration context:** `docs/pending.md` "Migrate RAG engine
  to a faster / more-multithreading-capable language (Rust, Go, Odin, etc.)" —
  the Gnosis engine is the Rust engine this proxy talks to.
- **The proxy seam:** `../Gnosis/docs/specs/gnosis.md` §5.1 (the proxy seam),
  §4.6.1 (the query surface), §4.6.2 (no MCP/GUI), §6 (fail-states).
- **Decision rows to add when the unit lands:** `docs/decisions.md` —
  **ENGINE-WIRE-CLIENT**, **TRANSPORT-HTTP-SSE-LOOPBACK**, **READY-OBSERVATION**;
  consumed **F2-WIRE-CONTRACT-A1**, **DECODE-THEN-VALIDATE**,
  **HTTP-STATUS-RENDERING**, **SSE-SINGLE-SHOT**, **D2-ENGINE-ABSENT-UNAVAILABLE**,
  **LOOPBACK-AUTH-TLS**.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/main/engine-rag-store.ts` from
§5.8/§5.9, and asserts the golden-vector conformance (§5.2) + the PBT register
(§5.7) hold. The red set (recorded in the next-steps DONE row for this unit):

- **The factory + proxy surface:** the happy states 1, 14 (loopback) + the
  fail-states 1–3 (opts/baseUrl/loopback).
- **`ragQuery`:** the happy states 2, 3 (result + wire-error chunk) + the
  fail-states 4–15 (malformed envelope, missing trace, malformed body,
  non-`"gnosis"` engine, `blocked_by`/Graph mismatch, unknown `schemaVersion`/
  `idFormat`, known/unknown wire codes, connection-refused, engine-not-spawned,
  not-ready — incl. the `Degraded` gate).
- **`ragStream`:** the happy states 4, 5, 11, 12 (result-then-done,
  error-then-done, single-shot, mid-stream cancel) + the fail-states 16–20
  (not-ready gate, malformed frame, event/data mismatch, dropped connection →
  `EngineUnavailable`, unparseable data).
- **`getEngineStatus`/`health`/`waitForReady`:** the happy states 6, 7 + the
  fail-states 21–25 (malformed report, connection-refused, not-ready past
  maxAttempts, unavailable-state, connection-refused during polling).
- **decode-then-validate:** the happy states 8, 9 (incl. the vector/hybrid trace
  decode) + the fail-states 5–8 (the precedence: missing-trace →
  `TraceUnavailable`; malformed-with-trace → `EngineError`; both →
  `TraceUnavailable`).
- **HTTP-status rendering:** the happy state 10 (all 21 codes) + the fail-state
  12 (unknown code → `EngineError`).
- **Golden-vector conformance (§5.2):** the proxy's decode functions parse the
  exact bytes of V-1..V-6 and V-8 (wire contract §12) into the pinned typed values.
- **The PBT register (§5.7):** the 8 invariant rows (deterministic pinned seed,
  ≤100 attempts/row, ≤400 total, stop-after-5).
- **The end-to-end transport test:** the `EngineUnavailable`/`EngineError` split
  against the real transport's failure modes (connection-refused, malformed
  frames, unknown `schemaVersion`/`idFormat`, mid-stream cancel).
