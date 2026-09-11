/**
 * Blind-test greens — Unit A2: Document-CRUD D4 Wiring.
 * Derived from docs/specs/unit-a2-document-crud-wiring.md (§5.1–§5.11) +
 * the LANDED A1 proxy surface docs/specs/unit-a1-crud-routing-proxy.md
 * (§5.1/§5.4/§5.6/§5.7/§5.8/§5.9) ONLY. No A2-implementation or A2-unit-test read.
 *
 * Live modules: mcp-server.js / security.js / engine-crud-rag-store.js /
 * engine-rag-store.js / authority-store.js / idempotency-registry.js /
 * pane-graph.js. The wiring symbols (handleGnosisTool, the render helpers,
 * createAuthorityStore, createIdempotencyRegistry) are dynamically imported so
 * the test runs against the real implementation.
 */
import { describe, it, expect } from 'vitest'
import { createEngineCrudRagStore } from '../src/main/engine-crud-rag-store.js'
import {
  EngineWireError,
  EngineUnavailable,
  EngineError,
  ConflictError,
} from '../src/main/engine-rag-store.js'
import { groupForTool, defaultSecurityConfig, SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, registeredToolNames } from '../src/main/mcp-server.js'

// Dynamically import the wiring symbols so the test runs against the real
// implementation (the dynamic imports resolve to the actual src/ files once the
// test is placed in the Astrographer repo).
const { handleGnosisTool } = await import('../src/main/mcp-server.js')
const { createAuthorityStore } = await import('../src/main/authority-store.js')
const { createIdempotencyRegistry } = await import('../src/main/idempotency-registry.js')
const { gnosisDocumentsContent, gnosisWikisContent } = await import('../src/renderer/pane-graph.js')

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

const STARTING_REPORT = { ...READY_REPORT, state: 'Starting', version: 'starting' }
const UNAVAILABLE_REPORT = { ...READY_REPORT, state: 'Unavailable', version: 'unavailable' }

const DOC_BODY = {
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

const PUBLISHED_DOC_BODY = { ...DOC_BODY, state: 'Published' }
const ARCHIVED_DOC_BODY = { ...DOC_BODY, state: 'Archived' }
const REV1_DOC_BODY = { ...DOC_BODY, revision: 1 }

const WIKI_BODY = { wiki_id: 'w1', name: 'Wiki One' }

function crudEnvelope(method, resultOrError) {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: { method, ...resultOrError } }
}
const resultEnv = (method, result) => crudEnvelope(method, { result })
const errorEnv = (method, code, message) => crudEnvelope(method, { error: { code, message } })

const CREATE_DOC_ENV = resultEnv('createDocument', DOC_BODY)
const GET_DOC_ENV = resultEnv('getDocument', DOC_BODY)
const UPDATE_DOC_ENV = resultEnv('updateDocument', REV1_DOC_BODY)
const DELETE_DOC_ENV = resultEnv('deleteDocument', null)
const PUBLISH_DOC_ENV = resultEnv('publishDocument', PUBLISHED_DOC_BODY)
const UNPUBLISH_DOC_ENV = resultEnv('unpublishDocument', DOC_BODY)
const ARCHIVE_DOC_ENV = resultEnv('archiveDocument', ARCHIVED_DOC_BODY)
const LIST_DOCS_ENV = resultEnv('listDocuments', { items: [DOC_BODY], total: 1, page: 1, pageSize: 10 })
const CREATE_WIKI_ENV = resultEnv('createWiki', { wiki_id: 'w2', name: 'Wiki Two' })
const GET_WIKI_ENV = resultEnv('getWiki', WIKI_BODY)
const LIST_WIKIS_ENV = resultEnv('listWikis', [WIKI_BODY])

// A malformed getDocument result body (missing required fields) -> EngineError (502).
const MALFORMED_GET_DOC_ENV = crudEnvelope('getDocument', { result: { document_id: 'd1' } })
// A createDocument result with revision != 0 -> UnexpectedRevision -> EngineError (502).
const BAD_REVISION_CREATE_ENV = resultEnv('createDocument', { ...DOC_BODY, revision: 1 })

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function ecnrefused() {
  return Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' })
}

/**
 * A mock fetch dispatcher for the A1 CRUD proxy. Routes /engine/status (the READY
 * gate) and the CRUD endpoints (keyed by "METHOD /suffix"). Captures the request
 * envelopes. A handler of 'ECONNREFUSED' throws a connection-refused error.
 */
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
        let body = null
        try { body = JSON.parse(typeof init?.body === 'string' ? init.body : String(init?.body)) } catch { body = init?.body }
        calls.requests.push({ url: u, method, body })
        if (handler === 'ECONNREFUSED') throw ecnrefused()
        return jsonResponse(handler)
      }
    }
    throw new Error('unexpected fetch url: ' + u)
  }
  fn.calls = calls
  return fn
}

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

const READ_ONLY_TOOLS = ['gnosis.document.get', 'gnosis.document.list', 'gnosis.wiki.get', 'gnosis.wiki.list']
const MUTATING_TOOLS = [
  'gnosis.document.create', 'gnosis.document.update', 'gnosis.document.delete',
  'gnosis.document.publish', 'gnosis.document.unpublish', 'gnosis.document.archive',
  'gnosis.wiki.create',
]
const ALL_11_TOOLS = [...READ_ONLY_TOOLS, ...MUTATING_TOOLS]

const AUTHORITY = { operator: 'user:operator', other: 'user:other' }

// ================================================================ §5.2 group

describe('§5.2 gnosis-edit group + security', () => {
  it('G15 tool-name -> group mapping is total/unambiguous (P-IM-1)', () => {
    for (const t of READ_ONLY_TOOLS) expect(groupForTool(t)).toBe('gnosis')
    for (const t of MUTATING_TOOLS) expect(groupForTool(t)).toBe('gnosis-edit')
  })

  it('G16 gnosis-edit group is default-OFF + VALID_GROUPS membership (P-SM-1)', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toContain('read')
    expect(cfg.enabled).toContain('dispatch')
    expect(cfg.enabled).not.toContain('gnosis-edit')
    const gate = new SecurityGate()
    expect(gate.toolAllowed('gnosis.document.create')).toBe(false)
    expect(gate.toolAllowed('gnosis.document.get')).toBe(false)
  })

  it('G17 enabling gnosis/gnosis-edit grants the tools invocation-level', () => {
    const readGate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis'] })
    for (const t of READ_ONLY_TOOLS) expect(readGate.toolAllowed(t)).toBe(true)
    const editGate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis-edit'] })
    for (const t of MUTATING_TOOLS) expect(editGate.toolAllowed(t)).toBe(true)
  })

  it('G18 a gnosis.* name NOT in TOOL_GROUPS -> null (fail-closed)', () => {
    expect(groupForTool('gnosis.document.other')).toBeNull()
    expect(groupForTool('gnosis.frobnicate')).toBeNull()
  })

  it('G19 ALL_TOOLS rows + register-gating', () => {
    const all = ProvidentMcpServer.ALL_TOOLS
    for (const t of ALL_11_TOOLS) expect(all).toContain(t)
    const off = registeredToolNames(new SecurityGate(), all)
    for (const t of ALL_11_TOOLS) expect(off).not.toContain(t)
    const readOn = registeredToolNames(
      new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis'] }),
      all,
    )
    for (const t of READ_ONLY_TOOLS) expect(readOn).toContain(t)
    for (const t of MUTATING_TOOLS) expect(readOn).not.toContain(t)
    const editOn = registeredToolNames(
      new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'gnosis-edit'] }),
      all,
    )
    for (const t of MUTATING_TOOLS) expect(editOn).toContain(t)
  })
})

// ============================================ §5.1 / §5.8-1..11 happy paths

describe('§5.1/§5.8 the 11 document/wiki tools happy paths (mock transport — §5.6)', () => {
  const authority = createAuthorityStore(AUTHORITY)

  it('G1 gnosis.document.get happy -> typed Document', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents/d1': GET_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxy, null, null)
    expect(out).toMatchObject({
      documentId: 'd1', wikiId: 'w1', revision: 0, state: 'Draft',
      title: 'Getting Started', tags: ['guide'], author: 'alice',
    })
    expect(out.graph).toEqual({ nodes: [], edges: [] })
  })

  it('G2 gnosis.document.list happy -> typed DocumentList', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents': LIST_DOCS_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(null, 'gnosis.document.list', { wikiId: 'w1' }, null, proxy, null, null)
    expect(out).toMatchObject({ total: 1, page: 1, pageSize: 10 })
    expect(out.items[0]).toMatchObject({ documentId: 'd1', title: 'Getting Started' })
  })

  it('G3 gnosis.wiki.get happy -> typed Wiki', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /wikis/w1': GET_WIKI_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(null, 'gnosis.wiki.get', { wikiId: 'w1' }, null, proxy, null, null)
    expect(out).toEqual({ wikiId: 'w1', name: 'Wiki One' })
  })

  it('G4 gnosis.wiki.list happy -> typed Wiki[]', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /wikis': LIST_WIKIS_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(null, 'gnosis.wiki.list', {}, null, proxy, null, null)
    expect(out).toEqual([{ wikiId: 'w1', name: 'Wiki One' }])
  })

  it('G5 gnosis.document.create happy -> typed Document (revision:0, Draft)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.create',
      { callerId: 'operator', wikiId: 'w1', title: 'Getting Started', tags: ['guide'], author: 'alice' },
      null, proxy, authority, null,
    )
    expect(out).toMatchObject({ documentId: 'd1', revision: 0, state: 'Draft', title: 'Getting Started' })
  })

  it('G6 gnosis.document.update happy -> typed Document', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/update': UPDATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.update',
      { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } },
      null, proxy, authority, null,
    )
    expect(out).toMatchObject({ documentId: 'd1', revision: 1 })
  })

  it('G7 gnosis.document.delete happy -> void', async () => {
    const fetch = crudMockFetch({ routes: { 'DELETE /documents/d1': DELETE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.delete', { callerId: 'operator', documentId: 'd1' },
      null, proxy, authority, null,
    )
    expect(out).toBeUndefined()
  })

  it('G8 gnosis.document.publish happy -> typed Document (Published)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/publish': PUBLISH_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.publish', { callerId: 'operator', documentId: 'd1' },
      null, proxy, authority, null,
    )
    expect(out).toMatchObject({ documentId: 'd1', state: 'Published' })
  })

  it('G9 gnosis.document.unpublish happy -> typed Document (Draft)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/unpublish': UNPUBLISH_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.unpublish', { callerId: 'operator', documentId: 'd1' },
      null, proxy, authority, null,
    )
    expect(out).toMatchObject({ documentId: 'd1', state: 'Draft' })
  })

  it('G10 gnosis.document.archive happy -> typed Document (Archived)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/archive': ARCHIVE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.document.archive', { callerId: 'operator', documentId: 'd1' },
      null, proxy, authority, null,
    )
    expect(out).toMatchObject({ documentId: 'd1', state: 'Archived' })
  })

  it('G11 gnosis.wiki.create happy -> typed Wiki', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /wikis': CREATE_WIKI_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const out = await handleGnosisTool(
      null, 'gnosis.wiki.create', { callerId: 'operator', name: 'Wiki Two' },
      null, proxy, authority, null,
    )
    expect(out).toEqual({ wikiId: 'w2', name: 'Wiki Two' })
  })
})

// ============================================ §5.1 body-construction rule

describe('§5.1 body-construction rule (null-when-None)', () => {
  const authority = createAuthorityStore(AUTHORITY)

  it('G12 create body: absent tags/author -> null (never [])', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 'Getting Started' },
      null, proxy, authority, null,
    )
    const body = fetch.calls.requests[0].body.payload.args.body
    expect(body).toEqual({ title: 'Getting Started', tags: null, author: null })
  })

  it('G13 update body: absent title/tags -> null', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/update': UPDATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(
      null, 'gnosis.document.update',
      { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } },
      null, proxy, authority, null,
    )
    const body = fetch.calls.requests[0].body.payload.args.body
    expect(body).toEqual({ base_revision: 0, graph: { nodes: [], edges: [] }, title: null, tags: null })
  })

  it('G14 list body: absent state/tag/page/pageSize -> null', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents': LIST_DOCS_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(null, 'gnosis.document.list', { wikiId: 'w1' }, null, proxy, null, null)
    const body = fetch.calls.requests[0].body.payload.args.body
    expect(body).toEqual({ state: null, tag: null, page: null, page_size: null })
  })
})

// ============================================ §5.3 routing + audit + caller

describe('§5.3 handleGnosisTool routing + audit + caller threading', () => {
  const authority = createAuthorityStore(AUTHORITY)

  it('G20 the CRUD tools do NOT record to the QueryAuditLog', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents/d1': GET_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const audit = makeAudit()
    await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, audit, proxy, null, null)
    expect(audit.entries).toHaveLength(0)
  })

  it('G21 a read-only tool never carries caller', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents/d1': GET_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxy, null, null)
    const args = fetch.calls.requests[0].body.payload.args
    expect('caller' in args).toBe(false)
  })

  it('G22 a mutating tool always threads the caller credential', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 'Getting Started' },
      null, proxy, authority, null,
    )
    const args = fetch.calls.requests[0].body.payload.args
    expect(args.caller).toBe('user:operator')
  })

  it('G23 unknown gnosis.* name -> Error(unknown gnosis tool: <name>)', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents/d1': GET_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await expect(handleGnosisTool(null, 'gnosis.frobnicate', {}, null, proxy, null, null))
      .rejects.toThrow('unknown gnosis tool: gnosis.frobnicate')
  })
})

// ============================================ §5.4 AuthorityStore + IdempotencyRegistry

describe('§5.4 AuthorityStore + IdempotencyRegistry', () => {
  it('G24 createAuthorityStore resolves the caller credential + editors()', () => {
    const store = createAuthorityStore(AUTHORITY)
    expect(store.callerCredential('operator')).toBe('user:operator')
    expect(store.callerCredential('other')).toBe('user:other')
    expect(store.callerCredential('unknown')).toBeNull()
    const editors = store.editors()
    expect(editors).toContain('operator')
    expect(editors).toContain('other')
  })

  it('G25 createIdempotencyRegistry is bounded (LRU)', () => {
    const reg = createIdempotencyRegistry({ maxEntries: 2 })
    reg.set('a', 'r1', 'result-a')
    reg.set('a', 'r2', 'result-b')
    reg.set('a', 'r3', 'result-c') // evicts r1 (LRU)
    expect(reg.get('a', 'r1')).toBeUndefined()
    expect(reg.get('a', 'r2')).toBe('result-b')
    expect(reg.get('a', 'r3')).toBe('result-c')
  })

  it('G26 idempotency dedup happy: duplicate requestId returns the first result without a new call', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const authority = createAuthorityStore(AUTHORITY)
    const idem = createIdempotencyRegistry()
    const args = { callerId: 'operator', wikiId: 'w1', title: 'Getting Started', requestId: 'r1' }
    const first = await handleGnosisTool(null, 'gnosis.document.create', args, null, proxy, authority, idem)
    const second = await handleGnosisTool(null, 'gnosis.document.create', args, null, proxy, authority, idem)
    expect(second).toEqual(first)
    expect(fetch.calls.requests).toHaveLength(1) // only one proxy call issued
  })

  it('G27 idempotency dedup is caller-scoped: a caller never receives another caller result', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const authority = createAuthorityStore(AUTHORITY)
    const idem = createIdempotencyRegistry()
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 'A', requestId: 'r1' },
      null, proxy, authority, idem,
    )
    // A different caller with the SAME requestId issues a fresh create.
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'other', wikiId: 'w1', title: 'B', requestId: 'r1' },
      null, proxy, authority, idem,
    )
    expect(fetch.calls.requests).toHaveLength(2)
  })

  it('G28 boot construction: createEngineCrudRagStore does no network I/O', () => {
    let called = false
    const proxy = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: async () => { called = true; throw new Error('should not be called') },
    })
    expect(called).toBe(false)
    for (const m of [
      'createDocument', 'getDocument', 'updateDocument', 'deleteDocument',
      'publishDocument', 'unpublishDocument', 'archiveDocument', 'listDocuments',
      'createWiki', 'getWiki', 'listWikis',
    ]) {
      expect(typeof proxy[m]).toBe('function')
    }
  })
})

// ============================================ §5.5 GUI render helpers

describe('§5.5 GUI document-editor/wiki render helpers', () => {
  const ctx = makeCtx()
  const doc = {
    documentId: 'd1', wikiId: 'w1', revision: 0, state: 'Draft',
    graph: { nodes: [], edges: [] }, title: 'Getting Started',
    createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z',
    tags: ['guide'], author: 'alice',
  }
  const wiki = { wikiId: 'w1', name: 'Wiki One' }

  it('G29 gnosisDocumentsContent happy -> renders the document surface', () => {
    const out = gnosisDocumentsContent(ctx, {
      wikis: [wiki],
      documents: { items: [doc], total: 1, page: 1, pageSize: 10 },
      document: doc,
      conflict: null,
    })
    const walked = collect(out)
    expect(walked.values.has('Wiki One')).toBe(true)
    expect(hasContaining(walked, 'Getting Started')).toBe(true)
    expect(walked.values.has('d1')).toBe(true)
  })

  it('G30 gnosisWikisContent happy -> renders the wiki surface', () => {
    const out = gnosisWikisContent(ctx, { wikis: [wiki], wiki })
    const walked = collect(out)
    expect(walked.values.has('Wiki One')).toBe(true)
    expect(walked.values.has('w1')).toBe(true)
  })

  it('G31 gnosisDocumentsContent 409 conflict state -> renders the conflict message, never a crash', () => {
    const conflict = new ConflictError('optimistic-concurrency conflict: stale base revision')
    const out = gnosisDocumentsContent(ctx, { wikis: null, documents: null, document: null, conflict })
    const walked = collect(out)
    expect(hasContaining(walked, 'optimistic-concurrency conflict')).toBe(true)
  })

  it('G32 gnosisDocumentsContent(ctx, null) -> empty state, never a TypeError', () => {
    expect(() => gnosisDocumentsContent(ctx, null)).not.toThrow()
    const walked = collect(gnosisDocumentsContent(ctx, null))
    expect(walked.values.has('Getting Started')).toBe(false)
  })

  it('G33 gnosisWikisContent(ctx, null) -> empty state, never a TypeError', () => {
    expect(() => gnosisWikisContent(ctx, null)).not.toThrow()
    const walked = collect(gnosisWikisContent(ctx, null))
    expect(walked.values.has('Wiki One')).toBe(false)
  })
})

// ================================================================ §5.9 fail

describe('§5.9 fail-states', () => {
  const authority = createAuthorityStore(AUTHORITY)

  it('F1-F11 null CRUD engine -> Error(<tool>: no engine crud rag store configured)', async () => {
    const cases = [
      ['gnosis.document.get', { documentId: 'd1' }],
      ['gnosis.document.list', { wikiId: 'w1' }],
      ['gnosis.wiki.get', { wikiId: 'w1' }],
      ['gnosis.wiki.list', {}],
      ['gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' }],
      ['gnosis.document.update', { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }],
      ['gnosis.document.delete', { callerId: 'operator', documentId: 'd1' }],
      ['gnosis.document.publish', { callerId: 'operator', documentId: 'd1' }],
      ['gnosis.document.unpublish', { callerId: 'operator', documentId: 'd1' }],
      ['gnosis.document.archive', { callerId: 'operator', documentId: 'd1' }],
      ['gnosis.wiki.create', { callerId: 'operator', name: 'n' }],
    ]
    for (const [name, args] of cases) {
      await expect(handleGnosisTool(null, name, args, null, null, null, null))
        .rejects.toThrow(`${name}: no engine crud rag store configured`)
    }
  })

  it('F12 a mutating tool with a no-authority callerId -> caller-side deny, no proxy call', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const emptyAuthority = createAuthorityStore({})
    for (const t of MUTATING_TOOLS) {
      const args = t === 'gnosis.document.create'
        ? { callerId: 'unknown', wikiId: 'w1', title: 't' }
        : t === 'gnosis.document.update'
          ? { callerId: 'unknown', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }
          : t === 'gnosis.wiki.create'
            ? { callerId: 'unknown', name: 'n' }
            : { callerId: 'unknown', documentId: 'd1' }
      await expect(handleGnosisTool(null, t, args, null, proxy, emptyAuthority, null))
        .rejects.toThrow(`${t}: caller has no edit authority`)
    }
    expect(fetch.calls.requests).toHaveLength(0) // NO proxy call issued
  })

  it('F13 a mutating tool with a null/absent authorityStore -> caller-side deny (fail-closed)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await expect(handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' },
      null, proxy, null, null,
    )).rejects.toThrow('gnosis.document.create: caller has no edit authority')
    expect(fetch.calls.requests).toHaveLength(0)
  })

  it('F14-F31 per-method StoreError fail-states -> the typed error', async () => {
    const cases = [
      // [tool, args, route, envelope, expectedClass, expectedStatus]
      ['gnosis.document.get', { documentId: 'd1' }, 'GET /documents/d1',
        errorEnv('getDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.list', { wikiId: 'w1' }, 'GET /documents',
        errorEnv('listDocuments', 'wiki_not_found', 'no wiki'), EngineWireError, 404],
      ['gnosis.document.list', { wikiId: 'w1' }, 'GET /documents',
        errorEnv('listDocuments', 'validation_error', 'bad page'), EngineWireError, 400],
      ['gnosis.wiki.get', { wikiId: 'w1' }, 'GET /wikis/w1',
        errorEnv('getWiki', 'wiki_not_found', 'no wiki'), EngineWireError, 404],
      ['gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' }, 'POST /documents',
        errorEnv('createDocument', 'wiki_not_found', 'no wiki'), EngineWireError, 404],
      ['gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' }, 'POST /documents',
        errorEnv('createDocument', 'validation_error', 'bad title'), EngineWireError, 400],
      ['gnosis.document.update', { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, 'POST /documents/d1/update',
        errorEnv('updateDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.update', { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, 'POST /documents/d1/update',
        errorEnv('updateDocument', 'validation_error', 'bad graph'), EngineWireError, 400],
      ['gnosis.document.update', { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, 'POST /documents/d1/update',
        errorEnv('updateDocument', 'conflict', 'stale base revision'), ConflictError, 409],
      ['gnosis.document.delete', { callerId: 'operator', documentId: 'd1' }, 'DELETE /documents/d1',
        errorEnv('deleteDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.delete', { callerId: 'operator', documentId: 'd1' }, 'DELETE /documents/d1',
        errorEnv('deleteDocument', 'doc_in_use', 'in use'), EngineWireError, 409],
      ['gnosis.document.publish', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/publish',
        errorEnv('publishDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.publish', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/publish',
        errorEnv('publishDocument', 'unresolved_reference', 'unresolved'), EngineWireError, 422],
      ['gnosis.document.unpublish', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/unpublish',
        errorEnv('unpublishDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.unpublish', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/unpublish',
        errorEnv('unpublishDocument', 'invalid_state', 'bad state'), EngineWireError, 409],
      ['gnosis.document.archive', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/archive',
        errorEnv('archiveDocument', 'not_found', 'not found'), EngineWireError, 404],
      ['gnosis.document.archive', { callerId: 'operator', documentId: 'd1' }, 'POST /documents/d1/archive',
        errorEnv('archiveDocument', 'invalid_state', 'bad state'), EngineWireError, 409],
      ['gnosis.wiki.create', { callerId: 'operator', name: 'n' }, 'POST /wikis',
        errorEnv('createWiki', 'validation_error', 'bad name'), EngineWireError, 400],
    ]
    for (const [tool, args, route, envelope, cls, status] of cases) {
      const fetch = crudMockFetch({ routes: { [route]: envelope } })
      const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
      const err = await handleGnosisTool(null, tool, args, null, proxy, authority, null)
        .then(() => null, (e) => e)
      expect(err).toBeInstanceOf(cls)
      expect(err.httpStatus).toBe(status)
    }
  })

  it('F32 connection-refused -> EngineUnavailable (503, connection-refused)', async () => {
    const fetch = crudMockFetch({ status: 'ECONNREFUSED' })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxy, null, null)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    expect(err.httpStatus).toBe(503)
  })

  it('F33 non-Ready observed state -> EngineUnavailable (not-ready / unavailable-state)', async () => {
    const proxyStart = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: crudMockFetch({ status: STARTING_REPORT }),
    })
    const e1 = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxyStart, null, null)
      .then(() => null, (e) => e)
    expect(e1).toBeInstanceOf(EngineUnavailable)
    expect(e1.cause).toBe('not-ready')
    expect(e1.httpStatus).toBe(503)

    const proxyUnavail = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: crudMockFetch({ status: UNAVAILABLE_REPORT }),
    })
    const e2 = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxyUnavail, null, null)
      .then(() => null, (e) => e)
    expect(e2).toBeInstanceOf(EngineUnavailable)
    expect(e2.cause).toBe('unavailable-state')
    expect(e2.httpStatus).toBe(503)
  })

  it('F34 malformed wire body -> EngineError (502)', async () => {
    const fetch = crudMockFetch({ routes: { 'GET /documents/d1': MALFORMED_GET_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxy, null, null)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineError)
    expect(err.httpStatus).toBe(502)
  })

  it('F35 CRUD validation failure -> EngineError (502) naming the CrudValidationFailure variant', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': BAD_REVISION_CREATE_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' },
      null, proxy, authority, null,
    ).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineError)
    expect(err.httpStatus).toBe(502)
    expect(String(err.message)).toMatch(/unexpected revision/i)
  })
})

// ================================================================ §5.7 PBT

describe('§5.7 PBT register', () => {
  const authority = createAuthorityStore(AUTHORITY)

  it('P1 P-IM-1 tool-name -> group mapping total/unambiguous', () => {
    const names = new Set(ALL_11_TOOLS)
    expect(names.size).toBe(11)
    for (const t of ALL_11_TOOLS) {
      expect(t.startsWith('gnosis.document.') || t.startsWith('gnosis.wiki.')).toBe(true)
      expect(t.length).toBeGreaterThan(0)
    }
    for (const t of READ_ONLY_TOOLS) expect(groupForTool(t)).toBe('gnosis')
    for (const t of MUTATING_TOOLS) expect(groupForTool(t)).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.other')).toBeNull()
  })

  it('P2 P-IM-2 no credential args are forwarded to the proxy (A7)', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(
      null, 'gnosis.document.create',
      { callerId: 'operator', wikiId: 'w1', title: 't', token: 'SECRET', apiKey: 'K', tls: {}, ca: 'c', cert: 'c', key: 'k' },
      null, proxy, authority, null,
    )
    const args = fetch.calls.requests[0].body.payload.args
    for (const k of CREDENTIAL_KEYS) expect(k in args).toBe(false)
    // The proxy args carry the resolved credential (caller), never a credential arg.
    expect(args.caller).toBe('user:operator')
  })

  it('P3 P-IM-3 caller credential threading is deterministic', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't' },
      null, proxy, authority, null,
    )
    expect(fetch.calls.requests[0].body.payload.args.caller).toBe('user:operator')
    // A no-authority caller is denied caller-side (no proxy call).
    const emptyAuthority = createAuthorityStore({})
    const fetch2 = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy2 = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: fetch2 })
    await expect(handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'unknown', wikiId: 'w1', title: 't' },
      null, proxy2, emptyAuthority, null,
    )).rejects.toThrow('gnosis.document.create: caller has no edit authority')
    expect(fetch2.calls.requests).toHaveLength(0)
  })

  it('P4 P-SM-1 gnosis-edit group default-off + VALID_GROUPS membership', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).not.toContain('gnosis-edit')
    expect(cfg.enabled).toContain('read')
    expect(cfg.enabled).toContain('dispatch')
  })

  it('P5 P-SM-2 409 UX consistent across MCP + GUI', async () => {
    // MCP: gnosis.document.update surfaces ConflictError (409).
    const fetch = crudMockFetch({ routes: { 'POST /documents/d1/update': errorEnv('updateDocument', 'conflict', 'stale base revision') } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(
      null, 'gnosis.document.update',
      { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } },
      null, proxy, authority, null,
    ).then(() => null, (e) => e)
    expect(err).toBeInstanceOf(ConflictError)
    expect(err.httpStatus).toBe(409)
    // GUI: the gnosis-documents pane renders the conflict state.
    const ctx = makeCtx()
    const out = gnosisDocumentsContent(ctx, { wikis: null, documents: null, document: null, conflict: err })
    expect(hasContaining(collect(out), 'stale base revision')).toBe(true)
  })

  it('P6 P-SM-3 idempotency dedup deterministic + caller-scoped', async () => {
    const fetch = crudMockFetch({ routes: { 'POST /documents': CREATE_DOC_ENV } })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const idem = createIdempotencyRegistry()
    const args = { callerId: 'operator', wikiId: 'w1', title: 't', requestId: 'r1' }
    const first = await handleGnosisTool(null, 'gnosis.document.create', args, null, proxy, authority, idem)
    const second = await handleGnosisTool(null, 'gnosis.document.create', args, null, proxy, authority, idem)
    expect(second).toEqual(first)
    expect(fetch.calls.requests).toHaveLength(1)
    // A new (callerId, requestId) issues a fresh create.
    await handleGnosisTool(
      null, 'gnosis.document.create', { callerId: 'operator', wikiId: 'w1', title: 't', requestId: 'r2' },
      null, proxy, authority, idem,
    )
    expect(fetch.calls.requests).toHaveLength(2)
    // A caller never receives another caller's cached result.
    expect(idem.get('other', 'r1')).toBeUndefined()
  })

  it('P7 P-TP-1 tool -> CRUD-method mapping is a bijection', async () => {
    const routes = {
      'GET /documents/d1': GET_DOC_ENV,
      'GET /documents': LIST_DOCS_ENV,
      'GET /wikis/w1': GET_WIKI_ENV,
      'GET /wikis': LIST_WIKIS_ENV,
      'POST /documents': CREATE_DOC_ENV,
      'POST /documents/d1/update': UPDATE_DOC_ENV,
      'DELETE /documents/d1': DELETE_DOC_ENV,
      'POST /documents/d1/publish': PUBLISH_DOC_ENV,
      'POST /documents/d1/unpublish': UNPUBLISH_DOC_ENV,
      'POST /documents/d1/archive': ARCHIVE_DOC_ENV,
      'POST /wikis': CREATE_WIKI_ENV,
    }
    const fetch = crudMockFetch({ routes })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const toolArgs = {
      'gnosis.document.get': { documentId: 'd1' },
      'gnosis.document.list': { wikiId: 'w1' },
      'gnosis.wiki.get': { wikiId: 'w1' },
      'gnosis.wiki.list': {},
      'gnosis.document.create': { callerId: 'operator', wikiId: 'w1', title: 't' },
      'gnosis.document.update': { callerId: 'operator', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } },
      'gnosis.document.delete': { callerId: 'operator', documentId: 'd1' },
      'gnosis.document.publish': { callerId: 'operator', documentId: 'd1' },
      'gnosis.document.unpublish': { callerId: 'operator', documentId: 'd1' },
      'gnosis.document.archive': { callerId: 'operator', documentId: 'd1' },
      'gnosis.wiki.create': { callerId: 'operator', name: 'n' },
    }
    const expectedMethod = {
      'gnosis.document.get': 'getDocument',
      'gnosis.document.list': 'listDocuments',
      'gnosis.wiki.get': 'getWiki',
      'gnosis.wiki.list': 'listWikis',
      'gnosis.document.create': 'createDocument',
      'gnosis.document.update': 'updateDocument',
      'gnosis.document.delete': 'deleteDocument',
      'gnosis.document.publish': 'publishDocument',
      'gnosis.document.unpublish': 'unpublishDocument',
      'gnosis.document.archive': 'archiveDocument',
      'gnosis.wiki.create': 'createWiki',
    }
    const seenMethods = new Set()
    for (const t of ALL_11_TOOLS) {
      await handleGnosisTool(null, t, toolArgs[t], null, proxy, authority, null)
      const method = fetch.calls.requests[fetch.calls.requests.length - 1].body.payload.method
      expect(method).toBe(expectedMethod[t])
      seenMethods.add(method)
    }
    expect(seenMethods.size).toBe(11) // one method per tool, all 11 distinct
  })

  it('P8 P-TP-2 D2 engine-absent surfacing consistent across MCP + GUI', async () => {
    // MCP: connection-refused -> EngineUnavailable (503).
    const fetch = crudMockFetch({ status: 'ECONNREFUSED' })
    const proxy = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch })
    const err = await handleGnosisTool(null, 'gnosis.document.get', { documentId: 'd1' }, null, proxy, null, null)
      .then(() => null, (e) => e)
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect(err.cause).toBe('connection-refused')
    expect(err.httpStatus).toBe(503)
    // GUI: the panes render the unavailable state (null result -> empty state, never a crash).
    const ctx = makeCtx()
    expect(() => gnosisDocumentsContent(ctx, null)).not.toThrow()
    expect(() => gnosisWikisContent(ctx, null)).not.toThrow()
  })
})
