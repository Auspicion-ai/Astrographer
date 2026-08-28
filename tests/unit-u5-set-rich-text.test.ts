// tests/unit-u5-set-rich-text.test.ts — Unit U5: the atomic rich-text
// write-back op `setRichText` + the `deriveRichCommitBroadcast` helper
// (docs/specs/unit-u5-set-rich-text.md §1.2, §2.1 happy-path states 1–15,
// §2.2 fail-states 1–9/11/13, §3 broadcast-kind rule + census).
//
// This is the TestWriter RED set — the U5 op does NOT exist yet:
//
//   - `src/main/edit-ops.ts` does NOT export `setRichText` /
//     `deriveRichCommitBroadcast` (the census is 9 edit ops, not 10).
//   - The `SetRichTextResult` result type is NOT exported.
//
// The tests are derived from the spec ALONE (§1.2/§2.1/§2.2). The op is a pure
// async function over the RagStore INTERFACE (Unit A §5.4 — SOURCE-SWITCHABLE),
// so it is tested against the concrete JSON store (createJsonRagStore) exactly
// as the IPC handler uses it. The namespace import is used so the RED run
// reaches the runtime failure ("setRichText is not a function") per-test rather
// than failing the whole file at import; all store mutating methods are
// queue-serialized + async, so every op call is awaited.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type BatchOp,
} from '../src/main/rag-store.js'
import * as editOps from '../src/main/edit-ops.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-u5-'))
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
// §2.1 HAPPY-PATH STATES (1–11) — the setRichText op
// ===========================================================================
describe('setRichText — Unit U5 (§2.1 happy-path states)', () => {
  it('RED — setRichText / deriveRichCommitBroadcast are not exported yet (the U5 amendment does not exist)', () => {
    expect(typeof editOps.setRichText).toBe('function')
    expect(typeof editOps.deriveRichCommitBroadcast).toBe('function')
  })

  it('1. atomic content+children set: BOTH set in ONE putNode → node.content + node.children', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const result = expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'hello',
          children: [{ type: 'strong', content: 'bold' }],
        }),
      )
      expect(result.node.content).toBe('hello')
      expect(result.node.children).toEqual([{ type: 'strong', content: 'bold' }])
      // the store reflects BOTH fields (the pair landed in a single record)
      expect(store.getNode('n1')!.content).toBe('hello')
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'bold' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. one journal entry: exactly ONE `content` entry whose after carries content+children; undoDepth +1', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const journalBefore = store.journal().length
      const undoBefore = store.undoDepth()
      expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'hello',
          children: [{ type: 'strong', content: 'bold' }],
        }),
      )
      // exactly ONE content entry (the content snapshot carries content+children+props)
      const contentEntries = store.journal().filter((e) => e.kind === 'content' && e.nodeId === 'n1')
      expect(contentEntries).toHaveLength(1)
      const entry = contentEntries[0]
      expect(entry.kind).toBe('content')
      if (entry.kind === 'content') {
        expect(entry.after.content).toBe('hello')
        expect(entry.after.children).toEqual([{ type: 'strong', content: 'bold' }])
        expect(entry.before.content).toBe('old')
      }
      expect(store.journal().length).toBe(journalBefore + 1)
      expect(store.undoDepth()).toBe(undoBefore + 1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. updatedAt refreshed on a real change; createdAt preserved', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const before = store.getNode('n1')!
      expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'new',
          children: [{ type: 'em', content: 'i' }],
        }),
      )
      const after = store.getNode('n1')!
      expect(Date.parse(after.updatedAt)).toBeGreaterThan(Date.parse(before.updatedAt))
      expect(after.createdAt).toBe(before.createdAt)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. node with NO prior children (children: undefined): children set → a plain-text node becomes rich', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1')) // children undefined
      const result = expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'x',
          children: [{ type: 'em', content: 'i' }],
        }),
      )
      expect(result.node.children).toEqual([{ type: 'em', content: 'i' }])
      expect(store.getNode('n1')!.children).toEqual([{ type: 'em', content: 'i' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. node with PRIOR children OVERWRITTEN (full replace, not merged)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const result = expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'y',
          children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }],
        }),
      )
      expect(result.node.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
      // the old children are fully replaced, not merged
      expect(store.getNode('n1')!.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty children [] clears: a rich node becomes plain (stored field is [])', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const result = expectOk(
        await editOps.setRichText({ store }, { nodeId: 'n1', content: 'z', children: [] }),
      )
      expect(result.node.children).toEqual([])
      expect(store.getNode('n1')!.children).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. idempotent no-op (content + children unchanged): NO write, NO journal, updatedAt unchanged, no broadcast', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'same', children: [{ type: 'strong', content: 'bold' }] }))
      const before = store.getNode('n1')!
      const journalBefore = store.journal().length
      const undoBefore = store.undoDepth()
      const result = expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'same',
          children: [{ type: 'strong', content: 'bold' }],
        }),
      )
      // node is the unchanged node
      expect(result.node.content).toBe('same')
      expect(result.node.children).toEqual([{ type: 'strong', content: 'bold' }])
      // no write (updatedAt unchanged), no journal entry, undoDepth unchanged
      expect(store.getNode('n1')!.updatedAt).toBe(before.updatedAt)
      expect(store.journal().length).toBe(journalBefore)
      expect(store.undoDepth()).toBe(undoBefore)
      // the deriveRichCommitBroadcast of before/after is null (no broadcast)
      expect(editOps.deriveRichCommitBroadcast(before, store.getNode('n1')!)).toBeNull()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. idempotent no-op on an empty/plain node (stored children:undefined ≡ commit children:[]): NO write, no journal, updatedAt unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'plain' })) // children undefined
      const before = store.getNode('n1')!
      const journalBefore = store.journal().length
      const undoBefore = store.undoDepth() // the setup putNode increments the cursor to 1
      expectOk(
        await editOps.setRichText({ store }, { nodeId: 'n1', content: 'plain', children: [] }),
      )
      expect(store.getNode('n1')!.updatedAt).toBe(before.updatedAt)
      expect(store.journal().length).toBe(journalBefore)
      expect(store.undoDepth()).toBe(undoBefore) // a no-op adds NO undo entry (state-7 pattern)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. content-only change PRESERVES the stored children representation (undefined stays undefined, NOT normalized to [])', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' })) // children undefined
      const result = expectOk(
        await editOps.setRichText({ store }, { nodeId: 'n1', content: 'new', children: [] }),
      )
      expect(result.node.content).toBe('new')
      // the equivalent-empty representation is preserved — no undefined→[] churn
      expect(result.node.children).toBeUndefined()
      expect(store.getNode('n1')!.children).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. children-only change (content identical): writes children, ONE content journal entry, broadcast kind structural', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'same' })) // children undefined
      const before = store.getNode('n1')!
      const journalBefore = store.journal().length
      const result = expectOk(
        await editOps.setRichText({ store }, {
          nodeId: 'n1',
          content: 'same',
          children: [{ type: 'strong', content: 'new' }],
        }),
      )
      expect(result.node.content).toBe('same')
      expect(result.node.children).toEqual([{ type: 'strong', content: 'new' }])
      expect(store.journal().length).toBe(journalBefore + 1) // ONE content entry
      // children changed → structural
      expect(editOps.deriveRichCommitBroadcast(before, store.getNode('n1')!)).toEqual({
        kind: 'structural',
        nodeIds: ['n1'],
        edgeIds: [],
      })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. children with optional props written back VERBATIM (img with src/alt)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const children = [{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }]
      const result = expectOk(
        await editOps.setRichText({ store }, { nodeId: 'n1', content: 'pic', children }),
      )
      expect(result.node.children).toEqual(children)
      expect(store.getNode('n1')!.children).toEqual(children)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §2.1 HAPPY-PATH STATES (12–15) — deriveRichCommitBroadcast (pure)
// ===========================================================================
describe('deriveRichCommitBroadcast — Unit U5 (§2.1 states 12–15)', () => {
  it('12. children changed → { kind: "structural", nodeIds: [id], edgeIds: [] }', () => {
    const before = makeNode('n1', { children: [{ type: 'strong', content: 'old' }] })
    const after = { ...before, children: [{ type: 'em', content: 'new' }] }
    expect(editOps.deriveRichCommitBroadcast(before, after)).toEqual({
      kind: 'structural',
      nodeIds: ['n1'],
      edgeIds: [],
    })
  })

  it('13. content-only changed (children undefined ≡ []) → { kind: "content", ... }', () => {
    const before = makeNode('n1', { content: 'old' }) // children undefined
    const after = { ...before, content: 'new', children: [] }
    expect(editOps.deriveRichCommitBroadcast(before, after)).toEqual({
      kind: 'content',
      nodeIds: ['n1'],
      edgeIds: [],
    })
  })

  it('14. BOTH content + children changed → structural (the superset kind)', () => {
    const before = makeNode('n1', { content: 'old', children: [] })
    const after = { ...before, content: 'new', children: [{ type: 'strong', content: 'bold' }] }
    expect(editOps.deriveRichCommitBroadcast(before, after)).toEqual({
      kind: 'structural',
      nodeIds: ['n1'],
      edgeIds: [],
    })
  })

  it('15. no-op (identical content + children, undefined ≡ []) → null (no broadcast)', () => {
    const before = makeNode('n1', { content: 'same' }) // children undefined
    const after = { ...before, children: [] } // equivalent empty
    expect(editOps.deriveRichCommitBroadcast(before, after)).toBeNull()
    expect(editOps.deriveRichCommitBroadcast(before, { ...before })).toBeNull()
  })
})

// ===========================================================================
// §2.2 states 9/13 — atomicity + throw-vs-fail (mock store spy)
// ===========================================================================
describe('setRichText — atomicity + throw contract (§2.2 states 9/13)', () => {
  it('9. atomicity: the op calls putNode EXACTLY ONCE carrying BOTH content AND children (no content-then-children write)', async () => {
    const node = makeNode('n1', { content: 'old' })
    const putNode = vi.fn(async (n: RagNode) => ({ ...n }))
    const store = {
      getNode: vi.fn((id: string) => (id === 'n1' ? node : undefined)),
      putNode,
    } as unknown as RagStore
    await editOps.setRichText({ store }, { nodeId: 'n1', content: 'hello', children: [{ type: 'strong', content: 'bold' }] })
    expect(putNode).toHaveBeenCalledTimes(1)
    const written = putNode.mock.calls[0][0]
    expect(written.content).toBe('hello')
    expect(written.children).toEqual([{ type: 'strong', content: 'bold' }])
  })

  it('13. throw-vs-fail: a putNode throw PROPAGATES out of setRichText (a rejected promise) — NOT swallowed into a store-error result', async () => {
    const node = makeNode('n1', { content: 'old' })
    const store = {
      getNode: vi.fn((id: string) => (id === 'n1' ? node : undefined)),
      putNode: vi.fn(async () => { throw new Error('rag putNode: children required/invalid') }),
    } as unknown as RagStore
    await expect(
      editOps.setRichText({ store }, { nodeId: 'n1', content: 'hello', children: [{ type: 'strong', content: 'x' }] }),
    ).rejects.toThrow('rag putNode: children required/invalid')
  })
})

// ===========================================================================
// §2.2 fail-states (1–8) — the setRichText op
// ===========================================================================
describe('setRichText — Unit U5 (§2.2 fail-states 1–8)', () => {
  it('1. nonexistent node → { ok:false, error: "edit.set_rich_text: node not found" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(
        await editOps.setRichText({ store }, { nodeId: 'ghost', content: 'x', children: [] }),
      )
      expect(result.error).toBe('edit.set_rich_text: node not found')
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('1b. a QUARANTINED node also returns node not found (getNode returns undefined)', async () => {
    const dir = freshDir()
    try {
      const fs = await import('node:fs')
      const path = join(dir, 'rag.json')
      const now = new Date().toISOString()
      const node = { id: 'n1', type: 'p', content: 'x', ownedNodeIds: [], createdAt: now, updatedAt: now }
      fs.writeFileSync(path, JSON.stringify({ version: 1, nodes: [{ ...node, hash: 'tampered' }], edges: [], journal: [] }))
      const store: RagStore = createJsonRagStore({ path })
      expect(store.getNode('n1')).toBeUndefined()
      const result = expectFail(
        await editOps.setRichText({ store }, { nodeId: 'n1', content: 'x', children: [] }),
      )
      expect(result.error).toBe('edit.set_rich_text: node not found')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. content non-string (42/null/undefined/object) → { ok:false, error: "edit.set_rich_text: content must be a string" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const ctx = { store }
      const journalBefore = store.journal().length
      for (const bad of [42, null, undefined, { a: 1 }, ['x'], true]) {
        const result = expectFail(
          await editOps.setRichText(ctx, { nodeId: 'n1', content: bad as never, children: [] }),
        )
        expect(result.error).toBe('edit.set_rich_text: content must be a string')
      }
      // the failed op added no journal entry (fail-closed)
      expect(store.getNode('n1')!.content).toBe('old')
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. children non-array (string/object/number) → { ok:false, error: "edit.set_rich_text: children required/invalid" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      for (const bad of ['x', {}, 42, true]) {
        const result = expectFail(
          await editOps.setRichText(ctx, { nodeId: 'n1', content: 'x', children: bad as never }),
        )
        expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      }
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. children ABSENT / undefined → { ok:false, error: "edit.set_rich_text: children required/invalid" } (children is REQUIRED — only [] clears)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      const result = expectFail(
        await editOps.setRichText(ctx, { nodeId: 'n1', content: 'x', children: undefined as never }),
      )
      expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a children entry with an invalid type (span/div/42/missing content) → children required/invalid; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      const badChildren: unknown[] = [
        [{ type: 'span', content: 'x' }], // span is NOT a child type
        [{ type: 'div', content: 'x' }], // div is NOT a child type
        [{ type: 'bogus', content: 'x' }], // unknown type
        [{ type: 42, content: 'x' }], // non-string type
        [{ type: 'strong' }], // missing content
        [{ type: 'strong', content: 42 }], // non-string content
      ]
      for (const bad of badChildren) {
        const result = expectFail(
          await editOps.setRichText(ctx, { nodeId: 'n1', content: 'x', children: bad as never }),
        )
        expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      }
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a children entry with a non-object/missing/malformed props → children required/invalid; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      const badChildren: unknown[] = [
        [{ type: 'a', content: 'x', props: 'x' }], // string props
        [{ type: 'a', content: 'x', props: [] }], // array props
        [{ type: 'a', content: 'x', props: null }], // null props
        [{ type: 'a', content: 'x', props: 42 }], // number props
      ]
      for (const bad of badChildren) {
        const result = expectFail(
          await editOps.setRichText(ctx, { nodeId: 'n1', content: 'x', children: bad as never }),
        )
        expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      }
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. a dangerous key in a child / child props → children required/invalid; store unchanged (no pollution, never a throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      const badChildren: unknown[] = [
        [{ type: 'strong', content: 'x', props: JSON.parse('{"__proto__": {}}') }], // dangerous key in child props
        [{ type: 'strong', content: 'x', constructor: {} }], // dangerous key on the child itself
        [{ type: 'strong', content: 'x', prototype: {} }], // dangerous key on the child itself
      ]
      for (const bad of badChildren) {
        const result = expectFail(
          await editOps.setRichText(ctx, { nodeId: 'n1', content: 'x', children: bad as never }),
        )
        expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      }
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. no partial mutation on a domain failure: a fail-state returns BEFORE any putNode → node unchanged, NO journal entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old', children: [{ type: 'strong', content: 'oldc' }] }))
      const ctx = { store }
      const journalBefore = store.journal().length
      // content valid, children invalid → fails at validation, before putNode
      await expectFail(
        await editOps.setRichText(ctx, { nodeId: 'n1', content: 'new', children: [{ type: 'span', content: 'x' }] as never }),
      )
      // the node is EXACTLY as it was — neither content NOR children applied
      expect(store.getNode('n1')!.content).toBe('old')
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'oldc' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §1.5 / §2.2 state 11 — applyBatch NON-interaction (decision A)
// ===========================================================================
describe('setRichText — applyBatch NON-interaction (§1.5 / §2.2 state 11)', () => {
  it('11a. applyBatch STILL rejects setProps/setSubtree/setType with the exact "op not supported: <kind> at index 0" strings', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const cases: Array<{ op: BatchOp; error: string }> = [
        { op: { op: 'setProps', nodeId: 'n1', props: { a: 1 } }, error: 'rag applyBatch: op not supported: setProps at index 0' },
        { op: { op: 'setSubtree', nodeId: 'n1', children: [] }, error: 'rag applyBatch: op not supported: setSubtree at index 0' },
        { op: { op: 'setType', nodeId: 'n1', type: 'h1' }, error: 'rag applyBatch: op not supported: setType at index 0' },
      ]
      for (const { op, error } of cases) {
        const result = await store.applyBatch([op])
        expect(result.ok).toBe(false)
        if (!result.ok) expect(result.error).toBe(error)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11b. the " at index N" suffix is positional: setProps at index 1 (after a putNode) → "...setProps at index 1"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await store.applyBatch([
        { op: 'putNode', node: makeNode('n2') },
        { op: 'setProps', nodeId: 'n1', props: { a: 1 } },
      ] as never)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('rag applyBatch: op not supported: setProps at index 1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11c. setRichText is NOT a batch op (no BatchOp variant): applyBatch([{op:"setRichText",...}]) → "rag applyBatch: invalid op at index 0" (decision A)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await store.applyBatch([{ op: 'setRichText', nodeId: 'n1', content: 'x', children: [] }] as never)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('rag applyBatch: invalid op at index 0')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// ADVERSARIAL F4 regression (RCA-3, docs/specs/unit-u5-set-rich-text.md §5) —
// `deepEqual`'s recursion cap: a pathologically deep props/children object must
// NOT overflow the call stack (a RangeError out of the op would violate the
// never-throw rule). `hasDangerousKey` caps at depth 100 (reject); `deepEqual`
// (the no-op + broadcast comparison) caps at depth 100 too (treat as UNEQUAL →
// changed, conservative). Exercised through `deriveRichCommitBroadcast` with
// directly-constructed RagNodes (bypasses the store's depth-100 validation,
// so the deepEqual cap is the only guard).
// ===========================================================================
describe('F4 — deepEqual recursion cap (deeply-nested props does not throw)', () => {
  /** Build a props object nested `depth` levels deep under a harmless key. */
  function deepProps(depth: number): Record<string, unknown> {
    let o: unknown = { leaf: 'x' }
    for (let i = 0; i < depth; i++) o = { k: o }
    return o as Record<string, unknown>
  }

  it('deriveRichCommitBroadcast does NOT throw on deeply-nested children props (deepEqual cap → treated as changed)', () => {
    const deepA = deepProps(5000)
    const deepB = deepProps(5000)
    const before = makeNode('n1', { content: 'same', children: [{ type: 'img', content: '', props: deepA }] })
    const after = { ...before, children: [{ type: 'img', content: '', props: deepB }] }
    // must NOT throw (a RangeError would escape deriveRichCommitBroadcast)
    let out: ReturnType<typeof editOps.deriveRichCommitBroadcast> | null = null
    expect(() => {
      out = editOps.deriveRichCommitBroadcast(before, after)
    }).not.toThrow()
    // at the depth cap the pair is treated as UNEQUAL → changed → structural
    expect(out).not.toBeNull()
    expect(out).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [] })
  })

  it('deriveRichCommitBroadcast does NOT throw when the deeply-nested props are the SAME object (a===b short-circuit)', () => {
    const deep = deepProps(5000)
    const before = makeNode('n1', { content: 'same', children: [{ type: 'img', content: '', props: deep }] })
    const after = { ...before, children: [{ type: 'img', content: '', props: deep }] }
    let out: ReturnType<typeof editOps.deriveRichCommitBroadcast> | null = null
    expect(() => {
      out = editOps.deriveRichCommitBroadcast(before, after)
    }).not.toThrow()
    // same object reference → equal → no-op → null (no broadcast)
    expect(out).toBeNull()
  })

  it('setRichText does NOT throw on a deeply-nested props (either treated as changed or handled as a domain fail — never a throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      // depth beyond hasDangerousKey's cap (100) → isValidChildren rejects it
      // as dangerous (domain fail, no throw); a shallow-but-deep-enough-to-hit
      // the old deepEqual overflow is impossible through the validation path,
      // so "handled, never a throw" is the pinned contract.
      const result = await editOps.setRichText({ store }, {
        nodeId: 'n1',
        content: 'x',
        children: [{ type: 'img', content: '', props: deepProps(5000) }],
      })
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toBe('edit.set_rich_text: children required/invalid')
      expect(store.getNode('n1')!.children).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
