# USER-DEMO BUG REPORT #2 — 2026-09-15/16 (panes, zones, layout, persistence, history)

**Layer (RCA-12).** Every row is an **ASSEMBLED/RENDERED-app** observation (Electron on DISPLAY `:0`,
MCP `:3787`, CDP `:9222`; real CDP gestures + `getComputedStyle`/`getBoundingClientRect` measurements).
Node/envelope greens cannot satisfy any row — the dom-shim is layout-less/CSS-less.

**Companion:** report #1 (`docs/specs/user-demo-bug-report-2026-09-15.md`) covers I-1..I-10. This file
covers the second user list (B1..B7) plus the persistence diagnosis.

---

## 1. Verdict table

| # | User report | Verdict | Exact live observation |
| --- | --- | --- | --- |
| **B1** | Panes have a visible boundary but zones do not | **CONFIRMED** | `.pane-frame` computed: `border: 0.744px solid rgb(58,64,70)` (all sides), `border-radius: 8px`, `padding: 8px`. Zones: `#zone:left`, `#zone:right`, `#zone:main` ALL `border: 0px none`, `backgroundColor: rgba(0,0,0,0)`, `box-shadow: none`, `border-radius: 0px`, `padding: 0px`. Source: `src/renderer/index.html:163` styles `.pane-frame` only — there is no zone boundary rule at all. |
| **B2** | Pane visibility settings still haven't saved from last time | **CONFIRMED — root cause is the app being unable to write its userData directory in this session (environment); the persistence logic itself is CORRECT** | Every persist in `~/.config/provident-electron/` is denied: app stderr `[security-store] persist failed (…/provident-security.json): EACCES: permission denied`, Electron `Error writing DevTools active port to file …: Permission denied (13)`; all four settings files are stale (`provident-operator-settings.json` 13:01, `provident-rag.json` 17:12, `provident-template.json` 16:58, `provident-security.json` 03:14) while my own shell/node writes to the same directory also fail with **EACCES** (so this is a session-level file-access restriction, not a product defect). Verified the product path works when the directory IS writable: with `HOME=/tmp/astro-persist-home` (writable) a REAL hit-tested click on `#operator-pane-visibility-doc-nav` set `enabledPanes ['doc-nav','search'] → ['search']`, the rendered frames went `['doc-nav','search'] → ['search']`, **the file on disk was updated**, and **after an app restart the app booted with `enabledPanes:['search']` and rendered exactly `['search']`** — persistence + boot-apply both correct. Also observed: edits made through `edit.set_content` are lost on restart in this session (the store's write is denied too), so nothing user-visible persists while the directory is read-only. |
| **B3** | The leftmost edge of the canvas is slightly overlapped by the left-side pane — should have margins | **CONFIRMED (flush edges; no margin/gap anywhere)** | At 1600 and 1400 wide: `#zone:left` right edge = **253**, `.pane-frame` right edge = **253** (pane `border-right 0.744px`), `#zone:main` left = **253** → **gap 0px**, `paneOverlapsMainPx 0`, `zone padding 0`, `main padding 0`, first `<p>` left = 253 → **`paraStartsAtMainLeft = 0`** (document text starts flush against the pane's border). `elementFromPoint(zoneLeft.right-2, top+60)` resolves to `pane-doc-nav.pane-frame` — at the boundary the pane occupies the last pixels of its zone. No zone padding, no pane margin, no grid `gap`, and the main zone has no left inset. |
| **B4** | List bullets in the document pane take up too much space | **CONFIRMED** | With the doc-nav pane expanded (220px zone): the pane's `ul` has **`padding-left: 40px`** (the browser's UA default `padding-inline-start`; the shell CSS defines NO list rule — `index.html` has no `ul/li` style) inside a 220px pane whose `.pane-frame` also spends 8px padding + 0.75px border per side; `li` width 163px of the 203px list box → **40/220 ≈ 18% of the pane width is the bullet indent**, and the same 40px indent applies to EVERY `ul` in the stage (`#zone:main ul` `padding-left: 40px`). The document pane's own list is the worst case because the zone is narrow while the indent is a constant. |
| **B5** | Panes should stay where the user put them — the UI should enforce no-overlap; panes should have an internal scrollbox when content overflows | **CONFIRMED (both halves)** | *No-overlap / placement:* pane frames are `position: static` in normal flow with `overflow-y: visible`, `max-height: none` — so they cannot be "placed" at all and the only thing preventing overlap today is that they happen to stack in flow; there is no collision/placement enforcement anywhere in the CSS or the layout state (the zones are grid cells; the panes inside a zone are a plain flow column). *Internal scroll:* `#pane-doc-nav` measured **h = 6 271px** (63 list items) with `overflow-y: visible`, `maxHeight: none`, and its body child `clientHeight 6 194 === scrollHeight 6 194` — i.e. **no scroll container**: the pane grows to its content and the PAGE scrolls (page `scrollHeight 27 629`), which is the same root that makes the tab bar scroll away (report #1 I-1). |
| **B6** | History should be in a dropdown | **CONFIRMED (not a dropdown; not in a pane either)** | `#pane-history` is a **`DIV`** (not `details`/`select`; `#zone:main` contains 0 `details`/`select`), with children `STRONG#…: "History"` + `P#…: "(no history)"`; it renders INSIDE `#zone:main` (`historyInMain=true, historyInPane=false`, `.pane-frame [data-role="history"]` = 0) — so it is neither a dropdown nor in a pane. Undo/Redo are toolbar buttons in the main canvas (`#editor-toolbar`, `inMain=true`). |
| **B7** | (observed while probing) The doc-nav pane, once expanded again, renders NO document list | **NEW OBSERVATION (needs a focused repro)** | After `#pane-collapse-doc-nav` collapsed and the seam `window.provident.sidebar.togglePaneCollapse('doc-nav')` re-expanded it, the frame came back (`class="pane-frame"`) but stayed **98px tall with `ul=false`, `liCount=0`** — the document list did not re-materialize. Earlier in the same session the same pane held 63 `li`s. Reported as an observation for the next pass (it may be the same re-assembly path as F-2). |

---

## 2. RCA — why the gates did not catch these

| # | Why the node suite missed it | Why the live battery missed it |
| --- | --- | --- |
| B1 | Borders/padding/box-shadow are CSS cascade facts; the dom-shim has no stylesheet at all. | `user8_zone_boundary` DOES assert a painted separator — it PASSES because a *grid `gap`/gutter* counts as a boundary in that row's predicate, and the pane frames' own borders made the surface look bounded. Nothing asserted "a ZONE has a boundary comparable to a PANE's". |
| B2 | The persistence contract is unit-tested with a temp path (write-through + boot-apply) and those tests pass — correctly. | The live battery never asserted a persist→**restart**→re-read round-trip for pane visibility in the DEMO environment; `vis_persist`/`persistence` run against a disposable `--home` (always writable), so a read-only real userData is invisible to them. The product's own silent-failure handling (best-effort `catch {}`) hides it: no user-facing warning at all. |
| B3 | Layout geometry — unassertable in node. | No row measures the zone↔pane↔stage EDGES or the stage's left inset; UF-LAYOUT-1/4/7 assert areas/size/boundary presence, not the flush gap. |
| B4 | UA default list padding is a browser fact the dom-shim does not implement. | No row measures list geometry at all; UF-PANES-12 only checks that document rows render/select. |
| B5 | Overflow/scroll containers do not exist in the shim. | UF-LAYOUT-8/9/12 assert gutter resizes/defaults; nothing asserts a pane's internal scroll behaviour or a no-overlap placement invariant. The 6 271px pane is visible in the report's own numbers but was never asserted against a max-height/scrollbox rule. |
| B6 | Placement/presentation is an assembly fact (and `#pane-history` exists, so a presence-based test passes). | UF-HIST-1 asserts "in a pane, not in main" (a FAILING row) but no row asserts the requested CONTROL SHAPE (a dropdown). The user-visible requirement was never written down. |
| B7 | — | Not covered; needs a focused reassembly repro (candidate: the F-2 mount-leak path). |

---

## 3. Owed gate rows (additions to report #1 §3)

10. **ZONE-BOUNDARY PARITY row** — every zone renders a painted boundary (border/background differing from its
    neighbours or a real gap ≥ 8px); a pane's boundary must not be the only visible separation.
11. **STAGE INSET row** — the content stage's first content edge is inset ≥ 8px from the pane/zone boundary
    (`firstContent.left - zoneMain.left ≥ 8`), i.e. real margins around the canvas.
12. **LIST-INDENT row** — in the 220px document pane a `ul`'s bullet indent is ≤ 16px (or the pane scrolls
    horizontally), so the row text keeps the majority of the pane width.
13. **PANE PLACEMENT + INTERNAL SCROLL row** — (a) no two `.pane-frame` boxes overlap within a zone, and panes do not
    move when their content changes; (b) a pane whose content exceeds a visible max-height scrolls INSIDE ITSELF
    (`scrollHeight > clientHeight` on the pane's body) instead of growing the page.
14. **HISTORY CONTROL SHAPE row** — the history surface is a dropdown/disclosure (`details`/`select`/`aria-expanded`
    control) whose collapsed state is the default, and it is inside a `.pane-frame`.
15. **PERSISTENCE ROUND-TRIP row (demo environment)** — toggle a pane, restart the app against the REAL userData, and
    assert the pane set is restored — plus a **fail-loud** requirement: the app must SURFACE a failed settings/store
    write (today every write failure is a silent `catch {}`).

---

## 4. Fix queue implied by this report

| Priority | Fix | Notes |
| --- | --- | --- |
| P1 | **B5** — panes are a placed, non-overlapping list with an internal scrollbox (`max-height`/flex + `overflow-y:auto`), and the page itself stops being the scroll container | This is the root of B5, report #1 I-1 (tab bar scrolls away) and I-5/I-8 (layout stability): make the stage/zones the scroll containers. |
| P1 | **B2** — surface persistence failures instead of swallowing them (`catch {}` → a user-visible warning + a diagnostics line), and document that the app must be able to write its userData directory | Product-side hardening is small; the demo-environment restriction also needs a note in the run instructions. |
| P2 | **B3/B1** — zone boundary + stage margins: a real gap/inset (8–12px) between the side zone and the stage, and a zone-level boundary rule so a ZONE reads as a region, not just its panes | CSS + the parity/inset live rows. |
| P2 | **B4** — a shell list rule (`ul { padding-inline-start: 1rem }` in the pane context) so bullets stop eating 18% of a narrow pane | CSS + the list-indent row. |
| P2 | **B6** — history becomes a dropdown (disclosure) and lives in a pane with the editor toolbar | Ties into report #1 I-5; `unit-u-edit-2` owns the history sub-pane. |
| P3 | **B7** — the doc-nav pane must re-materialize its list after a collapse/expand round-trip | Needs a focused repro; likely the F-2 re-assembly path. |

**Defect rows** for B1/B3/B4/B5/B6 are filed in `docs/defects.md` (`ZONE-NO-BOUNDARY-ASYMMETRY`,
`STAGE-LEFT-EDGE-FLUSH`, `LIST-INDENT-40PX`, `PANE-NO-PLACEMENT-OR-SCROLLBOX`, `HISTORY-NOT-DROPDOWN`);
B2's environment finding + the owed fail-loud is recorded there as `SETTINGS-PERSIST-WRITE-SILENT`.
