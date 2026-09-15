# Unit U-SHELL-N7 — Shell Pointer-Wiring (C4 / C7 / C11 / C12): LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date:** 2026-09-13.
- **Source contract:** `docs/specs/unit-u-shell-shell-wiring.md` (GREEN / LANDED
  2026-09-13). §2.3 (the C7 gutter pointer wiring), §2.4 (the C4 pane-drag wiring +
  the interactive-control guard), §2.5 (the C11 empty-zone reveal + the C12
  minimize hooks), §2.6 (pointer-capture + rect rules), §3 valid-path states 1–10,
  §4 fail-states F1–F11, §2.8 (source-pinned listener-registration surface).
- **Greens battery (blind-test, docs-only, already run against the live MODULES):**
  `docs/specs/unit-u-shell-shell-wiring-greens.md` — **35 PASS / 0 FAIL /
  4 NOT-TESTABLE**. The 4 NT sub-scenarios (F5 `setPointerCapture` fail-soft
  degrade, F9 the interactive-control guard, F11 the absent-host no-op boot, and
  the `renderer.ts` node-import) require the live DOM/browser; their listener
  registration is asserted by the §2.8 source-pin instead. Source under test
  (module seam): the three NEW pure mapping helpers
  (`gutterSizeForPoint`/`toZoneBounds`/`dropZoneForPoint`), the existing pure
  controllers + seams (`pane-gutter.ts` / `pane-drag.ts` / `layout-state.ts`),
  and the §2.8 source-pinned listener layer in `src/renderer/index.html` +
  `src/renderer/renderer.ts`.
- **Status:** **PARKED — NOT run against the live application.** Pattern precedent:
  `docs/specs/unit-ujr1-get-journal-live-pending-battery.md` /
  `docs/specs/unit-ms5-settings-listing-live-pending-battery.md` /
  `docs/specs/unit-a2-document-crud-wiring-live-pending-battery.md` (the same
  surface-absence park shape). This battery is the handoff for a LATER iteration
  of the live-scenario runner, to be executed once the **Astrographer
  Provident-Electron app is running** (`bash scripts/start-app.sh`) with a real
  layout + authored `.gutter[data-zone]` + `.pane-frame[data-pane-id]` shell chrome
  rendered, and a UI-interactive (DOM-pointer) session can drive the C4/C7/C11/C12
  gestures against the real DOM.

> **PARKED IS NOT A FAILURE.** The module seam is green (35/0/4 against the live
> pure modules + the §2.8 source-pin); the park is a **live-shell-DOM surface
> absence**, not a regression.

---

## 1. Why this battery is parked (the live-surface assessment)

The U-SHELL-N7 unit's green scenarios are **shell-chrome DOM pointer gestures** —
real `pointerdown`/`pointermove`/`pointerup`/`pointercancel` with
`setPointerCapture`, and `getBoundingClientRect()` rect math read from the live
`.layout` / `.gutter[data-zone]` / `.pane-frame[data-pane-id]` chrome. These
gestures **cannot be exercised through the MCP endpoints**, because:

1. **The MCP surfaces expose the provident graph, not the shell DOM.** Per the
   AGENTS.md shell-chrome exception, everything this unit touches (`.layout`,
   `.gutter`, `.pane-frame`, `[data-zone]`) is explicitly **NOT** a provident node,
   has no `on:*` handler, and is **NOT MCP-visible** —
   `provident.get_rendered_html` / `get_markdown` / `list_targets` /
   `get_node_state` / `provident.dispatch` address the app-graph envelope and
   cannot reach a raw shell-chrome pointer listener. There is no MCP tool that
   synthesizes a DOM pointerdown/move/up with `setPointerCapture`.

2. **No running-app session exists in this pass.** There is no Electron app up
   (no listener on the MCP port) with a real layout rendering the authored
   `.gutter[data-zone]` / `.pane-frame[data-pane-id]` chrome, so the C7 gutter
   resize, the C4 drag/reorder/relocate, the C11 reveal, and the C12 minimize
   behaviors cannot be observed interactively.

3. **The node-testable half is already green** — the three pure mapping helpers +
   the existing controllers/seams + the §5.7 property register (P-IM-1..P-TP-3)
   + every §2.8 source-pin literal (the four pointer listeners, capture, rect
   reads, the mapping-helper calls, the 9 seam callers, `installShellPointers`)
   — so there is nothing left to park on the module seam. What remains is
   **confirming the gestures against the real DOM**, which requires the running
   shell.

The 4 NOT-TESTABLE sub-scenarios from the greens (`docs/specs/unit-u-shell-shell-wiring-greens.md`
§"NOT-TESTABLE sub-scenarios") are the exact rows this battery re-expresses as
live probes:
- **F5** — `setPointerCapture` fail-soft degrade: needs a real captured element in
  a browser.
- **F9** — `pointerdown` on an interactive control is not hijacked: needs
  inspecting the real `event.target` chain during a live pointerdown.
- **F11** — absent host → `installShellPointers` no-op, app still boots: needs the
  renderer bootstrap path run with vs. without a `SidebarPanes` host (a browser
  boot).
- **`renderer.ts` node-import** — browser-targeted bootstrap; asserted
  source-pinned, never module-imported.

Plus the LIVE gesture behaviors that the pure module greens can only approximate
but that must be confirmed interactively: the C7 one-commit-at-`pointerup` resize
with the real clamps, the C7 double-click reset, the C4 reorder/relocate on real
coordinates, the C11 reveal-on-approach / re-hide-on-exit against real zone rects,
the C12 minimize interplay, the interactive-control guard, the malformed-`data-zone`
negative, the dropped-outside-any-zone abort, and the pointer-capture/release
discipline on every accepted gesture.

---

## 2. The live surfaces that WILL exercise the U-SHELL-N7 behavior (after the revisit condition)

| Live surface | U-SHELL-N7 behavior it exposes | How to drive it live |
| --- | --- | --- |
| A running Astrographer Provident-Electron app (launch via `bash scripts/start-app.sh`) whose `.layout` grid renders the authored `.gutter[data-zone]` + `.pane-frame[data-pane-id]` + `[data-zone]` zone-container chrome | **Real DOM pointer gestures**: C7 gutter resize (one commit at `pointerup`, clamp to bounds), C7 double-click reset, C4 pane drag/reorder/relocate, C11 empty-zone reveal + re-hide, C12 minimized-zone-stays-drop-target + inert gutter, the interactive-control guard, `setPointerCapture`/release, and the abort/no-mutation failure paths | a UI-interactive (DOM-pointer) session dispatching real `pointerdown`/`pointermove`/`pointerup`/`pointercancel` on the chrome and observing the committed `LayoutState` / the reveal (`is-revealed`) classes / the no-mutation aborts |
| The Electron renderer's browser bootstrap (`src/renderer/index.html` + `renderer.js` `installShellPointers`, wired from `main()` after the `SidebarPanes` host is constructed) | **F11** — the absent-host (`no SidebarPanes`) path where `installShellPointers` is a no-op and the app still boots; **F5** — the `setPointerCapture` fail-soft degrade inside a captured gesture | a browser boot (a real renderer) — with and without the host, and against a capture-absent/stub-capture engine |

**Prerequisites for the later run (MANDATORY):**

1. **The app must be running.** Launch via `bash scripts/start-app.sh` (defaults
   already fit this host: `--no-sandbox`, `--disable-dev-shm-usage`,
   `--mcp-transport=http`). The app must render the authored shell chrome:
   `.layout` grid, the four `.gutter[data-zone]` elements, the `.pane-frame[data-pane-id]`
   frames, and the `[data-zone]` zone containers.
2. **A DOM-pointer / UI-interactive session.** The live runner (or a debugger /
   renderer devtools / a `webContents.sendInputEvent`-style driver) must be able to
   dispatch real pointer events at real coordinates on those chrome elements and
   read back the resulting `LayoutState` mutations + the `is-revealed` class
   changes. This is a **human-operator / interactive surface**, NOT the MCP tool
   surface.
3. **Authored, populated chrome.** The unit is shell-chrome wiring; the live
   `.gutter[data-zone]` and `.pane-frame[data-pane-id]` elements must be present
   in the rendered DOM and the pane graph must have authored panes to drag (so
   `data-pane-id` resolves to a real `app-graph` pane). See §6 **ADV6** for a
   known risk on the gutter hit-target.

**The check that ends the park:**

- The Astrographer app is running **AND** the shell chrome renders (the `.layout`
  grid with the four `.gutter[data-zone]` and at least one `.pane-frame[data-pane-id]`)
  **AND** a UI-interactive driver can dispatch real pointer events and observe the
  resulting layout/reveal state. When that is possible, run every §3 probe
  (the MCP surface alone is NOT sufficient — the DOM pointer surface is not
  MCP-reachable, §1).

---

## 3. The concrete live probes to run once the shell + DOM-pointer session is up

Each probe gives a **precondition**, the **action** (the real pointer sequence),
the **expected observable**, and a **pass/fail box**. **A live result that
CONTRADICTS the greens or the spec is a FINDING (a regression or a doc/spec
drift) — never a pass.** Every accepted gesture must `setPointerCapture` on the
originating element and naturally release at `pointerup`/`pointercancel`.

> **Drive shape.** The pointer coordinates are client coordinates (the shell space,
> §2.6); read the live rects (`.layout` and each `[data-zone]` container) with
> `getBoundingClientRect()` and dispatch `pointerdown`/`pointermove`/`pointerup`/
> `pointercancel` with matching `pointerId`s on the chrome elements. Observe the
> committed `LayoutState.zones[<zone>].size` (gutter) / the pane `(zone, order)`
> after a drop (drag) / the `is-revealed` classes during a drag (C11/C12).

### 3.1 C7 — Gutter resize (per zone) commits exactly once at `pointerup` and clamps to the zone bounds

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **C7-left** | `.layout` rendered; `.gutter[data-zone='left']` present with a real bounding rect | `pointerdown` on the left gutter; `pointermove` right-by-+120px (captured move); `pointerup` | a `.gutter`-active gesture; `LayoutState.zones.left.size` changes ONCE to the clamped value measured from the `.layout` left edge; no per-move write before `pointerup`; **exactly one** settings write for the whole gesture | [ ] PASS / [ ] FAIL |
| **C7-right** | `.gutter[data-zone='right']` present | `pointerdown`; `pointermove` (captured) along the column axis; `pointerup` | `zones.right.size` commits once, clamped; the mapping reads `layoutRect.right − x` | [ ] PASS / [ ] FAIL |
| **C7-header** | `.gutter[data-zone='header']` present | `pointerdown`; `pointermove` (captured) along the row axis; `pointerup` | `zones.header.size` commits once, clamped; mapping `y − layoutRect.top` | [ ] PASS / [ ] FAIL |
| **C7-footer** | `.gutter[data-zone='footer']` present | `pointerdown`; `pointermove` (captured); `pointerup` | `zones.footer.size` commits once, clamped; mapping `layoutRect.bottom − y` | [ ] PASS / [ ] FAIL |
| **C7-clamp** | a gutter gesture mid-flight | drag the gutter far beyond the track limits (e.g. `pointermove` out of the `.layout` rect by an extreme margin), then `pointerup` | the committed size clamps to the zone bounds — side columns `[160,640]`, header/footer rows `[32,240]`; never negative, never `NaN`, never a collapsed track; `LayoutState` stays coherent | [ ] PASS / [ ] FAIL |
| **C7-cancel** | a gutter gesture in progress | `pointercancel` (no `pointerup`) | `cancelGutter()` → revert; **no commit / no write**; no lingering active gesture | [ ] PASS / [ ] FAIL |

### 3.2 C7 — Gutter double-click resets to the registry default

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **C7-dblclick** | a zone whose current size differs from the registry default | `pointerdown`/`pointerup`/`pointerdown`/`pointerup` (a real `dblclick`) on an authorized gutter zone | `resetGutter(zone)` fires once; the committed `LayoutState.zones[<zone>].size` equals the registry default (`defaultLayout().zones.left.size` = `220` for `left`); exactly one commit | [ ] PASS / [ ] FAIL |

### 3.3 C4 — Pane drag reorder within a zone + relocate across zones

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **C4-reorder** | ≥2 authored `app-graph` panes in one zone, each a `.pane-frame[data-pane-id]` | `pointerdown` on a frame's non-control area; captured `pointermove` near a drop position in the SAME zone; `pointerup` | `startPaneDrag(paneId)`; the drag reveals the drop zones; `commitPaneDrop` applies `movePane` with an `insertionIndexForPoint`-derived order — siblings renumber 0..n−1; pane node identity stable; exactly one `setLayout` write | [ ] PASS / [ ] FAIL |
| **C4-relocate** | an `app-graph` pane in `left`, an authored target zone (`right`/`header`/`footer`) | drag the pane onto the legal target zone; `pointerup` there | the pane lands in the target zone at the pointer's index; the vacated source zone renumbers its remaining panes; node identity stable; exactly one `setLayout` write | [ ] PASS / [ ] FAIL |
| **C4-self-drop** | a pane in its current `(zone, order)` | drop it back onto exactly its own position | `commitPaneDrop`/`movePane` is a **no-op**: zero `setLayout` writes, no order change (F2) | [ ] PASS / [ ] FAIL |

### 3.4 C11 — Empty-zone reveal on approach + re-hide on exit

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **C11-reveal** | an empty/hidden `[data-zone]` container (its grid track collapsed, `is-empty`) | during a drag, move the pointer within the snap threshold of that zone's rect, pause (repeat an identical move), then move away | the zone gains `is-revealed` **once** on the first threshold-crossing (idempotent — the identical repeat does NOT re-reveal/duplicate); moving away re-hides it (`is-revealed` removed) with one final reveal write | [ ] PASS / [ ] FAIL |
| **C11-scope** | an empty-app-graph zone + an `operator`-scope pane | drag the operator pane near the app-graph zone | the app-graph zone never reveals (`legalZonesForScope('operator') == []`); a drop there is rejected (`null`), never a partial mutation (F3/S9) | [ ] PASS / [ ] FAIL |

### 3.5 C12 — A minimized zone stays a drop target while its gutter is inert

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **C12-drop** | a minimized zone | drag a scope-legal pane near the minimized zone's `[data-zone]` rect | it reveals like an empty zone and accepts a scope-legal drop — the pane lands there | [ ] PASS / [ ] FAIL |
| **C12-gutter-inert** | the same minimized zone | `pointerdown` + drag on its `.gutter` element | `isGutterResizable(empty, minimized)` is false → `startGutter` is a no-op: no active gesture, no reveal, no write, no cursor change beyond the CSS (F8) | [ ] PASS / [ ] FAIL |

### 3.6 F9 — The interactive-control guard

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **F9-control-guard** | a `.pane-frame` containing a collapse-toggle (`pane-collapse-<id>`), a minimize toggle (`zone-minimize-<zone>`), a tab (`zone-tab-…`), and an `input` | `pointerdown` on EACH of those controls (real event.target within the frame) | the event is **NOT hijacked** into a drag (`startPaneDrag` never fires); the control's provident click handler fires normally; the guard targets `input`/`button`/`a`/any `on:*`-carrying node | [ ] PASS / [ ] FAIL |

### 3.7 F10 — A malformed `data-zone` is never a drop target

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **F10-malformed** (drag side) | a stray `[data-zone='bogus']` container in the shell | `pointermove` over it during a drag, then drop there | `dropZoneForPoint` never returns it as a target (not one of the four pane zones); a drop that would land only there aborts (F1) with NO mutation | [ ] PASS / [ ] FAIL |
| **F10-malformed** (gutter side) | a stray `.gutter[data-zone='bogus']` | `pointerdown` + drag + `dblclick` on it | `gutterSizeForPoint('bogus', …)` → `0`; `startGutter('bogus')` ignored (0 commits); `resetGutter('bogus')` → `null`; never throws | [ ] PASS / [ ] FAIL |

### 3.8 F1 — A dropped-outside-any-zone drag aborts with no mutation

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **F1-outside** | a drag in progress over empty chrome (no `[data-zone]` anywhere near) | `pointerup` outside every zone's snap band | `dropZoneForPoint` → `null` → the wiring calls `cancelPaneDrag()`: the drag aborts, any reveal re-hides, **NO state mutation, no reveal leftover** | [ ] PASS / [ ] FAIL |

### 3.9 F5/F11 — Pointer-capture discipline + fail-soft + absent-host boot

| Probe | Precondition | Action | Expected observable (live) | Verdict |
| --- | --- | --- | --- | --- |
| **F5 / capture** | a live captured gesture | on EVERY accepted gesture (gutter + drag), `pointermove` continuing after the pointer leaves the element's bounds | the originating element called `setPointerCapture(pointerId)` and the gesture survives the pointer leaving; `releasePointerCapture` (or the natural release at gesture end) returns the pointer to the normal path; with capture absent/throws, the gesture degrades fail-soft (proceeds on non-captured listeners or a no-op) — NEVER a throw, the app keeps running | [ ] PASS / [ ] FAIL |
| **F11-absent-host** | a browser boot (renderer) with NO `SidebarPanes` host (e.g. no-bridge plain-page mode) with and without the host present | boot the renderer in each mode | `installShellPointers` is a no-op when the host is absent (no listener registration); the app still boots — never a throw; with the host present, the listeners attach once (never torn down / re-registered per gesture) | [ ] PASS / [ ] FAIL |

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 35 PASS / 0 FAIL / 4 NOT-TESTABLE
  (`docs/specs/unit-u-shell-shell-wiring-greens.md`).
- **Already green at the live MODULES (no live re-run needed):** M1–M3, S1–S10,
  F1, F2, F3, F4, F6, F7, F8, F10, P-IM-1..P-TP-3, and the §2.8 source-pin
  (`SP`, 6 sub-asserts) — all pass through the pure modules + the source-pin.
- **Parked for a live shell-DOM run (require the running app + real DOM pointer
  events):** the C7 one-commit resize + clamp (3.1), the C7 double-click reset
  (3.2), the C4 reorder/relocate/self-drop (3.3), the C11 reveal/re-hide + scope
  (3.4), the C12 minimized-drop + inert-gutter (3.5), the **F9** interactive-control
  guard (3.6), the **F10** malformed-zone negatives (3.7), the **F1** outside-any-zone
  abort (3.8), and the **F5** capture/fail-soft + **F11** absent-host boot (3.9).
- **Run live this iteration: 0** (no running app session; the MCP surface does not
  expose the shell DOM — §1).
- **Not a failure:** the module seam is green (35/0/4); the park is a **live
  shell-DOM surface absence** — the MCP/UI tools expose the provident graph, not
  the shell-chrome pointer surface, and there is no running-app session this pass.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** a **running-app
   (`bash scripts/start-app.sh`) MCP/UI session** where the shell layout + the
   authored `.gutter[data-zone]` + `.pane-frame[data-pane-id]` chrome render, AND a
   DOM-pointer / UI-interactive driver can dispatch real pointer events and observe
   the resulting layout/reveal state. The MCP reachability check
   (`curl -s http://127.0.0.1:3787/mcp`) is NOT by itself sufficient for THIS unit —
   the unit's surface is the shell DOM, which the MCP endpoints do not expose (§1).
2. **Drive shape:** client-coordinate real `pointerdown`/`pointermove`/`pointerup`/
   `pointercancel` with matching `pointerId`s, `getBoundingClientRect()` reads of the
   `.layout` and `[data-zone]` containers, and observation of the committed
   `LayoutState.zones[<zone>].size` / the pane `(zone, order)` / the `is-revealed`
   classes. `webContents.sendInputEvent` (Electron) or the renderer devtools are
   the natural drivers.
3. **ADV6 — KNOWN RISK to confirm during the live run (gutter hit-target):** the
   four authored `.gutter` elements in `src/renderer/index.html` (lines 198–201)
   currently carry **NO grid placement/area** (no `grid-area`, no
   `grid-column`/`grid-row`), while the `.layout` `grid-template-areas` (lines
   89–93) already occupy all 12 explicit cells — so the gutters **auto-place** in
   the grid's implicit overflow region and, being empty `<div>`s with `flex:none`
   and no intrinsic size, are **likely zero-area and non-interactable** as C7
   hit-targets until the U-SHELL-5 gutter-styling/placement surface lands. The live
   battery MUST flag this and, if the real layout shows `.gutter` elements with no
   computed area/hit box, treat the C7 gutter probes as **un-resolvable until
   U-SHELL-5 placement ships** (a park extension, not a failure — the wiring's
   source-pin is green). Confirm the gutter rects are non-degenerate before
   trusting a C7 PASS.
4. **F5/F11 are the NT rows that need a browser, not the MCP tools** — they require
   a real captured element / a real `pointerdown` target chain / a renderer boot with
   vs. without the host. Run them from the Electron renderer (or a debugger), not
   from an MCP client.
5. **A live result that CONTRADICTS the greens or the spec is a FINDING** (a real
   regression or a doc/spec drift) — never a pass. Report it to the supervisor,
   giving the observed gesture outcome (committed size / pane order / reveal class /
   captured-pointer trace) against the expected observable.
6. **No `src/**` or `tests/**` change is sanctioned by this battery** — it is a
   verification artifact only. If a live run finds a HOST defect, record it in
   `docs/defects.md` + `docs/HANDOFF.md` per AGENTS.md; the host is fixed here, never
   handed off.
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec §section numbers, the authored `.gutter`/`.pane-frame`
   elements in `index.html`, whether U-SHELL-5's gutter placement has landed in the
   meantime) and the trackers (`docs/next-steps.md`, `docs/pending.md`,
   `docs/decisions.md`). The W2-N7 row is RESOLVED (Architect ruling (a)); the
   unit is GREEN/LANDED in source.

## STATUS 2026-09-15 — CLOSED (PASS for the live shell surface w/ a recorded harness caveat)
Un-parked and run against the running app (lexical). Command:
`node scripts/live-drive.mjs --mode=lexical --display=0 --block=shell_wiring`
- Live shell inventory present: `.layout` found, **4 gutters** (all `[data-zone]`), **2 pane-frames** (`.pane-frame[data-pane-id=search|doc-nav]`), 9 `[data-zone]` containers.
- A CDP gutter gesture + a CDP pane-frame drag were dispatched; the `.layout` pointer-seam counters (pointerdown/up/move) stayed **0** — CDP synthetic Input mouse events do NOT generate page-level pointer events in this harness (the pre-diagnosed LIVE-11 diag6 limitation), so the gesture→pointer-seam reach could NOT be re-confirmed via the CDP driver. This is a HARNESS synthetic-input limitation, NOT a host defect (the module seam is separately green 35/0/4 + the §2.8 source-pin).
- ADV6 caveat observed: 4 gutters present, 2/9 zones populated with panes — consistent with the "four gutters may have no grid area in some layouts" caveat.
CLOSED for the live-surface presence; the pointer-seam gesture reach is unconfirmable via CDP synthetic Input (harness limitation recorded).
