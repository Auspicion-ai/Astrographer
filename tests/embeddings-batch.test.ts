// tests/embeddings-batch.test.ts — Unit F **W2** (2026-09-05 amendment,
// review A5): the batch seam. Written RED from the SPEC ONLY:
// docs/specs/unit-f-embeddings.md §5.2 ("The batch seam"), §5.3
// ("Index-build wiring"), §5.8 happy states #37–#39, §5.9 fail-states #39–#41.
//
// STATE ENUMERATION (TestWriter — every W2 state + fail-state):
//   Happy:
//     H37a  ollama `embedBatch(['a','b','c'])` → ONE request, plural body
//           `{ model, input: [t1..tn] }`, NO auth header, positional mapping
//           `embeddings[i] → texts[i]`, each vector F6/F7-valid.
//     H37b  OpenAI-shaped remote `embedBatch` → plural body `{ model,
//           input: [t1..tn] }` (the plural form of the single-text request),
//           `Authorization: Bearer`, positional mapping `data[i].embedding`.
//     H37c  Cohere (`kind: 'cohere'`) `embedBatch` → body `{ model,
//           texts: [t1..tn] }`, `Authorization: Bearer`, positional mapping
//           `embeddings[i]`.
//     H38   sequential default: a provider exposing ONLY `embed` (the mock —
//           W2 requires NO mock change) is consumed via
//           `provider.embedBatch ?? per-item embed()` → N single calls,
//           order preserved, identical results to per-item embed().
//     H39a  `createVectorIndex(nodes, embedFn, embedBatchFn)` → the batch fn
//           receives the NON-EMPTY node contents (node order); nodeIds /
//           embeddings / dimension map positionally.
//     H39b  the batch build's index is identical to the sequential build's.
//   Fail:
//     F39a  ollama alignment mismatch — short AND long responses reject with
//           `ollama embed: batch alignment mismatch (expected <n> vectors,
//           got <m>)`; nothing is assigned positionally from a rejected batch.
//     F39b  remote alignment mismatch (OpenAI-shaped + Cohere variants) →
//           `remote embed: batch alignment mismatch (expected <n> vectors,
//           got <m>)`.
//     F39c  CALLER fallback: a rejected batch re-embeds exactly that batch's
//           texts via per-item `embed()`; the rejected batch's vectors never
//           land in the index.
//     F40a  ollama batch timeout = a PER-TEXT budget: N texts → N × timeoutMs
//           total; message `ollama embed: timeout after <N × timeoutMs>ms`;
//           the in-flight fetch IS aborted (the stub observes the abort
//           signal); the aborted fetch's rejection is swallowed (no
//           unhandled rejection).
//     F40b  remote batch timeout → `remote embed: timeout after <N ×
//           timeoutMs>ms` + real abort.
//     F40c  single-text `embed()` timeout message UNCHANGED
//           (`timeout after <timeoutMs>ms`) and the single-text fetch gains
//           the same AbortController abort.
//     F41a  in-batch F7 (a non-finite element) → `<prefix> malformed response`.
//     F41b  in-batch F6 (dimension mismatch, configured dimension) →
//           `<prefix> dimension mismatch (expected <n>, got <m>)`.
//     F41c  dimension auto-detect uses the FIRST in-batch vector; the
//           auto-detected dimension is consistent across batches.
//
// MOCK PATTERNS ONLY are mirrored from tests/embeddings.test.ts (stubFetch /
// parseBody / headerValue / makeNode / textEmbedding). NO live remote call —
// the remote provider is exercised through a stubbed `fetch`. The one
// LIVE-optional scenario is gated by `describe.skipIf(!isOllamaAvailable())`
// (the §5.6 probe helper — imported, not derived).
//
// RED GATE: this file is the TestWriter red set for W2. The W2 members
// (`embedBatch` on both concrete providers, the third `embedBatchFn?` param
// on `createVectorIndex`, the per-text timeout budget + AbortController) are
// expected to be MISSING → missing-member failures until the Implementer
// lands W2. src/main/embeddings.ts is NEVER read for contract derivation.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  createOllamaEmbedProvider,
  createRemoteEmbedProvider,
  createVectorIndex,
  isOllamaAvailable,
  type EmbeddingProvider,
  type EmbedTextFn,
  type VectorIndex,
} from '../src/main/embeddings.js'
import type { RagNode } from '../src/main/rag-store.js'

type BatchFn = (texts: string[]) => Promise<number[][]>

/** The W2 interface shape (§5.2: interface members 5 → 6). A cast keeps the
 *  suite compilable while `embedBatch` is still missing (RED). */
type BatchCapableProvider = EmbeddingProvider & { embedBatch?: BatchFn }

/** Fetch the `embedBatch` member, failing with a clear MISSING-MEMBER message
 *  instead of "undefined is not a function" when W2 is not implemented. */
function requireBatch(provider: EmbeddingProvider): BatchFn {
  const b = (provider as BatchCapableProvider).embedBatch
  if (typeof b !== 'function') {
    throw new Error(`W2 missing-member: embedBatch is not implemented on provider.kind=${provider.kind} (§5.2 batch seam: interface members 5 → 6)`)
  }
  return b
}

/** `createVectorIndex` with the W2 OPTIONAL third param. A cast keeps the
 *  suite compilable while the third param is still missing (RED). */
const createVectorIndexBatch = createVectorIndex as unknown as (
  nodes: RagNode[],
  embedFn: EmbedTextFn,
  embedBatchFn?: BatchFn,
) => Promise<VectorIndex>

const OLLAMA_BASE = 'http://127.0.0.1:11434'
const OPENAI_BASE = 'https://api.openai.com/v1'
const COHERE_BASE = 'https://api.cohere.com/v1'
const BATCH_TEXTS = ['alpha document', 'beta document', 'gamma document']

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
 *  algorithm shape — mirrored from tests/embeddings.test.ts). */
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

function headerValue(init: RequestInit, name: string): string | undefined {
  const h = init.headers as Record<string, string> | Headers | undefined
  if (!h) return undefined
  if (typeof (h as Headers).get === 'function') return (h as Headers).get(name) ?? undefined
  return (h as Record<string, string>)[name]
}

/** Stub the global `fetch` with a responder. Records the request URL/init/body
 *  (the repo's fetch-stub idiom — mirrored from tests/embeddings.test.ts). */
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

/** W2 abort-capturing hung-fetch stub: the fetch NEVER settles on its own;
 *  it rejects only when the provider aborts it — and records that the abort
 *  signal was observed (F40: the in-flight fetch is ACTUALLY ABORTED). */
function stubHungFetchCapturingAbort(): { aborted: () => boolean } {
  let abortObserved = false
  vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => {
    return new Promise((_resolve, reject) => {
      const signal = (init as { signal?: AbortSignal }).signal
      if (signal) {
        signal.addEventListener('abort', () => {
          abortObserved = true
          reject(new Error('The operation was aborted'))
        })
      }
      // no signal / no abort → the promise never settles (a hung server)
    })
  }))
  return { aborted: () => abortObserved }
}

/** Track `unhandledRejection` on the process (F40: the aborted fetch's
 *  rejection is SWALLOWED — no unhandled rejection). Returns a checker to
 *  call after a macrotask flush. */
function trackUnhandledRejections(): { clean: () => boolean; reasons: () => unknown[] } {
  const seen: unknown[] = []
  const handler = (reason: unknown) => { seen.push(reason) }
  process.on('unhandledRejection', handler)
  return {
    clean: () => {
      process.off('unhandledRejection', handler)
      return seen.length === 0
    },
    reasons: () => seen,
  }
}

const flush = (ms = 30) => new Promise((r) => setTimeout(r, ms))

afterEach(() => {
  vi.unstubAllGlobals()
})

// ===========================================================================
// §5.2 BATCH SEAM — THE OLLAMA CONCRETE PROVIDER (W2: BOTH providers
// implement `embedBatch` — interface members 5 → 6)
// ===========================================================================

describe('W2 §5.2 ollama embedBatch (batch seam, mocked fetch)', () => {
  it('H37a both concrete providers implement embedBatch (interface members 5 → 6)', () => {
    const ollama = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const remote = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'x', apiKey: 'sk-test' })
    expect(typeof (ollama as BatchCapableProvider).embedBatch).toBe('function')
    expect(typeof (remote as BatchCapableProvider).embedBatch).toBe('function')
  })

  it('H37a request shape: ONE POST {baseUrl}/api/embed with body {model, input:[t1..tn]}, NO auth header', async () => {
    const calls = stubFetch((url, init) => {
      const body = parseBody(init)
      return { ok: true, status: 200, json: async () => ({ embeddings: (body.input as string[]).map((t: string) => textEmbedding(t)) }) }
    })
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const vectors = await requireBatch(provider)(BATCH_TEXTS)
    expect(vectors).toHaveLength(3)
    // ONE request for the whole batch (not one per text)
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe('http://127.0.0.1:11434/api/embed')
    expect(calls[0].body).toEqual({ model: 'embeddinggemma', input: BATCH_TEXTS })
    // LOCAL-SECURITY-POSTURE: no credentials sent
    expect(headerValue(calls[0].init, 'Authorization')).toBeUndefined()
  })

  it('H37a positional mapping: response embeddings[i] is the vector for texts[i]; dimension auto-detected from the batch', async () => {
    const v0 = [0.1, 0.1, 0.1, 0.1]
    const v1 = [0.2, 0.2, 0.2, 0.2]
    const v2 = [0.3, 0.3, 0.3, 0.3]
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [v0, v1, v2] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const vectors = await requireBatch(provider)(BATCH_TEXTS)
    expect(vectors[0]).toEqual(v0)
    expect(vectors[1]).toEqual(v1)
    expect(vectors[2]).toEqual(v2)
    expect(provider.dimension).toBe(4)
  })
})

// ===========================================================================
// §5.2 BATCH SEAM — THE REMOTE/CLOUD PROVIDER (OpenAI-shaped + Cohere)
// ===========================================================================

describe('W2 §5.2 remote embedBatch (OpenAI-shaped + Cohere, mocked fetch)', () => {
  it('H37b OpenAI-shaped: plural body {model, input:[...]}, data[i].embedding positional, Authorization Bearer', async () => {
    const v0 = [0.1, 0.1, 0.1, 0.1]
    const v1 = [0.2, 0.2, 0.2, 0.2]
    const v2 = [0.3, 0.3, 0.3, 0.3]
    const calls = stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ embedding: v0 }, { embedding: v1 }, { embedding: v2 }] }),
    }))
    const provider = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'text-embedding-3-small', apiKey: 'sk-test' })
    const vectors = await requireBatch(provider)(BATCH_TEXTS)
    expect(vectors).toEqual([v0, v1, v2])
    expect(calls).toHaveLength(1)
    expect(calls[0].url).toBe(OPENAI_BASE)
    // the plural form of the single-text request { model, input: <text> }
    expect(calls[0].body.model).toBe('text-embedding-3-small')
    expect(calls[0].body.input).toEqual(BATCH_TEXTS)
    // REMOTE-SECURITY-POSTURE: the API key is sent as an Authorization bearer header
    expect(headerValue(calls[0].init, 'Authorization')).toBe('Bearer sk-test')
  })

  it('H37c Cohere: body {model, texts:[...]}, embeddings[i] positional, Authorization Bearer', async () => {
    const v0 = [0.1, 0.1, 0.1, 0.1]
    const v1 = [0.2, 0.2, 0.2, 0.2]
    // F9: connectSrc EXTENDS the default allowlist so the host itself is not the variable under test
    const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [v0, v1] }) }))
    const provider = createRemoteEmbedProvider({
      baseUrl: COHERE_BASE,
      model: 'embed-v4',
      apiKey: 'sk-test',
      kind: 'cohere',
      connectSrc: ['api.cohere.com'],
    })
    const vectors = await requireBatch(provider)(['alpha document', 'beta document'])
    expect(vectors).toEqual([v0, v1])
    expect(calls).toHaveLength(1)
    expect(calls[0].body.model).toBe('embed-v4')
    expect(calls[0].body.texts).toEqual(['alpha document', 'beta document'])
    expect(headerValue(calls[0].init, 'Authorization')).toBe('Bearer sk-test')
  })

  it('F39b remote alignment mismatch (OpenAI-shaped, SHORT response) rejects "remote embed: batch alignment mismatch (expected 3 vectors, got 2)"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ embedding: [0.1, 0.1, 0.1, 0.1] }, { embedding: [0.2, 0.2, 0.2, 0.2] }] }),
    }))
    const provider = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'x', apiKey: 'sk-test' })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('remote embed: batch alignment mismatch (expected 3 vectors, got 2)')
  })

  it('F39b remote alignment mismatch (Cohere, LONG response) rejects "remote embed: batch alignment mismatch (expected 2 vectors, got 3)"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({ embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, 0.2, 0.2, 0.2], [0.3, 0.3, 0.3, 0.3]] }),
    }))
    const provider = createRemoteEmbedProvider({
      baseUrl: COHERE_BASE,
      model: 'embed-v4',
      apiKey: 'sk-test',
      kind: 'cohere',
      connectSrc: ['api.cohere.com'],
    })
    await expect(requireBatch(provider)(['alpha document', 'beta document'])).rejects.toThrow('remote embed: batch alignment mismatch (expected 2 vectors, got 3)')
  })

  it('F41a remote in-batch F7 (a non-finite element) rejects "remote embed: malformed response"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: [0.1, 0.1, 0.1, 0.1] }, { embedding: [0.2, NaN, 0.2, 0.2] }, { embedding: [0.3, 0.3, 0.3, 0.3] }],
      }),
    }))
    const provider = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'x', apiKey: 'sk-test' })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('remote embed: malformed response')
  })

  it('F41b remote in-batch F6 (configured dimension) rejects "remote embed: dimension mismatch (expected 4, got 2)"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ embedding: [0.1, 0.1, 0.1, 0.1] }, { embedding: [0.2, 0.2] }],
      }),
    }))
    const provider = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'x', apiKey: 'sk-test', dimension: 4 })
    await expect(requireBatch(provider)(['alpha document', 'beta document'])).rejects.toThrow('remote embed: dimension mismatch (expected 4, got 2)')
  })

  it('F40b remote batch timeout budget: 2 texts × 20ms → "remote embed: timeout after 40ms" AND the fetch IS aborted, no unhandled rejection', async () => {
    const { aborted } = stubHungFetchCapturingAbort()
    const tracker = trackUnhandledRejections()
    const provider = createRemoteEmbedProvider({ baseUrl: OPENAI_BASE, model: 'x', apiKey: 'sk-test', timeoutMs: 20 })
    await expect(requireBatch(provider)(['alpha document', 'beta document'])).rejects.toThrow('remote embed: timeout after 40ms')
    // the in-flight fetch is ACTUALLY ABORTED via AbortController
    expect(aborted()).toBe(true)
    // the aborted fetch's rejection is swallowed — no unhandled rejection
    await flush()
    expect(tracker.clean()).toBe(true)
  })
})

// ===========================================================================
// §5.9 #39/#41 — THE OLLAMA ALIGNMENT + VALIDATION FAIL-STATES
// ===========================================================================

describe('W2 §5.2/§5.9 ollama embedBatch alignment + per-vector validation', () => {
  it('F39a alignment mismatch (SHORT response) rejects "ollama embed: batch alignment mismatch (expected 3 vectors, got 2)"', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, 0.2, 0.2, 0.2]] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('ollama embed: batch alignment mismatch (expected 3 vectors, got 2)')
  })

  it('F39a alignment mismatch (LONG response) rejects "ollama embed: batch alignment mismatch (expected 3 vectors, got 4)"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({
        embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, 0.2, 0.2, 0.2], [0.3, 0.3, 0.3, 0.3], [0.4, 0.4, 0.4, 0.4]],
      }),
    }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('ollama embed: batch alignment mismatch (expected 3 vectors, got 4)')
  })

  it('F39a the ollama LIVE-VERIFIED case holds: a batch containing the empty string stays aligned (3 in → 3 out)', async () => {
    const calls = stubFetch((url, init) => {
      const body = parseBody(init)
      return { ok: true, status: 200, json: async () => ({ embeddings: (body.input as string[]).map(() => [0.1, 0.1, 0.1, 0.1]) }) }
    })
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const vectors = await requireBatch(provider)(['alpha document', '', 'gamma document'])
    expect(vectors).toHaveLength(3)
    expect(calls[0].body.input).toEqual(['alpha document', '', 'gamma document'])
  })

  it('F41a in-batch F7 (a non-finite element) rejects "ollama embed: malformed response"', async () => {
    stubFetch(() => ({
      ok: true,
      status: 200,
      json: async () => ({ embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, Infinity, 0.2, 0.2], [0.3, 0.3, 0.3, 0.3]] }),
    }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('ollama embed: malformed response')
  })

  it('F41b in-batch F6 (configured dimension) rejects "ollama embed: dimension mismatch (expected 4, got 2)"', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, 0.2]] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma', dimension: 4 })
    await expect(requireBatch(provider)(['alpha document', 'beta document'])).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 2)')
  })

  it('F41c dimension auto-detect uses the FIRST in-batch vector (a later in-batch vector of a different length rejects)', async () => {
    stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[0.1, 0.1, 0.1, 0.1], [0.2, 0.2, 0.2]] }) }))
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    await expect(requireBatch(provider)(['alpha document', 'beta document'])).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 3)')
  })

  it('F41c cross-batch consistency: batch 1 auto-detects the dimension; a later batch vector of a different length rejects "(expected 4, got 3)"', async () => {
    const calls = stubFetch((url, init) => {
      const body = parseBody(init)
      const dim = (body.input as string[])[0] === 'alpha document' ? 4 : 3
      return { ok: true, status: 200, json: async () => ({ embeddings: (body.input as string[]).map(() => new Array(dim).fill(0.1)) }) }
    })
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const first = await requireBatch(provider)(['alpha document', 'beta document'])
    expect(first).toHaveLength(2)
    expect(first[0]).toHaveLength(4)
    expect(provider.dimension).toBe(4)
    // a SECOND batch returning 3-dim vectors → validated against the auto-detected 4
    await expect(requireBatch(provider)(['gamma document'])).rejects.toThrow('ollama embed: dimension mismatch (expected 4, got 3)')
    expect(calls).toHaveLength(2)
  })

  it('F40a batch timeout budget: 3 texts × 20ms → "ollama embed: timeout after 60ms" AND the fetch IS aborted, no unhandled rejection', async () => {
    const { aborted } = stubHungFetchCapturingAbort()
    const tracker = trackUnhandledRejections()
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma', timeoutMs: 20 })
    await expect(requireBatch(provider)(BATCH_TEXTS)).rejects.toThrow('ollama embed: timeout after 60ms')
    // the in-flight fetch is ACTUALLY ABORTED via AbortController (W2 replaces
    // the Promise.race abandonment — the stub observed the abort signal)
    expect(aborted()).toBe(true)
    // the aborted fetch's rejection is swallowed — no unhandled rejection
    await flush()
    expect(tracker.clean()).toBe(true)
  })

  it('F40c single-text embed timeout message UNCHANGED ("timeout after <timeoutMs>ms") and the single-text fetch gains the same abort', async () => {
    const { aborted } = stubHungFetchCapturingAbort()
    const tracker = trackUnhandledRejections()
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma', timeoutMs: 20 })
    await expect(provider.embed('hello')).rejects.toThrow('ollama embed: timeout after 20ms')
    expect(aborted()).toBe(true)
    await flush()
    expect(tracker.clean()).toBe(true)
  })
})

// ===========================================================================
// §5.2 SEQUENTIAL DEFAULT + §5.3 INDEX-BUILD WIRING (createVectorIndex gains
// the OPTIONAL THIRD param; the two-arg form is unchanged)
// ===========================================================================

describe('W2 §5.2 sequential default + §5.3 createVectorIndex(nodes, embedFn, embedBatchFn?)', () => {
  it('H38 a provider exposing ONLY embed (the mock — unchanged by W2) has no embedBatch member and is consumed via the sequential default', async () => {
    const calls: string[] = []
    const embedFn: EmbedTextFn = async (text) => {
      calls.push(text)
      return textEmbedding(text)
    }
    const mockProvider = {
      kind: 'mock',
      model: 'mock',
      baseUrl: '',
      dimension: 4,
      embed: embedFn,
      // NO embedBatch member — W2 requires NO mock change
    } satisfies EmbeddingProvider
    expect((mockProvider as BatchCapableProvider).embedBatch).toBeUndefined()

    const nodes = [makeNode('n1'), makeNode('n2'), makeNode('n3')]
    // the two-arg form IS the sequential per-item default (`embedBatchFn` omitted)
    const index = await createVectorIndex(nodes, mockProvider.embed)
    // N single calls, node order preserved
    expect(calls).toEqual(['content-n1', 'content-n2', 'content-n3'])
    expect(index.nodeIds).toEqual(['n1', 'n2', 'n3'])
    expect(index.embeddings.get('n2')).toEqual(textEmbedding('content-n2'))
    expect(index.dimension).toBe(4)
  })

  it('H39a the batch fn receives the NON-EMPTY node contents in node order; nodeIds/embeddings/dimension map positionally', async () => {
    const batchCalls: string[][] = []
    const batchFn: BatchFn = async (texts) => {
      batchCalls.push(texts)
      return texts.map((t) => textEmbedding(t))
    }
    const nodes = [
      makeNode('n1', { content: 'alpha content' }),
      makeNode('n2', { content: '   ' }), // empty/whitespace → NEVER sent to the batch fn (UNIT-F-SKIP-EMPTY guard)
      makeNode('n3', { content: 'gamma content' }),
    ]
    const index = await createVectorIndexBatch(nodes, (t) => textEmbedding(t), batchFn)
    // the batch fn received exactly the non-empty contents, in node order
    expect(batchCalls.length).toBeGreaterThanOrEqual(1)
    expect(batchCalls.flat()).toEqual(['alpha content', 'gamma content'])
    // positional node/id mapping is preserved
    expect(index.nodeIds).toEqual(['n1', 'n3'])
    expect(index.embeddings.get('n1')).toEqual(textEmbedding('alpha content'))
    expect(index.embeddings.get('n3')).toEqual(textEmbedding('gamma content'))
    expect(index.embeddings.has('n2')).toBe(false)
    expect(index.dimension).toBe(4)
  })

  it('H39b the batch build\'s index is identical to the sequential build\'s', async () => {
    const nodes = [makeNode('n1', { content: 'alpha content' }), makeNode('n2', { content: 'beta content' }), makeNode('n3', { content: 'gamma content' })]
    const batchCalls: string[][] = []
    const consultedBatchFn: BatchFn = async (texts) => {
      batchCalls.push(texts)
      return batchFn(texts)
    }
    const batchIndex = await createVectorIndexBatch(nodes, (t) => textEmbedding(t), consultedBatchFn)
    // the batch path was actually USED (the seam is wired — not silently ignored)
    expect(batchCalls.length).toBeGreaterThanOrEqual(1)
    const sequentialIndex = await createVectorIndex(nodes, (t) => textEmbedding(t))
    expect(batchIndex.nodeIds).toEqual(sequentialIndex.nodeIds)
    expect(batchIndex.dimension).toBe(sequentialIndex.dimension)
    expect([...batchIndex.embeddings.entries()]).toEqual([...sequentialIndex.embeddings.entries()])
  })

  it('F39c caller fallback: a REJECTED batch re-embeds exactly that batch\'s texts via per-item embed(); NO positional assignment from the rejected batch', async () => {
    const POISON = [9.9, 9.9, 9.9, 9.9] // the rejected batch's vectors must never land in the index
    const batchFn: BatchFn = async () => Promise.reject(new Error('ollama embed: batch alignment mismatch (expected 3 vectors, got 2)'))
    const embedCalls: string[] = []
    const embedFn: EmbedTextFn = async (text) => {
      embedCalls.push(text)
      return textEmbedding(text)
    }
    const nodes = [makeNode('n1', { content: 'alpha content' }), makeNode('n2', { content: 'beta content' }), makeNode('n3', { content: 'gamma content' })]
    const batchCalls: string[][] = []
    const consultedBatchFn: BatchFn = async (texts) => {
      batchCalls.push(texts)
      return batchFn(texts)
    }
    // the build RESOLVES via the per-item fallback (a rejected batch never fails the build)
    const index = await createVectorIndexBatch(nodes, embedFn, consultedBatchFn)
    // the batch path was actually ATTEMPTED (the seam is wired — not silently ignored)
    expect(batchCalls.length).toBeGreaterThanOrEqual(1)
    // exactly that batch's texts were re-embedded per-item
    expect(embedCalls).toEqual(['alpha content', 'beta content', 'gamma content'])
    // the per-item vectors landed — no positional assignment from the rejected batch
    expect(index.nodeIds).toEqual(['n1', 'n2', 'n3'])
    expect(index.embeddings.get('n1')).toEqual(textEmbedding('alpha content'))
    expect(index.embeddings.get('n2')).toEqual(textEmbedding('beta content'))
    expect(index.embeddings.get('n3')).toEqual(textEmbedding('gamma content'))
    for (const v of index.embeddings.values()) expect(v).not.toEqual(POISON)
  })

  it('§5.3 the TWO-ARG form is unchanged by W2: N single embed calls, node order/id mapping preserved', async () => {
    const embedCalls: string[] = []
    const embedFn: EmbedTextFn = async (text) => {
      embedCalls.push(text)
      return textEmbedding(text)
    }
    const nodes = [makeNode('n1'), makeNode('n2')]
    const index = await createVectorIndex(nodes, embedFn)
    expect(embedCalls).toEqual(['content-n1', 'content-n2'])
    expect(index.nodeIds).toEqual(['n1', 'n2'])
    expect(index.embeddings.get('n1')).toEqual(textEmbedding('content-n1'))
    expect(index.embeddings.get('n2')).toEqual(textEmbedding('content-n2'))
    expect(index.dimension).toBe(4)
  })
})

// ===========================================================================
// LIVE-OPTIONAL (the §5.6 probe gates it — SKIPPED, not failed, when ollama
// is down). Pins the real 3-text batch against the real server.
// ===========================================================================

describe.skipIf(!isOllamaAvailable(OLLAMA_BASE))('W2 LIVE — real ollama 3-text batch (gated by isOllamaAvailable)', () => {
  it('H37 live: embedBatch of 3 texts returns 3 ordered vectors of the model dimension; a repeated text aligns positionally', async () => {
    const provider = createOllamaEmbedProvider({ baseUrl: OLLAMA_BASE, model: 'embeddinggemma' })
    const vectors = await requireBatch(provider)(['alpha document', 'beta document', 'alpha document'])
    expect(vectors).toHaveLength(3)
    const dim = provider.dimension
    expect(dim).toBeGreaterThan(0)
    for (const v of vectors) {
      expect(v).toHaveLength(dim)
      for (const x of v) expect(Number.isFinite(x)).toBe(true)
    }
    // positional alignment: the SAME text at index 0 and 2 → the SAME vector
    expect(vectors[0]).toEqual(vectors[2])
  })
})