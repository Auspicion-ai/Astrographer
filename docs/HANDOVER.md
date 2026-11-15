# Handover — Astrographer UI Overhaul (Wave 2)


**⟶ VOCABULARY NOTE `2026-11-15` (POINTER — the full note is at this file's foot):** unit `U-1a` moved the zone vocabulary to the foundation's (`top|bottom|left|right`, `[zone=]`, the pane `order` member becoming `index`). Every `header`/`footer` zone spelling and every `data-zone` carrier below is a PRE-RENAME reading; the accepted cost is `ZONE-RENAME-SILENTLY-RELOCATES-PERSISTED-PLACEMENTS` in `docs/defects.md`.
**Date:** 2026-09-14 (latest) · **Tree:** the last Wave-3 unit
(`docs/specs/unit-u-import-1-import-surface.md`, previously an untracked
spec-only draft) is now **GREEN / COMPLETE / CODE LANDED** — **WAVE 3 COMPLETE:
the UI-overhaul (C1–C20 wave decomposition) is ALL-LANDED** with U-IMPORT-1 (C17) +
U-SHELL-7 (C3). The Wave-2 batch (PBT backfill + U-JR1 + W2-N11 + U-SHELL-N7
shell-wiring), U-SHELL-7, and U-IMPORT-1 are all landed; the unit DONE rows are in
`docs/next-steps.md`.

**Baseline (recorded green state of the U-IMPORT-1 pass):**
`npm test` → **4613 pass + 58 skip**; `npm run typecheck` → 0;
`npm run build` → OK.

**Objective:** implement the document-only UI-overhaul spec
(`docs/specs/ui-overhaul.md`, C1–C20) as gated, per-unit TDD waves (RCA-2).

---

> **⟶ SUPERSEDED IN PART `2026-10-05` (the pin-refresh-3 pass, `RCA-8(c)`, annotate-beside — the section below is KEPT VERBATIM as its pass's reading):** its `HEAD 0881558` / *"nothing was committed this session"* readings are historical — the USER committed `68e3b64` *mid-pass* (81 files, all under `archive/tests/**`), and the pin it records (`dd34e011…`) has since been REFRESHED to `93c058f6…` per the STANDING re-pin policy. Everything else in that section — the objective, the next actions in order, the figures to assert, the rulings, the traps, the owed list — STANDS and is the operative pickup detail; read it together with the CURRENT section above it, NOT instead of it.

> **⟶ SUPERSEDED IN PART `2026-10-05` (the UNIT B close-out pass, `RCA-8(c)`, annotate-beside — the section below is KEPT VERBATIM as its pass's reading):** its *"UNIT B IS STILL THE PICKUP"* framing, its `role_test_writer` first action, and its baseline (`131 / 2993 | 22 skipped`, drift `CLEAN`, pin `93c058f6…`) are HISTORICAL — UNIT B has since been carried through its red set, four gate-4 rounds, gates 5/6, gates 7/8 and the trio, and the tree has moved (the USER committed twice under it: `68e3b64`, `f124358`). Its PIN reading still stands (`93c058f6…`, `measuredAt 2026-09-30`, drift CLEAN). Everything else it records — the traps, the owed list, the `F1` provenance escalation — STANDS.

> **⟶ SUPERSEDED IN PART `2026-10-05` (the ZONE-UNIT pass, `RCA-8(c)`, annotate-beside — the section below is KEPT VERBATIM as its pass's reading):** its *"the next pickup is the zone/sidebar replacement"* framing is historical — **that unit is now LANDED** (`U-ZONE-REPLACEMENT` / `PD-UI-14`, its DONE row heads `docs/next-steps.md`), its baseline (`131 files / 3003 passed`) has moved to `132 / 3012 | 22 skipped`, and the tree is no longer at `f124358`. Everything else it records — the pin-refresh readings, the traps, the owed list, the `F1` provenance escalation — STANDS.

> **⟶ SUPERSEDED IN PART `2026-10-04` (the `U-STORE-CORE-ADOPT` landing pass, `RCA-8(c)`, annotate-beside — the section below is KEPT VERBATIM as its pass's reading):** its *"the next pickup is F2 unit 1 `U-STORE-CORE-ADOPT`"* framing is HISTORICAL — **that unit is now LANDED** (its DONE row heads `docs/next-steps.md`'s CURRENT WORK region). The current state and pickups are the section directly below this note; everything else it records — the F1 members, the traps — STANDS, and the O-rows are re-stated there with their F2 owners.

## CURRENT HANDOVER STATE (2026-10-04, U-STORE-SECURITY-WRITE / 3a LANDED) — F2 UNIT 3's FIRST HALF IS IN (FULL CYCLE, `41196d1` + REMAND `45f3df7` + RESIDUALS `ba0dd70`); THE NEXT PICKUP IS F2 UNIT 3b `U-STORE-SECURITY-JOURNAL`

**THE OBJECTIVE THIS PASS DISCHARGED: the gate-10 tracker pass for `U-STORE-SECURITY-WRITE` (3a, the FIRST half of the SPLIT unit 3 of the F2 store-adoption program)** — the unit's full cycle is CLOSED: **gates 1→10**, **gate 4 `PASS-WITH-FINDINGS`** (`G-1`..`G-16`, the read-only PBT audit included), **gate 5 `20 PASS / 1 FAIL`** (the FAIL = the park artifact absent at `41196d1`; **MATERIALIZED at `ba0dd70`**, and the FAIL STANDS as that gate's own head reading), **gate 6 a STRUCTURAL REFUSAL + a NAMED PARK**, **gate 7 the ledger rows**, **gate 8 the doc-review record** (`archive/reviews/2026-10-04-U-STORE-SECURITY-WRITE-doc-review.md`), **gate 9 the trio + drift** re-verified by the supervisor's shell at `ba0dd70`. **LAYER (`RCA-12`), STATED FIRST SO NOTHING IS OVER-READ: `[H]`-shim / `[T]`; the live leg is a NAMED PARK (`docs/specs/unit-store-security-write-live-pending-battery.md`, `54` lines, `OPEN / live-pending — NEVER green, NEVER DONE`); NO DURABILITY CLAIM ANYWHERE — the atomic five-step is SHAPE-asserted as call order/count over the injected `fs` façade, and no `fsync` completion, no crash-recovery outcome and no bytes-after-power-loss state is verified by any artifact of this unit.**

**WHAT LANDED, ONE LINE EACH (ONE ATOMIC COMMIT `41196d1`, six paths, `6 files changed, 4182 insertions(+), 15 deletions(-)`):** the atomic five-step write in `src/main/security-store.ts` (`mkdirSync(dirname,{recursive:true})` → `${path}.tmp` write → `fsyncSync(tmp)` → `renameSync(tmp, path)` → `fsyncSync(dir)`, each once; both descriptors closed on every path) with the NEW `lastWriteReceipt()` and the ADDITIVE-OPTIONAL injected `fs?` façade; the CLOSED two-form `SecurityWriteReceipt` HOMED in the store module by the `A-3A-1`/`A-3A-2` ruling (`src/shared/types.ts` **NOT moved** and landing no byte); `src/main/main.ts`'s EXISTING `IPC_SECURITY_SET` return extended ADDITIVELY to `{ ...updated, write: securityStore.lastWriteReceipt() }` with `set()`'s own return shape UNCHANGED (non-breaking); the TWO widened `security.set` preload declarations against a LOCAL structural twin; the md5 re-statement (`21b8120c…` → **`cb1ee2ff3cd409363dd656a9914e72ad`**, `restated: 'U-STORE-SECURITY-ADOPT'`); the two new unit test files (`1204` + `3398` lines). **REGISTER READING: 13 rows HELD** (`P-SSW-IM-1..6` · `P-SSW-SM-1` · `P-SSW-TP-1..2` + `P-SSW-H-1..4`), seed `0x20260927`, caps ≤100/≤400, terms `[T] 61 + [H] 17 = 78`, **`P-SSW-IM-4` at its RULED `10`**, `stoppedAt null`, counterexamples 0. **RED SET (`RCA-1`): `11 failing / 10 passed (21)` at the pre-edit head** (full suite `2 failed | 136 passed`, the only red files being this unit's two) **→ the `A-3A-1`/`A-3A-2` rulings → `21/21` → the gate-4 remand `45f3df7`** (six vacuous/weak oracles re-aimed, each with a planted-and-reverted mutation proof) **→ `21/21`.** **TRIO + DRIFT (re-verified by the supervisor's shell at `ba0dd70`): `138 files · 3088 passed | 22 skipped (3110) · 0 failed` · `typecheck` exit 0 · `build` exit 0 · `drift` CLEAN (15 checks / 0 differences, PIN ARM EQUAL).**

**THE PICKUPS FOR A FRESH SUPERVISOR, IN ORDER:**
1. **F2 unit 3b — `U-STORE-SECURITY-JOURNAL`** (the RH-3 half, the SECOND half of the split unit 3): the ADDITIVE `SecurePanelsOptions.maxJournalLength` option (**never a positional second argument** — 8+ landed one-argument call sites stay green), the pane construction-site option fed by the fork's existing boot local (no new boot read), the reply-path `refreshDebug` burst re-home into the notify callback (the probe pins EXACTLY TWO code-level `panels?.refreshDebug(runtime)` sites in `renderer.ts`, comments excluded; a third FAILS; the SPAN form is REJECTED BY NAME; `'journal'` STAYS in the notify predicate), **`journalDepth()` reading `Supervisor.journal.length` — `readonly journal`, NOT the foundation's `undoDepth`, which is the stack `condense()` TRUNCATES** (the operative finding of 3a's gate 1; the seam is read AFTER the deferred condense's macrotask boundary, and its falsifier carries THREE limbs — capped ≤ M, an UNCAPPED control, and a SUBJECT-DISCRIMINATION limb), **the fork-AUTHORED host-side cap function (never ported)**, and 3b's own NAMED park. **Its contract `docs/specs/unit-store-security-journal.md` DOES NOT EXIST at this head** (`VERIFIED-BY-READ`) and **3a landed ZERO `src/renderer/**` byte** — 3b carries its OWN gate-1 → spec → STEP-0 dossier → red → green → adversarial(PBT) → greens → item-10d cycle (`RCA-2`/`RCA-5`), SEQUENTIAL after 3a per the shared-file rule.
2. **Then, per the program plan's unlock order:** `U-STORE-MODULES-MIGRATION` (the `Q-5` migration: the array→keyed payload change, BOTH writer classes incl. `src/main/mcp-server.ts`, the reserved-namespace arming, the one-boot window, the module suites' re-statement) · `U-OPERATOR-SETTINGS-REHOME` (the 7 renderer call sites + 2 landed suites + the file's `md5` row, which is ALSO the `UNRESTATED_CONTROL_PATH`) · then **FOCUS / MODULES / PANE-DRAG / READS / LANES** — each unit running its own full cycle.
3. **The tracker O-rows (restated at this head, each with its owner):** **O-1** SC-8/SC-9 fired-revisit + the two zone-gesture defect dispositions → `U-STORE-PANE-DRAG-ADOPT`'s tracker pass · **O-2** H3/H-r6 re-route → `U-STORE-READS-RE-ROUTE` · **O-3** the `HOST-PERSISTENCE` re-annotation → **DISCHARGED, now twice**: unit 2's note (which closed ONLY the carrier-existence question) and **this pass's `O-5` note on `docs/defects.md` `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY`, answering clause by clause what 3a changes — clause (1) gains a SECOND landed atomic exemplar (the named non-atomic set drops THREE → TWO: `operator-settings-store.ts`, `engine-config.ts`) while the SWEEP, the schema/version-gate CENSUS, the rendered-frames clause and the WITNESS OBLIGATION all stay `OPEN`; the row STAYS `OPEN` / owner HOST / MED and is not closed by that note** · **O-4** E-10/E-11 (the manifest's `baselines` cells + the per-module `provenance` wording) → **STILL OWED** to the supervisor's manifest/tracker pass · **O-6** the upstream full-suite reading at `7bd1de4` → a shell-bearing pass (a RECORDED READING, never fork-conformance evidence).
4. **The `O-9` digest half is STILL OWED to a shell-bearing pass** (`md5sum`/`sha256sum` at the current head): the gate-8 review's `DR-11` names the same owner, and **no digest was fabricated by the gate-7, gate-8 or gate-10 passes**.
5. **3b's OWN `O-4`** (the cap function authored against `journal.length` + the three falsifier limbs) is **UNMOVED and belongs to 3b** — the gate-1 record's own `O-4` cell says `OWED — 3b`, and NO part of 3a discharges it.

**WHAT THIS PASS WROTE (the six tracker files + the several named `docs/specs/*` files ONLY — additive / annotate-beside, `RCA-8(c)`; NO `src/**`, `tests/**`, `vendor/**` or `scripts/**` byte, and no full-file rewrite):** the `U-STORE-SECURITY-WRITE` (3a) DONE row at the head of `docs/next-steps.md`'s CURRENT WORK region (above the `U-STORE-PERSIST-ADOPT` block, which is KEPT verbatim) · the ACTIVE row `DECIDED: U-STORE-SECURITY-WRITE-LANDED-2026-10-04` (`docs/decisions.md`) · the third F2-program-progress dated row (`docs/pending.md`; the PENDING-REBUILD lanes stay PENDING) · **the `O-5` obligation: the dated `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` annotation (`docs/defects.md`)** · the dated `docs/HANDOFF.md` note (**no package defect found in 3a: the adopted modules are byte-frozen and untouched, the atomic shape is the fork's own, and the earlier export-gap entries STAND**) · this block · the greens artifact's annotate-beside for its bare `S21 FAIL` (`docs/specs/unit-store-security-write-greens.md`; discharging the gate-8 `DR-7`) · and the contract `docs/specs/unit-store-security-write.md` §8's `O-`state annotation (discharging the gate-8 `DR-5`).

**WHAT IS NOT CLAIMED, RESTATED LAST SO IT IS THE READER'S PARTING LINE: the unit is NOT app-green, NOT envelope-green-as-app, NOT store-green, NOT live-green and NOT durability-green. Its live leg is `OPEN / live-pending` by NAMED park (the mechanism's invisibility to a DOM reading — the `fsync` legs cannot be driven to a real kernel-level fault from a DOM/CDP reading). `3b`'s contract does not exist yet and `3b` is not started; `3a` landed zero `src/renderer/**` byte.**

## CURRENT HANDOVER STATE (2026-10-04, U-STORE-PERSIST-ADOPT LANDED) — F2 UNIT 2 (`core`) IS IN (FULL CYCLE, `1479e50` + REMAND `707e33a`); THE NEXT PICKUP IS F2 UNIT 3 `U-STORE-SECURITY-ADOPT`

**THE OBJECTIVE THIS PASS DISCHARGED: the gate-10 tracker pass for `U-STORE-PERSIST-ADOPT` (F2 unit 2 of 8, `core`)** — the unit's full cycle is CLOSED: **gates 1→10**, with **gate 6 a STRUCTURAL REFUSAL WHOSE LIVE BATTERY WAS DRIVEN, NOT PARKED** (`RCA-11` clause (b) NOT invoked — the unit authors no rendered surface, so no rendered-UI claim is owed, and `L-1`..`L-4` all PASS against the live app). **Gate 4 `PASS-WITH-FINDINGS`** (H-1..H-9; the two VACUOUS ORACLES REMANDED AND CLOSED by `707e33a` with falsifiability proofs; the read-only PBT audit: 11 rows adequate / 2 under-strength → both fixed by the remand). **Gate 5 blind-greens: 19 PASS / 2 FAIL** — both FAILs **DOC DRIFT** (the member-8 filed path vs the two landed paths; the tenth declaration member), **both reconciled at gate 7** (ledger rows `A-TW-6`/`A-TW-7`). **Gate 7 proofreader: ledger rows `A-TW-3..A-TW-9`.** **Gate 8 doc-review: `archive/reviews/2026-10-04-U-STORE-PERSIST-ADOPT-doc-review.md` — RECONCILED (51 cells clean).** **Gate 9 trio GREEN at `707e33a`:** full suite **136 files · 3067 passed | 22 skipped (3089) · 0 failed** · typecheck exit 0 · build exit 0; bundles `dist/renderer/renderer.js` **1,150,326** · `dist/main/main.cjs` **2,434,888** · `dist/main/preload.cjs` **20,710**; drift **CLEAN, pin arm EQUAL**. **Its DONE row is the newest insert at the head of `docs/next-steps.md`'s CURRENT WORK region**, carrying the two commits, the nine members + the ONE admitted declaration home, the red→green→re-aim→remand trajectory (**17 failing / 12 passed (29) at the pre-edit head — the only red files being this unit's two, full suite `2 failed | 134 passed` → 26/29 → the `A-TW-1`/`A-TW-2` rulings → the author-role re-aim → 29/29 → the gate-4 remand → 29/29 with falsifiability proofs**), the register (**13 rows HELD, `108` terms, seed `0x20261004`, caps ≤100/≤400, stoppedAt null, counterexamples 0; `RED-BY-SHIM` ×9 / `RED-BY-ABSENCE` ×4**), unit 1's post-amendment pins (**26/26, `P-STORE-CORE-H` held, `78` terms unmoved**), the C-1 amendment, the `md5` re-statement (`f24ea717a5f8f93a3ac490334611d22a`, **re-taken and confirmed**), the live battery (**`L-1`..`L-4` PASS, `L-3` ORDER-ONLY with NO timing figure**) and the **layer declaration: `[T]`/`[H]` + the ONE `[U]` boot-round-trip leg — NEVER a durability claim** (`RCA-12`).

**THE PICKUPS FOR A FRESH SUPERVISOR, IN ORDER:**
1. **F2 unit 3 — `U-STORE-SECURITY-ADOPT`** (the user's next wave unit, prepared) per `docs/specs/store-adoption-program.md`, then **FOCUS / MODULES / PANE-DRAG / READS / LANES**. **THE TWO NAMED SUCCESSORS CARRY THEIR OWN GATE-1 AND ARE NOT PART OF UNIT 2: `U-STORE-MODULES-MIGRATION`** (the `Q-5` migration: the array→keyed payload change, BOTH writer classes incl. `src/main/mcp-server.ts`, the reserved-namespace arming, the one-boot window, the module suites' re-statement) **and `U-OPERATOR-SETTINGS-REHOME`** (the 7 renderer call sites + 2 landed suites + the file's `md5` row, which is ALSO the `UNRESTATED_CONTROL_PATH`).
2. **The tracker O-rows** (each with its named owner, restated at this head): **O-1** SC-8/SC-9 fired-revisit + the two zone-gesture defect dispositions → `U-STORE-PANE-DRAG-ADOPT`'s tracker pass · **O-2** H3/H-r6 re-route → `U-STORE-READS-RE-ROUTE` · **O-3** HOST-PERSISTENCE re-annotation → **DISCHARGED BY THIS PASS** (`docs/defects.md`'s dated annotation closes ONLY the carrier-existence question and names the open clauses; the row stays OPEN/owner HOST/MED — see the note below) · **O-4** E-10/E-11 (the manifest's `baselines` cells + the per-module `provenance` wording) → **STILL OWED** to the supervisor's manifest/tracker pass · **O-6** the upstream full-suite reading at `7bd1de4` → a shell-bearing pass (the foundation's own ledger — a RECORDED READING, never fork-conformance evidence).
3. **THE DIGEST CELLS ARE DISCHARGED WITH THE VALUES MEASURED AT THIS HEAD** (instrument `md5sum`/`sha256sum`; this pass's re-take AGREES with the supervisor's reading): contract `docs/specs/unit-store-persist-adopt.md` **`1d5418de28b18b471d619c601b4b918d`** (352 lines) / sha256 `93dd86e1effe873da205600503e647885f2865a038d7e631a9769c3f35b6a44d` · review **`82585c2c0d8ba66a7883b933b3988bdc`** · dossier **`c4cfec62f77afc6bab72c2006979128a`** · greens **`3b2458d08b9d9c9753622a753e863dab`** · live battery **`b1109b7525ac5fa07c8fe1b315bbd95f`** · `src/main/preload.ts` **`f24ea717a5f8f93a3ac490334611d22a`** (the re-stated `md5` row confirms). **STILL OWED: the E-10/E-11 items (above) and the upstream full-suite reading item (`O-6`).**

**WHAT THIS PASS WROTE (the six tracker files ONLY — additive/annotate-beside, `RCA-8(c)`; NO `src/**`, `tests/**`, `vendor/**`, `scripts/**`, and no unit-spec or program-plan byte):** the `U-STORE-PERSIST-ADOPT` DONE row at the head of `docs/next-steps.md`'s CURRENT WORK region (above the unit-1 block, which is KEPT verbatim) · the ACTIVE row `DECIDED: U-STORE-PERSIST-ADOPT-LANDED-2026-10-04` (`docs/decisions.md`) · the second F2-program-progress dated row (`docs/pending.md`; the PENDING-REBUILD lanes stay PENDING) · **the `O-2` obligation: the dated `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` annotation (`docs/defects.md`)** — **NO live-battery or doc-drift item was filed as a defect-class row, because none is one: the greens' 2 FAILs were DOC DRIFT (fixed at gate 7) and the live battery is GREEN (`L-1`..`L-4` PASS)** · the dated no-package-defect note (`docs/HANDOFF.md`; the earlier export-gap entries stand) · this current-state section. **⟨SUPERSEDED-IN-PART NOTE (`RCA-8(c)`, annotate-beside): the `U-STORE-CORE-ADOPT` section below is KEPT VERBATIM; its *"the next pickup is F2 unit 2 `U-STORE-PERSIST-ADOPT`"* framing is HISTORICAL at this head — that unit is now LANDED.⟩** **NOTHING IN THIS SECTION IS ENVELOPE-GREEN, STORE-GREEN, ENGINE-GREEN OR A DURABILITY CLAIM: `U-STORE-PERSIST-ADOPT`'s layer is `[T]`/`[H]` machine/wiring evidence PLUS the ONE `[U]` boot-round-trip leg — and the standing trap still holds: re-measure HEAD before reporting.**

## CURRENT HANDOVER STATE (2026-10-04, U-STORE-CORE-ADOPT LANDED) — F2 UNIT 1 IS IN (FULL CYCLE, ONE ATOMIC COMMIT `83e36bf`); THE NEXT PICKUP IS F2 UNIT 2 `U-STORE-PERSIST-ADOPT`

**THE OBJECTIVE THIS PASS DISCHARGED: the gate-10 tracker pass for `U-STORE-CORE-ADOPT` (F2 unit 1 of 8)** — the unit's full cycle is CLOSED: **gates 1→5 and 7→10**, with **gate 6 STRUCTURALLY REFUSED** (no rendered surface — the store is not a rendered surface per `docs/specs/store-adoption-program.md` §5; a live battery is NOT owed, never a park-as-default), **gate 4 `PASS-WITH-FINDINGS`** (the MAJOR 1-3 doc drifts FIXED at gate 7; the §13 ledger records; the PBT audit 12× adequate), **gate 5 blind greens 14 PASS / 0 FAIL**, **gate 7 proofreader**, **gate 8 doc-review RECONCILED** (`archive/reviews/2026-10-04-U-STORE-CORE-ADOPT-doc-review.md`; DR-1 bundle-size discharged here), **gate 9 trio GREEN** (134 files / 3038 passed | 22 skipped / 0 failed; typecheck 0; build 0). Its DONE row is the newest insert at the head of `docs/next-steps.md`'s CURRENT WORK region, carrying the ONE atomic commit `83e36bf…` (5 files / 5114 insertions), the five members, the E-2 digests (the three sha256s + the two md5s + the span re-record), the red set → repair → green readings (17 red → 26 green), the register per-row report (12 rows HELD, 78 terms, seed `0x20261004`, stoppedAt null, counterexamples 0), the `getWiredGraphStore` seam + the closed declared-roots set `{settings}`, the bundle-size reading (+65,052 → 1,149,795 bytes) and the layer declaration: **`[T]`/`[H]` machine/wiring evidence only — NEVER app/live-green** (`RCA-12`).

**THE PICKUPS FOR A FRESH SUPERVISOR, IN ORDER:**
1. **F2 unit 2 — `U-STORE-PERSIST-ADOPT`** per `docs/specs/store-adoption-program.md` (its named owners: the crossing feed + Y-1 hand-off + boot ORDER + Q-5 migration + the exactly-two-files pin), then **SECURITY / FOCUS / MODULES / PANE-DRAG / READS / LANES** — each unit runs its own gate-1 → spec → STEP-0 dossier → red → green → adversarial(PBT) → greens → item-10d cycle, `RCA-2`/`RCA-5`.
2. **The tracker O-rows** (each with its named owner): **O-1** SC-8/SC-9 fired-revisit + the two zone-gesture defect dispositions → `U-STORE-PANE-DRAG-ADOPT`'s tracker pass · **O-2** H3/H-r6 re-route → `U-STORE-READS-RE-ROUTE` · **O-3** HOST-PERSISTENCE re-annotation → `U-STORE-PERSIST-ADOPT`'s tracker half · **O-4** E-10/E-11 (the manifest's `baselines` cells + the per-module `provenance` wording) → **STILL OWED** to the supervisor's manifest/tracker pass · **O-6** the upstream full-suite reading at `7bd1de4` → a shell-bearing pass (the foundation's own ledger — a RECORDED READING, never fork-conformance evidence).

**WHAT THIS PASS WROTE (only the six tracker/docs files; NO `src/**`, `tests/**`, `vendor/**`, `scripts/**` or unit-spec byte):** the `U-STORE-CORE-ADOPT` DONE row at the head of `docs/next-steps.md`'s CURRENT WORK · the ACTIVE row `DECIDED: U-STORE-CORE-ADOPT-LANDED-2026-10-04` (`docs/decisions.md`) · the F2-program-progress dated row (`docs/pending.md`; the PENDING-REBUILD lanes stay PENDING — none flips until `U-STORE-LANES-RE-ROUTE`'s landed evidence per the program plan) · the `docs/defects.md` dated note on `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` (the adopted store does NOT supersede the host row) · the `docs/HANDOFF.md` dated note (NO package defect to hand off; the earlier export-gap entries stand) · this current-state section. **⟨SUPERSEDED-IN-PART NOTE (`RCA-8(c)`, annotate-beside): the F1 section below is KEPT VERBATIM; its "next pickup is F2 unit 1" framing is HISTORICAL at this head.⟩** **NOTHING IN THIS SECTION IS APP-GREEN, ENVELOPE-GREEN, STORE-GREEN, ENGINE-GREEN OR LIVE-GREEN — `U-STORE-CORE-ADOPT`'s layer is `[T]`/`[H]` machine/wiring evidence, and the standing trap still holds: re-measure HEAD before reporting.**

## CURRENT HANDOVER STATE (2026-10-04, F1 LANDED) — THE MECHANICAL RE-VENDOR IS IN; THE NEXT PICKUP IS F2 UNIT 1 `U-STORE-CORE-ADOPT`

**THE OBJECTIVE THIS PASS DISCHARGED: the F1 tracker pass (gate 10) for `FOUNDATION-REREVENDOR-2026-10-04` (F1)** — the unit's full cycle is CLOSED: **gates 1→5 and 7→10** with **gate 6 STRUCTURALLY REFUSED** (no UI surface — recorded, never a park-as-default) and **gate 4 `PASS-WITH-FINDINGS`** (6 INFO; the F-1/F-2 stale-prose items recorded). Its DONE row is the newest insert at the head of `docs/next-steps.md`'s CURRENT WORK region, carrying the seven members + member 7a (`123e279211f3c497b108d6873fa9016f5820d632`, ONE atomic commit; pin → `7bd1de4786c4d46a3fee02f72adaf6ef612985d1`, measuredAt `2026-10-04`), the red set named in full (the THIRD red NOW NAMED — register `§4 row 2 (G-3)` control), the register per-row report (`7/7 · 16/16 · 21/21`, seed `0x20260928`, `stoppedAt null`, caps ≤100/≤400), drift CLEAN with the PIN ARM EQUAL (`revisionChecked` true), the trio (`132 passed (132)` · `3012 | 22 skipped` · `0 failed`; typecheck 0; build 0) and the layer declaration: **`machine-data`/`[T]`/DOC — NEVER app/envelope/live-green** (`RCA-12`).

**THE PICKUPS FOR A FRESH SUPERVISOR, IN ORDER:**
1. **F2 unit 1 — `U-STORE-CORE-ADOPT`** per `docs/specs/store-adoption-program.md` (the eight-unit F2 plan: CORE → PERSIST → SECURITY → FOCUS → MODULES → PANE-DRAG → READS → LANES; each unit runs its own gate-1 → spec → STEP-0 dossier → red → green → adversarial(PBT) → greens → item-10d cycle, `RCA-2`/`RCA-5`).
2. **The tracker O-rows still open** (each with its named owner): **O-1** SC-8/SC-9 fired-revisit + the two zone-gesture defect dispositions → `U-STORE-PANE-DRAG-ADOPT`'s tracker pass · **O-2** H3/H-r6 re-route → `U-STORE-READS-RE-ROUTE` · **O-3** HOST-PERSISTENCE re-annotation → `U-STORE-PERSIST-ADOPT`'s tracker half · **O-4** E-10/E-11 (the manifest's `baselines` cells + the per-module `provenance` wording) → the supervisor's manifest/tracker pass · **O-5** F1 provenance — EXTENDED for `7bd1de4…` and VERIFIED AT THIS PASS (instrument `git ls-remote`: the recorded remote `https://github.com/LittleKingsguard/Provident-Electron` reads the new pin — the extension's question DISCHARGED-BY-MEASUREMENT; the underlying row's older-pin clauses stay the architect's; named open in `docs/pending.md`) · **O-6** the upstream full-suite reading at `7bd1de4` → a shell-bearing pass (the foundation's own ledger closes at 30 DONE / 0 open — a `RECORDED READING`, never fork-conformance evidence).

**WHAT THIS PASS WROTE (only the six tracker/docs files; NO `src/**`, `tests/**`, `vendor/**` or `scripts/**` byte):** the F1 DONE row at the head of `docs/next-steps.md`'s CURRENT WORK · the ACTIVE row `DECIDED: FOUNDATION-REREVENDOR-LANDED-2026-10-04` (`docs/decisions.md`) · the pending.md EXTENDED provenance row + the pin-supersession annotate · the `docs/defects.md` export-gap extension + the two zone-gesture dated annotations (upstream `d667917` observed; owned by the PANE-DRAG unit's tracker pass, NOT closed by F1) · the `docs/HANDOFF.md` extension entry `FOUNDATION-EXPORT-GAP-UNEXPORTED-STORE-INTERFACES`. **⟨SUPERSEDED-IN-PART NOTE (`RCA-8(c)`, annotate-beside): the ZONE-UNIT section below is KEPT VERBATIM; its *"the next pickup is the open disposals"* framing is HISTORICAL at this head — the next pickup is F2 unit 1, and the open disposals it names are carried by the O-rows above / the F2 plan's blocker register.⟩** **NOTHING IN THIS SECTION IS APP-GREEN, ENVELOPE-GREEN, STORE-GREEN, ENGINE-GREEN OR LIVE-GREEN — F1's layer is `machine-data`/`[T]`/DOC, and the two standing traps still hold: re-measure HEAD before reporting, and never 'fix' a `measuredAt` to match a filing date.**

---

## CURRENT HANDOVER STATE (2026-10-05, ZONE UNIT LANDED) — `U-ZONE-REPLACEMENT` / `PD-UI-14` IS IN, ITS LIVE LAYOUT-EFFECT LIMBS HOLD, AND THE NEXT PICKUP IS THE OPEN DISPOSALS

**THE OBJECTIVE THIS PASS DISCHARGED:** the zone/sidebar REPLACEMENT that ADOPTS the vendored foundation tooling instead of reimplementing it — the six adoption edges + the `container` declaration edge, the four zone containers' fixed/scroll-capable SHELL geometry, the four gutter affordances re-authored as envelope data **with real boxes**, the local duplicates removed/reduced, and the pane-drag/gutter gesture paths repaired. **Its DONE row is the newest insert in `docs/next-steps.md`'s CURRENT WORK region** and carries the red set, the two gate-4 rounds, the gate-5 blind greens, the `§7.2` live re-pin's verdicts, the declines, the digests and the owed list.

**BASELINE (measure it before you change anything):** `npx vitest run` → **`Test Files 132 passed (132)` · `Tests 3012 passed | 22 skipped (3034)` · `0 failed`**; `npm run typecheck` → 0; `npm run build` → 0; `npm run drift` → **`15 checks, 0 differences — CLEAN`** (pin arm EQUAL); `npm run divergence` → **`R13 RESULT: 9 checks, 0 failures`** (GREEN — so every UI unit's live set is MANDATORY, NOT parkable); `node --check scripts/live-drive.mjs` → 0. The unit's register reads **six rows HELD, `13+13+13+11+12+14 = 76`, seed `0x20261004`, no `stoppedAt`**.

**HEADS AND DIGESTS:** `docs/specs/unit-zone-replacement.md` **657** lines / `md5 8edf5d862059d404ecaaafce3cfb82dc` · `zone-replacement-adoption-dossier.md` **141** / `ed51d5166e2c6fbf75e2f30881c1a549` · `unit-zone-replacement-greens.md` **396** / `e2c77e45f29b5566397746af149bc9da` · `unit-pd-ui-12-slot-host-boundary.md` **748** / `dcc4b62c3595158275d138b3ad78a433` · `tests/unit-zone-replacement-register.test.ts` **3851** / `69929188962e1de3f3625989a8d706a7` · `tests/live-drive-contract.test.ts` **17112** / `7ae9f91ec6b20b72bda3c82b17543ea5` · `tests/pd-vendor-set.test.ts` **1443** / `e8f5cbea773735251e499265b2d0f285` · `tests/pd-ui-1-theme-register.test.ts` **1124** / `fe69075b3d475f9308281d211a7cd5bc` · `scripts/live-drive.mjs` **10206** / `fd59d3e183c0c79db0051ae5d2473f7c` · `src/renderer/index.html` **375** / `a6a587c216638960d38daca501225337` · `src/renderer/renderer.ts` **1482** / `e18aee8cfe7610619c185ef876753dde` · **HEAD `bb229da`** on `post-division-rebuild`, the unit's landing **UNCOMMITTED**.

**THE NEXT ACTIONS, IN ORDER:**
1. **The `MOCK-FIXTURE-DOCUMENT-ID-NOT-ROOT-PREFIXED` disposal** (`docs/defects.md`): the `core` mock set's documents import with **basename** ids (`alpha`/`beta`/`gamma`) while the live driver's carrier row names the old `.live-fixture/core/beta` identity, so `U-1` stays `NOT-DRIVEN`. **Two admissible shapes (root-prefix the import/materialisation route, or re-pin the carrier literals) — and a ONE-ROW-OVER HAZARD: the pin's `repin-completeness:document-ids` needle `.live-fixture/core/beta` is satisfied only by those old spellings and would go dead exactly as the docnav needle did.**
2. **The architect's open items** (each recorded with its question): the capture fix's assembled-layer OBSERVABLE (the `§5.U` matrix is full at 8) · `§3.2`'s alternate class/attribute vocabulary (the conservative one binds meanwhile) · the two declined compositions' later unit (the functional gutter, `§2.1(e)`) · `O-3` (`slot-host`'s later adoption) · `O-4` (the six over-lapping un-spec'd rows) · the pin's provenance reachability (`docs/pending.md`) · the class-(b) ledger mismatch (`docs/pending.md`).
3. **A full declared-set live run (`U-1`…`U-8`)** once item 1 lands — the unit's re-pin took limbs 1–3 on their carriers; `U-4`'s `FAIL` is the PRE-EXISTING `EMPTY mounts=2` stale-root reading marked `SUPERSEDED-BY-REPLACEMENT` (`R-5`), not this unit's.

**WHAT THIS UNIT'S GREEN DOES *NOT* PROVE (the layer ledger, `RCA-12`):** the node side proves the adoption wiring, the edge declarations, the duplicate removals, the declaration clauses and the vendored bytes' identity — **envelope/`[T]` evidence only**. The live limbs prove their own subjects: limb 1 a REAL in-zone rearrange leaving the sibling zones/stage rects unchanged with `#wiki-root` mounts at 1 and no stale childless root; limbs 2/3 the zones' and the stage's box GEOMETRY and scroll RANGES (**entered via a synthetic `scrollTop` seam — a geometry/range reading, NEVER operator-gesture evidence**, and limb 2's rect-pair half is a recorded DEGENERATE PAIR whose discriminating readings are `position`/`overflowY`/`scrollHeight`+`clientHeight`/`scrollTopAdvanced`). **The stage↔app-graph assembly beyond the mount sub-clause, the persistence round-trip, the affordances' paint against the real pointer, and the capture ORDER at the assembled layer remain unproven.**

**TRAPS (the earlier sections' traps all stand; these are the ones this pass added):**
- **An element-bound gesture dies when the app re-derives the element.** The pane path bound its session's tracking on the element while the app's own establishment REPLACES that element (`host.startPaneDrag` re-derives the layout graph — measured `doc-nav#1 → doc-nav#2` in the first moves) and held its capture on the discarded node: the drag looked alive (the reveal ran) and never completed. **Bind tracking on the document and resolve the capture target by IDENTITY at the claim.**
- **A positive target naming a never-authored selector is a dead pin.** The docnav row asserted `data-folder-label=".live-fixture/core"` while the app authors the LABEL there and the PATH in `data-folder-path` — the arm was green because the DRIVER spelled it, never because the app had it. **A pin that asserts the implementation's own text can be satisfied by the same mistake on both sides.**
- **A required value can be entailed by a no-op.** Limb 2's rect pair is unaffected by the page-level attempt because the fix's own CSS makes the page unscrollable; the discriminating readings are the COMPUTED properties and the range, not the pair.

**DOCUMENTATION-STALENESS NOTE (`AGENTS.md` item 3, done in this pass).** The baseline, digests, live verdicts and dispositions above are the CURRENT readings at `bb229da`. **Every earlier zone-unit reading is HISTORICAL** — including the Unit B close-out section below (its next-action framing), the `2026-10-05` pin-refresh section's baseline, the `2026-10-04` section's *"GATE 2 SATISFIED, RED SET AUTHORISED"*, the Wave-2/3 block and the `U-SHELL-N7` section. **AND THE TWO STANDING TRAPS: re-measure HEAD before reporting, and never 'fix' a `measuredAt` to match a filing date.**

---


## CURRENT HANDOVER STATE (2026-10-05, UNIT B CLOSE-OUT) — UNIT B IS **LANDED**; THE PIN IS REFRESHED AND GREEN; THE NEXT PICKUP IS THE ZONE/SIDEBAR REPLACEMENT PLUS THE OPEN ARCHITECT ITEMS

**THE OBJECTIVE THIS PASS DISCHARGED:** carry **UNIT B — `U-MOCK-CORPUS-FIXTURE-SETS`** from its authorised red set to close-out. **DONE**: the five hand-authored mock data sets + the `--fixture=<set>` arg with its four pre-spawn refusals + the three divergent per-declared-fixture probes + the run's fixture declaration/observation + the obsolete route's retirement + the **atomic cross-unit landing** (the declaration column-move, UNIT A's pin re-statement and UNIT A's `§6.2`/`§8.3` cells in ONE pass) + the unit's **third property register** — all landed; its DONE row is the newest insert in `docs/next-steps.md`'s CURRENT WORK region and carries the red set, the four gate-4 rounds, the gate-5/gate-6 dispositions, the amendments and the OWED list.

**BASELINE (the recorded green state at this handover — measure it before you change anything):** `npx vitest run` → **`Test Files 131 passed (131)` · `Tests 3003 passed | 22 skipped (3025)` · `0 failed`**; `npm run typecheck` → 0; `npm run build` → 0; `npm run drift` → **`15 checks, 0 differences — CLEAN`** (pin arm EQUAL); `node --check scripts/live-drive.mjs` → 0. The unit's register reads **`0 RED / 57 GREEN of 57`** with all four rows HELD (`17 + 12 + 11 + 27 = 67` declared / `57` executed, seed `0x20261005`, caps `≤100`/row · `≤400` · `≤8 rows`), and the two landed registers are byte-unmoved and HELD (`101`; UNIT A's `79`).

**HEADS AND DIGESTS (re-measured after the gate-7/8 passes):** `scripts/live-drive.mjs` **9681 lines** / `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `tests/live-drive-contract.test.ts` **17066 lines** / `md5 06240029c7e5f17bd29ccc636414503f` · `docs/specs/unit-mock-corpus-fixture-sets.md` **3367 lines** / `md5 67bceee3c5156132250368a1399eb130` · `docs/specs/unit-live-fixture-precondition-declaration.md` **1714 lines** / `md5 340d335ed8811fd6bbeabe8bd83f1be9` · `docs/specs/unit-mock-corpus-fixture-sets-greens.md` **578 lines** (gate 5) · `docs/specs/unit-mock-corpus-fixture-sets-live-battery.md` **418 lines** (gate 6) · `.gitignore` **156 lines** (the ONE added line `.live-fixture/`) · the pin's manifest `vendor/foundation.lock.json` pinned at **`93c058f69bd78fd1a80c96044e504deac4737ab3`** (`measuredAt 2026-09-30`) · **HEAD `f124358`** on `post-division-rebuild`, with the unit's landing UNCOMMITTED.

**THE NEXT ACTIONS, IN ORDER:**
1. **The zone/sidebar replacement unit** — `docs/specs/unit-zone-replacement.md` (**364** lines) + `zone-replacement-adoption-dossier.md` (**127**), its five rulings CONFIRMED and its `slot-host` request ANSWERED by the foundation (the container source is admissible; the ordering obligation is the only admissible decline reason). It is the adopting unit that owns the tab strip's document identity (see the defect below).
2. **The open ARCHITECT items** (each filed with its evidence): **(a) the `F7` class-(b) ledger mismatch** — `docs/pending.md` (DEFERRED): `§11.3`'s ten live readings vs the third register's `10×class-(b)` enumeration (two readings — two-supply-refusal, honesty — have no ledger entry; `FA-1`/`FA-2` are counted as readings instead of sub-limbs); the register HELDs because it reproduces its own enumeration. **(b) the pin's provenance reachability** — `docs/pending.md` (DEFERRED, gate-4 `F1` of the pin refresh): the pin is not reachable from its own recorded `remote`+`ref` (`ls-remote origin main` reads `d7b98b57…`, seven commits behind). **(c) the four items the earlier section lists** (the `slot-host` adopt-or-decline commitment, `PD-UI-7`/`PD-FOCUS-1`'s wave, the `PD-REGION-1` contradiction, `PD-OVERLAY-2`'s route).
3. **The live-side re-take owed to the adopting unit** — the tab-strip probe's `dom:` limb (`defects.md` `TAB-STRIP-TABS-CARRY-NO-DOCUMENT-ID`) and the app-side index gap (`VECTOR-IMPORT-NO-BODY-VECTORS`, re-annotated: the LEXICAL index does not escape it either).

**WHAT THIS PASS DID NOT DO, STATED SO A FRESH AGENT DOES NOT INHERIT A FALSE PICTURE:** no app/`src/**` change of any kind (the two gate-5 findings that needed one were RULED, not patched — the mock data was adapted instead, and the tab-strip limb is SKIPPED-BY-RULING); no engine work; no commit; the pane/tab/doc-nav/`o0_*` live ROW BATTERIES were not driven (exempt-later-unit); `scripts/live-drive.mjs` is in NO trio leg; and **no fixture-fed PASS is a live-corpus app reading**.

**TRAPS (the earlier section's five and two more stand; these are the ones this pass added):**
- **A green suite can hide a missing deliverable.** Two of this unit's four defects (the per-name census figure and the `FA-1`/`FA-2` route tag) were asserted by the CONTRACT and graded by NO arm — the suite was green while the behaviour was absent. When a contract asserts a figure, check that an arm grades THAT figure.
- **A probe can be structurally unsatisfiable.** Before trusting a live probe's subject, confirm the ATTRIBUTE/CONSTRUCT it reads exists on the surface it names (`dom:#tab-strip .tab[data-document-id]` never matched: the tab strip authors no such attribute). Where the surface awaits a later unit, SKIP WITH THE REASON — never engineer a pass.

**DOCUMENTATION-STALENESS NOTE (`AGENTS.md` item 3, done in this pass).** The baseline, digests, gate dispositions and rulings above are the CURRENT readings at `f124358`. **Every earlier UNIT B reading in this file is HISTORICAL and must not be quoted as current** — including the `2026-10-05` pin-refresh section below (its pin reading still stands; its UNIT B framing does not), the `2026-10-04` section's *"GATE 2 SATISFIED, RED SET AUTHORISED, NOTHING IMPLEMENTED"*, the Wave-2/3 block's `4613 pass + 58 skip`, and the `U-SHELL-N7` section's own pass state. **AND ONE THING THAT DID NOT CHANGE: the two standing traps from the pin refresh still hold — re-measure HEAD before reporting, and never 'fix' a `measuredAt` to match a filing date.**

---


## CURRENT HANDOVER STATE (2026-10-05) — THE FOUNDATION PIN IS REFRESHED AND GREEN; UNIT B IS STILL THE PICKUP AND ITS FIRST ACTION IS UNCHANGED

**Objective of this handover (UNCHANGED from the section below):** carry **UNIT B — `U-MOCK-CORPUS-FIXTURE-SETS`** from its **authorised red set** to **close-out**. Contract: `docs/specs/unit-mock-corpus-fixture-sets.md` (**2652 lines** · `md5 e859390d40f2c3c52903dad4e4a56e05` · **`sha256 bc824649f3e87242c1d0a87c4ca5faeb0f0bf456f2a4712cca68ea1dcd5acdb3`** — the OWED digest is now SUPPLIED by this pass's shell). The pickup detail (next actions in order, the figures, the rulings, the traps, the owed list) is the section IMMEDIATELY BELOW; nothing in it is re-stated here except what this pass CHANGED.

**WHAT THIS PASS CHANGED — ONE ACT, ONE UNIT** (`U-FOUNDATION-PIN-REFRESH-3`, its DONE row is the newest insert in `docs/next-steps.md`): the adjacent foundation tree advanced four **docs-only** commits (`ea285ac` · `cd7221d` · `b48b732` · `93c058f6` — the slot-host disposition + guide passes answering THIS project's ask), so the pin arm read EQUAL → UNEQUAL and the trio read red. The standing four-site restatement was executed: **five value lines across four files** — `vendor/foundation.lock.json`'s `foundation.commit` + its `digestCommand` literal, and `const PINNED_COMMIT` in `tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` — from `dd34e01148440f83b3f595919d865d05a2badbfe` to **`93c058f69bd78fd1a80c96044e504deac4737ab3`**. Premise re-derived by shell BEFORE the edit: **`15/15` module blobs MD5-identical** between the two revisions, all four intervening commits `docs/`-only, so no re-vendor decision was owed. `foundation.measuredAt` **DID NOT MOVE** (`2026-09-30`) — the run's machine-local `date` reading IS the day the manifest already records (`unit-foundation-pin-refresh-2.md` `§2.5` clause 2's legal non-move), and the register's `measuredAt` limb holds (manifest == the anchored `§4` region's last declared refresh reading). Gate 4 ran read-only: **`PASS-WITH-FINDINGS`** (`F1`..`F10`), the findings and their dispositions are in the DONE row and in `docs/decisions.md`'s new annotation row.

**CORRECTED BASELINE — MEASURE IT BEFORE YOU CHANGE ANYTHING (this pass's own runs, at HEAD `68e3b64` with the refresh landed):** `npx vitest run` → **`131 files passed (131)` · `2993 passed | 22 skipped (3015)` · `0 failed`**; `npm run typecheck` → 0; `npm run build` → 0; `npm run drift` → **`15 checks, 0 differences — CLEAN`**, its pin arm reading the tree's `rev-parse HEAD` as EQUAL; the four pin files alone → `4 passed (4)` · `162 passed` · `0 failed`. **THE BASELINE THE PREVIOUS SECTION RECORDS WAS TRUE WHEN TAKEN, THEN WENT RED (2 files / 3 tests, drift `FAIL — 1 PIN fault`) WHEN THE FOUNDATION MOVED, AND IS GREEN AGAIN AT THE SAME FIGURES AFTER THIS REFRESH** — the same three rows are named in the DONE row's red set.

**HEADS (re-measured at this handover, after the refresh):** `scripts/live-drive.mjs` **9109 lines / `md5 ff50498c3a20ad68d07985ab9c993758` / `sha256 2fc0c2d70201f9e9d8128fde31a4b7e15f3ba66754052851f9de52f5ff0e419a`** · `tests/live-drive-contract.test.ts` **11182 lines / `md5 519dd757a7e59ec1f95b856c90c82617` / `sha256 e4eff6e66ef06e52be38df9e8865208f9d3626abd0225a5294583d33edb15dd9`** (the ONE pin file all three unit registers live in — **UNMOVED by this pass**) · the pin's manifest `vendor/foundation.lock.json` **now pinned at `93c058f69bd78fd1a80c96044e504deac4737ab3`** (was `dd34e011…`) · `docs/specs/unit-zone-replacement.md` **364** + `zone-replacement-adoption-dossier.md` **127** (rulings CONFIRMED; do not re-open) · **HEAD `68e3b64`** on `post-division-rebuild` (was `0881558`), with the refresh and the unit-B filings UNCOMMITTED.

**TWO NEW SCARS FROM THIS PASS, ON TOP OF THE SECTION BELOW'S FIVE:**
- **The HEAD can move UNDER a running pass.** This pass's first reading was `0881558` with a `165`-entry uncommitted census; two minutes later the USER committed `68e3b64` (81 files, all under `archive/tests/**`), so the same repo read `68e3b64` / `92` entries. Re-measure `git log --oneline -1` and the porcelain census at the START of every pass **and immediately BEFORE you report a result**, and state the head your figures belong to — a figure quoted without its head is the `F-14` hazard in another dress. ⟨**GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-6`) OF `U-FOUNDATION-PIN-REFRESH-3`, `2026-10-05` — `RCA-8(c)`: the clause above is KEPT VERBATIM as this pass's reading; this is the dated note beside it, and the review record is `archive/reviews/2026-10-05-U-FOUNDATION-PIN-REFRESH-3-doc-review.md`.⟩** **RE-MEASURED BY READ, AT THIS HEAD, WITH THE INSTRUMENT NAMED (this review runs NO shell and NO leg):** `.git/HEAD` reads `ref: refs/heads/post-division-rebuild`; `.git/refs/heads/post-division-rebuild` reads **`68e3b6432e435395480287f85aca1a7c165cc16b`**; the reflog's newest entry is `0881558901fb6c5e28808490f3739b51345ea29c → 68e3b6432e435395480287f85aca1a7c165cc16b` with the message *"Obsoleted previous test battery and cleaned harness for rebuild"*; and a `glob` census of `archive/tests/2026-10-04-*.test.ts` enumerates exactly **`81`** files, matching the `81 files, all under `archive/tests/**`* clause above. **WHAT IS `RECORDED READING` AND NOT RE-VERIFIED HERE, NAMED SO IT IS NOT QUOTED AS MEASURED: (a) the `165` → `92` porcelain census — a working-tree INDEX census, unreadable without a shell** (the review's wall holds no `bash`/`git` tool); **(b) `"the refresh and the unit-B filings UNCOMMITTED"` in the HEADS paragraph above — CONSISTENT with the tracked files carrying the new literal and with what this pass was told, but NOT re-taken here; (c) every trio figure in the CORRECTED BASELINE paragraph (`131 files passed (131)` · `2993 passed | 22 skipped (3015)` · `0 failed` · `drift` `15 checks, 0 differences` · the four pin files `4 passed (4)` · `162 passed`) — all `RECORDED READING; measurer: the refresh pass`.** **ONE MORE STALE CLAIM OF THIS SESSION, CORRECTED BESIDE ITSELF IN THE SAME PASS: this file's own `2026-10-04` DOCUMENTATION-STALENESS NOTE below still reads *"the pin-refresh unit landed (five value lines, pin now `dd34e011…`)"* and *"81 fork suites were archived"* — the pin literal is TWO refreshes stale (`93c058f6…` now) and the archive count is a `2026-10-04` reading; the section's superseded-in-part block above already covers both, and this note makes it explicit rather than implied.**

  **AND THE LAYER IS RESTATED BECAUSE THIS FILE IS THE PICKUP DOCUMENT, NOT AN EVIDENCE DOCUMENT (`RCA-12`): `U-FOUNDATION-PIN-REFRESH-3` is `[T]`/`[D]` MACHINE-DATA + PROVENANCE ONLY — its green is that this repo states ONE revision in five value lines and that the recorded revision's blobs equal the vendored bytes (`15/15`, `RECORDED READING`). It proves NOTHING about the app, the renderer, the envelope graph, the store, the shell or the live corpus, and NO figure in the CURRENT section above may be promoted into app evidence. THE THREE UNDISCHARGED ITEMS STAND AS THE OWED PARAGRAPH ABOVE STATES THEM: `F1` (architect) · `R-2`'s "one commit" limb (`RCA-8(a)`) · the standing `O-2` `baselines`/`provenance` cells — none is discharged by the refresh's green and none may be reported as discharged.**
- **TWO CLOCKS: the tree's FILINGS are dated ahead of the machine clock.** The docs filed in this session carry `2026-10-04`/`2026-10-05` while `date` reads `2026-09-30`; `foundation.measuredAt` takes the **MACHINE-LOCAL** day (that is the contract's rule, and `U-FOUNDATION-PIN-REFRESH-2`'s own landing did the same: docs `2026-10-04`, `measuredAt` `2026-09-30`). Never *fix* a `measuredAt` to match a filing date — moving it forces a re-anchoring clause in the register's anchored `§4` region in the SAME landing, or a third red appears (`F-15`).

**OWED, AND NOT UNIT B's** (the section below's list STANDS and is not repeated here) **— plus these three from this pass:** **(1) `F1` (architect, filed in `docs/pending.md` DEFERRED): the pin is NOT reachable from its own recorded provenance** — `git -C ../Provident-Electron ls-remote origin main` reads `d7b98b57…`, SEVEN commits behind the local tree at the pin, so a fresh clone at the recorded `remote`+`ref` would fail the pin arm for a locally-correct pin; the three routes (push · pin `origin/main` · record a local-only provenance statement) are the architect's call, and no local reading is affected. **(2) `R-2`'s *"ONE commit"* limb is UN-DISCHARGED** — the refresh sits in the working tree because this pass's instruction is not to commit; `RCA-8(a)`'s commit-per-gate is owed to the next commit act. **(3) the standing `O-2` `baselines`/`provenance` cells** in the manifest remain UNDISCHARGED (and are NOT to be reported as discharged).

**DOCUMENTATION-STALENESS NOTE (`AGENTS.md` item 3, done in this pass).** The baseline, the head hashes, the digests and the pin reading above are the CURRENT readings, taken after the refresh at `68e3b64`. **Everything the section below records about `HEAD 0881558`, *"nothing was committed this session"*, and the pin literal `dd34e011…` is HISTORICAL and must not be quoted as current**; so is the Wave-2/3 block's `4613 pass + 58 skip`, the `U-SHELL-N7` section's own pass state, and the pin-ledger annotations in `docs/decisions.md` that name `dd34e011…` as *the* pin (each now has an annotate-beside note). ⟨**ATTRIBUTION CORRECTED BESIDE ITSELF `2026-10-05` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-6`) OF `U-FOUNDATION-PIN-REFRESH-3` — `RCA-8(c)`: the clause is KEPT VERBATIM; this is the dated note beside it, and the review record is `archive/reviews/2026-10-05-U-FOUNDATION-PIN-REFRESH-3-doc-review.md`.⟩** **THE ANNOTATE-BESIDE NOTES ON THE `docs/decisions.md` PIN-LEDGER ROWS WERE ADDED BY THIS DOCUMENTATION REVIEW, NOT BY THE PASS THAT WROTE THIS SENTENCE — at this head the ledger rows `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY` and `DECIDED: FOUNDATION-PIN-FAULT-ORDERED-REFRESH-2026-09-29` still read `dd34e011…` as *the* pin in their own present tense and now have dated corrections beside them (`VERIFIED-BY-READ` this pass). That pass annotated the pin-ledger note at the HEAD of `§ACTIVE` and its own new annotation row; the OLDER ledger rows were this review's to reconcile (`AGENTS.md` item 10d).** **SO THIS SENTENCE'S PARENTHETICAL IS TRUE ONLY AS OF THIS REVIEW, not as of the pass that wrote it — a distinction worth recording, because it otherwise reads as a duty completed by a pass that did not perform it.** Within this pass: the pin refresh landed (five value lines), the gate-7/8 annotations of the superseded pin claims landed, the `docs/pending.md` `F1` escalation was filed, and the unit-B contract's OWED digest was supplied. **AND ONE THING THAT DID NOT CHANGE: the first action is still `role_test_writer` for Unit B's red set, and the one thing that must not be split is still the atomic cross-unit landing (`§17.1`).**

---


> **⟶ SUPERSEDED `2026-10-05` (the UNIT B close-out pass, `RCA-8(c)`, annotate-beside — the section below is KEPT VERBATIM as its pass's reading):** its *"GATE 2 SATISFIED, RED SET AUTHORISED, NOTHING IMPLEMENTED"* state, its contract reading (`2652` lines, `e859390d…`/`bc8246…`), its *"next action = `role_test_writer`"* and its *"nothing was committed this session"* are all HISTORICAL: the unit is LANDED (its DONE row heads `docs/next-steps.md`), the contract is `3367` lines / `md5 67bceee3c5156132250368a1399eb130`, and the USER committed twice under the session (`68e3b64`, `f124358`). The FIGURES it lists to assert, the RULINGS to cite, the TRAPS and the OWED list all STAND and are still worth reading — the two behaviour findings its gate-5 successors produced were RULED, not patched.

## CURRENT HANDOVER STATE (2026-10-04) — UNIT B IS AT **GATE 2 SATISFIED, RED SET AUTHORISED, NOTHING IMPLEMENTED**

**Objective of this handover:** carry **UNIT B — `U-MOCK-CORPUS-FIXTURE-SETS`** (the hand-authored mock DATA SETS + the `--fixture=` selection arg + the divergent per-declared-fixture probes + the obsolete route's disposition + the run's fixture declaration) from its **authorised red set** to **close-out**. Contract: `docs/specs/unit-mock-corpus-fixture-sets.md` (**2652 lines**; `sha256` OWED — a shell pass takes it). Everything below is the state a fresh agent needs; the tracker head is `docs/next-steps.md`'s CURRENT WORK region, whose **newest insert is the tab-ownership ruling and the one below it is the gate-2 disposition that authorises the red set**.

**BASELINE — the recorded green state of this pass (measure it before you change anything):** `npx vitest run` → **`131 files passed (131)` · `2993 passed | 22 skipped (3015)` · `0 failed`**; `npm run typecheck` → 0; `npm run build` → 0; `npm run drift` → **CLEAN** with its pin arm reading the tree's `rev-parse HEAD` as EQUAL; **the branch's REQUIRED red set is EMPTY** (the two foundation-pin reds are green; the fork-specific UI/engine suites are EXEMPT and ARCHIVED). Branch `post-division-rebuild`, HEAD **`0881558`**, with a large **UNCOMMITTED** working tree (nothing was committed this session — do not commit unless asked).

**HEADS (measured at this handover):** `scripts/live-drive.mjs` **9109 lines / `md5 ff50498c3a20ad68d07985ab9c993758`** · `tests/live-drive-contract.test.ts` **11182 lines / `md5 519dd757a7e59ec1f95b856c90c82617`** (the ONE pin file three unit registers live in) · the pin's manifest `vendor/foundation.lock.json` pinned at **`dd34e01148440f83b3f595919d865d05a2badbfe`** · `docs/specs/unit-live-fixture-precondition-declaration.md` (UNIT A, landed) · `docs/specs/unit-zone-replacement.md` **364** + `zone-replacement-adoption-dossier.md` **127** (their rulings are CONFIRMED; do not re-open them while finishing Unit B).

**THE NEXT ACTIONS, IN ORDER — do not reorder them:**
1. **`role_test_writer` → UNIT B's RED SET**, in `tests/live-drive-contract.test.ts`. It is the unit's **THIRD register** (**4 rows: `P-IM-6` 17 · `P-SM-5` 12 · `P-TP-4` 11 · `P-TP-5` 27 = `67` declared, executed `57`, seed `0x20261005`**, caps `≤100`/row · `≤400` · `≤8` rows). **The two landed registers must stay byte-untouched and green** (`0x20260929`, 7 rows, `101`; and UNIT A's `0x20261002`, 4 rows, `79`). Arms: set identity + content shape; the arg's grammar, FOUR refusals (empty/unknown/malformed/conflicting repeat) and precedence; the divergent-probe arms INCLUDING the `F-2` falsifier and the `'rag.query'` limb with its **cross-run falsifier**; the `read`-sentinel equalities; the run-declaration arms; the honesty-clause arm; the root-resolver arm; the obsolete-route arm; the observation-member arm; the `probe-population` direction-1 mutation. **ONE NAMED DIVERGENCE IS YOURS TO TAKE OR DECLINE:** making `print-site:observation-members` a fourth arm re-derives `4×print-site`, `P-TP-4 12`, total `68` / executed `58` — otherwise it rides as a sub-limb.
2. **THE ATOMIC CROSS-UNIT LANDING (`§17.1` — the unit's single most important discipline).** The declaration column-move (`u_edit_1_live_package_table_limitation` → `corpusRead:true, selfProvisioning:false, fixtureName:'corpus-documents'`), **UNIT A's own pin re-statement**, and UNIT B's arms land **IN ONE PASS**. A landing that moves the declaration but not UNIT A's documents is a **`CONTRADICTION` that NO arm catches**: UNIT A's `§6.2` *"GATED = 34"* cell and its `§8.3` item 1 readings (`P/34`, `34 − P`) stay filed as live, the pin's `A-8` limb 2 evaluates only `UF_FIXTURE_STATE` as pure data, and **every `34` in the tree is a COMMENT, not an assertion.**
3. **`role_implementer`** → the sets, the arg, the probes, the root resolver, the run declaration, the obsolete-route retirement.
4. **Gate 4** (read-only adversarial + the PBT audit) → **gates 5/6** (blind greens + a **LIVE battery run PER SET** on isolated ports, quoting the fixture state and the park split) → **gates 7/8** → **trio** → **DONE row** → trackers.

**THE FIGURES YOU WILL ASSERT (from the contract's own re-derived table):** the gated population is **`35 = 47 − 3 − 9`**, named **`corpus-documents` 25 · `corpus-query-results` 3 · `corpus-document-tabs` 1**, with `self-provisioned-document` and `none` never gated; the sets are **`core | table | search | tabs | empty`** with a NEUTRAL default (omitted ⇒ nothing materialised); the probe `read` literals are **`'rag.list_documents'` · `'rag.query'` (the `corpus-query-results` limb) · `'dom:#tab-strip .tab[data-document-id]'` · `null` · `null`**; the park member is **`parkedByFixtureAbsence`** printed as **`parked-by-fixture-absence=`**; the `stage_*` family is **eight** and `o0_*` **five**; and the not-materialised string is exactly **`no SET was materialised`**.

**RULINGS ALREADY MADE — cite them, never re-derive them:** the tab-ownership row (**the tab owns the payload; the stage hosts the focused tab's data; document-information panes read the STAGE's reference; panes/zones are otherwise tab-independent** — it validates the `corpus-document-tabs` probe's axis); the engine ruling (**engine status is irrelevant behind the mocks until the UI overhaul is done and the engine integration starts** — nothing gates on engine availability); the testing-scope amendment (**fork UI/engine implementations are EXEMPT and archived; REQUIRED = the harness + the mock corpus + foundation-tool existence/access**); the zone-replacement five rulings (CONFIRMED); `slot-host` (**the container source IS admissible; the ordering obligation is the only admissible decline reason**); UNIT A's and the pin unit's DONE rows.

**TRAPS — each learned the hard way in the session that produced this handover:**
- **The trackers' rows are single enormous lines that EXCEED the read tool's per-line ceiling.** Read them in slices, and prefer **index-based (`python`) edits over long literal anchors**: an earlier pass's long-anchor edit **truncated two ACTIVE rows of `docs/decisions.md`** and they had to be restored from the authoring text (git could not help — they were uncommitted).
- **Concurrent writers were active.** Check `md5sum` before and after any multi-step pass; several passes wrote the same files this session.
- **Live runs:** isolated `--port`/`--cdp-port`, **never `9222`** (a sibling process holds it and issues `pkill -f "electron ."`), `--disable-dev-shm-usage` + a scratch `--user-data-dir`; `--home` is now guarded and the ports refuse pre-spawn.
- **`archive/` is gitignored provenance:** archived suites are INPUTS and **cannot be re-run** (their relative imports break) — per-file rows came from before/after suite differences.
- **Spec conventions:** NO line numbers anywhere; every figure labelled `VERIFIED-BY-READ` (reader) / `RECORDED READING` (measurer) / `OWED`; **annotate-beside** (never rewrite a dated reading); `sha256` items belong to a shell-bearing pass.

**OWED, AND NOT UNIT B's — do not absorb them:** the pin unit's residuals (the manifest's `baselines`/`provenance` cells, the register reader's anchoring, the `tsconfig`-excludes-`tests/**` type-gate hole); the `GAP-8` owner-cell annotation (three named homes); the zone-replacement spec's annotation pointing at its CONFIRMED rulings; `PD-UI-12`'s `B-1` annotation (the contradicted "host file is not re-pointed" clause); and the four architect items still open (the `slot-host` adopt-or-decline commitment, `PD-UI-7`/`PD-FOCUS-1`'s wave, the `PD-REGION-1` contradiction, `PD-OVERLAY-2`'s route — whose park ground has changed).

**DOCUMENTATION-STALENESS NOTE (`AGENTS.md` item 3, done in this pass).** The baseline, the head hashes and the figure tables above are **the current readings**, taken/verified in this session. **Every earlier green quoted in this file is HISTORICAL and superseded** — e.g. the Wave-2/3 block below reads *"4613 pass + 58 skip"* (a 2026-09-14 reading) and the `U-SHELL-N7` section reads its own pass's state; both are kept verbatim as their passes' records and **must not be quoted as current**. Within this session: the pin-refresh unit landed (five value lines, pin now `dd34e011…`, its DONE row written), 81 fork suites were archived under the testing-scope amendment, UNIT A landed with its DONE row, the zone/sidebar replacement's contract + adoption dossier were filed with their five rulings CONFIRMED, and the `slot-host` feature request was answered by the foundation (no refusal recorded — the container source is admissible; the ordering obligation is the real constraint).

---

## CURRENT HANDOVER STATE (2026-09-13 — U-SHELL-N7 LANDED/COMPLETE)

> **Superseded (proofreader pass, 2026-09-13):** the U-SHELL-N7 host fix is now
> LANDED and CLOSED — the section below is the PRE-FIX handover record. See the
> updated `docs/specs/unit-u-shell-shell-wiring.md` (§3a/§3b: HOST-1..5 + ADV1..5),
> the `docs/next-steps.md` CURRENT WORK block, and this handover's §1/§5 rows
> (all now FIXED). `docs/defects.md` `HOST-SHELL-WIRING` → FIXED.

> **Later note (2026-09-15, user-flow-audit pass — doc review):** the U-SHELL-N7
> wiring was FURTHER superseded in one dimension. Defect **F-1
> PANE-BODY-GESTURE-SWALLOWED** (FIXED + LIVE-CONFIRMED, `docs/defects.md`) showed the
> `.pane-frame[data-pane-id]` frame-wide pane-drag surface (plus the immediate
> `setPointerCapture`) made every clickable row inside a pane body — and the pane
> header's own collapse toggle — inert to a real user. The delegated selector is now
> `'.gutter[data-zone], .pane-collapse-toggle'` with capture deferred past
> `PANE_DRAG_CAPTURE_THRESHOLD` (4px): see `docs/decisions.md`
> (PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE), `docs/specs/unit-u-shell-shell-wiring.md`
> §2 note 1, and `docs/specs/user-flow-audit-coverage-2026-09-15.md` §4 F-1. Any
> `.pane-frame[data-pane-id]` selector text below is the PRE-F-1 historical record.
> The current queue (F-2 first, then the uncovered drivable checklist rows) is the
> CURRENT WORK block in `docs/next-steps.md`; this handover file has no F-1/F-2/F-3
> rows yet, so it is provenance only for the audit pass.

**All Wave-2 OPEN items are RESOLVED/FIXED** (W2-N5/N7/N8/N9/N10/N11/N12/N13/
N14/N15) per `docs/specs/wave-2-open-decisions.md` §D status line. The last
uncommitted in-flight unit was **U-SHELL-N7** (`unit-u-shell-shell-wiring.md`,
W2-N7 — the shell pointer-wiring integration pass), now **LANDED/COMPLETE**: the
adversarial HOST-1..5 + re-audit ADV1..5 fixes shipped and the trio is green
(4527 pass / 58 skip). The detailed PRE-FIX handover record follows (the
superseded note above points to the post-fix records). Its gates were as follows.

**Adversarial review (RCA-3) — RUN, findings CONFIRMED REAL (2026-09-13):**
the wiring in `src/renderer/renderer.ts` `installShellPointers()` queries selectors
that match **NO authored DOM** — the core deliverable (C4/C7/C11/C12 reachable in
the live app) is **NOT met**, and the §2.8 source-string pin is a **false green**.
Verified in code: `paneSubtreeRoot` (src/renderer/pane-graph.ts) frame root props
are `{ id: \`pane-${def.id}\` }` with **no `data-pane-id`**; `index.html` authors only
`.layout .gutter` **CSS** (no `.gutter[data-zone]` element); `installShellPointers`
runs before `host.boot()`/each `rerenderAppGraph()` re-mounts the graph, so
boot-snapshot element listeners get orphaned. Findings to FIX (all host-side,
fix here, never package):
- **HOST-1 (HIGH):** dead selectors `.gutter[data-zone]` + `.pane-frame[data-pane-id]`.
- **HOST-2 (HIGH):** per-gesture `pointermove/up/cancel/dblclick` registered per
  `pointerdown` on the shared element, never removed → duplicate/spurious commits
  (a double-click → N `resetGutter` writes; a later gesture's stale handler re-commits
  an OLDER paneId).
- **HOST-3 (MEDIUM):** `isInteractiveControl(e.target)` inspects only the deepest
  node → a click on an interactive control's nested child (svg/span) is mis-routed
  as a drag start (F9 violation).
- **HOST-4 (MEDIUM):** a reveal-driven re-render re-mounts the graph mid-gesture,
  detaching the captured element (coupled with HOST-1's boot-snapshot wiring).
- **HOST-5 (LOW):** `toZoneBounds` coerces unknown `[data-zone]` to `'left'` → a
  malformed zone becomes a real drop target (fail-closed fix).

**Read-only PBT audit (2026-09-13):** all 8 register rows (P-IM-1/-2/-3, P-SM-1/-2,
P-TP-1/-2/-3) are **NOT over-strength** against the pinned helpers as driven. The
gaps are **generator-coverage**: P-IM-1 (out-of-rect points — the helper legitimately
returns a negative raw candidate), P-IM-2 (unknown-zone / non-object rect), P-SM-1
(degenerate/inverted rects), P-TP-1 (overlapping-rect FIRST-match — currently
unfalsifiable because the generator's zones are disjoint), P-TP-3 (random renumber
correctness on interleaved/out-of-range orders).

**Blind-greens (RCA-4) — RUN:  `archive/greens/2026-09-21-unit-u-shell-shell-wiring-greens.md` (historical; archived 2026-09-21; successor: the owning unit spec + the DONE row carrying the verification; archived basename unit-u-shell-shell-wiring-greens.md) =
35 PASS / 0 FAIL / 4 NOT-TESTABLE** (F5/F9/F11 need a live captured element / real
pointerdown target / a boot; the pure-module + source-pin surface is fully green).
The blind-greens does NOT exercise the live DOM, so it does not catch HOST-1.

### THE FIX (unstarted — do this first)
A TDD red→green cycle for the HOST-1..5 fixes + the PBT negative generators:
1. **TestWriter RED** — extend `src/shared/dom-shim.ts` minimally (add `querySelectorAll`
   for the concrete subset, a mount tree, element `getBoundingClientRect()`,
   `setPointerCapture/releasePointerCapture` no-ops, and a synthetic pointer-event
   dispatch helper), then write `archive/tests/2026-10-04-unit-u-shell-shell-wiring-adversarial.test.ts`
   pinning HOST-1..5 (must fail red against the current broken wiring) + the PBT
   negative-generator strategies (they may be partly green-on-arrival — coverage
   closures are fine). Do NOT touch `src/renderer/*` or index.html logic.
2. **Implementer GREEN** — rework `installShellPointers` to the fix shape:
   - author the four `.gutter[data-zone][data-axis]` chrome elements;
   - add `data-pane-id: def.id` to the frame root props in `paneSubtreeRoot`;
   - **document-level DELEGATED** `pointerdown` listeners using
     `e.target.closest('.gutter[data-zone], .pane-frame[data-pane-id]')`, applied
     after the graph renders and re-attached across `loadEnvelope` re-mounts
     (fixes HOST-1 + HOST-4); **[SUPERSEDED 2026-09-15 — the delegated selector is
     now `'.gutter[data-zone], .pane-collapse-toggle'` (defect F-1; see the note at
     the top of this file)]**
   - register move/up/cancel/dblclick ONCE or tear down per gesture
     (`removeEventListener` / `{once:true}` / AbortController) routing through a
     module-level active-gesture record (HOST-2);
   - ancestor climb in `isInteractiveControl` (`closest('button,input,a,select,
     textarea,[on:click],[on-click],[data-handler],[on:pointerdown]')`) (HOST-3);
   - skip non-`LayoutZoneName` `data-zone` values (HOST-5).
3. Re-run the adversarial pass (RCA-3) + the blind-greens (RCA-4) on the fixed wiring.

### REMAINING GATES (after the fix)
Proofreader → documentation review (RCA-6: reconcile `unit-u-shell-shell-wiring.md`
**top status block is STALE — it still says "No src/ or tests/ change in this pass
(spec-only…)"**, contradicting its own §5.7/§2.8; add the adversarial + doc-review
records) → live-scenario (shell DOM wiring is not node/MCP-testable without a running
app — park as a pending battery per gate 6) → **trio re-confirm** → tracker gate
(`docs/next-steps.md` U-SHELL-N7 **DONE row** — currently ABSENT; `docs/HANDOVER.md`
W2-N7 **line 166 still lists it PENDING**; reconcile `docs/defects.md` to record the
HOST-1..5 host finding as FIXED) → commit the whole uncommitted green batch.

### SUBAGENT-DELEGATION RELIABILITY (READ FIRST)
The `role_test_writer` subagent **failed 4× with no output** when given the large
shell-wiring fix task (3× in background, 1× in foreground), while a trivial foreground
probe succeeded. Suspected flaky infra on heavy read+write+vitest runs. **Mitigation:**
run the TestWriter in **foreground (`run_in_background: false`) with a SMALLER, single
concern per delegation** (e.g. shim+HOST-1..2, then PBT generators, separately), and
verify the files actually landed (`git status`) rather than trusting a pass/fail. The
`role_adversarial_reviewer` and `role_blind_test_writer` delegations in this session
**succeeded** in background.

---

## Older handover content (committed through U-SHELL-9b hardening; U-JR1 + PBT + W2-N11/N15 + shell-wiring are the newer uncommitted batch)

## 1. Status at a glance

| Wave-2 unit | State | Notes |
| --- | --- | --- |
| U-SHELL-1 (layout/zones/C9) | ✅ GREEN | keystone; all gates |
| U-SHELL-3 (collapse C5) | ✅ GREEN | |
| U-SHELL-4 (drag/relocate + C11 + C12) | ✅ GREEN | |
| U-SHELL-5 (gutters C7) | ✅ GREEN | shell wiring delivered by **U-SHELL-N7** (below) |
| U-SHELL-8 (View-menu visibility C13) | ✅ GREEN | |
| U-SHELL-9a (tab strip + focus tool C14) | ✅ GREEN | |
| U-STATE-1e (N-root reconcile + fork identity) | ✅ GREEN | unblocks 9b |
| **U-SHELL-9b (multi-doc + C20 + Option-C)** | ✅ **GREEN / COMPLETE (H1–H7 FIXED)** | blind-greens 23/0/0; W2-N15 FIXED; follow-ups AF3-3/AF1-2 (§4) |
| U-EDIT-2 (undo/redo + history C16) | ✅ GREEN | project-journal seam (§2.5); committed in `49079b9` |
| U-JR1 (host `provident.get_journal`) | ✅ **GREEN / DONE** | thin read over `Supervisor.journalEntries()`; `read` group; unit 35 + blind-greens 22/22; battery-host `journalEntries` HOST fix; live battery PARKED (running-app surface) |
| PBT backfill (props-*.test.ts) | ✅ **GREEN / uncommitted** | §5.7 registers + property layers for the UI pure modules |
| **U-SHELL-N7 (shell pointer-wiring, W2-N7)** | ✅ **GREEN / COMPLETE (2026-09-13)** | `installShellPointers` delegated wiring LANDED, closing HOST-1..5 + ADV1..5; four `.gutter[data-zone][data-axis]` authored + frame `data-pane-id` (`pane-graph.ts`); dom-shim extended (getters + delegated pointer dispatch + closest/setRect/setPointerCapture); trio 4527/58; tests 30 + 14 + 5 = 49; spec §3a/§3b; `docs/defects.md` HOST-SHELL-WIRING → FIXED |
| **U-SHELL-7 (settings modal, C3)** | ✅ **GREEN / COMPLETE (2026-09-14)** | `modal-state.ts` (NEW — pure `createModalController` + `installSettingsModal`) + the `main()` call after `installShellPointers` + the `index.html` shell chrome (frame/scrim/body/toggle + `.is-closed{display:none}` + SH7-ADV1 `pointer-events:auto`); hosts `#panes`+`#operator-panes` (re-parent only — isolation preserved); tests 40 (red 37); blind-greens 31/0/2; live battery PARKED; decisions `MODAL-SETTINGS-REPARENT` + `MODAL-DEDICATED-SCRIM` ACTIVE; trio 4566/58; spec §3c |
| **U-IMPORT-1 (File → Import… FS/browse, C17)** | ✅ **GREEN / COMPLETE (2026-09-14)** | `import-directory.ts` (NEW — `MAX_IMPORT_FILES=512` + the pure TOTAL `expandImportDirectory`/`buildImportDialogOptions`/`resolveImportSelection`) + the win/linux `Import…`+`Import folder…` two-item File menu + `openImportFolder` seam (`app-menu.ts`) + the `main.ts` Import flow (→ `buildImportDialogOptions`/`['openDirectory']` → `resolveImportSelection` → `importMarkdownCorpus` with the default-store `corpusRoot` + `IPC_IMPORT_RESULT`/`IPC_RAG_STORE_CHANGED` broadcasts) + `IPC_IMPORT_RESULT`/`ImportResultPayload` (`types.ts`); tests 47 (red 43; +4 ADV pins); blind-greens 36/0/5; live battery PARKED; decisions `IMPORT-NO-SYMLINK-FOLLOW` + `IMPORT-FILE-COUNT-CAP` + `IMPORT-RESULT-BROADCAST` ACTIVE; trio 4613/58; spec §3c |

**Wave 3 COMPLETE (2026-09-14):** both Wave-3 units — **U-SHELL-7 (settings modal C3)** and **U-IMPORT-1 (File → Import… FS/browse C17)** — are GREEN / COMPLETE — the UI-overhaul (C1–C20 wave decomposition) is all-LANDED. No remaining Wave-3 item. The two live-scenario batteries stay PARKED artifacts (running-app + UI/OS-dialog driver surface), documented in their `...live-pending-battery.md` files.

---

## 2. What was done this session

- **U-EDIT-2 (C16 undo/redo + history sub-pane) LANDED (2026-09-13):** the
  project-journal host seam (§2.5: `IPC_RAG_JOURNAL`/`IPC_RAG_JOURNAL_OP` +
  `bridge.rag.journal`/`journalOp`), the app-graph Undo/Redo toolbar controls
  (disabled from the project-journal depths) and the `pane-history` sub-pane
  with click-to-undo-to-point. Doc-review:
  `archive/reviews/2026-09-13-unit-u-edit-2-doc-review.md`. Trio 187/4362.
- **9b doc finding closed:** `HOST/U1-ENG` (boolean attributes) is **RESOLVED
  upstream** (`BOOLEAN-ATTRS`, present in `provident-ssr@0.5.0`); it moved to the
  RESOLVED table in `docs/HANDOFF.md` + `docs/defects.md`. This is what lets
  U-EDIT-2 author `disabled: undoDepth <= 0` correctly.
- **U-SHELL-9b H3/W2-N12 FIXED (2026-09-13; see §4 item 1):** the per-document
  id namespace (ratified scheme: scope `props.id`, keep `data-rag-node-id`
  plain). Delegated TestWriter→Implementer cycle + my adversarial pass (AF3-1
  separator collision found + fixed). `archive/tests/2026-10-04-unit-u-shell-9b-h3-doc-namespace.test.ts`
  13/13.
- **U-SHELL-9b H1/W2-N13 FIXED (2026-09-13; see §4 item 2):** Option-C commit
  interception + confirmation strip/checklist + fork/mutate-all/cancel via the
  atomic `edit.batch`; adversarial AF1-1 (fork dropped the pending edit) fixed.
  `archive/tests/2026-10-04-unit-u-shell-9b-h1-optionc-interception.test.ts` 15/15.
- **U-SHELL-9b H2/W2-N14 + H7 FIXED (2026-09-13; see §4 item 3):** C20
  materialization (`buildOwnersMap` + the `decorateShared` seam) + the
  `toggleOwnersBox` bridge install. `archive/tests/2026-10-04-unit-u-shell-9b-h2-c20-materialization.test.ts`
  14/14.
- **U-SHELL-9b hardening H4/H5/H6 FIXED (2026-09-13; see §4 item 4):** a
  standalone red→green→adversarial→doc-review cycle on the pure
  `cross-document-shared.ts` module (dedupe, totality, fork validation). +8
  regression tests.
- **Trio after H1–H7: 185 files / 4327 pass + 58 skip, typecheck 0, build 0.**
  **U-SHELL-9b is GREEN** (blind-greens  `archive/greens/2026-09-21-unit-u-shell-9b-greens.md` (historical; archived 2026-09-21; successor: the owning unit spec + the DONE row carrying the verification; archived basename unit-u-shell-9b-greens.md)
  23/0/0; then W2-N15 FIXED per §2.10). Remaining follow-ups: AF3-3/AF1-2 only.
- **Wave-2 spec resolution:** W2-Q1…Q17 all RESOLVED; the elaborated §E/§F in
  `wave-2-open-decisions.md`; the U-SHELL-9 split into **9a/9b**; new
  **U-STATE-1e** spec (label collision with the landed `1d` re-anchor resolved).
- **Package upgrade:** `provident-ssr@^0.5.0` (ships `Supervisor.journalEntries(opts?):
  JournalView` — sanitized `{index,kind,status}` + depths/windowing). Resolves
  `ENG-JOURNAL-ENTRY-READ-API`; upgrade verified clean.
- **Journal rulings:** `DECIDED: JOURNAL-READ-VIA-PACKAGE` (0.5.0 landed) +
  `DECIDED: C16-CONSUMES-PROJECT-JOURNAL` (the history sub-pane reads the RAG
  project journal, NOT the engine journal); **U-JR1 re-authored** as a thin
  renderer-routed read.
- **Wave-2 fixes:** W2-N1/N2/N3/N4/N6 (host boot/write-through, `ZoneLayout.size`
  application, operator-pane grid rule, pin-5 clamp, `is-empty` semantics) all
  FIXED with regression tests.
- **Seven units driven through the full gate** (red → green → trio → adversarial
  → fixes → blind-greens → doc-review), each with an archive record under
  `archive/reviews/2026-09-12-<unit>-doc-review.md`.

---

## 3. Implemented surfaces (key files)

- `src/renderer/layout-state.ts` — `LayoutState` + `coerceLayout`/`defaultLayout`/
  `deriveLayout` + `layoutCssVars`/`applyLayoutToRoot`; `LAYOUT_ZONE_MIN/MAX`.
- `src/renderer/pane-graph.ts` — multi-zone `zone:*` producers, per-zone
  placement, `is-empty`/`is-minimized`/`is-revealed`/`is-collapsed` mirrors, the
  C12 tab strip, the collapse control (`pane-collapse-<id>`), `searchContent`.
- `src/renderer/pane-drag.ts` — `movePane`/`legalZonesForScope`/
  `withinSnapThreshold`/`zoneOrientation`/`setZoneMinimized`/`createDragController`
  (+ `insertionIndexForPoint`).
- `src/renderer/pane-gutter.ts` — `createGutterController` + clamp helpers.
- `src/renderer/tab-state.ts` — the `TabState` model (pure).
- `src/renderer/tab-strip.ts` — `TabStrip` (focus/close/reorder/new/search).
- `src/renderer/content-reconcile.ts` — `reconcileContentRoots` (1a, unchanged) +
  **`reconcileDocumentRoots`** (N-root, `ScopedRoot` buckets, `identityReplaced`).
- `src/renderer/cross-document-shared.ts` — C20 + Option-C **planner** (see §4).
- `src/renderer/sidebar-panes.ts` — host wiring: layout boot/write-through,
  `togglePaneCollapse`, gutter seams, pane-visibility (`applyPersistedPaneVisibility`/
  `syncZoneMirrors`), `mountTab`/`getTabContext`, `mountTabs`/`applyDocumentSet`.
- `src/renderer/renderer.ts` — `installLayout`, `TabStrip` construction + boot.
- `src/main/operator-settings-store.ts` / `src/shared/types.ts` — additive
  `OperatorSettings` slices: `layout`, `tabs`, `enabledOperatorPanes`,
  `panesInitialized`.
- `src/main/mcp-server.ts` / `src/main/security.ts` — `provident.focus`
  (`dispatch` group).
- `src/renderer/index.html` — the grid tracks (CSS vars), gutters, tab strip.

---

## 4. U-SHELL-9b — GREEN / COMPLETE (H1–H7 FIXED)

Spec `docs/specs/unit-u-shell-9b-cross-document-shared.md`; §2.6/§2.6b/§2.6c
record the adversarial findings. All six integration fixes (H1–H7) landed
2026-09-13, each as its own red→green→trio→adversarial cycle (RCA-2), then the
RCA-4 **blind-greens** re-run by an independent agent:
 `archive/greens/2026-09-21-unit-u-shell-9b-greens.md` (historical; archived 2026-09-21; successor: the owning unit spec + the DONE row carrying the verification; archived basename unit-u-shell-9b-greens.md) — **23 PASS / 0 FAIL / 0 NOT-TESTED**.
Remaining are the accepted AF3-3/AF1-2 follow-ups only (per-mount editing
context for a shared node).

1. **H3 first (id-namespace; W2-N12 — prerequisite): ✅ FIXED (2026-09-13, this
   session).** Per-document id namespace landed per spec §2.7
   (`scopeDocumentIds` scopes authored `props.id`, `data-rag-node-id` stays
   plain; `plainRagId` recovery; `applyDocumentSet` no longer cross-attributes
   siblings). `archive/tests/2026-10-04-unit-u-shell-9b-h3-doc-namespace.test.ts` 13/13. Adversarial
   separator hardening (AF3-1: `--` is legal in `sanitizeDocumentId`) fixed +
   regression-tested. **Residual W2-N15** (multi-doc `operator`/`template`
   re-derive does not re-scope) recorded. Doc-review:
   `archive/reviews/2026-09-13-unit-9b-h3-doc-review.md`.
2. **H1 (Option-C interception; W2-N13) — ✅ FIXED (2026-09-13, this session).**
   `interceptSharedCommit` wired into `textareaBlur` + `editorBlurCommit`; the
   provident-authored confirmation strip + >2-owner checklist
   (`sharedCommitStripContent`); `sharedCommitFork`/`sharedCommitMutateAll`/
   `sharedCommitCancel`/`sharedCommitToggleOwner` applied via the existing atomic
   `edit.batch` (`IPC_EDIT_BATCH`); F8 block / F7 rollback / F10b no-op handled.
   Spec §2.9. `archive/tests/2026-10-04-unit-u-shell-9b-h1-optionc-interception.test.ts` 15/15.
   Adversarial **AF1-1** (fork dropped the user's pending edit) found + fixed.
   Doc-review: `archive/reviews/2026-09-13-unit-9b-h1-doc-review.md`.
3. **H2 (C20 materialization; W2-N14) + H7 — ✅ FIXED (2026-09-13, this
   session).** `buildOwnersMap` + the ONE `SidebarPanes.decorateShared` seam
   (boot/refresh/mountTab/content-change/per-doc multi-mount) +
   `applySharedSubtreeDecoration(env, owners, collapsed)` + `toggleOwnersBox`
   registered on the bridge. Spec §2.8.
   `archive/tests/2026-10-04-unit-u-shell-9b-h2-c20-materialization.test.ts` 14/14. Doc-review:
   `archive/reviews/2026-09-13-unit-9b-h2-doc-review.md`.
4. **H4/H5/H6 (LOW/MED) — FIXED (2026-09-13, this session):** `ownersFor`
   de-dupes order-preserving (H5); `planFork` is total on malformed input /
   subtree / edge entries / `ownedNodeIds` / missing minters and rejects
   `root ∉ subtree` (H4); a fork must leave ≥1 original owner and non-owner
   migrate ids are ignored (H6). Regressions in the new "adversarial hardening"
   block of `archive/tests/2026-10-04-unit-u-shell-9b-cross-document-shared.test.ts` (37/37).
   **H7 FIXED in H2** — the owners-box toggle (`toggleOwnersBox`) is registered
   on the bridge in the H2 unit (spec §2.8). Doc-review:
   `archive/reviews/2026-09-13-unit-9b-hardening-doc-review.md`.

---

## 5. Open follow-ups (`docs/specs/wave-2-open-decisions.md` §D)

| ID | Unit | Sev |
| --- | --- | --- |
| W2-N5 | U-SHELL-3 | LOW — test-only `paneSubtreeRoot` 3-arg branch cleanup |
| **W2-N7** | U-SHELL-4/5 | ~~MEDIUM — no shell `pointerdown/move/up` + rect wiring~~ **FIXED (2026-09-13 — U-SHELL-N7 `installShellPointers` delegated wiring landed)** |
| W2-N8 | U-SHELL-8 | LOW — derived-mirror `state-slice` layer accumulation |
| W2-N9 | U-SHELL-8 | LOW — hot-added-pane regression unexercised |
| W2-N10 | U-SHELL-9a | LOW — non-document stage-mount live settle |
| W2-N11 | U-STATE-1e (1a-inherited) | LOW — circular `content`/`children` `RangeError` |
| W2-N12 | U-STATE-1e/9b | ~~MEDIUM — host identity apply ignores `documentId`~~ **FIXED (H3)** |
| W2-N13 | U-SHELL-9b | ~~HIGH — Option-C commit warn/fork unreachable~~ **FIXED (H1)** |
| W2-N14 | U-SHELL-9b | ~~HIGH — C20 never materialized~~ **FIXED (H2/H7)** |
| W2-N15 | U-SHELL-9b | ~~MEDIUM — multi-doc operator/template re-derive loses the H3 scope~~ **FIXED (§2.10)** |

---

## 6. Pending units

- **Wave 3 COMPLETE (2026-09-14):** **U-SHELL-7 (settings modal C3)** and **U-IMPORT-1 (File → Import… FS/browse C17)** are both GREEN / COMPLETE — the UI-overhaul (C1–C20 wave decomposition) is all-LANDED; no Wave-3 unit is pending. The U-SHELL-7 + U-IMPORT-1 live-scenario batteries stay PARKED artifacts (running-app + UI/DOM-driver / OS-dialog-driver surface), documented in
  `docs/specs/unit-u-shell-7-settings-modal-live-pending-battery.md` and
  `docs/specs/unit-u-import-1-import-surface-live-pending-battery.md`.
- Accept-from-9b: AF3-3/AF1-2 (per-mount editing context for a shared node).
- **U-JR1 is GREEN/DONE (2026-09-13)** — no longer pending; see §1 + the
  U-JR1 DONE row in `docs/next-steps.md`. Its live-scenario battery stays a
  PARKED artifact (running-app surface), documented in
  `docs/specs/unit-ujr1-get-journal-live-pending-battery.md`.

---

## 7. Process / commands

- Per unit: **TestWriter red** (run + report) → **Implementer green** (least code)
  → **trio** → **adversarial** (read-only; host findings fixed here + regression
  tests, package findings → `defects.md`/`HANDOFF.md`) → **blind-greens** →
  **doc-review** (`archive/reviews/…`). One unit per cycle (RCA-2).
- Trio: `npm test` · `npm run typecheck` · `npm run build`.
- **Never** commit unless asked; **never** patch `node_modules/provident-ssr/` or
  `../Preempt-Providence/` (path-confine agents to the repo).
- Delegated agents: path-confine to the repo (no `/tmp`, no parent `Projects/`).

---

## 8. Documentation-staleness review (this pass)

Reconciled against the actual build + the U-SHELL-N7/7/IMPORT-1 hardening:
- **2026-09-14 (U-IMPORT-1):** the previously untracked spec-only draft is now
  GREEN / COMPLETE / CODE LANDED — the status block + the §3c note updated
  (IMPORT-ADV-1..3 host-fixed, no package finding); `next-steps.md` gained the
  Unit U-IMPORT-1 DONE row (red 43 → green 47; 3 sanctioned re-pins; ADV-1..3 +
  4 pins; blind-greens 36/0/5; live battery PARKED; trio 4613/58; the three
  IMPORT-* decisions) + the CURRENT WORK lead + the Wave-3-COMPLETE status;
  `pending.md` gained the U-IMPORT-1 parked-live-battery row; `defects.md`
  correctly ABSENT (host findings only); `decisions.md` `IMPORT-NO-SYMLINK-FOLLOW`
  / `IMPORT-FILE-COUNT-CAP` / `IMPORT-RESULT-BROADCAST` ACTIVE + dated.
  Doc-review: `archive/reviews/2026-09-14-unit-u-import-1-import-surface-doc-review.md`.
  **WAVE 3 COMPLETE — the UI-overhaul is all-LANDED.**
- **2026-09-13 (U-JR1):** the U-JR1 spec §2.2/§5.7/§5.8 gained the battery-host
  "7th surface" notes (gate-6 HOST fix: `battery-host.ts` routes `journalEntries`,
  `RuntimeBackend` exported, auto-start main-only); the live-pending battery's §0.2
  `unknown method` finding is now **FIXED + regression-tested**; `next-steps.md`
  CURRENT WORK + line-69 record say **GREEN/DONE**, the baseline is **189/4421**,
  and the Unit U-JR1 DONE row is added. Doc-review:
  `archive/reviews/2026-09-13-unit-ujr1-doc-review.md`.
- **2026-09-13 (U-EDIT-2):** the spec §2.1/§2.5/§8 reconciled (project-journal
  seam pinned) + status LANDED. **`HOST/U1-ENG` closed upstream** (`BOOLEAN-ATTRS`,
  present in `provident-ssr@0.5.0`) — moved to RESOLVED in `docs/HANDOFF.md`,
  marked RESOLVED in `docs/defects.md`. Doc-review:
  `archive/reviews/2026-09-13-unit-u-edit-2-doc-review.md`.
- **2026-09-13 (W2-N15):** 9b spec §2.10 pins the multi-doc non-content
  re-derive scope fix; §2.6b AF3-2 → FIXED; `wave-2-open-decisions.md` §D
  W2-N15 → FIXED. Doc-review: `archive/reviews/2026-09-13-w2n15-doc-review.md`.
- **2026-09-13 (9b H1/H2):** the 9b spec §2.6 H1/H2/H7 rows are FIXED; new
  §2.6c (H1 adversarial) and §2.8/§2.9 host-seam pins; the §2.6 verdict now
  reads **9b GREEN** (blind-greens  `archive/greens/2026-09-21-unit-u-shell-9b-greens.md` (historical; archived 2026-09-21; successor: the owning unit spec + the DONE row carrying the verification; archived basename unit-u-shell-9b-greens.md)
  23/0/0). `wave-2-open-decisions.md` §D W2-N13/N14 → FIXED; `next-steps.md`
  updated. Doc-reviews: `archive/reviews/2026-09-13-unit-9b-h1-doc-review.md` +
  `...-h2-doc-review.md`.
- **2026-09-13 (9b H3):** the 9b spec §2.6 H3 row is FIXED + a new §2.6b records
  the H3 adversarial findings (AF3-1 fixed; AF3-2 → W2-N15; AF3-3 accepted);
  §2.7 pins the namespace scheme. `wave-2-open-decisions.md` §D W2-N12 → FIXED +
  W2-N15 added; `next-steps.md` updated. No method/census drift beyond the
  intended new exports (`scopeDocumentIds`, `plainRagId`).
- **2026-09-13 (9b hardening):** the 9b spec §2.6 H4/H5/H6 rows are now FIXED
  with regression pointers and H7 re-scoped to H2; `next-steps.md`'s 9b
  paragraph carries the fix + the new suite count. No method/signature/census
  drift (the module's public surface is unchanged).
- `docs/next-steps.md`, `docs/specs/wave-2-open-decisions.md` §C/§D, the unit
  specs, `decisions.md`, `defects.md`, `HANDOFF.md`, `pending.md` were kept
  current per-unit by the doc-review gates; this handover records the final
  state (**U-SHELL-9b GREEN** — H1–H7 FIXED + blind-greens 23/0/0; W2-N12/N13/N14/N15
  all FIXED; AF3-3/AF1-2 OPEN).
- **Stale claims fixed earlier this session:** the U-STATE-1d/1e label collision;
  the "host-side journal mirror" narrative (superseded by 0.5.0 + C16 ruling);
  the U-SHELL-9 split pointers; `DECIDED: MCP-FOCUS-TOOL` §9.2 → §2.7 citation;
  W2-Q9 "optional" → required double-click reset; the §8/§2.7 AF-3/AF-4 and
  U-SHELL-3/4/5/8 "Open items" statuses; the U-SHELL-9a/9b/1e greens tallies.
- **Known residual staleness (owned by their units, not fixed here):** the
  "queued via the dirty-edit guard" wording in `unit-u-edit-1-*` F2 and
  `unit-u-shell-8-*` F4 (unverified — reconcile when their cycles reopen);
  pre-U-SHELL-1 `pane-graph.ts` line citations in `ui-overhaul.md` /
  `unit-ms5-*` / `unit-h8-*` (line drift only).

**⟶ DATED NOTE `2026-11-15` — THE ZONE VOCABULARY MOVED (unit `U-1a`, D-16).** `LayoutZoneName` is now `top | bottom | left | right`, the carriers are `[zone=]`, and the pane `order` member is `index`; every `header`/`footer` zone spelling and every `data-zone` carrier in this handover is a pre-rename reading, kept as filed. The accepted cost of the move (persisted placements coercing to `left`, a persisted `order` discarded) is `ZONE-RENAME-SILENTLY-RELOCATES-PERSISTED-PLACEMENTS` in `docs/defects.md` (D-22).
