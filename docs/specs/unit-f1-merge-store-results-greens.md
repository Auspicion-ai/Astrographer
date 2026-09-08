# Unit F1 — `mergeStoreResults` — Blind-Test Greens

Fresh-agent green-scenario battery authored from `docs/specs/unit-f1-merge-store-results.md`
§5.1–§5.10 ONLY (no implementation reading). Run against the live module
`src/main/merge-store-results.ts`. The module is pure and the per-store input is
the Unit X `RagResult`/`RagResultItem` shape — constructed directly in the test.
A FAIL is a doc/spec drift or an un-hardened regression — never a pass.

## §5.2 The interleave (round-robin by rank)

1. **Two stores, equal lengths** — A=[a1,a2], B=[b1,b2] → merged `results` = [a1,b1,a2,b2]. **PASS**
2. **Two stores, unequal lengths** — A=[a1,a2,a3], B=[b1] → merged `results` = [a1,b1,a2,a3] (B exhausted after rank 1; A's remainder follows). **PASS**
3. **Three stores, one empty** — A=[a1,a2], B=[], C=[c1] → merged `results` = [a1,c1,a2] (B contributes zero — D6). **PASS**

## §5.4 Skip-failed/empty (D6)

4. **A failed store (null result)** — A=[a1], B `result` = `null` (failed-corrupt), C=[c1] → merged `results` = [a1,c1] (B SKIPPED, NO throw — D6). **PASS**
5. **Pinned non-throws** — a NON-default store with a `null`/`undefined` `result` and a store with an empty `results` array cause NO throw (each contributes zero). **PASS**

## §5.5 The merged shape

6. **Citations dedup across stores** — A cites `(d1,n1)` and B ALSO cites `(d1,n1)` → merged `citations` contains `(d1,n1)` ONCE, first-appearance order across the interleaved `results`. **PASS**
7. **The default store's block** — merged `ranked`/`context`/`markdown`/`lineMap`/`k` = the FIRST entry's result's corresponding fields (D2). **PASS**
8. **The merged flat trace** — `mergeStoreResults(stores,{topK:5})` → `trace` = `{ mode:'flat', engine:'local', topK:5, source:'local' }`. **PASS**
9. **The merged `engine`** — merged `engine` = `'local'`. **PASS**
10. **The merged `query`** — merged `query` = the default store's `query`. **PASS**
11. **No `blockedBy`** — merged result carries NO `blockedBy` (flat-only, D4). **PASS**
12. **Merged length bound** — N stores each with `results` length `≤ topK` → merged length `≤ N×topK` (D1). **PASS**

## §5.7 / §5.8 Determinism + opts + single store

13. **Determinism** — the same input → the same merged result (twice). **PASS**
14. **`opts` omitted / `opts` null** — `mergeStoreResults(stores)` and `mergeStoreResults(stores,null)` → merged trace `topK` = 5 (the default; no throw). **PASS**
15. **A single store** — `mergeStoreResults([{name,result}])` → merged `results` = the store's `results` unchanged, the block = the store's block, the citations = the store's (deduped), the trace = the merged flat trace. **PASS**

## §5.9 Fail-states

16. **`stores` null/undefined** → throws `Error('mergeStoreResults: stores required')`. **PASS**
17. **`stores` not an array** → throws `Error('mergeStoreResults: stores required')`. **PASS**
18. **`stores` empty** → throws `Error('mergeStoreResults: stores must not be empty')`. **PASS**
19. **A `stores` element null/undefined** → throws `Error('mergeStoreResults: store entry required')`. **PASS**
20. **A `stores` element's `name` not a non-empty string** → throws `Error('mergeStoreResults: store name must be a non-empty string')`. **PASS**
21. **A `stores` element's `result` present but `results` not an array** → throws `Error('mergeStoreResults: store results must be an array')`. **PASS**
22. **The default store (first entry) has a `null`/`undefined` `result`** → throws `Error('mergeStoreResults: default store result required')`. **PASS**
23. **`opts.topK` present but not a positive integer in [1,50]** → throws `Error('mergeStoreResults: topK must be an integer in [1, 50]')`. **PASS**

## Result

23 scenarios — **23 PASS / 0 FAIL**.

Blind-run on 2026-09-08 via the throwaway `tests/unit-f1-blind-greens-run.test.ts`
against the live `src/main/merge-store-results.js` (23/23 passing).

