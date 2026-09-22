# Review — Multi-store Phase 2: Cross-Store Fan-Out (`stores: "all"`)

- **Status:** PROPOSAL GATE COMPLETE (2026-09-08). Four-agent gate: validity
  **VALID-WITH-AMENDMENTS** → critique **UNSOUND-as-written** → architecture
  **PROCEED-WITH-AMENDMENTS** (decisions D1–D8) → change-analysis
  **PROCEED-WITH-AMENDMENTS** (binding amendments A-F1..A-F4). **AWAITING the
  user's go-ahead before the spec gate.**
- **Proposal:** add a `stores: "all"` mode to the `rag.query` MCP tool (and the
  `rag-query` IPC) that fans the query out across ALL configured stores and
  merges the results into one `RagResult`. The Phase-1 `<name>:` id prefixing
  makes every id globally addressable (the prerequisite, B3 closed).
- **Revisit condition (met):** the "query run + main together" dogfooding use
  case is wanted AND the merge policy passes its own proposal gate.

## The four-agent gate

| Agent | Verdict | Key points |
| --- | --- | --- |
| Validity | **VALID-WITH-AMENDMENTS** | Feasible on existing primitives (per-store engines in `RagStoreDirectory.entries`; `ragQuery`/`retrieve` per-store). No engine gap. Must-fix: merge policy (score-merge unsound), `context`/`lineMap` semantics, store-qualified result ids. |
| Critique | **UNSOUND-as-written** | B1 [CRITICAL] merge policy undefined + scores incomparable; B2 [CRITICAL] context/lineMap/markdown single-store; B3 [HIGH] single-valued `store` field; B4 [HIGH] graph mode/citations/trace/audit single-store; B5 [HIGH] IPC surface unspecified; B6 [MEDIUM] failed/empty stores + mixed embedders; B7 [MEDIUM] determinism; B8 [MEDIUM] not unit-sized. |
| Architecture | **PROCEED-WITH-AMENDMENTS** | Resolved D1–D8 (below); 3-unit decomposition. |
| Change-analysis | **PROCEED-WITH-AMENDMENTS** | D1–D8 sound; two NEW findings → binding amendments A-F1..A-F4. |

## Resolved design decisions (architecture D1–D8)

- **D1 — Merge policy:** per-store top-k interleave, rank-based, NEVER
  score-compare. `topK` is per-store (merged ≤ N×topK). Keep the per-store
  `score > 0` floor. Mixed embedders are SAFE (rank-merge is embedder-agnostic).
- **D2 — `context`/`markdown`/`lineMap`:** per-store blocks via an additive
  `storeContexts: Array<{store, context, markdown, lineMap}>`; the top-level
  fields stay the default store's block.
- **D3 — Result qualification:** per-item `store` field on `RagResultItem` +
  each `citations`/`blockedBy`/`trace` entry; the `<name>:` prefix is a secondary
  signal only (the default store's ids are unprefixed).
- **D4 — Graph mode:** `stores:"all"` is FLAT-mode only (fail-loud
  `rag.query: stores:"all" is only valid in flat mode`); `engine` stays
  `'local'`; audit records one entry with `resultCount` = merged count + a
  `stores: string[]` field.
- **D5 — Schema + IPC:** `stores?: "all"` (string enum), mutually exclusive with
  `store` (reject both); gained by `rag.query`, `rag-stream`, and the `rag-query`
  IPC `RagQueryPayload` (MCP/UI equivalence via the shared `handleRagTool` seam).
- **D6 — Failed/empty stores:** SKIP (contribute zero results), don't fail loud
  (D7 per-store fail-disabled).
- **D7 — Determinism:** registry insertion order (the `Map` key order in
  `RagStoreDirectory.entries`).
- **D8 — Scope:** 3 units — U-F1 pure `mergeStoreResults`; U-F2 result
  qualification + `storeContexts`; U-F3 `stores:"all"` schema + wiring.

## Binding amendments (change-analysis A-F1..A-F4)

- **A-F1 (critical):** the byte-equality claim is OVERSTATED. `storeContexts` and
  the per-item/per-entry `store` add keys to every result object — NOT byte-equal
  for single-store. **Gate `storeContexts` + the per-item/per-entry `store` to
  `stores:"all"` mode ONLY**; single-store keeps the current shape byte-equal
  (preserving the Phase-1 A4 contract). If unconditional, enumerate it as a
  deliberate breaking change and update the affected tests in the same unit
  (`unit-ms2-store-wiring.test.ts:1400,1458`; `unit-x-rag-provenance-traversal.test.ts:435,436,458`).
- **A-F2:** `QueryAuditEntry.stores` must be OPTIONAL (`stores?: string[]`),
  present only for `stores:"all"` (the existing audit tests construct entries
  without it).
- **A-F3:** pin the legacy directory-less path: `stores:"all"` with `dir == null`
  (no registry) must fail-loud; the `store`/`stores` mutual-exclusion must be
  rejected before any engine call.
- **A-F4:** the fan-out must be wired in BOTH the `rag.query` and `rag-stream`
  cases; `RagQueryPayload` gains `stores?: "all"` alongside `store?`.

## Impact on existing contracts

- **SINGLE-WRITER-STORE:** unaffected — fan-out is read-only; each store keeps
  its own queue.
- **MCP-UI-EQUIVALENCE:** preserved — both surfaces route through
  `handleRagTool`; the equivalence tests hold under the shared-seam stamping.
- **Result shape:** the only breaking surface is the additive
  `storeContexts`/per-item `store` (A-F1) and the audit `stores` (A-F2) — both
  gated to `stores:"all"` under the amendments.
- **Audit log:** additive optional `stores`; `resultCount` = merged count.

## Unit decomposition (execution order U-F1 → U-F2 → U-F3)

- **U-F1** pure `mergeStoreResults` module (interleave, canonical order,
  skip-failed, score>0 floor) — no Electron.
- **U-F2** result qualification + `storeContexts` (retrieval.ts + shared/types.ts
  shape changes) — the breaking-change unit, carries the A-F1 test updates.
- **U-F3** `stores:"all"` schema on MCP/rag-stream/IPC, flat-only guard,
  mutual-exclusion, audit, fan-out wiring in `handleRagTool`.

Each unit its own red→green→adversarial→blind-greens→doc-review cycle (RCA-2/5).

## Costs / benefits

- **Benefits:** closes the Phase-1 dogfooding gap (query across all stores);
  embedder-agnostic merge; zero engine work.
- **Costs:** a gated result-shape change; fan-out wiring in two handlers + IPC;
  ~3 units of test/impl work.
