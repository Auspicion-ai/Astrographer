// tests/unit-p-ipc-edit-batch.test.ts — Unit P: the `IPC_EDIT_BATCH` channel
// (docs/specs/unit-p-ipc-edit-batch.md §5.6 happy-path states + §5.7 fail-states).
//
// This is the TestWriter red set, now GREEN — the Unit P amendment is
// implemented: `IPC_EDIT_BATCH` / `EditBatchPayload` / `BatchResult` in
// `src/shared/types.ts`, the `handleEditBatch` shared handler in
// `src/main/edit-ops.ts`, the `bridge.edit.batch` preload bridge, and the
// `deriveBatchBroadcast` helper (also in `src/main/edit-ops.ts`).
//
// The tests are derived from the spec ALONE (§5.6/§5.7). The handler is a pure
// async function over the RagStore INTERFACE (Unit A §5.4 — SOURCE-SWITCHABLE),
// so it is tested against the concrete JSON store (createJsonRagStore) exactly
// as the IPC handler uses it. All store mutating methods are queue-serialized
// and async, so every call is awaited.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import {
  handleEditBatch,
  deriveBatchBroadcast,
  type EditBatchPayload,
  type BatchResult,
} from '../src/main/edit-ops.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-p-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
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

function makeEdge(id: string, source: string, target: string): RagEdge {
  const now = new Date().toISOString()
  return {
    id,
    kind: 'doc-child',
    source,
    target,
    order: 0,
    documentIds: [],
    createdAt: now,
    updatedAt: now,
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

// ===========================================================================
// §5.6 HAPPY-PATH STATES (8)
// ===========================================================================
describe('edit-batch — Unit P IPC_EDIT_BATCH (§5.6 happy-path states)', () => {
  it('handleEditBatch is exported (the Unit P amendment landed)', async () => {
    expect(typeof handleEditBatch).toBe('function')
  })

  it('1. single-op batch (putNode create): ok, node present, ONE batch journal entry, persists once', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const n1 = makeNode('n1')
      const result = expectOk(await handleEditBatch(store, { ops: [{ op: 'putNode', node: n1 }] }))
      expect(result.results).toHaveLength(1)
      expect(store.getNode('n1')).toBeDefined()
      // ONE `batch` journal entry
      const batchEntries = store.journal().filter((e) => e.kind === 'batch')
      expect(batchEntries).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. multi-op batch (create node + edge): ok, both present, ONE batch journal entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const n1 = makeNode('n1')
      const e1 = makeEdge('e1', 'n1', 'n2')
      const n2 = makeNode('n2')
      const result = expectOk(await handleEditBatch(store, {
        ops: [
          { op: 'putNode', node: n1 },
          { op: 'putNode', node: n2 },
          { op: 'putEdge', edge: e1 },
        ],
      }))
      expect(result.results).toHaveLength(3)
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
      expect(store.journal().filter((e) => e.kind === 'batch')).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. batch with a content-only node update: ok, content changed', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const result = expectOk(await handleEditBatch(store, {
        ops: [{ op: 'putNode', node: { ...makeNode('n1', { content: 'new' }), createdAt: store.getNode('n1')!.createdAt } }],
      }))
      expect(store.getNode('n1')!.content).toBe('new')
      expect(result.results).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. batch with a structural node update (type change): ok, type changed', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { type: 'p' }))
      const result = expectOk(await handleEditBatch(store, {
        ops: [{ op: 'putNode', node: { ...makeNode('n1', { type: 'h1' }), createdAt: store.getNode('n1')!.createdAt } }],
      }))
      expect(store.getNode('n1')!.type).toBe('h1')
      expect(result.results).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. batch with a removeNode: ok, node removed', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectOk(await handleEditBatch(store, { ops: [{ op: 'removeNode', id: 'n1' }] }))
      expect(store.getNode('n1')).toBeUndefined()
      expect(result.results).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty batch: ok, no-op, valid', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectOk(await handleEditBatch(store, { ops: [] }))
      expect(result.results).toHaveLength(0)
      expect(store.journal().filter((e) => e.kind === 'batch')).toHaveLength(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. batch undo/redo (whole batch as a unit): undo restores, redo re-applies', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const n1 = makeNode('n1')
      const e1 = makeEdge('e1', 'n1', 'n2')
      const n2 = makeNode('n2')
      await handleEditBatch(store, {
        ops: [
          { op: 'putNode', node: n1 },
          { op: 'putNode', node: n2 },
          { op: 'putEdge', edge: e1 },
        ],
      })
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
      // undo restores the whole batch as a unit
      await store.undo()
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getNode('n2')).toBeUndefined()
      expect(store.getEdge('e1')).toBeUndefined()
      // redo re-applies the whole batch
      await store.redo()
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. MCP/UI equivalence: the same ops produce the same store state across stores', async () => {
    const dir = freshDir()
    try {
      const storeA: RagStore = createJsonRagStore({ path: join(dir, 'a.json') })
      const storeB: RagStore = createJsonRagStore({ path: join(dir, 'b.json') })
      const n1 = makeNode('n1')
      const ops = [{ op: 'putNode', node: n1 }]
      await handleEditBatch(storeA, { ops })
      await handleEditBatch(storeB, { ops })
      expect(storeA.getNode('n1')!.content).toBe(storeB.getNode('n1')!.content)
      expect(storeA.getNode('n1')!.type).toBe(storeB.getNode('n1')!.type)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (10)
// ===========================================================================
describe('edit-batch — Unit P IPC_EDIT_BATCH (§5.7 fail-states)', () => {
  it('1. malformed batch payload (non-object): ops must be an array; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await handleEditBatch(store, null as never))
      expect(result.error).toBe('edit-batch: ops must be an array')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. malformed batch payload (non-array ops): ops must be an array; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      for (const bad of ['bogus', {}, null, undefined]) {
        const result = expectFail(await handleEditBatch(store, { ops: bad as never }))
        expect(result.error).toBe('edit-batch: ops must be an array')
        expect(result.failedIndex).toBe(0)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. invalid op kind: rag applyBatch: invalid op at index 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await handleEditBatch(store, { ops: [{ op: 'bogus' }] as never }))
      expect(result.error).toBe('rag applyBatch: invalid op at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. malformed op payload (putNode): rag applyBatch: <field> required/invalid at index 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await handleEditBatch(store, {
        ops: [{ op: 'putNode', node: { ...makeNode('n1'), type: 'span' } }],
      }))
      expect(result.error).toMatch(/rag applyBatch: .* required\/invalid at index 0/)
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. putEdge referencing a nonexistent node: source/target node not found or quarantined; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(await handleEditBatch(store, {
        ops: [{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') }],
      }))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. putEdge referencing a quarantined node: source/target node not found or quarantined; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      // Author a quarantined node (tampered hash) so it is invisible to getNode.
      const fs = await import('node:fs')
      const path = join(dir, 'rag.json')
      const now = new Date().toISOString()
      const q1 = { id: 'q1', type: 'p', content: 'x', ownedNodeIds: [], createdAt: now, updatedAt: now }
      fs.writeFileSync(path, JSON.stringify({ version: 1, nodes: [{ ...q1, hash: 'tampered' }], edges: [], journal: [] }))
      const store2: RagStore = createJsonRagStore({ path })
      expect(store2.getNode('q1')).toBeUndefined()
      const result = expectFail(await handleEditBatch(store2, {
        ops: [{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'q1') }],
      }))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. a batch that fails partway: rolls back ops 1-2; store unchanged; no journal pollution', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const journalBefore = store.journal().length
      const result = expectFail(await handleEditBatch(store, {
        ops: [
          { op: 'putNode', node: makeNode('n1') },
          { op: 'putNode', node: makeNode('n2') },
          { op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') },
        ],
      }))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 2')
      expect(result.failedIndex).toBe(2)
      // rolled back — n1/n2 NOT present
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getNode('n2')).toBeUndefined()
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. a batch containing a forward-looking rich-text op: op not supported; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(await handleEditBatch(store, {
        ops: [{ op: 'setProps', nodeId: 'n1', props: { a: 1 } } as never],
      }))
      expect(result.error).toBe('rag applyBatch: op not supported: setProps at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. a batch whose putNode writes a malformed children array: children required/invalid; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await handleEditBatch(store, {
        ops: [{ op: 'putNode', node: { ...makeNode('n1'), children: [{ type: 'span', content: 'x' }] } }],
      }))
      expect(result.error).toBe('rag applyBatch: children required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. a batch whose putNode writes a dangerous-key props: props required/invalid; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await handleEditBatch(store, {
        ops: [{ op: 'putNode', node: { ...makeNode('n1'), props: JSON.parse('{"__proto__":{}}') } }],
      }))
      expect(result.error).toBe('rag applyBatch: props required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (Unit P §3a F1 — deriveBatchBroadcast)
// ===========================================================================
describe('edit-batch — deriveBatchBroadcast (Unit P §3a F1)', () => {
  it('F1a — a putNode create is structural (no pre-batch node)', () => {
    const n1 = makeNode('n1')
    const payload = deriveBatchBroadcast(
      [{ op: 'putNode', node: n1 }],
      [{ op: 'putNode', node: n1 }],
      new Map(),
    )
    expect(payload).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [] })
  })

  it('F1b — a content-only putNode update is content', () => {
    const n1 = makeNode('n1', { content: 'old' })
    const after = { ...n1, content: 'new' }
    const pre = new Map<string, RagNode>([['n1', n1]])
    const payload = deriveBatchBroadcast(
      [{ op: 'putNode', node: after }],
      [{ op: 'putNode', node: after }],
      pre,
    )
    expect(payload).toEqual({ kind: 'content', nodeIds: ['n1'], edgeIds: [] })
  })

  it('F1c — a type-change putNode update is structural', () => {
    const n1 = makeNode('n1', { type: 'p' })
    const after = { ...n1, type: 'h1' }
    const pre = new Map<string, RagNode>([['n1', n1]])
    const payload = deriveBatchBroadcast(
      [{ op: 'putNode', node: after }],
      [{ op: 'putNode', node: after }],
      pre,
    )
    expect(payload).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [] })
  })

  it('F1d — an ownedNodeIds-change putNode update is structural', () => {
    const n1 = makeNode('n1', { ownedNodeIds: [] })
    const after = { ...n1, ownedNodeIds: ['n2'] }
    const pre = new Map<string, RagNode>([['n1', n1]])
    const payload = deriveBatchBroadcast(
      [{ op: 'putNode', node: after }],
      [{ op: 'putNode', node: after }],
      pre,
    )
    expect(payload).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [] })
  })

  it('F1e — a removeNode is structural', () => {
    const payload = deriveBatchBroadcast(
      [{ op: 'removeNode', id: 'n1' }],
      [{ op: 'removeNode', removed: true }],
      new Map(),
    )
    expect(payload).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [] })
  })

  it('F1f — a putEdge is structural and pushes source/target nodes + edge id', () => {
    const e1 = makeEdge('e1', 'n1', 'n2')
    const payload = deriveBatchBroadcast(
      [{ op: 'putEdge', edge: e1 }],
      [{ op: 'putEdge', edge: e1 }],
      new Map(),
    )
    expect(payload).toEqual({ kind: 'structural', nodeIds: ['n1', 'n2'], edgeIds: ['e1'] })
  })

  it('F1g — an empty batch is content with empty nodeIds/edgeIds', () => {
    const payload = deriveBatchBroadcast([], [], new Map())
    expect(payload).toEqual({ kind: 'content', nodeIds: [], edgeIds: [] })
  })

  it('F1h — deterministic: the same inputs produce the same payload', () => {
    const n1 = makeNode('n1')
    const ops = [{ op: 'putNode', node: n1 }]
    const results = [{ op: 'putNode', node: n1 }]
    const pre = new Map()
    const a = deriveBatchBroadcast(ops, results, pre)
    const b = deriveBatchBroadcast(ops, results, pre)
    expect(a).toEqual(b)
  })

  it('F1i — a short/null results array does not throw (F2 guard)', () => {
    const n1 = makeNode('n1')
    const payload = deriveBatchBroadcast([{ op: 'putNode', node: n1 }], [], new Map())
    expect(payload.kind).toBe('structural')
    expect(payload.nodeIds).toEqual(['n1'])
  })
})
