// tests/unit-u-edit-2-undo-redo-history.test.ts — Unit U-EDIT-2 (C16): the
// undo/redo editor-toolbar controls + the interactive history sub-pane
// (docs/specs/unit-u-edit-2-undo-redo-history.md §2.1/§2.2/§2.5, states 1-9 +
// F1-F8).
//
// TestWriter RED set written from the SPEC ALONE, BEFORE implementation.
//
// Contract exercised:
//   - Main seam (§2.5): `handleRagJournalIpc(store)` returns the SANITIZED
//     journal (`{ entries: [{index,kind,at}], cursor, undoDepth, redoDepth }`)
//     — `before`/`after`/`ops`/`inverse` never leak. `handleRagJournalOpIpc`
//     calls `RagStore.undo()/redo()` and returns `{ ok, entryIndex }`, never
//     throwing on an empty stack / malformed action.
//   - App graph (§2.1): Undo/Redo controls beside the C8 toolbar toggle, each a
//     provident node with an `on:click` handler + disabled from depths.
//   - History sub-pane (§2.2): a `pane-history` app-graph root listing the
//     sanitized entries, each a dispatchable node; clicking entry k issues
//     `cursor - k` successive `journalOp('undo')` (stopping at the base).
//   - `replay` is NOT exposed (§3 state 9).
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import { createJsonRagStore, type RagNode, type RagStore } from '../src/main/rag-store.js'
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'
import * as paneGraph from '../src/renderer/pane-graph.js'
import type {
  RagJournalPayload,
  RagJournalOpResult,
  RagSnapshotPayload,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'

// ===========================================================================
// fixtures — the real store side
// ===========================================================================
function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-u-edit-2-'))
}
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function requireJournalIpc(): (store: RagStore | null) => RagJournalPayload {
  const fn = (mcp as unknown as { handleRagJournalIpc?: (s: RagStore | null) => RagJournalPayload }).handleRagJournalIpc
  if (typeof fn !== 'function') throw new Error('handleRagJournalIpc is not implemented (U-EDIT-2 §2.5 RED)')
  return fn
}
function requireJournalOpIpc(): (store: RagStore | null, payload: { action?: unknown }) => Promise<RagJournalOpResult> {
  const fn = (mcp as unknown as { handleRagJournalOpIpc?: (s: RagStore | null, p: { action?: unknown }) => Promise<RagJournalOpResult> }).handleRagJournalOpIpc
  if (typeof fn !== 'function') throw new Error('handleRagJournalOpIpc is not implemented (U-EDIT-2 §2.5 RED)')
  return fn
}
function requireHistoryContent(): (payload: unknown, zone?: string) => import('provident-ssr').LegacyNodeData {
  const fn = (paneGraph as unknown as { historyPaneContent?: (p: unknown, z?: string) => never }).historyPaneContent
  if (typeof fn !== 'function') throw new Error('historyPaneContent is not implemented (U-EDIT-2 §2.2 RED)')
  return fn
}

// ===========================================================================
// §2.5 — the project-journal IPC seam: constants, sanitization, round-trip
// ===========================================================================
describe('U-EDIT-2 §2.5 — the project-journal IPC constants + types', () => {
  it('declares the two pinned channels', () => {
    expect(types.IPC_RAG_JOURNAL).toBe('provident:rag-journal')
    expect(types.IPC_RAG_JOURNAL_OP).toBe('provident:rag-journal-op')
  })

  it('the sanitized payload type carries entries/cursor/depths (no before/after/ops/inverse)', () => {
    const payload: RagJournalPayload = {
      entries: [{ index: 0, kind: 'content', at: new Date().toISOString() }],
      cursor: 1,
      undoDepth: 1,
      redoDepth: 0,
    }
    expect(Object.keys(payload)).toEqual(['entries', 'cursor', 'undoDepth', 'redoDepth'])
    expect(Object.keys(payload.entries[0])).toEqual(['index', 'kind', 'at'])
  })
})

describe('U-EDIT-2 §2.5 — handleRagJournalIpc sanitizes the project journal', () => {
  it('an empty store → empty entries + zero depths', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(requireJournalIpc()(store)).toEqual({ entries: [], cursor: 0, undoDepth: 0, redoDepth: 0 })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('after an edit: entries carry index/kind/at and the redo payloads are DROPPED', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const payload = requireJournalIpc()(store)
      expect(payload.entries).toHaveLength(1)
      expect(payload.entries[0].index).toBe(0)
      expect(payload.entries[0].kind).toBe('structural')
      expect(typeof payload.entries[0].at).toBe('string')
      expect(payload.cursor).toBe(1)
      expect(payload.undoDepth).toBe(1)
      expect(payload.redoDepth).toBe(0)
      // sanitization: the raw JournalEntry's before/after/ops/inverse never leak
      const text = JSON.stringify(payload)
      expect(text).not.toContain('before')
      expect(text).not.toContain('after')
      expect(text).not.toContain('"ops"')
      expect(text).not.toContain('inverse')
      expect(Object.keys(payload.entries[0]).sort()).toEqual(['at', 'index', 'kind'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a content edit journals kind=content (sanitized)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'v1' }))
      await store.putNode(makeNode('n1', { content: 'v2' }))
      const payload = requireJournalIpc()(store)
      expect(payload.entries.map((e) => e.kind)).toEqual(['structural', 'content'])
      expect(payload.entries.map((e) => e.index)).toEqual([0, 1])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a null store throws the documented fail-state', () => {
    expect(() => requireJournalIpc()(null)).toThrow('rag-journal: no rag store configured')
  })
})

describe('U-EDIT-2 §2.5 — handleRagJournalOpIpc round-trips undo/redo', () => {
  it('F1 — undo on an empty stack is a no-op (ok:false, entryIndex:null), never throws', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      const res = await requireJournalOpIpc()(store, { action: 'undo' })
      expect(res).toEqual({ ok: false, entryIndex: null })
      expect(store.undoDepth()).toBe(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('F2 — redo on an empty redo stack is a no-op, never throws', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      const res = await requireJournalOpIpc()(store, { action: 'redo' })
      expect(res).toEqual({ ok: false, entryIndex: null })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a malformed action is a domain no-op (never throws)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      expect(await requireJournalOpIpc()(store, { action: 'replay' })).toEqual({ ok: false, entryIndex: null })
      expect(await requireJournalOpIpc()(store, { action: undefined })).toEqual({ ok: false, entryIndex: null })
      expect(store.undoDepth()).toBe(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('undo reverts the store + reports the undone entry index; redo re-applies it', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('doc', { type: 'h1', content: 'Doc' }))
      await store.putNode(makeNode('s1', { content: 'v1' }))
      await store.putNode(makeNode('s1', { content: 'v2' }))
      // three entries at cursor=3; undo the content entry (index 2)
      const undone = await requireJournalOpIpc()(store, { action: 'undo' })
      expect(undone).toEqual({ ok: true, entryIndex: 2 })
      expect(store.getNode('s1')?.content).toBe('v1')
      expect(store.redoDepth()).toBe(1)
      const redone = await requireJournalOpIpc()(store, { action: 'redo' })
      expect(redone).toEqual({ ok: true, entryIndex: 2 })
      expect(store.getNode('s1')?.content).toBe('v2')
      expect(store.redoDepth()).toBe(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('F6/safe-stop — a structural undo returns the base-restored entry index', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const undone = await requireJournalOpIpc()(store, { action: 'undo' })
      expect(undone).toEqual({ ok: true, entryIndex: 0 })
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.undoDepth()).toBe(0)
      // at the base → undo is now the F1 no-op
      expect(await requireJournalOpIpc()(store, { action: 'undo' })).toEqual({ ok: false, entryIndex: null })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a null store throws the documented fail-state', async () => {
    await expect(requireJournalOpIpc()(null, { action: 'undo' })).rejects.toThrow('rag-journal-op: no rag store configured')
  })
})

// ===========================================================================
// renderer fixtures — a stateful MOCKED bridge (the renderer side)
// ===========================================================================
interface JournalState {
  entries: Array<{ index: number; kind: 'content' | 'structural' | 'batch'; at: string }>
  cursor: number
}
function makeJournalState(): JournalState {
  return { entries: [], cursor: 0 }
}
function journalPayload(state: JournalState): RagJournalPayload {
  return {
    entries: state.entries.map((e) => ({ ...e })),
    cursor: state.cursor,
    undoDepth: state.cursor,
    redoDepth: state.entries.length - state.cursor,
  }
}
function entry(kind: 'content' | 'structural' | 'batch', index: number): { index: number; kind: 'content' | 'structural' | 'batch'; at: string } {
  return { index, kind, at: new Date(Date.now() + index).toISOString() }
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

function makeBridge(opts: { journalState?: JournalState; journalOpImpl?: (action: 'undo' | 'redo') => RagJournalOpResult } = {}) {
  const state = {
    journal: opts.journalState ?? makeJournalState(),
    snapshot: { store: 'main', nodes: [], edges: [] } as RagSnapshotPayload,
    operatorSettings: {
      enabledPanes: [],
      enabledOperatorPanes: [],
      panesInitialized: true,
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'textarea' as EditingMode,
      theme: 'system',
    } as unknown as OperatorSettings,
  }
  const journalOp = vi.fn(async (action: 'undo' | 'redo'): Promise<RagJournalOpResult> => {
    if (opts.journalOpImpl) return opts.journalOpImpl(action)
    if (action === 'undo') {
      if (state.journal.cursor <= 0) return { ok: false, entryIndex: null }
      state.journal.cursor -= 1
      return { ok: true, entryIndex: state.journal.cursor }
    }
    if (state.journal.cursor >= state.journal.entries.length) return { ok: false, entryIndex: null }
    const idx = state.journal.cursor
    state.journal.cursor += 1
    return { ok: true, entryIndex: idx }
  })
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [] })),
      stores: vi.fn(async () => ({ stores: [] })),
      journal: vi.fn(async (): Promise<RagJournalPayload> => journalPayload(state.journal)),
      journalOp,
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async (): Promise<OperatorSettings> => ({ ...state.operatorSettings })),
      set: vi.fn(async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch } as OperatorSettings
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
  registry: ReturnType<typeof createPaneRegistry>
  bridge: ReturnType<typeof makeBridge>['bridge']
  state: ReturnType<typeof makeBridge>['state']
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: { journalState?: JournalState; journalOpImpl?: (action: 'undo' | 'redo') => RagJournalOpResult } = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, state } = makeBridge(opts)
  let host: SidebarPanes
  const onRebuild = vi.fn((kind?: unknown) => host.reDerive(kind as never))
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, registry, bridge, state, editController, onRebuild }
}

afterEach(() => {
  vi.restoreAllMocks()
})

async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

function appHtml(h: Harness): string {
  return h.runtime.renderedHtmlResult().renderedHtml
}
function nodesByPropsId(h: Harness, propsId: string) {
  return h.runtime.listTargets().nodes.filter((n) => n.propsId === propsId)
}
function toolbarControl(h: Harness, propsId: string) {
  return nodesByPropsId(h, propsId)[0]
}
/** The opening tag carrying the given id (attribute order agnostic). */
function tagById(html: string, id: string): string {
  const m = html.match(new RegExp('<[a-z]+[^>]*id="' + id + '"[^>]*>'))
  return m ? m[0] : ''
}

// ===========================================================================
// §3 state 1 — boot: controls + empty history
// ===========================================================================
describe('U-EDIT-2 §3 state 1 — boot with an empty journal', () => {
  it('authors the Undo/Redo controls beside the C8 toggle, disabled at depth 0', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const undo = toolbarControl(h, 'editor-toolbar-undo')
    const redo = toolbarControl(h, 'editor-toolbar-redo')
    expect(undo, 'Undo control is authored into the app graph').toBeDefined()
    expect(redo, 'Redo control is authored into the app graph').toBeDefined()
    expect(undo!.inTree).toBe(true)
    expect(redo!.inTree).toBe(true)
    const html = appHtml(h)
    expect(tagById(html, 'editor-toolbar-undo')).toContain('disabled')
    expect(tagById(html, 'editor-toolbar-redo')).toContain('disabled')
  })

  it('renders the history sub-pane (empty state)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    expect(nodesByPropsId(h, 'pane-history')).toHaveLength(1)
    expect(appHtml(h)).toContain('id="pane-history"')
    expect(appHtml(h)).toContain('(no history)')
  })
})

// ===========================================================================
// §3 states 2/3/4 — depths track the journal; undo/redo enabled
// ===========================================================================
describe('U-EDIT-2 §3 states 2/3/4 — depth tracking + undo/redo round-trip', () => {
  it('state 2 — an entry with cursor 1 enables Undo, disables Redo', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    const html = appHtml(h)
    expect(tagById(html, 'editor-toolbar-undo')).not.toContain('disabled')
    expect(tagById(html, 'editor-toolbar-redo')).toContain('disabled')
    expect(html).toContain('id="pane-history-entry-0"')
  })

  it('state 3/4 — undo routes journalOp("undo"); the re-derive re-enables Redo', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    await h.host.historyUndo()
    expect(h.bridge.rag.journalOp).toHaveBeenCalledWith('undo')
    await awaitRebuild(h)
    expect(h.state.journal.cursor).toBe(0)
    const html = appHtml(h)
    expect(tagById(html, 'editor-toolbar-undo')).toContain('disabled')
    expect(tagById(html, 'editor-toolbar-redo')).not.toContain('disabled')
  })

  it('state 4 — redo re-applies; the journal cursor returns', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 0 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    await h.host.historyRedo()
    expect(h.bridge.rag.journalOp).toHaveBeenCalledWith('redo')
    await awaitRebuild(h)
    expect(h.state.journal.cursor).toBe(1)
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).not.toContain('disabled')
  })

  it('F1/F2 — undo on an empty stack never throws and does not re-derive', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    await expect(h.host.historyUndo()).resolves.toBeUndefined()
    await expect(h.host.historyRedo()).resolves.toBeUndefined()
    expect(h.onRebuild).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// §3 state 8 — app-graph dispatch reaches the SAME seam
// ===========================================================================
describe('U-EDIT-2 §3 state 8 — the controls are dispatchable app-graph nodes', () => {
  it('list_targets exposes Undo/Redo with on:click handlers', async () => {
    const h = makeHarness({ journalState: { entries: [entry('structural', 0)], cursor: 1 } })
    await h.host.boot(h.runtime)
    for (const id of ['editor-toolbar-undo', 'editor-toolbar-redo']) {
      const node = toolbarControl(h, id)
      expect(node, `${id} is addressable`).toBeDefined()
      expect(node!.handlers.some((x) => x.event === 'click')).toBe(true)
    }
  })

  it('dispatch(editor-toolbar-undo, click) calls bridge.rag.journalOp("undo")', async () => {
    const h = makeHarness({ journalState: { entries: [entry('structural', 0)], cursor: 1 } })
    await h.host.boot(h.runtime)
    await h.runtime.dispatch({ target: 'editor-toolbar-undo', event: 'click' })
    expect(h.bridge.rag.journalOp).toHaveBeenCalledWith('undo')
  })
})

// ===========================================================================
// §3 state 5 / §2.2 — click-to-undo-to-point: N = cursor - k
// ===========================================================================
describe('U-EDIT-2 §3 state 5 — click-to-undo-to-point', () => {
  it('clicking entry 1 at cursor 3 issues exactly 2 successive undos', async () => {
    const journalState: JournalState = {
      entries: [entry('structural', 0), entry('content', 1), entry('content', 2)],
      cursor: 3,
    }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    await h.host.historyEntryClick(1)
    expect(h.bridge.rag.journalOp).toHaveBeenCalledTimes(2)
    expect(h.bridge.rag.journalOp.mock.calls.map((c) => c[0])).toEqual(['undo', 'undo'])
    expect(h.state.journal.cursor).toBe(1)
  })

  it('F3 — a target at/after the cursor is a no-op (no implicit redo)', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    await h.host.historyEntryClick(1)
    await h.host.historyEntryClick(7)
    expect(h.bridge.rag.journalOp).not.toHaveBeenCalled()
    expect(h.state.journal.cursor).toBe(1)
  })

  it('F8 — a stale/unknown entry index is a no-op (never throws)', async () => {
    const h = makeHarness({ journalState: { entries: [entry('content', 0)], cursor: 1 } })
    await h.host.boot(h.runtime)
    await expect(h.host.historyEntryClick(-1)).resolves.toBeUndefined()
    await expect(h.host.historyEntryClick('bogus')).resolves.toBeUndefined()
    await expect(h.host.historyEntryClick(undefined)).resolves.toBeUndefined()
    expect(h.bridge.rag.journalOp).not.toHaveBeenCalled()
  })

  it('F7/§3 state 6 — the walk stops safely at the base boundary (ok:false), never throwing', async () => {
    const journalState: JournalState = {
      entries: [entry('structural', 0), entry('content', 1), entry('content', 2)],
      cursor: 3,
    }
    // The store reports the base boundary after ONE undo (a mid-walk desync).
    let calls = 0
    const h = makeHarness({
      journalState,
      journalOpImpl: () => {
        calls += 1
        if (calls >= 2) return { ok: false, entryIndex: null }
        journalState.cursor -= 1
        return { ok: true, entryIndex: journalState.cursor }
      },
    })
    await h.host.boot(h.runtime)
    await expect(h.host.historyEntryClick(0)).resolves.toBeUndefined()
    expect(calls).toBe(2) // stopped early on the first ok:false
  })

  it('F5 — queued ops: two concurrent undos both reach the store (serialized, never dropped)', async () => {
    const h = makeHarness({ journalState: { entries: [entry('structural', 0), entry('content', 1)], cursor: 2 } })
    await h.host.boot(h.runtime)
    await Promise.all([h.host.historyUndo(), h.host.historyUndo()])
    expect(h.bridge.rag.journalOp).toHaveBeenCalledTimes(2)
    expect(h.state.journal.cursor).toBe(0)
  })
})

// ===========================================================================
// §3 state 7 / §2.4 — history survives a content re-derive
// ===========================================================================
describe('U-EDIT-2 §3 state 7 — the history survives a content re-derive', () => {
  it('a content change re-renders the history list from the fresh journal', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    expect(appHtml(h)).toContain('id="pane-history-entry-0"')
    // A later edit lands in the project journal...
    journalState.entries.push(entry('content', 1))
    journalState.cursor = 2
    // ...and a content re-derive refreshes the history sub-pane in place.
    await h.host.reDerive('content')
    const html = appHtml(h)
    expect(html).toContain('id="pane-history-entry-1"')
    expect(nodesByPropsId(h, 'pane-history')).toHaveLength(1)
  })

  it('onRagStoreChanged (content) triggers the re-derive and keeps the history stack', async () => {
    const journalState: JournalState = { entries: [entry('structural', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    journalState.entries.push(entry('content', 1))
    journalState.cursor = 2
    h.host.onRagStoreChanged({ kind: 'content', nodeIds: [], edgeIds: [], store: 'main' })
    await awaitRebuild(h)
    expect(appHtml(h)).toContain('id="pane-history-entry-1"')
  })
})

// ===========================================================================
// §3 state 9 / F6 — no replay; malformed history entries render kind/index
// ===========================================================================
describe('U-EDIT-2 §3 state 9 + F6 — no replay; malformed entries are total', () => {
  it('no replay control is authored anywhere in the app graph', async () => {
    const h = makeHarness({ journalState: { entries: [entry('content', 0)], cursor: 1 } })
    await h.host.boot(h.runtime)
    const text = JSON.stringify(h.runtime.listTargets().nodes)
    expect(text).not.toMatch(/replay/i)
    expect(appHtml(h)).not.toMatch(/replay/i)
  })

  it('F6 — historyPaneContent on an empty payload renders the empty state (never throws)', () => {
    const out = requireHistoryContent()(null)
    expect(() => JSON.stringify(out)).not.toThrow()
    expect(JSON.stringify(out)).toContain('(no history)')
  })

  it('F6 — a malformed entry renders its kind/index, never throws', () => {
    const out = requireHistoryContent()({ entries: [null, {}, { kind: 'batch' }], cursor: 0 })
    expect(() => JSON.stringify(out)).not.toThrow()
    const text = JSON.stringify(out)
    expect(text).toContain('batch')
    expect(text).toMatch(/#\d/)
  })

  it('F6 pure — editorToolbarContent authors Undo/Redo but never replay', () => {
    const out = paneGraph.editorToolbarContent('textarea', 'main', {
      entries: [entry('content', 0)],
      cursor: 1,
      undoDepth: 1,
      redoDepth: 0,
    })
    const text = JSON.stringify(out)
    expect(text).toContain('editor-toolbar-undo')
    expect(text).toContain('editor-toolbar-redo')
    expect(text).not.toMatch(/replay/i)
  })
})
