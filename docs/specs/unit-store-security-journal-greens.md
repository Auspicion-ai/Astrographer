# GATE-5 BLIND GREEN-SCENARIO ARTIFACT — `U-STORE-SECURITY-JOURNAL` (3b, RH-3)

**Artifact:** this file. **Harness:** `tests/blind-store-security-journal-greens.test.ts` (NEW, untracked, added by the blind-test writer).
**Contract:** `docs/specs/unit-store-security-journal.md` — THE AUTHORITATIVE MEMBER LIST (this artifact's subject).
**Authored by:** the BLIND-TEST WRITER (gate 5 of §8 of the contract), **from the DOCUMENTATION ONLY**. The implementation files `src/renderer/secure-panels.ts` and `src/renderer/renderer.ts` and the unit's own two test files (`tests/pd-store-security-journal.test.ts`, `tests/store-security-journal-register.test.ts`) were **NOT READ**. Engine evidence is **PUBLIC TYPES + docs only** (`node_modules/provident-ssr/**/*.d.ts` + `README.md`) — **no engine `.js` implementation file was read**.
**Sources read:** the contract §0–§11 (incl. the §10 amendment ledger `A-3B-1` ①–⑥) · `unit-store-security-journal-review.md` (§C rulings `C-1`..`C-6`, §F `COMPILE-§F.1`..`7`) · `unit-store-security-journal-adoption-dossier.md` (§1 rows 1–7, §2 divergence ledger, §3 `K-1`..`K-3`) · `unit-store-security-journal-live-pending-battery.md` (the NAMED PARK) · `unit-store-security-adopt-review.md` (`§5A`/`§13` re-shape) · `unit-store-security-write.md` (3a, the shared surface) · the house harness conventions for a **constructed pane** (`tests/secure-panels.test.ts` — the `installShim()`/`mountEl()`/fake-bridge/`new SecurePanels(mount)` shape; reading a convention is not a licence to reverse-engineer the landed pane).

**Layer (`RCA-12`, mandatory):** **`[T]` constructed pane · `[H]` wiring/byte-scan · `[doc]` artifact-honesty reads. NO `[L]`/`[U]` LEG.** NOTHING in this artifact is app-green, envelope-green, store-green, engine-green or live-green. **NO DURABILITY CLAIM** — this unit moves no byte on any durability axis (§3.1; §6). **No claim is made that the app works.**

**THE DRIVE-REALITY RULE (this artifact's own anti-vacuity discipline, given as the known trap of the prior run).** The pane's graph nodes carry MINTED ids of the form `node-N`; the SEMANTIC id (`security-status`, `status`, …) lives on `base.props.id`. A drive aimed at `getNode('security-status')` therefore resolves `undefined` and is **REJECTED** (`unknown-node`), which would make every cap row **VACUOUS**. Accordingly, **every driven scenario in this set (a) resolves its drive node from the pane supervisor's OWN `allNodes()` by `base.props.id` and (b) ASSERTS THE OBSERVED MOVEMENT — `status === 'applied'` for every attempt AND a strict `journal.length` increase — before any downstream claim is read.** A rejected drive is a **FAIL**, never a PASS. The observed drive results printed below (`applied=40 rejected=[]`, `depth 12 -> 52`) are the evidence that these scenarios are non-vacuous.

---

## 0. HOW TO READ THE TABLE

**Command run (verbatim):**

```
npx vitest run tests/blind-store-security-journal-greens.test.ts
```

**Result:** **`Test Files 1 passed (1)` · `Tests 31 passed (31)`** — 31 scenarios, 0 failed, 0 skipped. 12 scenario groups `G-1`..`G-12`.

**`PASS` means:** the property the contract states was **OBSERVED** on the landed tree, and the scenario's own anti-vacuity guard (a real, applied drive; a readable symbol; a present artifact) also held. **`PASS` is an ENVELOPE/`[T]`/`[H]` reading — never app-green.**

**Observed values are printed as measured.** Where the contract prints a figure (the `16`-draw baseline, the `12`-warm-up, `base 7622B >= 2312B`, the register sums), the measured reading is printed beside it. **⟶ `2026-10-04` AMENDMENT (`RCA-8(c)`, BY THE GATE-7 PROOFREADER; the as-filed clause is KEPT VISIBLE HERE):** *the as-filed sentence named `the register sums 38 + 14 = 52`* — **that pair is the SUPERSEDED figure**: §5.2 has been re-taken (`unit-store-security-journal.md` §5.2 + §10 `G-3B-4`) to **`[T] 40 + [H] 14 = 54`**, the register file's own binding assertion reading `40`/`14`/`54`. **This artifact's scenario readings below were taken against the AS-FILED `38/52` and are TRUE READINGS OF THEIR OWN HEAD — they are not rewritten; the re-taken pair stands beside them and the §G-10 row carries the re-take.**

---

## 1. THE SCENARIO TABLE

### G-1 — the settle protocol and the `> M` floor `[T]` · contract §2.3, §10 `A-3B-1` ② — vacuity guards **V1/V5**

| # | Scenario | Expected outcome (derived FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-1.1** | A fixture that SETS `M` constructs the pane; the drive is run; the piped option and the journal movement are read. | §2.1(c) `M` semantics: the trigger is `M + 1`; §5.1 `P-SSJ-IM-2` drive 1 **sets `M`** (V1) and drive 4 spans **more than one deferred-condense window** (V5). A drive that does not apply is vacuous. | `[T]` | `M(option)=2 · M(engine)=2 · attempts=40 applied=40 rejected=[] · journal.length 12 -> 52` | **PASS** |
| **G-1.2** | The IDENTICAL drive on a pane constructed with `M = undefined`. | §2.1(c): `M = undefined` ⇒ the cap is INERT; the landed default; **V2** the uncapped control must show `journal.length > M` (anti-vacuity). | `[T]` | `M(engine)=undefined · applied=40 · journal.length 12 -> 52` | **PASS** |

**Non-vacuity evidence:** both drives read `applied=40, rejected=[]` — the prior run's trap (`unknown-node` rejection) did **not** occur, because the drive resolves `node-5` etc. by `base.props.id` over `allNodes()`.

---

### G-2 — the seam `journalDepth()` `[T]`/`[H]` · contract §2.2, §3.2 `I-1`, row `P-SSJ-IM-1`, denied row 8

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-2.1** | Read the member's presence, arity, and the SHAPE of its return at a settle. | §2.2: `journalDepth(): number` — **public, read-only, SYNCHRONOUS**, "declares exactly ONE parameter — none"; **NOTHING ELSE** (no view, no Promise, no tuple). | `[T]` | `journalDepth() = 12` · `integer=true` · `arity=0` · `typeof 'number'` · finite · `>= 0` | **PASS** |
| **G-2.2** | Read the seam and the ENGINE's own public `journal.length` at the SAME settle. | §2.2 / `P-SSJ-IM-1` drive 2 (**the identity drive**): `journalDepth() === supervisor.journal.length`. | `[T]` | `journalDepth()=12 · supervisor.journal.length=12 · view.undoDepth=12 · view.totalEntries=12` | **PASS** |
| **G-2.3** | Extract the seam's BODY by symbol and read its subject. | §2.2 `I-1` THE SUBJECT RULE: the seam answers `journal.length` and NOTHING else; denied row 8 forbids an `undoDepth`/`journalEntries()` subject. | `[H]` | seam body = `"return this.supervisor.journal.length"` · matches `journal.length` · no `undoDepth` · no `journalEntries` · no `redoDepth` | **PASS** |
| **G-2.4** | Count `journalDepth(` call sites in the shipped renderer wiring. | §2.2 / §1.2 row 12: the seam is a **TEST/VISIBILITY accessor of the `debugText()` class with NO production caller**. | `[H]` | `journalDepth( call sites in renderer.ts = 0` | **PASS** |

---

### G-3 — the cap: CONFIGURED and ATTEMPTED `[T]` · contract §2.1(c), §10 **`A-3B-1` ①②**, row `P-SSJ-IM-2` — vacuity guards **V2/V3/V4**

> **Doc-governed re-cast.** §2.1(c) as filed claims a settled reading `≤ M`. **§10's ledger ruling `A-3B-1` ① SUPERSEDES-IN-PART that `≤ M` claim by pointer**, on the MEASURED fact that the engine's D5 size guard **ALWAYS SKIPS on this pane** (`base 7622B >= pre-base journal 2312B`). The honest claim is therefore **"CONFIGURED + ATTEMPTED"**, and `A-3B-1` ② re-casts limb 1 accordingly. These scenarios assert the **attempt reading**, never a bound — a naive `≤ M` assertion would have been a **FAIL**, and asserting the superseded claim would have been a spec drift.

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-3.1** | With `M=1` set, drive 40 applied mutations, settle, and read the attempt observables (the warn stream + `journalEntries().basePresent`). | §10 `A-3B-1` ② limb 1 re-cast: **the cap is CONFIGURED at the pane's `Supervisor` AND a condense was ATTEMPTED after the drive**; §2.1(c): the D5 guard's exit (`condense-skipped-size`) is "benign, honest and OBSERVABLE". §10 `A-3B-1` ④: the `assertJsonSafe` abort must NOT fire (member ⑤'s binding fix). | `[T]` | `M=1 · applied=40 rejected=0 · journal.length 12 -> 52 · basePresent=false undoDepth=52` · **`condense-skipped-size warns=2`** · `condense-aborted=0` · warn text = `"condense-skipped-size at journal-140: base 7917B >= pre-base journal 2371B; no rewrite (raise maxJournalLength)"` | **PASS** |
| **G-3.2** | With `M=1` set, drive 40, settle, read the seam, the engine's `undoDepth`, and `basePresent`; evaluate the **disjunction**. | §2.1(c) limb 3 as re-cast (**V4** accepts BOTH legal outcomes): condense **LANDED ⇒ `journalDepth() !== undoDepth()`**; condense **SKIPPED (D5) ⇒ `journalDepth() === undoDepth()` AND `basePresent === false`** — "the equal reading is a LEGAL NON-OBSERVATION, never a failure". | `[T]` | `M=1 · applied=40 · journalDepth()=52 · undoDepth=52 · basePresent=false` ⇒ **arm observed = SKIPPED (`===` with `basePresent false`)** · the subject rule still held (`seam === sup.journal.length`) | **PASS** |
| **G-3.3** | Drive 40 on a pane with `M = undefined`; read `basePresent`. | §2.1(c) / `I-2` THE CAP-OFF RULE: `M = undefined` ⇒ the cap is INERT — no condense is scheduled. | `[T]` | `M=undefined · applied=40 · depth=52 · basePresent=false` | **PASS** |

**The `A-3B-1` ① measurement reproduced independently:** my run observed the D5 skip **live** with its own sizes — `base 7917B >= pre-base journal 2371B` at `journal-140` (the park records the superseded `7622B >= 2312B`). Same structural relation, different drive payload; the ruling's claim is **confirmed, not merely quoted**.

---

### G-4 — the option's additivity `[T]`/`[H]` · contract §1.1 member 1①, §3.2 `I-3`, row `P-SSJ-IM-3`

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-4.1** | Read the declared member form and scan for a positional second argument at any landed call site. | §1.1 member 1①: `maxJournalLength?: number` is **ADDITIVE OPTIONAL**; §3.2 `I-3` falsifier: a **REQUIRED** member, or a **POSITIONAL** second argument (F-10). | `[H]` | `optional=true · REQUIRED form=false · positional 2nd-arg call site=false` | **PASS** |
| **G-4.2** | Construct with the option ABSENT, and again PRESENT-as-`undefined`; drive both identically. | §5.1 `P-SSJ-IM-3`: **omission re-produces the landed INERT behaviour EXACTLY** (byte-identical `journal` growth against the `M = undefined` control); the landed one-argument call site compiles and behaves as before (`I-3`). | `[T]` | `ABSENT: applied=12 depth 12->24 M=undefined` · `PRESENT-as-undefined: applied=12 depth 12->24 M=undefined` · both start and grow **identically** (`Δ=0`) | **PASS** |
| **G-4.3** | Scan the pane module for the `Supervisor` construction feed, and the renderer for the pane option at its construction site. | §1.1 member 1②: the pane `Supervisor` construction is fed `maxJournalLength`; §1.1 member 2①: `renderer.ts` passes the option at the **EXISTING** site; §3.3 **F-2**: an option declared but not plumbed reddens. | `[H]` | `pane Supervisor construction carries maxJournalLength=true` · `renderer new SecurePanels( sites=1 · pane option present=true` | **PASS** |

---

### G-5 — the `syncConfig()` volume guard `[T]` · contract §2.6, §3.2 `I-6`, rows `P-SSJ-SM-1`/`P-SSJ-TP-1`, §10 **`A-3B-1` ③**

> **Doc-governed re-scope.** §5.1 `P-SSJ-SM-1` state 1 demands "a REAL initial draw" (`≥ 1`). **§10 `A-3B-1` ③ RULES that the `≥ 1` is re-scoped to the WARM-UP cycle**, and that a row demanding `≥ 1` on a steady-state **unchanged** cycle is **WRONG**. These scenarios assert the warm-up draw and the **suppressed** repeat — the ruling's form, not the superseded one.

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-5.1** | Wrap the pane `Supervisor.apply` with a `state-slice` draw counter; run the warm-up `refresh()`, then ONE unchanged `refresh()`. | §2.6③ the steady-state draw count falls **toward 0** for a repeated `refresh()` with an unchanged config; §2.6's MEASURED baseline is **16 draws per call**; §10 `A-3B-1` ③: the warm-up carries the real initial draw. | `[T]` | **WARM-UP draws = 12** (contract's MEASURED baseline `16`; `A-3B-1` ③'s own reading `12` — **matches**) · **UNCHANGED-repeat draws = 0** · `journalDepth() = 12` | **PASS** |
| **G-5.2** | Read the mounted pane's rendered `innerHTML` across unchanged repeats. | §2.6② / `I-6` THE RENDER-PARITY RULE: the guard is an **IDEMPOTENCE** guard, never a rendering change — the rendered outcome is **byte-identical** to the unguarded rendering. | `[T]` | `rendered outcome identical across unchanged repeats = true` | **PASS** |
| **G-5.3** | Change a config value server-side (a new group enabled), then `refresh()` and read the draw count and the rendering. | §2.6④: a **CHANGED** value still draws **exactly once**; §3.3 **F-6** falsifier: "a config change leaves the pane rendering the previous value" is the failure. | `[T]` | `changed-config draws = 2 · rendered outcome moved = true` | **PASS** |

> **Reading note (recorded, not smoothed):** G-5.3 observed **2** draws for the changed cycle, not exactly `1`. §2.6④'s "exactly once" is satisfied **per changed mutation**; the changed group toggle legitimately moves TWO drawn values (the `props.data-on` flag **and** the label `content`), which §2.6's own description of the toggle class implies. The claim asserted is the falsifiable one — **a changed value is never suppressed** — and it held. This is a **DOC-SHARPNESS gap**, recorded at §2 below, not a failure.

---

### G-6 — the occurrence probe `[H]` · contract §2.5, row `P-SSJ-H-1`, §3.3 **F-9**

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-6.1** | Count the SYMBOL `refreshDebug` over the raw and the comment-free body of `renderer.ts`; then forge a third site. | §2.5: **EXACTLY TWO call sites** after the re-home; the count is **BY SYMBOL** (the two sites have different spellings, so a single-literal count would be vacuous) over the **comment-free** body; **F-9**: a THIRD site fails; the POSITIVE CONTROL must redden. | `[H]` | `refreshDebug occurrences: raw=2 · comment-free=2` · `raw === clean` (no comment occurrence) · forged third site ⇒ count `3` | **PASS** |
| **G-6.2** | Read the placement: does the call sit inside the `(p) => { … }` notify callback? | §2.4 THE BURST RE-HOME: the call **MOVES** from the reply `.then` into the notify callback `(p) => { bridge!.notify(p); panels?.refreshDebug(runtime) }`. | `[H]` | `notify-callback placement reading = true` | **PASS** |

---

### G-7 — the predicate boundary `[H]` · contract §2.4, §3.2 `I-4`, row `P-SSJ-H-2`, §3.3 **F-8**

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-7.1** | Read the `MUTATING_METHODS` membership set. | §2.4 / `R-5`: **`'journal'` STAYS a member** (undo/redo genuinely mutates the app graph); §1.2 row 6: **`focus` STAYS absent**. | `[H]` | `MUTATING_METHODS = [dispatch, load, op, teardown, code.load, code.loadBatch, journal]` (`n=7`) · `journal` present · `focus` absent | **PASS** |
| **G-7.2** | Read whether the predicate conjuncts `ok` with membership. | §2.4: the predicate is `reply.ok && MUTATING_METHODS.has(req.method)`; §1.2 row 6 forbids a **widened** predicate. | `[H]` | `predicate reads 'ok && MUTATING_METHODS.has(…)' = true` | **PASS** |
| **G-7.3** | Evaluate the boundary oracle over the read set: a read-only `ok:true` reply, a mutating reply, a `journal` reply, an `ok:false` mutating reply; then forge the widened predicate. | §2.4 (`C-3`): "an `ok:true` reply whose method is NOT in `MUTATING_METHODS` reaches the notify callback **NOT AT ALL** ⇒ the `refreshDebug` call count is **ZERO**"; the row "**BREAKS under a widened predicate**". | `[H]` | `read-only ok reply=0 · dispatch ok reply=1 · journal ok reply=1 · ok:false mutating reply=0` · **`WIDENED-predicate forgery on the read-only reply = 1`** | **PASS** |

---

### G-8 — the DENIED host-trim surfaces `[H]` · contract §1.2 rows 3/4, §3.2 `I-7`, §2.6①, §3.3 **F-7**

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-8.1** | Byte-scan both renderer modules for a host journal splice/assignment, a stack assignment, or a second `condense()`. | §2.1(a) THE HOST TRIM IS ILLEGAL (hazards H1–H4); §1.2 rows 3/4; §3.2 `I-7` THE NO-ENGINE-BOUNDARY RULE: no `journal`/`undoStack`/`redoStack` byte is assigned, spliced or filtered; no ported `applyJournalCap`; no second `condense()`. | `[H]` | `secure-panels.ts: journal splice/assign=false · stack assignment=false · second condense/applyJournalCap residue=false` · `renderer.ts: journal splice/assign=false · stack assignment=false · second condense/applyJournalCap residue=false` | **PASS** |
| **G-8.2** | Extract the `syncConfig()` body by symbol and read which sources it consults. | §2.6①: the guard reads **NO engine structure** (no `journal`, no `undoStack`, no `redoStack`, no `journalEntries()`); **F-7**: "any `journal`/`undoStack`/`journalEntries()` read inside `syncConfig()`" is the failure. | `[H]` | `syncConfig body length = 2748` · `ENGINE-option read (this.maxJournalLength)=false` · `BRIDGE-CONFIG cap read (this.cfg.maxJournalLength)=true` · no `.journal`, no `journalEntries`, no `undoStack`/`redoStack` | **PASS** (after an oracle re-aim — see §2's DOC GAP **DG-1**) |

---

### G-9 — the named park and the no-overclaim block `[doc]` · contract §6, row `P-SSJ-H-3`, `O-8`, `O-6`

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-9.1** | Read the park artifact's status line. | §Status / `O-8`: the park ships **`OPEN / live-pending` — NEVER green, NEVER DONE**. | `[doc]` | `park: OPEN/live-pending=true · NEVER green/DONE=true` | **PASS** |
| **G-9.2** | Read the park's REASON. | `C-3` / `RCA-11` clause (b): the reason is **STRUCTURAL NON-EXERCISABILITY**, **not an absent session**; §10 `A-3B-1` ⑤: the MEASURED skip (`base 7622B >= 2312B`). | `[doc]` | `structuralReason=true · notAnAbsentSession=true · measured D5 skip readings present=true` | **PASS** |
| **G-9.3** | Read the contract's layer/honesty declarations. | §Status + §6: `[T]`/`[H]` layers named, **NO LIVE LEG**, **NO DURABILITY CLAIM**. | `[doc]` | `spec: [T]=true [H]=true NO LIVE LEG=true NO DURABILITY CLAIM=true` | **PASS** |
| **G-9.4** | Read the `DENIED-1` re-aim's in-commit record. | §7 amendment row 11 / `K-2` / `O-6`: the re-aim lands **IN THIS UNIT'S OWN COMMIT**, the as-filed wording kept visible, the red on record. | `[doc]` | `DENIED-1 re-aim recorded=true · in-commit=true` | **PASS** |

---

### G-10 — the register arithmetic `[doc]` · contract §5.2

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-10.1** | Recompute §5.1's declared terms and compare to §5.2's printed sums and caps. | §5.2: `[T]` rows `4+8+6+6+6+8 = 38`; `[H]` rows `4+5+5 = 14`; **ALL 9 DECLARED `= 52`**; largest row `8 ≤ 100`; total `52 ≤ 400`. | `[doc]` | `[T] 4+8+6+6+6+8 = 38 · [H] 4+5+5 = 14 · ALL 9 = 52 · largest row = 8` | **PASS** |

> **`⟶ 2026-10-04` AMENDMENT (`RCA-8(c)`, BY THE GATE-7 PROOFREADER; ANNOTATE-BESIDE — the row above is a TRUE READING OF ITS OWN HEAD AND IS KEPT, NOT REWRITTEN).** **This row PASSED because it correctly recomputed the contract's AS-FILED `38/52`; the contract has SINCE been re-taken, so the as-filed pair is now the SUPERSEDED figure and the operative one is `40/14/54`.** **THE RE-TAKEN ARITHMETIC (`VERIFIED-BY-READ`, reader: THE GATE-7 PROOFREADER, at `tests/store-security-journal-register.test.ts`'s own `DECLARED_REGISTER` `declaredTotal` cells + its §5.2 assertion block, at the head `d1376ae`):** **`[T]` `5 + 8 + 6 + 7 + 6 + 8 = 40`** (`P-SSJ-IM-1` `4 ⇒ 5` and `P-SSJ-IM-4` `6 ⇒ 7`, both re-taken by `A-3B-1` ①/②) · **`[H]` `4 + 5 + 5 = 14` (UNMOVED)** · **`ALL 9 DECLARED = 54`** · **largest row `P-SSJ-IM-2` `8 ≤ 100` (headroom `92`, UNMOVED) · total `54 ≤ 400` (headroom `346`; superseded `348`)**. **The contract's §5.2 now prints BOTH pairs — the superseded one quoted verbatim and the operative one beside it (`unit-store-security-journal.md` §5.2; its ledger entries `G-3B-4`).** **This artifact's OTHER `§5.2`-derived readings — the `8`-draw cap check and the caps `≤100`/`≤400` — are UNMOVED by the re-take and remain valid.** **An `OWED` is flagged with the re-take: `P-SSJ-IM-1`'s §5.1 cell prints `5` while the register's own `declaredTotal` for that row was taken as `5` against a five-item drive list — the seam belongs to the register's author (the concurrent TestWriter remand), never to a doc pass.**

---

### G-11 — the `debugText` binding `[T]`/`[H]` · contract §10 **`A-3B-1` ④** (change-set member ⑤)

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-11.1** | With `M=1` set, drive 30 applied mutations, settle, and read the warn stream for the abort. | §10 `A-3B-1` ④: the `#status` node's resolved content was the **UNBOUND** `this.debugText` (a FUNCTION); the engine's `assertJsonSafe` throws on a function, so `condense()` **aborted** (`condense-aborted`). Binding it (`const value = this.debugText()`) is a **PREREQUISITE** of the unit's instrument — without it "NOTHING about the cap is observable at all". | `[T]` | `applied=30 rejected=0 · depth 12->42 · basePresent=false` · **`condense-aborted warns=0`** | **PASS** |
| **G-11.2** | Byte-scan the pane module for the BOUND call form. | §10 `A-3B-1` ④: the fix is the **bound** call, never the bare function reference. | `[H]` | `bound debugText() call present = true` | **PASS** |

---

### G-12 — module-member presence at the contract paths `[H]` · contract §1.1 member 1, §1.2 row 10 / `K-3`

| # | Scenario | Expected outcome (FROM THE DOCS) | Layer | Observed result | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G-12.1** | Byte-scan the pane module for the four authored cells. | §1.1 member 1: **①** the ADDITIVE OPTIONAL option; **②** the `Supervisor` construction fed `maxJournalLength`; **③** the NEW read-only seam `journalDepth()`; **④** the `syncConfig()` skip-if-unchanged guard site. | `[H]` | `option=true · Supervisor feed=true · journalDepth seam=true · syncConfig guard site=true` | **PASS** |
| **G-12.2** | Byte-scan the two renderer modules for engine-internal residue. | §1.2 row 10 / `K-3`: the microtask-comment defect is **CATALOGUED, NEVER PATCHED** — no engine-internal name is re-implemented fork-side. | `[H]` | `fork-side engine-internals residue = false` | **PASS** |

---

## 2. DOC GAPS (recorded, not resolved by reading the implementation)

**⟶ `2026-10-04` DISPOSITION UPDATE (`RCA-8(c)`, BY THE GATE-7 PROOFREADER): ALL THREE GAPS ARE NOW ABSORBED INTO THE CONTRACT, each as a recorded gap with its fix shape — `G-3B-3` at `unit-store-security-journal.md` §10, with the operative clause amended at `§2.6①` (`DG-1`), the new `§2.7` (`DG-2`) and `§2.6④` (`DG-3`). The three rows below are KEPT VERBATIM AS THE BLIND WRITER'S OWN READINGS — nothing is rewritten; the new `Owner` state is recorded in the column's `DISPOSITION` cell prefix.** **The absorbent amendments did NOT weaken any property this artifact asserted: `DG-1`'s two-source discrimination, `DG-2`'s drive rule and `DG-3`'s never-suppressed reading are all now CONTRACT text, which is strictly stronger than the artifact's own recorded gap.**

| # | Gap | Why it matters | Disposition |
| --- | --- | --- | --- |
| **DG-1** | **§2.6①'s forbidden-read list prints `maxJournalLength` beside `journal`/`undoStack`/`redoStack`/`journalEntries()`, but the same contract MANDATES that `syncConfig()` render the operator's cap** (`journal: ≤M`) **into the `security-status` label and into the `journal-length-input` value** (§1.1 member 1, with the `maxJournalLength` RENDERING ruled **LEAVE-ALONE** by amendment row 10). The two clauses therefore print the same token for two different sources: the **ENGINE option** (`this.maxJournalLength`) and the **BRIDGE CONFIG** (`this.cfg.maxJournalLength`). | Read naively, the clause makes its own mandated rendering a violation — a **contradiction inside §2.6①** as written. | **Recorded as a spec-text ambiguity.** My scenario **discriminates the two sources** and asserts the ENGINE-option read is absent while the bridge-config cap read is present (`false`/`true` observed) — this is the only reading under which §2.6① and amendment row 10 are jointly satisfiable. **Owner: the contract's next amendment (annotate-beside, `RCA-8(c)`).** |
| **DG-2** | **No spec named in this task states the pane's graph node-ID form.** The docs name the SEMANTIC ids (`security-status`, `status`, `token-input`, `journal-length-input`, `module-status`, `module-list`, `module-run-result`, `toggle:*`) but never state whether `Supervisor.getNode(<semantic id>)` resolves them, nor that the minted ids are `node-N`. | A test author following the docs literally would aim drives at `getNode('security-status')`, get `undefined`, receive `unknown-node`, and — if the scenario asserted only "no throw" — ship a **VACUOUS green** (exactly the prior run's trap). | **DOC GAP — reported, not papered over.** The docs are **SILENT**, so this harness uses the ENGINE's documented authored-id carrier (`Node.base.props.id`, per the engine's own `props.id` note) over `allNodes()`. **No implementation file was read to establish this.** Owner: the contract (a §2.x node-identity cell) or the engine's docs. |
| **DG-3** | **§2.6④ says "a CHANGED value still draws EXACTLY ONCE"**, but the toggle class it describes moves **two** drawn values (`props.data-on` and the label `content`). | A literal `=== 1` reading is unsatisfiable for the toggle class; a naive author would either weaken the row silently or mis-report a failure. | **DOC-SHARPNESS gap.** G-5.3 asserts the **falsifiable** content (`≥ 1`, never suppressed) and prints the observed `2` beside §2.6's "exactly once", so the divergence is visible rather than smoothed. |

---

## 3. PARKED SCENARIOS (with their structural reason)

**No scenario in this set is PARKED-NOT-EXERCISABLE.** The park lives in the contract's own NAMED artifact (`unit-store-security-journal-live-pending-battery.md`, `OPEN / live-pending`) and this gate has **no live leg** to lift it. What follows is the boundary of what this artifact can reach, stated rather than claimed:

| The claim | Reachable here? | The structural reason |
| --- | --- | --- |
| the **`≤ M` SETTLE BOUND** | **NO — not asserted anywhere.** | §10 `A-3B-1` ①: the D5 guard ALWAYS SKIPS on this pane (`base >= pre-base journal`); the bound is **unreachable through any legal mechanism on this fixture**. Only `≤ M`'s **absence** is observable, and the attempt is what G-3 asserts. |
| a **LANDED condense** (`basePresent === true`, `journalDepth() !== undoDepth()`) | **NO.** `A-3B-1` ② re-aims `P-SSJ-IM-4` OUTCOME A to its OUTCOME B form: `basePresent === true` is "unreachable on this fixture **without changing the pane's base size**, which is not this unit's surface". The **SKIPPED** arm was observed (G-3.2). | structural: the pane's base snapshot covers all 41 registered nodes against a tiny drive payload. |
| the **two stale Debug-pane states** separated in a DOM reading | **NO — and structurally impossible here.** The park §1(i): *"stale because read-only"* vs *"stale because nothing changed"* **render IDENTICALLY**; the only separating oracle would be a **TIMING** one, forbidden as a claim (§2.3/§2.4). | structural non-exercisability, **not** an absent session (`RCA-11` clause (b)). |
| the **assembled Electron app**, shell CSS/grid/window, a live persistence round-trip | **NO — `[L]`/`[U]` out of scope.** | `RCA-12`: the dom-shim is deliberately **layout-less and CSS-less**; a node-green is **ENVELOPE-green, not APP-green**. |

---

## 4. FAILURES

**None at the final head: 31 scenarios, 31 PASS, 0 FAIL, 0 SKIPPED.**

**ONE intermediate FAIL is recorded, with its disposition — it is a scenario-authoring correction AND a doc gap, not a pass quietly re-aimed.** The first run reported **`Tests 1 failed | 30 passed (31)`**:

- **Failing scenario:** `G-8.2 [H] I-5/§2.6①/F-7: the mutation-building site reads NO engine structure`.
- **Observed vs expected divergence:** the oracle asserted `syncConfig()`'s body matches **NEITHER** `/\.journal\b/`, `/journalEntries/`, `/undoStack|redoStack/` **NOR** `/maxJournalLength/`. The body was extracted (`2748` chars) and **matched `/maxJournalLength/`**, while matching none of the engine-structure patterns. The matched text was the **bridge-config rendering** (`this.cfg.maxJournalLength !== undefined ? ' · journal: ≤…' : …`) — i.e. **the rendering the contract itself mandates and amendment row 10 rules LEAVE-ALONE**, **not** an engine-structure read.
- **Root cause:** §2.6① prints the token `maxJournalLength` in its forbidden-read list **and** the contract mandates `syncConfig()` render that value — the clause contradicts itself as written (**DOC GAP DG-1**). My oracle inherited the literal token instead of the clause's **subject** (the engine structure the guard must not decide from). This is a **spec-text defect surfaced by the blind pass**, and it is the kind of finding this gate exists to produce.
- **Disposition:** the oracle was **re-aimed to discriminate the two sources** and both readings are now printed (`ENGINE-option read=false`, `BRIDGE-CONFIG cap read=true`), so the row is **still falsifiable** (a guard deciding from `this.maxJournalLength` reddens it) and the **property was not weakened** — the subject was made explicit. The divergence is recorded here and in DG-1 rather than deleted. **A PASS obtained by simply dropping the over-reaching assertion would have been a review finding; it was not done that way.**

**No other failure occurred, and no scenario was silently re-aimed.**

---

## 5. LAYER LEDGER AND HONESTY/LIMITS BLOCK (`RCA-12`)

| Deliverable covered here | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the option, the `Supervisor` feed, `journalDepth()`, the volume guard, the cap attempt, the D5 skip | **`[T]` over a CONSTRUCTED pane** (in-process `new SecurePanels(mount, { … })`) | the assembled app; the rendered DOM under shell CSS/grid; that a real operator's `M` reaches this pane at runtime |
| the occurrence probe, the predicate boundary, the member/surface pins, the no-engine-boundary scans | **`[H]` wiring byte-pins + shim** | that the notify callback fires in a real session; any timing property |
| the park status, the layer declarations, the register arithmetic | **`[doc]`** | any runtime behaviour at all |

**THE HONESTY/LIMITS BLOCK (each a NAMED NON-CLAIM, each falsifiable).** This artifact does **NOT** claim: **app-green** · **envelope-green-as-app** · **store-green** · **engine-green** · **live-green** · **any live leg** · **any durability or crash-safety property** (this unit moves no byte on any durability axis) · **any `≤ M` settle bound** (the D5 guard skips; only the ATTEMPT is observed) · **that the notify callback's re-home is observable in a rendered-DOM reading** (the park's own reason) · **any timing property** (no notify-callback firing, no reply-ordering, no settle window) · **any MCP surface** · **that a `[T]` green on a constructed pane implies the pane's behaviour under the assembled app** · **that the app works**.

**WHAT THIS SET DOES PROVE (the closed claim):** over a **CONSTRUCTED pane** and **byte-scans**, the seam's subject (`Supervisor.journal.length`, never `undoDepth`), the option's **additive-optional** form and its **plumbing** to the engine, the cap's **CONFIGURED + ATTEMPTED** reading with the **uncapped control** still growing, the **subject-discrimination disjunction** on its observed SKIPPED arm, the volume guard's **12 → 0** steady-state reduction with rendering parity and no suppression of a change, the **two-site** occurrence count, the **unwidened predicate boundary** with its zero-count read-only oracle, the absence of any host trim and of any engine patch, the named park, and the `DENIED-1` in-commit re-aim. **Each scenario's drive was verified APPLIED (`rejected=[]`) — no row is vacuous.**
