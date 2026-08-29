// tests/crosslink-backlink.test.ts — Unit G: the crosslink/backlink mechanism
// (docs/specs/unit-g-crosslink-backlink.md §5.8 happy paths + §5.9 fail-states
// + §5.10 census). Imports:
//   - `src/main/backlinks.js` (does NOT exist yet — RED "module not found")
//   - `src/main/traversal.js` (EXISTS — but `TraversalResult` has no
//     `crosslinks` output and `CROSSLINK_LINK_CONFIG` is not exported — RED)
//   - `src/main/rag-store.js` (EXISTS — but `RagEdgeKind` lacks `crosslink` and
//     the store rejects a `crosslink` edge — RED)
//   - `src/main/mcp-server.js` (EXISTS — but `handleRagBacklinksIpc` does not
//     exist and the `rag.backlinks` handler is a placeholder — RED)
//   - `src/shared/types.js` (EXISTS — but `IPC_RAG_BACKLINKS` is not exported —
//     RED)
//
// These tests are RED because the Unit G modules/fields do not exist yet. The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  listBacklinks,
  listOutlinks,
  enumerateLinks,
  documentOf,
  type LinkScope,
  type LinkEntry,
  type BacklinkResult,
} from '../src/main/backlinks.js'
import {
  buildTraversal,
  CROSSLINK_LINK_CONFIG,
  type TraversalResult,
  type CrosslinkWiring,
} from '../src/main/traversal.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type RagEdgeKind,
} from '../src/main/rag-store.js'
import { handleRagTool, handleRagBacklinksIpc, handleEditTool } from '../src/main/mcp-server.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { IPC_RAG_BACKLINKS, type RagBacklinksPayload, type RagBacklinksResult } from '../src/shared/types.js'
import { groupForTool, toolAllowed, defaultSecurityConfig, SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

// ---- fixtures (persisted shapes, Unit A §5.1) ------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-crosslink-'))
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
  kind: RagEdgeKind,
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

/** A minimal read-only `RagStore` adapter over plain node/edge arrays. The
 *  scoped walk reads the adjacency methods, so the adapter MUST be
 *  `createSnapshotStore` (amendment 4) — a listNodes/listEdges-only adapter
 *  would throw. Lets the tests control store order directly and avoids the
 *  concrete store's (currently crosslink-rejecting) write path. */
function mockStore(nodes: RagNode[], edges: RagEdge[]): RagStore {
  return createSnapshotStore(nodes, edges)
}

/** Two valid single-document flows (docA, docB) + a crosslink edge from a
 *  section in docA to a section in docB + an unscoped parent-child edge between
 *  two nodes with no document membership. */
function twoDocFixture(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('docA', { type: 'div' }),
    makeNode('headA', { type: 'h1' }),
    makeNode('sA1', { type: 'p' }),
    makeNode('endA', { type: 'p' }),
    makeNode('docB', { type: 'div' }),
    makeNode('headB', { type: 'h1' }),
    makeNode('sB1', { type: 'p' }),
    makeNode('endB', { type: 'p' }),
    makeNode('nX', { type: 'p' }),
    makeNode('nY', { type: 'p' }),
  ]
  const edges: RagEdge[] = [
    // docA flow
    makeEdge('eA-head', 'doc-head', 'headA', 'docA', { documentIds: ['docA'] }),
    makeEdge('eA-n1', 'next-section', 'headA', 'sA1', { documentIds: ['docA'] }),
    makeEdge('eA-n2', 'next-section', 'sA1', 'endA', { documentIds: ['docA'] }),
    makeEdge('eA-end', 'doc-end', 'endA', 'docA', { documentIds: ['docA'] }),
    // docB flow
    makeEdge('eB-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
    makeEdge('eB-n1', 'next-section', 'headB', 'sB1', { documentIds: ['docB'] }),
    makeEdge('eB-n2', 'next-section', 'sB1', 'endB', { documentIds: ['docB'] }),
    makeEdge('eB-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
    // crosslink: sA1 (docA) → sB1 (docB) — cross-document
    makeEdge('cl1', 'crosslink', 'sA1', 'sB1'),
    // unscoped parent-child between two nodes with no document membership
    makeEdge('pc1', 'parent-child', 'nX', 'nY'),
  ]
  return { nodes, edges }
}

// ===========================================================================
// §5.1 THE crosslink RAG EDGE KIND (rag-store.ts)
// ===========================================================================

describe('§5.1 crosslink RAG edge kind (rag-store.ts)', () => {
  it('1. putEdge with kind crosslink happy: the edge is created (crosslink is in the RagEdgeKind union)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const edge = await store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { createdAt: now, updatedAt: now }))
      expect(edge.kind).toBe('crosslink')
      expect(edge.source).toBe('src')
      expect(edge.target).toBe('tgt')
      expect(store.getEdge('cl')?.kind).toBe('crosslink')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. a crosslink edge with documentIds: stored (deduped) and surfaced (CROSS-DOCUMENT-SHARED)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const edge = await store.putEdge(
        makeEdge('cl', 'crosslink', 'src', 'tgt', { documentIds: ['docA', 'docB', 'docA'], createdAt: now, updatedAt: now }),
      )
      expect(edge.documentIds).toEqual(['docA', 'docB'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. a crosslink edge add is journaled as a structural edge-add entry (re-traversal trigger)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      await store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { createdAt: now, updatedAt: now }))
      const entry = store.journal().find((e) => e.kind === 'structural' && e.op.op === 'edge-add')
      expect(entry).toBeDefined()
      if (entry && entry.kind === 'structural' && entry.op.op === 'edge-add') {
        expect(entry.op.edge.kind).toBe('crosslink')
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. a crosslink edge with order is REJECTED (order is only valid on doc-child)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      await expect(
        store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { order: 1, createdAt: now, updatedAt: now })),
      ).rejects.toThrow('rag putEdge: order required/invalid')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a self-referential crosslink edge (source === target) is REJECTED', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await expect(
        store.putEdge(makeEdge('cl', 'crosslink', 'src', 'src', { createdAt: now, updatedAt: now })),
      ).rejects.toThrow('rag putEdge: source required/invalid')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a crosslink edge referencing a nonexistent node is REJECTED (referential integrity)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await expect(
        store.putEdge(makeEdge('cl', 'crosslink', 'src', 'missing', { createdAt: now, updatedAt: now })),
      ).rejects.toThrow('rag putEdge: source/target node not found or quarantined')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.2 CROSSLINK_LINK_CONFIG + THE TRAVERSAL crosslinks OUTPUT (traversal.ts)
// ===========================================================================

describe('§5.2 CROSSLINK_LINK_CONFIG + traversal crosslinks (traversal.ts)', () => {
  it('7. CROSSLINK_LINK_CONFIG is { name: "crosslink", roles: ["source", "target"] } (census)', () => {
    expect(CROSSLINK_LINK_CONFIG).toEqual({ name: 'crosslink', roles: ['source', 'target'] })
  })

  it('8. the config roles include source and target (defensive — a Link.addAnchor role-mismatch would throw)', () => {
    expect(CROSSLINK_LINK_CONFIG.roles).toContain('source')
    expect(CROSSLINK_LINK_CONFIG.roles).toContain('target')
  })

  it('9. buildTraversal emits a crosslinks: CrosslinkWiring[] output (happy 11)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const result = buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' }) as TraversalResult
    expect(Array.isArray(result.crosslinks)).toBe(true)
    expect(result.crosslinks).toEqual([
      { edgeId: 'cl1', sourceRagNodeId: 'sA1', targetRagNodeId: 'sB1' },
    ])
  })

  it('10. CrosslinkWiring shape: { edgeId, sourceRagNodeId, targetRagNodeId } (census)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const result = buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' }) as TraversalResult
    for (const w of result.crosslinks as CrosslinkWiring[]) {
      expect(typeof w.edgeId).toBe('string')
      expect(typeof w.sourceRagNodeId).toBe('string')
      expect(typeof w.targetRagNodeId).toBe('string')
    }
  })

  it('11. outgoing-only materialization: a crosslink whose SOURCE is in the current doc is emitted; an incoming crosslink (source in another doc) is NOT', () => {
    const { nodes, edges } = twoDocFixture()
    // Add an INCOMING crosslink to docA: sB1 (docB) → sA1 (docA). Its source is
    // in docB, NOT materialized in the docA traversal → must NOT be emitted.
    const withIncoming = [...edges, makeEdge('cl2', 'crosslink', 'sB1', 'sA1')]
    const store = mockStore(nodes, withIncoming)
    const result = buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' }) as TraversalResult
    const ids = (result.crosslinks as CrosslinkWiring[]).map((w) => w.edgeId)
    expect(ids).toContain('cl1') // outgoing (source sA1 in docA) → emitted
    expect(ids).not.toContain('cl2') // incoming (source sB1 in docB) → NOT emitted
  })

  it('12. a crosslink whose target is in a different (not-currently-rendered) document is still emitted (dangling target, no throw)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    // Traverse docA only; cl1's target sB1 is in docB (not materialized). The
    // source sA1 IS materialized → the wiring is emitted; no throw.
    const result = buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' }) as TraversalResult
    expect(result.crosslinks).toEqual([
      { edgeId: 'cl1', sourceRagNodeId: 'sA1', targetRagNodeId: 'sB1' },
    ])
  })

  it('13. buildTraversal does NOT throw on a missing crosslink target (a valid dangling reference)', () => {
    const { nodes, edges } = twoDocFixture()
    // A crosslink whose target node does not exist at all — still a valid
    // dangling reference; the traversal must not throw.
    const withDangling = [...edges, makeEdge('cl3', 'crosslink', 'sA1', 'ghost')]
    const store = mockStore(nodes, withDangling)
    expect(() => buildTraversal({ store, documentIds: ['docA'], zoneName: 'zone' })).not.toThrow()
  })

  it('14. buildTraversal throws on a null/missing input (Unit C §5.1 fail-state)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    expect(() => buildTraversal(null as never)).toThrow('traversal: store/documentIds/zoneName required')
    expect(() => buildTraversal({ store, documentIds: [], zoneName: 'zone' })).toThrow('traversal: store/documentIds/zoneName required')
  })
})

// ===========================================================================
// §5.3 THE BACKLINK/OUTLINK ENUMERATION (backlinks.ts)
// ===========================================================================

describe('§5.3 backlink/outlink enumeration (backlinks.ts)', () => {
  it('15. listBacklinks happy: a node with incoming edges → the edges that target it, each with a scope, in store order', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    // sB1 is targeted by cl1 (crosslink, cross-document) + eB-n1 (next-section,
    // intra-document). Store order: cl1 comes after eB-n1 in the fixture.
    const backlinks = listBacklinks(store, 'sB1')
    expect(backlinks.map((l) => l.edge.id)).toEqual(['eB-n1', 'cl1'])
    expect(backlinks[0].scope).toBe('intra-document')
    expect(backlinks[1].scope).toBe('cross-document')
  })

  it('16. listOutlinks happy: a node with outgoing edges → the edges it sources, in store order', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    // sA1 sources eA-n2 (next-section, intra-document) + cl1 (crosslink,
    // cross-document). Store order: eA-n2 before cl1.
    const outlinks = listOutlinks(store, 'sA1')
    expect(outlinks.map((l) => l.edge.id)).toEqual(['eA-n2', 'cl1'])
    expect(outlinks[0].scope).toBe('intra-document')
    expect(outlinks[1].scope).toBe('cross-document')
  })

  it('17. enumerateLinks happy: the combined result (backlinks + outlinks + crosslink subsets)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const r = enumerateLinks(store, 'sB1')
    expect(r.nodeId).toBe('sB1')
    expect(r.backlinks.map((l) => l.edge.id)).toEqual(['eB-n1', 'cl1'])
    expect(r.outlinks.map((l) => l.edge.id)).toEqual(['eB-n2'])
    expect(r.crosslinkBacklinks.map((l) => l.edge.id)).toEqual(['cl1'])
    expect(r.crosslinkOutlinks).toEqual([])
  })

  it('18. cross-document classification: a crosslink edge between two nodes in different documents → scope cross-document', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const backlinks = listBacklinks(store, 'sB1')
    const cl = backlinks.find((l) => l.edge.id === 'cl1')!
    expect(cl.scope).toBe('cross-document')
  })

  it('19. intra-document classification: a next-section edge within one document → scope intra-document', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const backlinks = listBacklinks(store, 'sB1')
    const ns = backlinks.find((l) => l.edge.id === 'eB-n1')!
    expect(ns.scope).toBe('intra-document')
  })

  it('20. unscoped classification: an edge whose source or target has no document membership → scope unscoped', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const outlinks = listOutlinks(store, 'nX')
    expect(outlinks.map((l) => l.edge.id)).toEqual(['pc1'])
    expect(outlinks[0].scope).toBe('unscoped')
  })

  it('21. documentOf happy: a node in a document flow → the document root id(s)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    expect(documentOf(store, 'sA1')).toEqual(['docA'])
    expect(documentOf(store, 'headA')).toEqual(['docA'])
    expect(documentOf(store, 'docA')).toEqual(['docA'])
    expect(documentOf(store, 'sB1')).toEqual(['docB'])
    // a node with no doc-flow membership → empty set
    expect(documentOf(store, 'nX')).toEqual([])
  })

  it('22. LinkEntry shape: 6 fields (edge, kind, source, target, documentIds?, scope)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const backlinks = listBacklinks(store, 'sB1')
    const entry = backlinks[0]
    expect(entry.edge).toBeDefined()
    expect(typeof entry.kind).toBe('string')
    expect(typeof entry.source).toBe('string')
    expect(typeof entry.target).toBe('string')
    expect('scope' in entry).toBe(true)
    // documentIds is optional (absent when the edge has no document owners)
    expect('documentIds' in entry).toBe(true)
  })

  it('23. BacklinkResult shape: 5 fields (nodeId, backlinks, outlinks, crosslinkBacklinks, crosslinkOutlinks)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const r = enumerateLinks(store, 'sB1')
    expect(Object.keys(r).sort()).toEqual(
      ['nodeId', 'backlinks', 'outlinks', 'crosslinkBacklinks', 'crosslinkOutlinks'].sort(),
    )
  })

  it('24. the edge in each LinkEntry is a shallow copy (never the internal record)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    const backlinks = listBacklinks(store, 'sB1')
    const entry = backlinks[0]
    expect(entry.edge).not.toBe(edges.find((e) => e.id === entry.edge.id))
  })

  it('25. a nonexistent nodeId → an empty result (no throw)', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    expect(listBacklinks(store, 'ghost')).toEqual([])
    expect(listOutlinks(store, 'ghost')).toEqual([])
    expect(enumerateLinks(store, 'ghost')).toEqual({
      nodeId: 'ghost',
      backlinks: [],
      outlinks: [],
      crosslinkBacklinks: [],
      crosslinkOutlinks: [],
    })
  })

  it('26. listBacklinks/listOutlinks/enumerateLinks with a null/undefined store → throws', () => {
    expect(() => listBacklinks(null as never, 'x')).toThrow('backlinks: store required')
    expect(() => listOutlinks(undefined as never, 'x')).toThrow('backlinks: store required')
    expect(() => enumerateLinks(null as never, 'x')).toThrow('backlinks: store required')
  })

  it('27. listBacklinks/listOutlinks/enumerateLinks with a non-string/empty nodeId → throws', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    expect(() => listBacklinks(store, '')).toThrow('backlinks: nodeId required')
    expect(() => listOutlinks(store, 42 as never)).toThrow('backlinks: nodeId required')
    expect(() => enumerateLinks(store, '')).toThrow('backlinks: nodeId required')
  })

  it('28. documentOf with a null/undefined store or a non-string nodeId → throws', () => {
    const { nodes, edges } = twoDocFixture()
    const store = mockStore(nodes, edges)
    expect(() => documentOf(null as never, 'x')).toThrow('documentOf: store/nodeId required')
    expect(() => documentOf(store, 42 as never)).toThrow('documentOf: store/nodeId required')
  })
})

// ===========================================================================
// §5.4 THE rag.backlinks MCP TOOL + THE rag-backlinks IPC (MCP/UI equivalence)
// ===========================================================================

describe('§5.4 rag.backlinks MCP tool + rag-backlinks IPC (mcp-server.ts)', () => {
  it('29. rag.backlinks happy: a valid nodeId → the tool returns the BacklinkResult', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      await store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { createdAt: now, updatedAt: now }))
      const result = await handleRagTool(store, 'rag.backlinks', { nodeId: 'tgt' }) as BacklinkResult
      expect(result.nodeId).toBe('tgt')
      expect(result.backlinks.map((l) => l.edge.id)).toEqual(['cl'])
      expect(result.crosslinkBacklinks.map((l) => l.edge.id)).toEqual(['cl'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('30. rag-backlinks IPC happy: a valid nodeId → the IPC returns the same BacklinkResult', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      await store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { createdAt: now, updatedAt: now }))
      const payload: RagBacklinksPayload = { nodeId: 'tgt' }
      const result = await handleRagBacklinksIpc(store, payload) as RagBacklinksResult
      expect(result.nodeId).toBe('tgt')
      expect(result.backlinks.map((l) => l.edge.id)).toEqual(['cl'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('31. MCP/UI equivalence: the MCP rag.backlinks tool and the UI rag-backlinks IPC call the SAME enumerateLinks → same result', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      await store.putEdge(makeEdge('cl', 'crosslink', 'src', 'tgt', { createdAt: now, updatedAt: now }))
      const mcp = await handleRagTool(store, 'rag.backlinks', { nodeId: 'tgt' })
      const ipc = await handleRagBacklinksIpc(store, { nodeId: 'tgt' })
      expect(ipc).toEqual(mcp)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('32. rag.backlinks with a missing/empty nodeId → the tool rejects it', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(handleRagTool(store, 'rag.backlinks', {})).rejects.toThrow('rag.backlinks: nodeId required')
      await expect(handleRagTool(store, 'rag.backlinks', { nodeId: '' })).rejects.toThrow('rag.backlinks: nodeId required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('33. the rag-backlinks IPC with a missing/empty nodeId → rejects with the SAME error (mirrors the MCP tool)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(handleRagBacklinksIpc(store, { nodeId: '' })).rejects.toThrow('rag.backlinks: nodeId required')
      await expect(handleRagBacklinksIpc(store, {})).rejects.toThrow('rag.backlinks: nodeId required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('34. rag.backlinks with the rag group disabled → not callable (default-off)', () => {
    expect(toolAllowed('rag.backlinks', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('rag.backlinks', ['rag'])).toBe(true)
  })
})

// ===========================================================================
// §5.5 THE FIVE-SEAM GATE FOR rag.backlinks + rag-backlinks
// ===========================================================================

describe('§5.5 five-seam gate (security.ts / mcp-server.ts / shared/types.ts)', () => {
  it('35. Seam 1 — rag.backlinks maps to the rag group; defaultSecurityConfig does NOT enable rag', () => {
    expect(groupForTool('rag.backlinks')).toBe('rag')
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toEqual(['read', 'dispatch'])
    expect(cfg.enabled).not.toContain('rag')
  })

  it('36. Seam 2 — ALL_TOOLS includes rag.backlinks; it registers in MAIN when the rag group is enabled', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('rag.backlinks')
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    expect(server.allowedToolNames()).not.toContain('rag.backlinks')
    server.applyGatePatch({ groups: ['rag'] })
    expect(server.allowedToolNames()).toContain('rag.backlinks')
  })

  it('37. Seam 3 — IPC_RAG_BACKLINKS is a channel constant (not an RpcMethod); rag.backlinks is in the RpcMethod union', () => {
    expect(IPC_RAG_BACKLINKS).toBe('provident:rag-backlinks')
    // The rag-backlinks IPC is a SEPARATE channel constant, mirroring the
    // rag-query IPC (Unit E §5.7) — NOT an RpcMethod.
    expect(IPC_RAG_BACKLINKS.startsWith('provident:')).toBe(true)
  })

  it('38. Seam 4/5 — rag.backlinks is main-handled (never routed to the renderer); read-only, NOT in MUTATING_METHODS', () => {
    // The rag.* tools are handled in mcp-server.ts (like module.*), calling the
    // main-process RAG store. They NEVER reach the renderer switch (a method
    // that does hits the default branch and throws "unknown method" — fail-
    // closed). The renderer's handleRequest/MUTATING_METHODS are not exported,
    // so the negative contract is verified by code review; here we assert the
    // positive half — rag.backlinks registers in MAIN when the rag group is
    // enabled.
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['rag'] })
    expect(server.allowedToolNames()).toContain('rag.backlinks')
  })
})

// ===========================================================================
// §5.8 HAPPY 13 + §5.9 FAIL 11 — edit.set_edge CREATING A crosslink EDGE
// ===========================================================================

describe('edit.set_edge creating a crosslink edge (edit-ops.ts)', () => {
  it('39. edit.set_edge with kind crosslink → the edge is created (a structural op → journaled → re-traversal)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      await store.putNode(makeNode('tgt', { createdAt: now, updatedAt: now }))
      const result = await handleEditTool(store, 'edit.set_edge', {
        kind: 'crosslink',
        source: 'src',
        target: 'tgt',
      }) as { ok: boolean; edge?: RagEdge }
      expect(result.ok).toBe(true)
      expect(result.edge?.kind).toBe('crosslink')
      expect(store.getEdge(result.edge!.id)?.kind).toBe('crosslink')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('40. edit.set_edge with kind crosslink referencing a nonexistent node → { ok: false, error: "edit.set_edge: source/target node not found or quarantined" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      await store.putNode(makeNode('src', { createdAt: now, updatedAt: now }))
      const result = await handleEditTool(store, 'edit.set_edge', {
        kind: 'crosslink',
        source: 'src',
        target: 'missing',
      }) as { ok: boolean; error?: string }
      expect(result.ok).toBe(false)
      expect(result.error).toBe('edit.set_edge: source/target node not found or quarantined')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
