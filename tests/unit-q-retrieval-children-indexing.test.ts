// tests/unit-q-retrieval-children-indexing.test.ts — Unit Q: retrieval indexing
// of inline `children` text (docs/specs/unit-q-retrieval-children-indexing.md
// §5.6 happy-path states + §5.7 fail-states). Mirrors the retrieval.test.ts
// conventions (vitest node environment, `.js` import suffix for the main-process
// ESM module, makeNode/makeEdge helpers, temp dirs via node:fs).
//
// RED SET: the new `nodeText` export + the amended index builders (tokenizing
// `nodeText(node)` instead of `node.content`) + the `renderNode`/`renderInlineText`
// renderer do NOT exist yet in src/main/retrieval.ts. The import of `nodeText`
// below therefore FAILS → the whole suite is red (the module import fails
// because `nodeText` does not exist). That is the expected red set.
//
// The embedder-dependent functions (`score`, `place`, `retrieve`,
// `RetrievalEngine.query`, `RetrievalEngine.onStoreChanged`) are ASYNC — the
// tests `await` them; their throws are REJECTED PROMISES
// (`await expect(...).rejects.toThrow(...)`). The store's mutating methods
// (putNode/putEdge/removeNode) are async and queue-serialized, so every call is
// awaited here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  nodeText,
  createLexicalIndex,
  updateLexicalIndex,
  addToLexicalIndex,
  removeFromLexicalIndex,
  createLexicalEmbedder,
  assembleContext,
  retrieve,
  createRetrieval,
  type RagNode,
  type RagEdge,
  type ScoredNode,
} from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'

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

describe('Unit Q — retrieval indexing of inline children text (unit-q-retrieval-children-indexing.md §5.6/§5.7)', () => {
  it('RED — the new nodeText export does not exist yet (src/main/retrieval.ts is not amended)', () => {
    expect(typeof nodeText).toBe('function')
  })

  // =========================================================================
  // §5.1 THE nodeText HELPER
  // =========================================================================

  describe('§5.1 nodeText', () => {
    it('1. node WITHOUT children → content unchanged', () => {
      expect(nodeText(makeNode('n1', { content: 'Hello world' }))).toBe('Hello world')
    })

    it('2. empty children array → content unchanged', () => {
      expect(nodeText(makeNode('n1', { content: 'Hello', children: [] }))).toBe('Hello')
    })

    it('3. children with content → space-joined, in order', () => {
      expect(nodeText(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'world' }] }))).toBe('Hello world')
    })

    it('4. multiple children in order → space-joined in array order', () => {
      expect(nodeText(makeNode('n1', {
        content: 'A',
        children: [{ type: 'strong', content: 'B' }, { type: 'em', content: 'C' }],
      }))).toBe('A B C')
    })

    it('5. child with empty content → dropped, contributes nothing', () => {
      expect(nodeText(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: '' }] }))).toBe('Hello')
    })

    it('6. empty content + children → returns the children content', () => {
      expect(nodeText(makeNode('n1', { content: '', children: [{ type: 'strong', content: 'bold' }] }))).toBe('bold')
    })

    it('1. nodeText(null)/nodeText(undefined) throws "nodeText: node required"', () => {
      expect(() => nodeText(null as never)).toThrow('nodeText: node required')
      expect(() => nodeText(undefined as never)).toThrow('nodeText: node required')
    })
  })

  // =========================================================================
  // §5.2 THE INDEX BUILDERS TOKENIZE nodeText(node)
  // =========================================================================

  describe('§5.2 index builders tokenize nodeText(node)', () => {
    it('7. createLexicalIndex indexes inline-child text: TF includes content + child tokens; a query for the child text matches the owning node', async () => {
      const nodes = [makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'world' }] })]
      const index = createLexicalIndex(nodes)
      // the owning node's TF includes BOTH the content token and the inline-child token
      expect(index.termFrequencies.get('n1')!.get('hello')).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('world')).toBe(1)
      expect(index.documentFrequencies.get('world')).toBe(1)
      // a query for the inline-child text matches the owning node (score > 0)
      const embedder = createLexicalEmbedder(index)
      const scored = await embedder.score('world', nodes)
      expect(scored[0].nodeId).toBe('n1')
      expect(scored[0].score).toBeGreaterThan(0)
    })

    it('8. updateLexicalIndex re-indexes inline-child text: a children edit drops the old token and gains the new one; DF + avgdl recomputed', () => {
      const index = createLexicalIndex([
        makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'world' }] }),
        makeNode('n2', { content: 'other' }),
      ])
      updateLexicalIndex(index, makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'moon' }] }))
      // n1's TF drops 'world' and gains 'moon'
      expect(index.termFrequencies.get('n1')!.get('world')).toBeUndefined()
      expect(index.termFrequencies.get('n1')!.get('moon')).toBe(1)
      expect(index.termFrequencies.get('n1')!.get('hello')).toBe(1)
      // DF recomputed: 'world' now only in no node → removed; 'moon' added
      expect(index.documentFrequencies.get('world')).toBeUndefined()
      expect(index.documentFrequencies.get('moon')).toBe(1)
      // avgdl recomputed: n1 tokens = 2 (hello, moon), n2 tokens = 1 (other) → 3/2 = 1.5
      expect(index.averageDocumentLength).toBe(1.5)
    })

    it('9. addToLexicalIndex indexes inline-child text: a new node with inline children → TF includes child tokens; DF incremented; documentCount incremented', () => {
      const index = createLexicalIndex([makeNode('n1', { content: 'Hello' })])
      addToLexicalIndex(index, makeNode('n2', { content: 'Goodbye', children: [{ type: 'em', content: 'moon' }] }))
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.documentCount).toBe(2)
      expect(index.termFrequencies.get('n2')!.get('goodbye')).toBe(1)
      expect(index.termFrequencies.get('n2')!.get('moon')).toBe(1)
      expect(index.documentFrequencies.get('moon')).toBe(1)
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
  // §5.3 THE MARKDOWN RENDERER (renderNode/renderInlineText)
  // =========================================================================

  describe('§5.3 renderNode/renderInlineText markdown', () => {
    // assembleContext renders each context node via renderNode → buildMarkdown.
    // A single-node store with the seed as topK yields the node's rendered markdown.
    async function renderMarkdown(node: RagNode): Promise<string> {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(node)
        const topK: ScoredNode[] = [{ nodeId: node.id, score: 1 }]
        return assembleContext(store, topK, { maxNodes: 50, maxDepth: 3 }).markdown
      } finally {
        rmSyncSafe(dir)
      }
    }

    it('10. strong child → markdown contains "Hello **world**"', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: 'Hello ', children: [{ type: 'strong', content: 'world' }] }))
      expect(md).toContain('Hello **world**')
    })

    it('11. em child → markdown contains "*note*"', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: '', children: [{ type: 'em', content: 'note' }] }))
      expect(md).toContain('*note*')
    })

    it('12. a child with href → markdown contains "[link](https://x)"', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }))
      expect(md).toContain('[link](https://x)')
    })

    it('13. img child with src → markdown contains "![alt](pic.png)"', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: '', children: [{ type: 'img', content: 'alt', props: { src: 'pic.png' } }] }))
      expect(md).toContain('![alt](pic.png)')
    })

    it('14. node WITHOUT children → markdown is content unchanged (byte-identical to Unit E)', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: 'Hello' }))
      expect(md).toBe('Hello')
    })

    it('15. a/img child with missing props → empty-URL form, NO throw', async () => {
      const aMd = await renderMarkdown(makeNode('n1', { content: '', children: [{ type: 'a', content: 'text' }] }))
      expect(aMd).toContain('[text]()')
      const imgMd = await renderMarkdown(makeNode('n2', { content: '', children: [{ type: 'img', content: 'alt' }] }))
      expect(imgMd).toContain('![alt]()')
    })

    // F1 regression — an empty-content child must be dropped (no `****`/`**`/`[]()`/`![]()`).
    it('F1. empty-content strong child → dropped, markdown is content only (no "****")', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: '' }] }))
      expect(md).toBe('Hello')
      expect(md).not.toContain('****')
    })

    // F2 regression — a non-string href/src must coerce to the empty-URL form (no garbage).
    it('F2. a child with non-string href → empty-URL form "[text]()" (no "[object Object]")', async () => {
      const md = await renderMarkdown(makeNode('n1', { content: '', children: [{ type: 'a', content: 'text', props: { href: {} as never } }] }))
      expect(md).toContain('[text]()')
      expect(md).not.toContain('[object Object]')
    })
  })

  // =========================================================================
  // §5.4 place — AUTOMATICALLY COVERED (no code change)
  // =========================================================================

  describe('§5.4 place automatically covered', () => {
    it('16. a new section matching inline-child text → place returns the owning node as the placement target', async () => {
      const nodes = [makeNode('n1', { type: 'p', content: 'Hello', children: [{ type: 'strong', content: 'world' }] })]
      const index = createLexicalIndex(nodes)
      const embedder = createLexicalEmbedder(index)
      const decision = await embedder.place('world', nodes, [])
      expect(decision.ok).toBe(true)
      if (decision.ok) {
        expect(decision.targetNodeId).toBe('n1')
        expect(decision.score).toBeGreaterThan(0)
      }
    })
  })

  // =========================================================================
  // §5.5 retrieve — UNCHANGED IN SHAPE, routes through the index
  // =========================================================================

  describe('§5.5 retrieve returns the owning node', () => {
    it('17. a query matching inline-child text → the owning node appears in ranked (score > 0) and context', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'world' }] }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const result = await retrieve(store, embedder, index, 'world', {})
        // the owning node survives the score-0 filter and appears in ranked + context
        expect(result.ranked.some((s) => s.nodeId === 'n1' && s.score > 0)).toBe(true)
        expect(result.context.some((n) => n.id === 'n1')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.6 createRetrieval — UNCHANGED IN SHAPE, maintains the index over children
  // =========================================================================

  describe('§5.6 createRetrieval maintains the index over inline children', () => {
    it('18. a children edit routed through onStoreChanged reconciles the node inline-child tokens', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'world' }] }))
        const index = createLexicalIndex(store.listNodes())
        const embedder = createLexicalEmbedder(index)
        const engine = createRetrieval(store, embedder)
        // children edit: 'world' → 'moon'
        await store.putNode(makeNode('n1', { content: 'Hello', children: [{ type: 'strong', content: 'moon' }] }))
        await engine.onStoreChanged('content', ['n1'], [])
        // the new inline-child token is indexed; the old one is gone
        const result = await engine.query('moon')
        expect(result.ranked.some((s) => s.nodeId === 'n1' && s.score > 0)).toBe(true)
        const old = await engine.query('world')
        expect(old.ranked.some((s) => s.nodeId === 'n1')).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })
})
