# Spec — Unit U-H3: Hot-Add (CONFIRMATORY — DELIVERED BY U-H2a; NO new source)

> **STATE (2026-09-08): U-H3 is a VERIFICATION/confirmatory unit, not a build
> unit.** Its functional core — adding a non-default store at runtime via
> `hotApply({kind:'add'})` — is **ALREADY DELIVERED** by Unit U-H2a's
> `rag-store-runtime.ts` (the REBUILD-ALL-OF-NON-DEFAULT apply) and pinned by the
> landed `tests/unit-h2-runtime-controller.test.ts`. **This spec is a thin
> CONFIRMATORY RECORD** that documents that delivery, maps every hot-add
> requirement to the exact U-H2a behavior + pinning test, records the re-scoping
> decision, and asserts the red set is EMPTY. It does NOT re-implement U-H3, does
> NOT propose new code, and does NOT touch `src/` or `tests/`.

- **Status: U-H3 hot-add — DELIVERED by U-H2a; NO new source code required; a
  confirmatory/verification unit.** Gate reference: `docs/specs/registry-hot-apply-review.md`
  §2 **D8** (the unit decomposition — "U-H3 hot-add"), **D7** (mid-flight
  consistency — add ATOMIC = construct-fully-then-insert), **D6/S5** (no new MCP
  tool, operator-UI IPC only in U-H8), **D8/D5/A-P2-4** (default reassignment is
  U-H7), **A-P2-8** (teardown lands in U-H5); §6 (live-scenario PARKED by user
  instruction). The hot-add INTENT was re-scoped to the U-H2a delivery (see the
  Decision record, §3).
- **Supersession:** the gate's "U-H3 hot-add" unit is satisfied by U-H2a's coarse
  `hotApply({kind:'add'})` (the REBUILD-ALL-OF-NON-DEFAULT apply). See the
  decision row **HOT-ADD-DELIVERED-BY-U-H2A** (§3) and the supersession
  `§/D-reference` to `docs/specs/unit-h2-runtime-controller.md` §4 /
  **ATOMIC-APPLY** + **DEFAULT-STABLE-APPLY** + **REBUILD-ALL-OF-NON-DEFAULT**,
  §5.4 step 5–7, §5.7 F17, and that spec's own note that "the rebuild is a
  coarse-but-correct apply; U-H3/U-H4/U-H6 can substitute an incremental
  teardown-aware apply" (`unit-h2-runtime-controller.md` §4 / its §2/§3 and the
  §7 Architect ruling item 2).
- **Red expectation is EMPTY:** there is NO new behavior to implement (no file is
  created/edited here). **Green expectation:** re-run the EXISTING U-H2
  add-coverage — the rows listed in the evidence table — which are already green
  in `tests/unit-h2-runtime-controller.test.ts`.
- **Consumed evidence (all LANDED):** `docs/specs/unit-h2-runtime-controller.md`
  §4–§5.7 (U-H2a), §5.8–§5.9 (U-H2b closure rewiring), §5.11 (census — 38 U-H2a +
  14 U-H2b + 4 pins); `tests/unit-h2-runtime-controller.test.ts`;
  `src/main/rag-store-runtime.ts`.

## 1. What hot-add requires (from the gate)

"Add a non-default store at runtime" (`pending.md`: re-running the boot flow —
store + engine + boot-controller creation; the review §2 D8 "U-H3 hot-add"; the
review §6 revisit: a live store-create workflow without a restart). Concretely:

1. **Creates the store + lexical engine** for the new non-default store —
   the same construction the boot path would run (`createJsonRagStore` + the
   lexical engine; A6/R10: non-default stores are ALWAYS lexical).
2. **Persists atomically** — the registry disk file gains the new store via a
   single atomic write (D7 add-atomic; U-H1's temp→fsync→rename).
3. **Takes effect WITHOUT a restart** — every live closure observes the new
   store immediately (no re-registration, no reboot).
4. **Keeps the default byte-equal** — the new store is non-default; the default's
   name/store/engine/vector-boot identities are unchanged (U-H7 owns default
   reassignment).
5. **No new MCP tool, no IPC** — D6: the operator-facing trigger is U-H8; U-H3's
   runtime core adds neither.
6. **No teardown** — the OLD non-default entries are orphaned (never torn down);
   teardown is U-H5/A-P2-8.

## 2. The evidence mapping — every hot-add requirement → the exact U-H2a behavior + the pinning test(s)

| # | Hot-add requirement | Delivered by U-H2a behavior (exact) | Pinned by (file + test) |
| --- | --- | --- | --- |
| 1 | Create store + lexical engine | `hotApply` step-5/6 rebuild: for each non-default `loaded.stores` entry, `buildLexicalEntry(s)` = `createJsonRagStore({ path: s.persistenceFile })` + the LEXICAL engine `createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))` (`src/main/rag-store-runtime.ts:262-274`, `:293-296`; A6 — always-lexical, byte-equal to `buildRagStoreDirectory` rule 2). | `tests/unit-h2-runtime-controller.test.ts` — **H3** ("the new entry's `store`/`engine` are FRESH objects"; `entries.get('research-2026-10')!.engine.query` is a function). |
| 2 | Add is ATOMIC (construct-fully-then-insert, D7) | Step 5 builds a STAGING `Map<string, RagStoreEntry>` FIRST; if ANY construct throws, the throw propagates and the live Map is NOT mutated — **staging never swapped** (`rag-store-runtime.ts:286-305`; §4 ATOMIC-APPLY, F17). | **F17** ("a non-default construct throws → the underlying Error PROPAGATES; the live Map is NOT mutated (staging never swapped); `entries.has('research-2026-10')` false"). |
| 3 | Persist + reload | `hotApply` step 3 calls `writeRegistryMutation({ path: _registryPath, mutation })` — the ONLY disk touch; U-H1's atomic temp→fsync→rename + re-load; `{ loaded, delta }` returned (D2 persisted-and-live never diverge). | **H3** (`result.loaded.stores` = `['main','research-2026-09','research-2026-10']`, `implicit:false`/`corrupt:false`, `delta = { added:['research-2026-10'], removed:[], renamed:[] }`) + **H9** ("an external edit is NOT observed until a hotApply, then it is" — the re-read drives the live state) + **H11** (failed write leaves disk+live untouched). |
| 4 | Takes effect WITHOUT a restart | In-place mutation of the SAME boot `RagStoreDirectory.entries` Map + the U-H2b closure rewiring (main.ts B1–B13 / mcp-server.ts M1–M4 read runtime accessors PER CALL), so every live closure sees the new entry without re-pointing. | **H2** (same live Map object observable through both references), **B0–B13** / **M1–M4** ("runtime constructed at boot"; every bind site resolves via `runtime.*`; `rag.*`/`edit.*` closures resolve per call). |
| 5 | Default byte-equal | **DEFAULT-STABLE-APPLY**: the reachable add NEVER changes the default — the default entry + `vectorBoot` object identities are carried across unchanged (never rebuilt / re-warmed); only non-defaults are rebuilt. | **H3** ("`getDefaultStore()` returns the SAME object as before"), **H5** ("default survives every reachable apply (add/remove/rename of NON-default): name/store/engine/vectorBoot SAME identities"), **H12** (determinism). |
| 6 | No new MCP tool / IPC (D6) | The module defines NO MCP tool, NO IPC channel, imports no `shared/types` constant (D6 negative pin). | **N2** ("the module defines NO MCP tool name, NO IPC channel … and emits ZERO console output"); the U-H2b D6a pin (ALL_TOOLS stays 41) / D6b (no new IPC channel). |
| 7 | No teardown (orphan, U-H5) | The old non-default entries are ORPHANED (dropped from the live Map + closures), never torn down; the module defines/imports NO `teardown`/`close`/`destroy` and no remove/rm/unlink primitive (A-P2-8 negative pin). The add never touches a store persistence file. | **N1** ("defines NO teardown/close/destroy primitive and NO electron import"); the A-P2-8 structural pin. |
| 8 | (defensive) W-add-existing for a present store | A redundant add of an already-present store FAILS LOUD via the write module's **W-add-existing** (the D7 reject-at-resolution discipline); live + disk untouched. | **F12** ("hotApply add of an ALREADY-PRESENT store → W-add-existing PROPAGATES; live-untouched; disk untouched"). |

All seven hot-add requirements are satisfied by U-H2a; **there is NO hot-add
requirement-gap** left for U-H3 to implement (the only "refinement" candidate —
a teardown-aware incremental add — is a correctness-optional refine, §4, NOT a
missing behavior).

## 3. Decision record (record this in `docs/decisions.md`)

> **DECIDED: HOT-ADD-DELIVERED-BY-U-H2A — the gate's "U-H3 hot-add" unit (review
> D8) is SATISFIED by U-H2a's coarse `hotApply({kind:'add'})` — the
> REBUILD-ALL-OF-NON-DEFAULT apply in `src/main/rag-store-runtime.ts`. The
> approved execution order's U-H3 step is therefore a CONFIRMATORY/verification
> landing, NOT a build unit: NO new source code is required and the red set is
> EMPTY; the green set is the existing U-H2 add-coverage re-run (tests H2/H3/H5/
> H9/H11/H12/F12/F17/N1/N2 + the U-H2b B1–B13/M1–M4 + D6a/D6b/A-P2-8 pins).
> Superseding §/D-reference: `docs/specs/unit-h2-runtime-controller.md` §4
> **ATOMIC-APPLY** (D7 add-atomic construct-fully-then-insert) +
> **DEFAULT-STABLE-APPLY** + **REBUILD-ALL-OF-NON-DEFAULT** (its own note: "the
> rebuild is a coarse-but-correct apply; U-H3/U-H4/U-H6 can substitute an
> incremental teardown-aware apply") + §5.4 step 5–7 + §5.7 F17 + the §7 Architect
> ruling item 2. The remaining slice units proceed as **U-H5 (teardown) → U-H4
> (hot-remove) → U-H6 (hot-rename) → U-H7 (default reassignment) → U-H8
> (operator-UI editor).** | 2026-09-08 (CONFIRMATORY) | `docs/specs/registry-hot-apply-review.md` §2 D7/D8/D6/A-P2-8/D5; `docs/specs/unit-h3-hot-add.md` §1/§2; `docs/specs/unit-h2-runtime-controller.md` §4 |

## 4. Explicitly OUT of range for U-H3 (belongs to later units)

- **Teardown primitives** (`teardown()` on RagStore/RetrievalEngine/VectorBootController) — **U-H5** / A-P2-8. U-H3 orphans, never tears down.
- **A teardown-aware INCREMENTAL add** (a U-H4/U-H6-style refine) — explicitly NOT needed for correctness. U-H2a's coarse rebuild is correct; this refine is optional and deferred, not a U-H3 obligation.
- **The operator-facing IPC trigger** (the operator-UI editor that invokes `hotApply`) — **U-H8**; D6. U-H3 adds no MCP tool and no IPC.
- **Vector-boot for a hot-added store** — A6/R10: non-default stores are ALWAYS lexical, so a hot-added store never vector-boots. **Default reassignment (re-defaulting a store)** — **U-H7** / D5 / A-P2-4.

## 5. The confirmatory red/green expectation

- **RED set: EMPTY** — there is no new behavior to implement and none is proposed; no file under `src/` or `tests/` is changed by U-H3.
- **GREEN set: the existing U-H2 add-coverage re-run** —
  - U-H2a: `tests/unit-h2-runtime-controller.test.ts` — **H2/H3/H5/H9/H11/H12** (happy), **F12/F17** (fail), **N1/N2** (negative pins), plus the HOST-1/2/3 regressions for the drift-path integrity of the add.
  - U-H2b: **B0–B13** (the add is visible to every live closure via the runtime accessors) + **M1–M4** + the **D6a/D6b/D8/A-P2-8** negative pins.
- **Trio:** `npm test` / `npm run typecheck` / `npm run build` — U-H3 introduces no change, so the existing green trio is the U-H3 verification.

## 6. Census / numeric claims (confirmatory — no new code)

- **New modules / files this unit creates:** **0** (U-H3 is a record; `docs/specs/unit-h3-hot-add.md` is the only write; optional decision row in `docs/decisions.md`).
- **New exports / methods / error templates:** **0** (all U-H2a's — the 10 controller methods, the 13 R-* templates, the propagated W-*/F-*/fs sets).
- **New MCP tools / IPC channels / teardown calls:** **0** (D6 / A-P2-8).
- **Runtime re-builds per add:** exactly the ONE `buildLexicalEntry` per newly-added (and all other) non-default entry; the default + vector-boot are NOT rebuilt.
- **Disk writes per successful add:** exactly ONE registry write (U-H1's temp→fsync→rename) + the re-load read; ZERO writes to any store persistence file/journal; ZERO removals.

## 7. Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D7** (add atomic = construct-fully-then-insert), **D8** (unit decomposition "U-H3 hot-add"), **D6/S5** (no new MCP tool, operator-UI IPC only in U-H8), **D8/D5/A-P2-4** (default reassignment is U-H7), **A-P2-8** (teardown in U-H5); §4 (hot-add intent — re-running the boot flow: store + engine + boot-controller creation); §6 (live-scenario PARKED by user instruction).
- **U-H2a delivery (consumed):** `docs/specs/unit-h2-runtime-controller.md` §4 **ATOMIC-APPLY** / **DEFAULT-STABLE-APPLY** / **REBUILD-ALL-OF-NON-DEFAULT**, §5.4 (apply ordering: validate → d4-inspect → `writeRegistryMutation` → construct-fully-then-insert into a STAGING map → one-pass swap → `{loaded, delta:{added}}`), §5.6 **H3**/H5/H9/H11/H12, §5.7 F12/F17/N1/N2, §5.8–§5.9 (**U-H2b** B1–B13/M1–M4), §5.11 (census).
- **Source (read to confirm, NOT to re-spec):** `src/main/rag-store-runtime.ts` (`hotApply` `:186-257`; `buildLexicalEntry` `:262-274`; `syncLiveToLoaded` `:285-305`).
- **Sibling slice units (cite-only):** U-H5 (teardown — A-P2-8), U-H4 (hot-remove after U-H5), U-H6 (hot-rename), U-H7 (default reassignment — OUT), U-H8 (operator-UI editor — the future `hotApply` IPC invoker). **Execution order proceeding: U-H5 → U-H4 → U-H6 → U-H7 → U-H8.**
- **Decision row:** `docs/decisions.md` — **HOT-ADD-DELIVERED-BY-U-H2A** (§3), alongside the landed U-H2 rows (RUNTIME-CONTROLLER, MUTABLE-LIVE-DIRECTORY, DEFAULT-STABLE-APPLY + REBUILD-ALL-OF-NON-DEFAULT, HOT-APPLY-TRIGGER-RESOLVED, NO-OP-BYTE-EQUAL, ATOMIC-APPLY, D4-NO-IDS-CALLER-PRECONDITION, A-P2-1-CLOSURE-REWIRING, REFRESH-ON-APPLY).
- **Page design:** U-H3 is NOT a page-design change (the operator-UI editor is U-H8; the settings-pane listing is U-MS5's surface). `docs/skills/designing-pages.md` and its test-use-case coverage matrix + demo-page index are **UNCHANGED** by U-H3.

---

**Bottom line:** U-H3 hot-add is a **CONFIRMATORY / verification unit**, not a build
unit — every hot-add requirement is already delivered by U-H2a's
`hotApply({kind:'add'})` (the REBUILD-ALL-OF-NON-DEFAULT apply) and pinned by the
landed U-H2 tests. **No new source code is required; the red set is EMPTY.** The
re-scoping decision (**HOT-ADD-DELIVERED-BY-U-H2A**) is recorded, and the slice
proceeds U-H5 → U-H4 → U-H6 → U-H7 → U-H8.
