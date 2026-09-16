# User-flow-audit LIVE coverage report — 2026-09-15 (re-emission; APP-level, RCA-12)

**Purpose.** The structured, machine-readable live-coverage report for the
`docs/specs/user-flow-audit.md` §5.U delta-matrix (the §6.1 schema) + the extended
`user*`/`repro_*`/`toolbar_*` rows, executed by `role_live_scenario_runner` against the
**RUNNING, assembled Electron app**. This file **replaces** the rejected first report
(`user-flow-audit-review.md` §6.2 audit findings Ad-1..Ad-12). It is emitted, **not
self-blessed** — the read-only §6.2 audit blesses it.

## 0. App state, layer, commands

- **Live surface (attached, never spawned):** the RUNNING Electron app on the operator
  store — MCP `http://127.0.0.1:3787/mcp`, CDP `http://127.0.0.1:9222`, `DISPLAY=:0`;
  Chrome 130 / Electron 33.4.11 / `provident-electron/0.1.0`; viewport 1314×721.
- **Bundle/commit under test:** git HEAD `1e1b3d2` + the uncommitted working tree whose
  `dist/` was rebuilt **2026-09-15 22:48** — the bundle carries the F-1 pane-gesture fix
  (`GESTURE_SELECTOR = '.gutter[data-zone], .pane-collapse-toggle'` + deferred
  pointer capture: both literals verified present in `dist/renderer/renderer.js`) and the
  F-3 empty-zone-track fix (`zoneTrackCssVars` / `--zone-left-track` also present in the
  bundle, and observable live as the right track `0px` in §1 U-5's FILLED sample).
  **Neither fix is committed and `docs/defects.md` still lists F-1/F-3 as OPEN — a
  tracker-staleness finding (F-6, §4); the runner does not edit trackers.**
- **`editingMode`:** `contenteditable` — verified live in the settings modal
  (`#operator-editing-mode` = `"editingMode: contenteditable"`, `uf_settings_5` PASS).
  It was found as `textarea` when this pass began (left by the previous pass's
  `toolbar_toggle`), which is a **precondition failure for the caret rows**; it was
  restored to `contenteditable` with the driver's own hygiene block
  (`uf_restore_layout`, a real click on `#editor-toolbar-toggle`) before re-running the
  contenteditable-dependent rows. No product setting other than that sanctioned
  hygiene restore was changed.
- **Seeded corpus:** every `--connect` attach re-seeds `.live-corpus/alpha` +
  `.live-corpus/beta` via `edit.import_markdown` (6 nodes / 10 edges per attach);
  `rag.list_documents` = 65 documents.
- **LAYER STATEMENT (RCA-12): this report is APP-level / assembled-renderer.** Every
  verdict below comes from the ASSEMBLED, RENDERED Electron app driven through real CDP
  input gestures (hit-tested before dispatch) and read back through painted boxes,
  computed geometry, DOM identity and store read-backs. **A node/pure-envelope green
  satisfies NO row here**; a live FAIL that contradicts a node-green or a "FIXED"/"green"
  doc claim IS the finding.
- **Exact commands run** (sequential `--connect` runs, never spawning an app):

```
node --check scripts/live-drive.mjs
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_panes_12,uf_panes_12_diag,uf_tabs_7,uf_tabs_7_diag,uf_panes_14,uf_layout_10,uf_mount_diag,uf_mount_leak_diag,uf_panes_8,uf_hist_6,uf_tabs_3,uf_tabs_1,uf_tabs_4,uf_settings_1,uf_settings_2,uf_settings_3,uf_settings_4,uf_settings_5,uf_settings_7,uf_panes_10,uf_panes_1,uf_search_2,uf_hist_4,uf_layout_2
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,user1_tab_new,user2_pane_drag,user3_collapse_orientation,user5_history_in_pane,user6_search_no_flicker,repro_nbsp,repro_dup_para,user7_zone_resize,user8_zone_boundary,user9_search_open_in_tab,user10_collapse_vertical_text,toolbar_toggle,toolbar_undo
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,uf_settings_5          # restore editingMode -> contenteditable (real click)
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,uf_hist_6,user4_main_editable
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,user2_pane_drag,user3_collapse_orientation,user5_history_in_pane,user6_search_no_flicker,user7_zone_resize,user8_zone_boundary,user9_search_open_in_tab,user10_collapse_vertical_text
# READ-ONLY attribution probes (no driver/block edits; the pane-drag, mount-count,
# new-tab and commit-on-blur evidence in §3/§4 below) — attached to the same surfaces:
node /tmp/probe/probe_drag.mjs | probe_drag3.mjs | probe_mounts.mjs | probe_tabnew2.mjs | probe.mjs
```

- **`done: 56 blocks, 17 FAIL, 2 PARKED`** across the whole pass (5 sequential
  `--connect` driver runs; per run: **25 blocks / 1 FAIL / 0 PARKED**, **14 / 10 / 1**,
  **3 / 0 / 0**, **4 / 1 / 0**, **10 / 7 / 1** — the driver's own `done:` lines summed;
  the 17 FAILs are 13 distinct failing row instances re-run across batteries, and the
  3 F-1 rows now PASS). 6 driver diagnostics + 3 hygiene `DIAG` steps are
  measurement-only and never promoted to a row verdict; the read-only probes are not
  blocks and are counted separately.
  Row tallies: **matrix §5.U = 8 rows executed: 6 PASS, 1 FAIL, 1 PARKED;
  extended = 14 rows: 2 PASS, 9 FAIL, 3 PARKED.**
- **PARK discipline (RCA-11):** nothing is parked for "no live session" — the app was
  live and every park below names a *measured* precondition. The two parks are:
  U-7's `uf_hist_6` setup (an un-hit-tested click that never committed its journal
  delta) and `user2_pane_drag` (drag start measured at `y=7755` on a 721px viewport).
  **Both are HARNESS precondition misses, and both were answered by a read-only probe
  that established the underlying live behavior — so neither park is a product claim.**

## 1. §5.U matrix rows (the §6.1 row set — `summary.total` = 8)

| U-row | Block | Verdict | The user-visible end state it pins | Concrete observed evidence |
| --- | --- | --- | --- | --- |
| **U-1** | `uf_panes_12` | **PASS** | A real click on a doc-nav document ROW focuses that document (F-1) | Real hit-tested CDP click on `li[data-document-id=".live-corpus/beta"]` (box 63×22, `hit=preempt-node-node-967149` = the row's own compiled node) → stage `docId` `rag-.live-corpus/alpha:section:1` → `rag-.live-corpus/beta:section:1` (`focusedThatDocument=true`), `li[data-current]=true`; click-event targets `pointerdown/mouseup/click = preempt-node-node-967149 in#pane-doc-nav` (the gesture now reaches the ROW, not the frame) |
| **U-2** | `uf_tabs_7` (+`uf_panes_14`) | **PASS** | A real click on a search RESULT row opens the document in a NEW tab (F-1) | Real submit rendered 4 painted rows (143×151, `is-clickable`); real hit-tested click on the row (`hit=preempt-node-node-969467`, all three event targets on the row in `#pane-search`) → tabs **8→9**, `openedDocTab=true`, `searchTabStillOpen=true`; `uf_panes_14` repeats it: real type (`Input.insertText "alpha"`) + real submit + real hover (`bg rgba(0,0,0,0)`→`rgba(255,255,255,0.08)`) + real row click → tabs **10→11** |
| **U-3** | `uf_panes_12` (+`uf_panes_14`) | **PASS** | The pane-drag gesture surface is the pane HEADER only — a body click is never hijacked (F-1) | The click-probe on the pane BODY records the full event chain **on the row itself** (`pointerdown:preempt-node-969467|in#pane-search`, `mouseup` and `click` likewise) — no retarget to `.pane-frame[data-pane-id]`; the body row's own handler ran (stage switch / new tab, above), i.e. the body was not claimed by a drag. Header drags still start a drag: §4 NEW-1 shows a header drag relocating the pane |
| **U-4** | `uf_layout_10` (+`uf_mount_diag`) | **FAIL** | Empty↔filled pane-set transition leaves exactly ONE `#wiki-root` mount (F-2) | `uf_mount_diag`: **7 mounts, 6 childless/stale**; boxes `[y,h,children]=[[-89814,29904,0],[-59910,29904,0],[-30007,29904,0],[-103,29904,0],[29801,29904,0],[59704,29904,0],[89608,29904,6]]`; `#zone:main` at **y=89608** on a **209 473px** page (viewport 721) ⇒ `singleRootMountAndStageInViewport=false`. The transition's own delta was measured directly (§4 NEW-2): mounts **7→8** on emptying the pane set and **8→9** on refilling, page height 77 021→120 64→100 713→**100 713px**, `#zone:main` y 66039→2492→33035 |
| **U-5** | `uf_layout_10` | **PASS** | An empty side zone's grid TRACK collapses and the stage reclaims the width (F-3) | FILLED: `zone:left` `[33,-10300,160,29712]`, stage `[193,-10300,741,29712]`, `gridTemplateColumns="160px 741.209px 0px"`, frames 2. Two REAL modal clicks disabled both enabled panes → `zone:left` `is-empty` + `display:none`, box 0×0, frames 0, **`gridTemplateColumns="0px 901.209px 0px"`** → `gridTrackCollapsed=true`; stage x **193→33**, width **741→901** → `stageReclaimed=true`. Restore: real clicks re-enabled both, frames 2, leftWidth 160, census `"doc-nav, search"` — all four clicks `path=cdp` |
| **U-6** | `uf_panes_8` | **PASS** | A pane-tab click after zone minimize re-expands the zone (visible) | Real `#zone-minimize-left` click → zone `is-minimized`, frames 0, two painted `.pane-tab` strips (`#zone-tab-left-doc-nav` 82×21, `-search` 57×21, distinct y 375/395 = vertical column); real click on `#zone-tab-left-doc-nav` → zone class cleared, **frames 2 painted again**, `clickedPaneIdentifiedByTab=true`. (`unit-u-shell-4` §2.5 pin 5 DEFERS live body-selection, so the checklist's "activates that pane's body" clause is spec drift — not scored) |
| **U-7** | `uf_hist_6` | **PARKED — precondition** | A history-entry click reverts the content to that journal point | **The setup edit never committed, so the journal delta the row's assertion needs did not exist.** Two live runs: `committedToStore=false`, the typed marker absent from beta's store read-back, and the stage hash **identical** before/after (`-998211175`→`-998211175`, then `1866669172`→`1866669172`) — with no content delta, "reverts the content" is unfalsifiable. The same gesture, hit-tested first, DOES commit (§4 NEW-3) ⇒ **inconclusive, not a behavior FAIL**. What WAS observed (both runs): a real click on the older entry moved the journal cursor (`18→16`, `24→22`), the redo control enabled, **no `replay` control** exists (chrome text `["Undo","Redo","HTML"]`) — the recorded F-5 off-by-one (`#k` click leaves `#k-1` marked current) reproduced |
| **U-8** | `uf_tabs_3` | **PASS** | Closing the LAST tab yields the default page (never an empty stage) | Real click on `.tab.is-active .tab-close` (13→12 tabs) activated the LEFT neighbour `.live-corpus/alpha` AND mounted its body (`mountedDocId=rag-.live-corpus/alpha:section:1`); closed down to 1 and closed the LAST → tabs **1**, active title `astrographer-review`, `mountedDocId=rag-astrographer-review:section:1`, `landing=false`, stage **105 741 chars**, painted stage box `[193,227640,741,37916]` ⇒ a fresh non-empty default page, never an empty stage |

## 2. Extended (non-matrix) rows — same fields

| Checklist row | Block | Verdict | Pinned user-visible assertion | Concrete observed evidence |
| --- | --- | --- | --- | --- |
| UF-DEFECT-1 (UF-TABS-2) | `user1_tab_new` | **FAIL — LIVE-UF1 re-confirmed** | `[data-tab-new]` mints a NEW usable tab (never a silent no-op) | Real click `path=cdp` → `.tab` **4→4** (`newTab=false`), `landing=false`, `#stage=false`. Read-only probe with the strip scrolled into view: hit-test `onTarget=true` (hit = `tab-new`) → tabs **6→6**, no new tab, no usable view ⇒ the button is a live click-target producing nothing |
| UF-DEFECT-2 (UF-PANES-4) | `user2_pane_drag` | **PARKED — precondition** (verdict of the row's own gesture is a **contested defect**, see §4 NEW-1) | A REAL pane-HEADER drag reorders/relocates the pane | Block parked: drag start measured **off-viewport** (`doc-nav` header `y=7755` on a 721px viewport after the mandatory scroll reset) — the block does not scroll the header into view, so the real gesture cannot be driven *by the block*. **The probe drove the same gesture with the header in view and the pane DID relocate** (§4 NEW-1) ⇒ the recorded LIVE-UF2 "inert" claim does not reproduce under a valid precondition |
| UF-KEEP-1 (UF-PANES-6) | `user3_collapse_orientation` | **FAIL, `proxyPASS:true`** — underlying geometry HOLDS | After minimizing, the pane-tab strips render as a VERTICAL column | Synthetic `.click()` driver (not hit-tested) + geometry oracle: frames 2→0, `.pane-tab` 0→2, strips `[{x:33,y:8532,h:21,w:82},{x:33,y:8553,h:21,w:57}]` ⇒ `vertical=true` (distinct y, uniform h, equal x). Per §6.1 a synthetic driver can never be an accepted PASS ⇒ recorded FAIL(proxy), **no product defect** |
| UF-STAGE-3 | `user4_main_editable` | **PASS** | The main view IS editable and an edit commits on blur | Hit-tested real click (`hit=rag-.live-corpus/alpha:p:1`, `onTarget=true`) → `activeElement` is `contenteditable`; typed `LIVE18455` present in the STORE (`rag.get_document=true`) and in the DOM ⇒ commit-on-blur works live |
| UF-DEFECT-3 (UF-HIST-1) | `user5_history_in_pane` | **FAIL — LIVE-UF5 re-confirmed** (`proxyPASS:true`, no gesture can drive ancestry) | The history segment renders inside a `.pane-frame`, not the main canvas | `[data-role="history"]` (`#pane-history`) `inside #zone:main=true`, `inside a .pane-frame=false`; ancestry `#pane-history → #zone:main → #wiki-root → #app → MAIN.layout → BODY` |
| UF-KEEP-3 (UF-SEARCH-1) | `user6_search_no_flicker` | **FAIL, `proxyPASS:true`** — underlying behavior HOLDS | Switching to Search does not overlay a landing flicker | 3 samples (t+800/1800/3000) all `landing=false`, `landingBoxPainted=false`, active tab `Search: search-5` ⇒ no flicker; the oracle is a DOM-presence probe on a synthetic tab switch ⇒ not an accepted PASS, **no product defect** |
| UF-DEFECT-5 (UF-LAYOUT-5/6) | `user7_zone_resize` | **FAIL — LIVE-UF7 re-confirmed** | A REAL boundary drag resizes the zone by >10px | Before 160px; real boundary drag at the painted edge `x=193` with `hit=null`/`onTarget=false` → after **160px** (Δ0); the `.gutter[data-zone="left"]` element is **0×0 at (0,0)** (`cursor:col-resize`) ⇒ no grippable user surface at the boundary; the native-dispatch [DIAG] on the hidden gutter also Δ0 this run |
| UF-DEFECT-6 (UF-LAYOUT-7) | `user8_zone_boundary` | **FAIL — LIVE-UF8 re-confirmed** (`proxyPASS:true`) | A visible separator divides the side zone from the stage | Painted seam between `zone:left.right=193` and `zone:main.x=193` = **0px** (`document.elementFromPoint` in the gap → null) ⇒ `seamPainted=false`; `zone:left`/`zone:main` both `background rgba(0,0,0,0)`, border `0px none`, `box-shadow:none`; grid `"160px 741.209px 0px"` with `gap:normal`; all four gutters 0×0 ⇒ `boundary-visible=false` |
| UF-DEFECT-7 (UF-TABS-6) | `user9_search_open_in_tab` | **FAIL — LIVE-UF9 re-confirmed** | "Open in a tab" creates a tab whose stage shows the SEARCH view | Real click `#pane-search-expand-tab` (`path=cdp`): tabs **5→6**, active tab `Search: search-6` — but `#zone:main` renders the DOCUMENT (`isDocumentBody=true`, snippet `"Alpha…Settings modal (C3)…"`), `searchInput=false`, `ragResults=false` |
| UF-DEFECT-8 (UF-PANES-7) | `user10_collapse_vertical_text` | **FAIL — LIVE-UF10 re-confirmed** | Minimized-zone labels read VERTICALLY | Real `#zone-minimize-left` click → 2 painted labels; both report `writing-mode: horizontal-tb`, `text-orientation: mixed`, sized `82×21` and `57×21` ⇒ `vertical=false` |
| UF-STAGE-4 | `repro_nbsp` | **PARKED — measurement-only diagnostic (cannot fail by design)** | Typing `a<space>b` commits a real ASCII 0x20 | Real edit: store `p` content `"LIVE TEST"`, charCodes `[76,73,86,69,32,84,69,83,84]` (single 0x20), store literal `&nbsp;`/`\u00A0` false, jammed `LIVETEST` false, rendered html clean ⇒ the reported nbsp bug does NOT reproduce live. Recorded PARKED (not PASS) because the driver declares the block `diagnostic:true`/`pass:false` — §6.1 "a block that cannot fail is NOT evidence", so it can never be promoted to a row verdict |
| UF-STAGE-2 | `repro_dup_para` | **FAIL — LIVE-UF6 re-confirmed** | Each RAG paragraph materializes exactly ONCE, not nested in the doc-head | `[1 SINGLE-RENDER]` editable `[data-rag-node-id=".live-corpus/alpha:p:1"]` count **2** (expect 1); `[2 NOT-NESTED]` `p:1` IS a descendant of `H1#rag-.live-corpus/alpha:section:1`; `[3 EDIT]` 2 editable copies |
| UF-HIST-2 | `toolbar_undo` | **PARKED — precondition (the journal was not at base)** | After an edit Undo is enabled and a real click reverts, re-disabling the control at base | `before=false` (already enabled ⇒ the journal was NOT at base at block start), `afterEdit=false` (enabled), real click `path=cdp` → **revert observed = true** (edited content gone from the store read-back) but `afterClick=false` — the control cannot re-disable at base when the stack still holds 18 entries. The revert half holds; the "re-disables at base" half is untestable without an at-base stack |
| UF-STAGE-6 | `toolbar_toggle` | **PASS** | A real click on the editor-toolbar mode toggle flips the editing mode live | Real hit-tested click `#editor-toolbar-toggle` → `data-mode` `contenteditable`→`textarea` (`flipped=true`) |

## 3. Rows that could NOT be executed (PARKED — with the measured precondition)

| Row | Block | Precondition measured | Why it is a park, not a verdict |
| --- | --- | --- | --- |
| **U-7** | `uf_hist_6` | The setup's own edit did not commit (`committedToStore=false`, stage hash unchanged in both runs) | The row asserts a *revert*; with no committed delta the assertion is unfalsifiable. A read-only hit-tested re-drive of the identical gesture commits (§4 NEW-3) ⇒ the row's blocking condition is the setup click, not the product's history semantics. **Harness finding H-2.** |
| **UF-DEFECT-2** | `user2_pane_drag` | Drag start `y=7755` vs a 721px viewport (the block does not scroll the pane header into view) | The real gesture was not drivable *by the block*. The probe drove it with a valid start and the pane relocated (§4 NEW-1) — so the parked block also cannot be read as evidence FOR the recorded "inert" claim. **Harness finding H-1.** |
| UF-PANES-10 (fresh-store half) | `uf_panes_10` | The running app carries the OPERATOR store (`panesInitialized` already true) | The row's own executed half PASSes live (rendered `["doc-nav","search"]` ↔ census `"doc-nav, search"`, painted, stable). The fresh-store first-run default needs a fresh `--home` boot, which the existing `first_boot_default` block covers with `--no-seed` + a disposable HOME |
| UF-TABS-12, UF-SHELL-2, UF-IMPORT-1..6, UF-THEME-1..3 | — | Structurally non-exercisable from an attached session | Restart round-trip (would require relaunching the operator session — out of the runner's mandate), OS-owned window drag, OS-owned `showOpenDialog`, DRAFT theme unit. RCA-11 structural park reasons |
| The remaining census rows (UF-GNOSIS-*, UF-PARITY-*, UF-LAYOUT-1/3/4/8/9/11/12, UF-PANES-2/3/5/9/11/13/15..18, UF-SEARCH-3/4, UF-SHELL-1/3/4, UF-TABS-5/8/9/10/11, UF-SETTINGS-6, UF-HIST-1/5/7, UF-STAGE-1/5/7/8/9/10, UF-DEFECT-9, …) | — | **Not driven this pass** (out of the task's row set); several are covered by existing blocks (`boot_landing`, `vis_persist`, `first_boot_default`, `persistence_v*`), several are blocked (U-SHELL-9b / U-STATE-1e for UF-TABS-10/11). Named here for the §6.2 completeness axis — they are NOT claimed as PASS |

## 4. Findings (live results contradicting a green/doc claim)

**F-1 — PANE-BODY-GESTURE-SWALLOWED: FIXED IN CODE, LIVE-CONFIRMED THIS PASS.** The
three rows the defect was recorded from now PASS on real gestures: `uf_panes_12`
(U-1: the doc-nav row click switches the stage AND marks `data-current`),
`uf_tabs_7` (U-2: a search-result row click opens the document tab; the search tab
stays) and `uf_panes_14` (U-2/U-3: real type + submit + hover + row click → new tab).
The click-probe's event chain now names the ROW's own compiled node
(`pointerdown/mouseup/click = preempt-node-* in#pane-*`) instead of retargeting to
`.pane-frame[data-pane-id]`. The fix's second half is visible too: the header toggle
that the old capture had also broken now works (`uf_panes_1`: doc-nav body `li=66`/h=9681px
→ real click → `is-collapsed=true`, `li=0`, h=37px header-only → second real click →
`li=66`, h=9681px, same pane root `#pane-doc-nav`). **Evidence of the live bundle
carrying the fix:** `dist/renderer/renderer.js` contains
`.gutter[data-zone], .pane-collapse-toggle` and `PANE_DRAG_CAPTURE_THRESHOLD`.
**No contradiction remains for F-1** — but `docs/defects.md` still shows F-1 OPEN
(F-6, §4).

**F-2 — WIKI-ROOT-MOUNT-LEAK: NOT FIXED; re-confirmed and now DELTA-ATTRIBUTED.** The
running app holds **7 `#wiki-root` mounts (6 childless/stale)**; `#zone:main` sits at
**y=89 608** on a **209 473px** page (viewport 721px) and
`singleRootMountAndStageInViewport=false`. The transition attribution recorded by the
previous pass as ambiguous is now measured as an explicit **delta without any reload**:
`#wiki-root` count **7 → 8** when the enabled-pane set EMPTIES (real modal clicks
disabling doc-nav then search: page height 77 021→120 64px) and **8 → 9** when it
REFILLS (page height → 100 713px; `#zone:main` y 66039→2492→33035). The gesture list
that does NOT leak: settings-modal open/close, a doc-nav row click, and the
zone minimize/expand pair — all 7→7 (`uf_mount_leak_diag`). ⇒ F-2 is a real,
user-visible, monotonic leak triggered by the empty↔filled pane-set transition;
**U-4 therefore FAILS** (the pinned end state is "exactly ONE mount").

**F-3 — EMPTY-ZONE-TRACK-NOT-COLLAPSED: FIXED IN CODE, LIVE-CONFIRMED THIS PASS.**
`uf_layout_10` (U-5) PASSes: with zero enabled+placed panes the `#wiki-root`
`gridTemplateColumns` goes **`"160px 741.209px 0px"` → `"0px 901.209px 0px"`** and the
stage moves **x 193→33 / width 741→901** (`gridTrackCollapsed=true`,
`stageReclaimed=true`), with `zone:left` `is-empty` + `display:none` + 0 frames. The
FILLED sample's right track already reads `0px` (the fix's own projection), and the
bundle carries `zoneTrackCssVars` / `--zone-left-track`. **No contradiction remains for
F-3** — but `docs/defects.md` still shows F-3 OPEN (F-6, §4).

**Re-confirmed LIVE-UF defects (all APP-level, real gestures, unchanged):**
**LIVE-UF1** `user1_tab_new` FAIL (4→4 tabs; probe: hit-tested button, 6→6, no view) ·
**LIVE-UF5** `user5_history_in_pane` FAIL (`#pane-history` inside `#zone:main`) ·
**LIVE-UF6** `repro_dup_para` FAIL (2 editable `p:1` copies, one nested in the `h1`) ·
**LIVE-UF7** `user7_zone_resize` FAIL (Δ0; gutter 0×0 at (0,0)) ·
**LIVE-UF8** `user8_zone_boundary` FAIL (painted seam 0px) ·
**LIVE-UF9** `user9_search_open_in_tab` FAIL (new Search tab shows the document) ·
**LIVE-UF10** `user10_collapse_vertical_text` FAIL (`horizontal-tb`).
**LIVE-UF2 is CONTRADICTED by this pass — see NEW-1.**

**F-6 — TRACKER STALENESS (doc/spec finding, NOT a product defect; REMEDIATED same
day by the documentation review below).** The defects tracker contradicted this report
at emission time: `docs/defects.md` still listed **F-1** and **F-3** as OPEN although
their fixes were in the running bundle and live-confirmed here (§4 F-1/F-3), and still
carried **LIVE-UF2** as a confirmed defect that §4 NEW-1 contradicts. The runner's
mandate excludes editing trackers, so it reported the drift instead. **Remediated
2026-09-15 by the documentation-review pass** (`archive/reviews/2026-09-15-user-flow-audit-doc-review.md`):
F-1/F-3 read FIXED + LIVE-CONFIRMED with this report's live numbers, LIVE-UF2 reads
FIXED + LIVE-CONFIRMED, and the F-2 row's numbers/trigger were re-based on this
report's re-emission.

### NEW findings raised by this pass

**NEW-1 (HIGH, contradiction of a recorded defect — `docs/defects.md` LIVE-UF2):
a REAL pane-HEADER drag DOES relocate the pane; LIVE-UF2's "inert" reproduction is a
probe-geometry artifact.**
- Evidence (read-only probe, hit-tested start): `onTarget=true`, `hit=pane-collapse-doc-nav`;
  drag down past the sibling → left-zone slot order `doc-nav,search` → `search,doc-nav`,
  `doc-nav` y 375→1133 (run 1); second probe dragging the other direction →
  `search,doc-nav` → `doc-nav,search`, dragged pane y 1133→-802 (run 3). The reorder
  **persisted** across gesture-free stable reads, and the mechanism persists it
  (`sidebar-panes.ts commitPaneDrop` → `setLayout`).
- Why the recorded reproduction failed: the block refuses to drag a start whose header
  is below the fold (`off-viewport` → PARK) and, when it does drag, drags the header
  **down past a sibling 9 600px below the fold**, so the pointer destination is outside
  any painted zone. The recorded LIVE-UF2 run used a negative-y start point. So the
  earlier "slot order unchanged" outcome is explained by invalid gesture geometry.
- Attribution: **HOST** — the same F-1 fix that un-swallowed the pane body explicitly
  EXEMPTS the header from the `isInteractiveControl` guard (`renderer.ts`: "the header
  is itself a `button.pane-collapse-toggle` … EXEMPT from this guard — otherwise the
  header would be inert exactly as the body was"), which is what makes a header grab
  start the pane drag. This is therefore a **fix-verified behavior whose defect row is
  now stale**, not a regression.
- Impact: `docs/defects.md` LIVE-UF2 is **no longer reproducible as written** and
  `user2_pane_drag` cannot currently distinguish PASS from PARK (H-1).

**NEW-2 (HIGH, host) — F-2's trigger is the empty↔filled pane-set transition, measured
as an explicit mount delta (+1 on empty, +1 on refill) with the page height tripling.**
See F-2 above for the numbers. This upgrades F-2 from "state-dependent observation" to
a reproduced, attributable defect with a deterministic trigger (two real modal toggle
clicks), and it is the reason U-4 FAILS.

**NEW-3 (MEDIUM, harness) — `uf_hist_6`'s setup click is not hit-tested, so U-7 can
silently run with no committed delta.** A read-only probe of the *identical* sequence
(click the first `#zone:main [contenteditable]` at `+20,+14`, `Input.insertText`,
`blur()`) reports `hit = P rag-.live-corpus/beta:p:1`, `activeElement = P
contenteditable`, and `committed=true` (marker in the store read-back) — while the
block reports `committedToStore=false`, a missing store marker and an unchanged stage
hash. The difference is that the block does not verify its click landed on the editable
(it also runs after blocks that have re-scrolled the page). Consequence: U-7 is
**unfalsifiable** in that state and was previously at risk of being read as a product
FAIL. Fix shape (harness, not a product change): hit-test the setup click and park
loudly when the target is not hit — the same discipline `ufRealClick` already applies
to row gestures. **Host gesture-routing? NO** — the native/real path works.

**NEW-4 (LOW, harness) — the `--connect` attach's own corpus seed
(`edit.import_markdown`) is a pane-set refill and is therefore an UNATTRIBUTED leak
candidate.** Every attach re-seeds, and after each attach the live delta probe measured
7 mounts — so part of the standing 7 may be accumulated by the harness's own re-seeding
across passes rather than by a user gesture. This does not weaken NEW-2 (whose deltas
were measured without a reload), but it means the ABSOLUTE mount count is contaminated
by the harness and must not be quoted as a user-session number.

**NEW-5 (LOW, doc/spec drift; runner did not edit) — `docs/defects.md` still lists F-1
and F-3 as OPEN although their fixes are in the running bundle and live-confirmed
here.** The F-1/F-3 rows contradict §4 of this report until the tracker pass flips them
to FIXED with the live evidence; `docs/defects.md` also still carries LIVE-UF2 as a
confirmed defect that NEW-1 contradicts. (The runner's mandate excludes editing
`docs/defects.md`.)

**NEW-6 (LOW, doc/spec drift) — `uf_settings_1` reads `#operator-panes` as the
`gnosis-documents`/engine-unavailable operator pane** ("Gnosis engine … unavailable"),
not a settings control surface; the row still PASSes (the modal reveals painted,
populated operator panes) but the evidence text naming should not be read as a settings
assertion.

## 5. §6.1 machine-readable report

```json
{
  "unit": "user-flow-audit",
  "date": "2026-09-15",
  "layer": "assembled-renderer (RCA-12)",
  "commands": [
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_panes_12,uf_panes_12_diag,uf_tabs_7,uf_tabs_7_diag,uf_panes_14,uf_layout_10,uf_mount_diag,uf_mount_leak_diag,uf_panes_8,uf_hist_6,uf_tabs_3,uf_tabs_1,uf_tabs_4,uf_settings_1,uf_settings_2,uf_settings_3,uf_settings_4,uf_settings_5,uf_settings_7,uf_panes_10,uf_panes_1,uf_search_2,uf_hist_4,uf_layout_2",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,user1_tab_new,user2_pane_drag,user3_collapse_orientation,user5_history_in_pane,user6_search_no_flicker,repro_nbsp,repro_dup_para,user7_zone_resize,user8_zone_boundary,user9_search_open_in_tab,user10_collapse_vertical_text,toolbar_toggle,toolbar_undo",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,uf_settings_5",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,uf_hist_6,user4_main_editable",
    "node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=uf_scroll_reset,uf_restore_layout,user2_pane_drag,user3_collapse_orientation,user5_history_in_pane,user6_search_no_flicker,user7_zone_resize,user8_zone_boundary,user9_search_open_in_tab,user10_collapse_vertical_text",
    "node /tmp/probe/probe_drag.mjs (read-only pane-header drag probe; /tmp/probe/probe_drag3.mjs, probe_mounts.mjs, probe_tabnew2.mjs, probe.mjs)"
  ],
  "rows": [
    {
      "row": "U-1", "block": "uf_panes_12", "verdict": "PASS",
      "assertion": "A real click on a doc-nav document ROW focuses that document in the stage",
      "dclass": "D-interaction", "realInput": true,
      "evidence": "hit-tested real CDP click on li[data-document-id='.live-corpus/beta'] (box 63x22, hit=preempt-node-node-967149 = the row's own node, path=cdp): stage docId rag-.live-corpus/alpha:section:1 -> rag-.live-corpus/beta:section:1 (focusedThatDocument=true); li[data-current]=true; click-event targets ['pointerdown:preempt-node-node-967149|in#pane-doc-nav','mouseup:...|in#pane-doc-nav','click:...|in#pane-doc-nav'] — the gesture reaches the ROW, not the pane frame",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-2", "block": "uf_tabs_7", "verdict": "PASS",
      "assertion": "A real click on a search RESULT row opens that document in a NEW tab while the search tab stays",
      "dclass": "D-interaction", "realInput": true,
      "evidence": "real submit rendered 4 painted result rows (143x151, is-clickable); hit-tested real click on the row (hit=preempt-node-node-969467, all three event targets on the row in #pane-search): tabs 8->9, openedDocTab=true, searchTabStillOpen=true; uf_panes_14 repeats it (real Input.insertText 'alpha' + real submit + real hover bg rgba(0,0,0,0)->rgba(255,255,255,0.08)): tabs 10->11",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-3", "block": "uf_panes_12", "verdict": "PASS",
      "assertion": "The pane-drag gesture surface is the pane HEADER only — a click in the pane BODY is never hijacked",
      "dclass": "D-interaction", "realInput": true,
      "evidence": "the pane-BODY click's full event chain names the row's own compiled node (pointerdown/mouseup/click = preempt-node-969467 / preempt-node-967149 | in#pane-doc-nav|#pane-search) with NO retarget to .pane-frame[data-pane-id]; the body control's own handler ran (stage switch / new tab, U-1/U-2); header drags still relocate (see NEW-1 probe)",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-4", "block": "uf_layout_10", "verdict": "FAIL",
      "assertion": "Empty<->filled pane-set transition leaves exactly ONE #wiki-root mount",
      "dclass": "D-visual", "realInput": true,
      "evidence": "uf_mount_diag: 7 mounts (6 childless/stale), boxes[y,h,children]=[[-89814,29904,0],[-59910,29904,0],[-30007,29904,0],[-103,29904,0],[29801,29904,0],[59704,29904,0],[89608,29904,6]]; #zone:main y=89608 on a 209473px page (viewport 721) => singleRootMountAndStageInViewport=false. Delta probe (real gestures, no reload): emptying the pane set 7->8 (page 77021->12064px), refilling 8->9 (page ->100713px, #zone:main y 66039->2492->33035)",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-5", "block": "uf_layout_10", "verdict": "PASS",
      "assertion": "An empty side zone's grid TRACK collapses and the stage reclaims the width",
      "dclass": "D-visual", "realInput": true,
      "evidence": "FILLED left=[33,-10300,160,29712] main=[193,-10300,741,29712] gridTemplateColumns='160px 741.209px 0px' frames=2; two REAL modal clicks disabled both enabled panes -> left cls='is-empty' display=none box 0x0 frames=0 gridTemplateColumns='0px 901.209px 0px' -> gridTrackCollapsed=true; stage x 193->33 width 741->901 -> stageReclaimed=true; restore: real clicks re-enabled both, frames=2, leftWidth=160, census='doc-nav, search' (all 4 clicks path=cdp)",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-6", "block": "uf_panes_8", "verdict": "PASS",
      "assertion": "A pane-tab click after zone minimize re-expands the zone (visible)",
      "dclass": "D-interaction", "realInput": true,
      "evidence": "real click #zone-minimize-left (path=cdp) -> zone class='is-minimized', frames=0, two painted .pane-tab strips (zone-tab-left-doc-nav 82x21 @y=375, zone-tab-left-search 57x21 @y=395: vertical column); real click #zone-tab-left-doc-nav (path=cdp) -> zone class='', frames=2 painted again, clickedPaneIdentifiedByTab=true (body-activation clause is DEFERRED by unit-u-shell-4 2.5 pin 5)",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-7", "block": "uf_hist_6", "verdict": "PARKED",
      "assertion": "A history-entry click reverts the content to that journal point",
      "dclass": "D-state", "realInput": false,
      "evidence": "PARKED — precondition: the setup edit never committed in two live runs (committedToStore=false, marker absent from the beta store read-back, stage hash identical before/after: -998211175->-998211175 and 1866669172->1866669172), so the journal delta the assertion needs does not exist and the revert is unfalsifiable. Observed anyway: real click on the older entry #17/#23 (path=cdp) moved the journal cursor 18->16 / 24->22 and enabled Redo; NO replay control (chrome text ['Undo','Redo','HTML'])",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    },
    {
      "row": "U-8", "block": "uf_tabs_3", "verdict": "PASS",
      "assertion": "Closing the LAST tab yields the default page (never an empty stage)",
      "dclass": "D-state", "realInput": true,
      "evidence": "real click .tab.is-active .tab-close (path=cdp) 13->12 tabs: LEFT neighbour '.live-corpus/alpha' becameActive=true and its body mounted (mountedDocId=rag-.live-corpus/alpha:section:1); closed down to 1 then closed the LAST (path=cdp) -> tabs=1, activeTitle='astrographer-review', mountedDocId=rag-astrographer-review:section:1, landing=false, stageLen=105741, stageBox=[193,227640,741,37916]",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true }
    }
  ],
  "summary": { "total": 8, "pass": 6, "fail": 1, "parked": 1 }
}
```

### Extended (non-matrix) rows — §6.1 fields

```json
{
  "unit": "user-flow-audit",
  "date": "2026-09-15",
  "layer": "assembled-renderer (RCA-12)",
  "rows": [
    { "row": "UF-DEFECT-1", "block": "user1_tab_new", "verdict": "FAIL", "assertion": "[data-tab-new] mints a NEW usable tab (never a silent no-op)", "dclass": "D-interaction", "realInput": true, "evidence": "real click path=cdp: .tab count 4->4 (newTab=false), landing=false, #stage=false; probe with the strip in view: hit-test onTarget=true (hit=tab-new) -> tabs 6->6, no new tab, no usable view", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-2", "block": "user2_pane_drag", "verdict": "PARKED", "assertion": "A REAL pane-HEADER drag reorders/relocates the pane", "dclass": "D-interaction", "realInput": false, "evidence": "PARKED — precondition: drag start off-viewport (doc-nav header y=7755 on a 721px viewport); the block does not scroll the pane header into view. Probe with a valid in-viewport start: onTarget=true, hit=pane-collapse-doc-nav, slot order doc-nav,search -> search,doc-nav (y 375->1133) and the reverse direction search,doc-nav -> doc-nav,search (y 1133->-802), persisted across stable reads => LIVE-UF2 not reproduced (NEW-1)", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-KEEP-1", "block": "user3_collapse_orientation", "verdict": "FAIL", "assertion": "After minimizing, the pane-tab strips render as a VERTICAL column", "dclass": "D-visual", "realInput": false, "evidence": "proxyPASS: synthetic .click([DIAG]) driver + geometry oracle. frames 2->0, .pane-tab 0->2, strips [{x:33,y:8532,h:21,w:82},{x:33,y:8553,h:21,w:57}] => vertical=true (distinct y, uniform h, equal x). No product defect: the underlying geometry HOLDS; the FAIL is the oracle discipline only", "proxyPASS": true, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-STAGE-3", "block": "user4_main_editable", "verdict": "PASS", "assertion": "The main view IS editable and an edit commits on blur (store read-back contains the marker)", "dclass": "D-state", "realInput": true, "evidence": "hit-tested real click hit=rag-.live-corpus/alpha:p:1 onTarget=true -> activeElement contenteditable=true; typed 'LIVE18455' in STORE rag.get_document=true and in DOM=true", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-3", "block": "user5_history_in_pane", "verdict": "FAIL", "assertion": "The history/undo/redo segment renders inside a .pane-frame, not in the #zone:main canvas", "dclass": "D-visual", "realInput": false, "evidence": "[data-role='history'] present=true; inside #zone:main=true; inside a .pane-frame=false; ancestry=['#pane-history','#zone:main','#wiki-root','#app.card','MAIN.layout','BODY'] (proxyPASS: no gesture can drive DOM ancestry)", "proxyPASS": true, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-KEEP-3", "block": "user6_search_no_flicker", "verdict": "FAIL", "assertion": "Switching to Search leaves the search view active and never overlays a landing flicker (3 samples)", "dclass": "D-visual", "realInput": false, "evidence": "proxyPASS: synthetic .click([DIAG]) tab switch + DOM-presence oracle. samples t+800/t+1800/t+3000 all {landing:false,landingBoxPainted:false}, active tab 'Search: search-5' => noLanding=true at all three. No product defect: the flicker does NOT reproduce", "proxyPASS": true, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-5", "block": "user7_zone_resize", "verdict": "FAIL", "assertion": "A REAL drag at the visible zone boundary resizes the zone width by >10px", "dclass": "D-interaction", "realInput": false, "evidence": "before=160px; real boundary drag at the painted edge x=193 (hit=null, onTarget=false) after=160px (delta 0); .gutter[data-zone='left'] = 0x0 at (0,0) cursor:col-resize (no grippable surface); [DIAG] synthetic pointer on the hidden gutter also delta 0", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-6", "block": "user8_zone_boundary", "verdict": "FAIL", "assertion": "A visible separator divides the side zone from the stage", "dclass": "D-visual", "realInput": false, "evidence": "painted seam between zone:left.right=193 and zone:main.x=193 = 0px (elementFromPoint in the gap -> null) => seamPainted=false; both zones bg rgba(0,0,0,0), border 0px none, shadow none; grid '160px 741.209px 0px' gap normal; all four gutters 0x0 => boundary-visible=false", "proxyPASS": true, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-7", "block": "user9_search_open_in_tab", "verdict": "FAIL", "assertion": "Open-in-a-tab creates a tab whose stage shows the SEARCH view, not the document", "dclass": "D-interaction", "realInput": true, "evidence": "real click #pane-search-expand-tab (path=cdp): tabs 5->6 with active tab 'Search: search-6', but #zone:main renders the document (isDocumentBody=true, snippet 'Alpha...Settings modal (C3)...'), searchInput=false, ragResults=false", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-DEFECT-8", "block": "user10_collapse_vertical_text", "verdict": "FAIL", "assertion": "Minimized-zone labels read VERTICALLY (bottom-to-top)", "dclass": "D-visual", "realInput": true, "evidence": "real click #zone-minimize-left (path=cdp) -> 2 painted labels; zone-tab-left-doc-nav writing-mode=horizontal-tb text-orientation=mixed size 82x21; zone-tab-left-search horizontal-tb 57x21 => vertical=false", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-HIST-4", "block": "uf_hist_4", "verdict": "FAIL", "assertion": "At the base the Undo control is disabled; after an Undo the Redo control becomes enabled; over-undoing past the floor is a safe no-op", "dclass": "D-state", "realInput": false, "evidence": "INCONCLUSIVE-parked on the at-base PRECONDITION: the journal could not be walked to the at-base floor, because the pass's own re-seeds left it carrying pending depth (the report §4 provenance records the journal at 25 entries with the cursor restored to `currentIndex=18`), so the at-base half of this row cannot be scored; the driver returned `park:true` with path 'not-reachable' ⇒ reported as PARKED/FAIL (no accepted verdict), NOT a product defect. The `toolbar_undo` block's own park (§2) is the same at-base precondition", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-LAYOUT-2", "block": "uf_layout_2", "verdict": "FAIL", "assertion": "provident.list_targets keeps the STABLE zone:* ids AND node-id pairing after a RAG content change, and the zone containers stay rendered", "dclass": "D-state", "realInput": false, "evidence": "block ran in run 1 (`--block=…,uf_layout_2`) and returned no accepted verdict: its oracle is an MCP `provident.list_targets` + rendered-zone-`box` probe with `path:'not-gesture'`/`gesture:false`, and §6.1 forbids promoting a non-gesture oracle to a PASS ⇒ FAIL (no product claim). The stable-zone-ids / pairing invariant is asserted at the NODE layer (`unit-u-shell-1-layout-zones`, 39), never claimed here as an APP-level PASS", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-STAGE-4", "block": "repro_nbsp", "verdict": "PARKED", "assertion": "Typing a normal space commits as 0x20 (not collapsed/lost/&nbsp;)", "dclass": "D-state", "realInput": true, "evidence": "PARKED — measurement-only DIAGNOSTIC block (declares diagnostic:true/pass:false by design, so it can never fail and is never promoted to a verdict; recorded PARKED, not PASS). Measured: store p content 'LIVE TEST' charCodes [76,73,86,69,32,84,69,83,84] (single 0x20), store literal &nbsp;/\\u00A0 false, jammed 'LIVETEST' false, rendered html clean => the reported nbsp bug does not reproduce", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-STAGE-2", "block": "repro_dup_para", "verdict": "FAIL", "assertion": "Each RAG paragraph materializes exactly ONCE as a sibling editable root (never nested in the doc-head)", "dclass": "D-visual", "realInput": false, "evidence": "[1 SINGLE-RENDER] editable [data-rag-node-id='.live-corpus/alpha:p:1'] count=2 (expect 1); [2 NOT-NESTED] p:1 IS a descendant of H1#rag-.live-corpus/alpha:section:1; [3 EDIT-CASCADE] 2 editable p:1 copies", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-HIST-2", "block": "toolbar_undo", "verdict": "PARKED", "assertion": "After an edit the Undo control is enabled and a real click reverts the content AND re-disables the control at base", "dclass": "D-state", "realInput": true, "evidence": "PARKED — precondition: the control was ALREADY enabled before the edit (before=false => the journal was not at base; 18 entries), so the 're-disables at base' half is untestable. Observed: afterEdit=false (enabled); real click path=cdp -> revert observed=true (edited content gone from the store read-back); afterClick=false", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } },
    { "row": "UF-STAGE-6", "block": "toolbar_toggle", "verdict": "PASS", "assertion": "A REAL click on the editor-toolbar mode toggle flips the editing mode live", "dclass": "D-interaction", "realInput": true, "evidence": "real hit-tested click '#editor-toolbar-toggle' (path=cdp) -> data-mode contenteditable->textarea, flipped=true", "proxyPASS": false, "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } }
  ],
  "summary": { "total": 16, "pass": 3, "fail": 10, "parked": 3 }
}
```

**Row-set / count reconciliation.** `summary.total` = **8** = the §5.U U-row count
(U-1..U-8), NOT the block count (56 blocks executed/steps across 5 runs); the reported
matrix row set equals the MATRIX_ROWS row set exactly (the driver printed
`row-set reconciliation: matrix=8 … OK` on every run). The driver's own
`MATRIX_ROWS` mapping is `U-1->uf_panes_12 U-2->uf_tabs_7 U-3->uf_panes_12
U-4->uf_layout_10 U-5->uf_layout_10 U-6->uf_panes_8 U-7->uf_hist_6 U-8->uf_tabs_3`;
this report additionally credits the blocks the matrix names as secondary
(`uf_panes_14` for U-2/U-3 via the `blocks` field). The extended row set is the 14
`ROW_EXTENDED` rows; **16 extended blocks actually emitted a row this pass** — the 14
`ROW_EXTENDED` rows **plus `UF-HIST-4` (`uf_hist_4`) and `UF-LAYOUT-2` (`uf_layout_2`)**,
which the driver also counts as extended rows (`extendedVerdict = reportRows` minus the
`U-n` ids; the driver's own line reads `EXTENDED rows (16 of 14 defined)`). Both are
reported above with the same §6.1 fields. The 14-row extended summary of the previous
emission was `{ pass: 2, fail: 9, parked: 3 }` — the 2 PASSes `UF-STAGE-3` /
`UF-STAGE-6`, the 9 FAILs the `UF-DEFECT-1/3/5/6/7/8` + `UF-KEEP-1/3` + `UF-STAGE-2`
live re-confirmations, and the 3 PARKs `UF-DEFECT-2` (`user2_pane_drag`, in-viewport
precondition), `UF-STAGE-4` (`repro_nbsp`, measurement-only diagnostic) and `UF-HIST-2`
(`toolbar_undo`, journal-not-at-base). **Adding the two previously-unreported rows moves
the extended summary to `{ total: 16, pass: 3, fail: 10, parked: 3 }` — `UF-HIST-4` is
a FAIL (no accepted verdict; parked on the at-base journal precondition) and
`UF-LAYOUT-2` is a FAIL (no accepted verdict; a non-gesture oracle that cannot PASS).
The per-row verdicts in the table above are authoritative; a reader diffing this
emission against the previous one should re-derive the pass/fail partition from the
rows themselves.** The other blocks run in run 1
(`uf_tabs_1`, `uf_tabs_4`, `uf_settings_2/3/4/7`, `uf_panes_10`, `uf_panes_1`,
`uf_search_2`) carry no `ROW_EXTENDED` id and are reported as measured diagnostics, never
as row verdicts.

**Provenance / non-reproduction notes (for the §6.2 audit).**
1. The 5 driver runs re-seed `.live-corpus/alpha|beta` on every attach (a journal
   `batch` entry each), so the journal grew to 25 entries; `uf_hist_4` sized its walk
   from the live entry count and restored the cursor exactly (verified by
   cursor + document count + a store-view hash: `currentIndex=18`,
   `docs=65`, `alphaStoreSig=3nodes/1378802192`).
2. The two PARKED rows are the only non-executed rows in the row sets; both have their
   precondition measured and recorded, and both were answered by a read-only probe
   (§4 NEW-1/NEW-3) so neither park is a product claim.
3. The read-only probes (`/tmp/probe/*.mjs`, outside the repo) attached to the same MCP
   + CDP surfaces, never spawned or killed an app, and drove only gestures the driver
   already drives (plus one scroll-into-view for the header). No source file,
   `scripts/live-drive.mjs`, `docs/defects.md`, `docs/next-steps.md` or the checklist
   was edited by this pass — the only file written is this report.
4. **Post-run tracker remediation (documentation review, 2026-09-15).** The staleness
   findings this report raised against the trackers — **F-6** (F-1/F-3 still OPEN in
   `docs/defects.md`), **NEW-5** (same, plus LIVE-UF2 carried as confirmed) and the
   report-side gaps this review found (the extended row set was short by `UF-HIST-4` /
   `UF-LAYOUT-2`; the block count read 69 instead of 56) — were fixed in
   `docs/defects.md`, `docs/next-steps.md`, `docs/specs/user-flow-audit-checklist.md`,
   `docs/specs/live-user-flow-scenarios.md` and this file by the documentation-review
   pass recorded in `archive/reviews/2026-09-15-user-flow-audit-doc-review.md`. The
   runner's own evidence above is unchanged; only the tracker/report text was
   reconciled. **NEW-2's trigger and NEW-4's harness caveat are now recorded in the
   OPEN F-2 row.**
