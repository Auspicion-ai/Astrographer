# Blind-test Greens — Unit F2: `qualifyStoreResult` + `storeContexts`

- **Blind-test writer run:** 2026-09-08 (fresh agent, DOCUMENTATION ONLY —
  `docs/specs/unit-f2-result-qualification.md`; NO implementation read).
- **Run file:** `tests/unit-f2-blind-greens-run.test.ts` (throwaway; may be
  deleted after recording).
- **Sources under test (LIVE modules):** `qualifyStoreResult` from
  `src/main/retrieval.js`; `StoreResultInput` from
  `src/main/merge-store-results.js`. `RagResult` inputs constructed directly.

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## Happy-path scenarios (§5.8)

### G1. `qualified: false` pass-through (§5.8.1, §5.2)
`qualifyStoreResult(merged, null, { qualified: false })` → returns the EXACT
`merged` value (object- and byte-equal): NO `store` on items/citations, NO
`storeContexts`. `stores` is NOT read.
**Result: PASS**

### G2. `qualified: true` per-item store stamps (§5.8.2)
Two stores A `[a1,a2]`, B `[b1]`; `merged.results = [a1,b1,a2]` → qualified
`results = [{...a1,store:'A'},{...b1,store:'B'},{...a2,store:'A'}]`
(interleaved order preserved; `store` = producing registry name). Input items
NOT mutated (their `store` stays absent).
**Result: PASS**

### G3. `qualified: true` citations re-derived with store (§5.8.3)
`a1=(d1,n1)` from A, `b1=(d1,n1)` from B; interleaved `[a1,b1]` → qualified
`citations = [{documentId:'d1', nodeId:'n1', store:'A'}]` (dedup,
FIRST-appearance wins).
**Result: PASS**

### G4. `storeContexts` built (§5.8.4)
Two valid stores A (default) and B → `storeContexts = [{store:'A', context:
A.context, markdown:A.markdown, lineMap:A.lineMap}, {store:'B', ...}]` in
`stores` array order, default first.
**Result: PASS**

### G5. Failed (null-result) store skipped (§5.8.5, D6)
A (default, valid), B (`result:null` — failed), C (valid, empty results) →
`storeContexts = [{store:'A',…},{store:'C',…}]` (B SKIPPED — no throw); C's
block included (possibly empty).
**Result: PASS**

### G6. Default store's `store` = registry name (§5.8.6, §5.4)
Default entry name `'main'` → its items/citations/blocks carry `store:'main'`,
NEVER `''`.
**Result: PASS**

### G7. Bare registry name, no `<name>:` prefix (§5.8.7, §5.4)
Non-default store `'wiki'` whose ids are `wiki:<id>` → its items carry
`store:'wiki'` (bare), NOT `'wiki:'`.
**Result: PASS**

### G8. Top-level block stays the default store's block (§5.8.8)
Qualified result's `context`/`markdown`/`lineMap` === `merged`'s (unchanged);
`storeContexts` carried alongside.
**Result: PASS**

### G9. `trace`/`engine`/`ranked`/`k`/`query` passed through (§5.8.9)
Unchanged from `merged`. `trace` is the merged flat trace with NO `store` field;
`engine === 'local'`.
**Result: PASS**

### G10. `blockedBy` absent in the qualified result (§5.8.10, D4)
Qualified fan-out result carries NO `blockedBy` (FLAT-only).
**Result: PASS**

### G11. Purity (§5.8.11)
After qualification, `merged` and every per-store result/item is UNCHANGED.
**Result: PASS**

### G12. Determinism (§5.8.12)
Same `merged` + `stores` + `{qualified:true}` → identical qualified output on
second call.
**Result: PASS**

### G13. Single store qualified (§5.8.13)
`qualifyStoreResult(merged, [{name, result}], {qualified:true})` → every
item/citation carries `store:<name>`; `storeContexts = [{store:<name>,…}]`.
**Result: PASS**

---

## Fail-state scenarios (§5.9)

### F1. `merged` null/undefined
Throws `Error('qualifyStoreResult: merged result required')`.
**Result: PASS**

### F2. `opts` null/undefined
Throws `Error('qualifyStoreResult: opts required')`.
**Result: PASS**

### F3. `opts.qualified` not a boolean
Throws `Error('qualifyStoreResult: qualified must be a boolean')`.
**Result: PASS**

### F4. `qualified:true`, `stores` null/undefined
Throws `Error('qualifyStoreResult: stores required when qualified')`.
**Result: PASS**

### F5. `qualified:true`, `stores` not an array
Throws `Error('qualifyStoreResult: stores required when qualified')`.
**Result: PASS**

### F6. `qualified:true`, a `stores` element null/undefined
Throws `Error('qualifyStoreResult: store entry required')`.
**Result: PASS**

### F7. `qualified:true`, element `name` not a non-empty string
Throws `Error('qualifyStoreResult: store name must be a non-empty string')`.
**Result: PASS**

### F8. `qualified:true`, valid result missing context/markdown/lineMap
Throws `Error('qualifyStoreResult: store result must have context, markdown and lineMap')`.
**Result: PASS**

### F9. `qualified:true`, unattributable `merged.results` item
Item reference in NO store's `result.results` → throws
`Error('qualifyStoreResult: unattributable result item')`.
**Result: PASS**

---

## Summary

- Happy paths: **13 / 13 PASS** (§5.8.1–5.8.13).
- Fail-states: **9 / 9 PASS** (§5.9.1–5.9.9).
- **Total: 22 / 22 PASS, 0 FAIL.**
