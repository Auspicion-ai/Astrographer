# Spec — Unit F2: Result Qualification + `storeContexts` (Cross-Store Fan-Out)

- **Status:** SPEC (the cross-store fan-out slice, Unit U-F2 of 3; execution
  order **U-F1** → **U-F2** → U-F3). Proposal gate:
  `docs/specs/multi-store-fanout-review.md` (PROPOSAL GATE COMPLETE 2026-09-08 —
  four-agent gate: validity VALID-WITH-AMENDMENTS → critique UNSOUND-as-written
  → architecture PROCEED-WITH-AMENDMENTS, decisions D1–D8 → change-analysis
  PROCEED-WITH-AMENDMENTS, binding amendments A-F1..A-F4). **AWAITING the user's
  go-ahead before the spec gate** — this spec is the U-F2 contract the
  TestWriter derives the red set from once the go-ahead lands. Decisions
  consumed: **D2** (`context`/`markdown`/`lineMap` per-store blocks via the
  additive `storeContexts`; the top-level fields stay the default store's
  block), **D3** (result qualification — per-item/per-entry `store`; the
  `<name>:` prefix is a secondary signal only, the default store's ids are
  unprefixed), **D4** (graph mode — `stores:"all"` is FLAT-only; `engine` stays
  `'local'`), **D8** (3-unit decomposition), **A-F1 (CRITICAL)** (gate
  `storeContexts` + the per-item/per-entry `store` to `stores:"all"` mode ONLY —
  single-store stays byte-equal, preserving the Phase-1 A4 contract).
  **A-F2 is NOT this unit** — the optional `QueryAuditEntry.stores` is U-F3's
  (the audit wiring). **A-F3/A-F4 are NOT this unit** — U-F3's fan-out wiring,
  schema, and IPC surface.
- **Scope:** the breaking-change shape unit. It ADDITIVELY extends the
  `RagResult`/`RagResultItem`/`citations`/`trace`/`blockedBy` shapes — ALL of
  which live in `src/main/retrieval.ts` (NOT `src/shared/types.ts` — that file
  does not host the `RagResult` family) — with the store qualification, ADDS a
  PURE builder `qualifyStoreResult`, and ADDS the `storeContexts` array, ALL
  GATED to `stores:"all"` mode. This unit does NOT wire the fan-out or the
  `stores:"all"` schema (U-F3's), does NOT touch the MCP/IPC surfaces
  (`src/shared/types.ts`, `src/main/mcp-server.ts` — D5/A-F4 are U-F3's), and
  does NOT change the merge policy (U-F1's).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the shape additions + the NEW
  `qualifyStoreResult` in `src/main/retrieval.ts` from §5.8/§5.9 before any
  implementation, and confirms the A-F1 byte-equality reconciliations in §5.10
  hold.

---

## 1. What the proposal asks

The cross-store fan-out slice (`stores:"all"`) fans a query out across ALL
configured stores and merges the per-store results into one `RagResult`. U-F1
(the pure `mergeStoreResults`) produces the merged, interleaved `RagResult`
with the top-level `ranked`/`context`/`markdown`/`lineMap`/`k` as the DEFAULT
store's block. U-F2 makes that fan-out result STORE-QUALIFIED:

1. **The per-item `store` field (D3):** each `RagResultItem` in the merged
   `results` array gains an ADDITIVE `store` field naming the store that
   produced it.
2. **The per-entry `store` on `citations`/`blockedBy`/`trace` (D3):** each
   `citations` entry gains `store`. The `store` field is added to the
   `GraphTraceEntry` and `BlockedByEntry` TYPES additively, and the
   qualified-builder behavior is pinned for them (D4 makes the fan-out FLAT-only,
   so graph-trace and `blockedBy` entries are never present in a qualified
   result — see §5.2).
3. **The `storeContexts` array (D2):** an ADDITIVE
   `storeContexts: Array<{ store: string; context: RagNode[]; markdown: string;
   lineMap: LineNodeMap }>` — one block per store, each carrying that store's
   own assembled context/markdown/lineMap. The TOP-LEVEL `context`/`markdown`/
   `lineMap` stay the DEFAULT store's block (unchanged by U-F2).
4. **A-F1 (CRITICAL):** BOTH the shape additions (the per-item/per-entry
   `store`) AND `storeContexts` are PRESENT ONLY on a result produced by a
   `stores:"all"` fan-out. A single-store `ragQuery` result is BYTE-EQUAL to
   today — no `store` on items/entries, no `storeContexts` (preserving the
   Phase-1 A4 contract). This unit carries the test updates that assert the
   byte-equality stays green (§5.10).

## 2. Feasibility verdict

**Feasible — pure additive shape extensions + a pure builder over the existing
`RagResult` type; no engine/foundation gap.**

- **The shapes live in `src/main/retrieval.ts`.** `RagResult`, `RagResultItem`,
  `FlatTrace`, `GraphTraceEntry`, `BlockedByEntry`, `RagTrace` (and `ScoredNode`/
  `RagNode`/`LineNodeMap`) are all declared there. `src/shared/types.ts` hosts the
  IPC transport (`RagQueryResult`), NOT the `RagResult` family, so U-F2 does NOT
  touch `shared/types.ts` (the IPC surface is U-F3's D5/A-F4).
- **The added fields are additive and OPTIONAL.** `storeContexts?` on `RagResult`,
  `store?` on `RagResultItem`/citation entries/`GraphTraceEntry`/`BlockedByEntry`
  — following the CHILDREN-ADDITIVE-STORE-FORMAT precedent. A single-store result
  (with the fields absent) remains structurally valid and byte-equal.
- **The builder is a PURE function (A-F1).** `qualifyStoreResult(merged, stores,
  {qualified})` returns the input `merged` unchanged (byte-equal) when
  `qualified` is `false`, and stamps the store fields + builds `storeContexts`
  from the per-store results when `qualified` is `true`. It never mutates its
  inputs (spread-copy items). No Electron, no I/O, no network.
- **No engine/foundation gap.** The engine stays `'local'` (D4). The gate is a
  mode-flag decision made by the U-F3 caller, not by the engine.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The additive `store`/`storeContexts` shape changes | Project-specific (extends `src/main/retrieval.ts`) | Low cost; the store-qualified fan-out surface (D2/D3). |
| The pure `qualifyStoreResult` builder | Project-specific (a NEW pure function in `retrieval.ts`) | Low cost; the A-F1 gate — qualified `true` stamps, `false` bytes-equal. |
| The `storeContexts` per-store block assembly | Project-specific (reads each store's `result.context/markdown/lineMap`) | Low cost; the per-store provenance D2 requires. |
| The A-F1 byte-equality preservation | Project-specific (the gate is a caller-passed flag, not an engine change) | Low cost; the Phase-1 A4 contract stays intact for single-store. |

No engine gap. The `'incanter'`/`'zodiac'` source values remain the Auspicion
Suite's framing (F4); the current engine is `'local'` and the fan-out is
FLAT-only (D4). `shared/types.ts` and `mcp-server.ts` are untouched — the IPC/
MCP surface (D5/A-F4) and the optional audit `stores` (A-F2) are U-F3's.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when
> the unit lands. It is EMPTY at the spec gate. The TestWriter derives the red
> set from §5.8/§5.9 ALONE; the adversarial pass records host findings here
> (fixed + regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

_(Empty at the spec gate — populated by the adversarial pass when the unit
lands.)_

**Adversarial findings (2026-09-08, RCA-3 — all HOST, fixed + regression-tested):**

- **F-F2-1 (MEDIUM):** a `stores` entry with a valid (non-null) `result` carrying
  `context`/`markdown`/`lineMap` but an ABSENT/undefined `results` array passed
  the §5.6 validation and crashed with an unpinned
  `TypeError: results is not iterable`. **FIXED:** the validation pass now guards
  `Array.isArray(result.results)` before the block-field check, throwing
  `qualifyStoreResult: store results must be an array`. Regression-tested (F-F2-1).
- **F-F2-2 (LOW):** a `null`/`undefined` element in `merged.results` was silently
  spread (`{...null}` → `{}`) before `unattributable result item` — a
  mischaracterizing message. **FIXED:** a `null`/`undefined` element is skipped
  (consistent with U-F1's F-F1-3 null skip) — no `{}` leak, no mischaracterizing
  throw. Regression-tested (F-F2-2).

Forward note for U-F3: item attribution is reference-identity against
`stores[].result.results`; `qualifyStoreResult` must run directly on the merged
output (any intermediate transform breaks the attribution).

## 4. Design decisions pinned by this spec

- **QUALIFY-RESULT (new):** the merged fan-out result is store-qualified by a
  PURE builder `qualifyStoreResult(merged, stores, opts)` (D3). `opts.qualified`
  is the A-F1 gate: `true` stamps the per-item/per-entry `store` + builds
  `storeContexts`; `false` returns `merged` unchanged (byte-equal). Non-mutating
  (spread-copies items), no Electron/I/O, deterministic.
- **STORECONTEXTS-BLOCKS (new):** the qualified result carries an ADDITIVE
  `storeContexts: Array<{ store: string; context: RagNode[]; markdown: string;
  lineMap: LineNodeMap }>` — one block per store with a VALID result, in the
  `stores` array (canonical registry insertion) order (D2). A null/undefined
  result store (failed — D6) contributes NO block. The top-level `context`/
  `markdown`/`lineMap` stay the DEFAULT store's block (the merged block, from
  U-F1).
- **STORE-FIELD-NAMING (new):** the `store` on every item/citation/block names
  the producing store's REGISTRY NAME (the `stores` entry's `name` field) —
  WITHOUT the `<name>:` id prefix (D3: the prefix is a secondary signal only). A
  fan-out always runs under a registry (A-F3), so the default store's `store` is
  its registry name (e.g. `'main'`), NEVER `''`; the `''` legacy sentinel is
  unreachable in a qualified result.
- **FLAT-ONLY-QUALIFICATION (consumed):** `stores:"all"` is FLAT-mode only (D4).
  A qualified fan-out result carries NO `blockedBy` and NO graph-trace entries.
  The `store` field on `GraphTraceEntry`/`BlockedByEntry` types is ADDITIVE for
  type-shape uniformity but is NEVER stamped by the qualified flat builder.
  `FlatTrace` gains NO `store` field — it is the shared merged trace
  `{mode:'flat', engine:'local', topK, source:'local'}`.
- **ENGINE-IS-LOCAL (consumed):** the merged `engine` stays `'local'`
  (`RAG_ENGINE_ID`); U-F2 does not change it.

## 5. The exhaustive contract

### 5.1 The additive result shape (`src/main/retrieval.ts`)

All shapes below EXTEND the existing declarations; every NEW field is OPTIONAL
so a single-store result with them absent is structurally valid and byte-equal.

```ts
// src/main/retrieval.ts (extended — all fields ADDITIVE + OPTIONAL)

/** The per-result item (the contract's `results` array element). D3 — the
 *  additive `store` names the producing store; PRESENT ONLY in a qualified
 *  (`stores:"all"`) result (A-F1). */
export interface RagResultItem {
  documentId: string
  nodeId: string
  score: number
  snippet: string
  source: 'local' | 'incanter' | 'zodiac'
  parent?: { documentId: string; title: string; snippet: string; stale: boolean }
  store?: string            // ADDITIVE — the producing store's registry name
}

/** The graph-mode trace entry (A1). D3 — the additive `store` is for TYPE-shape
 *  uniformity; NEVER stamped by the qualified FLAT builder (D4, fan-out is
 *  FLAT-only). */
export interface GraphTraceEntry {
  from: { documentId: string; nodeId: string }
  to: { documentId: string; nodeId: string }
  edge: 'link' | 'embed'
  state: 'FRESH' | 'RESOLVED' | 'STALE' | 'BROKEN'
  store?: string            // ADDITIVE — never appears in a qualified result (FLAT-only)
}

/** The blocked-by entry (graph mode, empty result). D3 — ADDITIVE `store`,
 *  never stamped by the qualified FLAT builder. */
export interface BlockedByEntry {
  documentId: string
  nodeId: string
  state: 'BROKEN' | 'STALE'
  store?: string            // ADDITIVE — never appears in a qualified result (FLAT-only)
}

/** One per-store context block (D2). */
export interface StoreContextBlock {
  store: string                       // the producing store's registry name (no `<name>:` prefix)
  context: RagNode[]                  // that store's assembled context
  markdown: string                     // that store's rendered markdown
  lineMap: LineNodeMap                // that store's coarse line→node map
}

/** The extended RAG result. The existing fields are UNCHANGED. A-F1 — the
 *  ADDITIVE `storeContexts` is present ONLY in a qualified (`stores:"all"`)
 *  result; absent (undefined) in a single-store result. */
export interface RagResult {
  query: string
  results: RagResultItem[]                                     // items carry `store?` when qualified
  engine: string
  citations: Array<{ documentId: string; nodeId: string; store?: string }>  // entries carry `store?` when qualified
  trace: RagTrace                                              // the merged flat trace — NO store field
  blockedBy?: BlockedByEntry[]                                 // ABSENT in a qualified fan-out (FLAT-only)
  // ---- the preserved existing surface (backward-compatible) ----
  ranked: ScoredNode[]
  context: RagNode[]                     // the DEFAULT store's block (unchanged)
  markdown: string                       // the DEFAULT store's block (unchanged)
  lineMap: LineNodeMap                   // the DEFAULT store's block (unchanged)
  k: number
  /** D2/A-F1 — per-store context blocks. PRESENT ONLY when `qualified`; the
   *  top-level context/markdown/lineMap stay the default store's block. */
  storeContexts?: StoreContextBlock[]
}
```

**Pinned facts about the shape:**

- `citations` entries are `{ documentId, nodeId, store?: string }`. `store` is
  ABSENT in a single-store result (byte-equal to today's `[{documentId, nodeId}]`).
- `FlatTrace` gains NO `store` field — the merged flat trace
  `{mode:'flat', engine:'local', topK, source:'local'}` is the SHARED trace for
  the whole fan-out, not a per-store trace.
- `GraphTraceEntry.store` and `BlockedByEntry.store` are ADDITIVE OPTIONAL for
  shape uniformity. Because `stores:"all"` is FLAT-only (D4) and the qualified
  builder emits no `blockedBy` and no graph trace, these fields are never
  PRESENT in a qualified fan-out result. A future graph-mode fan-out (out of
  scope, D4 disallows it) would reuse them.
- `shared/types.ts` is NOT changed by U-F2. Its `RagQueryResult` is the IPC
  transport (a different concern); the IPC/MCP surface is U-F3's (D5/A-F4).

### 5.2 The gating (A-F1) — how the mode reaches the shape builder

- **The `qualified` flag is a CALLER-PASSED option to the pure builder** —
  NOT an option threaded through `ragQuery`. `ragQuery`'s signature is UNCHANGED
  (single-store `ragQuery` produces today's byte-equal result — no `store`, no
  `storeContexts`).
- **Wiring (U-F3, not this unit):** when a `stores:"all"` fan-out runs, U-F3
  calls per-store `ragQuery` (single-store shape), then `mergeStoreResults`
  (U-F1), then `qualifyStoreResult(merged, stores, { qualified: true })`. A
  single-store query does NOT call `qualifyStoreResult` (or calls it with
  `{ qualified: false }`), so its result is byte-equal to today.
- **The gate is exact:** `qualified` is the sole switch. `qualified: true`
  stamps `storeContexts` + the per-item/per-entry `store`; `qualified: false`
  returns the input unchanged (byte-equal — no added keys). There is no third
  mode.
- **Why a flag, not an `ragQuery` option (pin):** threading `store`/`storeContexts`
  through `ragQuery` would couple the single-store path to the qualification and
  risk A-F1 drift. The pure post-merge builder keeps single-store `ragQuery`
  provably byte-equal and keeps the builder independently testable.

### 5.3 The pure builder function

```ts
// src/main/retrieval.ts (NEW — PURE, no Electron, no I/O)

/** The per-store input reused from U-F1 (src/main/merge-store-results.ts): the
 *  store's registry name + its per-store RagResult. A store whose ragQuery
 *  threw is passed as { name, result: null } (D6 — skipped, contributes no
 *  storeContexts block). THE ARRAY IS IN CANONICAL (registry insertion) ORDER;
 *  the FIRST entry is the DEFAULT store. */
// import type { StoreResultInput } from './merge-store-results.js'
// (the shape: { name: string; result: RagResult | null | undefined })

/** Qualify a merged fan-out result. A-F1 — when `opts.qualified` is TRUE,
 *  stamps the per-item/per-entry `store` (D3) and builds `storeContexts` (D2)
 *  from the per-store results; when FALSE, returns `merged` UNCHANGED
 *  (byte-equal — preserves the Phase-1 A4 single-store contract). PURE +
 *  DETERMINISTIC. Never mutates `merged` or the per-store results. */
export function qualifyStoreResult(
  merged: RagResult,
  stores: Array<StoreResultInput>,
  opts: { qualified: boolean },
): RagResult
```

**`opts.qualified === false` (the A-F1 pass-through):**

- Returns `merged` BYTE-EQUAL and OBJECT-EQUAL — the exact same `RagResult`
  value (no added keys, no reordering). `stores` is NOT read (may be
  `null`/`undefined`/empty without error). `merged` is not mutated.
- This is the byte-equality contract that keeps the Phase-1 A4 single-store
  shape intact (A-F1).

**`opts.qualified === true` — the stamping behavior:**

1. **Items (`merged.results`):** each item is returned as a SPREAD COPY with
   `store` set to the producing store's registry name:
   `{ ...item, store }`. The producing store is the entry in `stores` whose
   `result.results` array CONTAINS that SAME item object (by reference
   identity — `mergeStoreResults` interleaves the per-store items BY REFERENCE,
   U-F1 §5.2, so reference identity is exact). The item ORDER is `merged.results`
   order, unchanged. The input items are NOT mutated (copies).
2. **Citations (`merged.citations`):** re-derived from the stamped items, NOT
   copied from `merged.citations`. Iterate `merged.results` in order; for each
   item, if its `(documentId, nodeId)` tuple has not been cited yet, push
   `{ documentId, nodeId, store: item.store }`. Order and dedup follow the
   interleaved first-appearance rule (the same semantics as `buildCitations`),
   now each entry carrying the FIRST-occurring item's store. This reproduces
   `merged.citations`'s ordering/dedup one-to-one (with `store` added).
3. **`storeContexts`:** one block per store in the `stores` array order, for
   every entry with a VALID (non-null) result:
   `{ store: <entry.name>, context: <entry.result.context>, markdown:
   <entry.result.markdown>, lineMap: <entry.result.lineMap> }`. A
   null/undefined-result store (failed — D6) contributes NO block. The blocks
   are placed in `stores` array order (canonical registry insertion order, D7);
   the DEFAULT store's block is FIRST (index 0).
4. **`trace`/`engine`/`ranked`/`context`/`markdown`/`lineMap`/`k`/`query`/
   `blockedBy`:** passed through UNCHANGED from `merged`. The qualified result's
   top-level `context`/`markdown`/`lineMap` remain the DEFAULT store's block
   (D2 — U-F1's merged block). `blockedBy` is absent (FLAT-only, D4).
5. **Non-mutation/purity:** the builder never mutates `merged` or any per-store
   result or item. All item copies are fresh objects. No I/O, no Electron, no
   randomness.

### 5.4 The `store` naming on the default store (and every store)

- **Every `store` value is a store's REGISTRY NAME** — the `stores` entry's
  `name` field, WITHOUT the `<store>: ` id prefix (D3: the prefix is a secondary
  signal only). For a non-default store `'wiki'` whose node ids are prefixed
  `wiki:<id>`, the `store` field is `'wiki'` (bare), NOT `'wiki:'`.
- **Default store naming (pin):** a fan-out always runs under a registry
  (A-F3 — `stores:"all"` with `dir == null` fails loud), so every entry's `name`
  is a non-empty registry name. The default store's `store` value is ITS
  REGISTRY NAME (e.g. `'main'`), NEVER `''`. The `''` legacy directory-less
  sentinel (the `RagQueryResult.store === ''` case) is UNREACHABLE in a
  qualified result because a fan-out requires the registry. The default store's
  ids are UNPREFIXED in the id fields (unchanged — U-MS4), but its `store` field
  is its registry name.

### 5.5 The `storeContexts` block content + the default block

- `storeContexts` carries ONE block per store with a VALID result, in the
  `stores` array (canonical registry insertion) order. The DEFAULT store's block
  is FIRST (index 0). Each block's `store` is the entry's registry name.
- Each block's `context`/`markdown`/`lineMap` are that store's OWN assembled
  block (from its per-store `ragQuery` result). The TOP-LEVEL `context`/
  `markdown`/`lineMap` on the `RagResult` remain the DEFAULT store's block —
  U-F2 does NOT move or copy the default-store block into a sibling position;
  the top-level block is unchanged by qualification.
- A store with a VALID result but an EMPTY `results` array still contributes a
  block (its assembled context/markdown/lineMap are the empty-store assembly —
  a valid, possibly-empty block). A store with a null/undefined result (failed —
  D6) contributes NO block.
- **`storeContexts` is absent (`undefined`) when NOT qualified** — the A-F1
  gate.

### 5.6 Fail-states (throws — the builder's documented throws)

- `merged` is `null`/`undefined` → throws
  `Error('qualifyStoreResult: merged result required')`.
- `opts` is `null`/`undefined` → throws
  `Error('qualifyStoreResult: opts required')`.
- `opts.qualified` is not a boolean → throws
  `Error('qualifyStoreResult: qualified must be a boolean')`.
- When `qualified` is TRUE:
  - `stores` is `null`/`undefined` → throws
    `Error('qualifyStoreResult: stores required when qualified')`.
  - `stores` is not an array → throws
    `Error('qualifyStoreResult: stores required when qualified')`.
  - A `stores` element is `null`/`undefined` → throws
    `Error('qualifyStoreResult: store entry required')`.
  - A `stores` element's `name` is not a non-empty string → throws
    `Error('qualifyStoreResult: store name must be a non-empty string')`.
  - A store element has a VALID (non-null) `result` but that result is missing
    ANY of `context`/`markdown`/`lineMap` → throws
    `Error('qualifyStoreResult: store result must have context, markdown and lineMap')`.
  - An item in `merged.results` is UNATTRIBUTABLE — its object reference is
    present in NO store's `result.results` array → throws
    `Error('qualifyStoreResult: unattributable result item')` (a malformed
    merged/input mismatch — `merged` was not produced from the given `stores`).
- When `qualified` is FALSE: `stores` is NOT validated (may be
  `null`/`undefined`/empty) — returns `merged` unchanged. No throw beyond the
  `merged`/`opts`/`qualified` checks above.

**Pinned non-throws (D6):** a store element whose `result` is `null`/`undefined`
(including the DEFAULT-first entry) contributes NO `storeContexts` block and is
NOT an error — it is SKIPPED. A store with a valid result but an empty `results`
array contributes a (possibly empty) block, NOT an error.

### 5.7 Determinism

- The same `merged` + same `stores` (array order) + same `{qualified}` → the
  same qualified output (twice). The item attribution (reference identity), the
  citation re-derivation (interleaved first-appearance), and the `storeContexts`
  block order (`stores` array order) are all deterministic over the input.
- The builder performs no randomness, no network egress, no I/O, and no
  mutating sort. `{qualified: false}` is trivially deterministic (returns the
  input unchanged).
- **Byte-equality determinism (A-F1):** the `false` path and the single-store
  path produce IDENTICAL bytes to today — the shape additions are gated away.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`qualified: false` pass-through:** `qualifyStoreResult(merged, null, {
   qualified: false })` → returns the exact `merged` value (object- and
   byte-equal) with NO `store` on items/entries and NO `storeContexts`.
2. **`qualified: true` item stamps:** two stores A (default, `[a1, a2]`) and B
   (`[b1]`), `merged.results` = `[a1, b1, a2]` → the qualified `results` =
   `[{...a1, store:'A'}, {...b1, store:'B'}, {...a2, store:'A'}]` (interleaved
   order preserved; each item's `store` = its producing store's registry name).
3. **`qualified: true` citations with store:** item `a1=(d1,n1)` from store A,
   item `b1=(d1,n1)` ALSO from store B → the qualified `citations` =
   `[{ documentId:'d1', nodeId:'n1', store:'A' }]` (deduped, FIRST-appearance in
   the interleaved order wins — the A-occurrence's store).
4. **`storeContexts` built:** two stores A and B, both valid → the qualified
   `storeContexts` = `[ { store:'A', context: A.context, markdown: A.markdown,
   lineMap: A.lineMap }, { store:'B', context: B.context, markdown: B.markdown,
   lineMap: B.lineMap } ]` (in the `stores` array order, default FIRST).
5. **A failed (null-result) store skipped:** stores A (default, valid), B
   (`result: null` — failed), C (valid, empty results) → the qualified
   `storeContexts` = `[ {store:'A', …}, {store:'C', …} ]` (B is SKIPPED — D6;
   C's block is included, possibly empty).
6. **The default store's `store` = its registry name:** the default entry's
   name `'main'` → its items/citations/blocks carry `store:'main'`, NEVER `''`.
7. **The store field carries the bare registry name (no `<name>:` prefix):**
   a non-default store `'wiki'` whose ids are `wiki:<id>` → its items carry
   `store:'wiki'` (bare), NOT `'wiki:'`.
8. **The top-level block stays the default store's block:** the qualified
   result's `context`/`markdown`/`lineMap` are `merged.context`/`markdown`/
   `lineMap` (unchanged); `storeContexts` carries the per-store blocks
   alongside.
9. **`trace`/`engine`/`ranked`/`k`/`query` passed through:** unchanged from
   `merged`. The `trace` is the merged flat trace with NO `store` field; `engine
   === 'local'`.
10. **`blockedBy` absent in the qualified result:** the qualified fan-out result
    carries NO `blockedBy` (FLAT-only, D4).
11. **Purity:** after qualification, `merged` and every per-store result/item is
    unchanged (the builder spread-copies items; the input arrays/objects are not
    mutated).
12. **Determinism:** the same `merged` + `stores` + `{qualified:true}` → the
    same qualified output (twice).
13. **Single store qualified:** `qualifyStoreResult(merged, [{name, result}], {
    qualified: true })` → every item/citation carries `store: <name>` and
    `storeContexts` = `[{ store: <name>, …block }]`.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`merged` null/undefined** → throws
   `Error('qualifyStoreResult: merged result required')`.
2. **`opts` null/undefined** → throws
   `Error('qualifyStoreResult: opts required')`.
3. **`opts.qualified` not a boolean** → throws
   `Error('qualifyStoreResult: qualified must be a boolean')`.
4. **`qualified: true` and `stores` null/undefined** → throws
   `Error('qualifyStoreResult: stores required when qualified')`.
5. **`qualified: true` and `stores` not an array** → throws
   `Error('qualifyStoreResult: stores required when qualified')`.
6. **`qualified: true` and a `stores` element null/undefined** → throws
   `Error('qualifyStoreResult: store entry required')`.
7. **`qualified: true` and a `stores` element's `name` not a non-empty string**
   → throws `Error('qualifyStoreResult: store name must be a non-empty string')`.
8. **`qualified: true` and a store's VALID result missing
   `context`/`markdown`/`lineMap`** → throws
   `Error('qualifyStoreResult: store result must have context, markdown and lineMap')`.
9. **`qualified: true` and a `merged.results` item attributable to NO store**
   (its reference is in no store's `result.results`) → throws
   `Error('qualifyStoreResult: unattributable result item')`.

**Pinned non-throws (D6 / A-F1):** `qualified: false` does NOT validate `stores`
(null/undefined/empty OK) and returns `merged` unchanged. A null/undefined
`result` store is SKIPPED (no block), never a throw. GATING: a single-store
`ragQuery` (no `qualifyStoreResult` call / `qualified: false`) produces NO
`store` fields and NO `storeContexts`.

### 5.10 The A-F1 byte-equality reconciliations (the tests this unit keeps green)

Because the shape additions are GATED to `stores:"all"` (`qualified: true`),
the existing SINGLE-STORE tests remain byte-equal without re-pinning — they
assert a result with NO `store` fields and NO `storeContexts`:

- **`tests/unit-ms2-store-wiring.test.ts:1400-1412`** — a single-store
  `rag.query` result (`handleRagTool(main.store, 'rag.query', { query:'anything' },
  main.engine, plan.directory)`) is asserted `toEqual({ query, results: [],
  engine:'local', citations: [], trace: {mode:'flat',engine:'local',topK:5,
  source:'local'}, ranked: [], context: [], markdown:'', lineMap:{ranges:[]},
  k: 5, store: DEFAULT_NAME })`. This stays GREEN — U-F2 adds neither a
  `storeContexts` key (absent ⇒ `toEqual` passes) nor per-item `store` fields
  (the results are empty) because this is a single-store (unqualified) call.
- **`tests/unit-ms2-store-wiring.test.ts:1458-1470`** — the same single-store
  byte-equal assertion on a `failed-missing` default store. GREEN (unqualified).
- **`tests/unit-x-rag-provenance-traversal.test.ts:435`** — `result.citations`
  asserted `toEqual([{ documentId:'doc1', nodeId:'ref1' }])` (NO `store` on the
  entry). This stays GREEN — single-store `ragQuery` never adds the `store`
  field to a citation entry (A-F1).
- **`tests/unit-x-rag-provenance-traversal.test.ts:436`** — `result.trace`
  asserted `toEqual({ mode:'flat', engine:'local', topK:5, source:'local' })`.
  GREEN — `FlatTrace` gains NO `store` field and single-store `ragQuery` returns
  today's flat trace unchanged.
- **`tests/unit-x-rag-provenance-traversal.test.ts:458`** —
  `result.citations` asserted `toEqual([{ documentId:'doc2', nodeId:'fact1' }])`
  (graph-mode single-store). GREEN — the citation entries carry no `store`.

**The A-F1 acceptance criterion:** the above existing assertions pass UNCHANGED
after U-F2 lands (no re-pin, no test-edit). If U-F2's shape additions were
unconditional, these assertions would FAIL (extra `store` on citation entries /
extra `storeContexts` key — the review's A-F1 CRITICAL). The gate is what keeps
them green.

### 5.11 Census / numeric claims

- **New exported function:** `qualifyStoreResult` (in `src/main/retrieval.ts`).
- **New exported type:** `StoreContextBlock` (in `src/main/retrieval.ts`).
- **Extended exported types (ADDITIVE OPTIONAL fields):** `RagResultItem`
  (`store?`), the `citations` element (`store?`), `GraphTraceEntry` (`store?`),
  `BlockedByEntry` (`store?`), `RagResult` (`storeContexts?`). `FlatTrace` gains
  NO field.
- **Files touched:** ONLY `src/main/retrieval.ts`. `src/shared/types.ts` and
  `src/main/mcp-server.ts` are UNTOUCHED (the IPC/MCP surface is U-F3's D5/A-F4).
- **New decision rows (added when the unit lands):** `docs/decisions.md` —
  **QUALIFY-RESULT**, **STORECONTEXTS-BLOCKS**, **STORE-FIELD-NAMING**; consumed
  **FLAT-ONLY-QUALIFICATION** (D4), **ENGINE-IS-LOCAL** (Unit X).
- **The gate:** ONE boolean `opts.qualified`. `true` stamps; `false` bytes-equal.
- **`storeContexts` cardinality:** one block per store with a VALID result, in
  the `stores` array order; default block first (index 0); failed (null-result)
  stores contribute none (D6).
- **`store` value:** the producing store's registry NAME, bare (no `<name>:`
  prefix). Default store → its registry name (e.g. `'main'`), NEVER `''`.
- **Citations count with the qualified result:** equal to `merged.citations`
  count (the same dedup), each carrying the first-occurring item's store.
- **Byte-equality surface:** the citation `store`, the item `store`, the
  `storeContexts` key — all PRESENT ONLY when `qualified` (A-F1).

### 5.12 Cross-references

- The proposal gate: `docs/specs/multi-store-fanout-review.md` — D2
  (`storeContexts`/default-store block), D3 (result qualification — per-item/
  per-entry `store`; `<name>:` prefix secondary), D4 (FLAT-only; `engine`
  `'local'`), D5 (schema + IPC — U-F3's), D6 (skip-failed), D7 (determinism),
  D8 (3-unit decomposition), A-F1 (CRITICAL — gate the shape additions to
  `stores:"all"` ONLY), A-F2 (optional `QueryAuditEntry.stores` — U-F3's audit),
  A-F3/A-F4 (U-F3's fan-out wiring + schema + IPC).
- U-F1: `docs/specs/unit-f1-merge-store-results.md` §5.1 (`StoreResultInput` —
  reused by `qualifyStoreResult`), §5.2 (the reference-interleave — the item
  reference-identity attribution basis), §5.5 (the merged result shape `merged`
  consumes; `blockedBy` absent; the default-store block — D2);
  §5.10 (the default store = the first entry, index 0).
- The per-store result shape + the shapes U-F2 extends:
  `docs/specs/unit-x-rag-provenance-traversal.md` §5.2 (`RagResult`,
  `RagResultItem`, `FlatTrace`, `GraphTraceEntry`, `BlockedByEntry`, `RagTrace`),
  §5.3 (`buildCitations` — the first-appearance dedup semantics the qualified
  citation re-derivation reuses), §5.6 (`ragQuery` — the single-store producer,
  UNCHANGED by A-F1), §5.2/§5.6 (`TraceUnavailable`/`engine` `'local'`).
- The byte-equality surface: `docs/specs/multi-store-fanout-review.md` A-F1 +
  the Phase-1 A4 contract (`docs/specs/unit-ms2-store-wiring.md` §5.9 F3 + the
  §4 byte-equality itemization). The tests kept green:
  `tests/unit-ms2-store-wiring.test.ts:1400,1458` and
  `tests/unit-x-rag-provenance-traversal.test.ts:435,436,458` (§5.10).
- The host types: `src/main/retrieval.ts` — `RagResult`, `RagResultItem`,
  `FlatTrace`, `GraphTraceEntry`, `BlockedByEntry`, `RagTrace`, `RagNode`,
  `LineNodeMap`, `RAG_ENGINE_ID` (`'local'`), `StoreContextBlock` (NEW).
- The merge module: `src/main/merge-store-results.ts` — `StoreResultInput`,
  `mergeStoreResults` (U-F1).
- Not-this-unit wiring (U-F3): `docs/specs/multi-store-fanout-review.md`
  D5/D8 + A-F2/A-F3/A-F4 — the `stores:"all"` schema on
  `rag.query`/`rag-stream`/the `rag-query` IPC `RagQueryPayload`, the flat-only
  guard (`rag.query: stores:"all" is only valid in flat mode`), the
  `store`/`stores` mutual exclusion, the legacy directory-less fail-loud
  (`dir == null`), the merged audit with `QueryAuditEntry.stores?: string[]`,
  the fan-out in `handleRagTool`, and the `RagQueryPayload.stores?` IPC field.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for the shape additions + the NEW
`qualifyStoreResult` in `src/main/retrieval.ts` from §5.8/§5.9, and asserts the
A-F1 reconciliations (§5.10) still hold. The red set (recorded in the
next-steps DONE row for this unit):

- **The `qualified: false` pass-through:** the happy-path state 1 (byte-equal,
  no `store`, no `storeContexts`) + the `stores`-is-null non-throw.
- **The `qualified: true` stamps:** the item stamps (2), the citations with
  store (3), the `storeContexts` build (4), the skipped failed store (5), the
  default `store` naming (6), the bare-name (no prefix) pin (7), the
  single-store qualified case (13).
- **The block/top-level passthrough:** the default-block stays (8), the
  `trace`/`engine`/`ranked`/`k`/`query` passthrough + the flat trace with no
  `store` (9), `blockedBy` absent (10).
- **Purity + determinism:** the happy-path states 11 and 12.
- **The fail-states:** 1–9 (§5.9).
- **The A-F1 reconciliations (§5.10):** the TestWriter asserts the EXISTING
  single-store assertions in `tests/unit-ms2-store-wiring.test.ts:1400,1458`
  and `tests/unit-x-rag-provenance-traversal.test.ts:435,436,458` remain GREEN
  (unqualified, no re-pin) — the acceptance criterion that the shape additions
  are gated.
