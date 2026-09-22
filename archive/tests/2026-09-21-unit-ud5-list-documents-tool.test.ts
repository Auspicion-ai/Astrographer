// tests/unit-ud5-list-documents-tool.test.ts — Unit U-D5: the read-only MCP
// tool `rag.list_documents` (single-store doc-heads listing).
//
// TestWriter RED set written from docs/specs/unit-ud5-list-documents-tool.md
// §5.6 happy states + §5.7 fail-states BEFORE any implementation. The U-D5
// behavior does NOT exist yet:
//
//   - `src/main/security.ts` (RED — `TOOL_GROUPS` has no `rag.list_documents`
//     row; `groupForTool` resolves null; `toolAllowed(..., ['rag'])` is false).
//   - `src/main/mcp-server.ts` (RED — `ALL_TOOLS` lacks the name; the SDK
//     `graph` array lacks the row; `handleRagTool` has no
//     `case 'rag.list_documents'` → the default branch throws
//     `unknown rag tool: rag.list_documents`).
//   - `src/shared/types.ts` (RED at compile time — `RpcMethod` lacks the
//     member; `npm run typecheck` fails).
//
// The listing computation itself is LANDED (`handleRagDocHeadsIpc`, U-D4); the
// red assertions here exercise the NEW seam wiring + the routing through that
// shared computation. Harness conventions follow tests/unit-ms2-store-wiring.ts
// (mkdtemp temp dirs, `expectReject` byte-exact assertions — vitest's `toThrow`
// is substring-only — and the InMemoryTransport SDK seam from
// tests/embeddings-adversarial.ts:104-119). Behavior is derived from the spec
// ALONE; no `src/main/mcp-server.ts` / `src/main/security.ts` read.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  SecurityGate,
  applyPatch,
  type ToolGroup,
} from '../src/main/security.js'
import {
  ProvidentMcpServer,
  handleRagTool,
  handleRagDocHeadsIpc,
  type McpBackend,
} from '../src/main/mcp-server.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import {
  createRetrieval,
  createLexicalEmbedder,
  createLexicalIndex,
  type RetrievalEngine,
} from '../src/main/retrieval.js'
import {
  resolveStoreArg,
  type RagStoreDirectory,
  type RagStoreEntry,
} from '../src/main/rag-store-directory.js'
import { createQueryAuditLog } from '../src/main/query-audit.js'
import type { RpcMethod, RagDocHeadsPayload } from '../src/shared/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

// §5.3 seam 3b — the pinned SDK registration description (byte-exact).
const LIST_DOCUMENTS_DESCRIPTION =
  'List the documents in the addressed RAG store (the doc-heads listing: [{ documentId, title, path, tags }]) — the SAME shared computation as the rag-doc-heads IPC. SINGLE-STORE scope: never enumerates across stores. Read-only; does NOT record an audit entry. Requires rag group.'

const TOOL = 'rag.list_documents'
const DEFAULT_NAME = 'main'
const OTHER_NAME = 'research-2026-09'

const backend: McpBackend = { invoke: async () => ({}) }

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// message assertions via catch + toBe).
// ---------------------------------------------------------------------------

async function withDirAsync<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ud5-'))
  try {
    return await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

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

function makeEdge(
  id: string,
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
  const now = '2026-09-11T00:00:00.000Z'
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** A `doc-head` edge: source = the head SECTION, target = the document ROOT. */
function docHeadEdge(id: string, headId: string, documentId: string): RagEdge {
  return makeEdge(id, 'doc-head', headId, documentId, { documentIds: [documentId] })
}

async function makeEntry(
  root: string,
  name: string,
  opts: { seed?: RagNode[]; edges?: RagEdge[] } = {},
): Promise<RagStoreEntry> {
  const persistenceFile = join(root, `persist-${name}.json`)
  const store: RagStore = createJsonRagStore({ path: persistenceFile })
  for (const n of opts.seed ?? []) await store.putNode(n)
  for (const e of opts.edges ?? []) await store.putEdge(e)
  return {
    name,
    store,
    engine: createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes()))),
    corrupt: false,
    missing: !existsSync(persistenceFile),
  }
}

interface DocSpec {
  documentId: string
  title: string
  path?: string[]
  tags?: string[]
}

/** Build a store directory whose stores each carry `doc-head` edges + roots. */
async function directoryWithDocHeads(
  root: string,
  specs: Array<{ name: string; default?: boolean; docs: DocSpec[] }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    const seed: RagNode[] = []
    const edges: RagEdge[] = []
    for (const d of s.docs) {
      const headId = `head:${s.name}:${d.documentId}`
      seed.push(makeNode(headId, { type: 'h1', content: d.title }))
      seed.push(
        makeNode(d.documentId, {
          ...(d.path !== undefined ? { documentPath: d.path } : {}),
          ...(d.tags !== undefined ? { tags: d.tags } : {}),
        }),
      )
      edges.push(docHeadEdge(`dh:${s.name}:${d.documentId}`, headId, d.documentId))
    }
    entries.set(s.name, await makeEntry(root, s.name, { seed, edges }))
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

/** Assert `run` throws an Error whose message is EXACTLY `exactMessage`. */
function expectThrow(run: () => unknown, exactMessage: string): void {
  let caught: unknown
  try {
    run()
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a throw with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

/** The async-handler form: a rejection whose message is EXACTLY `exactMessage`. */
async function expectReject(
  run: Promise<unknown> | (() => Promise<unknown>),
  exactMessage: string,
): Promise<void> {
  let caught: unknown
  try {
    await (typeof run === 'function' ? run() : run)
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a rejection with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

/** Connect an in-memory SDK client to a server gated to `groups`. */
async function connectSdk(
  groups: ToolGroup[],
  dir: RagStoreDirectory,
  broadcasts?: Array<{ channel: string; msg: unknown }>,
): Promise<{ client: Client; close: () => Promise<void> }> {
  const mb: McpBackend = broadcasts
    ? { invoke: async () => ({}), broadcast: (channel, msg) => broadcasts.push({ channel, msg }) }
    : backend
  const main = dir.entries.get(dir.defaultName)!
  const server = new ProvidentMcpServer({
    backend: mb,
    transport: 'stdio',
    gate: new SecurityGate(),
    ragStore: main.store,
    retrievalEngine: main.engine,
    ragStores: dir,
  })
  server.ensureServerRegistered()
  server.applyGatePatch({ groups })
  const sdkServer = server.ensureServerRegistered()
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({ name: 'unit-ud5', version: '0.1.0' })
  await Promise.all([
    client.connect(clientTransport),
    (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
  ])
  return { client, close: async () => { await client.close() } }
}

function countOf(store: RagStore): number {
  return store.listNodes().length + store.listEdges().length
}

// ===========================================================================
// §5.6 states 1-3 / §5.2 — the security.ts seam + unchanged unions
// ===========================================================================
describe('U-D5 §5.2 — the security.ts seam (TOOL_GROUPS + unchanged unions)', () => {
  it('01. groupForTool("rag.list_documents") === "rag"; VALID_GROUPS / ToolGroup carry the 9 groups unchanged', () => {
    expect(groupForTool(TOOL)).toBe('rag')
    // VALID_GROUPS is UNCHANGED — all 9 groups are still accepted by applyPatch.
    const groups: ToolGroup[] = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit']
    expect(groups).toHaveLength(9)
    for (const g of groups) {
      expect(applyPatch(defaultSecurityConfig(), { groups: [g] }).enabled).toContain(g)
    }
    // An unknown group is still rejected wholesale (the validator gained none).
    const cfg = defaultSecurityConfig()
    expect(applyPatch(cfg, { groups: ['bogus' as ToolGroup] }).enabled).toEqual(cfg.enabled)
    // `rag` was already a valid group — no new group member.
    expect(groupForTool('rag.query')).toBe('rag')
  })

  it('02. default-off — defaultSecurityConfig is ["read","dispatch"]; toolAllowed false', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toEqual(['read', 'dispatch'])
    expect(cfg.enabled).not.toContain('rag')
    expect(toolAllowed(TOOL, cfg.enabled)).toBe(false)
  })

  it('03. enabled — toolAllowed true with rag; the gate registration honours it', () => {
    expect(toolAllowed(TOOL, ['rag'])).toBe(true)
    expect(toolAllowed(TOOL, ['read', 'dispatch'])).toBe(false)
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    expect(server.allowedToolNames()).not.toContain(TOOL)
    server.applyGatePatch({ groups: ['rag'] })
    expect(server.allowedToolNames()).toContain(TOOL)
  })
})

// ===========================================================================
// §5.6 state 1 / §5.8 — ALL_TOOLS + RpcMethod + MUTATING_METHODS
// ===========================================================================
describe('U-D5 §5.8 — ALL_TOOLS + RpcMethod + the MUTATING_METHODS negative contract', () => {
  it('04. ProvidentMcpServer.ALL_TOOLS includes "rag.list_documents"', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain(TOOL)
  })

  it('05. RpcMethod accepts "rag.list_documents" (compile-level; typecheck red until unioned)', () => {
    // The array literal fails `npm run typecheck` until the union member lands.
    const methods: RpcMethod[] = [TOOL]
    expect(methods).toEqual([TOOL])
  })

  it('06. NOT a member of the renderer MUTATING_METHODS (main-handled read; not exported — source-scan negative contract)', () => {
    // `rag.list_documents` is a main-handled READ tool: it never mutates the
    // renderer graph, so it must never be a MUTATING_METHODS member. The set is
    // renderer-side and not exported, so the absence is pinned by a source scan
    // (the rag-edit-gate.test.ts Seam-5 / mcp-security-hardening.test.ts
    // convention); the positive half (main registration, no renderer switch) is
    // covered by tests 03/07/08.
    const src = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    expect(src).not.toContain(TOOL)
  })
})

// ===========================================================================
// §5.6 states 2-3 / §5.3 — the SDK registration + the zod row
// ===========================================================================
describe('U-D5 §5.3 — SDK registration + the zod row (default-off / enabled)', () => {
  it('07. default-off — with only read/dispatch the SDK does not expose rag.list_documents', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const { client, close } = await connectSdk(['read', 'dispatch'], dir)
      try {
        const { tools } = await client.listTools()
        expect(tools.map((t) => t.name)).not.toContain(TOOL)
      } finally {
        await close()
      }
    })
  })

  it('08. enabled — registered with inputSchema { store } (optional), no stores field, and the pinned description', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const { client, close } = await connectSdk(['rag'], dir)
      try {
        const { tools } = await client.listTools()
        const tool = tools.find((t) => t.name === TOOL)
        expect(tool, `${TOOL} must be registered when rag is enabled`).toBeDefined()
        const schema = tool!.inputSchema as { properties?: Record<string, unknown>; required?: string[] }
        // EXACTLY the house `rag.list_nodes` mirror: { store } and nothing else.
        expect(Object.keys(schema.properties ?? {})).toEqual(['store'])
        expect((schema.properties!.store as { type?: string }).type).toBe('string')
        expect(schema.required ?? []).not.toContain('store')
        // NO `stores` field — no fan-out schema (M12).
        expect(schema.properties!.stores).toBeUndefined()
        expect(tool!.description).toBe(LIST_DOCUMENTS_DESCRIPTION)
      } finally {
        await close()
      }
    })
  })
})

// ===========================================================================
// §5.6 states 4-12 — happy listing states
// ===========================================================================
describe('U-D5 §5.6 happy paths — the single-store doc-heads listing', () => {
  it('09. happy listing (default store) — two docs sorted ascending by documentId; path/tags/title projected', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        {
          name: DEFAULT_NAME,
          default: true,
          docs: [
            { documentId: 'doc-b', title: 'Doc B' },
            { documentId: 'doc-a', title: 'Doc A', path: ['a', 'b'], tags: ['x'] },
          ],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const result = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      expect(result).toEqual({
        documents: [
          { documentId: 'doc-a', title: 'Doc A', path: ['a', 'b'], tags: ['x'] },
          { documentId: 'doc-b', title: 'Doc B', path: [], tags: [] },
        ],
      })
    })
  })

  it('10. root metadata projection — path/tags read from the ROOT (target); title from the head SECTION (source)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        {
          name: DEFAULT_NAME,
          default: true,
          docs: [{ documentId: 'concept', title: 'Head Section Title', path: ['guides'], tags: ['howto'] }],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const result = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      expect(result.documents).toEqual([
        { documentId: 'concept', title: 'Head Section Title', path: ['guides'], tags: ['howto'] },
      ])
    })
  })

  it('11. empty store — no doc-head edges → { documents: [] } (no throw)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [{ name: DEFAULT_NAME, default: true, docs: [] }])
      const main = dir.entries.get(DEFAULT_NAME)!
      const result = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      expect(result).toEqual({ documents: [] })
    })
  })

  it('12. explicit default store { store: "main" } deep-equals the omitted call (U-MS2 equivalence)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        {
          name: DEFAULT_NAME,
          default: true,
          docs: [{ documentId: 'doc-a', title: 'Doc A', path: ['a'] }],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const omitted = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      const explicit = (await handleRagTool(main.store, TOOL, { store: DEFAULT_NAME }, main.engine, dir)) as RagDocHeadsPayload
      expect(explicit).toEqual(omitted)
    })
  })

  it('13. non-default store — single-store only; store-qualified id byte-identical; default docs absent (no merge)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-main', title: 'Main Doc' }] },
        {
          name: OTHER_NAME,
          docs: [{ documentId: `${OTHER_NAME}:doc-r`, title: 'Research Doc', path: ['r'] }],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const result = (await handleRagTool(main.store, TOOL, { store: OTHER_NAME }, main.engine, dir)) as RagDocHeadsPayload
      expect(result.documents).toEqual([
        { documentId: `${OTHER_NAME}:doc-r`, title: 'Research Doc', path: ['r'], tags: [] },
      ])
      // The default store's document must NOT appear (M12 single-store, no merge).
      expect(result.documents.map((d) => d.documentId)).not.toContain('doc-main')
    })
  })

  it('14. MCP/UI equivalence — handleRagTool(S, "rag.list_documents", {}) deep-equals handleRagDocHeadsIpc(S)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        {
          name: DEFAULT_NAME,
          default: true,
          docs: [
            { documentId: 'doc-a', title: 'Doc A', path: ['a'], tags: ['t'] },
            { documentId: 'doc-b', title: 'Doc B' },
          ],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const viaTool = await handleRagTool(main.store, TOOL, {}, main.engine, dir)
      expect(viaTool).toEqual(handleRagDocHeadsIpc(main.store))
    })
  })

  it('15. legacy directory-less path (dir null) — the passed store is listed, byte-equal to the directory-routed default', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        {
          name: DEFAULT_NAME,
          default: true,
          docs: [{ documentId: 'doc-a', title: 'Doc A', path: ['a'], tags: ['t'] }],
        },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const legacy = (await handleRagTool(main.store, TOOL, {}, main.engine, null)) as RagDocHeadsPayload
      const routed = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      expect(legacy).toEqual(routed)
      expect(legacy.documents).toEqual([
        { documentId: 'doc-a', title: 'Doc A', path: ['a'], tags: ['t'] },
      ])
    })
  })

  it('16. no audit entry — an injected auditLog.list() is unchanged (unlike rag.query)', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const audit = createQueryAuditLog()
      const before = audit.list()
      await handleRagTool(main.store, TOOL, {}, main.engine, dir, audit)
      expect(audit.list()).toEqual(before)
      expect(audit.list()).toHaveLength(0)
    })
  })

  it('17. read-only — no store write, no journal entry, no rag-store-changed broadcast', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A', path: ['a'] }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const beforeNodes = main.store.listNodes()
      const beforeEdges = main.store.listEdges()
      const beforeJournal = main.store.journal().length
      await handleRagTool(main.store, TOOL, {}, main.engine, dir)
      expect(main.store.listNodes()).toEqual(beforeNodes)
      expect(main.store.listEdges()).toEqual(beforeEdges)
      expect(main.store.journal().length).toBe(beforeJournal)
    })
  })

  it('18. SDK call — the listing is returned and the backend broadcast is NEVER invoked', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A', path: ['a'], tags: ['x'] }] },
      ])
      const broadcasts: Array<{ channel: string; msg: unknown }> = []
      const { client, close } = await connectSdk(['rag'], dir, broadcasts)
      try {
        const result = await client.callTool({ name: TOOL, arguments: {} })
        const text = (result as { content?: Array<{ text?: string }> }).content?.[0]?.text ?? ''
        expect(text).toContain('"documents"')
        expect(text).toContain('doc-a')
        expect(broadcasts).toEqual([])
      } finally {
        await close()
      }
    })
  })

  // -- §5.7 states 5-8: malformed edges / roots (U-D4 inheritance) -----------
  it('19. malformed doc-head edge (empty/undefined/non-string target) is SKIPPED — no phantom, no crash', async () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { type: 'h1', content: 'Doc A' }), makeNode('doc-a')],
      [
        makeEdge('e1', 'doc-head', 'head-a', ''),
        { ...makeEdge('e2', 'doc-head', 'head-a', 'x'), target: undefined as unknown as string },
        { ...makeEdge('e3', 'doc-head', 'head-a', 'x'), target: 5 as unknown as string },
        makeEdge('e4', 'doc-head', 'head-a', 'doc-a'),
      ] as RagEdge[],
    )
    const result = (await handleRagTool(store, TOOL, {}, null, null)) as RagDocHeadsPayload
    expect(result).toEqual({
      documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }],
    })
  })

  it('20. missing/quarantined root — the entry has path: [] / tags: [] and never throws', async () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { type: 'h1', content: 'Doc A' })],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    expect(() => handleRagDocHeadsIpc(store)).not.toThrow()
    const result = (await handleRagTool(store, TOOL, {}, null, null)) as RagDocHeadsPayload
    expect(result).toEqual({
      documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }],
    })
  })

  it('21. tampered non-array documentPath/tags → []/[] (U-D4 Array.isArray guards)', async () => {
    const store = createSnapshotStore(
      [
        makeNode('head-a', { type: 'h1', content: 'Doc A' }),
        makeNode('doc-a', {
          documentPath: 'oops' as unknown as string[],
          tags: 'nope' as unknown as string[],
        }),
      ],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    const result = (await handleRagTool(store, TOOL, {}, null, null)) as RagDocHeadsPayload
    expect(result.documents).toEqual([
      { documentId: 'doc-a', title: 'Doc A', path: [], tags: [] },
    ])
  })
})

// ===========================================================================
// §5.7 fail-states — resolution-first guards + single-store scope
// ===========================================================================
describe('U-D5 §5.7 fail-states — store resolution + single-store scope', () => {
  it('22. unknown store (M2) — byte-exact, echoes only the caller input; NO listing ran', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const before = countOf(main.store)
      await expectReject(
        handleRagTool(main.store, TOOL, { store: 'nope' }, main.engine, dir),
        `rag.list_documents: unknown store 'nope'`,
      )
      // The resolver-level message is byte-identical (same seam, same prefix).
      expectThrow(() => resolveStoreArg(TOOL, 'nope', dir), `rag.list_documents: unknown store 'nope'`)
      // No store method ran (R5 side-effect freedom).
      expect(countOf(main.store)).toBe(before)
    })
  })

  it('23. >200-char unknown store — the echo is CAPPED (first 197 + "…")', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const raw300 = 'a'.repeat(300)
      await expectReject(
        handleRagTool(main.store, TOOL, { store: raw300 }, main.engine, dir),
        `${TOOL}: unknown store '${'a'.repeat(197)}…'`,
      )
    })
  })

  it('24. malformed store (M1) — non-string/empty → byte-exact; no listing', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A' }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      for (const raw of [null, 5, true, false, {}, [], 0, '']) {
        await expectReject(
          handleRagTool(main.store, TOOL, { store: raw }, main.engine, dir),
          `${TOOL}: store must be a non-empty string`,
        )
      }
    })
  })

  it('25. null store — throws "rag.list_documents: no rag store configured" (FIRST, even with an unknown store arg)', async () => {
    await expectReject(handleRagTool(null, TOOL, {}, null, null), `${TOOL}: no rag store configured`)
    await expectReject(handleRagTool(null, TOOL, { store: 'nope' }, null, null), `${TOOL}: no rag store configured`)
  })

  it('26. no stores fan-out — { store: "main", stores: "all" } returns the single addressed listing', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-main', title: 'Main Doc' }] },
        { name: OTHER_NAME, docs: [{ documentId: `${OTHER_NAME}:doc-r`, title: 'Research Doc' }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const omitted = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      const fanned = (await handleRagTool(main.store, TOOL, { store: DEFAULT_NAME, stores: 'all' }, main.engine, dir)) as RagDocHeadsPayload
      // The case ignores `stores` — no merge, no enumeration; single-store only.
      expect(fanned).toEqual(omitted)
      expect(fanned.documents.map((d) => d.documentId)).not.toContain(`${OTHER_NAME}:doc-r`)
    })
  })

  it('27. no census leak — the payload has ONLY `documents`; no store names/paths leak', async () => {
    await withDirAsync(async (root) => {
      const dir = await directoryWithDocHeads(root, [
        { name: DEFAULT_NAME, default: true, docs: [{ documentId: 'doc-a', title: 'Doc A', path: ['a'] }] },
      ])
      const main = dir.entries.get(DEFAULT_NAME)!
      const result = (await handleRagTool(main.store, TOOL, {}, main.engine, dir)) as RagDocHeadsPayload
      expect(Object.keys(result)).toEqual(['documents'])
      // No census: store names / persistence paths appear nowhere in the payload.
      const json = JSON.stringify(result)
      expect(json).not.toContain(DEFAULT_NAME)
      expect(json).not.toContain('persist-')
    })
  })

  it('28. malformed store state cannot crash — a corrupted edge set yields only documented guards', async () => {
    // A `doc-head` edge to a node that is a non-string (tampered) + a valid one:
    // no throw other than the documented M1/M2/null-store guards.
    const store = createSnapshotStore(
      [makeNode('head-a', { type: 'h1', content: 'Doc A' }), makeNode('doc-a')],
      [
        { ...makeEdge('e1', 'doc-head', 'head-a', 'x'), target: {} as unknown as string },
        makeEdge('e2', 'doc-head', 'head-a', 'doc-a'),
      ] as RagEdge[],
    )
    const result = (await handleRagTool(store, TOOL, {}, null, null)) as RagDocHeadsPayload
    expect(result.documents).toEqual([
      { documentId: 'doc-a', title: 'Doc A', path: [], tags: [] },
    ])
  })
})
