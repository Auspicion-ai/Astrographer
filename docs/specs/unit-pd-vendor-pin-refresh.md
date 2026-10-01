# Unit `PD-VENDOR-PIN-REFRESH` — **the pin refresh**: moving the `PD-VENDOR` pin's revision anchor to the foundation's current HEAD, in all four sites atomically, with no module byte changed — Spec

**Status: SPEC — authored 2026-09-28. NO CODE LANDED, NO TEST LANDED, NO MANIFEST BYTE MOVED, NOTHING RUN by this pass.**
**⟨ANNOTATED `2026-10-04` BY THE GATES-7+8 PASS (PROOFREADER, `AGENTS.md` item 10b, + ITEM-10d DOCUMENTATION REVIEW, `RCA-6`) OF `U-FOUNDATION-PIN-REFRESH-2` — `RCA-8(c)`, ANNOTATE-BESIDE: every as-filed clause of this contract is KEPT VERBATIM and NOTHING in it is rewritten or renumbered; this block is the CURRENT STATE BESIDE it. The review record is `archive/reviews/2026-10-04-U-FOUNDATION-PIN-REFRESH-2-doc-review.md`.** **LAYER (`RCA-12`): DOC-LAYER ONLY — that pass RAN NO LEG and holds no digest instrument; its instruments were the file-read tool's line census and the read/`grep` surfaces, and every figure is a `VERIFIED-BY-READ` (reader named) or a `RECORDED READING` (measurer named).** **WHY THIS FILE IS ANNOTATED BY A LATER UNIT'S REVIEW: it is the CONTRACT THE SECOND REFRESH READS — the register's `measuredAt` limb takes the LAST *"declared refresh reading"* clause out of this file's anchored `§4` region, so the second landing had to re-anchor that region (`§2.5` clause 4's route), and the region therefore now ends with a dated clause reading `2026-09-30`; the `2026-09-28` declaration at `§12.4` is KEPT, annotated and SUPERSEDED, never deleted, and the limb's teeth are unmoved.** **AND THE PIN THIS FILE RE-STATED (`d7b98b574adc7fa63fbabda617eba2a753f52cb5`) IS SUPERSEDED TOO:** at this head the manifest's `foundation.commit`, its embedded `digestCommand` literal and the three `PINNED_COMMIT` constants all read **`dd34e01148440f83b3f595919d865d05a2badbfe`**, with `foundation.measuredAt` `2026-09-30` (`VERIFIED-BY-READ`) — **so every present-tense "the pin now reads `d7b98b5…`" clause in this file is a reading of the `2026-09-28` head and is SUPERSEDED as such; the RULE it establishes is unmoved.** **`§4` REGION INTEGRITY, CHECKED SO THE LIMB'S ANCHOR CANNOT SILENTLY DRIFT: `§4` is still headed `## 4.` and still closed by `## 5. The layer ledger`, the register file `tests/pd-vendor-pin-refresh-register.test.ts` still anchors on those two headings (`registerRegion()`), and the last *"declared refresh reading"* clause in the region is the `2026-09-30` one, which equals the manifest's `foundation.measuredAt`.**
**⟨ANNOTATED `2026-10-05` BY THE `U-FOUNDATION-PIN-REFRESH-3` PASS AND ITS GATES-7+8 PASS (PROOFREADER, `AGENTS.md` item 10b, + ITEM-10d DOCUMENTATION REVIEW, `RCA-6`) — `RCA-8(c)`, ANNOTATE-BESIDE, AND **AT THIS FILE'S HEAD ONLY**: the whole head block above is KEPT VERBATIM as its pass's reading and NOTHING in it is rewritten, renumbered or deleted — this block is the CURRENT STATE BESIDE IT, and the block above's own `dd34e011…` reading is SUPERSEDED AS A READING. **NO CLAUSE ANYWHERE INSIDE THIS FILE'S ANCHORED `§4` REGION (`## 4.` … closed by `## 5. The layer ledger`) WAS ADDED, REMOVED, REORDERED, RESTATED OR ANNOTATED BY THIS PASS, AND NO NEW CLAUSE OF ANY KIND WAS MINTED THERE** — the region's clause count and its last reading clause are UNCHANGED by this note.⟩**
**LAYER (`RCA-12`): DOC-LAYER ONLY — `[T]`/`[D]`/DOC. THIS PASS RAN NO LEG** (no `npm test`, no `npx vitest`, no `typecheck`, no `build`, no `npm run drift`, no `npm run conformance`, no battery, no Electron boot, **no `md5sum`/`sha256sum`/`wc -l`: this pass's wall holds read/`grep`/`glob` + doc writes and NO SHELL**)**, and it TOUCHED NO `src/**`, `scripts/**` OR `tests/**` BYTE. NOTHING HERE IS APP-GREEN, ENVELOPE-GREEN, STORE-GREEN, ENGINE-GREEN OR LIVE-GREEN.**
**ONCE MORE, ONE GENERATION LATER, AND THIS TIME FROM `dd34e011…`:** the head block above records that **the pin this file re-stated (`d7b98b574adc7fa63fbabda617eba2a753f52cb5`) is SUPERSEDED**, at which pass the five value lines read **`dd34e01148440f83b3f595919d865d05a2badbfe`**. **`VERIFIED-BY-READ` at this head by this pass (reader: the proofreader; instrument: direct file reads): the manifest's `foundation.commit` (`vendor/foundation.lock.json`), the single 40-hex literal embedded in its `digestCommand`, and `const PINNED_COMMIT` in each of `tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` ALL READ `93c058f69bd78fd1a80c96044e504deac4737ab3` — five value lines across four files, unmoved in SHAPE; and `foundation.measuredAt` STILL READS `2026-09-30` (`VERIFIED-BY-READ`, this pass) — it DID NOT MOVE with this refresh, so the region this contract owns was NOT re-anchored and did not need to be.** **So every present-tense *"the pin now reads `dd34e011…`"* clause in the block above is likewise a reading of an earlier head and is SUPERSEDED as such: the rule this file establishes — a moved HEAD is a PIN FAULT BY DESIGN met by ONE FOUR-SITE ATOMIC RESTATEMENT in its own unit — is UNMOVED, and the superseded literals are KEPT VISIBLE as annotated citations, never deleted.**
**WHY NOTHING ELSE HERE MOVED, AND WHY THE PIN IS NOT UNGUARDED (`RECORDED READING`, measurer: the `U-FOUNDATION-PIN-REFRESH-3` landing pass, recorded in its DONE row — `docs/next-steps.md`, the newest `⟶ DONE` insert, dated `2026-10-05`; `docs/decisions.md`'s `2026-10-05` annotation beside the pin-ledger rows carries the same reading):** the adjacent `../Provident-Electron` tree advanced **four DOCS-ONLY commits (`ea285ac` · `cd7221d` · `b48b732` · `93c058f6`)** past the revision the block above records, and the refresh's pre-edit premise was **RE-DERIVED: all FIFTEEN module blobs read MD5-IDENTICAL between the two revisions, `15/15`** — so **no re-vendor decision was owed and no vendored byte changed** (`§1.2` `R-3`; the `P-TP` byte-preservation row reads the blobs at whatever the manifest's `commit` then says, which is the point of that row).
**THIS BLOCK'S WALL, STATED SO NO LATER PASS HAS TO GUESS IT:** this pass **edited no `tests/**` byte except ONE test TITLE's prose** (`tests/pd-vendor-manifest.test.ts`'s `§3.3 item 2` row title, the `G-1`-class act the comment block above that row already records as the repo's title-refresh shape — no assertion, no literal, no other row), and it **holds no shell, so it states NO digest and NO test count of its own.** This file's own owed items are UNMOVED and NOT discharged here: the `baselines`-cell re-stamping (its `§9` `E-10`) and the per-module `provenance` wording (its `§9` `E-11`) remain OWED with their named owners. **The review record for this note is the gates-7+8 record of the `U-FOUNDATION-PIN-REFRESH-3` pass — `OWED` at this head: `archive/reviews/**` was read and carries no `2026-10-05` entry yet, so the record's name is not asserted here; the DONE row above is this note's citable address.**

**This pass held a read/search/doc-write wall and NO SHELL.** Every figure below is either a **READ** taken this pass
(`VERIFIED-BY-READ`, reader named) or a **`RECORDED READING` quoted with its measurer named** — never a prediction, and
never a figure this pass produced by running anything. **No line number appears in this file**
(`docs/specs/requirement-catalog.md` §3.4 rule 7): citations are `path` + symbol / row id / `§section`.

**Layer (RCA-12, mandatory declaration).** **DOC-LAYER for every claim in this file.** The unit's evidence is a
**revision/byte oracle** (the `A-3` pin arm of `scripts/foundation-drift.mjs`) **plus a node suite** — an
**envelope/tooling** reading at best. **No claim here is app-green, envelope-green-as-app, store-green, engine-green or
live-green.** The unit **renders nothing, authors no rendered surface, imports no vendored module, and changes no
behaviour**; *"a node-suite green is ENVELOPE-green, not APP-green"* (`docs/specs/rca-live-bugs-green-pipeline.md`
`RCA-12`).

**What this unit IS.** The `PD-VENDOR` pin (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.2) anchors the
**fifteen vendored foundation mechanism modules** to the foundation commit
**`8f193a8d1446ed1e64c4ab6c569941e988f82459`** recorded in `vendor/foundation.lock.json`. The foundation's
**docs-only** commit **`d7b98b574adc7fa63fbabda617eba2a753f52cb5`** — the `U-OVERLAY` inert-route repair that
discharged the dossier's `OS-1` (`docs/specs/pd-ui-6-adoption-dossier.md` §0A) — **has moved the foundation's HEAD past
the pin**. This unit **re-states the pin to that HEAD** and restores the branch's one-red baseline. **It moves the
revision anchor. It does not re-vendor, and it alters no module byte.**

**The architect's ruling, recorded (not re-opened).** Open a **pin-refresh unit** that **re-states the pin to the
foundation's current HEAD**, restoring the one-red baseline. **The fifteen vendored module bytes are UNCHANGED by
`d7b98b5`** (docs only), so **the per-module md5s, the line counts and the byte-identity claim STAND.** The unit's own
cycle, per the ruling: **this contract → a red set → the implementer's green → an adversarial pass (read-only) → a
documentation review → the trio → a decision row → a DONE row.**

**Citation discipline.** `path` + symbol / row id / `§section`, never a line number. **Verification markers used
below.** **`VERIFIED-BY-READ`** = read in this pass from the named tree, reader named. **`RECORDED READING`** = a
figure **measured by somebody else and quoted with that measurer named**; it is **not** this pass's verification.
**`UNVERIFIED`** = named, not settled by this pass, **with what would settle it**.

**⟨AMENDED — the GATE-4 AMENDMENT PASS. Ledger date: the LOCAL/repo day `2026-09-28` (§12.12 `A-12`'s rule); this
pass read no clock and holds no shell, so that date is a CARRIED reading, and if the amendment's own local day
differs the heading is corrected in place rather than left wrong.⟩** This file now carries **a `§12` — THE
AMENDMENT LEDGER** — which **records the gate-4 adversarial verdict (`PASS-WITH-FINDINGS`) and disposes of its
findings `A-1`…`A-12`** plus **the TestWriter's remands `R1`/`R2`/`R3`** and **the implementer's two stated
judgement calls**. **The amendment is ANNOTATE-BESIDE** (`RCA-8(c)`): **every as-filed clause stays VISIBLE, dated,
with its finding id; nothing is deleted and nothing is renumbered.** **This pass writes ONE file** (this one): **no
code, no test, no manifest byte, no tracker row, no other `docs/specs/*.md`** — and **it ran nothing** (no shell).
**The as-filed "NO CODE LANDED, NO TEST LANDED, NO MANIFEST BYTE MOVED, NOTHING RUN by this pass" status is the
FILING pass's status and STAYS VISIBLE**; **the LANDED state is recorded at §12.0** (the refresh, the red set and the
register file have since landed — `VERIFIED-BY-READ` this pass where this pass read them, and quoted with its measurer
otherwise). **Layer: DOC-LAYER for every claim in this amendment** (`RCA-12`; §5): **this unit can never be
app-green — its ceiling is `[T]`/`[D]`/DOC.**

---

## 0. The rulings this unit derives from (recorded, NOT re-opened)

| # | Ruling, and its source | Carried here as |
| --- | --- | --- |
| **R-1** | **Vendoring is the consumption model, and the pin is MECHANICAL** — a machine-readable manifest (`vendor/foundation.lock.json`) plus the `A3` cross-tree monitor, **never prose md5s in a tracker**. — `docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (1); `docs/specs/post-division-rebuild-proposal.md` §4.7 `A-8`; §5 `G-1`; `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §0 `R-2` | §2 (the four sites), §3 |
| **R-2** | **The `A-3` pin arm is the instrument, and it was HOST-FIXED to compare REVISIONS** — a byte-equal tree at another commit is a **PIN fault, never `CLEAN`**. — `scripts/foundation-drift.mjs` → `compareFoundation`, `foundationRevision`, the `A3_LABEL` pin arm; `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §3a `A-3` (`HOST-FIX`), §13.6 | §3 (the three arms), §8 `D-3` |
| **R-3** | **The fifteen vendored module bytes are NOT re-vendored by this unit, and no module byte may be touched.** — the architect's ruling; `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §4 `P-IM-1`, §3.1 `V-1`/`V-5` | §1 (DENIED), §4 `P-TP` |
| **R-4** | **The four divergent baseline files are NOT replaced** (`dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts`). — decision row clause (2); `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §0 `R-3`, §2.1 item 2 | §1 (DENIED) |
| **R-5** | **The conformance leg supplies ZERO behaviour evidence for all fifteen modules** and **no green subset may ever be reported from it**. — `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7, §13.2 (`C4`) | §5 (layer ledger), §7 |
| **R-6** | **No unit may claim a clean trio while a carried red stands**; the branch's pre-existing red set is **TWO** at this head. — `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1); `docs/specs/unit-pd-ui-6-modal-state.md` §7.1/§7.3 (finding `R3`) | §7 (the trio), §10 |
| **R-7** | **A moved foundation HEAD is a pin fault by DESIGN** — *"equal bytes at a different commit are NOT the pinned state"*. **The arm is never to be silenced by making it revision-tolerant.** — `docs/specs/pd-ui-6-adoption-dossier.md` §0A; `docs/pending.md` (the carried condition); `docs/specs/unit-pd-ui-6-modal-state.md` §7.4 | §8 `D-3`, §9 |
| **R-8** | **`G-9`/`X-9` — the protected pin set**: `package.json`'s `test`/`test:watch`, `vitest.config.ts`'s `testTimeout`, `src/main/markdown-import.ts`, two `DEEP_ROWS` files, the `'electron'`-mock name census, `tests/fixtures/v5-bridge-capture-fixture.js`. — `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §0 `R-7`, §2.4 items 1–2 | §1 (DENIED), §6 item 3 |
| **R-9** | **The pin's disposition was CARRIED, not taken, by every pass before this one**, and the two routes named were **(a) re-pin** (touches the manifest + the three `PINNED_COMMIT` constants — *a pin change with its own gate*) and **(b) carry** (leaves two reds and no clean trio available). **This unit is the route (a) gate, opened by the architect's ruling.** — `docs/specs/unit-pd-ui-6-modal-state.md` §7.4; `docs/pending.md`; `docs/next-steps.md` (the `PD-UI-6` disposition note) | the whole file |

### 0A. What this pass READ, and what it did NOT measure

| # | The reading | Kind |
| --- | --- | --- |
| **1** | **`npm run drift` → `DRIFT RESULT: FAIL — 1 PIN fault(s): the adjacent foundation tree's revision d7b98b574adc7fa63fbabda617eba2a753f52cb5 is NOT the pinned commit 8f193a8d1446ed1e64c4ab6c569941e988f82459 … The 15 vendored modules are byte-equal to the adjacent tree — but equal bytes at another commit are NOT the pinned state, so this is NOT CLEAN`** | **`RECORDED READING`** — measurer: **the supervisor** (`docs/specs/unit-pd-ui-6-modal-state.md` §7.4; `docs/pending.md`; `docs/specs/unit-pd-ui-6-adoption-dossier.md` §0A). **This pass ran nothing.** |
| **2** | **the in-suite row `tests/pd-vendor-set.test.ts` `§3.3 item 2` is RED for the same cause** — it was **GREEN at the supervisor's earlier baseline run in the same session**, i.e. **the upstream commit landed in between** | **`RECORDED READING`** — measurer: **the TestWriter's red-set pass** (recorded at `docs/specs/unit-pd-ui-6-modal-state.md` §7.1/§7.4, finding `R3`). |
| **3** | **the branch's pre-existing red set is TWO** — this arm **plus** the carried baseline `P-SM-1` (`strat:stage-seam-schedule-single-active`, defect `PANE-TOGGLE-STAGE-COLLAPSE`) — and **no unit can claim a clean trio while it stands** | **`RECORDED READING`** — measurer: **the supervisor** (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1); the `R3` finding). |
| **4** | **the branch's current counts: `207 files (2 failed / 205 passed) · 4458 tests (2 failed / 4411 passed / 45 skipped)`** | **`RECORDED READING`** — measurer: **the supervisor**. **Arithmetic, printed with its terms:** `4411 + 45 + 2 = 4458` ✔ and `205 + 2 = 207` ✔. |
| **5** | **the adjacent foundation tree's HEAD is `d7b98b574adc7fa63fbabda617eba2a753f52cb5`** | **`VERIFIED-BY-READ`**, this pass, reader: the spec-writer — read from the adjacent tree's git ref file (`.git/HEAD` → `refs/heads/main`). **This independently reproduces the supervisor's reading of row 1; it is a REVISION READ, not a byte or behaviour reading.** |
| **6** | **the pinned literal is carried in FOUR places**, all read this pass: `vendor/foundation.lock.json`'s `foundation.commit` (**and** its `digestCommand` string, which **embeds** the commit) and the `PINNED_COMMIT` constants in `tests/pd-vendor-set.test.ts`, `tests/pd-vendor-manifest.test.ts` and `tests/pd-vendor-drift.test.ts` | **`VERIFIED-BY-READ`**, this pass, reader: the spec-writer. A read of the repo for the literal confirms **four files carry it and no fifth does**. |
| **7** | **the manifest's `baselines` block still carries the PINNED-revision readings** (`npmTest`, `typecheck`, `build`, `battery`, `divergence`, `collectedSuiteCensus` — recorded at the pinned commit's tree states) | **`VERIFIED-BY-READ`**, this pass. **Not a site of this unit's change** — see §1 item 4 and §9 `E-4`. |
| **8** | **the fifteen modules' blob bytes at the refreshed revision** | **`UNVERIFIED` by this pass — it holds no shell.** **What settles it: `git -C <foundation> show <refreshedCommit>:src/shared/<name>.ts` per module** (§3 item 3, the STOP condition). **⟨SETTLED by the gate-4 amendment — `§9 E-8`, `§12.11`: the supervisor's measurement (`diff --name-only` EMPTY across `8f193a8d`…`d7b98b57` for `src/shared`; IDENTICAL blob object-ids at both revisions for all fifteen) is the settling reading, so the STOP did not fire. The as-filed `UNVERIFIED` stands as the FILING pass's status; the implementer's own pre-edit blob read remains the one that gates the edit.⟩** |

---

## 1. Scope — the exact change set (ALLOWED), and what must NOT be touched (DENIED)

### 1.1 ALLOWED — exactly four sites, in ONE atomic restatement

| # | Site | The change, exactly | Layer |
| --- | --- | --- | --- |
| **1** | `vendor/foundation.lock.json` → `foundation.commit` | the 40-hex literal → **the adjacent tree's current HEAD** (`d7b98b574adc7fa63fbabda617eba2a753f52cb5` at this head, `VERIFIED-BY-READ` §0A item 5) | machine data |
| **2** | `vendor/foundation.lock.json` → `foundation.digestCommand` | **the same command, restated against the refreshed revision** — the string must **name the refreshed commit in every place it names a commit** (it is the `git … show <commit>:src/shared/<name>.ts \| md5sum` form today, and its cross-check tail also names the fifteen paths). **The command is recorded VERBATIM as run**, never paraphrased (§2.2's shape rule; Phase-0 spec §3.3 item 1) | machine data |
| **3** | `vendor/foundation.lock.json` → `foundation.measuredAt` | the ISO date of **the refresh's own run** (the form the key already carries). **`UNVERIFIED` by this pass: the refresh's run date.** **Rule, so it is never invented: it is the date the implementer's `npm run drift` reading is taken.** **If the refresh lands on 2026-09-28 the literal is unchanged** (and that is a legitimate outcome, stated rather than forced) | machine data · **⟨AMENDED (gate-4 `A-12`, NON-BLOCKING) — the date's DAY is the reading's LOCAL/REPO day and is AUTHORITATIVE: an `UTC` day that differs (the refresh's run read `2026-09-29` in UTC while its local/repo day was `2026-09-28`) does NOT move the literal; the landed literal is `2026-09-28` and its legitimacy is recorded at `§12.12`.⟩ ⟨AMENDED (gate-4 `A-4`) — this site is now READ by the register: `§4` row 2's domain gains ONE `measuredAt` limb (§4's amended block; `§12.4`), so `§1.1`'s site list and the register's closure name the same four sites.⟩** |
| **4** | `tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` → each file's `PINNED_COMMIT` constant | the 40-hex literal → **the same refreshed revision as site 1**. **The constant's name, position and every use of it are unchanged** — this is a VALUE move, not a rewrite of the row that reads it | `[T]` · **⟨AMENDED (gate-4 `A-5`) — each of these files carries EXACTLY ONE `const PINNED_COMMIT = '<40 hex>'` DECLARATION, in every state of the refresh; a SECOND declaration is a fail-state (`F-12`, R2) and the register's row 2 counts the declarations per file (§4's amended block).⟩ ⟨AMENDED (gate-4 `A-3`, BLOCKING) — this site authorises ONE ADDITIONAL, PROSE-ONLY sub-change in `tests/pd-vendor-manifest.test.ts`: its `§3.3 item 2` row TITLE's abbreviated literal is REFRESHED (§2 items 4–6's amended block, `D-12`, §12.3). **No fifth file joins the change set** (`§1.2` item 6 stands).⟩** |

**The atomicity rule.** The four sites are **one restatement**, not four edits: **a commit that moves one, two or three
of them is a FAILED refresh** (§4 `P-SM`, §6 the red set). **A pin restated in one place only is not a pin** — it is two
authorities disagreeing, which is precisely the false-green class `P-SM` exists to catch.

> **⟨AMENDED — §1.1's LANDED state, `VERIFIED-BY-READ` this pass (the gate-4 amendment pass; reader: the spec-writer),
> kept beside the as-filed clause so the change set is auditable line by line (`§12.0`, `§12.15`).⟩**
> **Site 1** `vendor/foundation.lock.json` → `foundation.commit` now reads **`d7b98b574adc7fa63fbabda617eba2a753f52cb5`** ·
> **site 2** `foundation.digestCommand` now **names that revision in the place it names a commit** (its cross-check tail
> still names the fifteen paths, unchanged) · **site 3** `foundation.measuredAt` reads **`2026-09-28`** — **IT DID NOT
> MOVE, and per `A-12` that is legitimate, not a miss** · **site 4** all three `PINNED_COMMIT` constants
> (`tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts`) read the **same
> refreshed revision**, each file carrying **exactly one** declaration.
> **The implementer's measured count — quoted with its measurer: the implementer pass — is "exactly FIVE moved value
> lines in FOUR files", with `byteIdentity`, the per-module md5s and every `lineCount` UNTOUCHED** (`D-1` confirmed
> correct; the audit's refinement to `D-1` is recorded at `§12.15` and at `§8 D-1`).
> **What is NOT landed and is owed by name:** the `A-3` title refresh (§2 items 4–6) — **`tests/pd-vendor-manifest.test.ts`'s
> `§3.3 item 2` row TITLE still reads the superseded abbreviation `8f193a8…f82459` in the PRESENT TENSE** — and the
> register's re-derivation under §4's amended terms (`§12.16`, §4's amended block), both **owed to the TestWriter**
> (`§12.17`).

**What sites 1–3 are NOT.** They are **not** a re-measurement of the modules. **The manifest's `modules` array — every
`md5`, every `lineCount`, every `provenance`, every `proposalTableAgreement`, every `rowStatus`, `excludedFromVendorSet`,
`moduleCount`, `baselineFilesNotReplaced`, `importCensus` and `conformance` — is UNTOUCHED**, and so is the manifest's
`baselines` block. See §8 `D-1`.

> **⟨AMENDED (gate-4 `A-8`, `A-11` — both NON-BLOCKING; both OWED, both OUTSIDE this unit's change set).⟩** **UNTOUCHED
> stays the rule** (`D-1`, §1.2 items 3/4) — **but "untouched" is not "true", and the audit found two present-tense
> falsehoods inside the untouched cells:**
> **(i) the per-module `provenance` cells** — each reads *"the foundation blob at the pinned commit (recomputed by the
> PD-VENDOR landing pass) + proposal §2 table"* (`VERIFIED-BY-READ` this pass), and **after the refresh that sentence
> names a commit which PREDATES the recomputation** it claims. **The audit's `A-11` premise is now INDEPENDENTLY
> SETTLED, and this spec records the settling measurement with its measurer named: the supervisor measured
> `git -C ../Provident-Electron diff --name-only 8f193a8d1446ed1e64c4ab6c569941e988f82459 d7b98b574adc7fa63fbabda617eba2a753f52cb5 -- src/shared` = EMPTY, and per module `git rev-parse <rev>:src/shared/<name>.ts` yields IDENTICAL blob object-ids at BOTH revisions for all FIFTEEN (equal ids ⇒ equal bytes)** — so the refreshed `digestCommand` re-run at the refreshed revision yields the same digests and **the command's claim is TRUE**; what remains owed is the **wording** (`§9 E-11`, `§12.11`).
> **(ii) the `baselines` block's cells** — **undated present-tense claims, now false** (`collectedSuiteCensus.reading` = *"204 collected files before and after the vendoring"* · the `npmTest` cell a red-set reading at another commit · `divergence` another repo's leg at another head; **the audit's reading of this head is quoted at `§9 E-10` with its measurer**). **The audit's acceptance condition is recorded here: each cell is acceptable ONLY `measuredAt`-stamped and scoped to its own commit** — **which is a MANIFEST EDIT, ruled out by §1.2 item 4, so it is an OWED ESCALATION, not a silent park** (`§9 E-10`, `§12.8`). **Leaving it is a live false claim in machine-readable JSON, and this unit's authorised change set does not cover it.**

### 1.2 DENIED — what this unit may NOT touch, and the rule each denies

| # | Denied surface | The rule that denies it |
| --- | --- | --- |
| **1** | **the fifteen vendored `src/shared/<name>.ts` bytes** — no edit, no re-copy, no reformat, no BOM/CRLF normalization, no re-vendoring | `R-3`; Phase-0 spec §4 `P-IM-1`, §3.1 `V-1`/`V-5` |
| **2** | **the four divergent baseline files** (`src/shared/dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts`) | `R-4`; Phase-0 spec §3.1 `V-4` |
| **3** | **the manifest's `modules` md5 set** — **unless a blob differs at the refreshed revision**, in which case **STOP** (§3 item 3) | `R-3`; §3 item 3 |
| **4** | **the manifest's `baselines` block readings** (they describe earlier tree states and their stale figures are a **separate** question with its own gate — §9 `E-4`) | this filing; `AGENTS.md` item 6's tracker discipline |
| **5** | **`tests/pd-vendor-set.test.ts`'s row `§3.3 item 2`** — it stays EXACTLY where it is. **The refresh TURNS IT GREEN; it is not edited to accommodate the change and never relaxed** (§6 item 2) | `R-2`; the Phase-0 spec's `D-12` (*"a spec may not edit a test"*) applied to this unit's own act |
| **6** | **every other test file** — including the two `pd-ui-*` register/adoption files and the two `unit-o0-m1-m3-*pins*` files | `§1.1`'s change set is exhaustive |
| **7** | **`vitest.config.ts` · `package.json` · `scripts/**`** (the monitor's bytes least of all — **the instrument is not adjusted to the pin; the pin is restated to the instrument's terms**) | `R-8`; `R-7`; `D-3` |
| **8** | **anything under `../Provident-Electron/**`** — **adjacent, readable, NEVER modifiable**, and this unit does **not** need to write it: the refresh moves **this repo's** record of the revision | `G-8` (Phase-0 spec §0A note 7's neighbourhood; the foundation is read-only to this project) |
| **9** | **`docs/skills/designing-pages.md`** — **this unit renders nothing**, so there is no coverage-matrix row and no demo-page index entry to update. **`VERIFIED-BY-READ` (this pass): the file does not exist in this repo** (a glob of `docs/skills/*` returns `process-guardrails.md` alone; Phase-0 spec `D-9` and `docs/specs/unit-pd-ui-6-modal-state.md` `D-11` record the same absence). **The honest form is an ABSENCE row, not a silent skip** (§9 `E-5`) | `AGENTS.md`'s designing-pages duty **does not apply to a unit that authors no page** |
| **10** | **any tracker row, any `docs/decisions.md` row, any other `docs/specs/*.md`** — this SPEC pass writes **one** file (this one). **The decision row and the DONE row are the cycle's later steps, owned per §8 `D-8`** | `AGENTS.md` item 6; the unit's own cycle (the ruling) |

> **⟨AMENDED — the DENIED surface, as the gate-4 findings sharpened it. NOTHING in this table is widened; three cells are
> made precise, and the precision cuts ONE way: `§1.2` denies EDITS, not READS.⟩**
> **(a) Item 7 (`scripts/**`) — the monitor is a READ-ONLY INSTRUMENT here, and the register's declared comparator drive
> READS it.** `R-8`'s `G-9`/`X-9` protected set does **not** include `scripts/foundation-drift.mjs` (`VERIFIED-BY-READ`:
> `R-8` names `package.json`'s `test`/`test:watch`, `vitest.config.ts`'s `testTimeout`, `src/main/markdown-import.ts`, two
> `DEEP_ROWS` files, the `'electron'`-mock census and the fixture), and `tests/pd-vendor-drift.test.ts` already **reads the
> monitor by name** (`loadComparator` → its exported `compareFoundation`; `VERIFIED-BY-READ`). **So: `§4` row 1's declared
> comparator drive may READ (`import`) the monitor's exported `compareFoundation`/`foundationRevision` — an
> `EXECUTING-A-READ, NEVER-AN-EDIT` reading — and `F-8`'s frozen-file list is UNCHANGED** (`§12.7`, `§12.10`). **The denial
> on the monitor's BYTES stands exactly as filed: `F-4`'s loosening is still the single worst outcome.**
> **(b) Item 6 — `tests/pd-vendor-manifest.test.ts` is NOT "every other test file": it is `§1.1` item 4's own file, and
> `A-3` adds ONE prose-only sub-change inside it** (the row title). **No fifth file joins the change set** (`§12.3`).
> **(c) Item 5 stands UNCHANGED and is re-affirmed: the `tests/pd-vendor-set.test.ts` row `§3.3 item 2` is never edited,
> never retitled, never relaxed** (`F-5`, `D-5`).

> **⟨AMENDED — THE DENIAL'S CARVE-OUT, `2026-09-30` (the LOCAL/repo day of the second refresh unit
> `U-FOUNDATION-PIN-REFRESH-2`'s landed run; this pass read no clock and holds no shell, so the date is carried from
> that unit's record rather than measured here). THE SUPERVISOR'S RULING, recorded in the supervisor's own terms; and it
> is a CARVE-OUT, not a widening: the paragraph above is the FILING pass's wording and STAYS VISIBLE (`RCA-8(c)`,
> annotate-beside) — the denial stands as written for the pass that wrote it, and the exception it did not name is
> recorded HERE, dated, with the conflict that produced it.⟩**
>
> **THE CARVE-OUT'S TERMS.** **`§1.2` item 10's denial — *"any tracker row, any `docs/decisions.md` row, any other
> `docs/specs/*.md`"* — now reads: *"…EXCEPT one dated, annotate-beside RE-ANCHORING CLAUSE inside this contract's own
> `§4` region, ordered by a refresh contract's measured-day coupling (`unit-foundation-pin-refresh-2.md` `§2.5` clause 4)
> — an additive clause that re-anchors the declared refresh reading, moves no tooth and removes no line."***
>
> **THE CARVE-OUT'S NARROW SCOPE, stated so no later pass widens it by implication.** It permits **ONE** dated clause,
> **inside this contract's `§4` region** — i.e. inside **this very file**, never another spec, never a tracker row, never
> a decision row — carrying **one new *"declared refresh reading (`<YYYY-MM-DD>`)"***. The clause is **ADDITIVE** (it
> appends; it deletes no line, renumbers nothing and rewrites nothing) and it **relaxes no tooth and moves no register
> term**: the `measuredAt` limb keeps every condition it had (**present** · **`YYYY-MM-DD`** · **equal to the declared
> reading**). **Everything else in item 10 stands exactly as denied — a tracker row, a `docs/decisions.md` row, any OTHER
> `docs/specs/*.md`, and any `archive/**` move remain DENIED to a refresh unit's landing pass.**
>
> **THE CONFLICT, recorded because the record is where a finding lives or dies** (the sibling contract's `§13` rule ④:
> *a finding recorded nowhere is a finding DROPPED*). **The denial and the coupling requirement were in DIRECT conflict,
> and the conflict was UNADJUDICATED in the record when it arose.** **(i) THE COUPLING REQUIREMENT** — the sibling
> contract `docs/specs/unit-foundation-pin-refresh-2.md` **`§2.5` clause 3 / clause 4** (carried as its `F-15` and
> `O-3`) **REQUIRES the first unit's register region to be re-anchored IN THIS CONTRACT'S `§4` REGION within the same
> landing whenever `foundation.measuredAt` moves**; and **the run's own local/repo day (`2026-09-30`) differed from the
> day the manifest recorded (`2026-09-28`), so the move was forced, not optional** (**`RECORDED READING`** — the landed
> refresh run; **`VERIFIED-BY-READ`** this pass, reader: the spec-writer, at **`§4`'s landed re-anchoring clause**: it
> carries the pair **`2026-09-28` → `2026-09-30`** and states that no tooth is relaxed and that the terms
> `7` + `16` + `21` = `44` stand). **(ii) THE DENIAL** — item 10 above **DENIED *"any other `docs/specs/*.md`"*, and the
> ordered re-anchoring site IS another `docs/specs/*.md`** (this one), **so satisfying the coupling rule breached that
> denial on its face.** **(iii) WHAT THE IMPLEMENTER DID** (**`RECORDED READING`** — measurer: **the implementer's
> landing pass**; **re-read this pass, `VERIFIED-BY-READ`**): it **took the coupling rule and inserted an ADDITIVE
> re-anchoring clause at this contract's `§4` region end (no removed line)**, and **the register's reader parses it
> correctly** — `tests/pd-vendor-pin-refresh-register.test.ts`'s `declaredRefreshReading()` takes the **LAST** declared
> refresh reading in the anchored region, **that clause now yields `2026-09-30`, and `P-SM-pd-pin-2` HOLDS**.
> **(iv) THE REFUSED ALTERNATIVE** (**`RECORDED READING`**): letting the date move with no re-anchoring would have
> produced a **THIRD red**, which **the sibling contract's `§6` no-other-red rule FORBIDS** (*"a refresh which makes any
> OTHER arm red is a REGRESSION, not a success"*). **(v) THE SUPERVISOR'S RULING, recorded in terms: THE IMPLEMENTER'S
> READING WAS RULED CORRECT — THE COUPLING RULE GOVERNS, AND THIS ITEM'S DENIAL CLAUSE WAS UNDER-SPECIFIED AS FILED**
> (it was written for the FILING pass's own one-file wall and did not contemplate a LATER refresh contract ordering a
> clause into this region). **This carve-out is the wording of that ruling; it mints no new decision.**
>
> **WHAT THIS ANNOTATION IS NOT, stated so nothing here is over-read.** It is **not** a licence to edit this contract
> again — the exception is bounded to a re-anchoring declaration ordered by a refresh contract's measured-day coupling.
> **`§4`'s landed re-anchoring clause is NOT touched by this annotation** and **is correct as landed**
> (**`VERIFIED-BY-READ`** this pass: it carries the superseded `2026-09-28` visibly beside `2026-09-30`, is a
> **CONTRACT clause and not a register term**, and leaves `7` + `16` + `21` = `44` standing); **and no other clause of
> this file is re-opened, renumbered or reworded here.** **This file's only other later-unit annotation is the
> `2026-10-04` gates-7+8 documentation-review block at the head of the file, which is untouched by this pass.**
> **The unit's own record of the conflict, its resolution, and its finding census is
> `docs/specs/unit-foundation-pin-refresh-2.md` `§13` — whose as-filed EMPTINESS is the gate-4 finding `G-4`.**

### 1.3 The unit's own cycle (the ruling, recorded so no step is skipped)

**this contract → a red set (§6) → the implementer's green → an adversarial pass, read-only (§7 item 6) → a
documentation review (`AGENTS.md` item 10d / `RCA-6`) → the trio (§7) → a decision row (§8 `D-8`) → a DONE row (§10).**
**RCA-1 binds the order: the red set is authored and RUN before the manifest or any constant moves, and the red run's
reading is recorded in the DONE row.**

---

## 2. The surface — the four pin sites, item by item

**1. `vendor/foundation.lock.json` → `foundation.commit`.** The pin's single authoritative revision literal. A 40-hex
string; the shape is pinned by Phase-0 spec §2.2's normative manifest shape. **Its consumers, all `VERIFIED-BY-READ` this
pass:** `scripts/foundation-drift.mjs` → `compareFoundation` reads it as `pinnedCommit` and compares it to the tree's own
`foundationRevision`; `tests/pd-vendor-set.test.ts`'s row *"the manifest's `foundation.commit` is CONSUMED"* reads it and
takes `git -C <foundation> show <commit>:src/shared/<name>.ts` for all fifteen; `tests/pd-vendor-manifest.test.ts` asserts
it twice (against its own constant, and once more in a second row).

**2. `vendor/foundation.lock.json` → `foundation.digestCommand`.** **It EMBEDS the commit**, so it moves with site 1 —
this is why the change set is *three manifest keys*, not one. Its shape rule is Phase-0 §2.2/§3.3 item 1's: **the command
recorded verbatim as run**. A `digestCommand` that still names the old revision while `commit` names the new one is a
**partially restated pin** and reds `P-SM` (§4).

**3. `vendor/foundation.lock.json` → `foundation.measuredAt`.** The date of the refresh's own reading. **It is a date of
a RUN, never a date of a copy**: the implementer records the date the refreshed reading was taken.

> **⟨AMENDED (gate-4 `A-12`, NON-BLOCKING — `SPEC amends`).⟩ The RUN's day is the run's LOCAL/REPO day, and that is the
> authoritative one** (`§1.1` item 3's amended cell; `§12.12`): **a UTC day that differs — the refresh's run read
> `2026-09-29` in UTC to the implementer while the local/repo day was `2026-09-28` — does not move the literal, and the
> landed literal `2026-09-28` legitimately did NOT move.** **The register's `measuredAt` limb (`§4` row 2) asserts the
> SHAPE and the DECLARED refresh date together, so a corrupted or absent date is a red rather than an unread site.**

**4–6. The three `PINNED_COMMIT` constants.** `tests/pd-vendor-set.test.ts` (read by the `§3.3 item 2` revision-arm row
and by the blob-containment row), `tests/pd-vendor-manifest.test.ts` (read twice, against the manifest), and
`tests/pd-vendor-drift.test.ts` (used as `syntheticManifest`'s **default** `foundation.commit` **and** as the
*must-DIFFER* anchor in the equal-bytes-at-another-revision fixture). **`VERIFIED-BY-READ` this pass: no other file in the
repo carries the literal, in full or abbreviated.** A **seventh-site trap, named so it is not stumbled into:** the
**abbreviation `8f193a8…f82459` appears in a row TITLE** (`tests/pd-vendor-manifest.test.ts`, the `§3.3 item 2` row's
title) — **a title is prose, not a site**: the implementer **may** refresh it for honesty, and **neither its refresh nor
its retention changes any assertion.** **`foundation-return-shapes.ts`, `src/shared/**` and the foundation tree carry no
copy of the literal and are not sites.**

> **⟨AMENDED (gate-4 `A-3`, BLOCKING — `HOST-FIX` + `SPEC amends`, and the as-filed framing is CORRECTED: this is not a
> trap, it is a LIVE FALSE STATEMENT.)⟩**
> **What the audit measured (`RECORDED READING`, measurer: the gate-4 adversarial pass; re-read this pass,
> `VERIFIED-BY-READ`):** `tests/pd-vendor-manifest.test.ts`'s `§3.3 item 2` row TITLE still reads *"foundation.commit
> equals the pinned revision `8f193a8…f82459`"* — **present tense, and present-tense FALSE since the refresh landed** —
> and **the landed register FREEZES it**: `tests/pd-vendor-pin-refresh-register.test.ts` asserts
> `manifestPinText.includes('8f193a8') && manifestPinText.includes('f82459')` **`.toBe(true)`**, with the prose *"the
> control has a subject"* (`VERIFIED-BY-READ` this pass). **So an implementer who exercised the permission this clause
> grants and refreshed the title would RED a row that is GREEN today, and the failure message would blame the CONTROL**
> (`§12.3`).
> **THE RULING (recorded; the permission is EXERCISED, not merely permitted):**
> **(i) the title IS refreshed** — it names the refreshed revision (`d7b98b57…`); **(ii) the superseded literal is KEPT
> as an EXPLICITLY-ANNOTATED HISTORICAL CITATION, never deleted**, in the form
> **`⟨superseded: 8f193a8…f82459 was the pin before the 2026-09-28 refresh⟩`** — a superseded reading stays VISIBLE
> (annotate-beside, `RCA-8(c)`), **so the row still carries its own history in the tree**; **(iii) the register's control
> moves to a SYNTHETIC title text** — the register already builds one (`syntheticTitleText`,
> `VERIFIED-BY-READ`), **and that synthetic text IS the control's subject from now on: the register NEVER FREEZES A REAL
> FILE'S PROSE** (`D-12`). **The real-file limb that MAY stay is the DECLARATION COUNT** (`constantDeclarationCount …
> .toBe(1)`), **which `A-5` folds into row 2's declared domain** — **the abbreviation's presence in a real file may no
> longer be asserted at all.**
> **Owner: OWED TO THE TESTWRITER — two test-side halves** (the title refresh + the register's control substitution;
> `§12.17`). **A prose-only title is not an assertion, so `A-3` adds no assertion anywhere** — and the row that this file
> protects (`tests/pd-vendor-set.test.ts` `§3.3 item 2`) is **untouched** (`§1.2` item 5, `D-5`).

**The STOP condition (this unit's only STOP).** **If the refreshed revision's blob for ANY of the fifteen modules
differs from the pinned revision's blob — even by one byte — the refresh is NOT this unit's act.** The ruling's premise
is that `d7b98b5` is **docs only**. If the premise is false, then **this unit owns a REAL RE-VENDOR DECISION, not a
refresh**: the implementer **STOPS**, records the differing modules with both digests and the revisions read, and
escalates to the architect (`G-8`'s discipline: a foundation-side divergence is **handed off**, never absorbed). **A
pass that silently re-copies a module to make the manifest agree has performed an unauthorised re-vendoring and is a
review finding.** **What settles the premise:** the per-module blob read of §3 item 3, which the implementer's pass
takes **before** it edits anything.

---

## 3. Mechanics — the pin instrument, every arm, and every fail-state

**The instrument (no new mechanism, no new dependency).** `scripts/foundation-drift.mjs`, run by the existing
`npm run drift` (`package.json` `scripts.drift`), plus the in-suite `§3.3 item 2` row. **Its layer is
`[D]`-class local instrument / `[T]` node-pure — never app** (`R-2`; Phase-0 spec §2.3).

**1. The three arms, and what each MEANS (exact).**

| Arm | When it reads | What the reading MEANS | Exit |
| --- | --- | --- | --- |
| **`CLEAN`** — `DRIFT RESULT: 15 checks, 0 differences — CLEAN` | the tree is present, its own `git -C <foundation> rev-parse HEAD` **EQUALS** the manifest's `foundation.commit`, **and** every vendored module's digest equals the foundation's | **the pinned state**: the record and the tree agree **by revision AND by byte**. **It is NOT app evidence, and NOT behaviour evidence.** | `0` |
| **`FAIL`** — `DRIFT RESULT: FAIL — <n> PIN fault(s): …` (and, on a local/manifest fault, the local reason) | the tree's revision **≠** the manifest's pin **while the bytes are equal** (today's reading), **or** the manifest is missing/unparsable/not set-equal to the fifteen, **or** a vendored module is missing/a symlink/mismatched locally | **a PIN fault.** The two faults it distinguishes are **"a moved revision"** and **"a local edit"** — **`FAIL` on a moved revision at equal bytes is the `A-3` fix behaving exactly as designed (`R-7`), NOT a byte drift** | `1` |
| **`SKIPPED`** — `DRIFT RESULT: SKIPPED — … the cross-tree arm is SKIPPED … a SKIPPED reading proves NOTHING about the pin` | the foundation tree's `src/shared/` **is not a readable directory** (the fork must work standalone) | **neither a pass nor a failure, and PROVES NOTHING ABOUT THE PIN** — no revision is read, so no byte or revision evidence is taken. **A DONE row citing `SKIPPED` must carry that honesty statement, and may NOT convert it into a pin claim** | `0` |

**`DRIFT` is the fourth declared status** (`<n> of 15 modules differ from the foundation tree`, exit `1`) — **a genuine
byte drift with the pin ARMED**: it is **not** this unit's situation and **must not** be reported as one.

> **⟨AMENDED (gate-4 `A-7`, NON-BLOCKING — the monitor's strongest surviving FALSE-GREEN, a PRE-EXISTING instrument seam,
> NOT a refresh regression.)⟩** **The audit's reading (`RECORDED READING`, measurer: the gate-4 adversarial pass; all four
> limbs re-read this pass, `VERIFIED-BY-READ`, reader: the spec-writer):** `scripts/foundation-drift.mjs`'s `runMonitor`
> treats a present `src/shared/` directory as "go" and **takes no `.git` precondition**; the pin arm runs only when
> `foundationRevision` returned a non-empty revision, and `renderReport`'s `CLEAN` branch then prints the *"NO revision
> reading was taken (the tree is not a git repository), so this reading is a BYTE reading only — it proves NOTHING about
> the pin"* line **INSIDE an otherwise `CLEAN` report**, with **exit `0`**. **So a foundation tree present with the pinned
> bytes and NOT a git repository READS `CLEAN`, exit `0`.**
> **THE CONTRACT RULING, recorded so the arm cannot be consumed as a pin claim:** **a `CLEAN` reading whose
> `revisionChecked` is not `true` is a BYTE-ONLY reading** — **it is NOT the pinned state of this item 1's `CLEAN` row**,
> **it may never be cited as pin evidence**, and **a DONE row quoting it must quote the disclaimer with it** (the same
> discipline as `SKIPPED`, `F-10`). **Two further readings from the same limb, both `VERIFIED-BY-READ` this pass:**
> **(a) the disclaimer's stated CAUSE is not the measured cause** — the `else` branch covers *any* failed `rev-parse`
> (an unreadable or broken `.git` included) while the sentence asserts *"the tree is not a git repository"*; **(b) the
> landed register-side row for this situation** (`tests/pd-vendor-drift.test.ts`, its §2.3-row-2 CLI case, driven over a
> temp tree that carries `scripts/foundation-drift.mjs`, `vendor/`, `src/shared/`, a `node_modules` symlink **and no
> `.git`**) asserts the printed `/CLEAN/` and `code === 0` **without asserting that the report does not claim the pin.**
> **DISPOSITION: a SEPARATE, NAMED GATE — `E-9`** (`§9`, `§12.7`), **owned by the monitor's owning unit, never a silent
> park, and NOT this unit's act**: the monitor is `scripts/**`, which **`§1.2` item 7 forbids this unit to touch**. **The
> fix shape is NAMED there** (a distinct status label for a byte-only reading, and/or refusing exit `0` when no revision
> was read) **together with its one known test-side consequence** (the landed `pd-vendor-drift` row above asserts `CLEAN`
> + exit `0` for exactly that tree, so that gate owns its amendment too).

**2. The in-suite arm — `tests/pd-vendor-set.test.ts` `§3.3 item 2`.** It reads the adjacent tree's
`git rev-parse HEAD` and asserts equality with its own `PINNED_COMMIT`. **It is RED today** (§0A item 2) **for the same
fault the monitor reports**, and **the refresh turns it green. The row's text, predicate and location do not move.**

**3. The refreshed-revision premise check (pre-edit, mandatory, and the STOP gate).** Before any site moves, the
implementer takes, per module: **the manifest's declared `md5`** · **an `md5` of `src/shared/<name>.ts`** · **an `md5` of
`git -C <foundation> show <refreshedCommit>:src/shared/<name>.ts`**. **All three equal ⇒ the refresh proceeds.** **Any
inequality ⇒ §2's STOP condition.** *(`RECORDED READING` for the first two, as of the pinned revision: the manifest's
`modules` digests and the vendored bytes are **15/15 REPRODUCED** — measurer: the supervisor, Phase-0 spec §9 `O-1`'s
discharge and §13.6; **this pass verified nothing and holds no shell**.)*

**4. Every documented fail-state of the refresh itself.**

| # | Fail-state | The exact rule violated |
| --- | --- | --- |
| **`F-1`** | **a PARTIAL restatement** — the manifest's `commit` moves and one or more `PINNED_COMMIT` constants do not (or the reverse) | §1.1's atomicity rule; §4 `P-SM`. **This is the unit's signature failure**, because every individual site looks locally correct |
| **`F-2`** | **`digestCommand` left naming the OLD revision** while `commit` names the new one | §2 item 2; §4 `P-SM` |
| **`F-3`** | **a module byte changed to make the refreshed blob agree** (a re-vendor disguised as a refresh) | §2's STOP condition; `R-3`; §4 `P-TP` |
| **`F-4`** | **the refresh "fixes" the red by making the instrument revision-tolerant** (dropping or loosening the pin arm, hard-coding `CLEAN`, accepting a byte-equal tree at any commit) | `R-7`; §8 `D-3`. **The single worst outcome available to this unit** — it destroys the one property the `A-3` fix exists for |
| **`F-5`** | **the `§3.3 item 2` row is edited, retitled, relaxed, skipped or deleted** to accommodate the change | §1.2 item 5 |
| **`F-6`** | **a `G-9`-pinned file is touched** to make anything pass (`vitest.config.ts`, `package.json`'s pinned scripts, the mock census) | `R-8`; §1.2 item 7 |
| **`F-7`** | **the new register test file mocks `'electron'`** | the protected bridge-mock census pins the **exact five-name set**; **the register file imports `node:*` builtins, `vitest` and nothing else** (`R-8`) |
| **`F-8`** | **the new register file reads a `G-9`-frozen file** (in particular `vitest.config.ts`) | `R-8`; Phase-0 spec §2.4 item 2 |
| **`F-9`** | **the adjacency is written to** — a "repair" under `../Provident-Electron/**`, however well-intentioned | §1.2 item 8 |
| **`F-10`** | **a `SKIPPED` reading is reported as a green pin** | §3 item 1's `SKIPPED` row; Phase-0 spec §2.3 honesty rule 1 |
| **`F-11`** | **the DONE row reports `CLEAN` without the tree state and the revision it read** — or reports a clean trio while the carried baseline red stands | §10 item 4; `R-6` |
| **`F-12`** *(added by the gate-4 amendment — `A-5` + the TestWriter's remand `R2`)* | **a SECOND `PINNED_COMMIT` declaration in any of the three constant files** (with its own literal, in either declaration order) — **one file, two authorities**, invisible to the as-filed row 2 because its `constantDeclarationCount(...).toBe(1)` checks sat OUTSIDE the row's declared domain | §1.1 item 4's amended cell; §4 row 2's amended domain (the per-file declaration-count term); `§12.5`, `§12.14` |
| **`F-13`** *(added by the gate-4 amendment — `A-4`)* | **an absent, ill-formed or uncoupled `foundation.measuredAt`** — a missing date, a non-`YYYY-MM-DD` string, or a date that is not the refresh's own declared local/repo-day reading | §1.1 item 3's amended cell; §2 item 3; §4 row 2's amended domain (the `measuredAt` limb); `§12.4` |

---

## 4. The typed Property register (house `§5.x`-class; carried here as `§4` — **CODE-BEARING UNIT, register REQUIRED**)

**Why a register and not the zero-row exemption.** This unit **moves a revision anchor that four files consume**, and
its central claims are **quantifications over a closed set** (the four pin sites; the fifteen modules). `AGENTS.md`
item 11 (`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`) **forbids the zero-row exemption**, and **no superseded `§5.5.0`
exemption exists in this repo** — so the register is authored, not exempted. **A code-bearing unit with no register and
no recorded rationale is a review finding.**

**Row-id note (so a citation resolves).** The house prefixes **`P-IM` / `P-SM` / `P-TP`** are carried **qualified with
this unit's token** — **`P-IM-pd-pin-1` · `P-SM-pd-pin-2` · `P-TP-pd-pin-3`** — because the **bare ids are already
occupied**: `P-IM-1`, `P-SM-1`/`P-SM-2` and `P-TP-1`/`P-TP-2` live in the Phase-0 register
(`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §4), and a **bare `P-SM-1` is additionally the carried branch
baseline** (`strat:stage-seam-schedule-single-active`). **The same collision the sibling unit recorded**
(`docs/specs/unit-pd-ui-1-theme.md` §4's row-id qualifier; `docs/specs/unit-pd-ui-6-modal-state.md` `D-12`). **No `F-`
row, no `§6`/`FS-n` citation.**

**Shared machinery (pinned once, binding on every row).**

- **Seed:** **`0x20260928`** — a fixed literal in the test file; **never** `Date.now()`, never `Math.random()`, never an
  environment read. Where a row uses a generator it is a **hand-rolled 32-bit LCG**, one step per draw
  (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`), selecting a pool member by `index = stateₙ₊₁ mod pool.length`.
- **Caps:** **≤100 attempts per row, ≤400 in total**; rows run **sequentially in register order**; **STOP AFTER 5
  CONSECUTIVE FAILURES**. **No new dependency, no PBT library, no sixth leg** — plain deterministic vitest tables.
- **Terms (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`):** every term is printed **as the sum of its own factors**; a
  term counting **distinct inputs** rather than **drives** says so.
- **Reporting (required):** every row reports **`held`/`broken`** with its **strategy id**. Every row carries a
  **control whose expected outcome is the OPPOSITE of the row's verdict**, and the row is `held` **only if the control
  discriminates**.
- **Class meaning here:** **`P-IM` = an invariant of the PIN ITSELF** · **`P-SM` = a safety property over the
  repo state this unit may not disturb** · **`P-TP` = a totality / discrimination property over the unit's own
  instruments.**
- **`(bounded)`** is marked where the property text quantifies more broadly than the finite domain it drives — a
  bounded row is **execution design, not a proof of the universal it states**.
- **Layer:** every row is **`[T]` (node/pure) or `[D]` (the monitor driven from the suite)**. **No row is app-green**
  (`RCA-12`).
- **⟨AMENDED (gate-4 `A-9`, NON-BLOCKING — `HOST-FIX` to the register; REQUIRED of the TestWriter.)⟩ Anchor:** every
  limb that reads THIS CONTRACT **must anchor to the `§4` TABLE REGION and to the ARITHMETIC** — the region from `§4`'s
  header through the attempt tally, addressed by its own declared row ids, strategy ids, seed, caps, stop rule and TALLY
  LINE — **never a global regex or a whole-file `toContain` over the spec**. **Why: the as-filed row reads the WHOLE spec
  file with global regexes** (`0x20260928`, the as-filed attempt tally line `4` + `6` + `20` = `30`, `≤100 attempts per row`,
  `≤400 in total`, `STOP AFTER 5 … CONSECUTIVE FAILURES`, each row/strategy id, and `/RED[\s\S]{0,600}?GREEN-ON-ARRIVAL/`
  — all `VERIFIED-BY-READ` this pass), **so a legitimate future amendment of this contract — THIS ONE included — reds the
  suite, and the red would blame the contract for obeying its own amendment discipline.** **The arithmetic limb must assert
  the CURRENT terms (§12.16), with any earlier arithmetic reachable ONLY through an explicitly-named superseded block.**

| # | Row id | Property (falsifiable) | Domain / strategy | Attempts | `(bounded)`? |
| --- | --- | --- | --- | --- | --- |
| 1 | **`P-IM-pd-pin-1`** | **THE MANIFEST'S PIN EQUALS THE ADJACENT TREE'S HEAD.** When the adjacent tree is present and readable as a git repository: `git -C ../Provident-Electron rev-parse HEAD` **equals** `vendor/foundation.lock.json`'s `foundation.commit`, **as full 40-hex strings**. **When the tree is absent or unreadable the row MUST FAIL LOUDLY, naming the path and the error — never skip, never pass.** **This is the arm that is RED at this head and that this unit turns green.** **Control (discriminating):** a synthetic manifest whose `foundation.commit` is **one hex character different** MUST fail the same oracle, and a **read of a second, independently produced revision** (a fresh `rev-parse` in a temp repo) MUST be shown **not** to be accepted when it differs. | **strategy `strat:pd-pin-manifest-vs-head`** — `1` real HEAD read + the manifest's key + `1` negative-control manifest + `1` control revision read | **4 = `1` real pair × `2` limbs (`rev-parse` status, equality) + `2` controls** | **`(bounded)` ON THE PRESENCE CONDITION** — *"when the tree is present"* is a **precondition**, so the row is `SKIPPED-as-FAILED` when absent rather than vacuous |
| 2 | **`P-SM-pd-pin-2`** | **THE PIN IS RESTATED IN ALL FOUR SITES, ATOMICALLY.** Read `foundation.commit` from the manifest; then assert that **each** of the three test files' `PINNED_COMMIT` constants **equals it**, **and** that the manifest's `digestCommand` **contains that same 40-hex literal** (the digest command's own cross-check tail may name the paths; the **revision it names must be the pin**). **Four sites, one value, zero exceptions.** **At THIS head the row is GREEN-ON-ARRIVAL** (all four carry the old literal consistently) — **it is the regression guard against `F-1`/`F-2`.** **Control (both ways):** a synthetic source text whose constant carries **one different character** MUST fail; **and** the same oracle MUST accept a text in which **all four** carry a **third, arbitrary 40-hex value** (so the row asserts *agreement*, never a specific literal). | **strategy `strat:pd-pin-four-site-agreement`** — `3` constant reads + `1` `digestCommand` substring limb + `2` synthetic controls (divergent constant; a consistent alternative revision) | **6 = `3` + `1` + `2`** | **NO** — the site set is closed (the three constants + the two manifest limbs) |
| 3 | **`P-TP-pd-pin-3`** | **THE BYTE-IDENTITY CLAIM SURVIVES THE REFRESH: at the REFRESHED revision, each of the fifteen modules is byte-equal to that revision's blob.** For every one of the fifteen: `git -C <foundation> show <refreshedCommit>:src/shared/<name>.ts` **is byte-equal** to `src/shared/<name>.ts` — **the blob at the RECORDED COMMIT, never the adjacent working tree alone** (a working-tree read is `A-3`'s evadable arm), **and** the module's md5 equals the manifest's declared `md5`. **This is the row that falsifies `F-3` and, with it, the STOP condition's premise.** **Control (discriminating):** a module text perturbed by **one byte** MUST fail the oracle; a module **missing** at the recorded revision MUST fail **naming the path**; a **symlink** at the vendored path MUST fail (the regular-file rule). | **strategy `strat:pd-pin-refreshed-blob-identity`** — the fifteen modules × (blob-equality + manifest-md5 equality) + `3` synthetic controls (perturbed byte, absent blob, symlink) + `2` LCG-drawn modules re-driven | **20 = `15` × `1` + `3` + `2`** | **NO** — the set is the pin's own fifteen, matched exactly |

### 4.1 ⟨AMENDED — THE THREE ROWS' CURRENT DECLARATIONS (the gate-4 amendment; the TABLE above is the AS-FILED declaration and STAYS VISIBLE)⟩

**Where the two differ, THIS BLOCK is the CURRENT declaration** and the register must read it: `§4`'s machinery, ids,
classes, seed, caps, stop rule and the ROW SET are unchanged (**still exactly three rows**); **only the per-row
domains, controls and terms move** — plus the anchoring bullet above. **Each move names the finding that ordered it; the
old arithmetic is printed beside the new at §12.16, and `§4`'s as-filed tally line is KEPT as filed.**

**`P-IM-pd-pin-1` — `strat:pd-pin-manifest-vs-head` (amended by `A-10`, `A-7`):**
**Current declaration: `7 = 1 real pair × 2 limbs + 1 comparator pin-arm drive + 4 controls`.**
① the real pair's **`2` limbs** (`rev-parse` status, equality) are **as filed**, including the **`SKIPPED-as-FAILED`**
rule; ② **NEW — `1` MONITOR PIN-ARM COMPARATOR DRIVE** (`A-10`): the row must drive the **monitor's OWN pin arm**
(`scripts/foundation-drift.mjs`'s exported `compareFoundation`, **READ, never edited** — `§1.2` item 7's amended
annotation) with **byte-equal inputs and an EXPLICIT divergent `foundationRevision`**, and the reading **MUST NOT be
`CLEAN`** — the as-filed controls drove a one-line `===` oracle instead, **which proves nothing about the instrument**;
③ the controls go from **`2` to `4`**: **(c1)** the one-hex-different synthetic manifest, with **the mutated POSITION
drawn from the pinned LCG over the 40-hex domain (never a fixed position — the as-filed row used position `5`), the
identity/no-op draw GUARDED and REPORTED** (`A-10`; the guarded no-op itself is **accepted-with-reason**); **(c2)** the
independently produced revision read, **as filed**; **(c3)** **NEW (`A-7`)** a foundation tree that is present, whose
fifteen bytes are equal, and which is **NOT a git repository**, driven **through the monitor's CLI** — the reading must
carry the pin-arm disclaimer and **must NOT claim a revision equality**, and the row **records the seam `E-9` names**;
**(c4)** **NEW (`A-7`)** the same drive against a tree whose `.git` is **unreadable/broken** (a failed `rev-parse` that
is not "not a repository"). **The limb is authored at the honest CURRENT minimum (disclaimer + no pin claim); when the
named gate `E-9` lands it MUST be tightened to the label/exit rule that gate chooses** (`§12.7`, `§12.10`).
**`(bounded)` ON THE PRESENCE CONDITION — unchanged.**

**`P-SM-pd-pin-2` — `strat:pd-pin-four-site-agreement` (amended by `A-4`, `A-5`, `R1`, `R2`):**
**Current declaration: `16 = 3` constant reads `+ 3` per-file declaration-count terms `+ 1` `digestCommand` limb `+ 1`
`measuredAt` limb `+ 2` LCG-drawn joint mutations `+ 6` controls.**
① the **`3` constant reads** are **as filed**; ② **NEW (`A-5`) — one DECLARATION-COUNT term PER FILE** (`3` terms): each
file's `constantDeclarationCount` must be **exactly `1`**, taken as a **bounded attempt** so the tally prints honestly —
**as filed those three checks sat OUTSIDE the declared domain, so a second `PINNED_COMMIT` declaration carrying a
different literal was INVISIBLE (`F-12`)**; ③ **the `digestCommand` limb is STRENGTHENED (`A-5`)**: it must assert that
the command carries **EXACTLY ONE distinct 40-hex literal, and that literal IS the pin** — **the as-filed bare
`includes(pin)` is satisfied by a command carrying BOTH literals, or by a 64-hex string whose first 40 characters are
the pin, while the live command then fails with git's ambiguous-revision error**; ④ **NEW (`A-4`) — `1` `measuredAt`
LIMB**: `foundation.measuredAt` is **present**, matches **`YYYY-MM-DD`**, and **equals the contract's declared refresh
reading (`2026-09-28`; local/repo day per `A-12`)** — taken together in one attempt, so an absent or corrupted date is a
RED (`F-13`) rather than an unread site; ⑤ **NEW (`A-5`) — `2` LCG-DRAWN JOINT MUTATIONS over the synthetic sites**
(one site's literal and/or the command's literal mutated by LCG-drawn position, the pair driven together); ⑥ **the
controls go from `2` to `6`**: the two as-filed controls (a divergent constant; a mutually consistent THIRD value) **plus
the four `A-5` negatives — a two-declaration text in EACH ORDER (`2`), a command carrying BOTH literals (`1`), and a
64-hex containment whose first 40 characters are the pin (`1`).**
**`R1` is disposed HERE:** the as-filed property text and its control prose say *"all four"* / *"a text in which all
four carry a third value"*, **which misstates the site set — the row's own set is THREE constants + TWO manifest limbs
(`commit` via the constants' comparison, and `digestCommand`)**; **the current prose must name the sites it drives**:
`tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/pd-vendor-drift.test.ts` `PINNED_COMMIT` ·
`foundation.digestCommand`'s embedded revision · with `foundation.measuredAt` **read by its own limb, never folded into
the 40-hex agreement**. **The `A-4` fold is why `§1.1`'s four literal sites and this row's closure now name the same
four sites.** **`(bounded)`: NO — the site set is closed.**

**`P-TP-pd-pin-3` — `strat:pd-pin-refreshed-blob-identity` (amended by `A-6`; `A-10`'s no-op rule applies to its draws):**
**Current declaration: `21 = 15` × `1` `+ 4` controls `+ 2` LCG-drawn perturbation drives.**
① the **fifteen module drives** are **as filed**, against **the blob at the RECORDED COMMIT**; ② **the identity oracle
must be FACTORED TO TAKE BYTES (never a path alone)**, so every control drives **the same limb the real sweep drives**:
an `lstat`-derived regular-file flag + vendored bytes + blob bytes + the declared md5 (`A-6`); ③ **the controls go from
`3` to `4`**: **(c1)** **perturbed BYTES** driven through that oracle (the as-filed control re-derived `md5(perturbed)
!== declared` — **a proxy that tests `md5()`, not the oracle**); **(c2)** a module **absent** at the recorded revision,
**naming the path — RETAINED** (as filed, its own oracle); **(c3)** a **symlinked fixture** driven through the oracle's
**regular-file limb** (the as-filed control asserted a bare `lstatSync()` of a temp symlink — **a proxy**); **(c4)** **NEW
— a PRESENT-BUT-DIFFERING blob md5**: fabricated blob bytes that differ from the vendored bytes while both are present,
**the branch the audit found had NO control at all**; ④ **the `2` LCG-drawn re-drives move to a PERTURBATION DOMAIN
(`A-10`)** — each draw must select a module **and a LCG-drawn mutation position/byte**, producing drives that are not
permutations of the same fifteen (`§12.13`: **the as-filed pair of pools are both permutations of the fifteen, so they
bought ZERO coverage**).
**⟨THE ONE ROW THAT MUST NEVER BE RELAXED.⟩** **`P-TP-pd-pin-3` is the ONLY reader in this repo that compares
`git show <recorded commit>:src/shared/<name>.ts` against the vendored bytes AND against the manifest's declared md5**
(measurer of this verdict: the gate-4 adversarial pass; the readers re-read this pass, `VERIFIED-BY-READ`). **It is
therefore the row that catches the strongest surviving false-green: a foundation worktree checked out at the refreshed
commit whose working-tree bytes were edited after checkout and whose vendored copies and manifest md5 were brought into
agreement with the edit — `drift` reads `CLEAN`, because NEITHER of its comparisons reads the BLOB.** **Relaxing this row
is the `F-3` class and a review finding; its controls are brought UP to its importance, never down** (`§12.13`).

**Class tally:** `P-IM` ×1 · `P-SM` ×1 · `P-TP` ×1 = **3 rows** — the prefixes the unit's register is scoped to
(`P-IM`/`P-SM`/`P-TP`), **3 rows and no more**, because the pin refresh's entire falsifiable content is exactly these
three quantifications.

**Attempt tally, printed with its terms:** **`4` + `6` + `20` = `30` attempts** — every row **≤100** ✔, the total
**≤400** ✔, **stop-after-5** ✔. **Every term is `EXECUTED`** (each row reads the real tree and drives its controls);
**no term is `DECLARED, NOT EXECUTED`** — the label the Phase-0 register needed (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §4's
per-row census) **does not apply here, because each of these three rows has a landed reader on real files.**

> **⟨AMENDED (gate-4 `A-4`, `A-5`, `A-6`, `A-7`, `A-10`) — THE CURRENT TALLY, with the AS-FILED one kept visible
> immediately above (`§12.16` carries the same arithmetic with its per-term reasons.)⟩**
> **CURRENT: `7` + `16` + `21` = `44` attempts** — every row **≤100** ✔ (`7` · `16` · `21`), the total **≤400** ✔,
> **stop-after-5** ✔, **the row set, ids, strategy ids, seed, caps and stop rule UNCHANGED**.
> **Per row: `P-IM-pd-pin-1` `7 = 1 real pair × 2 limbs + 1 comparator drive + 4 controls`** ·
> **`P-SM-pd-pin-2` `16 = 3 + 3 + 1 + 1 + 2 + 6`** · **`P-TP-pd-pin-3` `21 = 15 × 1 + 4 + 2`**.
> **The as-filed total `30` is SUPERSEDED, not deleted, and the landed register's own `30`-based tables are owed a
> re-derivation to these terms (`§12.17`).** **The register's spec-reading limb must assert THESE terms** — anchored to
> this region, never a whole-file regex (`§4`'s anchoring bullet, `A-9`).

> **⟨ANNOTATED 2026-09-28 BY THE `PD-VENDOR-PIN-REFRESH` ITEM-10d DOCUMENTATION REVIEW (`DR-P1`, BLOCKING — the
> re-derivation HAS LANDED and ONE DECLARED TERM IS NOT DRIVEN; the CURRENT declaration above is KEPT, `RCA-8(c)`).⟩**
> **THE LANDED register file (`tests/pd-vendor-pin-refresh-register.test.ts`, VERIFIED-BY-READ this pass) declares
> `7` · `16` · `21` and its `DECLARED_REGISTER` table prints these very terms — but `P-SM-pd-pin-2` DRIVES `15` AND
> THIS DECLARATION SAYS `16`.** **The count, per `attempt(...)` call site in the file, printed as the terms this row
> itself declares:** `3` constant reads (`for (const r of reads)`, one per `CONSTANT_SITES` entry) + `3`
> per-file declaration-count terms (the second pass over the same `reads`) + `1` `commandPinLimb` + `1`
> `measuredAtAttempt` + **`2` from a single `attempt(...)` INSIDE the `for (let draw = 0; draw < 2; draw++)` loop**
> (the file's own comment says the two declared terms buy `6` joint-mutation DRIVES inside those `2` terms — the
> declaration counts the two JOINT MUTATIONS, the drives are internal) + **the SIX controls** (`control1` ·
> `control2` · `twoDeclarationControl('correct-first')` · `twoDeclarationControl('divergent-first')` · `control5` ·
> `control6`) = **`15`**. **CONSEQUENCE, and it is the register's own predicate, not this pass's opinion:**
> `finish(id, run)` reports a row `held` only when `run.counterexamples.length === 0 && executed === declared.declaredTotal`,
> and its `expect(held, …).toBe(true)` carries the report line — **so with `executed = 15` and `declaredTotal = 16` the
> row is `broken` and the file cannot pass.** **THE `12 passed (12)` READING RECORDED FOR THAT FILE IS THEREFORE NOT
> REPRODUCIBLE FROM ITS OWN SOURCE by this pass's count (`12` is exactly its number of `it()` blocks — `3` register
> rows + `9` arithmetic/report/self-scan rows — so the count of ROWS is consistent while the count of ATTEMPTS is
> not); the claim is QUOTED AS A RECORDED READING and NOT contradicted on measured evidence, because this pass runs no
> suite.** **WHAT SETTLES IT, exactly: one run of `npx vitest run tests/pd-vendor-pin-refresh-register.test.ts` and
> its printed `PD-VENDOR-PIN-REFRESH REGISTER REPORT` line for `P-SM-pd-pin-2` (`executed` vs `declared`) — the report
> the file prints carries both numbers, so the run either confirms `16` (and this pass's count is wrong at one call
> site) or confirms `15` (and the register is broken).** **OWNER: THE TESTWRITER** — a register fix is a `tests/**`
> CODE act, and this pass is READ-ONLY with respect to code. **The fix may NOT simply reduce the term: `§12.16` and
> the register's own `SUPERSEDED` note require that NO DECLARED TERM IS REDUCED (`current ≥ as-filed`, and the
> re-derivation's whole point was the `A-4`…`A-10` additions). The honest shapes are (a) ONE MORE DRIVEN ATTEMPT at
> the row's own declared domain — e.g. a declared TERM for the joint-mutation drives it already performs (`6
> joint-mutation drives inside the 2 declared terms`, which the file itself reports as a discrepancy), or (b) a
> recorded CONTRACT AMENDMENT that re-states the term with its reason. A silent edit to `16` → `15` is the
> reduced-term failure mode and is a review finding.**
>
> **⟨DISCHARGED BY RUN 2026-09-28 (the supervisor's ruling; recorded by the `PD-UI-6` item-10d documentation review)
> — annotate-beside, the whole `DR-P1` block above is KEPT VISIBLE as the static reading it was. `DR-P1` WAS A STATIC
> MISCOUNT AND THE RUN IS AUTHORITATIVE.** **`npx vitest run tests/pd-vendor-pin-refresh-register.test.ts` reports ALL
> THREE register rows `held`, with `executed == declared` on every row (`7` / `16` / `21`), `stoppedAt: null` and
> counterexamples `0`.** **CONSEQUENCES: the register is NOT broken; the recorded `12 passed (12)` reading was
> accurate; NO declared term is reduced and NO contract amendment is owed for this finding; and the two remedy shapes
> this block proposed (one more driven attempt / a recorded amendment) are NOT required.** **The pass that took the
> static count held no shell, and the measured reading supersedes it — which is the discipline this block itself
> named (*"what settles it: one run … the report the file prints carries both numbers"*).** **NO term of this section
> moves: `7` + `16` + `21` = `44` stands exactly as landed.**⟩**

**Rows considered and REJECTED (recorded so a later pass does not re-add them, and so a 3-row register is not read as
an oversight).**

- *"the vendored modules' behaviour is unchanged by the refresh"* — **rejected**: behaviour is what the conformance leg
  is for, and that leg's evidence is **EMPTY for all fifteen** (`R-5`). **A row here would be a false obligation.**
- *"the app still renders / the shell boots"* — **rejected** as **structurally unassertable** in node (`RCA-12`) **and
  irrelevant**: this unit changes no rendered surface and no `src/**` byte the app consumes.
- *"`npm run battery` / `npm run divergence` become green"* — **rejected**: both are legs, not properties, and both are
  recorded as **structurally non-applicable with their reasons** for this unit (§7).
- *"the manifest's `baselines` figures are current"* — **rejected**: they are **not this unit's change** (§1.2 item 4)
  and they are **stale for unrelated reasons**; refreshing them is a separate act with its own gate (§9 `E-4`).
- *"every other repo file is unchanged"* — **rejected as a PROPERTY** (a repo-wide census is not a pin property); its
  content is carried as §1.2's DENIED surface, enforced by the implementer's scope and by review, not by a row.

**⟨THE `measuredAt` RE-ANCHORING CLAUSE — added by the SECOND refresh unit, `docs/specs/unit-foundation-pin-refresh-2.md`
§2.5 clause 4, in the SAME landing that moved the date; ANNOTATE-BESIDE (`RCA-8(c)`): no as-filed clause above is
deleted, renumbered or rewritten, and the SUPERSEDED reading is kept visible here.⟩** **the contract's declared refresh
reading (`2026-09-30`) SUPERSEDES the as-filed declaration (the SUPERSEDED reading `2026-09-28` stays
visible beside it, never deleted and never rewritten).** The register's `measuredAt` limb compares the
manifest's `foundation.measuredAt` against the **last** declared refresh reading clause in this anchored `§4` region,
so this clause re-couples that limb automatically: **`foundation.measuredAt` moved `2026-09-28` → `2026-09-30`** in the
second refresh's landing, because that landing's own run read the **LOCAL/repo day `2026-09-30`** (`A-12`; the refresh's
own reading's day is authoritative, never a UTC day), while the pin literal itself moved
`d7b98b574adc7fa63fbabda617eba2a753f52cb5` → `dd34e01148440f83b3f595919d865d05a2badbfe` in the same landing.
**NO TOOTH IS RELAXED AND NO TERM MOVES:** the limb still requires **present** · **`YYYY-MM-DD`** · **equal to the
declared reading**, it still discriminates against an absent, ill-formed or uncoupled date, and this is a **CONTRACT
clause, not a register term** — the declared terms `7` + `16` + `21` = `44` stand exactly as landed.

> **⟨ANNOTATED `2026-10-04` — THE REGISTER'S DECLARED-REFRESH-READING RULE HAS LANDED STRICTER THAN THE `§4` SENTENCE
> IMMEDIATELY ABOVE SAYS; ANNOTATE-BESIDE (`RCA-8(c)`): that sentence is KEPT VISIBLE AND UNCHANGED, and this clause
> records the LANDED rule beside it. The date is a CARRIED reading (the latest record in this file's tree, the
> `2026-10-04` gates-7+8 block and the unit DONE row); this pass read no clock, holds no shell, and if its own local day
> differs the heading is corrected in place rather than left wrong (the `§12.12` `A-12` discipline).⟩**
> **WHY THIS IS OWED AT ALL: gate 4 of the second refresh unit filed it, and the TestWriter could not take it — a
> `tests/**` wall may not edit a `docs/specs/*.md` contract.** **THE DISCREPANCY, NAMED EXACTLY:** the filed sentence
> reads the limb as taking the **last** declared refresh reading clause in the anchored region (**last-match
> semantics**), while the rule that LANDED is stricter. **THE LANDED RULE, as written in
> `tests/pd-vendor-pin-refresh-register.test.ts` → `declaredReadingFromRegionText` (read this pass,
> `VERIFIED-BY-READ`):** *among the clauses of the anchored `§4` region, **the LAST clause that does NOT name its own
> cited date superseded governs; the last clause governs only when EVERY clause names its own cited date superseded***.
> **On this region the two readings coincide** — the last clause here names no older reading as superseded, so it is
> the governing one — **and they diverge on exactly the mutation the new control catches, which is why the filed
> sentence needed this clause rather than a correction.**
> **(i) THE REGION CARRIES TWO CLAUSES, so the limb is DECOUPLED from the OLD date on the real region, not only
> synthetically.** **`VERIFIED-BY-READ` this pass (reader: the spec-writer):** this very `§4` region carries **(a)** the
> as-filed dated declaration **`2026-09-28`** (a clause of `§4.1`, the reading the re-anchoring clause above states an
> older reading is superseded by — kept VISIBLE, never deleted) **and (b)** the governing dated clause **`2026-09-30`**
> of the re-anchoring clause above (which cites **no** older reading as its own supersession). **The limb therefore
> reads `2026-09-30`, which is `foundation.measuredAt`'s landed value; under the as-filed LAST-MATCH reading the old
> `2026-09-28` clause would have been the LAST clause had the region's clauses been ordered the other way, so the
> control's subject is this region's own ordering, exercised rather than inferred.**
> **(ii) THE CONTROL, AND THE MUTATION IT CATCHES — `§4 row 2 (G-3)`.** **`VERIFIED-BY-READ`:** the landed register
> carries the drive BOTH inside row 2's one declared `measuredAt` attempt (a synthetic region stating the
> declared-current clause FIRST and a self-superseded clause SECOND, driven through the factored
> `declaredReadingFromRegionText`) **and** as its own row titled *"`§4` row 2 (`G-3`) — `declaredRefreshReading`'s
> SELECTION LIMB is pinned"*. **THE MUTATION THE CONTROL CATCHES, named as the control names it: a `§4` amendment that
> states an older, superseded reading LATER in the region than the governing clause.** With the as-filed last-match
> reader that amendment **silently re-couples the `measuredAt` limb to the OLD date** — the red would then invite the
> next pass to "fix" it by moving `foundation.measuredAt` BACKWARDS, a stale-date churn with no failing oracle. **With
> the landed reader the control FAILS, as it must:** the same synthetic subject is driven through the **as-filed**
> last-match reading and **asserted to differ** from the governing reading, so the control is not vacuous — the two
> readings genuinely disagree on that subject. **The register file itself is NOT touched by this annotation** (it is
> `tests/**`, and this pass holds no code wall).
> **(iii) A RECORDED STRUCTURAL NARROWING — a clause's date must now sit in THAT CLAUSE'S OWN SPAN.** **`VERIFIED-BY-READ`:
> the clause matcher bounds a clause's date window at the clause's own phrase END and at the NEXT phrase, so a
> **"declared refresh reading"** phrase carrying **no date before the next clause** no longer binds to the NEXT clause's
> literal** — such a clause yields no match at all and is simply not a clause. **The as-filed sentence above says
> nothing about where a clause's date may sit, so this tightening is a RULE MOVE, not a clarification: on a region
> whose clauses are not self-dated it MOVES THE READING (a clause that used to absorb the next clause's date now
> contributes nothing), and on this region — both of whose clauses carry their own dates — it moves nothing.**
> **(iv) NOTHING IS WIDENED, NO TOOTH IS RELAXED AND NO TERM IS MOVED.** **The `measuredAt` limb keeps every condition
> it had** — **present** · **`YYYY-MM-DD`** · **equal to the declared reading** — and the fail-states `F-12`/`F-13` and
> the atomicity guard stand exactly as filed. **The register's arithmetic STAYS `7` + `16` + `21` = `44`, its seed
> STAYS `0x20260928`, its caps stay `≤100` per row · `≤400` total, and the as-filed `4` + `6` + `20` = `30` stays
> visible:** the control is a **drive INSIDE row 2's already-declared `measuredAt` attempt**, so it **adds no term and
> reduces no term** — the landed register's own arithmetic assertion prints those very factors and the unmoved total
> (`VERIFIED-BY-READ`), with row 2's declared `16` and the register-wide `44` re-asserted in the same row. **The landed
> `executed == declared` verdict for all three rows and the `7` / `16` / `21` readings are `RECORDED READINGS`** —
> **measurer: the supervisor's run of `npx vitest run tests/pd-vendor-pin-refresh-register.test.ts`** (recorded in
> this file's `§4.1` `DR-P1` discharge block, and consistent with the unit DONE row's `131 files passed (131) · 2993
> passed | 22 skipped (3015) · 0 failed`); **this pass ran nothing and does not present them as its own measurement.**
> **(v) WHERE THE UNIT'S RECORD OF THIS LIVES: the `U-FOUNDATION-PIN-REFRESH-2` DONE row at the head of
> `docs/next-steps.md`'s CURRENT WORK region** — the row is `VERIFIED-BY-READ` this pass to exist there and to carry
> the **two-clause** state, the **`G-3` control and its mutation**, the **narrowing**, and the **unmoved arithmetic
> `7` + `16` + `21` = `44` with seed `0x20260928`** (the row's own readings of the register file and of the trio are
> unchanged by this clause).
> **(vi) ONE MECHANICAL CONSEQUENCE OF THIS CLAUSE, stated so no later pass is surprised:** this annotation
> **deliberately does NOT mint a *"declared refresh reading (`<YYYY-MM-DD>`)"* form**, because such a clause would
> become a **THIRD** clause in the region and the landed register asserts the region's clause count as **exactly `2`**
> — **a third clause REDS that assertion, so the count and any reading that depends on the region's clause set are
> OWED to the unit that next re-anchors this region** (a register act this pass may not take). **And the `2026-10-04`
> gates-7+8 block at this file's head says the limb takes *"the LAST 'declared refresh reading' clause"* — a reading of
> the **pre-`G-3`** state; it is KEPT VERBATIM under `RCA-8(c)` and **that sentence is SUPERSEDED as a description of
> the rule by the landed rule recorded here** (it remains accurate as a description of the **filed** sentence).
> **This clause edits nothing else: the `§4` region's landed re-anchoring clause, `§1.2`, and every other clause of
> this file are untouched.**

---

## 5. The layer ledger — what this unit does NOT claim

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the manifest's refreshed `foundation.commit` / `digestCommand` / `measuredAt` | **DOC/MACHINE-DATA layer** — a provenance record | that the bytes it names exist until a row reads them |
| the three refreshed `PINNED_COMMIT` constants | **`[T]` / source-text layer** | that the pin is *true* — only that this repo **states one revision in four places** |
| the refreshed `npm run drift` reading (`CLEAN`/`SKIPPED`/`FAIL`) | **`[D]`-class local instrument / tooling** | **app, envelope-behaviour or module behaviour of any kind**; it compares **revisions and files**, never behaviour |
| the new register file's three rows | **`[T]`/`[D]` node-suite** | the assembled app; layout; persistence; any consumer |
| **anything about the Electron app, the envelope, the store or a live surface** | **NOT CLAIMED ANYWHERE IN THIS FILE** | — |

**Named non-claims.** **No app-green, no envelope-green, no store-green, no engine-green, no live-green.** **No claim
that the vendored modules behave as the foundation's suites observe** — the conformance leg supplies **zero**
copy-fidelity evidence and **no green subset may be reported from it** (`R-5`). **No `battery` claim and no `divergence`
claim** (§7). **No claim that the pin's `measuredAt` date is the date of any earlier reading.** **No claim that the
manifest's `baselines` block is current at this head** (§1.2 item 4). **No claim that a `SKIPPED` reading is a pass.**

> **⟨AMENDED (gate-4 `A-7`) — ONE MORE NAMED NON-CLAIM, because the audit found a reading that LOOKS like a pin pass.⟩**
> **No claim may be made from a `CLEAN` reading whose `revisionChecked` is not `true`** — **a byte-only `CLEAN` proves
> nothing about the pin** (`§3` item 1's amended annotation; `E-9`). **And the register's rows stay `[T]`/`[D]`:** the
> row-1 comparator drive is **an instrument read**, the row-3 blob identity is **a copy-fidelity-about-bytes reading**,
> and **none of the three rows is app, envelope-behaviour, layout, persistence or consumer evidence** (`RCA-12`).

---

## 6. The red-set plan (`RCA-1`: red FIRST, RUN, and REPORTED)

**This file authorises no implementation.** The delegation gate (`AGENTS.md` item 9) is satisfied by **this spec plus a
TestWriter red set that has been RUN and REPORTED.**

**1. The red already exists, and it is RUN and REPORTED.** The red is the **existing pin oracle**, at **two sites** —
`npm run drift`'s `FAIL — 1 PIN fault(s) …` (§0A item 1) and `tests/pd-vendor-set.test.ts` `§3.3 item 2` (§0A item 2) —
**measured by the supervisor and the TestWriter's red-set pass respectively.** **This unit did not need to author that
red: the branch already carries it.**

**2. The unit's OWN red set is the register of §4, in a NEW file.** **Name (proposed and binding unless the TestWriter
records a name-level collision): `tests/pd-vendor-pin-refresh-register.test.ts`.** It is authored
**by the TestWriter, from THIS spec**, and it must be **RED AT THIS HEAD BEFORE the manifest or any constant moves.**

| Register row | Colour at this head | Why, exactly |
| --- | --- | --- |
| **`P-IM-pd-pin-1`** | **RED** | the adjacent tree's HEAD is `d7b98b5…` (§0A item 5, `VERIFIED-BY-READ`) while the manifest's `foundation.commit` is `8f193a8d…` — **the refreshed value does not exist yet**. The red's failure text must **name both revisions**, never read as a collection error |
| **`P-SM-pd-pin-2`** | **GREEN-ON-ARRIVAL** | all four sites still carry the **old** literal **consistently** — the property is **agreement**, not a specific revision, so a fully-unrefreshed tree satisfies it. **It is the unit's regression guard against a partial restatement (`F-1`/`F-2`) and MUST be reported as green-on-arrival rather than quietly omitted** — the same form the sibling units use for their green-on-arrival rows |
| **`P-TP-pd-pin-3`** | **GREEN-ON-ARRIVAL** | the fifteen vendored bytes equal the pinned revision's blobs today and are **unchanged by `d7b98b5`** (docs only) — so **the row is green on arrival and STAYS green through the refresh.** **It is the guard that makes the refresh provably byte-preserving**, and it is the row that turns RED if a module is re-vendored during the refresh (`F-3`) or if the refreshed blob ever differs (§2's STOP) |

**So the new file's expected RED RUN is exactly ONE red row of three** — and its two green rows are **not** padding:
they are the two guards that make the one-red reading mean what it says. **The red run's reading (file, row counts, and
the one failing row's message) is recorded in the DONE row.**

> **⟨AMENDED (gate-4 `A-1`, `A-3`, `A-9`) — the RED SET HAS RUN AND THE FILE HAS LANDED; the as-filed colours are the
> RED HEAD's record and STAY VISIBLE.⟩** **`VERIFIED-BY-READ` this pass: `tests/pd-vendor-pin-refresh-register.test.ts`
> EXISTS and declares all three rows in register order, each with its strategy id and `held`/`broken` report.** **After the
> refresh landed, the colours have moved on this head: `P-IM-pd-pin-1` is no longer RED — the manifest now carries the
> tree's HEAD (`§1.1`'s landed block) — while `P-SM-pd-pin-2` and `P-TP-pd-pin-3` remain the two guards.** **The RED RUN's
> own reading (file, row/term counts, the failing row's message) is `UNVERIFIED` by this pass** — **no red-run log was
> given to it** — and **is owed by the DONE row** (§10 item 2). **The register's landed colour table and its `30`-based
> terms are STALE against THIS amendment and are owed a re-derivation** (`§4.1`, `§12.16`, `§12.17`) — **and the two
> findings that make that re-derivation non-optional are `A-5`/`A-9`: the row-2 declaration-count checks sit OUTSIDE the
> declared domain, and the spec-reading limb regexes the WHOLE FILE, which a legitimate amendment of this contract reds
> (`A-1`'s own `§12` included).**

> **⟨ANNOTATED 2026-09-28 BY THE `PD-VENDOR-PIN-REFRESH` ITEM-10d DOCUMENTATION REVIEW — TWO OF THIS CELL'S OPEN
> CLAUSES ARE NOW SETTLED BY READ, and the re-derivation it owed HAS LANDED (the as-filed text above is KEPT,
> `RCA-8(c)`).⟩** **(i) THE RED RUN'S READING IS STILL NOT OWED TO THE DONE ROW'S *SHAPE* ALONE — the RED SET's
> COLOURS are recoverable from the tree and agree with this section's as-filed plan:** the landed register's own
> `DECLARED_REGISTER` table records, per row, the SUPERSEDED `colourAtRedHead` (`P-IM-pd-pin-1` **`RED`** — the tree
> HEAD was `d7b98b57…` while the manifest pinned `8f193a8d…`; `P-SM-pd-pin-2` **`GREEN-ON-ARRIVAL`**; `P-TP-pd-pin-3`
> **`GREEN-ON-ARRIVAL`**) — **so the plan as filed (`ONE red of three`, the other two green-on-arrival guards) is what
> the landed file carries, VERIFIED-BY-READ; the RED RUN'S LOG ITSELF (the failing row's message, the term counts at
> that edition) is still NOT HELD by this pass and remains owed to the DONE row** (§10 item 2). **(ii) THE
> RE-DERIVATION HAS LANDED — with ONE DECLARED TERM NOT DRIVEN: `§4.1`'s amended tally block carries the `DR-P1`
> finding (the row-2 declaration says `16` while the file drives `15`, so the row cannot report `held`)** **⟨DISCHARGED BY RUN 2026-09-28 (annotate-beside; the as-filed sentence is KEPT): the supervisor's run of `npx vitest run tests/pd-vendor-pin-refresh-register.test.ts` reads all THREE register rows `held` with `executed == declared` (`7` / `16` / `21`), `stoppedAt: null`, counterexamples `0` — so the row DOES report `held` and `DR-P1` was a STATIC MISCOUNT. The re-derivation's every declared term is DRIVEN; no term is reduced and no amendment is owed for the finding (`§4.1`'s `DR-P1` block carries the full discharge).⟩**, and the
> spec-reading limbs' anchoring (`A-9`) IS landed and VERIFIED-BY-READ (the contract is read ONCE, through
> `specRegion`/`registerRegion`, and the whole-file adjacency regex is gone — the file asserts its own absence).**
> **(iii) ONE CLAUSE OF THIS CELL IS NOW A LIVE FALSE STATEMENT ABOUT THE TREE and is corrected here beside it: the
> `A-3`/`D-12` dispositions DID land — the `tests/pd-vendor-manifest.test.ts` `§3.3 item 2` row TITLE IS REFRESHED
> (it names `d7b98b57…f52cb5` and keeps `⟨superseded: 8f193a8…f82459 was the pin before the 2026-09-28 refresh⟩` as
> an annotated citation), and the register's control's subject is the SYNTHETIC title text alone (`manifestPinText`
> appears nowhere in it) — `§12.3`, `§12.17` item 2, DISCHARGED.**

**3. The existing `§3.3 item 2` row stays exactly where it is.** **The refresh turns it green; it is not edited to
accommodate the change, and it is never relaxed** (§1.2 item 5). **A red set whose green depends on editing that row is
a review finding, full stop.** **The same rule protects the Phase-0 blob-containment row** (`tests/pd-vendor-set.test.ts`'s
*"the manifest's `foundation.commit` is CONSUMED"* row, `VERIFIED-BY-READ` this pass): it reads the blob **at the
recorded commit**, so **it must remain GREEN through the refresh** — and it does so **only if** the refreshed revision's
blobs are the same bytes (§2's STOP).

**4. What the red is NOT.** Not a `src/**` behaviour change · not a module byte · not an edit to **any** existing test
file · not a `vitest.config.ts` / `package.json` / `scripts/**` change · not a re-vendor · not a tracker rewrite · not
an archive. **This unit retires NO test and archives NO file** (`DECIDED: REBUILD-ARCHIVE-POLICY` clause (1)'s trigger
does not fire: the refresh supersedes no test's subject).

**5. The `[T]`-side obligations the new file carries by name.** ① It must **NOT** mock `'electron'` (`F-7`). ② It must
not read anything a `G-9` pin freezes (`F-8`). ③ Its `describe`/`it` titles are **census-stable** — **one row per
declared register row and one per declared term**, so a row or term dropped from §4 without a contract amendment is a
**loud failure, never a vacuous pass**. ④ **Its three rows print their terms and the total with them** (`4 + 6 + 20 =
30`). ⑤ **It is collected by `npm test`** (`tests/**/*.test.ts`), so **its green/red is part of the suite reading the
DONE row reports.**

**6. The pre-red obligations (all discharged BEFORE the red is authored).** ① the **refreshed revision is FIXED and
named** (the adjacent tree's HEAD at the red run — §0A item 5) ✔ **already named by this spec**; ② the **new file's name
is fixed** (§6 item 2) ✔ **named by this spec**; ③ the **premise check of §3 item 3 is TAKEN** — **the STOP condition's
evidence** — which the **implementer** takes, not the TestWriter. **A red set whose `P-TP-pd-pin-3` was authored
WITHOUT a recorded blob reading would be a red on an unverified premise; the red run therefore also RECORDS the
working-bytes equality it can see, and the implementer's blob read is the one that gates the edit.**

> **⟨AMENDED (gate-4 `A-9`, `A-3`, `A-4`, `A-5`, `A-7`, `A-10`) — THE `[T]`-SIDE OBLIGATIONS GAIN FIVE MORE, and the
> AMENDED-RUN obligations are stated so the re-derivation cannot be read as optional.⟩**
> **Added to item 5's list:** ⑥ **the spec-reading limbs ANCHOR to `§4`'s table region + arithmetic, never a global regex
> over this file** (`A-9`; `§4`'s anchoring bullet). ⑦ **the row titles/terms are re-derived to `§4.1`'s CURRENT
> declaration** (`7 + 16 + 21 = 44`; `§12.16`), with the as-filed `4 + 6 + 20 = 30` reachable only through the
> explicitly-named superseded block. ⑧ **no limb may freeze a REAL file's prose** (`A-3`; `D-12`) — **the seventh-site
> control's subject is a SYNTHETIC title text**, and the only real-file limb that may stay is the declaration count.
> ⑨ **the row-1 comparator drive READS the monitor, never edits it** (`A-10`, `A-7`; `§1.2` item 7's amended annotation).
> ⑩ **the `A-5` negatives are driven** (two-declaration text in both orders; a both-literals command; a 64-hex
> containment) **and the `A-6` drives** (perturbed bytes; symlinked fixture through the oracle's own limb; a
> present-but-differing blob md5) — **`§12.5`/`§12.6` name them; a re-derivation that omits any of them is a review
> finding, not a smaller register.**
> **On item 6 ③:** **the premise check is now SETTLED** — **`E-8` is annotated at `§9` with the supervisor's measurement
> (`diff --name-only` EMPTY across the two revisions for `src/shared`; identical blob object-ids at both revisions for all
> fifteen)** — **so the re-derived row 3 keeps its `GREEN-ON-ARRIVAL` role for a *byte* reason, and the working-bytes
> equality the red run recorded stays a `RECORDED READING`, never a substitute for the blob read.**

---

## 7. Verification — the trio, the pin's own leg, and the gates that are STRUCTURALLY NON-APPLICABLE

| Leg | What it covers here | Layer | This unit's obligation |
| --- | --- | --- | --- |
| **`npm test`** (`vitest run`) | the new register file's 3 rows, the `§3.3 item 2` row **turned green**, the Phase-0 blob-containment row **still green**, and the otherwise-unchanged suite | harness/`[T]` | the DONE row prints the **before → after** file/test/skip counts **in the same commit** and states the delta against the carried red. **The unit MAY NOT claim a clean trio while the carried baseline `P-SM-1` stands** (`R-6`) |
| **`npm run typecheck`** (`tsc --noEmit`) | `src/**` only — **this unit changes no `src/**` byte**, so exit `0` is a **regression check**, not an achievement | harness | **exit `0`** |
| **`npm run build`** | the five bundles — **this unit changes no `src/**` byte**, so no bundle's content moves | harness | **exit `0`**, and the DONE row states that the bundle census is unchanged **because no module byte moved** |
| **`npm run conformance`** | the Phase-0 leg over the vendored foundation suites | `[T]`/`[H]` | **NOT this unit's instrument, NOT edited, NOT re-pointed, and NOT evidence.** Report its reading **with the class labels and without a green word** — its evidence is **EMPTY for all fifteen modules** (`R-5`). **No row of this unit may cite it as coverage.** |
| **`npm run drift`** | **the pin's OWN instrument** | `[D]`-class local instrument | **run it and report the reading.** After the refresh it must read **`CLEAN`** (`DRIFT RESULT: 15 checks, 0 differences — CLEAN`, exit `0`) **or `SKIPPED` with the honesty statement when the adjacent tree is absent** (§3 item 1). **A `FAIL` at the refreshed revision is a LANDING FAILURE** — and so is a `DRIFT`, which is a real byte divergence |
| **the adversarial pass (read-only)** | the unit's edge cases / malformed inputs | review | **mandatory per unit** (`RCA-3`): its findings are recorded in **this spec's amendment ledger** (a `§12`) and each host finding is fixed here + regression-tested |
| **the documentation review** | this spec + the trackers against the built tree | review | **mandatory after the greens** (`RCA-6` / `AGENTS.md` item 10d); record to `archive/reviews/<date>-<unit>-doc-review.md` |

### 7.1 The exact before/after readings the DONE row must carry

**BEFORE (the red run's head — the reading §0A items 1–4 quote):**

> **`npm test` = `207 files (2 failed / 205 passed) · 4458 tests (2 failed / 4411 passed / 45 skipped)`** — the **two**
> reds being **(i)** the `A-3` pin/revision arm (`tests/pd-vendor-set.test.ts` `§3.3 item 2`) and **(ii)** the carried
> baseline `P-SM-1` (`strat:stage-seam-schedule-single-active`, defect `PANE-TOGGLE-STAGE-COLLAPSE`).
> **Measurer: the supervisor** (`RECORDED READING`; §0A item 4). **Arithmetic: `4411 + 45 + 2 = 4458` ✔ ·
> `205 + 2 = 207` ✔.** **And `npm run drift` = `FAIL — 1 PIN fault(s) …`** (measurer: the supervisor; §0A item 1).

**AFTER (the landing head) — the shape, with its terms, so the implementer cannot report a number it did not read:**

> **`npm test`** — the **new register file adds ONE file** (`tests/pd-vendor-pin-refresh-register.test.ts`; **does not
> exist at this head** — `VERIFIED-BY-READ` this pass), so **files = `207 + 1` = `208`**; the `A-3` arm's file turns
> green, so **failed files = `1`** and **passed files = `207`**; **tests = `4458 + r`** where **`r` is the new file's
> own collected row count** (its **register rows and per-term rows**, printed by the file itself and **never estimated
> here**; **before the refresh `3` of its rows are RED**, i.e. `4458 + r` with `2 + 3 = 5` failed), and **after the
> refresh failed tests = `1`** — **the carried baseline alone** — with **skipped = `45`**. **The DONE row prints the
> four figures and their sum, and labels the one remaining red as the CARRIED BASELINE by name and defect id.**
> **`npm run drift` = `CLEAN`** (`15 checks, 0 differences`, exit `0`) **— or `SKIPPED` with the honesty statement**,
> **never `FAIL`, never `DRIFT`, never a bare green word.**

> **⟨AMENDED (gate-4 `A-1`, `A-3`, `A-8`) — §7.1's AFTER block, corrected on two points and given the readings it lacks.⟩**
> **(i) The register file DOES exist now.** The AFTER block's *"does not exist at this head — `VERIFIED-BY-READ` this
> pass"* is **true of the FILING pass and false of this pass**: `tests/pd-vendor-pin-refresh-register.test.ts` **exists
> and is read here** (`VERIFIED-BY-READ`). **So the `+1` file is LANDED, and `r` is now a MEASURED count the DONE row must
> quote from the run — never an estimate.**
> **(ii) The audit's reading of this head, quoted with its measurer: the gate-4 adversarial pass read `208 files` — i.e.
> the `207 + 1` shape is confirmed, with the register file collected.** **This pass ran nothing and verifies no count**
> (its own no-shell wall): **the supervisor's `207`/`4458` BEFORE reading (§0A item 4) stands as filed and is NOT
> re-derived here.**
> **(iii) THE LANDED `npm run drift` READING IS `UNVERIFIED` BY THIS PASS** — **no run log was given to it** — **even though
> the pin arm's precondition is now satisfied (`VERIFIED-BY-READ`: the manifest names the tree's HEAD).** **The DONE row
> therefore owes the verbatim reading with `revisionChecked`'s value**, per §10 item 4 and the §7 `drift` row's amendment.
> **(iv) The AFTER block's `2 + 3 = 5` failed-tests arithmetic is the RED-HEAD shape and is `SUPERSEDED` for the landed
> head:** after the refresh, **the register's rows are re-derived to `§4.1`'s terms and the only expected red is the
> CARRIED BASELINE** (`R-6`). **Both readings stay visible; the DONE row reports the one it measured.**

### 7.2 THE STRUCTURALLY NON-APPLICABLE GATES — stated explicitly, never parked silently

**Per `RCA-11`'s discipline (park only a structurally non-exercisable surface, WITH the recorded park reason), the
repo's status word for this case is `STRUCTURALLY NON-APPLICABLE` — never *"waived"*, and never a silent park.**

| Gate | Status | The falsifiable structural reason |
| --- | --- | --- |
| **the blind-greens pass** (`AGENTS.md` item 10a) | **`STRUCTURALLY NON-APPLICABLE`** | A blind-greens artifact is a **scenario table a writer authors from the DOCUMENTATION ONLY and then RUNS against a live module/host.** This unit renders nothing, authors no rendered surface, and imports no vendored module: **there is no scenario for a blind writer to author and nothing live to drive** — the unit's entire observable content is **a 40-hex string in four places and fifteen unchanged files**. **The nearest available check is the register's own three rows (authored by the TestWriter from THIS spec, per §6), which IS a non-authoring read of the contract — and it is the honest substitute, named here rather than implied.** **What would make a blind pass applicable: nothing this unit can produce.** |
| **the live battery** (`scripts/live-drive.mjs`; `RCA-11` clause (a)) | **`STRUCTURALLY NON-APPLICABLE`** | **The unit authors NO rendered surface and changes no rendered state**: four literals move, in one JSON file and three test files. **Remove this unit's change and no rendered surface differs — the falsifiable statement is true.** Additionally the branch's only assembled-real-Electron leg is **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → Electron `SIGTRAP`; proposal §7.5), so **a live reading could not honestly be taken even if a surface existed** — **and the harness fix is another unit's** (`docs/specs/unit-divergence-harness-precondition.md`; Phase-0 spec §9 item 1). **`RCA-11`'s live mandate binds UI-overhaul units; this unit is not one.** |
| **`npm run battery`** (harness `[H]`) | **`STRUCTURALLY NON-APPLICABLE`** | The battery drives the **built bundles and the host seams**; this unit moves **no `src/**` byte and no bundle content**, so there is no dimension of it the battery could exercise. **A battery green would be harness-green about a change the battery cannot see** — and reporting it as evidence for this unit would be exactly the layer confusion `RCA-12` forbids. **The leg is NOT run for this unit and NOT claimed** (contrast: `G-5` makes it MANDATORY for a UI unit — **this is not a UI unit**). |
| **`npm run divergence`** | **`STRUCTURALLY NON-APPLICABLE`** *(and separately RED-environmental for the branch)* | Same reason as the live battery, plus: the leg is **RED at this head for an ENVIRONMENTAL cause** and `A-7` makes it a **pre-live** leg for units that DO render. **This unit passes the precondition through, claims nothing, and does not fix it.** |

**The two gates that ARE mandatory here, named so the four `NON-APPLICABLE` rows are not read as a general
exemption:** the **read-only adversarial pass** (`RCA-3`) and the **documentation review** (`RCA-6` / item 10d),
both listed in §7's table and both binding on this unit's landing.

> **⟨AMENDED (gate-4) — §7's table, three annotations; the as-filed cells stay visible.⟩**
> **(a) THE ADVERSARIAL ROW (`A-1`, BLOCKING — `HOST-FIX` to this spec).) The pass has RUN.** **Verdict:
> `PASS-WITH-FINDINGS`** (`RECORDED READING`, measurer: the gate-4 adversarial pass; read-only, `RCA-3`), with **twelve
> findings `A-1`…`A-12`** and **the audit's own `P-TP-pd-pin-3` verdict**. **Its findings ARE recorded in this spec's
> amendment ledger — and that pointer was FALSE AS FILED: the ledger it named did not exist, the file ended at `§11`
> (`A-1`). `§12` NOW EXISTS and is that ledger; nothing else about this cell changes.**
> **(b) THE `npm run drift` ROW — the `CLEAN` obligation is qualified (`A-7`).** After the refresh it must read **`CLEAN`
> with `revisionChecked === true`** (`15 checks, 0 differences`, exit `0`), **or `SKIPPED` with the honesty statement when
> the adjacent tree is absent**, **or `CLEAN` whose pin-arm line is the *"NO revision reading was taken"* disclaimer —
> in which case it is a BYTE-ONLY reading, must be reported as such, and must NOT be presented as the pin's clean state**
> (§3 item 1's amended annotation, `E-9`). **A `FAIL` at the refreshed revision is a LANDING FAILURE** — and so is a
> `DRIFT`.
> **(c) THE ROW-3/`A-6` LINK:** the register's row 3 is **not** covered by the `npm run drift` row's reading — **they read
> different things, and `P-TP-pd-pin-3` is the stronger reader** (`§4.1`, `§12.13`). **No `CLEAN` may stand in for it.**

---

## 8. Decisions and defaults (recorded, so no later pass re-derives them)

| # | Decision | Default taken |
| --- | --- | --- |
| **`D-1`** | Whether `byteIdentity` and the per-module `md5`/`lineCount` entries change at all | **NO — they MUST NOT change, and this is a DECISION with its reason, not an omission.** The bytes are **unchanged by `d7b98b5`** (docs only) and **this unit alters no module byte** (`R-3`), so a changed `md5` would be a **false record** — and a changed `lineCount` would be a **re-vendor's fingerprint**. **`byteIdentity`'s text already says "the pinned commit's blob at `commit`"** (`VERIFIED-BY-READ`), so it **remains true under the refresh without a word moving** — it is a **relation**, not a literal · **⟨AMENDED (gate-4 `A-11`, the audit's refinement, accepted by the implementer's judgement call (ii)): the RELATION'S CONTENT moves even though its text does not — it now reads as "the blob at the commit I was measured at" → "the blob at a LATER commit", and the supervisor's settling measurement (empty `diff --name-only` for `src/shared` across the two revisions; identical blob object-ids at both revisions for all fifteen) is what makes the moved relation TRUE rather than merely unfalsified (`§12.11`). The per-module `provenance` WORDING is owed separately (`§9 E-11`), and OUT of this unit's change set.⟩** |
| **`D-2`** | The refreshed revision | **`d7b98b574adc7fa63fbabda617eba2a753f52cb5`** (the adjacent tree's HEAD at this head; §0A item 5 `VERIFIED-BY-READ`). **The value is fixed at the refresh's OWN run**: if a further upstream commit lands first, **the refresh pins THAT HEAD and the reading is re-taken** — the rule is *"the tree's current HEAD"*, and **the literal above is a reading, not a permanent constant** |
| **`D-3`** | Whether the pin arm may be made revision-tolerant to silence the red | **NO — NEVER.** **A moved foundation HEAD is a PIN FAULT BY DESIGN** (`R-7`): *"equal bytes at a different commit are NOT the pinned state"*. That arm is **precisely the false-green the `PD-VENDOR` adversarial pass constructed** (Phase-0 spec §3a's *"THE PIN IS A RECORD, NOT AN INSTRUMENT"*) and that the **blind pass independently falsified** (Phase-0 spec §8/§13.6: a `git init` tree at another revision with equal bytes read `FAIL`, exit `1`, **no `CLEAN`**). **Loosening it is the one change that would undo the unit's own reason for existing** (`F-4`) · **⟨AMENDED (gate-4): the `A-1`…`A-12` verdict is `PASS-WITH-FINDINGS` and THIS PROPERTY SURVIVES — recorded with its MECHANISM, because the mechanism is what a future pass must not break: THE PIN ARM GATES ON A SUCCESSFUL `rev-parse` (a tree whose revision cannot be read does not enter the arm at all) AND THE COMPARATOR REFUSES `CLEAN` BEFORE IT COMPARES BYTES (the pin difference is pushed first, so equal bytes can never outvote a moved revision). The audit's reading stands, and the `A-7` seam is the OTHER side of the same mechanism — a `rev-parse` that FAILS for a present tree leaves a byte-only `CLEAN` (`E-9`): that is an instrument seam, NOT a revision-tolerant arm, and it is not this unit's to fix.⟩** |
| **`D-4`** | Whether the refresh re-measures the modules | **NO.** The fifteen md5s and the byte-identity claim **STAND as recorded** (`R-3`); the refresh moves **the revision anchor only**. **A re-measurement that CHANGES any digest is the STOP condition** (§2, §3 item 3) |
| **`D-5`** | Whether the refresh edits the red row it turns green | **NO.** `tests/pd-vendor-set.test.ts` `§3.3 item 2` **stays where it is and is never relaxed** (§1.2 item 5, §6 item 3) |
| **`D-6`** | Where the unit's own register lives | **ONE new file: `tests/pd-vendor-pin-refresh-register.test.ts`** (§6 item 2) — **never inside a `pd-vendor-*.test.ts` file** (the Phase-0 red set is a frozen instrument here) and **never in the module bytes** |
| **`D-7`** | Whether the refresh touches `../Provident-Electron/**` | **NO — it is readable and never modifiable** (§1.2 item 8). **The refresh moves THIS repo's record of the revision, and the foundation needs no change at all** |
| **`D-8`** | Whether this unit writes a `docs/decisions.md` row | **YES — ONE, at the cycle's decision step** (§1.3): a row recording **the refreshed revision and the four-site atomic restatement rule**, and **re-affirming `D-3`'s standing rule** (`R-1`/`R-7`). **Owner: the supervisor's writes**, per the program's tracker-ownership discipline. **This SPEC pass writes no tracker row** · **⟨AMENDED (gate-4 `A-2`, BLOCKING — supervisor-owned, and STILL OWED: `docs/decisions.md` carries NO such row yet, so this decision is owed and NOT satisfied. THE EXACT ROW THE SUPERVISOR'S TRACKER PASS WILL WRITE, stated here so it cannot drift: title `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`, pinning FOUR things — (i) the refreshed revision literal `d7b98b574adc7fa63fbabda617eba2a753f52cb5`; (ii) the FOUR-SITE ATOMIC RESTATEMENT RULE (one restatement, never a partial one; `F-1`/`F-2`); (iii) the RE-AFFIRMATION of `D-3`'s standing rule (a moved HEAD is a pin fault by design; equal bytes at another commit are NOT the pinned state; the arm is never made revision-tolerant); (iv) `E-2`'s STANDING POLICY for every future refresh — its own unit (or an explicitly-scoped row), all four sites atomically, the pre-edit premise check, and a re-read to `CLEAN`. (`§12.2`; `E-6` is annotated beside.)⟩** |
| **`D-9`** | Whether this unit updates `docs/skills/designing-pages.md` | **NO — the file does not exist in this repo and this unit renders no page** (`VERIFIED-BY-READ`; §1.2 item 9). **The honest form is the ABSENCE row at §9 `E-5`** |
| **`D-10`** | Whether the new file may mock `'electron'` or read a `G-9`-frozen file | **NO to both** (`F-7`/`F-8`; `R-8`) |
| **`D-11`** | Whether a `SKIPPED` drift reading satisfies this unit's pin obligation | **NO.** `SKIPPED` **proves nothing about the pin** and is reported **with its honesty statement**; **the in-suite `P-IM-pd-pin-1` row FAILS LOUDLY when the tree is unreadable**, so *"the tree was absent"* is **never** a silent green (§3 item 1, `F-10`) |
| **`D-12`** *(added by the gate-4 amendment — `A-3`)* | Whether a test file's PROSE may be frozen by a register control, and whether a superseded literal is ever deleted | **NO to the first, NEVER to the second.** **A register control may NOT freeze a REAL file's prose** — **the seventh-site control's subject is a SYNTHETIC title text**; the only real-file limb allowed is the **declaration count**. **A superseded literal is KEPT as an EXPLICITLY-ANNOTATED HISTORICAL CITATION** (`⟨superseded: … was the pin before the 2026-09-28 refresh⟩`) — **annotate-beside, `RCA-8(c)`; nothing deleted.** **The `§3.3 item 2` row TITLE IS refreshed** (the permission `§2` grants is exercised) **while `tests/pd-vendor-set.test.ts`'s row is untouched** (`D-5`) |
| **`D-13`** *(added by the gate-4 amendment — `A-4`)* | Whether `foundation.measuredAt` is folded into `§4` row 2's domain or the closure claim is merely restated | **FOLDED IN — the first option, and here is the reason: the audit's defect is that NO row read `measuredAt`, so corrupting it left the register fully green.** Restating the closure claim would have left an ALLOWED `§1.1` site **with no reader at all** — the same shape the Phase-0 pass ruled against. **So row 2 gains ONE `measuredAt` limb** (present · `YYYY-MM-DD` · equal to the declared local/repo-day refresh reading) **and `F-13` makes its corruption a documented fail-state.** **The TestWriter owes the drive** (`§12.4`, `§12.17`) |

---

## 9. Owed items and escalations (recorded, never hidden)

1. **`E-1` — `PD-UI-6`'s spec records the pin disposition as PENDING THIS UNIT'S LANDING, and OWES a dated note
   recording it.** `docs/specs/unit-pd-ui-6-modal-state.md` §7.4 (finding `R3`) records the re-pin as **a pin change
   with its own gate**, **carried and not taken**, and states the two routes. **This unit is route (a)'s gate.** **When
   this unit lands, `PD-UI-6`'s `§7.4` owes an ANNOTATED (never rewritten) note** recording the refreshed revision and
   the restored one-red baseline — **owner: the supervisor's tracker/doc writes plus the `PD-UI-6` landing pass.**
   **`docs/pending.md`'s carried condition and `docs/next-steps.md`'s `PD-UI-6` note carry the same owed note.**
2. **`E-2` — FUTURE UPSTREAM COMMITS WILL MOVE THE HEAD AGAIN, and the same refresh will be owed. The standing policy,
   stated so the next pass does not re-derive it:** **a moved foundation HEAD is a PIN FAULT BY DESIGN** (`D-3`) and
   **the refresh is a RE-ESTABLISHMENT of the pin, never a repair of a defect.** Every future refresh **(a)** opens its
   own unit (or an explicitly-scoped row of the pin's owning unit), **(b)** re-states **all four sites atomically**,
   **(c)** re-takes the §3 item 3 premise check **before** editing, and **(d)** re-reads `npm run drift` to `CLEAN`.
   **A pass that silently re-pins to make a monitor green, without (c), is the exact false-green the pin exists to
   prevent** (`docs/pending.md`'s carried condition says the same). **Escalated in the sense that asks the architect to
   confirm this standing policy is recorded in the `D-8` decision row, so a future pass inherits it as a rule rather
   than as prose.**
3. **`E-3` — the branch's carried red stays, and this unit cannot remove it.** `P-SM-1`
   (`strat:stage-seam-schedule-single-active`, defect `PANE-TOGGLE-STAGE-COLLAPSE`) is an **APP-layer residual owned by
   another row**; **after the refresh the branch reads ONE red, and it is that one.** **Owner of its disposition:
   whatever unit owns `PANE-TOGGLE-STAGE-COLLAPSE`; the refresh does not touch it and does not claim a clean trio.**
4. **`E-4` — the manifest's `baselines` block is STALE and this unit does not refresh it.** `VERIFIED-BY-READ` this
   pass: `baselines.npmTest` still reads the **red-set commit `7d3b55c`'s** figures, and `baselines.battery` /
   `baselines.divergence` quote **proposal §7.5's** readings. **They are dated readings of earlier tree states, and
   their staleness is a separate act with its own gate** (refreshing them means re-running the legs and re-recording
   with measurer and layer). **Filed, not fixed:** **owner: the supervisor's writes + the pin's owning unit at its next
   pass.** **`A-8`'s "no second hand-maintained truth" rule is NOT violated by their staleness** — a stale *recorded
   reading* is honest, **a forged current one would not be.**
   **⟨AMENDED (gate-4 `A-8`): the audit accepted this staleness ONLY under one condition, and the condition is NOT met —
   `E-10` (added below) carries the exact shape owed (`measuredAt`-stamping + per-cell commit scoping) and the escalation
   that leaving them is a live false claim in machine-readable JSON. `E-10` is not a restatement of this item: THIS item
   files STALENESS; `E-10` files the ABSENCE OF DATES that makes a stale cell read as present-tense and current.⟩**
5. **`E-5` — `docs/skills/designing-pages.md`: ABSENCE row.** **`VERIFIED-BY-READ` this pass: the file does not exist
   in this repo** (`docs/skills/*` returns `process-guardrails.md` alone). **This unit renders no page** — it moves a
   revision anchor — so **no test-use-case coverage-matrix row and no demo-page index entry are owed**, and **the file
   is not created by this unit.** **The honest form is this absence, recorded.**
6. **`E-6` — the `docs/decisions.md` row of `D-8` is owed to the supervisor's writes and does not exist yet.** **This
   spec supplies the reading and the rule; it writes no tracker row for another document.**
   **⟨AMENDED (gate-4 `A-2`, BLOCKING, still OWED): the row is STILL absent — this pass re-read `docs/decisions.md`'s
   `D-8` obligation from the outside only and asserts no more than the audit's reading (measurer: the gate-4 adversarial
   pass), namely that no such row exists. THE EXACT ROW IS NOW FIXED AND PRINTED AT `§8 D-8` (title
   `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`; the four things it must pin —
   the refreshed revision; the four-site atomic-restatement rule; the `D-3` re-affirmation; `E-2`'s standing policy).
   OWED TO THE SUPERVISOR'S TRACKER PASS; the DONE row may not report `D-8` discharged until that row exists (`§12.2`).⟩**
7. **`E-7` — the refresh's `measuredAt` value is `UNVERIFIED` by this pass** (no shell, no clock read): **the rule is
   §1.1 item 3; the value is the date the implementer's drift reading is taken.** **A literal invented here would be
   the exact invented figure this contract forbids.** **What settles it: the implementer's run.**
   **⟨SETTLED (gate-4 `A-12`): the value is `2026-09-28` — the implementer's run's LOCAL/repo day — and it is the date
   the refreshed drift reading was taken.** **The run's UTC day was `2026-09-29` (measurer: the implementer), and the
   local day governs** (`§1.1` item 3, `§2` item 3, `§12.12`). **The as-filed `UNVERIFIED` is KEPT: it was true of the
   filing pass, and the settlement is this amendment's `VERIFIED-BY-READ` reading of the landed literal.⟩**
8. **`E-8` — the STOP condition's premise is `UNVERIFIED` by this pass** (§0A item 8, §2): the fifteen modules' blob
   bytes at the refreshed revision have **not been read by this pass**. **A `RECORDED READING` supports the premise**
   (the supervisor's drift output states the fifteen modules are **byte-equal to the adjacent tree**; §0A item 1), **but
   a working-tree equality is not a blob read.** **What settles it: §3 item 3's per-module blob read, taken by the
   implementer BEFORE any edit.** **If the premise fails, this unit is not a refresh and the STOP fires.**
   **⟨SETTLED — the premise is now INDEPENDENTLY CONFIRMED, and the settling reading is the SUPERVISOR's measurement,
   named as the measurer: `git -C ../Provident-Electron diff --name-only 8f193a8d1446ed1e64c4ab6c569941e988f82459
   d7b98b574adc7fa63fbabda617eba2a753f52cb5 -- src/shared` is EMPTY, and per module
   `git rev-parse <rev>:src/shared/<name>.ts` yields IDENTICAL blob object-ids at BOTH revisions for all FIFTEEN (equal
   object-ids ⇒ equal bytes).** **So the STOP did NOT fire, the refresh is a refresh, and `P-TP-pd-pin-3`'s
   byte-identity claim holds across the two revisions — the reason the refreshed `digestCommand`'s claim is true
   (`§12.11`).** **The as-filed `UNVERIFIED` stands as the filing pass's status; the implementer's own per-module blob
   read remains the pass that GATES the edit (`§3` item 3), and this settlement does not substitute for it.⟩**
9. **`E-9` *(added by the gate-4 amendment — `A-7`; NON-BLOCKING, and NEVER a silent park)* — THE MONITOR'S BYTE-ONLY
   `CLEAN`: a PRE-EXISTING INSTRUMENT SEAM, OWED TO A SEPARATE, NAMED GATE.** **The seam, stated exactly** (`§3` item 1's
   amended annotation): `scripts/foundation-drift.mjs`'s `runMonitor` takes **no `.git` precondition**, so a foundation
   tree **present with the pinned bytes and NOT a git repository** reads **`CLEAN`, exit `0`**, with the *"NO revision
   reading was taken … it proves NOTHING about the pin"* line printed **inside** an otherwise `CLEAN` report — **the
   strongest surviving false-green against the monitor** (measurer: the gate-4 adversarial pass; the four limbs re-read
   this pass, `VERIFIED-BY-READ`). **It is NOT a refresh regression: it predates this unit and the refresh neither caused
   nor widened it.** **OWNER: A SEPARATE, NAMED GATE — the monitor's own unit, `PD-VENDOR-DRIFT-REVISION-STATUS`** (owed
   to the supervisor's tracker pass to open, and to the monitor's owning unit to land). **THE FIX SHAPE, NAMED SO THE
   GATE IS NOT RE-DERIVED: either (a) LABEL the status — a distinct label/arm for a byte-only reading (e.g.
   `CLEAN (BYTE-ONLY — NO REVISION READ)`) with its own `renderReport` branch and its own exit code — or (b) REFUSE
   exit `0` when `revisionChecked` is not `true` for a present tree.** **Its one known test-side consequence, so the gate
   is scoped honestly: the landed `tests/pd-vendor-drift.test.ts` row for exactly this situation (a temp tree carrying
   `scripts/foundation-drift.mjs`, `vendor/`, `src/shared/`, a `node_modules` symlink and NO `.git`) asserts the printed
   `/CLEAN/` and `code === 0` — so that gate OWNS that row's amendment, and this unit must not pre-empt it** (`§12.7`).
   **THIS UNIT IS FORBIDDEN THE FIX** (the monitor is `scripts/**`, `§1.2` item 7) — **so it is filed, named, and left
   open, exactly as `RCA-11`'s discipline requires.**
10. **`E-10` *(added by the gate-4 amendment — `A-8`; NON-BLOCKING, ESCALATED)* — THE MANIFEST'S `baselines` BLOCK CARRIES
   UNDATED PRESENT-TENSE CLAIMS THAT ARE NOW FALSE, AND ITS FIX IS A MANIFEST EDIT THIS UNIT MAY NOT MAKE.** **The audit's
   readings (measurer: the gate-4 adversarial pass):** `baselines.collectedSuiteCensus.reading` = *"204 collected files
   before and after the vendoring"* **while this head collects `208` files**; the `baselines.npmTest` cell is a **red-set
   reading at another commit** (`7d3b55c`, `VERIFIED-BY-READ`); `baselines.divergence` is **another repo's leg at another
   head**. **THE ACCEPTANCE CONDITION, and therefore the exact shape owed: EACH CELL MUST BE `measuredAt`-STAMPED AND
   SCOPED TO ITS OWN COMMIT** (a per-cell `measuredAt` and the commit the reading was taken at, in the cell itself),
   **which turns a false present-tense claim into an honest dated one.** **ESCALATION, stated plainly: leaving it is a
   LIVE FALSE CLAIM IN MACHINE-READABLE JSON** — worse than the prose staleness `E-4` files — **and this unit's authorised
   change set (`§1.2` item 4) does not cover it.** **OWNERS: the supervisor's manifest/tracker writes + the pin's owning
   unit at its next pass** (`E-4` is annotated beside it). **`A-8`'s "no second hand-maintained truth" rule is NOT
   violated by a stale RECORDED reading; it IS violated by an undated present-tense one.**
11. **`E-11` *(added by the gate-4 amendment — `A-11`; NON-BLOCKING)* — THE PER-MODULE `provenance` WORDING IS OWED AN
   ANNOTATION AND IS OUT OF THIS UNIT'S CHANGE SET.** **Each of the fifteen `modules[].provenance` cells reads *"the
   foundation blob at the pinned commit (recomputed by the PD-VENDOR landing pass) + proposal §2 table"*
   (`VERIFIED-BY-READ` this pass), which after the refresh names a commit that PREDATES the recomputation it claims.**
   **THE SHAPE OWED: the cells should read `8f193a8d`-recomputed + BYTE-PRESERVED** — **and the premise for that wording
   is SETTLED by the supervisor's measurement recorded at `E-8` above (identical blob object-ids at both revisions for
   all fifteen), so the annotation is a wording act, not a re-measurement.** **OWNERS: the pin's owning unit (or the
   supervisor's manifest pass) at its next pass.** **THE REFRESHED `digestCommand`'s CLAIM IS TRUE** and needs no
   annotation: **the command re-run at the refreshed revision yields the same digests** (`E-8`; `§12.11`).

---

## 10. Report the landing pass must make (what the DONE row must be able to say)

1. **The four sites' before → after literals**, with the refreshed revision, and the statement that **no module byte,
   no md5 and no `lineCount` moved** (`D-1`).
2. **The red-set reading**: the new file's name, its row count, **which row was RED at the red run and why the other
   two were GREEN-ON-ARRIVAL** (§6 item 2). **A DONE row that reports a red without naming the row is a review finding.**
3. **The premise check's result** (§3 item 3) — per module, or an explicit statement that all fifteen blobs were read
   and agree — **and, if any disagreed, the STOP and the escalation** (§2).
4. **The `npm run drift` reading, verbatim**, with the **tree state and the revision it read**: **`CLEAN` (or `SKIPPED`
   with its honesty statement)** — **never a bare green word, never a `SKIPPED` presented as a pass** (§3 item 1,
   `F-10`).
5. **The before → after trio counts** (§7.1), with **the one remaining red named as the CARRIED BASELINE by name and
   defect id** — and **no claim of a clean trio** (`R-6`).
6. **`npm run conformance`'s reading, WITH its class labels and the statement that its evidence is empty for all
   fifteen modules** — **no green word** (`R-5`).
7. **The four `STRUCTURALLY NON-APPLICABLE` gates, each with its reason** (§7.2) — **blind greens, the live battery,
   `battery`, `divergence`** — **and the two mandatory review gates that DID run** (adversarial; documentation
   review).
8. **Every escalation `E-1`…`E-8`**, with `E-1`'s owed `PD-UI-6` note and `E-2`'s standing policy named explicitly.
9. **The layer statement**: everything above is **`[T]`/`[H]`/`[D]`/DOC-layer — never app, never envelope-behaviour,
   never live** (`RCA-12`).

> **⟨AMENDED (gate-4) — FOUR MORE OBLIGATIONS, so the DONE row reports the amended contract and not the as-filed one.⟩**
> **10.** **The `§12` ledger's dispositions, item by item** — **`A-1`…`A-12` and `R1`/`R2`/`R3`** — with **each finding's
> status at the DONE row's head** (`DONE` / `OWED to <owner>` / `accepted-with-reason`), **and the three BLOCKING ones
> (`A-1`, `A-2`, `A-3`) named as blocking with their unblocking act**: **`A-1` ✔ (the `§12` ledger now exists — this
> amendment), `A-2` (the supervisor's decision row, title printed at `§8 D-8`), `A-3` (the TestWriter's title refresh +
> the register's control substitution).**
> **11.** **The register's RE-DERIVATION reading** — the file's row/term counts and verdicts **under `§4.1`'s CURRENT
> terms** (`7 + 16 + 21 = 44`), **with the as-filed `30` named as the superseded reading** (`§12.16`), **and with the
> `A-9` anchoring confirmed in the file's own source** (no whole-file regex over this contract). **A re-derivation that
> keeps the `30`-based tables, or that omits any of `A-5`'s negatives / `A-6`'s drives / `A-7`'s non-git limbs, is a
> review finding.**
> **12.** **The three OWED items this amendment creates, each with its owner** — **`E-9` (the monitor's byte-only `CLEAN`;
> owner: the separate NAMED gate `PD-VENDOR-DRIFT-REVISION-STATUS`), `E-10` (the `baselines` date-stamping; owner: the
> supervisor's manifest/tracker writes + the pin's owning unit), `E-11` (the `provenance` wording; owner: the pin's
> owning unit / the supervisor's manifest pass)** — **reported as OWED, never as done, and never as a silent park**
> (`§9`; `§12.17`).
> **13.** **The `D-12`/`D-13` rulings' effect on the tests** — **the `§3.3 item 2` row TITLE refreshed with the superseded
> literal kept as an explicitly-annotated historical citation, and NO real file's prose frozen by any register control**
> (`D-12`); **the `measuredAt` limb and the declaration-count terms driven** (`D-13`). **`tests/pd-vendor-set.test.ts`'s
> row is untouched — a DONE row that reports it edited is a `F-5` review finding.**

---

## 11. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/unit-pd-vendor-foundation-mechanisms.md` (§2.1 items 1–2 the fifteen; §2.2 the manifest key by key; §2.3 the
monitor's `SKIPPED` honesty rule; §2.4 the `A2` row's `G-9` limits; §3.1 `V-1`/`V-4`/`V-5`; §3.2 the manifest read; §3.3
items 1–2 the digest run and the revision confirmation; §3.4 item 2 the monitor never writes; §4 the register;
§4 `P-IM-1`; §3.5 items 4/7 + §13.2 the leg's empty evidence; §3a `A-3` the pin arm; §8 the blind verification;
§13.6; §12.3(d) the citation discipline example; its `§12`/`§13` amendment ledgers) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md` (the blind artifact's `A5` row and its scenario table) ·
`docs/specs/pd-vendor-adoption-dossier.md` ·
`docs/specs/post-division-rebuild-proposal.md` (§2 the measured vendoring model; §4.7 `A-8`; §5 `G-1` and `G-8`;
§7.4/§7.5) · `docs/specs/post-division-rebuild-proposal-review.md` · `docs/decisions.md`
**`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (clauses (1)/(2)/(5)) ·
**`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS`** (clause (1), the carried red) ·
**`DECIDED: REBUILD-ARCHIVE-POLICY`** (clauses (1)/(2)/(3)) · `DECIDED: POST-DIVISION-REBUILD-PD-UI-6-INERT-HALF-SCOPE-EXCLUSION`
(the `OS-1` ruling's home) · `docs/specs/unit-pd-ui-6-modal-state.md` (§7.1/§7.3 finding `R3`; **§7.4 the pin's
disposition**; `D-11`) · `docs/specs/pd-ui-6-adoption-dossier.md` §0A (the `A-3` host fix behaving as designed) ·
`docs/specs/unit-pd-ui-1-theme.md` (§4's row-id qualifier; §9 item 1 `E-1`'s re-statement, a DIFFERENT act: that one
re-stated a **fact-pin about the tree**, this unit moves the **revision anchor**) · `docs/pending.md` (the carried pin
condition) · `docs/next-steps.md` (the `PD-UI-6` disposition note; the post-division-rebuild CURRENT WORK block) ·
`docs/defects.md` `PANE-TOGGLE-STAGE-COLLAPSE` · `docs/specs/rca-live-bugs-green-pipeline.md` `RCA-11`/`RCA-12` ·
`docs/specs/requirement-catalog.md` §3.4 rule 7 · `docs/specs/unit-divergence-harness-precondition.md` ·
`tests/pd-vendor-set.test.ts` (`§3.3 item 2` the revision arm; the `A-7`/`A-3` blob-containment row; the inert-vendoring
pin) · `tests/pd-vendor-manifest.test.ts` (`§3.3 item 2`, read twice) · `tests/pd-vendor-drift.test.ts` (`PINNED_COMMIT`
as the synthetic default and the must-differ anchor) · `scripts/foundation-drift.mjs` → `compareFoundation`,
`foundationRevision`, `A3_LABEL`, the three status labels, `main` · `package.json` `scripts.drift` /
`scripts.conformance` · `vendor/foundation.lock.json` (`foundation.commit`, `foundation.digestCommand`,
`foundation.measuredAt`, `foundation.byteIdentity`, `modules`, `baselines`).

**⟨AMENDED (gate-4) — the cross-references this amendment ADDS; every one is `path` + symbol / row id / `§section`, never
a line number (`docs/specs/requirement-catalog.md` §3.4 rule 7).⟩**
`tests/pd-vendor-pin-refresh-register.test.ts` (the LANDED register file: its three `describe`/`it` rows, its
`DECLARED_REGISTER` table, its `constantDeclarationsIn` / `pinnedConstantIn` / `abbreviatedLiteralInATitle` /
`identityProblems` / `readIdentitySubject` / `blobAbsenceOracle` / `pinEqualityOracle` / `byteOnlySeamOracle` /
`restatementProblems` / `commandPinLimb` / `measuredAtLimb` / `declaredRefreshReading` / `specRegion` /
`registerRegion` / `redSetRegion` / `drawnMutation` readers, its `synthesizedTitleText` control, its `REPORTS`
register report and its spec-reading limbs) ·
**⟨CORRECTED 2026-09-28 BY THE `PD-VENDOR-PIN-REFRESH` ITEM-10d DOCUMENTATION REVIEW — the LANDED register file does NOT
export the reader names this clause carried AS FILED, and a citation to a symbol that does not exist is the phantom-ref
class the gate exists to catch. The as-filed list is KEPT BESIDE the corrected one, never deleted (`RCA-8(c)`).⟩**
**AS FILED (the gate-4 amendment pass's reading, KEPT so the drift is visible): `constantDeclarationCount` ·
`pinnedConstantIn` · `abbreviatedLiteralInATitle` · `moduleIdentityOracle` · `blobAbsenceOracle` ·
`pinEqualityOracle` · `fourSiteAgreementOracle` · `mutateHex` positions · `syntheticTitleText` · `REPORTS`.** **THE
LANDED NAMES (VERIFIED-BY-READ this pass): the declaration reader is `constantDeclarationsIn` (the as-filed
`constantDeclarationCount` is the ASSERTION, not a function — `r.read.count` drives it); the identity oracle is
`identityProblems` (+ `readIdentitySubject`), NOT `moduleIdentityOracle`; the row-level agreement oracle is
`restatementProblems`, NOT `fourSiteAgreementOracle`; the title-text builder is `synthesizedTitleText`, NOT
`syntheticTitleText`; and `mutateHex` NO LONGER EXISTS — its role is `drawnMutation(literal, state)` (the LCG-drawn
position + replacement, with the no-op guard REPORTED).** **AND THE ONE LIVE-FALSE CLAUSE THIS PASS HAD TO CHECK
AND CLEAR:** the same gate-4 block records that `tests/pd-vendor-pin-refresh-register.test.ts` asserts
`manifestPinText.includes('8f193a8') … .toBe(true)` over the REAL file — **`manifestPinText` appears NOWHERE in the
landed register** (VERIFIED-BY-READ), which is the `A-3` disposition `§12.3`/`D-12` ordering: **the register NEVER
freezes a real file's prose; the control's subject is the synthetic title text alone, and the only real-file limb kept
is the DECLARATION COUNT.** **`§12.3`'s and `§2` items 4–6's description of the as-filed freeze stands as the
AS-FILED record; the LANDED state is the one described here.** ·
`tests/pd-vendor-manifest.test.ts` → **the `§3.3 item 2` row TITLE** (the superseded abbreviation, the `A-3` subject) ·
`scripts/foundation-drift.mjs` → **`renderReport`** (its `CLEAN` branch, the `revisionChecked === true` arm and the *"NO
revision reading was taken"* disclaimer), **`runMonitor`** (the absent-`.git`-precondition path) and the comparator's
returned **`revisionChecked`** field · `docs/decisions.md` → **the OWED row
`DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`** (`§8 D-8`, `§9 E-6`) ·
**the OWED named gate `PD-VENDOR-DRIFT-REVISION-STATUS`** (`§9 E-9`) · `vendor/foundation.lock.json` →
**`foundation.measuredAt`'s landed value and the per-module `provenance` wording** (`§9 E-11`) and the **`baselines`
cells** (`§9 E-10`) · `docs/pending.md` and `docs/next-steps.md` (the same owed notes as `E-1`) ·
`AGENTS.md` item 11 (`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`) · `docs/skills/process-guardrails.md` (the `RCA-11`/`RCA-12`
consolidation read by this pass).

---

## 12. THE AMENDMENT LEDGER — the gate-4 adversarial pass (`PASS-WITH-FINDINGS`), its findings `A-1`…`A-12`, and the TestWriter's remands `R1`/`R2`/`R3`

**Ledger date: the LOCAL/repo day `2026-09-28`** (`A-12`'s rule; **this pass read no clock and holds no shell — the date
is a CARRIED reading, and if the amendment's own local day differs this heading is corrected in place rather than left
wrong**). **This section is CONTRACT, not commentary.** **It is the ledger `§7`'s adversarial row orders** (`A-1`) **and
it exists so a TestWriter, an Implementer, a blind-greens writer or a later documentation reviewer can see WHICH READING
IS CURRENT without re-deriving it.** **Its layer is DOC-LAYER** (`RCA-12`): **every figure in it is either this pass's
`VERIFIED-BY-READ`, or a `RECORDED READING` printed with its measurer named** — **the audit ran nothing, the supervisor
measured the premise, the implementer measured the legs, the TestWriter's red-set pass raised the remands, and THIS PASS
RAN NOTHING AT ALL.** **Nothing as-filed is deleted, nothing is renumbered, and no clause here rewrites another
section: this ledger states the ruling and the §-reference of the clause that carries it** (`RCA-8(c)`,
annotate-beside). **It widens no surface: the change set stays `§1.1`'s four sites, the DENIED list stays `§1.2`'s, and
this pass wrote ONE file — this one** (`§1.2` item 10).

### 12.0 THE VERDICT, THE AUDIT'S OWN VERDICT ON ROW 3, AND THE LANDED STATE

**THE GATE-4 ADVERSARIAL RESULT — `PASS-WITH-FINDINGS`** (`RECORDED READING`, measurer: the gate-4 read-only adversarial
pass, `RCA-3`): **the refresh is MECHANICALLY CORRECT, and the pin's one LOAD-BEARING PROPERTY SURVIVES — *equal bytes at
a different commit are NOT the pinned state* — because (i) the pin arm GATES ON A SUCCESSFUL `rev-parse` and (ii) the
COMPARATOR REFUSES `CLEAN` BEFORE IT COMPARES BYTES** (recorded with its mechanism at `§8 D-3`; the mechanism is what a
future pass must not break). **The audit's own `P-TP-pd-pin-3` verdict is recorded at §12.13, and the two re-drives it
found worthless are recorded with it.**

**The findings table — every finding with its id, its subject (`path` + symbol / row id / `§`), its layer, its
disposition and its DONE-blocking status.**

| # | Finding and its subject (`path` + symbol / row id / `§`) | Layer | Disposition | DONE-blocking? |
| --- | --- | --- | --- | --- |
| **`A-1`** | **this spec's `§7` row *"the adversarial pass (read-only)"*** — it orders the findings recorded in *"this spec's amendment ledger (a `§12`)"* **and the file ended at `§11`, so the pointer had no referent** | **DOC (this file)** | **`HOST-FIX` to this spec: the `§12` ledger is ADDED (this section) and `§7`'s cell is annotated so the pointer is TRUE** — `§7`'s amended cell, **§12.1** | **YES — DISCHARGED by this amendment.** |
| **`A-2`** | **`docs/decisions.md`** (the absent row) ↔ **this spec's `§8 D-8` and `§9 E-6`** | **tracker / DOC** | **OWED to the SUPERVISOR's tracker pass.** **The exact row is printed at `§8 D-8` (title + the four things it must pin).** **Not satisfied here, and not to be reported as satisfied** — **§12.2** | **YES — NOT discharged; the DONE row may not report `D-8` discharged while the row is absent.** |
| **`A-3`** | **`tests/pd-vendor-manifest.test.ts` → its `§3.3 item 2` row TITLE** (still says *"equals the pinned revision `8f193a8…f82459`"*, present-tense FALSE) **and the landed register's `manifestPinText.includes('8f193a8') … .toBe(true)` limb**, which FREEZES that prose | **`[T]` (test prose) + `[T]` (register control)** | **`HOST-FIX` + `SPEC amends`: the title IS refreshed with the superseded literal kept as an EXPLICITLY-ANNOTATED HISTORICAL CITATION; the register's control moves to a SYNTHETIC title text (`D-12`).** **Both halves OWED TO THE TESTWRITER** — `§2` items 4–6's amended block, `§1.1` item 4's amended cell, **§12.3** | **YES — OWED; unblocked by the TestWriter's two halves.** |
| **`A-4`** | **`§1.1` item 3 (`foundation.measuredAt`) vs `§4` row 2's closure claim** — `§1.1` lists FOUR literal sites, the row's set was three constants + the `digestCommand` limb, and **no row read `measuredAt`** | **DOC + `[T]`** | **RULED by `D-13`: FOLD it in** — row 2 gains ONE `measuredAt` limb (present · `YYYY-MM-DD` · equal to the declared local/repo-day reading); the term is RE-PRINTED with the old visible; `F-13` added; **the TestWriter owes the drive** — `§4.1`, `§3` item 4, **§12.4** | **NO.** |
| **`A-5`** | **`§4` row 2's domain/terms** — a SECOND `PINNED_COMMIT` declaration with a different literal was INVISIBLE (the `constantDeclarationCount(...).toBe(1)` checks sat OUTSIDE the declared domain), and the `digestCommand` limb was a bare `includes(pin)` | **`[T]` / source-text** | **RULED: fold in ONE declaration-count term PER FILE (a bounded attempt each, so the tally prints honestly) and require the command limb to assert EXACTLY ONE distinct 40-hex literal equal to the pin.** **Old and new arithmetic printed, old kept visible; the negatives OWED TO THE TESTWRITER** — `§4.1`, `F-12`, **§12.5** | **NO (under-strength, not false).** |
| **`A-6`** | **`§4` row 3's three controls** — control 1 tested `md5()`, control 3 a bare `lstatSync()`, control 2 drove a DIFFERENT function (`blobAbsenceOracle`), and **the row's most important branch (blob md5 ≠ vendored md5) had NO control** | **`[T]`/`[D]`** | **`HOST-FIX` to the register: factor the identity oracle to TAKE BYTES and drive it with (a) perturbed bytes, (b) a symlinked fixture, (c) a present-but-differing blob md5.** **`P-TP-pd-pin-3` is the ONE row that must NEVER be relaxed** — `§4.1`, **§12.6** | **NO.** |
| **`A-7`** | **`scripts/foundation-drift.mjs` → `runMonitor`'s absent `.git` precondition, `renderReport`'s `CLEAN` branch and `revisionChecked`**; **the landed `tests/pd-vendor-drift.test.ts` row for exactly that tree** | **`[D]` local instrument** | **OWED TO A SEPARATE, NAMED GATE — `PD-VENDOR-DRIFT-REVISION-STATUS` (`E-9`), fix shape named (label the status, and/or refuse exit `0` when no revision was read).** **PRE-EXISTING instrument seam, NOT a refresh regression; the register-side negatives are OWED TO THE TESTWRITER; NEVER a silent park** — `§3` item 1's amended annotation, `§7`'s `drift` row, **§12.7** | **NO for the unit's own DONE — but the OWED gate is filed, named and must be opened.** |
| **`A-8`** | **`vendor/foundation.lock.json` → its `baselines` block** (`collectedSuiteCensus.reading` = *"204 collected files before and after the vendoring"*; the `npmTest` cell a red-set reading at another commit; `divergence` another repo's leg at another head) | **machine-data / DOC** | **OWED + ESCALATED (`E-10`): each cell must be `measuredAt`-STAMPED and SCOPED TO ITS OWN COMMIT.** **`§1.2` item 4 rules the refresh out of the change set; leaving it is a live false claim in machine-readable JSON** — **§12.8** | **NO (but escalated; the fix is a manifest edit an owner must take).** |
| **`A-9`** | **`tests/pd-vendor-pin-refresh-register.test.ts`'s spec-reading limbs** — the tally line, the seed, the caps, the row/strategy ids and `/RED[\s\S]{0,600}?GREEN-ON-ARRIVAL/` are read as GLOBAL REGEXES OVER THE WHOLE SPEC FILE | **`[T]`** | **`HOST-FIX` to the register: anchor to the `§4` TABLE REGION and to the ARITHMETIC, never a global regex over the file.** **The requirement is STATED IN `§4`** (its anchoring bullet) — **§12.9** | **NO (but `A-1`'s own `§12` is the live proof it fires).** |
| **`A-10`** | **`§4` row 1's controls** — three FIXED mutation positions, a one-line `===` oracle instead of the comparator's pin arm, and `mutateHex`'s no-op guarded in one control but not another | **`[T]`** | **ACCEPTED-WITH-REASON for the guarded no-op; OWED TO THE TESTWRITER for the LCG-drawn position and the comparator drive** (folded into row 1's amended term) — `§4.1`, **§12.10** | **NO.** |
| **`A-11`** | **`vendor/foundation.lock.json` → `modules[].provenance`** (*"recomputed by the PD-VENDOR landing pass"*) **and the refreshed `digestCommand`'s claim** | **machine-data / DOC** | **THE PREMISE IS INDEPENDENTLY SETTLED — the supervisor's measurement is the settling reading (empty `diff --name-only`; identical blob object-ids at both revisions for all fifteen), so the `digestCommand` claim is TRUE; the `provenance` WORDING is OWED (`E-11`) and stays OUT of the change set** — `§1.1`'s annotated block, `§8 D-1`, `E-8`, **§12.11** | **NO.** |
| **`A-12`** | **`foundation.measuredAt`'s local-vs-UTC ambiguity** | **machine-data / DOC** | **RULED: the reading's LOCAL/REPO day is AUTHORITATIVE** — `§1.1` item 3's amended cell, `§2` item 3, `E-7`; **the landed literal `2026-09-28` legitimately did NOT move while the run's UTC day was `2026-09-29`** — **§12.12** | **NO.** |

**THE LANDED STATE — `VERIFIED-BY-READ` this pass (reader: the spec-writer) and quoted with its measurer otherwise.**
**Sites: `§1.1`'s landed block.** **The register file, the red set and the refresh have all LANDED**: the manifest pins
`d7b98b574adc7fa63fbabda617eba2a753f52cb5`, `measuredAt` reads `2026-09-28`, `digestCommand` names the refreshed revision,
**all three `PINNED_COMMIT` constants carry it**, **the register file exists**, and **the audit's count for this head is
`208 files`** (measurer: the gate-4 adversarial pass). **`UNVERIFIED` BY THIS PASS (no shell, no run log): the register's
red-run reading, the landed `npm run drift` reading, the landed trio counts, and the current green/red of the suite** —
**all four are owed by the DONE row** (`§10` items 2/4/5/11). **Also `VERIFIED-BY-READ` this pass: `docs/decisions.md`
carries NO pin-refresh decision row** (its `ACTIVE` `DECIDED:` rows name no such decision and the refreshed revision
literal appears nowhere in it) — **so `A-2`'s absence is confirmed by this pass's own read, not only by the audit's.**

### 12.1 `A-1` — THE `§7` POINTER HAD NO REFERENT; THE `§12` LEDGER IS NOW ITS HOME

**Disposition: `HOST-FIX` to this spec; DONE-blocking, and DISCHARGED by this amendment.** **Clause amended:** `§7`'s
adversarial row (**annotated, not rewritten: the as-filed cell text — including *"this spec's amendment ledger (a
`§12`)"* and *"each host finding is fixed here + regression-tested"* — STAYS VISIBLE**), **plus this new `§12`**.
**The as-filed defect, stated exactly:** the spec ORDERED a record into a section it did not contain — **a contract
instruction with no home**, which is why the audit called it BLOCKING: **a finding written nowhere is a finding
dropped**, and `RCA-3`'s "its findings are recorded in the unit's spec" would have been unmeetable by construction.
**What this amendment adds:** **the ledger itself** (12.0–12.18), **the verdict**, **the twelve dispositions**, **the
remands**, **the judgement calls**, **the new arithmetic**, **the owed items with owners**, and **the boundary statement**
(§12.18). **`§7`'s pointer is now TRUE, and the ledger says so at its own head.**

### 12.2 `A-2` — THE `D-8` DECISION ROW IS OWED, ABSENT, AND NOW FULLY SPECIFIED

**Disposition: OWED to the supervisor's tracker pass; DONE-blocking; NOT satisfied.** **Clauses amended:** `§8 D-8`
(the exact row appended inside the cell), `§9 E-6` (annotated beside), `§10` item 10. **The row the supervisor's tracker
pass will write — title and the FOUR things it must pin:**

> **`DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`** — pinning **(i) the refreshed
> revision literal `d7b98b574adc7fa63fbabda617eba2a753f52cb5`**; **(ii) the FOUR-SITE ATOMIC RESTATEMENT RULE** (one
> restatement in one commit, never a partial one — `F-1`/`F-2`); **(iii) the RE-AFFIRMATION of `D-3`** (a moved
> foundation HEAD is a pin fault BY DESIGN; equal bytes at a different commit are NOT the pinned state; the pin arm is
> never made revision-tolerant); **(iv) `E-2`'s STANDING POLICY** for every future refresh — its own unit (or an
> explicitly-scoped row), all four sites atomically, the pre-edit premise check, and a re-read to `CLEAN`.

**Why it is not discharged here:** **this pass writes ONE file and no tracker row** (`§1.2` item 10; the SPEC pass's own
wall). **A DONE row that reports `D-8` discharged before that row exists is reporting a document that is not there.**

### 12.3 `A-3` — THE SEVENTH-SITE TRAP IS A LIVE FALSE STATEMENT; THE RULING IS "THE TITLE IS REFRESHED", AND THE FREEZE MOVES TO A SYNTHETIC TEXT

**Disposition: `HOST-FIX` + `SPEC amends`; DONE-blocking; OWED to the TestWriter (two halves).** **Clauses amended:**
`§2` items 4–6 (the amended block), `§1.1` item 4's amended cell, `§1.2`'s annotated block (items 6/7 precision),
`§8 D-12` (new ruling), `§10` item 13. **The audit's measurement (`RECORDED READING`; re-read this pass,
`VERIFIED-BY-READ`): the title still names `8f193a8…f82459` in the PRESENT TENSE; the landed register asserts
`manifestPinText.includes('8f193a8') && manifestPinText.includes('f82459')` on the REAL file with `.toBe(true)` and the
prose *"the control has a subject"*.** **So an implementer who exercised the permission `§2` granted and refreshed the
title would have REDdened a GREEN row, and the failure message would have blamed the CONTROL.** **THE RULING (three
parts, all recorded at `§2` items 4–6 and `D-12`):** **(i) the title IS refreshed** (the permission is exercised, not
merely permitted); **(ii) the superseded literal is KEPT as an EXPLICITLY-ANNOTATED HISTORICAL CITATION** —
`⟨superseded: 8f193a8…f82459 was the pin before the 2026-09-28 refresh⟩` — **nothing deleted**; **(iii) the register's
control moves to a SYNTHETIC title text** (the register already builds `syntheticTitleText`), **so no register control
ever freezes a real file's prose again**. **The only real-file limb that may stay is the DECLARATION COUNT, which `A-5`
folds into row 2's domain.** **`tests/pd-vendor-set.test.ts`'s row is NOT touched** (`D-5`, `F-5`): the audit's `A-3`
is about the MANIFEST file's title, a different row in a different file — **`R3` is the same finding and is disposed
here (§12.14).**

### 12.4 `A-4` — THE CLOSURE CLAIM DID NOT MATCH `§1.1`; `measuredAt` IS FOLDED INTO ROW 2

**Disposition: RULED (`D-13`); non-blocking; the TestWriter owes the drive.** **Clauses amended:** `§1.1` item 3's
amended cell, `§2` item 3, `§4.1` (row 2's amended domain), `§3` item 4 (new `F-13`), `§5`'s non-claim note, `§8 D-13`.
**The audit's readings:** `§1.1` lists **four** literal sites — the third being `foundation.measuredAt` — while row 2's
site set was **three constants + the `digestCommand` limb**, and **no row read `measuredAt` at all, so corrupting it left
the register fully green** (measurer: the gate-4 adversarial pass). **THE RULING, with its reason:** **fold `measuredAt`
in — the FIRST of the two options the audit allowed.** **Reason:** restating the closure claim would have left an
ALLOWED `§1.1` site **with no reader at all**, which is the same shape the Phase-0 pass ruled against; folding it in
makes `§1.1`'s site list and the register's closure **name the same four sites** and turns a corruption into a
documented fail-state. **The limb:** `foundation.measuredAt` is **present**, matches **`YYYY-MM-DD`**, and **equals the
contract's declared refresh reading (`2026-09-28`)** — **one attempt, both conditions together**. **Fail-state added:**
`F-13`. **OWED TO THE TESTWRITER: the drive** (plus a synthetic-manifest control with an ill-formed/absent date that MUST
fail). **The term is re-printed at `§4.1` and at §12.16, with the old `6 = 3 + 1 + 2` kept visible.**

### 12.5 `A-5` — THE PARTIAL-RESTATEMENT GUARD WAS WEAKER THAN ITS OWN GUARDS NEEDED; THE TERMS ARE RE-DERIVED

**Disposition: RULED; non-blocking (under-strength); the TestWriter owes the negatives.** **Clauses amended:** `§4`'s
anchoring bullet (added), `§4.1` (row 2), `§4`'s attempt tally (annotated), `§1.1` item 4's amended cell, `§3` item 4
(new `F-12`). **The two holes, exactly:** **(i) a second `PINNED_COMMIT` declaration with a DIFFERENT LITERAL was
INVISIBLE** — the `constantDeclarationCount(...).toBe(1)` checks sat **OUTSIDE the declared domain** (`F-12` now names
this fail-state); **(ii) the `digestCommand` limb was a bare `includes(pin)`** — **a command containing BOTH literals, or
a 64-hex string whose first 40 characters are the pin, satisfied it, while the live command then fails with git's
ambiguous-revision error.** **THE RULING:** **fold in ONE declaration-count term PER FILE — a bounded attempt each, so
the tally prints honestly — and require the command limb to assert EXACTLY ONE distinct 40-hex literal, equal to the
pin.** **OWED TO THE TESTWRITER (the negatives, declared as drives, never implied): a two-declaration text in BOTH
ORDERS (`2`); a command carrying BOTH literals (`1`); a 64-hex containment whose first 40 characters are the pin (`1`);
and a joint LCG-drawn mutation over the synthetic sites (`2`).** **The old and new arithmetic are both printed
(§12.16).**

### 12.6 `A-6` — ROW 3'S CONTROLS WERE PROXIES; THE ORACLE TAKES BYTES AND THE MISSING BRANCH GETS ITS CONTROL

**Disposition: `HOST-FIX` to the register; non-blocking.** **Clauses amended:** `§4.1` (row 3), `§4`'s attempt tally,
`§5`'s non-claim note, `§7`'s row-3/`drift` note. **The audit's readings (measurer: the gate-4 adversarial pass; the
three controls re-read this pass, `VERIFIED-BY-READ`): control 1 tests `md5()` — not the oracle; control 3 tests a bare
`lstatSync()` — not the oracle's symlink branch; control 2 drives a DIFFERENT function (`blobAbsenceOracle`); and the
row's most important branch — **blob md5 ≠ vendored md5** — has **NO control at all**. THE RULING: **the identity oracle
is FACTORED TO TAKE BYTES (an `lstat`-derived regular-file flag + vendored bytes + blob bytes + the declared md5), so
every control drives the SAME limb the real sweep drives**, and it is driven with **(a) perturbed bytes, (b) a symlinked
fixture through the oracle's own regular-file limb, (c) a present-but-differing blob md5**; the absent-blob/naming-the-
path control is **RETAINED**. **The drives are OWED TO THE TESTWRITER.** **And the standing rule, recorded so no pass
softens it: `P-TP-pd-pin-3` is the ONLY reader that compares the blob at the recorded commit against BOTH the vendored
bytes and the manifest's md5 — IT MUST NEVER BE RELAXED, and its controls are brought UP to its importance, never
down** (§12.13).

### 12.7 `A-7` — THE MONITOR'S BYTE-ONLY `CLEAN`: A PRE-EXISTING INSTRUMENT SEAM, OWED TO A SEPARATE NAMED GATE

**Disposition: OWED to a SEPARATE, NAMED gate (`E-9`); non-blocking for this unit's own DONE; NEVER a silent park.**
**Clauses amended:** `§3` item 1's amended annotation, `§7`'s `drift` row, `§5`'s named non-claims, `§4.1` (row 1's
register-side negatives), `§9 E-9` (new). **The seam, exactly** (audit's measurement; limbs re-read this pass,
`VERIFIED-BY-READ`): `runMonitor` **takes no `.git` precondition**; the pin arm runs only on a non-empty
`foundationRevision`; `renderReport`'s `CLEAN` branch then prints *"NO revision reading was taken (the tree is not a git
repository), so this reading is a BYTE reading only — it proves NOTHING about the pin"* **INSIDE** a `CLEAN` report,
**exit `0`** — and **the landed `tests/pd-vendor-drift.test.ts` row for exactly that tree asserts `/CLEAN/` and
`code === 0` and does NOT assert that the report does not claim the pin.** **THE RULING:** **a `CLEAN` whose
`revisionChecked` is not `true` is a BYTE-ONLY reading — never the pinned state, never pin evidence, and a DONE row
quoting it must quote the disclaimer with it.** **WHY IT IS A SEPARATE GATE AND NOT FIXED HERE:** the monitor is
`scripts/**`, which **`§1.2` item 7 forbids this unit to touch**; **`F-4`'s loosening is still the worst outcome
available, and "fixing" the instrument in a pin-refresh unit is exactly the confusion `D-3` forbids.** **THE NAMED GATE:
`PD-VENDOR-DRIFT-REVISION-STATUS`**, with the fix shape named at `E-9` (a distinct status label/arm for a byte-only
reading, and/or refusing exit `0` when no revision was read) **and with its one known test-side consequence declared**
(the landed `pd-vendor-drift` row owns that amendment, so this unit must not pre-empt it). **OWED TO THE TESTWRITER
(register-side negatives): a present, byte-equal, NON-GIT tree driven through the monitor CLI; an unreadable/broken
`.git`; and a comparator drive with an explicit divergent revision.** **Two further readings this pass adds to the
audit's:** **(a) the disclaimer's stated CAUSE (*"not a git repository"*) is not the measured cause** — the same `else`
branch covers any failed `rev-parse`; **(b) the register-side limb must be authored at the honest CURRENT minimum
(disclaimer present + no pin-equality claim) and TIGHTENED when the named gate lands** — **so the register neither
pre-empts the gate nor leaves the seam invisible.**

### 12.8 `A-8` — THE `baselines` BLOCK: UNDATED PRESENT-TENSE CLAIMS, AN EXACT OWED SHAPE, AND AN ESCALATION

**Disposition: OWED + ESCALATED (`E-10`); non-blocking; outside this unit's change set.** **Clauses amended:**
`§1.1`'s annotated block, `§9 E-4` (annotated beside), `§9 E-10` (new). **The audit's readings (measurer: the gate-4
adversarial pass), quoted with the as-filed context: `collectedSuiteCensus.reading` = *"204 collected files before and
after the vendoring"* while this head collects `208` files; the `npmTest` cell is a red-set reading at another commit
(`7d3b55c`, `VERIFIED-BY-READ`); `divergence` is another repo's leg at another head.** **THE ACCEPTANCE CONDITION AND
THEREFORE THE EXACT SHAPE OWED: each cell is `measuredAt`-STAMPED and SCOPED TO ITS OWN COMMIT** — a per-cell
`measuredAt` plus the commit the reading was taken at, **so an earlier reading reads as an earlier reading instead of a
present-tense one.** **THE ESCALATION, PLAINLY: leaving it is a LIVE FALSE CLAIM IN MACHINE-READABLE JSON** — a
different and worse thing than the prose staleness `E-4` files — **and this unit's authorised change set (`§1.2` item 4)
does not cover it.** **OWNERS: the supervisor's manifest/tracker writes + the pin's owning unit at its next pass.**

### 12.9 `A-9` — THE REGISTER MUST ANCHOR TO `§4`'S TABLE REGION AND THE ARITHMETIC, NOT TO A WHOLE-FILE REGEX

**Disposition: `HOST-FIX` to the register; non-blocking; the requirement is now STATED IN `§4`.** **Clauses amended:**
`§4`'s machinery (the anchoring bullet, added), `§6` item 5's amendment (obligation ⑥), `§10` item 11. **The audit's
reading (limbs re-read this pass, `VERIFIED-BY-READ`): the spec-reading row reads the WHOLE spec file** — the tally line,
the seed, the caps, the stop rule, the adjacencies, each row/strategy id, and `/RED[\s\S]{0,600}?GREEN-ON-ARRIVAL/`.
**Consequence: a LEGITIMATE future amendment of this contract REDS the suite — and `A-1`'s required `§12` is the live
proof (this amendment is exactly such an amendment, and it is the reason the tally string must stay printed as filed
above).** **THE RULING: anchor to the `§4` TABLE REGION and to the ARITHMETIC** — addressed by the declared row ids,
strategy ids, seed, caps, stop rule and tally line — **never a global regex or a whole-file `toContain`**; **and the
arithmetic limb must assert the CURRENT terms (§12.16), with the earlier arithmetic reachable only through an
explicitly-named superseded block.** **OWED TO THE TESTWRITER.**

### 12.10 `A-10` — ROW 1'S CONTROLS: FIXED POSITIONS, A PROXY ORACLE, AND ONE GUARDED NO-OP

**Disposition: ACCEPTED-WITH-REASON (the guarded no-op) + OWED to the TestWriter (the LCG-drawn position and the
comparator drive); non-blocking.** **Clauses amended:** `§4.1` (row 1), `§4`'s attempt tally, `§1.2`'s annotated block
(item 7's read/edit distinction). **The audit's readings (re-read this pass, `VERIFIED-BY-READ`): the controls use FIXED
mutation positions (three across the file) and drive a one-line `===` (`pinEqualityOracle`) rather than
`compareFoundation`'s pin arm; `mutateHex`'s identity case is guarded in one control and not another.** **THE RULINGS:**
**(i) ACCEPTED-WITH-REASON for the guarded no-op** — a control that cannot mutate its subject cannot discriminate, and
the row already reports that state as a counterexample rather than passing silently; **the re-derived row must GUARD
EVERY draw and REPORT every no-op** (a draw that is the identity is reported, never silent). **(ii) OWED: the mutated
POSITION is drawn from the pinned LCG over the 40-hex domain** (never a fixed literal). **(iii) OWED: the row drives
the monitor's OWN pin arm** — its exported `compareFoundation`, **READ, never edited** (`§1.2` item 7's annotated
read/edit distinction; `R-8`'s frozen set does not include the monitor) — **with byte-equal inputs and an EXPLICIT
divergent revision, and the reading must NOT be `CLEAN`** — **the verdict's load-bearing property, driven directly
instead of asserted about a one-line `===`.**

### 12.11 `A-11` — THE `provenance` WORDING IS OWED, AND THE `digestCommand`'s CLAIM IS SETTLED TRUE

**Disposition: premise SETTLED (the supervisor's measurement); the WORDING OWED (`E-11`); non-blocking; outside this
unit's change set.** **Clauses amended:** `§1.1`'s annotated block, `§8 D-1` (the audit's refinement appended), `§9 E-8`
(annotated SETTLED), `§9 E-11` (new). **THE SETTLING MEASUREMENT, quoted with its measurer named — THE SUPERVISOR:
`git -C ../Provident-Electron diff --name-only 8f193a8d1446ed1e64c4ab6c569941e988f82459
d7b98b574adc7fa63fbabda617eba2a753f52cb5 -- src/shared` is EMPTY, and per module
`git rev-parse <rev>:src/shared/<name>.ts` yields IDENTICAL blob object-ids at BOTH revisions for all FIFTEEN (equal
object-ids ⇒ equal bytes).** **CONSEQUENCES, both recorded:** **(i) the refreshed `digestCommand`'s claim is TRUE — the
command re-run at the refreshed revision yields the same digests** (**the audit ran nothing — its `A-11` was a
consistency question, not a measurement**); **(ii) the fifteen `provenance` cells still read *"recomputed by the
PD-VENDOR landing pass"* while naming a commit that PREDATES it — the wording is OWED and should read
`8f193a8d`-recomputed + BYTE-PRESERVED.** **OUT OF THIS UNIT'S CHANGE SET** (`§1.2` items 3/4) — **filed, not
touched.** **And the audit's refinement to `D-1`, accepted by the implementer: the relation's CONTENT moves from *"the
blob at the commit I was measured at"* to *"the blob at a LATER commit"*, even though the relation's TEXT does not
move** — the settling measurement is what makes the moved relation true rather than merely unfalsified.

### 12.12 `A-12` — THE DATE'S DAY IS THE LOCAL/REPO DAY, AND THE LANDED LITERAL LEGITIMATELY DID NOT MOVE

**Disposition: RULED; non-blocking.** **Clauses amended:** `§1.1` item 3's amended cell, `§2` item 3, `§9 E-7`
(annotated SETTLED), `§4.1` (row 2's `measuredAt` limb). **THE RULING, exactly: the reading's LOCAL/repo day is
AUTHORITATIVE.** **The readings it settles:** the refresh's run read **`2026-09-29` in UTC** while its **local/repo day
was `2026-09-28`** (measurer: the implementer); **the landed literal is `2026-09-28` and per this ruling DID NOT MOVE,
which is a legitimate outcome and not a missed edit** — **the as-filed `§1.1` item 3 already said so in advance**
(*"If the refresh lands on 2026-09-28 the literal is unchanged"*). **Consequences:** the register's `measuredAt` limb
asserts the declared local/repo-day reading, so a UTC-shifted or invented date is a RED (`F-13`); and **no future pass
may "correct" a local-day literal to a UTC day.**

### 12.13 THE AUDIT'S `P-TP-pd-pin-3` VERDICT, AND THE ZERO-COVERAGE RE-DRIVES

**RECORDED (measurer: the gate-4 adversarial pass; the readers re-read this pass, `VERIFIED-BY-READ`).**
**(a) `P-TP-pd-pin-3` IS THE ONLY READER that compares `git show <recorded commit>:src/shared/<name>.ts` against BOTH
the vendored bytes AND the manifest's md5.** **It is therefore the row that catches the strongest FALSE-GREEN against
this unit: a foundation worktree checked out at the refreshed commit whose working-tree bytes were edited AFTER
checkout, with the vendored copies and the manifest's md5 brought into agreement with the edit — `drift` reads `CLEAN`,
because NEITHER of its comparisons reads the BLOB.** **THEREFORE: this row MUST NEVER BE RELAXED, and its controls must
be brought UP to its importance** (`§4.1`; `A-6`). **A future pass that weakens it — to a working-tree comparison, to a
manifest-only comparison, or to a "closest available" form — performs `F-3`'s class and is a review finding.**
**(b) THE REGISTER'S TWO LCG RE-DRIVES BUY ZERO COVERAGE.** **Their pools are `fifteen` and `[...fifteen].reverse()` —
two PERMUTATIONS OF THE SAME FIFTEEN** (re-read this pass), so a draw can never produce a drive the sweep did not
already take: **the same module is re-driven with the same comparison.** **OWED TO THE TESTWRITER: REDRAW them over a
PERTURBATION DOMAIN** — each draw selects a module **and** a LCG-drawn mutation position/byte, so the drive is a new
input rather than a permutation of the old one (`§4.1` row 3 ④).

### 12.14 THE TESTWRITER'S REMANDS — `R1`, `R2`, `R3`, EACH DISPOSED WITH ITS CLAUSE

**Raised by: the TestWriter's red-set pass (`RECORDED READING`). Disposition of each, with the clause amended:**
**`R1` — *"`§4` row 2's control prose says **'all four'** while the site set is three constants + two manifest limbs"*.
DISPOSED: the remand is CORRECT and the contract is amended.** **Clause amended:** `§4.1` row 2's property/control prose
(**the sites are now NAMED**: the three `PINNED_COMMIT` constants · `foundation.digestCommand`'s embedded revision ·
with `foundation.measuredAt` read by its own limb, never inside the 40-hex agreement). **The as-filed *"all four"* stays
visible in the table above, marked as misstating the set.** **`R2` — *"no fail-state forbids a **second**
`PINNED_COMMIT` declaration — add it, and note the TestWriter already asserts one-declaration-per-file OUTSIDE the
domain"*. DISPOSED: ADDED, and folded INTO the domain.** **Clauses amended:** `§3` item 4 (new **`F-12`**), `§1.1` item
4's amended cell, `§4.1` row 2 (**the three declaration-count terms are now DECLARED, so the assertion the TestWriter
already made is inside the term rather than beside it** — `A-5`). **`R3` — *"the `tests/pd-vendor-manifest.test.ts`
title"*. DISPOSED AT `A-3`** (§12.3): **the title is refreshed, the superseded literal is kept as an annotated
historical citation, and the register's freeze of that prose is removed.** **`R3` is cross-referenced here so it is not
re-raised as a separate item: it is the SAME subject as `A-3`, seen from the TestWriter's side.** **No fourth remand is
recorded, and no remand is left undisposed.**

### 12.15 THE IMPLEMENTER'S TWO STATED JUDGEMENT CALLS — BOTH RULED AND RECORDED

**Judgement call (i) — `measuredAt`'s date: RULED at `A-12` (§12.12): the LOCAL/repo day is authoritative; the landed
literal `2026-09-28` LEGITIMATELY DID NOT MOVE; the run's UTC day was `2026-09-29` (measurer: the implementer).**
**Judgement call (ii) — that the change set is EXACTLY FIVE MOVED VALUE LINES IN FOUR FILES, with `byteIdentity`, the
per-module md5s and every `lineCount` UNTOUCHED: CONFIRMED CORRECT, and `D-1` is confirmed with the audit's
refinement.** **The count reconciles exactly: `commit` · `digestCommand` · the three `PINNED_COMMIT` constants = FIVE
moved value lines in FOUR files** — **`measuredAt` is NOT among them, correctly, because its local/repo day did not
change (`A-12`)** — **and the audit's reading added nothing to the value set: `A-3`'s title refresh is a PROSE-ONLY
sub-change in a file ALREADY in the set, so the "four files" bound holds and no fifth file joins** (`§1.2` item 6's
annotated precision). **THE REFINEMENT, recorded at `§8 D-1`: the relation's CONTENT moves from *"the blob at the
commit I was measured at"* to *"the blob at a LATER commit"* while its text does not — and the supervisor's measurement
(§12.11) is what makes the moved relation TRUE.**

### 12.16 THE REGISTER TERMS: OLD → NEW, BOTH VISIBLE, WITH THE PER-TERM REASON

**`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS` is obeyed by BOTH readings: the as-filed arithmetic stays printed in
`§4`'s table and tally line (`4` + `6` + `20` = `30`), and the CURRENT arithmetic is printed here and at `§4.1`.** **No
term is renamed, no row is added, no row is removed: the ROW SET stays exactly three.**

| Row | AS FILED (kept visible) | CURRENT (after this amendment) | What moved, and why |
| --- | --- | --- | --- |
| **`P-IM-pd-pin-1`** | **`4` = `1` real pair × `2` limbs + `2` controls** | **`7` = `1` real pair × `2` limbs + `1` comparator pin-arm drive + `4` controls** | `A-10`: the comparator drive (`0 → 1`) and the LCG-drawn mutation position; `A-7`: the two register-side monitor negatives (`2 → 4` controls). **`(bounded)` ON THE PRESENCE CONDITION — unchanged.** |
| **`P-SM-pd-pin-2`** | **`6` = `3` + `1` + `2`** | **`16` = `3` + `3` + `1` + `1` + `2` + `6`** | `A-5`: `3` per-file declaration-count terms + `2` LCG-drawn joint mutations over the synthetic sites (all folded INTO the domain, where the landed checks sat outside it); `A-4`: `1` `measuredAt` limb; `A-5`'s four negatives push the controls `2 → 6`. **`(bounded)`: NO.** |
| **`P-TP-pd-pin-3`** | **`20` = `15` × `1` + `3` + `2`** | **`21` = `15` × `1` + `4` + `2`** | `A-6`: the present-but-differing-blob-md5 control (`3 → 4`), with the three as-filed controls re-driven through the BYTES-taking oracle; `A-10`/§12.13: the `2` re-drives stay `2` but move to a PERTURBATION domain. **`(bounded)`: NO.** |
| **TOTAL** | **`4` + `6` + `20` = `30`** | **`7` + `16` + `21` = `44`** | Every row **≤100** ✔ (`7` · `16` · `21`); the total **≤400** ✔; **stop-after-5** ✔. **The as-filed `30` is SUPERSEDED, not deleted.** |

**The landed register's own tables declare the as-filed `30`; they are STALE AGAINST THIS AMENDMENT and are owed the
re-derivation to the CURRENT column** (§12.17 item 1) — **and the re-derivation is a TestWriter act on a `docs/specs/**`
contract change, never an implementer's inline edit** (`RCA-1`'s delegation discipline; `§6`).

### 12.17 THE OWED ITEMS THIS AMENDMENT CREATES, EACH WITH ITS OWNER

1. **THE REGISTER'S RE-DERIVATION UNDER `§4.1`'s CURRENT TERMS — OWNER: THE TESTWRITER.** **One act, seven parts:**
   (a) row 1's **comparator pin-arm drive** + the **LCG-drawn** mutation position + the **two monitor negatives**
   (non-git tree through the CLI; unreadable/broken `.git`); (b) row 2's **three declaration-count terms**, its
   **EXACTLY-ONE-distinct-40-hex-literal** command limb, its **`measuredAt`** limb, its **two joint LCG mutations** and
   its **six controls** (two as filed + `A-5`'s four negatives); (c) row 3's **bytes-taking oracle** + its **four
   drives** (perturbed bytes · absent blob naming the path · symlinked fixture through the oracle's own limb ·
   present-but-differing blob md5) + its **two perturbation-domain re-drives**; (d) the **spec-reading limbs anchored to
   `§4`'s table region and the arithmetic**; (e) the **prose freeze REPLACED by the synthetic title text**; (f) the
   **terms/tally reprinted** as `7 + 16 + 21 = 44` with the as-filed `30` reachable only through the named superseded
   block; (g) **`F-12`/`F-13` driven.** **RED FIRST per `RCA-1`: the re-derivation is authored and RUN as a red set
   against the CURRENT contract before anything else moves, and its reading is recorded.**
2. **THE `tests/pd-vendor-manifest.test.ts` TITLE REFRESH — OWNER: THE TESTWRITER** (§12.3, `D-12`): the title names the
   refreshed revision **with the superseded literal kept as an explicitly-annotated historical citation**; **no
   assertion moves; `tests/pd-vendor-set.test.ts`'s row is untouched.**
3. **THE `docs/decisions.md` ROW — OWNER: THE SUPERVISOR'S TRACKER PASS** (§12.2, `§8 D-8`, `E-6`): title and the four
   things printed; **`D-8` may not be reported discharged before it exists.**
4. **THE NAMED GATE `PD-VENDOR-DRIFT-REVISION-STATUS` — OWNERS: THE SUPERVISOR'S TRACKER PASS (to open) + THE MONITOR'S
   OWNING UNIT (to land)** (`§9 E-9`): the byte-only-`CLEAN` seam, with the fix shape and its test-side consequence; **this
   unit may not touch `scripts/**`.**
5. **`E-10` (`baselines` date-stamping + commit scoping) and `E-11` (`provenance` wording) — OWNERS: THE SUPERVISOR'S
   MANIFEST/TRACKER PASSES + THE PIN'S OWNING UNIT AT ITS NEXT PASS** (`§9`).
6. **THE DOCUMENTATION REVIEW — OWNER: THE DOCUMENTATION REVIEWER** (`RCA-6` / `AGENTS.md` item 10d): reconcile `§12`,
   `§4.1`, the new `E-9`/`E-10`/`E-11` and the as-filed/current arithmetic pair into the trackers (`docs/next-steps.md`,
   `docs/pending.md`, `docs/decisions.md`, `docs/defects.md`, `docs/HANDOFF.md`) **in the SAME pass**, and repoint the
   `E-1` notes.
7. **THE DONE ROW — OWNER: THE SUPERVISOR'S LANDING PASS** (`§10` items 1–13): **including the three BLOCKING findings'
   statuses** (`A-1` discharged; `A-2`/`A-3` owed), the register's re-derivation reading, the three owed items, and the
   **landed** `npm run drift` reading **with `revisionChecked`'s value**.
8. **THE TIGHTENING OF THE REGISTER'S `A-7` LIMB — OWNER: THE `E-9` GATE'S LANDING PASS + THE TESTWRITER** (§12.7):
   when the named gate chooses a label/exit rule, the register's non-git and broken-`.git` drives move from the honest
   current minimum to the gate's rule. **Not before: this unit must not pre-empt a gate it is forbidden to land.**

### 12.18 THE BOUNDARY — WHAT THIS AMENDMENT DID **NOT** DO, AND WHAT IT COULD NOT ESTABLISH

**It did NOT:** move any code, test, manifest byte, tracker row or other spec (**one file written: this one**) · run
anything (**no shell**) · widen `§1.1`'s change set or narrow `§1.2`'s DENIED list · edit `scripts/**` (the monitor),
`vitest.config.ts`, `package.json`, `tests/pd-vendor-set.test.ts`'s row, or any vendored module byte · relax
`P-TP-pd-pin-3`, `D-3`, `D-5` or the `A-3` pin arm · delete, renumber or rewrite an as-filed clause · park anything
silently (**`A-7`, `A-8` and `A-11` are FILED, NAMED and OWED, each with an owner and a shape**).
**It could NOT establish (each with what would settle it):** **(i) the register's red-run reading** — file, row/term
counts and the failing row's message (**settles it: the red run's log; owed by the DONE row, `§10` item 2**);
**(ii) the landed `npm run drift` reading and its `revisionChecked` value** (**settles it: the implementer's run —
though the pin arm's precondition is `VERIFIED-BY-READ` true, i.e. the manifest names the tree's HEAD**); **(iii) the
landed trio counts and the suite's current green/red** (**settles it: the landing run; owed by `§10` item 5**);
**(iv) the register's CURRENT pass/fail state under `§4.1`'s terms — it cannot be known before the re-derivation lands**
(**settles it: the TestWriter's red run**); **(v) the amendment's own calendar date by clock read** — **the heading's
`2026-09-28` is a CARRIED reading under `A-12`'s rule** (**settles it: one clock read; and if the local day differs, the
heading is corrected in place**); **(vi) whether any further foundation commit has landed since `d7b98b5`** — **a moved
HEAD re-opens this unit's own `E-2` policy** (**settles it: one `rev-parse` in the adjacency**).

### 12.19 ⟨THE ITEM-10d DOCUMENTATION REVIEW — GATES 7 + 8 IN ONE PASS (2026-09-28)⟩

**RECORDED IN THIS SPEC BECAUSE `§12.17` ITEM 6 ORDERS THIS SECTION'S RECONCILIATION, and because the review's
BLOCKING finding is a CONTRACT-vs-REGISTER mismatch that must not live only in the archive.** **The pass is
`AGENTS.md` item 10b (the proofreader audit) AND item 10d (`RCA-6`), run as ONE pass and recorded as one pass.**
**Layer: DOC — `[T]`/`[D]`/DOC only; this unit can never be app-green. The pass ran NO leg** (no `npm test`, no
`drift`, no `conformance`); every figure it reports is its own `VERIFIED-BY-READ` of the tree or a RECORDED READING
labelled with its measurer. **The record is `archive/reviews/2026-09-28-pin-refresh-doc-review.md`; the tracker-side
record is `docs/next-steps.md`'s 2026-09-28 `PD-VENDOR-PIN-REFRESH` doc-review block, and `E-1`'s owed note is landed
in `docs/pending.md`.**

**WHAT IT FOUND, by id, with the owner each finding is owed to:**

1. **`DR-P1` (BLOCKING FOR THE REGISTER — OWNER: THE TESTWRITER).** `P-SM-pd-pin-2` DECLARES `16` attempts and DRIVES
   `15` (`3` constant reads + `3` declaration-count terms + `1` `digestCommand` limb + `1` `measuredAt` limb + `2`
   from the loop's single `attempt(...)` + `6` controls); `finish()` requires `executed === declaredTotal`, so the row
   reports `broken`. **The `12 passed (12)` reading recorded for that file is NOT REPRODUCIBLE FROM ITS OWN SOURCE by
   this pass's count** — `12` is its number of `it()` blocks, not its attempt total — **and this pass, holding no
   shell, does NOT contradict that reading on measured evidence; it reports the count and the predicate.** **What
   settles it: one run of `npx vitest run tests/pd-vendor-pin-refresh-register.test.ts`** (its own REGISTER REPORT line
   prints `declared` vs `executed` per row). **The fix may not reduce the term** (`§12.16`; the register's
   `SUPERSEDED` note) — the honest shapes are one more driven attempt inside the declared domain, or a recorded
   contract amendment. **The full arithmetic is recorded at `§4.1`'s `DR-P1` block.**

   **⟨DISCHARGED BY RUN 2026-09-28 (recorded here by the `PD-UI-6` item-10d documentation review; annotate-beside —
   `DR-P1` above is KEPT as the record of the static reading). `DR-P1` WAS A STATIC MISCOUNT AND THE RUN IS
   AUTHORITATIVE:** `npx vitest run tests/pd-vendor-pin-refresh-register.test.ts` reports **all three rows `held`**,
   **`executed == declared` (`7` / `16` / `21`)**, **`stoppedAt: null`**, **counterexamples `0`** — so the register
   is NOT broken, the recorded `12 passed (12)` reading was accurate, **no declared term is reduced and NO contract
   amendment is owed for `DR-P1`.** **This is the one `§12.19` finding that is now CLOSED rather than owed, and every
   clause of this spec that carried the `DR-P1` caveat (`§4.1`'s block, `§6` item 2 (ii)) carries the same dated
   discharge.**⟩**
2. **`DR-P2` (CITATION — `HOST-FIX`, CORRECTED IN THIS FILE).** `§11`'s amended cross-reference list named readers
   the landed register DOES NOT EXPORT (`constantDeclarationCount`, `moduleIdentityOracle`, `fourSiteAgreementOracle`,
   `syntheticTitleText`, `mutateHex`) and one symbol that appears NOWHERE in it (`manifestPinText`). **`§11` now
   carries the landed names beside the as-filed list, and the `manifestPinText` clause's ABSENCE is recorded there as
   the `A-3` disposition's landed proof.**
3. **`DR-P3` (OWED — OWNER: THE SUPERVISOR'S TRACKER PASS).** The `§8 D-8`/`§12.2` row
   `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY` **does NOT exist in
   `docs/decisions.md`** (VERIFIED-BY-READ this pass, independently of the audit — the refreshed revision literal
   appears in no row). **The DONE row may NOT report `D-8` discharged.** A doc review writes no decision row.
4. **`DR-P4` (OWED — OWNER: THE SUPERVISOR'S TRACKER PASS TO OPEN).** The named gate `E-9`
   (`PD-VENDOR-DRIFT-REVISION-STATUS`) has **ZERO occurrences in the trackers** (VERIFIED-BY-READ) — it lives only in
   this spec and in the register's comments. **E-9 is filed, named, and unopened.**
   **`DR-P5` (OWED — OWNERS: THE SUPERVISOR'S MANIFEST/TRACKER WRITES + THE PIN'S OWNING UNIT).** `E-10`'s live false
   claims in `vendor/foundation.lock.json`'s `baselines` block STAND (the `collectedSuiteCensus.reading` still says
   *"204 collected files before and after the vendoring"* while this head collects `208`; the `npmTest` cell is a
   red-set reading at `7d3b55c`; `divergence` is another repo's leg at another head), and `E-11`'s per-module
   `provenance` wording is unchanged. **The owed shape is a per-cell `measuredAt` stamp + the commit the reading was
   scoped to; this pass may not edit the manifest.**
5. **THE PASS'S CENSUS (its most reusable output): EVERY SURVIVING `8f193a8` HIT IN `docs/**`, `tests/**`, `src/**`
   AND `vendor/**`, CLASSIFIED.** **`vendor/` and `src/**`: NONE — the lock file carries only the refreshed literal,
   and no `src/**` byte names either revision (VERIFIED-BY-READ).** **`tests/**`: the register file's own header
   comment + its superseded `colourAtRedHead` cell + its `supersededAbbreviation` fixture, and
   `tests/pd-vendor-manifest.test.ts`'s REFRESHED title carrying the annotated superseded literal — all legitimately
   HISTORICAL (annotated, dated).** **`docs/**`: legitimately HISTORICAL inside dated annotations and as-filed
   amendment ledgers — this spec (`§0A`, `§1.1`, `§2`, `§4.1`, `§6`, `§9 E-8`/`E-11`, `§12`), `docs/pending.md`'s
   carried-condition quote (now annotated DISCHARGED), `docs/defects.md`'s repro cell (now annotated), the two
   `*-greens.md` artifacts' pass headers, `docs/specs/unit-pd-ui-6-modal-state.md`'s dated `§0C` ledgers,
   `docs/specs/post-division-rebuild-proposal.md`'s measured adoption pin, and
   `docs/specs/post-division-local-elimination-inventory.md`'s filing-pass tree table — **STALE AND FIXED IN THIS
   PASS: `docs/specs/unit-pd-vendor-foundation-mechanisms.md` (its `§3.3` digest-run revision and its `§2.2`
   normative-shape comment, both of which read as CURRENT instructions), `docs/specs/unit-divergence-harness-precondition.md`
   (its *"the revision recorded by the program"* clause), `docs/pending.md`, `docs/defects.md`,
   `docs/specs/unit-pd-ui-6-modal-state.md`'s `9-row`/`4467` readings.** **The one remaining OWED hit is
   `vendor/foundation.lock.json`'s `baselines` block (`DR-P5`) — where the literal is embedded in a false
   present-tense claim and the fix is a manifest edit.**

