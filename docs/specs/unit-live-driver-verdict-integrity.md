# Unit `U-LIVE-DRIVER-VERDICT-INTEGRITY` — the live driver's own verdict integrity: a verdict per DECLARED matrix row or a loud refusal, a failing clause with its observed-vs-required values on every row, and the driver's own artifact hygiene — the minted home of `GAP-7` / `PD-DRIVER-MATRIX-AND-EVIDENCE` — Spec

**Minted `2026-09-29` by the SpecDoc, on the architect's ruling *"proceed with the recommended order"*, which makes
this unit the FIRST unit of the live-driver prerequisite set.** **Row id in the program's convention:**
`U-LIVE-DRIVER-VERDICT-INTEGRITY` — **`U-` for a unit, `LIVE-DRIVER` for the instrument under contract
(`scripts/live-drive.mjs`, the same subject the tracker rows name as *"the live-driver's owning unit"*),
`VERDICT-INTEGRITY` for what this unit alone fixes: not the app, not the scenario vocabulary, not the fixture —
**the trustworthiness of the driver's OWN evidence.** **The minted id names ONE deliverable and claims no second
one** (`RCA-2`: a multi-unit deliverable is split per unit; the fixture route is `GAP-8`'s, §9 `T-3`).

**Citation discipline of this file: NO LINE NUMBER APPEARS ANYWHERE IN IT.** Every citation is a `path` + a
symbol / a block name / a row id / a `§section`. **Every figure is either a read I took (labelled `VERIFIED-BY-READ`
with the reader named) or a recorded reading of another pass (labelled `RECORDED READING` with its measurer
named).** Where the records are silent the cell says **`NOT RECORDED`** and names what settles it.

---

## 0. The state this unit exists to clear — and the rulings it records

**The live battery is now the program's only app-layer instrument, and its report is currently unreadable.** The
`§6.1 summary.total` is the `§5.U` matrix-row count (`U-1`..`U-8`), and `DECIDED: LIVE-GATE-RUN-DISCIPLINE`
already rules that **a matrix report with no verdict per declared row is INVALID** — **so at this head every
live verdict the program takes is, by its own standing decision, INVALID.** `docs/specs/ui-feature-set-breakdown-2026-09-29.md`
`§7` item `3` (as answered by its `§7` closure annotation) records the sequencing: **the driver-side prerequisite
comes before the later UI waves, because it is what makes a live verdict readable at all.**

### 0.1 The measured evidence, each quoted with its measurer (NOT re-derived here)

**This filing ran nothing, booted nothing, drove no battery and holds NO SHELL** (its tool wall is read/search +
doc-write). Every row below is a **RECORDED READING quoted with the pass that took it**, except where the cell
says `VERIFIED-BY-READ` (a read THIS filing took, stated as such).

| # | The reading, in substance | Measurer it is quoted from |
| --- | --- | --- |
| **M-1** | **THE MATRIX MAPPING IS BROKEN AND LIES ABOUT IT.** The `§5.U` matrix report returned only **`2 of 8` declared rows** (`U-1`, `U-7`) **while the report still printed `OK`**; `§6.1 summary` reads **`"matrixRowsExecuted":2`** against **`"total":8`**. Measured at **two** configurations, and **no flag helps** — including **`--block=boot_landing,import` → `matrix rows executed=0 … OK`**. **The named row (`docs/defects.md` `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`) states the verdict as its own finding: *"an INVALID report is worse than a missing one: it reads as a pass."*** | **the live-scenario runner** (`docs/defects.md` `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`; re-confirmed by **the live-measurement pass, `2026-09-29`**) |
| **M-2** | **`reconcileMatrixRows` CANNOT BE MADE TO REFUSE FROM THE DRIVER'S OPTION SPACE:** **`missing` is HARDCODED `[]`**, and **the `blocksRun===0` branch SUBSTITUTES THE WHOLE MATRIX ID LIST for the executed set** — so a full battery can never report a missing row. | **the live-measurement pass, `2026-09-29`** (`docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§3.3`, `§9` `NR-1`–`NR-5` annotation) |
| **M-3** | **SIX NAMED ROWS PRINT NO FAILING CLAUSE.** The worst is **`vis_persist`, whose ENTIRE detail is `before=true after=true` with NO PREDICATE STATED**; `boot_landing` states **`landingAfter=true` WITHOUT THE REQUIRED VALUE**; and the four `uf_*` lines print the failing **comparison** (`agrees=false`, `frameRendered=false`) but **no `§6.1` breakdown**. `repro_dup_para` is recorded separately as FAILing with an **EMPTY evidence field**. | **the live-scenario runner** (`docs/defects.md` `LIVE-DRIVER-EVIDENCE-LOSS`, `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE` group rows) |
| **M-4** | **`surface.target` IS PRINTED NOWHERE IN A `100`-BLOCK RUN** — only the summary line carries `layer="assembled-renderer (RCA-12)"`. | **the live-measurement pass, `2026-09-29`** |
| **M-5** | **TWO COUNTED ROWS ARE NOT ROW BLOCKS AT ALL.** `boot_landing` and `vis_persist` are `{pass, detail}` — **no `row`, no `assertion`, no `dclass`, no `realInput`, no `proxyPASS`, no `surface`** — and appear in **NEITHER** the `§5.U` matrix **NOR** the extended table, so their FAILs are unclassifiable and untraceable (`D-GP-UFA-3`/`D-GP-UFA-4` violated on those paths). | **the live-measurement pass, `2026-09-29`** |
| **M-6** | **THE DRIVER'S OWN ARTIFACTS: a minimized `zone:left` is never restored.** `user2_pane_drag` → minimized; `user10_collapse_vertical_text` → minimized **AND NEVER UNDONE**; **the driver's own `uf_restore_layout` DIAG reads `{zone:'is-minimized'}`**; and **every later frame-based row then reads `frames=0`** where a clean state reads **`.pane-frame` = `2`** with **`[data-pane-id]` = `2`** and the census agreeing (`"doc-nav, search"`). **A minimized zone REPLACES ITS PANE STACK WITH THE TAB STRIP BY DESIGN** — the driver's own `uf_panes_8` asserts exactly that (`minimized.frames===0`). | **the live-measurement pass, `2026-09-29`** (CDP-sampler DOM counts timestamp-correlated to each row's read; `docs/defects.md` composition-correction block) |
| **M-7** | **`vis_persist` IS A COORDINATE ARTIFACT.** Its click was dispatched at **`y = 1473.8` of a `720` px viewport (`inVp:false`)**, so nothing was hit — while **the same element flips under a hit-tested click (`y=360`, `onTarget:true`)**. | **the live-measurement pass, `2026-09-29`** |
| **M-8** | **THE FIXTURE ROUTE (recorded, NOT this unit's to fix).** The demo launch's doc list is **empty** because **`edit` is default-OFF**, so `edit.import_markdown` is not registered (`MCP error -32602`); **the driver already makes seeding work by widening the gate over CDP before seeding** (the seeding route exists: `seedCorpus()` → `edit.import_markdown`; `--strict-seed` via `o0MarkdownTree`). | **the live-measurement pass, `2026-09-29`**; the **seeding/widening route is `VERIFIED-BY-READ` by this filing** (reader: the SpecDoc) |
| **M-9** | **The battery's shape, for scale:** **`done: 100 blocks, 39 FAIL, 3 PARKED`** — block split **PASS 31 / FAIL 39 / PARK 3 / DIAG 27**; `§6.1 summary: {"total":8,"pass":1,"fail":1,"parked":0,"matrixRowsExecuted":2,"blocksRun":100,"extendedRowsRun":54,"diagnostics":27}`. **`summary.pass`/`summary.fail` count ONLY the executed matrix rows and must never be read as app health.** | **the live-scenario runner** (`docs/defects.md`, `docs/specs/ui-feature-set-breakdown-2026-09-29.md` §3 group rows) |

### 0.2 The ARMs this filing VERIFIED BY READING — reader: the SpecDoc (each a read, not a re-derivation)

| # | The read | Why it decides a clause below |
| --- | --- | --- |
| **V-1** | **Why `2 of 8` and not some other number: five of the eight declared mappings name a block that NEVER EMITS THAT ROW ID.** `MATRIX_ROWS` declares `U-1`→`uf_panes_12`, `U-2`→`uf_tabs_7`, `U-3`→`uf_panes_12`, `U-4`→`uf_layout_10`, `U-5`→`uf_layout_10`, `U-6`→`uf_panes_8`, `U-7`→`uf_hist_6`, `U-8`→`uf_tabs_3`. **The only row-block results carrying a `U-<n>` id in the whole driver are `U-1`'s** (`uf_panes_12`) **and `U-7`'s** (`uf_hist_6`) — the other six blocks return their **checklist** ids (`UF-TABS-7`, `UF-TABS-3`, `UF-PANES-8`, `UF-LAYOUT-10`, …). **So the mapping is DECLARED but not HONOURED, and nothing checks that a declared row is ever reached.** | §2.1 `E-1`/`E-2`: the verdict must be carried by the row, and `matrixRowsExecuted` must be checked **against the declared set**, not merely reported. |
| **V-2** | **`boot_landing` and `vis_persist` have no row path at all** in the block source (their every return is a bare `{pass, detail}`), which is the code-side twin of `M-5`. | §2.2 `E-4`: the two are NAMED, and are either converted or explicitly excluded from the pass arithmetic by name. |
| **V-3** | **`reconcileMatrixRows(executed, blocksRun, table)`'s `fullBattery` is decided by `blocksRun === 0`, and its call site passes `0` when `names.length === Object.keys(BLOCKS).length`** — i.e. **the flag means *"every BLOCK ran"*, NOT *"every DECLARED ROW got a verdict"*.** In the `--block=all` run **all 100 blocks ran (`blocksRun=100`)** while only **`2` rows** were reached — the two facts are independent, and the reconciler reads the wrong one. | §2.1 `E-3`: the full-battery predicate is re-pinned to the **row** dimension. |
| **V-4** | **The per-row console line prints only `row:block=PASS|FAIL|PARKED` + the two flags** — the §6.1 field set is built by `rowResult` and **never printed**, which is the mechanism of `M-3`/`M-4`. **The `reportRows` array also carries only `{row, block, pass, proxyPASS, realInput, park}`** — the artifact-shaped record is as thin as the console line. | §2.2 `E-2`/`E-3`: the **printed** per-row line is contracted, not just the returned object. |
| **V-5** | **`ufSurfaceTarget(h)` DOES exist and IS passed to most row results** (`surface: await ufSurfaceTarget(h)`, in ~40 blocks). So `M-4` is **not** "the field is missing from the object" — it is **"the field is never PRINTED"**. | §2.2 `E-3`: the fix is a **printing** clause, and no implementer may "fix" it by inventing a second surface object. |
| **V-6** | **The two hygiene blocks exist and are correct in intent but are NOT in the battery path**: `uf_restore_layout` reads `is-minimized`, real-clicks `#zone-minimize-left` to re-expand, re-expands `doc-nav`/`search`, and restores the mode; `uf_scroll_reset` scrolls to top. **They are excluded from the `uf_*` row-block census as harness hygiene, they carry no row, and `--block=all` runs them only because `all` = every key — i.e. they run ONCE, at their own position in the key order, not before each mutating block.** | §2.3 `H-1`/`H-2`: the hygiene **must be reachable per block**, not once per battery. |
| **V-7** | **`ufEnsurePaneExpanded(h, paneId)` reads `.pane-frame[data-pane-id]` and returns `{present:false, path:'absent'}` when the frame is absent** — which is **exactly what a minimized zone produces by design** (`M-6`). So the driver's existing "ensure" helper **cannot distinguish *"the pane is not enabled"* from *"the zone is minimized so its stack is a tab strip"***, and a frame-based row therefore measures the driver's own earlier state. | §2.3 `H-1`: the zone state must be read and restored **as a state**, before any frame-based read. |
| **V-8** | **`cdp.click(selector)` is a raw two-event coordinate dispatch with NO hit-test, NO viewport check and NO path record** — it computes the element's centre and dispatches `mousePressed`/`mouseReleased` there. **`vis_persist` drives its gesture through it.** | §2.3 `H-3`: a click with no proven path is a **driver** failure, and the marker distinguishing *"could not be driven"* from *"drove and failed"* must be printed. |
| **V-9** | **The `editingMode` drift is wider than one scenario:** `uf_settings_5` asserts a `/editingMode:…/` regex against the rendered operator text, **and** a sibling block calls `operatorSet({editingMode:'textarea'})`, **and** `uf_restore_layout`'s DIAG string reports `editingMode <before>-><after>`. | §9 `T-2`: the sweep is named as a clause of this unit's own deliverable, not left to the row that filed it. |
| **V-10** | **`tests/live-drive-contract.test.ts` is a NODE-STATIC source pin, not an import**: it reads the driver source, masks strings/comments, parses the exported `MATRIX_ROWS` literal out of the text, and asserts field presence in the returned-object slices — **because importing the driver would run `main(process.argv.slice(2))` at module scope and spawn/attach Electron**. | §4/§6/§7: what a **no-battery-run** red set can and cannot hold, stated so no TestWriter promises a live assertion it cannot run in node. |

### 0.3 The rulings this filing carries (from the architect's order and the standing decisions)

1. **THE ORDER IS TAKEN:** this unit is the **first** unit of the driver prerequisite set; **the wave order was not
   re-opened** (`docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§7` item `3`'s closure annotation).
2. **`GAP-7` IS MINTED AS THIS UNIT** — `PD-DRIVER-MATRIX-AND-EVIDENCE`; **`GAP-8` is NOT absorbed** (fixture
   route, §9 `T-3`), and the app-layer rows this unit's readings were confused with stay with their owners
   (§9 `T-4`).
3. **THE `§5.U` MATRIX IS FULL AT 8** (`G-5`/`R-9`): **this unit adds NO slot** and may only re-pin the declared
   rows' assertions. **A verdict per declared row, or an explicit refusal — never a silent pass.**
4. **NO NEW BLOCK MAY BE REQUIRED to make a verdict readable** (the architect's cap clause): the fix lives in the
   mapping, the row-result printing and the driver's own hygiene helpers.
5. **THE LAYER:** the driver is a **`[D]`-class local instrument**; a green proves the **driver's reporting
   integrity**, **never app behaviour**, and it is in **no trio** (§5).

---

## 1. Scope

### 1.1 What this unit IS (the deliverable, in one list)

1. **A verdict per DECLARED matrix row, or a loud refusal that NAMES the rows it lacks** (§2.1).
2. **A failing clause on every row** — the predicate that failed, with **observed vs required values** — plus
   `surface.target` and the `§6.1` field set **printed per row** (§2.2).
3. **No counted row may be a bare `{pass, detail}`**: every row the program counts is a row block, or is **named**
   as a non-row by design and **excluded from the pass arithmetic explicitly**, with the reason recorded (§2.2).
4. **The driver's own artifact hygiene**: shared state **restored** between blocks that mutate it; **every click
   hit-tested** with its coordinate and viewport stated; **"could not be driven" reported distinctly from "drove
   and failed"** (§2.3).
5. **The `editingMode` → `representationMode` scenario re-derivation and the driver-wide sweep for the removed
   token** — the row `LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT` names this unit as its owner (§9 `T-2`).

### 1.2 ALLOWED surface (exact)

| Path | The grant |
| --- | --- |
| **`scripts/live-drive.mjs`** | **THE WHOLE DELIVERABLE.** The mapping (`MATRIX_ROWS`, `reconcileMatrixRows`, the summary/refusal path), the row-result builder and its **printing**, the block-level hygiene calls, the hit-test/coordinate discipline, the `editingMode` sweep. |
| **`tests/live-drive-contract.test.ts`** | **NAMED as the unit's structural pin** — its rules are **kept green, or RE-STATED by the TestWriter under the program's re-statement discipline** (`⟨RE-STATED …⟩`, superseded value visible, teeth kept, **never a relaxation**; `DECIDED: HARNESS-ENABLEMENT-AND-BOOT-READINESS` clause (v)). **The TestWriter authors the changes to this file, not the implementer** (`AGENTS.md` item 3). |
| **`docs/specs/unit-live-driver-verdict-integrity.md`** (this file) | The contract; amended only by a spec-owning pass, annotated beside (`RCA-8(c)`). |

### 1.3 DENIED surface (explicit, so the allow-list cannot be widened by implication)

- **`src/**` and `tests/**` other than `tests/live-drive-contract.test.ts`** — no app change, no new test file,
  no `vitest.config.ts` edit. **This unit fixes the INSTRUMENT, never the app.**
- **`scripts/electron-divergence.mjs`** — the divergence leg is **another unit's** instrument; **no check is added
  to it** and its preserved comparison set is untouched.
- **The fixture/seed route** — `seedCorpus`/`o0MarkdownTree`/`--strict-seed`/the CDP gate-widening are **used as
  they are**; **making the demo launch's fixture exist is `GAP-8`'s** (§9 `T-3`).
- **`MATRIX_ROWS`' row set** — no id added, removed or renumbered; **no new `BLOCKS` key**.
- **`package.json`, `docs/specs/designing-pages.md`, the page-design skills** — untouched: **this unit changes no
  page design and no test-use-case coverage matrix**, so the design-skill update obligation does not attach.
- **Any `[T]`/node claim** — a driver green may never be cited as app evidence, `[T]` evidence or envelope evidence.

### 1.4 What this unit is NOT

It is **not** the app's defects: `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`, the panes class, `PANE-VISIBILITY-IRREVERSIBLE`,
`U-EDIT-1-LIVE-4` and every other row the report names stay filed where they are, **un-fixed and un-dispositioned
by this unit** (§9 `T-4`). It is **not** a repair of the battery's app-layer readings, a re-measurement, or a claim
that the app works. It is **not** the fixture route. It is **not** a new live assertion about the app: **the live
rows it touches are re-pins of already-declared rows** (§2.1 `E-5`).

### 1.5 THE HONESTY BLOCK

1. **This filing ran nothing.** No battery, no leg, no Electron, no suite, no trio. **Its tool wall is read/search
   + doc-write and it holds no shell.**
2. **`M-1`…`M-9` are quoted, each with its measurer.** `V-1`…`V-10` are **reads this filing took**, each labelled.
   **Neither set is a measurement of mine, and no figure is re-derived from another.**
3. **The exact arm behind `2 of 8` is `V-1`'s** — *"the block never emits the declared row id"* — **read from the
   source by this filing**, and it is consistent with `M-1`/`M-2` as those passes stated them. **Where those
   passes said the arm was *"UNVERIFIED by this pass"*, this file says the arm is now read, and says by whom.**
4. **`NOT RECORDED`:** the per-row printed output of the `2 of 8` run in full; the driver's captured **exit code**
   for that run (the tracker row records it as **DERIVED, not captured**); and **whether every one of the six
   clause-less rows is clause-less for the same mechanism.** *What settles them:* the landing pass's own battery
   run, whose per-row lines are this unit's acceptance reading (§6 class (b)).
5. **`sha256` and line count of THIS file are OWED** — this pass holds no shell (§10 item 10).

---

## 2. The surface — signature/field by field, as the driver's own shapes

### 2.1 THE MATRIX CONTRACT (`E-1`…`E-5`)

**`E-1`. THE DECLARED ROW IS THE UNIT OF TRUTH.** `MATRIX_ROWS` (8 entries, `U-1`..`U-8`, each naming ONE
`block` and optionally extra `blocks`) is **the single declaration of the `§5.U` row set**. **A declaration is a
PROMISE**: a run that executes the named block **must produce a verdict carrying that row id**, or the report must
**REFUSE** (§2.1 `E-3`). **`MATRIX_ROWS.length` stays `8`, its ids stay exactly `U-1`..`U-8`, and its `block` names
stay the ones the pin asserts** (`tests/live-drive-contract.test.ts` `R5.b`/`R5.c`).

**`E-2`. THE VERDICT IS CARRIED BY THE ROW.** A block whose declared row(s) it claims must return, **per declared
row, one row-block result carrying that row id** — i.e. the returned object's `row` field is the DECLARED id, and
the `§6.1` field set of §2.2 applies to it. **The checklist id may still be reported**, by a distinct field
(an `extra` member such as `checklistRow`, or the extended-table path) — **never by putting the checklist id in
`row` on a path that is supposed to carry a declared matrix row.** **Consequences, all of them contracted:**

- **`uf_panes_12` claims `U-1` AND `U-3`** (two declared rows, one block, by `MATRIX_ROWS`' own design):
  **each declared row gets its own verdict**, distinguishable in the report. **One block claiming several rows is
  legal and already tolerated by the reconciler** (`multiRowBlocks` is informational there) — **but a `U-3`
  verdict that IS the `U-1` verdict is not a verdict for `U-3`**, and the report must not present it as one.
- **The blocks that today return a checklist id while a declared row names them** — read out by `V-1` — **must
  produce their declared row's verdict when driven**, or the row is **REFUSED** (§2.1 `E-3`).
- **No row id may be invented**: a reported `U-<n>` that is not in `MATRIX_ROWS` is a **row-set ERROR** (already
  the reconciler's `extra` arm, kept).

**`E-3`. THE FULL-BATTERY PREDICATE IS RE-PINNED TO THE ROW DIMENSION — THE SUBSTITUTION AND THE HARDCODED EMPTY
SET ARE NAMED AS THE DEFECTS.** Two clauses, both required (`docs/defects.md`
`LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`'s own fix shape):

1. **`reconcileMatrixRows` must derive `missing` as the set difference between the table's declared row ids and
   the rows that actually carry a verdict** — **never a hardcoded empty list, and never a substitution of the
   declared id list for the executed set.** The `blocksRun === 0` substitution is **DELETED, not guarded**: it is
   the mechanism by which a full battery can never report a missing row.
2. **`ok` must be `false` whenever a declared row lacks a verdict in a FULL-BATTERY run, and the refusal must
   NAME the rows it lacks.** The refusal is **loud**: a `ROW-SET ERROR` line per refusal carrying the missing row
   ids, a summary line reading **`REFUSED`** (not `OK`) with them named, and **`process.exitCode` non-zero**
   (**`1`** — `2` stays the hard-error code the driver already uses for an import/twin failure).

**Contract shape, stated as the driver's own field-by-field shape** (implementer's least-code choice; the
TestWriter may re-state the pin's text but not its teeth):

| Element | Contract |
| --- | --- |
| `MATRIX_ROWS` | unchanged: 8 entries, ids `U-1`..`U-8`, each with a non-empty `block`; statically parseable pure data (the pin parses it out of source text). |
| `reconcileMatrixRows(executed, blocksRun, table)` | **pure** (no I/O, no clock, no DOM); returns `{ ok, errors, matrixRowIds, executedRows, missingRows, multiRowBlocks, fullBattery, matrixTotal, rowsCounted }`. **`missingRows` is the declared-minus-verdict set** (`[]` **only** when that set is genuinely empty). **`ok === (errors.length === 0)`, and a non-empty `missingRows` in a full-battery run is an error.** |
| the **full-battery predicate** | decided by **every `BLOCKS` key having been requested AND the requested set covering every declared row's block** — stated in the report as a field (`coverage: {matrixTotal, verdicts, missingRows, fullBattery}`) so the reading is self-describing; **`blocksRun` stays an informational counter** and may no longer decide coverage. |
| the **summary** | keeps `total` = `MATRIX_ROWS.length` (`8`) and keeps `matrixRowsExecuted` (the set size of row ids that carried a verdict) **plus** the new coverage field. **`pass`/`fail`/`parked` continue to partition ONLY the executed rows** and **must never be read as app health** — the printed line says so. |
| the **reconciliation line** | prints **`OK`** only when `ok`; otherwise **`REFUSED`** with **every missing row id named**, and the run still completes (its per-row readings are the artifact) while the exit code is non-zero. |

**`E-4`. THE TWO NON-ROW-BLOCK ROWS ARE NAMED.** `boot_landing` and `vis_persist` (`M-5`) are **counted rows**
whose FAILs cannot be classified. This contract rules one of exactly two dispositions per row, **chosen by the
implementer and RECORDED in the DONE row**:

1. **CONVERTED (this filing's ruling, as the default):** each becomes a row block carrying its own row id
   (`UF-LANDING-*` / `UF-VIS-*` class id — an id in the driver's existing checklist vocabulary, **not** a new
   `U-<n>` slot), its assertion, its `dclass`, its `realInput`, its `evidence`, its `proxyPASS` and its
   `surface`; **and** its failing clause per §2.2; **and** its place in the extended table's arithmetic.
2. **EXPLICITLY EXCLUDED, BY NAME, WITH THE REASON ON THE RECORD:** it stays `{pass, detail}` **and** the driver
   prints it as an **excluded non-row** (the diagnostic/hygiene marker form), **and** the summary's arithmetic
   states that its verdict is **not** counted anywhere. **A silent middle state is the defect this clause
   exists to kill:** an unmarked `{pass, detail}` that the run counts but the coverage report cannot see is a
   **review finding**.

**Re-pins carried by this unit** (the matrix is FULL — these are assertion re-pins on ALREADY-DECLARED rows, no
new slot, `G-5`/`R-9`):

- **`vis_persist` (or its converted row):** the assertion must state **the predicate and the required value** —
  *"a real hit-tested click on the pane-visibility toggle flips `data-enabled` and the change is PERSISTED (a
  second read after a re-derive reads the flipped value)"* — never a bare `before=true after=true` (`M-3`).
- **`boot_landing`:** the assertion must state **the required value of `landingAfter`** (the landing is REMOVED on
  the empty-boot → first-import path — the pinned rule the app-layer row `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`
  records as violated) **and** print the observed value beside it. **This unit re-pins the SENTENCE; it does not
  fix the app.**
- **The four `uf_*` rows** that print a comparison (`agrees=false`, `frameRendered=false`) gain the `§6.1`
  breakdown per §2.2 — **the comparison stays as evidence, and the structured fields are added beside it.**

**`E-5`. NO NEW SLOT, NO NEW BLOCK, NO NEW ASSERTION ABOUT THE APP.** Any new live assertion is admissible **only**
as a re-pin of an already-declared row's evidence text. **A run's block COUNT is not evidence**: `blocksRun` is
informational (`user-flow-audit.md` `§6.1`'s own bullet).

### 2.2 THE EVIDENCE CONTRACT (`E-6`…`E-10`)

**`E-6`. THE `§6.1` FIELD SET IS UNCHANGED AND IS NOW PRINTED.** A row block's returned object carries, exactly
as today: **`row`, `assertion`, `dclass`, `realInput`, `evidence`, `proxyPASS`, `surface`, `pass`** — plus the
already-present `proxy`, `gesturePath`, `undoDisabledAfter`, `diagnostic`, `detail`. **`D-GP-UFA-3` makes
`realInput`/`evidence` MANDATORY report fields, so an EMPTY `evidence` on a FAIL is a violation of a recorded
requirement, not a preference** (`docs/defects.md` `LIVE-DRIVER-EVIDENCE-LOSS`, `repro_dup_para`).

**`E-7`. THE PRINTED PER-ROW LINE IS CONTRACTED — THIS IS THE MECHANISM OF `M-3`/`M-4`.** The evidence the report
must carry is the **`§6.1` field set of the block's own result, which is currently never printed** (`V-4`) — **the
returned object is not the artifact; the printed line is.** Each row's printed line (and the `reportRows` record
the report is built from) must carry, at minimum:

| Printed member | Content |
| --- | --- |
| `row` | the declared/claimed row id (§2.1 `E-2`) |
| `block` | the `BLOCKS` key that produced it |
| `verdict` | `PASS` \| `FAIL` \| `PARKED` \| `NOT-DRIVEN` (§2.3, `H-4`) |
| `dclass` | `D-interaction` \| `D-visual` \| `D-state` |
| `realInput` | the boolean, **derived from the proven gesture path** |
| `surface` | **the whole object, `target` AND `liveSurfacePresent`** — **`surface.target` is printed** (`M-4`; `V-5`: it exists and must be printed, not re-invented) |
| `failingClause` | on a non-PASS: **the predicate that failed, with `observed` and `required` values named**. **A row whose clause is absent from the printed evidence is a review finding** — this is the exact fix for `M-3`, whose worst case is `vis_persist`'s predicate-less `before=true after=true` |
| `evidence` | the concrete observation (§6.1 — never *"the block passed"*) |
| `proxyPASS` / `proxy` | as today (a proxy oracle can never PASS) |
| `gesturePath` | `cdp` \| `native-fallback` \| `missing` \| `zero-box` \| an affirmative recorded alternative |

**`E-8`. SIX NAMED ROWS MUST PRINT A CLAUSE.** The rows `M-3` names — **`vis_persist`, `boot_landing`, and the
four `uf_*` rows printing a bare comparison** — are the acceptance set for `E-7`. **`repro_dup_para`'s EMPTY
evidence is in the same acceptance set**: a FAIL with empty evidence is the row this contract exists to make
impossible.

**`E-9`. `realInput` BECOMES LOAD-BEARING AND IS PRINTED** — not decoration. **A row whose gesture path is not the
hit-tested `cdp` path reports `realInput:false` AND the reason it could not be driven, and its verdict is
`NOT-DRIVEN`, never `FAIL` on the app's account** (§2.3 `H-4`). **A `native-fallback` path forces `pass:false`**
(the existing rule, kept).

**`E-10`. THE `uf_*` CENSUS FLOOR IS KEPT.** The pin's floor — **`uf_*` row blocks ≥ `20`** (with
`uf_restore_layout`, `uf_scroll_reset`, `uf_mount_diag`, `uf_mount_leak_diag`, `uf_tabs_7_diag`,
`uf_panes_12_diag` as the declared NON-row set) — **must stay met or be RE-STATED by the TestWriter under the
re-statement discipline.** **Converting `boot_landing`/`vis_persist` into row blocks does not raise the floor
(they are not `uf_*`), and deleting a block to make the arithmetic easier is a review finding.**

### 2.3 THE HYGIENE CONTRACT (`H-1`…`H-5`)

**`H-1`. STATE IS RESTORED BETWEEN BLOCKS THAT MUTATE IT — THE MEASURED CASE IS `zone:left` MINIMIZED.** The
driver's own DIAG reads `{zone:'is-minimized'}` (`M-6`), and **every later frame-based row then reads `frames=0`
where a clean state reads `.pane-frame` = `2`**. The contract:

1. **A frame-based row must read the ZONE STATE as a state, not infer it from frame absence.** The reading names
   three distinct states and never conflates them: **`zone` expanded (frames painted)** · **`zone` minimized
   (the pane stack is REPLACED BY THE TAB STRIP BY DESIGN — the driver's own `uf_panes_8` asserts
   `minimized.frames===0`)** · **pane not enabled / frame genuinely absent**. **`ufEnsurePaneExpanded`'s current
   `{present:false, path:'absent'}` result is the conflation this clause kills** (`V-7`).
2. **Re-expansion uses a REAL hit-tested gesture** (`#zone-minimize-left`, the control `uf_restore_layout` and
   `uf_panes_8` already drive) **when the state is minimized** — OR the row **reads the zone tab strip instead of
   the frame**, with the choice recorded in the evidence. **Either is honest; reading `frames=0` as an app FAIL is
   not.**
3. **Restoration is reachable PER BLOCK, not once per battery.** `uf_restore_layout` runs once, at its own
   position in the key order (`V-6`), which is **not** "before any frame-based row". The hygiene must be
   **callable from the block that needs it**.
4. **A block that mutates shared state and does not restore it is a review finding** — the same rule the
   `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` row records for persisted pane visibility (`persistence_v1` toggles
   `doc-nav` OFF and persists it; **no block restores it**, so `uf_panes_1` PASSES alone and FAILS in the battery
   order). **The isolation tool is `--block=`** (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`; `docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§6` item `3`):
   **a row whose verdict depends on its POSITION must be re-measurable alone, and the two readings must agree
   once the hygiene holds.**

**`H-2`. EVERY BLOCK'S OWN HYGIENE IS DECLARED.** A block's result names the state it started from and the state
it leaves (the pattern `uf_panes_8`/`uf_layout_10`/`uf_hist_6` already use with their `[restore]` segments), so
the battery's ORDER is inspectable from the artifact. **No silent cross-block contamination.**

**`H-3`. EVERY CLICK IS HIT-TESTED — `cdp.click` IS NOT ENOUGH.** `M-7`'s artifact is the measured case: a click
dispatched at **`y = 1473.8` of a `720` px viewport** hit nothing, while **the same element flips under a
hit-tested click at `y=360`**. Clauses:

1. **A click that carries a verdict is driven through a path that proves the target** — the `ufRealClick` route
   (`V-8`: it hit-tests with `document.elementFromPoint`, records `onTarget`, and derives `realInput` from
   `path === 'cdp'`) **or** an equivalent route that adds the missing checks to the raw `cdp.click` path (a
   hit-test, a viewport check, and a recorded path). Either way **every click records its coordinate, the
   viewport it was dispatched against, the element under that point, and `onTarget`**.
2. **A coordinate that is off-viewport or not on the target is a DRIVER failure, NOT a row failure.** The row
   reports **`NOT-DRIVEN`** with the driver-failure marker, **never** `FAIL` on the app's account. **The
   `inVp:false` case is the acceptance row for this clause.**
3. **A raw synthetic `.click()` remains admissible only as `[DIAG]`-marked non-verdict attribution evidence**
   (the existing rule the pin's `R2.e`/`R2.f` hold). **A row verdict may not be built on one.**

**`H-4`. "COULD NOT BE DRIVEN" IS REPORTED DISTINCTLY FROM "DROVE AND FAILED" — `realInput` IS THE DISTINGUISHER,
AND IT IS PRINTED.** This is the clause that stops the driver's own artifacts from inflating the app-layer pile
(`M-6`, `M-7`; `docs/defects.md` `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`: *"it inflates the app-layer pile and
hides a real green"*).

| Verdict | When | Printed requirement | Counted as |
| --- | --- | --- | --- |
| **`PASS`** | the assertion held, on a proven gesture path, with a non-proxy oracle | the full `§6.1` set + `surface.target` | an app-layer observation of the ROW only |
| **`FAIL`** | the assertion was DRIVEN and did not hold | **the failing clause, `observed` vs `required`** | an app-layer FAIL, split by layer before disposition (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`) |
| **`NOT-DRIVEN`** | the gesture could not be driven honestly — an off-viewport/`inVp:false` coordinate, a missing selector, a zero-box, a state the driver left mutated, an unproven path | **`realInput:false` + the DRIVER-failure marker + the concrete reason** | **never an app-layer FAIL**, never a PASS; named in the report's own arithmetic |
| **`PARKED`** | a **structural** precondition the surface cannot meet (an OS-owned dialog; an absent engine; a missing fixture) | `parkReason` **naming the missing precondition** (`RCA-11` clause (b): a recorded park reason, **never parked-by-default**) | separate from both, and never counted as an app FAIL |

**`H-5`. NO VERDICT IS PROMOTED.** A diagnostic/hygiene block (`diagResult`'s `{diagnostic:true, pass:false}` form)
**can never be a row verdict**; a re-read, a proxy oracle, or a synthetic path **can never become a PASS**; and
**`summary.pass`/`summary.fail` may never be cited as app health** — the printed line says so in its own words.

---

## 3. Mechanics and EVERY fail-state

### 3.0 The layer tag on each row

Every row below is **HARNESS `[D]` — the driver's own reporting integrity** unless its cell says otherwise.
**No row in this section is app behaviour, and no row here is evidence about the app.** `[T]` appears nowhere in
this unit's own claims.

### 3.1 The happy path, in exact order

1. **Invocation under `DECIDED: LIVE-GATE-RUN-DISCIPLINE`**: isolated MCP port + isolated CDP port, boot-and-connect
   confirmed before driving, the pre-live leg (`npm run divergence`) green as the mandatory precondition.
2. **Gate widening over CDP, then seeding** (the existing route: `cdp.enableGroups(groups)` → `seedCorpus()` /
   `o0MarkdownTree` → `edit.import_markdown`), and the seeded corpus confirmed by a read
   (`rag.list_documents` non-empty).
3. **The block loop runs**, each row block returning its `§6.1` result.
4. **Each row is printed** with `row`/`block`/`verdict`/`dclass`/`realInput`/`surface{target,liveSurfacePresent}`/
   `failingClause`/`evidence`/`proxyPASS`/`gesturePath` (§2.2 `E-7`).
5. **The matrix summary** prints `total` = `8`, `matrixRowsExecuted`, the coverage field, and the row verdicts.
6. **The reconciliation line prints `OK` iff every declared row carried a verdict**; otherwise `REFUSED` with the
   missing rows **named**, and the process exits non-zero (§2.1 `E-3`).
7. **The app-layer readings are handed to the disposition step**, each split by layer **before** any disposition
   (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`).

### 3.2 Enumerated fail-states (each a TestWriter row)

| # | Fail-state | Trigger | Contracted observable | Exit / verdict treatment |
| --- | --- | --- | --- | --- |
| **F-1** | **A DECLARED ROW WITH NO VERDICT** | a declared row's block ran (or the full battery ran) and no result carried that row id | `ROW-SET ERROR: matrix row(s) with no verdict: <ids>`; the reconciliation line prints **`REFUSED`** and **names the rows**; **`OK` is never printed** | exit **`1`**; the row is a **refusal**, never an omission (§2.1 `E-3`) |
| **F-2** | **A FULL BATTERY THAT EXECUTED FEWER ROWS THAN IT DECLARED** | `--block=all` (every `BLOCKS` key) with `matrixRowsExecuted < MATRIX_ROWS.length` | the coverage field reads `{matrixTotal:8, verdicts:<n>, missingRows:[…], fullBattery:true}`; **the run's own numbers disagree LOUDLY instead of reading `OK`** | exit **`1`**; **this is `M-1`'s exact case and the unit's acceptance reading** |
| **F-3** | **A ROW THAT CANNOT BE DRIVEN** | the honest gesture is impossible (selector absent, zero box, state unavailable, unproven path) | verdict **`NOT-DRIVEN`**, `realInput:false`, the DRIVER-failure marker, the concrete reason, and **no app-layer FAIL** | never a PASS; named in the arithmetic (§2.3 `H-4`) |
| **F-4** | **AN OFF-VIEWPORT CLICK (`inVp:false`)** | the dispatched coordinate lies outside the viewport or does not resolve to the target | **`NOT-DRIVEN`** with the coordinate, the viewport and `onTarget` printed; the row is **not** an app FAIL | the driver's failure, recorded as one (`M-7`) |
| **F-5** | **A STATE LEFT MUTATED** | a block minimized a zone / toggled a pane off / changed the mode and did not restore it before the next frame-based row | the next row's evidence names the state it started from; the run reports the contamination; **a frame-based row may not read `frames=0` produced by the driver's own prior block** | a **review finding** against the run (and against the implementer if the restore is missing) (§2.3 `H-1`) |
| **F-6** | **A MISSING FIXTURE** | the seed/fixture route produced an empty corpus (`M-8`: `edit` default-OFF ⇒ `edit.import_markdown` unregistered, `MCP error -32602`) or the engine is absent (`ECONNREFUSED`) | **the run REFUSES or PARKS BY NAME**: `PRECONDITION-FAILED` with the missing fixture named — **never a silent park, never a row FAIL against an absent surface** | exit non-zero on a refusal; `PARKED` + `parkReason` on a structural precondition (§2.3 `H-4`; `docs/defects.md` `LIVE-FIXTURE-PRECONDITION-GAPS`, whose **fixture route is `GAP-8`'s**) |
| **F-7** | **AN `isError` REPLY** | an MCP read/write the row depends on returns `isError` (e.g. a refused `provident.dispatch`, a refused `edit.import_markdown`) | the **`isError` text is printed verbatim**, the row is **`NOT-DRIVEN`** with that text as its reason, and **the app is not credited with a FAIL for a call the driver could not make** | never a PASS; never an app FAIL (§2.3 `H-4`) |
| **F-8** | **A DUPLICATE ID** | a duplicated `MATRIX_ROWS` row id, a duplicated `BLOCKS` key, or a reported row id absent from the matrix | `duplicated MATRIX_ROWS row id(s): …` / the pin's `R6.a` duplicate-key rule / `report row(s) absent from MATRIX_ROWS: …` | refusal; exit **`1`** (`R5.b`/`R6.a` kept green or re-stated, never relaxed) |
| **F-9** | **A ROW BLOCK THAT CANNOT FAIL** | a row block returning an unconditional `pass:true`, or a diagnostic block promoted to a verdict | the pin's `R1` rules stay green; **a measurement-only block keeps the `{diagnostic:true, pass:false}` form** and can never be a row verdict | refusal / review finding (§2.3 `H-5`) |
| **F-10** | **AN EMPTY `evidence` ON A FAIL** | a FAIL whose printed evidence is empty or predicate-less (`repro_dup_para`, `vis_persist`) | **the failing clause is required**: a FAIL with no `failingClause` is **not a reportable verdict** | review finding (§2.2 `E-7`/`E-8`) |
| **F-11** | **A `{pass, detail}` RESULT THE RUN COUNTS** | a counted row block returning the bare shape (`boot_landing`, `vis_persist`) | either a full row block (§2.1 `E-4` (1)) **or** a printed, named exclusion from the arithmetic (§2.1 `E-4` (2)) — **the middle state is the finding** | review finding (§2.1 `E-4`) |
| **F-12** | **A STALE SCENARIO TOKEN** | an assertion against a removed vocabulary (`editingMode` — `DECIDED: REPRESENTATION-MODE-SUCCESSOR` landed `representationMode: html \| markdown`; `DECIDED: EDITING-MODE-SETTING` is SUPERSEDED) | the driver's sweep finds **every** occurrence (`V-9` names three sites in the read), and the false-FAIL generator is gone | review finding until swept (§9 `T-2`) |

### 3.3 The numeric/census claims in this file, each with its source

| Claim | Source |
| --- | --- |
| `MATRIX_ROWS` has exactly **`8`** entries, `U-1`..`U-8` | **`VERIFIED-BY-READ`** (this filing; cross-read of the breakdown's `VERIFIED-BY-READ` citation of the same table) |
| **`2 of 8`** rows executed; `"matrixRowsExecuted":2` vs `"total":8` | **`RECORDED READING; measurer: the live-scenario runner`** |
| **`100` blocks / `39` FAIL / `3` PARKED**; PASS 31 / FAIL 39 / PARK 3 / DIAG 27 | **`RECORDED READING; measurer: the live-scenario runner`** |
| the **`uf_*` row-block floor is `20`** | **`VERIFIED-BY-READ`** of the pin's `R4.0` |
| `uf_*` `BLOCKS` keys present: **`26`** total, of which **`6`** are declared non-row (the pin's `UF_NON_ROW_BLOCKS`) ⇒ **`20`** row blocks | **`VERIFIED-BY-READ`** by this filing (reader: the SpecDoc) |
| **six** named rows print no failing clause; **two** counted rows are not row blocks | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| **`720` px viewport**, click at **`y = 1473.8`**, hit-tested control case at **`y = 360`** | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| clean state **`.pane-frame` = `2`**, `[data-pane-id]` = **`2`** | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| the register's arithmetic (§4) | this filing's own declaration |
| **exit codes** (`1` refusal / `2` hard error) | **`VERIFIED-BY-READ`** of the driver's own `process.exitCode`/`process.exit` paths |

### 3.4 What the red set must NOT do

It must not import the driver (§0.2 `V-10`), must not run Electron, must not add a `BLOCKS` key, must not change
`MATRIX_ROWS`' length or ids, must not relax a pin to make a row pass, and must not assert app behaviour.

---

## 4. The typed Property register (code-bearing unit — no exemption is available)

### 4.1 Is this unit code-bearing? YES

**`AGENTS.md` item 11 makes the register a requirement for a code-bearing unit; this unit edits
`scripts/live-drive.mjs` — executable code — so no exemption attaches.** **The register's subject is REAL and
named by the filing:** *the declared matrix row set and its verdict coverage · the report schema and its failing
clause · the driver's own state hygiene and hit-test discipline · the totality of the refusal and the exclusion
classification.* **Execution discipline (the standing ruling's, unchanged):** deterministic — exhaustive/finite
enumeration or a **pinned-seed** generator; **caps: ≤ 100 attempts per row · ≤ 400 attempts total ·
stop-after-5**; each row reports its **strategy id** and **`held`/`broken`**; the **adversarial pass audits it
read-only**; the register runs **offline, with no Electron** — and, **because the driver cannot be imported
(`V-10`), every row operates on EITHER the extracted source text and the statically-parsed exported literals OR a
pure re-implementation-free projection** (a re-stated pin may parse a value out of source text, as the existing
pin already does). **Pinned seed: `0x20260929`** (this filing's date, in the house's hex form; strategy ids are
derived from it and from the row names and are printed below). **No new dependency.** **Row ids are namespaced to
this unit and collide with no sibling's register** (`tests/live-drive-contract.test.ts`'s rows are `R1`…`R6`-class
rule ids, not `P-` rows; the app-harness and divergence-fixture registers are other files).

### 4.2 The register (`6` rows — every term printed as the sum of its factors)

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **INVARIANT** | **THE DECLARATION IS UNMOVED.** `MATRIX_ROWS` is exported, statically parseable pure data, enumerates exactly `U-1`..`U-8`, has **no duplicated row id**, every entry names a **non-empty `block`** that exists in `BLOCKS`, and the `uf_*` row-block census floor (`20`) is met; and **the summary's `total` is derived from `MATRIX_ROWS`** and reads the matrix-row count, never the block count. | 1 export/literal shape arm + 1 id-set equality arm (`U-1`..`U-8`) + 1 uniqueness arm + 1 block-resolution arm + 1 census-floor arm + 1 `total`-derivation arm | **`1+1+1+1+1+1 = 6`** |
| **`P-IM-2`** | **INVARIANT** | **THE REPORT SHAPE IS STRUCTURALLY COMPLETE FOR EVERY COUNTED ROW.** Every `uf_*`/extended **row** block's returned object carries the `§6.1` set (`row`, `assertion`, `dclass`, `realInput`, `evidence`, `proxyPASS`, `surface`, `pass`), a valid row-id form, a valid `dclass`, a **non-empty `evidence`**, a `surface` carrying **both `target:'assembled-renderer'` and `liveSurfacePresent`**, and the **per-row printing** names `row`/`block`/`verdict`/`dclass`/`realInput`/`surface`/`failingClause`/`evidence`/`proxyPASS`/`gesturePath`; **a counted row that returns the bare `{pass, detail}` shape is either converted or named as an exclusion.** | 8 field-presence arms (the `§6.1` fields) + 1 row-id-form arm + 1 dclass arm + 1 empty-evidence arm + 1 surface-pair arm + 1 printed-line arm + 1 bare-shape classification arm | **`8+1+1+1+1+1+1 = 14`** |
| **`P-SM-1`** | **STATE-MACHINE** | **THE VERDICT-COVERAGE TRANSITION IS TOTAL: A DECLARED ROW ENDS IN EXACTLY ONE OF {VERDICT, REFUSAL}.** Enumerated over the coverage space: (i) all 8 declared rows verdicted ⇒ `ok`, no refusal, `OK` printed; (ii) `n < 8` verdicted in a **full-battery** run ⇒ `ok:false`, the missing set **non-empty and equal to the declared-minus-verdicted set**, `REFUSED` printed, exit non-zero; (iii) `n < 8` in a **scoped** run ⇒ not a refusal (a row a scoped run did not execute is inconclusive, not a defect) **but never a claim of coverage**; (iv) a reported row id absent from the matrix ⇒ error; (v) a duplicated declared id ⇒ error; (vi) a declared row whose block is missing/empty ⇒ error. **The substitution and the hardcoded-empty set are dead in every branch** — asserted by the source-level read that no branch assigns the declared list to the executed set, and by the `missingRows` term of every draw. | 6 coverage branches × 2 arms (the `ok`/errors outcome; the `missingRows` value) + 4 negative draws (an empty `missingRows` with an unverdicted row; the substitution pattern re-introduced; a full-battery flag with `blocksRun>0`; a scoped run claiming full coverage) | **`6*2+4 = 16`** |
| **`P-SM-2`** | **STATE-MACHINE** | **THE DRIVER'S OWN MUTABLE STATE IS RESTORED, AND NO FRAME-BASED ROW READS ITS OWN PRIOR BLOCK'S ARTIFACT.** Enumerated over the shared-state space: `zone:left` expanded · `zone:left` **minimized** · pane collapsed · pane enabled/disabled · settings modal open/closed · page scrolled · representation mode flipped. For each: the state read is **distinguishable** (the minimized state is NOT reported as *"pane absent"*), the restore path exists and is **reachable per block** (not once per battery), a real hit-tested click drives it, and the **post-restore reading of the state equals the pre-mutation baseline**. Plus: the **persisted** state (`doc-nav` OFF and persisted by `persistence_v1`) has a restoring step, so an isolated `--block=` run and a full-battery run agree on the row's verdict. | 7 states × 2 arms (the distinguishable read; the restore-to-baseline) + 2 arm draws (the real hit-tested restore gesture; the per-block reachability) + 1 position-independence draw (isolated vs full-battery agreement on the same row) | **`7*2+2+1 = 17`** |
| **`P-TP-1`** | **TOTALITY** | **EVERY CLICK CARRIES A PROVEN PATH, AND "COULD NOT BE DRIVEN" IS NEVER AN APP FAIL.** Enumerated over the click space: on-target in-viewport · **off-viewport / `inVp:false`** · covered by another element · missing selector · zero-size box · a fallback path taken · a raw synthetic `.click()` on a verdict path. Each: the recorded shape names the coordinate, the viewport, the element under the point, `onTarget` and the path; a non-proven path yields **`NOT-DRIVEN`** + `realInput:false` + the DRIVER-failure marker; **no non-proven path can produce a PASS**; and a DIAG-marked synthetic click remains verdict-free. **None of the seven throws.** | 7 click shapes × 2 arms (the recorded shape; the verdict/pass outcome) + 2 negative draws (a fallback promoted to PASS; an unproven click counted as an app FAIL) | **`7*2+2 = 16`** |
| **`P-TP-2`** | **TOTALITY** | **EVERY REFUSAL, PARK AND EXCLUSION IS NAMED, AND NOTHING WIDENS.** Enumerated over the report's outcome space: a declared row with no verdict · an `isError` reply · a missing fixture (empty corpus / absent engine) · a structurally non-exercisable surface · a diagnostic/hygiene block · a converted-vs-excluded non-row. Each outcome **names the row/surface/reason**; **none is silent**; **`summary.pass`/`summary.fail` are never widened** beyond the executed rows; and **the driver adds no block, no `U-<n>` slot, no flag and no second surface object.** | 6 outcome shapes × 2 arms (the named reason; the arithmetic placement) + 2 draws (no block/slot/flag added; no second surface shape) | **`6*2+2 = 14`** |

**ARITHMETIC, printed with its terms:** `6 + 14 + 16 + 17 + 16 + 14 = 83` attempts total — **under the ≤ 400 cap**;
**the largest single row is `P-SM-2` at `17`**, **under the ≤ 100 cap**; **`6` rows**, at the house cap of ≤ 8.
**stop-after-5** on every row (≤ 5 distinct counterexamples reported, then the row stops). **Seed `0x20260929`;
strategy ids:** `strat:live-driver-matrix-unmoved` · `strat:live-driver-report-shape` ·
`strat:live-driver-coverage-transition` · `strat:live-driver-state-restore` · `strat:live-driver-click-totality` ·
`strat:live-driver-refusal-naming`. **Every row reports `held`/`broken`; the report prints each row's
declared-vs-executed term.**

### 4.3 The register's own honesty limits

1. **The register cannot IMPORT the driver** (`V-10`), so `P-IM-1`/`P-IM-2`/`P-SM-1`'s structural arms are
   **source-text and exported-literal assertions**, and a source-text assertion is weaker than a behavioural one.
2. **`P-SM-2`'s and `P-TP-1`'s behavioural arms require a live run** and therefore belong to §6 class (b): the
   register's node-side terms assert the **shape and the declared classification**, and the live run asserts the
   **behaviour**. The report must state which arm is which — **a row that claims a live arm it cannot run in node
   is the self-verification `RCA-1` exists to catch.**
3. **`P-SM-1` cannot prove the absence of the substitution by behaviour** (the function is not importable): its
   strongest node-side term is the **source read that no branch assigns the declared list to the executed set**,
   plus the `missingRows` term on every draw. **The behavioural term is the landing pass's real run** (§6 class (b)).
4. **A row whose arm cannot fail must be re-derived against its DECLARED terms, never re-scoped** — the rule the
   app-harness register records; it applies here unchanged.

---

## 5. The layer ledger

| Claim | The instrument that covers it | The layer it is evidence for |
| --- | --- | --- |
| the matrix mapping, the refusal, the report shape, the hit-test discipline, the state hygiene | **this unit's pins** (`tests/live-drive-contract.test.ts`, re-stated) + the register (§4) | **HARNESS `[D]` — the driver's reporting integrity only** |
| the driver actually refuses on a real run and reaches `8 of 8` in full-battery mode | **class (b)**, the landing pass's own `node scripts/live-drive.mjs` run on isolated ports | **HARNESS `[D]` on a live process — still NOT app-green, and NOT `[T]`** |
| the app's own behaviour, including every row the report names | **nothing in this unit** — the rows keep their own owners and their own layers (§9 `T-4`) | **`[U]`/app-layer rows are observed BY this driver and PROVEN by nothing here** |
| the pre-live leg | `npm run divergence` | **HARNESS `[D]`, a PRECONDITION** — unchanged, and this unit adds no check to it |

**THE UNIT IS IN NO TRIO.** The driver is a `[D]`-class local instrument, **not** a build input, **not** a node
module the trio compiles, and **not** part of any leg's evidence chain except as the apparatus that takes the
reading. **A green here proves the driver's reporting integrity — NEVER app behaviour** (`RCA-12`; the standing
*"a node-suite green is ENVELOPE-green, not APP-green"* rule, applied to the instrument layer).

---

## 6. The red-set plan (`RCA-1` — red FIRST, RUN, and REPORTED)

**The red set is authored by the TestWriter from §2 + §4, RUN, and its tally REPORTED before any implementation.**
**Nothing in this section is a test this filing wrote, and nothing here was run by this pass.**

### 6.1 The two classes, and which is the unit's own gate

| # | Class | What it proves | What it CANNOT prove |
| --- | --- | --- | --- |
| **(a)** | **The no-battery source/structural class** — the re-stated pin + the register's node-side arms: the matrix mapping's *"a verdict per declared row, or a refusal"* rule, the report schema and its failing clause, the hit-test/`NOT-DRIVEN` reporting rules, the state-restore rules, the duplicate-id rules, the `uf_*` census floor. **No Electron, no import of the driver, no battery.** | that the driver's SOURCE carries the contracted structure: the declared set is unchanged, no branch substitutes the declared list for the executed set, the printed per-row line names the contracted members, the bare `{pass, detail}` shapes are gone or named, the off-viewport guard exists, the restore path is reachable per block | that the driver **refuses on a real run**; that it reaches `8 of 8`; that a real click is hit-tested; that the app behaves in any way |
| **(b)** | **The real run** — `node scripts/live-drive.mjs` on **isolated ports**, boot-and-connect confirmed, per `DECIDED: LIVE-GATE-RUN-DISCIPLINE`. **Runnable by hand or by a script; NOT from a node unit row** (§3.4) | the acceptance readings: the matrix reports **`8 of 8`** executed in full-battery mode; **the previously clause-less rows print their clauses**; a refused run prints `REFUSED` with the missing rows named and exits non-zero; `surface.target` is present on every printed row; the state hygiene holds between blocks | anything app-layer — every `[U]` reading belongs to the row it names and to the disposition step |

**`C-1`. THIS UNIT'S OWN GATE IS (b).** Class (a) makes the contract runnable before the change and
regression-bearing after it; **it is not the unit's gate** (`RCA-1`: a red set that never turns into a real
reading is a self-verification). **The unit is not pre-DONE while class (b) is unrun** — and **if the battery
cannot be run, the DONE row carries `PRECONDITION-FAILED` with the reading attached, never a silent park**
(`docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§6` item `7` (v)).

### 6.2 Class (a) — the rows that FAIL AT THIS HEAD (predicted by read, NOT run by this pass)

Every "fails today" claim is a **`VERIFIED-BY-READ`** (`V-1`…`V-10`); **this pass did not run the rows**, so the
red tally is **predicted by read, not measured**.

| # | Row | Why it FAILS at this head |
| --- | --- | --- |
| **`R-1`** | **A verdict per declared row, or a refusal naming the missing rows** (§2.1 `E-1`/`E-2`/`E-3`). | **FAILS — `V-1`: six of the eight declared mappings name a block that never emits that row id** (only `U-1` and `U-7` are emitted anywhere in the driver), and **`V-3`/`M-2`: the coverage predicate reads the BLOCK dimension, the `missing` set is hardcoded `[]`, and the `blocksRun===0` branch substitutes the declared list.** |
| **`R-2`** | **`matrixRowsExecuted === MATRIX_ROWS.length` in full-battery mode, and the report refuses otherwise** (§2.1 `E-3`, `F-1`/`F-2`). | **FAILS — `M-1` is the reading** (`2` vs `8` with `OK` printed). |
| **`R-3`** | **Every counted row carries the `§6.1` set and prints its failing clause + `surface.target`** (§2.2 `E-7`/`E-8`). | **FAILS — `V-4`/`M-3`/`M-4`: the console line prints only `row:block=PASS\|FAIL\|PARKED` plus two flags, so the field set is never printed**, and the six named rows print no clause. |
| **`R-4`** | **No counted row returns a bare `{pass, detail}` without the six named fields** (§2.1 `E-4`, `F-11`). | **FAILS — `V-2`/`M-5`: `boot_landing` and `vis_persist` have no row path at all**, and appear in neither the matrix nor the extended table. |
| **`R-5`** | **Every verdict-carrying click is hit-tested, and an off-viewport coordinate is a driver failure** (§2.3 `H-3`, `F-4`). | **FAILS — `V-8`: `cdp.click` has no hit-test, no viewport check and no path record**, and `vis_persist` (the row `M-7` measured at `inVp:false`) drives its gesture through exactly that path. |
| **`R-6`** | **The driver's own mutable state is restored per block, and a frame-based row cannot read its own prior block's artifact** (§2.3 `H-1`, `F-5`). | **FAILS — `V-7`/`M-6`: `ufEnsurePaneExpanded` reports a minimized zone's absent frames as *"pane absent"*, and the restore lives in a hygiene block that runs once at its own position** (`V-6`). |
| **`R-7`** | **The `editingMode` vocabulary is swept** (§3.2 `F-12`, §9 `T-2`). | **FAILS — `V-9`: three occurrences read in the driver** (the `uf_settings_5` regex assertion, the `operatorSet({editingMode:…})` call, and `uf_restore_layout`'s DIAG string). |
| **`R-8`** | **The matrix table is unmoved and the census floor is met** (§2.1 `E-1`, §2.2 `E-10`). | **PASSES today and MUST keep passing** — `VERIFIED-BY-READ`: `8` entries, `U-1`..`U-8`, `20` `uf_*` row blocks. *(This is the **preservation** row: it fails a change that adds a slot or deletes a block to make arithmetic easier.)* |
| **`R-9`** | **A diagnostic block is never a row verdict; a proxy oracle never PASSes; `summary.pass`/`fail` never widen** (§2.3 `H-5`). | **PASSES today and MUST keep passing** — the pin's `R1`/`R3` rules. *(This is the row that fails a future block that cannot fail.)* |

**⟨THE RED TALLY IS NOT PREDICTED HERE.⟩** `R-1`…`R-7` are the **new-red** rows at this head; `R-8`/`R-9` are
**preservation** rows that **pass today**. **The TestWriter reports the executed tally and the red reasons**, and
**the row count is the TestWriter's, not this filing's.**

### 6.3 Class (b) — the readings the landing pass's real run must settle

**`C-2`.** Four readings, each recorded **verbatim with the invocation and the ports**:

1. **THE FULL BATTERY.** `node scripts/live-drive.mjs --port=<isolated> --cdp-port=<isolated>` on the seed route
   this unit does not change: **the matrix must report `8 of 8` executed**, and the reconciliation line must print
   **`OK`** — **or the run must print `REFUSED` naming the rows it lacks.** **Both outcomes are readings; a run
   that prints `OK` while `matrixRowsExecuted < 8` falsifies this unit.**
2. **THE CLAUSE PRINTING.** The six named rows (`vis_persist`, `boot_landing`, and the four `uf_*` comparison
   printers) **print their failing clause with observed and required values**, and **`surface.target` appears on
   every printed row** — the direct discharge of `M-3`/`M-4` (`docs/specs/ui-feature-set-breakdown-2026-09-29.md`
   `§9` `NR-1`'s remedy).
3. **A REFUSAL IS LOUD.** A scoped run (`--block=<a small set>`) **prints `REFUSED` naming the missing rows and
   exits non-zero**, and the `--block=boot_landing,import`-class configuration (`M-1`'s second measured case) **no
   longer reads `OK`**.
4. **THE HYGIENE HOLDS.** A run that includes `user2_pane_drag`/`user10_collapse_vertical_text` **does not leave
   `zone:left` minimized for the frame-based rows that follow**: the later rows' frame readings are taken from an
   expanded zone (or from the tab strip, as the contract permits) — **and the row `uf_panes_1`'s isolated
   (`--block=uf_panes_1`) and full-battery verdicts agree** (the `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` row's
   own falsifier).

**A run that is truncated or interrupted proves nothing and must never be reported as a result**
(`DECIDED: LIVE-GATE-RUN-DISCIPLINE`).

---

## 7. Verification — the pins, the trio, and the readings the DONE row must carry

**`X-1`. THE PIN THE UNIT MUST KEEP GREEN OR RE-STATE — NAMED, WITH WHO RE-STATES IT.**

| Pin | Rule (as it stands) | Disposition under this unit |
| --- | --- | --- |
| **`R5.b`** | `MATRIX_ROWS` enumerates exactly the eight `§5.U` rows `U-1`..`U-8`, no duplicated id | **KEPT GREEN** — this unit changes no id and adds no slot. **If the implementer moves the table's shape, the TestWriter re-states it (`⟨RE-STATED …⟩`, both values visible) — never relaxes it.** |
| **`R5.c`** | every `MATRIX_ROWS` entry names exactly ONE block, and that block exists in `BLOCKS` | **KEPT GREEN.** (The reconciler's `blocks`/`multiRowBlocks` member is informational and **is not** this rule.) |
| **`R2.e`** | every `uf_*` row block that clicks drives it through `ufRealClick`, with any native `.click()` `[DIAG]`-marked | **RE-STATED BY THE TESTWRITER** if the implementer adds an equivalent hit-tested route (§2.3 `H-3`: the clause is *"proves the target"*, and the pin names one route): **the re-statement must keep the teeth — the hit-test, the path record, and the `[DIAG]`-only-for-non-verdict rule** — and must print the superseded text beside the new one. |
| **the `§6.1` result-field schema** (`R4.1`…`R4.9`) | the eight fields, the row-id form, the `dclass` enum, non-empty `evidence`, the surface pair, a `pass` on every row block | **EXTENDED, NOT WEAKENED** — the printed-line members (§2.2 `E-7`) are added on top; **no field may be dropped**, and the surface-pair assertion stays. |
| **the duplicate-key rules** (`R6.a`/`R6.b`) | no duplicated `BLOCKS` key; no shadowed definition | **KEPT GREEN** (`VERIFIED-BY-READ`: the `shell_wiring` duplicate the pin names is gone at this head — one definition). |
| **the `uf_*` census floor** (`R4.0`) | `uf_*` row blocks ≥ `20`; `BLOCK_ENTRIES` ≥ `30`; the `ROW_BLOCKS` scope non-empty | **KEPT GREEN; re-stated only if the implementer's conversion changes the `uf_*` non-row set by name** (§2.2 `E-10`). |
| **`R5.d`** | the summary's `total` derives from `MATRIX_ROWS`, and `pass`/`fail`/`parked` are present | **EXTENDED** by the coverage field (§2.1 `E-3`), **not replaced**. |

**`X-2`. THE TRIO — RUN AND REPORTED, WITH THE SCOPE STATED (`RCA-12`).**

```
npm test           # the re-stated pin green; the whole suite green
npm run typecheck  # tsc --noEmit — exit 0
npm run build      # esbuild bundles — exit 0
```

**What the trio DOES and does NOT cover, stated so no green is over-read:** the trio compiles and tests the
**host/envelope** tree. **`scripts/live-drive.mjs` is not a build input and not a `src/` module** — so a green
trio proves the change broke nothing ELSE, **never that the driver reports correctly.** **The driver's own
verification is (i) the re-stated pin + the register, and (ii) the class (b) run.** **`npm run battery` is NOT
this unit's leg** (it is the e2e battery over built bundles, and the driver is not in it); the `[D]`-class leg the
program runs pre-live is `npm run divergence`, **whose RED/DRIVE state is another unit's** (§9 `T-3`
neighbourhood) and which **this unit neither runs nor claims.**

**`X-3`. THE DONE ROW'S RECORD SHAPE.** The landing pass reports, **on every line stating its
layer**: the red tally **measured before the implementation** and the green tally after it; **the class (b)
readings verbatim** (§6.3 `C-2` 1–4, with the invocation and the ports); the register's declared-vs-executed table
with `held`/`broken` per row and the counterexamples (≤ 5 per row); the trio's readings **with the scope caveat
above**; the adversarial pass's findings (`RCA-3`), recorded in this spec's `§3a`/`§3b`; the item-10d
documentation review (`RCA-6`), recorded in `archive/reviews/<date>-live-driver-verdict-integrity-doc-review.md`;
**the `E-4` disposition per row (converted vs excluded, with the reason)**; **the `T-2` sweep's site list**; and
**the OWED `sha256` + line count of this spec file after the amendment** (§10 item 10).

---

## 8. Decisions and defaults

**`D-1` — THE COVERAGE RULE IS RULED: a declared matrix row with no verdict REFUSES the report; `OK` is printed
ONLY when every declared row carried a verdict in a full-battery run; the refusal NAMES the rows** (§2.1 `E-1`/`E-3`).
**The refused alternatives, by name:** *a warning without a refusal* (the `OK` line is the artifact a reader
trusts); *a silent omission* (the defect being fixed); *an option-gated strictness flag* (**`M-1`: no flag
helps** — the correctness of a report is not an option); *counting the block dimension* (`V-3` — every block can
run while rows go unverdicted).

**`D-2` — THE EVIDENCE RULE IS RULED: a non-PASS row prints the predicate that failed with observed and required
values, and the printed per-row record carries the `§6.1` set including `surface.target`** (§2.2 `E-7`).
**The refused alternatives:** *"the returned object has the fields, so the report is complete"* (`V-4`/`V-5`:
nothing is printed, so nothing is readable); *a summary-level `layer` string as a substitute for the per-row
surface* (`M-4`).

**`D-3` — THE CLASSIFICATION RULE IS RULED: a counted row is a row block, or it is NAMED as a non-row and
EXCLUDED from the arithmetic with the reason recorded; the unmarked middle state is a finding** (§2.1 `E-4`).
**Default: CONVERTED** — `boot_landing` and `vis_persist` become row blocks, **which also gives the two
`S-12`-class symptoms a traceable row for the first time** (`M-5`).

**`D-4` — THE HYGIENE RULE IS RULED: state is restored per block; a click is hit-tested or it is `NOT-DRIVEN`; a
driver artifact may never be reported as an app FAIL** (§2.3 `H-1`/`H-3`/`H-4`). **Refused alternatives:** *"read
the frame and accept `frames=0`"* (`M-6`: a minimized zone replaces its stack by design — the driver's own
`uf_panes_8` says so); *"a `native-fallback` `.click()` is close enough"* (`H-3` clause 3); *"park it and move
on"* without naming the precondition (`RCA-11` clause (b)).

**`D-5` — THE CAP RULE IS RULED, restated from the architect: NO new `§5.U` slot, NO new block, no new flag
required to make a verdict readable** (§2.1 `E-5`, §1.3). **Any live assertion this unit needs is a RE-PIN of an
already-declared row's evidence text.**

**`D-6` — THE SCOPE OF THE SCENARIO SWEEP IS RULED: the `editingMode`→`representationMode` re-derivation belongs
to THIS unit** (§3.2 `F-12`, §9 `T-2`) — the tracker rows name the live-driver's owning unit, **which is this
unit** — **and the app-side defect `U-EDIT-1-LIVE-4` stays where it is filed.**

**`D-7` — THE DEFAULTS THIS UNIT DOES NOT MOVE:** the seeding route, the gate-widening over CDP, `--no-seed`,
`--strict-seed`, `--o0-corpus`, `--connect`, the `o0_*` measurement, the `gnosis_*` fixture expectations, the
divergence leg, `src/**`, and `MATRIX_ROWS`' assertions **except** the re-pins §2.1 names. **A reader must not
read this unit as the fixture route or as the app's repair.**

---

## 9. Owed items and escalations (each with an owner)

| # | Item | Owner | Why it is owed / escalated rather than decided here |
| --- | --- | --- | --- |
| **`T-1`** | **THE TRACKER ROWS this unit's landing owes:** **(i)** `docs/defects.md` — `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`, `LIVE-DRIVER-EVIDENCE-LOSS` and `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` carry **`OWNER: THE LIVE-DRIVER'S OWNING UNIT`** already, so their closure annotations name `U-LIVE-DRIVER-VERDICT-INTEGRITY` **at the landing, with the class (b) reading attached**; **(ii)** `docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§5.9`'s `GAP-7` row — an **anchored annotation** recording that it is **MINTED** as this unit (its own text says *"requires a CODE CHANGE … (A UNIT), NOT AN OPTION"*); **(iii)** `docs/next-steps.md` — one anchored DONE row at the landing; **(iv)** `docs/decisions.md` — **only if** the landing's readings mint a new standing rule (this filing believes they do not: `D-1`…`D-5` restate `DECIDED: LIVE-GATE-RUN-DISCIPLINE` + `D-GP-UFA-3`/`4` rather than adding to them). **Anchored appends/annotations only — never a whole-file write** (`RCA-8(c)`); **no existing row is rewritten.** | **THE SUPERVISOR** (a tracker act, not a spec's) | Rows outside a spec's pen; this filing supplies the text. |
| **`T-2`** | **THE SCENARIO-DRIFT SWEEP, carried by THIS unit** (`LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`, owner *"the live-driver's owning unit"*; `docs/pending.md` parks it as **a scenario re-derivation, not a code fix**). **The sweep must reach at least the three sites `V-9` reads** and must re-derive the scenario against the **landed** successor (`DECIDED: REPRESENTATION-MODE-SUCCESSOR`): the `representationMode` carrier, and the mode-change **broadcast + fresh re-derive** behaviour it pins. **Its revisit condition is the next live-driver pass — which is this unit's.** | **THE IMPLEMENTER of this unit** (with its TestWriter) | The row's owner is this unit; the sweep is cheap and is exactly the class where an un-swept sibling survives. **`docs/specs/user-flow-audit-coverage-2026-09-15.md` also records a `uf_restore_layout` step phrased against the removed token, so the drift is known to be more than one site.** |
| **`T-3`** | **THE FIXTURE ROUTE IS `GAP-8`'S AND IS NOT ABSORBED.** `GAP-8` / `PD-LIVE-FIXTURE-PRECONDITIONS` (`docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§5.9`) owns *"the driver's precondition handling does not cover its OWN fixture requirements"* — and `docs/defects.md` `LIVE-FIXTURE-PRECONDITION-GAPS` names **the harness/engine unit**. **This unit contracts only HOW a missing fixture is reported** (§3.2 `F-6`: refuse/park **by name**, `PRECONDITION-FAILED` with the fixture named) — **it does not seed a corpus, does not add an engine, and does not change the demo launch's enablement.** **The demo launch's empty doc list (`edit` default-OFF) is `GAP-8`'s reading, not this unit's.** | **THE `GAP-8` UNIT (not yet minted) — escalate to the ARCHITECT to mint it** | If this unit absorbed the fixture route it would be two deliverables in one cycle (`RCA-2`); the architect's order minted **this** unit first, and `GAP-8`'s row already states **`NONE` — the owner and the fix shape are already recorded.** |
| **`T-4`** | **THE APP-LAYER ROWS THIS UNIT'S READINGS WERE CONFUSED WITH STAY WITH THEIR OWNERS — this unit neither fixes nor disposes them.** Named so no reader over-reads this unit: **`LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`** (`[U]`, owner **UNASSIGNED** — the breakdown's candidates are `GAP-6`/`S-12` *"by way of PROPOSAL ONLY, never as a decision"*); the **panes class** (`uf_panes_10`/`uf_panes_14`/`uf_settings_4`) and **`uf_settings_7`** — now known to be **driver artifacts** (`M-6`), re-measurable **only after this unit lands**; **`PANE-VISIBILITY-IRREVERSIBLE`** (OPEN, user ruling attached); **`U-EDIT-1-LIVE-4`** (the app-side mode application). **The one thing this unit OWES them is a report whose rows can be read.** | **THEIR EXISTING OWNERS** (named per row; `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`'s ownership is an **escalation**, below) | This unit's whole point is that a driver artifact inflated the app-layer pile (`M-6`/`M-7`); fixing the instrument is the prerequisite, and **re-measurement after the landing is a later pass's reading, not this filing's claim.** |
| **`T-5`** | **THE CARRIED BASELINE RED.** `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1) carries a red set into Phase 1; **this unit carries it unchanged, fixes nothing in it, and its DONE row states it as carried.** **Any `src/**` pin or `PROTECTED`-set file is untouched by this unit** (its allowed surface contains no `src/` path), so no pin re-derivation is owed for a frozen artifact. | **THE UNIT'S LANDING PASS** (to state it) and the carrier's own owner | A carried red is carried; a driver unit may not quietly absorb an app red. |
| **`E-1`** | **THE ONE OPEN ARCHITECT RULING THIS FILING LEAVES — THE `E-4` DISPOSITION DEFAULT.** The filing **rules CONVERTED as the default** for `boot_landing` and `vis_persist`, and **permits EXPLICIT EXCLUSION with a recorded reason** as the alternative. **The reason this is surfaced rather than decided silently: conversion gives two previously untraceable rows (`M-5`) a real row id and a place in the arithmetic, but it also means the driver INVENTs two checklist row ids** (a vocabulary act, in a program whose row ids are otherwise traceable to an enumeration). **The ruling needed is one line:** *may the driver mint checklist row ids for rows that currently have none, or must they be excluded by name until an enumeration owns them?* | **ARCHITECT** | Row-id vocabulary is a program-level question, and `D-GP-UFA-1` ties the `UF-<SURFACE>-<n>` form to a checklist enumeration. **If the answer is *"exclude by name"*, `D-3`'s default flips to option (2) and `F-11` stays the unit's finding.** |
| **`E-2`** | **`LANDING-NOT-RECONCILED-ON-FIRST-IMPORT`'s OWNERSHIP** — a `[U]`/`HIGH` app defect whose row records **no owner** (the breakdown's `GAP-6`/`S-12` are candidates *"by way of PROPOSAL ONLY"*). **This unit makes it READABLE and TRACEABLE (`D-3`s conversion gives its symptom a row) and does nothing more.** | **ARCHITECT** (assign a unit) | An unowned HIGH row is the tracker's own finding, and no driver unit may absorb an app row to close it. |
| **`E-3`** | **THE `LIVE-DRIVER-EVIDENCE-LOSS` / `LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT` ROWS: this unit ABSORBS the first and the second's sweep, and leaves neither ownerless.** `LIVE-DRIVER-EVIDENCE-LOSS`'s report-shape half and its empty-evidence half are **§2.2's whole subject**; the scenario-drift half is `T-2`. **`LIVE-DRIVER-EVIDENCE-LOSS` is therefore carried by this unit; `LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`'s app-side residual (`U-EDIT-1-LIVE-4`) is NOT** (`T-4`). | **THE IMPLEMENTER of this unit** (recorded here so the rows are not re-filed) | Two rows were filed with **this** unit as owner; a filing that left them ambiguous would repeat the drift `RCA-6` exists to catch. |
| **`E-4`** | **NO FOUNDATION HANDOFF.** `GAP-7` is **fork-side instrument work**: it touches `scripts/live-drive.mjs` only, cites no foundation mechanism, and discovers **no** `provident-ssr` defect. **Read this pass: NO handoff row is owed** (`AGENTS.md` item 7). | **Nobody** (recorded so a reader does not look for a handoff that does not exist) | `AGENTS.md` item 7 makes a package finding a handoff: **the honest reading is *"no row owed"*, and an empty search is a finding too.** |

---

## 10. The report the landing pass must make

**`C-3`.** **THE DONE ROW IS NOT WRITTEN UNTIL CLASS (b) RAN.** It carries, in this order:

1. **The red tally, measured and reported BEFORE the implementation**, with the reasons, and the green tally after
   it (`RCA-1`). **A DONE row that claims green without a recorded red run is a review finding.**
2. **The class (b) readings verbatim** — the invocation with **its isolated ports**, the full-battery matrix
   reading (**`8 of 8`** or a **`REFUSED`** list), the clause-printing reading for the six named rows, the
   `surface.target` presence reading, the loud-refusal reading (`--block=` scoped, non-zero exit), and the hygiene
   reading (`uf_panes_1` isolated vs full-battery agreement).
3. **The register's declared-vs-executed table**, `held`/`broken` per row, counterexamples ≤ 5 per row, and **the
   arm-by-arm statement of which terms are node-side and which are class (b)** (§4.3 item 2).
4. **The trio's readings, with the scope caveat** (§7 `X-2`).
5. **The adversarial pass's findings** (`RCA-3`), recorded in this spec's `§3a`/`§3b`.
6. **The item-10d documentation review** (`RCA-6`), reconciling this spec's names/shapes/counts against the landed
   driver, recorded in `archive/reviews/<date>-live-driver-verdict-integrity-doc-review.md`.
7. **The `E-4` disposition per row** (converted / excluded, with the reason) and **the `T-2` sweep's site list.**
8. **The `T-1` tracker rows' disposition** (written / owed).
9. **Every statement's LAYER** — and **the two claims this unit may NEVER make: *"the app works"* and *"the
   battery is app-green."*** A green here proves the driver's reporting integrity, **nothing else.**
10. **The OWED `sha256` and line count of this spec file** — **this pass holds no shell and produces neither; a
    shell-bearing pass takes them and states the instrument.**

---

## 11. Cross-references

### 11.1 The documents this unit serves and takes from (`VERIFIED-BY-READ` by this filing unless stated)

- `docs/specs/ui-feature-set-breakdown-2026-09-29.md` — `§3.0` (the operator-corrections ledger and the
  composition corrections this unit's `M-6`/`M-7` come from), `§3.3` (the matrix verdict and the
  evidence-quality findings), `§5.9` (`GAP-7`'s row and `GAP-8`'s), `§6` (the live-driven loop, items `3`/`4`/`5`),
  `§7` item `3` (the sequencing ruling), `§9` (`NR-1`'s remedy, which is this unit), `§11` (the file's own limits).
- `docs/defects.md` — `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE` (this unit's primary row), `LIVE-DRIVER-EVIDENCE-LOSS`,
  `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`, `LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`,
  `LIVE-FIXTURE-PRECONDITION-GAPS` (`GAP-8`'s), `LANDING-NOT-RECONCILED-ON-FIRST-IMPORT` (app-side, unowned),
  `LIVE-APP-PANE-CENSUS-RENDER-MISMATCH` (the pile whose composition `M-6`/`M-7` correct).
- `docs/specs/user-flow-audit.md` — `§2` (`§5.U`, the capped 8-row delta matrix), `§3` (`§6.1`'s report schema and
  field rules, including the `matrixRowsExecuted` sentence and the *"`pass`/`fail`/`parked` partition the executed
  rows"* rule), `§4` (`§6.2`, the read-only acceptance audit whose verdict may be `reject`), `§5`/`§6`.
- `docs/specs/user-flow-audit-checklist.md` — the `UF-<SURFACE>-<n>` census the driver's checklist ids come from.
- `docs/decisions.md` — `DECIDED: LIVE-GATE-RUN-DISCIPLINE` (isolated ports, boot-and-connect, **a matrix report
  with no verdict per declared row is INVALID**, the `[U]`/`[T]` split), `DECIDED: D-GP-UFA-1` (the matrix and its
  census), `DECIDED: D-GP-UFA-2` (no proxy PASS), **`DECIDED: D-GP-UFA-3`** (`realInput`/`evidence` are MANDATORY
  report fields), **`DECIDED: D-GP-UFA-4`** (the report shape + row-set reconciliation), `DECIDED: REPRESENTATION-MODE-SUCCESSOR`
  (`T-2`'s landed successor), `DECIDED: HARNESS-ENABLEMENT-AND-BOOT-READINESS` clause (v) (**pins are RE-STATED,
  never relaxed** — the re-statement discipline §1.2 names), `DECIDED: REBUILD-ARCHIVE-POLICY`,
  `DECIDED: TOOL-REGISTRATION-TRANSPORT-EQUIVALENT` (cited because the report's profile-dependence is why a
  reading must state **which launch profile** produced it).
- `scripts/live-drive.mjs` — the mapping (`MATRIX_ROWS`, `reconcileMatrixRows`, the summary/refusal path), the
  row-result builders (`rowResult`, `parkRow`, `diagResult`), the gesture helpers (`ufRealClick`, `ufHitProbe`,
  `cdp.click`, `cdp.gesture`), the hygiene helpers (`ufEnsureAppClear`, `ufEnsurePaneExpanded`, `uf_restore_layout`,
  `uf_scroll_reset`), the seat helpers (`seedCorpus`, `o0MarkdownTree`, `cdp.enableGroups`), and the blocks this
  unit contracts.
- `tests/live-drive-contract.test.ts` — the structural pin this unit keeps green or re-states.
- `docs/pending.md` — the parked scenario-drift row (`T-2`'s revisit condition is this unit).
- `docs/next-steps.md` — the pickup item that minted this unit.
- `AGENTS.md` — items 3/4 (TDD, the trio), 9/10 (delegation, blind-greens, the item-10d doc review), `RCA-1`,
  `RCA-2`, `RCA-3`, `RCA-6`, `RCA-11`, `RCA-12` (the layer rules this file states per claim).

### 11.2 The source surfaces this filing READ (each read stated as such; reader: the SpecDoc)

`scripts/live-drive.mjs` — `MATRIX_ROWS`, `reconcileMatrixRows` and its call site, the `§6.1` summary block and
the reconciliation/reporting lines, `rowResult`/`parkRow`/`diagResult`, `ufRealClick`/`ufHitProbe`/`cdp.click`/
`cdp.gesture`/`cdp.enableGroups`, `ufSurfaceTarget`, `ufEnsureAppClear`/`ufEnsurePaneExpanded`, the hygiene blocks,
`uf_panes_12`/`uf_tabs_7`/`uf_tabs_3`/`uf_panes_8`/`uf_hist_6`/`uf_layout_10`/`uf_settings_5`/`boot_landing`/
`vis_persist`/`user2_pane_drag`, and the seeding/launch section; `tests/live-drive-contract.test.ts` (whole file);
`package.json` (the `scripts` block); `vitest.config.ts` (`include`, `testTimeout`); `docs/specs/user-flow-audit.md`
`§2`/`§3`/`§4`; `docs/specs/ui-feature-set-breakdown-2026-09-29.md` `§3.0`/`§3.3`/`§4`/`§5.9`/`§6`/`§7`/`§9`;
`docs/defects.md` (the rows of `T-1`/`T-3`/`T-4`/`E-3` and their annotations); `docs/decisions.md` (the rows of
`§11.1`); `docs/pending.md` (the scenario-drift row).

### 11.3 Section-number and id discipline

**`§`-numbers cited inside `docs/specs/user-flow-audit.md` (`§2`, `§3`, `§4`) are THAT file's sections; the
`§0`…`§11` numbers of THIS file are its own, and a reader must not conflate them.** **`M-`/`V-`/`E-`/`H-`/`F-`/
`R-`/`P-`/`C-`/`D-`/`T-`/`E-`-prefixed ids are LOCAL to this file** except where a cell names the row it is read
from (e.g. `R1`…`R6`, `R4.0`, `R5.b`, `R5.c`, `R5.d`, `R2.e`, `R6.a`, `R6.b` are the **pin's** rule ids, quoted
as such). **Two prefixes are deliberately reused with disjoint namespaces, and a reader must not conflate them:**
**`E-1`…`E-10` are §2's CONTRACT clauses** (`E-1`…`E-5` the matrix contract, `E-6`…`E-10` the evidence contract),
**while `E-1`…`E-4` in §9 are ESCALATIONS** — §9 is the only place an `E-` id is an escalation, and every §2
citation reads *"§2.1 `E-n`"* or *"§2.2 `E-n`"*. **`V-1`…`V-10` are the §0.2 READS; §7's items are `X-1`…`X-3`**
(renamed so the two sets cannot be confused). **No line number appears anywhere in this file.**
