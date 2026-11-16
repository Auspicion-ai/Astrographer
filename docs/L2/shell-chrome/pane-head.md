# L2 — `shell-chrome` / `U-2` `pane-head`: the integration design of the bar, the column, the one-leaf act, the head minimum and the gutter pill

**Layer:** L2 · **Date:** `2026-11-15` · **Ceiling:** 120 lines (D-2's design class) · **Module:** `shell-chrome` (`N` = **26**, cap `50+10N` = **310**) · **Unit contract:** `docs/L1/unit-u-2-pane-head.md` (authority — §2 `C-1`…`C-7`, §3 the red set, §5 the D-17 grant, §6 `ASM-U2-1`…`-8`), under `strata/decisions.md`.
**Markers:** `READ` = read in this pass, file and line named **at this head**; the landing shifts every line, so a reader keys on NAMES. `RECORDED` = measured elsewhere, quoted with its measurer.
**Layer declaration (mandatory, D-10/RCA-12):** nothing here is app-green or envelope-green. The unit's own row is ENVELOPE-class under the layout-less DOM shim; **every geometric and paint claim is `G8`-only** and is named as such in §6.

## 1. The module's role, and the boundary of this behaviour

`shell-chrome` owns the shell's layout/UI surface. For `U-2` the behaviour is **one authored bar · one column · one leaf write · one content-derived minimum · one derived pill**, in one module, with no sibling read (D-3/D-4/D-7). The module's paths split three ways:

| Path (claimed by `shell-chrome`) | Takes part? | Why |
|---|---|---|
| `src/renderer/pane-graph.ts` | **yes** | the whole AUTHORED bar: head row, grip, four drops, control, body node, the frame's `collapsed="true"\|"false"` carrier, `PANE_COLLAPSE_BODY`'s `props.pane` read, and `panePaintAxesOf` (`READ` `:126-138`, `:305-353` — today the frame authors `[button.<superseded class>, renderRoot]` with `content: '▸ Title'` —, `:509-520`) |
| `src/renderer/pane-drag.ts` | **yes** | one new pure export `setPaneCollapsed` beside `setZoneCollapsed`, which is its exact shape model (`READ` `:256-268`) |
| `src/renderer/sidebar-panes.ts` | **yes** | `togglePaneCollapse` (`READ` `:3448-3482`): the record-PRESENT arm becomes ONE `this.setLayout(setPaneCollapsed(base, paneId, !current))`; the record-ABSENT backfill (`:3465-3481`) stays, NAMED |
| `src/renderer/renderer.ts` | **yes** | the pointer surface, head-only/grip-only: `GESTURE_SELECTOR`, `PANE_HEADER_CLASS` (`READ` `:472`, `:480`) and F-1's "the header IS the toggle" exemption **deleted with its cause** (`READ` `:974-979`) |
| `src/renderer/index.html` | **yes** | CSS **only** (D-8): the column, the collapsed arm, the glyph, the pill — theme blocks `:18-76`, zone-collapse block `:289-311`, `.pane-frame` `:324-326`, gutters `:388-393` |
| `scripts/live-drive.mjs` + the two flat registers (`tests/live-drive-contract.test.ts`, `tests/pd-ui-1-theme-register.test.ts`) | **yes** (D-14/D-16) | **25** driver lines carry the superseded class (`READ`, grep of `scripts/live-drive.mjs`) → `.pane-grab` (drag) / `#pane-collapse-<id>` (control); the three live rows EXTENDED in place; the OWED `node --check` row authored; **ONE** md5 re-record |
| `tests/integration/shell-chrome/pane-head-target.test.ts` | **no** | authored by L1's test writer BEFORE any byte and `RUN` RED; it is the TARGET, never edited to fit the landing |
| `src/main/preload.ts` | **no — and it MUST NOT MOVE** | the bridge seam keeps its name `togglePaneCollapse` (`READ` `:103`, `:341`, `:659`); only the authored control's OPERAND moves to `props.pane`. A move owes a second md5 re-record and must be STOPPED and reported first |
| `src/main/main.ts`, `src/main/app-menu.ts`, `src/shared/types.ts` | **no** | no IPC channel, no menu item, no shared type: the seam is renderer↔preload and the write path (`operatorSettings.set`) already exists |
| `src/renderer/{layout-state,pane-registry,render-shared,pane-gutter,layout-vars,theme}.ts` | **no** | read-only: `panePaintAxesOf` is authored in `pane-graph.ts` and reads `zoneOrientation` through the edge that ALREADY EXISTS (`READ` `pane-graph.ts:40`) — no new import, no cycle |
| `tests/unit-live11-bridge-seams.test.ts` | **no — OUTSIDE the grant, must stay GREEN** | `READ` `:453` dispatches on the control's id (which STAYS `pane-collapse-<id>`) and `:465` requires the collapsed body's MARKER absent — exactly why the body NODE is authored and its CHILDREN withheld (`ASM-U2-2`) |
| `tests/unit-zone-replacement-register.test.ts` | **no** | its `G-7` seven-row shape read (`READ` `:3857-3869`) is unmoved; a re-recorded digest stays admissible to it |

## 2. The I/O surface

| # | Direction | Name | Shape | Write count |
|---|---|---|---|---|
| I1 | in | the record entry | `PaneLayoutEntry = { id, zone, index, collapsed? }` off the enabled+placed census (`READ` `pane-graph.ts:207-225`, `collapsed = entry?.collapsed ?? false` at `:220`); the act reads `coerceLayout(this.layout ?? defaultLayout())` | 0 |
| I2 | in | the assembled envelope | `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx, layout })` → **one payload per enabled+placed pane**: `{ content: [paneSubtreeRoot(def, ctx, zone, collapsed)] }` (`READ` `:509-520`) | 0 |
| I3 | in | the press carrying `props.pane` | ONE shared `PANE_COLLAPSE_HANDLER` pair on the control; its body reads **ONLY** `ctx.node.props.pane` and calls `window.provident.sidebar.togglePaneCollapse(String(pane))`; a node carrying only `data-pane-id` calls NOTHING | — (the press is O2's unit) |
| I4 | in | malformed input | absent/blank `props.pane`; a `data-pane-id`-only node; an unregistered / disabled / operator-scope id; an absent record entry; `null` / `{}` / junk-member layout | 0 |
| O1 | out | the authored bar, head and body | frame children `[head, body]` in **BOTH** states; head `[grip, control]`; grip's four `pane-grab-<id>-<zone>` drops over the closed four; body `[renderRoot]` expanded / `[]` collapsed; the frame's own carriers `is-collapsed` + `props.collapsed="true"\|"false"` | **0** (authored data; a re-assembly adds no duplicate pane frame) |
| O2 | out | the collapsed CONTROL's consumer face | the glyph is the SHEET's (`::before` keyed on the pane's OWN `[collapsed]`), never `content`; the control authors `props.pane`/`props.tabindex` and no `content` | 0 |
| O3 | out | THE ONE WRITE | `setPaneCollapsed(base, paneId, !current)` → **1** `setLayout` → **1** `bridge.operatorSettings.set({ layout })`; ONE member of ONE entry changed, `zone`/`index`/`id` and every other entry byte-identical | **1**, never a second |
| O4 | out | the sheet's declared rules (G8-only evidence) | the column (`flex-direction: column`, head `flex: 0 0 auto`, body `flex: 1 1 auto; min-height: 0; overflow: auto`), the collapsed arm (`auto` on the adjustable axis + `display: none` on `:not(.pane-head)` + body `overflow: hidden`), the glyph pair, the pill (`::before` line, `::after` pill) | 0 |
| O5 | out | the pointer resolution | `GESTURE_SELECTOR = '.gutter[zone], .pane-grab'`; a press on the control resolves **no** gesture element (it is the grip's SIBLING); the capture stays the FRAME's (`paneFrameAncestorOf`/`resolvePaneId` unchanged, `READ` `:505-539`) | 0 |
| O6 | out | `panePaintAxesOf(zone)` | `{ fill, adjustable, scroll }`: `left`/`right` ⇒ `width`/`height`/`overflow-y`; `top`/`bottom` ⇒ `height`/`width`/`overflow-x`; zone-less/stage (any non-zone value, incl. `null`) ⇒ `both`/`both`/`null` | 0 (pure; five arms, three classes) |

## 3. The seams, and who may read them (D-7)

| Symbol | File | Signature (the whole of it) | A sibling (`U-3`) may |
|---|---|---|---|
| `setPaneCollapsed` | `pane-drag.ts` (**new**) | `(layout: LayoutState, paneId: string, collapsed: boolean) => LayoutState` — coerce first; an unknown/absent id is a NO-OP returning the coerced base; writes an EXPLICIT boolean, never deletes, never touches `zone`/`index`/`id` | **call it**; it is the whole write discipline |
| `setZoneCollapsed` | `pane-drag.ts` | `(layout, zone, collapsed) => LayoutState` (unchanged) | call it |
| `panePaintAxesOf` | `pane-graph.ts` (**new**) | `(zone: LayoutZoneName \| unknown) => { fill: 'width'\|'height'\|'both'; adjustable: 'width'\|'height'\|'both'; scroll: 'overflow-x'\|'overflow-y'\|null }` — TOTAL, off `zoneOrientation` | **read the axes**; never re-spell the split |
| `PANE_COLLAPSE_HANDLER` | `pane-graph.ts` | `'togglePaneCollapse'` (the ONE shared handler NAME; it collides with the seam it routes to BY DESIGN — keep it) | name it for `provident.dispatch` |
| `PANE_COLLAPSE_BODY` | `pane-graph.ts` | module-private function-expression string; reads only `props.pane`; absent seam ⇒ `return`; never throws | **not** — read the node, not the code |
| `paneSubtreeRoot` | `pane-graph.ts` | `(def, ctx, sidebarZone, collapsed?) => LegacyNodeData` — the frame's four props (`id`, `data-pane-id`, `collapsed`), the frame's classes, children `[head, body]` | read the NODE SHAPE: the four `.pane-drop` `props.pane`/`props.zone` pairs, the head's and grip's `props.pane`/`name`, the frame's `collapsed` carrier |
| `togglePaneCollapse` | `preload.ts` / `sidebar-panes.ts` | `SidebarMethods.togglePaneCollapse(id: string): void`; `private togglePaneCollapse(paneId: string): void` — **name unchanged, file unchanged** | **call the bridge seam**; the private host method is not interface |
| `zoneOrientation` | `pane-drag.ts` | `(zone: LayoutZoneName) => 'vertical' \| 'horizontal'` — the ONE axis reading `panePaintAxesOf` consumes through the EXISTING import edge | call it |
| `PANE_FRAME_CLASS`, `PANE_COLLAPSED_CLASS` | `pane-graph.ts` | `'pane-frame'`, `'is-collapsed'` | read the classes on the frame |
| `GESTURE_SELECTOR`, `PANE_HEADER_CLASS`, `PANE_FRAME_CLASS` (renderer's own) | `renderer.ts` | module-private (`READ` `:472`, `:480`, `:484`) | **not** — a sibling reads the surface, never the resolution |

- **The handler body contract:** reads `ctx.node?.props?.['pane']` and nothing else; no current-state read, no next-state computation, no second address. `data-pane-id` belongs to the FRAME (the drag's identity source and 40+ driver reads) and MUST NOT be read here.
- **The act's body contract:** `private togglePaneCollapse(paneId: string): void`; guard non-string/empty; guard `registry.get`/scope/`isEnabled` (unchanged, `READ` `:3451-3455`); `base = coerceLayout(this.layout ?? defaultLayout())`; find the entry; **present ⇒ ONE** `this.setLayout(setPaneCollapsed(base, paneId, entry.collapsed !== true))`; **absent ⇒ the landed backfill**, which writes a DERIVED placement and `collapsed: true` and is NAMED, never re-graded as a one-leaf write.
- **One carrier computation site:** the frame's `collapsed` attribute and `is-collapsed` class come out of `paneSubtreeRoot`, from the ONE boolean `resolveEnabledZonePanes` already resolved (`pane-graph.ts:220-221`) — the assembler must not re-derive it, and `sidebar-panes.ts` must not compute a second one.

## 4. The invariants the integration must hold

1. **Every pane element is AUTHORED data at its envelope site** (D-8): head/grip/drops/control/body are `LegacyNodeData` in `pane-graph.ts`; `index.html` carries CSS only; no `createElement`/`innerHTML`/`setAttribute` stamps any of them.
2. **One write per press**, one member, one address (O3); `zones`/`stage`/`topBar` and every other pane entry byte-identical; the value is an explicit boolean BOTH ways, never a delete.
3. **The head is the body's SIBLING and the body is the pane's ONLY scroller** — authored position (`[head, body]`), never a `position: sticky` pin (`ASM-U2-7`).
4. **The collapsed pane withholds the body's CHILDREN, never the body NODE** (`ASM-U2-2`) — the landed `unit-live11` assertion depends on it, and so does `DOC-GAP`-free `get_rendered_html` typing.
5. **The minimum is the head's `min-content`**: no JS clamp/floor of a pane or head extent anywhere in `src/**`, no `DEFAULT_PANE_COLLAPSED_SIZE`-shaped constant, and the sheet's collapsed arm writes `auto` with no figure (`ASM-U2-1`).
6. **The glyph has ONE owner**, keyed on the PANE's own `collapsed` carrier and scoped by `>` — the ZONE's `collapsed` (`U-1b`) must never speak for a pane's glyph.
7. **The pill is QUIETER than the line and OPAQUE**, derived by `color-mix` toward `--bg` from the block's own declared tokens (`ASM-U2-6`); **no custom property is declared or moved inside the three theme blocks** — the `G-5` fifteen-token census is unmoved.
8. **The lane's box is UNMOVED**: the pill is a pseudo, the four 6px rules and `#app .gutter[zone]`'s `position/z-index/background/touch-action` stay verbatim, and the hover target stays the whole lane.
9. **The vocabulary moves ONLY where D-14 named a collision** (`pane-head`/`pane-grab`/`pane-collapse`/`pane-drop`, plus `pane-body`): the superseded class must not survive in `src/**`, `index.html` or `scripts/**`; the IDS stay the fork's (`pane-<id>`, `pane-collapse-<id>`, plus `pane-head-<id>`/`pane-grab-<id>`/`pane-grab-<id>-<zone>`/`pane-body-<id>`).
10. **Only the frame root and the collapse control carry `data-pane-id`** (`READ` the landed sibling row `zone-collapse-target.test.ts:1442`); every other new node carries its own id and `props.pane` where it names a record.
11. **The seam does not move**: `preload.ts` keeps `togglePaneCollapse`; ONE md5 re-record (`sidebar-panes.ts`) and no second row added to `UNTOUCHED_DIGESTS`.
12. **The driver's frozen censuses are unmoved** (`R-10`): no new `BLOCKS` key (100-key census + sha256 sequence; 47-key fixture census); the unit's live rows are EXTENDED inside `uf_panes_1`, `uf_panes_8`, `uf_layout_10`.

## 5. Failure and boundary states

| State | Required behaviour |
|---|---|
| malformed handler node (absent/blank `props.pane`, or `data-pane-id` only) | no-op, **zero** calls at the seam, never a throw |
| unknown / unregistered / disabled / operator-scope pane id | the act returns BEFORE any write (`READ` `:3449-3455`) |
| record absent for an enabled pane | the landed BACKFILL arm (derived zone/index + `collapsed: true`) — NAMED as the known residue, one `setLayout`, never graded as a one-leaf write |
| collapsed pane | frame authors `[head, body]`, body's children `[]`, both carriers set; the ORDER of the body's children is withheld, never the node |
| a pane whose zone is collapsed (`U-1b`) | the pane payloads are not emitted at all (`READ` `:510-516`) — this unit does not re-open that arm |
| a stage / zone-less pane | `panePaintAxesOf` answers `{ both, both, null }` at the HELPER; its PAINT is a named `DOC-GAP` (no app-graph pane stands outside the four zones at this head) |
| a horizontal (`top`/`bottom`) pane | the arm is authored and graded at the HELPER only; the fork lays panes down a column in every zone — a named `DOC-GAP` |
| a lane narrower than the pill | `min(7px, 100%)` / `min(48px, 100%)` cap the pseudo inside the lane (`ASM-U2-5`); a literal `7px` is a red |
| a re-assembly over an already-authored envelope | the frame is authored fresh per payload (no duplication); the container's own merge arm is `U-1b`'s recorded finding and is not re-opened here |

## 6. The evidence class of each arm

| Arm | Where | Class |
|---|---|---|
| limbs `A`–`I` (the bar, the leaf act, the axes helper, the head-out-of-scroller source terms, relocation survival, the head minimum, the pill's figures/ink/census, the vocabulary, the authoring) | `tests/integration/shell-chrome/pane-head-target.test.ts` | **node/envelope.** `A`/`E`/`H` drive the REAL `assembleAppGraphEnvelope` over a REAL `PaneRegistry`; `B` drives the REAL `SidebarPanes` over the DOM double + the authored body in a parameter sandbox; `C` is pure; `D`/`F`/`G`/`I` are SOURCE clauses and say so. `RUN` RED: 9/9 failed (`A` 20 problems, `B` 4, `C` 1, `D` 3, `E` 2, `F` 2, `G` 8, `H` 19, `I` 9) ⟨then **`RUN` GREEN `9 passed (9)`** after §2's landing and the row's own `(c2)` ordering fix — `docs/L1/unit-u-2-pane-head.md` §7a⟩ |
| the column geometry, the head adding nothing to the body's `scrollHeight`, the collapsed box being the head only, the `auto`/`hidden` paint, the glyph, the control-never-arms-a-drag rule, the head's `min-content` floor under a squeezed zone, the pill's box/ink/lane-hit | `node scripts/live-drive.mjs --block=uf_panes_1,uf_panes_8,uf_layout_10 --display=:0` | **`G8`-ONLY.** No node row may claim any of them; the three extended blocks are the ONLY reading of each |
| the instrument's own source contract (the `node --check` row included) | `tests/live-drive-contract.test.ts` | instrument/envelope — it reads the driver as TEXT; the new spawn row is the one leg that proves the driver LOADS (`docs/L1/unit-u-1b-app-green-pass.md` §6) |
| the md5 pin | `tests/pd-ui-1-theme-register.test.ts` `P-TH-SM-1(f)` | a `[D]` byte oracle; proves nothing about behaviour |
| the landed `unit-live11` bridge assertion | `tests/unit-live11-bridge-seams.test.ts:453/465` | outside the grant; a NEGATIVE constraint this unit's shape must keep satisfied |

## 7. The endpoint count

**This behaviour adds no endpoint** (`N` stays **26**, cap **310**). `SidebarMethods` keeps **37** members: `togglePaneCollapse` is neither renamed nor re-shaped — only the authored control's operand moves. `setPaneCollapsed` and `panePaintAxesOf` are **module-internal exports** (not MCP tools, not bridge methods, not vendored exports), and `strata/modules.json` is untouched by this pass.

## 8. Findings routed up — recorded, not widened

- **`P1` (measurement).** The superseded class's census is **25 driver lines** (`RECORDED` here by a content read of `scripts/live-drive.mjs`), consistent with L1 §1's `27`-occurrence/`25`-line correction. Both are READINGS; neither is a constant, and no limb may assert the count.
- **`P2` (contract correction — L1 `C-7` is half-empty).** `C-7` states that `tests/live-drive-contract.test.ts` carries "the source reads that name `/pane-collapse-toggle/`". `READ`: that token appears **0** times in the register; its only `#pane-collapse-` read (`:2730`) is the ID family, which STAYS. So the register's only edit is the OWED `node --check` row. Recorded so the landing does not invent a re-grain to satisfy a stale cell.
- **`P3` (design tension, resolved here).** `PANE_COLLAPSE_HANDLER`'s VALUE (`'togglePaneCollapse'`) is spelled identically to the bridge seam it routes to. Limb `A` reads the constant and limb `H` forbids only the superseded CLASS, so both are satisfied by leaving the handler name alone; renaming it would move the seam's own spelling into the graph for no behaviour.
- **`P4` (carried, not this unit's).** `uf_layout_10`'s `U-5` §7.2 limbs are `NOT-CONCLUSIVE` (`U-1b`'s §4b) and grade `U-5`. They are neither fixed nor excused here, and the live leg must be reported with that red named if it appears. ⟨`G8` append `2026-11-15`: it DID appear — the scoped leg read `U-5=FAIL` (`limb2Held=false`, `limb3Held=false`; the stage box `scrollHeight=634 clientHeight=634`, its probe document `mounted on the stage=false`), named in `docs/L1/unit-u-2-pane-head.md` §7a and carried.⟩
- **`P5` (cost, named not absorbed).** The scope cut's own teeth: `D`/`F`/`G`/`I` are SOURCE clauses, so a landing can turn them green while the APP still paints a header inside a scroller. That is why none of them may be quoted as app-green and why `G8` is mandatory pre-DONE (RCA-11/RCA-12).

**Verdict:** L3 receives the sealed surface — `setPaneCollapsed` as the ONE write; `panePaintAxesOf` as the TOTAL axis split; the authored bar's five node shapes; the frame's `collapsed` carrier pair; `GESTURE_SELECTOR`/`PANE_HEADER_CLASS` re-grained to the grip; the sheet's declared rules whose paint is `G8`-only; and `preload.ts` untouched.
