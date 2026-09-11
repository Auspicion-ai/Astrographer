# Blind-test Greens (focused) — Unit A2: the `gnosis-documents` GUI-Pane Deadlock Fix (`HOST-GUI-DOCS-PANE-DEADLOCK`)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** —
  `docs/specs/unit-a2-document-crud-wiring.md` **§5.5** (the `gnosisDocumentsContent`
  contract — the 5 guard/state rules), **§5.7** (`P-IM-1` — the merged
  bijective-behavioral mapping; `P-IM-4` — `strat:documents-pane-render-total`),
  **§5.8-16/§5.8-20** (the wiki-selector-ALWAYS happy paths), **§5.8-18** (the 409
  conflict state), **§5.9-38/§5.9-41** (the no-wikis unavailable vs the
  null-documents regression) + **`HOST-3`** (§5.9 graceful degradation), and the
  existing battery conventions from `docs/specs/unit-a2-document-crud-wiring-greens.md`
  (G29/G31/G32) + `docs/specs/unit-a1-crud-list-summary-decode-greens.md`.
  NO implementation reading to AUTHOR scenarios: `src/renderer/pane-graph.ts` is
  exercised only as a LIVE module under test. A PASS is a genuine blind verification.
- **Scenarios under test:** the observable `gnosis-documents` pane behaviors —
  **G1–G5** (happy/guard paths) + **F1–F2** (malformed/missing-field fail-states).
- **Run file(s) (the satisfying module tests that back each row):**
  `tests/unit-a2-document-crud-wiring.test.ts` + `tests/props-a2-document-crud-wiring.test.ts`.
- **Runner invocation:**
  `npx vitest run tests/unit-a2-document-crud-wiring.test.ts tests/props-a2-document-crud-wiring.test.ts`
  from the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/pane-graph.js`
  (`gnosisDocumentsContent`, `gnosisWikisContent`), the typed error model
  (`ConflictError`), and the property-testing loaders over the same render helpers.

## Legend

- **PASS** — the observable pane behavior matches the spec contract; the mapped
  satisfying module test(s) pass.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## The pinned `gnosisDocumentsContent` contract (spec §5.5 — 5 guard/state rules)

1. **Conflict checked FIRST** — `state.conflict != null` → the whole-pane
   `conflict` state (`data-gnosis-state='conflict'`), even with null
   `wikis`/`documents` (§5.5 guard 1; §5.8-18; P-SM-2).
2. **Engine-absent** — `state == null || state.wikis == null` → the whole-pane
   `data-gnosis-state='unavailable'` (§5.5 guard 2; §5.9-38; P-IM-4 (b)).
3. **Wiki selector ALWAYS** — whenever `state.wikis != null`, render the wiki
   selector `<li>` items, ONE per wiki, each `data-wiki-id` + the
   `gnosis-documents-select-wiki` click handler → `gnosis.document.list`,
   INDEPENDENT of `state.documents` (§5.5 guard 3; §5.8-20; P-IM-4 (c)).
4. **Documents section** — `state.documents` null OR empty → the empty
   doc-list state (`data-gnosis-docstate='empty'`, NEVER a dereference of a null
   `documents`); else the populated doc `<ul>` (per-item `data-document-id` +
   `gnosis-documents-select-doc`) + the editor surface (§5.5 guard 4; §5.8-20b/c).
5. **Total render** — NEVER a native TypeError over malformed
   `documents`/`wikis` (non-array → the empty/graceful state) (§5.7 P-IM-4).

---

## G-rows — the observable happy/guard paths

### G1. `wikis` present + `documents:null` → the wiki selector renders, the Documents section shows the empty state, never the whole-pane unavailable (§5.5 guards 2/3/4a; §5.8-20; §5.9-41)
`gnosisDocumentsContent(ctx, { wikis:[<Wiki>], documents:null, document:null, conflict:null })`
→ returns a subtree that includes each wiki `<li>` (its `data-wiki-id` +
`gnosis-documents-select-wiki` click handler → `gnosis.document.list`) AND the
empty document-list state (`data-gnosis-docstate='empty'`). A null `documents`
with a non-null `wikis` is NOT the engine-absent case: the pane root NEVER carries
`data-gnosis-state='unavailable'`. The wiki `<li>` items are the ONLY path that
triggers `gnosis.document.list` (which populates `documents`) — rendering them
whenever `wikis` is present is precisely what defuses the deadlock.
**Result: PASS**
- **Satisfying tests — `tests/unit-a2-document-crud-wiring.test.ts`:** the
  §5.8-20 deadlock-fix test (line 1036) and §5.9-41 regression test (line 1073)
  assert the wiki selector + the not-unavailable pane for `documents:null`; the
  §5.8-20b empty-state test (line 1054) asserts `data-gnosis-docstate='empty'`;
  **`tests/props-a2-document-crud-wiring.test.ts`** P-IM-4 (line 589) asserts the
  `(c)` grid case (`documents` null with `wikis` present) renders the wiki selector
  + `data-gnosis-docstate='empty'` and never `data-gnosis-state='unavailable'`.

### G2. `wikis` + a populated `DocumentList` → the wiki selector + the doc `<ul>` + the editor surface (§5.5 guards 3/4b; §5.8-16; P-IM-4 (c))
`gnosisDocumentsContent(ctx, { wikis:[<Wiki>], documents:<DocumentList>,
document:<Document>, conflict:null })` → returns a subtree whose rendered values
include the wiki name, the document title, and the document fields (the document
list `<ul>` with the per-item `data-document-id` + the `gnosis-documents-select-doc`
handler + the editor surface), while the wiki selector `<li>` items are also
present (the wiki-selector-ALWAYS rule). Never throws.
**Result: PASS**
- **Satisfying test — `tests/unit-a2-document-crud-wiring.test.ts`:** the §5.8-16
  document-surface test (line 1017) asserts `data-wiki-id` + the select-wiki
  handler AND `data-document-id` + the doc title for the populated
  `wikis`/`documents`/`document` state; **`tests/props-a2-document-crud-wiring.test.ts`**
  P-IM-4 (line 589) asserts the `(c)`-populated grid case renders the document list
  (`"data-document-id"`).

### G3. A `ConflictError` with null `wikis`/`documents` → the whole-pane conflict state, checked FIRST, no crash (§5.5 guard 1; §5.8-18; P-SM-2)
`gnosisDocumentsContent(ctx, { wikis:null, documents:null, document:null,
conflict:<ConflictError> })` → renders the whole-pane conflict state
(`data-gnosis-state='conflict'` / a conflict|409|revision indicator), even though
the cached `wikis`/`documents` are null (the conflict UX surfaces a re-read/current-
revision prompt). The `conflict` check runs BEFORE the no-wikis guard. Never a crash.
**Result: PASS**
- **Satisfying tests — `tests/unit-a2-document-crud-wiring.test.ts`:** the §5.5
  conflict-first-preserved test (line 1090) asserts `data-gnosis-state='conflict'`
  with null `wikis`/`documents`, and the §5.8-18 409-conflict test (line 1104)
  asserts the conflict indicator + no crash; **`tests/props-a2-document-crud-wiring.test.ts`**
  P-SM-2 (§5.7, line 500) asserts the GUI pane renders the conflict state for a
  generated `ConflictError`, and P-IM-4 (line 589) asserts the `(a)` grid case.

### G4. `wikis:null` / `state:null` → the whole-pane `unavailable` (engine-absent), no crash — DISTINCT from G1 (§5.5 guard 2; §5.9-38; §5.9-38b; P-IM-4 (b))
`gnosisDocumentsContent(ctx, { wikis:null, … })` AND `gnosisDocumentsContent(ctx,
null)` → the whole-pane `data-gnosis-state='unavailable'` (the no-wikis /
engine-absent branch), never a TypeError. DISTINCT from the deadlock regression: a
non-null `wikis` with a null `documents` renders the wiki selector + the empty
doc-list (G1), NOT the whole-pane unavailable.
**Result: PASS**
- **Satisfying tests — `tests/unit-a2-document-crud-wiring.test.ts`:** the §5.9-38
  preserved test (line 1080) asserts `data-gnosis-state='unavailable'` for
  `wikis:null`; the §5.9-38b preserved test (line 1085) asserts the same for a
  literal null `state` with no throw; the §5.9-38 GUI engine-absent test (line
  1116) asserts unavailable on both pane renderers; **`tests/props-a2-document-crud-wiring.test.ts`**
  P-IM-4 (line 589) feeds a literal null state (Finding-2 fold-in, line 618) and
  asserts `data-gnosis-state='unavailable'`.

### G5. An EMPTY `DocumentList` `{items:[], …}` → `data-gnosis-docstate='empty'` (§5.5 guard 4a; §5.8-20c; P-IM-4 (c))
`gnosisDocumentsContent(ctx, { wikis:[<Wiki>], documents:{ items:[], total:0,
page:1, pageSize:20 }, document:null, conflict:null })` → the Documents section
renders the empty-state indicator carrying `data-gnosis-docstate='empty'`, never
the whole-pane `data-gnosis-state='unavailable'` while the wiki selector is
available, never a TypeError.
**Result: PASS**
- **Satisfying test — `tests/unit-a2-document-crud-wiring.test.ts`:** the §5.8-20c
  empty-`DocumentList` test (line 1061) asserts `data-gnosis-docstate='empty'` for
  `{items:[]}` with non-null `wikis` and no unavailable; **`tests/props-a2-document-crud-wiring.test.ts`**
  P-IM-4 (line 589) asserts the `(c)`-empty grid case.

---

## F-rows — the documented fail-states / graceful-degradation cases

### F1. Malformed `documents` (`{}`/`{items:null}`/`{items:{}}`/`{items:5}`) or non-array `wikis` (`'abc'`/`{}`/`5`) → TOTAL render, never a native TypeError (§5.5 guard 5; §5.7 P-IM-4)
For each malformed `documents` shape the pane still surfaces a selectable wiki
surface (graceful render), and for each non-array `wikis` shape the pane does NOT
throw a native JS `TypeError` — a silent native TypeError is the contract violation
the re-derived §5.5 "NEVER a TypeError" promise and the `P-IM-4`
`strat:documents-pane-render-total` row forbid.
**Result: PASS**
- **Satisfying test — `tests/props-a2-document-crud-wiring.test.ts`:** the `P-IM-4`
  property (line 589) folds in the post-green adversarial negatives —
  `MALFORMED_DOCS = [{}, {items:null}, {items:{}}, {items:5}]` (line 609) and
  `NON_ARRAY_WIKIS = ['abc', {}, 5]` (line 610) — at deterministic indices inside
  the same ≤100-case loop (Finding-2/Finding-3 fold-ins, lines 605–674), asserting:
  malformed `documents` → the subtree still contains `gnosis-documents-select-wiki`;
  non-array `wikis` → no native TypeError is thrown. The row is HELD under the
  pinned seed (`0xA2A2A2A2`). (`tests/unit-a2-document-crud-wiring.test.ts`
  §5.9-41/§5.8-20b additionally pin the null-`documents` no-dereference rule.)

### F2. A missing doc `title`/`state`/`revision` or wiki `name` → graceful degradation, NO literal `undefined` string (§5.9 HOST-3 — the LOW-4 convention)
A document item missing `title` (resp. `revision` / `state`) or a wiki item missing
`name` must NEVER ship the literal `undefined` string to the DOM — it degrades to
an empty/placeholder value, the wiki selector still renders (ONE `<li>` per wiki)
and the doc list still renders (the `gnosis-documents-select-doc` handler present),
never a dropped pane, never a crash.
**Result: PASS**
- **Satisfying tests — `tests/unit-a2-document-crud-wiring.test.ts`:** the four
  HOST-3 graceful-degradation tests — wiki-name (line 1132), doc-title (line 1145),
  doc-revision (line 1160), doc-state (line 1175) — each assert `not.toContain('undefined')`
  in the rendered JSON while the appropriate selector handler still renders, and
  `expect(...).not.toThrow()` on the malformed state.

---

## Summary — scenario-id table with the satisfying passing module tests

| Scenario | The observable pane behavior (spec ref) | Satisfying passing module test(s) | Status |
| --- | --- | --- | --- |
| **G1** | `wikis` present + `documents:null` → wiki selector `<li>` items (data-wiki-id + select-wiki handler) + the empty doc-list state, never whole-pane unavailable (§5.5 g2/g3/g4a, §5.8-20, §5.9-41) | unit §5.8-20, §5.8-20b, §5.9-41; props **P-IM-4** | **PASS** |
| **G2** | `wikis` + populated `DocumentList` → wiki selector + doc `<ul>` + editor surface (§5.8-16, P-IM-4 (c)) | unit §5.8-16; props **P-IM-4** | **PASS** |
| **G3** | `ConflictError` with null `wikis`/`documents` → whole-pane conflict, checked FIRST, no crash (§5.5 g1, §5.8-18, P-SM-2) | unit §5.5-conflict-first, §5.8-18; props **P-SM-2**, **P-IM-4** | **PASS** |
| **G4** | `wikis:null` / `state:null` → whole-pane `unavailable`, no crash, DISTINCT from G1 (§5.5 g2, §5.9-38/38b, P-IM-4 (b)) | unit §5.9-38, §5.9-38b, §5.9-38-GUI; props **P-IM-4** (null-state fold-in) | **PASS** |
| **G5** | EMPTY `DocumentList` `{items:[]}` → `data-gnosis-docstate='empty'`, never unavailable/TypeError (§5.8-20c, P-IM-4 (c)) | unit §5.8-20c; props **P-IM-4** | **PASS** |
| **F1** | Malformed `documents` (`{}`/`{items:null}`/`{items:{}}`/`{items:5}`) + non-array `wikis` (`'abc'`/`{}`/`5`) → TOTAL render, never a native TypeError (§5.5 g5, §5.7 P-IM-4) | props **P-IM-4** (MALFORMED_DOCS + NON_ARRAY_WIKIS fold-ins) | **PASS** |
| **F2** | Missing doc `title`/`state`/`revision` or wiki `name` → graceful degradation, NO literal `undefined` string (§5.9 HOST-3) | unit HOST-3 ×4 (wiki-name, doc-title, doc-revision, doc-state) | **PASS** |

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **7** | G1–G5, F1–F2 |
| **FAIL** | **0** | — |

**Verification run (executed, not docs-only):**

```
npx vitest run tests/unit-a2-document-crud-wiring.test.ts tests/props-a2-document-crud-wiring.test.ts
 ✓ tests/props-a2-document-crud-wiring.test.ts (8 tests) 39ms
 ✓ tests/unit-a2-document-crud-wiring.test.ts (91 tests) 39ms
 Test Files  2 passed (2)
      Tests  99 passed (99)
```

All seven scenarios map to passing module tests: the 91 unit tests include the
19-test GUI-pane describe block (§5.8-16/20/20b/20c, §5.9-38/38b/41, §5.5
conflict-first, §5.8-17/18, §5.9-38-GUI, §5.9-39, §5.9-40, HOST-3 ×4, H1, the
render-helper export test), and the 8 props tests include **P-IM-4** (the
`strat:documents-pane-render-total` grid + the malformed/non-array fold-ins) and
**P-SM-2** (the 409-conflict GUI state) — **99/99 passing**. No scenario FAILs.

---

## Spec ambiguities resolved (this focused set)

- **The `ConflictError` constructor (§5.5):** the spec pins the `conflict:
  ConflictError | null` render-helper field but not the constructor signature. The
  greens derive from the sibling convention (the GN-MCP-UI greens +
  `tests/unit-a2-...` use `new ConflictError('optimistic-concurrency conflict: stale
  base revision')`); the assertions check the rendered conflict state, so a wrong
  constructor shape surfaces as a FAIL, never a silent pass.
- **The degraded-field placeholder (§5.9 HOST-3):** the spec requires "NO literal
  `undefined` string" but does not pin the exact placeholder value; the tests assert
  `not.toContain('undefined')` while the selector handlers still render — a graceful
  placeholder satisfies the (never-inert-label) contract.
