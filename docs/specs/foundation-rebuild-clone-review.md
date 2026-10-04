# FOUNDATION REBUILD CLONE — GATE-1 RECORD (the four-step proposal review; the re-vendor unit's verdict, decomposition and semantics)

**Date: 2026-10-04** (⟶ in-place correction by the supervisor's shell-bearing pass: the as-filed **CARRIED reading
`2026-10-05`** — the newest in-tree date — differs from this repo's **actual local day `2026-10-04`** (`date`, CDT),
corrected in place per the same `§12.12` `A-12` discipline the drafting pass invoked; the carried claim is kept visible
beside it) · **Branch:** `post-division-rebuild` · **Pass
kind:** GATE RECORD, landed by the CHANGE-ANALYSIS step (the gate's step 4) from the three read-only step returns plus
this pass's own read-only verification · **Layer (RCA-12, mandatory):** **DOC-LAYER — nothing here is app-green,
envelope-green, store-green, engine-green or live-green.** Every figure below is a **`VERIFIED-BY-READ`** (reader named),
a **`RECORDED READING`** (measurer named), or **`OWED`**. **THIS PASS RAN NO LEG** — no `npm test`, no `npm run drift`,
no `npm run conformance`, no `md5sum`/`sha256sum`/`git` of any kind (the wall holds no shell and no digest instrument).

**The proposal:** the user's order, *"Foundation project has been rebuilt again to add centralized managed storage for
state data. Review changes and clone into working branch."* — the four-step gate's subject, per `AGENTS.md` item 8.
**The inputs:** the three step returns (validity; critique; architecture review — each pasted into this pass's brief
and digested at §2/§3 below), the standing pin-refresh contracts, the manifest, the pin tests, and the adjacent
foundation tree at its current HEAD. **The verdict:** **`APPROVE-WITH-CONDITIONS`** (§1). **The two artifacts this pass
wrote:** this record + `docs/specs/foundation-rebuild-clone-adoption-dossier.md` (§4, the STEP-0 semantics block).

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in this file**
(`docs/specs/requirement-catalog.md` §3.4 rule 7). Markers: **`VERIFIED-BY-READ`** (this pass, reader named) ·
**`RECORDED READING`** (a figure measured by somebody else, quoted with its measurer named) · **`OWED`** (named, with
its owner and what settles it).

---

## 1. THE VERDICT — `APPROVE-WITH-CONDITIONS`

**The closed vocabulary's four non-selected rows, each with its reason, then the selected row:**

| Verdict | Why it is NOT / IS the verdict |
| --- | --- |
| `PROCEED` | **NOT AVAILABLE.** The central act — the two-module re-vendor — **contradicts two standing contracts in force at this head**: `docs/specs/unit-pd-vendor-pin-refresh.md` §2's STOP (*"a pass that silently re-copies a module to make the manifest agree has performed an **unauthorised re-vendoring** and is a review finding"*), §3 item 3 and §1.2 item 1, and `docs/specs/unit-foundation-pin-refresh-2.md` §2.6 (*"a differing blob ⇒ … the implementer **STOPS** … escalates to the architect"*). **No in-force authorization for the re-vendor act exists in the record** (the standing `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY` orders restatements of an **unchanged** pin contract, never byte moves; `DECIDED: FOUNDATION-PIN-FAULT-ORDERED-REFRESH-2026-09-29`'s premise is `15/15` blob identity). Unconditional delegation would launder that violation. |
| `BLOCKED-ON-SEMANTICS` | **DOES NOT FIRE.** The STEP-0 recon (**§4, this record's semantics block**) yields **0 open identifier rows and an EMPTY open-semantics list**: the dossier's two adopted rows carry `STATUS: defined` (source-pinned module names at the refreshed revision), and every other externally-sourced name the re-vendored bytes touch — `store`, `hostId`, the three reference spellings, the tier names, `createPaneDrag`/`getWiredGraphStore`, the `provident:store:file:*` channels, the unexported store interfaces — is **RECORDED-NOT-ADOPTED with a named reason** (dossier §2). The four conditions below are **authorization rulings**, not undefined identifiers; they are grantable in full by the user's go-ahead at the pause. |
| `FLAWED` | **NOT SUPPORTED ON THE EVIDENCE.** The three reviews independently verified that the mechanism facts are REAL and correctly stated: the pin is genuinely moved (foundation HEAD `7bd1de4…` ≠ pin `93c058f6…`, `VERIFIED-BY-READ` this pass via the foundation's ref file), the two module drifts are real and **byte-scoped** (upstream 573/773 lines with a store-backed extension vs the fork's vendored 410/643, `VERIFIED-BY-READ`), no fork `src/**` file imports either module, and the register's rows make split landings unclaimable. Every defect the reviews found is **fixable within the unit's shape** (a new spec that supersedes; a blob oracle; a universe disposition; a coupling carry) — the predicate of `FLAWED` (the central mechanism cannot be made right) is not met. |
| `REJECTED` | **NOT SUPPORTED.** The course of action is the user's explicit order and is architecturally sound: the foundation's store wave is real (four-tier facility rows in `../Provident-Electron/docs/decisions.md`, `store-core-graph.ts` at 2372 lines, 9 new store suites — all `VERIFIED-BY-READ` this pass), the fork's pin obligation says the pin MUST equal the foundation's HEAD, and the drifted bytes must come into recorded agreement with their source. The coherent remainder (pin restatement + two-module re-vendor + conformance refresh + review record, one commit) is the ONLY landing the register permits to be claimed. |
| **`APPROVE-WITH-CONDITIONS`** | **THE VERDICT.** The proposal is a GOOD IDEA ON BALANCE **only as re-shaped**: the delegable unit is the architecture review's two-fraction decomposition (§5), the re-vendor act is authorized by the user's order **recorded as the architect ruling** that mints the exception (condition C-1), the manifest's cells come from a **blob oracle re-run at the refreshed revision** (C-2), the conformance universe is **re-derived at both revisions with the ≥9 new store suites explicitly disposed** and the leg's class-labelled tally preserved (C-3), and the STEP-0 recon's recorded-not-adopted treatment is **ratified** (C-4). The pause's go-ahead is what grants the four conditions; nothing in fraction 2 is delegable before they land. |

**The four conditions, enumerated (each is the pause's grant, recorded here so the grant has a referent):**

| # | Condition | What grants it | What it makes delegable |
| --- | --- | --- | --- |
| **C-1** | **THE RECORDED RE-VENDOR RULING** — the user's order is recorded as the architect ruling minting the exception to `unit-pd-vendor-pin-refresh.md` §2's STOP / §3 item 3 / §1.2 item 1 and `unit-foundation-pin-refresh-2.md` §2.6, and the NEW spec `docs/specs/unit-foundation-rerevendor-<date>.md` **explicitly supersedes those denials by name** (an annotated clause each; no denial is silently re-read) | the user's go-ahead at the pause, recorded in fraction 1 | the re-vendor act itself — absent it, every byte move is the reviews' "unauthorised re-vendoring" |
| **C-2** | **THE BLOB ORACLE AT `7bd1de4`** — every manifest cell (`md5`, `lineCount`) is re-derived by **re-running the RESTATED `digestCommand` at the refreshed revision** (15/15 blobs; `git show 7bd1de4:src/shared/<name>.ts`), never by working-tree `md5sum`; the per-module blob read is the landing's **pre-edit gate** (the same three-limb shape `unit-pd-vendor-pin-refresh.md` §3 item 3 used) | fraction 1's spec (records the restated command verbatim as run) + a shell-bearing landing pass | the recomputed `md5`/`lineCount` cells (MAJOR 11; the manifest's cells may never come from the working tree) |
| **C-3** | **THE CONFORMANCE-UNIVERSE DISPOSITION** — the candidate universe is **re-derived at BOTH revisions** (the pin's 15-suite set AND the refreshed tree's set), and the **≥9 NEW store suites** (`store-persist` · `store-modules-bytes` · `store-security` · `store-focus` · `store-modules-seams` · `store-core-graph` · `store-core-graph-integration` · `pane-drag-compliance` · `fork-store-reads` — `VERIFIED-BY-READ` this pass in `../Provident-Electron/tests/`) each get an **explicit disposition** (not-admitted / out-of-universe with reason); the leg itself stays the **class-labelled tally of `unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7** — **no green word may ever be reported from it** | fraction 1's spec (the disposition table) | every claim about the conformance leg and the copy-fidelity of the two re-vendored modules |
| **C-4** | **THE RECORDED-NOT-ADOPTED RULING** — the STEP-0 recon's treatment (§4, dossier §2) is ratified: the two module names are the unit's whole adoptable surface; `store`/`hostId`/the spellings/the store-wave identifiers are upstream-context citations, never the fork's contract | this record's §4 + the dossier | the unit's gate-1 (its semantics are closed); NOT the store machinery — that passes to the fork adoption planner, `PD-UI-11`/`PD-UI-12` rowStatuses untouched (§7) |

**Plus the two carry-rules folded INTO the conditions (from the validity/critique must-fixes, not re-litigated):**
**(a) THE `measuredAt` COUPLING (V-3/CRITICAL-2):** `foundation.measuredAt` is read by the register's `measuredAt`
limb against the LAST *"declared refresh reading"* clause in the anchored `§4` region of `unit-pd-vendor-pin-refresh.md`
(currently **`2026-09-30`**, `VERIFIED-BY-READ`). If the landing's own run's **local/repo day** ≠ that date, **ONE
dated re-anchoring clause lands in that `§4` region IN THE SAME COMMIT** (the `§2.5` clauses 3–5 / `F-15` route of the
second refresh contract — an additive clause, no tooth relaxed, no term moved) — otherwise the landing produces a
**THIRD red** and is a regression. **(b) THE ONE-COMMIT CHANGE SET:** fraction 2 is ONE atomic commit — five pin value
lines (four sites) + the two module re-vendors + the recomputed cells + the four conformance-copy refreshes + the
`measuredAt`/`§4` re-anchor (iff it moves) — with the register's `P-SM-pd-pin-2` (agreement) and `P-TP-pd-pin-3` (blob
identity) as the guards that make a split landing unclaimable.

---

## 2. WHAT THE PROPOSAL ASKS — the delegable unit, and what it is NOT

**The user's ask, stated plainly:** the foundation has been rebuilt again (the "store wave" — centralized managed
storage, four tiers, `src/renderer/store-core-graph.ts` 2372 lines — `VERIFIED-BY-READ` this pass), and the fork's
vendored foundation state must be reviewed and cloned into the working branch.

**The delegable unit (re-shaped by this gate), with its layer labels:** the **ordered pin restatement + two-module
re-vendor + conformance-copy refresh + `measuredAt`/`§4` re-anchor + review record**:

1. **The pin fault** — re-state the pin from `93c058f69bd78fd1a80c96044e504deac4737ab3` to the adjacent tree's current
   HEAD **`7bd1de4786c4d46a3fee02f72adaf6ef612985d1`** (both `VERIFIED-BY-READ` this pass — the manifest's `foundation.commit`
   and the foundation's ref file) in **all five value lines / four sites** (the manifest's `foundation.commit`, its
   embedded `digestCommand` literal, and one `PINNED_COMMIT` constant in each of `tests/pd-vendor-set.test.ts` ·
   `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` — the three constants `VERIFIED-BY-READ` at
   `93c058f6…` this pass).
2. **The re-vendor (the act the standing contracts deny, authorized by C-1)** — re-copy exactly TWO vendored modules:
   `src/shared/owned-list-host.ts` (410 → 573 lines upstream) and `src/shared/slot-host.ts` (643 → 773 lines upstream),
   both gaining the optional caller-supplied store-backed extension, both with **zero imports, unchanged exports,
   no-op-without-a-store** (`VERIFIED-BY-READ` this pass of the upstream working tree at the HEAD the refs name). The
   other **thirteen modules stay byte-identical** (the STOP's per-module blob read is the landing's pre-edit gate, C-2).
3. **The manifest cells** — `md5`/`lineCount` re-derived from the **restated `digestCommand` run at `7bd1de4`** (C-2;
   MAJOR 11), for exactly the two moved modules; nothing else in `modules[]`/`baselines`/`provenance` changes (E-10/E-11
   stay OWED, §8).
4. **The conformance copies** — the **four** of the eleven `vendor/Provident-Electron/tests/` copies that changed
   upstream (gutter · overlay · relocate · theme) refreshed to the pinned revision's test blobs — `VERIFIED-BY-READ`
   this pass, net line-census deltas vs the fork copies: gutter +381 · theme +64 · overlay +37 · relocate +10 (the
   brief's larger `+381/+86/+45/+12` figures are the supervisor's insertion-count readings — both instruments agree the
   four copies differ upstream; the exact per-file figures are re-taken by the landing).
5. **The `measuredAt`/`§4` re-anchor** — iff the landing's local/repo day ≠ `2026-09-30` (carry-rule (a)).
6. **The review record** — the item-10d documentation review of the landing (RCA-6) is INSIDE fraction 2, per the
   architecture review's deliverable (f); the adversarial pass (RCA-3) runs before it; the red run's reading **names
   the third red** (MAJOR 6).

**What the unit is NOT:** **not the store machinery** — no store adoption, no tier vocabulary, no consumer edge, no
`PD-UI-11`/`PD-UI-12` rowStatus change (§7); **not the drift monitor** (`scripts/**` untouched — the instrument is not
adjusted to the pin; `§1.2` item 7 of the first contract); **not the baselines/provenance cells** (E-10/E-11, §8); **not
a conformance-green claim** (the leg's tally is a tally, C-3); **not an app/envelope/live claim of any kind** (RCA-12,
§7).

---

## 3. THE THREE SUB-REVIEWS — verdicts and findings digest

### Step 1 — VALIDITY: `REVIEWABLE`, three corrections

| # | Finding (digest) | Disposition in this verdict |
| --- | --- | --- |
| **V-1 (must-fix)** | the re-vendor contradicts the standing refresh contracts — `unit-foundation-pin-refresh-2.md` §2.6 and `unit-pd-vendor-pin-refresh.md` §2-STOP/§3 item 3 (a differing blob ⇒ STOP-and-escalate; silent re-copy is "unauthorised re-vendoring, review finding"); §1.2 item 1 denies module byte moves; the delegable unit must be a NEW spec that explicitly supersedes those denials | **CARRIED** — C-1; fraction 1's spec supersedes the denials **by name** (annotated clause per denial) |
| **V-2 (must-fix)** | *"npm run conformance is green"* is invalid — mechanism §3.5 items 4/7: the leg's pass condition is a class-labelled tally, class (i) vacuous (suites resolve `../src/shared/<x>.js` against ABSENT `vendor/Provident-Electron/src/shared/` — `VERIFIED-BY-READ` this pass: the placement holds exactly the 11 test copies and no `src/`), classes (ii)/(iii) red by construction; no green word may be reported | **CARRIED** — C-3; the verdict text and every claim about the leg in this record carry the tally, never a colour |
| **V-3 (must-fix)** | the `measuredAt` fifth-member coupling — `P-SM-pd-pin-2` compares the manifest's `measuredAt` to the last non-superseded declared-refresh-reading clause in the anchored `§4` region (currently `2026-09-30`); on any run day ≠ that date the literal moves AND one dated re-anchoring clause must be appended in that `§4` region in the SAME commit (refresh-2 §2.5 clauses 3–5, fail-state `F-15`) | **CARRIED** — carry-rule (a), folded into the conditions |

### Step 2 — CRITIQUE: `WEAK`, its CRITICAL/MAJOR/MINOR list

| Id | Finding (digest) | Disposition |
| --- | --- | --- |
| **CRITICAL 1** | re-vendor has no in-force authorization (R-4 / refresh-2 §2.6 forbid it); the user's order is the architect ruling that mints the exception — the record must name the decision row/amendment | **CARRIED** — C-1 + §2 of this record; the ruling's record is fraction 1's spec, cited from this record |
| **CRITICAL 2** | `measuredAt` + §4-region coupling absent — guarantees a post-landing red unless the re-anchor lands in the same commit; declare the run's local/repo day | **CARRIED** — carry-rule (a) |
| **CRITICAL 3** | *"conformance green"* contradicts the leg contract — the tally, never green | **CARRIED** — C-3; the honest word shape is stated in §2 item 4 and §7 |
| **CRITICAL 4** | the 15-suite candidate universe is stale — the ≥9 new store suites need explicit disposition; universe re-derived at BOTH revisions | **CARRIED** — C-3; the nine suites are named in C-3 (`VERIFIED-BY-READ` this pass) |
| **CRITICAL 5** | the store wave superseded the foundation citation under the fork's own persistence row — verified: foundation `DECIDED: FOUNDATION-STORE-FACILITY-IS-OPENED-AND-SUPERSEDES-NO-FOUNDATION-CONFIG-FILE-FACILITY` (2026-10-01) supersedes `NO-FOUNDATION-CONFIG-FILE-FACILITY` clause 1 (the row the fork's `DECIDED: HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP` cites); foundation `fork-store-reads.md` §0.1 item 9 records the fork's `src/main/**` re-route OWED under H-r6; the fork tree carries ZERO references to `7bd1de4`/`d667917` — the SC-8/SC-9 rows + the two defect dispositions owe fired-revisit-condition updates | **CARRIED** — §8 obligations (tracker pass; decisions-owner pass; fork `src/main` pass), all named with owners; the zero-reference reading is independently `VERIFIED-BY-READ` this pass (whole-tree search, no matches) |
| **MAJOR 6** | red-set enumeration unverifiable (the third red is not statically identifiable); the register's STOP-premise message mislabels the re-vendor state | **CARRIED** — §6; the landing's own red run must re-take the reading and name the third red; the STOP-premise message's wording is noted, not fixed here |
| **MAJOR 7** | RCA-2/RCA-5: the (a)–(f) verification acts are ≥3 acts needing separate verification cycles | **CARRIED** — fraction 2's cycle is the repo's per-unit cycle (pre-edit blob gate → red run → green → trio → adversarial → item-10d doc review), each act its own recorded step (`AGENTS.md` items 3/9/10) |
| **MAJOR 8** | `OwnedListHostStore`/`SlotHostStore` are UNEXPORTED interfaces inside exported options — the fork's export-gap defect class (G-8); the mirror/`P-IM-4` closed five-name set doesn't cover them; handoff never patched | **CARRIED** — dossier `N-7` (recorded-not-adopted) + §8 handoff extension; the re-vendored bytes must not be patched to export them |
| **MAJOR 9** | the zone-gesture ask's upstream landing (`d667917` = the store wave's first commit — a four-step gate for the fork's ZONE-GESTURE-PREVIEW ask) is untracked fork-side | **CARRIED** — §8 (SC-8/SC-9 fired-revisit → tracker pass) |
| **MAJOR 10** | upstream npm test was NOT green at the pane-drag DONE row (1 failed file, store-core-graph legacy 11 red) — though the foundation's own 2026-10-03 RE-GRAIN record says the legacy suite was re-authored to 71/71 and its ledger closed at 30 DONE / 0 open; the fork's conformance leg can never import upstream green anyway (its rows run at the fork's placement against byte copies) | **CARRIED** — §8 (the upstream full-suite reading at `7bd1de4` is OWED to a shell-bearing pass OUTSIDE this sandbox); no conformance claim imports it |
| **MAJOR 11** | manifest cells must come from a re-run of the RESTATED `digestCommand` at `7bd1de4` (blobs 15/15), never working-tree `md5sum` | **CARRIED** — C-2 |
| **MINOR 12** | lock baselines/provenance cells stay non-discharged (E-10/E-11); refresh-2 §12's owed `sha256` could be discharged by this unit — record as still-owed vs discharged | **CARRIED** — §8: recorded still-owed BY NAME; the unit may discharge the `sha256` only as its own separate act with its named instrument |
| **MINOR 13** | F1 provenance-class risk (`FOUNDATION-PIN-NOT-REACHABLE-FROM-THE-RECORDED-REMOTE-PROVENANCE`) applies to every pin move — extend for `7bd1de4` | **CARRIED** — §8 (the provenance row's extension, owner: the supervisor's tracker pass) |

### Step 3 — ARCHITECTURE REVIEW: shape fits; findings verified; decomposition + STEP-0 recon

**The architecture review's verdict (digest):** the pin state is verified (five value lines, four files), the blob
drifts are real and byte-scoped, no fork `src/**` consumer exists, the standing contracts deny the re-vendor act, the
register makes split landings unclaimable (`P-TP-pd-pin-3`'s blob arm + the STOP-premise message + `F-15`'s `measuredAt`
limb), the conformance leg is a class-labelled tally, the universe is stale, the store-supersession + H3 are real and
untracked fork-side, and the `pd-vendor-adoption-dossier.md` is FULL at 8 rows. **Its decomposition recommendation —
`D-GP-SAD-5`, SPLIT BY ACT, NEVER BY MECHANISM — and its STEP-0 recon are carried into §4/§5 below as this record's own.**

---

## 4. THE SEMANTICS BLOCK (STEP 0 run) — REQUIRED

| Field | Reading |
| --- | --- |
| **Dossier path** | `docs/specs/foundation-rebuild-clone-adoption-dossier.md` (**written by this pass**, same commit as this record) |
| **Content-hash snapshot** | **line census (`wc -l`-equivalent): the file-read tool's own line census, taken THIS pass at this head, reader: the change-analysis pass — **`140` lines, measured immediately after writing** (the dossier row below carries the same figure; both are the same commit's reading).** **`md5` (FINAL-HEAD, after the single in-place date correction): `9b41c515e6b4d989ddbc257b98948d86`** — ⟶ DISCHARGED by the supervisor's shell-bearing pass at this head (**instrument: `md5sum`**, run in the repo root; the drafting-pass reading `d08afadb8f8623f1a218a6fd899fb167` is superseded beside by the date-correction edit, kept visible for provenance). The passing gate reads the snapshot as: line census taken + md5 measured at the final head — an honest snapshot, not an absent one |
| **Open-rows inventory** | **0 open.** The dossier's row tally: **2 rows (≤ 8), `defined`: 2, `undefined-until-answered`: 0** — `owned-list-host` (row 1) and `slot-host` (row 2), both source-pinned at `7bd1de4` with the pin register's `P-TP-pd-pin-3` as the evaluator. Everything else is recorded-not-adopted (dossier §2, seven entries `N-1`…`N-7`, each with its source citation and the reason no row is owed) |
| **Open-semantics list** | **EMPTY (none).** No identifier row stands undefined-until-answered and no OPEN/OVERFLOW open-semantics entry exists — the dossier is a NEW file opened under the full dossier's cap rule (`pd-vendor-adoption-dossier.md` §3 `A-4`), so the ≤ 8 cap is satisfied and the unit's adoptable surface is exactly two names |
| **Architect answers** | **FOUR CONDITIONS PENDING THE GO-AHEAD — named, with no identifier-semantics among them**: the **recorded re-vendor ruling** (C-1), the **blob oracle at `7bd1de4`** (C-2), the **conformance-universe disposition** (C-3), and the **recorded-not-adopted ruling** (C-4) — §1. Each is an authorization ruling grantable by the user's go-ahead at the pause; none is an undefined identifier, so none triggers `BLOCKED-ON-SEMANTICS`. **Effect on the verdict: none beyond the conditions themselves — the verdict is `APPROVE-WITH-CONDITIONS` WITH the open list EMPTY** |

**The dossier's own line census (this pass's measurement, at this head, instrument: the file-read tool):** the
dossier file reads **`140` lines total** (the tool's "End of file - total 140 lines" reading, taken immediately after
writing — the figure of record for the snapshot). **This record itself: `258` lines at the census at
writing-completion (kept visible), `259` at the first §4 re-take, and `260` at the final read before this sentence's
own edit — the figure of record for any citation is the file-read tool's LAST reading of the file, re-takeable with
the same instrument (the repo's `§12` line-count discipline), and no further in-pass chase is owed.** **`md5` of the
dossier (FINAL-HEAD): `9b41c515e6b4d989ddbc257b98948d86`; `md5` of this record (FINAL-HEAD, re-taken after the digest
cells' own last edit): `a7bd77f5748ba31208119706d140f417`** — ⟶ DISCHARGED by
the supervisor's shell-bearing pass (**instrument: `md5sum`**, at the final head after all in-place corrections;
handling note: every in-place correction moved this record's digest, so each digest above is stated AT the head it was
measured at, the drafting-pass readings are superseded beside, and the standing rule is **re-take-with-the-same-instrument
at the citing head** — the discipline is instrument-named and head-named, never a quoted absolute that outlives the file). **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER OF `FOUNDATION-REREVENDOR-2026-10-04` (F1) — `RCA-8(c)`, ANNOTATE-BESIDE: the two FINAL-HEAD digests cited in this section (the Content-hash snapshot cell's dossier digest `9b41c515…` and this paragraph's record digest `a7bd77f5…`) are the readings at their cited heads and are KEPT VISIBLE as such.** THIS pass holds NO shell and no digest instrument, so it could not re-take them (`md5sum` is not on this wall), and ITS OWN annotate-beside edits have moved BOTH files (this record — §4/§6/§9/§11; the dossier — its §1 rows) — **so both O-8/§4 digest cells are OWED a re-take at the post-gate-7 heads by the shell-bearing pass (instrument `md5sum`), exactly per the re-take discipline this same paragraph states; no digest cell above is rewritten or replaced.**⟩** **⟨⟶ RE-TAKEN `2026-10-04` BY THE SUPERVISOR'S SHELL (instrument `md5sum`, post-gate-7 head): this record `d71a94b27c9a5dac5e22948ab675b1ea` (320 lines) · dossier `64933bf3945e6f13ece785e413c1243a` (139 lines) — the OWED cells are DISCHARGED at this head; the earlier cells stay visible as their own heads' readings.⟩**

---

## 5. THE DECOMPOSITION RECOMMENDATION — keyed `decomposition`, with its DISPOSITION CELL

| Key | The row (the architecture review's `D-GP-SAD-5`, carried) | DISPOSITION CELL |
| --- | --- | --- |
| **`decomposition`** | **SPLIT BY ACT, NEVER BY MECHANISM.** **Fraction 1 = the authorization/spec act (DOC):** the NEW spec `docs/specs/unit-foundation-rerevendor-<date>.md` recording (i) the user's order as the re-vendor ruling + the superseded clauses by name (C-1), (ii) the restated `digestCommand` oracle at `7bd1de4` (C-2), (iii) the universe re-derivation at both revisions + the ≥9 new suites' disposition (C-3), (iv) the conformance-leg contract carry (the tally, never a colour), (v) the export-gap extension (`N-7`), (vi) the `measuredAt` coupling carry (carry-rule (a)), (vii) the ONE-commit change set. **Fraction 2 = the code-bearing landing (machine-data + `[T]`):** the single atomic commit (five pin value lines + two module re-vendors + recomputed `md5`/`lineCount` cells + four conformance-copy refreshes + `measuredAt`/`§4` re-anchor iff it moves), preceded by the unit's own red run (**naming the third red**, MAJOR 6) and followed by trio + adversarial + item-10d doc review. **The boundary: authorization/gates precede execution — nothing in fraction 2 is delegable before fraction 1's gate-1.** **Why the remainder is the coherent core:** the register's intermediate-state semantics — pin-only reds (`P-TP-pd-pin-3`), bytes-only reds (the pin rows), a pure restatement is the STOP branch — plus drift-CLEAN + one-commit atomicity converge on ONE commit; no sub-state is claimable; consistent with `DECIDED: FOUNDATION-PIN-FAULT-ORDERED-REFRESH-2026-09-29` and RCA-2/RCA-5. **NOT part of the clone unit (owners named):** store machinery adoption (fork adoption planner; `PD-UI-11`/`PD-UI-12` rowStatuses untouched), fork PENDING-REBUILD rows + SC-8/SC-9 + defect dispositions (tracker pass), H3 re-route (fork `src/main/**` under `H-r6`), HOST-PERSISTENCE re-annotation (decisions-owner pass), baselines/provenance cells (E-10/E-11; may discharge refresh-2 §12's `sha256` as its own named act). **Review-record deliverable (f): INSIDE the unit as the item-10d doc-review gate.** | **`disposition: PENDING-THE-GO-AHEAD — held on this record; granted at the pause`** (the pause = the user's go-ahead answering §1's four conditions; granted, fraction 1 may be filed and its gate-1 run; until granted, nothing in fraction 2 is delegable) |

---

## 6. THE RED SET AND THE NO-OTHER-RED RULE (the landing's own obligations, stated here so the DONE row cannot drift)

**The red set at this head (measured state, this session — `RECORDED READING`, measurer: the supervisor's session; the
brief's readings):** `npm run drift` **FAIL** (a pin fault: the tree's HEAD `7bd1de4…` ≠ the manifest's pin `93c058f6…`,
plus the two module drifts — the vendored copies STILL matching the manifest, `VERIFIED-BY-READ` this pass: 410/643
lines) · pin test files **3 failing / 159 passing** · **TWO of the three reds statically identifiable** (`VERIFIED-BY-READ`
of the limbs this pass): `tests/pd-vendor-pin-refresh-register.test.ts` `P-IM-pd-pin-1` (the full 40-hex equality of
`rev-parse HEAD` vs the manifest's `foundation.commit`) and `tests/pd-vendor-set.test.ts` `§3.3 item 2` (the same single
cause in the in-suite arm). **The THIRD red is NOT statically identifiable from a read-only wall** (MAJOR 6) — **the
landing's own red run must re-take the whole reading at its own head and NAME the third red by file and row**; a DONE
row that reports a red without naming the row is a review finding (the refresh contracts' own rule). **No-other-red
rule:** the landing may not redden `P-SM-pd-pin-2` (agreement), `P-TP-pd-pin-3` (blob identity — it reads at the
**recorded** commit, so it stays green only if the refreshed blobs are byte-equal to the re-vendored copies), the blob-
containment row, `tests/pd-vendor-manifest.test.ts`'s two assertions, the drift fixtures, or the register's `measuredAt`
limb (`F-15`).

**Feasibility verdict (compile-horizon form):** **FEASIBLE as re-shaped, with the four conditions + two carry-rules.**
The pin fault, the two module drifts, the four copy drifts and the coupling all verify at this head; the SHA-256/`md5`
digests, the third red, the upstream full-suite reading and the `150 commits / 61,344 insertions` wave figure are
`OWED` to the shell-bearing landing (all quoted in this record only as `RECORDED READING`s or `OWED`).

**⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER OF `FOUNDATION-REREVENDOR-2026-10-04` (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: the red set above is the PRE-LANDING reading and STAYS as filed — it is its own pass's reading, `RCA-1` evidence; this note records the LANDING's after-state beside it.⟩** **F1 LANDED** at **`123e279211f3c497b108d6873fa9016f5820d632`** (ONE atomic commit, `2026-10-04`) — `VERIFIED-BY-READ` this pass via `docs/specs/unit-foundation-rerevendor-2026-10-04-greens.md` (§S8). The landing's own red run re-took the reading at its own head and named the third red (its report per the F1 spec §10; the DONE-row print of `O-7` is the tracker gate's — §8's owner stands). The after-readings recorded in the greens artifact: `npm run drift` = **`CLEAN`** with the PIN ARM **EQUAL** and **`revisionChecked === true`** (§S4); pin test files **`4 passed (4)` / `162 passed (162)`**, exit `0` (§S5); the register's three rows **3×`held`** — `P-IM-pd-pin-1` / `P-SM-pd-pin-2` / `P-TP-pd-pin-3` each `executed === declared` (`7` / `16` / `21`), `stoppedAt null`, counterexamples `0` (§S5) — and the trio green at the landed head (the gate-9 after-reading, `RECORDED READING` per the supervisor's brief to this pass). **No-other-red held: `P-SM-pd-pin-2` and `P-TP-pd-pin-3` stayed `held`, and the `§4` re-anchor clause landed inside the same commit (§S3).**

---

## 7. THE LAYER DECLARATION (RCA-12) AND THE NAMED NON-CLAIMS

**The clone unit as scoped is `machine-data`/`[T]`/`DOC` — never app-green, envelope-green or live-green.** Its evidence
is the pin's revision/byte oracle (the `[D]`-class monitor arm + the register's three rows), the per-module blob reads,
and the reconstituted conformance tally — **envelope/tooling readings at best**. **The store machinery is NOT adopted by
this unit** — no tier vocabulary, no store consumer edge, no `PD-UI-11`/`PD-UI-12` rowStatus change, no
`store`/`hostId`/spellings/channels in the fork's usable contract (dossier §2). **Named non-claims, each falsifiable:**
no app-green · no envelope-green-as-app · no store-green · no engine-green · no live-green · no conformance-green (the
tally is a tally; class (i) evidence is EMPTY, classes (ii)/(iii) red by construction — mechanism §3.5 items 4/7) · no
claim that a `SKIPPED` or byte-only `CLEAN` drift reading is a pin pass · no claim that the `baselines`/`provenance`
cells are discharged (E-10/E-11, §8) · no claim that the fork's copies behave as the foundation's store-wave suites
observe · no claim that any upstream green is fork-app evidence (G-6).

---

## 8. THE PENDING-OBLIGATIONS LIST — each with its OWNER (named, never parked silently)

| # | Obligation | Owner | State here |
| --- | --- | --- | --- |
| **O-1** | `SC-8`/`SC-9` (`docs/pending.md`) **fired-revisit-condition updates** — the store wave is exactly the *"the family's next revision changes the composition"* arm both rows name; the defect dispositions `PANE-DRAG-CROSS-ZONE-DROP-UNSUPPORTED` / `GUTTER-RESIZE-NO-LIVE-VISUAL-FEEDBACK` (`docs/defects.md`) owe the same | the supervisor's **tracker pass** | **OWED — named**; CRITICAL 5's verified zero-reference reading (`7bd1de4`/`d667917` absent from the fork tree, `VERIFIED-BY-READ` this pass) is the trip |
| **O-2** | **H3/H-r6 re-route** — the fork's `src/main/**` re-route of store-addressed MCP reads (`rag.query {store:'X'}` · store-addressed `rag.get_document` · `edit.*`'s `store` selector) | the fork's own **`src/main` pass** under `H-r6` (foundation record: `../Provident-Electron/docs/specs/fork-store-reads.md` §0.1 item 9 — `OWED`, the fork's pass) | **OWED — named**; NOT part of the clone unit |
| **O-3** | **HOST-PERSISTENCE re-annotation** — the fork's `DECIDED: HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP` cites the foundation's `NO-FOUNDATION-CONFIG-FILE-FACILITY`, whose clause 1 the store wave superseded (2026-10-01); the fork row needs a dated annotate-beside note | the **decisions-owner doc pass** | **OWED — named** |
| **O-4** | the manifest's **`baselines` cells (E-10) + per-module `provenance` wording (E-11)** | the supervisor's manifest/tracker pass (`unit-pd-vendor-pin-refresh.md` §9 `E-10`/`E-11`; refresh-2 §8 `D-9`) | **STILL-OWED, recorded by name — NOT discharged, and this unit's DONE row may not report them discharged**; **refresh-2 §12's `sha256` may be discharged as this unit's own separate act** with its named instrument, recorded then |
| **O-5** | **F1 provenance-class risk** — `FOUNDATION-PIN-NOT-REACHABLE-FROM-THE-RECORDED-REMOTE-PROVENANCE` applies to every pin move; **extend it for `7bd1de4`** (the revised pin's provenance must state how `7bd1de4` is reachable from the recorded remote) | the supervisor's tracker pass | **OWED — named** (MINOR 13) |
| **O-6** | **the upstream full-suite reading at `7bd1de4`** — `npm test` (and `drift`/`conformance`) at the refreshed head, taken by a shell-bearing pass | a **shell-bearing pass OUTSIDE this sandbox** (the supervisor's) | **OWED — named**; the foundation's own records close its ledger at **30 DONE / 0 open** with the legacy `store-core-graph` suite RE-AUTHORED to **71/71** (its 2026-10-03 RE-GRAIN record, quoted as `RECORDED READING`); MAJOR 10's pane-drag-DONE-row reading (1 failed file, 11 red) is the historical reading that RE-GRAIN superseded — neither is fork-conformance evidence (rows run at the fork's placement against byte copies) |
| **O-7** | the **third red's identity** and the landing's before→after readings (files/tests/skips, `drift` verbatim, `revisionChecked`) | the landing pass (fraction 2), printed in the DONE row | **OWED — the run, named** (MAJOR 6; §6) |
| **O-8** | **this record's and the dossier's `md5` snapshots** | the supervisor's shell-bearing pass, naming its instrument | **⟶ DISCHARGED AT THE FINAL HEAD (2026-10-04, instrument `md5sum`):** dossier `9b41c515e6b4d989ddbc257b98948d86` (line census `140` taken by the drafting pass) · this record `a7bd77f5748ba31208119706d140f417` (FINAL-HEAD digest after all in-place corrections; earlier cells superseded beside — §4's note). The dossier's census is re-taken by the landing at its own head if the file is untouched ⟨**GATE-7 (`2026-10-04`, proofreader of F1) — `RCA-8(c)`, ANNOTATE-BESIDE: both files were MOVED by this pass's annotate-beside edits (this record — §4/§6/§9/§11; the dossier — its §1 rows), so both digests above are superseded as CURRENT-HEAD values and are OWED a re-take at the post-gate-7 heads by the shell-bearing pass (instrument `md5sum`); the dossier's line census remains `140` (this pass's annotate-beside edits were in-line, adding no line) but its digest has moved with the byte changes and is re-takeable with the file-read tool / `md5sum` at the new head.**⟩** ⟨**⟶ RE-TAKEN `2026-10-04` BY THE SUPERVISOR'S SHELL (`md5sum`): dossier `64933bf3945e6f13ece785e413c1243a` · this record `d71a94b27c9a5dac5e22948ab675b1ea` — both OWED cells DISCHARGED at the post-gate-7 head.**⟩** |
| **O-9** | the **export-gap handoff extension** — `OwnedListHostStore`/`SlotHostStore` join the `G-8` handoff class (`docs/defects.md` → `docs/HANDOFF.md`), outside the closed `P-IM-4` five-name set (`foundation-return-shapes.ts`) | the supervisor's handoff write (this dossier supplies the reading) | **OWED — never patched in the re-vendored bytes** (MAJOR 8; dossier `N-7`) |

---

## 9. What this gate authorises — and what it does NOT

**Authorised by `APPROVE-WITH-CONDITIONS` + the pause's go-ahead:** fraction 1's filing of the NEW spec
(`docs/specs/unit-foundation-rerevendor-<date>.md`) with the four conditions recorded, then fraction 2's landing pass
through its own full cycle (per-module blob gate → red run naming the third red → one atomic commit → trio → adversarial
→ item-10d doc review) — **each further step still gated by its own contract and a run-and-reported red set**
(`AGENTS.md` item 9). **NOT authorised:** anything before the go-ahead · the store machinery · a conformance green word ·
a `baselines`/`provenance` discharge · a monitor or fence edit · any write under `../Provident-Electron/**` · any claim of
app/envelope/live evidence (RCA-12). **Nothing in this record is app-green, envelope-green, store-green, engine-green or
live-green.**

**⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: the authorizations above are as-filed and STAND; this note records their execution.⟩** **THE AUTHORIZED COURSE WAS EXECUTED: fraction 1's spec (`docs/specs/unit-foundation-rerevendor-2026-10-04.md`) was filed, and fraction 2 LANDED as ONE atomic commit `123e2792…` (`2026-10-04`)** — the four conditions C-1…C-4 GRANTED by §11's ruling and discharged by the landing: **C-1** (the recorded re-vendor ruling) executed via the spec's by-name supersession and the landed module bytes; **C-2** (the blob oracle at `7bd1de4…`) executed — the two `md5`/`lineCount` cells re-derived from the restated `digestCommand`, never a working-tree `md5sum`; **C-3** (the conformance-universe disposition) filed at the spec's §2.3; **C-4** re-worded to the adoption form by §11 clause (5) — the store surface IS the unit's adoptable surface, adopted per F2 unit with its own dossier. **The F2 store-adoption units (`§11` clause (3)'s eight) remain OPEN, each with its own gate-1/spec/dossier/red→green cycle (`RCA-2`/`RCA-5`).** Nothing in this record is, or becomes, app-green, envelope-green, store-green, engine-green or live-green — the landing's own layer is `machine-data`/`[T]`/DOC (F1 spec §5/§7, `RCA-12`).

---

## 10. But wait — cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/unit-foundation-rerevendor-<date>.md` (fraction 1, OWED to fraction 1's filing) ·
`docs/specs/foundation-rebuild-clone-adoption-dossier.md` (this gate's STEP-0 dossier: rows 1–2, the recorded-not-adopted
block `N-1`…`N-7`, collisions `C-1`/`C-2`) ·
`docs/specs/unit-pd-vendor-pin-refresh.md` §2-STOP / §3 item 3 / §1.2 item 1 / §4 (`P-IM-pd-pin-1` · `P-SM-pd-pin-2` ·
`P-TP-pd-pin-3`) / `§9` `E-10`/`E-11` / `§12.12` `A-12` ·
`docs/specs/unit-foundation-pin-refresh-2.md` §2.5 clauses 1–5 / §2.6 / §3.4 `F-15` / §12 (the declared refresh reading;
the `sha256` OWED) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7 · `docs/specs/pd-vendor-adoption-dossier.md` §2 `C-6`,
§3 `A-4` ·
`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY` ·
`DECIDED: FOUNDATION-PIN-FAULT-ORDERED-REFRESH-2026-09-29` · `DECIDED: HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP` ·
`DECIDED: THE ZONE-GESTURE CAPABILITY GAPS GO UPSTREAM FIRST` ·
`../Provident-Electron/docs/decisions.md` `DECIDED: NO-FOUNDATION-CONFIG-FILE-FACILITY` /
`FOUNDATION-STORE-FACILITY-IS-OPENED-AND-SUPERSEDES-NO-FOUNDATION-CONFIG-FILE-FACILITY` /
`FOUR-TIER-DATA-OWNERSHIP-MODEL` / `THROWING-SUPPLY-ABSORPTION-LIVES-AT-THE-WIRING-TURN-NOT-THE-EVALUATION` ·
`../Provident-Electron/docs/specs/fork-store-reads.md` §0.1 item 9 · `store-modules-bytes.md` §1.3/§2.1/§2.4/§2.6 ·
`store-persist.md` §2.2 rows `C-1`/`C-2` · `pane-drag-compliance.md` §2.1 A/B, §5.1 row 1 · `store-focus.md` ·
`docs/pending.md` `SC-8`/`SC-9` · `docs/defects.md` `PANE-DRAG-CROSS-ZONE-DROP-UNSUPPORTED` /
`GUTTER-RESIZE-NO-LIVE-VISUAL-FEEDBACK` ·
`vendor/foundation.lock.json` (`foundation.commit`, `foundation.measuredAt`, `foundation.digestCommand`, the
`owned-list-host`/`slot-host` entries, `conformance.excluded`) ·
`tests/pd-vendor-set.test.ts` (`PINNED_COMMIT`, `PINNED_FIFTEEN`, `DECLARED_CONSUMER_EDGES`, `§3.3 item 2`) ·
`tests/pd-vendor-pin-refresh-register.test.ts` (`P-IM-pd-pin-1` / `P-SM-pd-pin-2` / `P-TP-pd-pin-3`) ·
`scripts/foundation-drift.mjs` (`PINNED_MODULE_NAMES`) · `src/shared/foundation-return-shapes.ts` (the closed five-name
set) · `docs/specs/requirement-catalog.md` §3.4 rule 7 · `docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-12`).
**A cross-reference here may name a symbol or row id only; no citation in this file carries a line number.**

---

## 11. ⟶ RE-SCOPE RULING (2026-10-04, the ARCHITECT — at the gate-1 pause; `RCA-8(d)` annotate-beside: every clause above
stands as filed and is its own pass's reading; this section is the operative re-scope and SUPERSEDES-IN-PART §7's *"the
store machinery is NOT adopted by this unit"* and condition C-4's recorded-not-adopted treatment, named by that section
and that condition)

**THE ARCHITECT'S RULING, VERBATIM IN SUBSTANCE (the user's answer to the go-ahead question):** *"Add the store. The
store is the important part. I don't care if there's blockers. Adopting it in this project to avoid the data management
issues that were blocking previous builds was the entire point of the foundation change."*

**WHAT IT DOES, FIVE CLAUSES.** **(1) THE STORE IS ADOPTED — THE PROGRAM IS RE-SCOPED.** The four-tier managed-storage
facility (`file` / `mem` / `temp` / `secure`; `src/renderer/store-core-graph.ts` · `store-graph-references.ts` ·
`store-channels.ts` · the store-backed module extensions) is **ADOPTED INTO THIS FORK**, not recorded-not-adopted. The
unit shape in §5's decomposition row is superseded-in-part: the program is now TWO fractions — **F1 the mechanical
clone** (unchanged: pin restatement + the two store-extended module re-vendors + conformance copies + `measuredAt`/§4
re-anchor — the re-vendored `owned-list-host`/`slot-host` are now the fork's FIRST store-adopted bytes), and **F2 the
store-adoption landing** (the fork-side units that wire the facility: one per foundation store unit and per fork
re-route lane — §11 clause 3's list), each F2 unit with its own gate-1/spec/dossier/red→green cycle per `RCA-2`/`RCA-5`.
**(2) THE BLOCKERS ARE RECORDED AND PROCEEDED-THROUGH — never a gate.** The architect's *"I don't care if there's
blockers"* is the ruling that the adoption proceeds THROUGH the named blocker set, each recorded with its owner and its
proceed-through shape (this is the OPPOSITE of a park): `H3`/`H-r6` (the fork `src/main/**` re-route of store-addressed
MCP reads — the F2 unit `U-STORE-READS-RE-ROUTE` owns it) · the mechanism-store boundary clauses `S-d4`/`S-d8`#4/`H-r16`
(the F2 units' store arrives as an INJECTED dependency, never an ambient read — the foundation's own `NW-4` row is the
load-bearing design row) · the fork's PENDING-REBUILD lanes (`multi-document-store-config` · `provident.focus` store
route · the pane-drag→zone listener flow · the theme-token flow — each becomes an F2 unit under the foundation's two-rule
store read) · the `PD-UI-11`/`PD-UI-12` rowStatuses (the store-backed extensions revive them as F2 consumers, their
rowStatuses then re-stated by their own units) · the HOST-PERSISTENCE row's re-annotation (the facility-supersession) ·
the SC-8/SC-9 fired-revisit updates (the upstream pane-drag/compliance landing). **(3) THE F2 UNIT SET, NAMED** (each
adopts the foundation unit named; the foundation's own specs are the source contracts):
`U-STORE-CORE-ADOPT` (store-core-graph + store-graph-references + the four tiers + their register/events) ·
`U-STORE-PERSIST-ADOPT` (`<userData>/provident-settings.json` tier-1 carrier + the channel wire) ·
`U-STORE-SECURITY-ADOPT` (the secure tier + `security-store` re-home) · `U-STORE-FOCUS-ADOPT` (the mem.focus mirror +
the store-backed focus-model carrier) · `U-STORE-MODULES-ADOPT` (the `store`/`hostId` seams of the store-backed eight —
BYTES MOVED by F1, WIRED by this unit) · `U-STORE-PANE-DRAG-ADOPT` (the createPaneDrag composition + the
two-arm zone-size constraint) · `U-STORE-READS-RE-ROUTE` (H3) · `U-STORE-LANES-RE-ROUTE` (the fork's four
PENDING-REBUILD lanes onto the store + the graph-carrier rule). **(4) THE DOSSIER CONSEQUENCE.** The clone unit's
dossier (rows 1–2) stands; the adopted store identifiers move OUT of the recorded-not-adopted block into the F2 units'
OWN dossiers (≤ 8 rows each, source = the foundation's `store-core-adoption-dossier.md` + the store specs) — the F2
units are BLOCKED-ON-SEMANTICS-IF-UNDEFINED under the same rule as any adopted unit, and each F2 unit's STEP-0 run is
its own gate-1 duty. **(5) THE VERDICT STANDS, RE-SCOPED.** `APPROVE-WITH-CONDITIONS` holds for F1 (its four conditions
now GRANTED by this ruling — the go-ahead is THIS ruling: C-1 granted, C-2 granted, C-3 granted, C-4 **re-worded to the
adoption form**: the store surface IS the unit's adoptable surface, adopted per unit with its own dossier); the store
adoption's gate-1 is DISCHARGED BY THIS RULING for the admitted set in the sense of the foundation's own admission
precedent (`RCA-8(f)` — the architect admits ROWS), and the record of that admission is THIS section + the program plan
§X.

**⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER (F1) — `RCA-8(d)`, ANNOTATE-BESIDE: every clause of the re-scope ruling above stands as filed; this note records the landing the ruling's F1 fraction produced.⟩** **F1 LANDED at `123e279211f3c497b108d6873fa9016f5820d632`** (ONE atomic commit, `2026-10-04` — `VERIFIED-BY-READ` this pass via the F1 greens artifact §S8): the mechanical clone — pin restatement to `7bd1de4…` in five value lines / four sites, the two module re-vendors as the fork's FIRST store-adopted bytes (`owned-list-host` 573 lines / md5 `9782b14e…` · `slot-host` 773 lines / md5 `5431e8a0…`), the four conformance-copy refreshes, the `measuredAt`/`§4` re-anchor to `2026-10-04` — plus the pre-recorded member-7a register act (the `G-3` clause-count assertions `.toBe(2)` → `.toBe(3)`), with drift `CLEAN` (PIN ARM EQUAL, `revisionChecked === true`), the register 3×`held` (`7`/`16`/`21` executed=declared, `stoppedAt null`), the pin files `4 passed (4)` / `162 passed (162)` and the trio green at the landed head (all `RECORDED READING`s of the landing per the greens artifact §S4/§S5 + the supervisor's brief). **F2 (clause (3)'s eight store-adoption units) remains OPEN — each unit runs its own gate-1/spec/dossier/red→green cycle; this record's verdict, conditions and ruling are the authority those units derive from.**