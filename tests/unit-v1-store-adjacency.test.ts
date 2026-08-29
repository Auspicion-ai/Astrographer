// tests/unit-v1-store-adjacency.test.ts — Unit V1: store adjacency
// (docs/specs/unit-v1-store-adjacency.md §5.6 happy-path states + §5.7
// fail-states). The RED set for the new `RagStore` adjacency methods
// (edgesFrom/edgesTo/edgesByKind/edgesForDocument/docHeadForDocument), the
// shared PURE adjacency core (buildAdjacencyIndex + the 5 query helpers), the
// lazy O(E) index + invalidation across all mutation paths, and the read-only
// createSnapshotStore(nodes, edges) adapter.
//
// Follows the rag-store.test.ts conventions (vitest node environment, `.js`
// import suffix for the main-process ESM module, temp dirs via node:fs).
//
// The mutating methods (putNode/removeNode/putEdge/removeEdge/undo/redo/
// applyBatch) are async and route through the single-writer queue, so every
// call is awaited here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  createSnapshotStore,
  buildAdjacencyIndex,
  edgesFromIndex,
  edgesToIndex,
  edgesByKindIndex,
  edgesForDocumentIndex,
  docHeadForDocumentIndex,
  type RagStore,
  type RagNode,
  type RagEdge,
  type AdjacencyIndex,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-v1-'))
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

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

// The standard adjacency fixture (spec §5.6 happy-path 2): a doc-flow spine
// (doc-head/next-section/doc-end scoped to 'doc') + a global doc-child edge +
// two parent-child edges. Store order is the array order.
const FIXTURE_EDGES: RagEdge[] = [
  makeEdge('e1', 'a', 'c'), // parent-child
  makeEdge('e2', 'head', 'a', { kind: 'doc-head', documentIds: ['doc'] }),
  makeEdge('e3', 'a', 'b', { kind: 'next-section', documentIds: ['doc'] }),
  makeEdge('e4', 'b', 'head', { kind: 'doc-end', documentIds: ['doc'] }),
  makeEdge('e5', 'a', 'd', { kind: 'doc-child' }), // global (no documentIds)
  makeEdge('e6', 'b', 'd'), // parent-child
]
const FIXTURE_NODE_IDS = ['head', 'a', 'b', 'c', 'd']

// Seed a fresh JSON store with the standard fixture (nodes first, then edges —
// putEdge rejects a missing endpoint).
async function seedStore(store: RagStore): Promise<void> {
  for (const id of FIXTURE_NODE_IDS) {
    await store.putNode(makeNode(id))
  }
  for (const e of FIXTURE_EDGES) {
    await store.putEdge(e)
  }
}

describe('Unit V1 — shared PURE adjacency core: buildAdjacencyIndex (§5.1/§5.6/§5.7)', () => {
  it('1. buildAdjacencyIndex([]) → an index with all-empty maps, no throw', () => {
    const index = buildAdjacencyIndex([])
    expect(index.from.size).toBe(0)
    expect(index.to.size).toBe(0)
    expect(index.kind.size).toBe(0)
    expect(index.document.size).toBe(0)
    expect(index.docHead.size).toBe(0)
  })

  it('2. buildAdjacencyIndex(populated) → from/to/kind/document/docHead maps populated in one O(E) pass', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    // from: source → edges (store order)
    expect(index.from.get('a')!.map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
    expect(index.from.get('b')!.map((e) => e.id)).toEqual(['e4', 'e6'])
    expect(index.from.get('head')!.map((e) => e.id)).toEqual(['e2'])
    // to: target → edges (store order)
    expect(index.to.get('d')!.map((e) => e.id)).toEqual(['e5', 'e6'])
    expect(index.to.get('c')!.map((e) => e.id)).toEqual(['e1'])
    // kind: kind → edges (store order)
    expect(index.kind.get('parent-child')!.map((e) => e.id)).toEqual(['e1', 'e6'])
    expect(index.kind.get('doc-child')!.map((e) => e.id)).toEqual(['e5'])
    expect(index.kind.get('doc-head')!.map((e) => e.id)).toEqual(['e2'])
    // document: doc-flow edges scoped by documentIds + ALL doc-child edges
    expect(index.document.get('doc')!.map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
    // docHead: source of the first doc-head edge whose documentIds includes the id
    expect(index.docHead.get('doc')).toBe('head')
  })

  it('3. buildAdjacencyIndex with null/undefined/non-array edges throws "buildAdjacencyIndex: edges must be an array"', () => {
    expect(() => buildAdjacencyIndex(null as never)).toThrow('buildAdjacencyIndex: edges must be an array')
    expect(() => buildAdjacencyIndex(undefined as never)).toThrow('buildAdjacencyIndex: edges must be an array')
    expect(() => buildAdjacencyIndex(42 as never)).toThrow('buildAdjacencyIndex: edges must be an array')
  })
})

describe('Unit V1 — shared PURE adjacency core: query helpers (§5.1/§5.6/§5.7)', () => {
  it('4. edgesFromIndex happy: edges whose source is the id, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesFromIndex(index, 'a').map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
  })

  it('5. edgesToIndex happy: edges whose target is the id, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesToIndex(index, 'd').map((e) => e.id)).toEqual(['e5', 'e6'])
  })

  it('6. edgesByKindIndex happy: edges of the kind, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesByKindIndex(index, 'doc-child').map((e) => e.id)).toEqual(['e5'])
    expect(edgesByKindIndex(index, 'parent-child').map((e) => e.id)).toEqual(['e1', 'e6'])
  })

  it('7. edgesForDocumentIndex happy: doc-flow edges scoped by documentIds + ALL doc-child edges', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesForDocumentIndex(index, 'doc').map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
  })

  it('8. docHeadForDocumentIndex happy: returns the head node id', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(docHeadForDocumentIndex(index, 'doc')).toBe('head')
  })

  it('9. docHeadForDocumentIndex no head: a document with no doc-head edge → undefined', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(docHeadForDocumentIndex(index, 'ghost')).toBeUndefined()
  })

  it('10. multiple-heads rule: the FIRST doc-head edge in store order wins (deterministic)', () => {
    const e1 = makeEdge('e1', 'head1', 'a', { kind: 'doc-head', documentIds: ['doc'] })
    const e2 = makeEdge('e2', 'head2', 'b', { kind: 'doc-head', documentIds: ['doc'] })
    const index = buildAdjacencyIndex([e1, e2])
    expect(docHeadForDocumentIndex(index, 'doc')).toBe('head1')
  })

  it('11. unmatched id → empty array (no throw) for all four edge-array helpers', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesFromIndex(index, 'ghost')).toEqual([])
    expect(edgesToIndex(index, 'ghost')).toEqual([])
    expect(edgesByKindIndex(index, 'crosslink')).toEqual([])
    expect(edgesForDocumentIndex(index, 'ghost')).toEqual([])
  })

  it('12. null/undefined index → throws "<helper>: index required"', () => {
    expect(() => edgesFromIndex(null as never, 'a')).toThrow('edgesFromIndex: index required')
    expect(() => edgesToIndex(null as never, 'a')).toThrow('edgesToIndex: index required')
    expect(() => edgesByKindIndex(null as never, 'doc-child')).toThrow('edgesByKindIndex: index required')
    expect(() => edgesForDocumentIndex(null as never, 'doc')).toThrow('edgesForDocumentIndex: index required')
    expect(() => docHeadForDocumentIndex(null as never, 'doc')).toThrow('docHeadForDocumentIndex: index required')
  })

  it('13. non-string/empty-string source/target/documentId → throws "<helper>: <arg> must be a non-empty string"', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(() => edgesFromIndex(index, '')).toThrow('edgesFromIndex: source must be a non-empty string')
    expect(() => edgesFromIndex(index, null as never)).toThrow('edgesFromIndex: source must be a non-empty string')
    expect(() => edgesToIndex(index, '')).toThrow('edgesToIndex: target must be a non-empty string')
    expect(() => edgesToIndex(index, null as never)).toThrow('edgesToIndex: target must be a non-empty string')
    expect(() => edgesForDocumentIndex(index, '')).toThrow('edgesForDocumentIndex: documentId must be a non-empty string')
    expect(() => edgesForDocumentIndex(index, null as never)).toThrow('edgesForDocumentIndex: documentId must be a non-empty string')
    expect(() => docHeadForDocumentIndex(index, '')).toThrow('docHeadForDocumentIndex: documentId must be a non-empty string')
    expect(() => docHeadForDocumentIndex(index, null as never)).toThrow('docHeadForDocumentIndex: documentId must be a non-empty string')
  })

  it('14. edgesByKindIndex with an invalid kind → throws "edgesByKindIndex: invalid kind"', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(() => edgesByKindIndex(index, 'bogus' as never)).toThrow('edgesByKindIndex: invalid kind')
  })
})

describe('Unit V1 — JSON store adjacency methods (§5.2/§5.6/§5.7)', () => {
  it('15. edgesFrom happy: returns the matching edges as fresh shallow copies, in store order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
      // fresh array + shallow copies: mutating a returned edge does not affect the store
      const r1 = store.edgesFrom('a')
      const r2 = store.edgesFrom('a')
      expect(r1).not.toBe(r2)
      expect(r1.map((e) => e.id)).toEqual(r2.map((e) => e.id))
      const e5 = r1.find((e) => e.id === 'e5')!
      e5.order = 999
      expect(store.edgesFrom('a').find((e) => e.id === 'e5')!.order).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('16. edgesTo happy: returns the matching edges, in store order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesTo('d').map((e) => e.id)).toEqual(['e5', 'e6'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('17. edgesByKind happy: returns the edges of the kind, in store order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesByKind('doc-child').map((e) => e.id)).toEqual(['e5'])
      expect(store.edgesByKind('parent-child').map((e) => e.id)).toEqual(['e1', 'e6'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('18. edgesForDocument happy: doc-flow edges scoped by documentIds + ALL doc-child edges', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesForDocument('doc').map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('19. docHeadForDocument happy: returns the head node id', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.docHeadForDocument('doc')).toBe('head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('20. unmatched id → empty array / undefined (no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesFrom('ghost')).toEqual([])
      expect(store.edgesTo('ghost')).toEqual([])
      expect(store.edgesByKind('crosslink')).toEqual([])
      expect(store.edgesForDocument('ghost')).toEqual([])
      expect(store.docHeadForDocument('ghost')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('21. non-string/empty-string arg → throws "rag <method>: <arg> must be a non-empty string"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(() => store.edgesFrom('')).toThrow('rag edgesFrom: source must be a non-empty string')
      expect(() => store.edgesFrom(null as never)).toThrow('rag edgesFrom: source must be a non-empty string')
      expect(() => store.edgesTo('')).toThrow('rag edgesTo: target must be a non-empty string')
      expect(() => store.edgesTo(null as never)).toThrow('rag edgesTo: target must be a non-empty string')
      expect(() => store.edgesForDocument('')).toThrow('rag edgesForDocument: documentId must be a non-empty string')
      expect(() => store.edgesForDocument(null as never)).toThrow('rag edgesForDocument: documentId must be a non-empty string')
      expect(() => store.docHeadForDocument('')).toThrow('rag docHeadForDocument: documentId must be a non-empty string')
      expect(() => store.docHeadForDocument(null as never)).toThrow('rag docHeadForDocument: documentId must be a non-empty string')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('22. edgesByKind with an invalid kind → throws "rag edgesByKind: invalid kind"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(() => store.edgesByKind('bogus' as never)).toThrow('rag edgesByKind: invalid kind')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit V1 — lazy O(E) index + invalidation across all mutation paths (§5.3/§5.6 happy 14)', () => {
  it('23. putEdge invalidates: a subsequent adjacency query reflects the new edge', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      expect(store.edgesFrom('a')).toEqual([]) // builds the index
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1']) // invalidated + rebuilt
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('24. removeEdge invalidates: a subsequent adjacency query drops the removed edge', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.removeEdge('e1')
      expect(store.edgesFrom('a')).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('25. removeNode cascade invalidates: a subsequent adjacency query drops the cascaded edges', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.removeNode('a')
      expect(store.edgesFrom('a')).toEqual([]) // edge cascaded
      expect(store.edgesTo('c')).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('26. applyBatch invalidates: a subsequent adjacency query reflects the batch', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      expect(store.edgesFrom('a')).toEqual([])
      const result = await store.applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'a', 'c') }])
      expect(result.ok).toBe(true)
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('27. undo invalidates: a subsequent adjacency query reflects the undone state', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.undo() // undoes the edge-add
      expect(store.edgesFrom('a')).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('28. redo invalidates: a subsequent adjacency query reflects the re-applied state', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.undo()
      expect(store.edgesFrom('a')).toEqual([])
      await store.redo()
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit V1 — quarantine exclusion (§5.3/§5.6 happy 15)', () => {
  it('29. a quarantined edge is NOT returned by any adjacency query (mirrors listEdges)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      await store.putEdge(makeEdge('e1', 'a', 'c', { kind: 'doc-child' }))
      // Tamper the on-disk edge WITHOUT updating the stored hash → quarantined on reload.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const tampered = onDisk.edges.find((e: RagEdge) => e.id === 'e1')
      tampered.order = 5
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().quarantined).toContain('e1')
      expect(reloaded.listEdges()).toEqual([])
      expect(reloaded.edgesByKind('doc-child')).toEqual([])
      expect(reloaded.edgesFrom('a')).toEqual([])
      expect(reloaded.edgesTo('c')).toEqual([])
      expect(reloaded.edgesForDocument('doc')).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit V1 — createSnapshotStore(nodes, edges) read-only adapter (§5.4/§5.6/§5.7)', () => {
  it('30. parity (amendment 3): the SAME adjacency queries against a JSON store and a snapshot store return IDENTICAL results', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      const snap = createSnapshotStore(store.listNodes(), store.listEdges())
      expect(snap.edgesFrom('a').map((e) => e.id)).toEqual(store.edgesFrom('a').map((e) => e.id))
      expect(snap.edgesTo('d').map((e) => e.id)).toEqual(store.edgesTo('d').map((e) => e.id))
      expect(snap.edgesByKind('doc-child').map((e) => e.id)).toEqual(store.edgesByKind('doc-child').map((e) => e.id))
      expect(snap.edgesForDocument('doc').map((e) => e.id)).toEqual(store.edgesForDocument('doc').map((e) => e.id))
      expect(snap.docHeadForDocument('doc')).toEqual(store.docHeadForDocument('doc'))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('31. read methods: getNode/listNodes/getEdge/listEdges/status/journal/undoDepth/redoDepth behave as a read-only store', () => {
    const nodes = FIXTURE_NODE_IDS.map((id) => makeNode(id))
    const snap = createSnapshotStore(nodes, FIXTURE_EDGES)
    expect(snap.getNode('a')).toBeDefined()
    expect(snap.getNode('a')!.content).toBe('content-a')
    expect(snap.getNode('ghost')).toBeUndefined()
    expect(snap.listNodes().map((n) => n.id).sort()).toEqual([...FIXTURE_NODE_IDS].sort())
    expect(snap.getEdge('e1')).toBeDefined()
    expect(snap.getEdge('e1')!.source).toBe('a')
    expect(snap.getEdge('ghost')).toBeUndefined()
    expect(snap.listEdges().map((e) => e.id).sort()).toEqual(FIXTURE_EDGES.map((e) => e.id).sort())
    expect(snap.status()).toEqual({
      corrupt: false,
      quarantined: [],
      loadedNodes: expect.arrayContaining(FIXTURE_NODE_IDS),
      loadedEdges: expect.arrayContaining(FIXTURE_EDGES.map((e) => e.id)),
    })
    expect(snap.journal()).toEqual([])
    expect(snap.undoDepth()).toBe(0)
    expect(snap.redoDepth()).toBe(0)
  })

  it('32. empty nodes/edges → a valid empty adapter (no throw)', () => {
    const snap = createSnapshotStore([], [])
    expect(snap.listNodes()).toEqual([])
    expect(snap.listEdges()).toEqual([])
    expect(snap.status()).toEqual({ corrupt: false, quarantined: [], loadedNodes: [], loadedEdges: [] })
    expect(snap.edgesFrom('a')).toEqual([])
    expect(snap.docHeadForDocument('doc')).toBeUndefined()
  })

  it('33. null/undefined/non-array nodes or edges → throws "createSnapshotStore: nodes/edges must be arrays"', () => {
    expect(() => createSnapshotStore(null as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore(undefined as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore(42 as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], null as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], undefined as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], 42 as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
  })

  it('34. mutating methods throw "createSnapshotStore: read-only" (fail-closed)', () => {
    const snap = createSnapshotStore([], [])
    expect(() => snap.putNode(makeNode('n1'))).toThrow('createSnapshotStore: read-only')
    expect(() => snap.removeNode('n1')).toThrow('createSnapshotStore: read-only')
    expect(() => snap.putEdge(makeEdge('e1', 'a', 'b'))).toThrow('createSnapshotStore: read-only')
    expect(() => snap.removeEdge('e1')).toThrow('createSnapshotStore: read-only')
    expect(() => snap.undo()).toThrow('createSnapshotStore: read-only')
    expect(() => snap.redo()).toThrow('createSnapshotStore: read-only')
    expect(() => snap.enqueue(() => {})).toThrow('createSnapshotStore: read-only')
    expect(() => snap.applyBatch([])).toThrow('createSnapshotStore: read-only')
  })
})
