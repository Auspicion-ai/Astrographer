// tests/embeddings-ollama-integration.test.ts — Unit F: the real-ollama
// INTEGRATION test path (docs/specs/unit-f-embeddings.md §5.6). Exercises the
// ACTUAL `embeddinggemma` model via the real provider. Gated by
// `describe.skipIf(!isOllamaAvailable())` — the test is SKIPPED (not failed)
// when the local ollama server is not reachable. This is the ONLY live-network
// test path in the suite, and it is localhost-only.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  isOllamaAvailable,
  createOllamaEmbedProvider,
  createVectorEmbedder,
  cosineSimilarity,
} from '../src/main/embeddings.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'

const OLLAMA_BASE = 'http://127.0.0.1:11434'
const OLLAMA_MODEL = 'embeddinggemma'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-ollama-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, content: string): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now }
}

describe.skipIf(!isOllamaAvailable(OLLAMA_BASE))('ollama integration (real embeddinggemma model)', () => {
  it('a real embed of a known text returns a vector of the model dimension (auto-detected)', async () => {
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: OLLAMA_MODEL })
    const vec = await provider.embed('hello world')
    expect(Array.isArray(vec)).toBe(true)
    expect(vec.length).toBeGreaterThan(0)
    expect(provider.dimension).toBe(vec.length)
  })

  it('two semantically-similar texts score higher (cosine) than two dissimilar texts', async () => {
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: OLLAMA_MODEL })
    const a = await provider.embed('the quick brown fox jumps over the lazy dog')
    const b = await provider.embed('a fast brown fox leaps over a sleepy dog')
    const c = await provider.embed('the stock market opened higher today')
    const simAB = cosineSimilarity(a, b)
    const simAC = cosineSimilarity(a, c)
    expect(simAB).toBeGreaterThan(simAC)
  })

  it('the vector embedder score/place work end-to-end against the real model', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', 'the quick brown fox jumps over the lazy dog'))
      await store.putNode(makeNode('n2', 'the stock market opened higher today'))
      const embedder = await createVectorEmbedder(store, {
        provider: { provider: 'ollama', baseUrl: OLLAMA_BASE, model: OLLAMA_MODEL },
      })
      const scored = await embedder.score('a fast brown fox leaps', store.listNodes())
      expect(scored[0].nodeId).toBe('n1')
      expect(scored[0].score).toBeGreaterThan(0)
      const decision = await embedder.place('a fast brown fox leaps', store.listNodes(), [])
      expect(decision.ok).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})
