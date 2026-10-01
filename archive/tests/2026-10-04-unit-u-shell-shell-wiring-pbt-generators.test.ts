// tests/unit-u-shell-shell-wiring-pbt-generators.test.ts — Unit U-SHELL-N7
// (W2-N7) §5.7 PBT **negative/malformed-generator complement** pass.
//
// The read-only PBT audit (2026-09-13) found the 8 property rows of
// docs/specs/unit-u-shell-shell-wiring.md §5.7 NOT over-strength but identified
// GENERATOR-COVERAGE GAPS: the property layers in
// tests/unit-u-shell-shell-wiring.test.ts exercise the positive/valid ranges
// but under-generate the negative/malformed inputs the register's propositions
// (§5.7 P-IM-1..3, P-SM-1..2, P-TP-1..3) demand. This file closes THOSE gaps
// only — it is a RED-complement / GREEN-on-arrival property set over the ALREADY
// TOTAL pure helpers in src/renderer/pane-gutter.ts + src/renderer/pane-drag.ts:
//
//   P-IM-1 (gap: out-of-rect points + unknown zone + non-finite fields):
//     points generated OUTSIDE the {left,top,right,bottom} rect on all four
//     sides → the pinned axis formula still holds for all four valid zones (a
//     value may be NEGATIVE — spec §2.2.1/F10 explicitly allows a negative raw
//     candidate; the clamp downstream `host.moveGutter`/`clampGutterSize` is what
//     prevents a collapsed track). Unknown zone ('stage'/'bogus'/''/null) and
//     non-finite point/layoutRect fields → 0, never a throw, never NaN.
//
//   P-IM-2 (gap: unknown-zone / non-object rect): null/undefined/string/number
//     rects + unknown zones → a TYPED ZoneBounds, 0-floored for null/malformed,
//     `zone` coerced per pane-drag.ts's actual behavior (an unknown zone → 'left',
//     a valid zone preserved).
//
//   P-SM-1 (gap: degenerate/inverted rects): rects with `right <= left` or
//     `bottom <= top` (collapsed/inverted tracks) with points inside/outside →
//     FALSE (no spurious contain/reveal); non-finite point/zone fields and a
//     `threshold <= 0`/non-finite threshold → false (no throw).
//
//   P-TP-1 (gap: overlapping-rect FIRST-match + full null-range): TWO overlapping
//     ZoneBounds with the point inside BOTH threshold-bands → the FIRST in array
//     order; `zones=[]` / non-array / malformed point / non-finite or `<=0`
//     threshold / a point whose nearest band misses every zone → null (never a
//     throw).
//
//   P-TP-3 (gap: interleaved/out-of-range `order`): LayoutStates with
//     interleaved + out-of-range order values (duplicates, gaps, negative,
//     non-finite, omitted) → movePane is TOTAL (returns a LayoutState, never
//     throws); a self-drop at the same (zone, order) is a NO-OP; a relocate
//     renumbers the vacated source zone 0..n-1 AND the target 0..n-1.
//
// The helpers are already TOTAL (GREEN-on-arrival) — this file records the audit
// gap-closure set and must NOT touch src/ or the sibling test files
// (tests/unit-u-shell-shell-wiring.test.ts, -adversarial.test.ts). Deterministic
// mulberry32 with a pinned seed — NO Math.random(). ≤100 attempts/row, small
// total (5 rows × 40 = 200 ≤ 400).
import { describe, it, expect } from 'vitest'

// ===========================================================================
// The deterministic PBT harness (mulberry32, pinned seed, ≤40 attempts/row).
// ===========================================================================
const PBT_SEED = 0x61756431 // this complement file's pinned seed ("audit-1")
const PBT_ATTEMPTS = 40 // ≤100/row → 5 × 40 = 200 ≤ 400 total
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
  return {
    row: rowId,
    strategyId,
    held: counterexamples.length === 0,
    counterexamples,
    attempts: PBT_ATTEMPTS,
  }
}

// The pure-surface types + dynamic loaders (mirror the sibling file's
// `requireHelper` so a missing seam fails the row INDIVIDUALLY, not at load).
type Rect = { left: number; top: number; right: number; bottom: number }
type LayoutZoneName = 'left' | 'right' | 'header' | 'footer'
interface DragPoint { x: number; y: number }
interface ZoneBounds { zone: LayoutZoneName; left: number; top: number; right: number; bottom: number }

const ZONES: readonly LayoutZoneName[] = ['left', 'right', 'header', 'footer']
const UNKNOWN_ZONES = ['stage', 'bogus', '', null] as unknown[]

async function loadGutter(): Promise<{ gutterSizeForPoint: (r: Rect, z: unknown, p: DragPoint) => number }> {
  return (await import('../src/renderer/pane-gutter.js')) as unknown as {
    gutterSizeForPoint: (r: Rect, z: unknown, p: DragPoint) => number
  }
}
async function loadDrag(): Promise<{
  toZoneBounds: (z: unknown, r: unknown) => ZoneBounds
  withinSnapThreshold: (p: unknown, z: unknown, t: number) => boolean
  dropZoneForPoint: (p: unknown, zs: unknown, t: number) => LayoutZoneName | null
  movePane: (l: unknown, paneId: unknown, zone: unknown, order?: unknown) => unknown
}> {
  return (await import('../src/renderer/pane-drag.js')) as unknown as {
    toZoneBounds: (z: unknown, r: unknown) => ZoneBounds
    withinSnapThreshold: (p: unknown, z: unknown, t: number) => boolean
    dropZoneForPoint: (p: unknown, zs: unknown, t: number) => LayoutZoneName | null
    movePane: (l: unknown, paneId: unknown, zone: unknown, order?: unknown) => unknown
  }
}

describe('U-SHELL-N7 §5.7 PBT negative/malformed-generator complement (deterministic mulberry32)', () => {
  it('P-IM-1 [strat:gutter-size-point-outofrect] `gutterSizeForPoint` keeps the pinned axis formula for OUT-OF-RECT points; unknown zone/non-finite → 0', async () => {
    const { gutterSizeForPoint: helper } = await loadGutter()
    const rep = runProperty('P-IM-1', 'strat:gutter-size-point-outofrect', (_i, rng) => {
      const rect: Rect = {
        left: int(rng, 0, 300),
        top: int(rng, 0, 300),
        right: int(rng, 400, 900),
        bottom: int(rng, 400, 900),
      }
      // A point OUTSIDE the rect on all four sides. For the row (header/footer)
      // zones only the y-coordinate feeds the formula; for the side zones only
      // x does — so a point outside on ANY side still yields the pinned formula
      // (each formula reads exactly one axis). Such a raw candidate may be
      // NEGATIVE — §2.2.1/F10 allows it; the downstream clamp is what prevents a
      // collapsed track. We assert the EXACT formula the helper implements, not
      // a sign invariant.
      const side = pick(rng, ['left', 'right', 'above', 'below'] as const)
      let point: DragPoint
      if (side === 'left') point = { x: rect.left - int(rng, 1, 300), y: int(rng, rect.top - 50, rect.bottom + 50) }
      else if (side === 'right') point = { x: rect.right + int(rng, 1, 300), y: int(rng, rect.top - 50, rect.bottom + 50) }
      else if (side === 'above') point = { x: int(rng, rect.left - 50, rect.right + 50), y: rect.top - int(rng, 1, 300) }
      else point = { x: int(rng, rect.left - 50, rect.right + 50), y: rect.bottom + int(rng, 1, 300) }

      const outside = point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom
      // Sanity guard: the four explicit sides MUST be outside the rect (a seeded
      // draw that violates this is a generator defect, not a helper defect).
      if (!outside) return `seeded point unexpectedly inside the rect: ${JSON.stringify(point)}`

      const expectedFor = (z: LayoutZoneName): number =>
        z === 'left' ? point.x - rect.left
          : z === 'right' ? rect.right - point.x
            : z === 'header' ? point.y - rect.top
              : rect.bottom - point.y
      for (const zone of ZONES) {
        const v = helper(rect, zone, point)
        if (typeof v !== 'number' || Number.isNaN(v)) return `zone=${zone} non-number/NaN: ${v}`
        if (!Number.isFinite(v)) return `zone=${zone} non-finite v=${v} (never NaN/Infinity)`
        if (v !== expectedFor(zone)) return `zone=${zone} side=${side} got=${v} expected=${expectedFor(zone)} (formula mismatch)`
        if (helper(rect, zone, point) !== v) return `zone=${zone} not deterministic over deep-equal inputs`
      }

      // Unknown zone → 0 (never a throw, never NaN). `'stage'` is the region the
      // spec names as non-pane (W2-Q2); `''`/`null` are the malformed data-zone.
      for (const bogus of UNKNOWN_ZONES) {
        const u0 = helper(rect, bogus, point)
        if (u0 !== 0) return `unknown zone(${JSON.stringify(bogus)}) returned ${u0} (must be 0)`
      }

      // Non-finite point / layoutRect field → 0 (never throws, never NaN).
      for (const badPoint of [{ x: NaN, y: 1 }, { x: 1, y: -Infinity }, { x: Infinity, y: 1 }, null, 'px', 42, {}]) {
        const n0 = helper(rect, 'left', badPoint as never)
        if (n0 !== 0) return `non-finite/malformed point ${JSON.stringify(badPoint)} returned ${n0} (must be 0)`
      }
      for (const k of ['left', 'top', 'right', 'bottom'] as const) {
        const badRect: Rect = { ...rect, [k]: pick(rng, [NaN, Infinity, -Infinity] as number[]) }
        for (const zone of ZONES) {
          const n1 = helper(badRect, zone, point)
          if (n1 !== 0) return `non-finite rect.${k}=${badRect[k]} zone=${zone} returned ${n1} (must be 0)`
        }
      }
      // Null/missing layoutRect → 0.
      if (helper(null as never, 'left', point) !== 0) return 'null layoutRect must be 0'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-IM-2 [strat:to-zone-bounds-neg] `toZoneBounds` total + typed for unknown zones and null/non-object/malformed rects (unknown zone → \'left\', malformed → 0-floored)', async () => {
    const { toZoneBounds: helper } = await loadDrag()
    const rep = runProperty('P-IM-2', 'strat:to-zone-bounds-neg', (_i, rng) => {
      // Unknown zone + a VALID finite rect → a TYPED ZoneBounds with `zone`
      // coerced to 'left' (pane-drag.ts's actual behavior) and the finite edges
      // copied faithfully.
      const finite: Rect = {
        left: int(rng, 0, 500),
        top: int(rng, 0, 500),
        right: int(rng, 501, 1200),
        bottom: int(rng, 501, 1200),
      }
      for (const bogus of UNKNOWN_ZONES) {
        const z = helper(bogus, finite)
        if (z == null || typeof z !== 'object') return `unknown zone returned non-object: ${JSON.stringify(z)}`
        if (z.zone !== 'left') return `unknown zone(${JSON.stringify(bogus)}) coerced to ${z.zone} (must be 'left')`
        for (const k of ['left', 'top', 'right', 'bottom'] as const) {
          if (typeof z[k] !== 'number' || !Number.isFinite(z[k])) return `${k} not finite for unknown zone: ${z[k]}`
          if (z[k] !== finite[k]) return `unknown-zone ${k} not copied (got ${z[k]}, expected ${finite[k]})`
        }
        // A VALID zone on the same rect preserves `zone`.
        const valid = helper('header', finite)
        if (valid.zone !== 'header') return `valid zone not preserved on valid rect: ${valid.zone}`
      }

      // null / undefined / string / number / array / partial-malformed rects →
      // a 0-floored TYPED ZoneBounds, `zone` preserved for a valid zone and
      // coerced to 'left' for an unknown one. Never a throw.
      const malformedRects = [null, undefined, 'bounds', 42, [1, 2, 3, 4], {}, { left: NaN }, { left: 1, top: Infinity }, { left: 1, right: 'x' }]
      for (const badRect of malformedRects) {
        for (const [zone, expectedZone] of [['left', 'left'], ['header', 'header'], ['bogus', 'left']] as const) {
          const z = helper(zone, badRect)
          if (z == null || typeof z !== 'object') return `malformed rect ${JSON.stringify(badRect)} returned non-object`
          if (z.zone !== expectedZone) return `zone=${zone} on malformed rect coerced to ${z.zone} (expected ${expectedZone})`
          for (const k of ['left', 'top', 'right', 'bottom'] as const) {
            if (z[k] !== 0) return `malformed rect ${JSON.stringify(badRect)} field ${k}=${z[k]} (must be 0)`
          }
        }
      }

      // Determinism over deep-equal malformed inputs.
      if (!deepEq(helper('left', null), helper('left', null))) return 'not deterministic for null rect'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-SM-1 [strat:snap-threshold-degenerate] `withinSnapThreshold` → false for degenerate/inverted rects, non-finite point/zone fields, and non-finite/non-positive thresholds', async () => {
    const { withinSnapThreshold: helper } = await loadDrag()
    const rep = runProperty('P-SM-1', 'strat:snap-threshold-degenerate', (_i, rng) => {
      const t = int(rng, 0, 20)
      // Degenerate/inverted rects: `right <= left` (collapsed/inverted columns)
      // or `bottom <= top` (collapsed/inverted rows). A point that would be
      // inside (or in-band) must NOT spuriously contain/reveal → false. This is
      // the audit's F6 pin (pane-drag.ts returns false; no spurious hit).
      const degenerates: Array<ZoneBounds> = [
        { zone: 'left', left: 100, top: 0, right: 100, bottom: 200 }, // zero-width
        { zone: 'right', left: 300, top: 0, right: 250, bottom: 200 }, // inverted width
        { zone: 'header', left: 0, top: 100, right: 200, bottom: 100 }, // zero-height
        { zone: 'footer', left: 0, top: 300, right: 200, bottom: 250 }, // inverted height
        { zone: 'left', left: 10, top: 10, right: 5, bottom: 5 }, // both inverted
      ]
      for (const dec of degenerates) {
        const inside: DragPoint = { x: dec.left - 1, y: dec.top - 1 }
        const onBand: DragPoint = { x: dec.right + 2, y: dec.top + 2 }
        if (helper(inside, dec, t) !== false) return `degenerate rect contained an inside point: ${JSON.stringify(dec)}`
        if (helper(onBand, dec, t) !== false) return `degenerate rect spuriously revealed a band point: ${JSON.stringify(dec)}`
        if (helper({ x: dec.right + 30, y: dec.bottom + 30 }, dec, 40) !== false) return `degenerate rect revealed an outside point even with a large threshold`
      }

      // Non-finite point / zone fields → false (never a throw).
      for (const mp of [null, undefined, {}, { x: NaN, y: 1 }, { x: 1, y: -Infinity }, 'p', 7, [3, 4]]) {
        const good: ZoneBounds = { zone: 'left', left: 0, top: 0, right: 100, bottom: 100 }
        if (helper(mp, good, t) !== false) return `malformed point ${JSON.stringify(mp)} should be false`
      }
      for (const mz of [null, undefined, {}, { left: NaN }, { left: 1, top: 1, right: 2, bottom: -Infinity }, { left: 1, right: 1 }, 7, 'z']) {
        if (helper({ x: 5, y: 5 }, mz, t) !== false) return `malformed zone ${JSON.stringify(mz)} should be false`
      }

      // Non-finite / non-positive threshold collapses the band to t=0: a point
      // STRICTLY OUTSIDE the rect must be false (no throw) — the band is gone.
      const rectZone: ZoneBounds = { zone: 'left', left: 0, top: 0, right: 100, bottom: 100 }
      const outside: DragPoint = { x: rectZone.right + 5, y: rectZone.top + 5 }
      for (const badT of [NaN, Infinity, -Infinity, 0, 1, -1, -40]) {
        if (helper(outside, rectZone, badT) !== false) return `non-finite/non-positive threshold(${badT}) revealed an outside point (must be false)`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-1 [strat:drop-zone-hit-overlap] `dropZoneForPoint` returns the FIRST overlapping match; full null-range for empty/non-array/malformed/missing-band', async () => {
    const { dropZoneForPoint: helper } = await loadDrag()
    const rep = runProperty('P-TP-1', 'strat:drop-zone-hit-overlap', (_i, rng) => {
      const t = int(rng, 1, 10)
      // TWO overlapping zones: a point inside BOTH threshold-bands. Geometry-first
      // means the EARLIER zone in array order wins AND its order is what decides.
      const a: ZoneBounds = { zone: 'left', left: 0, top: 0, right: 100, bottom: 100 }
      const b: ZoneBounds = { zone: 'right', left: 60, top: 60, right: 160, bottom: 160 }
      const overlap: DragPoint = { x: int(rng, 65, 95), y: int(rng, 65, 95) }
      // The point is strictly inside both rects → in BOTH bands regardless of t.
      if (helper(overlap, [a, b], t) !== 'left') return `overlap point should hit the FIRST zone (left); got ${helper(overlap, [a, b], t)}`
      if (helper(overlap, [b, a], t) !== 'right') return `reversed order should hit the FIRST zone (right); got ${helper(overlap, [b, a], t)}`
      // Determinism over deep-equal inputs.
      if (!deepEq(helper(overlap, [a, b], t), helper(overlap, [a, b], t))) return 'not deterministic'

      // A point whose nearest band misses EVERY zone → null (genuine no-hit).
      const zones: readonly ZoneBounds[] = [
        { zone: 'left', left: 0, top: 0, right: 100, bottom: 200 },
        { zone: 'right', left: 600, top: 0, right: 700, bottom: 200 },
        { zone: 'header', left: 0, top: 600, right: 100, bottom: 800 },
      ]
      // The gap point is ≥190px clear of every zone's banded x-edge and ≥90px
      // clear of the y-edges under any t∈[1,10] (margins ≫ t).
      const miss: DragPoint = { x: int(rng, 300, 400), y: int(rng, 400, 500) }
      if (helper(miss, zones, t) !== null) return `no-match point should be null, got ${helper(miss, zones, t)}`

      // Malformed / non-array / empty zones → null (never throw).
      const anyPoint: DragPoint = { x: 50, y: 50 }
      if (helper(anyPoint, [], t) !== null) return 'empty zones should be null'
      if (helper(anyPoint, null as never, t) !== null) return 'null zones should be null'
      if (helper(anyPoint, 'zones' as never, t) !== null) return 'string zones should be null'
      if (helper(anyPoint, 42 as never, t) !== null) return 'number zones should be null'
      if (helper(anyPoint, [a] as never, t) !== 'left') return 'array zones with a containing match should hit'

      // A zones array containing malformed entries never throws (guarded, skipped).
      // The first VALID containing match is `b` (zone 'right'): the malformed
      // `{zone:'left'}` (missing edges) yields false from withinSnapThreshold.
      if (helper(overlap, [null, { zone: 'left' } as ZoneBounds, b], t) !== 'right') return 'malformed zone entries should be skipped and the first valid containing match wins (right)'

      // Malformed point / non-finite or non-positive threshold → null.
      for (const mp of [null, undefined, {}, { x: NaN, y: 1 }, { x: 1, y: Infinity }, 'p', 7, [3, 4]]) {
        if (helper(mp, zones, t) !== null) return `malformed point ${JSON.stringify(mp)} should be null`
      }
      for (const mt of [NaN, Infinity, -Infinity, 0, -1]) {
        if (helper(overlap, [a, b], mt) !== null) return `non-finite/non-positive threshold(${mt}) should be null`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-3 [strat:move-pane-generators] `movePane` is TOTAL over interleaved/out-of-range `order` values; self-drop NO-OP; relocate renumbers source AND target 0..n-1', async () => {
    const { movePane } = await loadDrag()
    // A controlled base for the structural (renumber / no-op) assertions.
    const base = {
      version: 1,
      panes: [
        { id: 'a', zone: 'left', order: 0, collapsed: false },
        { id: 'b', zone: 'left', order: 1, collapsed: false },
        { id: 'c', zone: 'right', order: 0, collapsed: false },
      ],
      zones: {
        left: { size: 300, minimized: false },
        right: { size: 220, minimized: false },
        header: { size: 48, minimized: false },
        footer: { size: 48, minimized: false },
      },
      stage: { size: 640 },
      topBar: { size: 36 },
    }

    const rep = runProperty('P-TP-3', 'strat:move-pane-generators', (_i, rng) => {
      // Build a LayoutState with INTERLEAVED + OUT-OF-RANGE order values: a
      // random set of panes whose `order` draws from a pool of duplicates, gaps,
      // negative, non-finite, and omitted. `movePane` first calls `coerceLayout`,
      // so non-finite orders normalize to the pane's array index and finite
      // duplicates/gaps/negative survive — every input is still a valid
      // LayoutState the pane moves over. This is the audit's totality gap.
      const idCount = int(rng, 1, 5)
      const ids = Array.from({ length: idCount }, (_, j) => `p${j}`)
      const rawPanes = ids.map((id) => {
        const orderDraw = pick(rng, [
          'duplicate', 'gap', 'negative', 'nonfinite', 'omitted', 'junk', 'valid',
        ] as const)
        let order: unknown
        if (orderDraw === 'duplicate') order = 0
        else if (orderDraw === 'gap') order = int(rng, 3, 20)
        else if (orderDraw === 'negative') order = -int(rng, 1, 20)
        else if (orderDraw === 'nonfinite') order = pick(rng, [NaN, Infinity, -Infinity])
        else if (orderDraw === 'omitted') order = undefined
        else if (orderDraw === 'junk') order = 'x'
        else order = int(rng, 0, 4)
        return { id, zone: pick(rng, ZONES), order, collapsed: false }
      })
      const interleaved = {
        version: 1,
        panes: rawPanes,
        zones: {
          left: { size: int(rng, 160, 300), minimized: false },
          right: { size: int(rng, 160, 300), minimized: false },
          header: { size: int(rng, 32, 100), minimized: false },
          footer: { size: int(rng, 32, 100), minimized: false },
        },
        stage: { size: 640 },
        topBar: { size: 36 },
      }

      // movePane is TOTAL: a random existing pane id / valid zone / arbitrary
      // (possibly junk/out-of-range) order never throws and ALWAYS returns a
      // LayoutState (shape-preserving), and is deterministic.
      const paneId = idCount === 0 ? pick(rng, ['p0', 'p1']) : pick(rng, ids)
      const zone = pick(rng, [...ZONES, 'stage', 'bogus'] as const)
      const order = pick(rng, [undefined, null, NaN, Infinity, -3, 99, 'tail', int(rng, 0, 4)])
      let next: Record<string, unknown>
      try {
        next = movePane(interleaved, paneId, zone, order) as Record<string, unknown>
      } catch (e) {
        return `movePane threw on interleaved order input: ${(e as Error).message}`
      }
      if (next == null || typeof next !== 'object') return `movePane returned non-object: ${JSON.stringify(next)}`
      if (!Array.isArray(next.panes)) return `movePane result has no panes array`
      if (!deepEq(next, movePane(interleaved, paneId, zone, order))) return 'movePane not deterministic over deep-equal inputs'
      // movePane also total over a raw / junk layout (coerceLayout fail-soft).
      for (const junkLayout of [null, 'junk', 42, { version: 99, panes: 'nope' }, { version: 1, panes: [{ id: 'p0', order: NaN }] }]) {
        const j = movePane(junkLayout, 'p0', 'left', 0)
        if (j == null || typeof j !== 'object' || !Array.isArray((j as Record<string, unknown>).panes)) return `movePane over junk layout ${JSON.stringify(junkLayout)} produced non-LayoutState`
      }

      // Self-drop at the SAME (zone, order) is a NO-OP: the pane's (zone, order)
      // is unchanged and the zone ordering is unchanged (the host `commitPaneDrop`
      // F2 no-op gate). Run on the CONTROLLED base where orders are well-known.
      const selfDrop = movePane(base, 'a', 'left', 0)
      const panesSelf = (selfDrop as { panes: Array<{ id: string; zone: string; order: number }> }).panes
      const aSelf = panesSelf.find((p) => p.id === 'a')!
      if (aSelf.zone !== 'left' || aSelf.order !== 0) return `self-drop changed the pane position: ${JSON.stringify(aSelf)}`
      const leftOrder = panesSelf.filter((p) => p.zone === 'left').map((p) => p.order)
      if (!deepEq(leftOrder, [0, 1])) return `self-drop renumbered the zone: ${JSON.stringify(leftOrder)}`

      // Relocate renumbers the vacated source zone 0..n-1 AND the target 0..n-1.
      const reloc = movePane(base, 'a', 'right', 0)
      const panesReloc = (reloc as { panes: Array<{ id: string; zone: string; order: number }> }).panes
      const rightOrder = panesReloc.filter((p) => p.zone === 'right').map((p) => p.order)
      const sourceLeftOrder = panesReloc.filter((p) => p.zone === 'left').map((p) => p.order)
      if (!deepEq(rightOrder, [0, 1])) return `relocate target not renumbered 0..n-1: ${JSON.stringify(rightOrder)}`
      if (!deepEq(sourceLeftOrder, [0])) return `relocate vacated source not renumbered 0..n-1: ${JSON.stringify(sourceLeftOrder)}`

      // Missing pane id / unknown zone → coerced base, unchanged (fail-closed).
      for (const miss of ['nope', '', null, 42]) {
        if (!deepEq(movePane(base, miss, 'left', 0), movePane(base, 'nope', 'left', 0))) return `missing paneId ${JSON.stringify(miss)} should be a fail-closed no-op`
      }
      if (!deepEq(movePane(base, 'a', 'bogus', 0), movePane(base, 'a', 'stage', 0))) return 'unknown zone should be a fail-closed no-op (returns coerced base)'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })
})
