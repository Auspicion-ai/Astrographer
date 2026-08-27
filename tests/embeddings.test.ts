// tests/embeddings.test.ts — Unit F: the vector embedder + embedding providers
// (docs/specs/unit-f-embeddings.md §5.8 happy-path states + §5.9 fail-states).
// Mirrors the retrieval.test.ts conventions (temp dirs via node:fs, vitest node
// environment, `.js` import suffix for the main-process ESM module).
//
// The module under test is `src/main/embeddings.ts` — it DOES NOT EXIST yet, so
// this whole file is RED (the static import fails to resolve). The remote/cloud
// provider is tested with a MOCKED HTTP layer (a stubbed `fetch`) — NO live
// remote call in the test suite (no network egress in CI). The real-ollama
// integration path lives in tests/embeddings-ollama-integration.test.ts (gated
// by `describe.skipIf(!isOllamaAvailable())`).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createEmbeddingProvider,
  createOllamaEmbedProvider,
  createRemoteEmbedProvider,
  createVectorIndex,
  updateVectorIndex,
  addToVectorIndex,
  removeFromVectorIndex,
  cosineSimilarity,
  createVectorEmbedder,
  createMockEmbedder,
  isOllamaAvailable,
  type EmbeddingProviderConfig,
  type EmbeddingProvider,
  type EmbedTextFn,
  type VectorIndex,
} from '../src/main/embeddings.js'
import { createRetrieval, type Embedder } from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { handleRagTool, handleRagQueryIpc } from '../src/main/mcp-server.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-emb-'))
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

/** A deterministic bag-of-words → fixed-dimension embedding (the mock's
 *  algorithm shape). Similar texts (sharing tokens) get similar vectors. */
function textEmbedding(text: string, dim = 4): number[] {
  const vec = new Array(dim).fill(0)
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  for (const t of tokens) {
    let h = 0
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
    vec[h % dim] += 1
  }
  return vec
}

function parseBody(init: RequestInit): any {
  const b = init.body
  if (typeof b === 'string') return JSON.parse(b)
  return b
}

/** Stub the global `fetch` with a responder. Records the request URL/init/body. */
function stubFetch(
  responder: (url: string, init: RequestInit) => { ok: boolean; status: number; json: () => Promise<unknown> },
): Array<{ url: string; init: RequestInit; body: any }> {
  const calls: Array<{ url: string; init: RequestInit; body: any }> = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const body = parseBody(init)
    calls.push({ url, init, body })
    return responder(url, init)
  }))
  return calls
}

/** Stub the ollama embed endpoint to return a deterministic embedding derived
 *  from the input text (so the vector embedder's score/place are meaningful). */
function stubOllamaEmbedFetch(): Array<{ url: string; init: RequestInit; body: any }> {
  return stubFetch((url, init) => {
    const body = parseBody(init)
    return { ok: true, status: 200, json: async () => ({ embeddings: [textEmbedding(body.input)] }) }
  })
}

function headerValue(init: RequestInit, name: string): string | undefined {
  const h = init.headers as Record<string, string> | Headers | undefined
  if (!h) return undefined
  if (typeof (h as Headers).get === 'function') return (h as Headers).get(name) ?? undefined
  return (h as Record<string, string>)[name]
}

const OLLAMA_CONFIG: EmbeddingProviderConfig = {
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434',
  model: 'embeddinggemma',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Unit F — embeddings module (unit-f-embeddings.md §5.8/§5.9)', () => {
  it('RED — the embeddings module is not exported yet (src/main/embeddings.ts does not exist)', () => {
    expect(typeof createEmbeddingProvider).toBe('function')
  })

  // =========================================================================
  // §5.2 THE EMBEDDING PROVIDER ABSTRACTION + CONFIG
  // =========================================================================

  describe('§5.2 createEmbeddingProvider + config', () => {
    it('1. createEmbeddingProvider happy (ollama): dispatches to the ollama provider', () => {
      const provider = createEmbeddingProvider(OLLAMA_CONFIG)
      expect(provider.kind).toBe('ollama')
      expect(provider.model).toBe('embeddinggemma')
      expect(provider.baseUrl).toBe('http://127.0.0.1:11434')
    })

    it('2. createEmbeddingProvider happy (remote/cloud): dispatches to the remote provider', () => {
      const provider = createEmbeddingProvider({
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        model: 'text-embedding-3-small',
        apiKey: 'sk-test',
      })
      expect(provider.kind).toBe('openai')
      expect(provider.model).toBe('text-embedding-3-small')
      expect(provider.baseUrl).toBe('https://api.openai.com/v1')
    })

    it('1. createEmbeddingProvider null/undefined config throws "createEmbeddingProvider: config required"', () => {
      expect(() => createEmbeddingProvider(null as never)).toThrow('createEmbeddingProvider: config required')
      expect(() => createEmbeddingProvider(undefined as never)).toThrow('createEmbeddingProvider: config required')
    })

    it('2. createEmbeddingProvider missing/empty baseUrl throws "createEmbeddingProvider: baseUrl required"', () => {
      expect(() => createEmbeddingProvider({ provider: 'ollama', baseUrl: '', model: 'x' })).toThrow('createEmbeddingProvider: baseUrl required')
      expect(() => createEmbeddingProvider({ provider: 'ollama', model: 'x' } as never)).toThrow('createEmbeddingProvider: baseUrl required')
    })

    it('3. createEmbeddingProvider missing/empty model throws "createEmbeddingProvider: model required"', () => {
      expect(() => createEmbeddingProvider({ provider: 'ollama', baseUrl: 'http://127.0.0.1:11434', model: '' })).toThrow('createEmbeddingProvider: model required')
      expect(() => createEmbeddingProvider({ provider: 'ollama', baseUrl: 'http://127.0.0.1:11434' } as never)).toThrow('createEmbeddingProvider: model required')
    })

    it('4. createOllamaEmbedProvider non-localhost baseUrl throws "createOllamaEmbedProvider: baseUrl must be localhost"', () => {
      expect(() => createOllamaEmbedProvider({ baseUrl: 'https://api.openai.com/v1' })).toThrow('createOllamaEmbedProvider: baseUrl must be localhost')
      expect(() => createOllamaEmbedProvider({ baseUrl: 'http://example.com' })).toThrow('createOllamaEmbedProvider: baseUrl must be localhost')
    })

    it('5. createRemoteEmbedProvider missing/empty apiKey throws "createRemoteEmbedProvider: apiKey required"', () => {
      expect(() => createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: '' })).toThrow('createRemoteEmbedProvider: apiKey required')
      expect(() => createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x' } as never)).toThrow('createRemoteEmbedProvider: apiKey required')
    })
  })

  // =========================================================================
  // §5.2 THE OLLAMA CONCRETE PROVIDER (LOCALHOST)
  // =========================================================================

  describe('§5.2 ollama provider (createOllamaEmbedProvider)', () => {
    it('ollama request shape: POST {baseUrl}/api/embed with { model, input }, no auth header', async () => {
      const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      const vec = await provider.embed('hello world')
      expect(vec).toEqual([0.1, 0.2, 0.3, 0.4])
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('http://127.0.0.1:11434/api/embed')
      expect(calls[0].body).toEqual({ model: 'embeddinggemma', input: 'hello world' })
      // LOCAL-SECURITY-POSTURE: no credentials sent
      expect(headerValue(calls[0].init, 'Authorization')).toBeUndefined()
    })

    it('3. provider dimension auto-detect: first embed sets dimension, subsequent validated', async () => {
      stubFetch((url, init) => {
        const body = parseBody(init)
        const len = body.input === 'hello' ? 4 : 3
        return { ok: true, status: 200, json: async () => ({ embeddings: [new Array(len).fill(0.1)] }) }
      })
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      const a = await provider.embed('hello')
      expect(a).toHaveLength(4)
      expect(provider.dimension).toBe(4)
      // a subsequent vector of a different length → dimension mismatch
      await expect(provider.embed('world')).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 3)')
    })

    it('4. provider configured dimension: every returned vector validated to length 4', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma', dimension: 4 })
      const vec = await provider.embed('hello')
      expect(vec).toHaveLength(4)
      // a mismatched vector → dimension mismatch
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3]] }) }))
      await expect(provider.embed('world')).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 3)')
    })

    it('6. ollama non-2xx HTTP rejects "ollama embed: HTTP <status>"', async () => {
      stubFetch(() => ({ ok: false, status: 500, json: async () => ({}) }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      await expect(provider.embed('hello')).rejects.toThrow('ollama embed: HTTP 500')
    })

    it('7. ollama network failure (ollama down) rejects "ollama embed: <message>"', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('fetch failed') }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      await expect(provider.embed('hello')).rejects.toThrow('ollama embed: fetch failed')
    })

    it('8. ollama timeout rejects "ollama embed: timeout after <timeoutMs>ms"', async () => {
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma', timeoutMs: 20 })
      await expect(provider.embed('hello')).rejects.toThrow('ollama embed: timeout after 20ms')
    })

    it('9. ollama malformed response rejects "ollama embed: malformed response"', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({}) }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      await expect(provider.embed('hello')).rejects.toThrow('ollama embed: malformed response')
    })

    it('10. ollama dimension mismatch rejects "ollama embed: dimension mismatch (expected <n>, got <m>)"', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3]] }) }))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma', dimension: 4 })
      await expect(provider.embed('hello')).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 3)')
    })

    it('11. ollama non-string text rejects "ollama embed: text must be a string"', async () => {
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      await expect(provider.embed(null as never)).rejects.toThrow('ollama embed: text must be a string')
      await expect(provider.embed(42 as never)).rejects.toThrow('ollama embed: text must be a string')
    })
  })

  // =========================================================================
  // §5.2 THE REMOTE/CLOUD CONCRETE PROVIDER (MOCKED HTTP — NO LIVE CALL)
  // =========================================================================

  describe('§5.2 remote/cloud provider (createRemoteEmbedProvider, mocked fetch)', () => {
    it('21. remote mocked happy: parses the embedding, validates the dimension, resolves; Authorization Bearer header present', async () => {
      const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3, 0.4] }] }) }))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'text-embedding-3-small', apiKey: 'sk-test' })
      const vec = await provider.embed('hello')
      expect(vec).toEqual([0.1, 0.2, 0.3, 0.4])
      expect(calls).toHaveLength(1)
      expect(calls[0].url).toBe('https://api.openai.com/v1')
      // REMOTE-SECURITY-POSTURE: the API key is sent as an Authorization bearer header
      expect(headerValue(calls[0].init, 'Authorization')).toBe('Bearer sk-test')
      // the body carries the model name + text
      expect(calls[0].body.model).toBe('text-embedding-3-small')
      expect(calls[0].body.input).toBe('hello')
    })

    it('12. remote non-2xx HTTP rejects "remote embed: HTTP <status>"', async () => {
      stubFetch(() => ({ ok: false, status: 401, json: async () => ({}) }))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: HTTP 401')
    })

    it('13. remote network failure rejects "remote embed: <message>"', async () => {
      vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down') }))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: network down')
    })

    it('14. remote timeout rejects "remote embed: timeout after <timeoutMs>ms"', async () => {
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test', timeoutMs: 20 })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: timeout after 20ms')
    })

    it('15. remote malformed response rejects "remote embed: malformed response"', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({}) }))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: malformed response')
    })

    it('16. remote dimension mismatch rejects "remote embed: dimension mismatch (expected <n>, got <m>)"', async () => {
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3] }] }) }))
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test', dimension: 4 })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: dimension mismatch (expected 4, got 3)')
    })

    it('17. remote non-string text rejects "remote embed: text must be a string"', async () => {
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
      await expect(provider.embed(null as never)).rejects.toThrow('remote embed: text must be a string')
    })

    it('18. remote baseUrl not in connect-src allowlist rejects "remote embed: baseUrl not in connect-src allowlist"', async () => {
      const provider = createRemoteEmbedProvider({ baseUrl: 'https://evil.example.com/v1', model: 'x', apiKey: 'sk-test' })
      await expect(provider.embed('hello')).rejects.toThrow('remote embed: baseUrl not in connect-src allowlist')
    })
  })

  // =========================================================================
  // §5.3 THE VECTOR INDEX
  // =========================================================================

  describe('§5.3 vector index', () => {
    const embedFn: EmbedTextFn = async (text) => textEmbedding(text)

    it('5. createVectorIndex happy: node ids, embeddings, dimension', async () => {
      const nodes = [makeNode('n1', { content: 'hello world' }), makeNode('n2', { content: 'goodbye moon' })]
      const index = await createVectorIndex(nodes, embedFn)
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.embeddings.has('n1')).toBe(true)
      expect(index.embeddings.has('n2')).toBe(true)
      expect(index.dimension).toBe(4)
    })

    it('6. updateVectorIndex happy (content edit): embedding replaced', async () => {
      const index = await createVectorIndex([makeNode('n1', { content: 'hello world' })], embedFn)
      const before = index.embeddings.get('n1')
      await updateVectorIndex(index, makeNode('n1', { content: 'goodbye moon' }), embedFn)
      const after = index.embeddings.get('n1')
      expect(after).not.toEqual(before)
    })

    it('7. addToVectorIndex happy (node add): embedding added, id appended', async () => {
      const index = await createVectorIndex([makeNode('n1', { content: 'hello world' })], embedFn)
      await addToVectorIndex(index, makeNode('n2', { content: 'goodbye moon' }), embedFn)
      expect(index.nodeIds).toEqual(['n1', 'n2'])
      expect(index.embeddings.has('n2')).toBe(true)
    })

    it('8. removeFromVectorIndex happy (node delete): embedding and id removed', async () => {
      const index = await createVectorIndex([makeNode('n1', { content: 'hello world' }), makeNode('n2', { content: 'goodbye moon' })], embedFn)
      removeFromVectorIndex(index, 'n1')
      expect(index.nodeIds).toEqual(['n2'])
      expect(index.embeddings.has('n1')).toBe(false)
    })

    it('19. createVectorIndex null/undefined nodes or embedFn rejects "createVectorIndex: nodes/embedFn required"', async () => {
      await expect(createVectorIndex(null as never, embedFn)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex(undefined as never, embedFn)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex([], null as never)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
      await expect(createVectorIndex([], undefined as never)).rejects.toThrow('createVectorIndex: nodes/embedFn required')
    })

    it('20. updateVectorIndex/addToVectorIndex null/undefined index/node/embedFn rejects "vector index: index/node/embedFn required"', async () => {
      const index = await createVectorIndex([], embedFn)
      const node = makeNode('n1')
      await expect(updateVectorIndex(null as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(undefined as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, null as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, undefined as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, node, null as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(updateVectorIndex(index, node, undefined as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(null as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(undefined as never, node, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, null as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, undefined as never, embedFn)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, node, null as never)).rejects.toThrow('vector index: index/node/embedFn required')
      await expect(addToVectorIndex(index, node, undefined as never)).rejects.toThrow('vector index: index/node/embedFn required')
    })

    it('21. removeFromVectorIndex null/undefined index or non-string nodeId throws "vector index: index/nodeId required"', async () => {
      const index = await createVectorIndex([], embedFn)
      expect(() => removeFromVectorIndex(null as never, 'n1')).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(undefined as never, 'n1')).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, null as never)).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, undefined as never)).toThrow('vector index: index/nodeId required')
      expect(() => removeFromVectorIndex(index, 42 as never)).toThrow('vector index: index/nodeId required')
    })

    it('embedFn rejection propagates from the index build/maintenance', async () => {
      const failing: EmbedTextFn = async () => { throw new Error('provider down') }
      await expect(createVectorIndex([makeNode('n1', { content: 'x' })], failing)).rejects.toThrow('provider down')
      const index = await createVectorIndex([], embedFn)
      await expect(updateVectorIndex(index, makeNode('n1', { content: 'x' }), failing)).rejects.toThrow('provider down')
      await expect(addToVectorIndex(index, makeNode('n1', { content: 'x' }), failing)).rejects.toThrow('provider down')
    })
  })

  // =========================================================================
  // §5.4 COSINE SIMILARITY + SCORING
  // =========================================================================

  describe('§5.4 cosineSimilarity', () => {
    it('9. cosineSimilarity happy: identical → 1, orthogonal → 0, opposite → -1', () => {
      expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1, 10)
      expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10)
      expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 10)
    })

    it('10. cosineSimilarity zero vector → 0 (no throw)', () => {
      expect(cosineSimilarity([0, 0], [1, 0])).toBe(0)
      expect(cosineSimilarity([1, 0], [0, 0])).toBe(0)
      expect(cosineSimilarity([0, 0], [0, 0])).toBe(0)
    })

    it('22. cosineSimilarity null/undefined a/b throws "cosineSimilarity: a/b required"', () => {
      expect(() => cosineSimilarity(null as never, [1, 0])).toThrow('cosineSimilarity: a/b required')
      expect(() => cosineSimilarity(undefined as never, [1, 0])).toThrow('cosineSimilarity: a/b required')
      expect(() => cosineSimilarity([1, 0], null as never)).toThrow('cosineSimilarity: a/b required')
      expect(() => cosineSimilarity([1, 0], undefined as never)).toThrow('cosineSimilarity: a/b required')
    })

    it('23. cosineSimilarity dimension mismatch throws "cosineSimilarity: dimension mismatch"', () => {
      expect(() => cosineSimilarity([1, 0], [1, 0, 0])).toThrow('cosineSimilarity: dimension mismatch')
    })
  })

  // =========================================================================
  // §5.5 THE VECTOR EMBEDDER (createVectorEmbedder)
  // =========================================================================

  describe('§5.5 createVectorEmbedder', () => {
    it('11. createVectorEmbedder + score happy (mock): a matching node scores > 0, ranked highest-first', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const scored = await embedder.score('hello', store.listNodes())
        expect(scored[0].nodeId).toBe('n1')
        expect(scored[0].score).toBeGreaterThan(0)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('12. vector determinism: same query + same index + same nodes → same ranked result (twice)', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const a = await embedder.score('hello', store.listNodes())
        const b = await embedder.score('hello', store.listNodes())
        expect(a).toEqual(b)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('13. vector tie-break: equal scores sorted by node id ascending', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n2', { content: 'hello world' }))
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const scored = await embedder.score('hello', store.listNodes())
        expect(scored[0].score).toBeCloseTo(scored[1].score, 10)
        expect(scored[0].nodeId).toBe('n1')
        expect(scored[1].nodeId).toBe('n2')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('14. place happy (vector): a new section matches an existing section → next-section', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { type: 'p', content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const decision = await embedder.place('hello', store.listNodes(), [])
        expect(decision.ok).toBe(true)
        if (decision.ok) {
          expect(decision.targetNodeId).toBe('n1')
          expect(decision.edgeKind).toBe('next-section')
          expect(decision.score).toBeGreaterThan(0)
        }
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('15. place container match (vector): best match is a ul/ol/div node → doc-child', async () => {
      for (const type of ['ul', 'ol', 'div'] as const) {
        const dir = freshDir()
        try {
          const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
          await store.putNode(makeNode('n1', { type, content: 'hello world' }))
          stubOllamaEmbedFetch()
          const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
          const decision = await embedder.place('hello', store.listNodes(), [])
          expect(decision.ok).toBe(true)
          if (decision.ok) expect(decision.edgeKind).toBe('doc-child')
        } finally {
          rmSyncSafe(dir)
        }
      }
    })

    it('24. onStoreChanged vector maintenance: content edit re-embeds, structural add embeds, structural delete removes', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        await store.putNode(makeNode('n2', { content: 'goodbye moon' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        // content edit n1 → re-embed
        await store.putNode(makeNode('n1', { content: 'goodbye moon' }))
        await embedder.onStoreChanged('content', ['n1'], [])
        const afterEdit = await embedder.score('goodbye', store.listNodes())
        expect(afterEdit[0].nodeId).toBe('n1')
        // structural add n3 → embed
        await store.putNode(makeNode('n3', { content: 'hello world' }))
        await embedder.onStoreChanged('structural', ['n3'], [])
        const afterAdd = await embedder.score('hello', store.listNodes())
        expect(afterAdd.some((s) => s.nodeId === 'n3')).toBe(true)
        // structural delete n2 → remove
        await store.removeNode('n2')
        await embedder.onStoreChanged('structural', ['n2'], [])
        const afterDelete = await embedder.score('goodbye', store.listNodes())
        expect(afterDelete.find((s) => s.nodeId === 'n2')?.score ?? 0).toBe(0)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('24. createVectorEmbedder null/undefined store rejects "createVectorEmbedder: store required"', async () => {
      await expect(createVectorEmbedder(null as never, { provider: OLLAMA_CONFIG })).rejects.toThrow('createVectorEmbedder: store required')
      await expect(createVectorEmbedder(undefined as never, { provider: OLLAMA_CONFIG })).rejects.toThrow('createVectorEmbedder: store required')
    })

    it('25. createVectorEmbedder null/undefined opts or opts.provider rejects "createVectorEmbedder: provider config required"', async () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      await expect(createVectorEmbedder(store, null as never)).rejects.toThrow('createVectorEmbedder: provider config required')
      await expect(createVectorEmbedder(store, undefined as never)).rejects.toThrow('createVectorEmbedder: provider config required')
      await expect(createVectorEmbedder(store, { provider: null as never })).rejects.toThrow('createVectorEmbedder: provider config required')
      await expect(createVectorEmbedder(store, { provider: undefined as never })).rejects.toThrow('createVectorEmbedder: provider config required')
    })

    it('26. provider-creation failure propagates from createVectorEmbedder', async () => {
      const store: RagStore = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
      await expect(createVectorEmbedder(store, { provider: { provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'x' } })).rejects.toThrow('createRemoteEmbedProvider: apiKey required')
    })

    it('27. score non-string query or null/undefined nodes rejects "embedder score: query/nodes required"', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        await expect(embedder.score(null as never, [])).rejects.toThrow('embedder score: query/nodes required')
        await expect(embedder.score(undefined as never, [])).rejects.toThrow('embedder score: query/nodes required')
        await expect(embedder.score(42 as never, [])).rejects.toThrow('embedder score: query/nodes required')
        await expect(embedder.score('hello', null as never)).rejects.toThrow('embedder score: query/nodes required')
        await expect(embedder.score('hello', undefined as never)).rejects.toThrow('embedder score: query/nodes required')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('28. place non-string content or null/undefined nodes/edges rejects "embedder place: content/nodes/edges required"', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        await expect(embedder.place(null as never, [], [])).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place(undefined as never, [], [])).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place(42 as never, [], [])).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place('hello', null as never, [])).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place('hello', undefined as never, [])).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place('hello', [], null as never)).rejects.toThrow('embedder place: content/nodes/edges required')
        await expect(embedder.place('hello', [], undefined as never)).rejects.toThrow('embedder place: content/nodes/edges required')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('29. place empty content (vector) → { ok: false, reason: "empty-content" }', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        await expect(embedder.place('', [], [])).resolves.toEqual({ ok: false, reason: 'empty-content' })
        await expect(embedder.place('   ', [], [])).resolves.toEqual({ ok: false, reason: 'empty-content' })
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('30. place no match (vector) → { ok: false, reason: "no-match" }', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        // 'a c' hashes to buckets orthogonal to 'hello world' (cosine 0 <= PLACEMENT_MIN_SCORE) → no-match.
        const decision = await embedder.place('a c', store.listNodes(), [])
        expect(decision).toEqual({ ok: false, reason: 'no-match' })
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('31. onStoreChanged null/undefined nodeIds rejects "onStoreChanged: nodeIds required"', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        await expect(embedder.onStoreChanged('content', null as never, [])).rejects.toThrow('onStoreChanged: nodeIds required')
        await expect(embedder.onStoreChanged('content', undefined as never, [])).rejects.toThrow('onStoreChanged: nodeIds required')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('32. embed rejection propagates from score/place/onStoreChanged', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        // now the provider is down
        vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('provider down') }))
        await expect(embedder.score('hello', store.listNodes())).rejects.toThrow('provider down')
        await expect(embedder.place('hello', store.listNodes(), [])).rejects.toThrow('provider down')
        await expect(embedder.onStoreChanged('content', ['n1'], [])).rejects.toThrow('provider down')
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.6 THE MOCK EMBEDDER (UNIT TESTS — NO PROVIDER DEPENDENCY)
  // =========================================================================

  describe('§5.6 createMockEmbedder', () => {
    it('16. createMockEmbedder happy: deterministic, no provider dependency; same query + nodes → same result (twice)', async () => {
      const mock = createMockEmbedder()
      const nodes = [makeNode('n1', { content: 'hello world' }), makeNode('n2', { content: 'goodbye moon' })]
      const a = await mock.score('hello', nodes)
      const b = await mock.score('hello', nodes)
      expect(a).toEqual(b)
      expect(a[0].nodeId).toBe('n1')
      expect(a[0].score).toBeGreaterThan(0)
      // place works with no provider dependency
      const decision = await mock.place('hello', nodes, [])
      expect(decision.ok).toBe(true)
      if (decision.ok) expect(decision.targetNodeId).toBe('n1')
    })
  })

  // =========================================================================
  // §5.6 isOllamaAvailable (the integration-test probe)
  // =========================================================================

  describe('§5.6 isOllamaAvailable', () => {
    it('17. isOllamaAvailable returns a boolean (never throws)', () => {
      const result = isOllamaAvailable('http://127.0.0.1:11434')
      expect(typeof result).toBe('boolean')
    })

    it('18. isOllamaAvailable with ollama down returns false (no throw)', () => {
      // a closed localhost port → the probe fails → false, never throws
      expect(isOllamaAvailable('http://127.0.0.1:1')).toBe(false)
    })
  })

  // =========================================================================
  // §5.7 THE DROP-IN SEAM + MCP/UI EQUIVALENCE (VECTOR EMBEDDER)
  // =========================================================================

  describe('§5.7 vector embedder drop-in + MCP/UI equivalence', () => {
    it('25. config selection: the vector embedder is a drop-in behind the Embedder interface (createRetrieval uses it)', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const engine = createRetrieval(store, embedder)
        const result = await engine.query('hello')
        expect(result.ranked[0].nodeId).toBe('n1')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('26. MCP/UI equivalence (vector): rag.query and rag-query IPC produce the same result with the vector embedder', async () => {
      const dir = freshDir()
      try {
        const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
        await store.putNode(makeNode('n1', { content: 'hello world' }))
        stubOllamaEmbedFetch()
        const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
        const engine = createRetrieval(store, embedder)
        const mcp = await handleRagTool(store, 'rag.query', { query: 'hello', topK: 2 }, engine)
        const ipc = await handleRagQueryIpc(engine, store, { query: 'hello', topK: 2 })
        expect(ipc).toEqual(mcp)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })
})
