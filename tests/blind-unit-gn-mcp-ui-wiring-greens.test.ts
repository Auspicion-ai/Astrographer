/**
 * Blind-test greens — Unit GN-MCP-UI: Gnosis MCP/UI Wiring.
 * Derived from docs/specs/unit-gn-mcp-ui-wiring.md (§5.1–§5.11) ONLY.
 * Live modules: mcp-server.js / security.js / engine-rag-store.js /
 * pane-graph.js. No wiring-implementation or unit-test read.
 */
import { describe, it, expect } from 'vitest'
import {
  handleGnosisTool,
  ProvidentMcpServer,
  registeredToolNames,
} from '../src/main/mcp-server.js'
import { groupForTool, defaultSecurityConfig, SecurityGate } from '../src/main/security.js'
import { createEngineRagStore, EngineUnavailable, EngineError, TraceUnavailable } from '../src/main/engine-rag-store.js'
import {
  gnosisStatusContent,
  gnosisQueryContent,
  gnosisStatusPaneHandler,
  searchContent,
} from '../src/renderer/pane-graph.js'
import { setEngineConfigBaseUrl, getEngineConfigBaseUrl } from '../src/main/engine-config.js'

// ---------------------------------------------------------------- wire fixtures

const READY_REPORT = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: 'v0.1.0',
  subsystems: {
    store: true, graph: true, lexical: true,
    vector: true, embedding: true, reranker: true,
  },
  lastError: null,
}

const DEGRADED_REPORT = {
  ...READY_REPORT,
  state: 'Degraded',
  subsystems: { ...READY_REPORT.subsystems, embedding: false },
  lastError: 'embedding model offline',
}

const STARTING_REPORT = { ...READY_REPORT, state: 'Starting', version: 'starting' }

const FLAT_BODY = {
  query: 'the query',
  results: [
    { document_id: 'doc-a', node_id: 'node-1', score: 0.95, snippet: 'a snippet', source: 'Local' },
  ],
  engine: 'gnosis',
  citations: [['doc-a', 'node-1']],
  trace: { Flat: { mode: 'Flat', engine: 'gnosis', top_k: 10, source: 'Local' } },
}

const VECTOR_BODY = {
  query: 'q',
  results: [
    { document_id: 'doc-v', node_id: 'node-v', score: 0.8, snippet: 'vector snippet', source: 'Local' },
  ],
  engine: 'gnosis',
  citations: [['doc-v', 'node-v']],
  trace: { Vector: { mode: 'Vector', engine: 'gnosis', top_k: 5, source: 'Local' } },
}

function ragQueryEnvelope(body) {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: body }
}

const FLAT_ENVELOPE = ragQueryEnvelope(FLAT_BODY)
const VECTOR_ENVELOPE = ragQueryEnvelope(VECTOR_BODY)
const NO_TRACE_ENVELOPE = ragQueryEnvelope({ query: 'q', engine: 'gnosis', citations: [] })

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function ecnrefused() {
  return Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' })
}

/** A mock fetch dispatcher: routes /engine/status and /rag/query; captures bodies. */
function mockFetch(handlers) {
  const calls = { status: [], query: [] }
  const fn = async (url, init) => {
    const u = String(url)
    if (u.endsWith('/engine/status')) {
      calls.status.push(url)
      const h = handlers.status
      if (h === 'ECONNREFUSED') throw ecnrefused()
      return jsonResponse(h)
    }
    if (u.endsWith('/rag/query')) {
      let body = null
      try { body = JSON.parse(typeof init?.body === 'string' ? init.body : String(init?.body)) } catch { body = init?.body }
      calls.query.push({ url, body })
      const h = handlers.query
      if (h === 'ECONNREFUSED') throw ecnrefused()
      return jsonResponse(h)
    }
    throw new Error('unexpected fetch url: ' + u)
  }
  fn.calls = calls
  return fn
}

/** A mock SSE client that fires (event, data) pairs then closes. */
function mockSse(pairs) {
  return {
    subscribe(url, { onEvent, onClose }) {
      for (const [event, data] of pairs) onEvent(event, data)
      onClose()
      return { close() {} }
    },
  }
}

const resultFrame = (body) => ['result', JSON.stringify({ type: 'result', result: body })]
const doneFrame = () => ['done', JSON.stringify({ type: 'done' })]
const errorFrame = (code, message) => ['error', JSON.stringify({ type: 'error', code, message })]

function makeAudit() {
  const entries = []
  return {
    entries,
    record(e) { entries.push(e) },
  }
}

function makeCtx() {
  return {
    snapshot: null,
    docHeads: null,
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map(),
    crosslinks: [],
  }
}

/** Walk a LegacyNodeData subtree; collect primitive values + prop keys. */
function collect(obj, out = { values: new Set(), keys: new Set() }) {
  if (obj === null || obj === undefined) return out
  if (typeof obj !== 'object') {
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      out.values.add(obj)
    }
    return out
  }
  if (Array.isArray(obj)) {
    for (const x of obj) collect(x, out)
    return out
  }
  for (const k of Object.keys(obj)) {
    out.keys.add(k)
    collect(obj[k], out)
  }
  return out
}

function hasContaining(walked, substr) {
  for (const v of walked.values) if (String(v).includes(substr)) return true
  return false
}

const CREDENTIAL_KEYS = new Set(['token', 'tls', 'ca', 'cert', 'key', 'apiKey'])

// ================================================================ §5.2 group

describe('§5.2 gnosis group + security', () => {
  it('S1 tool-name -> group mapping is total/unambiguous (P-TP-1)', () => {
    expect(groupForTool('gnosis.query')).toBe('gnosis')
    expect(groupForTool('gnosis.stream')).toBe('gnosis')
    expect(groupForTool('gnosis.status')).toBe('gnosis')
  })

  it('S2 gnosis group is default-OFF (P-IM-2)', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toContain('read')
    expect(cfg.enabled).toContain('dispatch')
    expect(cfg.enabled).not.toContain('gnosis')
    const gate = new SecurityGate()
    expect(gate.toolAllowed('gnosis.query')).toBe(false)
    expect(gate.toolAllowed('gnosis.status')).toBe(false)
  })

  it('S3 enabling the gnosis group grants all three invocation-level', () => {
    const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis'] })
    expect(gate.toolAllowed('gnosis.query')).toBe(true)
    expect(gate.toolAllowed('gnosis.stream')).toBe(true)
    expect(gate.toolAllowed('gnosis.status')).toBe(true)
    expect(gate.enabled.has('gnosis')).toBe(true)
  })

  it('S4 a gnosis.* name NOT in TOOL_GROUPS -> null (fail-closed)', () => {
    expect(groupForTool('gnosis.other')).toBeNull()
  })

  it('S5 ALL_TOOLS rows + register-gating', () => {
    const all = ProvidentMcpServer.ALL_TOOLS
    expect(all).toContain('gnosis.query')
    expect(all).toContain('gnosis.stream')
    expect(all).toContain('gnosis.status')
    const off = registeredToolNames(new SecurityGate(), all)
    expect(off).not.toContain('gnosis.query')
    expect(off).not.toContain('gnosis.stream')
    expect(off).not.toContain('gnosis.status')
    const on = registeredToolNames(
      new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis'] }),
      all,
    )
    expect(on).toContain('gnosis.query')
    expect(on).toContain('gnosis.stream')
    expect(on).toContain('gnosis.status')
  })
})

// ============================================ §5.3 / §5.8-1..6 handleGnosisTool

describe('§5.3 handleGnosisTool routing + audit (mock transport — §5.6 happy)', () => {
  it('S6 gnosis.query happy -> EngineRagResult + one audit entry', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: FLAT_ENVELOPE })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    const out = await handleGnosisTool(proxy, 'gnosis.query', { query: 'the query', topK: 10 }, audit)
    expect(out).not.toBeNull()
    expect(out.engine).toBe('gnosis')
    expect(out.query).toBe('the query')
    expect(out.results[0]).toMatchObject({ documentId: 'doc-a', nodeId: 'node-1', score: 0.95, snippet: 'a snippet', source: 'local' })
    expect(out.citations).toEqual([{ documentId: 'doc-a', nodeId: 'node-1' }])
    expect(out.trace).toMatchObject({ mode: 'flat', engine: 'gnosis', topK: 10, source: 'local' })
    for (const k of ['ranked', 'context', 'markdown', 'lineMap', 'k']) {
      expect(k in out).toBe(false)
    }
    expect(audit.entries).toHaveLength(1)
    expect(audit.entries[0]).toMatchObject({ query: 'the query', mode: 'flat', resultCount: 1, requester: 'mcp' })
  })

  it('S7 gnosis.query full mode set passthrough (vector) -> vector trace + widened audit mode', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: VECTOR_ENVELOPE })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    const out = await handleGnosisTool(proxy, 'gnosis.query', { query: 'q', mode: 'vector', topK: 5 }, audit)
    expect(out.trace).toMatchObject({ mode: 'vector', engine: 'gnosis', topK: 5, source: 'local' })
    expect(audit.entries[0].mode).toBe('vector')
  })

  it('S8 gnosis.stream happy -> { chunks } + audit entry', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: 'ECONNREFUSED' })
    const sse = mockSse([resultFrame(FLAT_BODY), doneFrame()])
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch, sse })
    const audit = makeAudit()
    const out = await handleGnosisTool(proxy, 'gnosis.stream', { query: 'the query' }, audit)
    expect(out.chunks).toHaveLength(2)
    expect(out.chunks[0].type).toBe('result')
    expect(out.chunks[0].result.engine).toBe('gnosis')
    expect(out.chunks[1]).toEqual({ type: 'done' })
    expect(audit.entries).toHaveLength(1)
    expect(audit.entries[0]).toMatchObject({ requester: 'mcp', resultCount: 1 })
  })

  it('S9 gnosis.stream error-then-done -> { chunks } + resultCount 0', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: 'ECONNREFUSED' })
    const sse = mockSse([errorFrame('validation_error', 'empty query'), doneFrame()])
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch, sse })
    const audit = makeAudit()
    const out = await handleGnosisTool(proxy, 'gnosis.stream', { query: 'q' }, audit)
    expect(out.chunks[0]).toMatchObject({ type: 'error', code: 'validation_error', message: 'empty query' })
    expect(out.chunks[1]).toEqual({ type: 'done' })
    expect(audit.entries).toHaveLength(1)
    expect(audit.entries[0].resultCount).toBe(0)
  })

  it('S10 gnosis.status happy -> HealthReport; audit UNCHANGED', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: 'ECONNREFUSED' })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    const out = await handleGnosisTool(proxy, 'gnosis.status', {}, audit)
    expect(out.state).toBe('Ready')
    expect(out.subsystems.store).toBe(true)
    expect(out.subsystems.reranker).toBe(true)
    expect(out.lastError).toBeNull()
    expect(audit.entries).toHaveLength(0)
  })

  it('S11 gnosis.status Degraded -> faithful projection, NOT an error', async () => {
    const fetch = mockFetch({ status: DEGRADED_REPORT, query: 'ECONNREFUSED' })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(proxy, 'gnosis.status', {}, null)
    expect(out.state).toBe('Degraded')
    expect(out.subsystems.embedding).toBe(false)
    expect(out.lastError).not.toBeNull()
  })
})

// ================================================================ §5.9 fail

describe('§5.9 fail-states', () => {
  it('S12-S14 null-engine guards', async () => {
    const audit = makeAudit()
    await expect(handleGnosisTool(null, 'gnosis.query', { query: 'q' }, audit))
      .rejects.toThrow('gnosis.query: no engine rag store configured')
    await expect(handleGnosisTool(null, 'gnosis.stream', { query: 'q' }, audit))
      .rejects.toThrow('gnosis.stream: no engine rag store configured')
    await expect(handleGnosisTool(null, 'gnosis.status', {}, audit))
      .rejects.toThrow('gnosis.status: no engine rag store configured')
  })

  it('S15-S21 gnosis.query arg validation', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: FLAT_ENVELOPE })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: '' }, audit))
      .rejects.toThrow('gnosis.query: query must be a non-empty string')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', topK: 0 }, audit))
      .rejects.toThrow('gnosis.query: topK must be an integer in [1, 50]')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', topK: 51 }, audit))
      .rejects.toThrow('gnosis.query: topK must be an integer in [1, 50]')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', topK: 1.5 }, audit))
      .rejects.toThrow('gnosis.query: topK must be an integer in [1, 50]')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', mode: 'bogus' }, audit))
      .rejects.toThrow('gnosis.query: mode must be "flat", "graph", "vector", or "hybrid"')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', maxHops: 10 }, audit))
      .rejects.toThrow('gnosis.query: maxHops must be an integer in [1, 5]')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', expand: 'all' }, audit))
      .rejects.toThrow('gnosis.query: expand must be "none" or "parent"')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', maxParentContext: -1 }, audit))
      .rejects.toThrow('gnosis.query: maxParentContext must be a positive integer')
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q', filters: { nodeKind: 'bogus' } }, audit))
      .rejects.toThrow('gnosis.query: filters malformed')
  })

  it('S22 gnosis.stream validation with the gnosis.stream: prefix', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: mockFetch({ status: READY_REPORT }) })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.stream', { query: '' }, audit))
      .rejects.toThrow('gnosis.stream: query must be a non-empty string')
    await expect(handleGnosisTool(proxy, 'gnosis.stream', { query: 'q', mode: 'bogus' }, audit))
      .rejects.toThrow('gnosis.stream: mode must be "flat", "graph", "vector", or "hybrid"')
  })

  it('S23 gnosis.query connection-refused -> EngineUnavailable (503, connection-refused)', async () => {
    const fetch = mockFetch({ status: 'ECONNREFUSED', query: 'ECONNREFUSED' })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.query', { query: 'q' }, audit))
      .rejects.toBeInstanceOf(EngineUnavailable)
  })

  it('S24 gnosis.query non-Ready observed state -> EngineUnavailable (not-ready / unavailable-state)', async () => {
    const proxyStart = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: mockFetch({ status: STARTING_REPORT }) })
    const audit = makeAudit()
    const e1 = await handleGnosisTool(proxyStart, 'gnosis.query', { query: 'q' }, audit).then(() => null, (e) => e)
    expect(e1).toBeInstanceOf(EngineUnavailable)
    expect(e1.cause).toBe('not-ready')
    expect(e1.httpStatus).toBe(503)

    const proxyUnavail = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: mockFetch({ status: { ...READY_REPORT, state: 'Unavailable' } }),
    })
    const e2 = await handleGnosisTool(proxyUnavail, 'gnosis.query', { query: 'q' }, audit).then(() => null, (e) => e)
    expect(e2).toBeInstanceOf(EngineUnavailable)
    expect(e2.cause).toBe('unavailable-state')
  })

  it('S25 gnosis.query malformed wire body (missing trace) -> TraceUnavailable (502)', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: NO_TRACE_ENVELOPE })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(proxy, 'gnosis.query', { query: 'q' }, null)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(TraceUnavailable)
    expect(err.httpStatus).toBe(502)
  })

  it('S26 gnosis.stream non-Ready gate -> EngineUnavailable (tool-level throw)', async () => {
    const neverSse = { subscribe(url, h) { return { close() {} } } }
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: mockFetch({ status: STARTING_REPORT }), sse: neverSse })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.stream', { query: 'q' }, audit))
      .rejects.toBeInstanceOf(EngineUnavailable)
  })

  it('S27 gnosis.stream premature close before done -> EngineUnavailable (503, connection-refused), no partial', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: 'ECONNREFUSED' })
    // sse closes immediately with no frames
    const sse = { subscribe(url, { onClose }) { onClose(); return { close() {} } } }
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch, sse })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.stream', { query: 'q' }, audit))
      .rejects.toBeInstanceOf(EngineUnavailable)
  })

  it('S28 gnosis.status connection-refused -> EngineUnavailable (503, connection-refused)', async () => {
    const fetch = mockFetch({ status: 'ECONNREFUSED', query: 'ECONNREFUSED' })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.status', {}, audit))
      .rejects.toBeInstanceOf(EngineUnavailable)
  })

  it('S29 gnosis.status malformed report -> EngineError (502)', async () => {
    const malformed = { schemaVersion: 1, idFormat: 'opaque-string-v1', state: 'Ready' }
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: mockFetch({ status: malformed }) })
    const audit = makeAudit()
    await expect(handleGnosisTool(proxy, 'gnosis.status', {}, audit))
      .rejects.toBeInstanceOf(EngineError)
  })

  it('S30 unknown gnosis.* name -> Error(unknown gnosis tool: <name>)', async () => {
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: mockFetch({ status: READY_REPORT }) })
    await expect(handleGnosisTool(proxy, 'gnosis.frobnicate', {}, null))
      .rejects.toThrow('unknown gnosis tool: gnosis.frobnicate')
  })
})

// ==================================================== §5.6 / §5.5 GUI + D2

describe('§5.6/§5.5 GUI panes + EngineRagResult render path', () => {
  const ctx = makeCtx()

  it('S31 gnosisStatusContent renders the HealthReport', () => {
    const out = gnosisStatusContent(ctx, READY_REPORT)
    const walked = collect(out)
    expect(walked.values.has('Ready')).toBe(true)
    expect(walked.values.has('v0.1.0')).toBe(true)
    for (const key of ['store', 'graph', 'lexical', 'vector', 'embedding', 'reranker']) {
      expect(walked.values.has(key)).toBe(true) // subsystem flags by name
    }
    expect(hasContaining(walked, ': up')).toBe(true) // the subsystems are reported up
    expect(hasContaining(walked, 'lastError')).toBe(true)
    expect(walked.keys.has('data-gnosis-state')).toBe(true)
  })

  it('S32 gnosisStatusContent(ctx, null) -> unavailable state, never a TypeError', () => {
    expect(() => gnosisStatusContent(ctx, null)).not.toThrow()
    const walked = collect(gnosisStatusContent(ctx, null))
    expect(walked.values.has('Ready')).toBe(false)
    expect(walked.values.has('v0.1.0')).toBe(false)
    expect(walked.values.size).toBeGreaterThan(0) // a rendered (unavailable) state, not empty
  })

  it('S33 gnosisStatusPaneHandler bridge-rejection -> unavailable state, never throws', async () => {
    const handlerOut = await gnosisStatusPaneHandler(ctx, async () => {
      throw new EngineUnavailable('connection-refused', 'no engine')
    })
    expect(handlerOut).toEqual(gnosisStatusContent(ctx, null))
    expect(collect(handlerOut).values.has('Ready')).toBe(false)
  })

  it('S34 gnosisQueryContent renders the EngineRagResult via a distinct path (no local RagResult keys)', () => {
    const result = {
      query: 'the query',
      results: [{ documentId: 'doc-a', nodeId: 'node-1', score: 0.95, snippet: 'a snippet', source: 'local' }],
      engine: 'gnosis',
      citations: [{ documentId: 'doc-a', nodeId: 'node-1' }],
      trace: { mode: 'flat', engine: 'gnosis', topK: 10, source: 'local' },
    }
    const out = gnosisQueryContent(ctx, result)
    const walked = collect(out)
    expect(walked.values.has('the query')).toBe(true)
    expect(hasContaining(walked, 'a snippet')).toBe(true)
    expect(walked.values.has('doc-a')).toBe(true)
    expect(walked.values.has('node-1')).toBe(true)
    expect(walked.values.has('0.95')).toBe(true)
    expect(walked.values.has('gnosis')).toBe(true)
    expect(walked.values.has('flat')).toBe(true)
    for (const k of ['ranked', 'context', 'markdown', 'lineMap', 'k']) {
      expect(walked.keys.has(k)).toBe(false)
    }
  })

  it('S35 gnosisQueryContent(ctx, null) -> empty state, never a TypeError', () => {
    expect(() => gnosisQueryContent(ctx, null)).not.toThrow()
    const walked = collect(gnosisQueryContent(ctx, null))
    expect(walked.values.has('the query')).toBe(false)
  })

  it('S36 EngineRagResult render path distinct from searchContent (local RagResult)', () => {
    const engineResult = {
      query: 'q',
      results: [{ documentId: 'd', nodeId: 'n', score: 0.5, snippet: 's', source: 'local' }],
      engine: 'gnosis',
      citations: [{ documentId: 'd', nodeId: 'n' }],
      trace: { mode: 'flat', engine: 'gnosis', topK: 5, source: 'local' },
    }
    const engWalked = collect(gnosisQueryContent(ctx, engineResult))
    const localWalked = collect(searchContent(ctx, { query: 'q' }))
    // The gnosis query pane renders the proxy-specific surface (engine/trace/citations)
    // and never the local search-pane chrome; searchContent has its own marker.
    expect(engWalked.values.has('gnosis')).toBe(true)
    expect(engWalked.values.has('flat')).toBe(true)
    expect(localWalked.values.has('pane-search-input')).toBe(true)
    expect(engWalked.values.has('pane-search-input')).toBe(false)
    // The proxy-specific EngineRagResult render does not reference the local RagResult fields.
    for (const k of ['ranked', 'context', 'markdown', 'lineMap', 'k']) {
      expect(engWalked.keys.has(k)).toBe(false)
    }
  })
})

// =========================== §5.2 A7 no-credential-arg (P-IM-1) + §5.4 boots

describe('§5.2 A7 no-credential-arg invariant (+§5.4 lifecycle)', () => {
  it('S37 no gnosis.* tool honors/forwards a credential arg', async () => {
    const fetch = mockFetch({ status: READY_REPORT, query: FLAT_ENVELOPE })
    const proxy = createEngineRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    const out = await handleGnosisTool(
      proxy,
      'gnosis.query',
      { query: 'the query', token: 'SECRET', apiKey: 'K', tls: {}, ca: 'c', cert: 'c', key: 'k' },
      audit,
    )
    // The credential-named args are ignored — the tool resolves with the documented result.
    expect(out.engine).toBe('gnosis')
    // The request forwarded to the engine carries ONLY the documented query/opts —
    // never a credential field (the argument is not accepted as a credential).
    expect(fetch.calls.query).toHaveLength(1)
    const sent = fetch.calls.query[0].body ?? {}
    expect(sent.query).toBe('the query')
    for (const k of CREDENTIAL_KEYS) {
      expect(k in sent).toBe(false)
    }
  })

  it('S38 proxy construction does no network I/O', () => {
    let called = false
    const proxy = createEngineRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: async () => { called = true; throw new Error('should not be called') },
    })
    expect(called).toBe(false)
    for (const m of ['ragQuery', 'ragStream', 'getEngineStatus', 'health', 'waitForReady']) {
      expect(typeof proxy[m]).toBe('function')
    }
  })

  it('S39 the config-seam baseUrl store round-trips (operator-owned, non-credential)', () => {
    const before = getEngineConfigBaseUrl()
    setEngineConfigBaseUrl('http://127.0.0.1:8081')
    expect(getEngineConfigBaseUrl()).toBe('http://127.0.0.1:8081')
    setEngineConfigBaseUrl(before)
    expect(getEngineConfigBaseUrl()).toBe(before)
  })
})
