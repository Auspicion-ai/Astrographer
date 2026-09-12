# Blind Greens — Unit U-D6: `rag.query` / `rag-stream` Document Filters

- **Artifact:** `tests/blind-unit-ud6-query-document-filters-greens.test.ts`
- **Derived from:** `docs/specs/unit-ud6-query-document-filters.md` §5.1–§5.7 +
  §3a (A1–A11) **ONLY**, plus the harness conventions of the existing test
  files. The implementation (`src/main/retrieval.ts`, `src/main/mcp-server.ts`)
  was NOT read to decide expected behavior; only its public exports were
  imported. No TestWriter assertion was copied — fixtures and assertions are
  independently authored.
- **Command:** `npx vitest run tests/blind-unit-ud6-query-document-filters-greens.test.ts`
- **Result (2026-09-12):** **22 passed / 0 failed** (1 file).
- **Author role:** Blind-test writer (RCA-4 / AGENTS.md item 10a).

## Fixtures (independent of the TestWriter fixtures)

**Flat** (`seedFlat`, query token `omega`):

| doc | path | tags | section |
| --- | --- | --- | --- |
| `docP` | `['p']` | `['red','blue']` | `secP` |
| `docQ` | `['p','q']` | `['Red']` | `secQ` |
| `docR` | `['z']` | `['blue']` | `secR` |
| `docGone` | (root absent from `listNodes()`) | — | `secG` (edge `secG → anchorG`, `documentIds:['docGone']`) |
| — | — | — | `lonely` (no owning document) |
| `docP` + `docR` | multi-parent | — | `shared` |

**Graph** (`seedGraph`, query token `nebula`): `docM` (`['m']`/`['mk']`) with
`refM -xM(documentIds:['docM'])-> factM`; `docN` (`['n']`/`['nk']`) with
`refN -xN(documentIds:['docN'])-> factN`; a document-less `refO -xO(no
documentIds)-> factO`. A separate document-less-only store isolates the F1
byte-equality surface.

## Scenario ledger

| Id | Spec section | Assertion | Result |
| --- | --- | --- | --- |
| S1 | §5.1, §5.6.2–4, A1 | FLAT: `undefined` ≡ `{}` ≡ `{documentPathPrefix:[]}` ≡ `{tags:[]}` ≡ both-empty, byte-equal (`JSON.stringify`); base set is all six candidates. | PASS |
| S2 | §5.1, §5.6.5–6 | FLAT: `['p']`→`{secP,secQ,shared}`; `['p','q']`→`{secQ}`; `['p','q','r']`→∅; `['P']`→∅ (case-sensitive); `['pp']`→∅ (not a string prefix). | PASS |
| S3 | §5.1, §5.6.7+9, A2 | FLAT: `['red']`→`{secP,shared}`; `['blue']`→`{secP,secR,shared}`; `['red','blue']`→`{secP,shared}` (AND); `['red','green']`→∅; `['Red']`→`{secQ}`; `['red','Red']`→∅ (case-sensitive AND). | PASS |
| S4 | §5.1, §5.6.8 | FLAT combined: `{['p'],['blue']}`→`{secP,shared}`; `{['z'],['red']}`→∅ (both constraints required). | PASS |
| S5a | §5.2, §5.6.11, §5.7.13–14, A4/A6 | FLAT: `lonely` (no owning doc) and `secG` (absent root) present with no/empty constraint, EXCLUDED under an active prefix or tags, never throws. | PASS |
| S5b | §5.2 mapping guard | `documentIdsForNode` resolves the fixture exactly (incl. `lonely`→`[]`, `secG`→`['docGone']`, `shared`→`['docP','docR']`). | PASS |
| S6 | §5.2, §5.6.10, A3 | FLAT: multi-parent `shared` passes `tags:['red']` (via `docP`) and `documentPathPrefix:['z']` (via `docR`), but not `['m']`. | PASS |
| S7a | §5.1/§5.2, A1/F1 | GRAPH document-less edge: `undefined` ≡ `{}` ≡ `{documentPathPrefix:[]}` ≡ `{tags:[]}` byte-equal and resolve `factO`; an active constraint excludes it. | PASS |
| S7b | §5.5.2, A1/F1 | GRAPH full fixture: no filters ≡ `{}` byte-equal, resolving `{factM,factN,factO}`. | PASS |
| S8 | §5.5.2, §5.6.12 | GRAPH: `['m']`→`{factM}`; `['n']`→`{factN}`; `tags:['mk']`→`{factM}`; `tags:['nk']`→`{factN}`; `['zzz']`→∅ (seed+edge+target gating). | PASS |
| S9a | §5.2, §5.6.13 | GRAPH: edge `documentIds:['docM']` under prefix `['m']` is traversed → `{factE}`. | PASS |
| S9b | §5.2, §5.6.13 | GRAPH: edge `documentIds:['docN']` under prefix `['m']` is NOT traversed → ∅. | PASS |
| S10a | §5.3, §5.7.2–6, A5 | LOCAL `validateFilters`: non-array (`'p'`, `42`, `{}`, `true`, `null`) and non-string/empty members (`1`, `''`, `null`, `{}`) for BOTH fields throw exactly `ragQuery: filters malformed`; non-object container and `nodeKind:'bogus'` too. | PASS |
| S10b | §5.3, A10 | LOCAL: `['  ']`/`[' ']` are valid (non-empty strings); unknown KEY `bogus` is ignored and the known filter still applies. | PASS |
| S11a | §5.6.14 | `handleRagTool('rag.query', {filters:{['p'],['blue']}})` → `{secP,shared}`. | PASS |
| S11b | §5.7.7 | `rag.query` malformed (`documentPathPrefix:'p'`, `tags:[1]`) throws exactly `rag.query: filters malformed`. | PASS |
| S11c | §5.6.15 | `rag-stream` with `{documentPathPrefix:['p']}` → `[{type:'result',result:{secP,secQ,shared}},{type:'done'}]`. | PASS |
| S11d | §5.7.8 | `rag-stream` malformed → exactly `[{type:'error',error:'rag.query: filters malformed'}]`, never a throw. | PASS |
| S12 | §5.4.1, §5.6.18 | SDK `listTools`: `rag.query` and `rag-stream` `filters` advertise `documentPathPrefix` + `tags` alongside the 4 base fields. | PASS |
| S13a | §5.4.2, §5.7.11, A7 | DIRECT `handleGnosisTool('gnosis.query'/'gnosis.stream')` with a local-only key throws `${name}: filters malformed` BEFORE any proxy call (spy observes zero `ragQuery` requests). | PASS |
| S13b | §5.4.2, §5.7.10, A7 | SDK `listTools`: `gnosis.query` / `gnosis.stream` schemas do NOT contain `documentPathPrefix` or `tags`. | PASS |
| S14 | §5.8 | `ProvidentMcpServer.ALL_TOOLS` is still 56 and contains `rag.query`/`rag-stream`/`gnosis.query`. | PASS |

Totals: **22 PASS / 0 FAIL**.

## Non-blind-constructible scenarios (recorded, not faked)

| Spec ref | Scenario | Why not blind-constructible |
| --- | --- | --- |
| A6 / §5.7.13 (partial) | A document root whose persisted `documentPath`/`tags` are **non-arrays** ("tampered") must be treated as `[]`. | The public store seam (`store.putNode`) validates node shape and throws `rag putNode: documentPath required/invalid` at write time, so a non-array field cannot be persisted through the landed API. The absent-root half of A6 IS covered (S5a, `secG`/`docGone`); the tampered half has no blind seam and was omitted rather than weakened. |
| A8 | Filter arrays are read-only (no caller mutation) and application is deterministic/stable. | Constructible in principle (snapshot the arrays around a call), but outside this artifact's required coverage list; not attempted. |
| A9 / §5.6.16 | `stores:'all'` fan-out applies the filter against EACH store's own mapping. | Requires a multi-store MCP/`ProvidentMcpServer` fan-out fixture; outside the required coverage list. |
| §5.6.17 | Audit log echoes the local filters by reference. | Requires an injected `auditLog`; outside the required coverage list. |
| §5.7.10 (round-trip half) | An SDK `gnosis.query` carrying the fields has them stripped by zod before the proxy. | S13b covers the schema not advertising the fields; the actual SDK strip round-trip was not exercised (outside required coverage). |
| §5.7.12 | The existing `unit-gn-engine-integration` serialization pin stays green. | That is an existing suite, not a new U-D6 scenario; verified separately by the full suite. |

## Notes

- No FAIL was observed; no assertion was adjusted to pass and no implementation
  file was read.
- The only test edits during authoring were fixture-integrity fixes required by
  documented store invariants (`putEdge` requires existing endpoints; `putNode`
  rejects non-array `documentPath`), discovered from the thrown error only —
  not from reading the implementation.
