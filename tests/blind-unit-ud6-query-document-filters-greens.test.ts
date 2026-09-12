// tests/blind-unit-ud6-query-document-filters-greens.test.ts
// BLIND green-scenario artifact for Unit U-D6 (RCA-4 / AGENTS.md item 10a).
// Scenarios are derived from docs/specs/unit-ud6-query-document-filters.md
// ALONE (§5.1-§5.7 + §3a A1-A11). The implementation (src/main/retrieval.ts,
// src/main/mcp-server.ts) was NOT read to decide expected behavior; only the
// public seams are imported. Harness conventions follow the TestWriter file /
// tests/unit-x-rag-provenance-traversal.test.ts, but the assertions and
// fixtures below are independently authored. Scenario ids map to spec sections
// and are recorded in docs/specs/unit-ud6-query-document-filters-greens.md.
import { describe, it, expect, afterAll } from 'vitest'
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
// house-style helpers
// ---------------------------------------------------------------------------
const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ud6-blind-'))
  tempDirs.push(dir)
  return dir
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-12T00:00:00.000Z'
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
  const now = '2026-09-12T00:00:00.000Z'
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

function indexAndEmbedder(store: RagStore): { index: ReturnType<typeof createLexicalIndex>; embedder: ReturnType<typeof createLexicalEmbedder> } {
  const index = createLexicalIndex(store.listNodes())
  return { index, embedder: createLexicalEmbedder(index) }
}

function ids(r: RagResult): string[] {
  return r.results.map((x) => x.nodeId).sort()
}

// ---------------------------------------------------------------------------
// BLIND FLAT FIXTURE (distinct from the TestWriter fixture).
//   docP  path ['p']     tags ['red','blue'] → secP   (content 'omega')
//   docQ  path ['p','q'] tags ['Red']        → secQ
//   docR  path ['z']     tags ['blue']       → secR
//   (orphan) 'lonely'                          (no owning document)
//   docGone (root absent from listNodes)     → secG
//   'shared' owned by BOTH docP and docR     (multi-parent / CROSS-DOCUMENT-SHARED)
// ---------------------------------------------------------------------------
const OMEGA = 'omega'
const root = 'root metadata text'

async function seedFlat(store: RagStore): Promise<void> {
  await store.putNode(makeNode('docP', { content: root, documentPath: ['p'], tags: ['red', 'blue'] }))
  await store.putNode(makeNode('secP', { content: OMEGA }))
  await store.putEdge(makeEdge('hP', 'secP', 'docP', { kind: 'doc-head', documentIds: ['docP'] }))

  await store.putNode(makeNode('docQ', { content: root, documentPath: ['p', 'q'], tags: ['Red'] }))
  await store.putNode(makeNode('secQ', { content: OMEGA }))
  await store.putEdge(makeEdge('hQ', 'secQ', 'docQ', { kind: 'doc-head', documentIds: ['docQ'] }))

  await store.putNode(makeNode('docR', { content: root, documentPath: ['z'], tags: ['blue'] }))
  await store.putNode(makeNode('secR', { content: OMEGA }))
  await store.putEdge(makeEdge('hR', 'secR', 'docR', { kind: 'doc-head', documentIds: ['docR'] }))

  await store.putNode(makeNode('lonely', { content: OMEGA }))

  await store.putNode(makeNode('secG', { content: OMEGA }))
  // the doc-head edge's documentIds names a document root that is ABSENT from
  // listNodes() (a missing/quarantined root); the edge itself still connects
  // two existing nodes (a store invariant).
  await store.putNode(makeNode('anchorG', { content: root }))
  await store.putEdge(makeEdge('hG', 'secG', 'anchorG', { kind: 'doc-head', documentIds: ['docGone'] }))

  await store.putNode(makeNode('shared', { content: OMEGA }))
  await store.putEdge(makeEdge('hS1', 'shared', 'docP', { kind: 'doc-head', documentIds: ['docP'] }))
  await store.putEdge(makeEdge('hS2', 'shared', 'docR', { kind: 'doc-head', documentIds: ['docR'] }))
}

async function newFlat(): Promise<RagStore> {
  const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
  await seedFlat(store)
  return store
}

async function flat(store: RagStore, filters: LocalRagQueryFilters | undefined): Promise<RagResult> {
  const { index, embedder } = indexAndEmbedder(store)
  return ragQuery(store, embedder, index, OMEGA, { topK: 50, mode: 'flat', filters })
}

// ---------------------------------------------------------------------------
// BLIND GRAPH FIXTURE.
//   docM path ['m'] tags ['mk'] : refM (reference 'nebula') -xM-> factM (fact)
//   docN path ['n'] tags ['nk'] : refN (reference 'nebula') -xN-> factN (fact)
//   (no document)               : refO (reference 'nebula') -xO-> factO (fact)
//   xM/xN carry documentIds; xO is document-LESS (F1 byte-equality surface).
// ---------------------------------------------------------------------------
const NEBULA = 'nebula'

async function seedGraph(store: RagStore): Promise<void> {
  await store.putNode(makeNode('docM', { content: root, documentPath: ['m'], tags: ['mk'] }))
  await store.putNode(makeNode('refM', { content: NEBULA, nodeKind: 'reference' }))
  await store.putNode(makeNode('factM', { content: 'fact M', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('hRefM', 'refM', 'docM', { kind: 'doc-head', documentIds: ['docM'] }))
  await store.putEdge(makeEdge('hFactM', 'factM', 'docM', { kind: 'doc-head', documentIds: ['docM'] }))
  await store.putEdge(makeEdge('xM', 'refM', 'factM', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED', documentIds: ['docM'] }))

  await store.putNode(makeNode('docN', { content: root, documentPath: ['n'], tags: ['nk'] }))
  await store.putNode(makeNode('refN', { content: NEBULA, nodeKind: 'reference' }))
  await store.putNode(makeNode('factN', { content: 'fact N', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('hRefN', 'refN', 'docN', { kind: 'doc-head', documentIds: ['docN'] }))
  await store.putEdge(makeEdge('hFactN', 'factN', 'docN', { kind: 'doc-head', documentIds: ['docN'] }))
  await store.putEdge(makeEdge('xN', 'refN', 'factN', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED', documentIds: ['docN'] }))

  await store.putNode(makeNode('refO', { content: NEBULA, nodeKind: 'reference' }))
  await store.putNode(makeNode('factO', { content: 'fact O', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('xO', 'refO', 'factO', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' }))
}

async function newGraph(): Promise<RagStore> {
  const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
  await seedGraph(store)
  return store
}

async function graph(store: RagStore, filters: LocalRagQueryFilters | undefined): Promise<RagResult> {
  const { index, embedder } = indexAndEmbedder(store)
  return ragQuery(store, embedder, index, NEBULA, { topK: 50, mode: 'graph', filters })
}

// A document-LESS-edge-only store (F1 surface): refO -xO(no documentIds)-> factO.
async function newDocumentlessEdge(): Promise<RagStore> {
  const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
  await store.putNode(makeNode('refO', { content: NEBULA, nodeKind: 'reference' }))
  await store.putNode(makeNode('factO', { content: 'fact O', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('xO', 'refO', 'factO', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' }))
  return store
}

// ===========================================================================
// S1 — `[]` / omitted = no constraint, byte-equal in FLAT (§5.1, §5.6.2-4, A1)
// ===========================================================================
describe('UD6-G S1 — flat: omission and empty arrays are no constraint (byte-equal)', () => {
  it('no filters === {} === {documentPathPrefix:[]} === {tags:[]} === both empty', async () => {
    const store = await newFlat()
    const base = await flat(store, undefined)
    const variants: Array<LocalRagQueryFilters | undefined> = [
      {},
      { documentPathPrefix: [] },
      { tags: [] },
      { documentPathPrefix: [], tags: [] },
    ]
    for (const v of variants) {
      expect(JSON.stringify(await flat(store, v))).toBe(JSON.stringify(base))
    }
    expect(ids(base)).toEqual(['lonely', 'secG', 'secP', 'secQ', 'secR', 'shared'])
  })
})

// ===========================================================================
// S2 — element-wise path prefix (§5.1, §5.6.5-6, A2-adjacent)
// ===========================================================================
describe('UD6-G S2 — flat: element-wise, case-sensitive documentPathPrefix', () => {
  it('["p"] keeps p and p/q; ["p","q"] keeps only p/q; longer/["P"]/["pp"] match nothing', async () => {
    const store = await newFlat()
    expect(ids(await flat(store, { documentPathPrefix: ['p'] }))).toEqual(['secP', 'secQ', 'shared'])
    expect(ids(await flat(store, { documentPathPrefix: ['p', 'q'] }))).toEqual(['secQ'])
    expect(ids(await flat(store, { documentPathPrefix: ['p', 'q', 'r'] }))).toEqual([])
    expect(ids(await flat(store, { documentPathPrefix: ['P'] }))).toEqual([])
    expect(ids(await flat(store, { documentPathPrefix: ['pp'] }))).toEqual([])
  })
})

// ===========================================================================
// S3 — tags AND + case-sensitive (§5.1, §5.6.7+9, A2)
// ===========================================================================
describe('UD6-G S3 — flat: tags are AND and case-sensitive', () => {
  it('set match, AND (every requested), and case sensitivity', async () => {
    const store = await newFlat()
    expect(ids(await flat(store, { tags: ['red'] }))).toEqual(['secP', 'shared'])
    expect(ids(await flat(store, { tags: ['blue'] }))).toEqual(['secP', 'secR', 'shared'])
    expect(ids(await flat(store, { tags: ['red', 'blue'] }))).toEqual(['secP', 'shared'])
    expect(ids(await flat(store, { tags: ['red', 'green'] }))).toEqual([])
    expect(ids(await flat(store, { tags: ['Red'] }))).toEqual(['secQ'])
    expect(ids(await flat(store, { tags: ['red', 'Red'] }))).toEqual([])
  })
})

// ===========================================================================
// S4 — combined prefix + tags requires BOTH (§5.1, §5.6.8)
// ===========================================================================
describe('UD6-G S4 — flat: combined prefix AND tags', () => {
  it('{prefix:["p"],tags:["blue"]} and disjoint combos', async () => {
    const store = await newFlat()
    expect(ids(await flat(store, { documentPathPrefix: ['p'], tags: ['blue'] }))).toEqual(['secP', 'shared'])
    expect(ids(await flat(store, { documentPathPrefix: ['z'], tags: ['red'] }))).toEqual([])
  })
})

// ===========================================================================
// S5 — node with no owning document / missing root / non-array root fields
//      (§5.2, §5.6.11, §5.7.13-14, A4/A6)
// ===========================================================================
describe('UD6-G S5 — flat: unowned node, absent root, tampered non-array fields', () => {
  it('included with no constraint; EXCLUDED under an active constraint; never throws', async () => {
    const store = await newFlat()
    const base = ids(await flat(store, undefined))
    for (const n of ['lonely', 'secG']) expect(base).toContain(n)

    for (const n of ['lonely', 'secG']) {
      expect(ids(await flat(store, { documentPathPrefix: ['p'] }))).not.toContain(n)
      expect(ids(await flat(store, { tags: ['blue'] }))).not.toContain(n)
      // empty constraints are still no constraint.
      expect(ids(await flat(store, { documentPathPrefix: [], tags: [] }))).toContain(n)
    }
  })

  it('the mapping itself resolves the fixture as intended (guard)', async () => {
    const store = await newFlat()
    expect(documentIdsForNode(store, 'secP')).toEqual(['docP'])
    expect(documentIdsForNode(store, 'secQ')).toEqual(['docQ'])
    expect(documentIdsForNode(store, 'secR')).toEqual(['docR'])
    expect(documentIdsForNode(store, 'lonely')).toEqual([])
    expect(documentIdsForNode(store, 'secG')).toEqual(['docGone'])
    expect(documentIdsForNode(store, 'shared')).toEqual(['docP', 'docR'])
  })
})

// ===========================================================================
// S6 — multi-parent shared node matches ANY owning document (§5.2, §5.6.10, A3)
// ===========================================================================
describe('UD6-G S6 — flat: multi-parent node matches via ANY owning document', () => {
  it("'shared' passes a prefix/tag satisfied by either docP or docR", async () => {
    const store = await newFlat()
    expect(ids(await flat(store, { tags: ['red'] }))).toContain('shared')
    expect(ids(await flat(store, { documentPathPrefix: ['z'] }))).toContain('shared')
    expect(ids(await flat(store, { documentPathPrefix: ['m'] }))).not.toContain('shared')
  })
})

// ===========================================================================
// S7 — graph: omission / empty arrays byte-equal + document-less edge (F1)
// ===========================================================================
describe('UD6-G S7 — graph: empty filters are no constraint; document-less edge survives (A1/F1)', () => {
  it('no filters, {}, empty prefix, empty tags all resolve factO byte-equal', async () => {
    const store = await newDocumentlessEdge()
    const base = await graph(store, undefined)
    expect(ids(base)).toEqual(['factO'])
    for (const v of [{}, { documentPathPrefix: [] }, { tags: [] }] as LocalRagQueryFilters[]) {
      expect(JSON.stringify(await graph(store, v))).toBe(JSON.stringify(base))
    }
    // an ACTIVE constraint excludes the unowned endpoints' edge.
    expect(ids(await graph(store, { documentPathPrefix: ['p'] }))).toEqual([])
  })

  it('full graph fixture: no filters resolves all three documents byte-equal to {}', async () => {
    const store = await newGraph()
    const base = await graph(store, undefined)
    expect(ids(base)).toEqual(['factM', 'factN', 'factO'])
    expect(JSON.stringify(await graph(store, {}))).toBe(JSON.stringify(base))
  })
})

// ===========================================================================
// S8 — graph honors seed / edge / target document gating (§5.5.2, §5.6.12)
// ===========================================================================
describe('UD6-G S8 — graph: seeds, edges and targets are document-gated', () => {
  it('prefix / tags select the owning document only', async () => {
    const store = await newGraph()
    expect(ids(await graph(store, { documentPathPrefix: ['m'] }))).toEqual(['factM'])
    expect(ids(await graph(store, { documentPathPrefix: ['n'] }))).toEqual(['factN'])
    expect(ids(await graph(store, { tags: ['mk'] }))).toEqual(['factM'])
    expect(ids(await graph(store, { tags: ['nk'] }))).toEqual(['factN'])
    expect(ids(await graph(store, { documentPathPrefix: ['zzz'] }))).toEqual([])
  })
})

// ===========================================================================
// S9 — graph edge gating via the edge's OWN documentIds (§5.2, §5.6.13)
// ===========================================================================
describe('UD6-G S9 — graph: the edge documentIds decide traversal', () => {
  async function edgeDocStore(edgeDocs: string[]): Promise<RagStore> {
    const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await store.putNode(makeNode('docM', { content: root, documentPath: ['m'], tags: ['mk'] }))
    await store.putNode(makeNode('docN', { content: root, documentPath: ['n'], tags: ['nk'] }))
    await store.putNode(makeNode('refE', { content: NEBULA, nodeKind: 'reference' }))
    await store.putNode(makeNode('factE', { content: 'fact E', nodeKind: 'fact' }))
    await store.putEdge(makeEdge('hRefE', 'refE', 'docM', { kind: 'doc-head', documentIds: ['docM'] }))
    await store.putEdge(makeEdge('hFactE', 'factE', 'docM', { kind: 'doc-head', documentIds: ['docM'] }))
    await store.putEdge(makeEdge('xE', 'refE', 'factE', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED', documentIds: edgeDocs }))
    return store
  }

  it('documentIds naming the matching document is traversed', async () => {
    const store = await edgeDocStore(['docM'])
    expect(ids(await graph(store, { documentPathPrefix: ['m'] }))).toEqual(['factE'])
  })

  it('documentIds naming only a non-matching document is NOT traversed', async () => {
    const store = await edgeDocStore(['docN'])
    expect(ids(await graph(store, { documentPathPrefix: ['m'] }))).toEqual([])
  })
})

// ===========================================================================
// S10 — local validator fail-states, exact message (§5.3, §5.7.2-6, A5)
// ===========================================================================
describe('UD6-G S10 — local validateFilters exact fail message', () => {
  it('non-array / non-string / empty member throws exactly "ragQuery: filters malformed"', async () => {
    const store = await newFlat()
    for (const bad of ['p', 42, {}, true, null] as unknown[]) {
      await expectRejectExact(flat(store, { documentPathPrefix: bad } as never), 'ragQuery: filters malformed')
      await expectRejectExact(flat(store, { tags: bad } as never), 'ragQuery: filters malformed')
    }
    for (const member of [1, '', null, {}] as unknown[]) {
      await expectRejectExact(flat(store, { documentPathPrefix: [member] } as never), 'ragQuery: filters malformed')
      await expectRejectExact(flat(store, { tags: [member] } as never), 'ragQuery: filters malformed')
    }
    // non-object container and unknown known-field value stay fail-states.
    await expectRejectExact(flat(store, 42 as never), 'ragQuery: filters malformed')
    await expectRejectExact(flat(store, { nodeKind: 'bogus' } as never), 'ragQuery: filters malformed')
  })

  it('array of non-empty strings (incl. a whitespace string) is VALID; unknown KEY is ignored', async () => {
    const store = await newFlat()
    await flat(store, { documentPathPrefix: ['  '], tags: [' '] })
    expect(ids(await flat(store, { documentPathPrefix: ['p'], bogus: 1 } as never))).toEqual(['secP', 'secQ', 'shared'])
  })
})

// ===========================================================================
// S11 — direct MCP handler fail-states + acceptance (§5.6.14-15, §5.7.7-8)
// ===========================================================================
describe('UD6-G S11 — rag.query / rag-stream direct handler', () => {
  it('rag.query accepts + applies both fields', async () => {
    const store = await newFlat()
    const res = (await handleRagTool(store, 'rag.query', {
      query: OMEGA,
      topK: 50,
      filters: { documentPathPrefix: ['p'], tags: ['blue'] },
    })) as RagResult
    expect(ids(res)).toEqual(['secP', 'shared'])
  })

  it('rag.query malformed throws exactly "rag.query: filters malformed"', async () => {
    const store = await newFlat()
    await expectRejectExact(
      handleRagTool(store, 'rag.query', { query: OMEGA, filters: { documentPathPrefix: 'p' } }),
      'rag.query: filters malformed',
    )
    await expectRejectExact(
      handleRagTool(store, 'rag.query', { query: OMEGA, filters: { tags: [1] } }),
      'rag.query: filters malformed',
    )
  })

  it('rag-stream accepts + applies and returns result then done', async () => {
    const store = await newFlat()
    const chunks = (await handleRagTool(store, 'rag-stream', {
      query: OMEGA,
      topK: 50,
      filters: { documentPathPrefix: ['p'] },
    })) as Array<{ type: string; result?: RagResult }>
    expect(chunks[0].type).toBe('result')
    expect(ids(chunks[0].result!)).toEqual(['secP', 'secQ', 'shared'])
    expect(chunks[1]).toEqual({ type: 'done' })
  })

  it('rag-stream malformed returns EXACTLY the error chunk (never a throw)', async () => {
    const store = await newFlat()
    await expect(
      handleRagTool(store, 'rag-stream', { query: OMEGA, filters: { documentPathPrefix: 'p' } }),
    ).resolves.toEqual([{ type: 'error', error: 'rag.query: filters malformed' }])
    await expect(
      handleRagTool(store, 'rag-stream', { query: OMEGA, filters: { tags: [''] } }),
    ).resolves.toEqual([{ type: 'error', error: 'rag.query: filters malformed' }])
  })
})

// ===========================================================================
// S12 — the rag.query / rag-stream zod rows advertise the two fields
//        (§5.4.1, §5.6.18)
// ===========================================================================
describe('UD6-G S12 — zod rows advertise the local fields', () => {
  it('rag.query and rag-stream filters include documentPathPrefix + tags (plus the 4 base fields)', async () => {
    const store = await newFlat()
    const engine: RetrievalEngine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    await connectSdk(store, engine, ['rag'], async (tools) => {
      const byName = new Map(tools.map((t) => [t.name, t]))
      for (const name of ['rag.query', 'rag-stream']) {
        const schema = JSON.stringify(byName.get(name)!.inputSchema)
        expect(schema, `${name} advertises documentPathPrefix`).toContain('"documentPathPrefix"')
        expect(schema, `${name} advertises tags`).toContain('"tags"')
        expect(schema).toContain('"nodeKind"')
        expect(schema).toContain('"edgeType"')
        expect(schema).toContain('"target"')
        expect(schema).toContain('"state"')
      }
    })
  })
})

// ===========================================================================
// S13 — gnosis non-pollution (§5.4.2, §5.7.10-11, A7)
// ===========================================================================
const READY_REPORT: HealthReport = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: 'v1',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}

function makeGnosisEngine(): { engine: EngineRagStore; calls: string[] } {
  const calls: string[] = []
  const engine = createEngineRagStore({
    baseUrl: 'http://127.0.0.1:8080',
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : (input as Request).url
      const method = (init?.method || 'GET').toUpperCase()
      calls.push(`${method} ${url}`)
      const headers = { 'content-type': 'application/json' }
      if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) {
        return new Response(JSON.stringify(READY_REPORT), { status: 200, headers })
      }
      if (method === 'POST' && url.endsWith(ENGINE_ENDPOINTS.ragQuery)) {
        return new Response(JSON.stringify({ schemaVersion: 1, idFormat: 'opaque-string-v1', payload: {} }), { status: 200, headers })
      }
      throw new Error(`unexpected ${method} ${url}`)
    }) as typeof fetch,
  })
  return { engine, calls }
}

describe('UD6-G S13 — gnosis non-pollution (M8)', () => {
  it('DIRECT gnosis.query / gnosis.stream reject the local-only keys BEFORE any proxy call', async () => {
    const q = makeGnosisEngine()
    await expectRejectExact(
      handleGnosisTool(q.engine, 'gnosis.query', { query: 'q', filters: { documentPathPrefix: ['p'] } }, null),
      'gnosis.query: filters malformed',
    )
    const s = makeGnosisEngine()
    await expectRejectExact(
      handleGnosisTool(s.engine, 'gnosis.stream', { query: 'q', filters: { tags: ['x'] } }, null),
      'gnosis.stream: filters malformed',
    )
    expect(q.calls.filter((c) => c.includes(ENGINE_ENDPOINTS.ragQuery))).toEqual([])
    expect(s.calls.filter((c) => c.includes(ENGINE_ENDPOINTS.ragQuery))).toEqual([])
  })

  it('the gnosis.* zod rows do NOT advertise the local fields', async () => {
    const store = await newFlat()
    const engine: RetrievalEngine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    await connectSdk(store, engine, ['gnosis'], async (tools) => {
      const byName = new Map(tools.map((t) => [t.name, t]))
      for (const name of ['gnosis.query', 'gnosis.stream']) {
        const schema = JSON.stringify(byName.get(name)!.inputSchema)
        expect(schema, `${name} must not advertise documentPathPrefix`).not.toContain('documentPathPrefix')
        expect(schema, `${name} must not advertise tags`).not.toContain('tags')
      }
    })
  })
})

// ===========================================================================
// S14 — U-D6 adds no tool (census, §5.8)
// ===========================================================================
describe('UD6-G S14 — no new tool', () => {
  it('ALL_TOOLS is still 57 and includes the rag + gnosis rows', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toHaveLength(57)
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('rag.query')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('rag-stream')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('gnosis.query')
  })
})

// ---------------------------------------------------------------------------
// SDK harness (in-memory) — mirrors the house pattern used for schema checks.
// ---------------------------------------------------------------------------
async function connectSdk(
  store: RagStore,
  engine: RetrievalEngine,
  groups: ToolGroup[],
  body: (tools: Array<{ name: string; inputSchema: unknown }>) => Promise<void>,
): Promise<void> {
  const backend: McpBackend = { invoke: async () => ({}) }
  const server = new ProvidentMcpServer({
    backend,
    transport: 'stdio',
    gate: new SecurityGate(),
    ragStore: store,
    retrievalEngine: engine,
  })
  server.ensureServerRegistered()
  server.applyGatePatch({ groups })
  const sdkServer = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'ud6-blind', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  try {
    const { tools } = await client.listTools()
    await body(tools as Array<{ name: string; inputSchema: unknown }>)
  } finally {
    await client.close()
  }
}
