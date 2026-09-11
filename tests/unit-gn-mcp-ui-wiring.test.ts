// tests/unit-gn-mcp-ui-wiring.test.ts — Unit GN-MCP-UI: Gnosis MCP/UI wiring of
// the LANDED `createEngineRagStore` proxy into the Astrographer MCP server (the
// three `gnosis.*` tools) + the GUI (scoped status/query screens).
// (docs/specs/unit-gn-mcp-ui-wiring.md §5.8 happy-path states (12) + §5.9
// fail-states (29) + §5.1 the three tool inputSchemas + the §5.2 `gnosis` group
// + §5.3 main-process routing/audit + §5.4 McpServerOptions.engineRagStore
// injection + §5.5 the D4 GUI panes + §5.6 D2 engine-absent + §5.7 PBT register;
// the proxy surface being wired in docs/specs/unit-gn-engine-integration.md
// §5.1 — ragQuery/ragStream/getEngineStatus/health/waitForReady.)
//
// The RED set for the WIRING — ALL of which does NOT exist yet:
//   - the main-process handler `handleGnosisTool` (exported from mcp-server.ts)
//   - the three `gnosis.*` names in `McpServerOptions.ALL_TOOLS`
//   - the `security.ts` `ToolGroup` `'gnosis'` + `TOOL_GROUPS` rows + `VALID_GROUPS`
//   - the `McpServerOptions.engineRagStore` injection + the graph-array tool defs
//   - the GUI render helpers `gnosisQueryContent` / `gnosisStatusContent`
//     (exported from pane-graph.ts) + the two pane registrations
//   - the boot-time `resolveEngineBaseUrl` + `engineRagStore` construction in main.ts
// ALREADY-GREEN (exercises only the LANDED proxy + existing security module):
//   - the mock-transport happy path (§5.8-12), factory no-IO (§5.8-7)
//   - defaultSecurityConfig() does NOT enable `gnosis` (§5.8-9 half)
//   - groupForTool('gnosis.<other>') === null (the fail-closed half of §5.9-27)
//   - `ALL_TOOLS` does NOT expose gnosis.waitForReady
//
// Conventions follow tests/unit-gn-engine-integration.test.ts + tests/unit-f2-
// result-qualification.test.ts (vitest node environment, `.js` import suffix for
// main-process ESM modules, injected mock fetch/sse over the real proxy per §5.6).
//
// RED surface import strategy: the not-yet-exported wiring symbols
// (`handleGnosisTool`, `gnosisQueryContent`, `gnosisStatusContent`) are loaded
// via DYNAMIC `import()` so their missing exports (undefined) fail individual
// tests cleanly instead of blowing up the whole file load — this lets the
// already-green proxy tests still run and be reported separately.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  createEngineRagStore,
  EngineWireError,
  EngineUnavailable,
  EngineError,
  ENGINE_ENDPOINTS,
  type EngineRagStore,
  type EngineRagStoreOptions,
  type EngineRagResult,
  type RagChunk,
  type HealthReport,
} from '../src/main/engine-rag-store.js'
import {
  groupForTool,
  defaultSecurityConfig,
  SecurityGate,
  toolAllowed,
} from '../src/main/security.js'
import { ProvidentMcpServer } from '../src/main/mcp-server.js'
import { createQueryAuditLog, type QueryAuditLog } from '../src/main/query-audit.js'

/** The pinned `handleGnosisTool` surface (§5.3). Defined here (the export does
 *  not exist yet) so the red calls type-check cleanly. */
type GnosisToolHandler = (
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: QueryAuditLog | null,
) => Promise<unknown>

// ---------------------------------------------------------------------------
// The red-surface dynamic loader. Each returns the wiring symbol or throws a
// CLEAR "not implemented (wiring RED)" marker so the red reason is explicit.
// ---------------------------------------------------------------------------
async function loadHandler(): Promise<GnosisToolHandler> {
  const mod = await import('../src/main/mcp-server.js')
  if (typeof mod.handleGnosisTool !== 'function') {
    throw new Error('handleGnosisTool not implemented (wiring RED — needs the Implementer)')
  }
  return mod.handleGnosisTool as GnosisToolHandler
}

async function loadRenderers(): Promise<{
  gnosisQueryContent: (ctx: unknown, r: EngineRagResult | null) => unknown
  gnosisStatusContent: (ctx: unknown, r: HealthReport | null) => unknown
}> {
  const mod: any = await import('../src/renderer/pane-graph.js')
  const missing: string[] = []
  if (typeof mod.gnosisQueryContent !== 'function') missing.push('gnosisQueryContent')
  if (typeof mod.gnosisStatusContent !== 'function') missing.push('gnosisStatusContent')
  if (missing.length > 0) {
    throw new Error(`${missing.join(', ')} not implemented (wiring RED — needs the Implementer)`)
  }
  return mod
}

// ---------------------------------------------------------------------------
// Fixtures — the proxy-specific EngineRagResult + the wire bodies.
// ---------------------------------------------------------------------------
const READY_REPORT: HealthReport = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: 'v1',
  subsystems: {
    store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true,
  },
  lastError: null,
}

const DEGRADED_REPORT: HealthReport = {
  ...READY_REPORT,
  state: 'Degraded',
  subsystems: { ...READY_REPORT.subsystems, embedding: false },
  lastError: 'a non-core subsystem (embedding/reranker) is unavailable',
}

// The minimal flat wire result body (V-5-like) → mapped EngineRagResult.
const WIRE_RESULT_BODY = {
  query: 'q',
  results: [
    { document_id: 'd1', node_id: 'n1', score: 0.9, snippet: 's', source: 'Local', parent: null, stale: null },
  ],
  engine: 'gnosis',
  citations: [['d1', 'n1']],
  trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
  blocked_by: null,
}

const VECTOR_WIRE_BODY = {
  query: 'q',
  results: [
    { document_id: 'd1', node_id: 'n1', score: 0.9, snippet: 's', source: 'Local', parent: null, stale: null },
  ],
  engine: 'gnosis',
  citations: [['d1', 'n1']],
  trace: { Vector: { mode: 'Vector', engine: 'gnosis', top_k: 10, source: 'Local' } },
  blocked_by: null,
}

const MAPPED_RESULT: EngineRagResult = {
  query: 'q',
  results: [{ documentId: 'd1', nodeId: 'n1', score: 0.9, snippet: 's', source: 'local' }],
  engine: 'gnosis',
  citations: [{ documentId: 'd1', nodeId: 'n1' }],
  trace: { mode: 'flat', engine: 'gnosis', topK: 10, source: 'local' },
}

// ---------------------------------------------------------------------------
// Mock-transport helpers (replicas of the unit-gn greens, per §5.6).
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
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

/** Wrap a wire body in the versioned envelope (the wire shape §3.1 — a
 *  `ragQuery` response body is `{schemaVersion,idFormat,payload}`). */
function enveloped(body: unknown): unknown {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: body }
}

function refusedError(): Error {
  const e: any = new Error('connect ECONNREFUSED 127.0.0.1:8080')
  e.code = 'ECONNREFUSED'
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
  const client: EngineRagStoreOptions['sse'] = {
    subscribe(url, handlers) {
      calls.push({ url, handlers })
      return { close() {} }
    },
  }
  return { client, calls }
}

// A ready-gated proxy whose ragQuery POST is served by `queryBody` (wrapped
// in the versioned envelope). Accepts the raw wire body.
function makeReadyEngine(queryBody: unknown): EngineRagStore {
  return createEngineRagStore({
    baseUrl: 'http://127.0.0.1:8080',
    fetch: fakeFetch((method, url) => {
      if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
      if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) return jsonResponse(enveloped(queryBody))
      throw new Error(`unexpected ${method} ${url}`)
    }),
  })
}

// ===========================================================================
// §5.8 / §5.9 — the `gnosis.*` MCP tools via handleGnosisTool (RED surface).
// ===========================================================================
describe('handleGnosisTool — the gnosis.* tools (RED until wired)', () => {
  it('exports handleGnosisTool (the main-process handler)', async () => {
    await expect(loadHandler()).resolves.toBeTypeOf('function')
  })

  // --- §5.9 null-engine guards (fail-states 1–3) ---
  it('§5.9-1 gnosis.query null engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.query', { query: 'q' }, null)).rejects.toThrow(
      'gnosis.query: no engine rag store configured',
    )
  })
  it('§5.9-2 gnosis.stream null engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.stream', { query: 'q' }, null)).rejects.toThrow(
      'gnosis.stream: no engine rag store configured',
    )
  })
  it('§5.9-3 gnosis.status null engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.status', {}, null)).rejects.toThrow(
      'gnosis.status: no engine rag store configured',
    )
  })

  // --- §5.8-1 gnosis.query happy (audit records) ---
  it('§5.8-1 gnosis.query happy: ragQuery → EngineRagResult + one audit entry', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    const audit = createQueryAuditLog()
    const out = await handle(engine, 'gnosis.query', { query: 'q' }, audit)
    expect((out as EngineRagResult).engine).toBe('gnosis')
    expect((out as EngineRagResult).results[0].documentId).toBe('d1')
    expect(Array.isArray((out as EngineRagResult).citations)).toBe(true)
    const entries = audit.list()
    expect(entries).toHaveLength(1)
    expect(entries[0].query).toBe('q')
    expect(entries[0].requester).toBe('mcp')
    expect(entries[0].resultCount).toBe(1)
  })

  // --- §5.8-2 mode vector/hybrid pass-through ---
  it('§5.8-2 gnosis.query mode:vector passes the 4-member mode through → EngineVectorTrace', async () => {
    const handle = await loadHandler()
    const seen: any[] = []
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url, init) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) {
          seen.push(JSON.parse(String(init?.body)))
          return jsonResponse(enveloped(VECTOR_WIRE_BODY))
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const out = await handle(engine, 'gnosis.query', { query: 'q', mode: 'vector' }, null)
    expect((out as EngineRagResult).trace).toHaveProperty('mode', 'vector')
    expect(seen[0].mode).toBe('vector')
  })

  // --- §5.8-3 gnosis.stream happy (collect + audit) ---
  it('§5.8-3 gnosis.stream happy: collects [result,done] in order + one audit entry', async () => {
    const handle = await loadHandler()
    const { client, calls } = makeFakeSse()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const audit = createQueryAuditLog()
    const pump = (handle(engine, 'gnosis.stream', { query: 'q' }, audit) as Promise<{ chunks: RagChunk[] }>)
    await new Promise((r) => setTimeout(r, 0))
    expect(calls.length).toBe(1)
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    const out = await pump
    expect(out.chunks).toEqual([{ type: 'result', result: MAPPED_RESULT }, { type: 'done' }])
    const entries = audit.list()
    expect(entries).toHaveLength(1)
    expect(entries[0].requester).toBe('mcp')
    expect(entries[0].resultCount).toBe(1)
  })

  // --- §5.8-4 error-then-done (resultCount 0) ---
  it('§5.8-4 gnosis.stream error-then-done → {chunks:[error,done]} + resultCount 0', async () => {
    const handle = await loadHandler()
    const { client, calls } = makeFakeSse()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const audit = createQueryAuditLog()
    const pump = (handle(engine, 'gnosis.stream', { query: 'q' }, audit) as Promise<{ chunks: RagChunk[] }>)
    await new Promise((r) => setTimeout(r, 0))
    calls[0].handlers.onEvent('error', '{"type":"error","code":"validation_error","message":"empty query"}')
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    const out = await pump
    expect(out.chunks).toEqual([{ type: 'error', code: 'validation_error', message: 'empty query' }, { type: 'done' }])
    expect(audit.list()[0].resultCount).toBe(0)
  })

  // --- §5.8-5/5.8-6 gnosis.status happy + Degraded (no audit) ---
  it('§5.8-5 gnosis.status happy: HealthReport (Ready) + audit UNCHANGED', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const audit = createQueryAuditLog()
    const out = await handle(engine, 'gnosis.status', {}, audit)
    expect((out as HealthReport).state).toBe('Ready')
    expect((out as HealthReport).lastError).toBeNull()
    expect(audit.list()).toHaveLength(0)
  })
  it('§5.8-6 gnosis.status Degraded: faithful projection (Degraded + non-null lastError), NOT an error, no audit', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(DEGRADED_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const audit = createQueryAuditLog()
    const out = await handle(engine, 'gnosis.status', {}, audit)
    expect((out as HealthReport).state).toBe('Degraded')
    expect((out as HealthReport).lastError).toMatch(/non-core/)
    expect(audit.list()).toHaveLength(0)
  })

  // --- §5.9 validation fail-states for gnosis.query (4–10) ---
  it('§5.9-4 query empty -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: '  ' }, null)).rejects.toThrow('gnosis.query: query must be a non-empty string')
  })
  it('§5.9-5 query bad topK -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', topK: 0 }, null)).rejects.toThrow('gnosis.query: topK must be an integer in [1, 50]')
  })
  it('§5.9-6 query bad mode -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', mode: 'zorb' }, null)).rejects.toThrow('gnosis.query: mode must be "flat", "graph", "vector", or "hybrid"')
  })
  it('§5.9-7 query bad maxHops -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', maxHops: 9 }, null)).rejects.toThrow('gnosis.query: maxHops must be an integer in [1, 5]')
  })
  it('§5.9-8 query bad expand -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', expand: 'child' }, null)).rejects.toThrow('gnosis.query: expand must be "none" or "parent"')
  })
  it('§5.9-9 query bad maxParentContext -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', maxParentContext: 0 }, null)).rejects.toThrow('gnosis.query: maxParentContext must be a positive integer')
  })
  it('§5.9-10 query malformed filters -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.query', { query: 'q', filters: { nodeKind: 'nope' } }, null)).rejects.toThrow('gnosis.query: filters malformed')
  })

  // --- §5.9 D2 engine-absent / wire-error fail-states on gnosis.query ---
  it('§5.9-11 query connection-refused -> EngineUnavailable (503, connection-refused)', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    const err = await handle(engine, 'gnosis.query', { query: 'q' }, null).then(
      () => null,
      (e) => e as EngineUnavailable,
    )
    expect(err).toBeInstanceOf(EngineWireError)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.httpStatus).toBe(503)
    expect(err.cause).toBe('connection-refused')
  })
  it('§5.9-12 query non-Ready observed state -> EngineUnavailable (503, not-ready)', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse({ ...READY_REPORT, state: 'Starting' })
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const err = await handle(engine, 'gnosis.query', { query: 'q' }, null).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
    expect((err as EngineUnavailable).cause).toBe('not-ready')
  })
  it('§5.9-13 query malformed wire body -> EngineError (502) / TraceUnavailable (502)', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine({ query: 123, results: [], engine: 'gnosis', citations: [], trace: { Flat: {} } })
    const err = await handle(engine, 'gnosis.query', { query: 'q' }, null).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineWireError)
    expect([502, 503]).toContain((err as EngineWireError).httpStatus)
  })

  // --- §5.9 fail-states for gnosis.stream (16–23) ---
  it('§5.9-16 stream empty query -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: '' }, null)).rejects.toThrow('gnosis.stream: query must be a non-empty string')
  })
  it('§5.9-17 stream bad topK -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', topK: 99 }, null)).rejects.toThrow('gnosis.stream: topK must be an integer in [1, 50]')
  })
  it('§5.9-18 stream bad mode -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', mode: 'bogus' }, null)).rejects.toThrow('gnosis.stream: mode must be "flat", "graph", "vector", or "hybrid"')
  })
  it('§5.9-19 stream bad maxHops -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', maxHops: 0 }, null)).rejects.toThrow('gnosis.stream: maxHops must be an integer in [1, 5]')
  })
  it('§5.9-20 stream bad expand -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', expand: 'x' }, null)).rejects.toThrow('gnosis.stream: expand must be "none" or "parent"')
  })
  it('§5.9-21 stream bad maxParentContext -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', maxParentContext: -1 }, null)).rejects.toThrow('gnosis.stream: maxParentContext must be a positive integer')
  })
  it('§5.9-22 stream malformed filters -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.stream', { query: 'q', filters: 'nope' }, null)).rejects.toThrow('gnosis.stream: filters malformed')
  })
  it('§5.9-14 stream non-Ready gate -> tool-level EngineUnavailable (NOT an error chunk)', async () => {
    const handle = await loadHandler()
    const { client } = makeFakeSse()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(DEGRADED_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const err = await handle(engine, 'gnosis.stream', { query: 'q' }, null).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
  })
  it('§5.9-15 stream premature close before done -> EngineUnavailable (connection-refused); no partial result', async () => {
    const handle = await loadHandler()
    const { client, calls } = makeFakeSse()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const pump = handle(engine, 'gnosis.stream', { query: 'q' }, null)
    await new Promise((r) => setTimeout(r, 0))
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
    // close before done → premature-close EngineUnavailable surfaced (no chunk committed)
    calls[0].handlers.onClose()
    const err = await pump.then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })
  it('§5.9-23 stream malformed SSE frame -> EngineError (502)', async () => {
    const handle = await loadHandler()
    const { client, calls } = makeFakeSse()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
      sse: client,
    })
    const pump = handle(engine, 'gnosis.stream', { query: 'q' }, null)
    await new Promise((r) => setTimeout(r, 0))
    calls[0].handlers.onEvent('bogus', '{"type":"not-a-chunk"}')
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    const err = await pump.then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineError)
    expect((err as EngineError).httpStatus).toBe(502)
  })

  // --- §5.9 gnosis.status fail-states (24–25) ---
  it('§5.9-24 status connection-refused -> EngineUnavailable (503, connection-refused)', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    const err = await handle(engine, 'gnosis.status', {}, null).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
    expect((err as EngineUnavailable).httpStatus).toBe(503)
  })
  it('§5.9-25 status malformed health report -> EngineError (502)', async () => {
    const handle = await loadHandler()
    const engine = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse({ schemaVersion: 'bad' })
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const err = await handle(engine, 'gnosis.status', {}, null).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineError)
    expect((err as EngineError).httpStatus).toBe(502)
  })

  // --- §5.9-26 unknown gnosis.* name ---
  it('§5.9-26 unknown gnosis.* name -> throws', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    await expect(handle(engine, 'gnosis.frobnicate', {}, null)).rejects.toThrow('unknown gnosis tool: gnosis.frobnicate')
  })

  // --- skip-when-absent audit (no throw, like rag.query) ---
  it('audit-log null/absent -> skips recording (no throw)', async () => {
    const handle = await loadHandler()
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    const out = await handle(engine, 'gnosis.query', { query: 'q' }, null)
    expect((out as EngineRagResult).query).toBe('q')
  })
})

// ===========================================================================
// §5.1 / §5.2 — the three tool schemas + the `gnosis` group (RED / GREEN split).
// ===========================================================================
describe('the gnosis group + the tool-name → group mapping', () => {
  it('§5.8-9 defaultSecurityConfig() does NOT enable gnosis (GREEN — already true)', () => {
    expect(defaultSecurityConfig().enabled).not.toContain('gnosis')
  })
  it('§5.8-9 groupForTool returns gnosis for each gnosis.* tool (RED)', () => {
    expect(groupForTool('gnosis.query')).toBe('gnosis')
    expect(groupForTool('gnosis.stream')).toBe('gnosis')
    expect(groupForTool('gnosis.status')).toBe('gnosis')
  })
  it('§5.9-27 a gnosis.* name NOT in TOOL_GROUPS -> null (fail-closed) (GREEN — already null)', () => {
    expect(groupForTool('gnosis.other')).toBeNull()
  })
  it('P-IM-2 — VALID_GROUPS admits the gnosis group via SecurityGate.apply (RED)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis', 'read', 'dispatch'] })
    expect(gate.enabled).toContain('gnosis')
  })
  it('toolAllowed("gnosis.status", gate-with-gnosis) becomes true only once gnosis is VALID (RED)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis'] })
    expect(toolAllowed('gnosis.status', gate.enabled)).toBe(true)
  })
})

describe('mcpserver ALL_TOOLS — the gnosis.* registrations (RED)', () => {
  it('ALL_TOOLS contains the three gnosis.* names', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('gnosis.query')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('gnosis.stream')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('gnosis.status')
  })
  it('ALL_TOOLS does NOT expose gnosis.waitForReady (GREEN — waitForReady is not a tool)', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).not.toContain('gnosis.waitForReady')
  })
  it('a server with the gnosis group enabled registers the gnosis.* tools (RED — injection)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis', 'read', 'dispatch'] })
    const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) } as never, transport: 'stdio', gate })
    server.ensureServerRegistered()
    expect(server.registeredEnabled('gnosis.query')).toBe(true)
    expect(server.registeredEnabled('gnosis.status')).toBe(true)
  })
})

// ===========================================================================
// §5.4 — boot construction + baseUrl resolution (partly GREEN, partly RED).
// ===========================================================================
describe('boot-time proxy construction + baseUrl source', () => {
  it('§5.8-7 createEngineRagStore at boot does NO network I/O (GREEN — the LANDED proxy)', () => {
    let fetchCalled = false
    const fetchImpl = (async () => {
      fetchCalled = true
      throw new Error('construction must not call fetch')
    }) as typeof fetch
    const store = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: fetchImpl })
    expect(store).toBeTruthy()
    expect(typeof store.ragQuery).toBe('function')
    expect(typeof store.ragStream).toBe('function')
    expect(typeof store.getEngineStatus).toBe('function')
    expect(typeof store.health).toBe('function')
    expect(typeof store.waitForReady).toBe('function')
    expect(fetchCalled).toBe(false)
  })
  it('§5.8-8 boot resolves baseUrl via the config seam → PROVIDENT_ENGINE_BASE_URL → default (RED — main.ts wiring)', () => {
    const main = readFileSync(fileURLToPath(new URL('../src/main/main.ts', import.meta.url)), 'utf8')
    expect(main).toContain('createEngineRagStore')
    expect(main).toContain('PROVIDENT_ENGINE_BASE_URL')
    expect(main).toMatch(/resolveEngineBaseUrl\(\)/)
    expect(main).toContain('http://127.0.0.1:8080')
  })
  it('§5.8-7 the proxy is injected into McpServerOptions (RED — engineRagStore field)', () => {
    const mcp = readFileSync(fileURLToPath(new URL('../src/main/mcp-server.ts', import.meta.url)), 'utf8')
    expect(mcp).toMatch(/engineRagStore\??:\s*EngineRagStore/)
  })
  it('handleGnosisTool accepts the pinned signature (RED)', async () => {
    const mod: any = await import('../src/main/mcp-server.js')
    expect(typeof mod.handleGnosisTool).toBe('function')
  })
})

// ===========================================================================
// §5.12 mock-transport happy (GREEN) — exercises the real proxy per §5.6.
// ===========================================================================
describe('§5.8-12 mock-transport happy path — the real proxy over a mock transport (GREEN)', () => {
  it('ragQuery returns the EngineRagResult through the injectable mock fetch', async () => {
    const engine = makeReadyEngine(WIRE_RESULT_BODY)
    const out = await engine.ragQuery('q')
    expect(out.engine).toBe('gnosis')
    expect(out.results[0].documentId).toBe('d1')
    expect(out.trace).toHaveProperty('mode', 'flat')
  })
  it('ragStream collects the single-shot chunks over the mock sse', async () => {
    const { client, calls } = makeFakeSse()
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
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
    calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
    calls[0].handlers.onEvent('done', '{"type":"done"}')
    calls[0].handlers.onClose()
    await pump
    expect(chunks).toEqual([{ type: 'result', result: MAPPED_RESULT }, { type: 'done' }])
  })
  it('getEngineStatus returns the HealthReport', async () => {
    const store = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    expect((await store.getEngineStatus()).state).toBe('Ready')
    expect((await store.health()).state).toBe('Ready')
  })
})

// ===========================================================================
// §5.5 — the D4 GUI panes + the EngineRagResult render path (RED surface).
// ===========================================================================
describe('the D4 GUI panes (RED until wired)', () => {
  it('exports gnosisQueryContent + gnosisStatusContent render helpers', async () => {
    await expect(loadRenderers()).resolves.toBeTruthy()
  })
  it('§5.8-10 gnosisStatusContent renders the HealthReport state/version/subsystems/lastError', async () => {
    const { gnosisStatusContent } = await loadRenderers()
    const node = gnosisStatusContent({} as never, READY_REPORT)
    const html = JSON.stringify(node)
    expect(html).toContain('Ready')
    expect(html).toContain('v1')
    expect(html).toContain('lastError')
  })
  it('§5.9-28 gnosisStatusContent null report -> unavailable state (never a throw)', async () => {
    const { gnosisStatusContent } = await loadRenderers()
    const node = gnosisStatusContent({} as never, null)
    expect(JSON.stringify(node).toLowerCase()).toMatch(/unavailable|not.*connect|absent/)
  })
  it('§5.8-11 gnosisQueryContent renders the EngineRagResult (query/results/citations/trace/blockedBy)', async () => {
    const { gnosisQueryContent } = await loadRenderers()
    const node = gnosisQueryContent({} as never, MAPPED_RESULT)
    const html = JSON.stringify(node)
    expect(html).toContain('q')
    expect(html).toContain('d1')
    expect(html).toContain('flat')
  })
  it('§5.9-29 gnosisQueryContent null result -> empty state (never a throw)', async () => {
    const { gnosisQueryContent } = await loadRenderers()
    expect(() => gnosisQueryContent({} as never, null)).not.toThrow()
  })
})

// ===========================================================================
// §5.7 — the PBT register (8 rows: P-IM×3, P-SM×2, P-TP×3).
// Deterministic mulberry32 seed, ≤100 attempts/row, ≤400 total, stop-after-5.
// ===========================================================================
const PBT_SEED = 0x9a9a9a00
const PBT_ATTEMPTS = 40 // 8 rows × 40 = 320 ≤ 400 total
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
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
): { row: string; strategyId: string; held: boolean; counterexamples: string[]; attempts: number } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: PBT_ATTEMPTS }
}

const GNOSIS_TOOLS = ['gnosis.query', 'gnosis.stream', 'gnosis.status'] as const

// ---------------------------------------------------------------------------
// §5.7 hardening helpers — the P-IM-1 schema audit + the §5.6 status-pane-
// handler (catch-over-bridge) contract. Both give the register GENUINE seams
// (the actual registered schema keys / the pane handler), never a hollow check.
// ---------------------------------------------------------------------------

/** The spec-pinned `gnosis.query`/`gnosis.stream` inputSchema body keys (§5.1 —
 *  the exact ZodRawShape keys); `gnosis.status` pins `{}` (no keys). */
const GNOSIS_QUERY_BODY_KEYS = ['query', 'topK', 'mode', 'maxHops', 'expand', 'maxParentContext', 'filters']
/** The credential field families A7 forbids on any `gnosis.*` inputSchema
 *  (engine auth token, TLS ca/cert/key, apiKey — all GUI-only, never tool args). */
const CREDENTIAL_FIELDS = ['token', 'tls', 'ca', 'cert', 'key', 'apiKey'] as const
const GNOSIS_TOOL_EXPECTED_KEYS: Record<string, readonly string[]> = {
  'gnosis.query': GNOSIS_QUERY_BODY_KEYS,
  'gnosis.stream': GNOSIS_QUERY_BODY_KEYS,
  'gnosis.status': [],
}

/** Enumerate a REGISTERED tool's inputSchema top-level keys. The wiring exposes
 *  NO public schema-introspection seam (ProvidentMcpServer.registered is
 *  private), so the generator reads the SDK's own registration map
 *  (`_registeredTools`) — the ONLY place the actual
 *  `registerTool(name, { inputSchema })` shape lives at runtime (SDK has
 *  pinned ^1.30.0). Returns `null` when the seam is absent → the schema cannot
 *  be audited today (the §5.7 honest red counterexample for P-IM-1). */
function registeredSchemaKeys(
  server: ProvidentMcpServer,
  toolName: string,
): readonly string[] | null {
  const sdk = server.ensureServerRegistered() as unknown as {
    _registeredTools?: Record<string, { inputSchema?: unknown }>
  }
  const tool = sdk?._registeredTools?.[toolName]
  if (!tool) return null
  const schema = tool.inputSchema as { shape?: object; keyof?: () => { options?: unknown[] } } | undefined
  if (schema?.shape && typeof schema.shape === 'object') return Object.keys(schema.shape)
  if (typeof schema?.keyof === 'function') {
    const keyof = schema.keyof()
    if (Array.isArray(keyof?.options)) return keyof.options.map(String)
  }
  return schema == null ? [] : null
}

/** The §5.6 status-pane-handler contract (the D2 catch-over-bridge surface the
 *  Implementer is wiring in parallel). Export `gnosisStatusPaneHandler`:
 *    (ctx, bridge: () => Promise<HealthReport>) => Promise<LegacyNodeData>
 *  — awaits the `getEngineStatus` bridge; on success renders
 *  `gnosisStatusContent(ctx, report)`; on a REJECTED bridge (`EngineUnavailable`)
 *  renders `gnosisStatusContent(ctx, null)` (the unavailable state); NEVER
 *  throws on an `EngineUnavailable` rejection. Returns the rendered node. */
type GnosisStatusPaneHandler = (ctx: unknown, bridge: () => Promise<HealthReport>) => Promise<unknown>
async function loadStatusPaneHandler(): Promise<GnosisStatusPaneHandler> {
  const candidates = ['../src/renderer/sidebar-panes.js', '../src/renderer/pane-graph.js']
  for (const mod of candidates) {
    const m: any = await import(mod)
    if (typeof m.gnosisStatusPaneHandler === 'function') return m.gnosisStatusPaneHandler
  }
  throw new Error('gnosisStatusPaneHandler not implemented (wiring RED — needs the Implementer)')
}

describe('PBT register — the wiring invariants (§5.7)', () => {
  // Non-uniform generator note: P-IM-2 and P-TP-1 flow through `runProperty`
  // (pure, synchronous invariants). P-IM-1, P-IM-3, P-SM-1, P-SM-2, P-TP-2 and
  // P-TP-3 are HAND-ROLLED loops around async/live surfaces (the registered
  // schemas, the real proxy, the render handlers) — each uses the SAME
  // deterministic mulberry32(PBT_SEED) + the same ≤PBT_ATTEMPTS / stop-after-5
  // budget discipline as runProperty, so the register stays uniform in seed and
  // budget even though the rows do not share the runProperty call.

  // Each row's report object is attached to the test so the final report can be
  // collected. P-IM-2 / P-TP-1 execute against the LIVE security module (real
  // generation); rows 3–8 need the missing wiring surface and report BROKEN
  // (the surface is absent — the honest one-pass red outcome).
  it('P-IM-1 [strat:no-credential-args] no gnosis.* tool schema accepts a credential arg', async () => {
    // The generator genuinely enumerates the ACTUAL REGISTERED inputSchema keys
    // for each `gnosis.*` tool and rejects any A7 credential field
    // (token/tls/ca/cert/key/apiKey) among them. A tool that is NOT registered /
    // enabled is a red counterexample (its no-credential schema cannot be
    // audited); a registered tool whose schema keys are not enumerable through
    // the SDK registration map is likewise red (a blind audit). The enumerated
    // key SET is also pinned to the §5.1 exact shapes, so a schema that silently
    // drops a legitimate field is caught too. Reserved-variant discipline is
    // kept: this generator never invents a credential arg for a `gnosis.*` tool
    // (that would be a fail-state, not the P-IM-1 invariant).
    const result = await (async () => {
      const server = new ProvidentMcpServer({
        backend: { invoke: async () => ({}) } as never,
        transport: 'stdio',
        gate: new SecurityGate().apply({ groups: ['gnosis', 'read', 'dispatch'] }),
      })
      server.ensureServerRegistered()
      const ces: string[] = []
      const rng = mulberry32(PBT_SEED)
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        // Deterministic traversal of the (finite) 3-tool set — a genuine
        // enumeration, driven by the seeded index for the same discipline as
        // the other hand-rolled rows.
        const tool = GNOSIS_TOOLS[i % GNOSIS_TOOLS.length]
        if (!server.registeredEnabled(tool)) {
          ces.push(`${tool}: not registered/enabled in the gnosis group (no-credential schema cannot be audited)`)
          continue
        }
        const keys = registeredSchemaKeys(server, tool)
        if (keys === null) {
          ces.push(`${tool}: registered but its inputSchema keys are not enumerable (the §5.7 schema audit is blind)`)
          continue
        }
        for (const k of keys) {
          if ((CREDENTIAL_FIELDS as readonly string[]).includes(k)) {
            ces.push(`${tool}.inputSchema carries the credential field "${k}" (A7 violation)`)
          }
        }
        const expected = GNOSIS_TOOL_EXPECTED_KEYS[tool]
        if (JSON.stringify([...keys].sort()) !== JSON.stringify([...expected].sort())) {
          ces.push(`${tool}.inputSchema keys ${JSON.stringify([...keys].sort())} !== spec-pinned ${JSON.stringify([...expected].sort())}`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-IM-2 [strat:group-default-off] gnosis default-off + VALID_GROUPS membership', () => {
    const rep = runProperty('P-IM-2', 'strat:group-default-off', () => {
      // Half 1 — the default config must NOT enable gnosis (already true today).
      if (defaultSecurityConfig().enabled.includes('gnosis')) {
        return 'defaultSecurityConfig().enabled includes gnosis'
      }
      // Half 2 — VALID_GROUPS must admit gnosis (via SecurityGate.apply).
      const gate = new SecurityGate().apply({ groups: ['gnosis'] })
      if (!gate.enabled.has('gnosis')) {
        return 'VALID_GROUPS rejects the gnosis group (SecurityGate.apply({groups:["gnosis"]}) unchanged)'
      }
      return null
    })
    expect(rep.held, `${rep.row} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-TP-1 [strat:group-total] tool-name → group mapping total/unambiguous', () => {
    const rep = runProperty('P-TP-1', 'strat:group-total', (_i, rng) => {
      const tool = pick(rng, GNOSIS_TOOLS)
      if (groupForTool(tool) !== 'gnosis') {
        return `${tool} resolves to ${String(groupForTool(tool))} (expected "gnosis")`
      }
      // fail-closed: a gnosis.<other> name must resolve to null, never gnosis.
      if (groupForTool(`gnosis.other${Math.floor(rng() * 1000)}`) !== null) {
        return 'a gnosis.<other> name resolved to a group (must be null)'
      }
      return null
    })
    expect(rep.held, `${rep.row} ${JSON.stringify(rep.counterexamples)}`).toBe(true)
    void rep
  })

  it('P-IM-3 [strat:stream-collect] gnosis.stream single-shot collection is deterministic/full', async () => {
    const result = await (async () => {
      let handler: GnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let s = 0; s < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; s++) {
        // A single-shot sequence: one `result` OR one `error`, then `done`.
        const isResultFirst = pick(rng, [true, false])
        const expectedTypes = [isResultFirst ? 'result' : 'error', 'done']
        const { client, calls } = makeFakeSse()
        const engine = createEngineRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch((method, url) => {
            if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
            throw new Error(`unexpected ${method} ${url}`)
          }),
          sse: client,
        })
        const pump = handler(engine, 'gnosis.stream', { query: 'q' }, null)
        await new Promise((r) => setTimeout(r, 0))
        if (isResultFirst) calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
        else calls[0].handlers.onEvent('error', '{"type":"error","code":"conflict","message":"c"}')
        calls[0].handlers.onEvent('done', '{"type":"done"}')
        calls[0].handlers.onClose()
        const chunks = (await pump).chunks
        const gotTypes = chunks.map((c) => c.type)
        if (JSON.stringify(gotTypes) !== JSON.stringify(expectedTypes)) {
          ces.push(`single-shot seq ${JSON.stringify(expectedTypes)} collected as ${JSON.stringify(gotTypes)}`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-1 [strat:audit-recording] gnosis.query/stream record, gnosis.status does not', async () => {
    const result = await (async () => {
      let handler: GnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const tool = pick(rng, GNOSIS_TOOLS)
        const audit = createQueryAuditLog()
        const engine = makeReadyEngine(WIRE_RESULT_BODY)
        if (tool === 'gnosis.stream') {
          const { client, calls } = makeFakeSse()
          const sengine = createEngineRagStore({
            baseUrl: 'http://127.0.0.1:8080',
            fetch: fakeFetch((method, url) => {
              if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
              throw new Error(`unexpected ${method} ${url}`)
            }),
            sse: client,
          })
          const pump = handler(sengine, 'gnosis.stream', { query: 'q' }, audit)
          await new Promise((r) => setTimeout(r, 0))
          calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
          calls[0].handlers.onEvent('done', '{"type":"done"}')
          calls[0].handlers.onClose()
          await pump
        } else {
          await handler(engine, tool, tool === 'gnosis.status' ? {} : { query: 'q' }, audit)
        }
        const recorded = audit.list().length
        const expectedRecording = tool !== 'gnosis.status' ? 1 : 0
        if (recorded !== expectedRecording) {
          ces.push(`${tool} recorded ${recorded} entries (expected ${expectedRecording})`)
        } else if (recorded === 1 && audit.list()[0].requester !== 'mcp') {
          ces.push(`${tool} entry requester=${audit.list()[0].requester} (expected "mcp")`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-2 [strat:engine-absent] connection-refused surfaces consistently (MCP EngineUnavailable + GUI status unavailable)', async () => {
    const result = await (async () => {
      let handler: GnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`wiring surface unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const tool = pick(rng, ['gnosis.query', 'gnosis.status'])
        const engine = createEngineRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch(() => {
            throw refusedError()
          }),
        })
        const err = await handler(engine, tool, tool === 'gnosis.status' ? {} : { query: 'q' }, null).then(() => null, (e) => e)
        if (!(err instanceof EngineUnavailable) || (err as EngineUnavailable).cause !== 'connection-refused') {
          ces.push(`${tool} connection-refused surfaced ${String(err)}`)
        }
      }
      // GUI half — a GENERATED property over the status-pane HANDLER catching a
      // REJECTED getEngineStatus bridge (§5.6): the handler must render the
      // unavailable state and must NEVER crash on an EngineUnavailable rejection.
      // (Drives the catch-over-bridge path, not a fixed null through the helper.)
      let statusHandler: GnosisStatusPaneHandler
      try {
        statusHandler = await loadStatusPaneHandler()
      } catch (e) {
        ces.push(`gnosis-status pane handler surface unavailable — ${String(e)}`)
        return { held: ces.length === 0, counterexamples: ces }
      }
      for (let g = 0; g < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; g++) {
        const cause = pick(rng, ['connection-refused', 'not-ready', 'unavailable-state'] as const)
        const bridge: () => Promise<HealthReport> = () =>
          Promise.reject(new EngineUnavailable(cause, `engine absent (${cause})`))
        let node: unknown
        try {
          node = await statusHandler({} as never, bridge)
        } catch (e) {
          ces.push(`gnosis-status pane handler crashed on a rejected EngineUnavailable bridge (${cause}): ${String(e)}`)
          continue
        }
        const html = JSON.stringify(node)
        if (!/data-gnosis-state['":\s]*unavailable|unavailable|not.?connect|absent/i.test(html)) {
          ces.push(`gnosis-status pane did not render the unavailable state for a rejected EngineUnavailable bridge (${cause})`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-TP-2 [strat:ready-gate] gnosis.stream READY-gate determinism', async () => {
    const result = await (async () => {
      let handler: GnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const state = pick(rng, ['Ready', 'Starting', 'Degraded', 'Unavailable'] as const)
        // P-SM-1 faithfulness (§5.2/§5.6): lastError is Some exactly when Degraded,
        // so the Degraded variant must carry a non-null lastError (DEGRADED_REPORT);
        // otherwise decodeHealthReport rejects it as an EngineError(502), not the
        // spec-correct EngineUnavailable(503) the READY-gate must surface.
        const healthReport = state === 'Degraded' ? DEGRADED_REPORT : { ...READY_REPORT, state }
        const { client, calls } = makeFakeSse()
        const engine = createEngineRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch((method, url) => {
            if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(healthReport)
            throw new Error(`unexpected ${method} ${url}`)
          }),
          sse: client,
        })
        const pump = handler(engine, 'gnosis.stream', { query: 'q' }, null)
        // Attach a noop rejection handler immediately: the gate may reject `pump`
        // during the setTimeout(0) gap below, before the branch attaches its real
        // handler — an unhandled rejection would otherwise leak (the non-Ready
        // gate throws EngineUnavailable from the stream's first next()). The
        // branch still observes the rejection via `await pump`.
        void pump.catch(() => {})
        await new Promise((r) => setTimeout(r, 0))
        if (state === 'Ready') {
          calls[0].handlers.onEvent('result', JSON.stringify({ type: 'result', result: WIRE_RESULT_BODY }))
          calls[0].handlers.onEvent('done', '{"type":"done"}')
          calls[0].handlers.onClose()
          const chunks = (await pump).chunks
          if (chunks.map((c) => c.type).join(',') !== 'result,done') {
            ces.push(`Ready gate produced ${chunks.map((c) => c.type).join(',')} (expected result,done)`)
          }
        } else {
          const err = await pump.then(() => null, (e) => e)
          if (!(err instanceof EngineUnavailable)) {
            ces.push(`state ${state} gate produced ${String(err)} (expected EngineUnavailable)`)
          }
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-TP-3 [strat:render-shape] EngineRagResult render path is distinct from the local RagResult', async () => {
    const result = await (async () => {
      let renderers: Awaited<ReturnType<typeof loadRenderers>>
      try {
        renderers = await loadRenderers()
      } catch (e) {
        return { held: false, counterexamples: [`renderer unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        // Generate a plausible EngineRagResult with DISTINCT proxy-specific values
        // so the presence checks are VALUE-precise (a dropped field is caught even
        // if its name happens to appear elsewhere).
        const q = `q${Math.floor(rng() * 1000)}`
        const docId = `d${Math.floor(rng() * 1000)}`
        const nodeId = `n${Math.floor(rng() * 1000)}`
        const citNode = `c${Math.floor(rng() * 1000)}`
        const mode = pick(rng, ['flat', 'vector', 'graph', 'hybrid'] as const)
        const state = pick(rng, ['BROKEN', 'STALE'] as const)
        const r: EngineRagResult = {
          query: q,
          results: [{ documentId: docId, nodeId, score: rng(), snippet: 's', source: 'local' }],
          engine: 'gnosis',
          citations: [{ documentId: docId, nodeId: citNode }],
          trace: { mode, engine: 'gnosis', topK: Math.floor(rng() * 10) + 1, source: 'local' },
          blockedBy: [{ documentId: docId, nodeId, state }],
        }
        const html = JSON.stringify(renderers.gnosisQueryContent({} as never, r))
        // DOES include the proxy-specific fields/citations — precise, valuable
        // presence (the proxy field + its rendered generated value).
        const fieldChecks: Array<[string, string]> = [
          ['query (data-gnosis-query)', 'data-gnosis-query'],
          ['generated query value', q],
          ['result documentId (data-document-id)', 'data-document-id'],
          ['generated result nodeId', nodeId],
          ['citations heading', 'Citations'],
          ['generated citation nodeId', citNode],
          ['trace heading', 'Trace mode'],
          ['generated trace mode', mode],
          ['engine (data-engine)', 'data-engine'],
          ['blockedBy heading', 'Blocked by'],
          ['generated blockedBy state', state],
        ]
        for (const [what, needle] of fieldChecks) {
          if (!html.includes(needle)) {
            ces.push(`render omitted the EngineRagResult ${what} (${html.slice(0, 80)})`)
          }
        }
        // MUST NOT expose the local RagResult-only fields (ranked/context/
        // markdown/lineMap/k). Checked as precise JSON keys ("field") — never a
        // bare single-char substring (the old 'k' trap that false-positived on
        // any incidental letter).
        for (const banned of ['ranked', 'context', 'markdown', 'lineMap', 'k']) {
          if (html.includes(`"${banned}"`)) {
            ces.push(`render references the local RagResult key "${banned}"`)
          }
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })
})
