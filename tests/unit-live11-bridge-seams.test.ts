// tests/unit-live11-bridge-seams.test.ts — Unit U-LIVE11: Sidebar Bridge Seam
// Fix (LIVE-11 collapse-inert + LIVE-12/C un-park + LIVE-5 H3 symmetry).
// TestWriter RED set written from docs/specs/unit-live11-bridge-seams.md (§2
// invariants, §4 fail-states, §6 red-set contract) + the owning-spec §2.5
// bridge-exposure pin docs/specs/unit-u-shell-3-collapsible-panes.md.
//
// Behavior contract (derived from the spec §6 — each line is a RED-today pin):
//   (a) PRELOAD-SURFACE — in the REAL contextBridge renderer the preload OWNS
//       `window.provident.sidebar`. After the preload loads, and again after
//       `installSidebar({...})`, the four collapse/visibility seams
//       `togglePaneCollapse` / `paneVisibilityToggle` / `zoneMinimizeToggle` /
//       `paneTabExpand` are EACH `function`s on `bridge.sidebar`; the default
//       holder no-ops never throw; after installSidebar each exposed seam
//       forwards the exact args to the installed holder (`id`, `id`, `zone`,
//       `zone+paneId`). TODAY the preload's fixed-key `sidebarHolder`/`sidebar`
//       proxy OMIT the four keys → `undefined` at the preload boundary → RED.
//   (b) RENDERER integration — dispatching the collapse-handler body (the
//       `PANE_COLLAPSE_HANDLER` inline control body, fired via runtime.dispatch
//       on a real assembled `pane-collapse-<id>` control) → seam function →
//       `SidebarPanes.togglePaneCollapse(id)` flipped `PaneLayoutEntry.collapsed`
//       and committed once through `setLayout` → re-derive rendered the
//       BODY-LESS `is-collapsed` frame; a second dispatch re-expands, root
//       identity unchanged. (Envelope-green today — the render-host contract —
//       but it pins the §2.2 collapse-flip invariant end-to-end.)
//   (c) LIVE-5 — `SidebarPanes.togglePaneVisibility(id)` sets
//       `this.paneVisibilityTouched = true` (mirroring the native seam
//       `onPaneVisibilityChange`), so a stale boot `applyPersistedPaneVisibility`
//       is a NO-OP after the toggle (the H3 boot-race guard). RED today — the
//       flag is NOT set in `togglePaneVisibility` (sidebar-panes.ts:2823-2830).
//   (d) LIVE-12/C persist — the IN-PANE paneVisibilityToggle seam → flip +
//       `persistEnabledPanes` wrote the flipped enabled set, and the persisted
//       hidden pane stays HIDDEN across a simulated restart (a fresh store over
//       the same temp file + a fresh apply). Closes the zero-coverage gap.
//
// STATES enumerated (spec §3):
//   1. preload loads → the four seams are functions BEFORE installSidebar (the
//      default-holder no-ops).   [RED]
//   2. installSidebar with the four keys → each exposed seam delegates the
//      EXACT args to the installed holder (`id`, `id`, `zone`, `zone+paneId`).
//      [RED]
//   3. a `.pane-collapse-<id>` click dispatch → guard passes → togglePaneCollapse
//      flips `collapsed` → body-less `is-collapsed` frame renders.  [GREEN — but
//      ZERO live-coverage today; pins the render-host contract end-to-end]
//   4. a second dispatch re-expands; root identity identical.  [GREEN]
//   6. togglePaneVisibility sets paneVisibilityTouched=true; a post-toggle
//      applyPersistedPaneVisibility is a no-op.  [RED]
//   5. paneVisibilityToggle flips enable + persists; the set round-trips after
//      restart (fresh store over the same file).  [GREEN — behavior present, zero
//      in-pane coverage; un-parks LIVE-12/C]
//
// FAIL-STATES pinned (spec §4): F1/F2 (seam undefined / guard no-op → must be
// eliminated), F3 (collapsed flips but no body-less re-render), F4 (visibility
// does not persist / boot does not re-apply), F5 (exposed seam does NOT forward
// to the holder / drops args), F6 (H3 race — togglePaneVisibility does not set
// paneVisibilityTouched).
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { createOperatorSettingsStore, type OperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { defaultLayout, coerceLayout, type LayoutState, type PaneLayoutEntry } from '../src/renderer/layout-state.js'
import { PANE_COLLAPSE_HANDLER } from '../src/renderer/pane-graph.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { OperatorSettings } from '../src/shared/types.js'

// ---------------------------------------------------------------------------
// (a) — the electron mock is hoisted BEFORE the preload import (the
// unit-wave-1 / unit-u5 / template-adversarial pattern). The preload is the
// code-under-test for the preload-surface sub-suite.
// ---------------------------------------------------------------------------
const invokeMock = vi.hoisted(() => vi.fn())
const exposeInMainWorldMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: exposeInMainWorldMock },
  ipcRenderer: {
    invoke: invokeMock,
    on: vi.fn(() => vi.fn()),
    removeListener: vi.fn(),
    send: vi.fn(),
  },
}))

// Import AFTER the electron mock is installed (vi.mock is hoisted).
import '../src/main/preload.js'

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld. */
function capturedBridge(): any {
  return exposeInMainWorldMock.mock.calls[0]?.[1]
}

beforeEach(() => {
  invokeMock.mockReset()
})

// ---------------------------------------------------------------------------
// Shared renderer fixtures (dom-shim + host + registry + store).
// ---------------------------------------------------------------------------
const BODY_MARKER = 'live11-body-'

function bodyMarker(paneId: string): string {
  return `${BODY_MARKER}${paneId}`
}

function bodyNode(paneId: string): LegacyNodeData {
  return { type: 'div', props: { id: `body-${paneId}` }, content: bodyMarker(paneId) } as unknown as LegacyNodeData
}

interface PaneSpec {
  id: string
  scope?: 'app-graph' | 'operator'
}

function registerSpecs(registry: PaneRegistry, specs: PaneSpec[], withBody: string[] = []): void {
  for (const s of specs) {
    const def: PaneDefinition = {
      id: s.id,
      title: s.id,
      scope: s.scope ?? 'app-graph',
      render: withBody.includes(s.id) ? () => bodyNode(s.id) : () => ({ type: 'div', props: { id: `body-${s.id}` } }),
    }
    registry.register(def)
    registry.enable(s.id)
  }
}

function freshDir(prefix: string): { dir: string; path: string; store: OperatorSettingsStore } {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  return { dir, path: join(dir, 'settings.json'), store: createOperatorSettingsStore({ path: join(dir, 'settings.json') }) }
}

/** A minimal host wired to the REAL `installSidebarBridge` seam (the dom-shim
 *  fallback attaches `window.provident.sidebar = methods` directly), driven
 *  through the exposed `window.provident.sidebar.*` seams. `setSpy` records the
 *  `operatorSettings.set` writes (the C9 persist carrier). `store` (when given)
 *  backs the persist so the (d) round-trip is a real disk write. */
function makeSeamHost(opts: {
  specs?: PaneSpec[]
  withBody?: string[]
  setSpy?: ReturnType<typeof vi.fn>
  store?: OperatorSettingsStore
}): {
  host: SidebarPanes
  registry: PaneRegistry
  sidebar: Record<string, (...args: unknown[]) => unknown>
  setSpy: ReturnType<typeof vi.fn>
  store: OperatorSettingsStore
  set: (patch: never) => unknown
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
} {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  registerSpecs(registry, opts.specs ?? [{ id: 'doc-nav' }], opts.withBody ?? [])
  const backRefs = new Map<string, string[]>()
  const onRebuild = vi.fn(async () => {})
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild,
  })
  const store = opts.store ?? createOperatorSettingsStore({ path: join(tmpdir(), `live11-seam-inmem-${Math.random().toString(36).slice(2)}.json`) })
  const setSpy = opts.setSpy ?? vi.fn(async (patch: never) => ({ ...store.set(patch) }))
  const set = (patch: never) => {
    void setSpy(patch)
    return store.set(patch)
  }
  const host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: { operatorSettings: { set } } as never,
    backRefs,
    editController,
  })
  // Spy out the (async network-fetching) refresh the toggle kicks off; the
  // renderer-surface tests only assert the flip + persist + guard, never the
  // live snapshot refresh.
  ;(host as unknown as { refresh(): Promise<void> }).refresh = async () => {}
  ;(globalThis as unknown as { window?: unknown }).window = { provident: {} }
  ;(host as unknown as { installSidebarBridge(): void }).installSidebarBridge()
  const w = globalThis as unknown as {
    window: { provident: { sidebar?: Record<string, (...args: unknown[]) => unknown> } }
  }
  const sidebar = w.window.provident.sidebar!
  return { host, registry, sidebar, setSpy, store, set, editController, onRebuild }
}

/** The private host flag that gates the stale boot-apply (spec §2.4). */
function touchedFlag(host: SidebarPanes): boolean {
  return (host as unknown as { paneVisibilityTouched: boolean }).paneVisibilityTouched
}

/** Invoke the private boot-visibility-apply seam (spec §2.4/§6(c)) directly. */
function applyPersistedVisibility(host: SidebarPanes, settings: OperatorSettings | null): void {
  ;(host as unknown as { applyPersistedPaneVisibility(s: OperatorSettings | null): void }).applyPersistedPaneVisibility(settings)
}

// ---------------------------------------------------------------------------
// A full boot+runtime harness (the U-SHELL-8 pattern) for the render-host
// collapse-flip integration (b): the host boots into a real Runtime with a real
// OperatorSettings store; the assembled app-graph carries the pane frame + the
// `pane-collapse-<id>` control node, so `runtime.dispatch` fires the actual
// inline `PANE_COLLAPSE_HANDLER` body.
// ---------------------------------------------------------------------------
interface BootHarness {
  host: SidebarPanes
  runtime: Runtime
  registry: PaneRegistry
  store: OperatorSettingsStore
  onRebuild: ReturnType<typeof vi.fn>
  setSpy: ReturnType<typeof vi.fn>
}

function snapshotPayload(): any {
  const now = new Date().toISOString()
  return {
    nodes: [{ id: 'head-a', type: 'h1', content: 'Doc A', ownedNodeIds: [], createdAt: now, updatedAt: now }],
    edges: [{ id: 'dh1', kind: 'doc-head', source: 'head-a', target: 'doc-a', createdAt: now, updatedAt: now, documentIds: ['doc-a'] }],
  }
}

function placeholderEnvelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function makeBootHarness(opts: { withBody?: string[]; store?: OperatorSettingsStore }): BootHarness {
  installShim()
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  // Register ONLY the non-default known-body pane; boot() registers the built-in
  // panes (doc-nav/crosslinks/search/template-editor/settings) itself.
  registerSpecs(registry, [{ id: 'notes' }], opts.withBody ?? ['notes'])
  const store = opts.store ?? createOperatorSettingsStore({ path: join(freshDir('live11-boot-').dir, 'settings.json') })
  const setSpy = vi.fn(async (patch: never) => ({ ...store.set(patch) }))
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn((kind?: unknown) => host.reDerive(kind as never))
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
  const bridge: Record<string, unknown> = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch', 'code'] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async () => ({ ok: true })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot: vi.fn(async () => snapshotPayload()),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [{ documentId: 'doc-a', title: 'Doc A', headId: 'head-a' }] })),
      stores: vi.fn(async () => ({ stores: [] })),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      validate: vi.fn(async () => ({ ok: true })),
      set: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      create: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      delete: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      reset: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async () => ({ ...store.get() })),
      set: setSpy,
      onChanged: vi.fn(() => () => {}),
    },
    onPaneVisibility: vi.fn(() => () => {}),
    pushPaneCatalog: vi.fn(),
  }
  host = new SidebarPanes({
    mount: mount as never,
    operatorMount: operatorMount as never,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount: mount as never, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, registry, store, onRebuild, setSpy }
}

function paneClasses(h: BootHarness, paneId: string): string[] {
  const result = h.runtime.nodeState(`pane-${paneId}`)
  const first = result.states[0] as { css?: { classes?: unknown } } | undefined
  const classes = first?.css?.classes
  return Array.isArray(classes) ? classes.map(String) : []
}

function renderedHtml(h: BootHarness): string {
  return h.runtime.renderedHtmlResult().renderedHtml
}

function layoutOf(store: OperatorSettingsStore): LayoutState {
  return (store.get() as unknown as { layout: LayoutState }).layout
}

function notesEntryOf(store: OperatorSettingsStore): PaneLayoutEntry | undefined {
  return layoutOf(store).panes.find((p) => p.id === 'notes')
}

/** Trigger the re-derive a `setLayout` write-through would drive in the real app
 *  (the main broadcasts `operatorSettings.set()`'s result → `onOperatorSettingsChanged`
 *  → `requestRebuild('operator')` → `reDerive`). The mock `onChanged` never fires, so
 *  the test drives the exact payload path by hand. */
async function reDeriveLayout(h: BootHarness): Promise<void> {
  ;(h.host as unknown as { onOperatorSettingsChanged(p: OperatorSettings): void }).onOperatorSettingsChanged({
    ...storeOf(h),
    layout: layoutOf(h.store),
  } as OperatorSettings)
  // If the rebuild queued (not dirty), onRebuild fired reDerive; await it.
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const res = h.onRebuild.mock.results[calls - 1]
  if (res && typeof (res.value as Promise<unknown> | undefined)?.then === 'function') {
    await (res.value as Promise<unknown>)
  }
}

function storeOf(h: BootHarness): OperatorSettings {
  return h.store.get()
}

// ===========================================================================
// (a) — the PRELOAD surface: the four seams at the contextBridge boundary
// (spec §2.1, §6(a), fail-states F1/F2/F5).
// RED today: the fixed-key `sidebarHolder`/`sidebar` proxy omit the four keys.
// ===========================================================================
describe('U-LIVE11 (a) — preload exposes the four collapse/visibility seams as functions (§2.1, P-IM-1)', () => {
  const SEAMS = ['togglePaneCollapse', 'paneVisibilityToggle', 'zoneMinimizeToggle', 'paneTabExpand'] as const

  it('state 1 — after the preload loads, each seam on bridge.sidebar is a function (the default-holder no-op) [RED]', () => {
    const bridge = capturedBridge()
    for (const n of SEAMS) {
      // F1/F2 — an undefined seam at the preload boundary makes the handler-body
      // guard return and the feature silently inert (the LIVE-11/LIVE-12/C state).
      expect(typeof bridge.sidebar[n], `sidebar.${n} must be a function`).toBe('function')
    }
  })

  it('state 2 — the default-holder no-op never throws before installSidebar [RED]', () => {
    const bridge = capturedBridge()
    expect(() => {
      bridge.sidebar.togglePaneCollapse('notes')
      bridge.sidebar.paneVisibilityToggle('notes')
      bridge.sidebar.zoneMinimizeToggle('left')
      bridge.sidebar.paneTabExpand('left', 'notes')
    }).not.toThrow()
  })

  it('state 2 — after installSidebar with the four keys, each exposed seam delegates the EXACT args to the installed holder (id/id/zone/zone+paneId) [RED]', () => {
    const bridge = capturedBridge()
    const seen: Record<string, unknown[][]> = {}
    const methods: Record<string, (...args: unknown[]) => void> = {}
    for (const n of SEAMS) {
      methods[n] = (...args: unknown[]) => {
        ;(seen[n] ??= []).push(args)
      }
    }
    bridge.installSidebar(methods)
    for (const n of SEAMS) expect(typeof bridge.sidebar[n], `sidebar.${n} must delegate to the installed holder (P-IM-2)`).toBe('function')

    bridge.sidebar.togglePaneCollapse('notes')
    bridge.sidebar.paneVisibilityToggle('notes')
    bridge.sidebar.zoneMinimizeToggle('left')
    bridge.sidebar.paneTabExpand('left', 'notes')

    expect(seen.togglePaneCollapse).toEqual([['notes']])
    expect(seen.paneVisibilityToggle).toEqual([['notes']])
    expect(seen.zoneMinimizeToggle).toEqual([['left']])
    expect(seen.paneTabExpand).toEqual([['left', 'notes']])
  })

  it('F5 — a holder WITHOUT a key falls through (via optional-call) to a no-op, never throws [RED]', () => {
    const bridge = capturedBridge()
    bridge.installSidebar({} as never)
    expect(() => {
      bridge.sidebar.togglePaneCollapse('notes')
      bridge.sidebar.paneVisibilityToggle('notes')
      bridge.sidebar.zoneMinimizeToggle('left')
      bridge.sidebar.paneTabExpand('left', 'notes')
    }).not.toThrow()
  })
})

// ===========================================================================
// (b) — the render-host collapse-flip integration: dispatch the inline
// `PANE_COLLAPSE_HANDLER` body (a real click on `pane-collapse-<id>`) → the
// seam → `togglePaneCollapse` flips `PaneLayoutEntry.collapsed` (ONE setLayout)
// → re-derive renders the body-less `is-collapsed` frame (spec §2.2, §6(b)).
// Envelope-green today — pins the render-host contract end-to-end.
// ===========================================================================
describe('U-LIVE11 (b) — dispatch the collapse handler body flips collapsed + re-renders the body-less is-collapsed frame (§2.2, §6(b))', () => {
  it('pins the DOM-click/MCP-dispatch collapse-flip invariant end-to-end', async () => {
    // The harness must boot a NON-FIRST-RUN persisted operator (FIRST-RUN-
    // ENABLED-DEFAULT / docs/defects.md LIVE-7): `panesInitialized: true` + an
    // explicit `enabledPanes` that includes `notes` so boot neither fires the
    // first-run-only write-through NOR drops the `notes` pane to the first-run
    // default (which enables only search+doc-nav). The suite's intent is the
    // collapse-flip seam — it does NOT test first-run behavior.
    const f = freshDir('live11-boot-')
    try {
      f.store.set({
        enabledPanes: ['notes', 'doc-nav', 'crosslinks', 'search', 'template-editor'],
        enabledOperatorPanes: ['settings'],
        panesInitialized: true,
      })
      const h = makeBootHarness({ withBody: ['notes'], store: f.store })
      await h.host.boot(h.runtime)

      // The seam the inline handler body resolves is a function (installSidebarBridge).
      const w = globalThis as unknown as { window: { provident: { sidebar: Record<string, unknown>; installSidebar?: unknown } } }
      expect(typeof w.window.provident.sidebar.togglePaneCollapse).toBe('function')

      // The pane frame + its collapse control are assembled + addressable.
      const targets = h.runtime.listTargets().nodes.map((n) => n.propsId).filter(Boolean) as string[]
      expect(targets).toContain('pane-notes')
      expect(h.registry.isEnabled('notes')).toBe(true)
      expect(renderedHtml(h)).toContain(bodyMarker('notes'))

      // A click on the control → the inline PANE_COLLAPSE_BODY → seam → flip.
      await h.runtime.dispatch({ target: 'pane-collapse-notes', event: 'click' })
      const persisted = notesEntryOf(h.store)
      expect(persisted?.collapsed).toBe(true)

      // ONE managed write-through (setLayout persists `layout`).
      const layoutPatches = h.setSpy.mock.calls.filter((c) => (c[0] as { layout?: unknown })?.layout)
      expect(layoutPatches.length).toBe(1)

      // The re-derive a setLayout write-through triggers renders the frame
      // header-only (body absent) + `is-collapsed`.
      await reDeriveLayout(h)
      expect(paneClasses(h, 'notes')).toContain('is-collapsed')
      expect(renderedHtml(h)).not.toContain(bodyMarker('notes'))
      expect(h.runtime.listTargets().nodes.some((n) => (n.propsId as string | undefined) === 'pane-notes')).toBe(true)

      // Symmetric second dispatch re-expands; the root identity is unchanged.
      await h.runtime.dispatch({ target: 'pane-collapse-notes', event: 'click' })
      expect(notesEntryOf(h.store)?.collapsed).toBe(false)
      await reDeriveLayout(h)
      expect(paneClasses(h, 'notes')).not.toContain('is-collapsed')
      expect(renderedHtml(h)).toContain(bodyMarker('notes'))
      expect(h.runtime.listTargets().nodes.some((n) => (n.propsId as string | undefined) === 'pane-notes')).toBe(true)
    } finally {
      rmSync(f.dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// (c) — LIVE-5 H3 symmetry: togglePaneVisibility sets paneVisibilityTouched
// (spec §2.4, §6(c), fail-state F6). RED today — the flag is not set.
// ===========================================================================
describe('U-LIVE11 (c) — togglePaneVisibility sets paneVisibilityTouched (LIVE-5 H3 guard, §2.4, §6(c))', () => {
  it('sets paneVisibilityTouched=true and the stale boot apply becomes a no-op [RED]', () => {
    const { host, registry, sidebar } = makeSeamHost({
      specs: [{ id: 'doc-nav' }, { id: 'settings', scope: 'operator' }],
    })
    expect(registry.isEnabled('doc-nav')).toBe(true)

    // The in-pane seam (the OPERATOR_PANE_VISIBILITY body reaches this).
    sidebar.paneVisibilityToggle('doc-nav')

    // F6 — the flag must be set before the persist so the boot-apply guard holds.
    expect(registry.isEnabled('doc-nav')).toBe(false)
    expect(touchedFlag(host)).toBe(true)

    // A stale boot settings fetch returning after the toggle must NOT clobber it.
    applyPersistedVisibility(host, {
      enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor'],
      enabledOperatorPanes: ['settings'],
      panesInitialized: true,
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'contenteditable',
      theme: 'system',
      layout: coerceLayout(defaultLayout()),
    } as OperatorSettings)
    // The H3 race guard: the stale apply is suppressed → doc-nav stays hidden.
    expect(registry.isEnabled('doc-nav')).toBe(false)
  })

  it('P-TP-2 — the native seam onPaneVisibilityChange is behaviorally equivalent (both set the flag)', () => {
    const { host, registry, sidebar } = makeSeamHost({
      specs: [{ id: 'doc-nav' }, { id: 'settings', scope: 'operator' }],
      setSpy: vi.fn(async () => ({})),
    })
    sidebar.paneVisibilityToggle('doc-nav')
    expect(touchedFlag(host)).toBe(true)
    expect(registry.isEnabled('doc-nav')).toBe(false)

    // The native seam also sets the flag (already-GREEN symmetry, §2.4).
    ;(host as unknown as { onPaneVisibilityChange(c: unknown): void }).onPaneVisibilityChange({ id: 'doc-nav', enabled: true })
    expect(touchedFlag(host)).toBe(true)
    expect(registry.isEnabled('doc-nav')).toBe(true)
  })
})

// ===========================================================================
// (d) — LIVE-12/C persist regression: the in-pane paneVisibilityToggle seam →
// flip + persistEnabledPanes → the persisted hidden pane stays hidden across a
// simulated restart (fresh store over the same temp file).
// ===========================================================================
describe('U-LIVE11 (d) — in-pane paneVisibilityToggle flips + persists; hidden survives a restart (§2.3, §6(d))', () => {
  it('F4/persist — the flipped enabled set is written + re-applied across a fresh store over the same temp file', () => {
    const f = freshDir('live11-persist-')
    try {
      const { sidebar, registry, store } = makeSeamHost({
        specs: [{ id: 'doc-nav' }, { id: 'settings', scope: 'operator' }],
        store: f.store,
      })
      expect(registry.isEnabled('doc-nav')).toBe(true)

      // The in-pane seam hides doc-nav → registry flip + persistEnabledPanes writes.
      sidebar.paneVisibilityToggle('doc-nav')
      expect(registry.isEnabled('doc-nav')).toBe(false)
      const persisted = store.get()
      expect(persisted.panesInitialized).toBe(true)
      expect(persisted.enabledPanes).not.toContain('doc-nav')

      // Simulated restart — a FRESH store over the SAME file keeps doc-nav hidden.
      const reloaded = createOperatorSettingsStore({ path: f.path })
      expect(reloaded.get().enabledPanes).not.toContain('doc-nav')
      // And a fresh host apply of that persisted state keeps it disabled.
      const h2 = makeSeamHost({ specs: [{ id: 'doc-nav' }, { id: 'settings', scope: 'operator' }], store: f.store })
      expect(h2.registry.isEnabled('doc-nav')).toBe(true)
      applyPersistedVisibility(h2.host, reloaded.get())
      expect(h2.registry.isEnabled('doc-nav')).toBe(false)
    } finally {
      rmSync(f.dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// (e) — AD-2026-09-14-1 (host adversarial finding 1, MED): the in-pane
// `paneVisibilityToggle` previously ended with `void this.refresh()`, which ran
// an unconditional synchronous `loadAppGraph` re-load that BYPASSED the
// dirty-edit queue/guard. The native seam `onPaneVisibilityChange` instead
// branches on scope: operator → `refreshOperator()`, app-graph →
// `editController.requestRebuild('content')` (dirty-edit-guarded). The fix
// mirrors that branch + drops the `refresh()` call. Regression: mark a control
// dirty, dispatch the in-pane toggle, assert the app-graph rebuild is QUEUED
// (NOT executed) and no `onRebuild`/`loadAppGraph` fires until the dirty control
// clears.
// ===========================================================================
describe('U-LIVE11 (e) — AD-2026-09-14-1: the in-pane visibility rebuild is dirty-edit-guard QUEUED, never an unconditional loadAppGraph', () => {
  it('a dirty edit queues the content rebuild; no onRebuild fires until the dirty control clears', () => {
    const { registry, sidebar, editController, onRebuild } = makeSeamHost({
      specs: [{ id: 'doc-nav' }, { id: 'crosslinks' }],
      setSpy: vi.fn(async () => ({})),
    })
    expect(registry.isEnabled('doc-nav')).toBe(true)

    // Mark a control dirty through the edit controller (the F4 dirty-edit case).
    editController.markDirty('rag-node-a')
    onRebuild.mockClear()

    // The in-pane visibility toggle (doc-nav is app-graph scope) →
    // `requestRebuild('content')` → the dirty-edit guard QUEUES the additive
    // content reconcile instead of executing an unconditional `loadAppGraph`
    // re-load (the pre-fix `void this.refresh()`).
    sidebar.paneVisibilityToggle('doc-nav')
    expect(registry.isEnabled('doc-nav')).toBe(false)
    expect(editController.anyDirty()).toBe(true)
    expect(editController.hasQueuedRebuild()).toBe(true)
    expect(onRebuild).not.toHaveBeenCalled()

    // Clearing the dirty control executes the queued content rebuild ONCE.
    editController.clearDirty('rag-node-a')
    expect(editController.anyDirty()).toBe(false)
    expect(editController.hasQueuedRebuild()).toBe(false)
    expect(onRebuild).toHaveBeenCalledTimes(1)
    expect(onRebuild).toHaveBeenCalledWith('content')
  })

  it('no dirty edit → the content rebuild fires immediately (no queue)', () => {
    const { registry, sidebar, editController, onRebuild } = makeSeamHost({
      specs: [{ id: 'doc-nav' }, { id: 'crosslinks' }],
    })
    onRebuild.mockClear()
    sidebar.paneVisibilityToggle('doc-nav')
    expect(registry.isEnabled('doc-nav')).toBe(false)
    expect(editController.hasQueuedRebuild()).toBe(false)
    expect(onRebuild).toHaveBeenCalledTimes(1)
    expect(onRebuild).toHaveBeenCalledWith('content')
  })

  it('operator scope → refreshOperator (isolated re-mount); no content rebuild fires', () => {
    const { registry, sidebar, editController, onRebuild, host } = makeSeamHost({
      specs: [{ id: 'settings', scope: 'operator' }],
      setSpy: vi.fn(async () => ({})),
    })
    const refreshOperator = vi.fn()
    ;(host as unknown as { refreshOperator: () => void }).refreshOperator = refreshOperator
    onRebuild.mockClear()
    sidebar.paneVisibilityToggle('settings')
    expect(registry.isEnabled('settings')).toBe(false)
    expect(refreshOperator).toHaveBeenCalledTimes(1)
    expect(onRebuild).not.toHaveBeenCalled()
    expect(editController.hasQueuedRebuild()).toBe(false)
  })
})

// ===========================================================================
// (f) — AD-2026-09-14-2 (host adversarial finding 2, MED): the renderer
// `installSidebarBridge` methods carried `openDocumentTab` + `searchTabQuery`
// that were ABSENT from the preload `SidebarMethods`/holder/proxy — dead at the
// live contextBridge boundary. Fix: (a) a parity guard in `installSidebarBridge`
// fails LOUD when a registered seam is missing from the exposed preload `sidebar`
// proxy; (b) register `openDocumentTab` + `searchTabQuery` on the preload
// default holder + proxy delegation wrappers (the HOST-4/HOST-5 seams — not dead;
// the `SEARCH_RESULT_OPEN_BODY`/`SEARCH_TAB_SUBMIT_BODY` handler bodies reach them).
// ===========================================================================
describe('U-LIVE11 (f) — AD-2026-09-14-2: preload parity guard + the two search seams exposed at the contextBridge boundary', () => {
  it('the preload exposes openDocumentTab + searchTabQuery as no-op functions and delegates the exact args after installSidebar', () => {
    const bridge = capturedBridge()
    expect(typeof bridge.sidebar.openDocumentTab).toBe('function')
    expect(typeof bridge.sidebar.searchTabQuery).toBe('function')
    // Default-holder no-ops never throw before install.
    expect(() => {
      bridge.sidebar.openDocumentTab('doc-b')
      bridge.sidebar.searchTabQuery('tab-x', 'hello')
    }).not.toThrow()
    // After installSidebar, the exposed seam forwards the exact args.
    const seen: Record<string, unknown[][]> = {}
    const methods: Record<string, (...args: unknown[]) => void> = {
      openDocumentTab: (...a: unknown[]) => {
        ;(seen.openDocumentTab ??= []).push(a)
      },
      searchTabQuery: (...a: unknown[]) => {
        ;(seen.searchTabQuery ??= []).push(a)
      },
    }
    bridge.installSidebar(methods)
    bridge.sidebar.openDocumentTab('doc-b')
    bridge.sidebar.searchTabQuery('tab-x', 'hello')
    expect(seen.openDocumentTab).toEqual([['doc-b']])
    expect(seen.searchTabQuery).toEqual([['tab-x', 'hello']])
  })

  it('installSidebarBridge FAILS LOUD when the exposed preload proxy lacks a registered seam (parity guard, no silent-inert)', () => {
    installShim()
    const mount = mountEl() as never
    const operatorMount = mountEl() as never
    const registry = createPaneRegistry()
    registerSpecs(registry, [{ id: 'doc-nav' }])
    const backRefs = new Map<string, string[]>()
    const editController = createEditController({
      backRefs,
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRebuild: vi.fn(async () => {}),
    })
    // A preload proxy that OMITS `searchTabQuery` (the pre-fix dead-seam state):
    // `installSidebar` exists (real contextBridge renderer) but the proxy is
    // short one seam → the parity guard fails LOUD instead of silently installing.
    const sidebarProxy: Record<string, (...args: never[]) => unknown> = {
      selectDocument: () => {},
      togglePaneCollapse: () => {},
      paneVisibilityToggle: () => {},
      zoneMinimizeToggle: () => {},
      paneTabExpand: () => {},
      openDocumentTab: () => {},
      // searchTabQuery intentionally absent → parity guard must throw.
    }
    ;(globalThis as unknown as { window: unknown }).window = { provident: { sidebar: sidebarProxy, installSidebar: () => {} } }
    const host = new SidebarPanes({
      mount,
      operatorMount,
      registry,
      bridge: { operatorSettings: { set: vi.fn(async () => ({})) } } as never,
      backRefs,
      editController,
    })
    expect(() => (host as unknown as { installSidebarBridge(): void }).installSidebarBridge()).toThrow(/missing seam/)
  })
})
