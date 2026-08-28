// tests/unit-n-batch-atomicity.test.ts — Unit N: batch atomicity (a real
// transaction on the `RagStore`) — docs/specs/unit-n-batch-atomicity.md
// §5.7 happy-path states (14) + §5.8 fail-states (11).
//
// This is the TestWriter RED set — the Unit N amendment does NOT exist yet:
//
//   - `src/main/rag-store.ts` `RagStore` does NOT have the `applyBatch(ops)`
//     method; `BatchOp`/`BatchOpResult`/`BatchResult` are NOT exported.
//   - The `JournalEntry` union does NOT have a `batch` kind; there is no
//     `isValidBatchOp` boot validator; `isValidJournalEntry` does NOT accept a
//     `batch` entry.
//   - There is no batch-application/rollback path (all-or-nothing, snapshot
//     restore on failure), no single-persist, no `inQueue` re-entrant
//     `applyBatchSync`.
//
// The tests are derived from the spec ALONE (§5.7/§5.8). The `nodeHash` helper
// replicates the store's `nodeSource` field order (`id, type, content,
// children, props, ownedNodeIds, createdAt, updatedAt`) so persisted-file
// fixtures (quarantined-node / malformed-batch-entry boot) can be authored with
// a hash the store will re-derive.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
  type BatchOpResult,
  type BatchResult,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-n-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
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

function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
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

/** The store's `nodeSource` field order — `children` after `content`, before
 *  `props` (Unit M §5.2). Used to author persisted-file fixtures. */
function nodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    children: n.children, props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function nodeHash(n: RagNode): string { return sha256(nodeSource(n)) }

/** Narrow a `BatchResult` to the success arm (asserting `ok === true`). */
function expectOk(result: BatchResult): Extract<BatchResult, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + result.error)
  return result
}

/** Narrow a `BatchResult` to the failure arm (asserting `ok === false`). */
function expectFail(result: BatchResult): Extract<BatchResult, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result
}

// ===========================================================================
// §5.7 HAPPY-PATH STATES (14)
// ===========================================================================
describe('RagStore — Unit N batch atomicity (§5.7 happy-path states)', () => {
  it('1. empty batch: applyBatch([]) → { ok: true, results: [] }; no journal entry, no persist; undoDepth/redoDepth unchanged', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const result = expectOk(await store.applyBatch([]))
      expect(result.results).toEqual([])
      expect(store.journal()).toEqual([])
      expect(store.undoDepth()).toBe(0)
      expect(store.redoDepth()).toBe(0)
      expect(existsSync(file)).toBe(false) // no persist
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. single-op batch (putNode create): ok; getNode returns the node; listNodes has 1; undoDepth is 1; file written atomically', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const node = makeNode('n1')
      const result = expectOk(await store.applyBatch([{ op: 'putNode', node }]))
      expect(result.results).toHaveLength(1)
      expect(result.results[0]).toMatchObject({ op: 'putNode', node: { id: 'n1' } })
      expect(store.getNode('n1')).toBeDefined()
      expect(store.listNodes()).toHaveLength(1)
      expect(store.undoDepth()).toBe(1)
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. multi-op batch (create node + edge): both present; lands as ONE batch journal entry (not two); undoDepth is 1', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectOk(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1') },
        { op: 'putNode', node: makeNode('n2') },
        { op: 'putEdge', edge: makeEdge('e1', 'n1', 'n2') },
      ]))
      expect(result.results).toHaveLength(3)
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
      const entries = store.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
      expect(store.undoDepth()).toBe(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. batch with a node update: node replaced; updatedAt refreshed; lands as ONE batch entry (inverse captures the before-state)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'before' }))
      const before = store.getNode('n1')!.updatedAt
      const result = expectOk(await store.applyBatch([{ op: 'putNode', node: makeNode('n1', { content: 'after' }) }]))
      expect(store.getNode('n1')!.content).toBe('after')
      expect(store.getNode('n1')!.updatedAt).not.toBe(before)
      const batchEntries = store.journal().filter((e) => e.kind === 'batch')
      expect(batchEntries).toHaveLength(1)
      if (batchEntries[0].kind === 'batch') {
        expect(batchEntries[0].inverse).toHaveLength(1)
        expect(batchEntries[0].inverse[0].op).toBe('putNode')
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. batch with a removeNode: removed:true; getNode undefined; cascade removes edges referencing n1', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const result = expectOk(await store.applyBatch([{ op: 'removeNode', id: 'n1' }]))
      expect(result.results).toEqual([{ op: 'removeNode', removed: true }])
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getEdge('e1')).toBeUndefined() // cascade
      expect(store.getNode('n2')).toBeDefined() // unrelated node survives
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. batch with a removeNode of a nonexistent id: removed:false (a no-op, does NOT fail the batch)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectOk(await store.applyBatch([{ op: 'removeNode', id: 'ghost' }]))
      expect(result.results).toEqual([{ op: 'removeNode', removed: false }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. batch with a removeEdge of a nonexistent id: removed:false (a no-op, does NOT fail the batch)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectOk(await store.applyBatch([{ op: 'removeEdge', id: 'ghost' }]))
      expect(result.results).toEqual([{ op: 'removeEdge', removed: false }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. batch undo/redo (whole batch as a unit): undo restores pre-batch (n1+n2+e1 gone); redo re-applies (all back); depths move by 1', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.applyBatch([
        { op: 'putNode', node: makeNode('n1') },
        { op: 'putNode', node: makeNode('n2') },
        { op: 'putEdge', edge: makeEdge('e1', 'n1', 'n2') },
      ])
      expect(store.undoDepth()).toBe(1)
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getNode('n2')).toBeUndefined()
      expect(store.getEdge('e1')).toBeUndefined()
      expect(store.redoDepth()).toBe(1)
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. batch undo/redo (node update): undo restores the prior content; redo re-applies the new content', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'before' }))
      await store.applyBatch([{ op: 'putNode', node: makeNode('n1', { content: 'after' }) }])
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('before')
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('after')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. batch with a children-bearing node: stored with children intact; hash covers children; lands as ONE batch entry', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const node = makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] })
      const result = expectOk(await store.applyBatch([{ op: 'putNode', node }]))
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'bold' }])
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const stored = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      expect(stored.hash).toBe(nodeHash(stored))
      expect(store.journal().filter((e) => e.kind === 'batch')).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. batch serialization (single-writer): two concurrent applyBatch calls run in FIFO; the second observes the first effect', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const p1 = store.applyBatch([{ op: 'putNode', node: makeNode('n1') }])
      const p2 = store.applyBatch([
        { op: 'putNode', node: makeNode('n2') },
        { op: 'putEdge', edge: makeEdge('e1', 'n1', 'n2') },
      ])
      const [r1, r2] = await Promise.all([p1, p2])
      expectOk(r1)
      expectOk(r2)
      // the second batch's edge references n1 created by the first → serialized FIFO
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.getEdge('e1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. batch re-entrancy (no deadlock): applyBatch called from inside the queue completes (inQueue pattern)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await store.enqueue(async () => {
        return store.applyBatch([{ op: 'putNode', node: makeNode('n1') }])
      })
      expectOk(result)
      expect(store.getNode('n1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. batch round-trip (persist → boot): fresh store boots clean; records load; single batch entry loads; undo restores pre-batch', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const storeA: RagStore = createJsonRagStore({ path: file })
      await storeA.applyBatch([
        { op: 'putNode', node: makeNode('n1') },
        { op: 'putNode', node: makeNode('n2') },
        { op: 'putEdge', edge: makeEdge('e1', 'n1', 'n2') },
      ])
      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().corrupt).toBe(false)
      expect(storeB.getNode('n1')).toBeDefined()
      expect(storeB.getNode('n2')).toBeDefined()
      expect(storeB.getEdge('e1')).toBeDefined()
      const entries = storeB.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
      const undone = await storeB.undo()
      expect(undone).not.toBeNull()
      expect(storeB.getNode('n1')).toBeUndefined()
      expect(storeB.getNode('n2')).toBeUndefined()
      expect(storeB.getEdge('e1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. batch journal cap: maxJournalLength 3; 4 batches → oldest batch entry dropped (a batch counts as ONE entry)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json'), maxJournalLength: 3 })
      for (let i = 0; i < 4; i++) {
        expectOk(await store.applyBatch([{ op: 'putNode', node: makeNode(`n${i}`) }]))
      }
      const entries = store.journal()
      expect(entries).toHaveLength(3)
      expect(entries.every((e) => e.kind === 'batch')).toBe(true)
      expect(store.undoDepth()).toBe(3)
      // the journal cap only drops undo history — the node still exists
      expect(store.getNode('n0')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.8 FAIL-STATES (11)
// ===========================================================================
describe('RagStore — Unit N batch atomicity (§5.8 fail-states)', () => {
  it('1. invalid op kind: applyBatch([{ op: "bogus" }]) → ok:false, error "rag applyBatch: invalid op at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([{ op: 'bogus' } as never]))
      expect(result.error).toBe('rag applyBatch: invalid op at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toEqual([])
      expect(store.undoDepth()).toBe(0)
      expect(store.redoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. malformed op payload (putNode): ok:false, error "rag applyBatch: <field> required/invalid at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([{ op: 'putNode', node: makeNode('n1', { type: 'bogus' as never }) }]))
      expect(result.error).toMatch(/^rag applyBatch: .* required\/invalid at index 0$/)
      expect(result.failedIndex).toBe(0)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. malformed op payload (putEdge): ok:false, error "rag applyBatch: <field> required/invalid at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = expectFail(await store.applyBatch([{ op: 'putEdge', edge: makeEdge('e1', '', 'n2') }]))
      expect(result.error).toMatch(/^rag applyBatch: .* required\/invalid at index 0$/)
      expect(result.failedIndex).toBe(0)
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. putEdge referencing a nonexistent node: ok:false, error "rag applyBatch: source/target node not found or quarantined at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(await store.applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') }]))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. putEdge referencing a quarantined node: ok:false, error "rag applyBatch: source/target node not found or quarantined at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const storeA: RagStore = createJsonRagStore({ path: file })
      await storeA.putNode(makeNode('n1'))
      await storeA.putNode(makeNode('q1'))
      // tamper q1 on disk without updating its hash → quarantined at boot
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const q1 = onDisk.nodes.find((n: RagNode) => n.id === 'q1')
      q1.content = 'tampered'
      writeFileSync(file, JSON.stringify(onDisk))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toContain('q1')
      const result = expectFail(await store.applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'q1') }]))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a batch that fails partway: op 3 fails → ok:false, failedIndex 2; store ROLLED BACK (n1/n2 NOT present); journal unchanged; undoDepth/redoDepth unchanged; on-disk unchanged', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const result = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1') },
        { op: 'putNode', node: makeNode('n2') },
        { op: 'putEdge', edge: makeEdge('e1', 'n1', 'ghost') },
      ]))
      expect(result.error).toBe('rag applyBatch: source/target node not found or quarantined at index 2')
      expect(result.failedIndex).toBe(2)
      // rolled back: ops 1-2 undone
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getNode('n2')).toBeUndefined()
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toEqual([])
      expect(store.undoDepth()).toBe(0)
      expect(store.redoDepth()).toBe(0)
      // no persist on failure → the file was never written
      expect(existsSync(file)).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. a batch containing a forward-looking rich-text op (setProps/setSubtree/setType): ok:false, error "rag applyBatch: op not supported: <op> at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r1 = expectFail(await store.applyBatch([{ op: 'setProps', nodeId: 'n1', props: { a: 1 } }]))
      expect(r1.error).toBe('rag applyBatch: op not supported: setProps at index 0')
      expect(r1.failedIndex).toBe(0)
      const r2 = expectFail(await store.applyBatch([{ op: 'setSubtree', nodeId: 'n1', children: [] }]))
      expect(r2.error).toBe('rag applyBatch: op not supported: setSubtree at index 0')
      const r3 = expectFail(await store.applyBatch([{ op: 'setType', nodeId: 'n1', type: 'p' }]))
      expect(r3.error).toBe('rag applyBatch: op not supported: setType at index 0')
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. a batch whose putNode writes a malformed children array: ok:false, error "rag applyBatch: children required/invalid at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([{ op: 'putNode', node: makeNode('n1', { children: [{ type: 'span', content: 'x' } as never] }) }]))
      expect(result.error).toBe('rag applyBatch: children required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. a batch whose putEdge writes a self-referential edge: ok:false, error "rag applyBatch: source required/invalid at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(await store.applyBatch([{ op: 'putEdge', edge: makeEdge('e1', 'n1', 'n1') }]))
      expect(result.error).toBe('rag applyBatch: source required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. a batch whose putNode writes a dangerous-key props: ok:false, error "rag applyBatch: props required/invalid at index 0", failedIndex 0; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([{ op: 'putNode', node: makeNode('n1', { props: { __proto__: {} } as never }) }]))
      expect(result.error).toBe('rag applyBatch: props required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. a persisted batch journal entry with a malformed op at boot: SKIPPED (isValidBatchOp rejects it); a valid batch entry in the same file IS loaded; status().corrupt === false', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const validNode = makeNode('n1')
      const fileData = {
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          // a VALID batch entry — must load (validated at boot)
          { kind: 'batch', ops: [{ op: 'putNode', node: validNode }], inverse: [], at: new Date().toISOString() },
          // a MALFORMED batch entry — must be SKIPPED (isValidBatchOp rejects it)
          { kind: 'batch', ops: [{ op: 'bogus' }], inverse: [], at: new Date().toISOString() },
        ],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      const entries = store.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
