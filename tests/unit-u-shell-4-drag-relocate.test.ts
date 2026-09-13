// tests/unit-u-shell-4-drag-relocate.test.ts — Unit U-SHELL-4: Pane
// drag/reorder/relocate + C11 empty-zone proximity reveal + C12 zone minimize
// (C4/C11/C12).
//
// TestWriter RED set written from docs/specs/unit-u-shell-4-drag-relocate.md §2
// (contract), §3 (valid paths), §4 (fail-states) + §5 (census) ALONE, with the
// resolved W2-Q6 (pointer-based shell handles now; HTML5 DnD parked), W2-Q7
// (restore last size; one managed write per threshold-crossing) and W2-Q8 (a)
// (minimized zones stay drop targets; edge-derived orientation) from
// docs/specs/wave-2-open-decisions.md, plus ui-overhaul.md §3 (the layout model
// rules) C4/C11/C12.
//
// WHAT IS ALREADY LANDED (U-SHELL-1/3), so NOT re-tested as new:
//   - `LayoutState`/`PaneLayoutEntry`/`ZoneLayout` incl. per-zone `minimized`
//     and `size` (layout-state.ts); `coerceLayout` fail-soft + persistence.
//   - the always-present `zone:<name>` containers + `is-empty`/`is-minimized`
//     mirror classes + per-zone placement/order (pane-graph.ts).
//   - per-pane collapse (U-SHELL-3).
//
// WHAT IS NOT IMPLEMENTED (THIS unit — the red set):
//   - pane reorder (`order`) / relocate (`zone`) gestures (C4);
//   - the drag controller + proximity detector (spec §5 "2 pure-ish helpers"),
//     committed as ONE managed write per threshold-crossing (W2-Q7, F4);
//   - the C11 `is-revealed` drag-time zone marker;
//   - the C12 zone minimize control + provident tab-strip subtree
//     (`on:click` expand/select), edge-derived orientation;
//   - scope legality (an operator pane never targets an app-graph zone).
//
// ===========================================================================
// SPEC AMBIGUITIES FLAGGED HERE (the spec does NOT pin these names/shapes —
// chosen as the most spec-derived seam; the Architect may rename):
//   1. NEW MODULE `src/renderer/pane-drag.ts` for the spec §5 "drag controller +
//      proximity detector (2 pure-ish helpers)" + the C4/C12 model mutations.
//      The spec names only existing build files (§6); this module is the
//      census-derived home for the new pure half.
//   2. `movePane(layout, paneId, zone, order?)` — the C4 `zone`/`order`
//      mutation (§2.2). A single fn covers reorder (same zone) + relocate.
//   3. `withinSnapThreshold(point, zone, threshold)` + `createDragController`
//      (`start`/`move`/`reveal`/`drop`/`cancel`) — the proximity detector + the
//      "one managed write per threshold-crossing" controller (W2-Q7/F4). The
//      per-crossing write is exposed as the `onRevealChange` callback.
//   4. `zoneOrientation(zone)` returns `'vertical' | 'horizontal'`; unknown →
//      `'vertical'` (F8). The spec pins the derivation, not the return spelling.
//   5. `setZoneMinimized(layout, zone, minimized, paneCount)` — the C12 model
//      mutation; F5 (empty zone wins) is enforced by passing the pane count.
//   6. The assembler gains `revealedZones?: LayoutZoneName[]` (the C11
//      `is-revealed` drag marker) and, for a minimized non-empty zone, a
//      provident tab strip + minimize control inside the zone container. The
//      spec pins the behavior, not the option name / node ids / `data-*`.
//   7. "selects that pane" (§2.4) has no home in `LayoutState` (selection is
//      not a serialized field). The tests assert the model expand (minimized
//      false + retained size) + the tab's `data-pane-id`; the live selection is
//      a live-runtime concern (flagged, not invented as a field).
// ===========================================================================
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition } from '../src/renderer/pane-registry.js'
import { assembleAppGraphEnvelope } from '../src/renderer/pane-graph.js'
import {
  type LayoutState,
  type LayoutZoneName,
  type PaneLayoutEntry,
  type ZoneLayout,
} from '../src/renderer/layout-state.js'
import { createOperatorSettingsStore, type OperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createEditController } from '../src/renderer/edit-controller.js'

// ---------------------------------------------------------------------------
// The spec §5 drag module (dynamic import so a missing module fails each spec
// test individually — the U-SHELL-1/U-SHELL-6 convention).
// ---------------------------------------------------------------------------
interface DragPoint {
  x: number
  y: number
}
interface ZoneBounds {
  zone: LayoutZoneName
  left: number
  top: number
  right: number
  bottom: number
}
type PaneScope = 'app-graph' | 'operator'
interface DropResult {
  paneId: string
  zone: LayoutZoneName
  order?: number
}
interface DragController {
  start(paneId: string): void
  move(point: DragPoint, zones: readonly ZoneBounds[]): void
  reveal(): readonly LayoutZoneName[]
  drop(payload?: unknown): DropResult | null
  cancel(): void
}
interface DragModule {
  movePane(layout: LayoutState, paneId: string, zone: LayoutZoneName, order?: number): LayoutState
  legalZonesForScope(scope: PaneScope): LayoutZoneName[]
  withinSnapThreshold(point: DragPoint, zone: ZoneBounds, threshold: number): boolean
  zoneOrientation(zone: unknown): 'vertical' | 'horizontal'
  setZoneMinimized(
    layout: LayoutState,
    zone: LayoutZoneName,
    minimized: boolean,
    paneCount: number,
  ): LayoutState
  createDragController(options: {
    threshold: number
    scopeOf: (paneId: string) => PaneScope | null
    onRevealChange: (revealed: LayoutZoneName[]) => void
  }): DragController
}

async function loadDragModule(): Promise<DragModule> {
  try {
    return (await import('../src/renderer/pane-drag.js')) as unknown as DragModule
  } catch (e) {
    throw new Error(
      'src/renderer/pane-drag.ts not implemented (U-SHELL-4 RED — needs the drag controller + proximity detector)',
      { cause: e },
    )
  }
}

// ---------------------------------------------------------------------------
// Loose node helpers (the render output is LegacyNodeData).
// ---------------------------------------------------------------------------
interface AnyNode {
  type?: string
  content?: unknown
  props?: Record<string, unknown>
  css?: { classes?: string[] }
  placement?: { targetPlacement?: string[]; placementName?: string }
  handlers?: Array<{ name?: string; event?: string; body?: unknown }>
  children?: AnyNode[]
}

function walk(node: AnyNode | null | undefined, out: AnyNode[] = []): AnyNode[] {
  if (node == null || typeof node !== 'object') return out
  out.push(node)
  for (const child of node.children ?? []) walk(child, out)
  return out
}

interface EnvelopeLike {
  template?: { root?: AnyNode }
  content?: Array<{ content?: AnyNode[] }>
}

function allNodes(env: EnvelopeLike): AnyNode[] {
  const out: AnyNode[] = []
  if (env.template?.root) walk(env.template.root, out)
  for (const payload of env.content ?? []) {
    for (const root of payload.content ?? []) walk(root, out)
  }
  return out
}

function findById(env: EnvelopeLike, id: string): AnyNode | undefined {
  return allNodes(env).find((n) => n.props?.id === id)
}

/** The `zone:<name>` container producer (spec §2.3/§2.4 — the C11/C12 mirror
 *  home). Matches the authoritative `placementName` anchor or the id. */
function zoneContainer(env: EnvelopeLike, zone: string): AnyNode | undefined {
  return allNodes(env).find(
    (n) => n.placement?.placementName === zone || n.props?.id === `zone:${zone}`,
  )
}

function classesOf(node: AnyNode | undefined): string[] {
  return node?.css?.classes ?? []
}

/** The `pane-<id>` content root (stable identity — spec §2.2). */
function paneRoot(env: EnvelopeLike, paneId: string): AnyNode | undefined {
  return findById(env, `pane-${paneId}`)
}

/** The content-payload index of a pane root — the observable order channel
 *  (spec §2.2 "mutate `order`"). */
function paneOrder(env: EnvelopeLike, paneId: string): number {
  const payloads = env.content ?? []
  for (let i = 0; i < payloads.length; i++) {
    if ((payloads[i].content ?? []).some((n) => n.props?.id === `pane-${paneId}`)) return i
  }
  return -1
}

function clickHandlerNodes(nodes: AnyNode[]): AnyNode[] {
  return nodes.filter((n) => (n.handlers ?? []).some((h) => h.event === 'click'))
}

function clickHandlerNames(nodes: AnyNode[]): string[] {
  const names = new Set<string>()
  for (const n of nodes) {
    for (const h of n.handlers ?? []) if (h.event === 'click' && h.name) names.add(h.name)
  }
  return [...names]
}

/** The tab nodes inside a minimized zone container: click-handler nodes that
 *  carry a `data-pane-id` (spec §2.4 "each tab represents one contained pane"). */
function tabNodes(container: AnyNode | undefined): AnyNode[] {
  return walk(container).filter(
    (n) => n.props?.['data-pane-id'] !== undefined && (n.handlers ?? []).some((h) => h.event === 'click'),
  )
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
const PANE_ZONES: LayoutZoneName[] = ['left', 'right', 'header', 'footer']

function makeLayout(partial: {
  version?: number
  panes?: PaneLayoutEntry[]
  zones?: Partial<Record<LayoutZoneName, Partial<ZoneLayout>>>
} = {}): LayoutState {
  const base: LayoutState = {
    version: 1,
    panes: [],
    zones: {
      left: { size: 220, minimized: false },
      right: { size: 220, minimized: false },
      header: { size: 48, minimized: false },
      footer: { size: 48, minimized: false },
    },
    stage: { size: 640 },
    topBar: { size: 36 },
  }
  return {
    version: partial.version ?? base.version,
    panes: partial.panes ?? base.panes,
    zones: {
      left: { ...base.zones.left, ...(partial.zones?.left ?? {}) },
      right: { ...base.zones.right, ...(partial.zones?.right ?? {}) },
      header: { ...base.zones.header, ...(partial.zones?.header ?? {}) },
      footer: { ...base.zones.footer, ...(partial.zones?.footer ?? {}) },
    },
    stage: base.stage,
    topBar: base.topBar,
  }
}

function entry(id: string, zone: LayoutZoneName, order: number, collapsed = false): PaneLayoutEntry {
  return { id, zone, order, collapsed }
}

interface PaneSpec {
  id: string
  scope?: PaneScope
  defaultZone?: LayoutZoneName
  defaultOrder?: number
}

function makeRegistry(specs: PaneSpec[]): PaneRegistry {
  const registry = createPaneRegistry()
  for (const s of specs) {
    const def: PaneDefinition = {
      id: s.id,
      title: s.id,
      scope: s.scope ?? 'app-graph',
      render: () => ({ type: 'div', props: { id: `body-${s.id}` }, content: s.id }) as unknown as LegacyNodeData,
    } as PaneDefinition
    if (s.defaultZone !== undefined) def.defaultZone = s.defaultZone
    if (s.defaultOrder !== undefined) def.defaultOrder = s.defaultOrder
    registry.register(def)
    registry.enable(s.id)
  }
  return registry
}

/** A traversal-style base envelope with a `main` container producer + a `rag-`
 *  content root (the U-SHELL-1 fixture). */
function baseEnvelope(mainContent = 'main-body'): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [
          { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
        ],
      },
    },
    content: [
      {
        content: [
          {
            type: 'div',
            props: { id: 'rag-docA' },
            content: mainContent,
            placement: { targetPlacement: ['main'] },
          } as unknown as LegacyNodeData,
        ],
      },
    ],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function assemble(opts: {
  specs?: PaneSpec[]
  layout?: LayoutState
  env?: LegacyInitialData
  revealedZones?: LayoutZoneName[]
}): { envelope: EnvelopeLike; paneIds: string[] } {
  const registry = makeRegistry(opts.specs ?? [])
  const result = assembleAppGraphEnvelope({
    traversalEnvelope: opts.env ?? baseEnvelope(),
    registry,
    ctx: {} as never,
    layout: opts.layout,
    revealedZones: opts.revealedZones,
  } as never)
  return { envelope: result.envelope as unknown as EnvelopeLike, paneIds: result.paneIds }
}

function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell4-'))
  try {
    const path = join(dir, 'settings.json')
    fn(path, createOperatorSettingsStore({ path }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function layoutOf(store: OperatorSettingsStore): LayoutState {
  return (store.get() as unknown as { layout?: LayoutState }).layout as LayoutState
}

/** A minimally wired host whose `bridge.operatorSettings.set` is a spy — the
 *  "one managed write" observation seam (W2-Q7 / spec §2.1 Table B). */
function makeWritableHost(specs: PaneSpec[], layout: LayoutState | null = null) {
  installShim()
  const registry = makeRegistry(specs)
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  const set = vi.fn(async () => ({}))
  const host = new SidebarPanes({
    mount: mountEl() as never,
    operatorMount: mountEl() as never,
    registry,
    bridge: { operatorSettings: { set } } as never,
    backRefs,
    editController,
  })
  ;(host as unknown as { layout: LayoutState | null }).layout = layout
  return { host, registry, set }
}

// ===========================================================================
// §5 / §2.1 — the drag module exists (the shell half of Table B).
// ===========================================================================
describe('U-SHELL-4 — the drag module + pure helpers (spec §5)', () => {
  it('exports the C4/C11/C12 pure helpers + the drag-controller factory', async () => {
    const mod = await loadDragModule()
    expect(typeof mod.movePane).toBe('function')
    expect(typeof mod.withinSnapThreshold).toBe('function')
    expect(typeof mod.zoneOrientation).toBe('function')
    expect(typeof mod.setZoneMinimized).toBe('function')
    expect(typeof mod.createDragController).toBe('function')
  })
})

// ===========================================================================
// §2.2 / §3.1-§3.2 — reorder within a zone + relocate across zones (C4).
// ===========================================================================
describe('U-SHELL-4 — C4 reorder/relocate model mutation (§2.2, §3.1/§3.2)', () => {
  const initial = (): LayoutState =>
    makeLayout({
      panes: [entry('a', 'left', 0), entry('b', 'left', 1), entry('c', 'left', 2)],
      zones: { left: { size: 300, minimized: false }, right: { size: 260, minimized: false } },
    })

  it('§3.1 — reordering a pane within `left` changes its `order`; siblings adjust', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'c', 'left', 0)
    expect(next.panes.find((p) => p.id === 'c')?.order).toBe(0)
    // Siblings shift to accommodate c at the head.
    expect(next.panes.find((p) => p.id === 'a')?.order).toBe(1)
    expect(next.panes.find((p) => p.id === 'b')?.order).toBe(2)
    expect(next.panes.find((p) => p.id === 'c')?.zone).toBe('left')
  })

  it('§3.1 — the relocated/reordered entry keeps its stable pane id (never destroy+recreate)', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'b', 'left', 0)
    expect(next.panes.map((p) => p.id).sort()).toEqual(['a', 'b', 'c'])
    expect(next.panes.find((p) => p.id === 'b')?.order).toBe(0)
  })

  it('§3.2 — relocating an app-graph pane `left` → `right` changes `zone`; `left` loses it; `right` accepts it', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'a', 'right')
    expect(next.panes.find((p) => p.id === 'a')?.zone).toBe('right')
    expect(next.panes.filter((p) => p.zone === 'left').map((p) => p.id)).toEqual(['b', 'c'])
    expect(next.panes.filter((p) => p.zone === 'right').map((p) => p.id)).toContain('a')
  })

  it('§3.2 — relocating into a zone appends at the end when no order is given; the order is normalized', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'a', 'right')
    const rightOrders = next.panes.filter((p) => p.zone === 'right').map((p) => p.order)
    expect(rightOrders).toContain(next.panes.find((p) => p.id === 'a')?.order)
    // The moved pane is last within `right`.
    expect(next.panes.find((p) => p.id === 'a')?.order).toBe(Math.max(...rightOrders))
  })

  it('§2.2 — the mutation is PURE (the input layout is not mutated) and TOTAL (junk never throws)', async () => {
    const { movePane } = await loadDragModule()
    const before = initial()
    const snapshot = JSON.parse(JSON.stringify(before))
    movePane(before, 'a', 'right')
    expect(before).toEqual(snapshot)
    for (const junk of [null, undefined, '', 0]) {
      expect(() => movePane(before, junk as never, 'right' as never)).not.toThrow()
    }
  })

  it('§3.1/§3.2 — the assembled envelope reflects the reordered/relocated layout (zone + payload order)', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'a', 'right', 0)
    const { envelope } = assemble({
      specs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      layout: next,
    })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['right'])
    expect(paneRoot(envelope, 'b')?.placement?.targetPlacement).toEqual(['left'])
    // `left` order: b (0) before c (1).
    expect(paneOrder(envelope, 'b')).toBeLessThan(paneOrder(envelope, 'c'))
  })

  it('§3.9 — a relocate/reorder followed by a content change preserves `pane-<id>` identity + zone', async () => {
    const { movePane } = await loadDragModule()
    const next = movePane(initial(), 'a', 'right')
    const first = assemble({ specs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], layout: next, env: baseEnvelope('one') })
    const second = assemble({ specs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], layout: next, env: baseEnvelope('two') })
    expect(second.envelope.content?.length).toBe(first.envelope.content?.length)
    for (const id of ['a', 'b', 'c']) {
      expect(paneRoot(second.envelope, id)?.props?.id).toBe(`pane-${id}`)
      expect(paneRoot(second.envelope, id)?.placement?.targetPlacement).toEqual(
        paneRoot(first.envelope, id)?.placement?.targetPlacement,
      )
    }
  })
})

// ===========================================================================
// §2.2 / §3.5 / §4 F3 — scope legality: an operator pane never targets an
// app-graph zone.
// ===========================================================================
describe('U-SHELL-4 — scope legality (§2.2, §3.5, F3)', () => {
  it('§2.2 — an app-graph pane may target all four zones', async () => {
    const { legalZonesForScope } = await loadDragModule()
    const legal = legalZonesForScope('app-graph')
    for (const z of PANE_ZONES) expect(legal).toContain(z)
  })

  it('§2.2 — an operator pane has no app-graph zone (stays in the operator layer)', async () => {
    const { legalZonesForScope } = await loadDragModule()
    const legal = legalZonesForScope('operator')
    for (const z of PANE_ZONES) expect(legal).not.toContain(z)
  })

  it('F3 — a scope-illegal zone does not reveal for an operator pane (no proximity target)', async () => {
    const { createDragController } = await loadDragModule()
    const onRevealChange = vi.fn()
    const controller = createDragController({
      threshold: 40,
      scopeOf: () => 'operator',
      onRevealChange,
    })
    controller.start('settings')
    controller.move({ x: 5, y: 5 }, [{ zone: 'left', left: 0, top: 0, right: 100, bottom: 100 }])
    expect(controller.reveal()).toEqual([])
    // No managed reveal write was needed for an illegal target.
    expect(onRevealChange).not.toHaveBeenCalled()
  })

  it('F3 — a scope-illegal drop is rejected and mutates nothing', async () => {
    const { createDragController, movePane } = await loadDragModule()
    const controller = createDragController({
      threshold: 40,
      scopeOf: () => 'operator',
      onRevealChange: vi.fn(),
    })
    controller.start('settings')
    const result = controller.drop({ paneId: 'settings', zone: 'left', order: 0 })
    expect(result).toBeNull()

    const base = makeLayout({ panes: [entry('a', 'left', 0)] })
    const after = movePane(base, 'a', 'left', 0)
    expect(after.panes).toEqual(base.panes)
  })

  it('F1 — a drop on a non-zone area / outside any zone aborts with no mutation', async () => {
    const { createDragController } = await loadDragModule()
    const controller = createDragController({
      threshold: 40,
      scopeOf: () => 'app-graph',
      onRevealChange: vi.fn(),
    })
    controller.start('a')
    expect(controller.drop({ paneId: 'a', zone: 'stage', order: 0 })).toBeNull()
    expect(controller.drop({ paneId: 'a', zone: 'outside', order: 0 })).toBeNull()
  })

  it('F7 — a malformed drop payload is ignored (never a partial mutation)', async () => {
    const { createDragController } = await loadDragModule()
    const controller = createDragController({
      threshold: 40,
      scopeOf: () => 'app-graph',
      onRevealChange: vi.fn(),
    })
    controller.start('a')
    for (const junk of [undefined, null, 'garbage', 42, {}, { paneId: 'a' }, { zone: 'left' }, []]) {
      expect(controller.drop(junk)).toBeNull()
    }
  })

  it('F2 — a drop of a pane onto itself is a no-op', async () => {
    const { movePane } = await loadDragModule()
    const base = makeLayout({ panes: [entry('a', 'left', 0), entry('b', 'left', 1)] })
    const after = movePane(base, 'a', 'left', 0)
    expect(after.panes).toEqual(base.panes)
  })
})

// ===========================================================================
// §2.3 / §3.4 / §4 F4 — C11 proximity reveal + one managed write per
// threshold-crossing (W2-Q7).
// ===========================================================================
describe('U-SHELL-4 — C11 proximity reveal (§2.3, §3.4, F4; W2-Q7)', () => {
  const leftZone = (): ZoneBounds => ({ zone: 'left', left: 0, top: 0, right: 100, bottom: 100 })
  const rightZone = (): ZoneBounds => ({ zone: 'right', left: 300, top: 0, right: 400, bottom: 100 })

  it('§2.3 — `withinSnapThreshold` is true inside the zone + within the threshold band, false otherwise', async () => {
    const { withinSnapThreshold } = await loadDragModule()
    expect(withinSnapThreshold({ x: 50, y: 50 }, leftZone(), 20)).toBe(true)
    // Just outside the right edge but within the threshold band.
    expect(withinSnapThreshold({ x: 115, y: 50 }, leftZone(), 20)).toBe(true)
    // Beyond the band.
    expect(withinSnapThreshold({ x: 140, y: 50 }, leftZone(), 20)).toBe(false)
  })

  it('§3.4 — moving near a hidden zone reveals it; moving away re-hides it', async () => {
    const { createDragController } = await loadDragModule()
    const controller = createDragController({ threshold: 20, scopeOf: () => 'app-graph', onRevealChange: vi.fn() })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone(), rightZone()])
    expect(controller.reveal()).toContain('left')
    controller.move({ x: 200, y: 50 }, [leftZone(), rightZone()])
    expect(controller.reveal()).toEqual([])
  })

  it('F4/W2-Q7 — a per-frame move WITHIN the threshold is ONE managed write, not one per frame', async () => {
    const { createDragController } = await loadDragModule()
    const onRevealChange = vi.fn()
    const controller = createDragController({ threshold: 30, scopeOf: () => 'app-graph', onRevealChange })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone()])
    controller.move({ x: 55, y: 52 }, [leftZone()])
    controller.move({ x: 60, y: 48 }, [leftZone()])
    expect(controller.reveal()).toEqual(['left'])
    expect(onRevealChange).toHaveBeenCalledTimes(1)
  })

  it('F4 — each in/out crossing is exactly one managed write; a repeated crossing is idempotent', async () => {
    const { createDragController } = await loadDragModule()
    const onRevealChange = vi.fn()
    const controller = createDragController({ threshold: 20, scopeOf: () => 'app-graph', onRevealChange })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone()]) // in  → 1
    controller.move({ x: 200, y: 50 }, [leftZone()]) // out → 2
    controller.move({ x: 50, y: 50 }, [leftZone()]) // in  → 3
    controller.move({ x: 50, y: 50 }, [leftZone()]) // same → no write
    controller.move({ x: 200, y: 50 }, [leftZone()]) // out → 4
    expect(onRevealChange).toHaveBeenCalledTimes(4)
    expect(controller.reveal()).toEqual([])
  })

  it('H3 (adversarial) — an unchanged reveal SET in a different order is ZERO managed writes', async () => {
    const { createDragController } = await loadDragModule()
    const onRevealChange = vi.fn()
    const controller = createDragController({ threshold: 120, scopeOf: () => 'app-graph', onRevealChange })
    controller.start('a')
    // A point within the band of BOTH zones; the zone list order flips but the
    // revealed SET does not → the second move must not write again.
    controller.move({ x: 200, y: 50 }, [leftZone(), rightZone()])
    controller.move({ x: 200, y: 50 }, [rightZone(), leftZone()])
    expect(onRevealChange).toHaveBeenCalledTimes(1)
    expect([...controller.reveal()].sort()).toEqual(['left', 'right'])
  })

  it('H4 (adversarial) — duplicate zone bounds yield a de-duplicated reveal list (each zone once)', async () => {
    const { createDragController } = await loadDragModule()
    const controller = createDragController({ threshold: 20, scopeOf: () => 'app-graph', onRevealChange: vi.fn() })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone(), leftZone()])
    const revealed = controller.reveal()
    expect(revealed).toEqual(['left'])
    expect(revealed.filter((z) => z === 'left').length).toBe(1)
  })

  it('W2-Q8 (a) — a MINIMIZED zone still reveals as a drop target on a nearby drag', async () => {
    const { createDragController } = await loadDragModule()
    const controller = createDragController({ threshold: 20, scopeOf: () => 'app-graph', onRevealChange: vi.fn() })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone(), rightZone()])
    const result = controller.drop({ paneId: 'a', zone: 'left', order: 0 })
    expect(result).not.toBeNull()
    expect(result?.zone).toBe('left')
  })

  it('§3.4 — an aborted drag cancels and re-hides (one final write, never a lingering reveal)', async () => {
    const { createDragController } = await loadDragModule()
    const onRevealChange = vi.fn()
    const controller = createDragController({ threshold: 20, scopeOf: () => 'app-graph', onRevealChange })
    controller.start('a')
    controller.move({ x: 50, y: 50 }, [leftZone()])
    controller.cancel()
    expect(controller.reveal()).toEqual([])
    expect(onRevealChange).toHaveBeenCalledTimes(2)
  })

  it('§2.3/§3.4 — the assembled zone container marks the revealed zone with `is-revealed`', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ panes: [] }),
      revealedZones: ['left'],
    })
    expect(classesOf(zoneContainer(envelope, 'left'))).toContain('is-revealed')
    // H1 (adversarial amendment) — `left` is NOT empty: the fixture's pane `a`
    // has no overlay entry and falls back to `left` (the scope default), so it
    // IS emitted into the zone. The prior `.toContain('is-empty')` was wrong.
    expect(classesOf(zoneContainer(envelope, 'left'))).not.toContain('is-empty')
    expect(classesOf(zoneContainer(envelope, 'right'))).not.toContain('is-revealed')
  })

  it('§3.4 — moving away re-hides: no reveal list → no `is-revealed` class', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ panes: [] }),
      revealedZones: [],
    })
    for (const zone of PANE_ZONES) {
      expect(classesOf(zoneContainer(envelope, zone))).not.toContain('is-revealed')
    }
  })
})

// ===========================================================================
// §2.4 / §3.6-§3.7 / §4 F5/F6/F8 — C12 minimize + orientation + tab strip.
// ===========================================================================
describe('U-SHELL-4 — C12 zone minimize + orientation (§2.4, §3.6/§3.7, F5/F6/F8)', () => {
  it('F8 — orientation derives from the zone edge; unknown defaults to vertical and never throws', async () => {
    const { zoneOrientation } = await loadDragModule()
    expect(zoneOrientation('left')).toBe('vertical')
    expect(zoneOrientation('right')).toBe('vertical')
    expect(zoneOrientation('header')).toBe('horizontal')
    expect(zoneOrientation('footer')).toBe('horizontal')
    for (const junk of [undefined, null, 'bogus', 42, {}]) {
      expect(() => zoneOrientation(junk)).not.toThrow()
      expect(zoneOrientation(junk)).toBe('vertical')
    }
  })

  it('§2.4 — minimizing a non-empty zone sets `minimized` and RETAINS `size`', async () => {
    const { setZoneMinimized } = await loadDragModule()
    const base = makeLayout({ panes: [entry('a', 'left', 0)], zones: { left: { size: 300, minimized: false } } })
    const next = setZoneMinimized(base, 'left', true, 1)
    expect(next.zones.left.minimized).toBe(true)
    expect(next.zones.left.size).toBe(300)
    expect(next.zones.right.minimized).toBe(false)
  })

  it('§2.4/§3.6 — expanding restores the retained `size` and clears `minimized`', async () => {
    const { setZoneMinimized } = await loadDragModule()
    const base = makeLayout({ panes: [entry('a', 'left', 0)], zones: { left: { size: 300, minimized: true } } })
    const next = setZoneMinimized(base, 'left', false, 1)
    expect(next.zones.left.minimized).toBe(false)
    expect(next.zones.left.size).toBe(300)
  })

  it('F5 — minimizing an EMPTY zone is a no-op (C11 empty-hidden wins; no tab strip)', async () => {
    const { setZoneMinimized } = await loadDragModule()
    const base = makeLayout({ panes: [], zones: { left: { size: 300, minimized: false } } })
    const next = setZoneMinimized(base, 'left', true, 0)
    expect(next.zones.left.minimized).toBe(false)
  })

  it('F6 — minimizing then relocating the last pane out keeps `minimized` for the next non-empty state', async () => {
    const { setZoneMinimized, movePane } = await loadDragModule()
    const minimized = setZoneMinimized(
      makeLayout({ panes: [entry('a', 'left', 0)], zones: { left: { size: 300, minimized: false } } }),
      'left',
      true,
      1,
    )
    const emptied = movePane(minimized, 'a', 'right')
    expect(emptied.zones.left.minimized).toBe(true)
    expect(emptied.panes.every((p) => p.zone !== 'left')).toBe(true)
  })

  it('§3.6 — minimizing `left` renders a VERTICAL tab strip listing the contained panes', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }, { id: 'b' }],
      layout: makeLayout({
        panes: [entry('a', 'left', 0), entry('b', 'left', 1)],
        zones: { left: { size: 220, minimized: true } },
      }),
    })
    const left = zoneContainer(envelope, 'left')
    expect(classesOf(left)).toContain('is-minimized')
    const tabs = tabNodes(left)
    expect(tabs.map((t) => t.props?.['data-pane-id']).sort()).toEqual(['a', 'b'])
    expect(left?.props?.['data-orientation']).toBe('vertical')
  })

  it('§3.7 — minimizing `header` renders a HORIZONTAL tab strip', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({
        panes: [entry('a', 'header', 0)],
        zones: { header: { size: 48, minimized: true } },
      }),
    })
    const header = zoneContainer(envelope, 'header')
    expect(classesOf(header)).toContain('is-minimized')
    expect(tabNodes(header).length).toBeGreaterThan(0)
    expect(header?.props?.['data-orientation']).toBe('horizontal')
  })

  it('§2.4 — each tab carries a shared `on:click` handler (MCP-dispatchable; 1 handler def per strip)', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }, { id: 'b' }],
      layout: makeLayout({
        panes: [entry('a', 'left', 0), entry('b', 'left', 1)],
        zones: { left: { size: 220, minimized: true } },
      }),
    })
    const tabs = tabNodes(zoneContainer(envelope, 'left'))
    expect(tabs.length).toBe(2)
    const namesA = clickHandlerNames([tabs[0]])
    expect(namesA.length).toBeGreaterThan(0)
    expect(clickHandlerNames([tabs[1]])).toEqual(namesA)
  })

  it('§2.4 — a minimized zone still presents a control (the minimize/expand button) as a provident node', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({
        panes: [entry('a', 'left', 0)],
        zones: { left: { size: 220, minimized: true } },
      }),
    })
    const controls = clickHandlerNodes(walk(zoneContainer(envelope, 'left')))
    expect(controls.length).toBeGreaterThan(0)
  })

  it('F5 — an empty zone never renders a tab strip even when a `minimized` entry is present', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({
        panes: [entry('a', 'right', 0)],
        zones: { left: { size: 220, minimized: true } },
      }),
    })
    const left = zoneContainer(envelope, 'left')
    expect(classesOf(left)).toContain('is-empty')
    expect(tabNodes(left)).toEqual([])
  })
})

// ===========================================================================
// §2.3 / §3.3 — empty-zone hide (track collapses) + retained last size.
// ===========================================================================
describe('U-SHELL-4 — C11 empty-zone hide + retained size (§2.3, §3.3)', () => {
  it('§3.3 — emptying a zone renders `is-empty` (the derived, never-stored flag)', async () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ panes: [entry('a', 'right', 0)] }),
    })
    expect(classesOf(zoneContainer(envelope, 'left'))).toContain('is-empty')
    expect(classesOf(zoneContainer(envelope, 'right'))).not.toContain('is-empty')
  })

  it('H1 (adversarial) — a fallback-placed pane (defaultZone; overlay omits it) makes its zone NON-empty', () => {
    // The overlay is `{panes: []}` (it omits `a`); `a` falls back to its
    // `defaultZone: 'left'`, so it IS emitted into `left`. `is-empty` must
    // reflect the RESOLVED zone pane count (post-fallback), not overlay entries.
    const { envelope } = assemble({
      specs: [{ id: 'a', defaultZone: 'left' }],
      layout: makeLayout({ panes: [] }),
    })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['left'])
    expect(classesOf(zoneContainer(envelope, 'left'))).not.toContain('is-empty')
    // A zone with no resolved pane at all still carries `is-empty`.
    expect(classesOf(zoneContainer(envelope, 'right'))).toContain('is-empty')
  })

  it('§2.3 — the last size is retained when the zone empties and restored when it becomes non-empty', async () => {
    const { movePane } = await loadDragModule()
    const base = makeLayout({
      panes: [entry('a', 'left', 0), entry('b', 'right', 0)],
      zones: { left: { size: 333, minimized: false } },
    })
    const emptied = movePane(base, 'a', 'right')
    expect(emptied.zones.left.size).toBe(333) // retained while empty-hidden
    const refilled = movePane(emptied, 'a', 'left')
    expect(refilled.zones.left.size).toBe(333) // restored on re-populate
  })

  it('§2.3 — an empty zone hides via a derived `is-empty` track collapse (shell CSS), never a stored flag', async () => {
    const { envelope } = assemble({ specs: [{ id: 'a' }], layout: makeLayout({ panes: [] }) })
    expect(Object.prototype.hasOwnProperty.call(envelope, 'hidden')).toBe(false)
    expect(findById(envelope, 'zone:left')?.props?.hidden).toBeUndefined()
  })
})

// ===========================================================================
// §3.8 — the `minimized` state + last `size` persist and restore on restart.
// ===========================================================================
describe('U-SHELL-4 — C12 persistence through OperatorSettings.layout (§2.4, §3.8)', () => {
  it('§3.8 — a `minimized: true` zone + its `size` round-trip through set/get and JSON', () => {
    withTempStore((path, store) => {
      const next = makeLayout({ zones: { left: { size: 321, minimized: true } } })
      store.set({ layout: next } as never)
      expect(layoutOf(store).zones.left.minimized).toBe(true)
      expect(layoutOf(store).zones.left.size).toBe(321)
      const raw = JSON.parse(readFileSync(path, 'utf8'))
      expect(raw.layout.zones.left.minimized).toBe(true)
      expect(raw.layout.zones.left.size).toBe(321)
    })
  })

  it('§3.8 — a persisted minimized+size restores across a store reload (reload → assemble)', () => {
    withTempStore((path, store) => {
      store.set({
        layout: makeLayout({
          panes: [entry('a', 'left', 0)],
          zones: { left: { size: 321, minimized: true } },
        }),
      } as never)
      const reloaded = createOperatorSettingsStore({ path })
      const persisted = layoutOf(reloaded)
      expect(persisted.zones.left.minimized).toBe(true)
      expect(persisted.zones.left.size).toBe(321)
      const { envelope } = assemble({ specs: [{ id: 'a' }], layout: persisted })
      expect(classesOf(zoneContainer(envelope, 'left'))).toContain('is-minimized')
      expect(tabNodes(zoneContainer(envelope, 'left')).length).toBe(1)
    })
  })
})

// ===========================================================================
// §2.1 Table B / §2.2 — the gesture commits ONE managed write (host seam).
// ===========================================================================
describe('U-SHELL-4 — one managed write per gesture (§2.1 Table B, §2.2; W2-Q7)', () => {
  it('§2.2 — a relocate commit goes through the single `setLayout` write-through (bridge.operatorSettings.set once)', async () => {
    const { movePane } = await loadDragModule()
    const { host, set } = makeWritableHost(
      [{ id: 'a' }],
      makeLayout({ panes: [entry('a', 'left', 0)] }),
    )
    const next = movePane((host as unknown as { layout: LayoutState }).layout, 'a', 'right')
    host.setLayout(next)
    expect(set).toHaveBeenCalledTimes(1)
    const patch = set.mock.calls[0][0] as { layout: LayoutState }
    expect(patch.layout.panes.find((p) => p.id === 'a')?.zone).toBe('right')
  })

  it('H2 (adversarial) — minimizing a zone whose only pane is fallback-placed (overlay omits it) minimizes it', () => {
    // The persisted overlay is `{panes: []}`; pane `a` falls back to its
    // `defaultZone: 'left'`. The pre-fix host counted the OVERLAY (0) → the
    // minimize was a no-op even though `left` renders `a`. The enabled+placed
    // census (H1/H2) counts `a` → the zone minimizes to a tab strip.
    const { host, set } = makeWritableHost(
      [{ id: 'a', defaultZone: 'left' }],
      makeLayout({ panes: [] }),
    )
    ;(host as unknown as { zoneMinimizeToggle(zone: string): void }).zoneMinimizeToggle('left')
    expect(set).toHaveBeenCalledTimes(1)
    const committed = (host as unknown as { layout: LayoutState }).layout
    expect(committed.zones.left.minimized).toBe(true)
    const { envelope } = assemble({ specs: [{ id: 'a', defaultZone: 'left' }], layout: committed })
    expect(classesOf(zoneContainer(envelope, 'left'))).toContain('is-minimized')
    expect(tabNodes(zoneContainer(envelope, 'left')).length).toBe(1)
  })

  it('§2.4 — a minimize commit goes through the single `setLayout` write-through and persists `minimized`', async () => {
    const { setZoneMinimized } = await loadDragModule()
    const { host, set } = makeWritableHost(
      [{ id: 'a' }],
      makeLayout({ panes: [entry('a', 'left', 0)] }),
    )
    const next = setZoneMinimized((host as unknown as { layout: LayoutState }).layout, 'left', true, 1)
    host.setLayout(next)
    expect(set).toHaveBeenCalledTimes(1)
    const patch = set.mock.calls[0][0] as { layout: LayoutState }
    expect(patch.layout.zones.left.minimized).toBe(true)
  })
})

// ===========================================================================
// F2 (blind-test regression) — self-drop no-op + §3.1 within-zone insertion
// index. The reachable host drop path (`commitPaneDrop`) must derive the
// insertion index from the drop point AND no-op when the pane lands in its
// current zone/order (docs/specs/unit-u-shell-4-drag-relocate.md §4 F2,
// §2.5 pin 9, §3.1).
// ===========================================================================
describe('U-SHELL-4 — F2 host self-drop no-op + §3.1 within-zone drop index (blind-test regression)', () => {
  it('F2 — dropping a pane onto its own position is a no-op: 0 operatorSettings.set writes + order unchanged', () => {
    const { host, set } = makeWritableHost(
      [{ id: 'a' }, { id: 'b' }],
      makeLayout({ panes: [entry('a', 'left', 0), entry('b', 'left', 1)] }),
    )
    // Pointer at the very top of `left` = `a`'s own slot (the blind-test F2 probe).
    host.startPaneDrag('a')
    host.movePaneDrag({ x: 10, y: 1 }, [{ zone: 'left', left: 0, top: 0, right: 300, bottom: 100 }])
    const result = host.commitPaneDrop({ zone: 'left', paneId: 'a' })
    expect(result?.zone).toBe('left')
    expect(set).not.toHaveBeenCalled()
    const panes = (host as unknown as { layout: LayoutState }).layout.panes
    expect(panes.find((p) => p.id === 'a')?.order).toBe(0)
    expect(panes.find((p) => p.id === 'b')?.order).toBe(1)
  })

  it('§3.1 — a within-zone drag to a lower index inserts the pane at that index (never appended)', () => {
    const { host, set } = makeWritableHost(
      [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      makeLayout({ panes: [entry('a', 'left', 0), entry('b', 'left', 1), entry('c', 'left', 2)] }),
    )
    // Drag `c` to the top band of `left` → insertion index 0.
    host.startPaneDrag('c')
    host.movePaneDrag({ x: 10, y: 1 }, [{ zone: 'left', left: 0, top: 0, right: 300, bottom: 300 }])
    host.commitPaneDrop({ zone: 'left', paneId: 'c' })
    expect(set).toHaveBeenCalledTimes(1)
    const panes = (host as unknown as { layout: LayoutState }).layout.panes
    expect(panes.find((p) => p.id === 'c')?.order).toBe(0)
    expect(panes.find((p) => p.id === 'a')?.order).toBe(1)
    expect(panes.find((p) => p.id === 'b')?.order).toBe(2)
  })
})

// ===========================================================================
// §5 census — the shell CSS for the C11/C12 markers (index.html).
// ===========================================================================
describe('U-SHELL-4 — the C11/C12 shell CSS rules (spec §5 census)', () => {
  const html = readFileSync(fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)), 'utf8')
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

  interface CssRule {
    selectors: string[]
    decls: Array<{ prop: string; value: string }>
  }

  /** A deliberately tiny flat-stylesheet parser (no dependency): strip comments
   *  then read `selector{...}` blocks. */
  function parseCssRules(css: string): CssRule[] {
    const rules: CssRule[] = []
    const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
    const blockRe = /([^{}]+)\{([^{}]*)\}/g
    let m: RegExpExecArray | null
    while ((m = blockRe.exec(noComments)) != null) {
      const selectors = m[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const decls = m[2]
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => {
          const idx = d.indexOf(':')
          return { prop: d.slice(0, idx).trim(), value: d.slice(idx + 1).trim() }
        })
      rules.push({ selectors, decls })
    }
    return rules
  }

  it('index.html authors `is-revealed` (C11 provisional drop target) styling', () => {
    expect(style).toContain('is-revealed')
  })

  it('index.html authors `is-minimized` (C12 tab-strip / track collapse) styling', () => {
    expect(style).toContain('is-minimized')
  })

  it('H6 (adversarial) — an empty+non-revealed zone collapses its grid track; a non-empty zone does not', () => {
    const rules = parseCssRules(style)
    const collapseDecls = rules.flatMap((rule) =>
      rule.selectors
        .filter((sel) => /:has\(/.test(sel) && /\.is-empty/.test(sel) && /:not\(\.is-revealed\)/.test(sel))
        .flatMap((sel) => rule.decls.map((d) => ({ sel, prop: d.prop, value: d.value }))),
    )
    // Every zone's track collapses to zero for the empty+non-revealed case.
    for (const zone of ['left', 'right', 'header', 'footer']) {
      const collapses = collapseDecls.some(
        (d) =>
          d.sel.includes(`[data-zone='${zone}']`) &&
          /^--zone-.*-track$/.test(d.prop) &&
          /^0(px)?$/.test(d.value),
      )
      expect(collapses, `zone ${zone} must have a collapse rule`).toBe(true)
    }
    // A NON-empty zone (no `is-empty` class) is never matched: every
    // track-collapse declaration is gated on `.is-empty`.
    for (const rule of rules) {
      const collapses = rule.decls.some(
        (d) => /^--zone-.*-track$/.test(d.prop) && /^0(px)?$/.test(d.value),
      )
      if (!collapses) continue
      for (const sel of rule.selectors) expect(sel).toContain('.is-empty')
    }
  })
})

// ===========================================================================
// §3 state 6 + the live drag gesture / MCP equivalence — NOT node-testable
// (requires the live Runtime + a real pointer stream); battery placeholders
// (the U-SHELL-1/U-SHELL-3 convention).
// ===========================================================================
describe.skip('U-SHELL-4 — live pointer drag + MCP-visible equivalence (battery)', () => {
  it.skip('§3.1 — a real pointer drag reorders a pane and commits one managed write', () => {})
  it.skip('§3.4 — a real pointer drag near a hidden zone reveals it in the live DOM', () => {})
  it.skip('§3.6 — `provident.dispatch` on a tab expands + selects the pane', () => {})
  it.skip('§2.4 — `get_rendered_html` reflects the minimized tab-list', () => {})
})
