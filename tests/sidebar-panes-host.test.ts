// tests/sidebar-panes-host.test.ts — Unit K: the `SidebarPanes` renderer host
// (docs/specs/unit-k-sidebar-panes-host.md §5.8 happy paths + §5.9 fail-states
// + §5.10 census + the §3b review amendments M1-M17/S18-S19). This is the
// TestWriter RED set — the target module does NOT exist yet:
//
//   - `src/renderer/sidebar-panes.js` (RED — module not found): the
//     `SidebarPanes` host (`boot`/`reDerive`/`loadAppGraph`/`mountOperator`/
//     `refresh`/`registerPanes`/`bindHandlers`/`buildContext`/
//     `buildTemplateContext`/`setCurrentDocumentId`/`setCurrentNodeId`/
//     `onRagStoreChanged`/`onTemplateChanged` + the `SidebarPanesOptions`).
//   - `src/renderer/renderer.js` (EXISTS, but the Unit K amendment is RED): the
//     boot wiring replacing the `demoEnvelope()` bootstrap.
//
// Imports that EXIST (used for fixtures/envelopes, so the pure red set isolates
// exactly the Unit K host):
//   - `src/renderer/pane-registry.js` + `pane-graph.js` (Unit H — the registry
//     + `assembleAppGraphEnvelope`/`buildOperatorEnvelope` the host composes).
//   - `src/renderer/template-pane.js` (Unit I — the template-editor pane).
//   - `src/renderer/edit-controller.js` (Unit D — the dirty-edit guard).
//   - `src/renderer/runtime.js` (the app Runtime the host loads the
//     pane-inclusive envelope into).
//   - `src/main/traversal.js` (`buildTraversal` — real traversal envelopes).
//   - `src/main/template-store.js` (`DEFAULT_CONTENT_WINDOW_TEMPLATE`).
//   - `src/shared/dom-shim.js` (the DOM shim the Runtime + isolated scope need).
//
// The Electron/DOM-dependent parts (§5.8 items 16-20, §5.9 items 10-11) are
// documented in a `.skip` block at the bottom — the MCP-visible equivalence
// (`get_rendered_html`/`get_markdown`/`list_targets`/`dispatch`), the operator
// isolation, and the DOM dispatch path are NOT node-testable; they are verified
// by code review / the e2e battery, mirroring the Unit H convention.
//
// These tests are RED because the Unit K host does not exist yet. The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, beforeAll, vi } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { registerHandlerDef, handlerDef } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition, type PaneContext } from '../src/renderer/pane-registry.js'
import { assembleAppGraphEnvelope, buildOperatorEnvelope, SIDEBAR_ZONE } from '../src/renderer/pane-graph.js'
import { createTemplateEditorPane, type TemplatePaneContext } from '../src/renderer/template-pane.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal, type CrosslinkWiring } from '../src/main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import type { RagStoreChangedPayload } from '../src/main/preload.js'
import type { RagSnapshotPayload, RagQueryResult, TemplateChangedPayload, SecuritySettings } from '../src/shared/types.js'

// ---- Unit K module (RED — module not found) --------------------------------
import { SidebarPanes, type SidebarPanesOptions } from '../src/renderer/sidebar-panes.js'

// ---- the pinned §5.4 operator-settings payload types (M9) ------------------
// The spec pins these in §5.4; they are NOT yet in `src/shared/types.ts`. They
// are defined here so the mock bridge + the host contract are pinned.
interface OperatorSettings {
  enabledPanes: string[]
  defaultDocumentId: string | null
  topK: number
}
interface OperatorSettingsPatch {
  enabledPanes?: string[]
  defaultDocumentId?: string | null
  topK?: number
}

// ---- fixtures --------------------------------------------------------------

function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
  const now = new Date().toISOString()
  return {
    id,
    kind,
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** A valid one-document snapshot: one `doc-head` edge → document root `doc-a`. */
function validSnapshot(): RagSnapshotPayload {
  return {
    nodes: [makeNode('head-a', { type: 'h1', content: 'Doc A' })],
    edges: [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })],
  }
}

/** An EMPTY snapshot (no `doc-head` edges → no documents). */
function emptySnapshot(): RagSnapshotPayload {
  return { nodes: [], edges: [] }
}

/** The placeholder/default content-window template envelope (M1 — the
 *  empty-store envelope): a bare `wiki-root` + one `main` zone container, NO
 *  content payloads. This is the SAME envelope the renderer constructs as the
 *  placeholder bootstrap (§5.1 renderer entry step 1). */
function placeholderEnvelope(): LegacyInitialData {
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
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** A custom content-window template (a `section` root + a `main` producer). */
function customTemplate(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
      ],
    },
  }
}

/** A real traversal envelope (Unit C `buildTraversal` — EXISTS) over a
 *  one-document store. */
function traversalEnvelope(): LegacyInitialData {
  const nodes = [makeNode('head-a', { type: 'h1', content: 'Doc A' })]
  const edges = [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })]
  const store = { listNodes: () => nodes, listEdges: () => edges } as never
  return buildTraversal({ store, documentIds: ['doc-a'], zoneName: 'main' }).envelope
}

// ---- the mock bridge -------------------------------------------------------

/** A fake `ProvidentBridge` (the renderer's IPC surface) with vi.fn() spies +
 *  controllable state. The `operatorSettings` namespace is the NEW M9 surface. */
function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  template?: { source: string; template: ContentWindowTemplate }
  queryResult?: RagQueryResult
  backlinksResult?: BacklinkResult
  security?: SecuritySettings
  operatorSettings?: OperatorSettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? emptySnapshot(),
    template: opts.template ?? { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE },
    queryResult: opts.queryResult ?? null,
    backlinksResult: opts.backlinksResult ?? null,
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5 },
  }
  const bridge = {
    security: {
      get: vi.fn(async (): Promise<SecuritySettings> => ({ ...state.security })),
    },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        state.queryResult ?? { query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 }),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        state.backlinksResult ?? { nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
    },
    template: {
      get: vi.fn(async () => state.template),
      validate: vi.fn(async () => ({ ok: true })),
      set: vi.fn(async () => state.template),
      create: vi.fn(async () => state.template),
      delete: vi.fn(async () => state.template),
      reset: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async (): Promise<OperatorSettings> => ({ ...state.operatorSettings })),
      set: vi.fn(async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
    },
  }
  return { bridge, state }
}

// ---- the harness -----------------------------------------------------------

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: unknown
  operatorMount: unknown
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  state: ReturnType<typeof makeBridge>['state']
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
  sidebar: {
    selectDocument: (id: string) => void
    submitQuery: (value: string) => void
    templateAdd: (zone: string) => void
    templateRemove: (zone: string) => void
    templateReset: () => void
    operatorSet: (patch: OperatorSettingsPatch) => void
  }
}

/** Build a `SidebarPanes` host + a real app Runtime (DOM-shimmed) + a mock
 *  bridge. The `onRebuild` callback of the edit controller is the host's
 *  `reDerive` (the §5.2 wiring). The `window.provident.sidebar` bridge surface
 *  is installed by the host at boot. */
function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  template?: { source: string; template: ContentWindowTemplate }
  queryResult?: RagQueryResult
  backlinksResult?: BacklinkResult
  security?: SecuritySettings
  operatorSettings?: OperatorSettings
} = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const { bridge, state } = makeBridge(opts)
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
  host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  // The renderer installs `window.provident` (the bridge); the host adds
  // `window.provident.sidebar` at boot. The `sidebar` accessor reads the global
  // at CALL time (the bridge surface is installed by `boot`, not construction).
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  const sidebar = (): Harness['sidebar'] =>
    (globalThis as unknown as { window: { provident: { sidebar: Harness['sidebar'] } } }).window.provident.sidebar
  return {
    host,
    runtime,
    mount,
    operatorMount,
    registry,
    bridge,
    state,
    backRefs,
    editController,
    onRebuild,
    get sidebar() {
      return sidebar()
    },
  }
}

/** Await the re-derive that `onRebuild` (the host's `reDerive`) triggered. */
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

// ===========================================================================
// §5.10 CENSUS / NUMERIC CLAIMS
// ===========================================================================
describe('census (§5.10)', () => {
  it('SidebarPanes is a class exposing the 12 methods + 2 subscription handlers', () => {
    expect(typeof SidebarPanes).toBe('function')
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    for (const m of [
      'constructor',
      'setCurrentDocumentId',
      'setCurrentNodeId',
      'registerPanes',
      'bindHandlers',
      'buildContext',
      'buildTemplateContext',
      'loadAppGraph',
      'mountOperator',
      'refresh',
      'boot',
      'reDerive',
      'onRagStoreChanged',
      'onTemplateChanged',
    ]) {
      expect(proto).toContain(m)
    }
  })

  it('registerPanes registers the 5 concrete panes (4 app-graph + 1 operator) and enables all five', () => {
    const h = makeHarness()
    h.host.registerPanes()
    expect(h.registry.list()).toHaveLength(5)
    const ids = h.registry.list().map((p) => p.id)
    expect(ids).toEqual(['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings'])
    expect(h.registry.listByScope('app-graph')).toHaveLength(4)
    expect(h.registry.listByScope('operator')).toHaveLength(1)
    for (const id of ids) expect(h.registry.isEnabled(id)).toBe(true)
  })

  it('bindHandlers registers the 5 app-graph handler defs; template-save is DROPPED (M15)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    for (const name of ['pane-doc-nav-select', 'pane-search-submit', 'template-zone-add', 'template-zone-remove', 'template-reset']) {
      expect(handlerDef(name)).toBeDefined()
    }
    // M15 — template-save is NOT registered (the app-graph handler-def census is 5, not 6).
    expect(handlerDef('template-save')).toBeUndefined()
  })

  it('the app-graph handler def bodies are function-strings (M2 — the host injects the bodies)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    for (const name of ['pane-doc-nav-select', 'pane-search-submit', 'template-zone-add', 'template-zone-remove', 'template-reset']) {
      const def = handlerDef(name)
      expect(def).toBeDefined()
      expect(typeof def!.body).toBe('string')
    }
  })

  it('the demoEnvelope() bootstrap is replaced — the host loads the pane-inclusive envelope, not the demo', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    const html = h.runtime.renderedHtmlResult().renderedHtml
    // The RAG content renders (not the demo counter/echo).
    expect(html).toContain('Doc A')
    expect(html).not.toContain('demo')
  })
})

// ===========================================================================
// registerPanes — §5.8.1 happy + §5.9.2 fail-state
// ===========================================================================
describe('registerPanes (§5.8.1)', () => {
  it('registers the five panes + enables the four app-graph panes + the settings pane', () => {
    const h = makeHarness()
    h.host.registerPanes()
    expect(h.registry.list()).toHaveLength(5)
    for (const id of ['doc-nav', 'crosslinks', 'search', 'template-editor', 'settings']) {
      expect(h.registry.isEnabled(id)).toBe(true)
    }
  })

  it('§5.9.2 — a duplicate id → the registry throws Error("pane registry: duplicate id \\"X\\"")', () => {
    const h = makeHarness()
    h.host.registerPanes()
    // Re-registering the same id (the host's own registerPanes) throws.
    expect(() => h.host.registerPanes()).toThrow('pane registry: duplicate id "doc-nav"')
  })
})

// ===========================================================================
// buildContext + buildTemplateContext — §5.8.2/3 + M7/M8/M12
// ===========================================================================
describe('buildContext (§5.8.2, M7)', () => {
  it('returns a PaneContext carrying the snapshot, currentDocumentId, currentNodeId, backRefs, and crosslinks', async () => {
    const snapshot = validSnapshot()
    const h = makeHarness({ snapshot })
    // The snapshot is populated by boot (M7 — `lastSnapshot` is set by the
    // boot/re-derive).
    await h.host.boot(h.runtime)
    h.host.setCurrentDocumentId('doc-a')
    h.host.setCurrentNodeId('n1')
    h.backRefs.set('n1', ['node-1'])
    const ctx = h.host.buildContext()
    expect(ctx.snapshot).toEqual(snapshot)
    expect(ctx.currentDocumentId).toBe('doc-a')
    expect(ctx.currentNodeId).toBe('n1')
    expect(ctx.backRefs).toBe(h.backRefs)
    expect(Array.isArray(ctx.crosslinks)).toBe(true)
  })
})

describe('buildTemplateContext (§5.8.3, M8/M12)', () => {
  it('returns a TemplatePaneContext carrying the stored template + the host-pinned targetedZones', async () => {
    const h = makeHarness({ template: { source: 'custom', template: customTemplate() } })
    // The stored template is fetched + populated by boot (M8).
    await h.host.boot(h.runtime)
    const ctx = h.host.buildTemplateContext()
    expect(ctx.template).toEqual(customTemplate())
    // M8 — targetedZones is the host-side constant/default ['main'], NOT fetched
    // from the bridge (bridge.template.get() returns { source, template } only).
    expect(ctx.targetedZones).toEqual(['main'])
  })

  it('is assignable to PaneContext (the SINGLE assembly ctx for all four app-graph panes — M12)', () => {
    const h = makeHarness()
    const ctx: PaneContext = h.host.buildTemplateContext()
    expect(ctx).toBeDefined()
  })
})

// ===========================================================================
// loadAppGraph — §5.8.4 happy + §5.9.4 fail-state + M14
// ===========================================================================
describe('loadAppGraph (§5.8.4, M14)', () => {
  it('assembles the pane-inclusive envelope, loads it into the app Runtime, and returns the AppGraphAssemblyResult with paneIds', () => {
    const h = makeHarness()
    h.host.registerPanes()
    const result = h.host.loadAppGraph(h.runtime, traversalEnvelope())
    expect(result.paneIds).toEqual(['doc-nav', 'crosslinks', 'search', 'template-editor'])
    // The pane-inclusive envelope is loaded into the app Runtime.
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html).toContain('Doc A')
    expect(html).toContain('pane-doc-nav')
  })

  it('§5.8.24/M14 — recomputes the backRefs from the ASSEMBLED envelope (the node ids the loaded graph mints)', () => {
    const h = makeHarness()
    h.host.registerPanes()
    h.host.loadAppGraph(h.runtime, traversalEnvelope())
    // The backRefs map (the edit controller's map) is repopulated from the
    // assembled envelope's translate — the RAG node id resolves.
    expect(h.backRefs.has('head-a')).toBe(true)
    expect(h.backRefs.get('head-a')!.length).toBeGreaterThan(0)
  })

  it('§5.9.4 — a null traversalEnvelope → the assembleAppGraphEnvelope guard throws', () => {
    const h = makeHarness()
    h.host.registerPanes()
    expect(() => h.host.loadAppGraph(h.runtime, null as never)).toThrow(
      'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required',
    )
  })

  it('§5.9.4 — a null runtime → the assembleAppGraphEnvelope guard throws', () => {
    const h = makeHarness()
    h.host.registerPanes()
    expect(() => h.host.loadAppGraph(null as never, traversalEnvelope())).toThrow(
      'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required',
    )
  })
})

// ===========================================================================
// mountOperator — §5.8.5 happy + §5.9.5/6 fail-states + M3
// ===========================================================================
describe('mountOperator (§5.8.5, M3)', () => {
  it('renders the settings pane in its isolated GraphScope → the operator mount shows the settings; the app Runtime does NOT include it', () => {
    const h = makeHarness()
    h.host.registerPanes()
    h.host.mountOperator()
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('operator-pane-settings')
    // The app Runtime (the agent-visible graph) does NOT include the settings.
    const appHtml = h.runtime.renderedHtmlResult().renderedHtml
    expect(appHtml).not.toContain('operator-pane-settings')
  })

  it('§5.8.28/M3 — the settings pane mounts in the operator mount (#operator-panes), NOT the app mount (#app)', () => {
    const h = makeHarness()
    h.host.registerPanes()
    h.host.mountOperator()
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    const appHtml = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('operator-pane-settings')
    expect(appHtml).not.toContain('operator-pane-settings')
  })

  it('§5.9.6 — an operator pane whose render returns nothing → buildOperatorEnvelope throws', () => {
    const h = makeHarness()
    h.host.registerPanes()
    // Add a second operator pane whose render returns nothing.
    h.registry.register({
      id: 'bad-op',
      title: 'Bad',
      scope: 'operator',
      render: () => null as never,
    })
    h.registry.enable('bad-op')
    expect(() => h.host.mountOperator()).toThrow(
      'buildOperatorEnvelope: operator pane "bad-op" render returned nothing',
    )
  })
})

// ===========================================================================
// refresh — §5.8.6 happy + M17
// ===========================================================================
describe('refresh (§5.8.6, M17)', () => {
  it('re-fetches the pane data (backlinks when currentNodeId is set + operator settings) and re-renders; NEVER re-runs a RAG re-traversal', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.host.setCurrentNodeId('n1')
    h.bridge.rag.snapshot.mockClear()
    await h.host.refresh()
    // The crosslinks backlink enumeration is re-fetched for the current node.
    expect(h.bridge.rag.backlinks).toHaveBeenCalledWith('n1')
    // The operator settings are re-fetched.
    expect(h.bridge.operatorSettings.get).toHaveBeenCalled()
    // M17 — refresh NEVER re-runs a RAG re-traversal (no snapshot fetch).
    expect(h.bridge.rag.snapshot).not.toHaveBeenCalled()
  })

  it('with a null currentNodeId the backlink enumeration is skipped (no rag-backlinks IPC)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.backlinks.mockClear()
    await h.host.refresh()
    expect(h.bridge.rag.backlinks).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// boot — §5.8.7 happy + §5.9.1/7 fail-states
// ===========================================================================
describe('boot (§5.8.7)', () => {
  it('runs the full boot sequence: registers+enables panes, binds handlers, fetches snapshot+template, loads the pane-inclusive envelope, mounts the operator, subscribes to the re-derive triggers', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    // registerPanes + bindHandlers ran.
    expect(h.registry.list()).toHaveLength(5)
    expect(handlerDef('pane-search-submit')).toBeDefined()
    // snapshot + template fetched.
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    expect(h.bridge.template.get).toHaveBeenCalled()
    // The pane-inclusive envelope is loaded into the app Runtime.
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html).toContain('Doc A')
    expect(html).toContain('pane-doc-nav')
    // The operator settings pane is mounted.
    expect((h.operatorMount as unknown as { innerHTML: string }).innerHTML).toContain('operator-pane-settings')
    // The re-derive triggers are subscribed.
    expect(h.bridge.edit.onRagStoreChanged).toHaveBeenCalled()
    expect(h.bridge.template.onTemplateChanged).toHaveBeenCalled()
  })

  it('§5.9.1 — a null/undefined runtime → throws Error("SidebarPanes.boot: runtime required")', async () => {
    const h = makeHarness()
    await expect(h.host.boot(null as never)).rejects.toThrow('SidebarPanes.boot: runtime required')
    await expect(h.host.boot(undefined as never)).rejects.toThrow('SidebarPanes.boot: runtime required')
  })

  it('§5.9.7 — a bridge error during the snapshot fetch ABORTS the boot (the placeholder envelope stays rendered; caught + logged, never a crash)', async () => {
    const h = makeHarness()
    h.bridge.rag.snapshot.mockRejectedValueOnce(new Error('snapshot boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
      // The placeholder envelope stays rendered (no panes, no RAG content).
      const html = h.runtime.renderedHtmlResult().renderedHtml
      expect(html).not.toContain('pane-doc-nav')
      expect(html).not.toContain('Doc A')
    } finally {
      errSpy.mockRestore()
    }
  })

  it('§5.9.7 — a bridge error during the template fetch ABORTS the boot (caught + logged, never a crash)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    h.bridge.template.get.mockRejectedValueOnce(new Error('template boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    } finally {
      errSpy.mockRestore()
    }
  })
})

// ===========================================================================
// reDerive — §5.8.8/9 happy + §5.9.8/17 fail-states + M11/S19
// ===========================================================================
describe('reDerive (§5.8.8)', () => {
  it('fetches the snapshot, re-traverses, re-assembles, re-loads the pane-inclusive envelope; the backRefs map is repopulated', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.snapshot.mockClear()
    h.backRefs.clear()
    await h.host.reDerive()
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    // The backRefs map is repopulated from the assembled envelope (M14).
    expect(h.backRefs.has('head-a')).toBe(true)
    // The app-graph panes stay rendered (the pane-inclusive envelope re-loaded).
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')
  })

  it('§5.8.9 — a template-changed re-derive uses the payload template (no follow-up fetch)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.template.get.mockClear()
    h.host.onTemplateChanged({ source: 'custom', template: customTemplate() })
    await awaitRebuild(h)
    // No follow-up template fetch (the payload carries the template).
    expect(h.bridge.template.get).not.toHaveBeenCalled()
    // The stored template is updated.
    expect(h.host.buildTemplateContext().template).toEqual(customTemplate())
  })

  it('§5.9.8 — a bridge error during the re-derive snapshot fetch ABORTS the re-derive (the current graph stays rendered; caught + logged)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.snapshot.mockRejectedValueOnce(new Error('snapshot boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      // The current graph stays rendered.
      expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')
    } finally {
      errSpy.mockRestore()
    }
  })

  it('§5.8.22/§5.9.17/M11/S19 — a re-derive that arrives while one is in flight is COALESCED (no second concurrent buildTraversal); the queued re-derive runs once after', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    // Defer the first snapshot fetch so the first re-derive stays in flight.
    let resolveSnapshot!: (v: RagSnapshotPayload) => void
    const deferred = new Promise<RagSnapshotPayload>((res) => { resolveSnapshot = res })
    h.bridge.rag.snapshot.mockReturnValueOnce(deferred)
    h.bridge.rag.snapshot.mockClear()
    const p1 = h.host.reDerive()
    const p2 = h.host.reDerive() // coalesced — must NOT start a second fetch
    expect(h.bridge.rag.snapshot).toHaveBeenCalledTimes(1)
    resolveSnapshot(validSnapshot())
    await p1
    await p2
    // The queued re-derive runs once after the in-flight one completes (the
    // latest snapshot wins).
    expect(h.bridge.rag.snapshot).toHaveBeenCalledTimes(2)
  })
})

// ===========================================================================
// The dirty-edit guard integration — §5.8.10 + §5.9.14
// ===========================================================================
describe('the dirty-edit guard integration (§5.8.10, §5.9.14)', () => {
  it('a re-derive request while a control is dirty is QUEUED (hasQueuedRebuild true, onRebuild NOT called); clearing the dirty flag executes the queued re-derive', () => {
    const h = makeHarness()
    h.editController.markDirty('n1')
    h.editController.requestRebuild()
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    h.editController.clearDirty('n1')
    expect(h.onRebuild).toHaveBeenCalledTimes(1)
    expect(h.editController.hasQueuedRebuild()).toBe(false)
  })

  it('§5.9.14 — a template-changed while a template-editor control is dirty QUEUES the re-derive behind the commit', () => {
    const h = makeHarness()
    h.editController.markDirty('template-editor')
    h.host.onTemplateChanged({ source: 'custom', template: customTemplate() })
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    h.editController.clearDirty('template-editor')
    expect(h.onRebuild).toHaveBeenCalledTimes(1)
  })
})

// ===========================================================================
// The window.provident.sidebar bridge surface — §5.8.11-15 + M2/M5/M6/M10/M16
// ===========================================================================
describe('window.provident.sidebar.selectDocument (§5.8.11, M5/M6)', () => {
  it('sets the currentDocumentId + triggers a document-switch re-traversal (the single-document view)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('doc-a')
    // M5 — the host-owned currentDocumentId is set.
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    // A document-switch re-traversal is triggered (via requestRebuild → reDerive).
    expect(h.onRebuild).toHaveBeenCalled()
  })
})

describe('window.provident.sidebar.submitQuery (§5.8.12/13, M10/M13)', () => {
  it('§5.8.12 — a non-empty query with the rag group ON → bridge.rag.query(value) (topK default 5) → the result is stored + the search pane re-renders', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      security: { token: null, enabled: ['read', 'dispatch', 'rag'] },
      queryResult: { query: 'foo', ranked: [{ nodeId: 'n1', score: 0.9 }], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 },
    })
    await h.host.boot(h.runtime)
    h.sidebar.submitQuery('foo')
    expect(h.bridge.rag.query).toHaveBeenCalledWith('foo', 5)
    // M10 — the search pane re-renders (re-assemble + loadEnvelope) with the results.
    await vi.waitFor(() => expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('n1'))
  })

  it('§5.8.13 — an empty query → the handler does nothing (no IPC)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch', 'rag'] } })
    await h.host.boot(h.runtime)
    h.sidebar.submitQuery('')
    expect(h.bridge.rag.query).not.toHaveBeenCalled()
  })

  it('§5.9.15/M13 — a submit while the rag group is OFF FAILS CLOSED (no IPC, no state change, no throw)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch'] } })
    await h.host.boot(h.runtime)
    expect(() => h.sidebar.submitQuery('foo')).not.toThrow()
    expect(h.bridge.rag.query).not.toHaveBeenCalled()
  })
})

describe('window.provident.sidebar.templateAdd/templateRemove/templateReset (§5.8.14/15, M16)', () => {
  it('§5.8.14 — template-zone-add: markDirty() → code group ON → bridge.template.create(zone) → on success commit() (clears the dirty flag)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch', 'code'] } })
    await h.host.boot(h.runtime)
    const markDirty = vi.spyOn(h.editController, 'markDirty')
    const clearDirty = vi.spyOn(h.editController, 'clearDirty')
    h.sidebar.templateAdd('aside')
    // M16 — markDirty() is called before the IPC.
    expect(markDirty).toHaveBeenCalled()
    expect(h.bridge.template.create).toHaveBeenCalledWith('aside')
    // On success the dirty flag is cleared (commit) after the IPC resolves.
    await vi.waitFor(() => expect(clearDirty).toHaveBeenCalled())
  })

  it('§5.8.15 — template-reset: markDirty() → code group ON → bridge.template.reset() → on success commit()', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch', 'code'] } })
    await h.host.boot(h.runtime)
    const markDirty = vi.spyOn(h.editController, 'markDirty')
    const clearDirty = vi.spyOn(h.editController, 'clearDirty')
    h.sidebar.templateReset()
    expect(markDirty).toHaveBeenCalled()
    expect(h.bridge.template.reset).toHaveBeenCalled()
    await vi.waitFor(() => expect(clearDirty).toHaveBeenCalled())
  })

  it('template-zone-remove: markDirty() → code group ON → bridge.template.delete(zone) → on success commit()', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch', 'code'] } })
    await h.host.boot(h.runtime)
    const markDirty = vi.spyOn(h.editController, 'markDirty')
    const clearDirty = vi.spyOn(h.editController, 'clearDirty')
    h.sidebar.templateRemove('aside')
    expect(markDirty).toHaveBeenCalled()
    expect(h.bridge.template.delete).toHaveBeenCalledWith('aside')
    await vi.waitFor(() => expect(clearDirty).toHaveBeenCalled())
  })

  it('§5.9.16/M13 — a template-zone-add while the code group is OFF FAILS CLOSED (no IPC, no state change, no throw)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch'] } })
    await h.host.boot(h.runtime)
    expect(() => h.sidebar.templateAdd('aside')).not.toThrow()
    expect(h.bridge.template.create).not.toHaveBeenCalled()
  })

  it('§5.9.16/M13 — a template-reset while the code group is OFF FAILS CLOSED (no IPC)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch'] } })
    await h.host.boot(h.runtime)
    expect(() => h.sidebar.templateReset()).not.toThrow()
    expect(h.bridge.template.reset).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// The operator-settings IPC surface — §5.8.27 + M9
// ===========================================================================
describe('the operator-settings IPC surface (§5.8.27, M9)', () => {
  it('bridge.operatorSettings.get() returns the current OperatorSettings; the settings pane render reads lastOperatorSettings', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), operatorSettings: { enabledPanes: ['doc-nav'], defaultDocumentId: null, topK: 5 } })
    await h.host.boot(h.runtime)
    const settings = await h.bridge.operatorSettings.get()
    expect(settings).toEqual({ enabledPanes: ['doc-nav'], defaultDocumentId: null, topK: 5 })
    // The settings pane renders in the operator mount (its render reads lastOperatorSettings).
    expect((h.operatorMount as unknown as { innerHTML: string }).innerHTML).toContain('operator-pane-settings')
  })

  it('a settings control commit via operatorSet(patch) → bridge.operatorSettings.set → lastOperatorSettings updates + the operator scope re-renders', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5 } })
    await h.host.boot(h.runtime)
    const before = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    h.sidebar.operatorSet({ topK: 10 })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ topK: 10 })
    // The operator scope re-renders (the settings pane data stays fresh via
    // lastOperatorSettings + a re-render, NOT a RAG re-traversal — M17).
    await vi.waitFor(() => {
      const after = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
      expect(after).not.toBe(before)
    })
  })
})

// ===========================================================================
// The empty-snapshot guard — §5.8.21 + §5.9.18 + M1
// ===========================================================================
describe('the empty-snapshot guard (§5.8.21, §5.9.18, M1)', () => {
  it('an empty snapshot → documentIds empty → buildTraversal is SKIPPED (no throw); the empty-store envelope is assembled + loaded; backRefs empty; the panes stay rendered', async () => {
    const h = makeHarness({ snapshot: emptySnapshot() })
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    // The empty-store envelope is loaded (the panes still render).
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')
    // The backRefs map is empty.
    expect(h.backRefs.size).toBe(0)
  })

  it('§5.9.18 — a buildTraversal throw on an empty documentIds does NOT occur (the empty-snapshot guard skips buildTraversal)', async () => {
    const h = makeHarness({ snapshot: emptySnapshot() })
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    await expect(h.host.reDerive()).resolves.toBeUndefined()
  })
})

// ===========================================================================
// The current-document documentIds — §5.8.29 + M6
// ===========================================================================
describe('the current-document documentIds (§5.8.29, M6)', () => {
  it('with currentDocumentId set, a re-derive uses documentIds = [<root id>] (single-document view)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.host.setCurrentDocumentId('doc-a')
    h.bridge.rag.snapshot.mockClear()
    await h.host.reDerive()
    // The single-document view re-derives with documentIds = ['doc-a'].
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
  })

  it('with currentDocumentId null, a re-derive derives all doc-head targets', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.host.setCurrentDocumentId(null)
    h.bridge.rag.snapshot.mockClear()
    await h.host.reDerive()
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
  })
})

// ===========================================================================
// The handler gate fail-closed — §5.8.23 + M13
// ===========================================================================
describe('the handler gate fail-closed (§5.8.23, M13)', () => {
  it('a pane-search-submit dispatch while the rag group is OFF → NO bridge.rag.query IPC', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch'] } })
    await h.host.boot(h.runtime)
    h.sidebar.submitQuery('foo')
    expect(h.bridge.rag.query).not.toHaveBeenCalled()
  })

  it('a template-zone-add dispatch while the code group is OFF → NO bridge.template.create IPC', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch'] } })
    await h.host.boot(h.runtime)
    h.sidebar.templateAdd('aside')
    expect(h.bridge.template.create).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// The M4 registerHandlerDef throw surface — §5.9.3
// ===========================================================================
describe('the M4 registerHandlerDef throw surface (§5.9.3)', () => {
  it('registerHandlerDef does NOT throw on a non-string body (it stores the def); the throw surfaces at COMPILE', () => {
    // M4 — the def is STORED (no throw at registration).
    expect(() => registerHandlerDef('m4-nonstring', { name: 'm4-nonstring', body: 42 as never })).not.toThrow()
    const def = handlerDef('m4-nonstring')
    expect(def).toBeDefined()
    expect((def as { body: unknown }).body).toBe(42)
  })
})

// ===========================================================================
// The §5.9 fail-states 12-13 (the IPC fail-states the panes surface)
// ===========================================================================
describe('the IPC fail-states the panes surface (§5.9.12/13)', () => {
  it('§5.9.12 — a rag-backlinks IPC with a null store throws "rag.backlinks: no rag store configured" (the crosslinks pane surfaces it as an empty enumeration, never a crash)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.backlinks.mockRejectedValueOnce(new Error('rag.backlinks: no rag store configured'))
    // refresh catches the bridge error (the last-known pane state is kept).
    await expect(h.host.refresh()).resolves.toBeUndefined()
  })

  it('§5.9.13 — a rag-query IPC with an empty query throws "rag.query: query must be a non-empty string" (the search pane submit handler does NOT send the IPC for an empty query)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), security: { token: null, enabled: ['read', 'dispatch', 'rag'] } })
    await h.host.boot(h.runtime)
    h.sidebar.submitQuery('')
    expect(h.bridge.rag.query).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// Renderer-dependent (§5.8 16-20, §5.9 10-11) — documented, NOT runnable in
// node. These are the MCP-visible equivalence (get_rendered_html/markdown/
// list_targets/dispatch), the operator isolation, and the DOM dispatch path.
// They are verified by code review / the e2e battery; the node-testable host
// contract above is the pinned surface.
// ===========================================================================
describe.skip('renderer-dependent (verified by code review — not node-testable)', () => {
  it.skip('§5.8 16 — after boot, the pane-inclusive envelope is in the app Runtime → get_rendered_html/markdown/list_targets/dispatch see the panes', () => {})
  it.skip('§5.8 17 — after mountOperator, the settings pane renders in its isolated GraphScope → list_targets/rendered/markdown never include it; dispatch throws unresolved target', () => {})
  it.skip('§5.8 18 — after a rag-store-changed re-derive (re-loading the pane-inclusive envelope), the app-graph panes stay MCP-visible with re-materialized data-* payloads', () => {})
  it.skip('§5.8 19 — after a template-changed re-derive, the app-graph panes (including the template-editor pane) stay MCP-visible with the new template', () => {})
  it.skip('§5.8 20 — the four app-graph panes bind NO RAG edit control (read-only); the settings pane edits commit via the IPC bridge; the template-editor edits commit via the template IPC', () => {})
  it.skip('§5.9 10 — dispatch on a settings pane node throws unresolved target (fail-closed)', () => {})
  it.skip('§5.9 11 — get_node_state on a settings pane node throws unresolved target (fail-closed)', () => {})
})
