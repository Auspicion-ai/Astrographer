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
  type EmbeddingProviderConfig,
  type EmbedTextFn,
} from '../src/main/embeddings.js'
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
