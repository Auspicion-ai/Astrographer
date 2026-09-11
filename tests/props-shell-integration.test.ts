// tests/props-shell-integration.test.ts — Unit shell-integration: the §5.7 PBT
// register (8 rows) for the shared `engine-transport.ts` module + the fetch-based
// SSE client + the bind/auth/TLS policy record + the D2-fallback clarification.
// (docs/specs/unit-shell-integration.md §5.7 — the register; §5.1 the
// engine-transport module surface; §5.2 the fetch-based SSE client; §5.3 the
// policy record; §5.4 the D2-fallback clarification.)
//
// Deterministic pinned seed 0x5E11E11E (the unit's mnemonic "SHELL"), ≤100
// attempts/row, ≤400 total, stop-after-5. Each row is reported held/broken with
// its Strategy-id.
//
// RED: the `engine-transport.ts` module + the `createSseClient` factory do NOT
// exist yet, so the rows that exercise those surfaces (P-IM-1, P-IM-2, P-IM-3,
// P-SM-1, P-SM-2, P-TP-1, P-TP-2) are the red set. The row that only checks the
// LANDED document-CRUD engine-absent surface (P-SM-3) is GREEN.
//
// ADVERSARIAL NEGATIVE-GENERATOR ADDITIONS (this write):
//   - P-IM-1: hex 2-part NON-loopback hosts (`::ffff:8000:1`, `::ffff:7e00:1`) →
//     isLoopbackHost returns false.
//   - P-SM-1: a dropped / failing SSE connection (a reject OR a non-2xx) → the
//     client fires EXACTLY ONE terminal onError with fetchCount === 1 (no
//     reconnect). The `::ffff:7f01:1` form is asserted as LOOPBACK (it is in the
//     127/8 block — `::ffff:127.1.0.1`), not a non-loopback.
//   - P-SM-2: PROXY-layer premature close — `createEngineRagStore().ragStream`
//     against a premature-close `sseResponse` (the stream ends before a `done`
//     chunk) → the iterable throws EngineUnavailable (503, connection-refused)
//     with NO partial commit and NO re-fetch.
//   - P-TP-1: PARTIAL-tls variants (`{tls:{ca}}`, `{tls:{cert}}`, `{tls:{key}}`,
//     `{tls:{}}`) → the returned fetch is NOT globalThis.fetch and its undici
//     dispatcher.connect carries EXACTLY the present ca/cert/key.
//   - P-IM-3: the SSE-Bearer facet — a createSseClient call with a token carries
//     `authorization: Bearer <token>` on the stream init.
// The undici module is mocked (Agent + fetch) so the P-TP-1 dispatcher.connect
// exactness is observable deterministically; the mock is inert for the rows
// that only need `opts.fetch` / `createSseClient`.
import { describe, it, expect, vi } from 'vitest'
import {
  EngineUnavailable,
  createEngineRagStore,
  ENGINE_ENDPOINTS,
} from '../src/main/engine-rag-store.js'
import {
  createEngineCrudRagStore,
} from '../src/main/engine-crud-rag-store.js'
import { fetch as mockedUndiciFetch } from 'undici'

// ---------------------------------------------------------------------------
// Mock the undici dependency (shell-side, §5.1): the `Agent` records its
// constructor options (the { connect } config) and the fetch captures the
// init (incl. the dispatcher) it is invoked with. This makes the P-TP-1
// dispatcher.connect exactness observationally deterministic.
// ---------------------------------------------------------------------------
vi.mock('undici', () => {
  class MockAgent {
    options: any
    constructor(opts?: any) {
      this.options = opts ?? {}
    }
  }
  const fetchMock = vi.fn(async () => new Response('ok', { status: 200 }))
  return { Agent: MockAgent, fetch: fetchMock }
})

// ---------------------------------------------------------------------------
// The pinned shell-integration surfaces (defined here — the exports do not
// exist yet).
// ---------------------------------------------------------------------------
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
// The closed loopback-host set + the auth shape (the §5.7 reserved-variant
// discipline — the loopback set and the auth shape are closed).
// ---------------------------------------------------------------------------
const LOOPBACK_FORMS = [
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  '::ffff:127.0.0.2',
  '::ffff:7f00:1', // the hex form (amendment 1)
  '::ffff:7f01:1', // the hex `::ffff:127.1.0.1` form — ALSO in the 127/8 loopback block (spec §5.1 pinned code accepts it)
  'localhost',
] as const
const NON_LOOPBACK_HOSTS = [
  '192.168.1.1',
  '10.0.0.1',
  'example.com',
  '::ffff:8.8.8.8',
  '::ffff:8000:1', // hex non-loopback: first 16 bits 0x8000 → 128, NOT 0x7f
  '::ffff:7e00:1', // hex non-loopback: first 16 bits 0x7e00 → 126, NOT 0x7f
] as const
const LOOPBACK_BASE_URLS = [
  'http://127.0.0.1:8080',
  'http://[::1]:8080',
  'http://localhost:8080',
  'http://[::ffff:7f00:1]:8080',
] as const
const NON_LOOPBACK_BASE_URLS = [
  'http://192.168.1.1:8080',
  'http://10.0.0.1:8080',
  'http://example.com:8080',
] as const

// ---------------------------------------------------------------------------
// Deterministic pinned seed + the property harness (≤100/row, ≤400 total,
// stop-after-5).
// ---------------------------------------------------------------------------
const PBT_SEED = 0x5e11e11e // the unit's mnemonic "SHELL"
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
function refusedError(): Error {
  const e: any = new Error('connect ECONNREFUSED 127.0.0.1:8080')
  e.code = 'ECONNREFUSED'
  return e
}
function settle(ms = 20): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
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
async function captureError(p: Promise<unknown>): Promise<unknown> {
  try {
    await p
  } catch (e) {
    return e
  }
  throw new Error('expected the promise to reject')
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

// ---------------------------------------------------------------------------
// The red-surface dynamic loaders.
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
// The §5.7 register (8 rows).
// ---------------------------------------------------------------------------
describe('PBT register (§5.7)', () => {
  it('P-IM-1 [strat:loopback-superset-total] the isLoopbackHost superset is total', async () => {
    const result = await (async () => {
      let isLoopbackHost: (host: string) => boolean
      try {
        isLoopbackHost = (await loadEngineTransport()).isLoopbackHost
      } catch (e) {
        return { held: false, counterexamples: [`isLoopbackHost unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        for (const h of LOOPBACK_FORMS) {
          if (isLoopbackHost(h) !== true) ces.push(`loopback form ${h} returned false`)
        }
        // adversarial P-IM-1: generate a hex 2-part NON-loopback host and assert
        // it is NOT loopback (the first 16 bits ≠ 0x7f → outside the 127/8 block).
        const nh = pick(rng, NON_LOOPBACK_HOSTS)
        if (isLoopbackHost(nh) !== false) ces.push(`non-loopback ${nh} returned true`)
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-IM-2 [strat:loopback-assert] assertLoopback enforces the loopback-only bind at construction', async () => {
    const result = await (async () => {
      let assertLoopback: (baseUrl: string, prefix: string) => void
      try {
        assertLoopback = (await loadEngineTransport()).assertLoopback
      } catch (e) {
        return { held: false, counterexamples: [`assertLoopback unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const lb = pick(rng, LOOPBACK_BASE_URLS)
        try {
          assertLoopback(lb, 'engine rag store')
        } catch (e) {
          ces.push(`loopback ${lb} threw: ${String(e)}`)
        }
        const nl = pick(rng, NON_LOOPBACK_BASE_URLS)
        try {
          assertLoopback(nl, 'engine rag store')
          ces.push(`non-loopback ${nl} did not throw`)
        } catch (e) {
          if (!/baseUrl must be loopback/.test(String(e))) {
            ces.push(`non-loopback ${nl} threw the wrong error: ${String(e)}`)
          }
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-IM-3 [strat:policy-record-consistent] the policy record is consistent with the module surface', async () => {
    const result = await (async () => {
      let mod: EngineTransport
      let createSseClient: (auth?: { token?: string }) => SseClient
      try {
        mod = await loadEngineTransport()
        createSseClient = await loadSseClient()
      } catch (e) {
        return { held: false, counterexamples: [`surface unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        // Bearer-on-header auth (enforced by headers)
        const withToken = rng() < 0.5
        const token = `tok${Math.floor(rng() * 1000)}`
        const h = mod.headers(withToken ? { token } : {})
        if (withToken && h['authorization'] !== `Bearer ${token}`) {
          ces.push(`headers(auth) missing Bearer ${token}`)
        }
        if (!withToken && 'authorization' in h) {
          ces.push('headers(auth) carries authorization without a token')
        }
        if (h['content-type'] !== 'application/json') {
          ces.push('headers(auth) content-type is not application/json')
        }
        // TLS-via-dispatcher (enforced by createEngineFetch)
        const withTls = rng() < 0.5
        const f = mod.createEngineFetch(withTls ? { tls: { ca: 'ca', cert: 'cert', key: 'key' } } : {})
        if (withTls && f === globalThis.fetch) {
          ces.push('createEngineFetch(tls) returned globalThis.fetch (no dispatcher)')
        }
        if (!withTls && f !== globalThis.fetch) {
          ces.push('createEngineFetch(no tls) did not return globalThis.fetch')
        }
        // loopback-only bind (enforced by assertLoopback)
        try {
          mod.assertLoopback('http://192.168.1.1:8080', 'engine rag store')
          ces.push('assertLoopback accepted a non-loopback baseUrl')
        } catch {
          /* expected */
        }
        // adversarial P-IM-3 facet: the SSE-Bearer — a createSseClient call with
        // a token carries authorization: Bearer <token> on the stream init
        // (the SSE-path auth is part of the policy-record invariant).
        const token2 = `tok${Math.floor(rng() * 500)}`
        let capturedHeaders: Record<string, string> | undefined
        const orig = globalThis.fetch
        globalThis.fetch = (async (_input: any, init?: RequestInit) => {
          capturedHeaders = init?.headers as Record<string, string>
          return sseResponse([])
        }) as typeof fetch
        try {
          const sse = createSseClient({ token: token2 })
          sse.subscribe('http://127.0.0.1:8080/rag/stream', {
            onEvent: () => {},
            onError: () => {},
            onClose: () => {},
          })
          await settle()
          if (capturedHeaders?.['authorization'] !== `Bearer ${token2}`) {
            ces.push(`SSE stream did not carry Bearer ${token2}`)
          }
        } finally {
          globalThis.fetch = orig
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-1 [strat:sse-no-reconnect-bearer] the SSE client sends the Bearer header and does NOT auto-reconnect', async () => {
    const result = await (async () => {
      let createSseClient: (auth?: { token?: string }) => SseClient
      try {
        createSseClient = await loadSseClient()
      } catch (e) {
        return { held: false, counterexamples: [`createSseClient unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      const scenarios = ['bearer', 'non2xx', 'reject'] as const
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const token = `tok${Math.floor(rng() * 1000)}`
        const scenario = scenarios[i % scenarios.length]
        let capturedHeaders: Record<string, string> | undefined
        let fetchCount = 0
        const errors: unknown[] = []
        const orig = globalThis.fetch
        // adversarial P-SM-1: exercise BOTH the happy Bearer stream AND the two
        // failing-connection shapes (a dropped/rejected connection and a non-2xx
        // response); every shape must fire EXACTLY ONE terminal callback and open
        // EXACTLY ONE fetch (no auto-reconnect).
        if (scenario === 'non2xx') {
          globalThis.fetch = (async () => {
            fetchCount++
            return new Response('nope', { status: 503 })
          }) as typeof fetch
        } else if (scenario === 'reject') {
          globalThis.fetch = (async () => {
            fetchCount++
            throw refusedError()
          }) as typeof fetch
        } else {
          globalThis.fetch = (async (_input: any, init?: RequestInit) => {
            fetchCount++
            capturedHeaders = init?.headers as Record<string, string>
            return sseResponse([])
          }) as typeof fetch
        }
        try {
          const sse = createSseClient({ token })
          sse.subscribe('http://127.0.0.1:8080/rag/stream', {
            onEvent: () => {},
            onError: (e) => errors.push(e),
            onClose: () => {},
          })
          await settle()
          if (scenario === 'bearer') {
            if (capturedHeaders?.authorization !== `Bearer ${token}`) {
              ces.push(`stream did not carry authorization: Bearer ${token}`)
            }
          } else {
            // a dropped/failing connection must fire EXACTLY ONE terminal
            // onError callback.
            if (errors.length !== 1) {
              ces.push(`scenario ${scenario} fired ${errors.length} onError (expected exactly 1)`)
            }
          }
          if (fetchCount !== 1) {
            ces.push(`scenario ${scenario}: client issued ${fetchCount} fetches (expected 1 — no auto-reconnect)`)
          }
        } finally {
          globalThis.fetch = orig
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-2 [strat:sse-premature-close] the SSE premature-close (H10) semantics are preserved', async () => {
    const result = await (async () => {
      let createSseClient: (auth?: { token?: string }) => SseClient
      try {
        createSseClient = await loadSseClient()
      } catch (e) {
        return { held: false, counterexamples: [`createSseClient unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        // adversarial P-SM-2: drive the PROXY layer. createEngineRagStore()'s
        // ragStream is run against a premature-close `sseResponse` (the stream
        // ends before a `done` chunk). The READY gate resolves via `opts.fetch`;
        // the stream connection resolves via `createSseClient` (globalThis.fetch).
        let gateFetchCount = 0
        const store = createEngineRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch((method, url) => {
            gateFetchCount++
            if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
              return jsonResponse(READY_REPORT)
            }
            throw new Error(`unexpected gate url ${url}`)
          }),
        })
        let streamFetchCount = 0
        const orig = globalThis.fetch
        globalThis.fetch = (async () => {
          streamFetchCount++
          // empty stream → ends before any `done` chunk = a premature close.
          return sseResponse([])
        }) as typeof fetch
        try {
          const iter = store.ragStream('q')[Symbol.asyncIterator]()
          const err = await captureError(iter.next())
          // H10: a dropped connection before done → EngineUnavailable (503,
          // connection-refused), never a silent reconnect or a clean end.
          if (!(err instanceof EngineUnavailable)) {
            ces.push(`premature close surfaced ${String(err)} (not EngineUnavailable)`)
          } else if (err.httpStatus !== 503 || err.cause !== 'connection-refused') {
            ces.push(`premature close EngineUnavailable was ${err.httpStatus}/${err.cause} (expected 503/connection-refused)`)
          }
          // NO partial result is committed (throw on the first next), and NO
          // re-fetch — the gate fetch happens once, the stream fetch once.
          if (gateFetchCount !== 1) {
            ces.push(`premature close: gate fetched ${gateFetchCount} times (expected 1)`)
          }
          if (streamFetchCount !== 1) {
            ces.push(`premature close: stream fetched ${streamFetchCount} times (expected 1 — no reconnect)`)
          }
        } finally {
          globalThis.fetch = orig
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-3 [strat:d2-fallback-distinct] the D2-fallback distinction holds (GREEN — landed)', async () => {
    const result = await (async () => {
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        // the document-CRUD surface surfaces EngineUnavailable on an absent
        // engine — it does NOT fall back to the local createJsonRagStore.
        const store = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch(() => {
            throw refusedError()
          }),
        })
        const err = await store.getDocument({ documentId: 'd1' }).then(() => null, (e) => e)
        if (!(err instanceof EngineUnavailable) || (err as EngineUnavailable).cause !== 'connection-refused') {
          ces.push(`document-CRUD engine-absent surfaced ${String(err)}`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-TP-1 [strat:create-engine-fetch-tls] createEngineFetch applies auth.tls via the undici dispatcher', async () => {
    const result = await (async () => {
      let createEngineFetch: EngineTransport['createEngineFetch']
      try {
        createEngineFetch = (await loadEngineTransport()).createEngineFetch
      } catch (e) {
        return { held: false, counterexamples: [`createEngineFetch unavailable — ${String(e)}`] }
      }
      const ces: string[] = []
      const undiciMock = mockedUndiciFetch as unknown as {
        mock: { calls: Array<[any, any]> }
        mockClear: () => void
      }
      // adversarial P-TP-1: generate the PARTIAL-tls variants (each present
      // field alone), the empty-but-truthy `{tls:{}}`, and the no-tls case. The
      // returned wrapper is NOT globalThis.fetch and its dispatcher.connect
      // carries EXACTLY the present ca/cert/key (absent fields omitted).
      const variants: Array<{ auth: any; present: Record<string, string> }> = [
        { auth: { tls: { ca: 'caX' } }, present: { ca: 'caX' } },
        { auth: { tls: { cert: 'certX' } }, present: { cert: 'certX' } },
        { auth: { tls: { key: 'keyX' } }, present: { key: 'keyX' } },
        { auth: { tls: { ca: 'caX', cert: 'certX' } }, present: { ca: 'caX', cert: 'certX' } },
        { auth: { tls: {} }, present: {} },
      ]
      for (const v of variants) {
        const f = createEngineFetch(v.auth)
        if (f === globalThis.fetch) {
          ces.push(`createEngineFetch(${JSON.stringify(v.auth)}) was globalThis.fetch (expected the TLS wrapper)`)
          continue
        }
        // constructible: invoke the wrapper and inspect the undici dispatcher.
        undiciMock.mockClear()
        try {
          await f('http://127.0.0.1:8080')
        } catch (e) {
          ces.push(`createEngineFetch(${JSON.stringify(v.auth)}) wrapper call threw: ${String(e)}`)
          continue
        }
        const init = undiciMock.mock.calls[0]?.[1]
        const connect = (init as any)?.dispatcher?.options?.connect
        if (JSON.stringify(connect) !== JSON.stringify(v.present)) {
          ces.push(
            `createEngineFetch(${JSON.stringify(v.auth)}) dispatcher.connect ${JSON.stringify(connect)} ≠ expected ${JSON.stringify(v.present)}`,
          )
        }
      }
      // no-tls → globalThis.fetch (no dispatcher).
      if (createEngineFetch({}) !== globalThis.fetch) {
        ces.push('createEngineFetch(no tls) did not return globalThis.fetch')
      }
      if (createEngineFetch() !== globalThis.fetch) {
        ces.push('createEngineFetch() did not return globalThis.fetch')
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-TP-2 [strat:headers-bearer] headers(auth) applies the Bearer token on the Authorization header', async () => {
    const result = await (async () => {
      let headers: EngineTransport['headers']
      try {
        headers = (await loadEngineTransport()).headers
      } catch (e) {
        return { held: false, counterexamples: [`headers unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const withToken = rng() < 0.5
        const token = `tok${Math.floor(rng() * 1000)}`
        const h = headers(withToken ? { token } : {})
        if (withToken && h['authorization'] !== `Bearer ${token}`) {
          ces.push(`headers missing Bearer ${token}`)
        }
        if (!withToken && 'authorization' in h) {
          ces.push('headers carries authorization without a token')
        }
        if (h['content-type'] !== 'application/json') {
          ces.push('headers content-type is not application/json')
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })
})
