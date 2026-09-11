/**
 * Blind-test greens runner — Unit GN: Gnosis Engine Integration
 * (`createEngineRagStore` proxy over the F2 wire contract).
 *
 * Authored by the BLIND-TEST WRITER from the DOCUMENTATION ONLY:
 *   - docs/specs/unit-gn-engine-integration.md
 *   - ../Gnosis/docs/specs/engine-wire-contract.md
 *   - ../Gnosis/docs/integrations/astrographer-interface-implementation.md
 *
 * The implementation source (src/main/engine-rag-store.ts) and the unit's own
 * test file were NOT read. Every scenario below is derived from the docs.
 */
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
  EngineError,
  TraceUnavailable,
  ConflictError,
  EngineUnavailable,
} from '../src/main/engine-rag-store.js'

/* ------------------------------------------------------------------ *
 * Fixtures (from the wire contract §12 golden vectors + §3.5 health)  *
 * ------------------------------------------------------------------ */

const V1 = '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"done"}}'
const V2 = '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"error","code":"conflict","message":"optimistic-concurrency conflict: stale base revision"}}'
const V3 = '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"type":"error","code":"validation_error","message":"empty query"}}'
const V4 = '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"code":"wiki_not_found","message":"wiki not found"}}'
const V5 = '{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"query":"q","results":[{"document_id":"d1","node_id":"n1","score":0.9,"snippet":"s","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[["d1","n1"]],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}},"blocked_by":null}}'

// The V-5 payload body (the envelope payload), as a JS object.
const V5_BODY = {
  query: 'q',
  results: [{ document_id: 'd1', node_id: 'n1', score: 0.9, snippet: 's', source: 'Local', parent: null, stale: null }],
  engine: 'gnosis',
  citations: [['d1', 'n1']],
  trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
  blocked_by: null,
}

// The pinned typed value V-5 decodes to (the proxy-specific EngineRagResult).
const V5_MAPPED = {
  query: 'q',
  results: [{ documentId: 'd1', nodeId: 'n1', score: 0.9, snippet: 's', source: 'local' }],
  engine: 'gnosis',
  citations: [{ documentId: 'd1', nodeId: 'n1' }],
  trace: { mode: 'flat', engine: 'gnosis', topK: 10, source: 'local' },
}

const V8_READY = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: '…',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}
const V8_DEGRADED = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Degraded',
  version: '…',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: false, reranker: true },
  lastError: 'a non-core subsystem (embedding/reranker) is unavailable',
}

const reportWith = (state, extra = {}) => ({ ...V8_READY, state, ...extra })

/* ------------------------------------------------------------------ *
 * Test harness helpers                                                *
 * ------------------------------------------------------------------ */

function jsonResponse(body, status = 200) {
  const make = () => ({
    ok: status >= 200 && status < 300,
    status,
    async text() { return JSON.stringify(body) },
    async json() { return body },
  })
  const res = make()
  res.clone = () => make()
  return res
}

/** A configurable fetch that routes on `METHOD pathname`. */
function makeFetch(routes) {
  return async (url, init) => {
    const u = new URL(String(url))
    const method = (init && init.method) || 'GET'
    const key = `${method} ${u.pathname}`
    const handler = routes[key]
    if (!handler) throw new Error(`no route for ${key}`)
    return handler(u, init)
  }
}

/** A fetch that always throws a transport error with the given cause code. */
function throwingFetch(causeCode) {
  return async () => {
    throw Object.assign(new TypeError('fetch failed'), { cause: { code: causeCode } })
  }
}

/** A fetch that never resolves (for the request-timeout scenario). */
function hangingFetch() {
  return () => new Promise(() => {})
}

/** A fetch that never resolves but rejects when the AbortSignal fires (for the
 *  request-timeout scenario — the proxy's fetchWithTimeout aborts on timeout). */
function abortableFetch() {
  return (url, init) => new Promise((resolve, reject) => {
    const signal = init && init.signal
    if (signal) {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })))
    }
  })
}

/** An injectable SSE client that captures handlers and lets the test drive them. */
function makeSse() {
  let handlers = null
  let resolveSubscribed
  const subscribed = new Promise((r) => { resolveSubscribed = r })
  let closed = false
  const sse = {
    subscribe(url, h) {
      handlers = h
      resolveSubscribed()
      return { close() { closed = true } }
    },
    get handlers() { return handlers },
    get subscribed() { return subscribed },
    get closed() { return closed },
  }
  return sse
}

/** Collect all chunks from an async iterable. */
async function collect(iterable) {
  const out = []
  for await (const c of iterable) out.push(c)
  return out
}

/* ------------------------------------------------------------------ *
 * Factory + proxy surface                                             *
 * ------------------------------------------------------------------ */

describe('Factory + proxy surface (§5.1, §5.8-1/14, §5.9-1/2/3)', () => {
  it('G1. factory happy — returns a proxy with the 5-method surface; no network I/O at construction', () => {
    let fetchCalled = false
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: () => { fetchCalled = true; throw new Error('should not be called') },
    })
    expect(typeof proxy.ragQuery).toBe('function')
    expect(typeof proxy.ragStream).toBe('function')
    expect(typeof proxy.getEngineStatus).toBe('function')
    expect(typeof proxy.health).toBe('function')
    expect(typeof proxy.waitForReady).toBe('function')
    expect(fetchCalled).toBe(false)
  })

  it('G2. loopback enforcement — 127.0.0.1 and localhost are accepted', () => {
    expect(() => createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080' })).not.toThrow()
    expect(() => createEngineRagStore({ baseUrl: 'http://localhost:8080' })).not.toThrow()
  })

  it('F1. null/undefined opts → throws "engine rag store: opts required"', () => {
    expect(() => createEngineRagStore(null)).toThrow('engine rag store: opts required')
    expect(() => createEngineRagStore(undefined)).toThrow('engine rag store: opts required')
  })

  it('F2. missing/empty baseUrl → throws "engine rag store: baseUrl required"', () => {
    expect(() => createEngineRagStore({})).toThrow('engine rag store: baseUrl required')
    expect(() => createEngineRagStore({ baseUrl: '' })).toThrow('engine rag store: baseUrl required')
  })

  it('F3. non-loopback baseUrl → throws "engine rag store: baseUrl must be loopback"', () => {
    expect(() => createEngineRagStore({ baseUrl: 'http://192.168.1.1:8080' })).toThrow('engine rag store: baseUrl must be loopback')
  })

  it('G2b. ENGINE_ENDPOINTS pins the three paths', () => {
    expect(ENGINE_ENDPOINTS).toEqual({
      ragQuery: '/rag/query',
      ragStream: '/rag/stream',
      engineStatus: '/engine/status',
    })
  })
})

/* ------------------------------------------------------------------ *
 * Golden-vector decode conformance (§5.2, §12 of the wire contract)   *
 * ------------------------------------------------------------------ */

describe('Golden-vector decode conformance (§5.2, wire contract §12)', () => {
  it('G3. V-1 (done chunk) decodes to the pinned typed value', () => {
    const env = decodeEnvelope(V1)
    expect(env).toEqual({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { type: 'done' } })
    expect(decodeChunk(env.payload)).toEqual({ type: 'done' })
  })

  it('G4. V-2 (conflict error chunk) decodes to the pinned typed value', () => {
    const env = decodeEnvelope(V2)
    expect(decodeChunk(env.payload)).toEqual({
      type: 'error',
      code: 'conflict',
      message: 'optimistic-concurrency conflict: stale base revision',
    })
  })

  it('G5. V-3 (validation_error chunk) decodes to the pinned typed value', () => {
    const env = decodeEnvelope(V3)
    expect(decodeChunk(env.payload)).toEqual({ type: 'error', code: 'validation_error', message: 'empty query' })
  })

  it('G6. V-4 (standalone wiki_not_found error) decodes to the typed error (404)', () => {
    const env = decodeEnvelope(V4)
    const err = decodeError(env.payload)
    expect(err.code).toBe('wiki_not_found')
    expect(err.httpStatus).toBe(404)
  })

  it('G7. V-5 (flat result) decodes to the mapped EngineRagResult', () => {
    const env = decodeEnvelope(V5)
    const result = decodeRagResult(env.payload)
    expect(result).toEqual(V5_MAPPED)
    expect(result.blockedBy).toBeUndefined()
  })

  it('G8. V-6 (three SSE frames) decode via parseSseFrame/decodeSseChunk', () => {
    const doneFrame = 'event: done\ndata: {"type":"done"}\n\n'
    expect(parseSseFrame(doneFrame)).toEqual({ event: 'done', data: '{"type":"done"}' })
    expect(decodeSseChunk(doneFrame)).toEqual({ type: 'done' })

    const errFrame = 'event: error\ndata: {"type":"error","code":"validation_error","message":"empty query"}\n\n'
    expect(decodeSseChunk(errFrame)).toEqual({ type: 'error', code: 'validation_error', message: 'empty query' })

    const resultFrame = `event: result\ndata: ${JSON.stringify({ type: 'result', result: V5_BODY })}\n\n`
    expect(decodeSseChunk(resultFrame)).toEqual({ type: 'result', result: V5_MAPPED })
  })

  it('G9. V-8 (Ready + Degraded health reports) decode to the pinned typed values', () => {
    const ready = decodeHealthReport(V8_READY)
    expect(ready).toEqual(V8_READY)
    const degraded = decodeHealthReport(V8_DEGRADED)
    expect(degraded.state).toBe('Degraded')
    expect(degraded.subsystems.embedding).toBe(false)
    expect(degraded.lastError).toBe('a non-core subsystem (embedding/reranker) is unavailable')
  })
})

/* ------------------------------------------------------------------ *
 * decode-then-validate precedence (§5.3, wire contract §7/§12 V-9)     *
 * ------------------------------------------------------------------ */

describe('decode-then-validate precedence (§5.3, §5.8-8/9, §5.9-5/6/7/8)', () => {
  it('G10. happy decode-then-validate — well-formed body with trace + engine gnosis', () => {
    const result = decodeRagResult(V5_BODY)
    expect(result.engine).toBe('gnosis')
    expect(result.trace.mode).toBe('flat')
  })

  it('G11. vector/hybrid/graph trace decode — the proxy preserves the full wire trace', () => {
    const vector = decodeRagResult({
      query: 'q', results: [], engine: 'gnosis', citations: [],
      trace: { Vector: { mode: 'Vector', engine: 'gnosis', top_k: 10, source: 'Local' } }, blocked_by: null,
    })
    expect(vector.trace).toEqual({ mode: 'vector', engine: 'gnosis', topK: 10, source: 'local' })

    const hybrid = decodeRagResult({
      query: 'q', results: [], engine: 'gnosis', citations: [],
      trace: { Hybrid: { mode: 'Hybrid', engine: 'gnosis', legs: ['graph', 'vector', 'lexical'], top_k: 10, source: 'Local' } }, blocked_by: null,
    })
    expect(hybrid.trace).toEqual({ mode: 'hybrid', engine: 'gnosis', legs: ['graph', 'vector', 'lexical'], topK: 10, source: 'local' })

    const graph = decodeRagResult({
      query: 'q', results: [], engine: 'gnosis', citations: [],
      trace: { Graph: [{ from: { document_id: 'd1', node_id: 'n1' }, to: { document_id: 'd2', node_id: 'n2' }, edge: 'link', state: 'FRESH' }] }, blocked_by: null,
    })
    expect(graph.trace).toEqual({
      mode: 'graph',
      entries: [{ from: { documentId: 'd1', nodeId: 'n1' }, to: { documentId: 'd2', nodeId: 'n2' }, edge: 'link', state: 'FRESH' }],
    })
  })

  it('G12. blocked_by with a Graph trace maps to blockedBy (uppercase state passed through)', () => {
    const result = decodeRagResult({
      query: 'q', results: [], engine: 'gnosis', citations: [],
      trace: { Graph: [] },
      blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }],
    })
    expect(result.blockedBy).toEqual([{ documentId: 'd1', nodeId: 'n1', state: 'BROKEN' }])
  })

  it('F4. body missing trace → TraceUnavailable (502)', () => {
    expect(() => decodeRagResult({ query: 'q', results: [], engine: 'gnosis', citations: [] }))
      .toThrowError(expect.objectContaining({ code: 'trace_unavailable', httpStatus: 502 }))
  })

  it('F5. structurally malformed body WITH a trace key → EngineError (502)', () => {
    expect(() => decodeRagResult({ query: 123, trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } } }))
      .toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F6. precedence — body BOTH missing trace AND malformed → TraceUnavailable (trace-key-presence checked FIRST)', () => {
    expect(() => decodeRagResult({ query: 123 }))
      .toThrowError(expect.objectContaining({ code: 'trace_unavailable', httpStatus: 502 }))
  })

  it('F7. non-"gnosis" engine → EngineError (502)', () => {
    expect(() => decodeRagResult({
      query: 'q', results: [], engine: 'other', citations: [],
      trace: { Flat: { mode: 'Flat', engine: 'other', top_k: 10, source: 'Local' } }, blocked_by: null,
    })).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F8. blocked_by present but a non-Graph trace → EngineError (502)', () => {
    expect(() => decodeRagResult({
      query: 'q', results: [], engine: 'gnosis', citations: [],
      trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
      blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }],
    })).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })
})

/* ------------------------------------------------------------------ *
 * HTTP-status map (§5.4, wire contract §11)                           *
 * ------------------------------------------------------------------ */

describe('HTTP-status map (§5.4, §5.8-10, §5.9-11/12)', () => {
  it('G13. all 21 codes map to their §11 status; conflict = 409 (mandated)', () => {
    const expected = {
      not_found: 404, wiki_not_found: 404, validation_error: 400, conflict: 409,
      doc_in_use: 409, invalid_state: 409, unresolved_reference: 422,
      engine_unavailable: 503, engine_error: 502, trace_unavailable: 502,
      hop_limit_exceeded: 422, cycle_detected: 409, embedding_unavailable: 503,
      vector_index_unavailable: 503, lexical_index_unavailable: 503,
      reranker_unavailable: 503, compression_failed: 500,
      hyde_generation_failed: 500, multi_query_expansion_failed: 500,
      community_not_found: 404, sub_task_dag_failed: 500,
    }
    expect(Object.keys(ENGINE_HTTP_STATUS).length).toBe(21)
    for (const [code, status] of Object.entries(expected)) {
      expect(ENGINE_HTTP_STATUS[code]).toBe(status)
    }
    expect(ENGINE_HTTP_STATUS.conflict).toBe(409)
  })

  it('G14. wireCodeToError maps known codes to the typed error with the §11 status', () => {
    const conflict = wireCodeToError('conflict', 'msg')
    expect(conflict).toBeInstanceOf(ConflictError)
    expect(conflict.code).toBe('conflict')
    expect(conflict.httpStatus).toBe(409)

    const nf = wireCodeToError('not_found', 'msg')
    expect(nf.code).toBe('not_found')
    expect(nf.httpStatus).toBe(404)

    const ee = wireCodeToError('engine_error', 'msg')
    expect(ee).toBeInstanceOf(EngineError)
    expect(ee.httpStatus).toBe(502)

    const tu = wireCodeToError('trace_unavailable', 'msg')
    expect(tu).toBeInstanceOf(TraceUnavailable)
    expect(tu.httpStatus).toBe(502)
  })

  it('G15. engine_unavailable wire code → EngineUnavailable with cause "unavailable-state"', () => {
    const eu = wireCodeToError('engine_unavailable', 'msg')
    expect(eu).toBeInstanceOf(EngineUnavailable)
    expect(eu.code).toBe('engine_unavailable')
    expect(eu.httpStatus).toBe(503)
    expect(eu.cause).toBe('unavailable-state')
  })

  it('F9. unknown/foreign code → EngineError (502)', () => {
    const unknown = wireCodeToError('bogus_code', 'msg')
    expect(unknown).toBeInstanceOf(EngineError)
    expect(unknown.code).toBe('engine_error')
    expect(unknown.httpStatus).toBe(502)
  })
})

/* ------------------------------------------------------------------ *
 * ragQuery proxy behavior (§5.8-2/3, §5.9-4..15)                      *
 * ------------------------------------------------------------------ */

describe('ragQuery proxy behavior (§5.8-2/3, §5.9-4..15)', () => {
  it('G16. ragQuery happy — POST /rag/query returns a V-5 envelope → mapped EngineRagResult', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse(JSON.parse(V5)),
      }),
    })
    const result = await proxy.ragQuery('q')
    expect(result).toEqual(V5_MAPPED)
  })

  it('G17. ragQuery with a wire error chunk (conflict) → rejects with ConflictError (409)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse(JSON.parse(V2)),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'conflict', httpStatus: 409 })
  })

  it('F10. ragQuery with a malformed envelope → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1 }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F11. ragQuery with a result body missing trace → TraceUnavailable (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { query: 'q', results: [], engine: 'gnosis', citations: [] } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'trace_unavailable', httpStatus: 502 })
  })

  it('F12. ragQuery with a structurally malformed body (with a trace key) → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { query: 123, trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } } } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F13. ragQuery with a non-"gnosis" engine → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { query: 'q', results: [], engine: 'other', citations: [], trace: { Flat: { mode: 'Flat', engine: 'other', top_k: 10, source: 'Local' } }, blocked_by: null } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F14. ragQuery with blocked_by present but a non-Graph trace → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { query: 'q', results: [], engine: 'gnosis', citations: [], trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } }, blocked_by: [{ document_id: 'd1', node_id: 'n1', state: 'BROKEN' }] } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F15. ragQuery with an unknown schemaVersion (99) → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 99, idFormat: 'opaque-string-v1', payload: { type: 'done' } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F16. ragQuery with an unknown idFormat ("uuid-v4") → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'uuid-v4', payload: { type: 'done' } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F17. ragQuery with a wire error chunk for engine_unavailable → EngineUnavailable (503, cause unavailable-state)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { type: 'error', code: 'engine_unavailable', message: 'engine down' } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'unavailable-state' })
  })

  it('F18. ragQuery with a wire error chunk for an UNKNOWN code → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({
        'GET /engine/status': () => jsonResponse(V8_READY),
        'POST /rag/query': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { type: 'error', code: 'bogus_code', message: 'x' } }),
      }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F19. ragQuery connection-refused → EngineUnavailable (503, cause connection-refused)', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: throwingFetch('ECONNREFUSED') })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'connection-refused' })
  })

  it('F20. ragQuery engine-not-spawned → EngineUnavailable (503, cause engine-not-spawned)', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: throwingFetch('ENOTFOUND') })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'engine-not-spawned' })
  })

  it('F21. ragQuery when the observed state is Starting → EngineUnavailable (503, cause not-ready)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(reportWith('Starting')) }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'not-ready' })
  })

  it('F22. ragQuery when the observed state is Degraded → EngineUnavailable (503, cause not-ready)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_DEGRADED) }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'not-ready' })
  })

  it('F23. ragQuery when the observed state is Unavailable → EngineUnavailable (503, cause unavailable-state)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(reportWith('Unavailable')) }),
    })
    await expect(proxy.ragQuery('q')).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'unavailable-state' })
  })
})

/* ------------------------------------------------------------------ *
 * ragStream proxy behavior (§5.5, §5.8-4/5/11/12, §5.9-16..20)        *
 * ------------------------------------------------------------------ */

describe('ragStream proxy behavior (§5.5, §5.8-4/5/11/12, §5.9-16..20)', () => {
  it('G18. ragStream happy — result-then-done yields [{result},{done}] in order', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
      sse,
    })
    const collectPromise = collect(proxy.ragStream('q'))
    await sse.subscribed
    sse.handlers.onEvent('result', JSON.stringify({ type: 'result', result: V5_BODY }))
    sse.handlers.onEvent('done', JSON.stringify({ type: 'done' }))
    sse.handlers.onClose()
    const chunks = await collectPromise
    expect(chunks).toEqual([{ type: 'result', result: V5_MAPPED }, { type: 'done' }])
  })

  it('G19. ragStream error-then-done yields [{error},{done}]', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
      sse,
    })
    const collectPromise = collect(proxy.ragStream('q'))
    await sse.subscribed
    sse.handlers.onEvent('error', JSON.stringify({ type: 'error', code: 'validation_error', message: 'empty query' }))
    sse.handlers.onEvent('done', JSON.stringify({ type: 'done' }))
    sse.handlers.onClose()
    const chunks = await collectPromise
    expect(chunks).toEqual([{ type: 'error', code: 'validation_error', message: 'empty query' }, { type: 'done' }])
  })

  it('G20. single-shot honesty — exactly one result then done, then the iterable closes', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
      sse,
    })
    const collectPromise = collect(proxy.ragStream('q'))
    await sse.subscribed
    sse.handlers.onEvent('result', JSON.stringify({ type: 'result', result: V5_BODY }))
    sse.handlers.onEvent('done', JSON.stringify({ type: 'done' }))
    sse.handlers.onClose()
    const chunks = await collectPromise
    expect(chunks).toHaveLength(2)
    expect(chunks[0].type).toBe('result')
    expect(chunks[1].type).toBe('done')
  })

  it('G21. mid-stream cancel — the consumer cancels; the SSE connection closes cleanly; no error', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
      sse,
    })
    const it = proxy.ragStream('q')[Symbol.asyncIterator]()
    const pending = it.next() // start the generator (gate + subscribe)
    await sse.subscribed
    await it.return()
    expect(sse.closed).toBe(true)
  })

  it('F24. ragStream when the observed state is not Ready → EngineUnavailable (not-ready)', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(reportWith('Starting')) }),
      sse,
    })
    await expect(collect(proxy.ragStream('q'))).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'not-ready' })
  })

  it('F25. ragStream with a dropped connection before done → EngineUnavailable (503, cause connection-refused)', async () => {
    const sse = makeSse()
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
      sse,
    })
    const collectPromise = collect(proxy.ragStream('q'))
    await sse.subscribed
    sse.handlers.onClose()
    await expect(collectPromise).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'connection-refused' })
  })
})

/* ------------------------------------------------------------------ *
 * SSE frame parsing (pure functions — §5.5, §5.9-17/18/20)            *
 * ------------------------------------------------------------------ */

describe('SSE frame parsing (pure functions — §5.5, §5.9-17/18/20)', () => {
  it('F26. malformed frame (no event:/data: lines) → EngineError', () => {
    expect(() => parseSseFrame('garbage\n\n')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F27. incomplete-but-open frame (event: line with NO data: line) → EngineError', () => {
    expect(() => parseSseFrame('event: result\n')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F28. frame with a data: line but no event: line → EngineError', () => {
    expect(() => parseSseFrame('data: {"type":"done"}\n\n')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F29. trailing non-blank content → EngineError', () => {
    expect(() => parseSseFrame('event: done\ndata: {"type":"done"}\n\nextra')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F30. event/data type mismatch → EngineError', () => {
    expect(() => decodeSseChunk('event: result\ndata: {"type":"done"}\n\n')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })

  it('F31. unparseable data: line → EngineError', () => {
    expect(() => decodeSseChunk('event: done\ndata: not-json\n\n')).toThrowError(expect.objectContaining({ code: 'engine_error', httpStatus: 502 }))
  })
})

/* ------------------------------------------------------------------ *
 * getEngineStatus / health (§5.8-6, §5.9-21/22)                       *
 * ------------------------------------------------------------------ */

describe('getEngineStatus / health (§5.8-6, §5.9-21/22)', () => {
  it('G22. getEngineStatus/health happy — both resolve to the same Ready HealthReport', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_READY) }),
    })
    const a = await proxy.getEngineStatus()
    const b = await proxy.health()
    expect(a).toEqual(V8_READY)
    expect(b).toEqual(a)
  })

  it('G23. Degraded is observed faithfully (not an error) — non-null lastError, never invented', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(V8_DEGRADED) }),
    })
    const report = await proxy.getEngineStatus()
    expect(report.state).toBe('Degraded')
    expect(report.lastError).toBe('a non-core subsystem (embedding/reranker) is unavailable')
  })

  it('F32. getEngineStatus with a malformed health report → EngineError (502)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse({ schemaVersion: 1, idFormat: 'opaque-string-v1', state: 'Ready' }) }),
    })
    await expect(proxy.getEngineStatus()).rejects.toMatchObject({ code: 'engine_error', httpStatus: 502 })
  })

  it('F33. getEngineStatus connection-refused → EngineUnavailable (503, cause connection-refused)', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: throwingFetch('ECONNREFUSED') })
    await expect(proxy.getEngineStatus()).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'connection-refused' })
  })
})

/* ------------------------------------------------------------------ *
 * waitForReady (§5.8-7, §5.9-23/24/25)                                *
 * ------------------------------------------------------------------ */

describe('waitForReady (§5.8-7, §5.9-23/24/25)', () => {
  it('G24. waitForReady happy — Starting then Ready → resolves to the Ready report', async () => {
    let calls = 0
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(calls++ === 0 ? reportWith('Starting') : V8_READY) }),
    })
    const report = await proxy.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 })
    expect(report.state).toBe('Ready')
  })

  it('G25. waitForReady keeps polling through Starting AND Degraded (both non-terminal)', async () => {
    const states = ['Starting', 'Degraded', 'Ready']
    let i = 0
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => {
        const s = states[i++]
        return jsonResponse(s === 'Degraded' ? V8_DEGRADED : reportWith(s))
      } }),
    })
    const report = await proxy.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 })
    expect(report.state).toBe('Ready')
  })

  it('F34. waitForReady when the state stays non-Ready past maxAttempts → EngineUnavailable (503, cause not-ready)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(reportWith('Starting')) }),
    })
    await expect(proxy.waitForReady({ pollIntervalMs: 1, maxAttempts: 3 })).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'not-ready' })
  })

  it('F35. waitForReady when the state becomes Unavailable → EngineUnavailable (503, cause unavailable-state)', async () => {
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: makeFetch({ 'GET /engine/status': () => jsonResponse(reportWith('Unavailable')) }),
    })
    await expect(proxy.waitForReady({ pollIntervalMs: 1, maxAttempts: 3 })).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'unavailable-state' })
  })

  it('F36. waitForReady connection-refused during polling → EngineUnavailable immediately (503, cause connection-refused); no retry', async () => {
    let calls = 0
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: async () => { calls++; throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } }) },
    })
    await expect(proxy.waitForReady({ pollIntervalMs: 1, maxAttempts: 10 })).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503, cause: 'connection-refused' })
    expect(calls).toBe(1)
  })
})

/* ------------------------------------------------------------------ *
 * Request timeout (§3a H4)                                            *
 * ------------------------------------------------------------------ */

describe('Request timeout (§3a H4)', () => {
  it('F37. a request that never resolves times out → EngineUnavailable (503)', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', requestTimeoutMs: 5, fetch: abortableFetch() })
    await expect(proxy.getEngineStatus()).rejects.toMatchObject({ code: 'engine_unavailable', httpStatus: 503 })
  })
})
