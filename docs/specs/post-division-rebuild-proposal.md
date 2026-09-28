# POST-DIVISION REBUILD — the proposal (branch `post-division-rebuild`)

**Date:** 2026-09-27 · **Pass kind:** PROPOSAL (gate-1 input; no code, no test, no spec below this file
is authorised by it) · **Branch:** `post-division-rebuild`, created from `main` at `b6791e0` ·
**Layer (RCA-12, mandatory):** **DOC-LAYER / proposal — NOT app-green, NOT envelope-green, NOT
store-green, NOT engine-green, NOT live-green.** Every code claim below is a **read** of one of the
three trees; every suite figure is labelled with who measured it.

**The product owner's instruction (verbatim, the authority for this proposal):**

> *"Start a post-division rebuild git branch for the project. This will be using the expanded version of
> the base Provident-Electron project hosted in an adjacent folder (or at
> https://github.com/LittleKingsguard/Provident-Electron) to replace the local implementations of the
> added elements documented in the guides (`/media/ryanr/Shared Files/Projects/Provident-Electron/docs/guide`).
> Additionally it will use the expanded Gnosis engine that offloads more of the Astrographer-internal
> graphing. All local code implementing the relocated UI or delegated engine functions, and the tests
> that apply to those features, will be eliminated in this branch."*

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in
this file** (the convention `docs/specs/requirement-catalog.md` §3.4 rule 7 establishes). Where a source
document's own citation is line-numbered, it is quoted as that document's text, never adopted here.

**Companion artifacts (the gate-1 inputs, read beside this file):**

| Artifact | What it is | Status |
| --- | --- | --- |
| `docs/specs/post-division-foundation-adoption-surface.md` | the FOUNDATION side — every element the guides document, with its verified source symbol, its adoption contract and its declared degradation | **OWED — in flight (read-only inventory)** |
| `docs/specs/post-division-local-elimination-inventory.md` | the FORK side — every fork-local implementation the rebuild must eliminate, with its consumer map and test disposition | **OWED — in flight (read-only inventory)** |
| `docs/specs/post-division-engine-offload-inventory.md` | the ENGINE side — the Gnosis surface that offloads fork-internal graphing, with the gating analysis | **OWED — in flight (read-only inventory)** |

**This file is COMPLETE only when the three tables in §4 are filled from those artifacts. Until then it
is a partial proposal and **no gate-1 delegation may be made against it** (a proposal that is not
exhaustive cannot be reviewed for validity).**

---

## 1. What the division is (established by reading both trees)

`docs/FORK-DIVERGENCE.md` records the fork's original position: the foundation shipped an MCP/Electron
endpoint with deliberately minimal chrome, and **rows 1–7 of its §2 table** were the shell-chrome
capabilities the fork had to invent locally (regions + mount safety, pointer-gesture controllers, the
overlay primitive, the theme token layer, the zone-track contract, the main-focus tab model, the
data-driven native menu). Each was filed against the foundation as **`SC-1..SC-7`**
(`docs/feature-requests/provident-electron-shell-chrome-requests.md`) and again as the implementation
work package **`SCH-1..SCH-13`** (`docs/feature-requests/provident-electron-shell-chrome-handoff.md`).

**The foundation has now adjudicated and landed that set itself.** Read from the foundation tree
(`../Provident-Electron/`, its own trackers):

- `docs/decisions.md` `DECIDED: SHELL-CHROME-HANDOFF-DISPOSITION` — the fork's package is *"adjudicated
  GO-CONDITIONAL and AMENDED … 6 `SCH`-derived units adopted-reshaped + 2 engine prerequisite units = 8
  units, 6 items declined/refiled, 1 split, 1 refile withdrawn, ZERO PARK"*, with the admission rule
  `S-d8` and its six prohibitions.
- `docs/next-steps.md` — the ledger closes at **`21 DONE / 0 open` UNITS = `21` units** (the
  `U-FOCUS-TOOL` `F3` close-out row). The units are the foundation's own: `U-ENGINE-PIN`,
  `U-ENGINE-DRIFT`, `U-MOUNTGUARD`, `U-LISTHOST`, `U-SLOTHOST`, `U-PROJ`, `U-CENSUS`, `U-GSESSION`,
  `U-MENULIB`, `U-OVERLAY`, `U-ZONES`, `U-CONTAINER`, `U-GUTTER`, `U-RELOCATE`, `U-THEME`,
  `U-THEME-CONTROL`, `U-FOCUS-MODEL`, `U-FOCUS-TOOL` (+ its harness units).
- `docs/guide/` — the thirteen fork-facing pages that document the landed elements
  (`00-base-surface.md`, `seams.md`, `theme.md`, `theme-control.md`, `overlay.md`, `menulib.md`,
  `container.md`, `relocate.md`, `gutter.md`, `gutter-ui.md`, `zones.md`, `focus-model.md`,
  `focus-tool.md`, `mcp-parity.md`).
- `docs/FORKER.md` §4 — the fork-facing digest, one row per unit, each stating **what a fork gets** and
  its **honest limits**.

**The consequence, stated in one line.** Every mechanism the fork hand-rolled in rows 1–7 is now
foundation-owned, and the fork's local implementation of each is a duplicate of a landed foundation
unit. The rebuild replaces the fork-local mechanisms with the foundation's, and **eliminates the
duplicated code and the tests that pin it** — which is what the product owner's instruction orders.

**The same division on the engine side.** The fork's `docs/feature-requests/gnosis-engine-feature-requests.md`
(`GR-1..GR-9`) and `docs/HANDOFF.md` carry the asks against the sibling `Gnosis` engine. The rebuild's
engine half is bounded by §4.3's inventory and by §5's gating analysis — **it may not be assumed**.

---

## 2. The consumption model — MEASURED, and the one architect question it leaves open

`../Provident-Electron/docs/guide/seams.md` §"Gotchas measured in this repo" states the model in the
foundation's own words: *"those three modules are in **no shipped bundle** and **a fork consumes them as
source**."* The foundation's mechanisms are therefore **vendored**, not installed.

**Measured import closure (this pass, read from the foundation tree).** The fifteen mechanism modules
the foundation added are:

`census.ts` · `container.ts` · `focus-model.ts` · `gesture-session.ts` · `gutter-affordance.ts` ·
`gutter.ts` · `layout-projection.ts` · `menu-template.ts` · `mount-invariant-guard.ts` · `overlay.ts` ·
`owned-list-host.ts` · `relocate.ts` · `slot-host.ts` · `theme.ts` · `zones.ts`

Their **complete import census is internal to that set**: `census.ts` imports `zones.js`;
`gutter-affordance.ts` imports `gutter.js` + `gesture-session.js`; `gutter.ts` and `relocate.ts` import
`gesture-session.js` (types). **No module in the set imports any other file of the foundation's
`src/shared/`** — verified by reading every import statement in all fifteen.

**Why that matters — the baseline-collision finding (this pass).** Four `src/shared/` filenames exist in
**both** trees and the fork's copies are NOT the foundation's:

| File | Astrographer | Foundation | Differs? |
| --- | --- | --- | --- |
| `src/shared/dom-shim.ts` | 508 lines | 237 lines | **DIFFERS** |
| `src/shared/types.ts` | 874 lines | 328 lines | **DIFFERS** |
| `src/shared/demo-envelope.ts` | 131 lines | 433 lines | **DIFFERS** |
| `src/shared/path-fork-cycle.ts` | 101 lines | 101 lines | identical (md5-equal by line count and `diff -q`) |
| `src/shared/document-tree.ts` · `o0-hook.ts` · `o0-report.ts` | fork-only | — | — |

Because the fifteen mechanism modules import **none** of those four, adopting them is
**import-closed and collision-free**: the fork vendors the fifteen mechanism modules into
`src/shared/` and **replaces none of its own baseline files.** A wholesale replacement of the four
divergent files is therefore **out of scope and would be a regression** (the fork's `dom-shim.ts` and
`types.ts` are strictly larger than the foundation's at the pinned commit).

**The adoption pin — MEASURED.** The foundation tree is clean at **`main` = `8f193a8d1446ed1e64c4ab6c569941e988f82459`**.
Per-module md5 at that commit (the adoption's provenance basis, to be recorded as the pin):

| Module | md5 | Module | md5 |
| --- | --- | --- | --- |
| `census.ts` | `550d9d6fb1285e23062b3cd9e3691179` | `overlay.ts` | `931339d71ac0220e400190296d408ee5` |
| `container.ts` | `33071ff8a2453edb4febe52e9cba38a2` | `owned-list-host.ts` | `d576f0017747d4fa6dacab3e9fb27ccb` |
| `focus-model.ts` | `8ae4a59ca853c3dad14e1e07cc73477a` | `relocate.ts` | `83707f14ec249fa46fec45825d6b9be9` |
| `gesture-session.ts` | `50eb2dcc3e9e29427f7ae38716ddae90` | `slot-host.ts` | `bb53cdedad4f8f4359f603fe7e4ea86d` |
| `gutter-affordance.ts` | `90dae03fc92eb2c65e43f79843c3f0ef` | `theme.ts` | `c4b4d4c4127158d14bc035e58d857597` |
| `gutter.ts` | `7cb67bfef8e4b3750994e3b33846055f` | `zones.ts` | `91fb829d2a2be580538c7719b3f4bef0` |
| `layout-projection.ts` | `a507ea116d304e5f32241c63d2182196` | | |
| `menu-template.ts` | `98952f69f7c39bbabca0458a69258b4b` | | |
| `mount-invariant-guard.ts` | `a8ca65a5cd46ad7500d467d6355aaeb3` | | |

**Q-A (architect) — the ONE open question the consumption model leaves.** The vendoring pin is a
*reading*, not a mechanism: nothing in the fork will detect that the foundation's bytes moved. The
options are **(A1) pin-only** — record the commit + md5s in `docs/decisions.md` and in the units'
provenance cells, with no automatic check; **(A2) pin + a drift test** — a `tests/**` row that hashes the
vendored modules against the recorded md5s (an **in-repo** check that cannot see upstream movement, so it
detects local edits, not drift); **(A3) pin + a live cross-tree check** — a check that reads
`../Provident-Electron/src/shared/*.ts` when that folder is present and reports a difference, skipped
when it is absent (this is the foundation's own `U-ENGINE-DRIFT` shape applied in reverse). **This
proposal's recommendation is `A3`-as-a-monitor with `A1`'s record mandatory**, but the choice is the
architect's and it gates nothing below §4. **It is the first item this proposal escalates.**

---

## 3. The boundary the rebuild must not cross (re-derived, not invented)

The gate record `docs/specs/astrographer-scope-realignment-review.md` §4.1 rules that the tab strip
(C14), the gutters (C7), the modal frame/scrim (C3), the theme-token application (C1 mechanic) and the
native menus (C13/C17) are **already and correctly shell chrome**, and that the fileable part is *"the
**mechanism layer underneath**"*. Its **MUST-NOT-MOVE** list is binding on this rebuild:

| Control node (class) | Row | The rebuild may NOT touch it |
| --- | --- | --- |
| pane collapse toggle | `§4` C5 | the `pane-collapse-<id>` control, its handler name and its host seam stay provident-authored and dispatchable |
| container minimize + tab list | `§4` C12 | same |
| doc-directory tree | `§4` C15 | same |
| advanced search | `§4` C18 | same |
| hover-preview | `§4` C19 | same |
| shared subtrees | `§4` C20 | same |
| markdown/HTML toggle | `§4` C8 | same |
| stage content, content repopulation | `§4` C2/C10 | *"MUST NOT narrow what `get_rendered_html`/`list_targets` see"* |
| the RAG layer, the pane registry | `§5.2` DO-NOT-FILE | **the fork keeps these** — they are app behavior, not shell chrome |

**The project-wide UI constraint also still binds** (`AGENTS.md`): any UI element that is not the
Electron shell's own chrome (window frame, native menu bar, preload bridge, MCP server) must be authored
as provident-ssr data and driven through the producing graph. Adoption of a *mechanism* is therefore
permitted; moving a *control node* out of the graph is a review finding.

**And the hybrid rule binds every adopted unit:** *"the **model is always Provident/serialized; only the
mechanic is external** — external code commits one managed write (hook / state-slice / structural op) at
gesture end, never a per-frame stream"* (`docs/specs/ui-overhaul.md` §2.1 Table B).

---

## 4. The unit set — OWED (the three inventories)

**Nothing in this section is delegable until it is filled from the companion artifacts.** The three
subsections are the three halves of the division, and each unit row must carry: the unit id, the
foundation element adopted (with its spec §), the fork-local artifacts eliminated (path + symbol), the
**consumer map** (every `src/**` importer, every `tests/**` importer named, `scripts/**`, config), the
**test disposition** (`ARCHIVE` / `REWRITE` / `KEEP` / `PROTECTED`), the **layer** each verification
covers, and the **gating prerequisite** if any.

### 4.1 The relocated-UI units

**OWED — `docs/specs/post-division-local-elimination-inventory.md`**

### 4.2 The foundation-adoption units (the mechanism wiring the fork must supply)

**OWED — `docs/specs/post-division-foundation-adoption-surface.md`**

### 4.3 The engine-delegation units

**OWED — `docs/specs/post-division-engine-offload-inventory.md`**

---

## 5. The gating constraints the proposal must carry (stated so no later pass re-derives them)

| # | Constraint | Citation | Effect on this rebuild |
| --- | --- | --- | --- |
| **G-1** | **The branch starts one-red.** `npm test` = 1 failed file / 200 passed (201 files), 1 failed / 4190 passed / 45 skipped / 4236; `typecheck` exit 0; `build` exit 0 — **measured by this pass at `b6791e0`**. The single red is the recorded APP-layer residual `P-SM-1` (`strat:stage-seam-schedule-single-active`) whose counterexamples are defect `PANE-TOGGLE-STAGE-COLLAPSE` | `docs/next-steps.md` (`U-STAGE-ACTIVE-TAB` row); `docs/defects.md` `PANE-TOGGLE-STAGE-COLLAPSE` | no unit may claim a clean trio until that row is dispositioned; every unit's DONE row states its own delta against this baseline |
| **G-2** | **The C9 `U-EDIT-1` unit is MID-CYCLE at `HEAD`** — spec landed, adapter `src/main/page-diff.ts` owed, the one-`applyBatch` commit owed, the live battery owed, three `SUPERSEDED` rows owed | `docs/next-steps.md` (`C9 U-EDIT-1` row, items (a)–(e)) | the rebuild inherits those open residuals; it must not silently re-scope them, and it must not delete `src/main/page-diff.ts`'s territory before that unit closes |
| **G-3** | **The engine authority switch is a PREREQUISITE CHAIN, not a tail**: `U-ENGINE-PERSIST` → `U-AUTHORITY-SWITCH` → `U-CORPUS-MIGRATION` → `U-READS-PIVOT`, each with a landed spec and no code | `docs/next-steps.md` §P2; `docs/specs/design-extensions-review.md` §13.1/§13.2 S4 | any engine-delegation unit that depends on the engine being authoritative is **BLOCKED-ON-ENGINE** until the chain lands |
| **G-4** | **THE CORPUS-LOSS CONDITION**: the engine persists nothing today, so without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` first, the operator corpus (226 documents / 6 102 nodes / 9 266 edges in the local store) is lost at the next restart | `docs/next-steps.md` (the condition block, C-1); `docs/HANDOFF.md` O-7 | **no rebuild unit may remove a local write path** while this holds — deletion of engine-delegated writes is gated, deletion of engine-delegated *reads/derivations* is not |
| **G-5** | **The `§5.U` delta matrix is FULL at 8** — live assertions enter as re-pins or extended rows, never new slots; `MATRIX_ROWS` must not change | `docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` §2; `docs/specs/design-extensions-review.md` §13.3 | every UI unit's live battery must re-pin, not extend |
| **G-6** | **The foundation's own greens are `[T]`/shim-layer only** and say so in its own rows — *"a node-suite green is ENVELOPE-green, not APP-green"*; several units record *"imported by NO `src/**` file"* and *"the optional real-DOM `[U]` row is NOT TAKEN"* | `../Provident-Electron/docs/FORKER.md` §4 (per-unit rows); `AGENTS.md` RCA-12 | **adopting a foundation unit imports its green as ENVELOPE-green and nothing more.** Each fork unit owes its own rendered/live evidence — a fork-side adoption may not cite the foundation's green as app evidence |
| **G-7** | **The foundation's mechanism modules are pure and total, with caller-supplied seams and declared degradations** — a fork that supplies nothing gets the *declared empty/degraded* answer, never an invented default | `../Provident-Electron/docs/guide/seams.md` (the REQUIRED/OPTIONAL table); per-unit spec §2.4 | **the fork's closures are the app's behavior.** A deletion that removes the fork's mechanism but supplies no seam is a silent behavior loss — every adopted unit's spec must enumerate its seam suppliers |

---

## 6. The governance this rebuild will follow (no new process invented)

1. **One unit = one full cycle.** Per the gate topology and RCA-2/RCA-5, **nothing is implemented
   inline and no two units share a cycle**: gate 1 (validity ∥ critique → architecture → change
   analysis) → spec → TestWriter red (reported) → implementer green → adversarial (read-only) + the
   read-only PBT audit → blind greens → live scenario (mandatory for UI units) → proofreader → doc
   review → trio → trackers.
2. **Adoption semantics (STEP 0).** Every unit whose contract names, parameters or vocabulary originate
   **outside this project** — which is **every unit in §4.2 by construction**, and any §4.1/§4.3 unit
   that carries an adopted name — MUST carry an adoption dossier
   (`docs/specs/<unit>-adoption-dossier.md`, ≤ 8 identifier rows, each with its source citation and
   STATUS). The gate-1 verdict vocabulary is closed: `PROCEED` | `APPROVE-WITH-CONDITIONS` |
   `BLOCKED-ON-SEMANTICS` | `FLAWED` | `REJECTED`; a unit with any undefined row is
   `BLOCKED-ON-SEMANTICS` and is escalated **in that pass**.
   **This is not ceremony — the foundation has already run this exact failure once.** Its
   `docs/specs/rca-cross-project-handoff-semantics.md` records the `threshold` incident: an adopted
   identifier crossed the boundary **as a name with no meaning**, was simultaneously a *legitimate
   injected value* on one side and a **banned vocabulary token** on the other, and cost a full gate pass.
   `../Provident-Electron/docs/specs/gutter.md` §2.2 P-5 / §3.4 R-1 and `gsession.md` §2.2 P-1/P-5/P-7
   list `selectors` / `threshold` / `data-zone` as **contraband** vocabulary. **The collision is
   expected, not hypothetical — and it is verified in both directions at this pass:**
   - **The ban's scope, read exactly:** `gsession.md` `R-1` scans **the module's own file** (comments
     included) and states the scope explicitly; the consumer's code is not what that row scans. **But
     `gsession.md` §2.2 P-7 / row 4 lists the REJECTED SHAPES as consumer-side too** — *"no
     document-delegated `pointerdown` · no per-event `closest(selectors)` · no capture at
     `pointerdown`"*.
   - **The fork does all three** (verified by grep at this pass, `data-zone` occurring in
     `src/renderer/index.html`, `src/renderer/renderer.ts`, `src/renderer/pane-drag.ts`,
     `src/renderer/pane-graph.ts`, `src/shared/dom-shim.ts`, `scripts/live-drive.mjs` and six `tests/**`
     files) — so adopting `U-GSESSION` forces the fork's delegated-selector pointer wiring to be
     **rewritten as local per-control attachment**, not merely re-pointed.

   **Consequence:** every adopted unit's dossier MUST carry a populated collision block — each adopted
   identifier checked against the consuming repo's prohibition/vocabulary rows, each hit reconciled **by
   row id** (`banned by row <R-id> for reason <Y>; legitimate in this layer because <Z>`) or **re-named
   by an explicit re-name request** — **never by relaxing a prohibition**.
3. **The elimination rule.** A fork-local artifact is eliminated only when (a) its replacement is
   landed, (b) its consumers are changed first (dependency order recorded per unit), and (c) the test
   disposition is recorded. **`tests/unit-v5-migration-contract.test.ts` pins several files BY PATH —
   any file pinned there is `PROTECTED` and immovable**, and the two §14.2 fence files
   (`tests/import-render-no-duplicates.test.ts`, `tests/traversal.test.ts`) stay green unchanged unless a
   unit's own gate re-plans the fence.
4. **The engine half never removes a write while G-4 holds**, and never claims engine-green as app-green
   (G-6).

---

## 7. Verdict request (gate 1)

This proposal asks the gate for: **validity** (is the division as described real, and is the elimination
authorised?), **critique** (what does it get wrong? — especially the unit boundaries, the consumer
ordering and the test dispositions), an **architecture review** (informed by both) of the unit topology
and the vendoring mechanism, and a **change-analysis verdict** over the program. It escalates:

- **Q-A** — the vendoring pin's enforcement level (§2: `A1` / `A2` / `A3`).
- **Q-B** — whether the rebuild lands as **one program of many units** (each unit its own cycle, the
  branch accumulating) or is **further split** per half (relocated-UI first, engine-delegation gated
  behind G-3/G-4).
- **Q-C** — the fate of the branch-start red (G-1): disposition `PANE-TOGGLE-STAGE-COLLAPSE` **before**
  the rebuild begins, or carry it as the recorded baseline.
- **Q-D** — every `BLOCKED-ON-SEMANTICS` row the adoption dossiers raise (they are escalated by name,
  with the open list attached, in the pass that finds them).

**No spec is written, no test is written and no code is changed on the strength of this file until the
gate returns and the architect gives the go-ahead.**
