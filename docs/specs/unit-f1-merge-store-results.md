# Spec — Unit F1: The Pure `mergeStoreResults` Module (Cross-Store Fan-Out)

- **Status:** SPEC (the cross-store fan-out slice, Unit U-F1 of 3; execution
  order **U-F1** → U-F2 → U-F3). Proposal gate: `docs/specs/multi-store-fanout-review.md`
  (PROPOSAL GATE COMPLETE 2026-09-08 — four-agent gate: validity
  VALID-WITH-AMENDMENTS → critique UNSOUND-as-written → architecture
  PROCEED-WITH-AMENDMENTS, decisions D1–D8 → change-analysis
  PROCEED-WITH-AMENDMENTS, binding amendments A-F1..A-F4). **AWAITING the
  user's go-ahead before the spec gate** — this spec is the U-F1 contract the
  TestWriter derives the red set from once the go-ahead lands. Decisions
  consumed: **D1** (merge policy — per-store top-k interleave, rank-based, NEVER
  score-compare), **D6** (failed/empty stores — SKIP, don't fail loud), **D7**
  (determinism — registry insertion order), **D8** (3-unit decomposition),
  **A-F1** (the `storeContexts`/per-item `store` shape changes are U-F2's, gated
  to `stores:"all"`; U-F1 is the pure merge and keeps the top-level fields as
  the default store's block).
- **Scope:** a NEW pure module `src/main/merge-store-results.ts` (no Electron,
  no I/O) exporting ONE function, `mergeStoreResults`, that takes the per-store
  `RagResult` outputs (one per store, in canonical registry-insertion order)
  and merges them into a single cross-store `RagResult` by rank-based
  interleave. This unit does NOT change the `RagResult`/`RagResultItem` shapes
  (U-F2's gated `storeContexts`/per-item `store`), does NOT wire the
  `stores:"all"` schema or the fan-out (U-F3), and does NOT touch the MCP/IPC
  surfaces. The per-store result shape consumed is the Unit X `RagResult`
  (`docs/specs/unit-x-rag-provenance-traversal.md` §5.2).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the NEW
  `src/main/merge-store-results.ts` from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

The cross-store fan-out slice (`stores:"all"` on `rag.query`/`rag-stream`/the
`rag-query` IPC) fans a query out across ALL configured stores and merges the
per-store results into one `RagResult`. The architecture gate decomposed the
slice into three units (D8); U-F1 is the FIRST, the pure merge:

1. **A NEW pure module** `src/main/merge-store-results.ts` (no Electron, no
   I/O) exporting `mergeStoreResults`.
2. **The merge policy (D1):** per-store top-k interleave, rank-based, NEVER
   score-compare. `topK` is per-store (merged length ≤ N×topK). The per-store
   `score > 0` floor is kept (applied upstream, NOT re-applied by the merge).
   Mixed embedders are SAFE (rank-merge is embedder-agnostic).
3. **Skip-failed/empty (D6):** a store with an empty `results` array
   contributes zero results; a store whose `ragQuery` threw (failed-corrupt)
   is SKIPPED — the merge must not fail loud.
4. **Determinism (D7):** the merge consumes the per-store results in canonical
   (registry insertion) order and is deterministic — the same input → the same
   merged result (twice).
5. **The merged result shape:** `query` (the shared query), `results` (the
   interleaved items), `citations` (deduped across stores by
   `(documentId, nodeId)`), `trace` (flat — the merged trace), `engine`
   (`'local'`), and `ranked`/`context`/`markdown`/`lineMap`/`k` (the default
   store's block). U-F1 keeps the top-level fields as the default store's block;
   the additive `storeContexts`/per-item `store` shape changes are U-F2's
   (A-F1).

## 2. Feasibility verdict

**Feasible — a pure, deterministic, embedder-agnostic merge over the existing
Unit X `RagResult` shape.**

- **The merge is a pure function over existing types.** The per-store result
  is the Unit X `RagResult` (`docs/specs/unit-x-rag-provenance-traversal.md`
  §5.2, `src/main/retrieval.ts`). The interleave reads only `results` (the
  per-store `RagResultItem[]`); the citations dedup reads `(documentId, nodeId)`;
  the block copy reads the default store's `ranked`/`context`/`markdown`/
  `lineMap`/`k`. No new store, engine, or I/O dependency.
- **Rank-merge is embedder-agnostic (D1).** The merge never compares scores
  across stores, so mixed embedders (a vector default store + lexical
  non-default stores — the U-MS2 rule-2 topology) are SAFE by construction.
- **No engine/foundation gap.** The merge is project-specific (the fan-out
  slice's pure core). The `'incanter'`/`'zodiac'` source values remain the
  Auspicion Suite's framing (F4); the current engine is `'local'`.
- **The shape changes are deferred to U-F2 (A-F1).** U-F1 does NOT add
  `storeContexts` or the per-item `store` field, so the single-store
  byte-equality contract (Phase-1 A4) is untouched by this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The pure `mergeStoreResults` module | Project-specific (a NEW pure module) | Low cost; the fan-out's deterministic core (D1/D6/D7). |
| The rank-based interleave (never score-compare) | Project-specific (D1) | Low cost; embedder-agnostic, deterministic. |
| The skip-failed/empty behavior (D6) | Project-specific (D6) | Low cost; a failed/corrupt store never fails the fan-out loud. |
| The merged flat trace + the default-store block | Project-specific (D2/D4) | Low cost; the merged result's provenance + the preserved top-level block. |
| The `topK` option (the merged trace's `topK` field) | Project-specific | Low cost; the per-store topK reflected in the merged flat trace. |

No engine gap. The merge is a pure function over the existing `RagResult` shape;
the `'incanter'`/`'zodiac'` source values are the Auspicion Suite's framing (F4).
The `storeContexts`/per-item `store` shape changes are U-F2's (A-F1), NOT this
unit.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

_(Empty at the spec gate — populated by the adversarial pass when the unit
lands.)_

**Adversarial findings (2026-09-08, RCA-3 — all HOST, fixed + regression-tested):**

- **F-F1-2 (MEDIUM):** the default store's block (`ranked`/`context`/`markdown`/
  `lineMap`/`k`) was NOT validated — a non-null default `result` missing those
  required `RagResult` fields silently yielded `undefined` block fields.
  **FIXED:** the validation pass now asserts the FIRST entry's `result` carries
  `ranked`/`context`/`markdown`/`lineMap`/`k`, throwing
  `mergeStoreResults: default store result must carry ranked/context/markdown/lineMap/k`.
  Regression-tested (F-F1-2).
- **F-F1-3 (LOW):** the interleave pushed `result.results[rank]` verbatim — a
  sparse array (hole) or a `null`/`undefined` element leaked `undefined` into
  the merged `results`. **FIXED:** a `null`/`undefined` item is skipped in the
  interleave (D6 zero-contributor skip), still reaching non-null items beyond
  the hole. Regression-tested (F-F1-3).
- **F-F1-1 (INFO):** the citation dedup key uses string coercion
  (`${documentId}\u0000${nodeId}`) — non-string/missing ids collide. Spec pins
  strings — NO fix (documented).
- **F-F1-4 (INFO):** the merged block/items are shared by reference with the
  source results — spec §5.2 pins item copy-by-reference. NO fix (documented).

## 4. Design decisions pinned by this spec

- **RANK-INTERLEAVE-MERGE (new):** the cross-store merge is a per-store top-k
  interleave, rank-based, NEVER score-compare (D1). `topK` is per-store (merged
  length ≤ N×topK). Mixed embedders are SAFE (rank-merge is embedder-agnostic).
  The per-store `score > 0` floor is applied UPSTREAM (each store's `ragQuery`
  filters to `score > 0`); the merge does NOT re-filter.
- **SKIP-FAILED-EMPTY (new):** a store with an empty `results` array contributes
  zero results (handled by the interleave); a store whose `ragQuery` threw
  (failed-corrupt) is SKIPPED — the merge must not fail loud (D6). A failed
  store is represented in the merge input as `{ name, result: null }` and is
  skipped (contributes zero results, zero citations, not part of the
  interleave).
- **REGISTRY-INSERTION-ORDER (consumed):** the merge consumes the per-store
  results in canonical (registry insertion) order — the `Map` key order in
  `RagStoreDirectory.entries` (D7). The caller (U-F3) passes the stores in that
  order; the merge is deterministic over it.
- **DEFAULT-STORE-BLOCK (new):** the merged `ranked`/`context`/`markdown`/
  `lineMap`/`k` are the DEFAULT store's block (D2). The default store is the
  FIRST entry in the `stores` array (index 0) — the caller (U-F3) passes the
  registry's `defaultName` first. U-F1 keeps the top-level fields as the default
  store's block; the additive `storeContexts`/per-item `store` are U-F2's (A-F1).
- **FLAT-ONLY-MERGE (consumed):** `stores:"all"` is FLAT-mode only (D4), so the
  per-store results are flat-mode results and the merged result carries NO
  `blockedBy` (a graph-mode-only field). The merged `engine` is `'local'`
  (`RAG_ENGINE_ID`).

## 5. The exhaustive contract

### 5.1 The function signature + the input shape

```ts
// src/main/merge-store-results.ts (NEW — pure, no Electron, no I/O)

/** The per-store input: the store name + its per-store RagResult. A store
 *  whose ragQuery threw (failed-corrupt) is passed as `{ name, result: null }`
 *  and is SKIPPED (D6). The array is in canonical (registry insertion) order;
 *  the FIRST entry is the default store (the caller passes defaultName first). */
export interface StoreResultInput {
  name: string
  result: RagResult | null | undefined
}

/** Merge the per-store RagResult outputs into one cross-store RagResult by
 *  rank-based interleave (D1). Deterministic (D7). Pure — no Electron, no I/O. */
export function mergeStoreResults(
  stores: Array<StoreResultInput>,
  opts?: { topK?: number },
): RagResult
```

**The input (`stores`):**

- An array of `{ name, result }` entries, in canonical (registry insertion)
  order — the `Map` key order in `RagStoreDirectory.entries` (D7).
- The FIRST entry (index 0) is the DEFAULT store (the caller passes the
  registry's `defaultName` first). Its `ranked`/`context`/`markdown`/`lineMap`/
  `k` become the merged result's top-level block (D2).
- `result` is a valid `RagResult` for a store whose `ragQuery` succeeded, or
  `null`/`undefined` for a store whose `ragQuery` threw (failed-corrupt — D6).
  A `null`/`undefined` `result` is SKIPPED (contributes zero), NOT a throw.
- All per-store results share the same `query` (the fan-out runs the same query
  across all stores).

**The `opts` option:**

- `opts` is OPTIONAL. A `null`/`undefined` `opts` is treated as `{}` (no throw).
- `opts.topK` is the per-store topK used by the fan-out; it feeds the merged flat
  trace's `topK` field. Default `5`. When present it must be a positive integer
  in [1, 50] (matching `ragQuery`'s bound); otherwise the merge throws (see
  §5.6).

### 5.2 The interleave algorithm (rank-based, D1)

The merged `results` array is built by a round-robin over the stores' `results`
arrays BY RANK:

```
for rank = 0, 1, 2, …:
  for each store in stores (in array order):
    if store.result is null/undefined: skip (failed — D6)
    if rank < store.result.results.length:
      push store.result.results[rank]
  if no store contributed at this rank: stop
```

- **Rank order:** store 0's rank-1 (index 0), store 1's rank-1, …, store 0's
  rank-2 (index 1), store 1's rank-2, … — a round-robin by rank over the stores
  in array order.
- **Exhausted stores are skipped:** a store whose `results` array is shorter
  than the current rank contributes nothing at that rank and later ranks (its
  `results` is exhausted). This is the D6 empty-store skip, handled naturally by
  the interleave.
- **Termination:** the loop stops at the first rank where NO store contributes
  (every store's `results` is exhausted). The merged length is the sum of the
  per-store `results` lengths, each ≤ `topK`, so the merged length ≤ N×topK
  (D1).
- **The merged items are the per-store `RagResultItem` objects, unchanged.**
  U-F1 does NOT add the per-item `store` field (that is U-F2's gated change,
  A-F1). The items are copied by reference into the merged `results` array in
  interleaved order.
- **Determinism:** the interleave is deterministic — a fixed store order (the
  input array order) and a fixed per-store result order (each store's `results`
  is already rank-ordered by its `ragQuery`). The same input → the same
  interleaved `results` (twice).

### 5.3 The `score > 0` floor (NOT re-applied)

- Each store's `ragQuery` already filters its `ranked`/`results` to `score > 0`
  (`src/main/retrieval.ts` — `ragQuery` filters `selectTopK` output to
  `score > 0`). The merge does NOT re-filter.
- The merge interleaves the per-store `results` VERBATIM — it never inspects or
  drops an item based on its `score`. A per-store item with `score <= 0` (which
  the upstream filter should have removed) is interleaved as-is; the merge does
  not enforce the floor (the floor is per-store, applied upstream).
- **Pinned:** the merge performs NO score comparison across stores and NO
  score-based filtering. This is what makes the merge embedder-agnostic (D1).

### 5.4 Skip-failed/empty (D6)

- **Empty `results`:** a store with an empty `results` array contributes zero
  results — handled naturally by the interleave (its `results` is exhausted at
  rank 0). It contributes zero citations and is not part of the interleave.
- **Failed store (`result` null/undefined):** a store whose `ragQuery` threw
  (failed-corrupt) is passed as `{ name, result: null }` and is SKIPPED — it
  contributes zero results, zero citations, and is not part of the interleave.
  The merge does NOT fail loud (D6). **Pinned:** a `null`/`undefined` `result`
  is a SKIP, NOT a throw.
- **The default store must be valid:** the FIRST entry (the default store) must
  carry a valid `result`. If the default store's `result` is `null`/`undefined`
  (a failed default store), the merge throws `Error('mergeStoreResults: default
  store result required')` — a defensive fail-state (the default store is the
  **deliberate D6 default-exemption**: the top-level
  `ranked`/`context`/`markdown`/`lineMap`/`k` block (D2) is the default store's,
  so a failed default store has no block to use — it FAILS LOUD rather than
  silently dropping the primary result block. This carve-out is a deliberate
  design decision beyond the gate's D6 "failed/empty stores SKIP" (which covers
  NON-default stores only).) This also covers the all-stores-failed case (the
  first entry is failed).

### 5.5 The merged result shape

The merged result is a `RagResult`:

```ts
{
  query: string,                       // the shared query (the default store's)
  results: RagResultItem[],           // the interleaved items (§5.2)
  engine: 'local',                     // RAG_ENGINE_ID
  citations: Array<{ documentId: string; nodeId: string }>,  // deduped across stores
  trace: FlatTrace,                    // the merged flat trace
  // ---- the default store's block (D2) ----
  ranked: ScoredNode[],                // the default store's ranked
  context: RagNode[],                  // the default store's context
  markdown: string,                    // the default store's markdown
  lineMap: LineNodeMap,                // the default store's lineMap
  k: number,                           // the default store's k
}
```

- **`query`:** the default store's `query` (the first entry's result). Since all
  per-store results share the same query, this is deterministic.
- **`results`:** the interleaved items (§5.2), unchanged (no per-item `store`
  field — U-F2's gated change, A-F1).
- **`engine`:** `'local'` (the module constant `RAG_ENGINE_ID`).
- **`citations`:** the deduplicated grounding set across ALL stores, by
  `(documentId, nodeId)`. Order is by FIRST APPEARANCE in the interleaved
  `results` (the same semantics as `buildCitations`). A `(documentId, nodeId)`
  tuple that appears in more than one store's results is cited ONCE (the first
  occurrence in the interleaved order wins).
- **`trace`:** the MERGED flat trace — `{ mode: 'flat', engine: 'local', topK:
  opts.topK ?? 5, source: 'local' }`. This is a NEW flat trace (not the default
  store's trace); its `topK` is the per-store topK (`opts.topK ?? 5`).
- **`blockedBy`:** ABSENT. `stores:"all"` is FLAT-mode only (D4), so the merged
  result carries no `blockedBy` (a graph-mode-only field).
- **`ranked`/`context`/`markdown`/`lineMap`/`k`:** the DEFAULT store's block
  (D2) — copied from the first entry's result. U-F1 keeps the top-level fields
  as the default store's block; the additive `storeContexts`/per-item `store`
  are U-F2's (A-F1).

### 5.6 Fail-states (throws)

- `stores` is `null`/`undefined` → throws
  `Error('mergeStoreResults: stores required')`.
- `stores` is not an array → throws
  `Error('mergeStoreResults: stores required')`.
- `stores` is an EMPTY array → throws
  `Error('mergeStoreResults: stores must not be empty')`.
- A `stores` element is `null`/`undefined` → throws
  `Error('mergeStoreResults: store entry required')`.
- A `stores` element's `name` is not a non-empty string → throws
  `Error('mergeStoreResults: store name must be a non-empty string')`.
- A `stores` element's `result` is present (non-null) but its `results` is not
  an array → throws `Error('mergeStoreResults: store results must be an
  array')`.
- The FIRST entry (the default store) has a `null`/`undefined` `result` (a
  failed default store) → throws
  `Error('mergeStoreResults: default store result required')` (a defensive
  fail-state — the default store is the main store, always loaded).
- `opts.topK` is present but not a positive integer in [1, 50] → throws
  `Error('mergeStoreResults: topK must be an integer in [1, 50]')` (a defensive
  fail-state matching `ragQuery`'s bound).

**Pinned reconciliation of the task's fail-state list:** a store with a
`null`/`undefined` `result` is a SKIP (D6), NOT a throw — the merge must not
fail loud on a failed store. The genuinely-throwing fail-states are the
malformed-input cases above (null/undefined `stores`, a non-array `stores`, an
empty `stores`, a null/undefined entry, a non-string `name`, a non-array
`results`, a failed default store, an invalid `topK`).

**Architect arbitration (2026-09-08, TestWriter ambiguities):**
1. **`results` non-array detection:** a non-null `result` whose `results` is NOT
   an array (including a missing/`undefined` `results`) → throws
   `mergeStoreResults: store results must be an array` (a present `result` is
   malformed without the expected `results` array — `!Array.isArray(result.results)`).
2. **Non-object `opts`:** `opts` that is not a plain object (null, undefined, a
   string, a number) is coerced to `{}` (no throw) — it is an optional config;
   only a present-but-invalid `opts.topK` throws.
3. **Check order (pinned):** for each element, validate in this order —
   element presence (`store entry required`) → `name` non-empty string (`store
   name must be a non-empty string`) → `result.results` is an array (`store
   results must be an array`, when `result` is non-null) → the default store's
   `result` non-null (`default store result required`, for the FIRST entry
   only). This order is what `mergeStoreResults` implements.

### 5.7 Determinism

- The same input → the same merged result (twice). The interleave (§5.2), the
  citations dedup (§5.5), the block copy (§5.5), and the merged trace (§5.5)
  are all deterministic over the input array order and the per-store result
  order.
- The merge performs no randomness, no network egress, no I/O, and no
  score-comparison across stores (D1/D7).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Two stores, equal lengths:** store A's `results` = [a1, a2], store B's =
   [b1, b2] → the merged `results` = [a1, b1, a2, b2] (round-robin by rank).
2. **Two stores, unequal lengths:** store A's `results` = [a1, a2, a3], store
   B's = [b1] → the merged `results` = [a1, b1, a2, a3] (B is exhausted after
   rank 1; A's remaining items follow).
3. **Three stores, one empty:** store A's = [a1, a2], store B's = [], store C's
   = [c1] → the merged `results` = [a1, c1, a2] (B contributes zero — D6).
4. **A failed store (null result):** store A's = [a1], store B's `result` =
   `null` (failed-corrupt), store C's = [c1] → the merged `results` = [a1, c1]
   (B is SKIPPED, no throw — D6).
5. **Citations dedup across stores:** store A's results cite `(d1, n1)` and
   store B's results ALSO cite `(d1, n1)` → the merged `citations` contains
   `(d1, n1)` ONCE (first-appearance order).
6. **The default store's block:** the merged `ranked`/`context`/`markdown`/
   `lineMap`/`k` are the FIRST entry's result's corresponding fields (D2).
7. **The merged flat trace:** `mergeStoreResults(stores, { topK: 5 })` → the
   merged `trace` = `{ mode: 'flat', engine: 'local', topK: 5, source: 'local' }`.
8. **The merged `engine`:** the merged `engine` = `'local'`.
9. **The merged `query`:** the merged `query` = the default store's `query`.
10. **No `blockedBy`:** the merged result carries NO `blockedBy` (flat-only, D4).
11. **Merged length bound:** with N stores each contributing ≤ `topK` results,
    the merged `results` length ≤ N×topK (D1).
12. **Determinism:** the same input → the same merged result (twice).
13. **`opts` omitted / `opts` null:** `mergeStoreResults(stores)` and
    `mergeStoreResults(stores, null)` → the merged trace's `topK` = 5 (the
    default).
14. **A single store:** `mergeStoreResults([{ name, result }])` → the merged
    `results` = the store's `results` (unchanged), the block = the store's
    block, the citations = the store's citations (deduped), the trace = the
    merged flat trace.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`stores` null/undefined** → throws
   `Error('mergeStoreResults: stores required')`.
2. **`stores` not an array** → throws
   `Error('mergeStoreResults: stores required')`.
3. **`stores` empty** → throws
   `Error('mergeStoreResults: stores must not be empty')`.
4. **A `stores` element null/undefined** → throws
   `Error('mergeStoreResults: store entry required')`.
5. **A `stores` element's `name` not a non-empty string** → throws
   `Error('mergeStoreResults: store name must be a non-empty string')`.
6. **A `stores` element's `result` present but `results` not an array** → throws
   `Error('mergeStoreResults: store results must be an array')`.
7. **The default store (first entry) has a null/undefined `result`** → throws
   `Error('mergeStoreResults: default store result required')`.
8. **`opts.topK` present but not a positive integer in [1, 50]** → throws
   `Error('mergeStoreResults: topK must be an integer in [1, 50]')`.

**Pinned non-throws (D6):** a NON-default store with a `null`/`undefined`
`result` is SKIPPED (contributes zero), NOT a throw. A store with an empty
`results` array contributes zero, NOT a throw.

### 5.10 Census / numeric claims

- **New exported function:** `mergeStoreResults` (in the NEW
  `src/main/merge-store-results.ts`).
- **New exported type:** `StoreResultInput` (in `src/main/merge-store-results.ts`).
- **New module:** `src/main/merge-store-results.ts` (pure, no Electron, no I/O).
- **Merged length bound:** ≤ N×topK (D1), where N = the number of stores and
  `topK` = the per-store topK.
- **Defaults:** `opts.topK` = 5; `opts` null/undefined → `{}`.
- **Bounds:** `opts.topK` ∈ [1, 50] (matching `ragQuery`'s bound).
- **Engine id:** `'local'` (`RAG_ENGINE_ID`).
- **Merged trace:** `{ mode: 'flat', engine: 'local', topK: opts.topK ?? 5,
  source: 'local' }`.
- **Citations dedup key:** the `(documentId, nodeId)` tuple, first-appearance
  order across the interleaved `results`.
- **The default store:** the FIRST entry (index 0) of the `stores` array.

### 5.11 Cross-references

- The proposal gate: `docs/specs/multi-store-fanout-review.md` — D1 (merge
  policy), D2 (`storeContexts`/default-store block), D4 (flat-only), D6
  (skip-failed/empty), D7 (determinism), D8 (3-unit decomposition), A-F1 (the
  shape changes are U-F2's, gated to `stores:"all"`).
- The per-store result shape: `docs/specs/unit-x-rag-provenance-traversal.md`
  §5.2 (the `RagResult`/`RagResultItem`/`FlatTrace`/`RagTrace`/`BlockedByEntry`
  shapes), §5.3 (`buildCitations` — the citations-dedup semantics the merge
  reuses), §5.6 (`ragQuery` — the per-store result producer, which applies the
  `score > 0` floor upstream).
- The host types: `src/main/retrieval.ts` — `RagResult`, `RagResultItem`,
  `FlatTrace`, `RagTrace`, `BlockedByEntry`, `ScoredNode`, `RagNode`,
  `LineNodeMap`, `RAG_ENGINE_ID` (`'local'`).
- The canonical order: `src/main/rag-store-directory.ts` — `RagStoreDirectory`
  (`entries: ReadonlyMap<string, RagStoreEntry>`, `defaultName`), the `Map` key
  order (D7), `RagStoreEntry` (`name`/`store`/`engine`/`corrupt`/`missing`).
- The fan-out wiring (U-F3, NOT this unit): `docs/specs/multi-store-fanout-review.md`
  D5/D8 + A-F3/A-F4 — the `stores:"all"` schema, the flat-only guard, the
  mutual-exclusion, the audit `stores` field, the fan-out in `handleRagTool`.
- The shape changes (U-F2, NOT this unit): `docs/specs/multi-store-fanout-review.md`
  D2/D3 + A-F1 — `storeContexts` + the per-item/per-entry `store`, gated to
  `stores:"all"`.
- Decisions: `docs/decisions.md` rows **RANK-INTERLEAVE-MERGE**,
  **SKIP-FAILED-EMPTY**, **DEFAULT-STORE-BLOCK** (new, added when the unit
  lands); consumed **REGISTRY-INSERTION-ORDER** (D7), **FLAT-ONLY-MERGE** (D4),
  **ENGINE-IS-LOCAL** (Unit X).
- Host pattern: `src/main/merge-store-results.ts` (NEW — the pure merge).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for the NEW `src/main/merge-store-results.ts`
from §5.8/§5.9. The red set (recorded in the next-steps DONE row for this
unit):

- **The interleave:** the happy-path states 1–3 (equal lengths, unequal lengths,
  an empty store), the merged-length bound (11).
- **The skip-failed behavior:** the happy-path state 4 (a null-result store is
  skipped, no throw) + the pinned non-throws (§5.9).
- **The merged result shape:** the citations dedup (5), the default-store block
  (6), the merged flat trace (7), the `engine` (8), the `query` (9), the absent
  `blockedBy` (10), the single-store case (14).
- **The `opts` handling:** the default `topK` (13), the `topK` validation
  fail-state (8).
- **Determinism:** the happy-path state 12 (the same input → the same merged
  result, twice).
- **The fail-states:** 1–8 (§5.9).
