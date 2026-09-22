// tests/unit-u-shell-8-view-menu-pane-visibility.test.ts — Unit U-SHELL-8:
// View → Panes pane visibility (C13). TestWriter RED set written from
// docs/specs/unit-u-shell-8-view-menu-pane-visibility.md §2 (contract),
// §3 (states) + §4 (fail-states) + §5 (census), with the RESOLVED W2-Q5
// (pane-additive assembly reuses the U-STATE-1 pane reconcile; detach =
// invisible to MCP; NO full `loadEnvelope` on a visibility toggle) and W2-Q10
// (list both scopes, grouped; operator toggles stay operator-scope) from
// docs/specs/wave-2-open-decisions.md.
//
// U-MENU-1 ALREADY landed the native menu + catalog IPC + IPC_PANE_VISIBILITY
// (src/main/app-menu.ts, src/main/preload.ts onPaneVisibility). What is NOT
// implemented (this unit):
//
//   - the host `onPaneVisibility` SUBSCRIPTION (spec §5: "new host wiring:
//     `onPaneVisibility` subscription → apply/persist/re-derive");
//   - the APPLY: `registry.setEnabled(id, enabled)` (spec §2.2 step 1);
//   - the C9 PERSIST: write `enabledPanes` through `operatorSettings.set`
//     (spec §2.2 step 2);
//   - the PANE-ADDITIVE zone re-derive via the U-STATE-1 pane reconcile
//     (`applyContentReconcile`) with NO `loadEnvelope` (spec §2.5/W2-Q5, C10);
//   - the BOOT application of persisted `enabledPanes` (spec §3 state 1).
//
// SPEC AMBIGUITIES FLAGGED IN THE RED REPORT (NOT invented here):
//   1. The exact host apply-method NAME is NOT pinned (the spec only names the
//      bridge `onPaneVisibility` subscription). Every test rides the bridge
//      subscription captured at boot + the registry/runtime observables.
//   2. Empty `enabledPanes` semantics: RESOLVED by DECIDED:
//      FIRST-RUN-ENABLED-DEFAULT (docs/decisions.md + docs/defects.md LIVE-7,
//      2026-09-15). On FIRST boot (no persisted `enabledPanes` /
//      `panesInitialized !== true`) the default ENABLED app-graph panes are
//      ONLY `['search','doc-nav']` (NOT all panes), and the default is written
//      through via `persistEnabledPanes()` (so `panesInitialized:true` + the
//      census agree). A non-empty persisted `enabledPanes` stays authoritative;
//      after `panesInitialized` an empty list still means NONE (H2 unchanged).
//      Operator-scope first-run default stays all-enabled.
//   3. `tests/sidebar-panes-host.test.ts` boots with `enabledPanes:['doc-nav']`
//      and expects the OPERATOR settings pane rendered (line ~851). If a
//      non-empty list is authoritative for BOTH scopes, that existing test
//      must be reconciled (spec state 1 + W2-Q10). Flagged.
//   4. The persisted `enabledPanes` list ORDER/SHAPE is not pinned by the spec;
//      assertions check membership, not order.
//   5. F4 dirty-queuing mechanism (which rebuild kind) is not pinned; the test
//      checks the pinned OUTCOME (queued, then applied additively).
//
// MCP-visible equivalence is exercised through the live `Runtime` proxies
// (`listTargets()` / `renderedHtmlResult()`), which are the same graph the MCP
// endpoints read.
import { describe, it, expect, vi } from 'vitest'
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
import { enabledZonePaneCounts } from '../src/renderer/pane-graph.js'
import { defaultLayout, coerceLayout, type LayoutState } from '../src/renderer/layout-state.js'
import { buildMenuTemplate } from '../src/main/app-menu.js'
import { ProvidentMcpServer } from '../src/main/mcp-server.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'
import type {
  OperatorSettings,
  PaneCatalogEntry,
  SecuritySettings,
  RagSnapshotPayload,
  RagDocHeadsPayload,
} from '../src/shared/types.js'

// ---------------------------------------------------------------------------
// Fixtures (mirroring tests/sidebar-panes-host.test.ts).
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function validSnapshot(): RagSnapshotPayload {
  return {
    nodes: [makeNode('head-a', { type: 'h1', content: 'Doc A' })],
    edges: [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })],
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

// ---------------------------------------------------------------------------
// The mock bridge + host harness. The bridge CAPTURES the `onPaneVisibility`
// subscription so the tests can fire the exact IPC_PANE_VISIBILITY payload the
// native menu (U-MENU-1) sends.
// ---------------------------------------------------------------------------
interface BridgeState {
  snapshot: RagSnapshotPayload
  docHeads: RagDocHeadsPayload
  security: SecuritySettings
  operatorSettings: Record<string, unknown>
  paneVisibilityHandler: ((change: unknown) => void) | null
}

interface HarnessOpts {
  snapshot?: RagSnapshotPayload
  docHeads?: RagDocHeadsPayload
  security?: SecuritySettings
  operatorSettings?: Partial<OperatorSettings>
  /** H2 — wire `bridge.operatorSettings` to a REAL store so the visibility
   *  persistence round-trips through disk (not the in-memory merge mock). */
  operatorStore?: OperatorSettingsStore
  layout?: LayoutState
  extraPanes?: Array<{ id: string; title?: string; scope?: 'app-graph' | 'operator'; render?: () => LegacyNodeData }>
}

function makeBridge(opts: HarnessOpts): { bridge: Record<string, unknown>; state: BridgeState } {
  const store = opts.operatorStore
  const state: BridgeState = {
    snapshot: opts.snapshot ?? validSnapshot(),
    docHeads: opts.docHeads ?? { documents: [] },
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
    operatorSettings: store
      ? { ...store.get() }
      : {
          enabledPanes: [],
          defaultDocumentId: null,
          topK: 5,
          editingMode: 'contenteditable',
          theme: 'system',
          layout: opts.layout ?? defaultLayout(),
          ...(opts.operatorSettings ?? {}),
        },
    paneVisibilityHandler: null,
  }
  const bridge: Record<string, unknown> = {
    security: { get: vi.fn(async () => ({ ...state.security })) },
    edit: {
      onRagStoreChanged: vi.fn(() => () => {}),
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async () => ({ ok: true })),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 })),
      snapshot: vi.fn(async () => state.snapshot),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => state.docHeads),
      stores: vi.fn(async () => ({ stores: [] })),
      manage: vi.fn(async () => ({ ok: false, error: 'n/a' })),
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
    operatorSettings: store
      ? {
          get: vi.fn(async () => ({ ...store.get() })),
          set: vi.fn(async (patch: Record<string, unknown>) => {
            const result = store.set(patch as never)
            state.operatorSettings = { ...result }
            return { ...result }
          }),
          onChanged: vi.fn(() => () => {}),
        }
      : {
          get: vi.fn(async () => ({ ...state.operatorSettings })),
          set: vi.fn(async (patch: Record<string, unknown>) => {
            state.operatorSettings = { ...state.operatorSettings, ...patch }
            return { ...state.operatorSettings }
          }),
          onChanged: vi.fn(() => () => {}),
        },
    pushPaneCatalog: vi.fn(),
    // Unit U-SHELL-8 §5 — the host subscribes at boot (the captured handler is
    // the exact seam the native View → Panes checkbox routes through).
    onPaneVisibility: vi.fn((handler: (change: unknown) => void) => {
      state.paneVisibilityHandler = handler
      return () => {
        state.paneVisibilityHandler = null
      }
    }),
  }
  return { bridge, state }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: unknown
  operatorMount: unknown
  registry: PaneRegistry
  bridge: Record<string, unknown>
  state: BridgeState
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: HarnessOpts = {}): Harness {
  installShim()
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  for (const p of opts.extraPanes ?? []) {
    const def = {
      id: p.id,
      title: p.title ?? p.id,
      scope: p.scope ?? 'app-graph',
      render: p.render ?? (() => ({ type: 'div', props: { id: `body-${p.id}` } })),
    } as PaneDefinition
    registry.register(def)
    // Enable extras at setup so F5 isolates the empty-RENDER path from the
    // boot-apply gap (the boot apply re-asserts enablement from enabledPanes).
    registry.enable(p.id)
  }
  const { bridge, state } = makeBridge(opts)
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn((kind?: unknown) => host.reDerive(kind as never))
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
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
  return { host, runtime, mount, operatorMount, registry, bridge, state, backRefs, editController, onRebuild }
}

/** Invoke the captured `onPaneVisibility` handler (the IPC_PANE_VISIBILITY
 *  payload the native menu sends). Throws a descriptive missing-implementation
 *  error when the host never subscribed. */
function fireVisibility(h: Harness, id: unknown, enabled: unknown): void {
  const handler = h.state.paneVisibilityHandler
  if (handler == null) {
    throw new Error('U-SHELL-8 RED: the host did not subscribe to bridge.onPaneVisibility at boot')
  }
  handler({ id, enabled })
}

/** Invoke the captured handler with a raw (possibly malformed) payload. */
function fireRaw(h: Harness, payload: unknown): void {
  const handler = h.state.paneVisibilityHandler
  if (handler == null) {
    throw new Error('U-SHELL-8 RED: the host did not subscribe to bridge.onPaneVisibility at boot')
  }
  ;(handler as (p: unknown) => void)(payload)
}

/** Await the re-derive that `onRebuild` (the host's `reDerive`) triggered. */
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof (result.value as Promise<unknown> | undefined)?.then === 'function') {
    await (result.value as Promise<unknown>)
  }
}

async function flush(): Promise<void> {
  await Promise.resolve()
  await new Promise((r) => setTimeout(r, 0))
}

// ---- live-graph observables (the same graph MCP reads) ---------------------
function targetIds(h: Harness): string[] {
  return h.runtime
    .listTargets()
    .nodes.map((n) => n.propsId)
    .filter((x): x is string => typeof x === 'string')
}

function hasPaneTarget(h: Harness, paneId: string): boolean {
  return targetIds(h).includes(`pane-${paneId}`)
}

function operatorHtml(h: Harness): string {
  return (h.operatorMount as unknown as { innerHTML: string }).innerHTML
}

/** V4/V5 regression — the resolved mirror classes of a `zone:<name>` container
 *  in the LIVE graph (the same resolved state the DOM/SSR views are emitted
 *  from). Resolves the container by its authored `props.id` (`zone:<name>`). */
function zoneMirrorClasses(h: Harness, zone: string): string[] {
  const result = h.runtime.nodeState(`zone:${zone}`)
  const first = result.states[0] as { css?: { classes?: unknown } } | undefined
  const classes = first?.css?.classes
  return Array.isArray(classes) ? classes.map(String) : []
}

function enabledPatchCall(bridge: Record<string, unknown>): string[] | undefined {
  const set = (bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set
  for (let i = set.mock.calls.length - 1; i >= 0; i--) {
    const patch = set.mock.calls[i][0] as { enabledPanes?: unknown }
    if (patch && Array.isArray(patch.enabledPanes)) return patch.enabledPanes as string[]
  }
  return undefined
}

function catalogsPushed(bridge: Record<string, unknown>): PaneCatalogEntry[][] {
  return (bridge.pushPaneCatalog as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0] as PaneCatalogEntry[])
}

function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell8-'))
  try {
    fn(join(dir, 'settings.json'), createOperatorSettingsStore({ path: join(dir, 'settings.json') }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// ===========================================================================
// §2.1 / W2-Q10 — the View → Panes menu is data-driven, lists BOTH scopes,
// grouped (app-graph before operator), and reflects the current enabled set.
// ===========================================================================
interface MenuItemLike {
  label?: string
  type?: string
  checked?: boolean
  enabled?: boolean
  submenu?: MenuItemLike[]
  click?: (item: MenuItemLike) => void
}
function viewPanesItems(template: unknown[]): MenuItemLike[] {
  const view = (template as MenuItemLike[]).find((m) => m.label === 'View')
  const panes = view?.submenu?.find((m) => m.label === 'Panes')
  return panes?.submenu ?? []
}

describe('U-SHELL-8 — View → Panes data-driven menu (spec §2.1, W2-Q10)', () => {
  const CATALOG: PaneCatalogEntry[] = [
    { id: 'crosslinks', title: 'Links', scope: 'app-graph', enabled: true },
    { id: 'settings', title: 'Settings', scope: 'operator', enabled: false },
    { id: 'doc-nav', title: 'Documents', scope: 'app-graph', enabled: true },
  ]

  it('§2.1 — one checkbox per catalog pane; app-graph grouped before operator', () => {
    const items = viewPanesItems(buildMenuTemplate(CATALOG, { platform: 'linux' }))
    expect(items).toHaveLength(3)
    for (const item of items) expect(item.type).toBe('checkbox')
    const labels = items.map((i) => i.label)
    expect(labels).toEqual(['Documents', 'Links', 'Settings'])
    expect(labels.indexOf('Settings')).toBeGreaterThan(labels.indexOf('Links'))
  })

  it('W2-Q10 — the operator pane is listed (both scopes in one Panes submenu)', () => {
    const items = viewPanesItems(buildMenuTemplate(CATALOG, { platform: 'linux' }))
    expect(items.map((i) => i.label)).toContain('Settings')
  })

  it('§2.2 — each checkbox reflects the current enabled state (the serialized model round-trips)', () => {
    const items = viewPanesItems(buildMenuTemplate(CATALOG, { platform: 'linux' }))
    expect(items.find((i) => i.label === 'Documents')?.checked).toBe(true)
    expect(items.find((i) => i.label === 'Links')?.checked).toBe(true)
    expect(items.find((i) => i.label === 'Settings')?.checked).toBe(false)
  })

  it('§2.2 — toggling a checkbox routes IPC_PANE_VISIBILITY {id, enabled} to the host action', () => {
    const togglePane = vi.fn()
    const items = viewPanesItems(buildMenuTemplate(CATALOG, { platform: 'linux', actions: { openImport: () => {}, togglePane } }))
    items.find((i) => i.label === 'Settings')?.click?.({ checked: true })
    expect(togglePane).toHaveBeenCalledWith('settings', true)
  })

  it('§2.1 — the catalog is pushed from the LIVE registry at boot (5 panes, both scopes)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const pushes = catalogsPushed(h.bridge)
    expect(pushes.length).toBeGreaterThan(0)
    const catalog = pushes[pushes.length - 1]
    const ids = catalog.map((c) => c.id)
    for (const id of ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings']) {
      expect(ids).toContain(id)
    }
    expect(catalog.some((c) => c.scope === 'app-graph')).toBe(true)
    expect(catalog.some((c) => c.scope === 'operator')).toBe(true)
  })
})

// ===========================================================================
// §3 state 1 + §4 F3 — boot applies the persisted enabledPanes to the registry
// ===========================================================================
describe('U-SHELL-8 — boot applies persisted enabledPanes (spec §3 state 1, F3)', () => {
  it('state 1 — a persisted enabled pane renders; an omitted pane does not', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'settings'] } })
    await h.host.boot(h.runtime)
    expect(h.registry.isEnabled('doc-nav')).toBe(true)
    expect(h.registry.isEnabled('crosslinks')).toBe(false)
    expect(hasPaneTarget(h, 'doc-nav')).toBe(true)
    expect(hasPaneTarget(h, 'crosslinks')).toBe(false)
  })

  it('state 1 regression — an EMPTY first-run persisted list enables ONLY the first-run default (search + doc-nav)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: [] } })
    await h.host.boot(h.runtime)
    // FIRST-RUN-ENABLED-DEFAULT: only search + doc-nav enabled (not all panes).
    for (const id of ['doc-nav', 'search', 'settings']) {
      expect(h.registry.isEnabled(id)).toBe(true)
    }
    for (const id of ['crosslinks', 'template-editor']) {
      expect(h.registry.isEnabled(id)).toBe(false)
    }
    expect(hasPaneTarget(h, 'doc-nav')).toBe(true)
  })

  it('F3 — an unknown id in persisted enabledPanes is dropped + a warning is emitted (no phantom pane)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const h = makeHarness({ operatorSettings: { enabledPanes: ['ghost-pane', 'doc-nav', 'settings'] } })
      await h.host.boot(h.runtime)
      expect(h.registry.get('ghost-pane')).toBeUndefined()
      expect(hasPaneTarget(h, 'ghost-pane')).toBe(false)
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })

  // DECIDED: FIRST-RUN-ENABLED-DEFAULT (docs/defects.md LIVE-7) — the new
  // explicit contract pinned here (RED against the pre-fix code, which enables
  // ALL app-graph panes on the empty-first-run branch and does NOT write the
  // default through). On a first-run boot the registry has EXACTLY
  // {search, doc-nav} enabled AND the implementer writes that default through
  // via persistEnabledPanes() so the #operator-enabled-panes census and a
  // subsequent boot agree (panesInitialized:true + the pinned set persisted).
  it('state 1 — empty first-run persisted set ⇒ registry exactly {search,doc-nav} AND the default is WRITTEN THROUGH (panesInitialized:true)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell8-firstrun-'))
    try {
      const path = join(dir, 'settings.json')
      // First-run: a real store with nothing persisted (panesInitialized undefined).
      const h = makeHarness({ operatorStore: createOperatorSettingsStore({ path }) })
      await h.host.boot(h.runtime)

      // The registry ends up with EXACTLY the first-run default enabled.
      expect(h.registry.isEnabled('doc-nav')).toBe(true)
      expect(h.registry.isEnabled('search')).toBe(true)
      expect(h.registry.isEnabled('crosslinks')).toBe(false)
      expect(h.registry.isEnabled('template-editor')).toBe(false)

      // And the implementer writes the default through (census + next boot agree).
      const persisted = createOperatorSettingsStore({ path }).get()
      expect(persisted.panesInitialized).toBe(true)
      // Order is not pinned (spec §3 note); the persisted SET is exactly the default.
      expect(persisted.enabledPanes).toHaveLength(2)
      expect(persisted.enabledPanes?.sort()).toEqual(['doc-nav', 'search'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// W2-N9 — a pane hot-registered after boot (spec §2.7 H6), ADJUDICATED:
// default-DISABLED + host-enables-to-appear.
// ===========================================================================
describe('W2-N9 — a pane hot-registered after boot defaults DISABLED + host-enables-to-appear (spec §2.7 H6)', () => {
  it('H6 — a pane registered after boot defaults DISABLED and appears only when the host explicitly enables it', async () => {
    // Adjudication (W2-N9): the registry `register` default is deliberately
    // DISABLED (6 pre-existing tests pin it — default-off visibility). A pane
    // hot-registered AFTER boot therefore defaults DISABLED and becomes visible
    // ONLY when the host explicitly enables it via the onPaneVisibility enable
    // path (registry.setEnabled → requestRebuild), NOT merely on registration.
    // A persisted enabledPanes list governs ONLY the panes present at boot.
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'settings'] } })
    await h.host.boot(h.runtime)

    // Pre-registration baseline: the id is unknown, so it is neither present
    // nor enabled (the pane was absent at boot).
    expect(h.registry.get('late-pane')).toBeUndefined()
    expect(h.registry.isEnabled('late-pane')).toBe(false)
    expect(hasPaneTarget(h, 'late-pane')).toBe(false)

    // Register a NEW app-graph pane AFTER boot via the live registry.
    h.registry.register({
      id: 'late-pane',
      title: 'Late Pane',
      scope: 'app-graph',
      render: (): LegacyNodeData => ({ type: 'div', props: { id: 'body-late-pane' } }),
    })

    // H6 pin 1 — a post-boot registration defaults DISABLED (register never
    // enables). The persisted enabledPanes=['doc-nav','settings'] omitting
    // 'late-pane' is not the governing fact: the registry default is DISABLED
    // until the host explicitly enables the pane.
    expect(h.registry.isEnabled('late-pane')).toBe(false)
    // And DISABLED ⇒ not yet present in the app-graph (no re-derive on register).
    expect(hasPaneTarget(h, 'late-pane')).toBe(false)

    // H6 pin 2 — the host EXPLICITLY enables the hot-added pane through the
    // onPaneVisibility enable path (the same seam the native View → Panes menu
    // routes through): registry.setEnabled → requestRebuild → pane re-derive
    // into its zone, pane-additive with NO loadEnvelope/teardown.
    const loadSpy = vi.spyOn(h.runtime, 'loadEnvelope')
    const teardownSpy = vi.spyOn(h.runtime, 'teardown')
    fireVisibility(h, 'late-pane', true)
    await vi.waitFor(() => expect(h.registry.isEnabled('late-pane')).toBe(true))
    await vi.waitFor(() => expect(hasPaneTarget(h, 'late-pane')).toBe(true))
    expect(loadSpy).not.toHaveBeenCalled()
    expect(teardownSpy).not.toHaveBeenCalled()

    // The host-side enable round-trips into the persisted enabledPanes carrier.
    const persisted = enabledPatchCall(h.bridge)
    expect(persisted).toBeDefined()
    expect(persisted).toContain('late-pane')
  })
})

// ===========================================================================
// §2.2 / §3 states 2–3 — toggle ON / OFF (apply + persist + re-derive)
// ===========================================================================
describe('U-SHELL-8 — apply + persist + re-derive on toggle (spec §2.2, states 2/3)', () => {
  it('state 3 — toggle OFF: registry disabled, pane detached, enabledPanes persisted without it', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    expect(hasPaneTarget(h, 'doc-nav')).toBe(true)

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))

    expect(h.registry.isEnabled('doc-nav')).toBe(false)
    expect(hasPaneTarget(h, 'crosslinks')).toBe(true)
    const persisted = enabledPatchCall(h.bridge)
    expect(persisted).toBeDefined()
    expect(persisted).not.toContain('doc-nav')
  })

  it('state 2 — toggle ON: registry enabled, pane attached, enabledPanes persisted with it', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    expect(h.registry.isEnabled('doc-nav')).toBe(false)
    expect(hasPaneTarget(h, 'doc-nav')).toBe(false)

    fireVisibility(h, 'doc-nav', true)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(true))

    expect(h.registry.isEnabled('doc-nav')).toBe(true)
    const persisted = enabledPatchCall(h.bridge)
    expect(persisted).toBeDefined()
    expect(persisted).toContain('doc-nav')
  })

  it('state 3 — a hidden app-graph pane is invisible to the MCP surface (listTargets + rendered HTML)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    expect(targetIds(h)).toContain('pane-doc-nav')
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(targetIds(h)).not.toContain('pane-doc-nav'))
    expect(h.runtime.renderedHtmlResult().renderedHtml).not.toContain('pane-doc-nav')
  })

  it('§2.2 — the menu catalog re-pushes with the updated enabled flag after a toggle (F6)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    ;(h.bridge.pushPaneCatalog as ReturnType<typeof vi.fn>).mockClear()

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(enabledPatchCall(h.bridge)).toBeDefined())

    const pushes = catalogsPushed(h.bridge)
    expect(pushes.length).toBeGreaterThan(0)
    const last = pushes[pushes.length - 1]
    expect(last.find((c) => c.id === 'doc-nav')?.enabled).toBe(false)
  })

  it('§2.2 — enabledPanes round-trips through the OperatorSettings store (restart persistence, state 8)', () => {
    withTempStore((path, store) => {
      store.set({ enabledPanes: ['crosslinks', 'settings'] })
      const reloaded = createOperatorSettingsStore({ path })
      expect(reloaded.get().enabledPanes).toContain('crosslinks')
      expect(reloaded.get().enabledPanes).not.toContain('doc-nav')
    })
  })

  it('state 8 — restart with a persisted hidden pane keeps it hidden', async () => {
    await new Promise<void>((resolve, reject) => {
      withTempStore((path, store) => {
        store.set({ enabledPanes: ['crosslinks', 'search', 'template-editor', 'settings'] })
        const reloaded = createOperatorSettingsStore({ path })
        const h = makeHarness({ operatorSettings: reloaded.get() })
        h.host
          .boot(h.runtime)
          .then(() => {
            expect(h.registry.isEnabled('doc-nav')).toBe(false)
            expect(hasPaneTarget(h, 'doc-nav')).toBe(false)
            resolve()
          })
          .catch(reject)
      })
    })
  })
})

// ===========================================================================
// §2.5 / §3 state 6 (W2-Q5, C10) — the toggle is PANE-ADDITIVE:
// no loadEnvelope/teardown; uses the U-STATE-1 pane reconcile.
// ===========================================================================
describe('U-SHELL-8 — pane-additive reconcile, no full reload (spec §2.5, state 6, W2-Q5)', () => {
  it('state 6 — a visibility toggle never calls loadEnvelope/teardown and reuses applyContentReconcile', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)

    const loadSpy = vi.spyOn(h.runtime, 'loadEnvelope')
    const teardownSpy = vi.spyOn(h.runtime, 'teardown')
    const reconcileSpy = vi.spyOn(h.runtime, 'applyContentReconcile')

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))

    expect(loadSpy).not.toHaveBeenCalled()
    expect(teardownSpy).not.toHaveBeenCalled()
    expect(reconcileSpy).toHaveBeenCalled()
  })

  it('state 6 — the `zone:*` container identities stay stable across a toggle', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    const before = targetIds(h).filter((id) => id.startsWith('zone:'))
    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))
    const after = targetIds(h).filter((id) => id.startsWith('zone:'))
    expect(after).toEqual(before)
    for (const zone of ['left', 'right', 'header', 'footer']) expect(after).toContain(`zone:${zone}`)
  })

  it('state 6 — the pane is detached through the reconcile (the next envelope omits it)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    const reconcileSpy = vi.spyOn(h.runtime, 'applyContentReconcile')
    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(reconcileSpy).toHaveBeenCalled())
    const lastInput = reconcileSpy.mock.calls[reconcileSpy.mock.calls.length - 1][0] as { next?: unknown }
    const next = JSON.stringify(lastInput?.next ?? {})
    expect(next).not.toContain('pane-doc-nav')
  })
})

// ===========================================================================
// §2.3 / §3 states 4–5 (C11) — hiding the last pane empties the zone; showing
// a pane into an empty zone un-hides it + the retained size survives.
// ===========================================================================
describe('U-SHELL-8 — C11 cascade: empty-zone auto-hide + restore (spec §2.3, states 4/5)', () => {
  function c11Harness(): { h: Harness; layout: LayoutState } {
    const layout = coerceLayout({
      version: 1,
      panes: [
        { id: 'doc-nav', zone: 'left', order: 0, collapsed: false },
        { id: 'crosslinks', zone: 'right', order: 0, collapsed: false },
        { id: 'search', zone: 'right', order: 1, collapsed: false },
        { id: 'template-editor', zone: 'right', order: 2, collapsed: false },
      ],
      zones: { left: { size: 300, minimized: false } },
    })
    const h = makeHarness({
      layout,
      operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'], layout },
    })
    return { h, layout }
  }

  it('state 4 — hiding the LAST pane in `left` drives that zone to zero (is-empty census)', async () => {
    const { h, layout } = c11Harness()
    await h.host.boot(h.runtime)
    expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(1)

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))
    expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(0)
  })

  it('state 5 — showing a pane into the empty `left` un-hides it (census) and retains the persisted size', async () => {
    const { h, layout } = c11Harness()
    await h.host.boot(h.runtime)
    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(0))

    fireVisibility(h, 'doc-nav', true)
    await vi.waitFor(() => expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(1))
    // The retained zone size is not zeroed by a visibility toggle (U-SHELL-1).
    const persistedLayout = (h.state.operatorSettings as { layout?: LayoutState }).layout
    expect(persistedLayout?.zones.left.size).toBe(300)
  })

  // V4 blind-test FAIL regression — the pane-additive reconcile must refresh the
  // `zone:<name>` container's state-derived `is-empty` mirror (C11), not just
  // detach the pane roots. Boot is the control (it renders `is-empty`); the
  // toggle path must match.
  it('state 4 regression (V4) — hiding the LAST pane in `left` marks the `zone:left` container `is-empty`', async () => {
    const { h, layout } = c11Harness()
    await h.host.boot(h.runtime)
    expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(1)
    expect(zoneMirrorClasses(h, 'left')).not.toContain('is-empty')

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))
    expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(0)
    await vi.waitFor(() => expect(zoneMirrorClasses(h, 'left')).toContain('is-empty'))
  })

  // V5 blind-test FAIL regression — re-showing a pane into an emptied zone
  // clears `is-empty` (the un-hide half of the C11 cascade) while the retained
  // zone size survives the round trip.
  it('state 5 regression (V5) — showing a pane into the empty `left` clears `is-empty` + retains the size', async () => {
    const { h, layout } = c11Harness()
    await h.host.boot(h.runtime)
    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(0))
    await vi.waitFor(() => expect(zoneMirrorClasses(h, 'left')).toContain('is-empty'))

    fireVisibility(h, 'doc-nav', true)
    await vi.waitFor(() => expect(enabledZonePaneCounts(h.registry, coerceLayout(layout)).left).toBe(1))
    await vi.waitFor(() => expect(zoneMirrorClasses(h, 'left')).not.toContain('is-empty'))
    const persistedLayout = (h.state.operatorSettings as { layout?: LayoutState }).layout
    expect(persistedLayout?.zones.left.size).toBe(300)
  })
})

// ===========================================================================
// §2.4 / §3 state 7 / §6 — operator-only, no MCP tool; operator toggles stay
// operator-scope.
// ===========================================================================
describe('U-SHELL-8 — operator-only + no MCP tool (spec §2.4, §6, state 7)', () => {
  it('§2.4/§6 — there is no MCP tool to toggle pane visibility', () => {
    const names = ProvidentMcpServer.ALL_TOOLS
    expect(names).not.toContain('provident.toggle_pane')
    expect(names.some((n) => /pane|visib/i.test(n))).toBe(false)
  })

  it('state 7/W2-Q10 — toggling an operator pane removes it from the operator scope only (app graph untouched)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    expect(operatorHtml(h)).toContain('operator-pane-settings')
    expect(hasPaneTarget(h, 'doc-nav')).toBe(true)

    fireVisibility(h, 'settings', false)
    await vi.waitFor(() => expect(operatorHtml(h)).not.toContain('operator-pane-settings'))

    expect(h.registry.isEnabled('settings')).toBe(false)
    expect(hasPaneTarget(h, 'doc-nav')).toBe(true)
    const persisted = enabledPatchCall(h.bridge)
    expect(persisted).not.toContain('settings')
  })
})

// ===========================================================================
// §4 fail-states
// ===========================================================================
describe('U-SHELL-8 — fail-states / edge cases (spec §4)', () => {
  it('F1 — a toggle for an unregistered pane id is ignored (no phantom entry, no write)', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    ;(h.bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set.mockClear()

    expect(() => fireVisibility(h, 'ghost-pane', true)).not.toThrow()
    await flush()
    expect(h.registry.get('ghost-pane')).toBeUndefined()
    expect(hasPaneTarget(h, 'ghost-pane')).toBe(false)
    expect((h.bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set).not.toHaveBeenCalled()
  })

  it('F2 — a malformed IPC_PANE_VISIBILITY payload is ignored; never throws', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    ;(h.bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set.mockClear()

    for (const payload of [null, undefined, 'doc-nav', 42, {}, { id: 7, enabled: true }, { id: 'doc-nav' }, { id: '', enabled: false }]) {
      expect(() => fireRaw(h, payload)).not.toThrow()
    }
    await flush()
    // No malformed payload may have disabled a valid pane.
    expect(h.registry.isEnabled('doc-nav')).toBe(true)
    expect((h.bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set).not.toHaveBeenCalled()
  })

  it('F4 — toggling while an edit is dirty is queued via the rebuild guard, then applied additively', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    const loadSpy = vi.spyOn(h.runtime, 'loadEnvelope')

    h.editController.markDirty('n1')
    fireVisibility(h, 'doc-nav', false)
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(loadSpy).not.toHaveBeenCalled()

    h.editController.clearDirty('n1')
    await awaitRebuild(h)
    await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))
    expect(loadSpy).not.toHaveBeenCalled()
  })

  it('F5 — a pane that renders nothing when enabled renders its empty frame; never throws', async () => {
    const h = makeHarness({
      operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings', 'empty-pane'] },
      extraPanes: [{ id: 'empty-pane', render: () => ({ type: 'div' }) }],
    })
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    expect(hasPaneTarget(h, 'empty-pane')).toBe(true)
    expect(() => fireVisibility(h, 'empty-pane', false)).not.toThrow()
    expect(() => fireVisibility(h, 'empty-pane', true)).not.toThrow()
  })

  it('F6 — the registry is authoritative even when the pushed catalog is stale; the catalog re-pushes after', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    ;(h.bridge.pushPaneCatalog as ReturnType<typeof vi.fn>).mockClear()

    fireVisibility(h, 'doc-nav', false)
    await vi.waitFor(() => expect(h.registry.isEnabled('doc-nav')).toBe(false))
    // The registry is the source of truth; the catalog is rebuilt from it.
    const pushes = catalogsPushed(h.bridge)
    expect(pushes.length).toBeGreaterThan(0)
    expect(pushes[pushes.length - 1].find((c) => c.id === 'doc-nav')?.enabled).toBe(false)
  })

  it('F7 — a settings write failure still applies the enablement in memory for the session', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'] } })
    await h.host.boot(h.runtime)
    ;(h.bridge.operatorSettings as { set: ReturnType<typeof vi.fn> }).set.mockRejectedValueOnce(new Error('disk full'))

    expect(() => fireVisibility(h, 'doc-nav', false)).not.toThrow()
    await vi.waitFor(() => expect(h.registry.isEnabled('doc-nav')).toBe(false))
    await flush()
    expect(hasPaneTarget(h, 'doc-nav')).toBe(false)
  })
})

// ===========================================================================
// §2.7 — adversarial findings H1–H5 regression (post-review fixes)
// ===========================================================================
describe('U-SHELL-8 §2.7 — adversarial findings H1–H5 (regression)', () => {
  it('H1 — an unknown-only enabledPanes list drops to empty ⇒ first-run default (search + doc-nav) enabled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const h = makeHarness({ operatorSettings: { enabledPanes: ['ghost'] } })
      await h.host.boot(h.runtime)
      // Unknown-only → drops to empty → empty-first-run branch (FIRST-RUN-ENABLED-DEFAULT).
      for (const id of ['doc-nav', 'search']) {
        expect(h.registry.isEnabled(id)).toBe(true)
      }
      for (const id of ['crosslinks', 'template-editor']) {
        expect(h.registry.isEnabled(id)).toBe(false)
      }
      expect(hasPaneTarget(h, 'doc-nav')).toBe(true)
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })

  it('H4 — a wrong-scope persisted id is warned + filtered (keyed on the scope registry)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    try {
      const h = makeHarness({ operatorSettings: { enabledPanes: ['settings'], enabledOperatorPanes: ['doc-nav'] } })
      await h.host.boot(h.runtime)
      // enabledPanes=['settings'] is wrong-scope for app-graph → dropped → empty
      // → first-run branch: search+doc-nav only (FIRST-RUN-ENABLED-DEFAULT).
      for (const id of ['doc-nav', 'search']) {
        expect(h.registry.isEnabled(id)).toBe(true)
      }
      for (const id of ['crosslinks', 'template-editor']) {
        expect(h.registry.isEnabled(id)).toBe(false)
      }
      // enabledOperatorPanes=['doc-nav'] is wrong-scope for operator → dropped →
      // empty → operator first-run default stays all-enabled (settings still on).
      expect(h.registry.isEnabled('settings')).toBe(true)
      expect(warn).toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })

  it('H2 — hiding every app-graph pane is persistable + round-trips (panesInitialized ⇒ empty = none)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ushell8-h2-'))
    try {
      const path = join(dir, 'settings.json')
      const h = makeHarness({ operatorStore: createOperatorSettingsStore({ path }) })
      await h.host.boot(h.runtime)
      // FIRST boot (empty persisted set, panesInitialized !== true): only the
      // first-run default is enabled (search + doc-nav), NOT all app-graph panes.
      for (const id of ['doc-nav', 'search']) {
        expect(h.registry.isEnabled(id)).toBe(true)
      }
      for (const id of ['crosslinks', 'template-editor']) {
        expect(h.registry.isEnabled(id)).toBe(false)
      }
      // Hide EVERY app-graph pane. crosslinks/template-editor are already off on
      // first boot, so hiding them is a no-op; search + doc-nav now go off. The
      // persisted result must still be an empty enabledPanes WITH panesInitialized
      // true (so the SECOND boot reads empty = NONE, not first-run).
      for (const id of ['doc-nav', 'crosslinks', 'search', 'template-editor']) {
        fireVisibility(h, id, false)
      }
      await vi.waitFor(() => expect(hasPaneTarget(h, 'doc-nav')).toBe(false))

      const persisted = createOperatorSettingsStore({ path }).get()
      expect(persisted.panesInitialized).toBe(true)
      expect(persisted.enabledPanes).toEqual([])

      const h2 = makeHarness({ operatorStore: createOperatorSettingsStore({ path }) })
      await h2.host.boot(h2.runtime)
      for (const id of ['doc-nav', 'crosslinks', 'search', 'template-editor']) {
        expect(h2.registry.isEnabled(id)).toBe(false)
      }
      expect(hasPaneTarget(h2, 'doc-nav')).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('H3 — a toggle fired during boot is not clobbered by the boot apply', async () => {
    const bootSettings = {
      enabledPanes: ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'],
      enabledOperatorPanes: ['settings'],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'contenteditable',
      theme: 'system',
      layout: defaultLayout(),
      panesInitialized: false,
    }
    const h = makeHarness({ operatorSettings: bootSettings as Partial<OperatorSettings> })
    // Freeze the boot fetch on the STALE pre-toggle settings so the TOCTOU is
    // real (the default mock reads the live state the toggle just wrote).
    ;(h.bridge.operatorSettings as { get: ReturnType<typeof vi.fn> }).get.mockImplementation(async () => ({ ...bootSettings }))
    const booting = h.host.boot(h.runtime)
    fireVisibility(h, 'doc-nav', false)
    await booting
    await vi.waitFor(() => expect(h.registry.isEnabled('doc-nav')).toBe(false))
    expect(hasPaneTarget(h, 'doc-nav')).toBe(false)
  })

  it('H5 — a non-array enabledPanes carrier does not throw on the operator render', async () => {
    const h = makeHarness({ operatorSettings: { enabledPanes: 'not-an-array' } as unknown as Partial<OperatorSettings> })
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    expect(operatorHtml(h)).toContain('operator-pane-settings')
  })
})
