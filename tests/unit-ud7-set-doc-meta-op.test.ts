// tests/unit-ud7-set-doc-meta-op.test.ts — Unit U-D7: the tag write op
// `edit.set_doc_meta` (docs/specs/unit-ud7-set-doc-meta-op.md §5.6 happy-path
// states + §5.7 fail-states).
//
// This is the TestWriter RED set — the U-D7 amendment does NOT exist yet:
//
//   - `src/main/edit-ops.ts` does NOT export `setDocMeta` / `SetDocMetaResult`.
//   - `src/main/security.ts` TOOL_GROUPS has NO `edit.set_doc_meta` row.
//   - `src/main/mcp-server.ts` ALL_TOOLS has NO `edit.set_doc_meta` row (and no
//     `handleEditTool` case / SDK zod row).
//   - `src/shared/types.ts` RpcMethod has NO `edit.set_doc_meta` member.
//
// The tests are derived from the spec ALONE (§5.6/§5.7). The op is a pure async
// function over the RagStore INTERFACE (Unit O §5.1 — SOURCE-SWITCHABLE), so it
// is tested against the concrete JSON store (createJsonRagStore) exactly as the
// MCP handlers use it. All store mutating methods are queue-serialized and
// async, so every op call is awaited.
//
// Conventions follow tests/unit-o-edit-ops.test.ts (direct op calls, temp dirs,
// discriminated-result narrowing) and tests/unit-ms2-store-wiring.test.ts (the
// `handleEditTool` direct-call seam, byte-exact throw messages via catch+toBe,
// the in-memory SDK harness for the zod `graph` row, the per-store broadcast).
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
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
} from '../src/main/security.js'
import {
  handleEditTool,
  ProvidentMcpServer,
  type McpBackend,
  type McpServerOptions,
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
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// assertions).
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-ud7-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const at = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: at,
    updatedAt: at,
    ...overrides,
  }
}

/** Narrow a result to the success arm (asserting `ok === true`). */
function expectOk<T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + (result as { error?: string }).error)
  return result as Extract<T, { ok: true }>
}

/** Narrow a result to the failure arm (asserting `ok === false`). */
function expectFail<T extends { ok: boolean }>(result: T): Extract<T, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result as Extract<T, { ok: false }>
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

/** The async-handler form: a resolution throw REJECTS the promise. */
async function expectReject(run: Promise<unknown>, exactMessage: string): Promise<void> {
  let caught: unknown
  try {
    await run
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a rejection with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

/**
 * Seed a DOCUMENT ROOT: the root node (the TARGET of a `doc-head` edge, per
 * U-D3/U-D4) plus a section node that is the edge's SOURCE. Returns the ids.
 */
async function seedRoot(
  store: RagStore,
  opts: { rootId?: string; documentPath?: string[]; tags?: string[]; docId?: string } = {},
): Promise<{ rootId: string; sectionId: string }> {
  const rootId = opts.rootId ?? 'root'
  const sectionId = `${rootId}-sec`
  const overrides: Partial<RagNode> = { type: 'h1', content: 'Root content' }
  if (opts.documentPath !== undefined) overrides.documentPath = opts.documentPath
  if (opts.tags !== undefined) overrides.tags = opts.tags
  await store.putNode(makeNode(rootId, overrides))
  await store.putNode(makeNode(sectionId, { type: 'p', content: 'Section content' }))
  const at = new Date().toISOString()
  await store.putEdge({
    id: `e-head-${rootId}`,
    kind: 'doc-head',
    source: sectionId,
    target: rootId,
    documentIds: [opts.docId ?? 'doc'],
    createdAt: at,
    updatedAt: at,
  })
  return { rootId, sectionId }
}

/** A structural `node-update` entry for `nodeId` is present (U-D2). */
function hasNodeUpdate(store: RagStore, nodeId: string): boolean {
  return store
    .journal()
    .some((e) => e.kind === 'structural' && e.op.op === 'node-update' && e.op.nodeId === nodeId)
}

// ---------------------------------------------------------------------------
// The minimal store directory (the `store` selector resolution surface). The
// handler resolves the trailing `store` arg through `resolveStoreArg`; only the
// `store`/`name`/`defaultName` fields are read by the edit handler. The engine
// slot is unused (cast through unknown).
// ---------------------------------------------------------------------------

function entryFor(name: string, store: RagStore): RagStoreEntry {
  return { name, store, engine: null as unknown as RetrievalEngine, corrupt: false, missing: false }
}

async function makeDirectory(
  root: string,
  specs: Array<{ name: string; default?: boolean; seed?: RagNode[] }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    const store = createJsonRagStore({ path: join(root, `persist-${s.name}.json`) })
    for (const n of s.seed ?? []) await store.putNode(n)
    entries.set(s.name, entryFor(s.name, store))
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

const DEFAULT_NAME = 'main'
const OTHER_NAME = 'research-2026-09'

// ===========================================================================
// §5.6 HAPPY-PATH STATES
// ===========================================================================
describe('U-D7 setDocMeta — §5.6 happy-path states', () => {
  it('1. op signature + result type: setDocMeta is an exported async function; result is { ok, node }', async () => {
    expect(typeof setDocMeta).toBe('function')
    // ASYNC (§5.1): an async function's constructor name is AsyncFunction.
    expect(setDocMeta.constructor.name).toBe('AsyncFunction')
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      const pending = setDocMeta({ store }, { nodeId: rootId, tags: ['x'] })
      expect(typeof (pending as unknown as { then?: unknown }).then).toBe('function')
      const result = await pending
      const ok = expectOk(result as SetDocMetaResult)
      expect(ok.node.id).toBe(rootId)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2a. seam: groupForTool("edit.set_doc_meta") === "edit"', () => {
    expect(groupForTool('edit.set_doc_meta')).toBe('edit')
  })

  it('2b. seam: ProvidentMcpServer.ALL_TOOLS includes "edit.set_doc_meta"', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('edit.set_doc_meta')
  })

  it('2c. seam: RpcMethod union accepts "edit.set_doc_meta" (type-level; caught by npm run typecheck)', () => {
    const method: RpcMethod = 'edit.set_doc_meta'
    expect(method).toBe('edit.set_doc_meta')
  })

  it('2d. seam: the SDK zod row carries nodeId/tags/store (store optional) and NO path field', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
      const backend: McpBackend = { invoke: async () => ({}) }
      const server = new ProvidentMcpServer({
        backend,
        transport: 'stdio',
        gate: new SecurityGate(),
        ragStore: store,
        retrievalEngine: engine,
      } satisfies McpServerOptions)
      server.ensureServerRegistered()
      server.applyGatePatch({ groups: ['edit'] })
      const sdkServer = server.ensureServerRegistered()
      const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
      const client = new Client({ name: 'unit-ud7-zod', version: '0.1.0' })
      await Promise.all([
        client.connect(clientTransport),
        (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
      ])
      try {
        const { tools } = await client.listTools()
        const tool = tools.find((t) => t.name === 'edit.set_doc_meta')
        expect(tool, 'edit.set_doc_meta must be registered with the edit group enabled').toBeDefined()
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
        // NO path-write field (M9/Q8).
        expect(schema.properties?.documentPath).toBeUndefined()
        expect(schema.properties?.path).toBeUndefined()
      } finally {
        await client.close()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. default-off: defaultSecurityConfig().enabled === ["read","dispatch"]; toolAllowed false', () => {
    expect(defaultSecurityConfig().enabled).toEqual(['read', 'dispatch'])
    expect(toolAllowed('edit.set_doc_meta', ['read', 'dispatch'])).toBe(false)
  })

  it('4. enabled: toolAllowed with ["edit"] true; ["gnosis-edit"] alone is NOT sufficient', () => {
    expect(toolAllowed('edit.set_doc_meta', ['edit'])).toBe(true)
    expect(toolAllowed('edit.set_doc_meta', ['gnosis-edit'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['gnosis'])).toBe(false)
  })

  it('5. tags write happy: document root → ok, tags stored, structural node-update journaled, MCP emits ONE structural broadcast', async () => {
    const dir = freshDir()
    try {
      const ragDir = await makeDirectory(dir, [{ name: DEFAULT_NAME, default: true }])
      const store = ragDir.entries.get(DEFAULT_NAME)!.store
      const { rootId } = await seedRoot(store)
      const ctx: EditOpContext = { store }
      // Direct op.
      const before = store.journal().length
      const result = expectOk(await setDocMeta(ctx, { nodeId: rootId, tags: ['x', 'y'] }))
      expect(result.node.tags).toEqual(['x', 'y'])
      expect(store.getNode(rootId)!.tags).toEqual(['x', 'y'])
      expect(hasNodeUpdate(store, rootId)).toBe(true)
      expect(store.journal().length).toBe(before + 1)
      // MCP path emits exactly ONE structural broadcast.
      const cb = vi.fn()
      await handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: ['z'] }, cb, ragDir)
      expect(cb).toHaveBeenCalledTimes(1)
      expect(cb.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [rootId], edgeIds: [], store: DEFAULT_NAME })
      expect(cb.mock.calls[0][1]).toBe(DEFAULT_NAME)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. normalization is the STORE’s: [" b ","a","b","A"] → ["b","a","A"] (trim, first-occurrence dedupe, case-sensitive)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [' b ', 'a', 'b', 'A'] }))
      expect(result.node.tags).toEqual(['b', 'a', 'A'])
      expect(store.getNode(rootId)!.tags).toEqual(['b', 'a', 'A'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. [] clears tags: tags → undefined; the write still occurs (one journal entry)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [] }))
      expect(result.node.tags).toBeUndefined()
      expect(store.getNode(rootId)!.tags).toBeUndefined()
      expect(store.journal().length).toBe(before + 1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. path preserved: a root with documentPath ["a","b"] keeps it UNCHANGED', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { documentPath: ['a', 'b'] })
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['x'] }))
      expect(result.node.documentPath).toEqual(['a', 'b'])
      expect(store.getNode(rootId)!.documentPath).toEqual(['a', 'b'])
      expect(store.getNode(rootId)!.tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. existence + root gates pass in order: a valid root target writes and the returned node reflects normalized tags', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      const result = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [' t1 ', 't1', 't2'] }))
      expect(result.node.id).toBe(rootId)
      expect(result.node.tags).toEqual(['t1', 't2'])
      expect(store.getNode(rootId)!.tags).toEqual(['t1', 't2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. boundary caps inclusive: exactly 64 tags ok; a 128-char tag ok; 64 tags each preserved', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store)
      const tags64 = Array.from({ length: 64 }, (_, i) => `t${i}`)
      const r64 = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: tags64 }))
      expect(r64.node.tags).toEqual(tags64)
      const tag128 = 'a'.repeat(128)
      const r128 = expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: [tag128] }))
      expect(r128.node.tags).toEqual([tag128])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. atomicity: success reflects the FULL change, ONE new journal entry, undoDepth +1; a failed op changes neither', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId, sectionId } = await seedRoot(store, { tags: ['old'] })
      const j0 = store.journal().length
      const d0 = store.undoDepth()
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['new'] }))
      expect(store.getNode(rootId)!.tags).toEqual(['new'])
      expect(store.journal().length).toBe(j0 + 1)
      expect(store.undoDepth()).toBe(d0 + 1)
      // A failed op (non-root target) changes neither.
      const j1 = store.journal().length
      const d1 = store.undoDepth()
      expectFail(await setDocMeta({ store }, { nodeId: sectionId, tags: ['x'] }))
      expect(store.getNode(rootId)!.tags).toEqual(['new'])
      expect(store.journal().length).toBe(j1)
      expect(store.undoDepth()).toBe(d1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. journal invertibility (inherited U-D2): undo restores prior tags, redo re-applies; a fresh boot after undo/redo has the root loaded (no quarantine)', async () => {
    const dir = freshDir()
    try {
      const path = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      expectOk(await setDocMeta({ store }, { nodeId: rootId, tags: ['new'] }))
      expect(store.getNode(rootId)!.tags).toEqual(['new'])
      await store.undo()
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      // Fresh boot after UNDO: the root is loaded, not quarantined.
      const storeAfterUndo: RagStore = createJsonRagStore({ path })
      expect(storeAfterUndo.status().quarantined).toEqual([])
      expect(storeAfterUndo.status().loadedNodes).toContain(rootId)
      expect(storeAfterUndo.getNode(rootId)!.tags).toEqual(['old'])
      // Redo re-applies on the original store.
      await store.redo()
      expect(store.getNode(rootId)!.tags).toEqual(['new'])
      const storeAfterRedo: RagStore = createJsonRagStore({ path })
      expect(storeAfterRedo.status().quarantined).toEqual([])
      expect(storeAfterRedo.status().loadedNodes).toContain(rootId)
      expect(storeAfterRedo.getNode(rootId)!.tags).toEqual(['new'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. store-qualified broadcast + resolution: store:"<other>" routes the write and stamps that name; store:"main" ≡ omitted', async () => {
    const dir = freshDir()
    try {
      const ragDir = await makeDirectory(dir, [
        { name: DEFAULT_NAME, default: true },
        { name: OTHER_NAME },
      ])
      const main = ragDir.entries.get(DEFAULT_NAME)!
      const other = ragDir.entries.get(OTHER_NAME)!
      const mainRoot = await seedRoot(main.store, { rootId: 'root-main' })
      const otherRoot = await seedRoot(other.store, { rootId: 'root-other' })
      // Addressed at the non-default store.
      const cb1 = vi.fn()
      const r1 = expectOk(
        await handleEditTool(other.store, 'edit.set_doc_meta', { nodeId: otherRoot.rootId, tags: ['x'], store: OTHER_NAME }, cb1, ragDir),
      )
      expect(r1.node.tags).toEqual(['x'])
      expect(other.store.getNode(otherRoot.rootId)!.tags).toEqual(['x'])
      expect(main.store.getNode(mainRoot.rootId)!.tags).toBeUndefined()
      expect(cb1).toHaveBeenCalledTimes(1)
      expect(cb1.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [otherRoot.rootId], edgeIds: [], store: OTHER_NAME })
      // Omitted and explicit-default hit the SAME entry identically.
      const cbOmitted = vi.fn()
      const cbExplicit = vi.fn()
      const omitted = expectOk(await handleEditTool(main.store, 'edit.set_doc_meta', { nodeId: mainRoot.rootId, tags: ['a'] }, cbOmitted, ragDir))
      const explicit = expectOk(await handleEditTool(main.store, 'edit.set_doc_meta', { nodeId: mainRoot.rootId, tags: ['a'], store: DEFAULT_NAME }, cbExplicit, ragDir))
      expect(omitted.node.tags).toEqual(explicit.node.tags)
      expect(cbOmitted.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [mainRoot.rootId], edgeIds: [], store: DEFAULT_NAME })
      expect(cbExplicit.mock.calls[0][0]).toEqual({ kind: 'structural', nodeIds: [mainRoot.rootId], edgeIds: [], store: DEFAULT_NAME })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. MCP/UI equivalence: the MCP tool and a direct setDocMeta with the same params produce the same store state', async () => {
    const dir = freshDir()
    try {
      const storeA: RagStore = createJsonRagStore({ path: join(dir, 'a.json') })
      const storeB: RagStore = createJsonRagStore({ path: join(dir, 'b.json') })
      const a = await seedRoot(storeA, { rootId: 'root', tags: ['old'], documentPath: ['p'] })
      const b = await seedRoot(storeB, { rootId: 'root', tags: ['old'], documentPath: ['p'] })
      expectOk(await setDocMeta({ store: storeA }, { nodeId: a.rootId, tags: [' b ', 'a', 'b', 'A'] }))
      expectOk(
        await handleEditTool(storeB, 'edit.set_doc_meta', { nodeId: b.rootId, tags: [' b ', 'a', 'b', 'A'] }, undefined, null),
      )
      const na = storeA.getNode(a.rootId)!
      const nb = storeB.getNode(b.rootId)!
      expect(na.tags).toEqual(nb.tags)
      expect(na.documentPath).toEqual(nb.documentPath)
      expect(na.type).toBe(nb.type)
      expect(na.content).toBe(nb.content)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. BatchOp unchanged: applyBatch still accepts the existing union and rejects a setDocMeta op', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // The existing union still applies.
      const okBatch = await store.applyBatch([{ op: 'putNode', node: makeNode('n1') }])
      expect(okBatch.ok).toBe(true)
      // A setDocMeta op is NOT a BatchOp member and is rejected.
      const bad = await store.applyBatch([
        { op: 'setDocMeta', nodeId: 'n1', tags: ['x'] } as never,
      ])
      expect(bad.ok).toBe(false)
      if (!bad.ok) expect(bad.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES
// ===========================================================================
describe('U-D7 setDocMeta — §5.7 fail-states', () => {
  it('1. non-array tags (object/string/number/null/undefined) → "tags must be a string array"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const ctx: EditOpContext = { store }
      const before = store.journal().length
      for (const bad of [{}, 'x', 42, null, undefined, true]) {
        const result = expectFail(await setDocMeta(ctx, { nodeId: rootId, tags: bad as never }))
        expect(result.error).toBe('edit.set_doc_meta: tags must be a string array')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. non-string member → "tags must be a string array"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const ctx: EditOpContext = { store }
      const before = store.journal().length
      for (const bad of [['a', 1], [null], [{}], ['a', true]]) {
        const result = expectFail(await setDocMeta(ctx, { nodeId: rootId, tags: bad as never }))
        expect(result.error).toBe('edit.set_doc_meta: tags must be a string array')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. count over the cap (65 tags) → "too many tags (max 64)"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      const result = expectFail(
        await setDocMeta({ store }, { nodeId: rootId, tags: Array.from({ length: 65 }, (_, i) => `t${i}`) }),
      )
      expect(result.error).toBe('edit.set_doc_meta: too many tags (max 64)')
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. per-tag length over the cap (129 chars) → "tag too long (max 128)"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      const result = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: ['a'.repeat(129)] }))
      expect(result.error).toBe('edit.set_doc_meta: tag too long (max 128)')
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. control character (\\u0000 / \\n / \\t / \\u007F) → "tags must not contain control characters"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      for (const ctl of ['\u0000', '\n', '\t', '\u007F']) {
        const result = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: [`a${ctl}b`] }))
        expect(result.error).toBe('edit.set_doc_meta: tags must not contain control characters')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty or whitespace-only member → "tags must be non-empty strings"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      for (const bad of [[''], ['   '], ['a', '']]) {
        const result = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: bad }))
        expect(result.error).toBe('edit.set_doc_meta: tags must be non-empty strings')
      }
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. missing node → "node not found"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRoot(store, { tags: ['old'] })
      const before = store.journal().length
      const result = expectFail(await setDocMeta({ store }, { nodeId: 'ghost', tags: ['x'] }))
      expect(result.error).toBe('edit.set_doc_meta: node not found')
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. non-root target (section / hand-created div / doc-end source) → "target is not a document root"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId, sectionId } = await seedRoot(store, { tags: ['old'] })
      await store.putNode(makeNode('div-1', { type: 'div' }))
      // A doc-end source participant (the SOURCE of a doc-end edge is not a root).
      await store.putNode(makeNode('end-src'))
      await store.putNode(makeNode('end-tgt'))
      const at = new Date().toISOString()
      await store.putEdge({ id: 'e-end', kind: 'doc-end', source: 'end-src', target: 'end-tgt', createdAt: at, updatedAt: at })
      const before = store.journal().length
      for (const nodeId of [sectionId, 'div-1', 'end-src']) {
        const result = expectFail(await setDocMeta({ store }, { nodeId, tags: ['x'] }))
        expect(result.error).toBe('edit.set_doc_meta: target is not a document root')
      }
      // The root is untouched by the failed attempts.
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(store.journal().length).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. path-write attempt: a raw { nodeId, tags, documentPath } handler call succeeds normally and leaves documentPath UNCHANGED', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { documentPath: ['a', 'b'], tags: ['old'] })
      const cb = vi.fn()
      const result = expectOk(
        await handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: ['x'], documentPath: ['impossible'] }, cb, null),
      )
      expect(result.node.tags).toEqual(['x'])
      expect(store.getNode(rootId)!.tags).toEqual(['x'])
      expect(store.getNode(rootId)!.documentPath).toEqual(['a', 'b'])
      expect(cb).toHaveBeenCalledTimes(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. unknown store (M2) → throws exactly "edit.set_doc_meta: unknown store \'nope\'"; no write', async () => {
    const dir = freshDir()
    try {
      const ragDir = await makeDirectory(dir, [{ name: DEFAULT_NAME, default: true }])
      const store = ragDir.entries.get(DEFAULT_NAME)!.store
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      await expectReject(
        handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: ['x'], store: 'nope' }, vi.fn(), ragDir),
        "edit.set_doc_meta: unknown store 'nope'",
      )
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. malformed store (M1) → throws exactly "edit.set_doc_meta: store must be a non-empty string"; no write', async () => {
    const dir = freshDir()
    try {
      const ragDir = await makeDirectory(dir, [{ name: DEFAULT_NAME, default: true }])
      const store = ragDir.entries.get(DEFAULT_NAME)!.store
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      for (const raw of [5, true, {}, '']) {
        await expectReject(
          handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: ['x'], store: raw }, vi.fn(), ragDir),
          'edit.set_doc_meta: store must be a non-empty string',
        )
      }
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. missing/empty nodeId → handleEditTool throws exactly "edit.set_doc_meta: nodeId required"; the op is not called', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRoot(store, { tags: ['old'] })
      await expectReject(
        handleEditTool(store, 'edit.set_doc_meta', {}, vi.fn(), null),
        'edit.set_doc_meta: nodeId required',
      )
      await expectReject(
        handleEditTool(store, 'edit.set_doc_meta', { nodeId: '' }, vi.fn(), null),
        'edit.set_doc_meta: nodeId required',
      )
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. group off / unauthorized: not registered + toolAllowed false; editing is never a code-group op; renderer seam untouched', () => {
    expect(groupForTool('edit.set_doc_meta')).toBe('edit')
    expect(toolAllowed('edit.set_doc_meta', ['read', 'dispatch'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['code'])).toBe(false)
    expect(toolAllowed('edit.set_doc_meta', ['gnosis-edit'])).toBe(false)
    // The renderer seam is the NEGATIVE contract: no renderer-graph mutation
    // for a main-handled edit tool (Unit J §5.2 invariant (f)). renderer.ts is
    // not node-importable (DOM), so it is source-pinned.
    const src = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    expect(src).not.toContain('edit.set_doc_meta')
  })

  it('14. malformed tags cannot bypass validation: a direct handler call with a raw tags:123 returns the documented result (never throws)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId } = await seedRoot(store, { tags: ['old'] })
      const cb = vi.fn()
      const result = expectFail(
        await handleEditTool(store, 'edit.set_doc_meta', { nodeId: rootId, tags: 123 }, cb, null),
      )
      expect(result.error).toBe('edit.set_doc_meta: tags must be a string array')
      expect(store.getNode(rootId)!.tags).toEqual(['old'])
      expect(cb).not.toHaveBeenCalled()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. a failed op lands ZERO journal entries and does NOT broadcast', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { rootId, sectionId } = await seedRoot(store, { tags: ['old'] })
      const cb = vi.fn()
      const before = store.journal().length
      const depth = store.undoDepth()
      // A domain failure via the MCP handler (non-root target).
      const result = expectFail(
        await handleEditTool(store, 'edit.set_doc_meta', { nodeId: sectionId, tags: ['x'] }, cb, null),
      )
      expect(result.error).toBe('edit.set_doc_meta: target is not a document root')
      expect(store.journal().length).toBe(before)
      expect(store.undoDepth()).toBe(depth)
      expect(cb).not.toHaveBeenCalled()
      // And directly for a malformed tags failure.
      const result2 = expectFail(await setDocMeta({ store }, { nodeId: rootId, tags: [''] }))
      expect(result2.error).toBe('edit.set_doc_meta: tags must be non-empty strings')
      expect(store.journal().length).toBe(before)
      expect(cb).not.toHaveBeenCalled()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
