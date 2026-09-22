# Blind-test Greens — Unit A2: Document-CRUD D4 Wiring (`gnosis.document.*` / `gnosis.wiki.*` MCP tools + the `gnosis-edit` group + the extended `handleGnosisTool` + the `AuthorityStore` + the `IdempotencyRegistry` + the GUI document-editor/wiki screens)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** —
  `docs/specs/unit-a2-document-crud-wiring.md` (§5.1–§5.11) + the LANDED A1 proxy
  surface `docs/specs/unit-a1-crud-routing-proxy.md` (§5.1/§5.4/§5.6/§5.7/§5.8/§5.9).
  NO A2-implementation read (`src/main/mcp-server.ts`, `src/main/security.ts`,
  `src/main/authority-store.ts`, `src/main/idempotency-registry.ts`,
  `src/renderer/pane-graph.ts`, `src/renderer/gnosis-crud-panes.ts`) and NO
  A2-unit-test read. Scenarios are derived from the docs alone; a PASS is a
  genuine blind verification.
- **Run file:** `tests/blind-unit-a2-document-crud-wiring-greens.test.ts` (vitest).
- **Source under test (LIVE modules, the spec-pinned `.js` paths):**
  `src/main/mcp-server.js` (`handleGnosisTool`, `ProvidentMcpServer.ALL_TOOLS`,
  `registeredToolNames`), `src/main/security.js` (`groupForTool`,
  `defaultSecurityConfig`, `SecurityGate`), `src/main/engine-crud-rag-store.js`
  (`createEngineCrudRagStore` — the LANDED A1 proxy), `src/main/engine-rag-store.js`
  (the typed error model `EngineWireError`/`EngineUnavailable`/`EngineError`/
  `ConflictError`), `src/main/authority-store.js` (`createAuthorityStore`),
  `src/main/idempotency-registry.js` (`createIdempotencyRegistry`),
  `src/renderer/pane-graph.js` (`gnosisDocumentsContent`, `gnosisWikisContent`).
- **Runner invocation:** `npx vitest run tests/blind-unit-a2-document-crud-wiring-greens.test.ts`
  from the Astrographer repo root.
- **Mock-transport note (A6, §5.6):** the happy path + the engine-absent path are
  exercised **through the real `createEngineCrudRagStore` proxy** with an
  injectable mock `fetch` (A1 §5.1) — the wiring tests exercise the real proxy
  against a deterministic mock transport, NOT a live engine. The engine-absent
  path is exercised via a connection-refused `fetch` (`{code:'ECONNREFUSED'}`).

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## §5.1 / §5.8-1..11 the 11 `gnosis.document.*` / `gnosis.wiki.*` MCP tools — happy paths

> Each happy path is exercised through the real `createEngineCrudRagStore` proxy
> with a mock `fetch` serving a `Ready` `/engine/status` gate + the pinned
> response envelope (A6, §5.6). The mutating tools pass a caller with edit
> authority (the `AuthorityStore` resolves the credential).

### G1. `gnosis.document.get` happy (§5.8-1)
A `gnosis.document.get` call with a well-formed `documentId` → the handler calls
`engineCrud.getDocument` and returns the typed `Document` (`documentId`, `wikiId`,
`revision`, `state`, `graph`, `title`, `createdAt`, `updatedAt`, `tags`, `author`).
**Result:** PASS

### G2. `gnosis.document.list` happy (§5.8-2)
A `gnosis.document.list` call with a well-formed `wikiId` + optional filters → the
handler calls `engineCrud.listDocuments` and returns the typed `DocumentList`
(`items`, `total`, `page`, `pageSize`).
**Result:** PASS

### G3. `gnosis.wiki.get` happy (§5.8-3)
A `gnosis.wiki.get` call with a well-formed `wikiId` → the handler calls
`engineCrud.getWiki` and returns the typed `Wiki` (`wikiId`, `name`).
**Result:** PASS

### G4. `gnosis.wiki.list` happy (§5.8-4)
A `gnosis.wiki.list` call → the handler calls `engineCrud.listWikis` and returns
the typed `Wiki[]`.
**Result:** PASS

### G5. `gnosis.document.create` happy (§5.8-5)
A `gnosis.document.create` call with a `callerId` that has edit authority + a
well-formed `wikiId`/`title` → the handler resolves the caller credential, calls
`engineCrud.createDocument`, and returns the typed `Document` (`revision:0`,
`state:'Draft'`).
**Result:** PASS

### G6. `gnosis.document.update` happy (§5.8-6)
A `gnosis.document.update` call with a `callerId` that has edit authority + a
well-formed `documentId`/`baseRevision`/`graph` → the handler resolves the caller
credential, calls `engineCrud.updateDocument`, and returns the typed `Document`.
**Result:** PASS

### G7. `gnosis.document.delete` happy (§5.8-7)
A `gnosis.document.delete` call with a `callerId` that has edit authority + a
well-formed `documentId` → the handler resolves the caller credential, calls
`engineCrud.deleteDocument`, and returns `void`.
**Result:** PASS

### G8. `gnosis.document.publish` happy (§5.8-8)
A `gnosis.document.publish` call with a `callerId` that has edit authority + a
well-formed `documentId` → the handler resolves the caller credential, calls
`engineCrud.publishDocument`, and returns the typed `Document` (`state:'Published'`).
**Result:** PASS

### G9. `gnosis.document.unpublish` happy (§5.8-9)
A `gnosis.document.unpublish` call with a `callerId` that has edit authority + a
well-formed `documentId` → the handler resolves the caller credential, calls
`engineCrud.unpublishDocument`, and returns the typed `Document` (`state:'Draft'`).
**Result:** PASS

### G10. `gnosis.document.archive` happy (§5.8-10)
A `gnosis.document.archive` call with a `callerId` that has edit authority + a
well-formed `documentId` → the handler resolves the caller credential, calls
`engineCrud.archiveDocument`, and returns the typed `Document` (`state:'Archived'`).
**Result:** PASS

### G11. `gnosis.wiki.create` happy (§5.8-11)
A `gnosis.wiki.create` call with a `callerId` that has edit authority + a
well-formed `name` → the handler resolves the caller credential, calls
`engineCrud.createWiki`, and returns the typed `Wiki`.
**Result:** PASS

---

## §5.1 the body-construction rule (the MCP-args → A1-proxy-body mapping)

### G12. `gnosis.document.create` body — absent `tags`/`author` → `null` (NEVER `[]`)
The `CreateDocumentRequest` body is `{ title, tags, author }`: `title` = the
required `title` arg; `tags` = the `tags` arg if present, else `null`; `author` =
the `author` arg if present, else `null`. With NO `tags`/`author` args, the
encoded body is `{ title:'Getting Started', tags:null, author:null }` (the
`null`-when-`None` discipline, P1a §4.2).
**Result:** PASS

### G13. `gnosis.document.update` body — absent `title`/`tags` → `null`
The `UpdateDocumentRequest` body is `{ baseRevision, graph, title, tags }`:
`baseRevision` = the required arg; `graph` = the required arg (passed through
opaque); `title` = the `title` arg if present, else `null`; `tags` = the `tags`
arg if present, else `null`. With NO `title`/`tags` args, the encoded body is
`{ base_revision:1, graph:{nodes:[],edges:[]}, title:null, tags:null }`.
**Result:** PASS

### G14. `gnosis.document.list` body — absent `state`/`tag`/`page`/`pageSize` → `null`
The `ListDocumentsFilter` body is `{ state, tag, page, pageSize }`: each = the
arg if present, else `null`. With NO optional filters, the encoded body is
`{ state:null, tag:null, page:null, page_size:null }`.
**Result:** PASS

---

## §5.2 / §5.8-12 / §5.9-37 the `gnosis-edit` group + `security.ts`

### G15. tool-name → group mapping is total/unambiguous (P-IM-1)
`groupForTool` from `src/main/security.js`: the 4 read-only tools
(`gnosis.document.get`, `gnosis.document.list`, `gnosis.wiki.get`,
`gnosis.wiki.list`) resolve to `'gnosis'`; the 7 mutating tools
(`gnosis.document.create`, `gnosis.document.update`, `gnosis.document.delete`,
`gnosis.document.publish`, `gnosis.document.unpublish`,
`gnosis.document.archive`, `gnosis.wiki.create`) resolve to `'gnosis-edit'`.
**Result:** PASS

### G16. `gnosis-edit` group is default-OFF + `VALID_GROUPS` membership (P-SM-1)
`defaultSecurityConfig().enabled` does NOT include `'gnosis-edit'` (the default
enabled set stays `['read', 'dispatch']`); `VALID_GROUPS` includes `'gnosis-edit'`.
A fresh `new SecurityGate()` does NOT allow any `gnosis-edit` tool
(`toolAllowed('gnosis.document.create') === false`).
**Result:** PASS

### G17. enabling `gnosis`/`gnosis-edit` grants the tools (invocation-level gate)
`new SecurityGate({ token:null, enabled:['read','dispatch','gnosis'] })` →
`toolAllowed` is `true` for the 4 read-only document/wiki tools; a gate with
`enabled:[...,'gnosis-edit']` → `toolAllowed` is `true` for the 7 mutating tools.
**Result:** PASS

### G18. a `gnosis.*` name NOT in `TOOL_GROUPS` → `null` (fail-closed) (§5.9-37)
`groupForTool('gnosis.document.other')` → `null` — never resolves to a group.
**Result:** PASS

### G19. `ALL_TOOLS` rows + register-gating (§5.2, §5.8-12)
`ProvidentMcpServer.ALL_TOOLS` includes all 11 document/wiki names;
`registeredToolNames(new SecurityGate(), ALL_TOOLS)` excludes all 11 (default-off);
`registeredToolNames(gnosisGate, ALL_TOOLS)` includes the 4 read-only;
`registeredToolNames(gnosisEditGate, ALL_TOOLS)` includes the 7 mutating.
**Result:** PASS

---

## §5.3 the extended `handleGnosisTool` — routing + audit + caller threading

### G20. the CRUD tools do NOT record to the `QueryAuditLog` (§5.3)
A `gnosis.document.get` call with a non-null audit log → the audit log gains NO
entry (the `QueryAuditLog` is query-specific; the CRUD security surface is the
group gate + the RBAC caller check, NOT the query audit log).
**Result:** PASS

### G21. a read-only document/wiki tool never carries `caller` (§5.3, §5.9 pinned)
A `gnosis.document.get` call → the encoded request envelope's `args` has NO
`caller` key (the read-only args have no `caller` field).
**Result:** PASS

### G22. a mutating document/wiki tool always threads the caller's credential (§5.3, §5.8-14)
A `gnosis.document.create` call with a `callerId` that has edit authority → the
encoded request envelope's `args.caller` equals the resolved credential from the
`AuthorityStore` (the A1 proxy's typed args require `caller` on the 7 mutating
methods).
**Result:** PASS

### G23. unknown `gnosis.*` name → `Error('unknown gnosis tool: <name>')` (§5.3, §5.9-36)
`handleGnosisTool(..., 'gnosis.frobnicate', ...)` → throws
`Error('unknown gnosis tool: gnosis.frobnicate')`.
**Result:** PASS

---

## §5.4 the `AuthorityStore` + the `IdempotencyRegistry` + boot construction

### G24. `createAuthorityStore` resolves the caller credential + `editors()` (§5.4)
`createAuthorityStore({ operator:'user:operator' })` → `callerCredential('operator')`
returns `'user:operator'`; `callerCredential('unknown')` returns `null` (no edit
authority); `editors()` returns `['operator']`.
**Result:** PASS

### G25. `createIdempotencyRegistry` is bounded (LRU) (§5.4)
`createIdempotencyRegistry({ maxEntries: 2 })` → `get`/`set` round-trip; the
registry is bounded (LRU eviction, never unbounded).
**Result:** PASS

### G26. idempotency dedup happy — a duplicate `requestId` returns the first result (§5.8-15, P-SM-3)
A `gnosis.document.create` call with a `requestId` that already has a cached
result → the handler returns the cached result WITHOUT issuing a new proxy call
(the mock transport's CRUD-request count stays at 1).
**Result:** PASS

### G27. idempotency dedup is caller-scoped (P-SM-3)
A caller can NEVER receive another caller's cached result: after caller A creates
with `requestId:'r1'`, caller B with the SAME `requestId:'r1'` issues a fresh
create (the mock transport's CRUD-request count grows).
**Result:** PASS

### G28. boot construction — `createEngineCrudRagStore` does no network I/O (§5.8-13)
`createEngineCrudRagStore({ baseUrl:'http://127.0.0.1:8080', fetch:<throws-if-called> })`
→ constructs WITHOUT calling `fetch` (construction does NOT contact the engine);
the proxy is immediately usable by `handleGnosisTool`. `waitForReady` is NOT
awaited at boot (the engine may be absent, D2).
**Result:** PASS

---

## §5.5 the GUI document-editor/wiki screens + the render paths

> RE-DERIVED at the H-6 re-derivation (`HOST-GUI-DOCS-PANE-DEADLOCK`,
> docs/specs/unit-a2-document-crud-wiring.md §5.5/§5.8-20/§5.9-41): the
> `gnosisDocumentsContent` wiki selector renders whenever `state.wikis != null`,
> INDEPENDENT of `state.documents`; only the document-list/editor section shows
> the empty document-list state (`data-gnosis-docstate='empty'`) when `documents`
> is null or empty. The whole-pane `unavailable` is reserved for the no-wikis
> (engine-absent) case. The scenarios G29/G31/G32 below are re-pointed accordingly.

### G29. `gnosisDocumentsContent` happy — renders the document surface (§5.8-16, §5.8-20)
`gnosisDocumentsContent(ctx, { wikis:[<Wiki>], documents:<DocumentList>, document:<Document>, conflict:null })`
→ returns a `LegacyNodeData` subtree whose rendered values include the wiki name,
the document title, and the document fields; never throws. The wiki selector
`<li>` items must be present when `state.wikis` is non-null, independent of
`documents` (the wiki-selector-ALWAYS rule — the `HOST-GUI-DOCS-PANE-DEADLOCK`
fix, §5.8-20).
**Result:** PASS

### G30. `gnosisWikisContent` happy — renders the wiki surface (§5.8-17)
`gnosisWikisContent(ctx, { wikis:[<Wiki>], wiki:<Wiki> })` → returns a
`LegacyNodeData` subtree whose rendered values include the wiki name; never throws.
**Result:** PASS

### G31. `gnosisDocumentsContent` 409 conflict state (§5.8-18, P-SM-2)
`gnosisDocumentsContent(ctx, { wikis:null, documents:null, document:null, conflict:<ConflictError> })`
→ renders the conflict state (the conflict message), never a crash.
**Result:** PASS

### G32. `gnosisDocumentsContent(ctx, null)` → the whole-pane unavailable (engine-absent), never a TypeError (§5.5)
A null `state` (or a `state.wikis == null` — the no-wikis/engine-absent case) →
the whole-pane `data-gnosis-state='unavailable'` state (never a TypeError). DISTINCT
from the §5.9-41 regression: a non-null `wikis` with a null `documents` renders the
wiki selector + the empty doc-list, NOT the whole-pane `unavailable`.
**Result:** PASS

### G33. `gnosisWikisContent(ctx, null)` → empty state, never a TypeError (§5.5)
A null result → the empty state (never a TypeError).
**Result:** PASS

---

## §5.9 fail-states (the documented fail-states)

### F1–F11. null CRUD engine → `Error('<tool>: no engine crud rag store configured')`
Each of the 11 document/wiki tools with a null `engineCrud` (and a null retrieval
engine — the top-level guard is REMOVED, §5.3) → throws
`Error('<tool>: no engine crud rag store configured')` using the tool's own name:
- **F1.** `gnosis.document.get` → `'gnosis.document.get: no engine crud rag store configured'`
- **F2.** `gnosis.document.list` → `'gnosis.document.list: no engine crud rag store configured'`
- **F3.** `gnosis.wiki.get` → `'gnosis.wiki.get: no engine crud rag store configured'`
- **F4.** `gnosis.wiki.list` → `'gnosis.wiki.list: no engine crud rag store configured'`
- **F5.** `gnosis.document.create` → `'gnosis.document.create: no engine crud rag store configured'`
- **F6.** `gnosis.document.update` → `'gnosis.document.update: no engine crud rag store configured'`
- **F7.** `gnosis.document.delete` → `'gnosis.document.delete: no engine crud rag store configured'`
- **F8.** `gnosis.document.publish` → `'gnosis.document.publish: no engine crud rag store configured'`
- **F9.** `gnosis.document.unpublish` → `'gnosis.document.unpublish: no engine crud rag store configured'`
- **F10.** `gnosis.document.archive` → `'gnosis.document.archive: no engine crud rag store configured'`
- **F11.** `gnosis.wiki.create` → `'gnosis.wiki.create: no engine crud rag store configured'`
**Result:** PASS (all eleven)

### F12. a mutating tool with a `callerId` that has NO edit authority → caller-side deny (§5.9-12)
Each of the 7 mutating tools with a `callerId` that resolves to no credential →
throws `Error('<tool>: caller has no edit authority')`; NO proxy call is issued
(the mock transport's CRUD-request count stays at 0).
**Result:** PASS (all seven)

### F13. a mutating tool with a null/absent `authorityStore` → caller-side deny (§5.9-13)
A mutating tool with `authorityStore = null` → throws
`Error('<tool>: caller has no edit authority')` (fail-closed: no caller has edit
authority when the store is absent).
**Result:** PASS

### F14. `gnosis.document.get` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-14)
**Result:** PASS

### F15. `gnosis.document.list` with a `WikiNotFound` → `EngineWireError` (404) (§5.9-15)
**Result:** PASS

### F16. `gnosis.document.list` with a `ValidationError` (a `page < 1` / `pageSize < 1` / `pageSize > 100` filter) → `EngineWireError` (400) (§5.9-16)
**Result:** PASS

### F17. `gnosis.wiki.get` with a `WikiNotFound` → `EngineWireError` (404) (§5.9-17)
**Result:** PASS

### F18. `gnosis.document.create` with a `WikiNotFound` → `EngineWireError` (404) (§5.9-18)
**Result:** PASS

### F19. `gnosis.document.create` with a `ValidationError` (empty/overlong `title`) → `EngineWireError` (400) (§5.9-19)
**Result:** PASS

### F20. `gnosis.document.update` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-20)
**Result:** PASS

### F21. `gnosis.document.update` with a `ValidationError` (invalid `graph`) → `EngineWireError` (400) (§5.9-21)
**Result:** PASS

### F22. `gnosis.document.update` with a `ConflictError` (a stale `baseRevision`) → `ConflictError` (409) (§5.9-22, H2)
The optimistic-concurrency 409 UX: the MCP tool throws `ConflictError` (409).
**Result:** PASS

### F23. `gnosis.document.delete` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-23)
**Result:** PASS

### F24. `gnosis.document.delete` with a `DocumentInUse` → `EngineWireError` (409) (§5.9-24)
**Result:** PASS

### F25. `gnosis.document.publish` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-25)
**Result:** PASS

### F26. `gnosis.document.publish` with an `UnresolvedReference` → `EngineWireError` (422) (§5.9-26)
**Result:** PASS

### F27. `gnosis.document.unpublish` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-27)
**Result:** PASS

### F28. `gnosis.document.unpublish` with an `InvalidState` → `EngineWireError` (409) (§5.9-28)
**Result:** PASS

### F29. `gnosis.document.archive` with a `DocumentNotFound` → `EngineWireError` (404) (§5.9-29)
**Result:** PASS

### F30. `gnosis.document.archive` with an `InvalidState` → `EngineWireError` (409) (§5.9-30)
**Result:** PASS

### F31. `gnosis.wiki.create` with a `ValidationError` (empty/overlong `name`) → `EngineWireError` (400) (§5.9-31)
**Result:** PASS

### F32. a document/wiki tool connection-refused → `EngineUnavailable` (503, `cause:'connection-refused'`) (§5.9-32, P-TP-2)
A mock `fetch` that throws `{code:'ECONNREFUSED'}` → the MCP tool throws
`EngineUnavailable` (`code:'engine_unavailable'`, `httpStatus:503`,
`cause:'connection-refused'`).
**Result:** PASS

### F33. a document/wiki tool when the observed state is not `Ready` → `EngineUnavailable` (503) (§5.9-33)
A gate returning `state:'Starting'`/`state:'Degraded'` → `EngineUnavailable`
(`cause:'not-ready'`); a gate returning `state:'Unavailable'` →
`EngineUnavailable` (`cause:'unavailable-state'`). Both 503.
**Result:** PASS

### F34. a document/wiki tool with a malformed wire body → `EngineError` (502) (§5.9-34)
A response envelope with a malformed `result` body (wrong field types) → the MCP
tool throws `EngineError` (502) (the A1 proxy's decode-then-validate outcome).
**Result:** PASS

### F35. a document/wiki tool with a well-formed body failing a CRUD-specific invariant → `EngineError` (502) naming the `CrudValidationFailure` variant (§5.9-35)
A `createDocument` result with `revision != 0` → `EngineError` (502) naming
`UnexpectedRevision` (the A1 proxy's validation outcome).
**Result:** PASS

### F36. unknown `gnosis.*` name → `Error('unknown gnosis tool: <name>')` (§5.9-36)
(covered by G23)
**Result:** PASS

### F37. a `gnosis.*` name NOT in `TOOL_GROUPS` → `null` (fail-closed) (§5.9-37)
(covered by G18)
**Result:** PASS

### F38. GUI document/wiki pane engine-absent → the unavailable state (§5.9-38, P-TP-2)
The `gnosis-documents`/`gnosis-wikis` panes show the unavailable state when the
engine is absent (the bridge rejection is caught, never a crash). Verified via the
render helpers: a null `state` / a null `wikis` → the whole-pane unavailable state,
never a TypeError. DISTINCT from §5.9-41: a non-null `wikis` with a null `documents`
is the empty-doc-list case (not the engine-absent unavailable).
**Result:** PASS

### F39. GUI document/wiki pane group-off → fail-closed (§5.9-39)
The panes fail closed (the `gnosis`/`gnosis-edit` group gates) and/or surface the
`EngineUnavailable` as an empty/error state — never a crash. Verified via the
render helpers' null/empty handling.
**Result:** PASS

### F40. GUI document pane no-edit-authority → the no-edit-access state (§5.9-40)
A mutating action on the `gnosis-documents` pane with a caller that has no edit
authority → the pane shows the no-edit-access state (the caller-side deny is
surfaced, never a crash). Verified at the handler level: a mutating tool with a
no-authority `callerId` throws `Error('<tool>: caller has no edit authority')`
(covered by F12/F13).
**Result:** PASS

---

## §5.7 the PBT register (the 8 invariant rows)

### P1. P-IM-1 — the §5.1 tool/method mapping is total/unambiguous/bijective (P-TP-1 merged)
The 11 document/wiki tool names are pairwise-distinct non-empty
`gnosis.document.*`/`gnosis.wiki.*` strings; the 4 read-only resolve to `'gnosis'`;
the 7 mutating resolve to `'gnosis-edit'`; a `gnosis.*` name NOT in `TOOL_GROUPS`
resolves to `null` (fail-closed). **RE-BALANCED at the H-6 re-derivation:** the
former `P-TP-1` bijection invariant is now part of this merged `P-IM-1` row (the
11 names map to the 11 §5.1 CRUD methods, one tool per method) — see P7.
**Result:** PASS

### P2. P-IM-2 — the 11 tool schemas reject credential args (A7)
NONE of the 11 tools' `inputSchema` accepts a credential field — no `token`, no
`tls`, no `ca`/`cert`/`key`, no `apiKey`. The `callerId` arg is an identity, NOT a
credential. (The schemas are module-private; asserted at the `handleGnosisTool`
boundary: credential-named args are neither required nor forwarded to the proxy.)
**Result:** PASS

### P3. P-IM-3 — the caller credential threading is deterministic
For any mutating tool call with a `callerId` that has edit authority, the handler
resolves the credential from the `AuthorityStore` and threads it into the mutating
args' `caller` field; for a `callerId` with NO edit authority, the mutating call is
denied caller-side (no proxy call is issued).
**Result:** PASS

### P4. P-SM-1 — the `gnosis-edit` group is default-off + `VALID_GROUPS` membership
`defaultSecurityConfig().enabled` does NOT include `'gnosis-edit'`; `VALID_GROUPS`
includes `'gnosis-edit'`.
**Result:** PASS

### P5. P-SM-2 — the optimistic-concurrency 409 UX is consistent across MCP + GUI
A `ConflictError` (409) surfaces as the typed error on the MCP
`gnosis.document.update` tool AND as the conflict state on the GUI
`gnosis-documents` pane.
**Result:** PASS

### P6. P-SM-3 — the idempotency dedup is deterministic + caller-scoped
A duplicate `(callerId, requestId)` returns the first result WITHOUT issuing a new
create; a new `(callerId, requestId)` issues a fresh create and caches the result;
a caller can NEVER receive another caller's cached result.
**Result:** PASS

### P7. the tool → CRUD-method mapping is a bijection (covered by the merged P-IM-1)
The 11 document/wiki tool names map to the 11 CRUD methods (one tool per method,
one method per tool); each tool routes to exactly one proxy method. Verified
behaviorally: each tool's request envelope carries the matching `method`
discriminator. **RE-POINTED at the H-6 re-derivation:** this was the former `P-TP-1`
row; its invariant is now asserted as part of the merged `P-IM-1` (§5.7).
**Result:** PASS

### P8. P-TP-2 — the D2 engine-absent surfacing is consistent across MCP + GUI
A connection-refused engine surfaces as `EngineUnavailable` (503) on the MCP
document/wiki tools AND as the unavailable state on the GUI panes.
**Result:** PASS

---

## Summary

- Happy paths + wiring + stores + GUI: **33** (G1–G33).
- Fail-states: **40** (F1–F40, matching the spec §5.9 numbering).
- PBT register: **8** (P1–P8).
- **Total scenarios: 81.**

> **Re-derivation note (2026-09-11, HOST-GUI-DOCS-PANE-DEADLOCK):** the
> `gnosisDocumentsContent` wiki-selector-ALWAYS / empty-doc-list contract is pinned
> by the re-derived spec §5.5/§5.8-20/§5.9-41 and the register row `P-IM-4`. The
> scenario count is UNCHANGED (33 G + 40 F + 8 P = 81): the deadlock fix is covered
> by re-pointing G29/G31/G32 (the pane-content rows) to the new contract and by the
> new `P-IM-4` property row, rather than by adding a new G/F scenario (so the
> `tests/blind-unit-a2-...-greens.test.ts` test count stays authoritative).

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **81** | G1–G33, F1–F40, P1–P8 |
| **FAIL** | **0** | — |

> **Tally note:** all 81 scenarios are runnable against the live wiring surface
> (the real `createEngineCrudRagStore` proxy on a mock transport + the real
> `handleGnosisTool`/`security`/`authority-store`/`idempotency-registry`/`pane-graph`
> modules). The engine-absent paths (F32/F33/F38/P8) are exercised through the real
> proxy with a connection-refused / non-`Ready` mock `fetch` per §5.6/A6. The
> GUI no-edit-access state (F40) is verified at the handler level (the caller-side
> deny) because the pane handlers are provident-authored and not directly
> importable; the render helpers' null/empty handling covers the unavailable/
> fail-closed states (F38/F39).

### Spec ambiguities resolved

- **The `ConflictError` constructor (§5.5):** the spec pins the `conflict:
  ConflictError | null` render-helper field but not the constructor signature. The
  greens set constructs a `ConflictError` with the `(code, message)` argument
  order used by the sibling error classes (`new EngineUnavailable('connection-refused',
  'no engine')` in the GN-MCP-UI greens) and asserts the rendered conflict message.
- **The wire-code strings (§5.9-14..31):** the spec pins the wire codes as the
  `EngineErrorCode` union values; the greens set uses the snake_case wire strings
  (`'document_not_found'`, `'wiki_not_found'`, `'validation_error'`, `'conflict'`,
  `'document_in_use'`, `'invalid_state'`, `'unresolved_reference'`), with
  `'conflict'` confirmed by the A1 golden vector V-12 and `'validation_error'` by
  the GN-MCP-UI greens. The assertions check the resulting typed error class +
  `httpStatus`, so a wrong wire string surfaces as a FAIL (a finding to
  investigate), never a silent pass.
- **The GUI no-edit-access state (§5.9-40):** the render-helper signature has no
  explicit no-edit-access field; the state is verified at the handler level (the
  caller-side deny) and the render helpers' null/empty handling covers the
  unavailable/fail-closed states.
