// tests/unit-v3-doc-heads-docnav-adversarial.test.ts — Unit V3 adversarial
// regression tests (docs/specs/unit-v3-doc-heads-docnav.md §3a). Each finding
// (MED-1, LOW-2..LOW-6) is fixed in src/ + regression-tested here.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry, type PaneContext } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
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
// MED-1 — handleRagDocHeadsIpc must not crash on a doc-head edge with a
// missing/undefined/empty target (skip the malformed edge, never a phantom
// entry that crashes the sort).
// ===========================================================================
describe('MED-1 — handleRagDocHeadsIpc skips a doc-head edge with a missing/undefined/empty target', () => {
  it('a doc-head edge with an undefined target → no crash, no phantom entry', () => {
    const store = createSnapshotStore([], [{ id: 'e1', kind: 'doc-head', source: 'head-a', target: undefined } as never])
    expect(() => mcp.handleRagDocHeadsIpc(store)).not.toThrow()
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('a doc-head edge with an empty-string target → skipped (a phantom, unselectable document entry)', () => {
    const store = createSnapshotStore([], [makeEdge('e1', 'doc-head', 'head-a', '')])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('a mix of valid + malformed edges → only the valid edges are emitted (sorted)', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('head-b', { content: 'Doc B' })],
      [
        makeEdge('e1', 'doc-head', 'head-a', 'doc-a'),
        { id: 'e2', kind: 'doc-head', source: 'head-b', target: undefined } as never,
        makeEdge('e3', 'doc-head', 'head-b', 'doc-b'),
      ],
    )
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({
      documents: [
        { documentId: 'doc-a', title: 'Doc A' },
        { documentId: 'doc-b', title: 'Doc B' },
      ],
    })
  })
})

// ===========================================================================
// LOW-2 — docNavContent must not crash on a truthy NON-ARRAY docHeads (coerce
// to [] → the "(no documents)" empty state, never a TypeError).
// ===========================================================================
describe('LOW-2 — docNavContent coerces a non-array docHeads to []', () => {
  it('a truthy non-array docHeads (an object) → the "(no documents)" p, no TypeError', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent({ docHeads: {} } as never)).toEqual(empty)
  })

  it('a truthy non-array docHeads (a string) → the "(no documents)" p, no TypeError', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent({ docHeads: 'not-an-array' } as never)).toEqual(empty)
  })
})

// ===========================================================================
// LOW-3 — deriveDocNavDocuments restores the defensive sort-by-documentId +
// dedupe-by-target (a malformed/unsorted/duplicated docHeads renders a sorted,
// deduped doc-nav).
// ===========================================================================
describe('LOW-3 — deriveDocNavDocuments sorts + dedupes defensively', () => {
  it('an unsorted docHeads list → sorted by documentId (lexicographic ascending)', () => {
    const docHeads = [
      { documentId: 'doc-b', title: 'Doc B' },
      { documentId: 'doc-a', title: 'Doc A' },
    ]
    expect(deriveDocNavDocuments(docHeads)).toEqual([
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-b', title: 'Doc B' },
    ])
  })

  it('a duplicated docHeads list → deduped by target (first head wins)', () => {
    const docHeads = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: 'doc-a', title: 'Doc A duplicate' },
    ]
    expect(deriveDocNavDocuments(docHeads)).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })

  it('a docHeads entry with a missing/empty documentId → skipped (never a phantom entry)', () => {
    const docHeads = [
      { documentId: 'doc-a', title: 'Doc A' },
      { documentId: '', title: 'empty id' },
      { title: 'no id' } as never,
    ]
    expect(deriveDocNavDocuments(docHeads)).toEqual([{ documentId: 'doc-a', title: 'Doc A' }])
  })
})

// ===========================================================================
// LOW-4 — docNavContent never renders `content: undefined` for a docHeads
// entry with a missing title (coerce to '').
// ===========================================================================
describe('LOW-4 — docNavContent coerces a missing title to ""', () => {
  it('a docHeads entry with a missing title → the li content is "" (never undefined)', () => {
    const ctx = { docHeads: [{ documentId: 'doc-a' } as never], currentDocumentId: null } as PaneContext
    const content = docNavContent(ctx)
    expect(content.type).toBe('ul')
    const li = (content.children ?? []).find((c) => c.type === 'li')
    expect(li?.content).toBe('')
  })

  it('a docHeads entry with an explicit null title → the li content is "" (never undefined)', () => {
    const ctx = { docHeads: [{ documentId: 'doc-a', title: null } as never], currentDocumentId: null } as PaneContext
    const content = docNavContent(ctx)
    const li = (content.children ?? []).find((c) => c.type === 'li')
    expect(li?.content).toBe('')
  })
})

// ===========================================================================
// LOW-5 — reDerive commits lastSnapshot + lastDocHeads TOGETHER, only after
// both fetches succeed (an aborted doc-heads fetch never leaves lastSnapshot
// fresh while lastDocHeads is stale).
// ===========================================================================
describe('LOW-5 — reDerive commits lastSnapshot + lastDocHeads together', () => {
  it('a doc-heads fetch failure during reDerive → lastSnapshot is NOT updated (stays consistent with the stale lastDocHeads)', async () => {
    const h = makeHarness({
      snapshot: validSnapshot(),
      docHeads: { documents: [{ documentId: 'doc-a', title: 'Doc A' }] },
    })
    await h.host.boot(h.runtime)
    const snapshotBefore = h.host.buildContext().snapshot
    const docHeadsBefore = h.host.buildContext().docHeads
    // The next snapshot fetch returns a DIFFERENT snapshot, but the doc-heads
    // fetch fails → the re-derive aborts and NEITHER cache is committed.
    h.bridge.rag.snapshot.mockResolvedValueOnce({
      nodes: [makeNode('head-b', { type: 'h1', content: 'Doc B' })],
      edges: [makeEdge('dh2', 'doc-head', 'head-b', 'doc-b', { documentIds: ['doc-b'] })],
    })
    h.bridge.rag.docHeads.mockRejectedValueOnce(new Error('doc-heads boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      // lastSnapshot is UNCHANGED (still the boot snapshot) — no transient
      // fresh-snapshot + stale-docHeads inconsistency.
      expect(h.host.buildContext().snapshot).toEqual(snapshotBefore)
      expect(h.host.buildContext().docHeads).toEqual(docHeadsBefore)
    } finally {
      errSpy.mockRestore()
    }
  })
})

// ===========================================================================
// LOW-6 — selectDocument with a null lastDocHeads is guarded (no-ops, never
// throws).
// ===========================================================================
describe('LOW-6 — selectDocument with a null lastDocHeads no-ops', () => {
  it('a null lastDocHeads (no doc-heads fetched) → selectDocument no-ops, never throws', async () => {
    // Boot with a doc-heads fetch that FAILS → lastDocHeads stays null.
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
