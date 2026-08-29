// tests/unit-l-textarea-editing-ui.test.ts — Unit L: the form-control textarea
// editing UI (docs/specs/unit-l-textarea-editing-ui.md §5.8 happy paths + §5.9
// fail-states + §5.10 census). This is the TestWriter RED set — the Unit L
// amendment does NOT exist yet:
//
//   - `src/main/traversal.ts` `buildSubtree` does NOT author a `textarea` child
//     (the subtree root still carries `content: node.content` and has no
//     textarea child).
//   - `src/renderer/sidebar-panes.ts` does NOT have the `textareaInput`/
//     `textareaBlur` bridge methods, does NOT register the `rag-textarea-input`/
//     `rag-textarea-blur` handler defs, does NOT set `readOnly` from
//     `isEditable`, and does NOT track/restore the caret.
//   - `src/renderer/renderer.ts` does NOT register the textarea handlers (the
//     host's `bindHandlers` does not register them).
//
// Imports that EXIST (used for fixtures/envelopes, so the pure red set isolates
// exactly the Unit L amendment):
//   - `src/main/traversal.js` (`buildTraversal` — the textarea authoring site).
//   - `src/renderer/sidebar-panes.js` (`SidebarPanes` — the host the bridge
//     methods + readOnly + caret restore extend).
//   - `src/renderer/edit-controller.js` (Unit D — the dirty-edit guard + caret).
//   - `src/renderer/runtime.js` (the app Runtime the textarea renders in).
//   - `src/main/rag-store.js` + `src/main/edit-ops.js` (the MCP/UI equivalence).
//
// The Electron/DOM-dependent parts (§5.8 items 13-16, §5.9 items 8-10) are
// documented in a `.skip` block at the bottom — the provident-rendered textarea
// (A1), the caret restore re-apply, the `onBlur`→`setContent` e2e, and the
// read-only-inert e2e are NOT node-testable; they are verified by code review /
// the e2e battery, mirroring the Unit H/Unit K convention.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData, LegacyNodeData, LegacyContentPayload } from 'provident-ssr'
import { registerHandlerDef, handlerDef } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController, type CommitResult } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { setContent } from '../src/main/edit-ops.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-shape.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
} from '../src/shared/types.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ---- fixtures --------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-l-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

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

async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

/** A valid single-document flow: head → s1 → end, all scoped to 'doc'. */
function traversalDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  return {
    nodes: [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1', content: 'Title' }),
      makeNode('s1', { type: 'p', content: 'Section one' }),
      makeNode('end', { type: 'p', content: 'End' }),
    ],
    edges: [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 's1', 'end', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
    ],
  }
}

/** A snapshot with a section node 'n1' (editable via the backRefs map). */
function editSnapshot(): RagSnapshotPayload {
  return {
    nodes: [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1', content: 'Title' }),
      makeNode('n1', { type: 'p', content: 'Section one' }),
    ],
    edges: [
      makeEdge('dh', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e1', 'next-section', 'head', 'n1', { documentIds: ['doc'] }),
      makeEdge('e2', 'doc-end', 'n1', 'doc', { documentIds: ['doc'] }),
    ],
  }
}

function emptySnapshot(): RagSnapshotPayload {
  return { nodes: [], edges: [] }
}

/** The placeholder/default content-window template envelope (the empty-store
 *  envelope) — the SAME envelope the renderer constructs as the placeholder
 *  bootstrap. */
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

/** A real traversal envelope over a store with the section 'n1'. */
function traversalEnvelope(): LegacyInitialData {
  const nodes = [
    makeNode('doc', { type: 'div' }),
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('n1', { type: 'p', content: 'Section one' }),
  ]
  const edges = [
    makeEdge('dh', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e1', 'next-section', 'head', 'n1', { documentIds: ['doc'] }),
    makeEdge('e2', 'doc-end', 'n1', 'doc', { documentIds: ['doc'] }),
  ]
  // The scoped walk reads the adjacency methods, so the snapshot adapter MUST be
  // `createSnapshotStore` (amendment 4) — a listNodes/listEdges-only adapter
  // would throw.
  const store = createSnapshotStore(nodes, edges)
  return buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' }).envelope
}

/** The ContentPayload whose subtree root carries the stable authored id
 *  `rag-<ragNodeId>`. */
function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

/** Recursively collect every `textarea` node in an envelope's content payloads. */
function findTextareas(env: LegacyInitialData): Array<{ type: string; props: Record<string, unknown>; handlers?: unknown[] }> {
  const out: Array<{ type: string; props: Record<string, unknown>; handlers?: unknown[] }> = []
  const walk = (n: LegacyNodeData): void => {
    if (n.type === 'textarea') out.push(n as never)
    for (const c of n.children ?? []) walk(c as LegacyNodeData)
  }
  for (const p of env.content ?? []) walk(p.content[0])
  return out
}

// ---- the mock bridge -------------------------------------------------------

function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  template?: { source: string; template: ContentWindowTemplate }
  queryResult?: RagQueryResult
  backlinksResult?: BacklinkResult
  security?: SecuritySettings
  operatorSettings?: OperatorSettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? emptySnapshot(),
    template: opts.template ?? { source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE },
    queryResult: opts.queryResult ?? null,
    backlinksResult: opts.backlinksResult ?? null,
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5 },
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
      docHeads: vi.fn(async () => ({ documents: [] })),
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
    submitQuery: (value: string) => void
    templateAdd: (zone: string) => void
    templateRemove: (zone: string) => void
    templateReset: () => void
    operatorSet: (patch: OperatorSettingsPatch) => void
    textareaInput: (ragId: string) => void
    textareaBlur: (ragId: string, value: string) => void
  }
}

/** Build a `SidebarPanes` host + a real app Runtime (DOM-shimmed) + a mock
 *  bridge. The `onRebuild` callback of the edit controller is the host's
 *  `reDerive`. The controller's injected `commit` routes through the mock
 *  bridge's `edit.commit` (the `edit-commit` IPC) unless a custom `commit` is
 *  supplied. The `window.provident.sidebar` bridge surface is installed by the
 *  host at boot. */
function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  commit?: (nodeId: string, content: string) => Promise<CommitResult>
} = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const { bridge, state } = makeBridge(opts)
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({
    backRefs,
    commit: opts.commit ?? ((nodeId: string, content: string) => bridge.edit.commit(nodeId, content)),
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
// §5.10 CENSUS / NUMERIC CLAIMS
// ===========================================================================
describe('census (§5.10)', () => {
  it('bindHandlers registers the 2 textarea handler defs (rag-textarea-input, rag-textarea-blur) with function-string bodies', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    for (const name of ['rag-textarea-input', 'rag-textarea-blur']) {
      const def = handlerDef(name)
      expect(def).toBeDefined()
      expect(typeof def!.body).toBe('string')
    }
  })

  it('the rag-textarea-input handler body calls window.provident.sidebar.textareaInput(ragId)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('rag-textarea-input')
    expect(def!.body).toContain('s.textareaInput(ragId)')
  })

  it('the rag-textarea-blur handler body reads the DOM textarea value + calls window.provident.sidebar.textareaBlur(ragId, value)', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('rag-textarea-blur')
    expect(def!.body).toContain("document.getElementById('textarea-' + ragId)")
    expect(def!.body).toContain('s.textareaBlur(ragId, value)')
  })

  it('the window.provident.sidebar surface exposes the 2 textarea bridge methods (textareaInput, textareaBlur)', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    expect(typeof h.sidebar.textareaInput).toBe('function')
    expect(typeof h.sidebar.textareaBlur).toBe('function')
  })
})

// ===========================================================================
// §5.8.1/2 — the textarea provident-ssr authoring (src/main/traversal.ts)
// ===========================================================================
describe('the textarea authoring in buildSubtree (§5.8.1/2)', () => {
  it('§5.8.1 — a RAG subtree root is authored with a textarea child (value = content, data-rag-node-id, no readOnly prop, the two handlers); the root keeps its semantic type + content + doc-children nested', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = traversalDoc()
      await seedStore(store, nodes, edges)

      const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const payload = findPayloadByRootId(result.envelope, 'head')
      expect(payload).toBeDefined()
      const root = payload!.content[0]
      // the subtree root KEEPS its semantic type
      expect(root.type).toBe('h1')
      // the subtree root's `content` is KEPT (Conflict C resolution — the
      // markdown/line→node map renders the root's text; the textarea is a
      // render-only editing overlay)
      expect(root.content).toBe('Title')
      // the textarea child
      const textarea = (root.children ?? []).find((c) => c.type === 'textarea')
      expect(textarea).toBeDefined()
      expect(textarea!.props?.id).toBe('textarea-head')
      expect(textarea!.props?.['data-rag-node-id']).toBe('head')
      expect(textarea!.props?.value).toBe('Title')
      expect(textarea!.props?.readOnly).toBeUndefined()
      expect(textarea!.handlers).toEqual([
        { name: 'rag-textarea-input', event: 'input' },
        { name: 'rag-textarea-blur', event: 'blur' },
      ])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.8.1 — the subtree root carries the stable authored id rag-<ragNodeId> + the data-rag-node-id prop', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = traversalDoc()
      await seedStore(store, nodes, edges)

      const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const payload = findPayloadByRootId(result.envelope, 'head')
      const root = payload!.content[0]
      expect(root.props?.id).toBe('rag-head')
      expect(root.props?.['data-rag-node-id']).toBe('head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.8.2 — a multi-parent RAG node with N duplicates gets N textareas, each bound to the SAME RAG node id', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('a', { type: 'p', content: 'A' }),
        makeNode('b', { type: 'p', content: 'B' }),
        makeNode('shared', { type: 'p', content: 'Shared' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'a', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'a', 'b', { documentIds: ['doc'] }),
        makeEdge('e-n3', 'next-section', 'b', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-p1', 'parent-child', 'a', 'shared'),
        makeEdge('e-p2', 'parent-child', 'b', 'shared'),
      ])

      const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const sharedPayloads = (result.envelope.content ?? []).filter((p) => p.content[0]?.props?.id === 'rag-shared')
      expect(sharedPayloads).toHaveLength(2)
      for (const p of sharedPayloads) {
        const textareas = (p.content[0].children ?? []).filter((c) => c.type === 'textarea')
        expect(textareas).toHaveLength(1)
        expect(textareas[0].props?.['data-rag-node-id']).toBe('shared')
      }
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.8.3-5 — the handler wiring (onInput → markDirty, onBlur → commit)
// ===========================================================================
describe('the textarea handler wiring (§5.8.3-5)', () => {
  it('§5.8.3 — a textarea input event → the rag-textarea-input handler calls window.provident.sidebar.textareaInput(ragId) → editController.markDirty(ragId) → isDirty true', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    // the handler def is registered by bindHandlers
    const def = handlerDef('rag-textarea-input')
    expect(def).toBeDefined()
    expect(typeof def!.body).toBe('string')
    // the bridge method marks the node dirty
    h.sidebar.textareaInput('n1')
    expect(h.editController.isDirty('n1')).toBe(true)
  })

  it('§5.8.4 — a dirty textarea blur → textareaBlur(ragId, value) saves the caret + commits → the edit-commit IPC is sent → { ok: true, nodeId } → the dirty flag is cleared', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    h.editController.markDirty('n1')
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    h.sidebar.textareaBlur('n1', 'new value')
    // the caret is saved (offset captured from the DOM textarea's selectionStart)
    expect(saveCaret).toHaveBeenCalledWith('n1', { kind: 'textarea', offset: 0, focused: true })
    // the commit routes through the edit-commit IPC (bridge.edit.commit)
    await vi.waitFor(() => expect(h.bridge.edit.commit).toHaveBeenCalledWith('n1', 'new value'))
    // on success the dirty flag is cleared
    await vi.waitFor(() => expect(h.editController.isDirty('n1')).toBe(false))
  })

  it('§5.8.5 — a non-dirty textarea blur → the host saves the caret but does NOT call commit (no-op blur, no IPC)', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    const commit = vi.spyOn(h.editController, 'commit')
    h.sidebar.textareaBlur('n1', 'new value')
    expect(saveCaret).toHaveBeenCalled()
    expect(commit).not.toHaveBeenCalled()
    expect(h.bridge.edit.commit).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// §5.8.6/7 — the readOnly behavior (host-set from isEditable)
// ===========================================================================
describe('the readOnly behavior (§5.8.6/7)', () => {
  it('§5.8.6 — a textarea whose RAG node is editable → readOnly: false', () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    h.host.registerPanes()
    // 'n1' is editable (in backRefs) at the time the readOnly setting runs
    h.backRefs.set('n1', ['provident-n1'])
    const loadSpy = vi.spyOn(h.runtime, 'loadEnvelope')
    h.host.loadAppGraph(h.runtime, traversalEnvelope())
    const env = loadSpy.mock.calls[0][0] as LegacyInitialData
    const ta = findTextareas(env).find((t) => t.props['data-rag-node-id'] === 'n1')
    expect(ta).toBeDefined()
    expect(ta!.props.readOnly).toBeUndefined()
  })

  it('§5.8.7 — a textarea whose RAG node is NOT editable (dangling back-reference) → readOnly: true', () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    h.host.registerPanes()
    // 'n1' is NOT in backRefs (a dangling back-reference) at the time the
    // readOnly setting runs — the host flips the textarea to read-only
    const loadSpy = vi.spyOn(h.runtime, 'loadEnvelope')
    h.host.loadAppGraph(h.runtime, traversalEnvelope())
    const env = loadSpy.mock.calls[0][0] as LegacyInitialData
    const ta = findTextareas(env).find((t) => t.props['data-rag-node-id'] === 'n1')
    expect(ta).toBeDefined()
    expect(ta!.props.readOnly).toBe(true)
  })
})

// ===========================================================================
// §5.8.8/9 — the caret/focus preservation
// ===========================================================================
describe('the caret/focus preservation (§5.8.8/9)', () => {
  it('§5.8.8 — a textarea blur → the host calls editController.saveCaret(ragId, { offset, focused: false }) for a non-dirty blur (H3 — no focus steal)', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    h.sidebar.textareaBlur('n1', 'new value')
    expect(saveCaret).toHaveBeenCalledWith('n1', { kind: 'textarea', offset: 0, focused: false })
  })

  it('§5.8.9 — after a re-derive, the host calls editController.restoreCaret(ragId) for each node with a saved caret', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    // save a caret through the host's blur path (adds the node to the host's
    // saved-caret set)
    h.sidebar.textareaBlur('n1', 'value') // non-dirty → no commit, caret saved
    const restoreCaret = vi.spyOn(h.editController, 'restoreCaret')
    await h.host.reDerive()
    expect(restoreCaret).toHaveBeenCalledWith('n1')
  })
})

// ===========================================================================
// §5.8.10 — the dirty-edit guard interaction
// ===========================================================================
describe('the dirty-edit guard interaction (§5.8.10)', () => {
  it('a re-derive request while the textarea is dirty is QUEUED; the textarea commit clears the dirty flag → the queued re-derive executes', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    // the textarea marks itself dirty via onInput
    h.sidebar.textareaInput('n1')
    expect(h.editController.isDirty('n1')).toBe(true)
    // a re-derive request while dirty is queued (not executed)
    h.editController.requestRebuild()
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    // the textarea blur commits → clears the dirty flag → the queued re-derive executes
    h.sidebar.textareaBlur('n1', 'new value')
    await vi.waitFor(() => expect(h.onRebuild).toHaveBeenCalledTimes(1))
    expect(h.editController.hasQueuedRebuild()).toBe(false)
  })
})

// ===========================================================================
// §5.8.11 — MCP/UI equivalence (the textarea commit routes through setContent)
// ===========================================================================
describe('MCP/UI equivalence (§5.8.11)', () => {
  it('a textarea commit-on-blur and an MCP edit.set_content with the same params produce the same store state', async () => {
    const dir = freshDir()
    try {
      const storeA: RagStore = createJsonRagStore({ path: join(dir, 'a.json') })
      const storeB: RagStore = createJsonRagStore({ path: join(dir, 'b.json') })
      await storeA.putNode(makeNode('n1', { content: 'before' }))
      await storeB.putNode(makeNode('n1', { content: 'before' }))
      // MCP path: the edit.set_content op
      const mcp = await setContent({ store: storeA }, { nodeId: 'n1', content: 'same' })
      expect(mcp.ok).toBe(true)
      // UI path: the textarea commit-on-blur routes through the SAME setContent op
      const commit: (n: string, c: string) => Promise<CommitResult> = async (n, c) => {
        const r = await setContent({ store: storeB }, { nodeId: n, content: c })
        return r.ok ? { ok: true, nodeId: n } : { ok: false, reason: 'store-error', error: r.error }
      }
      const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
      const controller = createEditController({ backRefs, commit, onRebuild: () => {} })
      controller.markDirty('n1')
      const ui: CommitResult = await controller.commit('n1', 'same')
      expect(ui).toEqual({ ok: true, nodeId: 'n1' })
      // same store state
      expect(storeA.getNode('n1')!.content).toBe('same')
      expect(storeB.getNode('n1')!.content).toBe('same')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.8.12 — the textarea is MCP-visible in the app Runtime
// ===========================================================================
describe('the textarea MCP-visible (§5.8.12)', () => {
  it('after the pane-inclusive envelope is loaded, get_rendered_html includes the textarea element + list_targets lists the textarea node', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    const html = h.runtime.renderedHtmlResult().renderedHtml
    expect(html).toContain('textarea')
    const targets = h.runtime.listTargets().nodes
    // Conflict A resolution — filter by the authored id (the envelope has one
    // textarea per RAG subtree root; the FIRST is the doc head's, not n1's).
    const ta = targets.find((n) => n.type === 'textarea' && n.propsId === 'textarea-n1')
    expect(ta).toBeDefined()
    expect(ta!.propsId).toBe('textarea-n1')
    const handlerNames = (ta!.handlers ?? []).map((x) => x.name)
    expect(handlerNames).toContain('rag-textarea-input')
    expect(handlerNames).toContain('rag-textarea-blur')
  })

  it('dispatch can target the textarea and drive its input handler → marks the RAG node dirty', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    const result = await h.runtime.dispatch({ target: 'textarea-n1', event: 'input' })
    expect(result.dirtied).toBeDefined()
    expect(h.editController.isDirty('n1')).toBe(true)
  })
})

// ===========================================================================
// §5.9 FAIL-STATES (1-7)
// ===========================================================================
describe('the §5.9 fail-states (1-7)', () => {
  it('§5.9.1 — a textarea blur on a dangling back-reference → commit returns { ok: false, reason: "deleted-node" } (the edit-commit IPC is NOT sent)', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    // remove 'n1' from backRefs (a dangling back-reference)
    h.backRefs.delete('n1')
    h.editController.markDirty('n1')
    const commitSpy = vi.spyOn(h.editController, 'commit')
    h.sidebar.textareaBlur('n1', 'value')
    await vi.waitFor(() => expect(commitSpy).toHaveBeenCalled())
    const result = await commitSpy.mock.results[0].value
    expect(result).toEqual({ ok: false, reason: 'deleted-node' })
    // the edit-commit IPC is NOT sent
    expect(h.bridge.edit.commit).not.toHaveBeenCalled()
  })

  it('§5.9.2 — a textarea blur when the store write fails → commit returns { ok: false, reason: "store-error", error }', async () => {
    const h = makeHarness({
      snapshot: editSnapshot(),
      commit: async () => ({ ok: false, reason: 'store-error', error: 'disk full' }),
    })
    await h.host.boot(h.runtime)
    h.editController.markDirty('n1')
    const commitSpy = vi.spyOn(h.editController, 'commit')
    h.sidebar.textareaBlur('n1', 'value')
    await vi.waitFor(() => expect(commitSpy).toHaveBeenCalled())
    const result = await commitSpy.mock.results[0].value
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('store-error')
      expect(result.error).toBe('disk full')
    }
  })

  it('§5.9.3 — a re-derive request while the textarea is dirty → the re-derive is QUEUED (hasQueuedRebuild true, onRebuild NOT called)', async () => {
    const h = makeHarness({ snapshot: editSnapshot() })
    await h.host.boot(h.runtime)
    h.sidebar.textareaInput('n1') // marks dirty
    h.editController.requestRebuild()
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
  })

  it('§5.9.4 — restoreCaret for a node whose back-reference is dangling → returns undefined (the saved caret was cleared)', () => {
    const backRefs = new Map<string, string[]>()
    const controller = createEditController({ backRefs, commit: async () => ({ ok: true, nodeId: 'n1' }), onRebuild: () => {} })
    controller.saveCaret('n1', { offset: 2, focused: true })
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('§5.9.5 — restoreCaret for a node with no saved caret → returns undefined (no restore)', () => {
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = createEditController({ backRefs, commit: async () => ({ ok: true, nodeId: 'n1' }), onRebuild: () => {} })
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('§5.9.6 — a bindHandlers with a non-string handler body → the def is STORED (no throw at registration); the throw surfaces at COMPILE', () => {
    expect(() => registerHandlerDef('rag-textarea-nonstring', { name: 'rag-textarea-nonstring', body: 42 as never })).not.toThrow()
    const def = handlerDef('rag-textarea-nonstring')
    expect(def).toBeDefined()
    expect((def as { body: unknown }).body).toBe(42)
  })

  it('§5.9.7 — a loadAppGraph with a null/undefined runtime/traversalEnvelope → the assembleAppGraphEnvelope guard throws', () => {
    const h = makeHarness()
    h.host.registerPanes()
    expect(() => h.host.loadAppGraph(h.runtime, null as never)).toThrow(
      'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required',
    )
    expect(() => h.host.loadAppGraph(null as never, traversalEnvelope())).toThrow(
      'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required',
    )
  })
})

// ===========================================================================
// Electron/DOM-dependent (§5.8 items 13-16, §5.9 items 8-10) — documented, NOT
// runnable in node. These are the provident-rendered textarea (A1), the caret
// restore re-apply, the onBlur→setContent e2e, and the read-only-inert e2e.
// They are verified by code review / the e2e battery; the node-testable
// contract above is the pinned surface.
// ===========================================================================
describe.skip('renderer-dependent (verified by code review — not node-testable)', () => {
  it.skip('§5.8 13 — the textarea is authored as provident-ssr data in the traversal and rendered through the app Runtime — NOT hand-written HTML/DOM (A1)', () => {})
  it.skip('§5.8 14 — a textarea with a saved caret → a re-derive re-loads the envelope → the host restores the caret (offset + focus) to the re-rendered textarea', () => {})
  it.skip('§5.8 15 — a textarea commit-on-blur sends the edit-commit IPC → main calls setContent (the SAME op as the MCP edit.set_content tool) → the store updates + broadcasts rag-store-changed → the renderer re-traverses', () => {})
  it.skip('§5.8 16 — a read-only textarea input/blur events do NOT mark dirty or commit (the user cannot type)', () => {})
  it.skip('§5.9 8 — a textarea authored as hand-written HTML/DOM in the renderer (not provident-ssr data) is a review finding (A1) — invisible to dispatch/get_rendered_html/get_markdown', () => {})
  it.skip('§5.9 9 — a textarea onBlur that sends the edit-commit IPC directly (bypassing editController.commit) would NOT refuse a write to a deleted node — the textarea MUST route through editController.commit', () => {})
  it.skip('§5.9 10 — a re-derive that runs while the textarea is dirty (bypassing the dirty-edit guard) would destroy the uncommitted content — the guard MUST queue the re-derive', () => {})
})
