// tests/sidebar-panes-adversarial.test.ts — Unit H adversarial regression
// tests (docs/specs/unit-h-sidebar-panes.md §3a). Each finding is fixed in
// `src/` + regression-tested here:
//
//   H1 — the §5.3 data-flow helpers survive a null store/ctx
//        (`deriveDocNavDocuments`/`docNavContent` guard `ctx`/`ctx.snapshot`;
//        `crosslinksContent` guards `ctx.crosslinks`).
//   H2 — `assembleAppGraphEnvelope` throws the DOCUMENTED guard error (not a
//        raw TypeError) on a malformed traversal envelope with a null
//        `template` / `template.root`.
//   H3 — `crosslinksContent` coerce missing `crosslinkBacklinks`/
//        `crosslinkOutlinks` on a non-null but partial `result` (no
//        "not iterable" TypeError).
//   H4 — a throwing `onChanged` subscriber does not block later subscribers;
//        a subscriber unsubscribing mid-iteration does not skip its siblings.
//   H6 — `deriveDocNavDocuments`/`docNavContent` dedupe repeated `doc-head`
//        targets (first head wins) — no duplicate `data-document-id` `li`s.
import { describe, it, expect } from 'vitest'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { CrosslinkWiring } from '../src/main/traversal.js'
import type { BacklinkResult, LinkEntry } from '../src/main/backlinks.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition, type PaneContext, type PaneScope, type PaneChange } from '../src/renderer/pane-registry.js'
import {
  SIDEBAR_ZONE,
  assembleAppGraphEnvelope,
  deriveDocNavDocuments,
  docNavContent,
  crosslinksContent,
} from '../src/renderer/pane-graph.js'

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

function makeContext(overrides: Partial<PaneContext> = {}): PaneContext {
  return {
    snapshot: { nodes: [], edges: [] },
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
    ...overrides,
  }
}

function def(
  id: string,
  scope: PaneScope,
  render: PaneDefinition['render'],
  overrides: Partial<PaneDefinition> = {},
): PaneDefinition {
  return { id, title: `Title ${id}`, scope, render, ...overrides }
}

const noop = (): void => {}

function linkEntry(edgeId: string, source: string, target: string, scope: LinkEntry['scope']): LinkEntry {
  return {
    edge: makeEdge(edgeId, 'crosslink', source, target),
    kind: 'crosslink',
    source,
    target,
    scope,
  }
}

// ===========================================================================
// H1 — the §5.3 data-flow helpers survive a null store/ctx.
// ===========================================================================
describe('H1 — data-flow helpers survive a null store/ctx', () => {
  it('deriveDocNavDocuments returns [] for a null / missing snapshot', () => {
    expect(deriveDocNavDocuments(null as never)).toEqual([])
    expect(deriveDocNavDocuments({ nodes: null, edges: null } as never)).toEqual([])
    expect(deriveDocNavDocuments({ nodes: [], edges: undefined } as never)).toEqual([])
  })

  it('docNavContent returns the "(no documents)" empty state for a null ctx / missing ctx.snapshot', () => {
    const empty = { type: 'p', content: '(no documents)' }
    expect(docNavContent(null as never)).toEqual(empty)
    expect(docNavContent({ ...makeContext(), snapshot: null as never })).toEqual(empty)
    expect(docNavContent({ ...makeContext(), snapshot: { nodes: undefined, edges: undefined } as never })).toEqual(empty)
  })

  it('crosslinksContent returns the empty-state sections for a null ctx / missing ctx.crosslinks (no throw)', () => {
    const content = crosslinksContent(null as never, null)
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    expect(sections).toHaveLength(2)
    // The outgoing-crosslinks section shows "(none)" — no TypeError.
    expect((sections[0].children ?? []).filter((c) => c.type === 'li')).toHaveLength(0)

    const noCrosslinks = crosslinksContent(
      { ...makeContext(), crosslinks: null as never },
      null,
    )
    const s2 = (noCrosslinks.children ?? []).filter((c) => c.type === 'section')
    expect(s2).toHaveLength(2)
    expect((s2[0].children ?? []).filter((c) => c.type === 'li')).toHaveLength(0)
  })
})

// ===========================================================================
// H2 — assembleAppGraphEnvelope throws the documented guard error on a
// malformed traversal envelope (null template / template.root).
// ===========================================================================
describe('H2 — assembleAppGraphEnvelope guards a malformed traversal envelope', () => {
  const msg = 'assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required'

  it('throws the documented error (not a TypeError) for a null template', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    expect(() =>
      assembleAppGraphEnvelope({
        traversalEnvelope: { template: null } as never,
        registry: reg,
        ctx: makeContext(),
      }),
    ).toThrow(msg)
  })

  it('throws the documented error (not a TypeError) for a null template.root', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    expect(() =>
      assembleAppGraphEnvelope({
        traversalEnvelope: { template: { root: null } } as never,
        registry: reg,
        ctx: makeContext(),
      }),
    ).toThrow(msg)
  })

  it('a valid envelope still assembles (the guard does not over-trigger)', () => {
    const reg = createPaneRegistry()
    const validRender = (): { type: string; content: Array<{ type: string; content: string }> } => ({
      type: 'div',
      content: [{ type: 'text', content: 'pane-content' }],
    })
    reg.register(def('doc-nav', 'app-graph', validRender))
    reg.enable('doc-nav')
    const valid = {
      template: { root: { type: 'div', props: { id: 'r' }, children: [] } },
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    const result = assembleAppGraphEnvelope({
      traversalEnvelope: valid,
      registry: reg,
      ctx: makeContext(),
    })
    expect(result.paneIds).toEqual(['doc-nav'])
  })
})

// ===========================================================================
// H3 — crosslinksContent survives a non-null but PARTIAL result.
// ===========================================================================
describe('H3 — crosslinksContent coerces a partial result', () => {
  it('a result missing crosslinkBacklinks does not throw ("not iterable")', () => {
    const ctx = makeContext({
      currentNodeId: 'n1',
      crosslinks: [{ edgeId: 'cl1', sourceRagNodeId: 'n1', targetRagNodeId: 'n9' } as CrosslinkWiring],
    })
    const partial = { nodeId: 'n1', crosslinkOutlinks: [linkEntry('o1', 'n1', 'n3', 'intra-document')] } as unknown as BacklinkResult
    expect(() => crosslinksContent(ctx, partial)).not.toThrow()
    const content = crosslinksContent(ctx, partial)
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    // The outgoing section still lists the ctx.crosslinks entry.
    expect((sections[0].children ?? []).filter((c) => c.type === 'li')).toHaveLength(1)
    // The back section lists only the present crosslinkOutlinks (missing
    // crosslinkBacklinks coerced to []).
    const backLis = (sections[1].children ?? []).filter((c) => c.type === 'li')
    expect(backLis).toHaveLength(1)
    expect(backLis[0].props?.['data-target']).toBe('n3')
  })

  it('a result missing BOTH crosslink fields renders an empty back section (no throw)', () => {
    const ctx = makeContext({ currentNodeId: 'n1', crosslinks: [] })
    const partial = { nodeId: 'n1' } as unknown as BacklinkResult
    expect(() => crosslinksContent(ctx, partial)).not.toThrow()
    const content = crosslinksContent(ctx, partial)
    const sections = (content.children ?? []).filter((c) => c.type === 'section')
    expect((sections[1].children ?? []).filter((c) => c.type === 'li')).toHaveLength(0)
  })
})

// ===========================================================================
// H4 — a throwing onChanged subscriber does not block later subscribers.
// ===========================================================================
describe('H4 — onChanged subscribers survive a throwing sibling + mid-iteration unsubscribe', () => {
  it('a throwing subscriber does not block later subscribers from receiving the change', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    const received: PaneChange[] = []
    reg.onChanged(() => {
      throw new Error('boom')
    })
    reg.onChanged((c) => received.push(c))
    expect(() => reg.enable('doc-nav')).not.toThrow()
    expect(received).toEqual([{ id: 'doc-nav', enabled: true }])
  })

  it('a subscriber that unsubscribes itself mid-iteration does not skip later subscribers', () => {
    const reg = createPaneRegistry()
    reg.register(def('doc-nav', 'app-graph', noop))
    const order: string[] = []
    const first = (): void => {
      order.push('first')
      unsubscribeSecond() // unsubscribes the SECOND subscriber from within the FIRST
    }
    reg.onChanged(first)
    const unsubscribeSecond = reg.onChanged(() => order.push('second'))
    reg.enable('doc-nav')
    // Both subscribers ran (the snapshot copy prevents the mid-iteration
    // splice from skipping the second).
    expect(order).toEqual(['first', 'second'])
  })
})

// ===========================================================================
// H6 — doc-nav dedupes repeated doc-head targets (first head wins).
// ===========================================================================
describe('H6 — doc-nav dedupes repeated doc-head targets', () => {
  it('deriveDocNavDocuments emits ONE entry per documentId (first head wins) despite duplicate doc-head edges', () => {
    const snapshot = {
      nodes: [
        makeNode('head-a', { content: 'Doc A' }),
        makeNode('head-a2', { content: 'Doc A duplicate head' }),
      ],
      edges: [
        makeEdge('e1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] }),
        makeEdge('e2', 'doc-head', 'head-a2', 'doc-a', { documentIds: ['doc-a'] }), // duplicate target
      ],
    }
    const docs = deriveDocNavDocuments(snapshot)
    expect(docs).toHaveLength(1)
    // First head wins → the title comes from the FIRST edge's source node.
    expect(docs[0]).toEqual({ documentId: 'doc-a', title: 'Doc A' })
  })

  it('docNavContent emits ONE li per documentId (no duplicate data-document-id)', () => {
    const ctx = makeContext({
      snapshot: {
        nodes: [
          makeNode('head-a', { content: 'Doc A' }),
          makeNode('head-a2', { content: 'Doc A duplicate head' }),
        ],
        edges: [
          makeEdge('e1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] }),
          makeEdge('e2', 'doc-head', 'head-a2', 'doc-a', { documentIds: ['doc-a'] }),
        ],
      },
    })
    const content = docNavContent(ctx)
    expect(content.type).toBe('ul')
    const lis = (content.children ?? []).filter((c) => c.type === 'li')
    expect(lis).toHaveLength(1)
    expect(lis[0].props?.['data-document-id']).toBe('doc-a')
  })
})
