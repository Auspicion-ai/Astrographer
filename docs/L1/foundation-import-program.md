# L1 — the foundation-import program: unit map, order, interfaces and gates

**Layer:** L1 · **Date:** 2026-11-15 · **Ceiling:** 150 lines (D-2's design class) · **Write scope:** `docs/L1/`, `strata/modules.json` (D-3)
**Status:** the map and the program design are filed; **no unit is admitted and no implementation is claimed** (`brief.md` §5, `next-steps.md` row 1).
**Markers:** `READ` = read in this pass from the named file, by this pass; `RECORDED` = a figure measured elsewhere and quoted with its measurer. This pass **ran no leg and holds no shell**, so it states no reading of its own (D-2).
**Layer declaration (mandatory):** nothing here is app-green, envelope-green or instrument-green; the **live leg is the only assembled-app reading and a node-suite green is envelope-green** (D-10).

## 1. The program, as ruled (not re-opened)

- Three surfaces become units — (a) the pin restatement, (b) the vendored conformance copies, (c) the layout/UI port — and **surface (d), the record families, is a later program with no unit here** (D-13, D-15; `pending.md` row 1).
- (c) writes through **the fork's own carriers**: the operator-settings `layout` slice for pane and zone geometry, **never the foundation's view record as a geometry authority** (D-15).
- D-16's **full rename lands inside the unit that changes the behaviour**: `LayoutZoneName` = `top|bottom|left|right`, the `[zone=]` carrier and the track variables, the `zone:` ids, and every row naming the old spelling — never a separate sweep (D-16, D-14).
- **No unit claims evidence its instrument cannot supply**: the conformance leg supplies no behaviour evidence at all, and the drift leg is a byte/revision oracle (D-11, D-10).
- **No unit edits `provident-ssr`, `provident-editable` or `../Provident-Electron/`**; a gap is catalogued in `docs/defects.md` + `docs/HANDOFF.md` and never patched (D-9).

## 2. The module map — two modules, and why exactly two

| Module | Paths it owns (`strata/modules.json`) | Units | Endpoints `N` | Cap `50+10N` |
|---|---|---|---|---|
| `foundation-vendor` | `vendor`; the four flat pin registers (`tests/pd-vendor-{set,manifest,drift,pin-refresh-register}.test.ts`); `tests/{unit,integration}/foundation-vendor` | `V-1`, `V-2` | 3 | 80 |
| `shell-chrome` | `src/renderer`; `src/main/{preload,main,app-menu}.ts`; `src/shared/types.ts`; `scripts/live-drive.mjs`; the four flat shell registers; `tests/{unit,integration}/shell-chrome` | `U-1`…`U-4` | 26 | 310 |

- **Why two and not six.** `READ` in this pass: the four shell units write **one shared file set** — `pane-graph.ts`, `index.html`, `sidebar-panes.ts`, `renderer.ts`, `layout-state.ts`, `pane-drag.ts`, `preload.ts` — so any finer split would put **one unit inside two modules**, which D-7's one-module-per-agent rule forbids; the intake measured the same non-separability for (a)+(b) and (c)+(d) (validity review, the not-file-separable row; the fork's shared-file sequentiality rule).
- **`N` counted, not asserted** (`platform.md` §4, `READ` from the imports): `foundation-vendor` = **3**, the exported functions of this repo's own drift instrument the register calls (`compareFoundation`, `isRegularFile`, `foundationRevision`) — the closest of that rule's three categories to an instrument surface; `shell-chrome` = **26** = **6** MCP tools that drive the surface (`dispatch`, `get_rendered_html`, `get_markdown`, `list_targets`, `get_node_state`, `focus`) + **14** vendored exports it calls (`computeTrackVars`, `isEmpty`, `project`, `applyProjection`, `containerDeclarationFor`, `createResizeController`, `clampToBounds`, `createGestureSession`, `cursorDeclarationFor`, `domEventSource`, `withinProximity`, `overlayTransition`, `resolveTheme`, `applyThemeDeclaration`) + **6** preload bridge methods (the four `sidebar` seams + `operatorSettings.get`/`set`).
- Each path is claimed by one module only; a module's agent reads a sibling's surface through the L2 interface, never its code (D-7).

## 3. The units

### `V-1` `pin-restate` — module `foundation-vendor`
- **Behaviour:** none rendered. The pin moves to the adjacent tree's head in **five value lines across four files** (the lock's `commit`, its embedded `digestCommand`, the three `PINNED_COMMIT` constants) **plus `measuredAt`**, and **one dated clause + two clause-count assertions** move with it (D-11; `unit-pd-vendor-pin-refresh.md` §1.1; validity review §(a)).
- **The revision is READ at the unit's own run** (`git -C ../Provident-Electron rev-parse HEAD`) and **never copied** from this file, a tracker, a row or an abbreviation (`unit-foundation-rerevendor-2026-10-04.md` §3 `F-8`).
- **Files:** `vendor/foundation.lock.json` (the three `foundation` keys) · `tests/pd-vendor-{set,manifest,drift}.test.ts` (the value line only, exactly one declaration each) · `tests/pd-vendor-pin-refresh-register.test.ts` (`§4` row 2's two counts `.toBe(3)` → `.toBe(4)`, the pre-recorded owed register act) · `docs/specs/unit-pd-vendor-pin-refresh.md` (ONE dated re-anchoring clause inside the anchored `§4` region, the carve-out its `§1.2` item 10 authorizes) · **`tests/integration/foundation-vendor/pin-restate-target.test.ts` (the unit's own red row, limbs `A`…`F`: the lock's pin against the HEAD read at run time, the run day, the one-literal `digestCommand`, the three constants' agreement, the `§4` clause count and its coupling, and the fifteen blobs)** · **`docs/L1/unit-v-1-pin-restate.md` (the unit's contract: change set, red set, gates with their evidence class, the L1-only layer ruling, and every reading with its runner)** (D-2, D-11, D-17).
- **Pre-edit gate:** the per-module blob read at the new revision, **all fifteen**; a differing blob is the **STOP** that makes the act a re-vendor decision rather than a refresh (`unit-pd-vendor-pin-refresh.md` §2) — and because `src/shared/**` is claimed by **no module** except `types.ts`, a fired STOP **escalates for a map amendment before any byte moves** (D-7).
- **Battery:** red set RUN and reported before any byte (RCA-1) — the register's `P-IM-pd-pin-1`, the set suite's revision arm, with `P-SM-pd-pin-2`/`P-TP-pd-pin-3` left `held`; then **ONE atomic commit**; then the trio; then `npm run drift` reading `CLEAN` **with `revisionChecked === true`**; then `npm run conformance`'s class tally with **no green word** (D-11).
- **Named, not hidden:** the revision arm re-reds on the foundation's next commit **by design** and may never be made revision-tolerant (D-11); the two store-adopt anchors stay parked (`pending.md` row 1); the lock's **`baselines` block and the fifteen `provenance` cells stay OWED** — this program owns neither and no unit may report them discharged (validity review; `unit-pd-vendor-pin-refresh.md` §9 `E-10`/`E-11`); five active documents state the pin present-tense and go stale in the same commit, so the doc-review gate owns them (critique review).

### `V-2` `conformance-refresh` — module `foundation-vendor` · depends on `V-1`
- **Behaviour:** none rendered. The copies are **re-derived at the pinned head**: the 11 included suites and the 4 `X-1` exclusions re-derived there (the universe grew, so the split is re-derived, never re-copied), each copied suite refreshed to the pinned commit's blob, and the lock's `conformance` block restated (validity review §(b); D-11).
- **The instrument the intake measured as missing is built here:** per copied suite, `md5(copy)` equals `md5(git show <lock commit>:tests/<suite>.test.ts)` — the same blob oracle the set suite already drives (validity review §(b), blocking).
- **Every suite outside the base universe gets an explicit disposition** (`NOT-ADMITTED` / `OUT-OF-UNIVERSE` with its reason), so none is silently skipped (`unit-foundation-rerevendor-2026-10-04.md` §2.3).
- **Files:** `vendor/Provident-Electron/tests/*` · `vendor/foundation.lock.json`'s `conformance` block · a new register under `tests/integration/foundation-vendor/`.
- **No green word, ever:** the leg's pass condition stays the class-labelled tally, **3 of its 11 suites collect zero tests** (`RECORDED`), and the lock carries **no suite digests** (`READ`: its `conformance.included` is names only) — so the unit reports the tally and its blob arms, never a behaviour claim (D-11; `unit-pd-vendor-foundation-mechanisms.md` §3.5 items 4/7).

### `U-1` `zone-vocabulary` — module `shell-chrome` · the rename and zone collapse
- **Behaviours in:** `LayoutZoneName` = `top|bottom|left|right` with its enumeration, its total guard, `GUTTER_ZONES`, `PANE_ZONE_NAMES` (`pane-drag.ts`, whose behaviour `U-3` owns and whose VOCABULARY this unit moves) and both `Record` literals; the `[zone=]` carrier and the track variables keyed by the foundation's names; **the state members D-16 derives from D-14** — the zone's `minimized` becomes `collapsed`, and its `data-minimized` prop and `is-minimized` mirror class re-grain with it, while a genuine semantic difference is escalated rather than renamed; and **zone collapse as a DERIVATION the record may overturn** — collapsed iff no pane names the zone, an act writing `false` rather than toggling absence, the **remembered `size` never touched**, and a collapsed extent of `auto` on the zone's fixed axis and `hidden` on its arrangement axis (D-16, D-14; `forking.md` §7.1).
- **The anchored hide arrow:** the zone-collapse control is positioned against its own zone and overlays the zone's foot; a collapsed zone offers no resize strip (`forking.md` §7.1).
- **The theme carrier `[theme="dark"]` lands here**, because this unit authors the first ported chrome rules that read it: the vendored theme helper **takes the attribute name as a caller argument**, so the fork's adapter's write site moves with the carrier, and the theme register's selector **and** absence arms re-grain in the same commit (D-14; `READ`: `src/renderer/theme.ts`, `tests/pd-ui-1-theme-register.test.ts`).
- **Files:** `src/renderer/{layout-state,layout-vars,layout-zone-geometry,pane-gutter,pane-graph,pane-drag,sidebar-panes,renderer,theme}.ts` · `src/renderer/index.html` · `src/main/preload.ts` (the renamed zone seam) · `scripts/live-drive.mjs` (the `54 src / 19 test / 43 driver` `data-zone` counts and the `149` `LayoutZoneName` matches are the intake's `RECORDED` readings; this pass re-measured only `82` `LayoutZoneName` matches under `src/`).
- **Rows re-grained in the same unit:** `unit-u-shell-1-layout-zones.md`'s register rows **`P-IM-1`** (the total zone-name predicate) and **`P-SM-2`** (the coerced state model) **plus the model and `zone:` ids it spells** — this is what D-16's `P-IM-1`/`P-SM-2` names · `unit-zone-replacement.md` `R-9` + §2.1(g)'s enumerations + its register rows `P-IM-zone-repl-1` / `P-SM-zone-repl-3` · `unit-zone-replacement-greens.md`'s declaration rows (`E-03`…`E-05`) · `user-flow-audit-checklist.md` `UF-LAYOUT-1`/`UF-LAYOUT-2` (the `provident.list_targets` `zone:` nodes) · `tests/unit-zone-replacement-register.test.ts` · `tests/pd-ui-1-theme-register.test.ts` · `tests/unit-live11-bridge-seams.test.ts` · `tests/live-drive-contract.test.ts` (D-16).
- **The stage's own node id is not a `LayoutZoneName` and does not move** (D-16 names the four pane zones).
- **Out of this program's behaviour set, stated rather than implied:** §7.1's cosmetic rows — the rotated lane's reading order, the head's logical padding, the scrollbar stroke — are **not** in the ruled behaviour list, so no unit carries them (`forking.md` §7.1's cosmetics clause; D-13's surfaces are the ruled scope).

### `U-2` `pane-head` — module `shell-chrome` · depends on `U-1`
- **Behaviours in:** the pane control **bar** — a head ROW holding the grip, the pane name and the collapse control, the drops as the grip's children and the control **beside** it, never inside the grip; **the head out of the scroller** (the pane is a column, the head its fixed first item, the body the only scroller, so the head adds nothing to `scrollHeight`); **pane collapse as ONE leaf write** read off the node's `props.pane`, the paint taking the adjustable axis to `auto` and the body's scroll to `hidden` with fill and figure untouched; the stage pane as the third arm; collapse **surviving a relocation**; **the pane's minimum being its head** (a drag cannot beat the head's `min-content`, and the renderer does not floor a record write); **the gutter handle as a short centred pill over a divider line** — `min(48px,100%)` on the long axis, `7` on the thin, quieter than its `::before` line, its hover target still the whole lane (`forking.md` §7.2, §7.5, §7.6).
- **Files:** `src/renderer/pane-graph.ts` (the head/grip/collapse/drop nodes) · `src/renderer/index.html` (their CSS) · `src/renderer/sidebar-panes.ts` (the collapse seam's leaf write) · `src/renderer/renderer.ts` (head-only pointer capture).
- **No hand-written DOM:** every element is envelope data at the authoring site and `index.html` carries CSS only (D-8).
- **Interface to `U-3`:** the grip's four `.pane-drop` children carry the `pane`/`zone` operands, and the head carries `props.pane`.

### `U-3` `pane-move` — module `shell-chrome` · depends on `U-1` and `U-2`
- **Behaviours in:** a placement is `(zone, place among that zone's panes)`; the per-pane `index` (the fork's `order` renamed, D-16) with **absence sorting at the pane's DECLARED place**; a placement equal to the record's is a **no-op**; the write is **ONE whole-family write** at `['panes']` — the moved pane's `zone` plus every pane's recomputed `index`; **relocation is a DRAG** (press the grip, drag toward a zone, see the target, release), the `zone` member being what relocates; a zone's form is inherited **BY POSITION** (`zone-format` reference through `fitReference`/`applyDerived`, `pane-in-<zone>`, the stage's provider at the app root); crossing a boundary N times leaves the tree as if once; a relocated pane paints the record's declared figure, never the handle's last position (`forking.md` §7.3, §7.4).
- **Files:** `src/renderer/pane-drag.ts` · `src/renderer/pane-graph.ts` · `src/renderer/sidebar-panes.ts` · `src/renderer/layout-state.ts`.
- **A semantic difference escalates, it is never renamed silently**: where `minimized`/`collapsed` or `order`/`index` differ in MEANING and not only in spelling, the unit returns an adjudication (D-16's own clause).

### `U-4` `menu-opener` — module `shell-chrome` · serialised after `U-1`
- **Behaviour:** the View menu carries an opener item **carrying NO role**, routing to the app's own overlay opener; the pane-catalog submenu and the fork's own menu enumeration stay the fork's, and the foundation's Electron template is **not copied** (`forking.md` §9, §10; `docs/FORK-DIVERGENCE.md` row 7 / SC-7).
- **Files:** `src/main/app-menu.ts` · `src/main/main.ts` · `src/shared/types.ts` (the channel/rpc constant) · `src/main/preload.ts` · `src/renderer/renderer.ts` (the handler) · a new suite under `tests/unit/shell-chrome/`.
- The native menu bar is the shell's own chrome, so this unit writes **no graph node** (D-8's carve-out).

## 4. Order, and every dependency stated

**`V-1` → `V-2` → `U-1` → `U-2` → `U-3` → `U-4`.**

| Edge | Why it exists |
|---|---|
| `V-1` → `V-2` | the copies are read at the pin `V-1` lands, and **both write the lock**, so they are sequential and never one commit (D-11; the re-vendor contract's carry-rule (b)). |
| `V-1` → `U-1`…`U-3` | each shell unit records the landed pin as its provenance revision, because **provenance anchoring runs (a)→(c)** (validity review). |
| `U-1` → `U-2` → `U-3` | the renamed domain is what the later units read, and `U-3` consumes `U-2`'s authored drops and `props.pane` (D-16, D-7). |
| `U-1` → `U-4` | `preload.ts` / `renderer.ts` / `types.ts` are shared, so they have **at most one writer at a time** (the fork's shared-file sequentiality rule). |
| **no edge from (d)** | no shell unit waits on the record families and none may assume a view record (D-15). |
| **item 8 → `U-1`** | the intake's two reviews stopped at **ADJUDICATION**, and `U-1` moves the **MCP-visible** `zone:` target vocabulary, i.e. the repo's contract — so the third review (change-analysis) is owed **before `U-1`'s code**, per `AGENTS.md` item 8 as `ASM-3` carries it (D-16). |

## 5. Interfaces each unit hands the next

- **`V-1` → `V-2`:** the lock's `foundation.commit` and `measuredAt` — the revision every copy is read from.
- **`V-1` → the shell units and their registers:** a **recorded revision only** — nothing flows forward as a value, with one **text read**: `tests/unit-zone-replacement-register.test.ts` parses the vendor file's `PINNED_COMMIT`/`PINNED_FIFTEEN` declarations, so `V-1`'s act stays a **value move that keeps both declarations' shape** (`READ`), and the shell module reads a sibling's file — a read, never a write (D-7).
- **`U-1` → `U-2`, `U-3`:** the four zone names · `[zone=]` · the track-variable family · the zone container's `collapsed` carrier · the zone-collapse act's seam name.
- **`U-2` → `U-3`:** an authored grip with four `.pane-drop` children (`pane`/`zone` operands) · the head's `props.pane` · the collapsed paint's axes, so a relocation carries `collapsed`.
- **Every shell unit → the live leg:** `scripts/live-drive.mjs`'s vocabulary is **`U-1`'s**, and the driver is **read-only** to `U-2`…`U-4` (D-10).

## 6. The gates, and the evidence class each supplies

| # | Gate | Evidence class |
|---|---|---|
| G0 | **the item-8 change-analysis for the MCP-visible `zone:` vocabulary**, owed before `U-1`'s code (`AGENTS.md` item 8 via `ASM-3`; D-16) | document layer |
| G1 | **red set RUN and reported per unit before any byte** (`AGENTS.md` item 3, RCA-1) | envelope/harness |
| G2 | **the trio** `npm test` / `npm run typecheck` / `npm run build` (item 4) | envelope/harness — the node suite runs under a layout-less DOM shim (D-10) |
| G3 | `npm run drift` (`V-1`, `V-2`) | a `[D]`-class byte/revision oracle; **proves nothing about behaviour** (D-11) |
| G4 | `npm run conformance` (`V-2`) | a class-labelled tally; **supplies NO behaviour evidence** (D-11) |
| G5 | **read-only adversarial pass per unit** (item 10c, RCA-3) | findings recorded in the unit's spec; host findings fixed + regression-tested here, package findings to `docs/defects.md`/`docs/HANDOFF.md` (D-9) |
| G6 | **blind greens** by an agent that did not write the unit, from the documentation only (item 10a, D-5) | envelope — except a row labelled assembled-app |
| G7 | **the proofreader's audit + the per-unit documentation review** (items 10b/10d, RCA-6) | document layer |
| G8 | **the live leg** `node scripts/live-drive.mjs` on a usable display — **mandatory pre-DONE for `U-1`…`U-3`** (RCA-11); for `U-4` the native menu bar is a **parked surface with its recorded reason** (no DOM/CDP surface reaches it), and for `V-1`/`V-2` a **recorded structural refusal** (they render nothing) — parked-by-default is the failure RCA-11 closes (D-10) | **the assembled app — the only reading that is app-green** |
| G9 | **per unit, its contract before delegation (item 9) and its spec/tracker rows in the same pass (item 5)**; the DONE row states **which layer each reading covers**, and a `SKIPPED`/byte-only drift reading is never cited as a pin pass — and the unit's acceptance path is L0's blind walkthrough (D-5, D-10, D-11) | document layer |

- **Per-unit battery, stated once:** `V-1`/`V-2` = the pin registers + the blob arms + the two legs (G3/G4); `U-1` = the zone-replacement register re-grained (adoption wiring, census record, write discipline, shell declaration clauses) + the new derivation arms + the theme register; `U-2` = node arms over the authored head/grip/collapse nodes plus the source-clause census for the paint rules; `U-3` = the placement/no-op/family-write arms plus the zone-form-by-position arm; `U-4` = the template-shape arms. **A paint rule's effect is a G8 row, never a node assertion** (D-10).

## 7. What no unit may do

- **Claim a green its instrument cannot supply** — a node green is envelope-green, the drift and conformance legs are instruments, and only the live leg sees the assembled app (D-10, D-11).
- **Leave two vocabularies in the tree** — the rename travels with the behaviour in the same commit (D-14, D-16).
- **Introduce hand-written DOM** — every element outside the shell's own chrome is provident data at the envelope site, and `index.html` keeps CSS only (D-8).
- **Change a package or the adjacent tree** — a gap is a finding (D-9). **No unit bumps `provident-ssr`**: the intake record reads the `0.5.1 → 0.5.2` move as an *engine prerequisite* while the validity review measures that the delta is **not shown to gate** the port (`READ` at `node_modules/provident-ssr`), so the two readings stand in conflict, the premise is nobody's to assume, and a behaviour the 0.5.1 surface cannot express is catalogued as a finding (D-9).
- **Adopt the foundation's view record as a geometry authority** (D-15).
- **Touch the two store-adopt anchors or the record families** (D-15; `pending.md` row 1).
- **Report a clean trio while a carried red stands** — the pin's revision arm goes red on the foundation's next commit by design (D-11).

## 8. Assumptions this design takes (each with the alternative it rejected)

- **`ASM-L1-1`** — the track-variable **family** stays the fork's (`--zone-<zone>-track`, `--zone-<zone>-size`) keyed by the foundation's members, and the foundation's per-zone anchor names are adopted for the anchored hide arrow. Rejected: replacing the track tokens with the foundation's anchor-only vocabulary, which deletes the grid's track arithmetic and the register's teeth with it (D-16, D-14).
- **`ASM-L1-2`** — the zone seam is renamed with the member it writes (a collapse-named seam in place of the fork's minimize-named one). Rejected: keeping the old seam name, which leaves a `minimize` word reading a `collapsed` state (D-14, D-16).
- **`ASM-L1-3`** — **two modules and no more**. Rejected: a per-behaviour module split, which would put one unit across two modules (D-7).
- **`ASM-L1-4`** — a unit's diff-scope `--changed` list is **its module's code and test files**; the corpus acts a unit takes (`docs/specs/**` — including `unit-pd-vendor-pin-refresh.md`, `unit-zone-replacement.md`, `unit-zone-replacement-greens.md`, `unit-u-shell-1-layout-zones.md`, `user-flow-audit-checklist.md`), the trackers and L1's own `tests/e2e/` are **their layer's artifacts, outside every module claim** — and the unit's DONE row lists them. A lint run over the **full** change set therefore reports those files as owned by no module: **stated, not hidden** (D-3, D-7).
- **`ASM-L1-5`** — **no unit carries §7.1's cosmetic rows** (the rotated lane, the head's logical padding, the scrollbar stroke). Rejected: folding them into `U-1`/`U-2`, which would widen the ruled behaviour list L0 put to the user (`forking.md` §7.1; D-13).

## 9. The exit condition, and what L2 receives

- The map is **green** when this file and `strata/modules.json` are filed, `strata-lint`'s **module and diff-scope checks** pass for `modules.json` (a path claimed once, an `N` per module), and every unit above can name its red set (D-7, `platform.md` §4). This design artifact itself sits **outside** the lint's registry (`strata/brief.md`, `decisions.md`, `records/`, the trackers), so its own ceiling, citations and provenance are checked **by hand** against `D-2`'s rules — stated rather than assumed.
- L2 receives, per module, the paths it owns, the units with their order and interfaces, and the evidence class of every gate; L1's e2e battery is these units' batteries plus the live leg, and it is **not authored in this pass** (D-3, D-4, `brief.md` §4).
