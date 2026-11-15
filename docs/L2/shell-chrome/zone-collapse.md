# L2 — `shell-chrome` / `U-1b` `zone-collapse`: the integration design of one behaviour

**Layer:** L2 · **Date:** 2026-11-15 · **Ceiling:** 120 lines · **Module:** `shell-chrome` (`N` = 26, cap `50+10N` = 310) · **Unit contract:** `docs/L1/unit-u-1b-zone-collapse.md` (authority) under `strata/decisions.md` D-22.
**Markers:** `READ` = read in this pass, file and line named. `RECORDED` = measured elsewhere, quoted with its measurer. **The per-file line columns in §1/§3 are the readings of the head they were taken at (`2026-11-15`, `U-1a`'s landing); the landed head has shifted them — a reader today should key on the NAMES, never the numbers.** **Layer declaration:** nothing here is app-green or envelope-green; the node suite is envelope-class under the layout-less shim (D-10) and the paint is G8-only (RCA-12).

## 1. The module's role, and the boundary of this behaviour

`shell-chrome` owns the shell's layout/UI surface. For `U-1b` the behaviour is **one state member, one derivation, one act, one authored control, one paint family**, and the module's paths split three ways:

| Path (claimed by `shell-chrome`) | Takes part? | Why |
|---|---|---|
| `src/renderer/layout-state.ts` | **yes** | `ZoneLayout.collapsed?`, `defaultLayout()` seeds, absence-preserving coercion (`READ` `:64-67`, `:138-144`, `:147-160`) |
| `src/renderer/pane-graph.ts` | **yes** | the re-exported predicate, the mirror classes + `props.collapsed`, the control author + top-level insertion (`READ` `:229-251`, `:392-398`, `:530-600` at the pre-edit head) |
| `src/renderer/pane-drag.ts` | **yes** | `setZoneCollapsed` replaces `setZoneMinimized` (`READ` `:248-266`) |
| `src/renderer/sidebar-panes.ts` | **yes** | the act `zoneCollapseToggle`, `paneTabExpand`'s leaf write, the bridge methods map (`READ` `:3478-3498`, `:3283-3294`) |
| `src/renderer/pane-gutter.ts` | **yes** | the gate's parameter re-grain only, `empty !== true && collapsed !== true` (`READ` `:151-153`) |
| `src/renderer/index.html` | **yes** | CSS only: `auto`/`hidden` extent, control box + glyph, gutter affordance hidden (D-8; `READ` `:116-121`, `:154-157`, `:191-195`, `:242-244`) |
| `src/main/preload.ts` | **yes** | the `SidebarMethods` member, the holder default, the exposed proxy (`READ` `:105-106`, `:343-344`, `:661-662`) |
| `scripts/live-drive.mjs`, the flat registers, `tests/integration/shell-chrome/**` | **yes** (D-16/D-14 re-grain, C-6) | the ids and the paint class move, so the leg that names them moves in this commit |
| `src/main/main.ts`, `app-menu.ts`, `src/shared/types.ts` | **no** | no IPC channel, no menu item: the seam is renderer↔preload and the write path (`operatorSettings.set`) already exists |
| `src/renderer/renderer.ts` | **no** | the act is reached by the authored handler body through the graph runtime, not by a delegated pointer listener (unlike the gutters) |
| `src/renderer/layout-vars.ts`, `theme.ts`, `pane-registry.ts`, `layout-zone-geometry.ts` | **no** | read-only here: the registry is the census SOURCE; no `auto` is projected from JS (see finding `F1`); no theme token moves |
| `tests/unit/shell-chrome/**`, `tests/e2e/**` | **no** | the unit's own row is integration-class (`ASM-U1b-7`); no second row is authored here |

## 2. The I/O surface

| # | Direction | Name | Shape | Write count |
|---|---|---|---|---|
| I1 | in | the record statement | `zones[zone].collapsed?: boolean` (absent = "derive"; `true`/`false` = the operator's word) | 0 |
| I2 | in | the census | `Record<LayoutZoneName, number>` from `enabledZonePaneCounts(registry, layout)` — enabled+placed, never `layout.panes` | 0 |
| I3 | in | the press | `zoneCollapseToggle(zone: string)` — one call from the authored control's handler | — |
| I4 | in | malformed input | non-zone string, absent `layout`, junk member (`1`/`"true"`/`null`), junk coercion input | 0 |
| O1 | out | the record write | `LayoutState` with ONE zone member replaced by an explicit boolean; `size`, `panes`, `stage`, `topBar` byte-identical | **1 `setLayout`** → 1 `operatorSettings.set({layout})` per press |
| O2 | out | the authored envelope | 4 `zone:<z>` containers (`is-collapsed`, `collapsed="true"\|"false"`), 4 `zone-collapse-<z>` siblings, tab strips for collapsed occupied zones | 0 (pure; re-assembly adds no duplicate) |
| O3 | out | declared CSS (G8-only evidence) | `--zone-<z>-track: auto` on the fixed axis; `overflow-y`/`overflow-x: hidden` by `data-orientation`; the control's fixed box off the track tokens + its glyph by `+`; the collapsed zone's gutter affordance hidden | 0 |
| O4 | out | the mirror re-derive | one managed `state-slice` per changed `zone:<z>`, carrying **both** carriers (`css.classes` and `props.collapsed`) in the same journaled op | **0 record writes** (a command, not `setLayout`) |
| O5 | out | the expanding gesture | `paneTabExpand(zone, paneId)` → one `setLayout` writing `collapsed: false` | **1**, and none beyond it: no size was cleared, so nothing is restored |

## 3. The seams, and who may read them (D-7)

| Symbol | File | Signature (the whole of it) | A sibling (`U-2`/`U-3`) may |
|---|---|---|---|
| `ZoneLayout.collapsed?` | `layout-state.ts` | `collapsed?: boolean` | **read the member** (absence = derive; never assume `false`) |
| `zoneCollapsedOf` | `layout-state.ts` (**defined** there; re-exported by `pane-graph.ts` for the sidebar/assembler callers — `ASM-U1b-11`, so the projection can call it without dragging the assembler into the MAIN bundle) | `(stated: boolean \| undefined, paneCount: number) => boolean` | **call it** (via either import) — it is the ONE derivation |
| `zoneCollapseControlOf` | `pane-graph.ts` | `(zone: LayoutZoneName) => LegacyNodeData` | **read the node shape**: `id: 'zone-collapse-<zone>'`, class `zone-collapse`, `content: ''`, `props.zone` |
| `ZONE_COLLAPSE_HANDLER` | `pane-graph.ts` | `'zone-collapse-toggle'` (the one shared handler name) | **name it** for `provident.dispatch`; never spell a second handler |
| `setZoneCollapsed` | `pane-drag.ts` | `(layout: LayoutState, zone: LayoutZoneName, collapsed: boolean) => LayoutState` | **call it**; it is the whole write discipline of `U-3` |
| `zoneCollapseToggle` | `preload.ts` / `sidebar-panes.ts` | `SidebarMethods.zoneCollapseToggle(zone: string): void` then `private zoneCollapseToggle(zone: string): void` | **call the bridge seam**; the private host method is not interface |
| `paneTabExpand` | `preload.ts` | `paneTabExpand(zone: string, paneId: string): void` (keeps its name) | **call it** |
| `isGutterResizable` | `pane-gutter.ts` | `(empty: boolean, collapsed: boolean) => boolean` (still FAIL-CLOSED) | no: a module-internal gate; refuse by the predicate |
| `coerceZoneLayout`, `zoneMirrorClasses`, `zoneContainerChildren`, `resolveEnabledZonePanes`, `enabledPlacedCounts` | `layout-state.ts` / `pane-graph.ts` | module-private (`READ` `:138`, `:229`, `:392`, `:186`, `:246`) | **not** — a sibling reads the surface, never the code; a new dependence on `enabledZonePaneCounts` is not granted by `U-1b` |

- **The handler body contract:** a full function expression taking `ctx`; it reads `window.provident.sidebar`, no-ops on an absent seam, reads ONLY `ctx.node.props.zone`, and calls `s.zoneCollapseToggle(String(zone))`. It must not read `collapsed`, must not compute the state, and must not carry a second address.
- **The act's body contract:** declared `private zoneCollapseToggle(zone: string): void` — a **private method**, not an arrow field, because the row's `G` limb locates the body by `private zoneCollapseToggle(`. Body: guard `isLayoutZoneName`, `base = coerceLayout(this.layout ?? defaultLayout())`, `current = zoneCollapsedOf(base.zones[zone].collapsed, enabledZonePaneCounts(this.registry, base)[zone])`, then ONE `this.setLayout(setZoneCollapsed(base, zone, !current))`. No `size` token in the body.
- **One derivation site, stated because C-2's phrasing is looser than the tree:** `syncZoneMirrors` consumes the **two carriers** the assembler authored — `css.classes` and `props.collapsed` — and re-emits both in one state-slice (`READ` `sidebar-panes.ts:2256-2341`, the `G5` repair); it must not re-derive from the census (that would be a second computation site); the sidebar's own `zoneCollapsedOf` call is the act's `current` read, and the act's write re-assembles, so the live mirror and the assembly cannot disagree.

## 4. The invariants the integration must hold

1. **One write per press.** One `setLayout`, one `operatorSettings.set`; assembly, mirror reconcile and the tab strip write nothing.
2. **`size` is never written** by the act or the expander; the four zone sizes are byte-identical across any number of presses (forking §7.1 `:480-481`).
3. **The member is never deleted.** Absence is produced only by the seeds and the absence-preserving coercion; the act always states an explicit boolean (ASM-U1b-1).
4. **Exactly one control per zone, at `children.indexOf(container) + 1`**, for all four zones, empty or not; the idempotence scan is keyed on the control's OWN id (`zone-collapse-<z>`), because the gutter family's `zone` + `data-axis` key would collide with the container's and the affordance's `zone`.
5. **No second extent authority.** No `DEFAULT_ZONE_COLLAPSED_SIZE`-shaped constant, no `size` write in the collapse path; F-3's four `0px` rules are preserved and the two families are **partitioned by the `.is-empty` gate** (`auto` requires `:not(.is-empty)`), not by source order — measured `(2,3,0)` on both, so order decides nothing and the gate is the mechanism (L1 `C-4`/`ASM-U1b-8`, corrected in the `G5` repair) (ASM-U1b-4/-8).
6. **One census predicate.** The assembler, the act, the gutter gate (both call sites — `READ` `sidebar-panes.ts:953`, `:3709`) call `zoneCollapsedOf`; no site re-spells `paneCount === 0`.
7. **One props bag, two carriers, computed once.** `zone`, `data-orientation`, `collapsed` set in the same arm as the class list; the class and the attribute are `ASM-U1b-9`'s pair.
8. **No hand-written DOM** (D-8): the control is envelope data and `index.html` carries CSS only.
9. **Two presses restore the EFFECTIVE state, never record identity** (`ASM-U1b-1`): from an unstated start the member ends stated and equal to the starting derivation.
10. **`LAYOUT_VERSION` stays `1`**, no migration arm; the pre-rename relocation is the accepted defect row `ZONE-RENAME-SILENTLY-RELOCATES-PERSISTED-PLACEMENTS` (D-22 (2)).

## 5. Failure and boundary states

| State | Required behaviour |
|---|---|
| malformed / unknown zone | no-op, **zero** writes; `zoneCollapseControlOf` is total over the closed four and throws on nothing |
| absent record (`this.layout == null`) | base = `defaultLayout()` (all four unstated) → the census decides → the press writes the negation of the derivation |
| empty zone stated `false` | the statement wins in the record and the envelope (`collapsed="false"`, no `is-collapsed`, no `is-empty`-derived tab strip) — **but** F-3's `0px` rule still matches `is-empty`, so the painted extent stays collapsed: recorded as finding `F2`, not fixed here |
| occupied zone stated `true` | collapsed: pane payloads are replaced by the tab strip, `is-collapsed` + `collapsed="true"`, the gutter gate refuses (`isGutterResizable(empty, true)`), the affordance is hidden, never deleted |
| second assembly over an already-authored envelope | the control is not duplicated (id scan) and a stray is MOVED to the container's next index; the container's tab/payload children ARE re-appended by the pre-existing merge arm (`children: [...existingChildren, ...authoredChildren]`, `READ` `pane-graph.ts:546-554`) — so a collapsed zone's strip DOUBLES on a second pass. No shipped host path re-assembles an authored envelope; recorded as a finding (L1 §4a (i)), graded by the unit row's `A'`/`D'` (withholding on both passes; strip census on the first) and **not fixed here** |
| empty persisted slice / junk member | `coerceLayout` → `defaultLayout()`; no member on any zone; the legacy `minimized` is not read (absence-preserving) |
| seam absent (a preload older than the pair) | `installSidebarBridge`'s parity guard throws LOUD at boot on a missing `sidebar` key (`READ` `sidebar-panes.ts:3368-3379`); the handler body itself no-ops |

## 6. The evidence class of each arm

| Arm | Where | Class |
|---|---|---|
| `A`–`H` the derivation's arms, the seeds, the act, the authored control, the coerced member cell, the vocabulary census, the absent second authority, **and `H` the projection's four arms** · **`A'`** the fold's negative half (the pane payloads are withheld, graded on both passes) · **`D'`** the adjacency after a re-assembly (index-derived, with a stray-moved corpus) | `tests/integration/shell-chrome/zone-collapse-target.test.ts` | **node/integration, envelope-class** — `A`–`H` were authored and `RECORDED` RED at the pre-edit head (L1 §3); `A'`/`D'` were added **after** the green and carry **no recorded red** (hardening teeth, said rather than hidden). The real `assembleAppGraphEnvelope` + the real `SidebarPanes` over the DOM double, NEVER a paint |
| the collapsed **extent** (`auto` on the fixed axis, `hidden` on the arrangement axis) · the control's **box over a collapsed extent and its hit-testability** · **"a collapsed zone offers no resize strip"** · the **glyph** | `node scripts/live-drive.mjs` at G8 | **G8-ONLY.** No node row here may claim any of the four (D-10, RCA-12); a row of `F`'s census that reads a class literal is a SOURCE reading, not a paint |

- Limbs `A`–`G` are `[T]`/envelope: they prove the authored model, the write discipline and the source vocabulary. They prove nothing about the rendered app.
- The G8 rows to drive: `UF-KEEP-1` (a collapsed side zone reads as a vertical strip) and `UF-PANES-8`/`U-6` (a tab re-expands) are the nearest existing rows; the control's hit-testability and "no resize strip" have **no row of their own** — a `DOC-GAP` at G8, never a green (L1 §4).

## 7. The endpoint count

**This behaviour adds no endpoint.** Both `sidebar` seams are **RENAMED** in place — `zoneMinimizeToggle` → `zoneCollapseToggle` on the preload declaration, the holder default and the exposed proxy, and the handler `pane-zone-minimize-toggle` → `zone-collapse-toggle` — while `SidebarMethods` declares **37** members before and after this unit, so the bridge surface's size is unchanged; and the three functions this unit exports (`zoneCollapsedOf`, `zoneCollapseControlOf`, `setZoneCollapsed`) plus `ZONE_COLLAPSE_HANDLER` are **module-internal exports**, not MCP tools, not vendored exports, not bridge methods. `N` stays **26**, the cap stays **310**, and `strata/modules.json` is untouched by this pass.

## 8. Findings routed up — recorded, not fixed

- **`F1` (contract gap — RESOLVED and LANDED).** `applyZoneTracks` writes `--zone-<z>-track` INLINE on the grid element on every `setLayout` (`READ` `sidebar-panes.ts:1632-1673`), so a stylesheet-only `auto` was authoritative only before the first write. Ruled as `ASM-U1b-10`: the token is authored **twice** — `zoneTrackVars` emits `'auto'` for a collapsed occupied zone and `index.html` carries its declarative mirror. Both halves landed; limb `H` grades the projection's four arms.
- **`F2` (internal inconsistency — CLOSED by ruling).** An empty zone stated `collapsed: false` reads expanded in the record and the envelope, yet F-3's `is-empty`-keyed `0px` track remains the authority for the empty case. L1 closed this as the **ruled asymmetry** (`C-4`): the empty-track policy is an *emptiness* fact (F-3, live `PASS`ed), never a second statement of the collapse fact, and the statement becomes visible the moment the zone gains a pane.
- **`F3` (RED-row non-vacuity — ACCEPTED).** Three of limb `F`'s presence floors are met by the PANE family (`PANE_COLLAPSED_CLASS`, `.pane-frame.is-collapsed`, `PaneLayoutEntry.collapsed`), so they cannot distinguish the zone's vocabulary from the pane's. The limb reds overall on its absent symbols and the landing is graded by `A`–`E`/`H` regardless; recorded so a later reader does not over-read those three floors.

**Verdict:** L3 receives the sealed surface — `ZoneLayout.collapsed?`; `zoneCollapsedOf` as the one derivation; `setZoneCollapsed` + `zoneCollapseToggle` as the one-write act behind the `zone-collapse-toggle` handler body; `zoneCollapseControlOf`'s node at the container's immediate following index; the `is-collapsed` + `collapsed="true"|"false"` carriers; and the `auto`/`hidden` axes, whose paint is G8-only.
