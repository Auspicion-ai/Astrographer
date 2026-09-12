// tests/unit-u-parity-docnav.test.ts — Wave-1 Unit U-PARITY-DOCNAV:
// PG14 doc-nav dispatchability + the C15 tree consumer (G2)
// (docs/specs/unit-u-parity-docnav.md §3 states 1-7 + §4 F1-F3;
// wave-1-open-decisions W1-Q16 RESOLVED (a)).
//
// This is the TestWriter RED set. The behavior does NOT exist yet:
//   - the doc-nav `li` nodes carry NO provident handler + NO `is-clickable`
//     (PG14 — `provident.dispatch` cannot select a document);
//   - `docNavContent` renders a FLAT `ul`/`li` list, not a DERIVED folder/leaf
//     tree from the C15 `path` field (`buildDocumentTree`);
//   - there is NO folder expand/collapse handler.
//
// Contract pinned by the spec + the task scope:
//   - Every doc-nav item carries a `pane-doc-nav-select` handler (the SAME
//     `window.provident.sidebar.selectDocument(id)` application seam the DOM
//     click uses) + the `is-clickable` token (U-SHELL-6).
//   - The doc-nav renders a DERIVED tree from `RagDocHeadsPayload.documents[].path`
//     via `buildDocumentTree` (folders + leaves); folder toggles are
//     `pane-doc-nav-toggle` handlers that mutate the graph locally
//     (`ctx.clientAPI.apply`) so a `provident.dispatch` and a DOM click are
//     equivalent. Children are rendered (collapsed/hidden via inline style) and
//     the toggle reveals them.
//   - Empty state + the flat fallback are preserved; order is deterministic.
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
  RagDocHeadsPayload,
  RagQueryResult,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { docNavContent } from '../src/renderer/pane-graph.js'
import { buildDocumentTree } from '../src/shared/document-tree.js'

// ===========================================================================
// fixtures + node-tree helpers
// ===========================================================================
const now = new Date().toISOString()

function head(documentId: string, title = '', path: string[] = [], tags: string[] = []): RagDocHeadsPayload['documents'][number] {
  return { documentId, title, path, tags }
}

function docsPayload(documents: RagDocHeadsPayload['documents']): RagDocHeadsPayload {
  return { documents }
}

function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** A snapshot whose doc-head edges point at `ids` (one head section per doc). */
function docSnapshot(ids: string[]): RagSnapshotPayload {
  return {
    store: 'main',
    nodes: ids.map((id) => makeNode(`head-${id}`, { type: 'h1', content: `Head ${id}` })),
    edges: ids.map((id, i) => makeEdge(`dh-${id}`, 'doc-head', `head-${id}`, id, { documentIds: [id] })),
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

interface AnyNode {
  type?: string
  content?: unknown
  props?: Record<string, unknown>
  css?: { classes?: string[]; style?: unknown }
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
    // Push children in REVERSE so the LIFO stack yields left-to-right pre-order.
    for (let i = kids.length - 1; i >= 0; i--) stack.push(kids[i])
  }
  return out
}

function topLevelLis(content: AnyNode): AnyNode[] {
  return (content.children ?? []).filter((c) => c.type === 'li')
}

function leaves(root: AnyNode): AnyNode[] {
  return walk(root).filter((n) => n.props?.['data-document-id'] !== undefined)
}

function folders(root: AnyNode): AnyNode[] {
  return walk(root).filter((n) => n.props?.['data-folder-path'] !== undefined)
}

function assertClickableConvention(root: AnyNode): void {
  for (const n of walk(root)) {
    const hasHandler = (n.handlers?.length ?? 0) > 0
    const classes = n.css?.classes ?? []
    if (hasHandler) expect(classes, `handler node <${String(n.type)}> must carry is-clickable`).toContain('is-clickable')
    else expect(classes, `non-handler node <${String(n.type)}> must NOT carry is-clickable`).not.toContain('is-clickable')
  }
}

// ===========================================================================
// the mock bridge + the boot harness
// ===========================================================================
function makeBridge(opts: { snapshot?: RagSnapshotPayload; docHeads?: RagDocHeadsPayload } = {}) {
  const state = {
    snapshot: opts.snapshot ?? { store: 'main', nodes: [], edges: [] },
    docHeads: opts.docHeads ?? { documents: [] },
    operatorSettings: {
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'textarea' as EditingMode,
    },
  }
  const bridge = {
    security: { get: vi.fn(async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 'x', node: {} })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 })),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async (): Promise<RagDocHeadsPayload> => state.docHeads),
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
  return { bridge, state }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  state: ReturnType<typeof makeBridge>['state']
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: { snapshot?: RagSnapshotPayload; docHeads?: RagDocHeadsPayload } = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, state } = makeBridge(opts)
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, registry, bridge, state, backRefs, editController, onRebuild }
}

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// PG14 — doc-nav items are dispatchable (handler + is-clickable)
// ===========================================================================
describe('PG14 — doc-nav leaves carry a select handler + is-clickable', () => {
  it('every leaf li carries the pane-doc-nav-select click handler + is-clickable; non-handler nodes do not', () => {
    const content = docNavContent({ docHeads: [head('doc-a', 'Doc A'), head('doc-b', 'Doc B')], currentDocumentId: null } as never) as unknown as AnyNode
    const lis = leaves(content)
    expect(lis).toHaveLength(2)
    for (const li of lis) {
      expect(li.handlers?.some((h) => h.name === 'pane-doc-nav-select' && h.event === 'click')).toBe(true)
      expect(li.css?.classes).toContain('is-clickable')
    }
    assertClickableConvention(content)
  })
})

describe('PG14 — the select handler calls the shared application seam', () => {
  it('the registered pane-doc-nav-select body routes to window.provident.sidebar.selectDocument(id)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('pane-doc-nav-select')
    expect(def).toBeDefined()
    expect(() => compileHandlerBody(String(def!.body))).not.toThrow()
    const calls: string[] = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: { sidebar: { selectDocument: (id: string) => calls.push(id) } },
    }
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown) => void
    fn({ node: { props: { 'data-document-id': 'doc-b' } } })
    expect(calls).toEqual(['doc-b'])
  })

  it('a missing/empty data-document-id dispatches NO select (never a phantom)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('pane-doc-nav-select')
    const calls: string[] = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: { sidebar: { selectDocument: (id: string) => calls.push(id) } },
    }
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown) => void
    fn({ node: { props: {} } })
    fn({ node: { props: { 'data-document-id': '' } } })
    expect(calls).toEqual([])
  })
})

// ===========================================================================
// PG14 — provident.dispatch on a leaf selects via the SAME seam (states 4/5)
// ===========================================================================
describe('PG14 — provident.dispatch on a leaf selects the document (state 5)', () => {
  it('an agent dispatch on a leaf handler sets currentDocumentId + triggers the document switch', async () => {
    const h = makeHarness({
      snapshot: docSnapshot(['doc-a', 'doc-b']),
      docHeads: docsPayload([head('doc-a', 'Doc A'), head('doc-b', 'Doc B')]),
    })
    await h.host.boot(h.runtime)
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    h.onRebuild.mockClear()
    const leaf = h.runtime
      .listTargets()
      .nodes.find((n) => n.content === 'Doc B' && n.handlers.some((x) => x.name === 'pane-doc-nav-select' && x.event === 'click'))
    expect(leaf).toBeDefined()
    expect(leaf!.inTree).toBe(true)
    await h.runtime.dispatch({ target: { kind: 'nodeId', nodeId: leaf!.nodeId }, event: 'click' })
    expect(h.host.buildContext().currentDocumentId).toBe('doc-b')
    expect(h.onRebuild).toHaveBeenCalled()
  })
})

// ===========================================================================
// Tree — state 1: a flat corpus renders one root level
// ===========================================================================
describe('tree — flat corpus (state 1)', () => {
  it('every document is a top-level leaf; no folders', () => {
    const content = docNavContent({ docHeads: [head('a', 'Doc A'), head('b', 'Doc B')], currentDocumentId: null } as never) as unknown as AnyNode
    expect(content.type).toBe('ul')
    const top = topLevelLis(content)
    expect(top.map((n) => n.props?.['data-document-id'])).toEqual(['a', 'b'])
    expect(folders(content)).toHaveLength(0)
  })
})

// ===========================================================================
// Tree — state 2: a nested corpus renders folders + leaves; expand reveals
// ===========================================================================
describe('tree — nested corpus (state 2)', () => {
  it('a nested corpus renders a collapsed folder li (no children) by default', () => {
    const content = docNavContent({
      docHeads: [head('a/b', 'Doc B', ['a']), head('a/c', 'Doc C', ['a'])],
      currentDocumentId: null,
    } as never) as unknown as AnyNode
    expect(topLevelLis(content)).toHaveLength(1)
    const [folderA] = folders(content)
    expect(folderA).toBeDefined()
    expect(folderA.props?.['data-folder-label']).toBe('a')
    expect(folderA.props?.['data-expanded']).toBe('false')
    expect(folderA.handlers?.some((h) => h.name === 'pane-doc-nav-toggle' && h.event === 'click')).toBe(true)
    expect(folderA.css?.classes).toContain('is-clickable')
    // Collapsed → no child ul is rendered.
    expect((folderA.children ?? []).find((c) => c.type === 'ul')).toBeUndefined()
    assertClickableConvention(content)
  })

  it('expanding the folder (the host expanded set) renders the nested ul with the leaves', () => {
    const key = JSON.stringify(['a'])
    const content = docNavContent(
      { docHeads: [head('a/b', 'Doc B', ['a']), head('a/c', 'Doc C', ['a'])], currentDocumentId: null } as never,
      { expandedPaths: [key] },
    ) as unknown as AnyNode
    const [folderA] = folders(content)
    expect(folderA.props?.['data-expanded']).toBe('true')
    const childUl = (folderA.children ?? []).find((c) => c.type === 'ul')
    expect(childUl).toBeDefined()
    expect((childUl!.children ?? []).map((n) => n.props?.['data-document-id'])).toEqual(['a/b', 'a/c'])
    assertClickableConvention(content)
  })

  it('the inline pane-doc-nav-toggle body routes the folder key to the shared host seam', () => {
    const content = docNavContent({
      docHeads: [head('a/b', 'Doc B', ['a'])],
      currentDocumentId: null,
    } as never) as unknown as AnyNode
    const [folderA] = folders(content)
    const handler = folderA.handlers?.find((h) => h.name === 'pane-doc-nav-toggle' && h.event === 'click')
    expect(handler).toBeDefined()
    expect(typeof handler!.body).toBe('string')
    expect(() => compileHandlerBody(String(handler!.body))).not.toThrow()
    const calls: string[] = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: { sidebar: { docNavToggle: (k: string) => calls.push(k) } },
    }
    const fn = compileHandlerBody(String(handler!.body)) as (ctx: unknown) => void
    fn({ node: { props: { 'data-folder-path': '["a"]' } } })
    expect(calls).toEqual(['["a"]'])
    // A missing key dispatches nothing.
    fn({ node: { props: {} } })
    expect(calls).toEqual(['["a"]'])
  })

  it('provident.dispatch on the folder toggles the host expanded set + re-derives to reveal the children', async () => {
    const h = makeHarness({
      snapshot: docSnapshot(['a/b']),
      docHeads: docsPayload([head('a/b', 'Doc B', ['a'])]),
    })
    await h.host.boot(h.runtime)
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('data-expanded="false"')
    const folder = h.runtime
      .listTargets()
      .nodes.find((n) => n.handlers.some((x) => x.name === 'pane-doc-nav-toggle' && x.event === 'click'))
    expect(folder).toBeDefined()
    await h.runtime.dispatch({ target: { kind: 'nodeId', nodeId: folder!.nodeId }, event: 'click' })
    // The toggle routes through the dirty-edit guard → reDerive (async); await it.
    const rebuilt = h.onRebuild.mock.results[h.onRebuild.mock.results.length - 1]?.value
    if (rebuilt && typeof rebuilt.then === 'function') await rebuilt
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html).toContain('data-expanded="true"')
    expect(html).toContain('Doc B')
  })
})

// ===========================================================================
// Tree — state 3: a filter narrows the tree
// ===========================================================================
describe('tree — filtering (state 3)', () => {
  const ctx = {
    docHeads: [head('a/b', 'Doc B', ['a'], ['x']), head('a/c', 'Doc C', ['a'], ['y']), head('z', 'Doc Z', [], ['x'])],
    currentDocumentId: null,
  } as never

  it('a tag filter keeps only leaves carrying ALL the requested tags', () => {
    const content = docNavContent(ctx, { tags: ['x'], expandedPaths: [JSON.stringify(['a'])] }) as unknown as AnyNode
    expect(leaves(content).map((n) => n.props?.['data-document-id'])).toEqual(['a/b', 'z'])
  })

  it('a path-prefix filter (selectDocumentIdsByPathPrefix) narrows to the prefix subtree', () => {
    const content = docNavContent(ctx, { pathPrefix: ['a'], expandedPaths: [JSON.stringify(['a'])] }) as unknown as AnyNode
    expect(leaves(content).map((n) => n.props?.['data-document-id'])).toEqual(['a/b', 'a/c'])
  })

  it('a filter that matches nothing → the empty state', () => {
    expect(docNavContent(ctx, { tags: ['nope'] })).toEqual({ type: 'p', content: '(no documents)' })
  })
})

// ===========================================================================
// Tree — states 6/7 + F1/F2/F3
// ===========================================================================
describe('tree — empty + deterministic order (states 6/7)', () => {
  it('an empty corpus → the "(no documents)" p (state 6)', () => {
    expect(docNavContent({ docHeads: [], currentDocumentId: null } as never)).toEqual({ type: 'p', content: '(no documents)' })
  })

  it('siblings sort by label with the folder-first tiebreak; repeatable (state 7)', () => {
    const ctx = {
      docHeads: [
        head('b', 'Doc B'),
        head('a', 'Doc A'),
        head('c/x', 'Doc X', ['c']),
        head('a/b', 'Doc AB', ['a']),
      ],
      currentDocumentId: null,
    } as never
    const top = topLevelLis(docNavContent(ctx) as unknown as AnyNode)
    // labels: folder a + leaf a (tie → folder first), leaf b, folder c
    expect(top[0].props?.['data-folder-label']).toBe('a')
    expect(top[1].props?.['data-document-id']).toBe('a')
    expect(top[2].props?.['data-document-id']).toBe('b')
    expect(top[3].props?.['data-folder-label']).toBe('c')
    // repeatable
    expect(docNavContent(ctx)).toEqual(docNavContent(ctx))
  })
})

describe('tree — fail-states (F1/F2/F3)', () => {
  const empty = { type: 'p', content: '(no documents)' }

  it('F1 — a null/malformed docHeads list → the empty state, never a TypeError', () => {
    expect(docNavContent(null as never)).toEqual(empty)
    expect(docNavContent({ docHeads: null } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: undefined } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: {} } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: 'not-an-array' } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: [null, 5, {}, { documentId: '' }] } as never)).toEqual(empty)
  })

  it('F2 — a very deep path is depth-safe (no RangeError) and the leaf is reachable', () => {
    const depth = 2000
    const segs = Array.from({ length: depth }, (_, i) => `d${i}`)
    const id = [...segs, 'leaf'].join('/')
    let content: AnyNode | null = null
    const expandedPaths = segs.map((_, i) => JSON.stringify(segs.slice(0, i + 1)))
    expect(() => {
      content = docNavContent(
        { docHeads: [head(id, 'Deep', segs)], currentDocumentId: null } as never,
        { expandedPaths },
      ) as unknown as AnyNode
    }).not.toThrow()
    expect(leaves(content!).some((n) => n.props?.['data-document-id'] === id)).toBe(true)
  })

  it('F3 — a folder created only for a skipped entry is dropped (no empty branch)', () => {
    const tree = buildDocumentTree([
      { documentId: '', title: '', path: ['x'], tags: [] } as never,
      head('a/b', 'Doc B', ['a']),
    ])
    const folderPaths: string[] = []
    const stack = [...tree]
    while (stack.length > 0) {
      const n = stack.pop() as (typeof tree)[number]
      if (n.kind === 'folder') {
        expect(n.children.length).toBeGreaterThan(0)
        folderPaths.push(n.path.join('/'))
        stack.push(...n.children)
      }
    }
    expect(folderPaths).not.toContain('x')
    expect(folderPaths).toContain('a')
  })
})
