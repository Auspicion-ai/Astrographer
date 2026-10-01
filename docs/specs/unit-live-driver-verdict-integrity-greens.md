# GATE 5 — BLIND GREEN-SCENARIO ARTIFACT for `U-LIVE-DRIVER-VERDICT-INTEGRITY`

**Authored by:** the Blind-Test Writer (gate 5), from the DOCUMENTATION ONLY.
**Sources used to derive every expectation below:** `docs/specs/unit-live-driver-verdict-integrity.md`
(the contract, including its dated amendments `§12` and `§13`) **⟨ANNOTATED `2026-09-29` BY THE GATE-7
PROOFREADER (`RCA-8(c)`: the line above is KEPT as filed) — the amendment series it names has GROWN: the contract now
also carries `§14` (the `C-9` register-arithmetic re-statement) and `§15` (the gate-4 adversarial-findings record,
including the `§13.5` item 3 WITHDRAWAL), and its foot now carries the gate-7 audit record `§16`. Read the citation as
`§12`–`§15` (plus `§16`); no other line of this artifact's source list is stale.⟩** **⟨ANNOTATED AGAIN `2026-09-29`
BY THE GATES-7+8 RE-RUN (`RCA-6`) — `RCA-8(c)`: the line above is KEPT as filed) — the series has grown ONCE MORE:
the contract's foot now also carries `§15.7` (the fourth gate-4 confirm pass's `D-1`…`D-5` findings, appended to the
`§15` adversarial record) and `§18` (the gates-7+8 re-run record, `§18.1`…`§18.4`). **Read the citation as
`§12`–`§15` plus `§16`–`§18`.**⟩**, `docs/specs/user-flow-audit.md`,
`docs/specs/user-flow-audit-checklist.md`, `docs/decisions.md`, `docs/next-steps.md`,
`docs/defects.md`, `docs/pending.md`.
**Sources NOT read before this file was written:** `scripts/live-drive.mjs`,
`tests/live-drive-contract.test.ts` and every other implementation file. The expectations in `§3`
were fixed from the contract text alone and are **frozen before the first scenario run**; the run
readings are recorded separately in `§4` so that no expectation can be edited to match a reading.

---

## 1. LAYER DISCIPLINE (read this before reading any result)

**This unit is HARNESS / `[D]` — the instrument's own reporting integrity.** A green in this
artifact proves:

- that the live driver (`scripts/live-drive.mjs`) reports honestly — coverage, refusal, evidence,
  classification, hygiene; and
- that the node-static pins carry the contracted structure.

**A green here says NOTHING about the app.** Per the contract `§5` (the layer ledger) and `§1.2`
(`Any [T]/node claim — a driver green may never be cited as app evidence`), and per `RCA-12`
(*a node-suite green is ENVELOPE-green, not APP-green*):

- every app-layer FAIL a battery prints is **an app-layer reading owned by another row** — it is
  **not** this unit's result, and it is **not** evidence that this unit failed;
- the app layer's live FAIL pile is a separate, untouched pile (`§1.4`, `§9 T-4`): this unit
  neither fixes, re-dispositions nor re-counts it;
- the two claims this unit may **never** make (`§10` item 9) are *"the app works"* and *"the
  battery is app-green."* Neither appears in `§4`, in any status cell, or in the report back.

Each scenario in `§3` carries its own `LAYER` cell, drawn from the contract's own ledger:

| Layer tag used here | What it means |
| --- | --- |
| **HARNESS `[D]` / node-static** | a structural assertion read out of source text / statically parsed literals by the pin, run in node — `§6.1` class (a) |
| **HARNESS `[D]` / live process** | a real battery run's own printed report — `§6.1` class (b); still **NOT** app-green and **NOT** `[T]` |
| **NODE SUITE (envelope/host)** | the `npm test` vitest suite — the contract `§7 X-2` states what it does and does not cover |

**The driver is in NO trio** (`§5`): a green trio proves the change broke nothing else, never that
the driver reports correctly.

---

## 2. THE HONESTY BLOCK OF THIS ARTIFACT

1. **The expectations below were derived before the runs and are not edited afterwards.** They live
   in `§3`; readings live in `§4`.
2. **The invocation space was probed before the scenario runs** (`node scripts/live-drive.mjs --help`
   is not a recognised option and booted the default launch; that probe was killed, its Electron
   tree reaped, and the observation is recorded in `§4.0`). Probing the operator interface is
   invocation discovery, not expectation derivation: **no expectation in `§3` was changed by it.**
3. **Three pre-existing reds are carried by the repo and are NOT this unit's** (named in
   `docs/next-steps.md`'s head block and reproduced here so they are not miscounted):
   `archive/tests/2026-10-04-unit-stage-active-tab-display-pbt-generators.test.ts` `P-SM-1
   [strat:stage-seam-schedule-single-active]`; `tests/pd-vendor-pin-refresh-register.test.ts`
   `P-IM-pd-pin-1`; `tests/pd-vendor-set.test.ts` `§3.3` item 2 (the adjacent foundation tree's HEAD
   moved past the pinned commit — a **PIN FAULT BY DESIGN**, met by a four-site atomic restatement in
   the pin-refresh unit's own cycle, **never** by a carry). They are named as pre-existing and
   untouched wherever they appear in `§4`.
4. **This unit's own acceptance status is recorded by the contract as `§13.5`:** the
   refusal/report-shape limbs are SATISFIED, **the `8 of 8` limb is OPEN** and **the hygiene item is
   CONFIRMED-BROKEN**. `§13.5`'s readings are `RECORDED READINGS` of the implementer's landing pass —
   **they are not this gate's readings**, and this gate re-runs the scenarios independently.

---

## 3. THE SCENARIO SET (expectations frozen before the runs)

### 3.0 Invocation conventions

**`⟨LIVE⟩`** is the canonical live invocation an operator runs — the contract's own `§6.3 C-2`
invocation, with isolated ports (`DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause (i): *never* `:9222`)
and this host's recorded requirements:

```
DISPLAY=:0 timeout 900 node scripts/live-drive.mjs \
  --port=3917 --cdp-port=9357 --display=:0 <scope flags…> > /tmp/astro-blinds/<scenario>.log 2>&1
```

- **Isolated ports:** `--port=3917` (MCP) and `--cdp-port=9357` (CDP). `:9222` is never touched
  (`docs/pending.md` `LIVE-RUN-CONTAMINATION-HAZARD`).
- **The `/dev/shm` bypass and the scratch profile** come from the driver's own documented launch
  route: it launches through `scripts/start-app.sh`, which passes `--disable-dev-shm-usage` by
  default, and it gives each run a **disposable scratch `HOME`** (`docs/pending.md`: *"`scripts/live-drive.mjs`
  DOES NOT PASS A `--user-data-dir`, and its isolation is a DISPOSABLE `HOME` instead"*), from which
  Chromium derives its own scratch `--user-data-dir`. `§4.0` records the observed launch line.
- **Bounded:** every scenario is run under `timeout`, and *"a run that is truncated or interrupted
  proves nothing and must never be reported as a result"* (`§6.3`, closing line).
- **Scope flags** are `--block=<a,b,…>` or `--block=all` (full battery), exactly as the contract
  names them (`§2.2 E-12` item 2: *"the `--block=` option space is what makes "requested"
  well-defined"*).

**`⟨PIN⟩`** is the node-static invocation:

```
npx vitest run tests/live-drive-contract.test.ts --reporter=verbose
```

**`⟨SUITE⟩`** is the node-side suite: `npm test`.

---

### G-1 — the re-stated structural pin is green

| Field | Content |
| --- | --- |
| **Derives from** | `§7 X-1` (the pin table: `R5.b`, `R5.c`, `R2.e`, the `§6.1` result-field schema `R4.1`…`R4.9`, `R6.a`/`R6.b`, `R4.0`'s floor, `R5.d` — *kept green or re-stated, never relaxed*), `§12.6` item 4, `§13.7` item 5, `§13.8` |
| **Invocation** | `⟨PIN⟩` |
| **Expected reading (falsifiable)** | The run **exits `0`** and reports **no failing test**, i.e. the pin is green at this head — including the re-stated rows that bring `boot_landing`/`vis_persist` into the row-block scope (`§12.6` item 4) and the re-stated class-(b) term whose superseded value is printed beside the measured `53` (`§13.7` item 5). **Falsifier:** any `FAIL`/`×` line, or a non-zero exit, in *this file*, is a FAIL of G-1. |
| **Layer** | HARNESS `[D]` / node-static |

### G-2 — the register: 7 rows, 97 declared attempts, seed `0x20260929`, `held`/`broken` per row, caps

| Field | Content |
| --- | --- |
| **Derives from** | `§4.2` (the register tables: `P-IM-1` `6`, `P-IM-2` `14`, `P-SM-1` `16`, `P-SM-2` `17`, `P-TP-1` `16`, `P-TP-2` `14`, `P-SM-3` `14`; `6+14+16+17+16+14+14 = 97`; `7` rows at the ≤ `8` cap; seed `0x20260929`; stop-after-5; ≤ `100`/row · ≤ `400` total), `§12.5`, `§4.1`'s added ruling, `§13.3` (the printed split: `6+0` · `13+1` · `12+4` · `14+3` · `13+3` · `12+2` · `11+3` = `81+16 = 97`), `§13.6` `F-17` |
| **Invocation** | `⟨PIN⟩` |
| **Expected reading (falsifiable)** | **All seven `P-*` row ids appear** — `P-IM-1`, `P-IM-2`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`, `P-SM-3` — with **exactly those declared totals** and **`held` for every row** (`executed + named class-(b) NOT-RUN === declared` exactly; `F-17` makes any shortfall `broken`). **No `F-`-prefixed row id appears** in the register output (`§4.1`/`§12.5`: *no `F-` row is added*). **Falsifier:** a row reporting `broken`, a declared total other than the seven above, a missing `P-SM-3`, or an `F-`-row id in the register output. |
| **Layer** | HARNESS `[D]` / node-static |

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the `G-2` block above is KEPT as the frozen
expectation and nothing in it is rewritten) — THE FROZEN `97` IS SUPERSEDED BY THE LANDED `101`, and the seven
declared totals `6/14/16/17/16/14/14` by `6/14/16/17/19/15/14`.** **The landed reading is `6 + 14 + 16 + 17 + 19 + 15
+ 14 = 101 = 85 executed node-side + 16 named class-(b) NOT-RUN` (the two moved terms: `P-TP-1` `16 → 19`, `P-TP-2`
`14 → 15`), re-stated at the contract's `§14.2`/`§14.3` with the filed `97` kept visible, and this pass READ the pin's
own arithmetic rows as carrying BOTH values with the `TALLY` line built from the landed totals (`VERIFIED-BY-READ`).
**This scenario's EXPECTATION is therefore stale in its figures and NOT in its teeth** — the `held`/`broken`
discipline, the `7`-row shape, the seed, the stop-after-5 and the no-`F-`-row rule all stand; the artifact's own
`§4.2`/`§4.3` readings (`97`, `69 passed (69)`) are its gate-5 head's and are superseded by the contract's `§16.1`.⟩**

### G-3 — the declaration is unmoved: `MATRIX_ROWS` = 8 ids `U-1`..`U-8`, and the `uf_*` census floor holds

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-1` (`MATRIX_ROWS.length` stays `8`, ids stay `U-1`..`U-8`), `§2.1 E-5` (`NO NEW SLOT, NO NEW BLOCK`), `§8 D-5`, `§2.2 E-10` (`uf_*` row blocks ≥ `20`, with the declared non-row set), `§3.3` (census rows: `8` entries; `26` `uf_*` keys of which `6` declared non-row ⇒ `20` row blocks; `BLOCK_ENTRIES` ≥ `30`), `§12.3` item 1, `§13.8` |
| **Invocation** | `⟨PIN⟩` |
| **Expected reading (falsifiable)** | The pin's own assertions of the 8-row/8-id matrix, of one claiming block per declared row, of the duplicate-key rules, and of the `uf_*` census floor all read **green** (the same exit-0 evidence as G-1, read for these specific rules). **Falsifier:** a 9th `U-` id, a renumbered id, a deleted `uf_*` row block taking the census under `20`, or a failing duplicate-key assertion. |
| **Layer** | HARNESS `[D]` / node-static |

### G-4 — the node-side suite carries only the three named pre-existing reds

| Field | Content |
| --- | --- |
| **Derives from** | `§7 X-2` (the trio, with its scope caveat), `§9 T-5` (the carried baseline red is *carried*, unchanged), `docs/next-steps.md`'s head block (the three named reds) |
| **Invocation** | `⟨SUITE⟩` (and, as `§7 X-2` lists the trio, `npm run typecheck` and `npm run build` for exit status only) |
| **Expected reading (falsifiable)** | The suite's failing set, if any, is **exactly** the three pre-existing reds named in `§2.3` item 3 of this artifact: `P-SM-1 [strat:stage-seam-schedule-single-active]`, `P-IM-pd-pin-1`, `pd-vendor-set` `§3.3` item 2. **No failing test in `tests/live-drive-contract.test.ts`**, and no other failure. **Falsifier:** any fourth failing test, or any failure inside the contract pin, or a driver-contract row red inside `npm test`. |
| **Layer** | NODE SUITE (envelope/host) — `§7 X-2`'s caveat applies in full: this says nothing about the driver's reporting and nothing about the app |

### G-5 — the `editingMode` → `representationMode` sweep (`T-2`) has landed

| Field | Content |
| --- | --- |
| **Derives from** | `§3.2 F-12` (*the driver's sweep finds **every** occurrence … and the false-FAIL generator is gone*), `§9 T-2` (the three read sites: the `uf_settings_5` regex assertion, the `operatorSet({editingMode:…})` call, `uf_restore_layout`'s DIAG string), `DECIDED: REPRESENTATION-MODE-SUCCESSOR`, `DECIDED: EDITING-MODE-SETTING` (SUPERSEDED) |
| **Invocation** | `⟨LIVE⟩ --block=uf_settings_5` (with the full battery's own `uf_settings_5` line read as the second channel) |
| **Expected reading (falsifiable)** | `uf_settings_5`'s printed row carries **no assertion against the removed token `editingMode`** and its evidence/assertion names the landed successor **`representationMode`** (`html \| markdown`). **Falsifier:** the printed line for `uf_settings_5` containing the string `editingMode`, or failing with a comparison that can never hold because the asserted token was removed. |
| **Layer** | HARNESS `[D]` / live process (the row's own verdict is *not* read as app evidence) |

### G-6 — the full battery prints one verdict per declared row and `OK`, and **never** `OK` with a shortfall

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-1`, `§2.1 E-3` clause 2, `§8 D-1`, `§3.2 F-1`/`F-2`, `§6.3 C-2` item 1 (*the matrix must report `8 of 8` executed, and the reconciliation line must print `OK` — **or** the run must print `REFUSED` naming the rows it lacks*; *a run that prints `OK` while `matrixRowsExecuted < 8` falsifies this unit*) |
| **Invocation** | `⟨LIVE⟩` (full battery, no `--block=` scope) |
| **Expected reading (falsifiable)** | **Either** (a) the coverage field reads `{matrixTotal:8, verdicts:8, missingRows:[], fullBattery:true}` **and** the reconciliation line prints **`OK`**; **or** (b) the coverage field reads `{matrixTotal:8, verdicts:n<8, missingRows:[…non-empty…], fullBattery:true}`, the reconciliation line prints **`REFUSED — missing declared row(s): <ids>`** naming **exactly** those ids, and **`OK` is not printed**. **Falsifier (this is the unit's core falsifier):** `OK` printed while `verdicts < 8`, or a coverage field whose `missingRows` is empty while `verdicts < 8`, or a `missingRows` list that is not the declared-minus-verdicted set difference. |
| **Layer** | HARNESS `[D]` / live process |

### G-7 — the refusal is loud and non-zero-exiting

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-3` clause 2 (`process.exitCode` non-zero — **`1`**; `2` stays the hard-error code), `§3.2 F-1` (exit `1`), `§2.2 E-12` item 2, `§13.5` item 5 |
| **Invocation** | `⟨LIVE⟩` (full battery) and `⟨LIVE⟩ --block=boot_landing` (scoped) — the exit code is read for both |
| **Expected reading (falsifiable)** | On a run whose reconciliation reads **`REFUSED`**, the process **exit code is non-zero** and, when the run is otherwise clean, exactly **`1`** (never `2` for a coverage refusal; `2` is reserved for a hard error). **Falsifier:** a `REFUSED` line with exit `0`; a coverage refusal exiting `2`. **Honest limit, taken from `§13.1`'s `NOT RECORDED` note:** the driver's exit expression exits `1` on a FAIL count *first*, so on a battery that also prints FAIL blocks this reading does **not** by itself isolate the refusal branch — G-18 supplies the isolating reading. |
| **Layer** | HARNESS `[D]` / live process |

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the `G-7` block above is KEPT as frozen and its
`NOT-RUN` reading is KEPT as this run's own result) — `G-7` IS AN UNREACHABLE-LIMB READING, NOT A FAILURE, and its
`NOT-RUN` verdict needs no re-classification.** **`REFUSED` occurs in NO scoped invocation of record and the landed
driver's own reconciliation line prints `OK (full battery: … verdicted)` / `OK (scoped run: … in scope; … inconclusive)`
with `REFUSED` reserved for the failing branch (the contract's `§15.3.1` records the withdrawal; `DECIDED:
LIVE-DRIVER-OK-CARRIES-ITS-SCOPE` clause (2) keeps the FULL-battery refusal limb).** **What remains readable is the
companion this artifact already recorded at its `§4.6` `N-5`: `OK` + FAILs ⇒ exit `1`, `OK` + zero FAILs ⇒ exit `0`.**⟩**

### G-8 — a scoped run that drives no declared row refuses by name, non-zero

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-3` clause 2's `P-SM-1` (iii) caveat read in the refusal direction, `§3.2 F-1`, `§6.3 C-2` item 3 (`--block=<a small set>` prints `REFUSED` naming the missing rows and exits non-zero), `§0.1 M-1` (*`--block=boot_landing,import` → `matrix rows executed=0 … OK`* is the defect being closed) |
| **Invocation** | `⟨LIVE⟩ --block=boot_landing` |
| **Expected reading (falsifiable)** | The run prints a **`ROW-SET ERROR`**-class line naming the matrix rows it did not verdict, a **`REFUSED`** reconciliation line naming them, **`OK` is nowhere printed**, and the **exit code is non-zero**. **Falsifier:** `OK` on this invocation, or a `REFUSED`/refusal without the missing row ids named, or exit `0`. |
| **Layer** | HARNESS `[D]` / live process |

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the `G-8` expectation above and its `§4.2` `FAIL`
reading are KEPT — the run record is NOT rewritten) — THIS EXPECTATION IS SUPERSEDED BY THE ARCHITECT'S RULING
`DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`, and the artifact MUST NOT still demand a refusal here.** **THE RULED
FORM: an `OK` must carry the SCOPE it covers — `OK (scoped run: N of 8 declared rows in scope; M inconclusive)` on a
scoped run, `OK (full battery: 8 of 8 declared rows verdicted)` on a full battery — so the filed defect shape
(`matrix rows executed=0 … OK`, read as coverage it did not take) is closed BY DISAMBIGUATION, not by making a scoped
run refuse.** **`G-8`'s `FAIL` CLASSIFICATION is therefore spent as a finding against the instrument: the reading it
falsified (absence of `OK`) is the reading the ruling RETAINS in ruled form, and this artifact's own `§4.4` `D-A`
already called the reconciliation a spec-owning act — that act has happened (`docs/decisions.md`, `2026-09-29`;
recorded at the contract's `§15.3.1`).** **The exit reading the artifact measured on that invocation (non-zero via the
FAIL branch) stands.**⟩**

### G-9 — every printed per-row line carries the `§6.1` set, including the whole `surface` object with `target`

| Field | Content |
| --- | --- |
| **Derives from** | `§2.2 E-6` (the field set), `§2.2 E-7` (the printed-member table: `row`, `block`, `verdict`, `dclass`, `realInput`, `surface` **the whole object, `target` AND `liveSurfacePresent`**, `failingClause`, `evidence`, `proxyPASS`/`proxy`, `gesturePath`), `§0.2 V-4`/`V-5` (the field set is built and never printed; `surface.target` exists and must be printed), `§6.3 C-2` item 2, `§13.5` item 2 |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | **Every** printed `ROW`-class line carries: the row id, its block, a verdict from `{PASS, FAIL, PARKED, NOT-DRIVEN}`, a `dclass` from `{D-interaction, D-visual, D-state}`, a `realInput` boolean, a `surface` carrying **`target`** (the whole object, `liveSurfacePresent` included), an `evidence` string that is not empty and is not *"the block passed"*, and a `gesturePath` from `{cdp, native-fallback, missing, zero-box, …}`. **Falsifier:** any printed row line missing `surface`/`target`, or any printed row line whose `evidence` is empty, or a verdict string outside the four-member set. |
| **Layer** | HARNESS `[D]` / live process |

### G-10 — every non-PASS prints a failing clause with `observed` **and** `required`; no FAIL has empty `evidence`

| Field | Content |
| --- | --- |
| **Derives from** | `§2.2 E-7`'s `failingClause` row (*the predicate that failed, with `observed` and `required` values named*; *a row whose clause is absent from the printed evidence is a review finding*), `§2.2 E-8` (the acceptance set: `vis_persist`, `boot_landing`, the four `uf_*` comparison printers, and `repro_dup_para`'s empty evidence), `§3.2 F-10`, `§6.3 C-2` item 2, `§13.5` item 2 |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | **Every** `FAIL` (and every `NOT-DRIVEN`/`PARKED`, as `§2.3 H-4`'s table requires a concrete reason) printed line carries a clause naming **both** `observed` and `required` values, and **no `FAIL` line carries an empty evidence field** — explicitly including `repro_dup_para` (whose `required` clause is non-empty per `§13.5` item 2) and `boot_landing` (whose clause must print `required landingAfter=false` per `§13.5` item 2). **Falsifier:** any non-PASS line with no `failingClause`, a clause naming only one of `observed`/`required`, or a FAIL whose evidence is empty/predicate-less. |
| **Layer** | HARNESS `[D]` / live process |

### G-11 — the conversion's id source: `boot_landing` carries `UF-STAGE-1` (and never a minted id; the `UNTAKEN` limb is not claimed)

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-4` as amended by `§12.1` item 5 (`boot_landing` → **`UF-STAGE-1`**), `§12.1`'s `UNTAKEN` block (*the converted result must not print, imply, or claim the re-derive limb*), `§12.3` item 4 (the EXTENDED line carries `UF-STAGE-1:boot_landing=…`), `§2.2 E-12` item 3, `§8 D-3`, `DECIDED: LIVE-DRIVER-ROW-ID-SOURCE-AND-SHARED-ROW-AGGREGATION` (the driver never mints a row id), `docs/specs/user-flow-audit-checklist.md` `UF-STAGE-1` (checklist §5) |
| **Invocation** | `⟨LIVE⟩` (full battery) and `⟨LIVE⟩ --block=boot_landing` |
| **Expected reading (falsifiable)** | The report prints a line for the row id **`UF-STAGE-1`** produced by the block **`boot_landing`**, and that result carries the `§6.1` set per G-9/G-10. **No minted id of the withdrawn `UF-LANDING-*`/`UF-VIS-*` form appears anywhere.** The result does **not** print, imply or claim the `UF-STAGE-1` re-derive limb (*"a still-empty content re-derive keeps it"*), which `§12.1` records as `UNTAKEN`. **Falsifier:** a `UF-LANDING-`-form id; a `UF-STAGE-1` verdict attributed to another block; a printed claim about the re-derive limb. |
| **Layer** | HARNESS `[D]` / live process |

### G-12 — the conversion's second half: `vis_persist` carries `UF-SETTINGS-7` **and measures the PERSISTENCE half** (a second read after a re-derive reads the flipped value)

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1`'s `vis_persist` re-pin (*a real hit-tested click on the pane-visibility toggle flips `data-enabled` **and the change is PERSISTED — a second read after a re-derive reads the flipped value** — never a bare `before=true after=true`*), `§12.1`'s `vis_persist` row (*what must be added: the persistence measurement (the re-derive half)*), `§12.7` item 1, `§2.2 E-7`/`E-9` |
| **Invocation** | `⟨LIVE⟩` (full battery) and `⟨LIVE⟩ --block=boot_landing,vis_persist` |
| **Expected reading (falsifiable)** | The `vis_persist` printed line carries row id **`UF-SETTINGS-7`**, `realInput:true` with `gesturePath=cdp` (a real hit-tested click), and an `evidence`/`failingClause` that **names the persistence measurement** — the re-derive plus the second read, with the flipped value read back (e.g. a `before`/`after` **and** a post-re-derive re-read). **Falsifier:** a `vis_persist` line whose only evidence is a bare `before=… after=…` pair with no re-derive/second read, or a clause whose required value is absent (`§0.1 M-3`'s exact defect), or a `realInput:false`/non-`cdp` path on a verdict-carrying click (`§0.1 M-7`'s exact defect). |
| **Layer** | HARNESS `[D]` / live process |

### G-13 — shared-row aggregation (`E-11`): both contributors print, the row's verdict is the AND, a disagreeing pair reads `FAIL`

| Field | Content |
| --- | --- |
| **Derives from** | `§2.2 E-11` items 1–4, `§12.1`'s closing block (the `UF-SETTINGS-7` pair: `vis_persist` + `uf_settings_7`), `§12.3` item 4, `§3.2 F-14` (`§12.4`), `§13.5` item 2 (`SHARED rows: UF-SETTINGS-7 aggregate(row verdict)=… contributors=[…]`) |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | The report prints an **aggregate line for `UF-SETTINGS-7`** carrying **both** contributors' own verdicts (`vis_persist=…` **and** `uf_settings_7=…`) **and** the row's aggregated verdict, where the aggregate is **the AND of the two** (PASS iff both PASS; any single FAIL makes the row read FAIL; a `NOT-DRIVEN`/`PARKED` contributor is never promoted). **Falsifier:** only the aggregate printed with no per-contributor verdicts; an aggregate that is an average/majority/last-wins/first-wins (e.g. the row reading PASS while one contributor reads FAIL). |
| **Layer** | HARNESS `[D]` / live process |

### G-14 — extended declared/executed reconciliation (`E-12`): a declared extended row whose requested blocks produced no verdict is refused **by name**, non-zero

| Field | Content |
| --- | --- |
| **Derives from** | `§2.2 E-12` items 1/2/4/5, `§12.4 F-13`, `§13.1 L-4` (*`--block=boot_landing,vis_persist` exits `1` and prints `REFUSED — missing declared extended row(s): UF-SETTINGS-7`*), `§13.5` item 3, `§13.7` item 3 (the sharper two-block isolation is owed) |
| **Invocation** | `⟨LIVE⟩ --block=boot_landing,vis_persist` (and `⟨LIVE⟩ --block=boot_landing` as the sibling reading) |
| **Expected reading (falsifiable)** | The run prints a per-row/refusal line naming **the declared extended row id whose requested blocks produced no verdict** (`UF-SETTINGS-7`, whose sibling half `uf_settings_7` is out of scope), the extended reconciliation line reads **`REFUSED`** with that id named, **`OK` is not printed** for that dimension, and the **exit code is non-zero**. **Falsifier:** a run whose declared extended row was in scope (at least one declared block requested) and produced no verdict while the run prints `OK` / exits `0`. |
| **Layer** | HARNESS `[D]` / live process |

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the `G-14` expectation and its `§4.2` `FAIL`
reading are KEPT as this run's own record) — `G-14` IS AN UNREACHABLE-LIMB READING, NOT A FAILURE, and its expectation
is WITHDRAWN WITH `§13.5` ITEM 3.** **The contract's `§15.3.1` records that the scoped-refusal reading does not
reproduce (both contributors emit the enumerated `UF-SETTINGS-7`; `REFUSED` occurs in no invocation; the exit `1` came
from `fail > 0`), and `§15.3.2` records that the sharper isolation is UNANSWERABLE FROM THE `--block=` SPACE.** **The
`E-12` refusal OBLIGATION itself is untouched and stands for a declared extended row whose REQUESTED blocks produced
no verdict; what is withdrawn is the one reading recorded as exercising it.**⟩**

### G-15 — an emitted-but-**undeclared** id is reported and **never** refuses the run; the missing set is a set difference

| Field | Content |
| --- | --- |
| **Derives from** | `§2.2 E-12` items 1/4/5, `§12.4 F-15` (`EXTENDED-UNDECLARED: <row id>(<block>)` printed — **named, never silent** — while the run is **not** refused), `§12.2 V-15` (the emitted ≫ declared case), `§13.1 L-3` (`53 of 32 defined; 3 inconclusive; 22 EXTENDED-UNDECLARED`), `§13.2` items 1–3 |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | The run prints **`EXTENDED-UNDECLARED: <id>(<block>)`** lines for emitted ids in no declared extended structure, the extended count line reads *"N of 32 defined"* (`§13.2` item 1 — the declared count is `32`, and it is **not** a coverage figure), and **those undeclared ids do not themselves refuse the run** — the only refusal cause on the extended dimension is a **declared** row with no verdict (G-14). The `3` inconclusive declared rows outside this unit's two are **reported** and do not refuse (`§13.2` item 4). **Falsifier:** an undeclared emitted id causing a refusal; an undeclared emission printed nowhere (silent); a declared count other than `32`. |
| **Layer** | HARNESS `[D]` / live process |

### G-16 — click discipline (`H-3`): every verdict-carrying click prints coordinate + viewport + element under the point + `onTarget`; an off-viewport click is **`NOT-DRIVEN`**, never a PASS and never an app FAIL

| Field | Content |
| --- | --- |
| **Derives from** | `§2.3 H-3` clauses 1/2/3, `§2.3 H-4`'s table (the `NOT-DRIVEN` row: `realInput:false` + the DRIVER-failure marker + the concrete reason; **never an app-layer FAIL**, never a PASS), `§3.2 F-4` (`inVp:false` → `NOT-DRIVEN` with coordinate, viewport and `onTarget` printed), `§0.1 M-7` (the measured `y=1473.8` of a `720` px viewport, `inVp:false`), `§6.3 C-2` item 2 |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | Every printed click that carries a verdict records **its coordinate, the viewport it was dispatched against, the element under that point, and `onTarget`**; a click whose coordinate is off-viewport or not on the target yields verdict **`NOT-DRIVEN`** with `realInput:false` and a concrete driver-failure reason; **no** such click reads `PASS` and **no** such click is reported as an app `FAIL`. A raw synthetic `.click()` appears only as `[DIAG]`-marked, verdict-free attribution evidence. **Falsifier:** a verdict-carrying click with no coordinate/viewport/`onTarget` record; an `inVp:false` click reading PASS or FAIL-on-the-app's-account. |
| **Layer** | HARNESS `[D]` / live process |

### G-17 — per-block restore (`H-1`/`H-2`, ruled in `§13.4`): an isolated `--block=` run and a full-battery run **agree** on the same row's verdict

| Field | Content |
| --- | --- |
| **Derives from** | `§2.3 H-1` clause 4 (*a row whose verdict depends on its POSITION must be re-measurable alone, and the two readings must agree once the hygiene holds*), `§2.3 H-2`, `§13.4` items 1–5 (the per-block pre-flight restore is **permitted** and is what the clause requires), `§13.6 F-16`, `§6.3 C-2` item 4 (**the unit's own falsifier**: `--block=uf_panes_1` reads PASS alone and `NOT-DRIVEN` in the full battery ⇒ *the two readings DISAGREE, so the clause is not met*), `§13.5` item 4 (`OPEN`), `§13.7` item 2 (the persisted-class restore is owed) |
| **Invocation** | `⟨LIVE⟩ --block=uf_panes_1` **and** the same row's line inside `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | The two readings **agree** (both PASS, or both the same non-PASS verdict with the same cause). **Falsifier — the contract's own:** the isolated run PASSes while the full battery reads a different verdict (`NOT-DRIVEN`/FAIL) for the same row, i.e. the verdict depends on the row's position in the battery. **Note, recorded before the run, from the contract itself:** `§13.5` item 4 records this falsifier as **CONFIRMED BY A RUN** at the landing head and `§13.7` item 2 carries the restore as an **owed** item, so a FAIL here is a *contract clause unmet and already named as owed*, not a surprise. |
| **Layer** | HARNESS `[D]` / live process — *the app is not credited with anything here; the disagreement is the driver's own state artifact* |

### G-18 — the refusal branch's exit is isolated (zero-FAIL scoped run) — the reading `§13.7` item 4 names as owed

| Field | Content |
| --- | --- |
| **Derives from** | `§2.1 E-3` clause 2 + `§2.2 E-12` item 2 (non-zero exit on a refusal), `§13.1`'s `NOT RECORDED` note (the `fail > 0` branch masks the refusal branch), `§13.7` item 4, `§13.7` item 3 (the two-block isolation is owed), `§2.2 E-12` item 2 (*a declared row is in scope iff at least one of its declared blocks was requested*) |
| **Invocation** | `⟨LIVE⟩ --block=uf_settings_7` (the `UF-SETTINGS-7` flip/frame half alone) |
| **Expected reading (falsifiable)** | The run refuses the **declared extended** row whose other half (`vis_persist`) was not requested — `REFUSED` naming `UF-SETTINGS-7` (its `vis_persist` contributor produced nothing in scope) — and the **exit code is non-zero**. If the run prints **zero `FAIL` blocks**, this reading additionally isolates the refusal branch from the `fail > 0` branch. **Falsifier:** `OK`/exit `0` on this scope; a refusal that does not name the row. |
| **Layer** | HARNESS `[D]` / live process |

**⟨ANNOTATED `2026-09-29` BY THE GATE-7 PROOFREADER (`RCA-8(c)`: the `G-18` expectation and its `§4.2` `FAIL`
reading are KEPT as this run's own record) — `G-18` IS AN UNREACHABLE-LIMB READING, NOT A FAILURE.** **This run's own
reading shows WHY: the in-scope declared row DID carry a verdict through its `uf_settings_7` half, so under the
contract's `E-12` item 2 scope rule the `OK`/exit-`0` outcome it measured is clause-consistent; the `REFUSED`
expectation was derived from `§13.7` item 3, which `§15.3.2` records as UNANSWERABLE from the `--block=` space.** **The
refusal-branch exit isolation this scenario was written to supply is therefore owed from a FULL-battery head (zero FAIL
blocks + a non-empty missing set), not from this scope; `§13.7` item 4 stays OWED with that reason.**⟩**

### G-19 — no verdict is promoted, and the summary line says so in its own words

| Field | Content |
| --- | --- |
| **Derives from** | `§2.3 H-5` (*`summary.pass`/`summary.fail` may never be cited as app health — the printed line says so in its own words*), `§2.1 E-3`'s summary row, `§12.3` item 5, `§3.2 F-9`, `§2.2 E-9` (*a `native-fallback` path forces `pass:false`*), `DECIDED: D-GP-UFA-2` (no proxy PASS) |
| **Invocation** | `⟨LIVE⟩` (full battery) |
| **Expected reading (falsifiable)** | The printed summary/coverage output states, **in its own words**, that `pass`/`fail`/`parked` partition **only the executed `§5.U` rows** and **must not be read as app health**. No diagnostic/hygiene block appears as a row verdict; no `proxyPASS:true` result reads `PASS`; no `native-fallback` path reads `PASS`. **Falsifier:** a summary line carrying no such statement; a `[DIAG]` block counted as a row verdict; a proxy oracle or fallback path reading PASS. |
| **Layer** | HARNESS `[D]` / live process |

### G-20 — the fixture/precondition class is reported by name, never as a silent park and never as an app FAIL

| Field | Content |
| --- | --- |
| **Derives from** | `§3.2 F-6` (*the run REFUSES or PARKS BY NAME: `PRECONDITION-FAILED` with the missing fixture named — never a silent park, never a row FAIL against an absent surface*), `§3.2 F-7` (an `isError` reply → `NOT-DRIVEN` with the verbatim text), `§2.3 H-4`'s `PARKED` row (`parkReason` naming the missing precondition; `RCA-11` clause (b)), `§9 T-3` (the fixture route is `GAP-8`'s — this unit only contracts **how** a missing fixture is reported) |
| **Invocation** | `⟨LIVE⟩` (full battery; the `gnosis_*`/`o0_*`/seed-dependent rows are the observed class) |
| **Expected reading (falsifiable)** | Every structurally unmet precondition appears as a **`PARKED`** verdict carrying a `parkReason` that names the missing precondition, or as a refusal naming the fixture (`PRECONDITION-FAILED`); an MCP `isError` reply appears as `NOT-DRIVEN` with the reply text quoted. **Falsifier:** a park with no reason; a fixture-absent surface reported as an app `FAIL`; an `isError` reply counted as a PASS. *(This unit does not fix the fixture route: `§9 T-3` keeps it with `GAP-8`.)* |
| **Layer** | HARNESS `[D]` / live process — the classifications are the driver's; the underlying app-layer rows keep their own owners |

### Scenarios the contract names that this gate CANNOT exercise (recorded, never silently parked)

| id | The contract clause | Why it cannot be exercised from the operator's invocation space | Layer of the limitation |
| --- | --- | --- | --- |
| **N-1** | `§2.2 E-11` item 3 / `§3.2 F-14` — **a disagreeing pair** of contributors to one row id | A disagreement is a **state of the app plus a specific pair of verdicts**; no `--block=` scope makes `vis_persist` and `uf_settings_7` disagree. `§13.5` item 2 records it as *not exercised by this run* by the same reasoning. G-13 verifies the aggregation **contract's shape and its AND semantics from whatever the run actually printed**; the disagreeing case itself is **NOT-RUN, structurally** — no operator flag produces it. | HARNESS `[D]` / live process |
| **N-2** | `§2.1 E-4`/`§12.1` — the `UF-STAGE-1` **re-derive limb** | Recorded `UNTAKEN` by the contract itself *because driving it would be a first measurement of an app behaviour*, which `§1.3`/`§1.4` keep out of this unit. G-11 verifies the **absence of the claim**; the limb itself is **NOT-RUN by contract**. | out of this unit's scope by ruling |
| **N-3** | `§3.2 F-8` / `§3.4` — a duplicated `MATRIX_ROWS` id or a duplicated `BLOCKS` key | These are **source-level negatives**: they are exercised only by editing the driver, which this unit's `§1.3`/`§3.4` deny, and the pin asserts their absence as a positive. G-3 reads the pin's green; the negative construction is **NOT-RUN — it would require editing the driver**, which this gate may not do. | HARNESS `[D]` / node-static |
| **N-4** | `§2.1 E-3`'s `8 of 8` limb as an **achieved** reading | It is a property of the **block-to-row emission mapping**, which the contract records as **OPEN and owed** (`§13.5` item 1, `§13.7` item 1: *the mapping-to-block emission is what is owed here*). G-6 accepts either permitted reading, so this is not a separate scenario — recorded here so the `2 of 8` reading is never mistaken for a gate-5 omission. | HARNESS `[D]` / live process |

---

## 4. RUN READINGS

*(Appended after the scenario set was frozen. Nothing in `§3` was edited to produce these readings.
Every reading below is this gate's own measurement on this host, unless a line is explicitly marked
as quoted from another pass.)*

### 4.0 Invocation probe and run hygiene

- **Probe:** `node scripts/live-drive.mjs --help` is **not** a recognised option — the driver booted
  its default launch instead (`[live-drive] launching app --mode=lexical --port=3787 --cdp-port=9222
  --no-gpu HOME=/tmp/astrolive-EkZAdh`). It was bounded by `timeout 20`, its Electron tree
  (PIDs `460942`/`461135`/`461136`/`461143`/`461145`/`461146`/`461174`/`461178`/`461188`) was reaped,
  and `ps` confirms no `astrolive-EkZAdh` process remains. **No expectation in `§3` was changed by
  this probe.**
- **The launch route's own flags, observed verbatim** (they satisfy this host's recorded
  requirements: the `/dev/shm` bypass and a disposable-scratch Chromium profile):
  - `[start-app] launching electron (mode=lexical, transport=http, sandbox=no-sandbox, shm=disable-dev-shm-usage, gnosis=0)`
  - `electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http --mcp-port=3787 --retrieval-embedder=lexical --remote-debugging-port=9222 --disable-gpu`
  - the renderer's own `--user-data-dir=/tmp/astrolive-EkZAdh/.config/provident-electron`
- **Side effect of the driver's own launch route, recorded:** it runs `npm run build` (its
  `start-app.sh` route) before booting, i.e. `dist/` is rebuilt by the instrument itself on every
  live launch. `dist/` is build output, not source; no test, spec, tracker or driver byte was edited
  by this gate (`§0` of the delivery report).

### 4.1 Run inventory (this gate's own runs, on this host)

| Scenario | Exact invocation (all with `DISPLAY=:0`, `timeout`, isolated ports `3917`/`9357`) | Exit | Log |
| --- | --- | --- | --- |
| G-1/G-2/G-3 | `npx vitest run tests/live-drive-contract.test.ts --reporter=verbose` | **0** | `/tmp/astro-blinds/G-01-pin.log` |
| G-4 | `npm test` | **1** | `/tmp/astro-blinds/G-04-npm-test.log` |
| G-4 | `npm run typecheck` / `npm run build` | **0** / **0** | `G-04-typecheck.log` / `G-04-build.log` |
| G-6/G-7/G-9/G-10/G-11/G-12/G-13/G-15/G-16/G-17/G-19/G-20 | `node scripts/live-drive.mjs --port=3917 --cdp-port=9357 --display=:0` (full battery, `--block` unset = `all`) | **1** | `/tmp/astro-blinds/G-06-full.log` (8379 lines) |
| G-7/G-8/G-11 | `… --block=boot_landing` | **1** | `G-08-boot_landing.log` |
| G-12/G-14 | `… --block=boot_landing,vis_persist` | **1** | `G-14-boot_landing-vis_persist.log` |
| G-18 | `… --block=uf_settings_7` | **0** | `G-18-uf_settings_7.log` |
| G-17 | `… --block=uf_panes_1` | **0** | `G-17-uf_panes_1.log` |
| G-5 | `… --block=uf_settings_5` | **0** | `G-05-uf_settings_5.log` |

**Hygiene, verified after the runs:** `ps` shows **no** Electron process left; `ss`/`netstat` show **nothing** listening on `3917`/`9357`; `:9222` was touched only by the pre-run `--help` probe, whose tree was reaped (§4.0); no `.live-corpus/` file was left in the repo; the seven scratch profiles this gate created (`/tmp/astrolive-*`) were removed.

### 4.2 Scenario verdicts (this gate's readings)

| id | Result | The reading, in one line |
| --- | --- | --- |
| G-1 | **PASS** | `Test Files 1 passed (1)` / `Tests 69 passed (69)`, exit 0 |
| G-2 | **PASS** | the register prints **7 rows**, `6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`, `broken rows (none)`, no `F-` row — **with one stale class-(b) term still printed** (`54 → 56`; see §4.5 D-6) |
| G-3 | **PASS** | `R5.b`/`R5.c`/`R5.d`/`R6.a`/`R6.b`/`R4.0` and `R-8.i`/`R-8.ii` green; 8 ids, no slot added, census floors met |
| G-4 | **PASS** | `Test Files 3 failed \| 209 passed (212)`; the three failures are **exactly** the three named pre-existing reds |
| G-5 | **PASS** | `uf_settings_5` PASSes with `#operator-editing-mode="representationMode: markdown" … matches /representationMode:(html\|markdown)/=true`; **`editingMode` appears 0 times in every live log** |
| G-6 | **PASS** | `matrixRowsExecuted: 8`, `coverage={"matrixTotal":8,"verdicts":8,"missingRows":[],"fullBattery":true}`, `MATRIX rows (8 of 8 = summary.total)`, reconciliation **`OK`** — branch (a); the core falsifier (`OK` with a shortfall) did **not** occur |
| G-7 | **NOT-RUN** | **no `REFUSED` line exists at this head in any of the six runs** (the string `REFUSED` occurs only inside `ECONNREFUSED` and the DRIVE-CLASSIFICATION legend), so the `REFUSED ⇒ non-zero` antecedent never held: the refusal-exit limb is unexercisable here (§4.6 N-5) |
| G-8 | **FAIL** | `--block=boot_landing` prints `matrix rows executed=0` with `missingRows` = all 8 and still prints **`OK`** — expected absence of `OK` falsified (the exit is non-zero, via the FAIL branch); see §4.4 D-A: an **unmet `C-2` item 3 limb** on top of a contract contradiction |
| G-9 | **PASS** | 63/63 printed `ROW` lines carry `row`/`block`/`verdict`/`dclass`/`realInput`/`surface`(`target=`+`liveSurfacePresent=`)/`evidence`/`proxyPASS`/`gesturePath`; 0 lines with empty `evidence` |
| G-10 | **FAIL** | **one FAIL prints `failingClause=null` and no `observed`/`required`**: `toolbar_undo` (`row=UF-HIST-2`, `verdict=FAIL`, `gesturePath=cdp`) |
| G-11 | **PASS** | `ROW boot_landing row=UF-STAGE-1 block=boot_landing verdict=FAIL …`, clause prints `required landingAfter=false` with `observed … landingAfter=true`; evidence carries `[UNTAKEN] … NOT measured by this unit (§12.1) and is counted nowhere`; no minted-id form anywhere |
| G-12 | **PASS** | `ROW vis_persist row=UF-SETTINGS-7 … verdict=PASS realInput=true … gesturePath=cdp`, evidence names the persistence half: `opener=cdp reopen(re-derive)=cdp; second read after the re-derive=false (required "false", persisted=true); click path=cdp inVp=true coordinate=(127,360) viewport=[980,720] onTarget=true` |
| G-13 | **PASS** | `SHARED rows …: UF-SETTINGS-7 aggregate(row verdict)=PASS contributors=[UF-SETTINGS-7:vis_persist=PASS UF-SETTINGS-7:uf_settings_7=PASS]` (a second pair, `UF-DEFECT-7`, behaves identically) |
| G-14 | **FAIL** | `--block=boot_landing,vis_persist` prints **`OK`** with `declared-with-no-verdict(unit-declared, refusing)=[]` and `inconclusive=[]` — **no `REFUSED`**, contradicting `§13.1 L-4` / `§13.5` item 3 for this exact command |
| G-15 | **PASS** | `EXTENDED rows (55 of 32 defined; 3 declared row(s) produced NO verdict and are inconclusive …; 24 emitted id(s) are UNDECLARED)` + 24 `EXTENDED-UNDECLARED: …` lines + 3 `EXTENDED-DECLARED-NO-VERDICT` lines, and the extended reconciliation reads `OK` — undeclared emission reports and does **not** refuse |
| G-16 | **FAIL** | of the **43** `gesturePath=cdp` verdict-carrying clicks only **3** print `onTarget=`, **1** prints `coordinate=`/`viewport=`/`inVp=`; the single off-target case prints coordinate + element + `onTarget=false` but **no viewport** |
| G-17 | **PASS** | isolated `--block=uf_panes_1` **PASS** and the same row in the full battery **PASS**, with the same evidence (`zone expand path=already-expanded; … reExpanded=true; samePaneRoot …`) — the readings **agree** |
| G-18 | **FAIL** | `--block=uf_settings_7` prints `EXTENDED rows (1 of 32 defined): UF-SETTINGS-7:uf_settings_7=PASS=PASS`, reconciliation `OK`, **exit 0** — expected `REFUSED` + non-zero falsified |
| G-19 | **PASS** | the summary is followed by `NOTE: summary.pass/fail/parked partition ONLY the executed §5.U rows and must NEVER be read as app health …`; all 4 `proxyPASS=true` rows read `NOT-DRIVEN`; the DISPOSITION line names the 4 diagnostic blocks as EXCLUDED |
| G-20 | **PARTIAL → FAIL on its own predicate** | named reasons hold (engine-absent rows read `NOT-DRIVEN` with the `ECONNREFUSED` text verbatim; the zero-box row reads `NOT-DRIVEN` with `no hit-testable doc-nav row (rows=6)`), **but the run prints 0 `PARKED` rows and 0 `parkReason=`**, while it also prints an unconditional `PRECONDITION-FAILED: fixture-missing — the seed corpus produced no documents` **although the corpus was seeded in the same run** (§4.5 D-3) |
| N-1 | NOT-RUN | structurally: no `--block=` scope makes two contributors to one row id disagree |
| N-2 | NOT-RUN | by contract: the `UF-STAGE-1` re-derive limb is `UNTAKEN` (`§12.1`) |
| N-3 | NOT-RUN | structurally: constructing a duplicate id/key needs a driver edit, denied by `§1.3`/`§3.4` |

**Tally over the 20 numbered scenarios (`G-1`…`G-20`): 13 PASS · 6 FAIL · 1 NOT-RUN.** The 6 FAILs are `G-8`, `G-10`, `G-14`, `G-16`, `G-18`, `G-20` (G-20's named-reason limbs hold but its `PARKED`/`parkReason` limb does not, so the scenario reads FAIL on its own predicate). The 1 NOT-RUN is `G-7` (no `REFUSED` occurred anywhere). The four further ids `N-1`…`N-4` are the contract-named cases this gate records as structurally non-exercisable rather than parking silently.

### 4.3 The verbatim readings behind the PASSes (the lines relied on)

**G-1/G-2/G-3 (`G-01-pin.log`)** — tail, verbatim:

```
 Test Files  1 passed (1)
      Tests  69 passed (69)
```

```
[register] TALLY declared 6 + 14 + 16 + 17 + 16 + 14 + 14 = 97 attempt(s); executed node-side 81; class-(b) arms NOT-RUN 16; broken rows (none)
[register] arms — P-IM-1: node-side 6, class-(b) NOT-RUN 0, held=true · P-IM-2: node-side 13, class-(b) NOT-RUN 1, held=true · P-SM-1: node-side 12, class-(b) NOT-RUN 4, held=true · P-SM-2: node-side 14, class-(b) NOT-RUN 3, held=true · P-TP-1: node-side 13, class-(b) NOT-RUN 3, held=true · P-TP-2: node-side 12, class-(b) NOT-RUN 2, held=true · P-SM-3: node-side 11, class-(b) NOT-RUN 3, held=true
```

and the seven per-row register lines each ending `… HELD` (e.g.
`[register] P-IM-1 strat:live-driver-matrix-unmoved: declared 1 + 1 + 1 + 1 + 1 + 1 = 6 attempt(s); executed 6 node-side arm(s); named NOT-RUN class-(b) 0; … HELD`).
The `7`-row shape, the `97`, the seed, the stop-after-5, the typing-only-`P-IM-*`/`P-SM-*`/`P-TP-*` and the no-`F-`-row rules are all printed as their own green rows (`§4.2/§12.5 the register carries SEVEN rows…`,
`§12.5 the arithmetic prints with its terms: 6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`,
`§4.1 the pinned seed is 0x20260929 and the stop-after-5 budget is the register's`,
`§4.2 the typing is only P-IM-*/P-SM-*/P-TP-* — no F- row…`).

**G-4 (`G-04-npm-test.log`)** — verbatim:

```
 Test Files  3 failed | 209 passed (212)
      Tests  3 failed | 4557 passed | 57 skipped (4617)
```

with exactly these three `FAIL` lines: `PD-VENDOR-PIN-REFRESH §4 P-IM-pd-pin-1 …` ·
`PD-VENDOR §3.5 … §3.3 item 2 — the foundation tree is at the pinned commit when present …` ·
`§6 P-SM-1 … P-SM-1 [strat:stage-seam-schedule-single-active] …`.
**No failure in `tests/live-drive-contract.test.ts`, and no fourth failure.** (The `✗ electron leg produced a result (electron failed to bootstrap)` line in the log is *stderr from a passing negative arm* of `tests/unit-divergence-spawn-contract.test.ts` R-12, not a failing test — recorded so it is not miscounted.)

**G-6/G-9/G-19 (`G-06-full.log`), verbatim:**

```
[live-drive] §6.1 summary: {"unit":"user-flow-audit","layer":"assembled-renderer (RCA-12)","total":8,"pass":6,"fail":2,"parked":0,"matrixRowsExecuted":8,"blocksRun":100,"extendedRowsRun":55,"diagnostics":27,"coverage":{"matrixTotal":8,"verdicts":8,"missingRows":[],"fullBattery":true}}
[live-drive] NOTE: summary.pass/fail/parked partition ONLY the executed §5.U rows and must NEVER be read as app health; coverage.missingRows=[] is the declared-minus-verdicted set in a FULL-BATTERY run
[live-drive] MATRIX rows (8 of 8 = summary.total): U-8:uf_tabs_3=PASS U-2:uf_tabs_7=NOT-DRIVEN(realInput:false) U-6:uf_panes_8=PASS U-1:uf_panes_12=PASS U-3:uf_panes_12=PASS U-7:uf_hist_6=PASS U-5:uf_layout_10=PASS U-4:uf_layout_10=FAIL
[live-drive] row-set reconciliation: matrix=8 rows claimed by 8 mapping(s); blocks run=100 (informational); matrix rows executed=8; coverage={"matrixTotal":8,"verdicts":8,"missingRows":[],"fullBattery":true}; §5.U row total (summary.total)=8; OK
```

Counted over all 63 printed `ROW` lines: `verdict=PASS` **35**, `FAIL` **13**, `NOT-DRIVEN` **15**, `PARKED` **0**; `surface=target=assembled-renderer` **63/63**; `liveSurfacePresent=` **63/63**; `failingClause=` **63/63**; empty `evidence=""` **0**; verdict strings outside the four-member set **0**; `proxyPASS=true` **4**, all four reading `NOT-DRIVEN`.

**G-11/G-12/G-13, verbatim:**

```
ROW   boot_landing           row=UF-STAGE-1 block=boot_landing verdict=FAIL dclass=D-state realInput=false surface=target=assembled-renderer liveSurfacePresent=true proxyPASS=false proxy=null gesturePath=mcp-import failingClause={"predicate":"the empty-store landing coexists with the toolbar and >=1 pane frame, and the first import removes it","required":"landingAfter=false (the landing is REMOVED on the empty-boot → first-import path, …) AND coexistence=true (…)","observed":"coexist=true (landing=true data-stage=landing toolbar=true panes=2); import->landingAfter=true (required false); required coexistence=true; import={…}"} … evidence="… ; zoneState=expanded; [UNTAKEN] the enumerated row's third limb (\"a still-empty content re-derive keeps it\") is NOT measured by this unit (§12.1) and is counted nowhere"
ROW   vis_persist            row=UF-SETTINGS-7 block=vis_persist verdict=PASS dclass=D-interaction realInput=true surface=target=assembled-renderer liveSurfacePresent=true proxyPASS=false proxy=null gesturePath=cdp … evidence="toggle=[data-pane][data-enabled] pane=gnosis-status data-enabled before=true after=false (flipped=true); opener=cdp reopen(re-derive)=cdp; second read after the re-derive=false (required \"false\", persisted=true); click path=cdp inVp=true coordinate=(127,360) viewport=[980,720] onTarget=true"
[live-drive] SHARED rows (one row id, several contributing blocks — the row's aggregated verdict is the AND of the halves, §2.2 E-11): UF-SETTINGS-7 aggregate(row verdict)=PASS contributors=[UF-SETTINGS-7:vis_persist=PASS UF-SETTINGS-7:uf_settings_7=PASS] | UF-DEFECT-7 aggregate(row verdict)=PASS contributors=[UF-DEFECT-7:user9_search_open_in_tab=PASS UF-DEFECT-7:stage_search_open_in_tab=PASS]
[live-drive] DISPOSITION (§2.1 E-4: CONVERTED vs EXCLUDED, no silent middle state — F-11): boot_landing -> UF-STAGE-1 (CONVERTED); vis_persist -> UF-SETTINGS-7 (CONVERTED); uf_restore_layout (EXCLUDED: hygiene); uf_scroll_reset (EXCLUDED: hygiene); uf_mount_diag (EXCLUDED: diagnostic); uf_mount_leak_diag (EXCLUDED: diagnostic); uf_tabs_7_diag (EXCLUDED: diagnostic); uf_panes_12_diag (EXCLUDED: diagnostic)
```

**G-15, verbatim:**

```
[live-drive] EXTENDED rows (55 of 32 defined; 3 declared row(s) produced NO verdict and are inconclusive (EXTENDED-DECLARED-NO-VERDICT); 24 emitted id(s) are UNDECLARED): UF-STAGE-1:boot_landing=FAIL=FAIL UF-SETTINGS-7:vis_persist=PASS+uf_settings_7=PASS=PASS(aggregate of 2 halves) … 
[live-drive] EXTENDED-DECLARED-NO-VERDICT: extended row UF-STAGE-4 -> block(s) repro_nbsp produced no verdict in this run (inconclusive — NOT a refusal: declaring these authoritative is a later unit's act, §2.2 E-12 item 5)
[live-drive] EXTENDED-UNDECLARED: UF-TABS-1(uf_tabs_1) — an emitted row id no declared extended structure carries (REPORTED, never a refusal; §2.2 E-12 item 5, F-15)
[live-drive] extended row-set reconciliation (§2.2 E-12): declared=32; emitted=55; declared-with-no-verdict(unit-declared, refusing)=[]; inconclusive=[UF-STAGE-4, U-EDIT-1-LIVE-6, UF-STAGE-AT-7]; OK — every requested declared extended row carried a verdict
```

**G-17, verbatim (both readings):**

```
G-17 (isolated)  ROW   uf_panes_1             row=UF-PANES-1 block=uf_panes_1 verdict=PASS dclass=D-interaction realInput=true … gesturePath=cdp
                 evidence="zone expand path=already-expanded; doc-nav before: bodyNodes(li)=1 ul=true h=100px; REAL click #pane-collapse-doc-nav (path=cdp) → is-collapsed=true bodyNodes(li)=0 ul=false h=38px → headerOnly=true; REAL click again (path=cdp) → is-collapsed=false bodyNodes(li)=1 ul=true h=100px → reExpanded=true; samePaneRoot(…)=true (data-node-id node-654→node-860)"
G-17 (full)      ROW   uf_panes_1             row=UF-PANES-1 block=uf_panes_1 verdict=PASS dclass=D-interaction realInput=true … gesturePath=cdp
                 evidence="zone expand path=already-expanded; … reExpanded=true; samePaneRoot(…)=true (data-node-id node-10233→node-10633)"
```

**G-20's satisfied limbs, verbatim** (the named-reason discipline):

```
ROW   gnosis_wikis           row=UF-GNOSIS-1 … verdict=NOT-DRIVEN … gesturePath=missing DRIVER-FAILURE(not-driven: the gesture could not be driven honestly — never an app FAIL) failingClause={… "observed":"… engine gnosis.wiki.list=\"connect ECONNREFUSED 127.0.0.1:8080\" …"}
ROW   stage_docnav_switch_inside_async row=UF-STAGE-AT-8 … verdict=NOT-DRIVEN … failingClause={"predicate":"…","required":"a PROVEN hit-tested gesture path (gesturePath='cdp'); observed gesturePath=\"zero-box\"","observed":"no hit-testable doc-nav row (rows=6)"}
```

### 4.4 THE FAILs — verbatim readings, and which of the two each looks like

**D-A · G-8 — a scoped run that drives no declared row prints `OK`.** Verbatim (`G-08-boot_landing.log`):

```
[live-drive] §6.1 summary: {… "total":8,"pass":0,"fail":0,"parked":0,"matrixRowsExecuted":0,"blocksRun":1,"extendedRowsRun":1,"diagnostics":0,"coverage":{"matrixTotal":8,"verdicts":0,"missingRows":["U-1","U-2","U-3","U-4","U-5","U-6","U-7","U-8"],"fullBattery":false}}
[live-drive] MATRIX rows (0 of 8 = summary.total): (none executed)
[live-drive] row-set reconciliation: matrix=8 rows claimed by 8 mapping(s); blocks run=1 (informational); matrix rows executed=0; coverage={"matrixTotal":8,"verdicts":0,"missingRows":["U-1","U-2","U-3","U-4","U-5","U-6","U-7","U-8"],"fullBattery":false}; §5.U row total (summary.total)=8; OK
```

**What the docs led me to expect:** `§6.3 C-2` item 3 — *"A scoped run (`--block=<a small set>`) prints `REFUSED` naming the missing rows and exits non-zero, and the `--block=boot_landing,import`-class configuration (`M-1`'s second measured case) no longer reads `OK`"* — and the task framing *"a scoped run that drives no row must print the missing rows and a non-zero exit"*.
**What the live run shows:** the missing rows **are** named (in `coverage.missingRows`, in `MATRIX rows (0 of 8)`, and as `(none executed)`), and the exit **is** non-zero (**1**) — but the reconciliation line prints **`OK`**.
**Which of the two it looks like — an UNMET CONTRACT LIMB, with a doc/spec contradiction underneath; NOT a pass, and the gate declines to smooth it either way.** Two clauses of the contract cannot both hold, and the driver implements the first:

- `§2.1 E-3`'s own reconciliation-row contract (*"prints `OK` only when `ok`"*, `ok === (errors.length === 0)`, a non-empty `missingRows` an error **only in a full-battery run**), plus `P-SM-1` (iii) (*"`n < 8` in a **scoped** run ⇒ **not a refusal** … but never a claim of coverage"*), plus the coverage-field contract (`fullBattery` decided by every `BLOCKS` key having been requested). At this head `fullBattery:false` and `missingRows` lists all eight unexecuted rows, i.e. the run does not claim coverage — `OK` is the clause-consistent reading.
- `§6.3 C-2` item 3 — a **class-(b) acceptance reading**, not an aside: *"A scoped run (`--block=<a small set>`) prints `REFUSED` naming the missing rows and exits non-zero, and the `--block=boot_landing,import`-class configuration (`M-1`'s second measured case) **no longer reads `OK`**"* — and `§0.1 M-1`/`§8 D-1` treat exactly this shape (`matrix rows executed=0 … OK`) as **the defect this unit exists to close** (*"an INVALID report is worse than a missing one: it reads as a pass"*; the refused alternative *"a warning without a refusal — the `OK` line is the artifact a reader trusts"*).

**Against `C-2` item 3 and `M-1`'s own framing, the live reading is a FAIL of the instrument: the `OK` token is still printed for `matrixRowsExecuted=0`.** Reconciling the two clauses is a spec-owning act (withdraw `C-2` item 3 or scope `OK` to full-battery runs explicitly); this gate records the falsification, names the contradiction, and does **not** count the reading as a pass. **Not an app matter at any point.**

**D-B · G-10 — a FAIL prints no failing clause.** Verbatim (`G-06-full.log`), one line, truncated at its end:

```
ROW   toolbar_undo           row=UF-HIST-2 block=toolbar_undo verdict=FAIL dclass=D-state realInput=true surface=target=assembled-renderer liveSurfacePresent=true proxyPASS=false proxy=null gesturePath=cdp failingClause=null evidence="undo disabled before=false afterEdit=false (enabled=true); REAL click '#editor-toolbar-undo' path=cdp → afterClick disabled=false; revert observed (edited content gone from the store read-back)=true; edit.set_content result={…} (setup only, NOT the verdict)"
```

**What the docs led me to expect:** `§2.2 E-7`'s `failingClause` row — *"on a non-PASS: the predicate that failed, with `observed` and `required` values named"*; `§2.2 E-8` (the acceptance set); `§3.2 F-10` — *"a FAIL with no `failingClause` is **not a reportable verdict**"*.
**What the live run shows:** `failingClause=null`, and the line carries **no `observed=` and no `required=`** field either (it is the only one of the 63 `ROW` lines in that state; the other 27 non-PASS lines all carry both fields).
**Which of the two it looks like — an UN-HARDENED REGRESSION (a path the hardening did not reach), not a doc drift.** The contract's clause is unambiguous and the driver implements it everywhere else, including for `repro_dup_para` whose empty-evidence defect `M-3` was the motivating case and which now prints a full clause. `toolbar_undo` is a `verdict=FAIL` produced on a proven `cdp` path, so the non-PASS branch was taken, yet the clause is `null` — i.e. this block's `rowResult` call site was not given a clause, so `E-7`/`F-10` remain unmet on that one row while the pin (`R-3.*`, source-static) is green. **This is the class of defect the `§6.1` class-(a)/class-(b) split names: a node-static pin cannot see a missing clause on a live FAIL.**

**D-C · G-14 — the extended refusal does not fire for the pair.** Verbatim (`G-14-boot_landing-vis_persist.log`):

```
[live-drive] EXTENDED rows (2 of 32 defined): UF-STAGE-1:boot_landing=FAIL=FAIL UF-SETTINGS-7:vis_persist=PASS=PASS
[live-drive] row-set reconciliation: … matrix rows executed=0; coverage={"matrixTotal":8,"verdicts":0,"missingRows":["U-1",…,"U-8"],"fullBattery":false}; §5.U row total (summary.total)=8; OK
[live-drive] extended row-set reconciliation (§2.2 E-12): declared=32; emitted=2; declared-with-no-verdict(unit-declared, refusing)=[]; inconclusive=[]; OK — every requested declared extended row carried a verdict
```

**What the docs led me to expect:** `§13.1 L-4` — *"`--block=boot_landing,vis_persist` **exits `1`** and prints `REFUSED — missing declared extended row(s): UF-SETTINGS-7`"* — and `§13.5` item 3, which marks that reading **SATISFIED** (*"the FIRST real exercise of the extended refusal"*), on top of `§2.2 E-12` item 2 / `§12.4 F-13`.
**What the live run shows:** the same command prints `OK`, `declared-with-no-verdict(unit-declared, refusing)=[]`, `inconclusive=[]`, and `UF-SETTINGS-7:vis_persist=PASS=PASS` — i.e. the declared row **carried a verdict** through its `vis_persist` half, so nothing was missing. (The exit **1** here comes from the `boot_landing` FAIL, not from a refusal: the same shape with zero FAILs — G-18 — exits **0**.)
**Which of the two it looks like — most plausibly a DOC/SPEC DRIFT of the recorded-reading class, with a structural gap underneath.** Under `§2.2 E-12` item 2's own scope rule (*"a declared row is in scope iff at least one of its declared blocks was requested"*) the row *was* in scope and *did* produce a verdict, so `OK` is the clause-consistent reading; the contract's recorded `L-4` reading is therefore **not reproducible at this head**. The structural consequence, which is the part that will not go away by editing prose: **the `REFUSED` limb is unreachable from the operator's `--block=` space** — for each of the two unit-declared rows, every request that puts the row in scope also runs a block that emits its id, so "in scope and produced no verdict" cannot be constructed. (Post-write diagnosis, recorded as such: a narrow grep of `scripts/live-drive.mjs` confirms the declaration carries the pair — `{ row: 'UF-SETTINGS-7', block: 'vis_persist', blocks: ['vis_persist', 'uf_settings_7'] }` — and that `extendedDeclaredMissing` marks a row missing only when it is in scope **and no emitted verdict carries its id**; the refusal then depends on a state no `--block=` value can produce.) **The pin cannot see this:** `R-11.ii` is green (source-static) and `P-SM-3`'s class-(b) term still prints *"the real EXTENDED line reading REFUSED for a scoped `--block=` run"* — a class-(b) arm with **no live reading at this head**. So the honest label is **doc/spec drift with an unreachable acceptance limb**, and the tracker should treat `§13.5` item 3's SATISFIED as **no longer standing**.

**D-D · G-16 — the click record is printed for 3 of 43 verdict-carrying clicks.** Verbatim (full battery):

```
ROW lines with gesturePath=cdp: 43 ; of those printing onTarget=: 3 ; printing coordinate=: 1 ; printing viewport: 1 ; printing inVp=: 1
ROW   vis_persist  … click path=cdp inVp=true coordinate=(127,360) viewport=[980,720] onTarget=true
ROW   user2_pane_drag … observed="doc-nav … .pane-collapse-toggle (header=true) from (143,100) hit=pane-collapse-doc-nav onTarget=true"
ROW   user4_main_editable … observed="body-text click hit=rag-.live-corpus/alpha:section:1 onTarget=true"
ROW   user7_zone_resize  row=UF-DEFECT-5 … verdict=NOT-DRIVEN … gesturePath=native-fallback DRIVER-FAILURE(not-driven: the gesture could not be driven honestly — never an app FAIL) … observed="left-zone width before=220px; REAL user boundary-drag (CDP coord @edge=253, hit=preempt-node-node-4453, onTarget=false) after=220px (Δ=0 changed>10px=false); [DIAG] synthetic pointer on hidden .gutter element …"
```

**What the docs led me to expect:** `§2.3 H-3` clause 1 — *"every click records its coordinate, the viewport it was dispatched against, the element under that point, and `onTarget`"* — plus `§3.2 F-4`'s printed requirement (*"with the coordinate, the viewport and `onTarget` printed"*).
**What the live run shows:** the **off-target** case is classified exactly as `H-3` clause 2 / `F-4` require (`NOT-DRIVEN`, `realInput:false`, the DRIVER-FAILURE marker, coordinate `@edge=253`, the element under the point `preempt-node-node-4453`, `onTarget=false`, **never an app FAIL**, and the `[DIAG]` synthetic path kept as verdict-free attribution evidence) — but **no viewport is printed on it**, and for the generality of verdict-carrying clicks the (coordinate, viewport, element, `onTarget`) record is not printed at all.
**Which of the two it looks like — partly a DERIVATION OVER-READ on this gate's side, partly a real print gap.** `H-3` clause 1 says every click **`records`** those four; only `F-4` and `H-4`'s `NOT-DRIVEN` row require the **printing**, and on that reading the run satisfies `F-4` except for the **missing viewport** — which is a small, concrete un-hardened gap (the acceptance row `M-7`'s `inVp:false` case is what `F-4` was written for, and this run has **no** `inVp:false` instance at all: `inVp=false` occurs 0 times). The residual doc-drift half is real: as written, `H-3` clause 1's four-part record is **not observable** from the artifact for 40 of 43 clicks, so the contract's own claim cannot be falsified from the report it contracts.

**D-E · G-18 — `--block=uf_settings_7` neither refuses nor exits non-zero.** Verbatim:

```
[live-drive] EXTENDED rows (1 of 32 defined): UF-SETTINGS-7:uf_settings_7=PASS=PASS
[live-drive] extended row-set reconciliation (§2.2 E-12): declared=32; emitted=1; declared-with-no-verdict(unit-declared, refusing)=[]; inconclusive=[]; OK — every requested declared extended row carried a verdict
```

**What the docs led me to expect:** `§13.7` item 3 (the owed two-block isolation, *"so `F-13`'s exact sentence has a reading that isolates one declaring block"*) read together with `§2.1 E-4`/`§13.7` item 4 (a run with zero FAIL blocks and a refused reconciliation).
**What the live run shows:** exit **0**, `OK`, nothing refused — because the row **did** carry a verdict (through its `uf_settings_7` half) and, under `E-12` item 2, its scope question is decided by *any* declared block having been requested and having produced a verdict.
**Which of the two it looks like — a DOC/SPEC DRIFT: `E-12` item 2 and `§13.7` item 3 are not consistent with each other.** `§13.7` item 3 presupposes that this scope isolates a declaring block and yields an `F-13` refusal; `E-12` item 2's rule, as implemented and as literally written, cannot yield one. G-18's expectation was derived from `§13.7` item 3 and is falsified; the same invocation therefore also **cannot** supply the `§13.7` item 4 refusal-branch reading the contract owes.

**D-F · G-20 — the `PARKED` limb is unexercised and an unconditional `PRECONDITION-FAILED` string is printed.** Verbatim (both facts from the same run):

```
[live-drive] seeded corpus -> import {"ok":true,"documentIds":[".live-corpus/alpha",".live-corpus/beta"],"nodeCount":6,"edgeCount":10}
[live-drive] DRIVE-CLASSIFICATION (§2.3 H-4 / F-6 / F-7): an unproven gesture reads NOT-DRIVEN (a driver failure, realInput:false); an isError reply is printed verbatim and never credits the app with a FAIL; a missing fixture or an absent engine (ECONNREFUSED) is PRECONDITION-FAILED: PRECONDITION-FAILED: fixture-missing — the seed corpus produced no documents
```

**What the docs led me to expect:** `§3.2 F-6` — a missing fixture is *"`PRECONDITION-FAILED` with the missing fixture named — never a silent park"*, and `§2.3 H-4`'s `PARKED` row requires `parkReason` naming the precondition.
**What the live run shows:** **0 `PARKED` verdicts and 0 `parkReason=` occurrences** in the whole battery (the docs' own readings record `3 PARKED`: `§0.1 M-9`, `§13.1 L-1`), while the run **does** print a `PRECONDITION-FAILED: fixture-missing — the seed corpus produced no documents` string **in the same run that seeded two documents and whose rows read `.live-corpus/alpha`/`.live-corpus/beta` content** (35 rows PASS). Either that string is an unconditional legend, or it is a live reading that is false here.
**Which of the two it looks like — an UN-HARDENED REGRESSION against the artifact's honesty (this unit's own subject), plus a classification limb that this run's configuration does not exercise.** Two limbs: (i) **the `PARKED` + `parkReason` classification is not exercised at this head** — recorded as a structural NOT-RUN limb, exactly as `RCA-11` clause (b) requires a park reason rather than a default park; (ii) **the `PRECONDITION-FAILED: fixture-missing` marker is printed where no fixture is missing**, which makes `F-6`'s marker unable to distinguish the missing-fixture state — a report-honesty defect in the instrument, not an app finding.

### 4.5 Where the DOCS alone led me to expect something the live run did not show

*This is the gate's product. Each item is labelled DRIFT (a doc/spec claim the artifact contradicts) or REGRESSION (a contracted behaviour the artifact no longer shows). The first four are the FAILs' classifications, restated here as doc-side findings; the rest are drifts this gate found **outside** its own scenarios.*

| # | What the docs say | What the live run shows | Label |
| --- | --- | --- | --- |
| **D-1** | `§6.3 C-2` item 3: a scoped run prints `REFUSED` naming the missing rows and **no longer reads `OK`**; `M-1`/`D-1` name the `0 rows … OK` shape as the defect | `--block=boot_landing` prints `OK` with `fullBattery:false` and all eight rows named in `coverage.missingRows` | **UNMET CONTRACT LIMB + DRIFT** — violates `C-2` item 3 (and `M-1`'s own defect framing), while satisfying `§2.1 E-3`'s full-battery-scoped `ok` rule and `P-SM-1` (iii) that the driver implements; the two clauses contradict each other and only a spec-owning pass can reconcile them |
| **D-2** | `§2.2 E-7`/`§3.2 F-10`: a FAIL always carries the predicate with `observed` and `required` | `toolbar_undo` (`UF-HIST-2`) prints `failingClause=null` and no `observed`/`required` | **REGRESSION (un-hardened path)** — the pin is green because it is source-static |
| **D-3** | `§13.1 L-4` / `§13.5` item 3: `--block=boot_landing,vis_persist` **exits 1 and prints `REFUSED — missing declared extended row(s): UF-SETTINGS-7`**, marked **SATISFIED** | prints `OK`, `refusing=[]`, `inconclusive=[]`; the exit 1 is the `boot_landing` FAIL | **DRIFT** (a recorded reading that no longer reproduces) + an **unreachable acceptance limb** (no `--block=` value can make an in-scope declared row produce nothing) |
| **D-4** | `§13.7` item 3: `--block=uf_settings_7` alone isolates one declaring block (and item 4 owes a zero-FAIL refused run) | exit **0**, `OK`, nothing refused | **DRIFT** — `E-12` item 2's scope rule cannot produce the reading `§13.7` item 3 presupposes |
| **D-5** | `§6.1` class (b) / `§13.5` item 1: the `8 of 8` matrix limb is **OPEN** and `§13.7` item 1 owes the mapping-to-emission fix; `§13.5` item 4: the hygiene falsifier is **CONFIRMED-BROKEN** (isolated PASS vs battery `NOT-DRIVEN` for `uf_panes_1`) | the full battery reads **`8 of 8`** with `OK`, and `uf_panes_1` reads **PASS in both** the isolated and the full-battery run with the same evidence | **DRIFT (docs are stale in the *favourable* direction)** — both owed items now read as landed at this head; the amendment's `OPEN`/`CONFIRMED-BROKEN` statuses need a spec-owning annotation, and **neither reading is app evidence** |
| **D-6** | `§13.7` item 5 / `§3.3`: the register's stale class-(b) term (`extendedRowsRun` *"predicted 54 → 56"*) must be **re-stated beside the measured reading**, whose value of record is **`53`** | the pin still prints *"the real FULL battery's `extendedRowsRun` (predicted 54 → 56)"*, and **none of the three figures (`53`/`55`/`56`) is printed as this head's reading**; the run's `extendedRowsRun` is **`55`** with the printed composition `55 of 32 defined; 3 inconclusive; 24 EXTENDED-UNDECLARED` | **DRIFT** — the owed TestWriter re-statement has not landed, and the docs' `53` is itself one run's composition, not a fixed figure (`§13.2` says so) |
| **D-7** | `§2.3 H-3` clause 1: every click **records** its coordinate, viewport, the element under the point and `onTarget`; `F-4` requires the coordinate, viewport and `onTarget` **printed** on the off-viewport case | the off-target case prints coordinate + element + `onTarget=false` but **no viewport**; 40 of 43 verdict-carrying `cdp` clicks print none of the four; `inVp=false` occurs **0** times in the run | **DRIFT (an unobservable claim)** + a small **REGRESSION** in `F-4`'s triple |
| **D-8** | `§3.2 F-6`: a **missing fixture** is `PRECONDITION-FAILED` with the fixture named | the string `PRECONDITION-FAILED: fixture-missing — the seed corpus produced no documents` is printed in a run that **seeded two documents** (`seeded corpus -> import {"ok":true,"documentIds":[".live-corpus/alpha",".live-corpus/beta"]…}`) and in which 35 rows PASS — so the marker does not distinguish the state it names | **REGRESSION (report honesty)** — the instrument prints a precondition state that is not this run's |
| **D-9** | `§0.1 M-9` / `§13.1 L-1`: the battery carries **`3 PARKED`** rows | this run carries **0** `PARKED` and **0** `parkReason`; the engine-absent and zero-box classes read `NOT-DRIVEN` with named reasons instead, and rows that failed on the missing fixture at the recorded head (`uf_panes_12`, `uf_tabs_3`, `uf_panes_8`, `uf_layout_10`) now PASS | **DRIFT (counts are stale)** — the parked-class arithmetic in every tracker block quoting `3 PARKED` needs re-measuring, and **no verdict is promoted by the change** (`NOT-DRIVEN` is not a PASS) |

### 4.6 What could not be run, structurally (never a silent park)

| id | Why |
| --- | --- |
| **N-1** | a *disagreeing* pair of contributors to one row id is a state, not an option — no `--block=` scope produces it; `§13.5` item 2 records the same limit |
| **N-2** | the `UF-STAGE-1` re-derive limb is `UNTAKEN` by the contract (§12.1); measuring it would be a first app assertion, outside this unit |
| **N-3** | a duplicated row id / `BLOCKS` key is a source-level negative needing a driver edit, denied by `§1.3`/`§3.4` |
| **N-5 (was G-7's antecedent)** | **no invocation produced a `REFUSED` reconciliation**, so the refusal-exit limb could not be read: the in-scope-yet-unverdicted state is unreachable from the `--block=` space at this head (D-3). Its companion reading — the `fail > 0` branch — *is* readable: `OK`+13 FAIL ⇒ exit 1 (full battery), `OK`+0 FAIL ⇒ exit 0 (G-18/G-17/G-05) |
| **N-6 (G-20's park limb)** | this run's configuration produced **0 `PARKED`** rows, so `PARKED` + `parkReason` (`H-4`, `F-6`) has no instance here to read |

### 4.7 The honest layer statement for this run

**This gate's readings are HARNESS `[D]` at their ceiling.** What was proven:

- the **node-static** pin and the register's declared arithmetic are green as contracted (`§6.1` class (a));
- the **live driver's own report** at this head prints: a verdict per declared matrix row with `coverage` self-describing (`8 of 8`, `OK`); the `§6.1` field set and `surface.target` on every printed row line; a printed failing clause on all but one non-PASS row; the two converted rows on their enumerated ids with `UF-STAGE-1`'s required value and `vis_persist`'s persistence half; a shared-row aggregate that is the AND of both printed contributors; the extended-undeclared emissions reported and not refusing; `NOT-DRIVEN` kept distinct from app FAILs; and position-independence for `uf_panes_1`.

What was **not** proven and may not be quoted from this run: the six FAILs above are **the instrument's** (its own coverage/refusal/evidence printing), and nothing in this artifact is app behaviour.

**The two claims this unit may never make are not made here:** *"the app works"* and *"the battery is app-green."* The battery's own app-layer readings (13 FAIL blocks on printed `ROW` lines, `summary.fail:2` over the executed `§5.U` rows, the `U-4`/`UF-HIST-2`/`UF-STAGE-1`/`UF-STAGE-2` FAILs) are **`[U]`-layer observations owned by other rows** (`§9 T-4`), untouched by this gate, and **not** this unit's result — and `summary.pass`/`fail` still partition **only** the executed `§5.U` rows, exactly as the driver's own `NOTE` line says.

---

## 5. GATE-7 PROOFREADER'S ANNOTATED AUDIT RECORD (`AGENTS.md` item 10b) — the stale figures brought to their measured values with the instrument named, and the `D-1`…`D-9`/`G-*` dispositions at the later heads

**⟨APPENDED `2026-09-29` BY THE PROOFREADER — `RCA-8(c)`, ANNOTATE-BESIDE: every expectation in `§3` and every
reading in `§4` is KEPT VERBATIM as this gate's own record and NOTHING in them is rewritten.** **THIS PASS RAN
NOTHING: no shell, no suite, no pin invocation, no battery, no Electron boot.** Its wall is read/search + doc-write,
so the figures below are either the CONTRACT'S own measured/recorded readings (`docs/specs/unit-live-driver-verdict-integrity.md`
`§16.1`, which names the instrument per figure) or RECORDED READINGS of later passes quoted with their measurer at
their site. **The per-scenario annotations sit BESIDE the scenarios they correct (`G-2` · `G-7` · `G-8` · `G-14` ·
`G-18`); this section is the consolidated ledger and the `D-`/`N-` disposition table.**

### 5.1 The figures this artifact prints, against the readings of record at the later heads

**⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`AGENTS.md` item 10d / `RCA-6`) — `RCA-8(c)`, ANNOTATE-BESIDE: THE TABLE BELOW IS KEPT VERBATIM, its gate-7 figures and their measurers unmoved.** **THIS PASS RAN NOTHING** (read/search + doc-write; no shell, no suite, no pin invocation, no battery, no Electron boot); **it measured LINE COUNTS only, with the instrument it holds (the file-read tool's own line census).** **THE HEAD IT RECONCILED AT, so the next reader can date this artifact's own context:** this file = **`654` lines** (was `559` at the gate-7 head — the gate-7 pass's own `§5` insert is the delta); the contract `docs/specs/unit-live-driver-verdict-integrity.md` = **`2429` lines** before its new `§17`; `scripts/live-drive.mjs` = **`8064` lines / `md5 fcc17e09b48b0a3a419be84e589e269c`** (**unchanged** from the gate-7 pair); `tests/live-drive-contract.test.ts` = **`6359` lines / `md5 1b9100d0e58aefe8b845f7fd473f8136`** (**MOVED +`886` lines past the gate-7 `5473`/`7f150b39…` pair**), **`77 passed (77)`**, and the whole suite **`3 failed | 4565 passed | 57 skipped`** with the same three reds named in `§2.3` item 3 (RECORDED READINGS; measurer: the supervisor's head reading — NOT taken by this pass). **THE TWO `D-` DISPOSITIONS THAT MOVED SINCE THE GATE-7 NOTES ARE ANNOTATED AT THEIR OWN CELLS BELOW (`D-6` unchanged; `D-7`'s `C-6` half CLOSED).** **THE CONTRACT'S OWED `§15.1` CENSUS ANNOTATION IS DISCHARGED in the same gate** (`C-4` · `C-5` · `C-6` are CLOSED; the partition's `26 + 3 + 5 + 1 = 35` becomes `29 + 3 + 2 + 1 = 35`), and **the unit's own acceptance status therefore no longer reads `§13.5`'s stale `OPEN`/`CONFIRMED-BROKEN` set** — see the contract's `§17` for the full record and `archive/reviews/2026-09-29-U-LIVE-DRIVER-VERDICT-INTEGRITY-doc-review.md` for the gitignored provenance copy.** **NO EXPECTATION, NO VERDICT AND NO VERBATIM READING IS REWRITTEN BY THIS NOTE.**

| The artifact's figure (its gate-5 head) | The reading of record | Source + instrument |
| --- | --- | --- |
| `G-1`/`§4.3`: the pin reads `Tests 69 passed (69)` | **`77 passed (77)`** | RECORDED READING; measurer: the supervisor's head reading, as recorded at the contract's `§16.1-e` (**the pin was being edited by a parallel `tests/**` pass in the same round — the figure belongs to the head that pass was handed**) |
| `G-4`/`§4.3`: `Test Files 3 failed \| 209 passed (212)` / `Tests 3 failed \| 4557 passed \| 57 skipped (4617)` | **`3 failed \| 4565 passed \| 57 skipped (4625)`** — the SAME three reds, named identically in `§2.3` item 3 above. **The FILE-count line (`212`) is superseded in kind but the current file count is `NOT MEASURED` by the gate-7 pass** (no shell) | RECORDED READING; measurer: the supervisor's head reading (contract `§16.1-f`/`§16.1-g`) |
| `G-2`/`§4.3`: the register prints `6 + 14 + 16 + 17 + 16 + 14 + 14 = 97`, `executed node-side 81` | **`6 + 14 + 16 + 17 + 19 + 15 + 14 = 101` = `85` executed + `16` class-(b)** — the artifact's own `§4.3` reading is its head's and is superseded | RECORDED READING; measurer: the TestWriter (contract `§14.1` `Z-3`/`Z-5`), `VERIFIED-BY-READ` in the pin's `TALLY`/arithmetic rows by the gate-7 pass |
| `G-15`/`§4.2`: `extendedRowsRun` = `55` (`55 of 32 defined; 3 inconclusive; 24 UNDECLARED`) | **`53`** is the landing pass's reading (contract `§13.2`); **`54`** is the older `M-9` reading; **the current head's figure is `NOT MEASURED` by the gate-7 pass and the three readings are head-dependent** | RECORDED READINGS; measurers: the implementer's landing pass (`53`), this blind gate (`55`), the live-scenario runner (`54`); see contract `§16.6` item 3 |
| `G-20`/`§4.5` `D-9`: the artifact read `0 PARKED` / `0 parkReason` | the landed head prints **`3` `verdict=PARKED` `ROW` lines with `parkReason` on 3/3** | RECORDED READING; measurer: the implementer's landing pass, as recorded at `docs/next-steps.md`'s gate-cycle block and the contract's `§15.2` `C-1` (`closed-and-live-proven`) |
| `G-16`/`§4.5` `D-7`: `3` of `43` `gesturePath=cdp` clicks printed `onTarget=` | the click record now rides **50 of 65** `ROW` lines, including the off-viewport `inVp:false` `NOT-DRIVEN` record, with the residual **15** named by class | RECORDED READING; measurer: the implementer's landing pass (`docs/next-steps.md`); the residual is NOT zero — see 5.2 `D-7` |

**⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`AGENTS.md` items 10b/10d, `RCA-6`) — `RCA-8(c)`, ANNOTATE-BESIDE:
THE TABLE ABOVE IS KEPT VERBATIM, its gate-7 figures and their measurers unmoved.** **THIS PASS RAN NOTHING**
(read/search + doc-write; no shell, no suite, no pin invocation, no battery, no Electron boot); **it measured LINE
COUNTS only, with the one instrument it holds (the file-read tool's own line census).** **THE FROZEN HEAD THIS
ARTIFACT'S FIGURES ARE NOW RECONCILED AGAINST IS THE CONTRACT'S `§18.1`:** `scripts/live-drive.mjs` = **`8293` lines /
`md5 aa3c01ea315a3c9f9a4f6898e88dfd05`** (line count MEASURED by this pass, same instrument; digest a RECORDED
READING; measurer: the supervisor's frozen-head reading) — **superseding BOTH `8064`/`fcc17e09…` (the value in the
cells above) and the intermediate remedy-round head**; `tests/live-drive-contract.test.ts` = **`7396` lines /
`md5 71bfda004e32f11065cf5402bf0361ed`**, **`80 passed (80)` — NO RED ARM** (superseding `6359`/`1b9100d0…`/`77`
above); the whole suite = **`3 failed | 4568 passed | 57 skipped (4628)`** (superseding `4565`/`4625` above; the SAME
three carried reds named in this artifact's `§2.3` item 3, and `typecheck`/`build` exit `0`); the contract
`docs/specs/unit-live-driver-verdict-integrity.md` = **`2560` lines** BEFORE its `§15.7`/`§18` bytes (superseding
`2429`); and **this artifact** = **`656` lines** at the read taken before this note's own bytes (superseding `654`;
**the file's own terminal line count after this re-run's two inserts is `699`, a reading taken while writing — the
post-write count is stated, never derived**).
**THE REGISTER ARITHMETIC IS UNMOVED AT `6 + 14 + 16 + 17 + 19 + 15 + 14 = 101 = 85 executed node-side + 16 named
class-(b) NOT-RUN`, `7` rows** (`VERIFIED-BY-READ` by this pass in the pin's own arithmetic title and its summed `101`
assertion) — **so this artifact's `G-2` expectation, whose frozen figures are the superseded `97`/`81 + 16`, remains
stale in its FIGURES and sound in its TEETH** (annotated at `G-2` above; the `101` is the reading of record).
**NO EXPECTATION, NO VERDICT AND NO VERBATIM READING IS REWRITTEN BY THIS NOTE.**⟩**

**⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — `RCA-8(c)`: THE `§5.2` TABLE BELOW IS KEPT VERBATIM
AND ITS `D-6` ROW IS RE-CONFIRMED AT THE FROZEN HEAD.** **`VERIFIED-BY-READ` by this pass in
`tests/live-drive-contract.test.ts`: the `P-SM-3` class-(b) arm still reads *"the real FULL battery's
`extendedRowsRun` (predicted 54 → 56)"*, so `D-6`'s drift STANDS and its owner is unchanged (the TestWriter —
`tests/**`; contract `§13.7` item 5 and the re-run's record `§18.3`). The stale in-source DRIVER digest comment the
contract's `§18.3` owed-set row `R-1` records is a `VERIFIED-BY-READ` finding of the same class and the same owner.
**A `D-n` in THIS artifact's `§4.5`/`§5.2` is the GATE-5 blind pass's doc-drift id and is a DIFFERENT object from
the contract's `§15.7` `D-1`…`D-5` (the fourth gate-4 confirm pass's findings) — the collision is recorded, never
conflated.**⟩**

### 5.2 The `D-` findings and the `N-` limits — disposition at the later heads

| # | This artifact's label | Disposition at the later heads (each a RECORDED READING with its measurer, or a `VERIFIED-BY-READ` named as such) |
| --- | --- | --- |
| **D-1** | UNMET CONTRACT LIMB + DRIFT (scoped run prints `OK`) | **CLOSED BY RULING, NOT BY REFUSAL: `DECIDED: LIVE-DRIVER-OK-CARRIES-ITS-SCOPE`** — an `OK` now carries its scope, so the artifact's G-8 expectation is superseded (annotated at `G-8`; contract `§15.3.1`). |
| **D-2** | REGRESSION: `toolbar_undo` (`UF-HIST-2`) prints `failingClause=null` | **CLOSED at a later head** — the `UF-HIST-2`/`toolbar_undo` row now carries a real clause, beside a central guarantee in `buildReportRow` (RECORDED READING; measurer: the implementer's landing pass, `docs/next-steps.md`; the guarantee itself `VERIFIED-BY-READ` by the gate-7 pass in `scripts/live-drive.mjs`). |
| **D-3** | DRIFT + unreachable acceptance limb (`§13.1 L-4` / `§13.5` item 3) | **THE READINGS ARE WITHDRAWN at the contract's `§15.3.1`** (both contributors emit the row id; `REFUSED` in no invocation; the exit `1` was `fail > 0`); `§13.7` item 3 is UNANSWERABLE from the `--block=` space (`§15.3.2`). Annotated at `G-14`. |
| **D-4** | DRIFT: `--block=uf_settings_7` isolates nothing | **CONFIRMED AND GENERALISED** by `§15.3.2` (items 3/4 UNANSWERABLE from the `--block=` space under the ruling). Annotated at `G-18`. |
| **D-5** | DRIFT (favourable): the `8 of 8` limb and the hygiene item now read landed | **CONFIRMED AS LANDED**: the full battery reads `MATRIX rows (8 of 8 = summary.total)` + the ruled `OK`, and all four scoped readings agree with it (`uf_panes_1=PASS`, `uf_settings_7=PASS`, both orders), with `C-8`'s isolated-vs-battery agreement recorded (RECORDED READINGS; measurer: the implementer's round-3 pass — contract `§15.2` `B-1`/`B-2`/`C-2`/`C-8`, and the contract's `§13.5` item 1/4 cells now carry the pointer notes). |
| **D-6** | DRIFT: the pin prints the stale class-(b) term *"predicted 54 → 56"* while none of `53`/`55`/`56` is printed as this head's reading | **THE STALE TERM IS STILL IN THE PIN** — `VERIFIED-BY-READ` by the gate-7 pass at `tests/live-drive-contract.test.ts` (the `P-SM-3` class-(b) arm); **owner: the TestWriter** (contract `§13.7` item 5, `§16.6` items 2/3). **Still owed; NOT smoothed.** |
| **D-7** | DRIFT (unobservable claim) + small REGRESSION: the four-part click record | **PARTLY CLOSED, STILL OPEN AS A CLAIM**: the record's coverage rose `1 of 45` → `50 of 65` `ROW` lines (RECORDED READING; measurer: the implementer), but **the contract's `§2.3 H-3` clause-1 claim that EVERY click records coordinate + viewport + element + `onTarget` remains unobservable from the artifact for the residual 15**, which the next driver pass's `C-6` (click-record attachment per block) still owns. **⟨ANNOTATED `2026-09-29` BY THE GATE-8 ITEM-10d DOCUMENTATION REVIEW (`RCA-8(c)`: the cell is KEPT VERBATIM) — THE `C-6` HALF IS NOW CLOSED, AND THE CLAIM IS NOW PARTLY OBSERVABLE: the click-record attachment is PER ROW (`VERIFIED-BY-READ` by that pass in `scripts/live-drive.mjs`'s `ufAttachClickRecords`), and the live split is **`29` numeric single-click records + `24` records WITH `clicksDriven=null` (the withheld multi-row case) + `15` rows carrying no record at all (no gesture driven)** — with no row printing a selector, coordinate or count it did not drive (RECORDED READING; measurer: the implementer's landing pass; contract `§15.2.3` `C-6`, `§15.1`). **The `H-3` clause-1 claim's residual is therefore the `15` no-gesture rows, which are rows that drove nothing — a different question from the per-block mis-attribution `C-6` filed.**⟩** |
| **D-8** | REGRESSION (report honesty): the unconditional `PRECONDITION-FAILED: fixture-missing` string | **CLOSED at a later head** — the unconditional string was REPLACED by a live fixture read (`PRECONDITION HOLDS — rag.list_documents -> 6 document(s)`) beside the rule line (RECORDED READING; measurer: the implementer's landing pass, `docs/next-steps.md`). |
| **D-9** | DRIFT (counts are stale): `3 PARKED` vs `0` | **THE LANDED HEAD PRINTS THE `3`**: three `verdict=PARKED` `ROW` lines, each with its declared `dclass`, a string `evidence` and its `parkReason` verbatim (RECORDED READING; measurer: the implementer's landing pass; contract `§15.2` `C-1`). This artifact's `0` is its own run's reading and is kept. |
| **N-1**…**N-4**, **N-5**, **N-6** | the structurally non-exercisable cases | **UNCHANGED** — `N-5` (no `REFUSED` produced) is CONFIRMED and generalised by the contract's `§15.3.2`; `N-2` stays `UNTAKEN` by contract; `N-1`/`N-3` stay structural; **`N-6`'s park limb is exercised at the landed head** (three parked rows with reasons, per `D-9` above). |

**⟨ANNOTATED `2026-09-29` BY THE GATES-7+8 RE-RUN (`RCA-6`) — `RCA-8(c)`: THE `§5.2` TABLE ABOVE IS KEPT VERBATIM
AND ITS `D-6` ROW IS RE-CONFIRMED AT THE FROZEN HEAD.** **`VERIFIED-BY-READ` by this pass in
`tests/live-drive-contract.test.ts`: the `P-SM-3` class-(b) arm still reads *"the real FULL battery's
`extendedRowsRun` (predicted 54 → 56)"*, so `D-6`'s drift STANDS and its owner is unchanged (the TestWriter —
`tests/**`; contract `§13.7` item 5 and the re-run's record `§18.3`). The stale in-source DRIVER digest comment the
contract's `§18.3` owed-set row `R-1` records is a `VERIFIED-BY-READ` finding of the same class and the same owner.
**A `D-n` in THIS artifact's `§4.5`/`§5.2` is the GATE-5 blind pass's doc-drift id and is a DIFFERENT object from
the contract's `§15.7` `D-1`…`D-5` (the fourth gate-4 confirm pass's findings) — the collision is recorded, never
conflated.**⟩**

### 5.4 What this re-run does NOT do

**It rewrites no expectation, no verdict and no verbatim reading** (the `§3` frozen set and the `§4` run record stand
as the gate-5 head's); **it closes no finding and writes no DONE row**; and **it makes no app claim at any point** —
every figure above and the six `FAIL`s this artifact recorded are HARNESS/`[D]` instrument readings, owned by the rows
and passes named with them (`RCA-12`). **It also does not re-measure any battery figure**: the `extendedRowsRun`
readings (`53`/`55`, and the older `54`) and the click-record split remain the recorded readings of the passes that
took them, and this artifact's `G-15`/`D-6` cells stay as they were written.

### 5.6 What sections 5.1–5.3 do NOT do

**It rewrites no expectation, no verdict and no verbatim reading** (its `§3` frozen set and its `§4` run record stand
as the gate-5 head's); **it closes no finding and writes no DONE row**; and **it makes no app claim at any point** —
the six `FAIL`s this artifact recorded, the later closures in 5.2, and every figure above are HARNESS/`[D]`
instrument readings, owned by the rows and passes named with them (`RCA-12`).

