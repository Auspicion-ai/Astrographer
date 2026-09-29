# IMPLEMENTATION HANDOFF → the **Provident-Electron foundation** (the `SC-1..SC-7` shell-chrome set, as an adoptable work package)

**Date:** 2026-09-22 · **Requester:** the Astrographer shell (a fork of Provident-Electron) ·
**Target project:** `Provident-Electron` — the Electron/MCP foundation build this repo forked, shipped at
`/media/ryanr/Shared Files/Projects/Provident-Electron` (an ADJACENT folder, not a dependency; readable) ·
**Status: OPEN — filed.**

**Filing convention (this document's own rules, stated so no later pass has to infer them):**

1. **Indexed from `docs/HANDOFF.md`** — one row in that file's `## OPEN handoff items` feature-request index
   area names this document and its `SCH-1..SCH-13` ids. This file is the work package; the row is the index.
2. **Never a patch.** Every item is an **upstream-owned change**. Editing `../Provident-Electron/**` from this
   repo is a process violation, not a fix (`docs/HANDOFF.md` head; the same standing rule every row in that
   section carries). **This document changes no code in this repo** — no `src/**`, `tests/**`, `scripts/**`,
   `docs/specs/**`, tracker row or `docs/defects.md` row is touched by this pass.
3. **Never a `docs/defects.md` row set.** No item here is a bug report: the target's own work queue reads
   "_(no open items — all work items are DONE as of 2026-08-26)_" (`../Provident-Electron/docs/next-steps.md:13`),
   so each item is filed as a **foundation mechanism request with testable acceptance criteria**.
4. **Never a `provident-ssr` package patch.** Package-documentation requests are the sibling
   `docs/feature-requests/provident-ssr-expressibility-requests.md` (PS-1) — out of scope here.
5. **Counted, never asserted:** **13 items** (`SCH-1`..`SCH-13`) · **7 SC-covered** · **6 `NEW — NOT GATED`**
   (§3 header + §3.14 give the mapping and the count identity). Adding a fourteenth is a new filing pass.

**Companion documents (cross-referenced, never duplicated):**

| Document | What it is | What this document adds |
| --- | --- | --- |
| `docs/feature-requests/provident-electron-shell-chrome-requests.md` | the **gated mechanism request set** `SC-1..SC-7` with its own field template + priorities | the **implementation/queue/adoption layer** — one `SCH-n` work item per mechanism, ordered, with the fork-side adoption path per surface |
| `docs/specs/astrographer-scope-realignment-review.md` | the **gate record** (PROCEED-WITH-AMENDMENTS, 2026-09-17): §3 the pinned boundary, §3.3 per-row ownership, **§4 the C1..C20 chrome decomposition**, §4.1 the "already correctly shell chrome" ruling + the MUST-NOT-MOVE control nodes, §5.1 the request set, **§5.2 the DO-NOT-FILE list**, §6 the gate shape, §7 the landing order | §2 copies §4's per-row "today's implementation" cells **and re-verifies each `file:line` today**; §5 restates §5.2 as binding constraints; §4 gives the foundation-side landing order (the §7 order is the fork-side one) |
| `docs/pending.md` §"UPSTREAM foundation requests" (`:25-47`) | the per-request rows (priority / requested interface / fallback / revisit condition) | the per-item **acceptance criteria**, the **adoption steps**, and the queue order |
| `docs/FORK-DIVERGENCE.md` | the upstream-vs-fork delta (the foundation ships no layout grid / zones / gutters / tabs / modal / theme tokens / application menu) | the delta re-read against the foundation tree today (§2's inventory + §6's per-item "already ships" column) |
| `docs/HANDOFF.md` | the issue-handoff index + the filing convention | the index row for this document (§1 of the convention above) |
| `docs/specs/ui-overhaul.md` §2.1 (`:77-166`, Tables A/B/C) | the chrome expressibility audit + the hybrid rule (`:156-158`) | nothing — cited as the authority for the class column in §2 |
| `docs/decisions.md` | `UI-CONFIG-CARRIER` (`:228`), `UI-OVERHAUL-UMBRELLA-GATE` (`:231`), `PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` (`:30`), `LAYOUT-IN-CSS` (`:34`), `MODAL-SETTINGS-REPARENT` (`:239`), `MODAL-DEDICATED-SCRIM` (`:240`), `ASTROGRAPHER-SCOPE-REALIGNMENT` (`:246`), `PANE-PROVIDENT-AUTHORING` (`:56`), `APP-GRAPH-PANES-MCP-VISIBLE` (`:57`), `OPERATOR-ISOLATED-GRAPHSCOPE` (`:58`), `MCP-UI-EQUIVALENCE` (`:65`) | the per-item adoption constraints those rows impose |
| `docs/specs/unit-stage-active-tab-display.md` | tab ownership + the stage-display invariant (the recently landed active-tab ownership) | the named MUST-NOT-MOVE surface (`SidebarPanes.getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/`mountTab`, §5.2 at `:355-360`) |
| `docs/feature-requests/gnosis-engine-prerequisites.md` | the **style precedent** for a per-item tracked work package (the `GRQ-n` set) | nothing — format model only |

---

## §1 Why the foundation owns these surfaces

**Not re-argued here.** `SC-1..SC-7` carry the argument (`provident-electron-shell-chrome-requests.md:33-66`)
and the gate record carries the ruling (`astrographer-scope-realignment-review.md` §3/§4.1). The three clauses
a reader of the work package needs, stated once and then cross-referenced:

1. **The carve-out is FUNCTIONAL, not geographic** — `AGENTS.md:23-34` exempts a *kind of code*
   (OS-integration and frame/geometry mechanics that provident-authored graph data cannot express), not a
   directory. §4.1 rules that the tab strip, the gutters, the modal frame/scrim, the theme-token application
   and the native menus are **ALREADY and CORRECTLY shell chrome**, and that the upstream-fileable part is the
   **mechanism layer underneath** every surface.
2. **The MCP-visibility rule that makes this the foundation's business** — a UI element outside the provident
   graph is invisible to `provident.dispatch` / `get_rendered_html` / `get_markdown` (`AGENTS.md:29-34`, the
   target's own `AGENTS.md:23-34` and `docs/decisions.md:46`). A *mechanism* that makes a shell surface
   **swallow** a provident node's click is therefore not a cosmetic defect: it is an MCP/UI equivalence break
   (`MCP-UI-EQUIVALENCE`, `docs/decisions.md:65`; `ui-overhaul.md:607-629`).
3. **The ruling's MUST-NOT-MOVE list** — §4.1: the control nodes of **C5 / C8 / C12 / C15 / C16 / C18 / C19 /
   C20** stay **provident-authored and dispatchable**; they are not foundation work and not fork deletions.
   §5's table is the verified `file:line` list of every one of them, and no `SCH-n` item may touch it.

**The work package's one-line thesis.** The foundation already ships the MCP/Electron endpoint, the Runtime and
the graph mount (`../Provident-Electron/src/main/main.ts:136-155`, `src/renderer/renderer.ts:95-134`) and a
44-line single-page shell (`src/renderer/index.html:33-43`) — and **not one** of the mechanisms below. §6.2
lists, per item, what the foundation verifiably does **not** ship, so no `SCH-n` asks for what exists.

---

## §2 The shell-chrome inventory (every shell-chrome instance in Astrographer today)

**38 instances** across 8 groups (A shell regions 3 · B tab strip 7 · C top bar 3 · D panes/zones 12 · E stage 2 · F overlays 3 · G theme 3 · H native menus 2 = **38**). **Class** uses `ui-overhaul.md` §2.1's three tables: **SHELL** (Table C —
external chrome), **HYBRID** (Table B — provident model + external mechanic), **P-ctrl+SHELL** (Table A
provident control node + the shell mechanic underneath it — the control node is NOT shell chrome and is on the
MUST-NOT-MOVE list in §5). Every `file:line` was re-read on **2026-09-22**; where a cited line had drifted
since the SC doc's 2026-09-17 reading, the correction is stated in §6.1.

| # | Surface (C-row) | Class | Host implementation (verified 2026-09-22) | MCP visibility | Handoff item |
| --- | --- | --- | --- | --- | --- |
| A1 | **Shell region markup as a whole** (C7/C3/C14) | SHELL | `src/renderer/index.html:278` (`#tab-strip`), `:280` (`#app` mount), `:281-282` (`#panes`/`#operator-panes`), `:287-290` (4 gutters), `:297-301` (modal frame/scrim/body/toggle) | Invisible OK | `SCH-1` |
| A2 | **The single in-flow graph mount** (C2) | SHELL | `src/renderer/index.html:280`; the graph root materializes inside it as `#wiki-root` (laid out `:104-131`) | MUST stay stable — dispatch addressability | `SCH-1` |
| A3 | **Mount safe re-assembly** (the one in-flow mount across envelope A→B) | SHELL | fork-local sweep inside the Runtime: `src/renderer/runtime.ts:1143-1164` (`tearDownGraph`, the `mount.querySelectorAll('#wiki-root')` compensation; the file grew to 1636 lines since the SC doc's reading — **corrected this pass**, §6.1) | Dispatch-addressability risk | `SCH-1` |
| B1 | **Tab strip container + nameplate** (C14) | SHELL | `src/renderer/index.html:278` (authored inline) + `:210-223` (strip/nameplate/tab/close/new CSS) | Strip invisible OK | `SCH-11` |
| B2 | **Strip overflow** (horizontal scroll, no dropdown) | SHELL | `src/renderer/index.html:218` (`overflow-x: auto`), documented at `src/renderer/tab-strip.ts:1-5` | Invisible | `SCH-11` |
| B3 | **Active-tab / close affordance presentation** | SHELL | `src/renderer/index.html:220-221` (`.tab.is-active`, `.tab-close`), `:222-223` (`.tab-new`, `no-drag`) | Invisible | `SCH-11` |
| B4 | **Top-bar track height** (C9) | SHELL | `src/renderer/index.html:218` (`min-height: var(--top-bar-size, 36px)`); written by `src/renderer/layout-state.ts:222` (`--top-bar-size`) | Invisible | `SCH-2` |
| B5 | **Window-drag region of the strip/nameplate** | SHELL | `src/renderer/index.html:217-218` (`-webkit-app-region: drag`) with per-tab/button `no-drag` (`:219/222/223`) | Invisible (OS integration) | `SCH-12` |
| B6 | **Close-seam publication** (the closed tab id) | SHELL | `src/renderer/tab-strip.ts:59-77` (`notifyTabClosed`/`drainClosedTabIds`, module-level array) + the drain consumer `src/renderer/sidebar-panes.ts:115` | Invisible | `SCH-3` |
| B7 | **The strip's own DOM churn on re-render** (only its OWN nodes) | SHELL | `src/renderer/tab-strip.ts:78` (`class TabStrip`, `mount`/`getContext`/`persist`/`onActiveChange` at `:43-52`) | Invisible | `SCH-11` |
| C1 | **Top-bar region as the stage's toolbar host** (C2) | SHELL | the tab strip IS the top-bar row (`src/renderer/index.html:278`, comment `:275-277`: branding shares the top-bar row; the former `<header>` block is removed) | Invisible — the stage CONTENT stays visible | `SCH-9` |
| C2 | **Status/warning carriers** (C10 `TAB-1` class) | SHELL | host-side state only — `src/renderer/sidebar-panes.ts:3729-3750` (`pageEditSurfaceCommitState`/`pageEditSurfaceFailure`, read by the tab-strip warning) + the authored stage warning `src/renderer/pane-graph.ts:1505` (`pageCommitWarningContent`) | Warning text is authored where it stands | `SCH-9` |
| C3 | **Nameplate as a shell element** (C14) | SHELL | `src/renderer/index.html:278` (`h1.app-nameplate`), styled `:217` | Invisible | `SCH-9` |
| D1 | **Zone grid tracks declared on the mount root** (C2/C11) | SHELL | `src/renderer/index.html:104-126` (`#app > #wiki-root` declares `--zone-*-track` + `grid-template-columns`/`-rows`/`-areas`) | Invisible (geometry) | `SCH-4` |
| D2 | **Empty-track collapse** (C11) | SHELL | `src/renderer/index.html:147-150` (four `:has([data-zone=…].is-empty:not(.is-revealed))` rules) + the base declarations they must override (`:116-119`) | Invisible OK (an empty zone exposes nothing) | `SCH-4` |
| D3 | **Serialized-layout → CSS-variable projection** (C9) | SHELL | `src/renderer/layout-state.ts:214-224` (`layoutCssVars`), `:292-314` (`LayoutRoot` + `applyLayoutToRoot`), caller `src/renderer/renderer.ts:187-195` (`installLayout`) | Invisible BY DESIGN (operator-scoped) | `SCH-8` |
| D4 | **Per-zone TRACK computation** (C9/C11) | SHELL | `src/renderer/layout-state.ts:233-265` (`isZoneEmpty`) + `:275-288` (`zoneTrackCssVars`) | Invisible | `SCH-8` |
| D5 | **The synchronous track write path** | SHELL | `src/renderer/sidebar-panes.ts:1541-1563` (`applyZoneTracks`, `#app > #wiki-root` + `setProperty`/`removeProperty`) | Invisible | `SCH-8` |
| D6 | **Resize gutters** (C7) | SHELL | `src/renderer/index.html:287-290` (authored, no `on:*`) + `:95-98` (`.layout > .gutter { display: none }` — the strips are currently hidden/dead) | Invisible OK (pure geometry) | `SCH-6` |
| D7 | **Resize gesture model** (C7) | SHELL | `src/renderer/pane-gutter.ts:141` (`isGutterResizable`), `:151` (`createGutterController`), `:74/87/106/116/128` (axis/size/bounds/clamp/commit helpers) | Invisible | `SCH-6` |
| D8 | **Pane relocation gesture model** (C4) | SHELL | `src/renderer/pane-drag.ts:253` (`createDragController`; the threshold-gated reveal-set recomputation commits ONCE per threshold crossing) | Control nodes visible; the gesture is not dispatchable | `SCH-7` |
| D9 | **Zone minimize + tab list** (C12) | **P-ctrl+SHELL** | control: `src/renderer/pane-graph.ts:163-185` (`zoneContainerChildren` — the `zone-minimize-<zone>` toggle at `:169-175` + the `zone-tab-<zone>-<id>` tab nodes at `:177-183`), handler consts `:71-93` | **MUST stay visible/dispatchable** | `SCH-10` |
| D10 | **Pane collapse** (C5) | **P-ctrl+SHELL** | control: `src/renderer/pane-graph.ts:220-233` (the `pane-collapse-<id>` button, class `pane-collapse-toggle`; handler NAME `PANE_COLLAPSE_HANDLER = 'togglePaneCollapse'` at `:52`), host seam `src/renderer/sidebar-panes.ts:3176-3177` → `:3297` | **MUST stay visible/dispatchable** | `SCH-10` |
| D11 | **Empty-zone hide/reveal** (C11) | **P-ctrl+SHELL** | model: `src/renderer/pane-graph.ts:322-336` (`zoneMirrorClasses` — `is-empty`/`is-minimized`/`is-revealed`), consumed `:460-492`; the shell half: `src/renderer/index.html:139-150` + the drag-reveal set (`src/renderer/pane-drag.ts:196`) | Invisible OK | `SCH-10` |
| D12 | **Pane-frame formatting** (C5/C12) | SHELL | `src/renderer/index.html:160-165` (`.pane-frame`, `.is-collapsed`, `.pane-collapse-toggle`) + the container class `src/renderer/pane-graph.ts:67-69` | Invisible | `SCH-10` |
| E1 | **Stage placement vs formatting** (C2) | HYBRID | placement: `src/renderer/pane-graph.ts:338` (`assembleAppGraphEnvelope`) + `:202-250` (`paneSubtreeRoot`); formatting: `src/renderer/index.html:82-94` (`.layout` = the frame that gives `#app` a definite height) | Stage content MUST stay visible | `SCH-9` |
| E2 | **Page-edit surface / stage-body ownership** (C9/C10) | HYBRID | `src/renderer/sidebar-panes.ts:1014-1090` (`mountTab`), `:932` (`getStageMountDropped`), `:974` (`isDocumentLive`), `:3720-3727` (`pageEditSurfaceHandlerSubject`) — the landed `U-STAGE-ACTIVE-TAB` ownership | Surface + body are app-graph (visible); the mount decision is host code | `SCH-9`, `SCH-13` |
| F1 | **Settings modal frame/scrim/body/toggle** (C3) | SHELL | `src/renderer/index.html:297-301` + `:228-259` (frame CSS incl. `position: fixed; inset: 0; z-index: 100`, `.is-closed { display: none }`, the `pointer-events` reset on the scrim, and the toggle's `z-index: 110`) | Invisible BY DESIGN | `SCH-12` |
| F2 | **Modal open/close state machine + wiring** (C3) | SHELL | `src/renderer/modal-state.ts:42` (`createModalController`), `:116` (`installSettingsModal`), caller `src/renderer/renderer.ts:1035` | Invisible BY DESIGN | `SCH-12` |
| F3 | **Operator-mount re-parenting** (C3) | SHELL | `src/renderer/modal-state.ts:116` (`installSettingsModal` re-parents the two existing mounts; the frame comment is `src/renderer/index.html:292-296`) | Invisible BY CONSTRUCTION (isolated scopes) | `SCH-12` |
| G1 | **Root token layer** (C1) | HYBRID | `src/renderer/index.html:15-73` (`:root`/`html[data-theme=…]` + the `@media (prefers-color-scheme: dark)` re-declaration) | Control invisible BY DESIGN; tokens inherently invisible | `SCH-3` |
| G2 | **Appearance controller** (C1) | HYBRID | `src/renderer/theme.ts:12` (`resolveTheme`), `:30` (`applyThemeToRoot`), wiring `src/renderer/renderer.ts:126-180` (`installTheme`) | Tokens invisible; the serialized setting is operator-scoped | `SCH-3` |
| G3 | **Theme persistence carrier** (C9) | HYBRID | `UI-CONFIG-CARRIER` (`docs/decisions.md:228`) — the `theme` field on `OperatorSettings` | Invisible BY DESIGN (operator-scoped) | `SCH-3`, `SCH-13` |
| H1 | **View-menu pane visibility** (C13) | SHELL | `src/main/app-menu.ts:93-135` (`buildMenuTemplate`), `:47` (`normalizePaneCatalog`), `:67` (`orderPaneCatalog`), the pane-catalog IPC bridge (`src/renderer/sidebar-panes.ts:200-206`) | Invisible OK; the real defect is `N1 PANE-VISIBILITY-IRREVERSIBLE` | `SCH-5` |
| H2 | **File → Import / Import folder** (C17) | SHELL | `src/main/app-menu.ts:114-127` + the dialog constants `:34`/`:39` and `:81-88` (`importSelectionFromDialog`); the app semantics: `src/main/import-directory.ts:14-37` | Invisible OK (structurally non-exercisable, parked with reason) | `SCH-5` |

**Reading of the table (three facts the work package depends on).** (a) **14 of 38** instances are Table A/B
provident *models* whose mechanic is shell — those items must keep the model where it is (`SCH-3`/`4`/`6`/`7`/
`8`/`10`/`13`). (b) The five surfaces §4.1 names as **already correctly shell chrome** (B1-B3/B5, F1-F3, G1-G2,
D6-D7, H1-H2) are the ones whose *mechanism* is fileable — no item asks to move them. (c) **Every** instance
in group C/E is a **host** surface the foundation must not learn (the pane registry, the stage's document
ownership, the pane catalog) — those rows are the §5 DO-NOT-FILE constraints.

---

## §3 The handoff items

**Field order is the SC doc's own** (`provident-electron-shell-chrome-requests.md:22-25`):
*problem → today's fork implementation → requested foundation mechanism → acceptance criteria →
MCP-visibility consequence → Astrographer-side adoption steps → priority → fallback if upstream declines →
filing verdict.* **Problem / today's fork implementation / fallback / the SC prose are NOT restated** — each
item cites its `SC-n` and adds only the implementation, queue and adoption layer.

| SCH id | Title | SC mapping | Priority |
| --- | --- | --- | --- |
| `SCH-1` | `SHELL-REGION-HOST` — the region host with the one-in-flow-mount invariant | **SC-1** `SHELL-CHROME-REGION-CONTRACT` (covered) | **P1** |
| `SCH-2` | `GESTURE-DELEGATE` — one delegated pointer-gesture controller | **SC-2** `GESTURE-CONTROLLER` (covered) | **P1** |
| `SCH-3` | `THEME-TOKEN-LAYER` — root token layer + tri-state appearance controller | **SC-4** `THEME-TOKEN-LAYER` (covered) | **P1** |
| `SCH-4` | `ZONE-TRACK-CONTRACT` — declared tracks, derived emptiness, empty-track collapse | **SC-5** `ZONE-TRACK-CONTRACT` (covered) | **P1** |
| `SCH-5` | `MENU-CATALOG-CONTRACT` — catalog → menu template + the dialog seam | **SC-7** `MENU-CATALOG-CONTRACT` (covered) | **P2** |
| `SCH-6` | `GUTTER-RESIZE-CONTROLLER` — the axis/threshold/commit controller for zone sizes | **`NEW — NOT GATED`** — §3.14 | **P2** |
| `SCH-7` | `PANE-RELOCATE-GESTURE` — the relocate/drop model + reveal-set writes at gesture end | **`NEW — NOT GATED`** — §3.14 | **P1** |
| `SCH-8` | `LAYOUT-STATE-PROJECTION` — serialized geometry → custom properties, one write per commit | **`NEW — NOT GATED`** — §3.14 | **P2** |
| `SCH-9` | `SHELL-STATUS-CARRIER` — the top-bar's named slots + typed status/warning carriers | **`NEW — NOT GATED`** — §3.14 | **P2** |
| `SCH-10` | `ZONE-CONTAINER-CHROME` — minimize/tab-list chrome, viewport orientation, gesture containment | **`NEW — NOT GATED`** — §3.14 | **P2** |
| `SCH-11` | `TAB-STRIP-SHELL` — the strip host: mount ownership, order projection, overflow | **`NEW — NOT GATED`** — §3.14 | **P2** |
| `SCH-12` | `OVERLAY-FRAME-PRIMITIVE` — the overlay with the documented MCP-invisibility contract | **SC-3** `OVERLAY-FRAME-PRIMITIVE` (covered) | **P1** |
| `SCH-13` | `FOCUS-SEAM` — the find-or-open tab seam shared by the strip and the MCP tool | **SC-6** `FOCUS-TAB-SEAM` (covered) | **P2** |

**Count identity:** **13 = 7 SC-covered** (`SCH-1/2/3/4/5/12/13` ← `SC-1/2/4/5/7/3/6`) **+ 6 `NEW — NOT GATED`**
(`SCH-6/7/8/9/10/11`). Priorities: **P1 ×6**, **P2 ×7**, **P0 ×0**, **P3 ×0** (the SC doc's definitions:
`provident-electron-shell-chrome-requests.md:24-25` — P0 blocks a shipped consumer path; P1 blocks a planned
consumer unit; P2 quality/parity; P3 destination/future).

### 3.1 `SCH-1` · `SHELL-REGION-HOST` — the region host + the one-in-flow-mount invariant · `SC-1` (P1)

- **Requested foundation mechanism (concrete shape).** SC-1's interface (`ShellRegionName`,
  `ShellRegionSpec`, `CreateShellRegionsOptions`, `ShellRegions`) plus **the two things the interface leaves
  implicit and the implementation must pin**: (a) the **graph-root marker** as an *option* on
  `CreateShellRegionsOptions` (the fork's marker is a root `css.id` — today `#wiki-root`, produced by the
  fork's layout at `src/renderer/index.html:104`), so the invariant is expressible without the foundation
  learning an id; (b) `graphMountElements()` must be computed from the **declared** marker + `mountRoot`, not
  from a DOM query the consumer writes.
- **Acceptance criteria (foundation suite; dom-shim level, no layout).**
  1. **State:** regions declared → `graphMountElements().length === 1`, `=== [mountRoot]`. **Fail-state:**
     after envelope A→B (a second `render()` into the same mount) the cardinality is 2 or the element is not
     `mountRoot` — the `STALE-MOUNT-PUSHES-CANVAS` structural reproduction.
  2. **State:** `isChrome(el) === true` for every declared region element (and the region elements
     themselves); **fail-state:** `true` for an element the render produced.
  3. **State:** `disposeRegion(name)` performs **zero** renders and **zero** graph ops (call-count on the
     render + op seams); **fail-state:** any count > 0.
  4. **State:** `get_rendered_html` output over a fixed envelope is byte-identical with and without a chrome
     region added to the page; **fail-state:** any byte delta.
  5. **Fail-state (documented, not silent):** declaring a region whose `host` is inside `mountRoot` must be
     **refused with a typed error** (clause 2's invariant), never accepted-and-later-violated.
  - *Shim note:* `createShellRegions` needs `document.getElementById`/`createElement` (present,
    `src/shared/dom-shim.ts:93-98`) and `parentNode.appendChild`/`remove` (`:22-28`/`:58-65`). It must **not**
    require `querySelectorAll`/`closest` (absent, `:93-103`).
- **MCP-visibility consequence.** The *positive* half is the one to hold the foundation to: because the mount
  is single and stable, a node addressed by `provident.dispatch` keeps its element identity across a
  re-assembly. The orphaned mount was simultaneously an invisibility bug (a stale sibling carrying the same
  root id could shadow the live mount's rendered HTML).
- **Astrographer-side adoption steps.** (a) Re-declare `#tab-strip` / the four gutters / `#settings-modal` as
  region specs, deleting their hand-authored markup at `src/renderer/index.html:278` and `:287-290` (the modal
  markup at `:297-301` moves to a `modalHost` region); (b) keep `#app` (`:280`) as the ONE `mountRoot` and
  re-point `src/renderer/renderer.ts:830` (`new Runtime({ mount, … })`) at it; (c) **delete** the fork-local
  sweep at `src/renderer/runtime.ts:1143-1164` (it is the compensation SC-1 clause 4 exists to make
  unnecessary) and re-run `tests/renderer-empty-zone-track.test.ts` + `tests/sidebar-panes-host.test.ts`
  against the new invariant; (d) move the mount-cardinality rows **upstream**: the fork's structural
  count assertions become foundation rows, and the fork keeps only the assembled-app live row.
- **Priority:** **P1** (the substrate every other item sits on).
- **Fallback if upstream declines.** Unchanged from SC-1: the fork keeps the hand-authored regions + the
  Runtime sweep and promotes both to a pinned host contract. **Cost stated:** every future fork re-derives the
  leak; the foundation keeps shipping a mount it cannot guarantee.

### 3.2 `SCH-2` · `GESTURE-DELEGATE` — one delegated pointer-gesture controller · `SC-2` (P1)

- **Requested foundation mechanism.** SC-2's `GestureDelegateOptions`/`GestureCommit`/`GestureDelegate`,
  **plus two implementation facts the fork's three controllers prove are load-bearing**: (a) the delegate owns
  **one document-delegated `pointerdown` resolved per event via `closest(selectors)`** (never a per-element
  listener — HOST-1: it must work for chrome authored AFTER boot); (b) `isActive()` is **false until the
  threshold is crossed** (`selectors`/`threshold` are exactly the fork's pinned values:
  `'.gutter[data-zone], .pane-collapse-toggle'` at `src/renderer/renderer.ts:326` and `4` at `:304`).
- **Acceptance criteria (foundation suite; call-count + listener-count, no layout).**
  1. **State:** `down → 20 × move → up` crossing the threshold ⇒ **exactly one** `onCommit`.
     **Fail-state:** any count ≠ 1 (the per-frame write).
  2. **State:** a sequence never crossing the threshold ⇒ `onCommit` 0 **and** `setPointerCapture` 0 calls.
     **Fail-state:** any capture call (the F-1 root cause).
  3. **F-1 regression — state:** `pointerdown` on an element outside `selectors`, then up ⇒ the delivered
     `click`'s `target` **is the pressed element** and no gesture started. **Fail-state:** the `click` target
     is the gesture element or the capturing ancestor.
  4. **Fail-states (each documented, at most one write):** `pointercancel` and `lostpointercapture` each revert
     to the pre-gesture snapshot with ≤1 `onCancel` and leave **listener count at the installed baseline**;
     a `dblclick` on a matched target fires exactly one `onReset` and **never** `onCommit`.
  5. **State:** `dispose()` then a fresh `install(doc)` is idempotent per document (baseline listener count
     restored); **fail-state:** a second install doubling the listeners.
  - *Shim note:* the fork's shim (`src/shared/dom-shim.ts`, **this repo**) has `addEventListener`/`removeEventListener`/
    `listeners[evt].length` (`:10/46-56`) — the listener-count rows are shim-expressible
    **today**. It **also** carries the capture/closest surface these rows need: `setPointerCapture`/`releasePointerCapture`
    (recorded `captureCalls`/`capturePointerId`/`releaseCalls` at `:101-104`; the methods at `:211`/`:216`) and
    `closest` (`:240`, over the documented CSS subset at `:285`/`:278-305`) — so the capture rows are shim-expressible
    **without a new stub** (the one caveat is that the shim records the capture CALL, it does not simulate capture
    semantics). **Verified 2026-09-22** (correcting the earlier draft of this note, which claimed those two members
    were absent — §6.1/§6.2 record the correction). The pointer rows still need the shim's explicit-target
    `dispatchPointer` (`:253`) to drive down/move/up. **The TARGET's shim does not carry any of them** (112 lines;
    see §6.2), so the item's own fixture question stays open for the foundation suite.
- **MCP-visibility consequence.** A swallowed click is an MCP/UI **equivalence break** — `provident.dispatch`
  succeeds on a node whose human click is inert. Foundation-level, the asymmetric failure becomes unreachable
  by construction.
- **Astrographer-side adoption steps.** (a) Delete the DOM-wiring half of `installShellPointers`
  (`src/renderer/renderer.ts:752-796`, incl. the permanent document-delegated `dblclick` at `:775-781` and
  `lostpointercapture` at `:785-791`) and the surface/threshold constants (`:304`/`:326`/`:334`); (b) re-point
  `installShellPointers` at the delegate with the same selectors/threshold and the fork's commit semantics
  (`pane-drag.ts:246-252`/`:285-293`, `pane-gutter.ts:145-150`); (c) **move upstream** the F-1 regression pin
  (currently `tests/renderer-pane-drag-surface.test.ts`) — the fork keeps only the assembled-app live row that
  a real mouse requires (RCA-12's layer split).
- **Priority:** **P1**.
- **Fallback if upstream declines.** SC-2's: keep three ad-hoc controllers + the F-1 pin. **Cost:** the next
  fork re-introduces capture-at-pointerdown and needs its own live audit to find it.

### 3.3 `SCH-3` · `THEME-TOKEN-LAYER` — root token layer + tri-state appearance controller · `SC-4` (P1)

- **Requested foundation mechanism.** SC-4's `ThemeSetting`/`ResolvedTheme`/`ThemeTokens`/
  `ThemeControllerOptions`/`ThemeController`, **plus the two shapes the fork's applier implies**: (a) `apply()`
  receives a **`prefersDark` reading injected through `matchMedia`** so the controller is pure/testable
  (the fork's `resolveTheme(setting, prefersDark)` is exactly that split, `src/renderer/theme.ts:12`); (b) the
  controller **writes one root attribute** (`data-theme`) and **no custom property** — the token VALUES are the
  consumer's stylesheet, and the foundation must not ship Astrographer's 15 tokens.
- **Acceptance criteria (foundation suite; write-count + attribute assertions, no layout).**
  1. **State:** `apply('dark')` with `matchMedia().matches === false` ⇒ `data-theme="dark"`; `apply('light')`
     with `matches === true` ⇒ `data-theme="light"`. **Fail-state:** the OS reading wins over an explicit choice.
  2. **Restart state:** a fresh controller with a persisted explicit `'dark'` and `matches === false` ⇒
     `data-theme="dark"` at boot. **Fail-state:** `'system'` behaviour (the setting not surviving a restart).
  3. **State:** under `system`, an OS-preference change re-applies; **fail-state:** under an explicit choice the
     **same** OS change performs any root write (count > 0).
  4. **State:** a theme flip performs **zero** renders / **zero** reconciled nodes (count on the render + op
     seams). **Fail-state:** any graph pass.
  5. **Malformed-input fail-states (each must NOT throw and must leave a resolvable theme):** `undefined`,
     `null`, `42`, `'DARK'`, a throwing `persist`, a frozen root — 6 cases, asserted individually.
- **MCP-visibility consequence.** A flip produces **no** `get_node_state` delta and no `resource-updated`
  notification — correct, because appearance is not data. The serialized setting is a *separate* concern the
  fork keeps operator-scoped; the foundation must document the split, or a fork will drift into making the
  theme a graph node "so the agent can change it".
- **Astrographer-side adoption steps.** (a) Delete the fork's applier/resolver in favour of the controller
  (`src/renderer/theme.ts:12`/`:30`) and collapse `installTheme` (`src/renderer/renderer.ts:126-180`) to
  construction + `apply` + the persisted read; (b) **keep** the 15-token block (`src/renderer/index.html:15-73`)
  — it is the fork's `ThemeTokens` payload, and the cascade comment at `:52-53` becomes the consumer's
  documentation of the explicit-wins rule; (c) **keep** `UI-CONFIG-CARRIER`'s `theme` field and its store
  (`docs/decisions.md:228`); (d) move the pure resolution/restart/malformed rows **upstream** —
  `tests/unit-u-shell-2-theme.test.ts` shrinks to the fork's own carrier + the assembled-app row.
- **Priority:** **P1**.
- **Fallback if upstream declines.** SC-4's: keep `theme.ts` + the token block pinned host-side. **Cost:**
  every fork re-derives the specificity/media-query cascade and re-invents persistence + restart semantics.

### 3.4 `SCH-4` · `ZONE-TRACK-CONTRACT` — declared tracks, derived emptiness, empty-track collapse · `SC-5` (P1)

- **Requested foundation mechanism.** SC-5's `ZoneTrackContract`, **plus the delivery form the tree shows is
  required**: (a) a **base track declaration** the consumer owns and the collapse rule **overrides on the SAME
  element** (the fork's cascade lesson, `src/renderer/index.html:107-115` — a rule on the ancestor is only
  inherited and loses); (b) **`isEmpty(zone)` derived from a supplied pane census** (the fork passes
  `enabledZonePaneCounts`' result; the foundation must not learn the registry) with the **census authoritative**
  and any JS write a synchronous mirror of the async state mirror (`sidebar-panes.ts:1530-1540`);
  (c) `trackCss(zone)` returns `'0px'` for a zero-pane zone **that is not currently revealed**.
- **Acceptance criteria (foundation suite; declaration + count assertions, no layout).**
  1. **State:** an empty zone's track resolves to `0px`; a non-empty zone's to its persisted size — asserted
     from **the declaration string + the derived emptiness agreeing**. **Fail-state:** the declaration and the
     census disagree (the `EMPTY-ZONE-TRACK-NOT-COLLAPSED` class: a variable declared but never read).
  2. **State:** a content change inside one pane re-renders **no** pane slot (identity/count, not markup
     diffing); **fail-state:** any slot identity change (the `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` class).
  3. **State:** no `resize`/`ResizeObserver` registration exists on the layout path (**static assertion over
     the mechanism's own module**) **and** dispatching a window-resize event performs **zero** custom-property
     writes (runtime count). **Fail-state:** any registration or write.
  4. **State:** a `order` change alters the slot sequence and **no other** model field; a DOM order that
     contradicts the serialized `order` is corrected on the next projection. **Fail-state:** DOM order accepted
     as the source of truth.
  5. **MCP-facing row:** a collapsed / minimized / hidden zone leaves the row-node census **unchanged** and the
     `list_targets` census unchanged. **Fail-state:** any windowing/virtualization that unmounts rows.
- **MCP-visibility consequence.** Invariant 6 is the MCP-facing one: *"the app got faster"* and *"the agent lost
  addressability"* are the same edit. Invariants 1–4 change no node, emit no notification — the Table C boundary.
- **Astrographer-side adoption steps.** (a) Re-point the track declaration at the contract's `trackOwner`
  (`src/renderer/index.html:104-126`); (b) delete the fork's duplicate emptiness computation
  (`src/renderer/layout-state.ts:233-265` stays only as the **census supplier**, not as a second authority) and
  re-point `zoneTrackCssVars` (`:275-288`)/`applyZoneTracks` (`src/renderer/sidebar-panes.ts:1541-1563`) at the
  contract; (c) keep the four `:has()` rules (`index.html:147-150`) as the declarative half; (d) move the
  census-vs-declaration agreement rows **upstream**, keeping `tests/renderer-empty-zone-track.test.ts` +
  `tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts` as the fork's own wiring rows; (e) the fork's **O-10**
  slot-order unit (`docs/decisions.md:35`) consumes the contract's `orderOf` (the **requested** parameter name —
  `orderOf` is not a symbol in either tree today; the fork supplies the order through `orderPaneCatalog`,
  `src/main/app-menu.ts:67`, and O-10's own `LayoutState.panes[].order`), so it lands after this item, never
  with it.
- **Priority:** **P1**.
- **Fallback if upstream declines.** SC-5's: pin the contract in the fork's own spec (`LAYOUT-IN-CSS`,
  `docs/decisions.md:34`) + O-10. **Cost:** the next fork re-derives containment, JS-geometry and empty-track
  collapse from defects.

### 3.5 `SCH-5` · `MENU-CATALOG-CONTRACT` — catalog → template + the dialog seam · `SC-7` (P2)

- **Requested foundation mechanism.** SC-7's `MenuCatalogItem`/`MenuActionSeam`/`BuildMenuOptions`/
  `buildMenuFromCatalog`/`NativePickerSeam`, **plus three shapes the fork's builder pins as required**:
  (a) the **untrusted-catalog normalizer** is the contract's own (the fork's `normalizePaneCatalog` +
  `orderPaneCatalog`, `src/main/app-menu.ts:47/67` — an out-of-contract catalog must yield the disabled group,
  never a throw); (b) **platform is a parameter with two documented shapes** — `darwin` leads with the app menu
  and emits **one** combined picker item, non-darwin emits a **separate** folder item
  (`src/main/app-menu.ts:113/121-123`); (c) the builder **imports no `electron` and no `fs`** and its
  `click` handlers route **only** through `actions`.
- **Acceptance criteria (foundation suite; pure-data deep-equality, no Electron).**
  1. **State:** a catalog of `action`/`toggle`/`separator`/`submenu` produces a template mirroring it in
     catalog order after `orderOf` (fixture deep-equality). **Fail-state:** a hard-coded item appearing.
  2. **State:** `platform: 'darwin'` vs `'linux'` from the SAME catalog produce the documented different shapes,
     **including the single-vs-separate picker item**. **Fail-state:** identical templates.
  3. **State:** one activation ⇒ exactly one `invoke(id, …)` (with `checked` for a toggle). **Fail-state:**
     zero (a dead item) or two (double routing).
  4. **Fail-states (must not throw):** an empty catalog, a non-array catalog, a catalog with an unknown `kind`
     ⇒ a disabled/empty group each time.
  5. **Dialog seam state:** a cancel/dismiss or empty selection resolves `null`; a non-empty selection is passed
     through **byte-identical**; **fail-state:** any interpretation (a filter applied, a path expanded, a cap
     enforced) — clause 5's excluded semantics.
  6. **Static assertion:** no `electron` and no `fs` import in the builder module; **fail-state:** either import.
- **MCP-visibility consequence.** Native menus are OS chrome and stay MCP-invisible by design; routing every
  item's action to the host by `id` keeps the *action* auditable where the fork's pane-visibility channel and
  its tool gating live. The Import-semantics exclusion is a visibility decision too: importing a corpus is an
  MCP-exposed capability, so folding its policy into shell menu code would put domain policy in the one layer
  an agent cannot see.
- **Astrographer-side adoption steps.** (a) Re-point `buildMenuTemplate` (`src/main/app-menu.ts:93-135`) at
  `buildMenuFromCatalog` and **delete** the fork's template assembly while **keeping** `normalizePaneCatalog`/
  `orderPaneCatalog` only if the contract's own normalizer does not replace them (the fork keeps them either way
  as its `orderOf` input); (b) re-point the picker call site at `NativePickerSeam` and **keep**
  `IMPORT_DIALOG_FILTERS`/`IMPORT_DIALOG_PROPERTIES`/`importSelectionFromDialog` (`:34/39/81-88`) as the
  fork's picker spec + cancel contract; (c) **keep all of `src/main/import-directory.ts:14-37`** — the 512 cap,
  atomicity, `corpusRoot` containment and the three outcome codes are excluded by clause 5; (d) move the pure
  builder rows **upstream** (`tests/unit-u-menu-1-application-menus.test.ts` shrinks to the fork's catalog
  wiring + the live native-menu park).
- **Priority:** **P2**.
- **Fallback if upstream declines.** SC-7's: keep `app-menu.ts` + `import-directory.ts` as a pinned host
  contract, recorded fork-local in `docs/FORK-DIVERGENCE.md`. **Cost:** every fork re-derives the platform
  shapes, the untrusted-catalog normalization and the dialog cancel contract.

### 3.6 `SCH-6` · `GUTTER-RESIZE-CONTROLLER` — axis/threshold/commit for zone sizes · `NEW — NOT GATED` (P2)

> **`NEW — NOT GATED`.** **Reason:** no `SC-n` requests the *resize* gesture's model. `SC-2` covers the
> delegate (the pointer lifecycle), `SC-5` covers the tracks and the geometry ownership, and `SC-5` clause 7
> explicitly does **not** request "minimum/maximum sizes" or the gutter's own semantics. The nearest covering
> language is §4.1's *"the gutters (C7) … are ALREADY and CORRECTLY shell chrome"* — which establishes that
> the surface needs no move, **not** that a foundation controller for it is in scope. **This item therefore
> needs its own filing decision** (a new contract change, an appendix to `SC-2`/`SC-5`, or a decline recorded
> once for both); it must not be read as silently extending the gated set.

- **Problem (implementation layer).** With `SCH-2` landing, the fork would still hand-roll four
  gutter-specific decisions that every shell with resizable tracks re-invents: the axis per zone, the
  **bounds/clamp** on a committed size, the **double-click reset to the registry default**, and the
  **is-resizable predicate** (a collapsed or minimized zone has no resizable gutter).
- **Today's fork implementation (verified).** `src/renderer/pane-gutter.ts:74` (`gutterAxis`), `:87`
  (`gutterSizeForPoint`), `:106` (`gutterBounds`), `:116` (`clampGutterSize`), `:128` (`setZoneSize`), `:141`
  (`isGutterResizable`), `:151` (`createGutterController` — "end performs the ONE `onCommit` write for the
  gesture; `cancel` reverts with no write; `reset` commits the registry default once"); wired at
  `src/renderer/sidebar-panes.ts:886`; the authored strips are currently hidden (`index.html:95-98`).
- **Requested foundation mechanism.** A controller built **on** `SCH-2`'s delegate, not beside it:
  `createTrackResizeController({ axisFor, boundsFor, isResizable, defaultSize, commit })` returning the same
  `GestureController` shape (`end`/`cancel`/`reset`), with **(a)** one commit per gesture, **(b)** a cancel that
  writes nothing, **(c)** a reset that commits the supplied default exactly once, **(d)** a refusal
  (no gesture start) when `isResizable()` is false.
- **Acceptance criteria (foundation suite; call-count, no layout).**
  1. **State:** a threshold-crossing drag on a resizable track ⇒ exactly one commit with the clamped size.
     **Fail-state:** >1 commit (per-frame) or an unclamped size outside `boundsFor`.
  2. **Fail-state:** a `pointercancel` mid-drag reverts and commits **nothing** (count 0).
  3. **State:** a `dblclick` reset commits the default exactly once and never also commits a drag value.
  4. **State:** `isResizable() === false` ⇒ no gesture starts, no capture, zero commits. **Fail-state:** a
     collapsed/minimized track resized anyway.
  5. **Fail-state:** a non-finite/negative `boundsFor` result never produces `NaN`/negative geometry (the
     fork's fail-soft discipline, generalized).
- **MCP-visibility consequence.** None claimed: a resize changes no node, produces no census delta and emits no
  notification — the Table C boundary. The one MCP-facing rule is inherited from `SCH-4` (a collapse must not
  unmount rows), and this item must not introduce one.
- **Astrographer-side adoption steps.** Re-point `sidebar-panes.ts:886` at the foundation controller and delete
  the fork's clamp/bounds/axis helpers if the contract absorbs them (keeping `setZoneSize`'s model mutation,
  which is the fork's serialized write). Fork test rows that move upstream: the pure `bounds`/`clamp`/`reset`
  rows of `tests/unit-u-shell-5-resizable-gutters.test.ts`; the fork keeps its layout-state round-trip rows.
- **Priority:** **P2** — blocks no shipped path (the fork's controller works); the cost is reuse.
- **Fallback if upstream declines.** The fork keeps `pane-gutter.ts` as a pinned host contract, documented
  fork-local; the cost is that every fork re-derives clamping, the reset semantics and the resizable predicate.

### 3.7 `SCH-7` · `PANE-RELOCATE-GESTURE` — the relocate/drop model + reveal-set writes · `NEW — NOT GATED` (P1)

> **`NEW — NOT GATED`.** **Reason:** `SC-2` covers the pointer lifecycle and clause 6 explicitly excludes
> *"the pane layout model, or the drag image / `dataTransfer` content (that is host/app data)"*. `SC-5`
> invariant 5 covers the **slot-order authority** but not the relocate gesture's model. The `F-1` defect this
> item's acceptance set closes is *cited* by `SC-2` as motivation, but the pinned-decision text it consumes is
> fork-side. **This item needs its own filing decision** — and it is the item with the strongest
> shipped-correctness claim (the F-1 class), so the decision should be recorded either way.

- **Problem (implementation layer).** The relocate gesture's *model* — the resolved drop target, the insertion
  index, the provisional reveal set, and "one write at gesture end" — has no reusable shape, so a fork either
  commits per move (a per-frame write, the forbidden hybrid) or re-derives a threshold-gated commit.
- **Today's fork implementation (verified).** `src/renderer/pane-drag.ts:253` (`createDragController`) with
  `insertionIndexForPoint`/`movePane`/`setZoneMinimized` (`sidebar-panes.ts:52-54` imports) and the reveal-set
  recomputation committing ONE `onRevealChange` write per threshold crossing (`:246-252`/`:285-293`; the
  proximity half at `:196`); wired at `src/renderer/sidebar-panes.ts:875`.
- **Requested foundation mechanism.** `createRelocateController({ resolveDrop, onRevealChange, commit })` over
  `SCH-2`'s delegate, pinning: **(a)** at most one `onRevealChange` per **threshold crossing** and zero before
  the threshold; **(b)** one `commit` at gesture end carrying the resolved drop; **(c)** the `F-1` clause
  restated as a mechanism property — a `pointerdown` on **content** inside a frame never starts a relocate;
  **(d)** a cancel/revert that restores the pre-gesture reveal set **and** commits nothing.
- **Acceptance criteria (foundation suite; call-count + set equality, no layout).**
  1. **State:** a drag over N candidate targets ⇒ `onRevealChange` fires once per **crossing** (assert the
     count against the crossing sequence, not N). **Fail-state:** one call per move.
  2. **State:** a completed drag commits exactly once with the resolved drop. **Fail-state:** zero (a dropped
     gesture that wrote nothing) or >1.
  3. **F-1 clause state:** a `pointerdown` on a provident content node inside the frame, then up ⇒ the `click`
     reaches its own target and **no** gesture, **no** capture, **zero** reveal writes. **Fail-state:** the
     click retargets to the frame/surface.
  4. **Fail-state:** a cancel restores the reveal set **exactly** (set equality against the pre-gesture
     snapshot) and commits nothing.
  5. **Fail-state:** an interrupted pointer (`lostpointercapture` without up) leaves no stale reveal set and
     no retained listeners.
- **MCP-visibility consequence.** The relocate gesture is not dispatchable, so parity lives at the application
  seam: the commit must reach the **same** layout write the provident control nodes reach (`SCH-10`'s
  minimize/collapse controls and `SCH-4`'s `orderOf`) — otherwise the UI drag and an agent's structural op
  write two different models.
- **Astrographer-side adoption steps.** Re-point `sidebar-panes.ts:875` at the foundation controller; keep the
  fork's drop-resolution policy (which panes exist, zone names, the reveal carve-out) as the injected
  `resolveDrop`; delete the reveal-recomputation plumbing in `pane-drag.ts:246-293` once the contract owns the
  threshold gating; move the F-1 regression rows **upstream** and keep the fork's `renderer-pane-drag-surface`
  row only as the assembled-app live row.
- **Priority:** **P1** — a shipped correctness property (`F-1`, live-confirmed) is exactly what the contract
  makes unreachable by construction.
- **Fallback if upstream declines.** The fork keeps `pane-drag.ts` + the pinned decision
  (`PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE`, `docs/decisions.md:30`) and the F-1 regression stays
  fork-local. The cost is stated plainly: the next fork re-introduces the capture-at-pointerdown bug.

### 3.8 `SCH-8` · `LAYOUT-STATE-PROJECTION` — serialized geometry → custom properties, one write per commit · `NEW — NOT GATED` (P2)

> **`NEW — NOT GATED`.** **Reason:** `SC-5` requests the *contract* (who owns the tracks; no resize listener;
> JS writes only operator-chosen sizes) and clause 7 excludes minimum/maximum sizes; it does not request the
> **projection mechanism** (serialized state → a named set of custom properties, with a synchronous-mirror rule
> and a fail-soft total applier). The fork's `layoutCssVars`/`applyLayoutToRoot`/`zoneTrackCssVars` triple is
> the shape; the gated set neither asks for it nor forbids it. **Needs its own filing decision.**

- **Problem (implementation layer).** Every themed, resizable shell needs the same three-way split — a **pure
  projection** (state → vars), a **pure track computation** (census + state → track vars), and a **total
  applier** (vars → a root whose `style` may be frozen/absent) — and each fork re-invents the fail-soft
  discipline that keeps a corrupt persisted size from emitting `NaN`/`-Infinity` geometry.
- **Today's fork implementation (verified).** `src/renderer/layout-state.ts:214-224` (`layoutCssVars`, 6 vars
  incl. `--stage-weight: <size>fr`), `:233-265` (`isZoneEmpty`), `:275-288` (`zoneTrackCssVars`), `:292-314`
  (`LayoutRoot` + `applyLayoutToRoot`); the boot caller `src/renderer/renderer.ts:187-195`; the live write path
  `src/renderer/sidebar-panes.ts:1541-1563`.
- **Requested foundation mechanism.** `projectLayoutVars(state, spec)` (pure) + `applyVarsToRoot(root, vars)`
  (total: a missing/frozen `style`/`setProperty` is untouched, never throws; returns the vars actually applied)
  + `computeTrackVars(census, state, { revealed })`, where `spec` names the variable names and units **from the
  consumer** (the foundation must not learn `--zone-left-size`/`--stage-weight`).
- **Acceptance criteria (foundation suite; pure + total, no layout).**
  1. **State:** a well-formed state projects the declared variable set with the declared units; **fail-state:**
     an extra or missing variable name.
  2. **Fail-states (each must NOT throw and must leave the previous root untouched):** a frozen `style`, an
     absent root, a `style` without `setProperty` — 3 cases.
  3. **State:** a corrupt/out-of-range size never yields `NaN`/`Infinity`/a negative dimension (**the fork's
     F-2 pin, generalized**). **Fail-state:** any non-finite or negative value in the returned map.
  4. **State:** `computeTrackVars` returns `'0px'` for a zero-census zone **not** in `revealed`, else the
     persisted size; **fail-state:** a zero census with a non-zero track (the `EMPTY-ZONE-TRACK-NOT-COLLAPSED`
     class).
  5. **State:** the applier is called once per layout **commit** — asserting the write count for a single
     commit is 1 and for a no-op commit is 0. **Fail-state:** a write per frame.
- **MCP-visibility consequence.** None: geometry and custom properties change no node, produce no census delta
  and emit no notification. **It must stay that way** — an implementation that mirrors layout into the graph
  "so the agent can read it" would put geometry into `get_rendered_html` and break the Table C boundary.
- **Astrographer-side adoption steps.** Replace the fork's three functions with the contract's (keeping the
  fork's variable-name spec, which is the fork's data), re-point `renderer.ts:187-195` and
  `sidebar-panes.ts:1541-1563`, and move the total/fail-soft rows upstream (`tests/props-layout-state.test.ts`
  keeps only the fork's spec + carrier rows).
- **Priority:** **P2**.
- **Fallback if upstream declines.** The fork keeps `layout-state.ts` as a pinned host contract; the cost is
  that every fork re-derives the fail-soft projection and the track/census agreement rule.

### 3.9 `SCH-9` · `SHELL-STATUS-CARRIER` — the top bar's named slots + typed status/warning carriers · `NEW — NOT GATED` (P2)

> **`NEW — NOT GATED`.** **Reason:** `SC-1` requests the region **declaration + mount invariant** and clause 5
> explicitly excludes "any specific region set"; no `SC-n` requests a **slot model** or a **status-carrier
> mechanism** for a shell region. Astrographer's top bar has exactly one slot today (the strip, sharing the row
> with the nameplate) and its warning state is **host-side** (`src/renderer/sidebar-panes.ts:3729-3750`, consumed
> by the tab-strip warning — no shell carrier exists). **The mechanism is therefore requested, not assumed, and
> it needs its own filing decision;** it is deliberately last in the P1 chain so a decline costs nothing else.

- **Problem (implementation layer).** A foundation that gains regions (`SCH-1`) still has no way to say *what
  belongs in a region* or *how a shell-level status/warning reaches it*: the fork's top-bar warning is read from
  host state by the strip controller, so any consumer that wants a status chip/warning must invent its own
  reader and its own DOM.
- **Today's fork implementation (verified).** The top bar is the strip row (`src/renderer/index.html:275-278`);
  the status/warning carriers are host-side state read at render time (`src/renderer/sidebar-panes.ts:3729-3750`:
  `pageEditSurfaceCommitState`/`pageEditSurfaceFailure`, "never a rendered class/attribute/innerHTML: a warning
  that exists only as a DOM class is `FS17`") plus the authored stage warning
  (`src/renderer/pane-graph.ts:1505`, `pageCommitWarningContent`); no `#shell-status`/`#shell-warning` element
  exists anywhere (verified: the only ids in `index.html` are `tab-strip`/`app`/`panes`/`operator-panes`/the
  gutters/the modal pair/the settings toggle).
- **Requested foundation mechanism.** A **named-slot** extension of `SCH-1`'s region spec plus a carrier
  contract:
  `ShellRegionSpec.slots?: Readonly<Record<string, SlotSpec>>` (`{ order, className, attributes? }`) and
  `ShellStatusPublisher { publish(slot: string, status: ShellStatus | null): void }` with
  `ShellStatus = { kind: string; text: string; tone?: 'info' | 'warn' | 'error' }` — the publisher writes
  **one** element per slot, replacing the previous content and removing the element for `null`, and performs
  **no** graph pass.
- **Acceptance criteria (foundation suite; element counts + call counts, no layout).**
  1. **State:** two slots declared → two elements, in declared order, each carrying its class + attributes.
     **Fail-state:** slots rendered in a different order or merged into one element.
  2. **State:** `publish(slot, status)` twice replaces the first (still **one** element, the second text).
     **Fail-state:** accumulating elements (the mount-leak class inside a region).
  3. **State:** `publish(slot, null)` removes the element and leaves the region's other slots untouched.
     **Fail-state:** an empty element left in flow.
  4. **Fail-state:** publishing performs **zero** renders and zero graph ops (count) — the carrier is chrome.
  5. **Fail-state:** a slot name not in the region spec is refused (typed error), never silently created.
- **MCP-visibility consequence.** The carrier is chrome: a published status appears in **no** `get_rendered_html`
  / `get_markdown` / `list_targets` output. The rule this item must respect: a **warning about graph content**
  must stay authored **where the content is** (the fork's `pageCommitWarningContent`,
  `src/renderer/pane-graph.ts:1505`) — the carrier exists for shell-level status only, so a consumer cannot
  move an MCP-visible message into invisible chrome by publishing it.
- **Astrographer-side adoption steps.** Declare the top bar's slots (nameplate / status / warning) over the
  `SCH-1` region and move the branding element (`index.html:278`) into the nameplate slot; keep the fork's host
  state as the **status source** and publish from the same seam that renders the tab-strip warning; add the
  fork's own rows for the source→carrier mapping. No fork test moves upstream except the shared region/slot
  rows of `SCH-1`.
- **Priority:** **P2** — quality/parity; it blocks no shipped path and no gated `SC-n`.
- **Fallback if upstream declines.** The fork keeps its single-element top bar and its host-side warning reader,
  and the shell-status mechanism stays fork-local. The cost is small and stated: a future fork re-invents a
  status chip as inline HTML — which is the `AGENTS.md:23-34` review finding the carrier would have prevented.

### 3.10 `SCH-10` · `ZONE-CONTAINER-CHROME` — minimize/tab-list chrome, viewport orientation, gesture containment · `NEW — NOT GATED` (P2)

> **`NEW — NOT GATED`.** **Reason:** `SC-5` invariant 3 requests containment ("equivalently: an equivalent
> containment statement") as a **contract clause on the consumer's CSS**, and its clause 7 excludes "the
> collapse/minimize controls (provident nodes, Table A)". §4.1's MUST-NOT-MOVE list is the same list. So
> neither the **containment delivery form** (a shell utility that applies it, rather than a rule the consumer
> hand-writes) nor the **zone-container chrome model** (class mirrors + orientation + tab-list geometry) is in
> the gated set. **Needs its own filing decision.**

- **Problem (implementation layer).** The zone container's chrome is one CSS block plus one class-mirror list,
  and both must agree with provident-authored control nodes (C12) that cannot move. A foundation that ships
  `SCH-4`'s tracks but not the container chrome leaves every fork to re-derive the mirror/orientation/containment
  trio — and the fork's own tree shows the agreement is load-bearing (`zoneMirrorClasses` must match the CSS
  selectors, or the collapse silently stops working).
- **Today's fork implementation (verified).** Mirror classes `src/renderer/pane-graph.ts:322-336`
  (`is-empty`/`is-minimized`/`is-revealed`), consumed at `:460-492`; the control nodes `:161-183`; the CSS
  `src/renderer/index.html:139-150` (collapse rules), `:160-165` (pane-frame + toggle presentation); the
  orientation derivation `src/renderer/pane-drag.ts:216` (F8 — "derive the tab-strip orientation from the zone
  edge: sidebars …"), read by `src/renderer/sidebar-panes.ts:551-553`; **containment: absent** —
  `contain: layout style paint` appears nowhere in `src/**` (verified: zero matches repo-wide for `contain:`).
- **Requested foundation mechanism.** Two small pieces, both consumer-configured: **(a)**
  `applyGestureContainment(frames)` / a documented `CONTAINMENT_CLASS` whose stylesheet declaration is shipped
  by the foundation (so invariant 3 has **one** implementation, not one per fork); **(b)**
  `zoneContainerChrome(spec)` returning the class mirror + the orientation token for a zone given its edge and
  minimize state — **the model stays the consumer's** (the mirror classes remain authored on the provident
  container node by the fork's assembler).
- **Acceptance criteria (foundation suite; declaration + class-set assertions, no layout).**
  1. **State:** `zoneContainerChrome({ edge: 'left', minimized: false, paneCount: 0, revealed: false })` yields
     the documented class set; **fail-state:** a class the consumer's selectors do not reference (the
     declared-but-never-matched mistake).
  2. **State:** `minimized: true` with `paneCount: 0` yields **is-empty only** (the fork's pin: the `is-empty`
     branch precedes minimizing, `pane-graph.ts:326-330`); **fail-state:** both classes emitted.
  3. **State:** orientation flips with the edge (a side zone vs a header/footer zone) — fixture equality;
     **fail-state:** a fixed orientation.
  4. **Fail-state (containment):** the containment class is **present** on a gesture-capable frame and the
     declaration is asserted on the rule string; a frame with the class must not be the track owner (the
     `SCH-4` invariant).
  5. **Fail-state:** applying class mirrors performs **zero** renders (count) — the mirror is authored on the
     node by the consumer's assembler, never re-rendered by the shell.
- **MCP-visibility consequence.** Containment and container classes change no node and produce no census delta
  — invisible by design. The one MCP-facing rule is inherited and must be restated in the contract: a
  minimized/collapsed/hidden zone must **not** unmount its rows (the `SCH-4` row-node-census criterion);
  containment is a paint/layout boundary, never a residency boundary.
- **Astrographer-side adoption steps.** (a) Move the four collapse rules' selector contract and the frame
  declarations onto the shipped class/declaration; (b) apply the containment class at the frame authoring site
  (`src/renderer/pane-graph.ts:238-249`, the frame root) — the fork's `contain:` statement does not exist today,
  so this item's fork half is **new CSS, not a deletion**; (c) keep `zoneMirrorClasses` (`:322-336`) as the
  consumer of `zoneContainerChrome` and re-point the assembler's class computation; (d) keep every C12 control
  node untouched (§5); (e) move the class-set fixture rows upstream, keeping the fork's assembler rows.
- **Priority:** **P2** — note the honest split: the **containment half is P1** under SC-5's invariant 3, but it
  is *deliverable as a consumer CSS rule* today, so the foundation-side delivery form is P2.
- **Fallback if upstream declines.** The fork pins the container chrome + containment as host CSS (the
  `LAYOUT-IN-CSS` row, `docs/decisions.md:34`), and the mirror-class agreement stays a fork test. The cost is
  that the declared-but-unmatched class mistake is re-found by every fork.

### 3.11 `SCH-11` · `TAB-STRIP-SHELL` — the strip host: mount ownership, order projection, overflow · `NEW — NOT GATED` (P2)

> **`NEW — NOT GATED`.** **Reason:** `SC-6` requests the **focus model** and clause 5 excludes "the tab strip's
> markup, the tab's provident body, … the strip's overflow behaviour". §4.1 rules the strip is already correctly
> shell chrome. So the **shell host** the strip controller needs — a mount-owning strip whose only removals are
> its own nodes, whose element order is a projection of the serialized `order`, and whose overflow is a single
> documented mode — is neither gated nor excluded by name. **Needs its own filing decision.**

- **Problem (implementation layer).** The strip controller is where a shell's re-render discipline actually
  lives: the fork's controller removes **only its own nodes** so a shell-authored nameplate survives inside the
  same mount. That rule is invisible in `SC-6` (a model-only request) and is exactly the kind of
  mount-ownership detail that produces a leaked element in every naive re-implementation.
- **Today's fork implementation (verified).** `src/renderer/tab-strip.ts:78` (`class TabStrip`; options
  `mount`/`getContext`/`persist`/`onActiveChange` at `:43-52`), `:94-101` (`getState()` returns a copy),
  `:104-118` (`active()`/`load()`/`ensure()`); the markup is **hand-authored inline** at
  `src/renderer/index.html:278` (`<div id="tab-strip" class="tab-strip"><h1 class="app-nameplate">…`);
  overflow is `overflow-x: auto` at `:218`; the active/close/new affordances are `:220-223`; the mount is
  resolved by id at `src/renderer/renderer.ts:841`.
- **Requested foundation mechanism.** `createTabStripHost({ mount, orderOf, onActivate, onClose, onReorder })`
  with four pinned properties: **(a) own-node ownership** — a re-render removes exactly the elements the host
  created and nothing else in the mount (assert element identity for a foreign sibling across two renders);
  **(b) order projection** — element order follows `orderOf()` on every render, never DOM order;
  **(c) one overflow mode**, declared and asserted (the foundation's, not a per-fork choice); **(d) no graph
  pass** on any strip operation.
- **Acceptance criteria (foundation suite; identity/count assertions, no layout).**
  1. **State:** a foreign (consumer-authored) sibling is present in the mount across two host renders ⇒ it is
     **the same element** and still present. **Fail-state:** the foreign sibling removed or re-created.
  2. **State:** `orderOf()` returns a permutation ⇒ element order equals it on the next render (identity per
     entry preserved). **Fail-state:** DOM order accepted, or an entry re-minted.
  3. **State:** activating a tab calls `onActivate` exactly once with the entry id; closing calls `onClose`
     once with the id. **Fail-state:** a strip operation that also triggers a render/op (count > 0).
  4. **Fail-state:** an empty tab set renders the empty strip and throws nothing; a mount of `null` leaves the
     host usable (all operations no-op, `getState()` still valid) — the fork's fail-soft discipline.
  5. **State:** the declared overflow mode is asserted as a single named mode (a constant the contract exports),
     so two consumers cannot silently diverge.
- **MCP-visibility consequence.** Invisible by construction — which is the point: the strip is chrome and the
  fork's **selection** must reach MCP through `SCH-13`'s model, never through the strip's DOM. An implementation
  that let an agent read the strip's elements would put chrome into `get_rendered_html` and break §4.1.
- **Astrographer-side adoption steps.** Re-point `src/renderer/renderer.ts:841-866` (the `TabStrip`
  construction) at the host and keep the mount element only as the host's `mount` argument (the markup at
  `index.html:278` becomes the region's slot content per `SCH-9`); keep the strip CSS (`:210-223`) as the fork's
  presentation; delete the fork's own-node removal code once the host owns it; **keep** `notifyTabClosed`/
  `drainClosedTabIds` (`tab-strip.ts:59-77`) — the close-seam publication is `SCH-13`'s host-side concern, not
  the strip's.
- **Priority:** **P2**.
- **Fallback if upstream declines.** The fork keeps `TabStrip` + the inline markup as a pinned host contract.
  The cost: every fork re-derives own-node ownership (and re-finds the leaked-nameplate bug class).

### 3.12 `SCH-12` · `OVERLAY-FRAME-PRIMITIVE` — overlay with a documented MCP-invisibility contract · `SC-3` (P1)

- **Requested foundation mechanism.** SC-3's `OverlayOptions`/`Overlay`, **plus the four implementation facts
  the fork's modal proves are load-bearing and must be in the contract, not inferred**: (a) the **closed state
  is `display:none`** on the frame (the fork's `.settings-modal.is-closed`, `src/renderer/index.html:234`) —
  never opacity/z-index; (b) the **scrim must reset `pointer-events`** because the frame is pointer-transparent
  (`:229-246`; the comment records that scrim-click-to-close was dead until that reset); (c) the **open/closed
  class is XOR** and `state()` is the single source of truth (the fork mirrors `isOpen()` onto class tokens,
  `src/renderer/modal-state.ts:140-186`); (d) **re-parenting existing mounts must be possible without
  re-creating or re-rendering them** (the pinned `MODAL-SETTINGS-REPARENT`, `docs/decisions.md:239`).
- **Acceptance criteria (foundation suite; attribute/style/count assertions, no layout; the a11y rows need the
  shim extensions named in the last bullet).**
  1. **State:** closed ⇒ the frame's style carries `display:none`; open ⇒ present with exactly one of
     `is-open`/`is-closed`. **Fail-state:** both or neither (the XOR clause).
  2. **State:** `Escape` while open closes **once**; `Escape` while closed is a **no-op** (zero writes, no
     throw) — the fork's `modal-state.ts:149-157` semantics generalized.
  3. **State:** a click **on the scrim** closes; a click dispatched on a **frame content** element does **not**
     (`isOpen()` unchanged). **Fail-state:** a content click closing (a hard rule).
  4. **State:** while open, every element returned by `background()` carries the inert attribute; on close,
     **none** do (attribute presence only). **Fail-state:** `inert="false"` present (the boolean path is
     presence/absence — `inert` IS a member of the closed boolean set, verified in the fork's installed copy).
  5. **State:** opening performs **zero** graph passes and zero renders of graph content (count).
  6. **Fail-state:** re-parenting an existing element into the frame body does not re-create it (element
     identity preserved) and does not trigger a graph op.
  - *Shim note:* rows 4-5 need an `inert`-reflecting attribute stub and a render-count seam (both expressible
    on the existing shim); row 2's focus-trap half needs `document.activeElement` and a focusable walk —
    **absent from `src/shared/dom-shim.ts`**, so the item's fixture must supply them, and the trap must be
    mechanism-agnostic (native `<dialog>`/top-layer or an explicit trap are both acceptable).
- **MCP-visibility consequence.** The sharpest of the set, and the contract must carry it: **the scope, not the
  overlay, decides visibility** — the frame/scrim/chrome are invisible to `get_rendered_html`/`get_markdown`/
  `list_targets`; content authored in a **separate** graph scope stays in that scope; content authored in the
  **app** graph does **not** become invisible merely by being inside an overlay. Today the fork derives this
  from `OPERATOR-ISOLATED-GRAPHSCOPE` + the C3 isolation mount, i.e. from a host-side inference about an engine
  feature.
- **Astrographer-side adoption steps.** (a) Delete `installSettingsModal`'s wiring half
  (`src/renderer/modal-state.ts:116-186`) and re-point `src/renderer/renderer.ts:1035` at the primitive,
  keeping the re-parenting call as the primitive's consumer-side step; (b) keep the `MODAL-*` decisions
  authoritative (`docs/decisions.md:239-240`) — the primitive only has to be **compatible** with re-parenting
  existing mounts; (c) the fork's `createModalController` (`:42`) is subsumed by `Overlay`'s state surface —
  delete it or keep it as the fork's own thin adapter, but not both; (d) **add** the two missing behaviors as
  fork-side adoptions once the primitive lands (focus trap + `inert` are the fork's two recorded a11y gaps);
  (e) move the closed-state/Escape/scrim XOR rows **upstream**, keeping the fork's module-wiring rows
  (`tests/unit-u-shell-7-settings-modal.test.ts` ⟨**REPOINTED 2026-09-28 BY THE SUPERVISOR'S LANDING PASS — annotate-beside (`RCA-8(c)`), the as-filed path is KEPT: that suite's CURRENT address is `archive/tests/2026-09-28-unit-u-shell-7-settings-modal.test.ts`. The `PD-UI-6` landing (`W1`) ARCHIVED it whole — a MOVE, `md5` identical, `R100`, nothing deleted (`docs/specs/unit-pd-ui-6-modal-state.md` `§6.3`) — so the old `tests/**` path no longer exists. THIS REQUEST'S OWN SUBSTANCE IS UNAFFECTED: the fork's module-wiring rows the item keeps are now the unit's re-derived files (`tests/pd-ui-6-modal-state-adoption.test.ts` + `tests/pd-ui-6-modal-state-register.test.ts`), and the closed-state/Escape/scrim XOR rows were re-derived against the foundation four-state matrix as this item asked.⟩**) and the parked live battery
  (`docs/pending.md:66`) as the fork's own.
- **Priority:** **P1**.
- **Fallback if upstream declines.** SC-3's: implement trap + `inert` + top-layer in `modal-state.ts` and
  document the invisibility contract host-side. **Cost:** the a11y contract stays a per-fork invention and the
  `inert`-is-expressible fact stays undocumented upstream.

### 3.13 `SCH-13` · `FOCUS-SEAM` — the find-or-open tab seam shared by the strip and the MCP tool · `SC-6` (P2)

- **Requested foundation mechanism.** SC-6's `FocusTarget`/`FocusEntry`/`FocusModel`/
  `createFocusModel`, **plus three fail-state decisions the contract must state explicitly because the fork's
  behavior is a pin, not a preference**: (a) **a second targetless open is refused** — the fork **throws**
  (`src/renderer/tab-state.ts:283`, only the first tab may open targetless), so the contract must say *throw* or
  *typed error*, and the acceptance row must assert the exact shape (never a silent landing tab);
  (b) **close-of-active resolution order** is left → right → `null` (`:298`); (c) **an unknown id is a no-op**
  with zero `onChange` and state identity (`:269`'s callers + the fork's `focus()` HOST-8 arm,
  `src/renderer/tab-strip.ts:124-148`, which additionally refuses a ghost `tabId` while tabs exist).
- **Acceptance criteria (foundation suite; deep equality + call counts, no layout).**
  1. **Equivalence state:** driving the model through the MCP path and through the strip path with the same
     target yields **deep-equal** `state()` **and** the same `persist()` call count. **Fail-state:** any
     divergence (the two-surfaces-two-models failure).
  2. **State:** two opens of the same target ⇒ one entry, one active id; `{ newTab: true }` ⇒ two entries.
     **Fail-state:** a duplicate without the flag, or a reused entry with it.
  3. **State:** `activate(unknown)` ⇒ state identity and zero `onChange`. **Fail-state:** any write.
  4. **State:** close-active selects left, else right, else `activeId === null` — three separate cases.
     **Fail-state:** selecting the wrong neighbour or leaving a dangling id.
  5. **Fail-state:** a second targetless open is refused with the documented shape (assert throw-vs-typed-error
     exactly); **never** a silent landing tab.
  6. **State:** `reorder(id, toIndex)` preserves entry ids and changes **only** `order`. **Fail-state:** an
     entry re-minted (the fork's id re-mint hazard is real: `nextTabId` keys off `state.open.length + 1`).
- **MCP-visibility consequence.** This item **is** the MCP consequence: `provident.focus` must not be a parallel
  implementation of the strip — it must dispatch into the same model, so an agent's focus call and a human's
  click are indistinguishable in the resulting state. The fork's deliberate asymmetry is kept: focus is UI-only,
  mutates no graph/RAG, and emits no `resource-updated`/`app-graph-changed` notification, so an agent cannot use
  focus to force a re-render (the `MCP-FOCUS-TOOL` row, `docs/decisions.md:237`).
- **Astrographer-side adoption steps.** (a) Re-point the strip's model onto `createFocusModel` and keep
  `tab-state.ts`'s pure transitions **only** as the fork's migration/coercion layer (`coerceTabState` at `:150`
  is the fork's fail-soft loader, which the contract explicitly leaves to the consumer, clause 4); (b) re-point
  `src/renderer/tab-strip.ts:124-148` (`focus()`) and the renderer RPC case (`src/renderer/renderer.ts:93-96`)
  at the model, keeping the **registration and guard** (`src/main/mcp-server.ts:1791` `ALL_TOOLS`, `:2247`
  guard, `:2248` registration, `:2268` `backend.invoke('focus', …)`) as the fork's MCP wiring — the item
  changes **no** tool registration; (c) keep the fork's `OperatorSettings.tabs` carrier for persistence
  (`UI-CONFIG-CARRIER`, `docs/decisions.md:228`) and the close-seam publication
  (`src/renderer/tab-strip.ts:59-77` + the drain at `src/renderer/sidebar-panes.ts:115`); (d) move the pure
  transition + equivalence rows **upstream** (`tests/unit-u-shell-9a-main-focus-tabs.test.ts` shrinks to the
  fork's wiring + carrier + the landed active-tab ownership rows); (e) **MUST NOT MOVE:** the landed
  stage/active-tab ownership (`SidebarPanes.getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/
  `mountTab`, `docs/specs/unit-stage-active-tab-display.md` §5.2 at `:355-360`) — the item changes no stage
  seam and must not be bundled with any.
- **Priority:** **P2**.
- **Fallback if upstream declines.** SC-6's: keep `tab-state.ts` + the strip + the RPC case as the pinned seam,
  with the equivalence asserted by a fork test. **Cost:** parity stays a fork-local property, and the foundation
  keeps shipping the parity *rule* without a way to satisfy it mechanically.

### 3.14 The `NEW — NOT GATED` items: what "needs its own filing decision" means

Six items (`SCH-6`, `SCH-7`, `SCH-8`, `SCH-9`, `SCH-10`, `SCH-11`) ask for a mechanism **outside** the gated
set. For each, the trace was run against the three permitted sources — the gated `SC-1..SC-7` text (incl. every
clause 5/clause 6/clause 7 "NOT requested" list), §4.1's *existing-shell* list, and the §5.2 DO-NOT-FILE list —
and **none** of the three covers it:

| Item | Nearest gated language | Why that language does not cover it |
| --- | --- | --- |
| `SCH-6` | `SC-2` (the delegate) + §4.1 (gutters are already shell chrome) | `SC-5` clause 7 excludes min/max sizes; neither asks for the resize model |
| `SCH-7` | `SC-2` clause 6: *"NOT requested: … the pane layout model, or the drag image / `dataTransfer` content"* | the exclusion is explicit, so the relocate model is deliberately outside `SC-2` |
| `SCH-8` | `SC-5` invariants 1 + 2 (who owns geometry) | the invariants constrain the consumer's CSS/JS; no projection mechanism is requested |
| `SCH-9` | `SC-1` clause 5: *"NOT requested: any specific region set"* | a slot/status carrier is a region **content** model, which clause 5 excludes by construction |
| `SCH-10` | `SC-5` invariant 3 (containment clause) + clause 7 (controls excluded) | the clause is a consumer-side statement; no delivery form or container-chrome model is requested |
| `SCH-11` | `SC-6` clause 5: *"NOT requested: the tab strip's markup, … the strip's overflow behaviour"* | explicit exclusion |

**Discipline this document applies to them (and asks the target to apply):** each is written as a **separate,
declinable unit** with its own acceptance criteria, its own priority and its own fallback — **never** folded
into an `SC-n` item's scope, and never described as "part of" the gated set. **A silent filing would be a
process violation** (the fork's rule: `docs/HANDOFF.md` + the gate record's §5.2; a new contract change needs its
own filing decision). **Six declines cost the fork six fallbacks and nothing else** — the SC-covered seven still
land as requested.

---

## §4 Landing order + dependencies (foundation side)

The fork-side order (the shell units `O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2`, each with its own red set) is
**unchanged** by this document (`astrographer-scope-realignment-review.md` §7.1). What follows is the order the
**foundation** should land the items in, and what each one unblocks.

| Wave | Items | Why this position |
| --- | --- | --- |
| **W0 — independent** | `SCH-13` (focus seam), `SCH-5` (menu catalog) | Both are **pure data/model contracts** with no DOM host and no dependency on the region substrate. They can land first, in either order, and a decline costs nothing else. |
| **W1 — substrate** | `SCH-1` (region host + mount invariant) | The substrate for every region-hosted surface. Nothing in W2 needs it *by contract*, but every adoption step in §3 assumes a declared region. |
| **W2 — region-hosted chrome** | `SCH-3` (theme tokens), `SCH-12` (overlay) | Both host something in a region (`modalHost` for `SCH-12`); `SCH-3` needs only a root, so it may land beside `SCH-1`. Independent of each other. |
| **W3 — geometry** | `SCH-4` (zone tracks) → `SCH-8` (projection) → `SCH-10` (container chrome) | `SCH-8`'s track computation consumes `SCH-4`'s census rule; `SCH-10`'s containment clause is asserted against `SCH-4`'s "not the track owner" invariant. The fork's **O-10** slot-order unit consumes `SCH-4`'s `orderOf`. |
| **W4 — gestures** | `SCH-2` (delegate) → `SCH-6` (resize), `SCH-7` (relocate) | Both controllers are built **on** the delegate (`SCH-6`/`SCH-7` each restate one delegate invariant); landing either before `SCH-2` would fork the pointer lifecycle again — the exact failure `SC-2` exists to close. |
| **W5 — strip host** | `SCH-11` (tab strip host) → `SCH-9` (status carrier) | `SCH-9`'s slots are declared over an `SCH-1` region and its first consumer is the strip's row; the strip's **selection** already routes through `SCH-13`, so the host is presentation-only. |

**Dependency edges that matter (and the ones that do not):**

- `SCH-2` **does not** depend on `SCH-1`; `SCH-6`/`SCH-7` **do** depend on `SCH-2`.
- `SCH-8` **does** depend on `SCH-4`'s census rule (a track computation without an agreed emptiness rule
  reproduces `EMPTY-ZONE-TRACK-NOT-COLLAPSED`); `SCH-10` depends on both.
- `SCH-12` **does not** depend on `SCH-4`/`SCH-8` (an overlay is out of flow, `SC-1`'s `flow: 'out-of-flow'`).
- `SCH-13` and `SCH-5` depend on **nothing** — deliberately, so the two lowest-risk items can land while the
  rest are being decided.
- **No item depends on `SCH-9`/`SCH-11`** — the two presentation items are tail-positioned on purpose.

**Revert unit per item (one diff each, per the fork's own convention):**

| Item | Revert unit |
| --- | --- |
| `SCH-1` | the region module + its export; a consumer that stopped declaring regions returns to hand-authored markup |
| `SCH-2` | the delegate module; each controller that used it reverts to its own listeners (`SCH-6`/`SCH-7` are the two) |
| `SCH-3` | the theme module + its `data-theme` attribute contract; the consumer's token block is untouched by the revert |
| `SCH-4` | the track-contract module; the consumer's declarations and `:has()` rules stay valid CSS alone |
| `SCH-5` | the builder module; the consumer's own template returns |
| `SCH-6` | the resize controller module (falls back to `SCH-2` + the consumer's own commits) |
| `SCH-7` | the relocate controller module (falls back to `SCH-2` + the consumer's reveal logic) |
| `SCH-8` | the projection/applier module; the consumer's own projection returns |
| `SCH-9` | the slot/status API on the region spec (the region itself survives) |
| `SCH-10` | the chrome/containment helper; the consumer's CSS returns (containment was consumer CSS under `SC-5` anyway) |
| `SCH-11` | the strip host module; the consumer's own strip returns |
| `SCH-12` | the overlay module; the consumer's own frame state machine returns (the `MODAL-*` decisions never moved) |
| `SCH-13` | the focus model module; the consumer's own `focusTarget`/`openTab`/`closeTab` return |

---

## §5 Non-goals (the DO-NOT-FILE list as constraints) + the MUST-NOT-MOVE list

**§5.1 — the §5.2 DO-NOT-FILE list, restated as constraints on this work package** (each excluded, with why;
**no `SCH-n` asks for any of them**, and a later pass may not re-file them without citing the pinning decision or
superseding it explicitly):

| Excluded ask | Why it is excluded (the constraint this package honours) |
| --- | --- |
| a modal-toggle-**provident** request | already pinned SHELL (`ui-overhaul.md:65` + Q2): the frame is shell, the body is the operator's isolated scope — nothing to request. `SCH-12` asks only for the primitive. |
| the doc-nav tree (C15) | an app data gap (`DOC-NAV-NOT-A-TREE`), not a mechanism. **Named MUST-NOT-MOVE** (§5.2). |
| the editor toolbar (C8/C16) | provident-authored pane content; no foundation mechanism missing. **Named MUST-NOT-MOVE.** |
| hover-preview (C19) | app-graph content + a fork-owned timing mechanic; already parked as spec-level. |
| shared-subtree decoration (C20) | app-specific cross-document semantics, provident-authored. **Named MUST-NOT-MOVE.** |
| the RAG/pane **registry** | Astrographer's domain vocabulary; the foundation ships generic registrations. `SCH-4`/`SCH-8` take a **census**, never the registry. |
| `rag.*` / `edit.*` / `module.*` tools | app/engine surfaces; filing them would put RAG policy in the shell. |
| `enabledPanes` | operator-only UI-config in the fork's serialized carrier; deliberately not an MCP capability. `SCH-5`'s catalog is one consumer of the contract, not part of it. |
| the **zone names** (`left`/`right`/`header`/`footer`/`stage`/`top-bar`) | Astrographer's layout vocabulary; `SCH-4`/`SCH-10` take zone keys as opaque consumer values. |
| the **Import semantics** (512 cap, atomicity, `corpusRoot`, `.md` expansion) | app policy (`SC-7` clause 5); the capability is already MCP-exposed. `SCH-5` explicitly keeps them fork-side. |
| any `provident-ssr` **package patch** for the focus trap | a DOM/a11y API, not a package gap; PS-1 owns the documentation half. `SCH-12` requests the primitive. |
| the fork's units **O-1 / O-2 / O-9 / O-10** | fork-side implementation units; filing one as an upstream request is mis-targeted. They **consume** this package. |
| anything already covered by **GR-1..GR-9** | the sibling engine set owns those gaps; this document cites them and duplicates none. |
| *implied and honoured:* the **stage's document ownership** and the **pane catalog** | host data, not the foundation's (groups C/E of §2). `SCH-9`/`SCH-13` pass them as injected callbacks and models. |

**§5.2 — the MUST-NOT-MOVE list (every control node, verified `file:line`, that stays provident-authored and
dispatchable).** This list is **binding on every `SCH-n` adoption step**: no item may delete, relocate, re-style
into shell chrome, or de-register any of these; an adoption step that would is a process violation.

| C-row | Control | `file:line` (verified 2026-09-22) |
| --- | --- | --- |
| **C5** | pane collapse toggle `pane-collapse-<id>` + handler `togglePaneCollapse` | `src/renderer/pane-graph.ts:52` (handler name), `:220-233` (the button); host seam `src/renderer/sidebar-panes.ts:3176-3177` → `:3297` |
| **C8** | markdown/HTML toggle `editor-toolbar-toggle` + the toolbar host | `src/renderer/pane-graph.ts:1451` (id const), `:1573-1579` (the button), `:1547` (`editorToolbarContent`), `:1450` (`EDITOR_TOOLBAR_ID`) |
| **C12** | zone minimize `zone-minimize-<zone>` + the zone tab list `zone-tab-<zone>-<id>` | `src/renderer/pane-graph.ts:76` (handler), `:93` (tab-expand handler), `:163-185` (`zoneContainerChildren`; the toggle `:169-175`, the tabs `:177-183`) |
| **C15** | the doc-nav tree rows (select handlers; the disclosure toggle) | `src/renderer/pane-graph.ts:606` (`DOC_NAV_TOGGLE_HANDLER`), `:611` (`DOC_NAV_SELECT_HANDLER`), `:749` (`docNavContent` — the `li` rows with their handler at `:771`, the tree branch at `:776`) |
| **C16** | undo/redo buttons + the history pane entries | `src/renderer/pane-graph.ts:1458-1461` (ids + handlers), `:1591` (`historyPaneContent`), `:1466-1467` (history entry handler/id prefix) |
| **C18** | advanced-search toggle/submit/expand + the search-tab controls | `src/renderer/pane-graph.ts:871-893` (handler + id consts), `:1122` (`searchContent`) |
| **C19** | the hover-preview popup + its handlers | `src/renderer/hover-preview.ts:26-59`, `:203` |
| **C20** | shared-subtree decoration (owners box) | `src/renderer/cross-document-shared.ts:66-80`, `:344` |
| **C9/C10 landed** | the page-edit surface + its handlers | `src/renderer/pane-graph.ts:1337-1343` (ids/handlers), `:1421` (`pageEditSurfaceRoot`) |
| **C10 landed** | the commit warning (authored where the content is) | `src/renderer/pane-graph.ts:1500` (id), `:1505` (`pageCommitWarningContent`) |
| **tab ownership** | the landed stage/active-tab seam | `docs/specs/unit-stage-active-tab-display.md` §5.2 (`:355-360`): `SidebarPanes.getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/`mountTab` |

**Attribution note (exact, so no later pass over-reads this list).** §4.1's ruling marks **C5 / C12 / C15 / C18 /
C19 / C20** with the literal **"MUST stay visible/dispatchable"** verdict; the table above additionally binds
**C8** and **C16**, whose §4.1 verdict is **"Visible"** (not the MUST-NOT-MOVE phrase) — and the fork's
`AGENTS.md:23-34` UI constraint plus §4.1's *"the CONTROL NODES are provident-authored precisely so
`provident.dispatch` can reach them"* make "never move to shell" the same constraint for them in substance.
**No `SCH-n` item proposes any of the eight for a move either way**; the two extra rows are listed here so the
binding is stated rather than inferred.

---

## §6 Verification discipline

**§6.1 — every Astrographer-side `file:line` was re-read on 2026-09-22 (no shell, read-only), with ONE residual
exception listed in the table's own last row and §6.3 item 1.** No line is cited from memory or from the SC doc.
**Corrections applied where the SC doc's line had drifted** (reported, as the SC doc itself required for its own
corrections):

| SC doc cite | Reading today | Disposition |
| --- | --- | --- |
| `pane-graph.ts:224-229` (C5 collapse control) | `:220-233` (the button object), `:52` for the handler name | corrected above |
| `pane-graph.ts:50` (`PANE_COLLAPSE_HANDLER`) | `:52` | corrected above |
| `pane-graph.ts:1357` (C8 toggle) | `:1573-1579` (the button); `:1357` is inside the page-edit-surface body block | corrected above |
| `pane-graph.ts:1329` (toolbar fn) / `:1337` (host) / `:1271` (id const) | `:1547` (`editorToolbarContent`) / the toolbar HOST is inside that same function's returned root (`:1540-1570`; `:1337`/`:1421` are the page-edit **surface** root's id const + root fn, NOT the toolbar host) / `:1451` (`EDITOR_TOOLBAR_TOGGLE_ID`); the toggle BUTTON is `:1573-1579`, the id const `EDITOR_TOOLBAR_ID` (`editor-toolbar`) is `:1450` | corrected above |
| `pane-graph.ts:161-183` (C12) | `:161-183` (unchanged — `zoneContainerChildren`) | holds |
| `sidebar-panes.ts:2938` (collapse host seam) | the seam is `:3176-3177` → `:3297` | corrected above |
| `sidebar-panes.ts:1178-1200` (`applyZoneTracks`) | `:1541-1563` | corrected above (the SC doc's own note already flagged drift; this is the fresh reading) |
| `layout-state.ts:214-224` / `:275-288` / `:300-314` | identical | holds (the SC doc's corrected set) |
| `index.html:278-301`, `:104-131`, `:147-150`, `:15-73`, `:283-290`, `:297-301` | identical | hold |
| `tab-strip.ts:58` (`class TabStrip`) | `:78` | corrected above |
| `tab-state.ts:269` (`focusTarget`) / `:255` / `:283` / `:298` | `:269`/`:283`/`:298` hold; `makeEntry` is `:141`-adjacent (the module's consts moved) | `focusTarget`/`openTab`/`closeTab` hold |
| `modal-state.ts:42` / `:116` | identical | hold |
| `renderer.ts:752-796` (`installShellPointers`) / `:304` / `:326` / `:634` | `:752`, `:304`, `:326` hold; the `closest` resolution is `:634` | hold |
| `theme.ts:30` / `:12` | identical | hold |
| `app-menu.ts:93-135` / `:47` / `:67` / `:34` / `:39` / `:81-88` | identical | hold |
| `renderer.ts:126-180` (`installTheme`) / `:187-195` (`installLayout`) / `:1035` (modal install) / `:841-866` (strip construction) | identical | hold |
| `mcp-server.ts:1791` / `:2247` / `:2248` / `:2268` | identical | hold |
| `index.html:210-223`, `:228-259`, `:160-165`, `:139-150`, `:95-98`, `:82-94`, `:133-137` | identical | hold |
| `runtime.ts:1047-1068` (the mount sweep / `tearDownGraph`) | `:1143-1164` — `tearDownGraph` is declared at **`:1143`** and the `mount.querySelectorAll('#wiki-root')` sweep runs `:1153-1161` (the file is **1636** lines today) | corrected above — **this document's own first draft carried the SC doc's stale pair in the A3 row and in `SCH-1`'s adoption step (c)**; the proofread pass re-read it in the tree and fixed both |
| `tab-strip.ts:1-5` / `sidebar-panes.ts:200-206` (the strip doc + the pane-catalog IPC) | identical (the SC doc does not cite them; this document's own citations) | hold |
| `index.html:275-277` / `:278` (the top-bar comment + the strip/nameplate row) | identical | hold |
| `dom-shim.ts:4-103` as the API extent | the file is **112** lines: the API block is `:4-103` and **the surface continues** — `:211`/`:216` capture, `:222`/`:228` query, `:240` `closest`, `:253` `dispatchPointer` | corrected above (`SCH-2`'s shim note + §6.2) |
| `import-directory.ts:14` / `:16-19` / `:34-37` | cited from the SC doc as a fork-side exclusion I did not need to re-derive; **the file was not read in this pass** | **`UNVERIFIED`** (see §6.3) |
| `sidebar-panes.ts:3664` (the FB-1 census in `docs/pending.md:63`) | the file reads **4059** lines today (a different tracker's figure) | recorded, not relied on |

**§6.2 — target-side claims: verified vs NOT verified.** Every "already ships" / "does not ship" claim in this
document was read in `../Provident-Electron` on **2026-09-22**:

| Target-side claim | Verdict | Evidence read |
| --- | --- | --- |
| Ships the MCP/Electron endpoint: one `BrowserWindow` + preload + MCP server, no menu | **VERIFIED** | `src/main/main.ts:136-155` (window + `loadFile`); `:111-119` (stdio exit); **no import of `Menu`/`setApplicationMenu`** — a grep over `src/**` for `Menu`/`setApplicationMenu` returns zero matches |
| Ships no dialog usage | **VERIFIED** | grep over `src/**` for `showOpenDialog`/`dialog`: zero matches |
| Ships the Runtime + one mount, and mounts by id | **VERIFIED** | `src/renderer/renderer.ts:95-134` (`#app`), `:120-125` (`#panes`) |
| Ships no region declaration, no gutters, no zones, no grid beyond a 2-column layout + `#panes` | **VERIFIED** | `src/renderer/index.html:33-43` (the whole body), `:12` (`.layout`), `:20` (`#panes`); the grid declarations are `:12`/`:20` only |
| Ships no theme module and no root token layer | **VERIFIED** | `src/renderer/index.html:8-9` (`:root { color-scheme: light dark; }` + hard-coded `body` background); zero matches for `matchMedia`/`prefers-color-scheme`/`data-theme`/`theme` under `src/**` |
| Ships no gesture controller, pointer capture, overlay, focus trap or `inert` | **VERIFIED** | zero matches for `pointerdown`/`setPointerCapture`/`lostpointercapture`/`dblclick`/`inert`/`focus(`/`tabindex` under `src/**` |
| Ships no single-in-flow-mount **guarantee** across envelopes (it re-renders into the same mount and empties it via diff removal) | **VERIFIED** | `src/renderer/runtime.ts:735-753` (`tearDownGraph`: destroy in-tree nodes → `render()` → diff removal; **no orphan sweep**); the shim/`Runtime` tests assert the mount's content per state — `tests/runtime-host.test.ts:150-160` (teardown ⇒ `inHTML === ''`), `tests/blind-runtime-host.test.ts:288-296` (teardown ⇒ root-only) — i.e. **no** cross-envelope mount-cardinality claim exists |
| Ships a dom-shim test surface that is deliberately layout-less/CSS-less | **VERIFIED** | **the TARGET's** `src/shared/dom-shim.ts` (`../Provident-Electron/src/shared/dom-shim.ts`) — `:1-3` (the comment), `:4-112` (the file is 112 lines; the API: `setAttribute`/`getAttribute`/`addEventListener`/`removeEventListener`/`remove`/`innerHTML`/`outerHTML`). *(The fork's same-named file is a different, larger file — see the corrected row below.)* |
| The target's shim **lacks** `matchMedia`, `activeElement`, `getComputedStyle`, `style.setProperty` | **VERIFIED (as absences)** | `../Provident-Electron/src/shared/dom-shim.ts:4-112`; the only `document` surface is `createElement`/`getElementById`/`head` (`:93-103`); `style` carries `cssText` only (`:9`) |
| **CORRECTED (this pass): the FORK's shim DOES ship `closest`, `querySelector`, `querySelectorAll`, `setPointerCapture` and `releasePointerCapture`** — the draft attributed their absence to the fork's path, which was **WRONG** | **WRONG as drafted → corrected** | **this repo's** `src/shared/dom-shim.ts` (508 lines): `:222` (`querySelector`), `:228` (`querySelectorAll`), `:240` (`closest`), `:211`/`:216` (capture, recorded at `:101-104`), the CSS subset at `:285`/`:278-305`, `dispatchPointer` at `:253`; the header `:5-71` records them as the U-SHELL-N7 additions. **The absence claim survives for the TARGET's shim only** (the row above) |
| The target's process conventions require TDD red→green→adversarial→greens→doc-review, the trio (`npm test`/`typecheck`/`build`), and a defect handoff that never patches the package | **VERIFIED** | `AGENTS.md:63-205` (items 3/4/6/7/8/9/10), `docs/FORKER.md:147-155` (the brief), `docs/FORKER.md:9-22` (what ships / what does not) |
| The target's own test runner is `vitest` (`npm test` = `vitest run`) and its third leg is `npm run build` (esbuild; five bundles) | **VERIFIED** | `package.json:8-20` (`test`, `typecheck`, `build`, `battery`, `divergence`, `mcp`) |
| The target's `provident-ssr` dependency is `^0.2.1` | **VERIFIED** | `package.json:21-24` |
| The target's work queue is empty | **VERIFIED** | `docs/next-steps.md:11-13` |
| The target's `docs/decisions.md` has **no** `BOOLEAN`/`inert` row and no shell-chrome row | **VERIFIED (as absences)** | `docs/decisions.md` (102 lines, read whole); the only `inert` match in `docs/**` is the unrelated Phase-B import |
| The target's own docs' `module.*` system, gate records and greens conventions are as its trackers state | **NOT VERIFIED in detail** — read only as far as needed to establish the item template; no claim in this document depends on their content | — |
| The target's `docs/HANDOFF.md` contents / any upstream request it has itself filed for these surfaces | **NOT VERIFIED** — this pass read `AGENTS.md`, `FORKER.md`, `decisions.md`, `pending.md`, `next-steps.md`, `defects.md` (grep-level), `src/**` and `package.json`; **`docs/HANDOFF.md` was not opened** | — |
| Any runtime/assembled behavior of the target (a live window, layout, focus, paint) | **NOT VERIFIED** — this role has no shell and runs no app; **every** acceptance criterion above is therefore written at the node/shim layer, and the criteria that cannot be are labelled as needing a fixture the item itself must supply | — |

**§6.3 — `file:line` claims I could NOT verify (listed explicitly, so no reader treats them as read):**

1. **`src/main/import-directory.ts:14`, `:16-19`, `:34-37`** (`MAX_IMPORT_FILES = 512` and the outcome codes)
   — **cited from `SC-7`/the gate record, not re-read in this pass**. §5.1's Import-semantics exclusion depends
   on that file being app policy (which the gate record already rules); the specific line numbers are the SC
   doc's.
2. **`node_modules/provident-ssr/dist/core/adapters.js:25-53` (`'inert'` at `:37`; 27 members) and
   `:300-313`/`:520-528`** — the `inert`-expressibility fact is **cited from the gate record's verified C6
   note** and is **not re-read** in this pass. The fork's installed copy was not opened today.
3. **The target's `docs/HANDOFF.md` and its `docs/specs/**` bodies** — **not read** (see §6.2's last two rows).
   No item asks the foundation to match a mechanism that document may already record; if it does, the item is a
   duplicate and should be closed by the target's own pass, not by this one.
4. **`docs/pending.md:63`'s `sidebar-panes.ts` (3664)/`pane-graph.ts` (1750)/`renderer.ts` (1052) line counts**
   — a different tracker's reading; today's tree reads 4059 / 1960 / 1053. **Not relied on**; recorded only as a
   drift observation (this pass writes no tracker row).
5. **Every target-side test file's contents** — only `tests/runtime-host.test.ts` / `tests/blind-runtime-host.test.ts`
   were read (mount/teardown rows) and `tests/**` was otherwise grepped, not read. So the claim *"the mechanism
   half is assertable in the foundation's suite"* is a **judgement from the shim's API surface**, not from a
   proof that an existing suite exercises an equivalent row.

**§6.4 — layer declaration (the fork's RCA-12 discipline, applied to this document).** This document is
**DOC-LAYER only**: it proves nothing at runtime, and no green in either repo can prove that a mechanism was
adopted. Every acceptance criterion above is written to be checkable **at the foundation's node/shim layer**;
where a criterion needs an assembled app (the fork's live-drive surface), it is either (a) not written here —
the fork's own live battery carries it (RCA-11/RCA-12) — or (b) explicitly labelled as needing a fixture the
item must supply. **No `SCH-n` claims an app-green.**

---

## §7 References

**The gated material (cross-referenced, never duplicated)**

- `docs/feature-requests/provident-electron-shell-chrome-requests.md` — the `SC-1..SC-7` set (`SC-1` `:85`,
  `SC-2` `:196`, `SC-3` `:322`, `SC-4` `:467`, `SC-5` `:581`, `SC-6` `:701`, `SC-7` `:808`; the DO-NOT-FILE table
  `:930-946`; "how to consume this document" `:950-966`) — **the authority for every field's meaning**;
- `docs/feature-requests/provident-ssr-expressibility-requests.md` — PS-1 (the sibling package/doc request; the
  `inert` documentation half);
- `docs/feature-requests/gnosis-engine-feature-requests.md` — GR-1..GR-9 (cited for the DO-NOT-FILE constraint).

**The gate record**

- `docs/specs/astrographer-scope-realignment-review.md` — §2.2 C5 (the filing convention), §3.1/§3.3 (the
  boundary + per-row ownership), **§4** the C1..C20 decomposition (`:251-272`) and **§4.1** the ruling
  (`:274-282`), **§5.1** the request set (`:288-317`) and **§5.2** the DO-NOT-FILE list (`:319-333`), §6 the gate
  shape (`:337-364`), §7 the landing order + revert units (`:368-398`), §8 item 13 (the index row that closed
  the gate), §10 the verdict.

**The trackers (read, cited, not edited)**

- `docs/pending.md:25-47` — the seven SC/PS rows with their requested-interface one-liners, fallbacks and
  revisit conditions; `:46-47` the DO-NOT-FILE pointer;
- `docs/HANDOFF.md:98-118` — the `UPSTREAM INDEX UPDATE (2026-09-17)` row (the SC set + PS-1 + the "Do NOT
  patch" rule); `:120` the GRQ index-row precedent; the head (`:1-10`) the filing convention;
- `docs/decisions.md` — `PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` (`:30`), `LAYOUT-IN-CSS` (`:34`),
  `PANE-PROVIDENT-AUTHORING` (`:56`), `APP-GRAPH-PANES-MCP-VISIBLE` (`:57`), `OPERATOR-ISOLATED-GRAPHSCOPE`
  (`:58`), `MCP-UI-EQUIVALENCE` (`:65`), `UI-CONFIG-CARRIER` (`:228`), `UI-OVERHAUL-UMBRELLA-GATE` (`:231`),
  `MCP-FOCUS-TOOL` (`:237`), `MODAL-SETTINGS-REPARENT` (`:239`), `MODAL-DEDICATED-SCRIM` (`:240`),
  `ASTROGRAPHER-SCOPE-REALIGNMENT` (`:246`);
- `docs/FORK-DIVERGENCE.md` — the upstream-vs-fork delta (§0 of the SC doc is the one-paragraph form).

**The fork-side surfaces this package's adoption steps name**

- `docs/specs/ui-overhaul.md` — §2.1 (`:77-166`) Tables A/B/C + the hybrid rule (`:156-158`) + the isolation
  boundary (`:160-166`); the per-concern mechanics splits at `:323`, `:352`, `:375`; §7.3 Reading 2 (`:1280`);
- `docs/specs/unit-stage-active-tab-display.md` — §5.2 (`:355-360`) the landed active-tab ownership (the
  MUST-NOT-MOVE seam), §5.5 (`:762-781`) the `FS-1..FS-9` fail-states, §5.6 (`:792-813`) the census;
- `docs/specs/ui-overhaul.md` §2.1's Table B `:129-137` — the pane frame / relocate / empty-zone / minimize /
  View-menu / tab-bar / modal / content-mount / persistence rows this document's inventory maps to.

**The parked records (cited only where an adoption step depends on the park)**

- `docs/pending.md:66` — the `U-SHELL-7` settings-modal live battery (parked on the live shell-DOM surface) —
  cited by `SCH-12`'s adoption step as the fork row that stays fork-side;
- `docs/pending.md:65` — the `U-IMPORT-1` File → Import live battery (parked on the OS-owned dialog) — cited by
  `SCH-5`'s adoption step;
- `docs/pending.md:53` — `U-READS-PIVOT` (the P2 prerequisite unit) — **not** cited by any item: it consumes the
  engine's marker (GRQ-4), not a shell-chrome mechanism, and this document must not be read as unblocking it.

**Not cited by design:** the O-0 / live-battery records (`docs/specs/unit-o-0-per-stage-*.md`, the RCA-11/RCA-12
live-battery specs). **This document changes no code, runs no battery and makes no app-layer claim** (§6.4), so
those records are irrelevant to it; the fork's own units carry them.
