// tests/unit-u-shell-5-resizable-gutters.test.ts — Unit U-SHELL-5: resizable
// gutters (C7).
//
// TestWriter RED set written from docs/specs/unit-u-shell-5-resizable-gutters.md
// §2 (contract), §3 (valid paths), §4 (fail-states) + §5 (census) ALONE, with
// the resolved W2-Q7 (restore last size; one managed write per
// threshold-crossing) and W2-Q9 (pinned min/max; optional double-click reset)
// from docs/specs/wave-2-open-decisions.md, plus ui-overhaul.md C7 / §2.1
// Table C / §3 / §7.3 OB2.
//
// WHAT IS ALREADY LANDED (U-SHELL-1/3/4), so reused rather than re-tested as
// new:
//   - `LayoutState` / `ZoneLayout.size` / `stage.size` + `coerceLayout` +
//     the C9 `OperatorSettings.layout` carrier + `setLayout` write-through.
//   - `layoutCssVars` / `applyLayoutToRoot` project a size onto the shell grid
//     (`--zone-*-size` / `--stage-weight`) — the "track resizes" observable.
//   - the `zone:<name>` container producers + `is-empty` / `is-minimized`
//     mirror classes (the C11/C12 hides).
//
// WHAT IS NOT IMPLEMENTED (THIS unit — the red set):
//   - the shell gutter/resize controller (pointer capture + rect math) +
//     clamp/min constants (§5 census);
//   - `ZoneLayout.size` clamp on a drag gesture (min/max, W2-Q9);
//   - one managed write at GESTURE END (never per-move) (W2-Q7 / §2.1);
//   - the empty/minimized "no gutter" gate (§2.3);
//   - the double-click reset-to-registry-default (REQUIRED for v1, W2-Q9 /
//     spec §2.2 + §2.5 pin 5);
//   - `index.html` gutter geometry + C1 token styling (§2.4).
//
// ===========================================================================
// SPEC AMBIGUITIES FLAGGED HERE (the spec names NO module/function/constant —
// these are the most spec-derived seams; the Architect may rename):
//   1. NEW MODULE `src/renderer/pane-gutter.ts` for the spec §5 "1 shell
//      gutter/resize controller (pointer capture + rect math) + clamp/min
//      constants". Mirrors U-SHELL-4's `pane-drag.ts` convention.
//   2. `createGutterController({ onCommit, isResizable, bounds })` —
//      `start(zone)`/`move(size)`/`end()`/`cancel()`/`reset(zone?)`/`active()`/
//      `preview()`. `onCommit(zone, size)` is the ONE managed write seam at
//      gesture end (W2-Q7). The spec pins the behavior, not the spelling.
//   3. `clampGutterSize(zone, size)` + `gutterBounds(zone)` + `setZoneSize(
//      layout, zone, size)` — the §2.2 clamp + the `ZoneLayout.size` mutation.
//      The side-column bounds are pinned to the LANDED `LAYOUT_ZONE_MIN`/
//      `LAYOUT_ZONE_MAX`; the row (header/footer) bounds are read back from
//      `gutterBounds` (W2-N2 leaves "optional per-axis minimums" to this unit,
//      so the exact row numbers are NOT over-pinned).
//   4. `isGutterResizable(empty, minimized)` — the §2.3 gate.
//   5. `GUTTER_ZONES` / `gutterAxis(zone)` — the four trimmed gutters
//      (`left|stage`, `stage|right`, header/footer vs the main row) +
//      orientation. The spec pins the set, not the identifier.
//   6. `stage.size` is never collapsed by a zone-drag commit; the clamp leaves
//      the stage a minimum (§2.2). No separate stage-gutter mutation is pinned
//      by the spec, so none is invented.
// ===========================================================================
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  LAYOUT_ZONE_MIN,
  LAYOUT_ZONE_MAX,
  defaultLayout,
  coerceLayout,
  layoutCssVars,
  type LayoutState,
  type LayoutZoneName,
  type ZoneLayout,
} from '../src/renderer/layout-state.js'
import {
  createOperatorSettingsStore,
  type OperatorSettingsStore,
} from '../src/main/operator-settings-store.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createEditController } from '../src/renderer/edit-controller.js'

// ---------------------------------------------------------------------------
// The spec §5 gutter module (dynamic import so a missing module fails each spec
// test individually — the U-SHELL-1/U-SHELL-4/U-SHELL-6 convention).
// ---------------------------------------------------------------------------
type GutterAxis = 'columns' | 'rows'
interface GutterBounds {
  min: number
  max: number
}
interface GutterController {
  start(zone: LayoutZoneName): void
  move(size: number): void
  end(): number | null
  cancel(): void
  reset(zone?: LayoutZoneName): number | null
  active(): LayoutZoneName | null
  preview(): number | null
}
interface GutterModule {
  GUTTER_ZONES: readonly LayoutZoneName[]
  createGutterController(options: {
    onCommit: (zone: LayoutZoneName, size: number) => void
    isResizable?: (zone: LayoutZoneName) => boolean
    bounds?: (zone: LayoutZoneName) => GutterBounds
  }): GutterController
  gutterAxis(zone: unknown): GutterAxis
  gutterBounds(zone: LayoutZoneName): GutterBounds
  clampGutterSize(zone: LayoutZoneName, size: number): number
  setZoneSize(layout: LayoutState, zone: LayoutZoneName, size: number): LayoutState
  isGutterResizable(empty: boolean, minimized: boolean): boolean
}

async function loadGutterModule(): Promise<GutterModule> {
  try {
    return (await import('../src/renderer/pane-gutter.js')) as unknown as GutterModule
  } catch (e) {
    throw new Error(
      'src/renderer/pane-gutter.ts not implemented (U-SHELL-5 RED — needs the gutter resize controller + clamp/min constants)',
      { cause: e },
    )
  }
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
const PANE_ZONES: LayoutZoneName[] = ['left', 'right', 'header', 'footer']

function makeLayout(partial: {
  version?: number
  zones?: Partial<Record<LayoutZoneName, Partial<ZoneLayout>>>
  stage?: { size: number }
} = {}): LayoutState {
  const base = defaultLayout()
  return {
    ...base,
    version: partial.version ?? base.version,
    zones: {
      left: { ...base.zones.left, ...(partial.zones?.left ?? {}) },
      right: { ...base.zones.right, ...(partial.zones?.right ?? {}) },
      header: { ...base.zones.header, ...(partial.zones?.header ?? {}) },
      footer: { ...base.zones.footer, ...(partial.zones?.footer ?? {}) },
    },
    stage: partial.stage ?? base.stage,
  }
}

function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell5-'))
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

/** A minimally wired gutter host whose `bridge.operatorSettings.set` is a spy —
 *  the "one managed write" observation seam for the H-1 host regression (the
 *  U-SHELL-4 `makeWritableHost` convention). */
function makeGutterHost(
  specs: Array<{ id: string; defaultZone?: LayoutZoneName }>,
  layout: LayoutState | null = null,
): { host: SidebarPanes; set: ReturnType<typeof vi.fn> } {
  installShim()
  const registry = createPaneRegistry()
  for (const s of specs) {
    const def = {
      id: s.id,
      title: s.id,
      scope: 'app-graph' as const,
      render: () => ({ type: 'div', props: { id: `body-${s.id}` }, content: s.id }) as never,
    } as Parameters<typeof registry.register>[0]
    if (s.defaultZone !== undefined) def.defaultZone = s.defaultZone
    registry.register(def)
    registry.enable(s.id)
  }
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
  return { host, set }
}

// ===========================================================================
// §5 + §2.1 — the gutter module + the clamp/min constants exist.
// ===========================================================================
describe('U-SHELL-5 — the gutter module + clamp/min constants (spec §5, §2.1)', () => {
  it('exports the resize controller, the clamp helpers, the axis + resizability gates + the gutter-zone census', async () => {
    const mod = await loadGutterModule()
    expect(typeof mod.createGutterController).toBe('function')
    expect(typeof mod.clampGutterSize).toBe('function')
    expect(typeof mod.gutterBounds).toBe('function')
    expect(typeof mod.setZoneSize).toBe('function')
    expect(typeof mod.gutterAxis).toBe('function')
    expect(typeof mod.isGutterResizable).toBe('function')
    expect(Array.isArray(mod.GUTTER_ZONES)).toBe(true)
  })

  it('§2.1 — the four trimmed gutters are left|stage, stage|right, header/footer vs the main row', async () => {
    const { GUTTER_ZONES } = await loadGutterModule()
    expect([...GUTTER_ZONES].sort()).toEqual(['footer', 'header', 'left', 'right'])
  })

  it('§2.1 — orientation: side columns are `columns`, header/footer rows are `rows`', async () => {
    const { gutterAxis } = await loadGutterModule()
    expect(gutterAxis('left')).toBe('columns')
    expect(gutterAxis('right')).toBe('columns')
    expect(gutterAxis('header')).toBe('rows')
    expect(gutterAxis('footer')).toBe('rows')
  })
})

// ===========================================================================
// §2.2 + §3.3 + §4 F1 — the clamp (pinned min/max, W2-Q9; never a collapsed
// track).
// ===========================================================================
describe('U-SHELL-5 — the gutter clamp (spec §2.2, §3.3, F1; W2-Q9)', () => {
  it('§2.2/W2-Q9 — a side-column drag below the minimum commits the pinned `LAYOUT_ZONE_MIN` (never a collapsed/negative track)', async () => {
    const { clampGutterSize } = await loadGutterModule()
    const clamped = clampGutterSize('left', -50)
    expect(clamped).toBe(LAYOUT_ZONE_MIN)
    expect(clamped).toBeGreaterThan(0)
  })

  it('§2.2/W2-Q9 — a side-column drag above the maximum commits the pinned `LAYOUT_ZONE_MAX`', async () => {
    const { clampGutterSize } = await loadGutterModule()
    expect(clampGutterSize('left', 99999)).toBe(LAYOUT_ZONE_MAX)
    expect(clampGutterSize('right', 99999)).toBe(LAYOUT_ZONE_MAX)
  })

  it('§2.2 — an in-range size passes through; `gutterBounds` reports a finite positive min ≤ max', async () => {
    const { clampGutterSize, gutterBounds } = await loadGutterModule()
    expect(clampGutterSize('left', 300)).toBe(300)
    for (const zone of PANE_ZONES) {
      const { min, max } = gutterBounds(zone)
      expect(Number.isFinite(min)).toBe(true)
      expect(Number.isFinite(max)).toBe(true)
      expect(min).toBeGreaterThan(0)
      expect(max).toBeGreaterThanOrEqual(min)
    }
  })

  it('F1 — NaN/±Infinity clamp to a finite positive track, never NaN/Infinity/negative', async () => {
    const { clampGutterSize } = await loadGutterModule()
    for (const junk of [NaN, Infinity, -Infinity]) {
      const value = clampGutterSize('left', junk)
      expect(Number.isFinite(value)).toBe(true)
      expect(value).toBeGreaterThan(0)
    }
  })

  it('§2.2 — `setZoneSize` is PURE (input not mutated) and mutates only the target zone size', async () => {
    const { setZoneSize } = await loadGutterModule()
    const before = makeLayout({ zones: { left: { size: 220, minimized: false } } })
    const snapshot = JSON.parse(JSON.stringify(before))
    const next = setZoneSize(before, 'left', 300)
    expect(next.zones.left.size).toBe(300)
    expect(before).toEqual(snapshot)
    for (const zone of ['right', 'header', 'footer'] as LayoutZoneName[]) {
      expect(next.zones[zone]).toEqual(before.zones[zone])
    }
    expect(next.stage).toEqual(before.stage)
    expect(next.panes).toEqual(before.panes)
  })

  it('§3.3 — a below-min `setZoneSize` commits the clamped value (never a collapsed/negative track); the stage keeps its size', async () => {
    const { setZoneSize, clampGutterSize } = await loadGutterModule()
    const next = setZoneSize(makeLayout(), 'left', 1)
    expect(next.zones.left.size).toBe(clampGutterSize('left', 1))
    expect(next.zones.left.size).toBeGreaterThan(0)
    expect(Number.isFinite(next.stage.size)).toBe(true)
    expect(next.stage.size).toBeGreaterThan(0)
  })

  it('§3.3 — `layoutCssVars` reflects the resized track (`--zone-left-size`, `--zone-header-size`)', async () => {
    const { setZoneSize } = await loadGutterModule()
    const left = setZoneSize(makeLayout(), 'left', 300)
    expect(layoutCssVars(left)['--zone-left-size']).toBe('300px')
    const header = setZoneSize(makeLayout(), 'header', 96)
    expect(layoutCssVars(header)['--zone-header-size']).toBe('96px')
  })

  it('F1 — a corrupt persisted size fails soft to the default track (the restore path)', async () => {
    const coerced = coerceLayout({
      version: 1,
      zones: { left: { size: NaN, minimized: false } },
    })
    expect(coerced.zones.left.size).toBe(defaultLayout().zones.left.size)
    expect(Number.isFinite(coerced.zones.left.size)).toBe(true)
  })
})

// ===========================================================================
// §2.3 + §3.6 + §4 F3 — an empty/minimized zone has no gutter.
// ===========================================================================
describe('U-SHELL-5 — empty/minimized zones have no gutter (spec §2.3, §3.6, F3)', () => {
  it('§2.3 — `isGutterResizable` is false for empty or minimized, true only for a non-empty expanded zone', async () => {
    const { isGutterResizable } = await loadGutterModule()
    expect(isGutterResizable(false, false)).toBe(true)
    expect(isGutterResizable(true, false)).toBe(false)
    expect(isGutterResizable(false, true)).toBe(false)
    expect(isGutterResizable(true, true)).toBe(false)
  })

  it('§3.6/F3 — a gesture on a non-resizable (empty/minimized) zone is a no-op: 0 commits, no active gesture', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit, isResizable: () => false })
    controller.start('left')
    controller.move(300)
    const committed = controller.end()
    expect(onCommit).not.toHaveBeenCalled()
    expect(committed).toBeNull()
    expect(controller.active()).toBeNull()
  })

  it('§2.3 — the resizability gate is consulted with the target zone and a true result enables the gesture', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const isResizable = vi.fn((zone: LayoutZoneName) => zone === 'right')
    const controller = createGutterController({ onCommit, isResizable })
    controller.start('right')
    controller.move(280)
    controller.end()
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('right', 280)
    expect(isResizable).toHaveBeenCalledWith('right')
  })

  it('H-1 (adversarial) — `reset` on a non-resizable zone is a no-op: null + 0 commits (mirrors `start`)', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit, isResizable: () => false })
    const result = controller.reset('left')
    expect(result).toBeNull()
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('H-1 (adversarial) — the host `resetGutter` on an empty/minimized zone writes 0 `operatorSettings.set`', async () => {
    // An EMPTY zone (no enabled+placed panes) → count 0 → non-resizable.
    const empty = makeGutterHost([], makeLayout({ zones: { left: { minimized: false } } }))
    expect(empty.host.resetGutter('left')).toBeNull()
    expect(empty.set).not.toHaveBeenCalled()
    // A MINIMIZED zone (a pane is placed, but minimized) → non-resizable.
    const minimized = makeGutterHost(
      [{ id: 'a', defaultZone: 'left' }],
      makeLayout({ zones: { left: { minimized: true } } }),
    )
    expect(minimized.host.resetGutter('left')).toBeNull()
    expect(minimized.set).not.toHaveBeenCalled()
  })

  it('H-3 (adversarial) — a non-boolean falsy resizability predicate result refuses the gesture (fail closed)', async () => {
    const { createGutterController } = await loadGutterModule()
    for (const falsy of [undefined, null, 0, ''] as const) {
      const onCommit = vi.fn()
      const controller = createGutterController({
        onCommit,
        isResizable: (() => falsy) as unknown as (zone: LayoutZoneName) => boolean,
      })
      controller.start('left')
      expect(controller.active()).toBeNull()
      controller.move(300)
      expect(controller.end()).toBeNull()
      expect(onCommit).not.toHaveBeenCalled()
    }
  })
})

// ===========================================================================
// §3.1/§3.2/§3.5/§3.7 + §4 F2/F4/F5 — the pointer gesture: ONE commit at
// gesture end, never per-move (W2-Q7).
// ===========================================================================
describe('U-SHELL-5 — one managed write at gesture end (spec §2.1, §3.1/§3.2/§3.5/§3.7; W2-Q7)', () => {
  it('§3.1 — dragging the left|stage gutter commits `left` size ONCE at end; intermediate moves do not write', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('left')
    controller.move(240)
    controller.move(280)
    controller.move(300)
    expect(onCommit).not.toHaveBeenCalled()
    const committed = controller.end()
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('left', 300)
    expect(committed).toBe(300)
    expect(controller.active()).toBeNull()
  })

  it('§3.2 — dragging the stage|right gutter commits `right` size once at end', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('right')
    controller.move(260)
    controller.move(320)
    controller.end()
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('right', 320)
  })

  it('§3.7 — the header/footer rows resize with the same one-commit model', async () => {
    const { createGutterController, clampGutterSize } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('header')
    controller.move(70)
    controller.move(80)
    controller.end()
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('header', clampGutterSize('header', 80))
  })

  it('§3.5/F4 — a multi-move gesture is exactly ONE commit (no per-move write), and a second end with no new start writes nothing more', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('left')
    for (let size = 230; size <= 300; size += 10) controller.move(size)
    controller.end()
    controller.end()
    expect(onCommit).toHaveBeenCalledTimes(1)
  })

  it('F4 — end/move without an active gesture is a no-op (never a partial stream)', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    expect(controller.end()).toBeNull()
    controller.move(300)
    expect(onCommit).not.toHaveBeenCalled()
    controller.start('left')
    controller.end() // no move → no write
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('F2 — a pointer cancel ends the gesture with at most the last valid commit (no lingering active state)', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('left')
    controller.move(275)
    controller.cancel()
    expect(controller.active()).toBeNull()
    expect(onCommit.mock.calls.length).toBeLessThanOrEqual(1)
    for (const call of onCommit.mock.calls) {
      expect(Number.isFinite(call[1])).toBe(true)
      expect(call[1]).toBeGreaterThan(0)
    }
  })

  it('F5 — an unknown zone key is ignored and never throws (start/move/end/cancel/clamp/setZoneSize)', async () => {
    const { createGutterController, clampGutterSize, setZoneSize } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    expect(() => {
      controller.start('bogus' as never)
      controller.move(100)
      controller.end()
      controller.cancel()
    }).not.toThrow()
    expect(onCommit).not.toHaveBeenCalled()
    expect(() => clampGutterSize('bogus' as never, 100)).not.toThrow()
    const base = makeLayout()
    expect(() => setZoneSize(base, 'bogus' as never, 100)).not.toThrow()
    expect(setZoneSize(base, 'bogus' as never, 100)).toEqual(base)
  })

  it('W2-Q9 — a double-click reset commits the registry default size exactly once', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    const reset = controller.reset('left')
    expect(reset).toBe(defaultLayout().zones.left.size)
    expect(onCommit).toHaveBeenCalledTimes(1)
    expect(onCommit).toHaveBeenCalledWith('left', defaultLayout().zones.left.size)
  })

  it('H-2 (adversarial, F5) — `reset` with an invalid non-undefined zone is ignored and leaves the in-flight gesture intact', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('left')
    controller.move(300)
    const result = controller.reset('bogus' as never)
    expect(result).toBeNull()
    expect(onCommit).not.toHaveBeenCalled()
    // Only `zone === undefined` falls back to the active gesture — an invalid
    // explicit zone must NOT retarget/commit.
    expect(controller.active()).toBe('left')
    expect(controller.preview()).toBe(300)
  })

  it('H-4 (adversarial) — `start` over an active gesture explicitly resolves the prior (no silent loss); the commit set is deterministic', async () => {
    const { createGutterController } = await loadGutterModule()
    const onCommit = vi.fn()
    const controller = createGutterController({ onCommit })
    controller.start('left')
    controller.move(300)
    controller.start('right')
    controller.move(250)
    const committed = controller.end()
    expect(committed).toBe(250)
    // The prior `left` gesture is not silently discarded: it is explicitly
    // resolved (ended) BEFORE the new gesture, committing its last size.
    expect(onCommit.mock.calls.map((call) => [call[0], call[1]])).toEqual([
      ['left', 300],
      ['right', 250],
    ])
    expect(controller.active()).toBeNull()
  })
})

// ===========================================================================
// §3.3 + §3.4 + §4 F6 — a below-min gesture through the model, and the
// operator-settings persistence path (restores on restart).
// ===========================================================================
describe('U-SHELL-5 — clamped commit + the operator-settings persistence (spec §3.3, §3.4, F6)', () => {
  it('§3.3 — a below-min gesture commits the clamped size (never a collapsed track), then applies via the model', async () => {
    const { createGutterController, setZoneSize } = await loadGutterModule()
    const received: Array<{ zone: LayoutZoneName; size: number }> = []
    const controller = createGutterController({
      onCommit: (zone, size) => received.push({ zone, size }),
    })
    controller.start('left')
    controller.move(2)
    controller.end()
    expect(received).toHaveLength(1)
    expect(received[0].zone).toBe('left')
    expect(received[0].size).toBeGreaterThan(0)
    const applied = setZoneSize(makeLayout(), received[0].zone, received[0].size)
    expect(applied.zones.left.size).toBe(received[0].size)
    expect(applied.zones.left.size).toBeGreaterThan(0)
  })

  it('§3.4 — a gutter-committed size round-trips through set/get and restores on restart', async () => {
    const { setZoneSize } = await loadGutterModule()
    withTempStore((path, store) => {
      const committed = setZoneSize(makeLayout(), 'left', 333)
      store.set({ layout: committed } as never)
      expect(layoutOf(store).zones.left.size).toBe(333)
      const reloaded = createOperatorSettingsStore({ path })
      expect(layoutOf(reloaded).zones.left.size).toBe(333)
      expect(layoutCssVars(layoutOf(reloaded))['--zone-left-size']).toBe('333px')
    })
  })

  it('§3.4 — a header/footer committed height round-trips and restores on restart', async () => {
    const { setZoneSize } = await loadGutterModule()
    withTempStore((path, store) => {
      const committed = setZoneSize(makeLayout(), 'footer', 72)
      store.set({ layout: committed } as never)
      const reloaded = createOperatorSettingsStore({ path })
      expect(layoutOf(reloaded).zones.footer.size).toBe(72)
    })
  })

  it('F6 — a settings write failure still applies the in-memory size for the session (never throws)', async () => {
    const { setZoneSize } = await loadGutterModule()
    const dir = mkdtempSync(join(tmpdir(), 'ushell5-'))
    try {
      // `path` points at a DIRECTORY → persist fails; the in-memory state must
      // still apply (the existing store persist-failure discipline).
      const store = createOperatorSettingsStore({ path: dir })
      const committed = setZoneSize(makeLayout(), 'left', 333)
      expect(() => store.set({ layout: committed } as never)).not.toThrow()
      expect(layoutOf(store).zones.left.size).toBe(333)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// §2.4 + §5 census — gutter geometry + C1 tokens in index.html.
// ===========================================================================
describe('U-SHELL-5 — the gutter shell geometry + C1 tokens (spec §2.4, §5 census)', () => {
  const html = readFileSync(fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)), 'utf8')
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

  interface CssRule {
    selectors: string[]
    decls: Array<{ prop: string; value: string }>
  }

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

  it('§2.1/§5 — index.html authors a gutter surface for the trimmed columns/rows', () => {
    const rules = parseCssRules(style)
    // A CSS RULE selecting a gutter surface (not merely the word in a comment).
    const gutterRules = rules.filter((r) => r.selectors.some((s) => s.includes('gutter')))
    expect(gutterRules.length).toBeGreaterThan(0)
  })

  it('§2.4 — gutter styling reads the C1 `--border` / `--hover` tokens', () => {
    const rules = parseCssRules(style)
    const gutterRules = rules.filter((r) => r.selectors.some((s) => s.includes('gutter')))
    expect(gutterRules.length).toBeGreaterThan(0)
    const values = gutterRules.flatMap((r) => r.decls.map((d) => d.value)).join(' ')
    expect(values).toContain('var(--border')
    const hoverValues = gutterRules
      .filter((r) => r.selectors.some((s) => s.includes(':hover')))
      .flatMap((r) => r.decls.map((d) => d.value))
      .join(' ')
    expect(hoverValues).toContain('var(--hover')
  })
})
