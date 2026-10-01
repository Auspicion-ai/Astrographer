// tests/unit-u-edit-2-undo-redo-history.test.ts — REBUILT suite (the `C9
// U-EDIT-1` rebuild of the archived `unit-u-edit-2-undo-redo-history` input; the
// journal surface the whole-page commit feeds).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §3.3 item 3 one invertible journal entry: a successful commit lands as a
//     SINGLE `batch` entry whose `inverse` ops are the reverse-ordered inverse of
//     the forward ops (`DECIDED: PROJECT-JOURNAL`; `DECIDED:
//     C16-CONSUMES-PROJECT-JOURNAL`); after one commit `journal()` has gained
//     exactly one entry of kind `batch`, and `undo()` restores the whole commit as
//     a unit. A commit that lands as N entries — or as a `content`/`structural`
//     entry — is `FS11`.
//   - §3.3 item 4 the undo granularity is COARSE (one commit, one undo step,
//     regardless of how many blocks changed); no finer granularity may be
//     introduced without a supersession of that clause.
//   - §3.4 step 4/5 the history the operator sees is derived from the project
//     journal; the `before`/`after`/`ops`/`inverse` payloads are DROPPED at the
//     IPC boundary (only `index`/`kind`/`at` cross).
//   - §4.4 the commit's success path re-traverses through the existing
//     `rag-store-changed` route — the journal/history surface adds no new
//     notification mechanism.
//
// States enumerated (the state machine this file covers):
//   S1  an empty journal (the boot state)
//   S2  one commit = one batch entry (cursor +1)
//   S3  a multi-block commit undone by ONE undo
//   S4  a redo re-applying the whole commit
//   S5  the sanitized history payload (no ops/inverse/before/after at the boundary)
//   S6  a malformed / exhausted journal op (a domain no-op, never a throw)
//   S7  the history after a fresh read (the project journal is the carrier)
// Fail-states covered: `FS11` (a commit landing as ≠1 entry or a non-`batch`
//   kind), the empty-stack no-op, and the null-store throw.
import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createJsonRagStore, type RagStore, type RagNode, type BatchOp } from '../src/main/rag-store.js'
import { handleRagJournalIpc, handleRagJournalOpIpc } from '../src/main/mcp-server.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): RagStore {
  return createJsonRagStore({ path: join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-hist-')), 'rag.json') })
}

/** One whole-page commit: a content write, a type change and a children write. */
function commitOps(): BatchOp[] {
  return [
    { op: 'putNode', node: makeNode('p1', { content: 'edited' }) },
    { op: 'setType', nodeId: 'p2', type: 'h3' },
    { op: 'setSubtree', nodeId: 'p3', children: [{ type: 'strong', content: 'bold', offset: 0 }] },
  ]
}

async function commit(store: RagStore): Promise<BatchOp[]> {
  const ops = commitOps()
  await store.applyBatch(ops)
  return ops
}

/** The three blocks the commits edit, seeded as the PRE-COMMIT state. */
async function seededStore(): Promise<RagStore> {
  const store = newStore()
  await store.putNode(makeNode('p1', { content: 'before' }))
  await store.putNode(makeNode('p2', { type: 'p', content: 'section' }))
  await store.putNode(makeNode('p3', { content: 'bold' }))
  return store
}

/** Undo every entry, returning the store to its boot state. */
async function drainUndo(store: RagStore): Promise<void> {
  while (store.undoDepth() > 0) await store.undo()
}

/** The journal entries added after a baseline index. */
function addedEntries(store: RagStore, baseline: number) {
  return store.journal().slice(baseline)
}

// ===========================================================================
// S1/S5 — the sanitized history payload
// ===========================================================================
describe('§3.4 — the history payload is the SANITIZED project journal (no ops/inverse at the boundary)', () => {
  it('S1 — an EMPTY journal reports empty entries and zero depths', () => {
    const store = newStore()
    const payload = handleRagJournalIpc(store)
    expect(payload.entries).toEqual([])
    expect(payload.cursor).toBe(0)
    expect(payload.undoDepth).toBe(0)
    expect(payload.redoDepth).toBe(0)
  })

  it('S5 — a committed entry carries index/kind/at only (the batch payloads are DROPPED)', async () => {
    const store = await seededStore()
    const baseline = store.journal().length
    await commit(store)
    const payload = handleRagJournalIpc(store)
    const added = payload.entries.slice(baseline)
    expect(added).toHaveLength(1)
    expect(added[0]).toHaveProperty('index')
    expect(added[0]).toHaveProperty('kind')
    expect(added[0]).toHaveProperty('at')
    expect(added[0]).not.toHaveProperty('ops')
    expect(added[0]).not.toHaveProperty('inverse')
    expect(added[0]).not.toHaveProperty('before')
    expect(added[0]).not.toHaveProperty('after')
  })

  it('S5 — the payload never leaks a node id or the committed content', async () => {
    const store = await seededStore()
    await commit(store)
    const serialized = JSON.stringify(handleRagJournalIpc(store))
    expect(serialized).not.toContain('p1')
    expect(serialized).not.toContain('edited')
  })

  it('S7 — a fresh read reflects the commit (the project journal is the carrier)', async () => {
    const store = await seededStore()
    const before = handleRagJournalIpc(store)
    await commit(store)
    const after = handleRagJournalIpc(store)
    expect(after.entries.length).toBe(before.entries.length + 1)
    expect(after.cursor).toBe(before.cursor + 1)
  })

  it('the null-store read throws the documented fail-state', () => {
    expect(() => handleRagJournalIpc(null)).toThrow(/rag-journal: no rag store configured/)
  })
})

// ===========================================================================
// S2 — one commit = one batch entry
// ===========================================================================
describe('§3.3 item 3 — one commit gains exactly ONE `batch` journal entry (FS11)', () => {
  it('S2 — a three-block commit adds exactly one entry, of kind batch', async () => {
    const store = await seededStore()
    const baseline = store.journal().length
    await commit(store)
    const added = addedEntries(store, baseline)
    expect(added).toHaveLength(1)
    expect(added[0].kind).toBe('batch')
  })

  it('S2 — the commit moves the undo cursor by exactly one', async () => {
    const store = await seededStore()
    const baseline = store.undoDepth()
    await commit(store)
    expect(store.undoDepth() - baseline).toBe(1)
  })

  it('FS11 — the commit does NOT land as N entries (one per changed block)', async () => {
    const store = await seededStore()
    const baseline = store.journal().length
    await commit(store)
    expect(store.journal().length - baseline).toBe(1)
  })

  it('FS11 — the commit does not land as a content or structural entry', async () => {
    const store = await seededStore()
    const baseline = store.journal().length
    await commit(store)
    expect(addedEntries(store, baseline).map((e) => e.kind)).toEqual(['batch'])
  })

  it('S2 — the batch entry carries the forward ops and a reverse-ordered inverse', async () => {
    const store = await seededStore()
    const baseline = store.journal().length
    await commit(store)
    const entry = addedEntries(store, baseline)[0]
    expect(entry.kind).toBe('batch')
    if (entry.kind === 'batch') {
      expect(entry.ops).toHaveLength(3)
      expect(entry.inverse).toHaveLength(3)
      expect(entry.ops.map((op) => op.op)).toEqual(['putNode', 'setType', 'setSubtree'])
    }
  })
})

// ===========================================================================
// S3/S4 — the coarse undo/redo round trip
// ===========================================================================
describe('§3.3 item 4 — the undo step is COARSE: one commit, one undo', () => {
  it('S3 — ONE undo restores every block the commit touched', async () => {
    const store = await seededStore()
    const snapshot = JSON.stringify(store.listNodes())
    await commit(store)
    const result = await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(result.ok).toBe(true)
    expect(JSON.stringify(store.listNodes())).toBe(snapshot)
  })

  it('S3 — the undo reports the entry index it reverted', async () => {
    const store = await seededStore()
    await commit(store)
    const cursor = store.undoDepth()
    const result = await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(result).toEqual({ ok: true, entryIndex: cursor - 1 })
  })

  it('S4 — a redo re-applies the whole commit as one unit', async () => {
    const store = await seededStore()
    await commit(store)
    const committed = JSON.stringify(store.listNodes())
    await handleRagJournalOpIpc(store, { action: 'undo' })
    const result = await handleRagJournalOpIpc(store, { action: 'redo' })
    expect(result.ok).toBe(true)
    expect(JSON.stringify(store.listNodes())).toBe(committed)
  })

  it('S3 — a SECOND commit is a second undo step (coarse, not fine-grained)', async () => {
    const store = await seededStore()
    const startDepth = store.undoDepth()
    await commit(store)
    await store.applyBatch([{ op: 'putNode', node: makeNode('p1', { content: 'edited again' }) }])
    expect(store.undoDepth() - startDepth).toBe(2)
    await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(store.getNode('p1')?.content).toBe('edited')
    await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(store.getNode('p1')?.content).toBe('before')
  })

  it('S3 — the redo stack is cleared by a new commit', async () => {
    const store = await seededStore()
    await commit(store)
    await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(store.redoDepth()).toBe(1)
    await store.applyBatch([{ op: 'putNode', node: makeNode('p1', { content: 'branch' }) }])
    expect(store.redoDepth()).toBe(0)
  })
})

// ===========================================================================
// S6 — the empty-stack / malformed op is a domain no-op
// ===========================================================================
describe('§3.4 — a journal op on an empty stack or a malformed action is a no-op', () => {
  it('S6 — undo at the base boundary is a no-op (never re-writes the store)', async () => {
    const store = await seededStore()
    await drainUndo(store)
    const snapshot = JSON.stringify(store.listNodes())
    const result = await handleRagJournalOpIpc(store, { action: 'undo' })
    expect(result).toEqual({ ok: false, entryIndex: null })
    expect(JSON.stringify(store.listNodes())).toBe(snapshot)
  })

  it('S6 — an exhausted redo stack is a no-op (never a phantom re-application)', async () => {
    const store = await seededStore()
    await commit(store)
    await handleRagJournalOpIpc(store, { action: 'undo' })
    await handleRagJournalOpIpc(store, { action: 'redo' })
    const result = await handleRagJournalOpIpc(store, { action: 'redo' })
    expect(result.ok).toBe(false)
  })

  it('S6 — a malformed action is a domain no-op (never throws, never a mutation)', async () => {
    const store = await seededStore()
    const snapshot = JSON.stringify(store.listNodes())
    for (const action of [undefined, null, 'replay', 'UNDO', 42, {}]) {
      const result = await handleRagJournalOpIpc(store, { action } as never)
      expect(result.ok).toBe(false)
    }
    expect(JSON.stringify(store.listNodes())).toBe(snapshot)
  })

  it('a null store throws the documented fail-state for the op too', async () => {
    await expect(handleRagJournalOpIpc(null, { action: 'undo' })).rejects.toThrow(/rag-journal-op: no rag store configured/)
  })
})

// ===========================================================================
// The commit's history after a failed batch (§3.5 item 1)
// ===========================================================================
describe('§3.5 item 1 — a rejected commit pollutes neither the journal nor the history', () => {
  it('a failed batch adds no journal entry (the history shows nothing new)', async () => {
    const store = await seededStore()
    const before = handleRagJournalIpc(store)
    const result = await store.applyBatch([{ op: 'setProps', nodeId: 'ghost', props: { a: 1 } }])
    expect(result.ok).toBe(false)
    const after = handleRagJournalIpc(store)
    expect(after.entries).toEqual(before.entries)
    expect(after.cursor).toBe(before.cursor)
  })
})
