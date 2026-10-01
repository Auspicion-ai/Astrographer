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
6. **⟨ADDED `2026-09-29` BY THE AMENDMENT (§12) — the two clauses the architect's `E-1` ruling makes necessary, and
   they are deliverables of THIS unit, not of a later one: (a) `SHARED-ROW AGGREGATION` — a row id carried by more
   than one block prints each contributor's own verdict AND the row's aggregated verdict, the aggregate being the
   AND of the halves (§2.2 `E-11`); and (b) `EXTENDED DECLARED/EXECUTED RECONCILIATION` — a DECLARED extended row
   whose requested blocks produced no verdict is REFUSED BY NAME, loudly, non-zero exit (§2.2 `E-12`). The
   amendment also fixes the two converted rows' id source to the CLOSED checklist enumeration (`boot_landing` →
   `UF-STAGE-1`, `vis_persist` → the persistence half of `UF-SETTINGS-7`) — **the driver never mints a row id**.⟩**

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

**⟨AMENDED `2026-09-29` — THE ARCHITECT'S RULING ON ESCALATION `E-1`, ANNOTATE-BESIDE (`RCA-8(c)`): THE FILED `E-4`
TEXT IMMEDIATELY ABOVE IS KEPT VERBATIM AS ITS PASS'S READING AND NOTHING IN IT IS REWRITTEN; THIS BLOCK IS THE
CURRENT READING AND IT GOVERNS. The standing decision this ruling lands as is `DECIDED:
LIVE-DRIVER-ROW-ID-SOURCE-AND-SHARED-ROW-AGGREGATION` (`docs/decisions.md`, dated `2026-09-29`), whose text and this
block must be read together; the amendment's own site/section inventory is §12 (the amendment block at this file's
foot), and the amendment's new contract clauses are §2.2 `E-11`/`E-12`.⟩**

1. **THE DISPOSITION IS CONVERTED, AND THE CONVERSION IS THE ONE THE FILED TEXT NAMES AS ITS OWN DEFAULT — WHAT
   CHANGES IS ONLY THE ID SOURCE.** `boot_landing` and `vis_persist` each become a row block carrying the `§6.1`
   set, its assertion, its `dclass`, its `realInput`, its `evidence`, its `proxyPASS` and its `surface`; **and** its
   failing clause per §2.2; **and** its place in the extended table's arithmetic — exactly the filed option (1).
2. **THE MINTED-ID FORM IS WITHDRAWN AS THE DEFAULT AND IS NOW THE REFUSED ALTERNATIVE, BY NAME.** The form the
   filing's parenthetical wrote — the **`UF-LANDING-*` / `UF-VIS-*` class id** — is **WITHDRAWN**. **The refused
   alternative's reason, recorded because a reader will reach for it:** *a minted id is outside the closed
   enumeration* (`D-GP-UFA-1` ties the `UF-<SURFACE>-<n>` form to `docs/specs/user-flow-audit-checklist.md` §1–§14,
   and the checklist is the enumeration of record), *and a later checklist surface could mint the same form* — i.e.
   a minted id is not merely untraceable today, it can be **collided with** by a later census row, which would turn
   a driver-invented id into a silent alias for a row it never meant.
3. **`THE DRIVER MUST NEVER MINT A ROW ID` — THE GENERAL RULE, not only for these two.** A row verdict's id comes
   from the **existing** closed enumeration or from the capped `§5.U` matrix; a driver that needs an id no
   enumeration carries has **one** admissible disposition, option (2) below. (§2.1 `E-1`'s *"no row id may be
   invented"* clause is thereby **strengthened, not replaced**: it already made an unknown **`U-<n>`** a row-set
   ERROR, and this ruling extends the same rule to the checklist form.)
4. **OPTION (2) `EXPLICITLY EXCLUDED, BY NAME, WITH THE REASON ON THE RECORD` SURVIVES — BUT ITS SCOPE MOVES.**
   It stays available **as the fallback for a counted row that has NO enumerated id**, and **it is no longer the
   choice for these two** (both have an enumerated id; see item 5). **The silent middle state stays exactly the
   defect the filed text says it is**, and `F-11` stays the finding for it.
5. **THE TWO MAPPINGS, EACH READ (never inferred), with its premise checked at this head.** `boot_landing` →
   **`UF-STAGE-1`**; `vis_persist` → **the PERSISTENCE half of `UF-SETTINGS-7`**. The premises the ruling rests on
   were put to the tree by this amendment's own reads and **each held** — the reads are enumerated in §12.2, the
   two mappings are contracted in §12.1, and the shared-row consequence of the second one is the new clause
   §2.2 `E-11`.
6. **WHAT THE CONVERSION'S ARITHMETIC IS, AND WHAT IT IS NOT** (§2.1 `E-5`, §8 `D-5`, kept): **`MATRIX_ROWS` stays
   `8`, its ids stay `U-1`..`U-8`, `summary.total` stays `8`, and no new `§5.U` slot, no new block, no new flag and
   no second surface object is added.** **The two converted rows live in the EXTENDED dimension only**; the
   report-shape and arithmetic consequences are stated exactly in §12.3, and **`summary.pass`/`summary.fail`
   continue to partition ONLY the executed `§5.U` rows and must never be read as app health.**

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

**`E-11`. SHARED-ROW AGGREGATION — ONE ROW ID IS ONE ROW VERDICT, AND ITS VERDICT IS THE AND OF ITS HALVES.**
**⟨ADDED `2026-09-29` BY THE AMENDMENT (§12) — the clause the architect's `E-1` ruling makes necessary, because the
`vis_persist` → `UF-SETTINGS-7` mapping (§2.1 `E-4` item 5; the mapping is contracted at §12.1) makes a single
enumerated row id carried by TWO blocks
(`vis_persist` and `uf_settings_7`) the unit's own case rather than a hypothetical.⟩** **A declared/extended row id
MAY be carried by more than one block; a row id that merely repeats another block's verdict is not a second
verdict.** Clauses, all of them contracted:

1. **THE REPORT PRINTS EACH CONTRIBUTING BLOCK'S OWN VERDICT.** Every block that returns a result carrying a row
   id is reported with its own `row`/`block`/`verdict` line (§2.2 `E-7`'s printed members), so the contributions
   are individually readable. **An aggregated row may never be the only place a block's verdict appears.**
2. **THE REPORT PRINTED THE ROW'S AGGREGATED VERDICT BESIDE THEM — as the AND of the contributing halves.** For a
   row id carried by blocks `b1…bn`, the row's verdict is **`PASS` iff every contributing verdict is `PASS`**;
   **a single `FAIL` contributor makes the ROW read `FAIL`**; a `NOT-DRIVEN` or `PARKED` contributor is **never
   promoted** to a PASS and is named as such (a PARKED half is not an app FAIL — §2.3 `H-4`).
3. **A DISAGREEING PAIR PRINTS BOTH AND THE ROW READS `FAIL` — NEVER AVERAGED, NEVER SILENTLY MERGED, NEVER
   LAST-WINS.** **The refused alternatives, by name:** *an average / majority* (a verdict set is not a score);
   *last-writer-wins* (block order is not evidence of truth); *first-writer-wins*; *"the row PASSed because at least
   one half PASSed"*; *printing only the aggregate* (which is the silent merge this clause kills).
4. **AN ID THAT MERELY REPEATS ANOTHER BLOCK'S VERDICT IS NOT A SECOND VERDICT.** A block whose result carries an
   id **another contributing block already claimed, with no evidence of its own**, adds **no** verdict: it is
   reported (it ran, and its own reading is part of the artifact) but **it does not flip the aggregate and it may
   not be counted as independent coverage**. **Distinguishing the two cases is the aggregate: two blocks that CLAIM
   the row must agree on it; one block that merely repeats the id claims nothing.**
5. **`E-2`'s REVERSE DIRECTION IS CONTRACTED HERE — IT IS UNREPORTED ANYWHERE TODAY.** `E-2` tolerates and reports
   **one block claiming several rows** (`multiRowBlocks`, informational in the reconciler); **the reverse direction
   — one row claimed by several blocks — has NO report member today** (the reconciler receives `executed` rows, and
   nothing folds them by id). **This clause contracts it explicitly**, so a TestWriter has a stated obligation
   rather than an inference.

**`E-12`. EXTENDED DECLARED/EXECUTED RECONCILIATION — A DECLARED EXTENDED ROW WITH NO VERDICT IS REFUSED BY
NAME.** **⟨ADDED `2026-09-29` BY THE AMENDMENT (§12), for the rows THIS unit declares.⟩** **The mechanism
`E-1`/`E-3` close on the matrix dimension does not exist on the extended dimension at all**, and the two converted
rows would re-create the very defect this unit fixes (`V-1`: *a declaration that is not honoured*) if they were
declared without it. Clauses:

1. **THE GAP, STATED EXACTLY, AS A READ.** `ROW_EXTENDED` is a declared table, but **the run's `extendedRowsRun`
   counts every emitted row id that is not `U-<n>`** — it is **not** a declared-vs-verdict coverage count, and
   nothing in the driver reconciles the declared extended set against the emitted one. **The last recorded full
   battery printed `extendedRowsRun: 54` against a declared `30`**, and the printed line reads *"N of 30 defined"*
   (**the conversion moves that declared figure to `32`** — item 5; the read above is the FILED state and is kept
   as its pass's reading)
   — i.e. **emitted > declared, and the table therefore carries no coverage authority**. (Reads: §12.3.)
2. **A DECLARED EXTENDED ROW WHOSE BLOCKS WERE REQUESTED AND PRODUCED NO VERDICT IS REFUSED BY NAME** — loudly:
   a per-row line naming **the row id and the block(s) that produced nothing**, a reconciliation line reading
   **`REFUSED`** (not `OK`) with them named, and **`process.exitCode` non-zero** (`1` — `2` stays the driver's
   hard-error code, §2.1 `E-3` clause 2). **The `--block=` option space is what makes "requested" well-defined**:
   a declared row is in scope iff at least one of its declared blocks was requested; a `--block=all` (full-battery)
   run puts **every** declared extended row in scope. **An out-of-scope declared row is NOT a refusal** (it is
   inconclusive, exactly as a scoped run's un-executed matrix row is — §2.1 `E-3` clause 2's `P-SM-1` (iii)).
3. **THE TWO CONVERTED ROWS ARE DECLARED, AND SO THEY ARE IN THIS RECONCILIATION — by name, in the extended
   table.** `UF-STAGE-1` (`boot_landing`) and `UF-SETTINGS-7` (the `vis_persist` + `uf_settings_7` pair) are
   enumerated in the extended declared structure with their blocks, and each is reconciled under item 2.
4. **NO SUBSTITUTION ON THIS DIMENSION EITHER.** The refusal derives its missing set as **the declared-but-
   unverdicted set difference** — **never a hardcoded empty list, and never a substitution of the declared id list
   for the emitted set** (`E-3`'s two named defects, re-stated as a prohibition on the extended path).
5. **THE REST OF `ROW_EXTENDED` KEEPS ITS PRESENT STANDING — THIS CLAUSE DOES NOT WIDEN.** **The target state's
   declaration is exact:** `ROW_EXTENDED` moves **`30` → `32` entries**, of which **exactly two carry this unit's
   declared ids with their blocks** (`UF-STAGE-1` with `boot_landing`; `UF-SETTINGS-7` with `vis_persist` — whose
   sibling emission by `uf_settings_7` is the OTHER half of that same enumerated row, §2.2 `E-11`), and the
   **remaining `30`** entries are **the filed `30`**, unmoved. **Every declared row outside this unit's two keeps
   its present, explicitly non-authoritative standing**: a declared row outside this unit's
   two is **reported** (its emitted verdict, and — when it produced none in scope — a named, loud
   `EXTENDED-DECLARED-NO-VERDICT` line) but **does not by itself refuse the run**. **Reason, recorded so a reader
   does not read this clause as the whole-table reconciliation it is not:** the last recorded full battery emitted
   `54` extended rows against `30` declared, and the declared rows that emitted nothing would otherwise **flip the
   unit's own acceptance reading (§6.3 `C-2` item 1) from `OK` to `REFUSED` on a table this unit does not own** —
   i.e. the unit would be read as having broken the battery it exists to make readable. **Making the whole
   extended table authoritative is a later unit's act, named here as owed rather than absorbed** (§12.7 item 2).

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
8. **⟨ADDED `2026-09-29` BY THE AMENDMENT (§12) — the two steps the conversion adds to this order, stated so the
   happy path is complete under the ruling: (i) after step 4, the report AGGREGATES the emitted rows BY ROW ID —
   every contributor's own verdict prints and the row's verdict prints beside them, as the AND of the halves
   (§2.2 `E-11`); and (ii) after step 6, the EXTENDED reconciliation runs — every DECLARED extended row whose
   requested blocks produced no verdict is REFUSED BY NAME on its own line, loudly, with a non-zero exit (§2.2
   `E-12`). Neither step adds a block, a flag, a `§5.U` slot or a second surface object, and neither moves
   `MATRIX_ROWS` or `summary.total` (§8 `D-5`, §12.3).⟩**

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

**⟨ADDED `2026-09-29` BY THE AMENDMENT (§12) — the enumeration this table carries is EXTENDED, not renumbered:
`F-1`…`F-12` above are unmoved in order and in substance, and the amendment's three fail-states are printed at
§12.4 as `F-13` (a DECLARED extended row with no verdict — the extended counterpart of `F-1`), `F-14` (a row id
carried by two blocks that disagree) and `F-15` (an emitted row id no declared extended structure carries). A
TestWriter enumerating this section's fail-states must read §12.4 as part of the set.**⟩**

**⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13) — the enumeration is EXTENDED ONCE MORE, not renumbered:
`F-1`…`F-15` above are unmoved in order and in substance, and the second amendment's two fail-states are printed at
`§13.6` as `F-16` (an unrestored PERSISTED state that changes a later row's verdict — the `H-1` clause-4 counterpart
of `F-5`) and `F-17` (a register row whose declared budget is not fully accounted — the shortfall OR the silent
drop). A TestWriter enumerating this section's fail-states must read §13.6 as part of the set.**⟩**

### 3.3 The numeric/census claims in this file, each with its source

| Claim | Source |
| --- | --- |
| `MATRIX_ROWS` has exactly **`8`** entries, `U-1`..`U-8` | **`VERIFIED-BY-READ`** (this filing; cross-read of the breakdown's `VERIFIED-BY-READ` citation of the same table) |
| **`2 of 8`** rows executed; `"matrixRowsExecuted":2` vs `"total":8` | **`RECORDED READING; measurer: the live-scenario runner`** |
| **`100` blocks / `39` FAIL / `3` PARKED**; PASS 31 / FAIL 39 / PARK 3 / DIAG 27 | **`RECORDED READING; measurer: the live-scenario runner`** |
| the **`uf_*` row-block floor is `20`** | **`VERIFIED-BY-READ`** of the pin's `R4.0` |
| `uf_*` `BLOCKS` keys present: **`26`** total, of which **`6`** are declared non-row (the pin's `UF_NON_ROW_BLOCKS`) ⇒ **`20`** row blocks | **`VERIFIED-BY-READ`** by this filing (reader: the SpecDoc) **⟨RE-CONFIRMED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW — `VERIFIED-BY-READ` by the gate-8 pass: the driver's `BLOCKS` carries exactly `26` `uf_*` keys, read by name (`uf_tabs_*` `5` · `uf_settings_*` `6` · `uf_panes_*` `6` · `uf_search_*` `1` · `uf_hist_*` `2` · `uf_layout_*` `2` · `uf_restore_layout` · `uf_scroll_reset` · `uf_mount_diag` · `uf_mount_leak_diag`), and the pin's `UF_NON_ROW_BLOCKS` lists the `6` non-row keys (`uf_restore_layout`, `uf_scroll_reset`, `uf_mount_diag`, `uf_mount_leak_diag`, `uf_tabs_7_diag`, `uf_panes_12_diag`) — so `26 − 6 = 20` row blocks and the `R4.0` floor of `20` holds exactly at the floor. The two CONVERTED counted rows (`boot_landing`, `vis_persist`) are NOT `uf_*` and are in neither tally.⟩** |
| **six** named rows print no failing clause; **two** counted rows are not row blocks | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| **`720` px viewport**, click at **`y = 1473.8`**, hit-tested control case at **`y = 360`** | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| clean state **`.pane-frame` = `2`**, `[data-pane-id]` = **`2`** | **`RECORDED READING; measurer: the live-measurement pass, `2026-09-29`** |
| the register's arithmetic (§4) | this filing's own declaration |
| **exit codes** (`1` refusal / `2` hard error) | **`VERIFIED-BY-READ`** of the driver's own `process.exitCode`/`process.exit` paths |
| **`ROW_EXTENDED` declares `30` entries**; the run's `extendedVerdict` counts every emitted non-`U-<n>` row id, and `extendedRowsRun` reads **`54`** against that declared `30` | **`VERIFIED-BY-READ`** by the amendment (reader: the SpecDoc — the table's entries and the emitted-row filter); the **`54`** value is a **`RECORDED READING; measurer: the live-scenario runner`** |
| **`UF-STAGE-1` is emitted by NO block**; **`UF-SETTINGS-7` IS emitted** (by `uf_settings_7`) | **`VERIFIED-BY-READ`** by the amendment (reader: the SpecDoc — the amendment's reads `V-11`/`V-12`, §12.2) |
| the declared extended count moves **`30` → `32`** (the filed `30` plus the two converted blocks' entries), so the printed line reads *"N of 32 defined"* | **derived by this amendment** (the target state §2.2 `E-12` item 5 states); **NOT a reading** — the next full battery settles it |
| a full battery's **`extendedRowsRun` moves `54` → `56`** after the two conversions | **derived by this amendment** (one report row per converted block, no other contribution changed — §12.3 item 3); **NOT a reading** — the next full battery settles it || the register's arithmetic (§4) | this filing's own declaration |
| **the amendment's register arithmetic (`7` rows): `6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`** | **this amendment's own declaration** (§4.2's amended table, §12.5) |
| ⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13)⟩ **`ROW_EXTENDED` declares `32` entries** after the conversion (the filed `30` + the two unit-declared rows), so the printed line reads *"N of 32 defined"* | **`VERIFIED-BY-READ`** by this amendment (reader: the SpecDoc — the `ROW_EXTENDED` literal, `§13.1` read `Y-1`) |
| ⟨ADDED `2026-09-29` (§13)⟩ the full battery's **`extendedRowsRun` reads `53`** — **the superseded prediction of `56` is KEPT VISIBLE BESIDE IT**, and the reading and its composition (`53 = 29 verdicted declared rows − 3 inconclusive + 22 emitted-undeclared ids`) are `§13.2`'s | **`RECORDED READING; measurer: the implementer's landing pass, `2026-09-29` battery run`** (§13.1 `L-3`/`L-4`); **NOT a reading of this pass** |
| ⟨ADDED `2026-09-29` (§13)⟩ the register's **per-row `executed` + named class-(b) NOT-RUN split** of the `97` (`13 + 1` · `12 + 4` · `14 + 3` · `13 + 3` · `12 + 2` · `11 + 3` · `11 + 3`) | **`RECORDED READING; measurer: the implementer's landing pass`** (§13.3), **with the `6`/`14`/`16`/`17`/`16`/`14`/`14` declared totals `VERIFIED-BY-READ` by the SpecDoc** |

**⟨AMENDED `2026-09-29` (§12): the rows above are ADDED to this table, not substituted for any filed row; every
filed claim keeps its own source and its own value, and the two figures whose value MOVES with the amendment
(`extendedRowsRun` `54` → `56`, and the register arithmetic `83` → `97`) are printed with BOTH values and their
sources. No figure in this table is a re-derivation of another.**⟩**

**⟨AMENDED AGAIN `2026-09-29` BY THE SECOND AMENDMENT (§13), ANNOTATE-BESIDE (`RCA-8(c)`): the paragraph immediately
above is KEPT VERBATIM as the FIRST amendment's reading, and it is NOT rewritten. The `56` it prints is a DERIVED
PREDICTION and THE PREDICTION WAS FALSIFIED BY THE LANDING PASS'S REAL RUN — the measured figure is `53`, recorded
BESIDE the superseded `56` in this table and stated with its composition at `§13.2`; the register figure `97` is
UNAFFECTED and stands. Every figure in this table is still labelled, and no value is smoothed; **and the two rows the
second amendment ADDS to this table are labelled exactly as the filed rows are, so a reader can tell a read from a
derived figure at every line.**⟩**

**⟨ADDED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, THE REGISTER ARITHMETIC DRIFT, ANNOTATE-BESIDE
(`RCA-8(c)`): EVERY PARAGRAPH ABOVE IS KEPT VERBATIM.** **THIS TABLE'S REGISTER-ARITHMETIC ROW IS FILED AT `97`
(`6 + 14 + 16 + 17 + 16 + 14 + 14`, split `81 + 16`) AND THE LANDED READING IS `101` (`6 + 14 + 16 + 17 + 19 + 15 +
14`, split `85 executed node-side + 16 named class-(b) NOT-RUN`) — the `19` is `P-TP-1`'s and the `15` is `P-TP-2`'s,
and WHY each moved and WHO moved it are stated at `§14.2`/`§14.3`.** **`RECORDED READING; measurer: the TestWriter`,
taken off the landed pin `tests/live-drive-contract.test.ts` (`5167` lines, `md5 34c12434aa6818fa77855d7859bf48fd`),
whose `TALLY` line prints the arithmetic and whose split strings are `§14.1`'s.** **The `97` above is neither deleted
nor corrected in place: it is this table's FILED reading, and `101` is the reading of record (`§4.2`, `§12.5`,
`§13.3` carry the same annotation).**

### 3.4 What the red set must NOT do

It must not import the driver (§0.2 `V-10`), must not run Electron, must not add a `BLOCKS` key, must not change
`MATRIX_ROWS`' length or ids, must not relax a pin to make a row pass, and must not assert app behaviour.
**⟨ADDED `2026-09-29` (§12): and it must not, under the amendment's clauses, substitute the declared list for the
emitted set on EITHER dimension, relax the shared-row aggregate into an average/majority/last-wins, or make an
undeclared emitted id (§2.2 `E-12` item 5, `F-15`) refuse a run.**⟩**

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

**⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13) — THE DECLARED-BUDGET SEMANTICS, ANNOTATE-BESIDE (`RCA-8(c)`):
NOTHING ABOVE IS REWRITTEN AND NOTHING IS DELETED; THIS IS THE CURRENT READING AND IT GOVERNS THE REGISTER'S
ARITHMETIC.** **The TestWriter filed the relation between a row's DECLARED attempt budget and its class-(b) arms as
an AMBIGUITY, and the landing pass's remaining red rows are ALL register rows (§13.3), so it is ruled here.**

1. **WHAT A REGISTER ROW'S DECLARED TOTAL *IS*: the arithmetic identity, stated once.** *"THE DECLARED TOTAL = its
   EXECUTED node-side attempts **+** its EXPLICITLY-NAMED class-(b) NOT-RUN arms"* — **exactly**. **`held` REQUIRES
   `executed + namedUnrun === declared`** (the equality, not an inequality, and not a coverage claim); **any
   UNNAMED shortfall is `broken`, never a smaller denominator** (§13.3 `F-17`).
2. **WHY EVERY NOT-RUN CLASS-(b) ARM MUST BE NAMED, WITH ITS REASON, at the row's own budget:** the register's
   structural arms cannot drive the assembled app — **the driver cannot be IMPORTED** (`§0.2` `V-10`: importing it
   would run `main(process.argv.slice(2))` at module scope and spawn/attach Electron) — **and no node row may drive
   Electron** (`§3.4`). **These two reasons are the ONLY admissible class-(b) reasons on this register.** **A class-(b)
   arm reported NOT-RUN without one of them named is a `broken` row, not an arm.**
3. **A DECLARED ARM THAT CANNOT BE CONSTRUCTED AS A FALSIFIABLE ARM IS A FINDING — NEVER A SILENT DROP.** A budget
   term that no executing or named-NOT-RUN arm can inhabit **is a review finding against the register** (§4.3 item 4:
   *a row whose arm cannot fail must be re-derived against its DECLARED terms, never re-scoped*). **Lowering the
   declared total to match what happened to run is the exact reverse of this rule and is refused by name.**
4. **WHAT DOES NOT MOVE here:** **the declared per-row totals, the `7`-row count, and the caps (≤ `100` per row ·
   ≤ `400` total · stop-after-5) are unmoved**; the per-row node-side/`class-(b)` split is **PRINTED** beside them
   (§13.3) and does not replace any declared figure.

### 4.2 The register (`7` rows — every term printed as the sum of its factors)

**⟨AMENDED `2026-09-29` BY THE AMENDMENT (§12): the register carries `7` rows at this head — the `6` filed rows
BELOW (KEPT VERBATIM, every property text and every budget unmoved) plus the amendment's one new row `P-SM-3`,
printed at this subsection's foot. The filed heading read `6` rows and its arithmetic read
`6 + 14 + 16 + 17 + 16 + 14 = 83`; both are kept visible as the filed reading and the current reading is printed
with them. The row cap (≤ 8) is met; no `F-` row is added and no §6/FS-n id is cited anywhere in the register.⟩**

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **INVARIANT** | **THE DECLARATION IS UNMOVED.** `MATRIX_ROWS` is exported, statically parseable pure data, enumerates exactly `U-1`..`U-8`, has **no duplicated row id**, every entry names a **non-empty `block`** that exists in `BLOCKS`, and the `uf_*` row-block census floor (`20`) is met; and **the summary's `total` is derived from `MATRIX_ROWS`** and reads the matrix-row count, never the block count. | 1 export/literal shape arm + 1 id-set equality arm (`U-1`..`U-8`) + 1 uniqueness arm + 1 block-resolution arm + 1 census-floor arm + 1 `total`-derivation arm | **`1+1+1+1+1+1 = 6`** |
| **`P-IM-2`** | **INVARIANT** | **THE REPORT SHAPE IS STRUCTURALLY COMPLETE FOR EVERY COUNTED ROW.** Every `uf_*`/extended **row** block's returned object carries the `§6.1` set (`row`, `assertion`, `dclass`, `realInput`, `evidence`, `proxyPASS`, `surface`, `pass`), a valid row-id form, a valid `dclass`, a **non-empty `evidence`**, a `surface` carrying **both `target:'assembled-renderer'` and `liveSurfacePresent`**, and the **per-row printing** names `row`/`block`/`verdict`/`dclass`/`realInput`/`surface`/`failingClause`/`evidence`/`proxyPASS`/`gesturePath`; **a counted row that returns the bare `{pass, detail}` shape is either converted or named as an exclusion.** | 8 field-presence arms (the `§6.1` fields) + 1 row-id-form arm + 1 dclass arm + 1 empty-evidence arm + 1 surface-pair arm + 1 printed-line arm + 1 bare-shape classification arm | **`8+1+1+1+1+1+1 = 14`** |
| **`P-SM-1`** | **STATE-MACHINE** | **THE VERDICT-COVERAGE TRANSITION IS TOTAL: A DECLARED ROW ENDS IN EXACTLY ONE OF {VERDICT, REFUSAL}.** Enumerated over the coverage space: (i) all 8 declared rows verdicted ⇒ `ok`, no refusal, `OK` printed; (ii) `n < 8` verdicted in a **full-battery** run ⇒ `ok:false`, the missing set **non-empty and equal to the declared-minus-verdicted set**, `REFUSED` printed, exit non-zero; (iii) `n < 8` in a **scoped** run ⇒ not a refusal (a row a scoped run did not execute is inconclusive, not a defect) **but never a claim of coverage**; (iv) a reported row id absent from the matrix ⇒ error; (v) a duplicated declared id ⇒ error; (vi) a declared row whose block is missing/empty ⇒ error. **The substitution and the hardcoded-empty set are dead in every branch** — asserted by the source-level read that no branch assigns the declared list to the executed set, and by the `missingRows` term of every draw. | 6 coverage branches × 2 arms (the `ok`/errors outcome; the `missingRows` value) + 4 negative draws (an empty `missingRows` with an unverdicted row; the substitution pattern re-introduced; a full-battery flag with `blocksRun>0`; a scoped run claiming full coverage) | **`6*2+4 = 16`** |
| **`P-SM-2`** | **STATE-MACHINE** | **THE DRIVER'S OWN MUTABLE STATE IS RESTORED, AND NO FRAME-BASED ROW READS ITS OWN PRIOR BLOCK'S ARTIFACT.** Enumerated over the shared-state space: `zone:left` expanded · `zone:left` **minimized** · pane collapsed · pane enabled/disabled · settings modal open/closed · page scrolled · representation mode flipped. For each: the state read is **distinguishable** (the minimized state is NOT reported as *"pane absent"*), the restore path exists and is **reachable per block** (not once per battery), a real hit-tested click drives it, and the **post-restore reading of the state equals the pre-mutation baseline**. Plus: the **persisted** state (`doc-nav` OFF and persisted by `persistence_v1`) has a restoring step, so an isolated `--block=` run and a full-battery run agree on the row's verdict. | 7 states × 2 arms (the distinguishable read; the restore-to-baseline) + 2 arm draws (the real hit-tested restore gesture; the per-block reachability) + 1 position-independence draw (isolated vs full-battery agreement on the same row) | **`7*2+2+1 = 17`** |
| **`P-TP-1`** | **TOTALITY** | **EVERY CLICK CARRIES A PROVEN PATH, AND "COULD NOT BE DRIVEN" IS NEVER AN APP FAIL.** Enumerated over the click space: on-target in-viewport · **off-viewport / `inVp:false`** · covered by another element · missing selector · zero-size box · a fallback path taken · a raw synthetic `.click()` on a verdict path. Each: the recorded shape names the coordinate, the viewport, the element under the point, `onTarget` and the path; a non-proven path yields **`NOT-DRIVEN`** + `realInput:false` + the DRIVER-failure marker; **no non-proven path can produce a PASS**; and a DIAG-marked synthetic click remains verdict-free. **None of the seven throws.** | 7 click shapes × 2 arms (the recorded shape; the verdict/pass outcome) + 2 negative draws (a fallback promoted to PASS; an unproven click counted as an app FAIL) | **`7*2+2 = 16`** |
| **⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, ANNOTATE-BESIDE (`RCA-8(c)`): THIS ROW'S CELLS ABOVE ARE KEPT VERBATIM, ITS PROPERTY TEXT IS UNMOVED, AND ITS DECLARED TOTAL MOVES `16` → `19` BY LANDED ARMS.** The three `P-TP-1` OUTCOME arms the fourth pass's gate-4 re-audit RULED be LANDED — `covered-by-another-element`, `missing-selector` and `zero-size-box` — inhabit this row's own declared `7 × (recorded shape, verdict outcome)`, so the declared total is `7 + 6 + 3 + 3 = 19` and the row is **the largest single row of the register at `19`, under the ≤ `100` per-row cap**. **Measurer: the TestWriter** (`§14.2` states the movement, `§14.3` the per-row split).⟩** |
| **`P-TP-2`** | **TOTALITY** | **EVERY REFUSAL, PARK AND EXCLUSION IS NAMED, AND NOTHING WIDENS.** Enumerated over the report's outcome space: a declared row with no verdict · an `isError` reply · a missing fixture (empty corpus / absent engine) · a structurally non-exercisable surface · a diagnostic/hygiene block · a converted-vs-excluded non-row. Each outcome **names the row/surface/reason**; **none is silent**; **`summary.pass`/`summary.fail` are never widened** beyond the executed rows; and **the driver adds no block, no `U-<n>` slot, no flag and no second surface object.** | 6 outcome shapes × 2 arms (the named reason; the arithmetic placement) + 2 draws (no block/slot/flag added; no second surface shape) | **`6*2+2 = 14`** |
| **⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, ANNOTATE-BESIDE (`RCA-8(c)`): THIS ROW'S CELLS ABOVE ARE KEPT VERBATIM, ITS PROPERTY TEXT IS UNMOVED, AND ITS DECLARED TOTAL MOVES `14` → `15` BY A LANDED ARM.** The `B-12` arm — *every block a `MATRIX_ROWS` entry declares as a contributor must itself EMIT that row's id* (`row: '<id>'` or a `declaredRowResult('<id>', …)`) — was ADDED by the fourth pass and is the row's 15th declared arm, so the declared total is `5 + 5 + 2 + 1 + 2 = 15`. **Measurer: the TestWriter** (`§14.2` states the movement, `§14.3` the per-row split).⟩** |

**⟨AMENDED `2026-09-29` BY THE AMENDMENT (§12) — THE ROW COUNT MOVES `6` → `7` AND THE ARITHMETIC IS RE-PRINTED
WITH ITS TERMS; the table above is KEPT VERBATIM and its five rows' property texts and budgets are UNMOVED. The 7th
row is §12.5's, added for the two clauses the architect's `E-1` ruling makes necessary (§2.2 `E-11`/`E-12`), and it
is the amendment's ONLY new row — the cap is ≤ 8 and this file is now at `7`.⟩**

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-SM-3`** | **STATE-MACHINE** | **SHARED-ROW AGGREGATION AND THE EXTENDED DECLARED/EXECUTED RECONCILIATION ARE BOTH TOTAL** (§2.2 `E-11`/`E-12`). Enumerated over the shared-row space: one block carrying a row id (single contributor) · two blocks carrying it and **agreeing** · two blocks carrying it where **one is not the other's verdict** (disagreeing) · an id that **merely repeats** another block's id/verdict. For each: the report carries **each contributing block's own verdict AND the row's aggregated verdict**; the aggregate is the **AND** of the contributions; a disagreeing pair **prints both and the row reads `FAIL`**; a `NOT-DRIVEN`/`PARKED` contribution is **never promoted**; and a repeating id **adds no verdict and flips no aggregate**. Plus the extended dimension: every **declared** extended row whose blocks were **requested** ends in **exactly one of {a verdict, a refusal naming it}**; the refusal is loud, named, and exits non-zero (`1`); the missing set is a **declared-minus-verdicted set difference, never a hardcoded empty list and never a substitution of the declared list for the emitted set**; and an **out-of-scope** declared row is inconclusive, **not** a refusal. **The declared-but-not-unit-declared extended rows keep their standing: reported, never refusing** (`E-12` item 5). | 4 shared-row shapes × 2 arms (the per-block verdict is present; the aggregated verdict equals the AND of the contributions) + 3 extended-reconciliation arms (the two converted rows are enumerated with their blocks; the refusal is named and non-zero-exit; the missing set is the set difference) + 3 negative draws (a declared extended row with a verdict missing and an empty missing set; the declared-list substitution re-introduced on the extended path; an averaged/majority/last-wins aggregate) | **`4*2+3+3 = 14`** |

**ARITHMETIC, printed with its terms:** `6 + 14 + 16 + 17 + 16 + 14 + 14 = 97` attempts total — **under the ≤ 400
cap**; **the largest single row is `P-SM-2` at `17`**, **under the ≤ 100 cap**; **`7` rows**, at the house cap of
≤ 8. **stop-after-5** on every row (≤ 5 distinct counterexamples reported, then the row stops). **Seed `0x20260929`;
strategy ids:** `strat:live-driver-matrix-unmoved` · `strat:live-driver-report-shape` ·
`strat:live-driver-coverage-transition` · `strat:live-driver-state-restore` · `strat:live-driver-click-totality` ·
`strat:live-driver-refusal-naming` · **`strat:live-driver-shared-row-and-extended-reconciliation`** (the 7th row's,
added by the same amendment). **Every row reports `held`/`broken`; the report prints each row's declared-vs-executed
term.** **⟨AMENDED `2026-09-29`: the `6`-row arithmetic `6 + 14 + 16 + 17 + 16 + 14 = 83` is KEPT VISIBLE ABOVE as
the FILED reading, and the current reading is the `97` line; the two differ by the 7th row's `14` and by nothing
else. A reader deriving any row's budget must use the `97` line for the total and the table for the per-row terms;
no term of `P-IM-1`/`P-IM-2`/`P-SM-1`/`P-SM-2`/`P-TP-1`/`P-TP-2` moves.⟩**

**⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`AGENTS.md` items 10b/10d, `RCA-6`) — `RCA-8(c)`: THE AMENDMENT
BLOCK ABOVE IS KEPT VERBATIM AND NOTHING IN IT IS REWRITTEN; THIS NOTE CLOSES THE LAST SITE WHERE `97` COULD STILL BE
TAKEN AS CURRENT.** **THE READING OF RECORD IS `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side + 16
named class-(b) NOT-RUN`** (third amendment `§14.2`/`§14.3`; `RECORDED READING; measurer: the TestWriter` off the
landed pin, **`VERIFIED-BY-READ` by this pass in the pin's own arithmetic title and its summed `101` assertion**), and
**the `97` — and the `6 + 14 + 16 + 17 + 16 + 14 + 14` arithmetic line printed ABOVE it in this same subsection — is
the FIRST amendment's FILED reading, kept visible and NOT current.** **The `§17.2` `F-2` row's claim that *"no spec
site reads `97` as current"* was FALSIFIED at this site and at `§12.5`'s printed-arithmetic sentence; both are now
annotated beside (`§18.2` `F-R1`).** **A reader deriving any row's budget uses the `101` line for the total and
`§14.2`'s ANNOTATED table for the per-row split; the `7`-row count, the typing, the seed, the stop-after-5 and the
caps are unmoved.**⟩**

**⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, THE REGISTER ARITHMETIC DRIFT, ANNOTATE-BESIDE
(`RCA-8(c)`): THE PARAGRAPH ABOVE IS KEPT VERBATIM, ITS LAST SENTENCE INCLUDED, AND NOTHING IN IT IS REWRITTEN.**
**THE LANDED ARITHMETIC IS `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101` — split `85 executed node-side + 16 named
class-(b) NOT-RUN` — and the `97` line beside it is the FIRST amendment's FILED reading.** **TWO TERMS MOVED, BOTH
BECAUSE ARMS WERE ADDED AND NOT BECAUSE A BUDGET WAS PADDED: `P-TP-1` `16` → `19` (the three LANDED outcome arms
`covered-by-another-element` / `missing-selector` / `zero-size-box`, so the declared `7 × (recorded shape, verdict
outcome)` is genuinely inhabited) and `P-TP-2` `14` → `15` (the `B-12` declared-contributor-emission arm).** **WHY THE
PARAGRAPH'S LAST SENTENCE IS NOW FALSE OF TWO ROWS, STATED PLAINLY SO NO READER IS MISLED BY IT:** it was written
from the FIRST/SECOND amendment's head, at which the six rows' totals were unmoved; the TestWriter's third and fourth
remediation passes then LANDED the four arms above, so the declared totals of `P-TP-1` and `P-TP-2` are the two rows
that DO move. **`P-IM-1`, `P-SM-1`, `P-SM-2` and `P-SM-3` do not move, and the row count stays `7`.** **Measurer of
every figure here: the TestWriter, `RECORDED READING` off the landed pin (§14.1); the superseded `97`/`81 + 16` is
kept visible at its own site and at `§4.2`'s arithmetic line, `§12.5` and `§13.3`.**

**⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13) — WHERE THE PER-ROW SPLIT OF THE `97` IS PRINTED, AND WHY THE
NUMBER IS UNMOVED.** **The declared arithmetic is `97` exactly as the two blocks above print it; the SECOND
amendment moves NO declared figure** (a declared total that moves to match what happened to run is the refused act,
§4.1's added ruling item 3). **What the second amendment adds is the PRINTED SPLIT — each row's declared total
rendered as *executed node-side arms + named class-(b) NOT-RUN arms* — and it is stated at `§13.3` with its own
`RECORDED READING` measurer; the `held` predicate over that split is `§4.1`'s added ruling, and its fail-state is
`§13.6`'s `F-17`.** **A reader must derive the total from the `97` line and the split from `§13.3`; no budget term,
no row and no cap moves between the two.**

**⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, ANNOTATE-BESIDE (`RCA-8(c)`): THE BLOCK ABOVE IS
KEPT VERBATIM AND ITS TWO CLAIMS ARE HERE CORRECTED BESIDE IT, NEVER IN IT.** **THE LANDED READING MOVES TWO DECLARED
TOTALS AND THE TOTAL WITH THEM: `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101` (`85 executed node-side + 16 named class-(b)
NOT-RUN`), so a reader must now derive the total from `§14.1`'s `101` line and the split from `§13.3`'s ANNOTATED
rows.** **TWO DISTINCT CLAIMS ABOVE ARE FALSIFIED AS OF THE LANDING, and each is named here with its ground: (i) *"the
SECOND amendment moves NO declared figure"* was true of the SECOND amendment's head and is FALSE of the LANDING — the
TestWriter's third/fourth passes LANDED four arms and raised `P-TP-1` `16` → `19` and `P-TP-2` `14` → `15`; and (ii)
*"a declared total that moves to match what happened to run is the refused act"* stands unchanged as a RULE, and it is
NOT what happened here: the declarations were RAISED because ADMISSIBLE ARMS WERE ADDED, never lowered to match a run
(`§14.4` rules it against `F-17`).** **Nothing else in the block moves: the `7` rows, the `≤ 8` row cap, the typing,
the seed, the stop-after-5 and the no-`F-`-row/no-`§6`/`FS-n` rules are unmoved.**

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

**⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13) — THE ARM-BY-ARM READING THAT DISCHARGES ITEM 2 FOR THE `97`
BUDGET, ANNOTATE-BESIDE (`RCA-8(c)`): items 1–4 above are KEPT VERBATIM and unmoved.** Item 2 requires the report to
state which arm is node-side and which is class (b); **the landing pass read the register's own arm-by-arm
accounting, and it reads exactly as item 2's split requires it to** (`RECORDED READING; measurer: the implementer's
landing pass`, restated with the terms at §13.3). **The consequence for this item, stated because a reader will ask
it: the `class-(b)` arms are NOT-RUN **in node**, and this item's "live run" is §6 class (b)'s battery — so a register
row's `held` figure is a statement about the SOURCE-STRUCTURAL and declared-classification arms, and its class-(b)
terms are carried by the class-(b) run's own readings (§13.5).** **Neither the `97` total nor any row's `executed`
figure may be read as a behavioural PASS of a live arm, and no class-(b) arm may be counted as executed.**

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

**⟨CLASS (b) HAS RUN — ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13): the class description above is KEPT
VERBATIM, and what the landing pass's real run read is recorded at `§13.5`, item by item, with the invocation, the
isolated ports and the exit code, and with each reading marked SATISFIED or OPEN against this class's own
"acceptance readings" cell.** **The one-line status a reader must carry away: the refusal/report-shape readings are
SATISFIED (`REFUSED` with the missing rows named, `surface.target` on every printed row, the clauses printed —
§13.5), the hygiene item is CONFIRMED-BROKEN (§6.3 `C-2` item 4's own falsifier, `§13.4`) and the `8 of 8` limb is
OPEN (`§13.5` item 1: the matrix reads `2 of 8` = `summary.total`).** **No reading in `§13.5` is app evidence
(`RCA-12`) and none of them is this pass's own (the measurer is named at each).**

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

**⟨ADDED `2026-09-29` BY THE SECOND AMENDMENT (§13) — WHERE THE RED SET ACTUALLY STANDS AFTER THE TESTWRITER'S FILE
AND THE IMPLEMENTER'S LANDING.** The TestWriter authored `tests/live-drive-contract.test.ts`'s red set from `§2`+`§4`
and **brought `boot_landing`/`vis_persist` into the pin's row-block scope under the re-statement discipline**
(`⟨RE-STATED 2026-09-29⟩`, superseded value visible — `VERIFIED-BY-READ` by this amendment, reader: the SpecDoc).
**The landing's own tally, as reported to this pass: `6` rows remain red, and EVERY ONE OF THEM IS A REGISTER ROW** —
i.e. the remaining red is the register's own declared-budget accounting, **not** a report-shape or coverage clause
(`RECORDED READING; measurer: the implementer's landing pass`, restated with its per-row arithmetic at `§13.3`, and
its ruling at `§4.1`'s added block). **A reader must not read "6 red" as "6 contract clauses unmet": the clauses'
own class-(b) readings are `§13.5`'s, and the register rows' red is the accounting relation `F-17` states.**

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

   **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER'S AUDIT (`AGENTS.md` item 10b; `RCA-8(c)`, ANNOTATE-BESIDE:
   item 3's filed text above is KEPT VERBATIM and NOTHING in it is rewritten — this note is the current reading, and
   it exists because `§15`'s head block states that `§6.3` `C-2` item 3 and `§13.5` item 3 are WITHDRAWN BY
   ANNOTATION **AT THEIR OWN SITES** while item 3 in fact carried none; a spec-internal cross-reference that did not
   resolve is a gate-7 finding.)** **THE WITHDRAWAL, AND WHERE ITS GROUNDS LIVE: the scoped-refusal expectation this
   item states `REFUSED` FOR IS WITHDRAWN — `REFUSED` occurs in NO scoped invocation of record (the landed form is
   `OK (scoped run: N of 8 declared rows in scope; M inconclusive)`), both contributors of the enumerated
   `UF-SETTINGS-7` emit their row ids, and the exit `1` those runs carry comes from `fail > 0`.** **`§15.3.1` OWNS
   that reading and its three grounds; this note only points at it, so no reader meets item 3 as current.** **WHAT
   DOES NOT MOVE (stated so the withdrawal is not over-read): the FULL-BATTERY refusal obligation of `§2.1` `E-3`
   clause 2 and `§2.2` `E-12` item 2 STANDS unmoved — `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE` clause (2) pins it
   — and `§13.5` item 1's full-battery `REFUSED — missing declared row(s): …` reading is a SEPARATE reading and is
   untouched (`§15.3.1`'s closing note).** **OWNER of the reconciliation this note records: the spec-owning pass; the
   clause itself is NOT re-written here.**⟩
4. **THE HYGIENE HOLDS.** A run that includes `user2_pane_drag`/`user10_collapse_vertical_text` **does not leave
   `zone:left` minimized for the frame-based rows that follow**: the later rows' frame readings are taken from an
   expanded zone (or from the tab strip, as the contract permits) — **and the row `uf_panes_1`'s isolated
   (`--block=uf_panes_1`) and full-battery verdicts agree** (the `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` row's
   own falsifier).

   **⟨THE FALSIFIER THIS ITEM ASKS FOR HAS BEEN MEASURED, AND IT IS CONFIRMED — ADDED `2026-09-29` BY THE SECOND
   AMENDMENT (§13), ANNOTATE-BESIDE (`RCA-8(c)`): item 4 above is KEPT VERBATIM.** **`RECORDED READING; measurer: the
   implementer's landing pass, `2026-09-29`; the commands are theirs and are quoted exactly:** `node
   scripts/live-drive.mjs --port=3911 --cdp-port=9341 --block=uf_panes_1` read **PASS**, and the **SAME row inside
   the full battery** (same ports, no `--block=` scope) read **`NOT-DRIVEN`** with the evidence string
   `no doc-nav pane frame rendered; frames=[search]`. **The cause is `persistence_v1` persisting `doc-nav` OFF
   (its own block toggles the `#settings-modal [data-pane="doc-nav"][data-enabled]` toggle to `false` and persists
   it) with NO driver-side restore** — read in the driver by this amendment (`§13.1` `Y-2`), and the same artifact
   `M-6`/`F-5` describe for `zone:left`. **THE TWO READINGS DISAGREE, SO ITEM 4's OWN `uf_panes_1`
   ISOLATED-VS-FULL-BATTERY AGREEMENT CLAIM IS **NOT** MET AT THIS HEAD; what IS met is the falsifier this item
   names, recorded rather than smoothed.** **Neither the isolated PASS nor the full-battery `NOT-DRIVEN` is app
   evidence (`RCA-12`): both are `[D]`-layer driver readings, and the `NOT-DRIVEN` verdict is the contract's own
   honest classification (`§2.3` `H-4`) — never an app FAIL.** **The ruling this reading requires is `§13.4`'s (the
   per-block restore is permitted INSIDE the driver's block-runner), and its open obligation is `§13.7`.**

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
documentation review (`RCA-6`), recorded in `archive/reviews/<date>-live-driver-verdict-integrity-doc-review.md`
**⟨DISCHARGED `2026-09-29` — `RCA-8(c)`: the review ran, and its record is
`archive/reviews/2026-09-29-U-LIVE-DRIVER-VERDICT-INTEGRITY-doc-review.md`; the reconciliation it produced is this
file's `§17`.⟩**;
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

**⟨AMENDED `2026-09-29` — THE ARCHITECT'S RULING ON `E-1` AT THIS SITE, ANNOTATE-BESIDE (`RCA-8(c)`): the filed
default sentence immediately above is KEPT VERBATIM and NOTHING in it is rewritten; this block is the current
reading and it governs.⟩** **THE DEFAULT IS CONVERTED (unchanged) — AND THE ID SOURCE IS PINNED TO THE CLOSED
ENUMERATION: a converted row's id comes from `docs/specs/user-flow-audit-checklist.md` §1–§14 (`UF-<SURFACE>-<n>`,
the form `DECIDED: D-GP-UFA-1` ties to that census) or from the capped `§5.U` matrix, and THE DRIVER NEVER MINTS A
ROW ID.** **The minted `UF-LANDING-*` / `UF-VIS-*` form is WITHDRAWN as the default and NAMED AS THE REFUSED
ALTERNATIVE**, with its reason on the record: *a minted id is outside the closed enumeration and a later checklist
surface could collide with the same form* (§2.1 `E-4` item 2, where the refused alternative is named). **Option (2)
`EXPLICITLY EXCLUDED` survives, and its scope moves:** it is now **the fallback for a counted row that has NO
enumerated id**, **not** the choice for these two — both have an enumerated id. **The two mappings, with their id
source named (`VERIFIED-BY-READ`; reads in §12.2):** `boot_landing` → **`UF-STAGE-1`** (an id of the checklist's own
§5 Stage/document census; **emitted by no block** at this head); `vis_persist` → **the PERSISTENCE HALF of
`UF-SETTINGS-7`** (an id of the checklist's §7 Settings-modal census, **already emitted by the block
`uf_settings_7`**) — a **re-coupling of an already-declared pair**, whose shared-row consequence is contracted in
§2.2 `E-11` and whose extended reconciliation is contracted in §2.2 `E-12`. **The standing decision row is
`DECIDED: LIVE-DRIVER-ROW-ID-SOURCE-AND-SHARED-ROW-AGGREGATION` (`docs/decisions.md`, `2026-09-29`); the amendment's
own inventory is §12 and the answered escalation is §9 `E-1`.**

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
| **`E-5`** | **⟨ADDED `2026-09-29` BY THE AMENDMENT (§12) — THE ANSWERED ESCALATION, RECORDED AT THE TABLE'S FOOT SO THE FILED ROWS ABOVE STAY VERBATIM (`RCA-8(c)`: ANNOTATE-BESIDE, APPEND-NEVER-REWRITE; `E-1`'s filed text is NOT deleted and NOT rewritten).⟩** **`E-1` IS ANSWERED — STATUS: `ANSWERED`, DATE `2026-09-29`, RULING: `CONVERTED` ONTO EXISTING ENUMERATED CHECKLIST IDS, WITH MINTING REFUSED.** **The two mappings, each `VERIFIED-BY-READ` at this head:** **`boot_landing` → `UF-STAGE-1`** (the free id — no block emits it; the checklist's own `UF-STAGE-1` entry is the empty-store landing whose live confirmation it names is `boot_landing`) · **`vis_persist` → the PERSISTENCE HALF of `UF-SETTINGS-7`** (already emitted by the block `uf_settings_7`; the checklist row's source cell names `unit-live11 §2.3/§7` and the `vis_persist` block's own comment cites `U-LIVE11` — **one enumerated row, two block halves**, so the mapping is a **re-coupling of an already-declared pair, not an invention**). **The filing's minted `UF-LANDING-*`/`UF-VIS-*` form is WITHDRAWN as the default and named as the refused alternative** (a minted id is outside the closed enumeration and a later checklist surface could collide with the form); **option (2) EXCLUDED-BY-NAME survives as the fallback for a counted row with NO enumerated id**, and is no longer the choice for these two. **The answer's consequences are contracted at §2.1 `E-4` (re-stated beside its filed text), §2.2 `E-11`/`E-12` (the two new clauses), §8 `D-3` (the pinned id source) and §12 (the amendment inventory); the standing decision is `DECIDED: LIVE-DRIVER-ROW-ID-SOURCE-AND-SHARED-ROW-AGGREGATION` (`docs/decisions.md`, `2026-09-29`).** **`E-1`'s conditional tail is therefore NOT taken:** the ruling is *not* *"exclude by name"* — **`D-3`'s default stays `CONVERTED`, and `F-11` stays the finding for the unmarked middle state** (it is no longer the disposition of these two rows). | **ARCHITECT — RULED (`2026-09-29`); recorded by the amendment pass** | The escalation was a row-id-vocabulary question and it was the architect's to answer; **it is now answered, so this row is closed and must not be re-opened as an escalation.** **What remains owing is not the ruling but its landing**: the implementer's conversion of the two blocks onto these ids, under the clauses `E-11`/`E-12` contract — recorded in §12.7. |

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
   **⟨DISCHARGED `2026-09-29` — `RCA-8(c)`, ANNOTATE-BESIDE: the review RAN after this unit's greens and its record is
   `archive/reviews/2026-09-29-U-LIVE-DRIVER-VERDICT-INTEGRITY-doc-review.md` (the repo's own unit-id naming
   convention, which the `<date>-<unit>-doc-review.md` placeholder above does not spell out; the placeholder is KEPT
   as filed). What it reconciled is THIS file's new `§17`, and nothing it found was left for the next agent.⟩**
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

---

## 12. THE `2026-09-29` AMENDMENT — THE ARCHITECT'S `E-1` RULING APPLIED (the closed enumeration as the id source, the shared-row aggregation, and the extended declared/executed reconciliation)

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED AMENDMENT BLOCK: it adds a section at the foot, it moves no
existing section, it renumbers nothing, and every existing `§`/id remains valid.** **It is written
`ANNOTATE-BESIDE` (`RCA-8(c)`): the four filed sites it amends — §2.1 `E-4`, §8 `D-3`, §9 `E-1` and §4.2 — each
KEEP their filed text VERBATIM with the ruling recorded beside it, and **nothing in this file was rewritten to make
the ruling look as if it had always been there.** The amendment's date is the working date convention of this repo:
the branch head's commit date, `2026-09-29` — the same date this file was minted and the same date the standing
decision `DECIDED: LIVE-DRIVER-ROW-ID-SOURCE-AND-SHARED-ROW-AGGREGATION` carries (`VERIFIED-BY-READ`: reader the
SpecDoc, from the repository's own head record and the two documents' own date literals). **This pass ran nothing —
no suite, no register row, no battery, no Electron boot; its wall is read/search + doc-write and it takes no reading
of its own beyond the five reads §12.2 records, plus the `sha256` and line count §10 item 10 owes (§12.9).**⟩**
**The section's own contents, so a reader can navigate it: `§12.1` the two id mappings and the `UNTAKEN` limb ·
`§12.2` the five reads (`V-11`…`V-15`) · `§12.3` the report-shape and arithmetic consequences · `§12.4` the three
added fail-states (`F-13`…`F-15`) · `§12.5` the register reading (`7` rows, `97` attempts) · `§12.6` the red set,
the class descriptions and the pins · `§12.7` what the amendment OWES · `§12.8` what did NOT change · `§12.9` the
snapshot.**

### 12.1 The two id mappings, contracted (and the limb that is NOT taken)

**`M-1`/`V-2`/`M-5` named the two counted rows; §2.1 `E-4` offered two dispositions; the architect ruled. Both rows
are CONVERTED, onto ids that ALREADY EXIST in the closed enumeration — `docs/specs/user-flow-audit-checklist.md`
§1–§14, the ~`112`-row census `DECIDED: D-GP-UFA-1` ties the `UF-<SURFACE>-<n>` form to.** **THE DRIVER MUST NEVER
MINT A ROW ID** (§2.1 `E-4` item 3; §8 `D-3`).

| The counted row (`BLOCKS` key) | Its contracted row id (the closed enumeration's own) | The converted row's assertion = that enumerated row's END STATE | What the block measures today | What must be added |
| --- | --- | --- | --- | --- |
| **`boot_landing`** | **`UF-STAGE-1`** (checklist §5 Stage/document; **emitted by NO block at this head** — §12.2 read `V-11`) | *"Boot against a TRUE empty store: `#stage-landing[data-stage='landing']` coexists with `#editor-toolbar` AND ≥ `1` `.pane-frame[data-pane-id]` in ONE graph; **a still-empty content re-derive keeps it**; importing the first doc removes it (no phantom)"* | **two of the row's limbs**: the coexistence (landing + `data-stage='landing'` + the toolbar + `panes > 0`) and **the first-import removal** (`!landingAfter`) | the `§6.1` field set + the printed members + the failing clause with observed-vs-required (§2.2 `E-7`), its **declared extended id with its block** (§2.2 `E-12` item 3), and **the third limb's disposition — below** |
| **`vis_persist`** | **THE PERSISTENCE HALF OF `UF-SETTINGS-7`** (checklist §7 Settings modal; **already emitted by the block `uf_settings_7`** — §12.2 reads `V-12`/`V-13`) | the enumerated row's persistence limb, as §2.1's re-pin already states it: *"a real hit-tested click on the pane-visibility toggle flips `data-enabled` **and the change is PERSISTED — a second read after a re-derive reads the flipped value**"* | **the in-pane `[data-pane][data-enabled]` CLICK + the flip** (`data-enabled before ≠ after`) — **and NOT the persistence**: no re-derive, no second read | the `§6.1` set + the printed members + the failing clause, **the persistence measurement (the re-derive half)**, its **declared extended id with its block** (§2.2 `E-12` item 3), and **the shared-row aggregate** with `uf_settings_7` (§2.2 `E-11`) |

**THE `UF-STAGE-1` LIMB THAT IS NOT MEASURED — RECORDED `UNTAKEN`, WITH ITS REASON, SO NO READER IMPLIES IT.** The
enumerated row carries three limbs; the block measures the first and the third. **The second — *"a still-empty
content re-derive keeps it"* — is `UNTAKEN` by this unit's conversion**, and the reason is stated rather than
smoothed: **it is a NEW live assertion about the app, not a re-pin of the evidence text the driver's block already
asserts.** §2.1 `E-5` admits a new live assertion **only** as a re-pin of the evidence text of a row that is
ALREADY DECLARED (the row *is* declared — §2.1 `E-4` item 5's premise is exactly that the checklist's `UF-STAGE-1`
entry is declared and cites `boot_landing` by name — **but THIS LIMB is asserted by no block today**, so driving it
would be a first measurement of an app behaviour, and §1.4/§1.3 keep app assertions out of this unit — note the
distinction: **the CONVERSION is a re-pin of a declared row's evidence text and is admissible under `E-5`; the
LIMB would be a fresh app assertion and is not**),
and the architect's ruling named **this exact disposition** for it. **Consequences, all contracted:** the converted
`UF-STAGE-1` result **must not print, imply, or claim** the re-derive limb; the limb is recorded here as `UNTAKEN`
with this reason; and **if the implementer chooses to measure it anyway, that is a scope change requiring an
architect ruling, never a silent addition to the conversion.** **No `UNTAKEN` limb may be read as a PASS, a FAIL or
a PARK** — it is *not measured*, and the report's own arithmetic must not count it (§2.3 `H-5`: no verdict is
promoted).

**THE SHARED-ROW CONSEQUENCE IS CONTRACTED, NOT ASSUMED.** `UF-SETTINGS-7` is now carried by **two** blocks
(`vis_persist` and `uf_settings_7`) — the unit's own case of §2.2 `E-11`: **each contributor's own verdict prints,
the row's verdict is the AND of the halves, and a disagreement prints both and reads `FAIL`.**

### 12.2 The five new reads this amendment took — reader: the SpecDoc (each a read of the tree, marked as such)

| # | The read | Why it decides a clause |
| --- | --- | --- |
| **`V-11`** | **`UF-STAGE-1` IS EMITTED BY NO BLOCK AT THIS HEAD.** A full-tree read for the id returns **no** driver occurrence — the driver's extended declaration carries `UF-STAGE-1`'s **sibling** Stage rows (`UF-STAGE-2`, `UF-STAGE-3`, `UF-STAGE-4`, `UF-STAGE-6`) and its Stage-active-tab rows (`UF-STAGE-AT-1`..`AT-8`), and a read for `rowResult('UF-STAGE-1'` / `parkRow('UF-STAGE-1'` finds **nothing**. **The id is therefore free, exactly as the ruling's premise states.** | §12.1: the `boot_landing` → `UF-STAGE-1` mapping collides with no existing verdict. |
| **`V-12`** | **`UF-SETTINGS-7` IS ALREADY EMITTED — by the block `uf_settings_7`**, whose `rowResult('UF-SETTINGS-7', …)` asserts *"a REAL per-pane `[data-pane][data-enabled]` click flips a pane ON (its `.pane-frame` appears, painted) and OFF (the frame is removed)"*, gated on **both** clicks' hit-tested `cdp` path and on the ON state's painted frame box. | §12.1/§2.2 `E-11`: the mapping is a **re-coupling of an already-declared pair**; the row id has two contributors. |
| **`V-13`** | **THE CHECKLIST'S `UF-SETTINGS-7` SOURCE CELL READS `unit-live11 §2.3/§7`, AND THE DRIVER'S OWN `vis_persist` BLOCK COMMENT CITES `U-LIVE11`** — i.e. the two blocks are the **two halves of ONE enumerated row** (the flip/frame half and the persistence half), not two rows by coincidence. **The checklist cell's own disposition column reads `wants-removal`** — recorded here as a read, because a reader comparing cells will meet it: it is a **census-direction entry about the SURFACE** (the in-pane remedy recorded for the native-menu compromise), **not a claim that the enumerated row id no longer exists**; the row id remains in the closed enumeration and is what `uf_settings_7` emits today. | §12.1: the premise the ruling rests on (one row, two halves) is read as stated; the `wants-removal` cell is disclosed rather than smoothed. |
| **`V-14`** | **`ROW_EXTENDED` DECLARES EXACTLY `30` ENTRIES** (`14` `UF-*` legacy/`user*`-`repro_*`-`toolbar_*` rows + `8` `U-EDIT-1-LIVE-<n>` rows + `8` `UF-STAGE-AT-<n>` rows), **and the run's `extendedVerdict` counts EVERY emitted row id that is not `U-<n>`** — a filter on the emitted rows, **not** a declared-vs-verdict coverage count; **nothing reconciles the declared extended set against the emitted one**, and the printed line reads *"N of 30 defined"*. | §2.2 `E-12`: the extended dimension has **no coverage authority**, which is the defect the new clause closes for the rows this unit declares. |
| **`V-15`** | **`extendedRowsRun: 54` AGAINST A DECLARED `30`** — **emitted ≫ declared**, and the excess is real: several blocks emit checklist ids that are **in no extended declaration at all** (e.g. `UF-TABS-1`, `UF-TABS-3`, `UF-TABS-4`, `UF-TABS-7`, `UF-PANES-1`, `UF-SETTINGS-1`…`UF-SETTINGS-5`, `UF-LAYOUT-2`, `UF-LAYOUT-10`, `UF-GNOSIS-1`…`UF-GNOSIS-6`, `UF-HIST-4`, `UF-SEARCH-2`, `UF-PANES-14`, `UF-STAGE-AT-*`…). **This is why §2.2 `E-12` item 5 declares an emitted-but-undeclared id as REPORTED, never a refusal — and why the two unit-declared rows are made declarable by name.** | §2.2 `E-12` items 2/4/5: the extended reconciliation is total over **declared** rows, and the undeclared-emission case is named rather than silently tolerated. |

**What this amendment did NOT read, stated so no cell over-claims:** the per-row printed output of the last full
battery; the driver's captured exit code for it; and **whether the ~`24` rows emitted outside `ROW_EXTENDED` should
each be declared** — that is a naming act over other units' rows, and §12.7 item 2 records it as owed, not taken.

### 12.3 The report-shape and arithmetic consequences, stated exactly

1. **`MATRIX_ROWS` STAYS `8` AND `summary.total` STAYS `8`** (§2.1 `E-1`/`E-5`, §8 `D-5`): **no new `§5.U` slot, no
   new `BLOCKS` key, no new flag, and no second surface object** — the converted rows are `BLOCKS` keys that already
   exist, and they return `rowResult`'s existing shape (§2.2 `E-6`).
2. **THE TWO CONVERTED ROWS APPEAR IN THE EXTENDED DIMENSION ONLY** — `UF-STAGE-1` and `UF-SETTINGS-7` are **not**
   `U-<n>` ids, so the matrix verdict filter does not see them and `summary.pass`/`summary.fail`/`summary.parked`
   are untouched by the conversion.
3. **`extendedRowsRun` MOVES `54` → `56` IN A FULL BATTERY — a PREDICTION, not a reading** (`54` is
   `RECORDED READING; measurer: the live-scenario runner`; the `56` is this amendment's derived figure):
   **`boot_landing` and `vis_persist` each contribute exactly ONE report row after conversion** (each currently
   contributes `0`, because each returns the bare `{pass, detail}` shape that the report loop does not record —
   §0.2 `V-2`), and **no other block's contribution changes**. **The next full battery's printed `§6.1 summary`
   settles it; a reading other than `56` falsifies this clause and must be recorded verbatim, not smoothed.**

   **⟨ANNOTATED `2026-09-29` BY THE SECOND AMENDMENT (§13), ANNOTATE-BESIDE (`RCA-8(c)`): THE ITEM ABOVE IS KEPT
   VERBATIM — INCLUDING ITS OWN FALSIFICATION SENTENCE — AND NOTHING IN IT IS REWRITTEN OR DELETED. THE FALSIFICATION
   IT ANTICIPATED HAS HAPPENED, AND THE READING IT DEMANDED HAS BEEN TAKEN.** **The next full battery ran and its
   `extendedRowsRun` is `53`, not `56`** (`RECORDED READING; measurer: the implementer's landing pass, the
   `2026-09-29` full-battery run — the printed line and its composition are quoted at `§13.1`/`§13.2`). **So the
   item's own predicate is TAKEN: *a reading other than `56` falsifies this clause*, and the reading was `53`.** **A
   PREDICTION IS SUPERSEDED, NOT A CONTRACT CLAUSE:** *"one report row per converted block"* — the premise the `56`
   rested on — is **confirmed** (`§13.2`: the two converted blocks do each contribute exactly one report row); what
   the prediction got wrong is the premise that *nothing else moves*: **the run's `extendedRowsRun` is a count of
   EMITTED non-`U-<n>` ids, so it moves with the blocks that actually ran, the inconclusive declared rows and the
   emitted-but-undeclared ids, never with a fixed prediction** (`§13.2` re-states it as the clause; `§2.2` `E-12`
   item 1's *"not a declared-vs-verdict coverage count"* read stands unchanged). **The measured `53` is printed BESIDE
   the superseded `56` at `§3.3` and at `§13.2`; no reader may quote the `56` as the landing's reading, and the
   landing may not print the `53` as a coverage figure either.**
4. **THE EXTENDED LINE NAMES EACH CONVERTED ROW ID WITH ITS BLOCK.** The report's EXTENDED line already prints
   `row:block=VERDICT` per emitted extended row; after conversion it must carry **`UF-STAGE-1:boot_landing=…`** and
   **`UF-SETTINGS-7:vis_persist=…`** **beside** **`UF-SETTINGS-7:uf_settings_7=…`** — the two contributions of the
   shared row, individually readable (§2.2 `E-11` item 1), **plus the row's aggregated verdict beside them**
   (§2.2 `E-11` item 2). **The line's declared count reads `ROW_EXTENDED.length`, which the conversion moves
   `30` → `32`** (§2.2 `E-12` item 5), **and it must not be read as a coverage figure** (§2.2 `E-12` item 1).
5. **`summary.pass`/`summary.fail` STILL PARTITION ONLY THE EXECUTED `§5.U` ROWS AND MUST NEVER BE READ AS APP
   HEALTH** (§2.1 `E-3`'s summary row, §2.3 `H-5`, kept unchanged): the conversion gives two previously
   unclassifiable rows (`M-5`) a readable verdict **in the extended table**, and that is all it gives them.

### 12.4 The fail-states this amendment adds (each a TestWriter row, appended — `F-1`…`F-12` are unmoved)

| # | Fail-state | Trigger | Contracted observable | Exit / verdict treatment |
| --- | --- | --- | --- | --- |
| **F-13** | **A DECLARED EXTENDED ROW WITH NO VERDICT (the extended counterpart of `F-1`)** | a declared extended row whose block(s) were **requested** (`--block=` scoped or `--block=all`) and produced **no** verdict — the unit-declared rows `UF-STAGE-1`/`UF-SETTINGS-7` being the acceptance set | a per-row line naming **the row id and the block(s) that produced nothing**; the extended reconciliation line reads **`REFUSED`** with them named; **`OK` is never printed** | exit **`1`**; **the row is a refusal, never an omission** (§2.2 `E-12` item 2) |
| **F-14** | **A ROW ID CARRIED BY TWO BLOCKS THAT DISAGREE** | one contributing block PASSes the row and the other FAILs it (`vis_persist` vs `uf_settings_7` is the unit's own pair) | **both contributors' verdicts print** AND the row's aggregated verdict prints; the row reads **`FAIL`** — **never averaged, never last-wins, never silently merged** | never a PASS; the aggregate's contributor list is part of the printed record (§2.2 `E-11` items 2/3) |
| **F-15** | **AN EMITTED ROW ID THAT NO DECLARED EXTENDED STRUCTURE CARRIES** | a block emits a checklist-form id that is in no extended declaration (the ~`24`-row case §12.2 `V-15` reads) | **`EXTENDED-UNDECLARED: <row id>(<block>)`** is **printed** — named, never silent — while the run is **not** refused | informational on THIS unit's arithmetic; **declaring it is a later unit's naming act** (§2.2 `E-12` item 5, §12.7 item 2) |

### 12.5 The amendment's register reading (the `§4.2` table is updated in place beside its filed text; this is the same figure from the amendment's side)

**The typed register carries `7` rows — the `6` filed rows with every property text and every budget UNMOVED, plus
the amendment's ONE new row `P-SM-3` (STATE-MACHINE, for §2.2 `E-11`/`E-12`).** The cap is ≤ 8; the typing stays
only `P-IM-*`/`P-SM-*`/`P-TP-*`; **no `F-` row is added** and **no `§6`/`FS-n` id is cited anywhere in the
register**. **Printed arithmetic with its terms: `6 + 14 + 16 + 17 + 16 + 14 + 14 = 97` attempts total** — under the
≤ `400` cap; **largest single row `P-SM-2` at `17`** — under the ≤ `100`-attempts-per-row rule at every row;
**stop-after-5** on every row; **seed `0x20260929`** (the program's hex form of this pass's date); the 7th row's
strategy id is **`strat:live-driver-shared-row-and-extended-reconciliation`**; **every row reports
`held`/`broken`**; and **every new arm is expressible by a TestWriter executing the property layer under the repo's
`npm test`** — deterministic (pinned seed and exhaustive enumeration), **one-pass remand** (≤ `5` counterexamples per
row), and **honest about its node-side limit**: as §4.3 items 1–3 state, the driver cannot be imported (`V-10`), so
the two new clauses' arms are **source-text and statically-parsed-literal assertions plus negative draws**, and the
**behavioural** terms remain §6 class (b)'s real run (a full battery, `extendedRowsRun` `56`, the refusal line, the
aggregate). **The `§6`/`FS-n` prohibition, the ≤ `8`-row cap, the seed, the stop-after-5 and the declared-vs-executed
reporting are all unchanged.** **⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — `RCA-8(c)`: the
`Printed arithmetic with its terms: 6 + 14 + 16 + 17 + 16 + 14 + 14 = 97` sentence ABOVE is KEPT VERBATIM as this
amendment's own reading and is SUPERSEDED BESIDE IT — **the reading of record is `101`** (`§14.2`, `§4.2`'s
annotated block, `§13.3`'s annotated rows), and this section's **citation by the pin** (whose arithmetic `it` title
names `§12.5` for both values) now meets both figures at the section it names. **The pin's own reading of this
section is `VERIFIED-BY-READ` by this pass: the `§4.2`/`§12.5` title carries the filed `97` labelled as filed AND
the landed `101`, with the `101` assertion, the `held` predicate and the accounting identity kept.**⟩**

**⟨ANNOTATED `2026-09-29` BY THE SECOND AMENDMENT (§13), ANNOTATE-BESIDE (`RCA-8(c)`): THE SUBSECTION ABOVE IS KEPT
VERBATIM AND NOTHING IN IT IS REWRITTEN.** **Two of its figures move and both are printed beside their superseded
value rather than replaced:** the behavioural term's **`extendedRowsRun` `56` is SUPERSEDED by the measured `53`**
(the landing pass's real full battery; §13.1 `L-3`/`L-4`, restated at `§13.2`, and the falsification sentence at
`§12.3` item 3 is annotated as TAKEN there), **and the `97` is UNMOVED but is now PRINTED as a per-row split
(`executed + named class-(b) NOT-RUN`) at `§13.3`, under the `held` predicate ruled at `§4.1`.** **The rest of this
subsection — the `7` rows, the cap, the typing, the seed, the stop-after-5, the no-`F-`-row and no-`§6`/`FS-n`
rules — stands exactly as written, and the register's own remaining red rows are recorded at `§13.6`.**

**⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, THE REGISTER ARITHMETIC DRIFT, ANNOTATE-BESIDE
(`RCA-8(c)`): THE SUBSECTION AND THE SECOND AMENDMENT'S BLOCK ABOVE ARE BOTH KEPT VERBATIM, AND THE `§12.5`
ARITHMETIC THEY PRINT IS SUPERSEDED BESIDE THEM — NEVER REWRITTEN IN THEM.** **THE LANDED READING OF THE REGISTER'S
ARITHMETIC IS `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101` — split `85 executed node-side + 16 named class-(b) NOT-RUN` —
so the `97` printed above (`6 + 14 + 16 + 17 + 16 + 14 + 14`, split `81 + 16`) is the FIRST amendment's FILED
declaration and `101` is the reading of record.** **TWO TERMS MOVED AND ONLY TWO: `P-TP-1` `16` → `19` (the three
LANDED outcome arms — `covered-by-another-element`, `missing-selector`, `zero-size-box`) and `P-TP-2` `14` → `15`
(the `B-12` declared-contributor-emission arm); MEASURER: THE TESTWRITER, its third/fourth remediation passes
(`§14.2`/`§14.3`).** **TWO CLAUSES OF THE SUBSECTION ARE THEREFORE FALSIFIED AT THIS HEAD, EACH NAMED SO A READER IS
NOT MISLED: *"largest single row `P-SM-2` at `17`"* — the largest row is now `P-TP-1` at `19` — and the second
amendment's *"the `97` is UNMOVED"* — the `97` was the SECOND amendment's head and the LANDING raised two declared
totals with LANDED ARMS.** **Everything else the subsection states HOLDS: the `7` rows, the ≤ `8`-row cap, the
typing (`P-IM-*`/`P-SM-*`/`P-TP-*`), no `F-` row, no `§6`/`FS-n` citation, the seed, the stop-after-5, the ≤ `100`
per-row and ≤ `400` total caps and the declared-vs-executed reporting — and the `97` is not deleted, so the pin's own
citation of THIS section is read here with both values (`§14.5`).**

### 12.6 The red set, the class descriptions and the pins — what MOVES and what does NOT

1. **§6.1 class (a)'s description is EXTENDED (not replaced) by the two new clauses:** the source/structural class
   now additionally proves *"no branch substitutes the declared list for the extended declared set"*, *"the declared
   extended set is reconciled against the emitted one"*, *"the aggregate is an AND fold by row id"*, and *"each
   contributor's verdict is printed"* — the class's own subject list (the matrix mapping, the report schema and its
   failing clause, the hit-test rules, the state-restore rules, the duplicate-id rules, the `uf_*` census floor) is
   **unmoved**.
2. **The red set gains two rows at this head (§6.2's `R-1`…`R-9` are unmoved, in order, and are NOT renumbered):**

   | # | Row | Why it FAILS at this head |
   | --- | --- | --- |
   | **`R-10`** | **ONE ROW ID CARRIED BY TWO BLOCKS AGGREGATES BY AND, AND EVERY CONTRIBUTOR'S VERDICT PRINTS** (§2.2 `E-11`, `F-14`). | **FAILS — `VERIFIED-BY-READ` at this head: no aggregation of emitted rows by row id exists anywhere in the driver** (the run filters, counts and prints the emitted rows and reconciles only the `§5.U` ids; **nothing folds two rows sharing an id into one verdict**), so the shared `UF-SETTINGS-7` would be two unlinked lines. |
   | **`R-11`** | **A DECLARED EXTENDED ROW WITH NO VERDICT IS REFUSED BY NAME — the extended counterpart of `R-1`/`R-2`** (§2.2 `E-12`, `F-13`). | **FAILS — `V-14`/`V-15`: `extendedRowsRun` is an emitted-row count (`54`) against a declared `30` and the declared extended set is never reconciled**; the two converted rows would be **declarations nothing honours** — `V-1`'s defect re-created on the extended dimension. |

3. **THE `R-10`/`R-11` ROWS ARE NEW-RED AT THIS HEAD BECAUSE THE DECLARATIONS DO NOT EXIST YET** — the clause is a
   **contract**, and the rows are red for the recorded reason, not for a failed measurement.
4. **THE KEPT-GREEN PINS ARE UNTOUCHED** — the pin's `R4.0` floor (`uf_*` row blocks ≥ `20`; `BLOCK_ENTRIES` ≥ `30`),
   `R4.1`..`R4.9`, `R5.b`, `R5.c`, `R5.d`, `R2.e` and `R6.a`/`R6.b` (§7 `X-1`, unmoved), **because the conversion
   changes no `uf_*` block, adds no `BLOCKS` key and adds no matrix row.** **One pin-side consequence is recorded
   for the TestWriter, because it is a `tests/**` act this pass may not take:** `boot_landing` and `vis_persist`
   are in **neither** the pin's `UF_NON_ROW_BLOCKS` set **nor** its `EXTENDED_ROW_BLOCKS` list at this head, so its
   row-block census (`R4.0`/`R4.1`) does not yet reach them; once converted they **are** row blocks and the
   TestWriter's re-statement must bring them into the pin's row-block scope — **the teeth kept, never relaxed**.
5. **THE TWO RE-PIN PARAGRAPHS' TEETH ARE UNMOVED** (§2.1: the `vis_persist` predicate-and-required-value sentence
   and the `boot_landing` required-value sentence): this amendment **narrows nothing** — it adds the enumerated ids
   the two re-pins are carried by, the shared-row aggregate, the extended reconciliation, and the `UNTAKEN` limb's
   honest record.

### 12.7 What this amendment OWES (the price of not minting), each with its owner

1. **THE IMPLEMENTER'S CONVERSION** — both blocks converted onto **`UF-STAGE-1`** and **`UF-SETTINGS-7`** (never a
   minted id), carrying the `§6.1` set, the printed members, the failing clause, the declared extended ids, the
   shared-row aggregate (§2.2 `E-11`) and the extended reconciliation (§2.2 `E-12`); **`vis_persist` additionally
   measures the PERSISTENCE half** (the re-derive + second read) that §2.1's existing re-pin already requires.
   **OWNER: the implementer of this unit, with its TestWriter.**
2. **THE WHOLE-EXTENDED-TABLE RECONCILIATION, AND THE NAMING OF THE EMITTED-BUT-UNDECLARED ROWS** — §2.2 `E-12`
   item 5 deliberately does not absorb it (it would refuse on rows this unit does not own and would flip the unit's
   own acceptance reading). **OWNER: a later live-driver pass / the architect, to mint or assign.**
3. **THE `UF-STAGE-1` RE-DERIVE LIMB** — recorded `UNTAKEN` (§12.1) because driving it would be a first
   measurement of an app behaviour; **if the architect wants it measured, that is a ruling, not an amendment to
   this conversion.**
4. **THE `T-1`-class TRACKER ACTS, the DONE row, the trios, the item-10d doc review and the register's
   declared-vs-executed report** — **unchanged and still owed** (§7 `X-3`, §10): **the supervisor owns the
   trackers, this amendment writes none of them**, and no DONE row is written by this pass.
5. **THE `sha256` + LINE COUNT of this file at this head** — §10 item 10's owed snapshot, taken by this amendment's
   own shell-bearing step (§12.9).

### 12.8 What did NOT change, restated because an amendment invites an over-read

**`MATRIX_ROWS` stays `8` with ids `U-1`..`U-8` and `summary.total` stays `8`; the `uf_*` census floor is untouched;
the scope is unmoved** — this unit **does not fix the app, does not seed a corpus, does not own `GAP-8`'s fixture
route, and makes no foundation handoff** (§1.3/§1.4, §9 `T-3`/`T-4`, §9 `E-4`); **the citation discipline is
unmoved** — **no line number appears anywhere in this file**, and every new figure is labelled `VERIFIED-BY-READ`
with its reader (the SpecDoc, `V-11`…`V-15`) or `RECORDED READING` with its measurer (the live-scenario runner for
the `54` and the last battery's shape); **and the register's hard limits are unmoved** (§12.5).

### 12.9 The snapshot this file owes — `§10` item 10 at this head

**⟨`2026-09-29` — THE OWED `sha256` AND LINE COUNT, taken by this amendment's shell-bearing step; the instrument is
named as the filed text requires.⟩** **The figures are recorded in the amendment's own delivery note and are NOT
self-referential here** — a file that must print its own digest cannot contain that digest, so the reading is
**reported to the supervisor with the amendment** and belongs in the landing pass's DONE row (§7 `X-3`, §10 item
10) rather than in this file's prose. **What this file states is only the OBLIGATION and the instrument:**
`sha256sum docs/specs/unit-live-driver-verdict-integrity.md` and `wc -l docs/specs/unit-live-driver-verdict-integrity.md`,
both measured **after** this amendment's bytes are on disk.

---

## 13. THE SECOND `2026-09-29` AMENDMENT — THE LANDING PASS'S RUN READINGS APPLIED (the `extendedRowsRun` prediction
restated as a composition, the register's declared-budget semantics ruled, the per-block restore ruled against the
denied surface, and the hygiene falsifier recorded where `§6.3` `C-2` item 4 asks for it)

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED AMENDMENT BLOCK: it adds a section at the foot, it moves no
existing section, it renumbers nothing, and every existing `§`/id remains valid.** **This is the SECOND amendment to
this file; the FIRST is §12, kept verbatim and still valid except where this section says a figure of it is
SUPERSEDED — and where it does, the superseded figure is printed BESIDE the new one, never deleted.** **It is written
`ANNOTATE-BESIDE` (`RCA-8(c)`): each site it amends — §3.3's census table, §4.1, §4.2, §4.3, §6.1 class (b), §6.2's
tally block, §6.3 `C-2` item 4, §12.3 item 3 and §12.5 — KEEPS its filed text VERBATIM with the correction recorded
beside it, and **nothing in this file was rewritten to make the correction look as if it had always been there.**
**THIS PASS RAN NOTHING: no battery, no suite, no register row, no Electron boot. Its wall is read/search +
doc-write, and it holds no shell.** **Every figure below is labelled: `VERIFIED-BY-READ` with its reader (the reads
this pass actually took are `§13.1`'s `Y-1`…`Y-2`) or `RECORDED READING` with its measurer (the implementer's landing
pass, `2026-09-29`) — and the four readings the landing pass delivered are this section's spine, quoted as its
readings and never re-derived here.**⟩**
**The section's own contents, so a reader can navigate it: `§13.1` the landing readings this pass was given and the
two reads this pass took (`Y-1`…`Y-2`) · `§13.2` the `extendedRowsRun` clause restated as a composition (the `56`
prediction falsified by a measured `53`) · `§13.3` the register's declared-budget semantics and the per-row arithmetic
(`97`, split) · `§13.4` the per-block restore ruled against the denied surface · `§13.5` the class-(b) readings, each
SATISFIED or OPEN · `§13.6` the fail-state this amendment adds (`F-16`…`F-17`) · `§13.7` what this amendment OWES ·
`§13.8` what did NOT change · `§13.9` the snapshot (OWED).**

### 13.1 The landing readings this amendment records, and the two reads it took

**THE FOUR RUN READINGS, AS DELIVERED — THE IMPLEMENTER'S LANDING-PASS READINGS, `RECORDED READING` at every site
they are quoted, measurer named as *the implementer's landing pass, `2026-09-29`*, taken on the real Electron battery
on isolated ports.** **They are NOT this pass's measurements, they are NOT re-derived from one another, and no figure
here is a re-derivation of a figure in §0.1/§12.2.** **The driver they were taken against is `scripts/live-drive.mjs`
at `6658` lines (`VERIFIED-BY-READ` by this amendment: reader the SpecDoc, from the file's own terminal line; the
filed `6143` and the landing's `6658` are the same file at two heads).**

| # | The reading, in substance | Which premise it settles |
| --- | --- | --- |
| **`L-1`** | **THE FULL BATTERY RAN on isolated ports `--port=3911 --cdp-port=9341`:** `done: 100 blocks, 13 FAIL, 3 PARKED, 19 NOT-DRIVEN`, **`EXIT=1`**, and `coverage={"matrixTotal":8,"verdicts":2,"missingRows":["U-2","U-3","U-4","U-5","U-6","U-8"],"fullBattery":true}`. **The report printed `MATRIX rows (2 of 8 = summary.total)`** — **so the report NO LONGER prints `OK` at `2 of 8`.** | `§6.3` `C-2` item 1/3 (`M-1`'s invalidity is closed at its mechanism), `§13.5` items 1/3. |
| **`L-2`** | **THE REPORT SHAPE READS COMPLETE ON THE PRINTED LINES:** **`55`/`55` printed `ROW` lines carry `surface=target=assembled-renderer`** (`V-5`'s field is now PRINTED, not merely returned); **`boot_landing`'s FAIL prints its clause with `required landingAfter=false`**; **`vis_persist` reads PASS with `realInput=true gesturePath=cdp`**; **`repro_dup_para`'s FAIL carries a NON-EMPTY clause** (its empty-evidence defect closed); and **the shared row prints `SHARED rows: UF-SETTINGS-7 aggregate(row verdict)=PASS contributors=[…vis_persist=PASS …uf_settings_7=PASS]`**. | `§2.2` `E-7`/`E-8`, `§2.2` `E-11` items 1/2, `§13.5` item 2. |
| **`L-3`** | **THE EXTENDED FIGURE: `extendedRowsRun` measured `53`**, and the driver printed `EXTENDED rows (53 of 32 defined; 3 inconclusive; 22 EXTENDED-UNDECLARED)`. **The declared `32` is the conversion's own state; the run's `53` is NOT the filed prediction's `56`.** | `§12.3` item 3's prediction is FALSIFIED as a prediction (`§13.2`); `§12.2` `V-14`'s declared-count move CONFIRMED. |
| **`L-4`** | **THE SCOPED RUN**: `--block=boot_landing,vis_persist` **exits `1`** and prints `REFUSED — missing declared extended row(s): UF-SETTINGS-7`. | `§6.3` `C-2` item 3, `§2.2` `E-12` item 2 / `F-13` — **`E-12`'s refusal is exercised by a real run**. |

**The per-row accounting `§13.3` prints** — `P-IM-2` registered **`13`** arms against a declared **`14`**; `P-SM-1`
**`12`** node-side **+ `4`** class-(b) **= `16`**; `P-SM-2` **`14` + `3` = `17`**; `P-TP-2` **`12` + `2` = `14`**;
`P-TP-1` **`13` + `3` = `16`**; `P-SM-3` **`11` + `3` = `14`** — is **also** a `RECORDED READING` of the
**implementer's landing pass**, and it is the input to `§4.1`'s ruling.

| # | The read THIS amendment took | Why it decides a clause below |
| --- | --- | --- |
| **`Y-1`** | **`ROW_EXTENDED` IS A `32`-ENTRY DECLARED TABLE AT THIS HEAD** — `14` legacy `UF-*`/`user*`/`repro_*`/`toolbar_*` rows + `8` `U-EDIT-1-LIVE-<n>` rows + `8` `UF-STAGE-AT-<n>` rows + **the two unit-declared rows** (`{row:'UF-STAGE-1', block:'boot_landing'}` and `{row:'UF-SETTINGS-7', block:'vis_persist'}`), which the landing's own comment block ties to §2.2 `E-12` item 3 / §12.1 — **and `extendedRowsRun` IS `extendedVerdict.length`, where `extendedVerdict = reportRows.filter((r) => !/^U-\d+$/.test(r.row))`** (a filter on the EMITTED rows, **not** a declared-vs-verdict coverage count). **Both facts read from the driver source by this amendment.** | `§13.2`: the declared `32` is CONFIRMED as the conversion's state, and the run figure's SHAPE is the emitted-id count — which is why a fixed prediction could not survive (`§2.2` `E-12` item 1's read is re-confirmed, not replaced). |
| **`Y-2`** | **THE LANDING ADDED A PER-BLOCK ZONE RESTORE AND NOTHING FOR THE PERSISTED CLASS:** the driver now carries `ufZoneState` (the state READ AS A STATE), `ufRestoreZoneState` (a real hit-tested re-expand, reachable from `ufEnsurePaneExpanded`, which any frame-based block calls itself), and the `uf_restore_layout` hygiene block's own comment states it is *"a checkpoint, not the only restore path"* — **while `persistence_v1` still toggles the `#settings-modal [data-pane="doc-nav"][data-enabled]` toggle OFF and persists it and NO driver-side step restores it**, and `uf_panes_1` still returns `not-driven` on an absent `doc-nav` frame. **Read from the driver source by this amendment.** | `§13.4`: the zone restore lands the `H-1` clauses 1/2/3 part; the PERSISTED class is the open obligation (`§6.3` `C-2` item 4's added reading is its measured consequence). |

**What this amendment did NOT read, stated so no cell over-claims:** the FULL per-row printed output of `L-1`'s
battery (only the figures the landing delivered are quoted here); **the identity of the `3` inconclusive
declared extended rows** (`L-3` delivers the COUNT, not the ids — **`NOT RECORDED`**, and what settles it is the
run's own `EXTENDED-DECLARED-NO-VERDICT` lines or the extended reconciliation's `inconclusive=[…]` list, which name
them by construction); the identity of the **`22` emitted-undeclared ids** (`NOT RECORDED` as a list; the count is
`L-3`'s, and `EXTENDED-UNDECLARED: <id>(<block>)` lines carry them); and **which branch of `process.exitCode`**
produced `L-1`'s `EXIT=1` — the driver's own expression is `fail > 0 ? 1 : (!recon.ok || extendedRefused ? 1 : 0)`
(`VERIFIED-BY-READ` by this amendment, reader the SpecDoc), so **a `13 FAIL` battery exits `1` through the FAIL
branch whether or not the refusal branch fires**, and `L-1` alone does **not** isolate the refusal branch's own
non-zero exit. **What settles that: a run with ZERO FAIL blocks and a refused reconciliation — an owed reading
(`§13.7` item 4), stated because the contract's exit clause is about the REFUSAL, not about the fail count.**

### 13.2 THE `extendedRowsRun` CLAUSE, RESTATED AS A COMPOSITION (the `56` prediction, falsified by the measured `53`)

**THE CLAUSE AS IT NOW READS — `§12.3` item 3 is annotated at its own site and this is the CURRENT READING.**
**`extendedRowsRun` is a READING OF A RUN'S COMPOSITION, never a fixed number:** it is the count of EMITTED report
rows whose row id is not `U-<n>` (`Y-1`), so it **moves with (i) the declared extended rows whose block actually
produced a verdict, (ii) the emitted ids that are in NO declared extended structure, and (iii) whichever blocks the
run requested** — and it is **never** a declared-vs-verdict coverage figure (`§2.2` `E-12` item 1, kept). **Clauses:**

1. **THE DECLARED SHAPE IS WHAT MOVED `30` → `32`, AND IT IS CONFIRMED AT THIS HEAD.** `ROW_EXTENDED` declares
   **`32` entries** (`Y-1`: the filed `30` + `UF-STAGE-1` with `boot_landing` + `UF-SETTINGS-7` with `vis_persist`),
   so the printed line reads *"N of 32 defined"* (`L-3`'s own output). **`§12.2` `V-14`'s declared-count move is
   therefore CONFIRMED, and `§3.3`'s row for it is restated from *"derived … the next full battery settles it"* to
   this reading.**
2. **THE PREDICTED `56` IS SUPERSEDED BY THE MEASURED `53`, AND THE SUPERSEDED VALUE STAYS VISIBLE.** `RECORDED
   READING; measurer: the implementer's landing pass, the `2026-09-29` full battery` (`L-3`). **A reader meeting
   `56` anywhere in this file (§3.3's filed row, §12.3 item 3, §12.5) must read it as the FIRST amendment's DERIVED
   PREDICTION and read `53` as the reading of record.**
3. **THE MEASURED COMPOSITION, PRINTED SO THE FIGURE IS CHECKABLE RATHER THAN TRUSTED:** the run's own printed
   decomposition is **`53 of 32 defined; 3 inconclusive; 22 EXTENDED-UNDECLARED`**, which yields
   **`32` declared − `3` inconclusive = `29` declared rows that emitted, plus `22` emitted ids no declaration
   carries = `53`** — **the identity `extendedRowsRun = (verdicted declared rows) + (emitted-undeclared ids)` is
   `VERIFIED-BY-READ` of the driver's own `extendedVerdict` filter (`Y-1`), and the three counts are `L-3`'s.**
4. **WHAT THE PREDICTION GOT RIGHT, RECORDED SO THE FALSIFICATION IS NOT OVER-READ:** *"`boot_landing` and
   `vis_persist` each contribute exactly ONE report row after conversion"* **HELD** — both ids appear among the `29`
   verdicted declared rows (`L-2`/`L-4` name them by block and id), **and the `53`-vs-`56` difference is NOT a
   conversion failure**: it is the prediction's other premise, *"no other block's contribution changes"*, that is
   false in a real full battery (the emission set is not fixed: `3` declared rows produced nothing in this run, and
   `22` emitted ids are un-declared — `L-3`). **`F-13`'s refusal is nevertheless NOT triggered by the `3`
   inconclusive rows: they are declared rows outside the unit's two, whose standing `§2.2` `E-12` item 5 keeps as
   REPORTED, never refusing.**
5. **NO OTHER FIGURE OF §12.3's ITEM SET MOVES:** item 1 (`MATRIX_ROWS` `8`, `summary.total` `8`, no new `BLOCKS`
   key/flag/§5.U slot/second surface object), item 2 (the converted rows are extended-dimension only, so
   `summary.pass`/`fail`/`parked` are untouched), item 4 (the EXTENDED line names each converted row id with its
   block, `30` → `32`, and *"must not be read as a coverage figure"*) and item 5 (the summary partition rule) are
   **all CONFIRMED or unmoved**; **only item 3's `56` is superseded.**

### 13.3 THE REGISTER'S DECLARED-BUDGET SEMANTICS, RULED — WITH THE ARITHMETIC RE-PRINTED AS A SPLIT

**The ruling is stated at its contracted site (`§4.1`'s added block) with `§4.3`'s item-2 discharge beside it; it is
re-printed here as the arithmetic, because the landing's remaining red rows are all register rows and a TestWriter
deriving them needs the split in one place.**

**THE SEMANTICS SENTENCE AS WRITTEN (contract text):** *"**a register row's DECLARED total = its EXECUTED node-side
attempts + its EXPLICITLY-NAMED class-(b) NOT-RUN arms**; **every not-run class-(b) arm is NAMED with its reason**
(the driver cannot be IMPORTED — `§0.2` `V-10` — and **no node row may drive Electron** — `§3.4`); **the row's `held`
verdict requires `executed + namedUnrun === declared` EXACTLY, and any UNNAMED shortfall is `broken`**; and **a
declared arm that cannot be constructed as a falsifiable arm is a FINDING, never a silent drop**."*

**THE PER-ROW READING, the declared total split by its terms — `RECORDED READING; measurer: the implementer's
landing pass` (`§13.1`), with the declared totals themselves `VERIFIED-BY-READ` by this amendment off `§4.2`'s table:**

| Row | Declared total (`§4.2`, unmoved) | Executed node-side arms | Named class-(b) NOT-RUN arms | The relation the ruling requires |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **`6`** (`1+1+1+1+1+1`) | **`6`** | **`0`** | `6 + 0 = 6` — **complete** |
| **`P-IM-2`** | **`14`** (`8+1+1+1+1+1+1`) | **`13`** | **`1`** | `13 + 1 = 14` — **complete; the `1` is the printed-line arm, class (b)** |
| **`P-SM-1`** | **`16`** (`6*2+4`) | **`12`** | **`4`** | `12 + 4 = 16` — **complete** |
| **`P-SM-2`** | **`17`** (`7*2+2+1`) | **`14`** | **`3`** | `14 + 3 = 17` — **complete** |
| **`P-TP-1`** | **`16`** (`7*2+2`) | **`13`** | **`3`** | `13 + 3 = 16` — **complete** |
| **`P-TP-1`** ⟪ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`: the row above is the SECOND amendment's FILED reading and is KEPT; THIS is the LANDED one⟫ | **`19`** (`7 + 6 + 3 + 3`) | **`16`** | **`3`** | `16 + 3 = 19` — **complete; the `+3` over the filed `13` is the three LANDED outcome arms (`covered-by-another-element` / `missing-selector` / `zero-size-box`) and the row is now the LARGEST single row of the register at `19`** |
| **`P-TP-2`** | **`14`** (`6*2+2`) | **`12`** | **`2`** | `12 + 2 = 14` — **complete** |
| **`P-TP-2`** ⟪ANNOTATED `2026-09-29` (`§14`) — `C-9`: the row above is the FILED reading and is KEPT; THIS is the LANDED one⟫ | **`15`** (`5 + 5 + 2 + 1 + 2`) | **`13`** | **`2`** | `13 + 2 = 15` — **complete; the `+1` over the filed `12` is the `B-12` declared-contributor-emission arm** |
| **`P-SM-3`** | **`14`** (`4*2+3+3`) | **`11`** | **`3`** | `11 + 3 = 14` — **complete** |
| **TOTAL** | **`97`** | **`81`** | **`16`** | **`81 + 16 = 97` — the `97` of `§4.2`/`§12.5`, UNMOVED** |
| **TOTAL** ⟪ANNOTATED `2026-09-29` (`§14`) — `C-9`: the row above is the FILED reading and is KEPT VISIBLE; THIS is the LANDED one⟫ | **`101`** | **`85`** | **`16`** | **`85 + 16 = 101` — the landed total, `= 6 + 14 + 16 + 17 + 19 + 15 + 14`; the two moved terms are `P-TP-1` (3 arms) and `P-TP-2` (1 arm), **under the ≤ `400` total cap** |

**WHAT THE RULING CHANGES AND WHAT IT DOES NOT, stated so a reader does not look for a moved figure: the declared
totals are UNMOVED (`6 · 14 · 16 · 17 · 16 · 14 · 14 = 97`), the row count is UNMOVED (`7`, ≤ `8`), the caps are
UNMOVED (≤ `100`/row · ≤ `400` total · stop-after-5), the seed is UNMOVED (`0x20260929`), and the strategy ids are
UNMOVED.** **What moves is the READING: a register row's report must print `declared = executed + named class-(b)`,
each class-(b) arm NAMED with `V-10`/`§3.4` as its reason, and a row whose two arms fall short of its declared total
by even one arm is `broken`.**
**AND THE HONEST LIMIT, because the six red rows are the point: `executed + namedUnrun === declared` is a FULL
ACCOUNTING of the declared budget, NOT a claim that the executed arms PASSED.** **A row may satisfy the identity and
still be `broken` for a counterexample** (§4.1's `held` is the conjunction), **and a class-(b) arm counts as NAMED —
never as executed, and never as a behavioural PASS** (§4.3's added block; `§13.5`'s readings carry the behavioural
terms).

**⟨ANNOTATED `2026-09-29` BY THE THIRD AMENDMENT (`§14`) — `C-9`, THE REGISTER ARITHMETIC DRIFT, ANNOTATE-BESIDE
(`RCA-8(c)`): THE TWO PARAGRAPHS ABOVE ARE KEPT VERBATIM, AND ONE CLAUSE OF THE FIRST OF THEM IS NOW FALSE OF THE
LANDED HEAD.** **Its sentence *"the declared totals are UNMOVED (`6 · 14 · 16 · 17 · 16 · 14 · 14 = 97`)"* is the
SECOND amendment's reading; THE LANDED READING IS `6 · 14 · 16 · 17 · 19 · 15 · 14 = 101` (split `85 + 16`), and the
two moved terms are `P-TP-1` (`16` → `19`) and `P-TP-2` (`14` → `15`), each annotated AT ITS OWN ROW in the table
above.** **Everything else the two paragraphs state HOLDS and is re-affirmed here because a reader will check it
against the landing: the row count (`7`, ≤ `8`), the caps (≤ `100`/row — the largest row is `19` — ≤ `400` total,
stop-after-5), the seed (`0x20260929`) and the strategy ids are unmoved; what the RULING changes is still only the
READING (a row must print `declared = executed + named class-(b)`, each class-(b) arm NAMED); and
`executed + namedUnrun === declared` is still a FULL ACCOUNTING and never a claim that the executed arms PASSED.**
**THE IDENTITY IS NOW DISCHARGED PER ROW AND IN TOTAL ON THE LANDED SPLIT — `6+0 · 13+1 · 12+4 · 14+3 · 16+3 ·
13+2 · 11+3`, i.e. `85 executed + 16 named class-(b) NOT-RUN === 101 declared` — and a declared total may move in
EITHER direction ONLY with LANDED ARMS and a DATED AMENDMENT (`§14.4`).**

### 13.4 THE PER-BLOCK RESTORE vs THE DENIED SURFACE, RULED — AND THE IMPLEMENTER'S *"DENIED"* READING, ANNOTATED

**THE IMPLEMENTER'S READING, RECORDED AS THE READING IT WAS (ANNOTATE-BESIDE, `RCA-8(c)`; it is SUPERSEDED by the
ruling below and it is NOT deleted):** *the `§2.3` `H-1`/`H-2` clause — the driver's own mutable state READ AS A
STATE and RESTORED reachable per block — was reported UNREACHABLE **"because the restore requires a new `BLOCKS` key,
which `§1.3`/`D-5` deny"*** (`RECORDED READING; measurer: the implementer's landing pass`). **The measured
consequence of that reading is `§13.1` `L-1`/`§6.3` `C-2` item 4's reading: the persisted `doc-nav` OFF state is still
not restored, and `uf_panes_1` reads PASS alone and `NOT-DRIVEN` in battery order.**

**THE RULING:**

1. **A PER-BLOCK PRE-FLIGHT RESTORE INSIDE THE DRIVER'S OWN BLOCK-RUNNER IS PERMITTED — AND IT IS WHAT THE CLAUSE
   REQUIRES.** The restore is a step the block-runner (or a frame-based block) takes **before** it measures, in the
   driver's own code path. **It is NOT a `BLOCKS` key, NOT a `§5.U` slot, NOT a flag, and NOT a new live assertion
   about the app** — so nothing in this unit's denial list reaches it.
2. **THE DENIAL'S TEXT IS READ EXACTLY, SO THE PERMISSION IS UNAMBIGUOUS — what `§1.3` denies is *"no new `BLOCKS`
   key"* (its `MATRIX_ROWS`' row-set bullet) and the APP SURFACE (`src/**`, the fixture route, `package.json`, the
   design skills, `MATRIX_ROWS`' ids/rows, the divergence leg), and `§8` `D-5` denies *"no new `§5.U` slot, no new
   block, no new flag required to make a verdict readable"***. **A restore helper that reads a state and re-expands /
   re-enables it is none of those: it is a RESTORE PATH, not a scenario, and it adds no verdict and no row.** **The
   Implementer's reading conflated *"a new `BLOCKS` key that performs the restore"* with *"a restoring step"*, and it
   is the CONFLATION that is superseded — not the denial, which stands unchanged (`§1.3`'s other entries are
   untouched by this amendment).**
3. **THE CLAUSE IS SATISFIED ON THE ZONE HALF AND OPEN ON THE PERSISTED HALF — recorded split, because a reader
   will ask which:** the landing added the state-as-a-state read (`ufZoneState`) and a real hit-tested per-block
   re-expand (`ufRestoreZoneState`, reachable from `ufEnsurePaneExpanded`; `Y-2`) — which discharges `H-1` clauses
   1/2/3 for `zone:left` — **while the PERSISTED class that `P-SM-2` names (`doc-nav` enabled OFF and persisted by
   `persistence_v1`) still has NO restoring step**, and that is `§13.7`'s open obligation.
4. **WHERE A STATE IS GENUINELY NOT RESTORABLE, THE ROW REPORTS `NOT-DRIVEN` WITH THE PRECONDITION NAMED — never a
   silent FAIL and never an app FAIL** (`§2.3` `H-3`/`H-4`; `RCA-11` clause (b): a park/not-driven with a recorded
   reason, never parked-by-default). **`L-1`'s `uf_panes_1` reading is the clause working as contracted**: the row
   reports the driver's own state as its reason (`no doc-nav pane frame rendered; frames=[search]`) and the app is
   **not** credited with a FAIL for it. **But `NOT-DRIVEN` is the HONEST FALLBACK, not the FIX** — the row's
   verdict must agree with its isolated verdict once the restore exists (`§2.3` `H-1` clause 4), and **a battery whose
   rows' verdicts depend on their position must be re-measurable alone with agreeing readings.**
5. **NO VERDICT IS PROMOTED BY THE RESTORE EITHER.** A restored state does not turn a `NOT-DRIVEN` into a PASS; it
   makes the row **drivable**, and the row then carries its own honest verdict (`§2.3` `H-5`).

### 13.5 THE CLASS-(b) READINGS THE LANDING TOOK — each marked SATISFIED or OPEN against `§6.1` class (b)'s own clause

**Measurer for every reading in this table: the implementer's landing pass, `2026-09-29` (the invocation, the
isolated ports `--port=3911 --cdp-port=9341` and the exit code are `L-1`'s; the two `--block=` commands are quoted at
`§6.3` `C-2` item 4's added block).** **These are the unit's acceptance readings, carried here as RECORDED READINGS —
this pass measured none of them.**

| # | The reading | Contract clause it answers | Status at this head |
| --- | --- | --- | --- |
| **1** | **THE MATRIX AT `2 of 8` NO LONGER PRINTS `OK`:** `coverage={"matrixTotal":8,"verdicts":2,"missingRows":["U-2","U-3","U-4","U-5","U-6","U-8"],"fullBattery":true}`, `MATRIX rows (2 of 8 = summary.total)`, and the reconciliation line reads **`REFUSED — missing declared row(s): U-2, U-3, U-4, U-5, U-6, U-8`**. | `§2.1` `E-3` clauses 1/2 (the set difference is real, the refusal names the rows, `OK` is never printed beside a shortfall); `F-1`/`F-2`; `§8` `D-1`. | **SATISFIED on the refusal/shape limb — `M-1`'s invalidity is closed at its mechanism.** **`§6.3` `C-2` item 1 permits EITHER reading explicitly** (*"the matrix must report `8 of 8` executed … **or** the run must print `REFUSED` naming the rows it lacks"*), **so the `REFUSED` reading is a PERMITTED reading and is NOT a falsification of the unit** — **the falsifier `C-2` item 1 names (`OK` printed while `matrixRowsExecuted < 8`) did NOT occur.** **The `8 of 8` limb itself is OPEN**: the run reads `2 of 8`, i.e. **six declared `§5.U` rows carry no verdict in a full-battery run**, and their cause is `V-1`'s (the declared mapping is not honoured by the blocks), **which this unit's clause set does not fix** (`§13.7` item 1). **`§7` `X-1`'s `R2.e`-class re-statement work is not what is owed here; the mapping-to-block emission is.** **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the cell is KEPT VERBATIM) — THE `8 of 8` LIMB IS SUPERSEDED IN THE FAVOURABLE DIRECTION, and the `REFUSED` reading above is not what the landed head prints: the landed full battery reads `MATRIX rows (8 of 8 = summary.total)` with the reconciliation line `OK (full battery: 8 of 8 declared rows verdicted)` beside `"pass":5,"fail":1,"parked":2,"matrixRowsExecuted":8` (`§15.2` `C-2` — `closed-and-live-proven`; the readings are the implementer's round-3 landing and the blind gate-5 run's own `G-6`, each quoted at its site with its measurer). `C-2` item 1 permits EITHER reading, so nothing here is falsified; the `2 of 8` reading is this cell's own pass's.**⟩** |
| **2** | **THE REPORT SHAPE:** `55`/`55` printed `ROW` lines carry `surface=target=assembled-renderer`; `boot_landing`'s FAIL prints `required landingAfter=false`; `vis_persist` reads PASS with `realInput=true gesturePath=cdp`; `repro_dup_para`'s FAIL carries a non-empty clause; the shared row prints `SHARED rows: UF-SETTINGS-7 aggregate(row verdict)=PASS contributors=[…vis_persist=PASS …uf_settings_7=PASS]`. | `§2.2` `E-6`/`E-7`/`E-8` (the printed members, the failing clause, `surface.target`), `§2.2` `E-9` (the proven path), `§2.2` `E-11` items 1/2 (each contributor's verdict + the AND aggregate). | **SATISFIED** — including the two rows `M-3`/`M-5` measured as clause-less non-row blocks, and the shared-row aggregate `R-10` declared at this head. **`E-11`'s DISAGREEMENT case (`F-14`) is not exercised by this run** (both halves read PASS) — no reading of the `FAIL` aggregate exists yet. |
| **3** | **A SCOPED RUN IS LOUD:** `--block=boot_landing,vis_persist` exits **`1`** and prints `REFUSED — missing declared extended row(s): UF-SETTINGS-7`. | `§2.2` `E-12` item 2 / `§12.4` `F-13`; `§6.3` `C-2` item 3. | **SATISFIED** — and it is the FIRST real exercise of the extended refusal: the pair requested `UF-SETTINGS-7`'s declaring block `vis_persist` but the sibling half `uf_settings_7` was **out of scope**, **so the run's refusal is the honest reading of *"a requested declared row produced no verdict"*.** **`§12.4` `F-13`'s exact sentence expects the refusal for a row whose REQUESTED blocks produced nothing; here the requested set produced the row's OTHER half only** — recorded as the sharpest available reading, and the sharper two-block case (`--block=uf_settings_7` alone) is owed (`§13.7` item 3). **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the cell is KEPT VERBATIM) — THIS `SATISFIED` MARKING IS **WITHDRAWN**: the scoped-refusal reading does not reproduce at the landed head (both contributors emit the row id; `REFUSED` occurs in no invocation; the exit `1` is the `fail > 0` branch), and `§13.7` item 3 is UNANSWERABLE from the `--block=` space. THE WITHDRAWAL, ITS THREE GROUNDS AND ITS LIMITS ARE `§15.3.1`'s; this note is the pointer the section's head block promises at this site.**⟩** |
| **4** | **THE HYGIENE**: `--block=uf_panes_1` ISOLATED **PASS** vs the SAME row in the full battery **`NOT-DRIVEN`** (`no doc-nav pane frame rendered; frames=[search]`), caused by `persistence_v1` persisting `doc-nav` OFF with no driver-side restore. | `§2.3` `H-1` clause 4 (the two readings must agree once the hygiene holds); `§6.3` `C-2` item 4's own falsifier (`LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`). | **OPEN — the falsifier is CONFIRMED BY A RUN.** The two readings DISAGREE, so the clause is not met; the driver's `NOT-DRIVEN` classification is honest (`§2.3` `H-4`), and the restore the clause requires is `§13.4`'s ruling with its obligation at `§13.7` item 2. **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the cell is KEPT VERBATIM) — THIS `OPEN` STATUS IS SUPERSEDED BY A LANDED GREEN: the third remedy round chose the sanctioned per-block restore and ALL FOUR scoped readings now AGREE with the full battery (`uf_panes_1=PASS`, `uf_settings_7=PASS`, in both orders — `§15.2` `B-1`/`B-2`, `closed-and-live-proven`), and `C-8` closed with the isolated `--block=uf_panes_8`/`--block=uf_panes_10` readings agreeing with their full-battery verdicts (`§15.2` `C-8`). Measurer of those readings: the implementer's round-3 pass, as recorded at `§15.2` and in `docs/next-steps.md`'s gate-cycle block; NOT re-measured by this pass (no shell). The filed falsifier reading stands as its pass's reading.**⟩** |
| **5** | **THE EXIT CODE:** `EXIT=1` on `L-1`'s battery. | `§2.1` `E-3` clause 2 / `§2.2` `E-12` item 2 (non-zero exit on a refusal). | **SATISFIED as a reading, INCONCLUSIVE as a proof** — the driver's expression exits `1` on a FAIL count FIRST (`fail > 0`), so this reading does not isolate the refusal branch (§13.1's `NOT RECORDED` note; owed reading at `§13.7` item 4). **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the cell is KEPT VERBATIM) — unchanged as a reading; what moved is the DISPOSITION of the scoped-run half it points at: `§15.3.1` item 3 records that a scoped run's exit cannot isolate the refusal branch because `REFUSED` occurs in no scoped invocation, so the isolation is owed from the FULL-battery space instead, and `§13.7` item 4 is recorded UNANSWERABLE FROM THE `--block=` SPACE (`§15.3.2`). The `fail > 0` expression the cell quotes is `VERIFIED-BY-READ` and unmoved.**⟩** |
| **6** | **`extendedRowsRun` `53` with `32` declared, `3` inconclusive, `22` EXTENDED-UNDECLARED.`** | `§2.2` `E-12` item 1/5 (`F-15`'s reported-not-refusing case), `§13.2`. | **SATISFIED as a reading of the composition** (§13.2 items 1–3): the declared `32` is confirmed, the undeclared emissions are REPORTED and do not refuse, and the `56` prediction is superseded. **The inconclusive rows' IDS and the undeclared ids' LIST are `NOT RECORDED` here** (§13.1). **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the cell is KEPT VERBATIM) — the `53` is ONE RUN'S composition and not a fixed figure (this file's `§13.2` says so): the gate-5 blind run read `extendedRowsRun` = `55` with `55 of 32 defined; 3 declared row(s) produced NO verdict and are inconclusive; 24 emitted id(s) are UNDECLARED` (RECORDED READING; measurer: the blind-test writer, `docs/specs/unit-live-driver-verdict-integrity-greens.md` §4.2 `G-15`/§4.5 `D-6`), and the pin's `P-SM-3` class-(b) arm still prints the stale `predicted 54 → 56` (`§13.7` item 5 — re-read by this pass in `tests/live-drive-contract.test.ts`). THE CURRENT HEAD'S FIGURE IS **NOT MEASURED** BY THIS PASS (`NOT MEASURED`; no shell in its wall — see `§16.6`).**⟩** |

### 13.6 The fail-states this amendment adds (`F-16`…`F-17`, appended — `F-1`…`F-15` are unmoved)

**`F-1`…`F-12` are the filed enumeration (§3.2) and `F-13`…`F-15` are the FIRST amendment's (§12.4) — the two
tables are unmoved, and with this section's two rows the enumeration stands at `F-1`…`F-17`, a TestWriter
enumerating the set reading §3.2 + §12.4 + this subsection together.**

| # | Fail-state | Trigger | Contracted observable | Exit / verdict treatment |
| --- | --- | --- | --- | --- |
| **F-16** | **AN UNRESTORED PERSISTED STATE THAT CHANGES A LATER ROW'S VERDICT (the `H-1` clause-4 counterpart of `F-5`)** | a block flips a PERSISTED state (the `#settings-modal [data-pane][data-enabled]` toggle) and no later restore path returns it, so a frame-based row reports `NOT-DRIVEN`/`absent` where its isolated run reports a real verdict | the row's evidence NAMES the state it started from and the driver's own reason; the report shows the position dependence; **the isolated (`--block=<row>`) and full-battery verdicts are printed for comparison** | a **review finding** against the run while the two readings disagree; **never an app FAIL** (`§2.3` `H-3`/`H-4`); the restore is a permitted per-block step (`§13.4`) |
| **F-17** | **A REGISTER ROW WHOSE DECLARED BUDGET IS NOT FULLY ACCOUNTED — the shortfall OR the silent drop** | (i) a row reports `executed + namedUnrun < declared` with no reason for the difference; (ii) a class-(b) arm is NOT-RUN without `V-10`/`§3.4` named; (iii) a declared arm is neither executed nor named-NOT-RUN, or the declared total is LOWERED to match what ran | the row's report prints `declared = executed + named class-(b)`, each class-(b) arm with its reason, and the shortfall by count; **the missing terms are FINDINGS** | row reads **`broken`**; the finding is against the register (`§4.1`'s added ruling items 1–3, `§4.3` item 4), **and the red set's remaining register rows are its acceptance set** (§6.2's added block: the landing reported `6` red rows, all register rows) |

### 13.7 What this amendment OWES (each with its owner)

1. **THE `2 of 8` MATRIX COVERAGE — NAMED AS OWED AND NOT ABSORBED.** `L-1`'s full battery reports `U-1` and `U-7`
   verdicted and `U-2`…`U-6`, `U-8` not, **so the `E-3` refusal limb is exercised but the `8 of 8` reading is not
   reached.** **This amendment does NOT widen the unit to make the six rows emit** (that is a mapping-to-emission
   change across blocks this unit may only re-pin, `§2.1` `E-5`; and the honest reading `V-1` supplies is that the
   blocks emit checklist ids, not matrix ids). **OWNER: the architect / the next live-driver pass, to rule whether
   the block-to-`U-<n>` emission is re-derived or the matrix declaration is re-pinned — with `MATRIX_ROWS`'
   8-row/8-id shape unmoved either way.** **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the filed
   item is KEPT VERBATIM) — THIS OWED READING HAS LANDED: the landed full battery reads `MATRIX rows (8 of 8 =
   summary.total)` with `OK (full battery: 8 of 8 declared rows verdicted)` (`§15.2` `C-2`'s `closed-and-live-proven`
   row; RECORDED READINGS — measurer: the implementer's round-3 landing, corroborated by the blind gate-5 run's own
   `G-6`, `docs/specs/unit-live-driver-verdict-integrity-greens.md` §4.2). `MATRIX_ROWS`' 8-row/8-id shape is unmoved,
   as this item requires.**⟩**
2. **THE PERSISTED-CLASS RESTORE (`P-SM-2`'s named case).** `§13.4` rules that the per-block pre-flight restore is
   permitted; **the landing did the `zone:left` half and not the persisted `doc-nav` half** (`Y-2`), and `F-16`'s
   falsifier is confirmed by a real run (`§13.5` item 4). **OWNER: the implementer of this unit, with its TestWriter
   — a restoring step in the driver's own block-runner, no `BLOCKS` key, no flag, no new app assertion.** **⟨ANNOTATED
   `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the filed item is KEPT VERBATIM) — LANDED, ON THE SANCTIONED
   PATH THIS ITEM NAMES: `B-1`'s round-3 closure chose the per-block restore (no new `BLOCKS` key, no flag, no app
   assertion) and all four scoped readings agree with the full battery (`§15.2` `B-1`/`B-2`), with `C-8`'s
   isolated-vs-battery agreement recorded at `§15.2` `C-8`.**⟩**
3. **THE SHARPER EXTENDED-REFUSAL READING.** `§13.5` item 3's scoped run refused `UF-SETTINGS-7` while its
   `vis_persist` half was IN scope; **the two-block isolation (`--block=uf_settings_7` alone, and
   `--block=boot_landing` alone) is owed** so `F-13`'s exact sentence has a reading that isolates one declaring
   block. **OWNER: the landing/next live pass.** **⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the filed
   item is KEPT VERBATIM) — THIS ITEM IS **UNANSWERABLE FROM THE `--block=` SPACE**, not merely owed: with `§13.5`
   item 3's reading withdrawn, no scoped invocation of record produces `REFUSED`, so the isolation this item asks
   for has no admissible expected output under `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`. `§15.3.2` owns that
   reading and its owner; the item stays OWED with the reason recorded.**⟩**
4. **THE REFUSAL-BRANCH EXIT READING.** A run with **zero FAIL blocks and a refused reconciliation** is owed to
   isolate `process.exitCode`'s refusal branch from its `fail > 0` branch (§13.1). **OWNER: the next live pass.**
5. **THE TESTWRITER'S RE-STATEMENT OF THE ONE STALE CLASS-(b) TERM.** The pin's class-(b) arm for `P-SM-3`
   reads *"the real FULL battery's `extendedRowsRun` (predicted 54 → 56)"*; **the reading of record is `53`**
   (§13.2). **OWNER: the TestWriter (the file is `tests/**` and this pass may not write it)** — **the teeth are
   unchanged: the arm stays class (b), NOT-RUN in node, and the re-statement must print the superseded prediction
   beside the measured reading (`HARNESS-ENABLEMENT-AND-BOOT-READINESS` clause (v), never a relaxation).**
6. **THE `T-1`-CLASS TRACKER ACTS, THE DONE ROW, THE DOC-REVIEW AND THE `E-4`/`T-2` REPORT** — unchanged and still
   owed (§7 `X-3`, §10); **this amendment writes no tracker row and no DONE row.** **And the `sha256` + line count
   §13.9 states as owed.** **OWNER: the supervisor / the landing pass's shell-bearing step.**

### 13.8 What did NOT change, restated because a SECOND amendment invites a wider over-read

**`MATRIX_ROWS` stays `8` with ids `U-1`..`U-8`; `summary.total` stays `8`; `MATRIX_ROWS`' row count is `8` in
`§0.3` and `§3.3`'s census rows and is unmoved; the register keeps `7` rows with `P-IM-*`/`P-SM-*`/`P-TP-*` typing,
no `F-` row and no `§6`/`FS-n` citation; the `97` total, the seed, the stop-after-5 and the row caps are unmoved;
**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the filed sentence above is KEPT VERBATIM and NOT
rewritten) — THE `97` PRINTED HERE IS THE SECOND AMENDMENT'S FILED TOTAL AND THE READING OF RECORD IS `101`: the
LANDED arithmetic is `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side + 16 named class-(b) NOT-RUN`
(third amendment `§14.2`/`§14.3`, `RECORDED READING; measurer: the TestWriter` off the landed pin). **THIS SITE WAS
NOT AMONG THE FOUR `§14.2` ENUMERATES as annotated, so this note closes that gap: a reader of `§13.8` must derive any
row's budget from `§14.2`'s landed line, not from this sentence's `97`.** What DOES stand unmoved, exactly as this
sentence says: the seed (`0x20260929`), the stop-after-5 rule, the row caps (≤ `100`/row — the largest row is `19` —
and ≤ `400` total), the `7`-row count, the typing and the no-`F-`-row rule.**⟩**
`§1.3`'s denial list is untouched except where `§13.4` reads its text to show the restore is not inside it; and no
kept-green pin is weakened** — **`R5.b`, `R5.c`, `R6.a`, `R6.b`, the `R4.0` floor and `R4.1`…`R4.9` keep their
teeth, and `R2.e`/the pin's class-(b) term are re-stated only by the TestWriter, never relaxed** (§7 `X-1`).
**The scope is unmoved**: this unit still fixes the INSTRUMENT, never the app; it still seeds no corpus, owns no
fixture route, makes no foundation handoff, and its layer is `[D]` — **a green here proves the driver's reporting
integrity, never app behaviour, and `L-1`'s `13 FAIL`/`3 PARKED`/`19 NOT-DRIVEN` line is a driver reading, not an
app verdict (`RCA-12`).** **The citation discipline is unmoved: no line number appears anywhere in this file, every
new figure is labelled `VERIFIED-BY-READ` with its reader (`Y-1`/`Y-2`) or `RECORDED READING` with its measurer (the
implementer's landing pass), and where the landing was silent the cell says `NOT RECORDED` and names what settles
it (§13.1).**

### 13.9 The snapshot this file owes — `§10` item 10 at this head

**⟨`2026-09-29` — THE OWED `sha256` AND LINE COUNT AFTER THE SECOND AMENDMENT'S BYTES: `OWED`.** **This pass holds
no shell (its wall is read/search + doc-write), so it takes neither figure, and — exactly as §12.9 already states for
the first amendment — a file cannot contain its own digest.** **What this file states is the OBLIGATION and the
instrument only:** `sha256sum docs/specs/unit-live-driver-verdict-integrity.md` and `wc -l
docs/specs/unit-live-driver-verdict-integrity.md`, **both to be taken AFTER this section's bytes are on disk by a
shell-bearing pass, which must also STATE the instrument it used.** **The figures belong in the landing pass's DONE
row (§7 `X-3`, §10 item 10) and in the delivery note to the supervisor, never invented here.** **The FILED snapshot
this amendment supersedes is stated with its own measurer and is NOT rewritten:** the first amendment's reading was
**`1062` lines, `sha256 2bca4e59fae194ac9126ceba648046c84004fa376f13eeb3f63e7fcbeadba3c0`** (`RECORDED READING;
measurer: the `docs/next-steps.md` gate-2 reading pass`) — **that was the head BEFORE this amendment's insertions,
and the new pair is OWED.**

---

## 14. THE THIRD `2026-09-29` AMENDMENT — `C-9`, THE REGISTER ARITHMETIC DRIFT: THE REGISTER'S ARITHMETIC RE-STATED AS
THE LANDING READ IT, WITH THE FILED `97` KEPT VISIBLE BESIDE THE LANDED `101`, AND THE `F-17` RULING-CONSISTENCY
POINT RECORDED

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED AMENDMENT BLOCK: it adds a section at the foot, it moves no
existing section, it renumbers nothing, and every existing `§`/id/citation remains valid.** **It is written
`ANNOTATE-BESIDE` (`RCA-8(c)`): the four sites it amends — `§3.3`'s census table · `§4.2` (the `P-TP-1` row, the
`P-TP-2` row, the arithmetic line and the second amendment's *"no figure moves"* block) · `§12.5` · `§13.3` (the
per-row table, its `TOTAL` row and its *"the declared totals are UNMOVED"* paragraph) — each KEEPS its filed text
VERBATIM with the amendment recorded BESIDE it, and **nothing in this file was rewritten to make the correction look
as if it had always been there.** **THIS PASS RAN NOTHING: no shell, no suite, no register row, no battery, no
Electron boot. Its wall is read/search + doc-write.** **Every figure below is labelled: `RECORDED READING` with its
measurer (the TestWriter, taken off the landed pin) or `VERIFIED-BY-READ` with its reader (the reads this pass
actually took, named at `§14.1`); where the records were silent the cell says `NOT RECORDED`.** **THE CITATION
DISCIPLINE IS UNMOVED: NO LINE NUMBER APPEARS ANYWHERE IN THIS FILE — every citation here is a `path` + a symbol / a
block name / a row id / a `§section`.**
**The section's own contents: `§14.1` the landed pin identity this amendment's figures are read off (the
`RECORDED READING` and the reads) · `§14.2` the arithmetic, the `TALLY` line and the per-row split as the pin prints
them · `§14.3` the two terms that MOVED, WHY each moved and WHO moved it · `§14.4` THE RULING-CONSISTENCY POINT
(`F-17` is **NOT** tripped) and the rule for a declared total that moves · `§14.5` the pin-side citation consequence
and its owner (a SAME-ROUND act) · `§14.6` what this pass FOUND BY READ that contradicts the finding as stated (`SIX`
items, each labelled, including one claim this pass WITHDREW) ·
`§14.7` what did NOT change · `§14.8` what this amendment OWES · `§14.9` the snapshot (OWED).**

### 14.1 The authority for every number here: the landed pin, labelled `RECORDED READING`

| # | The figure, in substance | The label and its measurer |
| --- | --- | --- |
| **`Z-1`** | **`tests/live-drive-contract.test.ts` = `5167` lines, `md5 34c12434aa6818fa77855d7859bf48fd`.** | **`RECORDED READING; measurer: the TestWriter`** — the landed pin at this head, and **the authority for every number in this section**. |
| **`Z-2`** | **THE PIN'S OWN EXECUTION AT ITS LANDING: `74` `it()` assertions PASS.** | **`RECORDED READING; measurer: the TestWriter`.** **The register's seven `P-` assertions are part of that `74` and read `held`; the three STAGED `R-13` rows (`C-6`/`C-7`/`C-8`) are the pin's own INTENDED RED set at this head (`owner: the next driver pass`) and are counted by NO register row** — so `101` is the register's declared budget, **never** the pass count (`§14.1` read `Z-1`). |
| **`Z-3`** | **THE DECLARED ARITHMETIC IS `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`, AND THE ACCOUNTING SPLIT IS `85` executed node-side `+ 16` named class-(b) NOT-RUN.** | **`RECORDED READING; measurer: the TestWriter`.** |
| **`Z-4`** | **THE PIN PRINTS ITS `TALLY` LINE AS: `declared 6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 attempt(s)`**, with the same `it` asserting the executed-plus-class-(b) sum `=== 101`. | **`RECORDED READING; measurer: the TestWriter`**; **`VERIFIED-BY-READ` by this pass** (reader: the SpecDoc) **as the pin's printed string and its two `101` assertions.** |
| **`Z-5`** | **EACH MOVED ROW'S DECLARED FACTOR STRING AS THE PIN PRINTS IT:** `P-TP-1` `7 + 6 + 3 + 3` `= 19` · `P-TP-2` `5 + 5 + 2 + 1 + 2` `= 15` · `P-IM-1` `1 + 1 + 1 + 1 + 1 + 1 + 0 = 6` · `P-IM-2` `8 + 4 + 1 + 1 = 14` · `P-SM-1` `12 + 4 = 16` · `P-SM-2` `14 + 3 = 17` · `P-SM-3` `4*2 + 3 + 3 = 14`. | **`RECORDED READING; measurer: the TestWriter`**; **`VERIFIED-BY-READ` by this pass** (reader: the SpecDoc). |

**NOT RECORDED, so no cell over-claims:** the pin's own FULL runner summary line (the delivered reading is *"`74`
passed"*, and **whether the runner also reports the three STAGED reds on the same line is `NOT RECORDED`** — what
settles it is the runner's own output at the landing); **the driver `scripts/live-drive.mjs`'s md5 at this pin's head**
(`NOT RECORDED` here — the pin's own trailing arm section pins an md5 of its own record, and **this pass did not read a
driver digest**); and **the `sha256` + line count of THIS file AFTER this section's bytes** (`OWED`, §14.9).

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER'S AUDIT (`RCA-8(c)`: the paragraph above and `Z-1`/`Z-2` are KEPT
VERBATIM as their pass's reading) — THE PIN IDENTITY HAS MOVED, AND THE LINE COUNT IS RE-TAKEN HERE (the digest is
NOT: this pass's wall has no shell).** **The landed pin `Z-1` cites (`5167` lines, `md5
34c12434aa6818fa77855d7859bf48fd`) now reads **`5473` lines** — MEASURED BY THIS PASS (instrument: the file-read
tool's own line census of `tests/live-drive-contract.test.ts`), and its invocation reads **`77 passed (77)`** — a
RECORDED READING quoted with its measurer (the supervisor's head reading handed to this pass; **NOT taken here**).
`Z-1`'s md5 is kept as its pass's reading and no digest is written by this pass.** **`Z-2`'s `74` is likewise a
landing reading; the pin's own trailing arm section still names a DRIVER digest of record that has since moved —
`md5 f53b569ecc97f9569f14f88238c0f2e0`, `7865` lines — against a driver that now reads `8064` lines (MEASURED by
this pass, same instrument) and `md5 fcc17e09b48b0a3a419be84e589e269c` (RECORDED READING; measurer: the supervisor's
head reading).** **The pin's own stale comment is a `tests/**`-side item and its owner is the TESTWRITER (`C-11`
territory); THIS annotation is the record, not the pin's fix — and it is also the re-taken identity `§14.6` item 5
and `§14.8` item 2(d) owe, insofar as a line count alone discharges them.** **The register's arithmetic is unmoved by
any of this (`Z-3`/`Z-4`/`Z-5` and `§14.2`'s `101` all stand — see `§16.2`).**⟩

### 14.2 THE ARITHMETIC, RE-STATED — the `§4.2` register table, the total, the per-row split, and how a reader must reconcile the two

**THE READING IN ONE LINE: `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side + 16 named class-(b)
NOT-RUN` — `7` rows, the largest single row `P-TP-1` at `19`, total `101` under the ≤ `400` cap and every row under
the ≤ `100` cap, `16` `NOT-RUN` arms each named with `V-10`/`§3.4` as its reason.**

**WHERE THE FILED `97` / `81 + 16` STANDS, AND WHY IT IS NOT CORRECTED IN PLACE (`RCA-8(c)`):** the `97` is printed at
`§4.2`'s arithmetic line, `§4.2`'s own *"the current reading is the `97` line"* paragraph, the second amendment's
block beside it, `§12.5`'s *"Printed arithmetic"* sentence and `§13.3`'s per-row table (`TOTAL` row). **Every one of
those sites is KEPT VERBATIM and carries the `101` reading annotated BESIDE it, so both values are visible at every
site that prints the total.** **A reader deriving a row's budget today uses the `101` line for the total and `§13.3`'s
ANNOTATED rows for the per-row split; the `97` is read as the FIRST amendment's FILED declaration with its own date.**

**THE PIN-PRINTED SPLIT, ROW BY ROW — `RECORDED READING; measurer: the TestWriter` (the strings the pin prints), with
the FILED split of each row kept beside it (the SECOND amendment's `§13.3` reading):**

| Row | Declared total (LANDED) | Executed node-side | Named class-(b) NOT-RUN | The identity | The FILED split (superseded, kept visible) |
| --- | --- | --- | --- | --- | --- |
| **`P-IM-1`** | **`6`** (`1 + 1 + 1 + 1 + 1 + 1 + 0`) | **`6`** | **`0`** | `6 + 0 = 6` — **complete** | `6 + 0 = 6` (**unmoved**) |
| **`P-IM-2`** | **`14`** (`8 + 4 + 1 + 1`) | **`13`** | **`1`** | `13 + 1 = 14` — **complete; the `1` is the printed-line arm, class (b)** | `13 + 1 = 14` (**unmoved**) |
| **`P-SM-1`** | **`16`** (`12 + 4`) | **`12`** | **`4`** | `12 + 4 = 16` — **complete** | `12 + 4 = 16` (**unmoved**) |
| **`P-SM-2`** | **`17`** (`14 + 3`) | **`14`** | **`3`** | `14 + 3 = 17` — **complete** | `14 + 3 = 17` (**unmoved**) |
| **`P-TP-1`** | **`19`** (`7 + 6 + 3 + 3`) | **`16`** | **`3`** | `16 + 3 = 19` — **complete** | `13 + 3 = 16` (**MOVED, +3 arms**) |
| **`P-TP-2`** | **`15`** (`5 + 5 + 2 + 1 + 2`) | **`13`** | **`2`** | `13 + 2 = 15` — **complete** | `12 + 2 = 14` (**MOVED, +1 arm**) |
| **`P-SM-3`** | **`14`** (`4*2 + 3 + 3`) | **`11`** | **`3`** | `11 + 3 = 14` — **complete** | `11 + 3 = 14` (**unmoved**) |
| **TOTAL** | **`101`** | **`85`** | **`16`** | **`85 + 16 = 101`** | **`81 + 16 = 97`** (**superseded**) |

**TWO NOTATIONS, NEVER CONFLATED — the source of the drift a reader must not repeat:** the **per-row SPLIT** is
*`executed node-side arms` + `named class-(b) NOT-RUN arms`* (the landed strings above); the **declared FACTOR
STRING** is the row's own sum-of-products term list, whose LAST term is the row's class-(b) budget — **the two are
different strings for the same row** (`P-TP-1`'s split is `16 + 3`; its declared string is `7 + 6 + 3 + 3`), and
**either may be read only against the row's declared total, never against the other notation's string.** **The register
table's own filed terms at `§4.2` (`7*2+2` for `P-TP-1`, `6*2+2` for `P-TP-2`, `6*2+4` for `P-SM-1`, `7*2+2+1` for
`P-SM-2`) are the SPEC's term-list forms and are NOT the pin's re-derived strings — item 3 of `§14.6` records this,
because a reader comparing the two notations directly will otherwise derive a false arithmetic drift.**

### 14.3 THE TWO TERMS THAT MOVED — what was added, WHO added it, in WHICH pass, and why it is NOT budget padding

**TWO DECLARED TOTALS MOVED AND NOTHING ELSE DID: `P-TP-1` `16` → `19` and `P-TP-2` `14` → `15`. Both are LANDED
ARMS, not padding: each moved term is inhabited by an arm that RUNS and can FAIL.**

| Row | Filed → landed | The arm(s) that landed | Which pass | Why the declaration had to move |
| --- | --- | --- | --- | --- |
| **`P-TP-1`** | **`16` → `19`** | **The three OUTCOME arms for the click shapes `covered-by-another-element`, `missing-selector` and `zero-size-box`** — each reading that shape's own returned record and evaluating the driver's own classifier on it, so a promotion of the shape to `PASS` or to an app `FAIL` turns the arm RED. | **the TestWriter's FOURTH remediation pass — the gate-4 re-audit that RULED *"land the arms, do not shrink the declaration"*** | The row's property declares **`7` click shapes × `(the recorded shape, the verdict outcome)`**; **`7 × 2 = 14` outcome arms were declared while only `6` outcome arms existed**, so the declared `7 × …` was **not genuinely inhabited** and the second amendment's `7*2 + 2` string could not decompose the arms the row ran. **The three landed arms make the declared shape real; the declaration was RAISED to the arms, never the arms shrunk to the declaration.** |
| **`P-TP-2`** | **`14` → `15`** | **The declared-contributor-emission arm (`B-12`)** — per parsed `MATRIX_ROWS` entry, every block named in the entry's declared `block`/`blocks` set must itself EMIT that row's id (`row: '<id>'` or a `declaredRowResult('<id>', …)`); **deleting the emission turns the arm RED.** | **the TestWriter's FOURTH remediation pass (the `B-12` finding)** | The row's property states **"every refusal, park and exclusion is NAMED, and nothing widens"**, and **`V-1`'s defect is the opposite failure — a DECLARATION not honoured by the blocks that carry it** — so the arm that pins a declared contributor's emission belongs to THIS row's totality space. **It is a new arm for a declared property, added where the finding landed it, not a denominator adjustment.** |

**WHO MOVED IT, STATED FOR THE RECORD SO A LATER READER CANNOT READ DRIFT: the TestWriter, in its THIRD and FOURTH
remediation passes on `tests/live-drive-contract.test.ts`** — the third pass landing the `B-12`-class arm and the
fourth (the gate-4 re-audit under findings `B-7`/`B-8`/`B-9`/`B-12` plus the missing-outcome-arms item) landing the
three `P-TP-1` outcome arms and re-deriving every row's declared factor string so that **the string decomposes the
arms the row actually RUNS** (`B-7`). **The implementer landed no register figure: the register is `tests/**` and the
TestWriter authors it (`AGENTS.md` item 3).**

**THE MOVEMENT IS THEREFORE THE OPPOSITE OF THE REFUSED ACT, and the sentence that names the refused act is kept
beside it:** `§4.1`'s added ruling item 3 and `F-17` refuse **a declared total LOWERED to match what happened to
run** — here the totals were **RAISED because ADMISSIBLE ARMS WERE ADDED**, each named above, each falsifiable
(§14.4).

### 14.4 THE RULING-CONSISTENCY POINT — `F-17` IS **NOT** TRIPPED, AND A DECLARED TOTAL MAY MOVE IN EITHER DIRECTION ONLY WITH LANDED ARMS AND A DATED AMENDMENT

**`F-17` EXISTS TO CATCH THE OPPOSITE ACT, SO THE POINT IS RULED HERE EXPLICITLY: `F-17` — *"A REGISTER ROW WHOSE
DECLARED BUDGET IS NOT FULLY ACCOUNTED — the shortfall OR the silent drop"* (`§13.6`) — IS **NOT TRIPPED** BY THIS
DRIFT.** **`F-17` names THREE triggers and NONE of them describes what happened:**

1. **Trigger (i) — *"a row reports `executed + namedUnrun < declared` with no reason for the difference"*: NOT
   APPLICABLE.** Every row's identity CLOSES on the landed split (`6+0 · 13+1 · 12+4 · 14+3 · 16+3 · 13+2 · 11+3`),
   per row and in total (`85 + 16 = 101`), and the landing's `TALLY` line prints the arithmetic with its terms
   (`Z-4`).
2. **Trigger (ii) — *"a class-(b) arm is NOT-RUN without `V-10`/`§3.4` named"*: NOT APPLICABLE.** The `16` `NOT-RUN`
   arms are the ones named at `§13.3`'s split, each with the only two admissible reasons the register permits
   (the driver cannot be IMPORTED — `§0.2` `V-10` — and no node row may drive Electron — `§3.4`).
3. **Trigger (iii) — *"a declared arm is neither executed nor named-NOT-RUN, or the declared total is LOWERED to
   match what ran"*: NOT APPLICABLE ON EITHER LIMB.** Every declared arm is executed or named-NOT-RUN (limb one), and
   **NO declared total was lowered: two were RAISED because arms were ADDED** (limb two). **This is the limb whose
   direction matters, and it is the whole reason this subsection is written: a declared total that MOVES DOWN to fit
   a run is `broken`; a declared total that MOVES UP because falsifiable arms LANDED is a re-statement that owes an
   amendment — which is this section.**

**THE OTHER FOUR CENSUS/CONSISTENCY TERMS THAT COULD HAVE MADE THE MOVEMENT A DEFECT, EACH CHECKED AND EACH HOLDING:**
**the row count stays `7`** (≤ the `8`-row cap; the typing stays `P-IM-*`/`P-SM-*`/`P-TP-*`; no `F-` row exists in
the register; no `§6`/`FS-n` id is cited in it); **the per-row cap holds** (`19` ≤ `100` — the largest row is
`P-TP-1`); **the total cap holds** (`101` ≤ `400`); and **stop-after-5 holds on every row** (≤ `5` distinct
counterexamples per row, then the row stops). **`MATRIX_ROWS` is untouched by this movement** (`8` rows, ids
`U-1`..`U-8`).

**THE RULE, STATED SO A FUTURE PASS CANNOT READ THE MOVEMENT AS A PRECEDENT FOR THE REFUSED ACT: a declared register
total MAY move, IN EITHER DIRECTION, ONLY when (a) the arms are LANDED (each inhabited by an arm that runs and can
fail), (b) the movement is recorded by a DATED AMENDMENT at the row's own site with the superseded value kept visible
beside the new one, and (c) the moved terms are NAMED with the pass that moved them. RAISING a total with no landed
arm is padding; LOWERING a total to match what ran is the act `F-17` names; and either without a dated amendment is
drift.** **AND THE ACCOUNTING IDENTITY IS THE INVARIANT THAT SURVIVES EITHER MOVEMENT: `executed + named class-(b)
NOT-RUN === declared`, PER ROW and IN TOTAL — an unnamed shortfall stays `broken` (`§4.1`'s added ruling item 1), and
the identity is an ACCOUNTING, never a claim that the executed arms passed (`§13.3`'s honest limit, re-affirmed).**

### 14.5 THE PIN-SIDE CONSEQUENCE AND ITS OWNER — A SAME-ROUND ACT, SO A LATER READER DOES NOT READ IT AS DRIFT

**THE CONSEQUENCE, MEASURED AT THE LANDED PIN (`Z-1`): the pin's own test title cites `§12.5` FOR A FIGURE THAT
§12.5 CONTRADICTS AT THIS HEAD.** The pin's arithmetic `it` block is titled as *"`§12.5` the arithmetic prints with
its terms: `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`"* while **`§12.5`'s filed sentence still prints
`6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`** — so **the citation names a section whose own text prints a different
arithmetic**, which is exactly the class of stale citation a proofreader hunts. **`VERIFIED-BY-READ` by this pass
(reader: the SpecDoc), on both sides of the citation.**

**`§12.5` IS CORRECTED FROM THIS SIDE, BESIDE ITS FILED TEXT, IN THIS AMENDMENT** (the `101` reading is annotated at
`§12.5` and the superseded `97` is kept visible there) — **so the section the pin cites now carries both values, and
the citation is no longer contradicted by the section it names.**

**THE OWNER OF THE PIN-SIDE HALF, NAMED BECAUSE IT IS A `tests/**` ACT THIS PASS MAY NOT TAKE: the TestWriter, and it
is being re-stated IN THE SAME ROUND as this amendment.** The re-statement is to **keep the citation `§12.5` while
printing BOTH values** (`⟨RE-STATED …⟩`, the superseded figure visible beside the landed one, **the teeth kept:
the `101` arithmetic assertion, the `held` predicate and the accounting identity are NOT relaxed** — the program's
re-statement discipline, `DECIDED: HARNESS-ENABLEMENT-AND-BOOT-READINESS` clause (v)). **WHY IT IS RECORDED AS A
SAME-ROUND ACT: a later reader meeting the landed `101` in the pin beside the filed `97` in `§12.5` (or vice versa)
would otherwise have to read the pair as unresolved DRIFT; the pair is the re-statement's intended shape, and both
sides of it are dated `2026-09-29`.** **The four other register-side pin citations remain coherent: the row-count
citation (`§4.2`/`§12.5`, `7` rows), the `P-TP-1`-is-the-largest-row assertion (`19`), the factor-decomposition
citation (`§4.2`/`§13.3`) and the typing citation (`§4.2`) all read against figures this amendment re-states.**

### 14.6 WHAT THIS PASS FOUND BY READ THAT CONTRADICTS THE FINDING AS STATED — SIX ITEMS, EACH LABELLED

**Each item below is a READ this pass took (reader: the SpecDoc). None of them changes `C-9`'s disposal — the finding
as stated is confirmed — but each is a figure a reader would otherwise meet unlabelled.**

1. **`§13.3`'s PER-ROW SPLIT ALREADY CARRIES THE LANDED SPLIT STRINGS FOR SIX OF THE SEVEN ROWS — so only TWO rows
   moved in that table, and the prompt's own "printed `97` with per-row `P-TP-1 13+3=16` / `P-TP-2 12+2=14`" holds
   at that table, while the FILED `97` totals live at `§4.2`'s arithmetic line, `§12.5` and `§4.2`'s two
   amendment blocks.** **`VERIFIED-BY-READ`.** The consequence is only bookkeeping — the amendment had to move the
   per-row split AND the totals wherever they print, which is what the four annotated sites do — **and `C-9`'s
   substance is unaffected.**
2. **THE LANDED PIN'S OWN INTERNAL RECORDS ARE MUTUALLY INCONSISTENT ABOUT THE SAME HEAD, and one of them still
   prints the SUPERSEDED `97`/`81 + 16` — `VERIFIED-BY-READ` by this pass (reader: the SpecDoc), four limbs:** **(a)**
   the earlier audit record inside the pin (`A-1`) states the file runs `69 passed (69)`; **(b)** the fourth-pass
   record's closing paragraph states `71 passed (71)`; **(c)** the delivered reading off the landed pin is `74`
   `it()` assertions PASS (`Z-2`); and **(d)** `A-1`'s own sentence still prints the FILED split
   (`6+0 · 13+1 · 12+4 · 14+3 · 13+3 · 12+2 · 11+3 = 81 + 16 = 97`) as the split *"at the ruled split of §13.3"* —
   **i.e. the record that claims the arithmetic "does not match the file" is itself the stale one on both its count
   and its split.** **THIS IS RECORDED AS A `tests/**`-SIDE STALENESS ITEM, NOT AS A SPEC DEFECT: the contradiction is
   inside the PIN's prose, and the SPEC is the authority the pin cites** — its owner is **the TestWriter** (the file
   is `tests/**`; this pass may not write it), and it is owed at `§14.8` item 2. **It does NOT overturn `C-9`: `C-9`'s
   figures are the pin's EXECUTED register (`Z-3`/`Z-4`), which is coherent and closes.**
3. **A `P-TP-1` ARM-NAME AMBIGUITY ACROSS THE TWO RECORDS OF THE SAME RULING, AND A GROUPING QUIRK IN ONE ROW'S
   DECLARED FACTOR STRING — both `VERIFIED-BY-READ` (reader: the SpecDoc), neither a falsification of `C-9`:**
   **(a)** the missing-outcome-arms record names the three landed `P-TP-1` arms as `covered-by-another-element`,
   `missing-selector` and **`fallback-taken`**, while the register's arms carry them as
   `verdict-outcome:covered-by-another-element`, `verdict-outcome:missing-selector` and
   `verdict-outcome:fallback-taken` **while the shape the third arm exercises is the ZERO-SIZE-BOX outcome** — and
   **the row's `fallback-taken` shape had a declared outcome arm in the FILED string already**, so **which of the
   three "new" arms is genuinely new is named two different ways in one file**; **the count is unambiguous
   (`+3` declared, `16` executed), so the declared total `19` is not in doubt — only the third arm's label is.**
   **(b)** **A CLAIM THIS PASS FIRST RECORDED AND THEN WITHDREW, stated here so the withdrawal is on the record: this
   pass initially read `P-IM-2`'s declared string (`8 + 4 + 1 + 1`, whose plain arithmetic is `14`) as conflicting with
   its declared total — it does not.** The pin's factor strings are evaluated by an expression reader with the pinned
   grammar **`*` binds tighter than `+`, parentheses respected**, so the forms that read as *term lists* to a plain
   addition (`4*2 + 3 + 3` for `P-SM-3`) evaluate to the declared totals, and **no declared string in the table fails
   its own total.** **`VERIFIED-BY-READ`; the earlier reading is CORRECTED HERE and no finding is owed for it.** **The
   ONE residual quirk, kept because it is real and NOT a false total:** under that same reader, **a declared string
   whose group is written WITHOUT parentheses loses its grouping when the reader isolates the last term to compare it
   against the row's class-(b) budget** (`4*2 + 3 + 3` splits so that the term before the budget is `4*2 + 3`, not a
   single value) — **so a declared string may pass the total identity and still be ambiguous about WHICH of its `+`
   terms is the class-(b) budget, which is a `tests/**`-side legibility defect at most and owed at `§14.8` item 2.**
4. **THE TWO NOTATION SYSTEMS ARE NOT INTERCHANGEABLE, WHICH IS THE MECHANISM OF THE DRIFT ITSELF — `VERIFIED-BY-READ`
   (reader: the SpecDoc).** The `§4.2` register table's filed term strings (`7*2+2` for `P-TP-1`, `6*2+2` for
   `P-TP-2`) are the SPEC's *term-list* forms, while the pin's landed strings (`7 + 6 + 3 + 3`, `5 + 5 + 2 + 1 + 2`)
   are the row's *executed-plus-class-(b)* decomposition re-derived under `B-7`. **A reader who compares the two
   notations term by term derives an arithmetic drift that does not exist** — the two strings describe the same
   declared total from two sides, and `§14.2`'s conflation warning is written for exactly that reader. **This is the
   single most likely way `C-9` gets misread as a larger defect than it is.**
5. **THE PIN KEEPS MOVING WITHIN THIS ROUND, SO ITS CITING IDENTITY IS THE PART OF THIS AMENDMENT MOST LIKELY TO GO
   STALE — `VERIFIED-BY-READ` by this pass (reader: the SpecDoc).** The pin identity this amendment cites as its
   authority (`5167` lines, `md5 34c12434aa6818fa77855d7859bf48fd`, §14.1 `Z-1`) **is the identity the task handed this
   pass**, and **the pin at this head has ALREADY GROWN PAST it while this very round was in flight** (a later read of
   the same path reports a larger line count). **THE REGISTER'S OWN FIGURES ARE UNMOVED BY THAT GROWTH — the `TALLY`
   line still prints `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`, the seven rows still carry `6`/`14`/`16`/`17`/`19`/`15`/
   `14`, and `P-TP-1` still carries `19` — so `C-9`'s arithmetic is unaffected**; **what is owed is a RE-TAKEN pin
   identity (its line count and its digest) for whatever head is current when the amendment is closed out.**
6. **THE PIN-SIDE RE-STATEMENT OF THE `§12.5` CITATION IS OBSERVED IN FLIGHT AND ITS SHAPE CONFIRMS `§14.5`'s
   READING — `VERIFIED-BY-READ` (reader: the SpecDoc).** The pin's arithmetic `it` title **now carries BOTH values**
   — the filed `§12.5` figure (`6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`) labelled as filed **and** the third amendment's
   landed reading (`6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`) — **with the `101` arithmetic assertion, the `held`
   predicate and the accounting identity kept**, which is exactly the same-round act `§14.5` records and `§14.8` item 2
   owes: **the superseded figure printed BESIDE the landed one, the teeth unmoved, so neither a reader of the pin nor a
   reader of `§12.5` meets a bare contradiction.**

### 14.7 WHAT DID NOT CHANGE, restated because a THIRD amendment invites a wider over-read

**THE `§5.x` PROPERTY-REGISTER ROW COUNT IS UNMOVED AT `7`** — this amendment adds NO row, and `MATRIX_ROWS` stays
`8` with ids `U-1`..`U-8` in `§0.3` and `§3.3`'s census rows; **`MATRIX_ROWS`' own row count is `8` and its
`MATRIX_ROWS` declaration is untouched.** **The typing stays `P-IM-*`/`P-SM-*`/`P-TP-*`, no `F-` row is added to the
register and no `§6`/`FS-n` id is cited in it.** **The seed (`0x20260929`), the stop-after-5 rule, the caps (≤ `100`
per row · ≤ `400` total) and the strategy ids are unmoved.** **The `§12`/`§13` blocks' OTHER content is unmoved:**
their figures for `ROW_EXTENDED` (`32` declared), `extendedRowsRun` (`53` against the superseded `56`), the class-(b)
readings, the per-block restore ruling, the `F-13`…`F-17` enumeration and the owed-items list all stand exactly as
they were written — **this amendment touches their register arithmetic ALONE.** **No kept-green pin is weakened**
(`R5.b`, `R5.c`, `R6.a`, `R6.b`, the `R4.0` floor and `R4.1`…`R4.9` keep their teeth), **and the adversarial findings
of `§3a`/`§3b` are NOT recorded here** — that is separate owed work, out of this amendment's scope. **The scope is
unmoved**: this unit still fixes the INSTRUMENT, never the app; the layer is `[D]`; **and a green here proves the
driver's reporting integrity, never app behaviour (`RCA-12`).**

### 14.8 What this amendment OWES (each with its owner)

1. **THE `sha256` + LINE COUNT OF THIS FILE AFTER THIS SECTION'S BYTES** — `OWED` (§14.9). **OWNER: a shell-bearing
   pass (the supervisor / the landing pass's step), which must also STATE the instrument it used.**
2. **THE `tests/**`-SIDE STALENESS AND RE-STATEMENT ACTS, in the SAME ROUND as this amendment** — (a) the pin's
   `§12.5` citation re-stated with both values (the landed `101` and the superseded `97`) and the teeth kept
   (`§14.5`) — **`VERIFIED-BY-READ` as DONE in this round by the pin's own arithmetic title, which now prints both
   values** (`§14.6` item 6), **so this limb is DISCHARGED and recorded rather than owed**; (b) the pin's internal
   records reconciled with the landed head — the stale `69`/`71` execution counts, the stale md5 a trailing arm
   section pins, and `A-1`'s stale `81 + 16 = 97` split (`§14.6` item 2); (c) the `P-TP-1` third-arm label ambiguity
   and the unparenthesised-group legibility quirk in one declared factor string (`§14.6` item 3 — **the
   `P-IM-2`-non-closing-string claim this amendment first carried is WITHDRAWN there, and is owed as NOTHING**); and
   (d) **the pin's citing identity re-taken (line count + digest) for whatever head is current when this amendment is
   closed out**, because the pin kept growing inside this round (`§14.6` item 5). **OWNER: the TestWriter —
   `tests/**` is a file this pass may not write (`AGENTS.md` item 3).**
3. **THE `C-9` DISPOSITION ROW AND THE DONE-ROW FIGURES.** `C-9` is DISPOSED by this amendment as **CONFIRMED and
   closed on the spec side** (the arithmetic is re-stated at the four sites with the superseded values visible, and
   `F-17` is NOT tripped — §14.4); **the tracker row and the DONE row that carry it are the supervisor's to write.**
   **This amendment writes no tracker row and no DONE row.** **OWNER: the supervisor.**
4. **THE DOCUMENTATION REVIEW OF THIS AMENDMENT (`RCA-6`, item 10d)** — the reconciliation of this section's figures
   against the landed pin and the trackers, recorded to `archive/reviews/<date>-<unit>-doc-review.md`.
   **OWNER: the documentation reviewer, after this amendment lands.**

### 14.9 The snapshot this file owes — `§10` item 10 at this head

**⟨`2026-09-29` — THE OWED `sha256` AND LINE COUNT AFTER THE THIRD AMENDMENT'S BYTES: `OWED`.** **This pass holds no
shell (its wall is read/search + doc-write), so it takes neither figure, and — exactly as `§12.9` and `§13.9` already
state for the two earlier amendments — a file cannot contain its own digest.** **What this file states is the
OBLIGATION and the instrument only:** `sha256sum docs/specs/unit-live-driver-verdict-integrity.md` and `wc -l
docs/specs/unit-live-driver-verdict-integrity.md`, **both to be taken AFTER this section's bytes are on disk by a
shell-bearing pass, which must also STATE the instrument it used.** **The figures belong in the landing pass's DONE
row (`§7` `X-3`, `§10` item 10) and in the delivery note to the supervisor, never invented here.** **The head this
amendment's bytes supersede is stated with its own value and is NOT rewritten: `1437` lines, `sha256
bb072261d3bc1f0d960eec1110641fc0bea086cefe82862e34bfe97c20b2dc57` — stated as the FILED head this pass was given,
and `NOT` a reading this pass took (it holds no shell); `1437` is a `RECORDED READING`, measurer: the pass that handed
this amendment its head.** **The pair for the head AFTER this section's insertions is OWED (§14.8 item 1).** **⟨ANNOTATED `2026-09-29` BY THE
GATE-7 PROOFREADER (`RCA-8(c)`: this paragraph is KEPT VERBATIM) — the LINE COUNT of the head after `§14`'s bytes is
now MEASURED and recorded at `§16.1` (`2097` lines at the gate-7 head, instrument: the file-read tool's own line
census), which supersedes the `1784`-line reading in `docs/next-steps.md`; the `sha256` STAYS OWED (this pass's wall
has no shell).**⟩

---

## 15. THE ADVERSARIAL-FINDINGS RECORD — `C-12` DISCHARGED: THE THREE GATE-4 ADVERSARIAL PASSES, THEIR VERDICTS, THEIR FINDING IDS, THEIR DISPOSITIONS AT THIS HEAD, THE TWO FINDINGS FALSIFIED BY MEASUREMENT, AND THE `§13.5` ITEM 3 WITHDRAWAL

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED RECORD BLOCK: it adds a section at the foot, it moves no
existing section, it renumbers nothing, and every existing `§`/id/citation remains valid.** **It is written
`ANNOTATE-BESIDE` (`RCA-8(c)`): every site it touches KEEPS its filed text VERBATIM with this record written
BESIDE it — `§6.3` `C-2` item 3 and `§13.5` item 3 are WITHDRAWN-BY-ANNOTATION at their own sites (§15.3.1 and
§15.3.2), and
**nothing in this file was rewritten to make a correction look as if it had always been there.** **THIS PASS RAN
NOTHING: no shell, no suite, no register row, no battery, no Electron boot, no `--block=` invocation. Its wall is
read/search + doc-write.** **Every figure below is a `RECORDED READING` quoted with its measurer (the read-only
adversarial pass — `role_adversarial_reviewer` — that filed the findings; the supervisor's own measurement pass;
the live-scenario runner; the implementer; the TestWriter) or a `VERIFIED-BY-READ` named as such; where the
records are silent the cell says `NOT RECORDED` and names what settles it.** **THE CITATION DISCIPLINE IS
UNMOVED: NO LINE NUMBER APPEARS ANYWHERE IN THIS FILE — every citation here is a `path` + a symbol / a block name
/ a row id / a `§section`.**

**THE DUTY THIS SECTION DISCHARGES, STATED EXACTLY.** **`C-12`** is a **`pins`/`specs` PROCESS finding** filed by
the third read-only gate-4 pass: **THE CONTRACT CARRIED NO `§3a`/`§3b`**, so **three whole adversarial passes'
findings were recorded NOWHERE in it** — and the repo's **`RCA-3`** (`AGENTS.md` item 7's adversarial-loop
carve-out: *the adversarial pass is MANDATORY per completed unit; its findings are recorded in the unit spec's
`§3a`/`§3b`; each host finding is fixed here + regression-tested*) was therefore **UNMET at this unit, which is why
a DONE row could not cite a recorded adversarial pass.** **THE DISPOSITION IS A RECORD, NOT A DISPOSITION OF THE
OTHER FINDINGS:** `C-12` is **DISCHARGED BY THIS SECTION**; the five `C-` findings that are NOT closed here keep
their own open status (§15.2), and this record claims no closure it did not receive. **The convention of this
file is kept: this section's record is written as the `§3a`-class pass record and the `§3b`-class finding table
the duty names, under the section numbers §15.1/§15.2 so that no existing `§3`-numbered material is disturbed
(§11.3's id discipline; a `§3a`/`§3b` heading would sit inside §3's own fail-state enumeration).** **Where
`RCA-3`'s text says `§3a`/`§3b`, read this file's §15.1/§15.2.** **The `§15.2` tables carry the `RCA-3`-required
per-finding shape: layer · one line of evidence · disposition · owner.**

### 15.0 THE PASS-LEVEL LEDGER — who ran, what verdict, what the record is, and the three counting rules

**THE MEASURER OF ALL THREE PASSES, NAMED ONCE AND CARRIED ON EVERY ROW: the read-only adversarial pass,
`role_adversarial_reviewer`** (edge cases / unauthorized access / malformed inputs; read-only; it never edits and
it ran its own **PBT audit** beside every pass — the over-strength / vacuity / declared-vs-executed honesty read of
each register row, summarised in the passes below and owed in full detail at §15.5 item 1). **Its findings were
filed in the supervisor's gate cycle and are quoted here from the tracker/gate records that carry them; none of
them is this pass's own measurement.**

| # | The rule this section counts by | Why it is stated before the tables |
| --- | --- | --- |
| **15.0-a** | **THE FINDING-ID CENSUS IS `35` FINDINGS, COUNTED BY THE PASSES' OWN IDS: `A-1`…`A-11` (`11`) · `B-1`…`B-12` (`12`) · `C-1`…`C-12` (`12`).** | A reader must be able to check the census against the passes; `A-4`'s **two limbs** (`A-4(i)`/`A-4(ii)`) are **ONE finding id** and are dispositioned per limb (§15.2), never counted twice. |
| **15.0-b** | **THE IDS ARE PASS-LOCAL AND COLLIDE WITH THIS FILE'S OWN `C-` SPEC CLAUSES, BY CONSTRUCTION.** `§15.1`/`§15.2` use **`A-<n>`** (pass 1), **`B-<n>`** (pass 2) and **`C-<n>`** (pass 3) as the passes filed them; **this file's `§6.1` `C-1`, `§6.3` `C-2` and `§10` `C-3` are DIFFERENT objects** (the unit's own gate clause and its two class-(b)/report clauses). **Disambiguation rule: an id printed `C-n` in §15.2 is a pass-3 finding; an id cited as `§6.1` `C-1` / `§6.3` `C-2` / `§10` `C-3` is this file's clause.** **Neither set is renumbered** — the collision is recorded rather than smoothed, exactly as §11.3 records the `E-` collision between §2's clauses and §9's escalations. |
| **15.0-c** | **THE PACKAGE ROW IS EMPTY, AND THAT IS A FINDING OF THIS RECORD TOO.** Every one of the `35` findings lands on the **HOST** layer — **`scripts/live-drive.mjs`** and the **`tests/live-driver-contract.test.ts`** structural pin — and **`node_modules/provident-ssr/**` and `../Provident-Electron/**` were neither read nor found defective by any of the three passes.** **So NO handoff row is owed** (`AGENTS.md` item 7; the empty search is itself the finding), and **no package byte was patched, as required.** **A package finding is a handoff item and is NEVER patched here; these passes found PACKAGE DEFECTS NOWHERE, so their handoff row is an EMPTY SEARCH stated plainly, not an omission.** |

**WHAT THE THREE PASSES WERE PASSES OF, AND WHAT THEY ARE NOT.** All three are **gate-4 read-only adversarial
passes on the SAME unit**, run at three successive remedy-round heads; each **re-ran nothing of the unit's own
battery except as its own read** and each **carried the PBT audit of the `§4.2` register**. **No reading in this
section is app evidence (`RCA-12`): the subject is the INSTRUMENT — the driver's own verdict integrity — and the
layer stays HARNESS `[D]` at every row.**

### 15.1 THE THREE PASSES — the `§3a`-class record (pass, date, measurer, verdict, finding ids, closed / still-open / falsified at this head)

**THE `§3a`-CLASS OBLIGATION OF `§7` `X-3` ITEM 5 AND §10 ITEM 5 IS THEREBY MET** (their filed text promises the
adversarial pass's findings *"recorded in this spec's `§3a`/`§3b`"*, which is THIS section under the numbering note
in its head block): **what follows is the pass-level record, and §15.2 is the per-finding table.** **`§14.7`'s
filed sentence (*"the adversarial findings of `§3a`/`§3b` are NOT recorded here — that is separate owed work, out of
this amendment's scope"*) is KEPT VERBATIM and is NOT rewritten: it was TRUE of the third amendment's own scope, and
the separate owed work it names is DISCHARGED HERE.**

**Measurer for every pass: the read-only adversarial pass, `role_adversarial_reviewer`** (named once at §15.0 and
carried on each row). **The dates are the working date convention of this repo's `2026-09-29` head** — the branch
head's commit date this unit was minted and amended on; **a per-pass date is `NOT RECORDED`** and what settles each
is the supervisor's gate-cycle record for that pass. **The three passes were run in the order `A` → `B` → `C`, each
against the head its predecessor's remedy round had produced.**

| # | The pass | Its date | Its measurer | Its verdict | Its findings | Disposition at THIS head |
| --- | --- | --- | --- | --- | --- | --- |
| **1** | **THE FIRST GATE-4 ADVERSARIAL PASS** (on the pre-remedy head; with its read-only PBT audit) | `2026-09-29` (working date convention; the pass's own date is `NOT RECORDED` — what settles it is the supervisor's gate-cycle record) | **`role_adversarial_reviewer`, read-only** | **`FAIL`** | **`11`: `A-1`…`A-11`** | **`10` CLOSED by the first remedy round — `A-2` · `A-3` · `A-4(ii)` · `A-5` · `A-6` · `A-7` · `A-8` · `A-9` · `A-10` · `A-11` (the remedy round's own item-by-item closure record is `NOT RECORDED`; the `A-` set's closures are carried as this unit's gate-cycle record). ⟨THIS CELL CARRIED `9` WHEN FIRST WRITTEN IN THIS PASS WHILE LISTING `10` IDS; THE MISCALCULATION IS CORRECTED HERE, TO THE PARTITION AT §15.1's CENSUS TABLE, AND IS LEFT VISIBLE RATHER THAN SILENTLY REPLACED.⟩** **`1` FALSIFIED BY MEASUREMENT — `A-1`** (§15.3.3) **— and `A-4`'s `(i)` limb (`park:true` dropped by `buildReportRow`) is FALSIFIED/`NOT-REPRODUCED` while its `(ii)` limb (`A-4(ii)`) is CLOSED** (§15.3.3; §15.2's `A-4` row). **`0` STILL-OPEN.** |
| **2** | **THE SECOND GATE-4 ADVERSARIAL PASS** (on the round-1 remedy head) | `2026-09-29` (working date convention; `NOT RECORDED` per pass) | **`role_adversarial_reviewer`, read-only** | **`FAIL`** | **`12`: `B-1`…`B-12`** | **ALL `12` CLOSED — `2` BLOCKING (`B-1` · `B-2`, closed by the THIRD remedy round, live-verified: all four scoped readings agree with the full battery — `uf_panes_1=PASS`, `uf_settings_7=PASS`, in both orders — and `uf_panes_14` now emits `U-2`+`U-3`) + `10` non-blocking (`B-3` · `B-4` · `B-5` · `B-6` · `B-7` · `B-8` · `B-9` · `B-10` · `B-11` · `B-12`) — `B-3`/`B-5`/`B-6`/`B-11` closed by the third remedy round; the pin-side `B-7`/`B-8`/`B-9`/`B-12` re-derived with named mutations; **`B-4` closed as `C-7`** (§15.2's `B-4` row). **`0` STILL-OPEN; `0` FALSIFIED.** *(The third remedy round's live verification is the implementer's `LAUNCH PROFILE` line carrying the EFFECTIVE group set — `B-11`'s closure.)* |
| **3** | **THE THIRD GATE-4 ADVERSARIAL PASS** (on the round-2 remedy head; the pass that FILED `C-12`) | `2026-09-29` (working date convention; `NOT RECORDED` per pass) | **`role_adversarial_reviewer`, read-only** | **`FAIL`** | **`12`: `C-1`…`C-12`** | **`3` BLOCKING, ALL CLOSED AND LIVE-PROVEN — `C-1` · `C-2` · `C-3`** (the live measurements are the evidence rows at §15.2). **`4` NON-BLOCKING CLOSED — `C-7` · `C-8` · `C-9` (by `§14`, the third amendment) and `C-12` (DISCHARGED BY THIS SECTION — the record is the disposition).** **`5` STILL-OPEN (i.e. NOT closed at this head) — `C-4` · `C-5` · `C-6` · `C-10` · `C-11`.** **`0` FALSIFIED.** **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the cell is KEPT VERBATIM as this record's own head) — THE STILL-OPEN SET HAS MOVED: `C-4` · `C-5` · `C-6` ARE CLOSED (their rows at `§15.2.3`, the corrected partition at `§15.1`), so this pass's `5` STILL-OPEN reads `2` (`C-10` · `C-11`) at this head. The `5` is kept as THIS PASS's reading.**⟩** |

**THE CENSUS, PRINTED SO IT CAN BE CHECKED, AS AN ID-BY-ID PARTITION OF THE `35` FILED IDS (the only reading that
can be checked without double-counting):**

| The pass's ids | `35` ids partitioned at this head | The arithmetic |
| --- | --- | --- |
| **`A` — `A-1`…`A-11`** | **`10` CLOSED** (`A-2` · `A-3` · `A-4(ii)` · `A-5` · `A-6` · `A-7` · `A-8` · `A-9` · `A-10` · `A-11`) **+ `1` FALSIFIED-BY-MEASUREMENT** (`A-1`, an id whose `A-4(i)` limb is also falsified) | **`10 + 1 = 11`** |
| **`B` — `B-1`…`B-12`** | **`12` CLOSED** (`B-4` closed via `C-7`; the four pin rows `B-7` · `B-8` · `B-9` · `B-12` closed by the TestWriter's re-derivations; `B-1`/`B-2`/`B-3`/`B-5`/`B-6`/`B-11` by the third remedy round; `B-10` by a remedy round whose identity is `NOT RECORDED`) | **`12`** |
| **`C` — `C-1`…`C-12`** | **`3` CLOSED-AND-LIVE-PROVEN** (`C-1` · `C-2` · `C-3`) **+ `4` CLOSED** (`C-7` · `C-8` · `C-9` · `C-12`; **`C-8`'s closure is carried by a live isolated-vs-battery reading, recorded at its own row, and it is NOT double-counted in the `3`**) **+ `5` STILL-OPEN** (`C-4` · `C-5` · `C-6` · `C-10` · `C-11`) **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the cell is KEPT VERBATIM, its head predates the landings) — THE HEAD THE CELL COUNTED AT IS SUPERSEDED: `C-4`, `C-5` and `C-6` ARE **CLOSED** at this head (see the three rows at `§15.2.3` and the corrected partition BESIDE the `35`-id table below). The `3 + 4 + 5 = 12` arithmetic is this cell's OWN head and is kept as such; the corrected reading is `3 + 7 + 2 = 12`.⟩** | **`3 + 4 + 5 = 12`** |
| **TOTAL** | **CLOSED `26` ids + CLOSED-AND-LIVE-PROVEN `3` ids + STILL-OPEN `5` ids + FALSIFIED `1` id** | **`26 + 3 + 5 + 1 = 35` — the four columns are a PARTITION, so each of the `35` ids is counted once** |

**NO FINDING IS RECORDED TWICE AND NO FINDING IS DROPPED: every one of the `35` ids appears in exactly one cell of
the partition above, `A-4`'s two limbs are dispositioned inside ONE id (§15.2), and the `3` live-proven `C-` ids are
counted in the `CLOSED-AND-LIVE-PROVEN` column rather than in the `CLOSED` column so the `26`/`3` split is a
partition and not a double count.**
**The `5` STILL-OPEN items are the honest residual of this record: they were filed, they were NOT closed at this
head, and their closure is owed to the next driver pass with the confirm gate — a record that read them as closed
would be the very over-read `C-12` exists to prevent.**

**⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`, ANNOTATE-BESIDE: the paragraph
above, its `5` and the whole `35`-id table immediately above it are KEPT VERBATIM as the gate-4 record's own head and
NOTHING in them is rewritten) — THE `STILL-OPEN` COLUMN HAS MOVED, AND THE PARTITION ARITHMETIC MOVES WITH IT. THIS
IS THE ONE OWED ANNOTATION `docs/next-steps.md`'s gate-7 insert names, NOW DISCHARGED.** **READER: this pass (the
gate-8 item-10d documentation reviewer); it RAN NOTHING (no shell, no suite, no pin invocation, no battery, no
Electron boot), its wall being read/search + doc-write, so every figure below is either a `VERIFIED-BY-READ` (a read
of `scripts/live-drive.mjs` this pass took, the symbol and block named at each cell) or a `RECORDED READING` quoted
with its measurer.**

**THE THREE FINDINGS THAT MOVED — `C-4` · `C-5` · `C-6` — ARE CLOSED AT THIS HEAD, each with its closure read AT THE
LANDED SITE, each `VERIFIED-BY-READ` by this pass in the driver source:**

1. **`C-4` (the pin's derived clause — the dead derived-clause guard) — CLOSED.** The guard is no longer a
   mis-statement: `buildFailingClause` now DERIVES the classification instead of stamping it — `const undriven =
   realInput !== true && (path === null || path === 'state-read (no gesture; state row)')` and `const verdict = park
   === true ? 'PARKED' : (undriven ? 'NOT-DRIVEN' : 'FAIL')` — so **a path-less non-PASS reads `NOT-DRIVEN`, never
   `FAIL`**, and the `required` position carries the row's own value or the **NAMED sentinel**
   `UF_NO_REQUIRED_VALUE = '(no required value recorded)'` rather than the assertion sentence. `ufDerivedFailingClause`
   routes through that same classifier. **The clause's own comment states the guard is a guard, not a mis-statement**,
   which is the disposition `C-4`'s row asked for. **OWNER OF THE RECORD: this row; the `tests/**`-side guard clause
   is the TestWriter's where a pin rule names it.**
2. **`C-5` (the park marker — a PARKED row can print WITHOUT A REASON) — CLOSED.** The substitution is made in ONE
   place (`buildReportRow`): `const parkedReason = r.park === true ? UF_NO_PARK_REASON : null` then
   `r = { ...r, parkReason: r.parkReason ?? parkedReason }`, with `UF_NO_PARK_REASON = '(no parkReason recorded)'`;
   and the `ROW` print path carries it — `const parkText = r.park === true ? \` parkReason=…\` : ''`. **The two
   reason-less park sites the finding measured are now set**: the `UF-HIST-4` and `UF-HIST-6` park sites each carry
   their own `parkReason` string (`the journal could not be walked to the at-base precondition (…)` and `the journal
   holds no OLDER point to click (…)`), so the sentinel is the fallback and not the reading. **`RECORDED READING;
   measurer: the implementer's landing pass, quoted at `§15.2` `C-1`** — the three landed `verdict=PARKED` `ROW`
   lines print `parkReason` **3 of 3 live**. **Both halves were read by this pass; the live 3/3 is quoted, not
   re-measured.**
3. **`C-6` (the click record — attached PER BLOCK, so a row could print a click it did not drive) — CLOSED.** The
   attachment is now **PER ROW**: `ufAttachClickRecords` (a) gives every attributed row a **DISTINCT** click of its own
   path (`const hit = attributed.length === 1 ? pool[pool.length - 1] : (i < pool.length ? pool[i] : null)`,
   **without wraparound**), (b) **WITHHOLDS the block-wide count from any block carrying more than one attributed
   row** (`if (attributed.length > 1) res.clickRecord.clicks = null` — printed `clicksDriven=null`), and (c) gives a
   row whose OWN path is a driver-failure path (`missing` / `off-viewport` / `zero-box`) **its own failure record**
   (`realInput:false`, its own selector, `clicks: null`) rather than one of the block's landed clicks. The three
   states are therefore distinguishable in the artifact. **`RECORDED READING; measurer: the implementer's landing
   pass** — the live battery's click records read **`29` numeric single-click records + `24` `clicksDriven=null`
   records (the withheld multi-row case) + `15` rows carrying NO record at all (no gesture driven)**, with **no row
   printing a selector, coordinate or count it did not drive**. **The CODE arms are `VERIFIED-BY-READ` by this pass;
   the `29`/`24`/`15` split is the landing reading quoted with its measurer and is NOT re-derived here.** **`C-6`'s
   neighbouring limb (that `0` FAIL rows printed `failingClause=null`) is a DIFFERENT item, already closed, and is
   NOT the ground of this closure — the row at `§15.2.3` says so.**

**THE CORRECTED PARTITION, PRINTED BESIDE THE OLD ONE SO BOTH ARE CHECKABLE (the four columns are a PARTITION: each
of the `35` ids counted exactly once):**

| The partition | CLOSED | CLOSED-AND-LIVE-PROVEN | STILL-OPEN | FALSIFIED | The arithmetic |
| --- | --- | --- | --- | --- | --- |
| **THE OLD (the `35`-id table above, at the gate-4 head it counted)** | **`26`** | **`3`** | **`5`** | **`1`** | **`26 + 3 + 5 + 1 = 35`** |
| **THE CORRECTED (this pass, at this head)** | **`29`** (`A`'s `10` + `B`'s `12` + `C`'s `7` — the `4` of the old cell **plus `C-4` · `C-5` · `C-6`**) | **`3`** (`C-1` · `C-2` · `C-3` — unchanged) | **`2`** (`C-10` · `C-11`) | **`1`** (`A-1`, with its `A-4(i)` limb) | **`29 + 3 + 2 + 1 = 35`** |

**SO THE ANSWER TO THE CENSUS'S OWN OWED QUESTION, STATED PLAINLY: THE PARTITION ARITHMETIC DOES MOVE — from
`26 + 3 + 5 + 1 = 35` to `29 + 3 + 2 + 1 = 35`** — and the move is entirely inside the `C` pass: its
`3 + 4 + 5 = 12` becomes **`3 + 7 + 2 = 12`**. **The `A` and `B` columns are untouched (`10 + 1 = 11`; `12`).**

**THE THREE ITEMS THAT DID *NOT* MOVE, RECORDED SO THE CORRECTION IS NOT OVER-READ:**
**`C-10` and `C-11` stay STILL-OPEN in the partition** — their closures are `NOT RECORDED` to this pass (§15.5 item 4
is the cell that says so, and it now names these two): the pin at this head DOES carry re-statements that address
each one's class (`⟨RE-STATED 2026-10-01 by the TestWriter under finding C-10 …⟩` declares that the factor strings now
decompose the arms BY CLASS through `registerArmCensus` + `declaredFactorClassOffences`, and the in-source records for
`C-11`'s file-wide-arm and frozen-digest limbs carry dated re-statements), but **a pin-side re-statement is not by
itself the closure reading this record requires, and this pass cannot run the pin to take one** — what settles them is
the next gate-4 confirm pass (§15.4 item 7). **`A-1` stays FALSIFIED and `C-7`'s arm re-statement stays owed at its own
row** (the pin's three `R-13` arms are recorded GREEN at this head — see `§16.1-e`'s `77 passed (77)` reading and the
`§17` note on the pin's stale in-source comment — so the `C-7` arm's `staged-red` state reads as SPENT and the
in-source text that still says otherwise is an owed `tests/**` annotation, not an open driver item).**

**NO ID IS COUNTED TWICE AND NONE IS DROPPED by the corrected reading: every one of the `35` ids appears in exactly
one cell of either table, `A-4`'s two limbs stay inside ONE id, and the `C-8` counting note above is untouched (its
row-level `closed-and-live-proven` label still reads beside the partition's plain `CLOSED` column, and it is still
counted exactly ONCE).**

### 15.2 THE FINDINGS, EVERY ID, IN THE `§3b`-class shape (layer · one line of evidence · disposition · owner)

**The shape, stated once because it is the duty's own requirement:** **LAYER** is `HOST` (`scripts/live-drive.mjs`
and/or the `tests/live-driver-contract.test.ts` pin) **or `PACKAGE`** (`node_modules/provident-ssr/**` /
`../Provident-Electron/**` — **a package finding is a HANDOFF item and is NEVER patched here, and these passes
found none: the package column of this table is an EMPTY SEARCH, stated plainly**); **ONE LINE OF EVIDENCE** is the
reading the pass measured, quoted as its reading, never re-derived here; **DISPOSITION** is
**`closed` / `closed-and-live-proven` / `staged-red` / `owed`**; and **OWNER** names who closes it.

#### 15.2.1 PASS 1 — `A-1`…`A-11` (the only two falsified limbs in this whole record live here)

| Id | Layer | One line of evidence (the pass's reading) | Disposition at this head | Owner |
| --- | --- | --- | --- | --- |
| **`A-1`** | **HOST** — the pin and the register arithmetic | **FALSIFIED BY THE SUPERVISOR'S OWN MEASUREMENT:** the pass read the register arithmetic as mismatching the file, with **three pin assertions allegedly red** and **`P-IM-2` allegedly running `19` arms against `14`**; the measurement read the pin **`69 passed (69)`** with its per-row **`executed + class-(b) === declaredTotal`** assertions holding. **`FALSIFIED-BY-MEASUREMENT`** (§15.3.3). **NOT to be resurrected without new evidence.** | **`owed` — NOTHING: discharged by falsification** (nothing is owed on a falsified finding; a re-filing needs fresh evidence) | **Nobody** — the falsifying measurer is the supervisor; any re-filing is a later pass's act and must carry new evidence |
| **`A-2`** | **HOST** — `mcpTool`/the precondition classifier | **CLOSED:** `isError` was dropped by `mcpTool`, which left the precondition classifier **decorative** (a refused call could not be told from a satisfied one). | **`closed`** (first remedy round) | the implementer of this unit, with its TestWriter |
| **`A-3`** | **HOST** — the seed route | **CLOSED:** `--no-seed` could turn a **missing fixture** into a **THROWING block counted as an app FAIL**. | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-4(i)`** | **HOST** — `buildReportRow` | **NOT REPRODUCED / FALSIFIED:** the pass read a `rowResult` `extra`'s `park:true` as **dropped by `buildReportRow`**; **the runner reads `park` off the same raw result**, so the drop does not occur. **`FALSIFIED-BY-MEASUREMENT`** (§15.3.3). | **`owed` — NOTHING: discharged by falsification, NOT-REPRODUCED** | **Nobody** — falsified by measurement; a re-filing needs new evidence |
| **`A-4(ii)`** | **HOST** — the per-block pre-flight | **CLOSED:** the per-block pre-flight **REPAIRED THE PERSISTED VISIBILITY SET**, which destroyed the very precondition `persistence_v2` asserts. | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-5`** | **HOST** — the declared row's scope | **CLOSED:** the **shared declared row's scope loophole**. | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-6`** | **HOST** — the counting shape | **CLOSED:** **bare-shape counted blocks named nowhere** in the report's arithmetic. | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-7`** | **HOST** — the pinned arms | **CLOSED:** a **vacuous printed-line arm** (an arm that could not fail). | **`closed`** (first remedy round) | the TestWriter (the pin is `tests/**`) |
| **`A-8`** | **HOST** — the click path | **CLOSED:** **`cdp.click` threw on a missing selector**, out of a verdict path (a throw is not a verdict). | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-9`** | **HOST** — the evidence field | **CLOSED:** **empty evidence reachable dynamically** (a FAIL whose `evidence` could come out empty, the `repro_dup_para` class). | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-10`** | **HOST** — the launch profile | **CLOSED:** the **launch profile was unrecorded**, and an **empty `--groups=` silently WIDENED** the effective set — so a reading could not state which profile produced it. | **`closed`** (first remedy round for the empty-`--groups=` limb; the `LAUNCH PROFILE` line carrying the EFFECTIVE group set is its recorded closure at the third remedy round) | the implementer of this unit |
| **`A-11`** | **HOST** — the restore helper | **CLOSED:** the restore helper's **`restored:true` false negative** (it reported a restore that had not happened). | **`closed`** (first remedy round) | the implementer of this unit |
| **`A-4`** | **HOST** (one id, two limbs) | **DISPOSITIONED PER LIMB, NEVER AVERAGED:** **`A-4(i)` FALSIFIED/NOT-REPRODUCED** and **`A-4(ii)` CLOSED** (both rows above). **The id is ONE finding in the census (§15.0-a).** | **`closed` + falsified limb — see `A-4(i)`/`A-4(ii)`** | per limb: **Nobody** (`(i)`) · the implementer (`(ii)`) |

#### 15.2.2 PASS 2 — `B-1`…`B-12` (two BLOCKING, both live-verified closed)

| Id | Layer | One line of evidence (the pass's reading) | Disposition at this head | Owner |
| --- | --- | --- | --- | --- |
| **`B-1`** | **HOST** — the per-block pre-flight (BLOCKING) | **CLOSED (live-verified):** the narrowed pre-flight left **`uf_panes_1` reading the DRIVER'S OWN PRIOR BLOCK'S ARTIFACT**; round 3 chose the **sanctioned per-block restore** and **all four scoped readings now AGREE with the full battery** (`uf_panes_1=PASS` in both orders). | **`closed`** (third remedy round; live-verified) | the implementer of this unit, with its TestWriter |
| **`B-2`** | **HOST** — `uf_settings_7`'s position dependence (BLOCKING) | **CLOSED (live-verified):** **`uf_settings_7` was position-dependent**, so **its reported isolated exit-0 was NOT PRODUCIBLE**; the scoped and full-battery readings now agree (`uf_settings_7=PASS`), and `uf_panes_14` now emits `U-2`+`U-3`. | **`closed`** (third remedy round; live-verified) | the implementer of this unit, with its TestWriter |
| **`B-3`** | **HOST** — the declared `blocks` set | **CLOSED:** a **declared `blocks` promise NOTHING HONOURED** (a `MATRIX_ROWS` entry could name contributors that emitted nothing) — closed by the third remedy round's emission work. | **`closed`** (third remedy round) | the implementer of this unit |
| **`B-4`** | **HOST** — the missing-control path | **CLOSED AS `C-7`:** the **missing-control path was SWALLOWED BY ITS ONLY CALLER** — it stayed open into pass 3 (where the pass re-filed the state-collapse side as **`C-7`**) and was then closed: **five distinct pane-state tokens now exist**, so a control that is not rendered is distinguishable from a pane that is genuinely disabled. | **`closed`** (closed via `C-7`; `C-7`'s own arm was then `staged-red` before its closure — see `C-7`'s row) | the implementer of this unit (driver half), with its TestWriter (arm) |
| **`B-5`** | **HOST** — the precondition classifier | **CLOSED:** a classifier that **could hide the driver's OWN DEFECT AS A PRECONDITION** — the throw classifier now requires a **RESOLVED precondition** (`pre===null` stays a **loud FAIL**). | **`closed`** (third remedy round; live-verified) | the implementer of this unit |
| **`B-6`** | **HOST** — the seeding wait | **CLOSED:** the **seeding wait burned its TIMEOUT on an `isError` reply** — now on the discriminated read. | **`closed`** (third remedy round) | the implementer of this unit |
| **`B-7`** | **HOST** — the pin's register labels | **CLOSED:** **register labels out of step** with the arms — re-derived, with every row's declared factor string made to decompose **the arms the row actually RUNS**. | **`closed`** (TestWriter's third/fourth remediation passes — the pin is `tests/**`) | the TestWriter |
| **`B-8`** | **HOST** — the pin's arms | **CLOSED:** **three arms with NO MUTATION THAT CAN FIRE THEM** (vacuous arms) — re-derived with **named mutations**, and the **three missing `P-TP-1` outcome arms ADDED** (`§14.3`). | **`closed`** (TestWriter's fourth remediation pass) | the TestWriter |
| **`B-9`** | **HOST** — the pin's file-wide arms | **CLOSED:** **four FILE-WIDE token arms** left the new `cdp.click` record **unpinned** — re-derived with named mutations. | **`closed`** (TestWriter's fourth remediation pass) | the TestWriter |
| **`B-10`** | **HOST** — the counting rule | **CLOSED:** a **bare-shape counting rule** (the counting shape `A-6`'s class names) — closed by a remedy round; **its closure mechanism is `NOT RECORDED` here**, and what settles it is the supervisor's gate-cycle record for the round that closed it. | **`closed`** (remedy round — `NOT RECORDED` which) | the implementer of this unit (with its TestWriter if the pin's rule moved) |
| **`B-11`** | **HOST** — the launch profile | **CLOSED:** the **`--groups=` consequence UNRECORDED** — closed by the **`LAUNCH PROFILE` line carrying the EFFECTIVE group set** (live-verified at the third remedy round). | **`closed`** (third remedy round; live-verified) | the implementer of this unit |
| **`B-12`** | **HOST** — the pin's totality row | **CLOSED:** **no pin term for a declared `blocks` CONTRIBUTOR** — the declared-contributor-emission arm was **ADDED** to `P-TP-2` (its declared total moving `14` → `15`; `§14.3`). | **`closed`** (TestWriter's fourth remediation pass) | the TestWriter |

#### 15.2.3 PASS 3 — `C-1`…`C-12` (three BLOCKING, all closed and live-proven; one of them is this very record)

| Id | Layer | One line of evidence (the pass's reading) | Disposition at this head | Owner |
| --- | --- | --- | --- | --- |
| **`C-1`** | **HOST** — `parkRow`'s argument order (BLOCKING) | **CLOSED AND LIVE-PROVEN:** a **PARK verdict never reached the report AT ALL** — `parkRow`'s **argument mis-order**; the pass measured **live `3` `PARK` lines and `0` `verdict=PARKED` `ROW` lines**. **The landing measures `3` `verdict=PARKED` `ROW` lines**, each with its declared `dclass`, a string `evidence` and its `parkReason` verbatim. | **`closed-and-live-proven`** | the implementer of this unit, with its TestWriter |
| **`C-2`** | **HOST** — the matrix count partition (BLOCKING) | **CLOSED AND LIVE-PROVEN:** the **count partition was broken by MULTI-CONTRIBUTOR ROWS** — `pass 6 + fail 4 = 10 ≠ total 8`. **The landing measures `5 + 1 + 2 === 8 === total`**, with the new **`MATRIX AGGREGATED`** fold line (`fold=8 row verdict(s) over 10 contributing result(s); multi-contributor rows=2`). | **`closed-and-live-proven`** | the implementer of this unit, with its TestWriter (the over-strength arm was re-stated) |
| **`C-3`** | **HOST** — the ruled scope line (BLOCKING) | **CLOSED AND LIVE-PROVEN:** the **ruled scope line CONTRADICTED the matrix line** — `--block=uf_panes_14` printed **`0 of 8 in scope`** beside **`MATRIX rows (2 of 8)`**. **The landing measures the scope figure as `2 of 8`, matching its own matrix line** (`OK (scoped run: 2 of 8 declared rows in scope; 6 inconclusive)`, `coverage.rowsInScope:2`). | **`closed-and-live-proven`** | the implementer of this unit (with the `OK`-carries-its-scope form the architect ruled) |
| **`C-4`** | **HOST** — the pin's derived clause | **NOT CLOSED AT THIS HEAD:** a **DEAD DERIVED-CLAUSE GUARD** that would print the assertion as **`required`**. **The driver half is not what is owed; the guard is a `tests/**`-side clause.** | **`owed`** (STILL-OPEN) | the TestWriter (the pin is `tests/**`; the guard is a clause of the pin) **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the row is KEPT VERBATIM as its pass's reading) — THIS ROW IS **CLOSED** AT THIS HEAD, and the closure is `VERIFIED-BY-READ` by this pass in the driver: the guard is made HONEST rather than removed — `buildFailingClause` derives the classification (`undriven = realInput !== true && (path === null || path === 'state-read (no gesture; state row)')` ⇒ `NOT-DRIVEN`; `PARKED` when the row parked) and the `required` position carries the row's own value or the NAMED `UF_NO_REQUIRED_VALUE` sentinel, with `ufDerivedFailingClause` routing through it. The dead guard therefore no longer mis-states, which is what this finding required. The corrected partition is at `§15.1`.⟩** |
| **`C-5`** | **HOST** — the park marker | **NOT CLOSED AT THIS HEAD:** a **PARKED row can print WITHOUT A REASON** (`parkReason` absent — `§2.3` `H-4`'s `PARKED` row and `RCA-11` clause (b) both require the reason to be named). | **`owed`** (STILL-OPEN) | the implementer of this unit (the park path), with its TestWriter (the arm) **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the row is KEPT VERBATIM) — THIS ROW IS **CLOSED** AT THIS HEAD, and its closure is `VERIFIED-BY-READ` by this pass: `buildReportRow` makes the ONE substitution (`parkedReason = r.park === true ? UF_NO_PARK_REASON : null`, then `parkReason: r.parkReason ?? parkedReason`), the `ROW` print path carries it (`parkText` gated on `r.park === true`), and **the two reason-less park sites the finding is about are now SET — the `UF-HIST-4` and `UF-HIST-6` park sites each carry their own recorded `parkReason` string**, so the sentinel is a fallback and not the reading. `RECORDED READING; measurer: the implementer's landing pass, quoted at `§15.2` `C-1` and `§15.1`: `parkReason` prints on **`3` of `3`** live parked rows.** The corrected partition is at `§15.1`.⟩** |
| **`C-6`** | **HOST** — the click record | **NOT CLOSED AT THIS HEAD:** the **click record is attached PER BLOCK**, so **a row can print a click it did not drive** — the record's attachment point, not the click coverage. **(Its neighbouring limb — that `0` FAIL rows printed `failingClause=null` — is a DIFFERENT item and was closed by a landed fix; **it is NOT recorded here as `C-6`'s closure.**)** | **`owed`** (STILL-OPEN) | the implementer of this unit **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the row is KEPT VERBATIM) — THIS ROW IS **CLOSED** AT THIS HEAD.** **The attachment is now PER ROW** (`VERIFIED-BY-READ` by this pass in `ufAttachClickRecords`): every attributed row gets a **distinct** click of its own path and **without wraparound** (`attributed.length === 1 ? pool[pool.length - 1] : (i < pool.length ? pool[i] : null)`), the **block-wide count is WITHHELD** from any block with more than one attributed row (`if (attributed.length > 1) res.clickRecord.clicks = null`, printed `clicksDriven=null`), and a row whose own path is a driver-failure path carries **its own** failure record rather than a landed click of the block. **`RECORDED READING; measurer: the implementer's landing pass** — the live battery reads **`29` numeric single-click records + `24` withheld (`clicksDriven=null`) + `15` rows with no record (no gesture driven)**, and **no row prints a selector, coordinate or count it did not drive**. **This row's neighbouring limb is explicitly NOT its closure ground, exactly as the filed text says.** The corrected partition is at `§15.1`.⟩** |
| **`C-7`** | **HOST** — the pane-state tokens | **CLOSED:** **three pane states were collapsed into ONE TOKEN** — **five distinct tokens now** (`restored-visibility(zone:` · `disabled-restore-failed` · `missing-control (… NOT restored)` · `enabled-no-frame` · `already-expanded`). **The driver half LANDED; its arm failed twice in the pin (first an over-strength limb, then a second failure) and is the red the driver cannot fix by itself** — so the finding closed with the arm's re-statement owed. | **`closed`** (driver half landed; the **arm's re-statement is owed** — the `staged-red` state this finding carried before closure is recorded here, not smoothed) | the implementer (driver half) + the TestWriter (the arm's re-statement) |
| **`C-8`** | **HOST** — the frame census order | **CLOSED (and its closure is LIVE-PROVEN):** **`uf_panes_8`/`uf_panes_10` read frames WITHOUT the sanctioned per-block restore** — they now obtain their pane-frame census **through the sanctioned per-block restore FIRST (order read, not presence)**, isolated `--block=uf_panes_8`/`--block=uf_panes_10` **AGREE** with their full-battery verdicts (`U-6:uf_panes_8=PASS`), and the `U-2`/`U-3`/`U-4` lines are **BYTE-IDENTICAL** to the prior head's (no collateral move). **The §15.1 partition counts it in the plain CLOSED column (the row-level label here is the more precise statement of how it closed; §15.2's counting note).** | **`closed-and-live-proven`** (a green, isolated-vs-battery agreeing reading) | the implementer of this unit, with its TestWriter |
| **`C-9`** | **HOST** — the register arithmetic | **CLOSED BY `§14`** (the third amendment): the register arithmetic was re-stated at its four sites with the filed `97 = 81 + 16` KEPT VISIBLE beside the landed `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 + 16`, the two moved terms named with WHY/WHO/which pass, and `F-17` ruled **NOT TRIPPED**. **This section does NOT re-state that arithmetic; `§14` owns it.** | **`closed`** (spec side; the pin's citation was re-stated in the same round) | the spec-owning pass (`§14`) + the TestWriter (the pin's citation) |
| **`C-10`** | **HOST** — the register's factor strings | **NOT CLOSED AT THIS HEAD:** **factor strings decomposed TOTALS ONLY** — they did not decompose the arms the row runs (`§14.2`'s two-notation warning and `§14.3`'s `B-7`-class re-derivation answer part of this for two rows; **the finding as filed is not recorded as closed**). | **`owed`** (STILL-OPEN) | the TestWriter (the pin's declared strings) — with the spec-owning pass if a declared term's form moves |
| **`C-11`** | **HOST** — the pin's arm strength and a byte-literal | **NOT CLOSED AT THIS HEAD:** residual **OVER-STRENGTH FILE-WIDE ARMS** and a **FROZEN DIGEST BYTE-LITERAL** in the pin — an over-strength arm cannot fail, and a frozen digest literal goes stale the moment the file moves (`§14.6` item 5 records the pin's own identity moving inside a round). | **`owed`** (STILL-OPEN) | the TestWriter |
| **`C-12`** | **HOST / PROCESS — `pins`/`specs`** (THE RECORDING DUTY) | **DISCHARGED BY THIS SECTION:** **the contract carried NO `§3a`/`§3b`**, so three passes' findings were recorded nowhere and **`RCA-3` was unmet** (a DONE row could not cite a recorded adversarial pass). **The record is §15.1 (§3a-class) + §15.2 (§3b-class) + §15.3 (the two falsifications and the withdrawal).** | **`closed` — DISCHARGED (a RECORD, never a repair; no code, no test and no re-run)** | the spec-owning pass (this section) |

**THE `staged-red` DISPOSITION, STATED SO ITS ONE OCCURRENCE IS NOT HIDDEN.** **`staged-red` appears ONCE in this
record: `C-7`'s ARM was staged red in the pin (owner: the next driver pass) after its driver half landed — that is
the `staged-red` state `C-7`'s row names.** **No other finding in this record was `staged-red` at this head, and no
finding of the `A-`/`B-` passes was.**

**ONE COUNTING NOTE A READER WILL NEED, RECORDED RATHER THAN SMOOTHED:** **`C-8`'s row carries the
`closed-and-live-proven` disposition because a live isolated-vs-battery reading is its recorded closure, while the
§15.1 partition counts it in the plain `CLOSED` column and carries the `CLOSED-AND-LIVE-PROVEN` column as the
`C-1`/`C-2`/`C-3` set.** **The partition is what closes the census (`C` `3` + `4` + `5` `= 12`); the row-level
label is the more precise statement of HOW `C-8` closed. Where the two shapes differ, the partition governs the
arithmetic and the row governs the evidence — and `C-8` is counted exactly ONCE either way.**

### 15.3 WITHDRAWN AND FALSIFIED — the `§13.5` item 3 `SATISFIED` marking withdrawn, the two findings that must NOT be resurrected, and the two `§13.7` items it leaves unanswerable from the `--block=` space

**ANNOTATE-BESIDE (`RCA-8(c)`): NOTHING BELOW IS WRITTEN INTO `§13.5` ITEM 3, AND NOTHING IN IT IS DELETED OR
REWRITTEN. The filed cell is KEPT VERBATIM as its pass's reading and THIS is the current reading.**

**15.3.1 — THE `§13.5` ITEM 3 `SATISFIED` MARKING IS **WITHDRAWN**: THE SCOPED-REFUSAL READING FOR THE `§13.1`
`L-4` INVOCATION DOES NOT REPRODUCE.**

**THE FILED CELL, KEPT AS ITS PASS'S READING:** `§13.5` item 3 marked **SATISFIED** the class-(b) reading
**`L-4`** — *"`--block=boot_landing,vis_persist` exits `1` and prints `REFUSED — missing declared extended row(s):
UF-SETTINGS-7`"* — and read it as **the FIRST real exercise of the extended refusal** (`§2.2` `E-12` item 2 /
`§12.4` `F-13`). **THE WITHDRAWAL, WITH ITS GROUNDS, ALL OF THEM READINGS OF RECORD:**

1. **IT DOES NOT REPRODUCE: BOTH CONTRIBUTORS EMIT THEIR ROW IDS.** `vis_persist` and `uf_settings_7` are the two
   halves of the enumerated `UF-SETTINGS-7` (`§2.2` `E-11`, `§12.1`), and **both emit it** — so the premise the
   filed cell rested on (*the sibling half produced nothing*) is **false at the landed head**.
2. **`REFUSED` OCCURS IN NO INVOCATION.** The recorded scoped invocations print **`OK` with its scope attached**,
   never `REFUSED` — the landed form is `OK (scoped run: N of 8 declared rows in scope; M inconclusive)`. **The
   `REFUSED` token the filed cell quotes is not produced by any invocation of record.**
3. **THE BATTERY'S EXIT `1` COMES FROM `fail > 0`, NOT FROM THE REFUSAL BRANCH.** The driver's own expression reads
   `fail > 0 ? 1 : (!recon.ok || extendedRefused ? 1 : 0)` (`VERIFIED-BY-READ` at `§13.1`), so **an exit `1` on a
   battery carrying FAIL blocks isolates NOTHING about the refusal** — which is exactly the `NOT RECORDED` /
   `INCONCLUSIVE` note `§13.5` item 5 and `§13.1` already carry, **now applied to item 3's exit limb too.**
4. **WHAT SETTLED IT, NAMED (never re-derived here):** `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`
   (`docs/decisions.md`, `2026-09-29`) — the architect's ruling answering the `G-8`/`M-1` finding of the gate-5
   blind-greens + gate-6 live passes — which rules that a scoped run prints **`OK` ONLY with its scope attached**
   and that **a scoped row which was not driven stays INCONCLUSIVE, and a scoped run is NOT a refusal**; the
   ruling's own measured basis is the live-scenario runner's reading (**`--block=uf_settings_5` / `uf_settings_7` /
   `uf_panes_1` each printed `matrix rows executed=0 … OK` with exit `0`; the full battery printed `MATRIX rows
   (8 of 8)` + `OK`, exit `1` via `fail > 0`**). **`§6.3` `C-2` item 3's refusal expectation for a SCOPED run is
   the clause the ruling contradicts** (the gate-5/6 record names the two clauses as mutually contradicting and
   says only a spec-owning pass can reconcile them). **The reconciliation, recorded here beside the filed text:
   the refusal contract of `§2.1` `E-3` clause 2 and `§2.2` `E-12` item 2 is a FULL-BATTERY obligation, and the
   scoped-run `OK` is closed BY DISAMBIGUATION, not by refusal.**

**WHAT IS *NOT* WITHDRAWN BY THIS ITEM, stated so the withdrawal is not over-read:** **`§13.5` items 1, 2, 4, 5
and 6 STAND** (the matrix no longer printing `OK` at `2 of 8`; the report shape; the hygiene falsifier CONFIRMED
BY A RUN; the exit reading INCONCLUSIVE as a proof; the `extendedRowsRun` composition). **`§2.2` `E-12`'s refusal
obligation itself STANDS for a declared extended row whose REQUESTED blocks produced no verdict** — what is
withdrawn is **the one reading that was recorded as exercising it**, not the clause. **And the full-battery
refusal limb (`§13.5` item 1's `REFUSED — missing declared row(s): U-2, U-3, U-4, U-5, U-6, U-8`) is a SEPARATE
reading and is NOT touched by this withdrawal.**

**15.3.2 — THE `§13.7` ITEMS (`3`/`4`) THAT THIS WITHDRAWAL LEAVES **UNANSWERABLE FROM THE `--block=` SPACE**.**

| The owed item (`§13.7`) | What it asked for | Why the `--block=` space cannot answer it now |
| --- | --- | --- |
| **item `3`** — *THE SHARPER EXTENDED-REFUSAL READING* | the two-block isolation (`--block=uf_settings_7` alone, and `--block=boot_landing` alone) so that `F-13`'s exact sentence has a reading isolating ONE declaring block | **With the `§13.5` item 3 `SATISFIED` reading withdrawn, no `--block=` invocation of record produces `REFUSED` at all** — the isolation the item asks for would be **an invocation whose expected output is the very token the landed disambiguation rules out for scoped runs**. **The item is therefore UNANSWERABLE from the `--block=` space under `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`; what settles it is a ruling (or a full-battery head) that admits a scoped refusal, not another scoped run.** **OWNER: the architect / the next driver pass.** |
| **item `4`** — *THE REFUSAL-BRANCH EXIT READING* | a run with **ZERO FAIL blocks and a refused reconciliation**, to isolate `process.exitCode`'s refusal branch from its `fail > 0` branch | **No `--block=` configuration of record refuses** (item 3's ground), and the driver's own expression short-circuits on `fail > 0` FIRST — so **every recorded scoped invocation exits through the block-FAIL branch or exits `0`**, and the refusal branch is **unreachable from the `--block=` space at this head**. **The item is therefore UNANSWERABLE from the `--block=` space; what settles it is a full-battery run with zero FAIL blocks and a non-empty missing set, or an architect ruling on the branch's form.** **OWNER: the next live pass / the architect.** |

**NEITHER ITEM IS MARKED DONE, AND NEITHER IS DROPPED:** both stay **OWED** at `§13.7`, with the reason they
cannot be answered from the `--block=` space now recorded **beside `§13.7`'s filed text (that filed text is KEPT
VERBATIM and unmoved; this item is the record written beside it, at `§15.3.2`)**, and **this section changes no
clause of `§13.7`** (annotate-beside). **`§13.7` items 1,
2, 5 and 6 are untouched by this withdrawal.**

**15.3.3 — THE TWO FINDINGS FALSIFIED BY THE SUPERVISOR'S OWN MEASUREMENT, STATED PLAINLY SO THEY ARE NOT
RESURRECTED.**

**`A-1` AND `A-4(i)` ARE THE `2` FINDINGS THE RECORD CARRIES AS FALSIFIED-BY-MEASUREMENT.** **They must NOT be
resurrected without NEW EVIDENCE — a re-filing of either is a fresh finding that carries its own measurement, never
a re-citation of the pass's filed text.** **The ground, quoted with its measurer:** the **supervisor's own
measurement** read the pin **`69 passed (69)`** with its per-row **`executed + class-(b) === declaredTotal`**
assertions **holding** (so `A-1`'s *"the register arithmetic mismatches the file / `P-IM-2` runs `19` arms against
`14`"* is falsified), and read that **the runner takes `park` off the same raw result** (so `A-4(i)`'s *"a
`rowResult` `extra`'s `park:true` is dropped by `buildReportRow`"* is **NOT REPRODUCED**).
**A THIRD PASS-1 FINDING IS RECORDED AS FALSIFIED IN THE BROADER SENSE AND IS KEPT VISIBLE BESIDE THESE TWO:**
`A-1`'s pass also carried a **stale self-record** (`§14.6` item 2 reads the pin's own records as mutually
inconsistent — `69` / `71` / `74` execution counts, and a sentence still printing the superseded `81 + 16 = 97`
split *as the split "at the ruled split of §13.3"*) — **so the record that claimed the arithmetic "does not match
the file" was itself the stale one on both its count and its split.** **`§14.6` item 2 owns that reading; this
section cites it and does not re-derive it.** **This is recorded as a `tests/**`-side staleness item, NOT as a spec
defect, and its owner is the TestWriter.**

**NOTHING ELSE IS FALSIFIED.** **`A-4(ii)`, every other `A-` finding, all `12` `B-` findings and all `12` `C-`
findings are RECORDED AS FILED — none of them is withdrawn, re-labelled as falsified, or smoothed.**

### 15.4 WHAT THIS RECORD DOES NOT DO, AND WHAT IT OWES (each with its owner)

1. **IT RAN NOTHING.** No shell, no suite, no register row, no battery, no `--block=` invocation, no Electron boot.
   **No finding is re-measured, no closure is re-tested, and no figure is re-derived from another.**
2. **IT WRITES NO DONE ROW AND TOUCHES NO TRACKER.** The DONE row, the tracker rows and the delivery note are
   **the supervisor's** (§7 `X-3`, §10 item 10, §9 `T-1`); this section supplies the adversarial record the DONE
   row must cite, and **it does not write the DONE row it makes citable.** **OWNER: the supervisor.**
3. **IT ADDS NO FAIL-STATE AND MOVES NO ENUMERATION.** The fail-states stand at `F-1`…`F-17` (`§3.2` + `§12.4` +
   `§13.6`); **this section adds no `F-` row, no register row, no `BLOCKS` key, no `§5.U` slot and no pin rule.**
   **The `C-12` duty is a RECORD, not a contract clause.**
4. **IT WRITES NO CODE AND NO TEST.** Every `HOST` finding whose fix is a driver act is closed **in
   `scripts/live-drive.mjs` by the implementer's rounds**, and every pin-side act is **the TestWriter's** (`tests/**`
   is a file this pass may not write, `AGENTS.md` item 3). **The package is NEVER patched** (`AGENTS.md` item 7).
5. **IT DOES NOT RE-STATE THE REGISTER ARITHMETIC.** That is **`§14`'s**, already landed (`§14.2`'s `101`
   reading, `§14.4`'s `F-17`-not-tripped ruling). **`C-9`'s row in §15.2 cites `§14` and adds no figure to it.**
6. **THE `sha256` + LINE COUNT OF THIS FILE AT THIS HEAD: `OWED`** (§15.6; §10 item 10; `§12.9` / `§13.9` /
   `§14.9` already state the same obligation for the three earlier amendments). **This pass holds no shell and
   invents no digest.** **OWNER: a shell-bearing pass, which must also STATE the instrument it used.**
7. **THE `5` STILL-OPEN FINDINGS (`C-4` · `C-5` · `C-6` · `C-10` · `C-11`) AND THE `C-7` ARM RE-STATEMENT** —
   **OWNER: the next driver pass, with its TestWriter** (and **a gate-4 CONFIRM pass** to close them, per the
   cycle's own next action). **This section records their open status; it does not close them.** **⟨ANNOTATED
   `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the item is KEPT VERBATIM) — THE STILL-OPEN
   SET IS NOW `2`, NOT `5`: `C-4` · `C-5` · `C-6` are CLOSED at this head (their rows at `§15.2.3`, the evidence at
   `§15.2.3`'s cells, and the corrected `29 + 3 + 2 + 1 = 35` partition at `§15.1`). **`C-10` · `C-11` stay
   STILL-OPEN** with their closure readings `NOT RECORDED` to this pass (§15.5 item 4), and the **`C-7` arm
   re-statement** stays owed: the pin's three `R-13` arms are recorded GREEN at this head (`§16.1-e`), so what remains
   owed on `C-7` is an **in-source annotation** in `tests/**`, not a driver act. **OWNERSHIP UNMOVED: the TestWriter
   for the `tests/**` half, the next driver pass for the confirm cycle.**⟩**
8. **THE `§13.7` ITEMS `3`/`4` — `UNANSWERABLE FROM THE `--block=` SPACE`** (§15.3.2). **OWNER: the next live
   pass / the architect** (a ruling or a zero-FAIL full-battery head is what settles them).

### 15.5 WHAT THIS PASS COULD NOT RECORD FAITHFULLY — the `NOT RECORDED` ledger, each with what settles it

**Stated in the file's own convention (§1.5 item 4, §13.1): where the records are silent the cell says
`NOT RECORDED` and names what settles it. Nothing below is smoothed and nothing is guessed.**

1. **THE `PBT AUDIT`'S OWN PER-PASS RECORD.** §15.0 records that **each pass carried the PBT audit (over-strength /
   vacuity / declared-vs-executed honesty per register row) and that the passes' findings summarise it**. **The
   audit's per-pass tables are `NOT RECORDED` in this section** — they were never filed into this contract (which is
   the duty `C-12` names), and this pass holds no channel to them. **What settles it:** the supervisor's gate-cycle
   record for each pass, **or** the audit tables themselves when a gate pass files them. **OWNER: the supervisor /
   the next gate pass.**
2. **THE PER-PASS DATES.** All three carry the repo's working date convention (`2026-09-29`, the head's commit
   date); **the individual pass dates are `NOT RECORDED`**. **What settles them:** the gate-cycle record for each
   pass.
3. **WHICH REMEDY ROUND CLOSED `B-4` AND `B-10`, AND THE FIRST ROUND'S OWN ITEM-BY-ITEM CLOSURE RECORD.** The
   `A-` set's closures are carried as *"the first remedy round"* **without a per-finding closure record**, and
   `B-4`/`B-10` carry **no round**. **What settles them:** the supervisor's gate-cycle record.
4. **`C-4` · `C-5` · `C-6` · `C-10` · `C-11`'s CLOSURE STATUS — `STILL-OPEN` IS THE HONEST READING, NOT A
   MEASURED ONE.** Their filed texts are what this record can carry; **whether any of the five was closed by a
   landing this pass did not read is `NOT RECORDED`.** **This is the one cell a reader must not over-read: the
   five are recorded **NOT CLOSED AT THIS HEAD**, and a confirm pass is what either closes them or confirms them
   open.** **What settles them:** the next gate-4 confirm pass. **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d
   DOCUMENTATION REVIEW (`RCA-8(c)`: the cell is KEPT VERBATIM as the gate-4 record's own reading) — THE `NOT
   RECORDED` CELL IS NOW PARTLY DISCHARGED, AND ONLY PARTLY: `C-4` · `C-5` · `C-6` ARE CLOSED at this head, each
   with its landed site read (`§15.2.3`'s three cells; `VERIFIED-BY-READ` by this pass in `scripts/live-drive.mjs`),
   so the honest residual is **`C-10` · `C-11`**, whose closures REMAIN `NOT RECORDED` to this pass even though the
   pin at this head carries class-directed re-statements that name each one (`C-10`: the `⟨RE-STATED 2026-10-01 …⟩`
   factor-string re-derivation by class via `registerArmCensus`/`declaredFactorClassOffences`; `C-11`: the dated
   re-statements of the file-wide-arm and frozen-digest limbs). **A `tests/**` re-statement is NOT the closure
   reading this record requires, and this pass may not run the pin to take one** — so they stay STILL-OPEN with the
   same owner: **the next gate-4 confirm pass.**⟩**
5. **THE `3` INCONCLUSIVE DECLARED EXTENDED ROWS' IDS AND THE `22` EMITTED-UNDECLARED IDS' LIST** (`§13.1`'s
   `NOT RECORDED`, quoted here because `C-` findings rest on the extended dimension). **What settles them:** the
   run's own `EXTENDED-DECLARED-NO-VERDICT` / `EXTENDED-UNDECLARED: <row id>(<block>)` lines.
6. **THE FULL PER-ROW PRINTED OUTPUT of the runs the passes measured.** Only the figures the passes and the
   landing delivered are quoted. **What settles it:** the next full battery's own printed lines.
7. **A `PACKAGE` FINDING — NONE EXISTS TO RECORD.** The empty search is stated at §15.0-c; **it is recorded as a
   finding, and no handoff row is owed** (`AGENTS.md` item 7). **What would create one:** a `provident-ssr` /
   foundation behaviour that contradicts the upstream docs or blocks a host need — **none was found by any of the
   three passes.**

### 15.6 THE SNAPSHOT THIS FILE OWES — `§10` item 10 at this head

**⟨`2026-09-29` — THE OWED `sha256` AND LINE COUNT AFTER THIS SECTION'S BYTES: `OWED`.** **This pass holds no shell
(its wall is read/search + doc-write), so it takes neither figure, and — exactly as `§12.9`, `§13.9` and `§14.9`
already state for the three earlier amendments — a file cannot contain its own digest.** **What this file states is
the OBLIGATION and the instrument only:** `sha256sum docs/specs/unit-live-driver-verdict-integrity.md` and `wc -l
docs/specs/unit-live-driver-verdict-integrity.md`, **both to be taken AFTER this section's bytes are on disk by a
shell-bearing pass, which must also STATE the instrument it used.** **The figures belong in the landing pass's DONE
row (§7 `X-3`, §10 item 10) and in the delivery note to the supervisor, never invented here.** **The head this
section's bytes supersede is stated with its own value and is NOT rewritten: the third amendment's own filed head
is carried at `§14.9` (the `1437`-line pre-`§14` head with its own `sha256` there), and `§14`'s own post-bytes
pair is the `OWED` pair `§14.9` states — this section does NOT re-state either figure and does NOT claim to have
taken one.** **The pair for the head AFTER this section's insertions is OWED (§15.4 item 6).** **⟨ANNOTATED `2026-09-29` BY THE
GATE-7 PROOFREADER (`RCA-8(c)`: this paragraph is KEPT VERBATIM) — the LINE COUNT of the head after `§15`'s bytes is
now MEASURED and recorded at `§16.1` (`2097` lines BEFORE this gate-7 section's own bytes; instrument: the file-read
tool's own line census); the `sha256` STAYS OWED (no shell in this pass's wall). `§16` closes this file's amendment
series with a RECORD, not a clause.**⟩

---

## 16. THE GATE-7 PROOFREADER'S ANNOTATED AUDIT RECORD — the stale figures brought to their measured values with the instrument named, the `§13.5` item 3 withdrawal verified across every sibling document, the citation/section-number audit, and the claims spot-checked against the driver source

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED RECORD BLOCK: it adds a section at the foot, moves no existing
section, renumbers nothing, adds no `F-` row, no register row, no `BLOCKS` key, no `§5.U` slot and no pin rule, and
every existing `§`/id/citation remains valid. It is written `ANNOTATE-BESIDE` (`RCA-8(c)`): every site it touches
KEEPS its filed text VERBATIM with this record written BESIDE it — `§6.3` `C-2` item 3 and `§13.5` items 1/3/4/5/6
and `§13.7` items 1/2/3 now carry their own pointer notes (the sites `§15`'s head block promised), and the
superseded figures are kept visible at `§3.3`, `§12.5`, `§13.3`, `§13.8`, `§14.1`/`§14.2`.** **THIS PASS RAN
NOTHING: no shell, no suite, no `npx vitest`, no register row, no battery, no `--block=` invocation, no Electron
boot, no `md5sum`, no `sha256sum`. Its wall is read/search + doc-write, so every digest and every test count below is
a RECORDED READING quoted with its measurer, and every line count it states is its own measurement taken with the
ONE instrument it holds (the file-read tool's own line census, named at each site).** **THE CITATION DISCIPLINE IS
UNMOVED: NO LINE NUMBER APPEARS ANYWHERE IN THIS FILE — every citation here is a `path` + a symbol / a block name /
a row id / a `§section`.**

### 16.1 THE HEAD, MEASURED AND QUOTED — the instruments named per figure

| # | The figure | Its value at this head | The instrument / the measurer |
| --- | --- | --- | --- |
| **16.1-a** | `scripts/live-drive.mjs` — LINE COUNT | **`8064` lines** | **MEASURED BY THIS PASS** (instrument: the file-read tool's own line census, `scripts/live-drive.mjs`). Supersedes the `7503` → `7759` → `7865` progression recorded in `docs/next-steps.md`'s gate-cycle blocks (each of which is KEPT as its own pass's reading). |
| **16.1-b** | `scripts/live-drive.mjs` — md5 | **`fcc17e09b48b0a3a419be84e589e269c`** | **RECORDED READING; measurer: the supervisor's head reading handed to this pass (the pass's wall holds no shell, so no digest is takeable here).** |
| **16.1-c** | `tests/live-drive-contract.test.ts` — LINE COUNT | **`5473` lines** | **MEASURED BY THIS PASS** (same instrument, same path). Supersedes `4334` (`docs/next-steps.md`'s gate-cycle block) and `5167` (`§14.1` `Z-1`). **⟨RE-MEASURED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW — the pin has MOVED AGAIN since this gate-7 reading: **`6359` lines** (instrument: the file-read tool's own line census, `tests/live-drive-contract.test.ts`, read by the gate-8 pass). The `5473` above is KEPT as this record's own reading; neither figure is a digest.**⟩** **⟨RE-MEASURED AGAIN `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`; `RCA-8(c)`: the cell is KEPT VERBATIM as its gate-7 reading) — THE PIN HAS MOVED PAST **BOTH** EARLIER READINGS: the FROZEN HEAD of this re-run is **`7396` lines** (MEASURED by this pass; instrument: the file-read tool's own line census, `tests/live-drive-contract.test.ts` — the file's own terminal line count), i.e. `+1037` past this cell's `6359` and `+1923` past its own `5473`. **THE WHOLE RE-RUN'S HEAD FIGURE SET AND ITS FINDING SET ARE AT `§15.7`/`§18`**, and no reader may take `6359` or `5473` as current.**⟩** |
| **16.1-d** | `tests/live-drive-contract.test.ts` — md5 | **`7f150b394363a93ec5eed351335859ac`** | **RECORDED READING; measurer: the supervisor's head reading (as `16.1-b`).** **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW — this digest belongs to the `5473`-line head and is SUPERSEDED: the head reading handed to the gate-8 pass is **`md5 1b9100d0e58aefe8b845f7fd473f8136`** for the `6359`-line pin (RECORDED READING; measurer: the supervisor's head reading). The superseded digest is KEPT VISIBLE, never rewritten; a digest is not takeable on either pass's wall.**⟩** **⟨ANNOTATED AGAIN `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — THIS DIGEST BELONGS TO THE `6359`-LINE HEAD AND IS SUPERSEDED BY THE FROZEN HEAD OF THE RE-RUN: **`md5 71bfda004e32f11065cf5402bf0361ed`** for the `7396`-line pin (**RECORDED READING; measurer: the supervisor's frozen-head reading handed to this pass** — no shell in this pass's wall, so no digest is takeable here). The `6359`/`1b9100d0…` pair and the `5473`/`7f150b39…` pair are BOTH KEPT as their own passes' readings and NEITHER is current. **THE DRIVER PAIR MOVED TOO IN THIS ROUND: `scripts/live-drive.mjs` = `8293` lines / `md5 aa3c01ea315a3c9f9a4f6898e88dfd05`** (line count MEASURED by this pass with the same instrument; digest a RECORDED READING of the same frozen-head reading) — `+229` past `§16.1-a`'s `8064`, and the two intermediate heads (`7759`/`c7649796…`, `7865`/`f53b569e…`) stand as their passes' readings.**⟩** |
| **16.1-e** | THE PIN'S OWN INVOCATION | **`77 passed (77)`** | **RECORDED READING; measurer: the supervisor's head reading (as `16.1-b`).** Supersedes the `71`/`74` readings of `docs/next-steps.md` and `§14.1` `Z-2`. **The pin was being edited by a PARALLEL `tests/**` PASS WHILE THIS AUDIT RAN, so this figure belongs to the head this pass was handed and may move again under the next reader; `§16.6` records that explicitly.** **⟨ANNOTATED AGAIN `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — THE FIGURE HAS MOVED AGAIN, AS WARNED: THE FROZEN HEAD OF THE RE-RUN READS **`80 passed (80)`** for the `7396`-line/`71bfda00…` pin (**RECORDED READING; measurer: the supervisor's frozen-head reading**; the pass holds no shell), with **NO RED ARM IN THE PIN** — the `77`/`74`/`71`/`69` readings below are EACH kept as their own pass's reading and NONE is current. **AND THE WHOLE SUITE MOVED WITH IT: `§16.1-f`'s `3 failed | 4565 passed | 57 skipped (4625)` is superseded by `3 failed | 4568 passed | 57 skipped (4628)` — the SAME THREE carried reds (`§16.1-g`), so the delta is pass-count growth and NOT a new red.**⟩** |
| **16.1-f** | THE WHOLE SUITE (`npm test` / `npx vitest run`) | **`3 failed \| 4565 passed \| 57 skipped (4625)`** | **RECORDED READING; measurer: the supervisor's head reading (as `16.1-b`).** The three reds are named at `16.1-g`. Supersedes `3 failed \| 4559 passed \| 57 skipped (4619)` (`docs/next-steps.md`'s gate-cycle block) and `3 failed \| 4557 passed \| 57 skipped (4617)` (the gate-5 blind artifact's `§4.3`). **⟨ANNOTATED AGAIN `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — SUPERSEDED BY THE FROZEN HEAD: **`3 failed \| 4568 passed \| 57 skipped (4628)`** (**RECORDED READING; measurer: the supervisor's frozen-head reading**). THE THREE REDS ARE THE SAME THREE THIS CELL NAMES (`16.1-g`: the carried `P-SM-1` + the two FOUNDATION-PIN reds `P-IM-pd-pin-1` and `pd-vendor-set` `§3.3` item 2) — **NOT ONE OF THEM IS THIS UNIT'S AND NOT ONE IS IN `tests/live-drive-contract.test.ts`** — `typecheck`/`build` exit `0` (same measurer). The `4565` above is KEPT as this record's own reading.**⟩** |
| **16.1-g** | THE THREE REDS AT THIS HEAD | the CARRIED baseline `P-SM-1` (`archive/tests/2026-10-04-unit-stage-active-tab-display-pbt-generators.test.ts`, defect row `PANE-TOGGLE-STAGE-COLLAPSE`) **+ TWO FOUNDATION-PIN reds** — `tests/pd-vendor-pin-refresh-register.test.ts` `P-IM-pd-pin-1` and `tests/pd-vendor-set.test.ts` `§3.3` item 2 | **RECORDED READING; measurer: the supervisor's head reading (as `16.1-b`), consistent with the standing row `DECIDED: FOUNDATION-PIN-FAULT-ORDERED-REFRESH-2026-09-29`** (whose consequence cell records the same three-red composition and the ORDERED four-site pin-refresh unit). **No red is in `tests/live-drive-contract.test.ts`.** |
| **16.1-h** | THIS FILE — LINE COUNT | **`2097` lines BEFORE this section's bytes** | **MEASURED BY THIS PASS** (same instrument, this path). Supersedes `1437` (`docs/next-steps.md`'s frozen head) and `1784` (`docs/next-steps.md`'s `C-9` block). **The post-`§16` pair remains `OWED` (§14.9 / `§15.6` / `§16.7`): a file cannot state its own digest, and this pass may not re-take the count after its own bytes.** |
| **16.1-i** | THIS FILE — `sha256` | **`OWED`** | **Not takeable by this pass (no shell). Owner: a shell-bearing pass, which must also state its instrument (`§10` item 10).** |
| **16.1-j** | THE SIBLING ARTIFACTS THIS PASS MEASURED (line counts, same instrument) | blind-greens artifact `docs/specs/unit-live-driver-verdict-integrity-greens.md` = **`559` lines**; `docs/next-steps.md` = **`2483` lines**; `docs/defects.md` = **`282` lines**; `docs/pending.md` = **`227` lines**; `docs/decisions.md` = **`290` lines**; `docs/HANDOFF.md` = **`194` lines** | **MEASURED BY THIS PASS** (file-read tool's line census, per path, at the head BEFORE this pass's writes). |

**NOT MEASURED BY THIS PASS, stated so no cell over-claims:** the pin's arm count AS A COUNT OF ARMS (the only arm
figure of record is the register's declared/executed budget, `§14.2`'s `101 = 85 + 16`, which this pass read in the
pin's own `TALLY` row at `tests/live-drive-contract.test.ts` and did NOT re-execute); the driver's `md5`; the file
count of the whole suite; any `dist/` size (**no `dist/` figure is claimed FOR THIS UNIT** — the only `dist/` figure
in the wider trackers is a `PD-UI-6`-era `dist/renderer/renderer.js 1011.9kb` reading inside a dated
`docs/next-steps.md` branch-state block, left untouched); and every battery figure (`extendedRowsRun`,
`3 PARKED`, the block split), which belongs to the live layer and to another pass's run.

### 16.2 THE REGISTER ARITHMETIC — `97`/`81 + 16` reads as current NOWHERE, and the landed `101` is the reading at every site

**THE LANDED READING (unchanged by this pass): `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side +
16 named class-(b) NOT-RUN`, `7` rows, the two moved terms `P-TP-1` (`16 → 19`) and `P-TP-2` (`14 → 15`).** **This
pass READ the pin's own arithmetic rows and found them consistent with `§14.2`'s table:** the `it` title at
`tests/live-drive-contract.test.ts` carries BOTH values (`as filed §12.5 prints 6 + 14 + 16 + 17 + 16 + 14 + 14 = 97;
the third amendment's landed reading is 6 + 14 + 16 + 17 + 19 + 15 + 14 = 101`), the two summed assertions read
`101`, and the `[register] TALLY` line is built from the declared totals (`VERIFIED-BY-READ`; reader: this pass — a
read of the pin's own source, never a run). **THE FOUR SPEC SITES** whose filed `97` is kept visible with the `101`
annotated beside it all resolve (`§3.3`'s census table + its third-amendment paragraph, `§4.2`'s arithmetic line and
the seven-row table, `§12.5`'s printed-arithmetic sentence, `§13.3`'s per-row table TOTAL rows) — **and `§13.8`'s
filed sentence *"the `97` total … is unmoved"* was the ONE site where a reader could still take `97` as current: it
was NOT among the sites `§14.2` enumerates as already annotated, so THIS PASS ADDED THE ANNOTATION BESIDE IT (the
sentence kept verbatim; the note names `101` as the reading of record and keeps the seed, the stop-after-5 rule and
the caps as what genuinely stands).** **NO TRACKER SITE READS `97` AS THE CURRENT TOTAL:** in
`docs/next-steps.md` the `97` occurrences are (i) the gate-3 one-pass remand's historical reading, (ii) the
`C-9` block's superseded-vs-landed pair, and (iii) the gate-2 filing's `83`; the same block states the landing as
**`85 executed + 16 class-(b) = 101`**. **NO ANNOTATION WAS NEEDED, and none was invented** — recorded here so the
next reader knows the arithmetic was AUDITED, not overlooked. **The `F-17` ruling stands undisturbed** (a declared
total RAISED by landed arms is not the *"lowered to match what ran"* defect, `§14.4`).

### 16.3 THE `§13.5` ITEM 3 WITHDRAWAL — VERIFIED ACROSS EVERY SIBLING DOCUMENT, WITH THE THREE SITES THAT STILL ASSERTED IT AS CURRENT ANNOTATED

**THE TEST THIS SECTION APPLIES: does any document OTHER than this file still assert the `§13.1` `L-4`
scoped-refusal reading (`--block=boot_landing,vis_persist` exits `1` and prints `REFUSED — missing declared extended
row(s): UF-SETTINGS-7`) as CURRENT?** **The search was a read of `docs/**` for the `REFUSED` token and for the
scoped-run/`OK` shapes, and its results are these.**

| Where | What it asserted | Disposition by this pass |
| --- | --- | --- |
| `docs/specs/unit-live-driver-verdict-integrity.md` `§13.5` item 3 (the marking itself) | `SATISFIED` — *"the FIRST real exercise of the extended refusal"* | **ALREADY WITHDRAWN at `§15.3.1`**, and — because `§15`'s head block promises the withdrawal BY ANNOTATION AT THE SITE while item 3 held none — **a pointer note was ADDED AT THE CELL (`§16` head; not a rewrite).** |
| The same file's `§6.3` `C-2` item 3 | *"A scoped run prints `REFUSED` naming the missing rows and exits non-zero … no longer reads `OK`"* | **ANNOTATED BESIDE with the withdrawal, its grounds and its limits; the filed text is KEPT.** `§15.3.1` had already named this clause as the one the ruling contradicts; the site note now makes the cross-reference resolve. |
| `docs/specs/unit-live-driver-verdict-integrity-greens.md` — `G-8`'s expectation and its `FAIL` classification, `G-14`, `G-18`, `G-7` | a scoped run must print `REFUSED` + non-zero (`G-8`, `G-14`, `G-18`), and `G-7`'s refusal-exit limb | **ANNOTATED BESIDE at each scenario (the gate-5 run record is NOT rewritten)**: `G-8`'s expectation is **SUPERSEDED BY `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`** (an `OK` must now carry its scope, so the landed form is `OK (scoped run: N of 8 declared rows in scope; M inconclusive)` and the artifact must not still demand a refusal), and **`G-7`/`G-14`/`G-18` are UNREACHABLE-LIMB readings, not failures** (`§15.3.2`). |
| `docs/next-steps.md` line-block of the gate-2 filing (two sites: the *"THE NEXT ACTION"* paragraph and the unit's gate-2 insert) | the class-(b) red set reads *"a scoped run printing `REFUSED` non-zero"* | **ANNOTATED BESIDE at this pass's anchored insert** (the two filed paragraphs are KEPT): the class-(b) reading has landed in the ruled disambiguated form, and the scoped-refusal limb is WITHDRAWN. |
| `docs/pending.md`'s parked live-driver row | *"until the matrix mapping is fixed, `OK` from `reconcileMatrixRows` may NOT be read as a pass"* + the revisit condition *"the next live-driver pass"* | **ANNOTATED BESIDE**: the revisit has FIRED (this unit IS the next live-driver pass), the matrix mapping is landed (`8 of 8`), and the `OK`-reading rule is now met BY DISAMBIGUATION (the scope rides the line), not by refusal. |
| `docs/defects.md` — `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE` and `LIVE-DRIVER-EVIDENCE-LOSS` | the owner rows the unit closes | **LEFT UNCHANGED, and this is a finding of the audit rather than an omission: a read of both rows and their 2026-09-29 annotations found NO assertion of the scoped-refusal reading as current** (the word/`REFUSED` shape does not appear in either row), so no annotate-beside was owed there; the DEFECT's scoped-case clause is disposed by `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE` clause (3). |
| `docs/decisions.md` — `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE` | clause (2): *"a FULL-battery run with a declared row carrying no verdict still prints `REFUSED`"* | **CORRECT AND UNMOVED** — it is the full-battery limb, which `§15.3.1` explicitly does NOT withdraw. |

**WHAT SETTLED IT, QUOTED WITH ITS MEASURER (never re-derived here):** `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`
(`docs/decisions.md`) — the architect's ruling answering the `G-8`/`M-1` finding — whose own measured basis is the
live-scenario runner's reading (`--block=uf_settings_5` / `uf_settings_7` / `uf_panes_1` each printed `matrix rows
executed=0 … OK` with exit `0`). **The landed driver's own reconciliation expression was re-read by this pass and
matches the ruling's FORM:** `OK (full battery: N of M declared rows verdicted)` for a full battery and `OK (scoped
run: N of M declared rows in scope; K inconclusive)` for a scoped one, with `REFUSED — missing declared row(s): …`
reserved for the failing branch (`VERIFIED-BY-READ`; reader: this pass, in `scripts/live-drive.mjs`'s row-set
reconciliation line and its `coverage.rowsInScope` member).

### 16.4 THE CITATION AND SECTION-NUMBER AUDIT — every citation this pass checked, and its result

1. **THIS FILE'S OWN `§`-NUMBERING RESOLVES.** `§0`–`§11` (the filed contract), `§12.1`…`§12.9`, `§13.1`…`§13.9`,
   `§14.1`…`§14.9`, `§15.0`…`§15.6` all exist as headings. **No citation in this file points at a section outside
   that set** — the `§13.5`/`§13.7` item citations (`item 1`…`item 6`) resolve to the six-row tables they name, and
   the `§12.3`/`§12.6`/`§12.7` item citations resolve to their own items.
2. **THE TWO DELIBERATE ID COLLISIONS ARE STILL DISAMBIGUATED AT EVERY SITE THIS PASS READ:** `§2.1`/`§2.2`'s
   `E-1`…`E-12` CONTRACT clauses vs `§9`'s `E-1`…`E-5` ESCALATIONS (`§11.3`'s rule: every `§2` citation reads
   *"§2.1 `E-n`"* or *"§2.2 `E-n`"*), and the gate-4 pass-local `A-`/`B-`/`C-` finding ids vs this file's `§6.1`
   `C-1`, `§6.3` `C-2`, `§10` `C-3` (`§15.0-b`). **Both hold in `§15`'s own tables.**
3. **THE BLIND ARTIFACT'S CITATIONS RESOLVE.** Its `§12.6` item 4, `§13.1` `L-3`/`L-4`, `§13.2` item 1, `§13.5`
   items 1–5, `§13.7` items 1–5, `§12.3` items 4/5, `§12.4` `F-13`/`F-15`, `§12.7` item 1, `§2.1` `E-5`, `§9`
   `T-4`/`T-5` and `§10` item 9 all resolve. **ONE HEAD-LINE STALENESS WAS FIXED BESIDE:** its *"Sources used"* line
   names the amendment series as *"`§12` and `§13`"* while the contract now carries `§12`–`§15` (plus this `§16`);
   the artifact's source list is annotated beside, not rewritten.
4. **THE TRACKER CROSS-REFERENCES THIS UNIT RELIES ON RESOLVE:** the `GAP-7`/`PD-DRIVER-MATRIX-AND-EVIDENCE` id
   (minted unit), the three named defect rows, the `GAP-8` fixture route (`§9` `T-3`), the checklist enumeration
   (`UF-STAGE-1` / `UF-SETTINGS-7`), and the two `§5.9` rows in `docs/specs/ui-feature-set-breakdown-2026-09-29.md`.
5. **A FIGURE CLAIM THAT DOES NOT EXIST ANYWHERE — checked because this unit's audit brief names it:** **THIS unit
   claims no `dist/` size and no whole-suite file count at this head** (a read search of this file and the three
   tracker paths for `dist/`, `files passed (` and `Test Files`); the file-count and `dist/` claims that DO exist in
   the wider trackers are older units' dated readings (`docs/next-steps.md`'s `PD-VENDOR-PIN-REFRESH`/`PD-UI-6`
   branch-state blocks: `208 files (1 failed / 207 passed)`, `dist/renderer/renderer.js 1011.9kb`), each labelled
   with its own measurer and left untouched. **THE ONLY FIGURES THIS AUDIT BROUGHT TO A MEASURED VALUE ARE THE LINE
   COUNTS OF `16.1` and the head readings the supervisor's invocation supplied.**

### 16.5 CLAIMS SPOT-CHECKED AGAINST THE DRIVER SOURCE — `VERIFIED-BY-READ` (reader: this pass), each with its verdict

| The claim this file makes | Where | Verdict at this head |
| --- | --- | --- |
| the reconciliation line prints `OK` only with its SCOPE attached, and `REFUSED` names the missing rows | `§2.1` `E-3`, `§2.2` `E-12`, `§15.3.1` | **HOLDS** — both `OK` forms and the `REFUSED` branch read as contracted in the driver's row-set reconciliation line; `coverage.rowsInScope` is present. |
| the report carries `failingClause` (predicate + observed + required) on every non-PASS, with a CENTRAL guarantee | `§2.2` `E-6`…`E-8` | **HOLDS** — `buildReportRow` derives a clause when the row result carries none (`r.failingClause ?? ufDerivedFailingClause(r, evidence)`), and the printed line carries `failingClause` with `observed`/`required`. |
| `parkReason` is printed on a parked row | `§2.3` `H-4`, `F-6` | **HOLDS** — the `PARK`/`ROW` print path carries `parkReason` (falling back to a named *"(no parkReason recorded)"* string), and the `[DIAG]` disposition map names the non-row blocks. |
| `MATRIX AGGREGATED` / `SHARED rows` fold a multi-contributor row BY ROW ID with the AND | `§2.2` `E-11` | **HOLDS** — both printed lines exist; the fold line reports `fold=N row verdict(s) over M contributing result(s); multi-contributor rows=K`. |
| the per-block PRE-FLIGHT RESTORE is the sanctioned route and reads the zone as a STATE | `§2.3` `H-1`/`H-2`, `§13.4` | **HOLDS** — the restore helper reads the zone state before any frame read and reports the state by name. |
| the five distinct pane-state tokens exist (the `C-7` driver half) | `§15.2` `C-7` | **HOLDS** — `restored-visibility(zone:`, `disabled-restore-failed`, `missing-control (… NOT restored)`, `enabled-no-frame`, `already-expanded` all read in the helper. |
| `blocksRun` is INFORMATIONAL and may not decide coverage | `§2.1` `E-5`'s contract table | **HOLDS** — the reconciliation line prints `blocks run=… (informational)` and `coverage.fullBattery` is derived from the requested-block/declared-row dimensions, not from `blocksRun`. |
| the refusal/scope form the ruling pins is NOT weakened by the disambiguation | `§2.1` `E-3` clause 2 | **HOLDS** — the failing branch still names the missing rows; only the SCOPE rides the `OK`. |
| no `src/**`, `tests/**` or `scripts/**` byte is touched by this audit | this section's head | **HOLDS BY CONSTRUCTION** — the writes this pass made are `docs/**` only: this file, its `-greens.md` artifact, `docs/next-steps.md`, `docs/pending.md` and `docs/HANDOFF.md`'s CURRENT STATE paragraph, all annotate-beside. |

**NO CLAIM CONTRADICTING THE DRIVER SOURCE WAS FOUND.** **The ONE tests/**-side figure that contradicts the tree is
the pin's own trailing arm-section comment, which still names *"the digest of record at the current head"* as the
driver's `f53b569e…` / `7865` lines — a head that has since moved (`16.1-a`/`16.1-b`); that file is outside this
pass's write wall and the finding is filed to its owner (the TestWriter) at `§14.1`'s appended note and at
`§16.6` item 2.

### 16.6 WHAT THIS PASS COULD NOT SETTLE, each with what settles it

1. **THE PIN'S OWN INVOCATION AND THE WHOLE-SUITE COUNTS ARE RECORDED, NOT MEASURED — AND THE PIN WAS MOVING.**
   This pass's wall holds no shell, so `77 passed (77)` and `3 failed | 4565 passed | 57 skipped (4625)` are the
   supervisor's head readings quoted with their measurer, and a PARALLEL `tests/**` PASS WAS EDITING THE PIN IN THIS
   SAME ROUND — so the pin's line count (`16.1-c`), its digest (`16.1-d`) and its pass count (`16.1-e`) may all move
   under the next reader. **What settles it:** one shell-bearing pass taking `wc -l` + `md5sum` on
   `scripts/live-drive.mjs` and `tests/live-drive-contract.test.ts` and one `npx vitest run
   tests/live-drive-contract.test.ts` at the frozen head, with the instrument stated.
2. **THE PIN'S STALE IN-SOURCE DIGEST COMMENT** (`f53b569e…` / `7865` lines, `VERIFIED-BY-READ` by this pass).
   **Owner: the TestWriter** (`tests/**`; `C-11` is the filed finding, whose *"FROZEN DIGEST BYTE-LITERAL"* limb this
   record instantiates). **What settles it:** the re-statement that prints the superseded digest beside the current
   one, with the teeth unmoved.
3. **THE CURRENT HEAD'S BATTERY FIGURES** (`extendedRowsRun`, the `PARKED` count, the block split, the click-record
   coverage). Three readings of record disagree by head — `53` (landing pass, `§13.2`), `55` with `3 inconclusive` /
   `24` undeclared (gate-5 blind pass, its `§4.2` `G-15`), and the older `54` (`M-9`) — and this pass ran no battery.
   **What settles it:** the next full-battery run's own printed `EXTENDED rows (… of 32 defined …)` and
   `done: N blocks, … PARKED …` lines.
4. **THE PIN'S ARM COUNT AS A COUNT** — the register's declared/executed budget is `101 = 85 + 16` (`§14.2`,
   `VERIFIED-BY-READ` in the pin's source), but **the pin's own `it()` count is a moving number this pass did not
   execute**. **What settles it:** the pin's runner summary at the frozen head.
5. **`§13.7` ITEMS 3/4 AND THE `C-` FINDINGS STILL OPEN** (`C-4` · `C-5` · `C-6` · `C-10` · `C-11`, and `C-7`'s arm
   re-statement). **This record confirms their status is UNCHANGED at this head and closes none of them**; what
   settles them is a gate-4 confirm pass (`§15.4` item 7). **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d
   DOCUMENTATION REVIEW (`RCA-8(c)`: the item is KEPT VERBATIM as the gate-7 record's own reading) — THE SET HAS
   MOVED SINCE THIS PASS: `C-4` · `C-5` · `C-6` ARE CLOSED (`§15.2.3`'s three cells; the corrected
   `29 + 3 + 2 + 1 = 35` partition at `§15.1`), so the open set is **`C-10` · `C-11`** plus the `C-7` **in-source**
   annotation (the three `R-13` arms themselves are recorded GREEN at `§16.1-e`; what still reads `STAGED … owner:
   the next driver pass` is the pin's own comment text, an owed `tests/**` act). `§13.7` items 3/4 remain
   UNANSWERABLE-FROM-THE-`--block=`-SPACE as recorded above.⟩**

### 16.7 WHAT THIS RECORD DOES NOT DO

1. **IT RAN NOTHING.** No shell, no suite, no leg, no battery, no Electron boot, no digest.
2. **IT WRITES NO DONE ROW AND CLOSES NO FINDING.** The DONE row, the tracker rows and the delivery note are the
   supervisor's (`§7` `X-3`, `§10`, §15.4 item 2). **`C-4`/`C-5`/`C-6`/`C-10`/`C-11` and `C-7`'s arm stay OPEN.**
   **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the item is KEPT VERBATIM as
   this record's own reading) — THE STATEMENT IS TRUE OF THIS RECORD'S PASS AND OF THIS RECORD: it closed nothing.
   THE STATUS AT THIS HEAD IS `C-4` · `C-5` · `C-6` CLOSED (read at their landed sites, `§15.2.3`; the corrected
   `29 + 3 + 2 + 1 = 35` partition at `§15.1`), **`C-10` · `C-11` STILL-OPEN with their closures `NOT RECORDED`**
   (`§15.5` item 4), and the **`C-7` arm re-statement** owed as an IN-SOURCE `tests/**` annotation (the arms
   themselves are recorded GREEN at `§16.1-e`). `§17` (the gate-8 record) carries the disposition table.⟩**
3. **IT ADDS NO CLAUSE, NO FAIL-STATE AND NO REGISTER ROW.** The fail-state enumeration stands at `F-1`…`F-17`; the
   register stands at `7` rows × `101`; `MATRIX_ROWS` stands at `8`, `U-1`..`U-8`.
4. **IT ADDS NO NEW ASSERTION ABOUT THE APP** and makes neither of the two claims this unit may never make: the layer
   stays HARNESS/`[D]`, and the app layer's own FAIL pile is untouched and owned by other rows (`§9` `T-4`, `RCA-12`).
5. **THE POST-`§16` SNAPSHOT OF THIS FILE IS `OWED`** (`16.1-h`/`16.1-i`): a shell-bearing pass takes the line count
   and the `sha256` and states its instrument.

---

## 17. THE GATE-8 ITEM-10d DOCUMENTATION REVIEW'S RECONCILIATION RECORD — the `§15.1` census cell discharged with the corrected partition beside the old one, the register arithmetic verified at every site, the head-figure set brought to this head's measured values, the citation/section audit, and everything left owed with its owner

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED RECORD BLOCK: it adds a section at the foot, moves no existing
section, renumbers nothing, adds no `F-` row, no register row, no `BLOCKS` key, no `§5.U` slot and no pin rule, and
every existing `§`/id/citation remains valid. It is written `ANNOTATE-BESIDE` (`RCA-8(c)`): every site it touches KEEPS
its filed text VERBATIM with this record written BESIDE it — the `§15.1` census cell and partition, the `§15.2.3`
`C-4`/`C-5`/`C-6` rows, `§15.4` item 7, `§15.5` item 4, `§16.1-c`/`§16.1-d` and `§16.6` item 5 each now carry their own
note.⟩**

**WHAT THIS GATE IS, AND WHAT IT IS NOT.** It is the **`AGENTS.md` item 10d documentation review** (`RCA-6`): the
read-only reconciliation of this unit's documentation against the ACTUAL repo/build state, run AFTER the greens and
BEFORE the unit may be reported done. **It is NOT the gate-7 proofreader pass** (whose record is `§16`) and **it is NOT
a gate-4 adversarial pass** — it hunts doc drift, not edge cases. **It fixes DOCUMENTATION ONLY: not one byte of
`src/**`, `scripts/**` or `tests/**` was written by this pass.** Its review record is
`archive/reviews/2026-09-29-U-LIVE-DRIVER-VERDICT-INTEGRITY-doc-review.md` (the gitignored archive; provenance only — the
findings land in the active trackers and at the sites above).

**THE HONESTY BLOCK, STATED FIRST (`§1.5`'s convention, unmoved).** **THIS PASS RAN NOTHING: no shell, no suite, no
`npx vitest`, no pin invocation, no register row, no battery, no `--block=` invocation, no Electron boot, no `md5sum`,
no `sha256sum`. Its wall is read/search + doc-write.** **Every figure below is either a `RECORDED READING` quoted with
its measurer (the supervisor's head reading; the implementer's landing pass; the blind-test writer) or a
`VERIFIED-BY-READ` with this pass named as the reader and the symbol/site named at the cell — and every LINE COUNT it
states is its own measurement taken with the ONE instrument it holds (the file-read tool's own line census).** **THE
CITATION DISCIPLINE IS UNMOVED: NO LINE NUMBER APPEARS ANYWHERE IN THIS FILE.**

### 17.1 THE FIGURES THIS PASS MEASURED OR QUOTED — the instrument named per cell

**⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`AGENTS.md` items 10b/10d, `RCA-6`) — `RCA-8(c)`, ANNOTATE-BESIDE:
THE TABLE BELOW IS KEPT VERBATIM, every cell as this gate-8 pass wrote it. EVERY FIGURE IN IT IS SUPERSEDED AT THE
FROZEN HEAD, and the frozen set is `§18.1`'s. Named here so no reader has to infer it: `17.1-a`/`17.1-b` (the driver
`8064`/`fcc17e09…`), `17.1-c`/`17.1-d` (the pin `6359`/`1b9100d0…`), `17.1-e` (`77 passed (77)`), `17.1-f` (the suite
`3 failed | 4565 passed | 57 skipped`), `17.1-g` (this file `2429` before `§17`), `17.1-i` (the six sibling line
counts) are ALL superseded by `§18.1-a`…`§18.1-j`; `17.1-h` (the `sha256`) STAYS OWED, now at `§18.3`'s owed-set row
`R-3`. **NO CELL IS REWRITTEN AND NO READING IS DELETED.**⟩**

| # | The figure | Its value at this head | The instrument / the measurer |
| --- | --- | --- | --- |
| **17.1-a** | `scripts/live-drive.mjs` — LINE COUNT | **`8064` lines** | **MEASURED BY THIS PASS** (instrument: the file-read tool's own line census, `scripts/live-drive.mjs`) — **the SAME value `§16.1-a` measured**, so the driver did NOT move between the two passes. |
| **17.1-b** | `scripts/live-drive.mjs` — md5 | **`fcc17e09b48b0a3a419be84e589e269c`** | **RECORDED READING; measurer: the supervisor's head reading handed to this pass** (no shell here; `§16.1-b` quotes the same value). |
| **17.1-c** | `tests/live-drive-contract.test.ts` — LINE COUNT | **`6359` lines** | **MEASURED BY THIS PASS** (same instrument, same path). **The pin MOVED since `§16.1-c`'s `5473`: +`886` lines** — the parallel `tests/**` pass `§16.1-e`/`§16.6` item 1 warned about. |
| **17.1-d** | `tests/live-drive-contract.test.ts` — md5 | **`1b9100d0e58aefe8b845f7fd473f8136`** | **RECORDED READING; measurer: the supervisor's head reading** (supersedes `§16.1-d`'s `7f150b39…`, which belongs to the `5473`-line head). |
| **17.1-e** | THE PIN'S INVOCATION | **`77 passed (77)`** | **RECORDED READING; measurer: the supervisor's head reading.** **`§16.1-e` recorded the same `77 passed (77)`; the pin's own in-source record still reads `74 passed \| 3 failed (77)` (a `VERIFIED-BY-READ` staleness item — `§17.3` `F-3`).** |
| **17.1-f** | THE WHOLE SUITE | **`3 failed \| 4565 passed \| 57 skipped`** | **RECORDED READING; measurer: the supervisor's head reading** — the same three reds `§16.1-g` names (the carried `P-SM-1` + the two FOUNDATION-PIN reds `P-IM-pd-pin-1`, `pd-vendor-set` `§3.3` item 2). **No red is in `tests/live-drive-contract.test.ts`.** |
| **17.1-g** | THIS FILE — LINE COUNT | **`2429` lines BEFORE this section's bytes** | **MEASURED BY THIS PASS** (same instrument). `§16.1-h` measured `2097` BEFORE `§16`'s own bytes — so **`§16` added `332` lines**, and this section's own post-bytes count is NOT takeable by the pass that writes it. |
| **17.1-h** | THIS FILE — `sha256` | **`OWED`** | **Not takeable by this pass (no shell).** The obligation is `§10` item 10 / `§12.9` / `§13.9` / `§14.9` / `§15.6` / `16.1-i`; **owner: a shell-bearing pass, which must also state its instrument.** |
| **17.1-i** | THE SIBLING ARTIFACTS (line counts, same instrument) | blind-greens `docs/specs/unit-live-driver-verdict-integrity-greens.md` = **`654` lines**; `docs/next-steps.md` = **`2488` lines**; `docs/defects.md` = **`282` lines**; `docs/pending.md` = **`229` lines**; `docs/decisions.md` = **`290` lines**; `docs/HANDOFF.md` = **`196` lines** | **MEASURED BY THIS PASS** (file-read tool's line census, per path, at the head BEFORE this pass's writes). `§16.1-j` read `559`/`2483`/`282`/`227`/`290`/`194` at the pre-`§16` head; **the deltas are the gate-7 pass's own anchored inserts (`+95` on the artifact, `+5` on `docs/next-steps.md`, `+2` on `docs/pending.md`, `+2` on `docs/HANDOFF.md`) and the gate-7 pass's `+2` on `docs/decisions.md` is NOT visible — that file reads `290` at BOTH heads**, so no figure here is re-derived from another: each is its own read. |

**NOT MEASURED BY THIS PASS, stated so no cell over-claims:** any digest of any file (no shell); the pin's arm count as
a count of `it()` blocks (the register's declared/executed budget `101 = 85 + 16` is `VERIFIED-BY-READ` in the pin's
source, `§17.2`); every battery figure (`extendedRowsRun`, the `PARKED` count, the block split, the click-record
split); the whole suite's file count; and any `dist/` figure (**no `dist/` claim is made by this unit**).

**⟨POST-WRITE COUNTS, RECORDED SO THE `17.1-i` CELLS ARE NOT READ AS THIS PASS'S OUTPUT: the cells above are the
pre-write census (`17.1-i`) plus this file's own pre-`§17` count (`17.1-g`), and a file cannot state its own post-write
count honestly without a second read. Where a write fit INSIDE an existing line the count is unmoved — `docs/decisions.md`
reads `290` at both heads, `docs/defects.md` `282`, `docs/HANDOFF.md` `196` — and where a write added a line the file
now reads one or more higher (`docs/pending.md` `231`, `docs/next-steps.md` `2493`, this file `2553` at the read taken
while writing this section). The `sha256` pair remains `OWED` (`17.1-h`).⟩**

### 17.2 THE FINDINGS AND THE FIXES MADE, ONE LINE EACH

| # | The finding | The fix made in this pass (all of it inside `docs/**`, annotate-beside) |
| --- | --- | --- |
| **F-1** | **THE `§15.1` CENSUS CELL — THE ONE KNOWN OWED ANNOTATION.** `§15.1`'s pass-3 cell and its `35`-id partition counted `C-4` · `C-5` · `C-6` as STILL-OPEN because that head predates their landing. **All three ARE CLOSED at this head.** | **The cell annotated at its own site; the three `§15.2.3` rows annotated with their closure evidence; the corrected partition printed BESIDE the old one — `26 + 3 + 5 + 1 = 35` → `29 + 3 + 2 + 1 = 35`** (the `C` column's `3 + 4 + 5 = 12` → `3 + 7 + 2 = 12`), with the `A`/`B` columns shown unmoved. **The census's owed question is answered, not deferred.** |
| **F-2** | **THE REGISTER ARITHMETIC.** `97` / `81 + 16` must not read as current anywhere; the landed reading is `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed + 16 named class-(b) NOT-RUN`. | **VERIFIED at every site, no annotation owed and none invented:** `§3.3`, `§4.2`, `§12.5`, `§13.3`, `§13.8`, `§14.1`/`§14.2` all carry `101` beside the filed `97` (`§16.2` audited this and this pass re-read the sites, each `VERIFIED-BY-READ`); **no tracker site reads `97` as the current total** (`docs/next-steps.md`'s `97` occurrences are filed readings or the superseded-vs-landed pair). **The PIN's in-source records carry BOTH values** (`§17.3` `F-3` records the one stale remainder). **⟨CORRECTED `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`; `RCA-8(c)`: the row is KEPT VERBATIM as its gate-8 reading) — THIS ROW'S CLAIM WAS OVER-STATED AND IS HERE CORRECTED BESIDE IT: `§4.2` and `§12.5` DID still read `97` as current at this file's head (the arithmetic line, the *"the current reading is the `97` line"* sentence and the *"Printed arithmetic with its terms … = 97"* sentence), so TWO SPEC SITES were annotated in this re-run (`§18.2` `F-R1`). What STANDS from the row: `§3.3`, `§13.3`, `§13.8` and `§14.2` already carried `101` beside the filed `97`, the pin's arithmetic rows carry both values, and the arithmetic itself (`101 = 85 + 16`, `7` rows) is unmoved and `VERIFIED-BY-READ` in the pin by this pass.**⟩** |
| **F-3** | **THE PIN'S STALE IN-SOURCE DIGEST COMMENT** (`f53b569e…` / `7865` lines) is cited **AS THE DIGEST OF RECORD AT THE CURRENT HEAD** at two sites in `tests/live-drive-contract.test.ts`. | **RECORDED AS OWED — NOT EDITED (`tests/**` is outside this pass's write wall).** The current driver head is **`8064` lines / `md5 fcc17e09…`** (`17.1-a`/`17.1-b`), so the comment is stale on both figures. **Owner: the TestWriter** — the re-statement that prints the superseded digest BESIDE the current one, teeth unmoved. |
| **F-4** | **THE PIN'S `R-13` ARMS READ AS STAGED RED WHILE THE FILE'S OWN INVOCATION IS GREEN.** The comment block at the `R-13` section still states *"DELIBERATELY LEFT RED FOR THE NEXT DRIVER PASS … A reader must read the three failures below as THIS FILE'S INTENDED STATE at this head"*, and `§14.1` `Z-2`'s in-source annotation still reads `74 passed \| 3 failed (77)` — against the recorded **`77 passed (77)`** at this head. | **RECORDED AS OWED — NOT EDITED.** The three arms are `it()` blocks that are **not** skipped, `todo`'d or relaxed (their teeth stand); what is stale is their **comment text and the `Z-2` pass count**, i.e. a `tests/**`-side annotation. **Owner: the TestWriter.** **This is also the reason `C-7`'s arm re-statement now reads as an IN-SOURCE annotation rather than a driver act** (`§15.1`'s corrected note, `§16.6` item 5). |
| **F-5** | **HEAD-STALENESS IN THE BINDING FIGURES.** The `5473`/`7f150b39…` pin pair, the `7865`/`f53b569e…` driver pair and the `71`/`74`/`76`/`77` pass readings were each true of a superseded head. | **Annotation added at the sites that bind them:** `§16.1-c`/`§16.1-d` annotated BESIDE (the `6359`/`1b9100d0…` pair named as this head's; the old pair kept visible); the driver pair is re-read as `8064`/`fcc17e09…` (**unchanged from `§16`**). **`docs/next-steps.md`'s gate-cycle block annotated** with the current pair set and the gate-8 pass's own reading (`docs/next-steps.md`'s head insert). **`§13.5`/`§13.7` items the gate-7 pass annotated were VERIFIED to read correctly at this head** (`§17.4`). |
| **F-6** | **THE GREENS ARTIFACT'S HEAD FIGURES.** Its `§1`/`§4.3` readings (`69 passed (69)`, `3 failed \| 4557 passed`, `97`, `55`, `0 PARKED`) and its `§5.1` table quoted the `559`-line head. | **The artifact carries the gate-7 annotations already (`§3`/`§4`/`§5` of that file), and its line count is now `654`** (`17.1-i`). **This pass added the artifact's own line count to its `§5.1`/`§5.3` head context** — no expectation or reading was rewritten. |
| **F-7** | **THE `§13.5` ITEM 3 WITHDRAWAL AND THE SUPERSEDED BLIND EXPECTATIONS** (`G-8` superseded by `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`; `G-7`/`G-14`/`G-18` unreachable-limb). | **VERIFIED to read as ANNOTATED, not as current failures** — each of the four carries its own ANNOTATED note at its own scenario (`VERIFIED-BY-READ`, this pass, in the artifact's `§3`/`§5`), and the contract's `§6.3` `C-2` item 3 / `§13.5` items 1/3/4/5/6 / `§13.7` items 1/2/3 carry their pointer notes. **No fix was needed.** |
| **F-8** | **THE CENSUS/ARITHMETIC CLAIMS OF `§3.3`** (`MATRIX_ROWS` `8`; `uf_*` row-block floor `20`; `26` `uf_*` keys of which `6` non-row ⇒ `20` row blocks; `ROW_EXTENDED` `32`). | **VERIFIED AT THIS HEAD, each `VERIFIED-BY-READ` by this pass:** the driver's `BLOCKS` carries **`26` `uf_*` block keys** (each read by name), the pin's `UF_NON_ROW_BLOCKS` lists the **`6`** declared non-row keys (the two hygiene blocks + the four diagnostics), so **`26 − 6 = 20` row blocks and the pin's floor holds**; `MATRIX_ROWS` is `8`, ids `U-1`..`U-8`; `ROW_EXTENDED`'s declared table stands at `32` (`§13.2` item 1). **NO CENSUS FIGURE OF THIS UNIT WAS FALSIFIED — the check is recorded because a reader meeting `26`/`6`/`20` deserves the composition, not because it drifted.** |
| **F-9** | **THE AWAITING GATES, NAMED AS OWED RATHER THAN IMPLIED** — the fourth gate-4 confirm pass, the unit's DONE row, and this file's `sha256`. | **Recorded as owed with owners at `§17.3`**; **the item-10d documentation review itself is DISCHARGED by this section and its archive record** (the gate `docs/next-steps.md`'s gate-7 insert named as owed). |

### 17.3 EVERYTHING LEFT OWED, WITH ITS OWNER

| # | The owed item | Owner | Why it is owed / what settles it |
| --- | --- | --- | --- |
| **O-1** | **The FOURTH GATE-4 CONFIRM PASS** — in flight at this head. | **the supervisor's gate cycle (the read-only `role_adversarial_reviewer`)** | `§15.4` item 7 / `§15.5` item 4: it is what either closes `C-10` · `C-11` or confirms them open, and it is the pass that gives the `29 + 3 + 2 + 1` partition a measured backing for the two residuals. |
| **O-2** | **THE UNIT'S DONE ROW** — **not written.** | **the supervisor** (`§7` `X-3`, `§10`, `§15.4` item 2) | A DONE row must state its layer (`RCA-12`), cite the recorded red→green, the gate-4 adversarial record (`§15`), the gates 5/6 re-run and **this gate-8 record**, and carry no app claim. |
| **O-3** | **THE CONTRACT'S `sha256` + its post-`§17` LINE COUNT** — `OWED` at `§14.9` / `§15.6` / `§16.7` item 5 / `17.1-h`. | **a shell-bearing pass**, which **must state its instrument** | A file cannot contain its own digest, and the gate-7 and gate-8 passes both hold no shell. |
| **O-4** | **THE PIN'S STALE IN-SOURCE DIGEST COMMENT** (`f53b569e…` / `7865`). | **the TestWriter** (`tests/**`) | `§16.6` item 2 / `§13.7` item 5 / `C-11`'s *"FROZEN DIGEST BYTE-LITERAL"* limb. Settles it: a re-statement printing the superseded digest beside `8064` / `fcc17e09…`. |
| **O-5** | **THE PIN'S `R-13` STAGED-RED COMMENT TEXT AND `Z-2`'s `74 passed \| 3 failed` IN-SOURCE RECORD** — the arms are recorded GREEN at this head. | **the TestWriter** (`tests/**`) | `§17.2` `F-4`. Settles it: an in-source annotation saying the arms are green at this head, with the staged reading kept visible; **no tooth moves**. |
| **O-6** | **`P-SM-2`'s DECLARATION THAT TWO PANE STATES CARRY NO RESTORE-TO-BASELINE ARM** — **a DECLARATION, UNRESOLVED.** The pin's own comment records that `pane enabled/disabled` carries **no** restore-to-baseline arm (*"a state arm may legitimately be absent where the state has no baseline to restore — it is now the FIRST class-(b) term, honestly NOT-RUN"*), and the spec's `§4.2` `P-SM-2` declares **`7` states × `2` arms** with the same `17` total. | **the architect / a spec-owning pass** (for the ruling), **with the TestWriter** for the `tests/**` arm | It is a **declaration without a resolving reading**: the arm is honestly named NOT-RUN, but **whether a state's absence from the budget is a legitimate class-(b) exclusion or a shortfall `F-17` should trip has never been ruled**, and the spec's `7 × 2` arithmetic still reads as if every state carried both arms. **What settles it:** an explicit ruling at `§4.2`'s `P-SM-2` row (either the state is excluded BY NAME with its reason, or the arm is landed). **This pass records it; it does not rule it.** |
| **O-7** | **`C-10` · `C-11`'s CLOSURE READINGS** — `NOT RECORDED` to this pass, though the pin carries class-directed re-statements that address each one. | **the next gate-4 confirm pass** (with the TestWriter for any residual arm) | `§15.5` item 4 as annotated. A re-statement is not a closure reading; what settles them is the confirm pass's own run. |
| **O-8** | **`§13.7` ITEMS `3`/`4`** — `UNANSWERABLE FROM THE `--block=` SPACE`. | **the architect / the next live pass** | `§15.3.2`. A ruling, or a full-battery head with ZERO FAIL blocks and a non-empty missing set, is what settles them. |
| **O-9** | **EVERY APP-LAYER ITEM THIS UNIT DOES NOT OWN** — the live pile's own rows, the fixture route (`GAP-8`, `§9` `T-3`), the foundation pin-refresh unit, and the `docs/defects.md` / `docs/pending.md` closure of the two driver rows. | **their named owners** (`§9` `T-3`/`T-4`; the architect's ordered pin-refresh unit; the supervisor for the tracker closure) | **This unit fixes the INSTRUMENT. A green here is HARNESS/`[D]` and never app-green.** |

### 17.4 THE CITATION AND SECTION-NUMBER AUDIT — every check this pass ran, and its result

1. **THIS FILE'S OWN `§`-NUMBERING RESOLVES.** `§0`–`§11` (the filed contract), `§12.1`…`§12.9`,
   `§13.1`…`§13.9`, `§14.1`…`§14.9`, `§15.0`…`§15.6`, `§16.1`…`§16.7` and now `§17.1`…`§17.5` all exist as headings.
   **`§12`–`§17` are APPENDED records and amendments: none renumbers a filing section, and no `§`-citation in this
   file points outside that set** (`VERIFIED-BY-READ`).
   **⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`; `RCA-8(c)`: the item is KEPT VERBATIM) — THE HEADING
   SET HAS GROWN BY TWO AND THE AUDIT STANDS: `§15.7` (the fourth gate-4 confirm pass's `D-1`…`D-5` findings; a
   SUBSUBSECTION of `§15`, not a renumbering of `§16`) and `§18` (`§18.1`…`§18.4`, the gates-7+8 re-run record) are
   now appended, so the resolving set is `§0`–`§18`. **A read of every `§`-citation in this file, in
   `docs/specs/unit-live-driver-verdict-integrity-greens.md` and in the three trackers this unit touches found NO
   citation pointing at a moved or renumbered section**, and `§15.7`/`§18` are cited by their own subsections
   (`§18.1`…`§18.4`, `§15.7`'s tables) — nothing is cited as a bare `§15.7`/`§18` item that does not exist.**⟩**
2. **THE TWO DELIBERATE ID COLLISIONS STILL DISAMBIGUATE AT EVERY SITE THE NEW NOTES TOUCH:** `§2.1`/`§2.2`'s
   `E-1`…`E-12` contract clauses vs `§9`'s `E-1`…`E-5` escalations (`§11.3`'s rule), and the gate-4 pass-local
   `A-`/`B-`/`C-` finding ids vs this file's `§6.1` `C-1` / `§6.3` `C-2` / `§10` `C-3` (`§15.0-b`). **The gate-8 notes
   above cite `§15.2.3`'s `C-4`/`C-5`/`C-6` and `§6.3` `C-2` distinguishably and never in the bare `C-n` form.**
3. **THE ARCHIVE CITATION THIS FILE OWED NOW RESOLVES.** `§10` item 4 and `§8`'s `X-3` item 3 name the gate-8 record
   as `archive/reviews/<date>-live-driver-verdict-integrity-doc-review.md`; **the file actually written carries the
   repo's own unit-id convention — `archive/reviews/2026-09-29-U-LIVE-DRIVER-VERDICT-INTEGRITY-doc-review.md`** (the
   form every sibling review uses). **The two spec citations are annotated to the written path** (no rewrite), so no
   reader follows a phantom name.
4. **THE TRACKER CROSS-REFERENCES THIS UNIT RELIES ON RESOLVE:** the `GAP-7`/`PD-DRIVER-MATRIX-AND-EVIDENCE` id, the
   three named defect rows, `GAP-8`'s fixture route (`§9` `T-3`), the checklist enumeration (`UF-STAGE-1` /
   `UF-SETTINGS-7`), the three rulings in `docs/decisions.md`, the parked rows in `docs/pending.md`, and the two
   `§5.9` rows in `docs/specs/ui-feature-set-breakdown-2026-09-29.md` — each re-read as present and named
   (`VERIFIED-BY-READ` of the files' own text).
5. **NO `§`-CITATION WAS FOUND POINTING AT A MOVED OR RENUMBERED SECTION, and no obsolete document was created by
   this unit** — so **nothing was archived by this pass and no reference needed repointing.** The only archive act is
   **writing this review's own record.**

**ONE STALE CITATION FOUND AND FIXED BESIDE (the audit's one positive result):** `§10` item 4's and `§8`'s archive
filenames, annotated per item 3 above.

### 17.5 WHAT THIS RECORD DOES NOT DO

1. **IT RAN NOTHING** (no shell, no suite, no pin invocation, no battery, no Electron boot, no digest) and **it
   measured line counts only**, with the one instrument it holds.
2. **IT WRITES NO DONE ROW, CLOSES NO FINDING AND RULES NO ESCALATION.** The DONE row is the supervisor's; the
   `C-10`/`C-11` closures and the `P-SM-2` declaration are owed to their named owners (`§17.3`).
3. **IT EDITS NO CODE, NO TEST AND NO SCRIPT** — `src/**`, `scripts/**` and `tests/**` are untouched by construction
   (`AGENTS.md` item 3; the two `tests/**` items it found are recorded as OWED at `§17.3` `O-4`/`O-5`).
4. **THE LAYER IS HARNESS/`[D]` AT ITS CEILING, AND THIS RECORD IS DOC-LAYER.** **The unit's own evidence is the node
   pin (`tests/live-drive-contract.test.ts`) plus its live battery readings: a green there is a
   NODE-STATIC/report-integrity green — `RCA-12`'s ENVELOPE-green at most — and it is NEVER APP-GREEN, never
   `[T]`-evidence and never a claim that the app works.** The app layer's own FAIL pile is untouched, un-counted and
   un-dispositioned by this unit (`§9` `T-4`).
5. **THE POST-`§17` SNAPSHOT OF THIS FILE IS `OWED`** (`17.1-g`/`17.1-h`): a shell-bearing pass takes the line count
   and the `sha256` and states its instrument.

---

### 15.7 THE FOURTH GATE-4 CONFIRM PASS'S FINDINGS (`D-1`…`D-5`) — APPENDED HERE BECAUSE THIS SECTION IS THE ADVERSARIAL-FINDINGS RECORD

**⟨ADDED `2026-09-29` BY THE GATES-7+8 RE-RUN (`AGENTS.md` items 10b/10d, `RCA-6`) — `RCA-8(c)`, ANNOTATE-BESIDE:
NOTHING IN `§15.0`–`§15.6` ABOVE IS REWRITTEN OR DELETED, and the `C-12` DUTY stays discharged by the section they
compose. THIS SUBSECTION IS APPENDED TO THE UNIT'S **ONE** ADVERSARIAL-FINDINGS RECORD (§15) rather than spawning a
second record: the fourth confirm pass is the same GATE-4 CLASS of pass as `A`/`B`/`C`, so its findings belong here.⟩**

**THE FOURTH GATE-4 CONFIRM PASS — recorded at `docs/next-steps.md`'s gate-cycle block as `FAIL`, 5 findings
(`D-1`…`D-5`), 3 BLOCKING, with the round that followed fixing `D-1`/`D-2`/`D-3`/`D-5` and `D-4`'s limb
(`docs/next-steps.md`, the two anchored inserts of `2026-09-29` — the findings block and the *"`D-1`/`D-2`/`D-3`/`D-5`
AND `D-4`'s LIMB WERE THEN FIXED"* block; both KEPT as those passes' readings).** **THIS PASS RAN NOTHING (no shell,
no suite, no pin invocation, no battery, no Electron boot); every figure below is a `VERIFIED-BY-READ` of the driver
and the pin by THIS pass, with the symbol named, or a `RECORDED READING` of the confirming pass, quoted with its
measurer.** **THE FINDING-IDS ARE PASS-LOCAL EXACTLY AS `§15.0-b` rules for `A-`/`B-`/`C-`: a `D-n` in this subsection
is the fourth confirm pass's finding, and this file's `§8` `D-1`…`D-7` DECISION ROWS are DIFFERENT OBJECTS — the
collision is recorded, not smoothed, and no id is renumbered.**

**THE FIVE FINDINGS, their disposition at this head, and the site each was read at (the `RCA-3`-required shape:
layer · one line of evidence · disposition · owner):**

| Id | Layer | One line of evidence | Disposition at this head | Owner |
| --- | --- | --- | --- | --- |
| **`D-1`** | **HOST** — the click record | **the click record was attached by POSITION (`pool[i]` / the last click), so a row could print a click it did not drive.** | **CLOSED — `VERIFIED-BY-READ` by this pass in `scripts/live-drive.mjs`: the entry now carries the ROW IDENTITY the drive site knew (`rows` / `row` on the log entry, the `⟨gate-4 D-1⟩` markers at `ufAttachClickRecords` and at the drive sites) and the record is attached **BY IDENTITY, NEVER BY ROTATION** — the ordinal draw is gone, the block-wide count is WITHHELD (`clicksDriven=null`) from a multi-attributed block, and a row whose own gesture matched no logged click carries NO record. Pinned by the pin's `R-14.i` (`D-1`'s named mutation: positional/rotational pairing restored).** | the implementer of this unit (driver half), with its TestWriter (arm) |
| **`D-2`** | **HOST** — the clause builder | **`buildFailingClause` RE-DERIVED its own classification from a `path` token used NOWHERE (the dead token), so a clause could record a verdict contradicting the one the report printed — in BOTH directions.** | **CLOSED — `VERIFIED-BY-READ` by this pass: the dead token is ABSENT from the driver (a read for `state-read (no gesture; state row)` returns nothing) and the builder now states the report's OWN predicate — `const gated = path != null && !/state row/.test(String(path))`, `const notDriven = gated && realInput !== true && pass !== true`, `verdict = park === true ? 'PARKED' : (notDriven ? 'NOT-DRIVEN' : 'FAIL')` — deliberately stated rather than reached by a call because the pin evaluates the function's text in isolation; the `required` position carries the row's value or the NAMED `UF_NO_REQUIRED_VALUE`. Pinned by the pin's `R-14.ii` (named mutation: a divergent path test re-introduced).** | the implementer of this unit (driver half), with its TestWriter (arm) |
| **`D-3`** | **HOST** — the reconciler + the throw path | **the `M-1` shape survived at the SCOPE EDGE: the refusal was gated on `fullBattery`, and the non-precondition THROW path printed a `FAIL` with NO row id — so a scoped run whose IN-SCOPE declared row produced no verdict could print `OK (… 0 inconclusive)` and exit `0`.** | **CLOSED — `VERIFIED-BY-READ` by this pass: the reconciler now pushes `matrix row(s) IN SCOPE with no verdict: …` (the `⟨GATE-4 FINDING D-3 — THE M-1 SHAPE AT THE SCOPE EDGE⟩` site), and the non-precondition THROW path carries a NAMED declared-row route (`ufBlockThrowReason`'s `else` → the `ROW-SET ERROR: declared row(s) [ … ] produced NO verdict …` line, `⟨gate-4 D-3⟩`), so no declared row vanishes with a throw. **NO LIVE CONSTRUCT EXISTS AT THIS HEAD** — all seven matrix-claiming blocks emit their declared ids — so the clause is pinned structurally and its live exercise is owed. Pinned by the pin's `R-14.iii` (two named mutations: the in-scope refusal removed; the named throw route removed).** | the implementer of this unit (driver half), with its TestWriter (arm) |
| **`D-5`** | **HOST** — the pin's arm strength (a `C-11` limb) | **four `P-TP-1` arms (`on-target`, `off-viewport`, `covered-by-another-element`, `zero-size-box`) were said to read WHOLE-FILE code tokens with no mutation — i.e. `C-11` was not closed.** | **`D-5`'S PREMISE IS PARTLY FALSIFIED BY MEASUREMENT, AND THIS IS THE FIRST OF THE TWO FALSIFIED PREMISES THIS RECORD CARRIES (stated plainly below): only **TWO** of the four named arms were whole-file scoped — **arms `3` and `9`**; **arms `1` and `5` were ALREADY helper-scoped and their mutations DID fire.** The round that followed SHARPENED **FOUR** arms, and the pin's own `⟨D-5 — RE-STATED … SHARPENED, NEVER RELAXED⟩` markers with their NAMED MUTATIONS are `VERIFIED-BY-READ` by this pass at four sites in `tests/live-drive-contract.test.ts`. **`C-11`'s residual is therefore narrower than the finding as filed: what stays owed is its OTHER limb (the FROZEN DIGEST BYTE-LITERAL), not the four arms.** | the TestWriter (`tests/**`) for the arm sharpening — DONE; the frozen-digest limb stays owed (see the owed list below) |
| **`D-4`** | **HOST** — the pin's census digest (a `C-11` limb) | **the pin's census digest reader was said to have a limb that never fired, so a deleted/renamed/re-ordered arm could pass unseen.** | **`D-4`'S PREMISE IS FALSIFIED BY MEASUREMENT, AND THIS IS THE SECOND OF THE TWO FALSIFIED PREMISES THIS RECORD CARRIES (stated plainly below): the as-filed regex had NO `g` FLAG, so it hit the FIRST match only — the HEAD CALL — and the limb DID fire; the defect was the ANCHOR, not a dead limb. THE LIMB WAS THEREFORE RE-ANCHORED rather than rebuilt (the pin's `⟨D-4's residual — the mutation-limb re-anchored⟩` site, `VERIFIED-BY-READ` by this pass), and the mutation now discriminates DELETED vs RENAMED vs REORDERED.** | the TestWriter (`tests/**`) — DONE |

**THE TWO FALSIFIED PREMISES, STATED PLAINLY (the `§15.3.3` convention, applied to the `D-` pass): neither may be
resurrected without NEW evidence, and neither is a criticism of the pass that filed it — each was a structural read
made by a pass that held no shell.**

1. **`D-5`'s PREMISE — *"FOUR `P-TP-1` arms still read WHOLE-FILE code with NO mutation"* — IS PARTLY FALSIFIED.**
   **Only arms `3` and `9` were whole-file scoped.** **Arms `1` and `5` were ALREADY HELPER-SCOPED and their
   mutations DID fire**, so the finding OVER-COUNTED the weak set by two. **What the record keeps from the finding:
   the two genuinely weak arms were real, the round SHARPENED FOUR arms anyway (a widening, never a relaxation), and
   `C-11`'s four-arm limb is now closed — while its FROZEN-DIGEST limb is not (`D-4`'s neighbour).**
2. **`D-4`'s PREMISE — *"the limb never fired / could not fire"* — IS FALSIFIED.** **The as-filed regex carried NO
   `g` FLAG, so it matched the FIRST occurrence only — the HEAD CALL — and the limb DID fire on it; the defect was
   the ANCHOR (one match is not a census). The remedy is therefore a RE-ANCHOR, and the re-anchored reader now
   discriminates `DELETED` vs `RENAMED` vs `REORDERED`.** **A reader must not quote the `D-4` finding as a dead
   limb; quote it as an under-anchored one.**

**THE PACKAGE ROW OF THIS SUBSECTION IS AN EMPTY SEARCH, EXACTLY AS `§15.0-c` STATES FOR THE `A`/`B`/`C` PASSES: the
fourth confirm pass filed EVERY finding against the HOST layer (`scripts/live-drive.mjs` and
`tests/live-drive-contract.test.ts`), and `node_modules/provident-ssr/**` / `../Provident-Electron/**` were neither
read nor found defective by it — so NO handoff row is owed, no package byte was patched, and the empty search is
itself the finding (`AGENTS.md` item 7).**

**THE COUNTING, STATED SO THE `§15.1` CENSUS IS NOT CONFUSED WITH THIS ONE: the `35`-id census of `§15.0-a`/`§15.1`
counts the `A`/`B`/`C` passes ONLY (the `29 + 3 + 2 + 1 = 35` partition stands, unmoved by this subsection). The
`5` `D-` findings are a FOURTH pass's set, filed and closed in a later round, and they are counted HERE and nowhere
else in this file.** **The fifth gate-4 confirm pass, recorded below as OWED, has filed NO `E-` finding at the head
this re-run read (`VERIFIED-BY-READ`: a read of `docs/next-steps.md`, `docs/defects.md`, `docs/decisions.md`,
`docs/pending.md` and `docs/HANDOFF.md` for a fifth-pass/E-` finding set returns NOTHING) — so its id space is
EMPTY and is recorded as EMPTY rather than pre-filled.**

---

## 18. THE GATES-7+8 RE-RUN (`AGENTS.md` items 10b/10d, `RCA-6`) — THE HEAD-FIGURE SET AND THE FINDING SET BROUGHT TO THE FROZEN HEAD, WITH THE SUPERSEDED VALUES KEPT VISIBLE

**⟨ADDED `2026-09-29`. THIS SECTION IS AN APPENDED RECORD BLOCK: it adds a section at the foot, moves no existing
section, renumbers nothing, adds no `F-` row, no register row, no `BLOCKS` key, no `§5.U` slot and no pin rule, and
every existing `§`/id/citation remains valid. It is written `ANNOTATE-BESIDE` (`RCA-8(c)`): every site it touches KEEPS
its filed text VERBATIM with this record written BESIDE it.⟩**

**THE HONESTY BLOCK (`§1.5`'s convention, unmoved).** **THIS PASS RAN NOTHING: no shell, no suite, no `npx vitest`,
no pin invocation, no register row, no battery, no `--block=` invocation, no Electron boot, no `md5sum`, no
`sha256sum`, no `wc -l`. Its wall is read/search + doc-write; it TOUCHED NO `src/**`, `scripts/**` OR `tests/**` BYTE.**
**Every figure below is a `RECORDED READING` quoted with its measurer or a `VERIFIED-BY-READ` naming this pass as the
reader; every LINE COUNT it states is its own measurement, taken with the ONE instrument it holds (the file-read
tool's own line census, named per figure). THE CITATION DISCIPLINE IS UNMOVED: NO LINE NUMBER APPEARS ANYWHERE IN THIS
FILE.**

### 18.1 THE HEAD-FIGURE SET AT THE FROZEN HEAD — the instrument named per figure

| # | The figure | Its value at the FROZEN head | The instrument / the measurer |
| --- | --- | --- | --- |
| **18.1-a** | `scripts/live-drive.mjs` — LINE COUNT | **`8293` lines** | **MEASURED BY THIS PASS** (instrument: the file-read tool's own line census, `scripts/live-drive.mjs`). Supersedes `§16.1-a`/`§17.1-a`'s `8064` (KEPT as their reading). |
| **18.1-b** | `scripts/live-drive.mjs` — md5 | **`aa3c01ea315a3c9f9a4f6898e88dfd05`** | **RECORDED READING; measurer: the supervisor's frozen-head reading** (no shell in this wall; `§16.1-b`'s `fcc17e09…` is kept as its reading). |
| **18.1-c** | `tests/live-drive-contract.test.ts` — LINE COUNT | **`7396` lines** | **MEASURED BY THIS PASS** (same instrument, same path). Supersedes `§17.1-c`'s `6359` and `§16.1-c`'s `5473` (both KEPT). |
| **18.1-d** | `tests/live-drive-contract.test.ts` — md5 | **`71bfda004e32f11065cf5402bf0361ed`** | **RECORDED READING; measurer: the supervisor's frozen-head reading** (supersedes `§17.1-d`'s `1b9100d0…` for the `6359`-line head). |
| **18.1-e** | THE PIN'S INVOCATION | **`80 passed (80)` — NO RED ARM** | **RECORDED READING; measurer: the supervisor's frozen-head reading.** Supersedes `§16.1-e`/`§17.1-e`'s `77 passed (77)`. **The pin's own in-source record still reads `74 passed \| 3 failed (77)` and its trailing comment still names a DRIVER digest of record that has moved twice — both OWED to the TestWriter (`18.3`'s owed-set rows: the digest comment `R-1`, the `R-13` comment text `R-2`).** |
| **18.1-f** | THE WHOLE SUITE | **`3 failed \| 4568 passed \| 57 skipped (4628)`** | **RECORDED READING; measurer: the supervisor's frozen-head reading** — the SAME THREE pre-existing reds `§16.1-g` names (the carried `P-SM-1`; the foundation-pin reds `P-IM-pd-pin-1` and `pd-vendor-set` `§3.3` item 2). **NO RED IS IN `tests/live-drive-contract.test.ts`.** `typecheck` and `build` exit `0` (same measurer). |
| **18.1-g** | THE REGISTER | **`6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side + 16 named class-(b) NOT-RUN`, `7` rows** | **`VERIFIED-BY-READ` by this pass in the pin** (`tests/live-drive-contract.test.ts`: the arithmetic title carries BOTH values and the summed assertion reads `101`) — **so the `101` is unmoved by this round and no site may read `97`/`81 + 16` as current.** |
| **18.1-h** | THIS FILE — LINE COUNT | **`2560` lines BEFORE `§15.7`/`§18`'s bytes** | **MEASURED BY THIS PASS** (same instrument). Supersedes `§17.1-g`'s `2429` (KEPT). **The post-`§18` pair remains `OWED` (`18.3`'s owed-set row `R-3`): a file cannot state its own digest.** |
| **18.1-i** | THIS FILE — `sha256` | **`OWED`** | **Not takeable by this pass (no shell).** Owner: a shell-bearing pass, which must also state its instrument (`§10` item 10). |
| **18.1-j** | THE SIBLING ARTIFACTS (line counts, same instrument) | blind-greens `docs/specs/unit-live-driver-verdict-integrity-greens.md` = **`656` lines** (pre-notes; **a later read of the same path by this pass reports `699`, then `710` while writing — readings, not derivations**); `docs/next-steps.md` = **`2495` lines** (pre-write; **a later read reports `2502` while writing, with this pass's own insert in place — its lines exceed the file-read tool's per-line ceiling, so the count is a reading, never a derivation**); `docs/defects.md` = **`286`**; `docs/pending.md` = **`237`**; `docs/decisions.md` = **`295`**; `docs/HANDOFF.md` = **`196`** pre-write (**`197`** after) | **MEASURED BY THIS PASS** (file-read tool's line census, per path, at the head BEFORE this pass's writes). `§17.1-i` read `654`/`2488`/`282`/`229`/`290`/`196` — **each is kept as its own reading; the deltas are the landed remedy round's own anchored inserts.** **⟨A RE-READ OF THE SAME PATHS LATE IN THIS PASS (same instrument, AFTER this pass's own writes) reports `282` / `231` / `295` / `197` where the pre-write read reported `286` / `237` / `290` / `196` — the two readings of `docs/defects.md`, `docs/pending.md` and `docs/decisions.md` DISAGREE, and the disagreement is RECORDED rather than smoothed: BOTH are this pass's measurements with the same tool, `docs/defects.md` was NOT WRITTEN BY THIS PASS AT ALL (so its two readings are of the same bytes), the write-vs-read counts of the two files this pass did write (`HANDOFF.md` `196`→`197`, this file's siblings) are consistent, and `docs/pending.md`'s second reading (`231`, not `237`) is LOWER than its pre-write reading despite this pass writing nothing into it. A reader must therefore take NEITHER pair as authoritative; a shell-bearing pass's `wc -l` settles it.**⟩** |

**NOT MEASURED BY THIS PASS, stated so no cell over-claims:** any digest of any file (no shell); the pin's `it()`
count AS A COUNT (the `80 passed (80)` is a RECORDED READING of the runner's summary line, not a count this pass
took); the `sha256` of this file; and EVERY battery figure (`extendedRowsRun`, the `PARKED` count, the block split,
the click-record split, the `33` non-PASS `ROW` lines / `11` distinct shapes of the `D-2` landing) — those belong to
the live layer and to the pass that ran the battery, and are quoted here only where a site already quotes them.

### 18.2 WHAT THIS RE-RUN FIXED (one line each, all of it inside `docs/**`, annotate-beside)

| # | The finding | The fix |
| --- | --- | --- |
| **F-R1** | **THE `§17.2` `F-2` CLAIM THAT "NO SPEC SITE READS `97` AS CURRENT" IS FALSIFIED BY THIS PASS'S READ.** `§4.2`'s arithmetic **`6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`** (and its *"the current reading is the `97` line"* sentence, and `§12.5`'s *"Printed arithmetic with its terms: … = 97"* sentence) still read `97` as CURRENT, and `§18` had not been reached yet (this file's own head). | **ANNOTATED BESIDE at `§4.2` and `§12.5`** — `101` named as the reading of record with the superseded `97` kept visible; **`§17.2`'s `F-2` row annotated** with the correction, and the same correction carried in `archive/reviews/`. `§3.3`/`§13.3`/`§13.8`/`§14.2`/`§13.2` were RE-READ and DO already carry the pair correctly. |
| **F-R2** | **THE `§16.1`/`§17.1` HEAD SET BOUND SUPERSEDED HEADS.** `8064`/`fcc17e09…`, `6359`/`1b9100d0…`, `77 passed (77)` and `3 failed \| 4565 passed \| 57 skipped (4625)` were each true of a head two rounds old. | **Annotation added at `§16.1-a`…`§16.1-f` and at `§17.1-a`…`§17.1-i`** (the frozen pair named; all superseded pairs kept visible); **`docs/next-steps.md` carries a new head insert with the frozen pair and the register arithmetic unmoved; `docs/HANDOFF.md`'s `CURRENT STATE` note is annotated again.** |
| **F-R3** | **THE CONTRACT CARRIED NO RECORD OF THE FOURTH CONFIRM PASS'S FINDINGS.** `§15` recorded the three `A`/`B`/`C` passes; the `D-1`…`D-5` set lived only in `docs/next-steps.md`'s inserts. | **`§15.7` appended to `§15`** — the five findings, their layers, their closure evidence read at the landed sites, the TWO FALSIFIED PREMISES, the counting note, and the package row kept an EMPTY SEARCH. **No second adversarial record was invented.** |
| **F-R4** | **THE FIFTH GATE-4 CONFIRM PASS WAS IMPLIED RATHER THAN RECORDED AS OWED.** `§17.3` `O-1` names the FOURTH pass as in flight; at this head the fourth has landed and the FIFTH is in flight. | **Recorded as an owed item with its owner (`18.3`'s owed-set row `R-4`), and the `E-` ID SPACE recorded as EMPTY** (`§15.7`'s closing paragraph) — **so no reader takes this reconciliation as the unit's green.** |
| **F-R5** | **THE TWO `D-` PREMISES STOOD IN THE CONTRACT AS NEITHER FINDING NOR FALSIFICATION** (the `D-` set was unrecorded — `F-R3` — so nothing carried the correction). | **RECORDED PLAINLY at `§15.7`** (the two-falsified-premises block): **`D-5`'s four-arm premise is over-counted by two** and **`D-4`'s dead-limb premise is falsified — the regex had no `g` flag, so it hit the first match and the limb fired; the defect was the ANCHOR.** **No driver or pin edit — neither is in this wall. The pin-side arms the falsifications touch are `VERIFIED-BY-READ` at their pinned sites** (`R-14.i`/`R-14.ii`/`R-14.iii`, the four `⟨D-5 — RE-STATED … SHARPENED, NEVER RELAXED⟩` markers, the re-anchored `D-4` census reader). |
| **F-R6** | **THE §-CITATION AUDIT.** Every `§`-citation in this file, the greens artifact and the three trackers this unit touches was checked against the headings present. | **Two gaps closed:** `§17.4` item 1's heading list did not include a `§18`, and the greens artifact's source-list annotation named the series as `§12`–`§15` (+`§16`) while the foot now carries `§17`/`§18` — **both annotated beside** (no filed text rewritten). **No citation was found pointing at a moved or renumbered section; nothing was archived by this pass and no reference needed repointing.** |

### 18.3 THE OWED SET, NAMED WITH OWNERS

| # | The owed item | Owner | Why it is owed / what settles it |
| --- | --- | --- | --- |
| **R-1** | **THE PIN'S STALE IN-SOURCE DIGEST COMMENT** — `VERIFIED-BY-READ` by this pass at two sites in `tests/live-drive-contract.test.ts` (**the head-comment block and the trailing arm-section block**): both still name *"the digest of record at the current head"* as the driver's `md5 f53b569ecc97f9569f14f88238c0f2e0` / `7865` lines, **against a frozen head of `8293` lines / `md5 aa3c01ea315a3c9f9a4f6898e88dfd05`.** | **the TestWriter** (`tests/**`) | `§16.6` item 2 / `C-11`'s *"FROZEN DIGEST BYTE-LITERAL"* limb. Settles it: a re-statement that prints the superseded digest BESIDE the current one, teeth unmoved. **NOT to be repaired by a doc pass.** |
| **R-2** | **THE PIN'S `R-13` STAGED-RED COMMENT TEXT** — `VERIFIED-BY-READ`: the `R-13` section still reads *"DELIBERATELY LEFT RED FOR THE NEXT DRIVER PASS … this file's INTENDED STATE at this head"* and its `it()` titles carry `STAGED … (owner: the next driver pass)`, **while the pin's own invocation at the frozen head reads `80 passed (80)` with NO red arm** (`§18.1-e`). | **the TestWriter** (`tests/**`) | `§17.2` `F-4` / `§17.3` `O-5`. The three arms are NOT skipped, `todo`'d or relaxed — **what is stale is the COMMENT TEXT, not a tooth** — so a re-statement saying they are green with the staged reading kept visible settles it. This is also why `C-7`'s arm re-statement reads as an IN-SOURCE annotation, not a driver act. |
| **R-3** | **THE CONTRACT'S `sha256` + ITS POST-`§18` LINE COUNT.** (`§14.9`/`§15.6`/`§16.7` item 5/`§17.1-h`/`18.1-i`.) | **a shell-bearing pass**, which **must state its instrument** | A file cannot contain its own digest; **this pass holds no shell.** |
| **R-4** | **THE FIFTH GATE-4 CONFIRM PASS — IN FLIGHT IN THIS SAME ROUND, recorded as OWED rather than implied.** | **the supervisor's gate cycle (the read-only `role_adversarial_reviewer`)** | It is what closes or confirms `C-10` · `C-11`'s residual and what gives the `29 + 3 + 2 + 1 = 35` partition its measured backing. **NO `E-` FINDING HAS BEEN FILED BY IT AT THE HEAD THIS RE-RUN READ** (`VERIFIED-BY-READ`: an empty read of the five trackers for a fifth-pass/E-` id set) — **so this reconciliation is NOT the unit's green and must not be read as one.** |
| **R-5** | **THE `14` `cdp` ROWS THAT WITHHOLD THEIR CLICK RECORD** — the rows whose blocks' drive sites name NO row, so per-row attribution (`D-1`) cannot hand them a record of their own. | **the driver follow-up (the next live-driver pass)** | `D-1`'s fix attaches by IDENTITY and **deliberately WITHHOLDS** the block-wide count from a multi-attributed block, so the withholding is the contract working — **but `§2.3` `H-3` clause 1 asks that every click be observable, and the residual is a DRIVER act**: name the row at each remaining drive site, or record the absence as a declared class. **The landed click-record split (`29` numeric single-clicks + `24` withheld + `15` no-record rows, `§15.2.3` `C-6`) is a RECORDED READING of the landing pass and NOT re-measured here.** |
| **R-6** | **`P-SM-2`'s DECLARATION THAT TWO PANE STATES CARRY NO RESTORE-TO-BASELINE ARM — a DECLARATION, UNRESOLVED.** | **the architect** (the ruling), with the TestWriter for the `tests/**` arm | `§17.3` `O-6` stands unmoved: the arm is honestly named NOT-RUN, but **whether a state's absence from the budget is a legitimate class-(b) exclusion or an `F-17` shortfall has never been ruled**, and `§4.2`'s `7 × 2` still reads as if every state carried both arms. Settles it: an explicit ruling at `§4.2`'s `P-SM-2` row. |
| **R-7** | **`§13.7` ITEMS `3`/`4` — `UNANSWERABLE FROM THE `--block=` SPACE`.** | **the architect / the next live pass** | `§15.3.2`. A ruling, or a full-battery head with ZERO FAIL blocks and a non-empty missing set, settles them. |
| **R-8** | **THE UNIT'S `DONE` ROW — NOT WRITTEN.** | **the supervisor** | It must state its layer (`RCA-12`), cite the recorded red→green, the gate-4 records (`§15` + its new `§15.7`), the gates 5/6 re-run and **this gates-7+8 re-run's record (`§18` + the archive record)**, and carry NO app claim. |
| **R-9** | **EVERY APP-LAYER ITEM, AND THE TRACKER CLOSURE OF THE TWO DRIVER ROWS** (`LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`, `LIVE-DRIVER-EVIDENCE-LOSS`, and `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`'s closure), **the fixture route (`GAP-8`), and the foundation pin-refresh unit.** | **their named owners** (`§9` `T-3`/`T-4`; the architect's ordered pin-refresh unit; the supervisor for the tracker closure) | **This unit fixes the INSTRUMENT. A green here is HARNESS `[D]` and never app-green** (`RCA-12`). |

### 18.4 THE LAYER STATEMENT (repeated because it is the one thing a reader must not over-read)

**DOC-LAYER ONLY.** **This section ran nothing, measured line counts only, and reconciled DOCUMENTS against the
tree.** **THE UNIT'S OWN EVIDENCE IS THE NODE PIN (`tests/live-drive-contract.test.ts`) PLUS ITS LIVE BATTERY
READINGS: a green there is a NODE-STATIC / report-integrity green — `RCA-12`'s ENVELOPE-green AT MOST — and it is
NEVER APP-GREEN, never `[T]`-evidence, and never a claim that the app works.** **The app layer's own FAIL pile is
untouched, un-counted and un-dispositioned by this unit (`§9` `T-4`); no package/foundation row is owed by it
(`§15.0-c`, re-affirmed for the fourth pass at `§15.7`), so the handoff document gains no row from this unit.**
