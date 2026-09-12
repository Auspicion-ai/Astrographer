// tests/unit-u-parity-c19-hover-preview.test.ts — Wave-1 Unit U-PARITY-C19:
// the link hover-preview (C19 / G3)
// (docs/specs/unit-u-parity-c19-hover-preview.md §3 states 1-6 + §4 F1-F4;
// wave-1-open-decisions W1-Q10 RESOLVED).
//
// This is the TestWriter RED set. The behavior does NOT exist yet:
//   - there is NO hover-preview subtree / hover handler pair on any link node;
//   - there is NO shell 0.5 s dismissal controller (with re-hover cancel);
//   - `crosslinksContent` authors no popup and no hover target wiring;
//   - there is no pure content resolver (linked section vs document opening).
//
// Contract pinned by the spec + W1-Q10:
//   - hovering a crosslink shows a transient popup ABOVE the link with the
//     linked node's rendered section (or, for a document link, a summary/opening:
//     title + first N lines) — states 1/4;
//   - a provident `on:mouseover`/`on:mouseout` handler pair on each link
//     (app-graph, MCP-visible) — state 6;
//   - the 0.5 s post-leave dismissal is a SHELL timing mechanic (a helper) with
//     re-hover cancelling — states 2/3;
//   - a dangling link target → no popup / empty state, never a crash —
//     state 5 / F1;
//   - one popup at a time (replaced) — F2;
//   - a viewport-overflow flip is shell best-effort — F3;
//   - a non-crosslink anchor is untouched (only crosslink edges get the pair) —
//     F4.
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
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
import { crosslinksContent } from '../src/renderer/pane-graph.js'
import {
  HoverPreviewController,
  HOVER_PREVIEW_DELAY_MS,
  HOVER_PREVIEW_FIRST_LINES,
  HOVER_PREVIEW_ID,
  HOVER_PREVIEW_ENTER_HANDLER,
  HOVER_PREVIEW_LEAVE_HANDLER,
  resolveHoverPreview,
  hoverPreviewPopup,
  computeHoverPreviewPosition,
} from '../src/renderer/hover-preview.js'

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

function handlerWith(root: AnyNode, name: string, event: string): AnyNode | undefined {
  return walk(root).find((n) => (n.handlers ?? []).some((h) => h.name === name && h.event === event))
}

function textOf(root: AnyNode): string {
  return walk(root)
    .map((n) => (typeof n.content === 'string' ? n.content : ''))
    .filter((s) => s.length > 0)
    .join('\n')
}

// ===========================================================================
// the manual (injectable) shell timer
// ===========================================================================
function fakeTimers() {
  let now = 0
  let nextId = 1
  const tasks = new Map<number, { at: number; cb: () => void }>()
  return {
    api: {
      setTimeout(cb: () => void, ms: number): unknown {
        const id = nextId++
        tasks.set(id, { at: now + ms, cb })
        return id
      },
      clearTimeout(handle: unknown): void {
        tasks.delete(handle as number)
      },
    },
    advance(ms: number): void {
      now += ms
      for (const [id, t] of [...tasks].sort((a, b) => a[1].at - b[1].at)) {
        if (t.at <= now) {
          tasks.delete(id)
          t.cb()
        }
      }
    },
    pendingCount(): number {
      return tasks.size
    },
  }
}

// ===========================================================================
// state 1 — hovering a crosslink resolves the linked node's section
// ===========================================================================
describe('state 1 — the linked node section resolves + authors a popup', () => {
  it('resolveHoverPreview(node) → a section preview carrying the node content', () => {
    const preview = resolveHoverPreview('n2', {
      nodes: [{ id: 'n2', type: 'p', content: 'Section body text' }],
      docHeads: [],
    })
    expect(preview.kind).toBe('section')
    expect(preview.targetId).toBe('n2')
    expect(preview.lines.join('\n')).toContain('Section body text')
  })

  it('hoverPreviewPopup(author) → a popup node with the stable id + a handler pair ABOVE', () => {
    const preview = resolveHoverPreview('n2', {
      nodes: [{ id: 'n2', type: 'p', content: 'Section body text' }],
      docHeads: [],
    })
    const popup = hoverPreviewPopup(preview) as unknown as AnyNode
    expect(popup).not.toBeNull()
    expect(popup.props?.id).toBe(HOVER_PREVIEW_ID)
    expect(popup.props?.['data-position']).toBe('above')
    expect(popup.props?.['data-target']).toBe('n2')
    expect(popup.handlers?.some((h) => h.event === 'mouseover')).toBe(true)
    expect(popup.handlers?.some((h) => h.event === 'mouseout')).toBe(true)
    expect(textOf(popup)).toContain('Section body text')
  })

  it('crosslinksContent authors a mouseover/mouseout pair on the link + the popup for the active target', () => {
    const content = crosslinksContent(
      {
        crosslinks: [{ edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'n2' }],
        currentNodeId: 'n1',
        snapshot: { store: 'main', nodes: [{ id: 'n2', type: 'p', content: 'Section body text' }], edges: [] },
        docHeads: [],
      } as never,
      null,
      { hoverPreviewId: 'n2', hoverPreviewPosition: 'above' },
    ) as unknown as AnyNode
    const link = handlerWith(content, HOVER_PREVIEW_ENTER_HANDLER, 'mouseover')
    expect(link).toBeDefined()
    expect(link!.props?.['data-hover-target']).toBe('n2')
    expect((link!.handlers ?? []).some((h) => h.name === HOVER_PREVIEW_LEAVE_HANDLER && h.event === 'mouseout')).toBe(true)
    const popup = byId(content, HOVER_PREVIEW_ID)
    expect(popup).toBeDefined()
    expect(popup!.props?.['data-position']).toBe('above')
    expect(textOf(popup!)).toContain('Section body text')
  })
})

// ===========================================================================
// state 2 — mouseout keeps the popup for 0.5 s, then removes it
// ===========================================================================
describe('state 2 — the 0.5 s post-leave dismissal', () => {
  it('the delay constant is 500 ms', () => {
    expect(HOVER_PREVIEW_DELAY_MS).toBe(500)
  })

  it('leave() holds the preview for the delay, then clears it', () => {
    const t = fakeTimers()
    const c = new HoverPreviewController({ timers: t.api })
    c.enter('n2')
    expect(c.activeId).toBe('n2')
    c.leave()
    t.advance(HOVER_PREVIEW_DELAY_MS - 1)
    expect(c.activeId).toBe('n2')
    t.advance(1)
    expect(c.activeId).toBeNull()
  })
})

// ===========================================================================
// state 3 — entering the popup within the window cancels the dismissal
// ===========================================================================
describe('state 3 — enterPopup cancels the dismissal', () => {
  it('a re-hover within the window keeps the preview alive', () => {
    const t = fakeTimers()
    const c = new HoverPreviewController({ timers: t.api })
    c.enter('n2')
    c.leave()
    t.advance(250)
    c.enterPopup()
    t.advance(HOVER_PREVIEW_DELAY_MS * 4)
    expect(c.activeId).toBe('n2')
  })

  it('re-hovering the same link also cancels the dismissal', () => {
    const t = fakeTimers()
    const c = new HoverPreviewController({ timers: t.api })
    c.enter('n2')
    c.leave()
    t.advance(100)
    c.enter('n2')
    t.advance(HOVER_PREVIEW_DELAY_MS * 2)
    expect(c.activeId).toBe('n2')
  })
})

// ===========================================================================
// state 4 — a document link renders a summary/opening (title + first N lines)
// ===========================================================================
describe('state 4 — a document link resolves a bounded opening', () => {
  it('a doc-head target → kind document with the title + first N lines only', () => {
    const preview = resolveHoverPreview('doc-a', {
      nodes: [{ id: 'doc-a', type: 'div', content: 'l1\nl2\nl3\nl4\nl5' }],
      docHeads: [{ documentId: 'doc-a', title: 'Doc A' }],
    })
    expect(preview.kind).toBe('document')
    expect(preview.title).toBe('Doc A')
    expect(preview.lines).toHaveLength(HOVER_PREVIEW_FIRST_LINES)
    expect(preview.lines.join('\n')).not.toContain('l4')
  })

  it('the document popup renders the title + the bounded opening', () => {
    const preview = resolveHoverPreview('doc-a', {
      nodes: [{ id: 'doc-a', type: 'div', content: 'l1\nl2\nl3\nl4' }],
      docHeads: [{ documentId: 'doc-a', title: 'Doc A' }],
    })
    const popup = hoverPreviewPopup(preview) as unknown as AnyNode
    expect(popup.props?.['data-kind']).toBe('document')
    const text = textOf(popup)
    expect(text).toContain('Doc A')
    expect(text).toContain('l1')
    expect(text).not.toContain('l4')
  })
})

// ===========================================================================
// state 5 / F1 — a dangling target → no popup / empty state, never a crash
// ===========================================================================
describe('state 5 / F1 — a dangling target is empty, never a crash', () => {
  it('resolveHoverPreview(unknown) → kind empty', () => {
    const preview = resolveHoverPreview('ghost', { nodes: [], docHeads: [] })
    expect(preview.kind).toBe('empty')
  })

  it('hoverPreviewPopup(empty) → null (no popup authored)', () => {
    const preview = resolveHoverPreview('ghost', { nodes: [], docHeads: [] })
    expect(hoverPreviewPopup(preview)).toBeNull()
  })

  it('crosslinksContent with a dangling hover target authors no popup and never throws', () => {
    const content = crosslinksContent(
      {
        crosslinks: [{ edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'ghost' }],
        currentNodeId: 'n1',
        snapshot: { store: 'main', nodes: [], edges: [] },
        docHeads: null,
      } as never,
      null,
      { hoverPreviewId: 'ghost' },
    ) as unknown as AnyNode
    expect(byId(content, HOVER_PREVIEW_ID)).toBeUndefined()
  })
})

// ===========================================================================
// state 6 — the popup is app-graph (MCP-visible) while shown
// ===========================================================================
describe('state 6 — the popup is app-graph and dispatch-driven', () => {
  it('a dispatch mouseover on a link makes the popup node addressable in the live graph', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    const link = h.runtime
      .listTargets()
      .nodes.find((n) => n.content === 'sB1' && n.handlers.some((x) => x.name === HOVER_PREVIEW_ENTER_HANDLER))
    expect(link).toBeDefined()
    expect(link!.inTree).toBe(true)
    await h.runtime.dispatch({ target: { kind: 'nodeId', nodeId: link!.nodeId }, event: 'mouseover' })
    const targets = h.runtime.listTargets().nodes
    const popup = targets.find((n) => (n as { propsId?: string }).propsId === HOVER_PREVIEW_ID)
    expect(popup).toBeDefined()
    expect(popup!.inTree).toBe(true)
    // The popup is part of the rendered view while shown (state 6).
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain(HOVER_PREVIEW_ID)
  })
})

// ===========================================================================
// F2 — rapid hover across links → one popup at a time (replaced)
// ===========================================================================
describe('F2 — one popup at a time', () => {
  it('enter(b) after enter(a) replaces the active target', () => {
    const t = fakeTimers()
    const c = new HoverPreviewController({ timers: t.api })
    c.enter('a')
    c.enter('b')
    expect(c.activeId).toBe('b')
    expect(t.pendingCount()).toBe(0)
  })

  it('crosslinksContent authors exactly one popup for the active target', () => {
    const content = crosslinksContent(
      {
        crosslinks: [
          { edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'n2' },
          { edgeId: 'cl2', sourceRagNodeId: 'n1', targetRagNodeId: 'n3' },
        ],
        currentNodeId: 'n1',
        snapshot: {
          store: 'main',
          nodes: [
            { id: 'n2', type: 'p', content: 'two' },
            { id: 'n3', type: 'p', content: 'three' },
          ],
          edges: [],
        },
        docHeads: [],
      } as never,
      null,
      { hoverPreviewId: 'n3' },
    ) as unknown as AnyNode
    const popups = walk(content).filter((n) => n.props?.id === HOVER_PREVIEW_ID)
    expect(popups).toHaveLength(1)
    expect(popups[0].props?.['data-target']).toBe('n3')
  })
})

// ===========================================================================
// F3 — viewport overflow flips below (best effort)
// ===========================================================================
describe('F3 — overflow flips the popup below', () => {
  it('ample room above → above; cramped above → below', () => {
    expect(computeHoverPreviewPosition({ top: 300, height: 20 }, { width: 800, height: 600 }, 120)).toBe('above')
    expect(computeHoverPreviewPosition({ top: 40, height: 20 }, { width: 800, height: 600 }, 120)).toBe('below')
  })

  it('the position flows into the authored popup', () => {
    const preview = resolveHoverPreview('n2', { nodes: [{ id: 'n2', content: 'x' }], docHeads: [] })
    const popup = hoverPreviewPopup(preview, { position: 'below' }) as unknown as AnyNode
    expect(popup.props?.['data-position']).toBe('below')
  })
})

// ===========================================================================
// F4 — a non-crosslink node is untouched
// ===========================================================================
describe('F4 — only crosslink links carry the hover pair', () => {
  it('no crosslinks → no hover handler is authored', () => {
    const content = crosslinksContent(
      { crosslinks: [], currentNodeId: null, snapshot: null, docHeads: null } as never,
      null,
      { hoverPreviewId: 'n2' },
    ) as unknown as AnyNode
    expect(handlerWith(content, HOVER_PREVIEW_ENTER_HANDLER, 'mouseover')).toBeUndefined()
  })
})

// ===========================================================================
// the mock bridge + the boot harness (for state 6)
// ===========================================================================
const now = new Date().toISOString()

function makeNode(id: string, type: string, content: string): RagSnapshotPayload['nodes'][number] {
  return { id, type, content, ownedNodeIds: [], createdAt: now, updatedAt: now }
}

function makeEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  documentIds?: string[],
): RagSnapshotPayload['edges'][number] {
  return { id, kind, source, target, ...(documentIds ? { documentIds } : {}), createdAt: now, updatedAt: now }
}

/** docA (headA → sA1 → endA) + a crosslink sA1 → sB1 (docB's section). */
function crosslinkSnapshot(): RagSnapshotPayload {
  return {
    store: 'main',
    nodes: [
      makeNode('docA', 'div', 'doc A'),
      makeNode('headA', 'h1', 'Head A'),
      makeNode('sA1', 'p', 'Section A1'),
      makeNode('endA', 'p', 'End A'),
      makeNode('sB1', 'p', 'Section B1 target'),
    ],
    edges: [
      makeEdge('eA-head', 'doc-head', 'headA', 'docA', ['docA']),
      makeEdge('eA-n1', 'next-section', 'headA', 'sA1', ['docA']),
      makeEdge('eA-n2', 'next-section', 'sA1', 'endA', ['docA']),
      makeEdge('eA-end', 'doc-end', 'endA', 'docA', ['docA']),
      makeEdge('cl1', 'crosslink', 'sA1', 'sB1'),
    ],
  }
}

function makeBridge(snapshot: RagSnapshotPayload) {
  const state = {
    operatorSettings: {
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'textarea' as EditingMode,
    },
  }
  const bridge = {
    security: { get: async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: {
      commit: async () => ({ ok: true, nodeId: 'x' }),
      commitRich: async () => ({ ok: true, nodeId: 'x', node: {} }),
      onRagStoreChanged: () => () => {},
    },
    rag: {
      query: async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5, store: 'main' }),
      snapshot: async (): Promise<RagSnapshotPayload> => snapshot,
      backlinks: async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async (): Promise<RagDocHeadsPayload> => ({ documents: [] }),
      stores: async () => ({ stores: [] }),
    },
    template: {
      get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      create: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async (): Promise<OperatorSettings> => ({ ...state.operatorSettings }),
      set: async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      },
      onChanged: () => () => {},
    },
  }
  return bridge
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
  bridge: ReturnType<typeof makeBridge>
  backRefs: Map<string, string[]>
  editController: EditController
}

function makeHarness(): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const bridge = makeBridge(crosslinkSnapshot())
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: () => host.reDerive(),
  })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, registry, bridge, backRefs, editController }
}
