// tests/unit-u-shell-shell-wiring.test.ts — Unit U-SHELL-N7 (W2-N7): the shell
// pointer-wiring integration pass. TestWriter RED set written from
// docs/specs/unit-u-shell-shell-wiring.md §2 (contract — the 3 NEW pure mapping
// helpers + §2.8 the source-pinned listener surface), §3 (valid-path states),
// §4 (fail-states), §5.7 (the PBT register — 8 rows, deterministic mulberry32),
// §2.8/§8 (the test strategy: BOTH the pure node-testable half AND the
// source-pin of the DOM listener registration are MANDATORY for a green).
//
// RED / GREEN-on-arrival inventory:
//
//   THE THREE NEW PURE HELPERS (do NOT exist yet — RED):
//     - P-IM-1  `gutterSizeForPoint`  (NEW, to be added to pane-gutter.ts §2.2.1)
//     - P-IM-2  `toZoneBounds`        (NEW, to be added to pane-drag.ts  §2.2.2)
//     - P-TP-1  `dropZoneForPoint`    (NEW, to be added to pane-drag.ts  §2.2.3)
//
//   THE SOURCE-PINNED LISTENER LAYER (§2.8 — the wiring does NOT exist yet):
//     the four pointer `addEventListener('pointerdown|move|up|cancel` literals,
//     `setPointerCapture`, `getBoundingClientRect`, the mapping-helper calls,
//     and a CALLER for every §2.1 host seam (startGutter/moveGutter/endGutter/
//     cancelGutter/resetGutter + startPaneDrag/movePaneDrag/commitPaneDrop/
//     cancelPaneDrag). All RED.
//
//   EXISTING PURE SEAMS (GREEN-on-arrival — pane-gutter.ts / pane-drag.ts §2.1,
//     registered here as PBT invariants + driven exactly as the wiring invokes
//     them):
//     clampGutterSize / gutterBounds / gutterAxis / setZoneSize /
//     isGutterResizable / createGutterController; movePane /
//     withinSnapThreshold / zoneOrientation / legalZonesForScope /
//     insertionIndexForPoint / createDragController.
//
// The real DOM events cannot be node-driven (dom-shim lacks
// getBoundingClientRect/setPointerCapture/PointerEvent — §2.7/§2.8), so the
// listener REGISTRATION is asserted statically by source-pin (the
// unit-u-shell-8 / unit-ujr1 house convention) and the BEHAVIOR is driven
// through the pure mapping helpers + the existing controllers/seams.
//
// Deterministic pinned seed 0x55E11E77 (the W2-N7 shell-wiring unit), ≤100
// attempts/row, ≤400 total (8 rows × 40 = 320), stop-after-5, mulberry32.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  defaultLayout,
  coerceLayout,
  LAYOUT_ZONE_MIN,
  LAYOUT_ZONE_MAX,
  type LayoutState,
  type LayoutZoneName,
} from '../src/renderer/layout-state.js'

// ===========================================================================
// §5.7 — the deterministic PBT harness (deterministic mulberry32, pinned seed,
// ≤100/row, ≤400 total, stop-after-5). 8 rows × 40 = 320 ≤ 400.
// ===========================================================================
const PBT_SEED = 0x55e11e77 // this unit's pinned seed (the sibling "SHELL" family)
const PBT_ATTEMPTS = 40 // ≤100/row → 8 × 40 = 320 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function int(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}
function deepEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
): { row: string; strategyId: string; held: boolean; counterexamples: string[]; attempts: number } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: PBT_ATTEMPTS }
}

// ---------------------------------------------------------------------------
// The pure surface — dynamic-module loaders (the U-SHELL-5 `loadGutterModule`
// convention) + `requireHelper`, so a MISSING new helper fails each spec test
// INDIVIDUALLY with a descriptive RED message instead of crashing the file.
// ---------------------------------------------------------------------------
type Rect = { left: number; top: number; right: number; bottom: number }
interface DragPoint { x: number; y: number }
interface ZoneBounds { zone: LayoutZoneName; left: number; top: number; right: number; bottom: number }

interface GutterModule {
  GUTTER_ZONES: readonly LayoutZoneName[]
  gutterAxis(zone: unknown): 'columns' | 'rows'
  gutterBounds(zone: LayoutZoneName): { min: number; max: number }
  clampGutterSize(zone: LayoutZoneName, size: number): number
  setZoneSize(layout: LayoutState, zone: LayoutZoneName, size: number): LayoutState
  isGutterResizable(empty: boolean, minimized: boolean): boolean
  gutterSizeForPoint?: (layoutRect: Rect, zone: unknown, point: DragPoint) => number
}
interface DragModule {
  movePane(layout: LayoutState, paneId: string, zone: LayoutZoneName, order?: number): LayoutState
  withinSnapThreshold(point: DragPoint, zone: ZoneBounds, threshold: number): boolean
  zoneOrientation(zone: unknown): 'vertical' | 'horizontal'
  legalZonesForScope(scope: string): LayoutZoneName[]
  insertionIndexForPoint(point: DragPoint, zone: ZoneBounds, slots: number): number
  toZoneBounds?: (zone: unknown, rect: Rect | null) => ZoneBounds
  dropZoneForPoint?: (point: DragPoint, zones: readonly ZoneBounds[], threshold: number) => LayoutZoneName | null
  createDragController(options: {
    threshold: number
    scopeOf: (paneId: string) => 'app-graph' | 'operator' | null
    onRevealChange: (revealed: LayoutZoneName[]) => void
  }): DragControllerLike
}
interface DragControllerLike {
  start(paneId: string): void
  move(point: DragPoint, zones: readonly ZoneBounds[]): void
  reveal(): readonly LayoutZoneName[]
  drop(payload?: unknown): DragResultLike | null
  cancel(): void
}
interface DragResultLike { paneId: string; zone: LayoutZoneName; order?: number }

async function loadGutter(): Promise<GutterModule> {
  try {
    return (await import('../src/renderer/pane-gutter.js')) as unknown as GutterModule
  } catch (e) {
    throw new Error('src/renderer/pane-gutter.ts not implemented (U-SHELL-N7 RED)', { cause: e })
  }
}
async function loadDrag(): Promise<DragModule> {
  try {
    return (await import('../src/renderer/pane-drag.js')) as unknown as DragModule
  } catch (e) {
    throw new Error('src/renderer/pane-drag.ts not implemented (U-SHELL-N7 RED)', { cause: e })
  }
}
/** Require a NEWly-specified mapping helper and throw a descriptive RED error
 *  naming the exact missing seam when the Implementer has not landed it yet. */
function requireHelper<T>(mod: Record<string, unknown>, name: string, where: string): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `U-SHELL-N7 RED [${name}]: the NEW §2.2 ${where} helper "${name}" is not implemented — the source-pin wiring (${name}(...)) cannot exist without it`,
    )
  }
  return fn as T
}

// ---------------------------------------------------------------------------
// §3/§4 — the existing pure seams, driven exactly as the wiring invokes them.
// ---------------------------------------------------------------------------
async function gutterControllerHarness(empty?: boolean, minimized?: boolean, onCommit?: (z: LayoutZoneName, s: number) => void) {
  const g = await loadGutter()
  const commits: Array<{ zone: LayoutZoneName; size: number }> = []
  const c = g.createGutterController({
    onCommit: onCommit ?? ((z, s) => commits.push({ zone: z, size: s })),
    isResizable: () => g.isGutterResizable(empty === true, minimized === true),
  })
  return { g, c, commits }
}

function layoutWithPanes(layout: Partial<LayoutState['panes'][number]> = {}): LayoutState {
  return coerceLayout({
    version: 1,
    panes: [
      { id: 'a', zone: 'left', order: 0, collapsed: false },
      { id: 'b', zone: 'left', order: 1, collapsed: false },
      { id: 'c', zone: 'right', order: 0, collapsed: false },
    ],
    zones: { left: { size: 300, minimized: false }, right: { size: 220, minimized: false } },
    ...layout,
  })
}

// ===========================================================================
// §5.7 the PBT register (8 rows — deterministic mulberry32, pinned seed).
// The 3 rows that ride the NEW helpers (P-IM-1 / P-IM-2 / P-TP-1) are RED; the
// 5 rows on the EXISTING pure seams (P-IM-3 / P-SM-1 / P-SM-2 / P-TP-2 / P-TP-3)
// are GREEN-on-arrival.
// ===========================================================================
describe('U-SHELL-N7 §5.7 the PBT register (deterministic mulberry32, pinned seed)', () => {
  const ZONES: readonly ('left' | 'right' | 'header' | 'footer')[] = ['left', 'right', 'header', 'footer']

  it('P-IM-1 [strat:gutter-size-point] `gutterSizeForPoint` is total + deterministic + axis-consistent (NEW)', async () => {
    const g = await loadGutter()
    const helper = requireHelper<(r: Rect, z: unknown, p: DragPoint) => number>(g as unknown as Record<string, unknown>, 'gutterSizeForPoint', 'pane-gutter.ts')
    const rep = runProperty('P-IM-1', 'strat:gutter-size-point', (_i, rng) => {
      const rect: Rect = {
        left: int(rng, 0, 300),
        top: int(rng, 0, 300),
        right: int(rng, 300, 900),
        bottom: int(rng, 300, 900),
      }
      const zone = pick(rng, ZONES)
      const point: DragPoint = {
        x: int(rng, rect.left, rect.right),
        y: int(rng, rect.top, rect.bottom),
      }
      const expected =
        zone === 'left' ? point.x - rect.left
        : zone === 'right' ? rect.right - point.x
        : zone === 'header' ? point.y - rect.top
        : rect.bottom - point.y
      const v = helper(rect, zone, point)
      if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return `non-finite/negative result: zone=${zone} v=${v}`
      if (v !== expected) return `formula mismatch: zone=${zone} got=${v} expected=${expected}`
      // determinism — two deep-equal inputs yield deep-equal outputs
      if (helper(rect, zone, point) !== v) return 'not deterministic for deep-equal inputs'
      // unknown zone → 0
      const bogus = pick(rng, ['stage', 'top-bar', 'bogus', '', ' LEFT '])
      const u0 = helper(rect, bogus as never, point)
      if (u0 !== 0) return `unknown zone not 0: zone=${bogus} got=${u0}`
      // non-finite rect/point field → 0 (never NaN/negative)
      const badPoint = pick(rng, [{ x: NaN, y: 1 }, { x: 1, y: -Infinity }, null, 'px'])
      const n0 = helper(rect, zone, badPoint as never)
      if (n0 !== 0 && !(typeof n0 === 'number' && Number.isNaN(n0))) {
        // the pin is: non-finite point → 0. A NaN return is a violation.
        if (typeof n0 === 'number' && Number.isNaN(n0)) return `non-finite point yielded NaN (must be 0)`
        if (n0 !== 0) return `non-finite point yielded ${n0} (must be 0)`
      }
      const badRect = { ...rect, right: Infinity }
      const n1 = helper(badRect, zone, point)
      if (typeof n1 === 'number' && !Number.isFinite(n1)) return 'non-finite rect field yielded a non-finite result'
      if (typeof n1 === 'number' && Number.isNaN(n1)) return 'non-finite rect field yielded NaN (must be 0)'
      if (n1 !== 0 && n1 !== expected) return 'non-finite rect field did not degrade to 0'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-IM-2 [strat:to-zone-bounds] `toZoneBounds` is total + deterministic + faithful (NEW)', async () => {
    const d = await loadDrag()
    const helper = requireHelper<(z: unknown, r: Rect | null) => ZoneBounds>(d as unknown as Record<string, unknown>, 'toZoneBounds', 'pane-drag.ts')
    const rep = runProperty('P-IM-2', 'strat:to-zone-bounds', (_i, rng) => {
      const zone = pick(rng, ZONES)
      const finite: Rect = {
        left: int(rng, 0, 500),
        top: int(rng, 0, 500),
        right: int(rng, 500, 1200),
        bottom: int(rng, 500, 1200),
      }
      const z = helper(zone, finite)
      if (z == null || z.zone !== zone || (z as unknown) === null) return `zone not preserved: ${JSON.stringify(z)}`
      for (const k of ['left', 'top', 'right', 'bottom'] as const) {
        if (z[k] !== finite[k]) return `edge not copied faithfully: ${k} got=${z[k]} expected=${finite[k]}`
        if (typeof z[k] !== 'number' || !Number.isFinite(z[k])) return `${k} not a finite float: ${z[k]}`
      }
      // determinism
      if (!deepEq(z, helper(zone, finite))) return 'not deterministic over deep-equal inputs'
      // non-finite / missing field coerces to 0
      const badRect = pick(rng, [null, undefined, {}, { left: NaN }, { left: 1, top: Infinity }])
      const zj = helper(zone, badRect as never)
      for (const k of ['left', 'top', 'right', 'bottom'] as const) {
        if (zj[k] !== 0) return `malformed rect field did not coerce to 0: ${k}=${zj[k]}`
      }
      if (zj.zone !== zone) return 'zone not preserved on a malformed rect'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-IM-3 [strat:gutter-clamp] `clampGutterSize` total + clamped + idempotent (EXISTING — green-on-arrival)', async () => {
    const g = await loadGutter()
    const rep = runProperty('P-IM-3', 'strat:gutter-clamp', (_i, rng) => {
      const zone = pick(rng, ZONES)
      const { min, max } = g.gutterBounds(zone)
      if (zone === 'left' || zone === 'right') {
        if (min !== LAYOUT_ZONE_MIN || max !== LAYOUT_ZONE_MAX) return `side bounds wrong: [${min},${max}]`
      } else {
        if (min !== 32 || max !== 240) return `row bounds wrong: [${min},${max}]`
      }
      const size = pick(rng, [
        NaN, Infinity, -Infinity, undefined, null, 'x',
        int(rng, -200, min - 1), int(rng, max + 1, max + 500),
        int(rng, min, max),
      ])
      const v = g.clampGutterSize(zone, size as never)
      if (typeof v !== 'number' || !Number.isFinite(v)) return `non-finite output: v=${v}`
      if (v < min || v > max) return `out of [min,max]: v=${v} bounds=[${min},${max}]`
      if (v < 0) return `negative clamp output: ${v}`
      if (g.clampGutterSize(zone, v) !== v) return 'not idempotent'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-SM-1 [strat:snap-threshold] `withinSnapThreshold` total + monotone-in-threshold (EXISTING — green-on-arrival)', async () => {
    const d = await loadDrag()
    const rep = runProperty('P-SM-1', 'strat:snap-threshold', (_i, rng) => {
      const zone: ZoneBounds = {
        zone: 'left',
        left: int(rng, 0, 100),
        top: int(rng, 0, 100),
        right: int(rng, 200, 300),
        bottom: int(rng, 200, 300),
      }
      const t = int(rng, 0, 20)
      // strictly inside → true
      const inside: DragPoint = { x: zone.left + 1, y: zone.top + 1 }
      if (d.withinSnapThreshold(inside, zone, t) !== true) return `strictly-inside point should be true (t=${t})`
      // on-edge with threshold=0 → true (inclusive)
      const onEdge: DragPoint = { x: zone.left, y: zone.top }
      if (d.withinSnapThreshold(onEdge, zone, 0) !== true) return 'on-edge with t=0 should be true (inclusive)'
      // outside by more than threshold → false
      const outside: DragPoint = { x: zone.right + t + 1, y: zone.top }
      if (d.withinSnapThreshold(outside, zone, t) !== false) return `outside-by->t should be false (t=${t})`
      // monotone in threshold
      if (d.withinSnapThreshold({ x: zone.right + 3, y: zone.top }, zone, 4) === true &&
          d.withinSnapThreshold({ x: zone.right + 3, y: zone.top }, zone, 5) !== true) return 'not monotone in threshold'
      // malformed → false
      for (const m of [null, undefined, {}, { x: NaN, y: 1 }, 'point', 42]) {
        if (d.withinSnapThreshold(m as never, zone, t) !== false) return `malformed point should be false: ${JSON.stringify(m)}`
      }
      for (const m of [null, undefined, { left: NaN }, 7]) {
        if (d.withinSnapThreshold(inside, m as never, t) !== false) return `malformed zone should be false: ${JSON.stringify(m)}`
      }
      // a band-outside point (one px beyond the rect) is only reachable via the
      // threshold — a non-finite / non-positive threshold collapses the band to
      // nothing, so it must be false. This is exactly the spec §5.7 P-SM-1 pin
      // ("non-positive/non-finite threshold yields false") AND the landing
      // behavior of the existing seam (pane-drag.ts collapses `t` to 0).
      const band: DragPoint = { x: zone.right + 1, y: zone.top + 1 }
      for (const badT of [NaN, Infinity, -Infinity, 0, -1]) {
        if (d.withinSnapThreshold(band, zone, badT) !== false) return `non-finite/non-positive threshold(${badT}) should yield false for a band-only point`
      }
      // the SAME band point IS a hit once the (finite positive) threshold covers it (monotone + inclusive)
      if (t >= 2) {
        if (d.withinSnapThreshold({ x: zone.right + 1, y: zone.top + 1 }, zone, t) !== true) return `covered band point should be true (t=${t})`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-SM-2 [strat:scope-legality] `legalZonesForScope` total + scope-legality faithful (EXISTING — green-on-arrival)', async () => {
    const d = await loadDrag()
    const rep = runProperty('P-SM-2', 'strat:scope-legality', (_i, rng) => {
      const scope = pick(rng, ['app-graph', 'operator', 'unknown', null, 7, undefined])
      const res = d.legalZonesForScope(scope as never)
      if (!Array.isArray(res)) return 'non-array result'
      if (scope === 'app-graph') {
        const expected = ['left', 'right', 'header', 'footer']
        if (res.length !== 4 || expected.some((z) => !res.includes(z as LayoutZoneName))) return `app-graph must be exactly the 4 zones: ${JSON.stringify(res)}`
        expect(res.every((z) => ZONES.includes(z as never))).toBe(true)
        if (!deepEq(res, d.legalZonesForScope('app-graph'))) return 'app-graph not deterministic (equal order on repeat)'
      } else if (scope === 'operator') {
        if (res.length !== 0) return `operator must legalize NO app-graph zone: ${JSON.stringify(res)}`
      } else {
        if (res.length !== 0) return `unknown scope must be fail-closed ([]): ${JSON.stringify(res)}`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-1 [strat:drop-zone-hit] `dropZoneForPoint` total + deterministic + geometry-first (NEW)', async () => {
    const d = await loadDrag()
    const helper = requireHelper<(p: DragPoint, z: readonly ZoneBounds[], t: number) => LayoutZoneName | null>(d as unknown as Record<string, unknown>, 'dropZoneForPoint', 'pane-drag.ts')
    const rep = runProperty('P-TP-1', 'strat:drop-zone-hit', (_i, rng) => {
      // three well-separated zones so a point strictly inside the Nth is never
      // inside an earlier zone's snap band (geometry-first = FIRST matching zone)
      const zones: readonly ZoneBounds[] = [
        { zone: 'left', left: 0, top: 0, right: 100, bottom: 200 },
        { zone: 'right', left: 600, top: 0, right: 700, bottom: 200 },
        { zone: 'header', left: 0, top: 600, right: 100, bottom: 800 },
      ]
      const t = int(rng, 1, 10)
      const target = pick(rng, zones as unknown as ZoneBounds[])
      const point: DragPoint = {
        x: int(rng, target.left + 2, target.right - 2),
        y: int(rng, target.top + 2, target.bottom - 2),
      }
      const hit = helper(point, zones, t)
      if (hit !== target.zone) return `expected FIRST zone ${target.zone}, got ${hit}`
      if (!deepEq(hit, helper(point, zones, t))) return 'not deterministic'
      // no containing zone → null. The miss point is drawn from an INTER-ZONE
      // GAP that GENUINELY clears every zone's snap band under any t∈[1,10] and
      // any seed (a TEST defect fixed: the old x∈[500,599] / y∈[0,1000] range
      // overlapped the right zone's snap band [600−t,700+t] × [−t,200+t], so a
      // seeded draw like (595,74) at t=5 returned `right`, not `null`). The three
      // zones: left x[0,100] y[0,200], right x[600,700] y[0,200], header
      // x[0,100] y[600,800]. The gap point x∈[300,400] is ≥190px clear of every
      // zone's banded x-edge (left/header right ≤100+t≤110, right left
      // ≥600−t≥590) and y∈[400,500] is ≥90px clear of the banded y-edges (lower
      // bands bottom ≤210, header top ≥590) — margins ≫ t, so the point never
      // falls in ANY band regardless of draw or t.
      const miss = helper({ x: int(rng, 300, 400), y: int(rng, 400, 500) }, zones, t)
      if (miss !== null) return `no-match should be null, got ${miss}`
      // malformed/non-array/empty / non-finite-non-positive threshold → null
      if (helper(point, [], t) !== null) return 'empty zones should be null'
      if (helper(point, null as never, t) !== null) return 'non-array zones should be null'
      for (const mp of [null, undefined, {}, { x: NaN, y: 1 }]) if (helper(mp as never, zones, t) !== null) return `malformed point should be null: ${JSON.stringify(mp)}`
      for (const mt of [NaN, Infinity, 0, -1]) if (helper(point, zones, mt) !== null) return `non-finite/non-positive threshold should be null: ${mt}`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-2 [strat:zone-orientation] `zoneOrientation` total + edge-derived (EXISTING — green-on-arrival)', async () => {
    const d = await loadDrag()
    const rep = runProperty('P-TP-2', 'strat:zone-orientation', (_i, rng) => {
      const zone = pick(rng, ['left', 'right', 'header', 'footer', 'stage', 'bogus', null, undefined])
      const expected = zone === 'header' || zone === 'footer' ? 'horizontal' : 'vertical'
      const v = d.zoneOrientation(zone as never)
      if (v !== expected) return `zone=${zone} got=${v} expected=${expected}`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-3 [strat:move-pane-noop-total] `movePane` reorder/relocate total + deterministic + self-drop-at-same-position NO-OP (EXISTING — green-on-arrival)', async () => {
    const d = await loadDrag()
    const rep = runProperty('P-TP-3', 'strat:move-pane-noop-total', (_i, rng) => {
      const layout = layoutWithPanes()
      // total — a random pane/zone/order never throws
      const paneId = pick(rng, ['a', 'b', 'c', 'missing', '', null])
      const zone = pick(rng, [...ZONES, 'stage', 'bogus'] as string[])
      const order = pick(rng, [undefined, null, NaN, Infinity, -4, int(rng, 0, 6)])
      let next: LayoutState
      try {
        next = d.movePane(layout, paneId as never, zone as never, order as never)
      } catch (e) {
        return `movePane threw: ${(e as Error).message}`
      }
      // deterministic over deep-equal inputs
      if (!deepEq(next, d.movePane(layout, paneId as never, zone as never, order as never))) return 'not deterministic'
      // missing id / unknown zone → coerced base unchanged
      const base = coerceLayout(layout)
      for (const miss of ['missing', '', null]) {
        if (!deepEq(d.movePane(base, miss as never, 'left', 0), base)) return `missing paneId should be a no-op: ${miss}`
      }
      if (!deepEq(d.movePane(base, 'a', 'bogus' as never, 0), base)) return 'unknown zone should be a no-op'
      // self-drop at same position → (zone, order) unchanged + zone ordering unchanged
      const selfDrop = d.movePane(base, 'a', 'left', 0)
      const paneA = selfDrop.panes.find((p) => p.id === 'a')
      const zoneOrder = selfDrop.panes.filter((p) => p.zone === 'left').map((p) => p.order)
      if (paneA!.zone !== 'left' || paneA!.order !== 0) return 'self-drop changed the pane position'
      if (!deepEq(zoneOrder, [0, 1])) return `self-drop renumbered the zone: ${JSON.stringify(zoneOrder)}`
      // relocate renumbers the source zone 0..n-1 and the target 0..n-1
      const reloc = d.movePane(base, 'a', 'right', 0)
      const rightOrder = reloc.panes.filter((p) => p.zone === 'right').map((p) => p.order)
      const leftOrder = reloc.panes.filter((p) => p.zone === 'left').map((p) => p.order)
      if (!deepEq(rightOrder, [0, 1])) return `target zone not renumbered: ${JSON.stringify(rightOrder)}`
      if (!deepEq(leftOrder, [0])) return `vacated source zone not renumbered: ${JSON.stringify(leftOrder)}`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })
})

// ===========================================================================
// §3 valid-path states — driven through the pure mapping helpers + the existing
// controllers/seams exactly as the §2.3/§2.4 wiring invokes them. The states
// that ride the NEW helpers (1/2/7 geometry) are RED; the gesture-level states
// on the EXISTING seams are GREEN-on-arrival.
// ===========================================================================
describe('U-SHELL-N7 §3 valid-path states (pure-surface driven)', () => {
  it('state 1 — `gutterSizeForPoint` maps a left-zone pointer to `point.x − layoutRect.left` (NEW helper — RED)', async () => {
    const g = await loadGutter()
    const helper = requireHelper<(r: Rect, z: unknown, p: DragPoint) => number>(g as unknown as Record<string, unknown>, 'gutterSizeForPoint', 'pane-gutter.ts')
    const layoutRect: Rect = { left: 50, top: 20, right: 950, bottom: 700 }
    expect(helper(layoutRect, 'left', { x: 350, y: 300 })).toBe(300)
  })

  it('state 2 — `gutterSizeForPoint` maps right/header/footer via the pinned axis formulas (NEW helper — RED)', async () => {
    const g = await loadGutter()
    const helper = requireHelper<(r: Rect, z: unknown, p: DragPoint) => number>(g as unknown as Record<string, unknown>, 'gutterSizeForPoint', 'pane-gutter.ts')
    const layoutRect: Rect = { left: 50, top: 20, right: 950, bottom: 700 }
    expect(helper(layoutRect, 'right', { x: 750, y: 300 })).toBe(200) // right: right − x
    expect(helper(layoutRect, 'header', { x: 100, y: 120 })).toBe(100) // header: y − top
    expect(helper(layoutRect, 'footer', { x: 100, y: 600 })).toBe(100) // footer: bottom − y
  })

  it('state 3 — a gutter start→move→end gesture clamps to bounds and commits EXACTLY ONE write (EXISTING — green-on-arrival)', async () => {
    const { g, c, commits } = await gutterControllerHarness()
    c.start('left')
    c.move(-50)
    c.move(9000)
    c.move(333)
    c.end()
    expect(commits).toEqual([{ zone: 'left', size: 333 }])
    // the committed track is clamped into [LOCK_ZONE_MIN, MAX]
    expect(commits[0].size).toBeGreaterThanOrEqual(LAYOUT_ZONE_MIN)
    expect(commits[0].size).toBeLessThanOrEqual(LAYOUT_ZONE_MAX)
    expect(g.gutterBounds('left')).toEqual({ min: LAYOUT_ZONE_MIN, max: LAYOUT_ZONE_MAX })
    expect(g.gutterBounds('header')).toEqual({ min: 32, max: 240 })
  })

  it('state 4 — double-click reset commits the registry default EXACTLY once (EXISTING controller + resetGutter seam — green-on-arrival)', async () => {
    const { g, c, commits } = await gutterControllerHarness()
    const res = c.reset('left')
    expect(res).toBe(defaultLayout().zones.left.size)
    expect(commits).toEqual([{ zone: 'left', size: defaultLayout().zones.left.size }])
  })

  it('state 5 — pane reorder within a zone: siblings renumber, node identity stable (EXISTING movePane — green-on-arrival)', async () => {
    const d = await loadDrag()
    const base = layoutWithPanes()
    const next = d.movePane(base, 'a', 'left', 1)
    // movePane keeps array positions and renumbers the authoritative `order`
    // field → sort by order to observe the placement.
    const leftOrdered = next.panes.filter((p) => p.zone === 'left').sort((a, b) => a.order - b.order)
    expect(leftOrdered.map((p) => p.id)).toEqual(['b', 'a'])
    expect(leftOrdered.map((p) => p.order)).toEqual([0, 1])
    // node identity is stable (same id set)
    expect(next.panes.map((p) => p.id).sort()).toEqual(base.panes.map((p) => p.id).sort())
  })

  it('state 6 — pane relocate across zones: source reorders, the drop lands where the pointer is (EXISTING movePane + insertionIndexForPoint — green-on-arrival)', async () => {
    const d = await loadDrag()
    const base = layoutWithPanes()
    const next = d.movePane(base, 'a', 'right', 0)
    expect(next.panes.find((p) => p.id === 'a')?.zone).toBe('right')
    const rightOrder = next.panes.filter((p) => p.zone === 'right').map((p) => ({ id: p.id, order: p.order }))
    expect(rightOrder).toEqual([{ id: 'a', order: 0 }, { id: 'c', order: 1 }])
    const leftOrder = next.panes.filter((p) => p.zone === 'left').map((p) => p.order)
    expect(leftOrder).toEqual([0])
    // index-derivation: a pointer in the MIDDLE band of a 3-slot right zone
    // (vertical axis → the y band) lands at slot 1
    const idx = d.insertionIndexForPoint({ x: 65, y: 50 }, { zone: 'right', left: 0, top: 0, right: 200, bottom: 100 }, 3)
    expect(idx).toBe(1)
  })

  it('state 7 (C11) — `toZoneBounds` projects every [data-zone] rect so the controller proximity reveal sees it (NEW helper — RED)', async () => {
    const d = await loadDrag()
    const helper = requireHelper<(z: unknown, r: Rect | null) => ZoneBounds>(d as unknown as Record<string, unknown>, 'toZoneBounds', 'pane-drag.ts')
    const rect: Rect = { left: 0, top: 0, right: 640, bottom: 480 }
    expect(helper('left', rect)).toEqual({ zone: 'left', left: 0, top: 0, right: 640, bottom: 480 })
    // the C11 reveal (controller-level) fires at most ONE onRevealChange per crossing then re-hides idempotently
    const revealed: LayoutZoneName[][] = []
    const dctrl = await createDragHarness((z) => revealed.push([...z]))
    dctrl.start('a')
    const zones = [helper('left', rect), helper('right', { left: 800, top: 0, right: 900, bottom: 480 })]
    dctrl.move({ x: 200, y: 200 }, zones) // near left
    dctrl.move({ x: 200, y: 200 }, zones) // same crossing — no extra write
    dctrl.move({ x: 850, y: 200 }, zones) // cross to right — one write, set change
    dctrl.move({ x: 200, y: 200 }, zones) // cross back to left — one write
    expect(revealed.length).toBeLessThanOrEqual(3)
    expect(revealed[0]).toEqual(['left'])
  })

  it('state 8 (C12) — a minimized zone stays a drop target but its gutter is inert (EXISTING — green-on-arrival)', async () => {
    const g = await loadGutter()
    // minimized zone is NOT gutter-resizable → startGutter no-op (no gesture, no commit)
    const { c, commits } = await gutterControllerHarness(false, true)
    c.start('left')
    c.move(400)
    c.end()
    expect(commits).toEqual([])
    expect(g.isGutterResizable(false, true)).toBe(false)
    expect(g.isGutterResizable(true, false)).toBe(false)
    expect(g.isGutterResizable(false, false)).toBe(true)
    // minimized zone's rect still reveals as a drop target for a scope-legal pane
    const dctrl = await createDragHarness(() => {})
    dctrl.start('a')
    dctrl.move({ x: 850, y: 200 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }])
    expect(dctrl.reveal()).toContain('right')
  })

  it('state 9 — an operator pane never reveals an app-graph zone (scope legality downstream, EXISTING — green-on-arrival)', async () => {
    const d = await loadDrag()
    const dctrl = await createDragHarness(() => {}, () => 'operator')
    dctrl.start('op-pane')
    dctrl.move({ x: 850, y: 200 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }])
    expect(dctrl.reveal()).toEqual([]) // scope-illegal → never reveals
    expect(dctrl.drop({ paneId: 'op-pane', zone: 'right' })).toBeNull() // drop rejected
    expect(d.legalZonesForScope('operator')).toEqual([])
  })

  it('state 10 (F2) — a self-drop at the current position is a NO-OP (zero mutation; EXISTING movePane + commitPaneDrop seam — green-on-arrival)', async () => {
    const d = await loadDrag()
    const base = layoutWithPanes()
    const before = base.panes.find((p) => p.id === 'a')!
    const next = d.movePane(base, 'a', 'left', 0)
    const after = next.panes.find((p) => p.id === 'a')!
    expect(after.zone).toBe(before.zone)
    expect(after.order).toBe(before.order)
    expect(next.panes.filter((p) => p.zone === 'left').map((p) => p.order)).toEqual([0, 1])
  })
})

// ---------------------------------------------------------------------------
// a createDragController harness mirroring sidebar-panes.ts's construction
// (threshold 24; scopeOf default app-graph; onRevealChange records the reveals).
// ---------------------------------------------------------------------------
async function createDragHarness(onRevealChange: (z: LayoutZoneName[]) => void, scope?: () => 'app-graph' | 'operator') {
  const d = await loadDrag()
  return d.createDragController({
    threshold: 24,
    scopeOf: (paneId: string) => (scope ? scope() : 'app-graph'),
    onRevealChange: onRevealChange ?? (() => {}),
  })
}

// ===========================================================================
// §4 fail-states / edge cases — driven through the pure surface + the same
// controllers the wiring feeds. The helper-level fail-states (F1/F6/F7/F10 hit
// tests) and the F5/F11 capture/boot guard are RED (wiring or helper absent);
// the controller gate/revert fail-states (F2/F3/F4/F8) are GREEN-on-arrival.
// ===========================================================================
describe('U-SHELL-N7 §4 fail-states / edge cases', () => {
  const rect: Rect = { left: 0, top: 0, right: 640, bottom: 480 }

  it('F1 — a pane dropped outside any zone resolves NO target; the abort path re-hides with one final write (GREEN controller; null-hit is the NEW helper — RED)', async () => {
    const d = await loadDrag()
    const revealed: LayoutZoneName[][] = []
    const dctrl = await createDragHarness((z) => revealed.push([...z]))
    dctrl.start('a')
    dctrl.move({ x: 850, y: 200 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }])
    const before = revealed.length
    dctrl.cancel() // pointercancel / outside-any-zone abort → re-hide with ONE final write
    expect(revealed.length).toBe(before + 1)
    expect(dctrl.reveal()).toEqual([])
    // the abort is ALSO the dropZoneForPoint null-hit path (NEW helper — RED):
    const helper = requireHelper<(p: DragPoint, z: readonly ZoneBounds[], t: number) => LayoutZoneName | null>(d as unknown as Record<string, unknown>, 'dropZoneForPoint', 'pane-drag.ts')
    expect(helper({ x: 5000, y: 5000 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }], 24)).toBeNull()
  })

  it('F4 — a gesture interrupted by pointercancel: gutter reverts with no write; drag re-hides with one final write (EXISTING — green-on-arrival)', async () => {
    const { c, commits } = await gutterControllerHarness()
    c.start('left')
    c.move(400)
    c.move(500)
    c.cancel()
    expect(commits).toEqual([]) // revert — no commit, no stream

    const revealed: LayoutZoneName[][] = []
    const dctrl = await createDragHarness((z) => revealed.push([...z]))
    dctrl.start('a')
    dctrl.move({ x: 850, y: 200 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }])
    const before = revealed.length
    dctrl.cancel()
    expect(revealed.length).toBe(before + 1) // one final re-hide write
  })

  it('F8 — pointerdown on a non-resizable (empty/minimized) gutter makes startGutter a NO-OP (EXISTING controller gate — green-on-arrival)', async () => {
    for (const [empty, minimized] of [[true, false], [false, true]] as const) {
      const { c, commits } = await gutterControllerHarness(empty, minimized)
      c.start('left')
      c.move(400)
      expect(c.active()).toBeNull()
      c.end()
      expect(commits).toEqual([])
    }
  })

  it('F10 — an unknown gutter data-zone: gutterSizeForPoint → 0 (NEW helper — RED); resetGutter("bogus") → null (EXISTING controller — green-on-arrival)', async () => {
    const g = await loadGutter()
    const helper = requireHelper<(r: Rect, z: unknown, p: DragPoint) => number>(g as unknown as Record<string, unknown>, 'gutterSizeForPoint', 'pane-gutter.ts')
    expect(helper(rect, 'bogus', { x: 300, y: 300 })).toBe(0)
    // resetGutter with a non-omitted invalid zone must NOT retarget the active gesture (H-2)
    const { c, commits } = await gutterControllerHarness()
    c.start('left')
    c.move(400)
    const res = c.reset('bogus' as never)
    expect(res).toBeNull()
    expect(commits).toEqual([])
  })

  it('F3 — a scope-illegal drop target is rejected (null), never a partial mutation (EXISTING controller drop — green-on-arrival)', async () => {
    const dctrl = await createDragHarness(() => {}, () => 'operator')
    dctrl.start('op-pane')
    dctrl.move({ x: 850, y: 200 }, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }])
    expect(dctrl.drop({ paneId: 'op-pane', zone: 'right' })).toBeNull()
    expect(dctrl.reveal()).toEqual([])
  })

  it('F6 — a zero/degenerate rect still projects via toZoneBounds; withinSnapThreshold/dropZoneForPoint yield no spurious hit (NEW helper — RED)', async () => {
    const d = await loadDrag()
    const helper = requireHelper<(z: unknown, r: Rect | null) => ZoneBounds>(d as unknown as Record<string, unknown>, 'toZoneBounds', 'pane-drag.ts')
    const degenerate = helper('left', { left: 0, top: 0, right: 0, bottom: 0 })
    expect(degenerate).toEqual({ zone: 'left', left: 0, top: 0, right: 0, bottom: 0 })
    expect(d.withinSnapThreshold({ x: 10, y: 10 }, degenerate, 24)).toBe(false) // a degenerate rect never spuriously contains
  })

  it('F7 — a malformed pointer/rect fed to the mapping helpers is TOTAL: 0/null/0-bound, never a throw (NEW helpers — RED)', async () => {
    const g = await loadGutter()
    const gut = requireHelper<(r: Rect, z: unknown, p: DragPoint) => number>(g as unknown as Record<string, unknown>, 'gutterSizeForPoint', 'pane-gutter.ts')
    const d = await loadDrag()
    const bounds = requireHelper<(z: unknown, r: Rect | null) => ZoneBounds>(d as unknown as Record<string, unknown>, 'toZoneBounds', 'pane-drag.ts')
    const drop = requireHelper<(p: DragPoint, z: readonly ZoneBounds[], t: number) => LayoutZoneName | null>(d as unknown as Record<string, unknown>, 'dropZoneForPoint', 'pane-drag.ts')
    // never throws, never a partial mutation
    for (const bad of [null, undefined, {}, { x: NaN, y: 1 }, 'point', 42, { left: Infinity }]) {
      expect(() => gut(rect, 'left', bad as never)).not.toThrow()
      expect(() => bounds('left', bad as never)).not.toThrow()
      expect(() => drop(bad as never, [{ zone: 'right', left: 800, top: 0, right: 900, bottom: 480 }], 24)).not.toThrow()
    }
  })
})

// ===========================================================================
// §2.8 — source-pinned listener-registration surface (the statically-asserted
// layer). The real DOM events cannot be node-driven, so the wiring's LISTENER
// REGISTRATION + the mapping-helper calls + a CALLER for every §2.1 host seam
// are pinned against the LIVE src/renderer/renderer.ts source (the
// unit-u-shell-8 / unit-ujr1 source-pin house convention). ALL RED — the
// wiring does not exist yet.
// ===========================================================================
describe('U-SHELL-N7 §2.8 the source-pinned listener wiring (src/renderer/renderer.ts)', () => {
  const rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')

  it('the wiring registers all four pointer event types via addEventListener on the shell chrome', () => {
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      expect(rendererSrc, `addEventListener('${type}', …) must be registered by the shell wiring`).toContain(`addEventListener('${type}',`)
    }
  })

  it('the wiring applies pointer capture (setPointerCapture) for an accepted gesture', () => {
    expect(rendererSrc, 'setPointerCapture must be used to capture the pointer for an accepted gesture').toContain('setPointerCapture')
  })

  it('the wiring reads the gesture geometry via getBoundingClientRect', () => {
    expect(rendererSrc, 'getBoundingClientRect() must be read for the gesture rect math (§2.1/§2.6)').toContain('getBoundingClientRect')
  })

  it('the wiring calls the THREE NEW pure mapping helpers (never inlines the mapping)', () => {
    expect(rendererSrc, 'the wiring must route pointer→gutter via gutterSizeForPoint(…), never inline it (§2.2)').toContain('gutterSizeForPoint(')
    expect(rendererSrc, 'the wiring must project [data-zone] rects via toZoneBounds(…), never inline it (§2.2)').toContain('toZoneBounds(')
    expect(rendererSrc, 'the wiring must hit-test the drop target via dropZoneForPoint(…), never inline it (§2.2)').toContain('dropZoneForPoint(')
  })

  it('EVERY §2.1 host seam has a CALLER in the wiring (removes the W2-N7 "no caller" vacancy)', () => {
    // Gutter seams (§2.3): startGutter / moveGutter / endGutter / cancelGutter /
    // resetGutter. Drag seams (§2.4): startPaneDrag / movePaneDrag /
    // commitPaneDrop / cancelPaneDrag. Each must be INVOKED (a method call
    // `seam(`, not merely the sidebar-panes.ts definition).
    const seams = [
      'startGutter', 'moveGutter', 'endGutter', 'cancelGutter', 'resetGutter',
      'startPaneDrag', 'movePaneDrag', 'commitPaneDrop', 'cancelPaneDrag',
    ]
    for (const seam of seams) {
      expect(rendererSrc, `the wiring must CALLER the ${seam} host seam (W2-N7: currently no caller in src/)`).toContain(`${seam}(`)
    }
  })
})

// ===========================================================================
// F-1 PANE-BODY-GESTURE-SWALLOWED — the §2.8 SOURCE-PIN RE-PIN (2026-09-15).
//
// The §2.8 block above deliberately pins only EVENT-TYPE literals + seam
// CALLERS (it names neither `GESTURE_SELECTOR` nor a selector string), so the
// whole block stays green across the fix. The gesture-surface convention it had
// implicitly frozen — "the `.pane-frame[data-pane-id]` element is a pane-drag
// surface" — is now WRONG (docs/defects.md F-1, live-confirmed: a real click on
// a row INSIDE a pane body is swallowed because the frame captures the pointer
// and the gesture's `click` retargets to `.pane-frame`). These pins re-freeze
// the corrected convention, statically, on the LIVE source:
//
//   F-1.1 the OLD frame-as-surface gesture selector is GONE;
//   F-1.2 the pane HEADER region (`.pane-collapse-toggle`) is the surface the
//         wiring names;
//   F-1.3 the pane id is resolved from the HEADER's parent frame (never from a
//         frame-level gesture element), so a BODY element can never resolve it.
//
// The BEHAVIOR of the re-pinned surface (header starts / body never starts) is
// driven in `tests/renderer-pane-drag-surface.test.ts` +
// `tests/unit-u-shell-shell-wiring-adversarial.test.ts` (both re-pinned in the
// same pass). RED against the current source; green once the fix lands.
// ===========================================================================
describe('F-1 §2.8 re-pin — the pane-drag GESTURE SURFACE is the pane HEADER, never the frame body', () => {
  const rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')

  it('F-1.1 — the OLD frame-as-gesture-surface selector is REMOVED (a `.pane-frame[data-pane-id]` pointerdown must no longer resolve a gesture element)', () => {
    // RED: `const GESTURE_SELECTOR = '.gutter[data-zone], .pane-frame[data-pane-id]'`
    // (renderer.ts :293) makes EVERY `pointerdown` inside the frame — the body
    // included — start a pane drag that captures the pointer on the frame.
    expect(
      rendererSrc,
      'the old `.gutter[data-zone], .pane-frame[data-pane-id]` gesture selector must be GONE (F-1 root cause: a body pointerdown resolved the frame)',
    ).not.toContain("'.gutter[data-zone], .pane-frame[data-pane-id]'")
    expect(
      rendererSrc,
      'the frame must no longer be a bare `closest` target for the pane gesture (the header region is the surface)',
    ).not.toContain("closest('.pane-frame[data-pane-id]')")
  })

  it('F-1.2 — the wiring names the pane HEADER region (`.pane-collapse-toggle`) as the pane-drag gesture surface', () => {
    // RED: `renderer.ts` never mentions the collapse toggle — the surface it
    // freezes is the frame itself.
    expect(
      rendererSrc,
      'the pane-drag gesture surface must be the pane header — the wiring must name `.pane-collapse-toggle`',
    ).toContain('pane-collapse-toggle')
  })

  it('F-1.3 — the frame `data-pane-id` attribute is still READ by the wiring (the header→parent-frame id resolution survives the surface change)', () => {
    // The design keeps the pane-id SOURCE unchanged (the `.pane-frame`'s
    // `data-pane-id`) while moving the SURFACE to the header: a fix that
    // resolved the id from the header's own attribute (or dropped the frame
    // lookup) would break the real app, where the id lives on the frame
    // (src/renderer/pane-graph.ts paneSubtreeRoot). GREEN-on-arrival — pinned
    // so the surface change cannot silently drop the frame lookup. The id
    // SOURCE (`parentElement`-resolved frame, not the header) is behaviorally
    // pinned in `tests/renderer-pane-drag-surface.test.ts` S1b.
    expect(
      rendererSrc,
      'the wiring must still read the frame `data-pane-id` (the pane-id source does not move to the header)',
    ).toContain('data-pane-id')
  })
})

