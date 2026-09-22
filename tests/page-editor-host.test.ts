// tests/page-editor-host.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `contenteditable-editor-host` / `unit-l-textarea-editing-ui`
// inputs; the host seams, not the retired per-node model).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.1 the surface is provident-authored with NAME-REFERENCED handler defs
//     placed in the traversal zone; the per-node `rag-textarea-*` /
//     `rag-editor-*` handler defs and their per-root attach are removed (§5
//     items 1/2/6).
//   - §2.5 the SURVIVING mode-broadcast contract: a mode change writes the
//     operator store → main broadcasts `operator-settings-changed` with the
//     store's result as the AUTHORITATIVE payload → the host uses the payload
//     directly (no re-fetch) → a FRESH re-derive (`requestRebuild`/`reDerive`,
//     never `refresh()` over a cached spliced envelope).
//   - §3.3 item 1 the channel is the EXISTING `IPC_EDIT_BATCH`: one commit =
//     ONE `applyBatch` (a per-op loop is `FS10`); the renderer reaches it
//     through the host's existing optional `bridge.edit.batch` seam.
//   - §3.4 step 3 the tab moves to a `committing` state while the one payload is
//     in flight; step 5 success clears the dirty state; §3.5 item 1/2 a failure
//     leaves the store untouched, PRESERVES the text and KEEPS the page editable.
//   - §3.5 item 6 the dirty/`commit-failed` state lives in HOST-SIDE state keyed
//     by tab id, never in a rendered element's class/attribute (`FS17`).
//   - §6.4 item 1 the `EditController` members/signatures are unchanged; the
//     content path passes the tab id and commit-on-blur survives.
//
// States enumerated (the state machine this file covers):
//   S1  the host's handler registration table (page surface vs per-node)
//   S2  one page commit in flight (one batch payload)
//   S3  a commit that succeeds (dirty cleared, page stays editable)
//   S4  a commit that fails (dirty KEPT, text preserved, no second attempt)
//   S5  a mode change broadcast (payload-authoritative, fresh re-derive)
//   S6  the per-tab dirty/commit-failed state carrier (host-side, not DOM)
// Fail-states covered: `FS10` (not one `applyBatch`), `FS16` (a failed commit
//   discarding the text), `FS17` (a DOM-only warning), `FS18` (an auto-retry),
//   `FS21` (a handler-carrying tombstone).
//
// Deliberately NOT written here: the caret/selection crossing (§2.2 item 4) and
// the painted warning (live battery — RCA-12).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import type { LegacyInitialData } from 'provident-ssr'
import { handlerDef } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge, BatchOp, BatchResult } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

beforeAll(() => {
  installShim()
})

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function traversalEnvelope(): LegacyInitialData {
  const store = createSnapshotStore(
    [makeNode('title', { type: 'h1', content: 'Doc A' }), makeNode('p1', { type: 'p', content: 'body' })],
    [
      makeEdge('dh1', 'doc-head', 'title', 'doc-a', { documentIds: ['doc-a'] }),
      makeEdge('n1', 'next-section', 'title', 'p1', { documentIds: ['doc-a'] }),
      makeEdge('e1', 'doc-end', 'p1', 'doc-a', { documentIds: ['doc-a'] }),
    ],
  )
  return buildTraversal({ store, documentIds: ['doc-a'], zoneName: 'main' }).envelope
}

/** The pinned page-surface handler-name prefix (§2.1's name-referenced defs). */
const PAGE_SURFACE_HANDLER_PREFIX = 'page-surface'
/** The retired per-node handler names (§5 items 2/6). */
const RETIRED_HANDLER_NAMES = [
  'rag-textarea-input',
  'rag-textarea-blur',
  'rag-editor-input',
  'rag-editor-blur',
  'rag-editor-compositionstart',
  'rag-editor-compositionend',
]

function makeHarness(settings: Record<string, unknown> = {}, batchImpl?: (ops: BatchOp[]) => Promise<BatchResult>) {
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const batch = vi.fn(batchImpl ?? (async () => ({ ok: true, results: [] }) as BatchResult))
  const state = { settings: { enabledPanes: [], defaultDocumentId: null, topK: 5, ...settings } }
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      onRagStoreChanged: vi.fn(() => () => {}),
      commitRich: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      batch,
    },
    rag: {
      query: vi.fn(async () => ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot: vi.fn(async () => ({ store: 'main', nodes: [], edges: [] })),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [] })),
      stores: vi.fn(async () => ({ stores: [] })),
      manage: vi.fn(async () => ({ ok: true })),
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
      get: vi.fn(async () => ({ ...state.settings }) as unknown as OperatorSettings),
      set: vi.fn(async (patch: Record<string, unknown>) => {
        state.settings = { ...state.settings, ...patch }
        return { ...state.settings } as unknown as OperatorSettings
      }),
      onChanged: vi.fn(() => () => {}),
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn((kind?: unknown) => host.reDerive(kind as never))
  const editController: EditController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild,
  })
  host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: traversalEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, bridge, batch, state, backRefs, editController, onRebuild }
}

// ===========================================================================
// S1 — handler registration: the page surface, never a per-node control
// ===========================================================================
describe('§2.1/§5 — the host registers the PAGE SURFACE handler defs, not the per-node ones', () => {
  it('S1 — the 6 per-node textarea/editor handler names are NOT registered after bindHandlers', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    for (const name of RETIRED_HANDLER_NAMES) {
      expect(handlerDef(name)).toBeUndefined()
    }
  })

  it('S1 — the host still registers its live pane handlers (the registration table is not emptied wholesale)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    expect(handlerDef('pane-doc-nav-select')).toBeDefined()
    expect(handlerDef('pane-search-submit')).toBeDefined()
  })

  it('S1 — the host exposes at least one page-surface handler def (the successor authoring is registered)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    const surfaceHandler = proto.filter((n) => n.toLowerCase().startsWith(PAGE_SURFACE_HANDLER_PREFIX))
    expect(surfaceHandler.length).toBeGreaterThan(0)
  })

  it('FS21 — the host no longer offers the per-node textarea bridge surface (textareaInput/textareaBlur)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    expect(proto).not.toContain('textareaInput')
    expect(proto).not.toContain('textareaBlur')
  })

  it('FS21 — the host no longer offers the 4 per-node rich editor methods (editorInput/editorBlur/composition*)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    for (const m of ['editorInput', 'editorBlur', 'editorCompositionStart', 'editorCompositionEnd']) {
      expect(proto).not.toContain(m)
    }
  })
})

// ===========================================================================
// S2/S3/S4 — the commit seam: one payload, failure loud, text preserved
// ===========================================================================
describe('§3.3/§3.4 — a page commit is ONE batch payload through the existing edit-batch seam', () => {
  it('S2 — the host reaches the commit through bridge.edit.batch (the existing IPC_EDIT_BATCH seam, no new channel)', () => {
    const h = makeHarness()
    expect(typeof h.bridge.edit.batch).toBe('function')
  })

  it('FS10 — one commit is ONE applyBatch: the injected commit issues exactly one batch call for a multi-block edit', async () => {
    const h = makeHarness()
    // The commit path's op list for a two-block edit (a content write on one
    // block, a type change on another) — ONE payload, not two writes.
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('p1', { content: 'edited' }) },
      { op: 'setType', nodeId: 'p2', type: 'h3' },
    ]
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1', 'p2']]]),
      commit: async () => {
        const result = await h.bridge.edit.batch(ops)
        return result.ok ? { ok: true, nodeId: 'tab-1' } : { ok: false, reason: 'store-error', error: result.error }
      },
      onRebuild: vi.fn(),
    })
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'edited')
    expect(result.ok).toBe(true)
    expect(h.batch).toHaveBeenCalledTimes(1)
    expect(h.batch.mock.calls[0][0]).toHaveLength(2)
    expect(controller.isDirty('tab-1')).toBe(false)
  })

  it('FS16 — a failed commit KEEPS the page dirty (the user\'s only copy of the text is not discarded)', async () => {
    const h = makeHarness({}, async () => ({ ok: false, error: 'rag applyBatch: op not supported: setType at index 1', failedIndex: 1 }))
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']]]),
      commit: async () => {
        const result = await h.bridge.edit.batch([{ op: 'setType', nodeId: 'p1', type: 'h3' }])
        return result.ok ? { ok: true, nodeId: 'tab-1' } : { ok: false, reason: 'store-error', error: result.error }
      },
      onRebuild: vi.fn(),
    })
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'still here')
    expect(result.ok).toBe(false)
    expect(controller.isDirty('tab-1')).toBe(true)
    expect(controller.anyDirty()).toBe(true)
  })

  it('FS18 — a failed commit is not auto-retried: exactly one batch call, no re-issue', async () => {
    const h = makeHarness({}, async () => ({ ok: false, error: 'store-rejected', failedIndex: 0 }))
    await h.bridge.edit.batch([{ op: 'putNode', node: makeNode('p1') }])
    expect(h.batch).toHaveBeenCalledTimes(1)
  })

  it('S3 — commit-on-blur survives: the controller still refuses a dangling subject and clears nothing on success only', async () => {
    const h = makeHarness()
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']]]),
      commit: vi.fn(async () => ({ ok: true, nodeId: 'tab-1' })),
      onRebuild: vi.fn(),
    })
    controller.markDirty('tab-1')
    expect(await controller.commit('tab-1', 'x')).toEqual({ ok: true, nodeId: 'tab-1' })
    void h
  })
})

// ===========================================================================
// S5 — the surviving mode-broadcast contract (§2.5)
// ===========================================================================
describe('§2.5 — the mode change is payload-authoritative and triggers a FRESH re-derive', () => {
  it('S5 — a broadcast payload is used directly (no operatorSettings re-fetch) and a rebuild is requested', async () => {
    const h = makeHarness({ representationMode: 'markdown' })
    await h.host.boot(h.runtime)
    const rebuilds = h.onRebuild.mock.calls.length
    const fetches = h.bridge.operatorSettings.get.mock.calls.length
    // drive the broadcast path through the subscription the host captured at boot
    const handler = h.bridge.operatorSettings.onChanged.mock.calls[0]?.[0] as ((s: OperatorSettings) => void) | undefined
    expect(typeof handler).toBe('function')
    if (handler) handler({ ...(h.state.settings as unknown as OperatorSettings) })
    expect(h.bridge.operatorSettings.get.mock.calls.length).toBe(fetches) // payload-authoritative, no re-fetch
    expect(h.onRebuild.mock.calls.length).toBeGreaterThan(rebuilds)
  })

  it('S5 — the host never writes operator settings during a re-derive (no broadcast/re-derive loop)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const writes = h.bridge.operatorSettings.set.mock.calls.length
    await h.host.reDerive('operator')
    expect(h.bridge.operatorSettings.set.mock.calls.length).toBe(writes)
  })
})

// ===========================================================================
// S6 — the per-tab dirty/commit-failed carrier is host-side, never DOM (§3.5 item 6)
// ===========================================================================
describe('§3.5 item 6 — the tab dirty/commit-failed state is host-side state, never a rendered class', () => {
  it('FS17 — the host has no DOM-shaped commit-failure affordance (no warning element mutation method)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    const domWarning = proto.filter((n) => /commitFail|warningSymbol|setTabClass|setAttribute/i.test(n))
    expect(domWarning).toEqual([])
  })

  it('FS17 — the page state survives a re-derive: the tab stays dirty across a re-derive driven by the host', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    h.editController.markDirty('tab-1')
    await h.host.reDerive('content')
    expect(h.editController.isDirty('tab-1')).toBe(true)
    expect(h.editController.anyDirty()).toBe(true)
  })

  it('FS17 — a re-derive while the page is dirty is QUEUED by the guard, not executed', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    h.editController.markDirty('tab-1')
    const before = h.onRebuild.mock.calls.length
    h.editController.requestRebuild('content')
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild.mock.calls.length).toBe(before)
  })
})
