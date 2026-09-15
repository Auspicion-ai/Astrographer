// tests/unit-live8-toolbar-undo-refresh.test.ts — Unit U-LIVE8 (LIVE-8
// UNDO-INERT fix): the editor-toolbar Undo/Redo `disabled` state is refreshed on
// the CONTENT re-derive path (docs/specs/unit-live8-toolbar-undo-refresh.md
// §2.1 §2.4 §6 tests a–d) + the §2.1 "disabled-state refreshed on the content
// re-derive path" invariant added to docs/specs/unit-u-edit-2-undo-redo-history.md.
//
// TestWriter RED set written from the fix-SPEC ALONE, BEFORE implementation.
// THIS FILE IS RED-TO-BE: no src/ change has landed yet. The fix shape (§1.1)
// makes the pinned `editor-toolbar` root a pane-like content-reconcile candidate
// (extractContentRoots / asContentRoot / destroyRoot all admit it), so the
// freshly-authored `disabled:undoDepth<=0` re-materializes on `reDerive('content')`.
//
// Red-set contract (§6 tests a–d):
//   (a) HOST RED — boot empty journal (undoDepth 0, Undo disabled); commit a
//       content edit that journals ONE entry (cursor 0→1); trigger
//       reDerive('content'); assert the LIVE `editor-toolbar-undo` is
//       `disabled === false` (today the fresh disabled:false is dropped → RED).
//   (b) historyUndo/historyRedo ROUND-TRIP regression — historyUndo reverts +
//       flips Undo to disabled-at-base AND Redo enabled; historyRedo re-enables
//       Undo + re-disables Redo (operators-path round-trip: GREEN today).
//   (c) CONTENT-THEN-EDIT — two SUCCESSIVE content re-derives (a no-bump change
//       then an edit that bumps the journal) never carry a stale `disabled`
//       (today the second re-derive holds the stale disabled:true → RED).
//   (d) AF2 HOSTILE-BUCKET — a non-rag-/pane- hostile root id (`__proto__`,
//       `foo-bar`, too-short `rag-`/`pane-`, `template`) is STILL never
//       classified/destroyed/attached by the content reconcile — only the pinned
//       `editor-toolbar` joins the allow-list (GREEN before AND after; guards the
//       security gate from the §1.1 widening).
//
// Harness: the host-boot + content-commit + toolbar-DOM pattern from
// tests/unit-u-edit-2-undo-redo-history.test.ts (a mocked `bridge.rag.journal`
// + `journalOp`, a stateful mock journal, `SidebarPanes.boot(runtime)` +
// `host.reDerive('content')`, rendered-html toolbar reads) and the
// tests/unit-u-state-1b-host-application.test.ts Runtime content-reconcile
// pattern for (d). Tests reference source seams ONLY as the spec's §8 build
// references name them; the behavior asserted comes solely from the spec.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import { reconcileDocumentRoots } from '../src/renderer/content-reconcile.js'
import { editorToolbarContent, EDITOR_TOOLBAR_ID } from '../src/renderer/pane-graph.js'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
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
// renderer fixtures — a stateful MOCKED bridge (the renderer side; copied from
// the U-EDIT-2 harness pattern so the content-commit + re-derive + toolbar-DOM
// assertions ride the same proven host boot).
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
// §6 (a) — HOST RED: a committed content edit + the content re-derive path
// re-materializes the toolbar's fresh disabled:false (the LIVE-8 core).
// ===========================================================================
describe('U-LIVE8 §6 (a) — host reconcile red: content edit + reDerive("content") enables Undo', () => {
  it('empty-journal boot → Undo disabled; a content edit (cursor 0→1) + reDerive("content") → Undo disabled === false', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)

    // §3 state 1 — empty journal (undoDepth 0): Undo is disabled at the base.
    expect(h.state.journal.cursor).toBe(0)
    expect(toolbarControl(h, 'editor-toolbar-undo')).toBeDefined()
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).toContain('disabled')

    // Commit a content edit that journals ONE entry → undoDepth 0→1.
    h.state.journal.entries.push(entry('content', 0))
    h.state.journal.cursor = 1
    expect(journalPayload(h.state.journal).undoDepth).toBe(1)

    // The content re-derive path authors the toolbar fresh from the bumped
    // lastJournal → the reconcile must re-materialize disabled:false LIVE.
    await h.host.reDerive('content')

    // The toolbar root is STILL present (kept, not destroyed) — the assertion
    // must not false-pass by the node disappearing.
    const undoTag = tagById(appHtml(h), 'editor-toolbar-undo')
    expect(undoTag.length).toBeGreaterThan(0)
    expect(undoTag).not.toContain('disabled')
  })

  it('MIRROR — a committed undo (redoDepth 0→1) + reDerive("content") re-materializes Redo disabled === false', async () => {
    const h = makeHarness({ journalState: { entries: [entry('content', 0)], cursor: 1 } })
    await h.host.boot(h.runtime)
    expect(h.state.journal.cursor).toBe(1)
    expect(tagById(appHtml(h), 'editor-toolbar-redo')).toContain('disabled')

    // A committed undo bumps redoDepth 0→1 (the inverse of the content edit).
    h.state.journal.cursor = 0
    expect(journalPayload(h.state.journal).redoDepth).toBe(1)

    // The content re-derive path must re-materialize Redo disabled === false.
    await h.host.reDerive('content')
    const redoTag = tagById(appHtml(h), 'editor-toolbar-redo')
    expect(redoTag.length).toBeGreaterThan(0)
    expect(redoTag).not.toContain('disabled')
  })
})

// ===========================================================================
// §6 (b) — historyUndo/historyRedo round-trip regression (green today).
// ===========================================================================
describe('U-LIVE8 §6 (b) — historyUndo/historyRedo round-trip keeps both controls correct', () => {
  it('historyUndo reverts + flips Undo to disabled-at-base AND Redo enabled; historyRedo symmetric', async () => {
    const journalState: JournalState = { entries: [entry('content', 0)], cursor: 1 }
    const h = makeHarness({ journalState })
    await h.host.boot(h.runtime)
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).not.toContain('disabled')

    // Undo → the entry reverts (cursor 1→0); Undo disabled (at base), Redo enabled.
    await h.host.historyUndo()
    expect(h.bridge.rag.journalOp).toHaveBeenCalledWith('undo')
    await awaitRebuild(h)
    expect(h.state.journal.cursor).toBe(0)
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).toContain('disabled')
    expect(tagById(appHtml(h), 'editor-toolbar-redo')).not.toContain('disabled')

    // Redo → the edit re-applies (cursor 0→1); Undo enabled, Redo disabled again.
    await h.host.historyRedo()
    expect(h.bridge.rag.journalOp).toHaveBeenCalledWith('redo')
    await awaitRebuild(h)
    expect(h.state.journal.cursor).toBe(1)
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).not.toContain('disabled')
    expect(tagById(appHtml(h), 'editor-toolbar-redo')).toContain('disabled')
  })

  it('F1/F2 — an empty-stack round-trip is a no-op on both controls (disabled stays, never throws)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    await expect(h.host.historyUndo()).resolves.toBeUndefined()
    await expect(h.host.historyRedo()).resolves.toBeUndefined()
    expect(h.onRebuild).not.toHaveBeenCalled()
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).toContain('disabled')
    expect(tagById(appHtml(h), 'editor-toolbar-redo')).toContain('disabled')
  })
})

// ===========================================================================
// §6 (c) — content-then-edit: no stale `disabled` carries across two successive
// content re-derives (RED today — the second re-derive holds the stale true).
// ===========================================================================
describe('U-LIVE8 §6 (c) — content-then-edit: two successive content re-derives', () => {
  it('a no-bump content change keeps Undo disabled; a later edit (cursor 0→1) + second reDerive enables it (no stale disabled)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)

    // Boot: empty journal → Undo disabled.
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).toContain('disabled')

    // FIRST content re-derive, no journal bump — Undo STILL disabled (correct).
    await h.host.reDerive('content')
    expect(h.state.journal.cursor).toBe(0)
    expect(tagById(appHtml(h), 'editor-toolbar-undo')).toContain('disabled')

    // SECOND: a committed edit bumps undoDepth 0→1, then the content re-derive.
    h.state.journal.entries.push(entry('content', 0))
    h.state.journal.cursor = 1
    await h.host.reDerive('content')

    // U-LIVE8 fix: the fresh disabled:false is re-materialized — the stale
    // `disabled:true` from the earlier empty-journal boot must NOT carry over.
    const undoTag = tagById(appHtml(h), 'editor-toolbar-undo')
    expect(undoTag.length).toBeGreaterThan(0)
    expect(undoTag).not.toContain('disabled')
  })
})

// ===========================================================================
// §6 (d) — AF2 hostile-bucket regression: only the pinned `editor-toolbar`
// joins the reconcile allow-list. GREEN before AND after (guard).
// ===========================================================================
describe('U-LIVE8 §6 (d) — AF2 hostile-bucket: non-content ids are never classified/destroyed/attached', () => {
  const HOSTILE_IDS = ['__proto__', 'foo-bar', 'rag-', 'rag', 'pane-', 'template', '']

  it('the pure reconciler never classifies a hostile (non-rag-/pane-/pinned) id into any bucket', () => {
    const hostile: LegacyNodeData[] = HOSTILE_IDS.map((id) => ({ type: 'div', props: { id }, content: 'evil' }))
    const result = reconcileDocumentRoots({
      previous: [],
      next: [{
        documentId: 'A',
        envelope: {
          template: { root: { type: 'div', props: { id: 'root' }, children: [{ type: 'div', props: { id: 'zone:main' } }] } },
          content: [
            { content: [{ type: 'div', props: { id: 'rag-docA', 'data-rag-node-id': 'docA' } }] },
            ...hostile.map((r) => ({ content: [r] })),
          ],
          clientConfig: { runInstantiation: true, runRendering: true },
        },
      }],
      change: { kind: 'content', nodeIds: ['docA'], edgeIds: [] },
      documentIds: ['A'],
    })
    const seenCss = [
      ...result.added,
      ...result.replaced,
      ...result.removed,
      ...result.kept,
      ...result.identityReplaced.map((e) => e.to),
    ].map((s) => (s as { cssId: string }).cssId)
    // The well-formed rag- root IS classified...
    expect(seenCss).toContain('rag-docA')
    // ...but NO hostile id ever enters a reconcile bucket (never destroyed/attached).
    for (const bad of HOSTILE_IDS) expect(seenCss).not.toContain(bad)
  })

  it('the Runtime content reconcile never materializes a hostile root (never destroyed/attached in the live graph)', () => {
    installShim()
    const ragRoot: LegacyNodeData = { type: 'div', props: { id: 'rag-docA', 'data-rag-node-id': 'docA' }, content: 'A' }
    const mount = mountEl() as never
    const runtime = new Runtime({
      mount,
      envelope: {
        template: { root: { type: 'div', props: { id: 'shell' }, children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }] } },
        content: [{ content: [ragRoot] }],
        clientConfig: { runInstantiation: true, runRendering: true },
      } as never,
    }) as Runtime & { materializedContentRoots?: () => LegacyNodeData[] }
    ;(runtime as unknown as { applyContentReconcile: (i: unknown) => unknown }).applyContentReconcile({
      result: { added: [], replaced: [], removed: [], kept: [{ cssId: 'rag-docA', ragNodeId: 'docA' }], usedFallback: false },
      next: {
        template: { root: { type: 'div', props: { id: 'shell' }, children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }] } },
        content: [
          { content: [ragRoot] },
          ...HOSTILE_IDS.map((id) => ({ content: [{ type: 'div', props: { id }, content: 'evil' }] })),
        ],
      } as never,
    })
    const ids = (runtime.materializedContentRoots!() ?? []).map((r) => (r.props as { id?: string }).id)
    expect(ids).toEqual(['rag-docA'])
  })
})

// ===========================================================================
// AD-2026-09-14-1/-2 — HOST adversarial-finding regressions (Finding 1 + 2).
// Finding 1: the pinned `editor-toolbar` reconciles as a pane in BOTH the
//   previous and the next pass, so unchanged → `kept` (no destroy/attach) and a
//   `disabled` flip → `replaced` — NEVER `added`+`removed` (the pre-fix loop-order
//   accident that tore down+reattached the toolbar on EVERY content reconcile,
//   violating P-TP-1/P-TP-2 + §2.3 node-identity/no-stall).
// Finding 2: EXACTLY ONE live `editor-toolbar` root across N successive content
//   reconciles (no phantom/secondary stacked toolbar — which would silently
//   re-freeze Undo).
// ===========================================================================
describe('U-LIVE8 AD-2026-09-14 — host finding regressions: single live toolbar root, kept/replaced classification', () => {
  function toolbarEnvelope(toolbar: LegacyNodeData): LegacyInitialData {
    return {
      template: { root: { type: 'div', props: { id: 'root' }, children: [] } },
      content: [{ content: [toolbar] }],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
  }
  function cssOf(roots: ReadonlyArray<{ cssId: string }>): string[] {
    return roots.map((r) => r.cssId)
  }

  it('(Finding 1/b) an UNCHANGED toolbar across an unrelated content change lands in `kept` — never added/removed/replaced (no destroy/attach)', () => {
    const toolbar = editorToolbarContent('textarea', 'main', journalPayload(makeJournalState()))
    const result = reconcileDocumentRoots({
      previous: [{ documentId: '', root: toolbar }],
      next: [{ documentId: 'A', envelope: toolbarEnvelope(toolbar) }],
      change: { kind: 'content', nodeIds: ['docA'], edgeIds: [] },
      documentIds: ['A'],
    })
    // The toolbar is present in BOTH previous and next and is shape-identical →
    // shape-compared as a pane → `kept` (kept root untouched, no teardown).
    expect(cssOf(result.kept)).toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.added)).not.toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.removed)).not.toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.replaced)).not.toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.identityReplaced.map((e) => e.to))).not.toContain(EDITOR_TOOLBAR_ID)
  })

  it('(Finding 1/b) a `disabled` flip (undoDepth 0→1) lands the toolbar in a SINGLE `replaced` entry — never added/removed/duplicated', () => {
    const prev = editorToolbarContent('textarea', 'main', journalPayload(makeJournalState()))
    const bumpedJournal: JournalState = { entries: [entry('content', 0)], cursor: 1 }
    const nextToolbar = editorToolbarContent('textarea', 'main', journalPayload(bumpedJournal))
    const result = reconcileDocumentRoots({
      previous: [{ documentId: '', root: prev }],
      next: [{ documentId: 'A', envelope: toolbarEnvelope(nextToolbar) }],
      change: { kind: 'content', nodeIds: ['docA'], edgeIds: [] },
      documentIds: ['A'],
    })
    const replacedToolbar = cssOf(result.replaced).filter((c) => c === EDITOR_TOOLBAR_ID)
    expect(replacedToolbar).toHaveLength(1)
    expect(cssOf(result.added)).not.toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.removed)).not.toContain(EDITOR_TOOLBAR_ID)
    expect(cssOf(result.kept)).not.toContain(EDITOR_TOOLBAR_ID)
  })

  it('(Finding 2/a) EXACTLY ONE live `editor-toolbar` root across N successive content reconciles (boot, no-bumps, an edit, an undo, more no-bumps)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const expectSingle = (step: string) => {
      // listTargets() surfaces LIVE (in-tree, not-destroyed) nodes only — a
      // stacked/secondary phantom toolbar would appear here as a duplicate.
      expect(nodesByPropsId(h, EDITOR_TOOLBAR_ID)).toHaveLength(1)
      expect(step).toBeTruthy()
    }
    expectSingle('boot')

    // N content re-derives with NO state change — the toolbar is UNCHANGED →
    // `kept` (never destroyed+reattached), so it never stacks.
    for (let i = 0; i < 3; i += 1) {
      await h.host.reDerive('content')
      expectSingle(`no-bump #${i + 1}`)
    }

    // A journaled content edit (undoDepth 0→1) + content re-derive → the toolbar
    // flip lands in `replaced` (destroy+attach through the SAME single root) —
    // still exactly ONE live toolbar root, never a stacked second.
    h.state.journal.entries.push(entry('content', 0))
    h.state.journal.cursor = 1
    await h.host.reDerive('content')
    expectSingle('after edit + reDerive')

    // A committed undo (redoDepth 0→1) + content re-derive — still exactly one.
    h.state.journal.cursor = 0
    await h.host.reDerive('content')
    expectSingle('after undo + reDerive')

    // More successive content re-derives — the live set never accumulates.
    for (let i = 0; i < 5; i += 1) {
      await h.host.reDerive('content')
      expectSingle(`successive #${i + 1}`)
    }
  })
})
