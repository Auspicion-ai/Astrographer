# Spec — Unit F3: `stores:"all"` Schema + Wiring (Cross-Store Fan-Out)

- **Status:** SPEC → **LANDED (2026-09-08, Unit U-F3 — the cross-store fan-out slice's
  THIRD + FINAL unit; execution order **U-F1** → **U-F2** → **U-F3**, landed after the
  U-F1/U-F2 cycles).** Proposal gate:
  `docs/specs/multi-store-fanout-review.md` (PROPOSAL GATE COMPLETE 2026-09-08 —
  four-agent gate: validity VALID-WITH-AMENDMENTS → critique UNSOUND-as-written →
  architecture PROCEED-WITH-AMENDMENTS, decisions D1–D8 → change-analysis
  PROCEED-WITH-AMENDMENTS, binding amendments A-F1..A-F4). Decisions consumed: **D4**
  (graph mode — `stores:"all"` is FLAT-mode only; `engine` stays `'local'`; the
  audit records ONE entry with `resultCount` = merged count + a
  `stores: string[]` field), **D5** (schema + IPC — `stores?: "all"` mutually
  exclusive with `store`, gained by `rag.query`/`rag-stream`/the `rag-query` IPC
  `RagQueryPayload` via the shared `handleRagTool` seam), **D6** (failed/empty
  stores — SKIP), **D7** (determinism — registry insertion order), **A-F2** (the
  optional `QueryAuditEntry.stores`), **A-F3** (the legacy directory-less
  `dir == null` fail-loud + the `store`/`stores` mutual-exclusion before any
  engine call), **A-F4** (the fan-out wired in BOTH the `rag.query` and
  `rag-stream` cases; `RagQueryPayload` gains `stores?: "all"`).
- **Execution-order dependency (pin):** U-F3 CONSUMES U-F1's
  `mergeStoreResults` (`src/main/merge-store-results.ts`) and U-F2's
  `qualifyStoreResult` (`src/main/retrieval.ts`). The TestWriter may write the
  red set for U-F3's wiring while those modules are absent, but the red run for
  the fan-out states that require the merged/qualified result cannot go GREEN
  until U-F1 and U-F2 land. Report the red set against the wiring's own
  guard/validation states (which are U-F1/U-F2-independent) and mark the merged
  result-dependent states as pending-on-U-F1/U-F2.
- **Scope:** the MCP/IPC wiring unit. It exposes `stores:"all"` on the input
  schemas of `rag.query`/`rag-stream` and on the `rag-query` IPC payload; wires
  the fan-out in `handleRagTool`'s `rag.query`/`rag-stream` cases; adds the
  flat-only guard + the `store`/`stores` mutual-exclusion + the `dir == null`
  fail-loud (A-F3); records the merged audit entry with `QueryAuditEntry.stores`
  (A-F2); and extends `handleRagQueryIpc` to forward `stores`. This unit does NOT
  implement the merge (U-F1) or the store-qualification shape/builder (U-F2), and
  does NOT touch the `RagResult`/`RagResultItem` shapes (U-F2's).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the schema + wiring changes in
  `src/main/mcp-server.ts` and `src/shared/types.ts` from §5.8/§5.9 before any
  implementation.

---

## 1. What the proposal asks

The cross-store fan-out slice (`stores:"all"` on `rag.query`/`rag-stream`/the
`rag-query` IPC) fans a query out across ALL configured stores and merges the
per-store results into one `RagResult`. U-F1 (the pure `mergeStoreResults`)
merges; U-F2 (the pure `qualifyStoreResult` + additive `store`/`storeContexts`
shapes) qualifies. **U-F3 wires it: the `stores:"all"` schema + the fan-out in
`handleRagTool`**, so the MCP tool and the UI IPC both reach the fan-out through
the SAME shared seam (MCP/UI equivalence — a BINDING constraint):

1. **The `stores` argument (D5):** `stores?: "all"` (a string enum) added to the
   inputSchema of `rag.query` and `rag-stream`, mutually exclusive with `store`
   (reject both — A-F3), and added to the `rag-query` IPC `RagQueryPayload`
   (`stores?: "all"` alongside `store?` — A-F4).
2. **The flat-only guard (D4):** `stores:"all"` + `mode: 'graph'` fails loud with
   `rag.query: stores:"all" is only valid in flat mode` (the same message for
   `rag-stream`, wrapped in its error chunk).
3. **The legacy directory-less fail-loud (A-F3):** `stores:"all"` with `dir ==
   null` (no registry) fails loud, BEFORE any engine call; the `store`/`stores`
   mutual-exclusion is also rejected before any engine call.
4. **The fan-out (A-F4):** for `stores:"all"`, iterate `dir.entries` in canonical
   (registry insertion) order, call each `entry.engine.query(query, opts)` with
   the same per-store `topK` (D1), collect the per-store `RagResult`s (a
   failed-corrupt/empty store → SKIP — D6 — passed as `{ name, result: null }`),
   then `mergeStoreResults(stores, { topK })` (U-F1) then
   `qualifyStoreResult(merged, stores, { qualified: true })` (U-F2).
5. **The audit (D4/A-F2):** ONE entry with `resultCount` = the merged count +
   an OPTIONAL `stores: string[]` field, present ONLY for `stores:"all"`.
6. **`rag-stream` (A-F4):** the SAME fan-out wiring, returning the degenerate
   stream with the merged+qualified `RagResult` as the `result` chunk.

## 2. Feasibility verdict

**Feasible — a thin wiring unit over U-F1's merge and U-F2's qualification; no
engine/foundation gap.**

- **The fan-out is a pure orchestration over existing surfaces.** `dir.entries`
  carries the per-store `engine`/`store` (U-MS2; `src/main/rag-store-directory.ts`
  `RagStoreEntry`); each entry's `engine.query(query, opts)` is the EXACT call the
  single-store path already makes (mcp-server.ts:223); the merge (U-F1) and the
  qualification (U-F2) are already-specified pure functions.
- **The guards are deterministic and cheap:** the mutual-exclusion, the
  `dir == null` fail-loud, and the flat-only guard are string/flag comparisons
  placed in the validation block before any engine call (A-F3).
- **No engine/foundation gap.** The engine stays `'local'` (D4). The fan-out is
  read-only (SINGLE-WRITER-STORE unaffected — each store keeps its own queue).
- **The execution-order dependency is a sequencing constraint, not a feasibility
  risk.** U-F3's wiring is only runnable-green against the merged/qualified
  states once U-F1/U-F2 are in; the guard/validation states are independent and
  green earlier.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `stores?: "all"` schema on `rag.query`/`rag-stream` + the `rag-query` IPC | Project-specific (D5/A-F4, `mcp-server.ts` + `shared/types.ts`) | Low cost; the fan-out entry surface. |
| The fan-out wiring in `handleRagTool` (both cases) | Project-specific (A-F4) | Low cost; the orchestration that calls U-F1's merge + U-F2's qualify. |
| The flat-only + mutual-exclusion + `dir == null` guards | Project-specific (D4/A-F3) | Low cost; deterministic fail-loud states, pinned messages. |
| The merged audit (`resultCount` = merged count + optional `stores`) | Project-specific (D4/A-F2, `query-audit.ts` + `mcp-server.ts`) | Low cost; the provenance-preserving one-entry record. |

No engine gap. The merge and qualification logic live in U-F1/U-F2 (NOT this
unit); U-F3 is their wiring seam. The `'incanter'`/`'zodiac'` source values
remain the Auspicion Suite's framing (F4); the current engine is `'local'`.

### 3a. Adversarial findings register

> This register is populated by the post-green adversarial pass (RCA-3) when the
> unit lands. It is EMPTY at the spec gate. The TestWriter derives the red set
> from §5.8/§5.9 ALONE; the adversarial pass records host findings here (fixed +
> regression-tested) and routes any package/upstream findings to
> `docs/defects.md` + `docs/HANDOFF.md` (never patched here).

_(Empty at the spec gate — populated by the adversarial pass when the unit
lands.)_

**Adversarial findings (2026-09-08, RCA-3 — no host defects; 2 informational):**

- **F-F3-1 (LOW, INFO):** `stores:"all"` necessarily discloses the full registry
  store-name set to the caller (the returned `storeContexts`/per-item `store`
  name every store; the audit `stores` lists the canonical names). This is the
  DESIGNED behavior of a caller-invoked cross-store query (it must enumerate to
  query), gated by the `rag` group. NO fix — recorded for explicitness.
- **F-F3-2 (LOW, latent):** a non-default store whose `engine.query` RETURNS a
  malformed `RagResult` (rather than throwing → `{name, result: null}`) fails
  U-F2's `qualifyStoreResult` validation and fails the WHOLE fan-out instead of
  D6-skipping. Unreachable with real `buildRagStoreDirectory` engines (they
  always build a well-formed block), and consistent with U-F2's fail-loud
  defensive state. NO fix — note for the maintainer: an "empty" store must return
  a well-formed `RagResult` (empty `results` + valid block), not a null-blocked
  one.

No PACKAGE/UPSTREAM findings — this unit consumes U-F1/U-F2 (already
adversarial-hardened).

## 4. Design decisions pinned by this spec

- **STORES-ALL-SCHEMA (new):** `stores?: "all"` is a string enum (one member,
  `'all'`). It is added to the inputSchema of `rag.query` and `rag-stream` and
  to the `rag-query` IPC `RagQueryPayload` (A-F4). It is mutually exclusive with
  `store` (A-F3).
- **FLAT-ONLY-GUARD (consumed from D4, made a guard):** `stores:"all"` with
  `mode: 'graph'` fails loud. The message is byte-pinned: `rag.query: stores:"all"
  is only valid in flat mode` (D4). The same message surfaces in the `rag-stream`
  error chunk.
- **REGISTRY-REQUIRED (new — A-F3):** `stores:"all"` with `dir == null` fails
  loud before any engine call (the legacy single-store sentinel has no registry
  to fan across). Byte-pinned message in §5.2.
- **MUTUAL-EXCLUSION (new — A-F3):** a request that carries BOTH `store` AND
  `stores` is rejected before any engine call. Byte-pinned message in §5.2.
- **FAN-OUT-WIRING (new):** for `stores:"all"`, `handleRagTool` iterates
  `dir.entries` in canonical (registry insertion) order (D7) and calls each
  entry's `engine.query(query, opts)` with the same per-store `topK` (D1); a
  failed-corrupt/empty store is SKIPPED (D6) and passed to the merge as
  `{ name, result: null }`; then `mergeStoreResults(stores, { topK })` (U-F1) and
  `qualifyStoreResult(merged, stores, { qualified: true })` (U-F2) produce the
  returned `RagResult`.
- **MERGED-AUDIT (new — D4/A-F2):** `QueryAuditEntry` gains an OPTIONAL
  `stores?: string[]` present ONLY for `stores:"all"`; the merged audit entry's
  `resultCount` = the merged result count (post-merger, unchanged by
  qualification).
- **ENGINE-IS-LOCAL (consumed):** the merged `engine` stays `'local'`
  (`RAG_ENGINE_ID`); U-F3 does not change it.

## 5. The exhaustive contract

### 5.1 The `stores?: "all"` argument + the inputSchema changes

The inputSchema for `rag.query` and `rag-stream` gains one ADDITIVE field,
`stores`, declared as a string enum with the single member `'all'`, placed
ALONGSIDE (not replacing) the existing optional `store`:

```ts
// src/main/mcp-server.ts — the `rag.query` (line ~1381) and `rag-stream`
// (line ~1389) inputSchema entries, BEFORE this unit:
//   stores: ABSENT
// AFTER this unit, BOTH entries gain:
stores: z.enum(['all']).optional()
```

- The `store` field (`z.string().optional()`) stays; `stores` is ADDITIVE.
- `stores` is OPTIONAL — its omission keeps today's single-store path byte-equal.
- The single member `'all'` means any other value fails at the zod schema layer
  (a non-`'all'` string is rejected by the schema). For a DIRECT caller of
  `handleRagTool` (which takes `args` untyped), a `stores` value that is the
  string `'all'` triggers the fan-out; any OTHER non-`undefined` `stores` value
  fails loud with the §5.2 message (a defensive pin mirroring the schema).

**The `RagQueryPayload` change (A-F4), in `src/shared/types.ts`:**

```ts
// src/shared/types.ts — RagQueryPayload BEFORE:
//   { query: string; topK?: number; store?: string }
// AFTER — gains ONE additive OPTIONAL field (alongside the existing `store?`):
export interface RagQueryPayload {
  query: string
  topK?: number
  /** U-MS5 — the optional store selector (kept). */
  store?: string
  /** U-F3 — `stores: 'all'` runs the fan-out. Mutually exclusive with `store`. */
  stores?: 'all'
}
```

**`QueryAuditEntry` (A-F2), in `src/main/query-audit.ts`:**

```ts
// src/main/query-audit.ts — QueryAuditEntry BEFORE:
//   { query, filters, mode, resultCount, timestamp, requester }
// AFTER — gains ONE additive OPTIONAL field (A-F2), present ONLY for `stores:"all"`:
export interface QueryAuditEntry {
  query: string
  filters: RagQueryFilters | null
  mode: 'flat' | 'graph'
  resultCount: number
  timestamp: string
  requester: string
  /** A-F2 — present ONLY for a `stores:"all"` fan-out; ABSENT (undefined) in a
   *  single-store audit entry (the existing audit entries stay byte-equal). */
  stores?: string[]
}
```

### 5.2 The validation-order + the guard wiring (A-F3, D4)

In BOTH the `rag.query` and `rag-stream` cases of `handleRagTool`, the following
new `stores:"all"`-specific guards run in `handleRagTool`'s per-tool validation
blocks. They run BEFORE the engine fan-out call (A-F3: "before any engine
call"), i.e. BEFORE the per-store `entry.engine.query(...)` invocations and
BEFORE `resolveStoreArg`'s result is used for a store query. In the `rag-stream`
case they sit INSIDE the existing `try` (so every guard surfaces as the spec
§5.8-mandated `[{ type: 'error', error: <message> }]` chunk, not an MCP tool
error — matching the existing stream validation pattern at mcp-server.ts:259).

**Guard 1 — mutual exclusion (`store` AND `stores` both present).** When
`args.store !== undefined` AND `args.stores !== undefined`, throws:

```
Error('rag.query: store and stores are mutually exclusive')
```

This is the FIRST `stores:"all"` guard evaluated (A-F3), before the flat-only
guard and before any engine call. The literal `rag.query:` prefix matches the
existing stream-internal error convention (stream validation throws carry the
`rag.query:` literal at mcp-server.ts:261-278).

**Guard 2 — the `stores` value.** When `args.stores !== undefined` and it is not
the string `'all'`, throws (the defensive mirror of the zod enum; the MCP schema
rejects a non-`'all'` value first, a direct caller reaches this):

```
Error('rag.query: stores must be "all"')
```

**Guard 3 — the legacy directory-less fail-loud (A-F3).** When `stores === 'all'`
AND `dir` is `null`/`undefined` (the legacy single-store sentinel — no registry),
throws BEFORE any engine call:

```
Error('rag.query: stores:"all" requires a configured store registry')
```

**Guard 4 — the flat-only guard (D4).** When `stores === 'all'` AND
`mode === 'graph'`, throws (byte-pinned by D4):

```
Error('rag.query: stores:"all" is only valid in flat mode')
```

When `stores === 'all'` and `mode` is omitted or `'flat'`, the guard passes (the
fan-out always runs in flat mode). `mode: 'graph'` WITHOUT `stores:"all"` is
unchanged (a valid single-store graph query).

**Guard ordering (pin, for deterministic tests):** the new guards evaluate in
this order: (1) mutual-exclusion → (2) `stores` value → (3) `dir == null` → (4)
flat-only. They interleave with the EXISTING validation as follows: the existing
`query`/`topK`/`mode`-valid checks run in their current position (mcp-server.ts
196-214 for `rag.query`; 260-278 for `rag-stream`), and the `stores:"all"`
guards evaluate after the field-type checks that they depend on (`mode` must be a
valid `'flat'|'graph'` before the flat-only guard compares it to `'graph'`). Any
of these guards throwing prevents the engine fan-out from running (no side
effect — the fan-out is read-only anyway).

### 5.3 The fan-out flow in `handleRagTool` (the `rag.query` case)

When `stores === 'all'` AND the §5.2 guards pass (flat mode, `dir != null`), the
`rag.query` case runs the fan-out INSTEAD of the single-store engine call. The
exact wiring:

1. **Build the per-store input.** Iterate `dir.entries` in canonical (registry
   INSERTION) order (D7 — the `Map` key order of `RagStoreDirectory.entries`).
   For each `[name, entry]` — the `[name, entry]` map key `name` EQUALS the
   entry's `name` field (`buildRagStoreDirectory` keys the map by the registry
   name, so the map key IS used as the per-store `name`) — attempt the entry's
   engine query:
   - Call `entry.engine.query(query, opts)` where `opts` is the SAME validated
     options object the single-store path builds (mcp-server.ts:223-230),
     with `k: topK` (the SAME per-store topK — D1), `mode: 'flat'` (the
     flat-only guard already forced flat), `maxHops`, `expand`,
     `maxParentContext`, `filters` — all forwarded unchanged from the validated
     args. The query is ALWAYS attempted for every entry (a `corrupt`/`missing`
     entry's engine serves EMPTY per U-MS2 (the corrupt/missing empty-store
     contract), so its result is naturally empty; a
     throw is caught below).
   - On SUCCESS: push `{ name, result: <the engine's RagResult> }`.
   - On THROW (a failed-corrupt store's engine throwing despite the empty-store
     contract): SKIP — catch and push `{ name, result: null }` (D6). The fan-out
     does NOT fail loud on a non-default failed store.
2. **Merge.** Build the `stores` array for `mergeStoreResults` by REORDERING the
   step-1 input so the DEFAULT entry is FIRST (index 0), then the OTHER entries
   in their canonical insertion order. (U-F1 §5.10: index 0 is the default store
   — the top-level `ranked`/`context`/`markdown`/`lineMap`/`k` block is the
   default store's. If `dir.defaultName` is not the first inserted entry, the
   fan-out moves it to index 0.) `topK` is the same per-store topK. The
   default-store-first order is WHAT `mergeStoreResults` consumes; the AUDIT
   `stores` array (§5.4) is the canonical INSERTION order (they DIFFER when the
   default is not first).
   - **The default-store failure pin:** if the DEFAULT entry's `engine.query`
     throws, step 1 pushes `{ name: <default>, result: null }` and step 2's
     `mergeStoreResults` throws `Error('mergeStoreResults: default store result
     required')` (U-F1 §5.4 defensive fail-state). U-F3 does NOT special-case
     the default store's failure — the U-F1 fail-state surfaces through the
     wiring (unreachable in practice: the default store is the main, always
     loaded store).
3. **Qualify.** `const qualified = qualifyStoreResult(merged, stores, {
   qualified: true })` (U-F2). The same `stores` array (canonical order, default
   first) is passed; `{ qualified: true }` stamps the per-item/per-entry `store`
   + builds `storeContexts` (D2/D3/A-F1). A store with a null result contributes
   NO `storeContexts` block (D6).
4. **Stamp + return.** Return `{ ...qualified, store: ref?.name ?? '' }` — the
   existing U-MS2 F3 additive `store` stamp applies UNCHANGED. For a `stores:"all"`
   fan-out, `args.store` is absent (mutual-exclusion), so a non-null `dir` makes
   `resolveStoreArg` resolve the DEFAULT entry (S1); `ref.name` is the default
   store's registry name (e.g. `'main'`), NEVER `''` (a fan-out always runs under
   a registry — A-F3). This keeps the `RagQueryResult.store` required field
   populated identically on the MCP and IPC surfaces (MCP/UI equivalence).

**The `merged`/`qualified` result shape (returned):** the U-F1 merged `RagResult`
(U-F1 §5.5) then U-F2-qualified (U-F2 §5.1): `results` (interleaved items, each
with `store?`), `citations` (deduped, each with `store?`), `engine: 'local'`,
`trace` (the merged flat trace, NO store), NO `blockedBy` (flat-only), the
default store's `ranked`/`context`/`markdown`/`lineMap`/`k` block, and the
additive `storeContexts` (D2). The returned object additionally carries the
top-level `store` stamp (step 4).

### 5.4 The audit recording (D4/A-F2)

When `stores === 'all'` AND `auditLog` is non-null, the `rag.query` case records
ONE entry:

```ts
auditLog.record({
  query,
  filters: (args.filters as RagQueryFilters) ?? null,
  mode: 'flat',                    // the flat-only guard forced flat
  resultCount: merged.results.length,   // the MERGED count (post-merge; qualify does not change length)
  timestamp: new Date().toISOString(),
  requester: 'mcp',
  stores: <the canonical-order store names>,   // present ONLY for stores:"all"
})
```

- **`resultCount` = the MERGED count** (`merged.results.length`), not the sum of
  per-store counts and not the qualified count (qualification does not change the
  item count — U-F2 §5.3 items are spread-copies, order/count unchanged). D4.
- **`stores` is present ONLY for `stores:"all"`** (A-F2). Its array is the store
  NAMES the fan-out queried, in canonical (registry insertion) order — the
  `dir.entries` keys in iteration order (D7). It names the queried SCOPE
  (including a failed store — the fan-out DID address it before D6-skipping).
- **`mode` is `'flat'`** for a fan-out (the flat-only guard forced flat).
- When `auditLog` is null/absent, recording is SKIPPED (no throw) — unchanged
  (Unit X §5.7).
- A SINGLE-store query records the existing entry shape `{ query, filters, mode,
  resultCount, timestamp, requester }` with NO `stores` key (A-F2 — the existing
  audit tests construct entries without it and stay green).

The `get_query_audit_log` tool (`handleRagTool` `case 'get_query_audit_log',
mcp-server.ts:305-307) returns `{ entries: auditLog.list() }` — the `stores`
field, when present, flows through `list()` verbatim (a field on the entry). `list()`
returns NEWEST-first entries (Unit X §5.7), unchanged.

### 5.5 The `rag-stream` case (A-F4)

The `rag-stream` case runs the SAME fan-out wiring when `stores === 'all'` and
the §5.2 guards pass. All four guards are INSIDE the existing try
(mcp-server.ts:259), so each guard throw becomes the error chunk:

```
[{ type: 'error', error: <the §5.2 message> }]
```

On SUCCESS the stream returns the degenerate sequence with the MERGED + QUALIFIED
result as the `result` chunk:

```
[{ type: 'result', result: qualified }, { type: 'done' }]
```

- `result` is the merged+qualified `RagResult` (U-F1 §5.5 + U-F2 §5.1). The
  `rag-stream` path does NOT add the top-level `store` stamp (the existing stream
  returns the bare `result` at mcp-server.ts:300 — the stream surface returns the
  engine result without the U-MS2 F3 additive field). Pin: the stream's fan-out
  `result` chunk carries NO top-level `store` field; store attribution is the
  per-item/per-entry `store` + `storeContexts` (U-F2).
- The audit recording inside the `rag-stream` try is IDENTICAL to §5.4 (one
  entry, merged `resultCount`, optional `stores`) when `stores === 'all'` and
  `auditLog` is non-null.
- The default-store-failure fail-state (U-F1 §5.4) thrown by the merge inside the
  try surfaces as `[{ type: 'error', error: 'mergeStoreResults: default store
  result required' }]`.

### 5.6 The `rag-query` IPC (A-F4, MCP/UI equivalence)

`RagQueryPayload.stores?: 'all'` (added by §5.1) is forwarded through
`handleRagQueryIpc` into the shared `handleRagTool` so the UI path is EQUIVALENT
to the MCP `rag.query` tool (MCP/UI equivalence — a BINDING constraint):

```ts
// src/main/mcp-server.ts — handleRagQueryIpc BEFORE:
//   payload: { query?, topK?, store? }
// AFTER — the signature widens to forward `stores`:
export async function handleRagQueryIpc(
  engine: RetrievalEngine | null,
  store: RagStore | null,
  payload: { query?: unknown; topK?: unknown; store?: unknown; stores?: unknown },
  dir?: RagStoreDirectory | null,
  auditLog?: QueryAuditLog | null,
): Promise<unknown> {
  return handleRagTool(store, 'rag.query', {
    query: payload?.query,
    topK: payload?.topK,
    store: payload?.store,
    stores: payload?.stores,   // ADDITIVE — forwarded unchanged (A-F4)
  }, engine, dir, auditLog)
}
```

- The forwarding is mechanical — `handleRagQueryIpc` does NOT evaluate the fan-out
  itself; it forwards `stores` into the shared `handleRagTool` `'rag.query'` case,
  which runs the §5.2 guards + the §5.3 fan-out.
- Because `handleRagQueryIpc` always passes `name = 'rag.query'`, all §5.2 guard
  messages keep the literal `rag.query:` prefix on the IPC surface (the IPC
  rejects identically to the MCP tool).
- A `stores` value forwarded from a UI caller passes through the SAME §5.2
  mutual-exclusion + `dir == null` + flat-only guards. `handleRagQueryIpc` with a
  `stores: 'all'` payload and a null `dir` fails loud (`rag.query: stores:"all"
  requires a configured store registry`) — the IPC cannot reach the fan-out
  without a registry (A-F3).
- The IPC result (a `RagQueryResult`, the JSON-safe transport) carries the merged
  result fields + the top-level `store` stamp (the default entry's registry name
  for a fan-out — §5.3 step 4) + `storeContexts` + per-item/per-entry `store`
  (U-F2), so both surfaces are byte-equivalent.

### 5.7 The `handleRagTool` signature — no change

`handleRagTool`'s signature is UNCHANGED by U-F3:

```ts
export async function handleRagTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  engine?: RetrievalEngine | null,
  dir?: RagStoreDirectory | null,
  auditLog?: QueryAuditLog | null,
): Promise<unknown>
```

The `stores` argument arrives inside `args.stores`, read by the §5.2 guards and
the §5.3 fan-out. No new parameter is introduced.

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **`stores:"all"` + flat + a registry, two stores, equal lengths:** store A
   (default) `[a1, a2]` + store B `[b1, b2]` → returned `results` =
   `[a1, b1, a2, b2]` (U-F1 interleave), each item with its producing store's
   bare registry `store` name (U-F2), `storeContexts` = one block per store
   (default first), `engine === 'local'`, no `blockedBy`, top-level `store` =
   the default registry name (`ref.name`, non-`''`).
2. **`stores:"all"` + a failed non-default store (D6):** store B's `engine.query`
   throws → the fan-out SKIPS B (`{ name, result: null }`), the merged `results`
   contain only A's + C's items, `storeContexts` has no B block, NO throw.
3. **`stores:"all"` + an empty non-default store (D6):** store B returns an empty
   `results` → contributes zero items (U-F1 §5.4), but still contributes a
   (possibly empty) `storeContexts` block (U-F2 §5.5).
4. **`stores:"all"` + a single store in the registry:** only the default entry →
   the merged `results` = that store's items, `storeContexts` = one block,
   top-level `store` = its registry name.
5. **The audit for `stores:"all"`:** `get_query_audit_log` returns ONE entry
   with `resultCount` = `merged.results.length`, `stores` = the canonical-order
   store names, `mode: 'flat'`, present only for the fan-out.
6. **The `rag-stream` fan-out:** `[{ type: 'result', result: <merged+qualified> },
   { type: 'done' }]` — the `result` chunk is the merged+qualified `RagResult`
   with NO top-level `store` field.
7. **The `rag-query` IPC forward:** `handleRagQueryIpc(..., { query, topK,
   stores: 'all' }, dir, auditLog)` → the same merged+qualified result + the
   merged audit entry as the MCP `rag.query` tool (equivalence).
8. **A single-store query is unchanged (A-F1/A-F4):** no `stores` → byte-equal to
   today's result (no per-item/per-entry `store`, no `storeContexts`, no
   `stores` audit key) — the §5.1 additive fields are absent.
9. **`rag.query` omitted `stores` with `store` present:** the single-store
   selector path is unchanged — the fan-out does not run.
10. **Determinism (D7):** two identical `stores:"all"` fan-out calls over the
    same registry → the same merged+qualified result (twice) + the same audit
    entry. The iteration is canonical (registry insertion) order, never a sort.

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`store` AND `stores` both present (A-F3)** → throws
   `Error('rag.query: store and stores are mutually exclusive')` (in `rag.query`);
   in `rag-stream` the error chunk `[{ type: 'error', error: 'rag.query: store and
   stores are mutually exclusive' }]`.
2. **`stores` present and not `'all'`** → throws
   `Error('rag.query: stores must be "all"')` (the zod schema rejects a
   non-`'all'` value at the MCP layer first; this guard covers direct callers).
   Same error chunk for `rag-stream`.
3. **`stores:"all"` with `dir == null` / undefined (A-F3)** → throws
   `Error('rag.query: stores:"all" requires a configured store registry')` (the
   legacy single-store sentinel). Same error chunk for `rag-stream`. This fires
   BEFORE any engine call.
4. **`stores:"all"` + `mode: 'graph'` (D4)** → throws
   `Error('rag.query: stores:"all" is only valid in flat mode')` (the byte-pinned
   D4 message). Same error chunk for `rag-stream`.
5. **The default store's `engine.query` throws (a failed default store)** → the
   merge throws `Error('mergeStoreResults: default store result required')` (U-F1
   §5.4 defensive — surfaced through the fan-out). In `rag.query` this is the
   thrown error; in `rag-stream` the error chunk `[{ type: 'error', error:
   'mergeStoreResults: default store result required' }]`.
6. **`rag-query` IPC with `stores: 'all'` and a null `dir`** → rejects with
   `rag.query: stores:"all" requires a configured store registry` (A-F3 — the IPC
   rejects identically to the MCP tool).
7. **`rag-query` IPC with `stores: 'all'` and `store` both set** → rejects with
   `rag.query: store and stores are mutually exclusive`.

**Pinned non-throws:** a NON-default failed store (D6) is SKIPPED — the fan-out
does NOT fail loud for it; a non-default empty store contributes zero items, NOT
an error. `auditLog` null/absent → recording skipped (no throw). No page/UI
surface is affected (this is MCP/IPC wiring only) — there are no renderer
fail-states from this unit.

### 5.10 Census / numeric claims

- **Files touched:** `src/main/mcp-server.ts` (the `rag.query`/`rag-stream`
  inputSchemas + the four §5.2 guards + the §5.3 fan-out + the §5.4 audit + the
  §5.6 `handleRagQueryIpc` forward), `src/shared/types.ts`
  (`RagQueryPayload.stores?`), `src/main/query-audit.ts` (`QueryAuditEntry.stores?`).
- **Existing files UNTOUCHED:** `src/main/merge-store-results.ts` (U-F1, only
  consumed), `src/main/retrieval.ts` (U-F2, only consumed), the `RagResult`/
  `RagResultItem` shapes (U-F2's), `src/main/rag-store-directory.ts` (read-only
  consumer of `dir.entries`/`dir.defaultName`).
- **New public surface:** `RagQueryPayload.stores?: 'all'`,
  `QueryAuditEntry.stores?: string[]`, the inputSchema `stores` field on
  `rag.query`/`rag-stream`.
- **New guard/error messages (byte-pinned):** `rag.query: store and stores are
  mutually exclusive`; `rag.query: stores must be "all"`; `rag.query: stores:"all"
  requires a configured store registry`; `rag.query: stores:"all" is only valid in
  flat mode` (D4).
- **The fan-out call count:** N per-store `engine.query` calls, where N =
  `dir.entries.size` (canonical order). A failed/empty store still runs (its query
  is attempted) but contributes nothing (D6).
- **The merged result count bound:** ≤ N×topK (D1); the audit `resultCount` =
  `merged.results.length`.
- **The audit `stores` array:** the canonical-order registry names of the N
  queried stores (D7).
- **The top-level `store` stamp on a fan-out `rag.query` result:** the DEFAULT
  entry's registry name (`ref.name`), NEVER `''` (U-F2 §5.4 STORE-FIELD-NAMING
  pin, consistent with A-F3).

### 5.11 Cross-references

- The proposal gate: `docs/specs/multi-store-fanout-review.md` — D1 (per-store
  topK interleave — the merge policy U-F3 feeds), D4 (flat-only + `engine`
  `'local'` + the merged audit `resultCount`/`stores`), D5 (schema + IPC),
  D6 (skip-failed/empty), D7 (determinism — registry insertion order), D8 (3-unit
  decomposition), A-F1 (gating the result-shape additions to `stores:"all"`),
  A-F2 (optional `QueryAuditEntry.stores`), A-F3 (the `dir == null` fail-loud +
  the mutual-exclusion before any engine call), A-F4 (the fan-out in BOTH cases +
  `RagQueryPayload.stores?`).
- U-F1 (CONSUMED): `docs/specs/unit-f1-merge-store-results.md` §5.1
  (`StoreResultInput` + `mergeStoreResults(stores, { topK })`), §5.2 (the
  reference-interleave — the item-attribution basis), §5.4 (skip-failed/empty +
  the default-store-required defensive fail-state),
  §5.5 (the merged `RagResult` shape), §5.11 (the default store = the first
  entry, index 0).
- U-F2 (CONSUMED): `docs/specs/unit-f2-result-qualification.md` §5.1 (the
  additive `store`/`storeContexts` shapes), §5.3 (`qualifyStoreResult`), §5.4
  (STORE-FIELD-NAMING — the default's `store` is its registry name, never `''`),
  §5.5 (`storeContexts` cardinality + default block).
- The host wiring seam: `src/main/mcp-server.ts` —
  `handleRagTool` (`rag.query`/`rag-stream` cases, mcp-server.ts:191-304), the
  audit recording (mcp-server.ts:233-242, 290-298), `handleRagQueryIpc`
  (mcp-server.ts:362-374), the `rag.query`/`rag-stream` inputSchemas
  (mcp-server.ts:1381, 1389), `get_query_audit_log` (mcp-server.ts:305-307).
- The store directory: `src/main/rag-store-directory.ts` — `RagStoreDirectory`
  (`entries: ReadonlyMap<string, RagStoreEntry>`, `defaultName`), `RagStoreEntry`
  (`name`/`store`/`engine`/`corrupt`/`missing`), `resolveStoreArg` (the §5.3
  `ref` resolution).
- The IPC types: `src/shared/types.ts` — `RagQueryPayload` (§5.1),
  `RagQueryResult` (its `store` field carries the default registry name for a
  fan-out — MCP/UI equivalence).
- The audit types: `src/main/query-audit.ts` — `QueryAuditEntry` (A-F2),
  `QueryAuditLog` (`record`/`list`/`clear`, Unit X §5.7 ring-buffer semantics).
- The per-store result producer: `docs/specs/unit-x-rag-provenance-traversal.md`
  §5.6 (`ragQuery`) — the single-store producer U-F3 fans out; §5.7 (the audit
  log). The engine's `query` method (the per-store `entry.engine.query` call —
  mcp-server.ts:223).
- Byte-equality surface preserved for single-store: `docs/specs/unit-ms2-store-wiring.md`
  (the §4/§5 byte-equality itemizations; the U-MS2 F3 `store` stamp
  reconciliation at §5.9).
- **NO page-design impact:** this unit is MCP/IPC wiring only — no renderer, no
  provident graph, no DOM. `docs/skills/designing-pages.md` and its test-use-case
  coverage matrix + demo-page index are NOT updated by this unit (a deliberate
  non-change; the fan-out touches no page).
- Decisions: `docs/decisions.md` rows to add when this unit lands:
  **STORES-ALL-SCHEMA**, **REGISTRY-REQUIRED**, **MUTUAL-EXCLUSION**,
  **FAN-OUT-WIRING**, **MERGED-AUDIT**; consumed **FLAT-ONLY-GUARD** (D4),
  **ENGINE-IS-LOCAL** (Unit X).

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set for the schema + wiring changes in
`src/main/mcp-server.ts` and `src/shared/types.ts` from §5.8/§5.9, and confirms
the U-F1 (merge) + U-F2 (qualify) consumption by asserting the merged/qualified
result shape. The red set (recorded in the next-steps DONE row for this unit):

- **The schema:** the `rag.query`/`rag-stream` inputSchema `stores` field (§5.1)
  + the `RagQueryPayload.stores?` + the `QueryAuditEntry.stores?` type additions.
- **The guards:** the mutual-exclusion (§5.9.1), the `stores must be "all"` (§5.9.2),
  the `dir == null` fail-loud (§5.9.3), the flat-only guard (§5.9.4) — each in
  both the `rag.query` throw form and the `rag-stream` error-chunk form.
- **The fan-out states:** the two-store equal-length interleave (§5.8.1), the
  skipping of a failed non-default store (§5.8.2), the empty store (§5.8.3), the
  single-store registry (§5.8.4), the default-store-failure fail-state (§5.9.5).
- **The audit states:** the merged `resultCount` + the `stores` array for a fan-out
  (§5.8.5) + the absences for single-store (§5.8.8).
- **The `rag-stream` fan-out:** the merged+qualified `result` chunk with NO
  top-level `store` (§5.8.6); the guard error chunks.
- **The `rag-query` IPC forward:** the equivalence (§5.8.7) + the IPC fail-states
  (§5.9.6-7).
- **The single-store byte-equality reconciliation (A-F1/A-F4):** a `stores`-omitted
  query is byte-equal to today (no per-item store, no `storeContexts`, no `stores`
  audit key) — the acceptance criterion that the fan-out is GATED to
  `stores:"all"`.

**Execution-order note:** the fan-out-state reds that assert the merged/qualified
result shape (§5.8.1-7, §5.9.5) depend on U-F1's `mergeStoreResults` + U-F2's
`qualifyStoreResult` being in place. The TestWriter reports these as
pending-on-U-F1/U-F2 if they cannot be run at the U-F3 red pass; the guard reds
(§5.9.1-4, §5.9.6-7) are independently runnable.
