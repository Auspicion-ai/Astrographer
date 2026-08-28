// tests/contenteditable-editor-host.test.ts — Unit U4: the HOST wiring for the
// contenteditable rich-text editor (docs/specs/unit-u4-contenteditable-editor.md
// §1.3 handler defs + attachment, §1.4 bridge/host methods + composition guard,
// §1.6/§1.7 the gated re-derive caret restore, §2 the state/fail-state census,
// §3 numeric claims).
//
// This is the TestWriter RED set. The changes do NOT exist yet in
// `src/renderer/sidebar-panes.ts`:
//   - NO `RAG_EDITOR_INPUT_BODY` / `RAG_EDITOR_BLUR_BODY` /
//     `RAG_EDITOR_COMPOSITIONSTART_BODY` / `RAG_EDITOR_COMPOSITIONEND_BODY`
//     handler defs and NO `registerHandlerDef` calls for the 4 `rag-editor-*`
//     names.
//   - `applyEditingMode` does NOT attach the 4 handler defs to eligible roots
//     (it only splices contenteditable:true + removes the textarea).
//   - `installSidebarBridge` does NOT add `editorInput` / `editorBlur` /
//     `editorCompositionStart` / `editorCompositionEnd`; the 4 private host
//     methods do NOT exist; the 3 fields (`composingRagId` / `pendingCommitRagId`
//     / `committingRagIds`) are absent; `editorBlur` does NOT call
//     `decomposeRichHtml` or `bridge.edit.commitRich`.
//   - the `reDerive` caret-restore loop (lines 571-589) is STILL the textarea-only
//     `{ offset; focused }` shape — NO kind-gated restore (rich caret into
//     contenteditable / textarea caret into textarea / dropped mismatches).
//   - `textareaBlur` still writes `{ offset, focused }`, NOT `{ kind:'textarea', ... }`.
//
// The host is exercised through the existing SidebarPanes host integration
// harness (the makeHarness convention — Unit K/U3/U1/U5). Host methods that do
// not exist yet are invoked through an `any` cast so vitest reaches the runtime
// failure ("editorBlur is not a function") — the RED proof (RCA-1). The
// decompose-ONCE + commit-ONCE contract is asserted via harness spies
// (`decomposeRichHtml` via the live module binding, `bridge.edit.commitRich` via
// a vi.fn).
//
// The browser-only pieces (real `window.getSelection()` / `document.createRange`
// / `Range` / `Selection`, real IME event sequencing, real innerHTML DOM reads)
// are documented in a `.skip` block (the Unit L §5.8 / §5.9 convention). The
// dom-shim supplies NEITHER `getSelection` NOR `createRange` (ADR-13) — the
// capture/restore NO-OP through the fallback and NEVER throw, which the harness
// tests below rely on.
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi, afterEach } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { handlerDef, compileHandlerBody } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import * as richDecomposeModule from '../src/main/rich-decompose.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// fixtures
// ===========================================================================
function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
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
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
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

/** A valid one-document snapshot whose single section `s1` is an ELIGIBLE `p`
 *  root. documentIds derive to ['doc']. */
function singleSectionSnapshot(): RagSnapshotPayload {
  return {
    nodes: [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s1', { type: 'p', content: 'hello' }),
    ],
    edges: [
      makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
    ],
  }
}

/** A valid multi-parent store: `dup` (a `p`, ELIGIBLE) is parent-child'ed by BOTH
 *  sec-a and sec-b → `dup` materialized twice. */
function multiParentSnapshot(): RagSnapshotPayload {
  return {
    nodes: [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('sec-a', { type: 'p', content: 'A' }),
      makeNode('sec-b', { type: 'p', content: 'B' }),
      makeNode('end', { type: 'p', content: 'end' }),
      makeNode('dup', { type: 'p', content: 'shared' }),
    ],
    edges: [
      makeEdge('e-hd', 'doc-head', 'sec-a', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'sec-a', 'sec-b', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 'sec-b', 'end', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-p1', 'parent-child', 'sec-a', 'dup'),
      makeEdge('e-p2', 'parent-child', 'sec-b', 'dup'),
    ],
  }
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

// ===========================================================================
// the mock bridge + the boot harness (the broadcast-host convention)
// ===========================================================================
/** A fake `ProvidentBridge` with vi.fn() spies + controllable state. The `edit`
 *  namespace carries the NEW `commitRich` (U5) the rich blur commits through. */
function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  operatorSettings?: OperatorSettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? { nodes: [], edges: [] },
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' },
  }
  const bridge = {
    security: {
      get: vi.fn(async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch'] })),
    },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      commitRich: vi.fn(async (): Promise<{ ok: true; nodeId: string; node: unknown }> => ({ ok: true, nodeId: 's1', node: {} })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 })),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
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
  operatorMount: unknown
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  state: ReturnType<typeof makeBridge>['state']
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
  sidebar: Record<string, unknown>
}

function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  operatorSettings?: OperatorSettings
} = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, state } = makeBridge(opts)
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
    (globalThis as unknown as { window: { provident: { sidebar: Harness['sidebar'] } } }).window.provident.sidebar as unknown as Harness['sidebar']
  return {
    host,
    runtime,
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

/** Await the re-derive that `onRebuild` (the host's `reDerive`) triggered. */
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

/** The host's private U4 fields + methods, accessed through an any-cast (the
 *  U1 convention — a RED method call throws "is not a function" until the
 *  Implementer adds it). */
function priv(h: Harness): {
  editingMode: EditingMode
  composingRagId: string | null
  pendingCommitRagId: string | null
  committingRagIds: Set<string>
  caretNodes: Set<string>
  editorInput(ragId: string): void
  editorBlur(ragId: string, html: string): void
  editorCompositionStart(ragId: string): void
  editorCompositionEnd(ragId: string): void
  restoreRichCaret(ragId: string, caret: { kind: 'rich'; ragId: string; anchor: { path: number[]; offset: number }; focus: { path: number[]; offset: number }; focused: boolean }): void
} {
  return h.host as unknown as {
    editingMode: EditingMode
    composingRagId: string | null
    pendingCommitRagId: string | null
    committingRagIds: Set<string>
    caretNodes: Set<string>
    editorInput(ragId: string): void
    editorBlur(ragId: string, html: string): void
    editorCompositionStart(ragId: string): void
    editorCompositionEnd(ragId: string): void
    restoreRichCaret(ragId: string, caret: { kind: 'rich'; ragId: string; anchor: { path: number[]; offset: number }; focus: { path: number[]; offset: number }; focused: boolean }): void
  }
}

/** Spy the pure `decomposeRichHtml` seam (U2) via the live module binding — the
 *  host's `editorBlurCommit` reads it through the named import, so the spy
 *  intercepts. Returns the spy. */
function spyDecompose() {
  return vi.spyOn(richDecomposeModule, 'decomposeRichHtml')
}

// Restore every vi.spyOn (the decomposeRichHtml seam, the saveCaret /
// restoreRichCaret / clearDirty host spies) after each test so a fresh spy is
// created per test and no mock leaks into the next test.
afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// envelope-inspection helpers (the rich-splice convention) — for the §1.3
// applyEditingMode handler-attachment tests
// ===========================================================================
function traversalEnv(nodes: RagSnapshotPayload['nodes'], edges: RagSnapshotPayload['edges']): LegacyInitialData {
  const store = { listNodes: () => nodes, listEdges: () => edges } as never
  return buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' }).envelope
}

interface RagRoot { ragId: string; root: LegacyNodeData }

function ragRoots(env: LegacyInitialData): RagRoot[] {
  const out: RagRoot[] = []
  const walk = (n: LegacyNodeData): void => {
    const pid = n.props?.id
    if (typeof pid === 'string' && pid.startsWith('rag-')) {
      out.push({ ragId: pid.slice(4), root: n })
    }
    for (const c of n.children ?? []) walk(c as LegacyNodeData)
  }
  for (const p of env.content ?? []) walk(p.content[0] as LegacyNodeData)
  return out
}

function rootsFor(env: LegacyInitialData, ragId: string): RagRoot[] {
  return ragRoots(env).filter((r) => r.ragId === ragId)
}

function hasTextarea(root: LegacyNodeData, ragId: string): boolean {
  return (root.children ?? []).some((c) => (c as LegacyNodeData).props?.id === `textarea-${ragId}`)
}

/** The 4 pinned name-referenced handler defs (U4 §1.3). */
const RAG_EDITOR_HANDLERS = [
  { name: 'rag-editor-input', event: 'input' },
  { name: 'rag-editor-blur', event: 'blur' },
  { name: 'rag-editor-compositionstart', event: 'compositionstart' },
  { name: 'rag-editor-compositionend', event: 'compositionend' },
]

/** The rich-splice makeHarness (no boot) + drive `loadAppGraph` with the host's
 *  `editingMode` field INJECTED; capture the POST-SPLICE assembled envelope. */
function spliceHarness() {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  const host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: {
      edit: { commit: vi.fn(), onRagStoreChanged: vi.fn(() => () => {}) },
    } as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  const spliceEnvelope = (traversalEnvelope: LegacyInitialData, editingMode: EditingMode): LegacyInitialData => {
    ;(host as unknown as { editingMode: EditingMode }).editingMode = editingMode
    const spy = vi.spyOn(runtime, 'loadEnvelope')
    host.loadAppGraph(runtime, traversalEnvelope)
    const env = spy.mock.calls[0][0] as LegacyInitialData
    spy.mockRestore()
    return env
  }
  return { host, runtime, registry, backRefs, editController, spliceEnvelope }
}

// ===========================================================================
// §3 CENSUS — the 4 handler defs + the 4 bridge methods + the 4 host methods
// + the 3 host fields
// ===========================================================================
describe('census (§3)', () => {
  it('the 4 rich handler defs (rag-editor-input/blur/compositionstart/compositionend) are registered by bindHandlers with function-string bodies', () => {
    const h = makeHarness()
    h.host.bindHandlers()
    for (const name of ['rag-editor-input', 'rag-editor-blur', 'rag-editor-compositionstart', 'rag-editor-compositionend']) {
      const def = handlerDef(name)
      // RED — the defs are not registered yet → handlerDef returns undefined.
      expect(def).toBeDefined()
      expect(typeof def!.body).toBe('string')
      // The full function-expression form is compileHandlerBody-compatible.
      expect(() => compileHandlerBody(String(def!.body))).not.toThrow()
    }
  })

  it('SidebarPanes.prototype exposes the 4 new host methods', () => {
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    // RED — none of these exist yet.
    for (const m of ['editorInput', 'editorBlur', 'editorCompositionStart', 'editorCompositionEnd']) {
      expect(proto).toContain(m)
    }
  })

  it('the window.provident.sidebar surface exposes the 4 rich bridge methods', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // RED — installSidebarBridge does not add these yet → undefined.
    for (const m of ['editorInput', 'editorBlur', 'editorCompositionStart', 'editorCompositionEnd']) {
      expect(typeof h.sidebar[m]).toBe('function')
    }
  })

  it('the host carries the 3 composition-guard + commit-latch fields (composingRagId, pendingCommitRagId, committingRagIds)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // RED — the fields are absent → undefined / the Set does not exist.
    expect(priv(h).composingRagId).toBeNull()
    expect(priv(h).pendingCommitRagId).toBeNull()
    expect(priv(h).committingRagIds).toBeInstanceOf(Set)
  })
})

// ===========================================================================
// §1.3 — the handler bodies (states 9-13)
// ===========================================================================
describe('the 4 rich handler bodies (§1.3, §2.1 states 9-13)', () => {
  /** Execute a registered rich handler body with a mock ctx + a mock
   *  window.provident.sidebar capturing bridge calls. */
  function runRichBody(name: string, ctx: { node?: { props?: Record<string, unknown> } }, htmlArg?: unknown): { calls: Array<{ fn: string; args: unknown[] }> } {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef(name)
    expect(def).toBeDefined() // RED — not registered yet
    const calls: Array<{ fn: string; args: unknown[] }> = []
    const fakeWindow = {
      provident: {
        sidebar: {
          editorInput: (ragId: string) => calls.push({ fn: 'editorInput', args: [ragId] }),
          editorBlur: (ragId: string, html: string) => calls.push({ fn: 'editorBlur', args: [ragId, html] }),
          editorCompositionStart: (ragId: string) => calls.push({ fn: 'editorCompositionStart', args: [ragId] }),
          editorCompositionEnd: (ragId: string) => calls.push({ fn: 'editorCompositionEnd', args: [ragId] }),
        },
      },
    }
    ;(globalThis as unknown as { window?: unknown }).window = fakeWindow
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown, html?: unknown) => void
    fn(ctx as never, htmlArg)
    return { calls }
  }

  it('state 9 — rag-editor-input resolves the ragId from data-rag-node-id + calls sidebar.editorInput(ragId)', () => {
    const { calls } = runRichBody('rag-editor-input', { node: { props: { 'data-rag-node-id': 's1' } } })
    expect(calls).toEqual([{ fn: 'editorInput', args: ['s1'] }])
  })

  it('state 10 — rag-editor-blur WITH a dispatch-provided html arg (MCP path) calls sidebar.editorBlur(ragId, html) with that html (the DOM is NOT read)', () => {
    const { calls } = runRichBody('rag-editor-blur', { node: { props: { 'data-rag-node-id': 's1' } } }, '<p>mcp html</p>')
    expect(calls).toEqual([{ fn: 'editorBlur', args: ['s1', '<p>mcp html</p>'] }])
  })

  it('state 11 — rag-editor-blur WITHOUT an html arg (UI path) reads document.getElementById(\'rag-<id>\').innerHTML + calls sidebar.editorBlur(ragId, html)', () => {
    const h = makeHarness()
    // The dom-shim auto-creates an empty rag-s1 → innerHTML ''. Set it so the
    // UI-path read is observable.
    const el = document.getElementById('rag-s1')
    el.textContent = 'ui html'
    const def = handlerDef('rag-editor-blur')
    expect(def).toBeDefined() // RED
    const calls: Array<{ fn: string; args: unknown[] }> = []
    const fakeWindow = { provident: { sidebar: { editorBlur: (ragId: string, html: string) => calls.push({ fn: 'editorBlur', args: [ragId, html] }) } } }
    ;(globalThis as unknown as { window?: unknown }).window = fakeWindow
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown) => void
    fn({ node: { props: { 'data-rag-node-id': 's1' } } } as never)
    expect(calls).toEqual([{ fn: 'editorBlur', args: ['s1', 'ui html'] }])
  })

  it('state 12 — rag-editor-compositionstart calls sidebar.editorCompositionStart(ragId)', () => {
    const { calls } = runRichBody('rag-editor-compositionstart', { node: { props: { 'data-rag-node-id': 's1' } } })
    expect(calls).toEqual([{ fn: 'editorCompositionStart', args: ['s1'] }])
  })

  it('state 13 — rag-editor-compositionend calls sidebar.editorCompositionEnd(ragId)', () => {
    const { calls } = runRichBody('rag-editor-compositionend', { node: { props: { 'data-rag-node-id': 's1' } } })
    expect(calls).toEqual([{ fn: 'editorCompositionEnd', args: ['s1'] }])
  })
})

// ===========================================================================
// §1.3 — applyEditingMode handler attachment (states 14-16 + idempotence)
// ===========================================================================
describe('applyEditingMode — the 4 handler defs attached to eligible roots (§1.3, §2.1 states 14-16)', () => {
  const { nodes, edges } = singleSectionSnapshot()

  it('state 14 — an eligible root in contenteditable mode gains EXACTLY the 4 rag-editor-* handlers + contenteditable:true + the textarea removed', () => {
    const { spliceEnvelope } = spliceHarness()
    const env = spliceEnvelope(traversalEnv(nodes, edges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    expect(s1).toBeDefined()
    expect(hasTextarea(s1.root, 's1')).toBe(false)
    expect((s1.root.props as Record<string, unknown>)['contenteditable']).toBe(true)
    // RED — applyEditingMode does not attach handlers yet → s1.root.handlers is undefined.
    expect(s1.root.handlers).toEqual(RAG_EDITOR_HANDLERS)
  })

  it('state 15 — an ineligible root keeps its textarea + NO rag-editor-* handlers are attached', () => {
    const { spliceEnvelope } = spliceHarness()
    const { nodes: inNodes, edges: inEdges } = ((): { nodes: RagSnapshotPayload['nodes']; edges: RagSnapshotPayload['edges'] } => {
      const n = [makeNode('doc', { type: 'h1', content: 'Doc' }), makeNode('s1', { type: 'ul', content: 'list' })]
      const e = [makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }), makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] })]
      return { nodes: n, edges: e }
    })()
    const env = spliceEnvelope(traversalEnv(inNodes, inEdges), 'contenteditable')
    const [s1] = rootsFor(env, 's1')
    expect(hasTextarea(s1.root, 's1')).toBe(true)
    const names = (s1.root.handlers ?? []).map((x) => (x as { name: string }).name)
    expect(names).not.toContain('rag-editor-input')
    expect(names).not.toContain('rag-editor-blur')
  })

  it('state 16 — editingMode === \'textarea\' → NO handler attachment, no splice (no-op)', () => {
    const { spliceEnvelope } = spliceHarness()
    const env = spliceEnvelope(traversalEnv(nodes, edges), 'textarea')
    const [s1] = rootsFor(env, 's1')
    expect(hasTextarea(s1.root, 's1')).toBe(true)
    expect((s1.root.props as Record<string, unknown>)['contenteditable']).toBeUndefined()
    expect(s1.root.handlers).toBeUndefined()
  })

  it('idempotence (mirrors U3 H4) — a repeated splice sets the SAME 4-def array (no duplicate handler accumulation, no throw)', () => {
    const { spliceEnvelope } = spliceHarness()
    const env1 = spliceEnvelope(traversalEnv(nodes, edges), 'contenteditable')
    const env2 = spliceEnvelope(traversalEnv(nodes, edges), 'contenteditable')
    const [a] = rootsFor(env1, 's1')
    const [b] = rootsFor(env2, 's1')
    expect(a.root.handlers).toEqual(RAG_EDITOR_HANDLERS)
    expect(b.root.handlers).toEqual(RAG_EDITOR_HANDLERS)
    expect(b.root.handlers).toHaveLength(4)
  })
})

// ===========================================================================
// §1.4 — editorInput marks dirty + the dirty-edit guard queues a re-derive
// ===========================================================================
describe('editorInput marks dirty (§1.4, §2.1 states 17-18)', () => {
  it('state 17 — editorInput(ragId) → editController.markDirty(ragId) → isDirty true', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // RED — editorInput does not exist yet → throws "is not a function".
    expect(() => priv(h).editorInput('s1')).not.toThrow()
    expect(h.editController.isDirty('s1')).toBe(true)
  })

  it('state 18 — a re-derive (rag-store-changed) while the contenteditable is dirty is QUEUED (the dirty-edit guard — the in-progress edit is never destroyed)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    priv(h).editorInput('s1') // dirty
    h.host.onRagStoreChanged({ kind: 'content', nodeIds: ['s1'], edgeIds: [] })
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// §1.4/§1.6 — the rich blur: caret save + decompose ONCE + commit ONCE
// ===========================================================================
describe('editorBlur — decompose ONCE + commit ONCE (§1.4, §2.1 states 19-23)', () => {
  it('state 20/23 — a real dirty blur captures+saves the rich caret, calls decomposeRichHtml EXACTLY ONCE, and calls bridge.edit.commitRich EXACTLY ONCE with the decomposed {content, children}', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: 'hello', children: [] })
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    h.editController.markDirty('s1')
    // RED — editorBlur does not exist yet → throws.
    expect(() => priv(h).editorBlur('s1', '<p>hello</p>')).not.toThrow()
    // decompose ONCE with the exact html.
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(decompose).toHaveBeenCalledWith('<p>hello</p>')
    // commitRich ONCE with the decomposed {content, children} (not a split setContent+setSubtree).
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledWith('s1', 'hello', [])
    // the rich caret was saved (focused:true — H3: only a real edit re-focuses).
    expect(saveCaret).toHaveBeenCalledWith('s1', {
      kind: 'rich', ragId: 's1',
      anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 },
      focused: true,
    })
    // the node was added to caretNodes for the re-derive restore.
    expect(priv(h).caretNodes.has('s1')).toBe(true)
    // the commit settles → the dirty flag is cleared.
    await vi.waitFor(() => expect(h.editController.isDirty('s1')).toBe(false))
    decompose.mockRestore()
    saveCaret.mockRestore()
  })

  it('state 19 — a NO-OP (non-dirty) blur saves the rich caret with focused:false, adds the node to caretNodes, and sends NO commit / NO IPC', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose()
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    priv(h).editorBlur('s1', '<p>hello</p>') // NOT dirty
    expect(saveCaret).toHaveBeenCalledWith('s1', {
      kind: 'rich', ragId: 's1',
      anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 },
      focused: false, // H3 / ADR-12 — a no-op blur must NOT re-focus
    })
    expect(priv(h).caretNodes.has('s1')).toBe(true)
    expect(decompose).not.toHaveBeenCalled()
    expect(h.bridge.edit.commitRich).not.toHaveBeenCalled()
    saveCaret.mockRestore()
  })

  it('state 21 — commit success ({ ok:true }) → clearDirty (which may trigger a queued rebuild)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.editController.markDirty('s1')
    h.editController.requestRebuild() // queue a rebuild behind the edit
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    const clearDirty = vi.spyOn(h.editController, 'clearDirty')
    priv(h).editorBlur('s1', '<p>x</p>')
    await vi.waitFor(() => expect(clearDirty).toHaveBeenCalledWith('s1'))
    // The queued rebuild ran once the dirty flag cleared (H3 H5/L6).
    await vi.waitFor(() => expect(h.editController.hasQueuedRebuild()).toBe(false))
    expect(h.editController.isDirty('s1')).toBe(false)
    clearDirty.mockRestore()
  })

  it('state 22 — commit { ok:false, reason:\'deleted-node\' } → dirty cleared (H5 — the node is gone, the edit is unrecoverable)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.bridge.edit.commitRich.mockResolvedValueOnce({ ok: false, reason: 'deleted-node' })
    h.editController.markDirty('s1')
    priv(h).editorBlur('s1', '<p>x</p>')
    await vi.waitFor(() => expect(h.editController.isDirty('s1')).toBe(false))
  })

  it('state 23 — decompose is NEVER called in the handler body and NEVER twice (the host calls it ONCE, not in the handler)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: 'hello', children: [] })
    h.editController.markDirty('s1')
    priv(h).editorBlur('s1', '<p>hello</p>')
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    decompose.mockRestore()
  })
})

// ===========================================================================
// §2.2 fail-states — decompose error, store-error, rejected commit, no-op no IPC
// ===========================================================================
describe('editorBlur — fail-states (§2.2 states 1/2/9/16)', () => {
  it('fail-state 1 — a decomposeRichHtml { ok:false } → NO commit (data preserved); the dirty flag is NOT cleared', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: false, error: 'decomposeRichHtml: input must be a string' })
    h.editController.markDirty('s1')
    expect(() => priv(h).editorBlur('s1', '<p>x</p>')).not.toThrow()
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).not.toHaveBeenCalled() // NO commit → the in-DOM content is preserved
    expect(h.editController.isDirty('s1')).toBe(true) // the edit is not lost — a later blur may retry
    decompose.mockRestore()
  })

  it('fail-state 2 — commit { ok:false, reason:\'store-error\' } → the dirty flag STAYS (the edit is not lost; the guard keeps queuing)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.bridge.edit.commitRich.mockResolvedValueOnce({ ok: false, reason: 'store-error', error: 'boom' })
    h.editController.markDirty('s1')
    priv(h).editorBlur('s1', '<p>x</p>')
    await Promise.resolve()
    await Promise.resolve()
    expect(h.editController.isDirty('s1')).toBe(true)
  })

  it('fail-state 9 — a no-op (non-dirty) blur sends NO commitRich and NO IPC', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose()
    priv(h).editorBlur('s1', '<p>hello</p>')
    expect(h.bridge.edit.commitRich).not.toHaveBeenCalled()
  })

  it('fail-state 16 — a REJECTED commitRich promise is CAUGHT (no unhandled rejection), the dirty flag STAYS, and the error is logged (ADR-4, mirroring the operatorSet .catch)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.bridge.edit.commitRich.mockRejectedValueOnce(new Error('boom'))
    h.editController.markDirty('s1')
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let unhandled: unknown = null
    const onUnhandled = (reason: unknown): void => { unhandled = reason }
    process.on('unhandledRejection', onUnhandled)
    try {
      priv(h).editorBlur('s1', '<p>x</p>')
      // Let the rejected promise + the editorBlurCommit .catch run to completion.
      await Promise.resolve()
      await Promise.resolve()
      expect(errSpy).toHaveBeenCalledWith('[sidebar-panes] rich commit failed', expect.any(Error))
      expect(unhandled).toBeNull() // caught — never an unhandled rejection
      expect(h.editController.isDirty('s1')).toBe(true) // ADR-4 — the dirty flag stays (the edit is retryable)
    } finally {
      process.off('unhandledRejection', onUnhandled)
      errSpy.mockRestore()
    }
  })

  it('fail-state 16b — a rejected commitRich releases the commit-in-flight latch in .finally (the node may retry on a later blur)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.bridge.edit.commitRich.mockRejectedValueOnce(new Error('boom'))
    h.editController.markDirty('s1')
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      priv(h).editorBlur('s1', '<p>x</p>')
      await Promise.resolve()
      await Promise.resolve()
      // The latch was released after the rejection settled.
      expect(priv(h).committingRagIds.has('s1')).toBe(false)
    } finally {
      errSpy.mockRestore()
    }
  })
})

// ===========================================================================
// §1.4 — the composition guard (states 24-28 + fail-states 4/5)
// ===========================================================================
describe('the composition guard (decision H, §2.1 states 24-28)', () => {
  it('state 24 — compositionstart sets composingRagId; a dirty blur DURING composition is DEFERRED (no decompose, no commit; pendingCommitRagId set; caret still captured+saved)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    const saveCaret = vi.spyOn(h.editController, 'saveCaret')
    h.editController.markDirty('s1')
    priv(h).editorCompositionStart('s1')
    expect(priv(h).composingRagId).toBe('s1')
    priv(h).editorBlur('s1', '<p>a</p>')
    // The blur was DEFERRED — the caret was captured+saved (the selection survives)…
    expect(saveCaret).toHaveBeenCalledWith('s1', expect.objectContaining({ kind: 'rich', focused: true }))
    // …but NO decompose / NO commit; pendingCommitRagId set.
    expect(priv(h).pendingCommitRagId).toBe('s1')
    expect(decompose).not.toHaveBeenCalled()
    expect(h.bridge.edit.commitRich).not.toHaveBeenCalled()
    saveCaret.mockRestore()
    decompose.mockRestore()
  })

  it('state 25 — compositionend clears composingRagId and runs the deferred commit ONCE (decompose ONCE + commitRich ONCE with the current rag-<id>.innerHTML), then clears pendingCommitRagId', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: 'deferred', children: [] })
    h.editController.markDirty('s1')
    priv(h).editorCompositionStart('s1')
    priv(h).editorBlur('s1', '<p>a</p>') // deferred
    expect(decompose).not.toHaveBeenCalled()
    priv(h).editorCompositionEnd('s1')
    expect(priv(h).composingRagId).toBeNull()
    expect(priv(h).pendingCommitRagId).toBeNull()
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    // The deferred commit decomposes the CURRENT rag-<id>.innerHTML ('' under the dom-shim).
    expect(decompose).toHaveBeenCalledWith('')
    decompose.mockRestore()
  })

  it('state 26 — compositionend for a node that is NOT composing / NOT pending clears nothing and runs nothing (the ragId-keyed guard)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    h.editController.markDirty('s1')
    priv(h).editorCompositionStart('s1')
    priv(h).editorBlur('s1', '<p>a</p>') // deferred for s1
    // A spurious compositionend for a DIFFERENT ragId clears/consumes nothing.
    priv(h).editorCompositionEnd('s2')
    expect(priv(h).composingRagId).toBe('s1') // NOT cleared
    expect(priv(h).pendingCommitRagId).toBe('s1') // NOT consumed
    expect(decompose).not.toHaveBeenCalled()
    expect(h.bridge.edit.commitRich).not.toHaveBeenCalled()
    // The composing node's own end runs the deferred commit once.
    priv(h).editorCompositionEnd('s1')
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    decompose.mockRestore()
  })

  it('state 27 — the commit-in-flight latch (ADR-1): a deferred blur on compositionend latches the ragId; a later racing blur re-enters editorBlurCommit and is SUPPRESSED → decompose/commitRich fire EXACTLY ONCE', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    // The commit stays in flight (unresolved) so the latch is held.
    let resolveCommit!: (v: unknown) => void
    const deferred = new Promise((res) => { resolveCommit = res })
    h.bridge.edit.commitRich.mockClear() // clear call history, KEEP the default resolved impl
    h.bridge.edit.commitRich.mockReturnValueOnce(deferred as never)
    h.editController.markDirty('s1')
    priv(h).editorCompositionStart('s1')
    priv(h).editorBlur('s1', '<p>a</p>') // deferred
    priv(h).editorCompositionEnd('s1') // runs the deferred commit → latch set, in-flight
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    expect(decompose).toHaveBeenCalledTimes(1)
    // A racing blur before the deferred commit settles (dirty still true, composing
    // null, pending cleared) re-enters editorBlurCommit → the latch returns early.
    priv(h).editorBlur('s1', '<p>b</p>')
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1) // NO second commit
    expect(decompose).toHaveBeenCalledTimes(1) // NO second decompose
    // Settle the in-flight commit → the latch releases + dirty clears.
    resolveCommit({ ok: true, nodeId: 's1', node: {} })
    await Promise.resolve()
    await Promise.resolve()
    expect(priv(h).committingRagIds.has('s1')).toBe(false)
    expect(h.editController.isDirty('s1')).toBe(false)
    decompose.mockRestore()
  })

  it('state 28 — a re-derive during composition is QUEUED (the node is dirty — the composition is never torn down mid-IME)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    priv(h).editorCompositionStart('s1')
    h.editController.markDirty('s1')
    h.host.onRagStoreChanged({ kind: 'content', nodeIds: ['s1'], edgeIds: [] })
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// §1.8 / §2.2 fail-state 10 — the first-materialization limitation (decision I)
// ===========================================================================
describe('the first-materialization limitation (§1.8, §2.2 fail-state 10, ADR-3)', () => {
  it('a multi-parent duplicate: the blur commits the FIRST materialization\'s {content, children} EXACTLY ONCE; the other N-1 duplicates are NOT committed on this blur', async () => {
    const h = makeHarness({ snapshot: multiParentSnapshot() })
    await h.host.boot(h.runtime)
    const decompose = spyDecompose().mockReturnValue({
      ok: true, content: 'FIRST materialization', children: [{ type: 'strong', content: 'first' }],
    })
    h.editController.markDirty('dup')
    // The dom-shim's getElementById returns the FIRST (only) rag-dup element — so
    // the first-materialization read is by construction. Drive the blur with the
    // first materialization's html.
    priv(h).editorBlur('dup', '<p>first materialization</p>')
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(decompose).toHaveBeenCalledWith('<p>first materialization</p>')
    // EXACTLY ONE commitRich with the FIRST materialization's decomposed content.
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledWith('dup', 'FIRST materialization', [{ type: 'strong', content: 'first' }])
    decompose.mockRestore()
  })
})

// ===========================================================================
// §1.7 — the gated re-derive caret restore (states 29-34, fail-state 7)
// ===========================================================================
describe('the gated re-derive caret restore (§1.7, §2.1 states 29-34)', () => {
  it('state 29 — a rich caret is restored into a contenteditable root (editingMode contenteditable + the contenteditable attribute): restoreRichCaret is called + the node is removed one-shot', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    p.editingMode = 'contenteditable'
    // The rendered root carries the contenteditable attribute (what applyEditingMode authors).
    document.getElementById('rag-s1').setAttribute('contenteditable', 'true')
    h.editController.saveCaret('s1', { kind: 'rich', ragId: 's1', anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 }, focused: true })
    p.caretNodes.add('s1')
    const restoreSpy = vi.spyOn(p as unknown as object, 'restoreRichCaret')
    await h.host.reDerive()
    // The gate passed → restoreRichCaret was called with the saved rich caret.
    expect(restoreSpy).toHaveBeenCalledWith('s1', expect.objectContaining({ kind: 'rich', ragId: 's1' }))
    // ONE-SHOT (H2) — the node is removed after the restore.
    expect(p.caretNodes.has('s1')).toBe(false)
    restoreSpy.mockRestore()
  })

  it('state 30 — a textarea caret is restored into a textarea (selectionStart/selectionEnd set to offset)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime) // textarea default mode
    const p = priv(h)
    h.editController.saveCaret('s1', { kind: 'textarea', offset: 3, focused: true })
    p.caretNodes.add('s1')
    await h.host.reDerive()
    const el = document.getElementById('textarea-s1') as unknown as { selectionStart: number; selectionEnd: number }
    expect(el.selectionStart).toBe(3)
    expect(el.selectionEnd).toBe(3)
    expect(p.caretNodes.has('s1')).toBe(false) // one-shot
  })

  it('state 31 — a rich caret after a contenteditable→textarea toggle is DROPPED (the rag-<id> element STILL EXISTS, but the gate is NOT element presence): restoreRichCaret NOT called, node removed one-shot', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    p.editingMode = 'textarea' // the mode toggled contenteditable→textarea
    // The rag-<id> element STILL EXISTS (authored by the traversal in BOTH modes).
    const root = document.getElementById('rag-s1')
    expect(root).toBeTruthy() // element presence must NOT gate the restore
    // The splice no-ops in textarea mode → the root does NOT carry contenteditable.
    h.editController.saveCaret('s1', { kind: 'rich', ragId: 's1', anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 }, focused: true })
    p.caretNodes.add('s1')
    const restoreSpy = vi.spyOn(p as unknown as object, 'restoreRichCaret')
    await h.host.reDerive()
    // The rich caret is DROPPED — never applied to the (now textarea) control (amendment 4 / U3 F2 / ADR-8).
    expect(restoreSpy).not.toHaveBeenCalled()
    expect(p.caretNodes.has('s1')).toBe(false) // one-shot even on a dropped restore
    restoreSpy.mockRestore()
  })

  it('state 32 — a textarea caret into a node that now renders contenteditable is DROPPED (the textarea-<id> element is ABSENT): no restore, one-shot', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    p.editingMode = 'contenteditable'
    // In contenteditable mode the splice removes the textarea → getElementById returns null.
    const doc = globalThis.document as unknown as { getElementById(id: string): unknown }
    const orig = doc.getElementById.bind(doc)
    ;(doc as { getElementById(id: string): unknown }).getElementById = (id: string) => (id.startsWith('textarea-') ? null : orig(id))
    try {
      h.editController.saveCaret('s1', { kind: 'textarea', offset: 2, focused: true })
      p.caretNodes.add('s1')
      await expect(h.host.reDerive()).resolves.toBeUndefined()
      // The textarea caret is DROPPED (no textarea-<id> element → no restore) + one-shot.
      expect(p.caretNodes.has('s1')).toBe(false)
    } finally {
      ;(doc as { getElementById(id: string): unknown }).getElementById = orig
    }
  })

  it('state 33 — ONE-SHOT restore (H2): after a successful restore the node is removed from caretNodes — only the re-derive immediately following the edit re-focuses', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    p.editingMode = 'contenteditable'
    document.getElementById('rag-s1').setAttribute('contenteditable', 'true')
    h.editController.saveCaret('s1', { kind: 'rich', ragId: 's1', anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 }, focused: true })
    p.caretNodes.add('s1')
    await h.host.reDerive()
    expect(p.caretNodes.has('s1')).toBe(false)
    // A SECOND re-derive finds nothing to restore (the node was already consumed).
    const restoreSpy = vi.spyOn(p as unknown as object, 'restoreRichCaret')
    await h.host.reDerive()
    expect(restoreSpy).not.toHaveBeenCalled()
    restoreSpy.mockRestore()
  })

  it('state 34 — a dangling back-reference → restoreCaret returns undefined → the stale caret is cleared + no restore (A4/L5)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    // 'ghost' is NOT in backRefs (a deleted node) → restoreCaret returns undefined.
    h.editController.saveCaret('ghost', { kind: 'rich', ragId: 'ghost', anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 }, focused: true })
    p.caretNodes.add('ghost')
    await h.host.reDerive()
    expect(p.caretNodes.has('ghost')).toBe(false) // removed
    expect(h.editController.restoreCaret('ghost')).toBeUndefined() // the stale caret was cleared
  })

  it('fail-state 7 — a kind mismatch in BOTH directions is never misapplied (rich→textarea dropped, textarea→contenteditable dropped)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const p = priv(h)
    // Direction 1: rich caret + textarea mode → dropped (already asserted in state 31).
    p.editingMode = 'textarea'
    h.editController.saveCaret('s1', { kind: 'rich', ragId: 's1', anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 }, focused: true })
    p.caretNodes.add('s1')
    const restoreRichSpy = vi.spyOn(p as unknown as object, 'restoreRichCaret')
    await h.host.reDerive()
    expect(restoreRichSpy).not.toHaveBeenCalled()
    expect(p.caretNodes.has('s1')).toBe(false)
    restoreRichSpy.mockRestore()
    // Direction 2: textarea caret + contenteditable mode → dropped (no textarea element).
    p.editingMode = 'contenteditable'
    const doc = globalThis.document as unknown as { getElementById(id: string): unknown }
    const orig = doc.getElementById.bind(doc)
    ;(doc as { getElementById(id: string): unknown }).getElementById = (id: string) => (id.startsWith('textarea-') ? null : orig(id))
    try {
      h.editController.saveCaret('s1', { kind: 'textarea', offset: 1, focused: true })
      p.caretNodes.add('s1')
      await h.host.reDerive()
      expect(p.caretNodes.has('s1')).toBe(false) // dropped, one-shot
    } finally {
      ;(doc as { getElementById(id: string): unknown }).getElementById = orig
    }
  })
})

// ===========================================================================
// §1.6/§1.7 — the dom-shim shim-absence no-throw contract (ADR-13, fail-state 17)
// ===========================================================================
describe('the dom-shim no-throw contract (ADR-13, §2.2 fail-state 17)', () => {
  it('the dom-shim supplies NEITHER window.getSelection NOR document.createRange — a blur + re-derive round-trip completes WITHOUT throwing', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // The dom-shim supplies neither.
    expect(typeof (globalThis as unknown as { window: { getSelection?: unknown } }).window.getSelection).not.toBe('function')
    expect(typeof (globalThis as unknown as { document: { createRange?: unknown } }).document.createRange).not.toBe('function')
    const p = priv(h)
    // A blur under the shim (captureRichCaret sees no getSelection → the {path:[0],offset:0} fallback) never throws.
    h.editController.markDirty('s1')
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: '', children: [] })
    expect(() => p.editorBlur('s1', '<p>x</p>')).not.toThrow()
    // A re-derive round-trip with a saved rich caret (restoreRichCaret guards getSelection/createRange) never throws.
    h.editController.saveCaret('s1', { kind: 'rich', ragId: 's1', anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 }, focused: true })
    p.caretNodes.add('s1')
    await expect(h.host.reDerive()).resolves.toBeUndefined()
    decompose.mockRestore()
  })
})

// ===========================================================================
// §2.1 state 37 — the full end-to-end edit path
// ===========================================================================
describe('the full end-to-end edit path (§2.1 state 37)', () => {
  it('type → input (dirty) → blur (decompose ONCE + commitRich ONCE) → rag-store-changed → re-derive → rich-caret restore', async () => {
    const h = makeHarness({
      snapshot: singleSectionSnapshot(),
      operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' },
    })
    await h.host.boot(h.runtime)
    const p = priv(h)
    document.getElementById('rag-s1').setAttribute('contenteditable', 'true')
    const decompose = spyDecompose().mockReturnValue({ ok: true, content: 'hello', children: [] })
    // The user types → input marks dirty.
    h.sidebar.editorInput('s1')
    expect(h.editController.isDirty('s1')).toBe(true)
    // The user blurs → decompose ONCE + commitRich ONCE (the round-trip write-back).
    h.sidebar.editorBlur('s1', '<p>hello</p>')
    expect(decompose).toHaveBeenCalledTimes(1)
    expect(decompose).toHaveBeenCalledWith('<p>hello</p>')
    expect(h.bridge.edit.commitRich).toHaveBeenCalledTimes(1)
    expect(h.bridge.edit.commitRich).toHaveBeenCalledWith('s1', 'hello', [])
    // The commit settles → the dirty flag clears.
    await vi.waitFor(() => expect(h.editController.isDirty('s1')).toBe(false))
    // The store broadcasts → the re-derive re-renders + restores the saved rich caret.
    const restoreSpy = vi.spyOn(p as unknown as object, 'restoreRichCaret')
    h.host.onRagStoreChanged({ kind: 'content', nodeIds: ['s1'], edgeIds: [] })
    await awaitRebuild(h)
    expect(restoreSpy).toHaveBeenCalledWith('s1', expect.objectContaining({ kind: 'rich', ragId: 's1' }))
    expect(p.caretNodes.has('s1')).toBe(false) // one-shot — the selection survives the re-derive
    restoreSpy.mockRestore()
    decompose.mockRestore()
  })
})

// ===========================================================================
// Renderer-dependent (real DOM Selection/Range, real IME sequencing, real
// innerHTML multi-materialization) — documented, NOT runnable in node. The
// harness tests above pin the gating, decompose/commit ONCE, and no-throw
// contracts; these browser-only pieces are verified by code review / the e2e
// battery (the Unit L §5.8/§5.9 convention).
// ===========================================================================
describe.skip('renderer-dependent (verified by code review / the e2e battery — not node-testable)', () => {
  it.skip('state 35 — a saved offset beyond the re-rendered text node\'s length is CLAMPED on restore (real DOM createRange + a real text node)', () => {})
  it.skip('state 36 — for a multi-parent duplicate, the rich caret is restored into the FIRST rag-<id> in document order (real getElementById with N duplicates)', () => {})
  it.skip('the rich caret capture reads window.getSelection() against rag-<id>, never a textarea selectionStart (real DOM)', () => {})
  it.skip('a real IME composition sequence (compositionstart → input → blur → compositionend) defers the blur and commits ONCE at compositionend (real IME events)', () => {})
  it.skip('the rag-editor-* handlers are dispatchable via the MCP surface (the contenteditable is MCP-visible, §1.3)', () => {})
})
