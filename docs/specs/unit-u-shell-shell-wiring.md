# Unit U-SHELL-N7 — Shell Pointer-Wiring Integration (W2-N7) — Spec

**Status:** **GREEN / COMPLETE — CODE LANDED (2026-09-13).** Resolves
**W2-N7** (MEDIUM, `docs/specs/wave-2-open-decisions.md` §D) under
**Architect ruling (2026-09-13): option (a)** — a shell-wiring integration
pass. Real DOM pointer listeners (`pointerdown`/`pointermove`/`pointerup`/
`pointercancel` with `setPointerCapture`) + `getBoundingClientRect`/rect math
that feed the EXISTING host seams (`startGutter`/`moveGutter`/`endGutter`/
`cancelGutter`/`resetGutter` in `sidebar-panes.ts`, and the drag controller's
start/move/commit via `startPaneDrag`/`movePaneDrag`/`commitPaneDrop`/
`cancelPaneDrag`). **This is shell chrome — the one exception to the
provident-framework UI constraint (AGENTS.md)** — so raw DOM wiring is
permitted. Depends on U-SHELL-4 (drag controller + host seams) and U-SHELL-5
(gutter controller + host seams), both GREEN. **Code-bearing and landed:** this
pass reworks `installShellPointers` (now a NAMED export of
`src/renderer/renderer.ts`) as a document-level DELEGATED wiring that closes the
confirmed adversarial findings — **HOST-1..5** (document-delegated `pointerdown`
via `closest` on `.gutter[data-zone], .pane-frame[data-pane-id]` — **the pane half
SUPERSEDED 2026-09-15 by F-1: the delegated selector is now
`'.gutter[data-zone], .pane-collapse-toggle'` and pointer capture is deferred past a
4px threshold; see §2 note 1** — plus the
`.layout [data-zone]` move projection; exactly-once per-gesture move/up/cancel
teardown; ancestor-climb interactive guard incl. `label`/`fieldset`/
`[contenteditable]`; fail-closed non-`LayoutZoneName` zone skip; per-gesture
listener non-accumulation) and the re-audit **ADV1..5** (permanent
document-delegated `dblclick` reset; `pointerId`-scoped move/up/cancel +
`lostpointercapture` teardown; cross-kind supersede revert; idempotent install;
interactive WRAPPER controls). The four `.gutter[data-zone][data-axis]`
shell-chrome elements are authored in `index.html`; the pane-frame root carries
`data-pane-id` in `pane-graph.ts`; the dom-shim (`src/shared/dom-shim.ts`)
gained the `innerHTML`/`outerHTML` getters back + a delegated pointer dispatch +
`closest`/`setRect`/`setPointerCapture`. **Trio green: 4527 pass / 58 skip;
typecheck 0; build 0.** Tests: `tests/unit-u-shell-shell-wiring.test.ts` (30),
`tests/unit-u-shell-shell-wiring-adversarial.test.ts` (14 —
HOST-1..5 + ADV1..5), `tests/unit-u-shell-shell-wiring-pbt-generators.test.ts`
(5). Adversarial + re-audit records: §3a/§3b.

---

## 1. What the proposal asks

The drag (`src/renderer/pane-drag.ts`) and gutter (`src/renderer/pane-gutter.ts`)
PURE controllers + their host seams (`startGutter`/`moveGutter`/`endGutter`/
`cancelGutter`/`resetGutter`/`previewGutter`/`activeGutter`; `startPaneDrag`/
`movePaneDrag`/`commitPaneDrop`/`cancelPaneDrag`/`revealZones`) exist and are
GREEN, but there is **no DOM `pointerdown/move/up` (capture) +
`getBoundingClientRect` listener wiring** in `src/renderer/renderer.ts` /
`src/renderer/index.html`. Consequently the C4 (drag/reorder/relocate) and C7
(resizable gutters) gestures are **UNREACHABLE in the live app**: `.gutter`
CSS is dead (no `.gutter` element is authored and no listener routes the
pointer), and `startGutter`/`startPaneDrag` have no caller. The U-SHELL-5 spec
§2.1/§5 pins "continuous pointer capture + `getBoundingClientRect` rect math"
as its census; the U-SHELL-4 spec §2.1 Table B pins the shell as the pointer
mechanic.

This unit delivers that missing shell layer: a **shell-wiring pass** that attaches
the pointer listeners, applies pointer capture, reads `getBoundingClientRect()`
for the gesture geometry, and routes every pointer event through the existing
pure controllers + host seams — so the C7 gutter resize and the C4 drag/reorder/
relocate gestures, plus the C11 empty-zone reveal and the C12 minimize
interaction, actually work in the live application.**

The deliberate scope, per the Architect ruling: gutter resize + pane
drag/reorder/relocate + the C11 reveal (a dragged pane near an empty/minimized
zone reveals it) + the C12 minimize hook (a non-resizable zone has no active
gutter; a minimized zone stays a drop target). Pointer capture + rect math per
U-SHELL-5 §2.1/§5 census. **No re-render, no teardown, no per-move write** is
added — the wiring only feeds the seams; the controllers keep every existing
one-write-per-gesture / one-write-per-threshold-crossing discipline.

## 2. Contract (pinned)

### 2.1 The seam surface the wiring consumes (already GREEN — the wiring's inputs)

The wiring is a pure **caller** of the existing exported seams; it introduces
**no new behavior** into them and does **not** change their signatures. Verified
module surfaces (this spec pins them for the TestWriter's benefit — see §6 for
the owning specs):

**Gutter controller** (`src/renderer/pane-gutter.ts`, U-SHELL-5 §2.5 pin 2):
- `createGutterController(options: { onCommit: (zone, size) => void;
  isResizable?: (zone) => boolean; bounds?: (zone) => GutterBounds }):
  GutterController` → `{ start(zone): void; move(size): void; end(): number |
  null; cancel(): void; reset(zone?): number | null; active(): LayoutZoneName |
  null; preview(): number | null }`.
- `gutterAxis(zone: unknown): 'columns' | 'rows'` — TOTAL, unknown → `'columns'`.
- `GUTTER_ZONES: readonly LayoutZoneName[] = ['left','right','header','footer']`.
- `gutterBounds(zone): { min: number; max: number }` — rows: `{32,240}`;
  columns: `{LAYOUT_ZONE_MIN, LAYOUT_ZONE_MAX}` = `{160,640}`.
- `clampGutterSize(zone, size): number` — clamps; non-finite → min; never
  negative/NaN (see §5.7 P-IM-3).
- `setZoneSize(layout, zone, size): LayoutState` — pure; only the target
  zone's `size` changes.
- `isGutterResizable(empty, minimized): boolean` — `empty !== true && minimized
  !== true` (§2.3 C11/C12 gate).

**Drag controller** (`src/renderer/pane-drag.ts`, U-SHELL-4 §2.5 pin 2):
- `createDragController(options: { threshold: number; scopeOf: (paneId) =>
  PaneScope | null; onRevealChange: (revealed) => void }): DragController` →
  `{ start(paneId): void; move(point, zones): void; reveal(): readonly
  LayoutZoneName[]; drop(payload?): DropResult | null; cancel(): void }`.
- `DragPoint { x: number; y: number }`, `ZoneBounds { zone; left; top; right;
  bottom }`, `DropResult { paneId; zone; order? }`, `PaneScope = 'app-graph' |
  'operator'`.
- `movePane(layout, paneId, zone, order?): LayoutState` — pure reorder/relocate.
- `insertionIndexForPoint(point, zone, slots): number` — within-zone banding
  (U-SHELL-4 §3.1).
- `withinSnapThreshold(point, zone, threshold): boolean` — proximity ± threshold.
- `zoneOrientation(zone): 'vertical' | 'horizontal'` — unknown → `'vertical'`.
- `legalZonesForScope(scope): LayoutZoneName[]` — `app-graph` → all four pane
  zones; `operator` → `[]`.

**Host seams** (`src/renderer/sidebar-panes.ts`, U-SHELL-4 §5 / U-SHELL-5 §5):
- Gutter: `startGutter(zone)`, `moveGutter(size)`, `endGutter(): number | null`,
  `cancelGutter()`, `resetGutter(zone?)`, `previewGutter(): number | null`,
  `activeGutter(): LayoutZoneName | null` — thin passthroughs to the controller.
- Drag: `startPaneDrag(paneId)` (re-hides any prior reveal, resets geometry,
  starts the gesture), `movePaneDrag(point, zones)` (records the live
  point/zone geometry + drives the controller's threshold reveal),
  `cancelPaneDrag()`, `commitPaneDrop(payload?): DropResult | null` (F2 no-op on
  self-drop), `revealZones(): readonly LayoutZoneName[]`.

### 2.2 The pointer→seam argument-mapping helpers (NEW — node-testable)

The wiring routes raw pointer `clientX/clientY` + `getBoundingClientRect()`
rects through **three new PURE helpers** so the pointer→controller argument
mapping is directly node-testable (the DOM listener registration itself is
source-pinned — §2.8/§3). The wiring MUST use these helpers (never inline the
mapping). All three are TOTAL: malformed input never throws, never produces a
partial mutation.

1. **`gutterSizeForPoint(layoutRect: Rect, zone: LayoutZoneName, point:
   { x: number; y: number }): number`** — added to `pane-gutter.ts`. Resolves
   the axis via `gutterAxis(zone)` and maps the pointer to a **candidate track
   size in px** measured from the `.layout` bounding rect's leading edge along
   the zone's axis:
   - `left` (columns): `point.x − layoutRect.left`
   - `right` (columns): `layoutRect.right − point.x`
   - `header` (rows): `point.y − layoutRect.top`
   - `footer` (rows): `layoutRect.bottom − point.y`
   - an unknown zone, or a non-finite `point`/`layoutRect` field → `0`. TOTAL,
     deterministic. The wiring passes the result to `host.moveGutter(...)`,
     which clamps via the controller (non-finite/`0` clamps to the zone's min —
     a collapsed track is never committed).
2. **`toZoneBounds(zone: LayoutZoneName, rect: Rect): ZoneBounds`** — added to
   `pane-drag.ts`. Projects a `getBoundingClientRect()`-shaped rect onto the
   controller's `ZoneBounds` surface: copies `left`/`top`/`right`/`bottom` as
   finite floats (a non-finite/missing field coerces to `0`), preserves `zone`.
   TOTAL, deterministic.
3. **`dropZoneForPoint(point: { x: number; y: number }, zones: readonly
   ZoneBounds[], threshold: number): LayoutZoneName | null`** — added to
   `pane-drag.ts`. Hit-tests the pointer against the zone bounds using
   `withinSnapThreshold(point, zone, threshold)` and returns the **FIRST** zone
   whose bounds contain the point within the threshold; `null` when no zone
   matches. **Geometry-only and scope-agnostic** — the scope legality is enforced
   downstream by the drag controller's `drop` (§2.4). TOTAL: a malformed
   point / non-array / empty `zones` / non-finite threshold → `null`, never a
   throw.

`Rect` is a getter-shaped record `{ left: number; top: number; right: number;
bottom: number }` (the projection the wiring reads from a live
`getBoundingClientRect()`). For `gutterSizeForPoint` the rect type is declared
structurally inside `pane-gutter.ts` (no import from `pane-drag.ts` is added, so
the two pure modules stay independent).

### 2.3 The gutter wiring (C7)

- **Elements wired:** exactly ONE `.layout .gutter[data-zone='left']`, `right`,
  `header`, `footer` shell-chrome element per zone, each carrying
  `data-axis='columns'|'rows'` matching `gutterAxis(zone)` so the EXISTING
  `.layout .gutter[data-axis='columns']`/`[data-axis='rows']` cursor rules apply
  (`index.html`). The `.gutter` element is plain shell chrome (not a provident
  node — the AGENTS.md exception); no `on:*` handler, not MCP-visible.
- **`pointerdown`:** on a gutter element, the wiring reads
  `getBoundingClientRect()` of the `.layout` root ONCE (the gesture reference
  `layoutRect`), resolves `zone` from the element's `data-zone`, and calls
  `host.startGutter(zone)`. The controller's §2.3 gate makes a non-resizable
  (empty/minimized) zone a no-op — so a gutter element under an empty/minimized
  track must either not be authored or must be inert; the controller gate is the
  authoritative guard.
- **After `startGutter` accepts:** the wiring calls
  `setPointerCapture(pointerId)` on the gutter element (fail-soft when absent /
  throws — §4 F5) and listens for `pointermove`/`pointerup`/`pointercancel`
  (captured) on the element: 
  - `pointermove`: `host.moveGutter(gutterSizeForPoint(layoutRect, zone, {x: e.clientX, y: e.clientY}))`.
    (Controller `move` clamps; **no per-move write** — preview only.)
  - `pointerup`: `host.endGutter()` — the ONE commit at gesture end (W2-Q7).
  - `pointercancel`: `host.cancelGutter()` — no commit / revert (F2/F4).
- **Double-click reset:** a PERMANENT document-delegated `dblclick` (ADV1 —
  decoupled from the gesture lifecycle, so the real two-click order
  `down→up→down→up` still reaches it after the 2nd `pointerup`) on an
  active/authorized gutter zone calls `host.resetGutter(zone)` (§2.5 pin 5 — the
  registry default commit, once).
- **No gutters for non-resizable zones:** the wiring must not route a gesture for
  an empty or minimized zone; the `isGutterResizable` gate is enforced by the
  controller's `start`/`reset` (the wiring simply feeds `startGutter`).
- **ADV6 (deferred — styling surface, not a wiring fix):** the four authored
  `.gutter` elements (index.html) currently carry **no grid placement/area**
  (`grid-area` or `grid-column`/`grid-row`) — the `.layout` `grid-template-areas`
  already occupy all 12 explicit cells — so they auto-place in the grid's implicit
  overflow region and, as empty `flex:none` `<div>`s, are **likely zero-area and
  non-interactable** as C7 hit-targets until the U-SHELL-5 gutter-styling/placement
  surface lands. Deferred to U-SHELL-5 (recorded as a live-battery known-risk — see
  `docs/specs/unit-u-shell-shell-wiring-live-pending-battery.md` §6 ADV6); the §2.8
  wiring source-pin / the node-driven adversarial surface are unaffected.

### 2.4 The pane-drag wiring (C4 + C11 + C12)

- **Drag handle target:** the draggable surface is the pane frame root
  `.pane-frame[data-pane-id='<id>']` (the frame carries `data-pane-id`, pane-graph
  §paneSubtreeRoot). `pointerdown` on the frame resolves `paneId` from
  `data-pane-id` and calls `host.startPaneDrag(paneId)` **only when the pointer
  target — OR any of its ancestors, climbed by direct node inspection (HOST-3) — is
  NOT an interactive control** (an `input`, `button`, `a`, `select`, `textarea`,
  a WRAPPER `label`/`fieldset`, a `[contenteditable]` region, or a node carrying
  an `on:click`/`on-click`/`data-handler`/`on:pointerdown` — e.g.
  `pane-collapse-<id>`, `zone-minimize-<zone>`, `zone-tab-…`) so a click on a
  control (or a control's nested child, or a label wrapping a control) is never
  hijacked into a drag. (The collapsed-toggle button and the minimize toggle are
  provident click handlers and stay clickable.)
- **Capture + move:** after `startPaneDrag` accepts, the wiring calls
  `setPointerCapture(pointerId)` and, on each captured `pointermove`:
  1. maps the point `{ clientX, clientY }` → the controller `DragPoint` (client
     coords ARE the shell coordinate space — identity mapping);
  2. reads `getBoundingClientRect()` of every `[data-zone]` zone container in
     `.layout` and projects each via `toZoneBounds(dataZone, rect)` into a
     `ZoneBounds[]`;
  3. calls `host.movePaneDrag(point, zones)` — drives the controller's
     scope-legal threshold reveal (ONE `onRevealChange` write per crossing).
     The controller filters to scope-legal zones; illegal zones never reveal,
     never accept.
- **Drop (`pointerup`):** resolve the drop target by hit-test:
  `const zone = dropZoneForPoint(point, lastZones, threshold)` where `lastZones`
  is the most recent `ZoneBounds[]` from `movePaneDrag` and `threshold` is the
  drag controller's pinned threshold (`24`). If `zone === null` (outside any
  zone — F1) → `host.cancelPaneDrag()` (abort; no mutation). Otherwise →
  `host.commitPaneDrop({ paneId: activePaneId, zone })` with `order` omitted (the
  host derives the within-zone insertion index from the recorded drop point via
  `insertionIndexForPoint`, U-SHELL-4 §3.1; a self-drop no-ops — F2, zero
  writes). The controller's `drop` re-validates paneId/zone/scope legality — an
  operator pane can never land in an app-graph zone.
- **`pointercancel`:** `host.cancelPaneDrag()` — re-hides the reveal with one
  final write; no mutation.

### 2.5 The C11 reveal + C12 minimize hooks

- **C11 (empty-zone reveal):** during a drag, a pane near an empty zone reveals
  it as a provisional drop target. This is the controller's `onRevealChange`
  (already wired to `host.rerenderAppGraph()`); the WIRING contributes the
  geometry: it feeds `toZoneBounds` rects for every `[data-zone]` container
  (including empty/hidden ones) on each `pointermove`, so the controller's
  proximity threshold sees every zone. Crossing away re-hides via the controller.
- **C12 (minimize interaction):** two wiring-relevant hooks, no new provident
  surface:
  1. A **minimized zone stays a drop target** (W2-Q8 (a)): its `[data-zone]`
     container rect is fed on every move and `is-revealed` applies to it
     exactly like an empty zone; a drop into it is legal for a scope-legal pane.
  2. A **minimized zone is not gutter-resizable**: the wiring's gutter path
     relies on the controller's `isGutterResizable` gate (§2.3) so a minimized
     zone's gutter is inert. No new wiring seam is added for the minimize toggle
     itself (already a provident `zone-minimize-<zone>` click handler).

### 2.6 Pointer-capture + rect rules

- **Capture discipline:** every accepted gesture calls
  `setPointerCapture(event.pointerId)` on the originating element; the captured
  `pointermove`/`pointerup`/`pointercancel` listeners are attached so the
  gesture survives the pointer leaving the element. `releasePointerCapture` (or
  the natural release at gesture end) returns the pointer to the normal path.
- **Rect geometry:** every rect is read live from `getBoundingClientRect()` at
  the moment it is needed; the `.layout` `layoutRect` for a gutter gesture is
  captured once at `pointerdown` (a resize is purely geometric — the track width
  does not change mid-gesture because the controller only records a preview).
  Zone rects for a drag are re-read on every `pointermove`.
- **Coordinate space:** pointer `clientX/clientY` are used directly as the
  controller `DragPoint`/helper point (client coordinates are the shell space);
  no transform beyond the pure mapping helpers is introduced.

### 2.7 No re-render / teardown / shell-chrome-only

- **No per-move render or write:** the wiring NEVER calls `rerenderAppGraph` or
  `setLayout` directly. Every gesture-state write flows through the controllers
  (gutter: ONE commit at `end`/`reset`; drag: ONE `onRevealChange` per
  threshold-crossing + ONE `setLayout` at drop). The wiring adds zero graph
  writes.
- **No teardown (permanent wiring):** the document-level DELEGATED listeners —
  `pointerdown`, the PERMANENT `dblclick` reset (ADV1) and `lostpointercapture`
  (ADV2) — attach once at renderer boot (after the host is constructed — §2.8)
  and are never torn down. The per-gesture `pointermove`/`pointerup`/
  `pointercancel` are registered EXACTLY ONCE per accepted gesture and removed at
  gesture end (HOST-2 / `clearGesture`) — a second gesture never accumulates
  stale handlers. The extended dom-shim (`ShimElement`) now supplies
  `getBoundingClientRect`/`setPointerCapture`/`releasePointerCapture`/`closest`/
  `setRect` + a DELEGATED pointer dispatch, so the delegated listener layer is
  NODE-TESTABLE (the §3a adversarial suite drives it through the live
  `installShellPointers`) AND still statically asserted by the §2.8 source-pin.
- **Shell chrome only:** everything the wiring touches (`.layout`, `.gutter`,
  `.pane-frame`, `[data-zone]` rect reads) is the Electron shell chrome — the
  AGENTS.md exception. No provident node, handler, or envelope is added.

### 2.8 Source-pinned listener-registration surface (the statically-asserted layer)

The wiring's **listener registration** is asserted BOTH node-testably (this pass
extended the dom-shim so the live `installShellPointers` can be driven — §3a)
AND by a source-snapshot assertion (the `unit-u-shell-8`/`unit-ujr1`
module-private source-pin house convention — `tests/unit-u-shell-shell-wiring.test.ts`).
The TestWriter statically asserts the wiring in `src/renderer/renderer.ts` (the
`installShellPointers(host)` NAMED export invoked from `main()` after the
`SidebarPanes` host is constructed) registers, by literal call:

> **SUPERSEDED 2026-09-15 — the pane-drag surface (defect F-1; `docs/decisions.md`
> PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE).** Read the pins below with this
> override: the pane-drag surface is **no longer the `.pane-frame[data-pane-id]`
> element**. `GESTURE_SELECTOR` is now `'.gutter[data-zone], .pane-collapse-toggle'`
> (the gutter half is unchanged) and pointer capture is DEFERRED past
> `PANE_DRAG_CAPTURE_THRESHOLD` (4px) in `onGestureMove` instead of being claimed at the
> pointerdown. The frame-wide surface + immediate capture made every clickable row inside
> a pane body — and the pane header's own collapse toggle — inert to a real user.
> `data-pane-id` on the frame root is still required (the frame is resolved from the
> header for the pane id + the capture target). Live evidence:
> `docs/specs/user-flow-audit-coverage-2026-09-15.md` §4 F-1 with the §5.U U-1/U-2/U-3
> rows; the pins live in `tests/renderer-pane-drag-surface.test.ts` +
> `tests/unit-u-shell-shell-wiring.test.ts` (F-1.1/F-1.2). Every
> `.pane-frame[data-pane-id]` selector string below is the PRE-F-1 record.

1. ONE document-level DELEGATED `pointerdown` (`addEventListener('pointerdown', …)`)
   that resolves the gesture element per event via
   `e.target.closest(GESTURE_SELECTOR)` (`.gutter[data-zone], .pane-frame[data-pane-id]`
   — **the pane half SUPERSEDED: see the override note above**):
   a gutter gesture routes to `host.startGutter` (with `setPointerCapture`) and,
   inside the accepted gesture, `addEventListener('pointermove', …)` →
   `host.moveGutter(gutterSizeForPoint(...))`, `addEventListener('pointerup', …)`
   → `host.endGutter()`, `addEventListener('pointercancel', …)` →
   `host.cancelGutter()`; plus a PERMANENT document-delegated
   `addEventListener('dblclick', …)` → `host.resetGutter` (ADV1).
2. The pane-drag path (via the same delegated `pointerdown`): the interactive-
   control guard (HOST-3/ADV5), `setPointerCapture`, and inside the accepted
   drag `addEventListener('pointermove', …)` → `getBoundingClientRect()` reads of
   the `.layout [data-zone]` containers + `toZoneBounds` + `host.movePaneDrag(point, zones)`,
   `addEventListener('pointerup', …)` → `dropZoneForPoint` + `host.commitPaneDrop(...)`
   (else `host.cancelPaneDrag()`), `addEventListener('pointercancel', …)` →
   `host.cancelPaneDrag()`, and a document-delegated
   `addEventListener('lostpointercapture', …)` → revert + clear the active gesture
   (ADV2).

The source-pin asserts these `addEventListener(event-type, …)` literals,
`setPointerCapture`, `getBoundingClientRect`, the mapping-helper calls
(`gutterSizeForPoint`/`toZoneBounds`/`dropZoneForPoint` — never inlined), and
that every host seam named in §2.1 has a caller (it removes the
"`startGutter`/`startPaneDrag` have no caller" vacancy flagged in W2-N7). The
helper names themselves are NOT pinned (only the registration surface + the seam
calls + the mapping-helper calls are pinned), so the Implementer has freedom of
module shape.

## 3. States (TestWriter red set — valid paths)

The valid paths are split into **(a) node-testable pure seams** — driven through
the mapping helpers + the existing pure controllers — and **(b) the source-pinned
listener layer**. The TestWriter red focuses on (a) for behavior and asserts (b)
statically (DOM-shim cannot drive the real events).

1. **Gutter `left` resize:** `gutterSizeForPoint(layoutRect,'left',{x,y})` maps a
   pointer right of the layout's left edge to `x − layoutRect.left`; the wiring's
   `moveGutter` + `endGutter` commit a clamped `LayoutState.zones.left.size`
   ONCE at gesture end — the track resizes, exactly one settings write.
2. **Gutter `right`/`header`/`footer`:** `right` maps to `layoutRect.right − x`,
   `header` to `y − layoutRect.top`, `footer` to `layoutRect.bottom − y`;
   each commits the clamped size once.
3. **Gutter clamp:** a move dragging the gutter beyond the track limits → the
   committed size clamps to the zone's bounds (`left`/`right` `[160,640]`,
   `header`/`footer` `[32,240]`); never negative/NaN, never a collapsed track.
4. **Double-click reset:** `resetGutter(zone)` commits the registry default size
   once; `gutterSizeForPoint` is not involved (the default comes from the layout
   registry, U-SHELL-5 §2.5 pin 5).
5. **Pane reorder within a zone (C4):** a `pointerdown` on `.pane-frame` →
   `startPaneDrag(paneId)`; `movePaneDrag` reveals the drop zones; a drop inside
   the same zone commits `movePane` with an `insertionIndexForPoint`-derived
   order — siblings renumber; node identity is stable.
6. **Pane relocate across zones (C4):** dragging an `app-graph` pane onto a legal
   target zone commits a `zone` change; the source zone reorders; the drop lands
   where the pointer is (index-derivation).
7. **C11 empty-zone reveal:** a drag near an empty/hidden `[data-zone]` container
   reveals it (`is-revealed`) once per threshold-crossing; moving away re-hides
   it (idempotent). The reveal rides `toZoneBounds` rects fed on each move.
8. **C12 minimized zone stays a drop target:** a scope-legal drag near a
   minimized zone reveals/accepts it; a minimized zone's gutter is inert
   (`isGutterResizable` false → `startGutter` no-op).
9. **Scope legality (operator pane):** an `operator` pane's drag never reveals
   or accepts an app-graph zone; `dropZoneForPoint` may hit-test it but the
   controller's `drop` rejects (`null`, no mutation).
10. **Self-drop no-op (F2):** a drop that leaves the pane in its current
    zone+order yields `DropResult` but ZERO `setLayout` writes and no order
    change.

**Deliberate test strategy (stated):** the TestWriter drives (1)–(10) through the
node-testable **pure surface** — the three new mapping helpers
(`gutterSizeForPoint`/`toZoneBounds`/`dropZoneForPoint`) + the already-exported
pure seams (`clampGutterSize`/`setZoneSize`/`gutterAxis`/`withinSnapThreshold`/
`insertionIndexForPoint`/`legalZonesForScope`/`zoneOrientation`/`movePane`) +
the two controllers invoked exactly as the wiring invokes them (fake the
`layoutRect`/`ZoneBounds` inputs with dom-shim-free plain values). The DOM
listener layer is now ALSO node-testable: this pass extended the repo's
`dom-shim` (`ShimElement` + the synthetic document) with
`getBoundingClientRect`/`setPointerCapture`/`releasePointerCapture`/`closest`/
`setRect` + a DELEGATED pointer dispatch, so the §3a adversarial suite
(`tests/unit-u-shell-shell-wiring-adversarial.test.ts`) drives the LIVE
`installShellPointers` against the real listener layer. Both halves — the pure
node-testable behavior + the node-driven/adversarial + the §2.8 source-pinned
registration — are MANDATORY for a green.

### 3a. Adversarial review (RCA-3) — host findings FIXED

The post-green adversarial pass (2026-09-13) confirmed the wiring in
`installShellPointers` was INERT against the real app: its selectors matched NO
authored DOM, so the C4/C7/C11/C12 gestures were unreachable live and the §2.8
source-pin was a false green. All five host findings were FIXED in this landed
pass (+ regression-tested in `tests/unit-u-shell-shell-wiring-adversarial.test.ts`):

- **HOST-1 (HIGH):** the wiring attached pointers to elements found only at
  INSTALL time (`document.querySelectorAll('.gutter[data-zone]')` /
  `.pane-frame[data-pane-id]`), which the real app authors only at render →
  nothing matched, the gesture never routed. **Fixed:** ONE document-level
  DELEGATED `pointerdown`, resolved per event via
  `e.target.closest(GESTURE_SELECTOR)` (`.gutter[data-zone], .pane-frame[data-pane-id]` —
  **the pane half SUPERSEDED 2026-09-15 by F-1: `GESTURE_SELECTOR` is now
  `'.gutter[data-zone], .pane-collapse-toggle'`; see §2 note 1**),
  so chrome authored after install still routes; the four
  `.gutter[data-zone][data-axis]` elements + the frame `data-pane-id` are now
  authored (HOST-1/HOST-4).
- **HOST-2 (HIGH):** per-gesture `pointermove/up/cancel/dblclick` were registered
  per `pointerdown` on the shared element and never removed → duplicate/spurious
  commits. **Fixed:** the move/up/cancel listeners are registered EXACTLY ONCE
  per gesture and torn down at gesture end (`clearGesture`); the `dblclick`
  reset moved OUT of the gesture lifecycle (ADV1 — a PERMANENT delegated listener).
- **HOST-3 (MEDIUM):** `isInteractiveControl(target)` inspected only the deepest
  node, so a click on an interactive control's nested child was mis-started as a
  drag (F9). **Fixed:** ancestor-climb (direct `parentElement` inspection) +
  `select`/`textarea` + WRAPPER controls (`label`/`fieldset`) + `[contenteditable]`
  (ADV5).
- **HOST-4 (MEDIUM):** a reveal-driven re-mount detached the captured element
  mid-gesture, orphaning the gesture. **Fixed:** move/up/cancel route through the
  module-level active-gesture record, so a frame/zone re-mount mid-gesture never
  orphans the drop path.
- **HOST-5 (LOW):** `toZoneBounds` coerced an unknown `[data-zone]` value to
  `'left'`, so a malformed zone became a real drop target. **Fixed:** fail-closed
  `isLayoutZoneNameValue` guard — a non-`LayoutZoneName` zone is skipped (both the
  gutter `data-zone` and the `.layout [data-zone]` move projection), and the
  resize gutters are excluded from the projected drop-zone set.

### 3b. Adversarial re-audit (ADV1..5) — FIXED

The re-audit of the fixed wiring surfaced a further five findings, all FIXED +
regression-tested in the `HOST-N7-ADV` block of
`tests/unit-u-shell-shell-wiring-adversarial.test.ts`:

- **ADV1 (HIGH):** a `dblclick` fires AFTER the second `pointerup` in a real
  two-click order, so a reset tied to the gesture lifecycle was unreachable.
  **Fixed:** a PERMANENT document-delegated `dblclick` (registered next to the
  `pointerdown`) resolves the gutter via `.gutter[data-zone]` and calls
  `host.resetGutter(dataZone)` for a real layout zone, independent of the active
  gesture.
- **ADV2 (HIGH):** a dropped pointer (released without `pointerup`/`pointercancel`)
  leaked a stale gesture / its listeners. **Fixed:** the gesture records its
  `pointerId`; `onGestureMove/Up/Cancel` act only when the event `pointerId`
  matches the active gesture's; a document-delegated `lostpointercapture` handler
  reverts + clears the active gesture and tears down its per-gesture listeners.
- **ADV3 (MEDIUM):** a new gesture superseding an in-flight one left the prior
  gesture's reveal never re-hidden. **Fixed:** on `pointerdown` the prior gesture
  is reverted first (a pane drag → `cancelPaneDrag` re-hides its reveal; a gutter
  → `cancelGutter`) before the new gesture starts (`revertPriorGesture`).
- **ADV4 (LOW):** a second `installShellPointers` on the same document doubled
  the delegated wiring. **Fixed:** `installShellPointers` is idempotent per
  DOCUMENT (`shellWiredDoc`) — a redundant call is a no-op; `activeGesture` stays
  single-homed.
- **ADV5 (MEDIUM):** `isInteractiveControl` did not treat `label`/`fieldset`/
  `[contenteditable]` as interactive, so a `label` WRAPPING an `input`/`select`/
  `textarea` (or an editable region) inside a `.pane-frame` was hijacked into a
  drag. **Fixed:** those WRAPPER controls are added to the interactive set (with
  the HOST-3 ancestor climb).
- **ADV6 (deferred, NOT a code fix):** the four authored gutters carry **no
  grid-area/grid placement** (the `.layout` grid is fully occupied), so they are
  likely zero-area/non-interactable as C7 hit-targets until the U-SHELL-5
  gutter-styling/placement surface lands — recorded as a live-battery known-risk
  (`docs/specs/unit-u-shell-shell-wiring-live-pending-battery.md` §6, and noted in
  §2.3 above); the wiring's §2.8 source-pin is unaffected.

**Staleness pass note (proofreader/doc-review, 2026-09-13):** this pass corrected
the previously-spec-only top status block (the "No `src/` or `tests/` change in
this pass" line is superseded), reconciled §2.3/§2.4/§2.7/§2.8/§3/§4/§6/§8
against the LANDED wiring, added the adversarial records above, and reconciled
the active trackers (`docs/next-steps.md`, `docs/HANDOVER.md`,
`docs/specs/wave-2-open-decisions.md` §D, `docs/defects.md`) + the test counts
(30 + 14 + 5 = 49) + the trio (4527 pass / 58 skip).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a pane dropped outside any zone / no `dropZoneForPoint` hit | abort via `cancelPaneDrag`; NO state mutation, no reveal leftover |
| F2 | a drop of a pane onto its own current position | no-op (zero `setLayout` writes, no order change) — U-SHELL-4 blind F2 |
| F3 | a scope-illegal drop target | no reveal, drop rejected (`null`), never a partial mutation |
| F4 | a gesture interrupted by `pointercancel` | gutter `cancelGutter()` (revert, no write) / drag `cancelPaneDrag()` (re-hide with one final write); no partial stream |
| F5 | `setPointerCapture` unavailable / throws (older engine, dom-shim) | fail-soft: the gesture proceeds on the element's non-captured listeners (or degrades to a no-op — never a throw); capture is a best-effort enhancement |
| F6 | `getBoundingClientRect` returns a zero/degenerate rect (empty track, hidden zone) | the rect still maps via `toZoneBounds` (harmless); `withinSnapThreshold`/`dropZoneForPoint` return false/null — no spurious reveal or drop |
| F7 | a malformed pointer/rect fed to the mapping helpers | the mapping helpers are TOTAL: return `0`/`null`/coerced-`0` `ZoneBounds`, never throw, never a partial mutation |
| F8 | `pointerdown` on a non-resizable gutter (empty/minimized zone) | `startGutter` no-op via the controller's `isGutterResizable` gate; no gesture, no reveal, no cursor change beyond the CSS |
| F9 | `pointerdown` on an interactive control inside a `.pane-frame` (collapse toggle, minimize, tab, an input, a `select`/`textarea`, a WRAPPER `label`/`fieldset`, a `[contenteditable]` region, or a control's nested child — the HOST-3/ADV5 ancestor climb) | NOT hijacked into a drag; the provident click handler fires normally |
| F10 | an unknown gutter `data-zone` (e.g. a stray `'bogus'`) | `gutterSizeForPoint` → `0`; `startGutter` ignored; `resetGutter('bogus')` → `null` (H-2 — only an omitted zone falls back to the active gesture); never throws |
| F11 | the host is absent (no `SidebarPanes`, e.g. no-bridge plain-page mode) | `installShellPointers` is a no-op (no listener registration); the app still boots — never a throw |

## 5. Census

### 5.7 Property register (PBT)

This register follows the **`unit-u-shell-9b`/`unit-ujr1` §5.7** convention:
rows typed **P-IM** (input-model), **P-SM** (state-model), or **P-TP**
(transform) — NEVER F-rows, NEVER §4 F-rows. **This is a CODE-BEARING unit**
(the wiring introduces three NEW pure mapping helpers), so the register is
mandatory. It covers the **pure, node-testable surface the wiring routes the
pointer coordinates through** — the honestly-testable core of a DOM-wiring unit.
The actual DOM listener registration is NOT a property; it is asserted by the
source-pin of §2.8/§3 (never a register row). The existing controller/helper
seams are registered here as invariants (U-SHELL-4/5 specs carry no §5.7
register, so there is nothing to duplicate; only referenced in §6/§4).

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`gutterSizeForPoint` is total + deterministic + axis-consistent (the NEW pointer→gutter-seam mapping).** For the four `GUTTER_ZONES` it maps a pointer within the `.layout` rect to the axis-aligned candidate track size in px (`left: x−left`, `right: right−x`, `header: y−top`, `footer: bottom−y`); it returns the SAME value for equal inputs; an unknown zone or a non-finite rect/point field returns `0` — never throws, never NaN/negative-marker. | `strat:gutter-size-point` | ∀ generated `(layoutRect, zone, point)` over the four zones in-range: `gutterSizeForPoint` returns the pinned axis formula and is deterministic; ∀ unknown `zone` (e.g. `'stage'`, `'bogus'`) or `point`/`rect` with a non-finite field: returns `0` (never a throw, never `NaN`). Two deep-equal inputs yield deep-equal outputs. |
| `P-IM-2` | IM | **`toZoneBounds` is total + deterministic + faithful (the NEW DOMRect→controller-zone mapping).** It projects a `getBoundingClientRect()`-shaped rect onto the `ZoneBounds` surface, copying `left/top/right/bottom` as finite floats and preserving `zone`; a non-finite/missing field coerces to `0`; a malformed/`null` rect does not throw and still yields a typed `ZoneBounds`. | `strat:to-zone-bounds` | ∀ generated `(zone, rect)`: `toZoneBounds` returns a `ZoneBounds` with `zone` preserved and `left/top/right/bottom` deep-equal to the finite floats of `rect` (non-finite field → `0`); `toZoneBounds(zone, null|{} )` returns the 0-floored bound typed for `zone` without throwing; two deep-equal inputs yield deep-equal outputs. |
| `P-IM-3` | IM | **`clampGutterSize` is total + clamped to the zone bounds + idempotent.** A non-finite/NaN size clamps to the min; below-min clamps to min; above-max clamps to max; every output is finite and within `[min, max]`, never a collapsed/negative track. The side-zone bounds are `LAYOUT_ZONE_MIN/MAX` = `160/640`; the header/footer row bounds are `32/240` (U-SHELL-5 §2.5/§2.2). | `strat:gutter-clamp` | ∀ generated `(zone, size)` including `NaN`, ±`Infinity`, `undefined`, and values below `min`/above `max`: `clampGutterSize` returns a finite value in `[gutterBounds(zone).min, gutterBounds(zone).max]`; `clampGutterSize(zone, clampGutterSize(zone, x)) === clampGutterSize(zone, x)`; the side-zone interval is `[160,640]` and the row-zone interval `[32,240]`. |
| `P-SM-1` | SM | **`withinSnapThreshold` is a total, deterministic proximity predicate.** A point strictly inside the zone rect is true; a point exactly on the rect edge with `threshold === 0` is true (inclusive, U-SHELL-4 §3); a point outside by more than the threshold is false; `true` is monotone in `threshold` (a point accepted at `t` is accepted at every `t' > t`); a malformed point/zone yields `false`; a non-positive/non-finite threshold collapses to `t=0` (band-only points yield false; a strictly-inside point at the collapsed threshold yields true) — never throws (U-SHELL-4 §2.5 pin 2 / §4 F4). | `strat:snap-threshold` | ∀ generated `(point, zone, threshold)`: the predicate is deterministic; `point` strictly inside → `true`; on-edge with `threshold=0` → `true`; outside by `> threshold` → `false`; when `withinSnapThreshold(p, z, t)` then `withinSnapThreshold(p, z, t')` for all `t' ≥ t`; a malformed point/zone → `false`; a non-finite or `threshold ≤ 0` threshold collapses to `t=0` (a strictly-inside point at the collapsed threshold → `true`; a band-only point → `false`). |
| `P-SM-2` | SM | **`legalZonesForScope` is total + scope-legality faithful.** An `app-graph` scope legalizes EXACTLY the four pane zones (`left/right/header/footer`); an `operator` scope legalizes NONE of the app-graph zones (`[]`); an unknown scope → `[]` (fail-closed). No app-graph zone ever appears for an operator pane (U-SHELL-4 §2.2/Q9/§4 F3). | `strat:scope-legality` | ∀ generated scope ∈ `{'app-graph','operator', unknown}`: `legalZonesForScope('app-graph')` is the set `{left,right,header,footer}`; `legalZonesForScope('operator')` is `[]`; the result contains ONLY the four pane zones and is deterministic (two calls, equal order). |
| `P-TP-1` | TP | **`dropZoneForPoint` is a total, deterministic, geometry-first hit-test (the NEW drop-target mapper).** It returns the FIRST `ZoneBounds` whose rect contains the point within the snap threshold (`withinSnapThreshold`), and `null` when no zone matches; a malformed point, a non-array/empty `zones`, or a non-finite/non-positive threshold returns `null` — never throws. It is scope-agnostic (legality is the controller's `drop`'s job — U-SHELL-4 §2.5 pin 9 / H5). | `strat:drop-zone-hit` | ∀ generated `(point, zones, threshold)` with the point contained in the Nth zone's threshold-band: `dropZoneForPoint` returns `zones[N].zone` (the FIRST such); with no containing zone → `null`; with `zones = []`/non-array/malformed `point`/non-finite non-positive `threshold` → `null`; deterministic over deep-equal inputs. |
| `P-TP-2` | TP | **`zoneOrientation` is total + edge-derived (C12).** `header`/`footer` → `'horizontal'`; every other zone (incl. unknown) → `'vertical'` — never throws (U-SHELL-4 §2.4/F8). | `strat:zone-orientation` | ∀ generated `zone`: `zone=='header' || zone=='footer'` → `'horizontal'`; else (incl. `'left'`, `'right'`, `'stage'`, `'bogus'`, `null`, `undefined`) → `'vertical'`. |
| `P-TP-3` | TP | **`movePane` reorder/relocate is total + deterministic + a self-drop at the same position is a NO-OP.** A reorder/relocate adjusts the target zone's sibling `order`s 0..n−1 and re-numbers the vacated source zone on a relocate; an omitted/non-finite `order` appends; a `movePane` that leaves the pane in its current `(zone, order)` yields a layout equivalent to the input (F2 — the host's `commitPaneDrop` no-op gate); a missing pane id / unknown zone is a no-op returning the coerced base — never throws (U-SHELL-4 §2.5 pin 2, §4 F2/F7). | `strat:move-pane-noop-total` | ∀ generated `(layout, paneId, zone, order)`: `movePane` returns a `LayoutState` without throwing; two deep-equal calls are deep-equal; when `zone`/`order` equal the pane's current position → the pane's `(zone, order)` unchanged and the zone ordering unchanged; a relocate renumbers the source zone's remaining panes 0..-and-the-target 0..n−1; `movePane(layout, missingId|'', bogusZone, x)` → the coerced base, unchanged. |

**Class tally:** IM ×3, SM ×2, TP ×3 = **8 rows ≤ 8** ✔.

**Post-green reconciliation (P-TP-1):** the drop hit-test's **"no-match" (`→ null`) generator range** was **corrected** during the greens: a seeded miss point must clear **every** adjacent zone's snap band (it must be outside `withinSnapThreshold` for all `ZoneBounds` in `zones`, not merely outside one zone or the generated container), so a seeded draw cannot land inside an adjacent zone's threshold-band and be mis-asserted as `null`. The unit is otherwise GREEN (the implementer's `dropZoneForPoint` + the §2.8 shell pointer-wiring pass).

The rows are **NOT over-strength**: every proposition is directly observable
from the pinned new helpers (§2.2) and the already-exported pure seams of
`pane-gutter.ts`/`pane-drag.ts` (§2.1, no new behavior — the register only
restates the seams' existing totality/determinism/legality discipline as
checkable propositions, the same way the sibling registers restate their modules'
own invariants). No row invents a return field, demands a new export beyond the
three declared helpers, or reaches into `renderer.ts`/`sidebar-panes.ts`
internals. A correct implementation that implements `gutterSizeForPoint`/
`toZoneBounds`/`dropZoneForPoint` per §2.2 and keeps the existing seams intact
must pass every row; one that makes a mapping throw, produce NaN/negative sizes,
over-reveal, cross the scope boundary, or drop/reorder nondeterministically
would fail. The DOM listener registration is deliberately EXCLUDED from the
property language (it is not a pure transform) and is covered by the §2.8
source-pin assertion instead.

## 6. Cross-references

- `docs/specs/wave-2-open-decisions.md` **§D / W2-N7** — the integration gap
  this unit RESOLVED (Architect ruling option (a), 2026-09-13); §D now FIXED.
- `docs/specs/unit-u-shell-5-resizable-gutters.md` §2.1 (§2.5 pin 5 double-click
  reset), §2.3, §2.6 H-5, §5 census ("pointer capture + rect math").
- `docs/specs/unit-u-shell-4-drag-relocate.md` §2.1 Table B, §2.2/Q9 scope
  legality, §2.4 C12 (minimized stays drop target), §2.5 pins 2/8/9, §3.1,
  §4 F2/F3/F4/F8.
- `docs/specs/unit-u-shell-1-layout-zones.md` (zones + `LayoutState.zones[].size`,
  `LAYOUT_ZONE_MIN/MAX` = 160/640) — `unit-u-shell-3-collapsible-panes.md` (the
  pane frame + collapse controls).
- `src/renderer/index.html` (`.layout` grid, the `.gutter[data-axis]` CSS, the
  `[data-zone]`/`pane-frame` surfaces), `src/renderer/renderer.ts`
  (`installLayout`, `main()`, the `DOMContentLoaded` bootstrap),
  `src/renderer/sidebar-panes.ts` (host seams §2.1), `src/renderer/pane-gutter.ts`,
  `src/renderer/pane-drag.ts`.
- `docs/next-steps.md` W2-N7 row; AGENTS.md (the provident-framework UI
  constraint's shell-chrome exception, item Project-wide constraint).

## 7. Delimitation

This unit adds the **shell pointer-wiring pass** ONLY. It does NOT own the
layout model/persistence (U-SHELL-1), drag/reorder/relocate model or the
reveal/minimize model (U-SHELL-4), the gutter controller model (U-SHELL-5), or
theming (U-SHELL-2). It introduces no provident node, handler body, envelope,
or MCP surface, and it never re-renders or teardowns the graph itself (it only
feeds the existing seams, which own every write). It is **shell chrome** (the
one AGENTS.md exception), so raw DOM wiring + `setPointerCapture` +
`getBoundingClientRect` are permitted here and nowhere else in the renderer.
No `docs/skills/designing-pages.md` update is owed: the file does not exist,
and the wiring lands no page-design/layout change (the `.layout` grid, the
zone-container/C11/C12 mirror CSS, and the `.gutter` token styling are already
authored by the U-SHELL-1/4/5 passes); this unit only makes those gestures
reachable.

## 8. Open items

- **W2-N7 → RESOLVED + CODE LANDED under Architect ruling (a).** The fix — the
  shell wiring (`installShellPointers`, a NAMED export of `renderer.ts`) + the
  three new pure mapping helpers (`gutterSizeForPoint`/`toZoneBounds`/
  `dropZoneForPoint`) — completed its TestWriter-red → Implementer-green →
  adversarial (HOST-1..5) → re-audit (ADV1..5) → blind-greens → documentation-
  review cycle (RCA-1/2/3/4/6). Trio green (4527 pass / 58 skip; typecheck 0;
  build 0).
- **Test-strategy (resolved):** BOTH halves were delivered — the pure
  node-testable behavior (the mapping helpers + the controllers driven as the
  wiring invokes them + the extended-dom-shim adversarial drive) AND the §2.8
  source-pin of the listener registration. A green asserting only one half would
  be a review finding.
- **`setPointerCapture` fail-soft (F5):** the degrade is implemented as a
  fail-soft `try/catch` best-effort capture (§4 F5 pin). If a concrete
  capture-failure defect surfaces in the package it is a `docs/defects.md` +
  `docs/HANDOFF.md` item, never a host patch.
- No other open item; the double-click reset (W2-Q9 pin 5, ADV1) and the pinned
  gutter clamps (160/640, 32/240) are fixed by U-SHELL-5.
