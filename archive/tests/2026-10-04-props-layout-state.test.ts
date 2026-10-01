// tests/props-layout-state.test.ts — Unit U-SHELL-1: the §5.7 PBT register
// (6 rows) for the PURE module `src/renderer/layout-state.ts` (the `LayoutState`
// model + `LAYOUT_VERSION` + `defaultLayout`/`deriveLayout`/`coerceLayout`
// + `isLayoutZoneName`. docs/specs/unit-u-shell-1-layout-zones.md §5.7 rows
// P-IM-1 / P-IM-2 / P-SM-1 / P-SM-2 / P-TP-1 / P-TP-2; §2.6 the pinned
// implementation details that pin the observable contract.)
//
// This is a PBT BACKFILL — the module is ALREADY IMPLEMENTED (GREEN); this
// file must come up all-pass. If any row FAILS it is a FINDING (reported, never
// silently weakened).
//
// Deterministic pinned seed 0x5155E11E (task-mandated), ≤100 attempts/row,
// ≤400 total (6 rows × 60 = 360), stop-after-5. Each row is reported held/
// broken with its Strategy-id and the per-row generator that exercises it.
//
// NEGATIVE generator inputs where the register specifies rejection: non-zone
// names for P-IM-1 ('stage'/'top-bar'/'sidebar'/''/garbage + all non-strings),
// malformed/out-of-version `version` values for P-SM-1 (missing/non-integer/
// negative/zero/>1/NaN/±Infinity), malformed deeply-nested junk + duplicate
// pane ids for P-SM-2, and malformed `defaultZone`/`defaultOrder` for P-TP-2.
//
// Conventions follow tests/props-shell-integration.test.ts +
// tests/unit-ujr1-get-journal.test.ts (vitest node environment, `.js` import
// suffix for `../src/renderer/layout-state.js`, mulberry32 + attempt-loop +
// stop-after-5). Per the spec §5.7 "cannot reject a correct module" note, the
// register deliberately asserts NO load-time clamp claim (sizes preserve
// finite-positive values byte-for-byte).
import { describe, it, expect } from 'vitest'
import {
  LAYOUT_VERSION,
  LAYOUT_PANE_ZONES,
  isLayoutZoneName,
  defaultLayout,
  deriveLayout,
  coerceLayout,
  type LayoutState,
  type LayoutPaneSpec,
} from '../src/renderer/layout-state.js'

// ---------------------------------------------------------------------------
// Deterministic pinned seed + the property harness (≤100/row, ≤400 total,
// stop-after-5). 6 rows × 60 = 360 ≤ 400.
// ---------------------------------------------------------------------------
const PBT_SEED = 0x5155e11e // the task-pinned seed
const PBT_ATTEMPTS = 60 // ≤100/row → 6 × 60 = 360 ≤ 400 total
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
// Deterministic junk generator — arbitrary (possibly deeply-nested / malformed)
// values, including `null`, `undefined`, non-objects, `NaN`/`±Infinity`,
// arrays, and deeply-nested objects with random keys. Seeded → deterministic.
// ---------------------------------------------------------------------------
const KEY_POOL = ['version', 'panes', 'zones', 'stage', 'topBar', 'size', 'minimized', 'order', 'collapsed',
  'id', 'zone', 'left', 'right', 'header', 'footer', 'defaultZone', 'defaultOrder', 'bogus', 'token', 'auth', '']
function genJunk(rng: () => number, depth: number): unknown {
  const guard = rng() < 0.5 || depth <= 0
  const kind = guard
    ? Math.floor(rng() * 7)
    : Math.floor(rng() * 9)
  switch (kind) {
    case 0: return null
    case 1: return undefined
    case 2: return rng() < 0.5
    case 3: {
      // a number — occasionally NaN / ±Infinity / negative / huge
      const n = int(rng, 0, 3)
      return n === 0 ? NaN : n === 1 ? Infinity : n === 2 ? -Infinity : rng() * 1000 - 500
    }
    case 4: {
      // a string — occasionally '' or garbage or a real zone name
      return pick(rng, ['', 'left', 'right', 'header', 'footer', 'stage', 'top-bar', 'sidebar', 'garbage-token'])
    }
    case 5: return int(rng, 0, 50) // integer
    case 6: return [] // empty array (not a record)
    case 7: // array of junk
      return Array.from({ length: int(rng, 0, 3) }, () => genJunk(rng, depth - 1))
    default: {
      // a record with a couple of arbitrary (possibly proto-y) keys
      const obj: Record<string, unknown> = {}
      const keys = new Set<string>()
      const nKeys = int(rng, 0, 3)
      for (let k = 0; k < nKeys; k++) {
        const key = pick(rng, KEY_POOL)
        keys.add(key)
      }
      for (const key of keys) obj[key] = genJunk(rng, depth - 1)
      return obj
    }
  }
}

/** A junk value guaranteed to be a RECORD carrying a `version` field (for the
 *  P-SM-1 version-gate generator). */
function genVersionedJunk(rng: () => number): Record<string, unknown> {
  const base = genJunk(rng, 3)
  const versionValue = pick(rng, [
    undefined, null, 0, -1, 0.5, 1.5, 2, 100, NaN, Infinity, -Infinity, 1, '1', '', true, {}, [],
  ])
  const obj = base && typeof base === 'object' && !Array.isArray(base)
    ? { ...(base as Record<string, unknown>) }
    : {}
  return { ...obj, version: versionValue }
}

const ZONE_NAMES: readonly string[] = ['left', 'right', 'header', 'footer']
const REGION_NAMES: readonly string[] = ['stage', 'top-bar']
// `REGION_NAMES` ('stage'/'top-bar') are serialized regions, NOT pane zones
// (W2-Q2) — the register names them as FALSE. They were previously only
// consulted by the dead `REGION_NAMES` adversarial branch (never GENERATED), so
// they are now seeded into the live rejection pool: `isLayoutZoneName` must
// return false for them, not reach the dead branch at all.
const OTHER_STRINGS: readonly string[] = [
  '', 'sidebar', 'garbage-zone', 'LEFT', '  left  ', 'main', 'zone:left',
  ...REGION_NAMES, // 'stage' / 'top-bar' — regions, not pane zones (false)
]

// ---------------------------------------------------------------------------
// The §5.7 register (6 rows).
// ---------------------------------------------------------------------------
describe('U-SHELL-1 §5.7 the PBT register (deterministic mulberry32)', () => {
  it('P-IM-1 [strat:zone-name-total] `isLayoutZoneName` is a total predicate — true exactly for the four pinned pane zones', () => {
    const rep = runProperty('P-IM-1', 'strat:zone-name-total', (_i, rng) => {
      // generate the value under test: any string or non-string
      const kind = int(rng, 0, 2)
      let v: unknown
      if (kind === 0) v = pick(rng, ZONE_NAMES)
      else if (kind === 1) v = pick(rng, OTHER_STRINGS)
      else v = pick(rng, [null, undefined, 0, 1, -3, true, false, {}, [], [''], NaN, Infinity])
      const expected = typeof v === 'string' && ZONE_NAMES.includes(v)
      if (isLayoutZoneName(v) !== expected) {
        return `isLayoutZoneName(${JSON.stringify(v)}) = ${isLayoutZoneName(v)} (expected ${expected})`
      }
      // adversarial P-IM-1: the region names + garbage must specifically be false
      if (typeof v === 'string' && (REGION_NAMES.includes(v) || !ZONE_NAMES.includes(v)) && isLayoutZoneName(v)) {
        return `isLayoutZoneName(${JSON.stringify(v)}) must be false for a non-zone string`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-IM-2 [strat:coerce-total] `coerceLayout` is TOTAL — any input yields a valid LayoutState and never throws', () => {
    const rep = runProperty('P-IM-2', 'strat:coerce-total', (_i, rng) => {
      // generate a possibly-malformed / deeply-nested / non-object input
      const x = rng() < 0.5 ? genVersionedJunk(rng) : genJunk(rng, 3)
      let l: LayoutState
      try {
        l = coerceLayout(x)
      } catch (e) {
        return `coerceLayout(${JSON.stringify(x)}) threw: ${String(e)}`
      }
      if (l === null || typeof l !== 'object') {
        return `coerceLayout(${JSON.stringify(x)}) returned non-object ${String(l)}`
      }
      // the return is a valid LayoutState-shaped object (deep well-formedness is P-SM-2's row)
      if (!Array.isArray(l.panes)) return `coerceLayout(${JSON.stringify(x)}) panes is not an array`
      for (const z of ['left', 'right', 'header', 'footer']) {
        const zl = (l.zones as Record<string, unknown>)?.[z] as { size?: unknown; minimized?: unknown } | undefined
        if (!zl || typeof zl.size !== 'number' || typeof zl.minimized !== 'boolean') {
          return `coerceLayout(${JSON.stringify(x)}) zone ${z} malformed`
        }
      }
      const stage = (l as { stage?: unknown }).stage as { size?: unknown } | undefined
      const topBar = (l as { topBar?: unknown }).topBar as { size?: unknown } | undefined
      if (!stage || typeof stage.size !== 'number') return `coerceLayout(${JSON.stringify(x)}) stage malformed`
      if (!topBar || typeof topBar.size !== 'number') return `coerceLayout(${JSON.stringify(x)}) topBar malformed`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-TP-1 [strat:coerce-idempotent] `coerceLayout` is idempotent — coercing a coerced result reproduces it exactly', () => {
    const rep = runProperty('P-TP-1', 'strat:coerce-idempotent', (_i, rng) => {
      // generate junk incl. valid-ish layout payloads, then coerce twice
      const x = rng() < 0.5 ? genVersionedJunk(rng) : genJunk(rng, 3)
      let first: LayoutState
      let second: LayoutState
      try {
        first = coerceLayout(x)
        second = coerceLayout(first)
      } catch (e) {
        return `coerceLayout threw on ${JSON.stringify(x)} / its result: ${String(e)}`
      }
      if (!deepEq(second, first)) {
        return `coerceLayout(coerceLayout(${JSON.stringify(x)})) ${JSON.stringify(second)} ≠ coerceLayout(x) ${JSON.stringify(first)}`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-SM-1 [strat:coerce-version-gate] the version gate — any non-exact-1 `version` fails soft to `defaultLayout()`', () => {
    const rep = runProperty('P-SM-1', 'strat:coerce-version-gate', (_i, rng) => {
      // adversarial P-SM-1: drive malformed / out-of-version `version` inputs.
      const x = rng() < 0.5 ? genVersionedJunk(rng) : genJunk(rng, 3)
      // also exercise null/undefined/non-record inputs (missing version → default)
      let l: LayoutState
      try {
        l = coerceLayout(x)
      } catch (e) {
        return `coerceLayout(${JSON.stringify(x)}) threw: ${String(e)}`
      }
      const expectedDefault =
        x === null || typeof x !== 'object'
          ? true // non-record → version "missing" → defaultLayout()
          : Array.isArray(x) === false &&
            (() => {
              const v = (x as Record<string, unknown>).version
              return typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > LAYOUT_VERSION
            })()
      if (expectedDefault) {
        if (!deepEq(l, defaultLayout())) {
          return `malformed/out-of-version input ${JSON.stringify(x)} did NOT coerce to defaultLayout(): ${JSON.stringify(l)}`
        }
      } else {
        // version === LAYOUT_VERSION → preserved, output.version === LAYOUT_VERSION
        if (l.version !== LAYOUT_VERSION) {
          return `version-exact input ${JSON.stringify(x)} produced version ${l.version} (expected ${LAYOUT_VERSION})`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-SM-2 [strat:coerce-state-model] the coerced LayoutState is well-formed — finite-positive sizes, boolean flags, non-empty ids, valid zone, finite order, unique first-wins ids', () => {
    const rep = runProperty('P-SM-2', 'strat:coerce-state-model', (_i, rng) => {
      // adversarial P-SM-2: deeply-nested junk + explicit duplicate pane ids /
      // non-string/empty ids / invalid zone / invalid size / invalid order /
      // invalid minimzed+collapsed.
      const x =
        rng() < 0.5
          ? genVersionedJunk(rng)
          : {
              version: 1,
              panes: [
                { id: 'p', zone: 'left', order: 3, collapsed: true },
                { id: 'p', zone: 'right', order: 9, collapsed: false }, // duplicate → dropped (first wins)
                { id: '', zone: 'header', order: 1, collapsed: false }, // empty id → dropped
                { id: 42, zone: 'footer', order: 2, collapsed: false }, // non-string id → dropped
                { id: 'q', zone: 'stage', order: 'x', collapsed: 'nope' }, // region zone + junk order/collapsed
                { id: 'r', zone: 'bogus', order: NaN, collapsed: true },
              ],
              zones: {
                left: { size: -5, minimized: 'yes' },
                right: { size: NaN, minimized: 1 },
                header: { size: Infinity, minimized: 'no' },
                footer: { size: 48, minimized: rng() < 0.5 },
              },
              stage: { size: 640 },
              topBar: { size: 0 },
            }
      let l: LayoutState
      try {
        l = coerceLayout(x)
      } catch (e) {
        return `coerceLayout(${JSON.stringify(x)}) threw: ${String(e)}`
      }
      if (l.version !== 1) return `L.version = ${l.version} (expected 1)`
      for (const z of LAYOUT_PANE_ZONES as readonly string[]) {
        const zl = l.zones[z as keyof typeof l.zones]
        if (!(Number.isFinite(zl.size) && zl.size > 0)) return `zone ${z} size ${zl.size} not finite-positive`
        if (typeof zl.minimized !== 'boolean') return `zone ${z} minimized "${String(zl.minimized)}" not boolean`
      }
      if (!(Number.isFinite(l.stage.size) && l.stage.size > 0)) return `stage size ${l.stage.size} not finite-positive`
      if (!(Number.isFinite(l.topBar.size) && l.topBar.size > 0)) return `topBar size ${l.topBar.size} not finite-positive`
      const seen = new Set<string>()
      for (const pane of l.panes) {
        if (typeof pane.id !== 'string' || pane.id === '') return `pane id ${JSON.stringify(pane.id)} not a non-empty string`
        if (seen.has(pane.id)) return `duplicate pane id ${pane.id} survived (must be first-wins unique)`
        seen.add(pane.id)
        if (!isLayoutZoneName(pane.zone)) return `pane ${pane.id} zone ${JSON.stringify(pane.zone)} not a valid LayoutZoneName`
        if (!Number.isFinite(pane.order)) return `pane ${pane.id} order ${pane.order} not finite`
        if (typeof pane.collapsed !== 'boolean') return `pane ${pane.id} collapsed "${String(pane.collapsed)}" not boolean`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-TP-2 [strat:derive-deterministic] `deriveLayout` is a deterministic pure projection — panes.length === N, per-spec mapping, version 1, default zones/stage/topBar', () => {
    const rep = runProperty('P-TP-2', 'strat:derive-deterministic', (_i, rng) => {
      // adversarial P-TP-2: generate defaultZone that is sometimes valid,
      // sometimes a region/unknown/missing; defaultOrder sometimes finite,
      // sometimes junk/missing.
      const n = int(rng, 0, 8)
      const specs: LayoutPaneSpec[] = Array.from({ length: n }, (_, index) => {
        const zonePick = int(rng, 0, 3)
        const zone = zonePick === 0 ? pick(rng, ZONE_NAMES as readonly string[]) as LayoutPaneSpec['defaultZone']
          : zonePick === 1 ? pick(rng, [...REGION_NAMES, 'sidebar', 'bogus']) as never
          : undefined
        const orderPick = int(rng, 0, 2)
        const order = orderPick === 0 ? rng() * 50 - 25 : orderPick === 1 ? NaN : undefined
        return { id: `spec-${index}-${int(rng, 0, 100000)}`, defaultZone: zone, defaultOrder: order }
      })
      let a: LayoutState
      let b: LayoutState
      try {
        a = deriveLayout(specs)
        b = deriveLayout(specs)
      } catch (e) {
        return `deriveLayout threw: ${String(e)}`
      }
      if (!deepEq(a, b)) return `deriveLayout(specs) is not deterministic: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`
      if (a.panes.length !== n) return `panes.length ${a.panes.length} !== N=${n}`
      const base = defaultLayout()
      for (const p of specs) {
        const i = a.panes.findIndex((e) => e.id === p.id)
        if (i < 0) return `spec id ${p.id} did not map to a pane`
        const pane = a.panes[i]
        const expZone = isLayoutZoneName(p.defaultZone) ? p.defaultZone : 'left'
        const expOrder =
          typeof p.defaultOrder === 'number' && Number.isFinite(p.defaultOrder) ? p.defaultOrder : i
        if (pane.zone !== expZone) return `pane ${p.id} zone ${pane.zone} (expected ${expZone})`
        if (pane.order !== expOrder) return `pane ${p.id} order ${pane.order} (expected ${expOrder})`
        if (pane.collapsed !== false) return `pane ${p.id} collapsed ${pane.collapsed} (expected false)`
      }
      if (a.version !== LAYOUT_VERSION) return `deriveLayout version ${a.version} (expected ${LAYOUT_VERSION})`
      if (!deepEq(a.zones, base.zones) || !deepEq(a.stage, base.stage) || !deepEq(a.topBar, base.topBar)) {
        return `deriveLayout zones/stage/topBar must equal defaultLayout()'s`
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })
})
