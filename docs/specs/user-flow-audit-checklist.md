# USER-FLOW AUDIT CHECKLIST — spec-census → live-scenario matrix for the Astrographer UI-overhaul

**Purpose.** This is the **spec-census → live-scenario matrix** the
`user-flow-audit-review` gate (A) mandates: every user-visible flow and element the
UI-overhaul specs bind, with one proposed **live assertion** that pins the
**USER-VISIBLE end state** (review (D): never a seam/presence/attribute/class/slot
proxy — a real user gesture must produce a user-visible result). It is the direct
input to `role_live_scenario_runner` / `scripts/live-drive.mjs`; each row is a
runnable live block.

**Binds.** `docs/specs/ui-overhaul.md` (C1–C20 + the pane-layout model §3 + the
MCP/UI-pane grouping G1–G10, §4) and the unit specs that define the actual
surfaces: `unit-u-shell-1-layout-zones.md` … `-9b-cross-document-shared.md`,
`unit-u-shell-shell-wiring.md`, `unit-u-state-1*.md`, `unit-u-edit-1/2.md`,
`unit-u-import-1-import-surface.md`, `unit-u-menu-1-application-menus.md`,
`unit-l-textarea-editing-ui.md`, `unit-u4-contenteditable-editor.md`
(+ `unit-u2-rich-decompose.md`), `unit-live4-empty-store-landing.md`,
`unit-live11-bridge-seams.md`, `unit-live8-toolbar-undo-refresh.md`, and
`mcp-endpoint.md`.

**Coverage vocabulary.** `NONE` (not yet authored) |
`scenario authored [name]` (the block exists in `live-user-flow-scenarios.md` /
`live-drive.mjs`) | `confirmed defect LIVE-UF#` (reproduced, cross-ref
`docs/defects.md` + `live-user-flow-scenarios.md`) | `PASS-not-reproduced`
(a user report was re-driven and the behavior HOLDS live — keep-row).

> **Layer note (RCA-12).** These are APP-level (assembled-renderer) assertions,
> not envelope/node greens. Where a node-green / prior "FIXED" row claims a
> behavior that the LIVE app contradicts, the contradiction is a finding and the
> row stays OPEN until a live PASS.

**Status (2026-09-15 session — SUPERSEDED for LIVE-UF2 by the LATER block below).**
8 defs confirmed at the time of the first run:
**LIVE-UF1** new-tab inert,
**LIVE-UF2** pane-drag inert (**since CONTRADICTED + FIXED — see the LATER block below**), **LIVE-UF5** history-in-main-canvas,
**LIVE-UF6** duplicate-editable-paragraph, **LIVE-UF7** zone-resize-no-grip,
**LIVE-UF8** zone-no-visible-boundary, **LIVE-UF9** open-in-tab-shows-doc,
**LIVE-UF10** collapsed-zone-tab-horizontal. 3 not-reproduced keep-rows:
**scenario-3** collapse-re-orients-layout-vertical (PASS),
**scenario-4** main-editable-commits (PASS), **scenario-6** search-no-flicker (PASS).

> **STATUS UPDATE (2026-09-15, LATER — the user-flow-audit pass; this is the current
> state, superseding the paragraph above).** The battery was widened to **24 `uf_*` row
> blocks** — **18 report-row blocks** + 6 non-row blocks: 2 attribution diagnostics
> (`uf_panes_12_diag`, `uf_tabs_7_diag`), 2 mount diagnostics (`uf_mount_diag`,
> `uf_mount_leak_diag`) and 2 harness-hygiene blocks (`uf_scroll_reset`,
> `uf_restore_layout`) — and re-run live against the assembled app; the authoritative
> per-row verdicts now
> live in **`docs/specs/user-flow-audit-coverage-2026-09-15.md`** (the §6.1
> matrix-with-verdict report, audited per §6.2 of `docs/specs/user-flow-audit.md`).
> Live deltas:
> **(a) LIVE-UF2 pane-drag is CONTRADICTED** — the original repro dragged from an
> off-viewport header; with the header in view a real drag DOES reorder the zone slots
> (`doc-nav,search` → `search,doc-nav`) ⇒ LIVE-UF2 **FIXED + LIVE-CONFIRMED**
> (`docs/defects.md`), so the confirmed-defect count below is **7, not 8**.
> **(b) THREE NEW live defects** found and recorded: **F-1 PANE-BODY-GESTURE-SWALLOWED**
> (high — a real click on a clickable row INSIDE an app-graph pane retargeted to
> `.pane-frame`), **F-2 WIKI-ROOT-MOUNT-LEAK** (high — **7 `#wiki-root` mounts / 6 stale**,
> page ≈209 473px on the running store; the trigger is now measured: the empty↔filled
> pane-set transition, +1 mount each way), **F-3 EMPTY-ZONE-TRACK-NOT-COLLAPSED** (medium).
> **F-1, F-2 and F-3 are FIXED + LIVE-CONFIRMED** (F-2 via the `tearDownGraph` `#wiki-root` mount sweep, 2026-09-16 — see the F-2 row in `docs/defects.md`).
> **(c) Row coverage is 24 rows executed this pass** — the **8 §5.U matrix rows**
> (U-1..U-8: 6 PASS / 1 FAIL (U-4, F-2) / 1 PARKED (U-7, harness precondition)) plus the
> **14 `ROW_EXTENDED` rows + 2 further checklist rows the driver also emitted**
> (`UF-HIST-4` via `uf_hist_4`, `UF-LAYOUT-2` via `uf_layout_2` ⇒ **16 extended rows:
> 3 PASS / 10 FAIL / 3 PARKED**). The rows still not driven, and the reason each is
> uncovered, are enumerated in the §6.1 report §3 (`docs/next-steps.md` CURRENT WORK
> has the queue).
> **U-4 STATUS UPDATE (2026-09-17):** the U-4 **FAIL** above was the **2026-09-15 PRE-FIX
> run** — the F-2 mount leak is **NOW FIXED** (the `Runtime.tearDownGraph` `#wiki-root`
> mount sweep, `src/renderer/runtime.ts:1047-1068`, 2026-09-16); the U-4 FAIL verdict and
> the 7-mount / ≈209 473px numbers are retained here as **historical provenance** for the
> pre-fix build. The remaining owed item is a live **U-4 row re-run against the CURRENT
> build** (`singleRootMountAndStageInViewport` on the current `dist/`), **not an open
> defect** — see the F-2 row in `docs/defects.md`.
> **NOTE — this block is the current status for the ROWS BELOW:** several row cells still
> read `confirmed defect` / `NONE` from the first run. Moved to live **PASS** this pass:
> `UF-PANES-1/8/10`, `UF-TABS-1/3/4/7`, `UF-LAYOUT-10`, `UF-SETTINGS-1/2/3/4/5/7`,
> `UF-SEARCH-2`, `UF-STAGE-3`, `UF-STAGE-6`; moved to live **PARKED (precondition, not a
> product claim)**: `UF-HIST-4/6`, `UF-DEFECT-2`, `UF-STAGE-4`, `UF-HIST-2`; still
> **FAIL (open defect)**: `UF-SHELL-3`
> (LIVE-UF1), `UF-LAYOUT-5/6` (LIVE-UF7), `UF-LAYOUT-7` (LIVE-UF8), `UF-PANES-7`
> (LIVE-UF10), `UF-TABS-2` (LIVE-UF1), `UF-TABS-6` (LIVE-UF9), `UF-STAGE-2` (LIVE-UF6),
> `UF-HIST-1` (LIVE-UF5); **CONTRADICTED + FIXED**: `UF-PANES-4` (LIVE-UF2).
> **(d) Assertion discipline hardened:** a live PASS must pin the user-visible end state
> with a REAL hit-tested gesture (no seam/presence/attribute/class/slot/computed-style
> proxy; `proxyPASS:true` can never be a PASS) — `docs/specs/user-flow-audit.md` §3.

---

## 1. Shell / chrome (window frame, tabs bar, app region, new-tab, branding)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-SHELL-1 | Window top bar is the browser-style tab strip (outer-chrome), not a title below the header | ui-overhaul C14 §3; unit-u-shell-9a §2.1; defects LIVE-2 | The `#tab-strip` renders in the **top** bar region (outer chrome), ABOVE the header pane zone and the body row; no demo `<header><h1>Provident-Electron…` subtitle sits above the tabs | scenario `user6_search_no_flicker` / `user1_tab_new` exercise the strip; LIVE-2 FIXED — assert only |
| UF-SHELL-2 | Window drag region (app-region) | ui-overhaul C14; defects LIVE-2 fix (`titleBarStyle:'hidden'` + titleBarOverlay) | The top-bar tab-strip area is a working drag region (dragging the empty strip area moves the OS window); min/max/close overlay is present top-right | NONE (OS-owned geometry, live-assert via window bounds on a real drag) |
| UF-SHELL-3 | **New-tab button** (`[data-tab-new]` / the `+`) creates a USABLE tab | ui-overhaul C14 §3; unit-u-shell-9a §2.4 + HOST-3 (non-first `+` no-op); defects **LIVE-UF1** | A real click on `[data-tab-new]` in a **seeded non-empty store** increases `.tab` count AND yields a usable view (a new/empty document draft or the landing) — the click is **never a silent no-op / never just re-titles the active tab** | **confirmed defect LIVE-UF1** (scenario `user1_tab_new` FAIL: `.tab` 3→3, no usable target) |
| UF-SHELL-4 | Astrographer branding (not the forked demo title) | defects LIVE-1; decision `APP-BRANDING-IN-TOP-BAR` | At boot the app NAME is the top-bar NAMEPLATE (`#tab-strip h1.app-nameplate`, in the window drag row) and NO separate `<header>` block exists; the tagline DESCRIPTION renders on the LANDING page only (`#stage-landing` → `H2:"Astrographer"` + the description `P`). **LIVE-VERIFIED 2026-09-16** (nameplate `[4,0,98,36]` in the strip, `headerPresent=false`, app top 126→36, landing carries the tagline) — re-pinned; the old "assert only" wording is superseded. |

---

## 2. Layout / zones (the `#wiki-root` grid, placement, resizing, gutters, boundaries)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-LAYOUT-1 | The shell body is a grid with named areas top-bar → header → (left \| stage \| right) → footer | ui-overhaul §3; unit-u-shell-1 §2.4/§2.6 pin 8 | `#wiki-root` (or the body grid) has named areas `top-bar`, `header`, `left`, `stage`, `right`, `footer` with the mid row `left | stage | right` (no composite `main` area); `zone:left` renders LEFT of the stage and `zone:right` (when populated) RIGHT of it | LIVE-6 FIXED (layout); scenario `user8_zone_boundary` reads `#wiki-root` columns — assert grid columns |
| UF-LAYOUT-2 | **zone containers are provident nodes** (MCP-visible, dispatchable identity) | ui-overhaul §3/§7.3 OB2; unit-u-shell-1 §2.3 | `provident.list_targets` includes stable `zone:left`/`zone:right`/`zone:header`/`zone:footer` nodes with stable ids AFTER a RAG content change | NONE (MCP probe) |
| UF-LAYOUT-3 | Zone placement: a pane lives in its declared zone | ui-overhaul §3 (default `left`, movable); unit-u-shell-1 §3 state 2 | A pane whose `LayoutState` entry puts it in `right` renders in the right column, not `left`; the `left` order reflects its entries | NONE |
| UF-LAYOUT-4 | The `stage` is the largest central cell (content-stage formatting scope) | ui-overhaul C2 §3; unit-u-shell-1 §2.4 | The central `zone:main`/stage is the largest grid cell and its content is scope-isolated from sidebar/menu chrome (document typography is independent) | NONE |
| UF-LAYOUT-5 | **Real gutter drag resizes a zone** by >10px | ui-overhaul C7; unit-u-shell-5 §3.1; defects **LIVE-UF7** | A REAL CDP pointer grab at the zone's boundary edge (`x ≈ zone.x + zone.width`) and drag +72px changes `[data-zone="left"]` width by >10px | **confirmed defect LIVE-UF7** (scenario `user7_zone_resize` FAIL: 220→220 Δ0) |
| UF-LAYOUT-6 | The **gutter is a real, user-reachable grip** (non-zero hit-area, in the grid track) | unit-u-shell-5 §2.1/§2.6 H-5; defects **LIVE-UF7** | `.gutter[data-zone]` has a non-zero bounding width and sits AT the zone boundary (not `0×0` at `(0,0)` with `grid-area:auto`); `elementFromPoint` at the boundary hits the gutter, NOT the contenteditable paragraph | **confirmed defect LIVE-UF7** (scenario `user7_zone_resize` DIAG: seam works only on the hidden element) |
| UF-LAYOUT-7 | **Visible boundary between side zone and stage** | defects **LIVE-UF8**; unit-u-shell-1 §2.4 | A visible separator (zone background/border differing from the stage, a real grid-`gap` >0, or a visible gutter) divides `[data-zone="left"]` from `#zone:main`; the two do NOT read as one continuous surface | **confirmed defect LIVE-UF8** (scenario `user8_zone_boundary` FAIL: `boundary-visible=false`) |
| UF-LAYOUT-8 | Gutter drag commits exactly ONE resize write per gesture (no per-move stream); clamped to min/max | ui-overhaul §2.1 Table B + §2.2; unit-u-shell-5 §2.1/§2.2/§3.5 | After one drag the persisted `LayoutState.zones.left.size` changes once (restart re-applies it) and never goes negative/NaN | NONE |
| UF-LAYOUT-9 | Gutter **double-click resets** the zone to its registry-default size | unit-u-shell-5 §2.2/§2.5 pin 5 | Double-clicking a gutter restores the zone's default track size (a finite positive default) | NONE |
| UF-LAYOUT-10 | Empty zone auto-hides; its grid track collapses; the stage reclaims the space | ui-overhaul C11 §3; unit-u-shell-4 §2.3; unit-u-shell-8 §2.3 | With zero enabled+placed panes in `left`, the `left` track width collapses toward 0 (the `is-empty` mirror is applied) and the stage widens | NONE; scenario-adjacent `user8_zone_boundary` |
| UF-LAYOUT-11 | Hidden zone reveals as a provisional drop target on drag proximity; re-hides when the pointer leaves / on an illegal or aborted drop | ui-overhaul C11; unit-u-shell-4 §2.3/§4 F4 | Dragging a pane near a hidden zone's edge reveals a visible drop target (`is-revealed`); moving away re-hides it; an operator-pane drop into an app-graph zone does NOT reveal/accept | NONE |
| UF-LAYOUT-12 | Zone's last size is retained when it empties and restored when it refills | ui-overhaul C11 §3; unit-u-shell-1 §2.4 | Empty then refill `left` → the restored width equals the pre-empty size (not a fresh default) | NONE |

---

## 3. Panes (collapse/expand, drag, titles, minimize/zone-tabs, orientation, visibility, per-pane content)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-PANES-1 | **Per-pane collapse toggle** (C5) collapses a pane to header-only and re-expands it | ui-overhaul C5; unit-u-shell-3 §2.1/§2.2; unit-live11 §2.2 | A real click on `.pane-collapse-toggle` (e.g. `#pane-collapse-doc-nav`) renders the pane header-only with NO body (body-less `is-collapsed` frame); a second click re-expands the SAME pane root (identity stable) | LIVE-11 FIXED; scenario `user2_pane_drag` clicks the header; assert collapse flips |
| UF-PANES-2 | Collapse state persists across restart + a RAG content change | unit-u-shell-3 §2.3/§3 state 5 | Collapse doc-nav, then relaunch (shared `--home`): doc-nav stays collapsed; a content re-derive keeps it collapsed | NONE |
| UF-PANES-3 | **Pane titles are visible** in the frame header | defects LIVE-10; unit-u-shell-3 §2.5 | Every pane frame shows a visible title bar (the pane's `title`/def name), not just the collapse toggle | NONE — LIVE-10 FIXED, assert only |
| UF-PANES-4 | **Real header drag reorders/relocates a pane** (C4) | ui-overhaul C4; unit-u-shell-4 §2.2; defects **LIVE-UF2** | A REAL pointer grab on a pane's header (the `.pane-collapse-toggle` strip) dragged PAST the next sibling and released changes the left-zone `.pane-frame[data-pane-id]` order (or the dragged pane's `y`/position); not inert | **confirmed defect LIVE-UF2** (scenario `user2_pane_drag` FAIL: slot order unchanged, doc-nav y unchanged) |
| UF-PANES-5 | Relocation across zones is scope-constrained | ui-overhaul §3 "Relocation legality" + §5 item 7; unit-u-shell-4 §2.2 | An app-graph pane moved to `right` renders there; an operator pane cannot be moved into any app-graph zone (the target never accepts/reveals) | NONE |
| UF-PANES-6 | **Zone minimize → tab-list** (C12): sidebar zone tabs are a vertical column; header/footer tabs are horizontal | ui-overhaul C12 §3; unit-u-shell-4 §2.4/§2.5 pin 4 | Click `#zone-minimize-left`: the 7 pane frames collapse to `.pane-tab` strips stacked as a COLUMN (distinct increasing `y`, uniform `h=21`, equal `x`) — the strip LAYOUT is vertical | **scenario authored `user3_collapse_orientation`** — PASS-not-reproduced (vertical=true) |
| UF-PANES-7 | **Collapsed-zone label text reads VERTICAL bottom-to-top** (side bars) | ui-overhaul C12 §3 orientation; defects **LIVE-UF10** | A minimized left-zone's `.pane-tab` labels report `writing-mode: vertical-rl|vertical-lr` OR `text-orientation: upright` (NOT `horizontal-tb` / short-and-wide `57×21` "Search") — the text reads bottom-to-top | **confirmed defect LIVE-UF10** (scenario `user10_collapse_vertical_text` FAIL: `horizontal-tb`, `mixed`) |
| UF-PANES-8 | Clicking a minimized-zone tab **expands the zone and selects that pane** | ui-overhaul C12; unit-u-shell-4 §2.4 | Clicking `#zone-tab-left-<paneId>` re-expands the zone (`minimized:false`) and activates that pane's body | NONE |
| UF-PANES-9 | **Panes visibility** (C13) via View → Panes toggles a pane off/on and it applies at runtime | ui-overhaul C13; ui-overhaul §3; unit-u-shell-8 §2.2/§2.3; defects LIVE-12 | Toggling a pane OFF in View → Panes removes its `.pane-frame` from the DOM and from `provident.get_rendered_html`/`list_targets`; toggling ON restores it; hiding the last pane in a zone empties it (C11) | LIVE-12 ACCEPTED compromise; LIVE-5 round-trip confirmed |
| UF-PANES-10 | Enabled-pane first-run default = `['search','doc-nav']`; a persisted set governs later boots | unit-u-shell-8 §2.6 pin 1; defects LIVE-7 | On a FRESH store, boot shows exactly `search` + `doc-nav` panes (and the operator-scope census agrees); that default is persisted so a second launch matches | NONE — LIVE-7 RESOLVED |
| UF-PANES-11 | Pane visibility persists across restart | unit-u-shell-8 §3 state 8; defects LIVE-5 | Toggle a pane OFF via the in-pane/settings visibility control, relaunch (shared `--home`): the pane stays hidden (`data-enabled=false`, frame absent) and the operator census populates | LIVE-5 FIXED + LIVE-CONFIRMED (two real relaunches) |
| UF-PANES-12 | **doc-nav pane** shows a document list; selecting one focuses it in the stage | ui-overhaul G2; unit-u-shell-9a §2.6; PG14/SG7 | In the doc-nav pane, the document `li` items are visible/hoverable and clicking one opens/focuses that document (a real click reaches the selection seam) | NONE (PG14 open — select handler) |
| UF-PANES-13 | **crosslinks/backlinks pane** lists links/back-refs for the focused document | ui-overhaul G3; `rag.backlinks` | With a document focused, the crosslinks pane lists its links/backlinks (non-empty when back-refs exist) | NONE |
| UF-PANES-14 | **search pane** renders an input + topK and returns result rows; the rows are hoverable/clickable | ui-overhaul G4/G2, unit-u-shell-6; unit-u-shell-9a §2.6; C18 | Typing a query + submit in the search pane returns result rows; each row highlights on hover (`is-clickable`) and a row click opens the linked doc in a NEW tab | NONE |
| UF-PANES-15 | **template-editor pane** is present in the app-graph and validates/commits the template | ui-overhaul G6; code.template.* | The template-editor pane renders a template textarea and a validate/set action that produces validation feedback (or auto-commits) | NONE |
| UF-PANES-16 | **Per-pane content MCP-visibility**: an app-graph pane is present in `get_rendered_html`/`list_targets`; an operator pane is not | ui-overhaul §2 isolation boundary; unit-u-shell-7 §2.5 | For each app-graph pane (doc-nav, crosslinks, search, template-editor, gnosis-query/documents/wikis) its authored content (with handler-bearing interactive controls) appears in `get_rendered_html`; the settings/security/gnosis-status modal content does NOT | NONE (MCP probe) |
| UF-PANES-17 | Operator panes are modal-confined and MCP-invisible | ui-overhaul §4 modal boundary; unit-u-shell-7 §2.5 | With the settings modal OPEN, its `#panes`/`#operator-panes` content is absent from the app-graph MCP surfaces (isolation preserved) | NONE (MCP probe) |
| UF-PANES-18 | App-graph panes never enter the modal | ui-overhaul C3; unit-u-shell-7 §4 F9 | With the modal open, its body hosts ONLY the operator mounts — no app-graph pane frame, no `#app`/`#tab-strip` is re-parented into it | NONE |

---

## 4. Tabs (create/close/switch/activate, tab strip, open-in-tab content, cross-document)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-TABS-1 | Tab strip shows open tabs + the active tab with a highlight + a close control per tab + overflow/scroll | ui-overhaul C14 §3; unit-u-shell-9a §2.5; §2.9 pin 7 | The top-bar strip renders each open tab with a title, highlights the active one, has a per-tab close, and scrolls horizontally when many tabs exist | NONE (strip visible in scenarios) |
| UF-TABS-2 | First tab opens via the default (prev-focus → alpha-first doc → landing); every OTHER new-tab requires an explicit target | ui-overhaul C14 §3; unit-u-shell-9a §2.4 + HOST-3 | On boot with a focused non-empty store the first tab shows the default document; clicking `+` when a non-first tab is active with no target is a no-op (or requires an explicit target) — never a phantom targetless tab | **confirmed defect LIVE-UF1** covers the `+` minting a usable target |
| UF-TABS-3 | **Close the active tab** → left neighbour (else right) becomes active; closing the last tab falls back to the first-tab default page | unit-u-shell-9a §3.3/§4 F4 | Close the active tab: the neighbour activates and its content mounts; close the LAST tab: a fresh default (first-tab/landing) appears — never an empty stage | NONE |
| UF-TABS-4 | **Switch tabs** mounts only the active target's provident body; the previous body unmounts (single-active 9a) | ui-overhaul C14; unit-u-shell-9a §2.3 | Clicking a non-active document tab mounts that document's body in `#zone:main` and unmounts the prior body (stage content switches) | NONE |
| UF-TABS-5 | Reorder tabs within the strip changes `TabState.order` (no pane relocation) | unit-u-shell-9a §2.2/§2.5 + §3.4 | Dragging a tab within the strip reorders it; the open set/order persists | NONE |
| UF-TABS-6 | **Search "Open in a tab" creates a NEW tab whose stage shows the SEARCH VIEW**, not the document | ui-overhaul C14; unit-u-shell-9a §2.6 (HOST-4/HOST-5); defects **LIVE-UF9** | Real click `#pane-search-expand-tab` (`paneTabExpand`) creates a new Search tab whose `#zone:main` materializes the search view (search input/results present), NOT the open document body | **confirmed defect LIVE-UF9** (scenario `user9_search_open_in_tab` FAIL: tab created but stage shows the doc) |
| UF-TABS-7 | A search result click opens the document in a NEW tab (the search tab stays) | unit-u-shell-9a §2.6 + HOST-4 | In a search tab, clicking a result row opens a NEW `document:` tab with that document's body; the search tab remains | NONE |
| UF-TABS-8 | Editing the query in a search TAB reuses the SAME tab (re-runs in place) | unit-u-shell-9a §2.6 + HOST-5 | In an open search tab, editing + submitting the query re-runs in the SAME tab (no new tab minted); tabs never collide on a `queryId` | NONE |
| UF-TABS-9 | `provident.focus` (MCP tool, group dispatch) find-or-opens a tab / activates by target or `tabId`; `newTab:true` forces a duplicate | unit-u-shell-9a §2.7; mcp-endpoint (graph group) | `provident.focus {target:{kind:'document',documentId:<id>}}` activates an existing doc tab (or opens+activates one); `focus {target, newTab:true}` opens a duplicate; the return `TabState.activeId` reflects the result; **no `app-graph-changed` broadcast** fires (focus is not a graph mutation) | NONE (MCP probe) |
| UF-TABS-10 | Two document tabs with a **shared RAG node** materialize duplicate, **globally-unique scoped subtrees** (per-document `rag-<doc>--<ragId>` ids, plain `data-rag-node-id`) | unit-u-shell-9b §2.1/§2.7 (H3) | Open doc A and doc B that share node `rag-X`: the DOM contains TWO scoped roots with DIFFERENT authored ids (`rag-A--X`, `rag-B--X`) and NO duplicate `id="rag-X"` in the same graph | NONE (needs U-STATE-1e/9b — currently BLOCKED) |
| UF-TABS-11 | **Simultaneous render**: two document tabs open → both bodies are mounted in the stage; editing one does not unmount the other | ui-overhaul C14/§3; unit-u-shell-9b §2.1/§2.3 states 3 | With two document tabs open, both documents' bodies render; editing in one leaves the other's body mounted | NONE (9b — BLOCKED on U-STATE-1e) |
| UF-TABS-12 | Tab state (open set + active + order) survives restart + a RAG content change | unit-u-shell-9a §2.5/§3.9 | Relaunch with persisted tabs: open tabs + active + order restore; a content change does not close/reorder tabs | NONE |

---

## 5. Stage / document (landing, per-paragraph single-render, editability, editing-mode, commit-on-blur, caret)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-STAGE-1 | **Empty-store landing** co-authored with panes + toolbar in ONE graph | unit-live4 §2.1 INV-E1/F-L4-1; unit-u-shell-9a §2.3 | Boot against a TRUE empty store (`--no-seed`): `#stage-landing[data-stage='landing']` coexists with `#editor-toolbar` and ≥1 `.pane-frame[data-pane-id]` in one graph; a still-empty content re-derive keeps it; importing the first doc removes it (no phantom) | LIVE-4 FIXED + LIVE-CONFIRMED (`boot_landing`); assert only |
| UF-STAGE-2 | **Per-paragraph single render; NOT nested inside the doc-head header** | ui-overhaul §3.1; defects **LIVE-UF6**; unit-l-textarea §5.1 | Focus a document with `h1` + a following paragraph: `[data-rag-node-id="…:p:1"]` matches exactly ONE editable `<p>` that is a SIBLING content root, NOT a descendant of the `<h1 data-doc-head>`; each RAG paragraph appears exactly once | **confirmed defect LIVE-UF6** (scenario `repro_dup_para`: 2 editable copies, nested AND sibling; TOP→BOTTOM one-way cascade) |
| UF-STAGE-3 | **Main view is editable and a normal edit COMMITS on blur** (textarea mode) | unit-u-shell-4 note; unit-l-textarea §5.2/§5.6; keep-row scenario 4 | Focus the editable node, `Input.insertText` a unique marker, `.blur()`, wait: `rag.get_document` (store read-back) contains the marker AND it renders — the edit commits and re-renders | **scenario authored `user4_main_editable`** — PASS-not-reproduced (main IS editable + commits) |
| UF-STAGE-4 | **Typing a normal space commits as 0x20 (not collapsed/lost)** | unit-u2-rich-decompose §1.7 whitespace ("whitespace preserved AS-IS, no trimming/collapsing"); unit-u4 | In the editable text, type `a<space>b`, blur, read back: the store content contains the ASCII 0x20 between `a` and `b` (a single space survives, not collapsed/`&nbsp;`-converted) | **scenario `repro_nbsp`** (referenced in user-flow-audit-review §1); run/confirm |
| UF-STAGE-5 | Rich/contenteditable mode: eligible roots are `contenteditable`, decompose ONCE + `edit.commitRich` ONCE per real blur | ui-overhaul C8; unit-u4 §2.1/§2.2; unit-u5 | In HTML mode, typing into a rich-eligible root, blur → decompose called ONCE, one `commitRich` (one `IPC_EDIT_RICH_COMMIT`); the committed `{content,children}` round-trips into the store | NONE |
| UF-STAGE-6 | **Markdown ↔ HTML editing-mode toggle** (editor toolbar, app-graph) flips the mode live | ui-overhaul C8; unit-u-edit-1; defects LIVE-9 | A real CDP click on the editor-toolbar toggle flips `data-mode` `contenteditable`→`textarea` (and back); the persisted `editingMode` follows; the control reflects the current mode | LIVE-9 FIXED + LIVE-CONFIRMED (`toolbar_toggle` PASS on a real click) |
| UF-STAGE-7 | Content-stage formatting isolation (content-scope root) | ui-overhaul C2/Q5 | The document content renders under a content-scope boundary so doc typography/spacing is independent of sidebar/menu chrome | NONE |
| UF-STAGE-8 | Document body renders under its own RAG content roots; node identity survives a content change | ui-overhaul §3.1 (C10); unit-u-state-1 | After an `edit.set_content`, the mounted content root for the edited node keeps its `id` (a reconcile, not a teardown); MCP `provident.dispatch` targets remain valid | NONE |
| UF-STAGE-9 | Caret is saved on blur and restored after a re-derive (one-shot; not stolen on a no-op blur) | unit-l-textarea §5.4; unit-u4 §1.2 | Edit in a textarea / contenteditable, blur (dirty) → after the re-derive the caret offset (and focus when dirty) is restored into the re-rendered control exactly once, not on every later re-derive | NONE |
| UF-STAGE-10 | Dirty-edit guard: a re-derive while an edit is in-flight is queued, not executed | unit-l-textarea §5.5; unit-d | Type into an editable node (node dirty); trigger a re-derive → it is QUEUED (not executed); blur/commit clears the dirty flag and the queued re-derive runs | NONE |

---

## 6. Search (open-in-tab content, advanced-search dropdown, results navigation)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-SEARCH-1 | Switching to the Search tab shows the search view with NO landing flicker/overlay | keep-row scenario 6 | Click the Search tab, sample the stage 3× (t+800/t+1800/t+3000): the search tab is active and `#stage-landing` does NOT re-render over it (no flicker) | **scenario authored `user6_search_no_flicker`** — PASS-not-reproduced |
| UF-SEARCH-2 | **Advanced-search dropdown (C18)** exposes the full `rag.query` arg surface (mode/maxHops/expand/maxParentContext/filters/stores:'all') in a disclosure sub-pane | ui-overhaul C18/G4; ui-overhaul §7 Q23 | The search pane has an advanced disclosure that reveals mode/maxHops/expand/maxParentContext/filters/stores controls; submitting with advanced args reaches `rag.query`'s full surface | NONE |
| UF-SEARCH-3 | Search results show citations/result detail (the `rag.query` result fields) | ui-overhaul §4 G4; §5.4 | A search result row exposes the result content and, where returned, `citations`/`trace` detail | NONE |
| UF-SEARCH-4 | Streamed/audit surfaces are parked (documented absence, not a defect) | ui-overhaul §5.5 PG5/PG6; §4 G4 | No streamed-results/audit UI is REQUIRED (PARKED); assert only that the MCP `rag-stream`/`get_query_audit_log` remain, no GUI promised | NONE (parity coverage row) |

---

## 7. Settings modal (open/close, operator panels, enabled-panes census, defaults, lazy-load)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-SETTINGS-1 | Settings is **hidden by default**; a fixed bottom-left sidebar toggle opens the modal | ui-overhaul C3; unit-u-shell-7 §2.2/§3b state 8 | At boot `#settings-modal` is `.is-closed` (hidden); clicking `#settings-toggle` flips the frame class to `.is-open` and the operator panes are visible | NONE (U-SHELL-7 landed; assert live) |
| UF-SETTINGS-2 | Modal open/close: toggle flips; Escape closes; a dedicated scrim-click closes; content-click does NOT close | unit-u-shell-7 §2.4/§3b states 9-11 | With the modal open, pressing `Escape` closes it; clicking `#settings-modal-scrim` closes it; clicking the modal CONTENT does not; the frame always carries exactly one of `.is-open`/`.is-closed` | NONE |
| UF-SETTINGS-3 | The modal hosts BOTH operator mounts (`#panes` + `#operator-panes`) re-parented (isolation preserved) | unit-u-shell-7 §2.5/§3b state 12 | With the modal open, `#settings-modal-body` contains `#panes` (Security/Debug/Modules) + `#operator-panes` (settings + gnosis-status); neither graph is rebuilt; both remain MCP-invisible | NONE |
| UF-SETTINGS-4 | **Enabled-panes census** populates at boot (not empty until an edit) | defects LIVE-7; unit-u-shell-8 §2.6; unit-u-shell-7 §5.8 | Open the settings modal → `#operator-enabled-panes` is populated (search + doc-nav on a fresh store, or the persisted set) at first render, without an edit | NONE — LIVE-7 RESOLVED |
| UF-SETTINGS-5 | Operator settings reflect topK / editing-mode / default-doc | ui-overhaul G8; unit-u-shell-7 §5.8 #operator-topk/#operator-editing-mode/#operator-default-document | The settings modal shows `#operator-topk`, `#operator-editing-mode`, `#operator-default-document` (plus `#operator-rag-stores` and registry manage), populated from the store | NONE |
| UF-SETTINGS-6 | Settings state is lazy-loaded-fixed; a fresh-store default drives an agreeing census and later boots | defects LIVE-7 | On relaunch, settings (topK/editing-mode/enabled-panes) populate at boot; the persisted `enabledPanes` list and the rendered census agree across a restart | LIVE-7 (two-launch round-trip) — assert only |
| UF-SETTINGS-7 | In-pane pane-visibility toggle in the modal works (a real click flips a pane off and persists) | unit-live11 §2.3/§7 | In the settings modal, the per-pane `[data-pane][data-enabled]` control toggles a pane's enabled state, persists, and the frame is removed/restored | LIVE-11/LIVE-12 seam FIXED + LIVE-CONFIRMED |

---

## 8. Editing / history (undo/redo enabled-state, history placement, click-to-point)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-HIST-1 | **History/undo/redo segment renders inside a PANE (`.pane-frame`), NOT in the main canvas** | ui-overhaul C16/G1; unit-u-edit-2; defects **LIVE-UF5** | `[data-role="history"]`/`#pane-history` is a descendant of a `.pane-frame` and is NOT inside `#zone:main` | **confirmed defect LIVE-UF5** (scenario `user5_history_in_pane` FAIL: ancestry `#pane-history → #zone:main`) |
| UF-HIST-2 | **Undo/Redo enabled-state refreshes on the CONTENT re-derive path** | unit-live8 §2.1/U-LIVE8; unit-u-edit-2 §2.1 | Edit a node (journals `undoDepth 0→1`) → trigger the content re-derive → `#editor-toolbar-undo` (`data-role='history-undo'`) is `disabled === false` (LIVE); a click reverts the edit | LIVE-8 FIXED + LIVE-CONFIRMED (`toolbar_undo` block) |
| UF-HIST-3 | Undo reverts; Redo re-applies; both symmetric | unit-u-edit-2 §2.1/§2.5; unit-live8 §2.2 | Click `#editor-toolbar-undo`: the edited content reverts in the DOM/store; Redo re-applies; the undo/redo depth states flip accordingly | LIVE-8 confirmed via `toolbar_undo` |
| UF-HIST-4 | Undo/Redo disabled at the base (empty stack); Redo disabled with no redo stack | unit-u-edit-2 §3.1/§4 F1/F2 | At base, `#editor-toolbar-undo` is `disabled`; after one undo, `#editor-toolbar-redo` is enabled and re-undoing past the floor is a safe no-op (no throw) | NONE |
| UF-HIST-5 | **History sub-pane lists journal entries in order (content/structural/batch)** | unit-u-edit-2 §2.2/§2.3/§2.5 | The history pane lists the project-journal entries (kind + index + `at`) in order, sourced from `RagStore.journal()` via `IPC_RAG_JOURNAL` | NONE |
| UF-HIST-6 | **Clicking a history entry undoes the journal to that point** (N repeated `undo`); no `replay` control | ui-overhaul C16; unit-u-edit-2 §2.2/§3.5 | After several edits, clicking an older history entry reverts the content to that journal point (multi-step undo), and the history position reflects it; the UI offers NO `replay` control | NONE |
| UF-HIST-7 | History survives a RAG content change (project journal not wiped) | unit-u-edit-2 §2.3/§2.4 | After a content re-derive, the history list and undo/redo depths persist (project-journal source) | NONE |

---

## 9. Import (File → Import…, multi-file, folder, cap, fail-loud, broadcast)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-IMPORT-1 | Native **File → Import…** opens an `.md`/`.markdown` multi-file dialog (all platforms) | ui-overhaul C17; unit-u-import-1 §2.1-§2.3; unit-u-menu-1 §2.3 | The File menu has `Import…`; on win/linux also `Import folder…`; `Import…` uses `['openFile','multiSelections']` with the `md`/`markdown` filter | NONE (OS-owned dialog — structural park allowed: RCA-11) |
| UF-IMPORT-2 | Selecting one/more `.md` files imports them through the SAME `importMarkdownCorpus` handler as `edit.import_markdown` | unit-u-import-1 §2.4/§6 parity | A real import of a `.md` file populates the store (`rag.list_documents` gains the doc) and re-renders content-only (C10) | NONE (dialog park) |
| UF-IMPORT-3 | **Import folder…** (win/linux) = `['openDirectory']`; a folder expands to its top-level `.md`/`.markdown` (non-recursive, dot/symlink-skipped) | ui-overhaul Q17; unit-u-import-1 §2.1/§3a | A directory import pulls in top-level `.md`/`.markdown` only — a nested `sub/c.md` is NOT imported; dot-dirs/symlinks skipped | NONE (dialog park) |
| UF-IMPORT-4 | **File-count cap (512) FAILS LOUD** (never a silent truncated import) | unit-u-import-1 §2.1 rule 6/§4 F6; Q17 | A selection/directory exceeding 512 files surfaces a `cap-exceeded` result (`IPC_IMPORT_RESULT { ok:false, reason:'cap-exceeded', cap:512 }`) and imports NOTHING | NONE (dialog park) |
| UF-IMPORT-5 | **Import result broadcast** `IPC_IMPORT_RESULT` fires exactly once per non-cancel run; a cancelled dialog fires none; success also fires `IPC_RAG_STORE_CHANGED` once | unit-u-import-1 §2.5/§3b states 9-10 | A successful import surfaces an `ImportResultPayload` (ok:true with documentIds/nodeCount/edgeCount/resolvedCount) once and re-renders; a cancelled dialog produces no broadcast | NONE (dialog park) |
| UF-IMPORT-6 | Import addresses the DEFAULT store with a server-fixed `corpusRoot` | ui-overhaul Q18/Q13; unit-u-import-1 §2.4/§7 | After an import, the new documents land in the default store's corpus; the browse surface does not re-root the corpus | NONE (dialog park) |

---

## 10. Gnosis GUI (panes, status, wikis/documents)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-GNOSIS-1 | **gnosis-wikis pane** lists wikis (wiki.get/list) | ui-overhaul G5; §4.11 (13 EXISTS) | The gnosis-wikis pane renders the wiki `<li>` items from `gnosis.wiki.list`; clicking a wiki (get) shows it | NONE (HOST-GUI-DOCS-PANE deadlock FIXED) |
| UF-GNOSIS-2 | **gnosis-documents pane** lists documents for the selected wiki (no whole-pane `unavailable` deadlock) | ui-overhaul G5; defects HOST-GUI-DOCS-PANE-DEADLOCK | Select a wiki in the gnosis-documents pane → the pane renders its document list (not a permanent `data-gnosis-state="unavailable"` with 0 clickable items) | NONE (deadlock FIXED + live-verified) |
| UF-GNOSIS-3 | **gnosis-query pane** calls the real `rag.query`-equivalent `gnosis.query` bridge | ui-overhaul §5.7a HC clean; G5 | Submitting in the gnosis-query pane runs the real engine query and renders results | NONE |
| UF-GNOSIS-4 | **gnosis-status pane is operator/modal-confined** and MCP-invisible; the `gnosis.status` MCP tool is separate | ui-overhaul G5/G8; §5.7a | The gnosis-status pane renders inside the settings modal; a status refresh (`#gnosis-status-refresh`) updates it; it is absent from app-graph MCP surfaces | NONE |
| UF-GNOSIS-5 | `gnosis.document.update` is NOT hollow (the editor path fills the graph body) | ui-overhaul §5.7a HC1 | (HC1 documented) The docs-pane Update does not blank content with an empty-graph placeholder — a real graph-edit surface (the G1 editor) is the truthful path | NONE (documented PARTIAL/HC1) |
| UF-GNOSIS-6 | Gnosis CRUD (create/get/list/delete/publish/unpublish/archive) are reachable EXISTs | ui-overhaul §4.11 B (13 EXISTS) | Each CRUD action's UI control is present and performs a real engine wire call (not a placeholder) | NONE |

---

## 11. Theme (light/dark/system)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-THEME-1 | **Tri-state theme**: default `system` follows the OS; explicit `light`/`dark` persists and overrides | ui-overhaul C1; unit-u-shell-2 §2.2-§2.4 | With `theme:'dark'`, the shell root carries `data-theme="dark"` and the token set flips (a background token changes); with `system`, an OS preference change re-applies live; the choice persists across restart | NONE (U-SHELL-2 DRAFT — tokens/theme not yet implemented; assert only the spec intent) |
| UF-THEME-2 | Theme control lives in the operator settings (modal); theme is token application, not a pane-body mutation | ui-overhaul §5 item 8; unit-u-shell-2 §2.3 | The theme control is an operator-settings control; switching it flips the shell root token (no pane body authored) | NONE (U-SHELL-2 DRAFT) |
| UF-THEME-3 | Gutter/pane/hover styles read the C1 tokens | unit-u-shell-5 §2.4; unit-u-shell-6 §2 | Gutter borders, hover highlights, and pane chrome use `var(--…)` tokens (themeable); a theme flip changes them consistently | NONE (U-SHELL-2 DRAFT) |

---

## 12. MCP ↔ UI parity (every MCP tool group has a named, working UI home)

> Basis: ui-overhaul §4 G1–G10 + §4.11 census + `mcp-endpoint.md` §3. Parity (per §4) = both surfaces run the same application code at the application seam; a shell-chrome affordance need not be `provident.dispatch`-able where an MCP counterpart is absent. These rows assert the named UI home EXISTS and WORKS user-visibly (or that the absence is a documented CARVE-OUT/PARKED).

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-PARITY-1 | **G1 Document/focus+editing** → central stage + editor toolbar; the stage/markdown reflect `get_rendered_html`/`get_markdown` (view) | ui-overhaul §4 G1 | The focused document renders in the central stage; `provident.get_rendered_html`/`get_markdown` reflect the SAME authored document | NONE (MCP probe) |
| UF-PARITY-2 | **G1 undo/redo/history** (`provident.journal` seam) has an ACTIVE UI home (C16) | ui-overhaul §4 G1/G6; unit-u-edit-2 | Editor toolbar Undo/Redo + a history sub-pane exist (rows UF-HIST-*); `provident.journal` is NOT parked | Scenario `user5_history_in_pane` (placement) / `toolbar_undo` (state) |
| UF-PARITY-3 | **G2 Navigation**: doc-nav (PARTIAL — select handler), gnosis wikis/documents (EXISTS), import (C17 COVERED) | ui-overhaul §4 G2/PG2 | doc-nav list renders; gnosis-wikis/-documents panes render; browse import is the `edit.import_markdown` UI home | NONE (import dialog park) |
| UF-PARITY-4 | **G3 Graph/links**: crosslinks/backlinks EXISTS; C19 hover-preview + C20 shared-subtree are the NEW additions | ui-overhaul §4 G3 | crosslinks pane lists back-refs; (C19) hovering a link shows a preview above it; (C20) a shared subtree shows a distinct background + owners box | NONE (C19/C20 land as U-PARITY/9b) |
| UF-PARITY-5 | **G4 Retrieval/search**: search pane EXISTS (PARTIAL arg surface); C18 advanced dropdown closes the `rag.query` PARTIAL | ui-overhaul §4 G4/section 5.4 | The search pane exposes the full `rag.query` arg surface (C18 row UF-SEARCH-2); results render | NONE |
| UF-PARITY-6 | **G5 Gnosis**: status (modal operator), query/wikis/documents all EXISTS; streams PARKED | ui-overhaul §4 G5 | Rows UF-GNOSIS-1..4/6 | NONE |
| UF-PARITY-7 | **G6 Template/code console**: template-editor EXISTS; code/graph/dispatch consoles PARKED (plugin handling) | ui-overhaul §4 G6 | The template-editor pane works (validate/commit); the parked consoles are documented absence, not defects | NONE |
| UF-PARITY-8 | **G7 Modules** operator/modal-confined CARVE-OUT; **G8 Security/operator settings** modal-confined CARVE-OUT | ui-overhaul §4 G7/G8 | Module manager & security panes render only in the settings modal and are MCP-invisible | NONE |
| UF-PARITY-9 | **G9 assistant suggestions** — no MCP tool; UI-first carve-out decision | ui-overhaul §4 G9/§6 PG13 | (DECIDE) No tool required; a suggestions pane is a coverage addition, never expected to dispatch | NONE (decision open) |
| UF-PARITY-10 | **G10 appearance/UI-config**: theme/editing-mode controls are operator settings; pane layout controls are zone chrome (not modal) | ui-overhaul §4 G10 | Theme/editing-mode controls live in the operator settings; drag/size/minimize live on the zones, not the modal | NONE |
| UF-PARITY-11 | Parity = same application seam, not a synthetic-event requirement; a shell strip need not be dispatch-able | ui-overhaul §4; unit-u-shell-9a §2.8 (W2-Q12) | `provident.focus` and the tab-strip click both reach the same main-process focus-selection operation | NONE (MCP probe + strip click) |

---

## 13. CONFIRMED DEFECT rows (LIVE-UF1..10) — each closed by a live assertion

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-DEFECT-1 | New-tab button mints a USABLE tab (LIVE-UF1) | defects LIVE-UF1; ui-overhaul C14 | `[data-tab-new]` click increases `.tab` count AND yields a usable view | **confirmed defect LIVE-UF1** (scenario `user1_tab_new`) |
| UF-DEFECT-2 | Real header grab drags a pane (LIVE-UF2) | defects LIVE-UF2; ui-overhaul C4 | A real header drag reorders/relocates the pane (order/y changes) | **confirmed defect LIVE-UF2** (scenario `user2_pane_drag`) |
| UF-DEFECT-3 | History segment inside a pane (`#pane-history` ⊄ `#zone:main`) (LIVE-UF5) | defects LIVE-UF5; unit-u-edit-2 | `#pane-history`/`[data-role='history']` is inside `.pane-frame`, not the main canvas | **confirmed defect LIVE-UF5** (scenario `user5_history_in_pane`) |
| UF-DEFECT-4 | Each paragraph materialized once, not nested in the doc-head header (LIVE-UF6) | defects LIVE-UF6; ui-overhaul §3.1 | `[data-rag-node-id="…:p:1"]` matches exactly ONE editable `<p>`, a sibling, not a descendant of `<h1 data-doc-head>`; edits don't cascade weirdly | **confirmed defect LIVE-UF6** (scenario `repro_dup_para`) |
| UF-DEFECT-5 | Real boundary drag resizes the zone (LIVE-UF7) | defects LIVE-UF7; unit-u-shell-5 | A real gauge at the zone edge changes width >10px; gutter is a real grip | **confirmed defect LIVE-UF7** (scenario `user7_zone_resize`) |
| UF-DEFECT-6 | Visible boundary between side zone and stage (LIVE-UF8) | defects LIVE-UF8 | A visible separator (border/bg/gap/gutter) divides `zone:left` from `#zone:main` | **confirmed defect LIVE-UF8** (scenario `user8_zone_boundary`) |
| UF-DEFECT-7 | Open-in-tab shows the SEARCH view (LIVE-UF9) | defects LIVE-UF9; unit-u-shell-9a HOST-5 | `#pane-search-expand-tab` creates a tab whose `#zone:main` renders search input/results, not the doc body | **confirmed defect LIVE-UF9** (scenario `user9_search_open_in_tab`) |
| UF-DEFECT-8 | Collapsed-zone label reads vertical bottom-to-top (LIVE-UF10) | defects LIVE-UF10; ui-overhaul C12 | Minimized-sidebar `#zone-tab-*` labels are `vertical-rl|lr` / `text-orientation:upright` | **confirmed defect LIVE-UF10** (scenario `user10_collapse_vertical_text`) |
| UF-DEFECT-9 | (LIVE-UF7 seam) the gutter resize SEAM works when dispatched directly (DIAG) | live-user-flow-scenarios §7 | [DIAG] a synthetic pointer on the hidden `.gutter` resizes (220→160) — proving the seam; the user-reachability is UF-DEFECT-5 | scenario `user7_zone_resize` (diag) |

---

## 14. NOT-REPRODUCED keep-rows (user reports whose LIVE re-drive PASSED — retain, do not close)

| ID | Flow/Element | Spec ref | Proposed live assertion | Coverage |
| --- | --- | --- | --- | --- |
| UF-KEEP-1 | Minimized sidebar re-orients pane-tabs as a VERTICAL column (user report contradicted) | live-user-flow-scenarios §3; ui-overhaul C12 | After `#zone-minimize-left`, the `.pane-tab` strips are a vertical column (distinct `y`, uniform `h=21`, equal `x`) | **scenario authored `user3_collapse_orientation`** — PASS (NOT reproduced) |
| UF-KEEP-2 | Main view IS editable and a normal edit commits to the store (user report contradicted) | live-user-flow-scenarios §4; ui-overhaul C8/C10 | Focus a doc, type a unique marker, blur → `rag.get_document` contains it and it renders | **scenario authored `user4_main_editable`** — PASS (NOT reproduced) |
| UF-KEEP-3 | Switching to Search does NOT overlay a landing flicker (user report contradicted) | live-user-flow-scenarios §6; unit-u-shell-9a | Click Search tab, sample 3×: active Search view, no `#stage-landing` re-render | **scenario authored `user6_search_no_flicker`** — PASS (NOT reproduced) |

---

## 15. Cross-census / numeric claims the matrix keeps in view

- **Pane count at first-run default** = `search` + `doc-nav` (2 app-graph panes) on a fresh store; other app-graph panes render only when explicitly enabled (defects LIVE-7; unit-u-shell-8 §2.6 pin 1).
- **Enabled + placed census** (the single source for `is-empty` / minimize-acceptance / tab count) derives from the RESOLVED zone panes, not the raw overlay (unit-u-shell-4 §2.5 pin 8; unit-u-shell-8 P-SM-2).
- **Live-confirmed session** (2026-09-15): 10 scenario blocks → 7 FAIL (all 4 new: 7-10), 3 PASS, 0 PARKED; `done: 10 blocks, 7 FAIL, 0 PARKED`.
- **Layer verification split** (AGENTS RCA-12): every DONE row here must state WHICH layer it verifies (envelope/pure vs assembled/renderer/app). The matrix above is the ASSEMBLED/app layer; node-greens in the unit specs do NOT satisfy these rows.
- **Park eligibility (RCA-11):** only OS-owned surfaces are structurally non-exercisable (the native `showOpenDialog` File→Import dialog, some native menu dropdowns — LIVE-12 native-menu-close accepted). "No live session" is never a park reason when a display is present. All other rows are run-not-park.

---

## 16. Coverage summary by surface

| Surface | Rows | Confirmed defects | PASS keep-rows |
| --- | --- | --- | --- |
| Shell/chrome | 4 | UF-SHELL-3 (LIVE-UF1) | — |
| Layout/zones | 12 | UF-LAYOUT-5/6 (LIVE-UF7), UF-LAYOUT-7 (LIVE-UF8) | — |
| Panes | 18 | UF-PANES-4 (LIVE-UF2), UF-PANES-7 (LIVE-UF10) | UF-PANES-6 (scenario 3) |
| Tabs | 12 | UF-TABS-2 (LIVE-UF1), UF-TABS-6 (LIVE-UF9) | — |
| Stage/document | 10 | UF-STAGE-2 (LIVE-UF6) | UF-STAGE-3 (scenario 4), UF-STAGE-4 (repro_nbsp run) |
| Search | 4 | — | UF-SEARCH-1 (scenario 6) |
| Settings modal | 7 | — | — |
| Editing/history | 7 | UF-HIST-1 (LIVE-UF5) | — |
| Import | 6 | — | — (dialog park) |
| Gnosis GUI | 6 | — | — |
| Theme | 3 | — | — (U-SHELL-2 DRAFT) |
| MCP↔UI parity | 11 | — | — |
| Confirmed defects | 9 | 8 (LIVE-UF1/2/5/6/7/8/9/10) | — |
| NOT-reproduced keep-rows | 3 | — | 3 |

**Total ≈ 112 rows.**

---

## 17. Report to the supervisor

- **Written:** `docs/specs/user-flow-audit-checklist.md` (this file).
- **Specs fully covered:** every named surface spec (`unit-u-shell-1..9b`,
  `unit-u-shell-shell-wiring`, `unit-u-state-1a..1c`, `unit-u-edit-1/2`,
  `unit-u-import-1`, `unit-u-menu-1`, `unit-l-textarea-editing-ui`,
  `unit-u4-contenteditable-editor` (+ `unit-u2-rich-decompose`),
  `unit-live4`, `unit-live11`, `unit-live8`, `mcp-endpoint.md`) and the umbrella
  `ui-overhaul.md` (C1–C20, §3 layout model, §4 G1–G10).
- **Not fully covered (and why):**
  1. **U-SHELL-9b (cross-document shared / C20 / Option-C)** rows are authored but
     **live-assertion BLOCKED on U-STATE-1e** — the simultaneous multi-document N-root
     reconcile is not green, so rows UF-TABS-10..12 / UF-PARITY-4's C20 half cannot be
     driven live yet. Kept as runnable-once-unblocked rows.
  2. **Theme (U-SHELL-2)** and **collapsible-panes live assertions** — the
     U-SHELL-2 spec is still **DRAFT** (document-only, tokens/theme not implemented),
     so UF-THEME-1..3 must be "assert the spec intent" until the unit lands.
  3. **Import (U-IMPORT-1)** rows are authored but the native `showOpenDialog` is
     an **OS-owned surface** — structural park per RCA-11 (recorded in §15); the pure
     directory-expansion/core assertions are node-testable, already green.
  4. **MCP-tool parity** (G1-G10) is pinned from the umbrella census (§4/§4.11); some
     rows depend on PARKED (plugin/streams/audit) or DECIDE (PG12/PG13) items — noted
     per row, not silently missing.

  No `docs/skills/designing-pages.md` update is owed: that file does not exist in
  the repo (confirmed by the unit U-SHELL-7/import-1 §7 notes).
