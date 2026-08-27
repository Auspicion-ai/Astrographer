// tests/retrieval-adversarial.test.ts — Unit E adversarial-fix pass: regression
// tests for the HOST findings F1-F7 found by the adversarial review of the
// retrieval module (docs/specs/unit-e-rag-index.md §5.1-§5.9). These are NEW
// regression tests in addition to the existing tests/retrieval.test.ts (which
// is NOT modified). Each finding is fixed in src/ and pinned here.
//
//   F1 — the maintained retrieval engine is wired into the running app:
//         `rag.query` uses the passed engine (no per-call index rebuild) and the
//         index is reconciled incrementally on `onStoreChanged`.
//   F2 — `createRetrieval` USES the passed embedder (the interface-swappable
//         seam) instead of silently building its own lexical embedder.
//   F3 — the `rag-query` IPC (MCP/UI equivalence) produces the same result as
//         the MCP `rag.query` tool.
//   F4 — `assembleContext` rejects malformed (non-numeric / non-integer /
//         fractional) `maxNodes`/`maxDepth`.
//   F5 — a stopword-only / no-token query is rejected, not a silent empty result.
//   F6 — `tokenize` is Unicode-aware (non-ASCII letters/numbers are kept).
//   F7 — `assembleContext` terminates on a doc-flow cycle and dedupes a seed
//         reachable from another seed.
//
// ASYNC (Unit F amendment, 2026-08-27): the embedder-dependent functions
// (`score`, `place`, `selectTopK`, `retrieve`, `RetrievalEngine.query`,
// `RetrievalEngine.onStoreChanged`, the `rag.query` MCP handler, the `rag-query`
// IPC) are ASYNC — the tests `await` them; their throws are REJECTED PROMISES
// (`await expect(...).rejects.toThrow(...)`). The spy embedder's `score`/`place`
// return resolved promises.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  tokenize,
  createLexicalIndex,
  createLexicalEmbedder,
  createRetrieval,
  assembleContext,
  retrieve,
  type Embedder,
  type PlacementDecision,
  type RetrievalEngine,
  type AssemblyOptions,
  type ScoredNode,
  type RetrievalResult,
} from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import { handleRagTool, handleRagQueryIpc } from '../src/main/mcp-server.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-adv-'))
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

/** A deterministic drop-in embedder that scores every node the same (fixed
 *  score) and never matches for placement — used to prove `createRetrieval`
 *  actually invokes the PASSED embedder (F2). ASYNC (Unit F amendment): the
 *  `score`/`place` return resolved promises. */
function fixedScoreEmbedder(score: number, onScore?: (query: string, nodes: RagNode[]) => void): Embedder {
  return {
    async score(query: string, nodes: RagNode[]): Promise<ScoredNode[]> {
      onScore?.(query, nodes)
      return nodes.map((n) => ({ nodeId: n.id, score }))
    },
    async place(): Promise<PlacementDecision> {
      return { ok: false, reason: 'no-match' }
    },
  }
}

describe('Unit E adversarial-fix regression (HOST findings F1-F7)', () => {
  // =========================================================================
  // F1 — the maintained retrieval engine is wired into the running app; the
  // index is maintained incrementally (NOT rebuilt per rag.query call).
  // =========================================================================

  it('F1 — rag.query uses the passed (maintained) engine, not a per-call rebuild', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    // A spy engine: if `rag.query` rebuilt the index internally it would never
    // call THIS engine's query (it would build a fresh createRetrieval instead).
    const engine: RetrievalEngine = {
      query: vi.fn().mockResolvedValue({ query: 'hello', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      onStoreChanged: vi.fn(),
    }
    const result = await handleRagTool(store, 'rag.query', { query: 'hello', topK: 5 }, engine)
    expect(engine.query).toHaveBeenCalledTimes(1)
    expect(engine.query).toHaveBeenCalledWith('hello', { k: 5 })
    expect(result.query).toBe('hello')
  })

  it('F1 — the maintained index is reconciled on onStoreChanged and used across rag.query calls (no rebuild)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      // the engine is created ONCE (as in main.ts)
      const index = createLexicalIndex(store.listNodes())
      const engine = createRetrieval(store, createLexicalEmbedder(index))
      // a structural add + the store-change reconcile (as main wires on
      // rag-store-changed)
      await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
      await engine.onStoreChanged('structural', ['n2'], [])
      // rag.query uses the maintained engine — the newly-indexed node is found
      const result = await handleRagTool(store, 'rag.query', { query: 'goodbye', topK: 5 }, engine) as RetrievalResult
      expect(result.ranked[0].nodeId).toBe('n2')
      // and a content edit reconcile is reflected too
      await store.putNode(makeNode('n1', { content: 'hello moon' }))
      await engine.onStoreChanged('content', ['n1'], [])
      const both = await handleRagTool(store, 'rag.query', { query: 'moon', topK: 5 }, engine) as RetrievalResult
      expect(both.ranked.some((s) => s.nodeId === 'n1')).toBe(true)
      expect(both.ranked.some((s) => s.nodeId === 'n2')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F2 — createRetrieval USES the passed embedder (the interface-swappable
  // seam — a vector/spy embedder is a drop-in).
  // =========================================================================

  it('F2 — createRetrieval invokes the passed embedder (spy score) and a different embedder changes the result', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const onScore = vi.fn()
      const spy = fixedScoreEmbedder(0.75, onScore)
      const engine = createRetrieval(store, spy)
      const a = await engine.query('anything', { k: 1 })
      // the passed embedder's score is invoked (NOT an internally-built lexical
      // embedder)
      expect(onScore).toHaveBeenCalled()
      expect(a.ranked[0].nodeId).toBe('n1')
      expect(a.ranked[0].score).toBe(0.75)

      // a DIFFERENT embedder changes the result (the drop-in seam is live)
      const engineB = createRetrieval(store, fixedScoreEmbedder(0.1))
      const b = await engineB.query('anything', { k: 1 })
      expect(b.ranked[0].score).toBe(0.1)
      expect(b.ranked[0].score).not.toBe(a.ranked[0].score)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F3 — MCP/UI equivalence: the rag-query IPC and the MCP rag.query tool
  // produce the same result (the same maintained engine).
  // =========================================================================

  it('F3 — the rag-query IPC (handleRagQueryIpc) and the MCP rag.query tool produce the same result', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      await store.putNode(makeNode('n2', { content: 'hello there' }))
      const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
      // the MCP tool path and the UI IPC path both call the SAME engine
      const mcp = await handleRagTool(store, 'rag.query', { query: 'hello', topK: 2 }, engine)
      const ipc = await handleRagQueryIpc(engine, store, { query: 'hello', topK: 2 })
      expect(ipc).toEqual(mcp)
      expect((ipc as RetrievalResult).ranked).toEqual((mcp as RetrievalResult).ranked)
      expect((ipc as RetrievalResult).context).toEqual((mcp as RetrievalResult).context)
      expect((ipc as RetrievalResult).markdown).toBe((mcp as RetrievalResult).markdown)
      expect((ipc as RetrievalResult).lineMap).toEqual((mcp as RetrievalResult).lineMap)
      expect((ipc as RetrievalResult).k).toBe(2)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F4 — assembleContext rejects malformed maxNodes / maxDepth.
  // =========================================================================

  it('F4 — assembleContext rejects non-numeric / non-integer / fractional maxNodes and maxDepth', async () => {
    const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    const malformed: Array<Partial<AssemblyOptions>> = [
      { maxNodes: 1.5, maxDepth: 1 },        // fractional maxNodes
      { maxNodes: Number.NaN, maxDepth: 1 }, // non-numeric maxNodes
      { maxNodes: '5' as never, maxDepth: 1 }, // non-numeric maxNodes
      { maxNodes: 1, maxDepth: 1.5 },        // fractional maxDepth
      { maxNodes: 1, maxDepth: Number.NaN }, // non-numeric maxDepth
      { maxNodes: 1, maxDepth: -0.5 },       // fractional negative maxDepth
    ]
    for (const opts of malformed) {
      expect(() => assembleContext(store, [], opts as AssemblyOptions)).toThrow('assembleContext: maxNodes/maxDepth invalid')
    }
    // valid bounds are NOT rejected (maxNodes positive-int, maxDepth non-neg-int)
    expect(() => assembleContext(store, [], { maxNodes: 1, maxDepth: 0 })).not.toThrow()
    expect(() => assembleContext(store, [], { maxNodes: 50, maxDepth: 3 })).not.toThrow()
  })

  it('F4 — retrieve propagates a malformed maxNodes/maxDepth as the documented fail-state', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      await expect(retrieve(store, embedder, index, 'hello', { maxNodes: 1.5 })).rejects.toThrow('assembleContext: maxNodes/maxDepth invalid')
      await expect(retrieve(store, embedder, index, 'hello', { maxDepth: -1 })).rejects.toThrow('assembleContext: maxNodes/maxDepth invalid')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F5 — a stopword-only / no-token query is rejected, not a silent empty result.
  // =========================================================================

  it('F5 — retrieve rejects a query that tokenizes to zero tokens (stopword-only)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const index = createLexicalIndex(store.listNodes())
      const embedder = createLexicalEmbedder(index)
      await expect(retrieve(store, embedder, index, 'the', {})).rejects.toThrow('retrieve: query must be a non-empty string')
      await expect(retrieve(store, embedder, index, 'and or', {})).rejects.toThrow('retrieve: query must be a non-empty string')
      await expect(retrieve(store, embedder, index, 'a  an  the', {})).rejects.toThrow('retrieve: query must be a non-empty string')
      // a query with a real token still works
      const ok = await retrieve(store, embedder, index, 'the hello', {})
      expect(ok.ranked.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F6 — tokenize is Unicode-aware (non-ASCII letters/numbers are kept).
  // =========================================================================

  it('F6 — tokenize keeps non-ASCII letters/numbers (Unicode-aware split, ASCII unchanged)', () => {
    expect(tokenize('Café Déjà vu')).toEqual(['café', 'déjà', 'vu'])
    expect(tokenize('日本語テキスト')).toEqual(['日本語テキスト'])
    expect(tokenize('hello 世界')).toEqual(['hello', '世界'])
    expect(tokenize('naïve coöperation')).toEqual(['naïve', 'coöperation'])
    // ASCII behavior is unchanged (regression against the original regex)
    expect(tokenize('Hello, World!')).toEqual(['hello', 'world'])
    expect(tokenize('x  y')).toEqual(['x', 'y'])
  })

  // =========================================================================
  // F7 — assembleContext terminates on a doc-flow cycle and dedupes a seed
  // reachable from another seed.
  // =========================================================================

  it('F7 — assembleContext terminates on an explicit doc-flow cycle and dedupes a seed reachable by traversal', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'a' }))
      await store.putNode(makeNode('n2', { content: 'b' }))
      await store.putNode(makeNode('n3', { content: 'c' }))
      // an explicit cycle n1 -> n2 -> n3 -> n1 (next-section)
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'next-section' }))
      await store.putEdge(makeEdge('e2', 'n2', 'n3', { kind: 'next-section' }))
      await store.putEdge(makeEdge('e3', 'n3', 'n1', { kind: 'next-section' }))
      // seed n2 is ALSO reachable from seed n1 via traversal (next-section)
      const topK: ScoredNode[] = [{ nodeId: 'n1', score: 2 }, { nodeId: 'n2', score: 1 }]
      const result = assembleContext(store, topK, { maxNodes: 50, maxDepth: 3 })
      // terminates (no infinite loop) and every node appears exactly once
      const ids = result.context.map((n) => n.id)
      expect(new Set(ids).size).toBe(ids.length) // deduped
      expect(ids).toContain('n1')
      expect(ids).toContain('n2')
      expect(ids).toContain('n3')
      expect(result.context[0].id).toBe('n1') // highest-score seed first
      expect(result.traversal.nodeCount).toBe(result.context.length)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F7 — assembleContext dedupes a node reachable through a self/back edge within the bound', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'a' }))
      await store.putNode(makeNode('n2', { content: 'b' }))
      // parent-child back-and-forth (both directions are followed)
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'parent-child' }))
      const topK: ScoredNode[] = [{ nodeId: 'n1', score: 1 }]
      const result = assembleContext(store, topK, { maxNodes: 10, maxDepth: 2 })
      const ids = result.context.map((n) => n.id)
      expect(new Set(ids).size).toBe(ids.length) // deduped across BFS levels
      expect(ids).toEqual(['n1', 'n2'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})
