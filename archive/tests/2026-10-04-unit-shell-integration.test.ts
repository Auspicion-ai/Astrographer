// tests/unit-shell-integration.test.ts — Unit shell-integration (the re-scoped
// Option B): the shared `src/main/engine-transport.ts` module (the 5 extracted
// transport helpers + `createEngineFetch(auth)`), the fetch-based SSE client
// (`createSseClient(auth)`), the bind/auth/TLS policy record, the D2-fallback
// clarification, and the e2e transport test / live-battery revisit.
// (docs/specs/unit-shell-integration.md §5.8 happy-path states (17) + §5.9
// fail-states (14) + the pinned non-throws + §5.1 the engine-transport module
// surface + §5.2 the fetch-based SSE client + §5.3 the policy record + §5.4 the
// D2-fallback clarification + §5.5 the e2e transport test.)
//
// The RED set — the NOT-YET-IMPLEMENTED surfaces:
//   - the `src/main/engine-transport.ts` module (isLoopbackHost / assertLoopback
//     / transportError / fetchWithTimeout / headers / createEngineFetch)
//   - the fetch-based SSE client factory `createSseClient(auth)`
// ALREADY-GREEN (exercises only the LANDED proxies + the LANDED error model):
//   - the GN/CRUD factory loopback enforcement (§5.9-13/14)
//   - the document-CRUD engine-absent `EngineUnavailable` surface (§5.8-15,
//     §5.9-12)
//   - the local `rag.*` D2 fallback surface (§5.8-16)
//   - the `opts.fetch` injectable seam (the pinned non-throw)
//
// ADVERSARIAL REGRESSIONS added in this write (H1 + H2 + H3):
//   - H1: the SSE GET's captured init.headers contains NO `content-type` key
//     (both with and without a token) — §5.2: the SSE GET carries ONLY
//     `authorization: Bearer <token>` when a token is set.
//   - H2: `createEngineFetch({ tls: {} })` — `!auth?.tls` treats an empty-but-
//     truthy `tls: {}` as set → the TLS wrapper (pinned per §5.1).
//   - H3: direct `createEngineRagStore({ baseUrl: 'http://[::ffff:7f00:1]:8080' })`
//     no-throw — the GN factory accepts the hex IPv4-mapped form via the shared
//     superset (§5.1 amendment 1).
//
// Conventions follow tests/unit-a2-document-crud-wiring.test.ts (vitest node
// environment, `.js` import suffix for main-process ESM modules, injected mock
// fetch over the real proxies, dynamic `import()` for the not-yet-exported
// wiring symbols so the already-green proxy tests still run and are reported
// separately).
import { describe, it, expect } from 'vitest'
import {
  createEngineRagStore,
  EngineWireError,
  EngineUnavailable,
  ENGINE_ENDPOINTS,
} from '../src/main/engine-rag-store.js'
import {
  createEngineCrudRagStore,
  type Document,
} from '../src/main/engine-crud-rag-store.js'
import { createJsonRagStore } from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// The pinned shell-integration surfaces (defined here — the exports do not
// exist yet) so the red calls type-check cleanly.
// ---------------------------------------------------------------------------

/** The unchanged `SseClient` interface (§5.2 — pinned). */
interface SseClient {
  subscribe(
    url: string,
    handlers: {
      onEvent: (event: string, data: string) => void
      onError: (err: unknown) => void
      onClose: () => void
    },
  ): { close(): void }
}

/** The `engine-transport.ts` module surface (§5.1 — pinned). */
interface EngineTransport {
  isLoopbackHost(host: string): boolean
  assertLoopback(baseUrl: string, prefix: string): void
  transportError(err: unknown): unknown
  fetchWithTimeout(
    fetchImpl: typeof fetch,
    url: string,
    init: RequestInit,
    requestTimeoutMs: number,
  ): Promise<Response>
  headers(auth?: { token?: string }): Record<string, string>
  createEngineFetch(
    auth?: { token?: string; tls?: { ca?: string; cert?: string; key?: string } },
  ): typeof fetch
}

// ---------------------------------------------------------------------------
// The red-surface dynamic loaders. Each returns the wiring symbol or throws a
// CLEAR "not implemented (wiring RED)" marker so the red reason is explicit.
// ---------------------------------------------------------------------------
async function loadEngineTransport(): Promise<EngineTransport> {
  const mod: any = await import('../src/main/engine-transport.js')
  const missing: string[] = []
  for (const name of [
    'isLoopbackHost',
    'assertLoopback',
    'transportError',
    'fetchWithTimeout',
    'headers',
    'createEngineFetch',
  ]) {
    if (typeof mod[name] !== 'function') missing.push(name)
  }
  if (missing.length > 0) {
    throw new Error(
      `${missing.join(', ')} not implemented (wiring RED — needs the Implementer)`,
    )
  }
  return mod as EngineTransport
}

async function loadSseClient(): Promise<(auth?: { token?: string }) => SseClient> {
  const mod: any = await import('../src/main/engine-rag-store.js')
  if (typeof mod.createSseClient !== 'function') {
    throw new Error('createSseClient not implemented (wiring RED — needs the Implementer)')
  }
  return mod.createSseClient as (auth?: { token?: string }) => SseClient
}

// ---------------------------------------------------------------------------
// Mock-transport helpers (replicas of the unit-a1/a2 greens, per §5.6).
// ---------------------------------------------------------------------------
type FetchHandler = (method: string, url: string, init?: RequestInit) => Response | Promise<Response>

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

function crudResponseEnvelope(payload: unknown): unknown {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload }
}

function refusedError(): Error {
  const e: any = new Error('connect ECONNREFUSED 127.0.0.1:8080')
  e.code = 'ECONNREFUSED'
  return e
}

const READY_REPORT = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: '…',
  subsystems: {
    store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true,
  },
  lastError: null,
}

const DOC_WIRE = {
  document_id: 'd1',
  wiki_id: 'w1',
  revision: 0,
  state: 'Draft',
  graph: { nodes: [], edges: [] },
  title: 'Getting Started',
  created_at: '2026-09-09T00:00:00Z',
  updated_at: '2026-09-09T00:00:00Z',
  tags: ['guide'],
  author: 'alice',
}

const DOC_TYPED: Document = {
  documentId: 'd1',
  wikiId: 'w1',
  revision: 0,
  state: 'Draft',
  graph: { nodes: [], edges: [] },
  title: 'Getting Started',
  createdAt: '2026-09-09T00:00:00Z',
  updatedAt: '2026-09-09T00:00:00Z',
  tags: ['guide'],
  author: 'alice',
}

/** Await a promise and return the rejection (throws if it resolves). */
async function captureError(p: Promise<unknown>): Promise<unknown> {
  try {
    await p
  } catch (e) {
    return e
  }
  throw new Error('expected the promise to reject')
}

/** A small async settle delay for the stream-consuming SSE client. */
function settle(ms = 20): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** An SSE `text/event-stream` Response whose body emits the given frames. */
function sseResponse(frames: string[], status = 200): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const f of frames) controller.enqueue(encoder.encode(f))
      controller.close()
    },
  })
  return new Response(stream, {
    status,
    headers: { 'content-type': 'text/event-stream' },
  })
}

// ===========================================================================
// §5.1 — the `engine-transport.ts` module surface (RED until implemented).
// ===========================================================================
describe('engine-transport.ts — the shared transport module (RED until implemented)', () => {
  it('exports the 5 extracted helpers + createEngineFetch', async () => {
    await expect(loadEngineTransport()).resolves.toBeTruthy()
  })

  // --- §5.8 happy state 1 — the isLoopbackHost superset totality ---
  it('§5.8-1 isLoopbackHost superset happy: every loopback form returns true', async () => {
    const { isLoopbackHost } = await loadEngineTransport()
    for (const host of [
      '127.0.0.1',
      '::1',
      '::ffff:127.0.0.1',
      '::ffff:127.0.0.2',
      '::ffff:7f00:1', // the hex form (amendment 1)
      '::ffff:7f01:1', // the hex `::ffff:127.1.0.1` form — ALSO in the 127/8 loopback block (spec §5.1 pinned code accepts it)
      'localhost',
    ]) {
      expect(isLoopbackHost(host), `host ${host}`).toBe(true)
    }
  })
  it('isLoopbackHost superset: non-loopback hosts return false', async () => {
    const { isLoopbackHost } = await loadEngineTransport()
    for (const host of [
      '192.168.1.1',
      '10.0.0.1',
      'example.com',
      '::ffff:8.8.8.8',
      '::ffff:8000:1', // hex non-loopback: first 16 bits 0x8000 → 128, NOT 0x7f
      '::ffff:7e00:1', // hex non-loopback: first 16 bits 0x7e00 → 126, NOT 0x7f
    ]) {
      expect(isLoopbackHost(host), `host ${host}`).toBe(false)
    }
  })

  // --- §5.8 happy state 2 + §5.9 fail-states 1–2 — assertLoopback ---
  it('§5.8-2 assertLoopback happy: loopback baseUrls return without throwing', async () => {
    const { assertLoopback } = await loadEngineTransport()
    expect(() => assertLoopback('http://127.0.0.1:8080', 'engine rag store')).not.toThrow()
    expect(() => assertLoopback('http://[::1]:8080', 'engine crud rag store')).not.toThrow()
    expect(() => assertLoopback('http://[::ffff:7f00:1]:8080', 'engine rag store')).not.toThrow()
  })
  it('§5.9-1 assertLoopback on a non-loopback baseUrl throws the byte-pinned message', async () => {
    const { assertLoopback } = await loadEngineTransport()
    expect(() => assertLoopback('http://192.168.1.1:8080', 'engine rag store')).toThrow(
      'engine rag store: baseUrl must be loopback',
    )
    expect(() => assertLoopback('http://10.0.0.1:8080', 'engine crud rag store')).toThrow(
      'engine crud rag store: baseUrl must be loopback',
    )
  })
  it('§5.9-2 assertLoopback on an unparseable baseUrl throws the byte-pinned message', async () => {
    const { assertLoopback } = await loadEngineTransport()
    expect(() => assertLoopback('not a url', 'engine rag store')).toThrow(
      'engine rag store: baseUrl must be loopback',
    )
  })

  // --- §5.8 happy states 3–4 — createEngineFetch (the TLS application) ---
  it('§5.8-3 createEngineFetch no-TLS happy: returns globalThis.fetch (no dispatcher)', async () => {
    const { createEngineFetch } = await loadEngineTransport()
    expect(createEngineFetch({})).toBe(globalThis.fetch)
    expect(createEngineFetch()).toBe(globalThis.fetch)
  })
  it('§5.8-4 createEngineFetch TLS happy: returns a wrapper (not globalThis.fetch) with the standard fetch signature', async () => {
    const { createEngineFetch } = await loadEngineTransport()
    const tlsFetch = createEngineFetch({ tls: { ca: 'ca', cert: 'cert', key: 'key' } })
    expect(tlsFetch).not.toBe(globalThis.fetch)
    expect(typeof tlsFetch).toBe('function')
    // the returned function has the standard fetch signature (callable with a URL + init)
    expect(tlsFetch.length).toBeGreaterThanOrEqual(1)
  })
  it('adversarial H2 edge: createEngineFetch({ tls: {} }) treats an empty-but-truthy tls as set → the TLS wrapper', async () => {
    const { createEngineFetch } = await loadEngineTransport()
    // §5.1 pinned: `if (!auth?.tls) return globalThis.fetch`. auth.tls === {}
    // is truthy, so `!auth?.tls` is false → the TLS path is taken (an undici
    // Agent with an EMPTY connect). The no-TLS return applies ONLY when
    // auth.tls is absent/undefined.
    const edge = createEngineFetch({ tls: {} })
    expect(edge).not.toBe(globalThis.fetch)
    expect(typeof edge).toBe('function')
  })

  // --- §5.8 happy states 5–6 — headers ---
  it('§5.8-5 headers with a token happy: Bearer on the Authorization header', async () => {
    const { headers } = await loadEngineTransport()
    expect(headers({ token: 'abc' })).toEqual({
      'content-type': 'application/json',
      authorization: 'Bearer abc',
    })
  })
  it('§5.8-6 headers without a token happy: no authorization key', async () => {
    const { headers } = await loadEngineTransport()
    expect(headers({})).toEqual({ 'content-type': 'application/json' })
    expect('authorization' in headers({})).toBe(false)
  })

  // --- §5.8 happy states 7–9 + §5.9 fail-state 3 — transportError ---
  it('§5.8-7 transportError on ECONNREFUSED → EngineUnavailable(connection-refused)', async () => {
    const { transportError } = await loadEngineTransport()
    const err = transportError({ code: 'ECONNREFUSED', message: 'x' })
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })
  it('§5.8-8 transportError on ENOTFOUND → EngineUnavailable(engine-not-spawned)', async () => {
    const { transportError } = await loadEngineTransport()
    const err = transportError({ code: 'ENOTFOUND', message: 'x' })
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('engine-not-spawned')
  })
  it('§5.8-9 transportError on an EngineWireError returns it unchanged', async () => {
    const { transportError } = await loadEngineTransport()
    const wire = new EngineWireError('engine_unavailable', 503, 'x')
    expect(transportError(wire)).toBe(wire)
  })
  it('transportError reads the nested err.cause.code shape (the real transport shape)', async () => {
    const { transportError } = await loadEngineTransport()
    const nested: any = new Error('fetch failed')
    nested.cause = { code: 'ECONNREFUSED', message: 'x' }
    const err = transportError(nested)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })
  it('§5.9-3 transportError on an unknown transport error → typed EngineWireError (503)', async () => {
    const { transportError } = await loadEngineTransport()
    const err = transportError({ message: 'boom' })
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(503)
  })

  // --- §5.8 happy state 10 + §5.9 fail-states 4–5 — fetchWithTimeout ---
  it('§5.8-10 fetchWithTimeout happy: resolves on a successful fetch (the timer is cleared)', async () => {
    const { fetchWithTimeout } = await loadEngineTransport()
    const okFetch = (async () => new Response('ok')) as typeof fetch
    const res = await fetchWithTimeout(okFetch, 'http://x', {}, 10_000)
    expect(res).toBeInstanceOf(Response)
  })
  it('§5.9-4 fetchWithTimeout on a timeout → EngineUnavailable(connection-refused, request timed out after Nms)', async () => {
    const { fetchWithTimeout } = await loadEngineTransport()
    const neverFetch = (async (_input: any, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      })
    }) as typeof fetch
    const err = await captureError(fetchWithTimeout(neverFetch, 'http://x', {}, 10))
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
    expect(String((err as Error).message)).toMatch(/request timed out after 10ms/)
  })
  it('§5.9-5 fetchWithTimeout on a connection-refused → EngineUnavailable(connection-refused)', async () => {
    const { fetchWithTimeout } = await loadEngineTransport()
    const refusedFetch = (async () => {
      throw refusedError()
    }) as typeof fetch
    const err = await captureError(fetchWithTimeout(refusedFetch, 'http://x', {}, 10_000))
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })
})

// ===========================================================================
// §5.2 — the fetch-based SSE client (RED until implemented).
// ===========================================================================
describe('createSseClient — the fetch-based SSE client (RED until implemented)', () => {
  it('exports createSseClient (the fetch-based SSE client factory)', async () => {
    await expect(loadSseClient()).resolves.toBeTypeOf('function')
  })

  // --- §5.8 happy state 11 — the Bearer header on the stream ---
  it('§5.8-11 Bearer-header happy: subscribe issues a fetch with authorization: Bearer <token>', async () => {
    const createSseClient = await loadSseClient()
    let capturedHeaders: Record<string, string> | undefined
    const orig = globalThis.fetch
    globalThis.fetch = (async (_input: any, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return sseResponse([])
    }) as typeof fetch
    try {
      const sse = createSseClient({ token: 'abc' })
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(capturedHeaders).toMatchObject({ authorization: 'Bearer abc' })
    } finally {
      globalThis.fetch = orig
    }
  })

  // --- adversarial H1 regression — NO content-type on the SSE GET ---
  it('adversarial H1 regression: the SSE GET request headers contain NO content-type key (with a token)', async () => {
    const createSseClient = await loadSseClient()
    let capturedHeaders: Record<string, string> | undefined
    const orig = globalThis.fetch
    globalThis.fetch = (async (_input: any, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return sseResponse([])
    }) as typeof fetch
    try {
      const sse = createSseClient({ token: 'abc' })
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(capturedHeaders).toBeTruthy()
      // §5.2: the SSE GET carries ONLY authorization: Bearer <token> when a
      // token is set, and NO content-type header (a GET stream needs none).
      expect('content-type' in (capturedHeaders as any)).toBe(false)
      expect(capturedHeaders?.['authorization']).toBe('Bearer abc')
    } finally {
      globalThis.fetch = orig
    }
  })
  it('adversarial H1 regression: the SSE GET request headers contain NO content-type key (without a token)', async () => {
    const createSseClient = await loadSseClient()
    let capturedHeaders: Record<string, string> | undefined
    const orig = globalThis.fetch
    globalThis.fetch = (async (_input: any, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>
      return sseResponse([])
    }) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(capturedHeaders).toBeTruthy()
      // §5.2: with no token the SSE GET carries NO authorization and NO
      // content-type header (an empty header object).
      expect('content-type' in (capturedHeaders as any)).toBe(false)
      expect('authorization' in (capturedHeaders as any)).toBe(false)
    } finally {
      globalThis.fetch = orig
    }
  })

  // --- §5.8 happy state 12 — the frame dispatch ---
  it('§5.8-12 frame-dispatch happy: reads event/data frames and dispatches onEvent', async () => {
    const createSseClient = await loadSseClient()
    const events: Array<[string, string]> = []
    const orig = globalThis.fetch
    globalThis.fetch = (async () =>
      sseResponse(['event: result\ndata: {"type":"result"}\n\n'])) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: (e, d) => events.push([e, d]),
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(events).toEqual([['result', '{"type":"result"}']])
    } finally {
      globalThis.fetch = orig
    }
  })

  // --- §5.8 happy state 13 — the no-reconnect contract ---
  it('§5.8-13 no-reconnect happy: a dropped connection is terminal — exactly one fetch, no re-open', async () => {
    const createSseClient = await loadSseClient()
    let fetchCount = 0
    const orig = globalThis.fetch
    globalThis.fetch = (async () => {
      fetchCount++
      return sseResponse([])
    }) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(fetchCount).toBe(1)
    } finally {
      globalThis.fetch = orig
    }
  })

  // --- §5.8 happy state 14 — the H10 premature-close client-side contract ---
  it('§5.8-14 H10 premature-close: a stream ending before a done chunk fires onClose (never a silent reconnect)', async () => {
    const createSseClient = await loadSseClient()
    let closed = false
    let errored = false
    const orig = globalThis.fetch
    globalThis.fetch = (async () =>
      sseResponse(['event: result\ndata: {"type":"result"}\n\n'])) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: () => {
          errored = true
        },
        onClose: () => {
          closed = true
        },
      })
      await settle()
      // the client-side H10 contract: the premature close is surfaced (onClose
      // or onError), never a silent reconnect — the proxy's landed ragStream
      // onClose handler converts this to EngineUnavailable.
      expect(closed || errored).toBe(true)
    } finally {
      globalThis.fetch = orig
    }
  })

  // --- §5.9 fail-states 6–10 ---
  it('§5.9-6 fetch rejection → onError(err)', async () => {
    const createSseClient = await loadSseClient()
    const errors: unknown[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async () => {
      throw refusedError()
    }) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: (e) => errors.push(e),
        onClose: () => {},
      })
      await settle()
      expect(errors).toHaveLength(1)
    } finally {
      globalThis.fetch = orig
    }
  })
  it('§5.9-7 non-2xx response → onError(new Error("sse: non-2xx response"))', async () => {
    const createSseClient = await loadSseClient()
    const errors: unknown[] = []
    const orig = globalThis.fetch
    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: (e) => errors.push(e),
        onClose: () => {},
      })
      await settle()
      expect(errors).toHaveLength(1)
      expect(String(errors[0])).toMatch(/non-2xx/)
    } finally {
      globalThis.fetch = orig
    }
  })
  it('§5.9-8 malformed SSE frame → onError(err) (the parseSseFrame throw)', async () => {
    const createSseClient = await loadSseClient()
    const errors: unknown[] = []
    const orig = globalThis.fetch
    // a frame line with no `field: value` colon is structurally invalid per the
    // SSE spec — the client must route the parse throw to onError, never crash.
    globalThis.fetch = (async () => sseResponse(['not a valid sse line\n\n'])) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: (e) => errors.push(e),
        onClose: () => {},
      })
      await settle()
      expect(errors).toHaveLength(1)
    } finally {
      globalThis.fetch = orig
    }
  })
  it('§5.9-9 mid-stream error → onError(err)', async () => {
    const createSseClient = await loadSseClient()
    const errors: unknown[] = []
    const encoder = new TextEncoder()
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('event: result\ndata: {"type":"result"}\n\n'))
        controller.error(new Error('stream error'))
      },
    })
    const orig = globalThis.fetch
    globalThis.fetch = (async () =>
      new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } })) as typeof fetch
    try {
      const sse = createSseClient({})
      sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => {},
        onError: (e) => errors.push(e),
        onClose: () => {},
      })
      await settle()
      expect(errors).toHaveLength(1)
    } finally {
      globalThis.fetch = orig
    }
  })
  it('§5.9-10 after close() → fires NO further onEvent/onError/onClose callbacks', async () => {
    const createSseClient = await loadSseClient()
    const calls: string[] = []
    const orig = globalThis.fetch
    // an open stream that never ends — so any callback after close() would be a leak
    globalThis.fetch = (async () =>
      new Response(new ReadableStream<Uint8Array>({
        start() {
          /* never close */
        },
      }), { status: 200, headers: { 'content-type': 'text/event-stream' } })) as typeof fetch
    try {
      const sse = createSseClient({})
      const sub = sse.subscribe('http://127.0.0.1:8080/rag/stream', {
        onEvent: () => calls.push('event'),
        onError: () => calls.push('error'),
        onClose: () => calls.push('close'),
      })
      sub.close()
      await settle()
      expect(calls).toHaveLength(0)
    } finally {
      globalThis.fetch = orig
    }
  })
})

// ===========================================================================
// §5.3 / §5.4 — the policy record + the D2-fallback clarification
// (partly RED, partly GREEN).
// ===========================================================================
describe('the bind/auth/TLS policy record + the D2-fallback clarification', () => {
  it('§5.8-17 policy-record consistency: loopback-only bind + Bearer-on-header + TLS-via-dispatcher (RED)', async () => {
    const { assertLoopback, headers, createEngineFetch } = await loadEngineTransport()
    // loopback-only bind (enforced by assertLoopback)
    expect(() => assertLoopback('http://127.0.0.1:8080', 'engine rag store')).not.toThrow()
    expect(() => assertLoopback('http://192.168.1.1:8080', 'engine rag store')).toThrow(
      'engine rag store: baseUrl must be loopback',
    )
    // Bearer-on-header auth (enforced by headers)
    expect(headers({ token: 'abc' }).authorization).toBe('Bearer abc')
    expect('authorization' in headers({})).toBe(false)
    // TLS-via-dispatcher (enforced by createEngineFetch)
    expect(createEngineFetch({ tls: { ca: 'ca' } })).not.toBe(globalThis.fetch)
    expect(createEngineFetch({})).toBe(globalThis.fetch)
  })

  it('§5.8-15 document-CRUD engine-absent happy: surfaces EngineUnavailable (503) (GREEN — landed)', async () => {
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    const err = await captureError(store.getDocument({ documentId: 'd1' }))
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })

  it('§5.9-12 document-CRUD on engine-absent does NOT fall back to createJsonRagStore (GREEN — landed)', async () => {
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    const err = await captureError(store.getDocument({ documentId: 'd1' }))
    // the engine proxy surfaces EngineUnavailable — it never returns a local
    // RagStore document (the data models differ; no second editor, no sync).
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
  })

  it('§5.8-16 local rag.* surface (createJsonRagStore) is the parallel D2 fallback (GREEN — landed)', () => {
    // the local RagNode/RagEdge graph factory is a distinct surface from the
    // document-CRUD engine proxy — it exists and is constructible without the
    // engine (the "works without the engine" half is covered by the landed
    // rag-store tests).
    expect(typeof createJsonRagStore).toBe('function')
  })

  it('§5.9-13 GN factory on a non-loopback baseUrl throws the byte-pinned message (GREEN — landed)', () => {
    expect(() => createEngineRagStore({ baseUrl: 'http://192.168.1.1:8080' })).toThrow(
      'engine rag store: baseUrl must be loopback',
    )
  })

  it('§5.9-14 CRUD factory on a non-loopback baseUrl throws the byte-pinned message (GREEN — landed)', () => {
    expect(() => createEngineCrudRagStore({ baseUrl: 'http://192.168.1.1:8080' })).toThrow(
      'engine crud rag store: baseUrl must be loopback',
    )
  })
})

// ===========================================================================
// The pinned non-throws / type-level guarantees.
// ===========================================================================
describe('pinned non-throws / type-level guarantees', () => {
  it('the opts.fetch injectable seam wins over createEngineFetch (GREEN — landed)', async () => {
    let used = false
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        used = true
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse(READY_REPORT)
        }
        return jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: DOC_WIRE }))
      }),
    })
    const doc = await store.getDocument({ documentId: 'd1' })
    expect(doc).toEqual(DOC_TYPED)
    expect(used).toBe(true)
  })

  it('the Bearer token is NEVER in the URL (RED — createSseClient)', async () => {
    const createSseClient = await loadSseClient()
    let capturedUrl = ''
    const orig = globalThis.fetch
    globalThis.fetch = (async (input: any) => {
      capturedUrl = String(input)
      return sseResponse([])
    }) as typeof fetch
    try {
      const sse = createSseClient({ token: 'secret-token' })
      sse.subscribe('http://127.0.0.1:8080/rag/stream?query=q', {
        onEvent: () => {},
        onError: () => {},
        onClose: () => {},
      })
      await settle()
      expect(capturedUrl).not.toContain('secret-token')
    } finally {
      globalThis.fetch = orig
    }
  })

  it('adversarial H3 re-verification: the GN factory accepts the hex IPv4-mapped ::ffff:7f00:1 baseUrl (no-throw)', () => {
    // §5.1 amendment 1 — the GN factory gains the hex `::ffff:7f00:1` form via
    // the shared isLoopbackHost superset (a strict superset: no previously-valid
    // loopback baseUrl is rejected). new URL('http://[::ffff:7f00:1]:8080')
    // normalizes the hostname to `[::ffff:7f00:1]`; assertLoopback strips the
    // brackets and the hex form is accepted → no-throw at construction.
    expect(() => createEngineRagStore({ baseUrl: 'http://[::ffff:7f00:1]:8080' })).not.toThrow()
  })

  it('the isLoopbackHost superset is a strict superset — no previously-valid loopback baseUrl is rejected (RED)', async () => {
    const { isLoopbackHost } = await loadEngineTransport()
    // the CRUD proxy already handled the hex form; the GN proxy gains it here.
    // Both proxies' prior loopback forms must still be accepted.
    for (const host of ['127.0.0.1', '::1', '::ffff:127.0.0.1', '::ffff:7f00:1', 'localhost']) {
      expect(isLoopbackHost(host), `host ${host}`).toBe(true)
    }
  })
})

// ===========================================================================
// §5.5 — the e2e transport test / live-battery revisit (opt-in + gated on the
// engine). NOT part of the deterministic suite — skipped unless GNOSIS_LIVE.
// ===========================================================================
describe.skipIf(!process.env.GNOSIS_LIVE)(
  'e2e transport test / live-battery revisit (opt-in + gated on the engine)',
  () => {
    it('the live engine serves the document-CRUD round-trips over a real transport', async () => {
      const baseUrl = process.env.GNOSIS_BASE_URL ?? 'http://127.0.0.1:8080'
      // the live check that ends the park: the engine status endpoint responds.
      const status = await fetch(`${baseUrl}/engine/status`).catch(() => null)
      if (!status || !status.ok) {
        throw new Error('live engine not reachable — the e2e transport test is gated on the engine')
      }
      const store = createEngineCrudRagStore({ baseUrl })
      const doc = await store.createDocument({
        caller: 'user:test',
        wikiId: 'w1',
        body: { title: 'live round-trip', tags: [], author: 'test' },
      })
      expect(doc).toBeTruthy()
      expect(doc.documentId).toBeTruthy()
    })
  },
)
