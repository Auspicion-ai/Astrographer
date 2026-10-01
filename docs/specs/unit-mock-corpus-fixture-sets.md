# Unit `U-MOCK-CORPUS-FIXTURE-SETS` (**PROPOSED**) — **UNIT B of the fixture work**: the **HAND-AUTHORED MOCK DATA SETS** themselves, the **LAUNCH-SELECTION ARG** that picks which set the live demo launches with, the **DIVERGENT PER-DECLARED-FIXTURE PROBES** that discharge the recorded `F-2`, the **OBSOLETE ROUTE'S DISPOSITION**, and the **RUN'S DECLARATION OF ITS FIXTURE** — Spec

**Status: FILED + AMENDED AT THE GATE-2 SPEC-REVIEW LOOP (`SPEC-NEEDS-AMENDMENT`, EIGHT BLOCKING + EIGHT NON-BLOCKING
FINDINGS — ALL CLOSED ANNOTATE-BESIDE; the register of every finding and its disposition is `§16`).** The filed text of
this file is **KEPT VISIBLE AND DATED** throughout: the gate-2 pass **rewrote no clause in place**, it **superseded the
losing reading where two contradicted**, marked it, and **re-derived every dependant figure** (`§16.1`–`§16.16`, plus the
re-derived inventory at `§16.17`). **THE VERIFIED-CLEAN ITEMS THE REVIEW LEFT UNTOUCHED, NAMED SO A LATER PASS DOES NOT
RE-OPEN THEM: `§10.2`'s register arithmetic (`17 + 12 + 11 + 27 = 67`, executed `57`, the three caps, the seed
`0x20261005`); the `F-2` falsifier (`§5.5`) — a genuinely falsifiable predicate **⟨READ WITH `§18`'s AMENDMENT: the
PREDICATE STANDS, ITS FIRST LIMB'S READ POINT IS NOW DEFINED (`§18.2`)⟩**; the engine-ruling compliance (`§8`); the
Unit-A consistency (`§1.3`); and the ADOPTION-DOSSIER VERDICT — see the head of `§16`, where it is stated explicitly.**

**⟨GATE-2 THIRD LOOP `2026-10-05` — ONE BLOCKING FINDING, CLOSED ANNOTATE-BESIDE AT `§18`; THREE RESIDUES PARKED WITH A
RECORDED DECISION AT `§18.7`; NO FOURTH AMENDMENT ROUND IS OWED.⟩** **THE FINDING: `§5.5`'s `FA-2` and `§11.3` item 4 (against
`§5.2` clause 3 and item 1's `class-(b):tabs`) required the `--fixture=tabs` run to behave in TWO MUTUALLY EXCLUSIVE ways
at once — the `'corpus-query-results'`-gated keys RUN *and* those same keys PARK by fixture-absence — so the two arms
could not both be green and **THE CONTRACT COULD NOT BE FROZEN** on it.** **THE CLOSING SHAPE IS THE REVIEWER'S OWN AND IT IS
ADOPTED: `§18.1` DEFINES THE PROBE'S READ POINT (a stated, defined PRE-GESTURE point) and `§18.2` GIVES
`'corpus-query-results'` A **DISCRIMINATING LIMB** THAT SEPARATES `search` FROM `tabs`: FOR THAT NAME THE OPERATIVE
`present` FACT IS **THE STORE QUERY FOR THE PROBE'S OWN TERM** (`read` literal `'rag.query'`), **NOT THE PAINTED ROWS** —
the DOM read of `#pane-search li[data-document-id]` is `SUPERSEDED` as that name's operative limb and is kept visible,
while it REMAINS THE OPERATIVE LIMB of `'corpus-document-tabs'` (`'dom:#tab-strip .tab[data-document-id]'`), whose axis
genuinely IS the rendered strip.** **RE-STATED AT THEIR SITES, EACH WITH ITS SUPERSEDED TEXT KEPT VISIBLE AND DATED:
`§5.2`'s sentinel table's `'corpus-query-results'` row and its probe table's read cell · `§5.1`'s one-sentence contract
(`§18.2` clause 6) · `§5.5`'s `FA-2` row · `§11.3` item 4 · `§11.3` item 1 · `§16.3`'s sentinel ruling · `§16.8`'s
`probe-read:corpus-query-results` row · `§16.17` item 4 · `§10.2.3`'s `3×probe-read` prose · `§11.2`'s `PROBE-READ` row ·
`§15`'s `the probes` glossary cell · `§13.3` item 7(c).** **THE TWO ACCEPTANCE READINGS ARE NOW DERIVABLE WITHOUT
CONTRADICTION AND ARE WRITTEN AS FALSIFIABLE PREDICATES AT `§18.6`.** **NO REGISTER FIGURE MOVES (`§18.6`).**
**AND THE THREE RESIDUES ARE PARKED, NOT FOURTH-ROUNDED (`§18.7`) — the last of them (`(c)`) IS the residue the
`--fixture=tabs` PROSE TALK OF *"PAINTING"* LEAVES BEHIND; the two others are `§5.2`'s second probe-table row's selector
spelling (residue `(a)`) and `§17.2`'s `16 + 18 = 34` versus `§16.17` item 2's `16 + 9` (residue `(b)`).**

**⟨GATE-3 AMENDMENT `2026-10-05` — ONE SURGICAL STRING MOVE, NO FIGURE MOVED: `§10.2`'s `P-TP-5` row is re-spelled so its
`10×class-(b)` term is the LAST term of the DEEPEST group, which makes `§10.2.3`'s own IDENTITY
`declaredLastTermOf === declaredClassB` TRUE of the row (`10 === 10`) WITH NO CARVE-OUT — where the gate-2 note's claim
*"all four already satisfy the identity (`0`/`0`/`0`/`10`)"* was FALSE on its `10` limb against the string this spec pinned
verbatim (`2 !== 10` under the pin's own `declaredLastTermOf`, `VERIFIED-BY-READ`). THE REGISTER IS UNMOVED: `P-TP-5` `27`
declared / `10` class-(b) / `17` executed; `17 + 12 + 11 + 27 = 67`; EXECUTED `57`; the caps and the seed `0x20261005`.
THE SUPERSEDED SPELLING AND THE SUPERSEDED CLAIM ARE KEPT VISIBLE AND MARKED `SUPERSEDED` AT EVERY SITE THAT CARRIED THEM
(`§10.2`'s table and this §10.2.3 block · `§10.3` clause 6 · `§16.10` · `§16.14` clause 1 · `§16.17` item 7 · `§17.10` ·
`§17.12` item 9 · `§18.4` · `§18.6` clause 4 · `§14` items 1/2 · `§17.13` item 14 · `§18.8` item 1). THIS IS A DOC-LAYER
PASS: read/search + doc-writes, RAN NOTHING, touched no `tests/**`, `scripts/**` or `src/**` byte — the pin's own register
literal and its `P-TP-5` conflict carve-out are `OWED` to the TestWriter (`§10.2.3`'s gate-3 block, item 7), and the file's
post-amendment `sha256`/`md5` are `OWED` again at `§14` item 1.⟩**

**⟨GATE-4 AMENDMENT `2026-10-05` — ONE FIGURE RECONCILED: THE PER-NAME CENSUS FIGURE FOR `'corpus-documents'` IS **`31`**, NOT
`25`; NO OTHER FIGURE MOVES.** **THE RULING APPLIED IS THE ARCHITECT'S, TAKEN ON THIS PASS'S MEASURED EVIDENCE.** **THE
EVIDENCE:** the landed `export const UF_FIXTURE_DECLARATION` in `scripts/live-drive.mjs` reads **`47` entries · `3`
`corpusRead:false` · `9` `selfProvisioning:true`** → the gated population **`47 − 3 − 9 = 35`**, and **among those `35`
gated entries the `fixtureName` census reads `'corpus-documents'` `31` · `'corpus-query-results'` `3` ·
`'corpus-document-tabs'` `1` = `35`** — that measured census is a **`RECORDED READING` (measurer: the supervisor's own
shell, on this pass's evidence)**; the **PRE-LANDING head** (`git show f124358:scripts/live-drive.mjs`) reads
**`'corpus-documents'` `30`**, and the `§17.1` column-move (`u_edit_1_live_package_table_limitation` → `corpusRead:true`,
`selfProvisioning:false`, `fixtureName:'corpus-documents'`) takes it **`30 → 31`** — the SAME `+1` shape the filed clause
states, at a different base (**`RECORDED READING`, same measurer**). **THE FILED FIGURE `25` IS `SUPERSEDED` AND IS KEPT
VISIBLE AT EVERY SITE THAT CARRIED IT: `25 + 3 + 1 = 29`, which closes with NOTHING against the `35` the arms assert;
`31` closes exactly.** **THE AUTHORITY WAS THE ENUMERATION, NOT THE FIGURE: this file's own EXHAUSTIVE enumeration at
`§16.17` item 2 (*"THE GATED `'corpus-documents'` KEYS, EXHAUSTIVELY"*, the list `§16.10` calls the authority) reads `31`
— the figure's own authority, and `§17.12`'s phrase *"`§16.17` item 2's **25-entry** enumeration"* was likewise FALSE of
the text as written.** **THE DECOMPOSITION CLAUSE'S OLD ARITHMETIC (`25 = 24 + 1`, and *"`16` hand-listed + `9`
entered"*) IS `SUPERSEDED` WITH IT: the `25 = 24 + 1` form rests on the stale base, and the `16`-hand-listed sub-count
CANNOT BE RE-DERIVED from the enumeration as written (`16` is `OWED` to whoever re-takes it).** **WHAT IS STATED IN ITS
PLACE, AND WHAT IS THE OPERATIVE FORM: `31 = 30 + 1` (`30` = the entry count recorded at HEAD on this pass's evidence,
`1` = the `§17.1` column-move).** **EVERY OTHER FIGURE IS UNMOVED:** the population `35`, the `47`, the `3`, the `9`, the
register (`17 + 12 + 11 + 27 = 67`, executed `57`, the three caps, the seed `0x20261005`), the `27`/`10`/`17` terms, the
five set names, the probe literals and every other census. **THE SITES AMENDED ARE ENUMERATED, EACH WITH ITS SUPERSEDED
TEXT KEPT VISIBLE, AT `§20`; and `RCA-8(c)`'s ANNOTATE-BESIDE DISCIPLINE IS OBSERVED THROUGHOUT — NOT ONE FILED CLAUSE IS
REWRITTEN IN PLACE.** **THIS IS A DOC-LAYER PASS: read/search + doc-writes, RAN NOTHING (no suite, no leg, no battery, no
`md5sum`/`sha256sum`, no `wc -l`), and touched no `scripts/**`, `tests/**` or `src/**` byte. THE FILE'S `sha256`/`md5`
REMAIN `OWED` (`§14` item 1) AND ITS POST-AMENDMENT LINE COUNT IS `OWED` (`§20` clause 4) — THIS PASS HOLDS NO SHELL.**⟩**

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THE UNIT'S DOCS AUDITED AGAINST THE CODE AT THE LANDED HEAD; THE FULL REGISTER IS `§23`, AND IT IS WHERE THE SITES THE GATE-5 RULING PREDICTED WOULD GO STALE ARE NOW MARKED.** **IT REWRITES NOT ONE CLAUSE IN PLACE (`RCA-8(c)`) AND RAN NOTHING.** **THE HEAD IT STAMPS: `scripts/live-drive.mjs` · `9681` lines (`VERIFIED-BY-READ`) · `md5 1b7d9cd8e644525d0b1de354c881ff2b` (`RECORDED READING; measurer: the supervisor`); the pin `tests/live-drive-contract.test.ts` · `17066` lines (`VERIFIED-BY-READ`) · `md5 19af3936fbd390f8f2b998fa5897d13a` · `0 RED / 57 GREEN`, its four third-register rows HELD (`RECORDED READING; measurer: the supervisor`); the whole suite `Test Files 131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed` (`RECORDED READING; measurer: the supervisor`).** **THE LANDED READINGS THAT REPLACE THE `0 hit(s)` / parked-`table` readings `§22.1` answers: `rag.query` reads `3 hit(s)` under `core`, `4` under `tabs`, `0` under `search`; the `--fixture=table` row reads `verdict=PASS` with `rendered table census {"tables":1,"trs":1,"tds":4}`; the two-supply refusal NAMES each supplied flag beside the family list.** **THE `dom:#tab-strip .tab[data-document-id]` LIMB STAYS `SKIPPED-BY-RULING` AND IS NOT A PASS; the `F-2`-closure claim may NOT be reported as discharged for it.** **IT EDITS NO TRACKER FILE (`docs/next-steps.md`, `docs/decisions.md`, `docs/pending.md`, `docs/defects.md`, `docs/HANDOFF.md`) AND EDITS NO `scripts/**`, `tests/**` OR `src/**` BYTE.**⟩**

**⟨GATE-5 AMENDMENT `2026-10-05` — THE GATE-5 BLIND GREENS' FOUR **DOCUMENTATION** DEFECTS (`D-1` `D-2` `D-3` `D-4`), EACH CLOSED ANNOTATE-BESIDE; THE FULL REGISTER IS `§21`.** **THE ARTIFACT IS `docs/specs/unit-mock-corpus-fixture-sets-greens.md` (`568` lines at this pass's read of it — `100` frozen rows, `+3` disclosed post-freeze rows; the `568` is this pass's own census and is kept visible, and the gate-7 proofread pass of `2026-10-05` later annotated eleven sites there, its own close census being `578` lines, `VERIFIED-BY-READ` at that file): `D-1` = the `main().catch` site contradicts itself (`§7.2` clause 4's *"reads the same binding"* vs the gate-2 note / `§16.5`'s absolute *"every early site prints `none` … including the `main().catch` ERROR line"*), measured as `fixture={"state":"mock data set core selected","kind":"mock-data-set","id":"core"}` on a post-assignment abort (greens `F-8`/`F-9`, evidence row `F-10`) · `D-2` = the two-supply refusal names the flag FAMILY, not the offending flag (greens `B-1`) · `D-3` = the `stage_*` figure `eight` contradicts the contract's own authority, which counts `7` (greens `H-9`, fail ledger `F-4`) · `D-4` = the fixture DATA literal is unnamed, so the set-content rows are underivable from the document (greens `C-1`…`C-8`).** **THE RECONCILIATION, ONE LINE EACH: *THE BINDING'S ORDER IS THE RULE* (`§21.1`) · *THE OFFENDING FLAG IS A NAMED REQUIREMENT*, with the landed family-list line recorded as an `OWED` implementer finding (`§21.2`) · *`7 + 5 = 12`, remainder `19`*, the enumeration ruling on the `§20` precedence (`§21.3`) · *`UF_MOCK_FIXTURE_SETS` NAMED, WITH ITS SHAPE* (`§21.4`).** **THE GREENS' OTHER FOUR FINDINGS (`D-5`…`D-8`) AND ITS `F-1`/`F-3`/`F-5` FAILs ARE **NOT** THIS PASS'S AND ARE NOT TOUCHED — each is named with its owner at `§21.5` clause 2, and the `F-1`/`F-2`-discharge item stays the landing pass's, because a behaviour reading falsified by a run is not repaired by re-wording this file.** **NO FIGURE OF THE REGISTER, THE CAPS, THE SEED OR THE CENSUS MOVES; NO SECTION IS RENUMBERED; NOT ONE FILED CLAUSE IS REWRITTEN IN PLACE (`RCA-8(c)`); THIS PASS RAN NOTHING AND TOUCHED NO `scripts/**`, `tests/**` OR `src/**` BYTE; AND ITS OWN POST-AMENDMENT `sha256`/`md5` AND LINE COUNT REMAIN `OWED` — the head this pass received was `md5 23b3fa5eaeee2e6f73b103f3e515ae7b` / `3041` lines (`RECORDED READING` of the pass that supplied it; the greens' own source table records the same `3041` line census).**⟩**

**⟨GATE-5 RULING `2026-10-05` — THE ARCHITECT'S ADAPTATION RULING ON THE BLIND GREENS' `F-1` AND `F-3`, AMENDED ANNOTATE-BESIDE; THE FULL REGISTER IS `§22`.⟩** **THE RULING, VERBATIM (the authority of this pass):** ***"Adapt the mock data to function with the query. If the tabs are awaiting a later unit to adapt to the foundation tooling then skip testing."*** **THE THREE ITEMS IT DECIDES: (i) THE MOCK SETS' DOCUMENT CONTENT MUST BE ADAPTED so its term actually reaches the store's lexical index and `rag.query` for the probe's own constant term returns `>= 1` hit under `--fixture=core` (`§18.6` clause 3's `FA-4` control) — the acceptance READINGS of `§11.3` item 1 and `§18.6` clause 3 are UNCHANGED and only the DATA's FORM moves; (ii) the `dom:#tab-strip .tab[data-document-id]` limb IS **SKIPPED-BY-RULING** with its reason recorded (the tab strip is a fork UI implementation being rebuilt on the foundation tooling — `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`, exempt from regression testing, automatic AND live; the adopting unit is `docs/specs/unit-zone-replacement.md`), so it is **NOT a pass** and the `F-2`-closure claim of `§5.5` may NOT be reported as discharged for that limb; (iii) the `table` set's `P-β` raw-`<table>`-literal requirement is `SUPERSEDED` in favour of the parser-mediated GFM pipe-table form the app actually preserves, and `§16.11`'s acceptance predicate (`class-(b):table` MUST REJECT a `PARK`) is unchanged.** **THE GREENS' RECORDED READING THIS RULING ANSWERS — `rag.query` under every set reads `0 hit(s)` even for the bare stopword-free term, with `9` nodes of which `3` carry the term: the document content is not reaching the lexical index (`9 nodes, 3 carrying the term, every query 0`), and the `dom:` probe reads `0 rendered row(s)` in every run because `data-document-id` exists in the renderer's PANES authoring (`src/renderer/pane-graph.ts`) and never on `#tab-strip .tab` (`src/renderer/tab-strip.ts` authors `data-tab-id` + `data-target-kind`).** **WHAT THIS PASS DOES **NOT** TOUCH: the ten `class-(b)` readings' TEXT (`§11.3` item 1's PRESENT readings stand), the `F-2` falsifier (`§5.5`), the register (`17 + 12 + 11 + 27 = 67`, executed `57`), the caps, the seed `0x20261005`, and the census figures `47` · `3` · `9` · `35` · `31` · `3` · `1`. THIS IS A DOC-LAYER PASS: read/search + doc-writes, **RAN NOTHING**, and touched no `scripts/**`, `tests/**` or `src/**` byte. THE FILE'S POST-EDIT LINE COUNT AND ITS `sha256`/`md5` ARE `OWED` (`§14` item 1, `§22.5` clause 1).**

This file is
written by the **SpecDoc** from an architect ruling (not from a fresh proposal): the authority is
`docs/decisions.md`'s `DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG`, read with the same-day engine sequencing row
`DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL` and under the standing
`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`, **whose REQUIRED test set NAMES the mock document corpus** and therefore makes
this unit a **TESTING PREREQUISITE, not a nicety** (the amendment's own reading of UNIT B, quoted in `docs/next-steps.md`'s
amendment insert and repeated at the `UNIT B` owed items of its archiving inserts). **THIS FILE RE-DECIDES NOTHING.**

**THE UNIT ID IS `PROPOSED`.** `U-MOCK-CORPUS-FIXTURE-SETS` is this filing's id for **UNIT B** of the split that
`docs/specs/unit-live-fixture-precondition-declaration.md` (`§0.2` clause 5) names — *"UNIT B (later, a separate unit) =
the mock DATA SETS themselves + the selection arg + the obsolete set's disposition"* — extended, at the gate-8 anchored
insert of `docs/next-steps.md`, with **the per-declared-fixture probes** (that insert's own `UNIT B` owed item: *"the
data sets + the selection arg + the two probes"*). **Its minting authority is the architect's.** It is a
**driver/instrument unit**: no `PD-UI-` slot is consumed, no page-design inventory is consulted, and no wave is claimed.

**Citation discipline of this file: NO LINE NUMBER APPEARS ANYWHERE IN IT.** Every citation is a `path` + a symbol / a
block key / a row id / a `§section`. **Every figure is either a read this filing took (`VERIFIED-BY-READ`, reader: the
SpecDoc) or a recorded reading of another pass (`RECORDED READING`, measurer named), or it is labelled `OWED`.** Where
the records are silent the cell says `NOT RECORDED` and names what settles it.

**THE DECISIONS THIS FILE CARRIES AS ITS OWN, STATED SO THEY ARE NOT MISTAKEN FOR THE ARCHITECT'S.** Five contract-level
calls are this filing's, each made **only where the authorities are silent and each recorded with its ground and its
risk**: **the data sets' NAME SET and their content shape** (`§2`) · **the materialisation root and the document-IDENTITY
scheme** (`§2.4`, with its re-pin set) · **the selection arg's NAME, grammar and neutral default** (`§3`) · **the probes'
reads** (`§5`) · **the pre-spawn refusal for an obsolete-route flag combined with a selected set** (`§6.4`). Each is
marked **`SPEC-CALL`** at its site. **Nothing here contradicts a ruling; where a ruling is silent this file chooses and
says so.**

---

## 0. The state this unit exists to clear, and the two halves of it

### 0.1 What UNIT A delivered, and the two things it left open BY NAME

**UNIT A (`U-LIVE-FIXTURE-PRECONDITION-DECLARATION`, contract `docs/specs/unit-live-fixture-precondition-declaration.md`,
DONE row at the head of `docs/next-steps.md`) delivered, in its own words (`§1.1`):** the **census** of corpus-reading
`BLOCKS` keys (`47` keys), the **fixture DECLARATION** (`UF_FIXTURE_DECLARATION`, one entry per censused key, `47`
entries) with its **checkable derivation**, the **park discipline** (`RCA-11` clause (b) honesty: a block whose declared
fixture is absent parks **by name**, carrying its **declared row id(s)** and a `parkReason` naming **its own declared
fixture**), and the **run-wide fixture state** (`UF_FIXTURE_STATE`, printed at four sites).

**UNIT A is explicit that it authors no fixture** (`§1.4`, `§9` items 1/2/3): *"UNIT A authors NO data set, adds NO
selection arg, and touches the obsolete seed route only to NAME it obsolete."* **UNIT B is the half that supplies the
thing.** So a fixture-absent run at this head is not a defect — it is the state UNIT A made honest, and it is the state
this unit ends for the sets it authors.

**UNIT A's `OB-1` (`§5.4` clause 1) hands this unit the DATA-SET REQUIREMENTS BY NAME** — *"UNIT B's data sets must name,
per row, the document property the row needs"* — and names three: **a document with a stored `<table>`** (its `§5.2` row
`35`, `u_edit_1_live_package_table_limitation`), **a document with an inline element outside the decomposer's set** (row
`31`, `u_edit_1_live_commit_failure_warning`), and **two documents whose titles carry the alpha/beta names the driver's
selectors use** (rows `18`, `22`), *"or a re-pin of those selectors under the re-statement discipline"*. **`§2` of this
file discharges all three, plus the fourth requirement `OB-1` states in the bulk of its `FM` class: a set that makes the
panes / search / history rows drivable at all.**

### 0.2 The two open items UNIT A left with UNIT B as their named owner

| # | The item | Where UNIT A records it | What this file does with it |
| --- | --- | --- | --- |
| **F-2** | **THE PER-DECLARED-FIXTURE CONJUNCT IS BEHAVIOURALLY INERT.** `'corpus-documents'` · `'corpus-query-results'` · `'corpus-document-tabs'` **each carry `read: 'rag.list_documents'`** in the landed `UF_DECLARED_FIXTURE_PROBES`, and `ufFixturePreconditionRead` derives `present` from the same `documents` count — so the second conjunct **cannot differ from the first**. The `resolved !== true` false-park guard and the registry-miss-parks-nobody rule **STAND** and are the real additions. | **`§19.3` `F-2`** (the gate-4 re-confirm's register), **`§G8.3`** (the gate-8 discharge of it, with the revisit condition), and the **UNIT B item** of `§19.4` — *"the three corpus fixtures' DISTINCT ABSENCE SEMANTICS"* | **`§5` IS THE FIX**: **divergent probes**, one per gated fixture name, each able to read **ABSENT while the store is NON-EMPTY**. The falsifier is stated at `§5.5` and is the contract's own acceptance condition. |
| **the sets + the arg** | **the data sets, the selection arg, the obsolete route's disposition** | **`§0.2` clause 5** (the split), **`§12` item 1** (owed to the architect/supervisor), **`§9` items 1/2/3** (UNIT A's denials, which are this unit's grants) | **`§2`, `§3`, `§6`**. |

**THE REVISIT CONDITION UNIT A WRITES FOR `F-2`, QUOTED SO THIS UNIT IS MEASURED AGAINST IT:** *"`UNIT B`'s landing — a
run in which the store holds documents while no result row PAINTS (`'corpus-query-results'`) or no document tab is OPEN
(`'corpus-document-tabs'`) must read ABSENT for THAT fixture alone."* (`VERIFIED-BY-READ`, reader: this filing, at UNIT
A's `§G8.3`.)

### 0.3 The rulings this filing carries (cited, never re-derived)

| Source | What is taken from it |
| --- | --- |
| **`docs/decisions.md`** — **`DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG`** | **the fixture's FORM**: **hand-authored MOCK DATA SETS** plus **an arg selecting which set the live demo launches with** — *not* an args-derived synthetic corpus, *not* a seeding pipeline (clause (1), quoted verbatim in substance at UNIT A `§0.2` clause 1 and `§113` of that file's own citation block). **The declaration requirement**: clause (2), *"the artifact must name which data set the run used … so a reading can be attributed to its fixture without reading the operator's command line"* (`§4`). **The OBSOLETE-SET ruling and its O-0 scope carve-out**: clause (3) (`§6`). **`SPEC-CALL` boundary: this filing reads clauses (1)–(3) through the two records UNIT A quotes verbatim; the row's own cell is recorded `REPAIR`-annotated and its wording is not this filing's to restore.** |
| **`docs/decisions.md`** — **`DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL`** | **the engine is READY FOR INTEGRATION; shell-side integration is PENDING ON THE UI-OVERHAUL COMPLETION; the engine-owned corpus is the LONG-TERM fixture, so the driver-side fixture route is INTERIM BY CONSTRUCTION** — which is *why* the fixture is a mock and not a seeding pipeline. **The engine-fixture rows keep their named park reasons** (`§8`). |
| **`docs/decisions.md`** — **`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`** | **the REQUIRED test set: (a) the TEST HARNESS features — INCLUDING THE MOCK DOCUMENT CORPUS — and (b) the EXISTENCE AND ACCESS of the FOUNDATION TOOLS**; hence UNIT B is a **TESTING PREREQUISITE**. **The exemption is an ARCHIVE-or-DECLARED-EXEMPTION act, never an in-place relaxation**, and the `npm test` leg is **RE-SCOPED, NOT WAIVED** (`§10`). |
| **`docs/decisions.md`** — **`DECIDED: GAP-8-INTERIM-MOCK-CORPUS-FROM-CALLING-ARGS`** | **THE HONESTY CLAUSE** (its clause (2)): **a fixture is a DECLARED INPUT, never an oracle**; **no proxy PASS** (`D-GP-UFA-2`'s `proxyPASS` rule stands untouched); **every row it feeds must still assert a REAL USER-VISIBLE END STATE on the ASSEMBLED surface** (`D-GP-UFA-3`'s falsifiability + real-input proof unchanged); **the run's artifact must SAY what the fixture was**; and **a mocked reading may never be quoted as a live-corpus reading**. **`§9` carries it.** **`SPEC-CALL` boundary: this row's clause (1) describes a mock *derived from the calling args* — the LATER row above supersedes that framing for the FORM (hand-authored sets + a selecting arg); what this filing keeps from this row is its honesty clause, its scope denials (no engine seeding, no engine, no change to the demo launch's default enablement) and nothing else.** |
| **`docs/specs/unit-live-fixture-precondition-declaration.md`** (UNIT A) | the **DECLARATION's members** and its **closed `fixtureName` value set** (`§4.1`), the **gate predicate** (`§4.1` sixth-amendment clause, `§5.1` clause 1), the **per-declared-fixture absence test** this unit makes real (`§6.4`), the **park's reason and printed forms** (`§5.1` clause 3, `§5.3`), the **run-wide fixture state** this unit's arg must feed (`§6.1`), the **honesty clause** (`§7`), and the **adversarial register** `§19` whose `F-2` this unit closes. |
| **`docs/specs/unit-live-driver-verdict-integrity.md`** | **`§2.3` `H-1`…`H-4`** and **`§3.2` `F-6`/`F-7`** — the clauses UNIT A extended and this unit must not weaken: **a missing fixture is `PRECONDITION-FAILED` naming it, never a silent park and never a row `FAIL` against an absent surface**; **an `isError` reply is printed verbatim**. |

---

## 1. Scope

### 1.1 What UNIT B IS (the deliverable, in one list)

1. **THE MOCK DATA SETS** — the named, hand-authored sets, their content shape, the identities they carry, and the
   user-visible end states each set makes drivable; **the identity is the document id the store assigns on import**, so
   the sets and the driver's selectors are one decision (`§2`). **⟨GATE-2 `2026-10-05` — THE SETS' POPULATION IS
   `core` (`3` files) · `table` (`core` + `table.md` = `4`) · `search` (`core`'s `3`, text rewritten) · `tabs` (`core`'s
   `3` + `search.md` = `4`) · `empty` (`0`); the GATED POPULATION is `35` keys, `25` of them on `'corpus-documents'`
   (`§16.1`, `§16.17`).⟩** **⟨GATE-4 AMENDMENT `2026-10-05` — THE PER-NAME FIGURE IS RECONCILED: `31` OF THEM ARE ON
   `'corpus-documents'`, NOT `25` (`RECORDED READING`, measurer: the supervisor's shell on this pass's evidence; the
   `31` also counts out of `§16.17` item 2's own enumeration, `VERIFIED-BY-READ`, AND THE ENUMERATION WAS THE AUTHORITY
   OVER THE STALE FIGURE). THE FILED `25` IS `SUPERSEDED` AND IS KEPT VISIBLE HERE; THE POPULATION `35`, THE `3` AND THE
   `1` ARE UNMOVED (`§20`).⟩**
2. **THE SELECTION ARG** — its name, grammar, launch-scoped semantics, its declaration in the run's artifact, and its
   **refusal by name** for an unknown/empty/malformed value (`§3`), plus the set-selection failure states (`§4`).
3. **THE DIVERGENT PROBES — THE FIRST DELIVERABLE** — one probe per **gated** declared fixture name, each able to read
   **absent while the store is non-empty**, with the `F-2` falsifier stated and gradeable (`§5`). **⟨GATE-2 `2026-10-05` —
   EACH PROBE'S `read` IS A NAMED SENTINEL STRING DISPATCHED BY A DISCRIMINATED READER, AND THE THREE SENTINELS ARE
   WRITTEN LITERALLY AT `§5.2` (`§16.3`); the arm that grades them compares THOSE LITERALS (`§10.2.3`'s `3×probe-read`,
   `§16.8`).⟩**
4. **THE OBSOLETE SET'S DISPOSITION** — how each obsolete route is **retired/annotated, never extended**, what a caller
   still passing its flags gets, and the citation repoints (`§6`).
5. **THE RUN'S DECLARATION OF ITS FIXTURE** — the set's identity riding UNIT A's `UF_FIXTURE_STATE`, at all four print
   sites, plus the honesty clause carried (`§7`, `§9`).
6. **THE ENGINE SCOPE** — which engine tooling the mock corpus requires (kept required) and what is explicitly out of
   scope (`§8`).
7. **THE RED SET AND THE GATES** (`§11`), the **typed property register** (`§10`), and the report the landing owes
   (`§14`).

### 1.2 ALLOWED surface (exact)

| Path | The grant |
| --- | --- |
| **`scripts/live-drive.mjs`** | **THE DELIVERABLE.** The fixture-set content data and its materialisation, the selection arg (its parse, its validation, its pre-spawn refusal, its state assignment), the `UF_DECLARED_FIXTURE_PROBES` registry's three reads and `ufFixturePreconditionRead`'s implementation of them, `UF_FIXTURE_STATE`'s derivation from the selected set, the launch-profile/summary/refusal/`main().catch` prints, the obsolete route's **annotation** (comments and printed text only), and **the re-pin of the driver's hardcoded corpus identities to the new document identities (`§2.4`)**. **⟨GATE-2 `2026-10-05` — THE SURFACE IS UNCHANGED; WHAT IS ADDED INSIDE IT: the SENTINEL-DISPATCHED body of `ufFixturePreconditionRead` (`§16.3`), the SELF-PROVISIONER ROOT RESOLVER that confines a block's own write to the run's selected set (`§16.7`), and the FIXTURE-ABSENCE PARK REASON the rendered-fixture blocks emit from their OWN body when their declared fixture reads absent at a NON-EMPTY store (`§16.5`, `§16.6`).⟩** |
| **The fixture data files** — **`scripts/live-drive.mjs`'s own fixture-set data**, materialised at launch under the repo root's gitignored **`.live-fixture/<setName>/`** | **THE DATA.** `SPEC-CALL` (`§2.3`): the hand-authored content is carried as **pure string data in the driver's own source** and written to the gitignored materialisation root at launch — because the importer resolves a document id from **the file's path relative to the corpus root**, so the identity the sets carry is a consequence of where the files live and of nothing else. **A committed data directory is the alternative the landing pass may take, and it carries the SAME contract (`§2.3` clause 5).** **⟨GATE-5 AMENDMENT `2026-10-05` — THE FIXTURE DATA LITERAL IS NAMED: `UF_MOCK_FIXTURE_SETS`, the five-set `{ files, docs }` literal, with its companions `UF_MOCK_FIXTURE_TERM` · `UF_MOCK_FIXTURE_ROOT` · `UF_MOCK_FIXTURE_NOT_MATERIALISED` (`§2.3` clause 3's gate-5 block, greens `D-4`).⟩** **⟨GATE-2 `2026-10-05` — THE MATERIALISATION ROOT IS NOT A `UF_FIXTURE_STATE` MEMBER (`§16.4`); it is the CONTRACTED PRINTED TEXT beside the state at its four sites (`§7.1` clause 2, `§7.3` `D-3`).⟩** |
| **`tests/live-drive-contract.test.ts`** | **THE PIN AND THE REGISTER'S HOME.** UNIT A's file is the structural pin for `scripts/live-drive.mjs`; **this unit's arms and its register rows are the TestWriter's acts in this file** (`AGENTS.md` item 3). Its existing assertions that encode the pre-arg `UF_FIXTURE_STATE` literal are **RE-STATED, never relaxed** (`§11.5`). **⟨GATE-2 `2026-10-05` — ONE RE-STATEMENT IS OWED THAT THIS FILE'S `§11.5` DID NOT NAME: the pin's EXISTING undeclared-registry-key mutation (`A-5.vi`) must be **DISCRIMINATED**, not merely left green (`§5.4`'s filed claim is REFUTED BY READ — `§16.16`). The `state-consequence:mock-armed` arm additionally needs its OWN named mutation (`§16.15`), and the artifact-non-quotability text needs an arm (`§16.14`).⟩** |
| **`docs/specs/unit-mock-corpus-fixture-sets.md`** (this file) | The contract. **Amended only by a spec-owning pass, annotated beside** (`RCA-8(c)`). |
| **`.gitignore`** | **Exactly one line**, for the materialisation root (`§2.3` clause 4), on the standing precedent of the existing `.live-corpus/` entry. **No other ignore entry is this unit's.** |
| **`docs/next-steps.md`** | **NOT this unit's write** — the landing pass's DONE row and the supervisor's tracker edits are theirs; this filing records what they must state (`§14`). |

### 1.3 DENIED surface (explicit, so the allow-list cannot be widened by implication)

- **`src/**`** — **no app change of any kind.** This unit repairs no app-layer reading, adds no MCP tool, changes no
  reply shape and touches no renderer. **A fixture is supplied THROUGH the app's existing import route; nothing about the
  app changes to receive it.**
- **The MCP contract** (`docs/specs/mcp-endpoint.md`) and any MCP tool/argument — **no new tool, no new argument, no
  change to a reply shape**. The selection arg is a **driver** arg, not an MCP arg.
- **The engine** — no engine work, no engine fixture, no `gnosis.*` change, **and no engine probe**: the excluded engine
  family's fixture is **declared** and left owed (`§8`).
- **`MATRIX_ROWS`' row set — FULL AT `8`** (`U-1`..`U-8`): **no id added, removed, renumbered or re-mapped**, and **no
  new `§5.U` slot**. A new live assertion enters as a **RE-PIN**, or as an extended row in `ROW_EXTENDED` — **never as a
  `§5.U` slot.**
- **A new `BLOCKS` key — NONE.** The driver's key census is frozen at `100` by the pin's `BLOCK_CENSUS_SET` /
  `BLOCK_CENSUS_DIGEST`; a new key is a review finding unless the TestWriter re-states the frozen census **with both
  values visible**.
- **The obsolete routes AS A FOUNDATION** — `seedCorpus()` · `o0MarkdownTree(seedDir)` · `--seed=` · `--corpus-root=` ·
  `--strict-seed` · `--o0-corpus=` · the `.live-corpus/*` seed route · the 226-document O-0 corpus route: **named
  obsolete, never extended, never repaired, never made a set's source** (`§6`). **The O-0 MEASUREMENT/REPORT MECHANISM
  itself is NOT in this set** — it is a different object, and its status is a **separate open question this unit does not
  resolve** (`§6.5`).
- **`../Provident-Electron/**`** (the adjacent foundation tree) — **read-only, untouched**; not this unit's surface, and
  no foundation change is requested by it.
- **`package.json`, `vitest.config.ts`, `npm run` scripts, the divergence leg** — untouched.
- **`docs/skills/designing-pages.md`, its test-use-case coverage matrix and the demo-page index** — **untouched**: this
  unit changes **no page design**, so the design-skill update obligation **does not attach** (`§1.5`).
- **UNIT A's contract** — **not re-opened.** This unit **APPLIES** its `§4.1` closed `fixtureName` value set, its gate
  predicate, its print sites and its `§6.4` test. It may **re-state** the pin's assertions where the arg moves a literal
  (`§11.5`); it may **not** relax, delete or re-scope one of them. **⟨GATE-2 `2026-10-05` — TWO UNIT-A AMENDMENTS ARE
  NONETHELESS REQUIRED AND ARE STATED AS SUCH RATHER THAN PERFORMED HERE: (i) **ONE DECLARATION ENTRY MOVES ITS COLUMNS**
  — `u_edit_1_live_package_table_limitation` goes from `corpusRead:true, selfProvisioning:true,
  fixtureName:'self-provisioned-document'` to `corpusRead:true, selfProvisioning:false,
  fixtureName:'corpus-documents'`, because at the landed literal that entry is **NEVER GATED AND NEVER FED BY ANY
  CORPUS**, which made `§2.1` `F-2`'s `table`-set claim **INERT** (`§16.1`); (ii) **THE GATED POPULATION MOVES FROM `34`
  TO `35`** by that one move (`47 − 3 − 9 = 35`, the `9` being UNIT A's own ten `selfProvisioning:true` keys MINUS this
  one), and **every figure derived from it is re-derived here** (`§16.17`). **A UNIT-A declaration change is a UNIT A
  amendment, and the landing pass that makes it says so in its own records.** **⟨GATE-2 SECOND LOOP `2026-10-05` — THE
  CROSS-UNIT LANDING IS **ATOMIC**, AND ITS POPULATION IS **ASSERTED** (`§17.1`): the declaration COLUMN-MOVE, the pin's
  RE-STATEMENT (`§11.5`, `§2.4` clause 3) and THIS unit's arms land **in ONE pass**; landing either half alone reds
  NOTHING and leaves UNIT A's `§6.2` cell disagreeing with this file; and the arms assert the population
  **`35 = 47 − 3 − 9`**, named `'corpus-documents'` `25` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1`.
  **⟨GATE-4 AMENDMENT `2026-10-05` — THE PER-NAME FIGURE IN THIS CLAUSE IS `31`, NOT `25`: `35 = 47 − 3 − 9`, NAMED
  `'corpus-documents'` `31` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1` (`31 + 3 + 1 = 35`; the
  `RECORDED READING` is the supervisor's shell's declaration census on this pass's evidence, and `§16.17` item 2's own
  enumeration — THE AUTHORITY — reads `31`). `25` IS `SUPERSEDED` AND IS KEPT VISIBLE ABOVE; the `35`, the `47`, the
  `3` and the `9` are UNMOVED (`§20`).⟩**
  **THE CLAUSE IS AT `§17.1` AND IS THE READING OF RECORD.**⟩**

### 1.4 What this unit is NOT

It is **not** an app repair, an engine unit, a UI unit, or a re-measurement, and **it claims no row passes**. It is
**not** a re-opening of UNIT A. It is **not** the fixture's long-term route: the engine owns the corpus
(`DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL`), so **the mock is INTERIM BY
CONSTRUCTION**, and its own sets are **TEST DATA, never product data** (`§9.2`). It is **not** a widening of the
exempt/archived class (`§12` item 3) and it is **not** a manifest/pin change in the foundation sense (`§12` item 4).

### 1.5 The design-skill obligation, explicitly discharged

**No page design, no page layout, no component markup, no test-use-case coverage row and no demo-page index entry is
touched or required by this unit.** The obligation attaches to a change that affects page design; this unit's whole
surface is the **instrument** (`scripts/live-drive.mjs`), its **data** and its **pin**. **A landing pass that edits
`docs/skills/designing-pages.md` for this unit is doing unauthorised work; a landing pass that ignores it is compliant.**

---

## 2. THE DATA SETS THEMSELVES

### 2.1 The five sets, their identity, their files, and what each makes drivable

**THE SETS ARE THE ARGUMENT'S CLOSED VALUE SET** (`§3.2`): **five** `--fixture=` values. **Four carry documents; the
fifth is the explicitly selected EMPTY set.** Each is **hand-authored** (its bytes are authored by this unit's landing
pass, never generated from a shape rule — that is the ruling's own distinction from the superseded *"args-derived
synthetic corpus"* framing, quoted at UNIT A `§0.2` clause 1).

| # | The set's identity (`--fixture=`) | Its files (materialised under `.live-fixture/<set>/`) | What it makes DRIVABLE |
| --- | --- | --- | --- |
| **F-1** | **`core`** | `alpha.md` · `beta.md` · `gamma.md` | **the whole `corpus-documents` class**: the document list and the doc-nav rows (`v3_docnav`, `o0_folder_row`, `o0_document_row`, `o0_gpu_control`, `o0_track_ablation`, `o0_repeat_determinism`, `stage_docnav_switch_inside_async`, `stage_document_tab_paints_its_document`, `stage_doc_surface_precondition_diag`) · **the two named title-bearing documents the alpha/beta selectors need** (`uf_tabs_4`'s *"an alpha document tab AND a beta document tab by exact title"*, `uf_panes_12`/`uf_panes_12_diag`'s beta leaf, `user9_search_open_in_tab`'s `/alpha/` tab) · **the multi-document tab rows** (`uf_tabs_1`, `uf_tabs_3`) · **the read/edit/read-back rows** (`toolbar_undo`, `repro_nbsp`, `repro_dup_para`, `user4_main_editable`, `uf_hist_4`, `uf_hist_6`, `uf_layout_2`, `v1_adjacency`, `v2_scoped`, `shell_integration`, `stagesurface_census_i2r`, `stage_async_mount_race_v1`, `stage_foreign_rederive_v2`, `stage_refresh_survival_v5`) · **the pane-search result rows** (`uf_tabs_7`, `uf_tabs_7_diag`, `uf_panes_14`) · **the inline-element row** `u_edit_1_live_commit_failure_warning` (row `31` of UNIT A `§5.2`: *"a document carrying an inline element outside the decomposer's closed node-type set"*). **⟨GATE-2 `2026-10-05` — THIS LIST IS **ILLUSTRATIVE, NOT EXHAUSTIVE**, AND TWO OF ITS NAME TOKENS ARE WRONG (`§16.9`): the key is `stage_surface_census_i2r` (this list spells it `stagesurface_census_i2r`), `tab_strip_*` names NO key in the tree or in `BLOCKS`, and `user9_search_open_in_tab` is named here while it is gated on `'corpus-document-tabs'` (`§2.1` group `3`, correct as the declaration has it). The corrected, key-by-key inventory — `31` gated `'corpus-documents'` keys, of which `core`/`table`/`search`/`tabs` carry `30` and `U-EDIT-1-LIVE-6`'s block `u_edit_1_live_package_table_limitation` is carried by `table` alone — is `§16.17`.** **⟨GATE-4 AMENDMENT `2026-10-05` — THE TWO FIGURES IN THIS FOOTNOTE ARE RECONCILED (`31` / `30`, NOT `25` / `24`); `RECORDED READING` (measurer: the supervisor's shell, this pass's evidence) AND `VERIFIED-BY-READ` (the enumeration itself, `§16.17` item 2 — THE AUTHORITY). The FILED `25`/`24` ARE `SUPERSEDED` and are kept visible above (`§20`).⟩** |
| **F-2** | **`table`** | `core`'s three files **plus `table.md`** | **F-1's whole list, plus `u_edit_1_live_package_table_limitation`** (UNIT A `§5.2` row `35`): **a document with a STORED `<table>`**, so the row's candidate scan (`ufOpenDocumentById`, `rag.list_documents`, `#page-edit-surface table`) can find one and the row stops parking with *"cannot be met in this corpus"*. **This is `OB-1`'s first named requirement.** **⟨GATE-2 `2026-10-05` — THE CLAIM WAS **INERT AS FILED** AND IS NOW MADE REAL, WITH ITS SUBJECT NAMED (`§16.1`): at the landed literal `u_edit_1_live_package_table_limitation` carries `selfProvisioning:true` / `fixtureName:'self-provisioned-document'`, so it is **NEVER GATED AND NEVER FED BY ANY CORPUS** — no set can make it drivable. THE READING OF RECORD IS THE **UNIT A DECLARATION AMENDMENT**: that entry moves to `corpusRead:true, selfProvisioning:false, fixtureName:'corpus-documents'` (`§1.3`'s gate-2 note), which makes `F-2` the set that supplies its first candidate (`R-13`, `§16.2`) and makes its park/run split a real reading. **CONSEQUENCE FOR THIS SET'S HEADLINE CLAIM, STATED PLAINLY: `table` is the ONLY set under which `u_edit_1_live_package_table_limitation` runs; under `core`/`search`/`tabs` it **RUNS AND PARKS FOR ITS OWN REASON** (the store carries documents, so the gate does not fire, and its candidate scan still finds no `<table>`-bearing surface) — so the set is not its precondition, and the row's unparking is the `table`-set reading this claim was always about. **THE PARK STRING A LEGITIMATE PARK PRINTS IS *"cannot be met in this corpus"*, WHICH IS ALSO THE BLOCK'S OWN PARK TEXT — `class-(b):table`'s discrimination is written at `§16.11` and it is the `gateRoute`/`parkReason` attribution, never the words.⟩** **⟨GATE-5 RULING `2026-10-05` — THE `table` SET'S CONTENT FORM IS THE **PARSER-MEDIATED** ONE: `P-β` REQUIRES A DOCUMENT WHOSE BODY CARRIES A TABLE **THAT THE APP'S OWN IMPORT PATH TURNS INTO A TABLE NODE**; THE **RAW-`<table>`-LITERAL** REQUIREMENT IS `SUPERSEDED` (KEPT VISIBLE ABOVE) AND THE ACCEPTANCE PREDICATE IS UNCHANGED.**⟩** **THE ARCHITECT'S RULING ON THIS SET, VERBATIM: *"Adapt the mock data to function with the query."*** **WHY THE FILED LITERAL COULD NOT DELIVER THE CONTRACTED END STATE: the app's markdown import DROPS RAW HTML ENTIRELY (`parseMarkdown`'s HTML branch: element + content), so a stored raw `<table>` literal creates NO TABLE NODE AT ALL — the set's own candidate scan then finds nothing to render and `u_edit_1_live_package_table_limitation` cannot do other than `PARK`, while `§16.11` rules that `class-(b):table` **MUST REJECT a `PARK`**. A SOURCE-STRING SHAPE THE APP'S OWN SUPPLY ROUTE DISCARDS CANNOT SATISFY THIS CLAUSE.** **THE BINDING FORM: a GFM PIPE TABLE in `table.md` — the form the app's parser preserves and decomposes into `:table:` / `:thead:` / `:th:` / `:tr:` / `:td:` nodes, which is what makes `#page-edit-surface table` non-empty and the row's (verdict, evidence) pair drivable.** **THE MEASURED BEFORE/AFTER (`RECORDED READING`, measurer: the implementer's diagnosis at this head, live runs on isolated ports `3970`–`3978`/`9470`–`9478`, `--display=:0`, a scratch `--home`; the greens' rows are `F-3`/`E-10`): raw-HTML form → `no table node`, `census=0`, **PARKED**; GFM pipe-table form → `:table:`/`:thead:`/`:th:`/`:tr:`/`:td:` nodes, rendered table census `{"tables":1,"trs":1,"tds":4}`, verdict **PASS**.** **`§16.11`'s ACCEPTANCE PREDICATE IS UNCHANGED AND IS THE READING OF RECORD: `class-(b):table` MUST ACCEPT a `PASS` or a `FAIL` carrying evidence that NAMES the found document and its rendered table census, and MUST REJECT a `PARK`.** **WHAT DOES NOT MOVE HERE: the set's file list (`core`'s three **plus `table.md`**), `R-13`'s candidate-list ordering (`§16.2`), the declaration column-move (`§16.1`), and the `P-β` row's *"`F-2` only"* carriage. ONLY THE CONTENT'S FORM MOVES.** **THE EXACT BYTES REMAIN THE LANDING PASS'S (`§13.3` item 2/7(c)); the FORM is now contracted, the bytes are not (`§22.2` item 3, `§22.4` item 3).**⟩** |
| **F-3** | **`search`** | `core`'s three files, **with their document TEXT rewritten so it does not carry the probe's search term** (`§5.3` clause 2) | **F-1's whole list minus the pane-search class — DELIBERATELY.** The documents exist, are listed, are focusable and are readable; **a query for the probe's term paints NO result row** (`rag.query` returns no hit for that term). **This set is the `F-2` FALSIFIER for `'corpus-query-results'` and nothing else** (`§5.5`). |
| **F-4** | **`tabs`** | `core`'s three files **plus `search.md` (the probe's term-bearing document, present but not open)** | **F-1's list, but the run starts with NO DOCUMENT TAB OPEN** — and the pane-search probe **is** satisfied (a query for the probe's term paints a row for the un-opened term-bearing document). **This set is the `F-2` FALSIFIER for `'corpus-document-tabs'`**: the store holds documents, no document tab is open at the blocks' own start. **⟨GATE-2 THIRD LOOP `2026-10-05` — THE FILED PARENTHETICAL IS `SUPERSEDED` AND IS KEPT VISIBLE (`§18.2` clause 4, `§18.7` residue (c)): *"a query for the probe's term paints a row for the un-opened term-bearing document"* IS FALSE AT THE PROBE'S READ POINT (`§18.1` clause 3: no gesture has run, so nothing is painted), AND THE FIXTURE'S OWN SATISFACTION IS **THE STORE'S CONTENT**, NOT A PAINTED ROW: the probe reads the set's term-bearing document out of the store (`§18.2` clause 1), and the un-opened state of `search.md` is irrelevant to it. **WHAT THE FILED CLAUSE IS TRUE OF: a run in which a BLOCK later submits the term — which is what the pane-search blocks do. THE `F-2` FALSIFIER HALF OF THIS CELL IS VERIFIED CLEAN AND IS NOT AMENDED.**⟩** **⟨GATE-5 RULING `2026-10-05` — WHAT **THIS** SET UNIQUELY CARRIES IS THE STORE'S CONTENT, NOT ANY TAB STATE: its one operative, READABLE divergence from `core`/`table` is that it carries `search.md` (the probe's term-bearing document) — so the `F-2`-falsifier half of this cell reads against `§18.2`'s STORE QUERY, which reads `hits >= 1` under `tabs` (`FA-2`'s three `'corpus-query-results'` keys RUN, `§18.6` clause 2(iii)).** **THE FILED OPERATIVE REASON — *"the run starts with NO DOCUMENT TAB OPEN"* / *"no document tab is open at the blocks' own start"* — IS `SUPERSEDED` AND IS KEPT VISIBLE ABOVE: it is `REFUTED BY MEASUREMENT` at this head, and NOT by this fixture's content at all — ONLY A NON-DOCUMENT `landing` TAB EXISTS IN THE STRIP AT THE PROBE'S READ POINT UNDER EVERY SET, AND `#tab-strip .tab[data-document-id]` CAN NEVER MATCH AT THIS HEAD (the literal exists only in the driver, never in the app: `src/renderer/tab-strip.ts` authors `data-tab-id` + `data-target-kind`, while `data-document-id` lives in `src/renderer/pane-graph.ts` for PANES) — so the `corpus-document-tabs` limb is **SKIPPED-BY-RULING**; the exact SKIP wording, the exemption decision row and what may NOT be claimed are `§22.3`.** **THE SET'S OWN DEFINING LIMB THAT **SURVIVES**: `search.md` is present and is NOT opened by the run — a property of the SET's content that no probe's reading depends on any more (`§2.2` P-θ's gate-5 marker).**⟩** |
| **F-5** | **`empty`** | **no files** (the set's directory is created and left empty) | **the FIXTURE-ABSENT acceptance run — SELECTED, not accidental.** A `--fixture=empty` run imports nothing, so **every** gated key's own declared fixture reads absent and the run is the class-(b) park battery's subject (`§11.3` item 1) **while its artifact still names a fixture data set** — the state UNIT A's `none` cannot express, and the reason this set exists. |

**THE FOUR `fixtureName` GROUPS THE SETS MUST SATISFY, STATED SO THE SETS AND UNIT A's POPULATION TABLE CANNOT DRIFT**
(`VERIFIED-BY-READ` of UNIT A `§6.4`'s population table and of the landed declaration literal):

1. **`'corpus-documents'`** — the bulk of the gated set (`34` gated keys, `16` hand-listed + `18` entered). Its fixture
   is **the store's document list**, and **`core`/`table` satisfy it**. **⟨GATE-2 `2026-10-05` — THE GATED POPULATION IS
   `35` KEYS (the UNIT A declaration amendment of `§1.3`/`§16.1`), OF WHICH `31` CARRY THIS FIXTURE (`30` satisfied by
   `core`/`table`/`search`/`tabs` and `1` — `u_edit_1_live_package_table_limitation` — satisfied by `table` ALONE); the
   `34`/`16 + 18` split of this clause is SUPERSEDED and kept visible, and the key-by-key re-derivation is `§16.17`.⟩**
   **⟨GATE-4 AMENDMENT `2026-10-05` — THE TWO FIGURES IN THIS CLAUSE ARE RECONCILED: `31` CARRY THIS FIXTURE, OF WHICH
   `30` ARE satisfied by `core`/`table`/`search`/`tabs` and the `1` moved key by `table` alone (`RECORDED READING`,
   measurer: the supervisor's shell on this pass's evidence; `VERIFIED-BY-READ` against `§16.17` item 2's enumeration —
   THE AUTHORITY). THE FILED `25`/`24` ARE `SUPERSEDED` AND ARE KEPT VISIBLE ABOVE; the `35` population and the
   `34`/`16 + 18` superseded split note are UNMOVED (`§20`).⟩**
2. **`'corpus-query-results'`** — **`uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`** (`VERIFIED-BY-READ` in the landed
   declaration literal), whose declared surface is **the PANE SEARCH's painted result rows** (`#pane-search
   li[data-document-id]`). **`core`/`table` satisfy it; `search` DOES NOT, by construction.**
3. **`'corpus-document-tabs'`** — **`user9_search_open_in_tab`** alone, whose declared surface is **the rendered corpus
   DOCUMENT TAB rows**. **`core`/`table` satisfy it; `tabs` DOES NOT at the blocks' own start.** **⟨GATE-2 `2026-10-05`
   — `1` AS FILED BECOMES `2`: the UNIT A declaration amendment of `§16.1` puts
   `u_edit_1_live_package_table_limitation` on `'corpus-documents'` and NOT here, so this group is still
   `user9_search_open_in_tab` alone; the `2` of the re-derivation table belongs to the group's **revision** count, not to
   its membership. THE FILED MEMBERSHIP STANDS. **⟨GATE-2 SECOND LOOP `2026-10-05` — THE FILED NOTE ABOVE IS
   SELF-REFERRING AND IS RESTATED SO EACH COUNT GRADES SOMETHING (`§17.3`), THE FILED FORM KEPT VISIBLE: the `1` is
   THIS GROUP'S **MEMBERSHIP** COUNT (`1` key — `user9_search_open_in_tab` — `VERIFIED-BY-READ` in the landed literal)
   and it is the figure a gated-population arm asserts; the `2` is NOT *"`1` becoming `2`"* — **it is `§16.17`'s
   REVISION count for this group** (the number of this group's figures the `§16.1` amendment moved: the gated population
   `34 → 35` and the `'corpus-documents'` group `24 → 25` — **both of which leave THIS group's membership at `1`**).
   **THE MEMBERSHIP IS `1` BEFORE AND AFTER THE AMENDMENT, AND THE `2` GRADES THE REVISION, NOT THE GROUP.**⟩**
4. **`'self-provisioned-document'`** (the `10` `selfProvisioning:true` keys) and **`'none'`** (the `3`
   `corpusRead:false` keys) — **never gated**; **no set is required for either**, and **no probe is registered for
   either** (`§5.2`). **⟨GATE-2 `2026-10-05` — `9` `selfProvisioning:true` KEYS, ONCE THE `§16.1` AMENDMENT MOVES ONE OF
   THE TEN; the `'none'` group stays `3` (`stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` ·
   `user6_search_no_flicker`). `10` IS SUPERSEDED AND KEPT VISIBLE.⟩**

### 2.2 Per set, the user-visible end states it makes drivable — the required content properties

**THE PROPERTIES ARE STATED PER SET SO A TESTWRITER CAN ASSERT THE SET ITSELF AND NOT ONLY THE ROWS** (`§11.2`'s
`set-shape` and `set-identity` arms). **Each property is a claim about the ASSEMBLED surface the property makes
reachable** (the import lands, the store lists it, the doc-nav paints it, the stage renders it).

| Property | Which sets carry it | The end state it makes reachable |
| --- | --- | --- |
| **P-α — `>= 3` documents, each with a distinct document id, at least two carrying the titles the alpha/beta selectors match** | F-1 · F-2 · F-3 · F-4 | the doc-nav paints document rows; the tab strip can carry `>= 2` document tabs and can overflow (`uf_tabs_1`'s *"a document set large enough to fill the strip"*, `uf_tabs_3`'s `>= 2` documents); `uf_tabs_4`'s **exact-title** alpha+beta pair resolves. |
| **P-β — a document whose body carries a STORED `<table>`** | **F-2 only** | `#page-edit-surface table` is non-empty after the document is opened: `u_edit_1_live_package_table_limitation`'s subject. **⟨GATE-2 `2026-10-05` — ITS SUBJECT IS A GATED KEY ONLY AFTER THE `§16.1` DECLARATION AMENDMENT, and the property is what that amendment makes reachable: `table` is the ONLY set that supplies it, so this property is the set's whole reason to exist (`§16.1`). The row's `read` is a real reading of the property, not an inference; the `set-shape:table` arm asserts it from the set's own content literal (`§10.2.3`).⟩** **⟨GATE-5 RULING `2026-10-05` — THE RAW-`<table>`-LITERAL READING IS `SUPERSEDED` AND IS KEPT VISIBLE ABOVE; THE PROPERTY'S BINDING FORM IS THE **PARSER-MEDIATED** ONE: the document's body carries a **GFM PIPE TABLE** — the form the app's own markdown import preserves and turns into a `:table:` node (with `:thead:`/`:th:`/`:tr:`/`:td:` beneath it) — so that `#page-edit-surface table` is non-empty after the document is opened and `u_edit_1_live_package_table_limitation` can return its own (verdict, evidence) pair instead of a `PARK`. **WHY: `parseMarkdown` DROPS raw HTML ENTIRELY (element + content), so a stored raw `<table>` literal yields a `census=0` non-renderable import, and `§16.11` — UNCHANGED — requires `class-(b):table` to REJECT a `PARK`.** **MEASURED (`RECORDED READING`, the implementer's controlled before/after; greens `F-3`/`E-10`): raw-HTML form → `no table node`, `census=0`, PARKED; GFM pipe-table form → `:table:`/`:thead:`/`:th:`/`:tr:`/`:td:` nodes, census `{"tables":1,"trs":1,"tds":4}`, verdict **PASS**.** **THE PROPERTY'S CARRIER IS UNMOVED: `F-2` only, and its subject is the row above.** **THE EXACT BYTES STAY THE LANDING PASS'S (`§13.3` item 2/7(c)); THE FORM IS WHAT THIS ROW CONTRACTS (`§22.2` item 3, `§22.4` item 3).**⟩** |
| **P-γ — a document whose body carries an INLINE element outside the decomposer's closed node-type set** (the row's own failure fixture) | F-1 · F-2 · F-3 · F-4 | the commit-failure warning's surface: `u_edit_1_live_commit_failure_warning` opens that document and its inline element is the fixture. |
| **P-δ — a query term that PAINTS a pane-search result row** | F-1 · F-2 · F-4 | `#pane-search li[data-document-id]` is non-empty for the probe's term: `uf_panes_14`'s hover+click halves, `uf_tabs_7`/`uf_tabs_7_diag`'s painted row. **F-3 omits it deliberately** (`§5.5`). **⟨GATE-2 THIRD LOOP `2026-10-05` — THIS PROPERTY IS A PROPERTY OF THE **SET'S CONTENT**, NOT OF THE PROBE'S READ POINT, AND THE TWO MUST NOT BE CONFLATED: *"`#pane-search li[data-document-id]` is non-empty for the probe's term"* IS TRUE OF A RUN IN WHICH A **GESTURE-DRIVEN BLOCK** HAS SUBMITTED THE TERM — the blocks this property exists for do exactly that (`uf_panes_14`/`uf_tabs_7`/`uf_tabs_7_diag` drive `ufPaneSearch` themselves). **AT THE PROBE'S OWN PRE-GESTURE READ POINT THE COUNT IS `0` AND IS NOT THE PROBE'S ANSWER** (`§18.1` clause 3, `§18.2` clauses 4/5): the property is what makes those blocks' own gestures productive, and the probe reads the SET'S content (`§18.2` clause 1), never this count. `F-3`'s omission stands and is the property's whole point.**⟩** |
| **P-ε — a document whose node ids support a paragraph-level DOM read and a multi-block body** | F-1 · F-2 · F-3 · F-4 | `repro_dup_para`'s `[data-rag-node-id]` count and the class-`M` multi-block fallback inside `ufEnsureEditFixture` reach a real surface. |
| **P-ζ — a node-level adjacency / child-bearing target for the scoped traversal** | F-1 · F-2 · F-3 · F-4 | `v1_adjacency`'s node adjacency, `v2_scoped`'s `filters.target.documentId` traversal with children. |
| **P-η — a history-observable edit target (a node set the journal can invert over)** | F-1 · F-2 · F-3 · F-4 | `uf_hist_4`'s journal-consistent node signature and `toolbar_undo`'s edit+read-back. |
| **P-θ — a document that is NOT open as a tab at the blocks' own start, while the store is NON-EMPTY** | **F-4 only** (`search`'s term-bearing document is never opened) | the `'corpus-document-tabs'` probe reading **ABSENT with a non-empty store** — the `F-2` falsifier for that fixture (`§5.5`). **⟨GATE-5 RULING `2026-10-05` — THIS PROPERTY'S PROBE-READING LIMB IS **SKIPPED-BY-RULING** (`§22.3`): the DOM read `dom:#tab-strip .tab[data-document-id]` CAN NEVER MATCH at this head, so it cannot read the property; ONLY A NON-DOCUMENT `landing` TAB EXISTS IN THE STRIP AT THE PROBE'S PRE-GESTURE READ POINT UNDER EVERY SET. THE SKIP IS **NOT A PASS** AND THE `F-2`-CLOSURE CLAIM FOR THAT LIMB MAY NOT BE REPORTED AS DISCHARGED.** THE PROPERTY ITSELF IS UNMOVED AND IS CARRIED BY **F-4 ONLY**: the set's content holds a document that the run never opens.**⟩** |
| **P-ι — a store whose every document is ABSENT while the run still declares a fixture data set** | **F-5 only** | the class-(b) fixture-absent battery under a **named** fixture state (`§11.3` item 1). |

### 2.3 The files, the materialisation root, and the absence rule

1. **THE ROOT IS NEW AND THE OBSOLETE ROUTE IS NOT ITS FOUNDATION.** The sets are materialised at launch under the repo
   root's **`.live-fixture/<setName>/`** — a path that shares **no directory, no function and no flag** with the obsolete
   `.live-corpus/*` seed route (`§6`). **`SPEC-CALL`, with its ground: clause (3) forbids the pre-existing sets and their
   supply mechanisms as the fixture's FOUNDATION, so a fixture that reused `.live-corpus` at all — even with new content
   — would be unreadable against the ruling.**
2. **THE MATERIALISATION IS DETERMINISTIC AND IDEMPOTENT.** The set's own directory is created if absent and is written
   **from the hand-authored content data** on every launch; **no stale file may survive a launch** (a set's directory is
   emptied of this unit's own `.md` files before it is written, and **nothing outside `.live-fixture/<setName>/` is ever
   removed**). **The removal is confined to the run's own set directory** — the same discipline the `--home` refusal
   imposed on the scratch HOME (UNIT A `§G8.2`'s `F-8`).
3. **THE CONTENT IS HAND-AUTHORED.** `SPEC-CALL`: the landed form is **pure string data in `scripts/live-drive.mjs`**
   (literal per-document markdown), written out at launch, so the content is reviewable in the same file as the arg that
   selects it and the repository gains no generated tree. **Ground: the ruling's "hand-authored" is a claim about the
   content's origin, and a literal in the driver source is the form where that claim is checkable by the pin's own
   source readers.** **Risk, recorded: the bytes are then not diffable as document files.**

**⟨GATE-5 AMENDMENT `2026-10-05` — D-4 · GREENS ROW `C-1`…`C-8` (documentation finding `D-4`) · THE FIXTURE **DATA** LITERAL IS NOW NAMED, WITH ITS SHAPE, SO A BLIND READER DERIVES THE SET-CONTENT ROWS FROM THIS DOCUMENT ALONE. THE FILED CLAUSE ABOVE NAMES THE DATA'S FORM (*"pure string data in `scripts/live-drive.mjs`"*) BUT NO SYMBOL — the only literals this file named were the DECLARATION's (`UF_FIXTURE_DECLARATION`), the REGISTRY's (`UF_DECLARED_FIXTURE_PROBES`) and the STATE's (`UF_FIXTURE_STATE`), all declared in the pin's own literal region, while the sets' CONTENT had no name for a reader to find — so the blind greens had to reach it by mechanical sweep. THE NAMED SYMBOLS, THEIR SHAPES AND WHAT EACH IS FOR:**

1. **THE FIXTURE DATA LITERAL: `UF_MOCK_FIXTURE_SETS`** — **a module-level literal in `scripts/live-drive.mjs`**, the sets' own single declaration, keyed **by the five set names** (`core` · `table` · `search` · `tabs` · `empty` — the same closed value set the arg's grammar accepts, `§3.2`), each value an object carrying **two members only**: **`files`** — the set's file list **as basenames with their extension** (`'alpha.md'`, `'beta.md'`, …), which is THE SET-FILE-LIST CONTRACT (`§2.1`'s per-set file column, `§10.2.3`'s `3×set-file-list`); and **`docs`** — a file-name→content map, **`docs[<basename>]` = that document's markdown text**, the hand-authored bytes `§2.3` clause 3 contracts. **The `empty` set carries `files: []` and `docs: {}`.** **THE SHAPE, IN ONE LINE: `UF_MOCK_FIXTURE_SETS[<setName>] = { files: [<basename>…], docs: { <basename>: <markdown string> } }`.**
2. **THE COMPANION LITERALS, NAMED BESIDE IT SO THE SET-CONTENT ROWS ARE FULLY DERIVABLE — and their literals remain the landing pass's own (`§13.3` item 2/7(c)):** **`UF_MOCK_FIXTURE_TERM`** — the probe's own single constant term (`§5.3` clause 1), **the term the SETS and the PROBE read together**, so a content row is readable as *"`docs[<file>]` carries `UF_MOCK_FIXTURE_TERM`"* exactly as `P-δ`/`FA-1` need; **`UF_MOCK_FIXTURE_ROOT`** — `(id) => '.live-fixture/<id>/'`, the materialisation root **derived from the set identity, never a second literal** (`§2.3` clause 1, `§2.4`); and **`UF_MOCK_FIXTURE_NOT_MATERIALISED`** — the *"no SET was materialised"* reading (`§17.11`). **These three plus `UF_MOCK_FIXTURE_SETS` are the whole data region.**
3. **WHAT THE NAMED SYMBOL MAKES DERIVABLE, ROW BY ROW, FROM THIS FILE ALONE:** the file census and the file ORDER per set (`C-2`…`C-6`) from `files`; each set's content properties (`§2.2` `P-α`…`P-ζ`) from `docs`; the term's carriage per set (`P-δ`, `FA-1`'s `search`-carries-none half, `C-8`) from `docs` **read against `UF_MOCK_FIXTURE_TERM`**; the `<table>`-bearing document that makes `table` the only set carrying `P-β` from `table`'s `docs['table.md']`; and the identity each file acquires on import (`§2.4`) from `UF_MOCK_FIXTURE_ROOT(id)` + the basename. **A reader who wants the content bytes now has a symbol to find instead of a sweep.**
4. **WHAT DOES NOT MOVE:** the data's FORM (pure string data in the driver source, this clause), the committed-data variant's admissibility (clause 5), the root and the identity scheme (`§2.3` clause 1, `§2.4`), the no-stale rule (clause 2), and **the sets' own names, file lists and properties** (`§2.1`, `§2.2`). **THE TERM'S LITERAL AND THE TERM-BEARING FILE'S EXACT BYTES REMAIN THE LANDING PASS'S (`§13.3` item 2/7(c), `OWED`, unmoved by this naming.)**
4. **`.gitignore` GAINS EXACTLY ONE LINE** for the materialisation root (on the standing `.live-corpus/` precedent), so
   the files are runtime artifacts and **never** committed product data (`§9.2`). **A landing pass that commits a
   materialised set is a review finding.**
5. **THE COMMITTED-DATA VARIANT IS ADMISSIBLE AND CARRIES THE SAME CONTRACT.** If the landing pass instead commits the
   set files under the repo (the importer requires them under the corpus root), then: each set is committed at its own
   `<root>/<setName>/` directory; **that root is NOT gitignored**; the "no stale file" clause becomes **"the committed
   set's file list is the contract and no extra `.md` may sit in it"**; and **every other clause of this section,
   `§2.1`, `§2.2` and `§2.4` is unchanged.** **This variant is named so a landing pass may take it without amending this
   spec — and it is the ONLY admissible variance.**
6. **WHAT THE ABSENCE OF A SET MUST DO — PARK BY NAME, NEVER SUBSTITUTE.** **No set may fall back to another set**, and
   **no launch may silently pick a substitute**: a selected set that cannot be materialised (a write failure) or whose
   import fails is the **`S-4`/`S-5` refusal/abort of `§4`**, and the run states **which set it selected** on that path.
   **A declared key whose set is the EMPTY set parks by name** (UNIT A's own discipline) — **`--fixture=empty` is a
   SELECTED set, so it is NOT a refusal: it is the fixture-absent run, declared.**
7. **⟨ADDED GATE-2 `2026-10-05` — THE `--no-seed` IMPLICATION, THE `.live-corpus` LIFECYCLE, AND WHICH WRITES THE
   MATERIALISATION ROOT CONTAINS (`§16.7`, `§16.13`).⟩** **A set selection and the obsolete seed route are not two
   supplies in one store: `--fixture=<a document-carrying set>` IMPLIES `--no-seed`, the implication is PRINTED on the
   launch line, and the `.live-corpus/*` seed route therefore does NOT run in a `--fixture=<set>` run at all.** **The
   obsolete root's own lifecycle is unchanged where it is still reached** (an OBSOLETE-ROUTE-ONLY run seeds it and the
   driver's existing teardown removes it unless `--connect`; `--connect` leaves it because the running app owns it) —
   **`--fixture=empty` implies `--no-seed` too (the empty value IS a selected set, `§3.2`), so the `empty`
   fixture-absent run reaches neither supply.** **AND THE MATERIALISATION ROOT HOLDS ONLY THE SELECTED SET'S OWN FILES
   PLUS the files SELF-PROVISIONING blocks write through the `§16.7` resolver** — a self-provisioner's write is
   confined to the selected set's own root and never creates a second set's directory.

### 2.4 The document-IDENTITY scheme, and the re-pin it forces — `SPEC-CALL`

**THE IDENTITY IS THE DOCUMENT ID THE STORE ASSIGNS ON IMPORT.** The importer resolves a document id from **the file's
path relative to the corpus root** (which is the app's working directory, i.e. this repo's root). So a set materialised
at `.live-fixture/<set>/<basename>.md` carries the document id **`.live-fixture/<set>/<basename>`** and node ids
**`.live-fixture/<set>/<basename>:<n>`**. **The identity is a consequence of the materialisation path and of nothing
else — which is why `§2.3`'s root is a contract clause and not an implementation detail.**

**THE CONSEQUENCE, STATED PLAINLY: THE DRIVER'S HARDCODED CORPUS IDENTITIES MOVE WITH THE SETS.** UNIT A's `OB-1`
anticipates exactly this (*"or a re-pin of those selectors under the re-statement discipline"*). **THE RE-PIN SET IS THE
ONE BELOW, `VERIFIED-BY-READ` (reader: this filing, at each site in `scripts/live-drive.mjs`).** Every entry is a
**hardcoded corpus identity in a block body or a shared helper**, and every one is re-pointed to the target set's own
identity. **The pin's own assertions that quote these strings are re-stated with them** (`§11.5`).

| # | Site's subject (`VERIFIED-BY-READ`) | The hardcoded identity | Re-pin target (`--fixture=core`'s identity; F-2's `table` set adds its own document and moves none of these) |
| --- | --- | --- | --- |
| **R-1** | `tabs` — `provident.focus{kind:'nodeId'}` | `.live-corpus/beta` (as a **node id**) | `.live-fixture/core/beta` |
| **R-2** | `uf_panes_12` (and `uf_panes_12_diag`) — folder label + beta leaf (`[data-folder-label]`, `li[data-document-id]`) | `.live-corpus` (folder) · `.live-corpus/beta` (leaf) | `.live-fixture/core` · `.live-fixture/core/beta` |
| **R-3** | `repro_nbsp` — `rag.get_document` before/after and `provident.focus` | `.live-corpus/alpha` | `.live-fixture/core/alpha` |
| **R-4** | `repro_dup_para` — `provident.focus` + `[data-rag-node-id]` | `.live-corpus/alpha` · `.live-corpus/alpha:p:1` | `.live-fixture/core/alpha` · `.live-fixture/core/alpha:p:1` |
| **R-5** | `user4_main_editable` — focus + store read-back | `.live-corpus/alpha` | `.live-fixture/core/alpha` |
| **R-6** | `user9_search_open_in_tab` — the `/alpha/` tab match | `.live-corpus/alpha` (matched **by title text**) | `.live-fixture/core/alpha` |
| **R-7** | `uf_tabs_3` · `uf_tabs_4` — the two-tab focus pair and the exact-title assertions | `.live-corpus/alpha` · `.live-corpus/beta` | `.live-fixture/core/alpha` · `.live-fixture/core/beta` |
| **R-8** | `uf_hist_6` · `uf_layout_2` — focus/edit/read-back and `edit.set_content{nodeId}` | `.live-corpus/beta` | `.live-fixture/core/beta` |
| **R-9** | `toolbar_undo` — the fallback document id | `.live-corpus/alpha` | `.live-fixture/core/alpha` |
| **R-10** | `v1_adjacency` · `v2_scoped` — the document id the traversal reads | `.live-corpus/alpha` · `filters.documentPathPrefix: ['.live-corpus']` | `.live-fixture/core/alpha` · `['.live-fixture/core']` |
| **R-11** | `v3_docnav` — the folder/document row comparison against the store list | `.live-corpus` (the folder family it enumerates) | `.live-fixture/core` |
| **R-12** | `u_edit_1_live_commit_failure_warning` — the explicitly opened failure-fixture document | `.live-corpus/alpha` | `.live-fixture/core/alpha` **and F-2's `table.md` is NOT the subject: the inline element is P-γ's property, carried by F-1's `alpha`** |
| **R-13** | `u_edit_1_live_package_table_limitation` — its candidate scan's first candidate and its second (`defects`) | `.live-corpus/alpha` · `defects` | `.live-fixture/table/table` **first** (the stored-`<table>` document — this is the entry that makes the row drivable at all; the `defects` candidate stays as the row's own fallback and is not this unit's) |
| **R-14** | `boot_landing` — the file it writes and imports (`live4-first.md`) | `.live-corpus/live4-first.md` | **NOT RE-PINNED AS AN IDENTITY**: the block **writes its own input**, so the file it authors moves to **`.live-fixture/core/live4-first.md`** in the same edit as the materialisation root, and **its `selfProvisioning:true` entry and `UF-STAGE-1` row id are untouched.** |
| **R-15** | `import1` · `ms_store` — the fresh files they write and import (`import1-fresh.md`, `ms3-fresh.md`) | `.live-corpus/import1-fresh.md` · `.live-corpus/ms3-fresh.md` | `.live-fixture/core/import1-fresh.md` · `.live-fixture/core/ms3-fresh.md` (same reason as R-14). |

**⟨GATE-2 `2026-10-05` — TWO RE-PIN CLAUSES ARE ADDED TO THIS TABLE, EACH CORRECTING A FILED CELL RATHER THAN THE METHOD:**

- **`R-13`'s RE-PIN IS UNSATISFIABLE AS FILED (`§16.2`).** The filed cell names `.live-fixture/table/table` as the
  scan's **FIRST** candidate, but the landed scan's candidate list is **`['.live-corpus/alpha', 'defects']` followed by
  `list.slice(0, 12)` of `rag.list_documents`** — a **slice position is not a contract**, and `.live-fixture/table/table`
  is **in that list only if the store happens to return it inside the first twelve**, i.e. the "first candidate" claim
  would be **unfalsifiable**. **THE RULING: the candidate list becomes ONE LITERAL EXPRESSION whose head is the table
  document's own identity — `['.live-fixture/table/table', 'defects']` (the stored-`<table>` document FIRST, the row's
  historical `defects` fallback second), and the `list.slice(0, 12)` fallback stays BELOW both** — so `R-13`'s contract
  is an **index/ordering clause over a literal list** and not a claim about what the store returns. **Under a selected
  set the head is the set's own identity; with no fixture selected the head keeps its pre-arg value** (`§16.2`), which is
  what keeps the neutral default unmoved.
- **`R-14`/`R-15` WRITE **UNCONDITIONALLY** AND ARE THEREFORE CONFINED (`§16.7`).** `boot_landing` · `import1` ·
  `ms_store` are `selfProvisioning:true` keys, so **no gate ever stops them**: under `--fixture=empty` or
  `--fixture=table` a filed `.live-fixture/core/...` literal would make those runs **materialise `core` (or write into a
  set the run did not select) and break `§11.3` item 8's "nothing written" reading**. **THE RULING: their write path is
  computed by a ROOT RESOLVER — the selected set's own root when a set is selected, the block's pre-arg path when none
  is — and NEVER a hardcoded `.live-fixture/core/` literal.** The three blocks keep their identities, their row ids and
  their `selfProvisioning:true` entries.

**THE RE-PIN'S DISCIPLINE, FOUR CLAUSES — each a fail-state the red set arms (`§11.2`'s `repin-completeness` term):**

1. **THE RE-PIN SET IS EXHAUSTIVE OR THE RUN IS INCONSISTENT.** A hardcoded identity that keeps the old path is a
   **false-negative setup read** (the block reads a document that does not exist under the selected set) and **must not be
   reported as an app FAIL** — it is a **defect of this unit** (`§11.2` `repin-completeness`, `§12` item 1). **⟨GATE-2
   `2026-10-05` — "EXHAUSTIVE" IS A CLAIM ABOUT THE **SWEEP**, NOT ABOUT THE TABLE ABOVE: the table is the
   `VERIFIED-BY-READ` enumeration of what the filing FOUND, and the `repin-completeness` arms (source sweeps for the OLD
   identity family) are what make completeness checkable (`§13.3` item 1). The two groups the gate-2 review corrected are
   `table-candidate` (`R-13`) and `self-provisioners` (`R-14`/`R-15`).⟩**
2. **EVERY RE-PIN IS BY DIRECT STRING SUBSTITUTION OF AN IDENTITY — never a rewrite of an assertion, never a relaxation
   of a clause, never a new row id.** **The row ids, the assertions and the surfaces stay byte-identical**; only the
   identity literal moves. **⟨GATE-2 `2026-10-05` — TWO EXCEPTIONS, BOTH STATED AT THE TABLE ABOVE AND NEITHER A REWRITE
   OF AN ASSERTION: `R-13`'s candidate head is an ORDERING CLAUSE over a literal list (`§16.2`) and `R-14`/`R-15`'s write
   path is a ROOT RESOLVER (`§16.7`). Both keep the row id, the assertion and the surface byte-identical and introduce
   no new identity family.⟩**
3. **THE PIN'S QUOTED IDENTITIES MOVE WITH IT, IN THE SAME PASS** (`§11.5`). A pin assertion whose quoted identity
   disagrees with the driver is a **red arm**, and a pass that fixes one without the other has landed a **contradiction**.
4. **THE NEW IDENTITIES ARE NAMED IN THE ARTIFACT.** The run prints the selected set's identity and (with it) **the
   materialisation root it wrote**, so a reader can map an id in a block's evidence to the set it came from (`§7.2`).

---

## 3. THE SELECTION ARG

### 3.1 Its name and its scope

**`--fixture=<setName>` — `SPEC-CALL`.** **The name is chosen against the driver's own arg vocabulary:** `--seed=`,
`--corpus-root=`, `--strict-seed`, `--o0-corpus=`, `--no-seed` are **all obsolete** (`§6`), so a name that shares a
prefix with any of them would invite exactly the confusion clause (3) forbids. **`--fixture=` names the FIXTURE, which is
what the ruling's arg names.**

**THE SEMANTICS, IN SIX CLAUSES:**

1. **IT IS LAUNCH-SCOPED.** It selects the set **this run's launch** uses. **It is NEVER PERSISTED** — not to the app's
   settings, not to the scratch HOME, not to any profile file, **and it never survives into a later run.** **A launched
   app's subsequent behaviour does not re-read it**, and **no app-side state records it** (`src/**` is denied, `§1.3`).
2. **ARGV WINS.** The value comes **only** from `process.argv` (the driver's own `argv` walk, in `main`). **No environment
   variable, no config file and no default-from-another-arg exists** — **a `--fixture` value read from anywhere but the
   argv is a review finding** (the arm is `§11.2` `argv-only`).
3. **ADDITIVE AND NEUTRAL BY DEFAULT — `SPEC-CALL`, WITH ITS GROUND AND ITS RISK.** **An invocation WITHOUT `--fixture=`
   behaves EXACTLY as it does today**: the state stays **`no fixture data set selected`**, **no set is materialised, no
   set is imported, and no existing launch profile changes.** **Ground: the `--no-seed` / empty-group refusals and the
   whole existing battery's readings rest on the default launch being unmoved; making a mock set the default would move
   every default-run reading in the same pass that adds the fixture, which is the opposite of additive.** **Risk,
   recorded: a bare launch therefore exercises NO fixture, and `UNIT A`'s `none` state remains the default — so the
   acceptance run for every set MUST name it.**
4. **THE VALUE IS A FREE OFFSET TO A CLOSED SET.** The grammar accepts the closed set of `§3.2` **and nothing else**; the
   arg is **not** a path, **not** a count, **not** an id shape and **not** a comma list.
5. **ONE SET PER RUN, AND THE LAST WINS IS FORBIDDEN.** **Repeating `--fixture=` with a DIFFERENT value is REFUSED BY
   NAME** (`§3.3` clause 4) — *"last wins"* would make the run's identity depend on argv order, which is the class of
   ambiguity the empty-`--groups=` refusal closed.
6. **IT IS PRINTED.** The selected set's identity rides the run's own fixture state at **all four print sites UNIT A
   contracted** (`§7`). **⟨GATE-2 `2026-10-05` — "AT ALL FOUR SITES" IS TRUE OF THE STATE **BINDING**, NOT OF EVERY LINE:
   because the state is assigned AFTER the refusal branches (`§7.2` clause 3), the refusal lines and the module-level
   `main().catch` line print the **`none`** state, and the selected set's NAME rides the LAUNCH PROFILE and the SUMMARY
   lines only (`§16.5`). `§3.3` clause 2's "states the fixture state on that line" is read accordingly.⟩**

### 3.2 The grammar (exact)

| Aspect | The rule |
| --- | --- |
| **Flag form** | **`--fixture=<setName>`** (the driver's `--<name>=<value>` form). **The bare form `--fixture` (no `=`), and `--fixture =core` (a space), are NOT this arg** — the driver's argv walk matches `^--([a-z0-9-]+)=(.*)$`, so a bare `--fixture` is **not parsed at all** and **falls into the no-flag default** (`§3.1` clause 3). **`SPEC-CALL`: the space form is deliberately NOT added** — the driver has no space-form flags, and adding one would be a new parse shape for one arg. |
| **Accepted values (closed set)** | **`core` · `table` · `search` · `tabs` · `empty`** (`§2.1`). **Nothing else is accepted, in any case or spelling** — the comparison is **exact string equality against this list**; there is **no lowercasing, no trimming into the set and no prefix matching**. |
| **Empty value** | **`--fixture=` (an empty value) is REFUSED BY NAME** (`§3.3` clause 1). **It is not the `empty` set**: `empty` is a **selected set with a name**, and the empty value is **no name at all**. |
| **Malformed / unknown value** | **REFUSED BY NAME** (`§3.3` clauses 2/3), listing the accepted names. |
| **Value whitespace** | **Not trimmed.** `--fixture= core` (a leading space) and `--fixture=core ` (a trailing space) are **unknown values** and are **refused** — the refusal message shows the offending text **verbatim** so the operator sees the space. |
| **Repeats** | **Two DIFFERENT values ⇒ refused** (`§3.1` clause 5). **The IDENTICAL flag repeated with the same value is admissible** (it selects the same set and changes nothing) — **and that is the only repeat form admitted.** |
| **Case** | **Case-SENSITIVE**: `--fixture=CORE` is an unknown value and is refused. |

### 3.3 The refusal behaviour — the same discipline the ports and `--home` now use

**EVERY REFUSAL BELOW IS A PRE-SPAWN REFUSAL**, i.e. it is decided and printed **before anything is spawned**, on the
same early `main` path as the `--groups=` empty-value, the port and the `--home` refusals (`VERIFIED-BY-READ` at the
driver's three existing refusal branches):

1. **ONE NAMED LINE, THE `ARG-REFUSED` MARKER.** The line begins `[live-drive] ARG-REFUSED:` and **names the offending
   value verbatim, the reason, and the accepted names** — *"pass `--fixture=<core|table|search|tabs|empty>` or omit the
   flag to take the neutral default (no fixture data set selected)"*. **⟨GATE-5 AMENDMENT `2026-10-05` — *"NAMES THE OFFENDING VALUE VERBATIM"* IS UNMOVED AND IS JOINED BY A NAMED SIBLING ON THE `S-6` PATH ONLY: **THE LINE MUST ALSO NAME THE OFFENDING **FLAG**, BY ITS OWN NAME, WHERE THE OFFENCE IS A SUPPLIED SUPPLY FLAG** (`§6.4`'s gate-5 block, `§21.2`; greens row `B-1`). On `A-1`…`A-4` the offending VALUE was and remains the whole subject; this clause is otherwise untouched.⟩**
2. **IT STATES THE FIXTURE STATE ON THAT LINE**, exactly as the three existing refusal paths do — **`fixture=` plus the
   run's own fixture state** (`§7.3`). **A refusal is a reading about the run's identity** (UNIT A's own justification,
   carried here by the same idiom). **⟨GATE-2 `2026-10-05` — THE READING IS RULED, AND ONE FILED SUB-CLAUSE IS
   SUPERSEDED (`§16.5`): the state ON A REFUSAL LINE IS ALWAYS THE `none` TRIPLE, for EVERY `A-1`…`A-4` AND `S-6` line,
   INCLUDING the `--fixture` refusal's own line — because the assignment sits after the refusal branches (`§7.2` clause
   3) and there is NO path on which a parsed `--fixture=` value has already reached the state when an offence is seen.
   THE OFFENDING VALUE IS NAMED **IN THE REFUSAL TEXT** (`--fixture=<value>`), NOT IN THE STATE. `§7.2` clause 2's *"the
   `none` state unless a valid `--fixture=` was parsed before the offence was seen"* is the SUPERSEDED form and is kept
   visible at its site.⟩**
3. **EXIT CODE `2`** — the driver's hard-error code, the same one the four existing `ARG-REFUSED` paths set. **Nothing is
   spawned**: no child, **no scratch HOME** (the mint sits BELOW every refusal), and **no set is materialised**.
4. **NOTHING IS WRITTEN.** A refused run creates no directory, removes nothing and leaves no artifact — **so a refused
   `--fixture=` invocation cannot be mistaken for a run**.
5. **THE REFUSAL IS NOT A PARK AND NOT A `FAIL`.** It is a `DIAG`-class refusal of a *request*: **no row is verdicted, no
   `parkReason` is emitted and no fixture absence is inferred.** **The four fail-states, each named and each its own red
   arm (`§11.2` `refusal-arms`):**

| # | Fail-state | Trigger | Contracted observable |
| --- | --- | --- | --- |
| **A-1** | **EMPTY VALUE** | `--fixture=` | `ARG-REFUSED` names the **empty value** and the accepted set; exit `2`; nothing spawned, nothing written. |
| **A-2** | **UNKNOWN VALUE** | a value not in the closed set (a typo, a path, a number, the obsolete flag names) | `ARG-REFUSED` shows the value **verbatim** and **lists the closed set**; exit `2`. |
| **A-3** | **MALFORMED VALUE** | whitespace / mixed case / a comma list (`--fixture=core,table`) | `ARG-REFUSED`; exit `2`. **The class is not a launch profile**: nothing may be *"partially applied"*. |
| **A-4** | **CONFLICTING REPEAT** | `--fixture=core --fixture=table` (two DIFFERENT values) | `ARG-REFUSED` naming **both** values; exit `2`. |

**AND THE ARG'S NON-REFUSAL STATES ARE NAMED TOO, SO `A-1`…`A-4`'s complement is explicit:** `--fixture=core` alone ·
`--fixture=core` repeated identically · `--fixture=core` with `--no-seed` · **no `--fixture` at all** — **all four
proceed**, and the last one proceeds with `fixtureKind: 'none'`.

---

## 4. THE SET-SELECTION FAILURE STATES (after the arg is accepted)

**THESE ARE RUN STATES, NOT ARG REFUSALS** (`§3.3` is decided pre-spawn; these happen after the launch or during the
materialisation). **Each is named, each is a TestWriter row, and each is a `DIAG`/abort-class outcome — never an app
`FAIL`, never a silent substitute.**

| # | Fail-state | Trigger | Contracted observable |
| --- | --- | --- | --- |
| **S-1** | **THE SET MATERIALISES AND IMPORTS** (the happy path) | a selected set, the import route available | the run's artifact names the set **and** the materialisation root; the store lists the set's documents; the blocks declaring `'corpus-documents'` run and carry their own verdicts. |
| **S-2** | **THE MATERIALISATION FAILS** | a write error under `.live-fixture/<set>/` | **abort with a named error** (`[live-drive] ERROR:` path) stating the set, the path and the OS error text **verbatim**; exit `2`; **no blocks run**; **the fixture state on that line names the set that was ATTEMPTED** (`§7.3`). **Never a fallback to another set, never a silent empty store.** |
| **S-3** | **THE IMPORT REPLIES `isError`** | `edit.import_markdown` refuses (e.g. the `edit` group is not effective) | the failure is **named verbatim** through the driver's existing `driverFailureReason` marker, **the seed-wait's discriminated read stops on it** (no timeout burned), the run proceeds, and **every gated key whose own declared fixture reads absent parks by name**. **The set WAS selected, so this is a precondition failure of the run — it is not a park of the unit and not an app FAIL.** |
| **S-4** | **THE SET IS `empty`** | `--fixture=empty` | **no import is attempted at all** (the set has no files): the run proceeds, **every gated key's own fixture probe reads absent, every gated key parks by name**, and the artifact states `empty` **as the selected set** — **the fixture-absent acceptance run, declared rather than accidental.** |
| **S-5** | **`--connect` WITH A SELECTED SET** | `--connect` attaches to a **RUNNING** app | **the set's materialisation runs, the IMPORT is SKIPPED** (a running app owns its store: importing into it would mutate a store this run did not create), and **the artifact says so** — the state names the set **and** the `connect` mode, so a reader cannot read the store's contents as the set's. **The blocks then read whatever the running app holds**, which is exactly why the declaration must carry the mode. |
| **S-6** | **A SET SELECTED ALONGSIDE AN OBSOLETE-ROUTE FLAG** | `--fixture=<a set>` together with `--seed=` / `--corpus-root=` / `--strict-seed` / `--o0-corpus=` / `--no-seed` | **REFUSED BY NAME, pre-spawn, exit `2`** — see `§6.4`, where the rule and its exception (`--no-seed`, which is compatible with the `empty` set and with every set as the *"do not run the obsolete seed"* flag) are stated. **⟨GATE-2 `2026-10-05` — THE REFUSAL LIST IS THE FOUR SUPPLY FLAGS (`--seed=` · `--corpus-root=` · `--strict-seed` · `--o0-corpus=`), AND `--no-seed` IS NEVER A REFUSAL TRIGGER: `--fixture=<a document-carrying set>` now IMPLIES `--no-seed` internally (`§2.3` clause 7, `§16.13`), and an EXPLICIT `--no-seed` is admissible and refused on no path (`§6.4` clause 3). The `S-6` trigger cell's inclusion of `--no-seed` is the SUPERSEDED form and is kept visible.⟩** |

**NONE OF `S-2`…`S-6` MAY BE PLEADED AS A REASON A ROW PASSES, AND NONE MAY BE READ AS AN APP READING** (`§9`).

---

## 5. THE PER-DECLARED-FIXTURE PROBES — THE FIRST DELIVERABLE

### 5.1 What the probes must change, stated as the `F-2` requirement

**AT THIS HEAD THE REGISTRY'S THREE CORPUS NAMES ALL CARRY `read: 'rag.list_documents'`** (`VERIFIED-BY-READ` at the
landed `UF_DECLARED_FIXTURE_PROBES`), and `ufFixturePreconditionRead` derives `present` from **the same `documents`
count** — so the per-declared-fixture conjunct is **behaviourally identical to the run-wide read**. **The fix is not a
new registry shape** (UNIT A's `read` / `settles` / `unsettled` triple and the `resolved !== true` false-park guard
**STAND**): **it is that the two non-store probes must actually READ the surface they name.**

**THE CONTRACT, ONE SENTENCE: FOR EVERY GATED DECLARED `fixtureName`, THE PROBE REGISTRY ENTRY'S `read` MUST BE A READ
OF THAT FIXTURE'S OWN SURFACE — AND FOR `'corpus-query-results'` AND `'corpus-document-tabs'` THAT SURFACE IS A RENDERED
ONE, SO THEIR PROBES MUST BE RENDERED READS, NOT THE STORE LIST.**

**⟨GATE-2 THIRD LOOP `2026-10-05` — THAT ONE SENTENCE IS RE-STATED, BECAUSE ITS SECOND HALF IS FALSE OF ONE OF THE TWO
NAMES IT NAMES AND ITS TRUTH IS WHAT MADE `class-(b):tabs` UNGREENABLE (`§18.2`). THE SUPERSEDED SENTENCE IS KEPT VISIBLE
IMMEDIATELY ABOVE AND IS NOT REWRITTEN. THE READING OF RECORD:**
**FOR EVERY GATED DECLARED `fixtureName`, THE PROBE REGISTRY ENTRY'S `read` MUST BE A READ OF **THAT FIXTURE'S OWN
ABSENCE QUESTION** — AND FOR THE TWO RENDERED-FIXTURE NAMES THAT QUESTION IS **NOT THE SAME QUESTION**: `'corpus-document-tabs'`
ASKS *"is a document tab RENDERED in the strip at the pre-gesture read point?"* (a DOM read, **`'dom:#tab-strip
.tab[data-document-id]'`**, unchanged) while `'corpus-query-results'` ASKS *"does the CORPUS hold a document matching the
probe's term?"* — **a STORE QUESTION ABOUT THE FIXTURE'S CONTENT**, read by **`'rag.query'`** with the probe's own constant
term (`§18.2` clause 1). **THE TEST A READ MUST PASS IS THEREFORE NOT *"IS IT A RENDERED READ?"* BUT *"CAN IT READ ABSENT
WHILE `pre` READS PRESENT, AND DOES IT READ **DIFFERENTLY** UNDER `--fixture=search` AND `--fixture=tabs`?"*** (`§18.6`).**⟩**

### 5.2 The probes, one per declared fixture name

**THE REGISTRY'S MEMBERSHIP IS UNCHANGED (UNIT A's closed set), and NO NEW `fixtureName` IS ADDED** (`§1.3`: a sixth name
is a declaration amendment, not this unit's act). **⟨GATE-2 `2026-10-05` — WHAT *IS* AMENDED IS THE `read` FORM, WHICH THE
FILED TEXT LEFT AS PROSE AND THE PIN CANNOT GRADE FROM PROSE (`§16.3`).⟩**

**THE FIVE ROWS' `read` FORMS ARE **NAMED SENTINEL STRINGS** AND ARE CONTRACTED LITERALLY HERE, BECAUSE THE ARM THAT
GRADES THEM COMPARES STRINGS AND THE PIN'S OWN TOOTH REQUIRES `read` TO BE **A STRING OR AN EXPLICIT `null`** (`§16.3`,
`§16.8`). **THE SENTINELS, EXACTLY AS THE REGISTRY MUST CARRY THEM:**

| `fixtureName` | **THE `read` LITERAL OF RECORD** | What the value NAMES |
| --- | --- | --- |
| **`'corpus-documents'`** | **`'rag.list_documents'`** | an MCP tool read (the store's document list) — **UNCHANGED, and it must stay a TOOL-NAME string**. |
| **`'corpus-query-results'`** | **`'rag.query'`** — **⟨GATE-2 THIRD LOOP `2026-10-05` — RE-STATED; THE FILED LITERAL `'dom:#pane-search li[data-document-id]'` IS `SUPERSEDED` AND IS KEPT VISIBLE IN THIS CELL (`§18.2`).⟩** | **an MCP TOOL READ**, the same non-`'dom:'` form as `'corpus-documents'`'s — `rag.query` called with **the probe's OWN constant term** (`§5.3` clause 1) **and no other argument**, taken at **the pre-gesture read point `§18.1` defines**; **the reading is the reply's own hit count** (`results`/`ranked`, `§18.2` clause 3). **THE DOM READ THIS NAME CARRIED AS FILED IS NO LONGER ITS OPERATIVE LIMB: at the pre-gesture point it cannot separate `search` from `tabs` (`§18.2` clauses 2/4), so it graded nothing and made `class-(b):tabs` ungreenable. THE DOM LIMB IS NOT RE-TAKEN BY THE PROBE (`§18.2` clause 5); the name whose axis IS the rendered surface keeps it (`'corpus-document-tabs'`, `§16.6`).** **⟨GATE-5 RULING `2026-10-05` — THE STORE-QUERY LIMB IS THE ARCHITECT'S OUTCOME AND IT IS **`OWED`** AT THIS HEAD: measured, `rag.query` reads `0 hit(s)` under EVERY set, including `--fixture=core`, because the set's document content does not reach the store's lexical index (the index is built at engine construction from the EMPTY store and reconciled on import with document ROOT ids only, while `parseMarkdown` puts the body into separate `:section:`/`:p:` nodes and leaves the root's `content` empty; the implementer measured `9` nodes, `3` carrying the term, and every query `0` — even for the bare stopword-free term).** **THE RULING IS *"ADAPT THE MOCK DATA TO FUNCTION WITH THE QUERY"*: the DATA (and its materialisation route — this unit's OWN surface) must be adapted so the term REACHES THE LEXICAL INDEX by the app's own import path; the `read` literal, the dispatch, the `driverReadFailure` classification and every acceptance reading are UNCHANGED. THE DATA-FORM REQUIREMENT, EXACTLY, IS `§22.2` ITEM 1.**⟩** |
| **`'corpus-document-tabs'`** | **`'dom:#tab-strip .tab[data-document-id]'`** | a **DOM READ**, discriminated by the `'dom:'` prefix; the remainder is **the exact selector whose rendered-row COUNT is the reading** — the landed document-tab row selector `ufTabStripRead` keys its own `docTabRows` const by (`§16.6` — the `'[data-target-kind="document"]'` spelling this unit filed is **NOT** the landed surface and is superseded). **⟨GATE-2 THIRD LOOP `2026-10-05` — THIS IS THE **ONLY** `'dom:'` SENTINEL THE REGISTRY CARRIES (`§18.2`); IT IS ALSO THE ONE WHOSE AXIS GENUINELY IS THE RENDERED SURFACE, WHICH IS WHY IT KEEPS THE DOM FORM WHILE `'corpus-query-results'` DOES NOT. THE ROW-COUNT IS TAKEN AT THE PRE-GESTURE READ POINT (`§18.1`) AND IT **DOES** DISCRIMINATE: `core`/`table`/`search` leave a document tab open at launch, `tabs` does not (`§2.1` `F-4`, `§2.2` P-θ).⟩** |
| **`'self-provisioned-document'`** | **`null`** | no read; the fixture is the block's own write+import. |
| **`'none'`** | **`null`** | no read; a `corpusRead:false` entry declares no corpus fixture. |

**⟨GATE-5 AMENDMENT `2026-10-05` — D-3 · GREENS ROW `H-9` (fail ledger `F-4`) · THE `stage_*` FIGURE IS `7`, NOT `8`, AND ITS GATED FAMILY ARITHMETIC IS `7 + 5 = 12`, NOT `8 + 5 = 13`. THE SECOND PROBE TABLE'S `'corpus-documents'` POPULATION CELL AND `§16.17` ITEM 2'S TRAILING FAMILY SENTENCE BELOW CARRIED THE FIGURE; BOTH ARE AMENDED BESIDE AND THE SUPERSEDED TEXT STAYS VISIBLE. THE AUTHORITY IS THE ENUMERATION (`§16.17` item 2's list), WHICH PRINTS `7` `stage_*` NAMES + `5` `o0_*` NAMES AND IS THE SAME PRECEDENCE THE `§20` CENSUS AMENDMENT ESTABLISHED. FULL REGISTER, EACH SITE AND ITS ARITHMETIC: `§21.3`.⟩**

**THE DISPATCH THAT MAKES THOSE TWO STRINGS READABLE, AND WHY IT IS THE ONLY FORM THAT SATISFIES BOTH CONTRACTS AT ONCE:**
`ufFixturePreconditionRead` receives `probe.read` as a **STRING**, so the read cannot be a function and cannot be a second
registry shape (UNIT A's `read`/`settles`/`unsettled` triple **STANDS**). **THE DISCRIMINATED DISPATCH IS THEREFORE: a
`read` that begins with the literal prefix `'dom:'` is a DOM read of the selector that follows it, taken through the
driver's own `h.cdp.evaluate` row-count idiom; ANY OTHER non-null `read` is an MCP tool NAME, taken through
`h.mcpRead(read, {})` exactly as today; and `null` is the never-gated form (the existing early return, with its
`declared-fixture-unprobed` extra and `resolved:false`).** **A `read` string that is neither `null` nor of one of these
two forms is an OFFENCE, not a third kind of read** — the registry's `read` is either a tool name or a `'dom:'` selector.

**THE THREE ROWS STAND, with three of them now reading their own surface:**

| `fixtureName` | `read` — **as this unit contracts it** | `settles` (what the probe's reading DOES decide) | `unsettled` (what it does NOT — named, never inferred) | Who is gated on it (the population, `VERIFIED-BY-READ` of the landed declaration) |
| --- | --- | --- | --- | --- |
| **`'corpus-documents'`** | **`rag.list_documents`** — **UNCHANGED, and its LITERAL is `'rag.list_documents'`.** **⟨GATE-2 `2026-10-05` — `30` KEYS ARE GATED ON THIS FIXTURE AT THIS FILING'S HEAD AND `31` AFTER THE `§16.1` AMENDMENT (`RECORDED READING`, measurer: the supervisor's shell on this pass's evidence; and `VERIFIED-BY-READ` against `§16.17` item 2's own enumeration, which is THE AUTHORITY and reads `31`); the FILED `24`/`25` ARE `SUPERSEDED` AND ARE KEPT VISIBLE HERE (`§20`); the population list in the right-hand cell is ILLUSTRATIVE and its key-by-key correction is `§16.17`.⟩** | whether the store carries any corpus document at all (the doc-nav / document-body fixture the set IS). | *(none)* — **the store list IS this fixture**, so this probe is total over it. | the bulk of the gated set (`34`'s majority): `tabs` · `toolbar_undo` · `v1_adjacency` · `v2_scoped` · `user4_main_editable` · `repro_nbsp` · `repro_dup_para` · `uf_tabs_1` · `uf_tabs_3` · `uf_tabs_4` · `uf_panes_12` · `uf_panes_12_diag` · `uf_hist_4` · `uf_hist_6` · `uf_layout_2` · `u_edit_1_live_commit_failure_warning` · `shell_integration` · `v3_docnav` · the seven `stage_*` and the five `o0_*` keys, **plus `u_edit_1_live_package_table_limitation` after the `§16.1` amendment** **⟨GATE-5 AMENDMENT `2026-10-05` — THIS CELL'S EARLIER GATE-4 CLAUSE THAT THE FILED `seven`/`eight` CORRECTION AND THE `13` FAMILY FIGURE ARE UNMOVED IS `SUPERSEDED` AND KEPT VISIBLE: THE FILED `seven` WAS RIGHT, THE GATED FAMILY IS `7 + 5 = 12` WITH REMAINDER `19`, AND `13` SURVIVES ONLY AS THE DECLARED `stage_*` FAMILY CENSUS (`8`, the never-gated `stage_tabs_persist_roundtrip` included) BESIDE THE `5` `o0_*` — `13 − 1 = 12` INSIDE THE `31`. THE `31` AND THIS CELL'S OTHER FIGURES ARE UNMOVED (`§21.3`; greens row `H-9`, fail ledger `F-4`).⟩** **⟨GATE-5 AMENDMENT `2026-10-05` — THE FILED `seven` IN THIS SENTENCE WAS CORRECT AND THE `§17.2`/`§17.13` CORRECTION OF IT TO `eight` (AND THE `8 + 5 = 13` / remainder `18` FIGURES THAT FOLLOWED FROM IT) ARE `SUPERSEDED` AND ARE KEPT VISIBLE AT THEIR OWN SITES. THE BINDING READING: `7` `stage_*` KEYS ARE GATED ON `'corpus-documents'` (`stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r` — exactly the seven `§16.17` item 2 enumerates) + `5` `o0_*` = `12`, and the GATED remainder is `19` (`12 + 19 = 31`). `stage_tabs_persist_roundtrip` — the key `§17.2` called *"the eighth"* — is a `corpusRead:false` key of the never-gated group (`§2.1` group 4, greens row `H-2`), so it is NOT among the `31`; the `8` counts the DECLARED `stage_*` family over all `47` entries and the `13` counts that family beside the `5` `o0_*` keys, which is why `13 − 1 = 12`. GREENS ROW `H-9` (fail ledger `F-4`), measured `7` + `5` = `12` inside the `31`.⟩** (`§16.17` names all `31`). **⟨GATE-4 AMENDMENT `2026-10-05` — THE FIGURE IN THIS PARENTHESIS IS `31`, NOT `25`: `§16.17` item 2's enumeration IS the authority and IT READS `31` (`VERIFIED-BY-READ`; the `31` is also a `RECORDED READING` of the supervisor's shell's declaration census on this pass's evidence). The FILED `25` IS `SUPERSEDED` AND IS KEPT VISIBLE HERE (`§20`); the `seven`/`eight` correction beside it and the `13` family figure are UNMOVED.⟩** **⟨GATE-2 SECOND LOOP `2026-10-05` — THIS CELL IS CORRECTED IN PLACE (`§17.2`): THE FILED COUNT **`seven` `stage_*`** WAS WRONG — the authority (`§16.17` item 2, `VERIFIED-BY-READ` of the declaration literal) names **`eight`**: `stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r` · `stage_tabs_persist_roundtrip` — the eighth, `stage_refresh_survival_v5`, is the one `§16.9`/`§16.10` ADDED to the inventory. **`eight` `stage_*` + `five` `o0_*` = `13`, NOT the `12` the filed `seven` implied.** THE FILED WORD `seven` IS KEPT VISIBLE IN THIS SENTENCE AND IS SUPERSEDED; **and the cell's *"names all `31`"* is TRUE OF THE OTHER `30` KEYS — this cell's own enumeration lacks `u_edit_1_live_package_table_limitation` `u_edit_1_live_package_table_limitation`, which is named in the SAME sentence as the `§16.1` amendment's addition `§16.1` amendment's addition — so the `25` is carried by the CELL, not by the filed enumeration, and `§16.17` item 2 is the exhaustive authority (`§17.12`).**⟩** |
| **`'corpus-query-results'`** | **THE STORE'S OWN HIT CENSUS FOR THE PROBE'S TERM: `read` literal `'rag.query'`, called with the probe's OWN constant term (`§5.3` clause 1) at the pre-gesture read point (`§18.1`).** `present = (the store query RESOLVED — no `isError` reply and no transport failure, `driverReadFailure`'s unchanged rule) && (at least one hit for the probe's term)`; `resolved = (the store query resolved)`. **`SPEC-CALL`, with its ground: `present` must be a reading that `--fixture=search` and `--fixture=tabs` can ANswer DIFFERENTLY, and the painted-row count cannot (`§18.2` clauses 2/4); the term-bearing-document fact is the FIXTURE's own content fact, and `search` is defined precisely by NOT carrying it (`§2.1` `F-3`).** **⟨GATE-2 `2026-10-05` — THE `read` LITERAL CONTRACTED BY THE GATE-2 FIRST LOOP IS `'dom:#pane-search li[data-document-id]'`; THE STORE-side limb is the DISCRIMINATED store query the probe runs, `rag.query` for the probe's OWN constant term, whose `isError`/transport classification is `driverReadFailure`'s (the same rule as every other read, `§5.2` clause 3). A store query that RESOLVES with no matching document makes the probe read present:false at `resolved:true` — that IS `--fixture=search`'s `FA-1` reading (`§5.5`). **⟨GATE-2 THIRD LOOP `2026-10-05` — THE FIRST LOOP'S READING IS `SUPERSEDED` AND IS KEPT VISIBLE IN THIS CELL: ITS `read` LITERAL IS NO LONGER `'dom:#pane-search li[data-document-id]'` (it is `'rag.query'`, the sentinel table above) AND ITS PREDICATE'S THIRD CONJUNCT — *"(at least one result row is PAINTED)"* — IS DROPPED, BECAUSE AT THE PRE-GESTURE READ POINT THAT CONJUNCT IS **ALWAYS FALSE IN EVERY RUN** AND THEREFORE CANNOT SEPARATE THE TWO SETS (`§18.2` clause 4). THE ORDER CLAUSE (*"the store query FIRST"*), THE `driverReadFailure` CLASSIFICATION, THE NO-GESTURE RULE AND THE RESOLVED-ABSENCE SEMANTICS ALL STAND UNCHANGED.⟩**⟩** | whether the corpus holds a document MATCHING THE PROBE'S TERM — i.e. whether the fixture `'corpus-query-results'` NAMES is present **in the CORPUS the result rows would be painted from**. | the searched pane's own view/expanded state, the operator's term, **and — stated so it is never inferred — the RENDERED ROW STATE at the read point**: the probe does NOT read the painted rows (`§18.2` clause 5), so whether a result row is painted when the block later runs is the BLOCK's own subject, never this fixture's answer. **The probe uses its OWN term, never the operator's** (`§5.3` clause 3). | **`uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`** — the `3` keys the declaration carries on this fixture (`§17.1` clause 3). |sture reading, not a fixture reading). | **`uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`** (`READ` by the driver, not inferred). |
| **`'corpus-document-tabs'`** | **THE RENDERED DOCUMENT-TAB ROW CENSUS, read as a DOM count of `#tab-strip .tab[data-target-kind="document"]`.** `present = (the strip read resolved) && (the count >= 1)`. **`SPEC-CALL`, with its ground: the strip is always present, so the count is total over the fixture and its ABSENCE is a real reading (zero document tabs open) rather than an unreadable DOM.** **⟨GATE-2 `2026-10-05` — THE SELECTOR IS SUPERSEDED (FINDING 6): the landed surface of record is the tree's own `ufTabStripRead`'s `docTabRows = '#tab-strip .tab[data-document-id]'`, echoed in the declaration entry's `surface` prose (*"the tab strip document rows"*), and `'[data-target-kind="document"]'` appears in the tree ONLY as a per-row ATTRIBUTE the same helper reads beside the id, never as the corpus-keyed row selector. THE `read` LITERAL IS THEREFORE `'dom:#tab-strip .tab[data-document-id]'`; the superseded spelling is kept visible in this cell rather than rewritten.⟩** **⟨GATE-5 RULING `2026-10-05` — `§16.6`'s HEADLINE CLAIM AND THIS CELL'S *"the landed surface is `#tab-strip .tab[data-document-id]'`"* ARE **WRONG AT THIS HEAD** AND ARE `SUPERSEDED` (`§22.3`): `src/renderer/tab-strip.ts` authors only `data-tab-id` + `data-target-kind`, and `data-document-id` exists in `src/renderer/pane-graph.ts` for **PANES**, never on `#tab-strip .tab` — so **THE LITERAL EXISTS ONLY IN THE DRIVER, NEVER IN THE APP**, and the selector CAN NEVER MATCH. THE `read` LITERAL IS UNCHANGED AND STAYS CONTRACTED (it is the acceptance predicate's own subject); WHAT CHANGES IS ITS **STATUS**: the `corpus-document-tabs` probe is **SKIPPED-BY-RULING** — the tab strip is a fork UI implementation being rebuilt on the foundation tooling — and **the skip is NOT a pass**. THE EXEMPTION ROW, THE REASON AND THE EXACT SKIP WORDING ARE `§22.3`.**⟩** **⟨PARKED RESIDUE (b) — *"THE ROW PAINTS A SELECTOR THE SENTINEL TABLE DOES NOT CONTRACT"*: THIS CELL'S `present` CLAUSE WAS WRITTEN AGAINST THE FILED SPELLING `#tab-strip .tab[data-target-kind="document"]` WHILE THE SENTINEL TABLE CONTRACTS `'dom:#tab-strip .tab[data-document-id]'`. THE ROW'S OWN BRACKET ALREADY SUPERSEDES THE SPELLING AND THE SENTINEL TABLE IS THE BINDING FORM; **THE LANDING PASS RE-WORDS THIS CELL'S `present` CLAUSE TO THE CONTRACTED LITERAL** — a one-string edit, a `§18.7` residue (b), **not a contract question and not a fourth-round finding.**⟩** | whether a document tab is **ACTUALLY OPEN** in the strip. | whether a document tab *can* be opened — that is a capability of the store, and it is `'corpus-documents'`'s question, not this one's. | **`user9_search_open_in_tab`** alone. |
| **`'self-provisioned-document'`** | **`null` — UNCHANGED, and it must stay `null`.** | nothing: the fixture is the block's OWN write+import. | — | the `10` `selfProvisioning:true` keys; **never gated**, and a probe here would make a **false park** of a block that supplies its own input. |
| **`'none'`** | **`null` — UNCHANGED.** | nothing: a `corpusRead:false` entry declares no corpus fixture. | — | the `3` `corpusRead:false` keys; **never gated**. |

**THREE CLAUSES ABOUT THE PROBES' RETURN SHAPE — so a TestWriter can derive every state:**

1. **A RESOLVED ABSENCE IS A PRESENCE VERDICT OF `false`.** Both new DOM probes return **`resolved: true`** whenever the
   DOM read completed (including a count of `0`), with **`present: false`** for `0`. **A probe that could not read
   (the CDP read threw, the store query replied `isError`) returns `resolved: false`** — **and `resolved: false` PARKS
   NOBODY** (UNIT A's false-park guard, unchanged). **⟨GATE-2 THIRD LOOP `2026-10-05` — *"BOTH NEW DOM PROBES"* IS
   RE-STATED: AFTER `§18.2` THERE ARE **TWO PROBE FORMS**, NOT TWO DOM PROBES — `'corpus-document-tabs'` IS THE ONE DOM
   READ REMAINING (`'dom:#tab-strip .tab[data-document-id]'`, `present = count >= 1`) AND `'corpus-query-results'` IS A
   **STORE-QUERY READ** (`'rag.query'` with the probe's own term, `present = hits >= 1`). **BOTH FORMS SHARE THE
   RESOLVED-ABSENCE RULE UNCHANGED: a COMPLETED reading — a count of `0`, a resolved query with `0` hits — is
   `resolved:true` with `present:false`; a read that THREW, a count that is not a non-negative number, an `isError` reply
   or a transport failure is `resolved:false` and PARKS NOBODY.** **THE FILED WORD *"DOM"* IS KEPT VISIBLE ABOVE AND IS
   `SUPERSEDED` AS A DESCRIPTION OF THE SET OF NEW PROBES.**⟩**
2. **A GATED BLOCK PARKS IFF `pre.present !== true && ownProbe.resolved === true && ownProbe.present !== true` AND its
   entry is `corpusRead === true && selfProvisioning === false`** — the gate predicate **exactly as UNIT A contracted it**,
   with the second conjunct now able to differ from the first. **⟨GATE-2 `2026-10-05` — THIS PREDICATE IS THE **GATE'S**
   PREDICATE AND IS UNCHANGED; IT IS NOT THE ONLY ROUTE BY WHICH A GATED KEY CAN PARK. `§5.5` `FA-1`/`FA-2`'s parks
   happen at a NON-EMPTY store, where `pre.present === true` makes this predicate FALSE — so those two parks are the
   block's OWN, emitted from its own body when ITS OWN declared fixture's probe reads `present:false` at
   `resolved:true`, naming its own declared fixture (`§16.5`). The run's observation distinguishes the routes
   (`parkedByGate` versus the new `parkedByFixtureAbsence`), and `FA-3`'s discriminator is the (park set, route tag)
   pair.⟩**
3. **THE FAILURE CLASSIFICATION OF A PROBE READ IS UNCHANGED**: an `isError` reply is **NAMED** (`driverReadFailure`'s
   discriminated read), never a truthiness test — **the split changes WHAT each fixture reads, never HOW a failure is
   classified** (UNIT A `§6.4` clause 4). **⟨GATE-2 `2026-10-05` — THE `'dom:'` LIMB IS CLASSIFIED BY THE SAME RULE, WITH
   ITS OWN NAMED KIND: a CDP read that THROWS, or whose count is not a non-negative number, is a **NAMED unreadable**
   (`resolved:false`, a `dom-unreadable`-shaped detail carrying the selector and the error text **verbatim**) and **parks
   NOBODY**; only a COMPLETED count — including `0` — is a resolved reading (`§16.3`). THE THIRD CLAUSE IS ALSO WHERE THE
   FILED `settles`/`unsettled` PROSE IS PINNED TO THE LANDED SHAPE (`§16.12`): the registry's `unsettled` member is a
   **string OR `null`**, and the landed `'corpus-documents'` entry carries **`unsettled: null`** — the prose *(none)* of
   the table above is that member's MEANING, not its VALUE.**⟩**

### 5.3 The probes' own terms and constants, named

1. **THE QUERY TERM IS THE FIXTURE'S OWN MARKER, and it is a SINGLE NAMED CONSTANT** (one declaration, read by the
   probe and by the sets' author). **Its value is the landing pass's to choose; its CONTRACT is: (a) it is a term no
   document of the `search` set carries, (b) it is a term at least one document of every OTHER document-carrying set
   carries, and (c) changing it is a change to the sets and to the probe TOGETHER** — a split declaration is a
   review finding.
2. **THE `table` SET'S `<table>`-BEARING DOCUMENT and the INLINE-ELEMENT document are properties of the SET's content**
   (`§2.2` P-β/P-γ): the probe term clause (b) above is what ties them: **the term may be carried by the same document
   that carries the `<table>`, or by another — but `search` must carry no document that matches it.**
3. **THE PROBES TAKE NO OPERATOR INPUT.** They read **their own constant**, never a CLI arg, never the run's `--block=`
   selection and never the operator's search text. **A probe whose reading depends on the run's block set is not a
   fixture probe** — it is a scoped-run artifact, and UNIT A's `A-9` scope limb (`--block=`-space-only claims) forbids
   one.

### 5.4 The probes' population check (so the registry cannot drift from the declaration)

**THE PROBE SET MUST EQUAL THE GATED FIXTURE-NAME SET, AND THE PIN MUST GRADE IT.** For every `fixtureName` that appears
on at least one `UF_FIXTURE_DECLARATION` entry with `corpusRead: true && selfProvisioning: false`, the registry must
carry an entry whose `read !== null`; and for every `fixtureName` that appears on **no** gated entry, `read === null`.
**A gated name with `read: null` (or with no entry) makes the gate unable to park and is a review finding** — while a
`read !== null` on a never-gated name is the **false-park direction** and is equally an offence. **`VERIFIED-BY-READ` at
this head this yields exactly three names with non-null reads and two with `null`** — **and the pin's existing mutation
(a registry key no declaration entry names) stays green under the rule.**

**⟨GATE-2 `2026-10-05` — THE LAST CLAUSE IS **REFUTED BY READ** AND IS SUPERSEDED, NOT SOFTENED (`§16.16`).
`VERIFIED-BY-READ` at the pin's own `§4 A-5.iii` falsifiability probe and at its `A-5.vi` arm: the undeclared-registry-key
mutation must be **DISCRIMINATED** — `A-5.vi` asserts that a registry key **no fixture name in the declaration names**
produces the offence *"registry probe key(s) no declaration entry names: …"*, and the pin's `A-5.iii` requires every
per-declared-fixture limb to go RED on its own reversion. **AN ARM'S OWED BEHAVIOUR IS THEREFORE: it PLANTS the key
`'uf-no-such-declared-fixture'` into the registry source and REQUIRES the named offence**, and the `never-gated-name`
direction is satisfied by the two `null` reads the registry already carries. **"STAYS GREEN UNDER THE RULE" IS DEAD: a
green there is the tooth that cannot bite.**⟩**

**⟨GATE-2 `2026-10-05` — AND ONE READING OF THE PROBE SET IS STILL EXACTLY RIGHT AND IS CONFIRMED: `read !== null` on
exactly the three GATED names, `read === null` on the two never-gated ones, the key set `===` the declaration's
`fixtureName` value set (`§16.3`'s sentinel table is that claim's literals). The `35`-key gated population of `§16.17`
changes NO membership of the registry — the three gated names are still three.⟩**

### 5.5 THE `F-2` FALSIFIER — stated as the acceptance condition, one line per fixture

**THE FALSIFIER, IN ONE SENTENCE: a probe that CANNOT READ ABSENT WHILE THE STORE IS NON-EMPTY does not discharge `F-2`,
and the contract is satisfied only when the run can show, AT THE SAME STORE STATE, a PARKED gated key whose own fixture
is absent and a RUNNING gated key whose own fixture is present.**

| # | The falsifier, per fixture name | The set pair that exhibits it | The reading that must be observed |
| --- | --- | --- | --- |
| **FA-1** | **`'corpus-query-results'` reads ABSENT while `pre` (the run-wide store read) reads PRESENT** | **`--fixture=search`** (documents present, no result row paints for the probe's term) | the three `'corpus-query-results'` keys — `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` — **PARK by name**, each with a `parkReason` naming **`corpus-query-results`**; while **every `'corpus-documents'` gated key RUNS and carries its own verdict** in the same run. **⟨PARKED RESIDUE (c) — THIS ROW'S FILED GLOSSES ARE INTERPRETIVE, NOT CONTRACTED: THE SET-PAIR CELL'S *"no result row paints for the probe's term"* AND THE READINGS' *"painted"* TALK DESCRIBE WHAT A GESTURE-DRIVEN BLOCK LATER OBSERVES, NEVER THE PROBE'S ANSWER. THE PROBE'S OPERATIVE LIMB IS `§18.2`'s STORE QUERY, WHICH READS IDENTICALLY UNDER BOTH SETS' OWN PRE-GESTURE DOM COUNTS. `§18.7` residue (c).⟩** **⟨GATE-2 THIRD LOOP `2026-10-05` — THIS ROW IS `VERIFIED CLEAN` AND ITS PREDICATE IS UNCHANGED; WHAT IS NOW STATED IS **WHICH LIMB MAKES IT TRUE**, BECAUSE THE FILED PARENTHETICAL NAMED THE WRONG ONE (`§18.2`). THE OPERATIVE FACT IS THE **STORE QUERY'S `0` HITS**: `search` omits the probe's term by construction (`§2.1` `F-3`, `§2.2` P-δ), so the probe reads `present:false` at `resolved:true` and the three keys park BY NAME.** **THE FILED PARENTHETICAL (*"no result row paints for the probe's term"*) IS KEPT VISIBLE AND IS `SUPERSEDED` AS THE REASON: at the pre-gesture read point no result row is painted in ANY run, so that clause is true of `tabs` too and CANNOT be what separates this row from `FA-2` (`§18.1` clause 3, `§18.2` clause 4).**⟩** |
| **FA-2** | **`'corpus-document-tabs'` reads ABSENT while `pre` reads PRESENT** | **`--fixture=tabs`** (documents present, no document tab open at the blocks' own start) | **`user9_search_open_in_tab` PARKS by name**, its `parkReason` naming **`corpus-document-tabs`**; while the `'corpus-documents'` keys RUN and **the `'corpus-query-results'` keys RUN too** (their term paints a row for the un-opened term-bearing document). **⟨GATE-2 THIRD LOOP `2026-10-05` — THE FILED PARENTHETICAL IS `SUPERSEDED` AND IS KEPT VISIBLE IN THIS CELL, BECAUSE IT CONTRADICTED `§5.2` CLAUSE 3 AND `§11.3` ITEM 4'S OWN `class-(b):tabs` READING AND MADE THE `--fixture=tabs` RUN UNGREENABLE: THE FILED REASON (*"their term paints a row for the un-opened term-bearing document"*) IS A CLAIM ABOUT **PAINTED ROWS AT A POINT WHERE NO SEARCH GESTURE HAS RUN**, AND AT THAT POINT NO RESULT ROW IS PAINTED IN ANY RUN (`§18.1` clause 3). THE READING OF RECORD IS THE ONE `§18.2` GIVES THIS ROW: **THE THREE `'corpus-query-results'` KEYS — `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` — RUN BECAUSE THEIR OWN DECLARED FIXTURE'S PROBE READS `present:true` (`tabs` carries `search.md`, the probe's term-bearing document, so the probe's STORE QUERY returns at least one hit), AND FOR NO OTHER REASON: `pre.present === true` (non-empty store) and `ownProbe.present === true`, so `§5.2` clause 2's gate predicate is FALSE and the gate does not fire; the pre-gesture painted-row count is `0` and is NOT the probe's answer.** **THE CELL'S OTHER HALF — `user9_search_open_in_tab` PARKS, its `parkReason` naming `corpus-document-tabs`, `pre` reading PRESENT — IS VERIFIED CLEAN AND IS NOT AMENDED.**⟩** |

**⟨GATE-2 `2026-10-05` — THE ROUTE FA-1/FA-2 PARK THROUGH IS NOW NAMED, BECAUSE THE FIXTURE GATE'S OWN ROUTE CANNOT BE
IT (`§16.5`, and this is the one place where a filed clause and a filed falsifier pulled in opposite directions):

- **WHY THE GATE ROUTE CANNOT CARRY `FA-1`/`FA-2`:** both runs have a **NON-EMPTY** store, so `pre.present === true`, and
  `§5.2` clause 2's gate predicate (UNIT A's own, unchanged) has `pre.present !== true` as a conjunct — **the gate does
  not fire at all in those two runs.** The per-fixture divergence is nevertheless EXHIBITED, because the gate is not the
  only place a fixture-absence becomes a park.
- **THE ROUTE THAT DOES CARRY THEM — A NAMED, BODY-OWNED PARK:** `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`
  (declared `'corpus-query-results'`) and `user9_search_open_in_tab` (declared `'corpus-document-tabs'`) **ask THEIR OWN
  DECLARED FIXTURE'S probe before their own setup read, and when it reads `present:false` at `resolved:true` they emit
  their OWN park through their existing `parkRow`/`parkReason` seam, naming `corpus-query-results` /
  `corpus-document-tabs`**. **The gate predicate is NOT touched** (it stays exactly UNIT A's, `§5.2` clause 2); what is
  added is the block's own honest park under `RCA-11` clause (b)'s *"parked by name, never parked-by-default"* rule.
- **THE COUNTING, SO THE READING IS MACHINE-GRADED AND NOT PROSE:** the run's fixture observation gains the member
  **`parkedByFixtureAbsence`** — the subset of the gated population parked **because its OWN declared fixture read absent
  at `resolved:true`**, however the park was routed (the gate branch OR the block's own body). **`parked` is unchanged**
  (every park inside the gated keys, whatever it parked for) and **`parkedByGate` is unchanged** (the gate branch alone,
  a subset of `parkedByAbsence`); the printed line carries all three beside `blocksRun`. **This is an ADDED member on the
  observation, not a moved figure** — the register's `67`/`57` and the caps are untouched. **⟨GATE-2 SECOND LOOP
  `2026-10-05` — `parkedByAbsence` ABOVE IS A TYPO, KEPT VISIBLE AND `SUPERSEDED`: the member is
  `parkedByFixtureAbsence` (the name THIS bullet's first line already uses), its PRINTED FIELD is
  **`parked-by-fixture-absence=`**, and the chain is `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked` (`§17.4`). **The
  three-member print and the subset relation are UNCHANGED by the spelling correction.**⟩**
- **THE CONSEQUENCE FOR `class-(b):search` / `class-(b):tabs` (`§11.3` items 3/4): the reading is the PARK SET with its
  ROUTE tag** — `{uf_panes_14, uf_tabs_7, uf_tabs_7_diag}` (resp. `{user9_search_open_in_tab}`) parked by
  **fixture-absence**, never by a run-wide store read and never by another fixture. **`FA-3`'s discriminator is therefore
  the pair (park set, route tag), not the park count.**⟩**
| **FA-3** | **THE CROSSED READING IS A FALSE PARK** | **any** set | a gated key that parks on **another** fixture's absence is **`§5.1` clause 1's offence** (a false park) — asserted as the **negative** limb of FA-1/FA-2, and **the discriminating figure is the PARK SET, not the park count**: `{FA-1's three keys}` and `{FA-2's one key}` are the only admitted park sets in those two runs. **⟨GATE-2 `2026-10-05` — THE ADMITTED PARK SET IS QUALIFIED BY ITS ROUTE TAG (`§5.5`'s gate-2 block above): a park inside the set whose tag is NOT fixture-absence, and a park outside the set whose tag IS, are BOTH offences — so the discriminator is the PAIR (park set, route).⟩** |
| **FA-4** | **THE DEGENERATE `F-2` READING IS REFUSED** | **`--fixture=core`** (both probes present) | the store read and the two probes **AGREE at `present: true`**, and **no gated key parks** — **this is what makes FA-1/FA-2 a DIVERGENCE and not a permanent absence.** **⟨GATE-2 THIRD LOOP `2026-10-05` — THIS ROW WAS **UNEXHIBITABLE AS FILED** AND IS NOW EXHIBITABLE, WHICH IS THE CONTROL THE FIRST LOOP LOST (`§18.2` clause 4): with the painted-row conjunct in place, BOTH probes read `present:false` under `core` too (no gesture has run), so *"the two probes agree at `present:true`"* could never be observed. **UNDER `§18.2`'s READING THE ROW HOLDS AS WRITTEN: `'corpus-documents'` present (the store list), `'corpus-query-results'` present (the store query's `hits >= 1` — `core` carries the term's document), `'corpus-document-tabs'` present (`core` leaves a document tab open at launch, `§2.2`), and no gated key parks.** **THE ROW'S OWN FALSIFIABLE FORM IS `§18.6` clause 3.**⟩** |
| **FA-5** | **THE `none`-STATE READING IS UNCHANGED** | a run with **no** `--fixture` | the state reads `no fixture data set selected` / `none` / `none`, and **every gated key whose own probe reads absent parks by name** — i.e. the pre-existing behaviour is unmoved by the arg's arrival. **This is not a divergence and is not claimed as one: it is the control that shows the arg's arrival moved nothing for an invocation that does not use it** (`§3.1` clause 3). |

**`'corpus-documents'` IS THE ONE NAME THAT CANNOT DIVERGE FROM `pre`, AND THAT IS STATED SO IT IS NOT MISTAKEN FOR A
SURVIVING INERTNESS:** its fixture **IS** the store's document list, so its absence and `pre`'s absence coincide **by
definition** (UNIT A's own reading: *"`'corpus-documents'`'s own semantics are unchanged (the store list IS its
fixture)"*). **The `F-2` discharge is therefore `p < pre` on the two RENDERED fixtures — FA-1 and FA-2 — and it is
satisfied exactly when both can read absent at a non-empty store.** A landed state in which either still rides
`rag.list_documents` is **`F-2` unclosed** and this unit's DONE row may not claim it. **⟨GATE-5 RULING `2026-10-05` — THE TWO LIMBS OF THIS SENTENCE NOW HAVE **DIFFERENT DISPOSITIONS**, AND THE DIFFERENCE IS THE ARCHITECT'S RULING, NOT AN EDIT TO THIS PARAGRAPH: (1) **THE STORE QUERY** (`'corpus-query-results'`, `read: 'rag.query'`) — the ruling *"Adapt the mock data to function with the query"* makes the SETS' CONTENT the subject, so this limb becomes **`OWED`** as a DATA-FORM outcome: the probe's own constant term must reach the store's lexical index and the query must return `>= 1` hit under `--fixture=core` (`§22.2` item 1). (2) **THE DOM READ** (`'corpus-document-tabs'`, `dom:#tab-strip .tab[data-document-id]`) — the ruling's second sentence *"if the tabs are awaiting a later unit to adapt to the foundation tooling then skip testing"* makes this limb **SKIPPED-BY-RULING**, **NOT a pass**, its exemption named (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`), and **the `F-2`-closure claim MAY NOT BE REPORTED AS DISCHARGED FOR THIS LIMB** (`§22.3`, whose exact SKIP wording is what a TestWriter and the live runner act on).** **THIS PARAGRAPH'S PREDICATE (`p < pre` on the two rendered fixtures) IS UNCHANGED AND IS THE ACCEPTANCE CRITERION; what changes is that ONE of the two fixtures' readings is skipped and the other is owed to the data.** **NO REGISTER FIGURE MOVES.**⟩** **⟨GATE-2 `2026-10-05` — THE
FALSIFIER ITSELF IS VERIFIED CLEAN AND IS **NOT** AMENDED: `p < pre` on the two rendered fixtures is a genuinely
falsifiable predicate, and the gate-2 pass changed nothing in it. What the pass HAD to add is the ROUTE by which `p` can be
`false` while `pre` is `true` (`§16.5`'s gate-2 block): the block's own park, tagged `parkedByFixtureAbsence`. **FA-4
(`--fixture=core`) is the control that keeps this a divergence**: under `core` and `table` both rendered probes read
`present:true`, so no key parks by fixture-absence and the reading is agreement, not a permanent absence. **⟨GATE-2 THIRD LOOP `2026-10-05` — AND THE ONE THING THIS PARAGRAPH LEFT DERIVABLE RATHER THAN STATED IS NOW STATED, BECAUSE IT IS THE POINT OF THE TWO FIXTURES: `FA-1` AND `FA-2` ARE **DIFFERENT RUNS**, NOT TWO LIMBS OF ONE RUN. `--fixture=search` exhibits `p < pre` FOR `'corpus-query-results'` ALONE — and in that run `'corpus-document-tabs'` ALSO reads absent (a document IS open at those blocks' start, and the pane-search rows are not what it reads). `--fixture=tabs` exhibits `p < pre` FOR `'corpus-document-tabs'` ALONE — and in that run `'corpus-query-results'` reads PRESENT (`§18.2` clause 4). **A READER ASKING *"WHERE ARE BOTH RENDERED PROBES `present:false` AT ONE STORE STATE?"* IS ASKING FOR THE COLLISION BACK: `FA-3` forbids it as a false park, and `FA-4` refuses it as the degenerate reading.** **THE DISCHARGE IS THEREFORE `p < pre` EXHIBITED **PER FIXTURE**, ONE FIXTURE AT A TIME — which is exactly what "divergent probes, one per gated fixture name" (`§0.2` `F-2`'s own disposition) means.**⟩** **AND ONE
MEMBERSHIP CONSEQUENCE OF `§16.1` IS RECORDED HERE: `u_edit_1_live_package_table_limitation` is NOT part of any of
FA-1…FA-5's sets or readings — it is `'corpus-documents'`-gated, so it runs wherever the store is non-empty and parks
(for its own reason, not by fixture-absence) where no `<table>`-bearing surface is reachable.⟩**

---

## 6. THE OBSOLETE SET'S DISPOSITION

### 6.1 Which routes are obsolete, by name

**`DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG` clause (3) rules the PRE-EXISTING CORPUS DATA SETS AND THEIR
SUPPLY MECHANISMS OBSOLETE** (the data engine is being rebuilt) **and forbids extending them or using them as the
fixture's foundation.** **THE ROUTES, ENUMERATED (`VERIFIED-BY-READ` by UNIT A `§3` `R-1`/`R-2` and re-read by this
filing):**

| # | The route | What it is (as landed) |
| --- | --- | --- |
| **O-1** | **`seedCorpus(dir)`** | the driver's synthetic 2-document writer (`alpha.md` · `beta.md`) — **`VERIFIED-BY-READ`: the `.live-corpus/*` seed data's ONLY author.** |
| **O-2** | **`o0MarkdownTree(seedDir)`** | the `--strict-seed` directory enumerator (every `*.md` under a tree), used for the 226-document census route. |
| **O-3** | **`--seed=`** and the **`.live-corpus/*` default seed dir** | the seed directory flag and its default (`opt.seed ?? join(ROOT, '.live-corpus')`), cleaned after the run unless `--connect`. |
| **O-4** | **`--corpus-root=`** | the store's import root for the seed corpus (the flag pair `o0MarkdownTree` needs). |
| **O-5** | **`--strict-seed`** | the "import the tree, do not write the two synthetic files" switch. |
| **O-6** | **`--o0-corpus=<n>`** and the **226-document O-0 corpus route** | the claimed-census flag (`claimed 226 · observed 2`) that the `o0_*` rows read. |
| **O-7** | **`--no-seed`** | the *"run without the seed"* switch — **NOT obsolete in the same sense: see `§6.4` clause 3.** |

**WHAT UNIT B DOES WITH EACH — the disposition, one line per route:**

1. **ANNOTATE, NEVER EXTEND.** Every one of O-1…O-6 stays **exactly as it is** (no deletion, no rename, no re-point, no
   new flag, no flag removed, no warning added to its code path). **What this unit ADDS is the record**: the driver's own
   comments and printed text carry, **by name**, that **O-1…O-6 are OBSOLETE and are NOT the fixture's foundation** —
   and the declaration's own comment block (`VERIFIED-BY-READ`: it already says the seed and O-0 corpus routes are
   obsolete and are named nowhere in the declaration) **stays as it is and is extended only with the new arg's
   relationship to them** (`§6.4`).
2. **THE SETS ARE NOT THEIR CHILDREN.** No set is authored by, derived from, copied from or parsed out of O-1…O-6. **A
   set's content that happens to resemble the old seed's text is not a licence: the identity rule of `§2.4` is what
   makes the two distinguishable, and the run's artifact names the set.**
3. **THE ARG IS NOT A FLAG ON THE OLD ROUTE.** `--fixture=` is a **new** flag naming a **new** object; it does **not**
   modify, extend, wrap or default any of O-1…O-6.

### 6.2 What breaks if a caller still passes the obsolete flags

**THE OLD ROUTE STILL WORKS — that is the point of "annotate, never extend" — and it still produces a run whose store
holds `alpha`/`beta` under the OLD identities.** **What a reader must NOT do, and what the artifact must prevent:**

| # | The caller's act | What happens | What the artifact says | The offence if it is misread |
| --- | --- | --- | --- | --- |
| **B-1** | an OBSOLETE-ROUTE-ONLY launch (`--seed=…` / `--strict-seed` / `--o0-corpus=…`, no `--fixture`) | the old seed runs exactly as today; the run's fixture state stays **`none`** | `fixtureState: 'no fixture data set selected'`, `fixtureKind: 'none'`, `fixtureId: 'none'` — **the run states that NO FIXTURE DATA SET supplied the store, even though a corpus was seeded** | **reading a seeded old-route run as a fixture-set run**: the state is the guard, and it must stay `none` **even when the seed route populated the store** — `fixtureKind: 'none'` means *"no MOCK DATA SET was selected"*, **not** *"the store is empty"*. **`SPEC-CALL`: the state's meaning is narrowed in this direction deliberately**, because the alternative (reporting the seed route as a fixture) would name an obsolete mechanism as the run's fixture and make UNIT A's `§6.2` `X-4` offence unavoidable. |
| **B-2** | an OBSOLETE flag together with `--fixture=<set>` | **REFUSED BY NAME, pre-spawn, exit `2`** (`§6.4`) | the `ARG-REFUSED` line names **both** the set and the offending flag | **a run that carried BOTH supplies and named only one of them**: this is the failure the refusal exists to prevent — the artifact would attribute the store to the mock while the old route also wrote into it. |
| **B-3** | `--fixture=<set>` with `--connect` | the materialisation runs, the **import is skipped** (`§4` `S-5`) | the state names the set **and** `connect` | **a reading of a foreign store's contents attributed to the set**: the mode must ride the state for exactly this reason. |
| **B-4** | a **citation** that still points at an obsolete route as the fixture's supply | — | — | **`§6.3`.** |

### 6.3 Citations: repointed, never left dangling

1. **EVERY CITATION THIS UNIT'S LANDING CREATES POINTS AT THE SET OR AT THIS SPEC — never at O-1…O-6 as a supply.** The
   driver's declaration comment block, the arg's refusal text and the printed consequence clause name **the set**
   (`--fixture=<name>`) when they name a supply at all.
2. **EXISTING CITATIONS THAT NAME THE OLD ROUTE ARE ANNOTATED IN PLACE WITH THEIR SUBJECT'S STATUS, NOT DELETED**
   (`RCA-8(c)`): a comment that says *"the seed corpus"* gains the obsolete marker beside it; **no historical reading is
   rewritten**.
3. **THE `docs/**` CITATIONS ARE THE LANDING PASS'S, AND THE RULE IS `AGENTS.md` item 6's**: where this unit's landing
   moves a path (the materialisation root, the identities), **every reference is repointed or the reference is annotated
   beside** — **never left pointing at a path that no longer exists**. **The known citation set at this head, named so it
   is not re-discovered: the `.live-corpus` references in `scripts/live-drive.mjs`'s own comments and block surfaces, and
   the `.live-corpus/alpha`/`beta` strings inside `UF_FIXTURE_DECLARATION`'s own `surface` prose members** (e.g. `tabs`'s
   and `repro_nbsp`'s `surface` text) — **those `surface` members are the declaration's own text and are re-worded in the
   SAME pass as the re-pin, so a park reason never quotes a dead identity (`§12` item 1).**
4. **AN OBSOLETE MECHANISM IS NEVER THE `fixtureName` OF A DECLARATION ENTRY** (UNIT A `§4.3` `D-3`, unchanged): **a set
   named `--seed`/`--strict-seed`/`--o0-corpus`/`seedCorpus`/`o0MarkdownTree` is a review finding.**

### 6.4 The one interaction that must be decided, because the ruling is silent — `SPEC-CALL`

**A RUN MAY NOT CARRY TWO FIXTURE SUPPLIES.** `--fixture=<a document-carrying set>` combined with any of **`--seed=` ·
`--corpus-root=` · `--strict-seed` · `--o0-corpus=`** **is REFUSED BY NAME, PRE-SPAWN, EXIT `2`** — one named
`ARG-REFUSED` line stating both values, the reason (*"two fixture supplies cannot both write the store this run
measures"*), and the fixture state. **Ground: the artifact must be able to attribute the store to ONE fixture (clause
(2)'s whole purpose); a run that seeded through an obsolete mechanism and then imported a mock set would produce a store
neither the state nor the park reasons describe.** **Its three boundary clauses:**

1. **THE REFUSAL IS `S-6` OF `§4` AND `A-2`'s SIBLING** — same path, same marker, same exit code, **and it is decided
   BEFORE anything is spawned**.
2. **THE `empty` SET IS NOT EXEMPT.** `--fixture=empty --strict-seed` is refused too: the state would say *"the empty
   fixture set was selected"* while the old route populated the store.
3. **`--no-seed` IS NOT AN OFFENCE AND IS NEVER REFUSED.** It is **not a supply** — it is the *"do not run the obsolete
   seed"* switch, i.e. the flag that makes the mock set the run's ONLY supply. **`--fixture=<set> --no-seed` is an
   ADMITTED, and arguably the cleanest, invocation**, and `--fixture=empty --no-seed` is the canonical fixture-absent
   run.
4. **⟨ADDED GATE-2 `2026-10-05` — `--fixture=<a set>` **IMPLIES** `--no-seed`, AND THE IMPLICATION IS PRINTED (`§16.13`).⟩**
   **Every `--fixture=<set>` run, `empty` included, behaves as if `--no-seed` had been passed: the obsolete seed route
   does NOT run, so the store's only supply is the selected set (or, under `empty`, NOTHING — which is `S-4`).** **This is
   the clause that makes `S-6`'s refusal non-vacuous: the refusal exists for a caller who NAMES a supply flag, and the
   implication removes the ordinary case in which the seed would have run beside a set.** `--no-seed` passed EXPLICITLY
   stays admissible (clause 3) and is not refused on any path. **The implication is a consequence of the arg and NOT an
   operator arg, so it does not touch `§3.1` clause 5's one-set-per-run rule, `§3.2`'s grammar or the arg's own
   non-refusal states (`§3.3`).** **Recorded risk, named rather than smoothed: an obsolete-route-only run (no `--fixture`)
   is UNCHANGED and still seeds.**

**⟨GATE-5 AMENDMENT `2026-10-05` — D-2 · GREENS ROW `B-1` (documentation finding `D-2`) · THE REFUSAL MUST NAME THE OFFENDING FLAG, NOT THE FLAG FAMILY. THE CONTRACT'S OWN WORDING ALREADY POINTS THERE — *"REFUSED **BY NAME**"* (this section's opening clause), *"the artifact must prevent … a run that carried BOTH supplies and named only one of them"* (`§6.2` `B-2`) and *"one named `ARG-REFUSED` line stating both values"* (this section) — BUT IT WAS NOT WRITTEN SO AN ARM COULD GRADE IT, AND `§3.3` clause 1's *"names the offending value"* was read (greens `B-1`) as satisfied by a FAMILY LIST. THE BINDING REQUIREMENT FOLLOWS; THE LANDED LINE IS A FINDING FOR THE IMPLEMENTER AND **NOT** A CHANGE THIS PASS MAKES.**

1. **THE NAMED REQUIREMENT (graded).** On the `S-6` / `B-2` path the `ARG-REFUSED` line must name **(a)** the selected set (already contracted) **and (b) THE FLAG THE CALLER ACTUALLY SUPPLIED, BY ITS OWN NAME — `--seed=` for a `--seed=` run, `--corpus-root=` for a `--corpus-root=` run, `--strict-seed` for a `--strict-seed` run, `--o0-corpus=` for a `--o0-corpus=` run** (and, where the flag carries a value, the value it carried). A line that prints the FAMILY — `(--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` — satisfies neither limb (b) nor the caller's need: **an agent reading the artifact must be able to see WHICH FLAG TO DROP without re-reading its own command line, and the refusal's whole justification is that the artifact can attribute the store to ONE fixture.** **THIS IS THE `route-supply-refusal:refused-by-name` LIMB (`§10.2.3`, `3×route-supply-refusal`) MADE GRADABLE: the arm asserts the supplied flag's own name in the line's text; the family list may remain BESIDE it, as the accepted-set list remains beside an `A-2` refusal.**
2. **ONE ARM PER SUPPLY FLAG, NO NEW ARM AND NO FIGURE MOVED.** The four flags are four readings of the same arm: `--fixture=core --seed=…` must name `--seed=`; `--corpus-root=…` must name `--corpus-root=`; `--strict-seed` must name `--strict-seed`; `--o0-corpus=…` must name `--o0-corpus=`. **The `3×route-supply-refusal` count, the `67`/`57` register, the caps and the seed are UNMOVED — this is the arm's own subject, named rather than added.**
3. **THE LANDED TEXT IS RECORDED, NOT REPAIRED HERE** (`VERIFIED-BY-READ` of the driver's own `ARG-REFUSED` line on that path: it names the set and then the whole family list, and names no single supplied flag). **FINDING FOR THE IMPLEMENTER — `OWED`, listed in `§21.5` clause 1 item 1:** the line's TEXT is widened to name the offending flag; **`§3.3` clause 1's *"names the offending value verbatim"* and this section's *"both values"*, *"the reason"* and *"the fixture state"* are ALL UNMOVED**, and the refusal remains one line, pre-spawn, exit `2`, nothing written (`§3.3` clauses 3/4).
4. **WHAT IS NOT AMENDED, STATED SO THE REFUSAL IS NOT RE-SHAPED BY IMPLICATION:** `--no-seed` remains admissible and refused on no path (clause 3, clause 4 above), the `empty` set remains not exempt (clause 2), and the four flags remain the whole trigger set (clause 1).

### 6.5 What is explicitly NOT resolved here

**THE O-0 MEASUREMENT / REPORT MECHANISM IS A DIFFERENT OBJECT AND IS NOT DECLARED OBSOLETE.** **Its STATUS IS A
SEPARATE OPEN QUESTION AND THIS UNIT DOES NOT RESOLVE IT** — it neither keeps it, retires it, re-scopes it nor
re-measures it. **Consequences, stated so they cannot be read past:**

1. **The five `o0_*` keys stay in the census and stay gated on `'corpus-documents'`** (they read the doc-nav's
   folder/document rows; UNIT A's `§2.2` note and its `§3` `R-3` are the governing text). **This unit supplies their
   fixture by supplying `'corpus-documents'` — nothing more.**
2. **The `--o0-corpus=` flag's own census claim** (`claimed 226 · observed 2`) **is NOT this unit's to reconcile**: it is
   one half of the filed defect `LIVE-FIXTURE-PRECONDITION-GAPS`, and its revisit condition is **a separate open question**
   (`docs/pending.md`'s `LIVE-RUN-O0-CORPUS-FIXTURE-NEED` row). **`SPEC-CALL` boundary: this unit REFUSES the flag when a
   set is selected (`§6.4`) but neither repairs nor re-scopes the O-0 route, and it claims no O-0 reading.**
3. **The engine fixture is NOT touched** (`§8`).

---

## 7. THE RUN'S DECLARATION OF ITS FIXTURE

### 7.1 The state's membership is UNIT A's; the SET's identity is what this unit fills in

**UNIT A contracts the member and its four print sites; this unit supplies the VALUE.** The machine-readable pair UNIT A
defined is **exactly** the interface the selection arg feeds:

| Member (UNIT A `§6.1`, unchanged) | `none`-state value (UNIT A's, unchanged) | The value THIS unit makes reachable |
| --- | --- | --- |
| **`state`** — the printed line's label is **`fixtureState=`** (string, human-readable) | `'no fixture data set selected'` | the selected set's own sentence, **naming the set** — `'mock data set <setName> selected'`-shaped, and **never** a sentence naming a supply mechanism (`§6.3` clause 4). |
| **`kind`** — the printed line's label is **`fixtureKind=`** (machine-readable) | `'none'` | **`'mock-data-set'`** — **the one non-`none` value UNIT A's own type admits** (`'none' \| 'mock-data-set'`), so a new kind is a UNIT A amendment and is **not this unit's act**. |
| **`id`** — the printed line's label is **`fixtureId=`** (the selected data set's NAME) | `'none'` | **the set's name from the closed value set** (`core` · `table` · `search` · `tabs` · `empty`). **This is the member a reading is attributed by.** |

**THE SET'S IDENTITY MUST RIDE THE STATE — and the identity is BOTH the set's name and, where the run materialised it,
the root it wrote.** The printed statement carries: **the set name (`fixtureId`)**, **the kind**, **the materialisation
root** (or the *"not materialised"* record where the mode skipped it — `§4` `S-5`), and **the mode's own qualifier where
one applies** (`connect`). **Ground: a set's identity that is only a name cannot be mapped back to the bytes a block's
evidence quotes; clause (2)'s *"so a reading can be attributed to its fixture"* is discharged by the pair, not by the
name alone.**

**⟨GATE-2 `2026-10-05` — TWO RULINGS ON THIS SECTION, BOTH SO THE REGISTER'S `state-member` TERM IS WRITABLE (`§16.4`,
`§16.12`):**

1. **THE MEMBERS ARE **THREE**, AND THE MATERIALISATION ROOT IS **PRINTED TEXT, NOT A FOURTH MEMBER** — the ruling of
   record, and it is a UNIT A AMENDMENT ONLY IF THE LANDING PASS TAKES THE OTHER READING (it does not have to, and this
   spec does not take it). **`UF_FIXTURE_STATE` keeps exactly `state` / `kind` / `id`**, the pin's `A-8` member-set tooth
   (`{state, kind, id}`, exactly three, all strings) **stands un-restated**, and **the root is a clause of the PRINTED
   statement at each site that materialised a set** (the launch-profile line and the summary's `fixture` member's own
   line), derived from `fixtureId` + the mode at print time. **`state-member` therefore stays `3×`.**
2. **THE MEMBER SPELLINGS, BOTH REAL, BOTH USED, AND WHICH IS WHICH — the pin's tooth bites the OBJECT; the printed line
   carries LABELS.** The object's members are the driver's own **`state` / `kind` / `id`** (`VERIFIED-BY-READ` at the
   landed literal `const UF_FIXTURE_STATE = { state: 'no fixture data set selected', kind: 'none', id: 'none' }`, and at
   the pin's `UF_FIXTURE_STATE_EXPR` which asserts that literal and that member set). **`fixtureState` / `fixtureKind` /
   `fixtureId` are the PRINTED LINE'S LABELS** (`fixtureState="…" fixtureKind=… fixtureId=…`) and UNIT A `§6`'s PROSE
   names for the same three readings. **THE `none`-FORM TOOTH IS RE-STATED AGAINST THE OBJECT'S MEMBERS
   `state|kind|id`** (values `'no fixture data set selected'` / `'none'` / `'none'`), and the printed labels are asserted
   only where a site's TEXT is the subject (`print-site`'s arms). `§7.1`'s member column, `§7.2`, `§11.5` and the glossary
   spell the triple `state|kind|id`; `§7.1`'s right-hand column and `§6.2` `B-1` spell it `fixtureState`/`fixtureKind`/
   `fixtureId` — **both spellings are kept visible and the mapping above settles which subject each arm grades.**

### 7.2 The four print sites (UNIT A's, carried, with the state's source moved)

**UNIT A contracted FOUR sites and ONE READ.** **This unit changes the ONE READ's SOURCE, not the sites and not their
number:** the state is **assigned ONCE, after the argv walk and after the refusal branches, from the parsed arg**, and
**every site reads that one state** (`VERIFIED-BY-READ` at the landed sites: the `LAUNCH PROFILE` line and the summary
object literal carry `fixture: UF_FIXTURE_STATE`; the `--groups=` refusal and the module-level `main().catch` carry
`fixture=${JSON.stringify(UF_FIXTURE_STATE)}`).

**THE ORDER IS PART OF THE CONTRACT, AND IT IS THE SAME ORDER THE EXISTING REFUSALS IMPOSE (`VERIFIED-BY-READ` at the
three landed refusal branches):**

1. **THE ARG IS PARSED AND VALIDATED AS PARSED** (value kept, offence recorded) — the same two-form pattern the ports and
   `--home` use.
2. **THE REFUSAL BRANCHES RUN** (`--groups=`, ports, `--home`, and **the new `--fixture` branch**), **each printing the
   state and returning at exit `2`** — **so those lines carry the state as it stood BEFORE the arg could be applied**,
   which is the `none` state unless a valid `--fixture=` was parsed before the offence was seen. **The landing pass must
   NOT reorder the refusals to make this prettier; the state on a refusal line is a reading about the request, and the
   request was refused.** **⟨GATE-2 `2026-10-05` — THE *"unless a valid `--fixture=` was parsed before the offence was
   seen"* LIMB IS **SUPERSEDED AND KEPT VISIBLE** (`§16.5`): clause 3 below assigns the state AFTER every refusal branch,
   so **NO refusal line can carry anything but the `none` triple** — including the `--fixture` refusal's own line for
   `A-1`…`A-4` and `S-6`. The offending value is named in the line's TEXT, not in the state.⟩** **⟨GATE-5 AMENDMENT `2026-10-05` — THIS CLAUSE IS UNMOVED AND IS READ AS THE FOUR **REFUSAL** PATHS (the `--fixture` refusal among them); IT DOES NOT BIND THE `main().catch` ERROR LINE, WHICH THE LINE ABOVE'S GATE-2 NOTE INCLUDED IN ITS SITE LIST. The absolute *"including the `main().catch` ERROR line"* clause there is `SUPERSEDED` and stays visible: an abort reached AFTER the assignment legitimately prints the state the binding holds then, and `§7.2` clause 4's *"reads the same binding"* is TRUE and is KEPT. Binding reading, arm discriminator and the measured evidence (greens `F-8`/`F-9`, fail ledger `F-2`): `§21.1`.⟩**
3. **THE STATE IS ASSIGNED ONCE**, after the refusals, from the parsed arg — **one assignment, one reader**.
4. **THE LAUNCH PROFILE AND THE SUMMARY READ IT** (sites 1/2), **and the `main().catch` path reads the same binding**
   (site 4). **The `--groups=` refusal remains site 3, and it is a site whose line prints the pre-assignment state** —
   **stated explicitly here so a TestWriter does not assert the selected set's name on a refusal line reached before the
   assignment.** **The `--fixture` refusal's own line is the fourth `ARG-REFUSED` form and prints the state the same
   way.** **⟨GATE-2 `2026-10-05` — "THE SAME WAY" IS NOW EXACT: it prints the `none` triple. The
   `print-site:early-paths` arm (`§10.2.3`) asserts **exactly that** at the four early sites (`--groups=` · ports ·
   `--home` · the `--fixture` refusal · the module-level `main().catch`), and **the selected set's name is asserted ONLY
   at `print-site:launch-profile` and `print-site:summary`** — the two sites the assignment precedes (`§16.5`). **⟨GATE-5 AMENDMENT `2026-10-05` — THE `main().catch` MEMBER OF THAT SITE LIST IS `SUPERSEDED`: the arm's `none`-triple tooth bites the FOUR REFUSAL PATHS, and at the `main().catch` ERROR line it bites THE STATE THE BINDING HOLDS AT THE ABORT — `none` on a pre-assignment abort, the selected set's own triple on a post-assignment abort (measured: greens row `F-8`; THE SELECTED SET'S NAME IS STILL ASSERTED AT NO **REFUSAL** SITE). THE INSTRUCTION A TESTWRITER IMPLEMENTS, WITH ITS PIN LIMB AND ITS LIVE LIMB: `§21.1`.⟩**⟩**

**⟨GATE-5 AMENDMENT `2026-10-05` — D-1 · GREENS ROW `F-8` (fail ledger `F-2`, evidence row `F-10`) · THE `main().catch` LIMB OF THIS NOTE AND `§16.5` CLAUSE 1 ARE `SUPERSEDED` IN THEIR ABSOLUTE FORM AND ARE KEPT VISIBLE ABOVE. THE BINDING RULE IS THE **ORDER OF THE BINDING**, NOT A LIST OF SITES: see `§21.1` for the whole clause, the exact discriminator the `print-site:early-paths` arm may assert, and the three sites where the superseded phrasing still stands. **THE REFUSAL LINES' `none` TRIPLE IS NOT WEAKENED BY THIS AMENDMENT** — the four refusal paths and the `--fixture` refusal are reached BEFORE the single assignment and still print `none`.⟩**

**THE SET IS MATERIALISED AFTER THE REFUSALS AND BEFORE THE IMPORT**, and the materialisation's own outcome is **named on
the launch line** (the root, or the failed write).

### 7.3 The fail-states of the declaration

| # | Fail-state | Trigger | The offence |
| --- | --- | --- | --- |
| **D-1** | **AN ARTIFACT WITH NO FIXTURE STATEMENT** | any run's launch/summary carries no state | UNIT A's `X-1` stands; **this unit adds nothing and removes nothing** |
| **D-2** | **A STATE THAT NAMES A SET THE RUN DID NOT USE** | the arg said `core` and the state says `table` (a stale literal, a second assignment) | review finding: **the set's identity is the ONE thing a reading is attributed by**, so a wrong one is worse than none. **Red arm: `§11.2` `state-derivation`.** |
| **D-3** | **THE STATE OMITS THE MATERIALISATION ROOT** | the set was materialised and the line names only the set | **`§7.1`'s clause-2 requirement**: the root is what maps a quoted document id to the set. **⟨GATE-2 `2026-10-05` — THE OFFENCE STANDS AND ITS SUBJECT IS NAMED: the root is owed as **PRINTED TEXT on the launch-profile/summary statement**, NOT as a fourth `UF_FIXTURE_STATE` member (`§7.1`'s gate-2 ruling, `§16.4`). `state-member` therefore stays `3×`; a landing pass that adds a fourth member has amended UNIT A and must say so, and the `state-member`/`state-derivation` arms are then `4×`/`4×`. **THE READING OF RECORD IS THE THREE-MEMBER ONE.**⟩** **⟨GATE-2 SECOND LOOP `2026-10-05` — `D-3`'s OFFENCE NOW HAS A
NAMED SUB-LIMB AND TWO NAMED MUTATIONS (`§17.6`): the root field is asserted present with a
`.live-fixture/<fixtureId>/`-shaped value at BOTH post-assignment sites **and ABSENT at every early site**, with
(i) `delete the root field` and (ii) `plant a root field on a refusal line` as the mutations that must turn the
`print-site:post-assignment` resp. `print-site:early-paths` arm RED. **THE `3×state-member` COUNT IS UNMOVED — the
assertions ride the `print-site` term** (`§17.5` clause 1's named divergence covers the `4×` reading).⟩** |
| **D-4** | **A `mock-data-set` STATE WITH NO SELECTED SET** | a kind of `mock-data-set` while `fixtureId` reads `none` | contradiction — **`fixtureKind` is a function of the selection and of nothing else.** |
| **D-5** | **A SECOND, INDEPENDENT COMPUTATION OF THE STATE** | a site recomputing the state rather than reading the one binding | UNIT A's `X-2` (one read, four sites) — **`§11.2` `single-read`.** |
| **D-6** | **THE STATE NAMES AN OBSOLETE MECHANISM** | `fixtureId`/`fixtureState` reads a flag, a function or a directory of O-1…O-6 | UNIT A's `X-4`; and it makes the mock look like a regression of a retired route (`§6.3` clause 4). |
| **D-7** | **A SET STATE WITH NO CONSEQUENCE, OR WITH A UNIVERSAL CONSEQUENCE** | the line prints `mock-data-set` with UNIT A's `none`-state consequence sentence, or with a constant | **UNIT A's `X-5`/`X-6` STAND, and this unit's state is a NEW antecedent**: the consequence must be **derived and conditional on the state**, so under `mock-data-set` the printed clause states **what the mock set means for attribution** — *"the rows this run reports were driven against the mock data set named here; a fixture-fed PASS may NOT be quoted as a live-corpus app reading"* (`§9`). **A `none`-state consequence printed on a `mock-data-set` run is `X-6`'s offence in a new place.** |
| **D-8** | **THE MODE IS OMITTED** | a `--connect` run whose state does not say so | `§4` `S-5`: a foreign store's contents read as the set's. |

---

## 8. THE ENGINE SCOPE

### 8.1 What the mock corpus REQUIRES of the engine tooling (kept required)

**THE RULING'S SEQUENCING IS THE GOVERNING TEXT** (`DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL`):
**the rebuilt engine is READY FOR INTEGRATION; the SHELL-side integration is PENDING ON THE UI-OVERHAUL COMPLETION;
shell-side integration is therefore SEQUENCED AFTER it; and the engine-owned corpus is the LONG-TERM fixture — which is
why the driver-side fixture route is INTERIM BY CONSTRUCTION.**

**WHAT THIS MEANS FOR THE MOCK CORPUS, STATED AS A LIST THIS UNIT KEEPS REQUIRED:**

1. **THE IMPORT ROUTE'S ENGINE TOOLING IS REQUIRED AND MUST KEEP WORKING.** The mock sets reach the store through the
   app's own import route — **`edit.import_markdown`** — so the **`edit` tool group's existence and access** is a
   **precondition of every set** (`S-3` of `§4` names its failure). **This is REQUIRED test territory under the
   `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`'s required set (the TEST HARNESS features AND the existence and access of
   the foundation tools), not the exempt class.**
2. **THE STORE'S OWN READ/WRITE TOOLING THE SETS EXERCISE IS REQUIRED** — `rag.list_documents` · `rag.get_document` ·
   `rag.query` (the probe's query limb) · `edit.set_content` — **as they are**: this unit adds no tool, changes no reply
   shape, and asks the engine for nothing new (`§1.3`).
3. **THE ENGINE TOOLING THE MOCK CORPUS NEEDS IS THE ONLY ENGINE THING THIS UNIT REQUIRES.** **It keeps it required by
   using it and by naming it — not by adding to it.**

### 8.2 What is explicitly OUT of scope

| # | Out of scope | Why |
| --- | --- | --- |
| **1** | **THE ENGINE REBUILD** | `DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL` clause (2): the shell-side integration waits for the UI overhaul; engine-dependent shell work is sequenced after it and is **not interleaved** with it. **This unit does not touch the engine, its rebuild, or its tree.** |
| **2** | **THE SHELL INTEGRATION SEQUENCED BEHIND THE UI OVERHAUL** | same clause: the engine-authoritative document-CRUD cutover, `U-AUTHORITY-SWITCH`, the host-side atomicity-consistency row and the engine-fixture rows **all move behind that boundary** and are **not this unit's**. |
| **3** | **THE ENGINE-AUTHORITATIVE CUTOVER** | `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (whose cutover is gated on the same sequencing): **the host keeps its temporary local authority; no cutover is claimed, and no pass may describe it as done.** |
| **4** | **THE EXCLUDED ENGINE FAMILY'S FIXTURE** | the seven `gnosis_*` keys read the engine's own documents, which are **NOT the driver's corpus** (UNIT A `§2.3` `P-7`), and the driver's own `UF_EXCLUDED_ENGINE_FAMILY` **declares** the family, its `fixtureName` (`engine-documents`), its six row verdicts (`UF-GNOSIS-1`…`UF-GNOSIS-6`) and its clause — **and FAKES NO PROBE**. **`SPEC-CALL`: this unit adds NO registry entry for `engine-documents`** (`§5.2`'s five-name membership is unchanged), because (a) `read: null` already parks nobody, (b) the engine's absence is **engine-owned** and the `gnosis_*` rows keep their **named park reasons**, and (c) inventing a probe would make a **faked** engine reading, which the RULING's own honesty clause forbids. **The family's fixture stays a NAMED OPEN OBLIGATION, owed to whichever pass owns the engine fixture after the sequencing boundary (`§14` item 5).** |
| **5** | **ANY ENGINE-FIXTURE ROW'S UNPARKING** | clause (2)/(4) of the engine row: **until the shell-side integration runs, every engine-dependent row keeps its named park reason** — *"an absent engine is a precondition, not an app FAIL"* is the driver's own landed rule. |
| **6** | **THE ENGINE'S OWN CORPUS AS THE FIXTURE** | the engine-owned corpus is the **long-term** fixture and is **not available in this window** — which is why the set is a **mock**, and why the run's state must never describe it as a corpus. |

---

## 9. THE HONESTY CLAUSE, CARRIED (a fixture is an INPUT, never an oracle)

**UNIT A's `§7` IS THE GOVERNING TEXT AND THIS UNIT CARRIES IT UNCHANGED, IN FOUR CLAUSES PLUS TWO NEW ONES THE SETS
THEMSELVES MAKE NECESSARY:**

1. **A FIXTURE IS AN INPUT, NEVER AN ORACLE.** It supplies DATA. **It may never turn a proxy probe into a PASS**:
   `D-GP-UFA-2`'s `proxyPASS` rule stands untouched — a proxy oracle still records `proxyPASS: true` with `pass: false`,
   **whether its data came from a real corpus or from a mock data set.**
2. **EVERY FIXTURE-FED ROW MUST STILL ASSERT A REAL USER-VISIBLE END STATE ON THE ASSEMBLED SURFACE.** A data set changes
   **what the row is looking at**, never **what the row asserts**. `D-GP-UFA-3`'s falsifiability + real-input proof is
   unchanged: **a gesture is still hit-tested** (`path === 'cdp'` for `realInput`), **a row is still derived from an
   observed value**, and **no row may return an unconditional `pass`.**
3. **A MOCKED-FIXTURE READING MAY NEVER BE QUOTED AS A LIVE-CORPUS APP READING.** The two quoting rules UNIT A states
   (its `R-none` and its `R-mock`) stand; **this unit arms `R-mock`**: an artifact whose state names a mock set may
   support the rows' readings **as readings against THAT data set**, and **never** as readings of a live corpus.
   **⟨GATE-2 `2026-10-05` — THE ARGUMENT IS CORRECT AND ITS CITATION IS WRONG, AND BOTH ARE RECORDED RATHER THAN
   SMOOTHED (`§16.14`): `VERIFIED-BY-READ` over UNIT A's contract, **the row ids `R-none` and `R-mock` DO NOT EXIST**
   there — UNIT A carries the rule as prose (its clause 3 of the §7 honesty clause, and the printed `CONSEQUENCE`
   sentence's closing *"so no corpus-shaped reading in this artifact may be quoted as a live-corpus reading"*). **AND THE
   FILED *"THIS UNIT ARMS `R-mock`"* HAD **NO ARM AND NO NAMED MUTATION** IN `§11.2`: what the honesty group carried was
   the proxy limb and the clause's presence. **A NEW ARM IS CONTRACTED AT `§16.14`**: the artifact's own
   non-quotability TEXT is asserted against the source literal that prints it, with a NAMED MUTATION that deletes the
   non-quotability clause from the `mock-data-set` consequence and requires the arm RED.** **A landing pass that leaves
   the citation as filed and the honesty clause unarmed is a review finding, not a silent gap.**⟩**
4. **THE RUN MUST BE READABLE AS SUCH FROM ITS OWN ARTIFACT** (`§7`) — and **the SET's identity, the materialisation root
   and the mode are what make it so.**
5. **A SET'S CONTENT IS TEST DATA, NEVER PRODUCT DATA.** The sets are **hand-authored mock bytes** whose only purpose is
   to make a declared surface reachable. **They are not the app's corpus, not a sample of it, and not evidence about it**;
   the long-term corpus is the **engine's** (`§8`). **A fixture document is never cited as product content, never copied
   into `docs/**` as an example, and never shipped in any build output** (`§2.3` clause 4 keeps it out of the tree's
   committed surface). **The identity rule (`§2.4`) exists so that a document id in an artifact is unambiguous about which
   of the two it is.**
6. **NOTHING HERE IS A PASS.** **A green on this unit's arms proves the fixture machinery — never that the app works**
   (`§10.3`, `RCA-12`). **`scripts/live-drive.mjs` is in no trio leg**: a green trio proves **nothing** about the driver,
   the sets or the probes.

---

## 10. THE TYPED PROPERTY REGISTER (code-bearing unit — no exemption is available)

### 10.1 Is this unit code-bearing? YES (stated, so the exemption is not available)

**The deliverable edits `scripts/live-drive.mjs`** (the sets' content and materialisation, the arg, the three probes, the
state's derivation, the obsolete route's annotation, the re-pin of `§2.4`) **and `tests/live-drive-contract.test.ts`** (the
arms and this register). **A code-bearing unit carries a typed register, per the house rule.** **Its subject is the SET
IDENTITIES + the SELECTION ARG's semantics and refusals + the DIVERGENT PROBES + the RUN'S FIXTURE DECLARATION + the
OBSOLETE-ROUTE RETIREMENT — and nothing else.**

### 10.2 The register (`4` rows — every term printed as the sum of its factors)

**`§10.2.1` THE REGISTER IS A SEPARATE REGISTER, AND IT IS A THIRD ONE.** UNIT A declared, as a recorded decision, that
**its** four rows are their own register (its own seed, its own `DECLARED_REGISTER`-shaped array, its own
`§4 <P-ROW>`-prefixed `describe` titles) because *(a)* the landed `REGISTER_SEED = 0x20260929`'s literal assertion would
move, *(b)* the landed `7`-row count sits under the cap with exactly one row of headroom, and *(c)* `registerArmCensus`
scopes its class census per `§4 <P-ROW>`-title. **THE SAME THREE REASONS APPLY TO THIS UNIT'S ROWS, AND THE SECOND IS NOW
DECISIVE AGAIN:** the landed register holds `7` rows and UNIT A's holds `4`; **absorbing four more anywhere breaches the
`≤ 8` row cap** (`VERIFIED-BY-READ`: `UF_FIXTURE_REGISTER_CAPS = { perRow: 100, total: 400, rows: 8 }`). **THIS UNIT'S
FOUR ROWS ARE THEREFORE A THIRD REGISTER: its own seed constant, its own `RegisterRowSpec`-shaped array, its own
`§4 <P-ROW>`-prefixed `describe` titles, and its own `UF_*`-prefixed names.** **NEITHER OF THE TWO LANDED REGISTERS IS
TOUCHED: UNIT A's seed `0x20261002`, its four rows, its `11 + 24 + 24 + 20 = 79` and its `DECLARED_CLASS_MINIMUMS`
entries stay exactly as landed, and the first register's `0x20260929` / `7` rows / `101` stay byte-untouched.**

**`§10.2.2` THE SEED, IN THE HOUSE FORM.** **`0x20261005`** — **the filing date (`2026-10-05`) in the house hex form**,
per the house convention that the register seed's value **IS the filing date**. **The landing pass re-pins the exact
literal to the head it lands on; what this spec pins is that the value is a DATE, that it is NOT `0x20260929` (the
landed register's) and NOT `0x20261002` (UNIT A's), and that the re-pin is an assertion on the literal (`expect(...)
.toBe(0x<landingDate>)`), exactly the landed discipline.** **`OWED`: the exact landing literal is the landing pass's.**

**`§10.2.3` THE STRING GRAMMAR IS THE PIN'S OWN, ADOPTED BY NAME (UNIT A `§11.2.2`), AND THE `0×class-(b)` SPELLING RULE
BINDS.** A declared string is a **SUM OF PRODUCTS** with parenthesised groups: the character set is
`[0-9A-Za-z/()+\-×]` plus spaces/tabs; **a term is `k×<class>` or a bare `k`**, the class text running to the next
top-level `+`; **`declaredTotalOf` = the SUM of the terms' `k`** (a group's value entering the sum once); **and
`declaredLastTermOf` = the `k` of the LAST term of the DEEPEST group**, which **must equal the row's class-(b) NOT-RUN
budget** (`declaredTotal − declaredClassB` = the row's EXECUTED node-side arms). **Each of this unit's rows therefore ends
with the parenthesised `(… + 0×class-(b))`, whose last term is the `0` the arithmetic needs** — **the spelling rule UNIT
A records as binding for any row with no NOT-RUN arms.** **Every class named in a string must be INHABITED by at least
one `arm(run, N, '<class>:<name>')` label, and the class set must EQUAL the row's executed-label class set.** **⟨GATE-2
`2026-10-05` — THE SPELLING RULE ABOVE IS **MIS-STATED AS UNIVERSAL** AND IS CORRECTED IN PLACE, WITH THE FILED SENTENCE
KEPT VISIBLE (the review's own non-blocking note; `§16.10`): *"each of this unit's rows therefore ends with the
parenthesised `(… + 0×class-(b))`"* is **FALSE OF `P-TP-5`** — that row's budget is `10`, and its landed spelling carries
`+ 10×class-(b)` with NO enclosing group, so `declaredLastTermOf` reads the last term at depth `0`, which is `10`. **⟨GATE-3 AMENDMENT `2026-10-05` — THIS MECHANISM SENTENCE IS
`SUPERSEDED` AND IS KEPT VISIBLE: `declaredLastTermOf` does NOT read *"the last term at depth `0`"*. It takes the MAXIMUM
group depth over the WHOLE string and then the LAST term at that depth, so on the string this note is about — whose deepest
group is `(2×citation-repoint + 2×honesty-clause)` — it read **`2`**, not `10` (`VERIFIED-BY-READ` of the pin's reader, quoted
in the block below this table). The row's string is re-spelled by this pass so the class-(b) term IS the deepest group's last
term and the reading becomes `10`.⟩** **THE
UNIVERSAL IS NOT THE `0×` SPELLING; IT IS THE IDENTITY `declaredLastTermOf === declaredClassB`.** The `0×`-in-the-final-
group spelling binds **the three ZERO-BUDGET rows only** (`P-IM-6` · `P-SM-5` · `P-TP-4`); `P-TP-5` satisfies the same
identity with a positive bare term. **⟨GATE-3 AMENDMENT `2026-10-05` — THIS SENTENCE IS `SUPERSEDED` AND IS KEPT VISIBLE: `P-TP-5` did NOT satisfy the identity under the spelling then filed — the pin's own `declaredLastTermOf` (the MAXIMUM group depth, then the LAST term at that depth) returned `2` against the row's declared `10`, because that spelling's deepest group was `(2×citation-repoint + 2×honesty-clause)` (`VERIFIED-BY-READ` of the reader, quoted in the block below this table). The gate-3 pass re-spells the row — the `10×class-(b)` term becomes that group's last term — so the identity DOES hold, `10 === 10`, with no carve-out. The rule this sentence states as the universal (the IDENTITY) is unchanged, and it is the SPELLING that was wrong.⟩** **A spelling that puts the class-(b) term anywhere but the LAST term of the DEEPEST
group is out of contract for every row** (UNIT A `§11.2.2`/`§15.7` `F-6`'s corrected rule). **NO STRING IN THIS TABLE IS
CHANGED BY THIS NOTE** — all four already satisfy the identity (`0`/`0`/`0`/`10`).⟩** **⟨GATE-3 AMENDMENT `2026-10-05` — THE CLAIM IMMEDIATELY ABOVE
IS `SUPERSEDED` ON ITS `10` LIMB AND IS KEPT VISIBLE: the three zero-budget rows did satisfy the identity, `P-TP-5` did NOT
(the pin's own reader returned `2` for the filed spelling), and the sentence *"NO STRING IN THIS TABLE IS CHANGED BY THIS
NOTE"* is therefore false of the amendment that follows. THE STRING MOVES ONE TERM (the block below this table) so that all
four satisfy it — `0`/`0`/`0`/`10` — WITH NO CARVE-OUT; the RULE, the `0×`-in-the-final-group spelling of the three
zero-budget rows, and every figure are unchanged.⟩**

**THE FOUR DECLARED STRINGS, WRITTEN IN THAT GRAMMAR:**

| Row | `declared` (parser-compatible) | `declaredTotal` | `declaredClassB` | executed node-side |
| --- | --- | --- | --- | --- |
| **`P-IM-6`** | `2×set-identity + 3×set-file-list + 3×set-shape + 4×selection-grammar + (5×refusal-arms + 0×class-(b))` | **`17`** | **`0`** | **`17`** |
| **`P-SM-5`** | `3×probe-read + 5×falsifier-divergence + 2×probe-resolution + (2×probe-population + 0×class-(b))` | **`12`** | **`0`** | **`12`** |
| **`P-TP-4`** | `3×state-member + 3×state-derivation + 3×print-site + (2×state-consequence + 0×class-(b))` | **`11`** | **`0`** | **`11`** |
| **`P-TP-5`** | `3×obsolete-route-annotation + 3×route-supply-refusal + 7×repin-completeness + (2×citation-repoint + 2×honesty-clause + 10×class-(b))` **⟨GATE-3 AMENDED `2026-10-05` — one term moved: `10×class-(b)` is now the LAST term of the deepest group, so `declaredLastTermOf` reads `10` = `declaredClassB`. The superseded spelling is kept verbatim, marked `SUPERSEDED`, in the block below this table, and this row's cells are UNMOVED (`27`/`10`/`17`).⟩** | **`27`** | **`10`** | **`17`** |

**⟨GATE-3 AMENDMENT `2026-10-05` — ONE SURGICAL STRING MOVE IN `P-TP-5`'s DECLARED ROW: ITS `10×class-(b)` TERM BECOMES THE
LAST TERM OF THE DEEPEST GROUP. THIS BLOCK SUPERSEDES (a) THE FILED `P-TP-5` SPELLING OF THE TABLE ABOVE — re-quoted at
`§16.10`, at `§16.17` item 7, and, in the pin, in the third register — AND (b) `§10.2.3`'s GATE-2 NOTE WHERE IT SAID *"NO
STRING IN THIS TABLE IS CHANGED BY THIS NOTE — all four already satisfy the identity (`0`/`0`/`0`/`10`)"*, TOGETHER WITH THE
SAME CLAIM AT `§17.10` AND `§17.12` ITEM 9. BOTH SUPERSEDED ITEMS ARE KEPT VISIBLE, MARKED `SUPERSEDED`, AND NEITHER IS
REWRITTEN IN PLACE (`RCA-8(c)`). NO FIGURE OF ANY KIND MOVES.⟩**

1. **THE DEFECT, AS FOUND (the gate-2 remainder the unit's TestWriter caught at gate 3 while declaring the third register).**
   **THE SUPERSEDED SPELLING, KEPT VERBATIM AND MARKED `SUPERSEDED` — IT MUST NOT BE LANDED:**
   `3×obsolete-route-annotation + 3×route-supply-refusal + 7×repin-completeness + (2×citation-repoint + 2×honesty-clause) + 10×class-(b)`
   **`§10.2.3` DEFINES `declaredLastTermOf` AS *"the `k` of the LAST term of the DEEPEST group"*, BINDS THE IDENTITY
   `declaredLastTermOf === declaredClassB`, AND ADDS *"a spelling that puts the class-(b) term anywhere but the LAST term of
   the DEEPEST group is out of contract for every row."*** **In that spelling the deepest group is
   `(2×citation-repoint + 2×honesty-clause)`, whose last term is `2×honesty-clause`, so the identity read `2 === 10` and was
   FALSE OF THE STRING THIS SPEC PINNED VERBATIM: the note's claim that `P-TP-5` *"satisfies the same identity with a
   positive bare term"* was FALSE, and its *"all four already satisfy the identity (`0`/`0`/`0`/`10`)"* was false on its `10`
   limb.** **`VERIFIED-BY-READ` of the pin's own reader, quoted at item 4 below.**
2. **THE BINDING SPELLING (the table row above, `§16.17` item 7, and what a landing pass writes into the register array):**
   `3×obsolete-route-annotation + 3×route-supply-refusal + 7×repin-completeness + (2×citation-repoint + 2×honesty-clause + 10×class-(b))`
   — **ONE TERM MOVES AND NOTHING ELSE: the `10×class-(b)` term is written as the LAST term of the group that was already
   there.**
3. **WHY THE STRING MOVES AND NOT THE RULE, STATED SO THIS AMENDMENT IS NOT RE-READ AS A RELAXATION OF THE READER.**
   **`§10.2.3`'s definition is THE PIN'S OWN RULE, ADOPTED BY NAME, and the landed registers already obey it:** UNIT A's
   `P-TP-3` (`10×run-wide-state-limb + 10×class-(b)`) carries NO group at all, and `P-SM-3`'s class-(b) term is the last term
   of its group — **`VERIFIED-BY-READ` at the pin's `DECLARED_REGISTER` and `UF_FIXTURE_DECLARED_REGISTER` literals; only this
   unit's `P-TP-5` mixed a group elsewhere with a bare class-(b) term.** **Re-wording the reader is a change to a landed
   `tests/**` reader shared by three registers — an ARCHITECT call, not a spec edit — while moving one term of THIS UNIT'S
   OWN declared string costs no figure, no arm, no cap, no seed and no strategy id. THIS AMENDMENT THEREFORE TAKES THE STRING
   MOVE.**
4. **THE READER THIS AMENDMENT WAS VERIFIED AGAINST (`VERIFIED-BY-READ` of the pin's `declaredLastTermOf`, quoted without a
   line number per this file's convention). Its own operative lines are** `const top = Math.max(...terms.map((t) =>
   t.group))` · `const last = [...terms].reverse().find((t) => t.group === top)` · `return last === undefined ? Number.NaN :
   last.k`, **and its own comment reads** *"The last term is read as the LAST TERM OF THE STRING (the largest parenthesised
   group), never as the sum of everything after the last top-level `+` … A term's value is its own COUNT."* **`group` is
   supplied by `declaredFactorTerms` (*"GROUP DEPTH PER POSITION, from the string's own brackets"*): the count of `(` opened
   before the term's first digit — and the `(` inside the literal class name `class-(b)` opens AFTER the term begins, so it
   never shifts that term's own depth.**
5. **THE READING, UNDER THAT EXACT RULE, OF BOTH SPELLINGS.** **The amended string parses as six terms, with their depths:**
   `3×obsolete-route-annotation` (`0`) · `3×route-supply-refusal` (`0`) · `7×repin-completeness` (`0`) · `2×citation-repoint`
   (`1`) · `2×honesty-clause` (`1`) · `10×class-(b)` (`1`). **The maximum depth is `1`, and the LAST term at that depth is
   `10×class-(b)` — SO `declaredLastTermOf` READS `10`, EQUAL TO THE ROW'S `declaredClassB` `10`: THE IDENTITY HOLDS WITH NO
   CARVE-OUT** (`VERIFIED-BY-READ` of the rule at item 4). **On the superseded spelling the same rule reads `2`** — the
   divergence the TestWriter reported. **AND THE PIN'S SIBLING TOOTH IS SATISFIED TOO: its `C-10` limb requires the LAST
   PARSED TERM of a declared string to NAME `class-(b)`, and the amended string's last parsed term is `10×class-(b)`**
   (`VERIFIED-BY-READ`; true of the superseded spelling as well, which is why only the identity limb caught the defect).
6. **EVERY FIGURE, EACH LABELLED, ALL UNMOVED:**
   - `declaredTotalOf` = **`27`** — `VERIFIED-BY-READ` by the reader's own rule: the six terms' `k` are summed ONCE each,
     `3 + 3 + 7 + (2 + 2 + 10) = 27`, **the group entering the sum ONCE, its value being the sum of its terms** (`§10.2.3`).
   - `declaredLastTermOf` = **`10`** — `VERIFIED-BY-READ` of the amended string (`2` under the superseded spelling).
   - `declaredClassB` = **`10`** and EXECUTED node-side = **`17`** — `RECORDED READING` of `§10.2`'s own cells, the executed
     figure `VERIFIED-BY-READ` by arithmetic (`27 − 10 = 17`).
   - the register **`17 + 12 + 11 + 27 = 67`** with EXECUTED **`57`**; the caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows; the
     seed **`0x20261005`**; `P-TP-5`'s strategy id **`strat:mock-fixture-obsolete-route`** — **UNMOVED** (`RECORDED READING`
     of `§10.2`, `§10.2.2` and `§10.2.4`).
   - **NO OTHER ROW'S STRING MOVES, AND THE `0×`-IN-THE-FINAL-GROUP SPELLING OF THE THREE ZERO-BUDGET ROWS (`P-IM-6` ·
     `P-SM-5` · `P-TP-4`) IS UNCHANGED.**
7. **THE PIN-SIDE REMAINDER THIS AMENDMENT CREATES — NAMED `OWED`, NOT DONE HERE (a `tests/**` act; this pass holds
   doc-writes only).** **`VERIFIED-BY-READ` at the pin:** **(a)** the third register's `P-TP-5` row still carries the
   SUPERSEDED literal (`+ (2×citation-repoint + 2×honesty-clause) + 10×class-(b)`, with `declaredTotal: 27` and
   `declaredClassB: 10`) — **it must move to the amended spelling**; and **(b)** that register's `§10.2.3` identity arm
   currently REPORTS the conflict and filters it out for `P-TP-5` alone (`conflicts.filter((c) => !c.startsWith('P-TP-5'))`)
   — **with the string amended, that carve-out must be REMOVED so the identity tooth bites on all four rows.** **Both are
   `OWED` to the TestWriter.**
8. **THE FILE'S LINE COUNT AND ITS `sha256`/`md5` MOVE WITH THIS EDIT.** **The digest this pass was given — `sha256`
   `bc824649f3e87242c1d0a87c4ca5faeb0f0bf456f2a4712cca68ea1dcd5acdb3`, md5 `e859390d40f2c3c52903dad4e4a56e05`, at `2652`
   lines — is a `RECORDED READING` OF THE PRE-AMENDMENT FILE (measurer: the pass that supplied it; this pass holds NO SHELL
   and took no digest). THIS EDIT MOVES THE FILE, SO THAT DIGEST IS `SUPERSEDED` AS THE FILE'S OWN DIGEST AND BOTH DIGESTS
   ARE `OWED` AGAIN AT `§14` item 1.** **The post-amendment line count is re-taken from the file-read tool's own census after
   this pass's last edit and is stated in `§18.8` item 1's gate-3 marker (`VERIFIED-BY-READ` there); the earlier censuses of
   `§14` item 2, `§16.17` item 10, `§17.13` item 14 and `§18.8` item 1 stay visible with their own superseded markers.**⟩**

**TERM SEMANTICS, STATED SO NO PRODUCT/COUNT IS AMBIGUOUS (`k×<class>` = `k` ARMS, EACH A SEPARATE EXECUTED ATTEMPT; a
per-set or per-key reading is a LOOP INSIDE one arm, never additional arms — the pin's `arm()` is one executed attempt
and this register counts ATTEMPTS, not data points):**

- **`2×set-identity`** — `set-identity:name-set` (the five names are exactly the arg's closed value set, read as pure
  data from both ends) · `set-identity:root-and-id-scheme` (the materialisation root and the identity scheme are ONE
  decision, and the driver's own hardcoded identities agree with it).
- **`3×set-file-list`** — the materialisation's file list per set (`set-file-list:declared`) · the **no-stale-file** rule
  (`set-file-list:no-stale`) · **the `empty` set's own empty list** (`set-file-list:empty-set`). **A per-set traversal is
  a LOOP INSIDE each arm.**
- **`3×set-shape`** — the content properties of `§2.2` are **present in the sets' own data** (`set-shape:table` ·
  `set-shape:inline` · `set-shape:probe-term-coverage`), each read from the content literal. **`set-shape:probe-term-coverage`
  is the P-δ/P-θ rule: the probe's term is carried by every document-carrying set EXCEPT `search`, and `search` carries
  none.**
- **`4×selection-grammar`** — the four grammar limbs of `§3.2` (`selection-grammar:closed-set` ·
  `selection-grammar:flag-form` · `selection-grammar:no-trim-no-case` · `selection-grammar:repeat-rule`).
- **`5×refusal-arms`** — the four pre-spawn refusals `A-1`…`A-4` of `§3.3` **plus their common limbs**
  (`refusal-arms:marker-and-exit` — one named line, the state printed, exit `2`, nothing spawned and nothing written) —
  **five arms, and the fifth is the shared-form arm, not a fifth refusal.**
- **`3×probe-read`** — one arm per **gated** fixture name, each asserting that name's `read` against `§5.2`
  (`probe-read:corpus-documents` — the store list, unchanged · `probe-read:corpus-query-results` — the painted
  result-row census · `probe-read:corpus-document-tabs` — the rendered document-tab census). **⟨GATE-2 `2026-10-05` —
  EACH ARM COMPARES **THE LITERAL STRING** `§5.2` CONTRACTS, NOT A PROSE DESCRIPTION OF IT (`§16.3`, `§16.8`): the three
  comparisons are `'rag.list_documents'` · `'dom:#pane-search li[data-document-id]'` ·
  `'dom:#tab-strip .tab[data-document-id]'`, asserted **exactly equal to** the registry entry's `read` — nothing here
  paraphrases. A landed registry whose `'corpus-query-results'` `read` is `rag.list_documents` is RED (the `F-2` state),
  and so is a DOM sentinel that differs from the selector by one character.⟩** **⟨GATE-2 THIRD LOOP `2026-10-05` — THE
  SECOND COMPARISON LITERAL IS RE-STATED (`§18.2` clause 6): THE THREE LITERALS THIS TERM ASSERTS ARE NOW
  **`'rag.list_documents'` · `'rag.query'` · `'dom:#tab-strip .tab[data-document-id]'`** — `'dom:#pane-search
  li[data-document-id]'` is `SUPERSEDED` and is kept visible immediately above. **THE ARM NAMES, THE ARM COUNT (`3`), THE
  ROW'S `k` (`3`), `P-SM-5`'s TOTAL (`12`) AND THE REGISTER (`67`/`57`) ARE ALL UNMOVED (`§18.6`).** THE MUTATIONS THAT
  MUST BITE ARE `§18.2` clause 7's; `§16.8`'s table row for this arm is re-stated at its own site. THE ARM'S SUBJECT IS
  UNCHANGED: *a gated fixture's `read` is not the surface `§5.2` names*.⟩**
- **`5×falsifier-divergence`** — `FA-1`…`FA-5` of `§5.5`, one arm each (`falsifier-divergence:query-results-absent` ·
  `falsifier-divergence:document-tabs-absent` · `falsifier-divergence:no-false-park` ·
  `falsifier-divergence:agreement-at-core` · `falsifier-divergence:none-state-unmoved`).
- **`2×probe-resolution`** — the resolved-absence rule and the unreadable-is-not-absent rule (`§5.2` clauses 1/2/3):
  `probe-resolution:resolved-false` · `probe-resolution:resolved-false-parks-nobody`.
- **`2×probe-population`** — `§5.4`'s two directions: `probe-population:gated-name-has-read` ·
  `probe-population:never-gated-name-has-null-read`.
- **`3×state-member`** — the three members of `§7.1`, each asserted as reachable and as carrying the set's identity
  (`state-member:fixtureState` · `state-member:fixtureKind` · `state-member:fixtureId`). **⟨GATE-2 `2026-10-05` — THE
  THREE ARMS GRADE THE OBJECT'S OWN MEMBERS **`state` · `kind` · `id`** (`§7.1`'s gate-2 ruling: the materialisation root
  is PRINTED TEXT and is **NOT** a fourth member, `§16.4`), while the arm NAMES keep the printed-line labels. The arm
  label set is therefore `state-member:state` · `state-member:kind` · `state-member:id`, and a landing pass that adds a
  fourth member amends UNIT A and must re-derive this term to `4×`. **THE COUNT IS `3` UNCHANGED.**⟩**
- **`3×state-derivation`** — the derivation is the arg and nothing else (`state-derivation:from-argv-only`) · **one
  assignment** (`state-derivation:one-assignment`) · **the assignment sits AFTER the refusal branches**
  (`state-derivation:order-after-refusals`). **⟨GATE-2 `2026-10-05` — THE THIRD ARM IS THE ONE THAT SETTLES THE REFUSAL
  LINES (`§16.5`): it asserts the assignment's POSITION, and its corollary is that a refusal line reached before it
  prints the `none` triple — including the `--fixture` refusal's own line. A landing pass that moves the assignment for
  a prettier refusal line breaks this arm.**⟩**
- **`3×print-site`** — the four sites contract, asserted as **one read feeding every site**: `print-site:launch-profile` ·
  `print-site:summary` · `print-site:early-paths` (the refusal lines and the module-level `main().catch` ERROR line, each
  carrying the state and the `--fixture` refusal carrying it too). **⟨GATE-2 `2026-10-05` — `print-site:early-paths`
  ASSERTS THE **`none` TRIPLE** AT EVERY EARLY SITE (`--groups=` · ports · `--home` · the `--fixture` refusal · the
  `main().catch` ERROR line) and NEVER the selected set's name; the set's name is asserted at `print-site:launch-profile`
  and `print-site:summary` ONLY (`§16.5`). "The `--fixture` refusal carrying it too" is read as *carrying the state the
  assignment has reached at that point*, which is `none`. **⟨GATE-5 AMENDMENT `2026-10-05` — THIS SENTENCE'S `main().catch` LIMB IS `SUPERSEDED` AND THE ARM'S SUBJECT IS THEREFORE TWO SUBJECTS: the `none` TRIPLE at the FOUR REFUSAL PATHS, and THE BINDING'S OWN READING at the `main().catch` ERROR line (`none` on a pre-assignment abort / the selected set's triple on a post-assignment abort). THE `3×` COUNT, THE TERM'S NAME AND THE FIVE-EARLY-SITE / TWO-POST-ASSIGNMENT PHYSICAL CENSUS ARE UNMOVED. THE INSTRUCTION A TESTWRITER IMPLEMENTS: `§21.1` clause 3; measured evidence: greens `F-8`/`F-9` (fail ledger `F-2`).⟩**⟩** **⟨GATE-2 SECOND LOOP `2026-10-05` — THE `3×` IS RECONCILED
  WITH THE FOUR PHYSICAL SITES AND THE TERM NAMES ARE CORRECTED (`§17.5`), THE FILED NAMES KEPT VISIBLE: the three
  NAMED TERMS grade *"one read feeding"* at three GROUPS and cover `4` physical sites, so the term is
  **`print-site:early-paths` (a GROUP of four early sites) plus `print-site:post-assignment` (the two sites the
  assignment precedes — `launch-profile` and `summary` — graded TOGETHER, which is the `print-site:launch-profile` ·
  `print-site:summary` pair above)**. **THE COUNT STAYS `3×`** — a landing pass that splits the two post-assignment
  sites into separate terms declares `4×` and must re-derive `P-TP-4`'s total with both values visible. **AND
  `print-site:early-paths` GAINS THE ROOT'S ABSENCE-LIMB (`§17.6` clause 2): the materialisation root is printed at the
  TWO post-assignment sites ONLY, so its ABSENCE at every early site is asserted here, with a named mutation.**⟩**
- **`2×state-consequence`** — the consequence is the **conditional, derived** clause under `mock-data-set`
  (`state-consequence:mock-armed`) and **the `none` consequence is printed only under `none`**
  (`state-consequence:none-scoped`) — `§7.3` `D-7`. **⟨GATE-2 `2026-10-05` — `state-consequence:mock-armed` OWES ITS
  **OWN NAMED MUTATION**, which `§11.2`'s `STATE-CONSEQUENCE` group did not carry (its filed mutation targets the
  `none` consequence, `§16.15`): the mutation is **DELETING THE `mock-data-set` CLAUSE from the derived consequence**,
  and the arm must go RED. Both arms grade the NEW antecedent (`§16.15`).⟩**
- **`3×obsolete-route-annotation`** — one arm per obsolete family, asserting the **status** the driver's own text
  carries and that no obsolete mechanism is named as a supply (`obsolete-route-annotation:seed-family` ·
  `obsolete-route-annotation:o0-corpus-route` · `obsolete-route-annotation:no-supply-in-declaration`).
- **`3×route-supply-refusal`** — `§6.4`'s three limbs: `route-supply-refusal:refused-by-name` ·
  `route-supply-refusal:empty-set-not-exempt` · `route-supply-refusal:no-seed-admitted`. **⟨GATE-2 `2026-10-05` — THE
  FIRST LIMB GRADES THE **FOUR SUPPLY FLAGS** (`--seed=` · `--corpus-root=` · `--strict-seed=` · `--o0-corpus=`) AND
  NOTHING ELSE; the THIRD limb additionally grades `§6.4` clause 4's **IMPLIED `--no-seed`** (`§16.13`): a
  `--fixture=<set>` run must show that the obsolete seed route did NOT run. The count stays `3×` — the implication is a
  limb of the third arm, not a fourth arm.⟩**
- **`7×repin-completeness`** — one arm per **re-pin group** of `§2.4`, so a group that keeps a dead identity is caught by
  name: `repin-completeness:document-ids` (`R-1`/`R-2`'s beta leaf and folder label) ·
  `repin-completeness:alpha-identity` (`R-3`…`R-9`, `R-12`) · `repin-completeness:node-ids` (`R-4`'s `:p:1`) ·
  `repin-completeness:prefix-filters` (`R-10`'s `filters.documentPathPrefix`) · `repin-completeness:docnav-folder` (`R-11`) ·
  `repin-completeness:table-candidate` (`R-13`) · `repin-completeness:self-provisioners` (`R-14`/`R-15`). **Each arm is a
  source sweep for the OLD identity family, and a hit is the offence.** **⟨GATE-2 `2026-10-05` — THE LAST TWO ARMS GRADE
  THE TWO CORRECTED GROUPS (`§16.2`, `§16.7`): `table-candidate` asserts the candidate list's **HEAD IS THE TABLE
  DOCUMENT'S OWN LITERAL IDENTITY** (not a slice position), and `self-provisioners` asserts that **NO
  `.live-fixture/core/` LITERAL survives in a self-provisioning block's write path** — the write path is the resolver's
  output. `Each arm is a source sweep for the OLD identity family` is unchanged and stays true: the `.live-fixture/core/`
  literal IS an old-identity-family hit.⟩**
- **`2×citation-repoint`** — `citation-repoint:no-dead-path` (no citation in the driver's own text points at the
  materialised path as if it were committed) · `citation-repoint:surface-prose` (the `UF_FIXTURE_DECLARATION` `surface`
  members that quote an identity quote the NEW one).
- **`2×honesty-clause`** — `honesty-clause:no-proxy-pass` (the pin's standing `proxyPASS` rule is untouched and a
  proxy oracle still reads `proxyPASS:true` + `pass:false` under a mock set) · `honesty-clause:mock-quote`
  (the artifact's `mock-data-set` clause states the non-quotability rule, `§9` clause 3). **⟨GATE-2 `2026-10-05` —
  `honesty-clause:mock-quote` IS THE ARM `§9` CLAUSE 3 CALLS *"ARMS `R-mock`"*, AND ITS SUBJECT IS THE ARTIFACT'S OWN
  **TEXT**: it asserts the non-quotability sentence against the source literal that prints it, with a **NAMED MUTATION**
  (delete that sentence from the clause) that must turn it RED (`§16.14`). It is NOT the same arm as the `mock-data-set`
  consequence arm of `state-consequence` — one grades the presence of the text, the other grades that the consequence is
  derived and conditional on the state.⟩**
- **`10×class-(b)`** — **THE NAMED NOT-RUN BATTERY TERMS (`§11.3`), ENUMERATED: the five per-set live readings
  (`class-(b):core` · `:table` · `:search` · `:tabs` · `:empty`) · the two falsifier readings (`class-(b):FA-1` ·
  `:FA-2`) · the obsolete-route-only negative reading (`class-(b):route-only-none-state`) · the `none`-default reading
  (`class-(b):default-unmoved`) · the trio's scope caveat (`class-(b):trio-scope`).** **Each carries a non-empty
  `unrunArm` reason and a labelled outcome class.**

**`§10.2.4` STRATEGY IDS:** `strat:mock-fixture-set-identity` (`P-IM-6`) ·
`strat:mock-fixture-declared-probes` (`P-SM-5`) · `strat:mock-fixture-run-declaration` (`P-TP-4`) ·
`strat:mock-fixture-obsolete-route` (`P-TP-5`). **Every row reports `held`/`broken`; the report prints each row's
declared-vs-executed term.**

**`§10.2.5` THE FOUR `describe` TITLES (each must literally carry the string `§4 <P-ROW>`, or the row is INVISIBLE to
`registerArmCensus` and its `arm()` calls are counted under whichever earlier title precedes them — a SILENT
mis-attribution, not a failure; UNIT A `§11.2.5`):** **`§4 P-IM-6`** · **`§4 P-SM-5`** · **`§4 P-TP-4`** · **`§4 P-TP-5`.**
**AND THE PER-CLASS MINIMUMS MUST BE SUPPLIED IN THE SAME PASS**, because `declaredFactorClassOffences` reads
`DECLARED_CLASS_MINIMUMS[r.row] ?? {}` and a **missing entry degrades SILENTLY to no floors**: **the minimum for a class
term is the row's own declared `k`** (the term's `k` is both the floor and the exact figure; the minimum's only job is to
make a deleted or renamed class term an offence). **The `class-(b)` term is NOT in that record**: it is validated against
the row's `unrunArm` count.

**⟨GATE-2 SECOND LOOP `2026-10-05` — THE MINIMA ARE KEYED ON THE CLASS **PREFIX**, WHICH IS WHAT MAKES THE GATE-2
`state-member:state|kind|id` ARM NAMES CONSISTENT WITH THIS RECORD (`§17.9`), STATED SO A TESTWRITER DOES NOT BUILD A
RECORD THE PIN CANNOT READ:** **a minima record is keyed by the term's CLASS — the text before the arm label's `:` —
and NEVER by a whole arm label.** So the three `state-member` arms of `P-TP-4` contribute ONE class, **`state-member`**,
and `P-TP-4`'s record entry is **`{ 'state-member': 3, 'state-derivation': 3, 'print-site': 3, 'state-consequence': 2 }`**
— **one key per CLASS, its value the term's own `k`** (`VERIFIED-BY-READ` of the pin's own consumer:
`declaredFactorClassOffences` looks a minima key up with `named.get(cls)`, where `named` is built from the declared
string's OWN class terms, and counts the arms via `census.executedClasses.get(cls)` — **a key spelled as a whole arm
label such as `'state-member:state'` matches NO declared term and degrades to a MISS, i.e. a silent no-floor**). **The
gate-2 `state-member:state` · `state-member:kind` · `state-member:id` names of `§10.2.3` are therefore ARM LABELS (the
class `state-member` plus the member each arm grades) and are not minima keys; both spellings are consistent under this
rule and neither is rewritten.**

**ARITHMETIC, printed with its terms — `17 + 12 + 11 + 27 = 67` attempts total** (**`VERIFIED-BY-READ` of the sum:
`17 + 12 = 29`; `29 + 11 = 40`; `40 + 27 = 67` — the terms and the total agree**), **under the `≤ 400` total cap; the
largest row is `P-TP-5` at `27`, under the `≤ 100` per-row cap; `4` rows, under the `≤ 8` row cap.** **NO `F-` ROW
APPEARS IN THIS SECTION AND NO `§6`/`FS-n` CITATION APPEARS IN THE REGISTER'S OWN ROWS** (the pin's typing rule);
**the `§`-citations in this section's prose are cross-references to this file's own sections, not register rows.**
**⟨GATE-2 `2026-10-05` — THIS ARITHMETIC, THE `57` EXECUTED, THE THREE CAPS AND THE SEED `0x20261005` ARE THE
GATE-2 REVIEW'S **VERIFIED-CLEAN** ITEMS AND ARE UNTOUCHED BY THIS AMENDMENT. The `35`-key gated population of `§16.17`
moves NO register figure: the register counts ATTEMPTS, not keys, and no term of any row is a population term.⟩**

### 10.3 The register's typing and honesty limits

1. **TYPING: `P-IM-*` / `P-SM-*` / `P-TP-*` ONLY; no `F-` row; no `§6`/`FS-n` citation inside the register.**
2. **`P-IM-6` and `P-SM-5` are SOURCE-DERIVATION arms** and are the register's strongest terms in node; **`P-TP-4`'s
   print-site arm is a source read with the class-(b) readings named NOT-RUN, and `P-TP-5`'s `10×class-(b)` terms are the
   battery itself — a row that claims a live arm it cannot run in node is the self-verification `RCA-1` exists to catch.**
3. **`P-TP-5`'s class-(b) budget is `10` of its `27`** — the largest class-(b) term in this register, stated so no
   reader mistakes the node-side `17` for the battery's readings.
4. **A ROW WHOSE ARM CANNOT FAIL MUST BE RE-DERIVED AGAINST ITS DECLARED TERMS, NEVER RE-SCOPED.**
5. **THIS REGISTER IS FILED, NOT RUN.** The TestWriter lands it with the `§11.2` arms; the counts above are the
   declaration the TestWriter must reproduce or re-state **with both values visible**.
6. **THE `declared` STRINGS ARE PART OF THE CONTRACT, NOT PROSE**: they are written INTO the register array in the
   pin's own grammar, and the pin's arithmetic (`declaredTotalOf`, `declaredLastTermOf`,
   `declaredFactorClassOffences`) must hold on them **as written**. **⟨GATE-3 AMENDMENT `2026-10-05`: *"AS WRITTEN"* MEANS THE AMENDED SPELLING — `P-TP-5`'s
`declared` literal is written into the register array with its `10×class-(b)` term as the LAST term of the deepest group
(`§10.2`'s table and the gate-3 block below it, `§16.17` item 7). THE SUPERSEDED SPELLING IS `SUPERSEDED` AND MUST NOT BE
LANDED; the row's `declaredTotal` stays `27`, its `declaredClassB` stays `10`, and the pin's own arithmetic must hold on the
amended spelling exactly as it does on the other three rows (`declaredTotalOf` `27`, `declaredLastTermOf` `10`).⟩** **A string that reads correctly to a human but does
   not parse is a TestWriter-visible defect.**
7. **TWO NAMED PIN HAZARDS BIND THIS REGISTER (UNIT A `§11.2.5`/`§12` items 10/11):** the arms are **LITERAL**
   `arm(run, N, …)` calls (**at most one loop-generated set per `describe`**, because the census's behind-the-arm window
   reads a neighbouring loop's array), and **no battery term and no `unrunArm` reason carries an apostrophe** (the
   unrun-term parser splits on single quotes).
8. **THE THIRD SEED'S LITERAL ASSERTION STAYS AN ASSERTION, and the two landed seeds' assertions are untouched.**

---

## 11. THE RED SET AND THE GATES

### 11.1 The two classes (`RCA-1`: red FIRST, RUN, and REPORTED)

| # | Class | What it proves | What it CANNOT prove |
| --- | --- | --- | --- |
| **(a)** | **The no-battery SOURCE-DERIVATION class** — the pin (`tests/live-drive-contract.test.ts`) + this register's node-side arms. **No Electron, no driver import, no battery.** | that the sets exist and are the arg's value set; that the arg's grammar, its refusals and its single-assignment derivation are as contracted; that the three probes' `read` values are divergent as contracted; that the obsolete route is annotated and its supply refused; that the re-pin set is complete and the citations repointed. | that a set **actually drives** a row; that a probe **actually reads absent** at a live non-empty store; that the app behaves in any way |
| **(b)** | **The real runs** — `node scripts/live-drive.mjs --fixture=<set>` on **isolated ports**, boot-and-connect confirmed, **one run per set**, runnable by hand or by a script and **NOT from a node unit row** | the live readings `§11.3` names: each set's declared state and the rows that set makes drivable; **the two falsifier runs**; the obsolete-route-only run's `none` state; the default run's non-movement | anything app-layer; **no reading here is app evidence** (`RCA-12`), and **no fixture-fed PASS may be quoted as a live-corpus app reading** (`§9`) |

### 11.2 The class-(a) red set — the arms the TestWriter must author (each with its named mutation)

**EVERY ARM IS A SOURCE DERIVATION over `scripts/live-drive.mjs` (the pin's own idiom: it never imports the driver, which
would run `main(process.argv.slice(2))` at module scope).** **The arm count is the register's own `67` minus its
`10` named NOT-RUN terms = `57` executed node-side attempts** — **the TestWriter's red tally must state which of them are
RED at the filing head (see `§11.2`'s own RED-AS-FILED list).**

| Arm group | FAILS when | Its NAMED MUTATION |
| --- | --- | --- |
| **SET-IDENTITY** (`P-IM-6`'s `2×set-identity`) | the arg's closed value set and the sets' names disagree — a name with no set, or a set with no name | delete a set's content data; add a sixth name to the parser's list only |
| **SET-FILE-LIST** (`3×set-file-list`) | a set's declared files and its materialised list disagree; a stale `.md` survives; the `empty` set carries a file | leave an extra `.md` in the set's directory across two launches; give `empty` a file |
| **SET-SHAPE** (`3×set-shape`) | `table` lacks a stored `<table>`; the inline element is gone; **the probe's term is carried by `search`** (or by no document-carrying set) | strip the table from `table.md`; plant the probe term in `search`'s text | **⟨GATE-5 RULING `2026-10-05` — THIS ROW'S SUBJECT IS NARROWED AT `set-shape:table`: the arm reads the set's own content literal for the **PARSER-MEDIATED** form — a GFM pipe table, the form the app's markdown import turns into a real `:table:` node — and the raw-`<table>`-literal reading is `SUPERSEDED` (`§22.2` item 3).** **WHY: the app's import DROPS raw HTML entirely (`parseMarkdown`'s HTML branch), so a raw literal satisfies the SOURCE-STRING shape while producing NO TABLE NODE — a string shape the app's own supply route discards cannot deliver the contracted end state.** **THE MUTATION'S SHAPE (strip the table from `table.md`) IS UNCHANGED, AND THE ARM'S COUNT (`3×set-shape`) MOVES NOTHING.**⟩** |
| **SELECTION-GRAMMAR** (`4×selection-grammar`) | the flag form drifts (a bare `--fixture` becoming accepted); a value is trimmed or lowercased into the set; the repeat rule admits two different values | add `opt.fixture = a.trim().toLowerCase()`; make the repeat last-wins |
| **REFUSAL-ARMS** (`5×refusal-arms`) | a refusal loses the `ARG-REFUSED` marker, the printed state, the exit code, or the pre-spawn order; **a refusal path materialises a set or mints the scratch HOME** | delete the exit-code assignment on the `--fixture` branch; move the refusal below the materialisation |
| **PROBE-READ** (`3×probe-read`) | a gated fixture's `read` is not the surface `§5.2` names (the `F-2` state itself) | set `'corpus-query-results'`'s `read` back to `'rag.list_documents'` **⟨GATE-2 THIRD LOOP `2026-10-05` — THIS MUTATION STANDS AND NOW BITES HARDER: `'rag.query'` RESTORED TO `'rag.list_documents'` IS THE `F-2` STATE **AND** IT TURNS THE `tabs` READING INTO AN ABSENT-LOOKING ALIAS OF `pre` (`§18.2` clause 7 item 1). **THE SECOND NAMED MUTATION FOR THIS ARM — RESTORE THE FIRST LOOP'S COMPOUND LIMB (a `'dom:'` literal for this name AND the dropped painted-row conjunct) — rides the SAME ARM at `§18.2` clause 7 item 2; no new arm, no `k`, no register figure.**⟩** |
| **FALSIFIER-DIVERGENCE** (`5×falsifier-divergence`) | `FA-1`…`FA-5` (`§5.5`) cannot be exhibited from the driver + the sets as written | make `search` carry the probe term (kills `FA-1`); make `tabs` open a document tab at launch (kills `FA-2`) |
| **PROBE-RESOLUTION** (`2×probe-resolution`) | an unresolved probe is treated as an absence (a false park), or a resolved `0` count is treated as unresolved | `present: failure === null && …` → `present: docs > 0` with `resolved` always true |
| **PROBE-POPULATION** (`2×probe-population`) | a gated name has no read, or a never-gated name has one | add a `'self-provisioned-document'` probe that reads the store |
| **STATE-MEMBER** (`3×state-member`) | a member is missing, or the set's identity does not reach `fixtureId` | drop `fixtureId`; hard-code `'core'` |
| **STATE-DERIVATION** (`3×state-derivation`) | the state is read from anything but the argv; two assignments appear; the assignment moves ABOVE a refusal branch | read an env var; assign twice; move the assignment above the `--groups=` refusal |
| **PRINT-SITE** (`3×print-site`) | a site stops carrying the state; a site computes its own | delete the summary-site member; delete the `--fixture` refusal's state interpolation |
| **STATE-CONSEQUENCE** (`2×state-consequence`) | the `none` consequence prints under `mock-data-set`, or the `mock-data-set` clause is a constant | print `UF_FIXTURE_STATE_CONSEQUENCE` unconditionally |
| **OBSOLETE-ROUTE-ANNOTATION** (`3×obsolete-route-annotation`) | the driver's own text stops naming a route obsolete, or the declaration names a supply mechanism | delete the obsolete markers; put `seedCorpus` in a `fixtureName` |
| **ROUTE-SUPPLY-REFUSAL** (`3×route-supply-refusal`) | the two-supplies refusal is absent, or exempts `empty`, or refuses `--no-seed` | delete the refusal branch; add `empty` to its exemption; treat `--no-seed` as an offence |
| **REPIN-COMPLETENESS** (`7×repin-completeness`) | any OLD identity family survives in the driver's source or in the pin's quoted strings | revert one re-pin (`tabs`'s node id); leave one `surface` member quoting the old id |
| **CITATION-REPOINT** (`2×citation-repoint`) | a citation points at the materialised path as if committed; a `surface` member quotes a dead identity | plant a `docs/`-style citation to the set directory |
| **HONESTY-CLAUSE** (`2×honesty-clause`) | a proxy oracle can read `pass:true` under a mock set; the non-quotability clause is absent from the `mock-data-set` text | flip the pin's existing proxy arm to `pass:true`; delete the clause |

**THE RED SET AS FILED — WHAT IS RED AT THIS HEAD, BY CONSTRUCTION (stated so the TestWriter's tally is not a
surprise):** **RED** — every arm of **SET-IDENTITY**, **SET-FILE-LIST**, **SET-SHAPE**, **SELECTION-GRAMMAR**,
**REFUSAL-ARMS**, **PROBE-READ** (the `F-2` state **is** the red: two of the three `read` values are the store read
today), **FALSIFIER-DIVERGENCE** (its subjects do not exist), **STATE-DERIVATION** (there is no arg), **REPIN-COMPLETENESS**
(the identities are the old ones), **ROUTE-SUPPLY-REFUSAL**, **CITATION-REPOINT**, **STATE-CONSEQUENCE**'s
`mock-data-set` limb. **GREEN-PRESERVING (a red on absence, green when the machinery lands):** **STATE-MEMBER**,
**PRINT-SITE**, **PROBE-RESOLUTION**, **PROBE-POPULATION**, **OBSOLETE-ROUTE-ANNOTATION** (the declaration's own comment
already names the routes obsolete), **HONESTY-CLAUSE**'s proxy limb (the landed rule holds today). **The register's four
rows are authored WITH these arms, not after them, and the red tally reports the register rows' `held`/`broken`
SEPARATELY from the arm groups.** **⟨GATE-2 `2026-10-05` — THREE NAMED MUTATIONS ARE AMENDED OR ADDED, EACH BECAUSE THE
FILED FORM COULD NOT DISCRIMINATE THE BEHAVIOUR ITS ARM GRADES (`§16.14`, `§16.15`, `§16.16`):**

1. **`STATE-CONSEQUENCE` GAINS A SECOND, NAMED MUTATION.** The filed row carries ONE mutation (*"print
   `UF_FIXTURE_STATE_CONSEQUENCE` unconditionally"*), which targets **the `none` consequence's scoping** — i.e.
   `state-consequence:none-scoped`. **THE ARM `state-consequence:mock-armed` HAD NO MUTATION AT ALL.** Its named mutation
   is **DELETING THE `mock-data-set` CLAUSE from the derived consequence** (the clause `§7.3` `D-7` requires, stating what
   the mock set means for attribution), and the arm must turn RED on that source.
2. **`HONESTY-CLAUSE`'s `mock-quote` MUTATION IS NAMED.** The filed row's mutations are the proxy flip and *"delete the
   clause"*, where **"the clause"** read as the whole `mock-data-set` text. **Its named mutation is now specifically
   DELETING THE NON-QUOTABILITY SENTENCE** (*"a fixture-fed PASS may NOT be quoted as a live-corpus app reading"*) **from
   that text**, and the arm that goes RED is `honesty-clause:mock-quote` — the arm `§9` clause 3 calls *"arms `R-mock`"*.
   **The `RED-AS-FILED` list above is unaffected (the arm is GREEN-PRESERVING today because the text does not exist yet);
   it is the MUTATION that must go RED.**
3. **`PROBE-POPULATION`'s MUTATION SET IS COMPLETED BY THE PIN'S OWN EXISTING MUTATION, WHICH MUST** ***BITE***. The filed
   row's mutations are *"add a `'self-provisioned-document'` probe that reads the store"* (the false-park direction).
   **The OTHER direction — a registry key no declaration entry names — is the pin's own `A-5.vi` plant, and `§5.4`'s
   claim that it "stays green under the rule" is REFUTED BY READ: `A-5.vi` REQUIRES the offence *"registry probe key(s) no
   declaration entry names: …"*.** **THE ARM THEREFORE PLANTS `'uf-no-such-declared-fixture'` (the pin's own key literal)
   INTO THE REGISTRY AND REQUIRES THAT OFFENCE TEXT**; a green there is a tooth that cannot bite.

### 11.3 Class (b) — the live readings the landing owes

**TEN NAMED READINGS, each with its invocation shape; each recorded verbatim with its invocation, its isolated ports and
its boot-and-connect confirmation.**

1. **`class-(b):core`** — `--fixture=core` (isolated ports): **the artifact names `core` and its materialisation root**;
   **the `'corpus-documents'` and `'corpus-query-results'` and `'corpus-document-tabs'` probes all read PRESENT**; **no
   gated key parks**; and the set's rows carry their own verdicts. **This is `FA-4`.** **⟨GATE-2 THIRD LOOP `2026-10-05` —
   *"ALL READ PRESENT"* STANDS, AND WHAT EACH OF THE TWO RENDERED-FIXTURE PROBES READS IS NOW NAMED, SO THIS ROW CANNOT BE
   SATISFIED BY THE WRONG LIMB (`§18.2`, `§18.6` clause 3): `'corpus-query-results'` reads PRESENT **because its store query
   for the probe's term returns at least one hit** (`core` carries the term-bearing document, `§2.2` P-δ), and
   `'corpus-document-tabs'` reads PRESENT **because `>= 1` document-tab row is rendered in the strip at the pre-gesture
   read point** (`§18.1`). **The row's own `--fixture=core` acceptance predicate is `§18.6` clause 3.**⟩**
2. **`class-(b):table`** — `--fixture=table`: **`u_edit_1_live_package_table_limitation` reaches a document with a stored
   `<table>`** and **stops parking with *"cannot be met in this corpus"*** — **its verdict is its own** (`PASS` or `FAIL`
   are both admissible; **what is not admissible is the park, or a pass claimed with no `<table>` found**: the row's own
   evidence must name the document it found). **⟨GATE-2 `2026-10-05` — *"it stops parking with 'cannot be met in this
   corpus'"* IS AMBIGUOUS AS FILED AND IS RULED (`§16.11`): THE BLOCK'S OWN PARK TEXT IS *ALSO* *"cannot be met in this
   corpus"*, so the WORDS cannot be the discriminator.** **`class-(b):table` MUST ACCEPT a verdict of `PASS` or `FAIL`
   carrying evidence that NAMES the found document and its rendered table census, and MUST REJECT a `PARK` — i.e. what is
   asserted is *no park*, whatever sentence a park would have printed.** **The discriminator between *"stopped parking"*
   and *"parked for another reason"* is the ARTIFACT'S OWN ROUTE ATTRIBUTION: a park by fixture-absence is tagged
   `parkedByFixtureAbsence` and names the declared fixture in its `parkReason`; this row's block is `'corpus-documents'`-
   gated, so at a NON-EMPTY store it is NOT routed by the gate, and a park it prints is its own — a distinct, named
   attribution.** **THE READING IS THEREFORE *"the row is not parked, and its evidence names the table document"*, graded
   on the (verdict, evidence) pair, never on a phrase.⟩**
3. **`class-(b):search`** — `--fixture=search`: **`FA-1`** — **`uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` PARK by
   name, each `parkReason` naming `corpus-query-results`**, and **every `'corpus-documents'` gated key carries its own
   verdict**. **The park SET is the reading, not the park count.** **⟨GATE-2 `2026-10-05` — THE PARK'S **ROUTE TAG** IS
   PART OF THE READING (`§16.5`): those three parks are tagged fixture-absence (`parkedByFixtureAbsence`), because the
   store is NON-EMPTY here and the fixture gate's own branch cannot fire.⟩** **⟨GATE-5 RULING `2026-10-05` — THIS READING'S PROBE LIMB IS `OWED` AND IS THE ARCHITECT'S OUTCOME: measured at this head `rag.query` reads `0 hit(s)` under EVERY set (including `core` and `tabs`), so `FA-1` cannot yet discriminate and this item can be neither green nor red until it does — the ruling is *"adapt the mock data to function with the query"*, i.e. **THE SETS' CONTENT MUST BE ADAPTED so the probe's own constant term reaches the store's lexical index and the query answers** (`§22.2` item 1, `§18.6` clauses 1(iv)/3).** **`§11.3` ITEM 1's FILED PRESENT READING IS **UNCHANGED** AND IS NOT AMENDED; this item's park SET and its route tag are UNCHANGED too (`{uf_panes_14, uf_tabs_7, uf_tabs_7_diag}`, tagged fixture-absence).**⟩**
4. **`class-(b):tabs`** — `--fixture=tabs`: **`FA-2`** — **`user9_search_open_in_tab` PARKS by name, its `parkReason`
   naming `corpus-document-tabs`**, and **the `'corpus-documents'` AND `'corpus-query-results'` keys carry their own
   verdicts**. **Neither this nor reading 3 may be reported as an app `FAIL`.** **⟨GATE-2 `2026-10-05` — SAME ROUTE-TAG
   LIMB AS READING 3. AND THE `'corpus-query-results'` HALF IS A REAL READING IN THIS RUN: `tabs` carries the
   term-bearing document, so its painted row exists and those keys RUN.⟩** **⟨GATE-2 THIRD LOOP `2026-10-05` — THE FIRST
   LOOP'S LAST CLAUSE IS `SUPERSEDED` AND IS KEPT VISIBLE ABOVE, BECAUSE *"its painted row exists"* IS FALSE AT THE POINT
   THE PROBE READS AND WAS THE BLOCKING CONTRADICTION: at the pre-gesture read point NO result row is painted in ANY run
   (`§18.1` clause 3), so a reading that required a painted row would park these keys under `tabs` too — the opposite of
   what this item asserts, and the reading `§5.2` clause 3 and `FA-2` required (`§18.2` clause 4). THE READING OF RECORD
   FOR THIS ITEM: **`user9_search_open_in_tab` PARKS by name, its `parkReason` naming `corpus-document-tabs`, tagged
   `parkedByFixtureAbsence`; the `'corpus-documents'` keys AND `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` (the three
   `'corpus-query-results'` keys) RUN AND CARRY THEIR OWN VERDICTS; NOT ONE of the `35` gated keys parks by
   fixture-absence except `user9_search_open_in_tab`** (`§18.6` clause 2). **THE REASON THE THREE RUN IS THE PROBE'S OWN
   READING — `tabs` carries `search.md`, the probe's term-bearing document, so the probe's STORE QUERY returns at least
   one hit (`present:true`, `resolved:true`) — AND NOT A PAINTED ROW, WHICH `tabs` DOES NOT HAVE.**⟩** **⟨GATE-5 RULING `2026-10-05` — THIS ITEM'S `corpus-document-tabs` LIMB IS **SKIPPED-BY-RULING** AND THE SKIP IS **NOT A PASS** (`§22.3`): `user9_search_open_in_tab`'s park, its `parkReason` naming `corpus-document-tabs`, its `parkedByFixtureAbsence` tag and the cross-run divergence of that probe ARE ALL SKIPPED — the tab strip is a fork UI implementation being rebuilt on the foundation tooling (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`), and `dom:#tab-strip .tab[data-document-id]` can never match at this head. **THE `F-2`-CLOSURE CLAIM MAY NOT BE REPORTED AS DISCHARGED FOR THIS LIMB** (`§5.5`'s own rule, unchanged).** **THIS ITEM'S **OTHER** LIMB IS NOT SKIPPED AND IS `OWED`: the three `'corpus-query-results'` keys RUN `IFF` the probe's STORE QUERY reads `present:true` (hits `>= 1`) — which is the data-form outcome the architect's ruling compels (`§22.2` item 1).** **`§11.3` ITEM 1's FILED READINGS STAND UNCHANGED.**⟩**
5. **`class-(b):empty`** — `--fixture=empty`: **every gated key's own fixture reads absent, every gated key parks by
   name, and NOT ONE reports `FAIL`** — **the fixture-absent acceptance run under a NAMED fixture state.** **The route
   split (`ROW`-line parks vs `DIAG`-line no-id absences) is quoted from the artifact** (UNIT A's figures for it must be
   re-read at the landed head, never carried). **⟨GATE-2 `2026-10-05` — "EVERY GATED KEY" IS **`35`** AFTER THE `§16.1`
   AMENDMENT (`§16.17`), AND `u_edit_1_live_package_table_limitation` IS ONE OF THEM: its park under `empty` is a
   **`ROW`-line** park (the entry carries `rows:['U-EDIT-1-LIVE-6']`), so the route split's `ROW` side gains that key and
   UNIT A's carried split (`21 ROW + 13 DIAG`, `§16.7` of UNIT A) must be RE-READ, never carried. **AND THIS RUN
   MATERIALISES NO SET — `empty` HAS NO FILES — while the three `selfProvisioning:true` keys still write their own
   documents through the `§16.7` resolver; the reading is *"no SET was materialised"*, not *"nothing was written"*
   (`§16.7`).⟩**
6. **`class-(b):route-only-none-state`** — an obsolete-route-only run (`--strict-seed`-shaped, no `--fixture`): **the
   fixture state reads `none` / `none` / `none` even though the store is non-empty** — `§6.2` `B-1`'s guard.
7. **`class-(b):default-unmoved`** — a **no-`--fixture`** run: **the launch profile is unmoved by the arg's arrival**
   (same groups, same ports, same shape) **and the state reads `none`** (`FA-5`).
8. **`class-(b):two-supply-refusal`** — `--fixture=core --strict-seed`: **one `ARG-REFUSED` line naming both, exit `2`,
   nothing spawned, no set materialised, no scratch HOME minted** (`§6.4`). **⟨GATE-5 AMENDMENT `2026-10-05` — *"NAMING BOTH"* NOW HAS A GRADED READING (`§6.4`'s gate-5 block, greens `B-1`): the line must name the SET and **THE ONE SUPPLY FLAG THE CALLER SUPPLIED, BY ITS OWN NAME** (`--seed=` · `--corpus-root=` · `--strict-seed` · `--o0-corpus=`) — a FAMILY LIST satisfies neither limb. THE LANDED LINE'S FAMILY LIST IS AN `OWED` IMPLEMENTER FINDING (`§21.5` clause 1 item 1), and the flag NAMED per reading must be the one the reading passed. THIS READING'S OTHER LIMBS (exit `2`, nothing spawned, `no SET was materialised`, no scratch HOME) ARE UNMOVED.⟩** **⟨GATE-2 `2026-10-05` — THE READING'S
   SUBJECT IS THE **FOUR SUPPLY FLAGS**; `--fixture=core` ALONE must NOT be refused (it implies `--no-seed`,
   `§16.13`), and `--no-seed` is refused on no path. A run that refuses the bare `--fixture=core` turns this reading RED
   by making every other reading impossible. `no set materialised` is read as *"no SET was materialised"* (`§16.7`).⟩**
   **⟨GATE-2 SECOND LOOP `2026-10-05` — THE STRING IS NOW SETTLED AND IS THE ONE AN ARM GRADES (`§17.11`): the reading
   is **`no SET was materialised`** — exactly as this item's own filed sentence reads it at the end — and the words
   **`nothing written` / `nothing was written` are STRUCK as a name for it** (`"nothing written"` describes a REFUSED
   run, `§3.3` clause 4, and NOT an `S-4`/`empty` run, whose blocks still write their own documents through the `§16.7`
   resolver). **THE CITATION `S-4` OF `§16.7` CLAUSE 3 IS THE CORRECTED ONE** (`§17.8`).⟩**
9. **`class-(b):honesty`** — **every reading above states its fixture**, and **no reading in any artifact of this unit is
   quotable as a live-corpus app reading** (`§9` clause 3).
10. **`class-(b):trio-scope`** — the trio is run, **and its result is recorded as proving nothing about the driver**
    (`§9` clause 6): `scripts/live-drive.mjs` is in no trio leg.

**A RUN THAT IS TRUNCATED OR INTERRUPTED PROVES NOTHING AND MUST NEVER BE REPORTED AS A RESULT.** **`RCA-11` clause (a)
BINDS: this unit is NOT pre-DONE while its class-(b) battery is unrun — and if a run cannot be made, the DONE row carries
the reading attached, never a silent park.**

### 11.4 The gates (`AGENTS.md` items 8/9/10; `RCA-1`…`RCA-6`, `RCA-11`, `RCA-12`)

| Gate | What it owes this unit |
| --- | --- |
| **Gate 1 — the proposal gate** | this filing is the re-shaping of the fixture work's UNIT B half; **architecture + change-analysis steps run against it**. |
| **Gate 2 — spec review** | the loop UNIT A ran six times; **the same discipline: one reading of record per contradiction, every dependant figure re-derived, every count derived or `REPORTED`.** |
| **Gate 4 — adversarial** | **`RCA-3` is mandatory per completed unit**: a read-only adversarial pass over the arg's grammar, the refusals, the sets, the probes and the re-pin, **with its findings recorded in this file (a `§`-appended register) and each host finding fixed here + regression-tested.** |
| **Gate 5 — TestWriter** | authors `§11.2`'s arms **RED FIRST**, RUNS them, and **REPORTS the red tally** before any implementation (`RCA-1`). **Never "implement and add tests."** |
| **Gate 6 — Implementer** | the least driver change that makes the red set green **without touching `§1.3`'s denials**; re-runs the trio. |
| **Gate 7 — proofreader** | doc-vs-code reconciliation of the sets' names and shapes, the arg's grammar and refusal text, the three probes' `read` values, the re-pin set, the state's members and every count in `§10.2` — **with every superseded value kept visible**. |
| **Gate 8 — item-10d documentation review** | **AFTER the greens**: reconcile this file + the landing's DONE row + the active trackers; record to `archive/reviews/<date>-U-MOCK-CORPUS-FIXTURE-SETS-doc-review.md`. |
| **The trio** | `npm test` · `npm run typecheck` · `npm run build`. **`scripts/live-drive.mjs` is not a build input and not a `src/` module** — a green trio proves **nothing about the driver** (`§9` clause 6). |
| **Blind greens (item 10a)** | a **blind-test writer produces the green-scenario artifact from THIS SPEC + the `-greens` set ONLY** (no implementation read) and runs the scenarios against the live driver. **A failure is doc/spec drift OR an un-hardened regression — never a pass.** |
| **`RCA-12`** | every claim in the DONE row states **which layer** it covers: **`[D]` HARNESS / source-derivation — NEVER app.** |
| **The trackers** | `docs/next-steps.md` (a DONE row carrying the red tally, the class-(b) readings, the register's `held`/`broken` and the owed `sha256`) · `docs/defects.md` (`LIVE-FIXTURE-PRECONDITION-GAPS`' disposition) · `docs/pending.md` (the `F-2` item's closure and this unit's own owed items) · `docs/decisions.md` (**no new row required** — this unit APPLIES three existing rows; a new row is the architect's). |

### 11.5 The one pin change this unit forces, and its discipline

**UNIT A's pin asserts the `UF_FIXTURE_STATE` LITERAL ITSELF** (`VERIFIED-BY-READ`: the arm derives the expected
expression from the as-filed text `const UF_FIXTURE_STATE = { state: 'no fixture data set selected', kind: 'none', id:
'none' }`, counts its occurrences, asserts the member set, and asserts the `none` values — with named mutations that
delete a member, change a value, delete the constant and plant a legacy alias). **THE ARG MAKES THAT LITERAL A DERIVED
VALUE, SO THOSE ASSERTIONS ARE RE-STATED — `⟨RE-STATED …⟩`, the superseded expression kept visible, the teeth kept, and
NEVER a relaxation** (UNIT A's own re-statement discipline, which its `§1.2` fixes for this file):

1. **THE SUPERSEDED EXPRESSION STAYS VISIBLE** in the arm's own text, **with the new one beside it**.
2. **EVERY EXISTING TOOTH IS KEPT**: the one-declaration count, the member set, the `none`-form values **for the
   no-`--fixture` case**, the site anchoring, the O-0-scope negative limb, the legacy-alias negative limb, the mutation
   set (delete a member; change a value; delete the constant; delete a site's member).
3. **THE `none`-FORM TOOTH MOVES TO ITS NEW SUBJECT**: the `none` values are asserted **of a run with no `--fixture=`** —
   i.e. the arm asserts the **assignment's** `none` branch rather than a literal, and it must still fail if the `none`
   default is replaced by a mock set (the additive/neutral default, `§3.1` clause 3). **⟨GATE-2 `2026-10-05` — THE
   TOOTH'S SUBJECT IS **THE OBJECT'S OWN MEMBERS `state` / `kind` / `id`**, with the values `'no fixture data set
   selected'` / `'none'` / `'none'` (`§16.12`); `fixtureState` / `fixtureKind` / `fixtureId` are the PRINTED line's
   labels and are asserted by the `print-site` arms only. The re-stated arm must keep UNIT A's member-set tooth
   `{state, kind, id}` **exactly three**, which is the same three-member ruling as `§16.4`'s (the root is printed text,
   not a member). AND THE TOOTH IS ASSERTED **AT A RUN WITH NO `--fixture=`** — the `none` branch of the assignment —
   never against the constant's literal alone, because the constant is no longer the whole subject.⟩**
4. **A NEW TOOTH IS OWED FOR THE NEW MEMBER**: the state's **derivation from the arg** (`§11.2` `state-derivation`) —
   **without it, the re-statement would be weaker than the assertion it replaces.**

---

## 12. WHAT THIS UNIT DOES NOT DO

| # | Denial | Why (the ruling or clause that forbids it) |
| --- | --- | --- |
| **1** | **NO APP REPAIR OF ANY KIND.** | `§1.3` (no `src/**`); every app-layer row keeps its owner in `docs/defects.md`. **This unit supplies a fixture; it fixes nothing the fixture reveals.** |
| **2** | **NO ENGINE WORK** — no engine, no engine fixture, no `gnosis.*` change, no engine probe. | `§8.2`; `DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL` clauses (1)–(4). |
| **3** | **NO UI WORK, AND NO WIDENING OF THE EXEMPT/ARCHIVED CLASS.** | `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` clause (1): the exempt class is defined by the SUBJECT of a test and its execution is an **archive-or-declared-exemption** act, **never an in-place relaxation**; this unit touches **no** fork-specific UI implementation and archives **no** file. |
| **4** | **NO MANIFEST/PIN CHANGE IN THE FOUNDATION SENSE.** | The `vendor/foundation.lock.json` manifest, its `foundation.commit`, its `measuredAt` and the three `PINNED_COMMIT` constants are **not this unit's surface** (`§1.3`). **The word "pin" in this file means `tests/live-drive-contract.test.ts` only.** |
| **5** | **NO RE-OPENING OF UNIT A'S CONTRACT.** | `§1.3`: this unit **applies** UNIT A's closed `fixtureName` set, gate predicate, print sites and `§6.4` test. **It re-states the pin where the arg moves a literal (`§11.5`) and relaxes nothing.** |
| **6** | **NO `MATRIX_ROWS` ROW-SET CHANGE, NO NEW `BLOCKS` KEY, NO NEW `§5.U` SLOT.** | `§1.3`; `MATRIX_ROWS` is full at `8` and the key census is frozen at `100`. **The re-pin (`§2.4`) changes identities, never row ids or assertions.** |
| **7** | **NO CLAIM THAT ANY ROW PASSES, OR THAT THE APP WORKS.** | `§9` clause 6; `§10.3`; `RCA-12`. |
| **8** | **NO NEW MCP TOOL, ARGUMENT OR REPLY SHAPE.** | `§1.3`; `docs/specs/mcp-endpoint.md` is host-side by contract and is not this unit's write. |
| **9** | **NO PAGE-DESIGN / SKILLS / COVERAGE-MATRIX EDIT.** | `§1.5`; the obligation does not attach to an instrument unit. |
| **10** | **NO RESOLUTION OF THE O-0 MECHANISM'S STATUS.** | `§6.5`: it is a **different object** and its status is a **separate open question**. |
| **11** | **NO TOUCHING OF `../Provident-Electron/**`.** | `§1.3`; the adjacent foundation tree is read-only for this unit and no foundation ask is raised by it. |
| **12** | **NO `--block=`-SPACE-ONLY CLAIM.** | Every arm in `§11.2` is a **source derivation** and holds for `--block=all` and every scoped invocation alike; **the sets' materialisation and the state are launch-scoped, not block-scoped**, and **the probes read their own constant, never the run's block selection** (`§5.3` clause 3). |

---

## 13. CROSS-REFERENCES, AND WHAT THIS FILING COULD NOT SETTLE

### 13.1 The ruling sources (cited as required)

| Source | What is taken from it |
| --- | --- |
| **`docs/decisions.md`** — **`DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG`** | the fixture's FORM (hand-authored mock data sets + a selecting arg) · the run-must-declare-it requirement · the OBSOLETE-set ruling and its O-0 scope carve-out · the split that makes this filing UNIT B |
| **`docs/decisions.md`** — **`DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL`** | the engine's readiness · the shell-integration sequencing · the engine-owned corpus as the long-term fixture (hence the mock is interim) · the engine rows' unchanged park reasons |
| **`docs/decisions.md`** — **`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`** | the required test set that NAMES the mock document corpus (hence this unit is a testing prerequisite) · the exempt class's mechanism (never an in-place relaxation) · the `npm test` leg's re-scope |
| **`docs/decisions.md`** — **`DECIDED: GAP-8-INTERIM-MOCK-CORPUS-FROM-CALLING-ARGS`** | the honesty clause (input never oracle; no proxy PASS; real user-visible end states; the artifact says what the fixture was; a mocked reading is never a corpus reading) |
| **`docs/specs/unit-live-fixture-precondition-declaration.md`** (UNIT A) | the declaration's members and its closed `fixtureName` set · the gate predicate · the per-declared-fixture absence test this unit makes real · the park reason and its printed forms · the run-wide state and its four sites · the honesty clause · the `F-2` item this unit closes |
| **`docs/specs/unit-live-driver-verdict-integrity.md`** | `§2.3` `H-1`…`H-4` and `§3.2` `F-6`/`F-7`: a missing fixture is `PRECONDITION-FAILED` naming it, never a silent park; an `isError` reply is printed verbatim |
| **`docs/next-steps.md`** | UNIT A's DONE row (the heads, the red/green tallies, the gate-8 insert) · the amendment insert that names UNIT B a testing prerequisite · the gate-8 insert that files the `F-2` item with UNIT B as owner |
| **`docs/defects.md`** | `LIVE-FIXTURE-PRECONDITION-GAPS` (the two fixture gaps: the absent engine; the 226-document census *claimed 226 · observed 2*) |
| **`docs/pending.md`** | `LIVE-RUN-O0-CORPUS-FIXTURE-NEED`'s revisit condition (the O-0 census half, **not resolved here**) |

### 13.2 The drifts and filing-side corrections, recorded rather than silently repaired

1. **THE AUTHORITIES' OWN `UNIT B` WALL.** The two live-fixure records disagree on how many probes UNIT B owes: UNIT A's
   `§0.2` clause 5 names **"the mock DATA SETS themselves + the selection arg + the obsolete set's disposition"** (*two*
   sets of probes unmentioned), while its own `§G8.3`/`§19.4` **assign the probe divergence to UNIT B** and the
   `docs/next-steps.md` gate-8 insert's owed item names **"the two probes"**. **THIS FILING TAKES THE WIDER READING —
   three gated names, two of which must diverge — and says so at `§5.4`: the narrower reading would leave `F-2` unowned,
   and `F-2`'s owner is named in the authorities as UNIT B.** **The disagreement is recorded here rather than smoothed.**
2. **`§2.4`'s IDENTITY MOVE IS A CONSEQUENCE THIS FILING HAD TO NAME.** Neither authority states that the sets' document
   identities differ from the obsolete seed's. **The consequence is not optional**: the identity is the file's path
   relative to the corpus root, so **any** new materialisation root moves every hardcoded identity in the driver — and
   clause (3) forbids reusing the obsolete root. **The re-pin set is therefore enumerated (`§2.4`) rather than left to the
   landing pass's discovery, and the completeness of that set is an arm (`repin-completeness`) and a filed risk
   (`§13.3` item 1).**
3. **`§6.2` `B-1`'s STATE READING IS THIS FILING'S CALL, AND ITS COUNTER-READING IS NAMED.** An obsolete-route-only run
   keeps `fixtureKind: 'none'` **even though the store is populated**, because the alternative would name an obsolete
   mechanism as the run's fixture (UNIT A's `X-4`). **A reader may take the other reading** — *"`none` should mean the
   container is empty"* — **and this filing records that it does not, with the ground, so the choice is visible rather
   than implicit.**
4. **`F-2`'s OWN ROW IS NOT FULLY READABLE WITH THE FILE-READ TOOL** (`RECORDED READING`: UNIT A's `§G8.2` toolability
   note records that the row's single line exceeds the tool's per-line ceiling). **This filing takes `F-2`'s content from
   the two places that ARE readable — UNIT A's `§G8.3` discharge paragraph and its `§19.4` UNIT B item — and cites the
   register row for its id and its disposition only.** **What settles the row's full text: a shell-bearing pass.**

### 13.3 What this filing could NOT settle (stated, not hidden)

| # | The unsettled item | What settles it |
| --- | --- | --- |
| **1** | **THE EXACT RE-PIN SET'S COMPLETENESS.** `§2.4`'s table is a `VERIFIED-BY-READ` enumeration of every hardcoded corpus identity **this filing found**; **a site missed by this read is a live false-negative setup read.** | **the `repin-completeness` arms (`§11.2`), whose sweeps are exhaustive by construction, and the class-(b) readings of `§11.3` items 1–5.** |
| **2** | **THE PROBE'S SEARCH TERM AND THE SETS' EXACT CONTENT BYTES.** This filing contracts the term's three properties (`§5.3` clause 1) and the sets' properties (`§2.2`) — **not the literal strings.** | **the landing pass's authoring, read by the `set-shape` and `probe-term-coverage` arms.** |
| **3** | **THE MATERIALISED FORM vs THE COMMITTED-DATA VARIANT** (`§2.3` clause 5). | **the landing pass chooses one; both are inside this contract.** |
| **4** | **`§10.2.2`'s EXACT SEED LITERAL.** | **the landing pass, whose date the literal must carry.** |
| **5** | **UNIT A's TWO LANDED RED ARMS AND ITS `F-2`-CLASS RESIDUALS.** UNIT A's record names three red arms at one head and describes the later state as `113`/`109` passed — **this filing does not re-measure any of it and carries no UNIT A tally.** | **a shell-bearing pass at the head where this unit lands.** |
| **6** | **THE FOUNDATION MANIFEST'S CURRENT REVISION.** Not this unit's surface (`§12` item 4) and **not read by this filing**. | **the pin-refresh unit's own records.** |
| **7** | **⟨ADDED GATE-2 `2026-10-05` — WHAT THE GATE-2 PASS ITSELF COULD NOT SETTLE.⟩** **(a) THE LANDED FORM OF THE SELF-PROVISIONER ROOT RESOLVER** (`§16.7`): this pass contracts the RULE (a block's own write is confined to the run's selected set) and names the three blocks it binds, but **not the helper's name, its argument list or its fallback expression** — the landing pass owns those, and the `self-provisioners` arm grades the RULE (no `.live-fixture/core/` literal), never the helper. **(b) THE EXACT TEXT OF THE `mock-data-set` CONSEQUENCE CLAUSE**: `§7.1`/`§16.15` contract its PARTS (it names the set, it derives from the state, it carries the non-quotability rule) — the sentence is the landing pass's, and `state-consequence:mock-armed` grades the PARTS. **(c) THE PROBE'S OWN SEARCH TERM'S LITERAL** (unchanged from `§13.3` item 2) — and with it the two DOM sentinels' **selector** halves are now PINNED (`§5.2`'s sentinel table) while their **count semantics** stay as contracted (`>= 1` for present). **⟨GATE-2 THIRD LOOP `2026-10-05` — THE FILED PHRASE *"the two DOM sentinels"* IS `SUPERSEDED` AND KEPT VISIBLE: AFTER `§18.2` THERE IS **ONE** `'dom:'` SENTINEL (`'dom:#tab-strip .tab[data-document-id]'`) AND ONE STORE-QUERY SENTINEL (`'rag.query'`), so the *"selector halves"* clause attaches to the single `'dom:'` literal while *"count semantics"* reads as *its* `count >= 1` — the store-query sentinel's semantics are `hits >= 1` (`§5.2` clause 1's gate-2 note). THE REMAINING OWED ITEM IS UNCHANGED: THE TERM'S OWN LITERAL IS THE LANDING PASS'S.**⟩** | **(a) the `repin-completeness:self-provisioners` arm; (b) the `state-consequence:mock-armed` arm plus the `honesty-clause:mock-quote` arm; (c) the landing pass's authoring, read by the `set-shape` and `probe-term-coverage` arms.** |

---

## 14. OWED ITEMS (each with an owner)

| # | Item | Owner | Why it is owed rather than decided here |
| --- | --- | --- | --- |
| **1** | **THIS FILE'S `sha256`.** | **the landing pass (a shell pass takes it)** | **this pass holds NO SHELL** — every figure here is `VERIFIED-BY-READ` (the file-read tool's own census or a site it read) or a `RECORDED READING` with its measurer named. **THE `sha256` IS `OWED` AT THIS SITE (`§14` item 1) AND NOWHERE ELSE IN THIS FILE CLAIMS OTHERWISE.** **⟨GATE-3 AMENDMENT `2026-10-05` — THE DIGEST WAS SUPPLIED TO THIS PASS AND IS A `RECORDED READING` OF THE PRE-AMENDMENT FILE (measurer: the pass that supplied it; this pass holds NO SHELL and took no digest): `sha256` `bc824649f3e87242c1d0a87c4ca5faeb0f0bf456f2a4712cca68ea1dcd5acdb3`, md5 `e859390d40f2c3c52903dad4e4a56e05`, at `2652` lines. THE GATE-3 EDIT MOVES THE FILE, SO THAT DIGEST IS `SUPERSEDED` AS THE FILE'S OWN `sha256`/`md5` AND BOTH ARE `OWED` AGAIN AT THIS SITE — the taking pass re-reads them (`§18.8` item 1's gate-3 marker carries the re-taken line count).⟩** |
| **2** | **THIS FILE'S LINE COUNT** — **`VERIFIED-BY-READ` (reader: this filing, the file-read tool's own line census): `1074` lines at this filing's last read, and `1749` lines after the gate-2 amendment (`§16.17` item 10 names the re-taken census).** **The figure is an OBSERVATION, not a pin**: a later amendment moves it, and a landing pass quoting it must take its own census. **⟨GATE-2 SECOND LOOP `2026-10-05` — BOTH FIGURES ARE SUPERSEDED BY THIS PASS'S RE-TAKEN CENSUS (`§17.13` item 14): **`2225` lines**, `VERIFIED-BY-READ` after this amendment's last edit. **The `1749` of `§16.17` item 10 is kept visible there with its own superseded marker, and the `sha256` STAYS `OWED` (item 1 above).**⟩** **⟨GATE-2 THIRD LOOP `2026-10-05` — `2225` IS ITSELF SUPERSEDED BY `§18.8` item 1's re-taken census (**`2652` lines**, `VERIFIED-BY-READ` after the third loop's last edit; the `2306` this bracket first quoted was the same pass's intermediate reading, before its later sentences were added, and it too is kept visible rather than deleted). **All four figures stay visible; `§18.8` item 1 is the current one, and the `sha256` STILL STAYS `OWED` (item 1 above).**⟩** **⟨GATE-3 AMENDMENT `2026-10-05` — `2652` WAS THE PRE-AMENDMENT READING (it came to this pass as a `RECORDED READING` together with item 1's digest) AND IS `SUPERSEDED` BY THIS PASS'S OWN RE-TAKEN CENSUS, STATED `VERIFIED-BY-READ` IN `§18.8` item 1's gate-3 marker. All five figures stay visible; the `sha256`/`md5` are `OWED` again at item 1.⟩** | — | the figure is a read of the file as filed, never a prediction. |
| **3** | **UNIT B's MINTING AND ITS PLACE IN THE ORDER** (`docs/pending.md`, `docs/next-steps.md`). | **the architect / supervisor** | the id is `PROPOSED` (`above`); the split's own owner record is UNIT A `§12` item 1. |
| **4** | **THE EXCLUDED ENGINE FAMILY'S FIXTURE (`engine-documents`) — A REAL OPEN OBLIGATION, NEVER A FAKED PROBE.** | **whichever pass owns the engine fixture after the sequencing boundary** | `§8.2` item 4; the driver **declares** the family and its fixture name (`UF_EXCLUDED_ENGINE_FAMILY`) and **fakes no probe**; **this unit adds no registry entry for it.** |
| **5** | **THE O-0 MECHANISM'S STATUS.** | **the architect** | `§6.5`: a separate open question; **this unit refuses the flag when a set is selected and resolves nothing else.** |
| **6** | **THE `F-2` ITEM'S CLOSURE IN THE TRACKERS.** | **the supervisor's tracker pass, on the landing's greens** | `§0.2` `F-2`; **the closure row must quote `FA-1`/`FA-2`'s readings, not a claim.** |
| **7** | **`§13.3`'s four landing-side choices** (the re-pin set's confirmation, the content bytes, the materialisation form, the seed literal). | **the landing pass** | each is named at `§13.3` with what settles it. |
| **8** | **THE TWO PIN HAZARDS AND THE RE-STATEMENT TOOTH** (`§10.3` clause 7, `§11.5` clause 4). | **the TestWriter** | the hazards are inherited from UNIT A's own records; **the re-stated arms must be no weaker than the ones they replace.** |
| **9** | **⟨ADDED GATE-2 `2026-10-05` — THE UNIT A DECLARATION AMENDMENT.⟩** One entry's columns move (`u_edit_1_live_package_table_limitation` → `selfProvisioning:false`, `fixtureName:'corpus-documents'`), the gated population moves `34` → `35`, and UNIT A's own contract + pin must carry the amendment **as a UNIT A AMENDMENT** (`§16.1`, `§16.17`). | **the landing pass of this unit, recorded in UNIT A's file by UNIT A's owning pass** | this filing **applies** UNIT A's contract and may not re-open it silently (`§1.3`); the change is stated as a UNIT A amendment so the two documents cannot drift. |
| **10** | **⟨ADDED GATE-2 `2026-10-05` — THE `--no-seed` IMPLICATION AND THE SELF-PROVISIONER RESOLVER, AS LANDED.⟩** `--fixture=<set>` implies `--no-seed` (printed), and the three `selfProvisioning:true` keys take their write path from the resolver rather than a `.live-fixture/core/` literal (`§16.7`, `§16.13`). | **the landing pass of this unit** | the RULE is contracted here; the helper's name and shape are the landing's (`§13.3` item 7(a)). |
| **11** | **⟨ADDED GATE-2 `2026-10-05` — THE THREE NAMED MUTATIONS THE FILED ARMS LACKED.⟩** `state-consequence:mock-armed`'s own mutation, `honesty-clause:mock-quote`'s non-quotability deletion, and the `A-5.vi` plant that must BITE (`§11.2`'s gate-2 block, `§16.14`–`§16.16`). | **the TestWriter** | an arm without a named mutation is a tooth that cannot bite (`§10.3` clause 4); these three are named here rather than left to the red-set author. |
| **12** | **⟨ADDED GATE-2 SECOND LOOP `2026-10-05` — THE CROSS-UNIT LANDING IS ATOMIC.⟩** The declaration column-move, UNIT A's pin re-statement and this unit's arms land **IN ONE PASS**; landing either half alone is a **`CONTRADICTION`** that reds nothing (UNIT A's `§6.2` *"GATED = `34`"* cell and its `§8.3` item 1's `P/34` / `34 − P` reading stay live, and no pin assertion carries a population figure); **and the asserted population is `35 = 47 − 3 − 9`**, named `'corpus-documents'` `25` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1` (`§17.1`). **⟨GATE-4 AMENDMENT `2026-10-05`: the third name's figure is reconciled — `'corpus-documents'` `31` (`31 + 3 + 1 = 35`), NOT the filed `25` kept visible here; the `RECORDED READING` is the measured declaration census (measurer: the supervisor's shell, this pass's evidence) and the authority is `§16.17` item 2's enumeration, which reads `31` (`VERIFIED-BY-READ`). The `35`, the `3`, the `1` and this row's atomicity rule are UNMOVED (`§20`).⟩** | **the landing pass of this unit** (the atomicity is a LANDING ORDER, not an arm; **its records state that both files moved in the same pass**) | the contradiction is graded by **READ** at the landing's own records, because no arm of either unit catches a two-document disagreement in which both texts are internally consistent (`§17.1` clause 2). |

---

## 15. GLOSSARY OF THIS FILE'S OWN NAMES (so a fresh reader needs no other file)

| Name | Meaning |
| --- | --- |
| **the sets** | the **five** `--fixture=` values and their hand-authored content: **`core`** · **`table`** · **`search`** · **`tabs`** · **`empty`** (`§2.1`). |
| **the selection arg** | **`--fixture=<setName>`** — launch-scoped, never persisted, argv-only, **neutral when omitted** (`§3`). |
| **the materialisation root** | **`.live-fixture/<setName>/`** — the gitignored directory the chosen set's files are written to at launch; **the source of every document id the sets carry** (`§2.3`, `§2.4`). |
| **the probes** | the registry entries `UF_DECLARED_FIXTURE_PROBES[<fixtureName>]` and the read each names; **three carry a non-null read, two carry `null`** (`§5.2`). **⟨GATE-2 THIRD LOOP `2026-10-05` — THE THREE NON-NULL READS ARE OF **TWO FORMS**: two MCP tool reads (`'rag.list_documents'`, `'rag.query'`) and one `'dom:'` row-count read (`'dom:#tab-strip .tab[data-document-id]'`) — see `§18.2`; the `'dom:#pane-search li[data-document-id]'` sentinel this cell's earlier text implied is `SUPERSEDED`.⟩** |
| **the `F-2` falsifier** | **a probe that cannot read ABSENT while the store is NON-EMPTY does not discharge `F-2`**; exhibited by `FA-1` (`search`) and `FA-2` (`tabs`) (`§5.5`). |
| **the re-pin set** | the enumerated hardcoded corpus identities that move to the sets' identities (`§2.4`), and the discipline that every one of them moves **as an identity only**. |
| **the state** | UNIT A's `UF_FIXTURE_STATE` — the members **`state` / `kind` / `id`** (the printed line labels them `fixtureState=` / `fixtureKind=` / `fixtureId=`), printed at four sites; **this unit supplies the value and the set's identity**, and **the materialisation root is printed text beside the state, NOT a fourth member** (`§7.1`'s gate-2 ruling, `§16.4`). |
| **the disposition** | what happens to the obsolete routes O-1…O-6: **annotate, never extend**; **refuse a run that carries two supplies**; **repoint every citation** (`§6`). |
| **the third register** | this unit's four property rows, on **their own seed** and their own `§4 <P-ROW>` titles, because the two landed registers already consume the `≤ 8`-row cap with one row of headroom (`§10.2.1`). |
| **`SPEC-CALL`** | a contract decision **this filing** made where the authorities are silent — the set names, the root and identity scheme, the arg's name and neutral default, the probes' reads, and the two-supply refusal — **each recorded with its ground at its site.** |
| **⟨ADDED GATE-2 SECOND LOOP `2026-10-05`⟩ the atomicity clause** | **the landing ORDER of `§16.1`'s move: the declaration column-move, UNIT A's pin re-statement and this unit's arms land IN ONE PASS**, and **landing either half alone is a `CONTRADICTION` that reds nothing** (`§17.1`). |
| **⟨ADDED⟩ the asserted population** | **`35 = 47 − 3 − 9`** — the gated keys **the arms assert**, named `'corpus-documents'` `31` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1` (`§17.1` clause 3, `§16.17` item 2's key list). **⟨GATE-4 AMENDMENT `2026-10-05`: the first figure is reconciled to `31`, NOT the filed `25` (kept visible here) — `31 + 3 + 1 = 35`, closing exactly. `RECORDED READING` (measurer: the supervisor's shell, this pass's evidence) and `VERIFIED-BY-READ` against `§16.17` item 2's enumeration, WHICH IS THE AUTHORITY; the `35`, the `3` and the `1` are UNMOVED (`§20`).⟩** |
| **⟨ADDED⟩ the observation's member and its printed field** | the member **`parkedByFixtureAbsence`** and the printed label **`parked-by-fixture-absence=`**, in the chain `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked`; **`parkedByAbsence` is a `SUPERSEDED` typo** (`§17.4`). |
| **⟨ADDED⟩ `N-10-GRAMMAR`** | the id of the grammar note that `§16.10`/`§10.2.3` record: the universal is **`declaredLastTermOf === declaredClassB`**, and the `(… + 0×class-(b))` spelling binds **only the three zero-budget rows** (`§17.10`). |

---

## 16. THE GATE-2 SPEC-REVIEW AMENDMENT (`2026-10-05`) — EIGHT BLOCKING + EIGHT NON-BLOCKING FINDINGS, EVERY ONE CLOSED ANNOTATE-BESIDE

**THE VERDICT THIS SECTION ANSWERS: `SPEC-NEEDS-AMENDMENT`.** **⟨GATE-2 SECOND LOOP `2026-10-05` — THE REVIEW RUN
AFTER THIS AMENDMENT CONFIRMED `15` OF THE `16` CLOSURES BELOW BY READ AND LEFT ONE BLOCKING PLUS TWELVE NON-BLOCKING
REMAINDERS; **ALL THIRTEEN ARE CLOSED IN `§17`, WHICH IS THE CURRENT REGISTER OF RECORD** (`§16` stays visible as the
first loop's register). **AND THE SECOND RUN RE-VERIFIED CLEAN EVERY ITEM LISTED AT THE END OF THIS PARAGRAPH: the
register arithmetic, the `F-2` falsifier, the engine-ruling compliance, the Unit-A consistency and the no-dossier
verdict** — `§17`'s head restates that list with `§17.1`'s atomicity clause added to it.⟩** **THE PASS THAT CLOSED IT IS A DOC-LAYER PASS: it holds
read/search + doc-writes, RAN NOTHING (no suite, no leg, no battery, no `md5sum`/`sha256sum`, no `wc -l`), and touched no
`scripts/**`, `tests/**` or `src/**` byte.** **NOTHING IN THIS SECTION IS A NEW `SPEC-CALL` UNLESS IT SAYS SO** — it rules
between readings the filed text already contained, names the reading of record, marks the loser **superseded**, and
re-derives every figure that hung on the loser. **The filed sentences are KEPT VISIBLE at their own sites, each with its
`⟨GATE-2 `2026-10-05` …⟩` annotation pointing here.**

**THE ADOPTION-DOSSIER VERDICT, STATED EXPLICITLY BECAUSE IT TOUCHES EVERY FINDING BELOW: NO ADOPTION DOSSIER IS OWED FOR
THIS UNIT.** **This unit ADOPTS NO EXTERNALLY-SOURCED IDENTIFIER.** It adds no `PD-UI-` slot, no foundation module, no
vendored byte and no `vendor/foundation.lock.json` consumer; the identifiers it names — the five set names, the
`fixtureName` values, the block keys, the row ids and the three sentinels — are **this unit's own instrument-level names
or UNIT A's already-adopted ones**, and **the third register's `strat:` ids are minted here, not imported**. **A landing
pass that writes an adoption dossier for this unit is doing unauthorised work; a landing pass that writes none is
compliant** (the same discipline `§1.5` fixes for the design skill).

**AND THE ITEMS THE REVIEW VERIFIED **CLEAN**, LISTED SO THIS SECTION IS NOT RE-READ AS A REWRITE: `§10.2`'s register
arithmetic (`17 + 12 + 11 + 27 = 67` · executed `57` · `≤ 100` per row · `≤ 400` total · `≤ 8` rows · seed `0x20261005`);
the `F-2` falsifier as filed (`§5.5`'s `p < pre` predicate, a genuinely falsifiable condition); the engine-ruling
compliance (`§8`, and the standing ruling that **the ENGINE STATUS IS IRRELEVANT BEHIND THE MOCKS until the UI overhaul is
done and the engine integration starts** — nothing here is gated on engine availability); Unit-A consistency (`§1.3`); and
the adoption-dossier verdict above. **THIS AMENDMENT MOVES NONE OF THEM.**

### 16.1 BLOCKING 1 — `§2.1` `F-2` / `§2.2` P-β'S `table`-SET CLAIM WAS **INERT**: THE DISPOSITION IS A **UNIT A DECLARATION AMENDMENT**

**THE FINDING, CONFIRMED BY READ: the driver's declaration carries `u_edit_1_live_package_table_limitation` as
`selfProvisioning:true, fixtureName:'self-provisioned-document'`, so the key is NEVER GATED AND NEVER FED BY ANY CORPUS —
and `§2.1` `F-2`'s whole claim (`table` makes that row drivable) is therefore a claim about a block no set ever supplies.
`§2.2`'s P-β inherits the inertness. The `§16.1` reading does not touch the `F-2` FALSIFIER (a different `F-2` — `§0.2`'s
per-declared-fixture conjunct, `§5.5`), which stays clean.**

**THE RULING: THE CLAIM IS MADE REAL BY THE UNIT A DECLARATION AMENDMENT — NOT BY DEMOTING THE MOCK.** **The entry moves
to `corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents'`.** **Ground: the block's own `surface`
prose already reads *"a TABLE-bearing corpus document searched in the store list"* (`§16.17` item 3), and it reaches that
document through the corpus (`ufOpenDocumentById` + `rag.list_documents` + the `#page-edit-surface table` census) — so the
corpus IS what the block reads, and its `selfProvisioning:true` column was the wrong member for the behavior it has. The
alternative (*"make the mock the block's own subject"*) would have made the SET the thing under test, which `§9` clause 1
forbids: a fixture is an INPUT, never an oracle.**

**ITS CONSEQUENCES, EACH RE-DERIVED (`§16.17` carries the full table):** the gated population moves **`34` → `35`**; the
`'corpus-documents'` group moves **`24` → `25`** (`SUPERSEDED`; the reconciled movement is **`30` → `31`** — **⟨GATE-4
AMENDMENT `2026-10-05`: the BASE was `30`, not `24`, and the landing value is `31`, not `25`; the `+1` shape is the SAME
FIGURE this clause always stated, at a different base (`RECORDED READING`, measurer: the supervisor's shell, this pass's
evidence), and the enumeration was the authority over the stale pair (`§20`). The population `34` → `35` in the same
clause is UNMOVED.⟩**); UNIT A's `selfProvisioning:true` group moves **`10` → `9`**; the
declaration's route split must be **RE-READ, never carried** (this entry carries `rows:['U-EDIT-1-LIVE-6']`, so its park
prints on a **`ROW`** line); **and it is a UNIT A amendment, so UNIT A's contract and pin carry it as one.** **THE HEADLINE
CLAIM'S CONSEQUENCE, STATED SO IT IS NOT OVERSTATED IN EITHER DIRECTION: `table` is the only set that carries a stored
`<table>` document, so `table` is the only set under which this block can stop parking — but the block RUNS under every
non-empty store, so `table` is not its precondition, it is its FIXTURE.** **`--fixture=core`/`search`/`tabs` therefore
leave the row PARKED FOR ITS OWN REASON (no `<table>`-bearing surface reachable), which is a `parkRow`-class park and NOT
a fixture-absence park** (`§16.11`).

### 16.2 BLOCKING 2 — `§2.4` `R-13`'S RE-PIN WAS UNSATISFIABLE: THE CANDIDATE LIST GAINS AN ORDERING CLAUSE

**THE FINDING, CONFIRMED BY READ: the landed scan's candidates are `['.live-corpus/alpha', 'defects']` followed by
`list.slice(0, 12)` of `rag.list_documents`, so `.live-fixture/table/table` is a candidate ONLY IF the store returns it
inside the first twelve — a slice position is not a contract, and `R-13`'s *"FIRST"* was unfalsifiable.**

**THE RULING: THE CANDIDATE LIST BECOMES ONE LITERAL EXPRESSION WHOSE HEAD IS THE TABLE DOCUMENT'S OWN IDENTITY, AND
`R-13` IS RE-STATED AS AN INDEX/ORDERING CLAUSE OVER THAT LITERAL.**

1. **THE ORDER IS: (i) the set's own stored-`<table>` document identity — `.live-fixture/table/table` — FIRST; (ii) the
   pre-arg second candidate `defects` SECOND; (iii) the `list.slice(0, 12)` fallback THIRD.** A hit at (ii) or (iii) is
   admissible (the row's own fallback) but the reading of `class-(b):table` must then SAY which candidate hit.
2. **THE HEAD IS WRITTEN AS A LITERAL, NOT COMPUTED FROM THE STORE LIST** — that is what makes *"first"* checkable by the
   `repin-completeness:table-candidate` arm (a source read).
3. **THE NEUTRAL DEFAULT IS UNMOVED**: with no `--fixture=` selected (`id === 'none'`) the head keeps its pre-arg value
   (`.live-corpus/alpha`), so `FA-5`/`class-(b):default-unmoved` and every pre-arg reading are untouched.
4. **THE `defects` CANDIDATE STAYS EXACTLY AS LANDED** — it is the row's own fallback and is not this unit's to remove.

### 16.3 BLOCKING 3 — `§5.2` CONTRACTED THE PROBES AS DOM COUNTS BUT NEVER THE REGISTRY'S `read` FORM: THE SENTINELS AND THE DISCRIMINATED DISPATCH

**THE FINDING, CONFIRMED BY READ: the pin asserts `read` is a string-or-`null`, and `ufFixturePreconditionRead` awaits
`h.mcpRead(probe.read)` — with only PROSE in `§5.2` there was nothing for the `probe-read`/`probe-read`-dependent arms to
compare, and a DOM read could not have been dispatched at all.**

**THE RULING — THREE PARTS, ALL WRITTEN INTO `§5.2` ITSELF (this section is the register of the decision, not its home):**

1. **THE THREE SENTINELS, EXACTLY:** `'rag.list_documents'` · `'dom:#pane-search li[data-document-id]'` ·
   `'dom:#tab-strip .tab[data-document-id]'`; the two never-gated names stay `null`. **⟨GATE-2 THIRD LOOP
   `2026-10-05` — THIS RULING IS RE-STATED AND ITS SECOND SENTINEL IS `SUPERSEDED` (`§18.2`): the three literals of
   record are **`'rag.list_documents'` · `'rag.query'` · `'dom:#tab-strip .tab[data-document-id]'`**, and
   `'dom:#pane-search li[data-document-id]'` is kept visible here rather than deleted. **WHAT THIS RULING GOT RIGHT AND IS
   NOT AMENDED: the sentinel STRING FORM, the `'dom:'` PREFIX AS THE DISCRIMINATOR, the string-or-`null` tooth, and the
   two `null`s.** **WHAT IT GOT WRONG, STATED: it treated *"a rendered fixture must have a DOM sentinel"* as a rule, when
   the rule that matters is *"the sentinel must separate `search` from `tabs`"* — and at the pre-gesture read point the
   pane-search DOM count cannot (`§18.2` clause 4).**⟩**
2. **THE DISCRIMINATED DISPATCH:** a `read` beginning with the literal prefix `'dom:'` is a DOM row-count read of the
   selector that follows; any other non-null `read` is an MCP tool name; `null` takes the existing never-gated early
   return. **The prefix IS the discriminator — it is part of the string the pin reads, so no new registry shape is
   introduced and UNIT A's `read`/`settles`/`unsettled` triple STANDS.**
3. **THE DOM LIMB'S FAILURE CLASS:** a throw or a non-numeric count is a NAMED unreadable (`resolved:false`) that parks
   nobody; a COMPLETED count — `0` included — is `resolved:true`, with `present = count >= 1`. **The store-query limb of
   `'corpus-query-results'` runs FIRST and is classified by `driverReadFailure`'s unchanged rule.**

**AND THE ONE DEPENDANT FIGURE THAT MOVES WITH IT: the `3×probe-read` register arms (`§10.2.3`) now compare the three
LITERALS above — see `§16.8`.**

### 16.4 BLOCKING 4 — `§7.1`/`§7.3` `D-3` VS UNIT A'S CLOSED THREE-MEMBER STATE: THE MATERIALISATION ROOT IS **PRINTED TEXT**, NOT A FOURTH MEMBER

**THE FINDING: UNIT A contracts a three-member object (`state`/`kind`/`id`, all strings) and its registry row is
`3×state-member`; `§7.1` then requires the root to "ride the state". The two cannot both hold unless the root rides the
PRINTED STATEMENT rather than the object.**

**THE RULING: THE STATE MEMBERSHIP IS UNCHANGED AT THREE. THE MATERIALISATION ROOT IS A CONTRACTED CLAUSE OF THE RUN'S
PRINTED STATEMENT** (beside the state, at the launch-profile and summary statements), **derived at print time from `id` plus
the mode.** **A FOURTH MEMBER IS THE OTHER ADMISSIBLE READING — AND IT IS A UNIT A AMENDMENT: it would move the pin's
`{state, kind, id}` member-set tooth, its `declared` literal, and this unit's `state-member`/`state-derivation` terms to
`4×`. THIS SPEC DOES NOT TAKE IT.** **So `state-member` stays `3×`, `state-derivation` stays `3×`, the `67`/`57`
arithmetic is untouched, and `D-3` remains an offence — its subject is the PRINTED statement.** **THE `--connect` MODE'S
*"not materialised"* RECORD IS PRINTED TEXT TOO**, for the same reason.

### 16.5 BLOCKING 5 — `§7.2` CLAUSES 2/4 + `§3.3` CLAUSE 2 CONTRADICTED: THE READING OF RECORD AT A REFUSAL SITE, AND THE ROUTE `FA-1`/`FA-2` ACTUALLY PARK THROUGH

**THE FINDING, TWO HALVES, EACH RULED:**

1. **THE CONTRADICTION (THE RULING THIS SECTION'S NUMBER IS MOST OFTEN CITED FOR): the state is assigned AFTER the refusal
   branches, so NO refusal line — including the `--fixture` refusal's own line — can print anything but the `none` triple.**
   **`§7.2` clause 2's *"unless a valid `--fixture=` was parsed before the offence was seen"* is SUPERSEDED and kept
   visible at its site; `§3.3` clause 2's *"states the fixture state on that line"* is read as *states the state the
   assignment has reached*, which is `none`.** **WHAT THE `print-site:early-paths` ARM ASSERTS AT THAT SITE, EXACTLY: the
   `state`/`kind`/`id` triple is `'no fixture data set selected'`/`'none'`/`'none'` on the `--groups=`, port, `--home` and
   `--fixture` refusal lines and on the module-level `main().catch` ERROR line; the OFFENDING VALUE is present in the
   line's own refusal text; the SELECTED SET'S NAME is asserted at no early site.** **The `--fixture=` refusal is `A-1`'s,
   `A-2`'s, `A-3`'s, `A-4`'s or `S-6`'s — all five print `none`.** **⟨GATE-5 AMENDMENT `2026-10-05` — THE `main().catch` LIMB OF THE SENTENCE ABOVE (`and on the module-level `main().catch` ERROR line`) IS `SUPERSEDED` AND THE FIVE REFUSAL LINES OF THIS ITEM'S OWN SUBJECT ARE UNMOVED (every one prints `none`). THE BINDING READING, the discriminator the arm may assert, and the pin limb / live limb split are written at `§21.1`; the measured evidence is greens row `F-8` (fail ledger `F-2`, evidence row `F-10`): a real abort after the assignment printed `fixture={"state":"mock data set core selected","kind":"mock-data-set","id":"core"}` on the `[live-drive] ERROR:` line. `§7.2` clause 4's *"reads the same binding"* is KEPT.⟩**
2. **THE FALSIFIER'S ROUTE (the second half, forced by the same ordering):** with a NON-EMPTY store `pre.present === true`,
   so UNIT A's gate (whose first conjunct is `pre.present !== true`) **cannot fire** — yet `§5.5` `FA-1`/`FA-2` require a
   park by name in exactly that run. **THE RULING: THE RENDERED-FIXTURE BLOCKS PARK FROM THEIR OWN BODY, NAMING THEIR OWN
   DECLARED FIXTURE, WHEN THEIR OWN PROBE READS `present:false` at `resolved:true`; the gate predicate is NOT touched
   (it stays exactly UNIT A's, `§5.2` clause 2).** **The run's fixture observation gains ONE member —
   `parkedByFixtureAbsence`** (the gated keys parked because their own declared fixture read absent, however routed) —
   **and the printed split carries it beside the unchanged `parked` and `parkedByGate`.** **This ADDS a member to an
   observation; it moves no register term, no cap and no seed.** **`FA-3`'s discriminator becomes the pair (park set,
   route tag).**

**⟨GATE-2 SECOND LOOP `2026-10-05` — TWO REMAINDERS AT THIS SITE ARE CLOSED ANNOTATE-BESIDE (`§17.4`, `§17.5`) AND ONE
SPELLING IS CORRECTED (`§17.4`):**

- **`parkedByAbsence` — the spelling used in `§5.5`'s counting clause — IS A TYPO FOR THE MEMBER THIS SECTION NAMES,
  `parkedByFixtureAbsence`.** **ONE NAME IS RULED (`§17.4`): the observation member is `parkedByFixtureAbsence`**, the
  printed field is **`parked-by-fixture-absence=`**, and **the superseded spelling stays visible in `§5.5`'s clause**
  rather than being rewritten there.
- **THE `FA-1`/`FA-2` PARK SET IS GRADED**, by the NAMED MUTATION of `§17.5`, on the **(park set, route tag)** pair —
  which is the discriminator this section states.**⟩**

### 16.6 BLOCKING 6 — `§5.2`'s `'corpus-document-tabs'` SELECTOR WAS **NOT** THE LANDED SURFACE

**THE FINDING, CONFIRMED BY READ: the tree's `ufTabStripRead` keys its document-tab rows by the const
`docTabRows = '#tab-strip .tab[data-document-id]'`, and the declaration entry's `surface` prose echoes *"the tab strip
document rows"*. `[data-target-kind="document"]` appears in the tree only as a per-row ATTRIBUTE the same helper reads
beside the id.**

**THE RULING: THE SURFACE OF RECORD IS `'#tab-strip .tab[data-document-id]'`, AND THE SENTINEL IS
`'dom:#tab-strip .tab[data-document-id]'`.** **THE RE-WORDING OWED: `§5.2`'s `'corpus-document-tabs'` row** (done in
place, superseded spelling kept visible) **and the registry's own `settles`/`unsettled` PROSE members on that entry** —
the `read` member's LITERAL is the contract, the prose is explanatory and must not name a selector the helper does not
use. **A landing pass that "fixes" the driver's `ufTabStripRead` to match the filed prose has changed the SURFACE, not the
probe — that is the wrong direction and is a review finding.**

**⟨GATE-5 RULING `2026-10-05` — THIS SECTION'S CLAIM THAT *"THE LANDED SURFACE IS `#tab-strip .tab[data-document-id]`"* IS **WRONG AT THIS HEAD** AND THE CLAIM IS `SUPERSEDED`; ITS BINDING READING IS `§22.3`.** **THE FILED SENTENCE IS KEPT VISIBLE ABOVE AND IS NOT REWRITTEN (`RCA-8(c)`).** **WHAT THE MEASUREMENT SHOWS: the literal exists ONLY IN THE DRIVER — never in the app — so no `#tab-strip .tab` row can ever carry it, and the probe's `0 rendered row(s)` reading is structural, not fixture-dependent.** **THE CONSEQUENCE FOR THIS PROBE IS A SKIP, NOT A FINDING AGAINST THE DRIVER: see `§22.3` for the `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` exemption, the adopting unit (`docs/specs/unit-zone-replacement.md`), and the exact SKIP wording (which states that the skip is **NOT a pass** and that the `F-2`-closure claim may NOT be reported as discharged for this limb).** **UNCHANGED BY THIS RULING: the `read` LITERAL (`'dom:#tab-strip .tab[data-document-id]'`), the superseded `[data-target-kind="document"]` spelling, and the rule that "fixing" the driver's `ufTabStripRead` to match filed prose would be a review finding — the surface awaits the LATER UNIT's foundation-tooling adaptation, not a driver edit by this unit.** **NO ARM, NO REGISTER FIGURE AND NO POPULATION FIGURE MOVES.**⟩**

### 16.7 BLOCKING 7 — `R-14`/`R-15` WROTE **UNCONDITIONALLY** INTO `.live-fixture/core/`: THE WRITE IS CONFINED BY A ROOT RESOLVER

**THE FINDING, CONFIRMED BY READ: `boot_landing` · `import1` · `ms_store` are `selfProvisioning:true`, so no gate stops
them; a hardcoded `.live-fixture/core/...` write path would make `--fixture=empty`/`--fixture=table` runs create a `core`
directory — breaking `§2.3` clause 2's *"nothing outside `.live-fixture/<setName>/` is ever removed"* reading's
counterpart, and `§11.3` item 8's *"nothing written"* reading of a refusal.**

**THE RULING, FOUR CLAUSES:**

1. **THE WRITE PATH IS RESOLVED, NOT LITERAL.** Each of the three blocks computes its path from the run's fixture state:
   **when a set IS selected (`id !== 'none'`), the path is the SELECTED SET'S OWN root** (`.live-fixture/<id>/<basename>.md`);
   **when no set is selected, the path keeps its pre-arg value** (`.live-corpus/<basename>.md`). **No
   `.live-fixture/core/` literal survives in any of the three, and the `repin-completeness:self-provisioners` arm's sweep
   is exactly that search.**
2. **THE FALLBACK IS NOT A CONTRADICTION OF `§2.4`'s IDENTITY RULE**: these three files are written BY THE BLOCK and are
   never the fixture a set supplies; with no set selected they stay on the obsolete root exactly as they are today, and
   **`--fixture=`'s arrival changes nothing for a run that does not name it** (`§3.1` clause 3).
3. **THE *"NOTHING WRITTEN"* READINGS ARE RE-WORDED, NOT WEAKENED:** `§2.3` clause 2 and `S-6`'s cell are read as **the
   run's own SET was not materialised** — a refused run materialises no set, and an `--fixture=empty` run materialises no
   set FILES. **A refused run writes NOTHING AT ALL** (`§3.3` clause 4 stands: no directory, no removal, no artifact).

   **⟨GATE-2 SECOND LOOP `2026-10-05` — THIS CLAUSE'S CITATION AND ITS STRING ARE BOTH CORRECTED (`§17.8`):**

   1. **THE CITATION IS `S-4`, NOT `S-5`.** `S-4` (`§4`) is *THE SET IS `empty`* — the `--fixture=empty` run with no
      files to materialise; `S-5` is *`--connect` WITH A SELECTED SET*, where the **materialisation DOES run** and only
      the IMPORT is skipped. **`§4`'s table and `§6.4` clause 2 agree**, so *"the empty-set reading is `S-5`'s cell"*
      was the WRONG CELL. **The filed citation is kept visible above; `S-4` is the reading of record.**
   2. **ONE STRING, GRADED BY ONE ARM** (`§17.11`): the run's own SET was **`no SET was materialised`** — this clause,
      `§11.3` item 8 and `§17.11` use that string, and **`"nothing written"` is STRUCK as a name for it** (`"nothing
      written"` is true of a REFUSED run only, i.e. of `§3.3` clause 4, and `S-4`'s run writes the three
      self-provisioned documents of `§16.7` clause 4). **THE `empty` SET'S NO-FILES READING AND THE REFUSAL'S
      NOTHING-AT-ALL READING ARE TWO DIFFERENT CLAIMS AND ARE NEVER COLLAPSED AGAIN.**⟩**
4. **THE SET DIRECTORY MAY CARRY SELF-PROVISIONED FILES AND STILL SATISFY THE FILE-LIST CONTRACT**: the `3×set-file-list`
   arms grade **the SET's own file list** (the files the materialiser writes) plus the no-stale rule; a self-provisioned
   file placed by a block is not a set file and its presence is not a stale file. **A landing pass that makes the
   self-provisioners skip their write instead is NOT this contract and is a review finding** (their `selfProvisioning:true`
   entries and row ids depend on the write).

### 16.8 BLOCKING 8 — `§10.2`'s `3×probe-read` ASSERTED EACH GATED NAME'S `read` AGAINST PROSE: THE THREE LITERALS ARE NOW WRITTEN

**THE FINDING: the register asserted a `read` against `§5.2`'s prose while denying a new registry shape — an unwritable
arm.** **THE RULING (depends entirely on `§16.3`): each of the three arms compares, by EXACT STRING EQUALITY, the registry
entry's `read` against ONE literal:**

| Arm | The literal it asserts | The mutation that must turn it RED |
| --- | --- | --- |
| **`probe-read:corpus-documents`** | **`'rag.list_documents'`** | point the entry at either `'dom:'` sentinel |
| **`probe-read:corpus-query-results`** | **`'rag.query'`** — **⟨GATE-2 THIRD LOOP `2026-10-05` — RE-STATED; THE FILED LITERAL `'dom:#pane-search li[data-document-id]'` IS `SUPERSEDED` AND IS KEPT VISIBLE IN THIS CELL. THE AMENDMENT THAT MOVES IT IS `§18.2`.⟩** | set it back to `'rag.list_documents'` (the `F-2` state); **OR restore the first loop's compound limb — a `'dom:'` literal for this name PLUS the dropped *"at least one result row is PAINTED"* conjunct (`§18.2` clause 7 items 1/2; see `§17.7` clause 3, whose mutation is re-stated there, plus the arm's own first loop literal)** |
| **`probe-read:corpus-document-tabs`** | **`'dom:#tab-strip .tab[data-document-id]'`** | set it back to `'rag.list_documents'`, or use the superseded `[data-target-kind="document"]` spelling |

**AND THE TWO SUPPORTING LIMBS, WRITTEN SO THE ARMS ARE NOT PROSE-EATING: the registry's `read` must still satisfy the
pin's existing string-or-`null` limb (so the literals above are the ONLY admissible non-`null` forms), and a `read` that
is a string but carries neither a `'dom:'` prefix nor a plausible tool name is an OFFENCE, not a third kind of read.**
**⟨GATE-2 THIRD LOOP `2026-10-05` — THIS RULING STANDS (`§18.2` clause 6: the `'rag.query'` literal is a plain non-`'dom:'`
string, so the string-or-`null` tooth and the offence rule are both satisfied with no shape change).⟩**

### 16.9 NON-BLOCKING 9 — THE BLOCK-NAME LIST: CORRECTED TO THE TREE'S OWN KEYS

**THE FINDING, CONFIRMED BY READ: (a) the key is `stage_surface_census_i2r` — `stagesurface_census_i2r` does not exist and
spells no `BLOCKS` key; (b) `tab_strip_*` names NO key in the tree, in `BLOCKS`, or in the declaration; (c)
`user9_search_open_in_tab` is gated on `'corpus-document-tabs'` (the declaration literal's own `fixtureName`), so `§2.1`
group 3 is right and `§2.1`'s `F-1` list naming it in the `corpus-documents` inventory is the error.**

**THE RULING: THE CORRECTED KEY IS `stage_surface_census_i2r`; `tab_strip_*` IS STRUCK (the tab-strip reads are the
`uf_tabs_*` keys plus `user9_search_open_in_tab`, none of them named `tab_strip_*`); and `user9_search_open_in_tab` STAYS
LISTED ONLY IN `§2.1` GROUP 3.** **`§2.1`'s `F-1` inventory and `§11.3` item 2 carry the correction as an ILLUSTRATIVE
inventory (`§16.17` is the exhaustive one); `§5.2`'s population prose is corrected by the same rule and its `'corpus-
documents'` cell gains the one member the `§16.1` amendment adds.**

### 16.10 NON-BLOCKING 10 — F-1'S `'corpus-documents'` INVENTORY IS **ILLUSTRATIVE**: EXHAUSTIVENESS AND THE OMITTED KEYS

**THE FINDING: the inventory omits `stage_multimount_reachability` and `stage_refresh_survival_v5`. `stage_refresh_survival_v5`
IS a gated `'corpus-documents'` key (`VERIFIED-BY-READ` at the declaration literal) and belongs in the inventory;
`stage_multimount_reachability` IS NOT a declaration entry at all — it is one of the two AMBIGUITY-LIST keys the census
EXCLUDED and RECORDED (`§16.17` item 4), so its absence from a `'corpus-documents'` inventory is CORRECT.** **The filed
list's `o0_*` token stands as a family reference (it names no `BLOCKS` key of that shape; the five `o0_*` gated keys are
enumerated exhaustively at `§16.17` item 2).**

**THE RULING — AND THIS SETTLES WHETHER `core` IS "INCOMPLETE": the inventory is ILLUSTRATIVE, and the declaration literal
(a `VERIFIED-BY-READ` source read) is the exhaustive authority; every arm that needs the population derives it from the
literal.** **`core` is EXHAUSTIVE for `'corpus-documents'` MINUS ONE KEY — `u_edit_1_live_package_table_limitation`, which
`table` alone supplies (`§16.1`) — not "incomplete for `30` of the `34`". The `34` in that reading is the population
figure, and it is now `35` (`§16.17`); **`core` supplies `34` of the `35` gated keys — `30` of the `31`
`'corpus-documents'` keys plus all `4` of the rendered-fixture keys — and the ONE it does not supply is
`u_edit_1_live_package_table_limitation`, the table row.** **⟨GATE-4 AMENDMENT `2026-10-05` — THE TWO FIGURES IN THIS
SENTENCE ARE RECONCILED (`30` of `31`, NOT `24` of `25`), ON THIS RULING'S OWN AUTHORITY: `§16.17` item 2's enumeration IS
the authority (`VERIFIED-BY-READ`) and the measured declaration census agrees (`RECORDED READING`, measurer: the
supervisor's shell, this pass's evidence). The FILED `24`/`25` ARE `SUPERSEDED` and are kept visible above (`§20`); the
`34` of `35` and the `4` rendered-fixture keys are UNMOVED.⟩** **AND THE REVIEW'S OWN NON-BLOCKING NOTE ON THE
STRING GRAMMAR IS RECORDED HERE AS WELL: the `(… + 0×class-(b))` spelling rule binds only the THREE zero-budget rows and
was mis-stated as universal — `declaredLastTermOf` reads the DEEPEST GROUP's last term, which is `10` for `P-TP-5`; the
correction is written into `§10.2.3` in place. The universal is the IDENTITY `declaredLastTermOf === declaredClassB`.** **⟨GATE-3 AMENDMENT `2026-10-05` — THE SENTENCE
ABOVE, *"`declaredLastTermOf` reads the DEEPEST GROUP's last term, which is `10` for `P-TP-5`"*, IS `SUPERSEDED` ON ITS
READING AND IS KEPT VISIBLE: the reader takes the MAXIMUM group depth over the whole string, and with the spelling filed here
the deepest group was `(2×citation-repoint + 2×honesty-clause)`, so it read **`2`**, not `10`. **`N-10-GRAMMAR`'S UNIVERSAL
(THE IDENTITY) IS UNCHANGED AND IS NOW TRUE OF ALL FOUR ROWS WITH NO CARVE-OUT, BECAUSE THE GATE-3 PASS RE-SPELLED `P-TP-5`'S
STRING** (`§10.2`'s table, `§10.2.3`'s gate-3 block, `§16.17` item 7). NO FIGURE AND NO ROW OF THE REGISTER MOVES. THE ID, THE
RECORD SITE (`§16.10`, `§17.10`) AND THE CITATION DISCIPLINE ARE UNCHANGED.⟩**

**⟨GATE-2 SECOND LOOP `2026-10-05` — THIS SUBSECTION'S OWN GRAMMAR NOTE IS NOW A FINDING WITH ITS OWN CITABLE ID, AND THE
ILLUSTRATIVE-vs-EXHAUSTIVE RULE IS RULED AT THE ASSERTION SITE (`§17.10`, `§17.12`):**

1. **THE GRAMMAR CORRECTION HAS THE ID `N-10-GRAMMAR`**, and THIS SUBSECTION IS ITS RECORD (its `§`-section id
   `§16.10` is the paragraph's citable home, exactly as `§17.9` and `§18.5` are labelled blocks rather than headings —
   `RCA-8(c)`'s record-not-renumber discipline). **A landing pass citing it cites `§16.10`'s `N-10-GRAMMAR`, never a
   line.**
2. **AT THE ASSERTION SITE, THE DECLARATION LITERAL IS AUTHORITATIVE AND `§5.2`'s *"names all `25`"* IS NOT** (**⟨GATE-4
   AMENDMENT `2026-10-05`: THE CELL'S FIGURE IS RECONCILED TO `31`, but THE RULE THIS CLAUSE STATES IS UNMOVED AND IS
   EXACTLY WHAT MADE THE RECONCILIATION POSSIBLE — a prose cell answers to the LITERAL AND to `§16.17` item 2's
   enumeration, and both read `31` (`RECORDED READING` of the measured declaration census, measurer: the supervisor's
   shell, this pass's evidence; `VERIFIED-BY-READ` against the enumeration); the filed `25` is `SUPERSEDED` and is kept
   visible here (`§20`).⟩**): `§5.2`'s
   inventory and `§2.1`'s `F-1` list are **ILLUSTRATIVE**, the **declaration literal is the EXHAUSTIVE authority**, and
   **every arm that needs the population DERIVES it from the literal — never from a prose cell.** **A prose cell that
   disagrees with the literal is RED by the `set-shape`/population arms' own subject, and the cell is corrected, never
   the literal (`§17.12`).**⟩**

### 16.11 NON-BLOCKING 11 — `§2.1`/`§11.3` ITEM 2 SELF-CONTRADICT: WHAT `class-(b):table` MUST ACCEPT, AND WHAT DISCRIMINATES A PARK

**THE FINDING: the set's claim is *"stops parking"*, while the block's own park string is *"cannot be met in this
corpus"* — the same sentence a legitimate park prints, so *"stops parking"* cannot be graded on the words.**

**THE RULING — THREE CLAUSES, WRITTEN INTO `§11.3` ITEM 2 AND `§2.1`:**

1. **WHAT `class-(b):table` MUST ACCEPT: a NON-PARK verdict (`PASS` or `FAIL`) whose evidence NAMES the document it
   opened and its rendered table census.** *"What is not admissible is the park, or a pass claimed with no `<table>`
   found"* — the filed sentence stands, and *"the park"* means **a PARK verdict**, not a phrase.
2. **WHAT DISCRIMINATES *"STOPPED PARKING"* FROM *"PARKED FOR ANOTHER REASON"*: THE ARTIFACT'S ROUTE ATTRIBUTION, NOT THE
   TEXT.** A fixture-absence park is tagged (`parkedByFixtureAbsence`) and its `parkReason` names the DECLARED FIXTURE; a
   block-own park (this row under `core`/`search`/`tabs`) carries no fixture-absence tag and prints its own reason. **The
   row's block is `'corpus-documents'`-gated, so at a non-empty store the fixture gate cannot route it — a park it prints
   is always its own, and that is the distinction the reading uses.**
3. **THE SENTENCE ITSELF IS NOT A CONTRACT AND MAY BE RE-WORDED BY THE LANDING PASS**, provided the two clauses above hold;
   a re-worded park that DROPS the document-name evidence is an offence under clause 1.

**⟨GATE-5 RULING `2026-10-05` — THIS RULING'S ACCEPTANCE PREDICATE IS **UNCHANGED** AND IS THE READING OF RECORD: `class-(b):table` MUST ACCEPT a `PASS` or a `FAIL` carrying evidence that NAMES the found document and its rendered table census, and MUST REJECT a `PARK` (`§22.2` item 3).** **WHAT THE ARCHITECT'S GATE-5 RULING ADAPTS IS THE `table` SET'S **CONTENT FORM**, NOT THIS CLAUSE: the set's document must carry its table in the form the app's import path PRESERVES (a GFM pipe table yielding a real `:table:` node) — the raw-`<table>`-literal form is `SUPERSEDED` (`§2.1` `F-2`'s and `§2.2` P-β's gate-5 markers, `§22.2` item 3).** **MEASURED, THE CONTROLLED BEFORE/AFTER: raw-HTML form → `no table node`, `census=0`, **PARKED** (the greens' `E-10`/`F-3` reading, `§21.5` clause 2's `F-3` row); GFM pipe-table form → `:table:`/`:thead:`/`:th:`/`:tr:`/`:td:` nodes, census `{"tables":1,"trs":1,"tds":4}`, verdict **PASS** (`RECORDED READING`, measurer: the implementer's diagnosis at this head).** **CLAUSE 2's route-attribution discriminator and clause 3's licence to re-word the sentence STAND, and no clause of this ruling is narrowed by the skip recorded at `§22.3` (that skip is the `corpus-document-tabs` limb, a different fixture).** **NO REGISTER FIGURE MOVES.**⟩**

### 16.12 NON-BLOCKING 12 — THE `settles`/`unsettled` SEMANTICS AND WHICH SPELLING THE `none`-FORM TOOTH GRADES

**THE FINDING, TWO HALVES.**

1. **THE SEMANTICS: `§5.2`'s `'corpus-documents'` row reads `*(none)*` in its `unsettled` cell, while the LANDED entry
   carries `unsettled: null`.** **THE RULING: THE LANDED SHAPE IS THE MEMBER'S TYPE — `settles` and `unsettled` are
   STRINGS, and `unsettled: null` is the "nothing is left unsettled" value; `(none)` is prose MEANING, `null` is the
   VALUE.** **The registry's `settles`/`unsettled` PROSE is NOT deleted and NOT re-worded wholesale: it is explanatory
   text, and the arms grade `read` (the literals of `§16.3`) and the two `null` `read`s — never the prose.** **Where the
   prose would name a selector, the selector must be the landed one (`§16.6`).**
2. **THE SPELLING: `§7.1`/`§11.5` write the triple `state|kind|id` (the object's own members) while the same sections'
   prose labels and `§6.2` `B-1` write `fixtureState|fixtureKind|fixtureId`.** **THE RULING: THE `none`-FORM TOOTH IS
   RE-STATED AGAINST THE OBJECT'S MEMBERS — `state`, `kind`, `id` — with the values `'no fixture data set selected'`,
   `'none'`, `'none'`; the printed-line labels are graded only where a site's TEXT is the subject (`print-site`'s arms).**
   **Both spellings stay visible and are mapped at `§7.1`'s gate-2 ruling.**

### 16.13 NON-BLOCKING 13 — THE OBSOLETE ROUTE'S LIFECYCLE UNDER A SELECTED SET, AND WHO CLEANS WHICH ROOT

**THE FINDING: `§2.3` clause 2's *"nothing outside `.live-fixture/<setName>/` is ever removed"* leaves the obsolete
route's lifecycle unstated — with `--fixture=core`, is the seed route still run (TWO supplies in ONE store), and who
cleans `.live-corpus/*`?**

**THE RULING — FOUR CLAUSES (written into `§6.4` clause 4 and `§2.3` clause 7):**

1. **THE SEED ROUTE DOES NOT RUN IN A `--fixture=<set>` RUN: the selection IMPLIES `--no-seed`, and the implication is
   PRINTED on the launch line** (so the artifact states it, and no reader has to infer it from a missing seed line).
2. **THE IMPLICATION IS AN ARG CONSEQUENCE, NOT AN ARG**: it does not touch the grammar, the refusal set (`S-6` still
   refuses the FOUR SUPPLY FLAGS) or the one-set-per-run rule. **An EXPLICIT `--no-seed` stays admitted and is refused on
   no path.**
3. **WHO CLEANS WHAT: `.live-fixture/<setName>/` is THIS unit's root and is rewritten per launch (`§2.3` clause 2);
   `.live-corpus/*` keeps its EXISTING lifecycle — the obsolete-route-only run seeds it and the driver's existing
   teardown removes it unless `--connect`, which leaves it because a running app owns it.** **A `--fixture=<set>` run
   neither seeds it nor removes it.**
4. **AN OBSOLETE-ROUTE-ONLY RUN IS UNCHANGED, AND ITS STATE STAYS `none`** (`§6.2` `B-1`, `§13.2` item 3) — the guard the
   implication exists to keep meaningful: a run whose store was populated by the obsolete route must never read as a
   fixture-set run.

### 16.14 NON-BLOCKING 14 — `§9` CLAUSE 3'S *"ARMS `R-mock`"* HAD NO ARM: THE ARM IS NOW WRITTEN

**THE FINDING, CONFIRMED BY READ: `§11.2`'s `HONESTY-CLAUSE` group carried a proxy limb and a clause-presence limb but no
arm asserting the artifact's NON-QUOTABILITY TEXT, and no named mutation for it; and the cited ids `R-none`/`R-mock` name
no row in UNIT A's contract (the rule is prose there).**

**THE RULING — THE HONESTY CLAUSE IS **ARMED**, NOT STRUCK, AND THE CITATION IS CORRECTED:**

1. **THE ARM IS `honesty-clause:mock-quote`** (already in the register's `2×honesty-clause` term — no term moves **⟨GATE-3 AMENDMENT `2026-10-05`: read *"no term moves"* as
NO TERM OF THE REGISTER IS ADDED, DELETED, RENAMED OR RE-COUNTED. The `10×class-(b)` term's POSITION inside `P-TP-5`'s string
does move — into the group, by `§10.2.3`'s gate-3 amendment — so `2×honesty-clause` is no longer the group's last term. No `k`,
no total, no class-(b) budget and no figure moves.⟩**): a
   SOURCE read asserting that the `mock-data-set` consequence clause carries the NON-QUOTABILITY SENTENCE (*"a fixture-fed
   PASS may NOT be quoted as a live-corpus app reading"*) and that the sentence is present in the artifact's printed
   clause for a `mock-data-set` state.
2. **ITS NAMED MUTATION: DELETE THAT SENTENCE FROM THE CLAUSE** (`§11.2`'s gate-2 block, item 2); the arm must go RED. A
   green under that mutation is a tooth that cannot bite (`§10.3` clause 4).
3. **THE CITATION IS CORRECTED IN PLACE: `R-none`/`R-mock` become UNIT A's clause 3 of its `§7` honesty clause and the
   printed `CONSEQUENCE` sentence's closing clause.** **A landing pass that wants row ids for the two quoting rules may
   mint them — but not in UNIT A's file as if they were filed there.**

### 16.15 NON-BLOCKING 15 — `state-consequence:mock-armed` OWES ITS OWN NAMED MUTATION

**THE FINDING: `§11.2`'s `STATE-CONSEQUENCE` mutation (*"print `UF_FIXTURE_STATE_CONSEQUENCE` unconditionally"*) targets
the `none` consequence's scoping; the NEW `mock-data-set` clause that `§7.3` `D-7` requires had no mutation at all.**

**THE RULING: THE ARM KEEPS ITS NAME AND GAINS A NAMED MUTATION — **DELETE THE `mock-data-set` CLAUSE FROM THE DERIVED
CONSEQUENCE** — requiring the arm RED** (`§11.2`'s gate-2 block, item 1). **The two arms divide the behavior cleanly:
`none-scoped` grades that the `none` sentence prints only under `none`; `mock-armed` grades that the `mock-data-set`
sentence EXISTS, is DERIVED from the state and is NOT a constant.** **The clause's PARTS are contracted (`§7.1`'s
clause-2 requirement plus `D-7`); its exact wording is the landing pass's (`§13.3` item 7(b)).**

### 16.16 NON-BLOCKING 16 — `§5.4`'s *"STAYS GREEN UNDER THE RULE"* IS **REFUTED BY READ**: THE ARM OWES A `RED` MUTATION

**THE FINDING, CONFIRMED BY READ AT THE PIN: `A-5.vi` asserts that a registry key **no declaration entry names**
(`'uf-no-such-declared-fixture'`) produces the offence *"registry probe key(s) no declaration entry names: …"*, and the
pin's `A-5.iii` falsifiability probe REVERSES the same limb and requires it RED. `§5.4`'s claim that the existing mutation
*"stays green under the rule"* describes the pre-fix state and is superseded.**

**THE RULING: THE `probe-population:never-gated-name-has-null-read` DIRECTION'S ARM PLANTS THE PIN'S OWN KEY LITERAL AND
REQUIRES THE OFFENCE TEXT** (`§11.2`'s gate-2 block, item 3). **`§5.4`'s sentence is superseded and kept visible;
"stays green" is replaced by "must BITE".** **Consequence for the red set: this arm is GREEN-PRESERVING today (the
registry is clean at the filing head) and its MUTATION is what goes RED — which is exactly the distinction `§10.3`
clause 4 draws between an arm that can fail and an arm re-scoped to pass.**

### 16.17 THE RE-DERIVED FIGURES A TESTWRITER NOW READS

**EVERY FIGURE BELOW IS `VERIFIED-BY-READ` (reader: this gate-2 pass, over the driver's landed `UF_FIXTURE_DECLARATION`
literal, its `UF_DECLARED_FIXTURE_PROBES` literal, and the pin's own `A-5.vi`/`A-8` readers) UNLESS IT SAYS `RECORDED
READING`. `§10.2`'s arithmetic is quoted UNCHANGED.**

1. **THE SET INVENTORY (`§2.1`)** — `core` (`alpha.md` · `beta.md` · `gamma.md`) · `table` (`core`'s three + `table.md`)
   · `search` (`core`'s three, text rewritten so it carries no probe term) · `tabs` (`core`'s three + `search.md`) ·
   `empty` (**no files**). **`table` is the only set carrying a stored-`<table>` document; `tabs` is the only set with no
   document tab open at the blocks' own start.** **⟨GATE-5 RULING `2026-10-05` — TWO READINGS IN THIS SENTENCE ARE AMENDED BESIDE, NO FIGURE MOVED (`§22.4` clause 3): (a) *"a stored-`<table>` document"* reads **PARSER-MEDIATED** — the document carries a GFM pipe table yielding a real `:table:` node — since the raw-`<table>`-literal form is DISCARDED by the app's markdown import (`§2.1` `F-2`, `§2.2` P-β, `§22.2` item 3); (b) *"`tabs` is the only set with no document tab open at the blocks' own start"* is `SUPERSEDED` as a CONTRAST — `REFUTED BY MEASUREMENT`: only a NON-DOCUMENT `landing` tab exists in the strip at the probe's pre-gesture read point under EVERY set, because `#tab-strip .tab[data-document-id]` can never match at this head, so that limb is **SKIPPED-BY-RULING** and **NOT a pass** (`§22.3`). THE SET INVENTORY'S FILES AND ALL ITS COUNTS ARE UNMOVED.**⟩**
2. **THE GATED POPULATION: `35` KEYS** — `47` declaration entries − `3` `corpusRead:false` − `9` `selfProvisioning:true`
   (`§16.1`'s amendment moves one entry off the last group). **BY FIXTURE NAME: `'corpus-documents'` `31` ·
   `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1` · `'self-provisioned-document'` `0` (never gated) ·
   `'none'` `0` (never gated).** **⟨GATE-4 AMENDMENT `2026-10-05` — THE PER-NAME FIGURE IS `31`, NOT THE FILED `25`
   (kept visible in the same sentence immediately above): `31 + 3 + 1 = 35`, closing exactly, where `25 + 3 + 1 = 29`
   closed with nothing. **`RECORDED READING`** (measurer: the supervisor's shell, on this pass's evidence: among the `35`
   gated declaration entries, `fixtureName` reads `'corpus-documents'` `31` · `'corpus-query-results'` `3` ·
   `'corpus-document-tabs'` `1`), **CORROBORATED `VERIFIED-BY-READ`** — **THIS ITEM'S OWN ENUMERATION BELOW IS THE
   FIGURE'S AUTHORITY AND IT COUNTS TO `31`.** The decomposition is `31 = 30 + 1` (`30` at the pre-landing head,
   `RECORDED READING` of the same measurer; `1` = the `§17.1` column-move); the filed `25 = 24 + 1` clause is
   `SUPERSEDED` (`§20`). THE POPULATION `35`, THE `47`, THE `3`, THE `9` AND THE LIST BELOW ARE UNMOVED.⟩**
   **The filed `34` → `24`/`3`/`1` split is SUPERSEDED; the `34` stays visible in `§2.1`,
   `§5.2` and `§5.5`.** **THE GATED `'corpus-documents'` KEYS, EXHAUSTIVELY (this is the list `§16.10` calls the
   authority):** `tabs` · `toolbar_undo` · `v1_adjacency` · `v2_scoped` · `user4_main_editable` · `repro_nbsp` ·
   `repro_dup_para` · `uf_tabs_1` · `uf_tabs_3` · `uf_tabs_4` · `uf_panes_12` · `uf_panes_12_diag` · `uf_hist_4` ·
   `uf_hist_6` · `uf_layout_2` · `u_edit_1_live_commit_failure_warning` · **`u_edit_1_live_package_table_limitation`**
   (the `§16.1` amendment) · `shell_integration` · `v3_docnav` · `stage_async_mount_race_v1` ·
   `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` ·
   `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r` · `o0_document_row` ·
   `o0_folder_row` · `o0_gpu_control` · `o0_repeat_determinism` · `o0_track_ablation` — **`16` hand-listed + `9` entered =
   `31`.** **⟨GATE-4 AMENDMENT `2026-10-05` — THE TOTAL IN THIS SENTENCE IS `31`, NOT
   `25` (`RECORDED READING` of the measured declaration census, measurer: the supervisor's shell, this pass's evidence;
   AND `VERIFIED-BY-READ` — this item's own list counts to `31`). THE FILED SPLIT *"`16` hand-listed + `9` entered"* IS
   `SUPERSEDED`: its `16` CANNOT BE RE-DERIVED from this enumeration as written (**`OWED`**), while its `9` re-derives as
   the enumeration's ENTERED tail (`13` − `4` = `9`, `VERIFIED-BY-READ`, `§20.2` clause 2). **THE ENUMERATION IS THE
   AUTHORITY OVER THE STALE FIGURE — `§16.17` item 2's OWN LIST READS `31`, which is what this amendment restores.**
   `25` AND THE FILED SPLIT ARE KEPT VISIBLE ABOVE (`§20`). THE `eight`/`five`/`13` FAMILY FIGURES AND THE LIST ITSELF
   ARE UNMOVED.⟩** **⟨GATE-5 AMENDMENT `2026-10-05` — THE `eight`/`five`/`13` SENTENCE IMMEDIATELY ABOVE AND ITS `13` − `4` = `9` SUB-DERIVATION ARE `SUPERSEDED` AND ARE KEPT VISIBLE (`RCA-8(c)`): THIS LIST'S OWN FAMILY TOKENS ARE **`7` `stage_*` + `5` `o0_*` = `12`**, LEAVING **`19`** IN THE REMAINDER (`12 + 19 = 31`) — WHICH IS WHAT THE LIST ABOVE ACTUALLY PRINTS AND WHAT THE DECLARATION MEASURES (greens row `H-9`, fail ledger `F-4`). `13` SURVIVES ONLY AS THE **DECLARED** `stage_*` FAMILY COUNT (`8`, `stage_tabs_persist_roundtrip` — a `corpusRead:false` key of the never-gated group, greens `H-2` — included) BESIDE THE `5` `o0_*`: `13 − 1 = 12` INSIDE THE `31`. **THE `9` TERM OF THE FILED `16 + 9 = 31` SPLIT IS RE-DERIVABLE INDEPENDENTLY — THE ENUMERATION'S `4` HAND-LISTED `stage_*` KEYS (`stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document`) AND THE `5` `o0_*` KEYS = `9` — SO THE SPLIT SURVIVES THE CORRECTION ON A TERM COUNT THAT DOES NOT RIDE `13` OR `18`.** THE LIST, THE TOTAL `31`, ITS AUTHORITY AND THE `16`-TERM'S `OWED` STATUS ARE UNMOVED. THE FULL SITE REGISTER IS `§21.3`.⟩**
3. **THE CORRECTED NAMES AND KEYS (`§16.9`, `§16.10`)** — `stage_surface_census_i2r` (**not**
   `stagesurface_census_i2r`); `tab_strip_*` **struck** (no such key exists); `user9_search_open_in_tab` in `§2.1` group
   `3` **only**; `stage_refresh_survival_v5` **added** to the inventory; `stage_multimount_reachability` **NOT a
   declaration entry** (it is one of the two ambiguity-list keys the census EXCLUDED and RECORDED, beside
   `stage_boot_landing_diag`); **`import1` · `ms_store` are the two never-gated entries carrying `rows: []`**; and the one
   driver-side `surface` prose the amendment touches is the table entry's — *"a TABLE-bearing corpus document searched in
   the store list after this block provisions its own fixture"* → the block no longer "provisions its own fixture".
4. **THE PROBE `read` FORMS (`§5.2`, `§16.3`)** — `'corpus-documents'` → `'rag.list_documents'` ·
   `'corpus-query-results'` → `'dom:#pane-search li[data-document-id]'` · `'corpus-document-tabs'` →
   `'dom:#tab-strip .tab[data-document-id]'` · `'self-provisioned-document'` → `null` · `'none'` → `null`. **Dispatch: the
   literal `'dom:'` prefix = DOM row-count read of the selector that follows; any other non-null string = MCP tool name;
   `null` = never gated. `resolved:true` for any COMPLETED count (`0` included); a throw or a non-numeric count is a NAMED
   unreadable (`resolved:false`) that parks nobody.** **⟨GATE-2 THIRD LOOP `2026-10-05` — THE SECOND FORM IS `SUPERSEDED`
   AND IS KEPT VISIBLE IN THIS ITEM (`§18.2`): the forms of record are `'corpus-documents'` → `'rag.list_documents'` ·
   `'corpus-query-results'` → **`'rag.query'`** · `'corpus-document-tabs'` → `'dom:#tab-strip .tab[data-document-id]'` ·
   `'self-provisioned-document'` → `null` · `'none'` → `null`. **THE DISPATCH RULE IS UNCHANGED AND STILL SUFFICIENT: the
   `'dom:'` prefix = DOM row-count read; any other non-null string = an MCP TOOL read (for `'rag.query'`, called with the
   probe's own constant term); `null` = never gated.** **`resolved:true` FOR ANY COMPLETED READING — a count of `0`
   included, AND a resolved store query with `0` hits included; a throw, a non-numeric count, an `isError` reply or a
   transport failure is a NAMED unreadable (`resolved:false`) that parks nobody.**⟩**
5. **THE STATE (`§7.1`, `§16.4`, `§16.12`)** — **THREE MEMBERS: `state` · `kind` · `id`** (printed labels `fixtureState=` ·
   `fixtureKind=` · `fixtureId=`), `none`-form `'no fixture data set selected'` / `'none'` / `'none'`; `mock-data-set` form
   `'mock data set <setName> selected'` / `'mock-data-set'` / `<setName>`; **the materialisation root is PRINTED TEXT
   beside the state, NOT a fourth member**; **the state is assigned ONCE, AFTER the refusal branches, so every early site
   prints `none`.** **⟨GATE-5 AMENDMENT `2026-10-05` — *"EVERY EARLY SITE PRINTS `none`"* IS READ, AFTER THIS AMENDMENT, AS *"EVERY **REFUSAL** PATH PRINTS `none`"*: THE `main().catch` ERROR LINE IS REACHED BY ABORTS BEFORE **AND** AFTER THE ASSIGNMENT AND PRINTS THE BINDING'S STATE AT THE ABORT (`§21.1`; greens `F-8`). THE ASSIGNMENT'S POSITION, THE ONE-READ RULE AND THE `none` TRIPLE AT THE FOUR REFUSAL PATHS ARE UNMOVED.⟩**
6. **THE RUN'S FIXTURE OBSERVATION (`§16.5`)** — three park members, printed together: `parked` (gated keys parked,
   whatever for) · `parkedByGate` (the fixture gate's own branch) · **`parkedByFixtureAbsence` (NEW: gated keys parked
   because their own declared fixture read absent)**.
7. **THE REGISTER (`§10.2`) — UNCHANGED, QUOTED FOR THE TESTWRITER** **⟨GATE-3 AMENDMENT `2026-10-05`: `UNCHANGED` IS TRUE OF
EVERY FIGURE IN THIS ITEM AND FALSE OF ONE STRING'S SPELLING — `P-TP-5`'s `declared` string carries the gate-3 AMENDED spelling
below, because the spelling quoted here made the pin's own `declaredLastTermOf` read `2` against the row's declared `10`
(`§10.2.3`'s gate-3 block). NO TOTAL, NO CLASS-(b) BUDGET, NO CAP, NO SEED AND NO STRATEGY ID MOVES.⟩** — rows `P-IM-6` `2×set-identity + 3×set-file-list +
   3×set-shape + 4×selection-grammar + (5×refusal-arms + 0×class-(b))` = `17` executed; `P-SM-5` `3×probe-read +
   5×falsifier-divergence + 2×probe-resolution + (2×probe-population + 0×class-(b))` = `12`; `P-TP-4` `3×state-member +
   3×state-derivation + 3×print-site + (2×state-consequence + 0×class-(b))` = `11`; `P-TP-5` `3×obsolete-route-annotation
   + 3×route-supply-refusal + 7×repin-completeness + (2×citation-repoint + 2×honesty-clause) + 10×class-(b)` = `27` **⟨`SUPERSEDED` GATE-3 `2026-10-05` — THE SPELLING QUOTED IMMEDIATELY ABOVE IS THE FILED ONE AND MUST NOT BE LANDED: it made the pin's own `declaredLastTermOf` read `2` against the row's declared `10` (`§10.2.3`'s gate-3 block). **THE BINDING SPELLING, WHICH THE TESTWRITER WRITES INTO THE REGISTER ARRAY:** `3×obsolete-route-annotation + 3×route-supply-refusal + 7×repin-completeness + (2×citation-repoint + 2×honesty-clause + 10×class-(b))` = `27` — **`declaredTotalOf` `27` · `declaredLastTermOf` `10` = `declaredClassB` `10` · EXECUTED `17`, ALL `VERIFIED-BY-READ` BY THE PIN'S OWN READERS** (`§10.2`'s table, `§10.2.3`'s gate-3 block). ONLY THIS ROW'S STRING MOVES; THE OTHER THREE ROWS AND EVERY FIGURE OF THIS ITEM ARE UNCHANGED.⟩**
   (`17` executed + `10` class-(b)). **TOTAL `17 + 12 + 11 + 27 = 67`; EXECUTED `57`; caps `≤ 100`/row · `≤ 400` total ·
   `≤ 8` rows; seed `0x20261005`; the `0×class-(b)` spelling binds the three ZERO-BUDGET rows only.**
8. **THE THREE CORRECTED MUTATIONS (`§16.14`, `§16.15`, `§16.16`)** — `state-consequence:mock-armed` → delete the
   `mock-data-set` clause; `honesty-clause:mock-quote` → delete the non-quotability sentence;
   `probe-population:never-gated-name-has-null-read` → plant `'uf-no-such-declared-fixture'` and require the offence
   *"registry probe key(s) no declaration entry names: …"*.
9. **THE PROBE SET (`§5.4`)** — **three names with a non-`null` `read`, two with `null`, and the registry key set EQUAL to
   the declaration's `fixtureName` value set — UNCHANGED BY THE `35`-KEY POPULATION, AND NOW GRADED BY THE LITERALS OF
   ITEM 4 ABOVE.**
10. **THIS FILE'S LINE COUNT AFTER THIS AMENDMENT** — `VERIFIED-BY-READ` (reader: this gate-2 pass, the file-read tool's
    own census, taken after the last edit of this section): **`1749` lines**, against the `1074` of the filed head
    (`§14` item 2). **IT IS AN OBSERVATION, NOT A PIN**: a later amendment moves it, and a landing pass must take its own
    census. **THE `sha256` REMAINS `OWED` (`§14` item 1) — this pass holds no shell and took no digest.**

**⟨GATE-2 SECOND LOOP `2026-10-05` — §16.17 ITEM 10'S `1749` IS THE FILED HEAD'S CENSUS AND IS SUPERSEDED: `§17.13` item
10 carries this pass's own re-taken census, with the `1749` kept visible.**⟩**

---

## 17. ⟨GATE-2 SECOND LOOP `2026-10-05`⟩ THE SECOND SPEC-REVIEW PASS'S REGISTER — **ONE BLOCKING + TWELVE NON-BLOCKING FINDINGS** (`§17.1`…`§17.13`), EVERY ONE CLOSED ANNOTATE-BESIDE

**WHAT THIS PASS IS.** The gate-2 loop's SECOND run **confirmed `15` of the `16` closures of `§16` BY READ** and left
**ONE BLOCKING** (`§17.1`) plus **TWELVE NON-BLOCKING** remainders (`§17.2`…`§17.13`). **THIS PASS CLOSES ALL THIRTEEN.**
**IT IS A DOC-LAYER PASS: it holds read/search + doc-writes, RAN NOTHING (no suite, no leg, no battery, no
`md5sum`/`sha256sum`, no `wc -l`), and touched no `scripts/**`, `tests/**` or `src/**` byte.** **NO CLAUSE IS REWRITTEN IN
PLACE: each finding is annotated BESIDE its site, its filed text stays visible and dated, and the loser of a
contradiction is marked `SUPERSEDED`.** **EVERY FIGURE BELOW IS `VERIFIED-BY-READ` (reader: this pass, over the site it
names — the driver's own literals, the pin's own readers, or this file's own cells) unless it says `RECORDED READING`
(with its measurer named) or `OWED`.**

**WHAT THIS PASS DOES *NOT* MOVE, STATED SO THE AMENDMENT IS NOT RE-READ AS A REWRITE:** **THE REGISTER IS UNTOUCHED —
`P-IM-6` `17` · `P-SM-5` `12` · `P-TP-4` `11` · `P-TP-5` `27`, `17 + 12 + 11 + 27 = 67`, EXECUTED `57`, the caps
`≤ 100`/row · `≤ 400` total · `≤ 8` rows, the seed `0x20261005`, the `held`/`broken` reporting and the `0×class-(b)`
scoping — because the second run VERIFIED EVERY ONE CLEAN.** **Every NEW assertion this pass contracts is therefore
written as a NAMED SUB-LIMB or a NAMED MUTATION *INSIDE* an already-named arm, never as a new arm** (`§17.5`, `§17.6`,
`§17.7`): a sub-limb rides an arm the register already counts, so **no `k`, no total, no cap and no seed moves**, and a
landing pass that WANTS each of them as its own arm must re-derive `P-TP-4`/`P-SM-5` with **both** values visible
(`§10.3` clause 5). **ALSO UNTOUCHED, and verified clean by the second run: the `F-2` FALSIFIER (`§5.5`'s `p < pre`
predicate), the engine-ruling compliance (`§8`, including the standing ruling that the ENGINE STATUS IS IRRELEVANT BEHIND
THE MOCKS until the UI overhaul is done and the engine integration starts — nothing here gates on engine availability),
the Unit-A consistency (`§1.3`), and the NO-DOSSIER VERDICT of `§16`'s head (this unit ADOPTS NO EXTERNALLY-SOURCED
IDENTIFIER, so **no adoption dossier is owed**).** **THE `sha256` STAYS `OWED` (`§14` item 1): this pass holds no shell
and took no digest.**

### 17.1 BLOCKING (SECOND LOOP) — THE CROSS-UNIT LANDING IS **ATOMIC**, AND THE POPULATION IT LANDS ON IS **ASSERTED**

**THE FINDING, CONFIRMED BY READ: `§16.1` / `§1.3` / `§14` item 9 say that UNIT A's contract and pin *"carry it as one"*
— i.e. that the column-move is a UNIT A AMENDMENT — but NOWHERE does this file state that the declaration COLUMN-MOVE,
UNIT A's pin RE-STATEMENT and UNIT B's own arms land IN ONE PASS; and nowhere does it state, as a single citable
figure, WHICH POPULATION THE ARMS ASSERT.**

**THE RULING, TWO CLAUSES. CLAUSE ONE IS THE ATOMICITY CLAUSE.**

1. **THE ATOMICITY CLAUSE — THE MOVE, THE RE-STATEMENT AND THE ARMS ARE ONE PASS, AND LANDING EITHER HALF ALONE IS A
   `CONTRADICTION`.** **`u_edit_1_live_package_table_limitation`'s column-move in `UF_FIXTURE_DECLARATION` (from
   `corpusRead:true, selfProvisioning:true, fixtureName:'self-provisioned-document'` to `corpusRead:true,
   selfProvisioning:false, fixtureName:'corpus-documents'`, `§16.1`), the RE-STATEMENT of UNIT A's own pin assertions
   (`§11.5`, and `§2.4` clause 3's *"the pin's quoted identities move with it, in the same pass"*), and this unit's
   `§11.2` arms — the `PROBE-READ` group whose registry read the move does not touch, and the population/repin arms whose
   SUBJECT the move changes — land IN ONE PASS.** **The declaration column-move, the pin re-statement and UNIT B's arms
   land TOGETHER; a landing pass that lands any one of them without the other two is landing an INCOMPLETE unit and its
   own DONE row may not claim `§16.1`'s closure.**
2. **THE CONSEQUENCE, STATED PLAINLY — A SEPARABLE LANDING REDS NOTHING AND LEAVES THE TWO DOCUMENTS DISAGREEING.** **A
   LANDED pass in which the declaration has moved but UNIT A's own documents have not is a `CONTRADICTION`, and it is
   the kind that no ARM of this unit catches:** **UNIT A's `§6.2` cell *"GATED = 34"* and its `§8.3` item 1's readings
   *"`P/34`"* and *"`34 − P`"* REMAIN FILED AS LIVE** — **this file does not re-open UNIT A's contract** (`§1.3`, `§12`
   item 5) and **may not rewrite another unit's cells** — **so after a separable landing UNIT A's `34` and this file's
   `35` stand side by side, both filed, both readable, and NOTHING is red.** **THE PIN DOES NOT BREAK THE TIE EITHER: its
   `A-8` limb 2 evaluates the DRIVER's `UF_FIXTURE_STATE` region AS PURE DATA** — `VERIFIED-BY-READ` at the pin's own
   reader (`ufFixtureStateLiteralIn`, whose subject is only the DRIVER's `const UF_FIXTURE_STATE = { … }` literal: is it
   FOUND, is it a PURE object, is its member set exactly `{state, kind, id}`, are its values strings and the contracted
   `none`-form) — **and NO PIN ASSERTION CARRIES A GATED-POPULATION FIGURE: `VERIFIED-BY-READ` over the pin, `34` appears
   NOWHERE AS AN ASSERTION (no `toBe(34)`/`toEqual(34)`-shaped expectation exists); the `34`s in the tree are COMMENTS,
   the driver's own derived `GATED` field being `UF_GATED_DECLARED_KEYS.length` (`VERIFIED-BY-READ`, computed from the
   declaration's predicate, so it re-derives itself when the move lands).** **A SEPARABLE LANDING IS THEREFORE SILENT,
   WHICH IS EXACTLY WHY IT IS A CONTRADICTION AND NOT MERELY AN INCOMPLETENESS — the two documents DISAGREE, and the
   disagreement is graded by READ, at the landing pass's own records, not by an arm** (`§14` item 9).
3. **CLAUSE TWO — THE ASSERTED POPULATION, WITH ITS NAMES AND ITS ARITHMETIC.** **`35 = 47 − 3 − 9`, and the `35` is:**
   **`'corpus-documents'` `31` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1`**, with
   `'self-provisioned-document'` `0` and `'none'` `0` because **neither is ever gated** (`§5.2`, `§5.4`). **⟨GATE-4
   AMENDMENT `2026-10-05` — THE FIRST NAME'S FIGURE IS `31`, NOT THE FILED `25` (which is kept visible in the same
   sentence immediately above): **`31 + 3 + 1 = 35`**, closing exactly. **`RECORDED READING`** (measurer: the
   supervisor's shell, on this pass's evidence: the `fixtureName` census over the `35` gated declaration entries), and
   **`VERIFIED-BY-READ`** against `§16.17` item 2's enumeration, WHICH IS THE AUTHORITY and which reads `31`. THE `35`,
   THE `3` AND THE `1` ARE UNMOVED (`§20`).⟩** **The three
   terms of the arithmetic, each `VERIFIED-BY-READ`:** **`47`** = the `UF_FIXTURE_DECLARATION` entries (**the census
   itself**, `census-minus-declared = 0`); **`3`** = the `corpusRead:false` entries
   (`stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker`); **`9`** = the
   `selfProvisioning:true` entries **AFTER** the move (UNIT A's `10` MINUS the moved
   `u_edit_1_live_package_table_limitation`). **`25 = 24 + 1`**: the `24` `'corpus-documents'` keys at the filed head
   PLUS the moved key; **`24 + 1 + 3 + 1 = 29` and `29 + 9 = 38`, so the `35` is NOT the sum of the groups — it IS the
   `47 − 3 − 9` of them** — **the `9` and the `3` are the NEVER-GATED groups and are subtracted, never added** (`§16.17`
   item 2). **⟨GATE-4 AMENDMENT `2026-10-05` — THIS DECOMPOSITION CLAUSE IS RECONCILED AND ITS FILED ARITHMETIC IS
   `SUPERSEDED`, KEPT VISIBLE ABOVE: the reconciled form is **`31 = 30 + 1`** (`30` = the `'corpus-documents'` gated-key
   count at the PRE-LANDING head, `RECORDED READING`, measurer: the supervisor's shell, this pass's evidence; `1` = the
   column-move), and the group sum is now **`31 + 3 + 1 = 35`** — WHICH IS THE SAME `35` THE `47 − 3 − 9` FORM REACHES, so
   the two readings AGREE instead of one closing with nothing. **THE FILED `25 = 24 + 1` RESTS ON THE STALE BASE AND THE
   FILED `24 + 1 + 3 + 1 = 29` IS ITS ARITHMETIC: `29 ≠ 35`.** **THE ENUMERATION WAS THE AUTHORITY — `§16.17` item 2's
   list reads `31` (`VERIFIED-BY-READ`) and the measured declaration census agrees (`RECORDED READING`, same measurer).**
   The `9`/`3`-are-subtracted rule, the `47`, the `35`, the `3` and the `9` are UNMOVED (`§20`).⟩** **THE POPULATION IS THEREFORE THE SUBJECT OF `§17.3`'s membership arithmetic, of `§11.3` item 5's
   every-gated-key-parked reading, and of `§16.17` item 2's exhaustive key list — one figure, three sites, one
   arithmetic.** **A landing pass that lands the move and quotes `34` anywhere as the CURRENT figure is red by read; a
   landing pass that lands the arms and NOT the move is the contradiction of clause 2.** **THE `35` MOVES NO REGISTER
   FIGURE** — the register counts `arm()` ATTEMPTS, and **no term of any row is a population term** (`§10.2`, verified
   clean by the second run).

### 17.2 NON-BLOCKING (SECOND LOOP) 2 — `§5.2`'s `'corpus-documents'` CELL SAID **`seven`** `stage_*`: THE AUTHORITY NAMES **`eight`**

**THE FINDING, CONFIRMED BY READ: `§5.2`'s `'corpus-documents'` population cell read *"the seven `stage_*` and the five
`o0_*` keys"*, while `§16.17` item 2 — the exhaustive, literal-derived inventory — names `EIGHT` `stage_*` keys; the
eighth is `stage_refresh_survival_v5`, which `§16.9`/`§16.10` ADDED to the inventory, and the cell's *"names all `31`"*
was therefore true only of the OTHER `30`.** **⟨GATE-4 AMENDMENT `2026-10-05` — THE TWO FIGURES IN THIS SENTENCE ARE
RECONCILED (`31` / `30`, NOT `25` / `24`) ON THIS RULING'S OWN AUTHORITY: `§16.17` item 2's enumeration IS the authority
and it reads `31` (`VERIFIED-BY-READ`), and the measured declaration census agrees (`RECORDED READING`, measurer: the
supervisor's shell, this pass's evidence). The FILED `25`/`24` ARE `SUPERSEDED` and are kept visible above (`§20`); the
ruling's own `eight stage_*` / `5 o0_*` / `13` family figures are UNMOVED — the enumeration agrees with them exactly.⟩**
**⟨GATE-5 AMENDMENT `2026-10-05` — BOTH HALVES OF THAT LAST SENTENCE ARE `SUPERSEDED` AND ARE KEPT VISIBLE (`RCA-8(c)`): the `eight`/`13` figures are NOT unmoved, and the enumeration does NOT agree with them. THIS RULING IS REVERSED BY THE CONTRACT'S OWN PRECEDENCE RULE (the enumeration is the authority) AND BY MEASUREMENT: see this section's closing block below and `§21.3`.⟩**

**THE RULING: THE COUNT IS `eight`, CORRECTED AT THE CELL, WITH THE FILED WORD KEPT VISIBLE.** **`VERIFIED-BY-READ` of
`§16.17` item 2's list — `stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` ·
`stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` ·
`stage_refresh_survival_v5` · `stage_surface_census_i2r` · `stage_tabs_persist_roundtrip` — `eight` `stage_*` keys, and
`o0_document_row` · `o0_folder_row` · `o0_gpu_control` · `o0_repeat_determinism` · `o0_track_ablation` — `five` `o0_*`
keys.** **`8 + 5 = 13`, NOT the `12` the filed `seven` implied**; **the cell's own *"named here / named all `31`"* claim
is carried by the CELL (`u_edit_1_live_package_table_limitation` is named in the same sentence as the `§16.1`
amendment's addition), never by the filed enumeration**, and **`§16.17` item 2 stays the exhaustive authority at the
assertion site (`§17.12`).** **The filing-side consequence is RECORDED, not repaired here: the `16` hand-listed + `18`
entered split at `§2.1` group 1 cannot produce its own group's `31` (`16 + 18 = 34`), so `§16.17` item 2's own
*"`16` hand-listed + `9` entered = `31`"* is the reading of record and **the `18` is a stale figure of the OLD group
total (`34`)'s split** — `VERIFIED-BY-READ` by arithmetic over the two filings.** *(This is a figure this pass found
while re-reading the sites named above; it is recorded here rather than carried silently, and it is a DOC figure only —
no arm and no register term reads it.)*
**⟨GATE-4 AMENDMENT `2026-10-05` — THIS SUBSECTION'S THREE FIGURES ARE RECONCILED: the group's total is `31` (NOT the
filed `25`), and the split sentence is now `16 + 9 = 31` (NOT `16 + 9 = 25`). **THE ENUMERATION WAS THE AUTHORITY —
`§16.17` item 2's own list reads `31` (`VERIFIED-BY-READ`) — and the measured declaration census agrees (`RECORDED
READING`, measurer: the supervisor's shell, this pass's evidence).** **THE `16` TERM IS `OWED`: it CANNOT be re-derived
from the enumeration as written, and this pass does not invent one; the `18` stays the kept-visible stale term it was
(`§20`).** **THE `eight`/`five`/`13` FAMILY FIGURES, THE `12`-vs-`13` CORRECTION AND THE ILLUSTRATIVE-vs-EXHAUSTIVE RULE
ARE UNMOVED.**⟩**

**⟨GATE-5 AMENDMENT `2026-10-05` — THIS SECTION'S WHOLE CORRECTION IS REVERSED: THE FILED `seven` WAS RIGHT AND `eight` IS `SUPERSEDED`, KEPT VISIBLE ABOVE (`RCA-8(c)`). GREENS ROW `H-9` (fail ledger `F-4`) MEASURED THE CONTRACT'S OWN AUTHORITY AND THE LANDED DECLARATION INDEPENDENTLY, AND BOTH READ `7`:**

1. **`§16.17` ITEM 2'S OWN LIST PRINTS `7` `stage_*` NAMES — NOT `8`:** `stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r`. **THE "EIGHTH" THIS SECTION ADDED — `stage_tabs_persist_roundtrip` — DOES NOT APPEAR IN THAT LIST AT ALL**: it is a `corpusRead:false` key of the never-gated group (`§2.1` group 4, greens row `H-2`), so it is NOT one of the `31`, and the sentence above that cites the list as the thing that *"names"* it is FALSE OF THE LIST AS WRITTEN.
2. **THE `31` IS UNMOVED AND SO IS THE ENUMERATION'S AUTHORITY; WHAT MOVES IS THE FAMILY FIGURE AND THE REMAINDER THAT DEPENDS ON IT:** the gated `'corpus-documents'` family arithmetic is **`7` `stage_*` + `5` `o0_*` = `12`**, leaving **`19`** in the remainder (`12 + 19 = 31`), NOT the filed `8 + 5 = 13` / remainder `18` (`13 + 18 = 31`, arithmetically true only of the DECLARED family). **`13` IS NOT STRUCK: it is the census of the DECLARED `stage_*` family (`8`, the never-gated key included) beside the `5` `o0_*` keys, and `13 − 1 = 12` inside the `31`.** **THE `12` THE FILED SECTION CALLED *"the `12` the filed `seven` implied"* IS THEREFORE THE BINDING GATED FIGURE, and the `12`-vs-`13` correction this section made is `SUPERSEDED` along with its `eight`.**
3. **THE ILLUSTRATIVE-vs-EXHAUSTIVE RULE (`§17.12`) AND ITS PRECEDENCE ARE UNMOVED, AND THEY ARE WHAT RULES HERE:** *"at the assertion site the `UF_FIXTURE_DECLARATION` literal / the enumeration is the authority, and a prose cell that disagrees with it is RED BY READ"* — applied to THIS SECTION'S OWN FIGURE, which disagreed with the enumeration it cited. **THE `§17.2` FIGURE WAS A PROSE FIGURE; THE ENUMERATION AND THE LITERAL READ `7`.**
4. **EVERY OTHER FIGURE OF THIS SECTION IS UNMOVED:** the `31`/`30` reconciliation, the `35`, the `16 + 9 = 31` split's `OWED` `16`, and the `18`'s status as the kept-visible stale term of the OLD group total's split. **THE FULL SITE REGISTER FOR THIS FIGURE, WITH EACH DEPENDANT ARITHMETIC, IS `§21.3`.** **MEASURED EVIDENCE: greens row `H-9` (`7` + `5` = `12` inside the `31`, `RECORDED READING` of the blind writer's two independent instruments) — the same `7` this subsection's own `VERIFIED-BY-READ` list of the enumeration prints.**

### 17.3 NON-BLOCKING 3 — `§2.1` GROUP 3'S `1`-BECOMES-`2` NOTE IS SELF-REFERRING: EACH COUNT NOW GRADES SOMETHING

**THE FINDING, CONFIRMED BY READ: the note read *"`1` AS FILED BECOMES `2` … membership is still
`user9_search_open_in_tab` alone"* — so the `2` graded NOTHING and the `1` was asserted against its own membership.**

**THE RULING — THE RESTATEMENT, WHICH IS WRITTEN IN PLACE AT `§2.1` GROUP 3:** **THE GROUP HAS ONE `MEMBERSHIP` FIGURE
AND ONE `REVISION` FIGURE, AND THEY GRADE DIFFERENT THINGS.**

1. **`MEMBERSHIP` — `1` KEY, `user9_search_open_in_tab`, `VERIFIED-BY-READ` in the landed declaration literal, BEFORE
   AND AFTER the `§16.1` amendment.** **A gated-population arm asserts THIS figure against the literal.** **The move
   takes `u_edit_1_live_package_table_limitation` to `'corpus-documents'` and to nothing else**, so this group's
   membership is unmoved — **which is the whole content of the filed note, now stated as a figure rather than as a
   direction of change.**
2. **`REVISION` — `2` FIGURES MOVED BY THE AMENDMENT: the gated population `34 → 35` and the `'corpus-documents'` group
   `30 → 31`.** **Both are figures of OTHER groups** (`§16.17` item 2), **and neither touches this group's membership.**
   **A revision figure is graded by the re-derivation table (`§16.17`), never by a membership arm.** **⟨GATE-4 AMENDMENT
   `2026-10-05` — THE SECOND FIGURE IS RECONCILED: the group's movement is `30 → 31`, NOT the filed `24 → 25` (kept
   visible above), because the base at HEAD is `30` and the landing value is `31` (`RECORDED READING`, measurer: the
   supervisor's shell, this pass's evidence; `VERIFIED-BY-READ` against `§16.17` item 2's enumeration — THE AUTHORITY).
   THE `REVISION` COUNT OF `2`, THE POPULATION `34 → 35` AND THIS GROUP'S MEMBERSHIP `1` ARE UNMOVED (`§20`).⟩**
3. **NO COUNT IN THIS GROUP IS READ AS *"`1` becoming `2`"* ANY MORE** (`§3.2`'s grammar has no such movement, and
   `§5.2`'s row for this fixture is unmoved). **The filed note stays visible beside the restatement, dated.**

### 17.4 NON-BLOCKING 4 — `parkedByFixtureAbsence` **vs** `parkedByAbsence`: ONE NAME IS RULED, AND THE PRINTED FIELD IS CONTRACTED

**THE FINDING, CONFIRMED BY READ: `§16.5`/`§5.5` name the new observation member `parkedByFixtureAbsence` while
`§5.5`'s counting clause ALSO writes `parkedByAbsence` for it; and the PRINTED line's field name was uncontracted
anywhere.**

**THE RULING — ONE MEMBER NAME, ONE PRINTED FIELD, AND THE LANDED LABEL CONVENTION ADOPTED BY READ:**

1. **THE MEMBER IS `parkedByFixtureAbsence`.** **`parkedByAbsence` is a TYPO and is `SUPERSEDED`; it is kept visible at
   its own site (`§5.5`'s counting clause) with the annotation pointing here.**
2. **THE PRINTED FIELD IS `parked-by-fixture-absence=` — the HYPHENATED form**, adopted because it is the driver's
   **LANDED convention for the observation's own printed labels** (`VERIFIED-BY-READ` at the print site:
   `parked-by-the-fixture-gate=` and `eligible-and-not-parked=` are the labels the driver prints for the members
   `parkedByGate` and `eligibleAndNotParked`), **so the new member is printed the same way beside them** — and **its
   VALUE is the member's value, printed as an integer beside `parked=` and `parkedByGate=`** (`§16.17` item 6's *"three
   park members, printed together"*).
3. **THE MEMBER'S OWN SEMANTICS ARE UNCHANGED** (`§16.5`: the gated keys parked because their OWN declared fixture read
   absent at `resolved:true`, HOWEVER ROUTED — the gate branch OR the block's own body), and **its relation to the other
   two is the contracted subset chain: `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked`.** **`VERIFIED-BY-READ` at the
   driver's own observation: `parkedByGate` is computed by `r.gateRoute === true` over the gated-keys filter, so a park
   routed from a block's OWN body is outside it — which is exactly why the new member cannot be the gate count and the
   gate count cannot be the new member's floor.**

### 17.5 NON-BLOCKING 5 — NOTHING GRADED THE NEW MEMBER'S PRESENCE OR ROUTE TAG, AND `3×print-site` COVERED **FOUR** SITES

**THE FINDING, TWO HALVES.** **(a) No arm of `§11.2` graded the new observation member `parkedByFixtureAbsence` —
neither its PRESENCE on the observation nor its use as a ROUTE TAG on the `FA-1`/`FA-2` park set.** **(b) The register's
`3×print-site` term names THREE terms over FOUR sites, the fourth being the site inside `print-site:early-paths`.**

**THE RULING — EACH HALF CLOSED BY A NAMED MUTATION, WITH NO REGISTER FIGURE MOVED.**

1. **THE NEW MEMBER'S ASSERTIONS ARE NAMED — AS SUB-LIMBS OF `print-site:post-assignment`, SO THE COUNT STAYS `3×` AND
   THE REGISTER STANDS EXACTLY AS FILED.** **`print-site:observation-members`** is the NAME of this pass's assertion set
   over the printed run-observation line's **three park members** (`parked` · `parkedByGate` ·
   `parkedByFixtureAbsence`, `§16.17` item 6), **and because `§10.2`'s arithmetic is VERIFIED CLEAN AND IS NOT MOVED BY
   THIS PASS, the set RIDES the already-named `print-site:post-assignment` arm as its sub-limb: no arm is added, no `k`
   changes, and `P-TP-4` stays `11`/`3×print-site`.** **THE NAMED DIVERGENCE, SO NO READER HAS TO RECONCILE IT: a
   TestWriter who lands `print-site:observation-members` as the term's OWN FOURTH ARM (in the pin's idiom an arm is a
   literal `arm(run, N, '<class>:<name>')` call, and a fourth arm under the `print-site` class makes the class census
   disagree with the declared `3×`) **MUST re-derive `P-TP-4` to `4×print-site`, the row's budget to `12`, the register
   total to `68` and the executed figure to `58`, with BOTH values visible** (`§10.3` clause 5, `§10.2.4`'s
   declared-vs-executed reporting). **THIS SPEC TAKES THE SUB-LIMB READING; THE FOURTH-ARM READING IS NAMED AND IS THE
   TESTWRITER'S TO TAKE OR REFUSE, WITH ITS FIGURES WRITTEN.** **ITS NAMED MUTATION: DELETE THE
   `parkedByFixtureAbsence` MEMBER FROM THE OBSERVATION'S RETURNED OBJECT (or from the printed line's member list) —
   the sub-limb's arm must go RED.**
2. **THE ROUTE TAG IS GRADED.** **`P-SM-5`'s `falsifier-divergence` term's `FA-1`/`FA-2` arms each carry a NAMED
   MUTATION: strip the `parkedByFixtureAbsence` tag from one of the park's route attributions** (i.e. emit the park so
   the route reads as the gate branch or as a block-own park with no fixture-absence tag) — **the `FA-1`/`FA-2` arm must
   go RED on the (park set, route tag) PAIR**, which is the discriminator `§5.5` `FA-3` states (`§16.5`).
   **NO NEW ARM: the mutation rides the arms that already exist, so `5×falsifier-divergence` stands.**
3. **THE `print-site` RECONCILIATION, STATED AT THE TERM AND AT THE PIN (`§10.2.3`): THREE NAMED TERMS OVER
   `5 + 2` PHYSICAL SITES — WHICH IS WHY *"three terms over four sites"* NO LONGER HOLDS.** **The terms are
   `print-site:early-paths` (a GROUP of the FIVE early sites: the four refusal paths — `--groups=` · ports · `--home` ·
   the `--fixture` refusal — plus the module-level `main().catch` ERROR line, all five asserted for the `none` triple)
   and `print-site:post-assignment` (the two sites the single assignment precedes — `launch-profile` and `summary`),
   which is the filed `print-site:launch-profile` · `print-site:summary` pair GRADED TOGETHER.** **THE COUNT STAYS
   `3×` BECAUSE THE TWO POST-ASSIGNMENT SITES ARE ONE TERM, and the reconciliation is
   `3 terms = 1 group of 5 early sites + 1 fused pair of 2 post-assignment sites + 1`** — **the third term is the
   GROUP term's own subject, so no term counts physical sites at all.** **THE SUPERSEDED PROSE — `§7.2` clause 4's
   *"the `--fixture` refusal's own line … prints the state the same way"* — is corrected by that clause's own gate-2
   bracket (`§16.5`: it prints the `none` triple), and `§7.2`'s *"the `--groups=` refusal remains site `3`"* / *"the
   `--fixture` refusal's own line is the fourth `ARG-REFUSED` form"* are READ AS THE SITE ENUMERATION OF `§7.2`'s
   clause `4`, never as a term count of `§10.2.3`.** **A landing pass that SPLITS the two post-assignment sites
   declares `4×print-site`, `P-TP-4` `12`, total `68`/executed `58`, with both values visible** (`§17.5` clause 1's
   named divergence). **⟨GATE-5 AMENDMENT `2026-10-05` — THIS CLAUSE'S OWN PARENTHETICAL ABOVE (`plus the module-level `main().catch` ERROR line, all five asserted for the `none` triple`) IS `SUPERSEDED` IN ITS TAIL: THE FIVE-EARLY-SITE CENSUS STANDS AND THE `main().catch` SITE IS ASSERTED FOR **THE STATE THE BINDING HOLDS AT THE ABORT**, NEVER FOR THE `none` TRIPLE ALONE (`§21.1` clause 3; greens row `F-8`, fail ledger `F-2`). THE TERM'S NAME, THE `3×` COUNT, THE FUSED POST-ASSIGNMENT PAIR AND THE `5 + 2` PHYSICAL CENSUS ARE UNMOVED.⟩**
4. **THE COUNT OF PHYSICAL SITES IS `5 + 2` AND IS NAMED SO IT IS NOT RE-DERIVED BY EYE:** **the five early sites are
   the four refusal paths (`--groups=` empty value · the ports refusal · the `--home` refusal · the `--fixture` refusal)
   plus the `main().catch` ERROR line; the two post-assignment sites are the `LAUNCH PROFILE` line and the summary
   line.** **`VERIFIED-BY-READ` of `§7.2`'s clause 4 and `§11.2`'s `PRINT-SITE` row.**

### 17.6 NON-BLOCKING 6 — THE PRINTED ROOT AND THE `mock-data-set` LABELS ARE NOW CONTRACTED, EACH WITH A MUTATION

**THE FINDING, TWO HALVES.** **(a) The MATERIALISATION ROOT as printed text (`§16.4`/`§7.3` `D-3` — the root must be
printed as text, not carried as a fourth member) had NO NAMED ARM and NO NAMED MUTATION.** **(b) The
`mock-data-set` branch's PRINTED LABELS were uncontracted** — while `§16.12` rules that the `none`-form tooth grades the
OBJECT's members (`state`/`kind`/`id`), **so under a mock set the printed labels `fixtureState=` · `fixtureKind=` ·
`fixtureId=` were the ONLY contracted form of the state and nothing asserted them.**

**THE RULING — THE CONTRACTED FORMS, EACH AS A NAMED SUB-LIMB OF AN ALREADY-COUNTED ARM:**

1. **THE PRINTED ROOT'S CONTRACTED TEXT.** **At each of the TWO post-assignment sites the printed statement carries the
   root as text BESIDE the state: the launch-profile/summary statement carries `fixtureRoot=<root>`-shaped text whose
   value is the selected set's own directory `.live-fixture/<id>/`** (`§2.3` clause 1, `§2.4`), **derived at print time
   from `id` plus the mode**; **and where the mode skipped the materialisation (`--connect`, `§4` `S-5`) the same
   field carries the *"not materialised"* RECORD instead of a path** (`§16.4`). **`OWED`: the exact spelling is the
   landing pass's (`§13.3` item 7), and `D-3` grades the FIELD'S PRESENCE and ITS VALUE SHAPE, never a sentence.**
2. **ITS SUB-LIMB AND MUTATION.** **The sub-limb rides `print-site:post-assignment`** (the two sites, graded together):
   **`D-3` is asserted as the presence of the root field with a `.live-fixture/<fixtureId>/`-shaped value at BOTH
   post-assignment sites, AND as the ABSENCE of that field at every EARLY site** (the early sites print `none` because
   the assignment sits after the refusals, `§16.5` — so a root printed there would be a root for a set the run never
   selected). **ITS NAMED MUTATIONS: (i) DELETE the root field from the launch-profile statement — the
   `print-site:post-assignment` arm must go RED; (ii) PLANT a root field on a refusal line — the
   `print-site:early-paths` arm must go RED.** **NO NEW ARM, NO REGISTER FIGURE MOVED.**
3. **THE `mock-data-set` PRINTED LABELS ARE CONTRACTED, EXACTLY AS THE `none` TRIPLE IS.** **On a `mock-data-set` run
   the printed line carries the three LABELS `fixtureState=` · `fixtureKind=` · `fixtureId=` with the values
   `'mock data set <setName> selected'` · `'mock-data-set'` · `<setName>`** (`§7.1`'s member table; **the `none` triple
   is `state`/`kind`/`id` = `'no fixture data set selected'`/`'none'`/`'none'`, graded on the OBJECT, `§16.12`).
   **THE THREE LABELS ARE ASSERTED AT `print-site:post-assignment`** (the labels are the PRINTED line's subject, which
   is exactly what `§16.12` reserves the label spelling for), **and each label carries a NAMED MUTATION: (i) delete
   `fixtureState=`'s interpolation; (ii) delete `fixtureKind=`'s; (iii) delete `fixtureId=`'s** — **the arm must go RED
   on each**, which closes the gap that the object-member tooth (limb 2) cannot see: **a label that stops being printed
   leaves the OBJECT intact, so only a print-site arm can catch it.**

### 17.7 NON-BLOCKING 7 — THE MISSING MUTATIONS OF `2×probe-population` AND `3×probe-read` ARE NAMED

**THE FINDING, TWO HALVES.** **(a) `2×probe-population` carried a direction-2 mutation (`A-5.vi`'s plant of
`'uf-no-such-declared-fixture'`, `§16.16`), but DIRECTION 1 — `probe-population:gated-name-has-read` — had NO MUTATION
that exercises its own `read: null` case.** **(b) `3×probe-read`'s filed mutation covers only TWO of the three arms: the
`probe-read:corpus-documents` arm had no mutation of its own named at its arm.**

**THE RULING — EVERY ARM NOW NAMES ITS OWN MUTATION, AND NO COUNT MOVES.**

1. **`probe-population:gated-name-has-read` (DIRECTION 1 — a gated name with no read must be an OFFENCE).** **ITS NAMED
   MUTATION: set a GATED fixture name's registry `read` to `null`** (`'corpus-query-results'` or
   `'corpus-document-tabs'` — either, since both are gated and both must carry a non-null read) — **the arm must go
   RED with the offence *"declared fixture name(s) carrying NO registry probe"*-shaped**, which is the
   `gated-name-has-read` direction's own offence text. **`VERIFIED-BY-READ` at the pin: the registry is read by the arm,
   so the mutation is built on the SOURCE LITERAL and the arm's own reader sees it.**
2. **`probe-read:corpus-documents` (THE THIRD ARM).** **ITS NAMED MUTATION: point the `'corpus-documents'` entry at
   either `'dom:'` sentinel** (`'dom:#pane-search li[data-document-id]'` or `'dom:#tab-strip .tab[data-document-id]'`) —
   **the arm must go RED on the exact-string comparison**, and the `'dom:'` prefix would in any case make the store-probe
   read a DOM read, which the dispatch discriminates. **This is the mutation `§16.8`'s table named for this arm and
   `§11.2`'s own row did not repeat at the arm; it is now named here and at the arm.**
3. **`3×probe-read`'s OTHER TWO MUTATIONS ARE UNCHANGED** (`§16.8`): `'corpus-document-tabs'` back to
   `'rag.list_documents'` or the superseded `[data-target-kind="document"]` spelling; `'corpus-documents'` pointed at
   either `'dom:'` sentinel. **⟨GATE-2 THIRD LOOP `2026-10-05` — THE THIRD MUTATION THIS CLAUSE CARRIED, *"`'corpus-query-results'`
   back to `'rag.list_documents'` (the `F-2` state) or one altered character"*, IS RE-STATED AND SPLIT IN TWO, BOTH ITEMS
   RIDING THE SAME ARM (`§18.2` clause 7): **(i)** `'rag.query'` → `'rag.list_documents'` — the `F-2` state, which makes
   this probe a second `pre` read and turns the `tabs` reading into a false park; **(ii)** THE FIRST LOOP'S COMPOUND LIMB
   RESTORED — a `'dom:'` literal for this name PLUS its *"at least one result row is PAINTED"* conjunct — which makes the
   probe read absent in EVERY run (`§18.1` clause 3) and therefore cannot separate `search` from `tabs`.** **NO NEW ARM:
   both ride `probe-read:corpus-query-results`, so `3×probe-read` stands (`§18.6`).**⟩**
4. **`2×probe-population` DIRECTION 2's MUTATION IS UNCHANGED AND STILL MUST BITE** (`§16.16`): PLANT
   `'uf-no-such-declared-fixture'` and REQUIRE the offence *"registry probe key(s) no declaration entry names: …"*.
   **ALL FOUR MUTATIONS RIDE THE ARMS THE REGISTER ALREADY COUNTS, so `3×probe-read` and `2×probe-population` stand.**

### 17.8 NON-BLOCKING 8 — `§16.7` CLAUSE 3 CITED *"`S-5`'s cell"*: THE EMPTY-SET READING IS **`S-4`**

**THE FINDING, CONFIRMED BY READ: `§16.7` clause 3 read *"`§2.3` clause 2 and `S-5`'s cell are read as the run's own SET
was not materialised"*, but `S-5` is *`--connect` WITH A SELECTED SET* — where the MATERIALISATION RUNS and only the
IMPORT is skipped — while the empty-set reading is **`S-4`**: `§4`'s table defines `S-4` as *THE SET IS `empty`* (*"no
import is attempted at all (the set has no files)"*), and `§6.4` clause 2 agrees** (*"the `empty` SET IS NOT EXEMPT …
the state would say the empty fixture set was selected while the old route populated the store"*).

**THE RULING: THE CITATION IS CORRECTED TO `S-4`, AT THE CLAUSE, WITH THE FILED `S-5` KEPT VISIBLE.** **`§16.7`
clause 3's own bracket now reads `S-4`** (`§17.8`'s correction is written into that clause's annotation), **and the
`S-4`/`S-5` distinction is named there so the two cells cannot be conflated again: `S-4` materialises NO SET FILES and
writes no import; `S-5` MATERIALISES THE SET and skips the IMPORT.** **NO OTHER SITE CITES `S-5` FOR THE EMPTY-SET
READING** (`VERIFIED-BY-READ` of `§2.3` clause 6, `§4`, `§6.4` and `§11.3`).

### 17.9 NON-BLOCKING 9 — `§10.2.3`'s `state-member:state|kind|id` LABELS vs `§10.2.5`'s KEYING: THE MINIMA ARE KEYED ON THE **PREFIX**

**THE FINDING, CONFIRMED BY READ: `§10.2.3` labels the three arms `state-member:state` · `state-member:kind` ·
`state-member:id`, while `§10.2.5` requires `DECLARED_CLASS_MINIMUMS` entries for each declared class — a reader could
build a record keyed on the whole arm label and the pin would read it as a MISS.**

**THE RULING — THE MINIMA ARE KEYED ON THE CLASS **PREFIX** (`state-member`), STATED IN `§10.2.5` AND HERE.**
**`VERIFIED-BY-READ` of the pin's consumer: `declaredFactorClassOffences` resolves a minima key through
`named.get(cls)`, where `named` is built from the DECLARED STRING's own class terms — so the key is the CLASS TEXT
(the substring before the `:` in an arm label), never a whole arm label**; **the class side is read from the census as
`census.executedClasses.get(cls)`.** **CONSEQUENTLY:** **`P-TP-4`'s record is
`{ 'state-member': 3, 'state-derivation': 3, 'print-site': 3, 'state-consequence': 2 }`** — **one key per class, its
value the row's own `k`** — **and *"the `state-member` PREFIX"* is the keyspace** (`§10.2.3`'s three names are ARM
labels: the class plus the member that arm grades). **A record keyed `'state-member:state'` matches NO declared term and
degrades to a silent no-floor** (the `?? {}` vacuity hazard `§10.2.5` names) — **which is exactly the trap this ruling
closes.** **NO ARM NAME IS REWRITTEN; both spellings are consistent under this keyspace rule.**

### 17.10 NON-BLOCKING 10 — THE GRAMMAR NOTE IS GIVEN A CITABLE ID: **`N-10-GRAMMAR`**, AND `§16.10` IS ITS RECORD

**THE FINDING, CONFIRMED BY READ: `§16.10`'s grammar note (the `(… + 0×class-(b))` spelling binds only the three
zero-budget rows; the universal is the IDENTITY `declaredLastTermOf === declaredClassB`) sits INSIDE a paragraph as its
tail, with no id of its own, so a landing pass cannot cite it without quoting a sentence.**

**THE RULING: THE NOTE HAS THE ID `N-10-GRAMMAR` AND `§16.10` IS ITS CITED RECORD** (`§16.10`'s own
illustrative-vs-exhaustive ruling and this note are two items of one subsection, and **the paragraph IS the record** —
no new heading is minted, on the standing precedent that a labelled paragraph is a citable site in this family of
specs: `RCA-8(c)`'s record-not-renumber discipline). **A landing pass cites `§16.10`'s `N-10-GRAMMAR`**; **a citation to
`§10.2.3` for the same correction is also valid** (the correction is written in place there too, `§16.10`).
**`VERIFIED-BY-READ`: the four declared strings already satisfy the identity — `0`/`0`/`0`/`10` — so `N-10-GRAMMAR`
changes no string, no term and no total.** **⟨GATE-3 AMENDMENT `2026-10-05` — THE CLAIM IMMEDIATELY ABOVE IS `SUPERSEDED` AND
IS KEPT VISIBLE: *"the four declared strings already satisfy the identity — `0`/`0`/`0`/`10`"* WAS FALSE ON ITS `10` LIMB. The
pin's own `declaredLastTermOf` returned `2` for the filed `P-TP-5` string, so the note was right about the RULE and wrong about
the STRING. `N-10-GRAMMAR`'s UNIVERSAL (THE IDENTITY) STANDS UNCHANGED; the `P-TP-5` STRING MOVES ONE TERM (`§10.2.3`'s gate-3
block), and it is the spelling — not the rule and not the id — that changes.⟩**

### 17.11 NON-BLOCKING 11 — ONE STRING FOR THE NOT-MATERIALISED READING: **`no SET was materialised`**

**THE FINDING, CONFIRMED BY READ: `§16.7` clause 3 re-words the reading as *"the run's own SET was not materialised"*
while `§11.3` item 8's own gate-2 bracket reads *"no set materialised"* and `§16.7` clause 3 ALSO refers to item 8's
*"nothing written"* — three strings for one reading, and one of them (`nothing written`) is a DIFFERENT claim.**

**THE RULING — ONE STRING, ONE MEANING, AND THE STRUCK PHRASE NAMED:**

1. **THE READING'S STRING IS `no SET was materialised`.** **`§11.3` item 8 (`no set materialised`), `§16.7` clause 3
   (`the run's own SET was not materialised`) and this clause all name the SAME string**, and **the arm that grades it
   (`class-(b):two-supply-refusal`'s reading, and `class-(b):empty`'s) grades THAT string, verbatim.**
2. **`nothing written` IS STRUCK AS A NAME FOR IT.** **"Nothing written" is TRUE of a REFUSED run only
   (`§3.3` clause 4: no directory, no removal, no artifact) — and FALSE of an `S-4`/`empty` run, whose three
   `selfProvisioning:true` blocks still write their own documents through the `§16.7` resolver.** **THE TWO CLAIMS ARE
   THEREFORE TWO CLAIMS: *"a refused run writes nothing at all"* (`§3.3` clause 4) and *"no SET was materialised"*
   (`S-4`)** — **the first is about a refusal, the second about a selected set with no files, and they are never
   collapsed again** (`§4` `S-4`; `§17.8`'s `S-4`-not-`S-5` correction).
3. **`§11.3` item 8's filed `no set materialised` remains its own cell's wording and is READ AS THE SAME STRING** (case
   differs; the arm grades the run's own printed text, and the printed text is the landing pass's — **`OWED`**).

### 17.12 NON-BLOCKING 12 — AT THE ASSERTION SITE THE **DECLARATION LITERAL** IS AUTHORITATIVE, NEVER A PROSE INVENTORY

**THE FINDING, CONFIRMED BY READ: `§16.10` rules *"the inventory is ILLUSTRATIVE"* while `§5.2`'s cell claims it
*"names all `25`"* — two rules over one population, with no statement of WHICH governs when an arm needs the
population.**

**THE RULING, IN ONE CLAUSE SO AN ARM CAN BE WRITTEN FROM IT:** **AT THE ASSERTION SITE THE `UF_FIXTURE_DECLARATION`
LITERAL IS THE EXHAUSTIVE AUTHORITY AND EVERY PROSE INVENTORY — `§2.1`'s `F-1` list, `§5.2`'s population cells, `§16.9`'s
corrected inventory, `§16.10`'s reading — IS ILLUSTRATIVE.** **Every arm that needs a population DERIVES it from the
literal** (`§16.10`'s own ruling, confirmed), **and a prose cell that disagrees with the literal is `RED` BY READ and is
corrected at the cell — never the literal.** **CONSEQUENCE FOR `§5.2`'s CELL, STATED PLAINLY: its *"names all `31`"*
is a claim about the CELL (the `31` being carried by the same sentence's `§16.1` amendment clause), and the cell's
filed ENUMERATION lacked one key and mis-counted the `stage_*` family by one (`§17.2`); the arm reads the LITERAL, the
cell is corrected in place, and the `31` itself stands (`§16.17` item 2 is its exhaustive key list).** **⟨GATE-4
AMENDMENT `2026-10-05` — THE FIGURES IN THIS CONSEQUENCE CLAUSE ARE RECONCILED (`31`, NOT the filed `25` kept visible
above), AND THE RULING ITSELF IS WHAT MADE THE RECONCILIATION NECESSARY RATHER THAN OPTIONAL: **THE ENUMERATION AND THE
LITERAL ARE THE AUTHORITY** — `§16.17` item 2 reads `31` (`VERIFIED-BY-READ`) and the measured declaration census
agrees (`RECORDED READING`, measurer: the supervisor's shell, this pass's evidence). **THE CLAUSE'S RULE IS UNMOVED:**
a prose cell answers to the literal, never the reverse; only the cell's own figure moved, and it moved TO the figure the
enumeration prints (`§20`).⟩** **AND THE
DERIVATION IS CHECKABLE BECAUSE THE LITERAL IS PURE DATA** (`VERIFIED-BY-READ`: the pin's own readers parse the
declaration region and the registry region as literals, and the fixture register's arms re-derive the gated population
through `corpusRead === true && selfProvisioning === false` — never through a prose cell).

### 17.13 NON-BLOCKING 13 — THIS PASS'S OWN RE-DERIVED FIGURES, FOR A TESTWRITER, WITH THE LINE CENSUS RE-TAKEN

**THIS SUBSECTION IS THE SECOND LOOP'S `§16.17`-SHAPED TABLE: WHAT A TESTWRITER NOW READS AFTER THIS AMENDMENT, AND
WHAT THIS PASS COULD NOT SETTLE. Every figure is `VERIFIED-BY-READ` (reader: this pass, at the site it names) unless it
says `RECORDED READING` or `OWED`.**

1. **THE POPULATION (`§17.1`): `35 = 47 − 3 − 9`** — `'corpus-documents'` `31` · `'corpus-query-results'` `3` ·
   `'corpus-document-tabs'` `1` · the two never-gated names `0` each. **`§16.17` item 2's key list is the exhaustive
   one; `§17.1` clause 3 is the arithmetic's site.** **⟨GATE-4 AMENDMENT `2026-10-05` — `31`, NOT `25`: the per-name
   figure is reconciled on the ARCHITECT'S RULING over the measured declaration census (`RECORDED READING`, measurer:
   the supervisor's shell, this pass's evidence) and CORROBORATED `VERIFIED-BY-READ` against `§16.17` item 2's own
   enumeration, WHICH IS THE AUTHORITY the stale figure answered to. `25` IS `SUPERSEDED` and is kept visible above; the
   `35`, the `3` and the `1` are UNMOVED (`§20`).⟩**
2. **THE STAGE FAMILY (`§17.2`): `eight` `stage_*` + `five` `o0_*` = `13`; the hand-listed/entered split is
   `16 + 9 = 31`. **⟨GATE-4 AMENDMENT `2026-10-05`: THIS ITEM'S SPLIT IS RECONCILED, QUOTED SUPERSEDED AND LABELLED. The
   filed sub-count *"`16` hand-listed"* CANNOT BE RE-DERIVED from `§16.17` item 2's enumeration as written and is **`OWED`**;
   the total it must reach is **`31`** (`RECORDED READING`, measurer: the supervisor's shell, this pass's evidence;
   `VERIFIED-BY-READ` against the enumeration — THE AUTHORITY). **The enumeration's own family tokens reproduce the total:
   `stage_*` `8` + `o0_*` `5` = `13`, leaving `18` in the remainder (`VERIFIED-BY-READ` by subtraction), and
   `13 + 18 = 31`.** **The filed `16 + 9 = 25` and the filed split itself are `SUPERSEDED` and are kept visible in the
   sentence above** (`§20`). **THE `eight`/`five`/`13` FAMILY FIGURES AND THE `seven`-vs-`eight` CORRECTION ARE
   UNMOVED.**⟩** **⟨GATE-5 AMENDMENT `2026-10-05` — THE SENTENCE IMMEDIATELY ABOVE IS `SUPERSEDED` AND KEPT VISIBLE: the `stage_*`/`o0_*`/`13`/`18` figures ARE moved. THE BINDING READING OF THIS ITEM: **`stage_*` `7` + `o0_*` `5` = `12`, leaving `19` in the remainder, and `12 + 19 = 31`** — the enumeration's own tokens, the declaration's measured census (greens row `H-9`, fail ledger `F-4`) and the `§16.17` item 2 correction all agree on `7`. `13` SURVIVES ONLY AS THE DECLARED `stage_*` FAMILY CENSUS (`8` DECLARED KEYS, one of them never-gated) BESIDE THE `5` `o0_*`; INSIDE THE `31` IT IS `12`. THE `16 + 9 = 31` SPLIT, THE `35` AND THE `'corpus-documents'` `31` ARE UNMOVED.⟩**
   **The filed `seven` and its implied `12` are `SUPERSEDED` and kept visible at `§5.2`'s cell.** **⟨GATE-5 AMENDMENT `2026-10-05` — THIS SENTENCE IS `SUPERSEDED` AND KEPT VISIBLE: the filed `seven` WAS CORRECT AND ITS `12` IS THE BINDING GATED FAMILY FIGURE (`§21.3`).⟩**
3. **THE GROUP FIGURES (`§17.3`): `'corpus-document-tabs'` MEMBERSHIP `1` (before and after the amendment) ·
   REVISION `2` figures (the population and the `'corpus-documents'` group).**
4. **THE OBSERVATION's MEMBER AND FIELD (`§17.4`): the member is `parkedByFixtureAbsence`; the printed field is
   `parked-by-fixture-absence=`; the subset chain is `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked`.**
   **`parkedByAbsence` is `SUPERSEDED` (a typo, kept visible in `§5.5`).**
5. **THE ARMS AND MUTATIONS ADDED BY THIS PASS, NONE OF WHICH MOVES A REGISTER FIGURE** (each rides an arm the register
   already counts — `§17.1`'s standing statement): **`print-site:observation-members`** (the `4×print-site` divergence,
   named, `§17.5` clause 1) · the `FA-1`/`FA-2` **route-tag mutations** (`§17.5` clause 2) · the `D-3` root sub-limb's
   **two mutations** (delete the root field; plant one on a refusal line, `§17.6` clause 2) · the `mock-data-set`
   label asserts' **three mutations** (`§17.6` clause 3) · `probe-population:gated-name-has-read`'s **`read: null`
   mutation** (`§17.7` clause 1) · `probe-read:corpus-documents`'s **`'dom:'`-sentinel mutation** (`§17.7` clause 2).
6. **THE PRINT-SITE RECONCILIATION (`§17.5` clause 3): `3` NAMED TERMS over `5` early sites + `2` post-assignment
   sites.** **A landing pass that splits the post-assignment pair declares `4×print-site`, `P-TP-4` `12`, total `68`
   (executed `58`), with both values visible.**
7. **THE CITATION CORRECTION (`§17.8`): the empty-set reading is `S-4`'s cell; `S-5` is `--connect` with a selected
   set.**
8. **THE MINIMA KEYSPACE (`§17.9`): key on the CLASS PREFIX — `P-TP-4`'s record is
   `{ 'state-member': 3, 'state-derivation': 3, 'print-site': 3, 'state-consequence': 2 }`.**
9. **THE GRAMMAR NOTE'S ID (`§17.10`): `N-10-GRAMMAR`; `§16.10` (and `§10.2.3`'s in-place correction) is its cited
   record; the identity is `declaredLastTermOf === declaredClassB`, satisfied `0`/`0`/`0`/`10`.** **⟨GATE-3 AMENDMENT `2026-10-05`:
RE-READ AS *"satisfied `0`/`0`/`0`/`10` ON THE AMENDED SPELLING"* — on the spelling filed at that time the pin's reader returned
`2` for `P-TP-5`, which is the defect `§10.2.3`'s gate-3 block closes by moving ONE TERM into the deepest group. The id, its
cited record, and the universal are unchanged.⟩**
10. **THE NOT-MATERIALISED STRING (`§17.11`): `no SET was materialised`; `nothing written` is `STRUCK` as a name for
    it and belongs to `§3.3` clause 4's refused-run claim.**
11. **THE AUTHORITY AT THE ASSERTION SITE (`§17.12`): the declaration LITERAL; every inventory cell is illustrative.**
12. **THE REGISTER, QUOTED UNCHANGED SO NO READER RE-DERIVES IT (`§10.2`, `§16.17` item 7, verified clean by the second
    run): rows `P-IM-6` `17` · `P-SM-5` `12` · `P-TP-4` `11` · `P-TP-5` `27`; TOTAL `17 + 12 + 11 + 27 = 67`;
    EXECUTED `57`; caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows; seed `0x20261005`.** **THE `4×print-site` READING OF
    `§17.5` clause 1 IS THE ONE DIVERGENCE THIS PASS NAMES AND DOES NOT TAKE.**
13. **WHAT THIS PASS COULD NOT SETTLE (`§13.3` item 7's gate-2 list, extended):** **(a) the `fixtureRoot=`-shaped text's
    exact spelling is `OWED` to the landing pass** (`§17.6` clause 1); **(b) whether the TestWriter lands
    `print-site:observation-members` as the term's fourth arm (re-deriving `P-TP-4` to `12`, total `68`, executed `58`)
    or as a sub-limb of `print-site:post-assignment` (register frozen at `11`/`67`/`57`) is `OWED` to the TestWriter,
    with BOTH values visible either way** (`§10.3` clause 5, `§17.5` clause 1); **(c) the four `S-4`/`S-5`-adjacent
    strings of `§4`'s table are the landing pass's to print, and the gradeable string of `§17.11` is
    `no SET was materialised`.**
14. **THE LINE-COUNT CENSUS, RE-TAKEN BY THIS PASS** — `VERIFIED-BY-READ` (reader: this pass, the file-read tool's own
    line census, taken after this section's last edit): **`2225` lines**, against the `1749` of the gate-2 first-loop
    amendment (`§16.17` item 10, kept visible and `SUPERSEDED`) and the `1074` of the filed head (`§14` item 2).
    **IT IS AN OBSERVATION, NOT A PIN**: a later amendment moves it, and a landing pass must take its own census.
    **THE `sha256` REMAINS `OWED` (`§14` item 1) — this pass holds no shell and took no digest.** **⟨GATE-2 THIRD LOOP
    `2026-10-05` — THIS FIGURE IS `SUPERSEDED` BY `§18.8` item 1's RE-TAKEN CENSUS (**`2652` lines** at the gate-2 third
    loop's close, re-taken after that pass's last edit) **AND IS KEPT VISIBLE HERE, NOT REWRITTEN**: `§18.8` item 1 is the
    current census. The `sha256` STILL stays `OWED`.**⟩** **⟨GATE-3 AMENDMENT `2026-10-05`: `§18.8` item 1's census is itself superseded by this pass's re-taken census (`§18.8` item 1's gate-3 marker), and the `sha256`/`md5` of the pre-amendment `2652`-line file (`RECORDED READING`, `§14` item 1) are `SUPERSEDED` and `OWED` again after this pass's edit.⟩**

---

## 18. ⟨GATE-2 THIRD LOOP `2026-10-05`⟩ THE THIRD SPEC-REVIEW PASS'S REGISTER — **ONE BLOCKING FINDING** (CLOSED ANNOTATE-BESIDE AT `§18.1`–`§18.6`) **+ THREE PARKED RESIDUES** (`§18.7`) — **NO FOURTH AMENDMENT ROUND IS OWED**

**THE VERDICT THIS SECTION ANSWERS: `SPEC-NEEDS-AMENDMENT` — and the review ruled BOTH that the finding is the ONLY blocking
item and that `§17`'s thirteen closures were otherwise confirmed, AND that THE CONTRACT CANNOT BE FROZEN until this one item
is closed, because the two arms it leaves ambiguous are MUTUALLY EXCLUSIVE and one of them (`class-(b):tabs`) cannot be
green as written.** **THIS PASS IS A DOC-LAYER PASS: it holds read/search + doc-writes, RAN NOTHING (no suite, no leg, no
battery, no `md5sum`/`sha256sum`, no `wc -l`), and touched no `scripts/**`, `tests/**` or `src/**` byte.** **NOTHING HERE IS
A NEW `SPEC-CALL` UNLESS IT SAYS SO** — it rules between readings the filed text already contained, names the reading of
record, marks the loser `SUPERSEDED` **wherever the loser is visible**, and re-derives every figure that hung on the loser.
**AND NO FIGURE HUNG ON IT: see `§18.6`, where `NONE MOVED` is stated and enumerated.**

**THE BLOCKING FINDING, IN ONE PARAGRAPH (`VERIFIED-BY-READ` at `§5.5`'s `FA-2`, `§11.3` item 4, `§5.2` clause 3, `§11.3`
item 1, and — for the tree side — the driver's own `ufPaneSearch`, its pane-search rows read, the renderer's `searchContent`
and the renderer's `search` pane registration):** **`§5.5`'s `FA-2` and `§11.3` item 4 REQUIRED THE `--fixture=tabs` RUN TO
BEHAVE IN TWO MUTUALLY EXCLUSIVE WAYS AT ONCE — the `'corpus-query-results'`-gated keys RUN (because the fixture's store
carries the probe term) AND those same keys PARK by fixture-absence (because the probe's DOM read is `present:false`) — so
the two arms could not both be green and the contract could not be frozen on them.** **THE FINDING STANDS; THIS PASS
CLOSES IT BY DEFINING THE PROBE'S READ POINT AND GIVING `'corpus-query-results'` A DISCRIMINATING LIMB (`§18.2`), WHICH IS
THE CLOSING SHAPE THE REVIEW NAMED.**

### 18.1 THE PROBE'S READ POINT — the PRE-GESTURE point, defined once so every predicate in this file can be read against it

**THE DEFINITION OF RECORD, FIVE CLAUSES. EVERY PROBE CLAUSE IN THIS FILE — `§5.2` clauses 1–3, `§5.5`'s `FA-1`…`FA-5`,
`§11.3` items 1–5 — READS AGAINST THIS POINT AND NO OTHER.**

1. **THE READ POINT IS `PRE-GESTURE`: THE PROBE TAKES ITS READING BEFORE ITS OWN BLOCK'S SETUP BODY HAS PERFORMED ANY
   GESTURE THAT COULD PAINT THE SURFACE IT READS.** **`VERIFIED-BY-READ` at the driver: the gate calls
   `ufFixturePreconditionRead(h, opt, declared.fixtureName)` from `ufRunBlock`'s fixture-absent branch head, i.e. BEFORE
   the block's own body runs (`§5.2` clause 2's gate predicate is evaluated there, `VERIFIED-BY-READ` at the branch and at
   the probe's own call site), so *"pre-gesture"* means **the state the run is in when the BLOCK ASKING THE QUESTION has not
   yet run**.** **A PROBE IS THEREFORE *NOT* A READING OF THE SURFACE A GESTURE-DRIVEN BLOCK LATER PRODUCES, and a block's
   own painted rows are the BLOCK's subject, never the fixture's answer.**
2. **THE PROBE PERFORMS NO GESTURE OF ITS OWN, AND THAT IS A HARD LIMB.** **It opens nothing, expands nothing, focuses
   nothing, submits nothing and writes nothing to the DOM.** **The pre-existing limb stands unchanged (`§5.3` clause 3,
   `A-9`'s scope limb): the pane's own view/expanded state is never made a precondition of a block running.** **A probe
   that opened the surface to make its own question answerable would report its own gesture as the fixture's presence —
   the exact `§5.1` clause 1 offence in the other direction.**
3. **THE DOM CONSEQUENCE, STATED BECAUSE IT IS WHAT MAKES THE COLLISION REAL AND IS WHAT THE FIRST LOOP MISSED:
   UNDER `--fixture=search` AND `--fixture=tabs` ALIKE, THE PRE-GESTURE COUNT OF `#pane-search li[data-document-id]` IS
   `0`.** **`VERIFIED-BY-READ`, two independent sites:** **(a) the driver's own pane-search drive is a GESTURE
   (`ufPaneSearch` real-clicks `#advanced-search-toggle`, focuses `#pane-search-input`, sets its value and real-clicks
   `#advanced-search-submit`, ONLY THEN reading `#pane-search li[data-document-id]`) — so a run in which no search gesture
   has happened has no painted row for `ufPaneSearch` to read; and (b) the renderer paints those rows from the pane's
   stored query result (`sidebar-panes` registers the `search` pane with `searchContent(ctx, this.lastQueryResult, …)`,
   whose result list is populated by a submit), so **at boot the result list is empty and the pane renders its empty state
   — the rows exist only after a submit**. **CONSEQUENCE, NAMED: ANY `'corpus-query-results'` PREDICATE THAT REQUIRES A
   PAINTED ROW IS FALSE IN **EVERY** RUN AT THIS POINT, `core` AND `table` INCLUDED — so it cannot separate `search` from
   `tabs`, and `FA-4` (`--fixture=core`, *"both probes present"*) could not be exhibited either.** **THIS IS THE COLLISION
   THE REVIEW FOUND, AND IT IS A PROPERTY OF THE READ POINT, NOT OF EITHER SET.**

   **⟨GATE-5 RULING `2026-10-05` — THIS CLAUSE'S PREMISE ABOUT THE `'corpus-document-tabs'` PROBE IS `REFUTED BY MEASUREMENT` AND IS `SUPERSEDED`; ITS FILED TEXT IS KEPT VISIBLE ABOVE AND IS NOT REWRITTEN.** **THE FILED SUB-CLAUSE IS: *"the strip is painted at boot, so the count discriminates between the sets (`core`/`table`/`search` leave a document tab open at launch; `tabs` does not)"* (`§18.2` clause 1's `'corpus-document-tabs'` bullet, `§5.2`'s `'corpus-document-tabs'` cell, `§2.1` `F-4`, `§2.2` P-θ).** **THE MEASURED READING: at the probe's OWN pre-gesture read point under any set at this head, the strip holds ONE **NON-DOCUMENT** `landing` tab — so the premise *"`core`/`table`/`search` leave a document tab open at launch"* is FALSE, and the contrast's other half (*"`tabs` does not"*) is no contrast at all: **NO DOCUMENT TAB EXISTS AT THAT POINT UNDER ANY SET.**** **AND THE INSTRUMENT IS BLIND ON THE AXIS ITSELF, WHICH IS THE STRONGER FACT: `src/renderer/tab-strip.ts` authors only `data-tab-id` + `data-target-kind` — the literal `data-document-id` exists in `src/renderer/pane-graph.ts` for **PANES**, never on `#tab-strip .tab` — so `dom:#tab-strip .tab[data-document-id]` CAN NEVER MATCH at this head (`RECORDED READING`, measurer: the implementer's diagnosis at this head; its live counterpart is the greens' `E-7`, whose `0 rendered row(s)` reads identically in every set).** **THE DISPOSITION IS A SKIP, NOT A REWORDING: the `corpus-document-tabs` limb is **SKIPPED-BY-RULING** and **IS NOT A PASS**, with its reason recorded and its exemption named at `§22.3` (the tab strip is a fork UI implementation being rebuilt on the foundation tooling; the adopting unit is `docs/specs/unit-zone-replacement.md`).** **`§18.6` clause 3's FALSIFIER IS **UNCHANGED** AND KEEPS ITS THIRD LIMB AS FILED — the ruling changes the DATA's form and the LIMB's status, never the READING (`§22.2` item 2, `§22.4` item 3).** **CLAUSES 1, 2, 4 AND 5 OF THIS SECTION ARE UNTOUCHED.**⟩**
4. **THE STORE QUERY AT THE SAME POINT IS WELL DEFINED AND GESTURE-FREE.** **It is an MCP read (`h.mcpRead`, the driver's
   own discriminated read), so it depends on **nothing** the renderer has painted, opened or expanded**: it asks the STORE a
   question about the CORPUS, which the launch's import has already loaded by the time a block's gate read runs.
   **`VERIFIED-BY-READ` at the driver's own idiom: MCP reads are taken this way throughout (e.g. `rag.list_documents` in
   `ufBlockPrecondition`/`ufSelfProvisionImport`), and the same idiom carries a query for a term (`rag.query` is called
   with `{ query }`-shaped arguments at many driver sites).**
5. **THE ONE THING THE READ POINT DOES *NOT* FIX, NAMED SO IT IS NOT MISTAKEN FOR SOLID:** **the store query reads THE
   WHOLE STORE, not only the selected set's documents** — so a document OUTSIDE the fixture that happens to carry the
   probe's term would read `present:true` for a set that does not carry it. **`VERIFIED-BY-READ`, the risk is bounded to
   nothing in these five sets:** the term is a fixture-specific marker (`§5.3` clause 1), `search` **omits it by
   construction** (`§2.1` `F-3`, `§2.2` P-δ), and the only documents a run writes outside its set are the self-provisioned
   documents of the `selfProvisioning:true` blocks (`§16.7` clause 4) — whose content is those blocks' own. **A landing pass
   that lets a self-provisioned document carry the probe's term is a review finding** (`§5.3` clause 1(c): the term's
   declaration is shared by the sets' author and the probe).

### 18.2 THE DISCRIMINATING LIMB — `'corpus-query-results'`'s OPERATIVE FACT IS THE STORE QUERY FOR THE PROBE'S TERM

**THE RULING, IN ONE SENTENCE: FOR `'corpus-query-results'` THE OPERATIVE `present` FACT IS **THE STORE QUERY FOR THE
PROBE'S OWN CONSTANT TERM** — the corpus carries the term's document or it does not — **NOT THE PAINTED ROWS**; THE DOM READ
IS RESERVED FOR `'corpus-document-tabs'`, WHOSE AXIS GENUINELY IS THE RENDERED TAB STRIP.** **`SPEC-CALL` at `§5.2`, chosen
against the authority's silence on which limb is which and recorded with its ground (clauses 1–2) and its risk (clause 5).**

**THE SEVEN CLAUSES.**

1. **THE TWO PROBES' FORMS, NAMED AND DISTINCT (`§5.2`'s sentinel table is their home):**
   - **`'corpus-query-results'` — `read: 'rag.query'`, A STORE-QUERY FORM.** **The probe calls the MCP tool `rag.query`
     with THE PROBE'S OWN CONSTANT TERM as its query and NO operator input, NO block selection and NO gesture**
     (`§5.3` clauses 1/3). **The value the probe grades is the reply's own HIT CENSUS.** **`SPEC-CALL`; ground: the fixture
     this name declares is *"the corpus the pane-search result rows are painted FROM"* — a fact about the SET'S CONTENT,
     which the store query reads directly and the painted-row count can only read after a gesture (`§18.1` clause 3).**
   - **`'corpus-document-tabs'` — `read: 'dom:#tab-strip .tab[data-document-id]'`, THE DOM ROW-COUNT FORM, UNCHANGED.**
     **Its axis IS the rendered strip: at the pre-gesture read point a document tab is either open in the strip or it is
     not, and the strip is painted at boot, so the count discriminates between the sets** (`core`/`table`/`search` leave a
     document tab open at launch; `tabs` does not — `§2.1` `F-4`, `§2.2` P-θ). **`SPEC-CALL`, carried from the first loop
     and VERIFIED CLEAN.** **⟨GATE-5 RULING `2026-10-05` — THE FILED PARENTHETICAL *"`core`/`table`/`search` leave a document tab open at launch; `tabs` does not"* IS **REFUTED BY MEASUREMENT** AND IS `SUPERSEDED` (kept visible above and NOT rewritten): only a NON-DOCUMENT `landing` tab exists in the strip at the probe's pre-gesture read point under EVERY set, and `#tab-strip .tab[data-document-id]` can NEVER MATCH at this head (`src/renderer/tab-strip.ts` authors `data-tab-id` + `data-target-kind`; `data-document-id` belongs to `src/renderer/pane-graph.ts`, for PANES).** **THIS LIMB'S STATUS IS THEREFORE **SKIPPED-BY-RULING** — **NOT a pass** — with its exemption (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`) and the exact SKIP wording recorded at `§22.3`.** **THE `read` LITERAL, THE `count >= 1` SEMANTICS AND THE `'dom:'` DISPATCH ARE ALL UNCHANGED.**⟩**
2. **WHY THE DOM LIMB CANNOT BE `'corpus-query-results'`'s OPERATIVE FACT — THE FAILURE, NAMED AS A PREDICATE SO IT IS NOT
   RE-LITIGATED.** **With the first loop's predicate — `present = (storeQuery && domRows)` — the two runs are:**
   **`search`: `storeQuery = false` (the term is not carried), `domRows = false` (`0` painted rows) ⇒ `present = false`.**
   **`tabs`: `storeQuery = true` (the term IS carried), `domRows = false` (`0` painted rows, no tab open and no gesture)
   ⇒ `present = false`.** **THE TWO RUNS READ **IDENTICALLY** — nothing separates them — and a reading that requires
   `present:true` under `tabs` is IMPOSSIBLE.** **THAT IS THE BLOCKING ITEM, AS ARITHMETIC RATHER THAN AS PROSE.**
   **`VERIFIED-BY-READ` of the two limbs' sources: the pane-search rows are painted by a submit gesture (`§18.1` clause
   3(a)/(b)) and the store query depends on no gesture (`§18.1` clause 4).**
3. **THE DISCRIMINATING LIMB, PRECISELY — SO A TESTWRITER CAN DERIVE IT.** **For `'corpus-query-results'` the probe's
   reading is:**
   - **`read` literal: `'rag.query'`** (an MCP tool name — it carries **no** `'dom:'` prefix, so the dispatch
     (`§16.3` clause 2) already routes it to the MCP read path with **no new registry shape, no new dispatch arm and no
     second registry key**).
   - **The call: `h.mcpRead('rag.query', { query: <the probe's own constant term> })`** — the same discriminated-read
     idiom the probe already uses for its read (`§18.1` clause 4), with **no other argument**: no `topK`, no `store`, no
     `mode`, no `filters` — the engine's own defaults are the reading's context and are **not** contracted here. **`OWED`:
     whether a landing pass passes an explicit `topK` is its own to print, and the ARM grades the `read` literal, the
     argument's single `query` member and the reply's hit arithmetic, never an argument count.**
   - **The reply's classification: `driverReadFailure(read)` FIRST**, exactly as every other read
     (`§5.2` clause 3): an `isError` reply or a transport failure is `resolved:false` with the reply's text **verbatim**,
     and **parks nobody**.
   - **The hit census: `hits = (Array.isArray(read.value.results) ? read.value.results.length : (Array.isArray(read.value.ranked) ? read.value.ranked.length : null))`.**
     **`VERIFIED-BY-READ` of the tool's reply shape: `rag.query` returns the retrieval result, which carries a `results`
     array of result items (each with a `documentId`) and, preserved beside it, the `ranked` array of `{nodeId, score}`
     pairs; the engine FILTERS zero-score nodes out of `ranked` (`retrieval`'s own `filter((s) => s.score > 0)`), so an
     empty `results` array means the query matched NOTHING in the store — the fact this limb grades.** **The fallback is
     stated because a `mode: 'graph'` reply could carry `results` differently; **the probe never passes `mode`**
     (clause 3), so in practice the `results` limb is the one taken, and the `ranked` limb is the same reading's twin.**
   - **`present = failure === null && hits !== null && hits > 0`.** **`resolved = failure === null`.**
   - **A RESOLVED QUERY WITH `0` HITS IS A RESOLVED ABSENCE — `resolved:true`, `present:false`** (`§5.2` clause 1,
     re-stated there). **That single state IS `FA-1`'s reading under `--fixture=search`.**
4. **WHY THIS SEPARATES THE TWO RUNS BY CONSTRUCTION, IN THE SAME ARITHMETIC `§18.2` CLAUSE 2 USED:** **`search`:
   `hits = 0` ⇒ `present = false` at `resolved:true`. `tabs`: `hits >= 1` (it carries the term-bearing document
   `search.md`, `§2.1` `F-4`) ⇒ `present = true` at `resolved:true`.** **THE TWO RUNS NOW READ DIFFERENTLY, and each reads
   what its own set's content says.** **`core` and `table`: `hits >= 1` ⇒ `present = true` (`§18.6` clause 3).**
   **THE DOM COUNT IS STILL `0` IN ALL FOUR — AND THAT IS NOW HARMLESS, BECAUSE NOTHING GRADES IT.** **AND THE FIRST
   LOOP'S OTHER DEFECT IS CLOSED AT THE SAME TIME: `FA-4` (`core`, *"both probes present"*) becomes exhibitable, where a
   painted-row predicate made it impossible too.**
5. **THE DOM LIMB IS NOT RE-TAKEN BY THIS PROBE, AND THE REASON IS STATED SO ITS REMOVAL IS NOT READ AS A LOSS.**
   **The probe does NOT additionally evaluate `#pane-search li[data-document-id]`, not even as a recorded observation:
   at the read point it is `0` in every run, so recording it would add a number that a reader could mistake for a
   *"the fixture is inert"* signal, while it says nothing about this fixture.** **`SPEC-CALL`, with its ground: the
   first loop's own stated reason for the store-first ordering was *"a count taken before the query would read `0` for a
   different reason and make the two limbs indistinguishable"* — this pass's finding is that the count reads `0` for the
   SAME reason in the run the limb was supposed to distinguish, so the ordering clause is moot and the count is not part
   of the reading.** **THE ORDERING CLAUSE IS THEREFORE `SUPERSEDED` — there is only ONE limb left to order.**
   **WHAT IS *NOT* LOST: the pane-search surface is still read by the blocks whose subject it is (`uf_panes_14` ·
   `uf_tabs_7` · `uf_tabs_7_diag` drive `ufPaneSearch` themselves, `§18.1` clause 1), and those blocks' own verdicts are
   what `§11.3` items 3/4 grade.**
6. **THE SIX SITES WHOSE READING IS RE-STATED, EACH WITH ITS LOSER KEPT VISIBLE AND DATED** (this clause is the index; the
   edits are at the sites, each carrying its own gate-2 third-loop bracket pointing here):

   | Site | What it said | The reading of record |
   | --- | --- | --- |
   | **`§5.2`'s sentinel table, `'corpus-query-results'` row** | `read` = `'dom:#pane-search li[data-document-id]'` | **`read` = `'rag.query'`**; the DOM literal kept visible in the cell as `SUPERSEDED` |
   | **`§5.2`'s probe table, `'corpus-query-results'` read cell** | a two-limb predicate ending in *"(at least one result row is PAINTED)"* | **`present = (the store query resolved) && (hits >= 1)`**; the third conjunct **dropped** and kept visible; the `settles`/`unsettled` cells re-stated to match |
   | **`§5.1`'s one-sentence contract** | *"for `'corpus-query-results'` and `'corpus-document-tabs'` that surface is a RENDERED one"* | **The test a read must pass is *"can it read absent while `pre` is present, and does it read differently under `search` and `tabs`?"*** — kept visible beside it |
   | **`§5.5`'s `FA-1` row** | the reason given was *"no result row paints for the probe's term"* | **the reason is the store query's `0` hits**; the filed gloss kept visible |
   | **`§5.5`'s `FA-2` row** | *"the `'corpus-query-results'` keys RUN too (their term paints a row for the un-opened term-bearing document)"* | **they RUN because the probe's STORE QUERY reads `present:true`**; the filed parenthetical kept visible |
   | **`§11.3` item 4** | *"so its painted row exists and those keys RUN"* | **same reading as `FA-2`'s**; the filed clause kept visible |
   | **`§11.3` item 1** | *"the three probes all read PRESENT"* (no limb named) | unchanged in substance; **each of the two rendered-fixture probes' operative limb is now named** |

   **AND THE SITES THAT CARRY THE LITERAL FORWARD ARE RE-STATED WITH IT, EACH KEEPING ITS LOSER VISIBLE: `§16.3` clause 1
   (`§16.3`'s three sentinels) · `§16.8`'s `probe-read:corpus-query-results` row (the `3×probe-read` literals) ·
   `§16.17` item 4 (the read forms a TestWriter reads) · `§10.2.3`'s `3×probe-read` term prose · `§11.2`'s `PROBE-READ`
   arm row · `§17.7` clause 3 (the other two `3×probe-read` mutations) · `§15`'s `the probes` glossary cell · `§13.3`
   item 7(c) (the *"two DOM sentinels"* phrase) · `§2.2`'s P-δ row (the property's own subject, distinguished from the
   probe's read point) · `§5.2` clause 1 (the *"both new DOM probes"* phrase) · `§11.3` item 1.**
7. **THE NAMED MUTATIONS THIS AMENDMENT ADDS — EACH RIDING AN ARM THE REGISTER ALREADY COUNTS, SO NO `k`, NO TOTAL, NO CAP
   AND NO SEED MOVES (`§18.6`).**
   1. **`probe-read:corpus-query-results`, MUTATION ONE (the `F-2` state, unchanged in shape): set the entry's `read`
      back to `'rag.list_documents'`.** **The arm must go RED on the exact-string comparison — AND the reading it restores
      is worse than the filed one: this probe becomes a second read of `pre`, so a `tabs` run's `'corpus-query-results'`
      keys would RUN on the store list alone, which is the inert conjunct `F-2` names (`§0.2`).**
   2. **`probe-read:corpus-query-results`, MUTATION TWO (NEW, and it is the one that grades THIS ruling): restore the
      first loop's compound limb — give the entry a `'dom:'` literal (either selector) AND re-add the *"at least one
      result row is PAINTED"* conjunct to the predicate.** **The arm must go RED, and the RED it must show is THE
      COLLISION ITSELF: at the pre-gesture read point the conjunct is `false` in every run (`§18.1` clause 3), so the
      probe reads absent under `core` and `tabs` alike and `FA-2`/`FA-4` cannot be exhibited (`§18.2` clause 4).**
      **A green there is a tooth that cannot bite.**
   3. **`probe-read:corpus-document-tabs` — UNCHANGED** (`§16.8`, `§17.7` clause 3): `'rag.list_documents'`, or the
      superseded `[data-target-kind="document"]` spelling. **Its DOM form is now the ONLY `'dom:'` form in the registry,
      so a mutation that moves it to a tool name ALSO empties the `'dom:'` dispatch of its only subject — a second,
      named consequence.**
   4. **NO OTHER MUTATION MOVES.** **`probe-read:corpus-documents`'s (point at either `'dom:'` sentinel),**
      **`probe-population`'s two (`§16.16`, `§17.7` clause 1), the `FA-1`/`FA-2` route-tag mutations (`§17.5` clause 2)
      and the label/root mutations (`§17.6`) are all unchanged and all still bite.**

### 18.3 WHAT THE RE-STATED `FA-2` ROUTE IS, RESTATED SO IT CANNOT BE CONFUSED WITH THE COLLISION

**`FA-1` and `FA-2` BOTH REMAIN BODY-OWNED PARKS AT A NON-EMPTY STORE, and `§16.5`'s route ruling is VERIFIED CLEAN and is
NOT re-opened by this pass.** **RESTATED IN ONE PLACE, WITH THE `tabs` RUN SPELLED OUT BECAUSE THAT IS THE RUN THE
COLLISION SAT ON:**

1. **`--fixture=tabs`: `pre` (the run-wide store read) reads PRESENT** — the store carries the set's documents. **So
   `§5.2` clause 2's gate predicate (`pre.present !== true` as its FIRST conjunct) IS FALSE and the gate does not fire for
   any key.**
2. **`'corpus-document-tabs'` reads ABSENT at `resolved:true`** — no document-tab row is rendered at the pre-gesture read
   point (`§2.2`'s not-open-at-start property row, `§18.1` clause 3). **So `user9_search_open_in_tab` emits its OWN park through its existing
   `parkRow`/`parkReason` seam, naming `corpus-document-tabs`, tagged `parkedByFixtureAbsence`** (`§16.5`, `§5.5`).
3. **`'corpus-query-results'` reads PRESENT at `resolved:true`** — **the probe's STORE QUERY finds the term's document
   (`search.md` is in this set), and the ABSENCE OF A PAINTED ROW IS NOT ITS READING** (`§18.2` clauses 1–5). **So
   `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` RUN, drive their own `ufPaneSearch` gesture, and carry their own
   verdicts.** **THE RUN's `parkedByFixtureAbsence` IS THEREFORE `{user9_search_open_in_tab}` AND NOTHING ELSE** — the
   admitted park SET the route tag makes the discriminator (`§5.5` `FA-3`, `§16.5`).
4. **`'corpus-documents'` reads PRESENT** — the store list is this fixture, so those keys RUN (`§5.5`'s closing paragraph,
   unchanged).
5. **THE TWO ARMS ARE NOW JOINTLY GREENABLE, WHICH THEY WERE NOT: `class-(b):tabs` (`§11.3` item 4) and
   `class-(b):search` (`§11.3` item 3) assert the SAME predicate shape — a (park set, route tag) PAIR — over two
   different sets, and the probe's own limb under each set is the set's content.** **NO CLAUSE OF EITHER ARM HAS TO BE READ
   AGAINST ANOTHER CLAUSE FOR EITHER TO HOLD.**

### 18.4 WHAT THIS PASS DID **NOT** MOVE, STATED SO THE AMENDMENT IS NOT RE-READ AS A REWRITE

- **THE REGISTER IS UNTOUCHED** — `P-IM-6` `17` · `P-SM-5` `12` · `P-TP-4` `11` · `P-TP-5` `27`,
  `17 + 12 + 11 + 27 = 67`, EXECUTED `57`, caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows, seed `0x20261005`. **The
  `3×probe-read` term keeps `3` arms; `§18.2` clause 7's two mutations ride the SECOND of them, so no `k` moves** (the
  same sub-limb discipline `§17.5` clause 1 fixed).
- **THE ATOMICITY CLAUSE `§17.1` STANDS AS WRITTEN** — the declaration column-move, UNIT A's pin re-statement and this
  unit's arms remain ONE landing pass, and the asserted population remains `35 = 47 − 3 − 9` (`'corpus-documents'` `31` ·
  `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1`). **This pass changes WHICH LIMB A PROBE SETTLES and moves
  NO population.** **⟨GATE-4 AMENDMENT `2026-10-05` — THE FIRST NAME'S FIGURE IS RECONCILED TO `31`, NOT THE FILED `25`
  (kept visible in the same sentence above). THE CLAUSE'S OWN CLAIM IS CONFIRMED AND UNMOVED: **THE POPULATION IS `35`
  BEFORE AND AFTER BOTH PASSES** — only its NAMED SPLIT moves, from a stale `25 + 3 + 1 = 29` to the reconciled
  `31 + 3 + 1 = 35`. `31` is a `RECORDED READING` of the measured declaration census (measurer: the supervisor's shell,
  this pass's evidence) and `VERIFIED-BY-READ` against `§16.17` item 2's enumeration, WHICH IS THE AUTHORITY (`§20`).⟩**
- **THE `F-2` FALSIFIER (`§5.5`) STANDS** — `p < pre` on the two rendered fixtures is unchanged and still genuinely
  falsifiable; what is now DERIVED rather than assumed is **the limb by which `p` can be `false` while `pre` is `true`
  for `'corpus-query-results'`** (`§18.2`).
- **THE ENGINE RULING (`§8`), THE UNIT-A CONSISTENCY (`§1.3`), the `§17`-verified `parked`/`parkedByGate`/
  `parkedByFixtureAbsence` chain and its printed field, the `S-4`-not-`S-5` citation, the `N-10-GRAMMAR` note, the
  `no SET was materialised` string and the declaration-literal-is-authoritative rule (`§17.12`) ARE ALL UNTOUCHED.** **⟨GATE-3
AMENDMENT `2026-10-05` — ONE ITEM IN THAT LIST IS TOUCHED BY THE LATER GATE-3 PASS, AND IT IS NAMED SO THE LIST IS NOT READ AS
CURRENT: the `N-10-GRAMMAR` note's READING OF `P-TP-5` in `§16.10` is `SUPERSEDED` there, and `P-TP-5`'s declared string moves
one term (`§10.2.3`'s gate-3 block). THE NOTE'S ID, ITS RECORD SITE AND ITS UNIVERSAL ARE UNTOUCHED, AND NO REGISTER FIGURE
MOVES. THE `sha256` CLAIM BELOW BELONGS TO THIS PASS'S OWN HEAD AND IS SUPERSEDED BY `§14` item 1's gate-3 marker.⟩**
- **THE `sha256` STAYS `OWED`** (`§14` item 1): this pass holds no shell and took no digest.
- **NO FOURTH AMENDMENT ROUND IS OWED.** The one blocking item is closed here, and `§18.7`'s three residues are PARKED
  with their decisions recorded — **a later pass re-opening either is doing work this register has already refused.**

### 18.5 THE READ POINT'S CROSS-REFERENCES, SO A FRESH READER NEEDS NO OTHER FILE

| Name | Where it is contracted | What it decides |
| --- | --- | --- |
| **the pre-gesture read point** | **`§18.1`** | when every probe reads: before the asking block's own body runs, with no gesture by the probe |
| **the store-query limb** | **`§18.2` clauses 1/3** | `'corpus-query-results'`'s operative fact: `rag.query` for the probe's own term, `hits >= 1` |
| **the DOM row-count limb** | **`§5.2`'s sentinel table, `§18.2` clause 1** | `'corpus-document-tabs'`'s operative fact: `#tab-strip .tab[data-document-id]`, `count >= 1` |
| **the store-list limb** | **`§5.2`'s probe table** | `'corpus-documents'`'s operative fact: `rag.list_documents`, `documents > 0` — UNCHANGED |
| **the two acceptance predicates** | **`§18.6` clauses 1/2** | what `--fixture=search` and `--fixture=tabs` must observably do |
| **the three parked residues** | **`§18.7`** | what a reader does with the three non-blocking leftovers: nothing |

### 18.6 THE ACCEPTANCE READINGS, AS FALSIFIABLE PREDICATES — AND THE FIGURES THIS PASS MOVES (**NONE**)

**EACH PREDICATE IS WRITTEN SO A BLIND READER CAN FALSIFY IT FROM THE ARTIFACT ALONE: it names its observation, its
invocation and its failing counter-case (`§9` clause 6's honesty rule, `RCA-12`'s layer rule).** **NO PREDICATE BELOW IS
APP EVIDENCE: every one is `[D]`-class HARNESS / source-derivation or a driver-artifact reading.**

1. **`--fixture=search` — `class-(b):search` (`§11.3` item 3), FALSIFIABLE PREDICATE.** **INVOCATION: one isolated-port
   run, boot-and-connect confirmed.** **THE PREDICATE, FOUR CONJOINTS, ALL REQUIRED:**
   - **(i) THE OBSERVATION: the three `'corpus-query-results'` keys — `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` —
     PARK by name, each `parkReason` naming `corpus-query-results`, each tagged `parkedByFixtureAbsence`.** **FALSIFIED BY:
     any of the three carrying a verdict instead of a park; OR any of the three parked without naming that fixture; OR
     any of the three parked under the gate route (`parkedByGate`) rather than the body-owned route.**
   - **(ii) THE OBSERVATION: `parkedByFixtureAbsence` ON THIS RUN IS EXACTLY `{uf_panes_14, uf_tabs_7, uf_tabs_7_diag}`.**
     **FALSIFIED BY: any other gated key appearing in it — a FALSE PARK (`§5.1` clause 1's offence, `FA-3`); OR any of the
     three missing from it.**
   - **(iii) THE OBSERVATION: every `'corpus-documents'`-gated key RUNS and carries its own verdict.**
     **FALSIFIED BY: any of them parked by fixture-absence** — their own probe is the store list, which reads PRESENT here
     (`§5.5`'s closing paragraph).
   - **(iv) THE CROSS-RUN FALSIFIER, WHICH IS WHAT MAKES THIS A DISCRIMINATING READING AND NOT AN ABSENCE: the SAME
     probe, on the SAME driver, under `--fixture=tabs`, reads `present:true`.** **FALSIFIED BY: the probe reading
     identically under both sets — which is exactly the state the first loop's compound limb produced
     (`§18.2` clauses 2/4).** **AN OBSERVER WHO SEES BOTH RUNS READ ALIKE HAS SEEN THE COLLISION RETURN, NOT A PASS.** **⟨GATE-5 RULING `2026-10-05` — THIS CROSS-RUN FALSIFIER IS THE ARCHITECT'S ACCEPTANCE OUTCOME AND IS **UNCHANGED**; THE READING AT THIS HEAD IS THAT IT IS **FALSIFIED AS MEASURED** — `rag.query` returns `0 hit(s)` under `core`, `search` AND `tabs` ALIKE, i.e. the collision this clause names (`RECORDED READING`, the greens' `E-8`; measurer: the implementer's live runs on isolated ports).** **THE RULING'S REMEDY IS THE DATA, NOT THIS PREDICATE: the sets' document content must be adapted so the probe's own constant term reaches the store's lexical index (`§22.2` item 1) — which is what makes this falsifier exhibitable in BOTH directions (`>= 1` under `core`/`tabs`, `0` under `search`).** **THE PREDICATE IS NOT NARROWED, NOT RE-SCOPED AND NOT SKIPPED.**⟩**
2. **`--fixture=tabs` — `class-(b):tabs` (`§11.3` item 4), FALSIFIABLE PREDICATE.** **INVOCATION: one isolated-port run,
   boot-and-connect confirmed.** **THE PREDICATE, FIVE CONJOINTS, ALL REQUIRED:**
   - **(i) THE OBSERVATION: `user9_search_open_in_tab` PARKS by name, its `parkReason` naming `corpus-document-tabs`,
     tagged `parkedByFixtureAbsence`.** **FALSIFIED BY: it carrying a verdict; OR parking without naming that fixture; OR
     parking under the gate route.** **⟨GATE-5 RULING `2026-10-05` — THIS CONJOINT, THE `corpus-document-tabs` PROBE'S DIVERGENCE, IS **SKIPPED-BY-RULING** AND IS **NOT A PASS** (`§22.3`): the probe cannot read the strip at this head, so this limb is neither exhibited nor falsified — its surface awaits the later unit's foundation-tooling adaptation (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`).** **THE `F-2`-CLOSURE CLAIM FOR THIS LIMB MAY NOT BE REPORTED AS DISCHARGED. THE CONJOINT'S FILED TEXT IS KEPT UNCHANGED AND VISIBLE; ONLY ITS STATUS IS RECORDED.**⟩**
   - **(ii) THE OBSERVATION: `parkedByFixtureAbsence` ON THIS RUN IS EXACTLY `{user9_search_open_in_tab}`.**
     **FALSIFIED BY: ANY OTHER GATED KEY APPEARING IN IT — and the specific failure this clause exists to catch is
     `uf_panes_14`/`uf_tabs_7`/`uf_tabs_7_diag` appearing there, which is the mutually exclusive arm the review found.**
   - **(iii) THE OBSERVATION: the three `'corpus-query-results'` keys RUN and carry their own verdicts** — each driving its
     own `ufPaneSearch` gesture, which is where a painted row comes from (`§18.1` clause 1). **FALSIFIED BY: any of the
     three parked by fixture-absence, or parked at all for a fixture-absence reason.**
   - **(iv) THE OBSERVATION: the `'corpus-documents'`-gated keys RUN and carry their own verdicts.** **FALSIFIED BY: any
     of them parked by fixture-absence.**
   - **(v) THE CROSS-RUN FALSIFIER: the probe's own reading is the SET'S CONTENT — under `tabs` it reads `present:true`
     (the term's document is in the store), while the DOM row-count on the same run is `0`.** **FALSIFIED BY: a run whose
     `'corpus-query-results'` keys park while the store carries the term — i.e. by the return of the dropped conjunct.** 
   **NEITHER PREDICATE MAY BE REPORTED AS AN APP `FAIL`, AND NEITHER IS APP EVIDENCE** (`§11.3`'s closing rule, `§9`
   clause 6, `RCA-12`).
3. **`--fixture=core` — `FA-4`'s control, FALSIFIABLE PREDICATE (re-stated because the first loop's version was
   impossible to exhibit).** **THE PREDICATE: `'corpus-documents'`, `'corpus-query-results'` and `'corpus-document-tabs'`
   all read PRESENT — the first on `documents > 0`, the second on the store query's `hits >= 1`, the third on the strip's
   `count >= 1` — AND `parkedByFixtureAbsence` is `0`.** **FALSIFIED BY: any of the three reading absent (`FA-4` is the
   control that keeps `FA-1`/`FA-2` a DIVERGENCE and not a permanent absence); OR by any gated key parking
   fixture-absently.** **`--fixture=table` is covered by the same clause for the two rendered fixtures (P-β changes no
   probe).**
    **⟨GATE-5 RULING `2026-10-05` — THIS FALSIFIER IS **UNCHANGED** AND ITS SECOND LIMB (the store query's `hits >= 1`) IS THE ARCHITECT'S EXPRESS ACCEPTANCE OUTCOME, NAMED IN THE RULING ITSELF: `rag.query` for the probe's own constant term returns `>= 1` hit under `--fixture=core` (`§22.2` item 1).** **MEASURED AT THIS HEAD THAT LIMB IS FALSIFIED: every set reads `0 hit(s)` (`RECORDED READING`, greens `E-4`; measurer: the implementer's live runs on isolated ports `3970`–`3978`/`9470`–`9478`, `--display=:0`, scratch `--home`) — so the DATA must be adapted and this predicate is NOT re-worded.** **THE THIRD LIMB (the strip's `count >= 1`) IS **SKIPPED-BY-RULING** AND IS **NOT A PASS**: `dom:#tab-strip .tab[data-document-id]` can never match at this head, so that limb is neither exhibited nor falsified — its text stays AS FILED and only its status is recorded (`§22.3`).** **THE *"`parkedByFixtureAbsence` is `0`"* LIMB STANDS FOR EVERY NON-SKIPPED GATED KEY.**⟩**
4. **THE FIGURES — `NONE MOVED`, ENUMERATED SO THE CLAIM IS CHECKABLE.** **`VERIFIED-BY-READ` by arithmetic over this
   file's own declared literals, this pass changing no `arm(` count and no data point:**
   - **The register: `P-IM-6` `17` · `P-SM-5` `12` · `P-TP-4` `11` · `P-TP-5` `27`; TOTAL `17 + 12 + 11 + 27 = 67`;
     EXECUTED `57`; caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows; seed `0x20261005`. UNMOVED.** **⟨GATE-3 AMENDMENT `2026-10-05`: `STILL UNMOVED` — the gate-3 pass moves ONE TERM'S POSITION in `P-TP-5`'s declared string (its `10×class-(b)` term becomes the deepest group's last term) and NO FIGURE ENUMERATED HERE; the string to write is the amended spelling at `§10.2`'s table and `§16.17` item 7 (`§10.2.3`'s gate-3 block).⟩**
   - **Every term: `2×set-identity` · `3×set-file-list` · `3×set-shape` · `4×selection-grammar` · `5×refusal-arms` ·
     `3×probe-read` · `5×falsifier-divergence` · `2×probe-resolution` · `2×probe-population` · `3×state-member` ·
     `3×state-derivation` · `3×print-site` · `2×state-consequence` · `3×obsolete-route-annotation` ·
     `3×route-supply-refusal` · `7×repin-completeness` · `2×citation-repoint` · `2×honesty-clause`. UNMOVED.**
     **`§17.5` clause 1's `4×print-site` divergence is STILL the one divergence this file names and does not take.**
   - **Every population and member figure: the gated population `35 = 47 − 3 − 9`** (`'corpus-documents'` `31` ·
     `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1` · the two never-gated names `0` each) **· the census `47`
     · the never-gated groups `3` and `9` · the `16 + 9 = 31` split · the `eight` `stage_*` + `five` `o0_*` = `13` family
     · the `21 + 13 = 34` route split of UNIT A's own records · the probe set `3` non-null + `2` null · the state's `3`
     members · the observation's `3` park members · the physical sites `5 + 2`. UNMOVED.**

**⟨GATE-4 AMENDMENT `2026-10-05` — TWO FIGURES IN THIS ENUMERATION ARE RECONCILED, AND THE "UNMOVED" CLAIM IS SCOPED SO
IT IS NOT MIS-READ: THE RECONCILED FIGURES ARE `31` AND THE `16 + 9 = 31` SPLIT — the sentence above prints the
FILED pair (`25` and `16 + 9 = 25`), which this amendment SUPERSEDES and KEEPS VISIBLE. **"UNMOVED" GRADES THE GATE-2 THIRD LOOP'S OWN EDIT** (a `read` literal and ONE
predicate conjunct — no figure), and this amendment moves no OTHER figure; the `'corpus-documents'` figure was ALREADY
stale before either pass and is reconciled here on the ARCHITECT'S RULING and the measured declaration census
(`RECORDED READING`, measurer: the supervisor's shell, this pass's evidence), CORROBORATED `VERIFIED-BY-READ` against
`§16.17` item 2's enumeration — THE AUTHORITY. The population `35`, the census `47`, the groups `3`/`9`, the
`eight`/`five`/`13` family, the `21 + 13 = 34` route split, the probe set, the state's `3` members, the observation's
`3` park members and the physical sites `5 + 2` ARE UNMOVED (`§20`). **⟨GATE-5 AMENDMENT `2026-10-05` — THE `eight`/`five`/`13` FAMILY'S *"UNMOVED"* IS `SUPERSEDED` AND KEPT VISIBLE: the `stage_*` figure is `7`, so the GATED family is `7 + 5 = 12` with remainder `19` (`§21.3`; greens row `H-9`, fail ledger `F-4`); `13` and `18` survive only as the DECLARED family's census and ITS remainder. EVERY OTHER FIGURE OF THIS ENUMERATION — including the `21 + 13 = 34` route split, whose `13` is the `DIAG` route census and NOT this family — IS UNMOVED.⟩**
   - **The registry's own membership: FIVE `fixtureName` keys, TWO of them `read: null`, THREE carrying a non-null
     `read`. UNMOVED — only the STRING one of the three carries changes, which is precisely what
     `probe-read:corpus-query-results` grades.** **`§5.4`'s population-check direction is therefore untouched: a gated
     name with `read: null` is still the offence, and a never-gated name with a read is still the false-park direction.**
   - **WHAT DID `MOVE`, AND IT IS NOT A FIGURE: one STRING (the `'corpus-query-results'` `read` literal), one predicate
     conjunct (DROPPED, not re-weighted), and one prose limb per re-stated site. A string is not a count.**
5. **THE TWO PREDICATES' RELATION TO `§17.1`'s ATOMICITY:** **both readings require the SAME landing, unchanged — the
   declaration column-move, UNIT A's pin re-statement and this unit's arms in ONE pass** (`§17.1` clause 1). **THIS PASS
   ADDS NO LANDING STEP: a probe's `read` literal and its predicate are THIS unit's arm text, not UNIT A's declaration.**

### 18.7 THE THREE PARKED RESIDUES — DECIDED IN ONE LINE EACH, SO NO READER RE-LITIGATES THEM AND **NO FOURTH ROUND IS SPENT**

**THE REVIEW LEFT THREE NON-BLOCKING RESIDUES, EACH EXPLICITLY PARK-ELIGIBLE.** **THIS PASS PARKS ALL THREE AND RECORDS
EACH DECISION BELOW; they are NOT amendments, they gate NOTHING, no arm reads any of them, and a future pass that
re-opens one as a finding is re-litigating a closed decision.**

| # | The residue, as the review named it | The decision, one line | Who acts |
| --- | --- | --- | --- |
| **(a)** | **`§5.2`'s second probe table's `'corpus-document-tabs'` ROW still prints a SELECTOR the sentinel table does not contract** — the row's `present` clause reads `#tab-strip .tab[data-target-kind="document"]` while the sentinel table contracts `'dom:#tab-strip .tab[data-document-id]'`. | **THE ROW'S OWN BRACKET ALREADY SUPERSEDES THE SPELLING AND THE SENTINEL TABLE IS THE BINDING FORM; THE LANDING PASS RE-WORDS THE ROW'S `present` CLAUSE TO THE CONTRACTED LITERAL — a one-string edit, kept visible here, no contract question.** *(`§5.2`, written at the row.)* | **the landing pass** |
| **(b)** | **`§17.2`'s *"`16 + 18 = 34` split cannot produce its own group's `25`"* versus `§16.17` item 2's 25-entry enumeration (`16 + 9`)** — prose only, two splits over one group. | **PROSE ONLY, AND `§16.17` ITEM 2 IS THE READING OF RECORD (`16` hand-listed + `9` entered = `31`); THE FILED `16 + 18 = 34` IS A STALE FIGURE OF THE OLD GROUP TOTAL'S SPLIT AND STANDS AS THE KEPT-VISIBLE LOSER, RE-WORDED BY THE LANDING PASS ONLY IF IT TOUCHES THAT SENTENCE.** *(`§17.2`'s own trailing note already says this; no arm and no register term reads it.)* **⟨GATE-4 AMENDMENT `2026-10-05` — THE RESIDUE'S QUOTED FIGURES ARE RECONCILED AND THE RESIDUE'S DISPOSITION IS NOT RE-OPENED:** the enumeration's total is **`31`**, not `25`, and its filed split is **`16 + 9 = 31`**, not `16 + 9 = 25` — **`§16.17` item 2's enumeration IS the authority and it reads `31`** (`VERIFIED-BY-READ`), with the measured declaration census agreeing (`RECORDED READING`, measurer: the supervisor's shell, this pass's evidence). **The filed split's `16` term is `OWED` (it cannot be re-derived from the enumeration as written); the `18`/`34` loser and the residue's PROSE-ONLY disposition STAND** (`§20`).⟩** | **the landing pass (only if it edits that sentence)** |
| **(c)** | **`§5.2`'s `'corpus-query-results'`/`FA-1`/`FA-2` PROSE STILL CARRIES THE SUPERSEDED SELECTOR SPELLING AND THE *"PAINTED"* TALK, WHERE `§16.6` REWROTE ONLY THE REGISTRY PROSE.** | **STANDS AS A KEPT-VISIBLE LOSER WHERE IT IS AN INTERPRETIVE GLOSS (the `FA-1`/`FA-2` rows' *"paints a row"* language, marked at the rows) AND IS RE-WORDED BY THE LANDING PASS WHERE IT IS A PREDICATE (any prose that would have a reader grade a painted-row count as a probe's answer); THE OPERATIVE LIMB IS `§18.2`'s STORE QUERY EITHER WAY.** *(`§5.5` `FA-1`/`FA-2`, written at the rows.)* | **the landing pass (only if it edits a predicate)** |

**AND WHY PARKING IS THE RIGHT DISPOSITION FOR ALL THREE, STATED ONCE:** **none of them changes a method signature, a
return shape, a fail-state, a population or a register figure; each is either a superseded string with a binding form
already named beside it, or a prose sentence that no arm reads.** **`RCA-6`'s rule that a doc claim which drifted from the
code must be fixed IN THE SAME PASS is satisfied: the DRIFTED CLAIMS here are the three above, and each now carries its
binding form and its decision AT ITS OWN SITE — which is what makes them parked rather than outstanding.**

### 18.8 THIS PASS'S RE-TAKEN CENSUS AND WHAT IT COULD NOT SETTLE

**⟨GATE-3 AMENDMENT `2026-10-05` — THIS ITEM'S `2652`-LINE CENSUS AND ITS TRAILING `sha256` SENTENCE ARE BOTH `SUPERSEDED` BY
THE GATE-3 PASS AND ARE KEPT VISIBLE BELOW (`RCA-8(c)`). THE PRE-AMENDMENT FILE'S DIGEST IS NOW A `RECORDED READING` AT `§14`
ITEM 1 (`sha256` `bc824649f3e87242c1d0a87c4ca5faeb0f0bf456f2a4712cca68ea1dcd5acdb3`, md5 `e859390d40f2c3c52903dad4e4a56e05`,
at `2652` lines), AND THE POST-AMENDMENT `sha256`/`md5` ARE `OWED` AGAIN THERE — THIS PASS HOLDS NO SHELL AND TOOK NO DIGEST.
**ITS RE-TAKEN FIGURE IS `2779` LINES** — `VERIFIED-BY-READ` (reader: this pass, the file-read tool's own line census, taken after this pass's last edit — the sentence stating it replaced a sentence of the same length in newlines, so no line was added or removed by it and the figure is exact).⟩**

1. **THIS FILE'S LINE COUNT AFTER THIS AMENDMENT** — `VERIFIED-BY-READ` (reader: this pass, the file-read tool's own
   census, taken after every one of this pass's edits, `§18.7`'s three residue markers included): **`2652` lines**,
   against the `2306` of the gate-2 third loop's FIRST reading of this same pass (kept visible and `SUPERSEDED`), the
   `2225` of the gate-2 second loop (`§17.13` item 14, `SUPERSEDED`), the `1749` of the gate-2 first loop (`§16.17`
   item 10, `SUPERSEDED`) and the `1074` of the filed head (`§14` item 2). **IT IS AN OBSERVATION, NOT A PIN**: a later
   amendment moves it, and a landing pass must take its own census. **THE `sha256` REMAINS `OWED` (`§14` item 1) — this
   pass holds no shell and took no digest.** **⟨GATE-4 AMENDMENT `2026-10-05` — `2652` WAS ALREADY `SUPERSEDED` BY THE
   GATE-3 PASS'S OWN RE-TAKEN `2779`-LINE CENSUS (its marker immediately above, `VERIFIED-BY-READ` there), AND BOTH ARE
   `SUPERSEDED` BY THE GATE-4 PASS: THIS AMENDMENT MOVES THE FILE AGAIN, SO **THE POST-AMENDMENT LINE COUNT IS `OWED`**
   AND THE PRE-EDIT CENSUS OF THE HEAD THIS PASS RECEIVED IS **`2779` LINES** (`RECORDED READING`, measurer: the pass that
   handed this one the file; this pass HOLDS NO SHELL and took no census of its own). **NO FIGURE HERE IS GUESSED, AND NO
   `sha256`/`md5` IS STATED** (`§20.4` clause 1). THIS ITEM'S DISPOSITION IS UNMOVED: the count is an OBSERVATION, not a
   pin, and a landing pass takes its own.⟩**
2. **WHAT THIS PASS COULD NOT SETTLE, ADDED TO `§13.3` item 7's list:** **(a) THE EXACT ARGUMENT SHAPE OF THE PROBE'S
   STORE QUERY** — this pass contracts the `read` LITERAL (`'rag.query'`), the single `query` argument (the probe's own
   constant term) and the reply's hit arithmetic; **whether a landing pass passes an explicit `topK` is its own** and is
   `OWED` (`§18.2` clause 3). **(b) THE PROBE TERM'S LITERAL** — unchanged from `§13.3` item 2: the term's three
   properties are contracted, its string is the landing pass's, and `§18.2` clause 3's predicate reads it as *"the probe's
   own constant term"* either way. **(c) THE FIRST LOOP'S `'dom:'` SENTINEL FOR `'corpus-query-results'` IS `SUPERSEDED`
   AND NOT DELETED** — this pass holds no mandate to remove a value the file has printed, and every site that prints it
   now also names the binding one (`§18.2` clause 6).
3. **THE ONE THING A LANDING PASS MUST NOT DO, STATED SO THIS CLOSURE CANNOT BE UNDONE SILENTLY:** **it must not restore a
   painted-row conjunct to `'corpus-query-results'`'s predicate, and it must not make that probe's `read` a `'dom:'`
   literal.** **Either restores the collision (`§18.2` clauses 2/4), makes `class-(b):tabs` ungreenable and `FA-4`
   unexhibitable, and is graded RED by `probe-read:corpus-query-results`'s SECOND named mutation (`§18.2` clause 7
   item 2).**

---

## 20. ⟨GATE-4 AMENDMENT `2026-10-05`⟩ THE `'corpus-documents'` PER-NAME FIGURE RECONCILED TO **`31`** — **EVERY SITE, ITS SUPERSEDED TEXT, AND WHY THE ENUMERATION RULED**

**THE AMENDMENT, IN ONE CLAUSE SO AN ARM CAN BE WRITTEN FROM IT: THE GATED POPULATION IS `35 = 47 − 3 − 9`, NAMED
`'corpus-documents'` `31` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1`, WITH `31 = 30 + 1`.** **THE FILED
PER-NAME FIGURE `25` AND ITS DECOMPOSITION (`25 = 24 + 1`, `16` hand-listed + `9` entered) ARE `SUPERSEDED` AND ARE KEPT
VISIBLE AT EVERY SITE THAT CARRIED THEM, MARKED (`RCA-8(c)`'s ANNOTATE-BESIDE DISCIPLINE: no filed clause is rewritten in
place).** **NO OTHER FIGURE MOVED** (clause 3).

### 20.1 THE RECONCILED FIGURE AND EACH LABEL

1. **`31`** — the `'corpus-documents'` gated-key count. **`RECORDED READING`** (measurer: the supervisor's own shell, on
   this pass's evidence: the landed `UF_FIXTURE_DECLARATION` census among the `35` gated entries). **CORROBORATED
   `VERIFIED-BY-READ`** (reader: this pass, over this file's own `§16.17` item 2 enumeration, whose filed items count to
   `31`).
2. **`3`** — the `'corpus-query-results'` gated-key count: `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`.
   **UNMOVED.**
3. **`1`** — the `'corpus-document-tabs'` gated-key count: `user9_search_open_in_tab`. **UNMOVED.**
4. **`35 = 31 + 3 + 1`** — the gated population, ALSO reached as **`47 − 3 − 9`** (`47` declaration entries − `3`
   `corpusRead:false` − `9` `selfProvisioning:true`). **UNMOVED in every term except the `31`.** **THE ASSERTED
   ARITHMETIC IS NOW: `31 + 3 + 1 = 35` AND `47 − 3 − 9 = 35` — BOTH CLOSE. `25` CLOSED WITH NOTHING (`25 + 3 + 1 = 29
   ≠ 35`).**
5. **`31 = 30 + 1`** — the DEFENSIBLE decomposition: **`30`** = the `'corpus-documents'` gated-key count at the
   PRE-LANDING head, `git show f124358:scripts/live-drive.mjs` (**`RECORDED READING`**, same measurer), and **`1`** = the
   `§17.1` column-move (`u_edit_1_live_package_table_limitation` → `corpusRead:true`, `selfProvisioning:false`,
   `fixtureName:'corpus-documents'`). **THE SAME `+1` SHAPE THE FILED CLAUSE STATED, AT A DIFFERENT BASE.**

### 20.2 THE DECOMPOSITION THIS PASS WROTE, AND ITS AUTHORITY

**AUTHORITY: THE ENUMERATION — `§16.17` item 2's list (*"THE GATED `'corpus-documents'` KEYS, EXHAUSTIVELY"*, the list
`§16.10` calls the authority).** **Its items count to `31` (`VERIFIED-BY-READ`, reader: this pass), which is why the
enumeration was the authority OVER the stale figure and not the reverse: `§17.12`'s phrase *"`§16.17` item 2's
**25-entry** enumeration"* was false of the text as written.**

1. **WHAT IS WRITTEN IN THE DECOMPOSITION'S PLACE (`31 = 30 + 1`) IS DEFENSIBLE AND IS THE OPERATIVE FORM** (clause 1.5).
2. **WHAT THE ENUMERATION ITSELF CAN REPRODUCE, STATED SO THE TESTWRITER'S DERIVATION IS NOT INVENTED:** the enumeration's
   own FAMILY tokens — `stage_*` **`8`** (its own bracketed note, `§17.2`) + `o0_*` **`5`** = **`13`**, leaving **`18`**
   entries in the remainder of the list (`VERIFIED-BY-READ` by subtraction). **These three figures reproduce the `31`
   arithmetically; they are NOT the filed decomposition.** **⟨GATE-5 AMENDMENT `2026-10-05` — THE `8`/`13`/`18` FIGURES OF THIS CLAUSE ARE `SUPERSEDED` AND ARE KEPT VISIBLE (`RCA-8(c)`): the enumeration's own tokens are `7` `stage_*` (this clause's *"its own bracketed note, `§17.2`"* is the WRONG AUTHORITY — the enumeration's LIST is the authority and it holds seven; greens row `H-9`, fail ledger `F-4`) + `5` `o0_*` = **`12`**, leaving **`19`** in the remainder, and **`12 + 19 = 31`**. **`13`/`8` SURVIVE ONLY AS THE DECLARED FAMILY CENSUS (`stage_tabs_persist_roundtrip` is `corpusRead:false`, `§2.1` group 4, greens `H-2`); `18` SURVIVES ONLY AS THE **DECLARED** FAMILY'S REMAINDER (`13 + 18 = 31`).** THE `31`, THE `35`, THE `16 + 9` SPLIT'S `OWED` `16` AND THIS SECTION'S AUTHORITY CLAUSE ARE UNMOVED. THE FULL SITE REGISTER IS `§21.3`.⟩**
3. **THE FILED SUB-COUNT *"`16` hand-listed"* CANNOT BE RE-DERIVED FROM THE ENUMERATION AS WRITTEN, AND IS SAID SO PLAINLY
   RATHER THAN RE-INVENTED: `OWED`.** **The *"`9` entered"* term IS re-derivable from the enumeration's own family tokens
   (`§20.2` clause 2, `13` − `4` = `9` — the `9` counts the enumeration's ENTERED tails: the stage family beyond its
   hand-listed part and the five `o0_*` keys, `VERIFIED-BY-READ`), but the `16` it was paired with was a figure of the OLD
   group total's split and does NOT survive the reconciliation.** **NO ARM READS EITHER TERM: what the arm grades is the
   TOTAL (`31`) and the population (`35`)**, which is why the total is what the amendment carries and the split is marked
   `OWED` to whoever re-takes it. **⟨GATE-5 AMENDMENT `2026-10-05` — THE `13` − `4` = `9` SUB-DERIVATION ABOVE IS `SUPERSEDED` AND IS KEPT VISIBLE: under the binding gated family figures (`§21.3`: `7` `stage_*` + `5` `o0_*` = `12`, NOT `13`) that subtraction's first term does not hold. **THE `9` ITSELF SURVIVES AND IS RE-DERIVED WITHOUT IT: `4` hand-listed `stage_*` keys (`stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document`) + the `5` `o0_*` keys = `9`.** **NO ARM READS EITHER TERM, SO NOTHING ELSE MOVES (greens row `H-9`, fail ledger `F-4`).⟩**
4. **THEREFORE THE ONLY SUB-COUNT THIS FILE NOW ASSERTS OF THIS GROUP IS `31`**, and the only decomposition it asserts is
   `31 = 30 + 1`.

### 20.3 THE SITES AMENDED — EACH WITH ITS SUPERSEDED TEXT KEPT VISIBLE

**EVERY SITE THIS AMENDMENT TOUCHES IS ENUMERATED BELOW, IN FILE ORDER; EACH CARRIES A `⟨GATE-4 AMENDMENT
`2026-10-05` …⟩` MARKER NAMING THE RULING (THE ARCHITECT'S), ITS EVIDENCE (THE MEASURED DECLARATION CENSUS) AND THE
REASON (`THE ENUMERATION WAS THE AUTHORITY OVER THE STALE FIGURE`).** **THE LIST IS THE SWEEP'S OWN REGISTER: items 1–8
are the sites the ruling named by section, and items 9–21 are the remaining sites the same amendment reached (`§16.17`
item 2, the `§16`/`§17`/`§18` re-derivations, the `§18.7` residue row and the `§18.8` census item).**

1. **`§1.1` item 1** — *"the GATED POPULATION is `35` keys, `25` of them on `'corpus-documents'`"* → **`31`**, marked.
2. **`§1.3`'s gate-2 second-loop clause** — *"named `'corpus-documents'` `25` · `'corpus-query-results'` `3` ·
   `'corpus-document-tabs'` `1`"* → **`31`**, marked.
3. **`§2.1`'s `F-1` cell footnote** — *"`25` gated `'corpus-documents'` keys, of which `core`/`table`/`search`/`tabs`
   carry `24`"* → **`31`** / **`30`**, marked.
4. **`§2.1` group 1** — *"OF WHICH `25` CARRY THIS FIXTURE (`24` satisfied by `core`/`table`/`search`/`tabs` …"* →
   **`31`** / **`30`**, marked.
5. **`§5.2`'s sentinel-table row for `'corpus-documents'`** — *"`24` KEYS ARE GATED ON THIS FIXTURE AT THIS FILING'S HEAD
   AND `25` AFTER THE `§16.1` AMENDMENT"* and *"`§16.17` names all `25`"* → **`30` AT THE FILING'S HEAD / `31` NOW**, and
   **`names all `31`** — **THE FIGURE'S OWN AUTHORITY**, marked.
6. **`§5.2`'s probe-table population cell** — *"the cell's *\"names all `25`\"* is TRUE OF THE OTHER `30` KEYS"* →
   **`31`** / **`30`**, marked.
7. **`§12` item 12** — *"named `'corpus-documents'` `25` · …"* → **`31`**, marked.
8. **`§14`'s asserted-population row** — *"named `'corpus-documents'` `25` · …"* → **`31`**, marked.

**AND `§16.17` item 2 — THE ENUMERATION ITSELF — CARRIES THE RECONCILED FIGURE AND THE RECONCILED DECOMPOSITION AT ITS OWN
SITE** (`§20.3` item 9 of the fuller sweep below), because it is the figure's authority and had to state the figure the
list it prints actually counts to:

9. **`§16.17` item 2** — *"BY FIXTURE NAME: `'corpus-documents'` `25` · `'corpus-query-results'` `3` ·
   `'corpus-document-tabs'` `1`"* → **`31`**, and its trailing decomposition *"`16` hand-listed + `9` entered = `25`"* →
   *"`31` (`VERIFIED-BY-READ`), its filed `16 + 9` split `SUPERSEDED`, `31 = 30 + 1`"*, marked. **THE ENUMERATION'S OWN
   ITEMS ARE NOT TOUCHED: the marker is ADDED BESIDE the list, and the `16 + 9 = 25` sentence is REPLACED by the
   reconciled form because it is the decomposition sentence THIS AMENDMENT EXISTS TO CORRECT (`25 = 24 + 1` and
   *"`16` hand-listed + `9` entered = `25`"* are `SUPERSEDED`; the superseded text is kept visible in the replacement,
   quoted and marked).**
10. **`§16.1`'s re-derivation consequence** — *"the `'corpus-documents'` group moves **`24` → `25`**"* → **`30` → `31`**,
    marked.
11. **`§16.10`'s `core`-coverage sentence** — *"`core` supplies `34` of the `35` gated keys — `24` of the `25`
    `'corpus-documents'` keys …"* → **`30` of the `31`**, marked. **THE OTHER TWO TERMS OF THAT SENTENCE ARE UNMOVED**
    (`34` of `35`; `4` rendered-fixture keys).
12. **`§16.10` clause 2** — *"`§5.2`'s *\"names all `25`\"*"* → **`31`**, marked.
13. **`§17.1` clause 3** — *"`'corpus-documents'` `25` · `'corpus-query-results'` `3` · `'corpus-document-tabs'` `1`"* →
    **`31`**, and its decomposition clause **`25 = 24 + 1`** → the reconciled form, marked. **THE `25 = 24 + 1` CLAUSE AND
    ITS `24 + 1 + 3 + 1 = 29` / `29 + 9 = 38` arithmetic ARE `SUPERSEDED` AND KEPT VISIBLE AT THE SITE; THE `35` IS NOT
    THE SUM OF THE GATED GROUPS, IT IS `31 + 3 + 1` AND `47 − 3 − 9`, WHICH AGREE.**
14. **`§17.2`'s ruling** — its *"names all `25` … true only of the OTHER `24`"* → **`31`** / **`30`**, and its own
    *"`16 + 9` is the reading of record … the stale `18`"* clause → the reconciled form, marked. **THE `eight stage_* +
    five o0_* = `13` FIGURE AND THE `8 + 5 = 13` ARITHMETIC ARE UNMOVED — they are this ruling's own content and the
    enumeration agrees with them.** **⟨GATE-5 AMENDMENT `2026-10-05` — THIS CLAUSE'S *"ARE UNMOVED … the enumeration agrees with them"* IS `SUPERSEDED` AND IS KEPT VISIBLE (`RCA-8(c)`): the enumeration lists `7` `stage_*` (greens row `H-9`, fail ledger `F-4`), so the gated family is `7 + 5 = 12` with remainder `19`, and `13`/`18` survive only as the DECLARED family's census and its remainder. The `§20.3` item's own `25`→`31`/`24`→`30` reconciliation is UNMOVED; the full figure register is `§21.3`.⟩**
15. **`§17.3` item 2** — *"the `'corpus-documents'` group `24` → `25`"* → **`30` → `31`**, marked.
16. **`§17.12`'s consequence clause** — *"its *\"names all `25`\"* … and the `25` itself stands"* → **`31`**, marked; **the
    clause's ruling (`THE DECLARATION LITERAL IS THE EXHAUSTIVE AUTHORITY, EVERY PROSE CELL IS ILLUSTRATIVE`) IS UNMOVED
    AND IS WHAT MADE THIS RECONCILIATION POSSIBLE.**
17. **`§17.13` item 1** — *"`'corpus-documents'` `25` · …"* → **`31`**, marked.
18. **`§17.13` item 2** — *"the hand-listed/entered split is `16 + 9 = 25`"* → the reconciled form, marked.
19. **`§18.6` clause 4** — *"(`'corpus-documents'` `25` · …"* → **`31`**, marked; **the clause's claim (*"THE ATOMICITY
    CLAUSE STANDS … THIS PASS CHANGES WHICH LIMB A PROBE SETTLES AND MOVES NO POPULATION"*) IS UNMOVED — the population
    is `35` before and after, and only its NAMED SPLIT moves.**
20. **`§18.6` item 4** — *"(`'corpus-documents'` `25` · … the `16 + 9 = 25` split"* → **`31`** and the reconciled split,
    marked.
21. **`§18.7`'s residue (b) row** — *"versus `§16.17` item 2's 25-entry enumeration (`16 + 9`)"* and its ruling text →
    the reconciled reading, marked. **THE RESIDUE ITSELF IS NOT RE-OPENED AS A FINDING** (`§18.7`'s own discipline):
    the enumeration's TOTAL is now stated as `31` and its filed split as `OWED`, and the residue's disposition (**prose
    only; `§16.17` item 2 is the reading of record**) STANDS.

### 20.4 WHAT IS `OWED` AFTER THIS PASS

1. **THE POST-AMENDMENT LINE COUNT AND THE FILE'S `sha256`/`md5` ARE `OWED`** (`§14` item 1, `§18.8` item 1): **this pass
   holds NO SHELL and took NO DIGEST, and the digest a previous pass supplied was for a superseded head.** **The
   pre-edit census (`2779` lines) and the current `2652`-line reading at `§14`/`§18.8` are `RECORDED READING`s of
   pre-amendment heads and stay visible, marked `SUPERSEDED`.** **`OWED`.**
2. **THE `16`-HAND-LISTED SUB-COUNT IS `OWED`** (`§20.2` clause 3): **it cannot be re-derived from the enumeration as
   written, and this pass does not invent one.** **`OWED`.**
3. **NO ARM, NO REGISTER TERM, NO CAP, NO SEED, NO SET NAME AND NO PROBE LITERAL MOVES WITH THIS AMENDMENT.** **A landing
   pass that reads `31` as a REGISTER figure has mis-read it: the register counts `arm()` attempts
   (`17 + 12 + 11 + 27 = 67`, executed `57`), and no term of any row is a population or per-name term.**
4. **A LANDING PASS THAT QUOTES `25` OR `24` AS THE CURRENT `'corpus-documents'` FIGURE IS RED BY READ**; a landing pass
   that cites `§16.17` item 2's enumeration gets `31` from the text itself, which is exactly why the enumeration was
   the authority.

---

## 21. ⟨GATE-5 AMENDMENT `2026-10-05`⟩ THE BLIND GREENS' **FOUR DOCUMENTATION DEFECTS** (`D-1` `D-2` `D-3` `D-4`), EACH CLOSED ANNOTATE-BESIDE — **ITS SITES, ITS SUPERSEDED TEXT, ITS MARKER, AND THE EXACT READING A TESTWRITER GRADES**

**WHAT THIS PASS IS.** The **GATE-5 blind greens** (`docs/specs/unit-mock-corpus-fixture-sets-greens.md`, **`568` lines, `100` frozen rows** `+` `3` disclosed post-freeze rows, `77`/`9`/`3`/`7`/`2`/`2` PASS/FAIL/NOT-TESTABLE/PARTIAL/REVIEW-ONLY/other over the frozen `100`) measured the landed driver against THIS document and filed **eight** documentation findings (`§6` of that artifact, `D-1`…`D-8`). **FOUR OF THEM ARE THIS PASS'S:** `D-1` (a contract-internal contradiction about the `main().catch` site), `D-2` (the two-supply refusal names the flag FAMILY, not the flag), `D-3` (the `stage_*` figure contradicts the contract's own authority) and `D-4` (the fixture DATA literal is unnamed). **THE OTHER FOUR ARE NOT THIS PASS'S AND ARE UNTOUCHED:** `D-5` (a greens-set scope disclosure about the blind writer's own row-scope), `D-6` (the process finding that the `10×class-(b)` terms are NOT-RUN — the supervisor's DONE-row gate), `D-7` (`§9` clause 3's `R-none`/`R-mock` citation, already recorded at `§16.14`) and `D-8` (`§5.5`'s `p < pre` premise, which is `F-1` — a BEHAVIOUR finding about the probe's landed reading, **not a figure and not a wording**: it is OWED to the landing pass and is recorded in `§21.4`).

**DISCIPLINE OBSERVED, STATED SO IT CAN BE CHECKED (`RCA-8(c)` ANNOTATE-BESIDE):** **NOT ONE FILED CLAUSE IS REWRITTEN IN PLACE.** Every amended site keeps its filed text **VISIBLE**, marked `SUPERSEDED` where the two readings contradict, and carries a dated **⟨GATE-5 AMENDMENT `2026-10-05` …⟩** marker naming **the greens row that found it**. **NO SECTION IS RENUMBERED** (this register is `§21`, appended after `§20` in the file's own pattern for an amendment register). **NO METHOD SIGNATURE, RETURN SHAPE OR FAIL-STATE CHANGES; THE REGISTER, THE CAPS, THE SEED AND THE CENSUS FIGURES ARE UNMOVED (`§21.5`).** **THIS IS A DOC-LAYER PASS: read/search + doc-writes, RAN NOTHING, and touched no `scripts/**`, `tests/**` or `src/**` byte.**

### 21.1 `D-1` — THE `main().catch` SITE: THE BINDING'S ORDER IS THE RULE, AND THE ABSOLUTE PHRASING IS `SUPERSEDED`

**THE DEFECT (greens `D-1`, fail ledger row `F-2`, which dispositions greens rows `F-8` and `F-9`; evidence row `F-10`):** `§7.2` clause 4 says the module-level `main().catch` path *"reads the same binding"* — i.e. the state as assigned — while `§7.2`'s gate-2 note, `§16.5` clause 1 and `§16.17` item 5 say, **in absolute terms**, that **EVERY** early site, *"including the `main().catch` ERROR line"*, prints the `none` triple and **never** the selected set's name. **Measured (a real run): `[live-drive] ERROR: Error: waitFor timed out … fixture={"state":"mock data set core selected","kind":"mock-data-set","id":"core"}` — an abort AFTER the assignment legitimately prints the selected set.** **The DOC is the wrong side.**

**1. THE CLAUSE THAT IS SUPERSEDED (kept visible at each site, never deleted).** **THE `main().catch` MEMBER OF EVERY ABSOLUTE LIST IS `SUPERSEDED`** — `§7.2`'s gate-2 note, `§16.5` clause 1, `§16.17` item 5's *"every early site prints `none`"*, `§10.2.3`'s `3×print-site` gate-2 note, `§17.5` clause 3's parenthetical, and `§17.5` clause 4's site census *as a list of sites asserted for the `none` triple* — **and so is the reading of `§12`'s `print-site:early-paths` arm's SUBJECT LIST.** **NOTHING ELSE IS SUPERSEDED:** the refusal lines' reading, the assignment's position, the one-read rule, the site count and the arm's name all stand.

**2. THE BINDING RULE (the whole reconciliation, in one clause so an arm can be written from it).** **WHAT THE ORDER FIXES IS WHICH LINES ARE `none` — NOT WHICH LINES PRINT THE BINDING:**

1. **THE FOUR (FIVE, WITH THE `--fixture` REFUSAL) REFUSAL PATHS ARE REACHED BEFORE THE ONE ASSIGNMENT** (`§7.2` clauses 2/3), so **every refusal line prints the `none` triple** — `--groups=` · ports · `--home` · the `--fixture` refusal (for `A-1`…`A-4` and `S-6`). **THIS LIMB IS NOT WEAKENED, NOT NARROWED AND NOT RE-OPENED BY THIS AMENDMENT: it is the same reading `§16.5` ruled and it is the reading the greens MEASURED (`F-8`: *"the `--groups=` and `--fixture` refusal lines **do** carry the `none` triple"*).**
2. **THE `main().catch` PATH IS NOT A LINE THE ORDER FIXES, BECAUSE IT IS REACHED BY ABORTS BOTH BEFORE AND AFTER THE ASSIGNMENT.** It reads **THE STATE THE BINDING HOLDS AT THE ABORT**: on a **pre-assignment** abort that is the `none` triple (**the contracted reading**, and the only case the old phrasing was ever true of); on a **post-assignment** abort it is the selected set's own triple (`'mock data set <setName> selected'` / `'mock-data-set'` / `<setName>`). **`§7.2` clause 4's *"the `main().catch` path reads the same binding"* is therefore KEPT VERBATIM AND IS THE RULE; the assignment's POSITION is what makes the pre-assignment case `none`.** **`§7.2` clause 4 and the gate-2 note were only compatible if every catch throw happened before the assignment; a runtime error after it is the ordinary case, and the behaviour is coherent with clause 4.**
3. **WHY THE OLD PHRASING WAS UNSATISFIABLE, STATED SO IT IS NOT RE-FILED AS A CONTRADICTION:** as contracted, the arm's `main().catch` limb required the `none` triple **on any `main().catch` abort**, while the binding is assigned before every materialisation/import/connect path — so **a post-assignment abort necessarily printed the set, and an arm asserting `none` there was `RED` on every such run: an unsatisfiable arm of exactly the class the third gate-2 loop closed for `class-(b):tabs` (`§18`).**

**3. THE DISCRIMINATOR A TESTWRITER IMPLEMENTS — THE INSTRUCTION, STATED SO IT CAN BE WRITTEN INTO THE PIN AND INTO THE BATTERY.** **THE ARM KEEPS ITS NAME (`print-site:early-paths`), ITS `3×print-site` COUNT AND ITS FIVE-EARLY-SITE / TWO-POST-ASSIGNMENT CENSUS; ITS SUBJECT IS SPLIT IN TWO:**

1. **REFUSAL-LIMB (unchanged, `none` REQUIRED, source-derivable):** the printed state on the `--groups=` · ports · `--home` · `--fixture` refusal lines is the triple `'no fixture data set selected'`/`'none'`/`'none'`; **the selected set's name appears on NO refusal line**; a root field appears on no early line (`§17.6` clause 2, unchanged).
2. **`main().catch`-LIMB (the source half — GRADED IN THE PIN, ALWAYS SATISFIABLE):** the module-level catch's ERROR line must print the state **BY INTERPOLATING THE BINDING** — i.e. the line's state is `fixture=${JSON.stringify(UF_FIXTURE_STATE)}`-shaped, **the binding, NEVER A LITERAL**. **THE ASSERTION, EXACTLY: at the `main().catch` site the source interpolates `UF_FIXTURE_STATE` (a member access on the module-level binding), and it does NOT carry a hard-coded `{"state":"no fixture data set selected","kind":"none","id":"none"}` object, a `none` constant, or a second computation of the state (`§7.3` `D-5`'s one-read rule).** **THE NAMED MUTATION: replace the site's interpolation with a literal `none` triple (or with any constant) — the arm must go RED.**
3. **`main().catch`-LIMB (the LIVE half — GRADED BY THE BATTERY, CONDITIONAL BY CONSTRUCTION):** **THE `none` TRIPLE IS REQUIRED ONLY ON A PRE-ASSIGNMENT ABORT; ON A POST-ASSIGNMENT ABORT THE LINE MUST PRINT THE STATE THE BINDING HOLDS AT THE ABORT, AND IT MUST **MATCH** THE LAUNCH PROFILE'S OWN TRIPLE IN THE SAME RUN.** **HOW TO READ IT WITHOUT GUESSING THE ABORT'S POSITION: the abort's own position is observable in the artifact — an abort whose failure is a materialisation/import/connect/summary failure is a post-assignment abort (the assignment precedes them, `§7.2` clause 3); an abort before the assignment is a `pre-assignment` case and prints `none`.** **THE LIVE READING IS THEREFORE A PAIR: `(the ERROR line's triple) = (the launch-profile triple)` when the run assigned, and `= the none triple` when it did not** — and a **post-assignment abort printing `none`** is the offence this limb bites (the `§7.3` `D-2` stale-literal / `D-5` second-computation offence, in the one place it can still bite after this amendment).
4. **WHAT THIS LIMB MAY **NOT** BE READ AS ASSERTING, STATED SO THE CONTRADICTION CANNOT RETURN:** the `main().catch` limb asserts **neither** *"the `none` triple"* **nor** *"the selected set's name is never printed on an early line"* in the absolute. **The selected set's name is asserted at no REFUSAL site; on a post-assignment abort it is REQUIRED on the ERROR line.**
5. **THE PIN'S OWN STATE, RECORDED RATHER THAN SILENTLY TRUSTED (greens `F-2`'s closing note):** the pin's `print-site:early-paths` arm is **GREEN while the measured behaviour holds** — which is itself worth a look by the pin's owner, **because the arm evidently does not grade what the superseded prose said it graded.** **`OWED`, listed in `§21.4`: the pin's owner reconciles the arm's subject with clause 3 above (the source half is satisfiable and must be graded; the live half is the battery's).** **This pass contracts the reading; it does not edit the pin.**

**4. WHAT IS NOT AMENDED.** The four refusal lines' `none` triple; `§7.2` clause 4's *"reads the same binding"*; the assignment's single position after the refusals (`§7.2` clause 3, `§10.2.3` `state-derivation:order-after-refusals`); the one-read rule (`§7.3` `D-5`); the site census `5 + 2` and the `3×print-site` count; the root's absence at every early site. **NO REGISTER FIGURE MOVES.** **NO ARCHITECTURAL RULING IS REQUIRED OR REQUESTED ON THIS ITEM: the contract's own clause 4 already states the binding reading, the behaviour already exhibits it, and this pass only retires the two absolute sentences that made the arm unsatisfiable.**

### 21.2 `D-2` — THE TWO-SUPPLY REFUSAL MUST NAME THE OFFENDING FLAG: THE REQUIREMENT, ITS ARM, AND THE LANDED LINE AS AN `OWED` FINDING

**THE DEFECT (greens `D-2`, evidence row `B-1`; the greens' own disposition: *"observation (doc wording vs line specificity)"*, a row that **PASSED** its frozen predicate because *"names the set and `--seed=`"* was satisfied literally).** The blind writer read the printed line and found it names **the flag FAMILY** — `--fixture="core" together with an OBSOLETE SUPPLY flag (--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` — **rather than the flag actually supplied**, so a reader of a `--fixture=core --seed=…` artifact **cannot see from the line which flag the run carried**.

**1. WHAT THE CONTRACT ALREADY REQUIRED, AND WHAT IT LEFT UNDER-SPECIFIED (the decision this pass makes, stated as a reading rather than an invention).** **IT REQUIRED THE OFFENDING FLAG BY NAME, IN SUBSTANCE:** `§6.4` opens *"**is REFUSED BY NAME**"*; `§6.2` `B-2` states the offence the refusal exists to prevent as *"a run that carried BOTH supplies and **named only one of them**"* — *"one of them"* being the supply FLAG; and `§6.4`'s own operative clause is *"one named `ARG-REFUSED` line stating **both values**, the reason … and the fixture state"*. **WHAT IT LEFT UNDER-SPECIFIED IS THE WORD *"value"*:** `§3.3` clause 1 says the line *"names the offending value verbatim"*, and the greens could read the FAMILY LIST as *"the offending value"* of a *two-supply* offence, because no clause says in so many words that the **flag NAME** is required at its own site. **THE RULING IS THEREFORE A WRITING-OUT, NOT A NEW REQUIREMENT: see `§6.4`'s gate-5 block, item 1.** **IT IS RATED `NEEDED` (a named flag) RATHER THAN `CONTRACTED-AND-LANDED`, AND ITS REASON IS THE ONE THE GREENS GIVE: an agent who reads the line must know WHICH FLAG TO DROP — that is the refusal's own justification (*"the artifact must be able to attribute the store to ONE fixture"*, `§6.4`), and a family list answers it only after the reader re-reads the command line the artifact exists to make unnecessary.**

**2. WHAT THIS PASS WROTE (the graded requirement — `§6.4`'s gate-5 block, `§3.3` clause 1's gate-5 note, `§11.3` item 8's gate-5 note).** On the `S-6` / `B-2` path the line must name **(a)** the selected set (already contracted) and **(b)** the supplied flag **by its own name** — `--seed=` for a `--seed=` run, `--corpus-root=` for a `--corpus-root=` run, `--strict-seed` for a `--strict-seed` run, `--o0-corpus=` for a `--o0-corpus=` run, **plus the value it carried where it carries one**. **The family list MAY remain beside it** (exactly as the accepted-set list remains beside an `A-2` refusal); **it may not stand in its place.** **THE ARM: `route-supply-refusal:refused-by-name` (`§10.2.3`, `3×route-supply-refusal`) becomes gradable — four readings of ONE arm, one per supply flag, each asserting the flag the reading supplied; NO NEW ARM, NO COUNT MOVED, and no `67`/`57`, cap or seed figure touched.**

**3. THE LANDED TEXT IS A FINDING FOR THE IMPLEMENTER, AND THIS PASS DOES NOT CHANGE THE DRIVER.** `VERIFIED-BY-READ` at the driver's own `ARG-REFUSED` line on that path (`scripts/live-drive.mjs`, the four-supply refusal's single `console.log`): it names the set, the reason, the family list, the `empty`-set and `--no-seed` clauses and the state — **and names no single supplied flag.** **`OWED` → `§21.4` item 2.** **THE REFUSAL'S OTHER LIMBS ARE UNMOVED:** one line, pre-spawn, exit `2`, nothing spawned, nothing written (`§3.3` clauses 3/4), `--no-seed` never an offence (`§6.4` clause 3), `empty` not exempt (`§6.4` clause 2), the four flags the whole trigger set (`§6.4` clause 1).

### 21.3 `D-3` — THE `stage_*` FIGURE RECONCILED TO **`7`**: `7 + 5 = 12`, AND THE REMAINDER THAT DEPENDED ON IT

**THE DEFECT (greens `D-3`, fail ledger row `F-4`, which dispositions greens row `H-9`; `H-9` FAILED).** `§5.2`'s population cell (corrected in place by `§17.2` to *"the authority names `eight` … the eighth is `stage_refresh_survival_v5`"*), `§17.2`'s ruling, `§17.13` item 2, `§18.6` item 4 and `§20.2` clauses 2/3 assert **`eight` `stage_*` keys** with **`8 + 5 = 13`** and **remainder `18`**, **while the contract's own authority — `§16.17` item 2's enumeration — counts `7` `stage_*` + `5` `o0_*` = `12`.** **MEASURED by the blind writer, two independent instruments, same answer (greens `F-4`): the landed `UF_FIXTURE_DECLARATION` gives among the `31` gated `'corpus-documents'` keys `stage_*` = `7` and `o0_*` = `5` ⇒ `7 + 5 = 12`, remainder `19`; and `§16.17` item 2's own list prints the same `7` names and `5` names.**

**1. THE RECONCILED FIGURE, WITH ITS ARITHMETIC AND ITS LABEL.**

| Figure | The reconciled reading | Its label |
| --- | --- | --- |
| **gated `stage_*` keys inside the `31`** | **`7`** — `stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r` | **`RECORDED READING`** (measurer: the blind greens pass, on the landed declaration literal, greens `H-9`) **CORROBORATED `VERIFIED-BY-READ`** (reader: this pass, over `§16.17` item 2's own enumeration — **THE AUTHORITY**) |
| **gated `o0_*` keys inside the `31`** | **`5`** — `o0_document_row` · `o0_folder_row` · `o0_gpu_control` · `o0_repeat_determinism` · `o0_track_ablation` | **`VERIFIED-BY-READ`** (unchanged) |
| **the gated family arithmetic** | **`7 + 5 = 12`, leaving `19` in the remainder, and `12 + 19 = 31`** | **`VERIFIED-BY-READ`** by subtraction over the enumeration |
| **the `31` it sits inside** | **`31`, UNMOVED** (`31 = 30 + 1`; `31 + 3 + 1 = 35`; `47 − 3 − 9 = 35`) | **`RECORDED READING` + `VERIFIED-BY-READ`** (`§20.1`), **unmoved** |
| **the superseded figures, kept visible** | **`8` `stage_*` · `8 + 5 = 13` · remainder `18` · `13 + 18 = 31`** | **`SUPERSEDED`** at every site that carried them (`§21.3` clause 3) |
| **what `13` and `18` still mean, and why they are not struck** | **`8` counts the DECLARED `stage_*` family** — the `7` above **plus `stage_tabs_persist_roundtrip`, a `corpusRead:false` key of the never-gated group** (`§2.1` group 4, greens `H-2`) — **and `13 = 8 + 5` is that DECLARED family beside the `5` `o0_*`, with `18` ITS remainder (`13 + 18 = 31`)**; **inside the `31` the same family is `12 = 13 − 1`.** **`stage_tabs_persist_roundtrip` is NOT one of the `31`, which is the whole of the error**: `§17.2` added a never-gated key to a GATED count. | **`VERIFIED-BY-READ`** |

**2. WHY THE ENUMERATION RULES — THE SAME PRECEDENCE THE `§20` CENSUS AMENDMENT ESTABLISHED, APPLIED TO THIS FIGURE.** `§16.17` item 2 is *"THE GATED `'corpus-documents'` KEYS, EXHAUSTIVELY"*, **the list `§16.10` calls the authority and `§20.2` calls *"the authority over the stale figure"***; `§17.12`'s ruling is *"AT THE ASSERTION SITE THE DECLARATION LITERAL IS THE EXHAUSTIVE AUTHORITY AND EVERY PROSE INVENTORY IS ILLUSTRATIVE … a prose cell that disagrees with the literal is RED BY READ"*. **THE `eight` WAS A PROSE FIGURE (`§17.2`'s ruling over `§5.2`'s cell) WHOSE SOURCE WAS ITSELF A PROSE NOTE — *"the authority names `eight`"* — AND THE AUTHORITY NAMED SEVEN.** **`§20`'s own reconciliation of `25` → `31` was made on exactly this ground; this pass applies it to the family figure `§20` left marked *"unmoved"*, and the `§20` rulings it touched are annotated beside, never rewritten.**

**3. THE SITE REGISTER — every site this figure reached, each with its superseded text kept visible.** **Items 1–6 are the sites the greens named; items 7–12 are the dependant sites the same figure reached and this pass swept.**

1. **`§5.2`'s `'corpus-documents'` population cell** (greens `F-4`'s first cited site) — the prose list *"the seven `stage_*` and the five `o0_*` keys"* and the `§17.2` correction laid over it. **AMENDED, marked** (the gate-5 marker is written at the cell's own sentence and at the second table's cell).
2. **`§17.2`'s heading and ruling** (greens `F-4`'s second site) — *"SAID **`seven`** `stage_*`: THE AUTHORITY NAMES **`eight`**"*, the ruling *"THE COUNT IS `eight` … `8 + 5 = 13`, NOT the `12` the filed `seven` implied"*, and its *"the enumeration agrees with them exactly"* clause (which the greens' two instruments falsify). **AMENDED BESIDE, with this section's closing block stating the reversal and its two grounds.**
3. **`§16.17` item 2's trailing family sentence** — *"THE `eight`/`five`/`13` FAMILY FIGURES … ARE UNMOVED"* and the `13` − `4` = `9` sub-derivation. **AMENDED BESIDE, marked:** the list's own tokens are `7 + 5 = 12` with remainder `19`, and the `9` is re-derived **without** `13` (`4` hand-listed `stage_*` + `5` `o0_*`).
4. **`§17.13` item 2** — *"THE STAGE FAMILY (`§17.2`): `eight` `stage_*` + `five` `o0_*` = `13`"* and the sentence *"The filed `seven` and its implied `12` are `SUPERSEDED`"*. **AMENDED BESIDE, marked — the filed `seven` was right.**
5. **`§18.6` item 4's figure enumeration** — *"the `eight` `stage_*` + `five` `o0_*` = `13` family"*. **AMENDED BESIDE, marked** (`§21.3` clause 3, item 5's marker is written at the enumeration itself).
6. **`§20.2` clause 2** (greens `F-4`'s third site) — *"`stage_*` **`8`** (its own bracketed note, `§17.2`) + `o0_*` **`5`** = **`13`**, leaving **`18`** in the remainder"* — and **`§20.2` clause 3**'s `13` − `4` = `9`. **AMENDED BESIDE, marked**; the `31`, the `35`, the `16`-term's `OWED` status and the section's authority clause are unmoved.
7. **`§20.3` item 14** — *"THE `eight stage_* + five o0_* = `13` FIGURE AND THE `8 + 5 = 13` ARITHMETIC ARE UNMOVED — they are this ruling's own content and the enumeration agrees with them."* **AMENDED BESIDE, marked** (this is the gate-4 marker that carried the wrong claim forward).
8. **`§16.17` item 2's gate-4 marker** — the same *"UNMOVED … the enumeration agrees"* clause. **AMENDED BESIDE, marked.**
9. **`§17.2`'s gate-4 marker** — *"the ruling's own `eight stage_*` / `5 o0_*` / `13` family figures are UNMOVED"*. **AMENDED BESIDE, marked.**
10. **`§18.6` item 4's gate-4 marker** — *"the `eight`/`five`/`13` family … ARE UNMOVED"*. **AMENDED BESIDE, marked.**
11. **The gate-4 markers that carried the wrong figure forward** — the markers beside `§2.1`'s `F-1` footnote, `§5.2`'s population cell, `§16.17` item 2, `§17.13` item 2, `§18.6` item 4 and `§20.3` item 14, **each closed with a variant of *"the `seven`/`eight` correction … and the `13` family figure are UNMOVED"* / *"the enumeration agrees with them exactly"*.** **AMENDED BESIDE, marked — a gate-5 marker is written at each site (`§5.2`'s population cell carries it twice: once at the cell's own sentence and once at the `'corpus-documents'` row's close), each stating that the `eight`, the `8 + 5 = 13` and the `remainder 18` are `SUPERSEDED` while the `31`, the `o0_*` `5` and the DECLARED-family sense of `13`/`18` stand.**
12. **The dependent arithmetic that rode the figure** — `§18.6` item 4's enumeration (`§21.3` clause 3 item 5) and `§20.3` item 14's *"ARE UNMOVED"* clause (`§21.3` clause 3 item 7). **AMENDED BESIDE, marked; no other site in this file printed `8 + 5 = 13` or the remainder `18`, and the `21 + 13 = 34` route split is a DIFFERENT quantity and is untouched.**
12. **`§17.13` item 2's gate-4 marker** — *"THE `eight`/`five`/`13` FAMILY FIGURES AND THE `seven`-vs-`eight` CORRECTION ARE UNMOVED"*. **AMENDED BESIDE, marked.**

**4. WHAT IS NOT MOVED, BY NAME, SO THE RECONCILIATION CANNOT BE READ AS A GENERAL CENSUS EDIT.** **The `31`; the `35 = 47 − 3 − 9 = 31 + 3 + 1`; the `47`; the `3`; the `9`; the `30`; the `16 + 9 = 31` split; the `25`-lineage's `SUPERSEDED` status; the register (`17 + 12 + 11 + 27 = 67`, executed `57`, the four rows' `27`/`10`/`17`, the three caps, the seed `0x20261005`); the `21 + 13 = 34` route split of UNIT A's own records (`13` THERE is the `DIAG` route census — a DIFFERENT quantity, and the greens verified it as `13`, greens `H-13`); the probe set `3` non-null + `2` null; the state's `3` members; the observation's `3` park members; the physical sites `5 + 2`; the five set names; every probe literal; and the `o0_*` family's own `5`.** **`13` IS NOT STRUCK ANYWHERE: it is re-scoped to the DECLARED family census (and stands untouched in its route-split sense).** **NO ARM'S COUNT CHANGES AND NO REGISTER TERM READS THIS FIGURE** (`§20.4` clause 3's rule, standing).

**5. NO ARCHITECTURAL RULING IS REQUIRED ON THIS ITEM:** the precedence rule that decides it is already this file's own (`§17.12`, `§20.2`), the enumeration is already the declared authority, and the correction is a figure the document can derive from its own list. **A figure, not a contract question.**

### 21.4 `D-4` — THE FIXTURE DATA LITERAL IS NAMED: `UF_MOCK_FIXTURE_SETS`, AND ITS SHAPE

**THE DEFECT (greens `D-4`; its evidence rows are the greens' `[T]`-class set-content rows `C-1`…`C-8`).** The contract named the DECLARATION (`UF_FIXTURE_DECLARATION`), the registry (`UF_DECLARED_FIXTURE_PROBES`) and the state (`UF_FIXTURE_STATE`), **but no symbol or shape for the fixture DATA**: `§2.3` clause 3 said the content is *"pure string data in `scripts/live-drive.mjs`"* and stopped there, so a blind reader **could not derive the set-content rows from the document alone** and had to read the sets' content by mechanical sweep (the greens took `C-1`…`C-8` from the materialised files and cross-checked them with a data-region extractor).

**1. THE SYMBOL AND ITS SHAPE (the reading written beside `§2.3` clause 3, and named again at `§1.2`'s deliverable row).** **`UF_MOCK_FIXTURE_SETS`** — a module-level literal in `scripts/live-drive.mjs`, the sets' single declaration: **`UF_MOCK_FIXTURE_SETS[<setName>] = { files: [<basename>…], docs: { <basename>: <markdown string> } }`**, keyed by the five set names (`core` · `table` · `search` · `tabs` · `empty`), where **`files`** is the per-set FILE LIST **as basenames with their extension** (THE SET-FILE-LIST CONTRACT — `§2.1`'s file column, `§10.2.3`'s `3×set-file-list`), **`docs`** maps each basename to **that document's hand-authored markdown text** (`§2.3` clause 3), and **`empty` carries `files: []` / `docs: {}`**. **THE THREE COMPANION LITERALS, NAMED BESIDE IT SO THE WHOLE DATA REGION IS DERIVABLE: `UF_MOCK_FIXTURE_TERM`** (the probe's own single constant term — the term the sets and the probe read **TOGETHER**, `§5.3` clause 1), **`UF_MOCK_FIXTURE_ROOT`** (`(id) => '.live-fixture/<id>/'` — the root derived from the set identity, never a second literal, `§2.3` clause 1 / `§2.4`) and **`UF_MOCK_FIXTURE_NOT_MATERIALISED`** (the *"no SET was materialised"* reading, `§17.11`). **`VERIFIED-BY-READ`** (reader: this pass, at the driver's data region) — **the symbol names are the landed ones, so the document and the code now use ONE vocabulary.**

**2. WHAT THE NAMING MAKES DERIVABLE, ROW BY ROW, FROM THIS DOCUMENT ALONE.** The sets' file census and file ORDER (`C-2`…`C-6`) from `files`; the content properties of `§2.2` (`P-α`…`P-ζ`) from `docs`; the term's carriage per set (`P-δ`; `FA-1`'s *"`search` carries none"* half; `C-8`) from `docs` read against `UF_MOCK_FIXTURE_TERM`; the `<table>`-bearing document that makes `table` the ONLY set carrying `P-β`; the inline-element document carrying `P-γ` in every document-carrying set; and the document identity each file acquires on import (`§2.4`) from `UF_MOCK_FIXTURE_ROOT(id)` + the basename.

**3. WHAT IS NOT MOVED BY THE NAMING, AND WHAT REMAINS `OWED` TO THE LANDING PASS.** The data's FORM (pure string data in the driver source), the committed-data variant's admissibility (`§2.3` clause 5), the root and identity scheme, the no-stale rule, and the sets' own names, file lists and properties. **THE TERM'S LITERAL VALUE AND THE TERM-BEARING FILE'S EXACT BYTES STAY THE LANDING PASS'S** (`§13.3` item 2/7(c)) — **the naming changes what a reader can FIND, not what the landing owes.** **NO ARCHITECTURAL RULING IS REQUIRED: this item is a naming gap, and the symbol exists.**

### 21.5 `OWED` AFTER THIS PASS, AND WHAT THIS PASS DELIBERATELY LEFT

**1. `OWED` — THE IMPLEMENTER / PIN ITEMS THIS PASS NAMES BUT DOES NOT PERFORM** (each is a finding for its owner, recorded so it is not silently absorbed):

1. **THE TWO-SUPPLY REFUSAL'S TEXT** must name the offending flag by its own name (`§6.4`'s gate-5 block, `§21.2`); the landed line names the family.
2. **THE PIN'S `print-site:early-paths` ARM** must be reconciled with `§21.1` clause 3: grade the **source** limb (the `main().catch` site interpolates the binding, with its named mutation) and leave the **live** limb (`none` on a pre-assignment abort / the binding's reading on a post-assignment abort) to the battery. **Greens `F-2` records that the arm is GREEN while the superseded prose says otherwise** — the arm's subject and the prose must be brought back into agreement by the pin's owner.
3. **THE FILE'S POST-AMENDMENT LINE COUNT AND ITS `sha256`/`md5`** (`§14` item 1, `§18.8` item 1, `§20.4` clause 1 — all standing, all `OWED`): **this pass holds no shell**, and the pre-edit readings supplied to it (`md5 23b3fa5eaeee2e6f73b103f3e515ae7b`, `3041` lines) are `RECORDED READING`s of the head this pass received. **Its own post-amendment line census is `OWED` — the figure is not guessed here.**
4. **THE `16`-HAND-LISTED SUB-COUNT OF THE `'corpus-documents'` SPLIT** and **the `9`'s re-derivation** (`§16.17` item 2's gate-5 block): the `16` stays `OWED` exactly as `§20.2` clause 3 left it; this pass neither invents nor re-derives it.
5. **THE FIXTURE-DATA-ADJACENT ITEMS ALREADY `OWED` AND UNMOVED BY THIS PASS:** the probe term's literal, the term-bearing file's bytes, the self-provisioner resolver's helper shape, and the `mock-data-set` consequence sentence's exact text (`§13.3` items 2/7(a)(b)(c), `§18.8` item 2).

**2. THE BEHAVIOUR FINDINGS THIS PASS DELIBERATELY DID NOT TOUCH, WITH THE REASON** — **a documentation pass may not amend a contract to match a broken reading, and may not repair a driver:**

| Greens finding | Why this pass leaves it | Owner |
| --- | --- | --- |
| **`F-1`** (`E-1` `E-2` `E-4` `E-8` `E-10`) — **the `F-2` discharge is not exhibited**: both rendered-fixture probes read ABSENT in EVERY set (`rag.query → 0 hit(s)`; `dom:#tab-strip … → 0 rendered row(s)`) even where the same run's blocks read `strip: 2 tabs`. | **A BEHAVIOUR finding, and `§5.5`'s own rule already forbids claiming the closure** (*"a landed state in which either still rides `rag.list_documents` is `F-2` unclosed and this unit's DONE row may not claim it"*). **This pass writes no contract text to cover it**: `§18.1` clause 3 / `§18.2` clause 1's premise (*"`core`/`table`/`search` leave a document tab open at launch"*) is falsified **BY MEASUREMENT**, and a premise falsified by a run is fixed by a run's owner — the landing pass — not by re-wording this file. **The greens' `D-8` is the same finding at `§5.5`.** | **the landing pass (driver-side: the store-query limb's call/reply extraction and the DOM limb's read point)** |
| **`F-3`** (`E-10`) — the `table` set does not unpark the row it exists for. | **A behaviour/app-layer finding**: the fixture and candidate wiring landed as contracted; the imported document does not render a table on the page-edit surface. `§2.1`'s `F-2` claim and `§16.11`'s *"MUST REJECT a `PARK`"* stand as the acceptance predicate they are. | **the landing pass / the app layer (the row's namesake limitation)** |
| **`F-5`** (`I-3` as the blind writer froze it) — the sweep predicate was over-broad. | **A greens-set row-scope defect on the blind writer's side**, explicitly recorded as such in its own artifact; the contracted arm (`repin-completeness:self-provisioners`) **PASSES**. | **nobody — closed in the greens artifact** |
| **`D-6`** — the `10×class-(b)` terms are NOT-RUN in the landed register. | **A process finding under `RCA-11` clause (a)**: it gates the unit's DONE row, not this document's text. | **the supervisor's DONE-row gate** |

**3. THE FIGURES THIS PASS TOUCHES, AND THE FIGURES IT DOES NOT — stated in one place so a later pass does not re-derive them.** **TOUCHED: exactly one figure (`stage_*` `8` → `7`) and the two dependants of it (`8 + 5 = 13` → `7 + 5 = 12`; remainder `18` → `19`), plus one requirement made gradable (the offending flag's name) and one symbol named (`UF_MOCK_FIXTURE_SETS`).** **UNTOUCHED: the register (`17 + 12 + 11 + 27 = 67`, executed `57`, the three caps, the seed `0x20261005`); the `47` · `3` · `9` · `35` · `31` · `30` · `16 + 9` census; the `3×print-site` count and the `5 + 2` site census; the five set names; the probe sentinels; the state's three members; the observation's three park members; the `21 + 13 = 34` route split.** **AND THE HEAD'S OWN STATUS, RESTATED SO A FRESH READER NEEDS NO OTHER FILE: the unit remains `PROPOSED`; this pass closes four documentation defects and claims no landing, no arm, no register figure and no DONE row.** **⟨GATE-7 PROOFREAD PASS `2026-10-05` — THREE OF THIS CLAUSE'S ITEMS ARE DISCHARGED AT THE LANDED HEAD, AND THE SUPERSEDED `OWED` STATUS IS KEPT VISIBLE ABOVE: item `1` (the two-supply refusal's flag-by-name text) IS MET — the driver names each supplied flag BESIDE the family list (`VERIFIED-BY-READ` at its own line; `§23.2`); item `3`'s line-count half is ANSWERED with a `VERIFIED-BY-READ` census instead of a guess (`9681` for the driver, `17066` for the pin, `3367` for THIS file after `§23`, `578` for the greens set and `418` for the live battery — all `VERIFIED-BY-READ`, reader: the gate-7 proofreader; the `sha256`/`md5` of THIS file remain `OWED` — this pass holds no shell); and item `2` (the pin's `print-site:early-paths` reconciliation) REMAINS `OWED` to the pin's owner, unmoved. THE BEHAVIOUR FINDINGS OF ITEM `2`'s TABLE ARE ANNOTATED AT THE BLIND GREENS' OWN SITES AND AT `§23.2`: `F-1`'s store-query half is CURED and its `dom:` half is the ruled SKIP; `F-3` IS CURED (the `table` row reads `verdict=PASS`); `F-5` and `D-6` stand as this pass left them.**⟩**

---

## 22. ⟨GATE-5 RULING `2026-10-05`⟩ THE ARCHITECT'S ADAPTATION RULING ON THE BLIND GREENS' `F-1` AND `F-3` — **THE MOCK DATA IS ADAPTED, THE `tabs` LIMB IS SKIPPED-BY-RULING, AND THE CONTRACTED READINGS ARE UNCHANGED** — **ITS SITES, ITS SUPERSEDED TEXT, ITS MARKERS, ITS SKIP WORDING, AND WHAT IS `OWED`**

**WHAT THIS PASS IS, AND WHAT IT IS NOT.** This pass **applies an ARCHITECT'S RULING** — a ruling, not a proposal, and **not re-litigated here**. **THE AUTHORITY, VERBATIM (`2026-10-05`, the architect's gate-5 ruling on `U-MOCK-CORPUS-FIXTURE-SETS`, `HEAD f124358`):**

> ***"Adapt the mock data to function with the query. If the tabs are awaiting a later unit to adapt to the foundation tooling then skip testing."***

**THE RULING ANSWERED THE GATE-5 BLIND GREENS' TWO BEHAVIOUR FINDINGS.** The greens artifact is `docs/specs/unit-mock-corpus-fixture-sets-greens.md` (**`568` lines · `100` frozen rows `+` `3` disclosed post-freeze rows · `80` PASS · `9` FAIL · `3` PARTIAL · `7` NOT-TESTABLE-HERE · `2` OBSERVED · `2` REVIEW-ONLY across all `103`**). **THE READING THE RULING ANSWERS WAS TAKEN AGAINST IT BY THE IMPLEMENTER'S DIAGNOSIS AND ITS OWN LIVE RUNS (isolated ports `3970`–`3978` / `9470`–`9478`, `--display=:0`, a scratch `--home`; **port `9222` NEVER used**).** **THIS PASS RAN NOTHING.**

**THE DISCIPLINE OBSERVED, STATED SO IT CAN BE CHECKED (`RCA-8(c)` ANNOTATE-BESIDE):** **NOT ONE FILED CLAUSE IS REWRITTEN IN PLACE.** Every amended site keeps its filed text **VISIBLE**, marked `SUPERSEDED` where the two readings contradict, and carries a dated **⟨GATE-5 RULING `2026-10-05` …⟩** marker naming **the ruling**, **the greens row / measured reading** that grounds it, and the **decision row** it rests on. **NO SECTION IS RENUMBERED** (this register is `§22`, appended after the earlier gate-5 amendment register `§21` in the file's own pattern). **NO REGISTER FIGURE MOVES** — the fourth register's `17 + 12 + 11 + 27 = 67`, executed `57`, the caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows, the seed `0x20261005`, and the census `47` · `3` · `9` · `35` · `31` · `3` · `1` are all `UNMOVED`. **NO SECTION NUMBER, NO `arm(` COUNT, NO SET NAME, NO PROBE SENTINEL AND NO BLOCK KEY IS TOUCHED.** **WHAT THE RULING CHANGES IS THE DATA'S FORM AND ONE LIMB'S STATUS — NEVER A READING.** **THIS IS A DOC-LAYER PASS: read/search + doc-writes, RAN NOTHING (no suite, no leg, no battery, no `md5sum`/`sha256sum`, no `wc -l`), and touched no `scripts/**`, `tests/**` or `src/**` byte.**

**THE THREE ITEMS THE RULING DECIDES.**

| # | The item | One-line disposition |
| --- | --- | --- |
| **(i)** | **THE MOCK SETS' CONTENT AND THE STORE'S LEXICAL INDEX** — `rag.query` reads `0 hit(s)` under **every** set, `--fixture=core` included. | **ADAPT THE DATA** so the probe's own constant term reaches the lexical index by the app's own import path: `rag.query` for that term returns **`>= 1` hit under `--fixture=core`** (`§18.6` clause 3's `FA-4` control). **The reading is unchanged; the data's form is `OWED`.** (`§22.2` item 1) |
| **(ii)** | **THE `dom:` PROBE AWAITING THE LATER UNIT** — `dom:#tab-strip .tab[data-document-id]` can never match at this head. | **SKIP TESTING** — the `corpus-document-tabs` live limb is **SKIPPED-BY-RULING** with its reason recorded; **NOT a pass**; the `F-2`-closure claim may not be reported as discharged for it. (`§22.3`) |
| **(iii)** | **THE `table` SET'S CONTENT FORM** — `P-β`'s raw-`<table>` literal is discarded by the app's own import. | **THE RAW-LITERAL FORM IS `SUPERSEDED`**; the binding form is the **parser-mediated GFM pipe table**; `§16.11`'s predicate (REJECT a `PARK`) is **unchanged**. (`§22.2` item 3) |

**AND THE SITE INDEX — EVERY SITE THIS PASS MARKED, SO THE SWEEP IS CHECKABLE.**

| # | The site | Which item | What was added |
| --- | --- | --- | --- |
| 1 | **the file's head** (the `⟨GATE-5 RULING `2026-10-05`⟩` block above the prose preamble) | all three | the ruling verbatim, the three disposals, the `NOT TOUCHED` list |
| 2 | **`§2.1`'s `F-2` (`table`) cell** | (iii) | the parser-mediated requirement, its reason, its measured before/after, and the unchanged `§16.11` predicate |
| 3 | **`§2.1`'s `F-4` (`tabs`) cell** | (ii) | the set's surviving limb (`search.md` present and unopened) beside the `SUPERSEDED` non-open-tab contrast and the SKIP pointer |
| 4 | **`§2.2`'s `P-β` row** | (iii) | the same requirement restated at the property's own row |
| 5 | **`§2.2`'s `P-θ` row** | (ii) | the probe-reading limb marked **SKIPPED-BY-RULING / NOT a pass**, the property's carrier unchanged (`F-4` only) |
| 6 | **`§5.2`'s first table, `'corpus-query-results'` row** | (i) | the store-query limb's status: `OWED` to the adapted data, with the `0 hit(s)` reading recorded and the reason it reads `0` |
| 7 | **`§5.2`'s second table, `'corpus-document-tabs'` row** | (ii) | the selector's status: the literal exists only in the driver; the limb is SKIPPED-BY-RULING |
| 8 | **`§5.2` clause 1's gate-2 note** | (ii) | the same, at the clause that contracts the two probe forms |
| 9 | **`§5.5` (the `F-2` falsifier's closing paragraph)** | (i) + (ii) | the two limbs' DIFFERENT dispositions (store query `OWED`; DOM read SKIPPED), the predicate unchanged |
| 10 | **`§10.2.3`'s `SET-SHAPE` arm row** | (iii) | `set-shape:table`'s subject narrowed to the parser-mediated form; the mutation's shape and the arm's count unchanged |
| 11 | **`§11.3` item 3 (`class-(b):search`)** | (i) | the probe limb `OWED`; item 1's filed PRESENT reading NOT amended |
| 12 | **`§11.3` item 4 (`class-(b):tabs`)** | (ii) + (i) | the `corpus-document-tabs` limb SKIPPED; the `'corpus-query-results'` limb `OWED` |
| 13 | **`§16.6` (BLOCKING 6)** | (ii) | the section's claim that the landed surface is `#tab-strip .tab[data-document-id]` marked **WRONG AT THIS HEAD / SUPERSEDED**, with the exemption cited |
| 14 | **`§16.11` (NON-BLOCKING 11)** | (iii) | the predicate `UNCHANGED`; the data-form adaptation named |
| 15 | **`§16.17` item 1 (the set inventory)** | (iii) + (ii) | both readings amended beside; the inventory's files and counts unmoved |
| 16 | **`§18.1` clause 3** | (ii) | the tab-open premise recorded as `REFUTED BY MEASUREMENT` / `SUPERSEDED`, with the blind instrument named |
| 17 | **`§18.2` clause 1's `'corpus-document-tabs'` bullet** | (ii) | the filed parenthetical `REFUTED BY MEASUREMENT`; the limb's status; the literal unchanged |
| 18 | **`§18.6` clause 1(iv)** | (i) | the cross-run falsifier `UNCHANGED`; the collision reading recorded as falsified as measured, with the data as the remedy |
| 19 | **`§18.6` clause 2(i)** | (ii) | the conjunct SKIPPED-BY-RULING, NOT a pass |
| 20 | **`§18.6` clause 3** | (i) + (ii) | the second limb named as the ruling's own `OWED` outcome; the third limb SKIPPED; the `parkedByFixtureAbsence is 0` limb stands |
| 21 | **this register (`§22`)** | all three | the ruling verbatim, the site index, the SKIP wording, the `OWED` list and the `NOT DONE` list |

**AND THE FOUR `⟨GATE-5⟩` MARKERS THAT ARE ALREADY ON THE FILE AND ARE NOT THIS PASS'S** — `§21`'s four documentation defects (`D-1` · `D-2` · `D-3` · `D-4`) stand exactly as that pass left them, **unmoved by this ruling**: `D-1` (the `main().catch` binding), `D-2` (the two-supply refusal's flag naming, `OWED` to the implementer), `D-3` (the `stage_*` figure `7 + 5 = 12`, remainder `19`), `D-4` (`UF_MOCK_FIXTURE_SETS` named). **AND `§21.5` clause 2's own reading of greens `F-1` / `F-3` — *"a premise falsified by a run is fixed by a run's owner — the landing pass — not by re-wording this file"* — IS NOT CONTRADICTED BY THIS PASS: the architect has since ruled WHICH side moves (the DATA, not the reading, and not the driver's probe), and this pass writes that ruling down. `§21.5` clause 2's two rows stay visible as the superseded OWNER ASSIGNMENT; `§22.2`/`§22.3` are the current one.**

### 22.1 THE MEASURED FACTS THIS RULING ANSWERS — EACH WITH ITS LABEL AND ITS INSTRUMENT

**EVERY FIGURE BELOW IS A `RECORDED READING` OF ANOTHER PASS (THE GATE-5 BLIND GREENS AT `docs/specs/unit-mock-corpus-fixture-sets-greens.md`, AND THE IMPLEMENTER'S DIAGNOSIS WITH ITS OWN LIVE RUNS). THIS PASS TOOK NO READING OF ITS OWN AND HOLDS NO SHELL — ANY READER WHO WANTS TO RE-TAKE ONE MUST RUN IT, NOT QUOTE IT FROM HERE.**

| # | The measured fact | Its source row / instrument | Label |
| --- | --- | --- | --- |
| **1** | **Every `rag.query` reads `0 hit(s)` under EVERY set — `core`, `search` and `tabs` alike, including a bare stopword-free term.** | greens `E-1` · `E-4` · `E-8`; the implementer's live runs, scoped to `uf_panes_14` and to `uf_tabs_1,uf_panes_14`, on isolated ports with a boot-and-connect confirmed | **`RECORDED READING`** |
| **2** | **The store's shape at the park: `9` nodes, `3` of them carrying the term, and every query still `0`.** | the implementer's diagnosis of the store's lexical index at this head | **`RECORDED READING`** |
| **3** | **The diagnosed reason, in one line: the lexical index is built at engine construction from the EMPTY store and is reconciled on import with document ROOT ids only, while `parseMarkdown` puts the body into separate `:section:`/`:p:` nodes and leaves the root's own `content` empty — so no term-bearing node reaches the index.** | the implementer's diagnosis (its instrument: the import reply's own `documentIds` and the store's node census) | **`RECORDED READING`** |
| **4** | **The `dom:` probe's reading is `0 rendered row(s)` in EVERY set, including runs where the same app renders `2` document tabs (the greens' `uf_tabs_1` control).** | greens `E-2` · `E-7`; the implementer's live runs | **`RECORDED READING`** |
| **5** | **The literal `data-document-id` exists in the RENDERER for PANES (`src/renderer/pane-graph.ts`) and never on `#tab-strip .tab` — `src/renderer/tab-strip.ts` authors only `data-tab-id` + `data-target-kind`, so the contracted selector can never match.** | the ruling's own recording of the implementer's read of the two renderer modules | **`RECORDED READING`** |
| **6** | **At the probe's own pre-gesture read point under `core`, the strip holds ONE NON-DOCUMENT `landing` tab — so the premise *"`core`/`table`/`search` leave a document tab open at launch"* is FALSE.** | the implementer's live run under `--fixture=core` | **`RECORDED READING`** |
| **7** | **The `table` set's controlled before/after: raw-HTML form → `no table node`, `census=0`, `PARK`; GFM pipe-table form → `:table:`/`:thead:`/`:th:`/`:tr:`/`:td:` nodes, rendered table census `{"tables":1,"trs":1,"tds":4}`, verdict `PASS`.** | the implementer's diagnosis: `--fixture=table --block=u_edit_1_live_package_table_limitation` against the two content forms | **`RECORDED READING`** |
| **8** | **The greens' own tally, so this pass is not quotable beyond it: `9` FAILs (`E-1` · `E-2` · `E-4` · `E-8` · `E-10` · `F-8` · `F-9` · `H-9` · `I-3`), `7` NOT-TESTABLE-HERE, `3` PARTIAL, `2` OBSERVED, `2` REVIEW-ONLY.** | the greens artifact's own `§4.1` tally over `103` rows | **`RECORDED READING`** |

### 22.2 THE AMENDED REQUIREMENTS — THE THREE ITEMS, EACH AS A READING A TESTWRITER CAN GRADE

#### 22.2 item 1 — THE MOCK SETS' CONTENT AND THE STORE'S LEXICAL INDEX (ruling sentence 1)

**1. THE REQUIREMENT, STATED AS THE OUTCOME (the binding clause).** **THE MOCK SETS' DOCUMENT CONTENT MUST BE CARRIED IN A FORM WHOSE TERM ACTUALLY REACHES THE STORE'S LEXICAL INDEX BY THE APP'S OWN IMPORT/MATERIALISATION PATH** — the path this unit already owns (the sets' bytes plus their materialisation, `§2.3`, `§2.4`). **THE ACCEPTANCE CRITERION IS `§18.6` clause 3's `FA-4` CONTROL, AND IT IS UNCHANGED: under `--fixture=core`, `rag.query` called with the probe's own constant term (`§5.3` clause 1, `§18.2` clause 3) returns **`>= 1` hit**, so `'corpus-query-results'` reads PRESENT and no gated key parks for the store query's absence. **THE SAME READING IS REQUIRED UNDER `--fixture=tabs` — `tabs` carries the term-bearing `search.md` — and it is the `'corpus-query-results'` limb of `§11.3` item 4 that stands after the skip (`§22.3` items 1/2).** **`--fixture=search` MUST READ `0` HITS, BY CONSTRUCTION (`§2.1` `F-3`).**

**2. WHAT THE DATA MUST CARRY — TWO CLAUSES A TESTWRITER CAN GRADE FROM THE SET'S OWN CONTENT PLUS ONE QUERY.** **(a) THE TERM MUST BE CARRIED IN THE DOCUMENT TEXT AS THE APP'S OWN PARSER SEES IT AFTER IMPORT — the text's own body, not an annotation the parser discards.** **WHY THIS IS STATED PLAINLY: a term carried merely as a comment, a heading the import drops, a code fence the decomposer excludes, or inside RAW HTML (which `parseMarkdown` drops entirely, element + content) IS INVISIBLE TO THE INDEX, so a term that "appears in the document" is not yet a term in the index.** **(b) THE PROBE'S OWN CONSTANT TERM IS THE TERM IN QUESTION** (`UF_MOCK_FIXTURE_TERM`, `§2.3`'s gate-5 block, `§5.3` clause 1): the sets and the probe read ONE declaration, so the data and the probe cannot drift apart (`§5.3` clause 1(c)).**

**3. WHERE THE IMPLEMENTER'S OWN FREEDOM LIES, AND WHERE IT DOES NOT.** **THE RULING NAMES THE SUBJECT (the mock data) AND THE OUTCOME (the query functions); it does NOT name the content form, the file the index takes its term from, or any identifier.** **`OWED` TO THE IMPLEMENTER, and to no other pass: the specific form — the document text's own layout, the term's placement inside it, and any content restructuring the index requires within the set's own files.** **WHAT MAY NOT MOVE: the five set names · the per-set file lists of `§2.1` (including `search.md` in `tabs` and `table.md` in `table`) · the identity scheme (`§2.4`) · the set properties `P-α`…`P-ι` of `§2.2` · the probe sentinels and their semantics (`§5.2`) · the `search`-carries-none rule (`§2.1` `F-3`) · the declaration, population and register figures.**

**4. WHAT THE DATA ADAPTATION MUST **NOT** DO — FOUR NAMED FAIL-STATE SHAPES A TESTWRITER CAN GRADE.** **(a) IT MUST NOT PUT THE TERM INTO `search`'s documents** — that set's whole point is that its content OMITS the term (`§2.1` `F-3`, `§2.2` P-δ, greens `C-8`/`E-6`): a `search` set carrying the term makes `FA-1` unexhibitable, which is the `F-2` discharge's own precondition. **(b) IT MUST NOT LET A SELF-PROVISIONED DOCUMENT CARRY THE TERM** — the store query reads the WHOLE store, so a term-bearing self-provisioned file would make `present:true` for a set that does not carry it (`§18.1` clause 5, unchanged). **(c) IT MUST NOT WEAKEN `empty`** — the fifth set carries NO file (`§2.1` `F-5`), and "make `empty` carry a term-bearing document" is a mutation of the fixture-absent acceptance run, not an adaptation. **(d) IT MUST NOT ADAPT THE PROBE — changing the `read` literal, the dispatch, the `driverReadFailure` classification, either probe's predicate, `§18.1`'s read point or `§18.6`'s falsifiers is OUT OF SCOPE for this ruling** (`§18.2` clause 7 item 1's mutation is exactly that state, and it must stay RED-gradeable).**

**5. THE REJECTED ALTERNATIVE, RECORDED SO IT IS NOT RE-FILED.** **The greens' `§5` `F-1` and `§21.5` clause 2 assigned the repair to the driver ("the store-query limb's call/reply extraction").** **THE ARCHITECT'S RULING ASSIGNS THE SUBJECT OF THE ADAPTATION TO THE MOCK DATA, AND THIS PASS WRITES THAT READING OF RECORD: the driver's probe call, its argument member, its reply arithmetic (`results` then `ranked`, `§18.2` clause 3) and its `isError` classification are all UNCHANGED and are NOT the lever.** **A landing pass that changes the probe to manufacture hits has changed the READING, not the data, and is a review finding under `§18.3`'s honesty rule (`§9` clause 1: a fixture is an INPUT, never an oracle).** **AND `§18.2` clause 3's own `OWED` sentence — whether a landing pass passes an explicit `topK` — is untouched: the arm grades the `read` literal, the argument's single `query` member and the reply's hit arithmetic, never an argument count.**

**6. WHAT THIS ITEM DOES **NOT** ESTABLISH, STATED SO THE PASS IS NOT OVER-READ.** **THE DATA-ADAPTATION ROUTE IS NOT PROVEN TO BE REACHABLE BY THE MEASUREMENTS THIS PASS WAS GIVEN: the measured mechanism (`§22.1` item 3) describes a lexical index that, at this head, receives only document ROOT ids from the import — so a landing pass may find that no data shape alone delivers `hits >= 1`, and that the adaptation requires an APP-LAYER or ENGINE-LAYER change (inside the importer/decomposer/indexer) rather than a change to the sets' bytes.** **THAT QUESTION IS THE ARCHITECT'S AND IS NOT DECIDED HERE (see `§22.6` clause 1): this clause states the CONTRACT (the outcome the ruling names, `§22.2` item 1 clause 1) and records that `§1.3`'s denied surface (`src/**`, the engine) is OUTSIDE this unit's allowed surface.** **A landing pass that must touch `src/**` to reach the outcome is at a SCOPE boundary, and a scope boundary is the architect's to move — not the landing pass's to widen (`§1.3`, `§1.4`, `§12`).**

#### 22.2 item 2 — THE READINGS THIS PASS MAY NOT AMEND (the ruling's own limit)

**1. `§11.3` item 1's PRESENT READINGS ARE INTACT.** Its `class-(b):core` text — *"the `'corpus-documents'` and `'corpus-query-results'` and `'corpus-document-tabs'` probes all read PRESENT; no gated key parks"* — **is UNCHANGED, and no marker narrows it.** What this pass adds is the DATA-FORM requirement that makes its second limb exhibitable (`§22.2` item 1), and the SKIP that governs its third (`§22.3`). **A reader must NOT read the SKIP as an amendment to this item's text.**

**2. `§18.6` clause 3's FALSIFIER IS INTACT.** *"FALSIFIED BY: any of the three reading absent"* **is the acceptance predicate and stays exactly as filed** — the ruling changes the data's form, never the reading. **Its second limb is `OWED` to the data (`§22.2` item 1); its third limb's STATUS is skipped (`§22.3`); its `parkedByFixtureAbsence is 0` limb stands for every non-skipped gated key.** **THE SUPERSEDED READINGS KEPT VISIBLE AT THE SITES — the `rag.query → 0 hit(s)` reading and the `0 rendered row(s)` reading — ARE THE GREENS' READINGS, NOT CONTRACT CLAUSES: they are recorded as what the head MEASURED, each marked as such.**

**3. `§5.5`'s `p < pre` PREDICATE, `§18.2`'s `read` literal and dispatch, `§5.2`'s sentinel table, and the `F-2` discharge's definition are all UNCHANGED by this ruling.**

#### 22.2 item 3 — THE `table` SET'S CONTENT FORM, AS LANDED (ruling sentence 1, applied to `P-β` / `§16.11`)

**1. THE BINDING FORM.** **`table`'s `table.md` MUST CARRY ITS TABLE AS A **GFM PIPE TABLE** — the form the app's own markdown import PRESERVES and decomposes into `:table:` / `:thead:` / `:th:` / `:tr:` / `:td:` nodes — so that `#page-edit-surface table` is non-empty after the document is opened and `u_edit_1_live_package_table_limitation` can return its own `(verdict, evidence)` pair instead of a `PARK`.**

**2. THE SUPERSEDED READING, KEPT VISIBLE AND MARKED.** **THE RAW-`<table>`-LITERAL REQUIREMENT — `§2.1` `F-2`'s *"a document with a STORED `<table>`"*, `§2.2` P-β's *"a document whose body carries a STORED `<table>`"*, and `§16.17` item 1's *"a stored-`<table>` document"* — IS `SUPERSEDED`.** **ITS REASON, IN ONE LINE: the app's markdown import DROPS RAW HTML ENTIRELY (`parseMarkdown`'s HTML branch: element + content), so a stored raw `<table>` literal satisfies the SOURCE-STRING shape while creating NO TABLE NODE — and a source-string shape the app's own supply route discards cannot deliver the contracted end state.** **THE FILED CLAUSES ARE KEPT VISIBLE AT THEIR OWN SITES, EACH WITH ITS MARKER; NOT ONE IS REWRITTEN.**

**3. THE MEASURED BEFORE/AFTER THAT GROUNDS THE CHANGE.** **Raw-HTML form → `no table node`, `census=0`, verdict **PARKED** (the state the greens' `E-10` recorded: `PARKED (NO document in this store renders a table on its page-edit surface …)`, fail ledger `F-3`).** **GFM pipe-table form → `:table:`/`:thead:`/`:th:`/`:tr:`/`:td:` nodes, rendered table census `{"tables":1,"trs":1,"tds":4}`, verdict **PASS**.** **BOTH ARE `RECORDED READING`s OF THE IMPLEMENTER'S CONTROLLED COMPARISON (`§22.1` item 7).**

**4. THE ACCEPTANCE PREDICATE IS UNCHANGED AND IS THE READING OF RECORD.** **`§16.11` clause 1: `class-(b):table` MUST ACCEPT a `PASS` or a `FAIL` carrying evidence that NAMES the found document and its rendered table census, and MUST REJECT a `PARK`.** **`§16.11` clause 2's route-attribution discriminator and clause 3's licence to re-word the park sentence also stand.** **`§11.3` item 2's text is NOT amended by this pass; its *"stops parking with 'cannot be met in this corpus'"* sentence was already adjudicated at `§16.11` (the words are also the block's own park text) and that adjudication stands.**

**5. WHAT IS `OWED` HERE, AND WHAT IS NOT.** **`OWED`: THE CONTENT BYTES — the exact pipe-table text in `table.md` (the same `§13.3` item 2/7(c) the term's literal and the term-bearing file's bytes already are).** **NOT OWED: the FORM (contracted here), `R-13`'s candidate-list ordering (`§16.2`, whose head is `.live-fixture/table/table` and is unchanged), the set's file list, the declaration column-move (`§16.1`), and the `set-shape:table` arm's mutation shape.** **AND THE APP-LAYER QUESTION IS NOT RE-OPENED: whether the PAGE-EDIT SURFACE should render a pipe table is the app layer's business, not this unit's claim (`§1.3`'s denials, `RCA-12`'s layer rule); what this unit contracts is that the FIXTURE supplies the form the app's own pipeline can render.**

### 22.3 THE SKIP, PRECISELY — WHAT THE TESTWRITER AND THE LIVE RUNNER DO, AND WHAT MAY **NOT** BE CLAIMED

**1. THE SKIP, IN THE EXACT WORDS THAT BIND.** **THE `corpus-document-tabs` LIVE LIMB OF THIS UNIT IS **SKIPPED-BY-RULING**, WITH ITS RECORDED REASON: *the surface it reads is a fork-specific UI implementation being rebuilt on the foundation tooling, and the probe awaits the later unit's foundation-tooling adaptation.* IT IS **NOT A PASS**. IT IS **NOT A `FAIL`**.** **AND: *"THE `F-2`-CLOSURE CLAIM (`§5.5`) MAY NOT BE REPORTED AS DISCHARGED FOR THIS LIMB."*** **THE OTHER TWO PROBES' READINGS — `'corpus-documents'` (the store list) and `'corpus-query-results'` (the store query for the probe's own term) — **STAND OR FALL ON THEIR OWN**: they are NOT skipped, they are NOT covered by this skip, and their readings are what the `F-2` discharge for those fixtures rests on.** **EVERY OTHER LIMB OF `§11.3` item 4 STANDS TOO: the `'corpus-documents'`-gated keys and the three `'corpus-query-results'` keys RUN and carry their own verdicts (the latter `OWED` to the data adaptation, `§22.2` item 1).**

**2. WHAT EXACTLY IS SKIPPED — AND WHAT IS NOT (the boundary, so the skip cannot be widened).** **SKIPPED: (a) the `'corpus-document-tabs'` PROBE'S OWN READING — `dom:#tab-strip .tab[data-document-id]`, `count >= 1`, its `present`/`resolved` values and its divergence between sets; (b) `user9_search_open_in_tab`'S PARK AS A FIXTURE-ABSENCE READING — the park, its `parkReason` naming `corpus-document-tabs`, its `parkedByFixtureAbsence` tag, and its membership of any park-set/route-tag pair the arms grade; (c) the greens' `E-7` row (the `tabs`-leaves-no-document-tab-open reading) and any claim of the same shape; (d) the THIRD limb of `§18.6` clause 3 (the strip's `count >= 1`) and the FIRST conjunct of `§18.6` clause 2(i).** **NOT SKIPPED — and these bind regardless:** (i) the SET's own content property (`§2.1` `F-4`, `§2.2` P-θ: `search.md` present and not opened) — it is a property of the bytes, and no probe's blindness removes it; (ii) the materialisation, identity and declaration readings for the `tabs` set (`§2.1`–`§2.4`, `§7`); (iii) every other gated key's reading in a `tabs` run; (iv) the `'corpus-query-results'` limb under `tabs`; (v) the rule that no gated key may park on ANOTHER fixture's absence (`§5.5` `FA-3`) — the skip removes one subject from the divergence claim, it does not license a crossed park; (vi) the honesty clause (`§9`) and the layer rule (`RCA-12`).**

**3. THE EXEMPTION THIS SKIP INVOKES, AND THE ADOPTING UNIT — `VERIFIED-BY-READ` of the exemption's own wording, cited by ROW NAME.** **THE DECISION ROW IS `docs/decisions.md`'s `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` (dated `2026-10-04`, the architect's amendment made while working the branch), whose pinned text reads: *"FORK-SPECIFIC UI IMPLEMENTATIONS BEING REBUILT ON THE FOUNDATION TOOLING ARE EXEMPT FROM REGRESSION TESTING (automatic AND live) and are considered OBSOLETE until the foundation tools replace them"* — with the exempt class stated **as a class, not a list** (defined by the SUBJECT of the test: does it regression-test a fork-specific UI implementation that the foundation tooling replaces?), the exemption **recorded, never silent**, and the coverage hole **recorded**.** **THE `read` AND `VERIFIED-BY-READ` (this pass, at `docs/decisions.md`'s `§ACTIVE` table): the row's own text says the exempt implementation's *"current behaviour is not a contract and not a defect source… no unit, gate or battery may spend a leg, a red set or a DONE-row obligation on it"*, and that *"relaxing, skipping or `todo`-ing an assertion IN PLACE is NOT this ruling's mechanism"*.** **THE ADOPTING UNIT, BY NAME: `docs/specs/unit-zone-replacement.md`** — the unit that replaces the tab-strip/sidebar surface on the foundation tooling, whose own `R-6` row carries this same obligation (*"the exemption is RECORDED, never silent, executes as an archive-or-exemption pass with the coverage hole recorded"*, citing `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` clauses (1)/(2) and `docs/specs/unit-foundation-pin-refresh-2.md` `§0` `R-8`). **THE COVERAGE HOLE IS THEREFORE RECORDED HERE, IN THIS FILE, AT THIS CLAUSE — and the reading it would have taken is re-established by the adopting unit when the surface exists (`docs/specs/unit-zone-replacement.md` `§7.3`'s own live obligations), not by a manufactured reading here.** **NOT ONE ASSERTION IS RELAXED, SKIPPED OR `todo`-ED IN PLACE ANYWHERE: no `tests/**` byte is touched by this pass, and the skip is a STATUS recorded in the contract, which is the mechanism the decision row requires.**

**4. THE EXACT WORDING A **TESTWRITER** ACTS ON.** **DO NOT AUTHOR AN ARM, A LIVE READING OR A DONE-ROW OBLIGATION FOR THE `corpus-document-tabs` LIMB: (a) `probe-read:corpus-document-tabs`'s LITERAL ASSERTION STAYS (`'dom:#tab-strip .tab[data-document-id]'`, `§16.8`, `§18.2` clause 7 item 3) — IT IS A SOURCE-STRING ARM WITH ITS NAMED MUTATIONS AND IT IS UNAFFECTED; (b) any arm whose subject is that probe's READING (its `present`/`resolved` values, its divergence under two sets, `user9_search_open_in_tab`'s park as a fixture-absence reading) is NOT AUTHORED and, if already authored in a battery, is REPORTED `SKIPPED-BY-RULING` WITH THE REASON AND THE EXEMPTION ROW NAMED — **never `GREEN`**; (c) `§5.5`'s `FA-2` and `§18.6` clause 2(i) are read with this skip in force: their OTHER conjuncts (`§18.6` clause 2(ii)…(v)) remain gradeable, and clause 2(ii)'s exact-park-set assertion is graded ONLY over the non-skipped subjects; (d) no arm may be re-scoped to pass (`§10.3` clause 4's tooth rule), and no arm may be deleted.** **THE ONE THING A TESTWRITER MUST NOT DO IS CONVERT THE SKIP INTO A VERDICT.** **AND THE DIVISION INSIDE `§18.6` CLAUSE 2 IS EXACTLY THIS: (ii)'s exact-park-set assertion and (i) are graded OVER THE NON-SKIPPED SUBJECTS (the `'corpus-documents'` keys, the three `'corpus-query-results'` keys — which remain asserted NOT to appear in `parkedByFixtureAbsence`); (iii)'s `'corpus-query-results'` half STANDS AND IS `OWED` to the data adaptation; (iii)'s other subject and (iv) STAND as readings of keys the skip does not reach; and (v) is read as the `'corpus-query-results'` store query, whose DOM clause is SKIPPED.**

**5. THE EXACT WORDING A **LIVE RUNNER** ACTS ON.** **RUN THE `--fixture=tabs` AND `--fixture=core` RUNS ANYWAY — the skip is not an excuse not to run the rest: (a) REPORT THE PROBE'S RAW READING IF PRINTED (e.g. `0 rendered row(s)`), MARKED WITH THE SKIP — *"`SKIPPED-BY-RULING` (`corpus-document-tabs`): the probe's surface is a fork UI implementation awaiting the later unit's foundation-tooling adaptation (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`); this reading is an OBSERVATION, not a verdict"*; (b) DO NOT PRODUCE A `PASS` OR A `FAIL` FROM IT — not in the row verdict, not in the summary, not in the park-set/route-tag attribution; (c) DO NOT COUNT IT TOWARD ANY COVERAGE, ANY `class-(b)` TERM'S COMPLETION OR ANY `F-2` CLOSURE; (d) `user9_search_open_in_tab` MAY STILL PRINT ITS OWN PARK **as an observation**, and the run's `parkedByFixtureAbsence` member is REPORTED WITH THE SKIPPED SUBJECT NAMED, never silently dropped and never counted as a fixture-absence divergence; (e) THE `'corpus-query-results'` AND `'corpus-documents'` READINGS ARE REPORTED NORMALLY, under the set the run selected — with the data-adaptation limb (`§22.2` item 1) reported as `OWED` until it reads `>= 1`.** **A RUN THAT REPORTS THE SKIP AS A `PASS`, OR THAT REPORTS THE UNIT'S `F-2` DISCHARGE AS CLOSED ON THAT LIMB, HAS MIS-REPORTED.**

**6. WHAT MAY **NOT** BE CLAIMED — THE LIST, SO EACH IS FALSIFIABLE BY ONE COUNTER-CLAIM.** **NOT CLAIMABLE: (a) that the `tabs` fixture's divergence is EXHIBITED (the probe is blind); (b) that the `corpus-document-tabs` probe read a real fixture ABSENCE — its `0` is structural at this head and is NOT evidence of the fixture's absence (`§22.1` items 4–5); (c) that `core`/`table`/`search` "leave a document tab open at launch" — `REFUTED BY MEASUREMENT` (`§22.1` item 6); (d) that the `F-2` discharge is COMPLETE — its `'corpus-query-results'` half is `OWED` to the data adaptation and its `'corpus-document-tabs'` half is SKIPPED, so the unit's DONE row may claim NEITHER as discharged without the readings; (e) that the skip is a COVERAGE RESULT of any kind; (f) that the `tabs` run's `parkedByFixtureAbsence` value measures the divergence; (g) that the skip relieves the OTHER limbs of `§11.3` item 4 — the `'corpus-documents'` and `'corpus-query-results'` keys must still RUN and carry their own verdicts; (h) that the skip widens the exempt class — it is the class's definition (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` clause (1)) and not a convenience (`§22.3` item 3).**

**7. WHAT THE SKIP LEAVES STANDING, IN ONE LINE EACH.** **The `read` literal and the `'dom:'` dispatch (`§5.2`, `§18.2` clause 6) · the three sentinels and the two `null`s (`§5.4`) · the registry's membership and the population `3` non-null / `2` null · the `probe-read:corpus-document-tabs` source arm with its named mutations · `§2.2` P-θ's content property · the `tabs` set's file list and identity · every census and register figure.**

### 22.4 WHAT THIS PASS MOVES, AND WHAT IT DOES NOT

**1. THE FIGURES — `NONE MOVED`, ENUMERATED SO THE CLAIM IS CHECKABLE (`VERIFIED-BY-READ`: this file's own declared literals, unchanged by this pass's edits).** **THE REGISTER: `P-IM-6` `17` · `P-SM-5` `12` · `P-TP-4` `11` · `P-TP-5` `27`; TOTAL `17 + 12 + 11 + 27 = 67`; EXECUTED `57`; the four `§4 P-*` titles; caps `≤ 100`/row · `≤ 400` total · `≤ 8` rows; seed `0x20261005`.** **THE CENSUS: `47` · `3` · `9` · `35` · `31` · `3` · `1`, and `47 − 3 − 9 = 35 = 31 + 3 + 1`.** **THE GATED FAMILY: `7` `stage_*` + `5` `o0_*` = `12`, remainder `19` (`§21.3`'s reconciliation, UNMOVED here).** **EVERY TERM of `§18.6` clause 4's enumeration, including `3×probe-read` · `3×set-shape` · `5×falsifier-divergence` · `2×probe-resolution` · `2×probe-population`.** **THE PROBE SET: `3` non-null reads + `2` null.** **THE STATE: `3` members. THE OBSERVATION: `3` park members. THE SITES: `5 + 2`.**

**2. WHAT MOVED, AND IT IS NOT A FIGURE.** **TWO DATA-FORM REQUIREMENTS (`P-β`'s raw literal → parser-mediated; the sets' term carriage → index-reaching form).** **ONE LIMB'S STATUS (the `corpus-document-tabs` probe: CONTRACTED-AND-GRADEABLE → SKIPPED-BY-RULING).** **ONE LIMB'S OWNER (the `'corpus-query-results'` store query: `OWED` to the DATA, where the greens' `§5` `F-1` and `§21.5` clause 2 assigned it to the driver).** **AND WHAT IS NOT MOVED: THE `read` LITERALS, THE DISPATCH, THE PARKS' ROUTE ATTRIBUTION, THE PROBE TERM'S LITERAL, THE FILE LISTS, THE IDENTITIES, THE POPULATION AND EVERY FIGURE.** **AND THE SUPERSEDED READINGS ARE KEPT VISIBLE, EACH AT ITS SITE AND EACH MARKED: `rag.query → 0 hit(s)` under every set · `dom:#tab-strip … → 0 rendered row(s)` · the raw-`<table>`-literal requirement · the launch-state premise *"`core`/`table`/`search` leave a document tab open at launch"* · the *"`tabs` is the only set with no document tab open at the blocks' own start"* contrast.** **A FORM, A STATUS AND AN OWNER ARE NOT COUNTS.**

**3. FOUR THINGS THIS PASS DELIBERATELY LEFT UNTOUCHED, WITH THE REASON — SO A LATER PASS DOES NOT READ THE AMENDMENT AS A REWRITE.** **(a) THE `read` LITERALS AND THE DISPATCH (`§5.2`, `§16.3`, `§16.8`, `§18.2`, `§17.7` clause 3, `§11.2`'s `PROBE-READ` row): the ruling changes the DATA, never the probe — and `§18.2` clause 7 item 1's mutation (restore `'rag.list_documents'`) must keep biting.** **(b) THE PARKS' ROUTE ATTRIBUTION (`§16.5`, `§17.5`, `§11.3` item 4's route-tag limb): the body-owned park and its `parkedByFixtureAbsence` tag are the `tabs` fixture's mechanics, and the skip removes a SUBJECT from the divergence reading, not the mechanism.** **(c) THE PROBE TERM'S LITERAL AND THE TERM-BEARING FILE'S BYTES (`§13.3` item 2/7(c)): still the landing pass's — this pass contracts the FORM the bytes must take, not the bytes.** **(d) `§9`'s HONESTY CLAUSE, `§1.3`'s DENIED SURFACE AND `RCA-12`'s LAYER RULE: every reading above is `[D]`-class or a driver-artifact reading, and NONE of them is app evidence — a fixture-fed `PASS` may never be quoted as a live-corpus app reading, and the `table` content-form change is a FIXTURE change, not a claim about what the page-edit surface should render.**

### 22.5 `OWED` AFTER THIS PASS

**1. THE FILE'S POST-EDIT LINE COUNT AND ITS `sha256`/`md5` ARE `OWED` (`§14` item 1, `§20.4` clause 1, `§18.8` item 1 — all standing).** **THIS PASS HOLDS NO SHELL AND TOOK NO DIGEST; the readings supplied to it (`md5 23b3fa5eaeee2e6f73b103f3e515ae7b`, `3041` lines; the file's own gate-5 amendment census of `3177` lines) are `RECORDED READING`s of the heads it received, each `SUPERSEDED` by this pass's edit.** **THE FIGURE IS NOT GUESSED HERE, and the head block's own note says so.** **`OWED` — ⟨GATE-7 PROOFREAD PASS `2026-10-05`: THE LINE-COUNT HALF IS NOW ANSWERED — this file's census at that pass's close is `3367` lines (`VERIFIED-BY-READ`, the file-read tool's own `total` line; `§23.1`). THE `sha256`/`md5` REMAIN `OWED`, because that pass holds no shell either.⟩**

**2. THE DATA-ADAPTATION FORM (`§22.2` item 1 clause 3): the set content's index-reaching layout — `OWED` to the implementer.** **Its acceptance reading is not owed: `rag.query` for the probe's own constant term returns `>= 1` hit under `--fixture=core` (`§18.6` clause 3), and it is the reading the landing's own live battery takes.**

**3. THE `table` SET'S PIPE-TABLE BYTES (`§22.2` item 3 clause 5): `OWED` to the implementer, together with the term's literal and the term-bearing file's bytes (`§13.3` items 2/7(c)).**

**4. THE `F-2` DISCHARGE'S REPORTING (`§5.5`, `§22.3` item 6(d)): `OWED` to the supervisor's DONE-row gate — the row may claim the `'corpus-query-results'` half only on the adapted reading, and may NOT claim the `'corpus-document-tabs'` half at all.**

**5. THE PIN'S `print-site:early-paths` RECONCILIATION (`§21.1` clause 3 item 2, `§21.4` item 2) AND THE TWO-SUPPLY REFUSAL'S FLAG NAMING (`§21.2`, `§21.4` item 3): both stand `OWED` from the earlier gate-5 pass, UNMOVED by this ruling.**

### 22.6 `NOT DONE`, AND WHAT THIS PASS COULD NOT AMEND

**1. ITEMS THAT NEED A DECISION THE ARCHITECT HAS NOT MADE, STATED AND LEFT UNAMENDED.** **(a) WHETHER THE DATA-ADAPTATION OUTCOME IS REACHABLE INSIDE THIS UNIT'S ALLOWED SURFACE.** The ruling names the mock data as the subject and `hits >= 1` as the outcome; **the measurements show only that the query reads `0` and describe an index that receives root ids only.** **If reaching the outcome requires a change to the app's import/decompose/index path (`src/**`) rather than to the sets' bytes, that is a SCOPE question (`§1.3`'s denials, `§12`), and this pass does NOT widen the surface to cover it: the contract states the OUTCOME and the boundary (`§22.2` item 6), and the scope call is the architect's.** **(b) WHETHER ANY FURTHER `class-(b)` READING IS SKIPPED FOR THE SAME REASON.** The ruling's second sentence is conditional (*"If the tabs are awaiting a later unit…"*) and the exemption is a CLASS, not a list; **this pass skips exactly the `corpus-document-tabs` limb and records the others as standing (`§22.3` item 2)** — **a further skip needs the architect's word, not this pass's inference.** **(c) HOW A LANDED `class-(b):table` `FAIL` IS DISPOSITIONED.** `§16.11` accepts `PASS` or `FAIL`; the greens' `E-10` recorded the `table` set PARKING and its cause was attributed to the fixture's content form, which the ruling now adapts. **The ruling does not say what a post-adaptation `FAIL` means for the row's namesake app limitation, and this pass does not decide it** (it is the app layer's, `§1.3`).

**2. WHAT THIS PASS DID NOT DO, ENUMERATED.** **NO shell command was run: no digest, no line count, no suite, no battery, no live run.** **NO `scripts/**` byte touched** (a concurrent implementer pass holds `scripts/live-drive.mjs`). **NO `tests/**` byte touched.** **NO `src/**` byte touched.** **NO `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`, `docs/defects.md` OR `docs/HANDOFF.md` row amended** — the exemption row is cited, not rewritten, and the trackers' updates belong to the supervisor's tracker pass (`AGENTS.md` item 6; the unit's DONE row is not this pass's to write). **NO ARM, NO MUTATION, NO REGISTER TERM AND NO PIN ASSERTION ADDED OR REMOVED — the arms this ruling touches are re-scoped BY SUBJECT at `§10.2.3`'s `SET-SHAPE` row and left otherwise alone.** **NO SECTION RENUMBERED.** **AND NO CLAUSE OF THE RULING IS RE-LITIGATED: where the ruling's scope is silent (`§22.6` clause 1), the site is left as filed with the question named.**

**3. THE CLAUSES THAT WILL BE MADE STALE BY THE ADAPTATION, NAMED IN ADVANCE SO THE PROOFREADER'S PASS DOES NOT HAVE TO FIND THEM.** **When the data adaptation lands, these readings move and their markers must be re-read: `§5.2`'s `'corpus-query-results'` cell (the `0 hit(s)` note), `§5.5`'s closing paragraph, `§11.3` items 3/4, `§18.1` clause 3's collision note, `§18.6` clauses 1(iv)/3, `§2.1` `F-3`/`F-4`, this register's `§22.1` items 1–3 and `§22.2` items 1/5.** **Each carries its marker and its pointer here; none needs to be located by sweep.**

---

## 23. ⟨GATE-7 PROOFREAD PASS `2026-10-05`⟩ THE UNIT'S DOCS AUDITED AGAINST THE CODE AT THE LANDED HEAD — **THE SITES `§22.6` CLAUSE 3 PREDICTED ARE MARKED, THE STALE READINGS ARE NAMED, AND NOT ONE CLAUSE IS REWRITTEN IN PLACE (`RCA-8(c)`)**

**WHAT THIS PASS IS (`AGENTS.md` item 10b; `RCA-6`/`RCA-8(c)`).** **THE UNIT'S DOCS AUDITED AGAINST `scripts/live-drive.mjs` + `tests/live-drive-contract.test.ts` + UNIT A's contract at the landed head, and the doc inconsistencies fixed ANNOTATE-BESIDE — never by rewriting a dated reading.** **THIS PASS RAN NOTHING AND TOUCHED NO `scripts/**`, `tests/**` OR `src/**` BYTE** (its wall is read/search + doc-writes; it holds no shell, so no `md5sum`/`sha256sum`/`wc -l` — every LINE COUNT it states as its own is the file-read tool's line census (`VERIFIED-BY-READ`), and every driver/pin/suite/tally figure is a `RECORDED READING` of the supervisor's own shell, quoted WITH ITS MEASURER).** **NO TRACKER FILE WAS EDITED:** `docs/next-steps.md`, `docs/decisions.md`, `docs/pending.md`, `docs/defects.md` and `docs/HANDOFF.md` are the concurrent documentation reviewer's, and the staleness this pass noticed in them is REPORTED to the supervisor rather than fixed here.**

**§23.1 THE HEAD, EACH FIGURE WITH ITS LABEL AND ITS INSTRUMENT.**

- **DRIVER `scripts/live-drive.mjs` = `9681` LINES (`VERIFIED-BY-READ`, this pass's file-read census), `md5 1b7d9cd8e644525d0b1de354c881ff2b` (`RECORDED READING; measurer: the supervisor`).** **THE `md5 23b3fa5eaeee2e6f73b103f3e515ae7b` / `3041`-line head `§22.4` names, and the gate-5 amendment's own `3177`-line census, are SUPERSEDED as heads and stay visible at their sites; THIS file was `3329` lines before this pass's edits and is `3367` lines at this pass's close (`VERIFIED-BY-READ`, the file-read tool's own `total` line at each instant) — a NET `+38` lines, of which `§23` itself is `36` lines and this pass's two in-place pointers (the head block above and `§21.5` clause 3) the other `2`.**
- **PIN `tests/live-drive-contract.test.ts` = `17066` LINES (`VERIFIED-BY-READ`, this pass's own close-of-file census), `md5 19af3936fbd390f8f2b998fa5897d13a` — THE PRE-PASS DIGEST (`RECORDED READING; measurer: the supervisor`) — `0 RED / 57 GREEN` of `57` distinct executed node-side arms, with the third register's four rows `P-IM-6` · `P-SM-5` · `P-TP-4` · `P-TP-5` at `17 + 12 + 11 + 27 = 67` declared / `57` executed / seed `0x20261005` / caps `≤100` per row · `≤400` · `≤8 rows` — **all read at their own sites in the pin by this pass (`VERIFIED-BY-READ`: the register literal, the arithmetic arm `toBe(67)`/`toBe(57)`, the identity arm, and the `§22.3` SKIP-recording arm, which asserts the ten class-(b) entries, the TWO `SKIPPED-BY-RULING` subjects (`class-(b):tabs`, `class-(b):FA-2`) and the `class-(b):table` disposition all carry their reasons)** — with the TALLY itself a `RECORDED READING` of the supervisor's run, which this pass cannot execute. **⟨THIS PASS TOUCHED THE PIN'S PROSE IN EXACTLY ONE PLACE — THE `repin-completeness:table-candidate` OFFENCE MESSAGE — at the supervisor's explicit instruction: the message's *"the stored-`<table>` document"* wording is annotated in place with the GFM pipe-table form, and NO assertion, literal, limb or test title is changed. THE MESSAGE EDIT IS ONE LINE REPLACED BY ONE LINE, so the pin's LINE COUNT IS UNMOVED AT `17066` (`VERIFIED-BY-READ` before and after); ITS `md5` IS THEREFORE NO LONGER `19af3936fbd390f8f2b998fa5897d13a` AND THE POST-PASS DIGEST IS `OWED` TO WHOEVER NEXT HOLDS A SHELL (this pass holds none). THE PIN HAS NOT BEEN RE-RUN BY THIS PASS: no tally above is this pass's own reading.**⟩**
- **THE WHOLE SUITE / TRIO (`RECORDED READING; measurer: the supervisor`): `Test Files 131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed`.** **THE PREVIOUS TALLIES IN THIS UNIT'S ARTIFACTS ARE LABELLED `RECORDED READING` OF THEIR OWN HEADS AT THEIR OWN SITES: the greens' `123 passed (123)` and the battery's `123 passed (123)` are the gate-5/gate-6 readings, marked in both artifacts by this pass.**

**§23.2 THE SITES `§22.6` CLAUSE 3 NAMED, MARKED — AND WHICH READING IS THE OLD ONE AND WHICH IS CURRENT, ONE LINE EACH.**

| `§22.6` clause 3's site | THE OLD READING (kept visible at its site) | THE CURRENT READING (`RECORDED READING` of the gate-6 battery's live runs + this pass's file-reads at the print sites; head `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines) |
| --- | --- | --- |
| **`§5.2`'s `'corpus-query-results'` cell** | `rag.query` reads `0 hit(s)` under EVERY set — the cell's own `0`-hit note | **`3 hit(s)` under `--fixture=core`, `4 hit(s)` under `--fixture=tabs`, `0 hit(s)` under `--fixture=search`** — the driver writes each imported document's authored text onto its ROOT node through `edit.set_content` after the import (`[live-drive] FIXTURE ROOT TEXT: 3/3 …`), so the probe's own constant term reaches the store's lexical index. **`§5.2`'s `read` LITERAL (`'rag.query'`), its `present = hits >= 1` semantics and its `'dom:'` dispatch are UNCHANGED** |
| **`§5.5`'s closing paragraph** | *"satisfied exactly when both can read absent at a non-empty store"* — a claim with no set for which `p === pre` | **THE `'corpus-query-results'` LIMB NOW HAS `p === pre` (`core`/`tabs` read PRESENT) AND `p < pre` (`search`)**; **the `'corpus-document-tabs'` limb is `SKIPPED-BY-RULING` (`§22.2` item 2, `§22.3`) and the `F-2`-closure claim may NOT be reported as discharged for it** |
| **`§11.3` item 3 (`class-(b):search`)** | `rag.query` `0 hit(s)` under every set — the item's own `OWED`-probe limb note | **`0 hit(s)` under `search` at a NON-EMPTY store (`rag.list_documents -> 3 document(s)`)** — which is the item's own acceptance reading (`FA-1`), now exhibited. **The park SET (`uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag`) and its fixture-absence route tag are the full run's and remain owed** |
| **`§11.3` item 4 (`class-(b):tabs`)** | the item's `dom:`-limb skip note + the `OWED` store-query limb | **the store query reads `4 hit(s)` under `tabs`, so the three `'corpus-query-results'` keys' probe limb is exhibited in DATA FORM; the `corpus-document-tabs` limb STAYS `SKIPPED-BY-RULING`** |
| **`§18.1` clause 3's collision note** | `rag.query` reads `0` in every run, so the two sets collide | **the collision is GONE in the required direction: `search` `0`, `tabs` `4`** — the note's own premise (*"no gesture has run"*) is untouched, and its `dom:` half is the ruled skip |
| **`§18.6` clauses 1(iv)/3** | the `FA-4` control falsified by a permanent absence | **exhibited: `core` reads the store list PRESENT, the store query `>= 1`, and `parkedByFixtureAbsence` `0` in the scoped `--block=import` run** — **the third limb (`strip count >= 1`) is the ruled skip and is NOT a third PRESENT** |
| **`§2.1` `F-3`/`F-4`** | `F-4`'s filed parenthetical about a painted row; `F-3`'s set-content divergence | **unchanged as to the SETS: `search` carries no term, `tabs` carries `search.md`** — what moved is the PROBE's read point, not the sets (`§18.1`, `§22.4` item 2) |
| **`§22.1` items 1–3 and `§22.2` items 1/5** | the `0 hit(s)` / `0 nodes-with-term-in-index` readings that motivated the ruling | **the ADAPTATION LANDED (`§22.5` item 2's `OWED` data-form outcome is MET): the term reaches the index and the query answers under the term-bearing sets** |
| **`§2.2` P-β and `§4`'s `class-(b):table` cell** | a document whose body carries a **STORED `<table>`** — the raw-HTML literal | **the PARSER-MEDIATED GFM PIPE TABLE (`§22.2` item 3)**; the row now reads `verdict=PASS` with `rendered table census {"tables":1,"trs":1,"tds":4}`, and `§16.11`'s predicate (`MUST REJECT a PARK`) is UNCHANGED and satisfied |

**THE FOUR `OWED` OUTCOMES THIS PASS CAN NOW MARK DISCHARGED, WITH THEIR EVIDENCE: (1) the flag-by-name refusal (`§21.5` clause 1 item 1, `§22.5` item 5) — the driver names each supplied flag BESIDE the family list (`VERIFIED-BY-READ` at its own line); (2) the `rag.query` data adaptation (`§22.5` items 1/2) — measured; (3) the `table` set's pipe-table form (`§22.5` item 3) — measured, `verdict=PASS`; (4) the pin's `§22.3` SKIP recording — landed as its own arm. THE FIGURES THAT STAY `OWED` AT THEIR OWN SITES ARE NOT CLAIMED HERE: the `'corpus-document-tabs'` limb's discharge is FORBIDDEN (`§22.3`), the unit's `F-2` DONE-row claim is the supervisor's gate (`§22.5` item 4), and the pin's `print-site:early-paths` reconciliation (`§21.1` clause 3 item 2) is the pin owner's.**

**§23.3 WHAT THIS PASS FOUND STALE AND DID NOT FIX, BECAUSE IT IS NOT THIS FILE'S WRITE.**

1. **`docs/next-steps.md`** — the UNIT B DONE row, if it still carries the class-(b) terms as NOT-RUN and the pre-landing heads (`md5 eac6d17477323f7770b0f6a4c011807e` / `9637` lines; `md5 23b3fa5eaeee2e6f73b103f3e515ae7b` / `3041` lines), is STALE against the heads `§23.1` stamps. **OWNER: the supervisor's tracker pass (and the concurrent documentation reviewer).**
2. **UNIT A's `docs/specs/unit-live-fixture-precondition-declaration.md`** — the cross-unit figures this pass verified there (`§6.2`'s GATED cell, `§8.3` item 1's reading, `§6.5` clause 1's route split, and the `§G8`-family `ran`-member label phrase) are ANNOTATED AT THAT FILE, by this pass, in its own gate-7 block; any OTHER UNIT A figure still reading `34` as current is that file's spec-owning pass's.
3. **The `docs/specs/*.md` corpus** — `docs/skills/designing-pages.md` is cited by this file (`§1.3`, `§1.5`) and by UNIT A (`§1.3`, `§1.5`) as an untouched surface, and **IT DOES NOT EXIST IN THIS REPO** (`docs/skills/*` holds `process-guardrails.md` alone; at least ten other specs record the same ABSENCE). **THE CITATION IS NOT FALSE — a file that does not exist is untouched by construction — but the duty's honest form elsewhere in this corpus is an ABSENCE ROW, and neither fixture spec carries one. REPORTED, NOT FIXED: it is a corpus-wide convention question (owner: the supervisor), not a UNIT B claim.**

**§23.4 WHAT THIS PASS DOES NOT CLAIM.** **NOTHING HERE IS APP-GREEN (`RCA-12`): every `hits` reading and every row verdict is `[D]`/APP-fixture-fed and scoped to a NAMED mock set — never a live-corpus reading and never this unit's app claim.** **NOT ONE `SKIPPED-BY-RULING` LIMB IS CONVERTED TO A PASS, AND THE `F-2` CLOSURE IS STILL NOT REPORTABLE.** **THIS PASS ADDS NO FIGURE TO THE REGISTER, THE CAPS, THE SEED OR THE CENSUS, AND IT RENUMBERS NO SECTION.**
