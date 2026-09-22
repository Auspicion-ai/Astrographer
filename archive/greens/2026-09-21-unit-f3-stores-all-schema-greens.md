# Blind-test Greens — Unit F3: `stores:"all"` Schema + Fan-Out Wiring

- **Blind-test writer run:** 2026-09-08 (fresh agent, DOCUMENTATION ONLY —
  `docs/specs/unit-f3-stores-all-schema.md` §5.2–§5.9; NO implementation read).
- **Run file:** `tests/unit-f3-blind-greens-run.test.ts` (throwaway; may be
  deleted after recording).
- **Sources under test (LIVE modules):** `handleRagTool` + `handleRagQueryIpc`
  from `src/main/mcp-server.js`, driven through a real multi-store
  `RagStoreDirectory` (marker-directory pattern per the unit-ms5 test). Guard
  + fan-out + audit + stream + IPC + byte-equality states asserted end-to-end
  through the `handleRagTool` seam.

## Legend

- **PASS** — behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).

---

## §5.2 The four guards — `rag.query` throw form (§5.9.1–5.9.4)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-G1 | `store` AND `stores` both → `Error('rag.query: store and stores are mutually exclusive')` | §5.9.1 | **PASS** |
| G-G2 | `stores:'foo'` → `Error('rag.query: stores must be "all"')` | §5.9.2 | **PASS** |
| G-G3 | `stores:"all"` with `dir == null` → `Error('rag.query: stores:"all" requires a configured store registry')` | §5.9.3 | **PASS** |
| G-G4 | `stores:"all"` + `mode:'graph'` → `Error('rag.query: stores:"all" is only valid in flat mode')` | §5.9.4 (D4) | **PASS** |

## §5.2 The four guards — `rag-stream` error-chunk form (§5.9.1–5.9.4)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-S1 | store+stores → `[{type:'error',error:'rag.query: store and stores are mutually exclusive'}]` | §5.9.1/§5.5 | **PASS** |
| G-S2 | stores:'foo' → `[{type:'error',error:'rag.query: stores must be "all"'}]` | §5.9.2/§5.5 | **PASS** |
| G-S3 | dir null → `[{type:'error',error:'rag.query: stores:"all" requires a configured store registry'}]` | §5.9.3/§5.5 | **PASS** |
| G-S4 | mode:'graph' → `[{type:'error',error:'rag.query: stores:"all" is only valid in flat mode'}]` | §5.9.4/§5.5 | **PASS** |

## §5.3 Fan-out (§5.8.1, 5.8.2, 5.8.4) + §5.4 audit (§5.8.5) + determinism (§5.8.10)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-F1 | Two stores A(default) `[a1,a2]`, B `[b1,b2]` → results `[a1,b1,a2,b2]` (per-item `store` = `['main','research','main','research']`), `storeContexts` two blocks default-first, `engine:'local'`, NO `blockedBy`, top-level `store='main'` | §5.8.1 | **PASS** |
| G-F2 | B throws (D6) → skipped; merged has only A+C items; NO B `storeContexts` block; NO throw | §5.8.2/§5.3 step 1 | **PASS** |
| G-F4 | Single default entry → merged results = its items, one `storeContexts` block, top-level `store` = registry name | §5.8.4 | **PASS** |
| G-D | Default inserted SECOND → merge reorders default-first (results default-first, top-level `store='main'`); audit `stores` = canonical insertion order `['research','main']`; second identical call → identical merged result (determinism, D7) | §5.3 step 2/§5.8.10 | **PASS** |
| G-A | Fan-out audit: ONE entry, `resultCount` = merged `results.length`, `stores` = canonical-order names, `mode:'flat'` | §5.4/§5.8.5 | **PASS** |

## §5.5 `rag-stream` fan-out (§5.8.6)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-R1 | Returns `[{type:'result',result:merged+qualified},{type:'done'}]`; the `result` chunk carries the merged interleave + `storeContexts` and NO top-level `store` field | §5.8.6/§5.5 | **PASS** |
| G-R2 | Default store's engine throws → `[{type:'error',error:'mergeStoreResults: default store result required'}]` | §5.9.5/§5.5 | **PASS** |

## §5.6 `rag-query` IPC forward (§5.8.7) + IPC fail-states (§5.9.6–5.9.7)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-I1 | `handleRagQueryIpc(...,{query,topK,stores:'all'},dir,auditLog)` → same merged+qualified result (`results`, top-level `store='main'`, `storeContexts`, per-item `store`) + merged audit entry (MCP/UI equivalence) | §5.8.7/§5.6 | **PASS** |
| G-I2 | IPC `stores:"all"` + null `dir` → rejects `rag.query: stores:"all" requires a configured store registry` | §5.9.6 | **PASS** |
| G-I3 | IPC `stores:"all"` + `store` both set → rejects `rag.query: store and stores are mutually exclusive` | §5.9.7 | **PASS** |

## §5.8.8/8.9 + §6 Single-store byte-equality (A-F1/A-F4)

| # | Scenario | Spec | Result |
| --- | --- | --- | --- |
| G-E1 | `stores`-omitted single-store query → NO `storeContexts`, NO per-item `store`, NO `stores` audit key | §5.8.8/§5.4/§6 | **PASS** |
| G-E2 | `stores`-omitted with `store:'research'` → single-store selector path unchanged (fan-out does NOT run; `store='research'`, its items, no `storeContexts`) | §5.8.9/§5.1 | **PASS** |

---

## Summary

- Guards: **8 / 8 PASS** (§5.9.1–4 in both forms).
- Fan-out states: **4 / 4 PASS** (§5.8.1, 5.8.2, 5.8.4, default-not-first determinism).
- Audit: **1 / 1 PASS** (§5.8.5).
- `rag-stream`: **2 / 2 PASS** (§5.8.6 + default-failure error chunk §5.9.5).
- `rag-query` IPC: **3 / 3 PASS** (§5.8.7 + §5.9.6–7).
- Single-store byte-equality: **2 / 2 PASS** (§5.8.8, §5.8.9).
- **Total: 20 / 20 PASS, 0 FAIL.** No doc/spec drift, no regression.
