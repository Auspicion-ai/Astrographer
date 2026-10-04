# STEP-0 ADOPTION DOSSIER — the FOUNDATION-REBUILD-CLONE re-vendor unit (the two-module re-vendor to `7bd1de4786c4d46a3fee02f72adaf6ef612985d1`)

**Status: STEP-0 INPUT — authored 2026-10-04** (⟶ in-place correction by the supervisor's shell-bearing pass: the
as-filed **CARRIED reading `2026-10-05`** — the newest in-tree date — differs from this repo's actual local day
`2026-10-04`, corrected in place per the same `§12.12` `A-12` discipline; the carried claim is kept visible beside it). NO CODE LANDED, NO MANIFEST BYTE MOVED, NOTHING RUN. NO SHELL HELD:
no `git`, no `md5sum`, no suite, no leg.** **Unit spec this dossier serves:** `docs/specs/unit-foundation-rerevendor-<date>.md`
(**fraction 1 of the decomposition ruling** — `docs/specs/foundation-rebuild-clone-review.md` §5, keyed `decomposition`).
**Program:** the user's order — *"Foundation project has been rebuilt again to add centralized managed storage for state
data. Review changes and clone into working branch"* — recorded as the architect ruling that mints the re-vendor
exception to the standing denials (the gate-1 record §4). **Gate record:** `docs/specs/foundation-rebuild-clone-review.md`
(verdict `APPROVE-WITH-CONDITIONS`, four conditions pending the go-ahead at the pause).

**Layer (RCA-12, mandatory).** **DOC-LAYER.** This dossier adopts **identifiers**; it asserts **nothing** that is
app-green, envelope-green, store-green, engine-green or live-green. Every source citation below is a **read** of
`../Provident-Electron` (the FOUNDATION — adjacent, **not an npm dependency**, **never modifiable**) or of this repo.
**No digest was computed by this pass** (the wall holds no shell; every `md5` in this file is quoted from the manifest,
whose cells are the subject of the landing's blob-oracle obligation, **never re-measured here**). **Every figure below
is a `VERIFIED-BY-READ` with its reader named (this pass), a `RECORDED READING` with its measurer named, or `OWED`.**

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in this file**
(`docs/specs/requirement-catalog.md` §3.4 rule 7).

**The rule this file exists to satisfy** — the vendoring program's adoption semantics, in its own words
(`docs/specs/post-division-rebuild-proposal.md` §6.2): *"Every unit whose contract names, parameters or vocabulary
originate **outside this project** … MUST carry an adoption dossier (`docs/specs/<unit>-adoption-dossier.md`, ≤ 8
identifier rows, each with its source citation and `STATUS`). … a unit with any undefined row is
`BLOCKED-ON-SEMANTICS` and is escalated **in that pass**."* **And its collision clause:** *"every adopted unit's dossier
MUST carry a populated collision block — each adopted identifier checked against the consuming repo's
prohibition/vocabulary rows, each hit reconciled **by row id** … or **re-named by an explicit re-name request** —
**never by relaxing a prohibition**."*

**Why this dossier is a NEW small file and NOT a ninth row of the full `pd-vendor` dossier.** The `pd-vendor` dossier
(`docs/specs/pd-vendor-adoption-dossier.md`) is **FULL at 8 rows** (its `A-4` escalation: *"the dossier cap is FULL at
eight. Any further identifier cannot be added here without removing a row"*). The re-vendor unit adopts **two module
names** that the full dossier never adopted as adoptable identifiers (its rows 1–8 name option members, tokens and
return shapes, **not the module names themselves** — the module names were the fork's own mechanical vocabulary from the
start). Both names are already the fork's **vendored-set members** (`tests/pd-vendor-set.test.ts` `PINNED_FIFTEEN`,
`scripts/foundation-drift.mjs` `PINNED_MODULE_NAMES`), so the adoption act here is a **re-adoption of the same names at
a new revision**, and it is carried in this unit's own dossier per the cap rule.

---

## 1. The identifier table (2 rows of ≤ 8 — the re-adoption set)

**`STATUS` is `defined` or `undefined-until-answered`.** **An `undefined-until-answered` row BLOCKS this unit at its
gate — there are NONE below.**

| # | Identifier | Source citation (foundation path + symbol + §) | Unit / domain / referent / evaluator | `STATUS` |
| --- | --- | --- | --- | --- |
| **1** | **`owned-list-host`** — the MODULE NAME, re-adopted at the refreshed revision | `../Provident-Electron/src/shared/owned-list-host.ts` (the module **at/for the refreshed HEAD `7bd1de4786c4d46a3fee02f72adaf6ef612985d1`**; **read this pass, working tree: 573 lines**, the store-backed extension `readonly store?: OwnedListHostStore \| null` / `readonly hostId?: string` present on `OwnedListHostOptions`); `../Provident-Electron/docs/specs/store-modules-bytes.md` §2.1 rows `M-LS-1`..`M-LS-5` + §2.2 (the module is one of the **8 store-backed / 7 pure** split's store-backed members — **BYTES MOVE**, plan `§5.2.7` row 9); `../Provident-Electron/docs/specs/listhost.md` §2.1 (the seven-name export set); the fork's own vendoring record `vendor/foundation.lock.json` → the `owned-list-host` entry (md5 `d576f0017747d4fa6dacab3e9fb27ccb` · lineCount `410` — **both cells are the landing's blob-oracle subject, quoted, never re-measured here**) ⟨**ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER OF `FOUNDATION-REREVENDOR-2026-10-04` (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: the as-filed quote above is the STEP-0 reading and stays visible (historical); post-F1 the manifest's `owned-list-host` cells read md5 `9782b14e9eb81303c11443b005b7b6ef` · lineCount `573` — re-derived from the RESTATED `digestCommand` run at `7bd1de4…` (the `C-2` blob oracle, never a working-tree `md5sum`) by the F1 landing's ONE atomic commit `123e279211f3c497b108d6873fa9016f5820d632` (`docs/specs/unit-foundation-rerevendor-2026-10-04.md` §1.1 members 4/5); the landed cells `VERIFIED-BY-READ` this pass at `vendor/foundation.lock.json`.⟩** | **UNIT:** the vendored `src/shared/owned-list-host.ts` re-copied **byte-equal to the refreshed revision's blob** (fraction 2). **DOMAIN:** the fork's vendored source set. **REFERENT:** *the module's own name as a source-file identity, byte-pinned at the recorded commit* (the pin's `P-TP-pd-pin-3` referent, whose blob read is the row that falsifies an unauthorised re-vendor). **EVALUATOR:** the pin register's `P-TP-pd-pin-3` (blob identity at the **recorded** commit, `tests/pd-vendor-pin-refresh-register.test.ts`); the drift monitor's name set (`PINNED_MODULE_NAMES` member); the conformance leg's class-labelled tally — **whose evidence for this module is EMPTY by contract** (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7; the suite `owned-list-host.test.ts` is an `X-1` exclusion) — **never a green word** | **`defined`** |
| **2** | **`slot-host`** — the MODULE NAME, re-adopted at the refreshed revision | `../Provident-Electron/src/shared/slot-host.ts` (**read this pass, working tree: 773 lines**, the store-backed extension `readonly store?: SlotHostStore \| null` / `readonly hostId?: string` on `SlotHostOptions`); `../Provident-Electron/docs/specs/store-modules-bytes.md` §2.1 rows `M-SS-1`..`M-SS-5` + §2.3 + §2.4 (store-backed member — **BYTES MOVE**, plan `§5.2.7` row 10; `SLOTHOST-CONTAINER-SOURCE-IS-INJECTED` unmoved); `../Provident-Electron/docs/specs/slothost.md` §2.1; `vendor/foundation.lock.json` → the `slot-host` entry (md5 `bb53cdedad4f8f4359f603fe7e4ea86d` · lineCount `643` — quoted, never re-measured here) ⟨**ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: the as-filed quote above is the STEP-0 reading and stays visible (historical); post-F1 the manifest's `slot-host` cells read md5 `5431e8a0a720e0e1a9d4e26d3d60e971` · lineCount `773` — re-derived from the RESTATED `digestCommand` run at `7bd1de4…` (`C-2`) by the F1 landing's ONE atomic commit `123e2792…` (`docs/specs/unit-foundation-rerevendor-2026-10-04.md` §1.1 members 4/5); the landed cells `VERIFIED-BY-READ` this pass at `vendor/foundation.lock.json`.⟩**); fork record `docs/specs/unit-pd-ui-12-slot-host-boundary.md` (`A-10`'s region ruling; **the boundary spec's slot-host consumption IS the fork's own consumer-side question and is NOT this unit's** — `PD-UI-12` rowStatuses untouched) | **UNIT:** the vendored `src/shared/slot-host.ts` re-copied **byte-equal to the refreshed revision's blob** (fraction 2). **DOMAIN:** the fork's vendored source set. **REFERENT:** *the module's own name as a source-file identity, byte-pinned at the recorded commit*. **EVALUATOR:** the pin register's `P-TP-pd-pin-3`; `PINNED_MODULE_NAMES` member; the conformance leg's class-labelled tally — **evidence EMPTY by contract** (`slot-host.test.ts` is an `X-1` exclusion) — **never a green word** | **`defined`** |

**Row tally:** **2 rows of ≤ 8 — NOT full.** **`defined`: 2.** **`undefined-until-answered`: 0.** **No identifier was
found undefined, so this dossier raises NO `BLOCKED-ON-SEMANTICS` row.** **The recorded-not-adopted block below (§2)
carries every further externally-sourced name the re-vendored bytes touch — each with its reason NO ROW IS OWED — so the
open-semantics list is EMPTY by construction, and the dossier is not "small" by omission: the cap's `A-4` escalation is
discharged by the new file, and the re-unit's whole adoptable surface is exactly two names.**

---

## 2. The RECORDED-NOT-ADOPTED block (cited, named, and ruled OUT of the fork's usable contract — no rows owed)

**RULE: identifiers in this block appear in the re-vendored bytes or their referencing docs ONLY as UPSTREAM-CONTEXT
citations. The fork imports neither module, has zero consumers of either, adopts no store backend, and asserts nothing
about any of these names (all `VERIFIED-BY-READ` this pass: a whole-tree content search of the fork for the two module
names outside the pin files returns **zero import sites**). Each entry records its source so a later pass cannot
re-litigate the ruling as an omission.**

| # | Name | Source citation (foundation) | Why NO ROW IS OWED |
| --- | --- | --- | --- |
| **N-1** | **`store`** — the option member `readonly store?: OwnedListHostStore \| null` / `readonly store?: SlotHostStore \| null` | `../Provident-Electron/src/shared/owned-list-host.ts` / `slot-host.ts` → the `OwnedListHostOptions` / `SlotHostOptions` option blocks (**read this pass**); `../Provident-Electron/docs/specs/store-modules-bytes.md` §2.1 item 1 (`U-STORE-MODULES-BYTES`) | the member is the **store-carrying shape's sole store-access path**; **absent or `null` ⇒ the LANDED contract's host, every store turn a valid no-op** — the fork's re-vendored bytes therefore behave exactly as the old contract's when the fork supplies no store. **No fork consumer supplies one; the fork asserts nothing; adopting the member would claim the store machinery, which is expressly NOT this unit** (gate-1 record §7) |
| **N-2** | **`hostId`** — `readonly hostId?: string`, the caller's spelling of the host in the store's namespace | same two modules' options blocks (read this pass); `../Provident-Electron/docs/specs/store-modules-bytes.md` §2.4 + §2.6 (the `<hostId>` segment of every reference) | the segment exists **only inside store-reference spellings the fork never reads or writes**. **The fork has no `hostId` carrier today** (`VERIFIED-BY-READ`: zero fork occurrences of `hostId` outside the vendored bytes' own copies — the fork's copies are the OLD bytes, which carry no such member). Not adopted; no evaluator exists and none is owed ⟨**ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: the byte claim — *"the fork's copies are the OLD bytes, which carry no such member"* — is SUPERSEDED by the F1 landing (the vendored copies ARE the `7bd1de4…` blobs since the ONE atomic commit `123e2792…` and now carry the member inside those landed bytes — `docs/specs/unit-foundation-rerevendor-2026-10-04.md` §1.1 member 4); the recorded-not-adopted verdict and this row's reasoning STAND — no fork file reads or writes `hostId`, and no evaluator is owed.**⟩ |
| **N-3** | the three store-reference SPELLINGS: **`mem.list.<hostId>.order`** · **`mem.list.<hostId>.node.<key>`** · **`mem.slots.<hostId>.<key>`** | `../Provident-Electron/docs/specs/store-modules-bytes.md` §1.3 / §2.4 / §2.6 — the spellings are *"THE CALLER'S, carried verbatim"*; note the node record lives under **`.node.<key>`**, never flat (`§2.4` items 1/2) | **the fork OWNS no store namespace** — no `mem` tier, no spellings to read or write; the names would become fork contract vocabulary **only** if the fork adopted the store machinery (fork adoption planner's pass — NOT this unit) |
| **N-4** | the store-wave TIER names **`file` / `mem` / `temp` / `secure`** | `../Provident-Electron/docs/decisions.md` **`DECIDED: FOUR-TIER-DATA-OWNERSHIP-MODEL`** (2026-10-01) + **`DECIDED: FOUNDATION-STORE-FACILITY-IS-OPENED-AND-SUPERSEDES-NO-FOUNDATION-CONFIG-FILE-FACILITY`** (2026-10-01; supersedes the old row's clause 1) | the tiers are **the foundation's facility vocabulary**; the fork's own persistence row (`docs/decisions.md` `DECIDED: HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP`) **cites the now-superseded foundation row and is OWED a re-annotation by the decisions-owner pass** (gate-1 record §8) — a tracker/doc act, not an adoption row here |
| **N-5** | **`createPaneDrag`** · **`getWiredGraphStore`** | `../Provident-Electron/docs/specs/pane-drag-compliance.md` §2.1 A/B + §5.1 row 1 (`createPaneDrag(store, source)` composition); `../Provident-Electron/docs/specs/store-core-graph-compliance-review.md` §9B `T5` (`getWiredGraphStore()` boot wiring) | the fork's ZONE-GESTURE ask's upstream landing sits in this wave (**`d667917` = the store wave's first commit — `RECORDED READING`**, measurer: the step-2 critique pass, holding shell); the fork carries **zero references** to `7bd1de4`/`d667917` (`VERIFIED-BY-READ` this pass — whole-tree search, no matches). The **fired-revisit-condition updates** it owes (`docs/pending.md` `SC-8`/`SC-9`; `docs/defects.md` `PANE-DRAG-CROSS-ZONE-DROP-UNSUPPORTED` / `GUTTER-RESIZE-NO-LIVE-VISUAL-FEEDBACK`) are **tracker-pass obligations, never adoption rows** (gate-1 record §8) |
| **N-6** | the channel constants **`'provident:store:file:get'` / `'provident:store:file:put'`** | `../Provident-Electron/docs/specs/store-persist.md` §2.2 rows `C-1`/`C-2` | the Y-1/Y-2 wire names are **foundation main/renderer channel vocabulary**; the fork has no store crossing; the fork's own re-route obligation (`../Provident-Electron/docs/specs/fork-store-reads.md` §0.1 item 9 — **the fork's `src/main/**` re-route of store-addressed MCP reads, `OWED` under `H-r6`**) is a **fork `src/main` pass, named at gate-1 record §8, not adopted here** |
| **N-7** | **`OwnedListHostStore` / `SlotHostStore`** — the two UNEXPORTED interfaces inside the exported options | `../Provident-Electron/src/shared/owned-list-host.ts` / `slot-host.ts` → `interface OwnedListHostStore {` / `interface SlotHostStore {` (**declared WITHOUT `export`**; read this pass) | **the fork's export-gap defect class (`G-8`) extends to them**: a foundation EXPORT gap is **handed off, never patched** (`docs/specs/pd-vendor-adoption-dossier.md` §2 `C-6`; the mirror/`P-IM-4` five-name closed set — `GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg` — re-declared at `src/shared/foundation-return-shapes.ts` **does NOT cover these two**). **Recorded-not-adopted as identifiers; the handoff extension is filed at gate-1 record §8, never patched in the re-vendored bytes** |

**Fork pin vocabulary (`PINNED_COMMIT`, `measuredAt`, the register ids `P-IM-pd-pin-1`/`P-SM-pd-pin-2`/`P-TP-pd-pin-3`, the
conformance list) is the fork's OWN mechanical vocabulary — no rows, by design (it is this repo's, not adopted).**

---

## 3. The collision block — every adopted identifier checked, every hit reconciled BY ROW ID (never by relaxing a prohibition)

**What was checked (the scan this pass ran, and its result).** Each adopted identifier was checked against **(a)** the
consuming repo's vendored-set name census — `tests/pd-vendor-set.test.ts` `PINNED_FIFTEEN` (`owned-list-host` and
`slot-host` are both members) — **(b)** the drift monitor's name set — `scripts/foundation-drift.mjs` `PINNED_MODULE_NAMES`
(both members) — **(c)** the consumer-edge allow-list — `tests/pd-vendor-set.test.ts` `DECLARED_CONSUMER_EDGES` (no row
names either module, and NONE IS OWED: the fork's `src/**` imports neither — `VERIFIED-BY-READ` this pass, zero import
sites) — and **(d)** the repo's prohibition/vocabulary rows (`docs/decisions.md`, the vendoring specs' `P-*`/`R-*`/`STOP`
rows). **The `threshold` incident's lesson is applied in full** (`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md`
§2/§3): for each name, **who supplies / who evaluates** is carried in the row's unit/domain/referent/evaluator cells and
the referent is a **byte-pinned module identity**, never a name with no meaning.

### `C-1` — `owned-list-host` (row 1): CHECKED, NO HIT

Already a **vendored-set member** in both instrument censuses (`PINNED_FIFTEEN`, `PINNED_MODULE_NAMES`) — the re-vendor
re-adopts the SAME name at the refreshed revision, so **no new vocabulary enters any fork surface**; the name is in
neither the `X-1`-excluded context nor the `DECLARED_CONSUMER_EDGES` allow-list and needs no row there (zero consumers).
**No prohibition row names it; no re-name is requested.** **One recorded consequence:** the `X-1` exclusion of
`owned-list-host.test.ts` from the conformance leg is **re-derived at the refreshed revision** (`vendor/foundation.lock.json`
`conformance.excluded` — the suite's class-(ii) red-by-construction reading is unchanged: it resolves
`../src/shared/dom-shim.js` against the fork's divergent baseline).

### `C-2` — `slot-host` (row 2): CHECKED, NO HIT

Same readings: `PINNED_FIFTEEN` and `PINNED_MODULE_NAMES` members; no consumer edge, no allow-list row owed, no
prohibition names it, **no re-name requested**. **Recorded consequences:** (a) the `X-1` exclusion of `slot-host.test.ts`
stands at the refreshed revision (its `dom-shim.js` plus the `../src/main/security.js`/`../src/main/mcp-server.js`
out-of-set dynamic imports); (b) the fork's `PD-UI-12` boundary spec consumes the slot host on the CONSUMER side — **the
re-vendor changes the vendored bytes the boundary spec's host half reads, so `PD-UI-11`/`PD-UI-12` rowStatuses are NOT
touched by this unit** and any consumer-side consequence is that unit's own (gate-1 record §8); (c) the export-gap
handoff extension (`N-7`) — **the re-vendored bytes still must NOT be patched to export `SlotHostStore`**.

---

## 4. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/foundation-rebuild-clone-review.md` (the gate-1 record: verdict, the four conditions, the decomposition row
keyed `decomposition`, the pending-obligations list) ·
`docs/specs/unit-foundation-rerevendor-<date>.md` (fraction 1's NEW spec — carries the supersession of the standing
denials `docs/specs/unit-pd-vendor-pin-refresh.md` §2's STOP / §3 item 3 / §1.2 item 1 and
`docs/specs/unit-foundation-pin-refresh-2.md` §2.6) ·
`docs/specs/pd-vendor-adoption-dossier.md` (§2 `C-6` the five-shape export-gap class; §3 `A-4` the FULL cap) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7 (the leg's class-labelled tally, evidence EMPTY,
never a green word) · `docs/specs/unit-pd-ui-12-slot-host-boundary.md` ·
`vendor/foundation.lock.json` (the `owned-list-host` / `slot-host` entries and the `conformance.excluded` rows) ·
`tests/pd-vendor-set.test.ts` (`PINNED_FIFTEEN`, `DECLARED_CONSUMER_EDGES`) · `tests/pd-vendor-pin-refresh-register.test.ts`
(`P-IM-pd-pin-1` / `P-SM-pd-pin-2` / `P-TP-pd-pin-3`) · `scripts/foundation-drift.mjs` (`PINNED_MODULE_NAMES`) ·
`../Provident-Electron/src/shared/owned-list-host.ts` / `slot-host.ts` (the options blocks, the unexported store
interfaces) · `../Provident-Electron/docs/specs/store-modules-bytes.md` §1.3/§2.1/§2.4/§2.6 · `listhost.md` §2.1 ·
`slothost.md` §2.1 · `store-persist.md` §2.2 rows `C-1`/`C-2` · `pane-drag-compliance.md` §2.1 A/B, §5.1 row 1 ·
`store-core-graph-compliance-review.md` §9B `T5` · `store-focus.md` · `fork-store-reads.md` §0.1 item 9 ·
`../Provident-Electron/docs/decisions.md` `DECIDED: FOUR-TIER-DATA-OWNERSHIP-MODEL` /
`FOUNDATION-STORE-FACILITY-IS-OPENED-AND-SUPERSEDES-NO-FOUNDATION-CONFIG-FILE-FACILITY` / `NO-FOUNDATION-CONFIG-FILE-FACILITY` ·
`docs/decisions.md` `DECIDED: HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP` ·
`docs/pending.md` `SC-8`/`SC-9` · `docs/defects.md` `PANE-DRAG-CROSS-ZONE-DROP-UNSUPPORTED` / `GUTTER-RESIZE-NO-LIVE-VISUAL-FEEDBACK` ·
`docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 · `docs/specs/requirement-catalog.md` §3.4 rule 7.
**A cross-reference here may name a symbol or row id only; no citation in this file carries a line number.**