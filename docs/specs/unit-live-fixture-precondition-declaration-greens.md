# GATE 5 — BLIND GREEN-SCENARIO ARTIFACT for `U-LIVE-FIXTURE-PRECONDITION-DECLARATION` (UNIT A)

**Authored by:** the Blind-Test Writer (gate 5), from the DOCUMENTATION ONLY.
**Contract:** `docs/specs/unit-live-fixture-precondition-declaration.md` — `1319` lines; its `§16` is the
newest amendment (FOURTH AMENDMENT `2026-10-04`, the landed reconciliation), and **the superseded figures
are kept visible** — so **every expectation below states WHICH SECTION gave it to me**, and where `§16`
supersedes an earlier figure the `§16` reading is the one I froze.
**Also read:** `docs/decisions.md` (the two ruling rows `DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG`
and `DECIDED: LIVE-GATE-RUN-DISCIPLINE`, plus `DECIDED: GAP-8-INTERIM-MOCK-CORPUS-FROM-CALLING-ARGS`),
`docs/next-steps.md` (the fixture-unit anchored inserts), `docs/defects.md`
(`LIVE-FIXTURE-PRECONDITION-GAPS`), `docs/pending.md` (`LIVE-RUN-O0-CORPUS-FIXTURE-NEED`).
**Read for format only (NOT as a source of expectations):** the sibling artifact
`docs/specs/unit-live-driver-verdict-integrity-greens.md` (the same gate's artifact for the previous unit).

**The `§3` expectations were FROZEN before the first run and are NOT edited afterwards.** Readings live in
`§4`; the FAIL ledger is `§5`; the doc-vs-live drift ledger (this gate's whole product) is `§6`; the
structural NOT-RUNs are `§7`.

**⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER (`AGENTS.md` item 10b; `RCA-6`/`RCA-8(c)`) — `§9` IS APPENDED, AND NOTHING ABOVE IT IS REWRITTEN OR DELETED.** **`§3`'s frozen expectations stay exactly as the Blind-Test Writer froze them — INCLUDING the ones the CONTRACT has since moved past; `§9` names, per expectation, the reading of record and the instrument that took it.** **THIS PASS HOLDS NO SHELL AND RAN NOTHING: it audited the DOCS against the TREE — the landed driver `scripts/live-drive.mjs`, the pin `tests/live-drive-contract.test.ts` and the contract — using the file-read tool for a census of its own (`reader: the Proofreader, this pass`), and it quotes every figure it did not measure with its measurer and marks the head as MOVING (a parallel driver pass is editing the driver in this same round).** **IT TOUCHED NO `tests/**`, `scripts/**` OR `src/**` BYTE; its only writes are this appended section and the same-round annotations in the contract.**⟩**

---

## 0. THE EXPECTATIONS I WROTE BEFORE OPENING EITHER IMPLEMENTATION FILE

1. **I did not read `scripts/live-drive.mjs` or `tests/live-drive-contract.test.ts` before `§3` was
   written.** Every `§3` expectation is derived from the contract text and the four trackers only.
2. **THE ONE DISCLOSED EXCEPTION, STATED SO IT IS NOT A HIDDEN ONE (§2 item 6):** AFTER `§3` was frozen I
   ran **two LITERAL-EXTRACTION reads of the DRIVER ONLY** — `sed` over the two *data* regions of
   `scripts/live-drive.mjs` (`UF_CORPUS_DEPENDENT_BLOCKS`; `UF_FIXTURE_STATE` /
   `UF_FIXTURE_STATE_CONSEQUENCE` / `UF_FIXTURE_RECONCILIATION`; `UF_FIXTURE_DECLARATION`) — to obtain the
   **verbatim expected strings** a falsifiable predicate needs. **No expectation's *content* came from
   that read**: every one of the predicates below was already fixed by the contract, and the read supplied
   only the literal spellings the contract itself already quotes. I did **not** read any driver LOGIC (the
   declaration *derivation*, the runner gate, the park-reason composition or the block bodies), and I did
   **not** read the pin before the pin run (the `tests/**` reader was read only under `§4 R-1`/`§4 R-14`,
   AFTER the live runs, to explain a mismatch the run exposed).

---

## 1. LAYER DISCIPLINE (read this before reading any result in `§4`)

**UNIT A is a HARNESS / `[D]` INSTRUMENT unit — the live battery driver's OWN fixture handling**
(contract `§1.1`: the census, the checkable declaration, the park honesty `RCA-11` clause (b), and the
run-wide fixture state). **A GREEN HERE IS HARNESS `[D]` AT ITS CEILING AND IS NEVER APP-GREEN.**

The contract states this four times and each is binding on every line of this artifact:

- **`§7` clause 5**: *"A green on this unit's arms proves the DECLARATION is honest and the PARKS are
  named — nothing about the app"*, and *"`a node-suite green is envelope-green, not app-green; here even
  less: a SOURCE-derivation green"* (`RCA-12`).
- **`§8.1` class (a)** proves the census is derived / the declaration agrees / the runner is gated / the
  fixture state prints at four sites — and **CANNOT prove** that a fixture-absent run actually parks each
  block by name. **Class (b)** proves the park-by-name reading — and **"no reading here is app evidence"**.
- **`§9` item 5 / item 10**: *NO APP-LAYER REPAIR OF ANY KIND*; *NO CLAIM THAT ANY ROW PASSES, OR THAT THE
  APP WORKS*.
- **`§16` item 4 note**: the fixture state is *printed on every run*, so *"no corpus-shaped reading in this
  artifact may be quoted as a live-corpus reading"*.

**Consequences I apply to every result below:**

| What a reading here may be used for | What it may NEVER be used for |
| --- | --- |
| That the driver DECLARES its fixture dependency honestly and DERIVES that declaration from its own source | That any app-layer row passes |
| That a fixture-absent run PARKS by name with a named fixture and its declared row ids | That any `FAIL` printed beside a park is this unit's result |
| That the run-wide fixture state is printed on every exit path from one read | That the app works, is envelope-green, or is `[T]`-green |

**The app layer's own FAILs are OTHER ROWS' business.** This unit touches **no `src/**` byte** (`§1.3`);
an app FAIL printed inside a battery I run is **not** this unit's result, **not** evidence that this unit
failed, and **not** re-counted here (`§1.3`, `§9` item 5, `docs/decisions.md`
`DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause (v)).

**A green in class (a) never means the driver parks correctly on a real run** (`§8.2`, verbatim).

---

## 2. THE HONESTY BLOCK

1. **The expectations were derived before the runs and are not edited to match a reading.** They live in
   `§3`; the readings live in `§4`.
2. **The contract is `PROPOSED`, amended four times; its `sha256` is `OWED`** (`§12` item 4, `§15.3`,
   `§15.5`, `§15.8`, `§16`). I take its line count as the file-read tool's own census (`1319`), matching
   `§15.8`'s fourth-amendment row.
3. **Live runs use ISOLATED ports of my own and their own scratch home** (`docs/decisions.md`
   `DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause (i); the standing sibling holds CDP `:9222` and issues
   `pkill -f "electron \."`, `docs/pending.md`). **I never used port `9222`** and I left no Electron
   process or listener behind (§4 records the check).
4. **A truncated or interrupted run proves nothing and is never reported as a result** (`§8.3`).
5. **The contract's own class-(b) readings are OWED by the landing pass** (`§16.10` item (c)); this
   artifact is a blind re-derivation, and where my reading differs from the contract's recorded reading I
   record BOTH rather than smoothing (`§6`).
6. **Instrument disclosure:** the one non-contract read I took (the two literal-extraction `sed` reads of
   the driver's *data* regions) is disclosed in `§0` item 2 above. Everything else I state as a driver,
   pin or suite fact is a reading I took, quoted at its site.
7. **`npm test` has red rows that are NOT this unit's:** two foundation-pin reds and the carried app-layer
   `P-SM-1` red (named verbatim in §4 `N-1`). They are the program's carried baseline and are not
   dispositioned here.

---

## 3. THE FROZEN SCENARIO SET

**Legend.** `LAYER` uses the contract's own tags: **HARNESS `[D]` / live process** = a real
`node scripts/live-drive.mjs` run; **HARNESS `[D]` / node-static** = a source/derivation read run in node;
**NODE SUITE** = `npm test` / `npx vitest run …` (envelope/host — the contract `§8.4` states the trio proves
**nothing about the driver**). `EXIT` is the predicate's exit-code limb where the contract makes one.

### 3.1 The census/declaration figures and the rule that produces them

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER | EXIT |
| --- | --- | --- | --- | --- | --- |
| **L-1** | `§16.0` item 3 (the reading of record) + `§4.2` `A-3` + `§16.6` | `node scripts/live-drive.mjs --no-seed --display=:0 --port=3961 --cdp-port=9461 --home=<scratch>` | A line matching `[live-drive] FIXTURE DECLARATION (§4.2 A-1/A-3 reconciliation):` must print, carrying **`declared=47`**, **`census-derived=47`**, **`historical=17`**, **`ENTERED (census-minus-historical)=30`**, **`LEFT (historical-minus-census)=[]`**, **`census-minus-declared=0`**. Also: **the AMBIGUITY LIST must be printed on the SAME line** (`§16.0` item 3). Falsified by any figure differing, by `LEFT` being non-empty, or by the line's absence. | HARNESS `[D]` / live process | run exit `0` or `1`; the figures limb is exit-independent |
| **R-1** | `§4.1.0` + `§16.0` item 3 + `§16.6` | the pin's own run (`R-2`) | The pin reads `declared entries === census-derived keys` and **`census-minus-declared === 0`** (`§16.6`: the equality is *met* on the landed literal). The pin must ALSO print both of `A-1`'s figures (`declared entries` vs `census-derived keys`) — `§4.1.0`'s contracted fail-state for a partial declaration. | HARNESS `[D]` / node-static | — |
| **R-14** | `§11.2.5` clause 1 + `§16.8` `P-IM-5` | the pin's own run (`R-2`) | Four `describe` titles carrying the literal `§4 P-IM-4` · `§4 P-IM-5` · `§4 P-SM-4` · `§4 P-TP-3` exist (a title typo is the one census failure that reports nothing), and `DECLARED_CLASS_MINIMUMS` carries the four contracted records: `P-IM-4 {read-procedure-step:4, non-vacuity:1, key-existence:1, helper-closure:1, frozen-census:1, self-satisfaction:1, token-space:1, phantom-complement:1}`, `P-IM-5 {8 classes × 3}`, `P-SM-4 {fixture-state-classification:7, park-naming:8, row-id-carry:9}`, `P-TP-3 {run-wide-state-limb:10}` (`§11.2.5`). **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THIS EXPECTATION IS CONFIRMED AGAINST THE TREE, WITH THE ONE SHAPE DIFFERENCE THIS ARTIFACT'S OWN `§4.8` `R-14` ALREADY RECORDS, AND THE CONTRACT'S OWN CLAUSE FOR IT IS STALE: `VERIFIED-BY-READ` (`reader: the Proofreader, this pass`) at the pin — all four `describe` titles carrying the literal `§4 P-IM-4` · `§4 P-IM-5` · `§4 P-SM-4` · `§4 P-TP-3` EXIST, the four records exist and their values match `§11.2.5` (`P-IM-4` `11`/`0` · `P-IM-5` `24`/`0` · `P-SM-4` `24`/`0` · `P-TP-3` `20`/`10`), and they live in the SEPARATE record `UF_FIXTURE_DECLARED_CLASS_MINIMUMS` rather than in the landed `DECLARED_CLASS_MINIMUMS` that `§11.2.5` clause 2 asks the TestWriter to extend. **THE `?? {}` HAZARD THE CONTRACT NAMES DOES NOT BITE, because the fixture register's own arm reads the record that holds them — so the obligation is MET and the difference is SHAPE ONLY.** The contract's `§11.2.5` clause 2 carries the in-place marker for this at `§20.6` item 2.⟩** | HARNESS `[D]` / node-static | — |
| **R-2** | `§16.0` item 2 + `§16.6` | `npx vitest run tests/live-drive-contract.test.ts` | **The contract's stated readings of record:** `3 failed \| 106 passed (109)` (`§16.0` item 2, `§16.6`'s pin-tally row), with the three reds being `A-3.i` (its non-vacuity limb demanding a NON-EMPTY `LEFT`), `A-3.ii` and `P-IM-5`'s `historical-reconciliation:mutation` (both encoding the retired `RE-ADD boot_landing` premise). **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER, BESIDE THE FROZEN EXPECTATION AND NOT REWRITING IT: the contract's `3 failed \| 106 passed (109)` belongs to the `9512`-line pin and is SUPERSEDED at the measured head — the reading of record is **`113 passed (113)`** at the pin `11182` lines / `md5 519dd757a7e59ec1f95b856c90c82617`, with the four fixture-register rows `held=true, broken=0` and the whole suite `3 failed \| 4601 passed \| 57 skipped (4661)` whose three reds are the CARRIED baseline (`P-SM-1` and the two foundation-pin reds) — **`RECORDED READING; measurer: the supervisor`**. THIS ARTIFACT'S OWN `§4.8` `R-2` AND `§G6.5` LEG (e) ALREADY READ THE SAME `113 passed (113)` LIVE, so the drift this expectation records is REAL and its `FAIL vs the contract` status is the contract's staleness, not the pin's. THE PIN'S `109 passed (109)` @ `10809`/`a6634a47…` (`§G6.0`) IS A THIRD, INTERMEDIATE HEAD AND IS KEPT AS ITS OWN READING.⟩** **I record whatever the run prints and treat a difference as a drift finding, never as a pass** (`§16.0` item 2: the three are *"UNSATISFIABLE AS FILED"* and their fix is `§12` item 12, the TestWriter's). | HARNESS `[D]` / node-static + NODE SUITE | `1` if any arm fails, `0` if no arm fails — recorded, not prescribed |

### 3.2 The gated figure and the `corpusRead:false` / `selfProvisioning:true` split

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER |
| --- | --- | --- | --- | --- |
| **R-6** | `§16.3` + `§16.4` + `§16.6` + `§16.7` | the source-derivation eval of the declaration literal (`node -e`, `scripts/live-drive.mjs` only) | **`entries === 47`**, **`corpusRead:false === 3`** (the set NAMED: `user6_search_no_flicker` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip`), **`selfProvisioning:true === 10`** (the set NAMED: `boot_landing` · `import1` · `ms_store` · the seven `u_edit_1_live_*` self-provisioners), **GATED (`corpusRead:true && selfProvisioning:false`) `=== 34 = 47 − 3 − 10`**, **never-gated `=== 13 = 3 + 10`**, and **the `13` are the exact union of the two NAMED sets**. Also: the hand-list literal's `17` keys (the `§0.3` `V-1` amendment set), **all `17` with `corpusRead:true` in the declaration and `0` hand-list keys without an entry** (`§16.1` `H \ C = ∅`, `§16.4`'s `16 gated + 1 not` split). | HARNESS `[D]` / node-static |
| **R-7** | `§4.1` member table + `§4.3` `D-3`/`D-6`/`D-7` + `§3` clause 2 | same as `R-6` | **47 unique `block`s**; every entry's `corpusRead`/`selfProvisioning` a **boolean**; `fixtureName` and `surface` **non-empty strings**; `rows` an **array**; **the `fixtureName` value set ⊆ the closed set of `§4.1`** `{corpus-documents, corpus-query-results, corpus-document-tabs, self-provisioned-document, none}`; and **NO `fixtureName`/`surface` names an obsolete supply mechanism** (`--seed` / `--strict-seed` / `--o0-corpus` / `seedCorpus` / `o0MarkdownTree` — `§3` clause 2, `D-3`, `§4.3`). | HARNESS `[D]` / node-static |
| **R-8** | `§16.7` (`21 ROW + 13 DIAG`) + `§4.3` `D-4` | same as `R-6` | **`rows: []` appears on `16` of the `47` entries** (`§16.7`: a `VERIFIED-BY-READ` count of the literal), of which **`13` are GATED** and **`3` are never-gated** (`stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`). **The `21`/`13` route split follows** (`34 − 13 = 21` park on `ROW` lines). **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER, BESIDE THE FROZEN EXPECTATION AND NOT REWRITING IT: this expectation's own two halves come from DIFFERENT amendments and the contract has since moved both. **WHAT STANDS: the ROUTE SPLIT `21`/`13` IS THE READING OF RECORD** — `34 − 13 = 21` park on their `ROW` line(s) and `13` on the `DIAG` line — confirmed by this artifact's own `§G6.6` `R-8` line (`21 ROW + 13 DIAG`). **WHAT IS STALE: the `16`-on-`47` and its `13`-gated/`3`-never-gated decomposition.** Measured with the file-read tool over the landed `UF_FIXTURE_DECLARATION` literal (`reader: the Proofreader, this pass`): `rows: []` appears on **`15`** of the `47` entries = **`13` GATED + `2` NEVER-GATED** (`import1` · `ms_store`) at the head this pass closed at (`scripts/live-drive.mjs` = `9109` lines), and was **`19`** (`13` + `6`) at the intermediate head (`9088` lines) it first read — the four extra (`uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`) were POPULATED by a sibling pass mid-pass and their movement is why that first count was higher. **THE `3` WAS THE `corpusRead:false` FLAG COUNT READ AS A `rows` COUNT (the flag split is `10` `selfProvisioning:true` + `3` `corpusRead:false` = the `13` never-gated keys).** The `§4.3` `D-4` `6` stays a `REPORTED` LOWER BOUND and must not be cited as the count, as this row says.⟩** | HARNESS `[D]` / node-static |

### 3.3 The AMBIGUITY LIST

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER |
| --- | --- | --- | --- | --- |
| **L-2** | `§16.5` + `§16.6` (its ambiguity row) + `§4.2` `A-1` obligation (ii) | the `L-1` run | The printed AMBIGUITY LIST is **NON-EMPTY** and its two members are **exactly** `stage_boot_landing_diag` and `stage_multimount_reachability`, each with the clause `2.1.1-D + 2.1.4` and the disposition **`EXCLUDED and RECORDED`** (`§16.5`). Falsified if the list is absent, empty, has a third member, or either key is admitted instead of recorded. | HARNESS `[D]` / live process |
| **R-3** | `§16.5` + `§16.6` ("the printed AMBIGUITY LIST — `2` keys") | the source-derivation eval of `UF_FIXTURE_RECONCILIATION` | The literal's `ambiguity` array holds **exactly `2`** records, the two keys named, each carrying `site` (naming the opaque edit-surface read), `clause` `2.1.1-D + 2.1.4` and `disposition` `EXCLUDED and RECORDED`. **Neither key may appear in the derived census set** (`§16.5`: *"NEITHER KEY IS A CENSUS MEMBER"*). | HARNESS `[D]` / node-static |
| **R-13** | `§16.9` item 7 + `§12` item 12(c) | the pin's own run (`R-2`) | **The contract records that NO ambiguity-list reader/assertion exists in the pin, although the driver prints the list** — an OWED arm, owner the TestWriter. Expected: **no pin arm asserts the ambiguity list** (so `R-13` PASSES iff the pin lacks such a reader, and PASSES-as-SATISFIED iff it has gained one — I state which I find). | HARNESS `[D]` / node-static |

### 3.4 The fixture STATE line at each of its four sites

**The value is pinned three ways (`§6.1`, `§16.0` item 4):** `state = 'no fixture data set selected'`,
`kind = 'none'`, `id = 'none'`; the line states the **CONSEQUENCE** clause (`§6.1`'s consequence row,
`X-5`); and **the four sites are ONE read** (`§6.1`'s source row, `A-8`, `X-2`; `§16.9` item 3 records that
the `LAUNCH PROFILE` line's *other* fixture words still measure the historical `17` — recorded, not fixed).

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER |
| --- | --- | --- | --- | --- |
| **L-3a** | `§6.1` (member + source) + `§16.0` item 4 | the `L-1` run | A `[live-drive] FIXTURE STATE:` line prints, carrying `fixtureState="no fixture data set selected"`, `fixtureKind=none`, `fixtureId=none`, **AND** the consequence text (`§16.0` item 4's verbatim reading) — and the `LAUNCH PROFILE` line's JSON carries the same state. | HARNESS `[D]` / live process |
| **L-3b** | `§6.1` print site (2) + `X-2` | the `L-1` run | The summary line `[live-drive] §6.1 summary: …` prints the **SAME** fixture state as `L-3a` (**one read, one value**; `X-2`). Falsified if the two disagree or the summary's state is absent. | HARNESS `[D]` / live process |
| **L-3c** | `§6.1` print site (3) + `X-1`'s early-abort clause | `node scripts/live-drive.mjs --groups= --display=:0 --port=3963 --cdp-port=9463 --home=<scratch>` | The `ARG-REFUSED` path prints the fixture state on **its own line**, and the run **exits `2`** (`§6.1` site 3: the `--groups=` empty-value refusal returns at `process.exitCode = 2` **before the launch profile exists**). | HARNESS `[D]` / live process | **`2`** |
| **L-3d** | `§6.1` print site (4) + `X-1`'s early-abort clause | a run forced onto the module-level `main().catch` ERROR path (I use a **non-numeric `--port=`**, so the app cannot be reached at that port) | The `[live-drive] ERROR: …` line prints the fixture state **in the same line as the error** and the run **exits `2`** (`§6.1` site 4, `§16.10` item (c) names the early-abort sites as landing-pass readings — **this is exactly the reading this scenario takes**). | HARNESS `[D]` / live process | **`2`** |
| **R-9** | `§6.1` source row + `A-8` limbs 1–4, 7, 8 + `§11.2.6` | the pin's own run (`R-2`) | The pin asserts: the module-level `UF_FIXTURE_STATE` **exists and is declared exactly once**; its members are `state`/`kind`/`id`, contracted types and values; the `launchProfile` literal carries `fixture: UF_FIXTURE_STATE`; the `summary` literal carries `fixture: UF_FIXTURE_STATE`; **no site recomputes the value** (exactly one occurrence of the object literal in module scope); **not inside the `o0Blocks.length` branch** (`X-3`); the consequence clause is stated (`X-5`); the `none`-form value is the ruling's literal. I read the pin's own `A-8` report to see which limbs executed. | HARNESS `[D]` / node-static |

### 3.5 The fixture-absENT run: parks by name, `parkReason`, row-id carry, never an app FAIL

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER |
| --- | --- | --- | --- | --- |
| **L-4** | `§8.3` item 1 + `§16.3` + `§16.7` + `§5.1` clause 4 | the `L-1` run (`--no-seed`, `--block=all`) | **Every GATED declared block — `corpusRead:true && selfProvisioning:false` — reports `PARKED` / `PRECONDITION-FAILED`, and NOT ONE reports `FAIL`.** The population is **`34`**, split **`21` on their `ROW` line(s) with `park === true` + `13` on their `DIAG` line** carrying the `PRECONDITION-FAILED:` marker. **A `35`th park, or a park of any of the never-gated `13`, is a FALSE PARK and FAILS the reading** (`§8.3` item 1, verbatim). Falsified by any gated key printing `FAIL`, by a park count ≠ `34`, or by a park of a never-gated key. **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THE ACCEPTANCE READING THIS EXPECTATION FROZE WAS AMENDED BY THE CONTRACT IN THIS SAME ROUND (`§18.2`), AND THE AMENDED FORM IS WHAT THE LANDED DRIVER IS GRADED AGAINST: the contract's reading of record is now the DERIVED OBSERVED SPLIT — `parked = P/34` with `34 − P` for the rest, every PARKED key GATED, a `parkReason` naming EACH PARKED KEY'S OWN declared fixture, and NO `FAIL` — and **the universal `34`-of-`34` park limb is SUPERSEDED as unsatisfiable on a `--block=all` run** (`boot_landing`'s self-provisioned document makes the corpus present from block `7` on). The FROZEN predicate above stands as the Blind-Test Writer's record and as what the gate-5 run correctly reported FAIL; what changed is the CONTRACT, not the reading (`§18.2` clauses 1–3; `§G6.6` `L-4`).⟩** | HARNESS `[D]` / live process |
| **L-5** | `§5.1` clause 3 + `§5.3` + `§5.5` `F-1` | the `L-1` run | **Every `ROW` line with `verdict=PARKED` carries a `parkReason=` that NAMES THE FIXTURE** — at minimum the declaration's `fixtureName` (`corpus-documents` / `corpus-query-results` / `corpus-document-tabs`) **and** the `surface` text **and** the block key **and** the failed read with its observed value (`rag.list_documents -> <n> document(s)`). **The generic *"the seeded corpus is ABSENT"*-class text is NOT sufficient** (`§5.1` clause 3, `F-1`). Falsified by any parked row whose reason names no fixture, or by the inherited sentinel `(no parkReason recorded)` appearing on a parked row (`§5.1` clause 3(v)). | HARNESS `[D]` / live process |
| **L-6** | `§5.1` clause 2 + `§5.3` + `F-4` + `§16.7` | the `L-1` run | **A parked block that owns NO declared row id prints a `DIAG` line, NOT a `ROW` line.** The `13` gated keys named in `§16.7` are the population; their `DIAG` detail contains `PRECONDITION-FAILED:`, and **their result carries NO `park` key at all** (`§5.3`: `'park' in res === false`) — so **no `ROW` line with `row=null` and no fabricated row id may appear for them**. Falsified by a `DIAG`-route block printing a `ROW … verdict=PARKED` line, or by a `DIAG` line lacking the marker. | HARNESS `[D]` / live process |
| **L-10** | `§5.1` clause 1 + `§5.2`'s acceptance reading + `§16.4` | the `L-1` run | **Every `selfProvisioning:true` entry (the `10`) and every `corpusRead:false` entry (the `3`) CARRIES ITS OWN VERDICT FROM ITS OWN BODY and is NOT parked** (`§5.2`: *"it is NOT parked"*; `§16.4`: a park of any of them is a FALSE PARK). Falsified by any of the `13` appearing as `PARK`/`PARKED`. | HARNESS `[D]` / live process |
| **L-11** | `§16.2` (all three sentences) | the `L-1` run | **`boot_landing` is IN the census, is `corpusRead:true` + `selfProvisioning:true`, and on a `--no-seed` run PROVISIONS ITS OWN DOCUMENT and reports its OWN outcome: it NEVER appears as `PARKED` and never as a park of any kind.** Falsified by any park line naming `boot_landing`. | HARNESS `[D]` / live process |
| **L-7** | `§8.3` item 2 + `§5.5` `F-2` + `§5.1` clause 5 | the `L-1` run | **A fixture-absent run must not silently read a declared corpus-dependent block as `rows=0`.** Every gated key's absence is RECORDED (a `ROW` park or a `DIAG` marker, `L-4`/`L-6`) — so **no gated key may be missing from both the `ROW` and the `DIAG` streams**, and the declared `F-2` class (`a declared block executing its setup read against an absent fixture and reporting rows=0`/`missing`) must not appear for a gated key. Undeclared/never-gated keys reporting an honest driver-side shape is the `L-10` case and is EXPECTED (`§8.3` item 2). **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THIS EXPECTATION FROZE THE PRE-AMENDMENT FORM OF `§8.3` ITEMS 1–2 (`§8.3` item 2's re-classification of the `F-2` class has since been narrowed by `§18.2`'s adoption of the DERIVED OBSERVED SPLIT and by `§18.6`'s engine-family scope): the reading of record now permits a gated key to RUN and carry its own verdict when its own declared fixture probe reads PRESENT, and it keeps the teeth that matter here — **no gated key may be MISSING FROM BOTH the `ROW` AND the `DIAG` streams, and the `F-2` class (a declared block executing its setup read against an ABSENT fixture) remains forbidden and remains UNIT B's owed probe work (`§19.3` `F-2`).** The FROZEN predicate stands as the writer's record and as what the run correctly reported FAIL.⟩** | HARNESS `[D]` / live process |
| **L-9** | `§5.1` clause 4 + `§5.5` `F-3` + `§4.2` `A-7` | the `L-1` run | **No park is counted as an app FAIL**: the run's own arithmetic must show the parked population in its `parked`/`park` counters and **NOT** in `fail`; and no parked gated key appears in the `FAIL` list. Falsified if a parked key's row is counted as `fail`, or if `PARKED`/`PRECONDITION-FAILED` is promoted to `FAIL`. | HARNESS `[D]` / live process |
| **L-8** | `§5.1` clause 3 + `§5.3` + `§16.7` | the `L-1` run | At least one parked `ROW` line exists whose `parkReason` carries BOTH the fixture name and the declaration's `surface` text (`§5.3` (a): *"a `ROW … verdict=PARKED … parkReason=` line means the block carried a declared row id"*), and at least one `DIAG … PRECONDITION-FAILED:` line exists for a no-id gated key — **the two forms are distinguishable from the artifact alone** (`§5.1` clause 3(vi)(a)). | HARNESS `[D]` / live process |

### 3.6 `--block=` scope, the historic hand-list wording, and the untouched artefacts

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER |
| --- | --- | --- | --- | --- |
| **L-12** | `§8.3` item 4 + `§4.2` `A-9` + `§1.3` | a second run: `node scripts/live-drive.mjs --no-seed --display=:0 --port=3962 --cdp-port=9462 --home=<scratch> --block=tabs` | A scoped run's verdict for the same block **AGREES** with the full battery's (`tabs` is GATED, so both must be `PARKED` with the same reason shape) — **no `--block=`-space-only claim** — and the scoped run's own artifact still carries the fixture-state line (`§6.1`: it may not be omitted on a scoped run). | HARNESS `[D]` / live process |
| **L-13** | `§16.9` item 3 | the `L-1` run | **RECORDED, NOT FIXED:** the `LAUNCH PROFILE` consequence text still prints *"the `17` corpus-dependent blocks"* (the historical hand-list size) while the gate's population is `34`. **Expected: the words measure `17`.** A reading of `34` here is a DRIFT against `§16.9` item 3 and must be reported, not smoothed. **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THIS EXPECTATION IS SUPERSEDED BY THE LANDING IT ANTICIPATED, AND THIS ARTIFACT'S OWN `§G6.6` `L-13` LINE ALREADY RECORDS THE LANDED READING (`FAIL as filed — the words now measure `34``, labelled *"the relabelling `§16.9` item 3 owed; the filed expectation is superseded, NOT a regression"*).** `VERIFIED-BY-READ` at `main`'s `LAUNCH PROFILE` print (`reader: the Proofreader, this pass`): the clause now reads *"re-classifies the ${UF_GATED_DECLARED_KEYS.length} GATED declared corpus-dependent blocks — the DECLARATION's population, §16.3; the HISTORICAL hand-list `UF_CORPUS_DEPENDENT_BLOCKS` is ${UF_CORPUS_DEPENDENT_BLOCKS.length} keys and is a DIFFERENT, historical figure, never the gate's population"* — `34` for the gate, `17` named as the HISTORICAL figure, which is exactly what `§16.9` item 3 / `§17.5` item 3 owed. **THE FROZEN EXPECTATION STANDS AS THE WRITER'S RECORD AND IS NOT REWRITTEN; the contract carries this landing annotated in place at `§16.3`'s `17`-figure bullet (`reader: the Proofreader, this pass`).⟩** | HARNESS `[D]` / live process |
| **R-4** | `§1.3` (denials) + `§8.2` `A-3` | the source-derivation eval | **The historical hand-list `UF_CORPUS_DEPENDENT_BLOCKS` carries `17` keys** (`§16.6`), **and `uf_panes_1` is IN NO SET — neither the literal nor the census** (`§16.1`, `§16.6`'s dedicated row). Falsified by a `17`-key literal that omits `v1_adjacency`/`v2_scoped`, by `18` keys, or by `uf_panes_1` appearing in either set. **`MATRIX_ROWS` is FULL AT `8` and the `BLOCKS` key census is frozen (`§1.3`)** — no new key, no id added/removed/renumbered. | HARNESS `[D]` / node-static |
| **R-10** | `§11.2.1` + `§11.2.2` + `§15.8` | the pin's own run (`R-2`) | **The SEPARATE fixture register: `4` rows · `11 + 24 + 24 + 20 = 79` attempts · seed `0x20261002`.** The four `declared` strings parse and satisfy the pin's identity: `P-IM-4` `11`/`0`, `P-IM-5` `24`/`0`, `P-SM-4` `24`/`0`, `P-TP-3` `20`/`10` class-(b). **AND the LANDED register is UNTOUCHED: `REGISTER_SEED = 0x20260929`, `7` rows, summing to `101`** (`§11.2.1`, `§16.8`: *"no term, no label and no total moves"*). Falsified by either figure moving, or by the landed register's seed/rows/`101` changing. | HARNESS `[D]` / node-static |

### 3.7 The node suite (the trio's `npm test` leg) — what it can and cannot prove

| # | Clause | Invocation | EXPECTED (falsifiable predicate) | LAYER | EXIT |
| --- | --- | --- | --- | --- | --- |
| **N-1** | `§8.4` (the trio row) + `§7` clause 5 | `npm test` | **No NEW red.** The run's failing set is exactly the carried baseline I can name from the trackers: the two foundation-pin reds (`pd-vendor-pin-refresh-register` `P-IM-pd-pin-1` · `pd-vendor-set` `§3.3` item 2) and the app-layer `P-SM-1` (`unit-stage-active-tab-display-pbt-generators`). **`scripts/live-drive.mjs` is in NO trio** — a green trio proves NOTHING about the driver (`§8.4`, verbatim). | NODE SUITE | non-zero if any test fails; recorded |
| **N-2** | `§1.3` + `§9` item 9 | `git status --porcelain` (read-only) | **This gate writes ONLY its own artifact:** no `scripts/**`, `tests/**`, `src/**` or tracker byte is modified by me. Falsified by any modified path outside this artifact. | DOC/GATE HYGIENE | — |

---

## 4. THE READINGS

### 4.0 THE HEAD MOVED TWICE UNDER THIS GATE — THE SINGLE MOST IMPORTANT FACT IN THIS SECTION

**All `md5`/`wc` figures below are MY shell measurements, taken at the instants stated.**

| Artefact | At the START of this pass (`14:46`) | At the END (`15:00`) | What the contract records (`§16.0` item 1, at its own head) |
| --- | --- | --- | --- |
| `scripts/live-drive.mjs` | `8505` lines · `md5 417df09adb1003754836a7c9b7b1bb7a` | **`8668` lines · `md5 a3f9e340a4f3437b72ae547c52fb58e3`** | `8505` · `417df09a…` (the contract calls this head **FROZEN**) |
| `tests/live-drive-contract.test.ts` | `10065` lines · `md5 ffa1555d0e8443614f410617ed327c91` | **`10741` lines · `md5` CHANGING BETWEEN CONSECUTIVE READS** (`a2ab066a…` → `4b60b9ca…` within `4 s`) | `9512` · `474cc6585852fe21f557e0e2c472a814`, tally `3 failed \| 106 passed (109)` |
| `docs/specs/unit-live-fixture-precondition-declaration.md` (the contract) | `1319` lines (matches `§15.8`) | **`1424` lines · `md5 a93270e54919a9fb30b0dfbb04dd46c3` — a FIFTH amendment pass is writing it concurrently** | `§15.8` states `1319` after the fourth amendment |

**Measured write instants (file mtimes, MY readings):** `scripts/live-drive.mjs` `14:54:47` and `14:55:31`;
`tests/live-drive-contract.test.ts` `14:59:34` and again during `14:59:48`–`15:00`; the contract spec
`14:54:47`. **A sibling agent is landing changes to the driver, the pin and the contract SPEC DURING this
gate.**

**Consequences, stated honestly:**

1. **The driver I measured the declarations against (`417df09a…`) is the same one the contract calls
   frozen — all literal/declaration readings in `R-1`, `R-3`—`R-11`, `R-13` were taken at that head and are
   valid there.**
2. **The class-(b) battery (`L-1`…`L-13`) ran against `417df09a…`** (it was launched at `14:48:31`, before
   the `14:54:47` write, and Node had loaded the module by then) — **valid AT THAT HEAD, superseded at the
   head that exists now.**
3. **`R-2`/`R-13`/`R-14`'s pin readings were taken at `10065`/`ffa1555d…`** (two independent runs, both
   `109 passed (109)`), **and the pin has moved `+676` lines since; one later run read `no tests` from a
   half-written file (a concurrent write mid-read).** **The pin's current state is UNVERIFIABLE by me —
   structurally, not for want of a shell.**
4. **The contract I derived from is the `1319`-line fourth-amendment head.** The concurrent fifth amendment
   may have already moved the sites I cite; **my `§`-citations are to the `1319` head**, and I did not
   re-derive against the `1424`-line version (re-reading it after the fact would destroy the blind
   derivation's value).

### 4.1 `L-1` — the census/declaration reconciliation line — **PASS**

**Invocation:**
```
node scripts/live-drive.mjs --no-seed --display=:0 --port=3961 --cdp-port=9461 --home=/tmp/gate5-fixture-iso
```
**Boot-and-connect (required before driving):** `[provident-mcp] http transport ready on
http://127.0.0.1:3961/mcp` · `[provident-main] renderer ready — MCP backend armed` · `DevTools listening on
ws://127.0.0.1:9461/devtools/browser/…` — boot GREEN. Run completed: `6282` lines, no truncation.

**Verbatim line relied on (line 151 of the artifact):**
```
[live-drive] FIXTURE DECLARATION (§4.2 A-1/A-3 reconciliation): declared=47 · census-derived=47 · historical=17 · ENTERED (census-minus-historical)=30 · LEFT (historical-minus-census)=[] · census-minus-declared=0 · AMBIGUITY LIST (excluded AND recorded, never a silent pass)=[stage_boot_landing_diag @ ufSurfacePresence (the edit-surface marker read as an opaque presence/agreement signal) [2.1.1-D + 2.1.4] EXCLUDED and RECORDED | stage_multimount_reachability @ ufSurfacePresence (the same opaque presence/agreement read) [2.1.1-D + 2.1.4] EXCLUDED and RECORDED]
```
**Every one of the six contracted figures matches `§16.0` item 3 / `§16.6` EXACTLY**, and the line carries
the reconciliation **and** the AMBIGUITY LIST. **PASS.** *(The line also carries two figures the contract
does NOT predict — `GATED (derived from this declaration by §4.1's predicate)=34` and an
`EXCLUDED ENGINE FAMILY=7 gnosis_* key(s)` clause; see `§5.6` finding (f).)*

### 4.2 `L-2` — the AMBIGUITY LIST — **PASS**

**Reading:** the list is **printed, NON-EMPTY, with exactly the two keys of `§16.5`**
(`stage_boot_landing_diag` · `stage_multimount_reachability`), each with site, clause `2.1.1-D + 2.1.4`
and disposition `EXCLUDED and RECORDED`; **no third member; neither key is admitted.** Verbatim in `§4.1`.
**PASS.** — **This is a class-(b) reading of a claim `§16.10` item (c) calls still owed** (an ambiguity
list *"quoted from artifact output rather than from the source"*): **I now quote it from artifact output.**

### 4.3 `L-3a` / `L-3b` — the fixture STATE at the launch-profile and summary sites — **PASS (both)**

**Launch profile (line 148) — verbatim (truncated only where noted):**
```
[live-drive] LAUNCH PROFILE: {"fixture":{"state":"no fixture data set selected","kind":"none","id":"none"},"mode":"lexical","port":3961,"cdpPort":9461,"display":":0", …} — REQUESTED groups=[…] vs EFFECTIVE (bridge-reported; the filtered set the live MCP gate is re-gated from)=[…]; CONSEQUENCE: a requested group ABSENT from the effective set has NO tools registered, … (e.g. an effective set without `rag` makes `rag.list_documents` a driver read failure and re-classifies the 17 corpus-dependent blocks) — never as app FAILs
```
**Fixture-state line (line 150) — verbatim:**
```
[live-drive] FIXTURE STATE: fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none — CONSEQUENCE: a run whose fixture state is none reports every declared corpus-dependent block PARKED BY NAME (PRECONDITION-FAILED, carrying its declared row id and a parkReason naming its fixture), so no corpus-shaped reading in this artifact may be quoted as a live-corpus reading
```
**Summary (line 4721) carries the SAME value:** `"fixture":{"state":"no fixture data set selected","kind":"none","id":"none"}`. **`L-3a` PASS · `L-3b` PASS** — one value, two sites, and the consequence clause is stated at both (`§6.1`, `X-5`).

### 4.4 `L-3c` — the `--groups=` refusal path — **PASS**

**Invocation:** `node scripts/live-drive.mjs --groups= --no-seed --display=:0 --port=3963 --cdp-port=9463 --home=/tmp/gate5-fixture-iso`
**Verbatim (tail):**
```
[live-drive] ARG-REFUSED: --groups= was given an EMPTY value (""), which names no tool-group set — REFUSED by name rather than silently launching a profile the operator did not ask for (an EMPTY security set for the empty value, or the wider default [read,dispatch,rag,edit,module,code,graph,gnosis,gnosis-edit] when the flag is omitted); pass --groups=<a,b,c> or omit the flag; fixture={"state":"no fixture data set selected","kind":"none","id":"none"} (the run-wide fixture state, §6.1 — stated on THIS path too, because a refusal is a reading about the run identity)
```
**Exit code: `2` — exactly as `§6.1` print site (3) and `X-1` contract. PASS.**

### 4.5 `L-3d` — the module-level `main().catch` ERROR path — **PASS on its own contract; FAIL on process hygiene**

**Invocation:** `node scripts/live-drive.mjs --port=not-a-port --no-seed --display=:0 --cdp-port=9464 --home=/tmp/gate5-fixture-iso`
**Verbatim (tail):**
```
[live-drive] ERROR: Error: waitFor timed out after 60000ms fixture={"state":"no fixture data set selected","kind":"none","id":"none"} (the run-wide fixture state, §6.1 site 4 — stated on this path too: this abort produced no artifact, but a run that states no fixture identity is not quotable)
```
**The field IS on the ERROR line, and the exit code is `2` — `§6.1` site (4) and `X-1` SATISFIED.**
**BUT: the driver's spawned Electron SURVIVED the abort.** After the run I found a live
`electron . --mcp-port=3787 --remote-debugging-port=9222` process tree **listening on `3787` and `9222`**,
which I had to `kill -9` myself. **`--port=not-a-port` is silently ignored** (the parser at the `--[a-z0-9-]+=`
regex never matches a non-numeric-looking value... it matches, and `Number('not-a-port')` is `NaN`, so the child
is spawned on the DEFAULT `3787`/`9222`) — **so a malformed `--port=` value lands the child on the two ports
the standing sibling hazard owns.** See `§5.6` finding (g). **Marked PASS-with-finding.**

### 4.6 `L-4`—`L-11`, `L-13` — the fixture-ABSENT full battery — **MOSTLY FAIL**

**Run shape:** `done: 100 blocks`; verdict lines **`36 PASS · 17 FAIL · 17 NOT-DRIVEN · 33 DIAG`** +
**`3 PARK`**; summary `{"total":8,"pass":1,"fail":4,"parked":3,"blocksRun":100,"extendedRowsRun":58,"diagnostics":27}`;
`EXIT=1` (the driver's exit is `fail > 0`).

**`L-4` — the `34`-park reading: FAIL, decisively.** The driver's own derived gate observation, verbatim:
```
[live-drive] FIXTURE GATE OBSERVED (§6.1, gate-4 E-3 — the DERIVED, CONDITIONAL split this run actually produced): declared=34 gated key(s) · OBSERVED SPLIT: parked=1/34 (parked=1 carried the fixture-absent park, ran-with-own-verdict=33) · SCOPE: the 34 gated declared keys (corpusRead:true AND selfProvisioning:false, §4.1) of the 47-entry census declaration; …
```
**`1` of `34`, not `34` of `34`.** `§8.3` item 1's reading demands the `34` (`21` on `ROW` lines + `13` on
`DIAG` lines). **Measured split: `0` `ROW`-line parks + `1` `DIAG`-line park.** The `3` counted
`parked` rows in the summary are **NOT** this unit's gate: `gnosis_doc_update` (the engine family,
`§2.3 P-7`), `u_edit_1_live_package_table_limitation` (the **never-gated** `selfProvisioning:true` key
`§16.4` names — its park is its own body's, with its own reason `NO document in this store renders a table…`),
and `stage_multimount_reachability` (not a census key at all, `§2.3 P-11`). **Falsified.** Cause and
classification: `§5.6` finding (a).
**The single gate park, verbatim (the good news — the gate WORKS when it fires):**
```
DIAG  tabs               PRECONDITION-FAILED: fixture-missing — rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT (--no-seed=true; block=tabs DECLARES the fixture corpus-documents over the corpus surface it reads (a corpus document focused by node id (provident.focus{kind:nodeId, nodeId:.live-corpus/beta})); the read that failed is rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT) — the block carries no declared row id; its verdict is classified, never counted as an app FAIL
```

**`L-5` — the `parkReason` naming the fixture: PASS where it fired, NOT-EXERCISED for the `21`-`ROW` route.**
The one gate park printed on the `DIAG` route (where `§5.3` gives no `parkReason` field, correctly). **But
the `21` `ROW`-line parks `§16.7` predicts never happened**, so the `ROW … verdict=PARKED parkReason=` form
was exercised only by other rows' own parks, not by this unit's gate. **The `ROW`-line `parkReason` shape
itself is live and correct** (see `§4.7`'s scoped reading: `parkReason` names the block, the fixture KIND,
the `surface` text and the failed read). **NOT-EXERCISED for its contracted population.**

**`L-6` — the `DIAG` (not `ROW`) route for a no-id parked block: PASS.** `tabs` printed **`DIAG`**, its
detail carries `PRECONDITION-FAILED:`, and **no `ROW` line with `row=null` was printed for it** — the
`§5.1` clause 2 / `§5.3` contracted form. (`§16.4`'s `D-4` expectation that `tabs`'s `rows` is `[]` also
holds — see `§5.6` finding (b) for what the contract gets wrong about `tabs` in the other direction.)

**`L-7` — no silent `rows=0` for a gated key: FAIL for `33` of `34` gated keys.** `33` gated keys ran their
own bodies. Their outcomes are visible (`17 FAIL`, `17 NOT-DRIVEN`, many `DIAG`) — so the absence is not
*printed as absence* for any of them, but the `F-2` class (`§5.5`) is exactly what the run shows: declared
corpus-dependent work executed against a corpus the driver did not have when the declaration said `none`.
**`v3_docnav`'s own DIAG is the smoking gun — it read a document:**
```
DIAG  v3_docnav           rag.list_documents={"documents":[{"documentId":".live-corpus/live4-first","title":"First","path":[".live-corpus"],"tags":[]}]}
```

**`L-8` — the two printed forms distinguishable: PASS mechanically, NOT-EXERCISED for its population.**
One `DIAG … PRECONDITION-FAILED:` line exists; `0` gate `ROW`-line parks exist. **Falsified for the `21` limb.**

**`L-9` — no park counted as an app FAIL: PASS.** No `PARK`-line key appears in the `FAIL` list; the
`PARKED` verdict carries `realInput=false` and `DRIVER-FAILURE(not-driven …)`; the summary's own counters
keep `parked:3` separate from `fail:4`.

**`L-10` — `selfProvisioning` / `corpusRead:false` keys NOT parked: PARTIAL PASS, with one false park.**
Of the `13` never-gated keys, **`12` were not parked** (correct). **One WAS:**
`u_edit_1_live_package_table_limitation` — a `selfProvisioning:true` entry — printed
`ROW … verdict=PARKED … parkReason="NO document in this store renders a table on its page-edit surface…"`.
**Its park is NOT the fixture gate's** (it is the block's own body parking for its own reason — the
driver's own §5.2 `#35`/`SELF` shape) — so the *contract* limb ("a park of any of the `13` is a FALSE PARK")
reads FALSIFIED on a literal reading, while the *gate* limb is satisfied. **Reported, not smoothed: the
distinction matters and the contract does not draw it.** Classification: `§5.6` finding (d).

**`L-11` — `boot_landing` never parked, carries its own verdict: PASS on the park limb, FAIL on the verdict.**
It was **not parked** (correct, `§16.2`), and it **provisioned its own document** —
`import={"ok":true,"documentIds":[".live-corpus/live4-first"],"nodeCount":3,"edgeCount":5}` and
`self-provisioned store read-back: rag.list_documents -> 1 document(s)`. **But it reported `FAIL`:**
```
FAIL  boot_landing       coexist=true (landing=true data-stage=landing toolbar=true panes=2); import->landingAfter=true (required false); required coexistence=true; import={"ok":true,"documentIds":[".live-corpus/live4-first"],"nodeCount":3,"edgeCount":5}; self-provisioned store read-back: rag.list_documents -> 1 document(s) (the document THIS row placed, §2.1.1-A); zoneState=expanded
```
**`§16.2` records the opposite** (*"reports its OWN outcome on the LANDING assertion"*, i.e. the landing does
NOT persist after the import). At this head **`landingAfter=true` against `required false`** — i.e. the
landing PERSISTS. Classification: `§5.6` finding (c). *(This is an app-layer reading — it is owned by
`docs/defects.md` `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT` — and it is NOT this unit's result; it is only
evidence that the contract's recorded class-(b) observation does not hold at this head.)*

**`L-13` — the historic hand-list wording: PASS (the drift the contract records is real and unmoved).**
`§16.9` item 3 says the `LAUNCH PROFILE` consequence text still measures the historical `17`. Verbatim from
the same line: `… (e.g. an effective set without `rag` makes `rag.list_documents` a driver read failure and
re-classifies the 17 corpus-dependent blocks) — never as app FAILs`. **`17`, as recorded.** PASS.

### 4.7 `L-12` — the `--block=` scoped agreement — **FAIL**

**Invocations:**
```
node scripts/live-drive.mjs --no-seed --display=:0 --port=3962 --cdp-port=9462 --home=/tmp/gate5-fixture-scope --block=toolbar_undo
node scripts/live-drive.mjs --no-seed --display=:0 --port=3964 --cdp-port=9464 --home=/tmp/gate5-fixture-scope2 --block=tabs
```
**`toolbar_undo`, scoped, VERBATIM:**
```
PARK  toolbar_undo       PRECONDITION-FAILED: fixture-missing — rag.list_documents -> 0 document(s) (the fixture "corpus-documents" own read) … block=toolbar_undo DECLARES the fixture corpus-documents over the corpus surface it reads (the first store document with a corpus-document fallback, edited and read back (rag.list_documents, edit.set_content, rag.get_document)); the read that failed is rag.list_documents -> 0 document(s) (the fixture "corpus-documents" own read) (the block own DECLARED FIXTURE probe, never the run-wide read)
ROW   toolbar_undo           row=UF-HIST-2 block=toolbar_undo verdict=PARKED dclass=D-state realInput=false surface=target=assembled-renderer liveSurfacePresent=null proxyPASS=false proxy=null gesturePath=driver-precondition (no gesture; could not be driven) … parkReason='fixture-missing: rag.list_documents -> 0 document(s) (the fixture "corpus-documents" own read) (…block=toolbar_undo DECLARES the fixture corpus-documents over the corpus surface it reads (the first store document with a corpus-document fallback, edited and read back (rag.list_documents, edit.set_content, rag.get_document));…)'
```
```
[live-drive] FIXTURE GATE OBSERVED (§6.1, gate-4 E-3 …): declared=34 gated key(s) · OBSERVED SPLIT: parked=1/34 (parked=1 carried the fixture-absent park, ran-with-own-verdict=33) · …
```
**In the FULL battery, the same block reported `FAIL`** (`toolbar_undo undo disabled before=false afterEdit=false …`).
**The scoped park is BETTER than the full battery's verdict for the same block ⇒ the two DISAGREE.** That is
exactly the `--block=`-space-only claim `§1.3` / `§4.2` `A-9` / `§8.3` item 4 forbid. **FAIL.**
**The second scoped run is worse and is worth its own line — `tabs` scoped, VERBATIM:**
```
[live-drive] §6.1 summary: {"…","fixtureGate":{"declared":34,"parked":0,"ran":34,"observed":null,"split":"parked=0/34",…}}
[live-drive] FIXTURE GATE OBSERVED (§6.1, gate-4 E-3 — the DERIVED, CONDITIONAL split this run actually produced): declared=34 gated key(s) · OBSERVED SPLIT: parked=0/34 (parked=0 carried the fixture-absent park, ran-with-own-verdict=34) · …
```
**while the SAME run printed `DIAG  tabs  PRECONDITION-FAILED: fixture-missing …`** — i.e. **the gate
observation counts `0` parked in a run that demonstrably parked one block.** The derived split under-counts
every `DIAG`-route park. Classification: `§5.6` finding (e). *(The fixture-state line IS present on both
scoped runs — that limb of `L-12` PASSES.)*

### 4.8 The node-static / node-suite readings

| Scenario | Reading | Status |
| --- | --- | --- |
| **`R-1`** | The pin's own `A-1` output: `[fixture-declaration A-1] derivation: census-derived 47 key(s) · declared entries 47 · …` — **both of `§4.1.0`'s figures are printed**, and `census-minus-declared=0` (`§16.6`). | **PASS** |
| **`R-2`** | **Two independent runs at the SAME pin head (`10065` lines · `md5 ffa1555d0e8443614f410617ed327c91`) both read `Tests 109 passed (109)` · `Test Files 1 passed (1)`, exit `0`.** The contract's recorded `3 failed \| 106 passed (109)` does **not** reproduce. | **FAIL vs the contract's recorded reading** — see `§5.6` finding (h) |
| **`R-3`** | The `UF_FIXTURE_RECONCILIATION.ambiguity` literal carries **exactly `2`** records, the two `§16.5` keys, each with site / clause `2.1.1-D + 2.1.4` / disposition `EXCLUDED and RECORDED`; neither key is in the derived census. | **PASS** |
| **`R-4`** | The hand-list literal is exactly the `§0.3` `V-1` amendment `17` (`tabs … u_edit_1_live_package_table_limitation`); `uf_panes_1` appears in **neither** the literal nor the declaration (`§16.1`); `MATRIX_ROWS` is `8` (`U-1`…`U-8`); `ROW_EXTENDED` `32`; `COVERED_ROW_BLOCKS` `36`. | **PASS** |
| **`R-6`** | `entries 47` · `corpusRead:false 3` (`stage_search_open_in_tab`, `stage_tabs_persist_roundtrip`, `user6_search_no_flicker`) · `selfProvisioning:true 10` (`boot_landing`, `import1`, `ms_store` + the seven `u_edit_1_live_*`) · **`GATED 34`** · never-gated `13` · hand-list `17`, all `corpusRead:true`, `0` without an entry. **Every figure and every set is exactly the contract's** (`§16.3`/`§16.4`/`§16.6`/`§16.7`). | **PASS** |
| **`R-7`** | `47` unique blocks · booleans booleans · non-empty `fixtureName`/`surface` · `rows` arrays · `fixtureName` set `{self-provisioned-document, corpus-documents, none, corpus-query-results, corpus-document-tabs}` ⊆ the `§4.1` closed set · **`0` entries naming an obsolete supply mechanism**. | **PASS** |
| **`R-8`** | `rows: []` on **`16`** entries (`13` gated + `3` never-gated) — matches `§16.7`'s literal count. **But `§16.7`'s `21`/`13` ROUTE lists do not match the tree** — see `§5.6` finding (b). | **PARTIAL — the `16` PASSES, the route lists FAIL** |
| **`R-9`** | The pin's `A-8` report shows all `10` `run-wide-state-limb` arms executed and `0` broken; the four-print-site / one-read / not-O-0-scoped / consequence limbs are asserted, and the `L-3a`—`L-3d` live readings corroborate the sites. | **PASS** |
| **`R-10`** | Pin verbatim: `[fixture-register] TALLY declared 11 + 24 + 24 + 20 = 79 attempt(s); class-(b) named NOT-RUN 10; seed 0x20261002; caps ≤ 100/row · ≤ 400 total · ≤ 8 rows`; `[fixture-register] TALLY declared 11 + 24 + 24 + 20 = 79 attempt(s); executed node-side 69; class-(b) arms NOT-RUN 10; broken rows (none)`; per-row `P-IM-4 11/0 · P-IM-5 24/0 · P-SM-4 24/0 · P-TP-3 20/10`, all `held=true, broken=0`. **The landed register is untouched: `REGISTER_SEED = 0x20260929` with its literal assertion, `7` rows, `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`.** | **PASS — both registers exactly as contracted** |
| **`R-13`** | **The contract (`§16.9` item 7, `§12` item 12(c)) says *"NO ambiguity-list reader/assertion exists in the pin at this head"*. IT EXISTS:** the pin carries an `ambiguity` reader with the `A-3` arms, including the two named mutations (`EMPTY the list`; `DROP one recorded key`) and an explicit guard that an empty list is *"a driver with NO ambiguity entries left every arm GREEN"*. | **FAIL vs the contract's recorded reading** — see `§5.6` finding (i) |
| **`R-14`** | All four `describe` titles carry the literal `§4 P-IM-4` · `§4 P-IM-5` · `§4 P-SM-4` · `§4 P-TP-3`, and the four class-minimum records match `§11.2.5` value-for-value. **BUT they live in a NEW record `UF_FIXTURE_DECLARED_CLASS_MINIMUMS`, not in an extension of the landed `DECLARED_CLASS_MINIMUMS`** — see `§5.6` finding (j). | **PARTIAL** |
| **`N-1`** | `npm test` → `Test Files 3 failed \| 209 passed (212)` · `Tests 3 failed \| 4597 passed \| 57 skipped (4657)`. The three reds are **exactly the carried baseline**: `pd-vendor-pin-refresh-register` (`P-IM-pd-pin-1`), `pd-vendor-set` `§3.3` item 2 (`dd34e011…` vs pinned `d7b98b57…`), `unit-stage-active-tab-display-pbt-generators` (`P-SM-1`). **No new red.** | **PASS (no new red)** |
| **`N-2`** | `git status --porcelain` shows `M docs/HANDOFF.md · docs/decisions.md · docs/defects.md · docs/next-steps.md · docs/pending.md · docs/specs/unit-live-driver-verdict-integrity.md · scripts/live-drive.mjs · tests/live-drive-contract.test.ts` and the three untracked specs. **NONE of those writes is mine** — their mtimes predate or bracket my pass and the concurrent writer is named in `§4.0`; **the only file I wrote is this artifact.** | **PASS for my own wall; the rest is another writer's** |

### 4.9 Process hygiene (my own obligation)

**After every run I checked for survivors:** `pgrep -af electron` and `ss -ltn` for `3787`/`9222`/`3961`/
`3962`/`3963`/`3964`/`9461`—`9464`. **Three findings:**
1. **My first `--help` probe mis-launched Electron on `3787`/`9222`** (the driver's parser ignores unknown
   args and runs the battery — there is no `--help`). **I killed it within seconds** and verified no
   listeners remained. **My own mistake, disclosed.**
2. The leak described in `§4.5` (`L-3d`), killed by me.
3. **The battery runs (`L-1`, `L-12`) left NOTHING behind** — both ended with
   `/…/electron exited with signal SIGTERM` and I verified empty `pgrep`/`ss` afterwards.
**Port `9222` was never used by any run I relied on**; `L-3c`/`L-3d` were the only invocations whose child
could have reached it, and `L-3d`'s child did (see 1–2). **Final state: no Electron process, no listener.**

---

## 5. THE FAIL LEDGER (per scenario)

| Scenario | Status | The reading that decided it |
| --- | --- | --- |
| `L-1` | **PASS** | all six figures + the ambiguity list, verbatim in `§4.1` |
| `L-2` | **PASS** | non-empty, exactly the two `§16.5` keys, `EXCLUDED and RECORDED` |
| `L-3a` `L-3b` | **PASS** | launch-profile + summary carry the same `none` triple (§4.3) |
| `L-3c` | **PASS** | `ARG-REFUSED` line carries the state; exit `2` |
| `L-3d` | **PASS-with-FINDING** | ERROR line carries the state; exit `2`; **but the spawned Electron survived on `3787`/`9222`** |
| `L-4` | **FAIL** | `OBSERVED SPLIT: parked=1/34 (… ran-with-own-verdict=33)` |
| `L-5` | **NOT-EXERCISED (for its `21`-`ROW` population)** | `0` gate `ROW` parks |
| `L-6` | **PASS** | `tabs` → `DIAG` with the marker; no `ROW`-with-`row=null` |
| `L-7` | **FAIL** | `33` of `34` gated keys ran their own bodies (e.g. `v3_docnav` read a real document) |
| `L-8` | **PARTIAL / NOT-EXERCISED** | one `DIAG` marker; no gate `ROW` form exercised |
| `L-9` | **PASS** | no park counted as a FAIL; counters keep `parked` and `fail` separate |
| `L-10` | **PARTIAL** | `12` of `13` never-gated keys unparked; `u_edit_1_live_package_table_limitation` `PARKED` for its **own** reason |
| `L-11` | **PASS (park limb) / FAIL (verdict limb)** | never parked + self-provisioned ✔; `landingAfter=true` vs `required false` ✘ |
| `L-12` | **FAIL** | `toolbar_undo` parks scoped and FAILs in the full battery; `tabs` parks scoped and DIAGs in the battery; and the gate's own count says `parked=0/34` while printing a park |
| `L-13` | **PASS** | the `17` wording is still live (`§16.9` item 3 confirmed) |
| `R-1` `R-3` `R-4` `R-6` `R-7` `R-9` `R-10` | **PASS** | see `§4.8` |
| `R-8` | **PARTIAL** | the `16` is right; `§16.7`'s route lists are wrong |
| `R-2` | **FAIL vs the contract's recorded reading** | `109 passed (109)`, not `3 failed \| 106 passed` |
| `R-13` | **FAIL vs the contract's recorded reading** | the pin HAS the ambiguity reader the contract says is absent |
| `R-14` | **PARTIAL** | four titles + four value-sets right; delivered as a new record, not an extension |
| `N-1` | **PASS** | exactly the three carried baseline reds, no new red |
| `N-2` | **PASS (my wall)** | only this artifact is mine |

**Counts: `13 PASS` · `4 FAIL` · `4 PARTIAL/NOT-EXERCISED` · `1 PASS-with-FINDING` (of the `22` rows, `L-3d`
counted once).** **Every FAIL above is a DOC/SPEC DRIFT OR AN UN-HARDENED REGRESSION — none is a pass**
(this gate's rule).

---

## 6. WHERE THE DOCS ALONE LED ME TO EXPECT SOMETHING THE LIVE RUN DID NOT SHOW

**This is the gate's product. Each item names the contract site I derived from, the verbatim reading that
contradicted it, and my classification WITH MY REASONING.**

### 6.1 (a) THE HEADLINE — the `34`-park reading is UNSATISFIABLE ON A FULL BATTERY — **un-hardened regression *in the reading*, not in the mechanism**

**What the docs led me to expect.** `§8.3` item 1: *"every GATED declared block — `corpusRead:true` AND
`selfProvisioning:false` — reports `PARKED` with `PRECONDITION-FAILED` … THE READING IS SATISFIED iff the
`34` PARK — `21` of them on their `ROW` line(s) with `park === true`, `13` of them (which carry NO declared
row id) on the `DIAG` line"*. Reinforced three more times: `§6.1`'s consequence clause (*"a run whose fixture
state is `none` reports EVERY declared corpus-dependent block PARKED BY NAME"*), `§16.9` item 8 (`§8.3`'s
split), and `§16.7` (`21`/`13` NAMED).
**What happened.** `parked=1/34`; `33` gated blocks ran their own bodies and reported `FAIL`/`NOT-DRIVEN`/
`PASS`/`DIAG`; only `tabs` — which runs FOURTH, before any self-provisioner — hit the gate.
**Why, mechanically (verified by read at the gate site).** The park branch fires on **FOUR** conditions, not
the three the contract names:

```
if (pre && pre.present !== true
    && (decl.present && decl.corpusRead === true && decl.selfProvisioning === false)
    && blockFixture && blockFixture.resolved === true && blockFixture.present !== true) { … park … }
```
The extra limbs are the **LIVE probes**: `pre` (the run's own `rag.list_documents` read) and `blockFixture`
(the block's **declared fixture's own probe**, which the driver added per `F-2` so *"a block is never gated on
another fixture's reading"*). And the store is **not empty after block 7**: `boot_landing` is
`selfProvisioning:true` and **runs early**, writing and importing `.live-corpus/live4-first`. The run's own
end-of-run line proves the store is populated: `FIXTURE PRECONDITION (LIVE READING …): PRECONDITION HOLDS —
rag.list_documents -> 2 document(s)`.
**Classification: an UN-HARDENED REGRESSION — and the distinction from a doc drift is the whole point, so I
state my reason.** The *mechanism* is implemented exactly as the contract's `§4.1`/`A-5` describe (the gate
IS the declaration's predicate; the driver even prints `GATED (derived from this declaration by §4.1's
predicate)=34`, and `toolbar_undo` parks perfectly when scoped). **What is not hardened is the RUN: the
contract's acceptance reading assumes a fixture-absent run, but the driver's own earlier blocks MAKE the
fixture present.** So the contract's reading is falsified by the driver's own block ordering, and **the
driver's artifact says so itself** (`OBSERVED SPLIT: parked=1/34 … ran-with-own-verdict=33`) — i.e. the
instrument reports honestly and the SPEC predicts wrongly. **The correct remedy is a spec amendment (state
the reading conditionally, and name the store-contamination by the self-provisioners), and possibly a driver
change (a run-wide fixture-absent mode that suppresses self-provisioning) — but the reading as filed must
not be reported as satisfied.** **This is the single most consequential finding of this gate: `§8.3` item 1
is the class-(b) acceptance reading, and it cannot be taken at this head on any `--block=all` run.**

### 6.2 (b) `§16.7`'s `21`/`13` ROUTE LISTS DO NOT MATCH THE TREE — **doc/spec drift (internal contradiction)**

**The docs led me to expect:** `§16.7` lists the `13` no-id gated keys as `tabs · v1_adjacency · v2_scoped ·
uf_panes_12_diag` (hand-listed) `+ shell_integration · v3_docnav · uf_tabs_7_diag` `+ stage_doc_surface_precondition_diag`
`+ the five o0_* keys`, and the other `21` (`toolbar_undo`, `uf_panes_12`, `uf_tabs_3`, …) as carrying a
declared row id.
**The tree says otherwise:** `tabs` is in **none** of `MATRIX_ROWS`, `ROW_EXTENDED`, `COVERED_ROW_BLOCKS`
(my read of the landed constants: the literals' entries for `tabs` do not exist — `COVERED_ROW_BLOCKS`
carries `uf_tabs_1`, `uf_tabs_3`, `uf_tabs_4`, `uf_tabs_7` but **no `tabs`**), and **the driver's own `DIAG`
line states it**: *"the block carries no declared row id"*.
**So which list is wrong?** `§16.7` puts `tabs` in the `21`; the tree puts it in the `13`. **Drift, and it
is the contract's:** the same section's other count (`16` entries with `rows: []`, and `47 − 31 = 16` under
the pin's reader) is consistent with the driver, so the section contradicts itself internally. **The driver is
right and the spec's route list is wrong.** Classified **doc/spec drift**. *(My `L-6` reading — a `DIAG` line —
is therefore the CORRECT behaviour, and `§5.3`'s no-id contract is satisfied.)*

### 6.3 (c) `§16.2`'s `boot_landing` OBSERVATION DOES NOT REPRODUCE — **drift in a recorded reading (and it exposes an app-layer defect)**

**The docs led me to expect (`§16.2`, `RECORDED READING; measurer: the landing pass`):** on a `--no-seed`
run `boot_landing` *"PROVISIONS ITS OWN DOCUMENT … and reports its OWN outcome on the LANDING assertion — it
never appears as `PARKED`"*.
**Live:** `FAIL boot_landing … import->landingAfter=true (required false) … import={"ok":true,…}`. **The
self-provisioning half reproduces; the verdict half does not** — the landing **persists** where the contract's
reading implies it does not.
**Classification: a doc/spec drift in a RECORDED reading** (the contract labels it `RECORDED READING` and it
does not hold at the head I ran) — **and, underneath it, an APP-LAYER defect that is NOT this unit's**
(`docs/defects.md` `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`: *"on EMPTY-STORE BOOT … `#stage-landing`
PERSISTS AT EVERY SAMPLE … which CONTRADICTS the pinned rule"*). **The contract turned an app-layer defect
into a class-(b) expectation and recorded it as the row's own outcome; that is the drift.** I did **not**
disposition the app defect (not my layer, not my unit).

### 6.4 (d) the `selfProvisioning` false-park limb is stated more absolutely than the driver behaves — **doc/spec drift (a missing distinction)**

**Docs (`§8.3` item 1 / `§16.6`):** *"a park of any of the `13` is a FALSE PARK and fails the reading"*.
**Live:** `u_edit_1_live_package_table_limitation` (a `selfProvisioning:true` entry) printed
`ROW … verdict=PARKED … parkReason="NO document in this store renders a table on its page-edit surface
(candidates tried: [".live-corpus/alpha","defects"] + up to 12 of rag.list_documents) — the row's
precondition cannot be met in this corpus…"`.
**This is NOT the fixture gate's park** — it is the block's **own** precondition park (the `§5.2` `#35`
behaviour the contract's `§16.9` item 1 itself re-classes as `SELF / FM`). **The contract's sentence does not
distinguish "parked BY THE FIXTURE GATE" from "parked by its own body's precondition"**, so read literally it
is violated. **Doc/spec drift** (a missing distinction, not a driver defect). **The driver is right.**

### 6.5 (e) the driver's own gate-observation UNDER-COUNTS `DIAG`-route parks — **un-hardened regression (report honesty)**

**The docs led me to expect (`§16.3`, `§16.7`, `§5.1` clause 3(vi)):** the parked population is
`21 ROW + 13 DIAG = 34`, and *"a reader must not conclude 'no fixture absence was reported' from an empty
`reportRows` filter — the `DIAG` line is where that block's absence is recorded, **and the run's own `diag`
counter includes it**"*.
**Live, in the scoped `tabs` run:** the run printed `DIAG  tabs  PRECONDITION-FAILED: fixture-missing …`
**and, in the same run,** `"fixtureGate":{"declared":34,"parked":0,"ran":34,…}` /
`OBSERVED SPLIT: parked=0/34 (parked=0 carried the fixture-absent park, ran-with-own-verdict=34)`.
**The run's own derived split says `0` parked while its own artifact shows a park.**
**Classification: an UN-HARDENED REGRESSION**, and my reason is that the contract names this exact failure
mode as the one to avoid and the landed derivation falls into it: the `fixtureGate` observation is built from
`reportRows`, and `§5.1` clause 3(vi) records that the `diagResult` fallback *"is FILTERED OUT of
`reportRows`… while its `DIAG` line IS printed"*. **So the driver took the count from the one set the
contract says does not contain the `13`, and reports it as the run's observed split.** **This is the
instrument mis-reporting its own honesty reading** — high-value, and it is exactly why the class-(b) run
exists. **It is NOT the same defect as `§16.9` item 7** (that one is about the pin lacking a reader): the
DRIVER's own line is wrong here.

### 6.6 (f) two figures the contract does not predict are printed, and two it demands are not — **drift, low severity**

- **Not predicted, printed:** `GATED (derived from this declaration by §4.1's predicate)=34` on the
  reconciliation line, and an **`EXCLUDED ENGINE FAMILY = 7 gnosis_* key(s) [gnosis_d2 … gnosis_crud]`**
  clause on the fixture-state line. **`§16.10` item (a) says no `gated=` field is printed at this head** —
  **it now is** (a fifth-amendment-era addition, or the landing's). **The `7 gnosis_*` scope statement is
  good news for `§2.3 P-7`/`§3 R-3`** (the engine family is declared and scoped, *"never silently widened"*),
  but **no contract site predicts it**.
- **Classified: doc/spec drift (the contract's `§16.10` item (a) is stale)** — and both prints are
  *improvements*, which is why severity is low.

### 6.7 (g) the error path leaks its child onto the DEFAULT ports — **un-hardened regression (process hygiene)**

**Docs (`§6.1` site 4):** the module-level `main().catch` prints the fixture state and sets exit `2`.
**Live:** it does — **and the Electron child it had already spawned kept running, listening on `3787` and
`9222`** after the driver exited. **`--port=not-a-port` was silently accepted** (`Number('not-a-port')` is
`NaN`, and the spawn fell back to the defaults). **Classification: UN-HARDENED REGRESSION**, reason: the
driver's own `DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause (i) exists because `:9222` is a contested port owned
by a standing sibling (`docs/pending.md`), and **an early-abort path that leaves its child on `9222` is
precisely the contamination the rule guards against.** **This is the second-most consequential finding** —
it is a live-run hazard, not a documentation issue. *(I killed it; see `§4.9`.)*

### 6.8 (h) the pin's recorded tally does not reproduce, and (i) its recorded gap is now filled — **drift in recorded readings**

**(h)** `§16.0` item 2 / `§16.6`: *"the pin reads `3 failed | 106 passed (109)`"*, with the three reds named
as `A-3.i`, `A-3.ii` and `P-IM-5`'s `historical-reconciliation:mutation`. **Live, twice, at the same pin
head: `109 passed (109)`, exit `0`.** **Drift** — and the likely cause is visible in the source: the pin's
`A-3.ii` report line now reads *"re-add `boot_landing` (LEFT stays [])"*, i.e. the mutation was re-stated on
`§16.2`'s rule exactly as `§16.8` requires. **So `§12` item 12's owed TestWriter edit has LANDED and the
contract's tally is stale.** **Doc/spec drift.**
**(i)** `§16.9` item 7 / `§12` item 12(c): *"NO ambiguity-list reader/assertion exists in the pin at this
head, although the driver prints the list."* **Live: the pin HAS one** — it validates the list's presence,
that no recorded key is *admitted*, that every record names a site/clause/`EXCLUDED` disposition, and it
carries both named mutations (empty the list; drop a key). **Drift: the owed item has been discharged.**
### 6.9 (j) the four class-minimum records were delivered as a NEW record — **doc/spec drift (a shape difference, behaviourally equivalent)**

`§11.2.5` clause 2 / `§15.5`: the TestWriter *"extend[s] the landed `DECLARED_CLASS_MINIMUMS` record with
four keys"*, because `DECLARED_CLASS_MINIMUMS[r.row] ?? {}` *"degrades a missing entry to NO FLOORS
(silently vacuous)"*. **Live:** the four rows' minimums exist with the contracted values, but in a **separate**
record `UF_FIXTURE_DECLARED_CLASS_MINIMUMS`, consumed by the fixture register's own arm. **The functional
obligation is met** (each of the four rows has its floors, and the `?? {}` hazard the contract names does not
bite, since the fixture arm reads the record that holds them). **Drift in shape only; low severity.**

### 6.10 (k) THE HEAD IS NOT STABLE — **not drift, not regression: a structural limit on this gate**

See `§4.0`. **The driver moved `8505 → 8668` lines and the pin `10065 → 10741` lines (with consecutive-read
digest changes and one run that read `no tests` from a half-written file) DURING this pass**, while the
contract calls `8505`/`417df09a…` **FROZEN** and records the pin at `9512`/`474cc658…`. **A verification gate
cannot certify a moving head**: every reading I took has a head-stamp in `§4`, and `R-2`/`R-13`/`R-14`'s pin
readings in particular **do not describe the pin that exists now.** **I do not classify this as drift or
regression — it is a process/coordination fact, and the honest statement is that the current head is
UNVERIFIED by this gate.**

---

## 7. WHAT I COULD NOT RUN, AND WHY (never a silent park)

| Item | Status | The STRUCTURAL reason |
| --- | --- | --- |
| **The pin at the CURRENT head (`10741`+ lines)** | **NOT-RUN** | **The file is being written concurrently**: consecutive `md5` reads differ (`a2ab066a…` → `4b60b9ca…` within `4 s`), one invocation read `no tests` (`1 failed (1)` file-level) from a half-written file, and the line count moved `10676 → 10741` between two reads. **Nothing can be asserted against a file that changes mid-read.** My pin readings in `§4.8` are therefore head-stamped to `10065`/`ffa1555d…`. |
| **`L-4`/`L-5`/`L-8`'s `21`-`ROW`-park population** | **NOT-EXERCISED** | The population does not occur in a full battery at this head (`§6.1`): the store is populated by `boot_landing` before block 8. **This is a NOT-RUN with its cause named, which is the `RCA-11` clause (b) requirement — not a park by default.** |
| **`L-5`'s `ROW`-form `parkReason` for THIS UNIT's gate** | **NOT-EXERCISED for the gate; PASS elsewhere** | The gate produced no `ROW`-form park in `--block=all`. The **shape** is nonetheless exercised and correct on the scoped `toolbar_undo` run (`§4.7`), which parks on its `ROW` line with a `parkReason` naming the block, the fixture NAME and the `surface`. |
| **`A-7`'s falsifiability/proxy limbs, `A-4`'s named mutations, the register's `unrunArm` budget** | **READ, NOT RUN** | Those are pin arms; the pin moved before I could take a second, stable reading of them. The `10` `class-(b)` NOT-RUN terms include exactly these live readings (`§11.2.6`) and are *declared* NOT-RUN by the register itself. |
| **Any app-layer claim** | **NOT THIS UNIT'S — and not run for it** | `§1.3` (no `src/**`), `§7` clause 5, `§9` items 5/10. The `17 FAIL`s and `17 NOT-DRIVEN`s my battery printed are **other rows' business**; I name only the ones that falsify a contract expectation (`boot_landing`, §6.3) and I disposition none of them. |
| **The `--connect` path, the `--strict-seed`/`--o0-corpus` fixture run, the O-0 report artifact** | **NOT-RUN** | Out of this unit's subject (`§1.2`/`§1.3`: no seed-route change, the O-0 mechanism is a different object) and not required by `§8.3`'s five readings. |
| **`npm run typecheck` / `npm run build`** | **NOT-RUN by me** | `§8.4`: `scripts/live-drive.mjs` is in **no** trio leg, so neither would bear on this unit; and the head is moving. **`N-1`'s `npm test` ran only because the contract's gate list names it** — and it proved only "no new red". |

---

## 8. THE HONEST LAYER STATEMENT (final, on every line above)

**This artifact's green is HARNESS `[D]` AT ITS CEILING AND IS NEVER APP-GREEN.** Precisely:

- **`L-*` (class (b), live process)** proves that *the driver's own fixture handling behaves as the contract
  describes — or does not*. **It proves nothing about the app.** The `17 FAIL`s, `17 NOT-DRIVEN`s and the
  three non-gate parks my battery printed are **app-layer or other-unit readings, owned by other rows**;
  they are cited only where they **falsify a contract expectation**, and **none is dispositioned here**.
- **`R-*` (class (a), source derivation)** proves the declaration is derived, agrees in both directions,
  is pure data with tree-carried row ids, is gated by its own predicate, and that the fixture state prints
  from one read at four sites. It **cannot** prove that a fixture-absent run actually parks each block by
  name (`§8.1`, verbatim) — **and on this run it did not**.
- **`N-1` (`npm test`)** is **envelope/host** and proves only that this unit's landing broke nothing else.
  **A node-suite green is envelope-green, not app-green (`RCA-12`); here even the driver is outside it**
  (`§8.4`: *"a green trio proves NOTHING about the driver"*).
- **The unit's own claims I may never make** (`§7` clause 5, `§9` item 10): that any row passes, that the
  battery is app-green, that the app works.
- **The `1`-of-`34` reading is not a green** — it is the falsification of `§8.3` item 1, and I report it as
  such (`§6.1`). **A failure is a doc/spec drift OR an un-hardened regression — never a pass.**
- **And the head moved under this gate (`§4.0`/`§6.10`): every class-(b) reading above is stamped to
  `scripts/live-drive.mjs` `8505`/`417df09a…`, and the current head is UNVERIFIED by me.**

---
---

# GATE 6 — LIVE RE-RUN AGAINST THE LIVE APP (runner: the Live-Scenario Runner, `2026-10-04` `15:21`–`15:36`)

**The filed text above is UNCHANGED and visible; this section is APPENDED. I edited no test, spec, tracker or
driver byte; the only repo write is this section.** My `md5` of this file before the append:
`696000a494d6e09397364c73d32e2046`.

## G6.0 THE HEAD STAMPS (taken before AND after every leg — no reading is attributed to a moving head)

| Leg | Invocation (abbreviated) | head at launch | head at end |
| --- | --- | --- | --- |
| **A** (full battery, `--no-seed`) | `--display=:0 --port=3971 --cdp-port=9471 --home=/tmp/gate6/homeA` | **`fe5ca5f15d93f5b42918e1048f6b3b56` · `8849` lines (THE FROZEN HEAD)** | `6a68e9ed13e21ee72551a493d77c8091` · `9034` (**written at `15:29:24` while A was in flight**) |
| **D1/D2/D2b** (malformed ports), **L-3c** (`--groups=`) | as quoted below | `6a68e9ed…` · `9034` | `6a68e9ed…` |
| **B** (scoped `--no-seed`) | `--block=tabs,toolbar_undo,v3_docnav,uf_panes_14,uf_tabs_7_diag --port=3972 --cdp-port=9472` | `6a68e9ed…` | `c09b28b2c254e8e9e9bf7546c6a34a28` (next confirmed write) |
| **C** (scoped, store present) | same `--block=`, `--port=3974 --cdp-port=9474` (no `--no-seed`) | `c09b28b2…` | `0c2271ae210e9bccd1eabe7e6e6620e0` · `9062` |
| **pin** (`npx vitest run tests/live-drive-contract.test.ts`) | — | `519dd757a7e59ec1f95b856c90c82617` · `11182` | **same digest before and after** |
| **`npm test`** | — | driver `0c2271ae…` · pin `519dd757…` | **same digests before and after** |
| **E** (`main().catch` ERROR path via `--connect` on a dead port) | `--connect --port=3998 --cdp-port=9498` | `0c2271ae…` | `e6407951b2c72b9dd9a2ff1121fb03af` |
| **F** (single block `tabs`, `--display=:99`) | `--port=3975 --cdp-port=9475 --block=tabs` | `e6407951…` · `9088` | **same digest** |

**FINAL SNAPSHOT `15:36`:** driver `e6407951…` · `9088` lines; pin `519dd757…` · `11182`; contract spec
`372d198443824cb3047edf61d6b0b40a` · `1592` lines (the frozen figures I was given were driver `fe5ca5f1`/`8849`,
pin `a6634a47`/`10809`, spec `1508`). **THE HEAD MOVED AT LEAST FOUR TIMES DURING THIS PASS** — the same
structural fact the filed `§6.10` records, and it is the reason every leg below carries its own stamp. `HEAD`'s
git copies are a THIRD revision (driver `c91c0eab…`, pin `0f4a03a0…`), so **the frozen revisions are not
re-runnable from disk**.

## G6.1 LEG (a) — THE FULL BATTERY AT THE FROZEN HEAD (exit `1`)

`done:` — `[live-drive] done: 100 blocks, 17 FAIL, 3 PARKED, 17 NOT-DRIVEN (a driver failure is never an app FAIL)`
`§6.1 summary` — `{…,"fixture":{"state":"no fixture data set selected","kind":"none","id":"none"},"fixtureGate":{"declared":34,"parked":1,"ran":33,"observed":null,"split":"parked=1/34","scope":"the 34 gated declared keys …"},"total":8,"pass":1,"fail":4,"parked":3,"matrixRowsExecuted":8,"blocksRun":100,"extendedRowsRun":58,"diagnostics":27,"coverage":{"matrixTotal":8,"verdicts":8,"missingRows":[],"fullBattery":true,"rowsInScope":8}}`
`FIXTURE GATE OBSERVED` — `declared=34 gated key(s) · OBSERVED SPLIT: parked=1/34 (parked=1 carried the fixture-absent park, ran-with-own-verdict=33) · SCOPE: the 34 gated declared keys …` **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER, KEEPING THIS LEG'S VERBATIM READING AS THE READING OF ITS HEAD: the labels inside it are SUPERSEDED BY THE LANDED DRIVER — `parked=N carried the fixture-absent park` is FALSE as a general claim (the fixture gate's own route is only the `parkedByGate` SUBSET of `parked`), and `ran-with-own-verdict=` is RENAMED `eligible-and-not-parked=` and PRINTED BESIDE `blocksRun=`. `VERIFIED-BY-READ` at the print site (`reader: the Proofreader, this pass`; the contract's `§18.2` clause 1 label note). THE `1/34` READING IS UNAFFECTED.**⟩**
`MATRIX rows` — `(8 of 8 = summary.total): U-8:uf_tabs_3=FAIL U-2:uf_tabs_7=NOT-DRIVEN(realInput:false) U-6:uf_panes_8=PASS U-1:uf_panes_12=NOT-DRIVEN U-3:uf_panes_12=PASS U-2:uf_panes_14=NOT-DRIVEN U-3:uf_panes_14=NOT-DRIVEN U-7:uf_hist_6=FAIL U-5:uf_layout_10=FAIL U-4:uf_layout_10=FAIL` *(the app's own rows — NOT this unit's verdicts)*
`row-set reconciliation` — `matrix=8 rows claimed by 8 mapping(s); blocks run=100 (informational); matrix rows executed=8; coverage={…"fullBattery":true…}; §5.U row total (summary.total)=8; OK (full battery: 8 of 8 declared rows verdicted)`
`CHILD SWEEP` — `(the run reached its own end (main returned)): the child this driver SPAWNED (pid 1040344, process group -1040344) was swept — ONE SIGTERM to that group, then ONE SIGKILL to the SAME group iff its leader was still alive after the 1500 ms grace (the group exited on SIGTERM); the sweep is BOUNDED to this driver's own spawn handle…`
**Exit code `1`** (the driver's `fail > 0` rule). **HYGIENE: after every leg `pgrep`/`ss` show NO Electron process and NO listener on `3787`/`9222` or any of my ports.**

**THE `1` IS THE FIX, VERIFIED INDEPENDENTLY.** The artifact's own parks: 3 `PARK` lines
(`gnosis_doc_update` engine-family · `u_edit_1_live_package_table_limitation` never-gated/own-body ·
`stage_multimount_reachability` non-census) + **1 `DIAG … PRECONDITION-FAILED:` line (`tabs`, GATED)** +
3 `ROW … verdict=PARKED` lines (rows `UF-GNOSIS-5`, `U-EDIT-1-LIVE-6`, `UF-STAGE-AT-7` — **none GATED**).
A `reportRows`-based count would read **`0`**; the landed count reads **`1`** and that `1` **is the `DIAG`-route
park**. The filing's `§6.5` finding (e) under-count is **FIXED at the frozen head**.

## G6.2 LEG (b) — SCOPED `--no-seed` (head `6a68e9ed…`): THE `PARK`/`DIAG` LINES BESIDE `parked=N/34`

```
DIAG  tabs               PRECONDITION-FAILED: fixture-missing — rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT (… block=tabs DECLARES the fixture corpus-documents over the corpus surface it reads (…)); the read that failed is rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT (the block own DECLARED FIXTURE probe, never the run-wide read)) — the block carries no declared row id; its verdict is classified, never counted as an app FAIL
PARK  toolbar_undo       PRECONDITION-FAILED: fixture-missing — … block=toolbar_undo DECLARES the fixture corpus-documents over the corpus surface it reads (the first store document with a corpus-document fallback, edited and read back (rag.list_documents, edit.set_content, rag.get_document)); …  parkReason="fixture-missing: rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT (--no-seed=true; block=toolbar_undo DECLARES the fixture corpus-documents over …)"
DIAG  v3_docnav          PRECONDITION-FAILED: fixture-missing — … block=v3_docnav DECLARES the fixture corpus-documents over the corpus surface it reads (the rendered doc-nav document rows and folder rows against the store list (…)); …
PARK  uf_panes_14        PRECONDITION-FAILED: fixture-missing — … block=uf_panes_14 DECLARES the fixture corpus-query-results over the corpus surface it reads (the pane search painted result rows, hovered and real-clicked (#pane-search li[data-document-id])); …
DIAG  uf_tabs_7_diag     PRECONDITION-FAILED: fixture-missing — … block=uf_tabs_7_diag DECLARES the fixture corpus-query-results over the corpus surface it reads (the same painted search-result row, via a native click (attribution diag)); …
ROW   toolbar_undo   row=UF-HIST-2    block=toolbar_undo verdict=PARKED … gesturePath=driver-precondition (no gesture; could not be driven) DRIVER-FAILURE(not-driven …)
ROW   uf_panes_14    row=UF-PANES-14  block=uf_panes_14  verdict=PARKED … gesturePath=driver-precondition (no gesture; could not be driven) DRIVER-FAILURE(not-driven …)
```
**`OBSERVED SPLIT: parked=5/34` · `"fixtureGate":{"declared":34,"parked":5,"parkedByGate":5,"eligibleAndNotParked":29,"split":"parked=5/34"}` · `done: 5 blocks, 0 FAIL, 2 PARKED, 0 NOT-DRIVEN` — `2 ROW + 3 DIAG = 5 = parked`. THEY AGREE.** The sentinel
`(no parkReason recorded)` appears **0** times in every run. Run **F** (a single-block `tabs` scoped run at
`e6407951`) is the same reading in miniature: 1 `DIAG … PRECONDITION-FAILED:` line beside `parked=1/34`.

## G6.3 LEG (c) — THE SAME BLOCKS WITH A STORE PRESENT (head `c09b28b2…`)

`FIXTURE PRECONDITION (LIVE READING …): PRECONDITION HOLDS — rag.list_documents -> 2 document(s); no fixture precondition marker fires in this run` ·
`done: 5 blocks, 1 FAIL, 0 PARKED, 1 NOT-DRIVEN` · `"fixtureGate":{"declared":34,"parked":0,"parkedByGate":0,"eligibleAndNotParked":34,"split":"parked=0/34"}`.
**A block declaring `corpus-query-results` (`uf_panes_14`) IS DRIVEN, NOT PARKED**, on its own verdict:
`NOT-DRIVEN  uf_panes_14  search pane expand=…; search pane: disclosure=cdp inputFocus=cdp typedValue="alpha" submit=cdp; 0 result rows painted=false …`
(and `uf_tabs_7_diag` → `DIAG … NATIVE DOM click …`; `tabs` → `DIAG … provident.focus(nodeId .live-corpus/beta) → "MCP error -32602 …"`;
`v3_docnav` → `DIAG rag.list_documents={"documents":[…alpha…, …beta…]}`; `toolbar_undo` → `FAIL` on its own body).
**STATED LIMIT: at this head all three corpus fixtures settle on the SAME `rag.list_documents` read (`§18.7` clause 3), so the per-declared-fixture separation is readable only from the DECLARED NAME in the park text — never from two divergent probe values.**

## G6.4 LEG (d) — THE MALFORMED-ARG LEGS (head `6a68e9ed…`), NOTHING SPAWNED

```
$ node scripts/live-drive.mjs --port=not-a-port --no-seed --display=:0 --cdp-port=9473 --home=/tmp/gate6/homeD1     # EXIT=2
[live-drive] ARG-REFUSED: --port=not-a-port is not a DECIMAL INTEGER ("not-a-port") — REFUSED by name BEFORE anything is spawned rather than launching an app the operator did not ask for (an unusable port makes the child fall back to the DEFAULT 3787/9222 profile the standing sibling hazard owns, and the driver would then wait on a port no child is listening on); pass --port=<1..65535>/--cdp-port=<1..65535>, or omit the flag …; fixture={"state":"no fixture data set selected","kind":"none","id":"none"} (the run-wide fixture state, §6.1 — stated on THIS path too …)
$ node scripts/live-drive.mjs --port=65536 … --cdp-port=9474                                                  # EXIT=2
[live-drive] ARG-REFUSED: --port=65536 is OUT OF RANGE (65536) — a TCP port is 1..65535 — REFUSED by name BEFORE anything is spawned …; fixture={…}
$ node scripts/live-drive.mjs --port=0 … --cdp-port=9475                                                       # EXIT=2
[live-drive] ARG-REFUSED: --port=0 is OUT OF RANGE (0) — a TCP port is 1..65535 — …
```
`pgrep -af electron` → `(no electron process)` and `ss -ltn` → `(no listeners)` **both before and after each leg**:
**`3787`/`9222` were never touched.** The old hazard (a `NaN` port reaching the spawn) is closed by the pre-spawn
`ufPortArgOffence` refusal; **the refusal text executed here is byte-identical to the frozen-head source site I read
before the write (`fe5ca5f1`, lines `8083`–`8098`/`8181`–`8191`), so the (d) reading is corroborated for the frozen head by read and executed at `6a68e9ed`.**

## G6.5 LEG (e) — NODE SUITE

- **pin** `npx vitest run tests/live-drive-contract.test.ts` @ `519dd757…`/`11182`: **`Test Files 1 passed (1)` · `Tests 113 passed (113)` · exit `0`.**
- **`npm test`** @ pin `519dd757…`, driver `0c2271ae…`: **`Test Files 3 failed | 209 passed (212)` · `Tests 3 failed | 4601 passed | 57 skipped (4661)` · exit `1`.** The three reds are exactly the carried baseline: `pd-vendor-pin-refresh-register` (`P-IM-pd-pin-1`) · `pd-vendor-set` (`§3.3` item 2) · `unit-stage-active-tab-display-pbt-generators` (`P-SM-1`). **NO NEW RED.**

## G6.6 PER-SCENARIO VERDICTS (the filed `§5` ledger's 22 rows; verbatim readings)

| Scenario | G6 | The reading that decided it |
| --- | --- | --- |
| `L-1` | **PASS** | `declared=47 · census-derived=47 · historical=17 · ENTERED…=30 · LEFT…=[] · census-minus-declared=0` + the AMBIGUITY LIST, all on one line (`fe5ca5f1`) |
| `L-2` | **PASS** | exactly the two `§16.5` keys, each `[2.1.1-D + 2.1.4] EXCLUDED and RECORDED` |
| `L-3a` `L-3b` | **PASS** | `FIXTURE STATE: fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none …` and the summary's identical `"fixture":{…}` triple |
| `L-3c` | **PASS** | `ARG-REFUSED: --groups= was given an EMPTY value ("") … fixture={…}` · **exit `2`** |
| `L-3d` | **PASS** (the filed hygiene finding is FIXED) | `[live-drive] ERROR: Error: waitFor timed out after 60000ms fixture={"state":"no fixture data set selected","kind":"none","id":"none"} (…)` · **exit `2`**; `--connect` owns no child; **nothing spawned, nothing leaked** |
| `L-4` | **FAIL as filed — FIXED as a READING** | `OBSERVED SPLIT: parked=1/34 (… ran-with-own-verdict=33)`; the count now AGREES with the artifact; the contract's `§18.2`(b) makes it satisfiable; **a 34-of-34 park remains impossible on `--block=all`** |
| `L-5` | **PASS** (scoped population) | the ROW-form `parkReason` names the block, the fixture `corpus-documents`, its `surface` text and the failed read; **the full battery still produces 0 gated ROW parks** |
| `L-6` | **PASS** | `tabs` → `DIAG … PRECONDITION-FAILED:`; **no `ROW … row=null` for it**; the no-id route returns `diagResult` (no `park` key) at the source |
| `L-7` | **FAIL as filed — superseded** | 33 of 34 gated keys ran their own bodies; `§18.2`(b) now permits `ran-with-own-verdict`, and the `F-2` class is UNIT B's |
| `L-8` | **PASS** | both forms ARE distinguishable from the artifact alone (1 `DIAG` marker + 2 `ROW … verdict=PARKED … parkReason=` in leg (b)) |
| `L-9` | **PASS** | no parked key appears in the `FAIL` list (`0` hits each); `done:` keeps `3 PARKED` beside `17 FAIL` |
| `L-10` | **PARTIAL** (as filed) — resolved by the amended contract | 12 of 13 never-gated keys unparked; `u_edit_1_live_package_table_limitation` parks for its **OWN** reason; `§6.4`/`§5.1` clause 1 now carry the gate-vs-own-body distinction |
| `L-11` | **PASS** (park limb) / **FAIL** (verdict limb) | never parked + self-provisions (`import={"ok":true,…}`); `FAIL boot_landing … import->landingAfter=true (required false)` — **app-layer row `UF-STAGE-1`, other rows' business** |
| `L-12` | **FAIL — PERSISTS** | `toolbar_undo`: **scoped `PARK` + `ROW … verdict=PARKED`** (leg b) vs **full battery `FAIL toolbar_undo undo disabled before=false afterEdit=false …`** (`fe5ca5f1`); `uf_panes_14` likewise `PARKED` scoped vs `NOT-DRIVEN` in the battery. *(The sub-defect — the gate's own count disagreeing with its own park line — is FIXED, see G6.2.)* |
| `L-13` | **FAIL as filed** (the words now measure `34`) | `… re-classifies the 34 GATED declared corpus-dependent blocks — the DECLARATION's population, §16.3; the HISTORICAL hand-list \`UF_CORPUS_DEPENDENT_BLOCKS\` is 17 keys and is a DIFFERENT, historical figure, never the gate's population` — **this is the relabelling `§16.9` item 3 owed; the filed expectation is superseded, NOT a regression** |
| `R-1` `R-3` `R-4` `R-6` `R-7` `R-9` `R-10` | **PASS** | pin: `[fixture-declaration A-1] derivation: census-derived 47 … declared entries 47 … undeclared 0 []`; `A-3/E-5 ambiguity RECORDED [stage_boot_landing_diag, stage_multimount_reachability] vs RECOMPUTED […]`; register `declared 11 + 24 + 24 + 20 = 79 … seed 0x20261002 … executed node-side 69 … held=true, broken=0` and the landed register `seed 0x20260929 … 6 + 14 + 16 + 17 + 19 + 15 + 14 = 101` UNTOUCHED; derivation: ambiguity `2`, hand-list `17` (incl. `v1_adjacency`/`v2_scoped`), `uf_panes_1` in NEITHER, `MATRIX_ROWS 8`, `ROW_EXTENDED 32`, `COVERED_ROW_BLOCKS 36`, entries `47`, `corpusRead:false 3` (named), `selfProvisioning:true 10` (named), GATED `34`, never-gated `13`, hand-list all `corpusRead:true`, `0` hand keys without an entry, `0` entries naming an obsolete supply mechanism, fixture-name set ⊆ the closed set, all members well-typed |
| `R-8` | **FAIL as filed** | live `rows: []` on **`15`** entries = **`13` GATED + `2` never-gated (`import1`, `ms_store`)** — not `16` = `13` + the three `corpusRead:false` keys the filing names; the live route split is **`21 ROW + 13 DIAG`** **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THE ROUTE SPLIT IS CONFIRMED, AND THE `15`/`13`/`2` DECOMPOSITION IS CONFIRMED AT THE **CLOSE** HEAD WITH THE PASS'S OWN FIRST-READ FIGURES KEPT VISIBLE: (i) the **route split `21 ROW + 13 DIAG` IS THE READING OF RECORD** and is what the contract should carry (`§18.3` printed `22`/`12`; a separate doc drift — see the contract's `§20.2`); (ii) measured with the file-read tool over the landed literal (`reader: the Proofreader, this pass`), `rows: []` appears on **`15`** entries = **`13` GATED + `2` NEVER-GATED** (`import1` · `ms_store`) at the head this pass CLOSED at (`scripts/live-drive.mjs` = `9109` lines), and on **`19`** = `13` + `6` at the intermediate head it FIRST read (`9088` lines) — **the four extra keys (`uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`) were POPULATED by a sibling pass mid-pass, so this line's own `2` and the mid-pass `6` are BOTH correct readings of DIFFERENT heads and neither is smoothed away**; (iii) **the `15` is ALSO the TREE-SOURCE count** (`47` census keys − `32` keys an id is paired with in the three declared sources) — at the close head the two populations happen to coincide in SIZE, and a later pass must not read that coincidence as identity: the declaration's `rows` arrays and the tree's three sources are different objects whose two extra-key disagreement is the contract's `§16.9` item 2 filing.⟩** |
| `R-2` | **FAIL vs the contract's recorded reading** | `113 passed (113)` at pin `519dd757…`/`11182` — neither the contract's `3 failed \| 106 passed (109)` (`10809`/`a6634a47`) nor the filing's `109 passed (109)` (`10065`) reproduces **⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — THIS LINE'S READING IS THE READINGS OF RECORD AT THE MEASURED HEAD AND NEEDS NO CORRECTION; ONLY THE CONTRACT'S RECORDED TALLY IS STALE, WHICH IS WHAT THIS LINE SAYS: the pin at the measured head is `11182` lines / `md5 519dd757a7e59ec1f95b856c90c82617` / **`113 passed (113)`** / the four fixture-register rows `held=true, broken=0`, and the whole suite is `3 failed \| 4601 passed \| 57 skipped (4661)` whose three reds are the CARRIED baseline (`P-SM-1` + `P-IM-pd-pin-1` + `pd-vendor-set` `§3.3` item 2) — **`RECORDED READING; measurer: the supervisor`**; the contract carries the same landing annotated at `§16.6`'s tally row / `§18.1`.⟩** |
| `R-13` | **PASS as SATISFIED** | the pin CARRIES the ambiguity reader + both named mutations (`⟨E-5⟩ empty the ambiguity list (2 offence(s)) · drop stage_multimount_reachability … (1 offence(s))`) — the contract's `§16.9` item 7 is superseded (as the filing found) |
| `R-14` | **PARTIAL** | all four `describe` titles exist and ran (`§4 P-IM-4`/`P-IM-5`/`P-SM-4`/`P-TP-3`) and every contracted value matches (`11`/`24`/`24`/`20`); the four records live in the **separate `UF_FIXTURE_DECLARED_CLASS_MINIMUMS`**, not in the landed `DECLARED_CLASS_MINIMUMS` |
| `N-1` | **PASS** | exactly the three carried baseline reds; counts moved `4657 → 4661` total with the pin's growth |
| `N-2` | **PASS (my wall)** | `git status --porcelain` shows `M docs/HANDOFF.md docs/decisions.md docs/defects.md docs/next-steps.md docs/pending.md docs/specs/unit-live-driver-verdict-integrity.md scripts/live-drive.mjs tests/live-drive-contract.test.ts` + the three untracked specs — **all the concurrent writer's**; my only write is this section |

## G6.7 THE DELTA AGAINST THE FILED TALLY (`13 PASS · 4 FAIL · 4 PARTIAL/NOT-EXERCISED · 1 PASS-with-FINDING`)

**NOW: `13 PASS · 7 FAIL · 2 PARTIAL`** (of the same `22` rows). *(`L-11` counted once, its verdict limb.)*
- **FIXED:** `L-3d`'s leak (the hazard path now refuses pre-spawn) · `L-5` and `L-8` (the `ROW`-form park exists and is distinguishable — exercised by leg (b)) · the `DIAG`-under-count of `§6.5`(e) (`1/34` where a `reportRows` count reads `0`) · `L-4`'s satisfiability (the contract adopted `§18.2`(b) and the instrument satisfies it) · `R-13` (the filed "FAIL vs the contract" is closed by the contract's own `§18.5` item 3) · `L-12`'s count-agreement sub-defect · `§16.9` item 3's stale `17` wording (see the `L-13` line).
- **PERSISTS:** `L-12` (block-level scoped-vs-battery disagreement; `§8.3` item 4 is NOT amended by `§18.2`) · `L-4`/`L-7` as filed (unsatisfiable/superseded readings, now amended rather than satisfied) · `R-2` (recorded pin tally does not reproduce at ANY of the three heads) · `R-8` (the `16`/`3 never-gated` figures — see `NEW-1`) · `R-14` (shape).
- **NEW (the most valuable part of this report):**
  1. **`NEW-1 — the sixth amendment's own corrected split is WRONG (`§18.3`). Doc drift, introduced by `§18`.** Live: legal-empty `rows` = `15` = **`13` GATED + `2` never-gated (`import1`, `ms_store`)** and the route split is **`21 ROW + 13 DIAG`**; `§18.3` says `12` gated / `3` never-gated (`stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`) and `22`/`12` — **while its own prose states that `tabs` carries `rows: []`**, which contradicts its own `12`-key list. The filing's original `§16.7` `21`/`13` route figure was RIGHT; `§18.3`'s "correction" moved it wrongly.
  2. **`NEW-2 — the `CONSEQUENCE` sentence is a CONSTANT at the FROZEN head. Un-hardened at `fe5ca5f1`; landed only at ≥ `6a68e9ed`.** At `fe5ca5f1` the line prints
     `CONSEQUENCE: a run whose fixture state is none reports every GATED declared corpus-dependent block PARKED BY NAME (…)` — the pre-`§6.5` universal, **contradicted in the same artifact by its own `OBSERVED SPLIT: parked=1/34 (… ran-with-own-verdict=33)`** — and `§6.5`'s fail-state (1) names exactly this. At `6a68e9ed`/`c09b28b2` the sentence is the derived, conditional, per-declared-fixture form (`… is PARKED BY NAME (…) IFF that block's OWN declared fixture probe reads ABSENT — the gate is PER DECLARED FIXTURE and CONDITIONAL, so a gated key whose own declared fixture probe reads PRESENT RUNS …`). **So "the consequence sentence is DERIVED and CONDITIONAL with a two-part scope" is TRUE of the post-freeze head and FALSE of the head I was given as FROZEN.** (The engine-family half is carried by the same line's `GATE SCOPE` clause, not inside the sentence.)
  3. **`NEW-3 — the park's "read that failed" is the RUN-WIDE read, labelled as the block's DECLARED-FIXTURE probe. Provenance mislabel, present at the frozen head.** The park text reads `the read that failed is rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT (the block own DECLARED FIXTURE probe, never the run-wide read)`. `… (--no-seed=true) — the seeded corpus is ABSENT` is **`ufBlockPrecondition`'s run-wide detail**; the declared-fixture probe (`ufFixturePreconditionRead`) formats `rag.list_documents -> 0 document(s) (the fixture "corpus-documents" own read)` — and the GREENs' own leg-(b)-era `toolbar_undo` park DID carry that form. Root cause read at the frozen head: the gate branch interpolates `pre.kind/pre.detail/pre.extra` (the run-wide read passed by the block loop) while its comment asserts *"`pre` IS ALREADY THE DECLARED FIXTURE'S PROBE inside this branch"*. **Value-identical today (all three corpus fixtures settle on the same read) — but the attribution is the one thing this unit exists to keep true, and it becomes a value bug the moment the probes diverge.**
  4. **`NEW-4 — process fact, not drift/regression: the head moved four times inside one gate** (`fe5ca5f1` → `6a68e9ed` → `c09b28b2` → `0c2271ae` → `e6407951`; pin `10809` → `11182`; spec `1508` → `1592`). Consequence: legs (b)/(c)/(d)/(e) are stamped to POST-FREEZE heads, and **the frozen revisions cannot be re-run from disk at all** (git `HEAD` holds a third revision).

## G6.8 `§6.1`-SHAPED SUMMARY BLOCK FOR THIS GATE'S BATTERY

```json
{"unit":"U-LIVE-FIXTURE-PRECONDITION-DECLARATION","gate":"gate-6 live re-run","layer":"HARNESS [D] / live process + node-static + node suite — NEVER app-green (RCA-12)",
 "mode":"live battery (frozen head) + 2 scoped runs + 3 malformed-arg legs + 1 ERROR-path leg + 1 single-block leg + pin + npm test",
 "ports":{"battery":{"port":3971,"cdpPort":9471},"scoped":{"port":3972,"cdpPort":9472},"seeded":{"port":3974,"cdpPort":9474}},"display":":0","fixture":{"state":"no fixture data set selected","kind":"none","id":"none"},
 "fixtureGate":{"declared":34,"parked":1,"ran":33,"split":"parked=1/34"},
 "total":22,"pass":13,"fail":7,"parked":0,"partial":2,
 "scenarioRows":{"L":{"total":15,"pass":9,"fail":5,"partial":1},"R":{"total":5,"pass":2,"fail":2,"partial":1},"N":{"total":2,"pass":2,"fail":0,"partial":0}},
 "coverage":{"scenariosExecuted":22,"scenariosNotRun":0,"legsExecuted":13,"appRowsVerdictedByThisGate":0},
 "note":"summary.pass/fail/parked partition ONLY this gate's executed scenario rows (the §3 L/R/N ids of this unit). They are NEVER app health, NEVER a §5.U row verdict, and NEVER a claim that any app row passes. The app's own rows are quoted verbatim where a contract expectation forced it (BOOT_LANDING/UF-STAGE-1) and dispositioned nowhere. No §5.U matrix is this gate's to verdict."}
```

**MANDATORY NOTE, repeated in prose: this block's `pass/fail/parked` counters partition ONLY the executed scenario
rows of THIS harness unit; they are never app health. A green in `L-*`/`R-*`/`N-*` proves the driver's own fixture
handling behaves as the contract describes (or does not) — nothing about the app. The `17 FAIL`s, `17 NOT-DRIVEN`s
and the three non-gate parks the battery printed are other rows' business and none is dispositioned here.**

## G6.9 WHERE THE DOCS ALONE AND THE LIVE SYSTEM DISAGREE (each labelled)

| # | Site | Live reading | Label |
| --- | --- | --- | --- |
| 1 | `§18.3`'s corrected `12`/`3`/`22`/`12` figures | **`13`/`2`/`21`/`13` AT THE CLOSE HEAD** (`scripts/live-drive.mjs` = `9109` lines), and `13`/`6` at the intermediate head (`9088` lines) this pass first read — a sibling pass POPULATED four entries' `rows` mid-pass, which is why the briefed `2` and this pass's first `6` are both correct readings of different heads | **DOC DRIFT** (in the sixth amendment itself; `§16.7`'s original `21`/`13` route pair was right) |
| 2 | `§6.5`'s required derived/conditional clause | constant at `fe5ca5f1`; derived at ≥ `6a68e9ed` | **UN-HARDENED at the frozen head / landed later** |
| 3 | The park's declared-fixture attribution | run-wide read labelled as the declared probe | **UN-HARDENED (report honesty)** — value-latent only |
| 4 | `§16.0` item 2 / `§16.6` pin tally `3 failed \| 106 passed (109)` | `113 passed (113)` at `11182`/`519dd757` | **DOC DRIFT** (head moved; the filing's `109` is a third reading) |
| 5 | `§16.9` item 3 (`LAUNCH PROFILE` measures `17`) | measures `34` with `17` labelled historical | **DOC DRIFT, already superseded** — the live reading is the FIX |
| 6 | `§16.9` item 7 (no ambiguity reader) | the reader exists | **DOC DRIFT, already superseded** |
| 7 | `§16.2`'s `landingAfter=false` | `landingAfter=true` | **DOC DRIFT in a recorded reading** (owner: app-layer `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`, not this unit) |
| 8 | `§8.3` item 1 (`34` park) & item 4 (scoped agreement) | `1/34` and a scoped-vs-battery disagreement | **DOC DRIFT (item 1, amended by `§18.2`(b)) / PERSISTING `§8.3` item 4** |
| 9 | `§16.9` item 9 / `§18.9` (`§16.7`'s `13`-key no-id list "carried `tabs` in error"; the route split is `22`/`12`) | the route split is `21 ROW + 13 DIAG` | **MIS-DIAGNOSIS BY THE CONTRACT, CORRECTED BY THE GATE-7 PROOFREADER — `§16.7`'s `13`-key list was RIGHT and `tabs` IS on the no-id `DIAG` route; what was wrong was the `22`/`12` pair `§18.3` introduced (see `§9` below and the contract's `§18.3`/`§20.2`)** |

**⟨ANNOTATED `2026-10-04` BY THE GATE-7 PROOFREADER — ROW `9` IS APPENDED, AND ROW `1`'s `13`/`2` FIGURE IS CORRECTED WITHOUT REWRITING THE ROW: `VERIFIED-BY-READ` (`reader: the Proofreader, this pass`, instrument: the file-read tool) over the landed `UF_FIXTURE_DECLARATION` literal, the never-gated keys carrying `rows: []` are **`6`** (`import1` · `ms_store` · `uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`), not `2` — so the empty-`rows` set is `13` GATED + `6` NEVER-GATED = `19` of the `47` entries.** **ROW `1`'s `21`/`13` ROUTE FIGURES ARE CONFIRMED AND ARE THE READINGS OF RECORD (they match the contract's `§5.4` `OB-0`, `§6.5` clause 1 and this ledger's own live lines); what `§18.3` printed (`22`/`12`) was the error.** **NOTE THE SELF-INCONSISTENCY IN THE FILED G6 TEXT FOR THE RECORD, SINCE IT IS THE REASON THE TWO FIGURES HAD TO BE MEASURED RATHER THAN INHERITED: `13` GATED + `2` never-gated would be `15`, which is the number `§18.3` states as its own total — the ledger's decomposition and its total never agreed.**⟩**

## G6.10 WHAT I DID NOT RUN, WITH ITS STRUCTURAL REASON (never a silent park)

| Item | Status | Structural reason |
| --- | --- | --- |
| **The pin at the FROZEN head** (`10809`/`a6634a47`, `109 passed`) | **NOT-RE-RUN** | the file was rewritten at `15:29:11` during leg (a) and git `HEAD` holds a THIRD revision (`0f4a03a0…`); **a superseded revision no longer exists on disk, and running a `git show` copy in place would edit the repo** |
| **The driver at the FROZEN head for legs (b)–(f)** | **PARTLY** | the driver was rewritten at `15:29:24` while leg (a) was in flight; `Node` had already loaded the frozen module, so **leg (a) IS the frozen head** and legs (b)–(f) carry the stamps in G6.0 |
| **`L-4`'s `34`-of-`34` park population** | **NOT OBSERVABLE at this design** | only `tabs` (4th block) parses before a self-provisioner supplies the store; the contract's own `§18.2` option (a) — a self-provisioner-disabling mode — is **OWED, not minted**. **NAMED CAUSE, not a park by default (`RCA-11`(b))** |
| **A DIVERGENT per-declared-fixture probe reading** | **NOT EXERCISABLE** | all three corpus fixtures settle on the SAME `rag.list_documents` read at this head (`§18.7` clause 3) |
| **`--strict-seed` / `--o0-corpus` / the O-0 artifact / `--connect` against a LIVE app** | **NOT-RUN** | outside this unit's subject (`§1.2`/`§1.3`) |
| **`npm run typecheck` / `npm run build`** | **NOT-RUN** | `scripts/live-drive.mjs` is in no trio leg (`§8.4`); the driver is built only as the app's launch dependency |
| **A `§5.U` matrix-with-verdict report (`D-GP-UFA`)` | **NOT EMITTED — structurally N/A** | this unit's scenario set is `L/R/N` (harness `[D]`); no `§5.U` row is this gate's to verdict. The battery's `MATRIX rows` line is quoted verbatim (G6.1) and NOT adopted |

## G6.11 THE HONEST LAYER STATEMENT

**Every green in this section is HARNESS `[D]` AT ITS CEILING AND IS NEVER APP-GREEN.** `L-*` proves the driver's
own fixture handling (declaration, per-declared-fixture gate, park naming, `DIAG` counting, arg refusal, the four
state sites); `R-*` proves source-derived figures/agreements; `N-*` is envelope/host and proves only that nothing
else broke — **`scripts/live-drive.mjs` is in no trio leg, so even `npm test` proves NOTHING about the driver**
(`§8.4`, verbatim). The `17 FAIL`s / `17 NOT-DRIVEN`s / three non-gate parks / the app's `MATRIX rows` verdicts in
leg (a) are **the app layer's and other rows' business**; I cite them only where they falsify a contract expectation
(`boot_landing`, `toolbar_undo`) and **I disposition none of them**. **A failure is a doc/spec drift OR an
un-hardened regression — never a pass.**

---
---

# 9. ⟨APPENDED `2026-10-04` BY THE GATE-7 PROOFREADER (`AGENTS.md` item 10b)⟩ THE AUDIT REGISTER — WHAT STILL HOLDS, WHAT THE CONTRACT MOVED UNDER THIS ARTIFACT, AND THE ONE ITEM THIS ARTIFACT'S OWN LEDGER GOT WRONG

**LAYER (`RCA-12`): DOC-LAYER ONLY — HARNESS `[D]` AT ITS CEILING, NEVER APP-GREEN, AND NOT A RE-RUN.** **NOTHING ABOVE THIS HEADING IS REWRITTEN, DELETED OR RE-DATED** (`RCA-8(c)`: annotate beside); **`§3`'s frozen expectations and `§4`'s readings keep every figure they were written with, INCLUDING the ones the contract has since superseded** — the annotations are at their own sites (`§3.1` `R-2`, `§3.2` `R-8`, `§3.1` `R-14`, `§3.4` `L-4`/`L-13`, `§3.5` `L-7`, `§G6.1`, `§G6.6`, `§G6.9`). **THIS PASS HOLDS NO SHELL AND RAN NOTHING: no leg, no battery, no suite, no `md5sum`, no `wc -l`.** **ITS INSTRUMENT IS THE FILE-READ TOOL: every line count and every figure it states as its own is a census it took over the file it names at the count's site (`reader: the Proofreader, this pass`); every driver/pin/suite figure it does not measure itself is a `RECORDED READING` quoted WITH ITS MEASURER.** **THE HEAD IS MOVING AND IS NAMED AS MOVING: a parallel Implementer pass edits `scripts/live-drive.mjs` in this same round (a park-attribution string), so the driver's own line count/digest is not this pass's to state, and the readings it quotes from the driver are STAMPED to the head they were taken at.**

## 9.0 THE HEAD THIS PASS READ, AND ITS STAMPS

| Artefact | As this pass read it | Instrument / measurer |
| --- | --- | --- |
| `docs/specs/unit-live-fixture-precondition-declaration.md` (the contract) | **`1594` lines at the start of this pass's write pass**, and **`1696` after its writes** (both counted with the file-read tool's own `total` line; the `1594` was ALREADY 2 lines past the `1592` the contract's own `§19.6` item 7 states, i.e. a sibling pass had written it) | file-read tool line census — **`VERIFIED-BY-READ`, `reader: the Proofreader`** |
| `docs/specs/unit-live-fixture-precondition-declaration-greens.md` (THIS artifact) | **`821` lines at the start of this pass, `886` after `§9` was appended** (both counted with the file-read tool's own `total` line; the `821` CORROBORATES the supervisor's briefed figure) | file-read tool line census — **`VERIFIED-BY-READ`, same reader** |
| `scripts/live-drive.mjs` (the driver) | **`9088` lines / `md5 e6407951b2c72b9dd9a2ff1121fb03af`** — **MOVING in this round** | **`RECORDED READING; measurer: the supervisor`** (this pass holds no shell, so no digest is takeable here) |
| `tests/live-drive-contract.test.ts` (the pin) | **`11182` lines / `md5 519dd757a7e59ec1f95b856c90c82617` / `113 passed (113)`**, four fixture-register rows `held=true, broken=0` | **`RECORDED READING; measurer: the supervisor`** |
| the whole suite | **`3 failed \| 4601 passed \| 57 skipped (4661)`** — the three reds are the CARRIED baseline (`P-SM-1`; `P-IM-pd-pin-1`; `pd-vendor-set` `§3.3` item 2), NONE of them this unit's | **`RECORDED READING; measurer: the supervisor`** |

## 9.1 THE FIGURES THIS PASS MEASURED ITSELF, WITH THE COMMAND THAT IS NOT AVAILABLE

**THIS PASS HOLDS NO SHELL, SO IT RAN NO COMMAND — THE COUNTS BELOW ARE FILE-READ CENSUSES, TAKEN BY READING THE NAMED SITE AND COUNTING ITS ENTRIES (`reader: the Proofreader, this pass`). THE EQUIVALENT SHELL COMMANDS ARE NAMED SO A SHELL-HOLDING PASS CAN RECHECK THEM (`grep -c "rows: \[\]" …` over the declaration literal; `wc -l` over each file) — NONE OF THEM WAS RUN HERE.**

| # | The count | The figure | The site it was counted at | Shell form a shell-holding pass would use |
| --- | --- | --- | --- | --- |
| 1 | entries in `UF_FIXTURE_DECLARATION` | **`47`** | the landed literal, entry by entry | `sed -n '/export const UF_FIXTURE_DECLARATION/,/^]/p' scripts/live-drive.mjs \| grep -c '^  { block:'` |
| 2 | entries carrying `rows: []` | **`15`** | the landed `UF_FIXTURE_DECLARATION` literal, entry by entry | `sed -n '/export const UF_FIXTURE_DECLARATION/,/^]/p' scripts/live-drive.mjs \| grep -c "rows: \[\]"` |
| 3 | GATED keys (of #2) with `rows: []` → the `DIAG` route | **`13`** = `tabs` · `v1_adjacency` · `v2_scoped` · `uf_panes_12_diag` · `shell_integration` · `v3_docnav` · `uf_tabs_7_diag` · `stage_doc_surface_precondition_diag` · the five `o0_*` | the literal + `UF_GATED_DECLARED_KEYS`' predicate (`corpusRead === true && selfProvisioning === false`) | filter the literal's entries by the predicate |
| 4 | GATED keys carrying a `rows` id → the `ROW` route | **`21`** (`34 − 13`) | the same | `34 − 13` |
| 5 | NEVER-GATED keys (of #2) with `rows: []` | **`2`** = `import1` · `ms_store` (**`6`** at the intermediate head this pass first read — the four others, `uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`, were POPULATED mid-pass) | the same | as #2 with the predicate negated |
| 6 | census keys an id is paired with in the tree's three sources | **`30`** = `47` − the `17` keys with NO id in `MATRIX_ROWS` ∪ `ROW_EXTENDED` ∪ `COVERED_ROW_BLOCKS` (the `17` = the `13` gated `DIAG` keys of item 3 + `import1` · `ms_store` · `stage_tabs_persist_roundtrip` (**mid-pass only**) · `user6_search_no_flicker` (**mid-pass only**) — **at the close head the last two are POPULATED, so the `17` becomes `15` and the complement becomes `32`, which is exactly what the pin's reader reads**) | `MATRIX_ROWS`, `ROW_EXTENDED`, `COVERED_ROW_BLOCKS`, counted by hand under the driver's own limb rules | **THREE RULES, TWO SIZES: this hand-count yields `30`, the pin's own reader reads `32` (this artifact's `§4.8` `R-4`/`§G6.6` `R-8`), and the declaration's non-empty-`rows` count at the close head is ALSO `32` (`47 − 15`). THE TWO EXTRA KEYS ARE `NOT RECORDED` (no evaluator on this pass's wall). What settles it: running the pin's reader at a frozen head.** |
| 7 | `MATRIX_ROWS` / `ROW_EXTENDED` / `COVERED_ROW_BLOCKS` sizes | **`8` / `34` / `36`** | the three literals | `grep -c` per literal |
| 8 | the four `§4 <P-ROW>` `describe` titles and their records | **all four exist** (`§4 P-IM-4` · `§4 P-IM-5` · `§4 P-SM-4` · `§4 P-TP-3`), their minimum records live in **`UF_FIXTURE_DECLARED_CLASS_MINIMUMS`** (a SEPARATE record from the landed `DECLARED_CLASS_MINIMUMS`) | the pin's own describes and literal | `grep -n "§4 P-IM-4\\|UF_FIXTURE_DECLARED_CLASS_MINIMUMS" tests/live-drive-contract.test.ts` |

## 9.2 THE ONE FIGURE THAT MOVED DURING THIS PASS (AND THE ONE THAT MOVED WRONG IN THE CONTRACT)

1. **THE NEVER-GATED `rows: []` DECOMPOSITION MOVED UNDER THIS PASS, AND THE PASS RECORDS BOTH ITS OWN READINGS.** At the intermediate head it first read (`scripts/live-drive.mjs` = `9088` lines) the empty-`rows` set was **`19`** = `13` gated + **`6`** never-gated (`import1` · `ms_store` · `uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`); at the head it closed at (`9109` lines) it is **`15`** = `13` gated + **`2`** never-gated (`import1` · `ms_store`), because a sibling pass POPULATED the four other entries' `rows` arrays. **THE `§G6.6`/`§G6.9` `2` IS THEREFORE RIGHT AT THE CLOSE HEAD and was an UNDER-COUNT mid-pass; the briefed `13`/`2` was right when it was briefed; NOTHING IS SMOOTHED.** **ANNOTATED AT `§3.2` `R-8`, `§G6.6` `R-8` AND `§G6.9` ROW `1`, SUPERSEDED FIGURES KEPT VISIBLE.**
2. **RIGHT, AND IT IS THE MOST VALUABLE FIGURE IN THIS ARTIFACT: the route split `21 ROW + 13 DIAG` — UNMOVED BY THE HEAD MOVEMENT.** The `§G6.6` `R-8` line measured it live and it is the READING OF RECORD at BOTH heads (the `34` gated keys split `21` carrying a declared `rows` id and `13` carrying `rows: []`, and the four entries the sibling populated were never-gated or already `ROW`-route). The contract's `§18.3` printed `22`/`12` (and `§16.7` the same pair), and `§18.3`'s own prose already implied the `21`/`13` (`tabs` carries `rows: []`). **THE CONTRACT IS CORRECTED AT `§18.3`/`§16.7`/`§16.9` item 5/`§16.10(c)`/`§13` item 8/`§17.7(d)`/`§8.4`'s class-(b) row, each annotated beside; the live ledger needed no change.**
3. **RIGHT: `R-2`'s `113 passed (113)` @ `519dd757…`/`11182`.** It matches the supervisor's measured head; **the contract's `3 failed \| 106 passed (109)` belongs to the `9512`-line pin** (`§16.0` item 2) and the pin's `109 passed (109)` @ `10809`/`a6634a47…` (`§G6.0`) is a third, intermediate head. **A stale recorded tally, annotated in the contract at `§16.6`'s tally row and `§18.1`.**
4. **RIGHT: `R-14`'s shape reading.** The four `describe` blocks and their values exist; they live in a SEPARATE record (`UF_FIXTURE_DECLARED_CLASS_MINIMUMS`), not in the landed `DECLARED_CLASS_MINIMUMS` that the contract's `§11.2.5` clause 2 asked the TestWriter to extend — **the `?? {}` hazard the contract names does not bite, so the obligation is MET and the difference is SHAPE ONLY.**
5. **RIGHT: `L-13`.** The contract's `§16.9` item 3 / `§17.5` item 3 relabelling was OWED when this artifact froze the expectation and has since LANDED: the `LAUNCH PROFILE` clause now prints the gate's `34` and NAMES the historical `17` as historical. **THE FILED EXPECTATION IS SUPERSEDED BY THE FIX, NOT BY A REGRESSION — this artifact's `§G6.6` `L-13` line already says so.**
6. **RIGHT: `L-4`/`L-7`'s FAIL verdicts.** Their frozen readings were correct against the pre-amendment `§8.3`; the CONTRACT then amended the acceptance reading (`§18.2`: option `(b)`, the derived observed split) so the readings are now compliant. **THE FAIL VERDICTS STAND AS THE RECORD OF WHAT THE PRE-AMENDMENT CONTRACT PREDICTED.**

## 9.3 THE CONTRACT-SIDE ITEMS THIS PASS FIXED BESIDE (each annotated at its own site in the contract)

1. **`§18.3`'s route figures** — `22`/`12` → reading of record `21`/`13` (`34 − 13`), with `tabs` on the `DIAG` route; the table's legal-empty and id-carrying cells annotated with BOTH readings of the declaration literal (`15` at the close head = `13` + `2`; `19` mid-pass = `13` + `6`) and with the TREE-SOURCE population (`32` per the pin's older reader; the two populations' disagreement is `§16.9` item 2's filing).
1b. **A NOTE FOR THE CONTRACT'S `§16.9` ITEM 2 AND `§20.8` ITEM 12** — the declaration now carries `rows: ['UF-DEFECT-7']` and `rows: ['UF-PANES-14']` for `stage_search_open_in_tab` and `uf_panes_14` at the close head, so the declaration-vs-tree divergence that item filed is CLOSED at this head for those two keys; **whether the pin grades it remains `NOT RECORDED` here** (a `tests/**` read this pass did not complete).
2. **`§18.9`/`§16.9` item 9's mis-diagnosis** — `§16.7`'s `13`-key no-id list was RIGHT; no key ever "moved"; **the `12`-key list was the error, and `tabs` remains on the `DIAG` route.**
3. **`§16.9` item 2's "limb (d) IS DONE"** — the pin's declared-row reader now unions `blocks` on its `ROW_EXTENDED` limb, which is the DRIVER's rule; **the declaration-vs-tree divergence the item's example filed (`stage_search_open_in_tab`, `uf_panes_14`) is CLOSED at the close head** (both entries' `rows` arrays are populated and agree with the tree's three sources). **`NOT RECORDED` HERE: whether a PIN ARM grades that agreement** — a `tests/**` read this pass did not complete; **owner: the TestWriter; what settles it: an `A-4`/`D-4` limb asserting the declaration's `rows` against the tree's own declared-row oracle.**
4. **the driver-print labels** — `ran-with-own-verdict=` → `eligible-and-not-parked=` printed BESIDE `blocksRun=`; `parked=N carried the fixture-absent park` → `parked=N` with `parked-by-the-fixture-gate=` beside it. **EVERY SITE IN BOTH DOCS THAT QUOTED THE OLD LABELS IS ANNOTATED, THE QUOTATIONS KEPT VISIBLE.**
5. **the `CONSEQUENCE` sentence** — the constant/universal form quoted by `§4.3` of this artifact belongs to the FROZEN head (`fe5ca5f1`); **the LANDED driver prints the derived, conditional, per-declared-fixture form WITH the throw-path exception** (`UF_FIXTURE_STATE_CONSEQUENCE`), which is `§6.5`/`§19.5`'s contract. **ANNOTATED AT THE QUOTATION, WITH THE HEAD EACH FORM BELONGS TO.**

## 9.4 WHAT THIS PASS COULD NOT SETTLE (stated, not hidden)

1. **NO DIGEST AND NO LINE COUNT OF THE DRIVER OR THE PIN IS THIS PASS'S TO STATE.** It holds no shell and the driver is MOVING in this round (a parallel Implementer pass). **What settles it: a shell pass (`md5sum`, `wc -l`, `npx vitest run`) at a frozen head.**
2. **WHETHER `--home`'s NEW BOUND AND THE PRE-SPAWN PORT REFUSAL ARE GRADED BY THE PIN.** `VERIFIED-BY-READ`: the driver carries `ufHomeArgOffence` (bounded to `tmpdir()` before anything is spawned) and `ufPortArgOffence` (a decimal-integer/range refusal pushed to `opt.badPortArgs`), and the `ARG-REFUSED` print at the home path states the bound in terms. **Whether an ARM asserts either is a `tests/**` read this pass did not complete** (the pin is `11182` lines and the relevant register rows are `F-8`'s countermeasure in the contract's `§19.6` item 6). **What settles it: the pin's own arms read at a frozen head.**
3. **THE SUPERVISOR'S BRIEFED DECOMPOSITION OF THE EMPTY-`rows` SET (`13` GATED / `2` NEVER-GATED) DOES NOT MATCH THE TREE.** Recorded as a reading: **`RECORDED READING; measurer: the supervisor (the briefing to this pass)`**; **the measurement is `13`/`6`** (item 5 of `§9.1`). **The brief's own arithmetic is the tell (`13 + 2 ≠ 15`); the ROUTE figure it gave (`21 ROW + 13 DIAG`) IS confirmed and IS the reading of record.**
4. **THE CONTRACT'S `§19.6` ITEM 7 LINE COUNT (`1592`) IS STALE.** This pass's file-read census reads **`1594` BEFORE any write of its own** — i.e. a sibling pass wrote the contract between that paragraph and this one (2 lines added, no marker for them found). **RECORDED, NOT GUESSED: what settles it is the sibling pass's own record.** **THE CONTRACT'S COUNT AFTER THIS PASS'S OWN WRITES IS `1698`** (`VERIFIED-BY-READ`: the file-read tool's own `total` line for the contract at the end of this pass's writes; instrument named, `reader: the Proofreader, this pass`; the contract's own `§20.9` item 4 carries the count as this pass closed it, corrected there in place from the `1696` it stated a moment earlier). **THE SAME FILE'S `sha256` STAYS `OWED` (`§12` item 4) — this pass holds no shell.**
5. **THE IDENTITY OF THE `2` KEYS BEHIND THE `30`↔`32` DECLARED-ID DIFFERENCE (`§9.1` item 6).** The SIZE is recorded by three rules and they do not agree: **`30` by this pass's hand-count of `MATRIX_ROWS` ∪ `ROW_EXTENDED` ∪ `COVERED_ROW_BLOCKS` under the driver's own limb rules; `32` by the pin's own reader (this artifact's `§4.8` `R-4`); `32` also by the declaration's own non-empty-`rows` count at the close head (`47 − 15`).** **The two keys behind `30` → `32` are `NOT RECORDED`** — naming them needs the pin's evaluator run, which this pass's wall does not allow, and this pass's hand-count does not reproduce the pin's `32`. **WHAT SETTLES IT: running the pin's reader (or evaluating the three literals) at a frozen head.**
6. **WHETHER THE `--home` BOUND AND THE PRE-SPAWN PORT REFUSAL ARE GRADED BY ANY PIN ARM.** `VERIFIED-BY-READ`: the driver carries both refusals in the source. **Whether an arm asserts them is a `tests/**` read this pass did not complete** (the relevant register rows are the contract's `§19.6` item 6 / `§19.3` `F-8`). **What settles it: the pin's arms read at a frozen head.**
7. **THE DRIVER MOVED UNDER THIS PASS, SO EVERY DRIVER READING ABOVE CARRIES TWO STAMPS.** The intermediate head is `scripts/live-drive.mjs` = **`9088` lines** (the supervisor's briefed head); the close head is **`9109` lines** (this pass's file-read census), the `+21` lines being FOUR `UF_FIXTURE_DECLARATION` ENTRIES WHOSE `rows` ARRAYS A SIBLING PASS POPULATED (`uf_panes_14` · `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`). **THE ROUTE SPLIT IS UNMOVED ACROSS THEM (`21 ROW + 13 DIAG`); THE NEVER-GATED `rows: []` COUNT MOVED `6` → `2`.** **No digest is takeable on this pass's wall; what settles the digests is a shell pass.**
