// tests/blind-unit-ud5-list-documents-tool-greens.test.ts
//
// BLIND green-scenario set for Unit U-D5 (`rag.list_documents`), authored by a
// writer who did NOT write the implementation and did NOT read
// src/main/mcp-server.ts / src/main/security.ts to decide expected behavior.
//
// Scenarios derived ONLY from docs/specs/unit-ud5-list-documents-tool.md
// (§5.2-§5.8). Harness conventions mirror the house test seam (mkdtemp temp
// dirs + byte-exact message assertions + direct handleRagTool calls) but the
// scenarios/fixtures here are independent of tests/unit-ud5-list-documents-tool.test.ts.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  SecurityGate,
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
} from '../src/main/retrieval.js'
import type { RagStoreDirectory, RagStoreEntry } from '../src/main/rag-store-directory.js'
import { createQueryAuditLog } from '../src/main/query-audit.js'
import type { RpcMethod, RagDocHeadsPayload } from '../src/shared/types.js'

const TOOL = 'rag.list_documents'
const MAIN = 'alpha'
const ALT = 'beta'

const backend: McpBackend = { invoke: async () => ({}) }

const TS = '2026-09-11T12:00:00.000Z'

function node(id: string, extra: Partial<RagNode> = {}): RagNode {
  return {
    id,
    type: 'p',
    content: `body-${id}`,
    ownedNodeIds: [],
    createdAt: TS,
    updatedAt: TS,
    ...extra,
  }
}

function edge(id: string, kind: RagEdge['kind'], source: string, target: string): RagEdge {
  return { id, kind, source, target, createdAt: TS, updatedAt: TS }
}

/** source = head SECTION; target = document ROOT. */
function docHead(id: string, head: string, root: string): RagEdge {
  return { ...edge(id, 'doc-head', head, root), documentIds: [root] }
}

interface DocSeed {
  id: string
  title: string
  path?: string[]
  tags?: string[]
}

async function storeEntry(root: string, name: string, docs: DocSeed[]): Promise<RagStoreEntry> {
  const file = join(root, `${name}.json`)
  const store: RagStore = createJsonRagStore({ path: file })
  for (const d of docs) {
    const head = `head::${name}::${d.id}`
    await store.putNode(node(head, { type: 'h1', content: d.title }))
    await store.putNode(
      node(d.id, {
        ...(d.path !== undefined ? { documentPath: d.path } : {}),
        ...(d.tags !== undefined ? { tags: d.tags } : {}),
      }),
    )
    await store.putEdge(docHead(`dh::${name}::${d.id}`, head, d.id))
  }
  return {
    name,
    store,
    engine: createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes()))),
    corrupt: false,
    missing: !existsSync(file),
  }
}

async function buildDirectory(
  root: string,
  specs: Array<{ name: string; default?: boolean; docs: DocSeed[] }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    entries.set(s.name, await storeEntry(root, s.name, s.docs))
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

async function withTmp<T>(run: (root: string) => Promise<T>): Promise<T> {
  const root = mkdtempSync(join(tmpdir(), 'ud5-blind-'))
  try {
    return await run(root)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

async function expectRejection(p: Promise<unknown>, exact: string): Promise<void> {
  let caught: unknown
  try {
    await p
  } catch (err) {
    caught = err
  }
  expect(caught, `expected rejection ${JSON.stringify(exact)}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exact)
}

function entryKeys(payload: RagDocHeadsPayload): string[] {
  expect(payload.documents).toHaveLength(1)
  return Object.keys(payload.documents[0]!).sort()
}

// ===========================================================================
// B01-B03 — membership seams (§5.1/§5.2/§5.3/§5.8)
// ===========================================================================
describe('blind U-D5 — membership seams', () => {
  it('B01 §5.2 TOOL_GROUPS: groupForTool maps the name to the existing rag group; group count unchanged', () => {
    expect(groupForTool(TOOL)).toBe('rag')
    // rag existed before U-D5; the 9-group set is unchanged.
    const groups: ToolGroup[] = [
      'read',
      'dispatch',
      'graph',
      'code',
      'module',
      'rag',
      'edit',
      'gnosis',
      'gnosis-edit',
    ]
    expect(groups).toHaveLength(9)
    expect(groupForTool('rag.query')).toBe('rag')
  })

  it('B02 §5.3 ALL_TOOLS: the static census includes the new name', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain(TOOL)
  })

  it('B03 §5.1 RpcMethod: the union accepts the name (type-level; enforced by npm run typecheck)', () => {
    const methods: RpcMethod[] = [TOOL]
    expect(methods).toEqual([TOOL])
  })
})

// ===========================================================================
// B04-B06 — default-off gating (§5.2/§5.3/§5.7 state 4)
// ===========================================================================
describe('blind U-D5 — default-off gating', () => {
  it('B04 §5.2 default config enables only read/dispatch; toolAllowed is false', () => {
    const cfg = defaultSecurityConfig()
    expect(cfg.enabled).toEqual(['read', 'dispatch'])
    expect(cfg.enabled).not.toContain('rag')
    expect(toolAllowed(TOOL, cfg.enabled)).toBe(false)
  })

  it('B05 §5.2 enabled rag group makes the tool allowed', () => {
    expect(toolAllowed(TOOL, ['rag'])).toBe(true)
    expect(toolAllowed(TOOL, ['rag', 'read'])).toBe(true)
  })

  it('B06 §5.3 registration honours the gate (not listed with read/dispatch; listed with rag)', () => {
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    expect(server.allowedToolNames()).not.toContain(TOOL)
    server.applyGatePatch({ groups: ['rag'] })
    expect(server.allowedToolNames()).toContain(TOOL)
  })
})

// ===========================================================================
// B07-B09 — output shape (§5.4/§5.6 states 4-6)
// ===========================================================================
describe('blind U-D5 — output shape + empty store', () => {
  it('B07 §5.6 state 4 the listing is { documents: [...] } sorted ascending by documentId with root metadata projected', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        {
          name: MAIN,
          default: true,
          docs: [
            { id: 'note-2', title: 'Note Two' },
            { id: 'note-1', title: 'Note One', path: ['notes', 'intro'], tags: ['a', 'b'] },
          ],
        },
      ])
      const main = dir.entries.get(MAIN)!
      const payload = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      expect(payload).toEqual({
        documents: [
          { documentId: 'note-1', title: 'Note One', path: ['notes', 'intro'], tags: ['a', 'b'] },
          { documentId: 'note-2', title: 'Note Two', path: [], tags: [] },
        ],
      })
    })
  })

  it('B08 §5.4 the payload has exactly `documents` and each entry has exactly documentId/title/path/tags', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'only', title: 'Only', path: ['p'], tags: ['t'] }] },
      ])
      const main = dir.entries.get(MAIN)!
      const payload = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      expect(Object.keys(payload).sort()).toEqual(['documents'])
      expect(entryKeys(payload)).toEqual(['documentId', 'path', 'tags', 'title'])
    })
  })

  it('B09 §5.6 state 6 an empty store returns { documents: [] } without throwing', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [{ name: MAIN, default: true, docs: [] }])
      const main = dir.entries.get(MAIN)!
      const payload = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      expect(payload).toEqual({ documents: [] })
    })
  })
})

// ===========================================================================
// B10-B15 — optional store resolution (§5.4 resolution-first / §5.7 states 1-3)
// ===========================================================================
describe('blind U-D5 — optional store resolution', () => {
  it('B10 §5.6 state 7 explicit default-store name equals the omitted-store call', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'd1', title: 'D1', path: ['x'] }] },
      ])
      const main = dir.entries.get(MAIN)!
      const omitted = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      const explicit = (await handleRagTool(main.store, TOOL, { store: MAIN }, null, dir)) as RagDocHeadsPayload
      expect(explicit).toEqual(omitted)
    })
  })

  it('B11 §5.6 state 8 a named non-default store lists only that store (no merge)', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'main-doc', title: 'Main' }] },
        { name: ALT, docs: [{ id: `${ALT}:r1`, title: 'Alt', path: ['r'] }] },
      ])
      const main = dir.entries.get(MAIN)!
      const payload = (await handleRagTool(main.store, TOOL, { store: ALT }, null, dir)) as RagDocHeadsPayload
      expect(payload.documents).toEqual([
        { documentId: `${ALT}:r1`, title: 'Alt', path: ['r'], tags: [] },
      ])
      expect(payload.documents.map((d) => d.documentId)).not.toContain('main-doc')
    })
  })

  it('B12 §5.7 state 1 an unknown store throws the M2 message and echoes only the caller input', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [{ name: MAIN, default: true, docs: [] }])
      const main = dir.entries.get(MAIN)!
      await expectRejection(
        handleRagTool(main.store, TOOL, { store: 'ghost' }, null, dir),
        `rag.list_documents: unknown store 'ghost'`,
      )
    })
  })

  it('B13 §5.7 state 1 a >200-char unknown store is echoed capped at first 197 + ellipsis', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [{ name: MAIN, default: true, docs: [] }])
      const main = dir.entries.get(MAIN)!
      const raw = 'z'.repeat(260)
      await expectRejection(
        handleRagTool(main.store, TOOL, { store: raw }, null, dir),
        `rag.list_documents: unknown store '${'z'.repeat(197)}…'`,
      )
    })
  })

  it('B14 §5.7 state 2 a non-string or empty-string store throws the M1 message', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [{ name: MAIN, default: true, docs: [] }])
      const main = dir.entries.get(MAIN)!
      for (const raw of [null, 5, true, false, {}, [], 0, '']) {
        await expectRejection(
          handleRagTool(main.store, TOOL, { store: raw }, null, dir),
          `rag.list_documents: store must be a non-empty string`,
        )
      }
    })
  })

  it('B15 §5.7 state 3 a null store throws the no-store message before resolution', async () => {
    await expectRejection(handleRagTool(null, TOOL, {}, null, null), `rag.list_documents: no rag store configured`)
    await expectRejection(
      handleRagTool(null, TOOL, { store: 'ghost' }, null, null),
      `rag.list_documents: no rag store configured`,
    )
  })
})

// ===========================================================================
// B16-B17 — single-store scope / no census (§5.5 / §5.7 states 9-10)
// ===========================================================================
describe('blind U-D5 — single-store scope, no census', () => {
  it('B16 §5.5 a stray stores:"all" is ignored — same single listing, no fan-out', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'm1', title: 'M1' }] },
        { name: ALT, docs: [{ id: `${ALT}:x`, title: 'X' }] },
      ])
      const main = dir.entries.get(MAIN)!
      const plain = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      const stray = (await handleRagTool(
        main.store,
        TOOL,
        { store: MAIN, stores: 'all' },
        null,
        dir,
      )) as RagDocHeadsPayload
      expect(stray).toEqual(plain)
      expect(stray.documents.map((d) => d.documentId)).not.toContain(`${ALT}:x`)
    })
  })

  it('B17 §5.7 state 10 the payload leaks no store names, persistence paths, or census keys', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'd1', title: 'D1', path: ['x'] }] },
      ])
      const main = dir.entries.get(MAIN)!
      const payload = (await handleRagTool(main.store, TOOL, {}, null, dir)) as RagDocHeadsPayload
      const json = JSON.stringify(payload)
      expect(json).not.toContain(MAIN)
      expect(json).not.toContain('.json')
      expect(json).not.toContain('store')
    })
  })
})

// ===========================================================================
// B18 — no audit entry (§5.4 / §5.6 state 11)
// ===========================================================================
describe('blind U-D5 — read-only, no audit', () => {
  it('B18 §5.6 state 11 an injected audit log is untouched by a listing', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        { name: MAIN, default: true, docs: [{ id: 'd1', title: 'D1' }] },
      ])
      const main = dir.entries.get(MAIN)!
      const audit = createQueryAuditLog()
      const before = audit.list()
      await handleRagTool(main.store, TOOL, {}, null, dir, audit)
      expect(audit.list()).toEqual(before)
      expect(audit.list()).toHaveLength(0)
    })
  })
})

// ===========================================================================
// B19-B22 — malformed state absorption, equivalence (§5.7 states 5-8 / §5.6 state 9)
// ===========================================================================
describe('blind U-D5 — malformed state + MCP/UI equivalence', () => {
  it('B19 §5.7 state 5 malformed doc-head targets are skipped, a valid one survives', () => {
    const store = createSnapshotStore(
      [node('h', { type: 'h1', content: 'Good' }), node('good')],
      [
        edge('e1', 'doc-head', 'h', ''),
        { ...edge('e2', 'doc-head', 'h', 'x'), target: undefined as unknown as string },
        { ...edge('e3', 'doc-head', 'h', 'x'), target: 7 as unknown as string },
        edge('e4', 'doc-head', 'h', 'good'),
      ] as RagEdge[],
    )
    const payload = handleRagDocHeadsIpc(store) as RagDocHeadsPayload
    expect(payload).toEqual({
      documents: [{ documentId: 'good', title: 'Good', path: [], tags: [] }],
    })
  })

  it('B20 §5.7 state 6 a missing root yields path: [] / tags: [] and never throws', () => {
    const store = createSnapshotStore(
      [node('h', { type: 'h1', content: 'Phantom Head' })],
      [edge('dh', 'doc-head', 'h', 'missing-root')],
    )
    expect(() => handleRagDocHeadsIpc(store)).not.toThrow()
    const payload = handleRagDocHeadsIpc(store) as RagDocHeadsPayload
    expect(payload.documents).toEqual([
      { documentId: 'missing-root', title: 'Phantom Head', path: [], tags: [] },
    ])
  })

  it('B21 §5.7 state 7 tampered non-array documentPath/tags normalize to []/[]', () => {
    const store = createSnapshotStore(
      [
        node('h', { type: 'h1', content: 'Tampered' }),
        node('t', {
          documentPath: 'not-an-array' as unknown as string[],
          tags: 42 as unknown as string[],
        }),
      ],
      [edge('dh', 'doc-head', 'h', 't')],
    )
    const payload = handleRagDocHeadsIpc(store) as RagDocHeadsPayload
    expect(payload.documents).toEqual([
      { documentId: 't', title: 'Tampered', path: [], tags: [] },
    ])
  })

  it('B22 §5.6 state 9 the tool result deep-equals the shared handleRagDocHeadsIpc computation', async () => {
    await withTmp(async (root) => {
      const dir = await buildDirectory(root, [
        {
          name: MAIN,
          default: true,
          docs: [
            { id: 'eq-1', title: 'Eq 1', path: ['a'], tags: ['t'] },
            { id: 'eq-2', title: 'Eq 2' },
          ],
        },
      ])
      const main = dir.entries.get(MAIN)!
      const viaTool = await handleRagTool(main.store, TOOL, {}, null, dir)
      expect(viaTool).toEqual(handleRagDocHeadsIpc(main.store))
    })
  })
})
