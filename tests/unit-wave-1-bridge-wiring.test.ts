// tests/unit-wave-1-bridge-wiring.test.ts — Wave-1 BRIDGE-WIRING follow-ups
// (docs/specs/wave-1-open-decisions.md §E): W1-N5 (template Validate host hook),
// W1-N6 (module-tool runner production wiring), W1-N7 (preload `docNavToggle`),
// W1-N9 (advanced-search args end-to-end).
//
// This is the TestWriter RED set. The behavior does NOT exist yet:
//   - W1-N5: `SidebarPanes.buildTemplateContext()` has no `validation` verdict
//     and `installSidebarBridge` exposes no `templateValidateResult`; the preload
//     `sidebar`/`installSidebar` do not forward it either.
//   - W1-N6: preload `module` has no `listTools`/`invoke`; no
//     `IPC_MODULE_TOOL_LIST` / `IPC_MODULE_TOOL_INVOKE` channels in
//     `shared/types.ts`; `renderer.ts` constructs `SecurePanels` with no runner.
//   - W1-N7: preload `sidebar`/`installSidebar` do not forward `docNavToggle`.
//   - W1-N9: `RagQueryPayload` has no `mode/maxHops/expand/maxParentContext/
//     filters`; the preload `rag.query(q, topK?, store?)` has no 4th `options`
//     param; `handleRagQueryIpc` forwards only `query/topK/store/stores`.
//
// The preload surfaces are exercised through the electron-mock harness (the
// template-adversarial/unit-u5 pattern); `handleRagQueryIpc` and the host seam
// are node-testable directly.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { handleRagQueryIpc } from '../src/main/mcp-server.js'

// ---- electron mock (hoisted BEFORE the preload import) ----------------------
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
import * as types from '../src/shared/types.js'
import '../src/main/preload.js'

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld. */
function capturedBridge(): any {
  return exposeInMainWorldMock.mock.calls[0]?.[1]
}

beforeEach(() => {
  invokeMock.mockReset()
})

// ===========================================================================
// W1-N5 — the template Validate host hook (SidebarPanes + preload)
// ===========================================================================
describe('W1-N5 — template Validate host hook', () => {
  function makeHostBridge(): Record<string, unknown> {
    return {
      security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'code'] }) },
      edit: {
        commit: async () => ({ ok: true, nodeId: 'x' }),
        commitRich: async () => ({ ok: true, nodeId: 'x', node: {} }),
        onRagStoreChanged: () => () => {},
      },
      rag: {
        query: async () => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5, store: 'main' }),
        snapshot: async () => ({ store: 'main', nodes: [], edges: [] }),
        backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
        docHeads: async () => ({ documents: [] }),
        stores: async () => ({ stores: [] }),
      },
      template: {
        get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        create: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        delete: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        reset: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
        onTemplateChanged: () => () => {},
      },
      operatorSettings: {
        get: async () => ({ enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable', theme: 'system' }),
        set: async (p: Record<string, unknown>) => ({ enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable', theme: 'system', ...p }),
        onChanged: () => () => {},
      },
    }
  }

  it('host: installSidebarBridge exposes templateValidateResult; the verdict lands in buildTemplateContext().validation + drives a re-derive', () => {
    installShim()
    const mount = mountEl() as never
    const operatorMount = mountEl() as never
    const registry = createPaneRegistry()
    const backRefs = new Map<string, string[]>()
    const onRebuild = vi.fn()
    const editController = createEditController({
      backRefs,
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild,
    })
    const host = new SidebarPanes({
      mount,
      operatorMount,
      registry,
      bridge: makeHostBridge() as never,
      backRefs,
      editController,
    })
    host.registerPanes()
    ;(globalThis as unknown as { window?: unknown }).window = { provident: {} }
    ;(host as unknown as { installSidebarBridge(): void }).installSidebarBridge()
    const sidebar = (globalThis as unknown as { window: { provident: { sidebar: Record<string, unknown> } } }).window.provident.sidebar
    expect(typeof sidebar.templateValidateResult).toBe('function')

    ;(sidebar.templateValidateResult as (v: unknown) => void)({ ok: true })
    expect(host.buildTemplateContext().validation).toEqual({ ok: true })
    expect(onRebuild).toHaveBeenCalled()

    const rendered = registry.get('template-editor')!.render(host.buildTemplateContext())
    expect(JSON.stringify(rendered)).toContain('template-validation')
  })

  it('preload: sidebar.templateValidateResult is exposed + delegates through installSidebar', () => {
    const bridge = capturedBridge()
    expect(typeof bridge.sidebar.templateValidateResult).toBe('function')
    const seen: unknown[] = []
    bridge.installSidebar({ templateValidateResult: (v: unknown) => seen.push(v) } as never)
    bridge.sidebar.templateValidateResult({ ok: false, reason: 'missing-zone', detail: 'x' })
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ ok: false, reason: 'missing-zone' })
  })
})

// ===========================================================================
// W1-N6 — module-tool runner production wiring (preload + channels)
// ===========================================================================
describe('W1-N6 — module-tool runner bridge/preload wiring', () => {
  it('shared/types exports the module tool list + invoke channels', () => {
    expect(types.IPC_MODULE_TOOL_LIST).toBe('provident:module:tools-list')
    expect(types.IPC_MODULE_TOOL_INVOKE).toBe('provident:module:tools-invoke')
  })

  it('preload module.listTools() invokes the list channel', () => {
    const bridge = capturedBridge()
    expect(typeof bridge.module.listTools).toBe('function')
    bridge.module.listTools()
    expect(invokeMock).toHaveBeenCalledWith(types.IPC_MODULE_TOOL_LIST)
  })

  it('preload module.invoke(tool, args) invokes the invoke channel with ModuleToolInvokePayload { tool, args }', () => {
    const bridge = capturedBridge()
    expect(typeof bridge.module.invoke).toBe('function')
    bridge.module.invoke('module:capture.screenshot', { id: 7 })
    expect(invokeMock).toHaveBeenCalledWith(types.IPC_MODULE_TOOL_INVOKE, {
      tool: 'module:capture.screenshot',
      args: { id: 7 },
    })
  })
})

// ===========================================================================
// W1-N7 — preload docNavToggle
// ===========================================================================
describe('W1-N7 — preload sidebar.docNavToggle', () => {
  it('sidebar.docNavToggle is exposed + delegates through installSidebar', () => {
    const bridge = capturedBridge()
    expect(typeof bridge.sidebar.docNavToggle).toBe('function')
    const keys: string[] = []
    bridge.installSidebar({ docNavToggle: (k: string) => keys.push(k) } as never)
    bridge.sidebar.docNavToggle('["a"]')
    expect(keys).toEqual(['["a"]'])
  })
})

// ===========================================================================
// W1-N9 — advanced-search args end-to-end (payload + preload + IPC forward)
// ===========================================================================
describe('W1-N9 — advanced-search args', () => {
  it('preload rag.query forwards the advanced options into the RagQueryPayload', () => {
    const bridge = capturedBridge()
    bridge.rag.query('hello', 5, 'store-x', {
      mode: 'graph',
      maxHops: 4,
      expand: 'parent',
      maxParentContext: 7,
      filters: { nodeKind: 'fact' },
      stores: 'all',
    })
    expect(invokeMock).toHaveBeenCalledWith(types.IPC_RAG_QUERY, {
      query: 'hello',
      topK: 5,
      store: 'store-x',
      mode: 'graph',
      maxHops: 4,
      expand: 'parent',
      maxParentContext: 7,
      filters: { nodeKind: 'fact' },
      stores: 'all',
    })
  })

  it('preload rag.query omits absent options (byte-equal default payload)', () => {
    const bridge = capturedBridge()
    bridge.rag.query('hello')
    expect(invokeMock).toHaveBeenCalledWith(types.IPC_RAG_QUERY, { query: 'hello' })
  })

  it('handleRagQueryIpc forwards mode/maxHops/expand/maxParentContext/filters to the engine', async () => {
    const engine = {
      query: vi.fn(async () => ({
        query: 'hello',
        results: [],
        ranked: [],
        context: [],
        markdown: '',
        lineMap: { ranges: [] },
        k: 2,
        citations: [],
        trace: [],
        engine: 'local',
      })),
      onStoreChanged: vi.fn(),
    }
    const store = {} as never
    await handleRagQueryIpc(engine as never, store, {
      query: 'hello',
      topK: 2,
      mode: 'graph',
      maxHops: 4,
      expand: 'parent',
      maxParentContext: 7,
      filters: { nodeKind: 'fact' },
    })
    expect(engine.query).toHaveBeenCalledWith('hello', {
      k: 2,
      mode: 'graph',
      maxHops: 4,
      expand: 'parent',
      maxParentContext: 7,
      filters: { nodeKind: 'fact' },
    })
  })
})

// ===========================================================================
// W1-N11 — preload forwards the C18/C19 + rich-editor sidebar seams
// ===========================================================================
describe('W1-N11 — preload sidebar forwards the C18/C19 + rich-editor seams', () => {
  const SEAMS = [
    'searchAdvancedToggle',
    'submitAdvancedQuery',
    'hoverPreviewEnter',
    'hoverPreviewLeave',
    'hoverPreviewPopupEnter',
    'hoverPreviewPopupLeave',
    'editorInput',
    'editorBlur',
    'editorCompositionStart',
    'editorCompositionEnd',
  ] as const

  it('exposes every seam + delegates the call through installSidebar', () => {
    const bridge = capturedBridge()
    const seen: Record<string, unknown[][]> = {}
    const methods: Record<string, (...args: unknown[]) => void> = {}
    for (const n of SEAMS) {
      methods[n] = (...args: unknown[]) => {
        ;(seen[n] ??= []).push(args)
      }
    }
    bridge.installSidebar(methods)
    for (const n of SEAMS) expect(typeof bridge.sidebar[n]).toBe('function')

    bridge.sidebar.searchAdvancedToggle()
    bridge.sidebar.submitAdvancedQuery('q', { mode: 'graph' })
    bridge.sidebar.hoverPreviewEnter('n1')
    bridge.sidebar.hoverPreviewLeave()
    bridge.sidebar.hoverPreviewPopupEnter()
    bridge.sidebar.hoverPreviewPopupLeave()
    bridge.sidebar.editorInput('r1')
    bridge.sidebar.editorBlur('r1', '<p>x</p>')
    bridge.sidebar.editorCompositionStart('r1')
    bridge.sidebar.editorCompositionEnd('r1')

    expect(seen.searchAdvancedToggle).toEqual([[]])
    expect(seen.submitAdvancedQuery).toEqual([['q', { mode: 'graph' }]])
    expect(seen.hoverPreviewEnter).toEqual([['n1']])
    expect(seen.hoverPreviewLeave).toEqual([[]])
    expect(seen.hoverPreviewPopupEnter).toEqual([[]])
    expect(seen.hoverPreviewPopupLeave).toEqual([[]])
    expect(seen.editorInput).toEqual([['r1']])
    expect(seen.editorBlur).toEqual([['r1', '<p>x</p>']])
    expect(seen.editorCompositionStart).toEqual([['r1']])
    expect(seen.editorCompositionEnd).toEqual([['r1']])
  })
})
