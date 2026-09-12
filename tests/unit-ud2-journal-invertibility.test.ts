// tests/unit-ud2-journal-invertibility.test.ts — Unit U-D2: journal
// invertibility of document metadata (`documentPath` / `tags`)
// (docs/specs/unit-ud2-journal-invertibility.md §5.6 happy-path states 1-15
// + §5.7 fail-states 1-6).
//
// This is the TestWriter RED set — the U-D2 amendment does NOT exist yet:
//
//   - `putNodeSync`'s structural-branch condition is still
//     `typeChanged || ownedChanged` (rag-store.ts:1050), so a METADATA-ONLY
//     delta (documentPath and/or tags) records the lightweight `content` entry.
//   - The `content` entry's `before`/`after` snapshot carries only
//     `content`/`children`/`props` (rag-store.ts:1054-1055) and OMITS
//     `documentPath`/`tags`, so undo/redo silently loses the metadata (M2).
//
// The tests below are derived from the spec ALONE (§5.6/§5.7). The expected-red
// states are the metadata-delta classification + inversion states (tags-only,
// documentPath-only, content+metadata, []-normalization, normalized snapshots,
// off-root, no-quarantine, and the persist→boot→undo integration path). The
// regression pins (content-only branch, type/owned branch, batch path, boot
// validators, malformed-input fail-states) are expected green against the
// landed U-D1 store.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type BatchResult,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-ud2-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** The U-D1 metadata fields, declared independently of `src/` so the test file
 *  stays robust regardless of the source type export set. */
interface DocumentMeta {
  documentPath?: string[]
  tags?: string[]
}

function makeNode(id: string, overrides: Partial<RagNode> & DocumentMeta = {}): RagNode {
  const now = new Date().toISOString()
  const node = {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
  return node as RagNode
}

interface DiskFile {
  version: number
  nodes: Array<RagNode & { hash: string }>
  edges: unknown[]
  journal: unknown[]
  cursor: number
}

function readOnDisk(file: string): DiskFile {
  return JSON.parse(readFileSync(file, 'utf8')) as DiskFile
}

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

/** The last journal entry (the most recent write). */
function lastEntry(store: RagStore) {
  const entries = store.journal()
  return entries[entries.length - 1]
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (15)
// ===========================================================================
describe('RagStore — Unit U-D2 journal invertibility (§5.6 happy-path states)', () => {
  it('1. tags-only update → a structural node-update entry (NOT content); before/after carry the metadata (the core M2 fix)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['a', 'b'] })) // content/type/owned unchanged
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('expected structural entry')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('expected node-update op')
      expect(entry.op.before.tags).toEqual(['a'])
      expect(entry.op.after.tags).toEqual(['a', 'b'])
      // it is NOT a content entry
      expect(store.journal().some((e) => e.kind === 'content')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. documentPath-only update → a structural node-update entry; before/after carry the documentPath', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['x'] }))
      await store.putNode(makeNode('n1', { documentPath: ['x', 'y'] }))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('expected structural entry')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('expected node-update op')
      expect(entry.op.before.documentPath).toEqual(['x'])
      expect(entry.op.after.documentPath).toEqual(['x', 'y'])
      expect(store.journal().some((e) => e.kind === 'content')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. undo/redo of a tags-only update restores then re-applies the prior tags', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['a', 'b'] }))
      expect(store.getNode('n1')!.tags).toEqual(['a', 'b'])
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toEqual(['a'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toEqual(['a', 'b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. undo/redo of a documentPath-only update restores then re-applies the prior documentPath', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['x'] }))
      await store.putNode(makeNode('n1', { documentPath: ['x', 'y'] }))
      expect(store.getNode('n1')!.documentPath).toEqual(['x', 'y'])
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.documentPath).toEqual(['x'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.documentPath).toEqual(['x', 'y'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. content+metadata update → ONE structural node-update entry; undo/redo restore BOTH content and metadata', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'one', tags: ['a'] }))
      await store.putNode(makeNode('n1', { content: 'two', tags: ['b'] }))
      const entries = store.journal()
      expect(entries.filter((e) => e.kind === 'structural' && e.op.op === 'node-update')).toHaveLength(1)
      expect(entries.some((e) => e.kind === 'content')).toBe(false)
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('one')
      expect(store.getNode('n1')!.tags).toEqual(['a'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('two')
      expect(store.getNode('n1')!.tags).toEqual(['b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. content-only update (metadata unchanged) still takes the lightweight content branch; undo restores content, tags stay', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'one', tags: ['a'] }))
      await store.putNode(makeNode('n1', { content: 'two', tags: ['a'] })) // tags unchanged
      const entry = lastEntry(store)
      expect(entry.kind).toBe('content')
      if (entry.kind !== 'content') throw new Error('expected content entry')
      expect(entry.before.content).toBe('one')
      expect(entry.after.content).toBe('two')
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('one')
      expect(store.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. type-only and ownedNodeIds-only updates still take the structural branch (regression)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n2'))
      await store.putNode(makeNode('n3'))
      await store.putNode(makeNode('n1', { type: 'p' }))
      await store.putNode(makeNode('n1', { type: 'h1' })) // type-only
      let entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind === 'structural') expect(entry.op.op).toBe('node-update')

      await store.putNode(makeNode('n1', { type: 'h1', ownedNodeIds: ['n2'] }))
      await store.putNode(makeNode('n1', { type: 'h1', ownedNodeIds: ['n3'] })) // owned-only
      entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind === 'structural') expect(entry.op.op).toBe('node-update')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. applyBatch(putNode) metadata inversion lands ONE batch entry; undo restores the prior tags, redo re-applies (regression)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      expectOk(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { tags: ['b'] }) },
      ]))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('batch')
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toEqual(['a'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toEqual(['b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9a. metadata update + undo re-hashes: a fresh boot has ZERO quarantines and the restored node load-verifies', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['b'] }))
      expect(await store.undo()).not.toBeNull()
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().loadedNodes).toContain('n1')
      expect(reloaded.status().quarantined).not.toContain('n1')
      expect(reloaded.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9b. metadata update + undo + redo re-hashes: a fresh boot has ZERO quarantines and the re-applied node load-verifies', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['b'] }))
      expect(await store.undo()).not.toBeNull()
      expect(await store.redo()).not.toBeNull()
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().loadedNodes).toContain('n1')
      expect(reloaded.status().quarantined).not.toContain('n1')
      expect(reloaded.getNode('n1')!.tags).toEqual(['b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. [] normalization through the structural snapshot: tags [] → after.tags undefined; undo restores prior tags; redo returns undefined', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: [] }))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('expected structural entry')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('expected node-update op')
      expect(entry.op.after.tags).toBeUndefined()
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toEqual(['a'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. a metadata update\'s structural node-update entry carries NORMALIZED metadata in both snapshots', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: [' b ', 'a', 'b'] }))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('expected structural entry')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('expected node-update op')
      // trimmed, deduped, first-occurrence order
      expect(entry.op.after.tags).toEqual(['b', 'a'])
      expect(entry.op.before.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. metadata no-op (tags normalize equal to stored) does NOT force the structural branch', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { content: 'two', tags: [' a ', 'a'] })) // normalizes to ['a'] === stored
      const entry = lastEntry(store)
      expect(entry.kind).toBe('content')
      expect(store.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. off-root metadata inverts identically (the store has no root notion)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('some-child-node', { documentPath: ['x'], tags: ['a'] }))
      await store.putNode(makeNode('some-child-node', { documentPath: ['x', 'y'], tags: ['a', 'b'] }))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind === 'structural') expect(entry.op.op).toBe('node-update')
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('some-child-node')!.documentPath).toEqual(['x'])
      expect(store.getNode('some-child-node')!.tags).toEqual(['a'])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('some-child-node')!.documentPath).toEqual(['x', 'y'])
      expect(store.getNode('some-child-node')!.tags).toEqual(['a', 'b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. the JournalEntry/StructuralJournalOp union is unchanged: a metadata entry is a plain structural node-update', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['b'] }))
      const entry = lastEntry(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind === 'structural') {
        expect(entry.op.op).toBe('node-update')
        expect(Object.keys(entry).sort()).toEqual(['at', 'kind', 'op'])
      }
      expect(store.journal().some((e) => e.kind === 'content')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. metadata-bearing structural entry survives boot (isRagNode accept branch) and undo restores the prior metadata', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const setup: RagStore = createJsonRagStore({ path: file })
      await setup.putNode(makeNode('n1', { content: 'a', tags: ['a'] }))
      const before = setup.getNode('n1')!
      await setup.putNode(makeNode('n1', { content: 'a', tags: ['b'] }))
      const after = setup.getNode('n1')!
      // replace the journal with a hand-authored structural node-update entry
      const disk = readOnDisk(file)
      disk.journal = [
        {
          kind: 'structural',
          op: { op: 'node-update', nodeId: 'n1', before, after },
          at: new Date().toISOString(),
        },
      ]
      disk.cursor = 1
      writeFileSync(file, JSON.stringify(disk))

      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().corrupt).toBe(false)
      expect(fresh.journal()).toHaveLength(1)
      expect(fresh.getNode('n1')!.tags).toEqual(['b'])
      const undone = await fresh.undo()
      expect(undone).not.toBeNull()
      expect(fresh.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('integration: metadata-only putNode, persist, fresh boot, then undo → restored metadata', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['b'] })) // metadata-only

      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().corrupt).toBe(false)
      expect(fresh.status().loadedNodes).toContain('n1')
      expect(fresh.status().quarantined).not.toContain('n1')
      expect(fresh.getNode('n1')!.tags).toEqual(['b'])
      const undone = await fresh.undo()
      expect(undone).not.toBeNull()
      expect(fresh.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (6)
// ===========================================================================
describe('RagStore — Unit U-D2 journal invertibility (§5.7 fail-states)', () => {
  it('1. malformed metadata write is rejected BEFORE classification; no journal entry, store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('ok', { tags: ['a'] }))
      const journalBefore = store.journal().length
      await expect(store.putNode(makeNode('bad', { tags: 'x' as never })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('bad2', { documentPath: 'x' as never })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      expect(store.journal()).toHaveLength(journalBefore)
      expect(store.getNode('bad')).toBeUndefined()
      expect(store.getNode('bad2')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. malformed metadata in a batch op rolls back (ok:false, exact error, no journal pollution)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      const journalBefore = store.journal().length
      const failed = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { tags: 'x' as never }) },
      ]))
      expect(failed.error).toBe('rag applyBatch: tags required/invalid at index 0')
      expect(failed.failedIndex).toBe(0)
      expect(store.journal()).toHaveLength(journalBefore)
      expect(store.getNode('n1')!.tags).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. undo desync for a metadata node-update: a node-update whose nodeId is absent returns null and does NOT advance the cursor', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { tags: ['a'] }))
      await store.putNode(makeNode('n1', { tags: ['b'] }))
      // out-of-band removal of the record the journal references
      const disk = readOnDisk(file)
      disk.nodes = disk.nodes.filter((n) => n.id !== 'n1')
      writeFileSync(file, JSON.stringify(disk))

      const fresh: RagStore = createJsonRagStore({ path: file })
      const before = fresh.undoDepth()
      const undone = await fresh.undo()
      expect(undone).toBeNull()
      expect(fresh.undoDepth()).toBe(before)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. a persisted structural node-update entry with malformed metadata is SKIPPED at boot (isRagNode rejects it)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const before = makeNode('n1', { content: 'a' })
      const badAfter = makeNode('n1', { content: 'a', tags: 'x' as never })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          {
            kind: 'structural',
            op: { op: 'node-update', nodeId: 'n1', before, after: badAfter },
            at: new Date().toISOString(),
          },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a tampered metadata field on a persisted node is QUARANTINED at boot (hash-verified source)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'a', tags: ['a'] }))
      const disk = readOnDisk(file)
      const stored = disk.nodes.find((n) => n.id === 'n1')!
      stored.tags = ['x'] // tamper WITHOUT re-hashing
      writeFileSync(file, JSON.stringify(disk))

      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().quarantined).toContain('n1')
      expect(reloaded.status().loadedNodes).not.toContain('n1')
      expect(reloaded.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. the content branch cannot record metadata: a content-only entry snapshot has NO documentPath/tags keys; isContentSnapshot accepts it', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'one', tags: ['a'] }))
      await store.putNode(makeNode('n1', { content: 'two', tags: ['a'] })) // metadata unchanged → content branch
      const entry = lastEntry(store)
      expect(entry.kind).toBe('content')
      if (entry.kind !== 'content') throw new Error('expected content entry')
      expect('documentPath' in entry.before).toBe(false)
      expect('tags' in entry.before).toBe(false)
      expect('documentPath' in entry.after).toBe(false)
      expect('tags' in entry.after).toBe(false)
      expect(entry.before.content).toBe('one')
      expect(entry.after.content).toBe('two')
      // the persisted content entry still passes the boot validator
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })
})
