// tests/unit-u-parity-c18-advanced-search.test.ts — Wave-1 Unit U-PARITY-C18:
// the advanced-search disclosure sub-pane (C18 / G4)
// (docs/specs/unit-u-parity-c18-advanced-search.md §3 states 1-7 + §4 F1-F3;
// wave-1-open-decisions W1-Q9 RESOLVED).
//
// This is the TestWriter RED set. The behavior does NOT exist yet:
//   - `searchContent` renders only an input + ranked `li`s — no disclosure, no
//     advanced fields, no result detail (citations/trace/blockedBy/results);
//   - there is NO advanced-search handler + NO bridge seam for the rag.query
//     args (mode/maxHops/expand/maxParentContext/filters/stores:'all');
//   - an invalid combo cannot surface an engine error in the pane.
//
// Contract pinned by the spec:
//   - a collapsed-by-default disclosure sub-pane inside the `search` pane whose
//     `on:click` toggle reveals the fields;
//   - the fields cover W1-Q9: mode/maxHops/expand/maxParentContext/filters
//     (nodeKind/edgeType/target/state)/stores:'all' + the C15
//     documentPathPrefix/tags when present;
//   - submitting routes the SAME payload as `rag.query` through the shared
//     `window.provident.sidebar.submitAdvancedQuery` seam (the SAME
//     `bridge.rag.query` the basic submit uses — MCP/UI equivalence);
//   - the result detail renders citations/trace/blockedBy/results;
//   - an invalid combo surfaces the engine error without a crash (F1);
//   - the C15-only controls are omitted when the fields are absent (F2);
//   - an empty result → the empty state (F3);
//   - an agent can drive the disclosure via `provident.dispatch` (state 7).
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { compileHandlerBody } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type {
  RagSnapshotPayload,
  RagDocHeadsPayload,
  RagQueryResult,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import {
  searchContent,
  ADVANCED_SEARCH_TOGGLE_HANDLER,
  ADVANCED_SEARCH_SUBMIT_HANDLER,
  ADVANCED_SEARCH_IDS,
} from '../src/renderer/pane-graph.js'

// ===========================================================================
// node-tree helpers
// ===========================================================================
interface AnyNode {
  type?: string
  content?: unknown
  props?: Record<string, unknown>
  css?: { classes?: string[] }
  handlers?: Array<{ name?: string; event?: string; body?: unknown }>
  children?: AnyNode[]
}

function walk(root: AnyNode): AnyNode[] {
  const out: AnyNode[] = []
  const stack: AnyNode[] = [root]
  while (stack.length > 0) {
    const n = stack.pop() as AnyNode
    out.push(n)
    const kids = n.children ?? []
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i])
  }
  return out
}

function byId(root: AnyNode, id: string): AnyNode | undefined {
  return walk(root).find((n) => n.props?.id === id)
}

function handlerNamed(root: AnyNode, name: string): AnyNode | undefined {
  return walk(root).find((n) => (n.handlers ?? []).some((h) => h.name === name && h.event === 'click'))
}

const ctx = {} as never

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// state 1 — collapsed by default; toggling reveals the fields
// ===========================================================================
describe('state 1 — disclosure sub-pane (collapsed by default)', () => {
  it('renders a toggle button (handler + is-clickable) with data-expanded="false" and no fields', () => {
    const content = searchContent(ctx, null) as unknown as AnyNode
    const toggle = byId(content, ADVANCED_SEARCH_IDS.toggle)
    expect(toggle).toBeDefined()
    expect(toggle!.props?.['data-expanded']).toBe('false')
    expect(toggle!.handlers?.some((h) => h.name === ADVANCED_SEARCH_TOGGLE_HANDLER && h.event === 'click')).toBe(true)
    expect(toggle!.css?.classes).toContain('is-clickable')
    expect(byId(content, ADVANCED_SEARCH_IDS.fields)).toBeUndefined()
  })

  it('expanded renders every W1-Q9 control + the submit control', () => {
    const content = searchContent(ctx, null, { expanded: true }) as unknown as AnyNode
    expect(byId(content, ADVANCED_SEARCH_IDS.fields)).toBeDefined()
    for (const id of [
      ADVANCED_SEARCH_IDS.mode,
      ADVANCED_SEARCH_IDS.maxHops,
      ADVANCED_SEARCH_IDS.expand,
      ADVANCED_SEARCH_IDS.maxParentContext,
      ADVANCED_SEARCH_IDS.nodeKind,
      ADVANCED_SEARCH_IDS.edgeType,
      ADVANCED_SEARCH_IDS.targetDocumentId,
      ADVANCED_SEARCH_IDS.targetNodeId,
      ADVANCED_SEARCH_IDS.state,
      ADVANCED_SEARCH_IDS.stores,
    ]) {
      expect(byId(content, id), `control #${id} must render`).toBeDefined()
    }
    const submit = byId(content, ADVANCED_SEARCH_IDS.submit)
    expect(submit).toBeDefined()
    expect(submit!.handlers?.some((h) => h.name === ADVANCED_SEARCH_SUBMIT_HANDLER && h.event === 'click')).toBe(true)
    expect(submit!.css?.classes).toContain('is-clickable')
    // The toggle now reflects the expanded state.
    expect(byId(content, ADVANCED_SEARCH_IDS.toggle)!.props?.['data-expanded']).toBe('true')
  })
})

// ===========================================================================
// F2 — the C15-only controls are omitted when the fields are absent
// ===========================================================================
describe('F2 — C15 fields absent → controls omitted', () => {
  it('documentPathPrefix/tags render only when documentFilters is true', () => {
    const without = searchContent(ctx, null, { expanded: true }) as unknown as AnyNode
    expect(byId(without, ADVANCED_SEARCH_IDS.documentPathPrefix)).toBeUndefined()
    expect(byId(without, ADVANCED_SEARCH_IDS.tags)).toBeUndefined()

    const withC15 = searchContent(ctx, null, { expanded: true, documentFilters: true }) as unknown as AnyNode
    expect(byId(withC15, ADVANCED_SEARCH_IDS.documentPathPrefix)).toBeDefined()
    expect(byId(withC15, ADVANCED_SEARCH_IDS.tags)).toBeDefined()
  })
})

// ===========================================================================
// state 5 — the result detail renders citations/trace/blockedBy/results
// ===========================================================================
describe('state 5 — result detail', () => {
  it('renders results + citations + trace + blockedBy from the extended result', () => {
    const result = {
      query: 'q',
      ranked: [],
      results: [{ documentId: 'd1', nodeId: 'n1', score: 0.7, snippet: 'hello' }],
      citations: [{ documentId: 'd1', nodeId: 'n1' }],
      trace: { mode: 'graph', engine: 'local', topK: 5, source: 'local' },
      blockedBy: [{ documentId: 'd2', nodeId: 'n2', state: 'STALE' }],
    } as unknown as never
    const content = searchContent(ctx, result) as unknown as AnyNode
    const all = walk(content)
    // results
    const resultLi = all.find((n) => n.props?.['data-document-id'] === 'd1' && n.props?.['data-node-id'] === 'n1' && String(n.content ?? '').includes('hello'))
    expect(resultLi).toBeDefined()
    // citations
    expect(byId(content, ADVANCED_SEARCH_IDS.citations)).toBeDefined()
    expect(walk(byId(content, ADVANCED_SEARCH_IDS.citations) ?? {}).some((n) => n.props?.['data-document-id'] === 'd1')).toBe(true)
    // trace
    const trace = byId(content, ADVANCED_SEARCH_IDS.trace)
    expect(trace).toBeDefined()
    expect(String(trace!.content ?? trace!.props?.['data-trace-mode'] ?? '')).toContain('graph')
    // blockedBy
    expect(byId(content, ADVANCED_SEARCH_IDS.blockedBy)).toBeDefined()
    expect(walk(byId(content, ADVANCED_SEARCH_IDS.blockedBy) ?? {}).some((n) => n.props?.['data-state'] === 'STALE')).toBe(true)
  })

  it('preserves the ranked-list render when only ranked is present', () => {
    const result = {
      query: 'q',
      ranked: [{ nodeId: 'n1', score: 0.9 }],
    } as unknown as never
    const content = searchContent(ctx, result) as unknown as AnyNode
    const topLis = (content.children ?? []).filter((c) => c.type === 'li')
    expect(topLis).toHaveLength(1)
    expect(topLis[0].props?.['data-node-id']).toBe('n1')
  })
})

// ===========================================================================
// F3 — empty result → empty state
// ===========================================================================
describe('F3 — empty result', () => {
  it('renders an explicit empty state when there are no results', () => {
    const content = searchContent(ctx, { query: 'q', ranked: [] } as unknown as never) as unknown as AnyNode
    const empty = walk(content).find((n) => n.props?.['data-empty'] === 'true')
    expect(empty).toBeDefined()
  })
})

// ===========================================================================
// F1 — an engine error surfaces in the pane, never a crash
// ===========================================================================
describe('F1 — engine error surfaced', () => {
  it('renders the error message from the render options', () => {
    const content = searchContent(ctx, null, { error: 'rag.query: filters malformed' }) as unknown as AnyNode
    const err = byId(content, ADVANCED_SEARCH_IDS.error)
    expect(err).toBeDefined()
    expect(String(err!.content ?? '')).toContain('rag.query: filters malformed')
  })
})

// ===========================================================================
// the submit handler body — builds the rag.query payload from the fields
// ===========================================================================
describe('advanced-search submit handler', () => {
  it('builds the full rag.query payload (mode/maxHops/expand/maxParentContext/filters/stores + C15)', () => {
    const content = searchContent(ctx, null, { expanded: true, documentFilters: true }) as unknown as AnyNode
    const submit = byId(content, ADVANCED_SEARCH_IDS.submit)!
    const handler = (submit.handlers ?? []).find((h) => h.name === ADVANCED_SEARCH_SUBMIT_HANDLER)!
    expect(typeof handler.body).toBe('string')
    expect(() => compileHandlerBody(String(handler.body))).not.toThrow()

    const captured: Array<[string, Record<string, unknown>]> = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: { sidebar: { submitAdvancedQuery: (q: string, o: Record<string, unknown>) => captured.push([q, o]) } },
    }
    const values: Record<string, string> = {
      'pane-search-input': 'hello',
      [ADVANCED_SEARCH_IDS.mode]: 'graph',
      [ADVANCED_SEARCH_IDS.maxHops]: '4',
      [ADVANCED_SEARCH_IDS.expand]: 'parent',
      [ADVANCED_SEARCH_IDS.maxParentContext]: '7',
      [ADVANCED_SEARCH_IDS.nodeKind]: 'fact',
      [ADVANCED_SEARCH_IDS.edgeType]: 'link',
      [ADVANCED_SEARCH_IDS.targetDocumentId]: 'doc-1',
      [ADVANCED_SEARCH_IDS.targetNodeId]: 'node-1',
      [ADVANCED_SEARCH_IDS.state]: 'FRESH',
      [ADVANCED_SEARCH_IDS.stores]: 'all',
      [ADVANCED_SEARCH_IDS.documentPathPrefix]: 'a/b',
      [ADVANCED_SEARCH_IDS.tags]: 'x, y',
    }
    ;(globalThis as unknown as { document?: unknown }).document = {
      getElementById: (id: string) => ({ value: values[id] ?? '' }),
    }
    const fn = compileHandlerBody(String(handler.body)) as (c: unknown) => void
    fn({ node: { props: {} } })

    expect(captured).toHaveLength(1)
    const [q, opts] = captured[0]
    expect(q).toBe('hello')
    expect(opts.mode).toBe('graph')
    expect(opts.maxHops).toBe(4)
    expect(opts.expand).toBe('parent')
    expect(opts.maxParentContext).toBe(7)
    expect(opts.stores).toBe('all')
    expect(opts.filters).toMatchObject({
      nodeKind: 'fact',
      edgeType: 'link',
      state: 'FRESH',
      target: { documentId: 'doc-1', nodeId: 'node-1' },
      documentPathPrefix: ['a', 'b'],
      tags: ['x', 'y'],
    })
  })

  it('an empty/default form submits only the query (no junk options)', () => {
    const content = searchContent(ctx, null, { expanded: true }) as unknown as AnyNode
    const submit = byId(content, ADVANCED_SEARCH_IDS.submit)!
    const handler = (submit.handlers ?? []).find((h) => h.name === ADVANCED_SEARCH_SUBMIT_HANDLER)!
    const captured: Array<[string, Record<string, unknown>]> = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: { sidebar: { submitAdvancedQuery: (q: string, o: Record<string, unknown>) => captured.push([q, o]) } },
    }
    ;(globalThis as unknown as { document?: unknown }).document = {
      getElementById: (id: string) => ({ value: id === 'pane-search-input' ? 'just query' : '' }),
    }
    const fn = compileHandlerBody(String(handler.body)) as (c: unknown) => void
    fn({ node: { props: {} } })
    expect(captured).toHaveLength(1)
    expect(captured[0][0]).toBe('just query')
    expect(captured[0][1]).toEqual({})
  })
})

// ===========================================================================
// the mock bridge + boot harness
// ===========================================================================
function makeBridge(opts: { queryImpl?: (q: string, ...rest: unknown[]) => Promise<RagQueryResult> } = {}) {
  const state = {
    operatorSettings: {
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'textarea' as EditingMode,
    },
  }
  const queryCalls: Array<[string, unknown, unknown, unknown]> = []
  const bridge = {
    security: { get: vi.fn(async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch', 'rag'] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 'x', node: {} })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, a?: unknown, b?: unknown, c?: unknown): Promise<RagQueryResult> => {
        queryCalls.push([q, a, b, c])
        if (opts.queryImpl) return opts.queryImpl(q, a, b, c)
        return { query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5, store: 'main' }
      }),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => ({ store: 'main', nodes: [], edges: [] })),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async (): Promise<RagDocHeadsPayload> => ({ documents: [] })),
      stores: vi.fn(async () => ({ stores: [] })),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
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
  return { bridge, queryCalls, state }
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

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  queryCalls: ReturnType<typeof makeBridge>['queryCalls']
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: { queryImpl?: (q: string, ...rest: unknown[]) => Promise<RagQueryResult> } = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, queryCalls } = makeBridge(opts)
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, registry, bridge, queryCalls, backRefs, editController, onRebuild }
}

// ===========================================================================
// states 2/3/4 — the args reach the shared bridge.rag.query seam
// ===========================================================================
describe('states 2/3/4 — the advanced args route through the shared bridge seam', () => {
  it('state 2 — mode=graph reaches bridge.rag.query', async () => {
    const h = makeHarness()
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    ;(h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery('hello', { mode: 'graph' })
    await flush()
    expect(h.bridge.rag.query).toHaveBeenCalledTimes(1)
    const [q, , , options] = h.queryCalls[0]
    expect(q).toBe('hello')
    expect(options).toMatchObject({ mode: 'graph' })
  })

  it('state 3 — filters (nodeKind=fact) reach bridge.rag.query', async () => {
    const h = makeHarness()
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    ;(h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery('facts', {
      filters: { nodeKind: 'fact' },
    })
    await flush()
    const [, , , options] = h.queryCalls[0]
    expect(options).toMatchObject({ filters: { nodeKind: 'fact' } })
  })

  it('state 4 — stores:"all" is selectable and reaches the fan-out path', async () => {
    const h = makeHarness()
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    ;(h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery('all-stores', {
      stores: 'all',
    })
    await flush()
    const [, , , options] = h.queryCalls[0]
    expect(options).toMatchObject({ stores: 'all' })
  })
})

// ===========================================================================
// state 6 / F1 — an invalid combo surfaces the engine error without a crash
// ===========================================================================
describe('state 6 / F1 — engine error surfaced, no crash', () => {
  it('a rejected bridge call stores the error message (no throw)', async () => {
    const h = makeHarness({
      queryImpl: async () => {
        throw new Error('rag.query: stores:"all" is only valid in flat mode')
      },
    })
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    expect(() =>
      (h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery('q', {
        stores: 'all',
        mode: 'graph',
      }),
    ).not.toThrow()
    await flush()
    expect((h.host as unknown as { advancedSearchError: string | null }).advancedSearchError).toContain(
      'only valid in flat mode',
    )
  })

  it('malformed filters surface the engine error (no crash)', async () => {
    const h = makeHarness({
      queryImpl: async () => {
        throw new Error('rag.query: filters malformed')
      },
    })
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    ;(h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery('q', {
      filters: { nodeKind: 'fact' } as never,
    })
    await flush()
    expect((h.host as unknown as { advancedSearchError: string | null }).advancedSearchError).toContain('filters malformed')
  })

  it('a later successful submit clears the error', async () => {
    let fail = true
    const h = makeHarness({
      queryImpl: async (q) => {
        if (fail) throw new Error('rag.query: filters malformed')
        return { query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5, store: 'main' }
      },
    })
    ;(h.host as unknown as { security: unknown }).security = { token: null, enabled: ['rag'] }
    const submit = (h.host as unknown as { submitAdvancedQuery: (q: string, o: unknown) => void }).submitAdvancedQuery.bind(h.host)
    submit('q', { mode: 'graph' })
    await flush()
    expect((h.host as unknown as { advancedSearchError: string | null }).advancedSearchError).not.toBeNull()
    fail = false
    submit('q', { mode: 'flat' })
    await flush()
    expect((h.host as unknown as { advancedSearchError: string | null }).advancedSearchError).toBeNull()
  })
})

// ===========================================================================
// state 7 — an agent can drive the disclosure via provident.dispatch
// ===========================================================================
describe('state 7 — provident.dispatch drives the disclosure (app-graph)', () => {
  it('dispatching the toggle reveals the fields + makes them addressable', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const toggle = h.runtime
      .listTargets()
      .nodes.find((n) => n.handlers.some((x) => x.name === ADVANCED_SEARCH_TOGGLE_HANDLER && x.event === 'click'))
    expect(toggle).toBeDefined()
    expect(toggle!.inTree).toBe(true)
    await h.runtime.dispatch({ target: { kind: 'nodeId', nodeId: toggle!.nodeId }, event: 'click' })
    const rebuilt = h.onRebuild.mock.results[h.onRebuild.mock.results.length - 1]?.value
    if (rebuilt && typeof rebuilt.then === 'function') await rebuilt
    const targets = h.runtime.listTargets().nodes
    expect(targets.some((n) => (n as { propsId?: string }).propsId === ADVANCED_SEARCH_IDS.mode)).toBe(true)
    expect(targets.some((n) => (n as { propsId?: string }).propsId === ADVANCED_SEARCH_IDS.submit)).toBe(true)
  })
})
