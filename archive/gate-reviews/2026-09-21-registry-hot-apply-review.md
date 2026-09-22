# Review — Multi-store Phase 2: Registry Hot-Apply / Removal / Rename

- **Status:** PROPOSAL GATE COMPLETE (2026-09-08). Four-agent gate: validity
  **VALID-WITH-AMENDMENTS** → critique **UNSOUND-as-written** (blockers B1–B8) →
  architecture **PROCEED-WITH-AMENDMENTS** (decisions D1–D8) → change-analysis
  **PROCEED-WITH-AMENDMENTS** (binding amendments A-P2-1..A-P2-8). **AWAITING the
  user's go-ahead before the spec gate.** Per the user's instruction, the
  live-scenario gate is PARKED (deferred to a later live-app session).
- **Proposal:** a mid-run registry change (add, remove, or rename a configured
  store) takes effect WITHOUT an app restart. Today the registry is
  BOOT-TIME-ONLY.
- **Revisit condition (met):** a live store-create/destroy workflow is wanted
  (e.g. per-run stores created by the bulk-research harness without a restart).

## The four-agent gate

| Agent | Verdict | Key points |
| --- | --- | --- |
| Validity | **VALID-WITH-AMENDMENTS** | Feasible — every block is a re-runnable pure construct; no engine gap. Must-fix: the `ProvidentMcpServer.ragStores` readonly seam, the const-captured IPC closures, the `ReadonlyMap` entries, no teardown primitive, rename/donfault-reassign semantics. |
| Critique | **UNSOUND-as-written** | B1 [CRITICAL] swap seam split (MCP path re-reads `dir`, IPC handlers close over boot consts); B2 [CRITICAL] contradicts REGISTRY-NO-WRITE + boot-time-only; B3 [HIGH] hot-remove data semantics; B4 [HIGH] rename breaks the `<name>:` id↔store coherence; B5 [HIGH] vector boot is boot-default-bound; B6 [HIGH] security/authorization; B7 [MEDIUM] not unit-sized; B8 [MEDIUM] mid-flight consistency. |
| Architecture | **PROCEED-WITH-AMENDMENTS** | Resolved D1–D8 (below); 8-unit decomposition. |
| Change-analysis | **PROCEED-WITH-AMENDMENTS** | D1–D8 sound; 8 binding amendments A-P2-1..A-P2-8. |

## Resolved design decisions (architecture D1–D8)

- **D1 — Swap seam:** a NEW registry-runtime controller owns a mutable live
  `RagStoreDirectory`; the MCP path already re-reads `dir` per call
  (`resolveStoreArg`/`dir.entries`), so no re-registration. `main.ts`'s
  `plan.directory` becomes `runtime.directory`. Default-bound consts stay until
  U-H5/D5.
- **D2 — Write path + supersession:** a NEW pure `rag-store-registry-write.ts`
  (validate + atomic temp→rename, then re-load + apply the delta). The disk file
  IS re-read + re-applied (persisted-and-live never diverge). Supersedes the
  "registry change observed only after restart" test.
- **D3 — hot-remove policy:** ORPHAN (unregister-only, strand the persistence
  file + journal/undo); operator confirmation via the operator-UI control (D8),
  not MCP. Data deletion is not a free op.
- **D4 — rename semantics:** restricted to NON-default stores with NO persisted
  `<name>:`-prefixed ids (no id rewrite). Id-migration for populated non-default
  stores is a SEPARATE unit. The default's rename folds into D5.
- **D5 — default reassignment:** SPLIT OUT (highest-risk: teardown + accessor-backed
  IPC + vector re-warm); lands as its own unit after U-H5.
- **D6 — security/authorization:** Operator-UI IPC (not group-gated), NO new MCP
  tool (the five-seam gate is untouched). The root-allowlist seam NOT required.
- **D7 — mid-flight consistency:** add atomic (construct-fully-then-insert);
  remove drain-then-teardown; rename reject-at-resolution. Requires NEW
  `teardown()` primitives on `RagStore`/`RetrievalEngine`/`VectorBootController`.
- **D8 — unit decomposition:** U-H1 write module → U-H2 runtime controller →
  U-H3 hot-add → U-H5 teardown → U-H4 hot-remove → U-H6 hot-rename → U-H8
  operator-UI editor. U-H7 (default reassignment) split out.

## Binding amendments (change-analysis A-P2-1..A-P2-8)

- **A-P2-1:** all const-captured default closures + server options read runtime
  accessors per call (MCP/UI equivalence).
- **A-P2-2:** `stores:"all"` resolves a current snapshot atomically;
  drain-then-teardown so a removed engine is never mid-query.
- **A-P2-3:** refine REGISTRY-NO-WRITE / boot-time contract to per-module;
  supersede `tests/unit-ms5-settings-listing.test.ts` Red 18 with refresh-on-apply.
- **A-P2-4:** U-H7 split off (teardown + accessor IPC + rebuild), per D5.
- **A-P2-5:** rename restricted to non-default stores with no persisted `<name>:` ids.
- **A-P2-6:** operator editor = UI IPC only, never `rag.list_stores` (no MCP census).
- **A-P2-7:** hot-remove = orphan via operator control, confirmation required, no MCP path.
- **A-P2-8:** new `teardown()` on RagStore/RetrievalEngine/VectorBootController lands
  in U-H5 with its own red set.

## Impact on existing contracts

- **REGISTRY-NO-WRITE** — refined, not broken: the loader stays pure (the
  `unit-ms1` banned-export census stays green); the write moves to the NEW
  `rag-store-registry-write.ts`.
- **SINGLE-WRITER-STORE-PER-STORE** — unaffected per store; hot-remove orphans
  (never deletes).
- **MCP-UI-EQUIVALENCE** — preserved only with A-P2-1 (the const-captured IPC
  closures must read runtime accessors).
- **Five-seam gate** — untouched (D6: operator-UI IPC only, no new MCP tool).
- **`stores:"all"`** — needs A-P2-2 (atomic snapshot + drain-then-teardown).

## Unit decomposition (execution order U-H1 → U-H2 → U-H3 → U-H5 → U-H4 → U-H6 → U-H8; U-H7 split out)

Each unit its own red→green→adversarial→blind-greens→doc-review cycle (RCA-2/3/6).
U-H2 (runtime + closure rewiring) is heavy — split U-H2a (runtime + mutable live
directory) / U-H2b (closure rewiring) if it balloons past the context threshold.

## Live-scenario

**PARKED (2026-09-08, per the user's instruction).** The registry hot-apply /
removal / rename MCP/UI surface cannot be driven live (the app is not running);
the live-scenario battery is deferred to a later live-app session.

## Costs / benefits

- **Benefits:** closes the "live store-create/destroy without a restart" gap (the
  bulk-research per-run store workflow); zero engine work.
- **Costs:** 8 units + heavy closure/doc churn; a new teardown surface; decision
  /test annotation updates (~8 units of test/impl work).
