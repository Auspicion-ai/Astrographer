// tests/blind-unit-ud2-journal-invertibility-greens.test.ts — BLIND green
// scenario set for Unit U-D2 (RCA-4). Derived from
// docs/specs/unit-ud2-journal-invertibility.md §5.6 / §5.7 / §3a ALONE (no
// implementation read). Independent node ids / metadata values from the
// TestWriter file.
//
// Each scenario is tagged Bn and maps to a spec clause:
//   B1  §5.6(1)  tags-only delta → structural node-update, snapshots carry tags
//   B2  §5.6(3)  undo/redo restores tags
//   B3  §5.6(2,4) documentPath-only → structural node-update; undo/redo restores
//   B4  §5.6(5)  content+metadata → ONE structural entry; undo/redo both
//   B5  §5.6(6)  content-only stays content; snapshot metadata-free; boots (§5.7.6)
//   B6  §5.6(10) tags [] normalizes/classifies; after.tags undefined; undo/redo
//   B7  §5.6(13) metadata no-op stays content; and tags[]-vs-absent (§3a A9)
//   B8  §5.6(14) off-root metadata inverts
//   B9  §5.6(8)  applyBatch(putNode) metadata undo/redo
//   B10 §5.6(11) persisted metadata structural entry survives boot (isRagNode accept)
//   B11 §5.6(9)  undo/redo re-hash → fresh boot zero quarantines
//   B12 §5.6(1,2) documentPath+tags together → one structural entry
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type BatchResult,
} from '../src/main/rag-store.js'

// The U-D1 additive metadata surface (declared locally so the blind set does
// not depend on the source type export set).
interface DocMeta {
  documentPath?: string[]
  tags?: string[]
}

function newNode(id: string, overrides: Partial<RagNode> & DocMeta = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `body-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as RagNode
}

function tempStorePath(): { dir: string; path: string } {
  const dir = mkdtempSync(join(tmpdir(), 'blind-ud2-'))
  return { dir, path: join(dir, 'rag-store.json') }
}

function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function tail(store: RagStore) {
  const entries = store.journal()
  return entries[entries.length - 1]
}

function successOf(result: BatchResult): Extract<BatchResult, { ok: true }> {
  if (!result.ok) throw new Error('expected batch ok, got: ' + result.error)
  return result
}

describe('BLIND U-D2 greens — journal invertibility of document metadata', () => {
  it('B1: tags-only delta classifies as structural/node-update with tags in both snapshots', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-1', { tags: ['red'] }))
      await store.putNode(newNode('doc-1', { tags: ['red', 'blue'] }))

      const entry = tail(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('not structural')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('not node-update')
      expect(entry.op.before.tags).toEqual(['red'])
      expect(entry.op.after.tags).toEqual(['red', 'blue'])
    } finally {
      cleanup(dir)
    }
  })

  it('B2: undo then redo restores the prior tags and re-applies the new tags', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-2', { tags: ['red'] }))
      await store.putNode(newNode('doc-2', { tags: ['red', 'green'] }))

      expect(store.getNode('doc-2')!.tags).toEqual(['red', 'green'])
      await store.undo()
      expect(store.getNode('doc-2')!.tags).toEqual(['red'])
      await store.redo()
      expect(store.getNode('doc-2')!.tags).toEqual(['red', 'green'])
    } finally {
      cleanup(dir)
    }
  })

  it('B3: documentPath-only delta is structural and undo/redo restores the path', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-3', { documentPath: ['guides'] }))
      await store.putNode(newNode('doc-3', { documentPath: ['guides', 'api'] }))

      const entry = tail(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('not structural')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('not node-update')
      expect(entry.op.before.documentPath).toEqual(['guides'])
      expect(entry.op.after.documentPath).toEqual(['guides', 'api'])

      expect(store.getNode('doc-3')!.documentPath).toEqual(['guides', 'api'])
      await store.undo()
      expect(store.getNode('doc-3')!.documentPath).toEqual(['guides'])
      await store.redo()
      expect(store.getNode('doc-3')!.documentPath).toEqual(['guides', 'api'])
    } finally {
      cleanup(dir)
    }
  })

  it('B4: content+metadata produces exactly ONE structural entry and inverts BOTH fields', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-4', { content: 'alpha', tags: ['red'] }))
      await store.putNode(newNode('doc-4', { content: 'beta', tags: ['blue'] }))

      const structural = store.journal().filter((e) => e.kind === 'structural' && e.op.op === 'node-update')
      expect(structural).toHaveLength(1)
      expect(store.journal().some((e) => e.kind === 'content')).toBe(false)

      await store.undo()
      expect(store.getNode('doc-4')!.content).toBe('alpha')
      expect(store.getNode('doc-4')!.tags).toEqual(['red'])
      await store.redo()
      expect(store.getNode('doc-4')!.content).toBe('beta')
      expect(store.getNode('doc-4')!.tags).toEqual(['blue'])
    } finally {
      cleanup(dir)
    }
  })

  it('B5: content-only stays content, its snapshot has no metadata keys, and it survives boot', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-5', { content: 'alpha', tags: ['red'], documentPath: ['x'] }))
      await store.putNode(newNode('doc-5', { content: 'beta', tags: ['red'], documentPath: ['x'] }))

      const entry = tail(store)
      expect(entry.kind).toBe('content')
      if (entry.kind !== 'content') throw new Error('not content')
      expect(Object.prototype.hasOwnProperty.call(entry.before, 'tags')).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(entry.before, 'documentPath')).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(entry.after, 'tags')).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(entry.after, 'documentPath')).toBe(false)
      expect(entry.before.content).toBe('alpha')
      expect(entry.after.content).toBe('beta')

      const fresh = createJsonRagStore({ path })
      expect(fresh.status().corrupt).toBe(false)
      expect(fresh.getNode('doc-5')!.tags).toEqual(['red'])
    } finally {
      cleanup(dir)
    }
  })

  it('B6: tags [] normalizes to undefined in the structural snapshot; undo restores, redo clears', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-6', { tags: ['red'] }))
      await store.putNode(newNode('doc-6', { tags: [] }))

      const entry = tail(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind !== 'structural') throw new Error('not structural')
      expect(entry.op.op).toBe('node-update')
      if (entry.op.op !== 'node-update') throw new Error('not node-update')
      expect(entry.op.after.tags).toBeUndefined()

      await store.undo()
      expect(store.getNode('doc-6')!.tags).toEqual(['red'])
      await store.redo()
      expect(store.getNode('doc-6')!.tags).toBeUndefined()
    } finally {
      cleanup(dir)
    }
  })

  it('B7: a metadata no-op (normalizes equal) stays content; [] against absent tags stays content', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-7a', { tags: ['red'] }))
      await store.putNode(newNode('doc-7a', { content: 'changed', tags: [' red ', 'red'] }))
      expect(tail(store).kind).toBe('content')
      expect(store.getNode('doc-7a')!.tags).toEqual(['red'])

      await store.putNode(newNode('doc-7b'))
      await store.putNode(newNode('doc-7b', { tags: [] }))
      expect(tail(store).kind).toBe('content')
    } finally {
      cleanup(dir)
    }
  })

  it('B8: off-root metadata inverts identically', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('leaf/deep/node', { documentPath: ['a'], tags: ['t1'] }))
      await store.putNode(newNode('leaf/deep/node', { documentPath: ['a', 'b'], tags: ['t1', 't2'] }))

      const entry = tail(store)
      expect(entry.kind).toBe('structural')
      if (entry.kind === 'structural') expect(entry.op.op).toBe('node-update')

      await store.undo()
      expect(store.getNode('leaf/deep/node')!.documentPath).toEqual(['a'])
      expect(store.getNode('leaf/deep/node')!.tags).toEqual(['t1'])
      await store.redo()
      expect(store.getNode('leaf/deep/node')!.documentPath).toEqual(['a', 'b'])
      expect(store.getNode('leaf/deep/node')!.tags).toEqual(['t1', 't2'])
    } finally {
      cleanup(dir)
    }
  })

  it('B9: applyBatch(putNode) metadata lands a batch entry and undo/redo inverts it', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-9', { tags: ['red'] }))
      successOf(await store.applyBatch([
        { op: 'putNode', node: newNode('doc-9', { tags: ['green'] }) },
      ]))

      expect(tail(store).kind).toBe('batch')
      await store.undo()
      expect(store.getNode('doc-9')!.tags).toEqual(['red'])
      await store.redo()
      expect(store.getNode('doc-9')!.tags).toEqual(['green'])
    } finally {
      cleanup(dir)
    }
  })

  it('B10: a persisted metadata structural entry survives boot (isRagNode accept) and undoes', async () => {
    const { dir, path } = tempStorePath()
    try {
      const first = createJsonRagStore({ path })
      await first.putNode(newNode('doc-10', { content: 'same', tags: ['red'], documentPath: ['dir'] }))
      await first.putNode(newNode('doc-10', { content: 'same', tags: ['green'], documentPath: ['dir', 'sub'] }))

      const fresh = createJsonRagStore({ path })
      expect(fresh.status().corrupt).toBe(false)
      const accepted = fresh.journal().filter((e) => e.kind === 'structural' && e.op.op === 'node-update')
      expect(accepted).toHaveLength(1)
      expect(fresh.getNode('doc-10')!.tags).toEqual(['green'])

      await fresh.undo()
      expect(fresh.getNode('doc-10')!.tags).toEqual(['red'])
      expect(fresh.getNode('doc-10')!.documentPath).toEqual(['dir'])
    } finally {
      cleanup(dir)
    }
  })

  it('B11: undo and redo re-hash so a fresh boot has zero quarantines and the node loads', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-11', { tags: ['red'] }))
      await store.putNode(newNode('doc-11', { tags: ['green'] }))
      await store.undo()

      const afterUndo = createJsonRagStore({ path })
      expect(afterUndo.status().corrupt).toBe(false)
      expect(afterUndo.status().loadedNodes).toContain('doc-11')
      expect(afterUndo.status().quarantined).not.toContain('doc-11')
      expect(afterUndo.getNode('doc-11')!.tags).toEqual(['red'])

      await store.redo()
      const afterRedo = createJsonRagStore({ path })
      expect(afterRedo.status().corrupt).toBe(false)
      expect(afterRedo.status().loadedNodes).toContain('doc-11')
      expect(afterRedo.status().quarantined).not.toContain('doc-11')
      expect(afterRedo.getNode('doc-11')!.tags).toEqual(['green'])
    } finally {
      cleanup(dir)
    }
  })

  it('B12: documentPath and tags changing together yield one structural entry and invert together', async () => {
    const { dir, path } = tempStorePath()
    try {
      const store = createJsonRagStore({ path })
      await store.putNode(newNode('doc-12', { documentPath: ['one'], tags: ['red'] }))
      await store.putNode(newNode('doc-12', { documentPath: ['one', 'two'], tags: ['red', 'blue'] }))

      const structural = store.journal().filter((e) => e.kind === 'structural' && e.op.op === 'node-update')
      expect(structural).toHaveLength(1)
      expect(store.journal().some((e) => e.kind === 'content')).toBe(false)

      await store.undo()
      expect(store.getNode('doc-12')!.documentPath).toEqual(['one'])
      expect(store.getNode('doc-12')!.tags).toEqual(['red'])
      await store.redo()
      expect(store.getNode('doc-12')!.documentPath).toEqual(['one', 'two'])
      expect(store.getNode('doc-12')!.tags).toEqual(['red', 'blue'])
    } finally {
      cleanup(dir)
    }
  })
})
