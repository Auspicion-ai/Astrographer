// src/renderer/pane-drag.ts — Unit U-SHELL-4: the shell pointer drag controller
// + the pure C4/C11/C12 model/proximity helpers (docs/specs/unit-u-shell-4-
// drag-relocate.md §2.5 pins). PURE where it can be: `movePane`/
// `legalZonesForScope`/`distanceToZoneBox`/`zoneOrientation`/
// `setZoneCollapsed` are total functions over the serialized `LayoutState`; the
// pointer `createDragController` owns the drag-time reveal state and commits
// ONE `onRevealChange` write per threshold crossing (W2-Q7/F4), never a
// per-frame stream. No DOM/Electron import (node-testable).
import {
  coerceLayout,
  isLayoutZoneName,
  panePlace,
  type LayoutState,
  type LayoutZoneName,
  type PaneLayoutEntry,
} from './layout-state.js'
// ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — §3 row 6: the proximity COMPARATOR is the
// vendored `relocate.withinProximity`. The fork keeps its own GEOMETRY (the
// pointer→box distance is the caller's measured scalar, §4 item (v)) and hands the
// comparator a number: the module only compares, and it repairs nothing.⟩
import { withinProximity } from '../shared/relocate.js'

/** The pane scope (mirrors `pane-registry.ts`'s `PaneScope`; redeclared here so
 *  this pure module does not import the registry). */
export type PaneScope = 'app-graph' | 'operator'

/** A pointer position in the shell's coordinate space. */
export interface DragPoint {
  x: number
  y: number
}

/** The screen bounds of a candidate drop zone (spec §2.5 pin 2). */
export interface ZoneBounds {
  zone: LayoutZoneName
  left: number
  top: number
  right: number
  bottom: number
}

/** A committed drop descriptor (spec §2.5 pin 2). ⟨`U-1a`: the position member is
 *  `index` — the same spelling move as `PaneLayoutEntry` (`order` → `index`); the
 *  pre-`U-1a` name was `order` (superseded, kept visible).⟩ */
export interface DropResult {
  paneId: string
  zone: LayoutZoneName
  index?: number
}

/** The shell drag controller surface (spec §2.5 pin 2). */
export interface DragController {
  start(paneId: string): void
  move(point: DragPoint, zones: readonly ZoneBounds[]): void
  reveal(): readonly LayoutZoneName[]
  drop(payload?: unknown): DropResult | null
  cancel(): void
}

/** The four pane zones, in the assembler's payload order (`U-1a` `ASM-U1a-1`:
 *  BY POSITION, `header`→`top` and `footer`→`bottom` in place). */
const PANE_ZONE_NAMES: readonly LayoutZoneName[] = ['left', 'right', 'top', 'bottom']

/** The legal drop zones for a pane scope (spec §2.2 / Q9). An `app-graph` pane
 *  may target all four zones; an `operator` pane stays in the operator layer
 *  (none of the app-graph zones — F3). TOTAL: an unknown scope → no zones. */
export function legalZonesForScope(scope: PaneScope): LayoutZoneName[] {
  return scope === 'app-graph' ? [...PANE_ZONE_NAMES] : []
}

/** ⟨Unit `U-3` `C-2` / `ASM-U3-2` — THE CALLER-SUPPLIED DECLARED PLACES.⟩ This
 *  module holds NO registry, so the *declared* half of the ONE law
 *  (`layout-state.ts` → `panePlace`) arrives as DATA from the caller. Every
 *  carrier a caller plausibly holds is accepted — a `Map`, a plain record, an
 *  array of `[id, place]` pairs, or a function — because the choice is the
 *  CALLER's (`ASM-U3-2`), and a carrier this module cannot read is IGNORED
 *  (answered `null`, never thrown), which is exactly `L2` §5's *"junk/absent
 *  declared-places carrier → the write unchanged"*. */
export type DeclaredPlaces =
  | ReadonlyMap<string, number>
  | Record<string, number>
  | ReadonlyArray<unknown>
  | ((id: string) => number | null | undefined)

/** The declared place one pane's carrier states, or `null` when the carrier
 *  states nothing usable. PRIVATE + TOTAL: a function carrier is CALLED inside a
 *  `try/catch`, a `get`-shaped carrier (a `Map`) is read through `.get`, an array
 *  is scanned for its `[id, place]` pair, a plain object is read through an
 *  OWN-property test only (never a prototype walk — a `__proto__`/`constructor`
 *  key can never answer a place), and anything else answers `null`. The answer is
 *  a FINITE number or `null`: a junk value is "not stated", never `NaN`. */
function declaredPlaceIn(declaredPlaces: DeclaredPlaces | undefined, paneId: string): number | null {
  if (declaredPlaces == null) return null
  const finite = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value)
  const carrier = declaredPlaces as unknown
  if (typeof carrier === 'function') {
    try {
      const answer = (carrier as (id: string) => unknown)(paneId)
      return finite(answer) ? answer : null
    } catch {
      return null
    }
  }
  if (typeof carrier === 'object' && carrier !== null) {
    const getter = (carrier as { get?: unknown }).get
    if (typeof getter === 'function') {
      try {
        const answer = (getter as (id: string) => unknown).call(carrier, paneId)
        return finite(answer) ? answer : null
      } catch {
        return null
      }
    }
  }
  if (Array.isArray(carrier)) {
    for (const pair of carrier) {
      if (!Array.isArray(pair) || pair.length < 2) continue
      if (pair[0] !== paneId) continue
      return finite(pair[1]) ? pair[1] : null
    }
    return null
  }
  if (typeof carrier === 'object' && carrier !== null) {
    if (!Object.prototype.hasOwnProperty.call(carrier, paneId)) return null
    const answer = (carrier as Record<string, unknown>)[paneId]
    return finite(answer) ? answer : null
  }
  return null
}

/** C4 — reorder within a zone (same `zone`) or relocate across zones (mutate
 *  `zone`), adjusting sibling `index`es. PURE (never mutates `layout`) and TOTAL
 *  (junk input never throws). A missing pane id / unknown zone is a no-op. An
 *  omitted/non-finite `index` appends at the end of the target zone.
 *
 *  ⟨Unit `U-3` `C-2` — THE FIFTH PARAMETER AND THE TWO SIBLING SORTS.⟩ The 5th
 *  parameter is the caller's DECLARED places (§ `DeclaredPlaces` above) and is
 *  OPTIONAL, so every landed caller compiles unchanged. Both sibling sorts read
 *  the ONE law (`panePlace`) instead of the superseded `a.index - b.index`
 *  (`RCA-8(c)`: kept visible, never re-introduced), which was a
 *  `NaN`-poisoned comparison the day absence became storable. The chain is
 *  EXPLICIT because two of the row's arms depend on it:
 *  `effective` (**1º** the pane's only placement word) `|| declared` (**2º** a
 *  stated-place TIE breaks at the DECLARED place) `|| seq` (**3º** registration
 *  order — the total-order floor). Every term is `NaN`-free by construction
 *  (`panePlace` answers finite numbers). */
export function movePane(
  layout: LayoutState,
  paneId: string,
  zone: LayoutZoneName,
  index?: number,
  declaredPlaces?: DeclaredPlaces,
): LayoutState {
  const base = coerceLayout(layout)
  if (typeof paneId !== 'string' || paneId === '') return base
  if (!isLayoutZoneName(zone)) return base
  const paneIndex = base.panes.findIndex((p) => p.id === paneId)
  if (paneIndex < 0) return base

  const panes: PaneLayoutEntry[] = base.panes.map((p) => ({ ...p }))
  const moved = panes[paneIndex]
  const originalZone = moved.zone

  // The ONE law, bound to THIS record's clones: `seq` is the pane's position in
  // the record (the reading's order is the caller's FLOOR, never its answer).
  const placeOf = (pane: PaneLayoutEntry): { declared: number; effective: number } =>
    panePlace({ entry: pane, defaultOrder: declaredPlaceIn(declaredPlaces, pane.id) ?? panes.indexOf(pane) })
  const order = (a: PaneLayoutEntry, b: PaneLayoutEntry): number => {
    const left = placeOf(a)
    const right = placeOf(b)
    return left.effective - right.effective || left.declared - right.declared || panes.indexOf(a) - panes.indexOf(b)
  }

  // The target zone's OTHER entries, in the law's order.
  const targetSiblings = panes.filter((p) => p.zone === zone && p.id !== paneId).sort(order)
  const insertIndex =
    typeof index === 'number' && Number.isFinite(index)
      ? Math.max(0, Math.min(Math.floor(index), targetSiblings.length))
      : targetSiblings.length

  // Window the moved pane into the target zone at the requested index and
  // renumber the zone 0..n-1.
  const ordered = [
    ...targetSiblings.slice(0, insertIndex),
    moved,
    ...targetSiblings.slice(insertIndex),
  ]
  for (let i = 0; i < ordered.length; i++) {
    ordered[i].zone = zone
    ordered[i].index = i
  }

  // A relocate also renumbers the vacated source zone (sibling order adjusts).
  if (originalZone !== zone) {
    const sourceSiblings = panes.filter((p) => p.zone === originalZone && p.id !== paneId).sort(order)
    for (let i = 0; i < sourceSiblings.length; i++) sourceSiblings[i].index = i
  }

  return { ...base, panes }
}

/** ⟨Unit `U-3` `C-2` — THE ACT'S ONE READING.⟩ The effective placement of ONE
 *  pane — `(zone, place)` — computed through §`panePlace`, plus the DECLARED
 *  place it was resolved from (the caller's carrier first, the record's seat
 *  second), so the act can compose the ONE comparison word (`zone` + `place`)
 *  without a second law. TOTAL/fail-soft (`L2` §5): a non-string/`''` pane id, an
 *  unknown id, a junk `layout` (coerced through `coerceLayout`) and any junk
 *  carrier answer `null` — never a throw. */
export function panePlacementOf(
  layout: unknown,
  paneId: unknown,
  declaredPlaces?: DeclaredPlaces,
): { zone: LayoutZoneName; place: number; declared: number } | null {
  if (typeof paneId !== 'string' || paneId === '') return null
  const base = coerceLayout(layout)
  const entry = base.panes.find((p) => p.id === paneId)
  if (entry === undefined) return null
  const declared =
    declaredPlaceIn(declaredPlaces, paneId) ?? panePlace({ entry, seq: base.panes.indexOf(entry) }).declared
  const place = panePlace({ entry, defaultOrder: declared }).effective
  return { zone: entry.zone, place, declared }
}

/** C4 (§3.1) — derive a 0-based insertion index from a drop `point` within a
 *  target zone rectangle. The zone's primary axis (vertical for `left`/`right`,
 *  horizontal for `top`/`bottom`) is divided into `slots` equal bands; a
 *  point in the Nth band inserts at index N (clamped to `slots - 1`). Used by
 *  the host drop path so a within-zone drag reorders to the intended position
 *  instead of always appending. PURE + TOTAL: a malformed point/zone or a
 *  non-positive/degenerate span yields 0, never a throw. */
export function insertionIndexForPoint(
  point: DragPoint,
  zone: ZoneBounds,
  slots: number,
): number {
  const count =
    typeof slots === 'number' && Number.isFinite(slots) ? Math.max(1, Math.floor(slots)) : 1
  if (point == null || zone == null) return 0
  const horizontal = zone.zone === 'top' || zone.zone === 'bottom'
  const min = horizontal ? zone.left : zone.top
  const max = horizontal ? zone.right : zone.bottom
  const p = horizontal ? point.x : point.y
  if (![p, min, max].every((v) => typeof v === 'number' && Number.isFinite(v))) return 0
  const span = max - min
  if (span <= 0) return 0
  const fraction = Math.max(0, Math.min((p - min) / span, 1))
  return Math.min(count - 1, Math.floor(fraction * count))
}

/** A getter-shaped bounding rect (`getBoundingClientRect()` projection) — the
 *  projection the shell wiring reads on each `pointermove`. Declared here so the
 *  three pure mapping helpers stay node-testable and independent of the DOM. */
export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

/** §2.2.2 (P-IM-2) — project a `getBoundingClientRect()`-shaped rect onto the
 *  controller `ZoneBounds` surface: copies `left`/`top`/`right`/`bottom` as
 *  finite floats (a non-finite/missing field coerces to `0`), preserving `zone`
 *  (§3 state 7 / F6). TOTAL + deterministic: a malformed/`null` rect yields the
 *  0-floored bound typed for `zone` without throwing. */
export function toZoneBounds(zone: unknown, rect: Rect | null): ZoneBounds {
  const z: LayoutZoneName = isLayoutZoneName(zone) ? zone : 'left'
  const zero: ZoneBounds = { zone: z, left: 0, top: 0, right: 0, bottom: 0 }
  if (rect == null || typeof rect !== 'object') return zero
  const src = rect as unknown as Record<string, unknown>
  for (const k of ['left', 'top', 'right', 'bottom'] as const) {
    const v = src[k]
    if (typeof v !== 'number' || !Number.isFinite(v)) return zero
  }
  return {
    zone: z,
    left: src.left as number,
    top: src.top as number,
    right: src.right as number,
    bottom: src.bottom as number,
  }
}

/** §2.2.3 (P-TP-1) — the drop-target hit-test. Geometry-first + scope-agnostic:
 *  returns the FIRST `ZoneBounds` whose rect matches the point within the snap
 *  threshold; `null` when no zone matches (F1). Legality is enforced downstream
 *  by the drag controller's `drop`. TOTAL: a malformed point, a non-array/empty
 *  `zones`, or a non-finite/non-positive `threshold` → `null`, never a throw. */
export function dropZoneForPoint(
  point: DragPoint,
  zones: readonly ZoneBounds[],
  threshold: number,
): LayoutZoneName | null {
  if (point == null || typeof point !== 'object' || Array.isArray(point)) return null
  if (!Array.isArray(zones) || zones.length === 0) return null
  if (typeof threshold !== 'number' || !Number.isFinite(threshold) || threshold <= 0) return null
  for (const zone of zones) {
    if (zone != null && measuresWithinSnapThreshold(point, zone, threshold)) return zone.zone
  }
  return null
}

/** ⟨`PD-UI-14` §4 item (v) — THE `CandidateFor.distance` MEASUREMENT SEAM.⟩ The
 *  pointer's EUCLIDEAN distance to the candidate zone's box, measured along each
 *  axis: exactly `0` when the point is INSIDE the box, else the hypotenuse of the
 *  two per-axis gaps (the corner distance). It is FINITE and NON-NEGATIVE by
 *  construction on any usable input, and `null` — never a `NaN` — where the input is
 *  unusable, which is the shape the module's usability class reads as "nothing
 *  within proximity". PURE + TOTAL: never throws. */
export function distanceToZoneBox(point: DragPoint, zone: ZoneBounds): number | null {
  if (point == null || zone == null) return null
  const values = [point.x, point.y, zone.left, zone.top, zone.right, zone.bottom]
  if (!values.every((v) => typeof v === 'number' && Number.isFinite(v))) return null
  // The per-axis gap to the CLOSED box: 0 inside, otherwise the distance to the
  // nearest edge on that axis.
  const dx = Math.max(zone.left - point.x, 0, point.x - zone.right)
  const dy = Math.max(zone.top - point.y, 0, point.y - zone.bottom)
  const distance = Math.hypot(dx, dy)
  return Number.isFinite(distance) ? distance : null
}

/** C11 — is the point on the candidate zone, within the snap threshold? The
 *  FORK owns the geometry (`distanceToZoneBox`: the pointer's distance to the box,
 *  `0` inside) and the VENDORED `relocate.withinProximity` owns the comparison
 *  (`distance <= threshold`), so exactly ONE authority decides proximity and the
 *  same scalar feeds the module's own candidate answer.
 *
 *  ⟨Unit `U-3` `C-3` / `ASM-U3-4` — THE REFUSAL MADE DISCRIMINATING.⟩ The
 *  superseded predicate refused on EITHER degenerate axis (`right <= left` ⇒
 *  `false`, then `bottom <= top` ⇒ `false`), which made an EMPTY/collapsed zone
 *  unreachable as a drop target: its track is `0px` on its ARRANGEMENT axis, so
 *  its box is degenerate on exactly that axis and a drag could only ever land in
 *  an occupied zone (`MEASURED FACT 2`). The guard now refuses IFF the box is
 *  degenerate on BOTH axes — the `0×0` phantom's own signature, which is the
 *  anti-vacuity tooth `E`(e2) keeps — and ADMITS a box degenerate on ONE axis (a
 *  `0px` track is a legitimate target along its edge line). `distanceToZoneBox`
 *  needs no byte: a zero-span box measures the per-axis gap to a CLOSED box
 *  correctly.
 *
 *  TOTAL: a malformed point/zone/threshold, a non-finite axis (the landed
 *  `typeof === 'number'` guards), or an unusable measured scalar answers `false`,
 *  never a throw (`§4 F6`). */
function measuresWithinSnapThreshold(point: DragPoint, zone: ZoneBounds, threshold: number): boolean {
  if (point == null || zone == null) return false
  const degenerateX =
    typeof zone.right === 'number' && typeof zone.left === 'number' && zone.right <= zone.left
  const degenerateY =
    typeof zone.bottom === 'number' && typeof zone.top === 'number' && zone.bottom <= zone.top
  // REFUSE only the box with NO span on ANY axis — a single zero-span axis is a
  // legitimate edge-line target (an empty/collapsed zone's `0px` track).
  if (degenerateX && degenerateY) return false
  const distance = distanceToZoneBox(point, zone)
  if (distance === null) return false
  return withinProximity(distance, threshold)
}

/** F8 — derive the tab-strip orientation from the zone edge: sidebars
 *  (`left`/`right`) are vertical; `top`/`bottom` are horizontal. TOTAL over the
 *  CLOSED zone domain (`ASM-U1a-2`: the parameter is narrowed from `unknown` so a
 *  missed rename fails to compile instead of silently reading `'vertical'`). */
export function zoneOrientation(zone: LayoutZoneName): 'vertical' | 'horizontal' {
  return zone === 'top' || zone === 'bottom' ? 'horizontal' : 'vertical'
}

/** C12 — set a zone's `collapsed` STATEMENT, RETAINING its `size` (the retained
 *  size is what an expand restores, and it costs ZERO writes). ⟨Unit `U-1b`
 *  (D-22 (1)) — the member is the foundation's `collapsed?: boolean`, the value
 *  is an EXPLICIT boolean the operator's word states, and it is **never deleted**
 *  (`ASM-U1b-1`): stating `false` on an EMPTY zone is the point (the operator's
 *  "expanded" overturning the derivation), so there is **no emptiness guard and
 *  no census parameter** — the pre-statement emptiness rule belonged to the
 *  required total boolean this replaces. `size` is
 *  untouched (`forking.md` §7.1 lines 480-481).⟩ PURE + TOTAL: a malformed
 *  layout coerces, and an unknown zone is a NO-OP returning the coerced value
 *  unchanged (zero writes). */
export function setZoneCollapsed(
  layout: LayoutState,
  zone: LayoutZoneName,
  collapsed: boolean,
): LayoutState {
  const base = coerceLayout(layout)
  if (!isLayoutZoneName(zone)) return base
  const zones = {
    ...base.zones,
    [zone]: { ...base.zones[zone], collapsed: collapsed === true },
  } as LayoutState['zones']
  return { ...base, zones }
}

/** ⟨Unit `U-2` `C-3` — THE ONE-LEAF PANE COLLAPSE WRITE.⟩ `setZoneCollapsed`'s
 *  exact shape model, one level down: replace ONE pane entry's `collapsed`
 *  member with the EXPLICIT boolean the caller states (`collapsed === true`) and
 *  write nothing else. The fork's pane record carries no figure
 *  (`PaneLayoutEntry` = `id`/`zone`/`index`/`collapsed`), so there is no size to
 *  retain and none to read — ONE member at ONE address. PURE + TOTAL: a
 *  malformed layout coerces FIRST, a non-string/empty pane id and an unknown id
 *  are both NO-OPs returning the coerced value (ZERO writes), and the member is
 *  an explicit boolean BOTH ways — never a delete (`§2 C-3`). */
export function setPaneCollapsed(
  layout: LayoutState,
  paneId: string,
  collapsed: boolean,
): LayoutState {
  const base = coerceLayout(layout)
  if (typeof paneId !== 'string' || paneId === '') return base
  const index = base.panes.findIndex((p) => p.id === paneId)
  if (index < 0) return base
  const panes = base.panes.map((p, i) => (i === index ? { ...p, collapsed: collapsed === true } : p))
  return { ...base, panes }
}

/** C4/C11 — the shell pointer drag controller. It tracks the active pane +
 *  the drag-time revealed zone set. `move` recomputes the scope-legal zones
 *  within the snap threshold and emits ONE `onRevealChange` write per
 *  threshold-crossing (never per frame — W2-Q7/F4). `drop` validates the
 *  payload + scope legality and returns the committed descriptor (or null).
 *  `cancel` re-hides with one final write. TOTAL: a malformed payload/zone
 *  never throws and never yields a partial mutation. */
export function createDragController(options: {
  threshold: number
  scopeOf: (paneId: string) => PaneScope | null
  onRevealChange: (revealed: LayoutZoneName[]) => void
}): DragController {
  const threshold =
    typeof options?.threshold === 'number' && Number.isFinite(options.threshold)
      ? Math.max(0, options.threshold)
      : 0
  const scopeOfFn = typeof options?.scopeOf === 'function' ? options.scopeOf : () => null
  const onChange = typeof options?.onRevealChange === 'function' ? options.onRevealChange : () => {}

  let activePaneId: string | null = null
  let revealed: LayoutZoneName[] = []

  function scopeOf(paneId: string): PaneScope | null {
    try {
      return scopeOfFn(paneId) ?? null
    } catch {
      return null
    }
  }

  function sameZones(a: readonly LayoutZoneName[], b: readonly LayoutZoneName[]): boolean {
    // H3 (adversarial) — compare the reveal as a SET, not element-wise: an
    // unchanged reveal set in a different order is ZERO managed writes.
    if (a.length !== b.length) return false
    const set = new Set(a)
    for (const zone of b) if (!set.has(zone)) return false
    return true
  }

  function setRevealed(next: LayoutZoneName[]): void {
    if (sameZones(revealed, next)) return
    revealed = next
    try {
      onChange([...revealed])
    } catch {
      // a throwing consumer must never break the drag gesture
    }
  }

  return {
    start(paneId: string): void {
      activePaneId = typeof paneId === 'string' && paneId !== '' ? paneId : null
      revealed = []
    },
    move(point: DragPoint, zones: readonly ZoneBounds[]): void {
      if (activePaneId == null) return
      const legal = legalZonesForScope(scopeOf(activePaneId) as PaneScope)
      const next: LayoutZoneName[] = []
      // H4 (adversarial) — a duplicated zone bound must not duplicate the
      // reveal entry: de-dupe so each revealed zone appears exactly once.
      const seen = new Set<LayoutZoneName>()
      if (Array.isArray(zones)) {
        for (const bounds of zones) {
          if (bounds == null || !legal.includes(bounds.zone)) continue
          if (seen.has(bounds.zone)) continue
          if (measuresWithinSnapThreshold(point, bounds, threshold)) {
            seen.add(bounds.zone)
            next.push(bounds.zone)
          }
        }
      }
      setRevealed(next)
    },
    reveal(): readonly LayoutZoneName[] {
      return [...revealed]
    },
    drop(payload?: unknown): DropResult | null {
      if (activePaneId == null) return null
      if (payload == null || typeof payload !== 'object' || Array.isArray(payload)) return null
      const p = payload as { paneId?: unknown; zone?: unknown; index?: unknown }
      if (typeof p.paneId !== 'string' || p.paneId === '') return null
      if (!isLayoutZoneName(p.zone)) return null
      if (!legalZonesForScope(scopeOf(p.paneId) as PaneScope).includes(p.zone)) return null
      const result: DropResult = { paneId: p.paneId, zone: p.zone }
      if (typeof p.index === 'number' && Number.isFinite(p.index)) result.index = p.index
      activePaneId = null
      revealed = []
      return result
    },
    cancel(): void {
      activePaneId = null
      setRevealed([])
    },
  }
}
