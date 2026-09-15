# Astrographer — Live-Fix Handover + RCA (why these bugs passed the green pipeline)

**Date:** 2026-09-14 · **Head:** `6ea9f9c` · **Tree:** CLEAN · **Trio:** 4625 pass / 58 skip, typecheck 0, build 0.

This hands off the **live-app user-testing batch** (the UI-overhaul features passed green unit/blind-green/doc-review gates but were broken in the assembled Electron app) AND the RCA of how that happened. A fresh supervisor should read §1 (state), §2 (open items), §3 (the live harness), then §4 (the RCA) and §5 (process fixes).

---

## 1. Current state — what is FIXED (committed)

The user drove the real app and reported live failures; a triage catalogue lives in `docs/defects.md` (LIVE-1..LIVE-12). Fixed + committed (trio green after each):

| # | Finding | Fix | Commit |
|---|---|---|---|
| LIVE-1 | Provident-Electron demo title | `index.html` header → Astrographer | `82f08cd` |
| LIVE-2 | tabs under the title | the tab strip is now the **window outer-chrome title bar** (`titleBarStyle:'hidden'` + `titleBarOverlay`, `-webkit-app-region:drag`, tabs no-drag) | `acb4c93`/`f08115c` |
| LIVE-10 | no visible pane titles | the collapse/title control shows `▸ ▾ <title>` | `82f08cd` |
| LIVE-3 | new-tab inert | no-wiki New Tab → the LANDING; with a store → deferred to create-document (U-D9) | `710b958` |
| LIVE-6 (+A) | panes in main canvas, not zones | `#app #wiki-root` is now a grid — `zone:left` is a LEFT SIDEBAR, `zone:main` the stage (live-verified `left.x<main.x`) | `699e55a` |
| LIVE-6/A | can't reposition the window (top edge) | `body` top padding removed so the drag region reaches `y=0` | `6b19a32` |
| — | clicking new-tab dragged the window | `tab-new`/`tab-close` are `-webkit-app-region:no-drag` | `4c8eabb` |
| LIVE-6/B | dead leftmost col-resize element | `.layout` is a single full-width stage frame (zones live inside `#app`); dead shell columns/gutters hidden | `67ffcdc` |
| LIVE-12/C | no visible pane-visibility settings | **in-pane ☑/☐ visibility control** in the operator Settings pane → new `sidebar.paneVisibilityToggle(id)` seam → host flip+persist | `6ea9f9c` |

**LIVE-12** (native View-menu closes on a toggle) is **ACCEPTED** (a native-Electron-Menu limitation; the in-pane control is the workaround, now landed as C).

## 2. Open items (the rest of the batch)

- **LIVE-4** — no landing at empty-store boot. **Confirmed live**: `landingContent` + the default-tab→landing resolution exist, but the boot stage-assembly overwrites the landing with the toolbar+panes envelope. Needs the stage-body-in-assembly change (the LAST of the LIVE-6-assembly root). Verified absent at a TRUE empty store (a024a36).
- **LIVE-6/D — panes still don't reposition.** The panes are now real `.pane-frame[data-pane-id]` frames in the left sidebar (LIVE-6), so the shell pointer-wiring (`installShellPointers`, U-SHELL-N7) should route C4 drags to the host reorder seams — but a **live drag** hasn't been verified to drive a reorder yet.
- **LIVE-5/7 — persistence pair.** `persistEnabledPanes`/`applyPersistedPaneVisibility` + the operator-settings write-through are pure/nodetested but the **live boot→persist→reload round-trip** isn't.
- **LIVE-8/9 — Undo / HTML toolbar inert (cluster with LIVE-4/LIVE-6 assembly).** The editor-toolbar controls render in the stage (probe-confirmed) but the Undo/HMTL action binding isn't live-working; likely the same stage/assembly reconciliation + the C16/C8 journal/operator seams under the live host.
- **LIVE-11 — collapse inert (rides on LIVE-6/D).**

All catalogued in `docs/defects.md`.

## 3. The live harness (the tool built to find these)

`scripts/live-drive.mjs` (committed): launches the app under a disposable `HOME` (DISPLAY `:1` default, `--display=0` override), connects **MCP** (SDK `StreamableHTTPClientTransport`) + **CDP** (WebSocket), enables the MCP tool groups via the renderer security bridge, seeds a deterministic `alpha`/`beta` corpus (`.live-corpus/`, gitignored, in the default corpus root) or `--no-seed`, runs named `--block=` probes (zones_geometry, landing, landing_debug, wiki_children, probe_app, shell_geometry, settings_modal, shell_wiring, tab_new_click, …), and exits promptly (kills the whole process tree — per the user). The launcher gained `--cdp-port` / `--no-gpu` / `--display`. This is the mechanism to close the §2 open items (they need a running app on a usable display, `:0` here).

## 4. RCA — why did ALL of these pass the green pipeline?

**Headline:** the verification pipeline validated the **provident-ENVELOPE authoring model** (pure data + source-pins + pure seams) and the **documentation**, but **never the ASSEMBLED, RENDERED Electron app**. Every slipped bug lives either in the **shell CSS/grid/window** (layout, drag regions, window chrome), the **runtime assembly/reconciliation** (stage body vs app-graph, zone placement), or the **live persistence/boot round-trip** — none of which the node suite (or the blind-greens / doc-reviews) exercised.

### 4.1 The mechanism, per layer

| Layer the bug lived in | What was tested | What was NOT | Result |
|---|---|---|---|
| **Shell CSS/grid/window** (LIVE-2, 6 zones-in-stem, 6/A window drag, 6/B dead columns, new-tab-drag) | source-pins (`index.html` contains the grid vars), the pure layout-state model | real CSS **geometry**, the Electron **window** (`titleBarStyle`, `-webkit-app-region`), how the runtime's zone containers map to `.layout` tracks | **structurally untestable in node** — the dom-shim is layout-less/CSS-less and tests don't render a window. The envelope had `zone:<name>` + `targetPlacement` (green), but the SHELL GRID never placed those zones into the tracks. |
| **Runtime assembly/reconciliation** (LIVE-4 landing, LIVE-8/9 toolbar-bound, LIVE-11 collapse re-render) | the pure `landingContent`/`editorToolbarContent`/collapse helpers + their source-pins | the boot path that **assembles the app-graph ENVELOPE and reconciles the active stage body INTO it** without overwriting it; the live handler→host-seam→DOM binding | helpers green; the **combination/assembly** broken live. The stage body (landing/document) is rendered separate from the pane-inclusive envelope and gets overwritten. |
| **Persistence / boot round-trip** (LIVE-5/7) | `persistEnabledPanes`/`applyPersistedPaneVisibility` as pure steps + their unit tests | the **write-through→store→boot-reload** end-to-end + the operator settings **load-laziness at boot** | pure steps green; the integrated round-trip broken/untested live. |

### 4.2 The systemic gaps (the reasons)

1. **The dom-shim is deliberately layout-less and CSS-less** — it records elements/attrs/`className` tokens, not computed geometry or a rendering engine. So "do the panes POSITION in the side zones vs the main canvas" and "does the top bar look/behave like a title bar" are structurally unassertable in the unit suite. The blind-greens inherited this (pure modules + source-pins only).
2. **The live-scenario batteries — the exact layer designed to catch these — were PARKED for the entire UI-overhaul.** Every `-live-pending-battery.md` was authored + never RUN (no running-app session). The one gate that would have seen "panes fill the canvas," "no landing," "buttons inert" was never executed.
3. **No rendered-DOM / assembly smoke gate.** Nothing in the pipeline asserted the BOOTED app's actual DOM (stage shows the landing when empty; panes in zone tracks; a toolbar control's click reaches its seam; the store round-trips). The "green" = the envelope/authoring is correct per the pure model + docs, not "the app works."
4. **Over-verification of the wrong layer.** Source-pins, greens-docs, doc-reviews, and even a comprehensive final review all re-verified the ENVELOPE/pure surface and the DOCS — an enormous amount of rigor pointed at the layer that wasn't broken, while the layer that was (assembly/shell/live) had zero verification.
5. **No integration tests for the stage↔app-graph + the shell grid**, and no **window-level** tests (Electron chrome / app-region).

### 4.3 Why "which tests" each slipped (concrete)

- **LIVE-6 (zones):** `unit-u-shell-1`/`-4` assert the envelope HAS `zone:<name>` containers and `targetPlacement` (structure). The `.layout`-grid-vs-"zones inside #app's wiki-root" mismatch is pure CSS + runtime mount, never covered.
- **LIVE-4 (landing):** `landingContent` + `resolveDefaultTarget`→landing are unit-tested as PURE outputs; the boot's assembly that overwrites the stage is untested.
- **LIVE-8/9 (Undo/HTML):** the toolbar helpers + their handler BODIES are source-pinned; the live binding (control click → `sidebar.undo`/`operatorSet` → journal/editing applied under the real runtime) isn't.
- **LIVE-2/6-A/B + new-tab-drag:** pure HTML/CSS + Electron window flags — no node test renders them.

## 5. Process fixes (RCA actions to keep this class from recurring)

1. **Make the live batteries a MANDATORY pre-DONE gate, not parked-by-default** — run the `-live-pending-battery.md` set against the app (via `scripts/live-drive.mjs` on a usable display) before a UI-overhaul unit is reported complete.
2. **Add a rendered-DOM / assembly smoke gate** — after each unit, assert the BOOTED app's key DOM (stage shows the landing when empty; the panes are in the zone-track sidebars; a toolbar control click reaches its seam; the store persists across a reload). This is what `live-drive.mjs` now enables.
3. **Add a shell-layout/window test** for geometry + Electron chrome (`titleBarStyle`, `-webkit-app-region` no-drag on interactive controls) so layout/window drift is caught in CI, not only in a live session.
4. **Add an assembly/reconciliation test** for the stage-body-vs-app-graph envelope (boot a host with an active tab; assert the stage body isn't overwritten by the pane-inclusive envelope) — addresses LIVE-4/8/9/11.
5. **Treat "unit green" as envelope-green, not app-green** — the handover must state what layer each verification covers, so a unit's green doesn't imply the live app is correct.
6. **A full-app smoke in the final review** — the earlier "comprehensive final review" re-verified docs/pure-surface; add a live boot+key-DOM check.

---

## 6. Handoff note

This batch is the LIVE-6/assembly work; the §2 open items (LIVE-4 landing, LIVE-6/D drag, LIVE-5/7 persistence, LIVE-8/9 editor, LIVE-11) are the remaining closure + the process fixes in §5. All committed; the live harness is the tool to finish them. Reference: `docs/defects.md` (the LIVE-1..12 catalogue), `docs/specs/live-user-test-suite-plan.md`, `docs/live-testing.md` §1.1, `scripts/live-drive.mjs`.
