// tests/unit-u-shell-1-layout-zones.test.ts — Unit U-SHELL-1: the layout model
// + zones + the C9 layout slice.
//
// TestWriter RED set written from
// docs/specs/unit-u-shell-1-layout-zones.md §2 (contract), §3 (states) + §4
// (fail-states) + §5 (census), with the W2-Q1/Q2/Q3/Q4/Q5/Q16 resolutions from
// docs/specs/wave-2-open-decisions.md. Nothing here is implemented yet:
//
//   - `src/renderer/layout-state.ts` (spec §5 — the new module) does not exist
//     (dynamic import → RED). It must expose the spec §2.1 `LayoutState` types +
//     the pure `coerceLayout` helper (spec §2.2/§5).
//   - `src/main/operator-settings-store.ts` has no `layout` slice: `sanitize`
//     drops it and `get()` never returns it (spec §2.2).
//   - `src/renderer/pane-graph.ts` `assembleAppGraphEnvelope` emits one
//     `[sidebar]` producer, not the 4 `zone:*` container producers + per-zone
//     placement (spec §2.3).
//   - `PaneDefinition` has no `defaultZone`/`defaultOrder` (spec §2.1/W2-Q4).
//   - `src/renderer/index.html` has no layout grid tracks (spec §2.4).
//
// Behavior derived from the spec ALONE. The only value imported from the new
// module is `coerceLayout` (the one helper NAME the spec spells out — §2.2/§5);
// every other assertion rides a spec-named public seam
// (`createOperatorSettingsStore`, `assembleAppGraphEnvelope`, `index.html`).
// The one field-name assumption is `assembleAppGraphEnvelope({ layout })` — the
// layout input the assembler must consume to place panes (flagged in the
// TestWriter report as a spec ambiguity).
import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOperatorSettingsStore, type OperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition } from '../src/renderer/pane-registry.js'
import { assembleAppGraphEnvelope } from '../src/renderer/pane-graph.js'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'

// ---------------------------------------------------------------------------
// Spec §2.1 — the model (mirrored locally; the module is RED, so these are the
// contract the test pins).
// ---------------------------------------------------------------------------
type LayoutZoneName = 'left' | 'right' | 'header' | 'footer'
type RegionName = 'stage' | 'top-bar'
interface PaneLayoutEntry {
  id: string
  zone: LayoutZoneName
  order: number
  collapsed: boolean
}
interface ZoneLayout {
  size: number
  minimized: boolean
}
interface LayoutState {
  version: number
  panes: PaneLayoutEntry[]
  zones: { left: ZoneLayout; right: ZoneLayout; header: ZoneLayout; footer: ZoneLayout }
  stage: { size: number }
  topBar: { size: number }
}

const PANE_ZONES: LayoutZoneName[] = ['left', 'right', 'header', 'footer']

// ---------------------------------------------------------------------------
// The new module (spec §5) — dynamic import so a missing module fails each
// spec test individually (the U-SHELL-6 convention) rather than erroring the
// whole file.
// ---------------------------------------------------------------------------
interface LayoutModule {
  coerceLayout(value: unknown): LayoutState
}

async function loadLayoutModule(): Promise<LayoutModule> {
  try {
    return (await import('../src/renderer/layout-state.js')) as unknown as LayoutModule
  } catch (e) {
    throw new Error(
      'src/renderer/layout-state.ts not implemented (U-SHELL-1 RED — needs the Implementer)',
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
  children?: AnyNode[]
}
interface EnvelopeLike {
  template?: { root?: AnyNode }
  content?: Array<{ content?: AnyNode[] }>
  layout?: unknown
}

function walk(node: AnyNode | null | undefined, out: AnyNode[] = []): AnyNode[] {
  if (node == null || typeof node !== 'object') return out
  out.push(node)
  for (const child of node.children ?? []) walk(child, out)
  return out
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

/** The `zone:<name>` container producer (spec §2.3). */
function zoneContainer(env: EnvelopeLike, zone: string): AnyNode | undefined {
  return allNodes(env).find(
    (n) => n.props?.id === `zone:${zone}` || n.placement?.placementName === zone,
  )
}

function classesOf(node: AnyNode | undefined): string[] {
  return node?.css?.classes ?? []
}

/** The `pane-<id>` content root (spec §2.3). */
function paneRoot(env: EnvelopeLike, paneId: string): AnyNode | undefined {
  return findById(env, `pane-${paneId}`)
}

/** The content-payload index of a pane root — the observable ordering channel
 *  (spec §2.3 "in PaneLayoutEntry.order" / §3.2 "order reflects the entries"). */
function paneOrder(env: EnvelopeLike, paneId: string): number {
  const payloads = env.content ?? []
  for (let i = 0; i < payloads.length; i++) {
    if ((payloads[i].content ?? []).some((n) => n.props?.id === `pane-${paneId}`)) return i
  }
  return -1
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
function makeLayout(partial: {
  version?: number
  panes?: PaneLayoutEntry[]
  zones?: Partial<Record<LayoutZoneName, Partial<ZoneLayout>>>
  stage?: { size: number }
  topBar?: { size: number }
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
    stage: partial.stage ?? base.stage,
    topBar: partial.topBar ?? base.topBar,
  }
}

interface PaneSpec {
  id: string
  scope?: 'app-graph' | 'operator'
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
      render: () => ({ type: 'div', props: { id: `body-${s.id}` }, content: s.id }),
    } as PaneDefinition
    if (s.defaultZone !== undefined) (def as unknown as { defaultZone?: LayoutZoneName }).defaultZone = s.defaultZone
    if (s.defaultOrder !== undefined) (def as unknown as { defaultOrder?: number }).defaultOrder = s.defaultOrder
    registry.register(def)
    registry.enable(s.id)
  }
  return registry
}

/** A traversal-style base envelope with a `main` container producer + a `rag-`
 *  content root (the pre-U-SHELL app graph). */
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

/** Call the spec-named assembler with the spec-pinned `layout` input. */
function assemble(opts: {
  specs?: PaneSpec[]
  layout?: LayoutState
  env?: LegacyInitialData
}): { envelope: EnvelopeLike; paneIds: string[] } {
  const registry = makeRegistry(opts.specs ?? [])
  const result = assembleAppGraphEnvelope({
    traversalEnvelope: opts.env ?? baseEnvelope(),
    registry,
    ctx: {} as never,
    layout: opts.layout,
  } as never)
  return { envelope: result.envelope as unknown as EnvelopeLike, paneIds: result.paneIds }
}

/** A store with a throwaway temp path. */
function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell1-'))
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

// ===========================================================================
// §2.1 (W2-Q2/W2-Q4) + §2.2 — the pure coerce helper (the new module)
// ===========================================================================
describe('U-SHELL-1 — the layout module + coerceLayout (spec §2.1/§2.2, §5)', () => {
  it('the new module exists and exports a `coerceLayout` function', async () => {
    const mod = await loadLayoutModule()
    expect(typeof mod.coerceLayout).toBe('function')
  })

  it('is TOTAL: junk input never throws and yields a version:1 LayoutState with the 4 pane zones', async () => {
    const { coerceLayout } = await loadLayoutModule()
    for (const junk of [undefined, null, 0, 'x', true, [], () => {}]) {
      const l = coerceLayout(junk)
      expect(l.version).toBe(1)
      expect(Array.isArray(l.panes)).toBe(true)
      for (const zone of PANE_ZONES) {
        expect(l.zones[zone]).toBeDefined()
        expect(Number.isFinite(l.zones[zone].size)).toBe(true)
        expect(l.zones[zone].size).toBeGreaterThan(0)
        expect(typeof l.zones[zone].minimized).toBe('boolean')
      }
      expect(Number.isFinite(l.stage.size)).toBe(true)
      expect(Number.isFinite(l.topBar.size)).toBe(true)
    }
  })

  it('F1/W2-Q16 — a version GREATER than known fails soft to defaults (never a newer-schema crash)', async () => {
    const { coerceLayout } = await loadLayoutModule()
    const l = coerceLayout({
      version: 999,
      panes: [{ id: 'a', zone: 'right', order: 0, collapsed: true }],
    })
    expect(l.version).toBe(1)
    expect(l.panes).toEqual([])
  })

  it('AF-2/§2.6 pin 9 — a malformed `version` (string/negative/NaN/Infinity/non-integer) is corrupt → defaults', async () => {
    const { coerceLayout } = await loadLayoutModule()
    for (const bad of ['1', -1, NaN, Infinity, -Infinity, 1.5]) {
      const l = coerceLayout({
        version: bad,
        panes: [{ id: 'a', zone: 'right', order: 0, collapsed: true }],
      })
      expect(l.version).toBe(1)
      expect(l.panes).toEqual([])
    }
  })

  it('F3 — an unknown zone value is coerced to the default zone (`left`)', async () => {
    const { coerceLayout } = await loadLayoutModule()
    const l = coerceLayout({ version: 1, panes: [{ id: 'a', zone: 'bogus', order: 0, collapsed: false }] })
    expect(l.panes[0].zone).toBe('left')
  })

  it('W2-Q2 — a `stage`/`top-bar` value is NOT a pane zone; it is coerced to a pane zone', async () => {
    const { coerceLayout } = await loadLayoutModule()
    for (const region of ['stage', 'top-bar'] as RegionName[]) {
      const l = coerceLayout({ version: 1, panes: [{ id: 'a', zone: region, order: 0, collapsed: false }] })
      expect(PANE_ZONES).toContain(l.panes[0].zone)
      expect(l.panes[0].zone).not.toBe(region)
    }
  })

  it('F5 — duplicate pane ids: first wins (mirrors the registry dedupe)', async () => {
    const { coerceLayout } = await loadLayoutModule()
    const l = coerceLayout({
      version: 1,
      panes: [
        { id: 'a', zone: 'left', order: 0, collapsed: false },
        { id: 'a', zone: 'right', order: 5, collapsed: true },
      ],
    })
    expect(l.panes.filter((p) => p.id === 'a')).toHaveLength(1)
    expect(l.panes[0].zone).toBe('left')
    expect(l.panes[0].collapsed).toBe(false)
  })

  it('F4 — out-of-range sizes clamp to a finite positive track (never negative/NaN/Infinity)', async () => {
    const { coerceLayout } = await loadLayoutModule()
    for (const bad of [-100, -1, NaN, Infinity, -Infinity]) {
      const l = coerceLayout({
        version: 1,
        zones: { left: { size: bad, minimized: false } },
        stage: { size: bad },
        topBar: { size: bad },
      })
      expect(Number.isFinite(l.zones.left.size)).toBe(true)
      expect(l.zones.left.size).toBeGreaterThan(0)
      expect(Number.isFinite(l.stage.size)).toBe(true)
      expect(l.stage.size).toBeGreaterThan(0)
      expect(Number.isFinite(l.topBar.size)).toBe(true)
      expect(l.topBar.size).toBeGreaterThan(0)
    }
  })

  it('per-zone fail-soft: a corrupt zone value falls back to a default zone (W2-Q16)', async () => {
    const { coerceLayout } = await loadLayoutModule()
    const l = coerceLayout({
      version: 1,
      zones: { left: 'nope', right: null, header: { size: NaN }, footer: { minimized: 'x' } },
    })
    for (const zone of PANE_ZONES) {
      expect(Number.isFinite(l.zones[zone].size)).toBe(true)
      expect(l.zones[zone].size).toBeGreaterThan(0)
      expect(typeof l.zones[zone].minimized).toBe('boolean')
    }
  })

  it('F6/W2-Q16 — deep-sanitize: unknown fields are ignored and credentials are NEVER copied into the layout', async () => {
    const { coerceLayout } = await loadLayoutModule()
    const l = coerceLayout({
      version: 1,
      bogus: 1,
      token: 'super-secret',
      auth: { token: 'also-secret' },
      panes: [{ id: 'a', zone: 'left', order: 0, collapsed: false, extra: 1 }],
    }) as unknown as Record<string, unknown> & { panes: Array<Record<string, unknown>> }
    expect('token' in l).toBe(false)
    expect('auth' in l).toBe(false)
    expect('bogus' in l).toBe(false)
    expect('extra' in l.panes[0]).toBe(false)
  })
})

// ===========================================================================
// §2.2 + §3.5/§3.7 + §4 (F1/F4/F6/F7) — the C9 slice on OperatorSettings
// ===========================================================================
describe('U-SHELL-1 — the OperatorSettings.layout slice (spec §2.2, §3.5, §3.7)', () => {
  it('boot with no persisted layout defaults to a valid version:1 LayoutState (4 zones + stage + topBar)', () => {
    withTempStore((_path, store) => {
      const layout = layoutOf(store)
      expect(layout).toBeDefined()
      expect(layout.version).toBe(1)
      expect(Array.isArray(layout.panes)).toBe(true)
      for (const zone of PANE_ZONES) {
        expect(Number.isFinite(layout.zones[zone].size)).toBe(true)
        expect(typeof layout.zones[zone].minimized).toBe('boolean')
      }
      expect(Number.isFinite(layout.stage.size)).toBe(true)
      expect(Number.isFinite(layout.topBar.size)).toBe(true)
    })
  })

  it('§3.7 — a layout mutation round-trips through set + get and persists to JSON', () => {
    withTempStore((path, store) => {
      const next = makeLayout({
        panes: [{ id: 'doc-nav', zone: 'right', order: 0, collapsed: true }],
        zones: { right: { size: 300, minimized: true } },
      })
      store.set({ layout: next } as never)
      expect(layoutOf(store).panes[0].zone).toBe('right')
      expect(layoutOf(store).zones.right.minimized).toBe(true)
      const raw = JSON.parse(readFileSync(path, 'utf8'))
      expect(raw.layout.version).toBe(1)
      expect(raw.layout.panes[0].collapsed).toBe(true)
      const reloaded = createOperatorSettingsStore({ path })
      expect(layoutOf(reloaded).panes[0].zone).toBe('right')
      expect(layoutOf(reloaded).zones.right.size).toBe(300)
    })
  })

  it('§2.2 — a patch WITHOUT `layout` leaves the stored layout unchanged', () => {
    withTempStore((_path, store) => {
      const next = makeLayout({ panes: [{ id: 'search', zone: 'left', order: 0, collapsed: false }] })
      store.set({ layout: next } as never)
      store.set({ topK: 9 } as never)
      expect(store.get().topK).toBe(9)
      expect(layoutOf(store).panes[0].id).toBe('search')
    })
  })

  it('F1 — a corrupt persisted layout fails soft to the default (never throws)', () => {
    withTempStore((path) => {
      writeFileSync(path, JSON.stringify({ layout: 'not-a-layout', topK: 5 }))
      const store = createOperatorSettingsStore({ path })
      expect(layoutOf(store).version).toBe(1)
      expect(Array.isArray(layoutOf(store).panes)).toBe(true)
    })
  })

  it('F1/W2-Q16 — a persisted version > 1 fails soft to defaults', () => {
    withTempStore((path) => {
      writeFileSync(
        path,
        JSON.stringify({
          layout: { version: 2, panes: [{ id: 'a', zone: 'right', order: 0, collapsed: false }] },
        }),
      )
      const store = createOperatorSettingsStore({ path })
      expect(layoutOf(store).version).toBe(1)
      expect(layoutOf(store).panes).toEqual([])
    })
  })

  it('F4 — persisted out-of-range sizes clamp at load (never a negative/NaN track)', () => {
    withTempStore((path) => {
      writeFileSync(
        path,
        JSON.stringify({
          layout: {
            version: 1,
            zones: { left: { size: -5, minimized: false }, right: { size: NaN, minimized: false } },
            stage: { size: -1 },
            topBar: { size: Infinity },
          },
        }),
      )
      const store = createOperatorSettingsStore({ path })
      const layout = layoutOf(store)
      for (const zone of PANE_ZONES) {
        expect(Number.isFinite(layout.zones[zone].size)).toBe(true)
        expect(layout.zones[zone].size).toBeGreaterThan(0)
      }
      expect(Number.isFinite(layout.stage.size)).toBe(true)
      expect(Number.isFinite(layout.topBar.size)).toBe(true)
    })
  })

  it('F6 — credentials are never copied into the layout slice (carrier rule)', () => {
    withTempStore((path) => {
      writeFileSync(
        path,
        JSON.stringify({ layout: { version: 1, token: 'secret', auth: { token: 'x' }, panes: [] } }),
      )
      const store = createOperatorSettingsStore({ path })
      expect('token' in (layoutOf(store) as unknown as Record<string, unknown>)).toBe(false)
      store.set({ topK: 3 } as never) // force a persist
      const raw = JSON.parse(readFileSync(path, 'utf8'))
      expect('token' in raw.layout).toBe(false)
      expect('auth' in raw.layout).toBe(false)
    })
  })

  it('F7 — a layout write failure keeps the in-memory layout for the session', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell1-'))
    try {
      // `path` points at a DIRECTORY → writeFileSync fails; the in-memory state
      // must still apply (the existing store persist-failure discipline).
      const store = createOperatorSettingsStore({ path: dir })
      const next = makeLayout({ panes: [{ id: 'a', zone: 'header', order: 0, collapsed: false }] })
      expect(() => store.set({ layout: next } as never)).not.toThrow()
      expect(layoutOf(store).panes[0].zone).toBe('header')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('W2-Q16 — the layout is GLOBAL (one top-level slice), not keyed per store', () => {
    withTempStore((_path, store) => {
      const settings = store.get() as unknown as Record<string, unknown>
      expect('layout' in settings).toBe(true)
      const layout = settings.layout as LayoutState
      expect(typeof layout.version).toBe('number')
      expect(Array.isArray(layout.panes)).toBe(true)
      // A per-store map would be record-keyed; the pinned shape is one LayoutState.
      expect(Array.isArray((layout as unknown as { zones?: unknown }).zones)).toBe(false)
      expect(typeof (layout as unknown as { zones?: unknown }).zones).toBe('object')
    })
  })
})

// ===========================================================================
// §2.3 + §3.1–§3.4 + §4 (F2/F3/F8) — zones + per-zone placement
// ===========================================================================
describe('U-SHELL-1 — zone containers + per-zone placement (spec §2.3, §3.1–§3.4)', () => {
  it('§3.1/W2-Q3 — the four `zone:*` containers are ALWAYS present (even with zero panes), each empty → is-empty', () => {
    const { envelope } = assemble({ specs: [] })
    for (const zone of PANE_ZONES) {
      const container = zoneContainer(envelope, zone)
      expect(container, `zone:${zone} container must exist`).toBeDefined()
      expect(classesOf(container)).toContain('is-empty')
    }
  })

  it('§3.1/W2-Q4 — with no persisted layout, panes are placed by the scope-derived default (`left`) in registration order', () => {
    const { envelope } = assemble({ specs: [{ id: 'a' }, { id: 'b' }] })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['left'])
    expect(paneRoot(envelope, 'b')?.placement?.targetPlacement).toEqual(['left'])
    expect(paneOrder(envelope, 'a')).toBeGreaterThanOrEqual(0)
    expect(paneOrder(envelope, 'a')).toBeLessThan(paneOrder(envelope, 'b'))
    // `left` is non-empty; the other zones stay empty.
    expect(classesOf(zoneContainer(envelope, 'left'))).not.toContain('is-empty')
    for (const zone of ['right', 'header', 'footer'] as LayoutZoneName[]) {
      expect(classesOf(zoneContainer(envelope, zone))).toContain('is-empty')
    }
  })

  it('§2.1/W2-Q4 — a pane’s additive `defaultZone`/`defaultOrder` overrides the scope default', () => {
    const { envelope } = assemble({
      specs: [
        { id: 'a', defaultZone: 'right', defaultOrder: 1 },
        { id: 'b', defaultZone: 'right', defaultOrder: 0 },
        { id: 'c', defaultZone: 'header' },
      ],
    })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['right'])
    expect(paneRoot(envelope, 'b')?.placement?.targetPlacement).toEqual(['right'])
    expect(paneRoot(envelope, 'c')?.placement?.targetPlacement).toEqual(['header'])
    expect(paneOrder(envelope, 'b')).toBeLessThan(paneOrder(envelope, 'a'))
  })

  it('§3.2 — a persisted layout moving a pane to `right` targets `right`; `left` order reflects the entries', () => {
    const layout = makeLayout({
      panes: [
        { id: 'a', zone: 'right', order: 0, collapsed: false },
        { id: 'b', zone: 'left', order: 1, collapsed: false },
        { id: 'c', zone: 'left', order: 0, collapsed: false },
      ],
    })
    const { envelope } = assemble({ specs: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], layout })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['right'])
    expect(paneRoot(envelope, 'b')?.placement?.targetPlacement).toEqual(['left'])
    expect(paneRoot(envelope, 'c')?.placement?.targetPlacement).toEqual(['left'])
    // The `left` zone order follows the layout entries (c order 0 < b order 1).
    expect(paneOrder(envelope, 'c')).toBeLessThan(paneOrder(envelope, 'b'))
  })

  it('§3.3 — a persisted `collapsed: true` mirrors `is-collapsed` on the pane root; false does not', () => {
    const collapsed = assemble({
      specs: [{ id: 'a' }, { id: 'b' }],
      layout: makeLayout({
        panes: [
          { id: 'a', zone: 'left', order: 0, collapsed: true },
          { id: 'b', zone: 'left', order: 1, collapsed: false },
        ],
      }),
    })
    expect(classesOf(paneRoot(collapsed.envelope, 'a'))).toContain('is-collapsed')
    expect(classesOf(paneRoot(collapsed.envelope, 'b'))).not.toContain('is-collapsed')
  })

  it('§2.1/§2.3 — a `minimized` zone mirrors `is-minimized` on the zone container', () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ zones: { left: { size: 200, minimized: true } } }),
    })
    expect(classesOf(zoneContainer(envelope, 'left'))).toContain('is-minimized')
    expect(classesOf(zoneContainer(envelope, 'right'))).not.toContain('is-minimized')
  })

  it('§3.4 — a zero-pane zone renders present but `is-empty` (the C11 mirror)', () => {
    const { envelope } = assemble({ specs: [{ id: 'a', defaultZone: 'left' }] })
    expect(zoneContainer(envelope, 'left')).toBeDefined()
    expect(classesOf(zoneContainer(envelope, 'left'))).not.toContain('is-empty')
    for (const zone of ['right', 'header', 'footer'] as LayoutZoneName[]) {
      expect(zoneContainer(envelope, zone)).toBeDefined()
      expect(classesOf(zoneContainer(envelope, zone))).toContain('is-empty')
    }
  })

  it('F2/W2-Q16 — a persisted pane entry naming an unregistered pane is dropped; the valid entry is honored (no phantom node)', () => {
    const layout = makeLayout({
      panes: [
        { id: 'ghost', zone: 'left', order: 0, collapsed: false },
        { id: 'a', zone: 'right', order: 1, collapsed: false },
      ],
    })
    const { envelope } = assemble({ specs: [{ id: 'a' }], layout })
    expect(paneRoot(envelope, 'ghost')).toBeUndefined()
    expect(findById(envelope, 'pane-ghost')).toBeUndefined()
    // The registered pane's persisted placement still applies.
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['right'])
  })

  it('F3 — a persisted entry with an unknown zone coerces to the default zone (`left`)', () => {
    const layout = makeLayout({
      panes: [{ id: 'a', zone: 'bogus' as never, order: 0, collapsed: false }],
    })
    const { envelope } = assemble({ specs: [{ id: 'a' }], layout })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['left'])
  })

  it('W2-Q2 — `stage`/`top-bar` are regions, never pane drop targets', () => {
    for (const region of ['stage', 'top-bar']) {
      const layout = makeLayout({
        panes: [{ id: 'a', zone: region as never, order: 0, collapsed: false }],
      })
      const { envelope } = assemble({ specs: [{ id: 'a' }], layout })
      const target = paneRoot(envelope, 'a')?.placement?.targetPlacement ?? []
      expect(target).not.toContain(region)
      expect(target.every((z) => (PANE_ZONES as string[]).includes(z))).toBe(true)
    }
  })

  it('F8 — every `targetPlacement` names a container producer present in the same envelope (the HARD PRECONDITION)', () => {
    const layout = makeLayout({
      panes: [
        { id: 'a', zone: 'right', order: 0, collapsed: false },
        { id: 'b', zone: 'footer', order: 0, collapsed: false },
      ],
    })
    const { envelope } = assemble({ specs: [{ id: 'a' }, { id: 'b' }], layout })
    for (const id of ['a', 'b']) {
      const target = paneRoot(envelope, id)?.placement?.targetPlacement ?? []
      expect(target).toHaveLength(1)
      expect((PANE_ZONES as string[]).includes(target[0])).toBe(true)
      expect(zoneContainer(envelope, target[0])).toBeDefined()
    }
  })

  it('H1 — an id-only `zone:left` template child is repaired with a real `placementName` anchor (the F8 HARD PRECONDITION)', () => {
    // The engine resolves `targetPlacement` ONLY via a `placementName`-derived
    // anchor. A template child (`code.template.set`) with `props.id ===
    // 'zone:left'` but NO `placementName` must not be treated as the container,
    // or panes targeting `left` become unplaced-silent.
    const env = baseEnvelope()
    const root = env.template?.root as unknown as { children: AnyNode[] }
    root.children.push({ type: 'div', props: { id: 'zone:left' } })

    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      env,
      layout: makeLayout({ panes: [{ id: 'a', zone: 'left', order: 0, collapsed: false }] }),
    })

    // A real `left` anchor must exist, tagged onto the id-only node.
    const anchors = allNodes(envelope).filter((n) => n.placement?.placementName === 'left')
    expect(anchors).toHaveLength(1)
    expect(anchors[0].props?.id).toBe('zone:left')
    // The pane targeting `left` is therefore satisfiable — never unplaced-silent.
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['left'])
  })

  it('§3.6 — a RAG content change leaves the `zone:*` ids and pane roots unchanged (U-STATE-1 identity)', () => {
    const first = assemble({ specs: [{ id: 'a' }, { id: 'b' }], env: baseEnvelope('one') })
    const second = assemble({ specs: [{ id: 'a' }, { id: 'b' }], env: baseEnvelope('two') })
    for (const zone of PANE_ZONES) {
      const before = zoneContainer(first.envelope, zone)
      const after = zoneContainer(second.envelope, zone)
      expect(after?.props?.id).toBe(`zone:${zone}`)
      expect(after?.props?.id).toBe(before?.props?.id)
    }
    for (const id of ['a', 'b']) {
      expect(paneRoot(second.envelope, id)?.props?.id).toBe(`pane-${id}`)
    }
  })
})

// ===========================================================================
// §2.2 + §3.8 — operator-scoped / not MCP-exported
// ===========================================================================
describe('U-SHELL-1 — the layout is operator-scoped, NOT MCP-visible (spec §2.2, §3.8)', () => {
  it('the assembled app-graph envelope carries NO serialized `layout` (the C9 carve-out)', () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ panes: [{ id: 'a', zone: 'left', order: 0, collapsed: true }] }),
    })
    expect(Object.prototype.hasOwnProperty.call(envelope, 'layout')).toBe(false)
  })

  it('no app-graph node exposes the layout slice (only the state-derived mirror classes)', () => {
    const { envelope } = assemble({
      specs: [{ id: 'a' }],
      layout: makeLayout({ panes: [{ id: 'a', zone: 'left', order: 0, collapsed: true }] }),
    })
    const node = allNodes(envelope).find(
      (n) => n.props?.id === 'layout' || n.props?.['data-layout'] !== undefined,
    )
    expect(node).toBeUndefined()
    // The mirror is the visible surface: the pane carries `is-collapsed`.
    expect(classesOf(paneRoot(envelope, 'a'))).toContain('is-collapsed')
  })
})

// ===========================================================================
// §2.4 + §5 — shell grid geometry (index.html)
// ===========================================================================
describe('U-SHELL-1 — shell grid geometry (spec §2.4, §5 census)', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
    'utf8',
  )
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

  it('the grid declares named areas/tracks for top-bar + stage + the four pane zones', () => {
    // The spec §2.4 pins the NEW shell grid: top-bar → header → main
    // (left | stage | right) → footer. The pre-U-SHELL `.layout { 1fr 1fr }`
    // grid is insufficient; the region names must be authored.
    expect(style).toMatch(/grid-template-areas|grid-template-columns|grid-template-rows/)
    expect(style).toMatch(/top-bar/)
    expect(style).toMatch(/stage/)
    for (const zone of PANE_ZONES) {
      expect(style).toContain(zone)
    }
  })
})

// ===========================================================================
// §5 census — additive shape (the sanctioned additive-shape reconciliation)
// ===========================================================================
describe('U-SHELL-1 — census (spec §5)', () => {
  it('`OperatorSettings`/`OperatorSettingsPatch` expose the additive `layout` field', () => {
    withTempStore((_path, store) => {
      // The patch type accepts `layout` (the cast is only because the RED type
      // has not landed yet); the get result returns it.
      const next = makeLayout({ panes: [{ id: 'a', zone: 'left', order: 0, collapsed: false }] })
      store.set({ layout: next } as never)
      expect(layoutOf(store)).toEqual(next)
    })
  })

  it('the additive `defaultZone`/`defaultOrder` are CONSUMED by the assembler (the behavioral census proof)', () => {
    const { envelope } = assemble({
      specs: [{ id: 'a', defaultZone: 'right', defaultOrder: 7 }],
      layout: makeLayout({ panes: [] }),
    })
    expect(paneRoot(envelope, 'a')?.placement?.targetPlacement).toEqual(['right'])
  })
})

// ===========================================================================
// MCP-visible equivalence — verified via list_targets / get_rendered_html in
// the e2e battery (not node-testable). The node-level proxy above asserts the
// same envelope the app Runtime materializes.
// ===========================================================================
describe.skip('U-SHELL-1 — MCP-visible zone equivalence (battery / live host)', () => {
  it.skip('`provident.list_targets` lists the four stable `zone:*` nodes', () => {})
  it.skip('`provident.get_rendered_html` reflects empty/minimized/collapsed mirrors', () => {})
})
