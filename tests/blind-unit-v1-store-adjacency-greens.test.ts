// tests/blind-unit-v1-store-adjacency-greens.test.ts
// BLIND-TEST green-scenario battery for Unit V1 (store adjacency).
// Derived from docs/specs/unit-v1-store-adjacency.md ONLY (§5.1–§5.7 + §3a
// adversarial resolutions). This is a fresh-agent re-run of the greens — the
// scenarios are authored from the spec, not from the implementation.
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
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-v1-blind-'))
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

// The spec §5.6 happy-path 2 fixture: a doc-flow spine (doc-head/next-section/
// doc-end scoped to 'doc') + a global doc-child edge + two parent-child edges.
// Store order = array order.
const FIXTURE_EDGES: RagEdge[] = [
  makeEdge('e1', 'a', 'c'), // parent-child
  makeEdge('e2', 'head', 'a', { kind: 'doc-head', documentIds: ['doc'] }),
  makeEdge('e3', 'a', 'b', { kind: 'next-section', documentIds: ['doc'] }),
  makeEdge('e4', 'b', 'head', { kind: 'doc-end', documentIds: ['doc'] }),
  makeEdge('e5', 'a', 'd', { kind: 'doc-child' }), // global (no documentIds)
  makeEdge('e6', 'b', 'd'), // parent-child
]
const FIXTURE_NODE_IDS = ['head', 'a', 'b', 'c', 'd']

async function seedStore(store: RagStore): Promise<void> {
  for (const id of FIXTURE_NODE_IDS) await store.putNode(makeNode(id))
  for (const e of FIXTURE_EDGES) await store.putEdge(e)
}

// ===========================================================================
// A. Shared PURE adjacency core (§5.1 / §5.6 happy 1–8 / §5.7 fail 1–5)
// ===========================================================================
describe('A. Shared PURE adjacency core', () => {
  it('A1. buildAdjacencyIndex([]) → all-empty maps, no throw', () => {
    const index = buildAdjacencyIndex([])
    expect(index.from.size).toBe(0)
    expect(index.to.size).toBe(0)
    expect(index.kind.size).toBe(0)
    expect(index.document.size).toBe(0)
    expect(index.docHead.size).toBe(0)
  })

  it('A2. buildAdjacencyIndex(populated) → from/to/kind/document/docHead populated in one O(E) pass', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(index.from.get('a')!.map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
    expect(index.from.get('b')!.map((e) => e.id)).toEqual(['e4', 'e6'])
    expect(index.from.get('head')!.map((e) => e.id)).toEqual(['e2'])
    expect(index.to.get('d')!.map((e) => e.id)).toEqual(['e5', 'e6'])
    expect(index.to.get('c')!.map((e) => e.id)).toEqual(['e1'])
    expect(index.kind.get('parent-child')!.map((e) => e.id)).toEqual(['e1', 'e6'])
    expect(index.kind.get('doc-child')!.map((e) => e.id)).toEqual(['e5'])
    expect(index.kind.get('doc-head')!.map((e) => e.id)).toEqual(['e2'])
    // document: doc-flow edges scoped by documentIds + ALL doc-child edges
    expect(index.document.get('doc')!.map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
    expect(index.docHead.get('doc')).toBe('head')
  })

  it('A3. edgesFromIndex happy: edges whose source is the id, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesFromIndex(index, 'a').map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
  })

  it('A4. edgesToIndex happy: edges whose target is the id, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesToIndex(index, 'd').map((e) => e.id)).toEqual(['e5', 'e6'])
  })

  it('A5. edgesByKindIndex happy: edges of the kind, in store order', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesByKindIndex(index, 'doc-child').map((e) => e.id)).toEqual(['e5'])
    expect(edgesByKindIndex(index, 'parent-child').map((e) => e.id)).toEqual(['e1', 'e6'])
  })

  it('A6. edgesForDocumentIndex happy: doc-flow edges scoped by documentIds + ALL doc-child edges', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesForDocumentIndex(index, 'doc').map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
  })

  it('A7. docHeadForDocumentIndex happy: returns the head node id', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(docHeadForDocumentIndex(index, 'doc')).toBe('head')
  })

  it('A8. docHeadForDocumentIndex no head: a document with no doc-head edge → undefined', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(docHeadForDocumentIndex(index, 'ghost')).toBeUndefined()
  })

  it('A9. multiple-heads rule: the FIRST doc-head edge in store order wins (deterministic)', () => {
    const e1 = makeEdge('e1', 'head1', 'a', { kind: 'doc-head', documentIds: ['doc'] })
    const e2 = makeEdge('e2', 'head2', 'b', { kind: 'doc-head', documentIds: ['doc'] })
    const index = buildAdjacencyIndex([e1, e2])
    expect(docHeadForDocumentIndex(index, 'doc')).toBe('head1')
  })

  it('A10. unmatched id → empty array (no throw) for all four edge-array helpers', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(edgesFromIndex(index, 'ghost')).toEqual([])
    expect(edgesToIndex(index, 'ghost')).toEqual([])
    expect(edgesByKindIndex(index, 'crosslink')).toEqual([])
    expect(edgesForDocumentIndex(index, 'ghost')).toEqual([])
  })

  it('A11. buildAdjacencyIndex null/undefined/non-array edges → throws "buildAdjacencyIndex: edges must be an array"', () => {
    expect(() => buildAdjacencyIndex(null as never)).toThrow('buildAdjacencyIndex: edges must be an array')
    expect(() => buildAdjacencyIndex(undefined as never)).toThrow('buildAdjacencyIndex: edges must be an array')
    expect(() => buildAdjacencyIndex(42 as never)).toThrow('buildAdjacencyIndex: edges must be an array')
  })

  it('A12. null/undefined index → throws "<helper>: index required"', () => {
    expect(() => edgesFromIndex(null as never, 'a')).toThrow('edgesFromIndex: index required')
    expect(() => edgesToIndex(null as never, 'a')).toThrow('edgesToIndex: index required')
    expect(() => edgesByKindIndex(null as never, 'doc-child')).toThrow('edgesByKindIndex: index required')
    expect(() => edgesForDocumentIndex(null as never, 'doc')).toThrow('edgesForDocumentIndex: index required')
    expect(() => docHeadForDocumentIndex(null as never, 'doc')).toThrow('docHeadForDocumentIndex: index required')
  })

  it('A13. non-string/empty-string source/target/documentId → throws "<helper>: <arg> must be a non-empty string"', () => {
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

  it('A14. edgesByKindIndex with an invalid kind → throws "edgesByKindIndex: invalid kind"', () => {
    const index = buildAdjacencyIndex(FIXTURE_EDGES)
    expect(() => edgesByKindIndex(index, 'bogus' as never)).toThrow('edgesByKindIndex: invalid kind')
  })
})

// ===========================================================================
// B. JSON store adjacency methods (§5.2 / §5.6 happy 9–11 / §5.7 fail 6–7)
// ===========================================================================
describe('B. JSON store adjacency methods', () => {
  it('B1. edgesFrom happy: fresh shallow copies, in store order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1', 'e3', 'e5'])
      const r1 = store.edgesFrom('a')
      const r2 = store.edgesFrom('a')
      expect(r1).not.toBe(r2) // fresh array
      const e5 = r1.find((e) => e.id === 'e5')!
      e5.order = 999 // shallow copy: mutating the returned edge does not affect the store
      expect(store.edgesFrom('a').find((e) => e.id === 'e5')!.order).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B2. edgesTo happy: returns the matching edges, in store order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesTo('d').map((e) => e.id)).toEqual(['e5', 'e6'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B3. edgesByKind happy: returns the edges of the kind, in store order', async () => {
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

  it('B4. edgesForDocument happy: doc-flow edges scoped by documentIds + ALL doc-child edges', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.edgesForDocument('doc').map((e) => e.id)).toEqual(['e2', 'e3', 'e4', 'e5'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B5. docHeadForDocument happy: returns the head node id', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store)
      expect(store.docHeadForDocument('doc')).toBe('head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B6. unmatched id → empty array / undefined (no throw)', async () => {
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

  it('B7. non-string/empty-string arg → throws "rag <method>: <arg> must be a non-empty string"', async () => {
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

  it('B8. edgesByKind with an invalid kind → throws "rag edgesByKind: invalid kind"', async () => {
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

// ===========================================================================
// C. Lazy O(E) index + invalidation across all 6 mutation paths (§5.3 / §5.6 happy 14)
// ===========================================================================
describe('C. Lazy index + invalidation across the 6 mutation paths', () => {
  it('C1. putEdge invalidates: a subsequent adjacency query reflects the new edge', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('c'))
      expect(store.edgesFrom('a')).toEqual([]) // builds the index
      await store.putEdge(makeEdge('e1', 'a', 'c'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C2. removeEdge invalidates: a subsequent adjacency query drops the removed edge', async () => {
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

  it('C3. removeNode cascade invalidates: a subsequent adjacency query drops the cascaded edges', async () => {
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

  it('C4. applyBatch invalidates: a subsequent adjacency query reflects the batch', async () => {
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

  it('C5. undo invalidates: a subsequent adjacency query reflects the undone state', async () => {
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

  it('C6. redo invalidates: a subsequent adjacency query reflects the re-applied state', async () => {
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

// ===========================================================================
// D. Quarantine exclusion (§5.3 / §5.6 happy 15)
// ===========================================================================
describe('D. Quarantine exclusion', () => {
  it('D1. a quarantined edge is NOT returned by any adjacency query (mirrors listEdges)', async () => {
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

// ===========================================================================
// E. createSnapshotStore(nodes, edges) read-only adapter (§5.4 / §5.6 happy 12–13 / §5.7 fail 8–9)
// ===========================================================================
describe('E. createSnapshotStore read-only adapter', () => {
  it('E1. parity (amendment 3): the SAME adjacency queries against a JSON store and a snapshot store return IDENTICAL results', async () => {
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

  it('E2. read methods: getNode/listNodes/getEdge/listEdges/status/journal/undoDepth/redoDepth behave as a read-only store', () => {
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

  it('E3. empty nodes/edges → a valid empty adapter (no throw)', () => {
    const snap = createSnapshotStore([], [])
    expect(snap.listNodes()).toEqual([])
    expect(snap.listEdges()).toEqual([])
    expect(snap.status()).toEqual({ corrupt: false, quarantined: [], loadedNodes: [], loadedEdges: [] })
    expect(snap.edgesFrom('a')).toEqual([])
    expect(snap.docHeadForDocument('doc')).toBeUndefined()
  })

  it('E4. null/undefined/non-array nodes or edges → throws "createSnapshotStore: nodes/edges must be arrays"', () => {
    expect(() => createSnapshotStore(null as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore(undefined as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore(42 as never, [])).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], null as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], undefined as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
    expect(() => createSnapshotStore([], 42 as never)).toThrow('createSnapshotStore: nodes/edges must be arrays')
  })

  it('E5. mutating methods throw "createSnapshotStore: read-only" (fail-closed)', () => {
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

// ===========================================================================
// F. Adversarial resolutions (§3a: MED-1..LOW-6)
// ===========================================================================
describe('F. Adversarial resolutions (§3a)', () => {
  it('F1. MED-1: createSnapshotStore captures an immutable view (source-array mutation NOT reflected)', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('e1', 'a', 'b', { kind: 'doc-child' })]
    const snap = createSnapshotStore(nodes, edges)
    nodes.push(makeNode('c'))
    edges.push(makeEdge('e2', 'b', 'c'))
    edges[0].source = 'zzz'
    expect(snap.listNodes().map((n) => n.id)).toEqual(['a', 'b'])
    expect(snap.listEdges().map((e) => e.id)).toEqual(['e1'])
    expect(snap.getNode('c')).toBeUndefined()
    expect(snap.getEdge('e2')).toBeUndefined()
    expect(snap.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    expect(snap.edgesFrom('zzz')).toEqual([])
    expect(snap.edgesTo('b').map((e) => e.id)).toEqual(['e1'])
    expect(snap.edgesTo('c')).toEqual([])
    expect(snap.edgesByKind('doc-child').map((e) => e.id)).toEqual(['e1'])
  })

  it('F2. MED-2: duplicate documentIds are deduped (parity between JSON store and snapshot adapter)', async () => {
    const e = makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] })
    const index = buildAdjacencyIndex([e])
    expect(index.document.get('doc')!.map((x) => x.id)).toEqual(['e1'])
    expect(index.docHead.get('doc')).toBe('a')

    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('b'))
      await store.putEdge(makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] }))
      expect(store.edgesForDocument('doc').map((x) => x.id)).toEqual(['e1'])
      const rawEdge = makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] })
      const snap = createSnapshotStore([makeNode('a'), makeNode('b')], [rawEdge])
      expect(snap.edgesForDocument('doc').map((x) => x.id)).toEqual(['e1'])
      expect(snap.edgesForDocument('doc').map((x) => x.id)).toEqual(store.edgesForDocument('doc').map((x) => x.id))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F3. MED-3: a document with no doc-flow edge is NOT in docKeys, so a global doc-child edge is not returned for it', () => {
    const edges = [
      makeEdge('e1', 'head', 'a', { kind: 'doc-head', documentIds: ['doc'] }),
      makeEdge('e2', 'a', 'b', { kind: 'doc-child' }),
    ]
    const index = buildAdjacencyIndex(edges)
    expect(index.document.get('doc')!.map((e) => e.id)).toEqual(['e1', 'e2'])
    expect(index.document.get('ghost')).toBeUndefined()
  })

  it('F4. LOW-4: createSnapshotStore throws the "rag <method>" prefix messages (matching the JSON store)', () => {
    const snap = createSnapshotStore([], [])
    expect(() => snap.edgesFrom('')).toThrow('rag edgesFrom: source must be a non-empty string')
    expect(() => snap.edgesFrom(null as never)).toThrow('rag edgesFrom: source must be a non-empty string')
    expect(() => snap.edgesTo('')).toThrow('rag edgesTo: target must be a non-empty string')
    expect(() => snap.edgesTo(null as never)).toThrow('rag edgesTo: target must be a non-empty string')
    expect(() => snap.edgesForDocument('')).toThrow('rag edgesForDocument: documentId must be a non-empty string')
    expect(() => snap.edgesForDocument(null as never)).toThrow('rag edgesForDocument: documentId must be a non-empty string')
    expect(() => snap.docHeadForDocument('')).toThrow('rag docHeadForDocument: documentId must be a non-empty string')
    expect(() => snap.docHeadForDocument(null as never)).toThrow('rag docHeadForDocument: documentId must be a non-empty string')
    expect(() => snap.edgesByKind('bogus' as never)).toThrow('rag edgesByKind: invalid kind')
  })

  it('F5. LOW-5: a doc-head edge whose source is absent from the nodes array returns that id (the adapter trusts its input)', () => {
    const edges = [makeEdge('e1', 'ghost-head', 'a', { kind: 'doc-head', documentIds: ['doc'] })]
    const snap = createSnapshotStore([makeNode('a')], edges)
    expect(snap.docHeadForDocument('doc')).toBe('ghost-head')
    expect(snap.getNode('ghost-head')).toBeUndefined()
  })

  it('F6. LOW-6: no-op removeEdge/removeNode/empty applyBatch leave the adjacency index correct (no correctness regression)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('b'))
      await store.putEdge(makeEdge('e1', 'a', 'b'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.removeEdge('ghost')
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      await store.removeNode('ghost')
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
      const result = await store.applyBatch([])
      expect(result.ok).toBe(true)
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})
