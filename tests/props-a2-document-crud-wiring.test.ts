// tests/props-a2-document-crud-wiring.test.ts — Unit A2: the §5.7 PBT register
// (8 rows) for the document-CRUD D4 wiring (the 11 `gnosis.document.*`/
// `gnosis.wiki.*` MCP tools + the `gnosis-edit` group + the extended
// `handleGnosisTool` + the `AuthorityStore` + the `IdempotencyRegistry` + the
// GUI document-editor/wiki screens).
// (docs/specs/unit-a2-document-crud-wiring.md §5.7 — the register; the A1 proxy
// surface being wired in docs/specs/unit-a1-crud-routing-proxy.md §5.1.)
//
// Deterministic pinned seed 0xA2A2A2A2 (the unit's mnemonic "A2"), ≤100
// attempts/row, ≤400 total, stop-after-5. Each row is reported held/broken
// with its Strategy-id.
//
// RED: the A2 wiring does NOT exist yet (the `gnosis-edit` group, the extended
// `handleGnosisTool`, the `AuthorityStore`, the `IdempotencyRegistry`, the GUI
// panes), so the rows that exercise those surfaces are the red set. The rows
// that only check spec-pinned constants (the tool-name → group mapping totality
// half of P-IM-1, the default-off half of P-SM-1, the tool → method bijection
// constant of P-TP-1) are GREEN.
import { describe, it, expect } from 'vitest'
import {
  createEngineCrudRagStore,
  type EngineCrudRagStore,
  type Document,
  type Wiki,
} from '../src/main/engine-crud-rag-store.js'
import {
  EngineWireError,
  EngineUnavailable,
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

// ---------------------------------------------------------------------------
// The pinned A2 surfaces (defined here — the exports do not exist yet).
// ---------------------------------------------------------------------------
interface AuthorityStore {
  callerCredential(callerId: string): string | null
  editors(): string[]
}
interface IdempotencyRegistry {
  get(callerId: string, requestId: string): unknown | undefined
  set(callerId: string, requestId: string, result: unknown): void
}
type ExtendedGnosisToolHandler = (
  engine: EngineRagStore | null,
  name: string,
  args: Record<string, unknown>,
  auditLog?: unknown,
  engineCrud?: EngineCrudRagStore | null,
  authorityStore?: AuthorityStore | null,
  idempotency?: IdempotencyRegistry | null,
) => Promise<unknown>

// ---------------------------------------------------------------------------
// The closed tool sets + the §5.1 tool → method mapping.
// ---------------------------------------------------------------------------
const READ_ONLY_TOOLS = [
  'gnosis.document.get',
  'gnosis.document.list',
  'gnosis.wiki.get',
  'gnosis.wiki.list',
] as const
const MUTATING_TOOLS = [
  'gnosis.document.create',
  'gnosis.document.update',
  'gnosis.document.delete',
  'gnosis.document.publish',
  'gnosis.document.unpublish',
  'gnosis.document.archive',
  'gnosis.wiki.create',
] as const
const ALL_11_TOOLS = [...READ_ONLY_TOOLS, ...MUTATING_TOOLS]

/** The §5.1 tool-name → CRUD-method bijection (spec-pinned). */
const TOOL_TO_METHOD: Record<string, string> = {
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

/** The §5.1 exact inputSchema key sets (for the P-IM-2 schema audit). */
const CRUD_TOOL_EXPECTED_KEYS: Record<string, readonly string[]> = {
  'gnosis.document.get': ['documentId'],
  'gnosis.document.list': ['wikiId', 'state', 'tag', 'page', 'pageSize'],
  'gnosis.wiki.get': ['wikiId'],
  'gnosis.wiki.list': [],
  'gnosis.document.create': ['callerId', 'wikiId', 'title', 'tags', 'author', 'requestId'],
  'gnosis.document.update': ['callerId', 'documentId', 'baseRevision', 'graph', 'title', 'tags'],
  'gnosis.document.delete': ['callerId', 'documentId'],
  'gnosis.document.publish': ['callerId', 'documentId'],
  'gnosis.document.unpublish': ['callerId', 'documentId'],
  'gnosis.document.archive': ['callerId', 'documentId'],
  'gnosis.wiki.create': ['callerId', 'name', 'requestId'],
}
const CREDENTIAL_FIELDS = ['token', 'tls', 'ca', 'cert', 'key', 'apiKey'] as const

// ---------------------------------------------------------------------------
// Deterministic pinned seed + the property harness (≤100/row, ≤400 total,
// stop-after-5).
// ---------------------------------------------------------------------------
const PBT_SEED = 0xa2a2a2a2 // the unit's mnemonic "A2"
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
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
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
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}
function readyGateThenCrud(crudHandler: (method: string, url: string, body: unknown) => Response): typeof fetch {
  return fakeFetch((method, url, init) => {
    if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
    const body = init?.body ? JSON.parse(init.body as string) : undefined
    return crudHandler(method, url, body)
  })
}
const DOC_WIRE = {
  document_id: 'd1', wiki_id: 'w1', revision: 0, state: 'Draft',
  graph: { nodes: [], edges: [] }, title: 'Getting Started',
  created_at: '2026-09-09T00:00:00Z', updated_at: '2026-09-09T00:00:00Z',
  tags: ['guide'], author: 'alice',
}
const DOC_TYPED: Document = {
  documentId: 'd1', wikiId: 'w1', revision: 0, state: 'Draft',
  graph: { nodes: [], edges: [] }, title: 'Getting Started',
  createdAt: '2026-09-09T00:00:00Z', updatedAt: '2026-09-09T00:00:00Z',
  tags: ['guide'], author: 'alice',
}
const WIKI_WIRE = { wiki_id: 'w1', name: 'My Wiki' }
const WIKI_TYPED: Wiki = { wikiId: 'w1', name: 'My Wiki' }

function makeAuthorityStore(mapping: Record<string, string>): AuthorityStore {
  return {
    callerCredential(callerId) { return mapping[callerId] ?? null },
    editors() { return Object.keys(mapping) },
  }
}
function makeIdempotencyRegistry(): IdempotencyRegistry {
  const m = new Map<string, unknown>()
  return {
    get(callerId, requestId) { return m.get(`${callerId}\u0000${requestId}`) },
    set(callerId, requestId, result) { m.set(`${callerId}\u0000${requestId}`, result) },
  }
}

// ---------------------------------------------------------------------------
// The red-surface dynamic loaders.
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

/** Enumerate a REGISTERED tool's inputSchema top-level keys (the SDK's own
 *  registration map — the only place the actual `registerTool(name, {inputSchema})`
 *  shape lives at runtime). Returns null when the seam is absent. */
function registeredSchemaKeys(server: ProvidentMcpServer, toolName: string): readonly string[] | null {
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

// ---------------------------------------------------------------------------
// The §5.7 register (8 rows).
// ---------------------------------------------------------------------------
describe('PBT register (§5.7)', () => {
  it('P-IM-1 [strat:crud-tool-group-total] tool-name → group mapping total/unambiguous', () => {
    const rep = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const tool = pick(rng, ALL_11_TOOLS)
      const expected = READ_ONLY_TOOLS.includes(tool as any) ? 'gnosis' : 'gnosis-edit'
      if (groupForTool(tool) !== expected) {
        return `${tool} resolves to ${String(groupForTool(tool))} (expected ${expected})`
      }
      if (groupForTool(`gnosis.other${Math.floor(rng() * 1000)}`) !== null) {
        return 'a gnosis.<other> name resolved to a group (must be null)'
      }
      return null
    })
    expect(rep.held, JSON.stringify(rep.counterexamples)).toBe(true)
    // Direct: 11 pairwise-distinct non-empty gnosis.document.*/gnosis.wiki.* names.
    expect(new Set(ALL_11_TOOLS).size).toBe(11)
    for (const t of ALL_11_TOOLS) {
      expect(t.length).toBeGreaterThan(0)
      expect(t.startsWith('gnosis.')).toBe(true)
    }
  })

  it('P-IM-2 [strat:crud-no-credential-args] no document/wiki tool schema accepts a credential arg', async () => {
    const result = await (async () => {
      const server = new ProvidentMcpServer({
        backend: { invoke: async () => ({}) } as never,
        transport: 'stdio',
        gate: new SecurityGate().apply({ groups: ['gnosis', 'gnosis-edit', 'read', 'dispatch'] }),
      })
      server.ensureServerRegistered()
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const tool = ALL_11_TOOLS[i % ALL_11_TOOLS.length]
        if (!server.registeredEnabled(tool)) {
          ces.push(`${tool}: not registered/enabled (no-credential schema cannot be audited)`)
          continue
        }
        const keys = registeredSchemaKeys(server, tool)
        if (keys === null) {
          ces.push(`${tool}: registered but its inputSchema keys are not enumerable (the schema audit is blind)`)
          continue
        }
        for (const k of keys) {
          if ((CREDENTIAL_FIELDS as readonly string[]).includes(k)) {
            ces.push(`${tool}.inputSchema carries the credential field "${k}" (A7 violation)`)
          }
        }
        const expected = CRUD_TOOL_EXPECTED_KEYS[tool]
        if (JSON.stringify([...keys].sort()) !== JSON.stringify([...expected].sort())) {
          ces.push(`${tool}.inputSchema keys ${JSON.stringify([...keys].sort())} !== spec-pinned ${JSON.stringify([...expected].sort())}`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-IM-3 [strat:crud-caller-threaded] caller credential threading is deterministic', async () => {
    const result = await (async () => {
      let handler: ExtendedGnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const tool = pick(rng, MUTATING_TOOLS)
        const callerId = pick(rng, ['alice', 'bob'])
        const authority = makeAuthorityStore({ alice: 'user:alice' })
        const calls: Array<{ body: unknown }> = []
        const engineCrud = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))),
        })
        // capture the encoded request via a wrapping fetch
        const wrapped = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch((method, url, init) => {
            if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
            calls.push({ body: init?.body ? JSON.parse(init.body as string) : undefined })
            return jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))
          }),
        })
        const args: Record<string, unknown> =
          tool === 'gnosis.document.create' ? { callerId, wikiId: 'w1', title: 't' }
          : tool === 'gnosis.document.update' ? { callerId, documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }
          : tool === 'gnosis.wiki.create' ? { callerId, name: 'My Wiki' }
          : { callerId, documentId: 'd1' }
        const credential = authority.callerCredential(callerId)
        if (credential === null) {
          const err = await handler(null, tool, args, null, wrapped, authority).then(() => null, (e) => e)
          if (!(err instanceof Error) || !/caller has no edit authority/.test(err.message)) {
            ces.push(`${tool} callerId=${callerId} no-authority surfaced ${String(err)}`)
          }
        } else {
          await handler(null, tool, args, null, wrapped, authority)
          const encodedArgs = (calls[0].body as any).payload.args
          if (encodedArgs.caller !== credential) {
            ces.push(`${tool} callerId=${callerId} threaded ${encodedArgs.caller} (expected ${credential})`)
          }
        }
        void engineCrud
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-1 [strat:crud-group-default-off] gnosis-edit default-off + VALID_GROUPS membership', () => {
    const rep = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, () => {
      if (defaultSecurityConfig().enabled.includes('gnosis-edit')) {
        return 'defaultSecurityConfig().enabled includes gnosis-edit'
      }
      const gate = new SecurityGate().apply({ groups: ['gnosis-edit'] })
      if (!gate.enabled.has('gnosis-edit')) {
        return 'VALID_GROUPS rejects the gnosis-edit group (SecurityGate.apply({groups:["gnosis-edit"]}) unchanged)'
      }
      return null
    })
    expect(rep.held, JSON.stringify(rep.counterexamples)).toBe(true)
  })

  it('P-SM-2 [strat:crud-409-ux] ConflictError (409) surfaces consistently on MCP + GUI', async () => {
    const result = await (async () => {
      let handler: ExtendedGnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const engineCrud = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: readyGateThenCrud(() => jsonResponse(crudResponseEnvelope({ method: 'updateDocument', error: { code: 'conflict', message: 'stale base revision' } }))),
        })
        const authority = makeAuthorityStore({ alice: 'user:alice' })
        const err = await handler(null, 'gnosis.document.update', { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }, null, engineCrud, authority).then(() => null, (e) => e)
        if (!(err instanceof ConflictError) || (err as ConflictError).httpStatus !== 409) {
          ces.push(`MCP update surfaced ${String(err)} (expected ConflictError 409)`)
        }
      }
      // GUI half — the gnosis-documents pane renders the conflict state (never a crash).
      let renderers: Awaited<ReturnType<typeof loadRenderers>>
      try {
        renderers = await loadRenderers()
      } catch (e) {
        ces.push(`gnosis-documents renderer unavailable — ${String(e)}`)
        return { held: ces.length === 0, counterexamples: ces }
      }
      for (let g = 0; g < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; g++) {
        const conflict = new ConflictError('optimistic-concurrency conflict: stale base revision')
        let node: unknown
        try {
          node = renderers.gnosisDocumentsContent({} as never, { wikis: null, documents: null, document: null, conflict })
        } catch (e) {
          ces.push(`gnosis-documents pane crashed on a ConflictError: ${String(e)}`)
          continue
        }
        if (!/conflict|409|revision/i.test(JSON.stringify(node))) {
          ces.push('gnosis-documents pane did not render the conflict state for a ConflictError')
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-SM-3 [strat:crud-idempotency-dedup] idempotency dedup is deterministic + caller-scoped', async () => {
    const result = await (async () => {
      let handler: ExtendedGnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const callerId = pick(rng, ['alice', 'bob'])
        const requestId = `r${Math.floor(rng() * 1000)}`
        let crudCalls = 0
        const engineCrud = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: readyGateThenCrud(() => {
            crudCalls++
            return jsonResponse(crudResponseEnvelope({ method: 'createDocument', result: DOC_WIRE }))
          }),
        })
        const authority = makeAuthorityStore({ alice: 'user:alice', bob: 'user:bob' })
        const idempotency = makeIdempotencyRegistry()
        const first = await handler(null, 'gnosis.document.create', { callerId, wikiId: 'w1', title: 't', requestId }, null, engineCrud, authority, idempotency)
        const second = await handler(null, 'gnosis.document.create', { callerId, wikiId: 'w1', title: 't', requestId }, null, engineCrud, authority, idempotency)
        if (JSON.stringify(second) !== JSON.stringify(first)) {
          ces.push(`duplicate (${callerId},${requestId}) returned a different result`)
        }
        if (crudCalls !== 1) {
          ces.push(`duplicate (${callerId},${requestId}) issued ${crudCalls} proxy calls (expected 1)`)
        }
        // caller-scoped: another caller never receives this caller's cached result.
        const other = callerId === 'alice' ? 'bob' : 'alice'
        if (idempotency.get(other, requestId) !== undefined) {
          ces.push(`caller ${other} received ${callerId}'s cached result for ${requestId}`)
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })

  it('P-TP-1 [strat:crud-tool-method-bijection] tool → CRUD-method mapping is a bijection', () => {
    const rep = runProperty(PBT_ATTEMPTS, PBT_STOP_AFTER, (_i, rng) => {
      const a = pick(rng, ALL_11_TOOLS)
      const b = pick(rng, ALL_11_TOOLS)
      if (a === b) return null
      if (TOOL_TO_METHOD[a] === TOOL_TO_METHOD[b]) {
        return `method collision: ${a} and ${b} both map to ${TOOL_TO_METHOD[a]}`
      }
      return null
    })
    expect(rep.held, JSON.stringify(rep.counterexamples)).toBe(true)
    // Direct: exactly 11 rows, one per CRUD method (a bijection).
    expect(Object.keys(TOOL_TO_METHOD).length).toBe(11)
    expect(new Set(Object.values(TOOL_TO_METHOD)).size).toBe(11)
    // The tools must actually be registered (RED — the 11 names are absent).
    for (const t of ALL_11_TOOLS) {
      expect(ProvidentMcpServer.ALL_TOOLS).toContain(t)
    }
  })

  it('P-TP-2 [strat:crud-engine-absent] connection-refused surfaces consistently on MCP + GUI', async () => {
    const result = await (async () => {
      let handler: ExtendedGnosisToolHandler
      try {
        handler = await loadHandler()
      } catch (e) {
        return { held: false, counterexamples: [`handler unavailable — ${String(e)}`] }
      }
      const rng = mulberry32(PBT_SEED)
      const ces: string[] = []
      for (let i = 0; i < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; i++) {
        const tool = pick(rng, ALL_11_TOOLS)
        const engineCrud = createEngineCrudRagStore({
          baseUrl: 'http://127.0.0.1:8080',
          fetch: fakeFetch(() => {
            throw refusedError()
          }),
        })
        const args: Record<string, unknown> =
          tool === 'gnosis.document.get' ? { documentId: 'd1' }
          : tool === 'gnosis.document.list' ? { wikiId: 'w1' }
          : tool === 'gnosis.wiki.get' ? { wikiId: 'w1' }
          : tool === 'gnosis.wiki.list' ? {}
          : tool === 'gnosis.document.create' ? { callerId: 'alice', wikiId: 'w1', title: 't' }
          : tool === 'gnosis.document.update' ? { callerId: 'alice', documentId: 'd1', baseRevision: 0, graph: { nodes: [], edges: [] } }
          : tool === 'gnosis.wiki.create' ? { callerId: 'alice', name: 'My Wiki' }
          : { callerId: 'alice', documentId: 'd1' }
        const authority = makeAuthorityStore({ alice: 'user:alice' })
        const err = await handler(null, tool, args, null, engineCrud, authority).then(() => null, (e) => e)
        if (!(err instanceof EngineUnavailable) || (err as EngineUnavailable).cause !== 'connection-refused') {
          ces.push(`${tool} connection-refused surfaced ${String(err)}`)
        }
      }
      // GUI half — the panes render the unavailable state (never a crash).
      let renderers: Awaited<ReturnType<typeof loadRenderers>>
      try {
        renderers = await loadRenderers()
      } catch (e) {
        ces.push(`renderer unavailable — ${String(e)}`)
        return { held: ces.length === 0, counterexamples: ces }
      }
      for (let g = 0; g < PBT_ATTEMPTS && ces.length < PBT_STOP_AFTER; g++) {
        const docNode = renderers.gnosisDocumentsContent({} as never, { wikis: null, documents: null, document: null, conflict: null })
        if (!/unavailable|not.?connect|absent/i.test(JSON.stringify(docNode))) {
          ces.push('gnosis-documents pane did not render the unavailable state for an absent engine')
        }
        const wikiNode = renderers.gnosisWikisContent({} as never, { wikis: null, wiki: null })
        if (!/unavailable|not.?connect|absent/i.test(JSON.stringify(wikiNode))) {
          ces.push('gnosis-wikis pane did not render the unavailable state for an absent engine')
        }
      }
      return { held: ces.length === 0, counterexamples: ces }
    })()
    expect(result.held, JSON.stringify(result.counterexamples)).toBe(true)
  })
})

