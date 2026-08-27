// tests/edit-ops.test.ts — Unit D: the edit ops (src/main/edit-ops.ts)
// (docs/specs/unit-d-editing.md §5.1, §5.8 happy paths 1-9, §5.9 fail-states
// 1-13). The ops are pure async functions over the RagStore INTERFACE (Unit A
// §5.4 — SOURCE-SWITCHABLE), so they are tested against the concrete JSON store
// (createJsonRagStore) exactly as the MCP handlers use them. All store mutating
// methods are queue-serialized and async, so every op call is awaited.
//
// RED: src/main/edit-ops.ts does not exist yet — this file fails to load until
// the module is implemented.
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
  setContent,
  createNode,
  deleteNode,
  splitNode,
  mergeNode,
  setEdge,
  type EditOpContext,
} from '../src/main/edit-ops.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-'))
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

describe('edit-ops — Unit D editing write-back (unit-d-editing.md §5.1/§5.8/§5.9)', () => {
  it('RED — edit-ops module is not exported yet', () => {
    expect(typeof setContent).toBe('function')
  })

  // =========================================================================
  // §5.8 HAPPY-PATH STATES (1-9)
  // =========================================================================

  it('1. setContent happy: updates content, journals a content entry, returns { ok: true, node }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const ctx: EditOpContext = { store }
      const result = await setContent(ctx, { nodeId: 'n1', content: 'world' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.node.id).toBe('n1')
        expect(result.node.content).toBe('world')
      }
      expect(store.getNode('n1')!.content).toBe('world')
      // createdAt preserved, updatedAt refreshed
      expect(store.getNode('n1')!.createdAt).toBeDefined()
      // a content edit journals a `content` entry (Unit A §5.6)
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'content' && e.nodeId === 'n1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. createNode happy (no parent): creates a node, journals a node-add entry, returns { ok: true, node }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await createNode({ store }, { type: 'p', content: 'hello' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.node.type).toBe('p')
        expect(result.node.content).toBe('hello')
        expect(result.node.ownedNodeIds).toEqual([])
        expect(store.getNode(result.node.id)).toBeDefined()
      }
      // no parentId → no parent-child edge (not orphaned, but no family edge)
      expect(store.listEdges()).toEqual([])
      // a structural node-add entry
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'structural' && e.op.op === 'node-add')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. createNode happy (with parent): creates a node + a parent-child edge (source=parentId, target=new node)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('parent'))
      const result = await createNode({ store }, { type: 'p', content: 'child', parentId: 'parent' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const newId = result.node.id
        expect(store.getNode(newId)).toBeDefined()
        const edges = store.listEdges()
        expect(edges).toHaveLength(1)
        expect(edges[0].kind).toBe('parent-child')
        expect(edges[0].source).toBe('parent')
        expect(edges[0].target).toBe(newId)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. deleteNode happy: deletes the node + cascades its edges, journals a node-delete entry, returns { ok: true, removed: true }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const result = await deleteNode({ store }, { nodeId: 'n1' })
      expect(result).toEqual({ ok: true, removed: true })
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getEdge('e1')).toBeUndefined() // cascade
      expect(store.getNode('n2')).toBeDefined() // unrelated node survives
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'structural' && e.op.op === 'node-delete')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. deleteNode nonexistent: returns { ok: true, removed: false } (a no-op, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await deleteNode({ store }, { nodeId: 'ghost' })
      expect(result).toEqual({ ok: true, removed: false })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. splitNode happy: truncates original to content[0..at], creates a new node with content[at..] (same type), creates a doc-child edge (order=end)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const result = await splitNode({ store }, { nodeId: 'n1', at: 5 })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const [original, fresh] = result.nodes
        expect(original.id).toBe('n1')
        expect(original.content).toBe('hello')
        expect(fresh.content).toBe(' world')
        expect(fresh.type).toBe('p') // same type as original
        expect(fresh.ownedNodeIds).toEqual([])
        expect(result.edge.kind).toBe('doc-child')
        expect(result.edge.source).toBe('n1')
        expect(result.edge.target).toBe(fresh.id)
        expect(result.edge.order).toBe(0) // no existing doc-children → appended at end
        expect(store.getNode(fresh.id)).toBeDefined()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. mergeNode happy: concatenates target content, re-parents source children, transfers next-section, deletes source', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target', { content: 'T' }))
      await store.putNode(makeNode('source', { content: 'S' }))
      await store.putNode(makeNode('child'))
      await store.putNode(makeNode('next'))
      // source is parent of child; source's next section is 'next'
      await store.putEdge(makeEdge('e1', 'source', 'child'))
      await store.putEdge(makeEdge('e2', 'source', 'next', { kind: 'next-section', documentIds: ['doc1'] }))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.target.id).toBe('target')
        expect(result.target.content).toBe('TS')
      }
      // source deleted
      expect(store.getNode('source')).toBeUndefined()
      const edges = store.listEdges()
      // child re-parented to target
      expect(edges.some((e) => e.kind === 'parent-child' && e.source === 'target' && e.target === 'child')).toBe(true)
      expect(edges.some((e) => e.kind === 'parent-child' && e.source === 'source')).toBe(false)
      // next-section transferred to target (target had none in the document)
      expect(edges.some((e) => e.kind === 'next-section' && e.source === 'target' && e.target === 'next')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. setEdge happy (create): creates a new edge, returns { ok: true, edge }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'n2' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.edge.kind).toBe('parent-child')
        expect(result.edge.source).toBe('n1')
        expect(result.edge.target).toBe('n2')
        expect(store.getEdge(result.edge.id)).toBeDefined()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. setEdge happy (update): with an edgeId updates the edge, returns { ok: true, edge }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putNode(makeNode('n3'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const result = await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'n3', edgeId: 'e1' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.edge.id).toBe('e1')
        expect(result.edge.target).toBe('n3')
      }
      expect(store.getEdge('e1')!.target).toBe('n3')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // §5.9 FAIL-STATES (1-13)
  // =========================================================================

  it('1. setContent nonexistent node → { ok: false, error: "edit.set_content: node not found" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await setContent({ store }, { nodeId: 'ghost', content: 'x' })
      expect(result).toEqual({ ok: false, error: 'edit.set_content: node not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. setContent non-string content → { ok: false, error: "edit.set_content: content must be a string" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await setContent({ store }, { nodeId: 'n1', content: 42 as never })
      expect(result).toEqual({ ok: false, error: 'edit.set_content: content must be a string' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. createNode invalid type → { ok: false, error: "edit.create_node: invalid type" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await createNode({ store }, { type: 'bogus', content: 'x' })
      expect(result).toEqual({ ok: false, error: 'edit.create_node: invalid type' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. createNode nonexistent parent → { ok: false, error: "edit.create_node: parent not found" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await createNode({ store }, { type: 'p', content: 'x', parentId: 'ghost' })
      expect(result).toEqual({ ok: false, error: 'edit.create_node: parent not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. splitNode nonexistent node → { ok: false, error: "edit.split_node: node not found" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await splitNode({ store }, { nodeId: 'ghost', at: 1 })
      expect(result).toEqual({ ok: false, error: 'edit.split_node: node not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. splitNode invalid offset → { ok: false, error: "edit.split_node: invalid offset" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      // at < 1
      expect(await splitNode({ store }, { nodeId: 'n1', at: 0 })).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
      // at >= content.length
      expect(await splitNode({ store }, { nodeId: 'n1', at: 5 })).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
      // at negative
      expect(await splitNode({ store }, { nodeId: 'n1', at: -1 })).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
      // at non-integer
      expect(await splitNode({ store }, { nodeId: 'n1', at: 1.5 })).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
      // empty content → no valid at exists
      await store.putNode(makeNode('n2', { content: '' }))
      expect(await splitNode({ store }, { nodeId: 'n2', at: 1 })).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. mergeNode nonexistent source/target → { ok: false, error: "edit.merge_node: source/target not found" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target'))
      expect(await mergeNode({ store }, { sourceId: 'ghost', targetId: 'target' })).toEqual({ ok: false, error: 'edit.merge_node: source/target not found' })
      expect(await mergeNode({ store }, { sourceId: 'target', targetId: 'ghost' })).toEqual({ ok: false, error: 'edit.merge_node: source/target not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. mergeNode self-merge → { ok: false, error: "edit.merge_node: cannot merge a node into itself" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await mergeNode({ store }, { sourceId: 'n1', targetId: 'n1' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node into itself' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. setEdge invalid kind → { ok: false, error: "edit.set_edge: invalid kind" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'bogus', source: 'n1', target: 'n2' })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: invalid kind' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. setEdge nonexistent source/target → { ok: false, error: "edit.set_edge: source/target node not found or quarantined" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      expect(await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'ghost' })).toEqual({ ok: false, error: 'edit.set_edge: source/target node not found or quarantined' })
      expect(await setEdge({ store }, { kind: 'parent-child', source: 'ghost', target: 'n1' })).toEqual({ ok: false, error: 'edit.set_edge: source/target node not found or quarantined' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. setEdge self-referential → { ok: false, error: "edit.set_edge: self-referential edge" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'n1' })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: self-referential edge' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. setEdge order on non-doc-child → { ok: false, error: "edit.set_edge: order only valid on doc-child" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'n2', order: 1 })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: order only valid on doc-child' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. setEdge nonexistent edgeId (update) → { ok: false, error: "edit.set_edge: edge not found" }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'parent-child', source: 'n1', target: 'n2', edgeId: 'ghost' })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: edge not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })
})
