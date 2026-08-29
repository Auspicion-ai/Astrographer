// tests/unit-v2-scoped-traversal-mcp.test.ts — Unit V2: the scoped traversal +
// MCP refactor (docs/specs/unit-v2-scoped-traversal-mcp.md §5.1-§5.8). RED set
// for src/main/traversal.ts (the scoped `buildTraversal` walk +
// `computeDocumentSubgraph`) + src/main/mcp-server.ts (the `rag.get_document`
// refactor).
//
// The RED source: `computeDocumentSubgraph` (and the `DocumentSubgraph` type)
// do NOT exist yet in src/main/traversal.ts, so every test that loads them
// fails with "computeDocumentSubgraph: export does not exist yet (RED)". The
// scoped walk's adjacency-method enforcement (a `listNodes`/`listEdges`-only
// adapter must throw) is also RED — the current all-edges walk does NOT call
// the adjacency methods, so it does not throw. The tests that assert PRESERVED
// behavior (the equivalence, the verdict match, the identical MCP result, the
// edit-surface drop) are green-guards: they pass against the current walk and
// must stay green after the refactor.
//
// STATE ENUMERATION (from §5.6 happy paths + §5.7 fail-states):
//   computeDocumentSubgraph:
//     - valid doc-flow + doc-child nesting → docNodeIds = doc root + flow nodes
//       + transitive doc-children; edges = scoped doc-flow + doc-child among
//       the document's nodes (happy 8)
//     - empty document (no edges) → docNodeIds = { documentId }; edges = [] (happy 9)
//     - null/undefined store → throws 'computeDocumentSubgraph: store required' (fail 3)
//     - non-string/empty-string documentId → throws
//       'computeDocumentSubgraph: documentId must be a non-empty string' (fail 4)
//     - a listNodes/listEdges-only adapter → the adjacency call throws (amendment 4)
//   scoped buildTraversal walk:
//     - materialized-set equivalence to the current all-edges walk (happy 14 / amendment 1)
//     - edit-surface change: a node not reachable from the head is absent from
//       backRefs + the envelope (amendment 1)
//     - validateDocFlow pre-scoping verdict match, valid + each fail-state
//       (cycle/missing-node/missing-head/missing-end) (happy 18 / amendment 7)
//     - doc-child cycle → the seen set breaks the recursion, no throw (happy 12)
//     - a listNodes/listEdges-only adapter → buildTraversal throws (fail 2 / amendment 4)
//   rag.get_document:
//     - happy: { documentId, nodes, edges } with the document's node set + scoped edges (happy 10)
//     - empty document → { documentId, nodes: [<the doc root>], edges: [] } (happy 11)
//     - single-source identity: the traversal's docNodeIds === the MCP tool's
//       returned node set (happy 15 / amendment 2)
//     - identical result to the current handler (happy 17 / amendment 6)
//     - missing/empty documentId → throws 'rag.get_document: documentId required' (fail 5)
//     - null store → throws '<name>: no rag store configured' (fail 6)
//   rebuildBackRefs:
//     - returns the backRefs map for a snapshot (happy 13)
//     - buildTraversal does NOT throw when called through createSnapshotStore (amendment 4)
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildTraversal,
  rebuildBackRefs,
  type TraversalResult,
} from '../src/main/traversal.js'
import {
  createJsonRagStore,
  createSnapshotStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import { validateDocFlow } from '../src/main/doc-flow.js'
import { handleRagTool } from '../src/main/mcp-server.js'
import type { LegacyInitialData, LegacyContentPayload } from 'provident-ssr'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

// ---- fixtures (persisted shapes, Unit A §5.1) ------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-v2-'))
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

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** A valid single-document flow: head → s1 → s2 → end, all scoped to 'doc'. */
function validDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }), // document root = documentId
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('s1', { type: 'p', content: 'Section one' }),
    makeNode('s2', { type: 'p', content: 'Section two' }),
    makeNode('end', { type: 'p', content: 'End' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
    makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
  ]
  return { nodes, edges }
}

/** A doc-child nesting fixture: head → ul → end, with ul owning 4 li doc-children. */
function docChildDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }),
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('ul', { type: 'ul', content: 'List' }),
    makeNode('li1', { type: 'li', content: 'Item one' }),
    makeNode('li2', { type: 'li', content: 'Item two' }),
    makeNode('li3', { type: 'li', content: 'Item three' }),
    makeNode('li4', { type: 'li', content: 'Item four' }),
    makeNode('end', { type: 'p', content: 'End' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 'ul', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 'ul', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-c1', 'doc-child', 'ul', 'li1', { order: 0 }),
    makeEdge('e-c2', 'doc-child', 'ul', 'li2', { order: 1 }),
    makeEdge('e-c3', 'doc-child', 'ul', 'li3', { order: 2 }),
    makeEdge('e-c4', 'doc-child', 'ul', 'li4', { order: 3 }),
  ]
  return { nodes, edges }
}

/** A multi-parent fixture: head → a → b → end, with `shared` having two
 *  parent-child parents (a, b). */
function multiParentDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }),
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('a', { type: 'p', content: 'A' }),
    makeNode('b', { type: 'p', content: 'B' }),
    makeNode('shared', { type: 'p', content: 'Shared' }),
    makeNode('end', { type: 'p', content: 'End' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 'a', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 'a', 'b', { documentIds: ['doc'] }),
    makeEdge('e-n3', 'next-section', 'b', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-p1', 'parent-child', 'a', 'shared'),
    makeEdge('e-p2', 'parent-child', 'b', 'shared'),
  ]
  return { nodes, edges }
}

// ---- envelope helpers ------------------------------------------------------

/** The ContentPayload whose subtree root carries the stable authored id
 *  `rag-<ragNodeId>` (§5.2 rule 2). */
function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

// ---- the RED helper: load the NEW computeDocumentSubgraph export -----------
// The export does not exist yet, so this throws a clear RED reason. Loaded
// dynamically (not a top-level static import) so the rest of the file still
// loads and the preserved-behavior tests run individually.
async function loadComputeDocumentSubgraph(): Promise<
  (store: RagStore, documentId: string) => { docNodeIds: Set<string>; edges: RagEdge[] }
> {
  const mod = await import('../src/main/traversal.js')
  const fn = (mod as Record<string, unknown>).computeDocumentSubgraph
  if (typeof fn !== 'function') {
    throw new Error('computeDocumentSubgraph: export does not exist yet (RED)')
  }
  return fn as (store: RagStore, documentId: string) => { docNodeIds: Set<string>; edges: RagEdge[] }
}

// ---- the reference "current all-edges walk" materialized set ---------------
// A faithful re-derivation of the CURRENT buildTraversal's `materialized` set
// (the RAG ids that get a content root: sections + nested doc-children +
// multi-parent duplicates) from the full-edge logic. Used by the amendment-1
// equivalence test to pin the scoped walk to the same set.
function referenceAllEdgesMaterialized(nodes: RagNode[], edges: RagEdge[], documentId: string): Set<string> {
  const docNodeIds = new Set<string>([documentId])
  for (const e of edges) {
    if (e.documentIds?.includes(documentId)) {
      docNodeIds.add(e.source)
      docNodeIds.add(e.target)
    }
  }
  let changed = true
  while (changed) {
    changed = false
    for (const e of edges) {
      if (e.kind === 'doc-child' && docNodeIds.has(e.source) && !docNodeIds.has(e.target)) {
        docNodeIds.add(e.target)
        changed = true
      }
    }
  }
  const verdict = validateDocFlow(nodes, edges, documentId)
  let sections: string[]
  let nestDocChildren: boolean
  if (verdict.ok) {
    sections = verdict.order.filter((id) => id !== documentId)
    nestDocChildren = true
  } else {
    sections = nodes.filter((n) => docNodeIds.has(n.id) && n.id !== documentId).map((n) => n.id)
    nestDocChildren = false
  }
  const materialized = new Set<string>()
  const buildSubtree = (ragId: string): void => {
    materialized.add(ragId)
    if (nestDocChildren) {
      const docChildren = edges
        .filter((e) => e.kind === 'doc-child' && e.source === ragId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      for (const dc of docChildren) buildSubtree(dc.target)
    }
  }
  for (const s of sections) buildSubtree(s)
  const sectionSet = new Set(sections)
  const docChildTargets = new Set(
    edges.filter((e) => e.kind === 'doc-child' && docNodeIds.has(e.source)).map((e) => e.target),
  )
  for (const node of nodes) {
    if (node.id === documentId) continue
    if (sectionSet.has(node.id)) continue
    if (docChildTargets.has(node.id)) continue
    const parents = edges
      .filter((e) => e.kind === 'parent-child' && e.target === node.id && sectionSet.has(e.source))
      .map((e) => e.source)
    if (parents.length >= 2) {
      for (let i = 0; i < parents.length; i++) buildSubtree(node.id)
    }
  }
  return materialized
}

// ===========================================================================
// §5.2 computeDocumentSubgraph — the single shared derivation (RED)
// ===========================================================================

describe('computeDocumentSubgraph (§5.2) — RED (export does not exist yet)', () => {
  it('happy 8: valid doc-flow + doc-child nesting → docNodeIds = doc root + flow nodes + transitive doc-children; edges = scoped doc-flow + doc-child among the document\'s nodes', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = docChildDoc()
      await seedStore(store, nodes, edges)

      const subgraph = computeDocumentSubgraph(store, 'doc')
      // doc root + the flow nodes (head, ul, end) + the transitive doc-children (li1-4)
      expect(subgraph.docNodeIds).toEqual(new Set(['doc', 'head', 'ul', 'end', 'li1', 'li2', 'li3', 'li4']))
      // the scoped doc-flow edges + the doc-child edges among the document's nodes
      const edgeIds = subgraph.edges.map((e) => e.id).sort()
      expect(edgeIds).toEqual(['e-c1', 'e-c2', 'e-c3', 'e-c4', 'e-end', 'e-head', 'e-n1', 'e-n2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 9: empty document (no edges) → docNodeIds = { documentId }; edges = []', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [makeNode('doc', { type: 'div' })], [])

      const subgraph = computeDocumentSubgraph(store, 'doc')
      expect(subgraph.docNodeIds).toEqual(new Set(['doc']))
      expect(subgraph.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('fail 3: null/undefined store → throws Error("computeDocumentSubgraph: store required")', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    expect(() => computeDocumentSubgraph(null as never, 'doc')).toThrow('computeDocumentSubgraph: store required')
    expect(() => computeDocumentSubgraph(undefined as never, 'doc')).toThrow('computeDocumentSubgraph: store required')
  })

  it('fail 4: non-string/empty-string documentId → throws Error("computeDocumentSubgraph: documentId must be a non-empty string")', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(() => computeDocumentSubgraph(store, '')).toThrow('computeDocumentSubgraph: documentId must be a non-empty string')
      expect(() => computeDocumentSubgraph(store, 42 as never)).toThrow('computeDocumentSubgraph: documentId must be a non-empty string')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('amendment 4: a listNodes/listEdges-only adapter → the adjacency call throws (the replacement is required)', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    const { nodes, edges } = validDoc()
    const adapter = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore
    expect(() => computeDocumentSubgraph(adapter, 'doc')).toThrow()
  })
})

// ===========================================================================
// §5.1 the scoped buildTraversal walk
// ===========================================================================

describe('buildTraversal — the scoped walk (§5.1)', () => {
  it('happy 14 (amendment 1): the scoped walk\'s materialized set equals the current all-edges walk\'s materialized set on the existing fixtures', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const scopedMaterialized = new Set(result.backRefs.keys())
      const reference = referenceAllEdgesMaterialized(nodes, edges, 'doc')
      expect(scopedMaterialized).toEqual(reference)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 14 (amendment 1): equivalence holds for the doc-child nesting fixture (sections + nested doc-children)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = docChildDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const scopedMaterialized = new Set(result.backRefs.keys())
      const reference = referenceAllEdgesMaterialized(nodes, edges, 'doc')
      expect(scopedMaterialized).toEqual(reference)
      // the nested doc-children are materialized (nested within the ul subtree)
      for (const li of ['li1', 'li2', 'li3', 'li4']) expect(scopedMaterialized.has(li)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 14 (amendment 1): equivalence holds for the multi-parent fixture (multi-parent duplicates)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = multiParentDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const scopedMaterialized = new Set(result.backRefs.keys())
      const reference = referenceAllEdgesMaterialized(nodes, edges, 'doc')
      expect(scopedMaterialized).toEqual(reference)
      expect(scopedMaterialized.has('shared')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('edit-surface change (amendment 1): a node not reachable from the head is absent from backRefs and the envelope', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      // 'stray' is in the store but NOT reachable from the head (no doc-flow
      // edge, no parent-child from a section). A crosslink FROM stray (source =
      // stray, not materialized) must be dropped (outgoing-only wiring).
      await seedStore(store, [
        ...nodes,
        makeNode('stray', { type: 'p', content: 'Stray' }),
      ], [
        ...edges,
        makeEdge('e-x', 'crosslink', 'stray', 'head'),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      // stray is not materialized → absent from backRefs
      expect(result.backRefs.has('stray')).toBe(false)
      // stray is not in the envelope content
      expect(findPayloadByRootId(result.envelope, 'stray')).toBeUndefined()
      // the crosslink whose SOURCE is stray (not materialized) is dropped
      expect(result.crosslinks.some((c) => c.sourceRagNodeId === 'stray')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 12: a doc-child cycle → the seen set breaks the recursion (no infinite loop, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('A', { type: 'p', content: 'A' }),
        makeNode('B', { type: 'p', content: 'B' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'A', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'A', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'A', 'B', { order: 0 }),
        makeEdge('e-c2', 'doc-child', 'B', 'A', { order: 0 }), // nesting cycle
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()
      expect(result!.envelope.content!.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('fail 2 (amendment 4): a listNodes/listEdges-only adapter → buildTraversal throws (the adjacency call fails)', async () => {
    const { nodes, edges } = validDoc()
    const adapter = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore
    // The scoped walk calls the adjacency methods (edgesForDocument/edgesFrom/
    // docHeadForDocument); a listNodes/listEdges-only adapter does not implement
    // them, so the call throws. The CURRENT all-edges walk does NOT call them,
    // so this does NOT throw yet — RED.
    expect(() => buildTraversal({ store: adapter, documentIds: ['doc'], zoneName: 'main' })).toThrow()
  })
})

// ===========================================================================
// §5.1 amendment 7 — the validateDocFlow pre-scoping verdict match
// ===========================================================================

describe('validateDocFlow pre-scoping verdict match (§5.1 step 4 / amendment 7)', () => {
  // Uses createSnapshotStore (not the JSON store) so the fixtures can carry
  // edges referencing missing nodes (the missing-node fail-state) — the JSON
  // store's putEdge rejects such edges at seed time. createSnapshotStore
  // implements edgesForDocument identically (the shared pure adjacency core).
  it('valid case: the pre-scoped edgesForDocument call matches the current full-edge call', () => {
    const { nodes, edges } = validDoc()
    const store = createSnapshotStore(nodes, edges)

    const full = validateDocFlow(nodes, edges, 'doc')
    const scoped = validateDocFlow(nodes, store.edgesForDocument('doc'), 'doc')
    expect(scoped).toEqual(full)
    expect(scoped.ok).toBe(true)
  })

  it('fail-state cycle: the pre-scoped call matches the full-edge call', () => {
    const nodes: RagNode[] = [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1' }),
      makeNode('s1', { type: 'p' }),
    ]
    const edges: RagEdge[] = [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 's1', 'head', { documentIds: ['doc'] }),
    ]
    const store = createSnapshotStore(nodes, edges)

    const full = validateDocFlow(nodes, edges, 'doc')
    const scoped = validateDocFlow(nodes, store.edgesForDocument('doc'), 'doc')
    expect(scoped).toEqual(full)
    expect(scoped.ok).toBe(false)
    if (!scoped.ok) expect(scoped.reason).toBe('cycle')
  })

  it('fail-state missing-node: the pre-scoped call matches the full-edge call', () => {
    const { nodes, edges } = validDoc()
    const bad = edges.map((e) =>
      e.id === 'e-n2' ? makeEdge('e-n2', 'next-section', 's1', 'ghost', { documentIds: ['doc'] }) : e,
    )
    const store = createSnapshotStore(nodes, bad)

    const full = validateDocFlow(nodes, bad, 'doc')
    const scoped = validateDocFlow(nodes, store.edgesForDocument('doc'), 'doc')
    expect(scoped).toEqual(full)
    expect(scoped.ok).toBe(false)
    if (!scoped.ok) expect(scoped.reason).toBe('missing-node')
  })

  it('fail-state missing-head: the pre-scoped call matches the full-edge call', () => {
    const { nodes, edges } = validDoc()
    const noHead = edges.filter((e) => e.kind !== 'doc-head')
    const store = createSnapshotStore(nodes, noHead)

    const full = validateDocFlow(nodes, noHead, 'doc')
    const scoped = validateDocFlow(nodes, store.edgesForDocument('doc'), 'doc')
    expect(scoped).toEqual(full)
    expect(scoped.ok).toBe(false)
    if (!scoped.ok) expect(scoped.reason).toBe('missing-head')
  })

  it('fail-state missing-end: the pre-scoped call matches the full-edge call', () => {
    const { nodes, edges } = validDoc()
    const noEnd = edges.filter((e) => e.kind !== 'doc-end')
    const store = createSnapshotStore(nodes, noEnd)

    const full = validateDocFlow(nodes, noEnd, 'doc')
    const scoped = validateDocFlow(nodes, store.edgesForDocument('doc'), 'doc')
    expect(scoped).toEqual(full)
    expect(scoped.ok).toBe(false)
    if (!scoped.ok) expect(scoped.reason).toBe('missing-end')
  })
})

// ===========================================================================
// §5.3 the rag.get_document MCP refactor
// ===========================================================================

describe('rag.get_document (§5.3)', () => {
  it('happy 10: returns { documentId, nodes, edges } with the document\'s node set + scoped edges', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = docChildDoc()
      await seedStore(store, nodes, edges)

      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'doc' }) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(result.documentId).toBe('doc')
      const nodeIds = result.nodes.map((n) => n.id).sort()
      expect(nodeIds).toEqual(['doc', 'end', 'head', 'li1', 'li2', 'li3', 'li4', 'ul'])
      const edgeIds = result.edges.map((e) => e.id).sort()
      expect(edgeIds).toEqual(['e-c1', 'e-c2', 'e-c3', 'e-c4', 'e-end', 'e-head', 'e-n1', 'e-n2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 11: empty document → { documentId, nodes: [<the doc root>], edges: [] }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [makeNode('doc', { type: 'div' })], [])

      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'doc' }) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(result.documentId).toBe('doc')
      expect(result.nodes.map((n) => n.id)).toEqual(['doc'])
      expect(result.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 15 (amendment 2): the traversal\'s docNodeIds and the MCP tool\'s returned node set are IDENTICAL on the same fixtures', async () => {
    const computeDocumentSubgraph = await loadComputeDocumentSubgraph()
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = docChildDoc()
      await seedStore(store, nodes, edges)

      // The single shared derivation (amendment 2): the traversal's docNodeIds
      // and the MCP tool's node set must be the SAME set.
      const subgraph = computeDocumentSubgraph(store, 'doc')
      const mcp = await handleRagTool(store, 'rag.get_document', { documentId: 'doc' }) as {
        nodes: RagNode[]
      }
      const mcpNodeIds = new Set(mcp.nodes.map((n) => n.id))
      expect(subgraph.docNodeIds).toEqual(mcpNodeIds)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('happy 17 (amendment 6): the refactored handler returns the IDENTICAL result to the current handler on the same fixtures', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = docChildDoc()
      await seedStore(store, nodes, edges)

      // The reference "current handler" — the pre-refactor scoping
      // (mcp-server.ts:166-191) implemented inline.
      const allNodes = store.listNodes()
      const allEdges = store.listEdges()
      const docNodeIds = new Set<string>(['doc'])
      for (const e of allEdges) {
        if (e.documentIds?.includes('doc')) { docNodeIds.add(e.source); docNodeIds.add(e.target) }
      }
      let changed = true
      while (changed) {
        changed = false
        for (const e of allEdges) {
          if (e.kind === 'doc-child' && docNodeIds.has(e.source) && !docNodeIds.has(e.target)) {
            docNodeIds.add(e.target); changed = true
          }
        }
      }
      const refNodes = allNodes.filter((n) => docNodeIds.has(n.id))
      const refEdges = allEdges.filter((e) => {
        if (e.kind === 'doc-child') return docNodeIds.has(e.source) && docNodeIds.has(e.target)
        return e.documentIds?.includes('doc')
      })
      const reference = { documentId: 'doc', nodes: refNodes, edges: refEdges }

      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'doc' })
      expect(result).toEqual(reference)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('fail 5: missing/empty documentId → throws Error("rag.get_document: documentId required")', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(handleRagTool(store, 'rag.get_document', {})).rejects.toThrow('rag.get_document: documentId required')
      await expect(handleRagTool(store, 'rag.get_document', { documentId: '' })).rejects.toThrow('rag.get_document: documentId required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('fail 6: null store → throws "<name>: no rag store configured"', async () => {
    await expect(handleRagTool(null, 'rag.get_document', { documentId: 'doc' })).rejects.toThrow('rag.get_document: no rag store configured')
  })
})

// ===========================================================================
// §5.5 the rebuildBackRefs adapter replacement (amendment 4)
// ===========================================================================

describe('rebuildBackRefs adapter replacement (§5.5 / amendment 4)', () => {
  it('happy 13: rebuildBackRefs returns the backRefs map for a snapshot', async () => {
    const { nodes, edges } = validDoc()
    const backRefs = rebuildBackRefs(nodes, edges, 'main')
    expect(backRefs.has('head')).toBe(true)
    expect(backRefs.has('s1')).toBe(true)
    expect(backRefs.has('s2')).toBe(true)
    expect(backRefs.has('end')).toBe(true)
  })

  it('amendment 4: buildTraversal does NOT throw when called through createSnapshotStore (the new adapter)', async () => {
    const { nodes, edges } = validDoc()
    const store = createSnapshotStore(nodes, edges)
    let result: TraversalResult
    expect(() => {
      result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
    }).not.toThrow()
    expect(result!.backRefs.has('head')).toBe(true)
  })
})
