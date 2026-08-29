// tests/blind-unit-v3-doc-heads-docnav-greens.test.ts
// BLIND-TEST green-scenario battery for Unit V3 (doc-heads doc-nav).
// Derived from docs/specs/unit-v3-doc-heads-docnav.md ONLY (§5.1–§5.9 + §3a
// adversarial resolutions MED-1, LOW-2..LOW-6) + the Unit H greens conventions.
// This is a fresh-agent re-run of the greens — the scenarios are authored from
// the spec, not from the implementation.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneContext } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import type { RagSnapshotPayload, RagQueryResult, SecuritySettings } from '../src/shared/types.js'
import { deriveDocNavDocuments, docNavContent } from '../src/renderer/pane-graph.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import * as mcp from '../src/main/mcp-server.js'
import * as types from '../src/shared/types.js'

// ---- fixtures --------------------------------------------------------------

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
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
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
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

function validSnapshot(): RagSnapshotPayload {
  return {
    nodes: [makeNode('head-a', { type: 'h1', content: 'Doc A' })],
    edges: [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })],
  }
}

function emptySnapshot(): RagSnapshotPayload {
  return { nodes: [], edges: [] }
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

// ---- the mock bridge (mirrors the Unit V3 test file) -----------------------

interface OperatorSettings {
  enabledPanes: string[]
  defaultDocumentId: string | null
  topK: number
  editingMode: 'textarea' | 'contenteditable'
}

function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  docHeads?: types.RagDocHeadsPayload
  template?: { source: string; template: ContentWindowTemplate }
  queryResult?: RagQueryResult
  backlinksResult?: BacklinkResult
  security?: SecuritySettings
  operatorSettings?: OperatorSettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? emptySnapshot(),
    docHeads: opts.docHeads ?? { documents: [] },
    template: opts.template ?? { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE },
    queryResult: opts.queryResult ?? null,
    backlinksResult: opts.backlinksResult ?? null,
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' },
  }
  const bridge = {
    security: { get: vi.fn(async (): Promise<SecuritySettings> => ({ ...state.security })) },
    edit: { commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRagStoreChanged: vi.fn(() => () => {}) },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        state.queryResult ?? { query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 }),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        state.backlinksResult ?? { nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: vi.fn(async (): Promise<types.RagDocHeadsPayload> => state.docHeads),
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
      set: vi.fn(async (patch: Partial<OperatorSettings>): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
      onChanged: vi.fn(() => () => {}),
    },
  }
  return { bridge, state }
}

function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  docHeads?: types.RagDocHeadsPayload
  template?: { source: string; template: ContentWindowTemplate }
  queryResult?: RagQueryResult
  backlinksResult?: BacklinkResult
  security?: SecuritySettings
  operatorSettings?: OperatorSettings
} = {}) {
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
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  const sidebar = (): { selectDocument: (id: string) => void } =>
    (globalThis as unknown as { window: { provident: { sidebar: { selectDocument: (id: string) => void } } } }).window.provident.sidebar
  return { host, runtime, bridge, state, onRebuild, get sidebar() { return sidebar() } }
}

// ===========================================================================
// A. §5.6 Happy-path states (15)
// ===========================================================================
describe('A. §5.6 happy-path states', () => {
  it('A1. rag-doc-heads IPC happy — two doc-head edges → sorted documents, titles from head node content', () => {
    const store = createSnapshotStore(
      [makeNode('head-b', { content: 'Doc B' }), makeNode('head-a', { content: 'Doc A' })],
      [makeEdge('e2', 'doc-head', 'head-b', 'doc-b'), makeEdge('e1', 'doc-head', 'head-a', 'doc-a')],
    )
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({
      documents: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
    })
  })

  it('A2. rag-doc-heads IPC empty store → { documents: [] } (no throw)', () => {
    const store = createSnapshotStore([], [])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('A3. rag-doc-heads IPC dedupe — two doc-head edges to the SAME document → ONE entry (first head wins)', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('head-a2', { content: 'Doc A duplicate head' })],
      [makeEdge('e1', 'doc-head', 'head-a', 'doc-a'), makeEdge('e2', 'doc-head', 'head-a2', 'doc-a')],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result.documents).toHaveLength(1)
    expect(result.documents[0]).toEqual({ documentId: 'doc-a', title: 'Doc A' })
  })

  it('A4. rag-doc-heads IPC missing head node → the entry title is "" (no throw)', () => {
    const store = createSnapshotStore([], [makeEdge('e1', 'doc-head', 'missing', 'doc-a')])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [{ documentId: 'doc-a', title: '' }] })
  })

  it('A5. bridge.rag.docHeads() — the host boot calls it (the node-testable contract of the preload method)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
  })

  it('A6. deriveDocNavDocuments happy — a docHeads list → the same list (already sorted + deduped)', () => {
    const docHeads = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-b', title: 'Doc B' },
    ]
    expect(deriveDocNavDocuments(docHeads)).toEqual(docHeads)
  })

  it('A7. deriveDocNavDocuments null — null/undefined → [] (no throw)', () => {
    expect(deriveDocNavDocuments(null as never)).toEqual([])
    expect(deriveDocNavDocuments(undefined as never)).toEqual([])
  })

  it('A8. docNavContent happy — a ul of li entries, the current document li carrying data-current=true', () => {
    const ctx = {
      docHeads: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
      currentDocumentId: 'doc-b',
    } as PaneContext
    const content = docNavContent(ctx)
    expect(content.type).toBe('ul')
    const lis = (content.children ?? []).filter((c) => c.type === 'li')
    expect(lis).toHaveLength(2)
    expect(lis[0].props?.['data-document-id']).toBe('doc-a')
    expect(lis[0].props?.['data-current']).toBeUndefined()
    expect(lis[1].props?.['data-document-id']).toBe('doc-b')
    expect(lis[1].props?.['data-current']).toBe('true')
  })

  it('A9. docNavContent empty — an empty docHeads → the "(no documents)" p (no throw)', () => {
    const content = docNavContent({ docHeads: [] } as PaneContext)
    expect(content.type).toBe('p')
    expect(content.content).toBe('(no documents)')
  })

  it('A10. buildContext happy — with lastDocHeads set → the PaneContext carries docHeads', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    const ctx = h.host.buildContext()
    expect(ctx.docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('A11. boot happy — fetches the snapshot + the doc-heads + the template; lastDocHeads is set', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
    expect(h.bridge.template.get).toHaveBeenCalled()
    expect(h.host.buildContext().docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('A12. selectDocument happy (amendment 5) — an id in the doc-heads list → setCurrentDocumentId + requestRebuild', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('doc-a')
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    expect(h.onRebuild).toHaveBeenCalled()
  })

  it('A13. buildTraversalEnvelope via createSnapshotStore (amendment 4) — the boot renders the RAG content', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
  })

  it('A14. reDerive happy — fetches the snapshot + the doc-heads; lastDocHeads is refreshed', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    h.bridge.rag.docHeads.mockClear()
    await h.host.reDerive()
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
  })

  it('A15. RagSnapshotPayload preserved (amendment 9) — the rag-snapshot IPC + the full-snapshot fetch are unchanged', async () => {
    expect(types.IPC_RAG_SNAPSHOT).toBe('provident:rag-snapshot')
    const h = makeHarness({ snapshot: validSnapshot() })
    expect(h.bridge.rag.snapshot).toBeDefined()
  })
})

// ===========================================================================
// B. §5.7 Fail-states (6)
// ===========================================================================
describe('B. §5.7 fail-states', () => {
  it('B1. rag-doc-heads IPC with a null store → throws Error("rag-doc-heads: no rag store configured")', () => {
    expect(() => mcp.handleRagDocHeadsIpc(null)).toThrow('rag-doc-heads: no rag store configured')
  })

  it('B2. a bridge error during the boot rag-doc-heads fetch ABORTS the boot (the placeholder envelope stays rendered)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
      const html = h.runtime.renderedHtmlResult().renderedHtml
      expect(html).not.toContain('pane-doc-nav')
      expect(html).not.toContain('Doc A')
    } finally {
      errSpy.mockRestore()
    }
  })

  it('B3. a bridge error during the re-derive rag-doc-heads fetch ABORTS the re-derive (the current graph stays rendered)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')
    } finally {
      errSpy.mockRestore()
    }
  })

  it('B4. docNavContent with a null/undefined ctx or ctx.docHeads → the "(no documents)" p (never a TypeError)', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent(null as never)).toEqual(empty)
    expect(docNavContent({ docHeads: null } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: undefined } as never)).toEqual(empty)
  })

  it('B5. selectDocument with a bogus id (amendment 5) → IGNORED (no setCurrentDocumentId, no re-derive)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('bogus')
    // The boot set the current document to the first doc-head (doc-a); the
    // ignored bogus select does NOT change it and does NOT re-derive.
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    expect(h.onRebuild).not.toHaveBeenCalled()
  })

  it('B6. buildTraversalEnvelope with a listNodes/listEdges-only adapter (amendment 4) → throws (the adjacency call fails)', () => {
    const nodes = [makeNode('head-a', { content: 'Doc A' })]
    const edges = [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')]
    const listOnly = { listNodes: () => nodes, listEdges: () => edges } as never
    expect(() => buildTraversal({ store: listOnly, documentIds: ['doc-a'], zoneName: 'main' })).toThrow()
  })
})

// ===========================================================================
// C. §5.8 Census / numeric claims (9)
// ===========================================================================
describe('C. §5.8 census / numeric claims', () => {
  it('C1. new IPC channel (1) — IPC_RAG_DOC_HEADS === "provident:rag-doc-heads"', () => {
    expect(types.IPC_RAG_DOC_HEADS).toBe('provident:rag-doc-heads')
  })

  it('C2. new shared type (1) — RagDocHeadsPayload is exported (the constant is the runtime witness)', () => {
    expect(typeof types.IPC_RAG_DOC_HEADS).toBe('string')
  })

  it('C3. new bridge method (1) — the host boot calls bridge.rag.docHeads()', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
  })

  it('C4. new main handler (1) — handleRagDocHeadsIpc is a function', () => {
    expect(typeof mcp.handleRagDocHeadsIpc).toBe('function')
  })

  it('C5. PaneContext field added (1) — docHeads; the snapshot field is RETAINED', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    const ctx = h.host.buildContext()
    expect(ctx.docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
    expect(ctx.snapshot).toBeDefined()
  })

  it('C6. host cache added (1) — lastDocHeads is set by the boot (buildContext carries it)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.host.buildContext().docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('C7. host adapter replaced (amendment 4) — the boot renders the RAG content; a listNodes/listEdges-only adapter throws', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
    const nodes = [makeNode('head-a', { content: 'Doc A' })]
    const edges = [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')]
    const listOnly = { listNodes: () => nodes, listEdges: () => edges } as never
    expect(() => buildTraversal({ store: listOnly, documentIds: ['doc-a'], zoneName: 'main' })).toThrow()
  })

  it('C8. selectDocument validation source changed (amendment 5) — an id in the snapshot edges but NOT in the doc-heads list is IGNORED', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [] } })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('doc-a')
    // The boot set the current document to doc-a (from the SNAPSHOT's doc-head
    // edge); the select is IGNORED (doc-a not in the empty doc-heads list), so
    // currentDocumentId stays doc-a and no re-derive fires.
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    expect(h.onRebuild).not.toHaveBeenCalled()
  })

  it('C9. RagSnapshotPayload preserved — IPC_RAG_SNAPSHOT unchanged (the rendering half still fetches the full snapshot)', () => {
    expect(types.IPC_RAG_SNAPSHOT).toBe('provident:rag-snapshot')
  })
})

// ===========================================================================
// D. §3a Adversarial resolutions (MED-1, LOW-2..LOW-6) — 6
// ===========================================================================
describe('D. §3a adversarial resolutions', () => {
  it('D1 (MED-1). handleRagDocHeadsIpc skips a doc-head edge with a missing/undefined/empty target', () => {
    const storeUndefined = createSnapshotStore([], [{ id: 'e1', kind: 'doc-head', source: 'head-a', target: undefined } as never])
    expect(() => mcp.handleRagDocHeadsIpc(storeUndefined)).not.toThrow()
    expect(mcp.handleRagDocHeadsIpc(storeUndefined)).toEqual({ documents: [] })

    const storeEmpty = createSnapshotStore([], [makeEdge('e1', 'doc-head', 'head-a', '')])
    expect(mcp.handleRagDocHeadsIpc(storeEmpty)).toEqual({ documents: [] })

    const storeMixed = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('head-b', { content: 'Doc B' })],
      [
        makeEdge('e1', 'doc-head', 'head-a', 'doc-a'),
        { id: 'e2', kind: 'doc-head', source: 'head-b', target: undefined } as never,
        makeEdge('e3', 'doc-head', 'head-b', 'doc-b'),
      ],
    )
    expect(mcp.handleRagDocHeadsIpc(storeMixed)).toEqual({
      documents: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
    })
  })

  it('D2 (LOW-2). docNavContent coerces a non-array docHeads to [] (the "(no documents)" p, no TypeError)', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent({ docHeads: {} } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: 'not-an-array' } as never)).toEqual(empty)
  })

  it('D3 (LOW-3). deriveDocNavDocuments sorts + dedupes defensively', () => {
    const unsorted = [
      { documentId: 'doc-b', title: 'Doc B' },
      { documentId: 'doc-a', title: 'Doc A' },
    ]
    expect(deriveDocNavDocuments(unsorted)).toEqual([
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-b', title: 'Doc B' },
    ])

    const duplicated = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-a', title: 'Doc A duplicate' },
    ]
    expect(deriveDocNavDocuments(duplicated)).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])

    const missingId = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: '', title: 'empty id' },
      { title: 'no id' } as never,
    ]
    expect(deriveDocNavDocuments(missingId)).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('D4 (LOW-4). docNavContent coerces a missing title to "" (never content: undefined)', () => {
    const ctxMissing = { docHeads: [{ documentId: 'doc-a' } as never], currentDocumentId: null } as PaneContext
    const contentMissing = docNavContent(ctxMissing)
    expect(contentMissing.type).toBe('ul')
    const liMissing = (contentMissing.children ?? []).find((c) => c.type === 'li')
    expect(liMissing?.content).toBe('')

    const ctxNull = { docHeads: [{ documentId: 'doc-a', title: null } as never], currentDocumentId: null } as PaneContext
    const contentNull = docNavContent(ctxNull)
    const liNull = (contentNull.children ?? []).find((c) => c.type === 'li')
    expect(liNull?.content).toBe('')
  })

  it('D5 (LOW-5). reDerive commits lastSnapshot + lastDocHeads together (an aborted doc-heads fetch leaves both caches stale)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] } })
    await h.host.boot(h.runtime)
    const snapshotBefore = h.host.buildContext().snapshot
    const docHeadsBefore = h.host.buildContext().docHeads
    h.bridge.rag.snapshot.mockResolvedValueOnce({
      nodes: [makeNode('head-b', { type: 'h1', content: 'Doc B' })],
      edges: [makeEdge('dh2', 'doc-head', 'head-b', 'doc-b', { documentIds: ['doc-b'] })],
    })
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      expect(h.host.buildContext().snapshot).toEqual(snapshotBefore)
      expect(h.host.buildContext().docHeads).toEqual(docHeadsBefore)
    } finally {
      errSpy.mockRestore()
    }
  })

  it('D6 (LOW-6). selectDocument with a null lastDocHeads no-ops (never throws)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await h.host.boot(h.runtime)
    } finally {
      errSpy.mockRestore()
    }
    expect(h.host.buildContext().docHeads).toBeNull()
    h.onRebuild.mockClear()
    expect(() => h.sidebar.selectDocument('doc-a')).not.toThrow()
    expect(h.host.buildContext().currentDocumentId).toBeNull()
    expect(h.onRebuild).not.toHaveBeenCalled()
  })
})
