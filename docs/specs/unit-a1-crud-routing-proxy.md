# Spec — Unit A1: Document-CRUD Routing Proxy — the `createEngineCrudRagStore` Proxy (the 11 §4.1 Document-CRUD Wire Client)

- **Status:** SPEC — **LANDED-GREEN (2026-09-10)** — the shell-side Gnosis-engine
  document-CRUD wire client, scoped per the roadmap
  `docs/specs/unblock-gnosis-remaining-endpoints.md` §6.1 (A1). Proposal gate:
  the roadmap's §6.1 (PASS — the A1 deliverable = the **document-CRUD routing
  proxy client** routing the **11 §4.1 document-CRUD methods** over the frozen
  document-CRUD wire). **Gated on (P3):** **P1a-only for the unit** (the client
  routes the frozen document-CRUD shapes); **P2 is required only for the
  live-scenario battery** — so **A1 is parallelizable with P2**. **Deferred-to-
  unit-spec (P4):** **idempotency/retry for mutating creates** is a required
  deliverable of the A1/A2 unit specs — this spec pins the A1 half (a bounded,
  opt-in retry-on-`EngineUnavailable` for the mutating creates) and records the
  A2 half (idempotency-key dedup) as a deferred decision (§5.10). **LANDED-GREEN
  + RE-DERIVED:** `src/main/engine-crud-rag-store.ts` is implemented + green, and
  the `DocumentList` contract is re-derived so **`items: DocumentSummary[]`** is
  decoded by the NEW lenient **`decodeDocumentSummary`** (six fields, snake+camel,
  tolerates a full `Document` item / projects it; a malformed summary →
  `EngineError('malformed document')` 502) — closing **HOST-CRUD-LIST-SUMMARY-DECODE**
  (§3 FINDING). A1 green set: **60 unit + 8 PBT rows** (`tests/unit-a1-crud-routing-proxy.test.ts`
  + `tests/props-a1-crud-routing-proxy.test.ts` = 68 A1 test rows), trio green
  (**3356 pass / 43 skip**, 137 test files, typecheck + build clean); the greens
  docs `docs/specs/unit-a1-crud-routing-proxy-greens.md` (26 PASS / 18
  NOT-VERIFIED / 0 FAIL) and `docs/specs/unit-a1-crud-list-summary-decode-greens.md`
  (8 PASS / 0 FAIL — the re-derivation + a §LIVE-LOCATION), and the live-pending
  battery `docs/specs/unit-a1-crud-routing-proxy-live-pending-battery.md` (parked
  on A2) are recorded.
- **Scope:** a NEW shell-side module `src/main/engine-crud-rag-store.ts` — a
  **sibling** to the LANDED `src/main/engine-rag-store.ts` (Unit GN). It routes
  the **11 §4.1 document-CRUD methods** (`createDocument`, `getDocument`,
  `updateDocument`, `deleteDocument`, `publishDocument`, `unpublishDocument`,
  `archiveDocument`, `listDocuments`, `createWiki`, `getWiki`, `listWikis`) over
  the frozen document-CRUD wire (P1a). It **reuses** Unit GN's decode-then-
  validate, the §11 HTTP-status map, the typed `EngineWireError` model, loopback
  + auth/TLS, READY observation, and D2 engine-absent framing — **imported from
  `engine-rag-store.ts`, NOT redefined**. Unlike Unit GN (a decode-only client),
  A1 is an **encode+decode** client: it **ENCODES** the request envelope
  (method + args) and **DECODES** the response envelope (result or error). The
  golden vectors **V-10..V-12** (P1a §9) are the byte-exact conformance targets.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for
  `src/main/engine-crud-rag-store.ts` from §5.8/§5.9 before any implementation,
  and asserts the golden-vector conformance (§5.2) + the PBT register (§5.7)
  hold.
- **Page-design note (repo divergence):** this repo has **NO
  `docs/skills/designing-pages.md`** (only `docs/skills/process-guardrails.md`
  exists). Per the established sibling convention (roadmap §-header note;
  `docs/specs/unit-gn-mcp-ui-wiring.md` §5.5), **NO such skill update is made**
  and **no test-use-case coverage matrix / demo-page index is touched**. A1 is a
  pure proxy client — it exposes **no GUI surface** (the A2 unit owns the
  document-CRUD screens). The base instruction to update
  `docs/skills/designing-pages.md` only applies when that file exists; it does
  not.

---

## 1. What the proposal asks

The roadmap §6.1 (A1) asks for the **document-CRUD routing proxy client**: extend
the LANDED `engine-rag-store.ts` (or a sibling `src/main/engine-crud-rag-store.ts`)
to route the **11 §4.1 document-CRUD methods** over the frozen document-CRUD wire
(P1a). It reuses Unit GN's decode-then-validate, the §11 HTTP-status map, the
typed `EngineWireError` model, loopback + auth/TLS, READY observation, and D2
engine-absent framing. It is the **same client discipline** as the retrieval
trio, applied to document CRUD.

Concretely, the A1 deliverable:

1. **The wire client** — reproduce the request envelope (method + args) and the
   response envelope (result or error) exactly. The golden vectors **V-10..V-12**
   (P1a §9) are the byte-exact conformance reference. The client is
   **encode+decode**: it ENCODES the request envelope and DECODES the response
   envelope.
2. **decode-then-validate for CRUD responses** — a malformed CRUD response body →
   `EngineError` (502); a well-formed body failing a CRUD-specific invariant →
   `EngineError` (502) naming the `CrudValidationFailure` variant. The precedence
   (fail-fast on the discriminator, then the body) is pinned (§5.3).
3. **HTTP-status rendering** — reuse `ENGINE_HTTP_STATUS` + `wireCodeToError` +
   the typed error classes from `engine-rag-store.ts` (import, do not redefine).
   The NEW-2 request-decode outcome (a malformed request / unknown method →
   400/422, NOT 502) is pinned as a client-side awareness (§5.4).
4. **RBAC `caller` threading** — mutating requests carry `caller`; read-only
   requests carry no `caller`. The client's typed args enforce this at the type
   level (§5.4).
5. **READY observation** — each CRUD call issues a fresh `getEngineStatus` gate
   gated on `state == Ready` (§5.6).
6. **D2 engine-absent = UNAVAILABLE** — connection-refused →
   `EngineUnavailable` (503) (§5.6).
7. **loopback + auth/TLS** policy — reuse the Unit GN rule (§5.1).
8. **P4 idempotency/retry for mutating creates** — a bounded, opt-in
   retry-on-`EngineUnavailable` for `createDocument`/`createWiki` (§5.1/§5.10).

**Explicitly OUT of scope (deferred):** the document-CRUD MCP tools + GUI screens
(A2); the server host (P2); the graph/fact/consistency/RAG-companion surfaces
(A3–A5, P1b–P1e); the RBAC **enforcement** semantics (the engine is the
enforcer); idempotency-key-based dedup (deferred to A2, §5.10).

## 2. Feasibility verdict

**Feasible — a pure shell-side HTTP wire client over a frozen wire contract; no
engine/foundation gap.**

- **The wire shapes are frozen.** The request envelope, response envelope, error
  envelope, and the 11 per-method args/result shapes are pinned byte-exactly in
  `../Gnosis/docs/specs/p1a-document-crud-wire.md` §4 (golden vectors V-10..V-12).
  The shell reproduces them; there is no shape ambiguity to resolve.
- **The HTTP-status map is frozen.** All 21 rows (§11) are documented and already
  implemented in `engine-rag-store.ts`; the client reuses them verbatim.
  `ConflictError` = **409** is mandated (FS-4).
- **decode-then-validate is a pure decoder concern.** The precedence (fail-fast
  on the discriminator, then the body) is pinned in P1a §10; the shell's decoder
  reproduces it.
- **The transport is the shell's decision.** HTTP/REST over loopback is the
  established transport (Unit GN). The server host is a separate thin binary crate
  in the Gnosis workspace (P2, deferred — out of scope); the shell does not host
  the Rust server.
- **The client patterns are frozen and replicable.** Unit GN pinned the factory +
  proxy surface, the loopback + auth/TLS policy, the READY gate, the D2
  engine-absent framing, and the §11 map. A1 reuses all of these mechanically.
- **No engine/foundation gap.** The proxy is project-specific shell code
  (`src/main/engine-crud-rag-store.ts`). It composes the standard `fetch`
  primitive. The engine's boot→READY lifecycle is engine-internal; the shell only
  observes it via `getEngineStatus`.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The document-CRUD wire client (`createEngineCrudRagStore`) | Project-specific (shell-side; Gnosis ships the codecs + engine, not the HTTP client) | Medium cost; the document-CRUD half of the proxy seam (§5.1 of `docs/specs/gnosis.md`). |
| The request-envelope encode + response-envelope decode | Project-specific (reproduces P1a §4) | Low cost; the encode+decode surface (unlike Unit GN's decode-only). |
| decode-then-validate for CRUD responses | Project-specific (reproduces P1a §10) | Low cost; makes the CRUD validation failures real `EngineError` (502) outcomes. |
| The HTTP-status rendering (reused) | Project-specific (imports `ENGINE_HTTP_STATUS` + `wireCodeToError` from `engine-rag-store.ts`) | Low cost; the deterministic wire-code → typed-error translation. |
| READY observation + D2 engine-absent behavior | Project-specific (the shell observes READY, degrades gracefully) | Low cost; the D2 optional-engine contract. |
| loopback + auth/TLS policy | Project-specific (shell-owned, D4 carve-out) | Low cost; the security surface. |
| P4 idempotency/retry for mutating creates | Project-specific (bounded retry-on-`EngineUnavailable`) | Low cost; the A1 half of the roadmap's P4 deliverable. |

No engine gap. The engine's `RagStore` persistence is engine-side and
unavailable when the engine is absent (D2 — engine-absent = UNAVAILABLE); the D2
"document store works without the engine" claim refers to the **shell's own
local-first store** (`createJsonRagStore`, Unit A), NOT the engine's `RagStore`
persistence (H1 — Gnosis supplants the document store; the local store is the D2
fallback). The server-host binary crate is deferred (P2, out of scope); the shell
does not host the Rust server.

**FINDING — `HOST-CRUD-LIST-SUMMARY-DECODE` (live-confirmed 2026-09-11 → this
re-derivation):** `gnosis.document.list` (the host A1 `listDocuments` proxy) fails
against the real Gnosis engine with the engine error **`malformed document`**
whenever the wiki has **≥1 document**. Root cause: the engine's `listDocuments`
(Gnosis §4.1.3) returns a **lightweight summary** — `DocumentSummary =
{document_id, wiki_id, title, state, revision, updated_at}`, **no
graph/tags/created_at/author**. The host decoder `decodeDocumentList` mapped every
item through the strict full `decodeDocument` (which requires
`graph`/`tags`/`created_at`/`author`), so the list wire — which never carries
those four — always threw `EngineError('malformed document')` on a non-empty
wiki. **The engine wire is correct (§4.1.3 documents the summary); the host
contract was over-strong** (it pinned `DocumentList.items: Document[]`, which the
list endpoint never returns).

**Adopted fix direction (this re-derivation):** (1) a host `DocumentSummary`
interface mirroring the wire (`documentId`, `wikiId`, `title`, `state`,
`revision`, `updatedAt` — snake→camel); (2) `DocumentList.items` re-typed
`Document[]` → `DocumentSummary[]` (full `Document` is only for
get/create/update/publish/unpublish/archive); (3) `decodeDocumentList` maps each
item through a NEW **lenient `decodeDocumentSummary`** (accept the six summary
fields, never require `graph`/`tags`/`created_at`/`author`) instead of the strict
`decodeDocument`; (4) consistent with the renderer (`gnosis-crud-panes.ts`,
which reads only `documentId`/`revision`/`title`/`state` from list items — all
present on a summary); (5) a genuinely malformed summary (missing/typed-wrong
`document_id` etc.) still throws `EngineError('malformed document')`. These
deliverables (2)/(3) are the TestWriter red set for this re-derivation;
`DocumentSummary` and the list wire are pinned in §5.1/§5.2, the decode-fail
contract in §5.3/§5.9, and the PBT rows in §5.7.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

**Adversarial findings (RCA-3 — populated post-green, all HOST, fixed + regression-tested):**

- **HOST-MINOR 1:** the `isLoopbackHost` comment claimed the hex IPv4-mapped
  loopback form `::ffff:7f00:1` was handled, but the code only accepted the
  dotted-decimal form. **FIXED:** the hex form (two 16-bit hex groups whose first
  octet is `0x7f`) is now accepted. Regression-tested.
- **HOST-MINOR 2:** a `Document` body with a **missing `author` key** was silently
  coerced to `null` (the wire body always carries `author`, `null` when `None`; a
  missing key is malformed). **FIXED:** a missing `author` key → `EngineError`
  (502). Regression-tested.
- **HOST-MINOR 3:** a `Document` body with an **array `graph`** passed the
  `typeof 'object'` check and was returned opaque. **FIXED:** an array `graph` →
  `EngineError` (502). Regression-tested.

**Re-derivation adversarial findings (RCA-3, `HOST-CRUD-LIST-SUMMARY-DECODE` — all HOST, fixed + regression-tested):**

- **HOST-1:** a **non-object `listDocuments` item** (`null`, `5`, `'x'`, `true`)
  was not covered by the negative set and could surface as a **native `TypeError`**.
  **FIXED:** `decodeDocumentSummary` treats any non-object item as malformed →
  `EngineError('malformed document')` (502) — never a native `TypeError`.
  Regression-tested (`§5.9-14 HOST-1`).
- **HOST-2:** the engine's §4.1.3 **page-beyond-data empty-items** response
  (`{items:[], total:0, page:1, pageSize:20}`) was not covered and could be
  misjudged as a fail-state. **FIXED (coverage addition):** an empty `items:[]
  DocumentList` is pinned to decode WITHOUT throwing (`§4.1.3 HOST-2`); the
  mixed full-`Document`-item projection (a full `Document` interleaved among
  summaries) is also pinned to decode to its six-field summary. Regression-tested.
- **HOST-3 (the re-derivation's main finding):** the original negative generator
  set for `P-IM-4` missed **`wikiId`/`updatedAt` (camelCase) AND the snake_case
  wire variants** — so the malformed clause did not cover all six wire fields
  (`document_id`/`wiki_id`/`title`/`state`/`revision`/`updated_at`). **FIXED
  (generator-coverage tightening):** the `P-IM-4` negative set is now ∀ malformed
  over **all six fields in both snake_case and camelCase** (incl. `wiki_id`/
  `updated_at`), plus the non-object-item cases. Regression-tested.
- **HOST-MINOR-A (precedence doc-note, no code change):** a spec-doc note pinned
  in §5.2/§5.3 clarifying the **`listDocuments` decode precedence**: a full
  `Document` item (extra `graph`/`tags`/`created_at`/`author` present) is **projected
  to its six-field summary, never malformed**; a well-formed six-field summary
  decodes as-is; and a **malformed** item throws `EngineError('malformed document')`
  during the item decode (fail-state 14) — **before** the `validateCrudResult`
  pagination check (fail-state 15f) runs. Documented only; the decoder already
  behaves this way.

**PBT audit (read-only, §5.7 register):** all **8 register rows HELD** (P-IM-1..P-IM-4,
P-SM-1..P-SM-3, P-TP-1); none over-strength. **`P-IM-4` generator-coverage was
tightened** to cover all six summary fields (snake_case AND camelCase), the
non-object-item cases (HOST-1), and the mixed full-`Document`-item projection
(HOST-2) — the re-derivation's negative-generator gap (HOST-3) is now **closed**.

### 3b. Package findings register (provident-ssr / Gnosis — recorded, never patched)

> Package/upstream findings from the post-green adversarial pass are recorded
> here and routed to `docs/defects.md` + `docs/HANDOFF.md` (never patched in
> this repo — the package code is upstream-owned).

- **NONE.** No defect found in the `provident-ssr` package or the Gnosis wire
  contract.

## 4. Design decisions pinned by this spec

- **ENGINE-CRUD-WIRE-CLIENT (new):** the shell's Gnosis document-CRUD access is a
  NEW module `src/main/engine-crud-rag-store.ts` exporting the factory
  `createEngineCrudRagStore(opts)` returning the 11-method document-CRUD proxy
  surface. It is a **sibling** to `engine-rag-store.ts` (Unit GN) and **imports**
  the shared error model, status map, and decode helpers from it (do not
  redefine). It is a **distinct surface** from the Astrographer `RagStore`
  interface (Unit A §5.4) and from the retrieval-trio proxy (Unit GN).
- **ENCODE+DECODE (new, vs Unit GN's decode-only):** the client ENCODES the
  request envelope (method + args) and DECODES the response envelope (result or
  error). The golden vectors V-10..V-12 (P1a §9) are the byte-exact conformance
  targets for both directions.
- **DECODE-THEN-VALIDATE-FOR-CRUD (consumed):** the client's decoder reproduces
  P1a §10: a malformed CRUD response body → `EngineError` (502); a well-formed
  body failing a CRUD-specific invariant → `EngineError` (502) naming the
  `CrudValidationFailure` variant. The precedence (fail-fast on the
  discriminator, then the body) is pinned (§5.3).
- **HTTP-STATUS-RENDERING (reused):** the client imports `ENGINE_HTTP_STATUS` +
  `wireCodeToError` + the typed error classes from `engine-rag-store.ts` (all 21
  rows; `ConflictError` = **409** mandated). The NEW-2 request-decode outcome
  (400/422, NOT 502) is pinned as a client-side awareness (§5.4).
- **RBAC-CALLER-THREADING (consumed):** mutating requests carry `caller`;
  read-only requests carry no `caller`. The client's typed args enforce this at
  the type level; the client never emits a mutating request without `caller` and
  never emits a read-only request with `caller` (§5.4).
- **READY-OBSERVATION (reused):** each CRUD call issues a fresh `getEngineStatus`
  gate gated on `state == Ready` (§5.6).
- **D2-ENGINE-ABSENT-UNAVAILABLE (reused):** engine-absent = UNAVAILABLE.
  Connection-refused and engine-not-spawned both map to `EngineUnavailable`
  (503) but are distinct shell-side paths (§5.6).
- **LOOPBACK-AUTH-TLS (reused):** the wire is loopback-only by contract. The
  client enforces a loopback `baseUrl` (throws at construction on a non-loopback
  address) and owns auth/TLS (§5.1).
- **P4-IDEMPOTENCY-RETRY (new, A1 half):** a bounded, opt-in
  retry-on-`EngineUnavailable` for the two mutating create methods
  (`createDocument`, `createWiki`), configured via the factory `retry` option.
  Idempotency-key-based dedup is **deferred to A2** (recorded decision, §5.10).

## 5. The exhaustive contract

### 5.1 The factory + the proxy surface (`src/main/engine-crud-rag-store.ts`)

```ts
// src/main/engine-crud-rag-store.ts (NEW — the shell-side document-CRUD wire client)

// IMPORTED from ./engine-rag-store.js (Unit GN) — NOT redefined here:
//   EngineWireError, EngineUnavailable, EngineError, TraceUnavailable,
//   ConflictError, wireCodeToError, ENGINE_HTTP_STATUS, decodeEnvelope,
//   Envelope, HealthReport, EngineErrorCode, EngineRagStoreOptions (as the
//   base shape for EngineCrudRagStoreOptions).

/** The engine's bind address — LOOPBACK-ONLY by contract. Mirrors the
 *  EngineRagStoreOptions shape (imported from engine-rag-store.ts) EXCEPT the
 *  `sse` field (A1 is a request/response CRUD client with no SSE surface — the
 *  SSE event schema stays retrieval-only) and adds the P4 retry option. */
export interface EngineCrudRagStoreOptions {
  /** The engine's base URL, e.g. `http://127.0.0.1:PORT`. MUST resolve to a
   *  loopback address (127.0.0.1 or ::1). A non-loopback baseUrl throws at
   *  construction (LOOPBACK-AUTH-TLS). */
  baseUrl: string
  /** Per-request timeout in ms (default 10_000). */
  requestTimeoutMs?: number
  /** READY-poll interval in ms (default 500). VESTIGIAL — mirrors the Unit GN
   *  `EngineRagStoreOptions` shape; the A1 READY gate is a SINGLE fresh
   *  `getEngineStatus` call per CRUD call (§5.6), not a poll. Accepted but not
   *  used by the current implementation. */
  readyPollIntervalMs?: number
  /** Max READY-poll attempts before EngineUnavailable (default 60). VESTIGIAL —
   *  mirrors the Unit GN shape; the A1 READY gate is a single fresh
   *  `getEngineStatus` call (§5.6), not a poll. Accepted but not used. */
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
  /** P4 idempotency/retry for mutating creates (createDocument/createWiki).
   *  Bounded, opt-in, retry-on-EngineUnavailable-only. */
  retry?: {
    /** Max retries for a mutating create on EngineUnavailable (default 0 = off). */
    maxRetries?: number
    /** Retry backoff base in ms (default 100). */
    backoffMs?: number
  }
}

/** The serde-frozen request bodies (P1a §4.2 — snake_case keys preserved
 *  verbatim under the `body` key; `null` for absent `Option` fields). */
export interface CreateDocumentRequest {
  title: string
  tags: string[] | null
  author: string | null
}
export interface UpdateDocumentRequest {
  baseRevision: number
  graph: Graph
  title: string | null
  tags: string[] | null
}
export interface ListDocumentsFilter {
  state: 'Draft' | 'Published' | 'Archived' | null
  tag: string | null
  page: number | null
  pageSize: number | null
}
/** The Graph serde body — embedded verbatim (the client does NOT re-case the
 *  graph internals; the node/edge inner shapes are not pinned by P1a and are
 *  passed through opaque). */
export interface Graph { nodes: GraphNode[]; edges: GraphEdge[] }
export interface GraphNode { [key: string]: unknown }
export interface GraphEdge { [key: string]: unknown }

/** The typed request-args (mirroring P1a `CrudRequestArgs` — camelCase top-level
 *  fields; `caller` present ONLY on the 7 mutating methods). */
export interface CreateDocumentArgs { caller: string; wikiId: string; body: CreateDocumentRequest }
export interface GetDocumentArgs { documentId: string }
export interface UpdateDocumentArgs { caller: string; documentId: string; body: UpdateDocumentRequest }
export interface DeleteDocumentArgs { caller: string; documentId: string }
export interface PublishDocumentArgs { caller: string; documentId: string }
export interface UnpublishDocumentArgs { caller: string; documentId: string }
export interface ArchiveDocumentArgs { caller: string; documentId: string }
export interface ListDocumentsArgs { wikiId: string; body: ListDocumentsFilter }
export interface CreateWikiArgs { caller: string; name: string }
export interface GetWikiArgs { wikiId: string }
export interface ListWikisArgs { /* empty */ }

/** The typed result types (mirroring the P1a serde bodies, snake→camel mapped).
 *  The FULL `Document` is the wire body for get/create/update/publish/unpublish/
 *  archive (§4.1.1). The `DocumentSummary` is the WIRE-EXACT subset the engine's
 *  `listDocuments` (Gnosis §4.1.3) returns per item — a full `Document` is NEVER
 *  on the list wire. */
export interface Document {
  documentId: string
  wikiId: string
  revision: number
  state: 'Draft' | 'Published' | 'Archived'
  graph: Graph
  title: string
  createdAt: string
  updatedAt: string
  tags: string[]
  author: string | null
}
/** A lightweight `Document` summary mirroring the wire `DocumentSummary` (Gnosis
 *  §4.1.3 / `src/store/mod.rs`) — the ONLY item shape on the list wire: six typed
 *  fields, NO `graph`/`tags`/`created_at`/`author`. snake→camel re-case:
 *  `document_id`→`documentId`, `wiki_id`→`wikiId`, `updated_at`→`updatedAt`. */
export interface DocumentSummary {
  documentId: string
  wikiId: string
  title: string
  state: 'Draft' | 'Published' | 'Archived'
  revision: number
  updatedAt: string
}
export interface DocumentList {
  /** `DocumentSummary[]` — NOT `Document[]`. The engine's `listDocuments`
   *  (Gnosis §4.1.3, `src/store/mod.rs`) returns a lightweight summary per item
   *  (§5.2); a full `Document` is never on the list wire. The pre-fix contract
   *  pinned `items: Document[]`, which the real engine never returns — the
   *  over-strong host contract behind `HOST-CRUD-LIST-SUMMARY-DECODE`. */
  items: DocumentSummary[]
  total: number
  page: number
  pageSize: number
}
export interface Wiki { wikiId: string; name: string }

/** The method discriminator (the 11 camelCase wire `"method"` values). */
export type CrudMethod =
  | 'createDocument' | 'getDocument' | 'updateDocument' | 'deleteDocument'
  | 'publishDocument' | 'unpublishDocument' | 'archiveDocument'
  | 'listDocuments' | 'createWiki' | 'getWiki' | 'listWikis'

/** The typed request-args union. */
export type CrudRequestArgs =
  | CreateDocumentArgs | GetDocumentArgs | UpdateDocumentArgs | DeleteDocumentArgs
  | PublishDocumentArgs | UnpublishDocumentArgs | ArchiveDocumentArgs
  | ListDocumentsArgs | CreateWikiArgs | GetWikiArgs | ListWikisArgs

/** The typed result union (discriminated by method). */
export type CrudResult =
  | { method: 'createDocument'; result: Document }
  | { method: 'getDocument'; result: Document }
  | { method: 'updateDocument'; result: Document }
  | { method: 'deleteDocument'; result: null }
  | { method: 'publishDocument'; result: Document }
  | { method: 'unpublishDocument'; result: Document }
  | { method: 'archiveDocument'; result: Document }
  | { method: 'listDocuments'; result: DocumentList }
  | { method: 'createWiki'; result: Wiki }
  | { method: 'getWiki'; result: Wiki }
  | { method: 'listWikis'; result: Wiki[] }

/** The CRUD-specific validation failure (mirroring P1a `CrudValidationFailure`). */
export type CrudValidationFailure =
  | { kind: 'UnexpectedRevision'; expected: number; actual: number }
  | { kind: 'UnexpectedState'; expected: 'Draft' | 'Published' | 'Archived'; actual: 'Draft' | 'Published' | 'Archived' }
  | { kind: 'InvalidPagination'; page: number; pageSize: number }
  | { kind: 'UnexpectedVoid' }

/** The proxy surface — the 11 document-CRUD methods. Each issues the REST call
 *  to the pinned endpoint path with the request envelope body, then decodes
 *  the response envelope. Each returns a Promise of the typed result. Throws a
 *  typed EngineWireError on any fail-state. ASYNC. */
export interface EngineCrudRagStore {
  createDocument(args: CreateDocumentArgs): Promise<Document>
  getDocument(args: GetDocumentArgs): Promise<Document>
  updateDocument(args: UpdateDocumentArgs): Promise<Document>
  deleteDocument(args: DeleteDocumentArgs): Promise<void>
  publishDocument(args: PublishDocumentArgs): Promise<Document>
  unpublishDocument(args: UnpublishDocumentArgs): Promise<Document>
  archiveDocument(args: ArchiveDocumentArgs): Promise<Document>
  listDocuments(args: ListDocumentsArgs): Promise<DocumentList>
  createWiki(args: CreateWikiArgs): Promise<Wiki>
  getWiki(args: GetWikiArgs): Promise<Wiki>
  listWikis(args: ListWikisArgs): Promise<Wiki[]>
}

/** Encode a CRUD request envelope (method + args). Total over the 11 methods —
 *  never emits an unknown method or a malformed envelope. PURE. */
export function encodeCrudRequest(method: CrudMethod, args: CrudRequestArgs): Envelope

/** Decode a CRUD request envelope back to (method, args). The inverse of
 *  encodeCrudRequest. PURE. */
export function decodeCrudRequest(env: Envelope): { method: CrudMethod; args: CrudRequestArgs }

/** Decode a CRUD response envelope PAYLOAD ({method, result|error}) to the
 *  typed CrudResult. The parameter is the envelope's `payload` object — NOT the
 *  full versioned envelope. Call sites decode the full envelope via
 *  `decodeEnvelope` (imported from engine-rag-store.ts) FIRST, then pass
 *  `env.payload` here. The golden vectors V-11/V-12 (P1a §9) are full versioned
 *  envelopes, so the conformance path is `decodeCrudResponse(decodeEnvelope(V-11).payload)`
 *  / `decodeCrudResponse(decodeEnvelope(V-12).payload)`. Throws a typed
 *  EngineWireError on any fail-state (decode-then-validate, §5.3). PURE. */
export function decodeCrudResponse(payload: unknown): CrudResult

/** Validate a decoded CRUD result against the CRUD-specific invariant for the
 *  method. Returns the CrudValidationFailure, or null if valid. PURE. */
export function validateCrudResult(method: CrudMethod, result: CrudResult): CrudValidationFailure | null

/** Create the proxy. Throws on a null/undefined opts, a non-loopback baseUrl,
 *  or a missing baseUrl. Does NOT contact the engine at construction. */
export function createEngineCrudRagStore(opts: EngineCrudRagStoreOptions): EngineCrudRagStore
```

**`validateCrudResult` signature note (pinned):** the `method: CrudMethod` parameter
is technically redundant with the `CrudResult` discriminated union (each variant
carries its own `method` discriminator), but it is kept to mirror P1a's
`validate_crud_result(method, result)` signature exactly (the wire contract's
signature). The TestWriter calls it as `validateCrudResult(method, result)` per
P1a §10; the `method` and the `result.method` discriminator must agree (a
mismatch is a caller error, not a validation failure).

**Pinned endpoint paths (consumed from P1a §7, H4 — the shell does NOT invent
them):**

```ts
export const ENGINE_CRUD_ENDPOINTS = {
  createDocument: 'POST /documents',
  getDocument: 'GET /documents/:id',
  updateDocument: 'POST /documents/:id/update',
  deleteDocument: 'DELETE /documents/:id',
  publishDocument: 'POST /documents/:id/publish',
  unpublishDocument: 'POST /documents/:id/unpublish',
  archiveDocument: 'POST /documents/:id/archive',
  listDocuments: 'GET /documents',
  createWiki: 'POST /wikis',
  getWiki: 'GET /wikis/:id',
  listWikis: 'GET /wikis',
} as const
```

The 11 paths are **pairwise distinct** and the table is a **bijection** between
the 11 paths and the 11 methods (the §5.7 `P-SM-1` row). The `:id` placeholder is
substituted with the URL-encoded `documentId`/`wikiId` from the args.

**Factory throw patterns:**

- `opts` null/undefined → throws `Error('engine crud rag store: opts required')`.
- `opts.baseUrl` not a non-empty string → throws
  `Error('engine crud rag store: baseUrl required')`.
- `opts.baseUrl` does not resolve to a loopback address (127.0.0.1 or ::1) →
  throws `Error('engine crud rag store: baseUrl must be loopback')`
  (LOOPBACK-AUTH-TLS).
- Construction does NOT contact the engine (no network I/O at construction).

**Return-shape rules:**

- `createDocument`/`getDocument`/`updateDocument`/`publishDocument`/
  `unpublishDocument`/`archiveDocument` resolve to the typed `Document`.
- `deleteDocument` resolves to `void` (the wire `result:null`).
- `listDocuments` resolves to the typed `DocumentList` whose `items` are
  `DocumentSummary[]` (the engine's §4.1.3 list wire), NOT full `Document`s.
- `createWiki`/`getWiki` resolve to the typed `Wiki`.
- `listWikis` resolves to the typed `Wiki[]`.

### 5.2 The wire shapes the client reproduces (golden-vector conformance)

The client is **encode+decode** (unlike Unit GN, which is decode-only): it
ENCODES the request envelope (method + args) and DECODES the response envelope
(result or error). The golden vectors **V-10..V-12** live in the wire contract
**`../Gnosis/docs/specs/p1a-document-crud-wire.md` §9** — they are the
**byte-exact conformance target**; the TestWriter reads BOTH this spec and P1a
§9 and asserts the client's encode functions emit the exact bytes of V-10 and
the decode functions parse the exact bytes of V-11/V-12 into the pinned typed
values.

**The versioned envelope (reused unchanged from F2 §4.1 / P1a §4.1):**

```json
{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":<crud request | crud response json>}
```

- `schemaVersion` = `1` (`CURRENT_SCHEMA_VERSION`).
- `idFormat` = `"opaque-string-v1"` (`ID_FORMAT_OPAQUE_STRING_V1`; ids cross as
  opaque strings; RFC-4122 is NOT implemented).
- `payload` = the CRUD request or response JSON.

**The CRUD request envelope (P1a §4.2 — the client's ENCODE output):**

```json
{"method":"<camelCase method>","args":{<per-method args>}}
```

The `args` object has **camelCase top-level fields** (`caller`, `wikiId`,
`documentId`, `name`, `body`). The serde-frozen store body is embedded verbatim
under a `body` key (the F2 "body via serde, don't re-case" rule — the body's
snake_case field keys and PascalCase enum-unit values are preserved exactly).
The RBAC `caller` field is present **only** on the 7 mutating methods.

| method | mutating? | `args` shape (the client's encode output) |
| --- | --- | --- |
| `createDocument` | **yes** | `{"caller":"…","wikiId":"<opaque>","body":<CreateDocumentRequest serde>}` |
| `getDocument` | no | `{"documentId":"<opaque>"}` |
| `updateDocument` | **yes** | `{"caller":"…","documentId":"<opaque>","body":<UpdateDocumentRequest serde>}` |
| `deleteDocument` | **yes** | `{"caller":"…","documentId":"<opaque>"}` |
| `publishDocument` | **yes** | `{"caller":"…","documentId":"<opaque>"}` |
| `unpublishDocument` | **yes** | `{"caller":"…","documentId":"<opaque>"}` |
| `archiveDocument` | **yes** | `{"caller":"…","documentId":"<opaque>"}` |
| `listDocuments` | no | `{"wikiId":"<opaque>","body":<ListDocumentsFilter serde>}` |
| `createWiki` | **yes** | `{"caller":"…","name":"<wiki name>"}` |
| `getWiki` | no | `{"wikiId":"<opaque>"}` |
| `listWikis` | no | `{}` |

**Serde-frozen body shapes (embedded under `body`, unchanged from the store
types' serde output):**

- `CreateDocumentRequest` → `{"title":"…","tags":[…],"author":"…"}` (snake_case
  keys; `tags`/`author` are `Option` — always present, `null` when `None`).
- `UpdateDocumentRequest` → `{"base_revision":<u64>,"graph":{…},"title":"…","tags":[…]}` (snake_case; `graph` is the `Graph` serde body `{"nodes":[…],"edges":[…]}`; `title`/`tags` are `Option`).
- `ListDocumentsFilter` → `{"state":<DocState|null>,"tag":<string|null>,"page":<u64|null>,"page_size":<u64|null>}` (snake_case; `DocState` serializes PascalCase `"Draft"`/`"Published"`/`"Archived"`; `null` when `None`).

**The CRUD response envelope (P1a §4.3 — the client's DECODE input):**

```json
{"method":"<camelCase method>","result":<serde-frozen result body>}
```
or
```json
{"method":"<camelCase method>","error":{"code":"<wire_code>","message":"<Display text>"}}
```

**Per-method result shapes (the `"result"` field):**

| method | result type | `"result"` serde body |
| --- | --- | --- |
| `createDocument` | `Document` | the `Document` serde body (snake_case; `state` PascalCase; `graph` nested; `author` `null` when `None`) |
| `getDocument` | `Document` | the `Document` serde body |
| `updateDocument` | `Document` | the `Document` serde body |
| `deleteDocument` | `()` (void) | `null` |
| `publishDocument` | `Document` | the `Document` serde body |
| `unpublishDocument` | `Document` | the `Document` serde body |
| `archiveDocument` | `Document` | the `Document` serde body |
| `listDocuments` | `DocumentList` | the `DocumentList` serde body `{"items":[…],"total":<u64>,"page":<u64>,"page_size":<u64>}` — **`items` is `Vec<DocumentSummary>`** (§4.1.3), the lightweight list wire; a full `Document` is never on this wire |
| `createWiki` | `Wiki` | the `Wiki` serde body `{"wiki_id":"<opaque>","name":"…"}` |
| `getWiki` | `Wiki` | the `Wiki` serde body |
| `listWikis` | `Vec<Wiki>` | a JSON array of `Wiki` serde bodies |

**`Document` serde body (the §4.1.1 shape, unchanged):**
```json
{"document_id":"<opaque>","wiki_id":"<opaque>","revision":<u64>,"state":"Draft|Published|Archived","graph":{"nodes":[…],"edges":[…] },"title":"…","created_at":"<ISO-8601>","updated_at":"<ISO-8601>","tags":[…],"author":<string|null>}
```

**`DocumentSummary` serde body (the §4.1.3 `listDocuments` item shape — the ONLY
item on the list wire):**
```json
{"document_id":"<opaque>","wiki_id":"<opaque>","title":"…","state":"Draft|Published|Archived","revision":<u64>,"updated_at":"<ISO-8601>"}
```
> `DocumentSummary` has **exactly six** fields: `document_id`, `wiki_id`, `title`,
> `state`, `revision`, `updated_at`. `graph`, `tags`, `created_at`, and `author`
> are **ABSENT** from the list wire by contract (Gnosis §4.1.3). The host decoder
> for a list item therefore accepts a summary that omits all four and NEVER
> throws on their absence — only a **malformed** summary (a missing/typed-wrong
> `document_id`, `wiki_id`, `title`, `state`, `revision`, or `updated_at`) throws.

**The wire body → typed-result mapping (the client's decode output, snake→camel
mapped):**

| wire field | typed field | transform |
| --- | --- | --- |
| `document_id` | `documentId` | key rename |
| `wiki_id` | `wikiId` | key rename |
| `revision` | `revision` | unchanged |
| `state` (`"Draft"`/`"Published"`/`"Archived"`) | `state` (`'Draft'`/`'Published'`/`'Archived'`) | unchanged (PascalCase preserved) |
| `graph` | `graph` | unchanged (embedded verbatim, not re-cased) |
| `title` | `title` | unchanged |
| `created_at` | `createdAt` | key rename |
| `updated_at` | `updatedAt` | key rename |
| `tags` | `tags` | unchanged |
| `author` | `author` | unchanged (`null` when `None`) |
| `items` | `items` | unchanged |
| `total` | `total` | unchanged |
| `page` | `page` | unchanged |
| `page_size` | `pageSize` | key rename |
| `name` | `name` | unchanged |

**List-item decode discipline (re-derived — `HOST-CRUD-LIST-SUMMARY-DECODE`):**
`listDocuments` items decode through a **lenient summary path** (`decodeDocumentSummary`), NOT
the strict full-`Document` decoder. Only the six summary fields (`document_id`,
`wiki_id`, `title`, `state`, `revision`, `updated_at`) are read; `graph`,
`tags`, `created_at`, `author` are **absent by contract** on the list wire and
never required. The decode is total over a well-formed summary and throws
`EngineError('malformed document')` only when a summary field is missing or
typed-wrong.

**Golden-vector conformance (P1a §9):**

- **V-10 — `encodeCrudRequest('createDocument', …)`** (a representative
  createDocument request envelope; `caller` present because createDocument is
  mutating):
  ```
  {"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"createDocument","args":{"caller":"user:alice","wikiId":"w1","body":{"title":"Getting Started","tags":["guide"],"author":"alice"}}}}
  ```
- **V-11 — a createDocument response envelope** (the `Document` body via serde —
  snake_case keys, `state` PascalCase `"Draft"`, `graph` nested, `revision:0`).
  **Decode path (pinned):** `decodeCrudResponse(decodeEnvelope(V-11).payload)` —
  the full envelope is decoded via `decodeEnvelope` FIRST, then the payload is
  passed to `decodeCrudResponse`:
  ```
  {"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"createDocument","result":{"document_id":"d1","wiki_id":"w1","revision":0,"state":"Draft","graph":{"nodes":[],"edges":[]},"title":"Getting Started","created_at":"2026-09-09T00:00:00Z","updated_at":"2026-09-09T00:00:00Z","tags":["guide"],"author":"alice"}}}
  ```
  → decodes to the typed `Document` `{documentId:'d1', wikiId:'w1', revision:0,
  state:'Draft', graph:{nodes:[],edges:[]}, title:'Getting Started',
  createdAt:'2026-09-09T00:00:00Z', updatedAt:'2026-09-09T00:00:00Z',
  tags:['guide'], author:'alice'}`.
- **V-12 — an updateDocument error envelope** (`ConflictError` → `"conflict"` →
  §11 HTTP 409). **Decode path (pinned):** `decodeCrudResponse(decodeEnvelope(V-12).payload)`:
  ```
  {"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"updateDocument","error":{"code":"conflict","message":"optimistic-concurrency conflict: stale base revision"}}}
  ```
  → throws `ConflictError` (409).

**Pinned facts about the mapping:**

- The mapping is deterministic and total over well-formed wire bodies.
- The client does NOT re-case the `graph` internals (the `Graph` body is embedded
  verbatim; the node/edge inner shapes are not pinned by P1a and pass through
  opaque).
- The client does NOT add or drop fields — the typed result is a faithful
  snake→camel projection of the wire body.

### 5.3 decode-then-validate for CRUD responses

The client's decoder reproduces P1a §10 (decode-then-validate):

```ts
/** Decode a CRUD response envelope payload ({method, result|error}) to the
 *  typed CrudResult. Throws a typed EngineWireError on any fail-state. */
export function decodeCrudResponse(payload: unknown): CrudResult

/** Validate a decoded CRUD result against the CRUD-specific invariant for the
 *  method. Returns the CrudValidationFailure, or null if valid. */
export function validateCrudResult(method: CrudMethod, result: CrudResult): CrudValidationFailure | null
```

**decode-then-validate precedence (pinned, P1a §10 — fail-fast on the
discriminator, then the body):**

1. The response `payload` must be an object with a `method` field (the
   discriminator). A missing/unknown `method` → `EngineError` (502).
2. The `method` must be one of the 11 known `CrudMethod` values. An unknown
   method → `EngineError` (502).
3. The `payload` must have **exactly one** of `result` or `error`. Both present
   or neither → `EngineError` (502).
4. If `error` present → decode the `{code,message}` via `wireCodeToError` and
   throw the typed error (a known code → the matching `EngineWireError`; an
   unknown code → `EngineError` (502)).
5. If `result` present → decode the serde-frozen body to the typed result for
   the method. A malformed body (wrong field types) → `EngineError` (502).
6. Validate the CRUD-specific invariant for the method. A failure →
   `EngineError` (502) naming the `CrudValidationFailure` variant.

**CRUD-specific validation invariants (P1a §10 — `validateCrudResult`):**

| method | validation invariant |
| --- | --- |
| `createDocument` | `Document.revision == 0` and `Document.state == 'Draft'` |
| `getDocument` | none (any well-formed `Document`) |
| `updateDocument` | none (any well-formed `Document`; the `revision + 1` check is a caller-side concern against the request's `baseRevision`) |
| `deleteDocument` | the result must be void (`result:null`) |
| `publishDocument` | `Document.state == 'Published'` |
| `unpublishDocument` | `Document.state == 'Draft'` |
| `archiveDocument` | `Document.state == 'Archived'` |
| `listDocuments` | `DocumentList.page >= 1`, `1 <= pageSize <= 100`; each `items` entry is a valid `DocumentSummary` (six typed fields — the §4.1.3 list wire) |
| `createWiki` | none (any well-formed `Wiki`) |
| `getWiki` | none (any well-formed `Wiki`) |
| `listWikis` | none (any well-formed `Wiki[]`) |

> **`listDocuments` validity re-derived:** `DocumentList.page >= 1` and
> `1 <= pageSize <= 100` are **unchanged** (the same `InvalidPagination`
> invariant). What changes is the item check: a valid `listDocuments` result has
> **well-formed `DocumentSummary` items** (six typed fields), and a summary is
> STILL valid when `graph`/`tags`/`created_at`/`author` are entirely absent. A
> `listDocuments` result whose item is a FULL `Document` body is valid too but is
> decoded to its six-field summary projection.

**`CrudValidationFailure` variants (mirroring P1a):**

- `UnexpectedRevision { expected, actual }` — `createDocument` must yield
  `revision == 0`.
- `UnexpectedState { expected, actual }` — `publishDocument`/`unpublishDocument`/
  `archiveDocument` must yield the documented state.
- `InvalidPagination { page, pageSize }` — `listDocuments` must yield
  `page >= 1`, `1 <= pageSize <= 100`.
- `UnexpectedVoid` — `deleteDocument` must yield void (`null`).

A validation failure is surfaced as `EngineError` (502) with a message naming the
variant (e.g. `'createDocument: unexpected revision (expected 0, got 1)'`).

### 5.4 The HTTP-status map + the error model (reused) + NEW-2 + RBAC

**Reused from `engine-rag-store.ts` (import, do NOT redefine):** `EngineWireError`,
`EngineUnavailable`, `EngineError`, `TraceUnavailable`, `ConflictError`,
`wireCodeToError`, `ENGINE_HTTP_STATUS` (all 21 rows), `decodeEnvelope`,
`Envelope`, `HealthReport`, `EngineErrorCode`. `ConflictError` = **409** is
**mandated** (FS-4).

**The per-method reachable `StoreError` set (P1a §6.1 — the wire-code fail-states
the client can receive via the `error` field):**

| CRUD method | reachable `StoreError` variants | §11 status |
| --- | --- | --- |
| `createDocument` | `WikiNotFound`, `ValidationError` | 404, 400 |
| `getDocument` | `DocumentNotFound` | 404 |
| `updateDocument` | `DocumentNotFound`, `ValidationError`, `ConflictError` | 404, 400, **409** |
| `deleteDocument` | `DocumentNotFound`, `DocumentInUse` | 404, 409 |
| `publishDocument` | `DocumentNotFound`, `UnresolvedReference` | 404, 422 |
| `unpublishDocument` | `DocumentNotFound`, `InvalidState` | 404, 409 |
| `archiveDocument` | `DocumentNotFound`, `InvalidState` | 404, 409 |
| `listDocuments` | `WikiNotFound`, `ValidationError` | 404, 400 |
| `createWiki` | `ValidationError` | 400 |
| `getWiki` | `WikiNotFound` | 404 |
| `listWikis` | — (no fail-state) | — |

**NEW-2 request-decode outcome (pinned as a client-side awareness):** a malformed
CRUD request / unknown method is a **transport-level status (400/422), NOT 502**
(P1a §6.2). The client's `encodeCrudRequest` is **total over the 11 methods** and
always produces a well-formed request envelope (never an unknown method, never a
malformed envelope), so the client **never triggers** the server's request-decode
400/422 path from its own well-formed requests. The client is aware of the NEW-2
outcome as a wire-contract fact but cannot produce it. A non-2xx response whose
body is NOT a decodable response envelope (e.g. a transport-level 400/422 body
that is not a `StoreError` envelope) → `EngineError` (502) — the client cannot
classify a non-`StoreError` transport body into the typed error model (§5.9
fail-state 17).

**RBAC `caller` threading (P1a §8, H3):** mutating requests carry `caller`;
read-only requests carry no `caller`. The client's typed args enforce this at the
**type level**: the 7 mutating args types (`CreateDocumentArgs`,
`UpdateDocumentArgs`, `DeleteDocumentArgs`, `PublishDocumentArgs`,
`UnpublishDocumentArgs`, `ArchiveDocumentArgs`, `CreateWikiArgs`) **require** a
`caller: string`; the 4 read-only args types (`GetDocumentArgs`,
`ListDocumentsArgs`, `GetWikiArgs`, `ListWikisArgs`) have **no** `caller` field.
The client never emits a mutating request without `caller` and never emits a
read-only request with `caller`. A mutating request with no `caller` is a
**request-decode 400** server-side (P1a §10) — the client cannot produce it. A
read-only request with a `caller` is **tolerated** (ignored) server-side — the
client never produces it.

### 5.5 The transport

Each CRUD method issues the REST call to the pinned endpoint path with the
request envelope, then decodes the response envelope. The HTTP verb per method is
pinned (P1a §7):

| method | endpoint path | verb | transport of the request envelope |
| --- | --- | --- | --- |
| `createDocument` | `POST /documents` | POST | JSON request body |
| `getDocument` | `GET /documents/:id` | GET | JSON request body; `:id` = `documentId` |
| `updateDocument` | `POST /documents/:id/update` | POST | JSON request body; `:id` = `documentId` |
| `deleteDocument` | `DELETE /documents/:id` | DELETE | JSON request body; `:id` = `documentId` |
| `publishDocument` | `POST /documents/:id/publish` | POST | JSON request body; `:id` = `documentId` |
| `unpublishDocument` | `POST /documents/:id/unpublish` | POST | JSON request body; `:id` = `documentId` |
| `archiveDocument` | `POST /documents/:id/archive` | POST | JSON request body; `:id` = `documentId` |
| `listDocuments` | `GET /documents` | GET | JSON request body |
| `createWiki` | `POST /wikis` | POST | JSON request body |
| `getWiki` | `GET /wikis/:id` | GET | JSON request body; `:id` = `wikiId` |
| `listWikis` | `GET /wikis` | GET | JSON request body |

**Transport rules (pinned):**

- **ALL methods (POST/GET/DELETE):** the request envelope is the **JSON request
  body** (`content-type: application/json`). This matches the landed P2 server:
  the `gnosis-server` `crud_handler` (`src/bin/gnosis_server.rs`) extracts the
  request body as a `String` and parses it via `Envelope::from_json` for **every**
  CRUD endpoint, regardless of HTTP verb — so the client sends the envelope in the
  body for GET endpoints too (a GET-with-body is the established transport; the
  server does not read a query param).
- **`:id` substitution:** the client replaces the `:id` placeholder in the
  endpoint path with the URL-encoded `documentId`/`wikiId` from the args. The path
  id and the envelope's `documentId`/`wikiId` must agree (the client derives both
  from the same `args.documentId`/`args.wikiId`).
- **READY gate:** each CRUD call (all 11 methods, mutating AND read-only) issues a
  **fresh `getEngineStatus`** (a REST `GET /engine/status`) immediately before
  proceeding, gated on `state == Ready` (§5.6). The gate is NOT a cached
  observation and NOT caller-supplied.
- **D2 engine-absent:** a connection-refused → `EngineUnavailable` (503,
  `cause: 'connection-refused'`); engine-not-spawned → `EngineUnavailable` (503,
  `cause: 'engine-not-spawned'`) (§5.6).
- **Per-request timeout:** `requestTimeoutMs` (default 10_000) applies to every
  fetch; a timeout → `EngineUnavailable` (503, `cause: 'connection-refused'`).
- **P4 retry (mutating creates only):** `createDocument`/`createWiki` with
  `retry.maxRetries > 0` retry on `EngineUnavailable` (503) up to `maxRetries`
  times with `backoffMs` (default 100) between attempts. Each retry re-issues a
  fresh READY gate + the same request envelope. A non-`EngineUnavailable` error is
  NOT retried. After the budget → `EngineUnavailable` (503).

### 5.6 READY observation + D2 engine-absent behavior

**READY observation (the shell observes, it does not drive):**

- **Gating mechanism (pinned):** each CRUD call (all 11 methods) issues a **fresh
  `getEngineStatus`** (a REST `GET /engine/status`) immediately before proceeding.
  The gate is NOT a cached observation and NOT caller-supplied — every CRUD call
  observes the engine's current state itself. A CRUD call when the freshly-
  observed `state != 'Ready'` → `EngineUnavailable` with `cause: 'not-ready'`
  (for `'Starting'`/`'Degraded'`) or `cause: 'unavailable-state'` (for
  `'Unavailable'`). The gate is a deterministic function of the observed state
  (P-SM-2).
- **Degraded is a gate, not an error to observe:** `getEngineStatus`/`health`
  report a `Degraded` state faithfully (a `HealthReport` with `state: 'Degraded'`
  and a non-null `lastError` — a faithful projection, never invented). Observing
  `Degraded` is NOT an error. But a CRUD call when the observed state is
  `Degraded` is **gated** → `EngineUnavailable` (503, `cause: 'not-ready'`),
  because CRUD calls are gated on `state == Ready`. There is NO non-throw path for
  a CRUD call in a `Degraded` state.
- The engine's own boot wiring (construct `Arc<Store>` → build `DerivedIndexes` →
  wire the embedding provider → transition to `READY`) is **engine-internal**; the
  shell does not drive it.

**D2 engine-absent = UNAVAILABLE:**

- **Connection-refused** (the fetch connection is refused — e.g. `ECONNREFUSED`)
  → `EngineUnavailable` with `cause: 'connection-refused'`.
- **Engine-not-spawned** (no server process at the bind address — a distinct
  shell-side diagnostic) → `EngineUnavailable` with `cause: 'engine-not-spawned'`.
  Both map to HTTP 503 but are distinct shell-side paths (the proxy distinguishes
  them for diagnostics).
- **DEGRADED vs UNAVAILABLE:** DEGRADED is a distinct state — the engine is
  running but a non-core subsystem (embedding/reranker) is down; core
  store/graph/lexical still work. UNAVAILABLE is engine-absent. The proxy reports
  the state faithfully (a faithful projection; it does not invent a `lastError`).
- **Local-first store vs engine store:** the shell's local-first store
  (`createJsonRagStore`, Unit A) and cross-link features work without the engine;
  engine-backed document-store features surface `EngineUnavailable`. The D2
  "document store works without the engine" claim refers to the shell's OWN
  local-first store, NOT the engine's `RagStore` persistence (which is engine-side
  and unavailable when the engine is absent).

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §6/FS-n rows. **At most 8 rows.** Each row: id, the invariant it
pins, the generator/strategy that exercises it, and the deterministic pinned seed
+ attempt budget (≤100 attempts/row, ≤400 total, stop-after-5). The register is
genuinely invariant-bearing (request round-trip identity, response/error decode
determinism, the `listDocuments` summary-decode contract, method + endpoint
uniqueness/bijection, RBAC caller preservation, envelope stability,
decode-then-validate totality).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
|---|---|---|---|---|
| `P-IM-1` | IM | **CRUD request round-trip identity.** For **any** `(method, args)` over the 11 `CrudMethod` values with well-formed per-method `args` (the serde-frozen bodies built per §5.2), decoding the envelope that `encodeCrudRequest` produced returns the identical `(method, args)` — the `method` discriminator and every `args` field (incl. the RBAC `caller` on mutating methods and the serde-frozen `body` verbatim) round-trip element-wise. | `strat:crud-request-roundtrip` | ∀ generated `(method, args)`: `decodeCrudRequest(encodeCrudRequest(method, args))` has `method` `==` and `args` element-wise `==` (caller, ids, and the full serde-frozen body). |
| `P-IM-2` | IM | **CRUD response decode determinism + golden-vector conformance.** For **any** well-formed response envelope (a `(method, result)` satisfying the CRUD-specific invariants of §5.3), `decodeCrudResponse` returns a **deterministic** typed `CrudResult` — for a `listDocuments` result the decoded `DocumentList.items` are `DocumentSummary[]` (the six-field §5.1 summary, not full `Document`s); decoding the same payload twice yields the same `CrudResult`. The golden vector **V-11** (P1a §9) decodes to the pinned typed `Document`. | `strat:crud-response-decode` | ∀ well-formed `(method, result)`: `decodeCrudResponse(env.payload)` is deterministic; for a `listDocuments` result `env.payload`, the decoded `items` are typed `DocumentSummary[]`; `decodeCrudResponse(decodeEnvelope(V-11).payload)` equals the pinned typed `Document`. |
| `P-IM-3` | IM | **CRUD error decode determinism + round-trip.** For **any** `(method, e)` over the 11 methods and the 21-code `EngineErrorCode` set, decoding an error envelope with code `e` throws the **matching** typed error (code + §11 httpStatus); the golden vector **V-12** (`ConflictError`) decodes to `ConflictError` (409). | `strat:crud-error-decode` | ∀ `(method, e)`: `decodeCrudResponse({method, error:{code:e, message}})` throws an `EngineWireError` with `code == e` and `httpStatus == ENGINE_HTTP_STATUS[e]`; `decodeCrudResponse(decodeEnvelope(V-12).payload)` throws `ConflictError` (409). |
| `P-IM-4` | IM | **`listDocuments` summary-decode contract.** For **any** `listDocuments` result whose `items` are well-formed `DocumentSummary` wire bodies (the six typed fields `document_id`/`wiki_id`/`title`/`state`/`revision`/`updated_at`; `graph`/`tags`/`created_at`/`author` ABSENT is legal), the decode maps every item to a typed `DocumentSummary` and **never throws on an absent `graph`/`tags`/`created_at`/`author`**; a **malformed** summary (a missing or non-string `document_id`/`wiki_id`/`title`/`updated_at`, a `state` not one of `Draft`/`Published`/`Archived`, or a non-number `revision`) throws `EngineError('malformed document')` (502). | `strat:crud-summary-decode` | ∀ well-formed summary `items`: the decoded `DocumentSummary[]` matches the pinned six-field projection and the decode does NOT throw when `graph`/`tags`/`created_at`/`author` are absent; ∀ malformed summary item (missing/typed-wrong `document_id` etc.): `decodeCrudResponse` throws `EngineError('malformed document')` (502). |
| `P-SM-1` | SM | **Method + endpoint uniqueness/bijection.** The 11 `CrudMethod` values are **11 pairwise-distinct non-empty camelCase strings** (a deterministic pure function of the value — the same value always yields the same string; the same string never names two methods), and the 11 pinned endpoint paths (§5.1) are **pairwise distinct** with each mapping to **exactly one** `CrudMethod`; the `ENGINE_CRUD_ENDPOINTS` table is a bijection between the 11 paths and the 11 methods. | `strat:crud-method-endpoint-unique` | ∀ distinct `a,b: CrudMethod`: `a != b`; `!a.isEmpty()`; `a == a` on repeat/equal values; ∀ distinct `(path_a, method_a), (path_b, method_b)` in `ENGINE_CRUD_ENDPOINTS`: `path_a != path_b`; `method_a != method_b`; the table has exactly 11 rows, one per `CrudMethod`. |
| `P-SM-2` | SM | **RBAC `caller` preservation.** For **any** mutating `(method, args)` (the 7 mutating methods), the encoded request carries `caller` and it round-trips; for **any** read-only `(method, args)` (the 4 read-only methods), the encoded request carries **no** `caller` field. | `strat:crud-caller-preserved` | ∀ mutating `(method, args)`: `decodeCrudRequest(encodeCrudRequest(method, args)).args` has `caller == args.caller`; ∀ read-only `(method, args)`: the encoded `args` object has no `"caller"` key. |
| `P-SM-3` | SM | **Envelope stability.** For **any** CRUD request envelope the client builds, `schemaVersion` is `1` and `idFormat` is `'opaque-string-v1'`; serializing and re-parsing preserves the three fields. | `strat:crud-envelope-stable` | ∀ CRUD request envelope `env` (from `encodeCrudRequest`): `JSON.parse(JSON.stringify(env))` `==`-equals `env` (payload `Value` `==`-equal); `env.schemaVersion == 1`; `env.idFormat == 'opaque-string-v1'`. |
| `P-TP-1` | TP | **decode-then-validate totality on well-formed input.** For **any** well-formed `(method, result)` satisfying the CRUD-specific invariants of §5.3 — for `listDocuments`, a well-formed result whose `items` are well-formed `DocumentSummary` bodies (six typed fields; `graph`/`tags`/`created_at`/`author` omitted is still well-formed) — `validateCrudResult(method, result)` is `null` (never a `CrudValidationFailure`); equivalently the decode path never throws a validation `EngineError` on a well-formed result. | `strat:crud-validate-total` | ∀ well-formed `(method, result)`: `validateCrudResult(method, result) == null`; `decodeCrudResponse` of the corresponding well-formed response envelope is `ok` (never a validation `EngineError`). |

**Class tally:** IM ×4 (P-IM-1..4, incl. the summary-decode P-IM-4), SM ×3, TP ×1 = **8 rows ≤ 8** ✔.

**PBT-gate note (determinism/seeding):** the TestWriter's executed property layer
runs under the test runner with a **deterministic pinned seed** (`0xA1A1A1A1` —
the unit's mnemonic "A1"), **≤100 generated cases per register row**, **≤400
total cases** across the unit's whole property layer, **stop-after-5** (report ≤5
distinct held/broken counterexamples per row), and records each row as **held** or
**broken** together with its `Strategy-id`. The adversarial reviewer then reads
this register with the executed artifacts and performs a read-only PBT audit
(per-row over-strength reasoning, generator-coverage check, prose
counterexamples, negative-generator requests); reviewers never run generators.

**Reserved-variant discipline applied.** The method set (11 `CrudMethod` values)
and the result set (11 `CrudResult` variants) are **closed** — there are no
reserved methods/results. The generator restriction is **well-formedness on the
decode side**: never generate a `CrudResult` that violates a CRUD-specific
invariant (e.g. a `createDocument` result with `revision != 0` or `state !=
'Draft'`), an unknown `schema_version`/`id_format`, or a malformed
request/response — those are `EngineError`/validation fail-states (the auditor's
negative-generator territory), **not** invariant rows. The unit has **no**
reserved fail-variant rows (no `FS-*` rows) by the invariant-only rule. The
**P-IM-4** summary-decode row deliberately carries the malformed-summary
`EngineError('malformed document')` throw as an explicit negative assertion
inside its invariant (mirroring the GN `P-IM-4`/`P-SM-1` negative-generator
pattern); a malformed summary is a decode fail-state, never a `CrudResult`
the generators produce.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Factory happy:** `createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080' })`
   → returns a proxy; no network I/O at construction.
2. **`createDocument` happy:** a `POST /documents` returns a `createDocument`
   response envelope with a `Document` body (`revision:0`, `state:'Draft'`) →
   resolves to the typed `Document`.
3. **`getDocument` happy:** a `GET /documents/:id` returns a `getDocument`
   response envelope with a `Document` body → resolves to the typed `Document`.
4. **`updateDocument` happy:** a `POST /documents/:id/update` returns an
   `updateDocument` response envelope with a `Document` body → resolves to the
   typed `Document`.
5. **`deleteDocument` happy:** a `DELETE /documents/:id` returns a
   `deleteDocument` response envelope with `result:null` → resolves to `void`.
6. **`publishDocument` happy:** a `POST /documents/:id/publish` returns a
   `publishDocument` response envelope with a `Document` body (`state:'Published'`)
   → resolves to the typed `Document`.
7. **`unpublishDocument` happy:** a `POST /documents/:id/unpublish` returns an
   `unpublishDocument` response envelope with a `Document` body (`state:'Draft'`)
   → resolves to the typed `Document`.
8. **`archiveDocument` happy:** a `POST /documents/:id/archive` returns an
   `archiveDocument` response envelope with a `Document` body (`state:'Archived'`)
   → resolves to the typed `Document`.
9. **`listDocuments` happy:** a `GET /documents` returns a `listDocuments`
   response envelope with a `DocumentList` body (`page>=1`, `1<=pageSize<=100`;
   `items` are `DocumentSummary` serde bodies — six fields, no
   `graph`/`tags`/`created_at`/`author`) → resolves to the typed `DocumentList`
   whose `items` are `DocumentSummary[]`. A list item that carries a full
   `Document` body (incl. `graph`/`tags`/`created_at`/`author`) is also valid
   and decodes to its six-field summary projection.
10. **`createWiki` happy:** a `POST /wikis` returns a `createWiki` response
    envelope with a `Wiki` body → resolves to the typed `Wiki`.
11. **`getWiki` happy:** a `GET /wikis/:id` returns a `getWiki` response envelope
    with a `Wiki` body → resolves to the typed `Wiki`.
12. **`listWikis` happy:** a `GET /wikis` returns a `listWikis` response envelope
    with a `Wiki[]` body → resolves to the typed `Wiki[]`.
13. **Golden-vector conformance:** the client's `encodeCrudRequest` emits the exact
    bytes of V-10; `decodeCrudResponse` parses the exact bytes of V-11/V-12 into
    the pinned typed values.
14. **Loopback enforcement:** `createEngineCrudRagStore({ baseUrl:
    'http://127.0.0.1:8080' })` → OK; `baseUrl: 'http://localhost:8080'` (if it
    resolves to loopback) → OK; a non-loopback address → throws.
15. **READY gate happy:** a CRUD call when the freshly-observed state is `Ready`
    → proceeds to the REST call.
16. **RBAC caller threading happy:** a mutating request carries `caller`; a
    read-only request carries no `caller` (the encoded request envelope reflects
    the args type).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createEngineCrudRagStore` with null/undefined opts** → throws
   `Error('engine crud rag store: opts required')`.
2. **`createEngineCrudRagStore` with a missing/empty `baseUrl`** → throws
   `Error('engine crud rag store: baseUrl required')`.
3. **`createEngineCrudRagStore` with a non-loopback `baseUrl`** → throws
   `Error('engine crud rag store: baseUrl must be loopback')` (LOOPBACK-AUTH-TLS).
4. **A CRUD call when the freshly-observed state is not `Ready`** → rejects with
   `EngineUnavailable` (503, `cause: 'not-ready'` for `'Starting'`/`'Degraded'`,
   `cause: 'unavailable-state'` for `'Unavailable'`).
5. **A CRUD call connection-refused** → rejects with `EngineUnavailable` (503,
   `cause: 'connection-refused'`).
6. **A CRUD call engine-not-spawned** → rejects with `EngineUnavailable` (503,
   `cause: 'engine-not-spawned'`).
7. **A CRUD call with a malformed response envelope** (missing
   `schemaVersion`/`idFormat`/`payload`, or a wrong field type) → rejects with
   `EngineError` (502).
8. **A CRUD response with an unknown `schemaVersion`** (e.g. `99`) → rejects with
   `EngineError` (502) (`UnsupportedSchemaVersion`).
9. **A CRUD response with an unknown `idFormat`** (e.g. `"uuid-v4"`) → rejects
   with `EngineError` (502) (`UnknownIdFormat`).
10. **A CRUD response payload with a missing/unknown `method` discriminator** →
    rejects with `EngineError` (502).
11. **A CRUD response payload with both `result` and `error`, or neither** →
    rejects with `EngineError` (502).
12. **A CRUD response with an `error` field for a known wire code** → rejects with
    the matching typed error. This tests the **total** `wireCodeToError`
    translation (all 21 §11 codes, not just the 7-variant CRUD-reachable set of
    §5.4 — the translation is total over the 21 codes, so a CRUD response can
    carry any of them). The 10 codes enumerated below are **representative**; the
    **full 21-code set is derivable from the imported `EngineErrorCode` union and
    `ENGINE_HTTP_STATUS`** (imported from `engine-rag-store.ts`, §5.4/§5.10), so
    the TestWriter's red set covers the total:
    `DocumentNotFound`→`EngineWireError` (404), `WikiNotFound`→`EngineWireError`
    (404), `ValidationError`→`EngineWireError` (400), `ConflictError`→`ConflictError`
    (409), `DocumentInUse`→`EngineWireError` (409), `InvalidState`→`EngineWireError`
    (409), `UnresolvedReference`→`EngineWireError` (422), `EngineUnavailable`→
    `EngineUnavailable` (503, `cause: 'unavailable-state'`), `EngineError`→
    `EngineError` (502), `TraceUnavailable`→`TraceUnavailable` (502).
13. **A CRUD response with an `error` field for an UNKNOWN wire code** → rejects
    with `EngineError` (502).
14. **A CRUD response with a malformed `result` body** (wrong field types) →
    rejects with `EngineError` (502). **List-specific (§4.1.3):** a
    `listDocuments` result with a **malformed `DocumentSummary` item** (a missing
    or non-string `document_id`/`wiki_id`/`title`/`updated_at`, a `state` not one
    of `Draft`/`Published`/`Archived`, or a non-number `revision`) → rejects with
    `EngineError('malformed document')` (502). A summary item that simply omits
    `graph`/`tags`/`created_at`/`author` is **NOT** malformed (those are absent by
    contract).
15. **A CRUD response with a well-formed body failing a CRUD-specific invariant**
    → rejects with `EngineError` (502) naming the `CrudValidationFailure` variant:
    - 15a. `createDocument` with `revision != 0` → `UnexpectedRevision`.
    - 15b. `createDocument` with `state != 'Draft'` → `UnexpectedState`.
    - 15c. `publishDocument` with `state != 'Published'` → `UnexpectedState`.
    - 15d. `unpublishDocument` with `state != 'Draft'` → `UnexpectedState`.
    - 15e. `archiveDocument` with `state != 'Archived'` → `UnexpectedState`.
    - 15f. `listDocuments` with `page < 1` or `pageSize < 1` or `pageSize > 100`
      → `InvalidPagination`.
    - 15g. `deleteDocument` with a non-null result → `UnexpectedVoid`.
16. **A CRUD response whose `method` does not match the result variant** (e.g.
   `"method":"getWiki"` with a `Document` result) → rejects with `EngineError`
   (502) (method/result mismatch).
17. **A non-2xx response whose body is NOT a decodable response envelope** (e.g. a
   transport-level NEW-2 400/422 body that is not a `StoreError` envelope) →
   rejects with `EngineError` (502) — the client cannot classify a non-`StoreError`
   transport body into the typed error model.
18. **P4 retry exhausted:** a mutating create (`createDocument`/`createWiki`) with
   `retry.maxRetries > 0` that keeps hitting `EngineUnavailable` past the retry
   budget → rejects with `EngineUnavailable` (503).

**Pinned non-throws / type-level guarantees:**

- A mutating request always carries `caller` (the args type requires it); the
  client never emits a mutating request without `caller` — the server's request-
  decode 400 for a missing `caller` is never triggered by the client.
- A read-only request never carries `caller` (the args type has no `caller`
  field); the client never emits a read-only request with `caller`.
- The client never triggers the NEW-2 request-decode 400/422 path from its own
  well-formed requests (`encodeCrudRequest` is total over the 11 methods).
- A non-`EngineUnavailable` error is NOT retried by the P4 retry (only
  `EngineUnavailable` is retried).

### 5.10 Census / numeric claims

- **New module:** `src/main/engine-crud-rag-store.ts`.
- **New exported factory:** `createEngineCrudRagStore(opts)`.
- **New exported types:** `EngineCrudRagStoreOptions`, `EngineCrudRagStore`,
  `CreateDocumentArgs`, `GetDocumentArgs`, `UpdateDocumentArgs`,
  `DeleteDocumentArgs`, `PublishDocumentArgs`, `UnpublishDocumentArgs`,
  `ArchiveDocumentArgs`, `ListDocumentsArgs`, `CreateWikiArgs`, `GetWikiArgs`,
  `ListWikisArgs`, `CrudMethod`, `CrudRequestArgs`, `CrudResult`,
  `CrudValidationFailure`, `Document`, `DocumentSummary`, `DocumentList`, `Wiki`,
  `CreateDocumentRequest`, `UpdateDocumentRequest`, `ListDocumentsFilter`,
  `Graph`, `GraphNode`, `GraphEdge`.
- **New exported functions:** `encodeCrudRequest`, `decodeCrudRequest`,
  `decodeCrudResponse`, `validateCrudResult`.
- **New exported constants:** `ENGINE_CRUD_ENDPOINTS` (11 paths).
- **Imported from `engine-rag-store.ts` (NOT redefined, NOT re-exported here):**
  `EngineWireError`, `EngineUnavailable`, `EngineError`, `TraceUnavailable`,
  `ConflictError`, `wireCodeToError`, `ENGINE_HTTP_STATUS`, `decodeEnvelope`,
  `Envelope`, `HealthReport`, `EngineErrorCode`, `EngineRagStoreOptions` (the base
  shape for `EngineCrudRagStoreOptions`).
- **Proxy surface method count:** **11** (`createDocument`, `getDocument`,
  `updateDocument`, `deleteDocument`, `publishDocument`, `unpublishDocument`,
  `archiveDocument`, `listDocuments`, `createWiki`, `getWiki`, `listWikis`).
- **Endpoint count:** **11** (`ENGINE_CRUD_ENDPOINTS`), pairwise distinct,
  bijective with the 11 methods.
- **HTTP-status map row count:** **21** (all §11 rows, imported from
  `engine-rag-store.ts`). `ConflictError` = **409** (mandated).
- **Wire-code count:** **21** (the closed `EngineErrorCode` union, imported).
- **CRUD-reachable `StoreError` variants:** **7** (`DocumentNotFound`,
  `WikiNotFound`, `ValidationError`, `ConflictError`, `DocumentInUse`,
  `InvalidState`, `UnresolvedReference`).
- **Mutating methods (require `caller`):** **7** (`createDocument`,
  `updateDocument`, `deleteDocument`, `publishDocument`, `unpublishDocument`,
  `archiveDocument`, `createWiki`).
- **Read-only methods (no `caller`):** **4** (`getDocument`, `listDocuments`,
  `getWiki`, `listWikis`).
- **`CrudValidationFailure` variants:** **4** (`UnexpectedRevision`,
  `UnexpectedState`, `InvalidPagination`, `UnexpectedVoid`).
- **Golden conformance vectors:** **V-10..V-12** (P1a §9) — the byte-exact
  conformance target (V-10 = request encode; V-11 = response decode; V-12 = error
  decode).
- **PBT register:** **8 rows** (IM ×4, SM ×3, TP ×1), ≤100 attempts/row, ≤400
  total, stop-after-5, deterministic pinned seed `0xA1A1A1A1`.
- **P4 idempotency/retry resolution (pinned):** A1 delivers a **bounded, opt-in
  retry-on-`EngineUnavailable`** for the two mutating create methods
  (`createDocument`, `createWiki`), configured via the factory `retry` option
  (`maxRetries` default 0 = off, `backoffMs` default 100). The retry is **only**
  on `EngineUnavailable` (503) — the D2 engine-absent/transient transport case —
  and is **bounded** (never infinite). The retry re-issues the same request
  envelope after a fresh READY gate. **Idempotency-key-based dedup is explicitly
  DEFERRED to A2** (recorded decision): P1a's frozen wire carries **no
  idempotency-key field**, and A1 must not invent wire fields; the A2 unit owns
  the caller-side dedup/UX for the duplicate-create risk. This satisfies the
  roadmap's "required deliverable of the A1/A2 unit specs" by pinning the A1 half
  (bounded retry) and recording the A2 half (idempotency-key dedup).
- **Test-count expectation:** the TestWriter's red set covers §5.8 (16 happy
  states) + §5.9 (18 fail-states + the pinned non-throws) + the §5.2 golden-vector
  conformance + the §5.7 PBT register. The exact count is the TestWriter's; the
  spec pins the state surface, not the count.

### 5.11 Cross-references

- **The roadmap (the A1 scope):**
  `docs/specs/unblock-gnosis-remaining-endpoints.md` — §6.1 (A1), §5.1 (P1a), §5.2
  (P2), §7.1 (the §11 map), §7.2 (auth/TLS), §7.3 (D2 engine-absent), §7.5
  (golden-vector conformance), §8 (the execution order).
- **The document-CRUD wire contract (the frozen shapes):**
  `../Gnosis/docs/specs/p1a-document-crud-wire.md` — §4 (the request/response
  envelopes + per-method args/result shapes), §6.1 (the CRUD-reachable
  `StoreError` set), §6.2 (NEW-2 request-decode outcome), §7 (the endpoint paths,
  H4), §8 (the RBAC `caller` shape), §9 (golden vectors V-10..V-14), §10
  (valid/happy + fail states per function + the CRUD-specific validation
  invariants).
- **The server spec (the endpoint A1 talks to):**
  `../Gnosis/docs/specs/p2-gnosis-server.md` — §5.2 (the 11 CRUD endpoints), §7
  (status rendering + NEW-2), §8 (RBAC `caller` threading — decode-layer only),
  §10 (valid/fail states per endpoint).
- **The LANDED retrieval-trio proxy (the pattern A1 reuses):**
  `docs/specs/unit-gn-engine-integration.md` — §5.1 (the factory + proxy surface),
  §5.3 (decode-then-validate), §5.4 (the §11 map + `EngineWireError` model), §5.6
  (READY observation + D2 engine-absent), §5.7 (the PBT register format).
- **The LANDED implementation (the import source):**
  `src/main/engine-rag-store.ts` — `EngineWireError`, `EngineUnavailable`,
  `EngineError`, `TraceUnavailable`, `ConflictError`, `wireCodeToError`,
  `ENGINE_HTTP_STATUS`, `decodeEnvelope`, `Envelope`, `HealthReport`,
  `EngineErrorCode`, `EngineRagStoreOptions`.
- **The Astrographer `RagStore` interface (DIFFERENT from the Gnosis `RagStore`
  trait):** `docs/specs/unit-a-rag-store.md` §5.4 — the node/edge CRUD store the
  shell's local-first store implements. The `createEngineCrudRagStore` proxy is a
  NEW surface (the document-CRUD wire client), NOT the `RagStore` CRUD interface.
- **The behavior contract:** `../Gnosis/docs/specs/gnosis.md` §4.1 (the document
  store), §4.1.1 (the DRAFT→PUBLISHED→ARCHIVED state machine), **§4.1.3
  (`listDocuments` returns `DocumentList { items: DocumentSummary[], total, page,
  page_size }` — the summary wire this re-derivation targets)**, §4.1.4 (optimistic
  concurrency, `ConflictError` = 409), §4.4.3 (the publish gate,
  `UnresolvedReference`), §4.4.5 (delete integrity, `DocumentInUse`), §6
  (FS-1..FS-26), §4.6.2 (no engine MCP/GUI; the "engine is optional" framing).
- **Decision rows to add when the unit lands:** `docs/decisions.md` —
  **ENGINE-CRUD-WIRE-CLIENT**, **ENCODE+DECODE**, **P4-IDEMPOTENCY-RETRY**;
  consumed **DECODE-THEN-VALIDATE-FOR-CRUD**, **HTTP-STATUS-RENDERING**,
  **RBAC-CALLER-THREADING**, **READY-OBSERVATION**, **D2-ENGINE-ABSENT-UNAVAILABLE**,
  **LOOPBACK-AUTH-TLS**.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for `src/main/engine-crud-rag-store.ts` from
§5.8/§5.9, and asserts the golden-vector conformance (§5.2) + the PBT register
(§5.7) hold. The red set (recorded in the next-steps DONE row for this unit):

- **The factory + proxy surface:** the happy states 1, 14 (loopback) + the
  fail-states 1–3 (opts/baseUrl/loopback).
- **The 11 CRUD methods:** the happy states 2–12 (each method's request → typed
  result) + the fail-states 4–18 (not-ready gate, connection-refused,
  engine-not-spawned, malformed envelope, unknown schemaVersion/idFormat, missing/
  unknown method discriminator, both/neither result+error, known/unknown wire
  codes, malformed result body, CRUD validation failures, method/result mismatch,
  non-2xx non-envelope body, P4 retry exhausted).
- **decode-then-validate:** the happy state 13 (golden-vector conformance) + the
  fail-states 7–16 (the precedence: fail-fast on the discriminator, then the
  body; the CRUD-specific validation invariants).
- **HTTP-status rendering:** the fail-state 12 (all per-method reachable wire
  codes map to their §11 status) + the fail-state 13 (unknown code →
  `EngineError`).
- **RBAC caller threading:** the happy state 16 (mutating carries `caller`;
  read-only carries no `caller`).
- **Golden-vector conformance (§5.2):** the client's `encodeCrudRequest` emits the
  exact bytes of V-10; `decodeCrudResponse` parses the exact bytes of V-11/V-12
  into the pinned typed values.
- **The PBT register (§5.7):** the 8 invariant rows (deterministic pinned seed
  `0xA1A1A1A1`, ≤100 attempts/row, ≤400 total, stop-after-5).
- **The P4 retry:** the happy path (a mutating create retries on
  `EngineUnavailable` and succeeds) + the fail-state 18 (retry budget exhausted →
  `EngineUnavailable`).

## 7. What the spec does NOT do (constraints honored)

- This is a **TDD unit spec** — it includes the §5.x Property register (PBT gate)
  but does **NOT** author the property tests (the TestWriter does) and does
  **NOT** author implementation.
- It does **NOT** touch `src/` or `tests/` — it writes **only** the spec file.
- It does **NOT** redefine the error model, the §11 map, or the decode helpers —
  it **imports** `EngineWireError`/`EngineUnavailable`/`EngineError`/
  `TraceUnavailable`/`ConflictError`/`wireCodeToError`/`ENGINE_HTTP_STATUS`/
  `decodeEnvelope` from `engine-rag-store.ts`.
- It does **NOT** change the frozen document-CRUD wire shapes (P1a) — the client
  reproduces them byte-exactly and does NOT invent wire fields (incl. no
  idempotency-key field; the A2 unit owns idempotency-key dedup).
- It does **NOT** add an SSE surface for CRUD (CRUD is request/response; the SSE
  event schema stays retrieval-only).
- It does **NOT** author the document-CRUD MCP tools + GUI screens (A2) or the
  server host (P2).
