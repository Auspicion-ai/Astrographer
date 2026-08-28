// tests/unit-o-edit-ops.test.ts — Unit O: the rich-text edit ops
// (setProps/setSubtree/setType) — docs/specs/unit-o-edit-ops.md §5.7 happy-path
// states (10) + §5.8 fail-states (8).
//
// This is the TestWriter RED set — the Unit O amendment does NOT exist yet:
//
//   - `src/main/edit-ops.ts` does NOT export `setProps`/`setSubtree`/`setType`
//     (only the 6 existing ops: setContent/createNode/deleteNode/splitNode/
//     mergeNode/setEdge — the census is 6, not 9).
//   - The `SetPropsResult`/`SetSubtreeResult`/`SetTypeResult` result types are
//     NOT exported.
//
// The tests are derived from the spec ALONE (§5.7/§5.8). The ops are pure async
// functions over the RagStore INTERFACE (Unit A §5.4 — SOURCE-SWITCHABLE), so
// they are tested against the concrete JSON store (createJsonRagStore) exactly
// as the MCP handlers use them. All store mutating methods are queue-serialized
// and async, so every op call is awaited.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'
import {
  setProps,
  setSubtree,
  setType,
  type EditOpContext,
  type SetPropsResult,
  type SetSubtreeResult,
  type SetTypeResult,
} from '../src/main/edit-ops.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-o-'))
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
// §5.7 HAPPY-PATH STATES (10)
// ===========================================================================
describe('edit-ops — Unit O rich-text ops (§5.7 happy-path states)', () => {
  it('RED — setProps/setSubtree/setType are not exported yet', () => {
    expect(typeof setProps).toBe('function')
    expect(typeof setSubtree).toBe('function')
    expect(typeof setType).toBe('function')
  })

  it('1. setProps merge happy: preserves data-doc-head + b, adds a; journals a content entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { 'data-doc-head': true, b: 2 } }))
      const ctx: EditOpContext = { store }
      const result = expectOk(await setProps(ctx, { nodeId: 'n1', props: { a: 1 } }))
      expect(result.node.id).toBe('n1')
      expect(result.node.props).toEqual({ 'data-doc-head': true, b: 2, a: 1 })
      // the store reflects the merge
      expect(store.getNode('n1')!.props).toEqual({ 'data-doc-head': true, b: 2, a: 1 })
      // a content edit journals a `content` entry (Unit A §5.6) → re-traversal
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'content' && e.nodeId === 'n1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. setProps on a node with no props: new props is exactly params.props', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1')) // props undefined
      const result = expectOk(await setProps({ store }, { nodeId: 'n1', props: { a: 1 } }))
      expect(result.node.props).toEqual({ a: 1 })
      expect(store.getNode('n1')!.props).toEqual({ a: 1 })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. setProps empty props: ok, props unchanged; a no-op (no write, no journal entry)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { 'data-doc-head': true, b: 2 } }))
      const before = store.getNode('n1')!.props
      const journalBefore = store.journal().length
      const result = expectOk(await setProps({ store }, { nodeId: 'n1', props: {} }))
      expect(result.node.props).toEqual(before)
      expect(store.getNode('n1')!.props).toEqual(before)
      // no-op: no write (updatedAt unchanged) and no journal entry
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. setSubtree replace happy: prior children GONE (full replace); journals a content entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const result = expectOk(await setSubtree({ store }, { nodeId: 'n1', children: [{ type: 'em', content: 'new' }] }))
      expect(result.node.children).toEqual([{ type: 'em', content: 'new' }])
      // the prior children are GONE — a full replace, no merge/append
      expect(store.getNode('n1')!.children).toEqual([{ type: 'em', content: 'new' }])
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'content' && e.nodeId === 'n1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. setSubtree empty children: ok, children is [] (equivalent to no inline children)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const result = expectOk(await setSubtree({ store }, { nodeId: 'n1', children: [] }))
      expect(result.node.children).toEqual([])
      expect(store.getNode('n1')!.children).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. setSubtree on a node with no children: new array set, child props intact', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1')) // children undefined
      const result = expectOk(await setSubtree({ store }, { nodeId: 'n1', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }))
      expect(result.node.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
      expect(store.getNode('n1')!.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. setType happy: type changes to h1; id/content/children/props/ownedNodeIds UNCHANGED (node id STABLE); journals a structural node-update entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', {
        type: 'p',
        content: 'text',
        children: [{ type: 'strong', content: 'bold' }],
        props: { 'data-doc-head': true },
        ownedNodeIds: ['n2'],
      }))
      const result = expectOk(await setType({ store }, { nodeId: 'n1', type: 'h1' }))
      expect(result.node.id).toBe('n1') // node id STABLE — no delete+create
      expect(result.node.type).toBe('h1')
      expect(result.node.content).toBe('text')
      expect(result.node.children).toEqual([{ type: 'strong', content: 'bold' }])
      expect(result.node.props).toEqual({ 'data-doc-head': true })
      expect(result.node.ownedNodeIds).toEqual(['n2'])
      // the store reflects the type change; everything else preserved
      const stored = store.getNode('n1')!
      expect(stored.type).toBe('h1')
      expect(stored.content).toBe('text')
      expect(stored.children).toEqual([{ type: 'strong', content: 'bold' }])
      expect(stored.props).toEqual({ 'data-doc-head': true })
      expect(stored.ownedNodeIds).toEqual(['n2'])
      // a structural node-update entry (Unit A §5.6) → re-traversal
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'structural' && e.op.op === 'node-update')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. setType to the same type: ok, node unchanged; a no-op (no write, no journal entry)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { type: 'p', content: 'text' }))
      const journalBefore = store.journal().length
      const result = expectOk(await setType({ store }, { nodeId: 'n1', type: 'p' }))
      expect(result.node.type).toBe('p')
      expect(result.node.content).toBe('text')
      expect(store.getNode('n1')!.type).toBe('p')
      // no-op: no write (updatedAt unchanged) and no journal entry
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. atomicity happy: each op applies as a single atomic edit — getNode reflects the FULL change; journal has ONE new entry; undoDepth +1', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { b: 2 }, children: [{ type: 'strong', content: 'old' }] }))
      const ctx: EditOpContext = { store }

      // setProps — one atomic edit
      const j0 = store.journal().length
      const d0 = store.undoDepth()
      expectOk(await setProps(ctx, { nodeId: 'n1', props: { a: 1 } }))
      expect(store.getNode('n1')!.props).toEqual({ b: 2, a: 1 }) // FULL change
      expect(store.journal().length).toBe(j0 + 1) // ONE new entry
      expect(store.undoDepth()).toBe(d0 + 1)

      // setSubtree — one atomic edit
      const j1 = store.journal().length
      const d1 = store.undoDepth()
      expectOk(await setSubtree(ctx, { nodeId: 'n1', children: [{ type: 'em', content: 'new' }] }))
      expect(store.getNode('n1')!.children).toEqual([{ type: 'em', content: 'new' }]) // FULL change
      expect(store.journal().length).toBe(j1 + 1) // ONE new entry
      expect(store.undoDepth()).toBe(d1 + 1)

      // setType — one atomic edit
      const j2 = store.journal().length
      const d2 = store.undoDepth()
      expectOk(await setType(ctx, { nodeId: 'n1', type: 'h1' }))
      expect(store.getNode('n1')!.type).toBe('h1') // FULL change
      expect(store.journal().length).toBe(j2 + 1) // ONE new entry
      expect(store.undoDepth()).toBe(d2 + 1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. MCP/UI equivalence happy: the same op with the same params produces the same store state (the op is the single source of truth)', async () => {
    const dir = freshDir()
    try {
      // Two independent stores, same initial node, same op+params → identical
      // resulting store state (the MCP tool and the UI path both route through
      // the SAME op — §5.6 BINDING).
      const storeA: RagStore = createJsonRagStore({ path: join(dir, 'a.json') })
      const storeB: RagStore = createJsonRagStore({ path: join(dir, 'b.json') })
      await storeA.putNode(makeNode('n1', { props: { 'data-doc-head': true } }))
      await storeB.putNode(makeNode('n1', { props: { 'data-doc-head': true } }))

      const ra = expectOk(await setProps({ store: storeA }, { nodeId: 'n1', props: { a: 1 } }))
      const rb = expectOk(await setProps({ store: storeB }, { nodeId: 'n1', props: { a: 1 } }))
      expect(ra.node.props).toEqual(rb.node.props)
      expect(storeA.getNode('n1')!.props).toEqual(storeB.getNode('n1')!.props)

      const sa = expectOk(await setSubtree({ store: storeA }, { nodeId: 'n1', children: [{ type: 'em', content: 'x' }] }))
      const sb = expectOk(await setSubtree({ store: storeB }, { nodeId: 'n1', children: [{ type: 'em', content: 'x' }] }))
      expect(sa.node.children).toEqual(sb.node.children)
      expect(storeA.getNode('n1')!.children).toEqual(storeB.getNode('n1')!.children)

      const ta = expectOk(await setType({ store: storeA }, { nodeId: 'n1', type: 'h1' }))
      const tb = expectOk(await setType({ store: storeB }, { nodeId: 'n1', type: 'h1' }))
      expect(ta.node.type).toBe(tb.node.type)
      expect(storeA.getNode('n1')!.type).toBe(storeB.getNode('n1')!.type)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.8 FAIL-STATES (8)
// ===========================================================================
describe('edit-ops — Unit O rich-text ops (§5.8 fail-states)', () => {
  it('1. setProps nonexistent node → { ok: false, error: "edit.set_props: node not found" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await setProps({ store }, { nodeId: 'ghost', props: { a: 1 } }))
      expect(result.error).toBe('edit.set_props: node not found')
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. setProps non-object props (string/number/boolean/null/array) → { ok: false, error: "edit.set_props: props must be an object" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { b: 2 } }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      for (const bad of ['x', 42, true, null, [1, 2]]) {
        const result = expectFail(await setProps(ctx, { nodeId: 'n1', props: bad as never }))
        expect(result.error).toBe('edit.set_props: props must be an object')
      }
      // store unchanged — the failed op added no journal entry
      expect(store.getNode('n1')!.props).toEqual({ b: 2 })
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. setProps dangerous-key props (__proto__/constructor/prototype) → { ok: false, error: "edit.set_props: props contains a dangerous key" }; store unchanged (no pollution)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { b: 2 } }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      // a real own `__proto__` key (an object literal would set the prototype)
      const protoProps = JSON.parse('{"__proto__": {}}')
      for (const bad of [protoProps, { constructor: {} }, { prototype: {} }]) {
        const result = expectFail(await setProps(ctx, { nodeId: 'n1', props: bad as never }))
        expect(result.error).toBe('edit.set_props: props contains a dangerous key')
      }
      // store unchanged — no uncaught store throw, no pollution; the failed op added no journal entry
      expect(store.getNode('n1')!.props).toEqual({ b: 2 })
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. setSubtree nonexistent node → { ok: false, error: "edit.set_subtree: node not found" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await setSubtree({ store }, { nodeId: 'ghost', children: [] }))
      expect(result.error).toBe('edit.set_subtree: node not found')
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. setSubtree malformed children (non-array: object/string/number) → { ok: false, error: "edit.set_subtree: children required/invalid" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      for (const bad of [{}, 'x', 42]) {
        const result = expectFail(await setSubtree(ctx, { nodeId: 'n1', children: bad as never }))
        expect(result.error).toBe('edit.set_subtree: children required/invalid')
      }
      // store unchanged — the failed op added no journal entry
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. setSubtree malformed children (invalid child: span/unknown/non-string type, missing/non-string content, null/array/non-object props, dangerous key) → { ok: false, error: "edit.set_subtree: children required/invalid" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      const badChildren: unknown[] = [
        [{ type: 'span', content: 'x' }], // span is NOT a child type
        [{ type: 'bogus', content: 'x' }], // unknown type
        [{ type: 42, content: 'x' }], // non-string type
        [{ type: 'strong' }], // missing content
        [{ type: 'strong', content: 42 }], // non-string content
        [{ type: 'strong', content: 'x', props: null }], // null props
        [{ type: 'strong', content: 'x', props: [1] }], // array props
        [{ type: 'strong', content: 'x', props: 'str' }], // non-object props
        [{ type: 'strong', content: 'x', props: JSON.parse('{"__proto__": {}}') }], // dangerous key in child props
        [{ type: 'strong', content: 'x', constructor: {} }], // dangerous key on the child itself
      ]
      for (const bad of badChildren) {
        const result = expectFail(await setSubtree(ctx, { nodeId: 'n1', children: bad as never }))
        expect(result.error).toBe('edit.set_subtree: children required/invalid')
      }
      // store unchanged — the failed op added no journal entry
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. setType nonexistent node → { ok: false, error: "edit.set_type: node not found" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await setType({ store }, { nodeId: 'ghost', type: 'h1' }))
      expect(result.error).toBe('edit.set_type: node not found')
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. setType invalid type (span/unknown/non-string) → { ok: false, error: "edit.set_type: invalid type" }; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { type: 'p', content: 'text' }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      for (const bad of ['span', 'bogus', 42, null]) {
        const result = expectFail(await setType(ctx, { nodeId: 'n1', type: bad as never }))
        expect(result.error).toBe('edit.set_type: invalid type')
      }
      // store unchanged — the failed op added no journal entry
      expect(store.getNode('n1')!.type).toBe('p')
      expect(store.getNode('n1')!.content).toBe('text')
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (Unit O §3a F1–F3)
// ===========================================================================
describe('edit-ops — Unit O adversarial regressions (§3a F1–F3)', () => {
  it('F1 — setProps empty merge on a node with props:undefined is a NO-OP (no write, no journal entry)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: undefined }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      const result = expectOk(await setProps(ctx, { nodeId: 'n1', props: {} }))
      expect(result.node.props).toBeUndefined()
      expect(store.getNode('n1')!.props).toBeUndefined()
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F2 — setSubtree with children:undefined is a fail-state (children required/invalid)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'old' }] }))
      const ctx: EditOpContext = { store }
      const journalBefore = store.journal().length
      const result = expectFail(await setSubtree(ctx, { nodeId: 'n1', children: undefined as never }))
      expect(result.error).toBe('edit.set_subtree: children required/invalid')
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'old' }])
      expect(store.journal().length).toBe(journalBefore)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F3a — setProps with props:undefined is a fail-state (props must be an object)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const ctx: EditOpContext = { store }
      const result = expectFail(await setProps(ctx, { nodeId: 'n1', props: undefined as never }))
      expect(result.error).toBe('edit.set_props: props must be an object')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F3b — each op on a quarantined node returns node not found', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // Author a store file with a tampered node (hash mismatch) so it is
      // quarantined at boot and invisible to getNode.
      const fs = await import('node:fs')
      const path = join(dir, 'rag.json')
      const now = new Date().toISOString()
      const node = { id: 'n1', type: 'p', content: 'x', ownedNodeIds: [], createdAt: now, updatedAt: now }
      fs.writeFileSync(path, JSON.stringify({ version: 1, nodes: [{ ...node, hash: 'tampered' }], edges: [], journal: [] }))
      const store2: RagStore = createJsonRagStore({ path })
      expect(store2.getNode('n1')).toBeUndefined()
      const ctx: EditOpContext = { store: store2 }
      expect((await setProps(ctx, { nodeId: 'n1', props: { a: 1 } })).ok).toBe(false)
      expect((await setSubtree(ctx, { nodeId: 'n1', children: [] })).ok).toBe(false)
      expect((await setType(ctx, { nodeId: 'n1', type: 'h1' })).ok).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })
})
