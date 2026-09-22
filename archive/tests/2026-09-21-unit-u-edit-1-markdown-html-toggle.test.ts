// tests/unit-u-edit-1-markdown-html-toggle.test.ts — Unit U-EDIT-1 (C8): the
// app-graph markdown/html editor-toolbar toggle
// (docs/specs/unit-u-edit-1-markdown-html-toggle.md §2/§3/§4; W1-Q6/Q7 RESOLVED).
//
// This is the TestWriter RED set. The changes do NOT exist yet:
//   - There is NO editor-toolbar control authored into the app graph (only the
//     OPERATOR-scoped settings button `operator-editing-mode-toggle` exists).
//   - There is NO `editor-toolbar-editing-mode-toggle` handler def; the app
//     Runtime cannot dispatch a toggle.
//   - `src/renderer/pane-graph.ts` has NO `editorToolbarContent` helper, and
//     `src/renderer/sidebar-panes.ts` has NO `applyEditorToolbar` splice.
//
// Contract pinned by the spec:
//   - Markdown ↔ `editingMode='textarea'`; HTML ↔ `editingMode='contenteditable'`.
//   - Placement = the central-stage editor toolbar (APP graph, MCP-visible):
//     the control is an app-graph node reachable by `provident.dispatch`.
//   - The control reflects the CURRENT mode (`data-mode`/label), and on click
//     FLIPS the mode, persists it through the existing operator-settings seam
//     (`window.provident.sidebar.operatorSet`), which drives the 'operator'
//     rebuild so the app graph re-applies the mode.
//   - No new MCP tool.
//
// F1/F2 guards: a missing/invalid `editingMode` is coerced (never throws); a
// toggle while a control is dirty is QUEUED (the dirty-edit guard).
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { handlerDef, compileHandlerBody } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// fixtures
// ===========================================================================
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

/** A valid one-document snapshot whose single section `s1` is an ELIGIBLE `p`
 *  root (so the contenteditable↔textarea swap is observable). */
function singleSectionSnapshot(): RagSnapshotPayload {
  return {
    store: 'main',
    nodes: [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s1', { type: 'p', content: 'hello' }),
    ],
    edges: [
      makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
    ],
  }
}

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

// ===========================================================================
// the mock bridge + the boot harness
// ===========================================================================
function makeBridge(opts: { snapshot?: RagSnapshotPayload; operatorSettings?: OperatorSettings } = {}) {
  const state = {
    snapshot: opts.snapshot ?? { store: 'main', nodes: [], edges: [] },
    operatorSettings: opts.operatorSettings ?? {
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'textarea' as EditingMode,
    },
  }
  const bridge = {
    security: {
      get: vi.fn(async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch'] })),
    },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 's1', node: {} })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 })),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [] })),
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
      get: vi.fn(async (): Promise<OperatorSettings> => ({ ...state.operatorSettings })),
      set: vi.fn(async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
      onChanged: vi.fn(() => () => {}),
    },
  }
  return { bridge, state }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  operatorMount: unknown
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  state: ReturnType<typeof makeBridge>['state']
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: { snapshot?: RagSnapshotPayload; operatorSettings?: OperatorSettings } = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, state } = makeBridge(opts)
  let host: SidebarPanes
  const onRebuild = vi.fn((kind?: unknown) => host.reDerive(kind as never))
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
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, operatorMount, registry, bridge, state, backRefs, editController, onRebuild }
}

afterEach(() => {
  vi.restoreAllMocks()
})

function appHtml(h: Harness): string {
  return h.runtime.renderedHtmlResult().renderedHtml
}

function operatorHtml(h: Harness): string {
  return (h.operatorMount as unknown as { innerHTML: string }).innerHTML
}

/** Await the re-derive that `onRebuild` (the host's `reDerive`) triggered. */
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

/** Fire the boot-captured operator-settings broadcast handler (the real flow:
// main stores the SET then broadcasts the store result). */
function fireSettingsBroadcast(h: Harness, settings: Partial<OperatorSettings> & { editingMode: EditingMode }): void {
  const handler = h.bridge.operatorSettings.onChanged.mock.calls[0]?.[0] as ((s: OperatorSettings) => void) | undefined
  if (!handler) throw new Error('boot did not subscribe to operatorSettings.onChanged')
  handler({ enabledPanes: [], defaultDocumentId: null, topK: 5, ...settings })
}

function priv(h: Harness): { editingMode: EditingMode; lastOperatorSettings: OperatorSettings | null } {
  return h.host as unknown as { editingMode: EditingMode; lastOperatorSettings: OperatorSettings | null }
}

/** The copy of the toolbar nodes in the app graph, located by propsId. */
function toolbarNodes(h: Harness): Array<{ propsId?: string; type: string; content?: unknown; handlers: Array<{ name?: string; event?: string }> }> {
  return h.runtime.listTargets().nodes.filter((n) => n.propsId === 'editor-toolbar' || n.propsId === 'editor-toolbar-toggle')
}

// ===========================================================================
// §2/§3 — the control is authored into the APP graph (MCP-visible)
// ===========================================================================
describe('editor toolbar — app-graph authoring (§2 placement, §3 state 4)', () => {
  it('boot with editingMode=textarea authors the toolbar + toggle into the app graph (rendered HTML)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    const html = appHtml(h)
    expect(html).toContain('id="editor-toolbar"')
    expect(html).toContain('id="editor-toolbar-toggle"')
  })

  it('the toolbar lives in the APP graph, NOT the operator isolated scope (MCP-visible §2)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    expect(appHtml(h)).toContain('editor-toolbar-toggle')
    expect(operatorHtml(h)).not.toContain('editor-toolbar-toggle')
  })

  it('list_targets exposes the toggle as a dispatchable app-graph node with the registered click handler (§3 state 4)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const toggle = h.runtime.listTargets().nodes.find((n) => n.propsId === 'editor-toolbar-toggle')
    expect(toggle).toBeDefined()
    expect(toggle!.inTree).toBe(true)
    expect(toggle!.handlers.some((x) => x.name === 'editor-toolbar-editing-mode-toggle' && x.event === 'click')).toBe(true)
  })

  it('the toolbar re-derives cleanly (exactly ONE toolbar/toggle after a mode rebuild — no accumulation)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    fireSettingsBroadcast(h, { editingMode: 'contenteditable' })
    await awaitRebuild(h)
    const count = (appHtml(h).match(/id="editor-toolbar-toggle"/g) ?? []).length
    expect(count).toBe(1)
    expect(toolbarNodes(h).filter((n) => n.propsId === 'editor-toolbar-toggle')).toHaveLength(1)
  })
})

// ===========================================================================
// §2 reflection — the control reflects the CURRENT mode
// ===========================================================================
describe('editor toolbar — mode reflection (§2 reflection, §3 states 1/3)', () => {
  it('editingMode=contenteditable → the toggle reflects HTML (data-mode + label)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' } })
    await h.host.boot(h.runtime)
    const html = appHtml(h)
    expect(html).toContain('data-mode="contenteditable"')
    expect(html).toContain('HTML')
  })

  it('editingMode=textarea → the toggle reflects Markdown (data-mode + label)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    const html = appHtml(h)
    expect(html).toContain('data-mode="textarea"')
    expect(html).toContain('Markdown')
  })
})

// ===========================================================================
// §2 effect — click flips + persists through the operator seam
// ===========================================================================
describe('editor toolbar — the toggle handler flips + persists (§2 effect, §3 state 2)', () => {
  /** Execute the registered toolbar handler body with a mock ctx + a mock
   *  window.provident.sidebar (the existing operator seam). */
  function runToggleBody(dataMode: unknown): { calls: OperatorSettingsPatch[] } {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('editor-toolbar-editing-mode-toggle')
    expect(def).toBeDefined()
    const calls: OperatorSettingsPatch[] = []
    const fakeWindow = { provident: { sidebar: { operatorSet: (p: OperatorSettingsPatch) => calls.push(p) } } }
    ;(globalThis as unknown as { window?: unknown }).window = fakeWindow
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown) => void
    fn({ node: { props: { 'data-mode': dataMode } } })
    return { calls }
  }

  it('the handler def is registered with a compileHandlerBody-compatible function-string body', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('editor-toolbar-editing-mode-toggle')
    expect(def).toBeDefined()
    expect(typeof def!.body).toBe('string')
    expect(() => compileHandlerBody(String(def!.body))).not.toThrow()
  })

  it('state 2 — data-mode=textarea (current) → operatorSet({ editingMode: "contenteditable" })', () => {
    expect(runToggleBody('textarea').calls).toEqual([{ editingMode: 'contenteditable' }])
  })

  it('state 3 — data-mode=contenteditable (current) → operatorSet({ editingMode: "textarea" })', () => {
    expect(runToggleBody('contenteditable').calls).toEqual([{ editingMode: 'textarea' }])
  })

  it('F1 — a missing/invalid data-mode is DROPPED (coerced at the boundary, never a write, never a throw)', () => {
    expect(runToggleBody('bogus').calls).toEqual([])
    expect(runToggleBody(undefined).calls).toEqual([])
    expect(runToggleBody(null).calls).toEqual([])
  })

  it('dispatch(editor-toolbar-toggle, click) routes through the existing operator seam (bridge.operatorSettings.set)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    await h.runtime.dispatch({ target: 'editor-toolbar-toggle', event: 'click' })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ editingMode: 'contenteditable' })
  })
})

// ===========================================================================
// §3 state 2/3 + F4 — end-to-end: broadcast → operator rebuild → mode swap
// ===========================================================================
describe('editor toolbar — end-to-end flip + re-render (§3 states 2/3/5, F4)', () => {
  it('state 2/5 — boot textarea, click → set(contenteditable) → broadcast → app graph re-applies contenteditable + the control is in sync', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    // Baseline: textarea mode exposes the textarea + the control reflects Markdown.
    expect(appHtml(h)).toContain('textarea-s1')
    expect(appHtml(h)).toContain('data-mode="textarea"')
    // Click the app-graph toggle (the handler routes to the operator seam).
    await h.runtime.dispatch({ target: 'editor-toolbar-toggle', event: 'click' })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ editingMode: 'contenteditable' })
    // main stores the SET then broadcasts the store result → host re-derives fresh.
    fireSettingsBroadcast(h, { editingMode: 'contenteditable' })
    await awaitRebuild(h)
    const html = appHtml(h)
    expect(html).not.toContain('textarea-s1') // contenteditable mode: the textarea is spliced away
    expect(html).toContain('contenteditable')
    expect(html).toContain('data-mode="contenteditable"') // control reflects the new mode
    // One source: the host setting + the control agree.
    expect(priv(h).editingMode).toBe('contenteditable')
    expect(priv(h).lastOperatorSettings?.editingMode).toBe('contenteditable')
  })

  it('state 3 — click again (contenteditable → textarea) restores the textarea + the control reflects Markdown', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' } })
    await h.host.boot(h.runtime)
    expect(appHtml(h)).not.toContain('textarea-s1')
    await h.runtime.dispatch({ target: 'editor-toolbar-toggle', event: 'click' })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ editingMode: 'textarea' })
    fireSettingsBroadcast(h, { editingMode: 'textarea' })
    await awaitRebuild(h)
    const html = appHtml(h)
    expect(html).toContain('textarea-s1')
    expect(html).toContain('data-mode="textarea"')
    expect(priv(h).editingMode).toBe('textarea')
  })

  it('F4 — the operator sets the mode elsewhere (a broadcast with no toolbar click): the control reflects it', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    expect(appHtml(h)).toContain('data-mode="textarea"')
    fireSettingsBroadcast(h, { editingMode: 'contenteditable' })
    await awaitRebuild(h)
    expect(appHtml(h)).toContain('data-mode="contenteditable"')
  })
})

// ===========================================================================
// §4 F1/F2 — fail-states
// ===========================================================================
describe('editor toolbar — fail-states (§4 F1/F2)', () => {
  it('F1 — an invalid persisted editingMode is coerced to contenteditable at boot (never throws); the control reflects the coerced mode', async () => {
    const h = makeHarness({
      snapshot: singleSectionSnapshot(),
      operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'bogus' as EditingMode },
    })
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    expect(priv(h).editingMode).toBe('contenteditable')
    expect(appHtml(h)).toContain('data-mode="contenteditable"')
  })

  it('F2 — a toggle while an edit is dirty is QUEUED (the dirty-edit guard); it runs once the dirty control clears', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.editController.markDirty('s1')
    fireSettingsBroadcast(h, { editingMode: 'contenteditable' })
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    h.editController.clearDirty('s1')
    expect(h.onRebuild).toHaveBeenCalledTimes(1)
  })
})
