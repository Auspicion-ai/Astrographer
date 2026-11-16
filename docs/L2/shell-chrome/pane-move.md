# L2 — `shell-chrome` / `U-3` `pane-move`: the integration design of one behaviour

**Layer:** L2 · **Date:** `2026-11-15` · **Ceiling:** 120 lines · **Module:** `shell-chrome` (`N` = 26, cap `50+10N` = 310) · **Unit contract:** `docs/L1/unit-u-3-pane-move.md` (authority) under `strata/decisions.md` D-13/D-17.
**Markers:** `READ` = read in this pass, file and line named. `RECORDED` = measured elsewhere, quoted with its measurer. `RUN` = a command with its runner.
**Layer declaration (D-10/RCA-12):** nothing here is app-green or envelope-green. The node row is **envelope-class** under the layout-less shim; the drag, the reveal of an EMPTY zone, the inherited class arriving through `applyDerived` and the drop's committed box are **`G8`-only**.

## 1. The module's role, and the boundary of this behaviour

`shell-chrome` owns the shell's layout/UI surface. For `U-3` the behaviour is **the placement law, ONE whole-family write, the drag with its scoped projection, and the form inherited by position** — and the module's paths split four ways:

| Path (claimed by `shell-chrome`) | Takes part? | Why |
|---|---|---|
| `src/renderer/layout-state.ts` | **yes** | `PaneLayoutEntry.index` becomes OPTIONAL, the coercion preserves absence (`READ` `:251` — the reading's array position is the defect D-262 names), and the ONE law is exported here because this is the module's state model and `pane-drag.ts` already imports it (no cycle) |
| `src/renderer/pane-drag.ts` | **yes** | the ONE act-shaped pure export (a pane's effective placement), `movePane`'s OPTIONAL 5th (declared-places) parameter and its two sibling sorts, the discriminating admission in the private `measuresWithinSnapThreshold` (`READ` `:228-235`) |
| `src/renderer/pane-graph.ts` | **yes** | `resolveEnabledZonePanes` becomes the law's reader (`READ` `:230-250`); the `zone-format` provider/consumer/stage authoring (`READ` `:426-454`, `:698-713`, `:715-722`, the root at `:780-784`) |
| `src/renderer/sidebar-panes.ts` | **yes** | `commitPaneDrop`'s order: placement → ONE composed word (zone + place) → the zone-first gate → ONE `setLayout` (`READ` `:3591-3622`) |
| `src/renderer/renderer.ts` | **yes** | the projection's candidate set — the `.pane-drop` skip and the required `data-orientation`/`zoneOrientation(zone)` discriminant (`READ` `:791-810`) |
| `src/renderer/index.html` | **yes** | CSS only (D-8): the four ancestor-keyed rules and the stage approximation re-keyed onto the INHERITED class (`READ` `:340`, `:341`, `:342`, `:374`, `:375`) |
| `scripts/live-drive.mjs` | **yes** (C-6) | ONE real gesturing helper + FIVE terms inside the EXISTING `uf_panes_12` block; **no new `BLOCKS` key** (the frozen 100/47-key censuses must not move, `R-10`) |
| the flat registers (`tests/unit-zone-replacement-register.test.ts`, `tests/pd-ui-1-theme-register.test.ts`) | **yes** (collateral, §8) | `index`'s shape and `sidebar-panes.ts`'s digest move ⇒ those cells are re-grained with both values (`RCA-8(c)`) |
| `src/main/preload.ts`, `src/main/main.ts`, `src/shared/types.ts`, `strata/modules.json` | **no** | no IPC channel, no bridge method, no MCP tool, no menu item; the `.pane-drop` handler body stays an inert ADDRESS |
| `src/renderer/layout-vars.ts`, `pane-gutter.ts`, `pane-registry.ts`, `layout-zone-geometry.ts` | **no** | no extent moves: `zoneTrackVars`' four arms are limb `E`(e3)'s UNMOVED control, and no size is projected from JS by this unit |

## 2. The I/O surface

| # | Direction | Name | Shape | Write count |
|---|---|---|---|---|
| I1 | in | the record statement | `panes[]: { id, zone, index?, collapsed }` — `index` absent is a STORABLE meaning ("sort me at my declared place") | 0 |
| I2 | in | the declared places | the registry's per-pane `defaultOrder` (finite) else its registration `seq` — supplied by the CALLER; `pane-drag.ts` holds no registry | 0 |
| I3 | in | the gesture | `startPaneDrag(id)` → `movePaneDrag(point, zones)`* → `commitPaneDrop({ paneId, zone, index? })` | — |
| I4 | in | malformed input | unknown/non-string pane id, unknown zone, junk `index` (`'x'`/`NaN`/`-Infinity`), nested junk as the declared-places carrier, absent `layout` | 0 |
| O1 | out | the whole-family write | `LayoutState` whose `panes` carry the moved `zone` and EVERY affected `index` `0…n-1`; every other member byte-identical; `zone/index` alone differ on the moved entry | **1 `setLayout`** → 1 `operatorSettings.set({layout})` per committed relocation |
| O2 | out | the no-op / the zone-first gate | equal word into an EXPANDED zone ⇒ **0**; equal word into a COLLAPSED zone ⇒ **1** carrying `zones[zone].collapsed: false` with `panes` byte-identical (`ASM-U3-6`: ONE slice, never two leaves) | 0 or 1 |
| O3 | out | the authored envelope | 4 `zone:<z>` containers each `component: { reference:'zone-format', value:['pane-in-<z>'] }`; each frame `component: { reference:'zone-format', target:'css.classes' }`; the root `value:['pane-in-stage']`; the four carriers unchanged | 0 (pure; re-assembly adds no duplicate) |
| O4 | out | the mirror re-derive | the drag-time `is-revealed` set is **mirror-only**: it reaches the zone container's classes and NEVER the record ⟨`F7`, `2026-11-15`: the RECORD claim holds (0 `setLayout`s) but the PATH is not the one this cell names — `sidebar-panes.ts:929-932` applies it with a full `rerenderAppGraph()`, and `G8` measured that re-assembly killing the gesture⟩ | **0 record writes** |
| O5 | out | declared CSS, `G8`-only | `.pane-in-left|right` vertical / `.pane-in-top|bottom` horizontal / `.pane-in-stage` for the stage — read off the class the engine appended from the RECORD's `zone` | 0 |

`*` the moves are the gesture's; the row's limbs `C`/`H` drive them to prove the crossing costs no write.

## 3. The seams, and who may read them (D-7)

| Symbol | File | Signature (the whole of it) | A sibling (`U-4`+) may |
|---|---|---|---|
| `panePlace` | `layout-state.ts` (**new, the ONE law**) | `(input: { entry?: PaneLayoutEntry; defaultOrder?: unknown; seq?: unknown }) => { declared: number; effective: number }` — `declared` = finite `defaultOrder`, else finite `seq`, else `0`; `effective` = the entry's stated finite `index`, else `declared`. TOTAL/fail-soft | **call it** — no site re-spells either disjunct |
| `PaneLayoutEntry.index` | `layout-state.ts` | `index?: number` (was required) | **read the member**; absence means "my declared place", never `0` |
| `panePlacementOf` | `pane-drag.ts` (**new, the act's reading**) | `(layout: unknown, paneId: unknown, declaredPlaces?: DeclaredPlaces) => { zone: LayoutZoneName; place: number; declared: number } | null` — the effective placement of one pane through `panePlace`; unknown id/junk ⇒ `null` | **call it** |
| `DeclaredPlaces` | `pane-drag.ts` | `ReadonlyMap<string, number> \| Record<string, number> \| ReadonlyArray<unknown> \| ((id: string) => number \| null \| undefined)` — every carrier the row tries is accepted (`ASM-U3-2`'s carrier is the CALLER's choice) ⟨`RCA-8(c)` corrected at the doc review `2026-11-15`: this cell read `ReadonlyArray<readonly [string, number]>`; the LANDED type is `ReadonlyArray<unknown>` (`pane-drag.ts:82`), which is what lets a junk pair be IGNORED rather than refused — `L3` §1 already matched the code⟩ | pass one; a wrong-shaped carrier is IGNORED, never a throw |
| `movePane` | `pane-drag.ts` | `(layout, paneId, zone, index?, declaredPlaces?) => LayoutState` — the 5th is OPTIONAL, so every landed caller compiles; its two sibling sorts (`READ` `:93`, `:115`) read `panePlace` | **call it**; it is the whole write discipline |
| `measuresWithinSnapThreshold` (`private`) | `pane-drag.ts` | — | **not** — reached through `dropZoneForPoint`/the controller |
| `resolveEnabledZonePanes` (`private`) | `pane-graph.ts` | — | **not** — the surface is `enabledZonePaneCounts` |
| `zone-format` / `pane-in-<zone>` / `pane-in-stage` | `pane-graph.ts` + `index.html` | the `component` reference name and its two values | **read the class**, never re-spell the provider |
| `data-orientation` | `pane-graph.ts` | `zoneOrientation(zone)` on each container — the projection's REQUIRED discriminant (`READ` `:690` is its ONLY author in `src/**`) | **read it**; never author a second carrier |
| `commitPaneDrop` | `sidebar-panes.ts` | `commitPaneDrop(payload?: unknown): DropResult | null` (unchanged shape) | **call the bridge seam**; the private host method is not interface |

- **The law's ONE reader per family:** the assembler (`resolveEnabledZonePanes`) reads it for ORDER; the act (`commitPaneDrop` via `panePlacementOf`/`movePane`) reads it for the WORD and the SORTS. Neither re-spells `defaultOrder ?? seq` or `index ?? declared`.
- **The act's body contract:** resolve → compose ONE word (`zone` + `place`) → the zone-first gate (`zoneCollapsedOf(stated, enabledZonePlacedCount[zone])`) → ONE `setLayout`. No `size` token in the body; no second `setLayout` on any path.

## 4. The invariants the integration must hold

1. **Absence survives the boundary.** `coerceLayout` copies `index` ONLY when it is a finite number; a junk member and an absent member both end ABSENT (never the reading's position, never `undefined` written as a present key).
2. **ONE law, two readers.** No site outside `panePlace` re-spells the declared place or the effective place (`RCA-8(c)` keeps the superseded reading documented).
3. **ONE write per gesture.** One `setLayout`; the reveals are mirror-only; assembly and mirror reconcile write nothing. **⟨`F7`, `2026-11-15` — the invariant this integration VIOLATES on the assembled app: the reveal is written by a full graph re-render (`onRevealChange` → `rerenderAppGraph` → `loadAppGraph`), which replaces the `.pane-frame` holding the pointer capture; `renderer.ts:1151-1159`'s `onLostPointerCapture → cancelPaneDrag()` then ends the gesture, so no cross-zone drop reaches `commitPaneDrop`. `G8` read `U-3` = `FAIL` on it (`L1` §7a). A "mirror-only" reveal must reach the DOM WITHOUT re-assembling.⟩**
4. **The comparison is ONE composed word** (zone + place), and the **zone-first gate precedes the no-op**: a placement-equal drop into a collapsed zone writes `collapsed: false` — the drop IS an open.
5. **The write is whole-family.** The moved pane's `zone` plus every affected pane's `index` `0…n-1`; `size`/`stage`/`topBar`/the other zones are byte-identical; the vacated zone is renumbered, never emptied of its stale index.
6. **No geometry is written and none exists to write.** `PaneLayoutEntry` gains no `width`/`height`/`bounds`; no drag-path `setLayout` carries a size (`ASM-U3-1` grades "declared figure" as "declared form + no geometry write" — a `DOC-GAP`, never a green).
7. **The projection's scope is the AUTHORED identity, not the box.** `.pane-drop` is excluded and `data-orientation` REQUIRED; the eight drops stay unpainted, so the scope — not the `0×0` — is what refuses them (`ASM-U3-3`).
8. **The admission is discriminating.** Refuse degenerate on BOTH axes; admit degenerate on ONE (an empty zone's `0px` track is a legitimate target along its edge line) (`ASM-U3-4`).
9. **The form is read off the RECORD's zone.** Provider on the container, consumer on the frame (append, never a class write — D-265), stage provider on the root; `index.html` keys on the inherited class only (D-8: CSS, no element).
10. **Crossing N times is one crossing** (D-266): the committed record is the crossing-once record, and the committed envelope carries no residue `is-revealed`.

## 5. Failure and boundary states

| State | Required behaviour |
|---|---|
| unknown / non-string pane id, unknown zone | the act is a NO-OP: `movePane` returns the coerced record, `commitPaneDrop` answers `null`, **zero** writes |
| a drop equal to the record's placement into an EXPANDED zone | **zero** `setLayout`s, no placement change (`X3b`'s no-op) |
| a drop equal to the record's placement into a COLLAPSED zone (statement or derivation) | exactly ONE `setLayout`: `zones[zone].collapsed = false`, `panes` byte-identical, `size` untouched |
| a family stating NO `index` (D-262's case) | each member sorts at its DECLARED place; a self-drop onto one's own declared place is a **no-op** (today it writes — the read position differs from the declared place) |
| `index` hostile (`'x'`, `NaN`, `-Infinity`, `1e999`) | ABSENT after coercion; never the array position; never a `NaN` in a comparison |
| junk/absent declared-places carrier | IGNORED by the act's sorts (`panePlace` falls back to the stated `index`, then `0`), the write unchanged |
| an EMPTY zone as the drop target | ADMITTED (the one-axis degenerate box); the reveal writes `is-revealed` + restores the persisted track, and the commit lands — `G8`-only |
| the `.pane-drop` nodes / the collapse controls / the gutters as candidates | **REFUSED** by the projection (class skip + the `data-orientation` discriminant), independently of their boxes |
| a pane standing outside the four zones (the stage) | inherits `pane-in-stage` from the ROOT provider; a zone-resident pane never carries it (nearest-first) |
| seam absent (a preload older than the pair) | `installSidebarBridge`'s parity guard throws LOUD at boot; the handler body no-ops |

## 6. The evidence class of each arm

| Arm | Where | Class |
|---|---|---|
| `A` the law · `B` the word and the chain · `C` the whole-family write · `D` the projection (source clause + the REAL envelope's discriminants) · `E` the admission · `F` the form rendered through the ENGINE · `G` the record's figure · `H` crossing N times | `tests/integration/shell-chrome/pane-move-target.test.ts` | **node/integration, envelope-class** — `RUN` at the pre-edit head: 8 collected, **6 failed / 2 passed** (`G`/`H` green on first write, declared so); the real assembler + the real `SidebarPanes` over the DOM double, NEVER a paint |
| the drag itself · the reveal of an EMPTY zone (its `is-revealed` and its computed `--zone-<dest>-track` ≠ `0px`) · the inherited `pane-in-<dest>` class arriving through `applyDerived` · the second drag restoring the assignment and the record · the sibling zones' rects and the slot census | `node scripts/live-drive.mjs --block=uf_panes_12 --display=:0` at `G8` | **G8-ONLY, assembled app.** No node row here may claim any of them (D-10, RCA-12). **`READ` `2026-11-15`: `U-3` = `FAIL` — all five terms `false`, root cause `F7`; the readings are `L1` §7a's** |
| the `C-6` INSTRUMENT's composition — the helper wired into `uf_panes_12`, the five terms named in order and each printing its own reading, `PROBLEMS=` never elided, the terms folded into the row's `ok`, no new `BLOCKS` key | `tests/integration/shell-chrome/pane-move-instrument.test.ts` (`T1`…`T5`) | **source-class, envelope** — `RUN` `5 passed (5)`, GREEN on first write and declared, discrimination from three mutations on the same text (`L1` §7a). It grades the instrument, never a reading |

- `UF-DEFECT-5`/`LIVE-UF7` (a real boundary drag does not resize an expanded zone) means *"nothing moved"* is never discrimination on its own: all five `C-6` terms are therefore **positive** (a box present, a class present, a container holding a frame, a track ≠ `0px`) plus the **restore** pair, and the one negative term is read against a before/after pair from the SAME run.
- `U-5` §7.2's limbs stay `NOT-CONCLUSIVE`; `UF-PANES-4`'s stale `.pane-collapse-toggle` sentence is **outside** this unit's grant (§5).

## 7. The endpoint count

**This behaviour adds no endpoint.** Every new export (`panePlace`, `panePlacementOf`) is a module-internal export — not an MCP tool, not a vendored export, not a bridge method; `SidebarMethods` is unmoved; `preload.ts` does not move; no IPC channel and no menu item is added. `N` stays **26**, the cap stays **310**, and `strata/modules.json` is untouched.

## 8. Findings routed up — recorded, not fixed

- **`F1` (contract gap — RULED HERE, needs an L1 note).** `C-4` requires the four ancestor-keyed `index.html` rules re-keyed onto the INHERITED class, but the two `.pane-tab` rules' subject is the TAB STRIP, which is a child of the *provider* container — and a provider publishes a VALUE, not a class on itself, so `.pane-in-left .pane-tab` would be a DEAD rule. **Ruling:** the tabs are authored as `zone-format` CONSUMERS too (one member on `zoneContainerChildren`'s node, same family, same file), and the two rules are re-keyed as the COMPOUND `.pane-tab.pane-in-left|right` / `.pane-tab.pane-in-top|bottom`. Stated as an in-unit ruling rather than dressed as `C-4`'s letter.
- **`F2` (collateral, handled in-unit — and CORRECTED by measurement).** The prediction above named `tests/unit-zone-replacement-register.test.ts`'s `P-SM-2`-shaped cells as red; **MEASURED (`M1`): that suite carries NO cell pinning `index`'s shape** — its only contact with the subject is a SHAPE-ONLY read of `pd-ui-1`'s digest table ("this suite encodes NO landing value"), so it stays GREEN with no byte owed. The ONE red cell was `tests/pd-ui-1-theme-register.test.ts`'s `P-TH-SM-1(f)` `sidebar-panes.ts` md5 row (plus the two rows that had gone red on the stale digest and are green again after the re-record). Re-grained WITH its reason, the superseded digest kept visible and `restated: 'U-3'` (`RCA-8(c)`, the `unit-u-1b-zone-collapse.md` §2 `C-6` precedent).
- **`F3` (carried, named, not worsened).** `ASM-U3-1`'s literal "declared figure" stays a `DOC-GAP`: `PaneLayoutEntry` has no figure member and this unit may not invent one (D-15).
- **`F4` (contract clause REFINED in-unit, landed and reported).** `C-2`'s zone-first gate as written ("when the target zone is COLLAPSED — statement or derivation — the write states `collapsed: false` **even when the placement is a no-op**") collides with limb `C`(c2) on a RELOCATING drop: in that limb the destination `bottom` holds no pane, so `zoneCollapsedOf(undefined, 0)` is `true`, and a gate that wrote the zone member on the RECORD's census would add `zones.bottom.collapsed` to a relocation whose `zones` must stay byte-identical; a gate that wrote the collapse ALONE would drop the relocation. **Ruling (as landed):** the gate reads its DERIVATION census over the record the write will produce (`next`), so a drop that FILLS an empty zone is itself the open (no statement owed, `zones` byte-identical) while a STATED `collapsed: true` is still overturned in the same ONE `setLayout` — which is exactly what `B`(b2) grades. Recorded at the code site, not silently.
- **`F5` (the row's own tooth was a TEST-SIDE defect — repaired, not weakened).** Limb `A`(a2)'s two-array-order falsifier compared the LABEL-BEARING reading strings (`array order (x, y, z) → […]`), so `readings[0] !== readings[1]` was true for EVERY implementation and the limb could never pass (both per-order teeth were already green). Repaired to compare the SEQUENCES (`sequences[i] = fingerprint(sequence)`), which is STRICTER: the tooth now fires iff the two sequences actually diverge, proven by a transient mutation (the sort's primary key reverted to the array position) whose red text is quoted in the return, then restored md5-identically. No arm deleted, no claim loosened, superseded form kept visible in the row.
- **`F6` (collateral this unit OWES and paid).** `U-2`'s `pane-head-target.test.ts` limb `F`(f2) keyed its collapsed-`auto`-arm reader on the `[data-orientation]` ancestor attribute that `C-4` supersedes by design ⇒ it reds. Re-grained onto the INHERITED class (vertical = `.pane-in-left|right` `height: auto`; horizontal = `.pane-in-top|bottom` `width: auto`), its two falsifier mutations rebuilt for the new keying, a per-zone tooth ADDED, the `panePaintAxesOf`-agreement and "no figure constant" halves unchanged, and the superseded reading kept visible (`RCA-8(c)`).
- **`F7` (`BLOCKER`, host — MEASURED by `G8`, `2026-11-15`, not designed around).** The reveal's non-record half is implemented as a **full graph re-render**: `sidebar-panes.ts:929-932` (`onRevealChange` → `this.rerenderAppGraph()` → `applyZoneTracks()` **then** `loadAppGraph`), which replaces the `.pane-frame` the gesture's pointer capture is held on; `renderer.ts:1151-1159` turns the resulting `lostpointercapture` into `cancelPaneDrag()`. Measured: `gotpointercapture=1` → `lostpointercapture` on `DIV:doc-nav`, every later move reading an EMPTY reveal mirror, the destination never `is-revealed`, its `--zone-right-track` `"0px"` during AND after the drop, and the frame keeping `pane-in-left`. No re-render site on this path checks for an in-flight pane gesture. **Repair shape (not taken here — diagnose, never patch):** apply the reveal without re-assembling, or defer `loadAppGraph` while a gesture holds the capture; either way the five `C-6` terms must read `true` and `PROBLEMS=[]`.
- **`F8` (invariant drift, host — `RCA-8(c)` annotate-beside).** Invariant 2 ("no site outside `panePlace` re-spells the declared place") is FALSE at the landed head: `sidebar-panes.ts:3707-3708` re-spells it (`typeof stated === 'number' && Number.isFinite(stated) ? stated : seq`) — and the method's own comment at `:3698-3701` claims it does not. Behaviourally identical today; the repair is to route it through `panePlace({ defaultOrder, seq }).declared` so the two cannot drift when the law changes.

**Verdict:** L3 receives the sealed surface — `PaneLayoutEntry.index?`; `panePlace` as the ONE law; `panePlacementOf` + `movePane(layout, id, zone, index?, declaredPlaces?)` as the act's reading and write; `commitPaneDrop`'s placement → word → zone-first gate → ONE `setLayout`; the projection's `.pane-drop`-skip + `data-orientation` requirement; the one-axis admission; the `zone-format` provider/consumer/stage authoring with the tab consumer of `F1`; and the five `C-6` live terms inside `uf_panes_12`. **The surface is sealed; the APP is not.** `G8` read this integration's central behaviour `FAIL` (`F7`: the reveal's graph re-render kills the gesture), so `F7`'s repair — a reveal that reaches the DOM without re-assembling — is the condition on `U-3`'s acceptance, and `F8` is the repair owed by the same hand.
