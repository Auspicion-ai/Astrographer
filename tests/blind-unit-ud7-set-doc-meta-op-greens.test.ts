// tests/blind-unit-ud7-set-doc-meta-op-greens.test.ts
// BLIND green-scenario artifact for Unit U-D7 (RCA-4 / AGENTS.md item 10a).
// Scenarios are derived from docs/specs/unit-ud7-set-doc-meta-op.md alone
// (§5.1-§5.8 + §3a A1-A12). src/main/edit-ops.ts was NOT read to decide
// expected behavior; only its public seams are imported. The fixtures and
// assertions below are independently authored (distinct from the TestWriter
// file). Scenario ids map to spec sections and are recorded in
// docs/specs/unit-ud7-set-doc-meta-op-greens.md.
import { describe, it, expect, vi, afterAll } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import {
  setDocMeta,
  type EditOpContext,
  type SetDocMetaResult,
} from '../src/main/edit-ops.js'
import {
  groupForTool,
  toolAllowed,
  defaultSecurityConfig,
  SecurityGate,
  type ToolGroup,
} from '../src/main/security.js'
import {
  handleEditTool,
  ProvidentMcpServer,
  type McpBackend,
} from '../src/main/mcp-server.js'
import {
  createRetrieval,
  createLexicalEmbedder,
  createLexicalIndex,
  type RetrievalEngine,
} from '../src/main/retrieval.js'
import type { RagStoreDirectory, RagStoreEntry } from '../src/main/rag-store-directory.js'
import type { RpcMethod } from '../src/shared/types.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

// ---------------------------------------------------------------------------
// house-style helpers (independent fixtures)
// ---------------------------------------------------------------------------
const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ud7-blind-'))
  tempDirs.push(dir)
  return dir
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

const NOW = '2026-09-12T00:00:00.000Z'

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  return {
    id,
    kind: 'parent-child',
    source,
    target,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  }
}

/**
 * Seed a document root: the root is the TARGET of a `doc-head` edge and a
 * section node is the edge's SOURCE (U-D3/U-D4 root predicate).
 */
async function seedRoot(
  store: RagStore,
  opts: { rootId?: string; documentPath?: string[]; tags?: string[]; type?: RagNode['type'] } = {},
): Promise<{ rootId: string; sectionId: string }> {
  const rootId = opts.rootId ?? 'root'
  const sectionId = `${rootId}::sec`
  const rootOverrides: Partial<RagNode> = { type: opts.type ?? 'h1', content: `doc:${rootId}` }
  if (opts.documentPath !== undefined) rootOverrides.documentPath = opts.documentPath
  if (opts.tags !== undefined) rootOverrides.tags = opts.tags
  await store.putNode(makeNode(rootId, rootOverrides))
  await store.putNode(makeNode(sectionId, { type: 'p', content: `body:${sectionId}` }))
  await store.putEdge(makeEdge(`e-head-${rootId}`, sectionId, rootId, { kind: 'doc-head' }))
  return { rootId, sectionId }
}

function hasNodeUpdate(store: RagStore, nodeId: string): boolean {
  return store
    .journal()
    .some((e) => e.kind === 'structural' && e.op.op === 'node-update' && e.op.nodeId === nodeId)
}

function expectOk<T extends { ok: boolean }>(r: T): Extract<T, { ok: true }> {
  expect(r.ok).toBe(true)
  if (!r.ok) throw new Error('expected ok, got failure: ' + (r as { error?: string }).error)
  return r as Extract<T, { ok: true }>
}

function expectFail<T extends { ok: boolean }>(r: T): Extract<T, { ok: false }> {
  expect(r.ok).toBe(false)
  if (r.ok) throw new Error('expected failure, got ok')
  return r as Extract<T, { ok: false }>
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

// The minimal store directory (the `store` selector resolution surface).
function entryFor(name: string, store: RagStore): RagStoreEntry {
  return { name, store, engine: null as unknown as RetrievalEngine, corrupt: false, missing: false }
}

const ALPHA = 'alpha-catalogue'
const BETA = 'beta-catalogue'

async function makeDirectory(
  root: string,
  specs: Array<{ name: string; default?: boolean }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    const store = createJsonRagStore({ path: join(root, `persist-${s.name}.json`) })
    entries.set(s.name, entryFor(s.name, store))
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

async function withSdkTools(
  store: RagStore,
  groups: ToolGroup[],
  body: (tools: Array<{ name: string; inputSchema: unknown }>) => Promise<void>,
): Promise<void> {
  const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
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
  const client = new Client({ name: 'ud7-blind', version: '0.1.0' })
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

// ===========================================================================
// G1 — tags-only update; every other field incl. documentPath is preserved
//      (§5.1, §5.6.5, §5.6.8, A2)
// ===========================================================================
describe('UD7-G1 — tags-only update preserves path + all other fields', () => {
  it('new tags land; documentPath/type/content/ownedNodeIds/id are untouched', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, {
        documentPath: ['lore', 'deep'],
        tags: ['seed'],
        type: 'h2',
      })
      const before = store.getNode(rootId)!
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['arcana', 'lore'] }))
      const after = store.getNode(rootId)!
      expect(result.node.tags).toEqual(['arcana', 'lore'])
      expect(after.tags).toEqual(['arcana', 'lore'])
      expect(after.documentPath).toEqual(['lore', 'deep'])
      expect(after.id).toBe(before.id)
      expect(after.type).toBe(before.type)
      expect(after.content).toBe(before.content)
      expect(after.ownedNodeIds).toEqual(before.ownedNodeIds)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G2 — normalization is the STORE's; the op does not pre-normalize
//      (§5.2, §5.6.6, A5)
// ===========================================================================
describe('UD7-G2 — store-authoritative normalization (trim / dedupe / case)', () => {
  it('["  sol  ","luna","sol","Luna","luna "] → ["sol","luna","Luna"]; caller array not mutated', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      const input = ['  sol  ', 'luna', 'sol', 'Luna', 'luna ']
      const inputSnapshot = JSON.stringify(input)
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: input }))
      expect(result.node.tags).toEqual(['sol', 'luna', 'Luna'])
      expect(store.getNode(rootId)!.tags).toEqual(['sol', 'luna', 'Luna'])
      expect(JSON.stringify(input)).toBe(inputSnapshot)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G3 — [] clears via normalization; the write still occurs
//      (§5.6.7, §5.6.11, A5, A10)
// ===========================================================================
describe('UD7-G3 — [] clears tags and still journals (always-write)', () => {
  it('existing tags -> undefined with +1 journal entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['keep'] })
      const before = store.journal().length
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [] }))
      expect(result.node.tags).toBeUndefined()
      expect(store.getNode(rootId)!.tags).toBeUndefined()
      expect(store.journal().length).toBe(before + 1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('already-untagged root + [] still journals (no synthesized no-op guard)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      expect(store.getNode(rootId)!.tags).toBeUndefined()
      const before = store.journal().length
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [] }))
      expect(store.getNode(rootId)!.tags).toBeUndefined()
      expect(store.journal().length).toBe(before + 1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G4 — root predicate: only a `doc-head` TARGET is editable
//      (§5.2 row 8, §5.7.8, A1)
// ===========================================================================
describe('UD7-G4 — root predicate (doc-head target only)', () => {
  it('doc-head TARGET accepted; source / hand-created / parent-child target / doc-end participant rejected', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId, sectionId } = await seedRoot(store, { tags: ['base'] })
      // hand-created div (no edges).
      await store.putNode(makeNode('hand-div', { type: 'div' }))
      // parent-child edge whose TARGET is not a doc-head target.
      await store.putNode(makeNode('pc-parent'))
      await store.putNode(makeNode('pc-child'))
      await store.putEdge(makeEdge('e-pc', 'pc-parent', 'pc-child', { kind: 'parent-child' }))
      // doc-end edge participant (source).
      await store.putNode(makeNode('end-from'))
      await store.putNode(makeNode('end-to'))
      await store.putEdge(makeEdge('e-end', 'end-from', 'end-to', { kind: 'doc-end' }))
      const before = store.journal().length

      // the doc-head target itself succeeds.
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['ok'] }))

      for (const nodeId of [sectionId, 'hand-div', 'pc-child', 'end-from', 'end-to']) {
        const r = expectFail(await setDocMeta({ store }, { nodeId, tags: ['nope'] }))
        expect(r.error).toBe('edit.set_doc_meta: target is not a document root')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['ok'])
      // only the successful edit journaled.
      expect(store.journal().length).toBe(before + 1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G5 — validation fail-states: non-array / non-string member
//      (§5.2 rows 1-2, §5.7.1-2, A3)
// ===========================================================================
describe('UD7-G5 — non-array and non-string members fail as a result (never a throw)', () => {
  it('non-array values → "tags must be a string array"; store untouched', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const before = store.journal().length
      for (const bad of [{}, 'sol', 7, null, undefined, true]) {
        const r = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: bad as never }))
        expect(r.error).toBe('edit.set_doc_meta: tags must be a string array')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('non-string members → same message; store untouched', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const before = store.journal().length
      for (const bad of [['a', 1], [null], [{}], ['a', true]]) {
        const r = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: bad as never }))
        expect(r.error).toBe('edit.set_doc_meta: tags must be a string array')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G6 — count cap inclusive at 64
//      (§5.2 row 3, §5.7.3, A4)
// ===========================================================================
describe('UD7-G6 — count cap: 64 accepted, 65 rejected', () => {
  it('exactly 64 tags land; 65 fail with "too many tags (max 64)"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const tags64 = Array.from({ length: 64 }, (_, i) => `tag-${i}`)
      const ok = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: tags64 }))
      expect(ok.node.tags).toEqual(tags64)
      const before = store.journal().length
      const r = expectFail(
        await setDocMeta({ store }, { nodeId: rootId, tags: Array.from({ length: 65 }, (_, i) => `t${i}`) }),
      )
      expect(r.error).toBe('edit.set_doc_meta: too many tags (max 64)')
      expect(store.getNode(rootId)!.tags).toEqual(tags64)
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G7 — per-tag length cap inclusive at 128
//      (§5.2 row 4, §5.7.4, A4)
// ===========================================================================
describe('UD7-G7 — length cap: 128 chars accepted, 129 rejected', () => {
  it('a 128-char tag lands; 129 fails with "tag too long (max 128)"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const tag128 = 'z'.repeat(128)
      const ok = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [tag128] }))
      expect(ok.node.tags).toEqual([tag128])
      const before = store.journal().length
      const r = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: ['z'.repeat(129)] }))
      expect(r.error).toBe('edit.set_doc_meta: tag too long (max 128)')
      expect(store.getNode(rootId)!.tags).toEqual([tag128])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G8 — control characters rejected
//      (§5.2 row 5, §5.7.5, A3)
// ===========================================================================
describe('UD7-G8 — C0/DEL control characters rejected', () => {
  it('\\u0000 / \\u001F / \\u007F / \\n / \\t → "tags must not contain control characters"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const before = store.journal().length
      for (const ctl of ['\u0000', '\u001F', '\u007F', '\n', '\t']) {
        const r = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: [`t${ctl}x`] }))
        expect(r.error).toBe('edit.set_doc_meta: tags must not contain control characters')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G9 — empty-after-trim rejected; padded non-empty accepted
//      (§5.2 row 6, §5.7.6, A3)
// ===========================================================================
describe('UD7-G9 — empty-after-trim fail-state', () => {
  it('"" / "   " → "tags must be non-empty strings"; "  ok  " is valid', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const before = store.journal().length
      for (const bad of [[''], ['   '], ['x', '']]) {
        const r = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: bad }))
        expect(r.error).toBe('edit.set_doc_meta: tags must be non-empty strings')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(before)
      const ok = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['  ok  '] }))
      expect(ok.node.tags).toEqual(['ok'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G10 — deterministic validation ORDER (first failing rule wins)
//       (§5.2, §5.6.10)
// ===========================================================================
describe('UD7-G10 — validation precedence', () => {
  it('member-type beats count; count beats length/control; length beats control/empty', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })

      const nonString65 = Array.from({ length: 65 }, () => 1)
      const r1 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: nonString65 as never }))
      expect(r1.error).toBe('edit.set_doc_meta: tags must be a string array')

      const manyControls = ['\u0000', ...Array.from({ length: 64 }, (_, i) => `t${i}`)]
      const r2 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: manyControls }))
      expect(r2.error).toBe('edit.set_doc_meta: too many tags (max 64)')

      const longWithControl = ['z'.repeat(129).slice(0, 128) + '\u0000']
      const r3 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: longWithControl }))
      expect(r3.error).toBe('edit.set_doc_meta: tag too long (max 128)')

      const longWhitespace = [' '.repeat(129)]
      const r4 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: longWhitespace }))
      expect(r4.error).toBe('edit.set_doc_meta: tag too long (max 128)')

      expect(store.getNode(rootId)!.tags).toEqual(['base'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G11 — missing node
//       (§5.2 row 7, §5.7.7)
// ===========================================================================
describe('UD7-G11 — missing node fail-state', () => {
  it('an unknown nodeId → "node not found"; store untouched', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRoot(store, { tags: ['base'] })
      const before = store.journal().length
      const r = expectFail(await setDocMeta({ store }, { nodeId: 'ghost-node', tags: ['x'] }))
      expect(r.error).toBe('edit.set_doc_meta: node not found')
      expect(store.journal().length).toBe(before)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G12 — tool-level guards: nodeId required + null store
//       (§5.2, §5.4.1, §5.7.12)
// ===========================================================================
describe('UD7-G12 — handleEditTool caller-shape guards', () => {
  it('missing/empty/non-string nodeId → "edit.set_doc_meta: nodeId required"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRoot(store, { tags: ['base'] })
      await expectRejectExact(
        handleEditTool(store, 'edit.set_doc_meta', {}, vi.fn(), null),
        'edit.set_doc_meta: nodeId required',
      )
      await expectRejectExact(
        handleEditTool(store, 'edit.set_doc_meta', { nodeId: '' }, vi.fn(), null),
        'edit.set_doc_meta: nodeId required',
      )
      await expectRejectExact(
        handleEditTool(store, 'edit.set_doc_meta', { nodeId: 5 }, vi.fn(), null),
        'edit.set_doc_meta: nodeId required',
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('null store → "edit.set_doc_meta: no rag store configured"', async () => {
    await expectRejectExact(
      handleEditTool(null as unknown as RagStore, 'edit.set_doc_meta', { nodeId: 'x', tags: ['a'] }, vi.fn(), null),
      'edit.set_doc_meta: no rag store configured',
    )
  })
})

// ===========================================================================
// G13 — raw malformed tags through the handler cannot bypass validation
//       (§5.7.14, A3)
// ===========================================================================
describe('UD7-G13 — handler raw pass-through returns a documented result (never a throw)', () => {
  it('handler tags:123 → "tags must be a string array"; no broadcast; store untouched', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['base'] })
      const cb = vi.fn()
      const before = store.journal().length
      const r = expectFail(await handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: 123 }, cb, null))
      expect(r.error).toBe('edit.set_doc_meta: tags must be a string array')
      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(before)
      expect(cb).not.toHaveBeenCalled()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G14 — journal invertibility (inherited U-D2) + fresh-boot no-quarantine
//       (§5.6.12, A6)
// ===========================================================================
describe('UD7-G14 — undo/redo inverts tags; fresh boot re-hashes', () => {
  it('orig → mid → final; undo x2 back to orig; redo x2 forward; fresh boots stay unquarantined', async () => {
    const dir = freshDir()
    try {
      const path = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path })
      const { rootId } = await seedRoot(store, { tags: ['orig'], documentPath: ['n'] })
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['mid'] }))
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['final'] }))
      expect(store.getNode(rootId)!.tags).toEqual(['final'])

      await store.undo()
      expect(store.getNode(rootId)!.tags).toEqual(['mid'])
      await store.undo()
      expect(store.getNode(rootId)!.tags).toEqual(['orig'])

      const bootAfterUndo: RagStore = createJsonRagStore({ path })
      expect(bootAfterUndo.status().quarantined).toEqual([])
      expect(bootAfterUndo.status().loadedNodes).toContain(rootId)
      expect(bootAfterUndo.getNode(rootId)!.tags).toEqual(['orig'])
      expect(bootAfterUndo.getNode(rootId)!.documentPath).toEqual(['n'])

      await store.redo()
      expect(store.getNode(rootId)!.tags).toEqual(['mid'])
      await store.redo()
      expect(store.getNode(rootId)!.tags).toEqual(['final'])

      const bootAfterRedo: RagStore = createJsonRagStore({ path })
      expect(bootAfterRedo.status().quarantined).toEqual([])
      expect(bootAfterRedo.status().loadedNodes).toContain(rootId)
      expect(bootAfterRedo.getNode(rootId)!.tags).toEqual(['final'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G15 — seams: group / ALL_TOOLS / RpcMethod / default-off / MUTATING_METHODS
//       (§5.3, §5.6.2-4, §5.7.13, §5.8, A7)
// ===========================================================================
describe('UD7-G15 — the seam set', () => {
  it('groupForTool resolves "edit"; ALL_TOOLS carries the row (census 57)', () => {
    expect(groupForTool('edit.set_doc_meta')).toBe('edit')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('edit.set_doc_meta')
    expect(ProvidentMcpServer.ALL_TOOLS).toHaveLength(57)
  })

  it('RpcMethod union accepts "edit.set_doc_meta" (type-level)', () => {
    const method: RpcMethod = 'edit.set_doc_meta'
    expect(method).toBe('edit.set_doc_meta')
  })

  it('default-off: defaultSecurityConfig enabled is ["read","dispatch"]; edit-group gating only', () => {
    expect(defaultSecurityConfig().enabled).toEqual(['read', 'dispatch'])
    expect(toolAllowed('edit.set_doc_meta', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['edit'])).toBe(true)
    expect(toolAllowed('edit.set_doc_meta', ['gnosis-edit'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['gnosis'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['code'])).toBe(false)
  })

  it('absent from the renderer MUTATING_METHODS (negative contract; source-pinned)', () => {
    const src = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    expect(src).toContain("'code.loadBatch'")
    expect(src).toContain("'dispatch'")
    expect(src).not.toContain('edit.set_doc_meta')
  })
})

// ===========================================================================
// G16 — optional store resolution + exactly ONE success broadcast
//       (§5.4, §5.6.5, §5.6.13, A8, A12)
// ===========================================================================
describe('UD7-G16 — store resolution and the single success broadcast', () => {
  it('store:"beta" routes the write there and stamps beta; omitted/alpha hit the default', async () => {
    const dir = freshDir()
    try {
      const ragDir = await makeDirectory(dir, [
        { name: ALPHA, default: true },
        { name: BETA },
      ])
      const alpha = ragDir.entries.get(ALPHA)!.store
      const beta = ragDir.entries.get(BETA)!.store
      const a1 = await seedRoot(alpha, { rootId: 'root-a1' })
      const a2 = await seedRoot(alpha, { rootId: 'root-a2' })
      const b1 = await seedRoot(beta, { rootId: 'root-b1' })
      const a3 = await seedRoot(alpha, { rootId: 'root-a3' })

      // addressed at beta (non-default)
      const cbBeta = vi.fn()
      const rBeta = expectOk(
        await handleEditTool(beta, 'edit.set_doc_meta', { nodeId: b1.rootId, tags: ['b-tag'], store: BETA }, cbBeta, ragDir),
      )
      expect(rBeta.node.tags).toEqual(['b-tag'])
      expect(beta.getNode(b1.rootId)!.tags).toEqual(['b-tag'])
      expect(alpha.getNode(a1.rootId)!.tags).toBeUndefined()
      expect(cbBeta).toHaveBeenCalledTimes(1)
      expect(cbBeta.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [b1.rootId], edgeIds: [], store: BETA })
      expect(cbBeta.mock.calls[0][1]).toBe(BETA)

      // omitted store → default entry
      const cbOmitted = vi.fn()
      const rOmitted = expectOk(
        await handleEditTool(alpha, 'edit.set_doc_meta', { nodeId: a1.rootId, tags: ['om'] }, cbOmitted, ragDir),
      )
      expect(rOmitted.node.tags).toEqual(['om'])
      expect(alpha.getNode(a1.rootId)!.tags).toEqual(['om'])
      expect(cbOmitted).toHaveBeenCalledTimes(1)
      expect(cbOmitted.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [a1.rootId], edgeIds: [], store: ALPHA })
      expect(cbOmitted.mock.calls[0][1]).toBe(ALPHA)

      // explicit default ≡ omitted (same normalized state + same payload)
      const cbExplicit = vi.fn()
      const rExplicit = expectOk(
        await handleEditTool(alpha, 'edit.set_doc_meta', { nodeId: a2.rootId, tags: ['om'], store: ALPHA }, cbExplicit, ragDir),
      )
      expect(rExplicit.node.tags).toEqual(rOmitted.node.tags)
      expect(cbExplicit.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [a2.rootId], edgeIds: [], store: ALPHA })

      // unknown store fails loud BEFORE the op; no broadcast; other stores untouched
      const cbUnknown = vi.fn()
      await expectRejectExact(
        handleEditTool(alpha, 'edit.set_doc_meta', { nodeId: a3.rootId, tags: ['x'], store: 'nowhere' }, cbUnknown, ragDir),
        "edit.set_doc_meta: unknown store 'nowhere'",
      )
      expect(cbUnknown).not.toHaveBeenCalled()
      expect(alpha.getNode(a3.rootId)!.tags).toBeUndefined()

      // malformed store (M1)
      await expectRejectExact(
        handleEditTool(alpha, 'edit.set_doc_meta', { nodeId: a3.rootId, tags: ['x'], store: 9 }, vi.fn(), ragDir),
        'edit.set_doc_meta: store must be a non-empty string',
      )
      await expectRejectExact(
        handleEditTool(alpha, 'edit.set_doc_meta', { nodeId: a3.rootId, tags: ['x'], store: '' }, vi.fn(), ragDir),
        'edit.set_doc_meta: store must be a non-empty string',
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G17 — a failed op lands ZERO journal entries and does NOT broadcast
//       (§5.7.15, A9, A12)
// ===========================================================================
describe('UD7-G17 — failed op is journal-clean and silent', () => {
  it('non-root target and empty tag: zero journal, zero undo-depth, zero broadcast', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId, sectionId } = await seedRoot(store, { tags: ['base'] })
      const cb = vi.fn()
      const j0 = store.journal().length
      const d0 = store.undoDepth()

      const r1 = expectFail(await handleEditTool(store, 'edit.set_doc_meta', { nodeId: sectionId, tags: ['x'] }, cb, null))
      expect(r1.error).toBe('edit.set_doc_meta: target is not a document root')
      const r2 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: ['   '] }))
      expect(r2.error).toBe('edit.set_doc_meta: tags must be non-empty strings')

      expect(store.getNode(rootId)!.tags).toEqual(['base'])
      expect(store.journal().length).toBe(j0)
      expect(store.undoDepth()).toBe(d0)
      expect(cb).not.toHaveBeenCalled()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G18 — path immutability: no path-write surface
//       (§5.2, §5.6.8, §5.7.9, A2)
// ===========================================================================
describe('UD7-G18 — documentPath is immutable', () => {
  it('a raw handler call carrying documentPath/path ignores them; path + tags behave normally', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { documentPath: ['keep', 'this'], tags: ['base'] })
      const cb = vi.fn()
      const r = expectOk(
        await handleEditTool(
          store,
          'edit.set_doc_meta',
          { nodeId: rootId, tags: ['fresh'], documentPath: ['hijack'], path: ['hijack2'] },
          cb,
          null,
        ),
      )
      expect(r.node.tags).toEqual(['fresh'])
      expect(r.node.documentPath).toEqual(['keep', 'this'])
      expect(store.getNode(rootId)!.documentPath).toEqual(['keep', 'this'])
      expect(cb).toHaveBeenCalledTimes(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G19 — the zod row shape: nodeId/tags required, store optional, no path
//       (§5.3 Seam 3, §5.6.2, §5.6.3, A2)
// ===========================================================================
describe('UD7-G19 — SDK zod row shape', () => {
  it('registered row has nodeId:string, tags:array<string>, store?:string, and NO path field', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await withSdkTools(store, ['edit'], async (tools) => {
        const tool = tools.find((t) => t.name === 'edit.set_doc_meta')
        expect(tool, 'edit.set_doc_meta must be registered when the edit group is enabled').toBeDefined()
        const schema = tool!.inputSchema as {
          properties?: Record<string, { type?: string; items?: { type?: string } }>
          required?: string[]
        }
        expect(schema.properties?.nodeId?.type).toBe('string')
        expect(schema.properties?.tags?.type).toBe('array')
        expect(schema.properties?.tags?.items?.type).toBe('string')
        expect(schema.properties?.store?.type).toBe('string')
        expect(schema.required ?? []).toContain('nodeId')
        expect(schema.required ?? []).toContain('tags')
        expect(schema.required ?? []).not.toContain('store')
        expect(schema.properties?.documentPath).toBeUndefined()
        expect(schema.properties?.path).toBeUndefined()
        expect(JSON.stringify(schema)).not.toContain('documentPath')
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ===========================================================================
// G20 — MCP/UI equivalence + atomicity + closed BatchOp
//       (§5.1, §5.5, §5.6.11, §5.6.14-15, A9)
// ===========================================================================
describe('UD7-G20 — single atomic write, equivalence, BatchOp unchanged', () => {
  it('one success = ONE journal entry + undoDepth +1; handler ≡ direct op; applyBatch rejects setDocMeta', async () => {
    const dir = freshDir()
    try {
      const direct: RagStore = createJsonRagStore({ path: join(dir, 'direct.json') })
      const viaMcp: RagStore = createJsonRagStore({ path: join(dir, 'mcp.json') })
      const d = await seedRoot(direct, { rootId: 'root', tags: ['old'], documentPath: ['p'] })
      const m = await seedRoot(viaMcp, { rootId: 'root', tags: ['old'], documentPath: ['p'] })

      const j0 = direct.journal().length
      const u0 = direct.undoDepth()
      expectOk(await setDocMeta({ store: direct }, { nodeId: d.rootId, tags: ['  x  ', 'X', 'y'] }))
      expect(direct.journal().length).toBe(j0 + 1)
      expect(direct.undoDepth()).toBe(u0 + 1)
      expect(hasNodeUpdate(direct, d.rootId)).toBe(true)

      expectOk(await handleEditTool(viaMcp, 'edit.set_doc_meta', { nodeId: m.rootId, tags: ['  x  ', 'X', 'y'] }, undefined, null))

      const nd = direct.getNode(d.rootId)!
      const nm = viaMcp.getNode(m.rootId)!
      expect(nd.tags).toEqual(nm.tags)
      expect(nd.documentPath).toEqual(nm.documentPath)
      expect(nd.type).toBe(nm.type)

      // BatchOp stays closed.
      const okBatch = await direct.applyBatch([{ op: 'putNode', node: makeNode('batch-node') }])
      expect(okBatch.ok).toBe(true)
      const bad = await direct.applyBatch([{ op: 'setDocMeta', nodeId: d.rootId, tags: ['z'] } as never])
      expect(bad.ok).toBe(false)
      if (!bad.ok) expect(bad.failedIndex).toBe(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
