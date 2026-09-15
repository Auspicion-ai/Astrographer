# RCA — Why the UI-overhaul pass returned GREEN despite live-app failures

**Status:** COMPLETE (2026-09-14) · **Scope:** the Astrographer UI-overhaul Wave-1/2/3
+ the live-app user-testing batch (defects LIVE-1..12, `docs/defects.md`; handover:
`docs/HANDOVER-LIVE-BATCH-RCA.md`). **Head:** `6ea9f9c` (RCA authored at `edb7d51`).
**Trio at each green:** 4625 pass / 58 skip, typecheck 0, build 0.

---

## 1. Incident summary

A user drove the real Electron application and observed **twelve live defects** —
landing absent at empty boot, panes populating the main canvas instead of the side
zones, inert Undo/HTML/new-tab/collapse controls, persistent settings not saving,
a mis-placed tab strip that also couldn't be used to reposition the window, a dead
col-resize element, no visible pane-visibility settings, and more. **Every one of
these features had passed the project's green gates** (the trio, per-unit blind
greens, per-unit doc reviews, and a comprehensive final review) — i.e. the
verification pipeline reported "all green" while the shipped application was broken
in exactly the dimensions the UI-overhaul was supposed to deliver.

The defect is **not a code bug in the landed units** — the pure models, source-pins
and unit suites are correct. The defect is in **what the pipeline verifies**.
This RCA establishes the root cause and the corrective actions.

---

## 2. What was verified green (and what that actually covered)

| Gate | What it exercised | Layer it verified |
|---|---|---|
| `npm test` (vitest, 202 files) | pure modules, controllers, host seams, dom-shim-rendered envelopes, source-pins | the **provident-ENVELOPE authoring model** (the data/placements/handlers the framework consumes) |
| Per-unit blind greens | pure helpers + the §2.8 source-pin, driven from docs only | the pure surface + the authored envelope |
| Per-unit doc reviews (RCA-6) | spec↔code↔build reconciliation | the **documentation + the envelope surface** |
| Comprehensive final review | docs/trackers vs the build, trio | the **documentation + the envelope/pure surface** |

**Nothing in that list rendered the real Electron app.** None of it applied real
CSS layout, ran a live boot, drove a real pointer over the DOM, or exercised the
window chrome. That is the first-order finding.

---

## 3. Root cause

The verification pipeline validated the **provident-envelope authoring model** —
the pure, declarative description of what should render — and the **documentation**
around it. It never validated the **assembled, rendered application**: how the
runtime actually mounts those envelopes into one `#app` DOM root, whether the shell
CSS/grid places the resulting zones where the user expects, whether the window
chrome behaves, or whether the state persists across a real boot/reload.

**Layer-by-layer root cause:**

- **Shell CSS / grid / window (LIVE-2 tabs, LIVE-6 zones-in-shell, LIVE-6/A window
  drag, LIVE-6/B dead columns, new-tab-drag).** The dom-shim is **deliberately
  layout-less and CSS-less** — it records elements, attributes and className tokens,
  but has no computed geometry and no rendering engine. "Do the panes POSITION in
  the left/right zone tracks or do they stack inside the stage cell?" and "does the
  top strip behave like a window title bar (drag region, no-drag controls)?" are
  **structurally unassertable in the unit suite**. The unit/blind-green tests
  asserted that the *envelope* contained `zone:<name>` producers with
  `targetPlacement` — which is true and irrelevant — while the *shell grid* never
  placed those zones into tracks, and the *window flags* were never applied or
  verified. Pure HTML/CSS + Electron `BrowserWindow` flags = untested.
- **Runtime assembly / reconciliation (LIVE-4 landing, LIVE-8/9 toolbar bindings,
  LIVE-11 collapse re-render).** The pure helpers (`landingContent`,
  `editorToolbarContent`, the collapse seam) are unit-tested as pure outputs and
  source-pinned. The **boot path that assembles the pane-inclusive app-graph
  envelope and reconciles the active stage body INTO it** (without the envelope
  overwriting the stage) is a runtime/renderer concern with **no integration test**.
  The landing body is applied then clobbered; the toolbar renders but its live
  action-binding to the C16/C8 seams isn't exercised. The green tests verified each
  piece in isolation, never the assembled boot.
- **Persistence / boot round-trip (LIVE-5/7).** `persistEnabledPanes` and
  `applyPersistedPaneVisibility` are unit-tested as pure steps. The
  **write-through → store → boot-reload** round-trip, and the operator-settings
  **load-laziness at boot**, were never exercised end-to-end (they need a real
  store + boot + reload).

**The five contributing factors (the "why did it slip"):**

1. **The dom-shim is structurally blind to layout/CSS/window.** This is by design
   (it exists to test the DomAdapter + the pure Runtime, not real rendering), but it
   means no unit test can catch placement/geometry/window-chrome bugs.
2. **The live-scenario batteries — the exact layer built to catch these — were
   PARKED for the entire UI-overhaul** and never run against a live app. Every
   `*-live-pending-battery.md` was authored + parked (no running-app session). The one
   gate whose whole purpose is exactly these (rendered DOM, assembly, window, live
   persistence) was never executed.
3. **No rendered-DOM / assembly smoke gate existed.** Nothing asserted the booted
   app's actual DOM: "stage shows the landing when empty," "panes sit in the zone
   tracks," "a toolbar control click reaches its seam," "the store round-trips."
4. **Over-verification of the wrong (unbroken) layer.** Source-pins, greens-docs,
   doc-reviews and even a full final review poured rigor into the envelope + docs —
   the layer that wasn't broken — while the broken layer had zero automated
   verification. This is a classic **measuring-the-wrong-surface** failure.
5. **No shell-layout / window or stage↔app-graph integration tests.** Both are
   cheap to add once a renderer/live driver exists; neither existed.

---

## 4. Concrete slip per defect class

- **LIVE-6 (zones):** `unit-u-shell-1`/`-4` assert the envelope has the zone
  producers + `targetPlacement` (structure). The `.layout`-grid
  vs "runtime renders every zone inside `#app`'s single `wiki-root`" mismatch is pure
  CSS + the runtime mount — never covered.
- **LIVE-4 (landing):** `landingContent` + `resolveDefaultTarget → landing` are
  green as pure outputs; the boot assembly that overwrites the stage is untested.
- **LIVE-8/9 (Undo/HTML):** the toolbar helpers + handler bodies are source-pinned;
  the live binding (button click → `sidebar.undo`/`operatorSet` → applied under the
  real runtime) isn't tested.
- **LIVE-2/6-A/B + new-tab-drag:** pure HTML/CSS + Electron window flags — no node
  test renders them.

Every slipped bug is in a layer the green pipeline never touched. The units were
not wrong; the verification was.

---

## 5. Corrective actions

| # | Action | Where it lands | Owner |
|---|---|---|---|
| CA-1 | Make the **live batteries a MANDATORY pre-DONE gate**, not parked-by-default, for UI-overhaul units | the `-live-pending-battery.md` files run against the app | supervisor/units |
| CA-2 | Add a **rendered-DOM / assembly smoke gate** after each unit: boot the app + assert the key DOM (empty-boot landing, panes in zone tracks, a toolbar click reaches its seam, persistence round-trip) | `scripts/live-drive.mjs` blocks + a CI/app session | this workstream |
| CA-3 | Add **shell-layout / window tests** (geometry + `titleBarStyle`, `-webkit-app-region` no-drag on interactive controls) so layout/window drift is caught in CI | a render/screenshot or geometry test | this workstream |
| CA-4 | Add an **assembly/reconciliation test** for the stage-body-vs-app-graph envelope (boot a host with an active tab; assert the stage body isn't overwritten by the pane-inclusive envelope) — addresses LIVE-4/8/9/11 | a runtime/assembly test | this workstream |
| CA-5 | **Treat "unit green" as envelope-green, not app-green.** A unit's green must never be reported as "the app works." The handover/trackers state the layer each verification covers. | docs/trackers, retro culture | all |
| CA-6 | Include a **full-app boot + key-DOM check in the final review** (not just docs/trio) | the final-review checklist | supervisor |

CA-2/CA-3/CA-4 are enabled by the now-working live harness (`scripts/live-drive.mjs`).

---

## 6. Evidence

- The 12 live defects + root causes: `docs/defects.md` (LIVE-1..12).
- The fixes + the live harness: the `82f08cd..6ea9f9c` commit run.
- The dom-shim limitation: `src/shared/dom-shim.ts` (records elements/attrs/`className`,
  no computed geometry).
- The parked batteries (never run): all `docs/specs/*-live-pending-battery.md`.
- This RCA supersedes nothing; it documents the class of failure so CA-1..CA-6 close it.
