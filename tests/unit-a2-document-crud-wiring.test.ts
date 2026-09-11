// tests/unit-a2-document-crud-wiring.test.ts — Unit A2: the document-CRUD D4
// wiring — the 11 `gnosis.document.*`/`gnosis.wiki.*` MCP tools + the
// `gnosis-edit` group + the extended `handleGnosisTool` + the
// `McpServerOptions.engineCrudRagStore` injection + the `AuthorityStore` + the
// `IdempotencyRegistry` + the GUI document-editor/wiki screens.
// (docs/specs/unit-a2-document-crud-wiring.md §5.8 happy-path states (19) +
// §5.9 fail-states (40) + the pinned non-throws + §5.1 the 11 tool inputSchemas
// + §5.2 the `gnosis-edit` group + §5.3 the extended main-process handler +
// §5.4 the injection/boot/AuthorityStore/IdempotencyRegistry + §5.5 the D4 GUI
// panes + §5.6 D2 engine-absent + H1 store authority; the A1 proxy surface
// being wired in docs/specs/unit-a1-crud-routing-proxy.md §5.1 — the 11-method
// `EngineCrudRagStore` over the frozen P1a wire.)
//
// The RED set for the WIRING — ALL of which does NOT exist yet:
//   - the extended `handleGnosisTool` (the 7-param signature with
//     engineCrud/authorityStore/idempotency + the 11 document/wiki cases)
//   - the 11 document/wiki names in `McpServerOptions.ALL_TOOLS`
//   - the `security.ts` `ToolGroup` `'gnosis-edit'` + `TOOL_GROUPS` rows +
//     `VALID_GROUPS` member
//   - the `McpServerOptions.engineCrudRagStore`/`authorityStore`/`idempotency`
//     injection + the graph-array tool defs
//   - the `AuthorityStore` + `createAuthorityStore` (src/main/authority-store.ts)
//   - the `IdempotencyRegistry` + `createIdempotencyRegistry`
//     (src/main/idempotency-registry.ts)
//   - the GUI render helpers `gnosisDocumentsContent` / `gnosisWikisContent`
//     (exported from pane-graph.ts) + the `GnosisCrudPanes` host
//     (src/renderer/gnosis-crud-panes.ts) + the two pane registrations
//   - the boot-time `engineCrudRagStore`/`authorityStore`/`idempotency`
//     construction in main.ts
// ALREADY-GREEN (exercises only the LANDED A1 proxy + the LANDED wiring):
//   - the mock-transport happy path (§5.8-19), factory no-IO (§5.8-13 half)
//   - defaultSecurityConfig() does NOT enable `gnosis-edit` (§5.8-12 half)
//   - groupForTool('gnosis.document.other') === null (the fail-closed half of
//     §5.9-37)
//   - the unknown `gnosis.*` name → `Error('unknown gnosis tool: <name>')`
//     (§5.9-36 — the current handler already throws it)
//
// Conventions follow tests/unit-gn-mcp-ui-wiring.test.ts + tests/unit-a1-crud-
// routing-proxy.test.ts (vitest node environment, `.js` import suffix for
// main-process ESM modules, injected mock fetch over the real A1 proxy per
// §5.6, dynamic `import()` for the not-yet-exported wiring symbols so the
// already-green proxy tests still run and are reported separately).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  createEngineCrudRagStore,
  ENGINE_CRUD_ENDPOINTS,
  type EngineCrudRagStore,
  type Document,
  type DocumentList,
  type Wiki,
} from '../src/main/engine-crud-rag-store.js'
import {
  EngineWireError,
  EngineUnavailable,
  EngineError,
  ConflictError,
  ENGINE_ENDPOINTS,
} from '../src/main/engine-rag-store.js'
import {
  groupForTool,
  defaultSecurityConfig,
  SecurityGate,
  toolAllowed,
} from '../src/main/security.js'
import { ProvidentMcpServer } from '../src/main/mcp-server.js'
import { createQueryAuditLog, type QueryAuditLog } from '../src/main/query-audit.js'

// ---------------------------------------------------------------------------
// The pinned A2 surfaces (defined here — the exports do not exist yet) so the
// red calls type-check cleanly.
// ---------------------------------------------------------------------------

/** The extended `handleGnosisTool` signature (§5.3). */
type ExtendedGnosisToolHandler = (
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: QueryAuditLog | null,
  engineCrud?: EngineCrudRagStore | null,
  authorityStore?: AuthorityStore | null,
  idempotency?: IdempotencyRegistry | null,
) => Promise<unknown>

/** The shell-side authority store (H3 — §5.4). */
interface AuthorityStore {
  callerCredential(callerId: string): string | null
  editors(): string[]
}

/** The caller-side idempotency registry (P4 — §5.4). */
interface IdempotencyRegistry {
  get(callerId: string, requestId: string): unknown | undefined
  set(callerId: string, requestId: string, result: unknown): void
}

// ---------------------------------------------------------------------------
// The red-surface dynamic loader. Each returns the wiring symbol or throws a
// CLEAR "not implemented (wiring RED)" marker so the red reason is explicit.
// ---------------------------------------------------------------------------
async function loadHandler(): Promise<ExtendedGnosisToolHandler> {
  const mod = await import('../src/main/mcp-server.js')
  if (typeof mod.handleGnosisTool !== 'function') {
    throw new Error('handleGnosisTool not implemented (wiring RED — needs the Implementer)')
  }
  return mod.handleGnosisTool as ExtendedGnosisToolHandler
}

async function loadRenderers(): Promise<{
  gnosisDocumentsContent: (ctx: unknown, state: unknown) => unknown
  gnosisWikisContent: (ctx: unknown, state: unknown) => unknown
}> {
  const mod: any = await import('../src/renderer/pane-graph.js')
  const missing: string[] = []
  if (typeof mod.gnosisDocumentsContent !== 'function') missing.push('gnosisDocumentsContent')
  if (typeof mod.gnosisWikisContent !== 'function') missing.push('gnosisWikisContent')
  if (missing.length > 0) {
    throw new Error(`${missing.join(', ')} not implemented (wiring RED — needs the Implementer)`)
  }
  return mod
}

// ---------------------------------------------------------------------------
// Fixtures — the typed Document/DocumentList/Wiki shapes + the wire bodies.
// ---------------------------------------------------------------------------
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

const WIKI_WIRE = { wiki_id: 'w1', name: 'My Wiki' }
const WIKI_TYPED: Wiki = { wikiId: 'w1', name: 'My Wiki' }

const DOCLIST_WIRE = { items: [DOC_WIRE], total: 1, page: 1, page_size: 20 }
const DOCLIST_TYPED: DocumentList = {
  items: [DOC_TYPED],
  total: 1,
  page: 1,
  pageSize: 20,
}

// ---------------------------------------------------------------------------
// Mock-transport helpers (replicas of the unit-a1 greens, per §5.6).
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

/** Wrap a CRUD response payload in the full versioned envelope. */
function crudResponseEnvelope(payload: unknown): unknown {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload }
}

function refusedError(): Error {
  const e: any = new Error('connect ECONNREFUSED 127.0.0.1:8080')
  e.code = 'ECONNREFUSED'
  return e
}

interface CrudCall {
  method: string
  url: string
  body: unknown
}

/** A fake fetch that serves a READY gate then a single CRUD endpoint response,
 *  capturing the CRUD request (verb, url, JSON request body). */
function readyGateThenCrud(
  crudHandler: (method: string, url: string, body: unknown) => Response,
  calls: CrudCall[] = [],
): typeof fetch {
  return fakeFetch((method, url, init) => {
    if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
      return jsonResponse(READY_REPORT)
    }
    const body = init?.body ? JSON.parse(init.body as string) : undefined
    calls.push({ method, url, body })
    return crudHandler(method, url, body)
  })
}

/** A CRUD proxy whose endpoint always returns the given response. */
function crudStoreWithResponse(response: Response): EngineCrudRagStore {
  return createEngineCrudRagStore({
    baseUrl: 'http://127.0.0.1:8080',
    fetch: readyGateThenCrud(() => response),
  })
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

/** A test-double authority store from a callerId → credential mapping. */
function makeAuthorityStore(mapping: Record<string, string>): AuthorityStore {
  return {
    callerCredential(callerId) {
      return mapping[callerId] ?? null
    },
    editors() {
      return Object.keys(mapping)
    },
  }
}

/** A test-double idempotency registry (Map-backed, keyed by the callerId +
 *  requestId pair). */
function makeIdempotencyRegistry(): IdempotencyRegistry {
  const m = new Map<string, unknown>()
  return {
    get(callerId, requestId) {
      return m.get(`${callerId}\u0000${requestId}`)
    },
    set(callerId, requestId, result) {
      m.set(`${callerId}\u0000${requestId}`, result)
    },
  }
}

// ===========================================================================
// §5.8 / §5.9 — the 11 document/wiki MCP tools via the extended handleGnosisTool
// (RED until wired).
// ===========================================================================
describe('handleGnosisTool — the 11 document/wiki tools (RED until wired)', () => {
  it('exports handleGnosisTool (the extended main-process handler)', async () => {
    await expect(loadHandler()).resolves.toBeTypeOf('function')
  })

  // --- §5.8 happy states 1–4 (the read-only tools) ---
  it('§5.8-1 gnosis.document.get happy: getDocument → typed Document', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('GET')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1')
        return jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: DOC_WIRE }))
      }),
    })
    const out = await handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud)
    expect(out).toEqual(DOC_TYPED)
  })

  it('§5.8-2 gnosis.document.list happy: listDocuments → typed DocumentList', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('GET')
        expect(url).toBe('http://127.0.0.1:8080/documents')
        return jsonResponse(crudResponseEnvelope({ method: 'listDocuments', result: DOCLIST_WIRE }))
      }),
    })
    const out = await handle(
      null,
      'gnosis.document.list',
      { wikiId: 'w1', state: 'Draft', tag: 'guide', page: 1, pageSize: 20 },
      null,
      engineCrud,
    )
    expect(out).toEqual(DOCLIST_TYPED)
  })

  it('§5.8-3 gnosis.wiki.get happy: getWiki → typed Wiki', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('GET')
        expect(url).toBe('http://127.0.0.1:8080/wikis/w1')
        return jsonResponse(crudResponseEnvelope({ method: 'getWiki', result: WIKI_WIRE }))
      }),
    })
    const out = await handle(null, 'gnosis.wiki.get', { wikiId: 'w1' }, null, engineCrud)
    expect(out).toEqual(WIKI_TYPED)
  })

  it('§5.8-4 gnosis.wiki.list happy: listWikis → typed Wiki[]', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('GET')
        expect(url).toBe('http://127.0.0.1:8080/wikis')
        return jsonResponse(crudResponseEnvelope({ method: 'listWikis', result: [WIKI_WIRE] }))
      }),
    })
    const out = await handle(null, 'gnosis.wiki.list', {}, null, engineCrud)
    expect(out).toEqual([WIKI_TYPED])
  })

  // --- §5.8 happy states 5–11 (the mutating tools) ---
  it('§5.8-5 gnosis.document.create happy: createDocument → typed Document (revision:0, Draft)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/documents')
        return jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.create',
      { callerId: 'alice', wikiId: 'w1', title: 'Getting Started', tags: ['guide'], author: 'alice' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual(DOC_TYPED)
  })

  it('§5.8-6 gnosis.document.update happy: updateDocument → typed Document', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1/update')
        return jsonResponse(crudResponseEnvelope({ method: 'updateDocument', result: DOC_WIRE }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.update',
      { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] }, title: 'Getting Started' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual(DOC_TYPED)
  })

  it('§5.8-7 gnosis.document.delete happy: deleteDocument → void', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('DELETE')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1')
        return jsonResponse(crudResponseEnvelope({ method: 'deleteDocument', result: null }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.delete',
      { callerId: 'alice', documentId: 'd1' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toBeUndefined()
  })

  it('§5.8-8 gnosis.document.publish happy: publishDocument → typed Document (Published)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1/publish')
        return jsonResponse(crudResponseEnvelope({ method: 'publishDocument', result: { ...DOC_WIRE, state: 'Published' } }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.publish',
      { callerId: 'alice', documentId: 'd1' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual({ ...DOC_TYPED, state: 'Published' })
  })

  it('§5.8-9 gnosis.document.unpublish happy: unpublishDocument → typed Document (Draft)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1/unpublish')
        return jsonResponse(crudResponseEnvelope({ method: 'unpublishDocument', result: { ...DOC_WIRE, state: 'Draft' } }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.unpublish',
      { callerId: 'alice', documentId: 'd1' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual({ ...DOC_TYPED, state: 'Draft' })
  })

  it('§5.8-10 gnosis.document.archive happy: archiveDocument → typed Document (Archived)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/documents/d1/archive')
        return jsonResponse(crudResponseEnvelope({ method: 'archiveDocument', result: { ...DOC_WIRE, state: 'Archived' } }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.document.archive',
      { callerId: 'alice', documentId: 'd1' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual({ ...DOC_TYPED, state: 'Archived' })
  })

  it('§5.8-11 gnosis.wiki.create happy: createWiki → typed Wiki', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud((method, url) => {
        expect(method).toBe('POST')
        expect(url).toBe('http://127.0.0.1:8080/wikis')
        return jsonResponse(crudResponseEnvelope({ method: 'createWiki', result: WIKI_WIRE }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const out = await handle(
      null,
      'gnosis.wiki.create',
      { callerId: 'alice', name: 'My Wiki' },
      null,
      engineCrud,
      authority,
    )
    expect(out).toEqual(WIKI_TYPED)
  })

  // --- §5.9 fail-states 1–11 (null CRUD engine) ---
  it('§5.9-1 gnosis.document.get null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, null)).rejects.toThrow(
      'gnosis.document.get: no engine crud rag store configured',
    )
  })
  it('§5.9-2 gnosis.document.list null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.list', { wikiId: 'w1' }, null, null)).rejects.toThrow(
      'gnosis.document.list: no engine crud rag store configured',
    )
  })
  it('§5.9-3 gnosis.wiki.get null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.wiki.get', { wikiId: 'w1' }, null, null)).rejects.toThrow(
      'gnosis.wiki.get: no engine crud rag store configured',
    )
  })
  it('§5.9-4 gnosis.wiki.list null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.wiki.list', {}, null, null)).rejects.toThrow(
      'gnosis.wiki.list: no engine crud rag store configured',
    )
  })
  it('§5.9-5 gnosis.document.create null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, null)).rejects.toThrow(
      'gnosis.document.create: no engine crud rag store configured',
    )
  })
  it('§5.9-6 gnosis.document.update null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, null, null)).rejects.toThrow(
      'gnosis.document.update: no engine crud rag store configured',
    )
  })
  it('§5.9-7 gnosis.document.delete null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.delete', { callerId: 'alice', documentId: 'd1' }, null, null)).rejects.toThrow(
      'gnosis.document.delete: no engine crud rag store configured',
    )
  })
  it('§5.9-8 gnosis.document.publish null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.publish', { callerId: 'alice', documentId: 'd1' }, null, null)).rejects.toThrow(
      'gnosis.document.publish: no engine crud rag store configured',
    )
  })
  it('§5.9-9 gnosis.document.unpublish null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.unpublish', { callerId: 'alice', documentId: 'd1' }, null, null)).rejects.toThrow(
      'gnosis.document.unpublish: no engine crud rag store configured',
    )
  })
  it('§5.9-10 gnosis.document.archive null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.document.archive', { callerId: 'alice', documentId: 'd1' }, null, null)).rejects.toThrow(
      'gnosis.document.archive: no engine crud rag store configured',
    )
  })
  it('§5.9-11 gnosis.wiki.create null CRUD engine throws', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.wiki.create', { callerId: 'alice', name: 'My Wiki' }, null, null)).rejects.toThrow(
      'gnosis.wiki.create: no engine crud rag store configured',
    )
  })

  // --- §5.9 fail-states 12–13 (no-edit-authority / null authority store) ---
  it('§5.9-12 mutating tool with a callerId that has NO edit authority → caller has no edit authority (all 7)', async () => {
    const handle = await loadHandler()
    const authority = makeAuthorityStore({}) // no one has edit authority
    const cases: Array<[string, Record<string, unknown>]> = [
      ['gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }],
      ['gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }],
      ['gnosis.document.delete', { callerId: 'alice', documentId: 'd1' }],
      ['gnosis.document.publish', { callerId: 'alice', documentId: 'd1' }],
      ['gnosis.document.unpublish', { callerId: 'alice', documentId: 'd1' }],
      ['gnosis.document.archive', { callerId: 'alice', documentId: 'd1' }],
      ['gnosis.wiki.create', { callerId: 'alice', name: 'My Wiki' }],
    ]
    for (const [tool, args] of cases) {
      const engineCrud = crudStoreWithResponse(
        jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE })),
      )
      await expect(handle(null, tool, args, null, engineCrud, authority)).rejects.toThrow(
        `${tool}: caller has no edit authority`,
      )
    }
  })

  it('§5.9-13 mutating tool with a null/absent authorityStore → caller has no edit authority (fail-closed)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE })),
    )
    await expect(
      handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, null),
    ).rejects.toThrow('gnosis.document.create: caller has no edit authority')
  })

  // --- §5.9 fail-states 14–31 (the per-method StoreError set) ---
  it('§5.9-14 gnosis.document.get DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'getDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const err = await captureError(handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-15 gnosis.document.list WikiNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'listDocuments', error: { code: 'wiki_not_found', message: 'no wiki' } })),
    )
    const err = await captureError(handle(null, 'gnosis.document.list', { wikiId: 'w1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-16 gnosis.document.list ValidationError (bad page/pageSize) → EngineWireError (400)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'listDocuments', error: { code: 'validation_error', message: 'bad page' } })),
    )
    const err = await captureError(handle(null, 'gnosis.document.list', { wikiId: 'w1', page: 0 }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(400)
  })
  it('§5.9-17 gnosis.wiki.get WikiNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'getWiki', error: { code: 'wiki_not_found', message: 'no wiki' } })),
    )
    const err = await captureError(handle(null, 'gnosis.wiki.get', { wikiId: 'w1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-18 gnosis.document.create WikiNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'createDocument', error: { code: 'wiki_not_found', message: 'no wiki' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-19 gnosis.document.create ValidationError (empty/overlong title) → EngineWireError (400)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'createDocument', error: { code: 'validation_error', message: 'empty title' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: '' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(400)
  })
  it('§5.9-20 gnosis.document.update DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'updateDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-21 gnosis.document.update ValidationError (invalid graph) → EngineWireError (400)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'updateDocument', error: { code: 'validation_error', message: 'invalid graph' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(400)
  })
  it('§5.9-22 gnosis.document.update ConflictError (stale baseRevision) → ConflictError (409) — the 409 UX (H2)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'updateDocument', error: { code: 'conflict', message: 'optimistic-concurrency conflict: stale base revision' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(ConflictError)
    expect((err as ConflictError).httpStatus).toBe(409)
  })
  it('§5.9-23 gnosis.document.delete DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'deleteDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.delete', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-24 gnosis.document.delete DocumentInUse → EngineWireError (409) (delete integrity)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'deleteDocument', error: { code: 'doc_in_use', message: 'in use' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.delete', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(409)
  })
  it('§5.9-25 gnosis.document.publish DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'publishDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.publish', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-26 gnosis.document.publish UnresolvedReference → EngineWireError (422) (the publish gate)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'publishDocument', error: { code: 'unresolved_reference', message: 'unresolved' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.publish', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(422)
  })
  it('§5.9-27 gnosis.document.unpublish DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'unpublishDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.unpublish', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-28 gnosis.document.unpublish InvalidState → EngineWireError (409)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'unpublishDocument', error: { code: 'invalid_state', message: 'not published' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.unpublish', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(409)
  })
  it('§5.9-29 gnosis.document.archive DocumentNotFound → EngineWireError (404)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'archiveDocument', error: { code: 'not_found', message: 'not found' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.archive', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(404)
  })
  it('§5.9-30 gnosis.document.archive InvalidState → EngineWireError (409)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'archiveDocument', error: { code: 'invalid_state', message: 'already archived' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.archive', { callerId: 'alice', documentId: 'd1' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(409)
  })
  it('§5.9-31 gnosis.wiki.create ValidationError (empty/overlong name) → EngineWireError (400)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'createWiki', error: { code: 'validation_error', message: 'empty name' } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.wiki.create', { callerId: 'alice', name: '' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineWireError)
    expect((err as EngineWireError).httpStatus).toBe(400)
  })

  // --- §5.9 fail-states 32–35 (D2 engine-absent + decode-then-validate) ---
  it('§5.9-32 document/wiki tool connection-refused → EngineUnavailable (503, connection-refused)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch(() => {
        throw refusedError()
      }),
    })
    const err = await captureError(handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
    expect((err as EngineUnavailable).cause).toBe('connection-refused')
  })
  it('§5.9-33 document/wiki tool not-Ready observed state → EngineUnavailable (503, not-ready)', async () => {
    const handle = await loadHandler()
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: fakeFetch((method, url) => {
        if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
          return jsonResponse({ ...READY_REPORT, state: 'Starting' })
        }
        throw new Error(`unexpected ${method} ${url}`)
      }),
    })
    const err = await captureError(handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineUnavailable)
    expect((err as EngineUnavailable).httpStatus).toBe(503)
    expect((err as EngineUnavailable).cause).toBe('not-ready')
  })
  it('§5.9-34 document/wiki tool malformed wire body → EngineError (502)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: { document_id: 123 } })),
    )
    const err = await captureError(handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud))
    expect(err).toBeInstanceOf(EngineError)
    expect((err as EngineError).httpStatus).toBe(502)
  })
  it('§5.9-35 document/wiki tool CRUD validation failure → EngineError (502) naming the variant', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: { ...DOC_WIRE, revision: 1 } })),
    )
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const err = await captureError(handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority))
    expect(err).toBeInstanceOf(EngineError)
    expect((err as EngineError).httpStatus).toBe(502)
    expect((err as Error).message).toMatch(/unexpected revision/i)
  })

  // --- §5.9 fail-state 36 (unknown gnosis.* name) ---
  it('§5.9-36 unknown gnosis.* name → throws (GREEN — the current handler already throws it)', async () => {
    const handle = await loadHandler()
    await expect(handle(null, 'gnosis.frobnicate', {}, null, null)).rejects.toThrow(
      'unknown gnosis tool: gnosis.frobnicate',
    )
  })
})

// ===========================================================================
// §5.1 / §5.2 — the 11 tool schemas + the `gnosis-edit` group (RED / GREEN split).
// ===========================================================================
describe('the gnosis-edit group + the tool-name → group mapping', () => {
  it('§5.8-12 defaultSecurityConfig() does NOT enable gnosis-edit (GREEN — already true)', () => {
    expect(defaultSecurityConfig().enabled).not.toContain('gnosis-edit')
  })
  it('§5.8-12 groupForTool returns gnosis for the 4 read-only document/wiki tools (RED)', () => {
    expect(groupForTool('gnosis.document.get')).toBe('gnosis')
    expect(groupForTool('gnosis.document.list')).toBe('gnosis')
    expect(groupForTool('gnosis.wiki.get')).toBe('gnosis')
    expect(groupForTool('gnosis.wiki.list')).toBe('gnosis')
  })
  it('§5.8-12 groupForTool returns gnosis-edit for the 7 mutating document/wiki tools (RED)', () => {
    expect(groupForTool('gnosis.document.create')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.update')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.delete')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.publish')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.unpublish')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.document.archive')).toBe('gnosis-edit')
    expect(groupForTool('gnosis.wiki.create')).toBe('gnosis-edit')
  })
  it('§5.9-37 a gnosis.* name NOT in TOOL_GROUPS → null (fail-closed) (GREEN — already null)', () => {
    expect(groupForTool('gnosis.document.other')).toBeNull()
  })
  it('P-SM-1 — VALID_GROUPS admits the gnosis-edit group via SecurityGate.apply (RED)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis-edit', 'read', 'dispatch'] })
    expect(gate.enabled).toContain('gnosis-edit')
  })
  it('toolAllowed("gnosis.document.create", gate-with-gnosis-edit) becomes true only once gnosis-edit is VALID (RED)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis-edit'] })
    expect(toolAllowed('gnosis.document.create', gate.enabled)).toBe(true)
  })
})

describe('mcpserver ALL_TOOLS — the 11 document/wiki registrations (RED)', () => {
  it('ALL_TOOLS contains the 11 document/wiki names', () => {
    for (const name of [
      'gnosis.document.get',
      'gnosis.document.list',
      'gnosis.wiki.get',
      'gnosis.wiki.list',
      'gnosis.document.create',
      'gnosis.document.update',
      'gnosis.document.delete',
      'gnosis.document.publish',
      'gnosis.document.unpublish',
      'gnosis.document.archive',
      'gnosis.wiki.create',
    ]) {
      expect(ProvidentMcpServer.ALL_TOOLS).toContain(name)
    }
  })
  it('a server with the gnosis-edit group enabled registers the mutating tools (RED — injection)', () => {
    const gate = new SecurityGate().apply({ groups: ['gnosis-edit', 'read', 'dispatch'] })
    const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) } as never, transport: 'stdio', gate })
    server.ensureServerRegistered()
    expect(server.registeredEnabled('gnosis.document.create')).toBe(true)
    expect(server.registeredEnabled('gnosis.wiki.create')).toBe(true)
  })
})

// ===========================================================================
// §5.4 — McpServerOptions injection + boot construction + the AuthorityStore +
// the IdempotencyRegistry (partly GREEN, partly RED).
// ===========================================================================
describe('McpServerOptions injection + boot + AuthorityStore + IdempotencyRegistry', () => {
  it('§5.8-13 createEngineCrudRagStore at boot does NO network I/O (GREEN — the LANDED proxy)', () => {
    let fetchCalled = false
    const fetchImpl = (async () => {
      fetchCalled = true
      throw new Error('construction must not call fetch')
    }) as typeof fetch
    const store = createEngineCrudRagStore({ baseUrl: 'http://127.0.0.1:8080', fetch: fetchImpl })
    expect(store).toBeTruthy()
    expect(typeof store.createDocument).toBe('function')
    expect(typeof store.getDocument).toBe('function')
    expect(typeof store.listWikis).toBe('function')
    expect(fetchCalled).toBe(false)
  })
  it('§5.8-13 the proxy is injected into McpServerOptions as engineCrudRagStore (RED)', () => {
    const mcp = readFileSync(fileURLToPath(new URL('../src/main/mcp-server.ts', import.meta.url)), 'utf8')
    expect(mcp).toMatch(/engineCrudRagStore\??:\s*EngineCrudRagStore/)
  })
  it('§5.8-13 McpServerOptions carries the authorityStore + idempotency fields (RED)', () => {
    const mcp = readFileSync(fileURLToPath(new URL('../src/main/mcp-server.ts', import.meta.url)), 'utf8')
    expect(mcp).toMatch(/authorityStore\??:\s*AuthorityStore/)
    expect(mcp).toMatch(/idempotency\??:\s*IdempotencyRegistry/)
  })
  it('§5.8-13 boot constructs engineCrudRagStore + authorityStore + idempotency (RED)', () => {
    const main = readFileSync(fileURLToPath(new URL('../src/main/main.ts', import.meta.url)), 'utf8')
    expect(main).toContain('createEngineCrudRagStore')
    expect(main).toContain('createAuthorityStore')
    expect(main).toContain('createIdempotencyRegistry')
  })
  it('§5.8-13 waitForReady is NOT awaited at boot (RED — the CRUD boot construction is absent)', () => {
    const main = readFileSync(fileURLToPath(new URL('../src/main/main.ts', import.meta.url)), 'utf8')
    expect(main).toContain('createEngineCrudRagStore')
    expect(main).not.toMatch(/await\s+[A-Za-z]*waitForReady/)
  })
  it('createAuthorityStore factory (RED — module absent)', async () => {
    const mod: any = await import('../src/main/authority-store.js')
    expect(typeof mod.createAuthorityStore).toBe('function')
  })
  it('createIdempotencyRegistry factory (RED — module absent)', async () => {
    const mod: any = await import('../src/main/idempotency-registry.js')
    expect(typeof mod.createIdempotencyRegistry).toBe('function')
  })

  // --- §5.8-14 caller-credential threading happy ---
  it('§5.8-14 caller-credential threading happy: the encoded request carries the resolved credential (RED)', async () => {
    const handle = await loadHandler()
    const calls: CrudCall[] = []
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE })), calls),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority)
    const args = (calls[0].body as any).payload.args
    expect(args.caller).toBe('user:alice')
  })

  // --- §5.8-15 idempotency dedup happy ---
  it('§5.8-15 idempotency dedup happy: a duplicate requestId returns the cached result WITHOUT a new proxy call (RED)', async () => {
    const handle = await loadHandler()
    let crudCalls = 0
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => {
        crudCalls++
        return jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const idempotency = makeIdempotencyRegistry()
    const first = await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't', requestId: 'r1' }, null, engineCrud, authority, idempotency)
    const second = await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't', requestId: 'r1' }, null, engineCrud, authority, idempotency)
    expect(second).toEqual(first)
    expect(crudCalls).toBe(1)
  })
})

// ===========================================================================
// §5.5 — the D4 parity scope (the GUI document-editor/wiki screens + the
// render paths) (RED surface).
// ===========================================================================
describe('the D4 parity scope — the GUI document-editor/wiki screens (RED until wired)', () => {
  it('exports gnosisDocumentsContent + gnosisWikisContent render helpers', async () => {
    await expect(loadRenderers()).resolves.toBeTruthy()
  })
  it('§5.8-16 gnosisDocumentsContent renders the document surface (wiki selector + list + editor)', async () => {
    const { gnosisDocumentsContent } = await loadRenderers()
    const node = gnosisDocumentsContent({} as never, {
      wikis: [WIKI_TYPED],
      documents: DOCLIST_TYPED,
      document: DOC_TYPED,
      conflict: null,
    })
    const html = JSON.stringify(node)
    expect(html).toContain('d1')
    expect(html).toContain('Getting Started')
    expect(html).toContain('My Wiki')
  })
  it('§5.8-17 gnosisWikisContent renders the wiki surface (list + view + create)', async () => {
    const { gnosisWikisContent } = await loadRenderers()
    const node = gnosisWikisContent({} as never, { wikis: [WIKI_TYPED], wiki: WIKI_TYPED })
    const html = JSON.stringify(node)
    expect(html).toContain('My Wiki')
  })
  it('§5.8-18 GUI 409 conflict state: an updateDocument ConflictError renders the conflict state (never a crash)', async () => {
    const { gnosisDocumentsContent } = await loadRenderers()
    const conflict = new ConflictError('optimistic-concurrency conflict: stale base revision')
    const node = gnosisDocumentsContent({} as never, {
      wikis: null,
      documents: null,
      document: null,
      conflict,
    })
    const html = JSON.stringify(node)
    expect(html.toLowerCase()).toMatch(/conflict|409|revision/)
  })
  it('§5.9-38 GUI document/wiki pane engine-absent → unavailable state (never a crash)', async () => {
    const { gnosisDocumentsContent, gnosisWikisContent } = await loadRenderers()
    const docNode = gnosisDocumentsContent({} as never, { wikis: null, documents: null, document: null, conflict: null })
    expect(JSON.stringify(docNode).toLowerCase()).toMatch(/unavailable|not.?connect|absent/)
    const wikiNode = gnosisWikisContent({} as never, { wikis: null, wiki: null })
    expect(JSON.stringify(wikiNode).toLowerCase()).toMatch(/unavailable|not.?connect|absent/)
  })
  it('§5.9-39 GUI document/wiki pane group-off → fail closed (never a crash)', async () => {
    const { gnosisDocumentsContent, gnosisWikisContent } = await loadRenderers()
    expect(() => gnosisDocumentsContent({} as never, { wikis: null, documents: null, document: null, conflict: null })).not.toThrow()
    expect(() => gnosisWikisContent({} as never, { wikis: null, wiki: null })).not.toThrow()
  })
  it('§5.9-40 GUI document pane no-edit-authority → no-edit-access state (never a crash)', async () => {
    const { gnosisDocumentsContent } = await loadRenderers()
    expect(() => gnosisDocumentsContent({} as never, { wikis: null, documents: null, document: null, conflict: null })).not.toThrow()
  })
  it('H1 — the A2 screens do NOT fall back to createJsonRagStore (RED — the GnosisCrudPanes host is absent)', () => {
    const renderer = readFileSync(fileURLToPath(new URL('../src/renderer/gnosis-crud-panes.ts', import.meta.url)), 'utf8')
    expect(renderer).not.toMatch(/createJsonRagStore/)
  })
})

// ===========================================================================
// §5.8-19 mock-transport happy (GREEN) — exercises the real A1 proxy per §5.6.
// ===========================================================================
describe('§5.8-19 mock-transport happy path — the real A1 proxy over a mock transport (GREEN)', () => {
  it('createDocument returns the typed Document through the injectable mock fetch', async () => {
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))),
    })
    const doc = await store.createDocument({
      caller: 'user:alice',
      wikiId: 'w1',
      body: { title: 'Getting Started', tags: ['guide'], author: 'alice' },
    })
    expect(doc).toEqual(DOC_TYPED)
  })
  it('getDocument returns the typed Document', async () => {
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: DOC_WIRE }))),
    })
    const doc = await store.getDocument({ documentId: 'd1' })
    expect(doc).toEqual(DOC_TYPED)
  })
  it('listWikis returns the typed Wiki[]', async () => {
    const store = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'listWikis', result: [WIKI_WIRE] }))),
    })
    const wikis = await store.listWikis({})
    expect(wikis).toEqual([WIKI_TYPED])
  })
})

// ===========================================================================
// §5.9 pinned non-throws / type-level guarantees.
// ===========================================================================
describe('pinned non-throws / type-level guarantees', () => {
  it('a mutating document/wiki tool always threads the caller credential (RED)', async () => {
    const handle = await loadHandler()
    const calls: CrudCall[] = []
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE })), calls),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority)
    const args = (calls[0].body as any).payload.args
    expect(args.caller).toBe('user:alice')
  })
  it('a read-only document/wiki tool never carries caller (RED)', async () => {
    const handle = await loadHandler()
    const calls: CrudCall[] = []
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: DOC_WIRE })), calls),
    })
    await handle(null, 'gnosis.document.get', { documentId: 'd1' }, null, engineCrud)
    const args = (calls[0].body as any).payload.args
    expect('caller' in args).toBe(false)
  })
  it('the CRUD tools do NOT record to the QueryAuditLog (RED)', async () => {
    const handle = await loadHandler()
    const engineCrud = crudStoreWithResponse(
      jsonResponse(crudResponseEnvelope({ method: 'getDocument', result: DOC_WIRE })),
    )
    const audit = createQueryAuditLog()
    await handle(null, 'gnosis.document.get', { documentId: 'd1' }, audit, engineCrud)
    expect(audit.list()).toHaveLength(0)
  })
  it('a requestId that is absent → a fresh create each time (no dedup) (RED)', async () => {
    const handle = await loadHandler()
    let crudCalls = 0
    const engineCrud = createEngineCrudRagStore({
      baseUrl: 'http://127.0.0.1:8080',
      fetch: readyGateThenCrud(() => {
        crudCalls++
        return jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))
      }),
    })
    const authority = makeAuthorityStore({ alice: 'user:alice' })
    const idempotency = makeIdempotencyRegistry()
    await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority, idempotency)
    await handle(null, 'gnosis.document.create', { callerId: 'alice', wikiId: 'w1', title: 't' }, null, engineCrud, authority, idempotency)
    expect(crudCalls).toBe(2)
  })
})

