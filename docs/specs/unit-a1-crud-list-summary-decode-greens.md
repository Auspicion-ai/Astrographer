# Blind-test Greens — Unit A1·list: `HOST-CRUD-LIST-SUMMARY-DECODE`

- **Blind-test writer run:** 2026-09-11 (fresh agent, DOCUMENTATION ONLY —
  `docs/specs/unit-a1-crud-routing-proxy.md` FINDING §3 (`HOST-CRUD-LIST-SUMMARY-DECODE`),
  §5.1/§5.2/§5.3/§5.7/§5.8-9/§5.9-14 + `docs/specs/unit-a2-document-crud-wiring.md`
  §5.8-2/§5.9-2; NO implementation read of `src/main/engine-crud-rag-store.ts`).
- **Unit (the re-derivation under test):** the A1 `listDocuments` host proxy +
  the A2 `gnosis.document.list` MCP tool, whose decoder previously threw
  `EngineError('malformed document')` on every non-empty wiki because it required
  the FULL `Document` per item while the Gnosis engine (§4.1.3) returns a
  lightweight `DocumentSummary`. Re-derived: `DocumentList.items: DocumentSummary[]`,
  decoded by the lenient `decodeDocumentSummary` (six fields, snake+camel, tolerates
  a full `Document` item / projects it; a malformed summary → `EngineError('malformed
  document')` 502).
- **Source under test (LIVE module):** `src/main/engine-crud-rag-store.ts` — the
  `decodeCrudResponse`/`decodeDocumentSummary`/`validateCrudResult` helpers + the
  `listDocuments` proxy path, and `src/main/mcp-server.ts` — the `gnosis.document.list`
  tool handler.
- **Runner invocation (executed):**
  `npx vitest run tests/unit-a1-crud-routing-proxy.test.ts tests/unit-a2-document-crud-wiring.test.ts tests/engine-crud-real-transport.test.ts tests/props-a1-crud-routing-proxy.test.ts`
  → **150/150 tests PASSED** (60 + 80 + 2 + 8). This is an **executed greens set**,
  not a docs-only set: the module-level pure decode behaviors and the A2 tool
  behaviors are verified by running the live test suite, and each green row below
  maps to the satisfying test(s) that back it (see the per-scenario mapping).

## LIVE-LOCATION (2026-09-11 — live re-drive of `HOST-CRUD-LIST-SUMMARY-DECODE`)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-11.**
- **Context:** the fix is rebuilt into `dist/` and the app was RELAUNCHED fresh
  (`gnosis-server` `/engine/status` → `state:Ready`; MCP `tools/call` on
  `127.0.0.1:3787/mcp`; all **14** gnosis tools registered via the streamable-HTTP
  client; gnosis + gnosis-edit groups persisted in real userData).
- **Re-drove over the live app:** a fresh create-wiki→create-doc round-trip
  (`callerId:'operator'`), then `gnosis.document.list` on the POPULATED and EMPTY
  wikis + the residual read/delete sanity checks. Helper:
  `.a2-live/gnosis-list-summary-live-redrive.mjs` (results at
  `/tmp/gnosis-list-summary-live.txt`).
- **Result — the summary-decode fix is LIVE-VERIFIED:**
  - **G1 / populated wiki:** `gnosis.document.list {wikiId}` RESOLVES to the typed
    `DocumentList` — `items` carries exactly the six summary camelCase fields per item
    (`documentId, wikiId, title, state, revision, updatedAt`; no `graph`/`tags`/
    `createdAt`/`author` leakage → also backs G2), `total:1, page:1, pageSize:20`.
    **NO `malformed document` error, NO `-32602`.**
  - **G4 / empty wiki:** `gnosis.document.list` on a zero-doc wiki returns `items:[],
    total:0, page:1, pageSize:20` — no throw.
  - **Residual reads stay green:** `wiki.get`, `document.get` → typed payloads (no
    GET-with-body `TypeError`); `document.delete` → wire `result:null` (no `-32602`).
- **Net:** the previously-live `"malformed document"` observation (§2.0 of the A2
  battery) is now **CONTRADICTED on the fresh relaunch** — the engine summary list
  decodes correctly. **G1, G2, G4 now LIVE-verified** (2026-09-11, fresh relaunch); the
  remaining G3/G5/G6/F1/F2 rows stay covered by the executed module test-suite below.

## Legend

- **PASS** — the scenario is executed against the live module (the satisfying test
  passes in the `npx vitest run` above) and matches the documented behavior.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).
- **MAPPED-TO** — the satisfying (executed, passing) test(s) in the repo that back
  this green row.

---

## Green scenarios — the summary-decode contract (§5.1/§5.2/§5.3/§5.8-9, §5.7)

### G1. Well-formed `DocumentSummary` items decode to the typed `DocumentList` (six snake→camel fields; total/page/pageSize map)
A `listDocuments` response envelope whose `items` are well-formed `DocumentSummary`
serde bodies — **six snake_case fields** `{document_id, wiki_id, title, state,
revision, updated_at}`, no `graph`/`tags`/`created_at`/`author` → decodes to the
typed `DocumentList.items: DocumentSummary[]` with each item re-cased to
`{documentId, wikiId, title, state, revision, updatedAt}` (`state` PascalCase
preserved), and `total`/`page`/`page_size`→`pageSize` mapped. The decode does NOT
throw on the absent four full-`Document` fields (§5.2 list-item decode discipline,
§5.8-9, P-IM-2).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `§5.2 core-red:
listDocuments with well-formed DocumentSummary items decodes WITHOUT throwing` +
`§5.2 each decoded item is a typed DocumentSummary; total/page/pageSize map` +
`§5.8-9 golden: listDocuments over a summary-shaped fetch resolves to a typed
DocumentList`; `tests/props-a1-crud-routing-proxy.test.ts` — `P-IM-2
[strat:crud-response-decode]`.

### G2. Decoded item is EXACTLY the six summary camelCase fields — no full-`Document` leakage (§5.1/§5.2)
Each decoded list item carries **precisely** `documentId`/`wikiId`/`title`/`state`/
`revision`/`updatedAt` — NO `graph`/`tags`/`createdAt`/`author` (the four full-
`Document` fields are never surfaced on the list wire; §5.1 `DocumentSummary`, §5.2
"the client does NOT add or drop fields — a faithful snake→camel projection").
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `§5.1 shape round-trip:
items[0] carries exactly the six summary camelCase fields and NO
graph/tags/createdAt/author`.

### G3. A full `Document` list item is tolerated and projected to its six-field summary (§5.8-9, §5.3)
A `listDocuments` item that carries a FULL `Document` body (incl. `graph`/`tags`/
`created_at`/`author`) is **valid** (not malformed) and decodes to its **six-field
summary projection**, preserving its OWN `revision`/`state`/`title` (§5.3
"`DocumentList` validity re-derived", §5.8-9, P-IM-4 positive).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `§5.3 re-derived: a full
Document list item is valid and decodes to its six-field summary projection`;
`tests/props-a1-crud-routing-proxy.test.ts` — `P-IM-4 [strat:crud-summary-decode]`
(positive 2 — mixed full/summary items project to the six-field summary).

### G4. Page-beyond-data empty list decodes WITHOUT throwing (§4.1.3)
A `listDocuments` response `{items: [], total: 0, page: 1, pageSize: 20}` (the
Gnosis §4.1.3 page-beyond-data shape — an empty list is a valid response) decodes to
a typed `DocumentList` with an **empty `items: DocumentSummary[]`** and does NOT
throw (§5.3 `ListDocuments.page >= 1` holds; no item to be malformed).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `§4.1.3 HOST-2: items:[]
page-beyond-data decodes WITHOUT throwing to an empty DocumentList`.

### G5. decode-then-validate totality on a well-formed summary list (§5.3, P-TP-1)
For any well-formed `listDocuments` result whose items are well-formed
`DocumentSummary` bodies (six typed fields; `graph`/`tags`/`created_at`/`author`
omitted is still well-formed), `validateCrudResult('listDocuments', result)` is
`null` — the decode path never throws a validation `EngineError` on a well-formed
list (§5.3 invariant, P-TP-1).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `validateCrudResult:
valid results -> null; invalid -> the failure variant` (the `listDocuments` valid
case); `tests/props-a1-crud-routing-proxy.test.ts` — `P-TP-1
[strat:crud-validate-total]`.

### G6. `gnosis.document.list` MCP tool returns the summary-typed `DocumentList` (§5.8-2)
The A2 `gnosis.document.list` tool (inputSchema `{wikiId, state?, tag?, page?,
pageSize?}`) issues a `listDocuments` through the A1 proxy and returns the typed
`DocumentList` whose **`items` are `DocumentSummary[]`** (the six-field §5.1
summary `documentId`/`wikiId`/`title`/`state`/`revision`/`updatedAt`); a full
`Document` is never on the list wire (A2 §5.8-2, §5.7 `gnosis.document.list`).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a2-document-crud-wiring.test.ts` — `§5.8-2 gnosis.document.list
happy: listDocuments -> typed DocumentList`.

---

## Fail-states — the malformed-summary + absent-engine contract (§5.9-14, A2 §5.9-2)

### F1. A malformed `DocumentSummary` item → `EngineError('malformed document')` (502), NOT a native TypeError
A `listDocuments` result with a **malformed summary item** (a missing or
non-string `document_id`/`wiki_id`/`title`/`updated_at`, a `state` not one of
`Draft`/`Published`/`Archived`, or a non-number `revision` — incl. through the
snake_case wire keys AND as non-object items `null`/`5`/`'x'`) → `EngineError
('malformed document')` (502). The failure is a typed `EngineError` — **NOT a native
TypeError** (HOST-1). A summary that simply omits `graph`/`tags`/`created_at`/
`author` is NOT malformed (those are absent by contract, §5.9-14; P-IM-4 negative).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a1-crud-routing-proxy.test.ts` — `§5.9-14 fail-state: a
malformed DocumentSummary item -> EngineError("malformed document") (502), direct +
proxy` + `§5.9-14 HOST-1: non-object list items ([null],[5],["x"],[true]) ->
EngineError("malformed document"), NOT a native TypeError`;
`tests/props-a1-crud-routing-proxy.test.ts` — `P-IM-4 [strat:crud-summary-decode]`
(negative generators: `documentId:123`/`undefined`, `wikiId:123`, `title:5`,
`state:'Foo'`, `revision:'x'`, `updatedAt:0`/`undefined`).

### F2. A `gnosis.document.list` call with no CRUD engine → the pinned error (§5.9-2)
A `gnosis.document.list` handler invoked with a null CRUD engine → throws
`Error('gnosis.document.list: no engine crud rag store configured')` (A2 §5.9-2) —
never a silent null (H-4 family throw pattern, §5.8-2 throw discipline).
**Result: PASS**
**MAPPED-TO:** `tests/unit-a2-document-crud-wiring.test.ts` — `§5.9-2 gnosis.document.list
null CRUD engine throws`.

---

## Summary

- Green scenarios: **6** (G1–G6).
- Fail-states: **2** (F1–F2).
- **Total: 8 scenarios.**

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **8** | G1, G2, G3, G4, G5, G6, F1, F2 |
| **FAIL** | **0** | — |

### Verification run (executed against the live module)

`npx vitest run tests/unit-a1-crud-routing-proxy.test.ts tests/unit-a2-document-crud-wiring.test.ts tests/engine-crud-real-transport.test.ts tests/props-a1-crud-routing-proxy.test.ts`
→ **4 files / 150 tests PASSED** (unit-a1 60, unit-a2 80, engine-crud-real-transport
2, props-a1 8). Every green row is backed by a satisfying passing test (the
**MAPPED-TO** annotations) — this is an **executed** greens set, not a docs-only
claim, closing the self-verified-greens gap for `HOST-CRUD-LIST-SUMMARY-DECODE`.

### Scenario-id → satisfying test map

| Scenario-id | Spec ref | Satisfying (executed, passing) test(s) |
| --- | --- | --- |
| G1 | A1 §5.2/§5.8-9, P-IM-2 | `unit-a1-crud-routing-proxy.test.ts` `§5.2 core-red`, `§5.2 each decoded item…total/page/pageSize map`, `§5.8-9 golden…summary-shaped fetch`; `props-a1` `P-IM-2` |
| G2 | A1 §5.1/§5.2 | `unit-a1` `§5.1 shape round-trip: items[0] carries exactly the six summary camelCase fields and NO graph/tags/createdAt/author` |
| G3 | A1 §5.8-9/§5.3, P-IM-4 pos | `unit-a1` `§5.3 re-derived: a full Document list item…six-field summary projection`; `props-a1` `P-IM-4` (mixed full/summary) |
| G4 | Gnosis §4.1.3 | `unit-a1` `§4.1.3 HOST-2: items:[] page-beyond-data…empty DocumentList` |
| G5 | A1 §5.3, P-TP-1 | `unit-a1` `validateCrudResult: valid results -> null…`; `props-a1` `P-TP-1` |
| G6 | A2 §5.8-2 | `unit-a2-document-crud-wiring.test.ts` `§5.8-2 gnosis.document.list happy: listDocuments -> typed DocumentList` |
| F1 | A1 §5.9-14, P-IM-4 neg | `unit-a1` `§5.9-14 fail-state…malformed DocumentSummary item` + `§5.9-14 HOST-1: non-object list items…NOT a native TypeError`; `props-a1` `P-IM-4` (negative generators) |
| F2 | A2 §5.9-2 | `unit-a2` `§5.9-2 gnosis.document.list null CRUD engine throws` |

### Spec ambiguities resolved

- **"well-formed summary" boundary (§5.2/§5.3):** a summary is well-formed exactly
  when the six fields are present with the documented types; `graph`/`tags`/
  `created_at`/`author` absence is legal and does NOT make an item malformed (G1/G2);
  a FULL `Document` item is also legal and is projected (G3). Only a missing/typed-wrong
  summary field — or a non-object item — throws (F1). This matches the §5.9-14
  "NOT malformed" carve-out and the P-IM-4 negative-generator set.
- **Empty-list pagination (§4.1.3):** `{items:[], total:0, page:1, pageSize:20}` is a
  valid page-beyond-data response — `page >= 1` and `1 <= pageSize <= 100` hold, so it
  is not an `InvalidPagination` fail-state (G4). Only `page < 1`/`pageSize < 1`/
  `pageSize > 100` produce `InvalidPagination` (A1 §5.9-15f, out of this unit's list-summary
  scope but the empty-list boundary is pinned here).
- **Typed-error, not native, fail (§5.9-14):** the malformed-summary failure surfaces
  as `EngineError('malformed document')` (502) — explicitly NOT a native `TypeError`
  (F1, HOST-1). This is the pinned decode-fail contract for `HOST-CRUD-LIST-SUMMARY-DECODE`.
