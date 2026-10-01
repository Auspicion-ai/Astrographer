# GATE 5 — BLIND GREEN-SCENARIO ARTIFACT for `U-MOCK-CORPUS-FIXTURE-SETS` (UNIT B)

**Authored by:** the Blind-Test Writer (gate 5; `AGENTS.md` item 10a / `RCA-4`), **from the DOCUMENTATION
ONLY**.

**Documents read to author `§3` (and nothing else):**

| Source | What it gave me |
| --- | --- |
| `docs/specs/unit-mock-corpus-fixture-sets.md` (the contract, `3041` lines) | `§2` the five sets + materialisation + identity scheme · `§3` the arg, its grammar and the four refusals · `§4` the set-selection failure states · `§5` the divergent probes, the sentinels, the population check and the `F-2` falsifier · `§6` the obsolete route and the two-supply refusal · `§7` the run's declaration, the three members and the four print sites · `§9` the honesty clause · `§10.2` the third property register · `§11.3` the ten class-(b) readings · `§16.17` the re-derived figures · `§17.1` the atomic cross-unit landing · `§18.1`/`§18.2`/`§18.6` the pre-gesture read point, the discriminating limb and the falsifiable acceptance predicates · `§20` the census amendment (`31`) |
| `docs/specs/unit-live-fixture-precondition-declaration.md` (UNIT A) | `§4.1` the closed `fixtureName` set · `§5.1`/`§5.3` the park rule and its printed shape · `§6.1` the state member, its four print sites and the one-read rule · `§6.2` `X-1`…`X-7` · `§6.4` the per-declared-fixture absence test · `§6.5` the derived conditional consequence · `§7` the honesty clause (`R-none`/`R-mock`) |
| `docs/decisions.md` | `DECIDED: MOCK-DATA-SETS-AND-A-LAUNCH-SELECTION-ARG` · `DECIDED: GNOSIS-ENGINE-READY-AND-SHELL-INTEGRATION-BEHIND-THE-UI-OVERHAUL` (engine status irrelevant behind the mocks) · `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT` · `DECIDED: GAP-8-INTERIM-MOCK-CORPUS-FROM-CALLING-ARGS` (the honesty clause) |
| `docs/next-steps.md` | the UNIT B anchored inserts (gate-2 loops 1/2/3, the gate-4 census amendment, the atomicity hazard), and UNIT A's DONE-row reading |
| `.gitignore` | the standing `.live-corpus/` precedent line |
| `docs/specs/unit-live-fixture-precondition-declaration-greens.md` | **FORMAT ONLY** (the same gate's artifact for UNIT A) — no expectation below is taken from it |

**I did NOT open `scripts/live-drive.mjs` or `tests/live-drive-contract.test.ts` while `§3` was being
written.** `§3` was complete on disk before the first run (`§4`).

**⟨GATE-7 PROOFREAD PASS `2026-10-05` (`AGENTS.md` item 10b / `RCA-6`; `RCA-8(c)` annotate-beside) — THE UNIT'S DOCS AUDITED AGAINST THE CODE AT THE LANDED HEAD.** **THIS PASS RAN NOTHING AND TOUCHED NO `scripts/**`, `tests/**` OR `src/**` BYTE.** **ITS INSTRUMENT IS THE FILE-READ TOOL: every line count it states is that tool's own line census (`VERIFIED-BY-READ`); every driver/pin figure it states is either a `RECORDED READING` of the supervisor's own shell, quoted WITH ITS MEASURER, or the supervisor's stated digest where this pass could take none.** **THE HEAD OF RECORD IS NOW `scripts/live-drive.mjs` · `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines (`RECORDED READING; measurer: the supervisor`; the `9681` corroborated by this pass's own file-read census, `VERIFIED-BY-READ`) — the `md5 eac6d17477323f7770b0f6a4c011807e` · `9637`-line driver the two gate-5/gate-6 artifacts ran against is SUPERSEDED at ITS OWN SITES and is kept visible there.** **THE PIN IS `tests/live-drive-contract.test.ts` · `md5 19af3936fbd390f8f2b998fa5897d13a` · `17066` lines, `0 RED / 57 GREEN` (`RECORDED READING; measurer: the supervisor`; the `17066` corroborated by this pass's own file-read census) — so the `123 passed (123)` this artifact's `§4.0` records is that artifact's reading of ITS head, not the current one. ⟨GATE-7 AMENDMENT: the `19af3936…` digest is the PRE-PASS one — this pass annotated ONE prose message inside the pin at the supervisor's instruction (the `repin-completeness:table-candidate` offence's stored-`<table>` wording), ONE line replaced by ONE line, so the pin's line count is UNMOVED at `17066` and its POST-PASS `md5` is `OWED` (this pass holds no shell and re-ran nothing).⟩** **THE TRIO OF RECORD (`RECORDED READING; measurer: the supervisor`): `Test Files 131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed`; `typecheck` and `build` clean.** **LAYER (`RCA-12`): NOTHING BELOW IS APP-GREEN, and every `NOT-TESTABLE-HERE` row STAYS `NOT-TESTABLE-HERE` — this pass CONVERTS NO FAIL TO A PASS.** **THE FOUR READINGS THIS PASS FOUND CURED OR SUPERSEDED ARE MARKED AT `§4.1` AND `§5` (`F-1`/`E-4`/`E-8`, `F-3`/`E-10`, `F-8`/`F-9`); THE TWO THAT STAND ARE `F-4` (a DOC figure) AND `F-5` (this artifact's own over-broad row).**⟩**

**The two gate-3/gate-4 amendments are treated as the current contract, and the clauses that still carry
their superseded reading beside them are flagged in the `SUPERSEDED BESIDE` column of `§3`.**

**THE LAYER LEDGER IS `§8` AND IT IS THE POINT OF THIS FILE.** A row that I could not run is
`NOT-TESTABLE-HERE` — **never a pass**.

---

## 0. THE HONESTY BLOCK

1. **Expectations first, runs second.** `§3`'s expectations were frozen on disk before any invocation was
   made. Nothing in `§3` was edited afterwards to match a reading; where a reading differed from the
   expectation the difference is reported as `FAIL` in `§4` and adjudicated in `§5`.
2. **One contract contradiction was found while authoring and is recorded rather than resolved by me**
   (`§6` `D-1`): the contract's `§10.2.3` gate-2 note and its `§16.10` claim *"all four already satisfy
   the identity (`0`/`0`/`0`/`10`)"* are marked `SUPERSEDED` by the gate-3 amendment in the same file, so
   I froze the **amended** reading (`§10.2`'s table + the gate-3 block, re-stated at `§16.17` item 7).
3. **The unit's status.** The contract's own head calls the unit `PROPOSED`; `docs/next-steps.md` carries
   the red-set / atomic-landing / implementer sequence. Whether the implementation has landed is **not**
   something I read — it is what the runs below measure.
4. **What I may run.** node, the shell, the file system, the tests' own harness (`npx vitest run
   tests/live-drive-contract.test.ts`), and the driver itself **as a process**. I do **not** read the
   implementation to author or to adjudicate a scenario; where a scenario needs a driver *data* literal I
   let an extraction script print **aggregates and matched names only**, never source text.
5. **Live runs.** Port `9222` is **never** used. No Electron process was running when this pass began
   (`pgrep -af electron` → empty) and the ports used are `3961`–`3975` / `9461`–`9475`, all verified free.
   A run I interrupt proves nothing and is never reported as a result (`§11.3`'s closing rule).
6. **Disclosed instrument boundaries, stated before the readings:**
   - **`HARNESS [D] / pre-spawn process`** — the driver is executed and exits by a contracted refusal or
     abort path **before any Electron child is spawned**.
   - **`HARNESS [D] / live-process (pre-connect)`** — the driver is executed, materialises its set and
     prints its declaration, then **aborts on a connect that cannot succeed** (no app is running). This is
     a **driver-artifact reading**; **it is NOT the class-(b) battery** (`§11.3` requires
     boot-and-connect confirmation) and it is never reported as one.
   - **`HARNESS [D] / source-derivation`** — a data-region extraction or literal sweep over
     `scripts/live-drive.mjs`.
   - **`NODE SUITE`** — the pin, `tests/live-drive-contract.test.ts`.
   - **`class-(b)`** — the ten live readings of the contract's `§11.3`, which belong to the live battery
     (a separate runner). Unless a row below names a genuine isolated-port boot-and-connect, these are
     `NOT-TESTABLE-HERE`.
7. **`RCA-12` layer rule accepted up front: NOTHING BELOW IS APP-GREEN.** This unit touches no `src/**`
   byte (contract `§1.3`), `scripts/live-drive.mjs` is in no trio leg (contract `§9` clause 6), and the
   contract says it four times: *"a green on this unit's arms proves the fixture machinery — never that
   the app works"*.
8. **The honesty clause binds this artifact**: **a fixture-fed `PASS` may never be quoted as a
   live-corpus app reading** (contract `§9` clause 3). Every reading below states its fixture, and a
   reading taken under a selected set is a reading **against that set**.

---

## 1. THE FROZEN SCENARIO SET — LEGEND

| Column | Meaning |
| --- | --- |
| **ID** | stable row id, unique in this file |
| **CLAUSE** | the contract section the expectation derives from |
| **INVOCATION / OBSERVABLE** | the exact command or the exact thing read |
| **EXPECTED** | a falsifiable predicate |
| **LAYER** | one of `§0` item 6's instrument classes |
| **SUPERSEDED BESIDE** | the contract clause still carries a superseded reading beside it (`Y`/`—`) |

**Every expectation is falsified by a single counter-observation, stated in the row.** Prose cells that a
contract marks *"illustrative, not exhaustive"* are graded **by count and by property**, never by an
invented key list.

---

## 2. THE SCENARIO SET (`§3` — FROZEN BEFORE THE FIRST RUN)

### 2.1 The arg: grammar, the four refusals, the neutral default (`§3.1`, `§3.2`, `§3.3`)

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **A-1** | `§3.2` (Empty value) + `§3.3` `A-1` | `node scripts/live-drive.mjs --fixture=` | exit `2`; one line beginning `[live-drive] ARG-REFUSED:`; it **names the empty value**; it **lists the accepted set** (`core` · `table` · `search` · `tabs` · `empty`); nothing spawned; nothing written | pre-spawn process | — |
| **A-2** | `§3.2` (Malformed/unknown) + `§3.3` `A-2` | `node scripts/live-drive.mjs --fixture=banana` | exit `2`; `ARG-REFUSED` shows `banana` **verbatim** and **lists the closed set** | pre-spawn process | — |
| **A-3** | `§3.3` `A-3` (a comma list) | `node scripts/live-drive.mjs --fixture=core,table` | exit `2`; `ARG-REFUSED`; nothing may be *"partially applied"* (no set materialised) | pre-spawn process | — |
| **A-4** | `§3.2` (Value whitespace: leading space) | `node scripts/live-drive.mjs "--fixture= core"` | exit `2`; the refusal shows the **offending text verbatim**, i.e. it does not trim into the set | pre-spawn process | — |
| **A-5** | `§3.2` (Value whitespace: trailing space) | `node scripts/live-drive.mjs "--fixture=core "` | exit `2`; unknown-value refusal; **the value is not trimmed into the set** | pre-spawn process | — |
| **A-6** | `§3.2` (Case) + `§3.3` `A-3` | `node scripts/live-drive.mjs --fixture=CORE` | exit `2`; unknown-value refusal — **case-sensitive**, no lowercasing into the set | pre-spawn process | — |
| **A-7** | `§3.1` clause 5 + `§3.3` `A-4` | `node scripts/live-drive.mjs --fixture=core --fixture=table` | exit `2`; the refusal **names BOTH values** (`core` **and** `table`) | pre-spawn process | — |
| **A-8** | `§3.2` (Repeats: the identical flag is admissible) | `node scripts/live-drive.mjs --fixture=core --fixture=core --strict-seed` | the run is **NOT refused for the repeat**: the refusal that appears (if any) must be the **two-supply** one of `§6.4`, and it must **not** name a repeat/conflict of `core` with itself. Falsified by a `last wins`/conflict refusal naming the identical pair | pre-spawn process | — |
| **A-9** | `§3.2` (Flag form: bare `--fixture` is not parsed) | any invocation with a bare `--fixture` | **NOT-TESTABLE-HERE**: proving "not parsed at all" requires a run that proceeds, i.e. a boot; no pre-spawn instrument separates "not parsed" from "parsed" | — | — |
| **A-10** | `§3.1` clause 3 (neutral default) | `node scripts/live-drive.mjs --groups=` (no `--fixture` at all) | the `--groups=` `ARG-REFUSED` line carries the state **`no fixture data set selected`** / `none` / `none`; **no set is materialised** (`.live-fixture/` absent after); the launch profile never prints a set name | pre-spawn process | — |
| **A-11** | `§3.3` clause 5 (not a park, not a `FAIL`) | the `A-1`/`A-2` output | the output carries **no** `verdict=PARKED`, **no** `parkReason=`, and no row verdict of any kind | pre-spawn process | — |
| **A-12** | `§3.3` clause 3 (nothing spawned) | `pgrep -af electron` before/after a refused run | **no new Electron process** exists after a refused run | pre-spawn process | — |
| **A-13** | `§3.3` clause 4 (nothing is written) | `ls -d .live-fixture` after a refused run | `.live-fixture/` does not exist; the repo tree gains nothing | pre-spawn process | — |

### 2.2 The set-selection failure states and the two-supply refusal (`§4`, `§6.4`)

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **B-1** | `§6.4` + `§3.3` (four supply flags) | `node scripts/live-drive.mjs --fixture=core --seed=/tmp/greens-no-such-seed` | exit `2`; `ARG-REFUSED` **naming both** the set and `--seed=`; nothing spawned; nothing written | pre-spawn process | — |
| **B-2** | `§6.4` | `node scripts/live-drive.mjs --fixture=core --corpus-root=/tmp/greens-no-such-root` | exit `2`; names the set **and** `--corpus-root=` | pre-spawn process | — |
| **B-3** | `§6.4` | `node scripts/live-drive.mjs --fixture=core --strict-seed` | exit `2`; names the set **and** `--strict-seed` | pre-spawn process | — |
| **B-4** | `§6.4` | `node scripts/live-drive.mjs --fixture=core --o0-corpus=226` | exit `2`; names the set **and** `--o0-corpus=` | pre-spawn process | Y — `§4` `S-6`'s trigger cell includes `--no-seed` (superseded: `--no-seed` is never a refusal trigger) |
| **B-5** | `§6.4` clause 2 (`empty` not exempt) | `node scripts/live-drive.mjs --fixture=empty --strict-seed` | exit `2`; refused | pre-spawn process | — |
| **B-6** | `§6.4` clause 3 (`--no-seed` is never refused) | `node scripts/live-drive.mjs --fixture=core --no-seed --strict-seed` | the refusal must be for **`--strict-seed` alone**; the line must **not** name `--no-seed` as an offence. Falsified by `--no-seed` appearing as a refused flag | pre-spawn process | Y — `§4` `S-6`'s cell (as above) |
| **B-7** | `§3.3`'s complement (the arg's non-refusal states) | `--fixture=core` **alone** proceeds | **NOT-TESTABLE-HERE**: "proceeds" means a launch; a boot is not available to me as a refusal instrument (see `§5` `F-2`) | — | — |
| **B-8** | `§4` `S-2` (the materialisation fails) | plant a **regular file** named `.live-fixture/core`, then `node scripts/live-drive.mjs --fixture=core --connect --cdp-port=9467 --port=3967 --display=:0 --home=<scratch>` | the run **aborts with a named error** on the `[live-drive] ERROR:` path stating **the set**, **the path** and the **OS error text verbatim**; exit `2`; **no blocks run**; **the fixture state on that line names the set that was ATTEMPTED**; **never a fallback to another set** | pre-spawn/abort process | — |
| **B-9** | `§4` `S-4` (`empty` is a SELECTED set, not a refusal) | `node scripts/live-drive.mjs --fixture=empty --groups=` → not a valid test of `S-4` | **NOT-TESTABLE-HERE** as a full reading: `S-4`'s observable (every gated key parks, none `FAIL`, the artifact states `empty`) needs a run whose blocks execute | — | — |

### 2.3 The five sets, the materialisation root and the content properties (`§2.1`, `§2.2`, `§2.3`)

**Instrument for this group:** `HARNESS [D] / live-process (pre-connect)` — `--fixture=<set> --connect
--cdp-port=<free>` against a **non-existent** app. The contract places the materialisation **after the
refusals and before the import** (`§7.2`), so the set's directory and the launch-profile declaration are
read from a run that then aborts at the connect. **A truncated run proves nothing about verdicts**, and
none of these rows is reported as a verdict.

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **C-1** | `§2.3` clause 1, `§15` glossary | `ls .live-fixture/` after a `--fixture=core` pre-connect run | the root is **`.live-fixture/core/`** — the set's own directory under the repo-root-relative `.live-fixture/<setName>/`, sharing no directory with `.live-corpus/` | live-process (pre-connect) | — |
| **C-2** | `§2.1` `F-1`, `§16.17` item 1 | `ls .live-fixture/core/` | exactly `alpha.md` · `beta.md` · `gamma.md` — no extra `.md` | live-process (pre-connect) | — |
| **C-3** | `§2.1` `F-2`, `§2.2` P-β | `ls .live-fixture/table/` + a `<table>` search in `table.md` | `core`'s three **plus `table.md`**; and `table.md` carries a **stored `<table>`** | live-process (pre-connect) | — |
| **C-4** | `§2.1` `F-3`, `§2.2` P-δ | `ls .live-fixture/search/` + the probe-term check (`C-8`) | `core`'s three file names, their **text rewritten so it does not carry the probe's term** | live-process (pre-connect) | — |
| **C-5** | `§2.1` `F-4`, `§16.17` item 1 | `ls .live-fixture/tabs/` | `core`'s three **plus `search.md`** | live-process (pre-connect) | Y — `F-4`'s *"a query for the probe's term paints a row"* parenthetical (superseded at `§18.2`) |
| **C-6** | `§2.1` `F-5` | `ls .live-fixture/empty/` after a `--fixture=empty` pre-connect run | the directory exists and is **empty** (`0` files) | live-process (pre-connect) | — |
| **C-7** | `§2.3` clause 2 (no stale file) | plant `stale-plant.md` inside `.live-fixture/core/`, re-run `--fixture=core` pre-connect, re-list | the planted `.md` **does not survive** the launch; **nothing outside `.live-fixture/core/` is removed** (the planted sibling outside the set root is still there) | live-process (pre-connect) | — |
| **C-8** | `§2.2` P-δ + `§5.3` clause 1(b)(a) + `§18.2` clause 4 | a token sweep over the **materialised** sets: a token carried by ≥1 document of each document-carrying set **except `search`**, and carried by **no** document of `search` | **at least one such token exists**, and every document-carrying set other than `search` carries it; **`search` carries none**. Falsified by a token carried by `search`, or by no token separating `search` from `tabs` | live-process (pre-connect) + file read | Y — `§5.5` `FA-1`/`FA-2`'s *"painted row"* glosses (superseded: the operative limb is the store query) |
| **C-9** | `§2.2` P-α, `§2.1` `F-1` | the materialised `core` documents | **≥ 3** documents with **distinct** identities, **≥ 2** carrying titles the alpha/beta selectors match (`alpha` / `beta`) | live-process (pre-connect) + file read | — |
| **C-10** | `§2.3` clause 5 (the committed-data variant) | `git ls-files .live-fixture` | **not taken** (the landing took the in-source-literal variant, `§2.3` clause 3): the materialised files must **not** be tracked | file system | — |

### 2.4 The divergent probes: the sentinels and the population check (`§5.1`, `§5.2`, `§5.4`, `§18.2`)

**Instrument for this group:** `HARNESS [D] / source-derivation` over the driver's **data regions only**
(`UF_DECLARED_FIXTURE_PROBES`, `UF_FIXTURE_DECLARATION`, `UF_FIXTURE_STATE`), printing **aggregates and
matched names only**; plus the `NODE SUITE` pin.

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **D-1** | `§5.2` sentinel table | the registry entry for `'corpus-documents'` | `read === 'rag.list_documents'` — a **tool-name string**, unchanged | source-derivation | — |
| **D-2** | `§5.2` + `§18.2` clause 1 | the registry entry for `'corpus-query-results'` | `read === 'rag.query'` (an **MCP tool read**, no `'dom:'` prefix) | source-derivation | **Y** — the filed literal `'dom:#pane-search li[data-document-id]'` is superseded in the same cell |
| **D-3** | `§5.2` + `§18.2` clause 1 | the registry entry for `'corpus-document-tabs'` | `read === 'dom:#tab-strip .tab[data-document-id]'` — **the only `'dom:'` sentinel in the registry** | source-derivation | Y — `'[data-target-kind="document"]'` spelling superseded |
| **D-4** | `§5.2` sentinel table + `§5.4` | the entries for `'self-provisioned-document'` and `'none'` | **`read === null`** for both | source-derivation | — |
| **D-5** | `§5.4` | registry key set vs the declaration's `fixtureName` value set | the two sets are **equal**; exactly **three** names carry a non-null `read` and **two** carry `null` | source-derivation | — |
| **D-6** | `§5.2` clause 3 (the `read` typing) + `§16.3` | the declared **type** of every `read` | every `read` is **a string or an explicit `null`** — never a function, never an object | source-derivation | — |
| **D-7** | `§5.2` clause 2 (the discriminated dispatch) | the `'dom:'` prefix count over the registry | exactly **one** `read` begins with `'dom:'`; every other non-null `read` carries **no** `'dom:'` prefix and is an MCP tool name | source-derivation | — |
| **D-8** | `§11.2` `PROBE-READ` (`3×probe-read`) + `§18.2` clause 7 | `npx vitest run tests/live-drive-contract.test.ts` | **no `FAIL`** in the pin's `PROBE-READ`-class arms; the three literal comparisons are the `D-1`/`D-2`/`D-3` strings | NODE SUITE | Y — the `§16.8` re-stated literal row |
| **D-9** | `§5.4` (the population-check direction) | the pin's `probe-population` arms | the gated-name-has-read direction and the never-gated-name-has-null-read direction are both graded and **green**; the undeclared-key plant is **discriminated**, not merely green | NODE SUITE | Y — `§5.4`'s *"stays green under the rule"* is refuted by read (`§16.16`) |

### 2.5 The `F-2` falsifier and the acceptance readings (`§5.5`, `§18.1`, `§18.2`, `§18.6`, `§11.3`)

**All rows of this group are class-(b) unless the row says otherwise.** The contract states them as
falsifiable predicates over the **assembled, booted** app (`§18.6`), so a node/source instrument cannot
take them.

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **E-1** | `§5.5` `FA-1` + `§11.3` item 3 + `§18.6` clause 1 | `--fixture=search`, isolated ports, boot-and-connect confirmed | `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` **PARK by name**, each `parkReason` naming `corpus-query-results`, each tagged `parkedByFixtureAbsence`; `parkedByFixtureAbsence` is **exactly** that three-key set; every `'corpus-documents'`-gated key RUNS | class-(b) | Y — the *"no result row paints"* reason (superseded: the store query's `0` hits) |
| **E-2** | `§5.5` `FA-2` + `§11.3` item 4 + `§18.6` clause 2 | `--fixture=tabs`, isolated ports, boot-and-connect confirmed | `user9_search_open_in_tab` **PARKS by name**, `parkReason` naming `corpus-document-tabs`, tagged `parkedByFixtureAbsence`; `parkedByFixtureAbsence` is **exactly** `{user9_search_open_in_tab}`; the three `'corpus-query-results'` keys **RUN** | class-(b) | Y — the *"their term paints a row"* parenthetical (superseded) |
| **E-3** | `§5.5` `FA-3` | any set | a gated key parking on **another** fixture's absence is a **false park** — the discriminator is the **(park set, route tag)** pair | class-(b) | — |
| **E-4** | `§5.5` `FA-4` + `§18.6` clause 3 | `--fixture=core`, isolated ports | all three probes read **PRESENT** (store list; store query `hits >= 1`; strip `count >= 1`) and `parkedByFixtureAbsence` is `0` | class-(b) | Y — `FA-4` as filed was unexhibitable (superseded at `§18.2` clause 4) |
| **E-5** | `§5.5` `FA-5` + `§3.1` clause 3 | a run with **no** `--fixture` | the state reads the `none` triple and the arg's arrival moved nothing | class-(b) for the block readings; its **state** limb is taken by `A-10` | — |
| **E-6** | `§5.5` `FA-1`'s set-side precondition | the materialised sets (`C-8`) | `search` carries **no** document matching the probe's term (otherwise `FA-1` cannot be exhibited) | source-derivation over the sets | — |
| **E-7** | `§2.2` P-θ + `§18.2` clause 1 | `--fixture=tabs` at the pre-gesture read point | **no document tab is open in the strip** while the store is NON-EMPTY | **NOT-TESTABLE-HERE** — a rendered-strip/boot reading; no node instrument reaches it and I took no boot | — |
| **E-8** | `§18.6` clause 1(iv) (the cross-run falsifier) | `search` vs `tabs`, same probe, same driver | the probe reads **differently** under the two sets (`hits 0` vs `hits >= 1`) — an identical reading under both is **the collision returned, not a pass** | class-(b) | — |
| **E-9** | `§11.3` item 5 (`--fixture=empty`) | `--fixture=empty`, isolated ports | every one of the `35` gated keys parks by name and **not one** reports `FAIL`; the artifact names `empty` as the selected set | class-(b) | — |
| **E-10** | `§11.3` item 2 (`--fixture=table`) | `--fixture=table`, isolated ports | `u_edit_1_live_package_table_limitation` is **not parked**, and its evidence **names the table document**; `PASS`/`FAIL` both admissible | class-(b) | Y — *"stops parking with 'cannot be met in this corpus'"* (the words are also the block's own park text; `§16.11` ruled the (verdict, evidence) pair) |
| **E-11** | `§11.3` item 6 (`class-(b):route-only-none-state`) | an obsolete-route-only run (`--strict-seed`-shaped, no `--fixture`) | the state reads `none`/`none`/`none` **even though the store is non-empty** | class-(b) | — |
| **E-12** | `§11.3` item 7 (`class-(b):default-unmoved`) | a no-`--fixture` run | the launch profile is unmoved by the arg's arrival and the state reads `none` | class-(b) | — |
| **E-13** | `§11.3` item 8 (`class-(b):two-supply-refusal`) | `--fixture=core --strict-seed` | one `ARG-REFUSED` line naming both, exit `2`, nothing spawned, **no SET materialised**, no scratch HOME minted | taken **partially** by `B-3` (pre-spawn limbs); its *live* limbs are class-(b) | Y — `no SET was materialised` is the settled string; `nothing written` is struck |
| **E-14** | `§11.3` item 9 (`class-(b):honesty`) | every reading above | each states its fixture and **no reading is quotable as a live-corpus app reading** | REVIEW-ONLY rule | — |
| **E-15** | `§11.3` item 10 (`class-(b):trio-scope`) | `grep` `package.json`, `vitest.config.ts` | `scripts/live-drive.mjs` is in **no** trio leg, so the trio proves nothing about the driver | shell + file read | — |

### 2.6 The run's declaration of its fixture (`§7.1`, `§7.2`, `§7.3`, `§16.4`, `§16.5`, `§16.13`)

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **F-1** | `§7.1` + `§16.4` | the module-level `UF_FIXTURE_STATE` literal | exactly **three** members — `state` · `kind` · `id` — **no fourth member**; all three are strings | source-derivation | — |
| **F-2** | `§7.1` + `§16.17` item 5 | the `none`-form values of that literal | `'no fixture data set selected'` / `'none'` / `'none'` | source-derivation | — |
| **F-3** | `§7.1` + `§16.17` item 5 | the launch-profile line of a `--fixture=core` run | the state **names `core`**, `fixtureKind` reads **`mock-data-set`**, `fixtureId` reads **`core`** | live-process (pre-connect) | — |
| **F-4** | `§7.1` clause 2 + `§7.3` `D-3` | the **printed** statement at the post-assignment sites | the **materialisation root** is printed as a **`.live-fixture/<setName>/`-shaped** value beside the state — **as printed text, not as a fourth state member** | live-process (pre-connect) | — |
| **F-5** | `§16.4` (the ruling) | `F-1`'s member count | the root is **absent from the object**; a landing that added it would make `state-member` `4×` and the contract says the reading of record is the **three-member** one | source-derivation | — |
| **F-6** | `§7.3` `D-7` + `§9` clause 3 + `§16.14` | the printed `mock-data-set` consequence clause | it is **derived and conditional** and it **carries the non-quotability sentence**: *"a fixture-fed PASS may NOT be quoted as a live-corpus app reading"* (that text, or its exact substance, present in the artifact's own mock clause) | live-process (pre-connect) | — |
| **F-7** | `§7.3` `D-7` | the `none` consequence vs the mock consequence | the `none`-state consequence is **not** printed on a `mock-data-set` run (and vice versa) | pre-spawn + live-process (pre-connect) | — |
| **F-8** | `§7.2` clause 2/3 + `§16.5` + `§10.2.3` `print-site:early-paths` | `--groups=` refusal · the four `A-` refusals · the `B-` refusals | **every early site carries the `none` triple** (`no fixture data set selected` + `none` + `none`) | pre-spawn process | Y — `§7.2` clause 2's *"unless a valid `--fixture=` was parsed"* limb is superseded |
| **F-9** | `§16.5` (negative limb) | the same early-site lines | **the selected set's name appears on NO early line** — a set name on a refusal line is the offence | pre-spawn process | — |
| **F-10** | `§7.2` site 4 | the module-level `main().catch` `ERROR:` line | carries the fixture state | **NOT-TESTABLE-HERE** — inducing a module-level throw is not an instrument I hold (and would be a destructive probe) | — |
| **F-11** | `§11.2` `STATE-DERIVATION` (`3×state-derivation`) | the pin | **from-argv-only**, **one assignment**, and the assignment sits **after** the refusal branches | NODE SUITE | — |
| **F-12** | `§2.3` clause 7 + `§6.4` clause 4 + `§16.13` | the launch line of a `--fixture=core` run | the implied **`--no-seed`** is **printed** on the launch line (the obsolete seed route does not run under a selected set) | live-process (pre-connect) | — |
| **F-13** | `§7.3` `D-4` | a `mock-data-set` kind with `fixtureId` `none` | contradiction — `fixtureKind` is a function of the selection and of nothing else | source-derivation (the derivation's shape) | — |
| **F-14** | `§7.3` `D-6` + `§6.3` clause 4 | every state value | no state value names an obsolete supply mechanism (`seedCorpus` · `--strict-seed` · `--o0-corpus` · `o0MarkdownTree` · `.live-corpus`) | source-derivation | — |

### 2.7 The run's fixture observation and the park chain (`§16.5`, `§17.4`)

| ID | CLAUSE | INVOCATION / OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **G-1** | `§16.5` + `§17.4` | the driver's own observation member name | the member **`parkedByFixtureAbsence`** exists (the chain's middle member) | source-derivation | Y — `parkedByAbsence` is the superseded typo |
| **G-2** | `§17.4` | the printed field name | **`parked-by-fixture-absence=`** is printed beside `blocksRun` | source-derivation (literal sweep) | — |
| **G-3** | `§16.5` + `§17.4` | the printed observation line of any run with parks | the three park members are printed **together** and the chain **`parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked`** holds **numerically** | class-(b) for the numbers; the **printing** limb is source-derivation | — |
| **G-4** | `§5.5`'s gate-2 block (the route) | the `FA-1`/`FA-2` parks' **route tag** | those parks are **body-owned**, tagged fixture-absence, **never** the gate branch (the store is non-empty there, so the gate predicate is false) | class-(b) | — |

### 2.8 The censuses (`§16.17` item 2, `§17.1` clause 3, `§20`)

**Instrument:** `HARNESS [D] / source-derivation` over `UF_FIXTURE_DECLARATION`, printing **counts and
matched names only**.

| ID | CLAUSE | OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **H-1** | `§16.17` item 2 + `§17.1` clause 3 | declaration entry count | **`47`** | source-derivation | — |
| **H-2** | `§16.17` item 2 | `corpusRead:false` entries | **`3`**, and they are named exactly `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker` | source-derivation | — |
| **H-3** | `§16.17` item 2 + `§16.1` | `selfProvisioning:true` entries | **`9`** (UNIT A's `10` minus the moved entry) | source-derivation | Y — UNIT A's `10` (kept visible at its site) |
| **H-4** | `§17.1` clause 3 + `§20.1` | gated population (`corpusRead && !selfProvisioning`) | **`35`** — and it equals both `47 − 3 − 9` and `31 + 3 + 1` | source-derivation | — |
| **H-5** | `§16.17` item 2 + `§20.1` | the `fixtureName` census **among the gated entries** | `'corpus-documents'` **`31`** · `'corpus-query-results'` **`3`** · `'corpus-document-tabs'` **`1`**; `'self-provisioned-document'` and `'none'` **`0`** each | source-derivation | **Y** — the filed `25` (`25 + 3 + 1 = 29 ≠ 35`) is superseded and is kept visible at its sites |
| **H-6** | `§16.17` item 2 + `§20.1` clause 2 | the `'corpus-query-results'` gated keys | exactly `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` | source-derivation | — |
| **H-7** | `§16.17` item 2 + `§20.1` clause 3 | the `'corpus-document-tabs'` gated keys | exactly `user9_search_open_in_tab` | source-derivation | — |
| **H-8** | `§17.1` clause 1 + `§16.1` (the atomic landing) | the declaration entry for `u_edit_1_live_package_table_limitation` | `corpusRead:true` · `selfProvisioning:false` · `fixtureName:'corpus-documents'` — i.e. **GATED** (the `§16.1` column-move landed) | source-derivation | — |
| **H-9** | `§16.17` item 2 + `§20.2` clause 2 | the `stage_*` and `o0_*` families **inside the `31`** | **`8`** `stage_*` + **`5`** `o0_*` = **`13`**, leaving `18` in the remainder | source-derivation | — |
| **H-10** | `§6.3` clause 4 + `§5.4` | every declaration `fixtureName` | lies in the closed set (`'corpus-documents'` · `'corpus-query-results'` · `'corpus-document-tabs'` · `'self-provisioned-document'` · `'none'`); **no obsolete mechanism appears as a `fixtureName`** | source-derivation | — |
| **H-11** | `§16.17` item 2 (the enumeration is the authority) | the `'corpus-documents'` gated key **count** | **`31`** — the enumeration's own count, and the figure the arms assert | source-derivation | Y — the filed `25` |
| **H-12** | `§16.17` item 3 | the corrected names/keys | `stage_surface_census_i2r` exists as a gated declaration entry (`stage_multimount_reachability` and `stage_boot_landing_diag` are **not** declaration entries) | source-derivation | — |
| **H-13** | UNIT A `§16.7`/`§4.3` `D-4` (re-read at the landed head, never carried) | the gated keys carrying `rows: []` | **`13`** gated keys (so `21` carry ids) — a **cross-unit** figure the contract requires to be **re-read**, not carried | source-derivation | — |
| **H-14** | `§10.2` + `§16.17` item 7 | the register's arithmetic as the **pin** reports it | `17 + 12 + 11 + 27 = 67` declared · `57` executed · seed `0x20261005` · caps `≤100`/row · `≤400` total · `≤8` rows · the four `§4 P-*` titles | NODE SUITE | Y — `P-TP-5`'s superseded spelling (gate-3 amend) |
| **H-15** | `§10.2.3` (gate-3 amendment) | the pin's own `declaredLastTermOf` identity | the identity `declaredLastTermOf === declaredClassB` **holds on all four rows** with **no carve-out** (`0`/`0`/`0`/`10`) — a `P-TP-5` filter in the pin is the offence | NODE SUITE | Y — the gate-2 note's *"all four already satisfy"* claim and the `P-TP-5` carve-out, both superseded |
| **H-16** | `§10.2.1` | the two landed registers | register 1 (`7` rows / `0x20260929`) and UNIT A's (`4` rows / `0x20261002`, `11 + 24 + 24 + 20 = 79`) are **untouched** | NODE SUITE | — |

### 2.9 `.gitignore`, the citations and the obsolete route (`§2.3` clause 4, `§6.2`, `§6.3`, `§2.4`)

| ID | CLAUSE | OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **I-1** | `§2.3` clause 4 + `§1.2` | `git diff .gitignore` | **exactly one added line**, for the materialisation root (`.live-fixture/`), on the standing `.live-corpus/` precedent; **no other ignore entry is this unit's** | file system | — |
| **I-2** | `§6.3` clause 3 + `§2.4` clause 4 + `§10.2.3` `citation-repoint:surface-prose` | the `surface` prose members of `UF_FIXTURE_DECLARATION` | **no `surface` member quotes a dead (`.live-corpus`) identity** | source-derivation | — |
| **I-3** | `§16.7` + `§10.2.3` `repin-completeness:self-provisioners` | a literal sweep of the driver for the `.live-fixture/core/` **hardcoded literal** | **zero** occurrences — the self-provisioners' write path is the root resolver's output, never a hardcoded set literal (a hit is the `--fixture=empty`/`--fixture=table` hazard `§16.7` closes) | source-derivation | — |
| **I-4** | `§2.4` clause 2 + `§10.2.3` `repin-completeness` | a literal sweep of the driver for the **old identity family** `.live-corpus/alpha` · `.live-corpus/beta` · `.live-corpus/live4-first` · `.live-corpus/import1-fresh` · `.live-corpus/ms3-fresh` | **zero** occurrences of the old **identity** literals — the re-pin set is by direct string substitution. (The `.live-corpus` **route** itself stays, `§6.1` *annotate, never extend*; those occurrences are not this row's subject and are counted separately as an observation) | source-derivation | — |
| **I-5** | `§2.1` `F-2` + `§16.2` | a literal sweep for the `R-13` candidate head | the candidate head is the **table document's own identity** — the sweep records whether the literal `.live-fixture/table/table` is present, and the row is graded **OBSERVATION ONLY**: under a selected set the head is the set's identity and with no fixture selected it keeps its pre-arg value, so absence of the exact literal is not by itself an offence | source-derivation (observational) | — |
| **I-6** | `§6.1` + `§6.2` `B-1` | a sweep for the obsolete route's own default | the obsolete route **still exists** (annotate-never-extend) — its occurrences are expected to be **> 0**; the row is **OBSERVATION ONLY** | source-derivation (observational) | — |

### 2.10 The honesty clause and the trio scope (`§9`, `§11.3` item 10)

| ID | CLAUSE | OBSERVABLE | EXPECTED (falsifiable) | LAYER | SUPERSEDED BESIDE |
| --- | --- | --- | --- | --- | --- |
| **K-1** | `§9` clause 1 + `§11.2` `HONESTY-CLAUSE` | the pin's `honesty-clause` arms | the `proxyPASS` limb holds (a proxy oracle still reads `proxyPASS:true` + `pass:false` under a mock set) and the non-quotability arm is **armed with a named mutation** | NODE SUITE | Y — `§9` clause 3's *"arms `R-mock`"* citation (UNIT A carries the rule as prose) |
| **K-2** | `§9` clause 3 | any quotation of a fixture-fed `PASS` as a live-corpus app reading | **forbidden** — a rule about how this artifact's readings may be quoted, not an observable: **REVIEW-ONLY** | — | — |
| **K-3** | `§11.3` item 10 + `§9` clause 6 | the trio's leg definitions | `scripts/live-drive.mjs` appears in **no** trio leg; a green trio proves nothing about the driver | shell + file read (= `E-15`) | — |
| **K-4** | `§16.14` | the artifact's non-quotability **text** | present in the `mock-data-set` consequence (= `F-6`) and **absent** from the `none` consequence | live-process (pre-connect) | — |

---

## 3. WHAT THIS SCENARIO SET DOES **NOT** COVER (stated before the runs)

1. **The ten class-(b) live readings** (`§11.3` items 1–10) are the live battery's, not this artifact's,
   **unless** a row above says a boot-and-connect was genuinely taken. A `class-(b)` row I cannot take is
   `NOT-TESTABLE-HERE` and is **never** a pass (`§8`).
2. **No app-layer claim of any kind.** `src/**` is denied to this unit; an app `FAIL` printed in a
   battery is not this unit's result.
3. **The sets' *content bytes*** are the landing pass's (`§13.3` item 2, `§13.3` item 7(c)); the
   properties of `§2.2` are graded, not the literals — including the probe term's own literal, which the
   contract deliberately leaves to the landing pass, so `C-8` grades the **separation property** instead.

*(`§4` — the readings — and `§5` — the fail ledger — follow; they were appended after the runs.)*

## 4. THE READINGS (appended after the runs)

### 4.0 The head, the instruments and the run ledger

| # | Instrument | Exact command shape | Rows it carries |
| --- | --- | --- | --- |
| 1 | `HARNESS [D] / pre-spawn process` | `node scripts/live-drive.mjs <args>` — paths that exit **before** any Electron child is spawned | `A-*`, `B-1`…`B-6`, `B-8`, `B-10`…`B-12`, `F-8`/`F-9`'s refusal limbs |
| 2 | `HARNESS [D] / live-process (pre-connect)` | `timeout 150 node scripts/live-drive.mjs --fixture=<set> --connect --port=<free> --cdp-port=<free> --display=:0 --home=<scratch under /tmp>` — materialises the set, prints the declaration, then aborts on a connect that cannot succeed (**`--connect` does not spawn**) | `C-1`…`C-7`, `F-4`'s materialisation limb, `B-8`'s abort |
| 3 | `HARNESS [D] / live-process (boot-and-connect)` | `timeout 240 node scripts/live-drive.mjs --fixture=<set> --block=<key[,key]> --port=39XX --cdp-port=94XX --display=:0 --home=<scratch under /tmp>` — a real Electron boot, MCP+CDP connected, then the driver sweeps its own child group | `F-3`, `F-4`, `F-6`, `F-7`, `F-12`, `G-3`, `G-4`, and the `E-1`/`E-2`/`E-4`/`E-8`/`E-10` readings |
| 4 | `HARNESS [D] / source-derivation` | `node /tmp/greens-extract*.mjs` · `/tmp/greens-count*.mjs` over `scripts/live-drive.mjs`'s **data regions and literals** (aggregates, counts and matched names only — **no source text printed**, and the driver is never imported) | `D-*`, `F-1`, `F-2`, `F-5`, `F-14`, `G-1`, `G-2`, `H-*`, `I-2`…`I-6` |
| 5 | `NODE SUITE` | `npx vitest run tests/live-drive-contract.test.ts --reporter=verbose` | `D-8`, `D-9`, `F-11`, `H-14`…`H-16`, `K-1` |
| 6 | file system / shell | `git diff --numstat .gitignore` · `git ls-files` · `ls` · `ps`/`pgrep` · `grep -c` · `grep -rn live-drive package.json vitest.config.ts` | `E-15`/`K-3`, `I-1`, `C-10`, the hygiene checks |

**Every command was run from the repo root
`/media/ryanr/Shared Files/Projects/Astrographer`.** Scratch HOMEs were `mktemp -d` directories under
`/tmp` (the driver removes the operator-named one, without force, at its own end); isolated ports were
**`3961`–`3978` / `9461`–`9478`**; **`9222` was never used**; `ps -eo cmd | grep -c "[e]lectron/dist/electron"`
and the same for `live-drive.mjs` were **`0`** before the first run and **`0`** after the last.

### 4.0.1 What the run ledger actually contains (stated before any result)

| Fact | Reading |
| --- | --- |
| The head I ran against | the working tree at `f124358` + the five uncommitted files (`scripts/live-drive.mjs`, `tests/live-drive-contract.test.ts`, `.gitignore`, the two fixture specs). **I did not read either uncommitted implementation file.** |
| Refusal / abort runs | **`19`** `node scripts/live-drive.mjs …` invocations whose exit was a contracted refusal or abort path (`A-1`…`A-8`, `A-10`, `B-1`…`B-6`, `B-8`, `B-10`…`B-12`) — **no Electron child spawned by any of them** (verified: `ps -eo cmd \| grep -c "[e]lectron/dist/electron"` = `0` throughout). |
| Pre-connect runs (a driver run that materialises its set, prints its declaration and then aborts on a connect that cannot succeed — **`--connect` does not spawn**) | **`7`** (`--fixture=<each of the five sets>` once, plus `core` twice: the harness-truncated first attempt and the `C-7` no-stale re-run). Each printed `[live-drive] CONNECT mode: attaching to RUNNING app … (no spawn)` and ended in the driver's own `waitFor timed out after 60000ms` → `ERROR` → **exit `2`** (except the first, which the harness killed at its 60 s cap — **a truncated run proves nothing and is not reported as a result**; it was re-taken to completion as `C-core`). |
| Live runs | **`9`** boot-and-connect runs, each on its own isolated ports (**`3970`–`3978` / `9470`–`9478`**), `--display=:0`, an operator-named scratch `--home` under `/tmp`, **never `9222`**: `1` scoped-`core` (the first), the **`search`/`tabs`/`core` triple** on `uf_panes_14`, the `tabs`/`core` pair on `user9_search_open_in_tab`, `2` two-block `core` runs (`uf_tabs_1,uf_panes_14` and `uf_tabs_1,user9_search_open_in_tab`), and `1` `table` on `u_edit_1_live_package_table_limitation`. **Every one reached `LAUNCH PROFILE` and `renderer ready — MCP backend armed`**, i.e. boot-and-connect confirmed (for two runs the launcher's own messages went to the `.time` stream rather than `.out`; the confirmation is there: `grep -c "renderer ready" /tmp/greens-runs/<ID>.time` = `2`); the driver swept its own child process group at the end of each and left **no Electron and no `live-drive.mjs` process** (`0` / `0` after the pass) and **every port released**. |
| The pin | `npx vitest run tests/live-drive-contract.test.ts --reporter=verbose` → **`Test Files 1 passed (1)` · `Tests 123 passed (123)` · `0` failed** (`16.41 s`). |
| **NOT run by this pass (stated so it is not implied)** | **`npm test`, `npm run typecheck`, and an explicit `npm run build` were NOT run as a trio.** The live runs' own launcher did run `npm run build` as a side effect (`[start-app] building dist/ …` succeeded before each boot) — that is the driver's launcher, not this unit's third leg. |
| Tree state after the pass | `.live-fixture/` (created by my runs) **removed**; the operator's `planted-sibling.md` probe and the `B-8` planted file removed with it; nothing under `scripts/**`, `tests/**`, `src/**` or any existing `docs/specs/*.md` was written by me. `git status --short` reads exactly the five pre-existing modifications + this new file. |
| Raw evidence | every invocation's full output is in `/tmp/greens-runs/<ID>.out` (this pass's own scratch, outside the repo). |

### 4.1 The readings, row by row

**`PASS`** = the frozen predicate was exhibited. **`FAIL`** = it was falsified (`§5`). **`PARTIAL`** = some
limbs exhibited, the rest not taken — **never counted as a pass**. **`NOT-TESTABLE-HERE`** = no instrument I
hold could take it (`§7`). **`OBSERVED`** = an observational row with no contract predicate to grade.

**⟨GATE-7 PROOFREAD PASS `2026-10-05` (`RCA-8(c)`) — THE ROWS WHOSE READING HAS MOVED AT THE LANDED HEAD, EACH WITH ITS OLD AND ITS CURRENT READING; THE ROWS THEMSELVES ARE KEPT VERBATIM ABOVE AND BESIDE.** **THE HEAD: `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines (`RECORDED READING; measurer: the supervisor`; line count corroborated by this pass's file-read census), against the `eac6d17477323f7770b0f6a4c011807e` · `9637`-line driver this artifact ran.** **(`a`) `E-1` · `E-2` · `E-4` · `E-8`** — their `rag.query … -> 0 hit(s)` limbs: **OLD** = `0 hit(s)` under EVERY set; **CURRENT** = `3 hit(s)` under `core`, `4` under `tabs`, `0` under `search`, because the driver now writes each imported document's authored text onto its ROOT node through `edit.set_content` after the import (`[live-drive] FIXTURE ROOT TEXT: 3/3 …`) and the term reaches the store's lexical index. **`E-4`'s `parkedByFixtureAbsence=1` and `E-1`/`E-2`'s parks under a NON-`search` set therefore no longer reproduce, and `E-8`'s cross-run falsifier now holds in the required direction.** **(`b`) `E-10`** — **OLD** = the row PARKED under `--fixture=table`; **CURRENT** = `verdict=PASS`, `rendered table census on the surface={"tables":1,"trs":1,"tds":4}`, `0 PARKED` — the set's `table.md` carries the GFM pipe-table form (`§22.2` item 3). **(`c`) `C-3`** — its frozen predicate (*"`table.md` carries a **stored `<table>`**"*) is `SUPERSEDED` as the contracted FORM: **OLD** = a raw `<table>` literal in `table.md`; **CURRENT** = the parser-mediated GFM pipe table (the raw literal is dropped by the app's own import), so the row's file-list limb PASSES unchanged and only its form limb moves. **(`d`) `E-2`'s `dom:` limb is NOT a `FAIL` and NOT a pass: it is the ruled `SKIPPED-BY-RULING` (`§22.3`), and the `0 rendered row(s)` it prints is structural (the literal `data-document-id` exists in `src/renderer/pane-graph.ts` for PANES and never on `#tab-strip .tab`) — NEVER evidence of the fixture's absence.** **(`e`) `B-1`** — **OLD** = the refusal names the FAMILY only; **CURRENT** = the line names each supplied flag (`--seed="<value>"` · `--corpus-root="<value>"` · `--strict-seed` · `--o0-corpus=226`) BESIDE the family list (`§21.2`'s requirement, met; the gate-6 battery's `L-2` is marked at its own site). **NOTHING ELSE IN THIS TABLE MOVES: every `PASS`, every `NOT-TESTABLE-HERE`, every `OBSERVED` and every `REVIEW-ONLY` row stands as the reading of its own head, and `F-4`/`F-5` (`H-9`, `I-3`) still STAND.** **LAYER (`RCA-12`): the `hits`, the `verdict` and the census are APP/`[D]` readings taken against a NAMED mock set — never a live-corpus reading and never this unit's app claim.**⟩**

| ID | Result | The observed reading (exact) |
| --- | --- | --- |
| **A-1** | **PASS** | exit `2`; `[live-drive] ARG-REFUSED: --fixture="" names NO set at all (the empty value is NOT the empty set) — pass --fixture=<core\|table\|search\|tabs\|empty> or omit the flag to take the neutral default (no fixture data set selected); fixture={"state":"no fixture data set selected","kind":"none","id":"none"} …` |
| **A-2** | **PASS** | exit `2`; `--fixture="banana" is not one of the accepted names (case-sensitive, untrimmed)` + the closed set listed |
| **A-3** | **PASS** | exit `2`; `--fixture="core,table" is not one of the accepted names …`; `.live-fixture/` absent after → nothing partially applied |
| **A-4** | **PASS** | exit `2`; `--fixture=" core"` shown **verbatim** (not trimmed into the set) |
| **A-5** | **PASS** | exit `2`; `--fixture="core "` shown verbatim |
| **A-6** | **PASS** | exit `2`; `--fixture="CORE"` refused (case-sensitive, no lowercasing) |
| **A-7** | **PASS** | exit `2`; `--fixture="core" and --fixture="table" name TWO DIFFERENT sets — one set per run, and last-wins is FORBIDDEN …` (**both values named**) |
| **A-8** | **PASS** | `--fixture=core --fixture=core --strict-seed` → exit `2` with the **two-supply** refusal; **no repeat/conflict offence is named** → the identical repeat is admissible |
| **A-9** | **NOT-TESTABLE-HERE** | `§7` |
| **A-10** | **PASS** | `--groups=` (no `--fixture`): exit `2`, and the line carries `fixture={"state":"no fixture data set selected","kind":"none","id":"none"}`; `.live-fixture/` absent → **no set materialised** |
| **A-11** | **PASS** | `grep -lE "verdict=PARKED\|parkReason\|FAIL" /tmp/greens-runs/A-*.out /tmp/greens-runs/B-*.out` → **no file matches**; no refusal output carries a park or a verdict |
| **A-12** | **PASS** | `0` Electron processes after every refusal batch; `0` after the whole pass |
| **A-13** | **PASS** | `.live-fixture/` absent after every refusal batch; no refused run created a directory or removed anything |
| **B-1** | **PASS** | `--fixture=core --seed=/tmp/greens-no-such-seed` → exit `2`; `—fixture="core" together with an OBSOLETE SUPPLY flag (--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` (see `§6` `D-2`: the family is listed, not the single offending flag) — **⟨GATE-7 PROOFREAD PASS `2026-10-05`: THE READING ABOVE IS THIS ARTIFACT'S OWN AND IS KEPT VERBATIM; ITS `D-2` LIMB IS CURED AT THE LANDED HEAD (`md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): the line now reads `… together with the OBSOLETE SUPPLY flag THE RUN ACTUALLY SUPPLIED, NAMED: --seed="/tmp/greens-no-such-seed" — this is the offending supply (§21.2: the flag must be named, not only its family); the FAMILY stands beside the name, never in its place (--seed= / --corpus-root= / --strict-seed / --o0-corpus=) …`, with ONE reading per supplied flag (`--seed="<value>"` · `--corpus-root="<value>"` · `--strict-seed` · `--o0-corpus=226`), each exit `2`, nothing spawned and nothing materialised. `B-2`…`B-4` NAME THEIR OWN FLAG THE SAME WAY. THE FOUR ROWS' `PASS` VERDICTS ARE OTHERWISE UNMOVED.**⟩
| **B-2** | **PASS** | as `B-1` with `--corpus-root=`; exit `2` |
| **B-3** | **PASS** | as `B-1` with `--strict-seed`; exit `2` |
| **B-4** | **PASS** | as `B-1` with `--o0-corpus=226`; exit `2` |
| **B-5** | **PASS** | `--fixture=empty --strict-seed` → exit `2` (the `empty` set is **not** exempt) |
| **B-6** | **PASS** | `--fixture=core --no-seed --strict-seed` → refused for `--strict-seed` **only**; the line states `--no-seed` *"is never a supply and is refused on NO path"* |
| **B-7** | **NOT-TESTABLE-HERE** | `§7` |
| **B-8** | **PASS** | planted a regular file at `.live-fixture/core`, ran `--fixture=core --connect …` → exit `2`; `[live-drive] ERROR: Error: the mock fixture set "core" could NOT be materialised at .live-fixture/core/ — ENOTDIR: not a directory, mkdir '.live-fixture/core/' (the OS error text, VERBATIM); NO block ran and no substitute set is used (§4 S-2, §2.3 clause 6) fixture={"state":"mock data set core selected","kind":"mock-data-set","id":"core"}` → the **set**, the **path**, the **verbatim OS text**, **no block**, **no substitute**, and the state names the **attempted** set |
| **B-9** | **NOT-TESTABLE-HERE** | `§7` |
| **B-10** | **PASS** (row added after the freeze — see `§6` `D-5`) | `--fixture=table --strict-seed` → the **two-supply** refusal, not an unknown-value refusal ⇒ `table` is an accepted value (`§3.2` closed set) |
| **B-11** | **PASS** (added after the freeze) | `--fixture=search --strict-seed` → two-supply refusal ⇒ `search` accepted |
| **B-12** | **PASS** (added after the freeze) | `--fixture=tabs --strict-seed` → two-supply refusal ⇒ `tabs` accepted |
| **C-1** | **PASS** | `[live-drive] FIXTURE MATERIALISED: fixtureId=core fixtureRoot=.live-fixture/core/ — the set's OWN directory …`; `ls .live-fixture/` → `core empty search table tabs` (five set directories, one root) |
| **C-2** | **PASS** | `ls .live-fixture/core/` → `alpha.md beta.md gamma.md`; `C-7` re-ran it and the planted file vanished |
| **C-3** | **PASS** | `ls .live-fixture/table/` → `alpha.md beta.md gamma.md table.md`; `table.md` is the **only** document in any set matching `/<table[\s>]/` — **⟨GATE-7 PROOFREAD PASS `2026-10-05`: THE FILE-LIST LIMB (`alpha.md beta.md gamma.md table.md`, `core`'s three plus `table.md`) PASSES UNCHANGED; THE FORM LIMB HAS MOVED. OLD READING: `table.md` carried a raw `<table>` literal (the `/<table[\s>]/` match above is that literal). CURRENT READING (`RECORDED READING` of the gate-6 battery's `table` run at `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): the set carries the GFM PIPE-TABLE form (the piped header row plus its \`| --- | ---\` separator, which the app's own import preserves), so THE `/<table[\s>]/` MATCH NO LONGER FIRES — `table.md` is no longer the document that matches it, it is the document that does NOT — and the row itself reads `verdict=PASS` with `rendered table census={"tables":1,"trs":1,"tds":4}`; the raw-`<table>` literal is `SUPERSEDED` as the contracted FORM (gate-5 ruling `§22.2` item 3, `§22.4` item 3). THE C-4/C-5/C-8 SET-CONTENT ROWS ARE UNAFFECTED (the term's carriage and the file lists did not move).⟩** |
| **C-4** | **PASS** | `ls .live-fixture/search/` → the three names, contents rewritten (lengths `54`/`23`/`15` vs `core`'s `50`/`19`/`20`) and carrying **no** probe term |
| **C-5** | **PASS** | `ls .live-fixture/tabs/` → `alpha.md beta.md gamma.md search.md` |
| **C-6** | **PASS** | `ls .live-fixture/empty/` → **empty**; the artifact prints *"the set carries NO file and its directory is left EMPTY (`no SET was materialised`)"* |
| **C-7** | **PASS** | planted `stale-plant.md` in `.live-fixture/core/` + `planted-sibling.md` **outside** the set dir, re-ran `--fixture=core`: after the launch the set dir was `alpha.md beta.md gamma.md` (the plant **gone**) and `planted-sibling.md` **still present** → the no-stale-file removal is confined to the run's own set directory |
| **C-8** | **PASS** | the probe's term is the single constant `ufmockterm` (`12` source occurrences; per-set carriage measured over the **materialised** files: `core` 3/3, `table` 4/4, `tabs` 4/4, **`search` 0/3**, `empty` 0) → the term is carried by every document-carrying set **except** `search`, and `tabs` carries it in `search.md` |
| **C-9** | **PASS** | `core` = 3 documents, distinct identities, titles `Alpha` · `Beta` · `Gamma`; the live import printed `documentIds:[".live-fixture/core/alpha",".live-fixture/core/beta",".live-fixture/core/gamma"]` — **the `§2.4` identity scheme verbatim** |
| **C-10** | **PASS** | `git ls-files .live-fixture` → empty (the materialised sets are untracked) |
| **D-1** | **PASS** | registry `read` for `'corpus-documents'` = `'rag.list_documents'` |
| **D-2** | **PASS** | `'corpus-query-results'` = `'rag.query'` (no `'dom:'` prefix) |
| **D-3** | **PASS** | `'corpus-document-tabs'` = `'dom:#tab-strip .tab[data-document-id]'` |
| **D-4** | **PASS** | `'self-provisioned-document'` = `null`, `'none'` = `null` |
| **D-5** | **PASS** | registry keys `{corpus-document-tabs, corpus-documents, corpus-query-results, none, self-provisioned-document}` **=** the declaration's `fixtureName` value set; `3` non-null / `2` null |
| **D-6** | **PASS** | every `read` type is `string` or `null`; `0` entries are neither |
| **D-7** | **PASS** | exactly **one** `'dom:'`-prefixed `read` in the registry |
| **D-8** | **PASS** | pin: `[mock-set-arms P-SM-5] 0 RED / 12 GREEN`; `probe-read:corpus-documents` · `:corpus-query-results` · `:corpus-document-tabs` all **GREEN** |
| **D-9** | **PASS** | pin: `probe-population:gated-name-has-read` and `probe-population:never-gated-name-has-null-read` **GREEN** (and `A-5.vi`'s undeclared-key arm GREEN at its own `describe`) |
| **E-1** | **FAIL** | its **(iv) cross-run falsifier** is falsified (`E-4`/`E-8`): under `--fixture=search` `uf_panes_14` prints `PARKED (the declared fixture corpus-query-results reads ABSENT at this run (rag.query for the probe's own constant term -> 0 hit(s) …))` with `parkedByGate=0`, `parkedByFixtureAbsence=1` — **but the same probe reads the identical `0 hit(s)` under `tabs` and under `core`**. Its (i)/(ii)/(iii) limbs are scoped-run reads (§5 `F-1`) |
| **E-2** | **FAIL** | `--fixture=tabs` → `user9_search_open_in_tab` prints `PARKED (the declared fixture corpus-document-tabs reads ABSENT at this run (dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s) …))` naming its own fixture (**limb (i) verified**) — but the required limb *"the three `'corpus-query-results'` keys **RUN**"* is **falsified**: `uf_panes_14` parks under `tabs` too, and the probe reads identically under `core` (`E-4`) |
| **E-3** | **PARTIAL** | every park observed names **its own declared fixture** and is tagged fixture-absence, so **no crossed park was seen**; the *whole-run park set* limb is not taken (scoped runs) |
| **E-4** | **FAIL** | `--fixture=core --block=uf_panes_14`: `PARKED … rag.query … -> 0 hit(s)` → **`'corpus-query-results'` reads ABSENT under `core`**, where `§18.6` clause 3 requires PRESENT. Same run also falsifies the *"`parkedByFixtureAbsence` is `0`"* limb (`parkedByFixtureAbsence=1`) |
| **E-5** | **PARTIAL** | the state limb is taken (`A-10`: the `none` triple with no `--fixture`); the block-level limbs need a full no-fixture run, not taken |
| **E-6** | **PASS** | `C-8`: `search` carries no document matching the probe's term |
| **E-7** | **NOT-TESTABLE-HERE** | `§7` — and note the reason is now sharper than "no boot": **the only instrument that would show it (the strip probe) reads `0` in every set, including the runs where the same app demonstrably renders document tabs** |
| **E-8** | **FAIL** | the cross-run falsifier is falsified: `search`, `tabs` and `core` all read `rag.query -> 0 hit(s)`; §18.6 clause 1(iv) says **"AN OBSERVER WHO SEES BOTH RUNS READ ALIKE HAS SEEN THE COLLISION RETURN, NOT A PASS"** |
| **E-9** | **NOT-TESTABLE-HERE** | `§7` |
| **E-10** | **FAIL** | `--fixture=table --block=u_edit_1_live_package_table_limitation` → `PARKED (NO document in this store renders a table on its page-edit surface (candidates tried: [".live-fixture/table/table","defects"] + up to 12 of rag.list_documents) …)`. `§16.11`'s ruling is explicit: `class-(b):table` *"MUST REJECT a `PARK`"*. (The candidate-list **head is the contracted literal** — `§16.2`'s ordering clause landed, corroborated by `I-5`.) |
| **E-11** | **NOT-TESTABLE-HERE** | `§7` |
| **E-12** | **NOT-TESTABLE-HERE** | `§7` |
| **E-13** | **PARTIAL** | pre-spawn limbs taken by `B-3` (exit `2`, nothing spawned, **no SET materialised** — `.live-fixture/` absent after the refusal); the refused runs print no `SCRATCH HOME` line at all (the mint sits below the refusals), which is evidence of absence, not a measurement |
| **E-14** | **REVIEW-ONLY** | a quotation rule, not an observable |
| **E-15** | **PASS** | `grep -rn live-drive package.json vitest.config.ts` → **`0`** occurrences ⇒ `scripts/live-drive.mjs` is in no trio leg |
| **F-1** | **PASS** | `UF_FIXTURE_STATE` members `= [id, kind, state]`, count **`3`**, all strings; **no root/path member** |
| **F-2** | **PASS** | values `'no fixture data set selected'` / `'none'` / `'none'` |
| **F-3** | **PASS** | live: `LAUNCH PROFILE: {"fixture":{"state":"mock data set core selected","kind":"mock-data-set","id":"core"}` (and `search`/`tabs`/`table`/`empty` likewise) |
| **F-4** | **PASS** | `"fixtureRoot":".live-fixture/core/"` on the launch profile **and** the summary, and the `FIXTURE STATE:` line prints `fixtureId=core fixtureRoot=.live-fixture/core/` — **printed text beside the state, not a member** (`F-1`/`F-5`) |
| **F-5** | **PASS** | the object has exactly the three contracted members (`F-1`) |
| **F-6** | **PASS** | the printed mock clause carries the non-quotability sentence **verbatim**: `CONSEQUENCE: the rows this run reports were driven against the mock data set core; a fixture-fed PASS may NOT be quoted as a live-corpus app reading` — and it is **derived/conditional**, naming the gated population (`35`) and the excluded engine family (`7 gnosis_*`) |
| **F-7** | **PASS** | the mock clause prints on the mock runs; no mock clause appears on any `none`-state refusal line |
| **F-8** | **FAIL** | the `--groups=` and `--fixture` refusal lines do carry the `none` triple; the **`main().catch` `ERROR:` line does not** — see `§5` `F-2`. (The ports site was not taken — `§7`.) |
| **F-9** | **FAIL** | same evidence: the `ERROR:` line of a post-assignment abort carries the **selected set's name** (`fixtureId=core`); `§16.5`/`§7.2`'s gate-2 note list that line among the sites that must print `none` and never the set's name |
| **F-10** | **PASS** | the `[live-drive] ERROR:` path **does** carry the fixture state — observed twice: the connect-timeout abort and the `S-2` materialisation abort, both with `fixture={"state":"mock data set <set> selected","kind":"mock-data-set","id":"<set>"} … §6.1 site 4` |
| **F-11** | **PASS** | pin: `state-derivation:from-argv-only` · `:one-assignment` · `:order-after-refusals` all **GREEN** |
| **F-12** | **PASS** | `"noSeed":true` on the launch profile, the ⟨§16.13⟩ clause printed on the same line, and the live line `FIXTURE PRECONDITION (LIVE READING … --no-seed: no seed was attempted this run)` |
| **F-13** | **PASS** | across `9` live runs the kind is `mock-data-set` **iff** the id is a set name, and `none` **iff** the id is `none`; no `mock-data-set` with `id: 'none'` observed |
| **F-14** | **PASS** | every observed state value is a set name or `none`; no obsolete mechanism (`seedCorpus`, `--strict-seed`, `--o0-corpus`, `o0MarkdownTree`, `.live-corpus`) appears in any state |
| **G-1** | **PASS** | `parkedByFixtureAbsence` is the landed member name (`7` occurrences; the superseded typo `parkedByAbsence`: **`0`**) |
| **G-2** | **PASS** | the printed field `parked-by-fixture-absence=` exists and is printed in the gate-observation sentence beside `parked-by-the-fixture-gate=` |
| **G-3** | **PASS** | the summary prints all three members together — `{"declared":35,"parked":1,"parkedByGate":0,"parkedByFixtureAbsence":1,"eligibleAndNotParked":34,…}` on the `search`/`tabs`/`table`/`core` runs — and the **chain holds non-trivially**: `0 ⊆ 1 ⊆ 1` |
| **G-4** | **PASS** | on those runs the park is counted in `parkedByFixtureAbsence` while `parkedByGate=0` ⇒ the park is **body-owned**, never the gate branch (the non-empty store makes the gate predicate false, exactly as `§16.5` rules) |
| **H-1** | **PASS** | `UF_FIXTURE_DECLARATION`: **`47`** entries; corroborated live by the driver's own `declared=47 · census-derived=47` |
| **H-2** | **PASS** | `corpusRead:false` = **`3`**, named exactly `stage_search_open_in_tab` · `stage_tabs_persist_roundtrip` · `user6_search_no_flicker` |
| **H-3** | **PASS** | `selfProvisioning:true` = **`9`** |
| **H-4** | **PASS** | gated = **`35`**; `47 − 3 − 9 = 35` **and** `31 + 3 + 1 = 35` both close |
| **H-5** | **PASS** | among the gated: `'corpus-documents'` **`31`** · `'corpus-query-results'` **`3`** · `'corpus-document-tabs'` **`1`** · `'self-provisioned-document'` **`0`** · `'none'` **`0`** |
| **H-6** | **PASS** | exactly `uf_panes_14` · `uf_tabs_7` · `uf_tabs_7_diag` |
| **H-7** | **PASS** | exactly `user9_search_open_in_tab` |
| **H-8** | **PASS** | `u_edit_1_live_package_table_limitation` reads `corpusRead:true`, `selfProvisioning:false`, `fixtureName:'corpus-documents'` ⇒ the `§16.1`/`§17.1` **column-move landed** |
| **H-9** | **FAIL** | measured **`7`** `stage_*` + **`5`** `o0_*` = **`12`** inside the `31` (remainder `19`), against the contract's `eight` / `8 + 5 = 13` / remainder `18` — see `§5` `F-4` |
| **H-10** | **PASS** | every declaration `fixtureName` lies in the closed five-name set; **no obsolete mechanism is a `fixtureName`** |
| **H-11** | **PASS** | the `'corpus-documents'` gated count = **`31`** (the enumeration's own count) |
| **H-12** | **PASS** | `stage_surface_census_i2r` **is** a declaration entry; `stage_multimount_reachability` and `stage_boot_landing_diag` are **not** (they are the two recorded-and-excluded ambiguity keys the live run prints) |
| **H-13** | **PASS** | **`13`** gated keys carry `rows: []` (⇒ `22` carry ids): UNIT A's re-read figure `13`, and `22 = UNIT A's 21 + the moved key`, exactly as `§11.3` item 5 says the route split must gain |
| **H-14** | **PASS** | pin: `TALLY declared 17 + 12 + 11 + 27 = 67 attempt(s); EXECUTED 57; class-(b) named NOT-RUN 10; seed 0x20261005; caps ≤ 100/row · ≤ 400 total · ≤ 8 rows`; the four `§4 P-IM-6/P-SM-5/P-TP-4/P-TP-5` describes exist; `RED SET … broken arm(s) 0`; `ARM TALLY 0 RED / 57 GREEN of 57 DISTINCT executed node-side arm(s)` |
| **H-15** | **PASS** | pin: `IDENTITY declaredLastTermOf === declaredClassB, read for all four rows: P-IM-6 0 === 0 · P-SM-5 0 === 0 · P-TP-4 0 === 0 · P-TP-5 10 === 10 — divergences: (none)` → the gate-3 amended spelling landed and **the carve-out is gone** |
| **H-16** | **PASS** | pin: register 1 `declared 7 rows, 101 attempts`, `seed 0x20260929`; UNIT A's register `declared 11 + 24 + 24 + 20 = 79 … seed 0x20261002` — both untouched |
| **I-1** | **PASS** | `git diff --numstat .gitignore` → `1	0` (exactly one **added** line, none removed): `.live-fixture/` under the standing `.live-corpus/` comment |
| **I-2** | **PASS** | `0` `UF_FIXTURE_DECLARATION` `surface` members contain `.live-corpus` |
| **I-3** | **FAIL as frozen** (contracted arm **PASSES**) | whole-file sweep: **`41`** occurrences of `.live-fixture/core/` (`38` outside comments) — but every one is followed by `alpha` (`18`), `beta` (`21`) or `alpha:p:N` (`2`), i.e. they are the **re-pinned identity literals** the contract *requires*; **`0`** occur on a line carrying a write/fs call, and the pin's `repin-completeness:self-provisioners` is **GREEN**. My frozen predicate ("zero occurrences") was **over-broad**: see `§5` `F-5` |
| **I-4** | **PASS** | `0` occurrences of the old **identity** family (`.live-corpus/alpha`, `.live-corpus/beta`, `.live-corpus/live4-first`, `.live-corpus/import1-fresh`, `.live-corpus/ms3-fresh`) — the re-pin is by direct substitution |
| **I-5** | **OBSERVED** | the `R-13` head literal `.live-fixture/table/table` occurs **`1`** time, and the live `table` run prints it as the candidate list's head — consistent with `§16.2`; the row is observational by its own terms |
| **I-6** | **OBSERVED** | `.live-corpus` survives as a route family (`10` raw / `2` outside comments / `1` inside a string literal) ⇒ the **obsolete route is still there**, which is what *"annotate, never extend"* requires; no verdict is graded |
| **K-1** | **PASS** | pin: `honesty-clause:no-proxy-pass` **GREEN** and `honesty-clause:mock-quote` **GREEN** (the arm `§9` clause 3 calls *"arms `R-mock`"*), with its named deletion mutation riding the same arm |
| **K-2** | **REVIEW-ONLY** | `§7` |
| **K-3** | **PASS** | `= E-15` |
| **K-4** | **PASS** | the non-quotability text is present in the `mock-data-set` clause and absent from the `none` lines (`F-6`/`F-7`) |

**Tally — `§4.1` carries `103` rows: the `100` frozen scenarios (`§2`) plus the `3` value-set rows
(`B-10`…`B-12`) added after the freeze and disclosed as such (`§6` `D-5`).**

| | PASS | FAIL | PARTIAL | NOT-TESTABLE-HERE | OBSERVED | REVIEW-ONLY | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **the `100` frozen rows** | **`77`** | **`9`** | `3` | `7` | `2` | `2` | `100` |
| *the `3` added rows* | `3` | `0` | `0` | `0` | `0` | `0` | `3` |
| **all `103`** | **`80`** | **`9`** | `3` | `7` | `2` | `2` | `103` |

**The nine `FAIL`s are `E-1` · `E-2` · `E-4` · `E-8` · `E-10` · `F-8` · `F-9` · `H-9` · `I-3`** — `§5`
dispositions every one, and **not one of them is smoothed into a pass**.

---

## 5. THE FAIL LEDGER (`9` rows, each with its doc-vs-behaviour reading)

**A FAIL here is a doc/spec drift OR an un-hardened regression, never a pass.** The nine are of **three
kinds** and each kind has a different owner: **(A) the unit's own acceptance predicates are falsified by
live runs** (`F-1`, `F-3`, and the `I-3` row-scope item); **(B) two contract clauses contradict each other
and the behaviour matches one of them** (`F-2`); **(C) a contract figure contradicts the contract's own
declared authority** (`F-4`).

**⟨GATE-7 PROOFREAD PASS `2026-10-05` (`RCA-8(c)`) — WHICH OF THE NINE `FAIL`s STILL STANDS AT THE LANDED HEAD, ONE LINE EACH, SO A FRESH READER DOES NOT ADJUDICATE THEM FROM THE LEDGER ALONE.** **CURED (the reading no longer reproduces at `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): `E-1` · `E-2` · `E-4` · `E-8` · `E-10` (`F-1` and `F-3` — both of them BEHAVIOUR findings whose subject the architect's ruling and the landing pass have since moved; each is marked at `§4.1` and at its own ledger entry below) and `F-8`/`F-9` (`F-2` — the two clauses were reconciled by the CONTRACT'S OWN gate-5 amendment `§21.1`, which adopts the behaviour's side: *the binding's order is the rule*).** **STILL STANDING: `F-4` (`H-9`, a DOC figure — the `stage_*` count; the contract's own authority is what decides it) and `F-5` (`I-3`, this artifact's own OVER-BROAD frozen predicate, NOT a defect of the contract or of the code — the contracted arm PASSES).** **NO `FAIL` OF THIS LEDGER IS DELETED, AND NOT ONE IS RE-READ AS A PASS: what moves is the READING'S STATUS at a LATER HEAD, never the reading.** **THE MOVEMENT'S `md5`/LINE-CENSUS MARKERS SIT AT `§4.1` (`F-1`, `E-10`) AND AT THIS LEDGER'S OWN `F-1`/`F-3` OPENING NOTES.**⟩**

### `F-1` — THE `F-2` DISCHARGE IS NOT EXHIBITED: BOTH RENDERED-FIXTURE PROBES READ ABSENT IN EVERY SET (`E-1` `E-2` `E-4` `E-8` `E-10`)

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THIS FINDING'S `rag.query` LIMB IS CURED AT THE LANDED HEAD; ITS `dom:` LIMB IS THE RULED SKIP.** **THE OLD READING (kept verbatim below, and it is a reading OF ITS OWN HEAD): `rag.query for the probe's own constant term -> 0 hit(s)` under EVERY set (`search`, `tabs`, `core`).** **THE CURRENT READING (`RECORDED READING` of the gate-6 battery's own live runs, re-read by this pass's file-read at the driver's root-text write and its print site; `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): the driver writes each imported document's authored text onto its ROOT node through `edit.set_content` AFTER the import (`[live-drive] FIXTURE ROOT TEXT: 3/3 imported document root(s) written with their own authored text through edit.set_content …`), so the probe's own constant term reaches the store's lexical index: `--fixture=core` reads `rag.query … -> 3 hit(s)`, `--fixture=tabs` reads `4 hit(s)`, and `--fixture=search` still reads `0 hit(s)` by construction (the `FA-1` falsifier's own set, whose documents carry no term).** **WHY: the parser authors every document ROOT with EMPTY content and the import reconciles the store's lexical index with its DOCUMENT ROOT ids ALONE, so without that write the term never reached the index — the mechanism this finding's candidate `(a)` named blind.** **SO `E-1`/`E-2`'s *"the probe reads identically under `core`"* limb and `E-4`/`E-8`'s collision (`§18.6` clause 1(iv)) are CURED — the cross-run falsifier now holds IN THE REQUIRED DIRECTION (`0` under `search`, `>= 1` under `tabs`).** **THE FINDING'S SECOND LIMB IS NOT CURED AND IS NOT RE-READ: the `dom:#tab-strip .tab[data-document-id]` probe reads `0 rendered row(s)` under every set BY CONSTRUCTION — the literal never exists in the app — and that limb is **`SKIPPED-BY-RULING`** (gate-5 `2026-10-05`, `§22.3`: `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`); **the `F-2`-closure claim may NOT be reported as discharged for it**, and the `0` is NOT evidence of the fixture's absence.** **AND THE DOC-SIDE HALF OF THIS FINDING STANDS TOO: `§18.1` clause 3's and `§18.2` clause 1's *"`core`/`table`/`search` leave a document tab open at launch"* is `SUPERSEDED` at those sites by the contract's own gate-5 ruling (`§22.1` item 6) — this pass does not re-open it.** **LAYER (`RCA-12`): the `hits` reading and the `FIXTURE ROOT TEXT` reading are FIXTURE-FED `[D]`/app readings taken against a NAMED mock set — NEVER a live-corpus reading, and never this unit's app claim.**⟩**

**The rows:** `E-1`, `E-2`, `E-4`, `E-8` (and `E-10`, separately below).

**The evidence, verbatim (three sets, three runs, isolated ports, boot-and-connect confirmed):**

| Run | Probe reading printed by the driver |
| --- | --- |
| `--fixture=search --block=uf_panes_14` (3971/9471) | `rag.query for the probe's own constant term -> **0 hit(s)**` → `PARKED … the declared fixture corpus-query-results reads ABSENT at this run` |
| `--fixture=tabs --block=uf_panes_14` (3972/9472) | `rag.query … -> **0 hit(s)**` → **same park, same reason** |
| `--fixture=core --block=uf_panes_14` (3973/9473) | `rag.query … -> **0 hit(s)**` → **same park, same reason** |
| `--fixture=core --block=uf_tabs_1,uf_panes_14` (3976/9476) | `uf_tabs_1` **PASSes** first, then `uf_panes_14` **still** parks with `0 hit(s)` |
| `--fixture=tabs --block=user9_search_open_in_tab` (3974/9474) | `dom:#tab-strip .tab[data-document-id] -> **0 rendered row(s)**` → park naming `corpus-document-tabs` |
| `--fixture=core --block=user9_search_open_in_tab` (3975/9475) | **`0 rendered row(s)`** → **the same park** |
| `--fixture=core --block=uf_tabs_1,user9_search_open_in_tab` (3977/9477) | `uf_tabs_1` reads `strip: **2 tabs** … exactlyOneActive=true` in that same run, **then** `user9` still reads `0 rendered row(s)` |

**What the contract requires and what is observed:**

- `§18.6` clause 3 (`FA-4`, `--fixture=core`): *"all read PRESENT — the second on the store query's `hits >= 1`, the third on the strip's `count >= 1` — **AND** `parkedByFixtureAbsence` is `0`. **FALSIFIED BY: any of the three reading absent (`FA-4` is the control that keeps `FA-1`/`FA-2` a DIVERGENCE and not a permanent absence)**"* → **two of the three read absent and `parkedByFixtureAbsence` is `1`**. The contract's own falsifier has fired.
- `§11.3` item 1 (`class-(b):core`): *"the `'corpus-documents'` and `'corpus-query-results'` and `'corpus-document-tabs'` probes all read PRESENT; no gated key parks"* → **two probes read absent; a gated key parks.** (`class-(b):core` is one of the `10×class-(b)` NOT-RUN terms the pin itself reports as **NOT-RUN**.)
- `§18.6` clause 1(iv)/`§18.2` clause 4 (`E-8`): the probe must read **differently** under `search` and `tabs`; observed: **identically** (`0` hits, `0` hits). `§18.6` clause 1(iv): *"AN OBSERVER WHO SEES BOTH RUNS READ ALIKE HAS SEEN THE COLLISION RETURN, NOT A PASS."*
- `§5.5`'s closing paragraph: *"The `F-2` discharge is therefore `p < pre` on the two RENDERED fixtures — FA-1 and FA-2 — and it is satisfied exactly when both can read absent at a non-empty store."* **The `p < pre` half is exhibited — but with no set for which `p === pre`, so what the run exhibits is a *permanent absence*, which is exactly what `FA-4` exists to rule out.**

**The confounds I tested and eliminated (so the finding is not an artifact of my instrument):**

1. **Scoping**: a scoped run makes the probed block the first block. Re-run as the **second** block, after another block had run and the app was fully up → **still `0 hit(s)`**.
2. **The store not carrying the fixture**: the import line prints before the park — `tabs`: `seeded mock fixture set "tabs" (4 file(s) from .live-fixture/tabs/) -> import {"ok":true,"documentIds":[".live-fixture/tabs/alpha",".live-fixture/tabs/beta",".live-fixture/tabs/gamma",".live-fixture/tabs/search"],…}`, and `search.md`'s bytes carry the term (`C-8`). So the term's document **is** in the store while the query for the term returns `0` hits.
3. **The tab strip genuinely being empty under `core`**: it is not — `uf_tabs_1`, in the *same run*, reads `strip: 2 tabs, every tab titled=true, exactlyOneActive=true` and the *document* tabs are the subject (`P-θ`). The probe reads `0` anyway.

**Doc or behaviour?** **Both, and the split matters:**

- **The BEHAVIOUR does not satisfy the contract.** Whatever the cause, the landed state exhibits no `F-2` discharge: the two probes are **inert in the absent direction for every set**, which is the very defect (`F-2`) this unit exists to close, re-expressed. Two candidate mechanisms are visible from the readings and neither is adjudicable blind (I did not read the driver): **(a)** the store-query limb's call or its reply extraction never yields a non-zero hit for the term in the assembled app (the term's documents are imported and indexed — `nodeCount:12, edgeCount:20`); **(b)** the DOM limb reads the strip at a point/root where it is not the strip a block's own body reads (`uf_tabs_1` proves the rows exist in the same app state). Both are **driver-side** questions for the unit's owner.
- **The DOC is also wrong, in the same direction as its own history**: `§18.1` clause 3 and `§18.2` clause 1 assert, as `VERIFIED-BY-READ` of the SOURCE, that *"`core`/`table`/`search` leave a document tab open at launch"* and that the store query *"depends on nothing the renderer has painted, opened or expanded"*. The first is **falsified by live measurement** — and the third gate-2 loop's whole closure (`§18.1`–`§18.6`) is built on it. The class-(b) readings that would have caught it are precisely the `10` terms the landing never ran (the pin reports them `NOT-RUN`).
- **The process reading (for the supervisor):** the contract's own rule is *"`RCA-11` clause (a) BINDS: this unit is NOT pre-DONE while its class-(b) battery is unrun — and if a run cannot be made, the DONE row carries the reading attached, never a silent park"*, and `§5.5`: *"A landed state in which either still rides `rag.list_documents` is `F-2` unclosed and this unit's DONE row may not claim it."* **On this reading the unit's DONE row may not claim the `F-2` closure, and the `10×class-(b)` terms remain NOT-RUN.**

**What I did NOT take, so the finding is not overstated:** the *whole-run* park sets (`FA-1`'s exact `{uf_panes_14, uf_tabs_7, uf_tabs_7_diag}` and `FA-2`'s exact `{user9_search_open_in_tab}`) — those need the full battery. The **probe-reading** limbs above, however, are readings of the probe itself, and `§5.3` clause 3 rules that a probe's reading does not depend on the run's block selection.

### `F-2` — `F-8`/`F-9` FAIL: THE `main().catch` `ERROR:` LINE PRINTS THE SELECTED SET, WHILE ONE CONTRACT CLAUSE SAYS EVERY EARLY SITE PRINTS `none` AND ANOTHER SAYS THAT PATH READS THE SAME BINDING

**The evidence:** `[live-drive] ERROR: Error: waitFor timed out after 60000ms fixture={"state":"mock data set core selected","kind":"mock-data-set","id":"core"} (the run-wide fixture state, §6.1 site 4 …)`. Reproduced on all five `--fixture=<set> --connect` runs and on the `S-2` abort.

**The contract at its two sites, verbatim:**

- `§7.2`'s gate-2 note: *"`print-site:early-paths` ASSERTS THE **`none` TRIPLE** AT EVERY EARLY SITE (`--groups=` · ports · `--home` · the `--fixture` refusal · **the `main().catch` ERROR line**) and NEVER the selected set's name; the set's name is asserted at `print-site:launch-profile` and `print-site:summary` ONLY"*; and `§16.5`: *"the state ON A REFUSAL LINE IS ALWAYS THE `none` TRIPLE … because the assignment sits after the refusal branches … and there is NO path on which a parsed `--fixture=` value has already reached the state when an OFFENCE is seen."*
- `§7.2` clause 4: *"THE LAUNCH PROFILE AND THE SUMMARY READ IT (sites 1/2), **and the `main().catch` path reads the same binding (site 4)**."*

**Reading:** the two clauses are only compatible if every `main().catch` throw happens **before** the assignment; a runtime error after the assignment — the ordinary case, and the one my abort produced — prints the **selected set**, as `§7.2` clause 4 requires and as `§16.5`'s absolute phrasing denies. **The DOC is the wrong side here** (the behaviour is coherent and is what clause 4 mandates), and the wrong-side text is the arm's *subject list*: as contracted, a `print-site:early-paths` arm that asserted the `none` triple at the `ERROR:` line would be **RED on any post-assignment abort** — i.e. an unsatisfiable arm of exactly the class the third gate-2 loop closed for `class-(b):tabs`. **Recommendation (supervisor/architect call): re-word `§7.2`'s gate-2 note and `§16.5` so the `main().catch` limb is *"the state as it stands at the throw"* — with `none` asserted only for throws reached before the assignment — and keep the `none`-triple tooth on the `--groups=`/ports/`--home`/`--fixture` refusal lines.** The pin's `print-site:early-paths` is GREEN while this reading holds, which is itself worth a look by the pin's owner (the arm evidently does not grade what the prose says it grades).

### `F-3` — `E-10` FAIL: THE `table` SET DOES NOT UNPARK THE ROW IT IS THE SET'S WHOLE REASON TO EXIST FOR

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THIS FINDING IS CURED AT THE LANDED HEAD.** **THE OLD READING (kept verbatim below, and it is a reading OF ITS OWN HEAD): the row PARKED under `--fixture=table`, *"NO document in this store renders a table on its page-edit surface"*.** **THE CURRENT READING (`RECORDED READING` of the gate-6 battery's live run at `--fixture=table --block=u_edit_1_live_package_table_limitation`, re-read by this pass at the set-content literal and at the battery record): the row now reads `verdict=PASS` with `rendered table census on the surface={"tables":1,"trs":1,"tds":4}` and `done: 1 blocks, 0 FAIL, 0 PARKED`.** **WHY: `parseMarkdown` DROPS a raw HTML block outright, so the raw-`<table>`-literal form the greens measured yields `census=0` and can only park; the set's `table.md` now carries the **GFM PIPE-TABLE** form the app's own import preserves (`:table:` · `:thead:` · `:th:` · `:tr:` · `:td:` nodes) — the raw literal is `SUPERSEDED` as the contracted form (gate-5 ruling `§22.2` item 3, `§22.4` item 3).** **SO THE DOC-SIDE HALF OF THIS FINDING HAS ALSO MOVED AND IS ALREADY MARKED AT ITS OWN SITES: `§2.2` P-β's raw-`<table>` reading, `§2.1` `F-2`'s cell, `§16.11`'s acceptance predicate (`class-(b):table` MUST REJECT a `PARK` — UNCHANGED and now satisfied) and this artifact's own `C-3` row, whose frozen predicate (`table.md` carries a **stored `<table>`**) is `SUPERSEDED` by the parser-mediated form and is annotated at `§4.1`.** **THE FINDING'S LAST OPEN PIECE IS THE CONTRACT'S OWN, NOT THIS PASS'S: `§16.11` accepts `PASS` OR `FAIL`, and *what a post-adaptation `FAIL` means for the row's namesake app limitation* is a question the ruling left open (`§22.6` clause 1(c)).** **LAYER (`RCA-12`): the verdict and the census are APP/assembled readings driven against the `table` mock set — quotable ONLY as readings against that set, NEVER as a live-corpus reading, and the `<table>`-render capability itself is app-layer and is NOT this unit's claim (`§1.3`).**⟩**

**Evidence:** `--fixture=table --block=u_edit_1_live_package_table_limitation` (3978/9478, boot-and-connect confirmed):
`PARK  u_edit_1_live_package_table_limitation PARKED (NO document in this store renders a table on its page-edit surface (candidates tried: [".live-fixture/table/table","defects"] + up to 12 of rag.list_documents) — the row's precondition cannot be met in this corpus …)`.

**Contract:** `§2.1` `F-2` (*"This is `OB-1`'s first named requirement"*), `§2.2` P-β, and `§16.11`: *"`class-(b):table` MUST ACCEPT a verdict of `PASS` or `FAIL` carrying evidence that NAMES the found document and its rendered table census, and **MUST REJECT a `PARK`**."*

**Reading:** **behaviour, not doc.** The fixture/candidate wiring landed exactly as contracted (the candidate head **is** `.live-fixture/table/table`, `I-5`, and `table.md` **does** carry a stored `<table>`, `C-3`) — the failure is that the imported document **does not render a table on the page-edit surface**. That is the app-layer condition the row is *named after* (`u_edit_1_live_package_table_limitation`), so this may be the known package limitation itself rather than a fixture defect; but the contract's claim that the set makes the row **drivable and unparked** is falsified, and the row's own `E-10` acceptance predicate is not met. **Owner: the unit's landing pass (the row's park/verdict split, `§16.1`'s stated consequence) — and the finding is the reading the `class-(b):table` term exists to produce.** *(Layer note: the park itself is a driver reading; whether the app should render a stored `<table>` is app-layer and is NOT this unit's claim — `§1.3`.)*

### `F-4` — `H-9` FAIL: THE `eight` `stage_*` FIGURE CONTRADICTS THE CONTRACT'S OWN DECLARED AUTHORITY

**Evidence (two independent instruments, same answer):**
- the landed `UF_FIXTURE_DECLARATION` gives, among the `31` gated `'corpus-documents'` keys: `stage_*` = **`7`** (`stage_async_mount_race_v1` · `stage_doc_surface_precondition_diag` · `stage_docnav_switch_inside_async` · `stage_document_tab_paints_its_document` · `stage_foreign_rederive_v2` · `stage_refresh_survival_v5` · `stage_surface_census_i2r`) and `o0_*` = **`5`** ⇒ `7 + 5 = 12`, remainder `19`;
- `§16.17` item 2's own enumeration (the list `§16.10` and `§20.2` call **THE AUTHORITY**, and which `§20.2` says *"IS the authority over the stale figure"*) prints **`7`** `stage_*` names and `5` `o0_*` names — the same `12`.

**The contradicting contract text:** `§5.2`'s population cell, corrected in place by `§17.2` to *"the authority names **`eight`**: … the eighth is `stage_refresh_survival_v5`"*, and `§20.2` clause 2: *"`stage_*` **`8`** (its own bracketed note, `§17.2`) + `o0_*` **`5`** = **`13`**, leaving **`18`** entries in the remainder."*

**Reading:** **the DOC is wrong**, by the contract's own precedence rule. The figure the amendment calls the authority counts to `7`, and so does the landed declaration; the `eight` and the `8 + 5 = 13` / remainder `18` decomposition cannot be reproduced from either. *(The `13` figure itself survives only in its other sense — `21 ROW + 13 DIAG`, `H-13`, which I verified as `13`.)* **The `31` total, the `35` population, the register and every other figure are unmoved and verified.** Owner: the spec-owning pass (a one-figure correction beside `§5.2`/`§17.2`/`§20.2`).

### `F-5` — `I-3` FAILED **AS I FROZE IT**, AND THE FINDING IS ABOUT MY ROW, NOT THE CONTRACT OR THE CODE

**My frozen predicate was over-broad.** I froze *"a literal sweep of the driver for the `.live-fixture/core/` hardcoded literal → zero occurrences"*. Measured: `41` occurrences (`38` outside comments). **Every one of them is followed by `alpha`, `beta`, or `alpha:p:N`** — i.e. they are the **re-pinned identity literals** `§2.4`'s table *requires* the driver to carry (`.live-fixture/core/alpha`, `.live-fixture/core/beta`, `.live-fixture/core/alpha:p:1`) — and **`0`** occur on a line carrying a write/fs call.

**The contracted arm is narrower and it PASSES:** `§10.2.3`'s `repin-completeness:self-provisioners` asserts *"NO `.live-fixture/core/` LITERAL **survives in a self-provisioning block's write path** — the write path is the resolver's output"*; measured: `0` write-path occurrences, and the pin's `repin-completeness:self-provisioners` is **GREEN**. **Recorded as a greens-set row-scope defect on my side** (the lesson: a whole-file sweep cannot grade a write-path clause, because the re-pin targets share the needle's prefix) — **not** a doc drift and **not** a regression.

---

## 6. THE DOCUMENTATION FINDINGS (drift, contradiction and gaps — recorded, not filled from the code)

| # | Finding | Site | Kind |
| --- | --- | --- | --- |
| **`D-1`** | **Two clauses of the same file contradict each other about the `main().catch` site** (`§7.2` clause 4 *"the catch path reads the same binding"* vs `§7.2`'s gate-2 note / `§16.5` *"every early site prints the `none` triple … and never the selected set's name"*). The live reading matches clause 4. Full evidence and recommendation at `§5` `F-2`. | `§7.2` · `§16.5` · `§10.2.3` `print-site:early-paths` | **contract-internal contradiction (the DOC is the wrong side)** |
| **`D-2`** | **The two-supply refusal names the flag FAMILY, not the single offending flag.** `§6.4` contracts *"one named `ARG-REFUSED` line **stating both values**"*; the landed line names the set and then prints the whole list `(--seed= / --corpus-root= / --strict-seed / --o0-corpus=)`. A reader of `--fixture=core --seed=…`'s artifact cannot see from the line **which** flag it carried. **Non-failing observation** (the predicate "names the set and `--seed=`" is satisfied literally), recorded because it weakens attribution — the very thing the clause exists for. **⟨GATE-7 PROOFREAD PASS `2026-10-05` — RECORDED AS A DEFECT AND CLOSED: the greens' own `D-2` was escalated by the gate-5 amendment to a NAMED REQUIREMENT (`§21.2`: the offending flag must be named, not only its family), and the landed driver now names each supplied flag BY ITS OWN NAME with the family list standing BESIDE the name (`md5 1b7d9cd8e644525d0b1de354c881ff2b`, 9681 lines) — the reading is recorded at `§4.1`'s `B-1` row. THIS CATCH IS THEREFORE A CLOSED HISTORY: the finding was right when taken and its requirement is now met.**⟩** | `§6.4`, `§3.3` clause 1 | observation (doc wording vs line specificity) — **NOW CURED** |
| **`D-3`** | **The `eight` `stage_*` figure** — `§5.2`/`§17.2`/`§20.2` clause 2 against the contract's own authority. Full evidence at `§5` `F-4`. | `§5.2` · `§17.2` · `§20.2` clause 2 | **doc figure wrong by its own precedence rule** |
| **`D-4`** | **The contract names no symbol for the fixture DATA, so a blind reader cannot derive the set-content rows from the docs alone.** `§2.3` clause 3 says the content is *"pure string data in `scripts/live-drive.mjs`"* but names no literal/identifier (unlike `UF_FIXTURE_DECLARATION`, `UF_DECLARED_FIXTURE_PROBES`, `UF_FIXTURE_STATE`, all named in the text). `§13.3` item 2/7(c) defers the **term's literal** but not the **data symbol or its shape**. I took `C-1`…`C-8` from the **materialised files** (an allowed observable) and cross-checked them with a data-region extractor; a future blind reader should not have to. | `§2.3` clause 3 · `§13.3` item 2 | **documentation gap** |
| **`D-5`** | **Three value-set rows (`B-10`…`B-12`) were added by me after the freeze.** The frozen `§3` never carried a "each of the five names is an accepted value" row, though `§3.2`'s closed set is contract; I ran them during the pass and state their predicate from `§3.2` rather than pretending they were frozen. (Their result: PASS.) | this artifact, `§2.2` | **greens-set scope disclosure** |
| **`D-6`** | **The class-(b) terms are NOT-RUN in the landed register, and the contract's `RCA-11` clause (a) rule makes that a pre-DONE blocker.** The pin prints `class-(b) named NOT-RUN 10` for `P-TP-5` and `NOT-RUN 10` again for `P-TP-3` (UNIT A's), i.e. every live reading this unit owes is declared, counted, and **unrun** — while `§11.3`'s closing rule forbids reporting the unit complete on parked class-(b). My `F-1` adds a reading to that pile, not a park. | `§11.3` (closing rule) · `§10.2.3` `10×class-(b)` · `§11.4` `RCA-11` | **process finding (owner: the supervisor's DONE-row gate)** |
| **`D-7`** | **`§9` clause 3's citation `R-none`/`R-mock`** is already recorded as wrong at `§16.14` (UNIT A carries the rule as prose, and its `§7` clause 4 does spell `R-none`/`R-mock` as *rule names*, not row ids). Nothing new — noted so a reader does not re-litigate it. | `§9` clause 3 · `§16.14` | superseded-beside (confirmed) |
| **`D-8`** | **`§5.5`'s *"`p < pre` … is satisfied exactly when both can read absent at a non-empty store"* is exhibited, but with no set for which `p === pre`** — so the clause's own control (`FA-4`) is what falsifies the claim. This is `F-1` restated at the clause; recorded so the wording is fixed together with `§18.1` clause 3 / `§18.2` clause 1's launch-state premises. **⟨GATE-7 PROOFREAD PASS `2026-10-05` — HALF CURED, HALF SKIPPED, AND THE SPLIT IS THE ARCHITECT'S: the clause's `'corpus-query-results'` reading is now exhibited (`core` `3 hit(s)`, `tabs` `4 hit(s)`, `search` `0` — so `p === pre` exists under `core`/`tabs` and `p < pre` under `search`), while its `'corpus-document-tabs'` limb is `SKIPPED-BY-RULING` and may NOT be reported as discharged (`§22.2` item 2, `§22.3`). The `§18.1` clause 3 / `§18.2` clause 1 premise this row names remains `SUPERSEDED` at those sites by the contract's own gate-5 ruling (`§22.1` item 6) — this pass does not re-open it.**⟩** | `§5.5` · `§18.1` clause 3 · `§18.2` clause 1 | doc premise falsified by live measurement |

---

## 7. THE NOT-TESTABLE LEDGER (each row's reason — a row I could not run is **never** a pass)

| Row | The reason it is `NOT-TESTABLE-HERE` |
| --- | --- |
| **A-9** (bare `--fixture` is not parsed at all) | Proving a *negative* parse limb needs a run that proceeds past the refusals, i.e. a boot whose no-flag behaviour is the very thing at issue; no pre-spawn instrument separates "not parsed" from "parsed and ignored", and I did not spend a live run on it. |
| **B-7** (`--fixture=core` **alone** proceeds) | "Proceeds" means a launch; the only way to exhibit it is a live run (taken for other sets, but a bare `core` run's purpose here would be to show the absence of a refusal, and a *boot* is not a refusal-shaped instrument). The complementary limbs **are** taken (`A-8` identical repeat, `B-6` `--no-seed`, `B-1`…`B-5` refusals). |
| **B-9** (`S-4`'s full `empty` reading) | `S-4`'s observable is *"every gated key's own fixture probe reads absent, every gated key parks by name, and NOT ONE reports `FAIL`"* over the `35` — that is the full battery (`§11.3` item 5), not a scoped run. Its **state/materialisation** limbs are taken (`C-6`, the `empty` launch line: *"the set carries NO file … (`no SET was materialised`)"*). |
| **E-7** (`tabs` leaves no document tab open at the pre-gesture point) | The only instrument that could read it is the strip probe, **and that probe reads `0` rendered rows in every set — including the runs in which the same app demonstrably renders `2` document tabs**. The instrument is therefore blind on this question, which is `F-1`'s finding, not a pass. |
| **E-9** (`--fixture=empty`'s full park battery) | `§11.3` item 5 needs a full `35`-key run; not taken. |
| **E-11** (obsolete-route-only run keeps `none` with a non-empty store) | Needs a full `--strict-seed`-shaped live run; **I chose not to spend one** (budget), and I say so rather than parking it silently. |
| **E-12** (the no-`--fixture` run's launch profile unmoved) | Same: a full default run; not taken. Its **state** limb is taken by `A-10`. |
| **K-2 / E-14** (the non-quotability **rule**) | A rule about how readings may be quoted, not an observable; it is discharged by *how this artifact is worded* (every reading states its fixture, `§8`), never by a run. |
| — | **Also not taken, and stated so the layer is not over-claimed:** the *whole-run* park sets of `FA-1`/`FA-2`/`FA-3`; the `ports` and `--home` early print sites; the `S-5` (`--connect` + a **running** app) reading; the `S-3` (`isError` on import) reading; `class-(b):core` as a completed full-battery reading; and every app-layer row. |

---

## 8. THE LAYER LEDGER — WHAT THIS GREENS SET DOES **NOT** PROVE

**Read this as the price of every `PASS` above.**

| Layer | Taken here? | What it can and cannot support |
| --- | --- | --- |
| **`[T]`-class source derivation** (`NODE SUITE`, data-region extraction, literal sweeps, the file system) | **YES** — `D-*`, `H-*`, `I-*`, `K-1`, `F-1`, `F-2`, `F-5`, `F-11`, `G-1`, `G-2`, `E-15`, `C-10` | Proves the driver's **declared data and text**: the arg's closed set and refusals, the sets' file lists and content properties, the three sentinel literals and their typing, the census figures, the register's arithmetic/identity/seed, the `.gitignore` line, the pin's `123 passed (123)`. **It proves nothing about a running app.** |
| **`HARNESS [D]` / pre-spawn process** (the driver's own refusal and abort paths) | **YES** — `A-*`, `B-1`…`B-6`, `B-8`, `B-10`…`B-12`, `F-8`/`F-9`'s refusal limbs | Proves the **refusal contract end to end** (marker, value verbatim, accepted names, the `none` triple, exit `2`, nothing spawned, nothing written) and `S-2`'s named-abort contract — **before any app exists**. |
| **`HARNESS [D]` / live-process, boot-and-connect confirmed, SCOPED** (my `9` runs) | **YES** | Proves the **materialisation + import + identity scheme + declaration at the post-assignment sites + the derived consequence + the implied `--no-seed` + the gate observation's printed members** — against a real, assembled Electron app. **SCOPED runs are not coverage readings** (`the run prints that itself`), and **none of these is the class-(b) battery**: the battery requires *the full run per set* (`§11.3`: *"one run per set"*), and I ran **one block** (or two) per run. |
| **`class-(b)` — the ten live readings the landing owes** | **NO (4 partial, 6 not taken)** | The `10×class-(b)` terms are still **NOT-RUN** as the pin itself reports. My partial readings are enough to **falsify `FA-4`'s control** and `E-2`'s run limb; they are **not** a battery result, and I do not present them as one. |
| **App layer (assembled renderer / `src/**`)** | **touched only as the driver's own verdicts** | This unit denies `src/**` entirely. Where a run printed an app verdict (e.g. `uf_tabs_1` **PASS** under `--fixture=core`, with real hit-tested gestures), that reading is **an app-layer reading driven against the `core` mock set** — quotable **only** as a reading against that set and **never** as a live-corpus app reading (`§9` clause 3), and **never** a claim of this unit. |
| **The trio** | **`npm test` / `typecheck` NOT run; the pin run; `build` ran only as the launcher's side effect** | `scripts/live-drive.mjs` is in **no** trio leg (`E-15`/`K-3`), so **even a fully green trio would prove nothing about the driver** (`§9` clause 6). |

**The three things this artifact may be quoted for, and nothing more:**

1. **The fixture MACHINERY is largely landed and honest at the head I read**: five hand-authored sets materialise
   and import under `.live-fixture/<set>/` with the contracted identities; the arg refuses by name on all four
   contracted fail-states plus the four supply-flag combinations with exit `2` and nothing written; the registry's
   three sentinels are the contracted literals with the contracted types and the single `'dom:'` form; the run
   declares its fixture at its print sites with the three-member state, the materialisation root as printed text,
   the derived conditional consequence and the non-quotability sentence; the censuses read `47` / `3` / `9` /
   `35` / `31 + 3 + 1`; the third register is landed, green, and its `P-TP-5` spelling is the amended one with the
   identity tooth biting all four rows with no carve-out.
2. **The unit's live deliverable is NOT discharged**: the divergent-probe falsifier is falsified in its
   **control** direction, and the `table` set does not unpark the row it exists for.
3. **Nothing about the app**, and **no `F-2` closure**, may be claimed from anything above.
