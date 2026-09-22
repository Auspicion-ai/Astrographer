// tests/edit-ops.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of the
// archived `unit-o-edit-ops` / `edit-ops` inputs; the write primitives the
// whole-page commit is expressed in).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.4 item 4 the write primitive is `setType`-CLASS and NEVER
//     delete + recreate: `src/main/edit-ops.ts` `setType` changes ONLY `type`
//     ("id/content/children/props/ownedNodeIds preserved; only `type` changes",
//     `DECIDED: RICH-TEXT-EDIT-OPS`); a delete + recreate is `FS6`.
//   - §2.4 item 5 a multi-block apply is ONE `applyBatch` with one `setType` op
//     per resolved block (the same atomicity rule as the commit).
//   - §2.2 item 3 any props write uses the MERGE semantics of `setProps`
//     (`DECIDED: RICH-TEXT-EDIT-OPS` Option A), so the `data-doc-head` marker
//     and every unnamed key survive; a commit that strips `data-doc-head` is
//     `FS3`.
//   - §3.2's op table: a `children` difference writes the op-level equivalent of
//     `setSubtree`'s replace semantics.
//   - §3.3 item 7 the RED obligation: a whole-page commit containing a type
//     change or a props merge must SUCCEED inside one batch — today
//     `applyBatchOp` returns "op not supported" for those ops.
//
// States enumerated (the state machine this file covers):
//   S1  setType on a plain node
//   S2  setType on a node carrying inline children (strong/em/a/img)
//   S3  setType on a `td` → `th` (the table-cell case `TABLE-CELLS-NOT-EDITABLE` closes)
//   S4  setType on the doc-head node (the marker is a prop, not a type concern)
//   S5  setProps merging an existing RAG-owned prop set
//   S6  setSubtree replacing a node's inline children
//   S7  a multi-block type apply
//   S8  setType to the SAME type (an idempotent no-op)
// Fail-states covered: `FS3` (a props write stripping `data-doc-head`), `FS4`
//   (a type outside the closed union), `FS6` (a delete + recreate type change),
//   plus the node-not-found / malformed-input domain results.
import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setType, setProps, setSubtree, type EditOpContext } from '../src/main/edit-ops.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagNodeType,
  type BatchOp,
} from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
const RAG_NODE_TYPES: RagNodeType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th']

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function ctx(): { store: RagStore; ctx: EditOpContext } {
  const store = createJsonRagStore({ path: join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-ops-')), 'rag.json') })
  return { store, ctx: { store } }
}

// ===========================================================================
// S1/S2/S3/S4 — the type change is setType-class, never delete + recreate
// ===========================================================================
describe('§2.4 item 4 — setType changes only the type (the target node keeps its identity)', () => {
  it('S1 — a plain node keeps id/createdAt/content/ownedNodeIds and moves only its type', async () => {
    const { store, ctx: c } = ctx()
    const before = makeNode('n1', { type: 'p', content: 'body' })
    await store.putNode(before)
    const result = await setType(c, { nodeId: 'n1', type: 'h2' })
    expect(result.ok).toBe(true)
    const after = store.getNode('n1')!
    expect(after.type).toBe('h2')
    expect(after.id).toBe('n1')
    expect(after.createdAt).toBe(before.createdAt)
    expect(after.content).toBe('body')
    expect(after.ownedNodeIds).toEqual([])
    expect(store.getNode('n1')).toBeDefined()
    expect(store.listNodes()).toHaveLength(1)
  })

  it('S2 — a node carrying inline children keeps them verbatim across the type change', async () => {
    const { store, ctx: c } = ctx()
    const children = [{ type: 'strong' as const, content: 'bold', offset: 0 }, { type: 'a' as const, content: 'link', offset: 5, props: { href: 'https://example.test/' } }]
    await store.putNode(makeNode('n1', { content: 'boldlink', children }))
    const result = await setType(c, { nodeId: 'n1', type: 'blockquote' })
    expect(result.ok).toBe(true)
    expect(store.getNode('n1')?.children).toEqual(children)
  })

  it('S3 — a table cell changes td → th without losing the cell', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('c1', { type: 'td', content: 'cell' }))
    expect((await setType(c, { nodeId: 'c1', type: 'th' })).ok).toBe(true)
    const after = store.getNode('c1')!
    expect(after.type).toBe('th')
    expect(after.content).toBe('cell')
  })

  it('S4 — the doc-head marker survives a type change (the marker is a prop, not a type concern)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('title', { type: 'h1', content: 'Title', props: { 'data-doc-head': true } }))
    await setType(c, { nodeId: 'title', type: 'h2' })
    expect(store.getNode('title')?.props?.['data-doc-head']).toBe(true)
  })

  it('S8 — setType to the SAME type is an idempotent no-op (no journal entry)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { type: 'p' }))
    const journalBefore = store.journal().length
    const result = await setType(c, { nodeId: 'n1', type: 'p' })
    expect(result.ok).toBe(true)
    expect(store.journal().length).toBe(journalBefore)
  })

  it('FS6 — no removeNode/putNode op is the expression of a type change (the primitives are distinct)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { content: 'x' }))
    const nodesAfter: string[] = []
    await setType(c, { nodeId: 'n1', type: 'h3' })
    for (const n of store.listNodes()) nodesAfter.push(n.id)
    expect(nodesAfter).toEqual(['n1'])
    expect(c.store.getNode('n1')?.createdAt).toBeDefined()
  })
})

// ===========================================================================
// S5 — setProps MERGES (the `data-doc-head` guarantee)
// ===========================================================================
describe('§2.2 item 3 / FS3 — a props write merges and never strips data-doc-head', () => {
  it('S5 — setProps keeps every existing key and adds the new one', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('title', { props: { 'data-doc-head': true, keep: 'me' } }))
    const result = await setProps(c, { nodeId: 'title', props: { added: 'new' } })
    expect(result.ok).toBe(true)
    const props = store.getNode('title')?.props ?? {}
    expect(props['data-doc-head']).toBe(true)
    expect(props.keep).toBe('me')
    expect(props.added).toBe('new')
  })

  it('FS3 — a props write that would drop the doc-head marker is not expressible as a replace', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('title', { props: { 'data-doc-head': true } }))
    await setProps(c, { nodeId: 'title', props: { other: 1 } })
    expect(store.getNode('title')?.props?.['data-doc-head']).toBe(true)
  })

  it('FS3 — every unnamed key survives a props merge (no wholesale props object)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { props: { a: 1, b: 2, c: 3 } }))
    await setProps(c, { nodeId: 'n1', props: { b: 20 } })
    expect(store.getNode('n1')?.props).toEqual({ a: 1, b: 20, c: 3 })
  })

  it('setProps on a node with no props sets exactly the merged set', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1'))
    await setProps(c, { nodeId: 'n1', props: { only: true } })
    expect(store.getNode('n1')?.props).toEqual({ only: true })
  })

  it('setProps on a nonexistent node is a domain failure, not a throw', async () => {
    const { ctx: c } = ctx()
    const result = await setProps(c, { nodeId: 'ghost', props: { a: 1 } })
    expect(result.ok).toBe(false)
  })

  it('setProps with a dangerous key is refused (no prototype pollution)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1'))
    const result = await setProps(c, { nodeId: 'n1', props: { __proto__: { polluted: true } } as never })
    expect(result.ok).toBe(false)
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })
})

// ===========================================================================
// S6 — setSubtree replaces the inline children
// ===========================================================================
describe('§3.2 — setSubtree replaces a node\'s inline children wholesale', () => {
  it('S6 — prior children are GONE after the replace', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { content: 'ab', children: [{ type: 'strong', content: 'a' }, { type: 'em', content: 'b' }] }))
    const result = await setSubtree(c, { nodeId: 'n1', children: [{ type: 'a', content: 'ab', props: { href: 'https://example.test/' } }] })
    expect(result.ok).toBe(true)
    expect(store.getNode('n1')?.children).toEqual([{ type: 'a', content: 'ab', props: { href: 'https://example.test/' } }])
  })

  it('setSubtree with [] clears the children (plain text again)', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'x' }] }))
    await setSubtree(c, { nodeId: 'n1', children: [] })
    expect(store.getNode('n1')?.children).toEqual([])
  })

  it('setSubtree with an invalid child type is a domain failure', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1'))
    const result = await setSubtree(c, { nodeId: 'n1', children: [{ type: 'span', content: 'x' } as never] })
    expect(result.ok).toBe(false)
  })

  it('setSubtree does not touch the node\'s type or content', async () => {
    const { store, ctx: c } = ctx()
    await store.putNode(makeNode('n1', { type: 'h3', content: 'kept' }))
    await setSubtree(c, { nodeId: 'n1', children: [{ type: 'em', content: 'kept' }] })
    const after = store.getNode('n1')!
    expect(after.type).toBe('h3')
    expect(after.content).toBe('kept')
  })
})

// ===========================================================================
// S7 — the multi-block apply is ONE atomic batch (the commit's shape)
// ===========================================================================
describe('§2.4 item 5 — a multi-block type apply is ONE batch (all or nothing)', () => {
  it('S7 — a batch of three setType ops applies as one invertible unit', async () => {
    const { store } = ctx()
    await store.putNode(makeNode('a', { type: 'p' }))
    await store.putNode(makeNode('b', { type: 'p' }))
    await store.putNode(makeNode('c', { type: 'p' }))
    const ops: BatchOp[] = [
      { op: 'setType', nodeId: 'a', type: 'h2' },
      { op: 'setType', nodeId: 'b', type: 'h3' },
      { op: 'setType', nodeId: 'c', type: 'li' },
    ]
    const journalBefore = store.journal().length
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('a')?.type).toBe('h2')
    expect(store.getNode('b')?.type).toBe('h3')
    expect(store.getNode('c')?.type).toBe('li')
    expect(store.journal().length - journalBefore).toBe(1)
    expect(store.journal()[store.journal().length - 1].kind).toBe('batch')
  })

  it('FS4 — a batch offering a type OUTSIDE the closed RagNodeType union fails the whole batch', async () => {
    const { store } = ctx()
    await store.putNode(makeNode('a', { type: 'p' }))
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'a', type: 'section' as never }])
    expect(result.ok).toBe(false)
    expect(store.getNode('a')?.type).toBe('p')
  })

  it('§2.4 item 1 — the closed type set is the 23-member RagNodeType union (recounted)', () => {
    expect(RAG_NODE_TYPES).toHaveLength(23)
    expect(new Set(RAG_NODE_TYPES).size).toBe(23)
  })

  it('§2.4 item 2 — a td/th/li/pre/table element is applicable (no per-node eligibility gate remains)', async () => {
    const { store, ctx: c } = ctx()
    for (const [id, type] of [['td1', 'td'], ['th1', 'th'], ['li1', 'li'], ['pre1', 'pre']] as [string, RagNodeType][]) {
      await store.putNode(makeNode(id, { type }))
      const target: RagNodeType = type === 'td' ? 'th' : type === 'th' ? 'td' : type === 'li' ? 'p' : 'blockquote'
      const result = await setType(c, { nodeId: id, type: target })
      expect(result.ok).toBe(true)
    }
  })
})

// ===========================================================================
// The commit's one-batch rich-op obligation (§3.3 item 7)
// ===========================================================================
describe('§3.3 item 7 — the store accepts the rich-text ops inside a commit batch', () => {
  it('a mixed batch (setType + setProps + setSubtree + putNode) succeeds as ONE batch', async () => {
    const { store } = ctx()
    await store.putNode(makeNode('a', { type: 'p', content: 'A', props: { 'data-doc-head': true } }))
    await store.putNode(makeNode('b', { type: 'p', content: 'B', children: [{ type: 'em', content: 'old' }] }))
    const ops: BatchOp[] = [
      { op: 'setType', nodeId: 'a', type: 'h2' },
      { op: 'setProps', nodeId: 'a', props: { extra: true } },
      { op: 'setSubtree', nodeId: 'b', children: [{ type: 'strong', content: 'new', offset: 0 }] },
      { op: 'putNode', node: makeNode('c', { content: 'added' }) },
    ]
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('a')?.type).toBe('h2')
    expect(store.getNode('a')?.props?.['data-doc-head']).toBe(true)
    expect(store.getNode('a')?.props?.extra).toBe(true)
    expect(store.getNode('b')?.children).toEqual([{ type: 'strong', content: 'new', offset: 0 }])
    expect(store.getNode('c')?.content).toBe('added')
  })

  it('the whole mixed batch is invertible as one unit (the pre-commit state returns)', async () => {
    const { store } = ctx()
    await store.putNode(makeNode('a', { type: 'p', content: 'A', props: { 'data-doc-head': true } }))
    const before = JSON.stringify(store.listNodes())
    const ops: BatchOp[] = [
      { op: 'setType', nodeId: 'a', type: 'h2' },
      { op: 'setProps', nodeId: 'a', props: { extra: true } },
    ]
    await store.applyBatch(ops)
    await store.undo()
    expect(JSON.stringify(store.listNodes())).toBe(before)
  })
})
