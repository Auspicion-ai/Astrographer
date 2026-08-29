// tests/unit-v1-store-adjacency-adversarial.test.ts — Unit V1 adversarial-fix
// regression tests (docs/specs/unit-v1-store-adjacency.md §3a). Each test pins
// one HOST finding fixed in src/main/rag-store.ts:
//
//   MED-1  createSnapshotStore aliases the caller's input arrays → internal
//          inconsistency. Fixed: defensively copy nodes/edges at construction.
//   MED-2  duplicate documentIds → duplicate edges in edgesForDocument (parity
//          gap). Fixed: dedupe documentIds in buildAdjacencyIndex.
//   MED-3  "Global" doc-child scoping is incomplete for documents with no
//          doc-flow edges. Documented limitation (a valid document always has a
//          doc-head) + regression test pinning the actual behavior.
//   LOW-4  throw-message divergence between the two stores. Fixed: the adapter
//          validates with the `rag <method>` prefix (matching the JSON store).
//   LOW-5  docHeadForDocument can return a dangling source id in
//          createSnapshotStore. Documented limitation (the adapter trusts its
//          input) + regression test pinning the actual behavior.
//   LOW-6  unnecessary index invalidation on no-op mutations (perf nit). Fixed:
//          gate invalidation on an actual edge-set change; regression test
//          confirms no correctness regression.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  createSnapshotStore,
  buildAdjacencyIndex,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-v1-adv-'))
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

describe('Unit V1 adversarial — MED-1: createSnapshotStore captures an immutable view', () => {
  it('mutating the source arrays after construction is NOT reflected in read or adjacency methods', () => {
    const nodes = [makeNode('a'), makeNode('b')]
    const edges = [makeEdge('e1', 'a', 'b', { kind: 'doc-child' })]
    const snap = createSnapshotStore(nodes, edges)

    // Mutate the caller's source arrays after construction.
    nodes.push(makeNode('c'))
    edges.push(makeEdge('e2', 'b', 'c'))
    edges[0].source = 'zzz'

    // Read methods reflect the captured view (the mutation is NOT reflected).
    expect(snap.listNodes().map((n) => n.id)).toEqual(['a', 'b'])
    expect(snap.listEdges().map((e) => e.id)).toEqual(['e1'])
    expect(snap.getNode('c')).toBeUndefined()
    expect(snap.getEdge('e2')).toBeUndefined()

    // Adjacency methods reflect the SAME captured view (no divergence).
    expect(snap.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    expect(snap.edgesFrom('zzz')).toEqual([])
    expect(snap.edgesTo('b').map((e) => e.id)).toEqual(['e1'])
    expect(snap.edgesTo('c')).toEqual([])
    expect(snap.edgesByKind('doc-child').map((e) => e.id)).toEqual(['e1'])
  })
})

describe('Unit V1 adversarial — MED-2: duplicate documentIds are deduped (parity)', () => {
  it('buildAdjacencyIndex pushes a duplicate-documentIds edge ONCE per document', () => {
    const e = makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] })
    const index = buildAdjacencyIndex([e])
    expect(index.document.get('doc')!.map((x) => x.id)).toEqual(['e1'])
    expect(index.docHead.get('doc')).toBe('a')
  })

  it('edgesForDocument returns the edge ONCE for a duplicate documentIds array, and the JSON store + snapshot adapter agree', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('b'))
      // The JSON store dedupes documentIds on write (validateEdgeShape).
      await store.putEdge(makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] }))
      expect(store.edgesForDocument('doc').map((e) => e.id)).toEqual(['e1'])

      // The snapshot adapter over the SAME raw edge (duplicate documentIds) must
      // also return the edge ONCE — parity with the JSON store (amendment 3).
      const rawEdge = makeEdge('e1', 'a', 'b', { kind: 'doc-head', documentIds: ['doc', 'doc'] })
      const snap = createSnapshotStore([makeNode('a'), makeNode('b')], [rawEdge])
      expect(snap.edgesForDocument('doc').map((e) => e.id)).toEqual(['e1'])
      expect(snap.edgesForDocument('doc').map((e) => e.id)).toEqual(store.edgesForDocument('doc').map((e) => e.id))
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('Unit V1 adversarial — MED-3: global doc-child scoping (documented limitation)', () => {
  it('a document with no doc-flow edge is NOT in docKeys, so a global doc-child edge is not returned for it', () => {
    // 'doc' has a doc-head edge (in docKeys); 'ghost' has no doc-flow edge.
    const edges = [
      makeEdge('e1', 'head', 'a', { kind: 'doc-head', documentIds: ['doc'] }),
      makeEdge('e2', 'a', 'b', { kind: 'doc-child' }), // global (no documentIds)
    ]
    const index = buildAdjacencyIndex(edges)
    // 'doc' is in docKeys → the global doc-child edge is scoped to it.
    expect(index.document.get('doc')!.map((e) => e.id)).toEqual(['e1', 'e2'])
    // 'ghost' has no doc-flow edge → NOT in docKeys → the global doc-child edge
    // is NOT returned for it (documented limitation: a valid document always has
    // a doc-head, so every valid document is in docKeys).
    expect(index.document.get('ghost')).toBeUndefined()
  })
})

describe('Unit V1 adversarial — LOW-4: throw-message parity between the two stores', () => {
  it('createSnapshotStore throws the "rag <method>" prefix messages (matching the JSON store)', () => {
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
})

describe('Unit V1 adversarial — LOW-5: docHeadForDocument trusts its input (documented limitation)', () => {
  it('a doc-head edge whose source is absent from the nodes array returns that id (the adapter trusts its input)', () => {
    const edges = [makeEdge('e1', 'ghost-head', 'a', { kind: 'doc-head', documentIds: ['doc'] })]
    const snap = createSnapshotStore([makeNode('a')], edges)
    expect(snap.docHeadForDocument('doc')).toBe('ghost-head')
    // The source node is absent → getNode returns undefined (dangling id).
    expect(snap.getNode('ghost-head')).toBeUndefined()
  })
})

describe('Unit V1 adversarial — LOW-6: no-op mutations do not corrupt the adjacency index', () => {
  it('no-op removeEdge/removeNode/empty applyBatch leave the adjacency index correct (no correctness regression)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('a'))
      await store.putNode(makeNode('b'))
      await store.putEdge(makeEdge('e1', 'a', 'b'))
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])

      // No-op removeEdge of a nonexistent edge.
      await store.removeEdge('ghost')
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])

      // No-op removeNode of a nonexistent node.
      await store.removeNode('ghost')
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])

      // Empty applyBatch (no-op).
      const result = await store.applyBatch([])
      expect(result.ok).toBe(true)
      expect(store.edgesFrom('a').map((e) => e.id)).toEqual(['e1'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})
