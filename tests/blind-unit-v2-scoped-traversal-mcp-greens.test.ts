// tests/blind-unit-v2-scoped-traversal-mcp-greens.test.ts
// BLIND-TEST green-scenario battery for Unit V2 (scoped traversal + MCP refactor).
// Derived from docs/specs/unit-v2-scoped-traversal-mcp.md ONLY (§5.1–§5.7 + §3a
// adversarial resolutions) + the Unit C greens conventions. This is a fresh-agent
// re-run of the greens — the scenarios are authored from the spec, not from the
// implementation.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  createSnapshotStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import {
  buildTraversal,
  computeDocumentSubgraph,
  rebuildBackRefs,
  type TraversalResult,
} from '../src/main/traversal.js'
import { handleRagTool } from '../src/main/mcp-server.js'
import { validateDocFlow } from '../src/main/doc-flow.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-v2-blind-'))
}
function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}
function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind: 'parent-child', source, target, createdAt: now, updatedAt: now, ...overrides }
}
async function seed(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}
/** The RAG ids that got a content root in the envelope (the materialized set). */
function contentRootIds(result: TraversalResult): string[] {
  return result.envelope.content.map((cp: { content: Array<{ props: { id: string } }> }) =>
    cp.content[0].props.id.replace(/^rag-/, ''),
  )
}
function backRefKeys(result: TraversalResult): string[] {
  return [...result.backRefs.keys()]
}

// ===========================================================================
// A. The scoped buildTraversal walk (§5.1 / §5.6 happy 1–7, 12 / §5.7 fail 1,2,7–10)
// ===========================================================================
describe('A. Scoped buildTraversal walk', () => {
  it('A1. Single document, single zone (happy 1)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(store, [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1', content: 'Title' })], [
        makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
        makeEdge('e2', 'H', 'root', { kind: 'doc-end', documentIds: ['root'] }),
      ])
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      expect(r.envelope.template.root.props.id).toBe('wiki-root')
      const producers = r.envelope.template.root.children.filter(
        (c: { placement?: { placementName?: string } }) => c.placement?.placementName,
      )
      expect(producers.map((p: { placement: { placementName: string } }) => p.placement.placementName)).toEqual(['main'])
      expect(r.envelope.content).toHaveLength(1)
      const root = r.envelope.content[0].content[0]
      expect(root.props.id).toBe('rag-H')
      expect(root.props['data-doc-head']).toBe(true)
      expect(root.placement.targetPlacement).toEqual(['main'])
      expect(r.envelope.clientConfig).toEqual({ runInstantiation: true, runRendering: true })
      expect(r.backRefs.size).toBe(1)
      expect(r.backRefs.get('H')!.length).toBeGreaterThan(0)
      expect(r.lineMap.ranges).toHaveLength(1)
      expect(r.lineMap.ranges[0].ragNodeId).toBe('H')
      expect(r.lineMap.ranges[0].startLine).toBeLessThan(r.lineMap.ranges[0].endLine)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A2. Multiple documents, one zone (happy 2)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root1', { type: 'div' }), makeNode('H1', { type: 'h1' }), makeNode('root2', { type: 'div' }), makeNode('H2', { type: 'h1' })],
        [
          makeEdge('e1', 'H1', 'root1', { kind: 'doc-head', documentIds: ['root1'] }),
          makeEdge('e2', 'H1', 'root1', { kind: 'doc-end', documentIds: ['root1'] }),
          makeEdge('e3', 'H2', 'root2', { kind: 'doc-head', documentIds: ['root2'] }),
          makeEdge('e4', 'H2', 'root2', { kind: 'doc-end', documentIds: ['root2'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root1', 'root2'], zoneName: 'main' })
      const producers = r.envelope.template.root.children.filter(
        (c: { placement?: { placementName?: string } }) => c.placement?.placementName,
      )
      expect(producers.map((p: { placement: { placementName: string } }) => p.placement.placementName)).toEqual(['main'])
      expect(contentRootIds(r).sort()).toEqual(['H1', 'H2'])
      expect(r.backRefs.size).toBe(2)
      expect(r.lineMap.ranges).toHaveLength(2)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A3. Valid doc-flow — doc-head marker via docHeadForDocument (happy 3)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      const roots = r.envelope.content.map((cp: { content: Array<{ props: Record<string, unknown> }> }) => cp.content[0])
      const byId = new Map(roots.map((x: { props: { id: string } }) => [x.props.id, x]))
      expect(byId.get('rag-H')!.props['data-doc-head']).toBe(true)
      expect(byId.get('rag-A')!.props['data-doc-head']).toBeUndefined()
      expect(byId.get('rag-B')!.props['data-doc-head']).toBeUndefined()
      expect(byId.get('rag-E')!.props['data-doc-head']).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A4. Doc-flow violation (next-section cycle) → fallback, no throw (happy 4)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'A', { kind: 'next-section', documentIds: ['root'] }), // cycle
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      expect(r.envelope.content.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A5. Multi-parent node → two duplicate subtrees (happy 5)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E'), makeNode('M')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e6', 'A', 'M', { kind: 'parent-child' }),
          makeEdge('e7', 'B', 'M', { kind: 'parent-child' }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      const mRoots = contentRootIds(r).filter((id) => id === 'M')
      expect(mRoots).toHaveLength(2) // two duplicate subtrees, one per parent
      expect(r.backRefs.has('M')).toBe(true) // both duplicates share the RAG id in the backRefs map
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A6. Doc-child nesting (ul + 4 li) (happy 6)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [
          makeNode('root', { type: 'div' }),
          makeNode('H', { type: 'h1' }),
          makeNode('UL', { type: 'ul', content: 'List' }),
          makeNode('LI1', { type: 'li' }),
          makeNode('LI2', { type: 'li' }),
          makeNode('LI3', { type: 'li' }),
          makeNode('LI4', { type: 'li' }),
          makeNode('E'),
        ],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'UL', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'UL', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e5', 'UL', 'LI1', { kind: 'doc-child', order: 0 }),
          makeEdge('e6', 'UL', 'LI2', { kind: 'doc-child', order: 1 }),
          makeEdge('e7', 'UL', 'LI3', { kind: 'doc-child', order: 2 }),
          makeEdge('e8', 'UL', 'LI4', { kind: 'doc-child', order: 3 }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      const ulRoot = r.envelope.content.find((cp: { content: Array<{ props: { id: string } }> }) => cp.content[0].props.id === 'rag-UL')!
      expect(ulRoot.content[0].type).toBe('ul')
      const liIds = ulRoot.content[0].children
        .filter((c: { type?: string }) => c.type === 'li')
        .map((c: { props?: { id?: string } }) => c.props?.id)
      expect(liIds).toEqual(['rag-LI1', 'rag-LI2', 'rag-LI3', 'rag-LI4'])
      // backRefs: H, UL, LI1-4, E = 7 entries
      expect(r.backRefs.size).toBe(7)
      expect(r.backRefs.has('UL')).toBe(true)
      for (const li of ['LI1', 'LI2', 'LI3', 'LI4']) expect(r.backRefs.has(li)).toBe(true)
      // lineMap maps each li to its own doc-child RAG object (4 li ranges)
      const liRanges = r.lineMap.ranges.filter((rg) => ['LI1', 'LI2', 'LI3', 'LI4'].includes(rg.ragNodeId))
      expect(liRanges).toHaveLength(4)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A7. E2E cross-document shared node (B/C → A → D) (happy 7)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [
          makeNode('B-root', { type: 'div' }),
          makeNode('C-root', { type: 'div' }),
          makeNode('B-head', { type: 'h1' }),
          makeNode('B-use'),
          makeNode('C-head', { type: 'h1' }),
          makeNode('C-use'),
          makeNode('A'),
          makeNode('D'),
        ],
        [
          makeEdge('e1', 'B-head', 'B-root', { kind: 'doc-head', documentIds: ['B-root'] }),
          makeEdge('e2', 'C-head', 'C-root', { kind: 'doc-head', documentIds: ['C-root'] }),
          makeEdge('e3', 'B-head', 'B-use', { kind: 'next-section', documentIds: ['B-root'] }),
          makeEdge('e4', 'B-use', 'A', { kind: 'next-section', documentIds: ['B-root'] }),
          makeEdge('e5', 'A', 'D', { kind: 'next-section', documentIds: ['B-root'] }),
          makeEdge('e6', 'C-head', 'C-use', { kind: 'next-section', documentIds: ['C-root'] }),
          makeEdge('e7', 'C-use', 'A', { kind: 'next-section', documentIds: ['C-root'] }),
          makeEdge('e8', 'A', 'D', { kind: 'next-section', documentIds: ['C-root'] }),
          makeEdge('e9', 'D', 'B-root', { kind: 'doc-end', documentIds: ['B-root'] }),
          makeEdge('e10', 'D', 'C-root', { kind: 'doc-end', documentIds: ['C-root'] }),
          makeEdge('e11', 'B-use', 'A', { kind: 'parent-child' }),
          makeEdge('e12', 'C-use', 'A', { kind: 'parent-child' }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['B-root', 'C-root'], zoneName: 'main' })
      const aRoots = contentRootIds(r).filter((id) => id === 'A')
      expect(aRoots).toHaveLength(2) // A materialized as a duplicate subtree in each document
      const dRoots = contentRootIds(r).filter((id) => id === 'D')
      expect(dRoots).toHaveLength(2) // D materialized in both documents
      expect(r.backRefs.has('A')).toBe(true) // both duplicates share the RAG id in the backRefs map
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A8. Cycle protection — a doc-child cycle terminates via the family-pre-order fallback (happy 12 / HOST-5)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e6', 'A', 'B', { kind: 'doc-child' }),
          makeEdge('e7', 'B', 'A', { kind: 'doc-child' }), // nesting cycle
        ],
      )
      // Must terminate (no infinite loop) and not throw.
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      expect(r.envelope.content.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A9. Edit-surface shrink — a node not reachable from the head is dropped from backRefs/envelope (amendment 1 / HOST-4)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E'), makeNode('STRAY'), makeNode('X')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          // STRAY is a source of a doc-flow edge scoped to the document (so it is
          // in the document's node set) but is NOT reachable from the head.
          makeEdge('e6', 'STRAY', 'X', { kind: 'next-section', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      const roots = contentRootIds(r)
      // The reachable nodes are materialized.
      for (const id of ['H', 'A', 'B', 'E']) expect(roots).toContain(id)
      // STRAY is in the document's node set (computeDocumentSubgraph) but NOT
      // reachable from the head → dropped from backRefs and the envelope.
      const sub = computeDocumentSubgraph(store, 'root')
      expect(sub.docNodeIds.has('STRAY')).toBe(true)
      expect(roots).not.toContain('STRAY')
      expect(backRefKeys(r)).not.toContain('STRAY')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A10. buildTraversal null/undefined/missing-field input throws (fail 1)', () => {
    const store = createSnapshotStore([], [])
    expect(() => buildTraversal(null as never)).toThrow('traversal: store/documentIds/zoneName required')
    expect(() => buildTraversal(undefined as never)).toThrow('traversal: store/documentIds/zoneName required')
    expect(() => buildTraversal({} as never)).toThrow('traversal: store/documentIds/zoneName required')
    expect(() => buildTraversal({ store, documentIds: [], zoneName: '' } as never)).toThrow(
      'traversal: store/documentIds/zoneName required',
    )
    expect(() => buildTraversal({ store: undefined, documentIds: ['root'], zoneName: 'main' } as never)).toThrow(
      'traversal: store/documentIds/zoneName required',
    )
  })

  it('A11. buildTraversal with a listNodes/listEdges-only adapter throws (amendment 4 / fail 2)', () => {
    const nodes = [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' })]
    const edges = [
      makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
      makeEdge('e2', 'H', 'root', { kind: 'doc-end', documentIds: ['root'] }),
    ]
    const only = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore
    // The adjacency call fails → buildTraversal throws (the replacement is required).
    expect(() => buildTraversal({ store: only, documentIds: ['root'], zoneName: 'main' })).toThrow()
  })

  it('A12. Empty document → no ContentPayload, no throw (fail 8)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(store, [makeNode('root', { type: 'div' })], [])
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      expect(r.envelope.content).toHaveLength(0)
      const producers = r.envelope.template.root.children.filter(
        (c: { placement?: { placementName?: string } }) => c.placement?.placementName,
      )
      expect(producers.map((p: { placement: { placementName: string } }) => p.placement.placementName)).toEqual(['main'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A13. Doc-flow missing-head → fallback, no throw (fail 9)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('A'), makeNode('B')],
        [
          makeEdge('e1', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e2', 'B', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      expect(r.envelope.content.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A14. HARD PRECONDITION — every targetPlacement zone has a container producer (fail 7)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      const producerZones = new Set(
        r.envelope.template.root.children
          .filter((c: { placement?: { placementName?: string } }) => c.placement?.placementName)
          .map((c: { placement: { placementName: string } }) => c.placement.placementName),
      )
      for (const cp of r.envelope.content) {
        const zones = cp.content[0].placement.targetPlacement as string[]
        for (const z of zones) expect(producerZones.has(z)).toBe(true)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// B. computeDocumentSubgraph (§5.2 / §5.6 happy 8,9 / §5.7 fail 3,4 / HOST-3)
// ===========================================================================
describe('B. computeDocumentSubgraph', () => {
  it('B1. happy — doc root + flow nodes + transitive doc-children; scoped edges (happy 8)', () => {
    const nodes = [
      makeNode('root', { type: 'div' }),
      makeNode('H', { type: 'h1' }),
      makeNode('A'),
      makeNode('B'),
      makeNode('E'),
      makeNode('LI'),
    ]
    const edges = [
      makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
      makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
      makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
      makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
      makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
      makeEdge('e6', 'A', 'LI', { kind: 'doc-child' }),
    ]
    const store = createSnapshotStore(nodes, edges)
    const sub = computeDocumentSubgraph(store, 'root')
    expect([...sub.docNodeIds].sort()).toEqual(['A', 'B', 'E', 'H', 'LI', 'root'])
    const edgeIds = sub.edges.map((e) => e.id).sort()
    // doc-flow edges scoped by 'root' + the doc-child edge among the document's nodes
    expect(edgeIds).toEqual(['e1', 'e2', 'e3', 'e4', 'e5', 'e6'])
  })

  it('B2. empty document → docNodeIds = { documentId }, edges = [] (happy 9)', () => {
    const store = createSnapshotStore([makeNode('root', { type: 'div' })], [])
    const sub = computeDocumentSubgraph(store, 'root')
    expect([...sub.docNodeIds]).toEqual(['root'])
    expect(sub.edges).toEqual([])
  })

  it('B3. unknown document id → docNodeIds = { documentId }, edges = [] (HOST-3)', () => {
    const store = createSnapshotStore([makeNode('root', { type: 'div' })], [])
    const sub = computeDocumentSubgraph(store, 'ghost')
    expect([...sub.docNodeIds]).toEqual(['ghost'])
    expect(sub.edges).toEqual([])
  })

  it('B4. malformed — a doc-head edge with a missing target does not crash (HOST-3)', () => {
    const nodes = [makeNode('H', { type: 'h1' })]
    const edges = [makeEdge('e1', 'H', 'missing-root', { kind: 'doc-head', documentIds: ['root'] })]
    const store = createSnapshotStore(nodes, edges)
    // No crash; the docNodeIds closure adds the edge endpoints.
    const sub = computeDocumentSubgraph(store, 'root')
    expect(sub.docNodeIds.has('H')).toBe(true)
    expect(sub.docNodeIds.has('missing-root')).toBe(true)
  })

  it('B5. null/undefined store throws (fail 3)', () => {
    expect(() => computeDocumentSubgraph(null as never, 'root')).toThrow('computeDocumentSubgraph: store required')
    expect(() => computeDocumentSubgraph(undefined as never, 'root')).toThrow('computeDocumentSubgraph: store required')
  })

  it('B6. non-string/empty-string documentId throws (fail 4)', () => {
    const store = createSnapshotStore([], [])
    expect(() => computeDocumentSubgraph(store, '')).toThrow('computeDocumentSubgraph: documentId must be a non-empty string')
    expect(() => computeDocumentSubgraph(store, null as never)).toThrow(
      'computeDocumentSubgraph: documentId must be a non-empty string',
    )
  })
})

// ===========================================================================
// C. rag.get_document refactor (§5.3 / §5.6 happy 10,11 / §5.7 fail 5,6 / HOST-6)
// ===========================================================================
describe('C. rag.get_document refactor', () => {
  it('C1. happy — { documentId, nodes, edges } with the document node set + scoped edges (happy 10)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('LI')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e4', 'A', 'LI', { kind: 'doc-child' }),
        ],
      )
      const res = (await handleRagTool(store, 'rag.get_document', { documentId: 'root' })) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(res.documentId).toBe('root')
      expect(res.nodes.map((n) => n.id).sort()).toEqual(['A', 'H', 'LI', 'root'])
      expect(res.edges.map((e) => e.id).sort()).toEqual(['e1', 'e2', 'e3', 'e4'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C2. empty document → { documentId, nodes: [<doc root>], edges: [] } (happy 11)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(store, [makeNode('root', { type: 'div' })], [])
      const res = (await handleRagTool(store, 'rag.get_document', { documentId: 'root' })) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(res.documentId).toBe('root')
      expect(res.nodes.map((n) => n.id)).toEqual(['root'])
      expect(res.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C3. unknown document id → { documentId, nodes: [], edges: [] } (HOST-6)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(store, [makeNode('root', { type: 'div' })], [])
      const res = (await handleRagTool(store, 'rag.get_document', { documentId: 'ghost' })) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(res.documentId).toBe('ghost')
      expect(res.nodes).toEqual([])
      expect(res.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C4. missing/empty documentId throws (fail 5)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(store, [makeNode('root', { type: 'div' })], [])
      await expect(handleRagTool(store, 'rag.get_document', {})).rejects.toThrow('rag.get_document: documentId required')
      await expect(handleRagTool(store, 'rag.get_document', { documentId: '' })).rejects.toThrow(
        'rag.get_document: documentId required',
      )
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C5. null store throws (fail 6)', async () => {
    await expect(handleRagTool(null, 'rag.get_document', { documentId: 'root' })).rejects.toThrow(
      'rag.get_document: no rag store configured',
    )
  })
})

// ===========================================================================
// D. Cross-cutting amendments (§5.4, §5.5 / happy 13–18 / HOST-8)
// ===========================================================================
describe('D. Cross-cutting amendments', () => {
  it('D1. materialized-set equivalence — the scoped walk materializes the reachable set (amendment 1 / happy 14)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const r = buildTraversal({ store, documentIds: ['root'], zoneName: 'main' })
      // For the standard valid-doc-flow fixture, the materialized set is exactly
      // the reachable nodes (H, A, B, E) — the doc root is the container, not a
      // content root.
      expect(contentRootIds(r).sort()).toEqual(['A', 'B', 'E', 'H'])
      expect(backRefKeys(r).sort()).toEqual(['A', 'B', 'E', 'H'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D2. single-source identity — computeDocumentSubgraph.docNodeIds == rag.get_document node set (amendment 2 / happy 15)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('LI')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e4', 'A', 'LI', { kind: 'doc-child' }),
        ],
      )
      const sub = computeDocumentSubgraph(store, 'root')
      const res = (await handleRagTool(store, 'rag.get_document', { documentId: 'root' })) as { nodes: RagNode[] }
      expect([...sub.docNodeIds].sort()).toEqual(res.nodes.map((n) => n.id).sort())
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D3. adapter replacement — rebuildBackRefs uses createSnapshotStore; a listNodes/listEdges-only adapter throws (amendment 4 / happy 16)', () => {
    const nodes = [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' })]
    const edges = [
      makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
      makeEdge('e2', 'H', 'root', { kind: 'doc-end', documentIds: ['root'] }),
    ]
    // rebuildBackRefs works (its adapter is createSnapshotStore, not the inline one).
    const map = rebuildBackRefs(nodes, edges, 'main')
    expect(map.size).toBe(1)
    expect(map.has('H')).toBe(true)
    // A listNodes/listEdges-only adapter passed to buildTraversal throws.
    const only = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore
    expect(() => buildTraversal({ store: only, documentIds: ['root'], zoneName: 'main' })).toThrow()
  })

  it('D4. rag.get_document identical result — the refactored handler returns the documented contract (amendment 6 / happy 17)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('LI')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'root', { kind: 'doc-end', documentIds: ['root'] }),
          makeEdge('e4', 'A', 'LI', { kind: 'doc-child' }),
        ],
      )
      const res = (await handleRagTool(store, 'rag.get_document', { documentId: 'root' })) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      // The contract: nodes = the store's nodes whose id is in docNodeIds; edges =
      // the doc-flow edges scoped by documentId + the doc-child edges among the
      // document's nodes (both endpoints in docNodeIds).
      const sub = computeDocumentSubgraph(store, 'root')
      expect(res.nodes.map((n) => n.id).sort()).toEqual([...sub.docNodeIds].sort())
      expect(res.edges.map((e) => e.id).sort()).toEqual(sub.edges.map((e) => e.id).sort())
      expect(res.documentId).toBe('root')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D5. validateDocFlow pre-scoping verdict match — edgesForDocument vs full-edge call (amendment 7 / happy 18)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seed(
        store,
        [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A'), makeNode('B'), makeNode('E')],
        [
          makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
          makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e3', 'A', 'B', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e4', 'B', 'E', { kind: 'next-section', documentIds: ['root'] }),
          makeEdge('e5', 'E', 'root', { kind: 'doc-end', documentIds: ['root'] }),
        ],
      )
      const nodes = store.listNodes()
      const full = validateDocFlow(nodes, store.listEdges(), 'root')
      const scoped = validateDocFlow(nodes, store.edgesForDocument('root'), 'root')
      expect(scoped).toEqual(full)
      expect(scoped.ok).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D6. rebuildBackRefs via createSnapshotStore returns the backRefs map (happy 13)', () => {
    const nodes = [makeNode('root', { type: 'div' }), makeNode('H', { type: 'h1' }), makeNode('A')]
    const edges = [
      makeEdge('e1', 'H', 'root', { kind: 'doc-head', documentIds: ['root'] }),
      makeEdge('e2', 'H', 'A', { kind: 'next-section', documentIds: ['root'] }),
      makeEdge('e3', 'A', 'root', { kind: 'doc-end', documentIds: ['root'] }),
    ]
    const map = rebuildBackRefs(nodes, edges, 'main')
    expect(map.size).toBe(2)
    expect(map.has('H')).toBe(true)
    expect(map.has('A')).toBe(true)
  })

  it('D7. rebuildBackRefs empty-snapshot path → empty Map, never throws (HOST-8)', () => {
    const map = rebuildBackRefs([], [], 'main')
    expect(map).toBeInstanceOf(Map)
    expect(map.size).toBe(0)
  })
})
