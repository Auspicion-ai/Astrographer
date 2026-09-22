# Blind-test Greens — Unit A1: Document-CRUD Routing Proxy (`createEngineCrudRagStore` proxy)

- **Blind-test writer run:** 2026-09-10 (fresh agent, DOCUMENTATION ONLY —
  `docs/specs/unit-a1-crud-routing-proxy.md` §5.1–§5.10; NO implementation read of
  `src/main/engine-crud-rag-store.ts` and NO test read).
- **Run file:** `tests/blind-unit-a1-crud-routing-proxy-greens.test.ts` (vitest) —
  **NOT YET CREATED.** This is a **docs-only greens set** (a scenario-by-scenario
  verification derived from the spec alone); the run file is a **future artifact**
  to be created when the live-transport scenarios can be executed (after A2 lands
  + a live `gnosis-server` runs). The module-level pure scenarios are verified by
  the unit tests `tests/unit-a1-crud-routing-proxy.test.ts` (60 — the original
  52 + the 8 re-derivation `HOST-CRUD-LIST-SUMMARY-DECODE` additions) +
  `tests/props-a1-crud-routing-proxy.test.ts` (8 PBT rows; the re-derivation's
  P-IM-4 generator-coverage tightening is recorded in
  `docs/specs/unit-a1-crud-list-summary-decode-greens.md`).
- **Source under test (LIVE module):** `src/main/engine-crud-rag-store.js` (the
  `createEngineCrudRagStore` proxy + the `encodeCrudRequest`/`decodeCrudRequest`/
  `decodeCrudResponse`/`validateCrudResult` helpers + `ENGINE_CRUD_ENDPOINTS`).
- **Runner invocation (future):** `npx vitest run tests/blind-unit-a1-crud-routing-proxy-greens.test.ts`
  from the Astrographer repo root.
- **Docs-only scope note:** this is a **docs-only greens set**. Scenarios whose
  behavior is fully pinned in the spec (pure encode/decode/validate functions,
  the factory throw patterns, the golden vectors, the RBAC caller threading) are
  **PASS** — a fresh agent can execute them against the unit from the spec alone.
  Scenarios that require a **live engine/server** to actually execute (the REST
  transport happy paths and the transport-dependent fail-states) are marked
  **NOT-VERIFIED** in this docs-only run: the behavior is pinned in the spec, but
  the live execution is deferred to the P2 live-scenario battery.

## Legend

- **PASS** — the documented behavior is pinned in the spec and self-verifiable
  from the docs alone.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).
- **NOT-VERIFIED** — the behavior is pinned in the spec but cannot be executed
  from the docs alone (requires a live engine/server; deferred to the P2
  live-scenario battery).

---

## Factory + proxy surface (§5.1, §5.8-1/14, §5.9-1/2/3)

### G1. Factory happy — 11-method proxy surface; no network I/O at construction
`createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: <throws-if-called> })`
→ returns a proxy exposing the 11 methods (`createDocument`, `getDocument`,
`updateDocument`, `deleteDocument`, `publishDocument`, `unpublishDocument`,
`archiveDocument`, `listDocuments`, `createWiki`, `getWiki`, `listWikis`); the
injected fetch is NOT called at construction (construction does NOT contact the
engine).
**Result: PASS**

### G2. Loopback enforcement — 127.0.0.1 accepted; localhost accepted if it resolves to loopback
`http://127.0.0.1:8080` constructs without throwing; `http://localhost:8080` (if it
resolves to a loopback address) constructs without throwing (LOOPBACK-AUTH-TLS,
§5.8-14); a non-loopback address throws (see F3).
**Result: PASS**

### G2b. `ENGINE_CRUD_ENDPOINTS` pins the 11 paths (bijection)
`{ createDocument:'POST /documents', getDocument:'GET /documents/:id',
updateDocument:'POST /documents/:id/update', deleteDocument:'DELETE /documents/:id',
publishDocument:'POST /documents/:id/publish', unpublishDocument:'POST /documents/:id/unpublish',
archiveDocument:'POST /documents/:id/archive', listDocuments:'GET /documents',
createWiki:'POST /wikis', getWiki:'GET /wikis/:id', listWikis:'GET /wikis' }` — the
11 paths are pairwise distinct and the table is a bijection between the 11 paths
and the 11 methods (P-SM-1).
**Result: PASS**

### F1. null/undefined opts
`createEngineCrudRagStore(null)` / `(undefined)` → throws
`Error('engine crud rag store: opts required')`.
**Result: PASS**

### F2. missing/empty baseUrl
`createEngineCrudRagStore({})` / `({ baseUrl: '' })` → throws
`Error('engine crud rag store: baseUrl required')`.
**Result: PASS**

### F3. non-loopback baseUrl
`createEngineCrudRagStore({ baseUrl: 'http://192.168.1.1:8080' })` → throws
`Error('engine crud rag store: baseUrl must be loopback')` (LOOPBACK-AUTH-TLS).
**Result: PASS**

---

## Golden-vector conformance (§5.2, §5.8-13)

### G3. V-10 — `encodeCrudRequest('createDocument', …)` emits the exact bytes
`encodeCrudRequest('createDocument', { caller:'user:alice', wikiId:'w1',
body:{ title:'Getting Started', tags:['guide'], author:'alice' } })` → the exact
bytes of V-10:
`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"createDocument","args":{"caller":"user:alice","wikiId":"w1","body":{"title":"Getting Started","tags":["guide"],"author":"alice"}}}}`
(`caller` present because createDocument is mutating; the serde-frozen body is
embedded verbatim under `body`).
**Result: PASS**

### G4. V-11 — `decodeCrudResponse(decodeEnvelope(V-11).payload)` → pinned `Document`
The full V-11 envelope is decoded via `decodeEnvelope` FIRST, then the payload is
passed to `decodeCrudResponse` → the pinned typed `Document`:
`{documentId:'d1', wikiId:'w1', revision:0, state:'Draft', graph:{nodes:[],edges:[]},
title:'Getting Started', createdAt:'2026-09-09T00:00:00Z',
updatedAt:'2026-09-09T00:00:00Z', tags:['guide'], author:'alice'}` (snake→camel
key renames; `state` PascalCase preserved; `graph` embedded verbatim).
**Result: PASS**

### G5. V-12 — `decodeCrudResponse(decodeEnvelope(V-12).payload)` → `ConflictError` (409)
The full V-12 envelope (an `updateDocument` error envelope with
`error:{code:'conflict', message:'optimistic-concurrency conflict: stale base revision'}`)
is decoded via `decodeEnvelope` FIRST, then the payload is passed to
`decodeCrudResponse` → throws `ConflictError` (409).
**Result: PASS**

---

## The 11 CRUD methods' happy paths (§5.8-2..12, §5.5 transport)

> **NOT-VERIFIED note:** each of G6–G16 exercises the **live REST transport**
> against a real server (the request envelope in the JSON request body, the
> `:id` substitution, the READY gate, the response-envelope decode). The
> documented behavior (endpoint path, HTTP verb, envelope-in-body transport,
> `:id` substitution, and the typed result) is fully pinned in §5.5/§5.8, but the
> actual execution requires a live engine/server and is deferred to the P2
> live-scenario battery. Each scenario is marked **NOT-VERIFIED** in this
> docs-only run.

### G6. `createDocument` happy
A `POST /documents` (request envelope in the JSON request body) returns a
`createDocument` response envelope with a `Document` body (`revision:0`,
`state:'Draft'`) → resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-2)

### G7. `getDocument` happy
A `GET /documents/:id` (request envelope in the JSON request body; `:id` =
URL-encoded `documentId`) returns a `getDocument` response envelope with a
`Document` body → resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-3)

### G8. `updateDocument` happy
A `POST /documents/:id/update` (request envelope in the JSON request body; `:id` =
`documentId`) returns an `updateDocument` response envelope with a `Document` body
→ resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-4)

### G9. `deleteDocument` happy
A `DELETE /documents/:id` (request envelope in the JSON request body; `:id` =
`documentId`) returns a `deleteDocument` response envelope with `result:null` →
resolves to `void`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-5)

### G10. `publishDocument` happy
A `POST /documents/:id/publish` (request envelope in the JSON request body; `:id` =
`documentId`) returns a `publishDocument` response envelope with a `Document` body
(`state:'Published'`) → resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-6)

### G11. `unpublishDocument` happy
A `POST /documents/:id/unpublish` (request envelope in the JSON request body; `:id` =
`documentId`) returns an `unpublishDocument` response envelope with a `Document`
body (`state:'Draft'`) → resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-7)

### G12. `archiveDocument` happy
A `POST /documents/:id/archive` (request envelope in the JSON request body; `:id` =
`documentId`) returns an `archiveDocument` response envelope with a `Document`
body (`state:'Archived'`) → resolves to the typed `Document`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-8)

### G13. `listDocuments` happy
A `GET /documents` (request envelope in the JSON request body) returns a
`listDocuments` response envelope with a `DocumentList` body (`page>=1`,
`1<=pageSize<=100`) → resolves to the typed `DocumentList`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-9)

### G14. `createWiki` happy
A `POST /wikis` (request envelope in the JSON request body) returns a `createWiki`
response envelope with a `Wiki` body → resolves to the typed `Wiki`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-10)

### G15. `getWiki` happy
A `GET /wikis/:id` (request envelope in the JSON request body; `:id` = URL-encoded
`wikiId`) returns a `getWiki` response envelope with a `Wiki` body → resolves to
the typed `Wiki`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-11)

### G16. `listWikis` happy
A `GET /wikis` (request envelope in the JSON request body) returns a `listWikis`
response envelope with a `Wiki[]` body → resolves to the typed `Wiki[]`.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.8-12)

---

## READY gate + RBAC caller threading (§5.8-15/16, §5.6, §5.4)

### G17. READY gate happy
A CRUD call (all 11 methods, mutating AND read-only) issues a **fresh**
`getEngineStatus` (a REST `GET /engine/status`) immediately before proceeding; when
the freshly-observed state is `Ready` → the call proceeds to the REST call. The
gate is NOT a cached observation and NOT caller-supplied.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.6/§5.8-15)

### G18. RBAC caller threading happy
The encoded request envelope reflects the args type: a mutating request (one of
the 7 mutating methods) carries `caller`; a read-only request (one of the 4
read-only methods) carries **no** `caller`. Verifiable via the pure
`encodeCrudRequest`/`decodeCrudRequest` round-trip (P-SM-2): for any mutating
`(method, args)`, the encoded `args` has `caller == args.caller`; for any
read-only `(method, args)`, the encoded `args` object has no `"caller"` key.
**Result: PASS**

---

## P4 retry — happy path (§5.5, §5.10)

### G19. P4 retry happy — a mutating create retries on `EngineUnavailable` and succeeds
`createDocument`/`createWiki` with `retry.maxRetries > 0` retries on
`EngineUnavailable` (503) up to `maxRetries` times with `backoffMs` (default 100)
between attempts; each retry re-issues a fresh READY gate + the same request
envelope; a retry attempt that succeeds resolves to the typed result. A
non-`EngineUnavailable` error is NOT retried.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.10)

---

## Fail-states (§5.9-4..18)

### F4. A CRUD call when the freshly-observed state is not `Ready` → EngineUnavailable (503)
A gate returning `state:'Starting'` or `state:'Degraded'` → rejects with
`EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'not-ready'`); a gate returning `state:'Unavailable'` → rejects with
`EngineUnavailable` (`httpStatus:503`, `cause:'unavailable-state'`). There is NO
non-throw path for a CRUD call in a non-`Ready` state.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.6/§5.9-4)

### F5. A CRUD call connection-refused → EngineUnavailable (503, cause connection-refused)
A fetch that throws `ECONNREFUSED` → rejects with `EngineUnavailable`
(`code:'engine_unavailable'`, `httpStatus:503`, `cause:'connection-refused'`).
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.6/§5.9-5)

### F6. A CRUD call engine-not-spawned → EngineUnavailable (503, cause engine-not-spawned)
A fetch that throws `ENOTFOUND` (no server process at the bind address) → rejects
with `EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'engine-not-spawned'`).
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.6/§5.9-6)

### F7. Malformed response envelope → EngineError (502)
A CRUD response envelope missing `schemaVersion`/`idFormat`/`payload`, or with a
wrong field type → rejects with `EngineError` (502).
**Result: PASS**

### F8. Unknown `schemaVersion` (99) → EngineError (502)
A CRUD response envelope with `schemaVersion:99` → rejects with `EngineError`
(502) (`UnsupportedSchemaVersion`).
**Result: PASS**

### F9. Unknown `idFormat` ("uuid-v4") → EngineError (502)
A CRUD response envelope with `idFormat:'uuid-v4'` → rejects with `EngineError`
(502) (`UnknownIdFormat`).
**Result: PASS**

### F10. Missing/unknown `method` discriminator → EngineError (502)
A CRUD response payload with a missing `method` field, or a `method` that is not
one of the 11 known `CrudMethod` values → rejects with `EngineError` (502)
(fail-fast on the discriminator, §5.3 precedence step 1/2).
**Result: PASS**

### F11. Both `result` and `error`, or neither → EngineError (502)
A CRUD response payload with BOTH `result` and `error` present, or with NEITHER →
rejects with `EngineError` (502) (§5.3 precedence step 3).
**Result: PASS**

### F12. Known wire code → the matching typed error (total 21-code translation)
A CRUD response with an `error` field for a known wire code → rejects with the
matching typed error. The translation is **total over the 21 §11 codes** (imported
`EngineErrorCode` union + `ENGINE_HTTP_STATUS`), not just the 7-variant
CRUD-reachable set. Representative codes (the full 21-code set is derivable from
the imported union): `DocumentNotFound`→`EngineWireError` (404),
`WikiNotFound`→`EngineWireError` (404), `ValidationError`→`EngineWireError` (400),
`ConflictError`→`ConflictError` (409), `DocumentInUse`→`EngineWireError` (409),
`InvalidState`→`EngineWireError` (409), `UnresolvedReference`→`EngineWireError`
(422), `EngineUnavailable`→`EngineUnavailable` (503, `cause:'unavailable-state'`),
`EngineError`→`EngineError` (502), `TraceUnavailable`→`TraceUnavailable` (502).
`ENGINE_HTTP_STATUS` has exactly 21 entries; `ENGINE_HTTP_STATUS.conflict === 409`
(mandated, FS-4).
**Result: PASS**

### F13. Unknown wire code → EngineError (502)
A CRUD response with an `error` field for an UNKNOWN wire code (e.g. `'bogus_code'`)
→ rejects with `EngineError` (502).
**Result: PASS**

### F14. Malformed `result` body → EngineError (502)
A CRUD response with a well-formed envelope but a malformed `result` body (wrong
field types) → rejects with `EngineError` (502) (§5.3 precedence step 5).
**Result: PASS**

### F15. Well-formed body failing a CRUD-specific invariant → EngineError (502) naming the `CrudValidationFailure` variant
A CRUD response with a well-formed body that fails the CRUD-specific invariant →
rejects with `EngineError` (502) naming the `CrudValidationFailure` variant
(§5.3 precedence step 6). The 7 sub-cases:

- **F15a.** `createDocument` with `revision != 0` → `UnexpectedRevision`.
  **Result: PASS**
- **F15b.** `createDocument` with `state != 'Draft'` → `UnexpectedState`.
  **Result: PASS**
- **F15c.** `publishDocument` with `state != 'Published'` → `UnexpectedState`.
  **Result: PASS**
- **F15d.** `unpublishDocument` with `state != 'Draft'` → `UnexpectedState`.
  **Result: PASS**
- **F15e.** `archiveDocument` with `state != 'Archived'` → `UnexpectedState`.
  **Result: PASS**
- **F15f.** `listDocuments` with `page < 1` or `pageSize < 1` or `pageSize > 100`
  → `InvalidPagination`.
  **Result: PASS**
- **F15g.** `deleteDocument` with a non-null result → `UnexpectedVoid`.
  **Result: PASS**

### F16. Method/result mismatch → EngineError (502)
A CRUD response whose `method` does not match the result variant (e.g.
`"method":"getWiki"` with a `Document` result) → rejects with `EngineError` (502).
**Result: PASS**

### F17. Non-2xx response whose body is NOT a decodable response envelope → EngineError (502)
A non-2xx response whose body is NOT a decodable response envelope (e.g. a
transport-level NEW-2 400/422 body that is not a `StoreError` envelope) → rejects
with `EngineError` (502) — the client cannot classify a non-`StoreError` transport
body into the typed error model.
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.4/§5.9-17)

### F18. P4 retry exhausted → EngineUnavailable (503)
A mutating create (`createDocument`/`createWiki`) with `retry.maxRetries > 0` that
keeps hitting `EngineUnavailable` past the retry budget → rejects with
`EngineUnavailable` (503). The retry is bounded (never infinite) and only on
`EngineUnavailable` (a non-`EngineUnavailable` error is NOT retried).
**Result: NOT-VERIFIED** (live transport; behavior pinned in §5.5/§5.9-18)

---

## Pinned non-throws / type-level guarantees (§5.4, §5.9)

### G20. Mutating always carries `caller`; read-only never carries `caller`
The 7 mutating args types (`CreateDocumentArgs`, `UpdateDocumentArgs`,
`DeleteDocumentArgs`, `PublishDocumentArgs`, `UnpublishDocumentArgs`,
`ArchiveDocumentArgs`, `CreateWikiArgs`) **require** a `caller: string`; the 4
read-only args types (`GetDocumentArgs`, `ListDocumentsArgs`, `GetWikiArgs`,
`ListWikisArgs`) have **no** `caller` field. The client never emits a mutating
request without `caller` and never emits a read-only request with `caller`.
**Result: PASS**

### G21. The client never triggers the NEW-2 request-decode 400/422 path
`encodeCrudRequest` is **total over the 11 methods** and always produces a
well-formed request envelope (never an unknown method, never a malformed
envelope), so the client never triggers the server's request-decode 400/422 path
from its own well-formed requests. The NEW-2 outcome is a wire-contract fact the
client is aware of but cannot produce.
**Result: PASS**

---

## Summary

- Happy paths: **20** (G1–G19, incl. G2b).
- Fail-states: **24** (F1–F18, with F15a–F15g counted as 7).
- **Total: 44 scenarios.**

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **26** | G1, G2, G2b, G3, G4, G5, G18, F1, F2, F3, F7, F8, F9, F10, F11, F12, F13, F14, F15a, F15b, F15c, F15d, F15e, F15f, F15g, F16 |
| **NOT-VERIFIED** | **18** | G6, G7, G8, G9, G10, G11, G12, G13, G14, G15, G16, G17, G19, F4, F5, F6, F17, F18 |
| **FAIL** | **0** | — |

> **Tally note:** the 44-scenario set (20 happy + 24 fail) tallies **26 PASS + 18
> NOT-VERIFIED + 0 FAIL**. The two **pinned non-throws / type-level guarantees**
> (G20 "mutating always carries `caller`; read-only never carries `caller`" and
> G21 "the client never triggers the NEW-2 request-decode 400/422 path") are
> **additional** scenarios beyond the 44 — both are **PASS** (they are pinned in
> §5.4/§5.9 and verified by the pure encode/decode round-trip). The 18
> NOT-VERIFIED scenarios are the **live REST transport** cases (the 11 CRUD-method
> happy paths, the READY-gate happy path, the P4-retry happy path, and the
> transport-dependent fail-states F4/F5/F6/F17/F18). Their behavior is fully pinned
> in the spec (§5.5/§5.6/§5.8/§5.9) but the actual execution requires a live
> engine/server and is deferred to the P2 live-scenario battery.

### Spec ambiguities resolved

- **`localhost` loopback acceptance (§5.8-14):** the spec says `localhost` is
  accepted "if it resolves to loopback" — the greens doc (G2) pins this as a
  conditional acceptance, matching the Unit GN convention.
- **`validateCrudResult` redundant `method` parameter (§5.1):** the spec pins that
  the `method` parameter is technically redundant with the `CrudResult`
  discriminated union but is kept to mirror P1a's signature; a `method`/`result`
  mismatch is a **caller error, not a validation failure** — the method/result
  mismatch fail-state (F16) is therefore a decode-path `EngineError` (502), not a
  `validateCrudResult` return.
- **The 21-code total vs the 7-variant CRUD-reachable set (§5.4/§5.9-12):** the
  spec pins that the wire-code translation is **total over the 21 §11 codes** (a
  CRUD response can carry any of them), even though only 7 `StoreError` variants
  are CRUD-reachable. F12 covers the total; the 10 enumerated codes are
  representative.
- **NOT-VERIFIED classification:** the live-transport scenarios are marked
  NOT-VERIFIED (not FAIL) because the spec pins their behavior consistently — the
  only reason they cannot be verified here is the absence of a live engine/server,
  which is the P2 live-scenario battery's scope, not a spec contradiction.
