// tests/unit-gn-engine-integration.test.ts — Unit GN: Gnosis engine integration —
// the `createEngineRagStore` proxy (retrieval trio + health wire client) over the
// F2 wire contract.
// (docs/specs/unit-gn-engine-integration.md §5.8 happy-path states + §5.9
// fail-states + §5.2 golden-vector conformance + §5.7 PBT register; the frozen
// wire shapes + golden vectors V-1..V-6/V-8 + §11 HTTP-status map + §7
// decode-then-validate in ../Gnosis/docs/specs/engine-wire-contract.md).
//
// The RED set for the NEW module `src/main/engine-rag-store.ts`:
//   - the factory `createEngineRagStore(opts)` + the proxy surface
//     (ragQuery / ragStream / getEngineStatus / health / waitForReady)
//   - the decode functions: decodeEnvelope, decodeRagResult, decodeChunk,
//     decodeError, decodeHealthReport, parseSseFrame, decodeSseChunk,
//     wireCodeToError
//   - the constants ENGINE_HTTP_STATUS (21 rows) + ENGINE_ENDPOINTS (3 paths)
//   - the typed error model: EngineWireError / EngineUnavailable / EngineError /
//     TraceUnavailable / ConflictError
//   - the §5.7 PBT register (8 rows: P-IM×4, P-SM×2, P-TP×2)
//
// Convention: follows the sibling `tests/unit-f2-result-qualification.test.ts`
// (vitest node environment, `.js` import suffix for the main-process ESM
// module). `RagQueryFilters` is imported from `src/main/retrieval.ts` (Unit X
// §5.2) — it is NOT a new type of this unit.
//
// RED: `src/main/engine-rag-store.ts` does NOT exist yet, so the static import
// fails to resolve — the ENTIRE test set is the red set for the not-yet-
// implemented module (the file fails to load).
import { describe, it, expect } from 'vitest'
import {
  createEngineRagStore,
  decodeEnvelope,
  decodeRagResult,
  decodeChunk,
  decodeError,
  decodeHealthReport,
  parseSseFrame,
  decodeSseChunk,
  wireCodeToError,
  ENGINE_HTTP_STATUS,
  ENGINE_ENDPOINTS,
  EngineWireError,
  EngineUnavailable,
  EngineError,
  TraceUnavailable,
  ConflictError,
  type EngineRagStore,
  type EngineRagStoreOptions,
  type EngineRagQueryOptions,
  type Envelope,
  type RagChunk,
  type HealthReport,
  type SseClient,
  type EngineRagResult,
  type EngineRagResultItem,
  type EngineRagTrace,
  type EngineFlatTrace,
  type EngineVectorTrace,
  type EngineGraphTrace,
  type EngineGraphTraceEntry,
  type EngineHybridTrace,
  type EngineErrorCode,
} from '../src/main/engine-rag-store.js'
import type { RagQueryFilters } from '../src/main/retrieval.js'

// ---------------------------------------------------------------------------
// Golden-vector constants (wire contract §12 — the byte-exact decode targets).
// ---------------------------------------------------------------------------

const V1_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"done"}}'

const V2_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"error","code":"conflict","message":"optimistic-concurrency conflict: stale base revision"}}'

const V3_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"error","code":"validation_error","message":"empty query"}}'

const V4_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"code":"wiki_not_found","message":"wiki not found"}}'

// V-5 — the minimal flat RagResult body (exact serde bytes).
const V5_ENVELOPE =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"query":"q","results":[{"document_id":"d1","node_id":"n1","score":0.9,"snippet":"s","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[["d1","n1"]],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}},"blocked_by":null}}'

// The V-5 payload body (parsed).
const V5_BODY = {
  query: 'q',
  results: [
    {
      document_id: 'd1',
      node_id: 'n1',
      score: 0.9,
      snippet: 's',
      source: 'Local',
      parent: null,
      stale: null,
    },
  ],
  engine: 'gnosis',
  citations: [['d1', 'n1']],
  trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
  blocked_by: null,
}

// The V-5 body mapped to the proxy-specific EngineRagResult (§5.2).
const V5_MAPPED: EngineRagResult = {
  query: 'q',
  results: [
    { documentId: 'd1', nodeId: 'n1', score: 0.9, snippet: 's', source: 'local' },
  ],
  engine: 'gnosis',
  citations: [{ documentId: 'd1', nodeId: 'n1' }],
  trace: { mode: 'flat', engine: 'gnosis', topK: 10, source: 'local' },
}

// V-6 — the three SSE event frames.
const V6_DONE_FRAME = 'event: done\ndata: {"type":"done"}\n\n'
const V6_ERROR_FRAME =
  'event: error\ndata: {"type":"error","code":"validation_error","message":"empty query"}\n\n'
const V6_RESULT_FRAME =
  'event: result\ndata: {"type":"result","result":{"query":"q","results":[{"document_id":"d1","node_id":"n1","score":0.9,"snippet":"s","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[["d1","n1"]],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}},"blocked_by":null}}\n\n'

// V-8 — the two health reports.
const V8_READY_REPORT =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","state":"Ready","version":"…","subsystems":{"store":true,"graph":true,"lexical":true,"vector":true,"embedding":true,"reranker":true},"lastError":null}'
const V8_DEGRADED_REPORT =
  '{"schemaVersion":1,"idFormat":"opaque-string-v1","state":"Degraded","version":"…","subsystems":{"store":true,"graph":true,"lexical":true,"vector":true,"embedding":false,"reranker":true},"lastError":"a non-core subsystem (embedding/reranker) is unavailable"}'

const READY_REPORT: HealthReport = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: '…',
  subsystems: {
    store: true,
    graph: true,
    lexical: true,
    vector: true,
    embedding: true,
    reranker: true,
  },
  lastError: null,
}

// A VALID Degraded report — spec §5.2 pins `lastError` to `Some` exactly when
// the engine is `Degraded` (a faithful projection; the shell must not invent
// one). The gate tests feed this to the gate so the faithfulness check in
// decodeHealthReport accepts it (→ EngineUnavailable, not EngineError).
const DEGRADED_REPORT: HealthReport = {
  ...READY_REPORT,
  state: 'Degraded',
  subsystems: { ...READY_REPORT.subsystems, embedding: false },
  lastError: 'a non-core subsystem (embedding/reranker) is unavailable',
}

// ---------------------------------------------------------------------------
// The §11 HTTP-status map (all 21 rows — the conformance target).
// ---------------------------------------------------------------------------

const ALL_21_CODES: EngineErrorCode[] = [
  'not_found',
  'wiki_not_found',
  'validation_error',
  'conflict',
  'doc_in_use',
  'invalid_state',
  'unresolved_reference',
  'engine_unavailable',
  'engine_error',
  'trace_unavailable',
  'hop_limit_exceeded',
  'cycle_detected',
  'embedding_unavailable',
  'vector_index_unavailable',
  'lexical_index_unavailable',
  'reranker_unavailable',
  'compression_failed',
  'hyde_generation_failed',
  'multi_query_expansion_failed',
  'community_not_found',
  'sub_task_dag_failed',
]

const EXPECTED_STATUS: Record<EngineErrorCode, number> = {
  not_found: 404,
  wiki_not_found: 404,
  validation_error: 400,
  conflict: 409,
  doc_in_use: 409,
  invalid_state: 409,
  unresolved_reference: 422,
  engine_unavailable: 503,
  engine_error: 502,
  trace_unavailable: 502,
  hop_limit_exceeded: 422,
  cycle_detected: 409,
  embedding_unavailable: 503,
  vector_index_unavailable: 503,
  lexical_index_unavailable: 503,
  reranker_unavailable: 503,
  compression_failed: 500,
  hyde_generation_failed: 500,
  multi_query_expansion_failed: 500,
  community_not_found: 404,
  sub_task_dag_failed: 500,
}

// ---------------------------------------------------------------------------
// Test helpers — fake fetch + fake SSE client.
// ---------------------------------------------------------------------------

type FetchHandler = (
  method: string,
  url: string,
  init?: RequestInit,
) => Response | Promise<Response>

function fakeFetch(handler: FetchHandler): typeof fetch {
  return (async (input: any, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as Request).url
    const method = (init?.method || 'GET').toUpperCase()
    return handler(method, url, init)
  }) as typeof fetch
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function refusedError(): Error {
  const e: any = new Error('connect ECONNREFUSED 127.0.0.1:8080')
  e.code = 'ECONNREFUSED'
  return e
}

function notSpawnedError(): Error {
  const e: any = new Error('getaddrinfo ENOTFOUND 127.0.0.1:8080')
  e.code = 'ENOTFOUND'
  return e
}

interface SseCall {
  url: string
  handlers: {
    onEvent: (event: string, data: string) => void
    onError: (err: unknown) => void
    onClose: () => void
  }
}

function makeFakeSse() {
  const calls: SseCall[] = []
  let closed = false
  const client: SseClient = {
    subscribe(url, handlers) {
      calls.push({ url, handlers })
      return {
        close() {
          closed = true
        },
      }
    },
  }
  return { client, calls, isClosed: () => closed }
}

// A fake fetch that serves a READY gate then a single /rag/query response.
function readyGateThenQuery(queryResponse: Response): typeof fetch {
  return fakeFetch((method, url) => {
    if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
      return jsonResponse(READY_REPORT)
    }
    if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) {
      return queryResponse
    }
    throw new Error(`unexpected ${method} ${url}`)
  })
}

// ---------------------------------------------------------------------------
// §5.8 happy-path states (1–15) + §5.9 fail-states (1–25).
// ---------------------------------------------------------------------------

describe('createEngineRagStore — factory + proxy surface', () => {
  it('§5.8-1 factory happy: returns a proxy; no network I/O at construction', () => {
    let fetchCalled = false
    const fetchImpl = (async () => {
      fetchCalled = true
      throw new Error('should not be called')
    }) as typeof fetch
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fetchImpl,
    })
    expect(store).toBeTruthy()
    expect(typeof store.ragQuery).toBe('function')
    expect(typeof store.ragStream).toBe('function')
    expect(typeof store.getEngineStatus).toBe('function')
    expect(typeof store.health).toBe('function')
    expect(typeof store.waitForReady).toBe('function')
    expect(fetchCalled).toBe(false)
  })

  it('§5.8-14 loopback enforcement: 127.0.0.1 and localhost-resolving-to-loopback OK; non-loopback throws', () => {
    expect(() =>
      createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080' }),
    ).not.toThrow()
    expect(() =>
      createEngineRagStore({ baseUrl: 'http://[::1]:8080' }),
    ).not.toThrow()
    expect(() =>
      createEngineRagStore({ baseUrl: 'http://localhost:8080' }),
    ).not.toThrow()
  })

  it('§5.9-1 fail: null/undefined opts throws', () => {
    expect(() => createEngineRagStore(null as any)).toThrow(
      'engine rag store: opts required',
    )
    expect(() => createEngineRagStore(undefined as any)).toThrow(
      'engine rag store: opts required',
    )
  })

  it('§5.9-2 fail: missing/empty baseUrl throws', () => {
    expect(() => createEngineRagStore({} as any)).toThrow(
      'engine rag store: baseUrl required',
    )
    expect(() => createEngineRagStore({ baseUrl: '' } as any)).toThrow(
      'engine rag store: baseUrl required',
    )
  })

  it('§5.9-3 fail: non-loopback baseUrl throws', () => {
    expect(() =>
      createEngineRagStore({ baseUrl: 'http://192.168.1.10:8080' }),
    ).toThrow('engine rag store: baseUrl must be loopback')
    expect(() =>
      createEngineRagStore({ baseUrl: 'http://example.com:8080' }),
    ).toThrow('engine rag store: baseUrl must be loopback')
  })

  it('§5.10 census: ENGINE_ENDPOINTS pins the 3 paths', () => {
    expect(ENGINE_ENDPOINTS).toEqual({
      ragQuery: '/rag/query',
      ragStream: '/rag/stream',
      engineStatus: '/engine/status',
    })
  })
})

describe('ragQuery — happy paths', () => {
  it('§5.8-2 happy: POST /rag/query returns a V-5 envelope → mapped EngineRagResult', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(jsonResponse(JSON.parse(V5_ENVELOPE))),
    })
    const result = await store.ragQuery('q')
    expect(result).toEqual(V5_MAPPED)
    expect(result.engine).toBe('gnosis')
  })

  it('§5.8-3 happy: a wire error chunk (conflict) → rejects with ConflictError (409)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: {
            type: 'error',
            code: 'conflict',
            message: 'optimistic-concurrency conflict: stale base revision',
          },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(ConflictError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'conflict',
      httpStatus: 409,
    })
  })

  it('§5.8-8 decode-then-validate happy: well-formed body with trace + gnosis engine + blocked_by paired with Graph trace', async () => {
    const body = {
      query: 'q',
      results: [],
      engine: 'gnosis',
      citations: [],
      trace: {
        Graph: [
          {
            from: { document_id: 'd1', node_id: 'n1' },
            to: { document_id: 'd2', node_id: 'n2' },
            edge: 'link',
            state: 'BROKEN',
          },
        ],
      },
      blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }],
    }
    const decoded = decodeRagResult(body)
    expect(decoded.trace).toEqual({
      mode: 'graph',
      entries: [
        {
          from: { documentId: 'd1', nodeId: 'n1' },
          to: { documentId: 'd2', nodeId: 'n2' },
          edge: 'link',
          state: 'BROKEN',
        },
      ],
    })
    expect(decoded.blockedBy).toEqual([
      { documentId: 'd1', nodeId: 'n1', state: 'BROKEN' },
    ])
  })

  it('§5.8-9 vector/hybrid trace decode happy: preserves the full wire trace', () => {
    const vectorBody = {
      query: 'q',
      results: [],
      engine: 'gnosis',
      citations: [],
      trace: { Vector: { mode: 'Vector', engine: 'gnosis', top_k: 10, source: 'Local' } },
      blocked_by: null,
    }
    const vector = decodeRagResult(vectorBody)
    expect(vector.trace).toEqual({
      mode: 'vector',
      engine: 'gnosis',
      topK: 10,
      source: 'local',
    })

    const hybridBody = {
      query: 'q',
      results: [],
      engine: 'gnosis',
      citations: [],
      trace: {
        Hybrid: {
          mode: 'Hybrid',
          engine: 'gnosis',
          legs: ['graph', 'vector', 'lexical'],
          top_k: 10,
          source: 'Local',
        },
      },
      blocked_by: null,
    }
    const hybrid = decodeRagResult(hybridBody)
    expect(hybrid.trace).toEqual({
      mode: 'hybrid',
      engine: 'gnosis',
      legs: ['graph', 'vector', 'lexical'],
      topK: 10,
      source: 'local',
    })
  })
})

describe('ragQuery — fail-states', () => {
  it('§5.9-4 fail: malformed envelope (missing schemaVersion/idFormat/payload) → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(jsonResponse({ payload: {} })),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-5 fail: result body missing trace → TraceUnavailable (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: { query: 'q', results: [], engine: 'gnosis', citations: [] },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(TraceUnavailable)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'trace_unavailable',
      httpStatus: 502,
    })
  })

  it('§5.9-6 fail: structurally malformed result body WITH a trace key → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: { query: 123, results: [], engine: 'gnosis', trace: { Flat: {} } },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-7 fail: non-"gnosis" engine → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: {
            query: 'q',
            results: [],
            engine: 'local',
            citations: [],
            trace: { Flat: { mode: 'Flat', engine: 'local', top_k: 10, source: 'Local' } },
            blocked_by: null,
          },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-8 fail: blocked_by present but non-Graph trace → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: {
            query: 'q',
            results: [],
            engine: 'gnosis',
            citations: [],
            trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
            blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }],
          },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-9 fail: unknown schemaVersion (99) → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 99,
          idFormat: 'opaque-string-v1',
          payload: { type: 'done' },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-10 fail: unknown idFormat ("uuid-v4") → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'uuid-v4',
          payload: { type: 'done' },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-11 fail: wire error chunk for a known code → matching typed error; engine_unavailable → cause unavailable-state', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: { type: 'error', code: 'engine_unavailable', message: 'engine down' },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'unavailable-state',
    })
  })

  it('§5.9-12 fail: wire error chunk for an UNKNOWN code → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenQuery(
        jsonResponse({
          schemaVersion: 1,
          idFormat: 'opaque-string-v1',
          payload: { type: 'error', code: 'some_foreign_code', message: 'x' },
        }),
      ),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineError)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-13 fail: connection-refused → EngineUnavailable (503, cause connection-refused)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'connection-refused',
    })
  })

  it('§5.9-14 fail: engine-not-spawned → EngineUnavailable (503, cause engine-not-spawned)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw notSpawnedError()
      }),
    })
    await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(store.ragQuery('q')).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'engine-not-spawned',
    })
  })

  it('§5.9-15 fail: observed state not Ready → EngineUnavailable (not-ready / unavailable-state)', async () => {
    for (const [state, cause, lastError] of [
      ['Starting', 'not-ready', null],
      // A VALID Degraded report (spec §5.2: lastError is Some exactly when
      // Degraded) — the gate must see Degraded → EngineUnavailable, not
      // EngineError from the faithfulness check.
      ['Degraded', 'not-ready', 'a non-core subsystem (embedding/reranker) is unavailable'],
      ['Unavailable', 'unavailable-state', null],
    ] as const) {
      const store = createEngineRagStore({
        baseUrl: 'http://127.0.0.1:8080',
        fetch: fakeFetch((method, url) => {
          if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
            return jsonResponse({ ...READY_REPORT, state, lastError })
          }
          throw new Error(`unexpected ${method} ${url}`)
        }),
      })
      await expect(store.ragQuery('q')).rejects.toBeInstanceOf(EngineUnavailable)
      await expect(store.ragQuery('q')).rejects.toMatchObject({
        code: 'engine_unavailable',
        httpStatus: 503,
        cause,
      })
    }
  })
})

describe('ragStream — happy paths', () => {
  it('§5.8-4 happy: result-then-done → yields [{result},{done}] in order', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const chunks: RagChunk[] = []
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = (async () => {
      for (;;) {
        const { value, done } = await it.next()
        if (done) break
        chunks.push(value)
      }
    })()
    expect(calls.length).toBe(1)
    expect(calls[0].url).toContain('/rag/stream')
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: V5_BODY }))
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    await pump
    expect(chunks).toEqual([
      { type: 'result', result: V5_MAPPED },
      { type: 'done' },
    ])
  })

  it('§5.8-5 happy: error-then-done → yields [{error},{done}]', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const chunks: RagChunk[] = []
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = (async () => {
      for (;;) {
        const { value, done } = await it.next()
        if (done) break
        chunks.push(value)
      }
    })()
    calls[0].handlers.onEvent(
      'error',
      '{"type":"error","code":"validation_error","message":"empty query"}',
    )
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    await pump
    expect(chunks).toEqual([
      { type: 'error', code: 'validation_error', message: 'empty query' },
      { type: 'done' },
    ])
  })

  it('§5.8-11 happy: single-shot honesty — exactly one result then done, then closes', async () => {
    const { client, calls, isClosed } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const chunks: RagChunk[] = []
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = (async () => {
      for (;;) {
        const { value, done } = await it.next()
        if (done) break
        chunks.push(value)
      }
    })()
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: V5_BODY }))
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    await pump
    expect(chunks).toEqual([
      { type: 'result', result: V5_MAPPED },
      { type: 'done' },
    ])
    expect(isClosed()).toBe(true)
  })

  it('§5.8-12 happy: mid-stream cancel — consumer breaks; SSE closes cleanly; no error', async () => {
    const { client, calls, isClosed } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const first = it.next()
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: V5_BODY }))
    await first
    // Consumer cancels before done.
    await it.return!()
    expect(isClosed()).toBe(true)
  })

  it('§5.5 filters serialization: filters object → single URL-encoded-JSON query param', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const filters: RagQueryFilters = { nodeKind: 'fact', state: 'BROKEN' }
    const it = store.ragStream('q', { filters })[Symbol.asyncIterator]()
    const pump = (async () => {
      for (;;) {
        const { done } = await it.next()
        if (done) break
      }
    })()
    expect(calls.length).toBe(1)
    expect(calls[0].url).toContain(
      'filters=' + encodeURIComponent(JSON.stringify(filters)),
    )
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    await pump
  })
})

describe('ragStream — fail-states', () => {
  it('§5.9-16 fail: observed state not Ready → iterable throws EngineUnavailable', async () => {
    for (const [state, cause, lastError] of [
      ['Starting', 'not-ready', null],
      // A VALID Degraded report (spec §5.2) — Degraded → EngineUnavailable,
      // not EngineError from the faithfulness check.
      ['Degraded', 'not-ready', 'a non-core subsystem (embedding/reranker) is unavailable'],
      ['Unavailable', 'unavailable-state', null],
    ] as const) {
      const { client } = makeFakeSse()
      const store = createEngineRagStore({
        baseUrl: 'http://127.0.0.1:8080',
        fetch: fakeFetch((method, url) => {
          if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
            return jsonResponse({ ...READY_REPORT, state, lastError })
          }
          throw new Error(`unexpected ${method} ${url}`)
        }),
        sse: client,
      })
      const it = store.ragStream('q')[Symbol.asyncIterator]()
      await expect(it.next()).rejects.toBeInstanceOf(EngineUnavailable)
      await expect(it.next()).rejects.toMatchObject({
        code: 'engine_unavailable',
        httpStatus: 503,
        cause,
      })
    }
  })

  it('§5.9-17 fail: malformed SSE frame → EngineError', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = it.next()
    // An incomplete-but-open frame: an event: line with NO data: line.
    calls[0].handlers.onEvent('result', '')
    await expect(pump).rejects.toBeInstanceOf(EngineError)
  })

  it('§5.9-18 fail: event/data type mismatch → EngineError', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = it.next()
    calls[0].handlers.onEvent('result', '{"type":"done"}')
    await expect(pump).rejects.toBeInstanceOf(EngineError)
  })

  it('§5.9-19 fail: dropped connection before done → EngineUnavailable (503, connection-refused); no partial result', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = it.next()
    calls[0].handlers.onError(refusedError())
    await expect(pump).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(pump).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'connection-refused',
    })
  })

  it('§5.9-20 fail: unparseable data: line → EngineError', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const it = store.ragStream('q')[Symbol.asyncIterator]()
    const pump = it.next()
    calls[0].handlers.onEvent('result', 'not-json{{{')
    await expect(pump).rejects.toBeInstanceOf(EngineError)
  })
})

describe('getEngineStatus / health / waitForReady', () => {
  it('§5.8-6 happy: getEngineStatus and health resolve to the same Ready report', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const a = await store.getEngineStatus()
    const b = await store.health()
    expect(a).toEqual(READY_REPORT)
    expect(b).toEqual(READY_REPORT)
    expect(a.state).toBe('Ready')
    expect(a.lastError).toBeNull()
  })

  it('§5.6 Degraded is a faithful projection, not an error to observe', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(JSON.parse(V8_DEGRADED_REPORT))
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const report = await store.getEngineStatus()
    expect(report.state).toBe('Degraded')
    expect(report.subsystems.embedding).toBe(false)
    expect(report.lastError).toBe(
      'a non-core subsystem (embedding/reranker) is unavailable',
    )
  })

  it('§5.8-7 happy: waitForReady polls Starting then Ready → resolves to Ready report', async () => {
    const states: HealthReport['state'][] = ['Starting', 'Ready']
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse({ ...READY_REPORT, state: states.shift()! })
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const report = await store.waitForReady({
      pollIntervalMs: 1,
      maxAttempts: 10,
    })
    expect(report.state).toBe('Ready')
  })

  it('§5.6 waitForReady keeps polling through Degraded (non-terminal)', async () => {
    // A VALID Degraded report (spec §5.2: lastError is Some exactly when
    // Degraded) — the gate must keep polling through it, not reject it as an
    // EngineError from the faithfulness check.
    const reports: HealthReport[] = [DEGRADED_REPORT, READY_REPORT]
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(reports.shift()!)
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const report = await store.waitForReady({
      pollIntervalMs: 1,
      maxAttempts: 10,
    })
    expect(report.state).toBe('Ready')
  })

  it('§5.9-21 fail: malformed health report → EngineError (502)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse({ state: 'Ready' })
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    await expect(store.getEngineStatus()).rejects.toBeInstanceOf(EngineError)
    await expect(store.getEngineStatus()).rejects.toMatchObject({
      code: 'engine_error',
      httpStatus: 502,
    })
  })

  it('§5.9-22 fail: getEngineStatus connection-refused → EngineUnavailable (503, connection-refused)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    await expect(store.getEngineStatus()).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(store.getEngineStatus()).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'connection-refused',
    })
  })

  it('§5.9-23 fail: waitForReady stays non-Ready past maxAttempts → EngineUnavailable (not-ready)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse({ ...READY_REPORT, state: 'Starting' })
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 3 }),
    ).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 3 }),
    ).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'not-ready',
    })
  })

  it('§5.9-24 fail: waitForReady state becomes Unavailable → EngineUnavailable (unavailable-state)', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse({ ...READY_REPORT, state: 'Unavailable' })
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 }),
    ).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 }),
    ).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'unavailable-state',
    })
  })

  it('§5.9-25 fail: waitForReady connection-refused during polling → immediate EngineUnavailable (connection-refused), no retry', async () => {
    let calls = 0
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        calls++
        throw refusedError()
      }),
    })
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 }),
    ).rejects.toBeInstanceOf(EngineUnavailable)
    await expect(
      store.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 }),
    ).rejects.toMatchObject({
      code: 'engine_unavailable',
      httpStatus: 503,
      cause: 'connection-refused',
    })
    // Two waitForReady calls, each issuing a fresh getEngineStatus gate (spec
    // §5.6 mandates a fresh gate per call) → 2 fetches, no retry within a call.
    expect(calls).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// §5.2 golden-vector conformance (V-1..V-6 and V-8 — decode-side).
// ---------------------------------------------------------------------------

describe('golden-vector conformance (wire contract §12)', () => {
  it('V-1: decodeEnvelope + decodeChunk of the Done envelope', () => {
    const env = decodeEnvelope(V1_ENVELOPE)
    expect(env).toEqual({
      schemaVersion: 1,
      idFormat: 'opaque-string-v1',
      payload: { type: 'done' },
    })
    expect(decodeChunk(env.payload)).toEqual({ type: 'done' })
  })

  it('V-2: decodeChunk of the ConflictError chunk', () => {
    const env = decodeEnvelope(V2_ENVELOPE)
    expect(decodeChunk(env.payload)).toEqual({
      type: 'error',
      code: 'conflict',
      message: 'optimistic-concurrency conflict: stale base revision',
    })
  })

  it('V-3: decodeChunk of the ValidationError chunk', () => {
    const env = decodeEnvelope(V3_ENVELOPE)
    expect(decodeChunk(env.payload)).toEqual({
      type: 'error',
      code: 'validation_error',
      message: 'empty query',
    })
  })

  it('V-4: decodeError of the standalone WikiNotFound error', () => {
    const env = decodeEnvelope(V4_ENVELOPE)
    const err = decodeError(env.payload)
    expect(err).toBeInstanceOf(EngineWireError)
    expect(err.code).toBe('wiki_not_found')
    expect(err.httpStatus).toBe(404)
    expect(err.message).toBe('wiki not found')
  })

  it('V-5: decodeEnvelope + decodeRagResult of the minimal flat result', () => {
    const env = decodeEnvelope(V5_ENVELOPE)
    expect(env.schemaVersion).toBe(1)
    expect(env.idFormat).toBe('opaque-string-v1')
    expect(env.payload).toEqual(V5_BODY)
    expect(decodeRagResult(env.payload)).toEqual(V5_MAPPED)
  })

  it('V-6: parseSseFrame + decodeSseChunk of the three event frames', () => {
    const done = parseSseFrame(V6_DONE_FRAME)
    expect(done).toEqual({ event: 'done', data: '{"type":"done"}' })
    expect(decodeSseChunk(V6_DONE_FRAME)).toEqual({ type: 'done' })

    const err = parseSseFrame(V6_ERROR_FRAME)
    expect(err.event).toBe('error')
    expect(decodeSseChunk(V6_ERROR_FRAME)).toEqual({
      type: 'error',
      code: 'validation_error',
      message: 'empty query',
    })

    const res = parseSseFrame(V6_RESULT_FRAME)
    expect(res.event).toBe('result')
    expect(decodeSseChunk(V6_RESULT_FRAME)).toEqual({
      type: 'result',
      result: V5_MAPPED,
    })
  })

  it('V-8: decodeHealthReport of the Ready + Degraded reports', () => {
    const ready = decodeHealthReport(JSON.parse(V8_READY_REPORT))
    expect(ready).toEqual(READY_REPORT)
    expect(ready.lastError).toBeNull()

    const degraded = decodeHealthReport(JSON.parse(V8_DEGRADED_REPORT))
    expect(degraded.state).toBe('Degraded')
    expect(degraded.subsystems.embedding).toBe(false)
    expect(degraded.lastError).toBe(
      'a non-core subsystem (embedding/reranker) is unavailable',
    )
  })
})

// ---------------------------------------------------------------------------
// §5.4 HTTP-status rendering + §5.3 decode-then-validate precedence.
// ---------------------------------------------------------------------------

describe('HTTP-status rendering (§5.4)', () => {
  it('§5.8-10 happy: all 21 codes map to their §11 status', () => {
    for (const code of ALL_21_CODES) {
      const err = wireCodeToError(code, 'msg')
      expect(err.code).toBe(code)
      expect(err.httpStatus).toBe(EXPECTED_STATUS[code])
    }
  })

  it('§5.8-10 happy: conflict → ConflictError (409); not_found → EngineWireError (404)', () => {
    const conflict = wireCodeToError('conflict', 'x')
    expect(conflict).toBeInstanceOf(ConflictError)
    expect(conflict.httpStatus).toBe(409)
    const nf = wireCodeToError('not_found', 'x')
    expect(nf).toBeInstanceOf(EngineWireError)
    expect(nf.httpStatus).toBe(404)
  })

  it('§5.9-12 fail: unknown code → EngineError (502)', () => {
    const err = wireCodeToError('some_foreign_code', 'x')
    expect(err).toBeInstanceOf(EngineError)
    expect(err.code).toBe('engine_error')
    expect(err.httpStatus).toBe(502)
  })

  it('§5.4 engine_unavailable cause: wire-code path assigns cause unavailable-state', () => {
    const err = wireCodeToError('engine_unavailable', 'down')
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('unavailable-state')
    expect(err.httpStatus).toBe(503)
  })

  it('§5.10 census: ENGINE_HTTP_STATUS has exactly 21 entries', () => {
    expect(Object.keys(ENGINE_HTTP_STATUS).length).toBe(21)
    expect(ENGINE_HTTP_STATUS.conflict).toBe(409)
  })
})

describe('decode-then-validate precedence (§5.3 / wire §7 / V-9)', () => {
  it('a body with NO trace key → TraceUnavailable (regardless of other structural issues)', () => {
    expect(() => decodeRagResult({ query: 123 })).toThrow(TraceUnavailable)
    expect(() => decodeRagResult({ query: 'q', results: [], engine: 'gnosis' })).toThrow(
      TraceUnavailable,
    )
  })

  it('a structurally malformed body WITH a trace key → EngineError', () => {
    expect(() =>
      decodeRagResult({ query: 123, trace: { Flat: {} } }),
    ).toThrow(EngineError)
  })

  it('a body BOTH missing trace AND malformed → TraceUnavailable (trace-key-presence checked FIRST)', () => {
    expect(() => decodeRagResult({ query: 123 })).toThrow(TraceUnavailable)
  })

  it('a non-"gnosis" engine → EngineError (validation failure)', () => {
    expect(() =>
      decodeRagResult({
        query: 'q',
        results: [],
        engine: 'local',
        citations: [],
        trace: { Flat: { mode: 'Flat', engine: 'local', top_k: 10, source: 'Local' } },
        blocked_by: null,
      }),
    ).toThrow(EngineError)
  })

  it('blocked_by present without a Graph trace → EngineError (validation failure)', () => {
    expect(() =>
      decodeRagResult({
        query: 'q',
        results: [],
        engine: 'gnosis',
        citations: [],
        trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
        blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }],
      }),
    ).toThrow(EngineError)
  })
})

describe('SSE frame parsing (§5.5)', () => {
  it('parseSseFrame parses a well-formed single-event frame', () => {
    expect(parseSseFrame('event: done\ndata: {"type":"done"}\n\n')).toEqual({
      event: 'done',
      data: '{"type":"done"}',
    })
  })

  it('decodeSseChunk enforces the event/data type match', () => {
    expect(() =>
      decodeSseChunk('event: result\ndata: {"type":"done"}\n\n'),
    ).toThrow(EngineError)
  })

  it('decodeSseChunk throws EngineError on a malformed frame (no event:/data: lines)', () => {
    expect(() => decodeSseChunk('garbage')).toThrow(EngineError)
    expect(() => decodeSseChunk('event: done\n')).toThrow(EngineError)
  })

  it('decodeSseChunk throws EngineError on an unparseable data: line', () => {
    expect(() =>
      decodeSseChunk('event: result\ndata: not-json\n\n'),
    ).toThrow(EngineError)
  })
})

// ---------------------------------------------------------------------------
// §5.7 PBT register (8 rows) — deterministic pinned seed, ≤100 attempts/row,
// ≤400 total, stop-after-5.
// ---------------------------------------------------------------------------

// Deterministic pinned seed for this unit's property layer (the spec §5.7
// requires a deterministic pinned seed; the register doc pins "one deterministic
// pinned seed per binary"). 0x6E6E6E6E = "GN" — the unit's mnemonic.
const PBT_SEED = 0x6e6e6e6e
const PBT_ATTEMPTS = 40 // ≤100/row; 8 rows × 40 = 320 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function genResultBody(rng: () => number): unknown {
  const mode = pick(rng, ['Flat', 'Vector', 'Graph', 'Hybrid'] as const)
  const source = pick(rng, ['Local', 'Zodiac'] as const)
  const trace: any =
    mode === 'Graph'
      ? {
          Graph: [
            {
              from: { document_id: 'd1', node_id: 'n1' },
              to: { document_id: 'd2', node_id: 'n2' },
              edge: pick(rng, ['link', 'embed', 'crosslink'] as const),
              state: pick(rng, ['FRESH', 'RESOLVED', 'STALE', 'BROKEN'] as const),
            },
          ],
        }
      : {
          [mode]: {
            mode,
            engine: 'gnosis',
            top_k: 10,
            source,
            ...(mode === 'Hybrid'
              ? { legs: ['graph', 'vector', 'lexical'] }
              : {}),
          },
        }
  return {
    query: 'q',
    results: [
      {
        document_id: 'd1',
        node_id: 'n1',
        score: 0.9,
        snippet: 's',
        source,
        parent: null,
        stale: null,
      },
    ],
    engine: 'gnosis',
    citations: [['d1', 'n1']],
    trace,
    blocked_by: null,
  }
}

function genChunk(rng: () => number): unknown {
  const t = pick(rng, ['result', 'done', 'error'] as const)
  if (t === 'done') return { type: 'done' }
  if (t === 'error')
    return {
      type: 'error',
      code: pick(rng, ALL_21_CODES),
      message: 'm',
    }
  return { type: 'result', result: genResultBody(rng) }
}

function genHealthReport(rng: () => number): unknown {
  const state = pick(rng, ['Ready', 'Starting', 'Degraded', 'Unavailable'] as const)
  return {
    schemaVersion: 1,
    idFormat: 'opaque-string-v1',
    state,
    version: 'v',
    subsystems: {
      store: true,
      graph: true,
      lexical: true,
      vector: true,
      embedding: state === 'Degraded' ? false : true,
      reranker: true,
    },
    lastError: state === 'Degraded' ? 'a non-core subsystem is unavailable' : null,
  }
}

function genSseFrame(rng: () => number): string {
  const chunk = genChunk(rng) as any
  const type = chunk.type
  return `event: ${type}\ndata: ${JSON.stringify(chunk)}\n\n`
}

// Collect up to `stopAfter` counterexamples; the row is BROKEN if any found.
function runProperty(
  attempts: number,
  stopAfter: number,
  check: (i: number, rng: () => number) => string | null,
): { held: boolean; counterexamples: string[] } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < attempts; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= stopAfter) break
    }
  }
  return { held: counterexamples.length === 0, counterexamples }
}

describe('PBT register (§5.7)', () => {
  it('P-IM-1 [strat:decode-determinism] decode determinism + golden-vector conformance', () => {
    // Golden-vector conformance (pinned typed values).
    expect(decodeEnvelope(V1_ENVELOPE).payload).toEqual({ type: 'done' })
    expect(decodeChunk(JSON.parse(V1_ENVELOPE).payload)).toEqual({ type: 'done' })
    expect(decodeRagResult(V5_BODY)).toEqual(V5_MAPPED)
    expect(decodeHealthReport(JSON.parse(V8_READY_REPORT))).toEqual(READY_REPORT)
    expect(decodeSseChunk(V6_DONE_FRAME)).toEqual({ type: 'done' })

    // Determinism: decoding the same well-formed body twice yields the same value.
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const env = { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: genChunk(rng) }
        const a = decodeChunk(env.payload)
        const b = decodeChunk(env.payload)
        if (JSON.stringify(a) !== JSON.stringify(b)) return 'decodeChunk non-deterministic'
        const rep = genHealthReport(rng)
        const r1 = decodeHealthReport(rep)
        const r2 = decodeHealthReport(rep)
        if (JSON.stringify(r1) !== JSON.stringify(r2)) return 'decodeHealthReport non-deterministic'
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-IM-2 [strat:decode-determinism] decode-then-validate determinism + precedence', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        // A body with NO trace key → TraceUnavailable regardless of other issues.
        const noTrace = { query: pick(rng, [123, 'q', null] as const), results: [] }
        try {
          decodeRagResult(noTrace)
          return 'no-trace body did not throw TraceUnavailable'
        } catch (e) {
          if (!(e instanceof TraceUnavailable)) return 'no-trace body threw wrong type'
        }
        // A structurally malformed body WITH a trace key → EngineError.
        try {
          decodeRagResult({ query: 123, trace: { Flat: {} } })
          return 'malformed-with-trace body did not throw EngineError'
        } catch (e) {
          if (!(e instanceof EngineError)) return 'malformed-with-trace threw wrong type'
        }
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-IM-3 [strat:status-map] HTTP-status map totality + uniqueness + ConflictError=409', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const code = pick(rng, ALL_21_CODES)
        if (ENGINE_HTTP_STATUS[code] === undefined)
          return `code ${code} not defined in ENGINE_HTTP_STATUS`
        if (ENGINE_HTTP_STATUS[code] !== EXPECTED_STATUS[code])
          return `code ${code} status ${ENGINE_HTTP_STATUS[code]} != expected ${EXPECTED_STATUS[code]}`
        return null
      },
    )
    // Totality over the closed 21-code set + each code maps to its expected status.
    expect(Object.keys(ENGINE_HTTP_STATUS).sort()).toEqual([...ALL_21_CODES].sort())
    for (const code of ALL_21_CODES) {
      expect(ENGINE_HTTP_STATUS[code]).toBe(EXPECTED_STATUS[code])
    }
    expect(ENGINE_HTTP_STATUS.conflict).toBe(409)
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-IM-4 [strat:sse-parse] SSE frame parse determinism + event/data type match', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const frame = genSseFrame(rng)
        if (!frame.endsWith('\n\n')) return 'frame does not end with \\n\\n'
        const parsed = parseSseFrame(frame)
        const dataType = (JSON.parse(parsed.data) as any).type
        if (parsed.event !== dataType) return 'event != data.type'
        const chunk = decodeSseChunk(frame)
        if (chunk.type !== parsed.event) return 'decodeSseChunk type mismatch'
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
    // Negative generator: malformed frames must be rejected (→ EngineError).
    // `structural` frames are rejected by parseSseFrame itself; the rest are
    // structurally parseable but rejected by decodeSseChunk (type mismatch /
    // unparseable data).
    const malformedFrames: Array<{ frame: string; why: string; structural: boolean }> = [
      { frame: 'event: done\ndata: {"type":"done"}\n', why: 'incomplete (no terminal blank line)', structural: true },
      { frame: 'event: done\n', why: 'incomplete (single line)', structural: true },
      { frame: 'event: done\ndata: {"type":"result","result":{}}\n\n', why: 'event/data type mismatch', structural: false },
      { frame: 'event: done\ndata: not-json\n\n', why: 'unparseable data line', structural: false },
      { frame: 'data: {"type":"done"}\n\n', why: 'missing event line', structural: true },
      { frame: 'event: done\n\n', why: 'missing data line', structural: true },
    ]
    for (const { frame, why, structural } of malformedFrames) {
      if (structural) {
        expect(() => parseSseFrame(frame), `parseSseFrame should reject ${why}`).toThrow(EngineError)
      }
      expect(() => decodeSseChunk(frame), `decodeSseChunk should reject ${why}`).toThrow(EngineError)
    }
  })

  it('P-SM-1 [strat:health-determinism] health-report determinism + faithfulness', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const wire = genHealthReport(rng) as any
        const report = decodeHealthReport(wire)
        if (JSON.stringify(report) !== JSON.stringify(decodeHealthReport(wire)))
          return 'decodeHealthReport non-deterministic'
        if ((report.lastError != null) !== (wire.lastError != null))
          return 'lastError faithfulness violated'
        if (wire.state === 'Degraded' && report.lastError == null)
          return 'Degraded report must have non-null lastError'
        return null
      },
    )
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
    // Negative generator: a report that invents a lastError (a Ready report
    // with a non-null lastError) must be rejected (→ EngineError) — the decoder
    // must not accept an invented lastError.
    const inventedLastError = { ...READY_REPORT, lastError: 'invented' }
    expect(() => decodeHealthReport(inventedLastError)).toThrow(EngineError)
    // ... and a Degraded report that drops its lastError (null) is likewise
    // inconsistent with the "lastError is Some exactly when Degraded" invariant.
    const droppedLastError = { ...READY_REPORT, state: 'Degraded', lastError: null }
    expect(() => decodeHealthReport(droppedLastError)).toThrow(EngineError)
  })

  it('P-SM-2 [strat:ready-gate] READY gating determinism', async () => {
    // The gate is async (ragQuery issues a fresh getEngineStatus), so the
    // property loop runs inline with the seeded rng rather than through the
    // synchronous runProperty helper.
    const makeStore = (state: 'Ready' | 'Starting' | 'Degraded' | 'Unavailable') =>
      createEngineRagStore({
        baseUrl: 'http://127.0.0.1:8080',
        fetch: fakeFetch((method, url) => {
          if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
            // A VALID Degraded report (spec §5.2: lastError is Some exactly
            // when Degraded) — the gate must see Degraded → EngineUnavailable,
            // not EngineError from the faithfulness check.
            return jsonResponse({
              ...READY_REPORT,
              state,
              lastError:
                state === 'Degraded'
                  ? 'a non-core subsystem (embedding/reranker) is unavailable'
                  : null,
            })
          }
          if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) {
            // A Ready-gated ragQuery proceeds to the POST; return a minimal
            // valid RagResult envelope so the Ready → 'proceed' path is
            // reachable (V5_ENVELOPE decodes to V5_MAPPED).
            return jsonResponse(JSON.parse(V5_ENVELOPE))
          }
          throw new Error(`unexpected ${method} ${url}`)
        }),
      })
    const gateOutcome = async (store: EngineRagStore) =>
      store.ragQuery('q').then(
        () => 'proceed',
        (e) => (e instanceof EngineUnavailable ? 'gated' : 'other'),
      )
    // Generator: draw a state from the closed 4-state set and exercise the gate.
    const rng = mulberry32(PBT_SEED)
    const counterexamples: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS; i++) {
      const state = pick(rng, ['Ready', 'Starting', 'Degraded', 'Unavailable'] as const)
      const store = makeStore(state)
      const first = await gateOutcome(store)
      const second = await gateOutcome(store)
      if (first !== second) {
        counterexamples.push(`state ${state}: non-deterministic gate (${first} vs ${second})`)
      } else {
        const expected = state === 'Ready' ? 'proceed' : 'gated'
        if (first !== expected) {
          counterexamples.push(`state ${state} → ${first}, expected ${expected}`)
        }
      }
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
    expect(counterexamples).toEqual([])
    // Guarantee all four states are covered by the generator: Ready → proceed;
    // else → EngineUnavailable, deterministically.
    for (const state of ['Ready', 'Starting', 'Degraded', 'Unavailable'] as const) {
      const store = makeStore(state)
      const first = await gateOutcome(store)
      const second = await gateOutcome(store)
      expect(first).toBe(second)
      expect(first).toBe(state === 'Ready' ? 'proceed' : 'gated')
    }
  })

  it('P-TP-1 [strat:code-translate] wire-code → typed-error translation determinism', () => {
    const { held, counterexamples } = runProperty(
      PBT_ATTEMPTS,
      PBT_STOP_AFTER,
      (_i, rng) => {
        const code = pick(rng, ALL_21_CODES)
        const message = `m${Math.floor(rng() * 1000)}`
        const a = wireCodeToError(code, message)
        const b = wireCodeToError(code, message)
        if (a.code !== b.code || a.httpStatus !== b.httpStatus)
          return 'wireCodeToError non-deterministic'
        if (a.code !== code) return 'wireCodeToError wrong code'
        if (a.httpStatus !== EXPECTED_STATUS[code]) return 'wireCodeToError wrong status'
        return null
      },
    )
    // Unknown code → EngineError (502).
    const unknown = wireCodeToError('foreign_code', 'x')
    expect(unknown).toBeInstanceOf(EngineError)
    expect(unknown.httpStatus).toBe(502)
    expect(counterexamples).toEqual([])
    expect(held).toBe(true)
  })

  it('P-TP-2 [strat:engine-absent] engine-absent → EngineUnavailable determinism', async () => {
    // The gate is async (ragQuery), so the property loop runs inline with the
    // seeded rng rather than through the synchronous runProperty helper.
    const makeStore = (kind: 'refused' | 'not-spawned') =>
      createEngineRagStore({
        baseUrl: 'http://127.0.0.1:8080',
        fetch: fakeFetch(() => {
          throw kind === 'refused' ? refusedError() : notSpawnedError()
        }),
      })
    const expectedCause = (kind: 'refused' | 'not-spawned') =>
      kind === 'refused' ? 'connection-refused' : 'engine-not-spawned'
    // Generator: draw a transport-failure kind and exercise the proxy.
    const rng = mulberry32(PBT_SEED)
    const counterexamples: string[] = []
    for (let i = 0; i < PBT_ATTEMPTS; i++) {
      const kind = pick(rng, ['refused', 'not-spawned'] as const)
      const store = makeStore(kind)
      try {
        await store.ragQuery('q')
        counterexamples.push(`kind ${kind}: ragQuery did not throw`)
      } catch (e) {
        const err = e as { code?: string; httpStatus?: number; cause?: string }
        if (
          err?.code !== 'engine_unavailable' ||
          err?.httpStatus !== 503 ||
          err?.cause !== expectedCause(kind)
        ) {
          counterexamples.push(
            `kind ${kind}: wrong error (code=${err?.code}, httpStatus=${err?.httpStatus}, cause=${err?.cause})`,
          )
        }
      }
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
    expect(counterexamples).toEqual([])
    // Guarantee both kinds are covered by the generator: each throws
    // EngineUnavailable (503) with the right cause, deterministically.
    for (const kind of ['refused', 'not-spawned'] as const) {
      const store = makeStore(kind)
      await expect(store.ragQuery('q')).rejects.toMatchObject({
        code: 'engine_unavailable',
        httpStatus: 503,
        cause: expectedCause(kind),
      })
    }
  })
})
