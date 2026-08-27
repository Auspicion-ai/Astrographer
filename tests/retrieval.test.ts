// tests/retrieval.test.ts — Unit E: the RAG index + retrieval module
// (docs/specs/unit-e-rag-index.md §5.8 happy-path states + §5.9 fail-states).
// Mirrors the rag-store.test.ts conventions (temp dirs via node:fs, vitest
// node environment, `.js` import suffix for the main-process ESM module).
//
// The module under test is `src/main/retrieval.ts` — it DOES NOT EXIST yet, so
// this whole file is RED (the static import fails to resolve). The store's
// mutating methods (putNode/putEdge/removeNode) are async and queue-serialized,
// so every call is awaited here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  tokenize,
  DEFAULT_STOPWORDS,
  PLACEMENT_MIN_SCORE,
  createLexicalIndex,
  updateLexicalIndex,
  addToLexicalIndex,
  removeFromLexicalIndex,
  createLexicalEmbedder,
  selectTopK,
  assembleContext,
  retrieve,
  createRetrieval,
  type LexicalIndex,
  type Embedder,
  type ScoredNode,
  type PlacementDecision,
  type AssemblyOptions,
  type AssemblyResult,
  type RetrievalOptions,
  type RetrievalResult,
  type RetrievalEngine,
} from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import { handleRagTool } from '../src/main/mcp-server.js'
import { toolAllowed } from '../src/main/security.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-'))
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

describe('Unit E — retrieval module (unit-e-rag-index.md §5.8/§5.9)', () => {
  it('RED — the retrieval module is not exported yet (src/main/retrieval.ts does not exist)', () => {
    expect(typeof createLexicalIndex).toBe('function')
  })

  // =========================================================================
  // §5.1 TOKENIZATION + THE LEXICAL INDEX
  // =========================================================================

  describe('§5.1 tokenize + lexical index', () => {
    it('1. tokenize happy: lowercase, split on non-alphanumeric runs, drop empty + stopwords', () => {
      expect(tokenize('Hello, World!')).toEqual(['hello', 'world'])
      // double space → empty token dropped (non-stopword tokens)
      expect(tokenize('x  y')).toEqual(['x', 'y'])
      // stopwords are dropped regardless of length ('a' is in DEFAULT_STOPWORDS)
      expect(tokenize('a  b')).toEqual(['b'])
      // stopword dropped
      expect(tokenize('the quick brown fox')).toEqual(['quick', 'brown', 'fox'])
      // empty input → no tokens
      expect(tokenize('')).toEqual([])
    })

    it('DEFAULT_STOPWORDS is a fixed ReadonlySet of common English function words', () => {
      expect(DEFAULT_STOPWORDS).toBeInstanceOf(Set)
      expect(DEFAULT_STOPWORDS.has('the')).toBe(true)
      expect(DEFAULT_STOPWORDS.has('and')).toBe(true)
      expect(DEFAULT_STOPWORDS.has('a')).toBe(true)
      expect(DEFAULT_STOPWORDS.has('hello')).toBe(false)
    })

    it('2. createLexicalIndex happy: node ids, TF, DF, documentCount, averageDocumentLength', () => {
      const nodes = [
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'hello there' }),
      ]
      const index = createLexicalIndex(nodes)
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.documentCount).toBe(2)
      expect(index.termFrequencies.get('n1')!.get('hello')).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('world')).toBe(1)
      expect(index.termFrequencies.get('n2')!.get('hello')).toBe(1)
      expect(index.documentFrequencies.get('hello')).toBe(2)
      expect(index.documentFrequencies.get('world')).toBe(1)
      // totalTokens = 2 + 2 = 4, documentCount = 2 → avgdl = 2
      expect(index.averageDocumentLength).toBe(2)
    })

    it('createLexicalIndex with an empty node list → documentCount 0, averageDocumentLength 0', () => {
      const index = createLexicalIndex([])
      expect(index.nodeIds).toEqual([])
      expect(index.documentCount).toBe(0)
      expect(index.averageDocumentLength).toBe(0)
    })

    it('3. updateLexicalIndex happy (content edit): TF replaced, DF recomputed, avgdl recomputed', () => {
      const index = createLexicalIndex([
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'hello there' }),
      ])
      updateLexicalIndex(index, makeNode('n1', { content: 'goodbye moon' }))
      // n1's TF replaced
      expect(index.termFrequencies.get('n1')!.get('hello')).toBeUndefined()
      expect(index.termFrequencies.get('n1')!.get('goodbye')).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('moon')).toBe(1)
      // DF recomputed for the changed terms: hello now only in n2
      expect(index.documentFrequencies.get('hello')).toBe(1)
      expect(index.documentFrequencies.get('goodbye')).toBe(1)
      expect(index.documentFrequencies.get('world')).toBeUndefined() // world's DF reached 0 → removed
      // avgdl recomputed: (2 + 2) / 2 = 2
      expect(index.averageDocumentLength).toBe(2)
    })

    it('updateLexicalIndex on a node NOT in the index adds it (same as addToLexicalIndex)', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello world' })])
      updateLexicalIndex(index, makeNode('n2', { content: 'hello there' }))
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.documentCount).toBe(2)
      expect(index.termFrequencies.get('n2')!.get('there')).toBe(1)
      expect(index.documentFrequencies.get('hello')).toBe(2)
    })

    it('4. addToLexicalIndex happy (node add): TF added, DF incremented, documentCount incremented', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello world' })])
      addToLexicalIndex(index, makeNode('n2', { content: 'hello there' }))
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.documentCount).toBe(2)
      expect(index.termFrequencies.get('n2')!.get('hello')).toBe(1)
      expect(index.documentFrequencies.get('hello')).toBe(2)
      expect(index.averageDocumentLength).toBe(2)
    })

    it('addToLexicalIndex on a node ALREADY in the index updates it (same as updateLexicalIndex)', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello world' })])
      addToLexicalIndex(index, makeNode('n1', { content: 'goodbye moon' }))
      expect(index.nodeIds).toEqual(['n1'])
      expect(index.documentCount).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('goodbye')).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('hello')).toBeUndefined()
    })

    it('5. removeFromLexicalIndex happy (node delete): TF removed, DF decremented, documentCount decremented', () => {
      const index = createLexicalIndex([
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'hello there' }),
      ])
      removeFromLexicalIndex(index, 'n1')
      expect(index.nodeIds).toEqual(['n2'])
      expect(index.documentCount).toBe(1)
      expect(index.termFrequencies.get('n1')).toBeUndefined()
      expect(index.documentFrequencies.get('hello')).toBe(1)
      expect(index.documentFrequencies.get('world')).toBeUndefined() // DF reached 0 → removed
      expect(index.averageDocumentLength).toBe(2)
    })

    it('removeFromLexicalIndex on a node NOT in the index is a no-op (no throw)', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello world' })])
      expect(() => removeFromLexicalIndex(index, 'ghost')).not.toThrow()
      expect(index.nodeIds).toEqual(['n1'])
      expect(index.documentCount).toBe(1)
    })

    it('1. tokenize non-string throws "tokenize: text must be a string"', () => {
      expect(() => tokenize(null as never)).toThrow('tokenize: text must be a string')
      expect(() => tokenize(undefined as never)).toThrow('tokenize: text must be a string')
      expect(() => tokenize(42 as never)).toThrow('tokenize: text must be a string')
    })

    it('2. createLexicalIndex null/undefined nodes throws "createLexicalIndex: nodes required"', () => {
      expect(() => createLexicalIndex(null as never)).toThrow('createLexicalIndex: nodes required')
      expect(() => createLexicalIndex(undefined as never)).toThrow('createLexicalIndex: nodes required')
    })

    it('3. updateLexicalIndex/addToLexicalIndex null/undefined index or node throws "lexical index: index/node required"', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello' })])
      expect(() => updateLexicalIndex(null as never, makeNode('n2'))).toThrow('lexical index: index/node required')
      expect(() => updateLexicalIndex(undefined as never, makeNode('n2'))).toThrow('lexical index: index/node required')
      expect(() => updateLexicalIndex(index, null as never)).toThrow('lexical index: index/node required')
      expect(() => updateLexicalIndex(index, undefined as never)).toThrow('lexical index: index/node required')
      expect(() => addToLexicalIndex(null as never, makeNode('n2'))).toThrow('lexical index: index/node required')
      expect(() => addToLexicalIndex(undefined as never, makeNode('n2'))).toThrow('lexical index: index/node required')
      expect(() => addToLexicalIndex(index, null as never)).toThrow('lexical index: index/node required')
      expect(() => addToLexicalIndex(index, undefined as never)).toThrow('lexical index: index/node required')
    })

    it('4. removeFromLexicalIndex null/undefined index or non-string nodeId throws "lexical index: index/nodeId required"', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello' })])
      expect(() => removeFromLexicalIndex(null as never, 'n1')).toThrow('lexical index: index/nodeId required')
      expect(() => removeFromLexicalIndex(undefined as never, 'n1')).toThrow('lexical index: index/nodeId required')
      expect(() => removeFromLexicalIndex(index, null as never)).toThrow('lexical index: index/nodeId required')
      expect(() => removeFromLexicalIndex(index, undefined as never)).toThrow('lexical index: index/nodeId required')
      expect(() => removeFromLexicalIndex(index, 42 as never)).toThrow('lexical index: index/nodeId required')
    })
  })

  // =========================================================================
  // §5.2 THE EMBEDDER INTERFACE + THE LEXICAL (BM25) IMPLEMENTATION
  // =========================================================================

  describe('§5.2 createLexicalEmbedder + BM25', () => {
    it('6. createLexicalEmbedder + score happy: a matching node scores > 0, ranked highest-first', () => {
      const nodes = [
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'goodbye moon' }),
      ]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const scored = embedder.score('hello', nodes)
      expect(scored).toHaveLength(2)
      expect(scored[0].nodeId).toBe('n1')
      expect(scored[0].score).toBeGreaterThan(0)
      expect(scored[1].nodeId).toBe('n2')
      expect(scored[1].score).toBe(0) // no matching terms
    })

    it('BM25 exact score: single node "hello world", query "hello" → ln(4/3)', () => {
      const nodes = [makeNode('n1', { content: 'hello world' })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const scored = embedder.score('hello', nodes)
      // N=1, df(hello)=1 → IDF = ln(1 + (1-1+0.5)/(1+0.5)) = ln(4/3)
      // tf=1, |d|=2, avgdl=2, k1=1.2, b=0.75 → the tf·(k1+1)/(tf + k1·(1-b+b·|d|/avgdl)) factor = 1
      expect(scored[0].nodeId).toBe('n1')
      expect(scored[0].score).toBeCloseTo(Math.log(4 / 3), 5)
    })

    it('7. BM25 determinism: same query + same index + same nodes → same ranked result (twice)', () => {
      const nodes = [
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'hello there' }),
      ]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const a = embedder.score('hello', nodes)
      const b = embedder.score('hello', nodes)
      expect(a).toEqual(b)
    })

    it('8. BM25 tie-break: equal scores sorted by node id ascending', () => {
      // both nodes have tf(hello)=1, |d|=2, avgdl=2, df(hello)=2 → equal scores
      const nodes = [
        makeNode('n2', { content: 'hello world' }),
        makeNode('n1', { content: 'hello there' }),
      ]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const scored = embedder.score('hello', nodes)
      expect(scored[0].score).toBeCloseTo(scored[1].score, 10)
      expect(scored[0].nodeId).toBe('n1') // ascending tie-break
      expect(scored[1].nodeId).toBe('n2')
    })

    it('9. place happy: a new section matches an existing section → next-section', () => {
      const nodes = [makeNode('n1', { type: 'p', content: 'hello world' })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const decision = embedder.place('hello', nodes, [])
      expect(decision.ok).toBe(true)
      if (decision.ok) {
        expect(decision.targetNodeId).toBe('n1')
        expect(decision.edgeKind).toBe('next-section')
        expect(decision.score).toBeGreaterThan(0)
      }
    })

    it('10. place container match: best match is a ul/ol/div node → doc-child', () => {
      for (const type of ['ul', 'ol', 'div'] as const) {
        const nodes = [makeNode('n1', { type, content: 'hello world' })]
        const index = createLexicalIndex(nodes)
        const embedder = createLexicalEmbedder(index)
        const decision = embedder.place('hello', nodes, [])
        expect(decision.ok).toBe(true)
        if (decision.ok) {
          expect(decision.targetNodeId).toBe('n1')
          expect(decision.edgeKind).toBe('doc-child')
        }
      }
    })

    it('PLACEMENT_MIN_SCORE is a fixed constant (default 0)', () => {
      expect(PLACEMENT_MIN_SCORE).toBe(0)
    })

    it('5. createLexicalEmbedder null/undefined index throws "createLexicalEmbedder: index required"', () => {
      expect(() => createLexicalEmbedder(null as never)).toThrow('createLexicalEmbedder: index required')
      expect(() => createLexicalEmbedder(undefined as never)).toThrow('createLexicalEmbedder: index required')
    })

    it('6. score non-string query or null/undefined nodes throws "embedder score: query/nodes required"', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello' })])
      const embedder = createLexicalEmbedder(index)
      expect(() => embedder.score(null as never, [])).toThrow('embedder score: query/nodes required')
      expect(() => embedder.score(undefined as never, [])).toThrow('embedder score: query/nodes required')
      expect(() => embedder.score(42 as never, [])).toThrow('embedder score: query/nodes required')
      expect(() => embedder.score('hello', null as never)).toThrow('embedder score: query/nodes required')
      expect(() => embedder.score('hello', undefined as never)).toThrow('embedder score: query/nodes required')
    })

    it('7. place non-string content or null/undefined nodes/edges throws "embedder place: content/nodes/edges required"', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello' })])
      const embedder = createLexicalEmbedder(index)
      expect(() => embedder.place(null as never, [], [])).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place(undefined as never, [], [])).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place(42 as never, [], [])).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place('hello', null as never, [])).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place('hello', undefined as never, [])).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place('hello', [], null as never)).toThrow('embedder place: content/nodes/edges required')
      expect(() => embedder.place('hello', [], undefined as never)).toThrow('embedder place: content/nodes/edges required')
    })

    it('8. place empty content → { ok: false, reason: "empty-content" }', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'hello' })])
      const embedder = createLexicalEmbedder(index)
      expect(embedder.place('', [], [])).toEqual({ ok: false, reason: 'empty-content' })
      expect(embedder.place('   ', [], [])).toEqual({ ok: false, reason: 'empty-content' })
    })

    it('9. place no match → { ok: false, reason: "no-match" }', () => {
      const nodes = [makeNode('n1', { content: 'alpha beta' })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      // no shared terms → best score 0 → below the placement threshold → no-match
      const decision = embedder.place('zzz qqq', nodes, [])
      expect(decision).toEqual({ ok: false, reason: 'no-match' })
    })
  })

  // =========================================================================
  // §5.3 SELECTION (SCORE ALL, TAKE TOP-K)
  // =========================================================================

  describe('§5.3 selectTopK', () => {
    it('11. selectTopK happy: top-k scored nodes, highest-first', () => {
      const nodes = [
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'hello there' }),
        makeNode('n3', { content: 'goodbye moon' }),
      ]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const top = selectTopK(embedder, 'hello', nodes, 2)
      expect(top).toHaveLength(2)
      // n1 and n2 both match "hello" with equal scores → tie-break by node id
      expect(top[0].nodeId).toBe('n1')
      expect(top[1].nodeId).toBe('n2')
      expect(top[0].score).toBeGreaterThan(0)
    })

    it('12. selectTopK k > node count → all scored nodes returned', () => {
      const nodes = [
        makeNode('n1', { content: 'hello world' }),
        makeNode('n2', { content: 'goodbye moon' }),
      ]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const top = selectTopK(embedder, 'hello', nodes, 10)
      expect(top).toHaveLength(2)
    })

    it('10. selectTopK null/undefined embedder, non-string query, null/undefined nodes, or non-positive-integer k throws "selectTopK: embedder/query/nodes/k required"', () => {
      const nodes = [makeNode('n1', { content: 'hello' })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      expect(() => selectTopK(null as never, 'hello', nodes, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(undefined as never, 'hello', nodes, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, null as never, nodes, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, undefined as never, nodes, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, 42 as never, nodes, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, 'hello', null as never, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, 'hello', undefined as never, 1)).toThrow('selectTopK: embedder/query/nodes/k required')
      // non-integer k (1.5) and NaN are non-positive-integers → the required error
      expect(() => selectTopK(embedder, 'hello', nodes, 1.5)).toThrow('selectTopK: embedder/query/nodes/k required')
      expect(() => selectTopK(embedder, 'hello', nodes, Number.NaN)).toThrow('selectTopK: embedder/query/nodes/k required')
    })

    it('11. selectTopK k < 1 throws "selectTopK: k must be a positive integer"', () => {
      const nodes = [makeNode('n1', { content: 'hello' })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      expect(() => selectTopK(embedder, 'hello', nodes, 0)).toThrow('selectTopK: k must be a positive integer')
      expect(() => selectTopK(embedder, 'hello', nodes, -1)).toThrow('selectTopK: k must be a positive integer')
    })
  })

  // =========================================================================
  // §5.4 GRAPH TRAVERSAL FOR CONTEXT ASSEMBLY (BOUNDED)
  // =========================================================================

  describe('§5.4 assembleContext', () => {
    it('13. assembleContext happy: top-k seeds → context assembled by graph traversal, with markdown + line map', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'head section' }))
        await store.putNode(makeNode('n2', { content: 'second section' }))
        await store.putNode(makeNode('n3', { content: 'third section' }))
        await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'next-section' }))
        await store.putEdge(makeEdge('e2', 'n2', 'n3', { kind: 'next-section' }))
        const topK: ScoredNode[] = [{ nodeId: 'n1', score: 1 }]
        const result = assembleContext(store, topK, { maxNodes: 50, maxDepth: 3 })
        expect(result.context.length).toBeGreaterThan(0)
        expect(result.context[0].id).toBe('n1') // seed first
        expect(result.traversal.visited).toEqual(result.context.map((n) => n.id))
        expect(result.traversal.nodeCount).toBe(result.context.length)
        expect(typeof result.markdown).toBe('string')
        expect(Array.isArray(result.lineMap.ranges)).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('14. assembleContext bound: a large graph → context never exceeds maxNodes, depth never exceeds maxDepth', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        const ids = Array.from({ length: 100 }, (_, i) => `n${i}`)
        for (const id of ids) await store.putNode(makeNode(id, { content: `section ${id}` }))
        for (let i = 0; i < ids.length - 1; i++) {
          await store.putEdge(makeEdge(`e${i}`, ids[i], ids[i + 1], { kind: 'next-section' }))
        }
        const topK: ScoredNode[] = [{ nodeId: 'n0', score: 1 }]
        const result = assembleContext(store, topK, { maxNodes: 10, maxDepth: 2 })
        expect(result.context.length).toBeLessThanOrEqual(10)
        expect(result.traversal.nodeCount).toBeLessThanOrEqual(10)
        expect(result.traversal.depth).toBeLessThanOrEqual(2)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('15. assembleContext empty seeds → empty context (no throw)', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        const result = assembleContext(store, [], { maxNodes: 50, maxDepth: 3 })
        expect(result.context).toEqual([])
        expect(result.markdown).toBe('')
        expect(result.lineMap).toEqual({ ranges: [] })
        expect(result.traversal).toEqual({ visited: [], depth: 0, nodeCount: 0 })
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('12. assembleContext null/undefined store/topK/opts throws "assembleContext: store/topK/opts required"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const opts: AssemblyOptions = { maxNodes: 1, maxDepth: 1 }
      expect(() => assembleContext(null as never, [], opts)).toThrow('assembleContext: store/topK/opts required')
      expect(() => assembleContext(undefined as never, [], opts)).toThrow('assembleContext: store/topK/opts required')
      expect(() => assembleContext(store, null as never, opts)).toThrow('assembleContext: store/topK/opts required')
      expect(() => assembleContext(store, undefined as never, opts)).toThrow('assembleContext: store/topK/opts required')
      expect(() => assembleContext(store, [], null as never)).toThrow('assembleContext: store/topK/opts required')
      expect(() => assembleContext(store, [], undefined as never)).toThrow('assembleContext: store/topK/opts required')
    })

    it('13. assembleContext maxNodes < 1 or maxDepth < 0 throws "assembleContext: maxNodes/maxDepth invalid"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      expect(() => assembleContext(store, [], { maxNodes: 0, maxDepth: 1 })).toThrow('assembleContext: maxNodes/maxDepth invalid')
      expect(() => assembleContext(store, [], { maxNodes: -1, maxDepth: 1 })).toThrow('assembleContext: maxNodes/maxDepth invalid')
      expect(() => assembleContext(store, [], { maxNodes: 1, maxDepth: -1 })).toThrow('assembleContext: maxNodes/maxDepth invalid')
    })
  })

  // =========================================================================
  // §5.5 THE RETRIEVAL ENTRY POINT
  // =========================================================================

  describe('§5.5 retrieve', () => {
    it('16. retrieve happy: query → ranked + context + markdown + lineMap + k', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const result = retrieve(store, embedder, index, 'hello', {})
        expect(result.query).toBe('hello')
        expect(result.ranked.length).toBeGreaterThan(0)
        expect(result.ranked[0].nodeId).toBe('n1')
        expect(Array.isArray(result.context)).toBe(true)
        expect(typeof result.markdown).toBe('string')
        expect(Array.isArray(result.lineMap.ranges)).toBe(true)
        expect(result.k).toBe(5) // default k
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('14. retrieve null/undefined store/embedder/index, non-string query, or null/undefined opts throws "retrieve: store/embedder/index/query/opts required"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const index = createLexicalIndex([])
      const embedder = createLexicalEmbedder(index)
      expect(() => retrieve(null as never, embedder, index, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(undefined as never, embedder, index, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, null as never, index, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, undefined as never, index, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, null as never, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, undefined as never, 'hello', {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, index, null as never, {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, index, 42 as never, {})).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, index, 'hello', null as never)).toThrow('retrieve: store/embedder/index/query/opts required')
      expect(() => retrieve(store, embedder, index, 'hello', undefined as never)).toThrow('retrieve: store/embedder/index/query/opts required')
    })

    it('15. retrieve empty/whitespace query throws "retrieve: query must be a non-empty string"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const index = createLexicalIndex([])
      const embedder = createLexicalEmbedder(index)
      expect(() => retrieve(store, embedder, index, '', {})).toThrow('retrieve: query must be a non-empty string')
      expect(() => retrieve(store, embedder, index, '   ', {})).toThrow('retrieve: query must be a non-empty string')
    })

    it('16. retrieve k < 1 throws "retrieve: k must be a positive integer"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const index = createLexicalIndex([])
      const embedder = createLexicalEmbedder(index)
      expect(() => retrieve(store, embedder, index, 'hello', { k: 0 })).toThrow('retrieve: k must be a positive integer')
      expect(() => retrieve(store, embedder, index, 'hello', { k: -1 })).toThrow('retrieve: k must be a positive integer')
    })
  })

  // =========================================================================
  // §5.6 THE RETRIEVAL ENGINE (INDEX LIFECYCLE + MCP/UI ROUTING)
  // =========================================================================

  describe('§5.6 createRetrieval', () => {
    it('17. createRetrieval + query happy: the engine returns the retrieval result', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        const result = engine.query('hello')
        expect(result.query).toBe('hello')
        expect(result.ranked.length).toBeGreaterThan(0)
        expect(result.k).toBe(5)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('18. onStoreChanged content: a content edit updates the index for the affected node', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        // content edit
        await store.putNode(makeNode('n1', { content: 'goodbye moon' }))
        engine.onStoreChanged('content', ['n1'], [])
        const result = engine.query('goodbye')
        expect(result.ranked[0].nodeId).toBe('n1')
        const old = engine.query('hello')
        expect(old.ranked.some((s) => s.nodeId === 'n1')).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('19. onStoreChanged structural add: a node add adds the node to the index', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        engine.onStoreChanged('structural', ['n2'], [])
        const result = engine.query('goodbye')
        expect(result.ranked[0].nodeId).toBe('n2')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('20. onStoreChanged structural delete: a node delete removes the node from the index', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        await store.removeNode('n1')
        engine.onStoreChanged('structural', ['n1'], [])
        const result = engine.query('hello')
        expect(result.ranked.some((s) => s.nodeId === 'n1')).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('17. createRetrieval null/undefined store or embedder throws "createRetrieval: store/embedder required"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const index = createLexicalIndex([])
      const embedder = createLexicalEmbedder(index)
      expect(() => createRetrieval(null as never, embedder)).toThrow('createRetrieval: store/embedder required')
      expect(() => createRetrieval(undefined as never, embedder)).toThrow('createRetrieval: store/embedder required')
      expect(() => createRetrieval(store, null as never)).toThrow('createRetrieval: store/embedder required')
      expect(() => createRetrieval(store, undefined as never)).toThrow('createRetrieval: store/embedder required')
    })

    it('18. onStoreChanged null/undefined nodeIds throws "onStoreChanged: nodeIds required"', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const index = createLexicalIndex([])
      const embedder = createLexicalEmbedder(index)
      const engine = createRetrieval(store, embedder)
      expect(() => engine.onStoreChanged('content', null as never, [])).toThrow('onStoreChanged: nodeIds required')
      expect(() => engine.onStoreChanged('content', undefined as never, [])).toThrow('onStoreChanged: nodeIds required')
    })
  })

  // =========================================================================
  // §5.7 THE rag.query MCP TOOL + MCP/UI EQUIVALENCE
  // =========================================================================

  describe('§5.7 rag.query MCP tool + MCP/UI equivalence', () => {
    it('21. rag.query happy: a valid query → the tool returns the retrieval result', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      const result = handleRagTool(store, 'rag.query', { query: 'hello' }) as Record<string, unknown>
      expect(result.query).toBe('hello')
      expect(Array.isArray(result.ranked)).toBe(true)
      expect(Array.isArray(result.context)).toBe(true)
      expect(typeof result.markdown).toBe('string')
      expect(result.lineMap).toBeDefined()
      expect(result.k).toBe(5)
    })

    it('22. MCP/UI equivalence: the retrieval engine is the shared module — same params → same result', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        // both the MCP rag.query tool and the UI rag-query IPC call the SAME
        // engine (§5.6) — same params → same ranked/context/markdown/lineMap.
        const a = engine.query('hello', { k: 2 })
        const b = engine.query('hello', { k: 2 })
        expect(a).toEqual(b)
        expect(a.ranked).toEqual(b.ranked)
        expect(a.context).toEqual(b.context)
        expect(a.markdown).toBe(b.markdown)
        expect(a.lineMap).toEqual(b.lineMap)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('19. rag.query non-string/empty query → the tool rejects it', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      expect(() => handleRagTool(store, 'rag.query', { query: '' })).toThrow('rag.query: query must be a non-empty string')
      expect(() => handleRagTool(store, 'rag.query', { query: '   ' })).toThrow('rag.query: query must be a non-empty string')
      expect(() => handleRagTool(store, 'rag.query', { query: 42 })).toThrow('rag.query: query must be a non-empty string')
    })

    it('20. rag.query non-positive-integer topK → the tool rejects it', () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      expect(() => handleRagTool(store, 'rag.query', { query: 'hello', topK: 0 })).toThrow('rag.query: topK must be a positive integer')
      expect(() => handleRagTool(store, 'rag.query', { query: 'hello', topK: -1 })).toThrow('rag.query: topK must be a positive integer')
      expect(() => handleRagTool(store, 'rag.query', { query: 'hello', topK: 1.5 })).toThrow('rag.query: topK must be a positive integer')
    })

    it('21. rag.query with the rag group disabled → not callable (toolAllowed false)', () => {
      // default-off: only read/dispatch enabled → rag.query is denied
      expect(toolAllowed('rag.query', ['read', 'dispatch'])).toBe(false)
      expect(toolAllowed('rag.query', ['rag'])).toBe(true)
    })
  })
})
