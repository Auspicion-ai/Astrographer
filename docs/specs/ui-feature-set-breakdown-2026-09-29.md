# THE UI FEATURE-SET BREAKDOWN — the remaining program, sequenced against the rebuilt foundation tools

**Date:** 2026-09-29 · **Branch:** `post-division-rebuild` · **Pass kind:** PLAN / BREAKDOWN —
**DOC-LAYER ONLY.** This pass wrote exactly one file (this one). It ran **no leg, no Electron, no
suite, no build**, and it holds **no shell** (its tool wall is read/search + doc-write).

**Layer (`RCA-12`, stated per claim as the house rules require).** Every claim below is one of three
things and is labelled at its site:

- **`VERIFIED-BY-READ` (this pass)** — a `read`/`glob`/`grep` this pass took over the tree or a doc.
  A read is **not** a run: no figure below is a measurement of behaviour.
- **`RECORDED READING (measurer: …)`** — a figure taken from a record that states its own measurer,
  quoted with that measurer named. This pass re-ran none of them.
- **`NOT RECORDED`** — the records are silent; §9 names what would settle it.

**No row of this artifact is app-green, envelope-green, store-green, engine-green, harness-green or
live-green.** The one live green the program holds is a **single unit's four live rows** (`PD-UI-6`
`L-1`..`L-4`, ADDITIVE / APP-GREEN ONLY) — `RECORDED READING (measurer: the live-scenario runner)`,
quoted from `docs/defects.md`'s live-battery section head. **The honest headline stands unchanged:
the app does not work** — `RECORDED READING (measurer: the live-scenario runner)`, the same section.

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in
this file** (the convention `docs/specs/requirement-catalog.md` §3.4 rule 7 establishes; the proposal
states it at its own head). Where a source's citation is line-numbered it is quoted as that source's
text, never adopted here.

**What this artifact is, and is not.** It is a **PLAN**: a breakdown of the UI changes required to
implement the remaining feature set with the rebuilt foundation tools, honouring the design decisions
that still stand. **Every unit it names still owes its own spec → TestWriter red (reported) →
Implementer green → RCA-3 adversarial → blind greens → live battery (RCA-11) → proofreader →
item-10d doc review → DONE-row cycle** (`AGENTS.md` items 3/9/10, `RCA-2`, `RCA-5`, `RCA-6`,
`RCA-11`, `RCA-12`). **This file authorises no spec, no test and no code**, and it re-opens no
decision. Where the records contradict the state I was handed, §10 reports it rather than smoothing it.

---

## 1. THE REMAINING PROGRAM ROWS, CORRECTED BY READING

**Layer:** DOC-LAYER restatement of the records; the row set is `VERIFIED-BY-READ` from
`docs/specs/post-division-rebuild-proposal.md` §4.1 / §4.5 / §4.7,
`docs/specs/post-division-local-elimination-inventory.md` §2.1 / §3 / §9 / §10 / §11 and
`docs/specs/post-division-test-disposition-2026-09-28.md` §1 / §4 / §5, cross-read against
`docs/next-steps.md`'s `CURRENT WORK / handover-state` region.

### 1.1 The DONE / CLOSED / KEEP / PARKED set (what is NOT remaining)

| Item | State | The reading that fixes it |
| --- | --- | --- |
| **`PD-VENDOR`** (Phase 0, the vendoring/pin unit) | **DONE on every gate it declares** | `docs/next-steps.md` `CURRENT WORK` state paragraph, clause (1); `vendor/foundation.lock.json` exists with `moduleCount: 15` (`VERIFIED-BY-READ`) |
| **`PD-UI-1`** (theme, `W1`) | **DONE on every gate it declares** (envelope `[T]` only) | `docs/next-steps.md` `DONE (2026-09-28) — PD-UI-1`; unit files `42/42`, the 3-file set `111/111` (`RECORDED READING (measurer: the supervisor)`), quoted in that row |
| **`PD-UI-6`** (settings-modal / overlay, `W1`) | **DONE on every gate it declares**; **live layer `LIVE PASS (ADDITIVE / APP-GREEN ONLY)`** | `docs/next-steps.md` `⟶⟶ PD-UI-6 GATE-6 ADDENDUM`; `archive/tests/2026-09-28-unit-u-shell-7-settings-modal.test.ts` is the whole-file ARCHIVE (`git mv`, `R100`, nothing deleted) |
| **`PD-VENDOR-PIN-REFRESH`** | **LANDED**, `[T]`/`[D]`/DOC only; the `A-3` revision-arm red **CLEARED**; `drift` **CLEAN** | `docs/next-steps.md` `DONE (2026-09-28) — PD-VENDOR-PIN-REFRESH` |
| **`PD-UI-11`** (`owned-list-host`) | **`KEEP`** (the reason REPLACED by `A-3`; `W0` records it stays `KEEP` on the replaced reason) | proposal §4.1 row `PD-UI-11`; §4.7 `A-3` |
| **`PD-UI-12`** (`slot-host`) | **deferred by an EXPLICIT RULING whose boundary spec EXISTS** — `docs/specs/unit-pd-ui-12-slot-host-boundary.md` (`VERIFIED-BY-READ`, the file exists); **its moved-half is EMPTY** and **no region host may be proposed or emulated** | proposal §4.7 `A-10`; the boundary spec's §9 finding `B-1`; inventory `§2.1 PD-REGION-1`'s `SUPERSEDED IN PART` note |
| **`PD-OVERLAY-2`** (the applied inert-background write) | **PARKED** — `Status: PARKED. Wave: unassigned — assigned at this row's own gate.` | `docs/pending.md` §PARKED row `PD-OVERLAY-2`; inventory §2.1 `PD-OVERLAY-2` |
| **the engine ELIMINATION half** | **`BLOCKED-ON-ENGINE`** — 7 of 19 ids / 15 of 31 modules; unsatisfied conjunct = the parked ingest/record-copy route (`GR-6a`) | proposal §4.3; `docs/specs/post-division-engine-offload-inventory.md` §5 |
| **`PD-UI-3`** | **NOT `NOT-IN-SCOPE` — RE-ADMITTED as a BUILD row** by `A-1`; wave `W6a` | proposal §4.7 `A-1`; §4.5's prose after the wave table |
| **`U-THEME-CONTROL`** | `NOT-IN-SCOPE`; the corrected disposition is `ABSENT → author-in-build` as `PD-UI-1`'s envelope work **or explicitly declined** — **`PD-UI-1` has LANDED and no theme control is claimed by its DONE row, so this is an unresolved tail** | proposal §4.1's "two rows that are NOT deletions" block, finding `C-15` |

### 1.2 The remaining rows — corrected

**Corrections to the list I was handed, stated first (details in the table and in §10):**

1. **`PD-UI-4a` is `W4`, and `PD-UI-4b`/`4c` are `W3`** — I was handed "`PD-UI-4a`/`4b`/`4c`
   (W3/W4)" as one lump. `VERIFIED-BY-READ` from §4.5's re-issued table and from
   `docs/specs/post-division-test-disposition-2026-09-28.md` §1: `W3` = `PD-UI-4b` + `PD-UI-4c`;
   `W4` = `PD-UI-4a` + `PD-UI-5`. This matters because §4.5's own `W3` cell says W3 **"depends on
   W4's session substrate by construction"** — i.e. the substrate unit must land **before** the two
   units its own wave number sits behind.
2. **`PD-UI-7` / `PD-FOCUS-1` is MISSING from the list I was handed, and its wave is UNSTATED.** Its
   `§4.1` classification is `BLOCKED-ON-SEMANTICS`, but **the architect's ruling has since LANDED**
   (`DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS`, `VERIFIED-BY-READ` in `docs/decisions.md`), and
   the disposition ledger states the residual plainly: *"**no wave in §4.5's table owns it** …
   **UNVERIFIED: its wave assignment is unstated in the re-issued §4.5 table**"*
   (`docs/specs/post-division-test-disposition-2026-09-28.md` §1, phase-1 exclusions). **This is a row
   whose blocking ruling is discharged and which no wave owns** — §7 surfaces it as an architect
   decision.
3. **`PD-UI-5`'s wave**: `W4`, correct — and it is a **BUILD**, not a deletion (`C-2`: the fork has no
   gutter-affordance module; `A-1`'s re-admission logic applies the same shape to `PD-UI-3`).
4. **`W6b` is not a row** — it is the **cutover half of `PD-UI-13`**, and its red instrument is a
   **LIVE** row (`U-5`/`uf_layout_10`), never a node row (`A-6`). My list treats it as a step.
5. **`PD-REGION-2` / `PD-UI-10` is ONE row with two ids** (`PD-UI-10` is the proposal's `§4.1` id;
   `PD-REGION-2` is the inventory's id) — `W7`, LAST by ruling.
6. **`uf_settings_5` is NOT in the app-layer FAIL pile** (I was handed "settings-modal contents rows
   `uf_settings_4/5/7`"). The run's FAIL list carries `uf_settings_4` and `uf_settings_7`; the
   `uf_settings_5` row is the **SCENARIO-DRIFT** row (`LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`,
   owner: the live-driver's owning unit), counted once in the DRIVER/scenario class, never in the app
   pile. `VERIFIED-BY-READ` from `docs/defects.md`'s group (a) and its `uf_settings_5` row.

| Row | Wave | `src/**` artifact + symbol (`VERIFIED-BY-READ` that the path exists) | Importers / collision pins |
| --- | --- | --- | --- |
| **`U-ZONES`** (`PD-UI-2` split, `A-4`) | **W2** | `src/renderer/layout-state.ts` → `zoneTrackCssVars` + the zone-set vocabulary | `K-1`: `tests/unit-live11-bridge-seams.test.ts` (**PROTECTED**, pinned twice: the electron-mock census + its own import of `defaultLayout`/`coerceLayout`/`type LayoutState`/`type PaneLayoutEntry`); the 11 `M-static` importers of `layout-state.js` |
| **`U-CENSUS`** (`PD-UI-2` split) | **W2** | `src/renderer/layout-state.ts` → `zoneTrackCssVars`'s census half; `src/renderer/sidebar-panes.ts` → `applyZoneTracks` | same 11-file set; `K-1` |
| **`U-PROJ`** (`PD-UI-2` split) | **W2** | `src/renderer/layout-state.ts` → `layoutCssVars`, `applyLayoutToRoot`, `LayoutRoot`, `LayoutState`, `ZoneLayout`, `PaneLayoutEntry` | same 11-file set; `K-1`; the `removeProperty` question is **this row's own red-set obligation** (`A-4`) |
| **`PD-UI-4b`** (`U-GUTTER`) | **W3** | `src/renderer/pane-gutter.ts` → `createGutterController`, `gutterAxis`, `gutterSizeForPoint`, `gutterBounds`, `clampGutterSize`, `setZoneSize`, `isGutterResizable`, `GUTTER_ZONES` | 2 `src/**` importers (`renderer.ts`, `sidebar-panes.ts`); 3 test importers; `K-2` |
| **`PD-UI-4c`** (`U-RELOCATE`) | **W3** | `src/renderer/pane-drag.ts` → `createDragController` (+ `movePane`, `insertionIndexForPoint`, `toZoneBounds`, `dropZoneForPoint`, `withinSnapThreshold`, `zoneOrientation`, `setZoneMinimized`, `legalZonesForScope`) | 3 `src/**` importers (`renderer.ts`, `sidebar-panes.ts`, `pane-graph.ts`); 4 test importers; `K-2` |
| **`PD-UI-4a`** (`U-GSESSION` + the `installShellPointers` rewrite) | **W4** | `src/renderer/renderer.ts` → `installShellPointers` + the module-private machine (`beginGesture`, `onGestureMove`, `onGestureUp`, `onGestureCancel`, `revertPriorGesture`, `onLostPointerCapture`, `onGestureDblclick`, `onDocumentPointerDown`) | 4 test importers; `G-9` source-text pin set names `unit-u-shell-shell-wiring`; `K-2` |
| **`PD-UI-5`** (`PD-GUTTERAFF-1`, the BUILD) | **W4** | `src/renderer/index.html` → the `.gutter[data-zone][data-axis]` geometry + cursor rules; `src/renderer/renderer.ts` → the gutter arms (`isLayoutZoneNameValue`, the `startGutter`/`previewGutter`/`commitGutterSize` calls) | `K-2`; **a NEW electron-mocking test file reds the census** (`P-2`) |
| **`PD-ZONES-3`** (the host half of `PD-UI-2`) | **W5** | `src/renderer/sidebar-panes.ts` → `applyZoneTracks`, `syncZoneMirrors` (the `is-empty` mirror) | module-private; reached through `SidebarPanes`; `K-2` (`unit-wave-1-bridge-wiring` imports `SidebarPanes`) |
| **`PD-FOCUS-2`'s subset + the `S-7` closure-seam row** (`A-3`) | **W5** | `src/renderer/tab-strip.ts` → `notifyTabClosed`, `drainClosedTabIds`, `TabStrip`, `TabStripContext`, `TabStripOptions` | 4 `M-static` `tab-strip.js` importers; the page-commit family's `KEEP` files must stay green unedited |
| **`PD-UI-13`** (the minted markup/declaration row) | **W6a** (cutover **W6b**) | `src/renderer/index.html` → the grid/track CSS + the region declaration markup | 10 `index.html`-reading test files; `uf_layout_10` is the `W6b` red instrument |
| **`PD-UI-3`** (re-admitted BUILD, `A-1`) | **W6a** | `src/renderer/index.html` → the `U-CONTAINER` **write site** (`VERIFIED-BY-READ`: `containerDeclarationFor`/`tokensFor`/`orientationFor` have **zero callers** in `src/**`; `contain:` occurs only inside the vendored `src/shared/container.ts`) | same 10 readers |
| **`PD-ZONES-2`** | **W6a** | `src/renderer/index.html` → the `#app > #wiki-root:has([data-zone=…].is-empty:not(.is-revealed))` collapse rules + the `grid-area` selector set | 3 named suites + the 10 readers; `EMPTY-ZONE-TRACK-NOT-COLLAPSED` is the live carrier |
| **the `W6b` cutover** (of `PD-UI-13`) | **W6b** | same markup; the cutover **commit** | red instrument: **LIVE `U-5`/`uf_layout_10`**, never a node row (`A-6`) |
| **`PD-REGION-2`** / **`PD-UI-10`** | **W7** (LAST by ruling) | `src/renderer/runtime.ts` → `tearDownGraph`'s `#wiki-root` sweep | `K-3`: both fence files import `src/renderer/runtime.js`; `tests/unit-live11-bridge-seams.test.ts` is PROTECTED |
| **`PD-UI-9`** (`PD-MENU-1`) | **W8** | `src/main/app-menu.ts` → `buildMenuTemplate(catalog, options)`, `normalizePaneCatalog(raw)` (+ `orderPaneCatalog`, `importSelectionFromDialog`) | **exactly 1 `src/**` importer** (`src/main/main.ts`); 2 test importers; name collision with the vendored `buildMenuTemplate` (`C-9`) |
| **`PD-UI-8`** / **`PD-FOCUS-3`** | **W8** | `src/main/mcp-server.ts` → the `ALL_TOOLS` member `'provident.focus'` + its registration + the handler; `src/main/security.ts` → `TOOL_GROUPS`; `src/shared/types.ts` → `RpcMethod` `'focus'` | `K-4`: `tests/unit-u-shell-9a-main-focus-tabs.test.ts` (the `tabId`-drop pin; reached by a dynamic `await import`); `ALL_TOOLS` = **58** members (`RECORDED READING (measurer: the gate 2026-09-27)`), quoted in `DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT` |
| **`PD-UI-7`** / **`PD-FOCUS-1`** | **NO WAVE OWNS IT** | `src/renderer/tab-state.ts` → `focusTarget` (and `targetEquals`) | 4 `src/**` importers; 17 `M-static` test importers (mostly `import type`) |
| **`W9`** | **W9** | trackers + archive closure — **not a code gate** | the repointed citations, the `SUPERSEDED` rows, the archive close-out |

### 1.3 The standing baseline the plan must not restate as clean

- **`G-1`, extended by `X-6`:** the branch baseline is `npm test` (**one carried red**),
  `typecheck` 0, `build` 0, `battery` **184 checks / 0 failures GREEN** (harness `[H]`, **not**
  app-green), `divergence` — see §2.3. `RECORDED READING (measurer: the proposal's §7.5 pass; the
  trio re-quoted by the supervisor at the head of `docs/next-steps.md`'s `CURRENT WORK` region)`:
  `npm test` = `208 files (1 failed / 207 passed) · 4472 tests (1 failed / 4426 passed / 45 skipped)`.
  **The single red is the carried baseline `P-SM-1`** (`strat:stage-seam-schedule-single-active`,
  defect `PANE-TOGGLE-STAGE-COLLAPSE`, APP / assembled-renderer). **No unit may claim a clean trio
  while it stands**, and its disposition is the **FIRST Phase-1 obligation**
  (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)).
- **`G-2`:** `C9 U-EDIT-1` is **MID-CYCLE** at this head; the rebuild inherits its residuals.
- **`ARCHIVE-READY IS EMPTY`** and **0 whole-file archives are provable** from the disposition
  ledger's readings (§6/§7 of that file, `VERIFIED-BY-READ`).

---

## 2. THE FOUNDATION TOOLS NOW AVAILABLE

### 2.1 The fifteen vendored mechanisms

**`VERIFIED-BY-READ` from `vendor/foundation.lock.json`** (`moduleCount: 15`, every module
`proposalTableAgreement: "REPRODUCED"`, `byteIdentity` = *"byte-identical to the pinned commit's blob
at `commit`"*, `importCensus.outOfSetImports: []`):

| Module | Pin md5 (the manifest's own value) | The program row it exists to serve (the manifest's `rowStatus`, read) |
| --- | --- | --- |
| `src/shared/zones.ts` | `91fb829d2a2be580538c7719b3f4bef0` | **`PD-UI-2` (`U-ZONES`)** |
| `src/shared/census.ts` | `550d9d6fb1285e23062b3cd9e3691179` | **`PD-UI-2` (`U-CENSUS`)** |
| `src/shared/layout-projection.ts` | `a507ea116d304e5f32241c63d2182196` | **`PD-UI-2` (`U-PROJ`)** |
| `src/shared/gesture-session.ts` | `50eb2dcc3e9e29427f7ae38716ddae90` | **`PD-UI-4a`** |
| `src/shared/gutter.ts` | `7cb67bfef8e4b3750994e3b33846055f` | **`PD-UI-4b`** |
| `src/shared/relocate.ts` | `83707f14ec249fa46fec45825d6b9be9` | **`PD-UI-4c`** |
| `src/shared/gutter-affordance.ts` | `90dae03fc92eb2c65e43f79843c3f0ef` | **`PD-UI-5`** |
| `src/shared/menu-template.ts` | `98952f69f7c39bbabca0458a69258b4b` | **`PD-UI-9`** |
| `src/shared/mount-invariant-guard.ts` | `a8ca65a5cd46ad7500d467d6355aaeb3` | **`PD-UI-10`** |
| `src/shared/overlay.ts` | `931339d71ac0220e400190296d408ee5` | **`PD-UI-6`** (already adopted) |
| `src/shared/theme.ts` | `c4b4d4c4127158d14bc035e58d857597` | **`PD-UI-1`** (already adopted) |
| `src/shared/container.ts` | `33071ff8a2453edb4febe52e9cba38a2` | **`PD-UI-3`** |
| `src/shared/focus-model.ts` | `8ae4a59ca853c3dad14e1e07cc73477a` | `PD-UI-7` (`BLOCKED-ON-SEMANTICS` in §4.1; ruling since LANDED) |
| `src/shared/owned-list-host.ts` | `d576f0017747d4fa6dacab3e9fb27ccb` | `PD-UI-11` (**`KEEP`** — `§4.1` row status, *never* set membership) |
| `src/shared/slot-host.ts` | `bb53cdedad4f8f4359f603fe7e4ea86d` | `PD-UI-12` (deferred pending its own boundary spec) |

**The lock's own baseline note (`VERIFIED-BY-READ`):** the four divergent baseline files
(`src/shared/dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts`) are
`baselineFilesNotReplaced` — **not replaced**. The internal import edges are exactly five
(`census→zones` · `gutter-affordance→gutter` · `gutter-affordance→gesture-session` · `gutter→gesture-session` ·
`relocate→gesture-session`), so **adoption is import-closed**.

**The pin rule (`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (1)-(2), and
`DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`):** the pin is the
manifest's `foundation.commit`, **read at this pass as
`d7b98b574adc7fa63fbabda617eba2a753f52cb5`** (`VERIFIED-BY-READ` in `vendor/foundation.lock.json`).
A move of the foundation HEAD is a **PIN FAULT BY DESIGN**, met by **ONE FOUR-SITE ATOMIC
RESTATEMENT** in its own unit. **An adopting unit WRAPS the vendored bytes behind a consumer adapter;
it never edits a vendored byte** (`K-5`).

### 2.2 The mechanisms that are NOT in the vendored fifteen

- **`U-MOUNTGUARD`'s removal half is not vendored.** `mount-invariant-guard.ts`'s shipped guard is a
  **PURE READER** (*"creates nothing, writes nothing"*) and refuses a real-DOM mount; the **removal**
  half the fork needs is the foundation's **`reconcileMount()`** inside *its* `src/renderer/runtime.ts`
  — a **diff against a different `runtime.ts`**, not a file (`C-7`, `V-3`, inventory `R-3`).
  `VERIFIED-BY-READ`: the lock's `modules` list carries no `reconcileMount`.
- **`U-SLOTHOST`'s moved-half is EMPTY** (the region-host half is DECLINED; §1.1 above).
- **The scoped conformance leg is VACUOUS AS EVIDENCE** — the Phase-0 unit's own DONE row records
  that its pass condition must be read *"VACUOUS AS EVIDENCE — no green subset may ever be reported
  from it"* (`RECORDED READING (measurer: the supervisor)`, quoted in `docs/next-steps.md`'s
  `CURRENT WORK` state paragraph clause (1)). The lock's `conformance.excluded` names four suites
  excluded on an **import-closure fact** (`layout-projection`, `owned-list-host`, `slot-host`,
  `mount-invariant-guard` — all three of the first three and the last resolving `dom-shim.js` to the
  fork's divergent copy).

### 2.3 The two new harness capabilities, and the now-green pre-live leg

1. **`--enable-tool-groups` / `PROVIDENT_ENABLE_TOOL_GROUPS`** — **launch-scoped, additive,
   fail-closed, never persisted, never subtractive.** `VERIFIED-BY-READ` in `src/main/security.ts`:
   `parseToolGroupList`, `enablementRequestFrom`, `effectiveEnabledGroups`, `groupForTool`,
   `TOOL_GROUP_FLAG = '--enable-tool-groups='`, `TOOL_GROUP_ENV = 'PROVIDENT_ENABLE_TOOL_GROUPS'`,
   `toolGroupFlagFormRefusal`. Pinned by
   **`DECIDED: HARNESS-ENABLEMENT-AND-BOOT-READINESS`** (`docs/decisions.md`, ACTIVE).
2. **The opt-in `boot` readiness member on `provident.list_targets`** — **ABSENT on a default
   launch**, read through a **bounded poll protocol with named stops, never a sleep.**
   `VERIFIED-BY-READ` in `src/main/mcp-server.ts`: `bootState(): BootInstallState | null` (returns
   `null` when `bootObservable` is false), `bootObservable`, the five-member `BootInstallState`
   (`installed`, `status`, `epoch`, `generation`, `error`), `markReady()`, `markBootSettled()`, and
   the `list_targets` read at the `boot` attach site. Pinned by the same decision row.
   **A recorded divergence rides on it:** `docs/defects.md`
   `SPEC-AMENDMENT-OWED-APP-ENABLEMENT-PREDICATE-DIVERGENCE` — `src/main/main.ts`'s
   `optedIn = requested.length > 0` against the contract's `source === 'argv' | 'env'`;
   **owner: the spec-writer; an owed amendment, not applied.**
3. **The pre-live leg is GREEN.** `RECORDED READING (measurer: the implementer's `T-1` pass)`:
   **`npm run divergence` → `R13 RESULT: 9 checks, 0 failures`, exit 0.** `VERIFIED-BY-READ` that
   `package.json`'s `divergence` script is `npm run build && node scripts/electron-divergence.mjs`.
   **Layer, stated first: HARNESS `[D]` ONLY — it proves the leg boots, loads, probes and drives a
   real Electron through the demo fixture. It is NEVER app-green, it is in no trio, and it retires no
   live row** (`docs/specs/unit-divergence-drive-fixture.md` §5 `L-4`; `RCA-11`). The recorded
   residual: `docs/defects.md` `GATE4-LEG-CLAUSE-vs-INSTRUMENT-GAPS` (the leg's eight comparison rows
   are **DEMO-vs-SHIM, never APP-vs-SHIM**; the app's own `wiki-root`/`zone:main` graph reads
   *"app 32 vs shim 12"* and is looked at by no row).
4. **The live driver and its standing discipline.** `node scripts/live-drive.mjs` on **isolated
   ports**, boot-and-connect confirmed **before** driving — `DECIDED: LIVE-GATE-RUN-DISCIPLINE`
   clause (i), whose reason is a recorded incident (a concurrent sibling held CDP `:9222` and issued
   `pkill -f "electron \."`, truncating run 1 at **block 82**; the re-run on isolated ports
   completed). The same row pins: **a matrix report with no verdict per declared row is INVALID**; a
   **live PASS is ADDITIVE and APP-green ONLY** and retires no `[T]`/node row; **a live FAIL is
   EVIDENCE split by layer before any disposition.**
5. **The `H-1`/`H-1b`/`H-2` pre-existing reds** inside `tests/unit-stage-active-tab-display-contract-holes.test.ts`
   (recorded from `docs/next-steps.md`'s `U-STAGE-ACTIVE-TAB` DONE row) — a unit touching the tab
   families must record them **before** its first edit (`R-7`).

---

## 3. THE MEASURED APP-LAYER GAP — the user-visible work that is NOT in the wave table

**The battery's last reading.** `RECORDED READING (measurer: the live-scenario runner)` —
**`done: 100 blocks, 39 FAIL, 3 PARKED`**, block split **PASS 31 / FAIL 39 / PARK 3 / DIAG 27**;
`§6.1 summary: {"total":8,"pass":1,"fail":1,"parked":0,"matrixRowsExecuted":2,"blocksRun":100,"extendedRowsRun":54,"diagnostics":27}`.
**Layer: APP / assembled-renderer `[U]`.** The re-run on isolated ports
(`--port=3951 --cdp-port=9451 --display=0`) **reproduced the reading identically**
(`RECORDED READING (measurer: the live-scenario runner)`), which is the expected default-branch
reading for a default-preserving app-side change — **it says nothing about the app's health.**

**The composition, corrected by the records rather than inflated.** The re-run splits
`39 = 32 APP + 2 DRIVER/scenario + 5 FIXTURE/precondition` (the `3` PARKED are separate), **and one of
the 32 is now known to be a DRIVER ORDER/PERSISTENCE ARTIFACT, not an app defect** (`uf_panes_1`).

### 3.1 The FAILs grouped by user-visible symptom, with the owning row

**Every row id below is a `[U]`/APP row unless its cell says otherwise.** Owning rows are named only
where a record assigns one; **"NO ROW OWNS IT" is the finding**, and it is the most valuable line this
artifact carries (`docs/pending.md`'s own convention: where an owner is genuinely unassigned, the row
says so and the item is parked with its revisit condition).

| # | Symptom group (what a non-developer sees) | Row ids | Owning row / wave — or **NO ROW** |
| --- | --- | --- | --- |
| **S-1** | **The census says a pane is enabled while no `.pane-frame[data-pane-id]` renders it** — the dominant symptom, recorded once; in modal-open / zone-minimized states the census reads `frames=0` and the pane's controls read `path=missing` | `uf_panes_10`, `uf_panes_14`, `uf_panes_1`(‡), `uf_settings_4`, `uf_settings_7`, `uf_search_2`, `vis_persist` (the group's own examples) | **NO ROW OWNS IT.** The wave table owns zone tracks, markup, gestures and the mount sweep; **none of them owns *"the census and the rendered frames disagree"***, which is the app's own reconciliation invariant. `PD-UI-11` stays `KEEP`; `PD-UI-12` is deferred with an EMPTY moved-half. **This is the single largest unowned class.** |
| **S-2** | **The doc-nav frame is absent in battery order** — while the SAME block **passes alone** | `uf_panes_1`(‡) | **NOT AN APP DEFECT — it has an owning row, and that row is the DRIVER's:** `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` (owner: the live-driver's owning unit). **The measured finding:** `--block=uf_panes_1` on fresh ports reads **PASS** (`doc-nav before: li=1 ul=true h=100px … reExpanded=true samePaneRoot=true`) and the full battery reads **FAIL** (`no doc-nav pane frame rendered; frames=[{pid:"search"}]`), because `persistence_v1` deliberately toggles `doc-nav` OFF **and persists it** and no block restores it. **The doc-nav frame is NOT broken; the pile must be corrected, never grown.** |
| **S-3** | **A zone does not minimize / re-expand visibly** — the zone-minimize state and the collapse geometry | `uf_panes_8` (`U-6`, a matrix row), `user3_collapse_orientation`, `user10_collapse_vertical_text`, `user8_zone_boundary` (**a 0-px painted seam**) | **Owned by `W6a`/`W6b`** (`PD-UI-13`, `PD-ZONES-2`, and `PD-ZONES-3` at `W5`) **for the track/collapse half**; `PANE-DRAG-TOP-ONLY`'s `setZoneMinimized` half sits in `PD-UI-4c` (`W3`). **The `0-px painted seam` has NO owning row** — `user8_zone_boundary` is not a collapse row. |
| **S-4** | **The stage shows the wrong body / loses the body — the async-mount race and the doc-nav switch inside the window** | `stage_async_mount_race_v1`, `stage_docnav_switch_inside_async`(§), `stage_document_tab_paints_its_document` | **NO ROW IN THE WAVE TABLE OWNS IT.** The defects are filed and OPEN with named root causes (`STAGE-RACE-ASYNC-MOUNT`; `UF-STAGE-AT-8 DOC-NAV-CLICK-NEVER-ACTIVATES-A-DOCUMENT-TAB`), and their fix home is `src/renderer/sidebar-panes.ts` — **which seven program rows share and none of them owns this behaviour.** |
| **S-5** | **The settings modal's CONTENTS are wrong** — the census / enabled-pane content rows | `uf_settings_4`, `uf_settings_7` | **NO ROW OWNS IT.** `PD-UI-6` (`W1`) is **DONE** and its live claims `L-1`..`L-4` **PASS** (the frame, the scrim, Escape, the re-parented mounts painting) — **so the unit's own contract is satisfied while the modal's contents rows FAIL.** The defect `PANE-VISIBILITY-IRREVERSIBLE` is OPEN with a user ruling attached (owner: the pane-visibility decision) and is **not a program row.** |
| **S-6** | **The toolbar's mode vocabulary drifts** — the toggle flips `data-mode` while the stage keeps rich HTML | `u_edit_1_live_representation_mode` (**app**); `toolbar_toggle` (**DRIVER/scenario**) | **Two different owners, and the split is the point.** The app row is defect `U-EDIT-1-LIVE-4 REPRESENTATION-MODE-NOT-APPLIED-TO-STAGE` (**OPEN**; owner: the unit that owns the stage-body derivation — **not** a Phase-1 wave row). The `toolbar_toggle` row is the **driver's** (its scenario asserts a stale `data-mode` vocabulary) — counted ONCE, in the DRIVER class, never in the app pile. |
| **S-7** | **History renders outside any pane frame** | `user5_history_in_pane` | **NO ROW OWNS IT.** Open defects with recorded root causes and no program row: `LIVE-UF5 HISTORY-IN-MAIN-CANVAS` (*"renders inside the MAIN canvas `#zone:main`, NOT inside a pane frame"*) and `HISTORY-NOT-DROPDOWN` (*"neither a dropdown nor in a pane"*). `U-7`'s `uf_hist_6` (the journal-revert row) is the matrix row and it is **not** this symptom. |
| **S-8** | **The stage is not editable as expected** — the editable stage / commit warning / caret / head-split | `user4_main_editable`, `u_edit_1_live_commit_failure_warning`, `u_edit_1_live_head_split_and_textarea_census`, `u_edit_1_live_caret_roundtrip` | **Owned OUTSIDE this program, by a MID-CYCLE unit:** `C9 U-EDIT-1` (`G-2`), whose residuals are open (`U-EDIT-1-LIVE-5`/`LIVE-8`, `C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET`). **The breakdown must not re-scope them, and must not delete `src/main/page-diff.ts`'s territory before that unit closes.** |
| **S-9** | **Search flickers** | `user6_search_no_flicker` | **NO ROW OWNS IT** (no defect row for the flicker itself was found by this pass's search — see §9). |
| **S-10** | **Panes do not reorder / only move to the top** | `reorder`, `user2_pane_drag` | **Partly owned:** `PD-UI-4c` (`W3`) **adopts the session** — and the records say explicitly that **adoption does NOT fix `N3 PANE-DRAG-TOP-ONLY`** (the projection input stays the fork's). **So the user-visible reorder defect has NO owning row**, and the open defect set (`PANE-DRAG-NO-COMMIT`, `PANE-DRAG-TOP-ONLY`, `PANE-SLOT-INSTABILITY-ON-DISCLOSURE`) is filed with named root causes and no program unit. |
| **S-11** | **Tabs** — a new tab / a search result opening a tab | `user1_tab_new`, `uf_tabs_7` (`U-2`), `uf_panes_12`(†) | **`PD-FOCUS-1`/`PD-UI-7` and `PD-FOCUS-3`/`PD-UI-8` own the model and the tool**, and `PD-FOCUS-2`'s `W5` subset owns the closure seam — **but `PD-UI-7` HAS NO WAVE** (§1.2 item 2), so **the tab-create symptom is owned by a row with no place in the sequence**. `user1_tab_new` is additionally the pinned live surface `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` records as **"exercise[s] the OLD policy"** and therefore *"reds a pinned surface BY DESIGN."* |
| **S-12** | **Persistence / landing** — the first boot and the persisted pane set | `boot_landing`, `vis_persist`, `uf_settings_7` | **NO ROW OWNS IT.** `boot_landing` and `vis_persist` **also carry a driver-side evidence defect** (they FAIL *"while naming no failing clause"*), so their reading is not even self-sufficient. `DECIDED: FIRST-RUN-ENABLED-DEFAULT` governs the first-run default and its pin is **owed, not carried** (the pinned suite was archived 2026-09-21; the re-derivation belongs to `C11 U-SEARCH`, which no Phase-1 wave contains). |
| **S-13** | **Duplicate paragraphs / duplication** | `repro_dup_para` (§) | **Driver-class:** FAILs with an **EMPTY evidence field** (`LIVE-DRIVER-EVIDENCE-LOSS` clause (i)) — a **violation of `D-GP-UFA-3`**, which makes `realInput`/`evidence` mandatory report fields. **Owner: the live-driver's owning unit.** The behaviour itself has no program row; `tests/import-render-no-duplicates.test.ts` is a **FENCE** that may not be edited by a unit. |
| **S-14** | **The zone boundary / resize geometry** — a resize that does not reach a zone size | `user7_zone_resize`, `user8_zone_boundary` | **`PD-UI-4b`** (`W3`) owns the resize session; **`PD-UI-5`** (`W4`) owns the affordance BUILD (**the gutter has no grip today** — `W2-N7`, OPEN). The **boundary-visibility half** has no owning row. |

**Legend.** (‡) = carried in the 32-row list but re-classified by measurement as a **DRIVER
order/persistence artifact**. (§) = carried in the 32-row list but re-classified as
**FIXTURE/precondition** or **DRIVER** on the re-run (§3.2). (†) = `uf_panes_12` belongs to the
FIRST RUN's list and is re-classified **FIXTURE/precondition** on the re-run (its own evidence: the
missing `li[data-document-id=".live-corpus/beta"]`).

### 3.2 The non-app classes, recorded so the app pile is not inflated

| Class | Count | Rows | Owner |
| --- | ---: | --- | --- |
| **DRIVER / scenario** | **2** | `toolbar_toggle` (stale `data-mode` vocabulary vs the live `html → markdown` flip — **the click path is real**); `repro_dup_para` (**empty** evidence field) | the live-driver's owning unit |
| **DRIVER order/persistence** | **1** (carried inside the 32) | `uf_panes_1` | the live-driver's owning unit (`LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`) |
| **FIXTURE / precondition** | **5** | the `gnosis_*` rows + `diag6` (`connect ECONNREFUSED 127.0.0.1:8080` — **no engine running**); `uf_panes_12` (missing corpus row); the two `stage_docnav_switch_*` rows (`rows=0`) | the harness/engine unit (the engine fixture; the `--strict-seed`/`--o0-corpus` fixture) |
| **DIAG (never a verdict)** | 27 | the `o0_*` rows (**census 226 claimed / 2 observed** — needs `--strict-seed`) | the O-0 measurement's own run mode |

**A driver-side evidence defect that degrades every future live verdict (`LIVE-DRIVER-EVIDENCE-LOSS`):**
`boot_landing` · `vis_persist` · `toolbar_toggle` **FAIL while naming no failing clause**;
`repro_dup_para`'s evidence is **EMPTY**; **`surface.target` / the structured `§6.1` fields are NOT
printed per row**, so some readings are not observable from the console evidence at all. **Owner: the
live-driver's owning unit.**

### 3.3 The matrix verdict defect — the reason later verdicts are unreadable

**`LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`** (severity HIGH: *"an INVALID report is worse than a
missing one — it reads as a pass"*). `RECORDED READING (measurer: the live-scenario runner)`: the
`§5.U` matrix report returned **only `2 of 8` declared rows** (`U-1`, `U-7`) while the mapped blocks
reported `UF-*` ids, so **`U-2`..`U-6` and `U-8` carry no `U-*` verdict** — and
**`reconcileMatrixRows` still printed `OK`** in full-battery mode. **`VERIFIED-BY-READ` at this pass**
in `scripts/live-drive.mjs`: `export const MATRIX_ROWS` holds **exactly eight** entries (`U-1`
`uf_panes_12` · `U-2` `uf_tabs_7` (+`uf_panes_14`) · `U-3` `uf_panes_12` (+`uf_panes_14`) · `U-4`
`uf_layout_10` · `U-5` `uf_layout_10` · `U-6` `uf_panes_8` · `U-7` `uf_hist_6` · `U-8` `uf_tabs_3`),
and the driver's own comment records *"MATRIX_ROWS must NOT change."* **`G-5` stands: the `§5.U`
matrix is FULL at 8.** **This is a DRIVER defect, and fixing it before any later UI wave is what makes
a live verdict readable at all** (§7).

---

## 4. THE STANDING DESIGN DECISIONS THIS PLAN MUST HONOUR

**Each id below was verified to EXIST and was read** (`VERIFIED-BY-READ` in `docs/decisions.md` unless
the cell says otherwise). **None is re-opened by this plan; this is a plan to implement them.**

| Constraint (id) | What it binds on this breakdown |
| --- | --- |
| **`DECIDED: MODAL-SETTINGS-REPARENT`** (ACTIVE) | The settings modal hosts the two EXISTING operator-only mounts **by RE-PARENTING** under `#settings-modal-body`; **neither graph is rebuilt**; **no app-graph pane ever enters it.** **The RE-PARENT half is KEPT — the foundation REFUSES it** (`overlay.md` §3.4 `R-12`/`P-OV-10`), recorded as a **divergent-but-retained behaviour**, and **no clean adoption may be claimed for it.** |
| **`DECIDED: POST-DIVISION-REBUILD-PD-UI-6-ADAPTER-CONTRACTS`** clause (iii) | Restates the re-parent half KEPT; the close route binds the verb `'escape'`; the class mirror is driven by the adopted record's `changed`; **the discriminating assertion is the WRITE COUNT, not the class.** |
| **`DECIDED: MODAL-DEDICATED-SCRIM`** (ACTIVE) | A dedicated scrim child `#settings-modal-scrim`; **scrim-click closes, content-click never**. `PD-UI-6`'s live row `L-3` is the instrument and it PASSES. |
| **`DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE`** (ACTIVE) | The settings pane is `scope: 'operator'` in an isolated `createIsolatedScope()` GraphScope — **NOT MCP-visible, NOT dispatchable, NOT listable.** Binds every `S-5`/settings row and `W5`'s `sidebar-panes.ts` work. |
| **`DECIDED: UI-CONFIG-CARRIER (C9)`** (ACTIVE) | UI config (theme tri-state, `layout {zones, panes}`, pane visibility, open tabs, `editingMode`→`representationMode`) serializes through the **existing `OperatorSettings` store as ONE versioned shape**. **Do not invent per-unit stores.** |
| **the project-wide UI constraint** (`AGENTS.md`; restated at proposal §3; carried as the id **`UI-RENDERED-WITH-PROVIDENT`** in the two `PD-UI-6` specs and the inventory) | **All UI that is not Electron shell chrome is authored as provident envelope data, never hand-written DOM.** A *mechanism* may be adopted; **moving a control node out of the graph is a review finding.** **Citation finding: `UI-RENDERED-WITH-PROVIDENT` is cited as a decision id in three specs but resolves to NO row in `docs/decisions.md`** — the nearest ACTIVE row is **`DECIDED: PANE-PROVIDENT-AUTHORING`** (`VERIFIED-BY-READ`). See §10. |
| **the shell-chrome carve-out** | The window frame, the native menu bar, the preload bridge and the MCP server are the only exception. **The fork's zone-name vocabulary, its mount roots and its grid topology are app/shell chrome and stay** (**`DECIDED: LAYOUT-IN-CSS`** — canvas/frame dimensions are basic CSS; JS persists only OPERATOR-CHOSEN sizes). **`PD-UI-13`/`PD-ZONES-2` may change the mechanism and the collapse rules; they may not move a control node.** |
| **the theme/token vocabulary and `data-theme`** | `PD-UI-1` **KEEPS the fork's precedence resolver as the adapter** and adopts the declaration + env reading; `DECIDED: POST-DIVISION-REBUILD-PD-UI-1-ADAPTER-CONTRACTS` clause (1): **a `removal: true` write means THE ATTRIBUTE IS REMOVED.** The token CSS (~15 token names) is app vocabulary and **stays**. **No wave may "simplify" the tri-state into the foundation's decision-free `resolveTheme(setting, env)`.** |
| **the `§5.U` matrix is FULL at 8** (`G-5`, `R-9`) | **Live assertions enter as RE-PINS or EXTENDED ROWS, never new slots. `MATRIX_ROWS` must not change.** The named re-pins: **`U-3`** (`uf_panes_12`, the pane-HEADER gesture surface) · **`U-5`** (`uf_layout_10`, the empty-track collapse) · **`U-1`/`U-2`/`U-6`** are precisely the rows `PD-UI-4`/`5`/`2`/`6` rewrite (`C-12`). **Every UI unit's trio additionally gains `npm run battery`** — the three `.mjs` batteries sit **outside `vitest.config.ts`'s `include`**. |
| **`DECIDED: HARNESS-ENABLEMENT-AND-BOOT-READINESS`** (ACTIVE) | The enablement route and the `boot` member (§2.3). Clause (v): **audit pins over a file a later unit legitimately moves are RE-STATED, NEVER RELAXED.** |
| **`DECIDED: LIVE-GATE-RUN-DISCIPLINE`** (ACTIVE) | §2.3 item 4. **Every live unit's evidence is taken through it.** |
| **`DECIDED: REBUILD-ARCHIVE-POLICY`** (ACTIVE) | **A superseded test is ARCHIVED, never adapted/deleted/skipped**; the archive is the **rebuild's INPUT**; the **coverage hole is recorded, not hidden**; **no archived file may be restored except through its owning unit's gate cycle**; the **before → after reading** is taken **at the landing**. |
| **`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** + **`…-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY`** | Vendoring is the consumption model; the four divergent baseline files are **not replaced**; the pin is **mechanical**; a HEAD move is a **PIN FAULT BY DESIGN** met by a **four-site atomic restatement**. |
| **`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS`** | The carried red is **carried**, its disposition is the **FIRST Phase-1 obligation**; **`PD-UI-12`'s boundary spec is written before any Phase-1 row** — **it EXISTS** (`docs/specs/unit-pd-ui-12-slot-host-boundary.md`). |
| **`DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS`** (ACTIVE) | A repeat open **ACTIVATES the existing entry and APPENDS NOTHING**; the fork's duplicate policy is **REPLACED**; `TabState.order` survives as a permutation carrier; **the model may carry no vocabulary** (`'tab'`/`'pane'`/zone/region may not appear as a symbol, union member or default). Evidence obligation: **a red set naming the repeat-open arm PLUS a LIVE row.** |
| **`DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT`** (ACTIVE) | `provident.focus` takes `{ target?: string, newTab?: boolean }`; **`tabId` is DROPPED**; the census is asserted as a **same-commit NAME-SET equality, not a count** (`ALL_TOOLS` = 58); **a same-commit amendment to `docs/specs/mcp-endpoint.md` §3** is owed (which carries **no focus row at all**). |
| **`DECIDED: REPRESENTATION-MODE-SUCCESSOR`** (ACTIVE) | `representationMode: 'html' \| 'markdown'` on the operator-settings carrier; the mode-change **broadcast contract survives**; the removed `editingMode` token is **NOT reused**; `DECIDED: EDITING-MODE-SETTING` is **SUPERSEDED** (verified: it carries its SUPERSEDED marker). |
| **`DECIDED: FIRST-RUN-ENABLED-DEFAULT`** (ACTIVE) | First boot enables `['search','doc-nav']`; the pin is **owed, not carried** (its pinned suite was archived; the re-derivation belongs to `C11 U-SEARCH`). |
| **`DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE`** (ACTIVE) | The pane-drag gesture surface is the **HEADER only**; capture is claimed **lazily** after a 4-px threshold. **This is the fork's own landed decision and the `W3`/`W4` adoptions must not invert it.** |
| **`G-9`'s SOURCE-TEXT PIN SET** (`A-5`, extended per `X-9`) | The O-0 hook-contract pins (`tests/unit-o-0-hook-contract.test.ts`'s `.record(...)` wrappers over `renderer.ts`/`sidebar-panes.ts`/`pane-graph.ts`/`content-reconcile.ts`/`runtime.ts`), plus the text pins in `unit-u-shell-7-settings-modal`, `unit-u-shell-9a-main-focus-tabs`, `unit-u-shell-shell-wiring`, `unit-h8-operator-editor`, the two `blind-unit-ujr1-*` rows and the two `blind-unit-ud7-*` rows. **A wave that edits a pinned file owes that pin's re-derivation BY NAME; a wave that "fixes" a pin by relaxing it is a review finding.** |
| **the `PROTECTED` set** | **10 artifacts: 9 `tests/**` + `src/main/markdown-import.ts`**, verified by `P-1`..`P-6` in `tests/unit-v5-migration-contract.test.ts`. **Immovable.** Plus the three non-test `R-`artifacts: `vitest.config.ts` (`testTimeout` bounded on both sides at `15_000`), `package.json` (no `--testTimeout`), `docs/specs/ui-overhaul.md` (the Class-C corpus). |
| **the fence files** | `tests/traversal.test.ts` and `tests/import-render-no-duplicates.test.ts` — **exempt BY NAME; a fence edit re-enters the gate.** |
| **the electron-mock census** | An **exact 5-name set** derived from a real `vi.mock('electron', …)`; **a new electron-mocking test file reds it** — so `W3`/`W4`'s gesture units **must not add one.** |
| **the digest-pinned vendored bytes** | **Wrap, never patch** (`K-5`): a Phase-1 adoption that **edits** a vendored byte instead of wrapping it **reds** `tests/pd-vendor-manifest.test.ts` + `tests/pd-vendor-drift.test.ts`. |
| **`G-4`, restated** | **No fork unit may remove a LOCAL WRITE path for ENGINE-OWNED DATA while the ingest route is parked** — the corpus (226 documents / 6 102 nodes / 9 266 edges) is lost at the next restart otherwise. **It does NOT forbid the `PD-UI-2` CSS-write replacement** (`C-11`'s scoping ruling). |
| **`G-6`** | The foundation's greens are **ENVELOPE-green, not app-green**, and the statement is **true per unit, FALSE as a blanket**. **Each adopting unit states which layer of foundation evidence it inherits — and it owns its own rendered/live evidence. No fork unit may cite a foundation green as app evidence.** |
| **`G-7` / `G-8`** | The mechanisms are **pure and total with caller-supplied seams** — supplying nothing yields the *declared degraded* answer, never an invented default. **A foundation spec defect is HANDED OFF, never absorbed and never patched.** |
| **the `MUST-NOT-MOVE` list** (proposal §3, from `docs/specs/astrographer-scope-realignment-review.md` §4.1) | The `pane-collapse-<id>` control + its handler name + host seam; container minimize + tab list; doc-directory tree; advanced search; hover-preview; shared subtrees; the markdown/HTML toggle: **stay provident-authored and dispatchable.** Stage content: **must not narrow what `get_rendered_html`/`list_targets` see.** The RAG layer and the pane registry: **the fork keeps these.** |

---

## 5. THE BREAKDOWN

**Shape, stated so nothing is improvised away.** Every unit below carries the eight fields the
spine requires — **(a)** the user-visible behaviour it changes, in one sentence a non-developer can
check in the running app; **(b)** the foundation tool it adopts/uses (module + symbol, or
`none — fork work`); **(c)** the fork artifact(s) + importers/pins it touches; **(d)** the test
surface it disposes of (per the disposition ledger, incl. any archive move); **(e)** the LIVE
instrument that will evidence it, naming the battery block(s) / matrix row(s) / the re-pin it needs
and whether a **new** live assertion is admissible; **(f)** the standing design constraints that bind
it; **(g)** the risk + its named falsifier; **(h)** the decision only the architect can take, if any.

**Reading the `(e)` field.** `G-5` fixes the matrix at 8, so **no unit may add a matrix slot**: a new
live assertion is admissible **only** as (i) a **re-pin of an existing row**, (ii) an **extended row**
(a block that also exercises the behaviour without claiming it), or (iii) an **extended (non-matrix)
result reported in the separate same-shape table** `D-GP-UFA-4` defines. **Every unit that lands a
non-trivial user-visible behaviour additionally owes a LIVE row under `RCA-11` clause (a)**, taken
through the `DECIDED: LIVE-GATE-RUN-DISCIPLINE` route — the two obligations are compatible only
through forms (i)–(iii).

### 5.1 THE SEQUENCE, AT A GLANCE

```
W2  ── the projection / census / track chain            (3 units, ONE commit for the re-point)
 │
 ├─ W4a ── PD-UI-4a  the SESSION SUBSTRATE   ← MUST PRECEDE W3 (§4.5's own W3 cell)
 │   │
 │   ├─ W3a ── PD-UI-4b  the gutter resize controller
 │   ├─ W3b ── PD-UI-4c  the pane relocate controller
 │   └─ W4b ── PD-UI-5   the affordance BUILD
 │
 ├─ W5  ── PD-ZONES-3  + PD-FOCUS-2's subset / the S-7 closure seam
 ├─ W6a ── PD-UI-13  + PD-UI-3  + PD-ZONES-2      (structure, old collapse still works)
 ├─ W6b ── the cutover commit                      (LIVE red instrument)
 └─ W7  ── PD-REGION-2 / PD-UI-10                  (LAST by ruling)

W8  ── PD-UI-9  +  PD-UI-8 / PD-FOCUS-3            ← MAIN-PROCESS, PARALLEL-SAFE with W2–W7

[NO WAVE] ── PD-UI-7 / PD-FOCUS-1                  ← RULING LANDED, WAVE UNASSIGNED

GAP ── the measured app-layer pile (§3)            ← a NEW work stream, sequenced BELOW
W9  ── tracker + archive closure
```

**Where parallelism is safe.** `W8` is **main-process** (`src/main/app-menu.ts`,
`src/main/mcp-server.ts`, `src/main/security.ts`, `src/shared/types.ts`) and is
**independent of the renderer chain** — the inventory's own wave `8` says so verbatim: *"main-process,
**independent of the renderer waves**; may run **in parallel** with 1–7"* (`VERIFIED-BY-READ`,
inventory §3). **`W7` is LAST by ruling and may NOT be parallelized with `W6`** (it is the only row
whose regression is APP-only visible). `W2` is a **hard predecessor** of `W5`, `W6a` and `W3`/`W4`
(the projections the controllers and the markup consume). The **gap work (§5.4) may run in parallel
with the whole wave chain** where it touches files no wave owns — and **must not** where it touches
`src/renderer/sidebar-panes.ts` (seven rows share that host).

---

### 5.2 UNIT ROWS — W2

#### W2.0 — the shared pre-conditions of the three W2 units (a step, not a unit)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | None on its own — this step makes the three W2 units landable without the grid drifting a pixel mid-sequence. |
| **(b) foundation tool** | `none — fork work`. |
| **(c) artifacts + importers** | The **7 `src/**` importers of `layout-state.ts` re-point in ONE commit** (`operator-settings-store.ts`, `pane-drag.ts`, `pane-graph.ts`, `pane-gutter.ts`, `renderer.ts`, `sidebar-panes.ts`, `shared/types.ts`, + the `pane-registry.ts` type reference) — the inventory's wave-2 rule (`VERIFIED-BY-READ`). |
| **(d) test surface** | **0 whole-file archives** (all `SPLIT`/`REWRITE`). The **before → after** `npm test` reading is taken at the landing (`REBUILD-ARCHIVE-POLICY` clause (3)). |
| **(e) LIVE instrument** | None for the step; the units below carry theirs. |
| **(f) constraints** | `K-1`/`K-5`; `G-9`; the `PROTECTED` set; `G-4`. |
| **(g) risk + falsifier** | **Risk: a half-landed re-point** — a file left importing the old projection shape. **Falsifier: `npm run typecheck` exit 0 with all 7 importers edited in the same commit**, plus `K-1`'s protected suite **green unedited**. |
| **(h) architect decision** | **NONE.** |

#### W2.1 — `U-ZONES`

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | An empty side zone still collapses to nothing and the stage still takes the space back — the zone's own emptiness test becomes the foundation's. |
| **(b) foundation tool** | **`src/shared/zones.ts` → `isEmpty`, `trackFor`** (the `U-ZONES` row's `Replaces` cell). |
| **(c) artifacts + importers** | `src/renderer/layout-state.ts` → `zoneTrackCssVars` + the zone-set vocabulary. **Pin: `K-1`.** `defaultLayout`/`coerceLayout` **FROZEN**. |
| **(d) test surface** | `SPLIT`/`REWRITE` — the projection rows **rewritten**, never archived whole (ledger §2 entries #3/#4/#5). **The behaviour is RE-DERIVED from the spec with a fresh red set**, never copied from the archived assertions. |
| **(e) LIVE instrument** | **RE-PIN `U-5`** (`uf_layout_10`, the empty-track collapse). **Admissible as a re-pin only** — the matrix is FULL. Supporting blocks (extended, not claiming): `user3_collapse_orientation`, `user10_collapse_vertical_text`. |
| **(f) constraints** | `G-5`; `G-9`; `K-1`; `K-5`; `DECIDED: LAYOUT-IN-CSS`; the project-wide UI constraint. |
| **(g) risk + falsifier** | **Risk rank 2 in the architect's ranking** (`PD-UI-2`'s track/census write: *"the collapse works BECAUSE JS and CSS agree"*). **Named falsifier (`U-5`):** `gridTemplateColumns` reads `0px` for the empty zone **on BOTH sides of the swap**, and `zone:main` reclaims the width. |
| **(h) architect decision** | **NONE** — `A-4`'s split is the ruling. |

#### W2.2 — `U-CENSUS`

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | The zone tracks reflect the ACTUAL set of placed, non-empty panes in the same frame as a pane set change — no lag, no stale track. |
| **(b) foundation tool** | **`src/shared/census.ts` → `computeTrackVars`** (the census→track-variable record). |
| **(c) artifacts + importers** | `src/renderer/layout-state.ts` (the census half) + `src/renderer/sidebar-panes.ts` → `applyZoneTracks` (the call site arrives fully at `W5`'s `PD-ZONES-3`; `W2` re-points the computation). |
| **(d) test surface** | `REWRITE` for the mirror rows reached through `SidebarPanes`; **`KEEP`** for the app-policy rows. |
| **(e) LIVE instrument** | **RE-PIN `U-5`** again (the census is the input to the same track write); **extended row**: `uf_panes_8` (`U-6`) already exercises the minimize/re-expand path. |
| **(f) constraints** | `G-5`; `G-7` (`computeTrackVars` must be supplied the fork's own census — supplying nothing yields the *declared degraded* answer, never an invented default); `G-9`. |
| **(g) risk + falsifier** | **Risk: the census seam is supplied nothing**, yielding the declared empty answer while every node row stays green (`G-7`). **Falsifier: `U-5` reads a `0px` track on the EMPTY side and a non-zero track on the FILLED side in ONE run** — the two-sided reading is what falsifies a silently-empty census. |
| **(h) architect decision** | **NONE.** |

#### W2.3 — `U-PROJ`

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Operator-chosen zone sizes still stick across a re-derive, and an empty zone still collapses — the track values are computed by the foundation's projection and written by its applier. |
| **(b) foundation tool** | **`src/shared/layout-projection.ts`** → `project`, `projectVar`, `applyVarsToRoot`, `VarSpec`, `ProjectionSkip`. |
| **(c) artifacts + importers** | `src/renderer/layout-state.ts` → `layoutCssVars`, `applyLayoutToRoot`, `LayoutRoot`, `LayoutState`, `ZoneLayout`, `PaneLayoutEntry`. **Pin: `K-1`** (four exports must keep their names and shapes — **land AROUND them, or file an explicit pin re-statement with the pin's owning unit; never relax the pin**). |
| **(d) test surface** | `REWRITE` for `layoutCssVars`/`applyLayoutToRoot` rows; **`KEEP`** for `coerceLayout`/`deriveLayout`/`defaultLayout`/`isLayoutZoneName`/`LAYOUT_VERSION`/`LAYOUT_ZONE_MIN`/`MAX`/`LAYOUT_REGION_*` (app serialization + policy). |
| **(e) LIVE instrument** | **RE-PIN `U-5`** (`uf_layout_10`); **extended**: `user8_zone_boundary`, `user7_zone_resize`. |
| **(f) constraints** | `G-4`'s scoping ruling (**the `PD-UI-2` CSS-write replacement is NOT forbidden** by the corpus-loss caution — `C-11`); `DECIDED: LAYOUT-IN-CSS` (JS persists only OPERATOR-CHOSEN sizes; **no resize listener may exist**); `G-5`; `K-1`/`K-5`. |
| **(g) risk + falsifier** | **Risk: the `removeProperty` arm.** The deleted half writes CSS **two ways** (`setProperty('0px')` **and** `removeProperty`), and it is **UNVERIFIED whether `applyVarsToRoot` reproduces the `removeProperty` arm** — which `A-4` converts from a carried `UNVERIFIED` into **this row's own red-set obligation**. **Named falsifier: a red row that DRIVES the removal arm and reads the property ABSENT afterwards** (an absent property and a `0px` property are distinguishable only by the CSSOM read-back). **Second falsifier (`U-5`):** both sides of the swap. |
| **(h) architect decision** | **ONE, and it is narrow:** if the red-set work shows the vendored applier **cannot** express the removal arm, the fork needs either (i) a **consumer-side post-step** after `applyVarsToRoot` (the wrap-not-patch rule permits this) or (ii) an **explicit pin re-statement** — the choice is the architect's, and it must be taken **at this unit's gate**, never mid-implementation. |

---

### 5.3 UNIT ROWS — W4a (the substrate), then W3, then W4b

> **The ordering correction this breakdown carries.** §4.5 assigns `PD-UI-4b`/`4c` to `W3` and
> `PD-UI-4a` to `W4`, **and its own `W3` cell states that `W3` **"depends on W4's session substrate by
> construction"** — *"`PD-UI-4a` (`U-GSESSION`) must land first or the two controllers fork the
> pointer lifecycle again."*** **This breakdown therefore executes `PD-UI-4a` FIRST** and keeps the
> wave LABELS (`W3`/`W4`) as the program's own ids. **No wave is renumbered; the dependency is
> honoured.** This is surfaced to the architect in §7 in case the intended reading was the reverse.

#### W4a.1 — `PD-UI-4a` (`U-GSESSION` + the `installShellPointers` rewrite)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | A click inside a pane BODY still reaches its own control, a click on a pane HEADER toggle still collapses/expands the pane, and a real header drag still relocates the pane — with the gesture's lifecycle owned by the foundation session instead of a document-delegated machine. |
| **(b) foundation tool** | **`src/shared/gesture-session.ts`** → `createGestureSession`, `installGestureListeners`, `detachGestureListeners`, `GestureSession`, `POINTER_TYPES`, `SessionOptions`. |
| **(c) artifacts + importers** | `src/renderer/renderer.ts` → `installShellPointers` + the module-private machine. **Consumers: `pane-drag.ts` + `pane-gutter.ts` supply the drop/resize math the session drives** (`W3`'s units). **`K-2`** (`unit-wave-1-bridge-wiring` is census-pinned and imports `SidebarPanes`); **`G-9`** names `unit-u-shell-shell-wiring`; `tests/renderer-pane-drag-surface.test.ts` is the **F-1 regression pin** and must be **REWRITTEN, never ARCHIVED**. |
| **(d) test surface** | **`REWRITE`** the four suites (`unit-u-shell-shell-wiring`, `…-adversarial`, `…-pbt-generators`, `renderer-pane-drag-surface`); **0 whole-file archives.** **A NEW electron-mocking test file must NOT be added** (`P-2` census = exactly 5 names). **Record the `H-1`/`H-1b`/`H-2` pre-existing reds BEFORE the first edit** (`R-7`). |
| **(e) LIVE instrument** | **RE-PIN `U-3`** (`uf_panes_12`, *"the pane-drag gesture surface is the pane HEADER only — a body click is never hijacked (F-1)"*). Extended: `user2_pane_drag`, `uf_panes_14`, `user7_zone_resize`. **No new matrix slot.** |
| **(f) constraints** | **`DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE`** (the landed fork contract the adoption must not invert); **`H-r9`'s refile note** — *capture is 0 BEFORE establishment, permitted AFTER, per-control opt-in* — so *"no capture at all"* is **NOT** the criterion; `G-5`; `K-2`; `G-9`; the project-wide UI constraint (a mechanism may be adopted; a control node moved out of the graph is a finding). |
| **(g) risk + falsifier** | **Risk rank 3** (the split gesture rows: **capture, threshold and revert are not node-assertable**). The wiring is **REWRITTEN, not re-pointed** — this repo currently does all three rejected shapes (document-delegated `pointerdown`, per-event `closest(selectors)`, capture at `pointerdown`). **Named falsifier (`A-6`/`user2_pane_drag` + `user7_zone_resize` + `U-1`/`U-3`): a body click never starts a gesture, and a header drag commits exactly ONCE at terminal.** **Second falsifier: `installShellPointers`' documented fail-soft + per-document idempotence survives** — a naive swap can double-register listeners or lose the double-click reset, and **neither is node-assertable at the assembled layer.** |
| **(h) architect decision** | **NONE** — the ruling landed (`DECIDED: SCH-REQUEST-WITHDRAWAL-AND-FILING-DECISIONS`, `SCH-2` WITHDRAWN; `PD-UI-4a` PROCEEDS). |

#### W3.1 — `PD-UI-4b` (`U-GUTTER` + `pane-gutter.ts`)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Dragging a zone gutter resizes that zone, the size is clamped to sane bounds, and it persists — the resize session is the foundation's. |
| **(b) foundation tool** | **`src/shared/gutter.ts`** → `createResizeController`, `clampToBounds`, `ResizeController`, `CommitSink`, `ClampBounds`, `AxisFor`, `BoundsFor`, `DefaultSizeFor`, `IsResizable`. |
| **(c) artifacts + importers** | `src/renderer/pane-gutter.ts` → `createGutterController` **deleted**; `clampGutterSize`/`gutterBounds`/`setZoneSize`/`isGutterResizable`/`gutterAxis`/`GUTTER_ZONES`/`gutterSizeForPoint` **KEEP** (the fork's `LayoutState` policy — the zone vocabulary and the 160/1200-px clamps are app behaviour). `src/**` importers: `renderer.ts`, `sidebar-panes.ts`. **`K-2`.** |
| **(d) test surface** | **`SPLIT`** — `tests/unit-u-shell-5-resizable-gutters.test.ts` is classified `SPLIT` (**REWRITE for the session rows; KEEP for the clamp/`setZoneSize` rows**); the measured disposition of the three `pane-gutter.js` importers is `SPLIT`/`REWRITE`, **never whole-file `ARCHIVE`**. **0 whole-file archives**; record the before → after reading. |
| **(e) LIVE instrument** | **RE-PIN `U-3`'s sibling `user7_zone_resize`** (the resize gesture) and **`U-5`** (the collapsed track's geometry). **No new matrix slot.** Extended: `user8_zone_boundary`. |
| **(f) constraints** | `G-5`; `K-2`; `DECIDED: LAYOUT-IN-CSS` (**JS persists only operator-chosen sizes**); `G-7` (the seven REQUIRED seams — a `DefaultSizeFor` that is falsy yields **zero commits and zero previews**, a non-callable `CommitSink` reads `sinkCalls` 0). |
| **(g) risk + falsifier** | **Risk rank 3.** **`W2-N7` (MEDIUM, OPEN) is exactly this row's live-wiring gap** and is recorded as **unreachable in the live app** (`H-5`). **Named falsifier: `user7_zone_resize` reaches a NEW zone size via a real hit-tested drag, and the `CommitSink` fires exactly once at terminal** (a non-callable sink reads `sinkCalls` 0 — the discriminating reading). |
| **(h) architect decision** | **NONE.** |

#### W3.2 — `PD-UI-4c` (`U-RELOCATE` + `pane-drag.ts`)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Dragging a pane's header moves THAT pane to the position the operator dropped it on — the drag session is the foundation's; **the drop position policy stays the app's.** |
| **(b) foundation tool** | **`src/shared/relocate.ts`** → `createRelocateSession`, `withinProximity`, `RelocateSession`, `CommitSink`, `PreviewSink` — **the session half only.** |
| **(c) artifacts + importers** | `src/renderer/pane-drag.ts` → `createDragController` **DELETE**; `movePane`/`insertionIndexForPoint`/`legalZonesForScope`/`setZoneMinimized`/`toZoneBounds`/`dropZoneForPoint`/`zoneOrientation` **KEEP** — they encode Astrographer's zone names, pane scopes (`app-graph`/`operator`) and slot-order policy. `src/**` importers: `renderer.ts`, `sidebar-panes.ts`, `pane-graph.ts`. **`K-2`.** |
| **(d) test surface** | `tests/unit-u-shell-4-drag-relocate.test.ts` — **REWRITE (the session rows) + KEEP (the `movePane`/ordering rows)**; `tests/renderer-pane-drag-surface.test.ts` — **REWRITE**. **0 whole-file archives.** |
| **(e) LIVE instrument** | **RE-PIN `U-3`** (`uf_panes_12`); extended: `user2_pane_drag`. **The `N3` reorder behaviour is NOT fixed by this unit** and therefore needs its own evidence — see §5.4 `GAP-4`. |
| **(f) constraints** | `G-5`; `K-2`; the project-wide UI constraint; `G-4` (do not remove a local write path for engine-owned data). |
| **(g) risk + falsifier** | **Risk rank 3, PLUS the recorded trap: *"adopting the foundation session does NOT fix `N3` — the projection input is still the fork's"*, and *"the rebuild must not treat the swap as a defect fix."*** **Named falsifier: a header drag commits exactly ONCE at terminal with the new slot index surviving the re-render** — and, separately, the `N3` falsifier (`drag pane A between B and C → order becomes B,A,C`). **A unit that reports the `N3` falsifier green on the strength of the session swap alone is reporting a false green.** |
| **(h) architect decision** | **ONE:** whether `PD-UI-4c` **absorbs `N3`'s projection fix** (projecting the real zone/pane boxes from the `#wiki-root` grid + the `.pane-frame` rects, and making every pane frame's header start a drag) **or** the fix is minted as its own row (`GAP-4`). **Cost either way is named in §7.** |

#### W4b.1 — `PD-UI-5` (`PD-GUTTERAFF-1`, the affordance BUILD)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | The operator can SEE where to grab a zone boundary — the gutter shows a resize cursor, and a preview follows the pointer while dragging. |
| **(b) foundation tool** | **`src/shared/gutter-affordance.ts`** → `createGutterAffordance`, `cursorDeclarationFor`, `domEventSource`, `PointerResolver`, `SizeFromPointer`, `AxisOf`, `ApplyPreview`, `ApplyCursor`, `Commit`, `MoveTypeOf`, `CursorOf`, `GutterAffordanceStats`, `PreviewState`, `EventSourceLike`. |
| **(c) artifacts + importers** | `src/renderer/index.html`'s `.gutter[data-zone][data-axis]` geometry + cursor rules; `src/renderer/renderer.ts`'s gutter arms (`isLayoutZoneNameValue`, the `startGutter`/`previewGutter`/`commitGutterSize` calls). **This is a BUILD: there is nothing to delete** — the fork has **no** gutter-affordance module (`C-2`, re-verified at `d7ae18e`: 16 grep hits, **zero** outside the Phase-0 vendoring work). |
| **(d) test surface** | **The gutter/`index.html` suites are `REWRITE`**; **`PD-UI-5` owes a NEW red set** (nothing to archive). **`index.html` is also `PD-UI-13`'s file** — the two rows must not both claim the same markup edit without naming the boundary (`PD-UI-13` owns the declaration/grid half; `PD-UI-5` owns the affordance/cursor half). |
| **(e) LIVE instrument** | **RE-PIN `U-3`-adjacent `user7_zone_resize`** (the affordance is what makes the gesture reachable) and **`U-5`**; extended: `user8_zone_boundary`. **`D-GP-UFA-2` applies to any `D-visual` claim: a PASS needs a PAINTED/rendered-box oracle, never computed style alone.** |
| **(f) constraints** | **The project-wide UI constraint is the binding one: the affordance must be AUTHORED AS ENVELOPE DATA (provident-authored), never hand-written DOM.** `G-7` (nine REQUIRED + two OPTIONAL of eleven seams; a NaN clamp ⇒ invalid move; a refused cursor write), `G-5`, the shell-chrome carve-out (**the cursor CSS itself is shell chrome and stays**). |
| **(g) risk + falsifier** | **`R-8`: the largest under-estimation risk in the set — a BUILD, not a swap.** **Named falsifier: a real hit-tested pointer move over a gutter produces a PAINTED preview box and a real drop commits the size once** — with the cursor-declaration half read back as a PAINTED/rendered cue, not as a computed-style-only probe (`D-GP-UFA-2`). |
| **(h) architect decision** | **NONE for the build. ONE for its evidence:** whether the affordance's live claim may enter as an **extended (non-matrix) result** under `D-GP-UFA-4` (the recommended form, since the matrix is full) or must be **folded into `U-3`/`U-5`'s re-pin evidence text**. The plan recommends the extended-row form; the ruling is the architect's. |

---

### 5.4 UNIT ROWS — W5

#### W5.1 — `PD-ZONES-3` (the synchronous census mirror in the host)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | After any pane enable/disable/place change, the zones are correct in the SAME frame — no visible one-frame jump of the grid. |
| **(b) foundation tool** | **`src/shared/census.ts` → `computeTrackVars` + `src/shared/layout-projection.ts` → `applyVarsToRoot`** (the row's own `Replaces` cell). |
| **(c) artifacts + importers** | `src/renderer/sidebar-panes.ts` → `applyZoneTracks`, `syncZoneMirrors` (the `is-empty` mirror). **Module-private; reached through `SidebarPanes`. `K-2` binds** (`unit-wave-1-bridge-wiring` is census-pinned and imports `SidebarPanes` — the rewrite must keep the export and the file's name). |
| **(d) test surface** | `tests/sidebar-panes*.test.ts` (4 files) + the grid suites — **KEEP/re-point**. The `applyZoneTracks` mirror rows **`REWRITE`**. **0 whole-file archives.** |
| **(e) LIVE instrument** | **RE-PIN `U-6`** (`uf_panes_8`, *"a pane-tab click after zone minimize re-expands the zone (visible)"*) and **`U-5`**. **`U-6` is one of the eight matrix rows and is currently UNVERDICTED** (§3.3) — so this unit's live evidence is **blocked on the driver's matrix mapping** unless the architect rules otherwise. |
| **(f) constraints** | **The hybrid rule (`docs/specs/ui-overhaul.md`): *"the model is always Provident/serialized; only the mechanic is external — external code commits one managed write at gesture end, never a per-frame stream."* This row is where that rule is enforced.** `G-5`; `K-2`; `G-4`. |
| **(g) risk + falsifier** | **Risk: a projection swap that writes PER FRAME violates the hybrid rule** while staying node-green. **Named falsifier: the write count per re-derive is ONE** (instrument the applier's call count across a single pane-set change). |
| **(h) architect decision** | **NONE.** |

#### W5.2 — `PD-FOCUS-2`'s subset + the `S-7` closure-seam row

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Closing a tab still releases that tab's page state (its dirty flag, its failure record, its caret), so a re-minted tab id never inherits a closed tab's state. |
| **(b) foundation tool** | **CONTESTED — see (g).** The `W0` record says this row **"PROCEEDS on the landed `U-LISTHOST`"** (`owned-list-host.ts`); the inventory's §10 `S-7` row says the seam has **"no foundation counterpart"** and calls `focus-model.ts`'s `onChange`/`persist` ***"closer but not equal"***. **The unit's own gate must settle which mechanism it composes on — the plan does not choose.** |
| **(c) artifacts + importers** | `src/renderer/tab-strip.ts` → `notifyTabClosed`, `drainClosedTabIds`, `TabStrip`, `TabStripContext`, `TabStripOptions`. `TabStrip` itself is **`NOT-IN-SCOPE (KEEP)`** — the strip is shell chrome that `W2-Q12` resolved as not-dispatchable. **`PD-UI-11` stays `KEEP` on the replaced reason.** |
| **(d) test surface** | `tests/unit-u-shell-9a-main-focus-tabs.test.ts` + `tests/page-commit-tab-ownership.test.ts` + `tests/page-commit-scope-ack-race.test.ts` — **`REWRITE` for the closure-seam rows; the render rows `KEEP`.** **The page-commit family's `KEEP` files must stay green EDITED-NOTHING** (ledger W5 row). |
| **(e) LIVE instrument** | **RE-PIN `U-2` or extend `uf_tabs_3`** (`U-8`, *"closing the LAST tab yields the default page"*) — extended: `uf_tabs_7`. **No new matrix slot.** |
| **(f) constraints** | **`DECIDED: PAGE-STATE-OWNED-BY-THE-TAB`** (*"close drops exactly the closed subjects"*); `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` (**the model may carry NO vocabulary** — `'tab'`/`'pane'`/zone/region may not appear as a symbol, union member or default); `G-5`; the `KEEP` rulings on `PD-UI-11`/`PD-FOCUS-2`. |
| **(g) risk + falsifier** | **Risk: the closure seam touches the `U-STAGE-ACTIVE-TAB` landed behaviour** (the page-commit subject key IS the active tab id). **Second, sharper risk: the two records disagree about the mechanism** (`owned-list-host` vs "no counterpart") — **an adoption composed on the wrong mechanism is a silent behaviour loss under `G-7`.** **Named falsifier: closing a tab drops EXACTLY that tab's dirty flag, failure record and page caret, and nothing of a sibling's** — with a second live reading that the strip still renders and a page-commit still commits after the change. |
| **(h) architect decision** | **ONE, and it is a routing question:** which mechanism the seam composes on — `owned-list-host.ts` (the `W0` reading) or `focus-model.ts`'s `onChange`/`persist` (the inventory's reading) — **or whether the seam stays fork-local with a written zero-row adoption rationale** (the inventory's own rule for no-adoption rows). **The plan flags it; it may not be routed to the spec gate silently, because the two records assign different foundation modules.** |

---

### 5.5 UNIT ROWS — W6a (declaration structure), then W6b (the cutover)

#### W6a.1 — `PD-UI-13` (the minted markup/declaration row)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | None yet — the shell's regions and grid geometry are declared as a structure the app owns, **while the existing empty-zone collapse keeps working exactly as it does today**. |
| **(b) foundation tool** | **`none — fork work` for the region markup** (its subject has **NO foundation counterpart**: the region-host half is DECLINED — `SCH-1`, `S-d2`/`S-d14`/`H-r17`/the `Q6` answer). The **only** foundation relation is the declaration WRITE SITE `U-CONTAINER` supplies, which is `PD-UI-3`'s work. |
| **(c) artifacts + importers** | `src/renderer/index.html` — the grid/track CSS + the region declaration markup + the empty-track collapse rules + the gutter declarations + the region markup elements + the three app mount roots. **Consumers by selector**: `renderer.ts`, `sidebar-panes.ts`, `tab-strip.ts`, `modal-state.ts`, `pane-gutter.ts`, `pane-drag.ts`. **10 test files read `index.html`.** |
| **(d) test surface** | **`REWRITE` where the suites pin selectors/grid-areas; `KEEP` where they pin untouched app CSS** — **per-file re-derivation is THIS row's own spec-gate obligation (`X-3`), never inherited.** **`W6a` removes NO node-side rows** (`A-6`: the structure lands while the old collapse still functions). **0 whole-file archives.** |
| **(e) LIVE instrument** | **NONE for `W6a` — and that is the design.** The mandatory pre-live leg (`npm run divergence`, now `R13 RESULT: 9 checks, 0 failures`) must be run and recorded as the unit's precondition. **The 10 `index.html` readers must stay green.** |
| **(f) constraints** | **`A-10`'s binding constraint: the region boxes STAY fork-authored markup; NO region host is proposed and none may be EMULATED UNDER ANOTHER NAME** — and a mirror-class taxonomy (`is-empty`/`is-minimized`/`is-revealed`) grown inside the adopted `U-SLOTHOST` host **resurrects the DECLINED half** (`H-r15` forbids exactly that re-merge). **`UI-RENDERED-WITH-PROVIDENT`** (the declaration work must not author chrome CONTENT outside the graph). `DECIDED: LAYOUT-IN-CSS`. `G-9` (`index.html` is not in the pin set, but `renderer.ts`/`sidebar-panes.ts` are). |
| **(g) risk + falsifier** | **`R-1`: `index.html`'s markup and its grid/track CSS are ONE unit of meaning — a half-landing reds the live collapse while every node gate reports GREEN (`RCA-12`).** **Named falsifier: the PRE-`W6b` reading — the live `U-5`/`uf_layout_10` row is UNCHANGED from its pre-`W6a` disposition** (the structure landed without changing behaviour), taken BEFORE the cutover commit. |
| **(h) architect decision** | **NONE** — `A-6`/`A-10` are the rulings. |

#### W6a.2 — `PD-UI-3` (the re-admitted `U-CONTAINER` BUILD)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | None directly — the regions and panes gain the containment declaration the app never had, so heavy content inside a zone can no longer force a layout/paint of its siblings. |
| **(b) foundation tool** | **`src/shared/container.ts`** → `containerDeclarationFor` (returns `{className, declaredText}`, `declaredText` the literal `contain: layout style paint`), `tokensFor`, `orientationFor`. |
| **(c) artifacts + importers** | `src/renderer/index.html` — **the write site `U-CONTAINER` owes.** `VERIFIED-BY-READ` at this pass: `containerDeclarationFor`/`tokensFor`/`orientationFor` have **zero callers** in `src/**` and `contain:` occurs **only inside the vendored `src/shared/container.ts`.** |
| **(d) test surface** | **`NEW BUILD` — nothing to archive** (there is no container module in the fork; `C-2` measured `contain:` = zero matches outside the vendored file). The red set is **this unit's own**. |
| **(e) LIVE instrument** | **Extended (non-matrix) results only** — the matrix is full. A `D-visual` claim needs a **PAINTED/rendered-box oracle** (`D-GP-UFA-2`); a containment declaration has **no user-visible end state of its own**, so the honest evidence is (i) the authored/declared text asserted at the `[T]` layer **and** (ii) a live reading that the zone geometry is UNCHANGED. **The plan recommends recording this unit's live evidence as the `W6b` cutover's own reading, not a separate row.** |
| **(f) constraints** | `G-7` (**`tokenFn` and `axisResolver` are both REQUIRED**; supplying neither yields the declared empty answer `undefined` with zero invocations — a silent behaviour loss); `A-10` (no region host emulation); the project-wide UI constraint. |
| **(g) risk + falsifier** | **Risk: a `contain:` declaration applied too broadly changes PAINT and hit-testing** on a real renderer while every node row stays green — exactly the class `RCA-12` exists for. **Named falsifier: the live `U-5`/`uf_layout_10` geometry reading is IDENTICAL before and after, and the gutter gestures (`user7_zone_resize`) still hit-test.** |
| **(h) architect decision** | **NONE.** |

#### W6a.3 — `PD-ZONES-2` (the grid/track CSS + the pure-CSS empty-track collapse)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Unchanged in `W6a` — the empty-track collapse keeps working; the collapse RULES are prepared to be replaced by computed track variables. |
| **(b) foundation tool** | **`src/shared/zones.ts` → `isEmpty`/`trackFor` + `src/shared/census.ts` → `computeTrackVars`** (the row's `Replaces` cell). |
| **(c) artifacts + importers** | `src/renderer/index.html` — the `#app` grid declarations, the five `grid-area` selector rules, the five `:has(.is-empty:not(.is-revealed))` collapse rules, `#app [id="zone:sidebar"] { display: none }`. The class mirror is written by `sidebar-panes.ts` (`syncZoneMirrors`). |
| **(d) test surface** | **`REWRITE`** — the three named suites (`renderer-empty-zone-track`, `unit-u-shell-1-layout-zones`, `unit-u-shell-1-w2n4-operator-grid-area`). **A recorded caveat a later pass must carry:** `unit-u-shell-1-w2n4-operator-grid-area.test.ts` imports `layout-state.js` **NOT AT ALL** — it is a **pure `index.html`-text pin** (it asserts a **removed dead `grid-area: right` rule**) and **must not be folded into the `layout-state` change set.** |
| **(e) LIVE instrument** | **RE-PIN `U-5`** (`uf_layout_10`) — **and the matrix's `U-5` is currently UNVERDICTED**, so this unit's live evidence is **blocked on the driver's matrix mapping** (§3.3). |
| **(f) constraints** | `G-5`; the project-wide UI constraint (**the collapse RULES are a mechanism; the zone-name selectors and the topology are app chrome and stay**); `G-4`'s scoping ruling; `DECIDED: LAYOUT-IN-CSS`. |
| **(g) risk + falsifier** | **Risk: the CSS collapse works because TWO mechanisms AGREE (the JS class mirror + the CSS `:has`). Removing either half ALONE produces a LIVE-ONLY regression** (`EMPTY-ZONE-TRACK-NOT-COLLAPSED`'s recorded cause: the `:has(...)` rules must target the grid element ITSELF; a rule on an ancestor frame is only inherited and loses to the base declaration). **Named falsifier (`U-5`): `gridTemplateColumns` reads `0px` for the empty zone on BOTH sides of the swap and `zone:main` reclaims the width** — read with the class mirror AND the track value together. |
| **(h) architect decision** | **NONE.** |

#### W6b.1 — the CUTOVER (the cutover half of `PD-UI-13`)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | The empty zone still collapses and the stage still reclaims the space — now driven by the computed track variables rather than by the CSS `:has` rules. |
| **(b) foundation tool** | `src/shared/zones.ts` + `src/shared/census.ts` + `src/shared/layout-projection.ts` (the `W2`/`W6a` adoptions, now actually DRIVING the collapse). |
| **(c) artifacts + importers** | the same `index.html` markup; **the cutover is ONE commit** and the old collapse rules are removed in it. |
| **(d) test surface** | **`NONE node-side` — and that is the ruling:** *"the red instrument is the **LIVE `U-5`/`uf_layout_10` row, NEVER a node row**"* (`A-6`). |
| **(e) LIVE instrument** | **`U-5` / `uf_layout_10` IS the red instrument.** **The unit MUST run the mandatory pre-live leg first** (`npm run divergence` — now green, `R13 RESULT: 9 checks, 0 failures`; the leg was RED at the head that wrote `A-6`, so the unit's DONE row must record **which** reading it used). **A live pass that cannot run must be reported `PRECONDITION-FAILED` with the reading attached, NEVER silently parked (`RCA-11`).** |
| **(f) constraints** | `G-5`; `A-6`; **`DECIDED: LIVE-GATE-RUN-DISCIPLINE`** (isolated ports; boot-and-connect confirmed first; a matrix report with no verdict per declared row is INVALID; a live FAIL is EVIDENCE split by layer before disposition); `RCA-11` clause (a). |
| **(g) risk + falsifier** | **THE HIGHEST-CONSEQUENCE RISK IN `W6`: a half-landing is a live regression EVERY NODE GATE REPORTS GREEN** (`RCA-12`: the dom-shim is layout-less/CSS-less). **Named falsifier (`U-5`): `gridTemplateColumns` reads `0px` for the empty zone on BOTH sides of the swap and `zone:main` reclaims the width** — plus the `U-4` mount falsifier if the cutover touches the root set: **`#wiki-root` count exactly 1, no stale childless root, `scrollHeight` unchanged across the transition.** |
| **(h) architect decision** | **NONE** — but see §7: the *"fix the driver's matrix mapping first"* decision determines whether this row's evidence is READABLE at all. |

---

### 5.6 UNIT ROW — W7 (`PD-REGION-2` / `PD-UI-10`)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | Importing / re-assembling the app never leaves a giant blank region below the content and never pushes the stage off-screen — the stale mount is reconciled by the foundation's mount invariant rather than swept by hand. |
| **(b) foundation tool** | **`src/shared/mount-invariant-guard.ts` → `probeMountInvariant`, `assertMountInvariant`, `MountExpectation`, `MountViolation`** (a **PURE READER**) **PLUS the foundation's own fix `reconcileMount()` called from `tearDownGraph()` in the FOUNDATION's `src/renderer/runtime.ts` — which is NOT one of the fifteen vendored modules** (`C-7`/`V-3`; `VERIFIED-BY-READ` in the lock: no `reconcileMount`). |
| **(c) artifacts + importers** | `src/renderer/runtime.ts` → `tearDownGraph`'s `#wiki-root` sweep. `src/**` holders of a `Runtime`: `renderer.ts`, `sidebar-panes.ts`; the sweep itself is module-private. **`K-3`: both fence files import `src/renderer/runtime.js`.** |
| **(d) test surface** | `tests/unit-live11-bridge-seams.test.ts` — **PROTECTED** (census-pinned by name) → **keep it green WITHOUT editing its name**; the multi-mount rows are `REWRITE` candidates **only after the census pin is re-stated by its owning unit**. The four other `unit-stage-active-tab-display*` files + `runtime-host`/`runtime`/`runtime-battery`/`blind-runtime-host`. **`K-3`'s two fence files must stay green UNEDITED, or the fence re-enters the gate.** **0 whole-file archives.** |
| **(e) LIVE instrument** | **RE-PIN `U-4`** (`uf_layout_10`, *"empty↔filled pane-set transition leaves exactly ONE `#wiki-root` mount (F-2)"*) — **`U-4` is one of the six UNVERDICTED rows**, so this unit's live evidence is blocked on §3.3. Also the **named instrument rows**: `uf_mount_diag` / `uf_mount_leak_diag`, and the parked-carrier block `stage_multimount_reachability`. |
| **(f) constraints** | **The sweep must not be removed before that port lands** (`C-7`); `K-3`; `G-9` (the O-0 hook-contract pins include a `.record(...)` wrapper over `runtime.ts`); `G-6` (**the node suite is BLIND to this defect**). |
| **(g) risk + falsifier** | **Risk rank 1 in the architect's ranking (`PD-UI-10` first: *"a wrong landing is invisible to node"*).** Defect `STALE-MOUNT-PUSHES-CANVAS` is **FIXED + LIVE-CONFIRMED** and would **regress at the ASSEMBLED layer ONLY.** **Named falsifier (`U-4` + `uf_mount_diag`/`uf_mount_leak_diag`): `#wiki-root` count exactly 1, no stale childless root, and `scrollHeight` UNCHANGED across the transition.** |
| **(h) architect decision** | **NONE** — **but the plan states the one thing that is NOT a decision: the port is not a file copy.** The foundation's `reconcileMount` is a **diff against a different `runtime.ts`**, and this repo's `runtime.ts` is its MCP-facing producing process (~2 000+ lines). **The unit owes its own spec for HOW the port is expressed** — a spec obligation, not an open ruling. |

---

### 5.7 UNIT ROWS — W8 (main-process, PARALLEL-SAFE with W2–W7)

#### W8.1 — `PD-UI-9` (`PD-MENU-1`)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | The native application menu is built from the same data as before, with the app's own pane ordering preserved — the builder itself becomes the foundation's. |
| **(b) foundation tool** | **`src/shared/menu-template.ts`** → `normalizeCatalog`, `buildMenuTemplate` (**the renamed, consumer-agnostic symbol**), `selectCatalogItem`, `CatalogEntry`, `MenuTemplate`, `ProjectedItem`, `PlatformProjection`, `TemplateOptions`. |
| **(c) artifacts + importers** | `src/main/app-menu.ts` → `normalizePaneCatalog` **DELETE**, `buildMenuTemplate` **DELETE → the foundation's** (a **NAME COLLISION**, `C-9`); **`orderPaneCatalog` KEEP** (pane ordering is app policy); **`importSelectionFromDialog` + `IMPORT_DIALOG_FILTERS`/`PROPERTIES` KEEP** (`menulib.md` §2.1 item 1: the picker is INJECTED, not owned — *"import semantics stay fork-side"*). **Exactly 1 `src/**` importer** (`src/main/main.ts`), which keeps `Menu.buildFromTemplate`/`setApplicationMenu` + the `dialog.showOpenDialog` arms as the **host seam**. |
| **(d) test surface** | `tests/unit-u-import-1-import-surface.test.ts` + `tests/unit-u-menu-1-application-menus.test.ts` — **REWRITE for the normalizer/builder rows; KEEP for the ordering + import-selection rows.** **0 whole-file archives.** |
| **(e) LIVE instrument** | **The native menu is OS-owned and NOT MCP-exercisable** — `docs/pending.md`'s `Unit U-IMPORT-1` park records it. **So this unit's live layer is a recorded structural park WITH its reason (`RCA-11` clause (b)), never parked-by-default.** **A `[U]` re-pin is NOT admissible here**: the menu is shell chrome outside the reachable driver surface. The unit owes a **`[T]`-layer red set + the trio + `npm run battery`**. |
| **(f) constraints** | `G-7` (the `picker` OPTIONAL seam + the `platform` VALUE: **no picker closure ⇒ the picker item is emitted DISABLED ON DARWIN and `selectCatalogItem` ⇒ `null`**); the shell-chrome carve-out (the native menu is the exception named in `AGENTS.md`); `K-6` (**a wave needing test-timeout headroom cannot buy it here**). |
| **(g) risk + falsifier** | **Risk: `U-MENULIB`'s emitted object carries EXACTLY SEVEN own keys and the builder imports NEITHER `electron` NOR `fs`** — the fork's `app-menu.ts` must not leak an `electron` type into the shared builder. **Named falsifier: the emitted template's own-key set is exactly seven in a red row, and `src/main/app-menu.ts` carries no `electron` import on the shared-builder path.** |
| **(h) architect decision** | **NONE.** |

#### W8.2 — `PD-UI-8` / `PD-FOCUS-3` (the `provident.focus` row)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | An agent (or the app) asking to focus a target opens it or activates the tab that already holds it — a repeat request no longer creates a duplicate tab. |
| **(b) foundation tool** | **`provident.focus`'s declared shape `{ target?: string, newTab?: boolean }`** + (for the semantics) **`src/shared/focus-model.ts` → `focusTransition`, `focusOrder`, `focusIndex`, `persist`**. |
| **(c) artifacts + importers** | `src/main/mcp-server.ts` → the `ALL_TOOLS` member `'provident.focus'`, its registration row, its handler (`backend.invoke('focus', args)`); `src/main/security.ts` → the `TOOL_GROUPS` row; `src/shared/types.ts` → the `RpcMethod` member `'focus'`; the renderer's `case 'focus'` answer. **`K-4`: `tests/unit-u-shell-9a-main-focus-tabs.test.ts` must be rewritten IN THE SAME COMMIT, with a red set naming the refusal for BOTH dropped shapes.** |
| **(d) test surface** | **`REWRITE`** — every suite that pins the fork's `inputSchema`/description. `tests/unit-u-shell-9a-main-focus-tabs.test.ts` (the `tabId`-drop pin) is **PROTECTED-BY-SUBJECT** and **rewritten in the same commit**. **0 whole-file archives.** |
| **(e) LIVE instrument** | **RE-PIN / extend `user1_tab_new`** — **the block `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` names as exercising the OLD policy, and one of the 32 APP-layer FAILs.** **A LIVE row is MANDATORY for this unit, not optional:** the app-level repeat open is *"an assembled-surface property that no node green can see"* (the decision row's own clause (3)). |
| **(f) constraints** | **`DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT`** — `tabId` DROPPED; `target` re-typed; **the census is a same-commit NAME-SET equality, not a count** (`ALL_TOOLS` = 58; the member's continued presence, its `RpcMethod` member, and its **absence from `MUTATING_METHODS`**); **a same-commit amendment to `docs/specs/mcp-endpoint.md` §3 is owed** (which carries **no focus row at all**). **`DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS`** — activate-matching, append nothing; **the model may carry NO vocabulary**; `TabState.order` survives as a permutation carrier; the fork's coercions, `TabTarget`/`TabEntry`/`TabSearchParams` and the persisted shape **stay fork-side**. |
| **(g) risk + falsifier** | **Risk: a breaking, caller-visible MCP surface change across a pinned live surface**, and the sharper risk named by the decision itself — **"the fork's `TabTarget` is a 5-kind discriminated union; a reducer swap is safe ONLY IF the fork keeps its own target type and passes it through opaquely. If the rebuild 'simplifies' the union to a string, it breaks `unit-u-shell-9a-main-focus-tabs` + 16 sibling suites AND the live `data-target-kind` probes."** **Named falsifier (the repeat-open arm): a SECOND open of the same target yields the SAME entry — one tab, the existing id — read LIVE; plus the refusal arm for both dropped shapes (`tabId`, an object `target`).** |
| **(h) architect decision** | **ONE, and it is a sequencing question:** whether the `docs/specs/mcp-endpoint.md` §3 amendment lands **in the same commit** (the decision's own words) **or** as a declared same-pass companion. **The plan reads it as same-commit; if the architect intends otherwise, that is a new ruling.** |

---

### 5.8 THE UNASSIGNED ROW — `PD-UI-7` / `PD-FOCUS-1` (no wave owns it)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | A repeat open of a target the app already has **activates that target's tab and adds no second tab**; a close/reorder still performs the fork's permutation semantics. |
| **(b) foundation tool** | **`src/shared/focus-model.ts`** → `focusTransition`, `focusOrder`, `focusIndex`, `persist`, `FocusState`, `FocusEntry`, `FocusVerb`, `FocusRefusalCode`, `FocusId` — **the reducer only**. |
| **(c) artifacts + importers** | `src/renderer/tab-state.ts` → `focusTarget` **DELETE** (replaced by the model's `open`/`activate`/`close`/`next`/`prev` verbs + its own `===`-on-target activation); `targetEquals` a **DELETE candidate**. **`TabTarget`'s five kinds, `TabSearchParams`, the coerce/version/landing rules and `openTab`/`closeTab`/`reorderTab`/`ensureFirstTab`/`nextQueryId`/`resolveDefaultTarget` are KEEP** (app policy; `W2-Q11`'s resolution). **4 `src/**` importers; 17 `M-static` test importers (mostly `import type` — `KEEP`, and an `ARCHIVE` or even a `REWRITE` of a type-only importer would churn a file whose subject no mechanism supersedes).** |
| **(d) test surface** | **`REWRITE` for the `focusTarget`/`targetEquals` rows; `KEEP` for the 17 importers' TYPE usage.** **NOTE the pre-existing reds: `tests/unit-stage-active-tab-display-contract-holes.test.ts` carries `H-1`/`H-1b` and `H-2` RED — pre-existing, NOT caused by this unit; record them before the first edit.** |
| **(e) LIVE instrument** | **A LIVE row is MANDATORY** (the decision's clause (3)) — and **`user1_tab_new` is the named carrier, currently a FAIL.** **No new matrix slot**; the assertion enters as a re-pin of `U-8`'s neighbourhood or as an **extended row**. |
| **(f) constraints** | `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` (all four clauses); the model's **vocabulary ban**; `G-5`; `K-4`; `DECIDED: PAGE-STATE-OWNED-BY-THE-TAB` (the page-commit subject key is the active tab id, so a focus-model change touches landed page-commit behaviour). |
| **(g) risk + falsifier** | **Risk: the row's ruling has LANDED while the row is in NO wave — so its work can be picked up by a pass that has not sequenced it against `W5`'s closure seam or `W8`'s tool row, and the three rows share `tab-state.ts`/`tab-strip.ts`/`mcp-server.ts`.** **Named falsifier: the repeat-open arm read LIVE (one tab, the existing id) plus `TabState.order` still a permutation over the entries that exist.** |
| **(h) architect decision** | **YES — THE WAVE ASSIGNMENT.** The disposition ledger states it as an **UNVERIFIED** item explicitly: *"its wave assignment is unstated in the re-issued §4.5 table — what would settle it: the architect assigning `PD-UI-7`/`PD-FOCUS-1` to a wave."* **Cost and shape in §7.** |

---

### 5.9 THE APP-LAYER GAP WORK — the units that do not exist yet

**These are the findings this artifact exists to carry.** The §3 table names user-visible defects with
**no owning row**. Each is minted below as a **proposed** unit id — proposed, not decided: minting a
program row is the architect's act (the `X-4` precedent: `PD-UI-13` was minted only when a gate
finding recorded that no unit owned a wave's deliverable).

| Proposed id | The user-visible symptom it owns | The record that grounds it | **(g) risk + falsifier** | **(h) architect decision** |
| --- | --- | --- | --- | --- |
| **`GAP-1` `PD-CENSUS-RENDER-COHERENCE`** | **S-1** — the census says a pane is enabled while no frame renders it; in modal-open / zone-minimized states the census reads `frames=0` and the controls read `path=missing` | `docs/defects.md` `LIVE-APP-PANE-CENSUS-RENDER-MISMATCH` (group (a), HIGH) | **Risk: this is the app's OWN reconciliation invariant, and it is the class that produced the largest single pile.** Falsifier: for a given enabled set, the `.pane-frame[data-pane-id]` set **equals** the census set — read LIVE, with the modal open and closed and with a zone minimized. | **YES:** whether this becomes a program row **before** the wave order (`GAP-1` first) or **after `W7`**. **Cost either way in §7.** |
| **`GAP-2` `PD-STAGE-ASYNC-MOUNT`** | **S-4** — a pending async mount overwrites a newer tab's stage; a doc-nav click inside the window leaves a search tab with no surface | `STAGE-RACE-ASYNC-MOUNT`; `UF-STAGE-AT-8 DOC-NAV-CLICK-NEVER-ACTIVATES-A-DOCUMENT-TAB` (both OPEN, both with recorded root causes) | **Risk: the fix home is `src/renderer/sidebar-panes.ts`, which SEVEN program rows share.** Falsifier: with a search mount in flight, opening a document tab leaves the stage on the DOCUMENT (body + page-edit surface present). | **YES:** the file-collision ruling — which pass may edit `sidebar-panes.ts` for this, given seven rows share it. |
| **`GAP-3` `PD-HISTORY-IN-PANE`** | **S-7** — the history surface is neither a dropdown nor in a pane; it consumes document space permanently | `LIVE-UF5 HISTORY-IN-MAIN-CANVAS`; `HISTORY-NOT-DROPDOWN` (both OPEN) | **Risk: this is a `PANES`-capability row with no wave.** Falsifier: `[data-role="history"]`'s DOM ancestry contains a `.pane-frame`, and a real disclosure click collapses it. | **YES:** mint as a program row, or route to the `U-EDIT-2` history sub-pane the defect proposes. |
| **`GAP-4` `PD-PANE-DRAG-PROJECTION`** | **S-10** — a dragged pane can only move to the TOP of its zone; the drop never lands between two panes | `PANE-DRAG-TOP-ONLY` (`N3`, OPEN); `PANE-DRAG-NO-COMMIT`; `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` (OPEN) | **Risk: `PD-UI-4c` adopts the session and explicitly does NOT fix this — a unit that reports it fixed on the strength of the swap is a FALSE GREEN.** Falsifier: drag pane A between B and C → order becomes `B,A,C`; and a disclosure toggle leaves the pane's slot index UNCHANGED. | **YES:** absorb into `PD-UI-4c` (`W3`) or mint separately. |
| **`GAP-5` `PD-SETTINGS-CONTENT-COHERENCE`** | **S-5** — the settings modal's contents rows (`uf_settings_4`, `uf_settings_7`) fail while the modal unit's own live claims pass | `LIVE-APP-PANE-CENSUS-RENDER-MISMATCH`'s row list; `PANE-VISIBILITY-IRREVERSIBLE` (OPEN, with a user ruling attached) | **Risk: `PD-UI-6` is DONE and its four live rows PASS — so a naive reading concludes the modal is fine.** Falsifier: the enabled-panes census is populated at first render, PAINTED, and **agrees with the rendered frames** (the `uf_settings_4` clause verbatim). | **YES:** the user's recorded ruling on pane visibility (*"remove the pane-visibility option from the UI … author the app-graph panes as always-enabled"*) is a **product decision** the defect row records and no unit owns. |
| **`GAP-6` `PD-BOOT-PERSISTENCE-COHERENCE`** | **S-12** — the landing / persisted pane set: first boot shows the wrong pane set, and the persisted set does not govern the rendered frames | the group (a) list (`boot_landing`, `vis_persist`, `uf_panes_10`) + group (b)'s *"FAIL while naming no failing clause"* | **Risk: two of the three rows' evidence is not self-sufficient (no failing clause printed).** Falsifier: a fresh first boot shows exactly `['search','doc-nav']` as enabled AND rendered, with the persisted set authoritative afterwards (`DECIDED: FIRST-RUN-ENABLED-DEFAULT`). | **YES:** whether the first-run pin's **re-derivation** (currently owed to `C11 U-SEARCH`, a unit not in any Phase-1 wave) is pulled into this program. |
| **`GAP-7` `PD-DRIVER-MATRIX-AND-EVIDENCE`** | **the driver-side defects that make every future live verdict unreadable** — the matrix mapping; the empty/clause-less evidence; the scenario drift; the order/persistence artifact | `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE` (HIGH); `LIVE-DRIVER-EVIDENCE-LOSS`; `LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`; `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT` — **all with the live-driver's owning unit named** | **Risk (recorded by the row itself): `reconcileMatrixRows` can print `OK` for a report that does not return a verdict per declared row — "an INVALID report is worse than a missing one: it reads as a pass."** Falsifier: `matrixRowsExecuted` equals `MATRIX_ROWS.length` (8) in full-battery mode, and `reconcileMatrixRows` REFUSES to print `OK` when a declared row lacks a verdict, **naming the rows it lacks**. | **YES — and this one is SEQUENCING-CRITICAL:** fix it **before any later UI wave** so live verdicts are readable (§7). |
| **`GAP-8` `PD-LIVE-FIXTURE-PRECONDITIONS`** | **S-1's fixture half** — `gnosis_*` rows FAIL against an absent engine; the `o0_*` diagnostics read a census mismatch | `LIVE-FIXTURE-PRECONDITION-GAPS` (owner: the harness/engine unit) | **Risk: the driver's precondition handling does not cover its OWN fixture requirements** — so rows FAIL against an absent surface instead of being refused/parked. Falsifier: the driver parks/refuses those rows unless a running engine is present and the corpus fixture is seeded, **with the refusal naming which fixture is missing**. | **NONE** — the owner and the fix shape are already recorded. |

**A note on `GAP-*`'s live evidence.** **None of these may add a matrix slot.** Their assertions enter
as **re-pins of the eight declared rows** (`U-1`..`U-8`) or as **extended (non-matrix) results**
reported in the separate same-shape table `D-GP-UFA-4` requires. **The `S-1`/`S-5`/`S-12` classes in
particular span `uf_panes_*`/`uf_settings_*` rows that are NOT matrix rows at all** — which is exactly
why they can carry verdicts without touching `MATRIX_ROWS`.

---

### 5.10 UNIT ROW — W9 (tracker + archive closure)

| Field | Value |
| --- | --- |
| **(a) user-visible behaviour** | None — this is the program's own bookkeeping. |
| **(b) foundation tool** | `none — fork work`. |
| **(c) artifacts** | the active trackers (`docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`, `docs/HANDOFF.md`); every citation pointing at a moved/archived file; the `SUPERSEDED` rows still owed. |
| **(d) test surface** | **the archive close-out** — the **before → after** file/row/skip reading per unit, the coverage-hole record, and the repointed citations (`REBUILD-ARCHIVE-POLICY` clauses (2)/(3)). |
| **(e) LIVE instrument** | None — **not a code gate** (§4.5's own `W9` cell). |
| **(f) constraints** | `REBUILD-ARCHIVE-POLICY`; `AGENTS.md` item 6/10d; `RCA-6`. |
| **(g) risk + falsifier** | **Risk: a citation left pointing at a moved path** (the archival loop's own rule: *"never leave a citation pointing at a moved file"*). **Falsifier: every `tests/**` path cited by an active tracker RESOLVES, and `archive/tests/` holds exactly the recorded set (41 + the `PD-UI-6` archive = 42).** |
| **(h) architect decision** | **NONE.** |

---

## 6. THE LIVE-DRIVEN LOOP — how a unit's evidence is now taken

**Layer of this section:** DOC-LAYER description of a route whose readings belong to the runner. It
introduces no mechanism; it restates `DECIDED: LIVE-GATE-RUN-DISCIPLINE`, `RCA-11`,
`D-GP-UFA-1..4` and `G-5`.

**The route, in order. Every step is mandatory; skipping one invalidates the reading.**

1. **The pre-live leg.** `npm run divergence` (`VERIFIED-BY-READ`: `npm run build && node
   scripts/electron-divergence.mjs`). **The reading must be quoted as `R13 RESULT: <n> checks, 0
   failures`, exit 0, with `<n>` RECORDED — never as "R13 passed", never with `n` omitted**
   (`docs/specs/unit-divergence-harness-precondition.md` §3.5). The current reading is
   **`R13 RESULT: 9 checks, 0 failures`, exit 0** `RECORDED READING (measurer: the implementer's T-1
   pass)`. **Layer: HARNESS `[D]` — a PRECONDITION, never evidence about the UI, and never app-green.**
   Its own residuals stand: the eight comparison rows are **DEMO-vs-SHIM**, and the app's own
   `wiki-root`/`zone:main` graph (*"app 32 vs shim 12"*) is looked at by **no** row.
2. **Boot-and-connect confirmed BEFORE driving.** Isolated MCP port + isolated CDP port; the run's own
   boot lines recorded (`[provident-mcp] http transport ready on http://127.0.0.1:<port>/mcp` ·
   `[provident-main] renderer ready — MCP backend armed` · `DevTools listening on ws://127.0.0.1:<cdp>/…`).
   **The standing hazard:** a concurrent sibling process holds CDP `:9222` and issues
   `pkill -f "electron \."` — **run 1 of the program's first battery was TRUNCATED AT BLOCK 82 by it,
   and a truncated/interrupted run proves NOTHING and must never be reported as a result.**
3. **The drive.** `node scripts/live-drive.mjs --port=… --cdp-port=…` (per-unit `--block=` isolation is
   the tool that exposed the order/persistence artifact — **use it whenever a single row's verdict is
   load-bearing**).
4. **The per-row readings.** Each row's verdict is recorded with its `path` (`cdp` /
   `native-fallback`), its `realInput`, its `evidence`, its `surface` — **`D-GP-UFA-3` makes
   `realInput`/`evidence` MANDATORY report fields**, and **a `native-fallback` path forces
   `pass:false`**; **a diagnostic block (returns `pass:true` unconditionally) may NEVER be promoted to
   a row verdict.**
5. **The matrix, and its INVALID caveat.** `§6.1 summary.total` is the `§5.U` matrix-row count
   (`U-1`..`U-8`), **never** the block count, and each declared row must carry a verdict
   (`D-GP-UFA-4`). **At this head the report returns only `2 of 8` declared rows and
   `reconcileMatrixRows` still prints `OK`** — so **a matrix report from this driver is INVALID until
   `GAP-7` lands**, and **`summary.pass`/`summary.fail` count ONLY the executed matrix rows and must
   never be read as app health.**
6. **The `[U]`-vs-`[T]` layer split, applied BEFORE any disposition.** Per
   `DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause: **a live PASS is ADDITIVE and APP-green ONLY and
   retires no `[T]`/node row; a live FAIL is EVIDENCE split by layer before any disposition.** The
   working split this breakdown uses: **`[U]`** = the assembled/rendered app surface (the app-layer
   pile, `S-1`..`S-14`) · **`[T]`** = the node/envelope layer (a live FAIL never reds it) · **`[D]`**
   = the divergence/harness layer · **DRIVER** = the runner's own scenario/report defects ·
   **FIXTURE/precondition** = a missing surface the app was never given · **DIAG** = a reading that
   can never be a verdict.
7. **What a unit's DONE row must therefore state.** (i) the **layer** of every reading; (ii) the
   **pre-live leg's** `R13 RESULT: <n> checks, 0 failures` reading; (iii) the **invocation** (ports);
   (iv) the **per-row** verdicts with their fields; (v) **`PRECONDITION-FAILED` with the reading
   attached** if the leg or the boot cannot run — **never a silent park**; (vi) the **`[T]`/`[U]`
   split** of any FAIL; (vii) **its delta against the carried baseline** (`G-1`).

---

## 7. OPEN DECISIONS FOR THE ARCHITECT

Each with its cost, stated in the currency the program actually pays (sequence, evidence
readability, or a re-opened file boundary). **None of these re-opens a standing decision; each is a
routing or sequencing call the records leave to the architect.**

1. **FIX THE MEASURED APP-LAYER PILE FIRST, OR CONTINUE THE WAVE ORDER?**
   **The case for `GAP-1` (`PD-CENSUS-RENDER-COHERENCE`) first:** the dominant symptom
   (*"the census says a pane is enabled while no frame renders it"*) is the app's **own
   reconciliation invariant**, it is the largest single FAIL class, and **every wave from `W5`
   onward produces its live evidence through the same rendered-frame surface the mismatch corrupts** —
   so a wave landed now has its live verdict read through a broken instrument.
   **The case for the wave order:** `W2` is a hard predecessor of `W5`/`W6a`/`W3`/`W4`, and the
   proposal's risk ranking puts `PD-UI-10` last for a reason that does not change.
   **Cost of the wrong call:** landing `W5`–`W7` against an incoherent census/render surface means
   their live rows cannot distinguish *"our change broke it"* from *"it was already broken"* — the
   exact ambiguity `RCA-12` exists to prevent. **Cost of doing it first:** the wave chain idles
   behind a unit that has **no spec, no red set and no owner** today, and `src/renderer/sidebar-panes.ts`
   is shared by seven rows — a change there before `W2` may have to be re-derived through those rows.

2. **THE PARKED `PD-OVERLAY-2` APPLIED-INERT HALF.** The row is minted and PARKED with **two named
   revisit conditions**: **(a)** a runnable live leg — **and that condition has now FIRED** (the leg is
   green at `R13 RESULT: 9 checks, 0 failures`) — **or (b)** a route ruled at the row's own gate.
   **The two routes and their owners differ:** route **(a)** `props: { inert: 'true' }` on an authored
   node — **owner the CONSUMER, layer the AUTHORED envelope `[T]`, evidence the node suite, needing NO
   live leg at all**; route **(b)** a shell-chrome `setAttribute`/`removeAttribute` write at the fork's
   own write site — **owner the consumer/shell wiring, layer the APP `[U]`/`[D]`.** **The attribute
   spelling and the background identity also belong to that gate.** **Cost:** route (a) is cheaper and
   `[T]-verifiable` but authors an attribute whose *name* no mechanism owns; route (b) is `[U]`-only and
   was previously unrunnable. **This is a live decision now, not a deferred one.**

3. **THE DRIVER'S MATRIX-MAPPING DEFECT — FIX BEFORE ANY LATER UI WAVE.** `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE`
   returns **2 of 8** declared rows and still prints `OK`; **six of the eight** (`U-2`..`U-6`, `U-8`)
   carry no verdict, **and `U-4`/`U-5`/`U-6` are precisely the rows `W2`, `W5` and `W6b` need as their
   red instruments.** **Cost of not fixing it first:** `W6b`'s cutover — whose ONLY red instrument is
   the **live** `U-5`/`uf_layout_10` row (`A-6`) — **cannot be evidenced at all**, and any unit that
   lands before the fix will have its live gate read through a report the standing discipline declares
   **INVALID**. **Cost of fixing it first:** it is a `scripts/**` change owned by the live-driver's own
   unit, which needs its own spec and red set; the wave chain waits on a non-renderer unit.

4. **THE ORDER/PERSISTENCE ARTIFACT IN THE BATTERY.** `LIVE-DRIVER-PERSISTENCE-ORDER-ARTIFACT`: the
   battery's blocks share ONE persisted UI state and **no block restores a state a previous block
   turned off** — so **a row's verdict depends on its POSITION in the battery as well as on the app**,
   and **`uf_panes_1` is a FALSE-FAIL today**. **The fix shape (two clauses, recorded with the row):
   (1) a block may not leave persisted state another block depends on; (2) a row whose verdict depends
   on battery order must DECLARE the dependency or RUN ISOLATED.** **Cost:** clause (2) multiplies run
   time and needs isolated ports per run; clause (1) requires re-deriving `persistence_v1`'s teardown,
   which touches the very persistence behaviour `GAP-6` is about. **Doing nothing costs the app pile's
   credibility: the recorded `32` is known to be at most `31`, and the row's own instruction is that
   the pile is to be CORRECTED, never INFLATED.**

5. **THE UNASSIGNED WAVE FOR `PD-UI-7` / `PD-FOCUS-1`.** Its `BLOCKED-ON-SEMANTICS` ruling **has
   landed** (`DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS`), **and no wave in §4.5's table owns it**
   — the disposition ledger says so in terms. **Cost of leaving it unassigned:** the row's own clause
   (3) obliges **a red set naming the repeat-open arm PLUS a LIVE row**, and its file (`tab-state.ts`)
   plus its two neighbours (`tab-strip.ts` at `W5`, `mcp-server.ts` at `W8`) form a tab chain that
   three different waves would otherwise touch in three different passes with no recorded order.
   **Cost of assigning it:** one more unit in a chain whose every unit already owes a spec, a red set,
   a live row and a DONE row.

6. **THE `S-7` CLOSURE SEAM'S MECHANISM — TWO RECORDS DISAGREE.** The `W0` record: *"the `S-7`
   closure-seam row / `PD-FOCUS-2`'s seam **PROCEEDS on the landed `U-LISTHOST`**"*. The inventory's
   §10 `S-7` row: *"**No foundation counterpart**; `U-FOCUS-MODEL`'s `onChange`/`persist` are **closer
   but not equal**"*. **Cost of composing on the wrong one:** under `G-7` a mechanism supplied the
   wrong seams yields the **declared empty/degraded** answer — **a silent behaviour loss** in the tab
   closure path, whose failure mode is a re-minted tab id restoring a CLOSED tab's caret against the
   new tab's document (`DECIDED: PAGE-STATE-OWNED-BY-THE-TAB` clause (3)). **Cost of ruling:** the
   architect must pick between the two readings, or rule the seam stays fork-local with a written
   zero-row adoption rationale.

7. **`PD-UI-4c` AND `N3`, AND THE `W3`/`W4` ORDER INVERSION.** Two sub-decisions: **(i)** does
   `PD-UI-4c` absorb the drop-projection fix, or is `GAP-4` minted? **The records are emphatic that
   the adoption does not fix `N3`** — so a unit reporting `N3` green on the strength of the session
   swap is a false green. **(ii)** this breakdown executes `PD-UI-4a` **before** `PD-UI-4b`/`4c`
   because §4.5's own `W3` cell demands it **while numbering it `W4`** — **if the architect intended
   the reverse (the substrate last), the two controllers fork the pointer lifecycle again, which the
   same cell names as the failure mode.**

8. **`PD-UI-5`'s LIVE FORM, AND `U-THEME-CONTROL`'s TAIL.** **(i)** The affordance BUILD's live claim
   is a `D-visual` claim and the matrix is full: **does it enter as an extended (non-matrix) result**
   (the plan's recommendation) **or fold into `U-3`/`U-5`'s re-pin evidence text**? **Cost:** an
   over-folded claim hides a build; an over-separated one adds a row the matrix cannot hold.
   **(ii)** `U-THEME-CONTROL`'s corrected disposition was `ABSENT → author-in-build` as `PD-UI-1`'s
   envelope work **or explicitly declined** — **`PD-UI-1` has landed and no theme control is claimed
   by its DONE row.** **Cost of leaving it:** a user-visible capability (`theme-control`) has neither a
   row nor a recorded decline.

9. **THE OWED `SPEC-AMENDMENT` PAIR ON THE APP-SIDE HARNESS UNIT.** Two filings are recorded with
   **the spec-writer** as owner and **not applied**: `SPEC-AMENDMENT-OWED-APP-ENABLEMENT-PREDICATE-DIVERGENCE`
   (`optedIn = requested.length > 0` vs the contract's `source === 'argv' | 'env'`) and
   `SPEC-AMENDMENT-OWED-APP-D3-READINESS-MEMBER-COUNT-DRIFT` (`§8 D-3` says four members; the shipped
   shape has five). **Cost:** they mis-state the shipped contract to any future row that reads it —
   **and the second is exactly the class `RCA-6` exists to catch.** Neither requires an architect
   ruling; both require **a pass that owns the spec**. **Surfaced here so the program's next
   spec-owning pass takes them.**

---

## 8. WHAT MUST NOT BE RE-DERIVED

**Stated as prohibitions, because each is a thing a future pass could plausibly re-open by accident.**

| # | Must not be re-derived | The authority |
| --- | --- | --- |
| **N-1** | **The `PROTECTED` set** — 10 artifacts (9 `tests/**` + `src/main/markdown-import.ts`), pinned by `P-1`..`P-6` in `tests/unit-v5-migration-contract.test.ts`, **plus the three non-test `R-`artifacts** (`vitest.config.ts`'s `testTimeout` bounded at `15_000`; `package.json`'s two test scripts; `docs/specs/ui-overhaul.md` as the Class-C corpus), **plus the pin file itself, `PROTECTED-BY-CONSTRUCTION`**. **A unit may not rename, remove, re-shape or re-point what it pins. It lands AROUND them or files an explicit pin re-statement with the pin's owning unit — never relaxes a pin.** | proposal §4.4/§6.3; ledger §4/§5 |
| **N-2** | **The collision table `K-1`..`K-7`** — `K-1` (the `layout-state.ts` four exports) is **the binding one**; `K-2` (the census name-set and `SidebarPanes`/`handleRagQueryIpc`); `K-3` (the two fence files and `runtime.js`); `K-4` (the `tabId`-drop pin); `K-5` (**the vendored-byte digests** — a NEW collision: **wrap, never patch**); `K-6` (`package.json` + `vitest.config.ts`); `K-7` (**recorded so a later pass does not "fix" the `theme.ts` stem collision — it is a checked, no-hit collision**). | ledger §5 |
| **N-3** | **The archived files** — `archive/tests/**` (**41** files at the 2026-09-21 pass, mapped 17 + 1 + 17 + 6 = 41 by owning unit, **plus** the `PD-UI-6` whole-file archive = **42**). **The archive is the REBUILD's INPUT, consulted as evidence of what the old pin COVERED, never as the source of a new contract; its assertions are NEVER copied back.** **No Phase-1 unit may re-propose any of the 41**, and **a file may not be restored except through its owning unit's gate cycle.** | `DECIDED: REBUILD-ARCHIVE-POLICY` clauses (1)-(4); ledger §6 |
| **N-4** | **The fence files** — `tests/traversal.test.ts` and `tests/import-render-no-duplicates.test.ts`: **exempt BY NAME; a fence edit RE-ENTERS THE GATE.** The single precedent (`DECIDED: FENCE-REPLAN-U-EDIT-1-CHILD-LIST-ROW`) is scoped to **one row in one file** and licences nothing else. | proposal §6.3; `A-7`/§14.2 |
| **N-5** | **The digest-pinned vendored bytes** — the fifteen modules at the manifest's recorded md5s, at `foundation.commit` = `d7b98b574adc7fa63fbabda617eba2a753f52cb5`. **A HEAD move is a PIN FAULT BY DESIGN met by ONE FOUR-SITE ATOMIC RESTATEMENT in its own unit — never a carry, never a partial restatement, never a revision-tolerant arm.** | `DECIDED: POST-DIVISION-REBUILD-FOUNDATION-PIN-REFRESH-AND-STANDING-REPIN-POLICY` clauses (a)/(b) |
| **N-6** | **The matrix cap** — `MATRIX_ROWS` is exactly eight (`U-1`..`U-8`); **live work enters as a re-pin, never a new slot**; the driver's own comment records *"MATRIX_ROWS must NOT change."* | `G-5`; `C-12`; `R-9`; `VERIFIED-BY-READ` in `scripts/live-drive.mjs` |
| **N-7** | **The engine half's `BLOCKED-ON-ENGINE` status** — 7 of 19 ids / 15 of 31 modules, unsatisfied conjunct = the parked ingest/record-copy route (`GR-6a`). **The engine ELIMINATION half is NOT in this gate's wave table;** only the six-item **ADDITIVE** set is executable, and it eliminates nothing. | proposal §4.3/§4.7 Phase 2; `G-3` |
| **N-8** | **The settled `PD-UI-12` boundary** — the region boxes **STAY fork-authored markup**; **the foundation DECLINED the region-host half; NO region host may be proposed or emulated under another name**, and a mirror-class taxonomy grown inside the adopted `U-SLOTHOST` host **resurrects the declined half** (`H-r15` forbids the re-merge). **`U-SLOTHOST`'s moved-half is EMPTY.** | `A-10`; `docs/specs/unit-pd-ui-12-slot-host-boundary.md` §9 `B-1`; inventory §2.1 `PD-REGION-1`'s `SUPERSEDED IN PART` note |
| **N-9** | **The four divergent baseline files** — `src/shared/dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts` are **not replaced** (the fork's are strictly larger; a wholesale replacement is **out of scope and would be a regression**). **Authoring INTO `demo-envelope.ts` is the work; replacing it is not.** | `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (2); `C-14`; the lock's `baselineFilesNotReplaced` |
| **N-10** | **The `MUST-NOT-MOVE` control-node list** — the pane collapse toggle, container minimize + tab list, doc-directory tree, advanced search, hover-preview, shared subtrees, the markdown/HTML toggle; the stage content's MCP visibility; the RAG layer and the pane registry. | proposal §3; `docs/specs/astrographer-scope-realignment-review.md` §4.1/§5.2 |
| **N-11** | **The KEEP rulings** — `PD-UI-11` (on the REPLACED reason: shell chrome not-dispatchable, **not** "the seams are absent"), `PD-FOCUS-2`'s `TabStrip` class, `PD-HOST-KEEP`'s module set, `PD-MENU-2`/`PD-MENU-3`, `PD-UI-12`'s deferral. **A spec gate may not re-open a `KEEP` row without the architect.** | proposal §4.1 `PD-UI-11`; `C-5`; `A-3`; `A-10` |
| **N-12** | **The foundation-side defects are HANDED OFF, never absorbed and never patched** — `overlay.md`'s unsatisfiable `removal === (value !== true)`; `gutter.md` §2.1's phantom `SizeFor` export; the foundation `mcp-endpoint.md` §3.8 declaring `provident.focus` absent while its code ships it; `zones.ts`'s callable-`get` check; `menu-template-greens.md`'s owed POST-GREEN re-drive. **A defective foundation clause is never a licence for a silent fork-side divergence.** | `G-8`; `AGENTS.md` item 7 |
| **N-13** | **The re-parent half of the modal, and the dedicated scrim.** `MODAL-SETTINGS-REPARENT` / `MODAL-DEDICATED-SCRIM` are ACTIVE, **and no clean adoption may ever be claimed for the re-parent half.** | `docs/decisions.md`; `overlay.md` §3.4 `R-12`/`P-OV-10` |
| **N-14** | **The `PD-VENDOR` conformance leg's green may NEVER be reported as a subset.** Its pass condition is recorded **VACUOUS AS EVIDENCE.** | the `PD-VENDOR` DONE row (`docs/next-steps.md`) |
| **N-15** | **The `UI-RENDERED-WITH-PROVIDENT` constraint itself** — even though (see §10) it is cited as a decision id without a home row. **The constraint BINDS; only its citation home is owed.** | `AGENTS.md` (project-wide constraint); proposal §3; `DECIDED: PANE-PROVIDENT-AUTHORING` |

---

## 9. `NOT RECORDED` — and what would settle each

| # | The silence | What would settle it |
| --- | --- | --- |
| **NR-1** | **`boot_landing`, `vis_persist`, `uf_settings_7`, `uf_panes_10`, `user6_search_no_flicker`, `repro_dup_para` carry NO per-row failing clause in the record** — the group (b) row says `boot_landing`/`vis_persist`/`toolbar_toggle` FAIL *"while naming no failing clause"*, and `repro_dup_para`'s evidence is **EMPTY**. **So the SYMPTOM of `boot_landing`/`vis_persist` (and therefore the symptom group they belong to, `S-12`) is UNVERIFIED by this pass.** | **A re-run whose per-row printing includes `surface.target` and the structured `§6.1` fields** — i.e. `GAP-7`'s fix (a report-shape fix, the live-driver's owning unit). **Until then, `S-12`'s symptom text is inferred from the block NAMES, and this file says so.** |
| **NR-2** | **The exact per-row evidence behind the 26 rows of `S-1` that the group row does not quote.** The group row quotes THREE examples (`search` enabled / `doc-nav` absent; `frames=0` with `path=missing`; `user8`'s 0-px seam; `user5`'s history outside frames) and lists 32 ids. **The per-id symptom of the remaining rows is NOT RECORDED in a form this pass could read.** | **The runner's full per-row output for the run** (the driver's own artifact), or a re-run with the fields printed. |
| **NR-3** | **Whether `user2_pane_drag`'s current FAIL is the `N3` drop-projection defect, a precondition change, or a regression of the F-1 fix** — the F-1 fix and its header-only gesture surface are **FIXED + LIVE-CONFIRMED**, and the block is recorded as **PARKING** when its own precondition (an in-viewport sibling) is unmet. **It now reads FAIL, and no record dispositions that change.** | **The block's own printed evidence on a re-run with the header in view** — and specifically whether the precondition was met (`path=missing` vs `path=cdp`). |
| **NR-4** | **`PD-UI-7`'s wave assignment.** The disposition ledger states it **UNVERIFIED** explicitly. | **The architect assigning it to a wave** (§7 item 5). |
| **NR-5** | **The matrix's `U-1` verdict's disposition.** The summary reads `{"pass":1,"fail":1}` over the two executed rows; the records do **not** state which of `U-1`/`U-7` passed. **This pass did not read the run's per-row matrix line.** | **The run's own `[live-drive] MATRIX rows (…)` line**, which the driver prints and which was not quoted into any doc. |
| **NR-6** | **`U-THEME-CONTROL`'s fate.** `C-15` corrected its disposition to `ABSENT → author-in-build` as `PD-UI-1`'s envelope work **or explicitly declined**; `PD-UI-1` has landed and neither is recorded in that DONE row. | **A reading of `PD-UI-1`'s unit spec (`docs/specs/unit-pd-ui-1-theme.md`) for a theme-control clause, or an architect decline.** This pass did not read that spec's body for this clause. |
| **NR-7** | **`UI-RENDERED-WITH-PROVIDENT`'s home row.** The id is cited in `docs/specs/unit-pd-ui-6-modal-state.md`, `docs/specs/pd-ui-6-adoption-dossier.md` and the inventory's `PD-OVERLAY-2` row **as a decision id**, but **no row of `docs/decisions.md` carries it** (`VERIFIED-BY-READ`: a grep for the id over `docs/decisions.md` returns no match). | **A `docs/decisions.md` row minting the id** (or a repoint of the three citations at `DECIDED: PANE-PROVIDENT-AUTHORING`, its nearest ACTIVE home). |
| **NR-8** | **The branch head `67af736` and the tree's cleanliness.** I was handed *"branch `post-division-rebuild`, clean at `67af736`"*. **This pass holds no shell, so it could not read `git status` or `git rev-parse`.** Every doc-level head in the records is older (`b6791e0`, `d7ae18e`, `7d3b55c`, `09f8c53`, `6010c1a`). | **`git rev-parse --short HEAD` + `git status --porcelain`** at the reviewing pass. |
| **NR-9** | **Whether a `tearDownGraph` rewrite reds either fence row.** The ledger states it **UNVERIFIED** (*"what would settle it: the W7 unit's own reported red set (this pass ran no suite)"*). | **`W7`'s reported red set.** |
| **NR-10** | **`PD-VENDOR`'s `readingAfterVendoring` figure.** The manifest's `baselines.npmTest` cell records it as *"recorded in this unit's DONE row"* — the value itself is not in the manifest. | **The `PD-VENDOR` DONE row in `docs/next-steps.md`.** |

---

## 10. WHAT I FOUND THAT CONTRADICTS THE STATE I WAS HANDED

**Reported, never smoothed.** Each item names whether it is a correction to the brief I was given or
an internal contradiction between two records.

**C-1 — `PD-UI-5` is not in the app-layer FAIL pile's settings group as `uf_settings_5`.** *(Correction
to the brief.)* The brief grouped *"the settings-modal contents rows `uf_settings_4/5/7`"*. The run's
FAIL list carries `uf_settings_4` and `uf_settings_7`; **`uf_settings_5` is the SCENARIO-DRIFT row**
(`LIVE-SCENARIO-UF-SETTINGS-5-EDITINGMODE-DRIFT`), which asserts the **SUPERSEDED** `editingMode`
vocabulary and *"can never pass"*, owner the live-driver's owning unit. **It is a DRIVER row and must
not be counted in the app pile.** `VERIFIED-BY-READ` from `docs/defects.md`.

**C-2 — the `W3`/`W4` numbering is inverted against its own dependency.** *(Internal contradiction,
already recorded by the program itself.)* §4.5 numbers `PD-UI-4b`/`4c` as `W3` and `PD-UI-4a` as
`W4`, **and its own `W3` cell requires `PD-UI-4a` to land first.** This breakdown honours the
dependency and keeps the labels; §7 item 7 surfaces the alternative reading.

**C-3 — `PD-UI-7` / `PD-FOCUS-1` has a LANDED ruling and NO WAVE.** *(Omission in the brief.)* The
brief's remaining-row list does not mention it. Its `§4.1` state (`BLOCKED-ON-SEMANTICS`) is
**stale** — the architect's ruling landed 2026-09-27 — while the disposition ledger states its wave is
**UNVERIFIED**. **This is a row that can be picked up by accident by any pass touching the tab chain.**

**C-4 — the `S-7` closure seam has TWO mutually inconsistent mechanism records.** *(Internal
contradiction.)* The `W0` record says it *"PROCEEDS on the landed `U-LISTHOST`"*; the inventory's §10
`S-7` row says it has **"no foundation counterpart"** and names `focus-model.ts` as *"closer but not
equal"*. **Under `G-7`, composing on the wrong one is a silent behaviour loss.** Surfaced at §5.4
`W5.2` and §7 item 6.

**C-5 — `UI-RENDERED-WITH-PROVIDENT` is cited as a decision id with no home row.** *(Citation
finding.)* The brief lists it as a standing design decision; it is **cited as such in three specs**,
but **`docs/decisions.md` carries no row for it** (`VERIFIED-BY-READ`: a grep for the literal over
that file returns no match). The **constraint still binds** (`AGENTS.md` states it project-wide, and
proposal §3 restates it); **its citation home is owed.** Recorded as §9 `NR-7`.

**C-6 — the `PD-VENDOR` conformance leg's green is VACUOUS AS EVIDENCE, and the lock's own
`conformance` block does not say so.** *(Recorded by a tracker, absent from the machine-readable
manifest.)* `VERIFIED-BY-READ`: `vendor/foundation.lock.json`'s `conformance.excluded` records the
**four excluded suites and their import-closure reasons**, but nothing in the file states that the
**included eleven's pass condition is vacuous**. **A future pass reading only the manifest would take
`conformance: { included: [11 suites] }` for an available evidence leg.** The statement lives in the
`PD-VENDOR` DONE row only. **What would settle it: a `conformance.evidenceBound` member in the
manifest, or its own decision row.**

**C-7 — the `APP-ENABLEMENT-PREDICATE` divergence contradicts the app contract, and it is recorded
as an OWED amendment rather than a defect-with-a-fix.** *(Internal contradiction, already recorded.)*
`src/main/main.ts`'s `optedIn = requested.length > 0` against the contract's `source === 'argv' | 'env'`;
the measured divergent case is `--enable-tool-groups=read,dispatch`, which yields `effective === base`
**yet the reply gains `boot`** — *"a launch that requested nothing new is treated as opted-in."*
**Owner: the spec-writer; not applied.** Surfaced at §2.3 item 2 and §7 item 9.

**C-8 — the live FAIL pile is recorded as `32 APP` while one of the `32` is already known not to be
an app defect.** *(Internal inconsistency resolved by the record itself, but the headline count
persists.)* `docs/defects.md`'s re-classification annotation says the pile *"must be RE-DERIVED before
any future count is quoted from it"* **and** the tracker headline still reads `32 app-layer `[U]`
FAILs`. **The corrected reading in this artifact is `31 APP + 1 driver artifact` inside the 32**, with
`2 DRIVER + 5 FIXTURE` outside it — and **no figure in §3 should be quoted without that composition.**

**C-9 — the app-layer pile's app-side evidence PREDATES the last two app-side landings.**
*(Recorded, and it is a staleness finding.)* `docs/pending.md`'s
`LIVE-BATTERY-RE-RUN-AFTER-APP-SIDE-CHANGE` row names it and its own annotation records that **the
re-run HAPPENED** on isolated ports — **but the annotation also records that the re-run *"did not
re-measure the app layer's pile: the `32` app-layer `[U]` FAILs remain the earlier run's reading."***
So the app-layer pile is **a default-branch reading of the pre-`U-APP-HARNESS-READINESS` head,
re-confirmed (not re-measured) after it.** **Any unit that cites the app pile as evidence about THIS
head must say so.**

**C-10 — two named instrument rows and a `§6.1` field set are missing from the printed evidence.**
*(Recorded.)* `LIVE-DRIVER-EVIDENCE-LOSS` clause (ii): `surface.target` and the structured `§6.1`
fields **are not printed per row**, so *"some readings are not observable from the console evidence at
all."* **This is why §9 `NR-1`/`NR-2`/`NR-5` are `NOT RECORDED` rather than unanswered.**

---

## 11. THE DELIVERABLE'S OWN LIMITS, STATED SO NO LATER PASS OVER-READS THIS FILE

1. **This file is a PLAN at the DOC layer.** It ran nothing, it authorises nothing, and **not one
   figure in it is app-green, envelope-green, harness-green or live-green.**
2. **Every unit row here still owes its own full cycle.** §5's `(d)`/`(e)` fields name the **test
   surface** and the **live instrument** each unit must dispose of and take — they do not discharge
   them, and **the before → after reading is the landing's own act** (`REBUILD-ARCHIVE-POLICY`
   clause (3)).
3. **The `GAP-*` ids in §5.9 are PROPOSED, not decided.** Minting a program row is the architect's
   act; the `X-4`/`PD-UI-13` precedent is the shape.
4. **The ordering in §5.1 is the program's own wave order with ONE documented dependency inversion
   (`PD-UI-4a` before `W3`) and ONE unassigned row (`PD-UI-7`).** It is not a re-numbering.
5. **Everything this file asserts about a figure is labelled with its source.** Where a figure is a
   `RECORDED READING`, the measurer is named; where the records are silent, §9 says
   `NOT RECORDED` and names what would settle it.
