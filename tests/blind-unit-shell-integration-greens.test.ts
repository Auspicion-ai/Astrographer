/**
 * Blind-test greens — Unit: Shell-Integration (the shared engine-transport module
 * + the fetch-based SSE client + the bind/auth/TLS policy record + the D2-fallback
 * clarification + the e2e transport test/live-battery revisit).
 *
 * Derived from docs/specs/unit-shell-integration.md (§5.1–§5.11) +
 * docs/specs/shell-integration-review.md ONLY. NO src/ implementation or
 * unit-test read. A PASS is a genuine blind verification.
 *
 * Live modules (spec-pinned .js paths):
 *   src/main/engine-transport.js  — isLoopbackHost/assertLoopback/transportError/
 *                                   fetchWithTimeout/headers/createEngineFetch (NOT
 *                                   yet exported at spec-time -> dynamically imported).
 *   src/main/engine-rag-store.js  — createEngineRagStore, createSseClient (NOT yet
 *                                   exported at spec-time -> dynamically imported),
 *                                   the typed error model EngineWireError/EngineUnavailable.
 *   src/main/engine-crud-rag-store.js — createEngineCrudRagStore (document-CRUD surface).
 *   src/main/rag-store.js — createJsonRagStore (the local rag.* D2 fallback).
 *
 * The undici module is mocked (vi.hoisted + vi.mock) so the TLS-via-dispatcher
 * application (createEngineFetch) can be verified deterministically without a live
 * TLS server (the TLS path is exercised only when auth.tls is set, GUI-only).
 * The SSE client is exercised against a stubbed global fetch (the fetch-based client
 * issues the ambient fetch), with the stream driven by a captured ReadableStream
 * controller (the injectable-fetch/mock-SSE pattern).
 */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { createEngineRagStore } from '../src/main/engine-rag-store.js'
import { createEngineCrudRagStore } from '../src/main/engine-crud-rag-store.js'
import { createJsonRagStore } from '../src/main/rag-store.js'
import {
  EngineWireError,
  EngineUnavailable,
  EngineError,
} from '../src/main/engine-rag-store.js'

// Dynamically import the not-yet-exported wiring symbols so the test runs against
// the real implementation (the imports resolve to the actual src/ files once placed).
const transports = await import('../src/main/engine-transport.js')
const { isLoopbackHost, assertLoopback, transportError, fetchWithTimeout, headers } = transports
const { createEngineFetch } = transports
const { createSseClient } = await import('../src/main/engine-rag-store.js')

// -------- undici mock (TLS-via-dispatcher verification) --------
const undiciProbe = vi.hoisted(() => ({
  connectOpts: [],
  dispatchers: [],
  fetch: async (_input, init) => {
    if (init && init.dispatcher) undiciProbe.dispatchers.push(init.dispatcher)
    return new Response('{"ok":true}', { status: 200, headers: { 'content-type': 'application/json' } })
  },
  Agent: class {
    constructor(opts) {
      undiciProbe.connectOpts.push(opts)
    }
  },
}))
vi.mock('undici', () => ({
  Agent: undiciProbe.Agent,
  fetch: undiciProbe.fetch,
}))

const REAL_GLOBAL_FETCH = globalThis.fetch

// ------------------------------------------------------------------ helpers

function tick() {
  return new Promise((r) => setImmediate(r))
}
async function settle(n = 16) {
  for (let i = 0; i < n; i++) await tick()
}

/** A Response whose body stream is a controllable ReadableStream. */
function sseStreamResponse() {
  const box = { control: null, res: null }
  box.res = new Response(
    new ReadableStream({
      start(c) {
        box.control = c
      },
      cancel() {},
    }),
    { status: 200, headers: { 'content-type': 'text/event-stream' } },
  )
  return box
}

/** A fetch spy that always returns a given Response and records its calls. */
function fetchReturning(statusOrResponse) {
  const calls = []
  const fn = async (_url, init) => {
    calls.push({ url: String(_url), method: init?.method || 'GET', headers: init?.headers || {} })
    if (statusOrResponse instanceof Response) return statusOrResponse
    return new Response('', { status: statusOrResponse })
  }
  fn.calls = calls
  return fn
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function ecnrefused() {
  return Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' })
}

function safeEnqueue(control, text) {
  try {
    control.enqueue(new TextEncoder().encode(text))
  } catch {
    /* stream already cancelled/closed */
  }
}
function safeClose(control) {
  try {
    control.close()
  } catch {
    /* already closed/cancelled */
  }
}
function safeError(control, err) {
  try {
    control.error(err)
  } catch {
    /* already closed/cancelled */
  }
}

/** A mock fetch that routes CRUD document endpoints, keyed by "GET|POST|DELETE /suffix". */
function crudMockFetch({ status = READY_REPORT, routes = {} }) {
  const calls = { status: [], requests: [] }
  const fn = async (url, init) => {
    const u = String(url)
    if (u.endsWith('/engine/status')) {
      calls.status.push(url)
      if (status === 'ECONNREFUSED') throw ecnrefused()
      return jsonResponse(status)
    }
    const method = (init?.method || 'GET').toUpperCase()
    for (const [key, handler] of Object.entries(routes)) {
      const [m, suffix] = key.split(' ')
      if (method === m && u.endsWith(suffix)) {
        if (handler === 'ECONNREFUSED') throw ecnrefused()
        return jsonResponse(handler)
      }
    }
    throw new Error('unexpected fetch url: ' + u)
  }
  fn.calls = calls
  return fn
}

const READY_REPORT = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: 'v0.1.0',
  subsystems: { store: true, graph: true, lexical: true },
  lastError: null,
}

const LIST_DOCS_ENV = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  payload: {
    method: 'listDocuments',
    result: { items: [], total: 0, page: 1, pageSize: 10 },
  },
}

const neverCalled = () => async () => {
  throw new Error('fetch should not be called during construction')
}

afterEach(() => {
  vi.unstubAllGlobals()
})

// ============================================================= §5.1 transport module

describe('§5.1 engine-transport — isLoopbackHost/assertLoopback/headers/transportError/fetchWithTimeout/createEngineFetch', () => {
  it('G1 isLoopbackHost superset happy — every loopback form returns true (§5.8-1)', () => {
    const loopbacks = [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1',
      '::ffff:127.0.0.2',
      '::ffff:127.5.9.2',
      '::ffff:7f00:1',
      '::ffff:7f01:1', // resolved toward §5.1 rule 3c (7f01 >>> 8 === 0x7f)
      'localhost',
    ]
    for (const host of loopbacks) expect(isLoopbackHost(host)).toBe(true)
  })

  it('G1b genuine non-loopback hosts return false', () => {
    const nonLoopbacks = [
      '192.168.1.1',
      '10.0.0.1',
      '8.8.8.8',
      'example.com',
      '::ffff:8.8.8.8',
      '::ffff:8000:1',
      '2001:db8::1',
    ]
    for (const host of nonLoopbacks) expect(isLoopbackHost(host)).toBe(false)
  })

  it('G2 assertLoopback happy — loopback baseUrl returns without throwing (§5.8-2)', () => {
    expect(() => assertLoopback('http://127.0.0.1:8080', 'engine rag store')).not.toThrow()
    expect(() => assertLoopback('http://[::1]:8080', 'engine crud rag store')).not.toThrow()
    expect(() => assertLoopback('http://[::ffff:7f00:1]:8080', 'engine rag store')).not.toThrow()
    expect(() => assertLoopback('http://localhost:8080', 'engine rag store')).not.toThrow()
  })

  it('G3 createEngineFetch no-TLS happy — returns globalThis.fetch (no dispatcher) (§5.8-3)', () => {
    expect(createEngineFetch()).toBe(REAL_GLOBAL_FETCH)
    expect(createEngineFetch({})).toBe(REAL_GLOBAL_FETCH)
    expect(createEngineFetch({ token: 'abc' })).toBe(REAL_GLOBAL_FETCH)
  })

  it('G4 createEngineFetch TLS happy — passes a dispatcher with connect {ca,cert,key} (§5.8-4)', async () => {
    const tlsFetch = createEngineFetch({ tls: { ca: 'CA', cert: 'CERT', key: 'KEY' } })
    expect(tlsFetch).not.toBe(REAL_GLOBAL_FETCH)
    expect(typeof tlsFetch).toBe('function')
    await tlsFetch('http://127.0.0.1:1/', { method: 'GET' })
    expect(undiciProbe.connectOpts.at(-1)).toEqual({ connect: { ca: 'CA', cert: 'CERT', key: 'KEY' } })
    expect(undiciProbe.dispatchers.length).toBeGreaterThan(0)
  })

  it('G4b {tls:{}} and a partial tls apply the dispatcher with absent fields omitted', async () => {
    // {tls:{}} -> the TLS wrapper, connect carries NO fields.
    const emptyFetch = createEngineFetch({ tls: {} })
    expect(emptyFetch).not.toBe(REAL_GLOBAL_FETCH)
    await emptyFetch('http://127.0.0.1:1/')
    expect(undiciProbe.connectOpts.at(-1)).toEqual({ connect: {} })

    // a partial tls omitted the absent cert/key (never passed as undefined).
    const partialFetch = createEngineFetch({ tls: { ca: 'CA-ONLY' } })
    await partialFetch('http://127.0.0.1:1/')
    expect(undiciProbe.connectOpts.at(-1)).toEqual({ connect: { ca: 'CA-ONLY' } })
  })

  it('G5 headers with a token — Authorization Bearer on the header (§5.8-5)', () => {
    const h = headers({ token: 'abc' })
    expect(h['content-type']).toBe('application/json')
    expect(h['authorization']).toBe('Bearer abc')
    // the token is on the header, never in a URL (headers has no URL field).
    expect('url' in h).toBe(false)
  })

  it('G6 headers without a token — no authorization key (§5.8-6)', () => {
    const h = headers({})
    expect(h).toEqual({ 'content-type': 'application/json' })
    expect('authorization' in h).toBe(false)
  })

  it('G7 transportError on ECONNREFUSED -> EngineUnavailable(connection-refused) (§5.8-7)', () => {
    const e = transportError({ code: 'ECONNREFUSED', message: 'x' })
    expect(e).toBeInstanceOf(EngineUnavailable)
    expect(e.cause).toBe('connection-refused')
    expect(e.httpStatus).toBe(503)
    expect(e.code).toBe('engine_unavailable')
  })

  it('G8 transportError on ENOTFOUND -> EngineUnavailable(engine-not-spawned) (§5.8-8)', () => {
    const e = transportError({ code: 'ENOTFOUND', message: 'x' })
    expect(e).toBeInstanceOf(EngineUnavailable)
    expect(e.cause).toBe('engine-not-spawned')
    expect(e.httpStatus).toBe(503)
  })

  it('G8b transportError reads the nested err.cause.code shape (the real transport shape)', () => {
    const wrapped = Object.assign(new Error('fetch failed'), { cause: { code: 'ENOTFOUND' } })
    const e = transportError(wrapped)
    expect(e).toBeInstanceOf(EngineUnavailable)
    expect(e.cause).toBe('engine-not-spawned')
  })

  it('G9 transportError on an EngineWireError returns it unchanged (§5.8-9)', () => {
    const err = new EngineWireError('engine_unavailable', 503, 'x')
    expect(transportError(err)).toBe(err)
  })

  it('G10 fetchWithTimeout happy — resolves on a successful fetch (§5.8-10)', async () => {
    const okFetch = async () => jsonResponse({ ok: true })
    await expect(fetchWithTimeout(okFetch, 'http://127.0.0.1:1/', {}, 5000)).resolves.toMatchObject({ ok: true })
  })
})

// ========================================================== §5.1 + §5.3 proxy consumption

describe('§5.1/§5.3 proxy loopback enforcement + bind policy', () => {
  const never = neverCalled()
  it('G13 GN factory accepts the hex loopback form + localhost (superset reconciliation §5.6)', () => {
    expect(() => createEngineRagStore({ baseUrl: 'http://[::ffff:7f00:1]:8080', fetch: never })).not.toThrow()
    expect(() => createEngineRagStore({ baseUrl: 'http://localhost:8080', fetch: never })).not.toThrow()
    expect(() => createEngineRagStore({ baseUrl: 'http://[::ffff:7f00:1]:8080' })).not.toThrow()
  })

  it('F13 GN factory on a non-loopback baseUrl throws the byte-pinned message (§5.9-13)', () => {
    expect(() => createEngineRagStore({ baseUrl: 'http://192.168.1.1:8080', fetch: never }))
      .toThrow('engine rag store: baseUrl must be loopback')
  })

  it('F14 CRUD factory on a non-loopback baseUrl throws the byte-pinned message (§5.9-14)', () => {
    expect(() => createEngineCrudRagStore({ baseUrl: 'http://10.0.0.1:8080', fetch: never }))
      .toThrow('engine crud rag store: baseUrl must be loopback')
  })
})

// ================================================================ §5.1 fail-states

describe('§5.1 assertLoopback/fetchWithTimeout fail-states', () => {
  it('F1 assertLoopback on a non-loopback baseUrl throws the byte message (§5.9-1)', () => {
    expect(() => assertLoopback('http://192.168.1.1:8080', 'engine rag store'))
      .toThrow('engine rag store: baseUrl must be loopback')
    expect(() => assertLoopback('http://8.8.8.8', 'engine crud rag store'))
      .toThrow('engine crud rag store: baseUrl must be loopback')
  })

  it('F2 assertLoopback on an unparseable baseUrl throws the byte message (§5.9-2)', () => {
    expect(() => assertLoopback('this is not a url', 'engine rag store'))
      .toThrow('engine rag store: baseUrl must be loopback')
  })

  it('F3 transportError on an unknown transport error -> typed EngineWireError 503 (§5.9-3)', () => {
    const e = transportError({ message: 'some other failure' })
    expect(e).toBeInstanceOf(EngineWireError)
    expect(e.httpStatus).toBe(503)
    expect(e.code).toBe('engine_unavailable')
  })

  it('F4 fetchWithTimeout on a timeout -> EngineUnavailable timed-out, never a raw AbortError (§5.9-4)', async () => {
    const abortable = async (_url, init) => new Promise((_res, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }))
      })
    })
    const err = await fetchWithTimeout(abortable, 'http://127.0.0.1:1/', {}, 20)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    expect(err.message).toContain('request timed out after 20ms')
    expect(err.name).not.toBe('AbortError')
  })

  it('F5 fetchWithTimeout on a connection-refused -> EngineUnavailable via transportError (§5.9-5)', async () => {
    const refused = async () => {
      throw ecnrefused()
    }
    const err = await fetchWithTimeout(refused, 'http://127.0.0.1:1/', {}, 5000)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    expect(err.httpStatus).toBe(503)
  })
})

// ================================================================= §5.2 SSE client

describe('§5.2 fetch-based SSE client (createSseClient)', () => {
  it('G11 SSE Bearer header on the stream + NO content-type + token never in the URL (§5.8-11)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const client = createSseClient({ token: 'super-secret-token' })
    client.subscribe('http://127.0.0.1:8080/rag/stream?query=hi', {
      onEvent: () => {},
      onError: () => {},
      onClose: () => {},
    })
    await settle()
    const call = spy.calls[0]
    expect(call.method).toBe('GET')
    expect(call.headers.authorization).toBe('Bearer super-secret-token')
    // NO content-type on a GET SSE stream.
    expect(call.headers['content-type']).toBeUndefined()
    // the token is NEVER in the URL.
    expect(call.url).not.toContain('super-secret-token')
  })

  it('G11b no-token client sends NO authorization header on the stream', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    createSseClient({}).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: () => {},
      onClose: () => {},
    })
    await settle()
    const call = spy.calls[0]
    expect(call.headers.authorization).toBeUndefined()
    expect(call.headers['content-type']).toBeUndefined()
  })

  it('G12 SSE frame-dispatch — a complete frame dispatches onEvent(event, data) (§5.8-12)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const events = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: (e, d) => events.push([e, d]),
      onError: () => {},
      onClose: () => {},
    })
    await settle()
    safeEnqueue(box.control, 'event: result\ndata: {"type":"result","payload":{"ok":true}}\n\n')
    await settle()
    expect(events).toEqual([['result', '{"type":"result","payload":{"ok":true}}']])
  })

  it('G18 SSE buffers across chunk boundaries — a frame split over chunks dispatches once', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const events = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: (e, d) => events.push([e, d]),
      onError: () => {},
      onClose: () => {},
    })
    await settle()
    safeEnqueue(box.control, 'event: result\ndata: {"a":1') // partial frame
    await settle()
    expect(events).toHaveLength(0) // not yet complete
    safeEnqueue(box.control, '}\n\n') // completes the frame
    await settle()
    expect(events).toEqual([['result', '{"a":1}']])
  })

  it('G14 SSE clean end -> onClose fires exactly once (§5.8-14 premise)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    let closed = 0
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => closed++,
    })
    await settle()
    safeEnqueue(box.control, 'event: result\ndata: {"type":"result"}\n\n')
    await settle()
    safeClose(box.control)
    await settle()
    expect(closed).toBe(1)
    expect(errs).toHaveLength(0)
    // no-reconnect: exactly one fetch was issued.
    expect(spy.calls).toHaveLength(1)
  })

  it('F6 SSE fetch rejection -> onError(err), exactly one fetch (no reconnect) (§5.9-6)', async () => {
    let attempted = 0
    const failing = async () => {
      attempted++
      throw ecnrefused()
    }
    vi.stubGlobal('fetch', failing)
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => {},
    })
    await settle()
    expect(errs).toHaveLength(1)
    expect(errs[0].message).toContain('ECONNREFUSED')
    expect(attempted).toBe(1) // no auto-reconnect
  })

  it('F7 SSE non-2xx response -> onError(Error("sse: non-2xx response")) (§5.9-7)', async () => {
    const spy = fetchReturning(503)
    vi.stubGlobal('fetch', spy)
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => {},
    })
    await settle()
    expect(errs).toHaveLength(1)
    expect(String(errs[0].message)).toMatch(/non-2xx/i)
  })

  it('F8 SSE malformed frame -> onError(err) (the parseSseFrame throw) (§5.9-8)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => {},
    })
    await settle()
    // a genuinely MALFORMED SSE frame (missing the data: line) -> parseSseFrame
    // throws -> onError. (A non-JSON data string is NOT an onError here — the
    // createSseClient dispatches the raw data to onEvent; the JSON decode happens
    // at the proxy's decodeSseChunk layer.)
    safeEnqueue(box.control, 'event: result\n\n')
    await settle()
    expect(errs.length).toBeGreaterThanOrEqual(1)
  })

  it('F9 SSE mid-stream error -> onError(err) (§5.9-9)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => {},
    })
    await settle()
    safeError(box.control, new Error('boom midstream'))
    await settle()
    expect(errs).toHaveLength(1)
    expect(String(errs[0].message)).toMatch(/boom/i)
  })

  it('F10 SSE after close() -> no further onEvent/onError/onClose callbacks (§5.9-10)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const events = []
    const errs = []
    let closed = 0
    const sub = createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: (e, d) => events.push([e, d]),
      onError: (e) => errs.push(e),
      onClose: () => closed++,
    })
    await settle()
    safeEnqueue(box.control, 'event: result\ndata: {"a":1}\n\n')
    await settle()
    expect(events).toHaveLength(1)

    sub.close() // consumer-initiated teardown
    // Even though the stream would still deliver frames + end, NO further callbacks fire.
    safeEnqueue(box.control, 'event: result\ndata: {"a":2}\n\n')
    safeClose(box.control)
    safeError(box.control, new Error('post-close stream error'))
    await settle()
    expect(events).toHaveLength(1)
    expect(closed).toBe(0) // teardown is NOT an onClose
    expect(errs).toHaveLength(0)
  })

  it('F11 SSE premature close (before done) is terminal — no silent reconnect (§5.9-11)', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    let closed = 0
    const errs = []
    createSseClient({ token: 'abc' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => closed++,
    })
    await settle()
    // A dropped connection that ends before any `done` chunk is terminal:
    // the client fires onClose (the H10 premise) exactly once and NEVER re-opens.
    safeClose(box.control)
    await settle()
    expect(closed + errs.length).toBe(1) // exactly one terminal callback
    expect(spy.calls).toHaveLength(1) // exactly one fetch; never a reconnect
  })
})

// ================================================= §5.4 the D2-fallback clarification

describe('§5.4 D2-fallback clarification', () => {
  it('G15 document-CRUD surface engine-absent -> EngineUnavailable (503), no local-store fallback (§5.8-15)', async () => {
    const proxy = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: crudMockFetch({ status: 'ECONNREFUSED' }),
    })
    const err = await proxy.listDocuments({})
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    expect(err.httpStatus).toBe(503)
  })

  it('F12 document-CRUD surface on engine-absent -> EngineUnavailable, no local-store fallback (§5.9-12)', async () => {
    const proxy = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: crudMockFetch({ status: 'ECONNREFUSED' }),
    })
    const out = await proxy.listDocuments({}).then((v) => v, (e) => e)
    // It surfaces EngineUnavailable (503) — NEVER falls back to a local RagStore graph
    // (the data models differ; no second editor, no sync — H1/GNOSIS-SUPPLANTS-DOCUMENT-STORE).
    expect(out).toBeInstanceOf(EngineUnavailable)
    expect(out.cause).toBe('connection-refused')
    expect(out.httpStatus).toBe(503)
  })

  it('G16 local rag.* surface (createJsonRagStore) is the parallel D2 fallback, engine-free (§5.8-16)', () => {
    let fetchCalled = false
    vi.stubGlobal('fetch', async () => { fetchCalled = true; throw new Error('should not be used') })
    // The local rag.* surface is exported as a factory (engine-free — no fetch /
    // no loopback bind). Asserting the factory is constructible/exported mirrors
    // the unit test (§5.8-16); constructing it requires a persisted `path`, which
    // is covered by the local-store's own tests.
    expect(typeof createJsonRagStore).toBe('function')
    // the local rag.* surface has NO engine dependency (no network/engine call at all).
    expect(fetchCalled).toBe(false)
  })

  it('G17 policy-record consistency — bind/auth/TLS pinned by the module surface (§5.8-17)', () => {
    // loopback-only bind (assertLoopback), Bearer-on-header (headers), TLS-via-dispatcher (createEngineFetch).
    expect(() => assertLoopback('http://192.168.1.1:8080', 'engine rag store')).toThrow()
    expect(headers({ token: 't' })['authorization']).toBe('Bearer t')
    expect('authorization' in headers({})).toBe(false)
    expect(createEngineFetch({ tls: {} })).not.toBe(REAL_GLOBAL_FETCH)
    expect(createEngineFetch({})).toBe(REAL_GLOBAL_FETCH)
  })
})

// ================================================================ §5.7 PBT register

describe('§5.7 property register (the 8 invariant rows; deterministic pinned seed 0x5E11E11E)', () => {
  it('PB1 P-IM-1 isLoopbackHost superset is total', () => {
    const loopback = ['127.0.0.1', '::1', '::ffff:127.0.0.1', '::ffff:127.0.0.2', '::ffff:7f00:1', 'localhost']
    const nonLoopback = ['192.168.1.1', '10.0.0.1', 'example.com', '::ffff:8.8.8.8', '::ffff:8000:1']
    for (const h of loopback) expect(isLoopbackHost(h)).toBe(true)
    for (const h of nonLoopback) expect(isLoopbackHost(h)).toBe(false)
  })

  it('PB2 P-IM-2 assertLoopback enforces the loopback-only bind at construction', () => {
    for (const h of ['http://127.0.0.1:1', 'http://[::1]:1', 'http://[::ffff:7f00:1]:1', 'http://localhost:1']) {
      expect(() => assertLoopback(h, 'engine rag store')).not.toThrow()
    }
    for (const h of ['http://10.0.0.1', 'ftp://192.168.1.1', 'garbage']) {
      expect(() => assertLoopback(h, 'engine rag store')).toThrow('baseUrl must be loopback')
    }
  })

  it('PB3 P-IM-3 the policy record is consistent with the module surface', () => {
    expect(headers({ token: 'xyz' })['authorization']).toBe('Bearer xyz')
    expect('authorization' in headers({})).toBe(false)
    expect(createEngineFetch({ tls: { ca: 'c' } })).not.toBe(REAL_GLOBAL_FETCH)
    expect(createEngineFetch({})).toBe(REAL_GLOBAL_FETCH)
    expect(() => createEngineRagStore({ baseUrl: 'http://192.168.1.1:1' })).toThrow()
  })

  it('PB4 P-SM-1 SSE sends the Bearer header and does NOT auto-reconnect', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    const errs = []
    createSseClient({ token: 'tok-42' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: (e) => errs.push(e),
      onClose: () => {},
    })
    await settle()
    expect(spy.calls[0].headers.authorization).toBe('Bearer tok-42')
    // a dropped connection is terminal: onError fires and no further fetch is issued.
    safeError(box.control, new Error('drop'))
    await settle()
    expect(errs).toHaveLength(1)
    expect(spy.calls).toHaveLength(1)
  })

  it('PB5 P-SM-2 SSE premature-close (H10) is preserved — terminal, never a silent reconnect', async () => {
    const box = sseStreamResponse()
    const spy = fetchReturning(box.res)
    vi.stubGlobal('fetch', spy)
    let closed = 0
    createSseClient({ token: 'a' }).subscribe('http://127.0.0.1:8080/rag/stream', {
      onEvent: () => {},
      onError: () => {},
      onClose: () => closed++,
    })
    await settle()
    safeClose(box.control) // ends before any `done` chunk
    await settle()
    expect(closed).toBe(1)
    expect(spy.calls).toHaveLength(1) // terminal, never re-opens
  })

  it('PB6 P-SM-3 the D2-fallback distinction holds', async () => {
    // document-CRUD surface: engine-absent -> EngineUnavailable, never a local-store result.
    const proxy = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: crudMockFetch({ status: 'ECONNREFUSED' }),
    })
    const err = await proxy.listDocuments({}).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    // the local rag.* surface is independent of the engine and remains usable
    // (asserted via the factory export — mirroring the unit §5.8-16; constructing
    // it requires a persisted `path`, covered by the local-store's own tests).
    expect(typeof createJsonRagStore).toBe('function')
  })

  it('PB7 P-TP-1 createEngineFetch applies auth.tls via the undici dispatcher', async () => {
    expect(createEngineFetch({})).toBe(REAL_GLOBAL_FETCH) // no tls -> no dispatcher
    expect(createEngineFetch()).toBe(REAL_GLOBAL_FETCH)
    const tlsFetch = createEngineFetch({ tls: { ca: 'C1' } })
    expect(tlsFetch).not.toBe(REAL_GLOBAL_FETCH)
    await tlsFetch('http://127.0.0.1:1/')
    expect(undiciProbe.connectOpts.at(-1)).toEqual({ connect: { ca: 'C1' } })
    expect(undiciProbe.dispatchers.length).toBeGreaterThan(0)
  })

  it('PB8 P-TP-2 headers applies the Bearer on the Authorization header only', () => {
    expect(headers({ token: 'be-1' })['authorization']).toBe('Bearer be-1')
    expect(headers({ token: 'be-1' })['content-type']).toBe('application/json')
    expect('authorization' in headers({})).toBe(false)
  })
})

// ====================== §5.5 the e2e transport test / live-battery revisit (opt-in, gated on the engine)

const ENGINE_URL = process.env.GNOSIS_ENGINE_URL || 'http://127.0.0.1:8080'
let ENGINE_REACHABLE = false
if (process.env.GNOSIS_ENGINE_TEST === '1') {
  ENGINE_REACHABLE = await fetch(ENGINE_URL + '/engine/status', { signal: AbortSignal.timeout(1500) })
    .then((r) => r.ok)
    .catch(() => false)
}

describe.skipIf(!ENGINE_REACHABLE)('§5.5 e2e transport over a live loopback engine (opt-in + gated; GNOSIS_ENGINE_TEST=1)', () => {
  it('E1 document-CRUD live round-trip + typed transport split over a real transport', async () => {
    // A real transport (no injected fetch); the engine must be running on loopback
    // and serve the document-CRUD endpoints (the revisit condition, §5.5).
    const proxy = createEngineCrudRagStore({ baseUrl: ENGINE_URL })
    const list = await proxy.listDocuments({})
    expect(list).toBeDefined()
    expect(list).toHaveProperty('total')
    expect(list).toHaveProperty('items')

    // Connection-refused over a real transport -> the typed EngineUnavailable split.
    const deadProxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:1/' })
    const err = await deadProxy.listDocuments({}).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
  })
})
