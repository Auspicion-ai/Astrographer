// src/renderer/pane-gutter.ts — Unit U-SHELL-5: the shell pointer gutter
// controller + the pure clamp/axis/bounds helpers (docs/specs/unit-u-shell-5-
// resizable-gutters.md §2.5 pins). No DOM/Electron import (node-testable),
// mirroring `pane-drag.ts`.
//
// ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — the ADOPTION (§3 row 3).⟩ The gesture
// state machine and the one-commit-per-gesture discipline are the vendored
// `gutter.ts` → `createResizeController` composed on the vendored
// `gesture-session.ts`; the local `createGutterController` is REMOVED
// (`P-IM-zone-repl-1` row-3 witness). What STAYS here is the fork's own POLICY,
// supplied as the controller's injected seams (§3 row 3's policy column):
// `gutterAxis` (`axisFor`), `gutterBounds` (`boundsFor`), `clampGutterSize`
// (`clampToBounds`' caller-side coercer + the reset/default read),
// `isGutterResizable` (the empty/minimized gate, read FAIL-CLOSED) and
// `setZoneSize` (the ONE write path's policy half). The H-4 takeover-commit and
// the reset policy stay fork-side too; `stage.size` is never touched by a zone
// commit.
//
// Pinned: side-column clamp bounds are the landed `LAYOUT_ZONE_MIN`/
// `LAYOUT_ZONE_MAX`; row (header/footer) bounds are this module's per-axis
// minimum/maximum (§2.5 pin 3). A commit never collapses a track (never
// negative/NaN). `stage.size` is never touched by a zone commit (§2.5 pin 4).
import { createResizeController, clampToBounds, type ResizeController } from '../shared/gutter.js'
import type { EventSource, GestureHandle } from '../shared/gesture-session.js'
import {
  coerceLayout,
  defaultLayout,
  isLayoutZoneName,
  LAYOUT_ZONE_MAX,
  LAYOUT_ZONE_MIN,
  type LayoutState,
  type LayoutZoneName,
} from './layout-state.js'

// ⟨§2.1 — the axis reading lives in its own module so the envelope authoring site
// (`pane-graph.ts`) can share it WITHOUT adding a fourth `./pane-gutter.js` stem
// collision to the vendored-set pin; it is RE-EXPORTED below, so this module's export
// surface is unchanged.⟩
import { gutterAxis, type GutterAxis } from './layout-zone-geometry.js'
export { gutterAxis, type GutterAxis }

/** A per-zone clamp window (§2.2, W2-Q9). */
export interface GutterBounds {
  min: number
  max: number
}

/** The four trimmed gutters (§2.1): the two side columns + the header/footer
 *  rows vs the main row. `stage`/`top-bar` are regions, not pane zones (W2-Q2),
 *  so they have no gutter. */
export const GUTTER_ZONES: readonly LayoutZoneName[] = ['left', 'right', 'header', 'footer']

/** The row (header/footer) clamp defaults (§2.5 pin 3 — W2-N2 leaves the exact
 *  per-axis row minimums to this unit; the side columns use the landed
 *  `LAYOUT_ZONE_MIN`/`LAYOUT_ZONE_MAX`). */
const GUTTER_ROW_MIN = 32
const GUTTER_ROW_MAX = 240

/** A getter-shaped bounding rect (`getBoundingClientRect()` projection) — the
 *  projection the shell wiring reads from a live rect. Declared structurally
 *  HERE so `pane-gutter.ts` stays independent of `pane-drag.ts` (§2.2: "no
 *  import from `pane-drag.ts` is added"). */
export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

/** A pointer position in the shell coordinate space (clientX/clientY). */
interface Point2D {
  x: number
  y: number
}

/** §2.2.1 (P-IM-1) — the pointer→gutter-seam mapping helper. Maps a pointer
 *  within the `.layout` bounding rect to a candidate gutter-seam track size in
 *  px, measured from the layout rect's leading edge along the zone's axis
 *  (§3 states 1/2): `left` → `point.x − rect.left`, `right` → `rect.right −
 *  point.x`, `header` → `point.y − rect.top`, `footer` → `rect.bottom −
 *  point.y` (F10). TOTAL + deterministic: an unknown zone, or a non-finite
 *  `point`/`layoutRect` field → `0` (never a throw, never NaN/negative). The
 *  wiring passes the result to `host.moveGutter`, whose controller clamps it to
 *  the zone's bounds (a collapsed track is never committed). */
export function gutterSizeForPoint(layoutRect: Rect, zone: LayoutZoneName, point: Point2D): number {
  if (zone !== 'left' && zone !== 'right' && zone !== 'header' && zone !== 'footer') return 0
  if (layoutRect == null || point == null) return 0
  const fields = [layoutRect.left, layoutRect.top, layoutRect.right, layoutRect.bottom, point.x, point.y]
  if (!fields.every((v) => typeof v === 'number' && Number.isFinite(v))) return 0
  switch (zone) {
    case 'left':
      return point.x - layoutRect.left
    case 'right':
      return layoutRect.right - point.x
    case 'header':
      return point.y - layoutRect.top
    default: // footer
      return layoutRect.bottom - point.y
  }
}

/** The clamp window for a zone (F5: an unknown zone falls back to the side
 *  bounds — finite, positive, min ≤ max). */
export function gutterBounds(zone: LayoutZoneName): GutterBounds {
  return gutterAxis(zone) === 'rows'
    ? { min: GUTTER_ROW_MIN, max: GUTTER_ROW_MAX }
    : { min: LAYOUT_ZONE_MIN, max: LAYOUT_ZONE_MAX }
}

/** ⟨`PD-UI-14` §4 item (i) — THE COERCER PROPERTY.⟩ A size reaching the vendored
 *  `clampToBounds` is ALWAYS a finite number: this is the fork's `min`-answering
 *  input COERCER in front of the seam (the module's `NaN` limb is unreachable by
 *  construction), never a second clamp authority. TOTAL. */
function finiteOrDefault(size: unknown, fallback: number): number {
  return typeof size === 'number' && Number.isFinite(size) ? size : fallback
}

/** Clamp a requested zone size to its bounds (§2.2/W2-Q9). TOTAL: a
 *  non-finite/NaN value clamps to the minimum; a below-min value to the
 *  minimum; an above-max value to the maximum — never negative/NaN. An unknown
 *  zone never throws (F5).
 *
 *  ⟨`PD-UI-14` §3 row 3 — the CLAMP is the vendored `clampToBounds`; what stays
 *  fork-side is the §2.5 pin-3 WINDOW (`gutterBounds`) and the §4 item (i)
 *  coercer in front of the seam (the fork answers `min` for an unusable input,
 *  which is the property this function's callers rely on).⟩ */
export function clampGutterSize(zone: LayoutZoneName, size: number): number {
  const window = gutterBounds(zone)
  const clamped = clampToBounds(finiteOrDefault(size, window.min), window)
  return Number.isFinite(clamped) ? clamped : window.min
}

/** Apply a clamped zone size to the serialized layout (§2.2). PURE: the input
 *  is never mutated; only the target zone's `size` changes (`stage`,`panes`,
 *  the other zones are untouched — §2.5 pin 4). TOTAL: an unknown zone is a
 *  no-op returning the coerced layout (F5). */
export function setZoneSize(layout: LayoutState, zone: LayoutZoneName, size: number): LayoutState {
  const base = coerceLayout(layout)
  if (!isLayoutZoneName(zone)) return base
  const zones = {
    ...base.zones,
    [zone]: { ...base.zones[zone], size: clampGutterSize(zone, size) },
  } as LayoutState['zones']
  return { ...base, zones }
}

/** C11/C12 (§2.3) — a zone has a gutter only when it is neither empty (its
 *  track is collapsed) nor minimized (it keeps a fixed tab-strip track until
 *  expanded). TOTAL. */
export function isGutterResizable(empty: boolean, minimized: boolean): boolean {
  return empty !== true && minimized !== true
}

/** The fork's ONE gutter composition (`§3` row 3), built on the vendored
 *  `createResizeController` with the vendored session injected by the caller (the
 *  shell's gesture wiring). The returned controller is the module's own surface —
 *  `attach`/`detach`/`reset`/`stats`/`detached` — and this factory adds NO second
 *  lifecycle of its own.
 *
 *  The seams, each the fork's own policy: `axisFor` ← `gutterAxis`; `boundsFor` ←
 *  `gutterBounds`; `defaultSizeFor` ← the pinned registry default for the zone
 *  (`clampGutterSize`, the same coercer the double-click reset uses);
 *  `isResizable` ← the FAIL-CLOSED gate (`isGutterResizable`'s reading compared with
 *  `=== true`, so a non-`true` answer refuses under the module's truthiness rule too
 *  — `C-1`); `sizeFor` ← the FORK's per-move size (`pendingSizeFor`, the geometry the
 *  caller computed; the module-built handle's `value` is the fallback shape); `commit`
 *  ← `onCommit`, the ONE write path, reached at most once per committing terminal and
 *  the ONLY seam that carries the write (`§3.4(a)/(d)`; the session's own `commit` is
 *  guard-only).
 *
 *  The `zoneOf` seam is the fork's own identity policy: which zone a controller
 *  element belongs to (the shell's wiring supplies it), and a `null` answer refuses
 *  the gesture rather than guessing. TOTAL: an unusable seam refuses, never throws. */
export function createGutterResizeController(options: {
  session: unknown
  zoneOf: (element: unknown) => LayoutZoneName | null
  isResizable: (zone: LayoutZoneName) => unknown
  commit: (zone: LayoutZoneName, size: number) => void
  defaultSizeFor?: (zone: LayoutZoneName) => number
  /** ⟨§3 row 3's `sizeFor` seam — THE FORK'S VALUE CHANNEL. The module reads the value at
   *  the committing terminal; the fork computes it (§3 row 3: "`sizeFor` ← `gutterSizeForPoint`'s
   *  geometry (pointer → size, computed by the fork, never by the module)"). A host that holds
   *  the per-move size it computed supplies it HERE; the module-built gesture handle's own
   *  `value` remains the fallback for a fork that pushes the value onto the handle instead. ⟩ */
  pendingSizeFor?: (zone: LayoutZoneName) => unknown
}): ResizeController {
  const zoneOf = (element: unknown): LayoutZoneName | null => {
    try {
      const zone = options.zoneOf(element)
      return isLayoutZoneName(zone) ? zone : null
    } catch {
      return null
    }
  }
  const defaultFor = (zone: LayoutZoneName): number => {
    const provided = options.defaultSizeFor?.(zone)
    return clampGutterSize(zone, finiteOrDefault(provided, defaultLayout().zones[zone].size))
  }
  return createResizeController({
    session: options.session,
    axisFor: (element: unknown): unknown => {
      const zone = zoneOf(element)
      return zone === null ? undefined : gutterAxis(zone)
    },
    boundsFor: (element: unknown): unknown => {
      const zone = zoneOf(element)
      return zone === null ? undefined : gutterBounds(zone)
    },
    defaultSizeFor: (element: unknown): unknown => {
      const zone = zoneOf(element)
      return zone === null ? undefined : defaultFor(zone)
    },
    // C-1 / §3 row 3's policy column — FAIL-CLOSED: only an explicit `true` enables
    // the gesture, and a throw is a refusal rather than a propagated error.
    isResizable: (element: unknown): boolean => {
      const zone = zoneOf(element)
      if (zone === null) return false
      try {
        return options.isResizable(zone) === true
      } catch {
        return false
      }
    },
    // ⟨§3 row 3's `sizeFor` seam — THE FORK'S VALUE CHANNEL, in its two declared forms.⟩
    // The FORK's own computed per-move size (`pendingSizeFor`, the geometry the caller
    // derived from the pointer) is preferred when it answers a number; otherwise the
    // module-built gesture handle's `value` — the channel a caller that pushes the size
    // onto the handle itself uses. Either way the FORK produces the magnitude and the
    // MODULE alone narrows it into the caller's pair.
    sizeFor: (element: unknown, gesture: GestureHandle): unknown => {
      const zone = zoneOf(element)
      if (zone !== null && typeof options.pendingSizeFor === 'function') {
        try {
          const pending = options.pendingSizeFor(zone)
          if (typeof pending === 'number' && Number.isFinite(pending)) return pending
        } catch {
          // fail-soft — an unusable value seam falls through to the handle's own value
        }
      }
      try {
        return (gesture as { value?: unknown }).value
      } catch {
        return undefined
      }
    },
    commit: (gesture: GestureHandle, value: number): void => {
      const zone = zoneOf((gesture as { element?: unknown }).element)
      if (zone === null) return
      options.commit(zone, clampGutterSize(zone, value))
    },
  })
}

/** The session a gutter gesture runs on — the vendored `gesture-session` instance
 *  injected by the shell wiring. Re-exported as a TYPE only so a consumer names the
 *  same shape without a second declaration. */
export type GutterGestureSource = EventSource
