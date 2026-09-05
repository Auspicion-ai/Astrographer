// tests/embeddings-adversarial.test.ts — Unit F adversarial findings (F1-F9),
// all HOST findings (this repo's `src/`). Each finding is fixed in `src/` and
// regression-tested here. The existing tests (embeddings.test.ts,
// retrieval-adversarial.test.ts, etc.) are the contract and are NOT modified.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createEmbeddingProvider,
  createOllamaEmbedProvider,
  createRemoteEmbedProvider,
  createVectorIndex,
  updateVectorIndex,
  addToVectorIndex,
  createVectorEmbedder,
  isOllamaAvailable,
  parsePositiveIntEnv,
  type EmbeddingProvider,
  type EmbeddingProviderConfig,
  type EmbedTextFn,
} from '../src/main/embeddings.js'
// F-W2-2 — namespace import (NOT a static named import): a missing named
// export would fail module collection for the WHOLE file (taking the 13
// existing green tests down); namespace access yields undefined until the
// export lands, failing only the new red test.
import * as embeddingsNs from '../src/main/embeddings.js'
import { createRetrieval, type RetrievalEngine } from '../src/main/retrieval.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { SecurityGate } from '../src/main/security.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-emb-adv-'))
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

const OLLAMA_CONFIG: EmbeddingProviderConfig = {
  provider: 'ollama',
  baseUrl: 'http://127.0.0.1:11434',
  model: 'embeddinggemma',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Unit F adversarial findings (F1-F9) — host fixes + regression tests', () => {
  // =========================================================================
  // F1 — unhandled promise rejection + silent vector-index staleness on
  // `onStoreChanged` when the provider is down. The fire-and-forget reconcile
  // in the MCP edit-tool handler must `.catch()` the rejection so the edit
  // still succeeds (no unhandled rejection).
  // =========================================================================
  it('F1 — an edit tool succeeds even when the retrieval engine onStoreChanged rejects (the fire-and-forget reconcile is caught)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      // a retrieval engine whose onStoreChanged rejects (the vector embedder's
      // provider is down)
      const engine: RetrievalEngine = {
        query: async () => { throw new Error('unused') },
        onStoreChanged: async () => { throw new Error('provider down') },
      }
      const backend: McpBackend = { invoke: async () => ({}) }
      const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate(), ragStore: store, retrievalEngine: engine })
      server.ensureServerRegistered()
      server.applyGatePatch({ groups: ['edit'] })
      const sdkServer = server.ensureServerRegistered()
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
      const client = new Client({ name: 'embeddings-adversarial', version: '0.1.0' })
      // connect both sides in parallel (the client's connect awaits the server's
      // initialize response, so the server must be connecting at the same time)
      await Promise.all([
        client.connect(clientTransport),
        (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
      ])
      // the edit succeeds despite the reconcile rejection (the .catch swallows it)
      const result = await client.callTool({ name: 'edit.set_content', arguments: { nodeId: 'n1', content: 'world' } })
      const text = (result as { content?: Array<{ text?: string }> }).content?.[0]?.text ?? ''
      expect(text).toContain('"ok": true')
      await client.close()
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F2 — shell-command injection via `isOllamaAvailable` baseUrl. The probe now
  // uses execFileSync (no shell) and validates the URL is localhost/loopback.
  // =========================================================================
  it('F2 — isOllamaAvailable rejects a non-localhost baseUrl (no probe, no shell)', () => {
    // a non-localhost baseUrl is rejected before any probe (no shell execution)
    expect(isOllamaAvailable('https://api.openai.com/v1')).toBe(false)
    expect(isOllamaAvailable('http://example.com')).toBe(false)
  })

  it('F2 — isOllamaAvailable uses execFileSync (no shell): a baseUrl with shell metacharacters is not executed', () => {
    const marker = join(tmpdir(), `provident-pwned-${Date.now()}`)
    try {
      // the hostname is localhost (passes the localhost gate), but the shell
      // metacharacters must be passed as a URL argument, never executed
      isOllamaAvailable(`http://127.0.0.1:1; touch ${marker}`)
      expect(existsSync(marker)).toBe(false)
    } finally {
      rmSync(marker, { force: true })
    }
  })

  // =========================================================================
  // F3 — IPv6 loopback `[::1]` rejected by the ollama localhost check. The
  // hostname is normalized (brackets stripped) before the `::1` comparison.
  // =========================================================================
  it('F3 — IPv6 loopback [::1] is accepted as localhost (hostname normalized)', () => {
    // createOllamaEmbedProvider must NOT reject the bracketed IPv6 loopback
    expect(() => createOllamaEmbedProvider({ baseUrl: 'http://[::1]:11434' })).not.toThrow()
    // isOllamaAvailable on [::1] returns a boolean (never throws)
    expect(typeof isOllamaAvailable('http://[::1]:11434')).toBe('boolean')
  })

  // =========================================================================
  // F4 — `retrieve` applies a lexical-specific tokenize check to the vector
  // embedder. The zero-token (stopword-only) check is now gated on the lexical
  // embedder, so the vector embedder handles a stopword-only query.
  // =========================================================================
  it('F4 — the vector embedder handles a stopword-only query (the zero-token check is lexical-only)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
      const embedder = await createVectorEmbedder(store, { provider: OLLAMA_CONFIG })
      const engine = createRetrieval(store, embedder)
      // a stopword-only query is a valid embedding input for the vector embedder
      const result = await engine.query('the')
      expect(Array.isArray(result.ranked)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // F5 — malformed env config (NaN dimension/timeout) not validated. The
  // `parsePositiveIntEnv` helper drops NaN/negative/non-integer/empty values.
  // =========================================================================
  it('F5 — parsePositiveIntEnv validates env dimension/timeout (NaN/negative/non-integer dropped)', () => {
    expect(parsePositiveIntEnv('4')).toBe(4)
    expect(parsePositiveIntEnv('5000')).toBe(5000)
    expect(parsePositiveIntEnv('NaN')).toBeUndefined()
    expect(parsePositiveIntEnv('abc')).toBeUndefined()
    expect(parsePositiveIntEnv('-3')).toBeUndefined()
    expect(parsePositiveIntEnv('0')).toBeUndefined()
    expect(parsePositiveIntEnv('1.5')).toBeUndefined()
    expect(parsePositiveIntEnv('')).toBeUndefined()
    expect(parsePositiveIntEnv(undefined)).toBeUndefined()
  })

  // =========================================================================
  // F6 — `createVectorIndex`/`updateVectorIndex`/`addToVectorIndex` don't
  // validate dimension consistency across nodes. A mismatched vector is now
  // rejected.
  // =========================================================================
  it('F6 — createVectorIndex rejects a dimension mismatch across nodes', async () => {
    const nodes = [makeNode('n1', { content: 'a' }), makeNode('n2', { content: 'b' })]
    const embedFn: EmbedTextFn = async (text) => (text === 'a' ? [1, 2, 3, 4] : [1, 2, 3])
    await expect(createVectorIndex(nodes, embedFn)).rejects.toThrow('createVectorIndex: dimension mismatch (expected 4, got 3)')
  })

  it('F6 — updateVectorIndex/addToVectorIndex reject a dimension mismatch', async () => {
    const index = await createVectorIndex([makeNode('n1', { content: 'a' })], async () => [1, 2, 3, 4])
    await expect(updateVectorIndex(index, makeNode('n1', { content: 'b' }), async () => [1, 2, 3])).rejects.toThrow('updateVectorIndex: dimension mismatch (expected 4, got 3)')
    await expect(addToVectorIndex(index, makeNode('n2', { content: 'b' }), async () => [1, 2, 3])).rejects.toThrow('addToVectorIndex: dimension mismatch (expected 4, got 3)')
  })

  // =========================================================================
  // F7 — non-numeric vector elements produce NaN scores. Both providers now
  // validate every element is a finite number (else 'malformed response').
  // =========================================================================
  it('F7 — ollama provider rejects a vector with a non-numeric element (malformed response)', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 'x', 0.3, 0.4]] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
    await expect(provider.embed('hello')).rejects.toThrow('ollama embed: malformed response')
  })

  it('F7 — remote provider rejects a vector with a NaN element (malformed response)', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [0.1, NaN, 0.3, 0.4] }] }) }))
    const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
    await expect(provider.embed('hello')).rejects.toThrow('remote embed: malformed response')
  })

  // =========================================================================
  // F8 — the remote provider is OpenAI-shaped, not truly provider-agnostic.
  // The request/response shape is now dispatched on the provider kind.
  // =========================================================================
  it('F8 — the remote provider dispatches the request/response shape on the provider kind (cohere)', async () => {
    const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
    const provider = createRemoteEmbedProvider({ baseUrl: 'https://api.cohere.com/v1', model: 'embed-english-v3', apiKey: 'sk-test', kind: 'cohere' })
    const vec = await provider.embed('hello')
    expect(vec).toEqual([0.1, 0.2, 0.3, 0.4])
    expect(calls).toHaveLength(1)
    // Cohere shape: `{ model, texts }` (not `{ model, input }`)
    expect(calls[0].body).toEqual({ model: 'embed-english-v3', texts: ['hello'] })
  })

  // =========================================================================
  // F9 — the `connect-src` allowlist is hardcoded and not configurable. It is
  // now extensible via config (defaulting to the safe set, fail-closed).
  // =========================================================================
  it('F9 — the connect-src allowlist is extensible via config (fail-closed default)', async () => {
    // default: a non-allowlisted host is rejected
    const defaultProvider = createRemoteEmbedProvider({ baseUrl: 'https://custom.example.com/v1', model: 'x', apiKey: 'sk-test' })
    await expect(defaultProvider.embed('hello')).rejects.toThrow('remote embed: baseUrl not in connect-src allowlist')
    // with a connectSrc extension, the same host is allowed
    const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3, 0.4] }] }) }))
    const extended = createRemoteEmbedProvider({ baseUrl: 'https://custom.example.com/v1', model: 'x', apiKey: 'sk-test', connectSrc: ['custom.example.com'] })
    const vec = await extended.embed('hello')
    expect(vec).toEqual([0.1, 0.2, 0.3, 0.4])
  })

  it('F9 — createEmbeddingProvider forwards the connectSrc extension from the config', async () => {
    const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [0.1, 0.2, 0.3, 0.4] }] }) }))
    const provider = createEmbeddingProvider({
      provider: 'openai',
      baseUrl: 'https://custom.example.com/v1',
      model: 'text-embedding-3-small',
      apiKey: 'sk-test',
      connectSrc: ['custom.example.com'],
    })
    const vec = await provider.embed('hello')
    expect(vec).toEqual([0.1, 0.2, 0.3, 0.4])
    expect(calls).toHaveLength(1)
  })
})

// =============================================================================
// W2 adversarial regression (RCA-3 post-W2 pass, 2026-09-05) — findings
// F-W2-1..F-W2-5 (spec §3a W2 subsection). One test per code finding; the
// spec-only findings (F-W2-3/F-W2-6) have no runtime test. Written RED first
// against the live src/, then fixed in src/main/embeddings.ts.
// =============================================================================
describe('W2 adversarial regression (F-W2-1..F-W2-5)', () => {
  /** Fetch a provider's W2 `embedBatch` member (a clear missing-member error
   *  instead of "undefined is not a function"). */
  function batchOf(provider: EmbeddingProvider): (texts: string[]) => Promise<number[][]> {
    const b = (provider as { embedBatch?: (texts: string[]) => Promise<number[][]> }).embedBatch
    if (typeof b !== 'function') throw new Error('W2 missing-member: embedBatch is not implemented on the provider')
    return b
  }

  // -------------------------------------------------------------------------
  // F-W2-1 (MEDIUM) — zero-length vectors passed F6/F7 (`[].every` is
  // vacuously true): a first zero-length vector latched provider
  // `dimension = 0` (every later vector then rejected — a provider BRICK),
  // and `createVectorIndex` stored an `[]` vector (later cosineSimilarity
  // calls throw `dimension mismatch` — an index POISON).
  // -------------------------------------------------------------------------

  it('F-W2-1 provider brick: a zero-length in-batch vector rejects "…malformed response" (never latches dimension 0; the provider recovers)', async () => {
    // ollama — the zero-length vector is FIRST (the dimension-0 latch repro)
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[], [0.1, 0.2, 0.3, 0.4]] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
    await expect(batchOf(provider)(['a', 'b'])).rejects.toThrow('ollama embed: malformed response')
    // the provider is NOT bricked: a subsequent valid batch auto-detects normally
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4]] }) }))
    const vectors = await batchOf(provider)(['c'])
    expect(vectors[0]).toEqual([0.1, 0.2, 0.3, 0.4])
    expect(provider.dimension).toBe(4)
    // remote mirror — a zero-length vector is malformed there too
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ data: [{ embedding: [] }] }) }))
    const remote = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
    await expect(batchOf(remote)(['a'])).rejects.toThrow('remote embed: malformed response')
  })

  it('F-W2-1 index poison: createVectorIndex rejects a zero-length batch vector ("createVectorIndex: malformed response (zero-length vector)") — no [] vector stored', async () => {
    const nodes = [makeNode('n1', { content: 'a' })]
    const poisonBatch = async () => [[]]
    await expect(createVectorIndex(nodes, async () => [1, 2, 3, 4], poisonBatch)).rejects.toThrow('createVectorIndex: malformed response (zero-length vector)')
  })

  it('F-W2-1 validate-then-commit: a malformed LATER vector leaves NO earlier dimension latch (a follow-up batch of a different dimension works)', async () => {
    // a valid 4-dim vector FIRST, a malformed vector LATER — the whole
    // response is validated BEFORE any dimension state is committed
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4], []] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
    await expect(batchOf(provider)(['a', 'b'])).rejects.toThrow('ollama embed: malformed response')
    // no earlier latch: a 3-dim batch auto-detects cleanly (the provider is
    // not stuck on the aborted response's dimension)
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.1, 0.1]] }) }))
    const vectors = await batchOf(provider)(['c'])
    expect(vectors[0]).toEqual([0.1, 0.1, 0.1])
    expect(provider.dimension).toBe(3)
  })

  // -------------------------------------------------------------------------
  // F-W2-2 (MEDIUM) — the batch build was monolithic (16,840 nodes → ONE
  // request; one bad batch re-embedded ALL texts per-item; N × timeoutMs >
  // 2^31-1 hit Node's setTimeout 1 ms clamp → a spurious instant timeout).
  // -------------------------------------------------------------------------

  it('F-W2-2 BATCH_CHUNK_SIZE = 64 is exported (texts per chunk; the last chunk may be short)', () => {
    expect(embeddingsNs.BATCH_CHUNK_SIZE).toBe(64)
  })

  it('F-W2-2 chunk count for a known node count: 130 nodes → 3 batch calls of 64/64/2 (union of texts in node order)', async () => {
    const nodes = Array.from({ length: 130 }, (_, i) => makeNode(`n${String(i).padStart(3, '0')}`, { content: `content-${i}` }))
    const batchCalls: string[][] = []
    const batchFn = async (texts: string[]) => {
      batchCalls.push(texts)
      return texts.map(() => [0.1, 0.2, 0.3, 0.4])
    }
    const index = await createVectorIndex(nodes, async () => [0, 0, 0, 0], batchFn)
    expect(batchCalls).toHaveLength(3)
    expect(batchCalls.map((c) => c.length)).toEqual([64, 64, 2])
    // the H39a invariant stays green under chunking: the union of the chunk
    // texts is exactly the non-empty contents in node order
    expect(batchCalls.flat()).toEqual(nodes.map((n) => n.content))
    expect(index.nodeIds).toHaveLength(130)
    expect(index.dimension).toBe(4)
  })

  it('F-W2-2 per-chunk fallback isolation: only the bad chunk\'s texts are re-embedded per-item (not ALL texts)', async () => {
    const nodes = Array.from({ length: 130 }, (_, i) => makeNode(`n${String(i).padStart(3, '0')}`, { content: `content-${i}` }))
    // chunk 2 = nodes 64..127 — reject ONLY the chunk containing content-100
    const batchFn = async (texts: string[]) => {
      if (texts.includes('content-100')) throw new Error('ollama embed: batch alignment mismatch (expected 64 vectors, got 63)')
      return texts.map(() => [0.1, 0.2, 0.3, 0.4])
    }
    const embedCalls: string[] = []
    const embedFn: EmbedTextFn = async (text) => {
      embedCalls.push(text)
      return [0.1, 0.2, 0.3, 0.4]
    }
    const index = await createVectorIndex(nodes, embedFn, batchFn)
    // exactly chunk 2's texts (64 of 130) were re-embedded per-item
    expect(embedCalls).toHaveLength(64)
    expect(embedCalls[0]).toBe('content-64')
    expect(embedCalls[63]).toBe('content-127')
    expect(embedCalls).not.toContain('content-0')
    expect(embedCalls).not.toContain('content-128')
    // the build still indexes every node (chunks 1/3 batched, chunk 2 fallback)
    expect(index.nodeIds).toHaveLength(130)
  })

  it('F-W2-2 budget clamp: a batch whose N×timeoutMs exceeds 2^31-1 still completes (no 1 ms-clamp spurious timeout)', async () => {
    // 4 texts × 1e9 ms = 4e9 > 2^31-1 → Node coerces a larger setTimeout
    // delay to 1 ms (a spurious instant timeout pre-clamp). The stub fetch
    // resolves after 30 ms — AFTER a 1 ms clamp would have fired.
    const calls = stubFetch(async () => {
      await new Promise((r) => setTimeout(r, 30))
      return { ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.2, 0.3, 0.4], [0.2, 0.2, 0.2, 0.2], [0.3, 0.3, 0.3, 0.3], [0.4, 0.4, 0.4, 0.4]] }) }
    })
    const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma', timeoutMs: 1000000000 })
    const vectors = await batchOf(provider)(['a', 'b', 'c', 'd'])
    expect(vectors).toHaveLength(4)
    expect(calls).toHaveLength(1)
  })

  // -------------------------------------------------------------------------
  // F-W2-4 (LOW) — `embedBatch` input validation (asymmetric with the
  // single-text `text must be a string` guard). Empty-string items remain
  // VALID (live-verified aligned — §5.2).
  // -------------------------------------------------------------------------

  it('F-W2-4 embedBatch input validation (both providers): null / "abc" / [42] reject the pinned message; [""] stays VALID', async () => {
    // ollama
    stubFetch((url, init) => {
      const body = parseBody(init)
      const n = Array.isArray(body.input) ? body.input.length : 1
      return { ok: true, status: 200, json: async () => ({ embeddings: Array.from({ length: n }, () => [0.1, 0.1, 0.1, 0.1]) }) }
    })
    const ollama = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
    await expect(batchOf(ollama)(null as unknown as string[])).rejects.toThrow('ollama embed: batch texts must be an array of strings')
    await expect(batchOf(ollama)('abc' as unknown as string[])).rejects.toThrow('ollama embed: batch texts must be an array of strings')
    await expect(batchOf(ollama)([42] as unknown as string[])).rejects.toThrow('ollama embed: batch texts must be an array of strings')
    // empty-string items remain VALID (positional alignment live-verified)
    expect(await batchOf(ollama)([''])).toHaveLength(1)
    // remote (OpenAI-shaped)
    stubFetch((url, init) => {
      const body = parseBody(init)
      const n = Array.isArray(body.input) ? body.input.length : 1
      return { ok: true, status: 200, json: async () => ({ data: Array.from({ length: n }, () => ({ embedding: [0.1, 0.1, 0.1, 0.1] })) }) }
    })
    const remote = createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })
    await expect(batchOf(remote)(null as unknown as string[])).rejects.toThrow('remote embed: batch texts must be an array of strings')
    await expect(batchOf(remote)('abc' as unknown as string[])).rejects.toThrow('remote embed: batch texts must be an array of strings')
    await expect(batchOf(remote)([42] as unknown as string[])).rejects.toThrow('remote embed: batch texts must be an array of strings')
    expect(await batchOf(remote)([''])).toHaveLength(1)
  })

  // -------------------------------------------------------------------------
  // F-W2-5 (LOW) — `timeoutMs` unvalidated on the direct-options path
  // (`{timeoutMs: -5}` → instant spurious timeouts). Validated at BOTH
  // provider constructions when present (undefined keeps the 5000 default;
  // env-parsed values are pre-validated by parsePositiveIntEnv — unchanged).
  // 1e12 is rejected too: a per-text delay beyond the setTimeout ceiling
  // (2^31-1 ms) cannot be a real delay (F-W2-2 clamps the BATCH budget).
  // -------------------------------------------------------------------------

  it('F-W2-5 timeoutMs validation at BOTH constructions: -5 / 0 / 0.5 / 1e12 throw the pinned constructor message', () => {
    for (const bad of [-5, 0, 0.5, 1e12]) {
      expect(() => createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma', timeoutMs: bad }))
        .toThrow('createOllamaEmbedProvider: timeoutMs must be a positive integer')
      expect(() => createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test', timeoutMs: bad }))
        .toThrow('createRemoteEmbedProvider: timeoutMs must be a positive integer')
    }
    // undefined keeps the provider constructible (the 5000 default — pinned below)
    expect(() => createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })).not.toThrow()
    expect(() => createRemoteEmbedProvider({ baseUrl: 'https://api.openai.com/v1', model: 'x', apiKey: 'sk-test' })).not.toThrow()
  })

  it('F-W2-5 timeoutMs undefined keeps the 5000 default ("timeout after 5000ms" — fake-timer pin, no real 5 s wait)', async () => {
    vi.useFakeTimers()
    try {
      vi.stubGlobal('fetch', vi.fn(() => new Promise(() => { /* never settles — a hung server */ })))
      const provider = createOllamaEmbedProvider({ baseUrl: 'http://127.0.0.1:11434', model: 'embeddinggemma' })
      const p = provider.embed('hello')
      const assertion = expect(p).rejects.toThrow('ollama embed: timeout after 5000ms')
      vi.advanceTimersByTime(5000)
      await assertion
    } finally {
      vi.useRealTimers()
    }
  })
})
