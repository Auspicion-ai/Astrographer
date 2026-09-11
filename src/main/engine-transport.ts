// src/main/engine-transport.ts — Unit shell-integration §5.1: the shared
// transport module. Extracts the duplicated transport helpers
// (isLoopbackHost/assertLoopback/transportError/fetchWithTimeout/headers) from
// both proxies (engine-rag-store.ts — Unit GN — and engine-crud-rag-store.ts —
// Unit A1) and exports `createEngineFetch(auth)`, the https-agent-backed
// injectable fetch that applies `auth.tls` ({ca,cert,key}) via the undici
// `dispatcher`.
//
// The pinned (safe) import cycle: this module imports the error model
// (EngineWireError/EngineUnavailable) from engine-rag-store.js, and
// engine-rag-store.ts imports the transport helpers from here. Neither module
// uses the other's bindings at module-evaluation time (the error classes are
// referenced only inside function bodies, resolved at call time) — the cycle is
// intentional and MUST NOT be "fixed" by moving the error model.
import { Agent, fetch as undiciFetch, request as undiciRequest } from 'undici'
import {
  EngineWireError,
  EngineUnavailable,
} from './engine-rag-store.js'

/** Unit shell-integration §5.1 — the loopback-host superset (the union of both
 *  proxies' implementations, incl. the hex ::ffff:7f00:1 / ::ffff:7f01:1 forms).
 *  Returns `true` for `127.0.0.1`, `::1`, the IPv4-mapped IPv6 loopback forms
 *  (`::ffff:127.0.0.1`, `::ffff:127.x.y.z`, the hex `::ffff:7f00:1` in the 127/8
 *  loopback block), and `localhost` (the loopback alias — no DNS at
 *  construction); `false` for all other hosts. PURE. */
export function isLoopbackHost(host: string): boolean {
  if (host === '127.0.0.1' || host === '::1') return true
  // IPv4-mapped IPv6 loopback (::ffff:127.0.0.1, ::ffff:127.x.y.z, and the hex
  // ::ffff:7f00:1 / ::ffff:7f01:1 forms — the compressed forms the URL parser
  // normalizes ::ffff:127.0.0.1 to).
  if (host.startsWith('::ffff:')) {
    const v4 = host.slice('::ffff:'.length)
    if (v4 === '127.0.0.1') return true
    const parts = v4.split('.')
    if (parts.length === 4 && parts[0] === '127') return true
    const hexParts = v4.split(':')
    if (hexParts.length === 2) {
      const first = parseInt(hexParts[0], 16)
      if (!Number.isNaN(first) && (first >>> 8) === 0x7f) return true
    }
  }
  if (host === 'localhost') {
    // §5.8-14: localhost is accepted as the loopback alias (no DNS resolution
    // at construction — the factory is synchronous).
    return true
  }
  return false
}

/** Unit shell-integration §5.1 — assert the baseUrl resolves to a loopback host.
 *  Throws `Error('${prefix}: baseUrl must be loopback')` on a non-loopback or
 *  unparseable baseUrl. SYNCHRONOUS (no network I/O at construction). */
export function assertLoopback(baseUrl: string, prefix: string): void {
  let url: URL
  try {
    url = new URL(baseUrl)
  } catch {
    throw new Error(`${prefix}: baseUrl must be loopback`)
  }
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (isLoopbackHost(host)) return
  throw new Error(`${prefix}: baseUrl must be loopback`)
}

/** Unit shell-integration §5.1 — the D2 engine-absent transport split. Returns
 *  an EngineWireError unchanged; ECONNREFUSED → EngineUnavailable
 *  ('connection-refused'); ENOTFOUND → EngineUnavailable ('engine-not-spawned');
 *  any other transport failure → EngineWireError('engine_unavailable', 503,
 *  String(err)). PURE. */
export function transportError(err: unknown): unknown {
  if (err instanceof EngineWireError) return err
  // The transport code lives either directly on the error (`err.code`, the
  // shape the unit tests inject) or nested on the fetch/undici `cause`
  // (`err.cause.code`, the real transport shape — a `TypeError: fetch failed`
  // whose `cause` is the underlying socket error). Read both so the D2
  // engine-absent split (connection-refused vs engine-not-spawned) is preserved
  // regardless of which shape the transport produces.
  const code =
    err && typeof err === 'object'
      ? (err as any).code ?? (err as any).cause?.code
      : undefined
  if (code === 'ECONNREFUSED') {
    return new EngineUnavailable('connection-refused', String((err as any).message))
  }
  if (code === 'ENOTFOUND') {
    return new EngineUnavailable('engine-not-spawned', String((err as any).message))
  }
  // Any other transport failure (ECONNRESET, timeout, generic) → a typed
  // EngineWireError (H6): on any fail-state a typed EngineWireError is required,
  // never a raw Error.
  return new EngineWireError('engine_unavailable', 503, String(err))
}

/** Unit shell-integration §5.1 — the per-request timeout wrapper. On a timeout
 *  the fetch is aborted and EngineUnavailable('connection-refused', 'request
 *  timed out after ${requestTimeoutMs}ms') is thrown (never a raw AbortError). */
export async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  requestTimeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs)
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal })
  } catch (err) {
    if (controller.signal.aborted) {
      throw new EngineUnavailable(
        'connection-refused',
        `request timed out after ${requestTimeoutMs}ms`,
      )
    }
    throw transportError(err)
  } finally {
    clearTimeout(timer)
  }
}

/** Unit shell-integration §5.1 — the request headers: { 'content-type':
 *  'application/json' } plus 'authorization': 'Bearer <token>' when auth.token is
 *  set. PURE. */
export function headers(auth?: { token?: string }): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' }
  if (auth?.token) h['authorization'] = `Bearer ${auth.token}`
  return h
}

/** Unit shell-integration §5.1 — an https-agent-backed injectable fetch that
 *  applies auth.tls ({ca,cert,key}) via the undici dispatcher. When auth.tls is
 *  NOT set, returns globalThis.fetch (no dispatcher). The returned function has
 *  the standard fetch signature. */
export function createEngineFetch(
  auth?: { token?: string; tls?: { ca?: string; cert?: string; key?: string } },
): typeof fetch {
  if (!auth?.tls) return globalThis.fetch
  const dispatcher = new Agent({
    connect: {
      ...(auth.tls.ca !== undefined ? { ca: auth.tls.ca } : {}),
      ...(auth.tls.cert !== undefined ? { cert: auth.tls.cert } : {}),
      ...(auth.tls.key !== undefined ? { key: auth.tls.key } : {}),
    },
  })
  // The undici `fetch` carries its own Response/RequestInfo types (undici/types/
  // fetch) that are narrower than the DOM fetch types (`bytes` on Response,
  // `duplex` on Request). At runtime undici's fetch IS the DOM global fetch
  // implementation, so we bridge the two through `unknown` to the DOM `typeof
  // fetch` signature while keeping the Agent dispatcher applied. The runtime
  // behavior is unchanged (the {ca,cert,key} dispatcher is still passed).
  const fn = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    return undiciFetch(
      input as Parameters<typeof undiciFetch>[0],
      {
        ...(init ?? {}),
        ...(dispatcher ? { dispatcher } : {}),
      } as unknown as Parameters<typeof undiciFetch>[1],
    ) as unknown as Response
  }) as unknown as typeof fetch
  return fn
}

/** Unit shell-integration + HOST-GET-WITH-BODY-SSE-CRUD (2026-09-11): a
 *  GET-with-body-CAPABLE injectable fetch built on undici's lower-level
 *  `request()` (which — unlike the undici `fetch` that `globalThis.fetch`
 *  aliases — PERMITS a JSON request body on a GET). The document/wiki CRUD
 *  READ methods (`getDocument`/`listDocuments`/`getWiki`/`listWikis`) send the
 *  request envelope in the GET body per the P1a wire (the Gnosis server's
 *  `crud_handler` reads the envelope from the request body for ALL methods),
 *  so the default `globalThis.fetch` transport rejects them. This is the CRUD
 *  client's DEFAULT transport (`opts.fetch` still overrides it as the test seam).
 *  Applies `auth.tls` via the undici dispatcher + `auth.token` as Bearer. */
export function createCrudFetch(
  auth?: { token?: string; tls?: { ca?: string; cert?: string; key?: string } },
): typeof fetch {
  const dispatcher = auth?.tls
    ? new Agent({
        connect: {
          ...(auth.tls.ca !== undefined ? { ca: auth.tls.ca } : {}),
          ...(auth.tls.cert !== undefined ? { cert: auth.tls.cert } : {}),
          ...(auth.tls.key !== undefined ? { key: auth.tls.key } : {}),
        },
      })
    : undefined
  const fn = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as { url?: string })?.url ?? String(input)
    const method = (init?.method ?? 'GET').toUpperCase()
    const body = typeof init?.body === 'string' ? init.body : undefined
    const res = await undiciRequest(url, {
      ...(method ? { method } : {}),
      headers: { ...headers(auth), ...(init?.headers as Record<string, string> | undefined) },
      body,
      ...(init?.signal ? { signal: init.signal } : {}),
      ...(dispatcher ? { dispatcher } : {}),
    } as unknown as Parameters<typeof undiciRequest>[1])
    const text = await res.body.text()
    return new Response(text, { status: res.statusCode })
  }
  return fn as unknown as typeof fetch
}
