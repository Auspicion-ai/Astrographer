// tests/props-pane-graph.test.ts — Unit U-SHELL-8: the §5.7 PBT register (6 rows)
// for the PURE pane-layout + visibility-mirror helpers of `src/renderer/pane-graph.ts`.
// (docs/specs/unit-u-shell-8-view-menu-pane-visibility.md §5.7 — the register;
// §5.7 non-over-strength note; the §5.8 census.)
//
// The register covers the ONLY pure module surface of U-SHELL-8: the constants
// (P-IM-1), the module-private `resolveEnabledZonePanes` observed through the
// exported `enabledZonePaneCounts`/`assembleAppGraphEnvelope` (P-TP-1, P-SM-1,
// P-SM-2), the visibility mirrors (P-SM-3), and `paneSubtreeRoot` (P-TP-2).
// Rows are typed IM/SM/TP — NEVER F-rows, NEVER §4/F-n rows (the unit's
// fail-states already live as §4 F1–F7; the §5.7 convention forbids duplicating
// them here).
//
// Deterministic pinned seed 0x81758FF7 (the §5.7 PBT budget discipline), ≤100
// attempts/row, ≤400 total, stop-after-5. 6 rows × 60 = 360 ≤ 400.
//
// Status: GREEN — the module is ALREADY IMPLEMENTED (PBT backfill), so the suite
// must come up all-pass. Any FAIL here is a finding (do not weaken).
//
// Negative generators (each must hold, else a mismatch is a FAIL):
//   - a registered-but-DISABLED app-graph pane or an OPERATOR pane NEVER appears
//     in any zone (the §4 F3 unknown-id-dropped consequence in invariant form);
//   - a malformed/garbage `coerceLayout` input NEVER makes `enabledZonePaneCounts`
//     negative or duplicative, and NEVER invents a pane (the union still equals
//     the enabled app-graph set);
//   - `paneSubtreeRoot` with a null def / null ctx / empty zone / render-returns-
//     nothing hits the DOCUMENTED guard `Error('paneSubtreeRoot: …')` — never an
//     unguarded crash or phantom node (W2-N5);
//   - the U-SHELL-3 frame is the ONLY shape (W2-N5): every caller — an explicit
//     `collapsed` boolean OR an omitted/undefined `collapsed` (≡ expanded) — gets
//     the `pane-frame` wrapper, `is-collapsed ⟺ collapsed===true`, and the ALWAYS
//     present collapse control + shared `PANE_COLLAPSE_HANDLER`. The removed
//     pre-U-SHELL-3 "undefined-collapsed root carries NO frame" branch no longer
//     exists, so the P-TP-2 row is satisfied by the landed module with NO
//     expectation of a no-frame root.
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  createPaneRegistry,
  type PaneDefinition,
  type PaneRegistry,
} from '../src/renderer/pane-registry.js'
import {
  assembleAppGraphEnvelope,
  enabledZonePaneCounts,
  paneSubtreeRoot,
  PANE_COLLAPSE_HANDLER,
  PANE_COLLAPSED_CLASS,
  PANE_FRAME_CLASS,
  SIDEBAR_ZONE,
  type AppGraphAssemblyResult,
} from '../src/renderer/pane-graph.js'
import {
  coerceLayout,
  isLayoutZoneName,
  LAYOUT_PANE_ZONES,
  type LayoutState,
  type LayoutZoneName,
} from '../src/renderer/layout-state.js'

// ---------------------------------------------------------------------------
// The closed zone sets (the §5.7 reserved-variant discipline).
// ---------------------------------------------------------------------------
const ZONES: readonly LayoutZoneName[] = ['left', 'right', 'header', 'footer']
const JUNK_ZONES = ['stage', 'top-bar', 'center', 'junk', 'topbar', '']

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG + the property harness (≤100/row, ≤400 total,
// stop-after-5).
// ---------------------------------------------------------------------------
const PBT_SEED = 0x81758ff7
const PBT_ATTEMPTS = 60 // ≤100/row; 6 rows × 60 = 360 ≤ 400
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
function setEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false
  return [...a].every((v) => b.has(v))
}
function classSet(classes: string[] | undefined): Set<string> {
  return new Set(Array.isArray(classes) ? classes.filter((c) => typeof c === 'string') : [])
}

// ---------------------------------------------------------------------------
// Generators — a deterministic (registry-enabled × layout) state.
// ---------------------------------------------------------------------------
interface GenPaneSpec {
  id: string
  scope: 'app-graph' | 'operator'
  defaultZone?: string
  defaultOrder?: number
}

interface GenState {
  registry: PaneRegistry
  /** The raw (coerceLayout-valid OR garbage) layout. The pure helpers coerce it
   *  internally via `coerceLayout`, exactly as the host does. */
  rawLayout: unknown
  /** The authoritative coerced layout (`coerceLayout(rawLayout)`). */
  eff: LayoutState
  enabledAppGraph: PaneDefinition[]
  enabledAppIds: string[]
  allRegisteredIds: string[]
}

function genRawLayout(rng: () => number, appSpecs: GenPaneSpec[], garbage: boolean): unknown {
  if (garbage) {
    // A malformed/hostile layout: `coerceLayout` must fail soft (never throw,
    // never negative/NaN/dup). The unknown id `ghost` is unregistered so it is
    // dropped in placement; the NaN order / junk zone / junk version must coerce.
    const r = rng()
    const panes: unknown[] =
      r < 0.4
        ? [{ id: 'ghost', zone: 'junk', order: 0 / 0, collapsed: 'yes' }, null, 42]
        : r < 0.7
          ? [{ id: 'ghost', zone: 'stage', order: -5 }, { id: 'ghost', zone: 'left' }]
          : 'not-an-array'
    return {
      version: r < 0.8 ? (rng() < 0.5 ? 99 : 'x') : 1,
      panes,
      zones: rng() < 0.5 ? null : { left: 'big', right: { size: -3, minimized: 1 }, header: null },
      stage: 'biggest',
      topBar: undefined,
    }
  }
  const panes: Array<{ id: string; zone: string; order: number; collapsed: boolean }> = []
  for (const s of appSpecs) {
    if (rng() < 0.7) continue // only some panes get an overlay entry
    panes.push({
      id: s.id,
      zone: rng() < 0.7 ? pick(rng, ZONES) : pick(rng, JUNK_ZONES),
      order: rng() < 0.15 ? 0 / 0 : Math.floor(rng() * 8),
      collapsed: rng() < 0.5,
    })
  }
  // Exercise the F5 first-wins dedupe: duplicate an id so coerceLayout keeps
  // only the first entry.
  if (panes.length > 0 && rng() < 0.35) panes.push({ ...panes[0] })
  const zones: Record<string, unknown> = {}
  for (const z of ZONES) zones[z] = { size: 200, minimized: rng() < 0.4 }
  return { version: rng() < 0.1 ? 5 : 1, panes, zones, stage: { size: 640 }, topBar: { size: 36 } }
}

/** A non-minimized layout variant (for the within-zone-placement/order rows,
 *  which observe the pane frames — the C12 tab strip would hide them). */
function genNonMinimizedLayout(rng: () => number, appSpecs: GenPaneSpec[]): LayoutState {
  const raw = genRawLayout(rng, appSpecs, false)
  const eff = coerceLayout(raw)
  const zones: LayoutState['zones'] = {
    left: { ...eff.zones.left, minimized: false },
    right: { ...eff.zones.right, minimized: false },
    header: { ...eff.zones.header, minimized: false },
    footer: { ...eff.zones.footer, minimized: false },
  }
  return { ...eff, zones }
}

function makePaneDef(s: GenPaneSpec): PaneDefinition {
  const def: PaneDefinition = {
    id: s.id,
    title: s.id,
    scope: s.scope,
    render: () => ({ type: 'div', props: { 'data-id': s.id }, content: s.id }),
  }
  if (s.defaultZone !== undefined) (def as unknown as { defaultZone?: string }).defaultZone = s.defaultZone
  if (s.defaultOrder !== undefined)
    (def as unknown as { defaultOrder?: number }).defaultOrder = s.defaultOrder
  return def
}

function genState(rng: () => number, garbageLayout = false): GenState {
  const nApp = 1 + Math.floor(rng() * 6) // 1..6 enabled-eligible app-graph panes
  const appSpecs: GenPaneSpec[] = []
  for (let i = 0; i < nApp; i++) {
    const dzRandom = rng()
    let defaultZone: string | undefined
    if (dzRandom < 0.45) defaultZone = pick(rng, ZONES)
    else if (dzRandom < 0.75) defaultZone = pick(rng, JUNK_ZONES)
    const defaultOrder = rng() < 0.25 ? undefined : Math.floor(rng() * 7)
    appSpecs.push({ id: `pg${i}`, scope: 'app-graph', defaultZone, defaultOrder })
  }
  // Registered-but-DISABLED app-graph panes (never appear in any zone).
  const disSpecs: GenPaneSpec[] = []
  for (let i = 0; i < Math.floor(rng() * 3); i++)
    disSpecs.push({ id: `pd${i}`, scope: 'app-graph', defaultZone: pick(rng, ZONES) })
  // OPERATOR panes (never appear in the app-graph zones).
  const opSpecs: GenPaneSpec[] = []
  for (let i = 0; i < Math.floor(rng() * 3); i++)
    opSpecs.push({ id: `op${i}`, scope: 'operator', defaultZone: pick(rng, ZONES) })

  // Enable a random subset of the app-graph panes (≥1 so the census is exercised).
  const enabledAppIds = appSpecs.filter(() => rng() < 0.8).map((s) => s.id)
  if (enabledAppIds.length === 0) enabledAppIds.push(appSpecs[0].id)

  const registry = createPaneRegistry()
  for (const s of [...appSpecs, ...disSpecs, ...opSpecs]) registry.register(makePaneDef(s))
  for (const id of enabledAppIds) registry.enable(id)

  const rawLayout = genRawLayout(rng, appSpecs, garbageLayout)
  const eff = coerceLayout(rawLayout)
  const enabledAppGraph = registry
    .listByScope('app-graph')
    .filter((p) => registry.isEnabled(p.id))
  return {
    registry,
    rawLayout,
    eff,
    enabledAppGraph,
    enabledAppIds: new Set(enabledAppIds).size === enabledAppIds.length ? enabledAppIds : [...new Set(enabledAppIds)],
    allRegisteredIds: registry.list().map((p) => p.id),
  }
}

function makeTraversal(): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'wiki-root' }, children: [] } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function makeAssemblyInput(
  registry: PaneRegistry,
  layout: unknown,
  revealedZones?: Array<LayoutZoneName | string>,
): { traversalEnvelope: LegacyInitialData; registry: PaneRegistry; ctx: unknown; layout: unknown; revealedZones?: string[] } {
  return {
    traversalEnvelope: makeTraversal(),
    registry,
    ctx: {},
    layout,
    ...(revealedZones !== undefined ? { revealedZones: revealedZones as string[] } : {}),
  }
}

/** Assemble once from a (registry × layout) pair — the observable
 *  `assembleAppGraphEnvelope` surface that mirrors the private
 *  `resolveEnabledZonePanes`. */
function assembleInput(
  registry: PaneRegistry,
  layout: unknown,
  revealedZones?: Array<LayoutZoneName | string>,
): AppGraphAssemblyResult {
  return assembleAppGraphEnvelope(makeAssemblyInput(registry, layout, revealedZones) as never)
}

/** Recover the ordered per-zone pane ids from an assembled envelope. Pane roots
 *  (content payloads) supply the frame order for non-minimized zones; the C12
 *  tab strip (`zone-tab-*` with `data-pane-id`) supplies it for minimized ones,
 *  so the per-zone list is complete and ordered in EVERY mirror state. */
function parseZoneMembership(res: AppGraphAssemblyResult): Record<LayoutZoneName, string[]> {
  const by = new Map<string, string[]>()
  const add = (zone: string, id: string): void => {
    const list = by.get(zone)
    if (list) list.push(id)
    else by.set(zone, [id])
  }
  for (const payload of (res.envelope.content ?? []) as Array<{ content?: LegacyNodeData[] }>) {
    const root = payload?.content?.[0]
    const zone = (root as { placement?: { targetPlacement?: string[] } })?.placement?.targetPlacement?.[0]
    const idProp = (root as { props?: { id?: unknown } })?.props?.id
    if (typeof zone === 'string' && typeof idProp === 'string' && idProp.startsWith('pane-')) {
      add(zone, idProp.slice('pane-'.length))
    }
  }
  for (const cont of (res.envelope?.template?.root?.children ?? []) as Array<Record<string, any>>) {
    const placementName = cont?.placement?.placementName
    const zone =
      typeof placementName === 'string'
        ? placementName
        : typeof cont?.props?.id === 'string' && cont.props.id.startsWith('zone:')
          ? cont.props.id.slice('zone:'.length)
          : undefined
    if (typeof zone !== 'string') continue
    for (const c of (cont?.children ?? []) as Array<Record<string, any>>) {
      const dpid = c?.props?.['data-pane-id']
      if (typeof dpid === 'string' && dpid !== '') add(zone, dpid)
    }
  }
  const out: Record<LayoutZoneName, string[]> = { left: [], right: [], header: [], footer: [] }
  for (const z of ZONES) out[z] = by.get(z) ?? []
  return out
}

/** An independent oracle for the pinned placement rule (+ within-zone / order/
 *  seq sort) — a faithful re-derivation of the §5.7 P-TP-1 proposition. */
function expectedResolve(
  enabledAppGraph: ReadonlyArray<PaneDefinition>,
  eff: LayoutState,
): Record<LayoutZoneName, Array<{ id: string; order: number; seq: number }>> {
  const byId = new Map(eff.panes.map((e) => [e.id, e]))
  const zonePanes: Record<LayoutZoneName, Array<{ id: string; order: number; seq: number }>> = {
    left: [],
    right: [],
    header: [],
    footer: [],
  }
  enabledAppGraph.forEach((def, seq) => {
    const entry = byId.get(def.id)
    const dz = (def as unknown as { defaultZone?: string }).defaultZone
    const zone: LayoutZoneName = entry?.zone ?? (isLayoutZoneName(dz) ? dz : 'left')
    const oo = (def as unknown as { defaultOrder?: number }).defaultOrder
    const order = entry?.order ?? (typeof oo === 'number' && Number.isFinite(oo) ? oo : seq)
    zonePanes[zone].push({ id: def.id, order, seq })
  })
  for (const z of ZONES) zonePanes[z].sort((a, b) => a.order - b.order || a.seq - b.seq)
  return zonePanes
}

// ---------------------------------------------------------------------------
// The §5.7 register (6 rows). All must hold on the LANDED module.
// ---------------------------------------------------------------------------
describe('PBT register (§5.7)', () => {
  it('P-IM-1 [strat:zone-constants] the pane-zone model + mirror constants are stable', () => {
    // Set(LAYOUT_PANE_ZONES) === {left,right,header,footer}; the pinned constants.
    expect(new Set(LAYOUT_PANE_ZONES)).toEqual(new Set<LayoutZoneName>(['left', 'right', 'header', 'footer']))
    expect(LAYOUT_PANE_ZONES).toHaveLength(4)
    expect(SIDEBAR_ZONE).toBe('sidebar')
    expect(PANE_FRAME_CLASS).toBe('pane-frame')
    expect(PANE_COLLAPSED_CLASS).toBe('is-collapsed')

    // After coerceLayout, every zone resolution in the pure helpers lands in
    // the four known zones — never a junk/stage/top-bar zone.
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const s = genState(rng, i % 3 === 0) // mix valid + garbage layouts
      const counts = enabledZonePaneCounts(s.registry, s.rawLayout)
      const keys = Object.keys(counts)
      const known = new Set<LayoutZoneName>(LAYOUT_PANE_ZONES)
      if (keys.length !== known.size || keys.some((k) => !known.has(k as LayoutZoneName))) {
        ces.push(`counts keys ${JSON.stringify(keys)} not the exact four zones`)
      }
      // The pinned constants are mirrored constants the helpers author.
      expect(PANE_FRAME_CLASS).toBe('pane-frame')
      expect(PANE_COLLAPSED_CLASS).toBe('is-collapsed')
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })

  it('P-TP-1 [strat:zone-resolve-total-deterministic] resolveEnabledZonePanes is total + deterministic', () => {
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const s = genState(rng)
      const nonMinLayout = genNonMinimizedLayout(rng, s.enabledAppGraph as unknown as GenPaneSpec[])
      const input = makeAssemblyInput(s.registry, nonMinLayout)
      const r1 = assembleAppGraphEnvelope(input as never)
      const r2 = assembleAppGraphEnvelope(input as never)

      // Determinism: identical inputs → identical envelope + paneIds.
      if (JSON.stringify(r1.envelope) !== JSON.stringify(r2.envelope)) {
        ces.push('determinism broken: re-assembly produced a different envelope')
        continue
      }
      if (JSON.stringify(r1.paneIds) !== JSON.stringify(r2.paneIds)) {
        ces.push('determinism broken: re-assembly produced different paneIds')
      }

      // Totality: the result carries a FULL Record — every one of the four zones
      // is present (an empty zone still keyed + present as a container).
      const mem = parseZoneMembership(r1)
      for (const z of ZONES) if (!Object.prototype.hasOwnProperty.call(mem, z)) ces.push(`zone ${z} missing`)

      // Placement rule + within-zone order/seq sort, per the pinned proposition.
      const effective = coerceLayout(nonMinLayout)
      const expected = expectedResolve(s.enabledAppGraph, effective)
      for (const z of ZONES) {
        const expIds = expected[z].map((p) => p.id)
        if (JSON.stringify(mem[z]) !== JSON.stringify(expIds)) {
          ces.push(
            `zone ${z}: got ${JSON.stringify(mem[z])} ≠ expected ${JSON.stringify(expIds)} (after coerceLayout ${JSON.stringify(effective.version)})`,
          )
        }
      }
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })

  it('P-SM-1 [strat:zone-membership-exact] zone-membership is exact + disjoint; disabled/operator panes never appear', () => {
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const s = genState(rng, i % 2 === 0) // mix valid + garbage layouts
      const mem = parseZoneMembership(assembleInput(s.registry, s.rawLayout))

      // Disjoint + exact: Σ zones.length === length(enabledAppGraph) and the
      // multiset union is set-equal to the enabled app-graph id set (no dup).
      const union = new Set<string>()
      const found: string[] = []
      for (const z of ZONES) for (const id of mem[z]) {
        union.add(id)
        found.push(id)
      }
      if (found.length !== union.size) ces.push('a pane is duplicated across zones')
      if (found.length !== s.enabledAppGraph.length) {
        ces.push(`Σ zones = ${found.length} ≠ enabled ${s.enabledAppGraph.length}`)
      }
      if (!setEqual(union, new Set(s.enabledAppGraph.map((d) => d.id)))) {
        ces.push(`pane-id union ≠ enabled app-graph set`)
      }
      // Every resolved pane is enabled + app-graph scoped; a disabled or operator
      // pane never appears in any zone (the §4 F3 consequence).
      const enabledSet = new Set(s.enabledAppIds)
      for (const id of union) {
        if (!enabledSet.has(id)) ces.push(`non-enabled pane ${id} appeared in a zone`)
      }
      const disabledOrOperator = s.allRegisteredIds.filter((id) => !enabledSet.has(id))
      for (const id of disabledOrOperator) {
        if (union.has(id)) ces.push(`disabled/operator pane ${id} appeared in a zone`)
      }
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })

  it('P-SM-2 [strat:zone-counts-census] enabledZonePaneCounts is the per-zone census summing to the enabled set', () => {
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const s = genState(rng, i % 2 === 0) // mix valid + garbage layouts (negative generator)
      const counts = enabledZonePaneCounts(s.registry, s.rawLayout)

      // Non-negative per zone, exactly the four keys.
      const keys = Object.keys(counts)
      const known = new Set<LayoutZoneName>(LAYOUT_PANE_ZONES)
      if (keys.length !== known.size || keys.some((k) => !known.has(k as LayoutZoneName))) {
        ces.push(`counts keys ${JSON.stringify(keys)} not the exact four zones`)
      }
      let sum = 0
      for (const z of ZONES) {
        const c = counts[z]
        if (typeof c !== 'number' || !Number.isFinite(c) || c < 0) {
          ces.push(`counts[${z}] = ${String(c)} (not a non-negative finite census)`)
          continue
        }
        sum += c
      }

      // Cross-check: counts[zone] === the resolution-derived pane count in that
      // zone (mirrors `zonePanes[zone].length` through the assembly surface).
      const mem = parseZoneMembership(assembleInput(s.registry, s.rawLayout))
      for (const z of ZONES) {
        if (counts[z] !== mem[z].length) {
          ces.push(`counts[${z}]=${counts[z]} ≠ resolution count ${mem[z].length}`)
        }
      }

      // The SINGLE enabled+placed census sums to the enabled app-graph set —
      // garbage layouts never make it negative or duplicative.
      if (sum !== s.enabledAppGraph.length) {
        ces.push(`Σ counts = ${sum} ≠ enabled ${s.enabledAppGraph.length}`)
      }
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })

  it('P-SM-3 [strat:visibility-mirror-deterministic] the visibility mirrors are deterministic functions of the layout', () => {
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const s = genState(rng)
      // A random `revealedZones` subset — incl. junk names that the assembler
      // filters out via isLayoutZoneName.
      const revealedRaw: string[] = []
      for (const z of ZONES) if (rng() < 0.5) revealedRaw.push(z)
      if (rng() < 0.4) revealedRaw.push(pick(rng, JUNK_ZONES))

      const r1 = assembleInput(s.registry, s.rawLayout, revealedRaw)
      const r2 = assembleInput(s.registry, s.rawLayout, revealedRaw)

      // Determinism: identical classes across two assemblies of the same state.
      if (JSON.stringify((r1.envelope as { template: { root: { children: unknown[] } } }).template.root.children) !== JSON.stringify((r2.envelope as { template: { root: { children: unknown[] } } }).template.root.children)) {
        ces.push('zone-mirror classes are not deterministic across re-assembly')
      }

      const eff = s.eff
      const revealedSet = new Set<LayoutZoneName>(
        Array.isArray(revealedRaw) ? revealedRaw.filter((z) => isLayoutZoneName(z)) : [],
      )
      const mem = parseZoneMembership(r1)

      // Zone containers carry the exact mirror classes.
      for (const cont of (r1.envelope?.template?.root?.children ?? []) as Array<Record<string, any>>) {
        const pn = cont?.placement?.placementName
        if (typeof pn !== 'string') continue
        const name = pn as LayoutZoneName
        if (!ZONES.includes(name)) continue
        const classes = classSet(cont?.css?.classes)
        const expectedEmpty = mem[name].length === 0
        const expectedMinimized = eff.zones[name].minimized === true
        const expectedRevealed = revealedSet.has(name)
        if (classes.has('is-empty') !== expectedEmpty) {
          ces.push(`zone ${name}: is-empty mirror wrong (expected ${expectedEmpty})`)
        }
        if (classes.has('is-minimized') !== expectedMinimized) {
          ces.push(`zone ${name}: is-minimized mirror wrong (expected ${expectedMinimized})`)
        }
        if (classes.has('is-revealed') !== expectedRevealed) {
          ces.push(`zone ${name}: is-revealed mirror wrong (expected ${expectedRevealed})`)
        }
        // No contradictory/foreign mirror classes — the container carries ONLY
        // the three mirror classes (no junk/foreign).
        const mirrorOnly = [...classes].filter((c) =>
          ['is-empty', 'is-minimized', 'is-revealed'].includes(c),
        )
        if (mirrorOnly.length !== classes.size) {
          ces.push(`zone ${name} carries a non-mirror class ${JSON.stringify([...classes])}`)
        }
      }

      // Each pane frame carries is-collapsed ⟺ its resolved collapsed===true.
      const byId = new Map(eff.panes.map((e) => [e.id, e]))
      for (const payload of (r1.envelope.content ?? []) as Array<{ content?: LegacyNodeData[] }>) {
        const root = payload?.content?.[0]
        const idProp = (root as { props?: { id?: unknown } })?.props?.id
        if (typeof idProp !== 'string' || !idProp.startsWith('pane-')) continue
        const pid = idProp.slice('pane-'.length)
        const classes = classSet((root as { css?: { classes?: string[] } })?.css?.classes)
        const resolvedCollapsed = byId.get(pid)?.collapsed === true
        if (classes.has(PANE_COLLAPSED_CLASS) !== resolvedCollapsed) {
          ces.push(`pane ${pid}: is-collapsed mirror wrong (expected ${resolvedCollapsed})`)
        }
        if (!classes.has(PANE_FRAME_CLASS)) {
          ces.push(`pane ${pid} frame lacks ${PANE_FRAME_CLASS}`)
        }
      }
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })

  it('P-TP-2 [strat:pane-subtree-root-total] paneSubtreeRoot is total on its domain + hits the documented guard', () => {
    const ces: string[] = []
    const rng = mulberry32(PBT_SEED)
    const render = (): LegacyNodeData => ({ type: 'div', props: { 'data-x': '1' }, content: 'body' })
    const def: PaneDefinition = { id: 'p1', title: 'P1', scope: 'app-graph', render }
    const ctx = {}
    const nullRenderDef: PaneDefinition = {
      id: 'nullpane',
      title: 'Null',
      scope: 'app-graph',
      render: () => null as never, // render returns nothing → guard
    }

    for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
      const zone = pick(rng, [...ZONES, '']) // sometimes the empty-zone guard case
      const collapsed = pick(rng, [undefined, true, false])
      const isGuardZone = zone === ''

      if (isGuardZone) {
        // Empty (or non-string) sidebarZone → the DOCUMENTED guard, never a crash.
        try {
          paneSubtreeRoot(def, ctx, '')
          ces.push('empty sidebarZone did not throw the guard error')
        } catch (e) {
          if (!(e instanceof Error) || !e.message.startsWith('paneSubtreeRoot:')) {
            ces.push(`empty-sidebarZone threw ${String(e)} (not the documented guard)`)
          }
        }
        continue
      }

      // Total on the domain: a non-null def/ctx + non-empty zone always returns
      // a root with the stable pane id + the zone placement.
      let root: LegacyNodeData | undefined
      try {
        root = paneSubtreeRoot(def, ctx, zone, collapsed)
      } catch (e) {
        ces.push(`valid (zone=${zone}) threw ${String(e)}`)
        continue
      }
      if (root == null) {
        ces.push('valid paneSubtreeRoot returned nothing')
        continue
      }
      const props = root.props as { id?: unknown }
      const placement = root.placement as { targetPlacement?: string[] }
      if (props.id !== `pane-${def.id}`) ces.push(`root id ${String(props.id)} ≠ pane-p1`)
      if (!Array.isArray(placement?.targetPlacement) || placement.targetPlacement[0] !== zone) {
        ces.push(`root targetPlacement ≠ [${zone}]`)
      }

      // W2-N5 — the U-SHELL-3 frame is the ONLY shape for EVERY caller, whether
      // it passes an explicit boolean OR omits `collapsed` (undefined ≡ expanded):
      //   - `collapsed ∈ {false,true}` both carry the `pane-frame`;
      //   - `is-collapsed ⟺ collapsed === true`;
      //   - the collapse control + `PANE_COLLAPSE_HANDLER` are ALWAYS present.
      const cls = classSet((root as { css?: { classes?: string[] } }).css?.classes)
      const children = (root.children ?? []) as LegacyNodeData[]
      if (!cls.has(PANE_FRAME_CLASS)) ces.push('root lacks PANE_FRAME_CLASS')
      if (cls.has(PANE_COLLAPSED_CLASS) !== (collapsed === true)) {
        ces.push(`is-collapsed ⟺ ${collapsed} violated`)
      }
      const hasHandler = children.some(
        (c) =>
          Array.isArray((c as { handlers?: unknown }).handlers) &&
          (c as { handlers?: Array<{ name?: string }> }).handlers?.some(
            (h) => h.name === PANE_COLLAPSE_HANDLER,
          ),
      )
      if (!hasHandler) ces.push(`frame lacks the ${PANE_COLLAPSE_HANDLER} handler`)
    }

    // The documented guard surface — never an unguarded crash / phantom.
    for (const [label, fn] of [
      ['null def', () => paneSubtreeRoot(null as never, ctx, 'left')],
      ['null ctx', () => paneSubtreeRoot(def, null as never, 'left')],
      ['empty zone', () => paneSubtreeRoot(def, ctx, '')],
      ['render-null', () => paneSubtreeRoot(nullRenderDef, ctx, 'left', false)],
    ] as Array<[string, () => unknown]>) {
      try {
        fn()
        ces.push(`${label}: did not throw`)
      } catch (e) {
        if (!(e instanceof Error) || !e.message.startsWith('paneSubtreeRoot:')) {
          ces.push(`${label}: threw ${String(e)} (not the documented paneSubtreeRoot guard)`)
        }
      }
    }
    expect(ces, JSON.stringify(ces)).toEqual([])
  })
})
