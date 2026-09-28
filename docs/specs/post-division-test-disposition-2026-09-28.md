# POST-DIVISION TEST DISPOSITION — the per-file, per-row test ledger for the Phase-1 set (`X-3`)

**Date:** 2026-09-28 · **Pass kind:** **READ-ONLY AUDIT** (the pass wrote exactly two things: **this file**,
and **anchored annotations** in `docs/specs/post-division-local-elimination-inventory.md`) ·
**Branch read:** `post-division-rebuild` at **`d7ae18e`**, tree clean · **Discharges:** gate finding
**`X-3` [HIGH]** in `docs/specs/post-division-rebuild-proposal-review.md` §4.

**Layer (RCA-12, mandatory):** **REPO-TEST-SURFACE / DOC-LAYER.** Nothing here is app-green,
envelope-green, store-green, engine-green or live-green. **No suite was run by this pass**; every count is a
`ls`/`grep`/file-read reading on the named tree and is labelled `(measured: <method>)` or `(derived)`.

**Citation discipline.** Every claim cites a `path` + **symbol** / **row id** / **§section**.
**No line number is used as an address anywhere below** (where the pin's own assertion text is quoted, the
anchor is the constant name — `DEEP_ROWS`, the census expectation, `join(TESTS_DIR, …)` — never a line).

**Governing rules read and applied.**
- `docs/decisions.md` `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE) — clause (1) ARCHIVED, never deleted or adapted ·
  clause (2) the archive is the rebuild's INPUT, the behaviour re-derived from the SPEC with a **fresh red set** ·
  clause (3) the **coverage hole is RECORDED** as a **before → after READING** from `npm test` ·
  clause (4) no restore except through the owning unit's cycle · clause (5) the fences still hold ·
  clause **(6) a test may never be deleted by a pass of this class — moves only**.
- `docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` — clause (6) the phase shape
  (Phase 0 = the vendoring/pin unit; **Phase 1 = the renderer mechanism chain, one unit per row**).
- `docs/decisions.md` `DECIDED: SCH-REQUEST-WITHDRAWAL-AND-FILING-DECISIONS` — **no wave is fenced**; the
  request withdrawal is recorded, so **this disposition is the only sequencing prerequisite left**.

**Sibling artifacts (the house format this file pairs with).** `docs/specs/rebuild-drift-map-2026-09-21.md`
(the *landed-specs* drift map) · `docs/specs/test-pruning-disposition-2026-09-21.md` (§9 is the
**already-archived** set this ledger must not re-archive). **Neither is a contract.**

**Why this file exists.** Gate finding `X-3` reads: *"re-derive the per-file test disposition per amended row
before delegating, and mark every count `(measured | derived)` — the inventory's §4 classes contradict its own
§2.1 cells in at least two places and self-declare 'DERIVED … NOT measured'."* The inventory's §4 says so
itself: *"⚠ These counts are DERIVED by classification from the §2.1 disposition cells, NOT measured"* and
*"⚠ HONEST LIMIT … derived by classification, not by execution"*. **This pass replaces derivation with
measurement wherever measurement is possible, and labels what it could not measure.**

---

## 1. THE PHASE-1 ROW SET (as split by `§4.7`), ITS WAVE, AND ITS FORK-LOCAL ARTIFACTS

**The row set is taken from `docs/specs/post-division-rebuild-proposal.md` §4.1 read THROUGH §4.7**, and the
wave per row from the **re-issued §4.5 table** (each row's `Owning rows (post-amendment ids)` cell).

| Row | Wave (§4.5) | Fork-local artifact(s) — `path` + symbol |
| --- | --- | --- |
| **`PD-UI-1`** | **W1** | `src/renderer/theme.ts` → `resolveTheme`, `applyThemeToRoot`, `ResolvedTheme`, `ThemeRoot` |
| **`PD-UI-6`** | **W1** | `src/renderer/modal-state.ts` → `createModalController`, `installSettingsModal` |
| **`U-ZONES`** (`PD-UI-2` split, `A-4`) | **W2** | `src/renderer/layout-state.ts` → `zoneTrackCssVars`, the zone-set vocabulary |
| **`U-CENSUS`** (`PD-UI-2` split, `A-4`) | **W2** | `src/renderer/layout-state.ts` → `zoneTrackCssVars`'s census half; `src/renderer/sidebar-panes.ts` → `applyZoneTracks` |
| **`U-PROJ`** (`PD-UI-2` split, `A-4`) | **W2** | `src/renderer/layout-state.ts` → `layoutCssVars`, `applyLayoutToRoot`, `LayoutRoot`, `LayoutState`, `ZoneLayout`, `PaneLayoutEntry` |
| **`PD-UI-4a`** (`U-GSESSION` + the `installShellPointers` rewrite) | **W4** | `src/renderer/renderer.ts` → `installShellPointers` + the module-private machine (`beginGesture`, `onGestureMove`, `onGestureUp`, `onGestureCancel`, `revertPriorGesture`, `onLostPointerCapture`, `onGestureDblclick`, `onDocumentPointerDown`) |
| **`PD-UI-4b`** (`U-GUTTER`) | **W3** | `src/renderer/pane-gutter.ts` → `createGutterController`, `gutterAxis`, `gutterSizeForPoint`, `gutterBounds`, `clampGutterSize`, `setZoneSize`, `isGutterResizable`, `GUTTER_ZONES` |
| **`PD-UI-4c`** (`U-RELOCATE`) | **W3** | `src/renderer/pane-drag.ts` → `createDragController`, `movePane`, `insertionIndexForPoint`, `toZoneBounds`, `dropZoneForPoint`, `withinSnapThreshold`, `zoneOrientation`, `setZoneMinimized`, `legalZonesForScope` |
| **`PD-UI-5`** (`PD-GUTTERAFF-1`, the BUILD) | **W4** | `src/renderer/index.html` → the `.gutter[data-zone][data-axis]` geometry + the `cursor` rules; `src/renderer/renderer.ts` → the gutter arms (`isLayoutZoneNameValue`, the `startGutter`/`previewGutter`/`commitGutterSize` calls) |
| **`PD-UI-13`** (minted; the markup/declaration row) | **W6a** (cutover **W6b**) | `src/renderer/index.html` → the grid/track CSS + the region declaration markup (minted in the inventory's `§2.1`; the proposal §4.5 assigns its wave) |
| **`PD-UI-3`** (re-admitted BUILD, `A-1`) | **W6a** | `src/renderer/index.html` → the `U-CONTAINER` **write site** (no write site exists in `src/**` today) |
| **`PD-ZONES-2`** | **W6a** | `src/renderer/index.html` → the `#app > #wiki-root:has([data-zone=…].is-empty:not(.is-revealed))` collapse rules + the `grid-area` selector set |
| **`PD-ZONES-3`** (the host half of `PD-UI-2`) | **W5** | `src/renderer/sidebar-panes.ts` → `applyZoneTracks`, `syncZoneMirrors` (the `is-empty` mirror) |
| **`PD-FOCUS-2`** subset + the **`S-7`** closure-seam row (`A-3`) | **W5** | `src/renderer/tab-strip.ts` → `notifyTabClosed`, `drainClosedTabIds`, `TabStrip`, `TabStripContext`, `TabStripOptions` |
| **`PD-REGION-2`** (`PD-UI-10`) | **W7** (LAST by ruling) | `src/renderer/runtime.ts` → `tearDownGraph`'s `#wiki-root` sweep (**verified present at this head** by reading `tearDownGraph`'s body) |

**Phase-1 EXCLUSIONS, stated so a later pass does not read this table as the whole program:**
- **`PD-UI-9`** (`src/main/app-menu.ts`) — **W8**, main-process, and per clause (6) **not** in the Phase-1
  renderer chain. *(It was also the proposal's first-draft Phase-0 spike; the ruling replaced that with the
  vendoring/pin unit, so it is **Phase 1's W8 in the wave table and Phase 2's neighbour in the phase shape** —
  see §9 item 2, UNVERIFIED reading recorded.)*
- **`PD-UI-8` / `PD-FOCUS-3`** (`provident.focus`) — **W8**.
- **`PD-UI-7` / `PD-FOCUS-1`** — the proposal §4.1 row is `BLOCKED-ON-SEMANTICS`; the **architect's ruling
  landed** (`docs/decisions.md` `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS`), and **no wave in §4.5's
  table owns it**. **UNVERIFIED: its wave assignment is unstated in the re-issued §4.5 table** — what would
  settle it: the architect assigning `PD-UI-7`/`PD-FOCUS-1` to a wave. **This ledger therefore gives its files
  their measured membership (§2, row `PD-FOCUS-1`) but reports no wave for it.**
- **`PD-UI-11` / `PD-UI-12`** — `KEEP` / deferred by `A-10`; **not in the deletion set**.
- **the engine additive set** — Phase 2; `docs/specs/post-division-engine-offload-inventory.md`'s half.

---

## 2. THE PER-FILE DISPOSITION LEDGER (MEASURED)

**The measurement methods used in this pass, named exactly (all run on `d7ae18e`):**

| Id | Method | The command shape |
| --- | --- | --- |
| **M-static** | exact-specifier import search | `grep -rlE "(from \|await import\(\|import\()'[^']*src/[^']*/?<module>\.js'" tests` — catches the static `from`, the dynamic `await import(`, and the bare `import(` |
| **M-html** | `index.html` reader search | `grep -rlE "index\.html" tests` **plus** a per-file read confirming the mechanism is `fileURLToPath(new URL('../src/renderer/index.html', import.meta.url))` |
| **M-row** | row-count search of the file's own text | `grep -cE "^\s*(it\|it\.skip\|test)\("` — counts **literal** rows only; a loop-generated row family is counted once and its loop is reported separately |
| **M-dir** | directory listing | `ls` / `find` |
| **M-mention** | name-mention search (NOT an import) | `grep -rl "<stem>" tests` — used only to show a name-mention is not an importer |

**Two readings are marked `(derived)` in this file, and only two:** `T-B` (a test-file count the inventory
states as `~180`) and `T-C` (the vendored-conformance leg's contribution). **Everything else is measured.**

**A command-sensitivity finding, recorded because it changes a prior reading's reproducibility (`F-1`).** The
inventory's `PD-GUTTERAFF-1` cell records *"`grep -rn "gutter-affordance\|createGutterAffordance\|GUTTER_AFFORDANCE" src/ tests/ scripts/` returns **ZERO matches**"*.
**MEASURED at `d7ae18e`, that command returns 16 matches across 5 files** — `src/shared/gutter-affordance.ts`
(the **vendored** module), `scripts/foundation-drift.mjs`, and the three `tests/pd-vendor-*.test.ts` pins.
**Excluding the vendored file leaves 15, all Phase-0 vendoring work; the hits in `src/renderer/**`,
`src/main/**` and the consumer tests are ZERO.** **The row's CONCLUSION is therefore confirmed** (the fork still
has no gutter-affordance mechanism; `PD-UI-5` is a `NEW-BUILD-AND-ADAPT`), and the **`16` figure is itself
measured evidence that the vendored set is INERT** — nothing but the vendoring work names it. **The caveat a
later pass must carry: a date-sensitive `grep` reading in a doc is not re-runnable after a landing; state the
head.**

### 2.0 The surface counts (`T-A`)

| Figure | Reading | Method |
| --- | --- | --- |
| `tests/**` top-level entries | **208** | `ls tests` (**M-dir**) |
| **collected** test files (`tests/**/*.test.ts`) | **204** | `find tests -name '*.test.ts'` (**M-dir**) — matches `vitest.config.ts`'s `test.include` = `['tests/**/*.test.ts']` |
| `.test.mjs` files (NOT collected) | **3** | `ls tests/*.test.mjs` (**M-dir**) — `adapter-parity-battery`, `e2e-battery`, `mcp-stdio-e2e` |
| `tests/fixtures/` files | **5** | `ls tests/fixtures` (**M-dir**) |
| `src/**` files | **88** | `find src -type f` (**M-dir**) |
| `scripts/**` files | **5** | `ls scripts` (**M-dir**) — `electron-divergence.mjs`, `foundation-drift.mjs`, `live-drive.mjs`, `mcp-cli.mjs`, `start-app.sh` |
| `archive/tests/**` files | **41** | `ls -1 archive/tests \| wc -l` (**M-dir**) — **all 41 are `.test.ts`, all prefixed `2026-09-21-`** |

**The inventory's §4/§8 figures, re-measured:** it reads `tests/**` **205** top-level / **201** `.test.ts` /
**3** `.mjs` / **5** fixtures / **72** `src/**` / **4** `scripts/**`. **Every one of those is now off**, and
the reason is **measured, not inferred**: `git diff --name-status b6791e0 d7ae18e` (**read-only**) shows the
`W0`/`PD-VENDOR` passes **added 16 files to `src/shared/`** (the fifteen vendored mechanism modules +
`foundation-return-shapes.ts`) and **added 3 test files** (`tests/pd-vendor-set.test.ts`,
`tests/pd-vendor-manifest.test.ts`, `tests/pd-vendor-drift.test.ts`). **201 + 3 = 204** — the inventory's
`201` was correct **at its own head `b6791e0`** and is stale at `d7ae18e`; the **`221`** in
`docs/specs/test-pruning-disposition-2026-09-21.md` §1 is the pre-archive reading (221 − 41 = 180, then
regrowth), so **`204` collected / `41` archived is the reconciled pair at this head.** *(`204 + 41 = 245`;
the `221` is a different, earlier surface and is **not** reconciled by this pass — see §9 item 6.)*

### 2.1 The ledger

Each entry: **file** · **class** · **measured evidence** · **the row(s) it serves** · **reason**.
Counts in parentheses are `(measured: M-row)` literal `it(`/`test(` rows; a `+loop` flag means the file also
generates rows in a `for (const … of …)` loop, so the literal count is a **floor**, never a total.

| # | `tests/**` file | Class | Measured evidence | Serves | Reason (as-written, not rewritten) |
| --- | --- | --- | --- | --- | --- |
| 1 | `tests/unit-u-shell-2-theme.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → **1** file imports `src/renderer/theme.js` — this one. **M-row** → 10 rows | `PD-UI-1`; token rows `PD-THEME-2` | The `resolveTheme(setting, prefersDark)` precedence rows **archive**; the `:root`/`[data-theme]` **token-block rows KEEP** (`PD-THEME-2` is `NOT-IN-SCOPE (KEEP)` — its own `§2.1` cell). **An ARCHIVE of the whole file would retire a KEEP cell's subject.** |
| 2 | `tests/unit-u-shell-7-settings-modal.test.ts` | **SPLIT** | **M-static** → **1** file imports `src/renderer/modal-state.js` — this one. **M-html**: reader. **M-row** → 40 rows +loop | `PD-UI-6` | The `createModalController` state-machine rows archive; the **re-parent** rows survive (`PD-OVERLAY-1`: the foundation **REFUSES** that half). |
| 3 | `tests/unit-u-shell-1-layout-zones.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → **1 of 11** `src/renderer/layout-state.js` importers. **M-html**: reader. **M-row** → 39 rows | `U-ZONES`/`U-CENSUS`/`U-PROJ` (`PD-ZONES-1`) | It carries **both** the projection rows **and** the shell grid-geometry rows read from `index.html` (`PD-UI-13`/`PD-ZONES-2`). The inventory's own `§2.1` cell lists it among the **`index.html`-reading** suites whose disposition is *"REWRITE where they pin selectors/grid-areas and KEEP where they pin untouched app CSS"* — **a whole-file ARCHIVE contradicts that cell.** |
| 4 | `tests/renderer-empty-zone-track.test.ts` | **REWRITE** *(inventory §4 says `ARCHIVE`; its `§2.1` `PD-ZONES-2` cell says `REWRITE`)* | **M-static** → 1 of 11. **M-html**: reader, and its subject is the **collapse wiring itself** (it parses the `#app > #wiki-root` rule out of the html text). **M-row** → 25 rows | `U-CENSUS`/`U-PROJ`, `PD-ZONES-2` | Its subject (`EMPTY-ZONE-TRACK-NOT-COLLAPSED`) is **not superseded by a foundation mechanism** — it is the live defect carrier the `W6b` cutover must not regress. |
| 5 | `tests/unit-u-shell-1-w2n1-layout-boot-writethrough.test.ts` | **SPLIT** | **M-static** → 1 of 11. **M-row** → 2 +loop | `U-PROJ` | Write-through rows archive; the boot-order rows stay. |
| 6 | `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts` | **REWRITE** *(inventory §4 says `ARCHIVE`; its `§2.1` `PD-REGION-1` cell says `REWRITE`)* | **M-static** → 1 of 11. **M-html**: reader (it pins that `index.html` **consumes** the layout CSS vars). **M-row** → 4 rows | `U-ZONES`/`U-CENSUS`, `PD-ZONES-2` | The grid-consumption assertion is the **CSS↔JS agreement** the collapse depends on; its subject survives the change of *who writes* the value. |
| 7 | `tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts` | **REWRITE** | **M-static** → **0** imports of `layout-state.js`. **M-html**: reader. **M-row** → 2 rows | `PD-ZONES-2`, `PD-UI-13` | It pins a **removed dead CSS rule** (`grid-area: right` for `#operator-panes`) — a shell-topology pin, not a projection pin. **Its measured non-membership in the `layout-state` import set is a finding** (§3, `C-7`). |
| 8 | `tests/unit-u-shell-3-collapsible-panes.test.ts` | **SPLIT** | **M-static** → 1 of 11. **M-html**: reader. **M-row** → 26 rows +loop | `U-ZONES`/`U-CENSUS`, `PD-ZONES-3` | Collapse-mechanism rows archive; the `is-collapsed`/`syncZoneMirrors` app-policy rows stay. |
| 9 | `tests/unit-u-shell-4-drag-relocate.test.ts` | **SPLIT** | **M-static** → **1 of 3** `pane-drag.js` importers **and 1 of 11** `layout-state.js` importers. **M-html**: reader. **M-row** → 53 rows +loop | `PD-UI-4c`, `U-PROJ` | Session rows archive; the `movePane`/insertion-index/**zone-policy** rows stay (`PD-GESTURE-2` = `PARTIALLY-SHARED-KEEP`). |
| 10 | `tests/unit-u-shell-5-resizable-gutters.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → **1 of 3** `pane-gutter.js` importers, **1 of 11** `layout-state.js`. **M-html**: reader. **M-row** → 33 rows | `PD-UI-4b`, `PD-UI-5` | Controller-session rows archive; the **160/1200-px clamp + `setZoneSize`** rows stay (`PD-GESTURE-3` = `PARTIALLY-SHARED-KEEP`). |
| 11 | `tests/unit-u-shell-6-hover-affordance.test.ts` | **KEEP** | **M-html**: reader. **M-row** → 11 rows | `PD-UI-5` (CSS half) | `§2.1` marks it `KEEP` outright — it pins app `is-clickable` CSS no mechanism supersedes. *(The inventory's §4 `SPLIT` row says so itself; the file is listed there only because it reads `index.html`. **Not a contradiction — an oddity worth naming:** a `KEEP` file inside a SPLIT row.)* |
| 12 | `tests/unit-u-shell-9a-main-focus-tabs.test.ts` | **SPLIT** | **M-static** → imports `src/renderer/tab-strip.js`; **its `tab-state.js` access is a DYNAMIC `await import` inside a helper**, which is why the inventory's static-only `§2.1` `PD-FOCUS-1` cell **omits it from the 17**. **M-html**: reader. **M-row** → 71 rows | `PD-FOCUS-2`/`S-7`; **`PD-UI-8`** (W8) | Closure-seam rows archive; the tab-vocabulary and render rows stay. **It is also the `PD-UI-8` `tabId`-drop pin** — a `PROTECTED-BY-SUBJECT` case (see §4, item P-5). |
| 13 | `tests/unit-u-menu-1-application-menus.test.ts` | **SPLIT** | **M-static** → **1 of 2** `src/main/app-menu.js` importers. **M-row** → 26 rows | `PD-UI-9` (W8) | Normalizer/builder rows archive; `orderPaneCatalog` + import-selection rows stay (`PD-MENU-2`/`PD-MENU-3` = `KEEP`). |
| 14 | `tests/unit-u-import-1-import-surface.test.ts` | **SPLIT** | **M-static** → 1 of 2 `app-menu.js`, **1 of 1** `src/main/import-directory.js`. **M-row** → 47 rows +loop | `PD-UI-9`, `PD-MENU-2`/`PD-MENU-3` | Dialog/import-policy rows stay; builder rows archive. |
| 15 | `tests/props-layout-state.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → 1 of 11. **M-row** → 6 rows (PBT register) | `U-PROJ` | A **PBT register** file: its properties are re-derived, not retired — `REBUILD-ARCHIVE-POLICY` clause (2)'s *fresh red set* route. **An ARCHIVE of a register file is a `PBT`-gate regression** (the register is a Phase-1 unit's own obligation). |
| 16 | `tests/props-pane-graph.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → 1 of 11 `layout-state.js` **and 1 of 35** `pane-graph.js` importers. **M-row** → 6 rows (PBT register) | `U-PROJ`; `PD-HOST-KEEP` (`pane-graph.ts`) | Same as #15, **plus** it imports the **`pane-graph.ts` host module the `PD-HOST-KEEP` table keeps** — a whole-file ARCHIVE would retire kept-subject rows. |
| 17 | `tests/props-tab-state.test.ts` | **SPLIT** *(inventory §4 says `ARCHIVE`)* | **M-static** → 1 of 17 `tab-state.js` importers. **M-row** → 6 rows (PBT register) | **`PD-FOCUS-1`** | Same as #15. |
| 18 | `tests/renderer-pane-drag-surface.test.ts` | **REWRITE** | **M-static** → 1 of 3 `pane-drag.js` importers. **M-row** → 19 rows | `PD-UI-4c`, `PD-UI-4a` | Pins defect **`F-1 PANE-BODY-GESTURE-SWALLOWED`** — a **real defect pin**, never an ARCHIVE candidate. |
| 19 | `tests/unit-u-shell-shell-wiring.test.ts` | **REWRITE** *(inventory §4 says `ARCHIVE`)* | **M-static** → 1 of 11 `layout-state.js`, **1 of 3** `pane-drag.js`, **1 of 3** `pane-gutter.js`, imports `src/renderer/renderer.js` + `src/renderer/sidebar-panes.js`. **M-row** → 33 rows | `PD-UI-4a/4b/4c`, `U-PROJ`, `PD-ZONES-3` | It is the **wiring-seam pin for four rows at once** — the inventory's own `§2.1` `PD-GESTURE-1` cell lists it among the **`REWRITE`** set. It is also **`G-9`-adjacent** (a source-text pin set names `unit-u-shell-shell-wiring`). |
| 20 | `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts` | **REWRITE** *(inventory §4 says `ARCHIVE`)* | **M-static** → **1 of 3** `pane-drag.js`, **1 of 3** `pane-gutter.js`. **M-row** → 5 rows | `PD-UI-4b`, `PD-UI-4c` | A PBT-generator file whose subjects are the **controller sessions** the rows replace — `REWRITE` with a fresh red set, not ARCHIVE. |
| 21 | `tests/unit-u-shell-shell-wiring-adversarial.test.ts` | **REWRITE** | **M-static** → imports `src/renderer/renderer.js`. **M-row** → 16 rows | `PD-UI-4a` | Adversarial regression over the wiring — `§2.1` `PD-GESTURE-1`'s `REWRITE` set names it. |
| 22 | `tests/page-commit-failure-visibility.test.ts` | **KEEP** *(inventory §4 says `REWRITE`)* | **M-static** → 1 of 17 `tab-state.js`; a **file read of the import statement** shows `import type { TabEntry }` — **TYPE-ONLY, erased at build**. **M-row** → 12 rows | `PD-FOCUS-1` type surface | It imports a **type** only; `§2.1` `PD-FOCUS-1` marks the **type-importer rows `KEEP`** (*"they import `TabEntry`/`TabTarget`, which survive"*). **A type-only import cannot be superseded by a reducer swap.** |
| 23 | `tests/page-commit-scope-ack-race.test.ts` | **KEEP** | **M-static** → 1 of 17 `tab-state.js` (**`import type`**) **and 1 of 4** `tab-strip.js` (**a real `TabStrip` value import**). **M-row** → 7 rows | `PD-FOCUS-2`/`S-7` | The page-commit **scope key** is its subject; `TabStrip`'s **render** is `PD-FOCUS-2`'s `KEEP`. |
| 24 | `tests/page-commit-tab-ownership.test.ts` | **KEEP** | **M-static** → 1 of 17 `tab-state.js` (**`import type`**), **1 of 4** `tab-strip.js` (**`TabStrip` value**). **M-row** → 7 rows | `PD-FOCUS-2`/`S-7` | Same. |
| 25 | `tests/unit-stage-active-tab-display.test.ts` | **KEEP** | **M-static** → 1 of 17 `tab-state.js`, **`import type { TabEntry, TabTarget }`** (file read). **M-row** → 29 rows | `PD-FOCUS-1` type surface | The stage-active-tab family is **another unit's carried red** (`H-1`/`H-1b`/`H-2` in the `…-contract-holes` file) and is **not a Phase-1 subject**. |
| 26 | `tests/stage-active-tab-display-adversarial.test.ts` | **KEEP** | **M-static** → 1 of 17, **`import type`** (file read). **M-row** → 14 rows | `PD-FOCUS-1` type surface | Same. *(**Note the path:** the inventory never names this file, and its sibling is prefixed `unit-` while this one is not — see §9 item 5.)* |
| 27 | `tests/unit-stage-active-tab-display-blind-contradictions.test.ts` | **KEEP** | **M-static** → 1 of 17, **`import type`** (file read). **M-row** → 13 rows | `PD-FOCUS-1` type surface | Same. |
| 28 | `tests/unit-stage-active-tab-display-contract-holes.test.ts` | **KEEP** | **M-static** → 1 of 17 `tab-state.js` (**`import type`**) **and 1 of 4** `tab-strip.js` — a **real VALUE import of `notifyTabClosed`** (file read). **M-row** → 8 rows | `PD-FOCUS-2`/`S-7` | **The one page-commit-family file that imports the `S-7` closure seam as a VALUE.** It also carries the **pre-existing reds** `H-1`/`H-1b`/`H-2` (RECORDED). Not a Phase-1 subject; must not be attributed to a Phase-1 change. |
| 29 | `tests/unit-stage-active-tab-display-pbt-generators.test.ts` | **KEEP** | **M-static** → 1 of 17, **`import type`** (file read). **M-row** → 7 rows | `PD-FOCUS-1` type surface | Same. |
| 30 | `tests/unit-live4-empty-store-landing.test.ts` | **KEEP** — **VALUE imports, not type-only** | **M-static** → 1 of 17, and a **file read of the import statement** shows it imports **values** (`resolveDefaultTarget`, `ensureFirstTab`, `defaultTabState`, `TAB_LANDING`) + `type TabEntry`. **M-row** → 9 rows | `PD-FOCUS-1` | **The strongest `KEEP` in the tab family:** `defaultTabState`/`TAB_LANDING`/`resolveDefaultTarget`/`ensureFirstTab` are the **tab VOCABULARY** `§2.1` `PD-FOCUS-1` itself marks `KEEP` (*"Astrographer app policy"*, pin `W2-Q11`). **This is why the `REWRITE` classification in §4 is wrong for the tab families and `KEEP` is right.** |
| 31 | `tests/unit-u-edit-1-property-register.test.ts` | **KEEP** | **M-static** → 1 of 17. **M-row** → 9 rows | `PD-FOCUS-1` type surface | Same. |
| 32–37 | `tests/unit-u-shell-9b-blind-greens.test.ts` · `…-cross-document-shared` · `…-h1-optionc-interception` · `…-h2-c20-materialization` · `…-h3-doc-namespace` · `…-w2n15-rederive-scope` | **KEEP** | **M-static** → **5 of the 6 import `tab-state.js` and every one of the five is `import type { TabEntry, TabTarget }`** (file read); **`…-h1-optionc-interception` imports it NOT AT ALL** — its `tab-state` mention is prose. **M-row** → 13/37/6/14/13/4 rows | `PD-FOCUS-1` type surface | `§2.1` `PD-FOCUS-1`'s own `KEEP` clause (*"they import `TabEntry`/`TabTarget`, which survive"*). The inventory's §4 REWRITE row names *"6 files"*: **right about the count, wrong about the class, and `h1` is not even an importer.** |

**The measured membership union (`T-D`).** The Phase-1 rows in §1 implicate **`tests/**` files drawn from the
sets above**, plus the two **`PROTECTED`** members (`tests/unit-live11-bridge-seams.test.ts`,
`tests/unit-wave-1-bridge-wiring.test.ts`) and the two **fence** files that the **`PD-REGION-2`** row's subject
sits under. **Per-row membership is what §1's artifact column plus this table's `Serves` column compose, and it
is measured, not derived: every membership above is a `grep -rl` hit or a file read.**

**The `renderer.js` / `runtime.js` broad surface (`T-D2`).** `grep -rlE "(from |await import\(|import\()'[^']*src/renderer/(renderer|runtime)\.js'" tests`
= **69** files (**measured: M-static**). This is the **broad host surface**, and it is **not** the elimination
set: **an elimination may not treat a `renderer.js` importer as implicated unless its row names that importer.**
The inventory reads the same `69` and says the same thing; **this ledger re-states it because it is the number
most likely to be mistaken for the archive set.**

---

## 3. THE INVENTORY CONTRADICTIONS THIS PASS ANNOTATED (and the ones it found new)

**Anchored annotations were added beside the affected text in
`docs/specs/post-division-local-elimination-inventory.md`** — dated, citing `X-3` and this ledger, **with the
as-written text left visible**. **No cell was rewritten, and no row id was moved.**

| Id | Where (row / §section) | The contradiction | The measured resolution |
| --- | --- | --- | --- |
| **`C-1`** | inventory **§4**, the `ARCHIVE` row | It lists **`tests/unit-u-shell-1-layout-zones.test.ts`** as `ARCHIVE`, while **§2.1 `PD-ZONES-1`** lists it among the **`index.html`-reading** suites the `PD-REGION-1`/`PD-UI-13` cells class **`REWRITE`**, and **§2.1 `PD-ZONES-2`** lists it again as `REWRITE`. **Three cells, two classes.** | `SPLIT` (row #3): projection rows archive, grid-geometry rows stay. |
| **`C-2`** | inventory **§4**, the `ARCHIVE` row | It lists **`tests/unit-u-shell-2-theme.test.ts` " (the resolver rows)"`** as a **whole-suite** `ARCHIVE`, while **§2.1 `PD-THEME-2`** says the `index.html`-reading theme rows inside that same file are **`KEEP`**, and **§2.1 `PD-THEME-1`** says the file is **`REWRITE`** (`"the signature/return shape changes"`). | `SPLIT` (row #1): resolver rows archive, token-block rows KEEP. |
| **`C-3`** | inventory **§4**, the `ARCHIVE` row | It lists **`tests/unit-u-shell-5-resizable-gutters.test.ts`** as `ARCHIVE`, while **§2.1 `PD-GESTURE-3`** says *"all 3 suites **REWRITE** for the session rows; **KEEP** for the clamp/`setZoneSize` rows"* and **§2.1 `PD-REGION-1`** lists it as **`REWRITE`**. | `SPLIT` (row #10). |
| **`C-4`** | inventory **§4**, the `ARCHIVE` row | It lists **`tests/unit-u-shell-shell-wiring.test.ts`** + **`…-pbt-generators.test.ts`** as `ARCHIVE`, while **§2.1 `PD-GESTURE-1`** lists **both** among the **4 suites** it marks `REWRITE`. | `REWRITE` ×2 (rows #19/#20), each with a fresh red set. |
| **`C-5`** | inventory **§4**, the `ARCHIVE` row | It lists **`tests/renderer-empty-zone-track.test.ts`**, **`…w2n3-zone-size-grid`**, **`…w2n4-operator-grid-area`** as `ARCHIVE`, while **§2.1 `PD-ZONES-2`** marks the three **`REWRITE`**. | `REWRITE` ×3 (rows #4/#6/#7). |
| **`C-6`** | inventory **§4**, the `ARCHIVE` row | It lists the three PBT-register files (`props-layout-state`, `props-pane-graph`, `props-tab-state`) as `ARCHIVE`, while **§2.1 `PD-ZONES-1`/`PD-FOCUS-1`** do not classify them `ARCHIVE` and the **PBT gate** makes a register a Phase-1 unit's own re-derivation obligation. | `SPLIT` ×3 (rows #15/#16/#17). |
| **`C-7`** | inventory **§4**, the `REWRITE` row **vs** the `ARCHIVE` row | **Two files are in BOTH classes.** `tests/unit-u-shell-9a-main-focus-tabs.test.ts` appears in the `ARCHIVE`-adjacent `SPLIT` row **and** in the `REWRITE` row *"the tab families"*; **and the `REWRITE` row is headed `1 + the tab families` and then names *both* `tests/renderer-pane-drag-surface.test.ts` *and* `tests/unit-u-shell-shell-wiring-adversarial.test.ts`** — i.e. **`1` is wrong and the same file is classed once more than the count admits.** | `SPLIT` for the 9a file; `REWRITE` for the pane-drag-surface file and the adversarial file. |
| **`C-8`** | inventory **§4**, the counts | **The stated counts do not reproduce from the row's own content, three ways.** (a) The `ARCHIVE` row's *count* is `11` and **11 names are listed — but two of them are the same file as another class's** (see `C-7`), so the **union is not 11**. (b) The `REWRITE` row's *count* is `"1 + the tab families"` while its own text names **more than one** file in the `1` position. (c) `KEEP` reads **`~180 of 204`** — and **`~180` is `(derived)`**, not measured: `204` is not even the collected count at any head (the collected count was **201** at `b6791e0`, **204** at `d7ae18e`), and no row's arithmetic yields `180`. | The measured ledger §2 replaces all three. |
| **`C-9`** | inventory **§4**, the `SPLIT` row | *"the same file's **app-policy rows**"* naming **`tests/unit-u-shell-6-hover-affordance.test.ts`** as **"(**KEEP** outright … listed here only because it reads `index.html`)"** — a **`KEEP` file inside an `ARCHIVE`-the-mechanism-rows row.** Not a false statement, but a class-table row that **cannot be summed**: reading it as `ARCHIVE-these-8` retires a `KEEP` subject. | `KEEP` (row #11), stated explicitly so the row is not summed. |
| **`C-10`** | inventory **§4**, the `SPLIT` row | It names **`tests/unit-u-menu-1-application-menus.test.ts`** as *"(the **ordering** rows survive — `PD-MENU-1`)"* and **`tests/unit-u-import-1-import-surface.test.ts`** as *"(the **dialog/import-policy** rows survive)"* — **both correct**, and **both `PD-UI-9` (W8)**, i.e. **outside the Phase-1 renderer chain** while the row sits in a §4 headed `TEST DISPOSITION` with no wave column. | Recorded with the wave (§1) so a Phase-1 pass does not read them as in-chain. |
| **`C-11`** | inventory **§4**, the *self-declared* marker | *"⚠ These counts are **DERIVED** by classification from the §2.1 disposition cells, **NOT measured**"* and §12 item 5 *"the `tests/**` ARCHIVE/REWRITE/KEEP split is **DERIVED, not measured**"*. | **This ledger is the measured replacement**; every count in it carries `(measured: <method>)` or `(derived)`. |
| **`C-12`** | inventory **§8.1** vs **§3** vs **this head** | The `tests/**` size readings (`205` top-level / `201` `.test.ts` / `72` `src/**` / `4` `scripts/**`) are **stale at `d7ae18e`** — **measured: `208` / `204` / `88` / `5`**, the delta being the 16 `src/shared/` additions + 3 `pd-vendor-*` test files (`git diff --name-status b6791e0 d7ae18e`). **The inventory's numbers are correct at its own head**, and must not be read at this one. | §2.0, `T-A`. |
| **`C-13`** | inventory **§3**, the `PROTECTED among the implicated set` row | It says *"**PROTECTED among the implicated set — 2**, including … `tests/unit-wave-1-bridge-wiring.test.ts` (**a host-seam importer**)"*, while **§5** lists that file's pin as *"the **electron-mock census** (exact set) **AND** it imports `src/renderer/sidebar-panes.js` + `src/main/mcp-server.js`"*. **Both readings are true and the §3 cell's `2` silently drops the third implicated `PROTECTED`** — `tests/unit-live11-bridge-seams.test.ts` is counted, `unit-wave-1` is counted, and **`tests/unit-v5-migration-contract.test.ts` itself is implicated BY the `G-9`/`X-9` duty** (it pins `package.json`'s test scripts and `vitest.config.ts`'s `testTimeout`, both `G-5`/`A-10`-adjacent) — **so the implicated `PROTECTED` count is 3, not 2, once `G-9` is applied.** | §4 (`P-1`..`P-6`). |

**A candidate NEW contradiction, RAISED THEN WITHDRAWN BY A SECOND, MORE PRECISE MEASUREMENT (`C-14` — recorded so
no later pass re-raises it):**

- **`C-14` [WITHDRAWN — NOT a contradiction].** A first reading of
  `docs/specs/test-pruning-disposition-2026-09-21.md` §4.2 found **25** `tests/`-prefixed rows against the
  section's own heading `26 files`. **A second, more precise count of the table's own numbered `| # |` column
  returns rows `1`..`26`** — the 26th is **`tests/e2e-battery.test.mjs`**, a **`.test.mjs`** file the first
  reading's `*.test.ts` pattern could not match. **The section is CORRECT; the first reading was wrong, and it
  is recorded rather than silently dropped because that is the discipline this ledger exists to apply.** *(The
  lesson is the ledger's own `F-1`: a pattern narrower than the subject silently produces a false finding.)*
  **The `41` archived files remain unaffected** (measured in §6), and **all 26 `ORPHANED-PIN` files are measured
  as NOT archived**.

---

## 4. THE PROTECTED SET — RE-VERIFIED BY READING THE PIN

**The pin's home:** `tests/unit-v5-migration-contract.test.ts` (660 lines, **read**). It pins by **path/name**
through four distinct mechanisms, **each read in this pass**:

| Id | What the pin actually asserts (read) | The exact set verified |
| --- | --- | --- |
| **`P-1`** | **`DEEP_ROWS`** — a `const` array whose two entries are built with `join(TESTS_DIR, '<file>.test.ts')`, each carrying a `row` label and the `fn` under test; the suite then reads **the row's own text** and requires a `.repeat(10000)` depth, `.not.toThrow()`, `result!.ok).toBe(true)`, **no** `catch (`, **no** `it.skip`/`it.todo`, **no** per-row `{ timeout: }` | **`tests/unit-u2-rich-decompose.test.ts`** (row `ADR-4`, fn `decomposeRichHtml`) · **`tests/unit-s-paste-sanitization.test.ts`** (row `Tokenizer F1`, fn `sanitizePastedHtml`) |
| **`P-2`** | **The electron bridge-mock census** — `deriveElectronMockFiles()` walks `tests/**` for a real `vi.mock('electron', …)` call and the row asserts the **derived basenames equal an exact 5-name array** (`files.map((f) => f.split('/').pop()).sort()`), with a separate row proving the census is **non-empty** and a third proving a new mocking file **reds it** | **`template-adversarial.test.ts`** · **`unit-live11-bridge-seams.test.ts`** · **`unit-u5-rich-commit-ipc.test.ts`** · **`unit-v5-bridge-capture.test.ts`** · **`unit-wave-1-bridge-wiring.test.ts`** |
| **`P-3`** | **A `join(TESTS_DIR, …)` content pin** — the NOTE-pin reads the file and requires the literal `'P-TP-4'` **and** `/strat:per-op-cadence/` to still be present | **`tests/unit-import-batch-persist-contract.test.ts`** |
| **`P-4`** | **A fixture imported by path** — `./fixtures/v5-bridge-capture-fixture.js` (a `.js` specifier resolving to the `.ts` file) supplies `checkBridgeSource`, `oldPatternFileText`, `oldPatternInlineFileText`, `sanctionedFileText`; the suite asserts on all four | **`tests/fixtures/v5-bridge-capture-fixture.ts`** |
| **`P-5`** | **A `join(ROOT, …)` corpus read** — Pin 4 reads `docs/specs/ui-overhaul.md` as its **Class-C timing corpus** and asserts a node/edge census on it | **`docs/specs/ui-overhaul.md`** (a **doc** pin) |
| **`P-6`** | **Non-test artifacts pinned by the same suite** — `vitest.config.ts`'s `test.testTimeout` as a **NUMBER**, `>= 15_000` **and** `<= 15_000` (the ceiling oracle: *"20 000 / 60 000 is rejected"*); `package.json`'s `scripts.test` and `scripts['test:watch']` carrying **no `--testTimeout`**; and the **production importer** `src/main/markdown-import.ts` by **source contract** (exactly **one** `.applyBatch(`, **no** per-op `putNode`/`putEdge`, the `op: 'putNode'` literal **before** `op: 'putEdge'`) | **`vitest.config.ts`** · **`package.json`** · **`src/main/markdown-import.ts`** (**a protected `src/**` file**) |

**The verified `PROTECTED` set, named exactly (10 artifacts, 9 of them `tests/**` + 1 `src/**`):**
1. `tests/unit-u2-rich-decompose.test.ts` 2. `tests/unit-s-paste-sanitization.test.ts`
3. `tests/template-adversarial.test.ts` 4. `tests/unit-live11-bridge-seams.test.ts`
5. `tests/unit-u5-rich-commit-ipc.test.ts` 6. `tests/unit-v5-bridge-capture.test.ts`
7. `tests/unit-wave-1-bridge-wiring.test.ts` 8. `tests/unit-import-batch-persist-contract.test.ts`
9. `tests/fixtures/v5-bridge-capture-fixture.ts` 10. `src/main/markdown-import.ts`
**Plus the three non-test `R-`artifacts**: `vitest.config.ts` (the `testTimeout` bound) · `package.json` (the two
test scripts) · `docs/specs/ui-overhaul.md` (the Class-C corpus).

**The pin file itself is a de-facto member.** `tests/unit-v5-migration-contract.test.ts` is **not** named by
its own assertions, but it is the pin's home: **moving or renaming it retires every assertion above.**
**`PROTECTED-BY-CONSTRUCTION`**, and it is the **`G-9` duty's own subject**.

**The two fence files, exempt BY NAME** (`DECIDED: REBUILD-ARCHIVE-POLICY` clause (5), and proposal §4.7 `A-7`
/ §6):
- **`tests/traversal.test.ts`** — **21** literal rows (**measured: M-row**); it imports `src/main/rag-store.js`,
  `src/main/traversal.js`, **`src/renderer/runtime.js`**, `src/shared/dom-shim.js`.
- **`tests/import-render-no-duplicates.test.ts`** — **4** literal rows, one of which is a **loop over
  files** (**measured: M-row**); it imports the same set plus `src/main/markdown-parse.js`.

**A FENCE EDIT RE-ENTERS THE GATE.** Neither fence file is archivable, movable, renamable or relaxable by any
Phase-1 unit; a fence edit requires a **re-planned fence** and a **new gate pass**. **`PD-REGION-2` (W7) is the
one Phase-1 row whose subject the fenced `runtime.js` import touches** — the fence itself is **not** thereby
implicated, because the fence asserts **rendered-document behaviour through `Runtime`**, not the `#wiki-root`
sweep. **UNVERIFIED whether a `tearDownGraph` rewrite reds a fence row** — what would settle it: the W7 unit's
own **reported red set** (this pass ran no suite).

---

## 5. THE COLLISION TABLE (row ↔ `PROTECTED` file or fence file, by name)

| # | Row (wave) | The `PROTECTED` / fence artifact it collides with | Consequence, stated concretely |
| --- | --- | --- | --- |
| **`K-1`** | **`U-PROJ` / `U-ZONES` / `U-CENSUS`** (W2) | **`tests/unit-live11-bridge-seams.test.ts`** — pinned **twice**: by the **electron-mock census** (exact 5-name set) **and** by its own import of **`defaultLayout`, `coerceLayout`, `type LayoutState`, `type PaneLayoutEntry`** from `../src/renderer/layout-state.js` | **The exact collision the Phase-0 unit hit with `defaultLayout`/`coerceLayout`.** The W2 adoption **may not rename, remove, re-shape or re-point** those four exports. **It must land AROUND them** (an adapter that keeps the exported names and shapes), **or** file an explicit pin re-statement with the pin's owning unit — **never** relax the pin. |
| **`K-2`** | **`PD-UI-4a`/`4b`/`4c`** (W3/W4), **`PD-ZONES-3`** (W5) | **`tests/unit-wave-1-bridge-wiring.test.ts`** — census-pinned **and** importing **`SidebarPanes`** from `../src/renderer/sidebar-panes.js` + **`handleRagQueryIpc`** from `../src/main/mcp-server.js` | The host-seam rewrites must keep those two exports and the file's **name**. A **new electron-mocking test file** reds the census (`P-2`); the wave's own units **must not add one**. |
| **`K-3`** | **`PD-REGION-2`** (W7) | **`tests/traversal.test.ts`** + **`tests/import-render-no-duplicates.test.ts`** — both import **`src/renderer/runtime.js`** | The sweep lives in the **same module** the fences render through. **No fence edit**; the W7 unit owes its own red set and must show the fences **stay green unedited**, or the fence re-enters the gate. |
| **`K-4`** | **`PD-UI-8` / `PD-FOCUS-3`** (W8) | **`tests/unit-u-shell-9a-main-focus-tabs.test.ts`** — **not** census-pinned, but it is the **`tabId`-drop pin** and it reaches `tab-state.js` by a **DYNAMIC `await import`** | **`PROTECTED-BY-SUBJECT`**: the architect's ruling (`DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT`) makes **dropping `tabId`** the contract, so this file **must** be rewritten **in the same commit** as the tool change, with a **red set naming the refusal for both dropped shapes**. |
| **`K-5`** | **every Phase-1 row that touches a vendored module's BYTES** (any wave whose adoption edits `src/shared/<module>.ts`) | **`tests/pd-vendor-manifest.test.ts`** + **`tests/pd-vendor-drift.test.ts`** — the `PD-VENDOR` unit's **per-module digest / manifest pins** | **NEW COLLISION, not in the inventory.** The vendored set is **inert today** (measured: **0** test files import any `src/shared/<vendored>.js` by specifier). **A Phase-1 adoption that EDITS a vendored byte instead of wrapping it reds these pins.** `REBUILD-ARCHIVE-POLICY`-adjacent rule: the vendored bytes stay **the pin's fifteen**, wrapped by a consumer adapter. |
| **`K-6`** | **any wave whose unit adds a collected suite or edits a test script** | **`package.json`** (the two test scripts) + **`vitest.config.ts`** (the `testTimeout` bound) | `G-9`/`X-9`: the pin asserts **no `--testTimeout`** in either script and a `testTimeout` **bounded on both sides at `15_000`**. A wave that needs headroom **cannot buy it here**. |
| **`K-7`** | **`PD-UI-1`** (W1) — the `theme.ts` **STEM** collision | **`src/renderer/theme.ts`** ↔ **`src/shared/theme.ts`** | The vendoring dossier records this as a **checked, no-hit** stem collision (`C-7`). **No pin collision**; recorded so a later pass does not "fix" it. |

**Collision outcome, stated plainly:** **four rows carry a live `PROTECTED` collision** (`K-1`..`K-4`), **one
collision is NEW** (`K-5`, vendored-byte digests), and **`K-1` is the binding one** — it is the same class of
collision that cost the Phase-0 unit a cycle, and it is **unavoidable** for W2 because `layout-state.ts` is
both the adoption target and the protected file's import source.

---

## 6. THE ARCHIVE-CANDIDATE SET vs THE ALREADY-ARCHIVED SET

**The already-archived set (measured).** `archive/tests/` contains **41** files (**`ls -1 | wc -l`**) — **all
`.test.ts`, all named `2026-09-21-<original-basename>.test.ts`**. Their **per-unit ownership is recorded** in
`docs/specs/test-pruning-disposition-2026-09-21.md` §9.4 (`C9 U-EDIT-1` **17** · `C11 U-SEARCH` **1** ·
`P2 U-AUTHORITY-SWITCH` **17** · `P2 U-READS-PIVOT` **6** = **41**), and this pass **re-verified the map
against the directory both ways**: the 41 basenames in §9.4 and the 41 files on disk are **the same set**
(0 in-map-not-on-disk, 0 on-disk-not-in-map).

**The re-archive check (this ledger's own duty).** Every file this program would archive was checked
**by name** against `archive/tests/`:

| Candidate class | Files checked | Already in `archive/tests/` |
| --- | ---: | ---: |
| the inventory §4 `ARCHIVE` row | **11** | **0** |
| the inventory §4 `SPLIT` row | **8** | **0** |
| **total** | **19** | **0** |

**No candidate is proposed for re-archiving.** The `2026-09-21` pass's 41 files are **its own** set, owned by
`C9 U-EDIT-1` / `C11 U-SEARCH` / `P2 U-AUTHORITY-SWITCH` / `P2 U-READS-PIVOT` — **none of which is a Phase-1
renderer row**, and **`tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` is the only `unit-u-shell-*`
file in it.** **A Phase-1 unit must not re-propose any of the 41**, and `REBUILD-ARCHIVE-POLICY` clause (4)
forbids restoring one except through its owning unit's cycle.

**What this program would actually archive, per the measured ledger:** **far less than 19 whole files.** §2
classifies **11 of the 19** as `SPLIT` (row-level archive) or `REWRITE`/`KEEP`, so the **whole-file** archive
set is **measurably smaller** — and **its exact size is the owning unit's gate-2 decision**, because
`REBUILD-ARCHIVE-POLICY` clause (3) requires the **before → after READING** to be taken **at the landing**,
not here. **This ledger deliberately does not assert a whole-file archive count: any such number would be
`(derived)` and this pass cannot measure it without moving a file, which it is forbidden to do.**

---

## 7. THE RECORDED COVERAGE DELTA PER WAVE — **`(projected, not measured)`**

**Every figure in this section is `(projected, not measured)`.** This pass ran **no suite**, moved **no
file** and edited **no test** — so a delta here is a **plan**, and `REBUILD-ARCHIVE-POLICY` clause (3)
requires the **real** reading (`npm test` before → after: file count / row count / skip count) **at the
wave's own landing**. **`T-E` below is a file-count plan; the row-count plan is a floor**, because a moved
file takes its own rows and its own `describe.skip` blocks with it (the 2026-09-21 pass lost **14** skips
that way — a **recorded reading**, not a prediction).

| Wave | Owning rows | Files it WOULD archive `(projected, not measured)` | Tests it would REMOVE `(projected, not measured)` | What MUST be measured at the wave's landing (clause 3) |
| --- | --- | ---: | --- | --- |
| **W1** | `PD-UI-1`, `PD-UI-6` | **0 whole files** — both candidates are `SPLIT` | the **resolver rows** in `unit-u-shell-2-theme` (10 rows total, floor) and the **state-machine rows** in `unit-u-shell-7-settings-modal` (40 rows total, floor) | `npm test` before → after: **files / rows / skips**, + the unit's **reported red set** for the re-derived rows |
| **W2** | `U-ZONES`, `U-CENSUS`, `U-PROJ` | **0 whole files** (all `SPLIT`/`REWRITE`) | the projection/write-through rows across the **11 files** importing `layout-state.js` (**measured: M-static**) | as above, **plus** the `K-1` pin must still pass **unedited** |
| **W3** | `PD-UI-4b`, `PD-UI-4c` | **0 whole files** | the controller-session rows in the **3** `pane-gutter.js` importers and the **3** `pane-drag.js` importers (**measured: M-static**, the two sets overlap in `unit-u-shell-shell-wiring` + `…-pbt-generators`) | as above; **`K-2`'s census must stay at exactly 5 names** |
| **W4** | `PD-UI-4a`, `PD-UI-5` | **0 whole files** | the gesture-machine rows in the `renderer.js` importers that the row names (`unit-u-shell-shell-wiring`, `…-adversarial`, `…-pbt-generators`, `renderer-pane-drag-surface`) | as above; the **affordance BUILD** owes a **new** red set (nothing to archive) |
| **W5** | `PD-ZONES-3`, `PD-FOCUS-2` subset + `S-7` | **0 whole files** | the `applyZoneTracks` mirror rows reached through `SidebarPanes`; the closure-seam rows in the **4** `tab-strip.js` importers (**measured: M-static**) | as above; the **page-commit family's `KEEP`** files must stay green **unedited** |
| **W6a** | `PD-UI-13`, `PD-UI-3`, `PD-ZONES-2` | **0 whole files** | **none** — `W6a` lands **structure while the old collapse mechanism still functions** (`A-6`) | the **`index.html` readers' 10 files** must stay green; **`npm run divergence` is the mandatory pre-live leg** and is **RED at this head** (environmental) |
| **W6b** | the cutover half of `PD-UI-13` | **0 whole files** | **none node-side** — the red instrument is the **LIVE `U-5`/`uf_layout_10` row, never a node row** | the **live** reading, reported `PRECONDITION-FAILED` with the divergence reading attached if it cannot run (never silently parked) |
| **W7** | `PD-REGION-2` | **0 whole files** | **none** — the multi-mount rows are `REWRITE` **only after the census pin is re-stated by its owning unit** | as above **plus `K-3`'s two fence files green unedited** |
| **W8** *(main-process; not in the Phase-1 renderer chain)* | `PD-UI-9`, `PD-UI-8`/`PD-FOCUS-3` | **0 whole files** (both `SPLIT`) | the normalizer/builder rows in `unit-u-menu-1-application-menus` (26 rows, floor); the tool-shape rows in `unit-u-shell-9a-main-focus-tabs` (71 rows, floor) | as above **plus `K-4`'s same-commit rewrite** |

**The whole-program projection, stated as a range with its ground:** **0 whole-file archives are provable
from this pass's readings**, and any figure above **0** is `(derived)`. **The measured facts a later pass can
rely on instead are:** **19** candidate files examined · **0** already archived · **204** collected files at
this head · **41** archived files · **1** carried baseline red.

---

## 8. `NOT-IN-SCOPE` — the classes §4.1 does not touch (so a later pass does not over-prune)

| # | Class | Why it is out of scope |
| --- | --- | --- |
| **`N-1`** | **the RAG / store / traversal / retrieval / engine families** | `docs/FORK-DIVERGENCE.md` §2 row 9 + `PD-HOST-KEEP`; and the engine **elimination** half is `BLOCKED-ON-ENGINE` (Phase 2, additive only). |
| **`N-2`** | **editing / rich-text / textarea families** | `C9 U-EDIT-1`'s territory — **already archived (17 files)** and owned by another unit's cycle. |
| **`N-3`** | **the 41 already-archived files** | `REBUILD-ARCHIVE-POLICY` clause (4); see §6. |
| **`N-4`** | **the three `.test.mjs` batteries** | outside `vitest.config.ts`'s `include`; run by `package.json`'s `battery` (`e2e-battery.test.mjs` only). **`X-11`'s runner ruling is owed**; **not** this ledger's. |
| **`N-5`** | **`tests/fixtures/**` (all 5)** | clause (5) — shared with KEEP-LIVE tests; never archivable. |
| **`N-6`** | **the two fence files** | clause (5); §4. |
| **`N-7`** | **the O-0 oracle suites / artifact pair** | clause (5). |
| **`N-8`** | **`PD-HOST-KEEP`'s modules** (`pane-graph.ts`, `pane-registry.ts`, `sidebar-panes.ts` beyond the named subsets, `gnosis-*`, `template-pane.ts`, …) | `docs/FORK-DIVERGENCE.md` §3 rule 2 — app behaviour. |
| **`N-9`** | **the theme TOKEN block, the zone-name vocabulary, the tab-target vocabulary, the pane catalog/ordering policy, the import policy, the modal re-parent, the tab-strip renderer, `provident.get_journal`, `content-reconcile`** | the inventory's `§9` `S-1`..`S-12` (`STAYS FORK-LOCAL`) — **every one a non-candidate**. |
| **`N-10`** | **the stage-active-tab / page-commit families as SUBJECTS** | they are `KEEP` **type-surface** importers of `tab-state.js`; their own subjects belong to other units, and their pre-existing reds must not be attributed to Phase 1. |
| **`N-11`** | **the `PD-VENDOR` test trio** (`tests/pd-vendor-*.test.ts`) | the Phase-0 unit's own pins, **not** Phase-1 subjects — **but they CONSTRAIN Phase 1** (§5 `K-5`). |

---

## 9. WHAT THIS PASS DID NOT DO, ITS OWN LAYER, AND ITS OPEN ITEMS

**What this pass did NOT do (so no later pass over-reads this file):**

1. **No suite was run.** No `npm test`, no `npx vitest`, no `npm run build`, no `npm run typecheck`, no
   `npm run battery`, **no `npm run divergence`** (RED at this head for an environmental `/dev/shm` reason and
   owned to another unit), no app start, no `scripts/live-drive.mjs`.
2. **No file was moved, archived, created, deleted or renamed except this ledger** and the **annotations** in
   the inventory. **No test was edited.** No `src/**`, no `scripts/**`, no `package.json`, no vitest config,
   no vendored byte, and **nothing under `/media/ryanr/Shared Files/Projects/Provident-Electron`** was touched.
3. **No count in this file is a prediction presented as a reading.** §7 is labelled `(projected, not
   measured)` throughout; the two `(derived)` items are named in §2's method table.
4. **No live/app claim of any kind** — no row here is app-green, envelope-green, store-green or live-green.
5. **No settled adjudication was re-opened** — not gate 1's verdict, not the architect's rulings, not the
   Phase-0 unit's cycle, not the two spec amendments, not `B-1`, not `W0`'s outcome.
6. **Not reconciled by this pass:** the **`201` vs `221` vs `204` collected-file disagreement.** This pass
   **measures `204` at `d7ae18e`** and records the **`201`@`b6791e0`** + **3 added** arithmetic, but the
   **`221`** figure belongs to the pre-archive surface and its reconciliation is **a fresh measured reading at
   the branch head** (the proposal §5 already carries that as an unresolved row). **UNVERIFIED as fully
   reconciled.**
7. **The row-count floor problem:** every `(M-row)` count in §2 is a **literal-`it(` floor**. Files with
   generated rows (the PBT registers and the loop-driven families) will produce **more** runtime rows than the
   floor states. **A wave's real removed-row count is only obtainable from the landing reading** (clause 3).

**Its own layer (RCA-12, restated because it is the point):** **REPO-TEST-SURFACE / DOC-LAYER.** This ledger
documents which test files a **plan** would touch and what a **pin** forbids. It **proves nothing about the
assembled Electron app**, and **nothing it contains may be cited as app evidence.** A green suite over any
wave's result would be **envelope-green at best** — the shell CSS/grid/window, the stage↔app-graph assembly
and the live persistence round-trip are **structurally unassertable in node**, which is exactly why `W6b`'s
red instrument is the **live** `U-5`/`uf_layout_10` row.

**Open items this pass hands forward:**

| Id | Item | Owner |
| --- | --- | --- |
| **`O-1`** | **Every wave takes its own before → after READING** (`REBUILD-ARCHIVE-POLICY` clause (3)) and records the **owning unit** + the **spec the rebuilt suite derives from** — §7 names what to measure, not what it will be. | each Phase-1 unit |
| **`O-2`** | **`K-1`'s pin re-statement decision:** land the W2 adoption **around** `defaultLayout`/`coerceLayout`, or file an explicit pin re-statement with `unit-v5-migration`'s owning unit. **A relaxation is a review finding.** | the `U-PROJ`/`U-ZONES`/`U-CENSUS` unit + the architect |
| **`O-3`** | **`K-5`:** a Phase-1 adoption must **wrap** a vendored module, **never edit its bytes** (the `PD-VENDOR` manifest digests pin them). **UNVERIFIED whether an additive re-export file is sufficient** — what would settle it: the first row's own red set. | each adopting unit |
| **`O-4`** | **`PD-UI-7`/`PD-FOCUS-1`'s wave is unstated** in the re-issued §4.5 table (§1). | the architect |
| **`O-5`** | **The `PD-UI-9` phase-shape reading:** §4.5's table puts it in **W8** while clause (6) describes Phase 1 as the **renderer** chain and Phase 2 as the engine additive set. **UNVERIFIED which phase W8 belongs to** — what would settle it: an explicit phase assignment for `PD-UI-9`/`PD-UI-8`. | the architect |
| **`O-6`** | **`C-14` is WITHDRAWN** (the `26` in `test-pruning-disposition-2026-09-21.md` §4.2 is **correct**; the 26th row is a `.test.mjs`). **No open item remains on it** — recorded only so the withdrawn finding is not re-raised. | — (closed) |
| **`O-7`** | **The row-count floors** (§9 item 7) mean **no Phase-1 unit may quote a removed-row count from this file**; it quotes its own landing reading. | each Phase-1 unit |
