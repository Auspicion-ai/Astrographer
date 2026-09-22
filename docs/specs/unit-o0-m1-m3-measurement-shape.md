# Unit `O0-M1-M3-MEASUREMENT-SHAPE` — the freeze-row MEASUREMENT-SHAPE re-derivation — Spec

**Status:** **DONE (2026-09-21 — the NINTH live run RAN and PASSED the DEC-1-ACCEPTED form on
BOTH legs, on the §3b-RE-AUDITED oracle: **§15 IS THE CANONICAL RECORD — read it first**).**
Both legs read **`status:"OPEN-structural"`, `pass:false`, `driver.selfValidation.ok:true`,
`selfValidationOfEmitted.ok:true`** (the re-validation of the EMITTED object — NEW this
edition), **`errors:[]`, `gatingReasons:[]`**, the structural family only (`snapshot.clone`),
the OPEN-structural note form, **no harness defect this run**, census **226/226**,
`driver.build.verified:true`, and the **ORACLE identity RECORDED**: `driver.oracleIdentity`
= `92a74b7d` (`src/shared/o0-report.ts` `b89d6f19` + `scripts/live-drive.mjs` `194dfece`),
IDENTICAL on both legs — **the ninth edition differs from the eighth in the ORACLE, not in the
bundle bytes** (the executing bundle's content hash is `3e3f1b80` / `1e652667`, UNCHANGED from
runs 5-8). The artifact `docs/specs/unit-o-0-per-stage-breakdown.md` is the **NINTH edition**
(its banner names runs 1-8 SUPERSEDED; both legs' raw JSON embedded verbatim, byte-exact
round-trip re-verified: GPU-OFF 164 414 bytes / `57a2ecfb508a4717`, GPU-ON 97 672 /
`2e0d839a4c1da603`). **THE §3b CLAUSES WERE EXERCISED LIVE FOR THE FIRST TIME (the closure
evidence): per-row `row.pass ⇔ failReasons.length === 0` both directions 6/6;
`validateO0MeasurementShape.ok:true`/`errors:[]`/`legacyShape:false` 6/6 with `legacyShape`
AGREEING across both surfaces 6/6; the aggregation identity on all 9 finite ids; declared ≡
derived (0.1 ms) for window/accounted/unaccounted; the row `stages[]` closed-11 / finite /
`ms:null ⇔ unseparated` checks 6/6; per-pass RE-DERIVATION drift 0 on 14/14 passes;
`records.indices` strictly increasing, disjoint, union `0..n-1` 6/6; the
`null`-remainder-without-a-reason case absent (the number form with reasons in place).** The
**§13.1 MUST-FIX (1)-(4) are LANDED with the §3b re-audit as their verification** (§13.6); the
landed SHOULDs (the single self-validation call + a post-finalize re-validation of the emitted
object, the oracle provenance, the `legacyShape` single reading) are recorded there too, and
**the SHOULD/ACCEPTED items still owed are the labelled OWED list in §13.7** (the note's branch
vs the final status on the exact `F7-1` class; the unarmed 0/0 baseline unreachable live —
`S3`/`P-SM-1` restated node-only or given readings; four missing named reds; §14.6's
"different bytes" claim, now CONTRADICTED; the `hook.reconcileToleranceMs` band-field drift; the
artifact's three-way band-bookkeeping disagreement; and the two items this pass CORRECTED rather
than owed — §5's register-budget statement, now 392 ≤ 400, and §4.1's omission of
`unaccountedReason`). **The
suite is GREEN: 221 files / 4 988 passed / 58 skipped / 0 failed; typecheck 0; build 0** —
with **two test-side repoints applied in the same pass** (the `RA-2c` fixture's duplicate id
and the edition probe EIGHTH→NINTH — **the FOURTH consecutive regeneration that owes that
repoint; the general form is its fix** — §15.11). **THE O-5 GATE IS UNBLOCKED:** the ninth
edition's LIVE form is the accepted artifact and the reviewer's condition ("fix items 1-4 then
re-run") is satisfied, so the queue leads with it (O-5 → O-9+O-3 → O-10 → O-1 → O-2, O-4
conditional on the disclosure-only trigger). **NOT relabelled `"OK"` and DEC-1 not re-ruled:**
the accepted structural set (`snapshot.clone` structurally unseparated + the therefore-derived
`post.style`) and the visibility invariant are unchanged. **THE SEVENTH-RUN BLOCK AND THE
§12.9-§12.11 SIXTH-RUN DONE STATE BELOW ARE HISTORY** (kept verbatim: they record what the
sixth run established and the `F7-1` ordering FAIL the fix cycle repaired); **§14 records the
seventh run + the two strict-check OWED items + the edition-probe item + the eighth-run
requirement, and §14.8 its post-run finding statuses.** **THE RCA-3 RECORD THAT FOLLOWS IS STILL THE AUTHORITATIVE FINDINGS LIST; §14.8 records the post-seventh-run status of every one of its findings (six CLOSED LIVE, one half-closed, two unaffected/owed), and §13.6 records each one's FINAL status after the §3b re-audit + the ninth run.** The RCA-3 pass found **4 MUST-FIX + 5 SHOULD** (three HOST MUST-FIX in the landed
shape oracle, one TEST/PROCESS MUST-FIX in the live gate, plus the owner-tagged SHOULDs): the row
verdict `partition.row.pass` is **ASSERTED, not derived** (§4.2 violated), the per-id aggregation
identity was **DEMOTED to a non-forcing note** (§6 `FS2` violated — this removes the only oracle
tying the recorded per-stage sums to the record list, i.e. the `M1` symptom this unit exists to
close), the recorded attribution fields are **TRUSTED, not re-derived** (§3.4 unenforced), and the
live gate is a **TEXT PROBE** (so the sixth-run live-evidence claim is DOWNGRADED to a human
reading pending a per-row parse+validate live pin — §13.5). The rest of this status block is the
**DONE-state record as it stood at the 2026-09-21 documentation review** (superseded as a STATUS,
unaffected as HISTORY). **The DONE record (2026-09-21) — the SIXTH live run reproduced the
DEC-1-accepted form, the three test reds are GREEN, and the documentation review is that pass.**
The unit's
full cycle RAN in order (RCA-1/RCA-2/RCA-5): spec → TestWriter **red 33** → Implementer green
→ the **FIFTH run's FAIL** → the fixture remand → the `F5-1`..`F5-6` fixes + the `RULE-2`/
`FIX-TP1`/`FIX-TP3` reds green → the **SIXTH live run** → this documentation review
(`archive/reviews/2026-09-21-unit-o0-m1-m3-doc-review.md`). **The committed artifact
`docs/specs/unit-o-0-per-stage-breakdown.md` is now the SIXTH edition** (runs 1-5 named
SUPERSEDED inside it; both legs' raw JSON embedded verbatim, sha256/byte-exact round-trip),
**and DEC-1's accepted form is now reproduced by the committed artifact** — the caveat the
fifth edition forced (§12.7, "the accepted form is NOT currently reproduced by the committed
artifact") is **RESOLVED**; the fifth edition's FAIL stays INSIDE the artifact's own
supersession record as history (§13 of the artifact + §12.10 below). **The unit's record
continues in §12.9/§12.10** (the sixth run: commands, bundle identity, census, the
per-pass/reconciliation tables, the controls, the self-validation triple, the derived
verdicts, the `F5-1`..`F5-6` closure evidence, the identity, the vs-run-5 comparison and the
carried items) **and in §12.11** (the gate items CLOSED with the layer statement).
**NOT relabelled `"OK"`, and DEC-1 is not re-ruled:** the accepted structural set
(`snapshot.clone` structurally unseparated + the therefore-derived `post.style`) and the
visibility invariant are unchanged — the report stays `status:"OPEN-structural"` /
`pass:false` / `selfValidation.ok:true` / `errors:[]` / `gatingReasons:[]`. **AMENDED (2026-09-21, contract amendment after the TestWriter's red run):
the binding back-compatibility ruling RUL-7..RUL-10 (§2.5a, with the two red-run conflicts
and their resolution recorded in §7.1)** — the new shape gates the **NEW surface only**
(the four new pure oracles), the pre-existing validators keep their clause sets, and the
O-0 suites' **114 stay green UNMODIFIED**; the unit's red baseline is its own **33 pins**
(31 implementer-dependent + the 2 `LIVE` gate rows pending the fifth run). **THE FILING-TIME STATE (superseded — kept as history):** the unit was then the **queue's leading item** (`docs/next-steps.md` NEXT QUEUE
item **(2)**) and the fix for the then-OPEN defect row
**`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`** (`docs/defects.md`), which the **fourth live
run re-witnessed unchanged** (`docs/specs/unit-o-0-per-stage-measurement.md` **§12.14 (8)**;
artifact `docs/specs/unit-o-0-per-stage-breakdown.md` **§11.4/§11.6**), its
acceptance requiring a **live re-run** that regenerated the committed artifact as its
FIFTH edition. **ALL OF THAT HAS HAPPENED:** the fifth edition was the FAIL record, and the
**SIXTH** run (the DONE state above; §12.9) reproduced the accepted form, the row is **FIXED
(2026-09-21)** and the queue now leads with **O-5**.

**STATUS UPDATE (2026-09-21, the SpecDoc pass recording the FIFTH live run — read §12 BEFORE
acting on any "the FIFTH edition" clause below; THIS WHOLE BLOCK IS NOW HISTORICAL: it
describes the state BEFORE the fix and the SIXTH run, and is SUPERSEDED by §12.9/§12.10.** The unit's mandatory live re-run **RAN** and
its artifact (`docs/specs/unit-o-0-per-stage-breakdown.md`) is now the **FIFTH edition** — and
that edition reports **`status:"FAIL"` / `pass:false` / `selfValidation.ok:false` (4/2 errors) /
`gatingReasons` 9 / 5**, i.e. **NOT the DEC-1-accepted `OPEN-structural` form**. **The ACCEPTED
evidence under DEC-1 is the FOURTH edition** (whose raw JSON is recoverable from git history;
record `docs/specs/unit-o-0-per-stage-measurement.md` §12.14), and **DEC-1's acceptance ruling is
UNCHANGED and not relabelled** — the accepted form is simply not currently reproduced by the
committed artifact. The unit is **NOT DONE**: §12 records the FAIL, the M1/M2/M3 closures it did
establish, the six open findings (`F5-1`..`F5-6`), the three test reds (`RULE-2`, `FIX-TP1`,
`FIX-TP3`), the architect's rulings **`RUL-11`..`RUL-14`**, the amendments they force on §2/§3/§5/§6,
and the acceptance path (**fix → green → the SIXTH run → adversarial → documentation review**).

**Scope — what this unit is.** The unit is **DRIVER/ORACLE MEASUREMENT-SHAPE** work.
**Layer (RCA-12, mandatory declaration):** **`assembled-renderer` measurement** — the
evidence it produces is a real hit-tested CDP gesture against the executing `dist/`
bundle. **A green here is a MEASUREMENT-SHAPE green, NEVER app-green** (RCA-12 `AGENTS.md`
item 12): the node/register green proves the *oracle and the report shape*, and the live
run produces the *values*; neither is a statement about app behavior.

**It CHANGES NO APP BEHAVIOR.** `src/**` stays untouched except for the **one pure,
additive change this shape strictly requires** — the per-record timestamps on
`O0HookRecord` in `src/shared/o0-hook.ts` (§3.1), which is measurement-only and inert when
unarmed (`P-HK-1`). Every other change is **driver + spec** (`scripts/live-drive.mjs`,
this spec, the regenerated artifact). **No store, no IPC, no MCP contract, no rendered DOM,
no page design is touched** (`docs/skills/designing-pages.md` does not exist in this tree;
no page-design artifact is owed — §10).

**It does NOT re-rule `DEC-1`.** The accepted structural set (`snapshot.clone` + the
therefore-derived `post.style`), the AMENDED gate clause, the visibility invariant
(`status:"OPEN-structural"`, never quietly `"OK"`) and the "no residual may be quoted as a
style cost" rule are all **preserved verbatim** (§2.1 clause 6, §9).

**What it supersedes.** This unit **supersedes the M1-M3 part of the FOURTH-edition
artifact's shape** (`docs/specs/unit-o0-per-stage-breakdown.md`: its §4 residual column,
its §8.5 "two-re-derive" note, its §9 window-bound table and its §11.4 `M1`/`M2`/`M3`
rows): the artifact is **REGENERATED as its SIXTH edition** by the unit's mandatory live
re-run (RCA-11), with **runs 1-5 named SUPERSEDED inside it** (the fifth edition is the
intermediate FAIL record — preserved in the file's git history and inside the sixth edition's
own supersession record, §12.10). §11 records the supersession.

**Depends on (upstream of this spec):** `docs/specs/unit-o-0-per-stage-measurement.md`
(the O-0 contract: §2.2 the closed 11-stage set, §3.1 the 5 blocks, §3.2/§3.2.1 the block
result + the recorded band, §3.6/§3.6b the hook + the closed seam set, §4.2-§4.4 the
report shape, §5 the 8-row register, §6 the states/fail-states, §11 the gate shape,
§12.13/§12.14 the third/fourth run records, **§12.15 the fifth run (FAIL)** and **§12.16 the
sixth run — the accepted form reproduced**) and the artifact
(`docs/specs/unit-o-0-per-stage-breakdown.md`, **SIXTH edition**, whose raw JSON of both legs
is embedded verbatim in its §12).

---

## 1. What this unit asks

The defect row `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` (`docs/defects.md`) files three
measurement-shape findings from the third run, all three **re-witnessed unchanged by the
fourth**. Each finding below carries **this pass's verification** against the code and the
fourth-run artifact — including one correction to `M1`'s causal story (§1.1 (c)) and one
precision correction to how "silent" the current shape is (§1.4).

### 1.1 `M1` — Σ stages exceeds the freeze window (VERIFIED, with a correction)

**The recorded numbers.** FOURTH edition, GPU-OFF
(`docs/specs/unit-o0-per-stage-breakdown.md` §4.1, embedded JSON §12.1):

| row | Σ named stages | long-task total | artifact `residual` | measured window (`wallMs`/freeze window, §5.1/§9) |
| --- | --- | --- | --- | --- |
| `o0-folder-row-gpuoff-r1` | **1 091.5** | 1 007 | **−84.5** | **1 066.5** |
| `o0-document-row-gpuoff-r1` | **4 025.4** | 2 162 | **−1 863.4** | **2 267.5** |

GPU-ON reads the same shape (Σ 1 041.3 vs 954, residual −87.3 / Σ 4 037.4 vs 2 177,
−1 860.4 — §4.2).

**(a) The document row records MORE THAN ONE re-derive sequence — verified.** Its
`hook.records` is **22** against the folder row's **11** (§4.1/§8.5), and the per-record
detail (`hook.stageRecordDetail`, embedded JSON) shows **three** committed record groups:

1. a **4-record render-only pre-pass sequence** — `render.dom` 27.4 + `render.ssr` 24.1 +
   `render.dom` 22.5 + `render.ssr` 22.7 (i.e. TWO top-level `Runtime.render()` calls with
   **no derivation record at all**), committed BEFORE the first `snapshot.pull`;
2. a **heavy re-derive pass** — `snapshot.pull` 118.3, `docheads.pull` 2, `traversal.build`
   5.9, `shared.decorate` 0.4, `envelope.assemble` 0.3, `reconcile.roots` 2.9, `render.dom`
   23.1, `render.ssr` **1 692.5**, `reconcile.apply` **2 030** (the heavy pass sits inside
   the 2 064 ms long task);
3. a **light re-derive pass** — `snapshot.pull` 44.1, `docheads.pull` 2, `traversal.build`
   5.6, `shared.decorate` 0.4, `envelope.assemble` 0.2, `reconcile.roots` 0.2, `render.dom`
   0.2, `render.ssr` 0.2, `reconcile.apply` 0.4.

The **folder** row is the same shape with **one** re-derive pass: a **2-record render-only
pre-pass sequence** (`render.dom` 30.8 + `render.ssr` 25.8) + one 9-record re-derive pass
(`snapshot.pull` 79.9 … `reconcile.apply` 150.1). The row's per-stage values are SUMS over
records (`render.dom` 58.4 = 30.8 + 27.6; `render.ssr` 70.6 = 25.8 + 44.8), so the
aggregation is per-id and the pass structure is invisible in `stages[]`.

**The verified call path (by symbol — the anchors drift, so the symbols are the citation).**
Both re-derive sequences are **content-reconcile** passes, i.e. the
`kind === 'content'` branch of `SidebarPanes.reDerive(kind)`
(`src/renderer/sidebar-panes.ts:1998`; the caller-level recorded spans at `:2009`
`record('snapshot.pull', async () => this.bridge.rag.snapshot())` and `:2019`
`record('docheads.pull', …)`) — the branch at `:2076-2078` calling
`this.applyContentChange(traversalEnvelope)` (`:1569`), which reaches
`Runtime.applyContentReconcile` (`src/renderer/runtime.ts:521`, the recorded span at
`:527`). They are **not** the `refresh()` full-reload branch (`:2080`): `refresh()`
(`:1824`, caller-level records `:1888`/`:1899`) performs a full `loadAppGraph` teardown +
fresh `render()`, which emits **no** `reconcile.apply` record — and both of this row's
re-derive sequences carry one (`2 030 ms` and `0.4 ms`). The row's second content reconcile
is therefore a second invocation of the same re-derive entry point inside one armed window
(the queued-re-derive path `reDeriveQueued` → `await this.reDerive(queuedKind)`
(`:2129-2134`) and the pane-graph rebuild seam (`src/renderer/renderer.ts:948`
`onRebuild: (kind) => void host?.reDerive(kind)`) are the two recorded candidate initiators;
**which of the two fired is NOT claimed here** — the seam does not carry an initiator id,
and fabricating one would be the `L3` attribution error the O-0 spec forbids).

**(b) `M3` makes the long-task total the wrong denominator for span accounting — verified.**
The oracle sums the full `duration` of every long task that **starts inside** the window
(§1.3). Time **outside** long tasks is therefore not in it — including the awaited IPC round
trips (79.9/162.4 ms on run 4) and the idle gaps between tasks — while the stage spans DO
include that time. A Σ of spans compared against a long-task total is dimensionally wrong
in both directions: it can exceed it with a perfect partition (idle/round-trip time) and it
can fall short of it (a task that starts inside and ends outside is counted in full while
its work is only partly inside).

**(c) CORRECTION — the double pass is NOT the only cause, and on the folder row it is not a
cause at all.** The folder row has **11 records = one record per stage id** (a single
re-derive pass + the pre-pass render pair) and still reads Σ **1 091.5 ms > 1 066.5 ms** —
the measured window. A set of pairwise-disjoint spans inside that window cannot sum to more
than it, so **the stage spans are NOT pairwise disjoint even on a single-pass row**. The
mechanism is in the tree: `render.dom`/`render.ssr` are emitted by `Runtime.render()`
(`src/renderer/runtime.ts:324` / `:334`), and the reconcile path calls `this.render()` at
**`:659`** — the tail of `applyContentReconcileBody` (`:537`), which runs **inside** the
`record('reconcile.apply', …)` span opened at **`:527`**. A nested emit is therefore counted
twice by the row's Σ. On the folder row the two render emits (58.4 + 70.6 = 129) fit inside
the 150.1 ms `reconcile.apply` span with room to spare. **So `M1` has TWO independent
causes: (i) more than one re-derive sequence per armed window (the document row), and
(ii) nested spans double-counted by an unqualified Σ (both rows) — plus (iii) the
long-task total being the wrong denominator (§1.1 (b)).** The unit's shape must fix all
three, not only the double pass.

**(d) How silent is it today (precision — the honest reading).** The row is **not** a
`schema`-silent pass: `o0ApplyPostStyle` (`scripts/live-drive.mjs`, the driver twin) and
`reconcileO0PostStyle` (`src/shared/o0-report.ts:531`) both take the "not separable" branch
when the residual is negative, so the row is `pass:false` with a
`unseparated stage(s) … cannot be reconciled` reason in each channel. What IS dishonest is
threefold: (i) the artifact's §4 table prints a **negative number in a cell labeled
`residual`**, which a reader can only read as "the remainder" (the value actually means
"Σ exceeded the window"); (ii) the emitted reason attributes the failure to the **structural
stage** (`snapshot.clone`) rather than to the **measurement shape** — the reader cannot tell
which of the two independent causes produced it; and (iii) the shape offers **no per-pass
quantity at all**, so no pass can be reconciled even in principle. The unit's contract is
therefore "the negative residual is unrepresentable and the remainder is per pass" (§2.1),
not "the row was silently green".

### 1.2 `M2` — `hook.armCount`/`disarmCount` are SESSION-cumulative (VERIFIED)

**The code.** The driver records them from the page-global handle's `read()`:
`armCount: drained?.hook?.armCount ?? 0` / `disarmCount: drained?.hook?.disarmCount ?? 0`
(`scripts/live-drive.mjs`, the `hook: {…}` row assembly — cited by symbol; the numeric
anchor drifts). The handle's state is created **once per page**
(`O0_HOOK_SOURCE`, the `if (window.__o0) return true` guard) and its counters only ever
increase (`state.arm = function … { state.armed = true; state.armCount++; … }` /
`state.disarm = function … { state.armed = false; state.disarmCount++; … }`) — **nothing
resets them between blocks**. (The renderer's own recorder in `src/shared/o0-hook.ts:202`
has the same session-cumulative counters at `:211-212`; its **records** ARE per-window,
cleared on the arm transition at `:230` — which is why `hook.records` reads 11/22 while the
counters read cumulatively.)

**The artifact.** GPU-OFF rows read `armCount`/`disarmCount` **1/0, 2/1, 3/2, 4/3**
(embedded JSON §12.1; the same shape in the GPU-ON leg), i.e. `armCount − disarmCount = 1`
in every armed row — a session total presented under a name a reader takes for a per-row
count. **The window oracle is unaffected** (each row's `armWindow` is per-row and in-band:
worst overshoot +1.0 ms against the recorded 40 ms band, §9). The finding is that the
report cannot prove **this row's own arming**.

**One further verified detail the shape must respect.** Inside the drain evaluate
(`o0QuiesceAndDrain`) the recorder's state is read **before** the page-side `disarm()` in the
same evaluate (`const hook = window.__o0.read()` … then `window.__o0.disarm(); const after =
window.__o0.read()`; `after.disarmedAt` is the only value taken from the post-disarm
reading). So today a row's own disarm lands on the **next** row's reading. A correct per-row
count must be derived from a reading taken **after** the row's own disarm — the post-disarm
reading already exists in that evaluate (§2.2).

### 1.3 `M3` — the long-task oracle sums tasks STARTING inside the window (VERIFIED)

**The code.** `o0QuiesceAndDrain` (`scripts/live-drive.mjs`, cited by symbol) filters the
observed entries with
`(m0 === null || e.start >= m0) && (m1 === null || e.start <= m1)` and totals with
`longTasks.reduce((a, e) => a + e.duration, 0)`, where `m0`/`m1` are the `o0:t0`/`o0:t1`
mark start times. The pinned rule is therefore **start-inside, inclusive at BOTH endpoints,
summing the FULL `duration`** — a task that starts inside and ends outside is counted in
full; a task that starts before `t0` is excluded entirely even where it overlaps the window.
The alternative candidate rules (overlap-any, interval-intersection) are NOT implemented and
are not recorded anywhere. This rule is what makes `M1` possible (§1.1 (b)) and must be
**pinned explicitly** so the reconciliation is well defined (§2.3).

### 1.4 What this unit does NOT do

- It does **not** change any app behavior, any block name, any CLI flag, any gesture, any
  corpus pin, any band constant, or any of the 11 stage ids.
- It does **not** re-rule `DEC-1` and does **not** build the `snapshot.clone` main-side
  transport (`docs/pending.md`, the park row — untouched; §9).
- It does **not** re-open `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` (FIXED 2026-09-21) and
  does not weaken any `P-HK-1` / `P-TP-3` / `P-TP-2` / `P-IM-*` invariant of the O-0 spec:
  (**NOTE 2026-09-21 — the `P-TP-2` named here is the M1-M3 register row of §5; the SEPARATE
  `P-TP-2` row of `docs/specs/unit-v5-migration.md` §5 — the committed-budget row — carries a stale
  "the §2c ceiling is enforced by the §3.3 pin" claim, corrected as OWED in that spec and in §13.1
  (6)/§13.2 (6) here. No invariant is weakened either way.**)
  the register rows of §5 are this unit's OWN register, and the O-0 register (its `P-TP-1`
  residual clause INCLUDED) is re-run **unchanged on the legacy path** — no O-0 row is
  rewritten, re-pinned or weakened (§2.5a RUL-7, §5, §7.1).
- It does **not** park the live battery: **(RCA-11) the mandatory live re-run is a pre-DONE
  gate for this unit** (§10).

---

## 2. The contract — the three resolutions

### 2.1 `M1` — the CHOSEN SHAPE: per-pass sub-rows, reconciled against each pass's own
### measured span, with UNION accounting; the single summed row residual is FORBIDDEN

**The choice, stated once.** Of the three candidate shapes, this unit pins **(a) as the
primary**: the freeze row carries a **`hook.passes[]` array of per-pass sub-rows, each with
its own window, its own stage sums and its own remainder**; **(b) as the window
definition**: each pass's window is the pass's own **MEASURED span** (`t1 − t0`, from the
record timestamps), never the long-task total; and **(c) as a prohibition**: a row-level
single summed residual (`longTaskTotalMs − Σ(named stages)`) is **retired** — it may not be
reported as a residual and may not be silently negative.

**Justification (three independent reasons, each verified above).**
1. **The denominator must be the measured span** (§1.1 (b)): the long-task oracle is a
   start-inside sum of task durations and excludes everything outside a long task — idle
   gaps and the awaited IPC round trips included — while a Σ of stage SPANS contains that
   time. Only `t1 − t0` (the measured window) is a well-defined denominator for accounting
   spans inside that window.
2. **The accounting must be union-based, not a SUM** (§1.1 (c)): stage spans nest
   (`render.dom`/`render.ssr` are emitted inside `reconcile.apply`'s span —
   `runtime.ts:659` inside `:527`), so a Σ double-counts. The honest quantity is the measure
   of the **union** of the accounted (top-level) spans intersected with the window:
   `accountedMs = |⋃(top-level spans ∩ window)|`.
3. **The row must be partitioned per pass** (§1.1 (a)): one armed window can contain more
   than one re-derive sequence (document row: two passes + a pre-pass render sequence), so a
   row-level remainder mixes passes and cannot attribute anything to any of them.

**The pinned remainder (the honest quantity).**

> **`unaccountedMs(pass) = passWindow.ms − |⋃(the pass's top-level spans ∩ the pass window)|`**
> **`unaccountedMs(row)  = window.ms − |⋃(ALL top-level spans ∩ the freeze window)|`**

Both are **non-negative by construction** (a union of sub-intervals of the window cannot be
larger than the window). The row's value is the authoritative one; the per-pass values are
the attribution layer. Consequences, all pinned:
- **A negative remainder is UNREPRESENTABLE.** If a computation ever yields one, it is a
  computation defect and the row is **`pass:false`** with the reason
  `unaccountedMs <n> is negative — the union accounting cannot produce a negative remainder
  (M1/RCA-shape): the span set or the window is wrong` (§6 `FS1`). **A negative value must
  never be printed in any table cell, verdict or field labeled `residual`, `unaccountedMs`
  or "remainder"** (§4.4).
- **`postStyle.residual` is RETIRED.** The legacy field is emitted `null` + the recorded
  marker `retired: true` + `retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)'`. The legacy
  formula `longTaskTotalMs − Σ(named stages)` may be recorded ONLY as a diagnostic
  (`reconciliation.naiveSumResidualMs`) carrying `notAResidual: true` — never as a residual.
  A row whose `postStyle.residual` is a non-null number is `pass:false` (§6 `FS8`).
- **The band is RECORDED and stated, and its SCOPE is stated with it (RUL-11, §12.4).**
  `reconciliation.toleranceMs` (the existing `tolerance.reconcileMs` = 50 ms,
  `O0_RECONCILE_TOLERANCE_MS`, `live-drive.mjs:517`) is the band the remainder is judged with
  **for every pass and for the row**, and the row must state the band it used. **The band's
  SCOPE is pinned explicitly, because the FIFTH run showed the two constants are not
  interchangeable** (artifact §8.1/§11, finding `F5-1`): the band judging `unaccountedMs` —
  the **union remainder** — is `tolerance.reconcileMs` (**50 ms**), while
  `hook.toleranceMs` (**40 ms**, `O0_WINDOW_TOLERANCE_MS`/`O0_HOOK_LONGTASK_TOLERANCE_MS`,
  `live-drive.mjs:518`) is the **WINDOW-BOUND** band (§4.3/§4.4 and `P-TP-3`'s
  `ms ≤ longTaskTotalMs + band` rule) and the hook-inertness band. **The retired summed
  residual** (`longTaskTotalMs − Σ(named stages)`, surviving only as
  `naiveSumResidualMs` + `notAResidual:true`) has **no band at all** — it may not be judged
  against either constant. A reason, verdict or gate that judges the union remainder against
  `hook.toleranceMs` is the mis-scoped-band defect the FIFTH run exhibits: its row reasons
  read "EXCEEDS the recorded **40** ms band" while the row's own recorded
  `reconciliation.toleranceMs` is **50** (and two ablation rows at 40.7 / 41.9 ms are `pass:false`
  against 40 but would be within 50). **The `unaccountedMs` band is re-derived empirically
  for the NEW quantity before any band-driven gate is re-pinned (§12.4 RUL-11).** Three
  legal outcomes, each recorded: (i)
  `0 ≤ unaccountedMs ≤ toleranceMs` → `reconciliation.ok:true`; (ii)
  `unaccountedMs > toleranceMs` → `reconciliation.ok:false` + a reason naming the number
  **and** the band (a legitimate measurement outcome, **not** a shape defect — the remainder
  is larger than the band, which is a finding to report, not an error to hide); (iii) the
  remainder is **not computable** for a named structural reason (§2.1 clause 5) → `null` +
  the reason. **(i) and (iii) are the only outcomes that may be described as "reconciled";

(ii) is described as "reconciled with the band exceeded".**

  **The outcome-to-failure clause (RUL-11/F5-1, §12.4): outcome (ii) is an OUTCOME, never a
  forcing reason.** A band-exceeded remainder must NOT set the row's `pass:false`, must NOT
  enter the row's `failReasons` as a shape failure, and must NOT propagate into the report's
  `gating`/`gatingReasons`/`status` — the report-level `FAIL` gate is reserved for the §6
  `FS`-state classes (an imputation, a falsifiability failure, a violated window, a broken
  control pairing, a census mismatch, a genuinely unmeasured permitted stage). On a
  band-exceeded remainder the row records `reconciliation.bandExceeded:true` + a row-level
  NOTE naming the number and the band, the report stays in its structural form
  (`status:"OPEN-structural"` while the DEC-1 gap exists), and the over-band case is a
  reported quality finding. **Which of the two allowed treatments is now pinned:** (A) the
  band is re-derived empirically for the union remainder and the over-band case stays a
  reported finding + row note (never a report-level `FAIL` gate) — **this is the treatment
  §12.4 pins as the fix shape**; (B) the band is re-derived AND an over-band remainder keeps
  a row-level forcing reason, which requires DEC-1 to be re-adjudicated by the user because
  it changes the accepted form. **(A) is pinned; (B) may be taken only by a user decision.**

- **The DEC-1 separation rule is PRESERVED verbatim.** While **any** stage in the row is
  `unseparated` (structural or merely unmeasured), the row-level `post.style` entry stays
  exactly `{ ms: null, unseparated: true, source: 'derived', timed: false, derived: true,
  structural: false, structuralReason: null }` with `attributable: false` and the
  reconciliation reason naming the unseparated ids — **an unmeasured stage cannot be
  reconciled away**. The computed `unaccountedMs` is therefore reported as a **remainder
  labeled `derived` and `attributable:false`**, never as the `post.style` value, never as
  "style/layout/paint", and never as a measurable stage cost. The DEC-1 visibility
  invariant is untouched: the report stays `status:"OPEN-structural"` because
  `snapshot.clone` remains structurally unseparated.
- **The computable-and-separated branch is pinned for completeness.** If (in a future bundle)
  every stage is measured or `derived`, the partition is computable and
  `unaccountedMs ≤ toleranceMs`, then `postStyle.ms = unaccountedMs` with
  `unseparated:false`, `source:'derived'`, `attributable:false` — the branch is pinned so
  the shape is total, and no present run may claim it.

### 2.2 `M2` — the per-row (and per-pass) arm/disarm counters

**The fields (additive; the ambiguous legacy names are RETIRED).** On every freeze row's
`hook` block:

| field | type | meaning |
| --- | --- | --- |
| `hook.rowArmCount` | integer ≥ 0 | the number of page-side arm transitions **attributable to THIS row** |
| `hook.rowDisarmCount` | integer ≥ 0 | the number of page-side disarm transitions **attributable to THIS row** |
| `hook.sessionArmCount` | integer ≥ 0 | the handle's cumulative `armCount` at the row's post-disarm reading — **labeled session-scoped** |
| `hook.sessionDisarmCount` | integer ≥ 0 | the handle's cumulative `disarmCount` at the row's post-disarm reading — **labeled session-scoped** |
| `hook.sessionCountsAt` | `{ pre: {arm, disarm, at}, post: {arm, disarm, at} }` | the two readings the per-row counts were derived from (`pre` immediately before the row's arm; `post` immediately AFTER the row's own disarm), with their `performance.now()` stamps |

**The derivation rule (pinned).** `rowArmCount = post.arm − pre.arm` and
`rowDisarmCount = post.disarm − pre.disarm`, with **`pre`** taken immediately before the
row's `arm()` call and **`post`** taken immediately after the row's own `disarm()` —
the post-disarm reading the drain evaluate already performs (`after = window.__o0.read()`;
today only `after.disarmedAt` is consumed — §1.2). A row that derives its counts from the
**pre-disarm** reading is `pass:false` naming the reading order (§6 `FS4`).

**The legacy aliases.** The bare `hook.armCount` / `hook.disarmCount` are **retired**: a
field whose name implies a per-row count while carrying a session total IS the `M2` defect.
A row carrying either without the explicit names above is `pass:false` with
`hook.armCount/hook.disarmCount are retired session aliases (M2) — report
hook.rowArmCount/hook.rowDisarmCount and hook.sessionArmCount/hook.sessionDisarmCount`
(§6 `FS9`).

**The invariant (register `P-SM-1`).** `0 ≤ rowArmCount − rowDisarmCount ≤ 1` on EVERY row;
exactly `1 / 1` on every row whose `hook.armed === true` and whose drain completed; exactly
`0 / 0` on the deliberately UNARMED baseline row (the repeat block's unarmed run, whose
`hook.armWindow` is already `null`); and `sessionArmCount ≥ rowArmCount` +
`sessionDisarmCount ≥ rowDisarmCount` on every row.

### 2.3 `M3` — the pinned long-task attribution rule

**The pinned rule: `start-inside-inclusive`.** The row's PRIMARY ORACLE
`longTaskTotalMs` is **unchanged** and stays "the sum of the `duration` of every long-task
entry whose `start` satisfies `t0 ≤ start ≤ t1`" — the rule the oracle implements today, kept
verbatim so the O-0 numbers stay comparable with the motivating evidence
(`docs/defects.md` `HEAVY-OPS-FREEZE-THE-PAGE`: the 439/505 ms long tasks) and with runs 1-4.
It is **documented on the report** and **asserted** (register `P-TP-3`), with the two
alternatives explicitly NOT implemented:

| rule | definition | status |
| --- | --- | --- |
| **`start-inside-inclusive`** (PINNED) | `t0 ≤ start ≤ t1`; the FULL `duration` is added | implemented (the oracle), documented, asserted |
| `overlap-any` | the task overlaps `[t0, t1]` at all (start before `t0` counts) | **NOT implemented**; recorded as the discriminated alternative |
| `intersection` | `min(end, t1) − max(start, t0)` per task, clamped at 0 | **NOT implemented**; recorded as the discriminated alternative |

**The attribution record (additive, on every freeze row).**
`hook.longTaskAttribution` = `{ rule: 'start-inside-inclusive', window: { t0, t1 },
includedCount, includedMs, startBefore: [{ start, duration, overlapMs }],
straddlesEnd: [{ start, duration, overlapMs }], startBeforeOverlapMs, straddleEndMs,
overlapAnyMs, intersectionMs, ambiguous: bool, ambiguityReason: string|null }`, where
`overlapAnyMs` and `intersectionMs` are the totals the two rejected rules WOULD produce on
the same observed task list (recorded for discrimination only, never used as the oracle).

**The ambiguity condition (pinned).** The attribution is **ambiguous** iff a long task was
observed that starts before `t0` and ends after `t0` (`startBefore` non-empty with
`overlapMs > 0`) **or** that starts inside and ends after `t1` (`straddlesEnd` non-empty
with `overlapMs > 0`). On an ambiguous row: `ambiguous: true`, a non-empty
`ambiguityReason` naming the observed task(s) and the pinned rule, and the row keeps its
`longTaskTotalMs` — an **excluded** `startBefore` task with `overlapMs` greater than
`hook.toleranceMs` is legal ONLY together with that recorded reason (§6 `FS5`). A row whose
`includedMs` does not equal its own `longTaskTotalMs`, or whose `longTaskTotalMs` equals
`overlapAnyMs` or `intersectionMs` while claiming the pinned rule, is `pass:false` (§6
`FS5` — the rule-mismatch class).

**The pass-level totals.** Each pass sub-row carries its own `longTaskTotalMs` (the same
rule applied to the pass's window). Their sum is **NOT** required to equal the row total —
mis-reading the difference as an error is itself a review finding. **The field is
`hook.passLongTaskDoubleCountMs` and it is a MEASURE, i.e. non-negative by construction
(RUL-11 / §12.4, the `F5-2` fix — the FIFTH run emitted −53 / −95 / −63 by defining the field
as the SIGNED difference `Σ(pass totals) − row total`, which is negative whenever a long task
starts inside the freeze window but outside every pass window).** The pinned definition is
the **sum of the `duration` of every observed task counted (start-inside) by TWO OR MORE
pass windows** (equivalently: `Σ(pass totals) − |⋃ over passes of the tasks each pass
counted|`), which is `0` when no task is counted twice and `> 0` exactly when the pass
windows are not disjoint in their counted tasks — so **S10's `> 0` case is a possible value,
not an invariant**. A NEGATIVE `passLongTaskDoubleCountMs` is a computation defect:
`pass:false` with the reason naming the number, the row and the field (§6 `FS11`). The
signed diagnostic difference, if retained at all, is recorded under a differently named field
(`passTotalsMinusRowMs`) labeled `notADoubleCount:true` — never as
`passLongTaskDoubleCountMs`.

### 2.4 The invariant this unit exists for

**No row, no pass, no cell and no verdict may carry a NEGATIVE residual/remainder — and no
MEASURE field may carry a negative value.** The union accounting of §2.1 makes a negative
remainder unreachable; if one is presented it is `pass:false` with a reason naming the
number, the row and the field (§6 `FS1`). **AMENDED (RUL-11 / §12.4, the `F5-2`/`F5-3`
fix): the same rule now covers EVERY field this unit introduces or retains as a MEASURE —
`unaccountedMs` (row and pass), `accountedMs`, `overlapMs`, `sumOfSpansMs`,
`passLongTaskDoubleCountMs` and `passOverlapSumMs` are all non-negative by construction, and
a negative value in any of them is `pass:false` with the field named (§6 `FS11`).** The
signed difference `Σ(pass totals) − row total` and the signed difference
`Σ(pass unaccountedMs) − row unaccountedMs` are **diagnostics only**, emitted under
`notAMeasure:true`-style labels (`passTotalsMinusRowMs` / `passRowUnaccountedDeltaMs`) and
never under a measure's name. "Reported as a negative number with no reason" is the exact
defect this unit exists to close — and the FIFTH run proved the rule must be stated over the
whole measure set, not only over the remainder (§12.4).

### 2.5a Back-compatibility (RUL-7..RUL-10) — the new shape gates the NEW surface only

**RECORDED BY THE ARCHITECT — binding; landed as the amendment after the TestWriter's red
run exposed two conflicts (§7.1). The new clauses do NOT enter the pre-existing validators:
the contract is split by ROW CLASS.** (This block is numbered `§2.5a` on purpose: the
pre-existing `§2.5` table below keeps its number so that every in-tree citation of `§2.5`
— the red set's own `MISSING`/`§2.5 pins …` messages included — stays true.)

- **RUL-7 — the new shape gates the NEW surface only (back-compatible).** The clauses of
  §2.1-§2.4 and §6 (`FS1`, `FS8`, `FS9`, `FS10`) are carried by the **four NEW pure
  exports** of `src/shared/o0-report.ts` —
  **`partitionO0RowPasses(row)`**, **`deriveO0LongTaskAttribution(window, longTasks,
  opts?)`**, **`deriveO0RowArmCounts(hook)`**, **`validateO0MeasurementShape(row)`** (the
  exact names the red set pins: `tests/unit-o0-m1-m3-measurement-shape.test.ts` `:37-51`
  and its call sites `:411`/`:608`/`:653`/`:772`, plus the driver call site pinned at
  `tests/unit-o0-m1-m3-driver-contract.test.ts:89`) — **plus any row/report that OPTS INTO
  the new shape** (a row carrying `hook.passes[]`). The PRE-EXISTING validators
  **`validateO0Run`**, **`validateO0Report`** and **`reconcileO0PostStyle`** keep their
  CURRENT clause sets, signatures and return shapes for legacy-shaped rows: the O-0
  suites' **114 tests stay green UNMODIFIED** (`tests/unit-o-0-report-contract.test.ts`
  **50** + `tests/unit-o-0-hook-contract.test.ts` **39** +
  `tests/unit-o-0-driver-contract.test.ts` **25**; counted in-tree 2026-09-21), and the
  FOURTH-edition artifact's embedded raw JSON remains re-validatable **as-is**. **No
  re-pin, no rewriting and no weakening of any O-0 row is owed or permitted** — the unit's
  red baseline is its OWN pins in the two new files, never a rewritten suite (§7.1/§10).
- **RUL-8 — `FS10`/`S14` apply at the new surface.** The "legacy row missing
  `hook.passes`" rule (`FS10`) and the retired-alias rule (`FS9`) fire ONLY when a row is
  fed to the NEW oracle/validator, or when a report DECLARES the new shape but omits a
  required field. They MUST NOT fire from `validateO0Run`'s pre-existing clause set (that
  is exactly what would break the 114). A legacy (fourth-edition) row fed to the NEW
  surface gets an explicit **`legacyShape: true`** outcome carrying its reason
  (`legacyShapeReason`, naming the row class and the missing new-shape fields) — **never a
  silent pass and never a spurious measurement failure**: the row's own numbers are NOT
  impugned, its shape CLASS is named, and the row is refused AT THE NEW SURFACE
  (`ok:false`), which is what the red set's `FS9`/`FS10`/`S14` groups assert.
  **Red-set status of `legacyShape`/`legacyShapeReason` (stated honestly):** these two
  outcome fields are introduced by THIS ruling. The red set pins the four oracle exports and
  the `ok:false` + reason observables for the legacy-row cases, **not** these two field
  names, so no green pin currently forces them — they are owed by RUL-8 and gated by §10.10
  (c), and their absence is a doc-review finding rather than a red test.
- **RUL-9 — the fifth edition.** The new shape lands in the **REGENERATED** artifact
  (§3.7/§10: the FIFTH edition); runs 1-4 stay in the artifact's own supersession record.
  The new clauses apply to the **fifth edition's rows**; the earlier editions' JSON stays
  valid under the legacy path, so a future re-validation of a superseded edition does not
  spuriously fail.
- **RUL-10 — the live-only pins stay legitimately red until the fifth run.** `LIVE-1` and
  `LIVE-2` (`tests/unit-o0-m1-m3-driver-contract.test.ts:260-299`) are asserted on the
  **COMMITTED artifact** (the fifth edition: the banner naming runs 1-4 SUPERSEDED,
  `verified:true`, the new shape present on the rows, no numeric `residual`, no numeric
  bare `armCount`, no negative `unaccountedMs`, still `OPEN-structural`) and **cannot be
  green in node before the re-run**. They are recorded as this unit's **live-gate rows**
  (RCA-11): stubbing them, parking the battery or rewriting the pins is a review finding.

**The composition — which validator is AUTHORITATIVE for which row class.**

| row class | authoritative surface | the other path |
| --- | --- | --- |
| **NEW-shape row/report** (carries `hook.passes[]`, or is deliberately fed to a new oracle) | the **NEW surface** — `partitionO0RowPasses`, `deriveO0LongTaskAttribution`, `deriveO0RowArmCounts`, `validateO0MeasurementShape`; authoritative for `FS1`/`FS8`/`FS9`/`FS10` and for the union-accounted remainder | the legacy clauses may ALSO be applied **where they still apply** (stage-id totality, finiteness, unseparated/never-imputed, the RUL-4 status family, the window bound, the census/gesture/bundle gates) — with the legacy residual reconciliation a RECORDED note, never a forcing reason (the existing `validateO0Report` already records it so: `src/shared/o0-report.ts:1351-1370`) |
| **LEGACY-shaped row** (fourth edition and earlier: bare `hook.armCount`/`disarmCount`, no `hook.passes`, no per-record timestamps) | the **legacy path** — `validateO0Run` + `validateO0Report` + `reconcileO0PostStyle`, clause set UNCHANGED | the NEW surface is authoritative only when such a row is deliberately fed to it, and then it is refused **by class** with `legacyShape:true` + the reason — never silently read as new-shape data |

**No row may be validated by BOTH surfaces in a contradictory way.** Where the two would
disagree, the surface that OWNS the row class is authoritative:
(i) a legacy-shaped row's negative naive residual keeps the legacy recorded `ok:false`
reading that the O-0 `P-TP-1` modes 4/7/10 assert — it is **not** a new-shape violation and
must not be re-pointed as one; (ii) a NEW-shape row whose legacy naive formula
(`longTaskTotalMs − Σ(named stages)`, surviving only as `naiveSumResidualMs` +
`notAResidual:true`) reads negative is **LEGAL** — the authoritative quantity there is
`unaccountedMs`; (iii) a row without `hook.passes[]` is a legacy row for shape purposes,
never a new-shape row with a missing field, unless the report DECLARES the new shape
(§6 `FS10`).

**The one additive widening that IS allowed to touch a pre-existing symbol.**
`deriveO0WindowBound` (§4.3) keeps its pinned band source and every existing return field
and verdict **byte-identical on a legacy row**; its new `outsideOffenders[]` is populated
ONLY from the new span data (`hook.stageRecordDetail` timestamps) and is empty on a row
that carries none. It is not one of the three validators of RUL-7 and adds no clause.

### 2.5 The affected fields, records and symbols

| Kind | Symbol / field | Change |
| --- | --- | --- |
| record | `O0HookRecord` (`src/shared/o0-hook.ts`, the interface at the record shape `{stage, ms, startMark, endMark, measureName, error?}`) | **ADD `startMs: number` + `endMs: number`** (the perf-port stamps already taken: `const start = perf.now()` before the body, the commit's `perf.now()`), carried through `o0CopyRecords`. **Additive, pure, inert when unarmed** — the ONLY `src/**` change this unit permits |
| report row | `hook.stageRecordDetail[]` | **ADD `index` (commit index), `startMs`, `endMs`, `depth` (containment depth), `passIndex` (or `null`)** per entry |
| report row | `hook.passes[]` | **NEW** (§4.2), plus `hook.passCount`, `hook.passKindSequence`, `hook.passOverlaps[]`, `hook.passLongTaskDoubleCountMs` |
| report row | `hook.rowArmCount` / `rowDisarmCount` / `sessionArmCount` / `sessionDisarmCount` / `sessionCountsAt` | **NEW** (§2.2) |
| report row | `hook.armCount` / `hook.disarmCount` | **RETIRED** (§2.2) |
| report row | `hook.longTaskAttribution` | **NEW** (§2.3) |
| report row | `postStyle.residual` | **RETIRED** to `null` + `retired:true` + `retiredBy` (§2.1) |
| report row | `reconciliation.{windowMs, accountedMs, unaccountedMs, overlapMs, outsideMs, naiveSumResidualMs, passes[], bandExceeded}` | **NEW**; `reconciliation.residual` **RETIRED** to `null`; `reconciliation.{ok, openStructural, structuralStages, toleranceMs, reason, note}` **unchanged** |
| pure module | `src/shared/o0-report.ts` — `reconcileO0PostStyle(runInput, tolerance)` | **KEPT — the LEGACY path (RUL-7, §2.5a)**: signature, return shape and every branch UNCHANGED, including its naive `longTaskTotalMs − Σ(named)` residual and its negative/out-of-band `ok:false` reading for legacy-shaped rows (the O-0 `P-TP-1` modes 4/7/10 stay green). The NEW union-accounted remainder is produced by `partitionO0RowPasses` (its `row.unaccountedMs`) and is **never** returned by this function. If an implementer nonetheless widens it, the widening must be gated on the new shape (`hook.passes[]` present) and the legacy branch's returns must not move |
| pure module | `src/shared/o0-report.ts` — `deriveO0WindowBound(runInput, opts)` | **ADDITIVE ONLY (gated, §2.5a)**: keeps the row band (`hook.toleranceMs`, no-options default) and every existing verdict/return field byte-identical on a legacy row; the new `outsideOffenders[]` is populated only from the new span data (`hook.stageRecordDetail` timestamps) and is empty otherwise |
| pure module | **`partitionO0RowPasses(row)`** (`src/shared/o0-report.ts`, NEW export) | the pure pass partition + per-pass accounting (§3.2/§3.3); never throws; a legacy-shaped row is refused `ok:false` + `legacyShape:true` + the reason (§2.5a) |
| pure module | **`deriveO0LongTaskAttribution(window, longTasks, opts?)`** (`src/shared/o0-report.ts`, NEW export) | the pinned rule + the two discriminated alternatives + the ambiguity record (§2.3); never throws |
| pure module | **`deriveO0RowArmCounts(hook)`** (`src/shared/o0-report.ts`, NEW export) | the per-row/session arm-count derivation + the `P-SM-1` invariant over the two readings (§2.2/§3.5); never throws; no count is ever coerced to 0 (`FS4`) |
| pure module | **`validateO0MeasurementShape(row)`** (`src/shared/o0-report.ts`, NEW export) | the NEW-surface validator (§2.5a): carries the `FS1`/`FS8`/`FS9`/`FS10` clauses for NEW-shape rows, returns `{ok, errors[], failReasons[]}`, and refuses a legacy-shaped row as `legacyShape:true` (never a silent pass); never throws |
| pure module | `src/shared/o0-report.ts` — `validateO0Run` | **UNCHANGED (RUL-7/§2.5a)**: the `FS1`/`FS8`/`FS9`/`FS10` clauses are **NOT** added here; the pre-existing clause set stays exactly as it is so the 114 O-0 tests and the fourth-edition JSON stay valid |
| driver | `scripts/live-drive.mjs` — `o0FreezeRow` / `o0ApplyPostStyle` / `o0QuiesceAndDrain` / `o0HookArm` / `o0RowPass` / `o0DeriveReportPass` | the row assembly writes the new fields, the drain returns the post-disarm reading, and `o0RowPass` calls the THREE new pure oracles (`partitionO0RowPasses` / `deriveO0LongTaskAttribution` / `deriveO0RowArmCounts` — the driver-contract pin at `tests/unit-o0-m1-m3-driver-contract.test.ts:89`) with **no in-driver mirror**; the retired residual is emitted `null` + `retired:true` at its own site (§4.1); **the in-driver twin of `o0ApplyPostStyle` must agree with the module's branch** (the `§3a` finding-3 rule) |

**The names in this table are the contract; an implementer may add fields but may not
rename or drop these, and may not emit an undocumented field whose name implies a per-row
or per-pass meaning it does not have.**

---

## 3. The harness surface (what changes, exactly)

### 3.1 The per-record timestamp contract

Every committed record carries the timestamps of its own span in the **same monotonic clock
domain** as the `o0:t0`/`o0:t1` marks and the long-task entry `start` fields (the page's
`performance.now()` domain):

- `startMs` — the stamp taken immediately before the recorded body runs (the existing
  `const start = perf.now()`);
- `endMs` — the stamp taken at commit (the existing `perf.now()` whose difference produces
  `ms`), so `endMs ≥ startMs` and `endMs − startMs` is the record's `ms` within µs rounding;
- the fields are copied through `o0CopyRecords` and exposed by `records()` unchanged in
  every other respect (no reordering, no added work, no behavior change).

**An entry without finite timestamps is a `pass:false` reason (§6 `FS10`)** — the partition
cannot be derived positionally from the NON-unique mark names (`o0:<stage>:start`/`:end`
repeat per stage: `src/shared/o0-hook.ts:261-263`), and reconstructing them by matching
measures would be a second implementation of a contract the recorder already owns.
**Scope of that rule (RUL-8/§2.5a): it is a NEW-surface clause.** A LEGACY (fourth-edition)
row is not required to carry `startMs`/`endMs` and is never failed for their absence by the
legacy path; the rule fires when the row is fed to the NEW oracle/validator (which then
reports it, with `legacyShape:true` where the row is legacy-shaped by class).

### 3.2 The pass partition (a DECIDABLE rule — the TestWriter's oracle)

Given a row's records in **commit order** (`hook.stageRecordDetail` order = the recorder's
`records()` order = commit order):

1. **Containment.** Record *a* CONTAINS record *b* iff
   `a.startMs ≤ b.startMs ∧ b.endMs ≤ a.endMs ∧ (a.startMs < b.startMs ∨ b.endMs < a.endMs)`
   (strict containment: an identical interval is NOT containment, see 5). `depth` = the
   number of records that contain it; `top-level` = `depth === 0`.
2. **Openers.** A **top-level** record whose stage is `snapshot.pull` is a **pass opener**.
3. **Passes.** In commit order, pass *i* begins at its opener and contains **every record
   committed from that opener up to (exclusive) the next opener's commit index** —
   including records NESTED inside any of them. The records committed before the FIRST
   opener form pass **0**, `kind: 'pre-pass-render'` (a render-only sequence with no
   derivation record). Every later pass is `kind: 're-derive'`.
4. **Totality.** Every record belongs to **exactly one** pass. `Σ pass.records.count ===
   hook.records`; a record that cannot be attributed is reported (`passIndex: null` +
   the reason) and the row is `pass:false` (§6 `FS2`) — **a record is never silently
   dropped**. A row whose hook was deliberately left UNARMED records `passes: []`,
   `passCount: 0` and `records: 0` (the legal empty case).
5. **Ambiguity (pinned).** Two records with identical `[startMs, endMs]` intervals are
   recorded as a nesting ambiguity (`hook.nestingAmbiguities[]` with both stage ids + the
   interval + their commit indices) and the row is `pass:false` (§6 `FS3`) — the shape may
   not guess which one is outer.
6. **Windows (AMENDED — RUL-11 / §12.4 `F5-4`; the FIFTH run's `{0,0}` collapse is
   unreachable).** `pass.window = { t0: min(startMs over the pass's RECORDS),
   t1: max(endMs over the pass's RECORDS) }`, `ms = t1 − t0` — **the pass's OWN record
   span, nested records INCLUDED, never the top-level records alone.** The former
   top-level-only form made pass 0 (the pre-pass render, whose 2/4 records are all
   `depth:1` under the containment forest computed over the WHOLE row) collapse to
   `{t0:0, t1:0, ms:0}` with a real measured span of 51.4/93.8/0.5/0.3/61.1/100.3 ms, so
   that span entered `accountedMs` NOWHERE and left the passes' attribution short of the
   row remainder by exactly that deficit (F5-3's negative `passOverlapSumMs`, F5-4). Two
   pinned COVERAGE properties replace it:
   (a) **containment is local to the pass** — a record belongs to the pass in whose index
   run it was committed (§3.2 clause 3), and the pass's TOP-LEVEL set is the depth-0 set
   computed **within that pass** (a record contained only by a record of a LATER pass is
   top-level in its own pass; a record contained by a record of its OWN pass is nested);
   (b) **no top-level span falls outside every pass window** — `⋃ pass.windows ⊇` every
   top-level span's interval ∩ the freeze window, and `Σ pass.window.ms` is at least the
   freeze window's span wherever the freeze window is covered by records. A row violating
   (a) or (b) is `pass:false` with the reason naming the record index and the pass (§6
   `FS12`). The row's freeze window is unchanged (`hook.freezeWindow`, `o0:t0`/`o0:t1`), and
   every pass's window must still lie inside it within the recorded band (§4.2/`FS6`).

### 3.3 The accounting (union) rule

- **`pass.accountedMs`** = `|⋃(the pass's top-level spans ∩ pass.window)|` — the measure of
  the union of intervals, computed by interval merging (sort by `startMs`, merge overlapping
  and touching intervals, sum the merged lengths). **The SUM of the same spans is recorded
  only as `pass.sumOfSpansMs` with `notAccounted: true`** — never as `accountedMs`.
- **`pass.unaccountedMs`** = `pass.window.ms − pass.accountedMs` (**≥ 0**).
- **`pass.overlapMs`** = `pass.sumOfSpansMs − pass.accountedMs` (**≥ 0**; 0 iff the pass's
  top-level spans are pairwise disjoint). A non-zero value is legal and RECORDED (it is the
  nested/overlapping-span evidence).
- **row `accountedMs` / `unaccountedMs`** = the same union over **all** top-level spans of
  all passes against the freeze window; the row's value is authoritative, the per-pass
  values are the attribution layer, and their sum may exceed the row's value when pass
  windows overlap — that difference is recorded and is never an error. **AMENDED (RUL-11 /
  §12.4, the `F5-3` fix): `reconciliation.passOverlapSumMs` is a MEASURE and is
  non-negative by construction — the measure of the INTERSECTION of the pass windows (the
  union-consistent overlap of the passes' attribution layer), or `0` when the pass windows
  are pairwise disjoint. The signed difference `Σ(pass.unaccountedMs) − row.unaccountedMs`
  is a DIAGNOSTIC only** (the FIFTH run's −131.2 / −12.5 / −25.6 / −26.7 / −83 / −17.6 read
  exactly that difference while the field name promised an overlap measure) and is recorded
  under `passRowUnaccountedDeltaMs` with `notAMeasure:true`. A negative
  `passOverlapSumMs` is `pass:false` (§6 `FS11`). **The passes' deficit vs the row must be
  ZERO wherever the pass windows cover the row's top-level spans (§3.2 clause 6 (b))**: with
  the pass-0 coverage rule the fifth-run deficit (131.2 ms = the un-attributed pass-0 span)
  becomes unreachable, and any residual deficit is a recorded `FS12`/`FS11` failure, never a
  silent negative.
- **`outsideMs`** = the measure of any top-level span **outside** the freeze window. A
  non-zero `outsideMs` beyond the recorded band is `pass:false` naming the record index and
  the overshoot (§6 `FS6`) — the H3 window-bound rule, extended to the new span data.

### 3.4 The long-task attribution record

Implemented by `deriveO0LongTaskAttribution(window, longTasks, opts?)` and emitted on every
row as `hook.longTaskAttribution` (§2.3). The **primary oracle** `longTaskTotalMs` keeps its
meaning and its value; the record adds the alternative totals, the straddling observations
and the ambiguity flag. The oracle is RE-DERIVED (never asserted true) and the row's own
numbers are cross-checked against the recorded **OBSERVED** list (`longTasks[]`, the list the
observer recorded inside the window) — **AMENDED (RUL-13 / §12.5, the `RULE-2` red): the
pinned cross-check is `includedCount ≤ longTasks.length` AND `includedMs === longTaskTotalMs`,
NOT `includedCount === longTasks.length`.** The former `===` form is UNSATISFIABLE on any
honest row whose observed list contains an EXCLUDED task: the pinned rule sums only the
tasks that START inside `[t0, t1]`, so a list that also carries the recorded `startBefore` /
after-`t1` observations necessarily has `longTasks.length > includedCount`. Additional pinned
consistency clauses: every task NOT counted by the rule must be RECORDED in the attribution
record (`startBefore` for a task with `start < t0`, `straddlesEnd` for a task that starts
inside and ends after `t1`, and a recorded count of the tasks with `start > t1`), so the
excluded observations are never silently absent from the record. A mismatch is `pass:false`
(§6 `FS5`).

### 3.5 The per-row arm/disarm counts

`o0HookArm` returns the **pre-arm** reading (the session counts + `performance.now()`
immediately before `arm()`); the drain evaluate returns the **post-disarm** reading
(already taken as `after` — §1.2); the row assembly writes `hook.sessionCountsAt`,
`hook.rowArmCount` / `hook.rowDisarmCount` (the deltas) and
`hook.sessionArmCount` / `hook.sessionDisarmCount` (the post-disarm cumulative readings).
No new page-side code path, no second handle, no reset of the session counters (the
cumulative readings must stay cumulative so the derivation is checkable).

### 3.6 Blocks, args, CLI, corpus — UNCHANGED

The 5 block names (§3.1 of the O-0 spec), the `--gpu` / `--o0-corpus=` / `--o0-out=` /
`--corpus-root=` / `--strict-seed` flags, the pinned seed `o0-2026-09-17`, the pinned SIZE
(226 documents), the two hit-tested gestures, the GPU pairing, the `display:block` ablation
and the repeat-determinism block are **untouched**. No new flag is pinned by this unit.

### 3.7 Bundle identity + the mandatory live re-run (RCA-11)

`driver.build.verified === true` on both legs stays a gate (§3.6 of the O-0 spec;
`docs/live-testing.md:119-124`: rebuild, start, compare the SERVED bundle with the on-disk
file). Because this unit CHANGES the harness (the driver's row assembly + the pure oracle),
the prior live provenance is invalidated: **the committed artifact is REGENERATED as its
FIFTH edition by a live re-run of the same two legs on a freshly built bundle** — parked
instead of run is a review finding (RCA-11, `AGENTS.md` item 11), and no unit may be
reported DONE on a fourth-edition artifact.

---

## 4. The report-shape contract (the additions)

### 4.1 The row delta (`runs[]`)

Every existing field keeps its meaning. Additive:

```json
{
  "id": "o0-document-row-gpuoff-r1",
  "stages": [ "<UNCHANGED>: the 11-id set, each once, per-id SUMS over records" ],
  "longTaskTotalMs": 2162,
  "hook": {
    "records": 22,
    "passCount": 3,
    "passKindSequence": ["pre-pass-render", "re-derive", "re-derive"],
    "passes": [ <§4.2> ],
    "passOverlaps": [ { "a": 1, "b": 2, "overlapMs": 12.4 } ],
    "passLongTaskDoubleCountMs": 46.1,
    "nestingAmbiguities": [],
    "stageRecordDetail": [
      { "index": 0, "stage": "render.dom", "instance": "renderer", "ms": 27.4,
        "startMs": 9865.2, "endMs": 9892.6, "depth": 0, "passIndex": 0 }
    ],
    "longTaskAttribution": {
      "rule": "start-inside-inclusive",
      "window": { "t0": 9861.6, "t1": 12129.1 },
      "includedCount": 2, "includedMs": 2162,
      "startBefore": [], "straddlesEnd": [],
      "startBeforeOverlapMs": 0, "straddleEndMs": 0,
      "overlapAnyMs": 2162, "intersectionMs": 2149.9,
      "ambiguous": false, "ambiguityReason": null
    },
    "armWindow": { "t0": 9862.1, "t1": 12129.1, "ms": 2267.0 },
    "freezeWindow": { "t0": 9861.6, "t1": 12129.1 },
    "toleranceMs": 40,
    "rowArmCount": 1, "rowDisarmCount": 1,
    "sessionArmCount": 2, "sessionDisarmCount": 2,
    "sessionCountsAt": { "pre": { "arm": 1, "disarm": 1, "at": 9861.9 },
                         "post": { "arm": 2, "disarm": 2, "at": 12129.2 } }
  },
  "postStyle": { "ms": null, "unseparated": true, "source": "derived", "timed": false,
                 "derived": true, "derivedNote": "…", "attributable": false,
                 "residual": null, "retired": true,
                 "retiredBy": "O0-M1-M3-MEASUREMENT-SHAPE (M1)" },
  "reconciliation": {
    "ok": false, "openStructural": true, "toleranceMs": 50,
    "windowMs": 2267.5, "accountedMs": 2212.7, "unaccountedMs": 54.8,
    "unaccountedReason": null,
    "overlapMs": 1812.7, "outsideMs": 0, "passOverlapSumMs": 0,
    "bandExceeded": false,
    "naiveSumResidualMs": -1863.4, "naiveSumResidualNote": "notAResidual",
    "passes": [ { "index": 0, "kind": "pre-pass-render", "spanMs": 96.7,
                  "accountedMs": 96.7, "unaccountedMs": 0 } ],
    "residual": null, "retired": true,
    "reason": "<UNCHANGED shape: the unseparated stage reason>",
    "note": "<UNCHANGED: §3.6b RUL-4 clause 5>"
  },
  "pass": false,
  "failReasons": []
}
```

**The numbers in this block are ILLUSTRATIVE ONLY** — they show the shape, not a reading.
No number in this spec is a measurement; only the regenerated **NINTH-edition** artifact
carries measurements.

**`reconciliation.unaccountedReason` (named here because the field set of the first draft
omitted it — §13.7 (8)):** the ROW-level sibling of the pass-level `unaccountedReason`. It is
`null` on every row whose remainder IS a finite number (the number form needs no reason — the
ninth run reads `null` on all six rows, artifact §8.4 (d)) and it carries the named
structural/partition reason **only** on the `null` form (§2.1(iii)/`S12`); a `null` remainder
without it is `FS1`/`RA-4a`.

### 4.2 The pass sub-row (`hook.passes[i]`)

```json
{
  "index": 1,
  "kind": "re-derive",
  "opener": { "stage": "snapshot.pull", "recordIndex": 4 },
  "window": { "t0": 9990.1, "t1": 12112.1, "ms": 2122.0 },
  "records": { "indices": [4, 5, 6, 7, 8, 9, 10, 11, 12], "count": 9,
               "nestedCount": 2 },
  "stageCount": 11,
  "stages": [ { "id": "snapshot.pull", "ms": 118.3, "unseparated": false,
                "source": "hook", "structural": false, "structuralReason": null } ],
  "topLevelSpans": [ { "index": 4, "stage": "snapshot.pull", "startMs": 9990.1,
                       "endMs": 10108.4 } ],
  "sumOfSpansMs": 3875.4, "sumOfSpansNotAccounted": true,
  "accountedMs": 2080.0, "unaccountedMs": 42.0,
  "overlapMs": 1795.4, "outsideMs": 0,
  "longTaskTotalMs": 2064,
  "pass": true,
  "failReasons": []
}
```

Every arithmetic relation in that block is consistent by construction: `unaccountedMs =
window.ms − accountedMs` (**≥ 0**), `overlapMs = sumOfSpansMs − accountedMs` (**≥ 0**, the
nested-span evidence), `accountedMs ≤ window.ms` and `sumOfSpansMs ≥ accountedMs`.

**The negative case, shown the way the contract emits it** (`FS1`): a pass whose computation
would produce a negative remainder emits

```json
{ "index": 1, "unaccountedMs": null,
  "unaccountedReason": "the span union 2 150.0 ms exceeds the window 2 122.0 ms — the span set or the window is wrong (M1/FS1)",
  "pass": false,
  "failReasons": ["unaccountedMs would be negative (2 122.0 − 2 150.0 = -28.0) — the union accounting cannot produce a negative remainder (M1: a negative residual is the defect this unit closes)"] }
```

— the FIELD is `null` with the reason, and the negative number appears **only inside the
reason text** as arithmetic evidence, never in a field, table cell or verdict labeled
`residual`/`unaccountedMs`/`remainder`.

**Field rules (each is a review input):**
- `kind ∈ {'pre-pass-render', 're-derive'}` (a closed 2-value set); `kind ===
  'pre-pass-render'` ⇔ `opener === null`; `kind === 're-derive'` ⇔
  `opener.stage === 'snapshot.pull'`.
- `stages[]` carries the **closed 11-id set, each once**, with the pass's own per-id SUMS —
  the same totality, finiteness and `unseparated`/`ms:null` rules as the row's `stages[]`
  (`P-IM-2`/`F1`/`F4` of the O-0 spec apply verbatim to every pass).
- **The aggregation identity:** for each of the ten record-producible ids,
  `row.stages[id].ms === Σ over passes of pass.stages[id].ms` (and `unseparated` only when
  every pass is unseparated for that id). `post.style` is excluded (derived per pass; the
  row's value follows §2.1 clause 5). A mismatch is `pass:false` (§6 `FS2`).
- `records.indices` must be a strictly increasing run of commit indices, disjoint across
  passes, and their union must be `0..records-1`.
- `window.ms` must be a non-negative finite number and must lie inside the row's freeze
  window within the recorded band (a pass window outside it beyond the band is §6 `FS6`).
- `sumOfSpansMs ≥ accountedMs ≥ window.ms − unaccountedMs` and `overlapMs = sumOfSpansMs −
  accountedMs` (**≥ 0**); `unaccountedMs` is `null` **only** with a named reason, and when
  present it is `≥ 0`.
- `pass = (failReasons.length === 0)`; a pass with `failReasons` non-empty forces the row
  `pass:false` (the row's `failReasons` include the pass's, prefixed by the pass index).

### 4.3 The window bound (unchanged rule, extended data)

`deriveO0WindowBound(run)` keeps its pinned band source (§3.2.1 of the O-0 spec: the
row-RECORDED `hook.toleranceMs`, no-options default 40 ms; the three consumers agree) and its
`ms ≤ longTaskTotalMs + band` rule for every separated stage, **plus** the new
`outsideOffenders[]` (a top-level span extending outside the freeze window beyond the band).
The `WINDOW-BOUND VIOLATED` verdict and the no-percentage rule are unchanged.

### 4.4 The derived verdict forms

| Situation | Pinned form |
| --- | --- |
| a pass reconciles | `pass <i> (<kind>) reconciled: window <span> ms − accounteded <accounted> ms = unaccounted <u> ms within the recorded <tol> ms band` |
| a pass exceeds the band | `pass <i> (<kind>) reconciled with the band EXCEEDED: unaccounted <u> ms > the recorded <tol> ms band — reported, never hidden` |
| a pass's remainder is not computable | `pass <i> (<kind>) unaccounted remainder NOT COMPUTABLE: <the named structural/partition reason>` |
| a row's remainder | `row <id>: unaccounted <u> ms of the <window> ms measured window over <n> pass(es) (<kinds>) — DERIVED remainder, attributable:false, never a style/layout cost` |
| the row remainder exceeds the band | `row <id>: unaccounted <u> ms of the <window> ms measured window EXCEEDS the recorded <tol> ms band (<n> pass(es)) — the remainder is reported, never attributed` |
| a negative value would be presented | `row <id>: unaccountedMs would be negative (<window> − <union> = <n>) — the union accounting cannot produce a negative remainder (M1)` — **and the negative number appears ONLY inside the reason as arithmetic evidence, never in a field, table cell or verdict** (the field is `null`) |
| the long-task rule | `row <id>: longTaskTotalMs <total> ms is the START-INSIDE-INCLUSIVE sum over [<t0>, <t1>] (<n> task(s)); the rejected alternatives would read overlap-any <a> ms / intersection <i> ms (M3/RUL-shape)` |
| the per-row arming | `row <id>: armed by THIS row (rowArmCount 1, rowDisarmCount 1; session arm <n> / disarm <m> at the post-disarm reading)` |
| `post.style` while a stage is unseparated | **the existing `O-0 REPORT OPEN …` / no-imputation forms, unchanged** + `the derived post.style value stays unseparated (<ids>): the computed remainder is reported at reconciliation.unaccountedMs and is NOT the post.style value` |

Every form is **computed** (D-GP-UFA-3): no verdict is hard-coded, and a verdict whose
required fields are absent emits the schema-error form instead.

---

## 5. §5.x Property register (PBT) — typed, ≤8 rows

Register convention (imported, unchanged): rows typed **P-IM** (input-model), **P-SM**
(state-model), **P-TP** (transform) — **never F-rows, never §6/FS-n**; **≤8 rows, at most
100 attempts/row**; budget stated as `Σ(attempts/row)`. **CORRECTED (2026-09-21, the ninth-run
pass — the earlier "360 landed of the 800 ceiling" wording was the ORIGINAL landing budget and
left the re-audit extension out): the register now lands 6 rows × 60 = 360 attempts PLUS the
FOUR EXTENDED rows landed against §13.1 (1)(2)(4) by the §3b re-audit
(`tests/unit-o0-m1-m3-reaudit-pins.test.ts` §5: the four affected rows — `P-IM-1`, `P-TP-2`,
`P-TP-1`, `P-SM-1` — at 4 × 8 = 32 attempts, stop-after-5) = **392 attempts landed of the
400 ceiling (4 × 100 per register surface), ≤100/row, 6 rows + 4 extended rows**. Both
`sweep()` families stop after 5 consecutive holds, and both budget self-checks are green
(`BUDGET §5` 360 ≤ `PBT_TOTAL_CEILING`, `BUDGET (EXTENDED)` 4 × 8 = 32 ≤ 100/row).**

**Landing at 6 rows: 60 attempts each → 360 landed**, stop-after-5 in every row, with the
constants recorded in the test files' own `PBT_ATTEMPTS`-style constant (`PBT_ATTEMPTS = 60`,
`PBT_STOP_AFTER = 5`, `PBT_TOTAL_CEILING` = 400).

**Where the property layer runs:** the two PURE modules — `src/shared/o0-report.ts` (the
report schema, the four NEW exports `partitionO0RowPasses` / `deriveO0LongTaskAttribution` /
`deriveO0RowArmCounts` / `validateO0MeasurementShape`) and `src/shared/o0-hook.ts` (the
recorder's record fields) — under `npm test` (`tests/unit-o0-m1-m3-measurement-shape.test.ts`,
NEW, the six rows below). **The three pre-existing O-0 suites
(`tests/unit-o-0-report-contract.test.ts` 50 rows, `tests/unit-o-0-hook-contract.test.ts` 39,
`tests/unit-o-0-driver-contract.test.ts` 25) keep their rows UNMODIFIED** — no re-pin is owed
under RUL-7 (§2.5a/§7.1): their fixtures carry the pre-unit shape on purpose (bare
`hook.armCount`/`disarmCount`, no `hook.passes[]`, no per-record timestamps) and their rows
are read by the LEGACY path, which this unit does not touch. **A register green is
schema-green, never app-green (RCA-12)**; the MEASUREMENT runs live (§10).

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer covered |
| --- | --- | --- | --- | --- | --- |
| `P-TP-1` | TP | **NO NEGATIVE REMAINDER, and the accounting is UNION-based (M1).** For every row and every pass: `accountedMs = |⋃(top-level spans ∩ window)|`, `unaccountedMs = windowMs − accountedMs ≥ 0`, `overlapMs = sumOfSpansMs − accountedMs ≥ 0`; **AMENDED (RUL-11 / §12.4 — the `FIX-TP1` red): the identity is verified against the CLIPPED union**, i.e. `row.accountedMs` and `row.unaccountedMs` are derived from the SAME clipped union so `unaccountedMs === windowMs − accountedMs` holds exactly (the pre-amendment implementation took the row remainder from the RAW unclipped union while reporting the CLIPPED `accountedMs`, so the two disagreed on any row whose top-level spans extend past the freeze window — a clamped-away overshoot in one and a full count in the other, which can even drive the remainder negative; the pinned fix is `rowUnaccountedMs = windowMs − rowAccountedMs`); the retired naive form is never returned as a residual. | `strat:o0-union-accounting` — rows/passes built from a span skeleton with drawn (`start, end`) pairs: disjoint spans; a nested pair; a partially overlapping pair; two passes whose windows overlap; an empty pass (0 records); a span extending past the window; a `windowMs` drawn below the span union (the impossible case) | the oracle returns `unaccountedMs ≥ 0` on every legal draw **and** `sumOfSpansMs ≥ accountedMs`; the drawn-below-window case returns `ok:false` with the `FS1` reason naming the number **and returns no numeric remainder** (a negative is never a returned residual); `reconciliation.residual`/`postStyle.residual` are `null` + `retired:true` on every draw | report shape (pure) |
| `P-TP-2` | TP | **The PASS PARTITION is TOTAL and nesting-aware (M1).** Every record belongs to exactly ONE pass; `Σ pass.records.count === records`; the passes' index runs are disjoint and cover `0..records-1`; a pass's top-level set is the containment forest's roots; `kind === 'pre-pass-render' ⇔ opener === null`; the per-id aggregation identity holds for the ten record-producible ids. | `strat:o0-pass-partition` — record lists with: one opener; two openers; records before the first opener; a nested chain (depth 2); an unopenable record set (no `snapshot.pull`); a duplicate/equal-interval pair; a record with a missing timestamp; an empty list (the unarmed baseline) | every draw: the union of the passes' index sets equals the full index set (`missing` and `duplicate` both empty) and the aggregation identity holds; a missing timestamp ⇒ `ok:false` naming the record index (`FS10`); an equal-interval pair ⇒ `FS3`; a set with no opener ⇒ a single `pre-pass-render` pass and a named reason, never a dropped record | report shape (pure) |
| `P-TP-3` | TP | **The long-task attribution rule is the PINNED one and the alternatives are discriminated (M3).** `longTaskTotalMs === includedMs` where `included = {e : t0 ≤ e.start ≤ t1}` summing the FULL duration; `overlapAnyMs` and `intersectionMs` are the rejected alternatives; the ambiguity record is exact. | `strat:o0-longtask-attribution` — a generated task list per draw from `{fully-inside, starts-before-ends-inside, starts-inside-ends-after, fully-before, fully-after, zero-duration, exactly-at-t0, exactly-at-t1}` × `{empty list, only-straddling}` | on a list carrying all four classes the three rule totals DIFFER pairwise and the oracle equals the start-inside sum exactly; a row whose `longTaskTotalMs` equals `overlapAnyMs` (or `intersectionMs`) while claiming the pinned rule ⇒ `ok:false` with the `FS5` reason naming all three totals; a `startBefore`/`straddlesEnd` task with `overlapMs > band` and no `ambiguityReason` ⇒ `FS5`; `includedCount !== longTasks.length` ⇒ `FS5` | report shape (pure) + the live oracle |
| `P-SM-1` | SM | **The arm/disarm counters are PER-ROW-bounded (M2).** `0 ≤ rowArmCount − rowDisarmCount ≤ 1` on every row; `1 / 1` on every armed row with a completed drain; `0 / 0` on the unarmed baseline; `sessionArmCount ≥ rowArmCount` and `sessionDisarmCount ≥ rowDisarmCount`; the session counters are labeled. | `strat:o0-arm-counts` — rows over `{pre, post}` reading pairs: the legal 1/1; the one-reading-early 1/0; a double-arm (2/1); an unarmed baseline (0/0); a pre reading after the post reading; missing readings; a row carrying only the retired aliases | the oracle returns `ok:true` **iff** the deltas satisfy the invariant AND `sessionCountsAt` is present AND the retired aliases are absent; each violation returns its own named reason (`FS4` for a count mismatch, `FS9` for the retired aliases) and never coerces a missing count to 0 | report shape (pure) |
| `P-SM-2` | SM | **The DEC-1 separation discipline holds under the NEW shape.** While any pass contains an `unseparated` stage: `postStyle.ms === null ∧ unseparated === true ∧ attributable === false ∧ residual === null`, the reconciliation reason names the unseparated ids, and no pass/per-row remainder is presented as a stage cost or as "style/layout/paint". | `strat:o0-dec1-discipline` — rows over `{a structural stage in pass 1, an unmeasured (non-structural) stage, all stages measured, a computed remainder above the band}` | the oracle returns `ok:true` **iff** the unseparated branch keeps `ms:null`+`unseparated`+`attributable:false` AND every remainder field is labeled `derived`; a row presenting a remainder as a stage cost / a style figure / a measured `post.style` value ⇒ `ok:false` with the `FS8` reason naming the field and the value | report shape (pure) |
| `P-IM-1` | IM | **The new per-record and per-pass fields are TOTAL and FINITE.** Every `stageRecordDetail` entry carries a unique `index`, finite `startMs`/`endMs` with `endMs ≥ startMs`, an integer `depth ≥ 0` and a `passIndex` that is an integer or `null` with a reason; every pass carries the closed field set of §4.2 with the closed 11-id `stages[]` set. | `strat:o0-shape-fields` — generated entries/rows over `{startMs, endMs}` in `{NaN, Infinity, -1, 0, 1e6, endMs < startMs, missing}`, `depth` in `{0, 1, 3, -1, '1', missing}`, `passIndex` in `{0, 2, null, 'x', missing}`, a pass missing `kind`/`window`/`stages`, a pass with 10 or 12 ids | every illegal value returns `ok:false` naming the **field path** (never a coerced id/index); a legal row returns `ok:true` with an empty `errors[]`; no value is imputed (a missing `startMs` is never treated as 0) | report shape (pure) |

**No-pad rationale (the honest record).** Six rows, each with a counterexample class no
sibling can fail on: `P-TP-1` is the union-accounting arithmetic (the `M1` core), `P-TP-2`
the partition's totality (records→passes), `P-TP-3` the rule discrimination (`M3`), `P-SM-1`
the counter scoping (`M2`), `P-SM-2` the DEC-1 preservation (the shape's guard rail),
`P-IM-1` the field totality (the input-model half). Two further candidates were considered
and **NOT** entered, because neither is genuinely invariant:
1. *"the pass kind sequence is stable across runs"* — **false as an invariant**: the number
   and kind of passes is APP BEHAVIOR (a future app change may legitimately perform one
   re-derive instead of two). It is instead a **recorded provenance** fact of the
   regenerated artifact (§10) and a review input, exactly like the corpus byte counts.
2. *"`longTaskTotalMs` equals the sum of the per-pass totals"* — **false by construction**
   under a start-inside rule (a straddling task is counted in both passes); entering it
   would pin an arithmetic error as a property.
**Padding the register with either would be a review finding.** No O-0 register row is
weakened, renumbered or folded by this unit; and **no O-0 register row is RE-PINNED either
(RUL-7/§2.5a/§7.1 — this supersedes the earlier "the residual-formula clause is re-pinned"
wording).** The two rows named `P-TP-1` are **two rows on two surfaces, resolved by the
surface**: (i) the O-0 spec's `P-TP-1` (`docs/specs/unit-o-0-per-stage-measurement.md` §5)
and its landed test row (`tests/unit-o-0-report-contract.test.ts`, `strat:o0-reconcile`,
modes 4/7/10 including the negative-residual case) keep their clause
**UNCHANGED** — they describe the LEGACY surface (`reconcileO0PostStyle`'s naive residual
branch), which this unit leaves alone; (ii) this unit's own `P-TP-1` row in §5 above is the
NEW union-accounting property over the NEW surface. The O-0 `P-TP-1` clause "any unseparated
stage makes the reconciliation `ok:false`" and its unarmed-inertness clause are inherited by
the new shape (§2.1 clause 5 / `P-SM-2`) as well — inherited, never overwritten.

---

## 6. States, fail-states and throw patterns

### S — states (every state the TestWriter must derive)

| # | State | Expected observable |
| --- | --- | --- |
| **S1** | **Single re-derive pass + a pre-pass render sequence** (the fourth-run folder shape) | `passCount: 2`, `passKindSequence: ["pre-pass-render","re-derive"]`, `records` = the 2-record pre-pass pair + the pass's records; the row's `stages[]` is unchanged in meaning (per-id SUMS); the pass's own `stages[]` sums to the row's per-id values (the aggregation identity) |
| **S2** | **Two re-derive passes + a pre-pass render sequence** (the fourth-run document shape) | `passCount: 3`, `passKindSequence: ["pre-pass-render","re-derive","re-derive"]`, each re-derive pass carries its own `opener` and its own `window`; the row's `unaccountedMs` is computed over the union of ALL top-level spans; `hook.passLongTaskDoubleCountMs` records the inter-pass straddle |
| **S3** | **A deliberately UNARMED row** (the repeat block's baseline) | `records: 0`, `passes: []`, `passCount: 0`, `armWindow: null` (unchanged), `rowArmCount: 0`, `rowDisarmCount: 0`, `sessionCountsAt.pre == post`; **no pass reason is fabricated** — an empty list is the legal empty case |
| **S4** | **Nested emits present** (`render.dom`/`render.ssr` inside `reconcile.apply`) | the nested entries carry `depth ≥ 1` and the containing record's `passIndex`; `sumOfSpansMs > accountedMs` with `overlapMs > 0`; the reconciliation uses the UNION, never the sum; **no double-count reaches `unaccountedMs`** |
| **S5** | **Overlapping top-level spans** | `overlapMs > 0` on the pass (recorded, legal); the union accounting still yields `unaccountedMs ≥ 0`; `hook.passOverlaps[]` names the pass pair when pass WINDOWS overlap |
| **S6** | **A structural (`snapshot.clone`) stage inside a pass** (the fourth-run reality) | the pass's `stages[]` carries it `ms:null` + `unseparated:true` + `structural:true` + the RUL-3 reason; the pass remainder may still be COMPUTED (it is an accounting quantity) but the row's `postStyle.ms` stays `null`+`unseparated` with `attributable:false`; the report stays `status:"OPEN-structural"` |
| **S7** | **A merely UNMEASURED (non-structural) stage inside a pass** | the pass/row remainder is recorded as **not computable** with the reason naming the unmeasured id (`FS10`-adjacent) — an unmeasured stage is never reconciled away (the O-0 `P-TP-1` clause, inherited) |
| **S8** | **A long task that starts before `t0` and overlaps in** | recorded under `longTaskAttribution.startBefore` with its `overlapMs`, EXCLUDED from `longTaskTotalMs` (the pinned rule); `ambiguous: true` + a non-empty `ambiguityReason` when `overlapMs > hook.toleranceMs` |
| **S9** | **A long task that starts inside and ends after `t1`** | recorded under `straddlesEnd` with its `overlapMs`; its FULL duration is in `longTaskTotalMs` (the pinned rule) and its overlap is in `straddleEndMs`; the row states both numbers |
| **S10** | **The per-pass long-task totals sum higher than the row total** | `hook.passLongTaskDoubleCountMs ≥ 0` — `> 0` exactly when some task is counted (start-inside) by TWO OR MORE pass windows, `0` when none is (AMENDED per RUL-11 / §12.4: the field is a MEASURE, not the signed `Σ(pass totals) − row total` difference, which the FIFTH run emitted as −53 / −95 / −63); recorded, never an error, never silently normalized, and **never negative** (§6 `FS11`) |
| **S11** | **A run where the remainder exceeds the recorded band** | `reconciliation.ok:false`, `bandExceeded:true`, the reason naming the number and the band, and the `reconciled with the band EXCEEDED` verdict form — a legitimate measurement outcome, never a shape defect and never a hidden number |
| **S12** | **The remainder is not computable** | `unaccountedMs: null` + a named reason (a missing timestamp, an equal-interval nesting ambiguity, an unmeasured stage) — **never a number, never a negative, never a silently missing field** |
| **S13** | **The fifth-edition artifact regenerated** (the unit's own live run) | the artifact's STATUS banner names runs 1-4 SUPERSEDED; both legs embedded verbatim; `driver.build.verified:true`; the shape of §4 present on every row of both legs |
| **S14** | **A legacy (fourth-edition) row fed to the NEW oracle** (RUL-8/§2.5a — the rule fires at the NEW surface ONLY) | the retired fields are reported **at the new surface**: `postStyle.residual` non-null ⇒ `FS8`; bare `hook.armCount`/`disarmCount` without the explicit names ⇒ `FS9`; a missing `hook.passes` ⇒ the partition is reported not computable naming the field (`FS10`) — **and the outcome carries `legacyShape:true` + `legacyShapeReason` naming the row class**, so a legacy artifact is never silently read as a new-shape one and never blamed for a new-shape measurement defect. The row is `ok:false` **by shape class**; its own numbers are not impugned. **The SAME legacy row on the LEGACY path stays schema-valid** (the 114 O-0 rows and the fourth-edition JSON are read there), because none of `FS8`/`FS9`/`FS10` is a `validateO0Run` clause |

### FS — fail-states (each loud, each with an exact observable)

| # | Fail-state | Observable outcome + message shape |
| --- | --- | --- |
| **FS1** | **A NEGATIVE remainder is presented (or produced)** | `pass:false`; reason `unaccountedMs <n> is negative — the union accounting cannot produce a negative remainder (M1: a negative residual is the defect this unit closes); the span set or the window is wrong (<row id> / pass <i>)`; **the field is emitted `null` with the reason** and no negative number appears in any field, table cell or verdict. Counterexample: any span whose union exceeds its window. |
| **FS2** | **The pass partition is not TOTAL (or the aggregation identity breaks)** | `pass:false`; reasons: `record <index> (<stage>) is not attributed to any pass (the partition must be TOTAL — M1)` / `record <index> appears in <k> passes (<indices>) — a record belongs to exactly ONE pass` / `the per-id aggregation identity fails for <id>: row <r> ms ≠ Σ passes <s> ms`. `missing`/`duplicate` are printed explicitly. |
| **FS3** | **A nesting AMBIGUITY** (two records with identical `[startMs, endMs]`) | `pass:false`; reason `records <i> (<stage>) and <j> (<stage>) share the interval [{start}, {end}] — containment is undecidable (M1); the shape may not guess which is outer`; both entries are recorded in `hook.nestingAmbiguities[]`; the pass's `unaccountedMs` is `null` + the reason. |
| **FS4** | **An arm-count mismatch** | `pass:false`; reason `hook.rowArmCount <a> / rowDisarmCount <d> violates the per-row invariant (armed ⇒ 1/1, unarmed ⇒ 0/0, in all cases 0 ≤ a − d ≤ 1) — the per-row counts must be derived from the pre-arm and POST-DISARM readings (M2); sessionArmCount <sa> / sessionDisarmCount <sd> at the post-disarm reading`; the raw readings are printed. |
| **FS5** | **An attribution-ambiguous long task, or a rule mismatch** | `pass:false`; reasons: `the long-task attribution is ambiguous: <n> task(s) start before o0:t0 (overlap <o> ms > the recorded <tol> ms band) and/or <m> task(s) start inside and end after o0:t1 (overlap <p> ms) with no recorded ambiguityReason — the START-INSIDE-INCLUSIVE rule is pinned (M3)` / `longTaskTotalMs <t> does not equal the pinned start-inside sum <i> (the rejected alternatives read overlap-any <a> ms / intersection <x> ms)` / `the recorded task list (<n>) disagrees with includedCount <m>`. **The rule-mismatch DISJUNCT is SCOPED (RUL-13 / §12.5, the `RULE-2` red): `longTaskTotalMs === overlapAnyMs` (or `=== intersectionMs`) is a violation ONLY on a row whose observed list contains at least one EXCLUDED task** — i.e. where `overlapAnyMs !== includedMs` or `intersectionMs !== includedMs` (the rule actually discriminates). On an honest row whose observed list is entirely inside and unstraddling, the three totals COINCIDE by construction (the FIFTH run's six rows all read `overlapAnyMs = intersectionMs = includedMs`), so the unscoped disjunct would fire on every honest row and is mutually unsatisfiable with §3.4's cross-check — the two clauses as written before the amendment could not both hold on a discriminating list. When the disjunct is scoped out, the reason must NOT be emitted and the row's `pass` is unaffected. |
| **FS11** | **A MEASURE field is NEGATIVE (RUL-11 / §12.4, the `F5-2`/`F5-3` fix)** | `pass:false`; reason `hook.<field> <n> is negative — <field> is a MEASURE and is non-negative by construction (<the pinned definition>); a negative value is a computation defect, not an outcome (M1/RUL-11)`; the field is emitted `null` with the reason (never the negative number in the field). Covers `passLongTaskDoubleCountMs`, `passOverlapSumMs`, `unaccountedMs`/`accountedMs`/`overlapMs`/`sumOfSpansMs` (the last of which `FS1` already claims for `unaccountedMs`). Counterexample: `Σ(pass totals) − row total` (the retired signed form) = −53 on a row whose observed long task starts inside the freeze window but outside every pass window. |
| **FS12** | **A top-level span is inside NO pass window, or a pass's containment is not local to it (RUL-11 / §12.4, the `F5-4` fix)** | `pass:false`; reasons: `record <index> (<stage>) spans [{s}, {e}] inside no pass window — every top-level span must be covered by the pass it belongs to (§3.2 clause 6 (b))` / `pass <i>'s top-level set is not the depth-0 set computed WITHIN pass <i> (record <index> is nested in a record of another pass)` / `pass <i> has records but a zero-length window ({0,0}) — a pass's window is its own record span (§3.2 clause 6)`. Counterexample: the pre-pass render pair contained by a LATER pass's `snapshot.pull` opener (the fifth-run pass-0 case: a 51.4 ms span counted by no pass). |
| **FS6** | **A top-level span (or a pass window) lies OUTSIDE the freeze window beyond the band** | `pass:false`; reason `record <index> (<stage>) spans [{s}, {e}] outside the freeze window [o0:t0 {t0}, o0:t1 {t1}] by <o> ms (> the recorded <band> ms band) — a span outside its window is not a measurement of that window (§4.3/P-TP-3/M1)`; the offending record indices are listed; `outsideMs` records the total. |
| **FS7** | **A bundle-identity failure on the FIFTH-edition run** | `driver.build.verified !== true` (or a fifth-edition artifact without the `driver.build` block) ⇒ `pass:false`; reason `executing bundle ≠ on-disk bundle (renderer <served> vs <disk>) — the run's numbers are recorded but NOT accepted (docs/live-testing.md:119-124/§3.6 F2)`; **no fifth-edition artifact may be committed from an unverified bundle.** |
| **FS8** | **The retired residual is presented as a value (or a remainder as a cost)** | `pass:false`; reasons: `post.style residual <n> is RETIRED (M1) — the honest remainder is reconciliation.unaccountedMs` / `the remainder <n> is presented as <a stage cost / a style-layout figure / the measured post.style value> — the remainder is DERIVED, attributable:false, and may never be quoted as a style cost (§4.3/RUL-5/M1)`. |
| **FS9** | **The retired session aliases are carried without the explicit names (M2)** | `pass:false`; reason `hook.armCount/hook.disarmCount are retired session aliases (M2) — report hook.rowArmCount/hook.rowDisarmCount (per-row) and hook.sessionArmCount/hook.sessionDisarmCount (labeled session-scoped)`. |
| **FS10** | **The shape data itself is missing/malformed** (a NEW-surface clause — RUL-8/§2.5a) | `pass:false`; reasons naming the FIELD PATH, never a coerced value: `record <index> carries no finite startMs/endMs (a per-record timestamp is required to derive the pass partition — M1; positional mark matching is not a legal substitute)` / `hook.passes is absent (the per-pass partition cannot be derived)` / `pass <i> is missing <field> (§4.2)` / `pass <i> stages[] carries <n> ids (expected the closed 11)`. **Fires ONLY at the new surface**: a legacy-shaped row presented to `validateO0MeasurementShape`/`partitionO0RowPasses` is refused with `legacyShape:true` + the reason (not a silent pass, not a spurious failure), and the pre-existing `validateO0Run` clause set does **not** carry this clause — adding it there would break the O-0 suites' 114 green tests (§7.1). A report that DECLARES the new shape but omits a required field is `FS10` regardless of row class |

**Throw patterns (unchanged discipline, extended to the new symbols).**
- The pure modules (`src/shared/o0-report.ts`, `src/shared/o0-hook.ts`) return
  discriminated results (`{ok, errors, failReasons, …}`) and **never throw** on malformed
  input — a malformed row/pass/record is `ok:false` with the field path named. The two NEW
  exports `partitionO0RowPasses` and `deriveO0LongTaskAttribution` follow the same rule and
  must not throw on any input (an empty/absent list returns an empty partition or an
  `ok:false` with the reason).
- `src/shared/o0-hook.ts` keeps its pinned loud throws for CONFIG/RECORD programming errors:
  `O0_HOOK_STAGE_NOT_ALLOWED` (construction/arm, a stage outside the closed seam set) and
  `O0_HOOK_RECORD_INVALID` (a malformed record that would otherwise be imputed into a stage
  `ms`). The additive `startMs`/`endMs` fields do not add a throw path.
- The driver's blocks **never throw for a domain failure**: they return the row with
  `pass:false` + `failReasons` (`rowResult`/`diagResult`). A hard failure (no CDP page, a
  boot timeout, an evaluate error) throws and is caught by the per-block `try/catch` → a
  `FAIL` line + a non-zero exit; the `main(...).catch` tail prints `[live-drive] ERROR: …`
  and exits **2** with **no artifact written** (the `F6`/`F16` discipline). A pure-module
  import failure is the same loud abort (no mirror, no fallback).
- **A row whose `pass` is `true` while any `FS-n` observable of this unit holds is a review
  finding**; equally, a row whose `pass:false` carries an EMPTY `failReasons` is a schema
  error (the O-0 `R-1` rule, unchanged).

---

## 7. §3a / §3b — Adversarial findings (RCA-3)

**§3a (adversarial pass on the landed shape): `RAN (2026-09-21, RCA-3) — findings 1..9 recorded in
§13 with their per-item dispositions; 3 MUST-FIX HOST, 1 MUST-FIX TEST, 5 SHOULD.` The unit was
RE-OPENED on them (status block above; §13.4 = the fix set) — **and every one of them is LANDED:
§13.6 is the per-finding FINAL status after the §3b re-audit and the NINTH run, §13.7 the OWED
list.** READ §13.6/§13.7 (with §15 for the run that verified them) INSTEAD OF THIS PARAGRAPH
for the outcome; the paragraph below is kept because it is the CHECKSET the pass was required to
target, and §13 states which of these checks found something and which did not.** The sixth run's
`F5-1`..`F5-6` closure table (artifact §8) is BEHAVIOURAL evidence and is NOT a substitute for
this structured pass.** The pass is read-only and targets, at minimum: (i) **imputation** — a missing
timestamp, a missing count or a missing pass that is silently treated as `0`/absent;
(ii) **laundering** — a remainder presented as a stage cost or a `post.style` value
(`FS8`), or a negative remainder hidden as `null` without a reason; (iii) **unauthorized
access** — the page-side handle's exposure (`F15` of the O-0 spec) after the record-shape
change: `startMs`/`endMs` must not widen the published `window.__o0recorder` projection
(still exactly `{arm, disarm, isArmed, records, state}`); (iv) **under-strong** — a
partition rule that can be satisfied by a fabricated record list (the totals must be derived
from the SAME list the oracle consumes); (v) **verdict-contested** — a band-exceeded
remainder reported as "reconciled"; (vi) the **DEC-1** discipline (`P-SM-2`) against a
structural stage.

**§3b (re-audit after the fixes): `RAN IN FULL (2026-09-21) — the re-audit's four MUST-FIX items
were the LAST fix set, they LANDED, and the NINTH run exercised every one of them live (§8.4 of
the artifact / §15.7 here); §13.6 carries the per-finding FINAL status and §13.7 what is still
owed.`** The list below is the checkset the re-audit was required to target (its historical
"RAN IN PART / FAILED ITS OWN RE-AUDIT" wording, and §13.5's downgrade of the sixth run's
evidence, described the state BEFORE the §3b fix set + the ninth run — both are HISTORY). The
re-audit's items, each now VERIFIED: the clause set **does** carry the §13.1 (2)/(3) and
§13.2 (8) families (`RA-2*`/`RA-3*`/`RA-4*` + the aggregation/attribution clauses), and the
per-row oracle **is** run over the artifact (`LIVE-2` + the artifact's §8). The checkset itself
holds: every `FS1`..`FS10` observable is reachable from a constructed counterexample **at the NEW
surface** and none fires on the regenerated NINTH-edition artifact; the retired
fields are absent from the artifact (or carry `retired:true` + `null`); the register is 6/6
held at the landed budget (plus the four EXTENDED rows); **the O-0 register rows that touch the residual clause are
UNCHANGED, not re-pinned** (RUL-7/§2.5a — the earlier "re-pinned (not weakened)" obligation is
superseded), **the three pre-existing O-0 suites are byte-identical to their pre-unit content
and green 114/114**, **no `FS1`/`FS8`/`FS9`/`FS10` observable can be triggered through
`validateO0Run` on a legacy-shaped row**, and the in-driver twin agrees with the pure module
on the retired/union branch (the `§3a` finding-3 rule). An earlier sentence here said this
checkset "may NOT be quoted as a passed re-audit until the §13.4 fix set lands" — **it landed,
and the ninth run is its live verification.**

### 7.1 The TestWriter's two red-run conflicts and their resolution (recorded, RUL-7/RUL-8)

**Both conflicts were VERIFIED against the tree and are resolved by the amendment — recorded
here so the Implementer and the doc-review inherit the ruling, not a re-derivation.**

1. **Conflict 1 — "the new clauses join the PRE-EXISTING validators".** The spec's earlier §5
   re-pin instruction was readable as: wire `FS1`/`FS8`/`FS9`/`FS10` into `validateO0Run` (and
   re-point `reconcileO0PostStyle` at the union-accounted remainder). That would turn the O-0
   suites **red before the Implementer writes a line**: `tests/unit-o-0-report-contract.test.ts`
   (**50** rows) is built on the retired formula — its `P-TP-1` `strat:o0-reconcile` modes
   4/7/10 assert that the **negative** `longTaskTotalMs − Σ(named)` residual is `ok:false`, and
   its `O0.3`-`O0.9` fixtures carry `hook.armCount`/`disarmCount` and **no** `hook.passes`, and
   its `ST3`-`ST5`/`R3`/`W1`-`W6` rows pin the `postStyle.residual`/status semantics of that
   same pre-unit shape; `tests/unit-o-0-hook-contract.test.ts` (**39**, the recorder) and
   `tests/unit-o-0-driver-contract.test.ts` (**25**, the harness source contract) pin the
   surfaces around it. **RESOLUTION (RUL-7, §2.5a):** the new clauses gate the NEW surface only; the
   pre-existing validators keep their clause sets; the TestWriter pinned the new shape on the
   four NEW exports and left the **114 untouched — which is CORRECT, not a red-set gap**.
2. **Conflict 2 — "a legacy row missing `hook.passes` ⇒ `FS10`/`pass:false`".** As written in
   the earlier §3.1/`FS10`, that clause would refuse **every** existing fixture and the
   FOURTH-edition artifact. **RESOLUTION (RUL-8, §2.5a/§6 S14+FS10):** it applies only when a
   row is fed to the NEW surface (or when a report DECLARES the new shape but omits a required
   field), and there it is reported as `legacyShape:true` + `legacyShapeReason` — an explicit
   shape-class refusal, never a silent pass and never a spurious measurement failure.

**The red baseline is therefore: the TWO new files' own pins — 34 `it()` blocks, of which
`BUDGET` (the register-budget self-check, `:1285`) is already green and **33 are red**: the
**31 implementer-dependent** pins ([IMPL]/oracle) plus the **2 live-gate rows** `LIVE-1`/
`LIVE-2` that stay red until the fifth run (RUL-10). It is NOT a rewritten suite, and the 114
are NOT part of it.** (Counted in-tree 2026-09-21: measurement-shape 23 `it()` blocks = 22 red
+ 1 green, driver-contract 11 = 9 [IMPL] red + 2 [LIVE] red.)

---

## 8. Census + cross-references

### 8.1 Census (the numeric claims of THIS spec)

| Deliverable | Count |
| --- | --- |
| New `live-drive.mjs` blocks | **0** (the 5 O-0 blocks are unchanged — §3.6) |
| New CLI flags | **0** |
| New pure exports | **4** (`partitionO0RowPasses`, `deriveO0LongTaskAttribution`, `deriveO0RowArmCounts`, `validateO0MeasurementShape`) in `src/shared/o0-report.ts`; **0 widened validators** (`validateO0Run`, `validateO0Report`, `reconcileO0PostStyle` keep their clause sets — RUL-7/§2.5a) + **1 additive-only widening** (`deriveO0WindowBound`, gated empty-on-legacy `outsideOffenders[]`) |
| Changed `src/**` symbols | **1 interface, 2 additive fields** (`O0HookRecord.startMs` / `endMs` in `src/shared/o0-hook.ts`) — **no behavior change, inert when unarmed** (§2.5) |
| New row fields | **1 array** (`hook.passes[]`), **7 scalars/objects** (`hook.passCount`, `passKindSequence`, `passOverlaps[]`, `passLongTaskDoubleCountMs`, `nestingAmbiguities[]`, `longTaskAttribution`, `sessionCountsAt`), **4 counters** (`rowArmCount`/`rowDisarmCount`/`sessionArmCount`/`sessionDisarmCount`), **3 stageRecordDetail fields** (`index`/`startMs`/`endMs` → plus `depth`/`passIndex` = 5), **9 reconciliation fields** (§4.1) |
| Retired fields | **4** (`hook.armCount`, `hook.disarmCount`, `postStyle.residual`, `reconciliation.residual`) — all emitted `null`/absent + a reason, never silently dropped. **Retirement is a NEW-surface property: the LEGACY path still reads the fourth-edition bare `armCount`/`disarmCount` and the naive residual (RUL-7)** |
| Closed pass kinds | **2** (`'pre-pass-render'`, `'re-derive'`) |
| Pinned long-task rules | **1 implemented** (`start-inside-inclusive`) + **2 discriminated, not implemented** (`overlap-any`, `intersection`) |
| Stage ids | **11** — UNCHANGED (the closed O-0 set) |
| Register rows | **6** (§5: `P-TP-1`, `P-TP-2`, `P-TP-3`, `P-SM-1`, `P-SM-2`, `P-IM-1`) **+ 4 EXTENDED rows** (§13.1 (1)(2)(4)'s re-audit pins for `P-IM-1`, `P-TP-2`, `P-TP-1`, `P-SM-1`) — budget `6 × 60 = 360` + `4 × 8 = 32` = **392 landed** (≤100/row; ≤ the 400 total ceiling) |
| New test files | **3** (`tests/unit-o0-m1-m3-measurement-shape.test.ts` — 22 `it()` blocks incl. the 6 register rows and the budget self-check; `tests/unit-o0-m1-m3-driver-contract.test.ts` — **14** (`LIVE-1`, `LIVE-1B`, `LIVE-2`, `LIVE-3`, `LIVE-4` + the 9 [IMPL]/source pins); `tests/unit-o0-m1-m3-reaudit-pins.test.ts` — **29** (the §3b re-audit's `RA-0`..`RA-7` + the §5 EXTENDED register + its budget self-check)) = **65 blocks, 34 of them this unit's original red baseline (33 red)** — **now 65/65 GREEN** on the committed **NINTH**-edition artifact; `tests/unit-o0-m1-m3-adversarial-pins.test.ts` (the §13 MUST-FIX/SHOULD pins) is also green; **0 rows re-pinned** in the three pre-existing O-0 suites |
| O-0 suite (pre-existing, `tests/unit-o-0-*.test.ts`) | **114** GREEN and **UNMODIFIED** by this unit (report-contract **50** + hook-contract **39** + driver-contract **25**; `it()` blocks counted in-tree 2026-09-21). **The counts do NOT move here — RUL-7/§2.5a** |
| Full suite before/after this unit | **BEFORE this unit: 217 files passed (217) / 4 913 passed / 58 skipped / 0 failed (4 971 total), exit 0** — the FOURTH-run reading (provenance only). **AFTER this unit + the §3b re-audit + the NINTH run: 221 files passed (221) / 4 988 passed / 58 skipped / 0 failed (5 046 total), exit 0** — the ninth artifact's §1 recorded reading (`4 947` was the sixth-run reading; the re-audit/adversarial pins add the difference). `npm run typecheck` 0 and `npm run build` 0 |
| Committed artifacts | **1** (`docs/specs/unit-o-0-per-stage-breakdown.md` — **REGENERATED as its NINTH edition** by the mandatory live re-run; **runs 1-8 named SUPERSEDED inside it**; the fifth and seventh editions are the intermediate FAIL records kept as history — §15.1) |
| Register outcome | **6/6 `held`** at the landed budget (`6 × 60 = 360`) + the **4 EXTENDED rows `held`** (`4 × 8 = 32`) = **392**; the pre-existing O-0 8 rows stay `held` |
| New `$`-row in `MATRIX_ROWS` / `ROW_EXTENDED` | **0** (O-0 reports no §5.U row and no extended row — the O-0 §3.2 rule, unchanged) |
| `src/` behavior change | **0** |

### 8.2 Cross-references

- **`docs/defects.md`** — the row **`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE`** (the unit's
  parent row: `M1`/`M2`/`M3` + the SCHEDULED marker + this spec's path). Related rows:
  `HEAVY-OPS-FREEZE-THE-PAGE`, `PANE-TOGGLE-FULL-REASSEMBLY`, `CANVAS-DIMENSIONS-JS-DRIVEN`
  (the rows whose numbers O-0 reproduces), and the FIXED
  `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS` (provenance; not re-opened).
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — §2.1 (the measured quantity), §2.2 (the
  closed 11-stage set — **UNCHANGED**), §3.1 (the 5 blocks), §3.2/§3.2.1 (the block result +
  the recorded band), §3.6 (the recorder + the async settled span), §3.6b (the seam set, the
  RUL-3 structural reason, the RUL-4 status contract), §4.2/§4.3/§4.4 (the report shape —
  **this unit's §4 is the additive delta**), §5 (`P-TP-1` whose residual clause is **NOT
  re-pinned** — it keeps describing the LEGACY surface; this unit's own `P-TP-1` row is the new
  union-accounting property, §2.5a/§5; plus
  `P-TP-3`, `P-HK-1`, `P-IM-2`), §6 (`S14`..`S19`, `F1`..`F22` — inherited where cited),
  §7 (§3a/§3b/§3c — **this unit's §7 §3a/§3b RAN 2026-09-21: the record is §13 (4 MUST-FIX + 5
  SHOULD; the unit is RE-OPENED on them)**),
  §8 (census), §11 (the gate shape + the red→green history),
  **§12.13 (the third run — the `M1`/`M2`/`M3` filing)**,
  **§12.14 (the fourth run — the re-witness; its (8) is this unit's queue slot)**,
  **§12.15 (the fifth run — the FAIL this unit's fix cycle repaired)**,
  **§12.16 (the sixth run — the accepted form reproduced; the DEC-1 caveat RESOLVED)**.
- **`docs/specs/unit-o-0-per-stage-breakdown.md`** — **the SIXTH edition (CURRENT)** — §4.4/§4.5
  (the per-pass + per-row new-shape tables), §5.2 (the OBSERVED-list attribution cross-check),
  §7 (the status triple + the mandatory note), §8 (`F5-1`..`F5-6` closure evidence), §9 (the
  window bound), §10 (the run-4/5/6 comparison), §11 (the findings + the carried items), §12 (the
  raw JSON of both legs), §12.3 (the byte-exact round-trip), §13 (the provenance table with
  runs 1-5 SUPERSEDED and the sixth CURRENT). **The earlier editions are history:** the FOURTH
  edition's `residual` column / §8.5 two-re-derive note / §9 window-bound table / §11.4
  `M1`/`M2`/`M3` rows are the shape this unit superseded; the FIFTH edition is the FAIL record
  (`F5-1`..`F5-6`).
- **`docs/next-steps.md`** — the **DONE row** for this unit (the red/green history, the six
  findings + their closures, the sixth run's verdict, the counts, the layer statement and the
  review-record path) + **NEXT QUEUE renumbered so O-5 leads** (**O-5** → **O-9 + O-3** →
  **O-10** → **O-1** → **O-2**, with O-4 conditional on the disclosure-only trigger and the
  two OWED spec items named).
- **`docs/pending.md`** — the O-0 `snapshot.clone` transport park row (its constraint is
  preserved by §2.1 clause 5; this unit neither takes nor re-parks it). **No M1-M3 row exists
  in `docs/pending.md` to retire** (recorded explicitly in the doc-review record).
- **`docs/decisions.md`** — `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` (DEC-1: preserved, not
  re-ruled), `ARCH-GNOSIS-OFFLOAD` (the landing order + O-0's precondition),
  `D-GP-UFA-3` (falsifiability), `D-GP-UFA-4` (report shape), `RAG-AUTHORITATIVE` (why a
  pass count is APP behavior, never an invariant — §5's no-pad clause 1).
- **`docs/specs/rca-live-bugs-green-pipeline.md`** — RCA-11 (the live battery is a mandatory
  pre-DONE gate; park only a structurally non-exercisable surface) and RCA-12 (verify the
  right layer: a node-green is not app-green).
- **`AGENTS.md`** items 3/4 (TDD + the trio), 6 (the archival loop), 8 (the proposal gate —
  **not** triggered here: this is a fix inside a documented contract's shape, i.e. the
  item-8 carve-out), 9 (the delegation gate), **10 (blind-greens + the mandatory
  documentation review)**, **11 (RCA-11)**, **12 (RCA-12)**.
- **Build anchors (cited BY SYMBOL where a line would drift):**
  `scripts/live-drive.mjs` — `o0FreezeRow`, `o0QuiesceAndDrain` (the start-inside filter +
  the `longTaskTotalMs` reduce + the pre/post-disarm readings), `o0HookArm`, `o0ApplyPostStyle`,
  `o0StageRecordDetail`, `o0RowPass`, `o0DeriveReportPass`, `O0_STAGE_IDS`,
  `O0_HOOK_LONGTASK_TOLERANCE_MS` (`:518`), `O0_RECONCILE_TOLERANCE_MS` (`:517`),
  `O0_HOOK_SOURCE` (the page handle); `src/shared/o0-report.ts` — `O0_STAGE_IDS`,
  `O0_WINDOW_TOLERANCE_MS` (`:68`), `validateO0Run` (the window-bound call site `:329-332`),
  `compareO0StageIdSets` (`:457`), `reconcileO0PostStyle` (`:531`), `deriveO0WindowBound`
  (`:718`), `deriveO0StageVerdict` (`:778`), `validateO0Report` (`:1162`);
  `src/shared/o0-hook.ts` — `createO0HookRecorder` (`:202`), the counters (`:211-212`), the
  record-clearing arm transition (`:230`), the mark/measure names (`:261-263`), the commit
  (`:266-272`), `o0CopyRecords` (`:176`); `src/renderer/runtime.ts` — the DOM/SSR emit
  (`:324` / `:334`) and `render()`'s call inside the reconcile span (`:659` inside `:527`);
  `src/renderer/sidebar-panes.ts` — `reDerive` (`:1998`) + its caller-level records
  (`:2009`/`:2019`), the `kind === 'content'` branch (`:2076-2078`), `applyContentChange`
  (`:1569`), `applyDocumentSet` (`:1636`), `refresh()` (`:1824`) + its records
  (`:1888`/`:1899`), the queued re-derive (`:2129-2134`); `src/renderer/renderer.ts:948`
  (`onRebuild → host.reDerive`).
  **CITATION CAVEAT:** every numeric anchor above was re-read at this pass; where a driver
  anchor moves (the O-0 harness has moved the file 3 764 → ~4 556 lines across passes) the
  symbol is the citation and the number must be re-read before quoting.

---

## 9. The decision-row ruling (no NEW decision row and no content change owed) + the tracker edits

**Ruling as originally taken (2026-09-21, pre-fifth-run) — still true as a CONTENT ruling;
the two appended PROVENANCE clauses (§12.7 for the fifth run, §12.9 for the sixth) are the
only `docs/decisions.md` edits this unit made, and neither alters DEC-1's content.**
**RULING: this unit owes NO new row and NO amendment of a decision's content in
`docs/decisions.md`.** The reason is
structural, not stylistic: every decision this unit could be said to pin is either already
carried by an existing ACTIVE row or **preserved verbatim** by the chosen shape.

- **`O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` (DEC-1) is preserved, not amended.** Its pins are
  (a) the accepted structural set (`snapshot.clone` + the therefore-derived `post.style`),
  (b) the AMENDED §3.6b RUL-4 clause 7 gate condition, (c) the visibility invariant
  (`status:"OPEN-structural"`, never quietly `"OK"`), (d) the "no residual quoted as a style
  cost" rule, and (e) the residual recorded as **not separable/unattributable**. §2.1 clause 5
  keeps ALL five: the row-level `post.style` **value** stays `ms:null` + `unseparated:true` +
  `attributable:false` while any stage is unseparated, so the derived `post.style` residual
  remains **uncomputable-as-a-separation**; the NEW honest quantity is a **differently named**
  accounting remainder (`unaccountedMs`, labeled `derived`/`attributable:false`), and the
  legacy `postStyle.residual` / `reconciliation.residual` fields are **retired to `null`**
  rather than re-used for the new number. **No DEC-1 sentence becomes false**, which is
  exactly why no amendment is owed — see the honest caveat below.
- **`ARCH-GNOSIS-OFFLOAD`** already pins O-0 as a hard precondition, the report-shape
  re-scope and the landing order; the M1-M3 shape is a refinement **inside** the artifact's
  contract, not a new architectural ruling (the item-8 carve-out: "fixes inside a documented
  contract's shape" do not re-open the proposal gate).
- **Honest caveat (recorded rather than hidden).** A reader could argue the NEW
  `unaccountedMs` number is "the residual, computed" and that DEC-1's word "uncomputable" is
  thereby narrowed. The ruling above avoids that drift by construction (a different field,
  a `null` legacy field, `attributable:false`). **If the Implementer instead makes
  `reconciliation.residual` non-null, the DEC-1 row MUST be amended in the same pass and the
  doc-review must fail the unit until it is** — recorded here as the trigger, so the
  judgement is checkable rather than assumed.

**Tracker edits made with this spec (surgical):**
- **`docs/decisions.md` — the ruling above STANDS for the pre-fifth-run state; §12.7 (RUL-14)
  supersedes its final bullet.** The fifth run forced ONE provenance amendment to the DEC-1
  row (the accepted evidence is the FOURTH edition; the fifth edition reports FAIL; the
  decision's content unchanged) — landed as an APPENDED clause to the DEC-1 cell in the
  2026-09-21 pass. The earlier note ("no change owed" / "a blind in-cell edit was therefore
  NOT attempted") described the state BEFORE the fifth run and is superseded by §12.7; the
  DEC-1 cell's tail IS editable at this pass (the appended clause is placed at the cell's
  END, so a tool-side truncation of the middle cannot alter the existing content).

- **`docs/decisions.md` — the ruling above STANDS for the pre-fifth-run state; §12.7 (RUL-14)
  supersedes its final bullet.** The fifth run forced ONE provenance amendment to the DEC-1
  row (the accepted evidence is the FOURTH edition; the fifth edition reports FAIL; the
  decision's content unchanged) — landed as an APPENDED clause to the DEC-1 cell in the
  2026-09-21 pass. The earlier note ("no change owed" / "a blind in-cell edit was therefore
  NOT attempted") described the state BEFORE the fifth run and is superseded by §12.7; the
  DEC-1 cell's tail IS editable at this pass (the appended clause is placed at the cell's
  END, so a tool-side truncation of the middle cannot alter the existing content).
- **`docs/defects.md`** — the `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` row: marked
  **SCHEDULED** with this spec's path, and refined with the **verified call path** (§1.1
  (a)/(c): the two content-reconcile passes named by host symbol + the pre-pass render
  sequence + the nested-emit mechanism + the correction that the folder row's Σ breach is
  NOT a double-pass artifact).
- **`docs/next-steps.md`** — the CURRENT WORK entry for this spec landing; the NEXT QUEUE
  order is preserved (this unit → O-5 → O-9 + O-3 → O-10 → O-1 → O-2, O-4 conditional), with
  item (2) annotated **SPEC LANDED**.
- **`docs/pending.md`** — one dated APPENDED clause on the O-0 `snapshot.clone` transport park
  row: the park, its constraint (the `post.style` value stays unseparated/unattributable, the
  report stays `OPEN-structural`) and its revisit condition are **unchanged** by this unit;
  the per-pass accounting remainder is a NEW field, not the `post.style` value. (Appended
  because the row's constraint sentence would otherwise be read against a changed residual
  formula.)
- **`docs/decisions.md`** — **no change** (the ruling above). The DEC-1 cell is a single
  >2 000-character table line whose tail no read in this session can display; a blind
  in-cell edit was therefore NOT attempted (recorded in the handover as an un-performed,
  un-needed edit rather than a silent skip).

---

## 10. Acceptance, the trio, and the gate shape

**Delivery kind:** **spec + driver + pure-oracle (+ the one additive record field) + a
REGENERATED ARTIFACT.** There is no page-design artifact (§1.4) and no app-behavior surface.

**The TDD trail (RCA-1/RCA-2 — the red set is RUN and REPORTED before the implementation).**

1. **TestWriter (red):** `tests/unit-o0-m1-m3-measurement-shape.test.ts` (the 6 register rows
   of §5 — 23 blocks) + `tests/unit-o0-m1-m3-driver-contract.test.ts` (11 blocks: 9 [IMPL] + the
   2 `[LIVE]` gate rows) = **34 blocks, 33 RED** (`BUDGET` at `:1285` is the already-green
   register-budget self-check) — written FIRST and the FAILING SET REPORTED by name before any
   implementation edit. **NO row of the three pre-existing O-0 suites is re-pinned or edited
   (RUL-7/§2.5a/§7.1): the 114 are unmodified and are NOT part of the red baseline.**
2. **Implementer (green):** the least code that makes THOSE 33 pins green — the record fields
   (§3.1), the **four NEW pure exports** (`partitionO0RowPasses`, `deriveO0LongTaskAttribution`,
   `deriveO0RowArmCounts`, `validateO0MeasurementShape`) + the additive-only
   `deriveO0WindowBound` widening (§2.5), the driver's row assembly/drain/verdict/self-validation
   (§3), and the in-driver twin kept in agreement with the module's branch. **`validateO0Run`,
   `validateO0Report` and `reconcileO0PostStyle` are NOT touched (RUL-7)** — the 114 must be
   green before and after, with their test files byte-identical.
3. **Adversarial (read-only, RCA-3):** §7 §3a — findings recorded in this file.
4. **Blind-greens + documentation review (RCA-6/RCA-10):** the O-0 precedent applies — the
   blind-greens artifact for this unit is the **§6.1 coverage report**, NOT a greens doc
   (`docs/specs/gnosis-offload-review.md:88`; an `unit-o0-m1-m3-*-greens.md` would be a
   review finding); the doc-review record is
   `archive/reviews/<date>-unit-o0-m1-m3-measurement-shape-doc-review.md` and reconciles
   this spec + the trackers + the regenerated artifact against the build.
5. **The live re-run (MANDATORY — RCA-11):** the fifth-edition regeneration (§10 below).

**Acceptance criteria (each testable from the regenerated artifact + the suite output).**

> **DOWNGRADE (2026-09-21, adversarial finding 4 — TEST REMAND; read §13.1 (4)/§13.5).** Criteria
> **1** and **2** (and 8, and 7's "the §2/§3 shape present in both legs") are claimed **CLOSED on a
> HUMAN READING of the artifact**, NOT on a pinned oracle: the landed live pins are a **text
> probe** — `LIVE-1` matches `/FIFTH|fifth edition|5th/i` against a file whose banner reads SIXTH,
> and `LIVE-2` is a **whole-file `toContain`** per field name — so **neither can establish "the
> shape is present on every row of both legs", and both would plausibly be GREEN on the FAIL
> (FIFTH) edition**; the artifact is **never parsed and re-validated** by
> `partitionO0RowPasses`/`validateO0MeasurementShape` anywhere in the suite. Until the per-row
> parse + validate live pin lands (TEST remand), **criteria 1/2/7/8 read as "a human reading of the
> artifact pending the per-row parse+validate live pin"**, and the unit's live-evidence claim is
> downgraded accordingly.

> **SEVENTH-RUN AMENDMENT (2026-09-21 — the canonical record is §14; read it with this list).**
> The adversarial fix set LANDED, the `M1-M3` pins were re-run red-first (RCA-1), and the
> **SEVENTH live run RAN and FAILED**: BOTH legs `status:"FAIL"` / `pass:false` /
> `selfValidation.ok:false` (**1 error, 1 gating reason**), the single forcing reason being the
> note clause of `src/shared/o0-report.ts:1482-1491` — **`OPEN-structural` was NOT reached**
> (§14.1/§14.2, defect `F7-1`: a harness ASSEMBLY-ORDER defect, **not** a structural change and
> **not** a measurement defect). **What this does to each criterion:** criteria **3/4/5** and the
> row-level halves of **1/2/8/9** are **CLOSED on the seventh run's own emission** (the artifact's
> §8 per-row oracle re-validation, re-read at this pass: 6/6 rows `pass:true` ⇔
> `failReasons.length === 0`, `validateO0MeasurementShape.ok:true` / `errors:[]` /
> `legacyShape:false`, the per-id aggregation identity on all 9 finite ids, the declared
> `unaccountedMs` = window − accounted on 6/6, the re-derived attribution equal to the recorded
> one) — **and criterion 10(d)'s `LIVE-2` pin is now the ORACLE it was remanded to be: GREEN on
> all six rows of both legs, RED on the leg triple this run did not reach (§14.3/§14.5).**
> **Criterion 7 is AMENDED, not met:** the artifact regenerated as its **SEVENTH edition**
> (runs 1-6 SUPERSEDED inside it; both legs' raw JSON embedded verbatim) and **the accepted form
> is owed by the EIGHTH run** once `F7-1` and the two strict-check OWED items (§14.4) land —
> **the driver + `src/` change, so the prior live provenance is invalidated again (RCA-11)**.
> Criteria **6** is re-read: the seventh-run pass reads **`1 failed | 219 passed` files /
> `1 failed | 4 965 passed | 58 skipped`**, the ONE failure being the (correct) `LIVE-2` red
> against a FAIL edition — **§10.6's "stay green" is therefore not met by the seventh run's own
> tree**, and §10.6's re-baselining rule (re-read the counts from the run before quoting) is the
> standing instruction. **No criterion is withdrawn and no DEC-1 content moves.**

1. **The artifact's shape is present on every row of both legs:** `hook.passes[]` with the
   closed field set (§4.2), `hook.longTaskAttribution`, `hook.rowArmCount`/
   `rowDisarmCount`/`sessionArmCount`/`sessionDisarmCount`/`sessionCountsAt`, and the
   reconciliation remainder fields.
2. **No row, pass, cell or verdict carries a NEGATIVE residual/remainder.** Every row's
   `unaccountedMs` is either a non-negative number (with the band it was judged against —
   `ok:true` or `bandExceeded:true`) or `null` with a **named, precise** reason (a
   structural/unmeasured stage, a missing timestamp, a nesting ambiguity) — **never a
   negative, never a silently absent field** (§2.1/`FS1`).
3. **A document-gesture row's passes are INDIVIDUALLY reconciled:** the row's two re-derive
   passes each carry their own window, their own stage sums and their own accounting, and the
   artifact records which pass carried the heavy long task; the pre-pass render sequence is
   its own pass.
4. **The per-row arm/disarm counters are present and correct:** every armed row reads
   `rowArmCount 1` / `rowDisarmCount 1` (derived from the pre-arm and post-disarm readings),
   the unarmed baseline reads `0/0`, the session counters are labeled and consistent
   (`session ≥ row`), and the retired aliases do not appear as readings.
5. **The long-task attribution rule is DOCUMENTED and ASSERTED:** the artifact states the
   `start-inside-inclusive` rule with its window, the included count/total, and the two
   rejected alternatives' totals; the register row `P-TP-3` discriminates the three rules on
   a generated list (including straddling cases); a mismatch would be `FS5`.
6. **The O-0 suite + the full suite stay green.** The pre-unit readings are **114/114**
   (report-contract 50 + hook-contract 39 + driver-contract 25) and **217 files passed (217) /
   4 913 passed / 58 skipped / 0 failed (4 971 total), exit 0**; **the 114 must STILL read
   114/114 after this unit, with the three `tests/unit-o-0-*.test.ts` files byte-identical to
   their pre-unit content (RUL-7/§2.5a — a diff touching them is a review finding).** The two
   NEW files add 34 collected blocks, so the full suite is **re-baselined with `failed = 0`**
   and **the numbers must be re-read from the run before quoting** (the expected 4 947 is a
   count-derived projection, not a reading). `npm run typecheck` and `npm run build` must both
   exit 0 (the build is the third leg — this project has no demo-smoke).
7. **The mandatory live re-run regenerates
   `docs/specs/unit-o-0-per-stage-breakdown.md` as the SIXTH edition** (RCA-11; §12.8 item 1
   amended the FIFTH-edition target after the fifth run FAILED): both legs,
   real hit-tested gestures, the pinned census (226 documents), `driver.build.verified:true`
   on both legs, the raw JSON of both legs embedded verbatim, the STATUS banner naming
   **runs 1-5 SUPERSEDED**, and the §2/§3 shape present in both legs. A parked or skipped
   live battery is a **review finding**, not a pass (RCA-11 / `AGENTS.md` item 11). The
   recorded run command shape is unchanged from the fourth run (the artifact's §1 records
   it): `npm run build` → the GPU-OFF leg → the GPU-ON leg → the trio. **CLOSED at §12.9.**
8. **The retired fields are provably retired** in the sixth-edition artifact: no numeric
   `postStyle.residual` / `reconciliation.residual`, no bare `hook.armCount`/`disarmCount`
   as readings, and the honest remainder present under its new names (§2.1/`FS8`/`FS9`).
9. **The DEC-1 preservation is observable** (`P-SM-2`): the row-level `post.style` value
   stays `ms:null` + `unseparated:true` + `attributable:false` while `snapshot.clone` is
   structurally unseparated, the report stays `status:"OPEN-structural"` with
   `selfValidation.ok:true`/`gatingReasons:[]`, and no remainder is presented as a
   style/layout cost or as a measured `post.style` value.
10. **BACK-COMPATIBILITY IS OBSERVABLE (RUL-7..RUL-10, §2.5a — the amendment's own gate).**
    (a) **The legacy path is provably unchanged:** the three pre-existing O-0 suites read
    114/114 with their files **byte-identical** to their pre-unit content, and the
    FOURTH-edition JSON embedded in the artifact still re-validates under
    `validateO0Run`/`validateO0Report` — no legacy row is refused for a missing
    `hook.passes`, a bare `armCount`/`disarmCount` or a negative naive residual. (b) **The
    new surface is provably scoped:** every `FS1`/`FS8`/`FS9`/`FS10` observable is reachable
    on a NEW-shape row or a row deliberately fed to a new oracle, and **not** through
    `validateO0Run` on a legacy-shaped row. (c) **The legacy-class outcome is explicit:** a
    legacy row fed to the new validator returns `ok:false` + **`legacyShape:true`** +
    `legacyShapeReason` — neither a silent pass nor a spurious measurement failure (the
    emitted rows read `legacyShape:false` / `legacyShapeReason:null`; **the positive case
    remains a NEW-surface test obligation, stated in §12.10 (6)**). (d) **The live-gate rows
    are no longer red:** `LIVE-1`/`LIVE-2` (RUL-10) were RED until the run and are now
    **GREEN on the committed SIXTH-edition artifact**, as are the three counterexample reds
    (`RULE-2`/`FIX-TP1`/`FIX-TP3`) — **no red remains from this unit's baseline**.

**What a green means (RCA-12, stated explicitly).** A green here is **(a) a
measurement-shape green** (the oracle + the report shape validate on generated inputs) and
**(b) an `assembled-renderer` MEASUREMENT green** (a real CDP gesture against the executing
bundle produced a row with the new shape). It is **never** an app-green, never a claim that
"the app works", and never a permission to quote the remainder as a style cost. The layer
declaration is mandatory on the DONE row and in the handover (§12.11 carries it).

**Evidence for the gate:** (a) this spec; (b) the harness + pure-module diff; (c) the
**SIXTH-edition** artifact with the run commands + the bundle identity (`driver.build.verified:true`
both legs); (d) the trio output with the re-baselined counts (219 / 4 947 / 58 / 0);
(e) the `§3a`/`§3b` findings — **the RCA-3 pass RAN 2026-09-21: the record is §13 (4 MUST-FIX +
5 SHOULD; the unit is RE-OPENED on them, and the HOST/TEST/SPEC fix set is §13.4)**; (f) the doc-review record
`archive/reviews/2026-09-21-unit-o0-m1-m3-doc-review.md`.

---

## 11. Provenance / supersession

- **STATUS (the gate items CLOSED — the unit's DONE state, re-established on the NINTH
  edition, 2026-09-21):** all ten §10 acceptance criteria are met on the **NINTH**-edition
  artifact and every §12.8 amendment is satisfied (§12.11 carries the sixth-run item-by-item
  closure; **§15 carries the ninth-run closure, the §3b re-audit verification of §13.1 (1)-(4)
  and the OWED list that replaces the old "owed" wording — §13.6/§13.7**). **The sixth-run
  closure record is HISTORY; the gate items are CLOSED on the ninth edition.** **Layer
  statement (RCA-12, mandatory, restated for the ninth run): `assembled-renderer` MEASUREMENT
  — this unit's live evidence is a real hit-tested CDP gesture against the executing `dist/`
  bundle; a green here is a MEASUREMENT-SHAPE green, NEVER app-green; the unit changes no app
  behavior and owes no page-design artifact.** **The layer statement is the operative limit on
  this unit's DONE claim: the suite-green is the PURE-ORACLE / report-shape layer and the
  per-row re-validation in the artifact's §8 is an oracle re-run over the EMBEDDED JSON — it is
  measurement-shape evidence, and nothing in this unit is a statement that the app works
  (RCA-12 `AGENTS.md` item 12).**
- **Superseded by this unit:** the **M1-M3 part of the FOURTH-edition artifact's shape** —
  the artifact's §4 `residual` column, its §8.5 two-re-derive note, its §9 window-bound table
  and its §11.4 `M1`/`M2`/`M3` rows — **on the NEW surface only (RUL-7..RUL-10, §2.5a).**
  The O-0 spec's §4.3 residual formula and its §5 `P-TP-1` residual clause are **NOT
  superseded for the LEGACY path**: they keep describing `reconcileO0PostStyle`'s naive
  residual branch and its O-0 test rows, which this unit leaves untouched (the earlier wording
  "plus the corresponding shape text of the O-0 spec's §4.3 and its §5 `P-TP-1` residual clause"
  is superseded BY THE AMENDMENT as a supersession). **The O-0 spec's own measurement contract
  is otherwise UNCHANGED** (the 11 stage ids, the 5 blocks, the corpus pin, the bands, the
  states/fail-states, the gate clause).
- **The RUL-7..RUL-10 back-compatibility ruling (2026-09-21, the amendment this spec carries)
  — the record:** the new shape gates the NEW surface only; the three pre-existing validators
  keep their clause sets so the O-0 suites' **114/114** stay green unmodified; `FS10`/`S14`
  fire at the new surface with an explicit `legacyShape:true` outcome; the new clauses scope to
  the SIXTH edition's rows while the earlier editions' JSON stays legacy-valid; and
  `LIVE-1`/`LIVE-2` are this unit's live-gate rows (§2.5a, §7.1, §10.10).
- **Not superseded:** runs 1-8 remain the **historical record** of the measurement
  (labelled provenance; no cross-run absolute ms comparison is ever a measurement —
  RUL-5/L9/L10 stands). The fourth run's raw JSON stays valid **as the fourth run's JSON** **and
  re-validatable as a legacy-shaped report (RUL-9)**; the fifth and seventh runs' FAIL records
  stay inside the artifact's supersession record as history (the **NINTH** edition embeds its
  own legs verbatim and its supersession record names **runs 1-8 SUPERSEDED**, with every
  prior edition's renderer identity and verdict tabulated in its §13.2).
- **Re-witnessed, not fixed, by the fourth (and fifth) run:** the row
  `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` stayed OPEN through the fourth run (a fourth witness)
  and through the fifth (a fifth witness, whose FAIL is what forced this unit's fix cycle) —
  which is why this unit was the queue's leading item and is now **FIXED (2026-09-21)** at the
  sixth run.
- **The unit's own numbers are not in this spec.** Every numeric example in §4 is
  illustrative; the only measurements this unit produces are in the regenerated
  **NINTH-edition** artifact — **and the NINTH edition reproduces the DEC-1-accepted form
  (§15)**: runs 1-8 are SUPERSEDED inside it, the accepted evidence is the NINTH edition, and
  the O-5 gate is UNBLOCKED on it (`docs/decisions.md` DEC-1 provenance; the fifth- and
  seventh-edition caveats are RESOLVED).

---

## 12. THE FIFTH RUN (2026-09-21) — the run FAILED, the M1/M2/M3 closures it established, the open findings, the rulings, and the ACCEPTANCE UPDATE

**Status of this section: a RECORD, plus the amendments it forces — HISTORICAL (the fifth-run
state); its findings are all CLOSED and its rulings all LANDED. Read §12.9/§12.10 (the SIXTH
run) and §12.11 (the gate items CLOSED) as the record of the sixth run, and §13 for the CURRENT
state (the adversarial pass RE-OPENED the unit); everything in §12.1-§12.8
describes the FAIL the fix cycle then repaired and stays in place as the unit's history.**
**The `F5-1`..`F5-6` closures in §12.4 stay LANDED — the adversarial pass confirms them and does
not re-open any of them; what it re-opens is the SHAPE ORACLE's clause set (§13.1) and the live
gate's certification claim (§13.1 (4)).**
Everything below was
read at this pass out of the committed artifact (FIFTH edition,
`docs/specs/unit-o-0-per-stage-breakdown.md`: §1-§13 + the two embedded raw legs §14.1/§14.2)
and, where a mechanism is claimed, out of the code (`src/shared/o0-report.ts`,
`scripts/live-drive.mjs`, `tests/unit-o0-m1-m3-*.test.ts`) — cited by symbol/artifact section,
never by a guessed line. **The unit was NOT DONE at this point in its cycle (it IS DONE now —
§12.9/§12.10).** The fifth edition is a **FAIL record**;
the fix + the SIXTH run were the unit's remaining acceptance path (RUL-14/§12.7) and BOTH
HAPPENED: §12.9 records the sixth run.

### 12.1 What ran and what it reported (both legs)

- **Runs 1-4 are SUPERSEDED inside the artifact** (STATUS banner); the fifth edition embeds
  both legs' raw JSON verbatim (byte-exact round-trip verified, artifact §14.3) and the
  bundle is verified on both legs (`driver.build.verified:true`; renderer
  `678367+3e3f1b80` GPU-OFF / GPU-ON, main `2419628+e1e652667`; served = on-disk).
- **BOTH legs: `status:"FAIL"`, `pass:false`, `driver.selfValidation.ok:false` with 4 (GPU-OFF)
  / 2 (GPU-ON) errors** — i.e. **NOT the DEC-1-accepted `OPEN-structural` form, and not
  softened anywhere in the artifact.** `driver.gatingReasons` = **9 / 5**;
  `selfValidation.structuralErrors` 0 / 0 with `structuralFacts` **4 / 2**;
  `driver.openStructural:false` on both legs; `derived status:"FAIL"`.
- Census pinned **226 = 226** both legs (6 102 nodes / 9 266 edges, recorded provenance); no
  census-mismatch reason; `env.engine:"absent"` + the same evidence; `path:"cdp"` /
  `realInput:true` on every row; `hook.pendingSpans:0`, `dropped:0`, `refused:[]`,
  `quiesced:true`.
- The structural facts are **unchanged from runs 1-4**: `snapshot.clone` is the ONE
  `structural:true` id (the RUL-3 reason verbatim), `post.style` is `derived` /
  `ms:null` / `unseparated` / `attributable:false` in every row, and **no report is relabelled
  `"OK"`** (the DEC-1 visibility invariant holds).

### 12.2 The FAIL's numbers (the new union remainder vs the band)

> **SPEC-RE-DERIVATION OWED (2026-09-21, adversarial finding 9 — read §13 with this table).** The
> band claims in this subsection are **STALE against the landed code and are recorded as OWED, not
> as contract**: (a) **caution 1's claim that the row band comparison is made in the pure oracle
> from `toleranceMs = hook.toleranceMs` is NO LONGER TRUE of the landed `partitionO0RowPasses`** —
> the landed code reads the band from **`hook.reconcileToleranceMs`** (`src/shared/o0-report.ts`,
> the `toleranceMs` binding inside `partitionO0RowPasses`), a field **NEITHER the driver nor the
> committed artifact emits**, so the recorded `reconciliation.toleranceMs` (the driver's 50 ms,
> `tolerance.source:"measured 2026-09-21"`) and the band the oracle actually uses are **TWO
> READINGS THAT CAN DRIFT** (the default `O0_RECONCILE_TOLERANCE_MS` only applies when the hook
> field is absent). §2.1's "`toleranceMs = hook.toleranceMs`" scoping sentence is therefore
> **superseded as a description of the landed code** and the re-derivation is owed with the
> §13.4 fix set. (b) The `tolerance.source` string is still a **date ("measured 2026-09-21") for a
> COMPILE-TIME constant** whose empirical re-derivation (RUL-11's second half) is **still owed** —
> the date is provenance, not a derivation. `partition.failReasons` also still carries
> `rowOutcomeReasons` (the band-exceeded statement), so a consumer that greps `failReasons` can
> **reintroduce the `F5-1` gate** the sixth run removed.

The table below is the FIFTH-run record (SUPERSEDED as current state — §12.9); it is kept because
it is what the mis-scoped-band finding was read from.

| leg | row | row `windowMs` | row `accountedMs` | **row `unaccountedMs`** | `bandExceeded` | reasons |
| --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | `o0-folder-row-gpuoff-r1` | 1038.9 | 882.1 | **156.8** | true | 2 |
| GPU-OFF | `o0-document-row-gpuoff-r1` | 2279.8 | 2223 | **56.8** | true | 2 |
| GPU-OFF | `o0-fold-ablation-off` | 80.5 | 39.8 | **40.7** | true | 2 |
| GPU-OFF | `o0-fold-ablation-on` | 81.8 | 39.9 | **41.9** | true | 2 |
| GPU-ON | `o0-folder-row-gpuon-r1` | 1032.4 | 921.5 | **110.9** | true | 2 |
| GPU-ON | `o0-document-row-gpuon-r1` | 2407.2 | 2346.3 | **60.9** | true | 2 |

**4/4 (GPU-OFF) and 2/2 (GPU-ON) rows are `pass:false`**, and that row outcome is what
propagated into the report (`F5-1`/§12.4 (a)). **Two cautions, both verified against the
committed JSON and both recorded here because they qualify the FAIL:**

1. **Which band the reasons name.** Every row's fail-reason text reads "EXCEEDS the recorded
   **40** ms band" and the artifact's prose states that the remainder "exceeds the recorded
   50 ms reconciliation band". The committed JSON carries BOTH constants on each row:
   **`reconciliation.toleranceMs` = 50** (`tolerance.reconcileMs`, `O0_RECONCILE_TOLERANCE_MS`)
   and **`hook.toleranceMs` = 40** (the window-bound band, `O0_WINDOW_TOLERANCE_MS` /
   `O0_HOOK_LONGTASK_TOLERANCE_MS`). The row band comparison is made in the pure oracle from
   the HOOK field (`partitionO0RowPasses`'s `toleranceMs = hook.toleranceMs` → `bandExceeded`);
   the driver's row reason then prints that same value. **Consequence, stated exactly: the
   two ablation rows (40.7 / 41.9 ms) are `pass:false` against 40 ms but are WITHIN the
   recorded 50 ms `tolerance.reconcileMs`** — so "the remainder exceeds the 50 ms band on
   every row" is TRUE for the four gesture rows and FALSE for the two ablation rows. The
   band-scope amendment of §2.1/§3.3 is the fix; **the supervisor must not read the artifact's
   50 ms sentence as covering all six rows.**
2. **`F5-2`'s numbers, exactly.** The supervisor's brief cites `−53 / −95 / −63` — the three non-zero
   `passLongTaskDoubleCountMs` values; the committed rows read **−53 (folder GPU-OFF), −95
   (document GPU-OFF), −63 (folder GPU-ON)** and **0** on the two ablation rows and the
   document GPU-ON row (`Σ pass totals` vs row total: 870/923, 2067/2162, 0/0, 0/0, 899/962,
   2281/2281).

### 12.3 What the fifth run DID establish (the POSITIVE closures — record them as positive)

- **M1 (the per-pass partition) — the partition itself WORKS, and the row-level arithmetic is
  honest.** `passCount` **2 (folder, `["pre-pass-render","re-derive"]`) / 3 (document,
  `["pre-pass-render","re-derive","re-derive"]`)**; `hook.records` 11 / 22;
  `Σ pass.records.count === hook.records` (11/11, 22/22) with strictly increasing,
  disjoint, exhaustive `records.indices`; the **aggregation identity holds on ALL SIX rows
  with ZERO violations** (per-id `row.stages[id].ms === Σ pass.stages[id].ms` for the ten
  record-producible ids); `unaccountedMs ≥ 0` on **6/6 rows and 15/15 passes**;
  `overlapMs = 0` and `sumOfSpansMs === accountedMs` everywhere; `naiveSumResidualMs` is
  emitted **only** with `notAResidual:true`; `postStyle.residual` and
  `reconciliation.residual` are `null` + `retired:true` + `retiredBy` in all six rows.
  The document row's heavy pass is **pass 1** (window 2186.3 ms, `accountedMs` 2162.5,
  `unaccountedMs` 23.8, carrying the 2 067 ms long task) and pass 2 is the short trailing
  re-derive (window 81 ms, `accountedMs` 60.5, `unaccountedMs` 20.5, no long task) —
  i.e. **the multi-pass window IS partitioned per pass, which is the unit's central claim.**
  **(One number in the supervisor's brief could not be reproduced: "the heavy pass 2 162.5 ms
  accounted of a 2 186.3 ms window". The artifact's pass-1 row reads `accountedMs` 2162.5 of
  a 2186.3 ms window and `unaccountedMs` 23.8; no 162.5 ms appears for that pass. The
  artifact's numbers are recorded here.)**
- **M2 (the per-row counters) — CLOSED live.** Every row reads **`rowArmCount: 1` /
  `rowDisarmCount: 1`** with `P-SM-1`'s `0 ≤ a − d ≤ 1` and `session ≥ row` holding;
  `sessionArmCount`/`sessionDisarmCount` are the cumulative readings (1/1, 2/2, 3/3, 4/4
  GPU-OFF; 1/1, 2/2 GPU-ON) **labelled session-scoped in the field NAME and the table**;
  `sessionCountsAt.pre`/`.post` present with their stamps; and **the bare
  `hook.armCount`/`hook.disarmCount` are ABSENT (`undefined`) in all six rows** — the run-4
  defect (a session total under a per-row name) is gone.
- **M3 (the attribution rule) — RECORDED live, with the discrimination still owed to the
  register.** Every row: `rule:"start-inside-inclusive"`, `includedMs === longTaskTotalMs`
  (923/923, 2 162/2 162, 0/0, 0/0, 962/962, 2 281/2 281), `includedCount === 2` on the
  gesture rows, `ambiguous:false`, `startBefore:[]`, `straddlesEnd:[]`. **On this corpus the
  two rejected alternatives COINCIDE with the pinned total** (`overlapAnyMs = intersectionMs
  = includedMs`), so **the run does not discriminate the three rules** — that is `P-TP-3`'s
  job on generated lists, and it is one of the unit's open reds (§12.5).
- **The window bound is CLEAN, and the new `outsideOffenders[]` is EMPTY.** Worst arm-window
  overshoot of the freeze window **+1.2 ms** against the recorded 40 ms band;
  `violated:false` on all six rows; `reconciliation.outsideMs` = 0; no `null %` string
  anywhere (the two zero-window ablation rows print the RUL-5/L8 form).
- **Inertness: `inert:true` in BOTH legs** with `Δmutations 0` (37 vs 37), the long-task half
  VACUOUS (0-vs-0, `nonVacuous:false`) and the pinned **MUTATION-HALF** sentence verbatim →
  the F21 clause does not fire; `setEqual:true`.
- **Controls read as before:** GPU delta (ON−OFF) **+39 ms folder / +119 ms document** with
  identical mutation counts (37/37, 11 758/11 758) — **no separable GPU effect**; track
  ablation Δ 0 ms long-task / Δmutations 0 / ΔwallMs +1.3 ms (available, applied, reverted).
- **A-4 holds: read counts 1 / 2** (folder disclosure / document open) with the AWAITED
  round-trip ms 76.4 / 169.4 (GPU-OFF) and 84.5 / 178.6 (GPU-ON); per-read 117.4 + 52 on the
  document row.
- **Shares are stable against run 4:** JS path **87.06 % / 86.74 %** (folder) and
  **94.79 % / 94.77 %** (document); the render emits 12.71 % / 13.8 % and 82.7 % / 82.24 %.
  **The row no longer claims a style/layout share at all** — `post.style` stays
  `derived`/`ms:null` and the remainder is `unaccountedSource:"derived"`,
  `unaccountedAttributable:false`.

### 12.4 The SIX OPEN FINDINGS (`F5-1`..`F5-6`) — all UNPATCHED; owner = the NEXT CYCLE

| # | finding | class | evidence (artifact section) | disposition pinned here |
| --- | --- | --- | --- | --- |
| **F5-1** | **A recorded `bandExceeded` OUTCOME is propagated as a failure: `rowOutcomeReasons` → `row.pass:false` → the report's gating reasons → `status:"FAIL"`.** It is the unit's exit condition: the report dies of a legitimate measurement outcome. (A second, smaller defect at the same site: the driver's self-validation summary line says "rejected 1 row(s)" while listing every rejected row.) | shape/outcome conflation (fails-loud on a legitimate outcome) | §7.1, §7.2, §7.4, §13.1 | **`F5-1` is a DISTINCT defect class from `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` and is filed as its own defect row (`docs/defects.md` `O0-BAND-EXCEEDED-GATES-THE-REPORT`).** The pinned fix: a band-exceeded remainder keeps `reconciliation.bandExceeded:true` + a row-level NOTE, and must NOT enter `row.pass`/`row.failReasons` as a failure nor `derived.gating` (§2.1's outcome-to-failure clause). **RUL-11 sequences it AFTER `F5-4` and only on a re-run** |
| **F5-2** | **`hook.passLongTaskDoubleCountMs` NEGATIVE (−53 / −95 / −63; 0 on three rows) while §2.3/S10 define it as the inter-pass straddle with S10 pinning `> 0`.** Mechanism: the row total includes a long task whose `start` is inside the freeze window but OUTSIDE every pass window (folder GPU-OFF: task at 8487.7 vs pass 1 opening at 8487.9), so `Σ(pass) < row` and the signed difference is negative | field semantics falsified by live data | §8.2, §13.1 | **fixed by §2.3/§2.4/§6 `FS11`** (a MEASURE, non-negative by construction; the signed form is a labeled diagnostic) |
| **F5-3** | **`reconciliation.passOverlapSumMs` NEGATIVE (−131.2 / −12.5 / −25.6 / −26.7 / −83 / −17.6) though described as a non-negative overlap measure.** It is exactly `Σ pass.unaccountedMs − row.unaccountedMs` | negative value in a measure field | §8.2, §3.3, §13.1 | **fixed by §3.3/§2.4/§6 `FS11`** (a genuine non-negative overlap measure; the signed delta renamed `passRowUnaccountedDeltaMs` + `notAMeasure:true`) |
| **F5-4** | **pass 0's window collapses to `{t0:0,t1:0,ms:0}` and its measured span (51.4 / 93.8 / 0.5 / 0.3 / 61.1 / 100.3 ms) is counted by NO pass** — the artifact records every one of pass 0's records at `depth:1` (contained, with the containment forest computed over the WHOLE row — the artifact names the containing record as the FIRST pass opener, `snapshot.pull`, which belongs to pass 1), while the pass window was taken from the pass's TOP-LEVEL records only and pass 0 therefore has NONE. The artifact's own words: pass 0's "real measured span is neither counted as `accountedMs` nor reported as `unaccountedMs`". Result: the passes' attribution is short of the row remainder (`passOverlapSumMs` magnitudes are those deficits) and the row remainder is larger than the sum of the pass remainders. **The row total is NOT wrong** (its union includes pass 1's opener span, which covers pass 0's records); only the per-pass layer loses it. **The exact arithmetic relation between the pass-0 span and the deficit is NOT asserted as measured** — this role has no shell, and no measured field carries the decomposition; the artifact's §8.3/§10.1 (e) tables state the pass-0 span (51.4 / 93.8 / 0.5 / 0.3 / 61.1 / 100.3 ms) separately from the deficit (−131.2 / −12.5 / −25.6 / −26.7 / −83 / −17.6 ms), and on the folder GPU-OFF row the deficit (131.2) exceeds the pass-0 span (51.4) by 79.8 ms — the pre-pass idle time (the freeze window's `t0` 8481.0 to the first record's start 8489.5), i.e. **the deficit tracks the pass-0 span plus the row idle time the pass layer also cannot see**, which is a derivation from the recorded fields and NOT a measured quantity. The supervisor's brief attributes "most of `F5-1`'s band breach" to this finding, and the next cycle's re-run is the authority on the decomposition. What IS verified in the committed JSON: pass 0 has records, a zero-length window, and no place in the per-pass `accountedMs` | attribution gap (a nesting crossing a pass boundary) | §8.3, §10.1 (d)/(e), §13.1 | **THE LIKELY ROOT CAUSE of most of `F5-1`'s band breach (RUL-11 first).** Fixed by §3.2 clause 6 (a)/(b) + §6 `FS12`: the pass window is the pass's OWN record span and containment is local to the pass, so no top-level span falls outside every pass window |
| **F5-5** | **`validateO0MeasurementShape` returns `ok:true` beside `F5-2`/`F5-3`/`F5-4`** (6/6 rows `ok:true`, `errors:[]`, `legacyShape:false`) — it carries no clause for either negative measure, for a collapsed pass window or for an uncovered top-level span | validator coverage gap | §7.3, §8.2, §13.1 | **RUL-12: the validator must FAIL (or record a FORCING reason) on `F5-2`/`F5-3`/`F5-4`** — the clauses are now pinned in §6 (`FS11`, `FS12`) and join the NEW surface's clause set; a validator that returns `ok:true` beside them is a review finding |
| **F5-6** | **The top-level `reconciliation.note` is `null` in BOTH legs** (the fourth edition carried the mandatory note there; the note-bearing statement now lives only on the rows). **No validator reason fired for its absence (0/0 in both legs)**, so it is not a failure under the current clauses | shape drift (recorded) | §7.1, §13.1 | **RUL-12: the top-level `reconciliation.note` must be PRESENT** (the §3.6b RUL-4 clause-5 mandatory note) and its absence a forcing reason; the note clause's row-level restatement is not a substitute |

### 12.5 The THREE TEST REDS the TestWriter left as COUNTEREXAMPLES (owner = the NEXT CYCLE)

Read at this pass in `tests/unit-o0-m1-m3-measurement-shape.test.ts`: **three reds —
`RULE-2`, `FIX-TP1`, `FIX-TP3`** — left deliberately as counterexamples for the next cycle.
**(The fifth-run artifact §13.3 recorded a DIFFERENT, earlier reading taken while the
TestWriter was mid-pass — "10 reds, 24 passed / 10 failed (34)" across the two new files,
with `ATTR-1`/`RULE-3` and `FIX-SM1`/`P-SM-1` among them. That reading is HISTORICAL; the
CURRENT red set is the three below.)**

| red | test | defect class | what it asserts / why it fails | the pinned fix |
| --- | --- | --- | --- | --- |
| **`FIX-TP1`** | `[P-TP-1] strat:o0-union-accounting` | **ORACLE defect** | the §4.1 identity `unaccountedMs === windowMs − accountedMs` — the oracle computes the row remainder from the **RAW union** while `accountedMs` reports the **CLIPPED union**, so on a span that extends past the window the identity breaks | `rowUnaccountedMs = windowMs − rowAccountedMs` (pin amended in §5 `P-TP-1`) |
| **`FIX-TP3`** | `[P-TP-3] strat:o0-longtask-attribution` | **ORACLE defect** (the same clipped/raw family; the artifact additionally records a sum-of-spans-vs-full-durations failure on the straddling fixture) | the pinned total must equal the start-inside sum of FULL durations EXACTLY and both rejected alternatives must be discriminated | the record must be derived from the SAME list the oracle consumes, with the pinned total the sum of FULL durations |
| **`RULE-2`** | `§3.4/S8/S9 the oracle is RE-DERIVED from the recorded list` | **SPEC CONFLICT** | as written, §2.3/`FS5`'s disjunct ("a `longTaskTotalMs` equal to a REJECTED alternative while claiming the pinned rule is refused") and §3.4's cross-check (`includedCount === longTasks.length`) are **mutually unsatisfiable on a discriminating list**: on an honest row whose observed list contains an EXCLUDED task, `longTasks.length > includedCount` by construction, and whenever no task straddles the window `overlapAnyMs = intersectionMs = includedMs`, so the disjunct fires on every honest row | **RUL-13 / §3.4 + §6 `FS5`**: cross-check `includedCount ≤ longTasks.length` AND `includedMs === longTaskTotalMs`, and SCOPE the alternatives disjunct to rows whose observed list contains at least one EXCLUDED task (where the rule actually discriminates) |

**Grouping, stated as the brief states it and mapped to the class:** the **two ORACLE
defects** are `FIX-TP1` and `FIX-TP3` (the row remainder taken from the RAW union while
`accountedMs` uses the CLIPPED union — the §2.1 identity violation), and the **one SPEC
CONFLICT** is `RULE-2` (§3.4's cross-check vs §2.3/`FS5`'s alternatives disjunct). **Not
verifiable from this role's tool wall (no shell): the exact per-red failure output at the
current tree state** — the classes above are read from the test sources' assertions and from
the fifth-run artifact's own red record; the next cycle's red run is the authority.

### 12.6 THE ARCHITECT'S RULINGS (binding) — `RUL-11`..`RUL-14`

**RUL-11 — `F5-4` first, then the band.** The next cycle fixes the partition so that **pass
0's span IS accounted** (or the pass boundary / nesting rule is corrected so no top-level
span falls outside every pass) and fixes `F5-2`/`F5-3`'s negative measures (a sign/definition
bug: **both must be non-negative MEASURES with the pinned semantics**, §2.3/§3.3). Only after
that is the band question adjudicated on a re-run. The union-based `unaccountedMs` is a
**MEASUREMENT-QUALITY quantity** (unexplained time in the window), **not an imputation**; if
it still exceeds the band after `F5-4`, the spec must **re-derive the band empirically for
the NEW quantity**, or record the over-band case as a **reported quality finding + a
row-level note rather than a report-level `FAIL` gate** — because a legitimate measurement
gap must not convert the DEC-1-accepted form into a FAIL. **Which of the two the spec now
pins: BOTH, in this order — (1) the band is RE-DERIVED EMPIRICALLY for the union remainder
(a fifth-run reading is not the basis for a band: the six rows read 40.7-156.8 ms on windows
of 80.5-2407.2 ms, i.e. **2.49-15.09 %** of the window on the four gesture rows and **50.5 %
/ 51.2 %** on the two zero-long-task ablation rows, so a single absolute constant is the
wrong shape for the quantity); and (2) an over-band remainder is a REPORTED QUALITY FINDING +
a row-level note, NEVER a report-level `FAIL` gate.** The alternative — keeping a row-level
forcing reason — is available ONLY by a user decision (it would change the DEC-1-accepted
form). **The band's
SCOPE is now explicit (§2.1/§3.3): the RETIRED summed residual has NO band;
`tolerance.reconcileMs` (50 ms) is the band for the UNION REMAINDER `unaccountedMs`;
`hook.toleranceMs` (40 ms) is the WINDOW-BOUND band and the hook-inertness band.** A reason,
verdict or gate that judges the union remainder against `hook.toleranceMs` is the
mis-scoped-band defect (§12.2 caution 1).

**RUL-12 — the validator must catch its own shape.** `validateO0MeasurementShape` must FAIL
(or record a FORCING reason) on **`F5-2`/`F5-3`/`F5-4`** — a negative double-count/overlap
measure, an unaccounted top-level span, a collapsed pass-0 window — and the top-level
`reconciliation.note` must be PRESENT (**`F5-5`/`F5-6`**). Pinned as §6 `FS11`/`FS12` + the
note clause; `ok:true` beside any of them is a review finding.

**RUL-13 — the spec conflict.** Amend **§3.4** to the **OBSERVED-list** cross-check
(`includedCount ≤ longTasks.length` **AND** `includedMs === longTaskTotalMs`) and **SCOPE the
§2.3/`FS5` alternatives disjunct to rows whose observed list contains at least one EXCLUDED
task** (i.e. where the rule actually discriminates) — otherwise the disjunct fires on every
honest row. **Why (recorded):** the two clauses as written are **mutually unsatisfiable on a
discriminating list** — a list that carries an excluded observation cannot have
`includedCount === longTasks.length`, and whenever no observed task straddles the window the
rejected alternatives COINCIDE with the pinned total (the fifth run's six rows all read
`overlapAnyMs = intersectionMs = includedMs`), so the unscoped disjunct refuses an honest
row. Amendment landed in §2.3/§3.4/§6 `FS5` (and referenced from §5 `P-TP-3`).

**RUL-14 — the artifact status.** **The fifth edition STANDS as the committed FAIL record**
(RCA-11: a changed harness invalidates prior provenance, and the failure is not hidden by
reverting the artifact). The next cycle's fix + the **SIXTH** live run must reproduce the
**DEC-1-accepted form** — `status:"OPEN-structural"`, `pass:false`, `selfValidation.ok:true`,
`errors:[]`, `gatingReasons:[]`, the window bound clean, the structural reasons verbatim, the
mandatory note present — **or, if the fix legitimately leaves a forcing reason, DEC-1 must be
re-adjudicated BY THE USER and never silently relabelled.** Until the sixth run lands, **the
accepted evidence is the FOURTH edition** (§12.7).

### 12.7 THE ARTIFACT STATUS AND THE ACCEPTANCE UPDATE (RUL-14 — record the caution explicitly)

**RESOLVED BY THE SIXTH RUN (§12.9): the caution below described the committed artifact
BEFORE the fix cycle finished. The SIXTH edition — the currently committed file — reports the
accepted form, so the caveat is CLOSED; it is kept verbatim here as the record of the state
the fix had to repair.**

> **CAUTION, recorded verbatim in the artifact's own terms: the ACCEPTED evidence under DEC-1
> is the FOURTH edition of `docs/specs/unit-o-0-per-stage-breakdown.md` (the
> `status:"OPEN-structural"` / `pass:false` / `selfValidation.ok:true` / `gatingReasons:[]`
> reading). The FIFTH edition — the currently COMMITTED file — reports `status:"FAIL"`,
> `pass:false`, `selfValidation.ok:false` (4/2 errors), `gatingReasons` 9/5. THEREFORE THE
> ACCEPTED FORM IS NOT CURRENTLY REPRODUCED BY THE COMMITTED ARTIFACT.**

- **The fourth edition's JSON is recoverable from git history** (the file's previous
  revision: run 4's renderer `678270+a25b03a9`, both legs' raw JSON embedded byte-exact; the
  record is `docs/specs/unit-o-0-per-stage-measurement.md` §12.14 and run 4's provenance is
  restated in the fifth edition's own banner/§15).
- **The ACCEPTANCE RULING IS UNCHANGED.** **DEC-1 still accepts the FOURTH edition's form** —
  `O0-SNAPSHOT-CLONE-STRUCTURAL-ACCEPTED` is **not** relabelled, **not** re-ruled and **not**
  withdrawn; the decision row carries an appended provenance clause recording exactly this
  state (`docs/decisions.md`). The fifth edition is a **FAIL pending the fix + a sixth run**;
  it neither invalidates DEC-1's content nor silently inherits the acceptance.
- **The unit's acceptance WAS:** the fix (`F5-4` → `F5-2`/`F5-3` → the validator clauses →
  the amendments) → the three reds green → the **SIXTH run regenerating the artifact as its
  SIXTH edition** reproducing the DEC-1-accepted form → the adversarial pass → the
  documentation review. **ALL OF IT HAPPENED except the structured adversarial pass, which
  stays OWED (§12.10 (5)); the unit is DONE (§12.9/§12.11).**
- **The O-5 delegation gate IS NOW OPEN ON THE SIXTH-EDITION FORM** (DEC-1 clause 3): the
  sixth edition is an accepted-structural report (`status:"OPEN-structural"`, `pass:false`,
  `selfValidation.ok:true`, `errors:[]`, `gatingReasons:[]`, window bound clean, structural
  reasons verbatim, mandatory note present), so the gate is unblocked and the
  "UNBLOCKED on the FOURTH-edition form / NOT opened by the fifth edition" sentence below is
  the pre-sixth-run state. **No reader may ever treat the fifth edition's FAIL as the accepted
  evidence** — it is, and remains, history.

**Amendments carried into this spec by the fifth run (all landed in this pass):** §2.1 (the
band's scope + the outcome-to-failure clause), §2.2 (unchanged — M2 is closed), §2.3 (the
`passLongTaskDoubleCountMs` measure definition + the FS5 disjunct reference), §2.4 (the
negative-MEASURE invariant), §3.2 clause 6 (the pass window = the pass's own record span +
the two coverage properties), §3.3 (`passOverlapSumMs` a genuine non-negative measure +
`passRowUnaccountedDeltaMs`), §3.4 (the OBSERVED-list cross-check), §5 (`P-TP-1`'s clipped-union
identity, S10's measured sign), §6 (`FS5` scoped; `FS11`/`FS12` new), §10 (the acceptance's
sixth-run path), §11 (the supersession record), §12 (this record).

**§12.8 THE ACCEPTANCE UPDATE (supersedes where it disagrees — RUL-14).** The §10 criteria
below were **AMENDED as follows, and the unit was NOT DONE until they were met on a SIXTH run
— they ARE met (§12.9/§12.11):**

1. **§10.7 (the mandatory live re-run) now reads "the SIXTH run"**: the fifth run RAN (RCA-11
   satisfied — the battery was not parked) but regenerated the artifact as a **FAIL**
   edition, so the unit's live gate was not met there. The sixth run DID regenerate the
   artifact as its **SIXTH edition** (runs 1-5 named SUPERSEDED) reproducing the
   **DEC-1-accepted form** (`status:"OPEN-structural"`, `pass:false`,
   `selfValidation.ok:true`, `errors:[]`, `gatingReasons:[]`, window bound clean, structural
   reasons verbatim, the mandatory top-level `reconciliation.note` PRESENT) — **CLOSED §12.9**;
   had the fix legitimately left a forcing reason, **DEC-1 would have been re-adjudicated by
   the user** and never silently relabelled (RUL-14) — it did not, so no re-adjudication was
   owed.
2. **§10.2 (no negative remainder) is extended to the whole MEASURE set** (§2.4/`FS11`): the
   fifth edition violated this for `passLongTaskDoubleCountMs` (−53 / −95 / −63) and
   `passOverlapSumMs` (−131.2 … −17.6), which the validator did not catch (`F5-5`).
3. **§10.10 (d) (the remaining reds) now reads THREE reds, not two:** `LIVE-1`/`LIVE-2` are
   the live-gate rows on the committed artifact, and the TestWriter's own red set left
   `RULE-2`, `FIX-TP1`, `FIX-TP3` as counterexamples (§12.5) — all three owed green by the
   next cycle before the sixth run. A stub, a parked battery or a rewritten pin stays a
   review finding. **CLOSED: all five are GREEN (the M1-M3 files 34/34; §12.9 (9)).**
4. **§10.6 (the suite) is re-read on the run that closes them** — the fifth-run artifact
   §7.6 recorded the trio as MID-REMAND and claimed no reading; **the SIXTH run reads it:
   219 files / 4 947 passed / 58 skipped / 0 failed (5 005), exit 0, typecheck 0, build 0**
   (§12.9 (9)); the O-0 suites read 114/114 unmodified and the two M1-M3 files 34/34.
5. **The validator gate (RUL-12) is added to the acceptance:** `validateO0MeasurementShape`
   must FAIL (or record a forcing reason) on `F5-2`/`F5-3`/`F5-4` and the top-level
   `reconciliation.note` must be present (`F5-5`/`F5-6`), with the clauses pinned in §6
   (`FS11`/`FS12` + the note clause). **CLOSED: `measurementShape.ok:true` on 6/6 with
   `FS11`/`FS12` LIVE and the note present on both legs (§12.9 (7)).**
6. **The artifact-status caution (§12.7) is part of the acceptance record:** the accepted
   evidence **WAS** the **FOURTH edition** until the sixth run (the committed FIFTH edition
   being a FAIL record that did NOT open the O-5 gate). **CLOSED: the accepted evidence is now
   the SIXTH edition, the caution is RESOLVED, and the O-5 gate is unblocked on it (§12.7's
   resolution note + §12.9 (10)).**

**Tracker edits made with this section (surgical):**
- **`docs/defects.md`** — `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` stays **OPEN** with the
  fifth-run FAIL, `F5-1`..`F5-6`, the 3 test reds, the root-cause lead (`F5-4`) and the
  rulings; and a **NEW row `O0-BAND-EXCEEDED-GATES-THE-REPORT`** files `F5-1` as its own
  distinct defect (the band-exceeded→gating class).
- **`docs/next-steps.md`** — the CURRENT WORK entry now leads with the fifth run's FAIL, its
  numbers, the positive closures, the open findings, the 3 reds and the next cycle (fix →
  green → SIXTH run → doc-review); the NEXT QUEUE order (O-5 → O-9+O-3 → O-10 → O-1 → O-2,
  O-4 conditional) is unchanged.
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — §12.15 records the fifth run's
  outcome + the artifact-status caution.
- **`docs/decisions.md`** — DEC-1's provenance clause (§12.7): the fifth edition reports FAIL,
  the accepted evidence is the FOURTH edition, the decision's content and its acceptance ruling
  are UNCHANGED. **This supersedes the "no `decisions.md` change owed" ruling of §9 for the
  post-fifth-run state.**
- **SUPERSEDED BY §12.9/§12.10 (the sixth run):** the fifth-run tracker state above (the row
  OPEN, the artifact FIFTH/FAIL, the accepted evidence the FOURTH edition) is history; the
  current state is `docs/defects.md` FIXED rows, the SIXTH-edition artifact, and the queue
  leading with **O-5**.

### 12.9 THE SIXTH RUN (2026-09-21) — the DEC-1-ACCEPTED FORM IS REPRODUCED (read this, not §12.1-§12.8, for the current state)

> **DOWNGRADE (2026-09-21, adversarial finding 4 — see §13.1 (4) and §13.5).** **The sixth run
> RAN and its recorded values are unchanged** — every number below is the artifact's own reading.
> What is downgraded is the **EVIDENCE CLAIM that this subsection's live form was CERTIFIED by a
> pinned oracle**: the committed live pins are a **text probe** (a `/FIFTH|fifth edition|5th/i`
> regex on the banner + whole-file `toContain` per field name) and the artifact is never parsed or
> re-validated by the shape oracle, so **"the §2/§3 shape is present on every row of both legs" is
> a HUMAN READING OF THE ARTIFACT pending the per-row parse+validate live pin (TEST remand)**.
> Everything else in this section stands as recorded measurement.

**Authority:** the SIXTH edition of `docs/specs/unit-o-0-per-stage-breakdown.md` (its §1
commands, §2 environment/build identity, §3 census, §4.4/§4.5 the new-shape tables, §5 the
long-task/attribution records, §6 the controls, §7 the derived verdicts + self-validation,
§8 the `F5-1`..`F5-6` closure evidence, §9 the window bound, §10 the run-4/5/6 comparison,
§11 the findings, §12.1/§12.2 the embedded raw JSON, §12.3 the byte-exact round-trip, §13 the
provenance table), read at this pass. **No number below is re-measured here** — every value is
the artifact's own recorded reading (`assembled-renderer`, RCA-12).

**(1) The commands (verbatim, as the artifact's §1 records them).** `npm run build` FIRST
(`docs/live-testing.md:119-124`), then the **GPU-OFF** leg (spawn path — no app was running):
`DISPLAY=:0 ASTROGRAPHER_O0_MAIN_ARM=1 node scripts/live-drive.mjs --seed=/tmp/o0-corpus-226
--corpus-root=/tmp/o0-corpus-226 --strict-seed --o0-corpus=226 --display=:0
--o0-out=/tmp/o0f-gpuoff.json
--block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism`, then the
**GPU-ON** leg (`--gpu --block=o0_gpu_control,o0_repeat_determinism
--o0-out=/tmp/o0f-gpuon.json`), then the trio (`npm test && npm run typecheck && npm run
build`). `driver.runMode:"spawn"` on both legs; the pinned `--connect` form was NOT used
(`pinnedCommands[]` records it as the spec's pinned set; no app was running, and `--connect`
cannot arm the main-side recorder). **No harness edit was made by the run pass** — the
`F5-1`..`F5-6` fixes + the clipped-union remainder + the OBSERVED-list cross-check were
already landed by the implementing cycle and are what this run verifies live.

**(2) Environment + bundle identity.** `driver.build.verified:true` on **BOTH** legs
(§3.6/`docs/live-testing.md:119-124`); renderer `1789972671852+678367+3e3f1b80` (GPU-OFF) /
`1789972750760+678367+3e3f1b80` (GPU-ON); main `1789972671735+2419628+1e652667` /
`1789972750644+2419628+1e652667`; served = on-disk on both legs. **The bundle identity is the
SAME as the fifth run's** (`renderer 678367+3e3f1b80`, main `2419628+e1e652667`) — the run
re-measures a bundle whose BYTES did not change while the HARNESS (`scripts/live-drive.mjs` +
`src/shared/o0-report.ts`) did, which is exactly what RCA-11's "a changed harness invalidates
the prior live provenance" scope covers. `env.mode:"lexical"`, `env.paneFrames:2`,
`env.engine:"absent"` with the recorded `fetch failed` evidence, `display:":0"`,
`tolerance.reconcileMs:50` (`source:"measured 2026-09-21"`), row window band
`hook.toleranceMs:40`, `driver.mainSeamArmed:false` / `mainSeamRecords:0` /
`mainTransport.channel:null`.

**(3) Census.** **226 = 226** on both legs (the pinned SIZE, `corpus.gate:"documents"`),
6 102 nodes / 9 266 edges recorded as provenance only (RUL-5/L10); no census-mismatch reason
in either leg. The corpus was re-verified (`find /tmp/o0-corpus-226 -name "*.md" | wc -l` →
226), NOT regenerated.

**(4) The verdict triple + the derived verdicts.** BOTH legs: **`status:"OPEN-structural"`,
`pass:false`, `driver.selfValidation.ok:true` with `errors:[]`, `gatingReasons:[]`** — i.e. the
DEC-1-accepted form, with the fifth run's `FAIL` GONE. `selfValidation.structuralErrors` 0
with `structuralFacts` **4 / 2**; `driver.openStructural:true`; `reconciliation.ok:false` /
`openStructural:true`; `reconciliation.bandExceededGate:false`;
`reconciliation.measurementShapeFailures:[]`; `reconciliation.note` PRESENT (716 chars
GPU-OFF / 640 GPU-ON) **plus** the row-level restatement on all six rows;
`reconciliation.bandExceededNotes` 2 per leg. **Every one of the six rows is `pass:true` with
an EMPTY `failReasons[]`, `measurementShape.ok:true` / `errors:[]` / `legacyShape:false`, and
`openStructural:true` with 1 structural stage.** The forcing-reason sets are empty while
`pass` is `false` because the MEASUREMENT is incomplete (`snapshot.clone` structurally
unseparated + the therefore-derived, non-attributable `post.style`) — **nothing is
relabelled `"OK"`**, and the structural reason is verbatim the RUL-3 text (artifact §4.3,
which the run re-records).

**(5) The per-pass table summary (artifact §4.4; 15 passes over 6 rows).** Pass counts:
folder = **2** (`["pre-pass-render","re-derive"]`), document = **3**
(`["pre-pass-render","re-derive","re-derive"]`) on both legs; `hook.records` 11 (folder) /
22 (document). **`Σ pass.records.count === hook.records`** on every row (11/11, 22/22, 11/11,
11/11, 11/11, 22/22) with strictly increasing, disjoint, exhaustive `records.indices`.
**Pass 0's collapsed `{0,0}` window is GONE:** pass 0 now reads a real measured span with its
own accounting (52.4 / 93.6 / 0.4 / 0.4 ms GPU-OFF; 67.5 / 88.5 ms GPU-ON; unaccounted
0 / 1.2 / 0 / 0 / 0.1 / 1.1 ms). The heavy pass is pass 1 on the gesture rows (span
917.3 ms carrying the 875 ms long task / 2 223.1 ms carrying 2 108 / 974.8 ms carrying 919 /
2 239.7 ms carrying 2 127; unaccounted 26.7 / 20 / 27 / 28.2 ms), and pass 2 is the short
trailing re-derive (span 91.3 / 85.9 ms, unaccounted 23.3 / 21.9 ms, no long task).
`overlapMs` = 0 and `sumOfSpansMs` ≥ `accountedMs` on 15/15 passes; every pass `pass:true`
with an empty `failReasons[]`.

**(6) The per-row reconciliation table + the IDENTITY (artifact §4.5/§8.3).**
**`unaccountedMs + accountedMs === windowMs` holds on 6/6 rows** (the `FIX-TP1` clipped-union
identity):

| leg / row | `windowMs` | `accountedMs` | `unaccountedMs` | identity | `passOverlapSumMs` | `passLongTaskDoubleCountMs` | `passTotalsMinusRowMs` / `passRowUnaccountedDeltaMs` | `bandExceeded` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF folder | 995.1 | 890.6 | **104.5** | 995.1 ✓ | **52.4** | **0** | −54 (`notADoubleCount`) / −77.8 (`notAMeasure`) | `true` + note |
| GPU-OFF document | 2331 | 2271.1 | **59.9** | 2331 ✓ | **93.6** | **0** | −95 / −15.4 | `true` + note |
| GPU-OFF ablation-off | 86.4 | 43.3 | **43.1** | 86.4 ✓ | **0.4** | **0** | 0 / −27.5 | `false`, no note |
| GPU-OFF ablation-on | 82 | 40.6 | **41.4** | 82 ✓ | **0.4** | **0** | 0 / −26.5 | `false`, no note |
| GPU-ON folder | 1064.6 | 947.8 | **116.8** | 1064.6 ✓ | **67.5** | **0** | −69 / −89.7 | `true` + note |
| GPU-ON document | 2338.2 | 2275.5 | **62.7** | 2338.2 ✓ | **88.5** | **0** | −89 / −11.5 | `true` + note |

**`overlapMs` and `outsideMs` are 0 on all six rows**; the two SIGNED diagnostics are the
only negative numbers anywhere and each carries its label (`notADoubleCount` / `notAMeasure`)
— **every MEASURE field is non-negative on 6/6 rows and 15/15 passes** (`F5-2`/`F5-3`
CLOSED). The bare `hook.armCount`/`hook.disarmCount` read `undefined` on all six rows
(`M2` stays closed); `postStyle.residual` and `reconciliation.residual` are `null` +
`retired:true` + `retiredBy`, and the legacy formula survives only as
`reconciliation.naiveSumResidualMs` + `naiveSumResidualNote:"notAResidual"` (−86 / −1 873.8 /
−44.8 / −42 / −98.2 / −1 872.4).

**(7) The `F5-1`..`F5-6` closure evidence, live (artifact §8/§11.1 — the rule: a finding is
closed only where the emitted JSON shows the fixed behaviour).**

| finding | fifth run (FAIL) | sixth run (this) | status |
| --- | --- | --- | --- |
| `F5-1` the band outcome gates the report | `row.pass:false` → 9/5 gating → `status:"FAIL"` | **4/6 rows `bandExceeded:true` with a `bandExceededNote` + a `row.notes[]` + an `outcomeReasons[]` entry, the 2 ablation rows INSIDE the 50 ms band and note-free, and `gatingReasons:[]` / `status:"OPEN-structural"`** | **CLOSED** |
| `F5-2` `passLongTaskDoubleCountMs` negative | −53 / −95 / −63 | **`0` on 6/6 as a MEASURE; the signed form is `passTotalsMinusRowMs` + `notADoubleCount`** | **CLOSED** |
| `F5-3` `passOverlapSumMs` negative | −131.2 … −17.6 | **non-negative 52.4 / 93.6 / 0.4 / 0.4 / 67.5 / 88.5; the signed form is `passRowUnaccountedDeltaMs` + `notAMeasure`** | **CLOSED** |
| `F5-4` pass 0 collapsed / its span accounted by no pass | pass 0 `{0,0}`; the deficit was the negative `passOverlapSumMs` | **pass 0 a real span; the passes' clipped top-level union `===` the row's declared `accountedMs` on 6/6; worst owner-coverage gap 0.000 ms; Σ pass records `=== hook.records`; every pass window inside its freeze window** | **CLOSED** |
| `F5-5` validator `ok:true` beside the defects | `ok:true` with no clause to catch them | **`measurementShape.ok:true` on 6/6 with `FS11`/`FS12` LIVE** (the same validator's `FS12` clause recomputes the owner coverage pass 0 now passes — so the `true` is meaningful, with the recorded caution that a validator is only as strong as its clause set) | **CLOSED** (with the §7 §3a/§3b pass **RAN 2026-09-21 — see §13; the validator's `ok:true` is re-opened as a coverage question by §13.1 (2)/§13.2 (8)**) |
| `F5-6` top-level `reconciliation.note:null` | `null` both legs | **non-null (716 / 640 chars) + the row-level restatement on all six rows** | **CLOSED** |

**The three test reds are GREEN (artifact §8.7):** `FIX-TP1` (the clipped-union identity
6/6), `FIX-TP3` (`includedMs === longTaskTotalMs` 6/6 + `includedCount ≤ longTasks.length`
6/6, the record derived from the same observed list the oracle consumes), `RULE-2` (the
OBSERVED-list cross-check `≤` not `===` + the alternatives disjunct SCOPED so it is silent
where it would otherwise fire).

**(8) The pinned long-task attribution (`M3`) and the controls.** Every row:
`rule:"start-inside-inclusive"`, `includedMs === longTaskTotalMs` (929 / 2 203 / 0 / 0 / 988 /
2 216), `includedCount ≤ longTasks.length` (2/2, 2/2, 0/0, 0/0, 2/2, 2/2), `ambiguous:false`,
`startBefore:[]`, `straddlesEnd:[]`, `startAfterCount:0`. **The window bound is CLEAN:** worst
arm-window overshoot **+0.1 ms** against the recorded **40 ms** window-bound band,
`violated:false` on all six rows, `outsideMs:0` and an empty `outsideOffenders[]`. **Inertness
`inert:true` in BOTH legs** (Δmutations 0 = 37 vs 37, the MUTATION-HALF sentence verbatim, the
long-task half VACUOUS at 0-vs-0 with `nonVacuous:false`, `setEqual:true`,
`controlledPair:true`). **Controls:** the track ablation Δ 0 ms long-task / Δmutations 0 /
ΔwallMs −4.4 ms (available, applied, reverted — not shown load-bearing at this scale); the GPU
delta (ON−OFF) **+59 ms folder / +13 ms document** with identical mutation counts
(37/37, 11 758/11 758) — **no separable GPU effect**, re-confirming the run-3 finding. **A-4
holds: 1 / 2 reads** (folder disclosure / document open; awaited round trips 76.6 / 173.9 ms
GPU-OFF and 90.3 / 165.3 ms GPU-ON). Shares: `traversal.build` **68.891 % / 69.231 %** (folder),
`reconcile.apply` **94.103 % / 94.337 %** (document) — O-4 unchanged in substance. **The row
still claims no style/layout share** (`post.style` `derived`/`ms:null`,
`unaccountedSource:"derived"`, `unaccountedAttributable:false`).

**(9) The trio + the register.** `npm test` = **219 files passed (219) / 4 947 passed /
58 skipped / 0 failed (5 005 total), exit 0**; `npm run typecheck` **0**; `npm run build` **0**
(identity above). **The O-0 suites 114/114** (report-contract 50 + hook-contract 39 +
driver-contract 25, UNMODIFIED — RUL-7/§2.5a) and **the two M1-M3 files 34/34** (the 33-pin red
baseline turned green; `LIVE-1`/`LIVE-2` green on the committed SIXTH-edition artifact, i.e.
RUL-10 satisfied). **Register: the M1-M3 six rows all `held` at the landed 360-attempt budget**
(the pre-existing O-0 8 rows stay `held` at their own budget).

**(10) The DEC-1 caveat is RESOLVED (RUL-14).** The artifact's §13 provenance table records the
sixth edition as **CURRENT** with verdict `OPEN-structural` / `pass:false` / `ok:true` —
"the DEC-1-accepted form, reproduced" — and **the fifth edition's FAIL record stays inside the
record as history** (its own row in the same table: `FAIL` / `ok:false` (F5-1..F5-6),
SUPERSEDED, preserved in the file's git history). The fifth run is therefore **not** deleted,
softened or relabelled: it is the intermediate FAIL that forced the fix. **The O-5 delegation
gate is now UNBLOCKED on the SIXTH-edition form** (DEC-1 clause 3 — an accepted-structural
report with `selfValidation.ok:true` / `gatingReasons:[]` opens it), and the earlier
"UNBLOCKED on the FOURTH-edition form / NOT opened by the fifth edition" statement is
superseded by this run's evidence. **CORRECTED 2026-09-21 (the RCA-3 adversarial pass, §13): the
gate reads "O-5 unblocked ONCE the shape-oracle MUST-FIX set lands" — the artifact's LIVE FORM is
accepted under DEC-1, but the ORACLE that CERTIFIES it has 3 MUST-FIX gaps (§13.1 (1)-(3)), so O-5
is NOT unblocked while those are open.**

### 12.10 The vs-run-5 comparison and the CARRIED (non-defect) items

**What MOVED run 5 → run 6 (artifact §10.2).**
1. **The shape of the exit condition changed KIND:** `status` `FAIL` → **`OPEN-structural`**;
   `selfValidation.ok` `false` → **`true`**; `errors` 4 / 2 → **0 / 0**; `gatingReasons` 9 / 5 →
   **0 / 0**; per-row `pass` `false` on 6/6 → **`true` on 6/6** — with the band outcome still
   VISIBLE on the four over-band rows (`bandExceeded` + note + `outcomeReasons`). **The fix did
   not achieve this by hiding the remainder.**
2. **The remainders moved and the shape is now coherent:** GPU-OFF folder **156.8 → 104.5 ms**
   (−52.3), GPU-OFF document 56.8 → 59.9 (+3.1), ablation-off 40.7 → 43.1 (+2.4), ablation-on
   41.9 → 41.4 (−0.5), GPU-ON folder 110.9 → 116.8 (+5.9), GPU-ON document 60.9 → 62.7 (+1.8).
   The row whose deficit the fix targets (the folder gesture, where the collapsed pass-0 span
   was the largest share) dropped most.
3. **The mis-scoped band is gone:** the row reasons no longer print `hook.toleranceMs` (40 ms)
   for the union remainder — the union band is `reconciliation.toleranceMs` (**50 ms**) and the
   window-bound band keeps its own field (`windowBoundToleranceMs` **40 ms**). The two ablation
   rows that the fifth run failed against 40 ms are now INSIDE the real band.
4. **The signed forms moved to labeled diagnostics** (`passTotalsMinusRowMs` /
   `passRowUnaccountedDeltaMs`) and the measure-named fields are non-negative.
5. **Absolute ms moved by a few percent on a byte-identical bundle** (GPU-OFF windows
   1 038.9 → 995.1 ms folder / 2 279.8 → 2 331 ms document; GPU-ON 1 032.4 → 1 064.6 /
   2 407.2 → 2 338.2) — a single-session reading of the same corpus shape. **No cross-run
   absolute ms comparison is a measurement** (RUL-5/L9/L10).
6. **The GPU delta moved AGAIN** (run 3 +42 / −9; run 4 −53 / +15; run 5 +39 / +119; run 6
   **+59 / +13**) — five runs, five near-zero or contradictory readings; no separable effect is
   claimed in either direction.
7. **Nothing regressed structurally:** both gestures `path:"cdp"` / `realInput:true` with the
   recorded hit ids; the stage-id SET equal (11 ids); census 226 with no mismatch reason;
   per-id aggregation identity on the ten record-producible ids; `pendingSpans:0`,
   `dropped:0`, `refused:[]`, `quiesced:true` on every row.

**CARRIED, not defects (recorded so no reader over-reads them).**
1. **The union remainder still exceeds the 50 ms band on 4/6 rows** (104.5 / 59.9 ms GPU-OFF;
   116.8 / 62.7 ms GPU-ON; 10.50 % / 2.57 % / 10.97 % / 2.68 % of their windows). Under RUL-11
   this is a **reported measurement-quality finding + a row note, never a gate** — and the band
   for the NEW quantity is **still to be re-derived empirically before any band-driven gate is
   re-pinned**. **RUL-11's second half therefore STAYS OWED as a spec item** (it is not a
   blocker for this unit and not a defect of the sixth run); its home is the OWED list in
   `docs/next-steps.md` NEXT QUEUE + `docs/defects.md` (`O0-BAND-EXCEEDED-GATES-THE-REPORT` is
   FIXED; the band re-derivation is the remaining half of RUL-11).
2. **`snapshot.clone` remains structurally unseparated** (DEC-1's accepted gap; `structuralFacts`
   4 / 2): the main-side transport does not exist, so the residual cannot be computed and
   `post.style` stays `derived`/`ms:null`/`attributable:false`. **This is why `pass` is `false`
   on an otherwise clean report** — the DEC-1 visibility invariant, untouched, and the transport
   stays a SEPARATE unit (`docs/pending.md`, PARKED).
3. **The attribution rule's DISCRIMINATION is NOT claimable from this corpus:** on all six rows
   `overlapAnyMs = intersectionMs = includedMs` (no observed task straddles either endpoint,
   `startBefore:[]`/`straddlesEnd:[]`/`startAfterCount:0`), so the run does NOT separate the
   three rules. The discrimination is `P-TP-3`'s job on GENERATED lists (green in the suite,
   §8.7) — **recorded here so no one quotes the corpus as discrimination evidence.**
4. **One geometry fact, recorded as an idle-time observation (NOT a measured field):** on the
   document rows the passes' windows do not tile the freeze window — GPU-OFF pass 1 ends at
   `t1` 12067.3 while pass 2 opens at `t0` 12072.1 (**4.8 ms** inter-pass gap), and GPU-ON pass 1
   ends at 12048.1 while pass 2 opens at 12048.6 (**0.5 ms**). That idle time lies inside the
   freeze window and legitimately lands in `unaccountedMs`; **the artifact does not tabulate
   it** (its §8.3 records the coverage/identity properties, not a gap table), so it is a
   derived reading from the embedded JSON, not an artifact number. **(An earlier brief value of
   "103.8 ms" for this gap could NOT be reproduced at either leg — both `t1`/`t0` pairs above
   come straight from the embedded `hook.passes[].window` fields, and the per-record timestamps
   agree with them; recorded as a correction.)** No decomposition of the remainder into
   idle-time vs nested-span components is claimed anywhere.
5. **`§7` `§3a`/`§3b` (the RCA-3 adversarial pass on the landed shape) — `RAN 2026-09-21, the
   record is §13` (this bullet read PENDING at the doc-review pass; that was the state BEFORE the
   adversarial pass, which has now RUN and found 4 MUST-FIX + 5 SHOULD).** The sixth run's live
   closure table (artifact §8) remains behavioural evidence, **not** the structured pass — and the
   pass found that the closure table's own certification claim is weaker than the DONE row states
   (§13.1 (1)-(4), §13.5). **The unit is RE-OPENED on those findings** (status block; §13.4).
6. **`legacyShape`/`legacyShapeReason`** are emitted on every sixth-run row
   (`legacyShape:false`, `legacyShapeReason:null`), which is the RUL-8 outcome field working.
   No run row exercises the positive (`legacyShape:true`) case live — that remains a NEW-surface
   test obligation, as §2.5a already states.

### 12.11 The gate items CLOSED (§10/§11 status) + the LAYER statement

**(SIXTH-RUN RECORD — HISTORY: the same ten criteria were re-closed on the NINTH edition, under a
named oracle, in §15.10; read that for the current state.)** **Every §10 acceptance criterion is
then met on the SIXTH-edition artifact**, with the §12.8
amendments satisfied:
1. **§10.1 (the artifact's shape on every row of both legs) — CLOSED:** `hook.passes[]` with the
   §4.2 field set on 15/15 passes, `hook.longTaskAttribution`, the four counters + `sessionCountsAt`,
   and the reconciliation remainder fields on 6/6 rows.
2. **§10.2 (no negative residual/remainder) — CLOSED, in the amended whole-MEASURE form**
   (§2.4/`FS11`): all six rows and all 15 passes carry non-negative measures; the two signed
   diagnostics are labeled and are not measures.
3. **§10.3 (the document row's passes individually reconciled) — CLOSED:** pass 0
   (pre-pass-render), pass 1 (the heavy re-derive carrying the ~2.1 s long task) and pass 2 (the
   short trailing re-derive) each carry their own window, stage sums and accounting;
   `passKindSequence` matches.
4. **§10.4 (per-row arm/disarm counters) — CLOSED:** `rowArmCount 1` / `rowDisarmCount 1` on
   every armed row, the session counters labeled `session*`, the retired aliases ABSENT (M2).
5. **§10.5 (the long-task rule DOCUMENTED and ASSERTED) — CLOSED:** the `start-inside-inclusive`
   rule with window/count/total and the two rejected alternatives' totals is on every row, and
   `P-TP-3` discriminates the three rules on generated lists in the green suite.
6. **§10.6 (the O-0 suite + the full suite stay green) — CLOSED:** the three pre-existing O-0
   files are UNMODIFIED and read **114/114**; the full suite reads **219 / 4 947 / 58 / 0, exit
   0**; typecheck 0; build 0.
7. **§10.7 (the mandatory live re-run) — CLOSED:** the SIXTH run RAN (not parked, RCA-11) on
   freshly-built, identity-verified bundles and regenerated the artifact as its **SIXTH
   edition** (runs 1-5 SUPERSEDED, both legs embedded verbatim, byte-exact round-trip verified).
8. **§10.8 (the retired fields provably retired) — CLOSED:** no numeric `postStyle.residual` /
   `reconciliation.residual`; no bare `hook.armCount`/`disarmCount` reading; the honest
   remainder under its new names.
9. **§10.9 (the DEC-1 preservation observable) — CLOSED:** `P-SM-2` holds live on all six rows
   (`ms:null` + `unseparated:true` + `attributable:false`; no remainder quoted as a style cost).
10. **§10.10 (back-compatibility observable) — CLOSED:** (a) the legacy path provably unchanged
    (114/114, files unmodified); (b) the new surface scoped; (c) the legacy-class outcome
    explicit (`legacyShape:false`/`null` on the emitted rows — the field works, the positive
    case remains a test obligation); (d) **the live-gate rows are no longer red** —
    `LIVE-1`/`LIVE-2` are green on the committed SIXTH edition **as TEXT PROBES — see §13.1 (4)
    (their green does NOT certify the per-row shape; the per-row parse+validate live pin is the
    TEST remand that replaces them)** and the three counterexample
    reds are green, so **no red remains from this unit's red baseline**.

**The LAYER statement (RCA-12, mandatory on the DONE row).** This unit is **DRIVER/ORACLE
MEASUREMENT-SHAPE — an `assembled-renderer` MEASUREMENT unit**. Its live evidence is a real
hit-tested CDP gesture against the executing `dist/` bundle (`driver.build.verified:true`
both legs), and its node evidence is the pure oracle/validator + the 34 pins.
**A green here is a MEASUREMENT-SHAPE GREEN — never app-green:** it says the oracle and the
report shape are total and the values were measured; it says NOTHING about app behavior
(the unit changes none — `src/**` carries only the additive, inert-when-unarmed
`O0HookRecord.startMs`/`endMs`), and it never licenses quoting the remainder as a style/layout
cost. **The unit CHANGES NO APP BEHAVIOR**, and no page-design artifact is owed
(`docs/skills/designing-pages.md` does not exist in this tree).

**Tracker edits made with §12.9-§12.11 (surgical):**
- **`docs/defects.md`** — `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` → **FIXED (2026-09-21)** with
  the closure evidence (`M1`/`M2`/`M3` live-verified; `F5-1`..`F5-6` closed; the identity; the
  non-negative measures) and the carried items; `O0-BAND-EXCEEDED-GATES-THE-REPORT` → **FIXED
  (2026-09-21)** (the gate is removed; the band is a reported finding), with the RUL-11
  band-re-derivation kept as an OWED spec item.
- **`docs/next-steps.md`** — the M1-M3 **DONE row** + the **NEXT QUEUE renumbered** to lead
  with **O-5**.
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — **§12.16** (the sixth run: the accepted
  form reproduced; the artifact is the SIXTH edition; the DEC-1 caveat RESOLVED).
- **`docs/decisions.md`** — DEC-1's provenance appended: the sixth edition reproduces the
  accepted form; the fifth-edition caveat is resolved; **DEC-1's content unchanged**.
- **`docs/pending.md`** — the `snapshot.clone` park row's constraint re-affirmed (no M1-M3 row
  exists there to retire — recorded explicitly).
- **`docs/HANDOFF.md`** — the CURRENT STATE count claim re-read to **219 / 4 947 / 58 / 0**.

---

## 13. THE RCA-3 ADVERSARIAL PASS (2026-09-21) — 4 MUST-FIX + 5 SHOULD; **THE UNIT WAS RE-OPENED THEN — ALL FINDINGS ARE NOW LANDED (§13.6) AND THE UNIT IS DONE (§15)**

**Status of this section: the FINDINGS' record (every one of them LANDED — see §13.6 for the
per-finding FINAL status and §13.7 for what is still owed; §13.4's ordered cycle RAN, through the
`F7-1` FAIL, the EIGHTH run and the NINTH run's closure — §15).** It was opened **by the RCA-3 adversarial pass over the three
units landed in this goal** (the migration unit, the validator unit, this unit), run read-only
(`AGENTS.md` item 7). **The authoritative findings are the 4 MUST-FIX + 5 SHOULD below; each carries
its counterexample, its file/symbol+line citation, and its verdict.** The **status block at the top
of this spec is the STATUS** (OPEN; §7 §3a/§3b and §10/§12.9's live-evidence claims point here).
**Read §13.1-§13.3 before quoting ANY of §2-§6 as enforced: three of the clauses this spec pins are
NOT carried by the landed oracle (§13.1 (1)-(3)).**

**Verification scope (stated honestly).** This role read the cited code paths and test sources with
its read tools and verified every file:line citation below against the current tree; **no shell, so
no test was RUN and no reading is claimed from a suite execution** — where the landed *behaviour*
matters (as opposed to the source clause) the disposition says so explicitly.

### 13.1 MUST-FIX (4) — each one breaks a clause this spec pins

| # | finding | counterexample (verified) | verdict |
| --- | --- | --- | --- |
| **(1)** | **`partition.row.pass` is ASSERTED, not derived** — the row verdict is `pass: errors.length === 0 && rowShapeFailures.length === 0` (`src/shared/o0-report.ts`, the `row:` object returned by `partitionO0RowPasses`), i.e. it **ignores `failReasons`** — contradicting **§4.2** ("a pass with `failReasons` non-empty forces the row `pass:false`") and **§6** ("a row whose `pass` is `true` while any `FS-n` observable of this unit holds is a review finding"). | An **UNOPENABLE record set** (no top-level `snapshot.pull`) pushes the reason at the `openers.length === 0` branch (`o0-report.ts`, the `'the record set is UNOPENABLE'` push) yet returns `row.pass:true`. **Inversely**, the legal empty/unarmed case returns `row.pass:false` **with `failReasons:[]`** — `emptyRow()` (the `pass: false, failReasons` pair in the function's return literal) — which is exactly "`pass:false` with an empty `failReasons`", the schema error §6 names. | **HOST-FIX-HERE** — `row.pass` must be **DERIVED**: `row.pass === (row.failReasons.length === 0)`, with §4.2's pass-level rule still forcing the row's reason set (a pass with `failReasons` non-empty ⇒ the row's set is non-empty ⇒ the row is `pass:false`), and the two counterexample directions each got a test: an unopenable set ⇒ `pass:false` **with** the reason present; the legal empty/unarmed case ⇒ `pass:true` with `failReasons:[]` (or the pair must be made consistent under a pinned rule — the current pair cannot be read as either). |
| **(2)** | **The per-id aggregation identity was DEMOTED to a non-forcing note** — the identity `row.stages[id].ms === Σ pass.stages[id].ms` is computed into **`aggregationNotes`** (returned in `notes[]`), and the code's own comment records the demotion verbatim ("the identity is a REPORTED check (`notes[]`), never a forcing reason"), while **§4.2 pins the mismatch as `pass:false`** and **§6 `FS2`** carries the reason `the per-id aggregation identity fails for …`. | Records summing to **20 ms for `render.ssr`** against a declared row value of **4 000 ms** ⇒ `ok:true` (the note is minted and nothing else moves). **This removes the only oracle tying the recorded per-stage sums to the record list — i.e. the `M1` symptom this unit exists to close** (a Σ-vs-window breach can no longer be seen from the sums at all), **and it is what lets a fabricated top-level span absorb the remainder.** | **HOST-FIX-HERE** — the identity returns to the **forcing** set: a per-id mismatch ⇒ `ok:false` + `pass:false` + the `FS2` reason naming the id, the row value and the pass sum; the `notes[]` copy may stay **in addition**, never instead. **TESTWRITER-REMAND (the positive pin)**: a live/constructed row with a deliberately mismatched per-id sum must be RED, and the sixth-edition artifact must be re-checked under the forcing form on all six rows. |
| **(3)** | **The recorded attribution fields are TRUSTED, not re-derived** — the validator prefers the row's own `startBeforeOverlapMs`/`straddleEndMs` (`isNonNeg(att.startBeforeOverlapMs) ? att.startBeforeOverlapMs : derivedAtt.…`) and uses them for the ambiguity clause; **only `includedCount` is re-derived** from the observed list. **§3.4** ("the excluded observations are never silently absent from the record … A mismatch is `pass:false` (`FS5`)") is **unenforced for the two overlap totals**. | A **50 ms task starting before the window with a recorded overlap of 0** passes every clause: the two totals read 0, so the ambiguity clause is skipped and nothing is compared against the re-derived overlap; the same holds for a straddling task whose recorded `straddleEndMs` is understated. | **HOST-FIX-HERE** — re-derive both totals from the recorded `longTasks[]` window list **always** and make a mismatch `pass:false` with the `FS5` reason (recorded ≠ derived, both numbers named); the re-derived values are the verdict's inputs, the recorded ones are the provenance. |
| **(4)** | **MUST-FIX (TEST / PROCESS): the live gate is a TEXT PROBE.** `LIVE-1` requires the artifact to match **`/FIFTH\|fifth edition\|5th/i`** (`tests/unit-o0-m1-m3-driver-contract.test.ts:265`) while the **committed banner reads SIXTH** — it passes only because the fifth edition survives as **prose** in the file; **`LIVE-2`** is a whole-file **`toContain`** per field name (`:272-277`), which cannot establish "on every row of both legs"; the negative probes are whole-file regexes (`"armCount"\s*:\s*\d`, `"residual"\s*:\s*-?\d`, `"unaccountedMs"\s*:\s*-\d`) that a single matching string anywhere satisfies or fails. **The artifact is never parsed and never re-validated by `partitionO0RowPasses`/`validateO0MeasurementShape` anywhere in the suite.** | **Both pins would plausibly be GREEN on the FIFTH (FAIL) edition** (its banner contains "FIFTH"/SUPERSEDED and its JSON carries every field name), so the DONE claim "**LIVE-1/LIVE-2 green ⇒ the accepted form reproduced**" rests on a **human reading**, not on the pinned oracle. | **TESTWRITER-REMAND + EVIDENCE DOWNGRADE (done in §13.5).** The owed pin: **`JSON.parse` both legs' embedded JSON, then per row (both legs) call `validateO0MeasurementShape(row)` and `partitionO0RowPasses(row)`** and assert `pass ⇔ failReasons.length === 0`, the identity, non-negative measures, `openStructural`, the retired fields and the note — a **per-row structural live pin**, with the text probe demoted to a banner-only provenance check (`/SIXTH\|sixth edition/`). |

### 13.2 SHOULD (5) — each with its owner

| # | owner | finding | counterexample (verified) | disposition |
| --- | --- | --- | --- | --- |
| **(5)** | **HOST** | **The mandatory-note clause is DODGEABLE when `status` is absent.** The note clause is gated on a **declared** `status` (`rep.status !== undefined && rep.status !== null && derivedFromFinalReasons.status === 'OPEN-structural' && note missing`, `src/shared/o0-report.ts` — the `err('report status is "OPEN-structural" without a reconciliation.note …')` block), and **`status`/`reconciliation` are ABSENT from `REQUIRED`** (`const REQUIRED = ['artifact','spec','unit','date','layer','commands','driver','tolerance','corpus','env','stageIds','runs','controls','verdicts','pass']`). | A **`PD3`-style fixture with `status` deleted** returns **`ok:true` with the mandatory note missing** (the clause short-circuits on the first conjunct). | **HOST-FIX-HERE** — add `status` and `reconciliation` to `REQUIRED`, and gate the note clause on the **derived** status rather than the declared one, so a missing note is a forcing reason regardless of what the report declares. **This is the SAME clause the Unit-2 (validator) DONE row over-claims on** ("the missing-note clause is a genuine forcing reason" is true only on a report that declares `status`) — the row's wording is corrected in `docs/defects.md`; the unit's other findings are unaffected. |
| **(6)** | **TEST** | **The §2c-6 timeout CEILING is not pinned on the committed config, and Pin 4 does not pin the PRODUCTION importer.** `checkConfigText` (`tests/unit-v5-migration-contract.test.ts:178-188`) accepts **any** `testTimeout ≥ 15000` (its single budget branch is `Number(...) < 15000 ⇒ error`), so a raise to 20 000/60 000 ms — the §2c item 6 blanket override that launders the Class-C driver defect — passes Pin 3 and `P-TP-2`; and **Pin 4** drives the **store's** `applyBatch` with a synthesised op list, not `src/main/markdown-import.ts`. | A committed `testTimeout: 60000` ⇒ green. A **revert of `src/main/markdown-import.ts` to a per-op `putNode`/`putEdge` loop would leave Pin 4 GREEN** (the pin never reads that file). **Re-verified at this pass: the production importer IS still the ONE-`applyBatch` form** (`markdown-import.ts`: all `putNode` ops then all `putEdge` ops in one `ops[]`, then `const result = await ctx.store.applyBatch(ops)`) — so this is a **pin-coverage gap, not a present regression**. | **TESTWRITER-REMAND** — an explicit `≤` bound on the committed value (item 6's condition asserted directly) and a **source-contract assertion on `src/main/markdown-import.ts`** (ONE `applyBatch`, no per-op loop), i.e. the same shape the Class-C half already carries for the test driver. Recorded in `docs/specs/unit-v5-migration.md` §3.3 (the OWED note) + `docs/defects.md` + `docs/next-steps.md`. |
| **(7)** | **HOST** | **The union band is read from a field NO producer emits.** `partitionO0RowPasses` takes the band from **`hook.reconcileToleranceMs`** (`o0-report.ts`, the `toleranceMs` binding: `isNonNeg(hook && hook.reconcileToleranceMs) ? hook.reconcileToleranceMs : O0_RECONCILE_TOLERANCE_MS`) — a field the driver and the committed artifact **do not emit** — while the report separately records **`reconciliation.toleranceMs`** (the driver's `tolerance.reconcileMs` 50 ms with `tolerance.source`), so **the band the oracle uses and the band the report declares are TWO READINGS THAT CAN DRIFT**; `tolerance.source` names a **date ("measured 2026-09-21") for a COMPILE-TIME constant** whose empirical re-derivation (RUL-11's second half) is owed; and **`partition.failReasons` includes `rowOutcomeReasons`** (the band-exceeded statement), so a consumer that greps `failReasons` can **reintroduce the `F5-1` gate the sixth run removed**. | A row whose hook carries no `reconcileToleranceMs` is banded by the **default constant** while its report says 50 ms ⇒ the two readings disagree with no observable; a consumer that treats `failReasons` as the forcing channel sees a band-exceeded remainder as a failure again. | **HOST-FIX-HERE** — ONE authoritative band: the driver emits the field the oracle reads (or the oracle reads `reconciliation.toleranceMs`), the report and the oracle assert the SAME value, `tolerance.source` becomes a **derivation** claim (not a date) or is re-labelled as a constant's provenance, and `rowOutcomeReasons` is kept **out of `partition.failReasons`** (its own labeled channel, as the sixth run does for `outcomeReasons[]`). §2.1's "`toleranceMs = hook.toleranceMs`" scoping sentence and §12.2(1) are corrected in this pass (§12.2 blockquote) — the re-derivation itself is owed. |
| **(8)** | **HOST** | **`validateO0MeasurementShape` has four coverage gaps AND one IMPUTATION** — it never checks (a) a pass window against the **freeze band** (`FS6`'s pass-window half), (b) the row's own **`pass`/`failReasons` consistency** (the `FS-n`-vs-`pass:true` rule of §6), (c) the declared **`reconciliation.{windowMs, accountedMs, unaccountedMs}`** against the **derived** accounting; and it **IMPUTES `passIndex = 0`** on a row with no `hook.passes` (the `d.passIndex === undefined` branch: `else if (!Array.isArray(hook.passes) && !hasOpeners) d.passIndex = 0` / `else if (!Array.isArray(hook.passes)) d.passIndex = 0` — the two arms together impute `0` for **every** no-passes row). | A pass window 300 ms outside the freeze window ⇒ `ok:true`; a row with `pass:true` beside a shape failure ⇒ `ok:true`; a row declaring `accountedMs: 9999` on a 100 ms window ⇒ `ok:true`; and a **no-imputation contract row has a FABRICATED `passIndex: 0` written into its own entries** (the partition's derived value is overwritten on the artifact the validator inspects). | **HOST-FIX-HERE** — add the three clauses to the NEW surface's set (a fourth `FS`-class reason per gap is acceptable; `FS6` already exists for (a)) and **remove the imputation**: an absent `passIndex` on a row with no `hook.passes` is a **reported missing value** (`FS10`-class, naming the field path), never `0`. |
| **(9)** | **SPEC** | **Three spec claims are stale against the landed code / the landed pins** (each is corrected in this pass, the re-derivation recorded as owed): (a) **§12.2 caution 1's** "the row band comparison is made in the pure oracle from `toleranceMs = hook.toleranceMs`" — **stale** (the landed clause reads `hook.reconcileToleranceMs`; finding 7); (b) **P-TP-2's** "the §2c ceiling is enforced by the §3.3 pin" — **not enforced** (finding 6); (c) **§10.1/§10.2's** live evidence — a **prose reading**, pending the per-row parse+validate live pin (finding 4). | The three claims as written; each is contradicted by the citations above. | **SPEC-RE-DERIVATION (owed; recorded)** — (a) corrected in §12.2's blockquote (the "two readings can drift" statement + the owed re-derivation named), (b) corrected in the same blockquote + `docs/specs/unit-v5-migration.md` §3.3's OWED note, (c) downgraded in §10's acceptance block + §12.9's downgrade note + §13.5. The **re-derivation itself** (the band for `unaccountedMs` derived empirically; the source-of-band clause re-pinned on ONE field) remains an OWED spec item for the next cycle. |

### 13.3 NOTE (2, ACCEPTED-RISK — recorded, not owed)

1. **The new deep-row margin (Unit 1, ACCEPTED-RISK).** The migration unit's deep rows read
   **≈11.5 s under load** against the **15 000 ms** committed ceiling — **≈1.3× headroom**, i.e. a
   load spike of ~30 % past the observed reading turns the row red. This is **accepted** (the
   ceiling is sized to keep the Class-C defect visible, and the unit's own §2b records the sizing
   rationale); it is recorded here so a future reader does not mistake a load-driven red for a
   regression. **Owner: TEST (monitor), no fix owed.**
2. **`checkBridgeSource`'s shape-regex pins are weak (Unit 1, ACCEPTED-RISK — C-2/C-4).** The
   sanctioned-pattern pin's `C-2`/`C-4` arms are **regexes over source TEXT**, so they pin a
   *shape* that a determined edit can satisfy without the behaviour. The **runtime rows cover them
   today** (Pin 2 executes the real preload against the mock and asserts the captured surface), so
   **no fix is owed**; recorded so the regex arms are never quoted as behavioural evidence.

### 13.4 THE RE-OPENED UNIT — statuses and the next cycle

- **`O0-M1-M3-MEASUREMENT-SHAPE`: RE-OPENED.** Status: **OPEN (adversarial findings owed)** — the
  sixth run reproduced the accepted LIVE form, **but the SHAPE ORACLE has 3 MUST-FIX HOST gaps**.
  **`M1`'s closure is NARROWED**: the **arithmetic** (no negative remainder, the clipped-union
  identity, the per-pass partition, pass 0's span) is genuinely live-verified, but the
  **identity oracle that ties the recorded stage sums to the record list was demoted to a note**
  (finding 2) — so the **`M1` symptom class is not closed as a certified claim**; its closure is
  re-established only when finding 2's forcing form lands and the artifact is re-checked under it.
- **`O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` (defects tracker): `FIXED` → `OPEN`.** Rationale
  recorded in the tracker: the row's closure evidence was `M1`/`M2`/`M3` live-verified + the
  `F5-1`..`F5-6` set; findings 2 and 3 remove the certification of `M1`'s oracle and of the
  attribution contract, so the row is **re-opened rather than duplicated** — the distinct defect
  classes (the asserted row verdict, the demoted identity, the trusted attribution fields, the
  text-probe live gate, the note-clause dodge, the band-field drift, the validator gaps) are
  **filed as their own rows** in the same tracker.
- **The next cycle (ordered):** **(1)** the HOST fixes **(1)(2)(3)** — the `M1`/shape-oracle core —
  **first** (finding 2 is the `M1` oracle; nothing else certifies the sums without it); **(2)** the
  HOST fixes **(5)(7)(8)** (the note-clause dodge, the one authoritative band, the validator's
  three clauses + the imputation removal); **(3)** the TEST remands **(4)(6)** (the per-row
  parse+validate live pin; the config ceiling bound + the production-importer pin); **(4)** the
  SPEC re-derivations **(9)** (the band's empirical re-derivation + the corrected scoping claims);
  **(5)** the **`M1-M3` red set re-run (RCA-1: red first — the counterexamples of findings 1/2/3/8
  become the new red rows) → green → the SEVENTH live run** (RCA-11: the harness changes, so prior
  live provenance is invalidated; the artifact regenerates as its **SEVENTH edition**, reproducing
  the accepted form under the **fixed** oracle) **→ the re-audit (§7 §3b) → the mandatory
  documentation review** (RCA-6/item 10d).
- **The `O-5` gate is NOT open while the shape-oracle MUST-FIX set is outstanding** — the artifact's
  LIVE form is accepted under DEC-1 (unchanged), but the oracle that **certifies** it is not yet
  sound. **Owner: the supervisor/architect decides the ordering; nothing here re-rules DEC-1.**
- **EXECUTED — and SUPERSEDED IN ITS ORDERING (2026-09-21).** The cycle above RAN: the HOST fix
  set landed, the reds went green, and the **SEVENTH live run** regenerated the artifact as its
  **SEVENTH edition** — which reported **`status:"FAIL"` on a NEW harness ordering defect
  (`F7-1`)** rather than the accepted form. **The CURRENT status, the row/pass-oracle closures the
  seventh run proved, the two OWED strict checks, the live-pin edition item and the ordered next
  cycle are §14 — read §14.9 for the order (it leads with `F7-1`).** The `O-5` condition is
  UNCHANGED in shape: O-5 leads the queue but is gated, now on `F7-1` + the strict checks + the
  EIGHTH run (§14.9).

### 13.5 THE LIVE-EVIDENCE DOWNGRADE (finding 4 — stated exactly)

**What the sixth run establishes (unchanged, and NOT downgraded):** the artifact is the SIXTH
edition; both legs embedded verbatim with the byte-exact round-trip; `driver.build.verified:true`
on both legs; the census 226 = 226; the recorded status triple; and every **recorded value** in
§12.9's tables.

**What is DOWNGRADED:** the claim that the suite's **live pins certify** that the accepted form is
present **on every row of both legs**. On the landed pins that claim rests on **a human reading of
the artifact**: `LIVE-1` is a banner regex that the committed (SIXTH) file satisfies only through
the fifth edition's surviving prose, `LIVE-2` is a whole-file membership probe, and **no live pin
parses the artifact or runs it through the shape oracle**. **Therefore: §10 criteria 1/2/7/8 and
§12.9's "the shape of §2/§3 present on every row of both legs" read as "a human reading of the
artifact pending the per-row parse+validate live pin (TEST remand, §13.1 (4))".** A green on the
per-row structural pin — not the text probe — is what may be quoted as the unit's live evidence.

> **NARROWED (2026-09-21, after the SEVENTH run — §14.3/§14.5/§14.8 (4)).** The TEST remand this
> paragraph demands **LANDED**: `LIVE-2` now parses each leg's embedded JSON and walks every row
> through `validateO0MeasurementShape` + `partitionO0RowPasses` (with `LIVE-3` the non-vacuous
> discrimination proof and `LIVE-4` the outcome-channel pin), so **the per-row live evidence is now
> an ORACLE, not a human reading** — its green is owed an edition whose leg triple passes (the
> EIGHTH run, §14.9), which the EIGHTH and NINTH runs then supplied. **What remains downgraded is the EDITION PROBE** (`LIVE-1` =
> `/SIXTH|sixth edition/i`, passing by prose against the SEVENTH edition — §14.5). **RESOLVED
> SINCE: the probe is BANNER-SCOPED and was repointed to the NINTH edition in the ninth-run pass
> (§15.11); §14 is history — read §15 for the current state.**

**Tracker edits made with §13 (surgical):**
- **`docs/defects.md`** — `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` **RE-OPENED (FIXED → OPEN)** with
  the adversarial note, and **NEW rows**: `O0-ROW-PASS-ASSERTED-NOT-DERIVED` (finding 1),
  `O0-AGGREGATION-IDENTITY-DEMOTED` (finding 2 — the `M1`-symptom oracle),
  `O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED` (finding 3), `O0-LIVE-GATE-TEXT-PROBE` (finding 4,
  PROCESS/TEST), `O0-MANDATORY-NOTE-CLAUSE-DODGEABLE` (findings 5/9-part, HOST + the Unit-2
  over-claim), `O0-UNION-BAND-FIELD-DRIFT` (finding 7, HOST), `O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS`
  (finding 8, HOST incl. the `passIndex` imputation), `O0-CONFIG-CEILING-AND-IMPORTER-UNPINNED`
  (finding 6, TEST), and the ACCEPTED-RISK note rows (§13.3, no fix owed).
- **`docs/next-steps.md`** — the CURRENT WORK entry now leads with the adversarial findings, the
  RE-OPENED unit, the next cycle (§13.4) and the corrected O-5 wording.
- **`docs/decisions.md`** — a DEC-1 **provenance clause**: the sixth edition's LIVE form reproduced
  (accepted, content unchanged) + the certifying oracle's gaps (the unit re-opened) + the corrected
  O-5 condition.
- **`docs/specs/unit-v5-migration.md`** — §3.3's **OWED** note (finding 6's two halves).
- **This spec** — the status block, §5 `P-TP-2` (the ceiling claim), §7 §3a/§3b, §10's acceptance
  block, §12.2's blockquote (the band claim), §12.9's downgrade note + the O-5 correction, and §13.

### 13.6 THE §13.1 / §13.2 FINDINGS LANDED — per-finding status after the §3b RE-AUDIT and the NINTH run (2026-09-21)

**Read this table as the STATUS; §13.1/§13.2 stay as the FINDINGS' record (each with its
counterexample and its symbol citation) and §13.4 as the ordered cycle they demanded.**
**The verification column cites the §3b re-audit's own pins where they exist
(`tests/unit-o0-m1-m3-reaudit-pins.test.ts`, `RA-0`..`RA-7` + the §5 EXTENDED rows) and the
NINTH run's live readings (artifact §8/§8.4) — never a self-claim.**

| # | finding | final status | the §3b RE-AUDIT's verification (the evidence, not the claim) |
| --- | --- | --- | --- |
| **§13.1 (1)** | `partition.row.pass` ASSERTED, not derived | **FIXED (HOST, LANDED)** | `row.pass` is `rowFailReasons.length === 0` (`src/shared/o0-report.ts`, the `pass:` field of `partitionO0RowPasses`'s `row` literal — the reason set is assembled FIRST, verdict derived from it); `RA-0` (the unmutated control) + the two counterexample directions are pinned named reds; the NINTH run reads `row.pass ⇔ failReasons.length === 0` **true on 6/6 rows and on every pass sub-row of both legs** (artifact §8) |
| **§13.1 (2)** | the per-id aggregation identity DEMOTED to a note | **FIXED (HOST, LANDED)** | the identity is FORCING (`err(...)` + the `aggregationNotes` copy IN ADDITION, never instead — the `O0-AGGREGATION-IDENTITY-DEMOTED` comment block); it HOLDS on **all 9 finite ids of all six rows** live (artifact §8.1) with the validator recomputing it (`errors:[]` 6/6); `P-TP-1`/`P-TP-2` EXTENDED rows sweep it |
| **§13.1 (3)** | the recorded attribution fields TRUSTED, not re-derived | **FIXED (HOST, LANDED)** | `validateO0MeasurementShape` re-derives `startBeforeOverlapMs`/`straddleEndMs` from the recorded `longTasks[]` and refuses a record that **UNDERSTATES** the derived overlap; the NINTH run reads re-derived **=** recorded on 6/6 (0 + 0) so the record never understates (artifact §5/§8.3) |
| **§13.1 (4)** | the live gate is a TEXT PROBE (TEST/PROCESS) | **FIXED (TEST, LANDED) — its EDITION-PROBE half is the recurring OWED item (§13.7 (4)) and was REPOINTED in the ninth-run pass** | `LIVE-2` parses each leg's embedded JSON and walks every row through the two oracles; `LIVE-1B`/`LIVE-3` are the non-vacuous discrimination proofs (RED on the THIRD edition's git-HEAD fixture); `LIVE-4` pins the outcome channel; `LIVE-1` is now BANNER-SCOPED (`statusBanner()` + the ordinal map) instead of a whole-file regex. **The green on all of them is what the `221 files / 4 988 passed / 58 skipped / 0 failed` reading contains** (the ninth-run pass applied the EIGHTH→NINTH repoint — §15.11) |
| **§13.2 (5)** | the mandatory-note clause DODGEABLE when `status` is absent | **FIXED (HOST, LANDED) — with ONE residue** | the clause is gated on the status the recorded reasons **DERIVE** (`derivedFromFinalReasons.status === 'OPEN-structural'`, `src/shared/o0-report.ts`); `ADV-5 [A6/A7]` pins both directions (declared ⇒ forcing; `status` DELETED ⇒ still forcing). **RESIDUE (recorded honestly, not hidden): `status`/`reconciliation` are still NOT in `REQUIRED`** — the derived-status gate is the stronger anti-dodge mechanism, but a report that deletes the whole `reconciliation` block entirely is not caught by that clause. **Owner: the NEXT CYCLE (HOST, optional hardening).** |
| **§13.2 (6)** | the §2c-6 timeout ceiling + the production importer unpinned (Unit 1, TEST) | **unaffected by this unit — OWED elsewhere** | its home stays `docs/specs/unit-v5-migration.md` §3.3 + `docs/defects.md` `O0-CONFIG-CEILING-AND-IMPORTER-UNPINNED` (the production importer IS still the ONE-`applyBatch` form — a pin-coverage gap, not a regression) |
| **§13.2 (7)** | the union-band field drift (3 coupled defects at one site) | **FIXED (HOST, LANDED)** | (a) the oracle reads the band from the ROW's recorded `reconciliation.toleranceMs` (50 ms) and the report declares the same value (`ADV-7a`/`ADV-7b` pin the 200 ms and 40 ms reads); (b) `tolerance.source` is re-labelled to the compile-time constant `O0_RECONCILE_TOLERANCE_MS` + the owed empirical re-derivation; (c) `rowOutcomeReasons` is OUT of `partition.failReasons` (its own `outcomeReasons[]`/`bandExceededNote` channel) — live: the row-level `bandExceeded` flags read **2 of 6 `true`** while the artifact's §7 report-level cell reads 3 and 3 rows arithmetically exceed the 50 ms band — a recorded artifact-side inconsistency, nothing keyed on it (§15.4), `failReasons` empty on all 6, `ADV-7c` pins it |
| **§13.2 (8)** | the validator's four coverage gaps + the `passIndex` IMPUTATION | **FIXED (HOST, LANDED)** | **no `passIndex = 0` imputation remains**: an absent `passIndex` on a row with no `hook.passes` is a REPORTED missing value (`err(... .passIndex is <v> … §4.1/§6 FS10)`); the row `stages[]` closed-set clause, the per-pass declared-vs-derived accounting clause, the `records.indices` totality clause and the row `null`-remainder reason clause are the §3b re-audit's new forcing clauses (`RA-2*`, `RA-3*`, `RA-4*`) — **all four exercised live for the first time on the NINTH run (artifact §8.4)**; the two §14.4 STRICT checks are live and SILENT on 6/6 (artifact §8.2) |
| **§13.2 (9)** | three stale spec claims (SPEC) | **corrected; ONE re-derivation still OWED** | (a) §12.2's blockquote + §2.1's band scoping are corrected; (b) `P-TP-2`'s migration-spec claim is corrected there + here; (c) the §13.5 downgrade is RESOLVED in its oracle half by the per-row pins and **its edition-probe half was closed by the ninth-run repoint** — **remaining: RUL-11's band re-derivation + the `hook.reconcileToleranceMs` field-name residue (§13.7 (5))** |
| **§13.3 (1)(2)** | the two ACCEPTED-RISK notes (Unit 1) | **unchanged — no fix owed** | recorded only so the weak regex arms are never quoted as behavioural evidence |

### 13.7 THE OWED LIST after the ninth run (SHOULD/ACCEPTED items — each with its owner)

**These are NOT doc drift and NOT unit blockers; they are recorded so no reader over-reads the
DONE state. The first four come from the §3b re-audit's SHOULD set; the rest are the
re-derivations this pass's audit left owed.** Their homes: **this list**, the OWED block in
`docs/next-steps.md`, and the tracker rows named against each.

1. **The note's BRANCH vs the FINAL status on the exact `F7-1` class (owner: SPEC + HOST, next
   cycle).** The note clause reads the status DERIVED from the final reason set at its call
   site; the ninth run is clean because the driver attaches the note BEFORE the single
   validation call and re-validates the emitted object (`driver.selfValidationOfEmitted`). **The
   clause's own semantics when a report is validated MID-ASSEMBLY (the `F7-1` shape) are not
   pinned as a contract** — the ninth run's clean reading is an ORDER property, not a proof that
   the clause is order-independent. Owed: state the branch/derived-status semantics explicitly
   (or pin the assembly order in the report contract).
2. **The unarmed 0/0 baseline is UNREACHABLE live (owner: TEST/SPEC, next cycle).** `S3`'s
   "`records: 0`, `passes: []`, `armWindow: null`, `rowArmCount 0`/`rowDisarmCount 0`,
   `sessionCountsAt.pre == post`" and `P-SM-1`'s `0/0` branch are asserted **node-side only**
   (`ARM-2`, the EXTENDED `P-SM-1` sweep); the live legs emit no unarmed row, because the
   repeat-determinism block's unarmed run is reported through the **hook-inertness pair**
   (`o0-repeat-a-unarmed` / `o0-repeat-b-armed`), not as a freeze row. **Owed: either restate
   `S3`/`P-SM-1`'s `0/0` clause as a node-only contract (naming the inertness pair as the live
   surface), or emit the unarmed baseline's own row counts in the artifact.**
3. **FOUR named reds are missing (owner: TEST, next cycle).** The re-audit's counterexamples are
   pinned for the clauses it landed (`RA-0`..`RA-7`, `ADV-*`), but these SHOULD-adjacent
   counterexamples have NO named red: (i) the **`overstatement`** direction of the attribution
   record (a recorded overlap GREATER than the derived one — the clause catches
   understatement only); (ii) a **`sessionCountsAt` present but self-inconsistent** pair beyond
   the out-of-order case `P-SM-1 (EXTENDED)` sweeps; (iii) the note's **mid-assembly**
   (`F7-1`) shape (item 1); (iv) the **`stageRecordDetail` index gap** (`[0,2]` — a dropped
   index with the count kept consistent) as distinct from the partition's `records.indices`
   totality (`RA-3b`/`RA-3c` cover the partition, not the record-detail list).
4. **The EDITION PROBE is a recurring process cost (owner: TEST, next cycle) — the general form
   is the fix.** `LIVE-1`'s `EXPECTED_EDITION`/`EXPECTED_ORDINAL` literal must be hand-repointed
   whenever the artifact is regenerated; **the ninth-run pass applied the FOURTH consecutive
   repoint** (EIGHTH→NINTH, §15.11) and the eighth edition's finding `F9-1` recorded the third.
   The probe now reads the banner's own claim (`statusBanner()` + `ORDINAL_BY_WORD`) but still
   compares it to a **hand-written literal**. **Owed: derive the expected edition from the
   banner's own ordinal sequence (or from the artifact's supersession table's CURRENT row) so a
   regeneration owes no code edit.**
5. **§14.6's "DIFFERENT BYTES" claim is CONTRADICTED (owner: SPEC, corrected here — the
   re-derivation is complete, the CLAIM is what was wrong).** §14.6 argued the seventh run
   "measured DIFFERENT BYTES than run 6" because "the djb2 hash moved although the byte COUNTS
   stayed `678367`/`2419628`". **The recorded identity field is `mtimeMs+bytes+djb2hash`, so the
   string moved with the MTIME prefix; the CONTENT hash did not:** runs 5, 6, 7, 8 and 9 all
   record renderer `3e3f1b80` / main `1e652667`. **Only the mtime prefix moves** (each leg's
   spawn rebuilds `dist/`, artifact §1/§2). The correct statement — and the one the NINTH
   edition records — is: **the same bundle BYTES were re-measured under a changed ORACLE**
   (`92a74b7d`), which is why the ninth edition records `driver.oracleIdentity` at all. **No
   reader may carry §14.6's "different bytes" reading forward.**
6. **The `hook.reconcileToleranceMs` band-field residue (owner: HOST, next cycle).** The
   `§13.2 (7)(a)` fix made the oracle read the ROW's recorded band; the **field NAME it reads
   when a hook carries it is still `hook.reconcileToleranceMs`, which NO producer emits** — the
   default constant only applies when the field is absent, so the two readings CAN still drift
   in principle (they agree on every emitted row today, `reconciliation.toleranceMs` 50 on 6/6,
   and never a band-driven gate depends on it — the band is an OUTCOME). **Owed: re-pin
   §2.1's band-source sentence on ONE field name**, or emit the field the oracle reads.
7. **§5's register-budget statement is CORRECTED (392 ≤ 400), not owed** — see §5/§8.1 (the
   re-audit's EXTENDED rows added 4 × 8 = 32 attempts on top of the original 6 × 60 = 360; the
   old "360 landed of the 800 ceiling" wording was the landing budget, and the ceiling that
   binds is the register's own 400).
8. **§4.1's field list omitted `unaccountedReason` (owner: SPEC — corrected here, no
   re-derivation owed).** `reconciliation.unaccountedReason` is the field the ROW-level
   `null`-remainder clause reads (`§2.1(iii)`/`S12`/`RA-4a`/`RA-4b`); it is emitted `null` on
   rows whose remainder IS a number (the ninth run reads it `null` on all six rows — artifact
   §8.4 (d)) and carries the named reason ONLY on the `null` form. **The field set of §4.1 did
   not name it; the clause and the tests did.** §4.1's illustrative block now carries it.
9. **The artifact's band BOOKKEEPING is internally inconsistent (owner: SPEC/artifact
   reconciliation, next cycle — recorded, NOT a clause).** The ninth edition's row-level
   `bandExceeded` flags read **2 `true` / 4 `false`** (only the two folder gesture rows), its §7
   report-level `bandExceededNotes` cell reads **1 / 2 (= 3)**, and **3** rows arithmetically
   exceed the recorded 50 ms band (111.8 / 101.4 / 63.5 ms — the GPU-ON document row at 63.5 ms is
   flagged `false`). **No spec clause is keyed on the flag** and the `F5-1` evidence (no flag
   enters `pass`/`failReasons`/`gating`; `bandExceededGate:false`) is unaffected — but a reader
   quoting "the band-exceeded rows" gets a different count from each surface. Owed: reconcile the
   three surfaces (or state which one is authoritative) in the next artifact regeneration. **This
   pass could not edit the artifact** (out of the SpecDoc's `docs/specs`-scope by instruction —
   recorded as a limitation, not skipped silently).

---

## 14. THE SEVENTH RUN (2026-09-21) — a `FAIL` on a NEW HARNESS ORDERING DEFECT (`F7-1`), the
## row/pass-oracle closures it PROVED, the two OWED strict checks, and the EIGHTH-run requirement

**Status of this section: HISTORY — it records the SEVENTH run, whose FAIL the fix cycle then
repaired; the EIGHTH run restored the accepted form and the NINTH run verified it under the §3b
re-audited oracle. READ §15 FOR THE CURRENT STATE.** It records the **seventh live run** of the `O0-M1-M3` harness —
the run §13.4's ordered cycle demanded after the adversarial fix set landed (`§13.1 (1)-(3)` +
`§13.2 (5)(7)(8)`). **Read this section — not §12.9-§12.11 and not §13.4's ordering — for the
CURRENT state of this unit.** Its authority is the **SEVENTH edition** of
`docs/specs/unit-o-0-per-stage-breakdown.md` (banner, §7 the derived verdicts, §8 the per-row oracle
re-validation, §9 the window bound + O-0 numbers, §10 the vs-run-6 drift table, §11.1-§11.4 the
findings, §12.1/§12.2 the embedded raw JSON, §13 the provenance table), read at this pass; the
summary record is `docs/specs/unit-o-0-per-stage-measurement.md` **§12.17**. **No number below is
re-measured here** — every value is the artifact's own recorded reading (`assembled-renderer`,
RCA-12), and **no test or app was run by this pass** (the suite readings quoted are the run pass's).

### 14.1 The result (both legs) — the DEC-1-accepted form was NOT reached

| leg | `status` | `pass` | `driver.selfValidation.ok` | `errors` | `gatingReasons` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | **`FAIL`** | **`false`** | **`false`** | **1** | **1** |
| GPU-ON | **`FAIL`** | **`false`** | **`false`** | **1** | **1** |

**The single forcing reason on BOTH legs (identical, verbatim):** `report status is
"OPEN-structural" without a reconciliation.note naming the structural stages, the non-computable
residual and the no-imputation statement (§3.6b RUL-4 clause 5/§13.2 (5): the note clause is gated
on the DERIVED status, so it cannot be dodged by omitting `status`)`. `driver.selfValidation`'s
`structuralErrors` stay **0** with `structuralFacts` unchanged (**4 / 2**), `snapshot.clone` stays
the one `structural:true` id with the RUL-3 reason verbatim, and `post.style` stays
`derived`/`ms:null`/`unseparated`/`attributable:false` — **the structural set did NOT move: the
FAIL is a REPORT-ASSEMBLY defect, not a structural change and not a measurement defect.**

### 14.2 `F7-1` — the NEW DEFECT: the note clause is UNSATISFIABLE in the driver's call order

- **Class:** **harness / assembly order** (host-side, `scripts/live-drive.mjs`) — **NOT structural**
  and **not** a measurement defect. **Defect row: `docs/defects.md`
  `O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH` (high).**
- **The exact call-order evidence (verified against the tree at this pass; cited BY SYMBOL where a
  line is unstable).**
  1. `o0BuildReport` (the driver's report-assembly function) calls
     **`const whole = o0Twins.report.validateO0Report(report)`** at `scripts/live-drive.mjs:~2087`.
     At that moment `report.reconciliation` is still **absent** — the reconciliation block is
     written later in the same function.
  2. Inside the oracle, the mandatory-note clause
     (`src/shared/o0-report.ts:1482-1491`) is gated on the status the recorded reasons
     **DERIVE**: `derivedFromFinalReasons.status === 'OPEN-structural'` (the derivation is taken
     from the FINAL `failReasons` immediately above, `:1466-1471`). The report's recorded reasons
     are the structural family (`snapshot.clone` / `post.style`), so the DERIVED status at that
     moment **is exactly `OPEN-structural`** — and a note that does not exist yet is read as
     absent, so the clause mints its own reason.
  3. The driver then APPENDS the note at `scripts/live-drive.mjs:~2177`
     (`report.reconciliation = { ok, note: reconciliationNote, bandExceededNotes, bandExceededGate,
     measurementShapeFailures, structuralStages }`, `:2177-2186`) — **after** the validation that
     required it — and re-derives the final status from the same reason set, which now carries the
     clause's own reason, so `status` becomes **`FAIL`**.
- **The clause is CORRECT; the ORDER is wrong.** The clause's land is the `§13.2 (5)` fix
  (`O0-MANDATORY-NOTE-CLAUSE-DODGEABLE`): gating on the DERIVED status is what makes deleting
  `status` unable to dodge the note. The seventh run shows the consequence the fix's own review did
  not exercise: **a report that has not yet attached the note reads as a report that omitted it.**
  **`OPEN-structural` is therefore unreachable by construction in this call order — the accepted
  form is minted UNREACHABLE by ordering alone.**
- **The fix shape (NOT made by this pass — `scripts/**`/`src/**` are out of scope for a SpecDoc
  pass, and the live run that found it is not allowed to patch itself): a ONE-LINE-CLASS fix —
  attach the reconciliation block (or at minimum a provisional `note`) BEFORE calling
  `validateO0Report`, OR move the `validateO0Report` call to AFTER the reconciliation block is
  assembled and re-derive the status from the post-note reason set.** Either form satisfies the
  clause and preserves the `§13.2 (5)` anti-dodge property (the clause still reads the DERIVED
  status). The defect row carries the repro and this fix shape; **its acceptance requires the
  EIGHTH run** (§14.9).

### 14.3 What the seventh run PROVED (recorded as POSITIVE — this was the unit's purpose)

**The row- and pass-level oracle is SOUND.** The run's per-row oracle re-validation (artifact §8,
executed over the embedded JSON of BOTH legs, per row, with the PURE module —
`partitionO0RowPasses` + `validateO0MeasurementShape`) reads:

| leg | rows | `partitionO0RowPasses(row).row.pass` ⇔ `failReasons.length === 0` | every pass sub-row `pass` ⇔ `failReasons.length === 0` | `validateO0MeasurementShape(row).ok` / `errors` / `legacyShape` |
| --- | --- | --- | --- | --- |
| GPU-OFF | 4 (`folder`, `document`, `fold-ablation-off`, `fold-ablation-on`) | **TRUE on 4/4** | **TRUE on every pass** | `true` / `[]` / `false` |
| GPU-ON | 2 (`folder`, `document`) | **TRUE on 2/2** | **TRUE on every pass** | `true` / `[]` / `false` |
| **both** | **6** | **TRUE on 6/6** | **TRUE on every pass** | **`true` / `[]` / `false` on 6/6** |

1. **The row verdict is DERIVED, not asserted (§13.1 (1) CLOSED live):** on **all 6/6 rows of both
   legs** `row.pass ⇔ failReasons.length === 0` — including the two directions the counterexample
   named (an unopenable set ⇒ `pass:false` WITH the reason; the legal empty/unarmed case ⇒
   `pass:true` with `failReasons:[]`), and every **pass sub-row** pair holds as well.
2. **The per-id aggregation identity is FORCING and HOLDS (§13.1 (2) CLOSED live — the `M1`
   oracle):** the identity `row.stages[id].ms === Σ pass.stages[id].ms` holds on **all 9 finite
   ids of all six rows** (the artifact's §8 table records "HOLDS on all 9 finite ids" per row with
   the row's `sumMs` vs window; e.g. the folder row's `traversal.build` **618.3 = Σ passes 618.3**
   and the document row's `reconcile.apply` **2146.5** (= 2146.1 + 0.4) and `render.ssr`
   **1801.9**). **The `M1` symptom class — the recorded per-stage sums no longer tied to the
   record list — is closed in its certification half by this live reading.**
3. **The recorded attribution equals the RE-DERIVED one (§13.1 (3) CLOSED live):** re-deriving
   `startBeforeOverlapMs` / `straddleEndMs` from the observed `longTasks[]` list reproduces the
   recorded values — **recorded = re-derived = 0** on both legs — so the record **never
   understates** the excluded overlap, and the trusted-vs-re-derived gap of §13.1 (3) is not
   exercised by a drift on this emission.
4. **The declared remainder obeys its own identity on all 6 rows:** declared `unaccountedMs` =
   window − accounted (108.8 / 59.7 / 38.0 / 39.6 ms GPU-OFF; 114.4 / 57.1 ms GPU-ON), and the
   declared-vs-derived accounting **agrees** on all six.
5. **The outcome channel is SEPARATE (§13.2 (7)(c) CLOSED live):** the four band-exceeded rows
   carry `outcomeReasons[]` while **`failReasons` stays empty** — **no outcome reason enters
   `partition.failReasons`**, so the `F5-1` gate the sixth run removed is not reintroduced a level
   down.
6. **The `§13.2 (7)(a)` band drift is CLOSED live:** each row records
   `reconciliation.toleranceMs = 50` and the oracle reads the band from the ROW; the report
   declares the same 50 ms. `tolerance.source` is **RE-LABELLED** to name the compile-time
   constant (`O0_RECONCILE_TOLERANCE_MS`, 50 ms) + the owed empirical re-derivation — **no value
   drift** (the band is still 50 ms; only the label changed from the date "measured 2026-09-21").
   The **40 ms** `hook.toleranceMs` is back in its own field as the window-bound band
   (`windowBoundToleranceMs`).
7. **Everything else the O-0 contract pins is unchanged and clean on this emission:** census
   **226 = 226** (6 102 nodes / 9 266 edges); `driver.build.verified:true` on both legs
   (`driver.runMode:"spawn"`, `DISPLAY=:0`); the window bound **clean** — `outsideMs` **0 on 6/6**
   against the 40 ms window-bound band, no top-level span escaping the freeze window;
   `bandExceeded` on **4/6** rows with **`bandExceededGate:false`**; inertness **Δmutations 0**
   (the MUTATION-half carries the proof; the long-task half is VACUOUS and labelled as such);
   the retired fields still retired (`postStyle.residual` / `reconciliation.residual` `null` +
   `retired:true`; no bare `hook.armCount`/`disarmCount` reading; `legacyShape:false` on every
   row); **A-4 reads 1** (93.3 ms) for the folder disclosure / **2** (175.7 ms) for the document
   open; and the **O-4 discrimination holds** — the folder row is `traversal.build`-bound
   (**66.41 %** GPU-OFF / **70.14 %** GPU-ON) while the document row is `reconcile.apply`-bound
   (**94.39 %** / **94.03 %**), i.e. two gestures with DIFFERENT dominant stages.
8. **The FAIL is report-level ONLY:** the report's own `driver.selfValidation` triple is driven by
   `gating`/`errors`, and the ONLY entry in either is `F7-1`'s clause reason (§14.1); the six rows
   are `pass:true`/`failReasons:[]` and the measurement shape validates. **No row is impugned, no
   number is withdrawn, and nothing is relabelled.**

### 14.4 TWO OWED STRICT CHECKS in `validateO0Report` (TESTWRITER REMAND — the fixtures are now coherent, so the STRICT form is permitted)

**Both are OWED items carried from the concurrent TestWriter remand** (the remand that made the
fixtures coherent). Each is a **host** change to `src/shared/o0-report.ts`'s declared-vs-derived
accounting block (the `§13.2 (8)(c)` clause family, the block guarded by
`if (Array.isArray(hook.passes) && rowsInhabitTheirWindow)` at `~:3179`, with
`const agrees = (a, b) => Math.abs(a - b) <= O0_ACCOUNTING_AGREEMENT_MS + 1e-9` and
`O0_ACCOUNTING_AGREEMENT_MS = 0.1` — the recorded 0.1 ms granularity):

- **(a) The `unaccountedMs` check must be STRICT/SYMMETRIC.** The clause at
  `src/shared/o0-report.ts:~3203-3215` fires **only on an UNDERSTATEMENT**
  (`recon.unaccountedMs < derivedRow.unaccountedMs - O0_ACCOUNTING_AGREEMENT_MS - 1e-9`). The owed
  form: **whenever `agrees(recon.windowMs, derivedRow.windowMs)` (the declared and derived windows
  share the same denominator), a declared-vs-derived `unaccountedMs` mismatch in EITHER direction
  must be reported — `!agrees(recon.unaccountedMs, derivedRow.unaccountedMs)` within the recorded
  **0.1 ms** granularity** (a NEW-surface `err`, so `ok:false` + the reason naming both numbers).
  **A declared remainder that OVERSTATES the derived one is a second reading of the same quantity
  that the clause set currently waves through.**
- **(b) The `windowMs` check must be STRICT for a new-shape row whose records inhabit their
  window.** The clause at `~:3193-3198` fires **only when the declared window EXCEEDS the derived
  one** (`recon.windowMs > derivedRow.windowMs + O0_ACCOUNTING_AGREEMENT_MS + 1e-9`) — a deliberate
  narrowness for a row whose record set lies outside the freeze window. The owed form: **inside the
  `rowsInhabitTheirWindow` guard (records outside the freeze window ≤ the pass band, `~:3064`), the
  declared `reconciliation.windowMs` must EQUAL the derived window within the 0.1 ms granularity —
  `!agrees(recon.windowMs, derivedRow.windowMs)` is a reason** (today a declared window NARROWER
  than the derived one is silently accepted).
- **Why both are owed NOW (and why the strict form is permitted):** the fixtures were incoherent
  when the lenient narrowness was written, so a strict clause would have fired on coherent-shaped
  but fixture-inconsistent rows; the remand made them coherent, so **the strict/symmetric forms are
  the honest clause set** and a row that declares a window or a remainder its own records do not
  support is a reported drift, not a tolerated one. **Owner: the NEXT CYCLE (HOST), ordered after
  `F7-1` (§14.9).** Both are NEW-surface scoped: a legacy-shaped row is never judged by them
  (RUL-8/§2.5a — no legacy row is impugned and the 114 O-0 tests stay untouched).

### 14.5 The live-pin EDITION PROBE is owed (`F7-3`, a TEST item)

- **The landed per-row pin WORKS and is RED against this edition — `LIVE-2` (§13.1 (4)'s remand,
  delivered; the artifact's finding id for this reading is `F7-2`).** `tests/unit-o0-m1-m3-driver-contract.test.ts`'s `LIVE-2` parses each leg's embedded
  JSON and walks every row through `validateO0MeasurementShape` + `partitionO0RowPasses` **before**
  asserting the leg triple; against the SEVENTH edition it fails on the leg triple with
  `expected 'FAIL' to be 'OPEN-structural'` while its **row-level violation list is EMPTY** —
  i.e. **the pin is behaving exactly as intended, and its red IS this run's verdict**, not a pin
  defect (artifact §11.2). `LIVE-3` (the discrimination proof: the identical pin is RED on all
  THIRD-edition rows) and `LIVE-4` (the outcome channel) both PASS.
- **The EDITION PROBE is still pointed at the SIXTH edition — OWED (TEST).** `LIVE-1` matches
  **`/SIXTH|sixth edition/i`** (the banner-only provenance check §13.1 (4) demanded), so against
  the SEVENTH edition it **passes by PROSE** — the seventh banner legitimately RECORDS the sixth
  edition in its supersession narrative. **It must be REPOINTED to the SEVENTH edition
  (`/SEVENTH|seventh edition/`) — the committed one — while keeping the SUPERSEDED-history
  assertion** (the banner must still record its predecessor); a later regeneration moves the probe
  with it (the eighth run repoints it to the EIGHTH, or the general form below removes the need).
  **Owner: the NEXT CYCLE (TEST); the general form is: the edition probe tracks the CURRENT
  edition — the seventh edition is the third consecutive one this class of staleness has bitten, so
  the pin should read the edition from the banner's own claim and compare it to the edition the
  rest of the file asserts, never a hand-written literal.**
- **The suite reading on the seventh edition (recorded, not re-run here):**
  `npx vitest run tests/unit-o0-m1-m3-driver-contract.test.ts` = **12 passed / 1 failed (13)**, and
  the **full suite** = **`Test Files 1 failed | 219 passed (220)`** /
  **`Tests 1 failed | 4 965 passed | 58 skipped (5 024)`**. **The ONE failure is `LIVE-2`** — the
  correct red of a FAIL edition, **not** a fixture-incoherence red (the concurrent TestWriter's
  two-fixture remediation is not visible as a failure in this run).

### 14.6 The SEVENTH edition is a DIFFERENT-BYTES run (this run measured different code)

- **The artifact is the SEVENTH edition** (`docs/specs/unit-o0-per-stage-breakdown.md`, banner:
  **runs 1-6 SUPERSEDED**, both legs' raw JSON embedded **verbatim**, byte-exact round-trip
  re-verified), and its provenance/supersession record names every prior edition (runs 1/2/3/4/5/6)
  with its own renderer identity.
- **The recorded bundle identity CHANGED from run 6** — renderer
  `1789974813483+678367+3e3f1b80` (GPU-OFF) / `1789974856794+678367+3e3f1b80` (GPU-ON); main
  `1789974813369+2419628+1e652667` / `1789974856683+2419628+1e652667` — **the djb2 hash moved
  although the byte COUNTS stayed `678367` / `2419628`**, because the adversarial fixes landed in
  the **INLINED `src/shared/o0-report.ts`** (plus the harness) and shifted the bundle's content
  without changing its length. **So this run measured DIFFERENT BYTES than run 6 — not merely a
  changed harness** (`o0Hash` = `mtimeMs+bytes+djb2hash`, `scripts/live-drive.mjs:~721`; the sha256
  printed in §1 of the artifact is a different instrument). Run 6's hash
  (`…+3e3f1b80`) and this run's `3e3f1b80` are **two different bundles of the same size** —
  record this so no reader treats the identical byte counts as identical code.
- **What moved vs run 6 is the VERDICT (and only the verdict, plus labels):** `OPEN-structural` /
  `ok:true` → **`FAIL` / `ok:false`** on both legs; `errors`/`gatingReasons` 0/0 → **1/1**;
  `tolerance.source` re-labelled; the per-row band drift closed; the outcome channel separated.
  **The remainders did NOT drift** (108.8 / 59.7 / 38.0 / 39.6 ms GPU-OFF) and the census, seed,
  and node/edge counts are identical (artifact §10).

### 14.7 What is NOT claimed (honesty bounds — read before quoting §14.3)

1. **No app behavior is claimed.** The layer statement of §12.11 stands unchanged:
   `assembled-renderer` MEASUREMENT; a green here is a MEASUREMENT-SHAPE green, **never
   app-green**.
2. **No absolute-ms cross-run comparison is a measurement** (RUL-5/L9/L10): the remaining drift
   between run 6 and run 7's absolute ms is a single-session reading of the same corpus shape.
3. **The attribution rule's DISCRIMINATION is still not claimable from this corpus:**
   `overlapAnyMs = intersectionMs = includedMs` on all six rows (no observed task straddles either
   endpoint) — that remains `P-TP-3`'s generated-list job (§12.10 (3)).
4. **The `snapshot.clone` structural gap is UNCHANGED and non-gating** (DEC-1's accepted set; the
   main-side transport stays a SEPARATE PARKED unit, `docs/pending.md`) — **it is what keeps
   `pass:false` on an otherwise clean report, and it is NOT the reason for this run's `FAIL`**
   (the forcing reason is `F7-1` alone).
5. **RUL-11's second half stays OWED as a spec item:** the band for the NEW union-remainder
   quantity is still to be re-derived empirically before any band-driven gate is re-pinned; the
   seventh run deliberately does NOT re-pin it (the over-band case stays a reported finding + row
   note). Its home is `docs/next-steps.md`'s OWED list + `docs/defects.md`
   (`O0-BAND-EXCEEDED-GATES-THE-REPORT` FIXED; the re-derivation is its remaining half).
6. **No number in §14.3 is a re-measurement by this pass** — every value is the artifact's own
   recorded reading, and no test/app was run here (`§14` verification scope: read-only).

### 14.8 The §13 findings after the seventh run (which closed, which remain)

| §13 finding | status after the seventh run |
| --- | --- |
| `(1)` row verdict ASSERTED, not derived | **CLOSED LIVE** — `pass ⇔ failReasons.length === 0` on 6/6 rows + every pass (§14.3 (1)) |
| `(2)` aggregation identity demoted (the `M1` oracle) | **CLOSED LIVE** — FORCING and holding on all 9 finite ids of 6/6 rows (§14.3 (2)) |
| `(3)` attribution fields trusted, not re-derived | **CLOSED LIVE** on this emission — re-derived = recorded (§14.3 (3)); the clause is now re-derivation-based |
| `(4)` live gate a TEXT PROBE (TEST remand) | **HALF CLOSED** — `LIVE-2`/`LIVE-3`/`LIVE-4` are the per-row structural pins and work; **the `LIVE-1` edition probe is still owed** (§14.5) |
| `(5)` mandatory-note clause DODGEABLE when `status` absent | **CLOSED (the clause is gated on the DERIVED status — `src/shared/o0-report.ts:1482-1491`) — and that CORRECT fix is what `F7-1`'s ordering turns against the driver** (§14.2) |
| `(6)` timeout ceiling + production-importer pin (TEST, Unit 1) | **unaffected by this run** — its record stays `docs/specs/unit-v5-migration.md` §3.3 / `O0-CONFIG-CEILING-AND-IMPORTER-UNPINNED` |
| `(7)` union-band field drift (`hook.reconcileToleranceMs`; `tolerance.source` date; outcome in `failReasons`) | **CLOSED LIVE on all three halves** — the oracle reads the row's recorded band, the source is re-labelled to the compile-time constant + the owed re-derivation, and `outcomeReasons` is separate (§14.3 (5)(6)) |
| `(8)` validator gaps + the `passIndex` imputation | **the coverage clauses are live** (`ok:true` on 6/6 with `FS11`/`FS12` live and no imputed `passIndex` on these rows); **the two STRICT checks of §14.4 remain OWED** (the same clause family, tightened) |
| `(9)` SPEC re-derivations | (a)/(b) landed in §12.2's blockquote + the migration spec's `P-TP-2` note; (c) the live-evidence DOWNGRADE of §13.5 is **RESOLVED in its oracle half** by the per-row pins (§14.3/§14.5) and remains downgraded only for the edition probe |

**No `§13` finding is withdrawn, and `§13.5`'s downgrade is narrowed, not deleted:** the claim
that the suite's live pins certify the accepted form **on every row of both legs** is now carried
by a real per-row oracle (`LIVE-2`) — **and that oracle's green is owed an edition whose leg triple
passes, i.e. the EIGHTH run (§14.9).**

### 14.9 THE EIGHTH RUN IS OWED — the ordered next cycle (authoritative)

**The unit stays OPEN. The queue order is unchanged: O-5 leads ONLY AFTER this closes** (DEC-1's
gate clause reads the artifact's live form; the committed artifact's form is currently a `FAIL`,
so the gate's input is the SIXTH edition and the item stays gated — **state it, do not soften it**).

1. **`F7-1` — the harness ordering fix (§14.2), FIRST:** attach the reconciliation block (or a
   provisional note) BEFORE `validateO0Report`, or validate after the note is attached, and
   re-derive the status from the post-note reason set. **Red-first (RCA-1): the counterexample is a
   report whose note is attached after validation — it must be RED before the fix and GREEN after.**
2. **The two STRICT checks in `validateO0Report` (§14.4 (a)/(b)):** the symmetric
   declared-vs-derived `unaccountedMs` clause and the strict `windowMs` clause for a new-shape row
   whose records inhabit their window — **each with its own red (a declared remainder that
   OVERSTATES; a declared window NARROWER than the derived one).**
3. **The TEST item — repoint the live-pin EDITION PROBE (§14.5):** `LIVE-1` to the **SEVENTH**
   edition (the committed one), keeping the SUPERSEDED-history assertion — and because the probe
   moves with every regeneration, prefer the **general form**: read the edition from the banner's
   own claim and compare it against the edition the file's other pins assert, so the EIGHTH run
   does not owe a third repoint (the alternative is a third hand-written literal).
4. **The EIGHTH run** — RCA-11: **the driver AND `src/` change, so the prior live provenance is
   invalidated** and the artifact regenerates as its **EIGHTH edition** (runs 1-7 SUPERSEDED
   inside it, both legs' raw JSON embedded verbatim), reproducing the DEC-1-accepted form
   (`status:"OPEN-structural"` / `pass:false` / `selfValidation.ok:true` / `errors:[]` /
   `gatingReasons:[]`) with the row- and report-level oracles both green.
5. **The §7 `§3b` re-audit (RCA-3)** over the landed fix set, read-only.
6. **The mandatory documentation review (RCA-6 / `AGENTS.md` item 10d)** — this spec + the
   trackers + the regenerated artifact reconciled against the build, recorded to
   `archive/reviews/<date>-unit-o0-m1-m3-doc-review.md`.
7. **Only then** is the `O-5` gate's input re-read (the EIGHTH edition's live form) and **only
   then does O-5 lead.**

**Explicitly NOT owed / NOT claimed:** a re-run of the sixth-edition bundle, a re-pin of any of
the 114 pre-existing O-0 tests, a rewrite of this unit's own pins other than the three items above,
a change to DEC-1's content, and any app-behavior work. **A parked or skipped live battery remains
a review finding (RCA-11), not a pass.**

**Tracker edits made with §14 (surgical):**
- **`docs/defects.md`** — **NEW row `O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH`** (`F7-1`; high —
  it makes the accepted form unreachable at report level) with the repro + the fix shape, plus the
  SEVENTH-RUN NOTE recording the closures, the two strict-check OWED items, the edition-probe item
  and the eighth-run requirement; the existing M1-M3 rows' statuses are kept consistent (the parent
  row stays OPEN — the fix set landed and the run FAILED on a new harness class; the LIVE-GATE
  TEXT-PROBE row narrows to the edition probe).
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — **§12.17** (the seventh run: the FAIL,
  `F7-1`, the seventh edition, and the accepted form currently reproduced by the SIXTH edition
  only; DEC-1 unchanged).
- **`docs/next-steps.md`** — the CURRENT WORK head now leads with the seventh-run FAIL + `F7-1` +
  the ordered cycle + the O-5 statement; the stale "the artifact IS the SIXTH edition / the
  accepted form IS reproduced by the committed artifact" lines are corrected.
- **`docs/decisions.md`** — a DEC-1 **provenance** clause: the seventh edition reports FAIL on
  `F7-1` (an ordering defect, not a structural change); **the accepted form is currently the SIXTH
  edition's; DEC-1's content unchanged.**
- **`docs/skills/designing-pages.md`** — **no page-design artifact is owed** (that file does not
  exist in this tree; this unit touches no page design — §1.4/§10).

---

## 15. THE NINTH RUN (2026-09-21) — the DEC-1-ACCEPTED form on the §3b-RE-AUDITED oracle, the clauses exercised LIVE, and the CLOSURE (THE CANONICAL RECORD; the unit is DONE on it)

**Status of this section: CURRENT — it is the ninth run's record, the §3b re-audit's live
verification, the O-5 gate's satisfaction and the OWED list.** Its authority is the **NINTH
edition** of `docs/specs/unit-o-0-per-stage-breakdown.md` (banner, §1 the commands, §2
environment/build identity **+ §2.3 the ORACLE identity**, §3 census, §4.1-§4.5 the per-stage /
per-pass / reconciliation / A-4 tables, §5 the long-task + attribution records, §6 the controls
and the inertness pair, §7 the self-validation + derived verdicts + the note's form + **§7.5 the
emitted-object re-validation**, §8 the per-row oracle re-validation incl. **§8.4 the four NEW
§3b clauses**, §9 the window bound + the O-0 numbers, §10 the vs-run-8 drift table, §11 the
findings, §12.1/§12.2 the embedded raw JSON, §12.3 the byte-exact round-trip, §13 the provenance
table), read at this pass; the summary record is
`docs/specs/unit-o-0-per-stage-measurement.md` **§12.18**. **No number below is re-measured by
this pass** — every value is the artifact's own recorded reading (`assembled-renderer`, RCA-12),
and **no test, no driver and no app was run here** (the suite readings quoted are the run pass's
own `npx vitest run` output, recorded in the artifact's §1).

### 15.1 The result (both legs) — the accepted form REPRODUCED, and the artifact is the NINTH edition

| leg | `status` | `pass` | `driver.selfValidation.ok` | `selfValidationOfEmitted.ok` | `errors` | `gatingReasons` |
| --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | **`OPEN-structural`** | **`false`** | **`true`** | **`true`** | **`[]` (0)** | **`[]` (0)** |
| GPU-ON | **`OPEN-structural`** | **`false`** | **`true`** | **`true`** | **`[]` (0)** | **`[]` (0)** |

- **The structural family only, unchanged:** `snapshot.clone` is the ONE `structural:true` id
  with the RUL-3 reason verbatim; `post.style` stays `derived`/`ms:null`/`unseparated`/
  `attributable:false`; `structuralFacts` **4 / 2**; **nothing is relabelled `"OK"`** and
  `pass:false` is the measurement's verdict, not a failure reason.
- **The note is the OPEN-structural form** (it names the structural stages, the non-computable
  residual and the no-imputation statement; it quotes no rejection — artifact §7.4), so the
  `F7-1` clause is satisfied by CONTENT as well as by order.
- **The artifact is the NINTH edition** (banner: "This is the **NINTH** live run … **runs 1-8
  are SUPERSEDED**"), with every prior edition's renderer identity + verdict tabulated in its
  §13.2 (first … eighth, the fifth and seventh marked **FAIL**, the eighth marked
  "`OPEN-structural` … after the `F8-1` harness fix — **oracle identity NOT recorded**") and the
  **ninth marked CURRENT**.
- **No harness defect this run (record the negative):** both legs ran to completion on the
  FIRST attempt (GPU-OFF 4 blocks / 0 FAIL / 0 PARKED; GPU-ON 2 blocks / 0 FAIL / 0 PARKED),
  each writing its `--o0-out` file; **no `scripts/**`, `src/**` or `tests/**` edit was made by
  the run pass** — the §3b fix set was already landed and the run is a REGENERATION, not a
  repair. The `F7-1` order defect stays CLOSED (the note is attached before the single
  `validateO0Report` call **and** the emitted object is re-validated afterwards) and the eighth
  run's `F8-1` harness fix held.

### 15.2 The commands (verbatim) + environment/bundle identity + the ORACLE identity

**The commands (artifact §1, unchanged in shape from run 6):** `npm run build` FIRST
(`docs/live-testing.md:119-124`) → the **GPU-OFF** leg (spawn path; no app was running:
`pgrep -af "electron|live-drive"` → none; MCP `:3787` / CDP `:9222` free)

```bash
DISPLAY=:0 ASTROGRAPHER_O0_MAIN_ARM=1 node scripts/live-drive.mjs \
  --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed \
  --o0-corpus=226 --display=:0 --o0-out=/tmp/o0i-gpuoff.json \
  --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism

DISPLAY=:0 ASTROGRAPHER_O0_MAIN_ARM=1 node scripts/live-drive.mjs \
  --seed=/tmp/o0-corpus-226 --corpus-root=/tmp/o0-corpus-226 --strict-seed \
  --o0-corpus=226 --display=:0 --gpu --o0-out=/tmp/o0i-gpuon.json \
  --block=o0_gpu_control,o0_repeat_determinism
```

then the trio (`npx vitest run` → `npm run typecheck` → `npm run build`). `driver.runMode:
"spawn"` on both legs; the pinned `--connect` form was NOT used (no app was running, and
`--connect` cannot arm the main-side recorder).

| field | GPU-OFF | GPU-ON |
| --- | --- | --- |
| `driver.build.renderer` | `1789977178309+678367+3e3f1b80` | `1789977207408+678367+3e3f1b80` |
| `driver.build.main` | `1789977178193+2419628+1e652667` | `1789977207293+2419628+1e652667` |
| `driver.build.served` | `678367+3e3f1b80` | `678367+3e3f1b80` |
| **`driver.build.verified`** | **true** | **true** |
| **`driver.oracleIdentity.hash`** | **`92a74b7d`** | **`92a74b7d`** |
| `env` | `{"mode":"lexical","gpu":false,"engine":"absent","display":":0","paneFrames":2}` | same shape with `"gpu":true` |
| `driver.mainSeamArmed` / `mainTransport.channel` | `false` / `null` | `false` / `null` |
| `tolerance.reconcileMs` (the union band) | `50` | `50` |
| the window-bound band (`windowBoundToleranceMs`) | `40` | `40` |

**THE ORACLE IDENTITY (the §3b re-audit's provenance gap, closed live).** `driver.build.verified`
compares the SERVED renderer against the ON-DISK bundle — evidence about the MEASURED app, never
about the code that minted the verdicts. The driver imports `src/shared/o0-report.ts` **from
source**, so the run now records:

```text
oracleIdentity: src/shared/o0-report.ts      bytes=200143 djb2=b89d6f19
                scripts/live-drive.mjs       bytes=395314 djb2=194dfece
                composite 92a74b7d — IDENTICAL on both legs
executing bundle: renderer 678367+3e3f1b80 / main 2419628+1e652667 (content hash UNCHANGED from runs 5-8)
```

**Both legs record the IDENTICAL oracle**, so the two legs' verdicts are attributable to ONE
oracle edition — and **the ninth edition differs from the eighth in the ORACLE, not in the bundle
bytes** (`3e3f1b80` / `1e652667` on runs 5, 6, 7, 8 and 9 alike; only the `mtimeMs` prefix moves,
because each leg's spawn rebuilds `dist/` — artifact §1/§2; **this CORRECTS §14.6's
"different bytes" claim — §13.7 (5)**). The eighth edition could state only that the driver
"imports `src/shared/o0-report.ts` from source"; the ninth names the hash.

### 15.3 Census

**226 = 226** on both legs (`corpus.source:"--o0-corpus"`, `corpus.claimedDocuments:226`,
`corpus.gate:"documents"`), **6 102 nodes / 9 266 edges** recorded as provenance only
(RUL-5/L10), seed `o0-2026-09-17`, no census-mismatch reason in either leg. The corpus was
**re-verified, NOT regenerated** (`find /tmp/o0-corpus-226 -name "*.md" | wc -l` → 226; docs 200
+ archive 20 + notes 6).

### 15.4 Per-stage + per-pass tables (the recorded readings)

**GPU-OFF per-stage ms (row-declared, `hook` source — artifact §4.1):**

| stage id | folder | document | ablation-off | ablation-on |
| --- | --- | --- | --- | --- |
| `snapshot.pull` | 85 | 173.6 | 28.1 | 27.5 |
| `snapshot.clone` | `unseparated` | `unseparated` | `unseparated` | `unseparated` |
| `docheads.pull` | 3.1 | 4.4 | 1.9 | 2.4 |
| `traversal.build` | 633.2 | 5.6 | 5.3 | 5.4 |
| `envelope.assemble` | 0.4 | 0.2 | 0.2 | 0.2 |
| `shared.decorate` | 10.1 | 0.4 | 4.3 | 0.5 |
| `reconcile.roots` | 14.8 | 2.4 | 0.1 | 0.2 |
| `reconcile.apply` | 153 | 2163.2 | 1.7 | 4.1 |
| `render.dom` | 59 | 72.2 | 0.6 | 0.8 |
| `render.ssr` | 72.4 | 1787.1 | 0.8 | 0.8 |
| `post.style` | `unseparated` | `unseparated` | `unseparated` | `unseparated` |

**GPU-ON per-stage ms (artifact §4.2):** `snapshot.pull` **88.9 / 175.3**;
`docheads.pull` 2.2 / 5; `traversal.build` **662.9 / 11.1**; `envelope.assemble` 0.3 / 0.7;
`shared.decorate` 10.4 / 0.6; `reconcile.roots` 15.5 / 2.7; `reconcile.apply` **146.2 / 2078.6**;
`render.dom` 61.9 / 69.8; `render.ssr` 75.9 / 1744.6; `snapshot.clone` + `post.style`
`unseparated`. **The closed 11-id set is emitted on every row (`stageCount: 11`)** with the
structural pair recorded `unseparated` — never a number, never a zero (RUL-3/§6 S14).

**The per-pass + reconciliation table (both legs, every row — artifact §4.3):**

| leg | row | passes (`kind span/accounted/unaccounted`) | window | accounted | **unaccounted** | band | `bandExceeded` | `sumMs` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | folder | 0:pre-pass-render 61.7/61.6/0.1; 1:re-derive 925.1/899.6/25.5 | 1011.4 | 899.6 | **111.8** | 50 | **true** | 1031 |
| GPU-OFF | document | 0:pre-pass-render 94.3/93/1.3; 1:re-derive 2310.4/2289.4/21; 2:re-derive 60.4/60.4/0 | 2385.9 | 2349.8 | **36.1** | 50 | **false** | 4209.1 |
| GPU-OFF | ablation-off | 0:pre-pass-render 0.3/0.3/0; 1:re-derive 56/41.6/14.4 | 77.2 | 41.6 | **35.6** | 50 | **false** | 43 |
| GPU-OFF | ablation-on | 0:pre-pass-render 0.4/0.4/0; 1:re-derive 57.6/40.3/17.3 | 81.6 | 40.3 | **41.3** | 50 | **false** | 41.9 |
| GPU-ON | folder | 0:pre-pass-render 66.1/66.1/0; 1:re-derive 951.9/926.4/25.5 | 1027.8 | 926.4 | **101.4** | 50 | **true** | 1064.2 |
| GPU-ON | document | 0:pre-pass-render 98.1/96.9/1.2; 1:re-derive 2233.9/2210.4/23.5; 2:re-derive 84.8/63.6/21.2 | 2337.5 | 2274 | **63.5** | 50 | **true** | 4088.4 |

**Pass counts:** folder = **2** (`["pre-pass-render","re-derive"]`), document = **3**
(`["pre-pass-render","re-derive","re-derive"]`) on both legs; `hook.records` **11** (folder) /
**22** (document). **`Σ pass.records.count === hook.records`** on every row; **15 passes total**
over the six rows (11 + 22 + 11 + 11 GPU-OFF; 11 + 22 GPU-ON). Pass 0's collapsed `{0,0}` window
stays GONE (real spans 61.7 / 94.3 / 0.3 / 0.4 / 66.1 / 98.1 ms, unaccounted 0.1 / 1.3 / 0 / 0 /
0 / 1.2 ms); the heavy pass is pass 1 on the gesture rows, carrying the long task; pass 2 is the
short trailing re-derive (document rows only). `overlapMs` 0 and `sumOfSpansMs ≥ accountedMs` on
15/15 passes; **every pass `pass:true` with an empty `failReasons[]`**.

**The declared-vs-DERIVED accounting (the §14.4 (a)/(b) STRICT clauses, live and SILENT —
artifact §8.2):** declared `windowMs` / `accountedMs` / `unaccountedMs` equals the PURE oracle's
re-derivation within the recorded **0.1 ms** granularity on **6/6 rows** (111.8 / 36.1 / 35.6 /
41.3 / 101.4 / 63.5), and the declared triple is internally coherent
(`unaccountedMs === windowMs − accountedMs`) on 6/6. **The band is an OUTCOME, not a failure
(F5-1 upheld):** **on the artifact's own row-level flags 2 of the 6 rows record
`bandExceeded:true` with a row-level note — the two FOLDER gesture rows (111.8 ms GPU-OFF /
101.4 ms GPU-ON, both > the 50 ms band) — and 4 are flagged `false`** (the document row 36.1 ms
and the two ablation rows 35.6 / 41.3 ms on GPU-OFF, all inside the 50 ms band, and the GPU-ON
document row 63.5 ms, which is 13.5 ms ABOVE the band yet flagged `false`). **NOTE THE
INCONSISTENCIES rather than smoothing them:** (i) the GPU-ON document row's `bandExceeded` flag
does not agree with its own 63.5 ms remainder vs the recorded 50 ms band; (ii) the artifact's §7
report-level cell reads `bandExceededNotes` 1 / 2 (= 3), which agrees with neither the
row-level 2 nor the 3 rows that arithmetically exceed the band. **What IS consistent and IS the
`F5-1` evidence: NOT ONE of these flags — whatever its value — enters `row.pass`,
`row.failReasons` or the report's `gating`** — `bandExceededGate:false` on both legs, and the
`outcomeReasons[]` channel is separate (artifact §7/§8.3; 3 rows carry a non-empty
`outcomeReasons[]` there). **The flag values are the artifact's own and are NOT re-derived by this
pass; the three-way disagreement is recorded as an artifact-side inconsistency (a candidate for
the next cycle's spec/artifact reconciliation) — no spec clause is keyed on it.**

### 15.5 The self-validation + the EMITTED-object re-validation (both legs)

| leg | `selfValidation.ok` | `errors` | `status` | `structuralFacts` | `structuralErrors` | `attempts` |
| --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | **true** | `[]` | `OPEN-structural` | 4 | 0 | 4 |
| GPU-ON | **true** | `[]` | `OPEN-structural` | 2 | 0 | 2 |

**The per-row results are ALL ok**; every control's `legRuns[]` resolves to a `pass:true` row
inside its own report (3/3 GPU-OFF, 1/1 GPU-ON; the GPU pairing is
`pairedWithStatus:"cross-artifact"`), so the pairing is not vacuous.

**The EMITTED-object re-validation (NEW in this edition — the §3b re-audit's order finding):**
the driver's SINGLE `validateO0Report` call reads the report MID-ASSEMBLY (the
`status`/`pass`/`verdicts`/`reconciliation.ok` fields are written AFTER it), so the emitted object
is now re-validated over a SHALLOW COPY and the result recorded as
`driver.selfValidationOfEmitted`:

| leg | `selfValidationOfEmitted.ok` | `errors` | `gating` | `status` | `verdicts` |
| --- | --- | --- | --- | --- | --- |
| GPU-OFF | **true** | `[]` | `[]` | `OPEN-structural` | 17 |
| GPU-ON | **true** | `[]` | `[]` | `OPEN-structural` | 9 |

**`driver.selfValidationOfEmitted.ok:true` on BOTH legs** — the finalize introduces no error and
the emitted `verdicts[]` is non-empty (17 / 9) with the §4.4 verdict pair in its last slot. The
run pass ALSO re-ran the report-level validator independently over both emitted objects and over
their shallow copies (`ok:true`, `errors:[]` on all four calls — artifact §7.5).

**The derived verdicts (verbatim, the last line of each leg):** the `O-0 REPORT OPEN — N stage(s)
structurally unseparated (…)` form with the RUL-4 clause-3/4 text and the no-imputation
statement; `driver.statusStatement` reads `OPEN-structural — 8 (GPU-OFF) / 4 (GPU-ON)
structurally-unmeasurable stage(s) … no value was imputed (§3.6b RUL-4, §6 S14/S19)`.
**`reconciliation.ok` reads `false`** on both legs (derived: `ok ⇔ status === "OK"`).

### 15.6 The per-row oracle re-validation (THE POINT OF THE NINTH RUN — artifact §8)

Executed over the embedded JSON, per row, both legs, with the PURE module
(`partitionO0RowPasses` + `validateO0MeasurementShape`) — the same call the suite's `LIVE-2`
makes:

| leg | rows | `row.pass` | `failReasons` | `pass ⇔ len === 0` | `partition.row.pass` | pass sub-rows | `validateO0MeasurementShape.ok` | `errors` | `legacyShape` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GPU-OFF | 4 | true | 0 | **true** | **true** | 0:true/0 1:true/0 (+2:true/0 on the document) | **true** | `[]` | **false** |
| GPU-ON | 2 | true | 0 | **true** | **true** | same shape | **true** | `[]` | **false** |

**6 of 6 rows `pass:true` ⇔ `failReasons.length === 0`, BOTH DIRECTIONS, on the row AND on every
pass sub-row.** `validateO0MeasurementShape.ok:true` / `errors:[]` / `legacyShape:false` on 6/6 —
**and the two surfaces' `legacyShape` reading AGREES on every row** (`validateO0MeasurementShape
(row).legacyShape === partitionO0RowPasses(row).legacyShape === false` 6/6). **The per-id
aggregation identity** (`row.stages[id].ms === Σ pass.stages[id].ms`) **HOLDS on all 9 finite ids
of all six rows** (artifact §8.1; the `post.style` id is excluded by contract — §4.2).

### 15.7 THE FOUR NEW §3b CLAUSES — exercised LIVE for the first time (artifact §8.4)

| clause | live reading |
| --- | --- |
| **(a) the row `stages[]`** closed-11 set, each id once, finite-or-null, `ms:null ⇔ unseparated:true`, no negative | closed **true**, finite-or-null **true**, null⇔unsep **true**, negative **0** on **6/6 rows** (the structural pair `snapshot.clone`/`post.style` is the only null pair) |
| **(b) the per-pass RE-DERIVATION** (the declared pass layer re-derived with `partitionO0RowPasses(row)` and compared FIELD BY FIELD: `window.t0/t1/ms`, `sumOfSpansMs`, `accountedMs`, `overlapMs`, `unaccountedMs`, `records.indices`) | **drift 0 on 14/14 passes** (2+3+2+2 GPU-OFF, 2+3 GPU-ON) — no pass publishes an arithmetic of its own; e.g. the folder row's pass 1 `25.5` declared = `25.5` derived |
| **(c) `records.indices`** strictly increasing WITHIN each pass, disjoint ACROSS passes, union = `0..n−1` | **6/6** (union 0..10 / 0..14 / 0..10 / 0..10 GPU-OFF; 0..10 / 0..21 GPU-ON), equal to each row's `hook.stageRecordDetail` cardinality (11 / 15 / 11 / 11 / 11 / 22). The old COUNT-only check would accept `[2,2]` and `[2,99]`; this clause does not |
| **(d) the row-level `null`-remainder reason** | **absent**: no row of either leg publishes a `null` `reconciliation.unaccountedMs` — the reason requirement is satisfied by the NUMBER form on 6/6 (`null`-without-reason **false** everywhere; `reconciliation.unaccountedReason` reads `null` on all six rows, which is the legal number-form reading — §4.1/§13.7 (8)) |

**The §3b re-audit's MUST-FIX closure is therefore LIVE, not claimed:** the row verdict DERIVED,
the aggregation identity forcing, the attribution re-derived and the four clauses above all have
their live readings on the same six rows — **one run, one oracle identity (`92a74b7d`), both
legs.** (§13.6 carries the per-finding table; §13.7 the remaining OWED items.)

### 15.8 The window bound + the O-0 numbers (A-4, the O-4 trigger, the controls)

**Window bound: CLEAN** — `outsideMs` **0 on 6/6** against the recorded **40 ms**
window-bound band, worst arm-window overshoot **+0.1 ms**, `violated:false` on all six rows,
`outsideOffenders[]` empty (artifact §9).

| leg | row | window | largest stage | share |
| --- | --- | --- | --- | --- |
| GPU-OFF | folder | 1011.4 | `traversal.build` | **67.36 %** (633.2 of 940 ms) |
| GPU-OFF | document | 2385.9 | `reconcile.apply` | **94.38 %** (2163.2 of 2292 ms) |
| GPU-ON | folder | 1027.8 | `traversal.build` | **68.98 %** (662.9 of 961 ms) |
| GPU-ON | document | 2337.5 | `reconcile.apply` | **93.88 %** (2078.6 of 2214 ms) |

(the two ablation rows are `snapshot.pull`-largest on a **0 ms long-task window** — the driver
prints "no percentage is computed" instead of dividing; every largest-stage cell is computed from
that row's OWN finite stage rows and cross-checked against the driver's own verdict string for the
same stage+value, agreeing within 0.02 pp.)

**The O-4 trigger answer (unchanged in substance — the supervisor's "O-4 unchanged" reading):**
the folder gesture remains **`traversal.build`-bound (67.36 % / 68.98 %)** while the document
gesture is **`reconcile.apply`-bound (94.38 % / 93.88 %)** — **two gestures with DIFFERENT
dominant stages**. The shares sit inside the supervisor's quoted bands (`traversal.build`
**67.4-69.0 %**; `reconcile.apply` **93.9-94.4 %**), so **O-4 stays CONDITIONAL on the
disclosure-only trigger**, exactly as the queue states.

**A-4 read counts + ms (artifact §4.4):** the folder-row performed **1** whole-store read
(**85 ms** GPU-OFF / **88.9 ms** GPU-ON); the document-row **2** reads (**173.6 ms** /
**175.3 ms**); the two ablation rows 1 read each (28.1 / 27.5 ms). Each row's driver verdict
string is CROSS-CHECKED against its own `hook.stageRecordDetail` `snapshot.pull` count **and** its
`snapshot.pull` stage row — **all six agree**. The read count DISCRIMINATES the two gestures
(L4).

**Long tasks + the attribution record (artifact §5):** `longTaskTotalMs` **940 / 2292 / 0 / 0**
(GPU-OFF) and **961 / 2214** (GPU-ON) with mutations **37 / 11 758 / 37 / 37 / 37 / 11 758**;
every row `rule:"start-inside-inclusive"`, `includedMs === longTaskTotalMs`,
`includedCount ≤ longTasks.length` (2/2, 2/2, 0/0, 0/0, 2/2, 2/2), `ambiguous:false`,
`startBefore:[]`, `straddlesEnd:[]`, `startAfterCount:0`, and **re-derived = recorded = 0** on
`startBeforeOverlapMs`/`straddleEndMs` (**understates:false** on 6/6 — §13.1 (3)'s contract is
re-derivation-based and holds). **The rule's DISCRIMINATION is still NOT claimable from this
corpus** (the three rule totals coincide; `P-TP-3`'s generated-list job, honesty bound recorded).

**Inertness (artifact §6.3): `inert:true` on BOTH legs with Δmutations 0** (37 vs 37 — the
**MUTATION-HALF** carries the proof, statement verbatim), the **long-task half VACUOUS and
LABELLED** (0-vs-0, `nonVacuous:false`, `vacuousHalves[]` naming it), `setEqual:true`,
`controlledPair:true`, the frozen state reset recorded on both sides
(`document rows 20 → 0`). **The track ablation** is matched (on/off on the SAME target with the
same mutation count 37/37) with both paired control rows present — the pairing is not vacuous.

### 15.9 vs run 8 (artifact §10) — what moved and what did not

| dimension | run 8 (EIGHTH) | **run 9 (NINTH)** | drift |
| --- | --- | --- | --- |
| renderer identity | `1789975949705+678367+3e3f1b80` / `…97064+…` | `1789977178309+678367+3e3f1b80` / `…207408+…` | **CONTENT HASH UNCHANGED** — only the `mtimeMs` prefix moves (§13.7 (5) corrects §14.6) |
| main identity | `1789975949595+2419628+1e652667` / `…96952+…` | `1789977178193+2419628+1e652667` / `…207293+…` | content hash unchanged |
| **ORACLE identity** | **NOT RECORDED** (the field did not exist) | **`b89d6f19` + `194dfece` = `92a74b7d`** | **NEW — the ninth edition differs from the eighth in the ORACLE, which the eighth could not name** |
| census / seed | 226 / 6 102 / 9 266; `o0-2026-09-17` | identical | none |
| both legs' verdict | `OPEN-structural` / `ok:true` | **`OPEN-structural` / `ok:true`** | reproduced on the re-audited oracle |
| `errors` / `gatingReasons` | 0 / 0 | **0 / 0** | no forcing reason |
| `selfValidationOfEmitted` | NOT RECORDED | **`ok:true` / `errors:[]` on both legs** | **NEW** — the emitted object re-validated |
| remainders (folder/document/abl-off/abl-on GPU-OFF) | 111.4 / 33.6 / 38.6 / 40.4 | **111.8 / 36.1 / 35.6 / 41.3** | single-session drift (RUL-5/L9) |
| remainders (folder/document GPU-ON) | 103.3 / 33.9 | **101.4 / 63.5** | single-session drift |
| band-exceeded rows (GPU-OFF / GPU-ON) | 1 of 4 / 1 of 2 | **1 of 4 / 2 of 2** | an OUTCOME change, not a gate change |
| largest-stage shares (folder/document GPU-OFF) | 69.86 % / 94.08 % | **67.36 % / 94.38 %** | value drift only; the O-4 discrimination is unchanged |
| A-4 reads (folder/document GPU-OFF) | 1 (70.2 ms) / 2 (167.7 ms) | **1 (85 ms) / 2 (173.6 ms)** | the L4 discrimination is unchanged |
| declared vs derived | equal within 0.1 ms 6/6 | **equal within 0.1 ms 6/6** | the §14.4 STRICT clauses stay live and SILENT |
| the §3b clauses (§8.4) | n/a | **row `stages[]` clean 6/6, per-pass drift 0/14, indices totality 6/6, `null`-reason satisfied 6/6, `legacyShape` agreement 6/6** | **exercised live for the first time** |

**No cross-run absolute ms comparison is a measurement** (RUL-5/L9/L10); the drift is a
single-session reading of the same corpus shape on the same bundle bytes.

### 15.10 The suite, the register and the layer statement

- **`npx vitest run` (the run pass's reading, artifact §1): 221 files passed (221) / 4 988 passed
  / 58 skipped / 0 failed, exit 0**; **`npm run typecheck` 0**; **`npm run build` 0** (renderer
  678 367 B djb2 `3e3f1b80`, main 2 419 628 B djb2 `1e652667`).
- **The O-0 suites 114/114 UNMODIFIED** (report-contract 50 + hook-contract 39 + driver-contract
  25 — RUL-7/§2.5a); **the M1-M3 files green as three files** (measurement-shape, driver-contract
  with `LIVE-1`..`LIVE-4` + `LIVE-1B`, and the §3b re-audit's `reaudit-pins`) plus the
  adversarial-pins file; **0 rows re-pinned** in the pre-existing O-0 suites.
- **Register: the six rows `held` (360) + the four EXTENDED rows `held` (32) = 392 ≤ 400** (§5;
  the pre-existing O-0 8 rows stay `held` at their own 470-attempt budget).
- **LAYER (RCA-12, mandatory on the DONE row):** this unit is **DRIVER/ORACLE
  MEASUREMENT-SHAPE — an `assembled-renderer` MEASUREMENT unit**. Its live evidence is a real
  hit-tested CDP gesture against the executing `dist/` bundle (`driver.build.verified:true` both
  legs) under a RECORDED oracle (`driver.oracleIdentity` `92a74b7d`), and its node evidence is the
  pure oracle/validator + the pins. **A green here is a MEASUREMENT-SHAPE GREEN — never
  app-green:** it says the oracle and the report shape are total and the values were measured; it
  says NOTHING about app behavior (the unit changes none — `src/**` carries only the additive,
  inert-when-unarmed `O0HookRecord.startMs`/`endMs`), and it never licenses quoting the remainder
  as a style/layout cost. No page-design artifact is owed (`docs/skills/designing-pages.md` does
  not exist in this tree).

### 15.11 The two test-side repoints applied in this pass (recorded — §13.7 (4) is the recurring process cost)

**Both are TEST-side provenance/schema repoints applied by the supervisor in the same pass as the
run; neither weakens a clause and neither touches an assertion's substance:**

1. **The `RA-2c` fixture's duplicate id** (`tests/unit-o0-m1-m3-reaudit-pins.test.ts:261`, the
   `[ST4]` row: "twelve `row.stages[]` entries (the closed 11 + a duplicate) must FAIL, naming the
   count and the duplicate") — the fixture's duplicated id was repointed so the pin still tests
   the CLAUSE it names (a duplicate id) rather than a fixture that could not be built. **The red
   set's own clause is unchanged: `RA-2c` still demands the refusal WITH the count and the
   duplicate named.**
2. **The edition probe EIGHTH→NINTH** (`tests/unit-o0-m1-m3-driver-contract.test.ts:313-314`:
   `EXPECTED_EDITION = 'NINTH'`, `EXPECTED_ORDINAL = 9`) — **the FOURTH consecutive regeneration
   that owes this repoint** (the `F7-3`/`F8-3`/`F9-1` class; §14.5's "general form" is the fix —
   §13.7 (4)). **Owner: the next cycle (TEST).** The probe is otherwise an ORACLE (banner-scoped
   `statusBanner()` + `ORDINAL_BY_WORD` + the `LIVE-1B` one-token mutation discrimination proof),
   and its red on a wrong edition is what makes it evidence.

**Tracker edits made with §15 (surgical):**
- **`docs/defects.md`** — `O0-MEASUREMENT-SHAPE-DOUBLE-REDERIVE` → **FIXED (2026-09-21)** (the
  NINTH-run closure note) and the §13-findings rows (`O0-ROW-PASS-ASSERTED-NOT-DERIVED`,
  `O0-AGGREGATION-IDENTITY-DEMOTED`, `O0-ATTRIBUTION-FIELDS-TRUSTED-NOT-REDERIVED`,
  `O0-MEASUREMENT-SHAPE-VALIDATOR-GAPS`, `O0-MANDATORY-NOTE-CLAUSE-DODGEABLE`,
  `O0-UNION-BAND-FIELD-DRIFT`, `O0-LIVE-GATE-TEXT-PROBE`, `O0-REPORT-VALIDATED-BEFORE-THE-NOTE-
  ATTACH`) → **FIXED (2026-09-21)** with one-line closures, the OWED/ACCEPTED items kept as
  explicit rows with owners.
- **`docs/next-steps.md`** — the **DONE row** for item 3 (the full cycle history, the counts, the
  layer statement, the review-record path) + the **NEXT QUEUE leading with O-5** (gate satisfied
  by the ninth edition's accepted form) + the OWED list.
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — **§12.18** (the ninth run: the PASS, the
  NINTH edition, DEC-1's accepted form reproduced).
- **`docs/decisions.md`** — DEC-1's provenance: the NINTH edition reproduces the accepted form
  **and the oracle now certifies it**; **O-5 unblocked**; content unchanged.
- **`docs/pending.md`** / **`docs/HANDOFF.md`** — the stale edition/verdict/count lines
  reconciled (no M1-M3 park row exists in `pending.md` to retire).
- **`archive/reviews/2026-09-21-unit-o0-m1-m3-reaudit-doc-review.md`** — this pass's review
  record (RCA-6/item 10d).
