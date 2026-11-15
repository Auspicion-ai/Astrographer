# L1 — unit `U-1b` `zone-collapse`: the statement, the derivation, the anchored control, the red set and the gates

**Layer:** L1 · **Date:** 2026-11-15 · **Ceiling:** 150 lines (D-2's design class) · **Write scope:** `docs/L1/`, and — by D-17's per-unit grant (§5) — two `docs/specs/` files, the `shell-chrome` files §2 lists, and the register cells it re-points.
**Status:** filed with `docs/specs/foundation-import-u1-change-analysis.md` (the item-8 gate's third step). **Second of the split's three units**, and **clause `C-4` of §2 is written only after change-analysis question 1 answers**; everything else here is independent of that answer and may be delegated as soon as `U-1a` lands.
**Markers:** `READ` = read in this pass by this pass. `RUN` = a command reading quoted with its runner (a delegated READ-ONLY measurer at head `161c614`, tree clean). `RECORDED` = measured elsewhere and quoted with its measurer.

## 1. The unit, and THE LAYER RULING (the opposite of `U-1a`'s)

- **The act:** zone collapse as a **statement the record may overturn over a derivation the fork already has**. Three parts: **(1) the statement** — an optional member on the zone record, absent = "nothing stated", present = the operator's word, written by the act alone (never toggled by deletion); **(2) the derivation** — where nothing is stated, a zone is collapsed **iff no enabled+placed pane names it**, read off the census the `is-empty` mirror already uses; **(3) the control** — the anchored hide arrow as a **SIBLING** of the zone container in the authored envelope, positioned against its own zone and overlaying its foot, with **no resize strip on a collapsed zone** (`../Provident-Electron/docs/guides/forking.md` §7.1, lines 476-498; change-analysis §2.1, §2.2, §2.6).
- **The remembered `size` is never touched** (`forking.md` §7.1, line 480-481): collapse writes no size, expansion costs zero writes.
- **THE LAYER RULING — `U-1b` runs the FULL nested loop: L1's contract, then L2 (`docs/L2/shell-chrome/`), then L3 (`docs/L3/shell-chrome/`), then L4, one module (`shell-chrome`), no sibling read (D-3, D-4, D-7).** Three reasons: **(a)** it authors a **behavioural I/O surface** — an act with an address and a write discipline, a derivation with a named input, and a paint with two axes — which is precisely what L2 designs and `U-1a`'s rename does not have; **(b)** its state member changes **shape** (a required total boolean becomes an optional statement), so a cell of `P-SM-2` must be re-derived by a layer that owns the module's state model, not asserted in one L1 pass; **(c)** unlike `U-1a` its evidence is **split across classes** — node arms for the derivation and the authored node, a G8 row for the paint — and only an L3 pass can state which guardrail note belongs to which (`RCA-12`).
- **Rejected alternative:** folding `U-1b` into `U-1a` as one L1-only unit, which is the fused `U-1` this re-shape exists to undo (change-analysis §3, RCA-2/RCA-5).

## 2. The change set

### `C-1` the optional statement (independent of question 1)

| Site | From → to |
|---|---|
| `src/renderer/layout-state.ts` `ZoneLayout` (`:57-60`) | `{ size: number; minimized: boolean }` → `{ size: number; collapsed?: boolean }` — **absence is the storable "nothing stated"**; `size` stays REQUIRED |
| `defaultLayout()` (`:136-149`) | the four zone seeds **omit** `collapsed` — a seeded `false` would make the derivation never fire (`ASM-U1b-2`) |
| `coerceZoneLayout` (`:127-133`) | **absence-preserving**: `collapsed` is copied only when it is exactly `true` or `false`; anything else is omitted |

### `C-2` the derivation

| Site | From → to |
|---|---|
| `src/renderer/pane-graph.ts` (`:384-394`, `:527-528`) | a zone's collapse state = `record.collapsed` when stated, else `counts[zone] === 0`; the mirror class becomes `is-collapsed` (plus `is-empty` unchanged) |
| `src/renderer/sidebar-panes.ts` (`:2104`, `:2242`, `:2289`) | the mirror re-derive reads the same predicate, so the runtime overlay and the assembly cannot disagree |
| the census | **`enabledZonePaneCounts` (`pane-graph.ts:209-218`) is the one predicate** — never the raw `layout.panes` overlay (`layout-state.ts:236-266`'s `enabledPlacedCounts` is the same fact in the projection path and must agree) (`ASM-U1b-3`) |

### `C-3` the act, and the control

| Site | From → to |
|---|---|
| `src/renderer/pane-graph.ts` (`:225-247`) | the zone container **no longer authors** its control as a child; a new `zoneCollapseControlOf(zone)` authors `{ id: 'zone-collapse-<zone>', zone: <zone> }`, `content: ''`, one shared `ZONE_COLLAPSE_HANDLER` name, inserted as the container's **immediate following sibling** with the gutter family's idempotence scan (`:588-596`) |
| `src/renderer/sidebar-panes.ts` (`:3474-3487`) | the act writes **one leaf** at the zone's address: `collapsed: !stated-or-derived` → the record always carries an **explicit `false`** when the operator expands a derived-collapsed zone; `size` untouched; ONE `setLayout` write |
| `src/main/preload.ts` (`:105-106`, `:343`, `:661-662`) + `sidebar-panes.ts` (`:3290-3294`) | the seam is re-grained to the collapse verb (`zoneCollapseToggle`), and `paneTabExpand` follows `C-5`'s shape |
| `src/renderer/index.html` (`:242`, `:249-250`) | the paint family: `is-collapsed` + the control's own fixed box read off `--zone-<zone>-track` (anchored by `#app`'s `contain: layout`, `:126-132`), its glyph by the adjacent-sibling combinator on the container's painted attribute; a collapsed zone's gutter affordance is **hidden, never deleted** (`::before`-style rule, so no box moves) |

### `C-4` the collapsed EXTENT — **Q1-GATED, not written until change-analysis question 1 answers**

- If Q1 answers **"one collapsed state"**: `auto` on the zone's fixed axis, `hidden` on its arrangement axis, no `DEFAULT_ZONE_COLLAPSED_SIZE` (refused by the foundation as a second authority, `forking.md` §7.1 line 483-484).
- If Q1 answers **"two states"**: this clause is **never written**, the fork's tab strip keeps its own extent, and the empty-zone extent stays F-3's `0px` (`layout-state.ts:367-372`, `index.html:154-157`) — **no `auto`/`hidden` rule is ported at all** (change-analysis §2.6).

### `C-5` the state vocabulary — **Q1-GATED in part**

- Under **"one collapsed state"**: `minimized`/`data-minimized`/`is-minimized` are **absorbed** into `collapsed`, and the seam's old name disappears.
- Under **"two states"**: `is-minimized`/`minimized` **stay** as the fork's own app-level names (D-14's app-level carve-out) and `collapsed` is the new, distinct member (`ASM-U1b-6`).
- Either way: the `isGutterResizable` gate's body (`pane-gutter.ts`, `RECORDED` by `tests/unit-zone-replacement-register.test.ts:2859-2860`) and the driver-contract rows that read `/is-minimized/` (`tests/live-drive-contract.test.ts:2722`, `:2908`, `:3152`, `:4485`) re-grain **in this unit**, never later (D-14/D-16).

## 3. The red set — `RUN` and reported BEFORE any byte (RCA-1)

**The unit's OWN row:** `tests/integration/shell-chrome/zone-collapse-target.test.ts`, authored by `role_l1_test_writer` from §2 and RUN at the pre-edit head. Limbs, each red at this head:

- **`A` the derivation's three arms** — an empty enabled+placed census with nothing stated ⇒ collapsed; the same census with `collapsed: false` stated ⇒ **expanded** (the statement wins); an occupied zone with `collapsed: true` stated ⇒ collapsed. `READ` head: the member is required and total, so arm 2 and arm 3 are unrepresentable (`layout-state.ts:57-60`, `:127-133`).
- **`B` the seeds** — `defaultLayout()` carries **no** `collapsed` member on any of the four zones (`READ` head: four `minimized: false` seeds, `:141-144`).
- **`C` the act's write discipline** — one press writes **one** explicit final value (`false` and `true` both, never a delete), `size` reads byte-identical before and after, and a second press returns to the record it started from.
- **`D` the authored control** — for each of the four zones, the control node exists **exactly once**, is the container's **immediate following sibling** (`children[indexOf(container) + 1]`), carries `props.zone` and `content: ''`, and a **second assembly adds no duplicate** (the idempotence arm, driven on its own — the gutter family's rule, `pane-graph.ts:588-596`).
- **`E` `P-SM-2`'s member cell, re-grained** — the coerced `LayoutState`'s zone members are `{ size: finite-positive, collapsed?: boolean }` with `collapsed` **absent** when nothing was stated (`docs/specs/unit-u-shell-1-layout-zones.md:252` as re-grained). **This cell is RED at the head** — the shipped row pins `typeof minimized === 'boolean'`.
- **`F` the state-vocabulary census** — `is-collapsed` present and the old paint token absent *under the arm `C-5` writes*; the driver's source carries the same vocabulary; the two register cells of `C-5` are re-grained and read RED before the bytes.
- **`G` the absent second authority** — no `DEFAULT_ZONE_COLLAPSED_SIZE`-shaped constant, and no `size` write anywhere in the collapse path (a source-clause census; `forking.md` §7.1).

**The pre-recorded owed acts, not reds:** `P-TH-SM-1(f)`'s `src/main/preload.ts` row is **re-recorded** in this unit (reason + unit + superseded value kept visible) — it reads **MATCH** at this head (`RUN`: 7/7) and moves **after** §2's bytes, and the new digest is **measured at the landing's head, never inferred**; `src/renderer/sidebar-panes.ts` is re-recorded **again** only if Q1's answer renames the member (`C-5`), i.e. three re-statements across the split, each naming its unit (change-analysis §2.8).

## 4. The gates, and the evidence class of each

| # | Gate | What it can supply |
|---|---|---|
| `G1` | §3's red set, `RUN` and reported | envelope/harness — the failing-cell census |
| `G2` | the trio | envelope/harness; the shim is layout-less (D-10) |
| `G5` | read-only adversarial pass (RCA-3): a stated-vs-derived disagreement, a `size` mutated by the act, a control duplicated by re-assembly, a zone with panes but a stated `true` | findings recorded in this contract; host findings fixed + regression-tested; package findings to `docs/defects.md`/`HANDOFF.md` (D-9) |
| `G6` | blind greens by an agent that did not write the unit (D-5) | envelope, except the rows labelled assembled-app |
| `G7` | proofreader + per-unit documentation review (RCA-6) | document layer; the two granted spec files reconciled here |
| `G8` | `node scripts/live-drive.mjs` on a usable display — **mandatory pre-DONE** (RCA-11) | **the assembled app, and the ONLY reading of: the anchored control's box over a collapsed extent and its hit-testability, the glyph, "a collapsed zone offers no resize strip", and (under `C-4`) the collapsed extent itself.** No node row in this unit may claim any of the four |

- **Not applicable, said rather than skipped:** `G3`/`G4` — no vendor byte, no lock key (D-11).

## 5. Write scope, D-17's grant, and what the DONE row must carry

- **Module:** `shell-chrome` — `src/renderer/{layout-state,pane-graph,pane-drag,pane-gutter,sidebar-panes,renderer}.ts`, `src/renderer/index.html`, `src/main/preload.ts`, `scripts/live-drive.mjs`, `tests/integration/shell-chrome/**`, and the three register files §2 re-points.
- **D-17 grant, per document:** `docs/specs/unit-u-shell-1-layout-zones.md` (the `P-SM-2` member cell, the C12 clauses at `:94`, `:112`, `:145`) · `docs/specs/user-flow-audit-checklist.md` (`UF-LAYOUT-10`/`UF-LAYOUT-12`) — **those cells and nothing else.** Never `strata/`, the trackers, `docs/L1/foundation-import-program.md`, or either other unit's granted files.
- **The DONE row must state:** question 1's answer and which of `C-4`/`C-5`'s arms it wrote · the red set as `RUN` with its colour · the derivation's three arms · the act's one-write discipline and the `size` byte-equality reading · the control's adjacency + idempotence arms · the `preload.ts` re-record with its superseded value · **which layer each reading covers**, with the four G8-only rows named as G8-only (D-10, RCA-12).

## 6. Assumptions, each with the alternative it rejected

- **`ASM-U1b-1`** — absence is **storable** and means "derive"; the act always writes an explicit value and **never deletes** (`forking.md` §7.1, lines 476-479). **Rejected:** deleting the member to mean "back to the derivation" — it makes an operator's expanded-empty zone indistinguishable from an unstated one, which is the bug the statement exists to fix.
- **`ASM-U1b-2`** — `defaultLayout()` **omits** the member. **Rejected:** seeding `false` four times, which states "expanded" for every zone and switches the derivation off in every fresh profile.
- **`ASM-U1b-3`** — the derivation's predicate is the **enabled+placed** census (`enabledZonePaneCounts`, `pane-graph.ts:209-218`). **Rejected:** the raw `layout.panes` overlay (`layout-state.ts:236-266`'s sibling reading), which ignores fallback placement and would let the collapse state disagree with the `is-empty` mirror the same CSS already keys on — the two-candidate-predicate hazard the critique raised.
- **`ASM-U1b-4`** — the **empty** zone's extent stays F-3's `0px` track; this unit adds no extent rule for it. **Rejected:** porting the foundation's `auto`/`hidden` over it, which would make two mechanisms author one extent and put a live-`PASS`ed defect fix (F-3) behind a port.
- **`ASM-U1b-5`** — the control is a **root-level sibling** with its own fixed box off the track tokens. **Rejected:** the child placement the fork ships (buried at a `0px` extent — `index.html:191-195` + `:154-157`), and an absolutely-positioned child inside the container (clipped by the container's own `overflow`, `:191`).
- **`ASM-U1b-6`** — under a **two-state** answer `minimized`/`is-minimized` **keep** their fork names as app-level vocabulary (D-14's carve-out for the fork's own names, `forking.md` §10). **Rejected:** renaming them to `collapsed` anyway, which would give one name two authors — the critique's blocking row and the reason `C-5` is gated.
- **`ASM-U1b-7`** — the unit's own row lives at `tests/integration/shell-chrome/` (measured to exist) and not `tests/e2e/` (measured **ABSENT**, unclaimed by any module — `ASM-L1-4`).

## 7. Acceptance

`U-1b` is accepted when §3's red set was **RUN and reported** before any byte, §2's clauses landed as **one** commit (`C-4`/`C-5` in the arm question 1 authorises), `G1`/`G2`/`G5`/`G6`/`G7` are recorded with their classes, `G8` carries the four app-only rows, and `U-2`'s interface (`docs/L1/foundation-import-program.md` §5) reads the collapse carrier and the seam it authors.
