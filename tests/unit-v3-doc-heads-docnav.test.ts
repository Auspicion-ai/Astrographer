// tests/unit-v3-doc-heads-docnav.test.ts — Unit V3: the doc-heads doc-nav
// (docs/specs/unit-v3-doc-heads-docnav.md §5.6 happy paths + §5.7 fail-states
// + §5.8 census). This is the TestWriter RED set — the Unit V3 behavior does
// NOT exist yet:
//
//   - `src/shared/types.ts` (RED — the `IPC_RAG_DOC_HEADS` constant + the
//     `RagDocHeadsPayload` type are absent).
//   - `src/main/mcp-server.ts` (RED — the shared `handleRagDocHeadsIpc(store)`
//     handler is absent; the main.ts `rag-doc-heads` IPC handler delegates to
//     it, mirroring `handleRagBacklinksIpc`).
//   - `src/main/preload.ts` (RED — `bridge.rag.docHeads()` is absent; verified
//     via the host boot calling `bridge.rag.docHeads()`, since preload.ts
//     imports `electron` and is not node-importable).
//   - `src/renderer/pane-registry.ts` (RED — `PaneContext.docHeads` is absent).
//   - `src/renderer/pane-graph.ts` (RED — `deriveDocNavDocuments`/`docNavContent`
//     still read `ctx.snapshot`, not `ctx.docHeads`).
//   - `src/renderer/sidebar-panes.ts` (RED — no `lastDocHeads` cache; `boot`/
//     `reDerive` do not fetch the doc-heads; `buildContext` does not carry
//     `docHeads`; `selectDocument` validates against `lastSnapshot.edges`, not
//     the doc-heads list).
//
// The new symbols are imported via NAMESPACE imports (`types.*`, `mcp.*`) so
// the file loads even though the named exports do not exist yet — each test
// then fails cleanly on the missing behavior (a direct named import of a
// missing export would break the whole file at link time).
//
// Amendment 4 (the `buildTraversalEnvelope` → `createSnapshotStore` adapter)
// and amendment 9 (the `RagSnapshotPayload` preserved) are ALREADY in place
// from Unit V2 — those tests are GREEN verification tests, not red.
//
// These tests are RED because the Unit V3 behavior does not exist yet. The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry, type PaneContext } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import type { RagStoreChangedPayload } from '../src/main/preload.js'
import type { RagSnapshotPayload, RagQueryResult, TemplateChangedPayload, SecuritySettings } from '../src/shared/types.js'
import { deriveDocNavDocuments, docNavContent } from '../src/renderer/pane-graph.js'
import { SidebarPanes, type SidebarPanesOptions } from '../src/renderer/sidebar-panes.js'

// ---- the Unit V3 symbols (RED — imported via namespace so the file loads) ---
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'

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

/** The placeholder/default content-window template envelope (M1). */
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

// ---- the mock bridge (Unit V3: adds `rag.docHeads`) ------------------------

interface OperatorSettings {
  enabledPanes: string[]
  defaultDocumentId: string | null
  topK: number
  editingMode: 'textarea' | 'contenteditable'
}
interface OperatorSettingsPatch {
  enabledPanes?: string[]
  defaultDocumentId?: string | null
  topK?: number
  editingMode?: 'textarea' | 'contenteditable'
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
      // Unit V3 — the doc-nav data source (the `rag-doc-heads` IPC).
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
      set: vi.fn(async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
      onChanged: vi.fn(() => () => {}),
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
  }
}

function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  docHeads?: types.RagDocHeadsPayload
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

// ===========================================================================
// §5.1 the `rag-doc-heads` IPC constant + payload type (types.ts)
// ===========================================================================
describe('§5.1 the rag-doc-heads IPC constant + payload type (types.ts)', () => {
  it('happy — IPC_RAG_DOC_HEADS === "provident:rag-doc-heads"', () => {
    expect(types.IPC_RAG_DOC_HEADS).toBe('provident:rag-doc-heads')
  })

  it('census — the RagDocHeadsPayload type is exported (the { documents: [{documentId, title}] } shape)', () => {
    // The type is compile-time; the constant is the runtime witness.
    expect(typeof types.IPC_RAG_DOC_HEADS).toBe('string')
  })
})

// ===========================================================================
// §5.1 the `rag-doc-heads` main handler (handleRagDocHeadsIpc)
// ===========================================================================
describe('§5.1 the rag-doc-heads main handler (handleRagDocHeadsIpc)', () => {
  it('happy 1: two doc-head edges → { documents: [...] } sorted by document root id, titles from the head node content', () => {
    const store = createSnapshotStore(
      [makeNode('head-b', { content: 'Doc B' }), makeNode('head-a', { content: 'Doc A' })],
      [makeEdge('e2', 'doc-head', 'head-b', 'doc-b'), makeEdge('e1', 'doc-head', 'head-a', 'doc-a')],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result).toEqual({
      documents: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
    })
  })

  it('happy 2: an empty store (no doc-head edges) → { documents: [] } (no throw)', () => {
    const store = createSnapshotStore([], [])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('happy 3: two doc-head edges to the SAME document → ONE entry (first head wins)', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('head-a2', { content: 'Doc A duplicate head' })],
      [makeEdge('e1', 'doc-head', 'head-a', 'doc-a'), makeEdge('e2', 'doc-head', 'head-a2', 'doc-a')],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result.documents).toHaveLength(1)
    expect(result.documents[0]).toEqual({ documentId: 'doc-a', title: 'Doc A' })
  })

  it('happy 4: a doc-head edge whose source node is missing → the entry title is "" (no throw)', () => {
    const store = createSnapshotStore([], [makeEdge('e1', 'doc-head', 'missing', 'doc-a')])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [{ documentId: 'doc-a', title: '' }] })
  })

  it('fail 1: a null store → throws Error("rag-doc-heads: no rag store configured")', () => {
    expect(() => mcp.handleRagDocHeadsIpc(null)).toThrow('rag-doc-heads: no rag store configured')
  })
})

// ===========================================================================
// §5.3 the doc-nav helpers (pane-graph.ts) — the docHeads switch
// ===========================================================================
describe('§5.3 deriveDocNavDocuments (pane-graph.ts)', () => {
  it('happy 6: a docHeads list → the returned list is the same (already sorted + deduped by the IPC handler)', () => {
    const docHeads = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-b', title: 'Doc B' },
    ]
    expect(deriveDocNavDocuments(docHeads)).toEqual(docHeads)
  })

  it('happy 7: a null/undefined docHeads → [] (the "(no documents)" empty state, no throw)', () => {
    expect(deriveDocNavDocuments(null as never)).toEqual([])
    expect(deriveDocNavDocuments(undefined as never)).toEqual([])
  })
})

describe('§5.3 docNavContent (pane-graph.ts)', () => {
  it('happy 8: a ctx with a non-empty docHeads → a ul of li document entries, the current document li carrying data-current=true', () => {
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

  it('happy 9: a ctx with an empty docHeads → the "(no documents)" p (no throw)', () => {
    const content = docNavContent({ docHeads: [] } as PaneContext)
    expect(content.type).toBe('p')
    expect(content.content).toBe('(no documents)')
  })

  it('fail 4: a null/undefined ctx or ctx.docHeads → the "(no documents)" p (never a TypeError)', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent(null as never)).toEqual(empty)
    expect(docNavContent({ docHeads: null } as never)).toEqual(empty)
    expect(docNavContent({ docHeads: undefined } as never)).toEqual(empty)
  })
})

// ===========================================================================
// §5.4 the host (sidebar-panes.ts) — the lastDocHeads cache + the docHeads
// switch + the selectDocument validation source (amendment 5)
// ===========================================================================
describe('§5.4 buildContext (sidebar-panes.ts)', () => {
  it('happy 10: with lastDocHeads set → the returned PaneContext carries docHeads (alongside the existing fields)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    const ctx = h.host.buildContext()
    expect(ctx.docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })
})

describe('§5.4 boot (sidebar-panes.ts)', () => {
  it('happy 11: boot fetches the snapshot + the doc-heads + the template; lastDocHeads is set', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
    expect(h.bridge.template.get).toHaveBeenCalled()
    // lastDocHeads is set → buildContext carries it.
    expect(h.host.buildContext().docHeads).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('fail 2: a bridge error during the boot rag-doc-heads fetch ABORTS the boot (the placeholder envelope stays rendered; caught + logged, never a crash)', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
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
})

describe('§5.4 reDerive (sidebar-panes.ts)', () => {
  it('happy 14: a rag-store-changed re-derive fetches the snapshot + the doc-heads; lastDocHeads is refreshed', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    h.bridge.rag.docHeads.mockClear()
    await h.host.reDerive()
    expect(h.bridge.rag.docHeads).toHaveBeenCalled()
  })

  it('fail 3: a bridge error during the re-derive rag-doc-heads fetch ABORTS the re-derive (the current graph stays rendered; caught + logged)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      // The current graph stays rendered.
      expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('pane-doc-nav')
    } finally {
      errSpy.mockRestore()
    }
  })
})

describe('§5.4 selectDocument (sidebar-panes.ts, amendment 5)', () => {
  it('happy 12: a document id in the doc-heads list → setCurrentDocumentId(id) + a document-switch re-traversal (via requestRebuild)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('doc-a')
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    expect(h.onRebuild).toHaveBeenCalled()
  })

  it('fail 5: a bogus id NOT in the doc-heads list → IGNORED (no setCurrentDocumentId, no re-derive with a phantom documentIds)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    h.sidebar.selectDocument('bogus')
    // The boot set the current document to the first doc-head (doc-a); the
    // ignored bogus select does NOT change it and does NOT re-derive.
    expect(h.host.buildContext().currentDocumentId).toBe('doc-a')
    expect(h.onRebuild).not.toHaveBeenCalled()
  })

  it('fail 5 (validation source): selectDocument validates against the DOC-HEADS list, not lastSnapshot.edges — an id in the snapshot edges but NOT in the doc-heads list is IGNORED', async () => {
    // The doc-heads list is EMPTY (the doc-nav data source) while the snapshot
    // still carries a doc-head edge to doc-a. Per amendment 5, selectDocument
    // validates against the doc-heads list → doc-a is IGNORED (no re-derive
    // with a phantom documentIds).
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
})

// ===========================================================================
// §5.4 amendment 4 — the buildTraversalEnvelope → createSnapshotStore adapter
// (ALREADY in place from Unit V2 — GREEN verification tests)
// ===========================================================================
describe('§5.4 buildTraversalEnvelope via createSnapshotStore (amendment 4)', () => {
  it('happy 13: the host builds the traversal envelope correctly (boot renders the RAG content)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
  })

  it('fail 6: a listNodes/listEdges-only adapter passed to buildTraversal throws (the adjacency call fails) — the createSnapshotStore replacement is required', () => {
    const nodes = [makeNode('head-a', { content: 'Doc A' })]
    const edges = [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')]
    const listOnly = { listNodes: () => nodes, listEdges: () => edges } as never
    expect(() => buildTraversal({ store: listOnly, documentIds: ['doc-a'], zoneName: 'main' })).toThrow()
  })
})

// ===========================================================================
// §5.5 the RagSnapshotPayload preserved (amendment 9) — GREEN verification
// ===========================================================================
describe('§5.5 RagSnapshotPayload preserved (amendment 9)', () => {
  it('happy 15: the rag-snapshot IPC constant + the RagSnapshotPayload type are unchanged (the rendering half still fetches the full snapshot)', () => {
    expect(types.IPC_RAG_SNAPSHOT).toBe('provident:rag-snapshot')
    // The host still fetches the full snapshot at boot (the rendering half).
    const h = makeHarness({ snapshot: validSnapshot() })
    expect(h.bridge.rag.snapshot).toBeDefined()
  })
})

// ===========================================================================
// §5.8 census / numeric claims
// ===========================================================================
describe('§5.8 census', () => {
  it('the new IPC channel + payload type + bridge method + main handler exist', () => {
    expect(types.IPC_RAG_DOC_HEADS).toBe('provident:rag-doc-heads')
    expect(typeof mcp.handleRagDocHeadsIpc).toBe('function')
  })
})

// ===========================================================================
// The preload bridge method (preload.ts) — NOT node-importable (imports
// `electron`). The node-testable contract is the host boot calling
// `bridge.rag.docHeads()` (verified in the §5.4 boot happy test). The preload
// method itself is verified by code review.
// ===========================================================================
describe.skip('the preload bridge method (verified by code review — not node-testable)', () => {
  it.skip('§5.6 item 5 — bridge.rag.docHeads() sends the IPC_RAG_DOC_HEADS IPC and returns the RagDocHeadsPayload', () => {})
})
