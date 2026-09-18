# Live user-flow scenarios — ten user-reported UI bugs

Live-scenario battery for the USER-VISIBLE bugs reported against the running
Astrographer app. Each scenario drives the REAL user gesture (native/CDP pointer
on the actual rendered control) and asserts the USER-VISIBLE outcome, exactly as
the live user did — these are meant to REPRODUCE the report (FAIL = bug confirmed),
not to bless the code.

Driver: `scripts/live-drive.mjs` blocks `user1_*`..`user10_*`, run **sequentially**
with `--connect --display=0` against the RUNNING app session (MCP `:3787`,
CDP `:9222`) — the corpus was seeded (`edit.import_markdown` of `.live-corpus/alpha.md`
+ `beta.md`) so documents exist. Blocks added 2026-09-15; `node --check` passes.

> Layer note (RCA-12): these are APP-level (assembled-renderer) results, not
> envelope/node greens. Where a node-green / prior FIXED row claimed a behavior
> that the LIVE app contradicts, that is reported here as a finding.

> **UPDATE (2026-09-15, later pass — the user-flow audit).** The battery was
> widened to 24 `uf_*` blocks covering 20 further checklist rows, run live, and its
> structured results now live in **`docs/specs/user-flow-audit-coverage-2026-09-15.md`**
> (the §6.1 matrix-with-verdict coverage report) — that report, not this table, is the
> current LIVE verdict source. The rows below are the ORIGINAL ten-scenario run and are
> retained as the reproduced-finding record. Live deltas from the wider pass:
> **F-1 PANE-BODY-GESTURE-SWALLOWED** (NEW, high — a real click on any clickable row
> INSIDE an app-graph pane is retargeted to `.pane-frame`, so the doc-nav/search rows are
> inert to a real user), **F-2 WIKI-ROOT-MOUNT-LEAK** (**FIXED +
> LIVE-CONFIRMED 2026-09-16** — as observed 2026-09-15: NEW, high, duplicate `#wiki-root`
> mounts on an empty↔filled pane-set transition; the fix is the `Runtime.tearDownGraph`
> `#wiki-root` mount sweep, `src/renderer/runtime.ts:1047-1068`, recorded in the F-2 row at
> `docs/defects.md` and live-confirmed via `STALE-MOUNT-PUSHES-CANVAS` — the original
> observation is retained as history), **F-3 EMPTY-ZONE-TRACK-NOT-COLLAPSED**
> (NEW, medium) — all three recorded in `docs/defects.md`; **seven** of the eight LIVE-UF
> defects below (LIVE-UF1/5/6/7/8/9/10) were re-confirmed unchanged on the widened run,
> while **LIVE-UF2 (`user2_pane_drag`) was CONTRADICTED and is now FIXED +
> LIVE-CONFIRMED** — see the scenario-2 CONTRADICTED note below.

## STATUS — 2026-09-15 (six scenarios) / 2026-09-15 (four more: 7–10)

| Scenario (live block) | Result | User-report confirmed? |
| --- | --- | --- |
| 1 New-tab button (`user1_tab_new`) | **FAIL** | **Y — confirmed** |
| 2 Pane drag on header (`user2_pane_drag`) | **FAIL** | **Y — confirmed** |
| 3 Collapse → vertical tab orientation (`user3_collapse_orientation`) | PASS | N — NOT reproduced |
| 4 Main view editable + commit (`user4_main_editable`) | PASS | N — NOT reproduced |
| 5 History in a pane, not the canvas (`user5_history_in_pane`) | **FAIL** | **Y — confirmed** |
| 6 Search tab switch, no landing overlay (`user6_search_no_flicker`) | PASS | N — NOT reproduced |
| 7 Pane zones resize from a gutter (`user7_zone_resize`) | **FAIL** | **Y — confirmed** |
| 8 Visible boundary between side zone & stage (`user8_zone_boundary`) | **FAIL** | **Y — confirmed** |
| 9 Search "Open in a tab" shows search, not doc (`user9_search_open_in_tab`) | **FAIL** | **Y — confirmed** |
| 10 Collapsed zone label reads vertical (`user10_collapse_vertical_text`) | **FAIL** | **Y — confirmed** |

Live run summary: **`done: 10 blocks, 7 FAIL, 0 PARKED`** (all four NEW scenarios
7–10 FAIL → all four user reports reproduced/confirmed).

None of these are closed — the FAILs are reproduced expected findings (OPEN below /
`docs/defects.md`), and the PASSes are recorded so the user's reports are reconciled
against the actual live behavior.

---

## Scenario 1 — New tab button
**Block** `user1_tab_new`:
1. `document.querySelector('[data-tab-new]')` must exist.
2. Snapshot `.tab` count (3), then a real click on `[data-tab-new]` (CDP coordinate,
   fall back native `.click()`).
3. Wait 700ms. Assert: a NEW `.tab` appears AND it yields a usable target
   (`#stage-landing` or `#stage`).
   **Assert `.tab` count increases (newTab) AND usableTarget.**

**Observed (2026-09-15):** `.tab count 3->3 (newTab=false); usableTarget(landing=false,stage=false)=false; tabs=[landing×, Search: search-2×, .live-corpus/alpha×]`. The click was a **silent no-op** — no new tab, no new view; the active Search tab was merely re-titled `...search-2`. **FAIL → user report CONFIRMED.**

> Finding: this contradicts the prior `#live-3-new-tab-inert` FIXED (partial)
> row in `docs/defects.md` — the new-tab button is STILL inert live (no usable tab
> target is minted), not "fixed". The `+` should open a usable landing/draft; it
> does not.

## Scenario 2 — Pane drag on the header
**Block** `user2_pane_drag` (a REAL drag from the pane's header, the
`.pane-collapse-toggle` strip — not a hand-picked internal point):
1. Snapshot left-zone slot sequence `.pane-frame[data-pane-id]` in DOM order.
2. Pick an in-viewport pane (`doc-nav`); start the pointer drag on ITS
   collapse-toggle header, move it DOWN past the next sibling (`gnosis-documents`),
   release.
3. Wait, re-snapshot. **Assert the slot sequence (or the dragged pane's position)
   changed.**

**Observed (2026-09-15):** header drag from `(143,331)` PAST `gnosis-documents@y=349`
→ `ty=371`; `slot order changed=false before=[...doc-nav,gnosis-documents,...] after=same`; `doc-nav y=312` unchanged. The pane did **not** move or reorder. **FAIL → user report CONFIRMED.**

> **CONTRADICTED (2026-09-15, later user-flow-audit pass).** The reproduction above
> started the drag on an OFF-VIEWPORT header (the sibling sat ~9 600px below the fold
> on the tall page), so the gesture never started. Re-driven with the header scrolled
> INTO VIEW (hit-tested `hit=pane-collapse-doc-nav`, real CDP `mousePressed` +
> 4×`mouseMoved` past the sibling + `mouseReleased`): the left-zone order changed
> **`doc-nav,search` → `search,doc-nav`** ⇒ the header drag DOES relocate the pane.
> The guard that caused the original inertness (`isInteractiveControl` refusing a
> BUTTON header) is removed by the F-1 fix, which makes the header the explicit
> pane-drag grab surface **and** defers pointer capture past a 4px threshold so a
> header CLICK still toggles the collapse. Defect **LIVE-UF2 → FIXED +
> LIVE-CONFIRMED** (`docs/defects.md`); the §6.1 report's NEW-1 is the evidence. The
> `user2_pane_drag` block now PARKS (not FAILs) when its own in-viewport precondition
> is unmet.

## Scenario 3 — Collapse re-orients pane tabs vertically
**Block** `user3_collapse_orientation`:
1. Click the sidebar zone-minimize (`#zone-minimize-left`).
2. Assert the rendered pane-tab layout re-orients VERTICALLY (`.pane-tab` strips
   with distinct increasing `y`, uniform `h`, equal `x` — i.e. rows stacked as a
   column).

**Observed (2026-09-15):** after minimize the 7 `.pane-frame`s collapsed to 7
`.pane-tab` strips (`id="zone-tab-left-<pane>"`), `vertical=true`
(distinct-y, uniform h=21, equal x=33). **PASS → user report NOT reproduced.** Exact
collapsed UI: `zone:left[.is-minimized]` + `#zone-minimize-left`, and the pane
headers re-render as a vertical column of `.pane-tab` clickable strips (x=33, y=171→294).

## Scenario 4 — Main view editable + commit
**Block** `user4_main_editable`:
1. `provident.focus` document `.live-corpus/alpha`.
2. Real click into the `[contenteditable]` body text.
3. Assert the editable surface ENGAGES (activeElement has `contenteditable`).
4. `Input.insertText` a unique marker, `.blur()`, wait.
5. **Assert the edit COMMITS** — `rag.get_document` (store read-back) contains the marker.

**Observed (2026-09-15):** `editable engages activeElement-contenteditable=true`;
typed `'LIVE71924'` present in STORE `rag.get_document=true` and DOM=true.
**PASS → user report NOT reproduced.** The main view IS editable and an edit/blur
commits to the store.

## Scenario 5 — History must live in a pane, not the canvas
**Block** `user5_history_in_pane`:
1. Locate `#pane-history` / `[data-role="history"]`.
2. **Assert it is a descendant of a `.pane-frame` AND NOT inside the main
   `#zone:main` canvas** (DOM ancestry).

**Observed (2026-09-15):** `[data-role="history"] present=true; inside MAIN #zone:main
canvas=true; inside a .pane-frame=false; ancestry=[#pane-history → #zone:main →
#wiki-root → #app.card → MAIN.layout → BODY → HTML]`. The history/undo/redo segment
renders in the MAIN canvas (`#zone:main`), not inside a pane. **FAIL → user report
CONFIRMED.**

## Scenario 6 — Search tab switch, no landing overlay
**Block** `user6_search_no_flicker`:
1. Click the Search `.tab`; wait for settle.
2. Assert (a) the search tab is the active view; sample the stage THREE times
   (t+800/t+1800/t+3000ms) and assert (b) `#stage-landing` does NOT re-render over it.

**Observed (2026-09-15):** `switched tab (Search: search-2)`; samples all
`landing=false, stage=false, active=[Search: search-2]`; `activeSearch=true,
noLandingOverlay(all3)=true`. **PASS → user report NOT reproduced.** No landing
flicker/overlay after switching to Search. (Note: the main `#zone:main` retains the
last-focused document content while the Search tab is active — no landing overlay
is emitted, which satisfies the "no flicker" assertion as specified; a deeper
"search content shown" check would need the search pane expanded/queried.)

## Scenario 7 — Pane zones must resize from a gutter drag
**Block** `user7_zone_resize`:
1. Ensure the left zone is expanded; capture `[data-zone="left"]` bounding-rect **width**.
2. Drive a REAL CDP coordinate drag at the zone's right (gutter) boundary edge
   (`x = zone.x + zone.width`), +72px, release.
3. Assert the zone **width changed >10px**. (Also recorded: a synthetic
   pointer-drag dispatched directly ON the `.gutter[data-zone="left"]` element as a
   DIAGNOSTIC that the `startGutter` seam itself works.)

**Observed (2026-09-15):** before=`220px`; real boundary-drag @edge x=253 → after=`220px`
(Δ=0, changed>10px=false). The `.gutter[data-zone="left"]` element is `0×0` at `(0,0)`
(grid-area `auto`, no track), so the real user drag at the visible boundary hits the
contenteditable paragraph, not a gutter. [DIAG] a synthetic pointerdown dispatched ON
the hidden gutter element did resize `220→160` (Δ=60) — proving the seam works but the
gutter gives the user no reachable grip. **FAIL → user report CONFIRMED** (a real
user drag cannot resize the zone; there is no visible/grippable gutter).

## Scenario 8 — Visible boundary between side zone and main stage
**Block** `user8_zone_boundary`:
1. Assert `[data-zone]` / `#wiki-root` grid shows a visible boundary between the
   side zone and the central stage (non-default border, a grid-gap, a background
   differing from the stage, or a visible gutter).
2. Report the computed styles (border / gap / background / gutter geometry).

**Observed (2026-09-15):** `zone:left` & `zone:main` both `background: rgba(0,0,0,0)`,
`border-left/right: 0px none`, `box-shadow: none`; `#wiki-root` grid
`tc: "160px 839.721px 220px"`, `gap:normal`(≈0px); `.gutter[data-zone]` all `0×0`,
`grid-area:auto`; `#app.card` bg floods both cells identically. `boundary-visible=false`
(zoneBorder=false bgDiff=false gutterVisible=false gridGap=0px>0=false).
**FAIL → user report CONFIRMED** (no visual separator — the side zone and stage read
as one surface).

## Scenario 9 — "Open in a tab" must show the SEARCH view, not the document
**Block** `user9_search_open_in_tab`:
1. Focus the open document tab (alpha).
2. REAL click `#pane-search-expand-tab` ("Open in a tab", HOST-5 `paneTabExpand`).
3. Assert the NEWLY-CREATED tab shows the SEARCH view (search input/results) and
   NOT the document body. Report which tab is active after the click + its rendered
   `#zone:main` content.

**Observed (2026-09-15):** `.tab` count `5→6` (newTabCreated=true), active becomes
`"Search: search-6"` (index 5), but `#zone:main` renders
`"AlphaSettings modal (C3). The document alpha documents…"` (`isDocumentBody=true`),
`searchInput=false`, `ragResults=false`. The new search TAB is created but its stage
shows the OPEN DOCUMENT, not the search view.
**FAIL → user report CONFIRMED.**

## Scenario 10 — Collapsed zone label reads vertical (bottom-to-top)
**Block** `user10_collapse_vertical_text`:
1. Minimize/collapse a side zone (`#zone-minimize-left`).
2. Find the collapsed zone's `#zone-tab-*` panel-label elements and read their
   computed `writing-mode` / `text-orientation`.
3. Assert VERTICAL (`writing-mode: vertical-rl|vertical-lr` OR `text-orientation:
   upright`) vs the horizontal default.

**Observed (2026-09-15):** after minimizing the sidebar, all 7 `#zone-tab-left-*`
`.pane-tab` labels report `writing-mode: horizontal-tb`, `text-orientation: mixed`,
sized short-and-wide (`96×21`, `82×21`, `128×21`, `57×21` "Search", …) — horizontal
text, not rotated/bottom-up. `vertical=false`.
**FAIL → user report CONFIRMED** (collapsed-zone text reads horizontally, should be
vertical bottom-to-top).

---

## Reproduced findings (expected, NOT closed)

- **NEW-TAB INERT (re-confirmed 2026-09-15):** `[data-tab-new]` click creates no new
  `.tab` and yields no usable target — silent no-op / re-titles the active tab.
  Contradicts the FIXED(partial) claim in `docs/defects.md`.
- **PANE DRAG RELOCATES THE PANE — LIVE-UF2 CONTRADICTED + FIXED (2026-09-15, later
  user-flow-audit pass):** with the header in view a REAL header drag on a
  `.pane-collapse-toggle` DOES relocate/reorder the pane (`doc-nav,search` →
  `search,doc-nav`, persisted across gesture-free reads); the original "inert" result was
  an off-viewport start point. Defect **FIXED + LIVE-CONFIRMED** in `docs/defects.md`;
  the `user2_pane_drag` block now PARKS (never FAILs) when its own in-viewport
  precondition is unmet. Evidence: `docs/specs/user-flow-audit-coverage-2026-09-15.md`
  §4 NEW-1 + the §5.U U-3 row.
- **HISTORY IN MAIN CANVAS (2026-09-15):** `[data-role="history"]/#pane-history`
  renders inside `#zone:main`, not inside a `.pane-frame`.
- **ZONE RESIZE NO-GRIP (2026-09-15, §7):** a REAL boundary drag leaves the left-zone
  width unchanged (220→220, Δ0). The `.gutter[data-zone]` handles are `0×0` at `(0,0)`
  (no grid track) — no visible/grippable resize surface. [DIAG] a synthetic pointer ON
  the hidden gutter element resizes (220→160), so the seam works but is user-unreachable.
- **ZONE NO-BOUNDARY (2026-09-15, §8):** no visible separator between `[data-zone=left]`
  and `#zone:main` — both cells transparent, `border 0px none`, grid `gap:normal`, gutters
  `0×0`; the side zone and central stage read as one surface.
- **SEARCH OPEN-IN-TAB SHOWS DOC (2026-09-15, §9):** `#pane-search-expand-tab` creates a
  NEW `Search: search-N` tab but its `#zone:main` renders the OPEN DOCUMENT body
  (isDocumentBody=true), not the search view (searchInput=false, ragResults=false).
- **COLLAPSED-ZONE TAB HORIZONTAL (2026-09-15, §10):** minimized-sidebar `#zone-tab-*`
  labels are `writing-mode: horizontal-tb` (short-wide, e.g. 57×21 "Search"), not vertical
  bottom-to-top.
