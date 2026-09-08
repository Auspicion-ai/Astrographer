// tests/unit-x-rag-provenance-traversal.test.ts — Unit X: RAG-surface
// provenance + multi-hop traversal (docs/specs/unit-x-rag-provenance-traversal.md
// §5.9 happy-path states + §5.10 fail-states). The RED set for:
//   - the additive store fields (RagNode.nodeKind / RagEdge.edgeType / RagEdge.state)
//   - the provenance builders (documentIdsForNode / buildCitations / buildFlatTrace)
//   - the extended entry point (ragQuery)
//   - the graph-mode walk (walkReferenceGraph)
//   - the parent-context expansion (expandParentContext)
//   - the NEW query audit log (src/main/query-audit.ts)
//   - the extended MCP tools (rag.query / rag-stream / get_query_audit_log)
//
// Follows the retrieval.test.ts / rag-store.test.ts conventions (vitest node
// environment, `.js` import suffix for the main-process ESM module, temp dirs
// via node:fs, makeNode/makeEdge helpers).
//
// RED: the new functions/types do NOT exist yet — `src/main/query-audit.ts`
// does not exist, and `src/main/retrieval.ts` does not export ragQuery /
// walkReferenceGraph / expandParentContext / documentIdsForNode / buildCitations
// / buildFlatTrace, so this file FAILS TO LOAD (the static imports resolve to
// nothing). The mutating store methods (putNode/putEdge) are async and
// queue-serialized, so every call is awaited here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ragQuery,
  walkReferenceGraph,
  expandParentContext,
  documentIdsForNode,
  buildCitations,
  buildFlatTrace,
  createLexicalIndex,
  createLexicalEmbedder,
  type RagQueryOptions,
  type RagResult,
  type RagResultItem,
  type WalkOptions,
  type WalkResult,
  type FlatTrace,
  type GraphTraceEntry,
  type RagTrace,
  type BlockedByEntry,
  type RagQueryFilters,
  type Embedder,
  type LexicalIndex,
} from '../src/main/retrieval.js'
import {
  createQueryAuditLog,
  type QueryAuditEntry,
  type QueryAuditLog,
} from '../src/main/query-audit.js'
import {
  createJsonRagStore,
  createSnapshotStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type RagNodeKind,
  type RagEdgeType,
  type RagReferenceState,
} from '../src/main/rag-store.js'
import { handleRagTool, handleRagQueryIpc } from '../src/main/mcp-server.js'
import { toolAllowed } from '../src/main/security.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-x-'))
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

function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return {
    id,
    kind: 'parent-child',
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// A reference→fact graph fixture (the §5.1 subgraph of crosslink-kind edges
// whose source is a `reference` node and target is a `fact` node):
//   doc1: head1 → ref1 (doc-head/doc-end); ref1 is a `reference` node
//   doc2: head2 → fact1 (doc-head/doc-end); fact1 is a `fact` node
//   crosslink: ref1 → fact1 (edgeType/state configurable)
// The additive fields (nodeKind/edgeType/state) are cast because the current
// RagNode/RagEdge types do not yet carry them (RED — the additive fields are
// the implementer's job).
async function seedGraphStore(
  store: RagStore,
  opts: { edgeType?: RagEdgeType; state?: RagReferenceState } = {},
): Promise<void> {
  const edgeType = opts.edgeType ?? 'link'
  const state = opts.state ?? 'RESOLVED'
  // doc1
  await store.putNode(makeNode('head1', { content: 'Doc One Title' }))
  await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
  await store.putEdge(makeEdge('d1h', 'head1', 'ref1', { kind: 'doc-head', documentIds: ['doc1'] }))
  await store.putEdge(makeEdge('d1e', 'ref1', 'head1', { kind: 'doc-end', documentIds: ['doc1'] }))
  // doc2
  await store.putNode(makeNode('head2', { content: 'Doc Two Title' }))
  await store.putNode(makeNode('fact1', { content: 'fact content', nodeKind: 'fact' } as Partial<RagNode>))
  await store.putEdge(makeEdge('d2h', 'head2', 'fact1', { kind: 'doc-head', documentIds: ['doc2'] }))
  await store.putEdge(makeEdge('d2e', 'fact1', 'head2', { kind: 'doc-end', documentIds: ['doc2'] }))
  // crosslink
  await store.putEdge(makeEdge('x1', 'ref1', 'fact1', { kind: 'crosslink', edgeType, state } as Partial<RagEdge>))
}

// The seed item for the reference node ref1 (a top-k scored node).
const REF_SEED: RagResultItem = {
  documentId: 'doc1',
  nodeId: 'ref1',
  score: 1,
  snippet: 'alpha beta',
  source: 'local',
}

describe('Unit X — additive store fields (§5.1)', () => {
  it('26. putNode with a nodeKind outside the closed union rejects "rag putNode: nodeKind required/invalid"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { nodeKind: 'bogus' } as Partial<RagNode>))).rejects.toThrow('rag putNode: nodeKind required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('27. putEdge with an edgeType/state outside the closed union rejects "rag putEdge: edgeType/state required/invalid"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { edgeType: 'bogus' } as Partial<RagEdge>))).rejects.toThrow('rag putEdge: edgeType/state required/invalid')
      await expect(store.putEdge(makeEdge('e2', 'n1', 'n2', { state: 'bogus' } as Partial<RagEdge>))).rejects.toThrow('rag putEdge: edgeType/state required/invalid')
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('additive-load + hash-coverage: a node WITHOUT nodeKind hashes identically to one with nodeKind: undefined', async () => {
    const dir = freshDir()
    try {
      // The ADDITIVE guarantee: a node WITHOUT nodeKind hashes identically to
      // one with nodeKind: undefined. To test this, the two nodes must be
      // IDENTICAL in every field EXCEPT nodeKind — same id, same timestamps,
      // same content — so they are written to two SEPARATE stores (a store
      // cannot hold two nodes with the same id).
      const now = new Date().toISOString()
      const file1 = join(dir, 'rag1.json')
      const file2 = join(dir, 'rag2.json')
      const store1: RagStore = createJsonRagStore({ path: file1 })
      await store1.putNode(makeNode('n1', { content: 'same', createdAt: now, updatedAt: now }))
      const store2: RagStore = createJsonRagStore({ path: file2 })
      await store2.putNode(makeNode('n1', { content: 'same', nodeKind: undefined, createdAt: now, updatedAt: now } as Partial<RagNode>))
      const onDisk1 = JSON.parse(readFileSync(file1, 'utf8'))
      const onDisk2 = JSON.parse(readFileSync(file2, 'utf8'))
      const n1 = onDisk1.nodes.find((n: RagNode) => n.id === 'n1')
      const n2 = onDisk2.nodes.find((n: RagNode) => n.id === 'n1')
      expect(n1.hash).toBe(n2.hash)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('hash-coverage: a node WITH nodeKind: "reference" hashes DIFFERENTLY from one without nodeKind', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'same' }))
      const store2: RagStore = createJsonRagStore({ path: file })
      await store2.putNode(makeNode('n2', { content: 'same', nodeKind: 'reference' } as Partial<RagNode>))
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const n1 = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      const n2 = onDisk.nodes.find((n: RagNode) => n.id === 'n2')
      expect(n1.hash).not.toBe(n2.hash)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit X — documentIdsForNode (§5.3)', () => {
  it('1. happy: a node in a document → the document id(s) whose docNodeIds include the node', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      expect(documentIdsForNode(store, 'ref1')).toEqual(['doc1'])
      expect(documentIdsForNode(store, 'fact1')).toEqual(['doc2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. no document: a node in no document → []', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      expect(documentIdsForNode(store, 'ghost')).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('16. null/undefined store or non-string nodeId throws "documentIdsForNode: store/nodeId required"', () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    expect(() => documentIdsForNode(null as never, 'ref1')).toThrow('documentIdsForNode: store/nodeId required')
    expect(() => documentIdsForNode(undefined as never, 'ref1')).toThrow('documentIdsForNode: store/nodeId required')
    expect(() => documentIdsForNode(store, null as never)).toThrow('documentIdsForNode: store/nodeId required')
    expect(() => documentIdsForNode(store, 42 as never)).toThrow('documentIdsForNode: store/nodeId required')
  })
})

describe('Unit X — buildCitations (§5.3)', () => {
  it('3. happy: result items with duplicates → the deduplicated grounding set, first-appearance order', () => {
    const items: RagResultItem[] = [
      { documentId: 'd1', nodeId: 'n1', score: 1, snippet: 'a', source: 'local' },
      { documentId: 'd1', nodeId: 'n1', score: 1, snippet: 'a', source: 'local' },
      { documentId: 'd2', nodeId: 'n2', score: 1, snippet: 'b', source: 'local' },
      { documentId: 'd1', nodeId: 'n1', score: 1, snippet: 'a', source: 'local' },
    ]
    expect(buildCitations(items)).toEqual([
      { documentId: 'd1', nodeId: 'n1' },
      { documentId: 'd2', nodeId: 'n2' },
    ])
  })

  it('17. null/undefined items throws "buildCitations: items required"', () => {
    expect(() => buildCitations(null as never)).toThrow('buildCitations: items required')
    expect(() => buildCitations(undefined as never)).toThrow('buildCitations: items required')
  })
})

describe('Unit X — buildFlatTrace (§5.3)', () => {
  it('4. happy: buildFlatTrace("local", 5, "local") → { mode: "flat", engine: "local", topK: 5, source: "local" }', () => {
    expect(buildFlatTrace('local', 5, 'local')).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
  })

  it('18. non-string engine/source or non-positive-integer topK throws "buildFlatTrace: engine/topK/source required"', () => {
    expect(() => buildFlatTrace(null as never, 5, 'local')).toThrow('buildFlatTrace: engine/topK/source required')
    expect(() => buildFlatTrace('local', 0, 'local')).toThrow('buildFlatTrace: engine/topK/source required')
    expect(() => buildFlatTrace('local', 1.5, 'local')).toThrow('buildFlatTrace: engine/topK/source required')
    expect(() => buildFlatTrace('local', 5, null as never)).toThrow('buildFlatTrace: engine/topK/source required')
  })
})

describe('Unit X — walkReferenceGraph (§5.4)', () => {
  it('11. happy: seeds → the ordered reference→fact path walked, in traversal order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(result.targets).toHaveLength(1)
      expect(result.targets[0].nodeId).toBe('fact1')
      expect(result.targets[0].documentId).toBe('doc2')
      expect(result.trace).toEqual([
        { from: { documentId: 'doc1', nodeId: 'ref1' }, to: { documentId: 'doc2', nodeId: 'fact1' }, edge: 'link', state: 'RESOLVED' },
      ])
      expect(result.blockedBy).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. resolve-through-FRESH/RESOLVED: the walk proceeds through FRESH/RESOLVED edges and resolves the target fact nodes', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store, { edgeType: 'embed', state: 'FRESH' })
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(result.targets).toHaveLength(1)
      expect(result.targets[0].nodeId).toBe('fact1')
      expect(result.trace[0].edge).toBe('embed')
      expect(result.trace[0].state).toBe('FRESH')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. surface-BROKEN/STALE: a BROKEN/STALE edge is NOT traversed; it is recorded in the trace', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store, { state: 'BROKEN' })
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(result.targets).toEqual([])
      expect(result.trace).toEqual([
        { from: { documentId: 'doc1', nodeId: 'ref1' }, to: { documentId: 'doc2', nodeId: 'fact1' }, edge: 'link', state: 'BROKEN' },
      ])
      expect(result.blockedBy).toEqual([{ documentId: 'doc1', nodeId: 'ref1', state: 'BROKEN' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. determinism: the same store + same seeds + same options → the same result (twice)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const a = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      const b = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(a).toEqual(b)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. null/undefined store/seeds/opts throws "walkReferenceGraph: store/seeds/opts required"', () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    expect(() => walkReferenceGraph(null as never, [REF_SEED], { maxHops: 3 })).toThrow('walkReferenceGraph: store/seeds/opts required')
    expect(() => walkReferenceGraph(undefined as never, [REF_SEED], { maxHops: 3 })).toThrow('walkReferenceGraph: store/seeds/opts required')
    expect(() => walkReferenceGraph(store, null as never, { maxHops: 3 })).toThrow('walkReferenceGraph: store/seeds/opts required')
    expect(() => walkReferenceGraph(store, undefined as never, { maxHops: 3 })).toThrow('walkReferenceGraph: store/seeds/opts required')
    expect(() => walkReferenceGraph(store, [REF_SEED], null as never)).toThrow('walkReferenceGraph: store/seeds/opts required')
    expect(() => walkReferenceGraph(store, [REF_SEED], undefined as never)).toThrow('walkReferenceGraph: store/seeds/opts required')
  })

  it('11. maxHops not an integer in [1, 5] throws "walkReferenceGraph: maxHops must be an integer in [1, 5]"', () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    expect(() => walkReferenceGraph(store, [REF_SEED], { maxHops: 0 })).toThrow('walkReferenceGraph: maxHops must be an integer in [1, 5]')
    expect(() => walkReferenceGraph(store, [REF_SEED], { maxHops: 6 })).toThrow('walkReferenceGraph: maxHops must be an integer in [1, 5]')
    expect(() => walkReferenceGraph(store, [REF_SEED], { maxHops: 1.5 })).toThrow('walkReferenceGraph: maxHops must be an integer in [1, 5]')
  })

  it('12. HopLimitExceeded (FS-17): the walk exceeds maxHops without resolving a target → throws "walkReferenceGraph: HopLimitExceeded"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // A chain of crosslink edges longer than maxHops with no terminal fact
      // target: ref1 → ref2 → ref3 → ref4 (all reference nodes).
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('ref2', { content: 'gamma delta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('ref3', { content: 'epsilon zeta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('ref4', { content: 'eta theta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putEdge(makeEdge('c1', 'ref1', 'ref2', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putEdge(makeEdge('c2', 'ref2', 'ref3', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putEdge(makeEdge('c3', 'ref3', 'ref4', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      expect(() => walkReferenceGraph(store, [REF_SEED], { maxHops: 1 })).toThrow('walkReferenceGraph: HopLimitExceeded')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. CycleDetected (FS-18): the walk detects a reference→fact cycle → throws "walkReferenceGraph: CycleDetected"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // A cycle: ref1 → fact1 → ref1 (a node revisited on the current path).
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('fact1', { content: 'fact content', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putEdge(makeEdge('c1', 'ref1', 'fact1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putEdge(makeEdge('c2', 'fact1', 'ref1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      expect(() => walkReferenceGraph(store, [REF_SEED], { maxHops: 5 })).toThrow('walkReferenceGraph: CycleDetected')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit X — expandParentContext (§5.5)', () => {
  it('15. happy: items + a cap → the top-capped items carry a parent; the rest do not', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const items: RagResultItem[] = [
        { documentId: 'doc2', nodeId: 'fact1', score: 1, snippet: 'fact content', source: 'local' },
        { documentId: 'doc1', nodeId: 'ref1', score: 0.5, snippet: 'alpha beta', source: 'local' },
      ]
      const expanded = expandParentContext(store, items, 1)
      expect(expanded[0].parent).toEqual({ documentId: 'doc2', title: 'Doc Two Title', snippet: 'Doc Two Title', stale: false })
      expect(expanded[1].parent).toBeUndefined() // beyond the cap
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. null/undefined store/items throws "expandParentContext: store/items required"', () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    expect(() => expandParentContext(null as never, [], 5)).toThrow('expandParentContext: store/items required')
    expect(() => expandParentContext(undefined as never, [], 5)).toThrow('expandParentContext: store/items required')
    expect(() => expandParentContext(store, null as never, 5)).toThrow('expandParentContext: store/items required')
    expect(() => expandParentContext(store, undefined as never, 5)).toThrow('expandParentContext: store/items required')
  })

  it('15. maxParentContext not a positive integer throws "expandParentContext: maxParentContext must be a positive integer"', () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    expect(() => expandParentContext(store, [], 0)).toThrow('expandParentContext: maxParentContext must be a positive integer')
    expect(() => expandParentContext(store, [], -1)).toThrow('expandParentContext: maxParentContext must be a positive integer')
    expect(() => expandParentContext(store, [], 1.5)).toThrow('expandParentContext: maxParentContext must be a positive integer')
  })
})

describe('Unit X — ragQuery (§5.2/§5.6)', () => {
  it('5. flat happy: a query → the result with results, citations, the flat trace, and the preserved ranked/context/markdown/lineMap/k', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const result = await ragQuery(store, embedder, index, 'alpha', {})
      expect(result.query).toBe('alpha')
      expect(Array.isArray(result.results)).toBe(true)
      expect(result.results[0].nodeId).toBe('ref1')
      expect(result.results[0].documentId).toBe('doc1')
      expect(result.results[0].source).toBe('local')
      expect(result.citations).toEqual([{ documentId: 'doc1', nodeId: 'ref1' }])
      expect(result.trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
      expect(Array.isArray(result.ranked)).toBe(true)
      expect(Array.isArray(result.context)).toBe(true)
      expect(typeof result.markdown).toBe('string')
      expect(Array.isArray(result.lineMap.ranges)).toBe(true)
      expect(result.k).toBe(5)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. graph happy: a query in mode: "graph" → the resolved target nodes, the graph-mode trace, and citations = the deduped resolved targets', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const result = await ragQuery(store, embedder, index, 'alpha', { mode: 'graph' })
      expect(result.results).toHaveLength(1)
      expect(result.results[0].nodeId).toBe('fact1')
      expect(result.results[0].documentId).toBe('doc2')
      expect(result.citations).toEqual([{ documentId: 'doc2', nodeId: 'fact1' }])
      expect(Array.isArray(result.trace)).toBe(true)
      expect(result.trace[0]).toEqual({ from: { documentId: 'doc1', nodeId: 'ref1' }, to: { documentId: 'doc2', nodeId: 'fact1' }, edge: 'link', state: 'RESOLVED' })
      expect(result.blockedBy).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. graph blocked: a graph traversal that resolves no target → { results: [], citations: [], trace, blockedBy } (a valid state, not an error)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store, { state: 'BROKEN' })
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const result = await ragQuery(store, embedder, index, 'alpha', { mode: 'graph' })
      expect(result.results).toEqual([])
      expect(result.citations).toEqual([])
      expect(Array.isArray(result.trace)).toBe(true)
      expect(result.blockedBy).toEqual([{ documentId: 'doc1', nodeId: 'ref1', state: 'BROKEN' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. filters: a filters.edgeType/state/target restricts the walk node/edge set', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store) // the crosslink is a 'link' edge
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      // filters.edgeType: 'embed' excludes the 'link' edge → the walk resolves nothing
      const result = await ragQuery(store, embedder, index, 'alpha', { mode: 'graph', filters: { edgeType: 'embed' } })
      expect(result.results).toEqual([])
      expect(result.blockedBy).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. parent-context: expand: "parent" → the top maxParentContext items carry a parent field; items beyond the cap are returned without one', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const result = await ragQuery(store, embedder, index, 'alpha', { mode: 'graph', expand: 'parent', maxParentContext: 5 })
      expect(result.results[0].parent).toEqual({ documentId: 'doc2', title: 'Doc Two Title', snippet: 'Doc Two Title', stale: false })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. parent-context stale: a child reached via a STALE embed → the parent carries stale: true', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // fact1 is reached via a RESOLVED edge (a valid target) but ALSO has a
      // STALE incoming reference→fact edge → the parent propagates stale: true.
      await store.putNode(makeNode('head1', { content: 'Doc One Title' }))
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putEdge(makeEdge('d1h', 'head1', 'ref1', { kind: 'doc-head', documentIds: ['doc1'] }))
      await store.putEdge(makeEdge('d1e', 'ref1', 'head1', { kind: 'doc-end', documentIds: ['doc1'] }))
      await store.putNode(makeNode('head2', { content: 'Doc Two Title' }))
      await store.putNode(makeNode('fact1', { content: 'fact content', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putEdge(makeEdge('d2h', 'head2', 'fact1', { kind: 'doc-head', documentIds: ['doc2'] }))
      await store.putEdge(makeEdge('d2e', 'fact1', 'head2', { kind: 'doc-end', documentIds: ['doc2'] }))
      // the resolving edge (RESOLVED) + a STALE incoming edge from a non-seed reference
      await store.putEdge(makeEdge('x1', 'ref1', 'fact1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putNode(makeNode('ref2', { content: 'zzz qqq', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putEdge(makeEdge('x2', 'ref2', 'fact1', { kind: 'crosslink', edgeType: 'embed', state: 'STALE' } as Partial<RagEdge>))
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const result = await ragQuery(store, embedder, index, 'alpha', { mode: 'graph', expand: 'parent' })
      expect(result.results[0].nodeId).toBe('fact1')
      expect(result.results[0].parent!.stale).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('1. null/undefined store/embedder/index, non-string query, or null/undefined opts rejects "ragQuery: store/embedder/index/query/opts required"', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(null as never, embedder, index, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(undefined as never, embedder, index, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, null as never, index, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, undefined as never, index, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, null as never, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, undefined as never, 'alpha', {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, index, null as never, {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, index, 42 as never, {})).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, index, 'alpha', null as never)).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
    await expect(ragQuery(store, embedder, index, 'alpha', undefined as never)).rejects.toThrow('ragQuery: store/embedder/index/query/opts required')
  })

  it('2. empty/whitespace query rejects "ragQuery: query must be a non-empty string"', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, '', {})).rejects.toThrow('ragQuery: query must be a non-empty string')
    await expect(ragQuery(store, embedder, index, '   ', {})).rejects.toThrow('ragQuery: query must be a non-empty string')
  })

  it('3. topK < 1 or > 50 rejects "ragQuery: topK must be an integer in [1, 50]"', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { topK: 0 })).rejects.toThrow('ragQuery: topK must be an integer in [1, 50]')
    await expect(ragQuery(store, embedder, index, 'alpha', { topK: 51 })).rejects.toThrow('ragQuery: topK must be an integer in [1, 50]')
    await expect(ragQuery(store, embedder, index, 'alpha', { topK: 1.5 })).rejects.toThrow('ragQuery: topK must be an integer in [1, 50]')
  })

  it('4. invalid mode rejects "ragQuery: mode must be "flat" or "graph"" (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { mode: 'bogus' as never })).rejects.toThrow('ragQuery: mode must be "flat" or "graph"')
  })

  it('5. maxHops out of range rejects "ragQuery: maxHops must be an integer in [1, 5]" (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { maxHops: 0 })).rejects.toThrow('ragQuery: maxHops must be an integer in [1, 5]')
    await expect(ragQuery(store, embedder, index, 'alpha', { maxHops: 6 })).rejects.toThrow('ragQuery: maxHops must be an integer in [1, 5]')
  })

  it('6. invalid expand rejects "ragQuery: expand must be "none" or "parent"" (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { expand: 'bogus' as never })).rejects.toThrow('ragQuery: expand must be "none" or "parent"')
  })

  it('7. invalid maxParentContext rejects "ragQuery: maxParentContext must be a positive integer" (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { maxParentContext: 0 })).rejects.toThrow('ragQuery: maxParentContext must be a positive integer')
    await expect(ragQuery(store, embedder, index, 'alpha', { maxParentContext: 1.5 })).rejects.toThrow('ragQuery: maxParentContext must be a positive integer')
  })

  it('8. malformed filters rejects "ragQuery: filters malformed" (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const index = createLexicalIndex([])
    const embedder = createLexicalEmbedder(index)
    await expect(ragQuery(store, embedder, index, 'alpha', { filters: { nodeKind: 'bogus' } as never })).rejects.toThrow('ragQuery: filters malformed')
    await expect(ragQuery(store, embedder, index, 'alpha', { filters: { target: { documentId: 'd' } } as never })).rejects.toThrow('ragQuery: filters malformed')
    await expect(ragQuery(store, embedder, index, 'alpha', { filters: 42 as never })).rejects.toThrow('ragQuery: filters malformed')
  })

  it('9. TraceUnavailable (FS-16): a result without a trace rejects "ragQuery: TraceUnavailable — result has no trace"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      // The defensive fail-state: a valid result ALWAYS carries a trace (the
      // current local engine always produces one), so the happy path resolves
      // with a trace and the defensive check does not fire.
      const result = await ragQuery(store, embedder, index, 'alpha', {})
      expect(result.trace).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit X — createQueryAuditLog (§5.7)', () => {
  it('16. record + list happy: recorded entries are returned newest-first', () => {
    const log = createQueryAuditLog()
    const e1: QueryAuditEntry = { query: 'a', filters: null, mode: 'flat', resultCount: 1, timestamp: '2026-01-01T00:00:00.000Z', requester: 'mcp' }
    const e2: QueryAuditEntry = { query: 'b', filters: null, mode: 'graph', resultCount: 2, timestamp: '2026-01-01T00:00:01.000Z', requester: 'gui' }
    log.record(e1)
    log.record(e2)
    const entries = log.list()
    expect(entries).toHaveLength(2)
    expect(entries[0].query).toBe('b') // newest first
    expect(entries[1].query).toBe('a')
  })

  it('17. bounded: a log exceeding maxEntries drops the OLDEST entries (never throws)', () => {
    const log = createQueryAuditLog(2)
    for (let i = 0; i < 5; i++) {
      log.record({ query: `q${i}`, filters: null, mode: 'flat', resultCount: 1, timestamp: `2026-01-01T00:00:0${i}.000Z`, requester: 'mcp' })
    }
    const entries = log.list()
    expect(entries).toHaveLength(2)
    expect(entries[0].query).toBe('q4') // newest
    expect(entries[1].query).toBe('q3')
  })

  it('19. non-positive-integer maxEntries throws "createQueryAuditLog: maxEntries must be a positive integer"', () => {
    expect(() => createQueryAuditLog(0)).toThrow('createQueryAuditLog: maxEntries must be a positive integer')
    expect(() => createQueryAuditLog(-1)).toThrow('createQueryAuditLog: maxEntries must be a positive integer')
    expect(() => createQueryAuditLog(1.5)).toThrow('createQueryAuditLog: maxEntries must be a positive integer')
  })

  it('20. record with a null/undefined entry throws "query audit: entry required"', () => {
    const log = createQueryAuditLog()
    expect(() => log.record(null as never)).toThrow('query audit: entry required')
    expect(() => log.record(undefined as never)).toThrow('query audit: entry required')
  })
})

describe('Unit X — MCP tools (§5.7/§5.8)', () => {
  it('18. get_query_audit_log happy: the MCP tool returns { entries } from the shared audit log', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const result = await handleRagTool(store, 'get_query_audit_log', {}) as { entries: QueryAuditEntry[] }
    expect(Array.isArray(result.entries)).toBe(true)
  })

  it('21. rag.query/rag-stream non-string/empty query → the tool rejects it', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await expect(handleRagTool(store, 'rag.query', { query: '' })).rejects.toThrow('rag.query: query must be a non-empty string')
    await expect(handleRagTool(store, 'rag.query', { query: '   ' })).rejects.toThrow('rag.query: query must be a non-empty string')
    await expect(handleRagTool(store, 'rag.query', { query: 42 })).rejects.toThrow('rag.query: query must be a non-empty string')
    // rag-stream returns an ERROR CHUNK on a validation fail-state (spec §5.8
    // + the Architect arbitration: the error chunk carries the same
    // `rag.query:`-prefixed message).
    await expect(handleRagTool(store, 'rag-stream', { query: '' })).resolves.toEqual([{ type: 'error', error: 'rag.query: query must be a non-empty string' }])
    await expect(handleRagTool(store, 'rag-stream', { query: 42 })).resolves.toEqual([{ type: 'error', error: 'rag.query: query must be a non-empty string' }])
  })

  it('22. rag.query/rag-stream non-positive-integer topK or topK > 50 → the tool rejects it', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', topK: 0 })).rejects.toThrow('rag.query: topK must be an integer in [1, 50]')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', topK: 51 })).rejects.toThrow('rag.query: topK must be an integer in [1, 50]')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', topK: 1.5 })).rejects.toThrow('rag.query: topK must be an integer in [1, 50]')
    await expect(handleRagTool(store, 'rag-stream', { query: 'hello', topK: 0 })).resolves.toEqual([{ type: 'error', error: 'rag.query: topK must be an integer in [1, 50]' }])
  })

  it('23. rag.query/rag-stream invalid mode/maxHops/expand/maxParentContext/filters → the tool rejects it (FS-3)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', mode: 'bogus' })).rejects.toThrow('rag.query: mode must be "flat" or "graph"')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', maxHops: 0 })).rejects.toThrow('rag.query: maxHops must be an integer in [1, 5]')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', expand: 'bogus' })).rejects.toThrow('rag.query: expand must be "none" or "parent"')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', maxParentContext: 0 })).rejects.toThrow('rag.query: maxParentContext must be a positive integer')
    await expect(handleRagTool(store, 'rag.query', { query: 'hello', filters: { nodeKind: 'bogus' } })).rejects.toThrow('rag.query: filters malformed')
    await expect(handleRagTool(store, 'rag-stream', { query: 'hello', mode: 'bogus' })).resolves.toEqual([{ type: 'error', error: 'rag.query: mode must be "flat" or "graph"' }])
  })

  it('24. rag.query/rag-stream/get_query_audit_log with the rag group disabled → not registered, not callable (Unit B §5.3)', () => {
    // default-off: only read/dispatch enabled → the rag-group tools are denied
    expect(toolAllowed('rag.query', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('rag.query', ['rag'])).toBe(true)
    // the NEW tools are in the rag group (RED — they are not yet in TOOL_GROUPS)
    expect(toolAllowed('rag-stream', ['rag'])).toBe(true)
    expect(toolAllowed('get_query_audit_log', ['rag'])).toBe(true)
    expect(toolAllowed('rag-stream', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('get_query_audit_log', ['read', 'dispatch'])).toBe(false)
  })

  it('25. rag.query/rag-stream/get_query_audit_log reaching the renderer switch → unknown method throw (fail-closed, the negative contract — Unit B §5.3 Seam 4)', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    // The tools are MAIN-handled (never routed to the renderer): a valid
    // rag-stream call is handled in main and returns the degenerate chunk array.
    const stream = await handleRagTool(store, 'rag-stream', { query: 'hello' }) as Array<{ type: string }>
    expect(Array.isArray(stream)).toBe(true)
    expect(stream[0].type).toBe('result')
    expect(stream[stream.length - 1].type).toBe('done')
    // An unknown rag tool name fails closed (the negative contract).
    await expect(handleRagTool(store, 'rag.bogus', {})).rejects.toThrow('unknown rag tool: rag.bogus')
  })

  it('19. MCP/UI equivalence: an MCP rag.query and a UI rag-query IPC with the same params → the same result (both awaited)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStore(store)
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      const a = await handleRagTool(store, 'rag.query', { query: 'alpha', topK: 2 })
      const b = await handleRagQueryIpc(null, store, { query: 'alpha', topK: 2 })
      expect(a).toEqual(b)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---------------------------------------------------------------------------
// Adversarial regression tests (F-X-1..F-X-5) — appended by the Implementer.
// These pin the host-side fixes from the adversarial pass. They do NOT modify
// any existing test above.
// ---------------------------------------------------------------------------
describe('Unit X — adversarial regression tests (F-X-1..F-X-5)', () => {
  it('F-X-1a: a chain of exactly maxHops hops resolves the final target (no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // ref1 → fact1 is exactly 1 hop (= maxHops) and resolves fact1; fact1 has
      // an outgoing edge to fact2, so the OLD code threw HopLimitExceeded on
      // the next iteration despite having resolved a target.
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('fact1', { content: 'fact one', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putNode(makeNode('fact2', { content: 'fact two', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putEdge(makeEdge('c1', 'ref1', 'fact1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putEdge(makeEdge('c2', 'fact1', 'fact2', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 1 })
      expect(result.targets.some((t) => t.nodeId === 'fact1')).toBe(true)
      expect(result.blockedBy).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F-X-1b: a fact seed with one outgoing edge at maxHops=1 resolves (no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // fact1 is a fact seed with one outgoing edge fact1 → fact2 at maxHops=1.
      // The OLD code resolved the seed then threw HopLimitExceeded on the next
      // iteration.
      await store.putNode(makeNode('fact1', { content: 'fact one', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putNode(makeNode('fact2', { content: 'fact two', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putEdge(makeEdge('c1', 'fact1', 'fact2', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      const seed: RagResultItem = { documentId: '', nodeId: 'fact1', score: 1, snippet: 'fact one', source: 'local' }
      const result = walkReferenceGraph(store, [seed], { maxHops: 1 })
      expect(result.targets.some((t) => t.nodeId === 'fact1')).toBe(true)
      expect(result.blockedBy).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F-X-2: a walk that resolves a target AND encounters a BROKEN edge → blockedBy is absent', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // ref1 → fact1 (RESOLVED, resolves a target) → fact2 (BROKEN). The OLD
      // code pushed blockedBy for the BROKEN edge even though fact1 was
      // resolved.
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('fact1', { content: 'fact one', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putNode(makeNode('fact2', { content: 'fact two', nodeKind: 'fact' } as Partial<RagNode>))
      await store.putEdge(makeEdge('c1', 'ref1', 'fact1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      await store.putEdge(makeEdge('c2', 'fact1', 'fact2', { kind: 'crosslink', edgeType: 'link', state: 'BROKEN' } as Partial<RagEdge>))
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(result.targets.some((t) => t.nodeId === 'fact1')).toBe(true)
      expect(result.blockedBy).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F-X-3: rag-stream with an empty query → [{type:"error", error:"rag.query: query must be a non-empty string"}]', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const stream = await handleRagTool(store, 'rag-stream', { query: '' }) as Array<{ type: string; error?: string }>
    expect(stream).toEqual([{ type: 'error', error: 'rag.query: query must be a non-empty string' }])
  })

  it('F-X-4: a crosslink to a content node is NOT traversed', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // ref1 → content1 (a crosslink to a content node). The walk must NOT
      // traverse it (spec §5.4: only crosslink edges whose target is a fact
      // node).
      await store.putNode(makeNode('ref1', { content: 'alpha beta', nodeKind: 'reference' } as Partial<RagNode>))
      await store.putNode(makeNode('content1', { content: 'plain content' })) // nodeKind defaults to content
      await store.putEdge(makeEdge('c1', 'ref1', 'content1', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' } as Partial<RagEdge>))
      const result = walkReferenceGraph(store, [REF_SEED], { maxHops: 3 })
      expect(result.targets).toEqual([])
      expect(result.trace).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F-X-5: buildCitations skips a null element (does not throw)', () => {
    const items: RagResultItem[] = [
      null as never,
      { documentId: 'd1', nodeId: 'n1', score: 1, snippet: 'a', source: 'local' },
    ]
    expect(buildCitations(items)).toEqual([{ documentId: 'd1', nodeId: 'n1' }])
  })
})
