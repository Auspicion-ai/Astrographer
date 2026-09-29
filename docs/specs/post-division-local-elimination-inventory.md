# POST-DIVISION LOCAL-ELIMINATION INVENTORY — the fork-local relocatable-UI code the rebuild eliminates, what consumes it, and which tests pin it

**Date:** 2026-09-28 · **Pass kind:** **READ-ONLY INVENTORY** (**one** write: this file) · **Branch read:**
`post-division-rebuild` at **`b6791e0`**. · **Layer (RCA-12, mandatory):** **DOC-LAYER / inventory record —
NOT app-green, NOT envelope-green, NOT store-green, NOT live-green.** Every foundation-status claim below is a
**file-existence + symbol read of the adjacent foundation tree**; every test claim is a **grep reading**; every
suite count is a **QUOTED recorded reading** and is labelled as such. **No suite was run by this pass** (`npm test`,
`npm run build`, `npx vitest` and the app were all deliberately not invoked).

**Sibling artifact.** `docs/specs/rebuild-drift-map-2026-09-21.md` (the drift map for the *landed specs* half).
This file is the **implementation half** of the same program: which fork-local *code* the expanded foundation's
already-landed mechanisms supersede. Both are audit records; neither is a contract.

**The product-owner instruction this inventory executes (quoted verbatim).** *"Start a post-division rebuild git
branch for the project. This will be using the expanded version of the base Provident-Electron project hosted in an
adjacent folder (or at https://github.com/LittleKingsguard/Provident-Electron) to replace the local implementations
of the added elements documented in the guides. Additionally it will use the expanded Gnosis engine that offloads
more of the Astrographer-internal graphing. All local code implementing the relocated UI or delegated engine
functions, and the tests that apply to those features, will be eliminated in this branch."*

**Scope of THIS file = the RELOCATED-UI half only.** The delegated-engine half (the expanded Gnosis engine's
offloaded graphing) is **not** inventoried here. **UNVERIFIED in this pass:** any engine/`gnosis-*` offload
elimination.

**Citation discipline (binding on this file).** Every claim cites a `path` + **symbol** / **file name** /
**§section** / **row id**. **No line numbers appear in this file.** Two sources are distinguished throughout:

| Marker | Means |
| --- | --- |
| **READ** | a file/symbol/count this pass actually read or grepped on the named tree |
| **UNVERIFIED** | named but NOT read/run by this pass — never to be treated as established |
| **RECORDED** | a figure quoted from a tracker as a recorded reading (not this pass's measurement) |
| **LIVE/APP** | assembled-renderer / running-app evidence — **none is produced by this pass** |

**The two trees (both READ).**

| Tree | Path | Head read | `src/**` file count (READ) |
| --- | --- | --- | --- |
| **Fork** (this repo) | `/media/ryanr/Shared Files/Projects/Astrographer` | `post-division-rebuild` @ `b6791e0` | **72** (71 `.ts` + `src/renderer/index.html`) |
| **Foundation** | `/media/ryanr/Shared Files/Projects/Provident-Electron` (adjacent, **not a dependency**) | `main` @ `8f193a8` | **33** (32 `.ts` + `src/renderer/index.html`) |

**Fork-divergence provenance.** `docs/FORK-DIVERGENCE.md` §2 rows **1–7** are the fork's own chrome/layout delta
tabulation and are the seed set for §2 below; the covering feature requests are `SC-1..SC-7`
(`docs/feature-requests/provident-electron-shell-chrome-requests.md`) and the `SCH-1..SCH-13` package
(`docs/feature-requests/provident-electron-shell-chrome-handoff.md`). **This pass VERIFIED each §2 row against the
file tree and EXTENDS the set** (see §2.0).

---

## 1. The foundation element set the rebuild targets (READ — file existence + exported symbols)

The foundation's work queue is **CLOSED**: `../Provident-Electron`'s ledger records **21 DONE / 0 open = 21 units,
every unit done, no unit blocked** (**RECORDED** — quoted from the foundation's own `git log` head commit subject
`7908c7b` and its `fc125c1`/`8f193a8` successors). Every module in the `replaces` column below **EXISTS on disk**
and **EXPORTS the named symbols** (READ). **Caveat recorded honestly:** the *filing-pass* headers of some foundation
specs still say *"the module does not exist"* (e.g. `docs/specs/container.md`, `docs/specs/overlay.md` header
blocks) — those statements are **superseded filing-pass status text**; the module files and their test files are
present and the ledger is closed. **The governing status is the module file's existence plus the ledger row, and
this pass read the file, not the stale header.**

| Foundation unit | `src/shared/<file>.ts` (READ) | Exported symbols (READ) | Covers SC/SCH |
| --- | --- | --- | --- |
| **`U-THEME`** | `theme.ts` | `resolveTheme`, `applyThemeDeclaration`, `ThemeEnv`, `ThemeResolution`, `ThemeAttributeWrite` | **SC-4** / `SCH-3` |
| **`U-THEME-CONTROL`** | *(no module — an AUTHORED provident control in the demo envelope; READ of `docs/specs/theme-control.md` header + `docs/guide/theme-control.md`)* | — | `SCH-3` UI half |
| **`U-OVERLAY`** | `overlay.ts` | `overlayTransition`, `overlayInertDeclaration`, `OverlayState`, `OverlayTransition`, `OverlayInertWrite` | **SC-3** / `SCH-12` |
| **`U-MENULIB`** | `menu-template.ts` | `normalizeCatalog`, `buildMenuTemplate`, `selectCatalogItem`, `CatalogEntry`, `MenuTemplate`, `PickerFn` | **SC-7** / `SCH-5` |
| **`U-CONTAINER`** | `container.ts` | `tokensFor`, `orientationFor`, `containerDeclarationFor`, `ContainerDeclaration`, `ChromeTokenFn`, `AxisResolver` | `SCH-10` |
| **`U-SLOTHOST`** | `slot-host.ts` | `createSlotHost`, `SlotHost`, `SlotHostOptions`, `SlotHostRefusal`, `SlotHostResult`, `SlotAttribute`, `SlotKey` | `SCH-9` host half |
| **`U-LISTHOST`** | `owned-list-host.ts` | `createOwnedListHost`, `OwnedListHost`, `ListEntry`, `ListHostResult`, `ListHostRefusal`, `ListKey` | `SCH-11` |
| **`U-ZONES`** | `zones.ts` | `isEmpty`, `trackFor`, `TrackSpec` | **SC-5** / `SCH-4` |
| **`U-CENSUS`** | `census.ts` | `computeTrackVars`, `ZoneId`, `TrackVars` | `SCH-8` census half |
| **`U-PROJ`** | `layout-projection.ts` | `project`, `projectVar`, `applyProjection`, `applyVarsToRoot`, `Projection`, `VarSpec`, `ProjectionSkip`, `VarWriteSink` | `SCH-8` projection half |
| **`U-GSESSION`** | `gesture-session.ts` | `createGestureSession`, `installGestureListeners`, `detachGestureListeners`, `GestureSession`, `SessionStats`, `GestureStats`, `POINTER_TYPES`, `SessionOptions`, `GestureOptions` | **SC-2** / `SCH-2` |
| **`U-RELOCATE`** | `relocate.ts` | `createRelocateSession`, `withinProximity`, `RelocateSession`, `RelocateHandle`, `RelocateStats`, `RelocateOptions`, `CommitSink`, `PreviewSink` | **SC-2** / `SCH-2` |
| **`U-GUTTER`** | `gutter.ts` | `createResizeController`, `clampToBounds`, `ResizeController`, `ResizeControllerHandle`, `ResizeStats`, `CommitSink`, `ClampBounds`, `AxisFor`, `BoundsFor`, `DefaultSizeFor`, `IsResizable` | **SC-2** / `SCH-6` |
| **`U-GUTTER-UI`** | `gutter-affordance.ts` | `createGutterAffordance`, `cursorDeclarationFor`, `domEventSource`, `GutterAffordance`, `GutterAffordanceOptions`, `GutterAffordanceStats`, `PointerResolver`, `SizeFromPointer`, `AxisOf`, `ApplyPreview`, `ApplyCursor`, `Commit`, `MoveTypeOf`, `CursorOf`, `PreviewState`, `EventSourceLike` | **SC-6** / `SCH-6` UI half |
| **`U-FOCUS-MODEL`** | `focus-model.ts` | `focusTransition`, `focusOrder`, `focusIndex`, `persist`, `FocusState`, `FocusEntry`, `FocusVerb`, `FocusRefusalCode`, `FocusId` | **SC-6** / `SCH-7` |
| **`U-FOCUS-TOOL`** | *(no module — the MCP tool; `src/main/mcp-server.ts` + `security.ts` + `shared/types.ts`)* | the `provident.focus` tool row + the `'focus'` `RpcMethod` member | **SC-6** |
| **`U-MOUNTGUARD`** | `mount-invariant-guard.ts` **+ a fix in `src/renderer/runtime.ts`** | `probeMountInvariant`, `assertMountInvariant`, `MountExpectation`, `MountViolation`, `MountViolationCode`, `MountRootObservation`, `MountInvariantResult` — **plus the foundation's `reconcileMount()`/`tearDownGraph()` in `../Provident-Electron/src/renderer/runtime.ts`** (READ) | **SC-1** / `SCH-1` invariant half |

**User-facing guide (READ of the directory; pages NOT read — UNVERIFIED as content).**
`../Provident-Electron/docs/guide/` contains **16 files** (READ): the three scaffolding files `README.md`,
`TEMPLATE.md`, `00-base-surface.md`; the two cross-cutting pages `seams.md`, `mcp-parity.md`; and the **eleven
per-unit pages** `theme.md`, `theme-control.md`, `overlay.md`, `menulib.md`, `container.md`, `relocate.md`,
`zones.md`, `gutter.md`, `gutter-ui.md`, `focus-model.md`, `focus-tool.md` — **thirteen "planned pages"** in the
foundation's own words (RECORDED from its `git log` head subject `8f193a8`). The product owner's instruction names
these guides as the authority for **what counts as a "relocated UI element"** — they were **not** read by this
pass, so every "what it does today" cell below is derived from the **fork's code**, never from a guide.

---

## 2. THE CANDIDATE ELIMINATION ROWS

### 2.0 The verification of `docs/FORK-DIVERGENCE.md` §2 rows 1–7 (READ)

| §2 row | Capability | Fork artifacts as cited in §2 | Verified this pass? | Extension this pass adds |
| --- | --- | --- | --- | --- |
| **1** | Shell regions + mount safety | `src/renderer/index.html` region markup; `src/renderer/runtime.ts` `tearDownGraph` sweep | **YES** — `#tab-strip`, four `.gutter[data-zone][data-axis]`, `#settings-modal`+scrim+body, `#settings-toggle` all present; the `#wiki-root` sweep present in `tearDownGraph` | the markup is **not** a "region registry" — there is **no declared region list in code**; the regions are implicit in CSS grid-area rules + the four gutter divs (**`PD-REGION-1`**, **`PD-ZONES-2`**) |
| **2** | Pointer-gesture controllers | `src/renderer/renderer.ts` `installShellPointers`; `src/renderer/pane-drag.ts` `createDragController`; `src/renderer/pane-gutter.ts` `createGutterController` | **YES** — all three symbols present | the gesture **state machine** in `renderer.ts` is a **separate module worth eliminating** (`beginGesture`/`onGestureMove`/`onGestureUp`/`onGestureCancel`/`revertPriorGesture`/`onLostPointerCapture`/`onGestureDblclick`) — **`PD-GESTURE-1`** |
| **3** | Overlay/modal primitive | `src/renderer/modal-state.ts` `createModalController`/`installSettingsModal`; `src/renderer/index.html` markup + frame/scrim CSS | **YES** | the **re-parent** half (`installSettingsModal` moving `#panes` + `#operator-panes` into `#settings-modal-body`) has **NO foundation counterpart — the foundation REFUSES that half** (`docs/specs/overlay.md` header: *"the RE-PARENT HALF **REFUSED**"*) — a **NAMED COLLISION** (**`PD-OVERLAY-1`** §9) |
| **4** | Theme token layer + tri-state appearance | `src/renderer/index.html` token block; `src/renderer/theme.ts` `resolveTheme`/`applyThemeToRoot`; `src/renderer/renderer.ts` `installTheme` | **YES** — all present | the **signature collision**: fork `resolveTheme(setting, prefersDark: boolean)` vs foundation `resolveTheme(setting, env: ThemeEnv)`; fork `applyThemeToRoot` **writes** `dataset.theme`, foundation `applyThemeDeclaration` **returns the write as data** — a **NAMED COLLISION** (**`PD-THEME-1`**) |
| **5** | Zone tracks, containment, empty-track collapse, slot order | `src/renderer/index.html` track/area CSS + `:has(.is-empty)` collapse; `src/renderer/layout-state.ts` `layoutCssVars`/`zoneTrackCssVars`/`applyLayoutToRoot`; `src/renderer/sidebar-panes.ts` `applyZoneTracks` | **YES** — all present | **containment and slot order have NO fork-local implementation at all** — see §9 `STAYS-FORK-LOCAL`/`ABSENT` rows |
| **6** | Main-focus tab model + shell strip + MCP focus seam | `src/renderer/tab-state.ts` `focusTarget`; `src/renderer/tab-strip.ts` `TabStrip`; the MCP focus tool in `src/main/mcp-server.ts` | **YES** | the **tool-shape collision** is the load-bearing finding — the fork's declared args are **not** the foundation's (**`PD-FOCUS-3`**, §7) |
| **7** | Data-driven native menu + dialog seam | `src/main/app-menu.ts` `buildMenuTemplate`/`normalizePaneCatalog`/`orderPaneCatalog`/`importSelectionFromDialog`; `src/main/import-directory.ts` | **YES** | the **`orderPaneCatalog`/dialog half is APP POLICY the foundation declines** (`docs/specs/menulib.md` §2.1 item 1: *"import semantics stay fork-side"*) — **`PD-MENU-2`/`PD-MENU-3`** |
| **8** | Content-only repopulation + pane/slot reconciliation | `src/renderer/runtime.ts` `applyContentReconcile`; `src/renderer/content-reconcile.ts` `reconcileDocumentRoots` | **YES** | **NOT A CANDIDATE** — `docs/FORK-DIVERGENCE.md` §2 itself records it as a host use of **published engine primitives**; §3 rule 1 fails (not a *mechanism*) |
| **9** | Host/domain layer | the whole RAG/doc-flow/editor/MCP surface | **YES** | **NOT A CANDIDATE** — §3 rule 2 (app behavior) |

### 2.1 The rows

Every row: **id · path + symbol · today · replaces · consumers · classification · test disposition · live coupling ·
risk**. Consumers are counted by **`grep` on the exact `import … from '<path>.js'` specifier** (READ); a file that
merely *mentions* a module name in prose is **not** counted as an importer.

---

#### `PD-REGION-1` — the shell region markup

> **⟶ SUPERSEDED IN PART 2026-09-28 (the `PD-UI-12` boundary-spec pass; annotated here by the supervisor, and NOTHING in the row below is rewritten — this note is the reconciliation).** **FINDING `B-1` (MEDIUM), filed by `docs/specs/unit-pd-ui-12-slot-host-boundary.md` `§9` item 7:** **this row's `Replaces` cell put `U-SLOTHOST` against the region markup, which is the DECLINED half.** **The architect's ruling `A-10` (proposal `§4.7`) establishes that the foundation DECLINED `SCH-1`'s REGION-HOST half, so THE REGION BOXES STAY FORK-AUTHORED MARKUP** — cross-verified by the boundary spec against four foundation records (`S-d2`, `S-d14`, `H-r17`, the `Q6` answer) and against `docs/specs/post-division-foundation-adoption-surface.md` `§9`. **The row's OWN `S-12` already concedes the artifacts are `ABSENT, not delete`.** **Consequence, binding on every later pass: NO region host is proposed or emulated, the markup work is NOT absorbed by the slot host unit, and `U-SLOTHOST`'s moved-half is EMPTY (the boundary spec's measured conclusion). Gate 1 never applied `A-10` back to this row — that is why this is recorded as a NEW finding rather than a silent correction.** **Read the row below THROUGH this note; its classification column applies to the `:has(.is-empty)` COLLAPSE rules and to the mount sweep only, never to a region host.**

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/index.html` — the **elements** `div#tab-strip`, the four `div.gutter[data-zone][data-axis]`, `div#settings-modal` + `div#settings-modal-scrim` + `div#settings-modal-body`, `button#settings-toggle`; `div#app`, `div#panes`, `div#operator-panes` |
| **What it does today** | Declares the shell's chrome boxes in static HTML; there is **no region registry in code** — the boxes are coupled to CSS `grid-area` selectors (`#app [data-zone="header"]` etc.) and to the delegated `.gutter[data-zone]` pointer wiring |
| **Replaces** | **`U-SLOTHOST`** `slot-host.ts` `createSlotHost`/`SlotHost`/`SlotAttribute` **+ `U-CONTAINER`** `container.ts` `containerDeclarationFor`/`orientationFor`/`tokensFor` |
| **Consumers (`src/**`)** | **READ, exact specifier** — none import `index.html` (it is `cp`'d by `package.json` `build`). Runtime consumers by **selector string**: `src/renderer/renderer.ts` (`installTheme`/`installLayout`/`installShellPointers`/`installSettingsModal` resolution), `src/renderer/sidebar-panes.ts` (zone/`is-empty` mirrors), `src/renderer/tab-strip.ts` (`TabStrip` mounts `#tab-strip`), `src/renderer/modal-state.ts` (`installSettingsModal`), `src/renderer/pane-gutter.ts` (`#app` rect), `src/renderer/pane-drag.ts` (`.layout [data-zone]` projection) |
| **Consumers (`tests/**`)** | **READ, 10 files read `index.html`** — `tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts`, `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts`, `tests/unit-u-shell-3-collapsible-panes.test.ts`, `tests/unit-u-shell-4-drag-relocate.test.ts`, `tests/unit-u-shell-5-resizable-gutters.test.ts`, `tests/unit-u-shell-6-hover-affordance.test.ts`, `tests/unit-u-shell-7-settings-modal.test.ts`, `tests/unit-u-shell-9a-main-focus-tabs.test.ts`, `tests/renderer-empty-zone-track.test.ts` |
| **`scripts/**`** | **READ** — `scripts/live-drive.mjs` (selector-driven CDP probes on `#tab-strip`, `#settings-modal`, the gutters, `#wiki-root`); `scripts/start-app.sh` (launch only) |
| **Config coupling** | `package.json` `build` — `cp src/renderer/index.html dist/renderer/index.html`; `esbuild … --outdir=dist/renderer` (**READ**) |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — the *declaration* half (static element list + gutter divs) is mechanism and is replaced by the slot-host declaration; the **app's zone-name vocabulary** (`stage`, `top-bar`, `left`, `right`, `header`, `footer`) and the three app mount roots (`#app`, `#panes`, `#operator-panes`) are **app behavior** and stay. This is **not** `DELETE-WHOLE-FILE`: `index.html` survives (tokens, app CSS, mount roots) |
| **Test disposition** | the **10 `index.html`-reading suites** are **REWRITE** (they pin selectors/grid-areas a slot host would re-derive); `tests/unit-u-shell-6-hover-affordance.test.ts` is **KEEP** (it pins `is-clickable` app CSS, untouched) |
| **Live-battery coupling** | **READ** — `scripts/live-drive.mjs` blocks `user2_pane_drag`, `user3_collapse_orientation`, `user7_zone_resize`, `user8_zone_boundary`, `user9_search_open_in_tab`, `user1_tab_new`, `user10_collapse_vertical_text`, `uf_layout_10`, `uf_panes_8`, `uf_panes_12`, `uf_tabs_3`, `uf_tabs_7`, `uf_hist_6` (block names READ). **These are the §5.U `U-1…U-8` delta-matrix rows' carriers** |
| **Risk / collision** | **Cannot be split from `PD-ZONES-2`** (markup and grid CSS are one unit of meaning). A partial landing reds the `:has(.is-empty)` collapse **live** while the node suite stays green (RCA-12: envelope-green ≠ app-green) |

---

---

#### `PD-UI-13` — the markup / declaration row (MINTED 2026-09-28 by the `W0` dossier-and-decision pass, gate finding `X-4`; read `PD-REGION-1` above THROUGH its `SUPERSEDED IN PART` note — this row is the owning row that note said was missing)

**WHY IT IS MINTED, and why it lives HERE rather than in the proposal's `§4.1`.** Gate finding `A-1` re-admitted `PD-UI-3` as a **BUILD** and ruled that *"the markup/region declaration gets its own row, owned by the `PD-UI-12` deferral ruling (`A-10`) — not left split between `PD-UI-5`'s affordance build and W6"*; gate finding `X-4` recorded that neither the **`W6a`/`W6b` markup row** nor the re-admitted BUILD had an owning unit. **`A-1`/`X-4` are the minting authority.** **The placement ruling, stated plainly:** `docs/specs/post-division-rebuild-proposal.md` `§4.1` is a table of **FOUNDATION elements → fork artifact → corrected classification** — every row of it names a foundation module and symbol (`theme.ts` → `resolveTheme`, `zones.ts` → `isEmpty`/`trackFor`, `container.ts` → `containerDeclarationFor`, …). **This row's subject has NO foundation counterpart at all** (the region-host half was **DECLINED** by the foundation: `SCH-1`, `S-d2`/`S-d14`/`H-r17`/the `Q6` answer), so it cannot be expressed as a `§4.1` row without falsifying that table's shape. **It is a fork-local artifact with no foundation element to be classified against, which is exactly what THIS inventory's `§2.1` is for** — hence the mint lands here, beside the `PD-REGION-1`/`PD-ZONES-2` rows it owns.

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/index.html` — **the grid/track CSS + the region declaration markup**: the `.layout` frame (`.layout`'s `grid-template-columns/rows/areas` — one `stage` area, the old left/stage/right/header/footer shell columns removed by LIVE-6/B); the `#app > #wiki-root` grid (the per-zone track custom properties `--zone-left-track`/`--zone-right-track`/`--zone-header-track`/`--zone-footer-track`, `grid-template-columns`/`grid-template-rows`, the three-row `grid-template-areas` block `header/left·main·right/footer`); the zone→`grid-area` selector set (`#app [data-zone="header"|"left"|"right"|"footer"]`, `#app [id="zone:main"]`, `#app [id="zone:sidebar"]`, `.layout #panes`, `.layout .zone-footer`); the **empty-track collapse rules** `#app > #wiki-root:has([data-zone='<z>'].is-empty:not(.is-revealed))` ×4; the gutter element + CSS declarations (`div.gutter[data-zone][data-axis]` ×4 — `.layout > .gutter { display: none }`, `.layout .gutter`, `.layout .gutter:hover`, `.layout .gutter[data-axis='columns'|'rows']` cursor rules); the region markup elements `div#tab-strip`, `div#settings-modal` (`.settings-modal`, `.is-closed`), `div#settings-modal-scrim`, `div#settings-modal-body`, `button#settings-toggle`; and the three app mount roots `div#app`, `div#panes`, `div#operator-panes`. |
| **What it does today** | Declares the shell's **chrome boxes and its grid geometry in static HTML/CSS**: there is **no region registry and no declaration API in code** — the boxes are coupled to CSS `grid-area` selectors and to the delegated `.gutter[data-zone]` pointer wiring, and the track geometry is declared in CSS while the **per-zone VALUES are written from JS** (`layout-state.ts` → `applyLayoutToRoot`/`applyZoneTracks`, the `PD-ZONES-1`/`PD-ZONES-3` rows). **The empty-zone collapse works because the JS-written custom property and the CSS declaration agree on the same element** (the `:has(...)` rules must target the grid element ITSELF; a rule on an ancestor frame is only inherited and loses to the base declaration — the `EMPTY-ZONE-TRACK-NOT-COLLAPSED` defect's own recorded cause). |
| **Foundation element(s) it relates to** | **`U-CONTAINER` (`E5`) — and ONLY in the declaration sense.** `src/shared/container.ts` (`containerDeclarationFor` → `{className, declaredText}`, where `declaredText` is the literal `contain: layout style paint`; plus `tokensFor`/`orientationFor`) is the vendored module this row's chrome *could* declare through. **THE BOUNDARY SPEC'S FINDING, re-verified at this pass: `U-CONTAINER`'s declaration has NO WRITE SITE in this repo** — `containerDeclarationFor`/`tokensFor`/`orientationFor` are called from **nothing** in `src/**`, and `contain:` appears **only inside the vendored `src/shared/container.ts` itself** (no `contain:` in `src/renderer/index.html`, in any other `src/**` module, or in `tests/**`). **`PD-UI-3` (the `A-1` re-admitted BUILD) is the row that supplies that write site** — `tokenFn`/`axisResolver` + applying `containerDeclarationFor`'s returned text at the fork's own site. **NO REGION HOST is proposed or emulated for this row** (`A-10`; `H-r17`/`Q6`): the foundation **DECLINED** `SCH-1`'s region-host half, and `U-SLOTHOST`'s moved-half is **EMPTY** (`docs/specs/unit-pd-ui-12-slot-host-boundary.md` §9 / the `PD-REGION-1` note). |
| **Classification** | **`KEEP` for the declaration markup — NOT a deletion, and NOT a slot-host adoption.** The region boxes, the grid/track CSS and the app's zone-name vocabulary (`stage`, `top-bar`, `left`, `right`, `header`, `footer`) are **fork-authored shell chrome** and STAY (`A-10`'s ruling, verbatim in substance: *"the region boxes STAY fork-authored markup (`SCH-1` declined by the foundation), and therefore W6's declaration half has NO slot-host dependency"*). **What this row OWNS is the WORK, not a deletion:** (a) the **`W6a` declaration-structure land** (the `A-6` two-phase split — structure lands **while the old collapse mechanism still functions**), (b) the **`W6b` cutover** (whose red instrument is the **LIVE** `U-5`/`uf_layout_10` row, **never a node row**), and (c) the **`U-CONTAINER` write site** that `PD-UI-3` owes, applied to this markup. **`PD-ZONES-2` remains the CSS/projection half and is NOT merged here** — the existing row's own risk note stands: markup and grid CSS cannot be split, but they also cannot both be one row's deletion, because there is no deletion. |
| **Constraint (binding, from `A-10`)** | **The region boxes stay fork-authored markup. NO region host is proposed, and none may be emulated under another name.** A later pass that re-files a region-host/SlotAttribute contract against this markup — or that grows a mirror-class taxonomy (`is-empty`/`is-minimized`/`is-revealed`) inside the adopted `U-SLOTHOST` host — **resurrects the DECLINED half** (`H-r15` forbids exactly that re-merge). The project-wide UI constraint still binds (`AGENTS.md`): a *mechanism* may be adopted; a **control node** moved out of the provident graph is a review finding — so the declaration work must not author chrome content outside the graph. |
| **Consumers (`src/**`)** | **READ, exact specifier** — none import `index.html` (it is `cp`'d by `package.json`'s `build`); the consumers are by **selector string**: `src/renderer/renderer.ts` (`installTheme`/`installLayout`/`installShellPointers`/`installSettingsModal` resolution), `src/renderer/sidebar-panes.ts` (the zone / `is-empty` mirrors + the JS track write), `src/renderer/tab-strip.ts` (`TabStrip` mounts `#tab-strip`), `src/renderer/modal-state.ts` (`installSettingsModal`), `src/renderer/pane-gutter.ts` (`#app` rect), `src/renderer/pane-drag.ts` (`.layout [data-zone]` projection). |
| **Consumers (`tests/**`)** | **READ, 10 files read `index.html`** (the same set the `PD-REGION-1` row records verbatim — `tests/unit-u-shell-1-layout-zones.test.ts` … `tests/renderer-empty-zone-track.test.ts`). Their disposition is **REWRITE** where they pin selectors/grid-areas and **KEEP** where they pin untouched app CSS — **per-file re-derivation is this row's own spec-gate obligation** (`X-3`), never inherited. |
| **Live-battery coupling** | **READ** — `scripts/live-drive.mjs`'s `uf_layout_10` (the empty-track collapse, the `W6b` red instrument per `A-6`), plus `user3_collapse_orientation`, `user7_zone_resize`, `user8_zone_boundary`, `user10_collapse_vertical_text`, `uf_panes_8`/`uf_panes_12`. Note the matrix is **FULL at 8** (`G-5`): these enter as **re-pins or extended rows**, never as new slots. |
| **Risk / collision** | **`W6b` is APP-only-visible, and the node suite is blind to it** (RCA-12: the dom-shim is layout-less/CSS-less — *"a half-landing is a live regression every node gate reports green"*). **`npm run divergence` is a MANDATORY PRE-LIVE leg** (`A-7`) and is **RED at this head for an environmental `/dev/shm` reason** (`docs/specs/post-division-rebuild-proposal.md` §7.5; its harness fix is its own owed unit) — so a `W6b` live pass that cannot run must be reported **`PRECONDITION-FAILED` with the reading attached**, never silently parked (RCA-11). |

---

#### `PD-REGION-2` — the stale-mount sweep

| Field | Value |
| --- | --- |
| **Path + symbol** | `src/renderer/runtime.ts` — **`tearDownGraph`**'s `#wiki-root` sweep (the `querySelectorAll('#wiki-root')` loop inside `tearDownGraph`) |
| **What it does today** | Before a fresh render, removes every stale `#wiki-root` element owned by a discarded supervisor — the diff-based render could never remove an untracked root. **Fix home:** defect `STALE-MOUNT-PUSHES-CANVAS` (`docs/defects.md`), live-confirmed |
| **Replaces** | **`U-MOUNTGUARD`** — `mount-invariant-guard.ts` `probeMountInvariant`/`assertMountInvariant`/`MountExpectation`/`MountViolation` **AND the foundation's own fix**: `../Provident-Electron/src/renderer/runtime.ts`'s **`reconcileMount()`** called from **`tearDownGraph()`** (READ) |
| **Consumers (`src/**`)** | `src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts` (both hold a `Runtime`); the sweep itself is module-private |
| **Consumers (`tests/**`)** | `tests/unit-live11-bridge-seams.test.ts` (**PROTECTED** — see §5), `tests/runtime-host.test.ts`, `tests/runtime.test.ts`, `tests/runtime-battery.test.ts`, `tests/blind-runtime-host.test.ts`, `tests/unit-stage-active-tab-display*.test.ts` (4 files) |
| **`scripts/**`** | `scripts/live-drive.mjs` block `stage_multimount_reachability` (READ) — the `UF-STAGE-AT-7` park carrier |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — `runtime.ts` is **heavily forked** (it is the fork's MCP-facing producing process, ~2 000+ lines) so the file is **not** deletable. The **sweep subset is deleted** in favour of the foundation's `reconcileMount()` shape. **This is a MERGE/diff adoption, not a file swap** |
| **Test disposition** | `tests/unit-live11-bridge-seams.test.ts` — **PROTECTED** (pinned by name in the electron-mock census, §5) → any adoption must keep it green **without editing its name**; the multi-mount rows are **REWRITE** candidates only after the census pin is re-stated by its owning unit |
| **Risk / collision** | **THE HIGHEST-RISK ROW.** The foundation's `reconcileMount` is a **`runtime.ts` diff against a different `runtime.ts`** — the fork cannot copy the file. If the sweep is removed before the foundation's mount-invariant probe is wired, defect `STALE-MOUNT-PUSHES-CANVAS` silently regresses **at the APP layer only** (the node suite cannot see it — RCA-12) |

---

#### `PD-GESTURE-1` — the shell pointer-gesture state machine

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/renderer.ts` — **`installShellPointers`** and its module-private machine: `beginGesture`, `clearGesture`, `onGestureMove`, `onGestureUp`, `onGestureCancel`, `revertPriorGesture`, `onLostPointerCapture`, `onGestureDblclick`, `onDocumentPointerDown`, `isInteractiveControl`, `hasClass`, `paneFrameAncestorOf`, `resolvePaneId`, `isLayoutZoneNameValue` |
| **What it does today** | One delegated `pointerdown` on the document; capture threshold, deferred capture, cancel/reversion, double-click reset, click-safety, header-only drag surface |
| **Replaces** | **`U-GSESSION`** `gesture-session.ts` `createGestureSession`/`installGestureListeners`/`detachGestureListeners`/`GestureSession`/`POINTER_TYPES`/`SessionOptions` |
| **Consumers (`src/**`)** | `src/renderer/renderer.ts` (owner); called with a `SidebarPanes` host from the boot function; `src/renderer/pane-drag.ts` + `src/renderer/pane-gutter.ts` supply the drop/resize math it drives |
| **Consumers (`tests/**`)** | **READ, exact specifier** — `tests/renderer-pane-drag-surface.test.ts` (`installShellPointers`), `tests/unit-u-shell-shell-wiring.test.ts`, `tests/unit-u-shell-shell-wiring-adversarial.test.ts`, `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts` |
| **`scripts/**`** | `scripts/live-drive.mjs` — the gesture blocks (`user2_pane_drag`, `user7_zone_resize`, `uf_panes_12`) and the `[DIAG]` native-click probes (READ of the driver's comments) |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — the controller/machine is deleted; the **host adapter** (the `SidebarPanes` seam calls: `startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`/`previewGutter`/`activeGutter`/`commitGutterSize` and the drop/relocate seams) **stays** — it is the one managed write at gesture end that `docs/specs/ui-overhaul.md`'s hybrid rule requires |
| **Test disposition** | the 4 suites above are **REWRITE**; `tests/renderer-pane-drag-surface.test.ts` is the **F-1 `PANE-BODY-GESTURE-SWALLOWED`** regression pin and must be **REWRITTEN, never ARCHIVED** (its subject is a real defect, not a superseded mechanism) |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger §2 entries #18/#19/#20/#21, finding `C-4`). NOTHING ABOVE IS REWRITTEN.** **MEASURED (method `M-static`):** the 4 suites the cell names **reproduce exactly** as this module's test importers, and **two of them are named by §4's `ARCHIVE` row as whole-file `ARCHIVE`** — `tests/unit-u-shell-shell-wiring.test.ts` (**33** literal rows, `measured: M-row`) and `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts` (**5**). **That is a direct contradiction: this cell says `REWRITE`, §4 says `ARCHIVE`.** **A third, `tests/unit-u-shell-shell-wiring-adversarial.test.ts`, is `REWRITE` in §4 — and the §4 `REWRITE` row's own heading (`1 + the tab families`) under-counts it.** **The fourth, `tests/renderer-pane-drag-surface.test.ts`, is the F-1 defect pin and is `REWRITE` in both cells — the one place the two agree.** **Collision (ledger `K-2`):** `tests/unit-u-shell-shell-wiring.test.ts` is also one of the **`G-9` source-text pin files** (`A-5`'s pin set names `unit-u-shell-shell-wiring`), so the row that lands its rewrite owes that pin's **re-derivation by name**.
| **Risk / collision** | `installShellPointers` is **fail-soft and per-document idempotent** (its own documented contract); the foundation session's lifecycle is different — a naive swap can double-register listeners or lose the double-click reset, and **neither is node-assertable at the assembled layer** |

---

#### `PD-GESTURE-2` — the pane drag/relocate controller

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/pane-drag.ts` — **`createDragController`** (the elimination target) alongside `movePane`, `insertionIndexForPoint`, `toZoneBounds`, `dropZoneForPoint`, `withinSnapThreshold`, `zoneOrientation`, `setZoneMinimized`, `legalZonesForScope`, `PaneScope`, `DragPoint`, `ZoneBounds`, `DropResult`, `DragController`, `Rect` |
| **What it does today** | A pointer-drag session for pane relocation: zone-bounds projection, drop resolution, snap threshold, insertion index, minimize/expand |
| **Replaces** | **`U-RELOCATE`** `relocate.ts` `createRelocateSession`/`withinProximity`/`RelocateSession`/`CommitSink`/`PreviewSink` — **the session half only** |
| **Consumers (`src/**`)** | **READ** — `src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts` (`createDragController` at the host), `src/renderer/pane-graph.ts`; `src/shared/dom-shim.ts` carries a `pane-drag` name string (shim surface, **not** an importer) |
| **Consumers (`tests/**`)** | **READ** — `tests/unit-u-shell-4-drag-relocate.test.ts`, `tests/unit-u-shell-shell-wiring.test.ts`, `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts`, `tests/renderer-pane-drag-surface.test.ts` (behaviour-level) |
| **`scripts/**`** | `scripts/live-drive.mjs` (READ — selector `#tab-strip`; the pane-drag block `user2_pane_drag` + the `[DIAG]` comment naming the pane-drag pointer capture) |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — `createDragController` is **DELETE**; **`movePane`/`insertionIndexForPoint`/`legalZonesForScope`/`setZoneMinimized`/`toZoneBounds`/`dropZoneForPoint`/`zoneOrientation` are KEEP**: they encode **Astrographer's zone names, pane scopes (`app-graph`/`operator`), and slot-order policy** — app behavior by `docs/FORK-DIVERGENCE.md` §3 rule 2 |
| **Test disposition** | `tests/unit-u-shell-4-drag-relocate.test.ts` — **REWRITE** (the session rows) + **KEEP** (the `movePane`/ordering rows); `tests/renderer-pane-drag-surface.test.ts` — **REWRITE** |
| **Risk / collision** | **KNOWN OPEN DEFECTS live here**: `docs/next-steps.md` (2026-09-16 batch) records **`N3 PANE-DRAG-TOP-ONLY`** (every drop lands at index 0 — the drop projection reads `.layout [data-zone]`, whose only real box is the zone itself). **Adopting the foundation session does NOT fix `N3`** — the projection input is still the fork's — so the rebuild must not treat the swap as a defect fix. Also: `W2-N7` (MEDIUM, OPEN) records that the shell `pointerdown/move/up` + `getBoundingClientRect` wiring was missing |

---

#### `PD-GESTURE-3` — the pane gutter controller

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/pane-gutter.ts` — **`createGutterController`** (elimination target) alongside `gutterAxis`, `gutterSizeForPoint`, `gutterBounds`, `clampGutterSize`, `setZoneSize`, `isGutterResizable`, `GUTTER_ZONES`, `GutterAxis`, `GutterBounds`, `GutterController`, `Rect` |
| **What it does today** | A pointer-resize session over the four zone gutters: axis resolution, size-from-point, clamp to bounds, commit at gesture end |
| **Replaces** | **`U-GUTTER`** `gutter.ts` `createResizeController`/`clampToBounds`/`ResizeController`/`CommitSink`/`ClampBounds`/`AxisFor`/`BoundsFor`/`DefaultSizeFor`/`IsResizable` **+ `U-GUTTER-UI`** `gutter-affordance.ts` `createGutterAffordance`/`cursorDeclarationFor`/`domEventSource` |
| **Consumers (`src/**`)** | **READ** — `src/renderer/renderer.ts` (`gutterSizeForPoint`), `src/renderer/sidebar-panes.ts` (`createGutterController` at the host) |
| **Consumers (`tests/**`)** | **READ** — `tests/unit-u-shell-5-resizable-gutters.test.ts`, `tests/unit-u-shell-shell-wiring.test.ts`, `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts` |
| **`scripts/**`** | `scripts/live-drive.mjs` blocks `user7_zone_resize`, `user8_zone_boundary`, `uf_layout_10` (READ) |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — `createGutterController` **DELETE** (replaced by `createResizeController` composed on `createGestureSession`); `clampGutterSize`/`gutterBounds`/`setZoneSize`/`isGutterResizable`/`gutterAxis`/`GUTTER_ZONES`/`gutterSizeForPoint` **KEEP** — the zone vocabulary and the 160/1200-px clamps are the fork's `LayoutState` policy |
| **Test disposition** | all 3 suites **REWRITE** for the session rows; **KEEP** for the clamp/`setZoneSize` rows |
| **Risk / collision** | **`W2-N7` (MEDIUM, OPEN)** is exactly this row's live-wiring gap; `H-5` records it as unreachable in the live app. **A node-green on the controller is not app-green** (RCA-12) |

---

#### `PD-OVERLAY-1` — the modal/open-close primitive **and** the re-parent

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/modal-state.ts` — **`createModalController`** (the pure open/close/toggle machine) **and `installSettingsModal`** (the shell wiring: frame/toggle/scrim/body resolution, Escape, click-to-close, **re-parenting `#panes` + `#operator-panes` into `#settings-modal-body`**, class-mirror) |
| **What it does today** | The settings-modal shell: a dedicated scrim, Escape, and the class-mirror state machine |
| **Replaces** | **`U-OVERLAY`** `overlay.ts` `overlayTransition` (the pure state machine), `overlayInertDeclaration` (the inert-background declaration **returned as data**), `OverlayState` |
| **Consumers (`src/**`)** | **READ** — only `src/renderer/renderer.ts` (imports `installSettingsModal`) |
| **Consumers (`tests/**`)** | **READ** — `tests/unit-u-shell-7-settings-modal.test.ts` (**the only importer**) |
| **`scripts/**`** | `scripts/live-drive.mjs` — `ufModal(h, want)` helper (READ) drives the modal live |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — `createModalController` **DELETE/substitute**; **`installSettingsModal`'s RE-PARENT HALF HAS NO FOUNDATION COUNTERPART AND IS EXPLICITLY REFUSED** (`docs/specs/overlay.md` title: *"with the RE-PARENT HALF **REFUSED**"*) → the re-parent is **KEEP-AS-APP-BEHAVIOR**. **A NAMED COLLISION** |
| **Test disposition** | `tests/unit-u-shell-7-settings-modal.test.ts` — **REWRITE** for the state-machine rows; **KEEP** for the re-parent rows |
| **Live-battery coupling** | `scripts/live-drive.mjs`'s `ufModal` probe; the `docs/specs/ui-overhaul.md` §92–97/130/144 record the focus-trap/`inert`/top-layer gaps as **not graph state** |
| **Risk / collision** | **The foundation declines the re-parent; the fork's decision rows `MODAL-SETTINGS-REPARENT` + `MODAL-DEDICATED-SCRIM` (`docs/decisions.md`) pin it as landed behavior.** Adopting `overlayTransition` while keeping the re-parent is legal — but the rebuild must **record it as a divergent-but-retained behavior**, not claim a clean adoption |

> **⟶ ANNOTATED 2026-09-28 BY THE SUPERVISOR'S LANDING PASS — `PD-UI-6` HAS LANDED AND THIS ROW'S FILE CITATIONS ARE REPOINTED; NOTHING ABOVE IS REWRITTEN (`RCA-8(c)`).** **`tests/unit-u-shell-7-settings-modal.test.ts` — cited by THIS row's `Consumers (tests/**)` cell and by its `Test disposition` cell, and named in §2.1 `PD-ZONES-1`'s `Consumers (tests/**)` cell (the ten `index.html`-reading suites), in §4's `SPLIT` row and in the `PD-OVERLAY-2` row's `Test disposition` cell — NO LONGER EXISTS AT THAT PATH.** Its current address is **`archive/tests/2026-09-28-unit-u-shell-7-settings-modal.test.ts`**: the `PD-UI-6` landing **ARCHIVED IT WHOLE** (`git mv`, `md5` identical, `R100`, **nothing deleted**; `docs/specs/unit-pd-ui-6-modal-state.md` `§6.3`), which is **the whole-file `ARCHIVE` the disposition ledger demanded** — **a MOVE, never a copy and never an in-place edit** (`DECIDED: REBUILD-ARCHIVE-POLICY`). **EVERY CITATION OF THAT PATH IN THIS INVENTORY RESOLVES TO THE ARCHIVE ADDRESS.** **THE PREDICTIONS THIS ROW MADE, CHECKED AGAINST THE LANDING:** **(i)** `createModalController` was **DELETE/substitute** and **was substituted** — the adapter is re-expressed over the vendored `src/shared/overlay.ts` → `overlayTransition`, with **exactly ONE vendored import**, the adopted state word held by the adapter, `ModalVerb` declared and the close route binding the verb **`'escape'`**; **(ii)** the **RE-PARENT half is KEPT** exactly as this row required — the foundation **refuses** it (`overlay.md` §3.4 `R-12`/`P-OV-10`), so it was **recorded as a divergent-but-retained behaviour, and NO clean adoption was claimed** (`DECIDED: MODAL-SETTINGS-REPARENT` stands; `DECIDED: POST-DIVISION-REBUILD-PD-UI-6-ADAPTER-CONTRACTS` clause (iii)); **(iii)** **the unit's live-battery coupling stayed as this row states** — `scripts/live-drive.mjs`'s `ufModal` probe carries the modal, and the **live layer of `PD-UI-6` is `OPEN / live-pending`, `PRECONDITION-FAILED`** on the environmental `/dev/shm` denial → `SIGTRAP` (**owner: `U-DIVERGENCE-SPAWN`**) — **this row's warning that envelope-green is not app-green stands, and the re-parent arm is exactly one of the rows that no node green can close.** **THE ONE HALF THIS ROW DOES NOT COVER, named so it is not misread:** the **applied inert-background write** is the **minted, PARKED** row **`PD-OVERLAY-2`** (below), **excluded from `PD-UI-6`'s scope by the architect's ruling** — this row's `Replaces` cell names `overlayInertDeclaration`, and that half's route/spelling/identity belong to **`PD-OVERLAY-2`'s own gate**. **`archive/tests/` now holds `42` files** (the disposition ledger's §6 measured **41**; the `PD-UI-6` landing adds **one**).

---

#### `PD-OVERLAY-2` — the **APPLIED inert-background write** (MINTED 2026-09-28 by the `PD-UI-6` disposition pass recording the architect's ruling on that dossier's `OS-1`, with the upstream clarification `d7b98b574adc7fa63fbabda617eba2a753f52cb5` as its source authority)

> **⟶ MINTED 2026-09-28. THIS ROW IS PARKED AND THE PLACEMENT IS DELIBERATE — nothing above or below is rewritten (`RCA-8(c)`).**
> **WHY IT IS MINTED, and why it lives HERE rather than in the proposal's `§4.1`.** The `PD-UI-6` STEP-0 dossier (`docs/specs/pd-ui-6-adoption-dossier.md` §5) raised **one open-semantics entry, `OS-1`**, asking *"The adopted module returns a write; this repo performs none. Which ATTRIBUTE NAME and which BACKGROUND IDENTITY must `PD-UI-6`'s adapter use — and is applying that write even in this unit's scope?"* The architect **ruled**: the applied write is **minted as its own row and PARKED**, the applied inert/background-inertness half is **NOT in `PD-UI-6`'s scope**, and **the route, the attribute spelling and the background identity belong to THIS row's own gate**. `docs/specs/pd-ui-6-adoption-dossier.md` §0A is the ruling's record; this row is the artifact the ruling mints; `docs/decisions.md` carries the ruling as ONE ACTIVE row.
> **Why this file and not `§4.1`:** `docs/specs/post-division-rebuild-proposal.md` §4.1 is a table of **FOUNDATION elements → fork artifact → corrected classification**, every row of it naming a foundation module and symbol. **This row's SUBJECT is a fork-side write that DOES NOT EXIST in `src/**`** — there is no fork artifact to classify against a foundation element, and the vendored `src/shared/overlay.ts` is **already** classified at §2.1 `PD-OVERLAY-1`. **It is a fork-local, currently-absent artifact with no counterpart to be classified against, which is exactly what THIS inventory's `§2.1` is for** (the same placement reasoning `PD-UI-13`'s mint records) — and it is placed **immediately after `PD-OVERLAY-1`**, the row whose `Replaces` cell names `overlayInertDeclaration`, so the two halves of one foundation module read together.
> **Why it is PARKED and not scheduled.** **`PD-UI-6` adopts the transition half only**; the applied write needs (a) a **route decision this repo has never made**, and (b) an **instrument that can see the result** — and (c) neither is available: the write is **unobservable on every layer this repo currently verifies** (see *Live-battery coupling* and *Test disposition* below). **No wave is claimed here. The wave cell reads `unassigned — assigned at this row's own gate`, and inventing one would be a claim this row cannot execute.**
> **A NOTE ON THE CAP, so this mint is not misread:** this is a **tracker/inventory row**, **not** an adopted-identifier row of the `PD-UI-6` dossier's eight-row table. **The dossier's cap is FULL at eight and is UNMOVED** — no identifier row was added, none was re-scoped. **The ruling minted a work item; it did not re-open the dossier's identifier table** (`docs/specs/pd-ui-6-adoption-dossier.md` §0A; the cap rule is that dossier's §1, and `docs/specs/pd-ui-1-adoption-dossier.md`'s `A-4`).

| Field | Value |
| --- | --- |
| **Path + symbol** | **NO PATH EXISTS TODAY — that is the row.** The write's **intended site** is one of two: **(route (a))** a `props` entry on an **authored node** carrying the inert attribute (today `src/renderer/pane-graph.ts`'s authored surfaces and `src/renderer/index.html`'s shell markup are the candidates); **(route (b))** a `setAttribute`/`removeAttribute` call pair at the fork's own **shell-chrome write site** (today the modal wiring lives in `src/renderer/modal-state.ts` → `installSettingsModal`). **The named inputs the site would consume:** `overlayInertDeclaration(target, attributeName, inert)` and `overlayTransition(state, verb, callback?)` → `.changed` (the composition `overlayInertDeclaration(bg, ATTRIBUTE, overlayTransition(state, verb).changed)`). **The attribute NAME is NOT named here** and must not be: `../Provident-Electron/docs/specs/overlay.md` §2.2 `P-OV-7` forbids the **mechanism** from owning, defaulting or documenting one, and the guide states the consequence for the consumer — *"Write the attribute name yourself — the spelling above is yours, not ours."* |
| **What it does today** | **NOTHING — the half is ABSENT, and this is MEASURED, not assumed.** The fork **receives** a write record from the vendored `src/shared/overlay.ts` (`overlayInertDeclaration`) and **applies none of it**: **no `'inert'` attribute write, no `props.inert`, and no member read of a returned `OverlayInertWrite` exists anywhere in `src/**` outside prose/comments** (the `PD-UI-6` dossier §1 row 2's measured census, re-stated here and **NOT re-measured by this pass** — that pass read the tree; this pass ran no `grep`). **What is MISSING is therefore an overlay PRIMITIVE/DECISION and never attribute support:** the boolean-attribute set (`BOOLEAN_ATTRS`, `'inert'` included) is present in the pinned engine's adapters, so **route (a) needs no shim work at all and route (b) needs only the shim member that already exists** (`../Provident-Electron/docs/FORKER.md`'s inert-route carry, quoting `SHIM-COMPLETION-CARVE-OUT`/`H-r7`; corroborated by this repo's own `docs/pending.md` `SC-3` row in its own words: *"What is missing is the OVERLAY PRIMITIVE … not attribute support"*). |
| **Supplies** (the `Replaces` cell's honest form — **this row REPLACES NOTHING**) | **A NEW fork-side application of an adopted declaration — there is no local implementation to eliminate.** It **consumes** the vendored `overlayInertDeclaration` (classified at §2.1 `PD-OVERLAY-1`, whose `Replaces` cell already names it) **and** the vendored `overlayTransition`'s `changed` member. **The write is the `E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED` class's DOWNSTREAM half:** the foundation returns the write as data **by design**, and **the application is the consumer's** (`../Provident-Electron/docs/specs/overlay.md` §2.4 item 4 and §2.5 item 2: *"the applied write is the CONSUMER's"*). |
| **The two admissible routes (owner · layer · evidence class) — quoted from the guide's route table** | **(a) `props: { inert: 'true' }` on an authored node** — *"the envelope/pure-data route: the attribute is carried as author data in the graph"* · **owner: the CONSUMER (the app that authors the node)** · **layer: the AUTHORED envelope — `[T]`** · **verified by: the node suite, asserting the authored envelope** · **its contract source is the project-wide UI constraint (`UI-RENDERED-WITH-PROVIDENT`) and the guide declares it *"not a clause of `docs/specs/overlay.md`"*.** · **(b) a shell-chrome DOM write at the fork's own write site** — *"`setAttribute`/`removeAttribute` on the background element, at your own write site"* · **owner: the CONSUMER / the shell-chrome wiring** · **layer: the APP layer — `[U]`/`[D]`, never this unit's `[T]`** · **verified by: the live real-Electron leg — and the guide records of that leg that *"its own precondition is not green in this repo's current state, so it would take no measurement here."*** **THE TWO ROUTES ARE NOT EQUIVALENT AND NEITHER IS CHOSEN HERE.** |
| **Classification** | **`PARKED` — a decision-owned work item, NOT an elimination.** **`Status: PARKED. Wave: unassigned — assigned at this row's own gate.`** The row records a **write that does not exist**, so it can be neither `DELETE`/`PARTIALLY-SHARED-KEEP` (there is nothing to delete), nor `NOT-IN-SCOPE` (the work is real and the gap is measured). **The three decisions this row's OWN gate owes, and they are the whole of its scope:** **(1) the ROUTE** — (a) or (b), or an **explicit decline** (a refusal that is stated is an honest narrowing; a refusal that is silent is a charter violation — `overlay.md` §2.5 item 6's form); **(2) the ATTRIBUTE SPELLING** the fork passes as `attributeName` (the vendored module **echoes whatever it is given** and owns no name — `P-OV-7`); **(3) the BACKGROUND IDENTITY** the declaration's `target` must echo, **named by id**, for a modal whose scrim covers the shell while its re-parented operator mounts are the content. **A `PD-UI-6` pass that picks any of the three is taking this row's decision and is a review finding.** |
| **The record shape any later application MUST honour (binding, quoted from the source)** | **THE ARMS:** `inert === true` (the **strict boolean**) ⇒ `{ name: <the echoed non-empty string, or the declared null when the name is unusable>, value: 'true', removal: false, target }`; **any other value — the STRING `'true'` INCLUDED** ⇒ `{ name, value: false, removal: true, target }`. **THE SET ARM'S `value` IS THE STRING `'true'`; THE REMOVAL ARM'S IS THE BOOLEAN `false`; the case is discriminated by the `removal` member ALONE and never inferred from an empty value** (`../Provident-Electron/docs/guide/overlay.md`'s route subsection and `docs/FORKER.md`'s carry block, both read this pass; `../Provident-Electron/docs/specs/overlay.md` §2.4 items 1–4). **A truthiness implementation fails here.** **THE `removal` PRECEDENT (binding, carried and NOT re-decided here):** the ACTIVE row **`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-PD-UI-1-ADAPTER-CONTRACTS` clause (1)** — finding **`A-7`** — ruled that **honouring the `removal` member means the attribute IS REMOVED** and that the **"perform no write, leave a pre-existing attribute in place" reading is a THIRD outcome the record does not declare and is REJECTED (DIVERGENT)**. **The precedent was made against the fork's theme adapter and is BINDING ON ANY LATER APPLICATION of this record class — including this row's write, whichever route it takes.** *(The precedent's own landed form for `ThemeAttributeWrite` was a `delete` at the fork's single write site, and that row's text explicitly records that no `removeAttribute` was taken there; **whether route (b) here reaches for `removeAttribute` is THIS row's gate's decision, and this row does not pre-empt it** — the binding clause is the SEMANTICS, not the API.)* **THE DEFECT THIS ROW MUST NOT ABSORB (`G-8`, a STANDING handoff — its row is filed at `docs/defects.md` → `docs/HANDOFF.md`, not in this file):** `../Provident-Electron/docs/specs/overlay.md` §2.4 item 2 still **prints** `removal === (value !== true)` while the set arm's `value` is the string `'true'`, so **the printed identity is NOT satisfiable as a strict equation** — **the DECLARED PAIR above is what the vendored bytes implement and is what any register here must assert; the printed equation must never be asserted, and it is HANDED OFF, never absorbed and never patched.** |
| **Consumers (`src/**`)** | **READ — ZERO today, and that is the finding.** The write has **no consumer by construction**: no `src/**` file applies, reads or names it (dossier §1 row 2's measured census). **The INTENDED consumer, when route (a) is taken, is the modal's own authored surface** (the app-graph assembling path `src/renderer/pane-graph.ts`, which authors `#settings-modal`/`#settings-modal-scrim`/`#settings-modal-body` through the graph), **and when route (b) is taken it is the shell wiring in `src/renderer/modal-state.ts` → `installSettingsModal`** — the module `docs/decisions.md`'s **`MODAL-SETTINGS-REPARENT`** + **`MODAL-DEDICATED-SCRIM`** pin, and the file §2.1 `PD-OVERLAY-1` already owns. **Stated as a possibility and NOT as a plan: the modal frame's scrim is the natural background identity a `target` would echo, but WHICH NODES BECOME INERT IS THIS ROW'S GATE'S DECISION (decision (3) above), and this cell names no id.** |
| **Consumers (`tests/**`)** | **READ — ZERO today.** No suite asserts an applied inert attribute, and **none can with an existing instrument**: the project-wide UI constraint's route would be asserted by a **node suite over the authored envelope** (there is no such row today), and the DOM route by the **live real-Electron leg** (whose precondition is RED — see below). **`tests/unit-u-shell-7-settings-modal.test.ts` is the modal's own suite and its disposition is `SPLIT`** (`docs/specs/post-division-test-disposition-2026-09-28.md` §2 row #2: the state-machine rows archive, the **re-parent** rows survive for `PD-OVERLAY-1`); **this row owes a NEW red set when it is scheduled, and inherits nothing.** |
| **Test disposition** | **NONE YET — no test may be authored for a write with no chosen route, and this pass authors none** (one file's amendment, one minted row, the tracker rows; **no `tests/**` byte**). **When this row's gate opens, the disposition follows the CHOSEN route, and the two are structurally different:** **route (a)** ⇒ a **[T] row over the authored envelope** (`props: { inert: 'true' }` present on the authored node in the assembled graph) — **`[T]` is the ONLY evidence class the guide records as able to verify that route.** **route (b)** ⇒ a **[U]/[D] row on the live real-Electron leg** — and the guide says of that leg, verbatim, *"that leg's own precondition is not green in this repo's current state, so it would take no measurement here."* **(A third honest outcome exists and this row records it: an explicit DECLINE, whose disposition is a recorded refusal with no test at all.)** |
| **Live-battery coupling** | **READ — NONE, and the absence is the row's whole risk.** `scripts/live-drive.mjs` carries a `ufModal(h, want)` helper driving the modal live (§2.1 `PD-OVERLAY-1`), **but no live block asserts an applied background attribute** — and **the one leg the guide names as route (b)'s verifier cannot run here**: **`npm run divergence` is RED at this head for an ENVIRONMENTAL reason** (`/dev/shm` denial → Electron `SIGTRAP`), **its harness fix belongs to the separate `U-DIVERGENCE-SPAWN` unit** (`docs/specs/unit-divergence-harness-precondition.md`; proposal §7.5). **So the applied write is UNOBSERVABLE on EVERY LAYER THIS REPO CURRENTLY VERIFIES — node: no row and no instrument; live: `PRECONDITION-FAILED` on a precondition this row does not own. THIS IS THE ROW'S NAMED REVISIT CONDITION'S FIRST CONJUNCT, and it is a CARRIED precondition, never a silent park (RCA-11).** |
| **Risk / collision** | **(1) THE ROUTE IS A LAYER COMMITMENT, NOT A STYLE CHOICE.** Route (a) **touches the authored envelope** and is `[T]`-verifiable; route (b) is **app/shell-chrome** and is `[U]`/`[D]` **only** — so a later pass that "picks the simpler one" changes which instrument can ever falsify the work, and a node-green from route (a) would say **nothing** about the assembled app while a route-(b) landing with no live leg is **unverifiable**. **(2) THE PRINTED `G-8` IDENTITY IS A LIVE TRAP FOR THIS ROW'S REGISTER:** a spec or register written from `overlay.md`'s printed equation will **fail on the set arm** (the string `'true'`), and a pass that "fixes" the foundation's text or the vendored bytes to make it pass is committing the two forbidden acts (patch upstream / fork the vendored module). **(3) THE `A-7` READING IS THE OTHER TRAP:** a truthiness or "leave it alone" implementation of `removal` is **DIVERGENT BY RULING**, and it would pass a naive node test while leaving a **pre-existing attribute in place on a real document** — the exact class `A-7` rejected. **(4) THE FOCUS TRAP IS NOT THIS ROW.** `../Provident-Electron/docs/specs/overlay.md` `P-OV-11` keeps the focus model re-filed and **this repo will not grow the shim for it**: making a background inert is **not** a focus trap, and a pass that lands this row must not report the fork's **focus-trap gap** as closed (`docs/specs/ui-overhaul.md` §2.1's Limits + Table B/C record that gap, and it stays a gap). **(5) THE NAME IS A FORK DECISION WITH A BAN ON THE OTHER SIDE:** the vendored module's bytes may not carry an attribute name (`P-OV-7` + `R-1`(f)), so the spelling **must stay on the fork side** — a pass that "helps" by naming it in a shared or vendored file **relaxes a prohibition** and is a review finding. |

> **⟶ THE ROW'S PARKED STATUS, ITS OWNER AND ITS NAMED REVISIT CONDITION (recorded here as the row's own statement; the tracker row is `docs/pending.md`'s PARKED row for `PD-OVERLAY-2`).**
> **STATUS: `PARKED`. WAVE: `unassigned — assigned at this row's own gate`.** **OWNER: the architect (the route ruling) + the pass that opens this row's OWN GATE (the attribute spelling and the background identity, plus the red set the chosen route owes).** **NAMED REVISIT CONDITION — either of:** **(a) a RUNNABLE LIVE LEG** — i.e. **`U-DIVERGENCE-SPAWN`'s harness fix lands**, so route (b)'s verifier (the live real-Electron leg) can actually take a measurement instead of returning `PRECONDITION-FAILED`; **or (b) a ROUTE RULED AT THIS ROW'S OWN GATE** — the architect picks route (a) (`props: { inert: 'true' }` on an authored node; `[T]`-verifiable, needing **no** live leg at all) or route (b) (the shell-chrome DOM write), or **explicitly declines the write** with the refusal recorded. **Until one conjunct holds, this row is parked and `PD-UI-6` neither owns it nor owes it.**
> **THE RECORDED CONSTRAINTS ON WHICHEVER PASS OPENS IT (verbatim from the ruling and the sources, so nothing is re-derived):** the **two routes** with their owners/layers/evidence classes (the *Classification*/*Test disposition*/*Live-battery coupling* cells above) · the **attribute name and the background identity are UNDECIDED** and are this gate's to decide, the vendored module owning neither (`P-OV-7`) · **`A-7` (the `removal` precedent): honouring `removal` means the attribute is REMOVED — the skip reading was ruled DIVERGENT** (`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-PD-UI-1-ADAPTER-CONTRACTS` clause (1)) · the **`G-8` defect STANDS upstream** (`../Provident-Electron/docs/specs/overlay.md` §2.4 item 2, §0A note 2 and the §2.2(D) `removal` row still print the unsatisfiable identity) and is **catalogued + handed off, NEVER absorbed and NEVER patched** (`AGENTS.md` item 7; `docs/defects.md` → `docs/HANDOFF.md`).

---

#### `PD-THEME-1` — the pure tri-state appearance resolver + root applier

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/theme.ts` — **`resolveTheme(setting, prefersDark: boolean)`** and **`applyThemeToRoot(root, setting, prefersDark)`**; plus `ResolvedTheme`, `ThemeRoot` |
| **What it does today** | Explicit `light`/`dark` wins; anything else follows the OS `prefers-color-scheme`; writes `document.documentElement.dataset.theme`; TOTAL/fail-soft |
| **Replaces** | **`U-THEME`** `theme.ts` `resolveTheme(setting, env: ThemeEnv)` + `applyThemeDeclaration(attributeName, resolved)` + `ThemeEnv`/`ThemeResolution`/`ThemeAttributeWrite` |
| **Consumers (`src/**`)** | **READ, exact specifier** — only `src/renderer/renderer.ts` (imports `applyThemeToRoot`) |
| **Consumers (`tests/**`)** | **READ** — `tests/unit-u-shell-2-theme.test.ts` (**the only importer**) |
| **`scripts/**`** | **READ — none** (no exact-specifier reference in `scripts/**`) |
| **Config coupling** | the persisted `theme` field rides `src/main/operator-settings-store.ts` (`coerceTheme`, the default `'system'`) + `src/shared/types.ts` `OperatorSettings` — **decision `UI-CONFIG-CARRIER` (`docs/decisions.md`)**; both **KEEP** (app state) |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — *not* `DELETE-WHOLE-FILE`, because of two **NAMED SEMANTICS COLLISIONS**: (a) the foundation's `resolveTheme` takes an **injected `ThemeEnv`** while the fork passes a **`prefersDark` boolean** read live from `matchMedia`; (b) the foundation's applier **RETURNS the declaration as data** (`applyThemeDeclaration`) while the fork's **writes the root itself**. The **env reading + the write** therefore stay as a thin adapter; the **resolution rule** is replaced |
| **Test disposition** | `tests/unit-u-shell-2-theme.test.ts` — **REWRITE** (the signature/return shape changes) |
| **Risk / collision** | A resolver swap silently changes the **OS-listener liveness** decision (the fork's `applyThemeToRoot` returns the resolved theme so the caller can decide whether the `matchMedia` listener stays live). Dropping that return breaks the tri-state live behavior with a green node suite |

---

#### `PD-THEME-2` — the token CSS block (**NOT-IN-SCOPE** — recorded, not eliminated)

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/index.html` — the `:root` token block, `html[data-theme='light']`, `html[data-theme='dark']`, the `@media (prefers-color-scheme: dark)` fallback |
| **What it does today** | Ships the fork's **~15 token names** and the explicit-wins-over-media specificity ordering |
| **Replaces** | **NOTHING** — `U-THEME` is a **mechanism** (resolve + declare); it carries **no token names** |
| **Classification** | **`NOT-IN-SCOPE` (KEEP)** — `docs/FORK-DIVERGENCE.md` §3 rule 2 forbids smuggling app vocabulary into a shared mechanism's default: *"a token layer that knows Astrographer's 15 token names"* is named **verbatim** as the anti-pattern. The token *set* is app design; the token *resolution* is `PD-THEME-1` |
| **Test disposition** | the `index.html`-reading theme rows inside `tests/unit-u-shell-2-theme.test.ts` + `tests/unit-u-shell-6-hover-affordance.test.ts` — **KEEP** |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger §2 entries #1 and #11, finding `C-2`). NOTHING ABOVE IS REWRITTEN — read the cell THROUGH this note.** **This `KEEP` cell CONTRADICTS §4's `ARCHIVE` row**, which lists **`tests/unit-u-shell-2-theme.test.ts`** as a **whole-suite** `ARCHIVE`. **MEASURED (methods `M-static` + `M-row`):** that file is the **only** importer of `src/renderer/theme.js` in the whole suite (**1 of 1**), and it carries **10 literal `it(`/`test(` rows**. **Its measured disposition is `SPLIT`** — the `resolveTheme`/`applyThemeToRoot` precedence rows archive, the `:root`/`[data-theme]` **token-block rows KEEP** (this cell's own subject) — and `§2.1` `PD-THEME-1` **independently** classes the file **`REWRITE`**. **A whole-file `ARCHIVE` would retire a `KEEP` cell's subject**, which `DECIDED: REBUILD-ARCHIVE-POLICY` clause (2) forbids (the archive is the INPUT; a kept subject is re-derived, never retired).

---

#### `PD-THEME-3` — `installTheme` (**KEEP-ADAPTER**)

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/renderer.ts` — **`installTheme`** |
| **What it does today** | Boot wiring: read the live setting, read `matchMedia('(prefers-color-scheme: dark)')`, call the resolver, apply to the root |
| **Replaces** | **nothing directly** — it becomes the **adapter** between `U-THEME` and the fork's carrier |
| **Classification** | **`PARTIALLY-SHARED-KEEP` (KEEP-ADAPTER)** — the boot seam is host behavior; only its body re-points. The `src/main/operator-settings-store.ts` carrier + the `src/shared/types.ts` `theme` field are **KEEP** |

---

#### `PD-ZONES-1` — the layout → CSS-variable projection

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/layout-state.ts` — **`layoutCssVars`**, **`zoneTrackCssVars`**, **`applyLayoutToRoot`** (+ `LayoutRoot`, `LayoutState`, `ZoneLayout`, `PaneLayoutEntry`) |
| **What it does today** | Projects the serialized `LayoutState` to `--zone-*-track` / `--top-bar-size` custom properties and writes them on a root |
| **Replaces** | **`U-ZONES`** `zones.ts` `trackFor`/`isEmpty`/`TrackSpec` **+ `U-CENSUS`** `census.ts` `computeTrackVars`/`TrackVars`/`ZoneId` **+ `U-PROJ`** `layout-projection.ts` `project`/`projectVar`/`applyProjection`/**`applyVarsToRoot`**/`Projection`/`VarSpec`/`ProjectionSkip`/`VarWriteSink` |
| **Consumers (`src/**`)** | **READ, exact specifier — 7 importers**: `src/main/operator-settings-store.ts`, `src/renderer/pane-drag.ts`, `src/renderer/pane-graph.ts`, `src/renderer/pane-gutter.ts`, `src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts`, `src/shared/types.ts`; plus `src/renderer/pane-registry.ts` (an inline `import('./layout-state.js')` type reference) |
| **Consumers (`tests/**`)** | **READ, exact specifier — 11 importers**: `tests/props-layout-state.test.ts`, `tests/props-pane-graph.test.ts`, `tests/renderer-empty-zone-track.test.ts`, `tests/unit-live11-bridge-seams.test.ts` (**PROTECTED**), `tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts`, `tests/unit-u-shell-3-collapsible-panes.test.ts`, `tests/unit-u-shell-4-drag-relocate.test.ts`, `tests/unit-u-shell-5-resizable-gutters.test.ts`, `tests/unit-u-shell-shell-wiring.test.ts` |
| **`scripts/**`** | **READ — none** by specifier; `scripts/live-drive.mjs` reads the resulting `--zone-*-track` values through `getComputedStyle` in the layout blocks |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — the **projection half is DELETE** (`layoutCssVars`/`applyLayoutToRoot` → `project`+`applyVarsToRoot`); **`zoneTrackCssVars` is DELETE-with-an-adapter** (the *computation* is `zones.trackFor` + `census.computeTrackVars`; the fork's **zone set and min/max clamp policy stays**). **`coerceLayout`/`deriveLayout`/`defaultLayout`/`isLayoutZoneName`/`LAYOUT_VERSION`/`LAYOUT_ZONE_MIN`/`MAX`/`LAYOUT_REGION_*` are KEEP** — app serialization + policy |
| **Test disposition** | `tests/unit-live11-bridge-seams.test.ts` — **PROTECTED** (§5, it imports `defaultLayout`/`coerceLayout`); the other 10 — **REWRITE** |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger `docs/specs/post-division-test-disposition-2026-09-28.md` §2 entries #3/#4/#5/#6/#11/#15/#16/#17 and §5 `K-1`). NOTHING ABOVE IS REWRITTEN — read the cell THROUGH this note.** **MEASURED (method `M-static`: `grep -rlE "(from \|await import\(\|import\()'[^']*src/[^']*/?layout-state\.js'" tests`) = `11` importers, and the cell's LIST REPRODUCES EXACTLY at `d7ae18e` — including `tests/unit-u-shell-1-layout-zones.test.ts`, whose access is a **DYNAMIC `await import` inside a helper**, which is why a static-only reading misses it.** **FINDING against this cell:** it marks *"the other 10 — **REWRITE**"*, and **§4's `ARCHIVE` row nevertheless lists THREE of those same ten as whole-file `ARCHIVE`** (`tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts`, `tests/unit-u-shell-5-resizable-gutters.test.ts`) **plus the three PBT-register files this import set carries** (`tests/props-layout-state.test.ts`, `tests/props-pane-graph.test.ts`). **The measured disposition of all ten is `SPLIT`/`REWRITE`/`KEEP`, never whole-file `ARCHIVE`** (§4's row is the wrong cell). **The `PROTECTED` half of the cell is CONFIRMED by re-reading the pin** (`K-1`): `tests/unit-live11-bridge-seams.test.ts` imports `defaultLayout`, `coerceLayout`, `type LayoutState`, `type PaneLayoutEntry` from `../src/renderer/layout-state.js` **AND** is a member of the electron-mock census set — **the W2 adoption may not rename, remove or re-shape those four exports; it lands AROUND them or files an explicit pin re-statement.**
| **Risk / collision** | **The `docs/next-steps.md` 2026-09-17 proofreader pass already corrected a phantom citation for this module** (`layout-state.ts:214-308` → the three real symbol regions). Any rebuild edit must re-pin by **symbol**, never by line. `tests/unit-live11-bridge-seams.test.ts` being PROTECTED means **the adoption cannot change `defaultLayout`/`coerceLayout`'s exported names or shapes** without re-stating a protected census |

---

#### `PD-ZONES-2` — the grid/track CSS + the pure-CSS empty-track collapse

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/index.html` — the `#app` mount root's `grid-template-columns`/`grid-template-rows`/`grid-template-areas`, the five `grid-area` selector rules, the five `#app > #wiki-root:has([data-zone='…'].is-empty:not(.is-revealed))` → `--zone-*-track: 0px` collapse rules, and `#app [id="zone:sidebar"] { display: none }` |
| **What it does today** | The empty-track collapse is **pure CSS**, driven by the `is-empty` **class mirror** the host writes — i.e. the *census* is JS and the *consequence* is CSS |
| **Replaces** | **`U-ZONES`** `zones.ts` `isEmpty`/`trackFor` **+ `U-CENSUS`** `census.ts` `computeTrackVars` (the census→track-variable record) |
| **Consumers (`src/**`)** | the class mirror is written by `src/renderer/sidebar-panes.ts` (`syncZoneMirrors`, the `is-empty` mirror) — **READ** |
| **Consumers (`tests/**`)** | `tests/renderer-empty-zone-track.test.ts`, `tests/unit-u-shell-1-layout-zones.test.ts`, `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts` (**READ**) |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — the **`:has(.is-empty)` collapse rules are the elimination candidate** (replaced by computed track vars from `U-CENSUS`); the `grid-template-areas` mapping and the zone-name selectors stay (app topology). **Cannot be split from `PD-REGION-1`** |
| **Test disposition** | the 3 suites — **REWRITE** |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger §2 entries #4/#6/#7, finding `C-5`). NOTHING ABOVE IS REWRITTEN.** **This cell's `REWRITE` is the CORRECT class and §4's `ARCHIVE` row contradicts it for all three files** — `tests/renderer-empty-zone-track.test.ts` (**25** literal rows, **measured: M-row**), `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts` (**4**), `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts` (**2**). **The third of the three is a `§2.1` `PD-REGION-1` cell too, and its measured import profile is notable:** `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts` imports **`layout-state.js` NOT AT ALL** — **a `grep -rl` of that module's exact specifier returns `0` hits for it** — so `§2.1` `PD-ZONES-1`'s 11-importer list does **not** contain it and **it is a pure `index.html`-text pin** (it asserts a **removed dead `grid-area: right` rule**). **A later pass must not fold it into the `layout-state` change set.**
| **Risk / collision** | The defect row **`EMPTY-ZONE-TRACK-NOT-COLLAPSED`** is the live carrier; the CSS collapse currently works *because* two mechanisms agree (JS class mirror + CSS `:has`). Removing either half alone produces a **live-only** regression |

---

#### `PD-ZONES-3` — the synchronous census mirror in the host

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/sidebar-panes.ts` — **`applyZoneTracks`** (the synchronous census mirror writing the track vars), called from the host's re-derive/reconcile paths |
| **What it does today** | Writes the projected zone track variables on the root immediately after a pane/zone change — the *synchronous* half that keeps the grid consistent with the census within one frame |
| **Replaces** | **`U-CENSUS`** `census.ts` `computeTrackVars` **+ `U-PROJ`** `layout-projection.ts` `applyVarsToRoot` |
| **Consumers (`src/**`)** | module-private; called by `SidebarPanes` (READ of the call sites) |
| **Consumers (`tests/**`)** | the layout/grid suites in `PD-ZONES-1`'s list, exercised through `SidebarPanes` |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — the **body** re-points to `computeTrackVars` + `applyVarsToRoot`; the **call sites stay** (the host is the census authority). The 4 059-line `sidebar-panes.ts` is **not** deletable |
| **Test disposition** | `tests/sidebar-panes*.test.ts` (4 files) + the grid suites — **KEEP/re-point** |
| **Risk / collision** | The **hybrid rule** (`docs/specs/ui-overhaul.md`): *"the model is always Provident/serialized; only the mechanic is external — external code commits one managed write at gesture end"*. A projection swap that writes per-frame would violate it. This row is where that rule is enforced |

---

#### `PD-FOCUS-1` — the main-focus tab model

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/tab-state.ts` — **`focusTarget`** (the elimination target) alongside `coerceTabState`, `coerceTabTarget`, `defaultTabState`, `targetEquals`, `activeTab`, `openTab`, `closeTab`, `reorderTab`, `setSearchParams`, `nextQueryId`, `resolveDefaultTarget`, `ensureFirstTab`, `TAB_STATE_VERSION`, `TAB_LANDING`, `TabTarget`, `TabState`, `TabEntry`, `TabSearchParams`, `TabDefaultContext` |
| **What it does today** | The serialized main-focus tab set: find-or-open, activate, duplicate, close, reorder, default context |
| **Replaces** | **`U-FOCUS-MODEL`** `focus-model.ts` `focusTransition`/`focusOrder`/`focusIndex`/`persist`/`FocusState`/`FocusEntry`/`FocusVerb`/`FocusRefusalCode`/`FocusId` — **the reducer only** |
| **Consumers (`src/**`)** | **READ, exact specifier — 4 importers**: `src/main/operator-settings-store.ts` (`coerceTabState`/`defaultTabState`/`TabState`), `src/renderer/sidebar-panes.ts`, `src/renderer/tab-strip.ts`, `src/shared/types.ts` |
| **Consumers (`tests/**`)** | **READ, exact specifier — 17 importers** (mostly `import type { TabEntry, TabTarget }`): `tests/page-commit-failure-visibility.test.ts`, `tests/page-commit-scope-ack-race.test.ts`, `tests/page-commit-tab-ownership.test.ts`, `tests/props-tab-state.test.ts`, `tests/stage-active-tab-display-adversarial.test.ts`, `tests/unit-live4-empty-store-landing.test.ts`, `tests/unit-stage-active-tab-display.test.ts`, `tests/unit-stage-active-tab-display-blind-contradictions.test.ts`, `tests/unit-stage-active-tab-display-contract-holes.test.ts`, `tests/unit-stage-active-tab-display-pbt-generators.test.ts`, `tests/unit-u-edit-1-property-register.test.ts`, `tests/unit-u-shell-9a-main-focus-tabs.test.ts`, `tests/unit-u-shell-9b-blind-greens.test.ts`, `tests/unit-u-shell-9b-cross-document-shared.test.ts`, `tests/unit-u-shell-9b-h2-c20-materialization.test.ts`, `tests/unit-u-shell-9b-h3-doc-namespace.test.ts`, `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts` |
| **`scripts/**`** | **READ — none by specifier**; `scripts/live-drive.mjs` reads `#tab-strip .tab` attributes live (`data-tab-id`, `data-target-kind`, `is-active`) |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — `focusTarget` is **DELETE** (replaced by `focusTransition`'s `open`/`activate`/`close`/`next`/`prev` verbs + the model's own `===`-on-target activation); `targetEquals` is a **DELETE candidate** too (the model owns the activation rule). **The tab VOCABULARY is KEEP**: `TabTarget`'s **five kinds** (`document`/`search`/`graph`/`template`/`other`), `TabSearchParams`, the coerce/version/landing rules, and `openTab`/`closeTab`/`reorderTab`/`ensureFirstTab`/`nextQueryId`/`resolveDefaultTarget` are **Astrographer app policy** (pin: `W2-Q11`'s third-pass resolution in `docs/next-steps.md`: v1 kinds = `document` + `search-results`; `graph`/template PARKED; first-tab-only targetless default) |
| **Test disposition** | **REWRITE** for the `focusTarget`/`targetEquals` rows; **KEEP** for the 17 importers' *type* usage (they import `TabEntry`/`TabTarget`, which survive). **NOTE:** `tests/unit-stage-active-tab-display-contract-holes.test.ts` currently carries **TWO RED rows** (`H-1` 329 / `H-1b` 388) and **`H-2` (415) RED** — **RECORDED** from `docs/next-steps.md`'s `U-STAGE-ACTIVE-TAB` DONE row; those reds are **pre-existing and NOT caused by this inventory** |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger §2 entries #22–#37, findings `C-7`/`C-8`). NOTHING ABOVE IS REWRITTEN — read the cell THROUGH this note.** **MEASURED (method `M-static`, `grep -rlE "(from \|await import\(\|import\()'[^']*src/[^']*/?tab-state\.js'" tests`) = `17` importers AT HEAD — the cell's count is RIGHT — but the cell LISTS only `16`, and the missing one is `tests/unit-u-shell-9a-main-focus-tabs.test.ts`**, whose access is a **DYNAMIC `await import('../src/renderer/tab-state.js')` inside a helper** (a static-only reading misses it). **The cell's `KEEP` for the type importers is CONFIRMED BY READING THE IMPORT STATEMENTS:** every page-commit and stage-active-tab file imports **`import type { TabEntry, TabTarget }`** — **type-only, erased at build** — and `tests/unit-u-shell-9b-h1-optionc-interception.test.ts` **does not import the module at all** (its `tab-state` mention is prose). **The one VALUE-importer of the module's vocabulary is `tests/unit-live4-empty-store-landing.test.ts`** (`resolveDefaultTarget`, `ensureFirstTab`, `defaultTabState`, `TAB_LANDING`) — the **tab vocabulary this very cell marks `KEEP`** (`W2-Q11`). **CONSEQUENCE FOR §4:** the §4 `REWRITE` row's *"the tab families"* is **wrong for every one of those files** — the correct class is **`KEEP`** (6 of the §2-ledger entries #22–#37 are `KEEP`, the rest are the `S-7`/`PD-FOCUS-2` subset). **An `ARCHIVE` or even a `REWRITE` of a type-only importer would churn a file whose subject no mechanism supersedes.**
| **Risk / collision** | The model's ids/targets are **OPAQUE**; the fork's are a **5-kind discriminated union**. A reducer swap is safe **only if** the fork keeps its own target type and passes it through opaquely. If the rebuild "simplifies" the union to a string, it breaks `tests/unit-u-shell-9a-main-focus-tabs.test.ts` + 16 sibling suites **and** the live `data-target-kind` probes |

---

#### `PD-FOCUS-2` — the shell tab strip

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/tab-strip.ts` — **`TabStrip`** (the class), `notifyTabClosed`, `drainClosedTabIds`, `TabStripContext`, `TabFocusPayload`, `TabStripOptions` |
| **What it does today** | Renders the top-bar tab strip (also the window drag region), owns tab DOM + close/expand affordances |
| **Replaces** | **NOTHING** — `U-FOCUS-MODEL` is a reducer with **no renderer and no DOM**; the foundation ships **no strip** |
| **Consumers (`src/**`)** | **READ, exact specifier — 2 importers**: `src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts`; `src/renderer/pane-drag.ts`/`pane-graph.ts`/`pane-gutter.ts` reference the strip **by name/selector** (READ) |
| **Consumers (`tests/**`)** | **READ, exact specifier — 4 importers**: `tests/page-commit-scope-ack-race.test.ts`, `tests/page-commit-tab-ownership.test.ts`, `tests/unit-stage-active-tab-display-contract-holes.test.ts` (`notifyTabClosed`), `tests/unit-u-shell-9a-main-focus-tabs.test.ts` |
| **Classification** | **`NOT-IN-SCOPE` (KEEP)** for the class — the strip is **shell chrome the fork legitimately renders** (`docs/specs/ui-overhaul.md`'s parity note: *"the shell strip need not be `provident.dispatch`-able; parity holds via shared application code"*; `W2-Q12` **RESOLVED**: *"strip NOT dispatchable — MCP tooling uses the internal application code"*). **`DELETE-SUBSET-KEEP-ADAPTER`** for the **`notifyTabClosed`/`drainClosedTabIds`** module-level seam — a fork-local channel that `U-FOCUS-MODEL`'s **`onChange`/`persist` seams** can replace |
| **Test disposition** | `tests/unit-u-shell-9a-main-focus-tabs.test.ts` + `tests/page-commit-tab-ownership.test.ts` + `tests/page-commit-scope-ack-race.test.ts` — **REWRITE** for the closure-seam rows; the render rows **KEEP** |
| **Risk / collision** | `notifyTabClosed` is consumed by a **PROTECTED-adjacent** suite in the page-commit family; the page-commit subject key is the **active tab id**, so a closure-seam change touches the `U-STAGE-ACTIVE-TAB` landed behavior |

---

#### `PD-FOCUS-3` — the MCP focus tool row (**the tool-shape collision**)

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/main/mcp-server.ts` — the `ALL_TOOLS` member **`'provident.focus'`**, its SDK registration row (`server.registerTool('provident.focus', { title, description, inputSchema }, handler)`) and the handler (`backend.invoke('focus', args)`); `src/main/security.ts` — the `TOOL_GROUPS` row `'provident.focus': 'dispatch'`; `src/shared/types.ts` — the `RpcMethod` member `'focus'` |
| **What it does today** | A UI-focus-only tool (find-or-open / activate-by-id / force-duplicate) routed through the renderer's shared focus-selection seam |
| **Replaces** | **`U-FOCUS-TOOL`** — the foundation's `provident.focus`, **the `22nd` `ALL_TOOLS` member**, group `dispatch`, a **THIN ADAPTER** routing to the renderer's own focus state (READ of `docs/specs/focus-tool.md` §2.1 + the foundation's `src/main/mcp-server.ts`) |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER` + A NAMED SEMANTICS COLLISION** — see **§7** for the full census analysis. The route shape (validate → ONE renderer call → return the answer verbatim; no state, no map, no notify, no store) is adoptable; **the fork's declared arg set is NOT the foundation's** |
| **Test disposition** | **REWRITE** — every suite that pins the fork's `inputSchema`/description | 
| **Risk / collision** | See §7. **A plain adoption silently drops the fork's `tabId` argument and re-shapes `target` from a 5-kind object union to a string — a caller-visible MCP surface change** |

---

#### `PD-MENU-1` — the data-driven menu-template builder

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/main/app-menu.ts` — **`buildMenuTemplate(catalog, options)`**, **`normalizePaneCatalog(raw)`** (the elimination targets) alongside `orderPaneCatalog`, `importSelectionFromDialog`, `IMPORT_DIALOG_FILTERS`, `IMPORT_DIALOG_PROPERTIES`, `AppMenuActions`, `BuildMenuOptions` |
| **What it does today** | Normalizes an untrusted pane catalog, orders it, and builds a native `MenuItemConstructorOptions[]` from app actions; the caller does `Menu.buildFromTemplate` + `Menu.setApplicationMenu` |
| **Replaces** | **`U-MENULIB`** `menu-template.ts` `normalizeCatalog`, `buildMenuTemplate` (**the renamed, consumer-agnostic symbol**), `selectCatalogItem`, `CatalogEntry`, `MenuTemplate`, `ProjectedItem`, `PlatformProjection`, `TemplateOptions` |
| **Consumers (`src/**`)** | **READ, exact specifier — 1 importer**: `src/main/main.ts` (which owns `Menu`/`dialog` from `electron` and `rebuildApplicationMenu`) |
| **Consumers (`tests/**`)** | **READ, exact specifier — 2 importers**: `tests/unit-u-import-1-import-surface.test.ts`, `tests/unit-u-menu-1-application-menus.test.ts` |
| **Classification** | **`PARTIALLY-SHARED-KEEP`** — `normalizePaneCatalog` **DELETE** → `normalizeCatalog` **only if the fork's catalog shape maps**; `buildMenuTemplate` **DELETE** → the foundation's; **`orderPaneCatalog` KEEP** — pane ordering is app policy; **`importSelectionFromDialog` + `IMPORT_DIALOG_FILTERS`/`PROPERTIES` KEEP** — `docs/specs/menulib.md` §2.1 item 1: the picker is **injected, not owned**, and *"import semantics stay fork-side"*. `src/main/main.ts`'s `Menu.buildFromTemplate`/`setApplicationMenu` + the `dialog.showOpenDialog` arms are the **host seam** and stay |
| **Test disposition** | both suites — **REWRITE** for the normalizer/builder rows; **KEEP** for the ordering + import-selection rows |
| **Risk / collision** | `U-MENULIB`'s emitted object carries **exactly seven own keys** and the builder **imports neither `electron` nor `fs`** — the fork's `app-menu.ts` must not leak an `electron` type into the shared builder. The fork also has an **architect-visible gap**: `docs/specs/ui-overhaul.md` §1123 records gap **SG3** — *"no `Menu` in `main.ts`"* at the time of writing; the fork **now has** `Menu.setApplicationMenu` (READ) |

---

#### `PD-MENU-2` / `PD-MENU-3` — the dialog + import-policy halves (**NOT-IN-SCOPE**)

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/main/app-menu.ts` — `importSelectionFromDialog`, `IMPORT_DIALOG_FILTERS`, `IMPORT_DIALOG_PROPERTIES`; `src/main/import-directory.ts` — `expandImportDirectory`, `buildImportDialogOptions`, `resolveImportSelection`, `MAX_IMPORT_FILES`, `isMarkdownFile`, `isDotEntry`, `ImportDirectoryOutcome`, `ImportDialogOptions`, `ImportSelectionResolution`, `ImportOpenProperty` |
| **What it does today** | The app's import policy: a 512-file cap, `.md` selection, dot-entry skipping, root-per-store |
| **Replaces** | **NOTHING** — `selectCatalogItem(catalog, picker)` injects the picker; it owns no file policy |
| **Classification** | **`NOT-IN-SCOPE` (KEEP)** for **both** — `docs/FORK-DIVERGENCE.md` §2 row 7 explicitly excludes the app-side import half from `SC-7`; decision **`IMPORT-ROOT-PER-STORE`** is app-side |
| **Consumers** | `src/main/main.ts` imports both (**READ**); `tests/unit-u-import-1-import-surface.test.ts` imports both |
| **Test disposition** | **KEEP** |

---

#### `PD-GUTTERAFF-1` — the gutter affordance (no fork-local module)

| Field | Value |
| --- | --- |
| **Path + symbols** | `src/renderer/index.html` — the `.gutter` geometry + `.layout .gutter[data-axis='columns'/'rows']` cursor rules; `src/renderer/renderer.ts` — the gutter arms of the shell pointer machine (`isLayoutZoneNameValue`, the `startGutter`/`previewGutter`/`commitGutterSize` calls) |
| **What it does today** | The gutter affordance is **authored inline** — the fork has **NO `gutter-affordance.ts` equivalent**. **READ-verified:** `grep -rn "gutter-affordance\|createGutterAffordance\|GUTTER_AFFORDANCE" src/ tests/ scripts/` returns **ZERO matches** in the fork tree |

> **⟶ RE-VERIFIED 2026-09-28 (gate finding `X-3`; ledger §2 entries #10/#11). THE ZERO-MATCHES CONCLUSION STANDS, WITH ITS COMMAND NOW STATED EXACTLY — and the command as WRITTEN returns 16 hits at `d7ae18e`, every one of them inside the PHASE-0 VENDORING work rather than the fork's own mechanism code.** **MEASURED at `d7ae18e`:** that `grep -rn` returns **16** matches across **5** files — `src/shared/gutter-affordance.ts` (the **vendored module**, added by `PD-VENDOR` **after** this inventory's head `b6791e0`), `scripts/foundation-drift.mjs` (the vendoring unit's **drift monitor**), and `tests/pd-vendor-set.test.ts` / `tests/pd-vendor-manifest.test.ts` / `tests/pd-vendor-drift.test.ts` (**the Phase-0 unit's own pins**, which assert the set/manifest/digests **by path**). **Excluding the vendored file leaves 15, all vendoring-work; ZERO hits in `src/renderer/**`, `src/main/**` or any consumer test** — i.e. **the vendored module is INERT and the fork still has no gutter-affordance mechanism of its own.** **The row's CONCLUSION (`PD-UI-5` is a `NEW-BUILD-AND-ADAPT`, not a deletion) is therefore CONFIRMED at this head; only the command's date-sensitivity is the caveat.**
| **Replaces** | **`U-GUTTER-UI`** `gutter-affordance.ts` `createGutterAffordance`/`cursorDeclarationFor`/`domEventSource`/`PointerResolver`/`SizeFromPointer`/`AxisOf`/`ApplyPreview`/`ApplyCursor`/`Commit`/`MoveTypeOf`/`CursorOf`/`GutterAffordanceStats`/`PreviewState`/`EventSourceLike` |
| **Consumers** | as `PD-GESTURE-1` + `PD-GESTURE-3` |
| **Classification** | **`DELETE-SUBSET-KEEP-ADAPTER`** — the **cursor/geometry/preview** half is replaceable by `createGutterAffordance`; the **hover-token styling** is app CSS (**KEEP**). **This is a BUILD, not a swap**: the fork must *adopt* a mechanism it never factored out |
| **Test disposition** | the gutter/`index.html` suites in `PD-GESTURE-3` — **REWRITE** |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger §2 entries #10/#11 and §1 row `PD-UI-5`, finding `C-3`). NOTHING ABOVE IS REWRITTEN.** The cell points at the `PD-GESTURE-3` suites, which is right; **the collision is the CLASS.** **`§2.1` `PD-GESTURE-3` says of those same three suites: *"all 3 suites **REWRITE** for the session rows; **KEEP** for the clamp/`setZoneSize` rows"*** — while **§4's `ARCHIVE` row lists `tests/unit-u-shell-5-resizable-gutters.test.ts` as a whole-file `ARCHIVE`.** **MEASURED (methods `M-static` + `M-row`):** that file is **1 of the 3** `src/renderer/pane-gutter.js` importers and carries **33 literal rows**, of which the **append/`data-axis` cursor + clamp rows are app-CSS/policy** no foundation mechanism supersedes. **Measured disposition: `SPLIT`** (session rows archive, clamp/`setZoneSize` rows stay). **Also recorded:** `PD-UI-5` is the **BUILD** — the fork has **no** `gutter-affordance` module (the row's own zero-grep reading is **CONFIRMED** at `d7ae18e`), so **this row has nothing to archive** and owes a **new** red set instead.
| **Risk / collision** | **The largest real work item in the set** and the one most likely to be underestimated: there is nothing to delete-then-substitute, only an inline behavior to re-express. `W2-N7` (MEDIUM, OPEN) is its known live gap |

---

#### `PD-HOST-KEEP` — the KEEP set (recorded so the rebuild does not over-prune)

| Path(s) | Why it stays |
| --- | --- |
| `src/renderer/pane-graph.ts`, `pane-registry.ts`, `sidebar-panes.ts` (beyond the named subsets), `gnosis-panes.ts`, `gnosis-crud-panes.ts`, `template-pane.ts`, `hover-preview.ts`, `edit-controller.ts`, `content-reconcile.ts`, `secure-panels.ts`, `render-shared.ts`, `extensions.ts`, `cross-document-shared.ts` | **app behavior** — provident-authored UI, pane/zone vocabulary, the C18/C19/C20 features. `docs/FORK-DIVERGENCE.md` §3 rule 2 |
| `src/main/rag-store*.ts` (7 files), `retrieval.ts`, `traversal.ts`, `adjacency.ts`, `backlinks.ts`, `doc-flow.ts`, `markdown-*.ts`, `rich-decompose.ts`, `paste-sanitize.ts`, `page-diff.ts`, `edit-ops.ts`, `template-*.ts`, `embeddings.ts`, `vector-*.ts`, `*engine-*.ts`, `query-audit.ts`, `merge-store-results.ts`, `authority-store.ts`, `idempotency-registry.ts`, `operator-settings-store.ts`, `module-store.ts`, `security*.ts`, `battery-host.ts`, `standalone.ts`, `preload.ts` | **app/domain/host layer** — `docs/FORK-DIVERGENCE.md` §2 row 9; the RAG layer is *"specific to this project, never handed off"* |
| `src/shared/types.ts`, `document-tree.ts`, `demo-envelope.ts`, `dom-shim.ts`, `o0-hook.ts`, `o0-report.ts`, `path-fork-cycle.ts` | fork carriers / measurement / shim — **not** shell-chrome mechanism |
| `src/renderer/content-reconcile.ts` + `runtime.ts` (`applyContentReconcile`) | `docs/FORK-DIVERGENCE.md` §2 row 8 **excludes itself**: a host use of **published engine primitives**, not a mechanism |

---

## 3. CONSUMER MAP — the dependency-ordered change list

**The rule this section enforces.** A module with a live importer **cannot be eliminated before that importer
changes**. The order below is derived from the `src/**` importer graph (READ, §2.1) and is **strict**: each wave's
files must compile (and its importers be edited) **before** the next wave's deletion is legal.

| Wave | Change | Blocks |
| --- | --- | --- |
| **0** | **Author the rebuild's own specs.** Every row above needs a `docs/specs/unit-*.md` contract before any code (AGENTS.md item 9 / gate 2). The two foundation adoptions with **NAMED COLLISIONS** (`PD-OVERLAY-1`'s re-parent; `PD-THEME-1`'s env/return shape; `PD-FOCUS-3`'s arg set) **MUST** carry gate-1 records **plus adoption dossiers** per the gate-1 STEP-0 rule | **everything** |
| **1** | **Leaf pure modules with no `src/**` siblings** — `src/renderer/theme.ts` (`PD-THEME-1`), `src/renderer/modal-state.ts` (`PD-OVERLAY-1`). Importer counts: **1 each** (`renderer.ts`). Edit the importer's call site in the same commit | 2, 5 |
| **2** | **`src/renderer/layout-state.ts`'s projection subset** (`PD-ZONES-1`) — **7 `src/**` importers must re-point in ONE commit**: `operator-settings-store.ts`, `pane-drag.ts`, `pane-graph.ts`, `pane-gutter.ts`, `renderer.ts`, `sidebar-panes.ts`, `shared/types.ts` (+ the `pane-registry.ts` type reference). The **exported names/shapes of `coerceLayout`/`defaultLayout` are frozen** by a PROTECTED suite | 3, 4, 6 |
| **3** | **`src/renderer/pane-drag.ts` + `pane-gutter.ts` controller halves** (`PD-GESTURE-2`/`PD-GESTURE-3`) — importers: `renderer.ts`, `sidebar-panes.ts`, `pane-graph.ts`, `pane-gutter.ts` (cross) | 4 |
| **4** | **`src/renderer/renderer.ts`'s gesture machine + gutter affordance** (`PD-GESTURE-1`, `PD-GUTTERAFF-1`) — self-contained once 2/3 land | 6, 7 |
| **5** | **`src/renderer/sidebar-panes.ts`'s `applyZoneTracks` body + `pane-state`/`tab-strip` seam re-points** (`PD-ZONES-3`, `PD-FOCUS-2` subset) | 7 |
| **6** | **`src/renderer/index.html` markup + grid/track CSS** (`PD-REGION-1`, `PD-ZONES-2`) — **atomic**, with 2/3/4 | 8 (live) |
| **7** | **`src/renderer/runtime.ts`'s stale-mount sweep** (`PD-REGION-2`) — **LAST**, because its foundation counterpart is a `runtime.ts` **diff** and it is the only row whose regression is **APP-only visible** | 8 (live) |
| **8** | **`src/main/app-menu.ts`'s builder/normalizer** (`PD-MENU-1`) + **`src/main/mcp-server.ts`'s focus row** (`PD-FOCUS-3`) — **main-process, independent of the renderer waves**; may run **in parallel** with 1–7 | tracker gate |
| **9** | **Tracker/archive closure** — `docs/next-steps.md` DONE rows, `docs/decisions.md` rows, `docs/pending.md` park rows, `docs/HANDOFF.md`; every archived test repointed; every citation re-pinned **by symbol** | — |

**Total `src/**` files implicated (READ):**

| Class | Count | Files |
| --- | --- | --- |
| **Modules with a whole-file or subset elimination** | **10** | `src/renderer/theme.ts`, `modal-state.ts`, `layout-state.ts`, `pane-drag.ts`, `pane-gutter.ts`, `tab-state.ts`, `tab-strip.ts`, `src/main/app-menu.ts`, `src/main/import-directory.ts` *(evaluated, kept)*, `src/main/mcp-server.ts` *(one tool row)* |
| **Host files whose call sites must change** | **11** | `src/renderer/index.html`, `renderer.ts`, `sidebar-panes.ts`, `runtime.ts`, `pane-graph.ts`, `pane-registry.ts`, `src/main/main.ts`, `src/main/security.ts`, `src/main/operator-settings-store.ts`, `src/main/preload.ts`, `src/shared/types.ts` |
| **Total `src/**` files implicated** | **21 of 72** | **29 % of the tree.** The remaining **51** are `PD-HOST-KEEP` / `NOT-IN-SCOPE` |

**Total `tests/**` files implicated (READ — see §4 for the class split):**

| Metric | Value |
| --- | --- |
| `tests/**` top-level entries (`ls tests`) | **205** |
| `.test.ts` files | **201** |
| `.test.mjs` files | **3** (`adapter-parity-battery`, `e2e-battery`, `mcp-stdio-e2e`) |
| `tests/fixtures/` files | **5** |
| **Files importing a §2.1 candidate module by exact specifier** | **33** (READ — the precise union of the `import … from '../src/<candidate>.js'` specifiers) |
| **Files reading `src/renderer/index.html`** | **10** (READ) |
| **Files importing `src/renderer/renderer.js` or `src/renderer/runtime.js`** | **69** (READ) — the broad host surface, **not** all elimination-bound |
| **Files referencing `live-drive`** | **8** (READ) |
| **U-SHELL unit-suite family** | **20** (READ — `tests/unit-u-shell-*.test.ts` + `unit-u-shell-shell-wiring*.test.ts`) |
| **PROTECTED among the implicated set** | **2** — `tests/unit-live11-bridge-seams.test.ts` (in the U-SHELL/`PD-ZONES-1` import set) + `tests/unit-wave-1-bridge-wiring.test.ts` (a host-seam importer). **9 protected artifacts in total** including the non-imported ones (§5) |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; the measured ledger is `docs/specs/post-division-test-disposition-2026-09-28.md`). NOTHING ABOVE IS REWRITTEN — this note is the reconciliation, and it is READ THROUGH the cell.** **FINDING `C-13` [MED]:** the cell's `2` is **two lower than the measured count once `G-9`/`X-9` is applied** — `tests/unit-v5-migration-contract.test.ts` is itself **implicated BY the pin duty** (it pins `package.json`'s test scripts and `vitest.config.ts`'s `testTimeout`, both of which **`G-5`'s `npm run battery`-per-UI-unit requirement and the +15 vendored suites touch**), so the implicated `PROTECTED` set reads **3**, not 2. **MEASURED at `d7ae18e` (method `M-static`, `grep -rlE "(from |await import\(|import\()'[^']*src/renderer/(renderer|runtime)\.js'" tests`)**: the broad host surface is **69** files — the cell's figure is **right**, and the ledger **re-states it because it is the number most likely to be mistaken for the archive set** (an elimination may not treat a `renderer.js` importer as implicated unless **its row names that importer**).

---

## 4. TEST DISPOSITION

**Class meanings.** **ARCHIVE** = the subject is superseded by a foundation mechanism → move to the gitignored
`archive/` (per `DECIDED: REBUILD-ARCHIVE-POLICY`, `docs/decisions.md`) and record the coverage hole; **never**
restore except through the owning unit's cycle with a fresh red set. **REWRITE** = the subject survives but its
shape/imports change. **KEEP** = untouched (app behavior, or a different layer). **PROTECTED** = pinned **by path or
by name** in a source-contract suite and therefore **immovable** until its owning unit re-states the pin.

| Class | Count | Files |
| --- | --- | --- |
| **PROTECTED** | **9** | see §5 |
| **ARCHIVE** (whole-suite subject superseded) | **11** | `tests/unit-u-shell-2-theme.test.ts` (the resolver rows), `tests/renderer-empty-zone-track.test.ts`, `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts`, `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts`, `tests/unit-u-shell-5-resizable-gutters.test.ts`, `tests/unit-u-shell-shell-wiring.test.ts`, `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts`, `tests/props-layout-state.test.ts`, `tests/props-pane-graph.test.ts`, `tests/props-tab-state.test.ts`, `tests/unit-u-shell-1-layout-zones.test.ts` |
| **SPLIT (ARCHIVE the mechanism rows; KEEP the app-policy rows in the same file)** | **8** | `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts`, `tests/unit-u-shell-3-collapsible-panes.test.ts`, `tests/unit-u-shell-4-drag-relocate.test.ts`, `tests/unit-u-shell-7-settings-modal.test.ts` (the **re-parent** rows survive — `PD-OVERLAY-1`), `tests/unit-u-shell-9a-main-focus-tabs.test.ts` (the **tab vocabulary** rows survive — `PD-FOCUS-1`), `tests/unit-u-menu-1-application-menus.test.ts` (the **ordering** rows survive — `PD-MENU-1`), `tests/unit-u-import-1-import-surface.test.ts` (the **dialog/import-policy** rows survive — `PD-MENU-2`/`PD-MENU-3`), `tests/unit-u-shell-6-hover-affordance.test.ts` (**KEEP outright** — it pins app `is-clickable` CSS, which no foundation mechanism supersedes; listed here only because it reads `index.html`) |
| **REWRITE** | **1 + the tab families** | `tests/renderer-pane-drag-surface.test.ts` (**must be rewritten, never archived** — it pins the real defect F-1 `PANE-BODY-GESTURE-SWALLOWED`), `tests/unit-u-shell-shell-wiring-adversarial.test.ts`; the page-commit family (`tests/page-commit-failure-visibility.test.ts`, `tests/page-commit-scope-ack-race.test.ts`, `tests/page-commit-tab-ownership.test.ts`), the stage-active-tab family (`tests/unit-stage-active-tab-display.test.ts`, `…-adversarial.test.ts`, `…-blind-contradictions.test.ts`, `…-contract-holes.test.ts`, `…-pbt-generators.test.ts`), `tests/unit-u-shell-9b-*.test.ts` (6 files), `tests/unit-live4-empty-store-landing.test.ts`, `tests/unit-u-edit-1-property-register.test.ts` |
| **KEEP** | **the remainder (~180 of 204)** | the suites outside the U-SHELL/page-commit/tab/props families (RAG, MCP, module, traversal, edit, security, template, engine, O-0) plus `tests/sidebar-panes*.test.ts` and `tests/unit-live11-bridge-seams.test.ts` (**PROTECTED**). **These are app/domain tests whose subject no foundation mechanism supersedes** |

**⚠ These counts are DERIVED by classification from the §2.1 disposition cells, NOT measured.** The exact
ARCHIVE/REWRITE split is a **per-unit gate-2 decision** once each row's spec exists. **UNVERIFIED as a final
split.** The 33-import figure in §3 is a **measured grep reading**; the three class counts here are **not**.

**⚠ HONEST LIMIT.** The ARCHIVE/REWRITE/KEEP split above is **derived by classification, not by execution**. This
pass has **no shell** and did **not** run vitest; no file was moved, created or deleted. The authoritative split is
owed to each unit's gate-2/red-set pass.

> **⟶ SUPERSEDED IN PART / ANNOTATED 2026-09-28 — the `X-3` MEASURED-DISPOSITION PASS. THE TABLE ABOVE STANDS AS WRITTEN AND IS READ THROUGH THIS NOTE; NOTHING IN IT IS REWRITTEN AND NO ROW ID HAS MOVED.** Gate finding **`X-3` [HIGH]** (*"re-derive the per-file test disposition per amended row before delegating, and mark every count `(measured | derived)` — the inventory's §4 classes contradict its own §2.1 cells in at least two places and self-declare 'DERIVED … NOT measured'"*) **is DISCHARGED by `docs/specs/post-division-test-disposition-2026-09-28.md`** — a per-file, per-row ledger over the **15 Phase-1 rows** of proposal §4.1 as split by §4.7, with the wave per row from the re-issued §4.5 table, **32 ledger entries covering 37 distinct `tests/**` files**, the **re-verified `PROTECTED` set read from `tests/unit-v5-migration-contract.test.ts`'s own assertions**, a **collision table**, and a per-wave **`(projected, not measured)`** coverage plan. **The `Class`/`Count` columns of this table are the pass's own self-declared `(derived)` reading** — the two `⚠` markers above say so — and **the ledger's §2 supersedes them with measurements.**
>
> **The contradictions this annotation records (`C-1`..`C-11` in the ledger's §3), by row:** **(a) — the `ARCHIVE` row contradicts `§2.1` in FIVE places.** `tests/unit-u-shell-1-layout-zones.test.ts` is `ARCHIVE` here while `§2.1` `PD-ZONES-1` **and** `§2.1` `PD-ZONES-2` both class it **`REWRITE`** as an `index.html`-reading suite (`C-1`); `tests/unit-u-shell-2-theme.test.ts` is `ARCHIVE` here while `§2.1` `PD-THEME-2` marks its token rows **`KEEP`** and `§2.1` `PD-THEME-1` marks the file **`REWRITE`** (`C-2`); `tests/unit-u-shell-5-resizable-gutters.test.ts` is `ARCHIVE` here while `§2.1` `PD-GESTURE-3` says *"all 3 suites **REWRITE** for the session rows; **KEEP** for the clamp/`setZoneSize` rows"* (`C-3`); `tests/unit-u-shell-shell-wiring.test.ts` + `…-pbt-generators.test.ts` are `ARCHIVE` here while `§2.1` `PD-GESTURE-1` lists **both** among its **4 `REWRITE` suites** (`C-4`); and `tests/renderer-empty-zone-track.test.ts` + `…w2n3-zone-size-grid` + `…w2n4-operator-grid-area` are `ARCHIVE` here while `§2.1` `PD-ZONES-2` marks all three **`REWRITE`** (`C-5`). **(b) — the three PBT-register files** (`tests/props-layout-state.test.ts`, `tests/props-pane-graph.test.ts`, `tests/props-tab-state.test.ts`) are `ARCHIVE` here, while **`§2.1` does not class them so** and **the PBT gate makes a register a Phase-1 unit's own re-derivation obligation** — an ARCHIVED register file is a **PBT-gate regression**; `props-pane-graph` **additionally imports `pane-graph.js`, a `PD-HOST-KEEP` module** (`C-6`). **(c) — TWO FILES SIT IN TWO CLASSES.** `tests/unit-u-shell-9a-main-focus-tabs.test.ts` is in the `SPLIT` row **and** in the `REWRITE` row's *"the tab families"*; and the `REWRITE` row is headed `1 + the tab families` while naming **two** files in its `1` position (`tests/renderer-pane-drag-surface.test.ts` **and** `tests/unit-u-shell-shell-wiring-adversarial.test.ts`) — so the row's own count does not reproduce (`C-7`, `C-8`). **(d) — the `SPLIT` row contains a `KEEP` file** (`tests/unit-u-shell-6-hover-affordance.test.ts`, by the row's own words *"**KEEP** outright … listed here only because it reads `index.html`"*), so the row **cannot be summed** as *archive these eight* (`C-9`). **(e) — the `REWRITE` row's tab-family classes are wrong:** every page-commit and stage-active-tab file in it imports `src/renderer/tab-state.js` as **`import type`** and `tab-strip.js` as a **value**, which is exactly the **type-surface `KEEP`** `§2.1` `PD-FOCUS-1` describes (`C-7`; `tests/unit-live4-empty-store-landing.test.ts` is the exception — it imports **values** that are the tab **vocabulary**, also `KEEP` by `§2.1`). **(f) — `KEEP`'s `~180 of 204` is `(derived)` and its denominator is not a collected count at any head**: collected = **201** at this file's head `b6791e0` and **204** at `d7ae18e` (**+3** from the `PD-VENDOR` pass's `tests/pd-vendor-*.test.ts`; measured by `git diff --name-status b6791e0 d7ae18e`) (`C-8`, `C-12`). **(g) — the `PROTECTED among the implicated set` cell in §3 reads `2` and must read `3` once `G-9`/`X-9` is applied** (the pin file itself is implicated by the pin duty) (`C-13`). **(h) — every size cell in §8.1 is stale at `d7ae18e`**: measured **208** top-level entries / **204** `.test.ts` / **3** `.mjs` / **5** fixtures / **88** `src/**` / **5** `scripts/**` (`C-12`).
>
> **THE MEASURED REPLACEMENT IS THE LEDGER'S §2** (32 entries covering 37 distinct `tests/**` files; every count carries `(measured: <method>)` or `(derived)`), **its §4 is the `PROTECTED` set as re-verified by reading the pin**, **its §5 is the collision table**, **its §6 records that `archive/tests/**` holds 41 files and that 0 of this program's 19 candidate files is among them**, and **its §7 is the per-wave coverage plan — labelled `(projected, not measured)` because that pass ran no suite.** **The ledger is READ-ONLY for code and moved no file; its own layer is REPO-TEST-SURFACE / DOC-LAYER (RCA-12: not app-green).**

---

## 5. PROTECTED FILES — pinned by path/name (READ)

**`tests/unit-v5-migration-contract.test.ts` is the pin.** It is the source-contract suite from the
vitest-5/electron-44 migration unit (`docs/specs/unit-v5-migration.md`, `DEC-2`), and it pins files **by path** and
the electron-mock census **by name**. **Any file named below is immovable** until that suite's owning unit re-states
the pin.

| Protected artifact | How it is pinned (READ) | Why it matters to this program |
| --- | --- | --- |
| `tests/unit-u2-rich-decompose.test.ts` | `DEEP_ROWS` — `join(TESTS_DIR, 'unit-u2-rich-decompose.test.ts')`, row `ADR-4`, fn `decomposeRichHtml`, with a **depth-exactly-10 000** assertion | **NOT in the elimination set** (rich decomposition is domain code) — but it is a **hard immovable**: no rename, no move, no row rename |
| `tests/unit-s-paste-sanitization.test.ts` | `DEEP_ROWS` — same `join(TESTS_DIR, …)` form, row `Tokenizer F1`, fn `sanitizePastedHtml`, depth 10 000 | same |
| `tests/template-adversarial.test.ts` | **electron-mock census**, asserted as an **exact name-set equality** in the row *"the derived census is NON-EMPTY"* | **immmovable NAME.** A rename or a new electron-mocking file reds this row |
| `tests/unit-live11-bridge-seams.test.ts` | **electron-mock census** (exact set) **AND** it imports `defaultLayout`/`coerceLayout`/`LayoutState`/`PaneLayoutEntry` from `../src/renderer/layout-state.js` (**READ**) | **THE CRITICAL COLLISION.** It pins **`PD-ZONES-1`'s exported names/shapes**. **`defaultLayout` and `coerceLayout` may not be renamed, removed or re-shaped** while this pin stands — so the layout projection adoption **cannot** be a whole-file replacement |
| `tests/unit-u5-rich-commit-ipc.test.ts` | **electron-mock census** (exact set) | immovable name |
| `tests/unit-v5-bridge-capture.test.ts` | **electron-mock census** (exact set) — the §3.2 pin file that mocks `'electron'` **for real** | immovable name |
| `tests/unit-wave-1-bridge-wiring.test.ts` | **electron-mock census** (exact set) **AND** it imports `src/renderer/sidebar-panes.js` + `src/main/mcp-server.js` (**READ**) | immovable name; pins the host seams `PD-GESTURE-1`/`PD-ZONES-3` change |
| `tests/unit-import-batch-persist-contract.test.ts` | the **NOTE-pin** requires this file to exist and to still carry register row `'P-TP-4'` + `strat:per-op-cadence` | immovable name **and** content |
| `tests/fixtures/v5-bridge-capture-fixture.js` | imported by path from the migration-contract suite | immovable |
| **Non-test artifacts pinned by the same suite** | `vitest.config.ts` (`test.testTimeout` **exactly 15 000 ms** — floor **and** ceiling), `package.json`'s `scripts.test`/`scripts['test:watch']` (**no `--testTimeout`**), `src/main/markdown-import.ts` (ONE `.applyBatch(`, **no** per-op `persist`), `docs/specs/ui-overhaul.md` (the Class-C timing corpus, read by path) | **`src/main/markdown-import.ts` is a PROTECTED `src/**` file** — a source-contract pin, not a test |

> **⟶ re-VERIFIED 2026-09-28 (gate finding `X-3`; ledger `docs/specs/post-division-test-disposition-2026-09-28.md` §4). THE SET ABOVE IS CONFIRMED BY READING THE PIN'S OWN ASSERTIONS, and the re-verified set is exactly TEN artifacts (9 `tests/**` + 1 `src/**`), plus three non-test artifacts and the pin file itself.** **What was read this pass, by the pin's own anchors (never by a line number):** **`DEEP_ROWS`** — two `join(TESTS_DIR, …)` entries (`tests/unit-u2-rich-decompose.test.ts` row `ADR-4`; `tests/unit-s-paste-sanitization.test.ts` row `Tokenizer F1`), each re-read for `.repeat(10000)`, `.not.toThrow()`, the `ok === true` assertion, **no** bare `catch (`, **no** `it.skip`/`it.todo`, **no** per-row `{ timeout: }`. **The electron bridge-mock census** — a **derived** scan (`deriveElectronMockFiles`) asserted as an **exact 5-name equality**: `template-adversarial.test.ts` · `unit-live11-bridge-seams.test.ts` · `unit-u5-rich-commit-ipc.test.ts` · `unit-v5-bridge-capture.test.ts` · `unit-wave-1-bridge-wiring.test.ts` — **a new electron-mocking file reds it**, which is exactly why §4.4's cell *"PD-UI-4/5 ↔ unit-wave-1-bridge-wiring (a NEW electron-mocking file reds the census)"* is a **standing constraint on every Phase-1 wave**. **The content pin** — `tests/unit-import-batch-persist-contract.test.ts` must still carry the literal `'P-TP-4'` **and** the `strat:per-op-cadence` strategy id. **The path-imported fixture** — `tests/fixtures/v5-bridge-capture-fixture.js`; **note its REAL extension on disk is `.ts`** (the pin uses the `.js` specifier). **The corpus read** — `docs/specs/ui-overhaul.md`, via `join(ROOT, …)`. **The non-test three** — `vitest.config.ts`'s `test.testTimeout` as a **NUMBER, `>= 15_000` AND `<= 15_000`** (the ceiling oracle rejects `20_000`/`60_000`); `package.json`'s `scripts.test` and `scripts.test:watch` carrying **no `--testTimeout`**; and `src/main/markdown-import.ts` by source contract (**exactly one** `.applyBatch(`, **no** per-op `putNode`/`putEdge`, the `op: 'putNode'` literal **before** `op: 'putEdge'`). **THE PIN FILE ITSELF IS `PROTECTED-BY-CONSTRUCTION`**: `tests/unit-v5-migration-contract.test.ts` is named by none of its own assertions, yet **moving or renaming it retires every one of them** — and per `G-9`/`X-9` it is **the pin duty's own subject** (ledger `C-13`: the implicated `PROTECTED` count is **3**, not §3's `2`).

**`vitest.config.ts`'s collection surface (READ).** `test.include = ['tests/**/*.test.ts']`; `environment: 'node'`;
`testTimeout: 15_000`. **Consequences for the rebuild:**

1. **`.mjs` suites are OUTSIDE the collection surface** — `tests/e2e-battery.test.mjs`,
   `tests/adapter-parity-battery.test.mjs`, `tests/mcp-stdio-e2e.test.mjs` are **not** run by `npm test`; they are
   run by `package.json`'s `battery` script. **A rebuild that breaks them is invisible to the trio.**
2. **`tests/**` only** — a suite placed under `archive/` is **automatically out of the suite** (this is what makes
   ARCHIVE a safe disposition).
3. **`testTimeout` is pinned at 15 000 ms from BOTH sides** — the ceiling oracle rejects a raise. A rebuild unit
   that adds a slow row **cannot** buy headroom by raising the budget.

---

## 6. LIVE-BATTERY COUPLING (`scripts/live-drive.mjs`)

**READ.** The driver is **6 130 lines** and defines **39 named blocks** (`grep` on `block: '<name>'`). Blocks that
exercise an eliminated surface:

| Block (READ) | Eliminated surface it exercises |
| --- | --- |
| `user1_tab_new` | `PD-FOCUS-1`/`PD-FOCUS-2`/`PD-FOCUS-3` — a REAL tab create through the strip + the `provident.focus` seam |
| `user2_pane_drag` | `PD-GESTURE-1`/`PD-GESTURE-2`/`PD-REGION-1` — a real pane drag + drop, with the pane-drag pointer-capture diagnostic |
| `user3_collapse_orientation` | `PD-ZONES-2`/`PD-ZONES-3` — collapse orientation + the `is-empty` mirror |
| `user7_zone_resize` | `PD-GESTURE-3`/`PD-GUTTERAFF-1`/`PD-ZONES-1` — a real gutter resize to a zone size |
| `user8_zone_boundary` | `PD-ZONES-1`/`PD-ZONES-2` — zone boundaries + stage margins |
| `user9_search_open_in_tab` | `PD-FOCUS-1`/`PD-FOCUS-2` — search open-in-tab |
| `user10_collapse_vertical_text` | `PD-ZONES-2` — vertical-text collapse geometry |
| `uf_layout_10`, `uf_panes_8`, `uf_panes_12`, `uf_tabs_3`, `uf_tabs_7`, `uf_hist_6` | the §5.U delta-matrix row carriers (`uf_panes_12` is the row `U-3` **"the pane-drag gesture surface is the pane HEADER only"**) |
| `stage_multimount_reachability` | `PD-REGION-2` — the multi-mount / stale-`#wiki-root` reachability probe (the `UF-STAGE-AT-7` park) |
| `stage_tabs_persist_roundtrip`, `stage_refresh_survival_v5` | `PD-FOCUS-1` — tab persistence through a real reload |

**Driver helpers that read eliminated DOM/selectors (READ of the helper names):** `ufTabState` (reads
`#tab-strip .tab` incl. `data-tab-id`/`data-target-kind`/`is-active`), `ufModal` (the modal frame/scrim),
`ufPaneFrames`, `ufHitProbe`, `ufRealClick`, `ufRealClickTab`, `ufArmClick`, `stage_*` diagnostics.

**The §5.U delta matrix (RECORDED, not measured).** `tests`-side the matrix is capped at **8 rows** (`U-1…U-8`);
`docs/next-steps.md`'s 2026-09-22 DONE rows record the full-battery run emitting
`{"total":8,"pass":0,"fail":2,"matrixRowsExecuted":2,"blocksRun":100,"extendedRowsRun":54,"diagnostics":27}` with
**6 of 8 rows coming back untyped** (the driver types **one §6.1 row per block**). **This is a recorded reading.**

---

## 7. THE FORK-LOCAL MCP TOOL CENSUS vs THE FOUNDATION (READ)

### 7.1 The count

| Figure | Fork (READ) | Foundation (READ) | Note |
| --- | --- | --- | --- |
| `ALL_TOOLS` rows | **59** | **22** | the fork's roster is **37 rows larger** — the whole app surface (`rag.*`, `edit.*`, `gnosis.*`, `code.template.*`, `module.*`, `get_query_audit_log`, `rag-stream`) |
| `provident.focus` present? | **YES** | **YES** | the **only** row in the fork's roster that has a direct foundation counterpart |
| `provident.get_journal` present? | **YES** (read-only journal introspection) | **NO** | **STAYS FORK-LOCAL** — no foundation counterpart |
| Group of `provident.focus` | `dispatch` (`src/main/security.ts` `TOOL_GROUPS`) | `dispatch` (the foundation spec's `§2.1` item 2: *"the EXISTING group, ON by default"*) | **AGREE** |
| `RpcMethod` member | `'focus'` (`src/shared/types.ts`) | `'focus'` | **AGREE** |
| Foundation's own census language | — | `docs/specs/focus-tool.md` `§2.1` item 1: the tool is **"the `22nd` `ALL_TOOLS` member"**, census **`21 → 22`**, asserted **by name-set equality**; `RpcMethod` **`21 → 22`**; the default-gate registered subset **`7 → 8`** | **The "22nd tool" the fork's trackers reference is the FOUNDATION's census position, not the fork's.** In the fork the same tool sits at position **2** of 59 |

### 7.2 The answer — does adopting `provident.focus` change the fork's count, names, or `ALL_TOOLS` rows?

| Question | Answer |
| --- | --- |
| **Count?** | **NO — 59 rows stay 59.** Both trees already carry exactly one `provident.focus` row. Adopting the foundation's tool **replaces a row; it adds none and removes none.** ⚠ **BUT:** the foundation's `§5.2` item 4 asserts its census **by NAME-SET EQUALITY** and its `§5.1`'s diff scope is an **allow-list**; and the foundation's own record (`docs/specs/focus-tool.md`, `§5.2` item 4 (iii)) names **SIX pinning suites that live OUTSIDE its allow-list and all pin the census at 21** — *"so `npm test` IS RED UNDER EITHER CHOICE"*. **That is a foundation-side finding, not the fork's, but it means the foundation's tool did NOT land census-clean in its own tree.** **UNVERIFIED for the fork** (this pass did not run the fork's suite) |
| **Tool names?** | **NO count change, but a CALLER-VISIBLE ARG CHANGE.** See 7.3 |
| **`ALL_TOOLS` rows?** | **The row survives; its registered SDK row CHANGES.** The fork registers with `title: 'Focus a tab'` + a long description + a **zod `inputSchema`**; the foundation's is a **THIN ADAPTER** that validates a **plain-object member subset** and throws `TypeError` with the messages *"malformed arguments — a `<form>` is not the declared shape { target?, newTab? }"* and *"unknown argument '<k>' — the declared shape is { target?, newTab? }"* (READ of the foundation's handler) |

### 7.3 THE NAMED SEMANTICS COLLISION (the load-bearing finding)

| Member | Fork (READ) | Foundation (READ of `docs/specs/focus-tool.md` §2.1 item 4 + the handler) | Collision |
| --- | --- | --- | --- |
| `target` | a **5-kind discriminated object union** — `{kind:'document', documentId}` \| `{kind:'search', queryId}` \| `{kind:'graph', view}` \| `{kind:'template', templateId}` \| `{kind:'other', id}` | **`target?: string`** — a bare string | **SHAPE CHANGE.** The foundation's `target` is a **string**; the fork's is an **object**. A caller that passes `{kind:'document',…}` gets a `TypeError` from the foundation's validator |
| `tabId` | **present** — `z.string().min(1).optional()` — *"Activate an existing tab by id (an alternative to a target)"* | **ABSENT.** The foundation's declared set is exactly `{ target?, newTab? }`, and *"an added member is a SHAPE EXTENSION and needs the architect"* (`§7a.1` item 1) | **THE COLLISION.** Adopting the foundation's tool **DROPS `tabId`** — a live, pinned, caller-facing capability |
| `newTab` | present (`z.boolean().optional()`) | present (`newTab?: boolean`) | **AGREE** |
| Return | the renderer's answer, passed through via `text(value)` | `{ activeId: string \| null, entries: string[], opened: boolean, refused?: { reason: string } }` — passed **BY IDENTITY**, no `typeof`, no coercion, no trim, no sort, no dedupe | **NEEDS RECONCILIATION** with the fork's actual renderer answer — **UNVERIFIED** (this pass did not read the fork's `focus` renderer case return shape) |
| Route | `backend.invoke('focus', args)` | *"VALIDATE → ONE RENDERER CALL → RETURN THE ANSWER VERBATIM"* | **AGREE** |

**Consequence for the rebuild — a gate-1 finding that must be escalated, not absorbed:**

> **`PD-FOCUS-3` CANNOT BE A PLAIN SUBSTITUTION.** Adopting the foundation's `provident.focus` either
> **(a)** drops the fork's `tabId` argument and re-shapes `target` from an object union to a string — a
> **breaking MCP API change** across a live, pinned surface (`tests/unit-u-shell-9a-main-focus-tabs.test.ts`,
> the `live-drive.mjs` `user1_tab_new` block, and the fork's own `docs/specs/mcp-endpoint.md` §3 drift note which
> already records `provident.focus` as **unlisted** there) — or **(b)** keeps the fork's declared shape and adopts
> **only the route discipline** (thin adapter, no state/map/notify/store), which is a **partial adoption**.
> **The fork's tracker already records the correct move:** `docs/specs/mcp-endpoint.md` §3.8 is written as an
> **OWED** landing (*"lands with `U-FOCUS-TOOL`; the tool DOES NOT EXIST YET"*, with a **21-row** census) — i.e.
> the fork's own endpoint contract expects the foundation's row, and it has **drifted** (the fork has 59 rows and
> the tool **already exists**). **This is a `BLOCKED-ON-SEMANTICS` condition for any unit that adopts the tool.**

**Also recorded:** `docs/specs/mcp-endpoint.md` (the fork's copy) §3's tool table **does not list**
`provident.focus`, `provident.code.get`, or `provident.get_journal` — **RECORDED as drift** in the fork's own
2026-09-17 scope-realignment row (`docs/next-steps.md`) under *"the `docs/specs/mcp-endpoint.md` §3 drift
(`provident.focus`, `provident.code.get`, `provident.get_journal` unlisted) is RECORDED, not fixed"*.

---

## 8. THE FORK'S EXISTING TEST SURFACE (READ) + RECORDED READINGS

### 8.1 Size (READ — `ls`/`grep` only; **vitest was NOT run**)

| Metric | Value |
| --- | --- |
| `tests/**` top-level entries | **205** |
| `.test.ts` (the **collected** surface) | **201** |
| `.test.mjs` (**NOT collected** by `vitest.config.ts`) | **3** |
| `tests/fixtures/` files | **5** |
| `src/**` files | **72** (71 `.ts` + `src/renderer/index.html`) |
| `scripts/**` | **4** (`electron-divergence.mjs`, `live-drive.mjs`, `mcp-cli.mjs`, `start-app.sh`) |

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`; ledger `docs/specs/post-division-test-disposition-2026-09-28.md` §2 entry `T-A` and finding `C-12`). NOTHING ABOVE IS REWRITTEN.** **Every cell in this table is CORRECT AT THIS FILE'S OWN HEAD `b6791e0` and STALE at `d7ae18e`.** Re-measured at `d7ae18e` (methods `M-dir`): `tests/**` top-level entries **208** · `.test.ts` (the collected surface) **204** · `.test.mjs` **3** · `tests/fixtures/` **5** · `src/**` **88** · `scripts/**` **5** (the fifth is `foundation-drift.mjs`, added by the vendoring work). **The delta is measured, not inferred:** `git diff --name-status b6791e0 d7ae18e` shows **16 files added under `src/shared/`** (the fifteen vendored mechanism modules + `foundation-return-shapes.ts`) and **3 test files added** (`tests/pd-vendor-set.test.ts`, `tests/pd-vendor-manifest.test.ts`, `tests/pd-vendor-drift.test.ts`) — **201 + 3 = 204**. **A later pass must not quote this table's figures at `d7ae18e`.**

### 8.2 Recorded `npm test` readings (**RECORDED — NOT this pass's measurement**)

**Two readings are quoted; they DISAGREE on the file count, and the disagreement is recorded, not reconciled.**

| Source (quoted) | Reading | When | Layer |
| --- | --- | --- | --- |
| `docs/next-steps.md`, `CURRENT WORK (2026-09-22)` + the two DONE rows below it | `npm test` (`npx vitest run`) = **1 failed file / 200 passed (201 files) · 1 failed test / 4190 passed / 45 skipped (4236 tests)**; `npm run typecheck` = **exit 0**; `npm run build` = **exit 0**. The single red is the `strat:stage-seam-schedule-single-active` row in `tests/unit-stage-active-tab-display-pbt-generators.test.ts`, attributed to the **PRODUCTION residual** defect row `PANE-TOGGLE-STAGE-COLLAPSE` (APP / assembled-renderer) | supervisor-run **2026-09-22** | **repo-test-surface** — explicitly **NOT app-green** |
| same file, same block, the *"last recorded repo-wide reading"* clause | `221 files / 4 988 passed / 58 skipped / 0 failed`, typecheck 0, build 0 | **supervisor-measured 2026-09-21**, *"PRE-DATING both landings"* | repo-test-surface |
| `docs/next-steps.md` (earlier rows) | `4746 pass / 58 skip / 0 fail`, typecheck 0, build 0 — the **CURRENT/pinning figure** per the 2026-09-17 proofreader pass; the 4743 readings are kept as **superseded** provenance | 2026-09-16/17 | repo-test-surface |

**Honest statement:** the **201-vs-221 file-count divergence is UNRECONCILED**. The 221 figure predates two
landings; the 201 figure is the later run. **Neither is this pass's measurement** and neither may be used as a
green-trio claim. **This pass ran nothing.**

---

## 9. STAYS FORK-LOCAL — fork-local mechanisms with NO foundation counterpart

These are **NOT elimination candidates**. Listed so the rebuild does not over-prune (the over-pruning risk is the
mirror image of the under-verifying risk RCA-12 names).

| # | Fork artifact (READ) | Why it has no foundation counterpart / why it must stay |
| --- | --- | --- |
| **S-1** | **`titleBarStyle: 'hidden'`** (`src/main/main.ts`, the `new BrowserWindow({…})` options) **+ `-webkit-app-region: drag` / `no-drag`** on `.tab-strip`, `.app-nameplate`, `.tab` (`src/renderer/index.html`) | **Window chrome is the Electron shell itself** — the `AGENTS.md` UI-rendering rule's own carve-out names *"the window frame"*. `docs/FORK-DIVERGENCE.md` §2 has **no row** for it and **no SC-n request** covers it; the foundation's `src/main/main.ts` sets **no** `titleBarStyle` (READ). **RCA-12 names this exact surface as structurally unassertable in node** |
| **S-2** | **`src/renderer/index.html`'s ~15 theme TOKEN NAMES** (`--fg`, `--card-bg`, `--border`, `--hover`, …) | `docs/FORK-DIVERGENCE.md` §3 rule 2 **names this case verbatim** as the anti-pattern (*"a token layer that knows Astrographer's 15 token names"*). `U-THEME` carries **no token names** |
| **S-3** | **The zone-name vocabulary** (`stage`, `top-bar`, `left`, `right`, `header`, `footer`) + `LAYOUT_ZONE_MIN`/`MAX` (160/1200) + `LAYOUT_REGION_MIN`/`MAX` (120/1200) + `zone:*` node ids | App topology + policy. `docs/FORK-DIVERGENCE.md` §3 rule 2: *"a focus model that knows `document:`/`gnosis-doc:`"* is the named pattern; the same rule covers a track layer that knows Astrographer's zone names |
| **S-4** | **The tab-target vocabulary** (`TabTarget`'s 5 kinds, `TabSearchParams`, `TAB_LANDING`, `TAB_STATE_VERSION`) | `U-FOCUS-MODEL`'s ids/targets are **OPAQUE** by design; the vocabulary is app state pinned by `W2-Q11` |
| **S-5** | **The pane catalog + pane ordering policy** (`orderPaneCatalog`, `legalZonesForScope`, `PaneScope` `app-graph`/`operator`, `setZoneMinimized`, the `enabledPanes`/`enabledOperatorPanes` carriers) | `U-MENULIB` is **consumer-agnostic** with *"no app item names in the type"*; the picker is **injected, not owned** |
| **S-6** | **The import policy** (`MAX_IMPORT_FILES = 512`, `isMarkdownFile`, `isDotEntry`, `expandImportDirectory`, the `.md` dialog filters) | `docs/specs/menulib.md` §2.1 item 1: *"import semantics stay fork-side"*; `docs/FORK-DIVERGENCE.md` §2 row 7 explicitly excludes it from `SC-7`; decision `IMPORT-ROOT-PER-STORE` |
| **S-7** | **`notifyTabClosed` / `drainClosedTabIds`** (`src/renderer/tab-strip.ts`) — the module-level closed-tab channel | No foundation counterpart; `U-FOCUS-MODEL`'s `onChange`/`persist` are **closer but not equal** (the fork's channel is a queue drained by the page-commit seam). **A partial adoption candidate, not a clean swap** |
| **S-8** | **The modal RE-PARENT** (`installSettingsModal` moving `#panes`+`#operator-panes` into `#settings-modal-body`) | **`U-OVERLAY` REFUSES this half BY CONSTRUCTION** (`docs/specs/overlay.md` title). Decision rows `MODAL-SETTINGS-REPARENT` + `MODAL-DEDICATED-SCRIM` pin it as landed behavior |
| **S-9** | **The shell tab STRIP renderer** (`TabStrip`) | The foundation has a **reducer and no renderer**; `W2-Q12` **RESOLVED**: the strip is **not** `provident.dispatch`-able and parity rides shared application code |
| **S-10** | **`provident.get_journal`** (+ its `RpcMethod` member, `TOOL_GROUPS` row, preload seam, `battery-host` case) | **No foundation counterpart.** It is a **fork-adopted read over the package's `Supervisor.journalEntries`** (decision `JOURNAL-READ-VIA-PACKAGE`) |
| **S-11** | **`src/renderer/content-reconcile.ts` + `Runtime.applyContentReconcile`** | `docs/FORK-DIVERGENCE.md` §2 row 8 **self-excludes**: a host use of **published engine primitives**, not a mechanism |
| **S-12** | **CONTAINMENT + SLOT-ORDER have no fork-local implementation at all** | `docs/FORK-DIVERGENCE.md` §2 row 5 lists *"containment … slot order"* as fork capabilities, but this pass found **no fork-local `contain` declaration and no slot-order API** (READ: no `gutter-affordance`-style module, no `slotAttribute`/`contain` symbol in `src/renderer/**`). **These are `ABSENT`, not `delete`** — the rebuild is a **BUILD** (`U-CONTAINER`/`U-SLOTHOST`), and any row claiming to "eliminate" them is a review finding. **UNVERIFIED as a complete sweep** |

---

## 10. RISK / COLLISION REGISTER (what reds the suite mid-rebuild; what cannot be split)

| # | Risk | Layer it reds | Why it cannot be split / deferred |
| --- | --- | --- | --- |
| **R-1** | **`src/renderer/index.html` markup and its grid/track CSS are ONE unit of meaning.** `PD-REGION-1` + `PD-ZONES-2` land atomically or the `:has(.is-empty)` collapse breaks | **LIVE/APP only** — the node suite is green either way (the dom-shim is CSS-less by design, RCA-12) | The `delete` and the `replace` are in the same file; a half-landing is a **live-only** regression that no gate below gate 6 can see |
| **R-2** | **`tests/unit-live11-bridge-seams.test.ts` is PROTECTED *and* pins `defaultLayout`/`coerceLayout`.** The layout projection adoption (`PD-ZONES-1`) cannot rename, remove or re-shape those exports | repo-test-surface | **Re-stating the pin requires editing a source-contract suite that itself is a PROTECTED artifact of a different unit** (`unit-v5-migration`). The rebuild must land its layout change **around** the frozen names, or file an explicit pin re-statement with its owning unit |
| **R-3** | **`PD-REGION-2` (the stale-mount sweep) has a foundation counterpart that is a `runtime.ts` DIFF, not a file.** The foundation's fix is `reconcileMount()` inside *its* `runtime.ts`; the fork's `runtime.ts` is heavily forked | **LIVE/APP** (defect `STALE-MOUNT-PUSHES-CANVAS`) + `tests/unit-live11-bridge-seams.test.ts` (PROTECTED) | Removing the sweep before wiring an equivalent **silently regresses an already-fixed live defect**. It is the **last** wave for this reason |
| **R-4** | **`provident.focus` adoption is a BREAKING MCP API change** (drops `tabId`; re-shapes `target` object-union → string) | repo-test-surface (`tests/unit-u-shell-9a-main-focus-tabs.test.ts`) **+ LIVE/APP** (`live-drive.mjs` `user1_tab_new`) | **`BLOCKED-ON-SEMANTICS`** — needs an architect ruling before any unit is delegable. It cannot be split from the fork's own `docs/specs/mcp-endpoint.md` §3.8 drift |
| **R-5** | **The `.mjs` batteries are OUTSIDE `vitest.config.ts`'s collection surface.** A rebuild that breaks `tests/e2e-battery.test.mjs` / `adapter-parity-battery.test.mjs` / `mcp-stdio-e2e.test.mjs` is **invisible to the trio** | repo-test-surface (**silently**) | `package.json`'s `battery` script is the only runner. The rebuild's gate-9 trio **must** add `npm run battery` explicitly or the divergence surface goes unverified |
| **R-6** | **The recorded suite readings disagree (201 vs 221 files).** No baseline for "did the rebuild regress" | repo-test-surface | The baseline must be **re-established by a shell-bearing pass before the first elimination lands**, or every subsequent count claim is un-anchored |
| **R-7** | **Two pre-existing RED rows live inside the tab families** — `H-1`(329)/`H-1b`(388)/`H-2`(415) in `tests/unit-stage-active-tab-display-contract-holes.test.ts` (**RECORDED** from `docs/next-steps.md`'s `U-STAGE-ACTIVE-TAB` DONE row) | repo-test-surface | A rebuild that touches `PD-FOCUS-1`/`PD-FOCUS-2` will **inherit** these reds and must not attribute them to its own change. Record the pre-existing red set **before** the first edit |
| **R-8** | **`PD-GUTTERAFF-1` is a BUILD, not a swap** — the fork has **no** gutter-affordance module (READ: zero grep matches) | all layers | There is nothing to delete-then-substitute; the work is re-expressing inline behavior. **The largest under-estimation risk in the set** |
| **R-9** | **Over-pruning.** 51 of 72 `src/**` files are legitimate keepers; `docs/FORK-DIVERGENCE.md` §3 rules 1/2 are the discriminator | all layers | A mechanism/app misclassification is how a working app feature disappears behind a green node suite |
| **R-10** | **The guides were not read by this pass.** If a `docs/guide/*.md` page declares a *sharper* boundary than the code suggests, this inventory's "what it does today" cells may be under-scoped | DOC layer | **UNVERIFIED.** A gate-1 pass that adopts `U-*` must read the corresponding guide page as an adoption-dossier input, per the STEP-0 rule |

---

## 11. THE ADOPTION-DOSSIER TRIGGER (gate-1 STEP-0, stated for the supervisor)

**Which rows in this inventory are "adoption" rows** (their contract names, parameters or vocabulary originate
**outside** this project) and therefore **MUST** carry a `docs/specs/<unit>-adoption-dossier.md` before gate 1:

| Row | Adoption? | Reason |
| --- | --- | --- |
| `PD-REGION-1`, `PD-ZONES-2` | **YES** | adopts foundation `SlotHost`/`ContainerDeclaration` identifiers |
| `PD-REGION-2` | **YES** | adopts `probeMountInvariant`/`assertMountInvariant` + the foundation's `reconcileMount` |
| `PD-GESTURE-1`, `PD-GESTURE-2`, `PD-GESTURE-3` | **YES** | adopts `createGestureSession`, `createRelocateSession`, `createResizeController`, `withinProximity`, `clampToBounds`, `SessionStats`, `CommitSink`, … |
| `PD-OVERLAY-1` | **YES** | adopts `overlayTransition`/`overlayInertDeclaration`/`OverlayState` — **and carries the RE-PARENT refusal collision** |
| `PD-THEME-1` | **YES** | adopts `ThemeEnv`/`ThemeResolution`/`ThemeAttributeWrite` — **and carries the env/return-shape collision** |
| `PD-ZONES-1`, `PD-ZONES-3` | **YES** | adopts `trackFor`/`isEmpty`/`computeTrackVars`/`project`/`projectVar`/`applyVarsToRoot`/`VarSpec`/`ProjectionSkip` |
| `PD-FOCUS-1` | **YES** | adopts `focusTransition`/`focusOrder`/`focusIndex`/`persist`/`FocusVerb`/`FocusRefusalCode` |
| `PD-FOCUS-3` | **YES** | adopts the foundation tool's `{ target?, newTab? }` declared shape — **and carries the `tabId`-drop collision** |
| `PD-MENU-1` | **YES** | adopts `normalizeCatalog`/`buildMenuTemplate`/`selectCatalogItem`/`CatalogEntry`/`TemplateOptions` |
| `PD-GUTTERAFF-1` | **YES** | adopts `createGutterAffordance`/`cursorDeclarationFor`/`domEventSource`/`PointerResolver`/… |
| `PD-THEME-2`, `PD-MENU-2`, `PD-MENU-3`, `PD-FOCUS-2`, `PD-HOST-KEEP`, §9 rows | **NO** | they adopt no externally-sourced identifier — **each needs the written zero-row rationale naming its declared surface** (a silent zero-row on an adopted unit is a review finding) |

**Gate-2 (parameter semantics) note.** For each `YES` row above, the spec is **not delegable** until every declared
parameter/option/seam/callback carries its **unit / domain / referent / evaluator** semantics row. **This pass
produced no such rows** — that is the spec writer's pass.

**Gate-1 verdict-shape note.** Per the closed verdict vocabulary, the three rows carrying a **named collision**
(`PD-OVERLAY-1`, `PD-THEME-1`, `PD-FOCUS-3`) enter gate 1 with an **open-semantics list** attached. **`PD-FOCUS-3`
in particular reads as `BLOCKED-ON-SEMANTICS`** (the `tabId` drop and the `target` re-shape are unanswered
identifier-meaning questions, escalated to the architect **in that pass**, never deferred to the spec filing).

---

## 12. WHAT THIS PASS DID NOT DO (recorded so no later pass over-reads this file)

1. **No suite was run.** No `npm test`, no `npx vitest`, no `npm run build`, no `npm run typecheck`, no app start.
   Every count is a `ls`/`grep` reading or a **quoted recorded reading**.
2. **No file was created, moved, archived or deleted except this one.**
3. **No `docs/guide/*.md` page was read** — the foundation's user-facing guide is named here as the product
   owner's authority but its content is **UNVERIFIED** by this pass.
4. **The delegated-ENGINE half is out of scope** — the expanded Gnosis engine's offloaded graphing eliminations
   are **not** inventoried here (**UNVERIFIED**).
5. **The `tests/**` ARCHIVE/REWRITE/KEEP split is DERIVED, not measured** (§4's honest limit).

> **⟶ ANNOTATED 2026-09-28 (gate finding `X-3`).** **This item is the reason `X-3` was filed, and it is now SUPERSEDED IN PART by `docs/specs/post-division-test-disposition-2026-09-28.md`** — a **measured** per-file/per-row ledger over the Phase-1 set, where **every count carries `(measured: <method>)` or `(derived)`** and the two `(derived)` items are named explicitly. **The `§4` class table's counts are still `(derived)` in THIS file** (they are read through the annotation below that table); **the measured replacement is the ledger's §2.**
6. **The two recorded suite readings disagree (201 vs 221 files)** and were **not** reconciled.
7. **No layer in this file is app-green.** No elimination described here has been performed, and no gate has been
   run. A node-suite green on any row of this inventory would be **envelope-green at best**.
