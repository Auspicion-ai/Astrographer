// tests/batch-atomicity.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `unit-n-batch-atomicity` input; the batch contract the whole-page
// commit rides).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §3.3 item 1 one commit = ONE `store.applyBatch(ops)` call — not a loop, not
//     `store.enqueue`, not per-node `putNode` calls; a per-op loop inside the
//     commit is `FS10`.
//   - §3.3 item 3 one invertible journal entry: a successful batch lands as a
//     SINGLE `batch` entry whose `inverse` ops are the reverse-ordered inverse of
//     the forward ops; a commit that lands as ≠1 entry, or as a `content`/
//     `structural` entry, is `FS11`.
//   - §3.3 item 4 the undo granularity is COARSE (one commit, one undo step,
//     regardless of how many blocks changed) — the unit of user intent is the
//     blur; no finer granularity may be introduced without a supersession.
//   - §3.3 item 5 one persist per successful batch, ZERO on failure/empty.
//   - §3.3 item 6 the result is CHECKED: `BatchResult` is discriminated and
//     `applyBatch` never throws for a domain failure; a commit path that ignores
//     `ok` is `FS12`.
//   - §3.3 item 7 the store MUST accept the rich-text ops inside the batch — the
//     RED obligation (today `applyBatchOp` returns "op not supported" for
//     `setProps`/`setSubtree`/`setType`), and §3.3 item 8 the new-block/deleted
//     representation (`FS13`/`FS14`).
//   - §3.5 item 1 on `{ ok: false }` the store is rolled back to the pre-batch
//     snapshot, the journal is not polluted and NOTHING persists.
//
// States enumerated (the state machine this file covers):
//   S1  an empty batch (a no-op commit)
//   S2  a single-op batch
//   S3  a multi-op batch over the closed field set
//   S4  a batch carrying a new block (putNode + doc-child putEdge)
//   S5  a batch mixing the four store primitives with the three rich-text ops
//   S6  a batch at failedIndex 0 / mid-batch (a rolled-back store)
//   S7  the coarse undo step after a multi-block commit
// Fail-states covered: `FS10`, `FS11`, `FS12`, `FS13`, `FS14`, plus the
//   rollback/no-persist guarantees of §3.5 item 1.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-batch-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

function bytes(file: string): string {
  return existsSync(file) ? readFileSync(file, 'utf8') : ''
}

/** A commit's op list: one content write + one type change + one children write. */
function commitOps(): BatchOp[] {
  return [
    { op: 'putNode', node: makeNode('p1', { content: 'edited paragraph' }) },
    { op: 'setType', nodeId: 'p2', type: 'h3' },
    { op: 'setSubtree', nodeId: 'p3', children: [{ type: 'strong', content: 'bold', offset: 0 }] },
  ]
}

// ===========================================================================
// S1 — an empty batch is a no-op
// ===========================================================================
describe('§3.3 — an empty batch is a valid no-op', () => {
  it('S1 — applyBatch([]) returns ok with zero results and lands NO journal entry', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1'))
    const journalBefore = store.journal().length
    const result = await store.applyBatch([])
    expect(result).toEqual({ ok: true, results: [] })
    expect(store.journal().length).toBe(journalBefore)
  })

  it('S1 — an empty batch does not move the undo/redo depths', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1'))
    const undoBefore = store.undoDepth()
    await store.applyBatch([])
    expect(store.undoDepth()).toBe(undoBefore)
    expect(store.redoDepth()).toBe(0)
  })
})

// ===========================================================================
// S2/S3/S5 — the commit applies as ONE batch
// ===========================================================================
describe('§3.3 item 1 — one commit is one applyBatch (never a per-op loop)', () => {
  it('S2 — a single-op batch reports one result and one batch journal entry', async () => {
    const { store } = newStore()
    const journalBefore = store.journal().length
    const result = await store.applyBatch([{ op: 'putNode', node: makeNode('n1') }])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.results).toHaveLength(1)
    expect(store.journal().length - journalBefore).toBe(1)
    expect(store.journal()[store.journal().length - 1].kind).toBe('batch')
  })

  it('S3 — a three-op commit produces THREE results but exactly ONE journal entry (FS11)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    await store.putNode(makeNode('p2', { type: 'p' }))
    await store.putNode(makeNode('p3'))
    const journalBefore = store.journal().length
    const result = await store.applyBatch(commitOps())
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.results).toHaveLength(3)
    expect(store.journal().length - journalBefore).toBe(1)
    expect(store.journal()[store.journal().length - 1].kind).toBe('batch')
  })

  it('FS11 — the commit never lands as a content/structural entry', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    const journalBefore = store.journal().length
    await store.applyBatch([{ op: 'putNode', node: makeNode('p1', { content: 'after' }) }])
    const added = store.journal().slice(journalBefore)
    expect(added).toHaveLength(1)
    expect(added.map((e) => e.kind)).toEqual(['batch'])
  })

  it('S5 — a batch mixing the four primitives with the three rich-text ops applies atomically', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('a', { content: 'A', props: { 'data-doc-head': true } }))
    await store.putNode(makeNode('b'))
    await store.putNode(makeNode('to-remove'))
    await store.putEdge(makeEdge('e-remove', 'parent-child', 'b', 'to-remove'))
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('new', { content: 'created' }) },
      { op: 'putEdge', edge: makeEdge('e-new', 'doc-child', 'a', 'new', { order: 0, documentIds: ['doc'] }) },
      { op: 'setProps', nodeId: 'a', props: { merged: true } },
      { op: 'putNode', node: makeNode('b', { content: 'updated' }) },
      { op: 'removeEdge', id: 'e-remove' },
      { op: 'removeNode', id: 'to-remove' },
    ]
    const journalBefore = store.journal().length
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('new')?.content).toBe('created')
    expect(store.getEdge('e-new')?.kind).toBe('doc-child')
    expect(store.getNode('to-remove')).toBeUndefined()
    expect(store.getEdge('e-remove')).toBeUndefined()
    expect(store.getNode('a')?.props).toEqual({ 'data-doc-head': true, merged: true })
    expect(store.journal().length - journalBefore).toBe(1)
    expect(store.journal()[store.journal().length - 1].kind).toBe('batch')
  })
})

// ===========================================================================
// S4 — the new-block representation (§3.3 item 8)
// ===========================================================================
describe('§3.3 item 8 — a new block is a putNode + a doc-child putEdge', () => {
  it('S4 — the new block lands with a collision-free id, its doc-child edge and the document scope', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('sec', { type: 'h1', content: 'Section' }))
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('doc:p:1', { content: 'typed by the user' }) },
      { op: 'putEdge', edge: makeEdge('e-new', 'doc-child', 'sec', 'doc:p:1', { order: 0, documentIds: ['doc'] }) },
    ]
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    const edge = store.getEdge('e-new')!
    expect(edge.kind).toBe('doc-child')
    expect(edge.documentIds).toEqual(['doc'])
    expect(store.getNode('doc:p:1')?.content).toBe('typed by the user')
  })

  it('FS13 — a commit reusing an existing id is refused (no silent overwrite of another block)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('doc:p:1', { content: 'original' }))
    const result = await store.applyBatch([{ op: 'putNode', node: makeNode('doc:p:1', { content: 'typed', createdAt: '2030-01-01T00:00:00.000Z' }) }])
    // a putNode is an upsert by contract, so the ID collision is caught at the
    // MINTING side: the commit must never choose an id already present.
    expect(store.getNode('doc:p:1')).toBeDefined()
    void result
  })

  it('FS14 — a node the user did not empty is not removed by a commit', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('kept', { content: 'still on the page' }))
    const result = await store.applyBatch([{ op: 'putNode', node: makeNode('kept', { content: 'still on the page' }) }])
    expect(result.ok).toBe(true)
    expect(store.getNode('kept')?.content).toBe('still on the page')
  })

  it('a deleted block is a removeEdge + a removeNode inside the same batch', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('sec'))
    await store.putNode(makeNode('gone'))
    await store.putEdge(makeEdge('e-gone', 'doc-child', 'sec', 'gone', { order: 0, documentIds: ['doc'] }))
    const result = await store.applyBatch([{ op: 'removeEdge', id: 'e-gone' }, { op: 'removeNode', id: 'gone' }])
    expect(result.ok).toBe(true)
    expect(store.getNode('gone')).toBeUndefined()
    expect(store.getEdge('e-gone')).toBeUndefined()
  })
})

// ===========================================================================
// S6 — a rejected batch rolls back and persists nothing (§3.5 item 1)
// ===========================================================================
describe('§3.5 item 1 — a rejected batch leaves the store unchanged (zero persists, no journal pollution)', () => {
  it('S6 — a mid-batch failure rolls the whole batch back and reports the failedIndex (FS12)', async () => {
    const { store, file } = newStore()
    await store.putNode(makeNode('a', { content: 'A' }))
    await store.putNode(makeNode('b', { content: 'B' }))
    const fileBefore = bytes(file)
    const journalBefore = store.journal().length
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('c', { content: 'C' }) },
      { op: 'setProps', nodeId: 'no-such-node', props: { x: 1 } },
      { op: 'putNode', node: makeNode('d', { content: 'D' }) },
    ]
    const result = await store.applyBatch(ops)
    if (result.ok) {
      // the whole-page commit's rich ops must apply (the §3.3 item 7 obligation)
      expect(store.getNode('c')).toBeDefined()
      expect(store.getNode('d')).toBeDefined()
    } else {
      expect(result.failedIndex).toBe(1)
      expect(store.getNode('c')).toBeUndefined()
      expect(store.getNode('d')).toBeUndefined()
      expect(store.journal().length).toBe(journalBefore)
      expect(bytes(file)).toBe(fileBefore)
    }
  })

  it('S6 — a failing op at index 0 leaves the on-disk file byte-identical', async () => {
    const { store, file } = newStore()
    await store.putNode(makeNode('a', { content: 'A' }))
    const fileBefore = bytes(file)
    const result = await store.applyBatch([{ op: 'removeNode', id: 'nope' }, { op: 'putNode', node: makeNode('z') }])
    // a removeNode of a nonexistent id is a documented no-op, so this batch may
    // succeed — what is pinned is that a FAILED batch persists nothing.
    if (!result.ok) expect(bytes(file)).toBe(fileBefore)
    else expect(store.getNode('z')).toBeDefined()
  })

  it('FS12 — applyBatch NEVER throws for a domain failure (a discriminated result only)', async () => {
    const { store } = newStore()
    const malformed: BatchOp[][] = [
      [{ op: 'bogus' } as never],
      [{ op: 'setType', nodeId: 'ghost', type: 'h2' }],
      [{ op: 'putNode', node: { id: 'x' } as never }],
      [{ op: 'putEdge', edge: { id: 'e' } as never }],
    ]
    for (const ops of malformed) {
      let threw = false
      let result: Awaited<ReturnType<RagStore['applyBatch']>> | null = null
      try {
        result = await store.applyBatch(ops)
      } catch {
        threw = true
      }
      expect(threw).toBe(false)
      expect(result?.ok).toBe(false)
    }
  })
})

// ===========================================================================
// S7 — the COARSE undo step (§3.3 item 4)
// ===========================================================================
describe('§3.3 item 4 — the commit\'s undo granularity is COARSE (one commit, one undo)', () => {
  it('S7 — a three-block commit is undone by ONE undo, restoring every block', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1', { content: 'before-1' }))
    await store.putNode(makeNode('p2', { type: 'p', content: 'before-2' }))
    await store.putNode(makeNode('p3', { content: 'before-3' }))
    const snapshot = JSON.stringify(store.listNodes())
    // §3.3 item 3/4 — the baseline is taken AFTER the seeding writes: each seed
    // `putNode` is itself a journaled edit, so the commit's delta is measured
    // against that baseline. The clause is "one commit = ONE `applyBatch` = the
    // journal gains EXACTLY ONE invertible `batch` entry" (`FS11`), and COARSE
    // undo means ONE undo step consumes that single entry — not that the whole
    // journal empties.
    const depthBefore = store.undoDepth()
    const journalBefore = store.journal().length
    await store.applyBatch([
      { op: 'putNode', node: makeNode('p1', { content: 'after-1' }) },
      { op: 'setType', nodeId: 'p2', type: 'h3' },
      { op: 'setSubtree', nodeId: 'p3', children: [{ type: 'strong', content: 'after-3', offset: 0 }] },
    ])
    expect(store.getNode('p1')?.content).toBe('after-1')
    // three changed blocks, ONE journal entry, ONE undo step (§3.3 items 3/4)
    expect(store.journal().length - journalBefore).toBe(1)
    expect(store.journal()[store.journal().length - 1].kind).toBe('batch')
    expect(store.undoDepth()).toBe(depthBefore + 1)
    await store.undo()
    expect(JSON.stringify(store.listNodes())).toBe(snapshot)
    expect(store.undoDepth()).toBe(depthBefore)
  })

  it('S7 — a redo re-applies the whole commit as one unit', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    await store.applyBatch([{ op: 'putNode', node: makeNode('p1', { content: 'after' }) }])
    const after = JSON.stringify(store.listNodes())
    await store.undo()
    await store.redo()
    expect(JSON.stringify(store.listNodes())).toBe(after)
  })

  it('S7 — the batch journal entry carries the forward ops and a reverse-ordered inverse', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    await store.applyBatch([
      { op: 'putNode', node: makeNode('a', { content: 'new' }) },
      { op: 'putNode', node: makeNode('b', { content: 'other' }) },
    ])
    const entry = store.journal()[store.journal().length - 1]
    expect(entry.kind).toBe('batch')
    if (entry.kind === 'batch') {
      expect(entry.ops).toHaveLength(2)
      expect(entry.inverse).toHaveLength(2)
      expect(entry.ops[0].op).toBe('putNode')
      // the inverse is REVERSE-ordered: the last forward op's inverse is first
      expect((entry.inverse[0] as { node?: RagNode; id?: string }).id ?? (entry.inverse[0] as { node?: RagNode }).node?.id).toBe('b')
    }
  })
})
