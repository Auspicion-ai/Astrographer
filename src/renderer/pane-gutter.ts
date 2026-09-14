// src/renderer/pane-gutter.ts — Unit U-SHELL-5: the shell pointer gutter
// controller + the pure clamp/axis/bounds helpers (docs/specs/unit-u-shell-5-
// resizable-gutters.md §2.5 pins). The shell owns the drag mechanic (continuous
// pointer capture + getBoundingClientRect); this module owns the gesture state
// and commits exactly ONE `onCommit` write at gesture END (W2-Q7/§2.1), never a
// per-move stream. No DOM/Electron import (node-testable), mirroring
// `pane-drag.ts`.
//
// Pinned: side-column clamp bounds are the landed `LAYOUT_ZONE_MIN`/
// `LAYOUT_ZONE_MAX`; row (header/footer) bounds are this module's per-axis
// minimum/maximum (§2.5 pin 3). A commit never collapses a track (never
// negative/NaN). `stage.size` is never touched by a zone commit (§2.5 pin 4).
import {
  coerceLayout,
  defaultLayout,
  isLayoutZoneName,
  LAYOUT_ZONE_MAX,
  LAYOUT_ZONE_MIN,
  type LayoutState,
  type LayoutZoneName,
} from './layout-state.js'

/** The gutter orientation (§2.1): side columns are resized horizontally, the
 *  header/footer rows vertically. */
export type GutterAxis = 'columns' | 'rows'

/** A per-zone clamp window (§2.2, W2-Q9). */
export interface GutterBounds {
  min: number
  max: number
}

/** The shell gutter controller surface (§2.5 pin 2). */
export interface GutterController {
  start(zone: LayoutZoneName): void
  move(size: number): void
  end(): number | null
  cancel(): void
  reset(zone?: LayoutZoneName): number | null
  active(): LayoutZoneName | null
  preview(): number | null
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

/** The gutter orientation for a zone (§2.1). TOTAL: an unknown zone defaults to
 *  `'columns'` and never throws (F5). */
export function gutterAxis(zone: unknown): GutterAxis {
  return zone === 'header' || zone === 'footer' ? 'rows' : 'columns'
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

/** Clamp a requested zone size to its bounds (§2.2/W2-Q9). TOTAL: a
 *  non-finite/NaN value clamps to the minimum; a below-min value to the
 *  minimum; an above-max value to the maximum — never negative/NaN. An unknown
 *  zone never throws (F5). */
export function clampGutterSize(zone: LayoutZoneName, size: number): number {
  const { min, max } = gutterBounds(zone)
  if (typeof size !== 'number' || !Number.isFinite(size)) return min
  if (size < min) return min
  if (size > max) return max
  return size
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

/** The shell gutter controller (§2.5 pin 2). `start` gates on the caller's
 *  `isResizable` predicate (the §2.3 empty/minimized gate). `move` only records
 *  the clamped preview; `end` performs the ONE `onCommit` write for the gesture
 *  (never per-move — W2-Q7/§2.1). `cancel` reverts with no write (F2: at most
 *  one commit). `reset` (double-click, §2.5 pin 5) commits the registry default
 *  once. TOTAL: a malformed/unknown zone never throws. */
export function createGutterController(options: {
  onCommit: (zone: LayoutZoneName, size: number) => void
  isResizable?: (zone: LayoutZoneName) => boolean
  bounds?: (zone: LayoutZoneName) => GutterBounds
}): GutterController {
  const onCommit = typeof options?.onCommit === 'function' ? options.onCommit : () => {}
  const isResizableFn =
    typeof options?.isResizable === 'function' ? options.isResizable : () => true
  const boundsFn = typeof options?.bounds === 'function' ? options.bounds : gutterBounds

  let activeZone: LayoutZoneName | null = null
  let lastSize: number | null = null

  function resolveBounds(zone: LayoutZoneName): GutterBounds {
    try {
      const candidate = boundsFn(zone)
      if (
        candidate != null &&
        typeof candidate.min === 'number' &&
        typeof candidate.max === 'number' &&
        Number.isFinite(candidate.min) &&
        Number.isFinite(candidate.max) &&
        candidate.max >= candidate.min
      ) {
        return candidate
      }
    } catch {
      // a throwing/invalid bounds provider falls back to the pinned bounds
    }
    return gutterBounds(zone)
  }

  function clamp(zone: LayoutZoneName, size: number): number {
    const { min, max } = resolveBounds(zone)
    if (typeof size !== 'number' || !Number.isFinite(size)) return min
    if (size < min) return min
    if (size > max) return max
    return size
  }

  /** H-3 (adversarial) — the §2.3 resizability gate fails CLOSED: only an
   *  explicit `true` enables a gesture. A non-boolean falsy predicate return
   *  (`undefined`/`null`/`0`/`''`) refuses; a throwing predicate refuses. */
  function resizable(zone: LayoutZoneName): boolean {
    try {
      return isResizableFn(zone) === true
    } catch {
      return false
    }
  }

  function safeCommit(zone: LayoutZoneName, size: number): void {
    try {
      onCommit(zone, size)
    } catch {
      // a throwing consumer must never break the gesture
    }
  }

  /** Resolve the active gesture with ONE commit of its last valid size (the
   *  shared body of `end` + the H-4 takeover in `start`). No active gesture (or
   *  no recorded size) is a no-op returning null. */
  function finishGesture(): number | null {
    if (activeZone == null) return null
    const zone = activeZone
    const size = lastSize
    activeZone = null
    lastSize = null
    if (size == null) return null
    safeCommit(zone, size)
    return size
  }

  return {
    start(zone: LayoutZoneName): void {
      // H-4 (adversarial) — a `start` over an active gesture must NOT silently
      // discard the prior: explicitly resolve (end) it first, committing its
      // last valid size so no in-flight drag is lost.
      finishGesture()
      if (!isLayoutZoneName(zone)) return
      if (!resizable(zone)) return
      activeZone = zone
      lastSize = null
    },
    move(size: number): void {
      if (activeZone == null) return
      lastSize = clamp(activeZone, size)
    },
    end(): number | null {
      return finishGesture()
    },
    cancel(): void {
      activeZone = null
      lastSize = null
    },
    reset(zone?: LayoutZoneName): number | null {
      // H-2 (adversarial, F5) — ONLY an omitted (`undefined`) zone falls back to
      // the in-flight gesture. An explicit but invalid zone (e.g. `'bogus'`) is
      // IGNORED (returns null) and must NOT retarget onto the active gesture.
      const target = zone === undefined ? activeZone : zone
      if (!isLayoutZoneName(target)) return null
      // H-1 (adversarial) — `reset` (double-click) honours the SAME §2.3
      // empty/minimized resizability gate as `start`: a non-resizable zone
      // commits nothing (mirror `start`).
      if (!resizable(target)) return null
      const size = clamp(target, defaultLayout().zones[target].size)
      activeZone = null
      lastSize = null
      safeCommit(target, size)
      return size
    },
    active(): LayoutZoneName | null {
      return activeZone
    },
    preview(): number | null {
      return lastSize
    },
  }
}
