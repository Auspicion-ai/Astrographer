// tests/unit-ud6-query-document-filters.test.ts — Unit U-D6: the local
// `rag.query` / `rag-stream` DOCUMENT filters (documentPathPrefix / tags).
// RED SET (RCA-1) — written BEFORE any implementation, from the SPEC ALONE:
//   docs/specs/unit-ud6-query-document-filters.md §5.6 (happy states) and §5.7
//   (fail-states). The behavior is asserted through the landed seams only:
//     - `ragQuery(store, embedder, index, query, opts)` (the Unit X seam) for
//       the retrieval type/behavior (flat + graph modes, validation).
//     - `handleRagTool(...)` / `handleGnosisTool(...)` for the MCP handlers.
//     - the in-memory SDK harness (`client.listTools()`) for the zod rows.
//   The `LocalRagQueryFilters` subtype is still absent at U-D6 RED, so the
//   type-surface assertions are compile-level (they turn red under
//   `npm run typecheck`, not under `vitest run`); every behavioral assertion
//   is a genuine runtime red.
//
// Conventions follow tests/retrieval.test.ts + tests/unit-ms2-store-wiring.test.ts
// (vitest node environment, `.js` import suffix for main-process ESM, temp dirs
// via node:fs, byte-exact message assertions via catch + toBe).
import { describe, it, expect, expectTypeOf, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ragQuery,
  documentIdsForNode,
  createLexicalIndex,
  createLexicalEmbedder,
  createRetrieval,
  type LocalRagQueryFilters,
  type RagQueryFilters,
  type RagResult,
  type RetrievalEngine,
} from '../src/main/retrieval.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import {
  handleRagTool,
  handleGnosisTool,
  ProvidentMcpServer,
  type McpBackend,
} from '../src/main/mcp-server.js'
import { SecurityGate, type ToolGroup } from '../src/main/security.js'
import {
  createEngineRagStore,
  ENGINE_ENDPOINTS,
  type EngineRagStore,
  type HealthReport,
} from '../src/main/engine-rag-store.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

// ---------------------------------------------------------------------------
// Helpers (house style)
// ---------------------------------------------------------------------------
const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ud6-'))
  tempDirs.push(dir)
  return dir
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSyncSafe(dir)
})

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-11T00:00:00.000Z'
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = '2026-09-11T00:00:00.000Z'
  return {
    id,
    kind: 'parent-child',
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** Assert `p` rejects with an Error whose message is EXACTLY `message`. */
async function expectRejectExact(p: Promise<unknown>, message: string): Promise<void> {
  let caught: unknown
  try {
    await p
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a rejection with message: ${message}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(message)
}

// ---------------------------------------------------------------------------
// The flat-mode document fixture. Six ranked candidates ('alpha'), owned across
// three documents plus one orphan (no owning document) and one node owned by a
// MISSING/quarantined root ('docMissing' has no node). The mapping is validated
// independently (documentIdsForNode) so the red assertions below can only fail
// because the U-D6 filter application is absent.
//
//   docA  path ['a']    tags ['x','y']  → secA
//   docB  path ['a','b'] tags ['X']     → secB
//   docC  path ['b']    tags ['y']      → secC
//   (orphan)                             → orphan
//   docMissing (absent root)             → secE, secX
// ---------------------------------------------------------------------------
async function seedFlatStore(store: RagStore): Promise<void> {
  await store.putNode(makeNode('docA', { content: 'root A', documentPath: ['a'], tags: ['x', 'y'] }))
  await store.putNode(makeNode('secA', { content: 'alpha' }))
  await store.putEdge(makeEdge('eA', 'secA', 'docA', { kind: 'doc-head', documentIds: ['docA'] }))

  await store.putNode(makeNode('docB', { content: 'root B', documentPath: ['a', 'b'], tags: ['X'] }))
  await store.putNode(makeNode('secB', { content: 'alpha' }))
  await store.putEdge(makeEdge('eB', 'secB', 'docB', { kind: 'doc-head', documentIds: ['docB'] }))

  await store.putNode(makeNode('docC', { content: 'root C', documentPath: ['b'], tags: ['y'] }))
  await store.putNode(makeNode('secC', { content: 'alpha' }))
  await store.putEdge(makeEdge('eC', 'secC', 'docC', { kind: 'doc-head', documentIds: ['docC'] }))

  await store.putNode(makeNode('orphan', { content: 'alpha' }))

  await store.putNode(makeNode('secE', { content: 'alpha' }))
  await store.putNode(makeNode('secX', { content: 'alpha' }))
  await store.putEdge(makeEdge('eE', 'secE', 'secX', { kind: 'doc-head', documentIds: ['docMissing'] }))
}

async function seedFlat(): Promise<RagStore> {
  const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
  await seedFlatStore(store)
  return store
}

function indexAndEmbedder(store: RagStore): { index: ReturnType<typeof createLexicalIndex>; embedder: ReturnType<typeof createLexicalEmbedder> } {
  const index = createLexicalIndex(store.listNodes())
  return { index, embedder: createLexicalEmbedder(index) }
}

async function flatWithFilters(store: RagStore, filters: LocalRagQueryFilters | undefined): Promise<RagResult> {
  const { index, embedder } = indexAndEmbedder(store)
  return ragQuery(store, embedder, index, 'alpha', { topK: 50, mode: 'flat', filters })
}

function sortedNodeIds(r: RagResult): string[] {
  return r.results.map((x) => x.nodeId).sort()
}

// ---------------------------------------------------------------------------
// The graph-mode document fixture: two reference→fact documents, each with an
// in-document resolving crosslink. Seeds are the references; targets the facts.
//   docR path ['r'] tags ['r'] → refR (reference) → factR (fact)
//   docF path ['f'] tags ['f'] → refF (reference) → factF (fact)
// ---------------------------------------------------------------------------
async function seedGraphStoreU6(store: RagStore): Promise<void> {
  await store.putNode(makeNode('docR', { content: 'root R', documentPath: ['r'], tags: ['r'] }))
  await store.putNode(makeNode('refR', { content: 'alpha', nodeKind: 'reference' }))
  await store.putNode(makeNode('factR', { content: 'fact R', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('hRefR', 'refR', 'docR', { kind: 'doc-head', documentIds: ['docR'] }))
  await store.putEdge(makeEdge('hFactR', 'factR', 'docR', { kind: 'doc-head', documentIds: ['docR'] }))
  await store.putEdge(makeEdge('xR', 'refR', 'factR', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' }))

  await store.putNode(makeNode('docF', { content: 'root F', documentPath: ['f'], tags: ['f'] }))
  await store.putNode(makeNode('refF', { content: 'alpha', nodeKind: 'reference' }))
  await store.putNode(makeNode('factF', { content: 'fact F', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('hRefF', 'refF', 'docF', { kind: 'doc-head', documentIds: ['docF'] }))
  await store.putEdge(makeEdge('hFactF', 'factF', 'docF', { kind: 'doc-head', documentIds: ['docF'] }))
  await store.putEdge(makeEdge('xF', 'refF', 'factF', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' }))
}

async function graphWithFilters(store: RagStore, filters: LocalRagQueryFilters | undefined): Promise<RagResult> {
  const { index, embedder } = indexAndEmbedder(store)
  return ragQuery(store, embedder, index, 'alpha', { topK: 50, mode: 'graph', filters })
}

// ===========================================================================
// §5.6.1 — the type surface (compile-level; red under `npm run typecheck`)
// ===========================================================================
describe('U-D6 §5.6.1 — the LOCAL-only extension type', () => {
  it('LocalRagQueryFilters exposes documentPathPrefix?: string[] and tags?: string[] (inherited base fields too)', () => {
    expectTypeOf<LocalRagQueryFilters>().toHaveProperty('documentPathPrefix')
    expectTypeOf<LocalRagQueryFilters>().toHaveProperty('tags')
    expectTypeOf<LocalRagQueryFilters>().toHaveProperty('nodeKind')
    expectTypeOf<LocalRagQueryFilters>().toHaveProperty('state')
  })

  it('the shared RagQueryFilters stays 4-field — it has NO local document fields', () => {
    expectTypeOf<RagQueryFilters>().not.toHaveProperty('documentPathPrefix')
    expectTypeOf<RagQueryFilters>().not.toHaveProperty('tags')
  })
})

// ===========================================================================
// §5.6.2-§5.6.13 — the retrieval behavior via `ragQuery`
// ===========================================================================
describe('U-D6 — flat mode document filters (§5.5.1, §5.6.2-13)', () => {
  it('fixture guard — the existing node→document mapping (documentIdsForNode) resolves as the fixture intends', async () => {
    const dir = freshDir()
    const store = createJsonRagStore({ path: join(dir, 'rag.json') })
    await seedFlatStore(store)
    expect(documentIdsForNode(store, 'secA')).toEqual(['docA'])
    expect(documentIdsForNode(store, 'secB')).toEqual(['docB'])
    expect(documentIdsForNode(store, 'secC')).toEqual(['docC'])
    expect(documentIdsForNode(store, 'orphan')).toEqual([])
    expect(documentIdsForNode(store, 'secE')).toEqual(['docMissing'])
    expect(documentIdsForNode(store, 'secX')).toEqual(['docMissing'])
  })

  it('§5.6.2 GUARD — omitted filters and `filters:{}` return the byte-equal unfiltered result', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      const { index, embedder } = indexAndEmbedder(store)
      const noFilters = await ragQuery(store, embedder, index, 'alpha', { topK: 50, mode: 'flat' })
      const emptyFilters = await ragQuery(store, embedder, index, 'alpha', { topK: 50, mode: 'flat', filters: {} })
      expect(JSON.stringify(emptyFilters)).toBe(JSON.stringify(noFilters))
      expect(sortedNodeIds(noFilters)).toEqual(['orphan', 'secA', 'secB', 'secC', 'secE', 'secX'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.6.3+4 GUARD — `documentPathPrefix:[]` and `tags:[]` are NO constraint (byte-equal)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      const base = await flatWithFilters(store, undefined)
      const emptyPath = await flatWithFilters(store, { documentPathPrefix: [] })
      const emptyTags = await flatWithFilters(store, { tags: [] })
      const emptyBoth = await flatWithFilters(store, { documentPathPrefix: [], tags: [] })
      for (const r of [emptyPath, emptyTags, emptyBoth]) {
        expect(JSON.stringify(r)).toBe(JSON.stringify(base))
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.6.5+6 — path prefix is element-wise: [a] keeps a/x+b/y only, [a,b] keeps b only, [ab] matches nothing', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a'] }))).toEqual(['secA', 'secB'])
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a', 'b'] }))).toEqual(['secB'])
      // a prefix longer than the path never matches.
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a', 'b', 'c'] }))).toEqual([])
      // NOT a string prefix: 'ab' !== element 'a'.
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['ab'] }))).toEqual([])
      // case-sensitive.
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['A'] }))).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.6.7+9 — tags are AND and case-sensitive', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      expect(sortedNodeIds(await flatWithFilters(store, { tags: ['x'] }))).toEqual(['secA'])
      expect(sortedNodeIds(await flatWithFilters(store, { tags: ['X'] }))).toEqual(['secB'])
      expect(sortedNodeIds(await flatWithFilters(store, { tags: ['y'] }))).toEqual(['secA', 'secC'])
      // AND — a document must carry EVERY requested tag.
      expect(sortedNodeIds(await flatWithFilters(store, { tags: ['x', 'y'] }))).toEqual(['secA'])
      expect(sortedNodeIds(await flatWithFilters(store, { tags: ['x', 'z'] }))).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.6.8 — combined path prefix + tags requires BOTH', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a'], tags: ['x'] }))).toEqual(['secA'])
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a'], tags: ['X'] }))).toEqual(['secB'])
      expect(sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['b'], tags: ['x'] }))).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§5.6.11 + §5.7.13+14 — no owning document / missing root is included with no constraint and EXCLUDED under a constraint (never throws)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedFlatStore(store)
      // no constraint → included (today's behavior).
      const base = sortedNodeIds(await flatWithFilters(store, undefined))
      expect(base).toContain('orphan')
      expect(base).toContain('secE')
      expect(base).toContain('secX')
      // active constraint → an unowned node cannot match.
      const byPrefix = sortedNodeIds(await flatWithFilters(store, { documentPathPrefix: ['a'] }))
      expect(byPrefix).not.toContain('orphan')
      expect(byPrefix).not.toContain('secE')
      expect(byPrefix).not.toContain('secX')
      const byTags = sortedNodeIds(await flatWithFilters(store, { tags: ['x'] }))
      expect(byTags).not.toContain('orphan')
      expect(byTags).not.toContain('secE')
      expect(byTags).not.toContain('secX')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('U-D6 — graph mode document filters (§5.5.2, §5.6.12-13)', () => {
  it('§5.6.12 — graph mode honors the filter (seeds + edge + target)', async () => {
    const dir = freshDir()
    try {
      const store = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedGraphStoreU6(store)
      // no constraint → both documents resolve.
      expect(sortedNodeIds(await graphWithFilters(store, undefined)).sort()).toEqual(['factF', 'factR'])
      // matching docR only → only factR.
      expect(sortedNodeIds(await graphWithFilters(store, { documentPathPrefix: ['r'] }))).toEqual(['factR'])
      // matching docF only → only factF.
      expect(sortedNodeIds(await graphWithFilters(store, { documentPathPrefix: ['f'] }))).toEqual(['factF'])
      expect(sortedNodeIds(await graphWithFilters(store, { tags: ['r'] }))).toEqual(['factR'])
      // a constraint matching no document filters every seed → no results.
      expect(sortedNodeIds(await graphWithFilters(store, { documentPathPrefix: ['z'] }))).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7.1-6 — the local validator fail-states (exact message)
// ===========================================================================
describe('U-D6 §5.7 — local `ragQuery` filter validation', () => {
  it('§5.7.1 GUARD — a non-object filters container rejects "ragQuery: filters malformed"', async () => {
    const store = await seedFlat()
    await expectRejectExact(flatWithFilters(store, 42 as never), 'ragQuery: filters malformed')
    await expectRejectExact(flatWithFilters(store, [] as never), 'ragQuery: filters malformed')
    await expectRejectExact(flatWithFilters(store, null as never), 'ragQuery: filters malformed')
  })

  it('§5.7.2+3 — documentPathPrefix non-array / non-string / empty member → "ragQuery: filters malformed"', async () => {
    const store = await seedFlat()
    for (const bad of ['a', 42, {}, true, null]) {
      await expectRejectExact(flatWithFilters(store, { documentPathPrefix: bad } as never), 'ragQuery: filters malformed')
    }
    for (const member of [1, '', null, {}]) {
      await expectRejectExact(flatWithFilters(store, { documentPathPrefix: [member] } as never), 'ragQuery: filters malformed')
    }
  })

  it('§5.7.4+5 — tags non-array / non-string / empty member → "ragQuery: filters malformed"', async () => {
    const store = await seedFlat()
    for (const bad of ['a', 42, {}, true, null]) {
      await expectRejectExact(flatWithFilters(store, { tags: bad } as never), 'ragQuery: filters malformed')
    }
    for (const member of [1, '', null, {}]) {
      await expectRejectExact(flatWithFilters(store, { tags: [member] } as never), 'ragQuery: filters malformed')
    }
  })

  it('§5.7.6 GUARD — an unknown VALUE in a known field still rejects (unchanged fail-state)', async () => {
    const store = await seedFlat()
    await expectRejectExact(flatWithFilters(store, { nodeKind: 'bogus' } as never), 'ragQuery: filters malformed')
  })

  it('§5.7.9 — an unknown filter KEY stays IGNORED (documented leniency) and does not disable the known filter', async () => {
    const store = await seedFlat()
    const withBogus = await flatWithFilters(store, { documentPathPrefix: ['a'], bogus: 1 } as never)
    expect(sortedNodeIds(withBogus)).toEqual(['secA', 'secB'])
  })
})

// ===========================================================================
// §5.6.14-15 + §5.7.7-8 — the MCP handlers (rag.query / rag-stream)
// ===========================================================================
describe('U-D6 §5.6.14-15 / §5.7.7-8 — MCP rag.query / rag-stream filters', () => {
  it('§5.6.14 — handleRagTool rag.query accepts + applies the two fields', async () => {
    const store = await seedFlat()
    const result = (await handleRagTool(store, 'rag.query', {
      query: 'alpha',
      topK: 50,
      filters: { documentPathPrefix: ['a'], tags: ['x'] },
    })) as RagResult
    expect(sortedNodeIds(result)).toEqual(['secA'])
  })

  it('§5.6.15 — handleRagTool rag-stream accepts + applies the two fields', async () => {
    const store = await seedFlat()
    const chunks = (await handleRagTool(store, 'rag-stream', {
      query: 'alpha',
      topK: 50,
      filters: { documentPathPrefix: ['a'] },
    })) as Array<{ type: string; result?: RagResult }>
    expect(chunks[0].type).toBe('result')
    expect(sortedNodeIds(chunks[0].result!)).toEqual(['secA', 'secB'])
    expect(chunks[1]).toEqual({ type: 'done' })
  })

  it('§5.7.7 — rag.query malformed documentPathPrefix rejects EXACTLY "rag.query: filters malformed"', async () => {
    const store = await seedFlat()
    await expectRejectExact(
      handleRagTool(store, 'rag.query', { query: 'alpha', filters: { documentPathPrefix: 'a' } }),
      'rag.query: filters malformed',
    )
    await expectRejectExact(
      handleRagTool(store, 'rag.query', { query: 'alpha', filters: { tags: [1] } }),
      'rag.query: filters malformed',
    )
  })

  it('§5.7.8 — rag-stream malformed filters returns the error chunk (never a thrown tool error)', async () => {
    const store = await seedFlat()
    await expect(
      handleRagTool(store, 'rag-stream', { query: 'alpha', filters: { documentPathPrefix: 'a' } }),
    ).resolves.toEqual([{ type: 'error', error: 'rag.query: filters malformed' }])
    await expect(
      handleRagTool(store, 'rag-stream', { query: 'alpha', filters: { tags: [''] } }),
    ).resolves.toEqual([{ type: 'error', error: 'rag.query: filters malformed' }])
  })
})

// ===========================================================================
// §5.6.18 + §5.7.16 — the zod schemas (in-memory SDK harness)
// ===========================================================================
describe('U-D6 §5.6.18 — the zod rows (SDK listTools)', () => {
  async function connectSdk(groups: ToolGroup[], engineRagStore?: EngineRagStore): Promise<{ client: Client; close: () => Promise<void> }> {
    const store = await seedFlat()
    const engine: RetrievalEngine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({
      backend,
      transport: 'stdio',
      gate: new SecurityGate(),
      ragStore: store,
      retrievalEngine: engine,
      ...(engineRagStore ? { engineRagStore } : {}),
    })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'unit-ud6', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    return { client, close: async () => { await client.close() } }
  }

  it('§5.6.18 — rag.query + rag-stream advertise documentPathPrefix and tags in `filters`', async () => {
    const { client, close } = await connectSdk(['rag'])
    try {
      const { tools } = await client.listTools()
      const byName = new Map(tools.map((t) => [t.name, t]))
      const ragQuery = JSON.stringify(byName.get('rag.query')!.inputSchema)
      const ragStream = JSON.stringify(byName.get('rag-stream')!.inputSchema)
      expect(ragQuery).toContain('"documentPathPrefix"')
      expect(ragQuery).toContain('"tags"')
      expect(ragStream).toContain('"documentPathPrefix"')
      expect(ragStream).toContain('"tags"')
      // the four base filter fields remain advertised.
      expect(ragQuery).toContain('"nodeKind"')
      expect(ragQuery).toContain('"edgeType"')
      expect(ragQuery).toContain('"target"')
      expect(ragQuery).toContain('"state"')
    } finally {
      await close()
    }
  })

  it('§5.7.16 GUARD — ProvidentMcpServer.ALL_TOOLS is 57 (U-D6 added no tool; U-D7 added edit.set_doc_meta)', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toHaveLength(57)
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('rag.query')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('rag-stream')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('gnosis.query')
  })
})

// ===========================================================================
// §5.4.2 / §5.7.10-11 — the gnosis non-pollution (M8)
// ===========================================================================
const READY_REPORT: HealthReport = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: 'v1',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}

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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function enveloped(body: unknown): unknown {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload: body }
}

function makeGnosisEngine(): { engine: EngineRagStore; calls: string[] } {
  const calls: string[] = []
  const engine = createEngineRagStore({
    baseUrl: 'http://127.0.0.1:8080',
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const method = (init?.method || 'GET').toUpperCase()
      calls.push(`${method} ${url}`)
      if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
      if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) return jsonResponse(enveloped(WIRE_RESULT_BODY))
      throw new Error(`unexpected ${method} ${url}`)
    }) as typeof fetch,
  })
  return { engine, calls }
}

describe('U-D6 §5.4.2 / §5.7.10-11 — gnosis non-pollution (M8)', () => {
  it('§5.7.11 — a DIRECT handleGnosisTool gnosis.query with documentPathPrefix is rejected BEFORE the proxy call', async () => {
    const { engine, calls } = makeGnosisEngine()
    await expectRejectExact(
      handleGnosisTool(engine, 'gnosis.query', { query: 'q', filters: { documentPathPrefix: ['a'] } }, null),
      'gnosis.query: filters malformed',
    )
    expect(calls.filter((c) => c.includes(ENGINE_ENDPOINTS.ragQuery))).toEqual([])
  })

  it('§5.7.11 — a DIRECT handleGnosisTool gnosis.stream with tags is rejected BEFORE the proxy call', async () => {
    const { engine, calls } = makeGnosisEngine()
    await expectRejectExact(
      handleGnosisTool(engine, 'gnosis.stream', { query: 'q', filters: { tags: ['x'] } }, null),
      'gnosis.stream: filters malformed',
    )
    expect(calls.filter((c) => c.includes(ENGINE_ENDPOINTS.ragQuery))).toEqual([])
  })

  it('§5.7.10 GUARD — the gnosis.* zod rows do NOT advertise the two local-only fields', async () => {
    const store = await seedFlat()
    const engine: RetrievalEngine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    const server = new ProvidentMcpServer({
      backend: { invoke: async () => ({}) } as McpBackend,
      transport: 'stdio',
      gate: new SecurityGate(),
      ragStore: store,
      retrievalEngine: engine,
    })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['gnosis'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'unit-ud6-gnosis', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    try {
      const { tools } = await client.listTools()
      const byName = new Map(tools.map((t) => [t.name, t]))
      for (const name of ['gnosis.query', 'gnosis.stream']) {
        const schema = JSON.stringify(byName.get(name)!.inputSchema)
        expect(schema, `${name} must not advertise documentPathPrefix`).not.toContain('documentPathPrefix')
        expect(schema, `${name} must not advertise tags`).not.toContain('tags')
      }
    } finally {
      await client.close()
    }
  })
})
