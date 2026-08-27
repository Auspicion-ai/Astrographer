// tests/edit-adversarial.test.ts — Unit D adversarial-fix regression tests.
// Each test pins a HOST finding fixed in this pass (docs/specs/unit-d-editing.md
// §3a). The findings are fixed in src/ (edit-ops.ts, edit-controller.ts,
// mcp-server.ts) and each is regression-tested here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
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
import {
  createEditController,
  type EditController,
  type EditControllerOptions,
  type CommitResult,
} from '../src/renderer/edit-controller.js'
import { handleEditTool, type RagStoreChangedPayload } from '../src/main/mcp-server.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-adv-'))
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

function makeController(
  backRefs: Map<string, string[]>,
  commit: (nodeId: string, content: string) => Promise<CommitResult>,
  onRebuild: () => void = () => {},
): EditController {
  const opts: EditControllerOptions = { backRefs, commit, onRebuild }
  return createEditController(opts)
}

/** Write a store file containing a node whose stored hash does NOT match the
 *  derived hash → the store quarantines it on boot (kept, never loaded). */
function writeQuarantinedStore(dir: string): string {
  const path = join(dir, 'rag.json')
  const now = new Date().toISOString()
  const file = {
    version: 1,
    nodes: [
      { id: 'q1', type: 'p', content: 'quarantined', ownedNodeIds: [], createdAt: now, updatedAt: now, hash: 'wrong-hash' },
    ],
    edges: [],
    journal: [],
    cursor: 0,
  }
  writeFileSync(path, JSON.stringify(file))
  return path
}

// ===========================================================================
// edit-ops.ts — H4, M1, M2, M3, L1, L2, L3, L4
// ===========================================================================

describe('edit-ops adversarial fixes (H4/M1/M2/M3/L1/L2/L3/L4)', () => {
  it('H4 — mergeNode with target as a descendant of source returns a domain result (no throw, no partial mutation)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('source'))
      await store.putNode(makeNode('child'))
      await store.putNode(makeNode('target'))
      await store.putEdge(makeEdge('e1', 'source', 'child'))
      await store.putEdge(makeEdge('e2', 'child', 'target'))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node into its own subtree' })
      // no partial mutation: target content unchanged, source NOT deleted
      expect(store.getNode('target')!.content).toBe('content-target')
      expect(store.getNode('source')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H4 — mergeNode with target as a doc-child of source returns the same domain result', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('source'))
      await store.putNode(makeNode('target'))
      await store.putEdge(makeEdge('e1', 'source', 'target', { kind: 'doc-child', order: 0 }))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result).toEqual({ ok: false, error: 'edit.merge_node: cannot merge a node into its own subtree' })
      expect(store.getNode('source')).toBeDefined()
      expect(store.getNode('target')!.content).toBe('content-target')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M1 — setEdge with a non-array documentIds returns a domain result (no uncaught store error)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'next-section', source: 'n1', target: 'n2', documentIds: 'not-an-array' as never })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: documentIds must be a string array' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M2 — createNode with a non-string content returns a domain result (no uncaught store error)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await createNode({ store }, { type: 'p', content: 42 as never })
      expect(result).toEqual({ ok: false, error: 'edit.create_node: content must be a string' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M3 — setEdge with a non-number order on a doc-child returns a domain result (no uncaught store error)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await setEdge({ store }, { kind: 'doc-child', source: 'n1', target: 'n2', order: 'x' as never })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: order must be a number' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('L1 — deleteNode on a quarantined node is a no-op (removed:false, node NOT physically removed)', async () => {
    const dir = freshDir()
    try {
      const path = writeQuarantinedStore(dir)
      const store: RagStore = createJsonRagStore({ path })
      // the node is quarantined → getNode returns undefined, status lists it
      expect(store.getNode('q1')).toBeUndefined()
      expect(store.status().quarantined).toContain('q1')
      const result = await deleteNode({ store }, { nodeId: 'q1' })
      expect(result).toEqual({ ok: true, removed: false })
      // the node is NOT physically removed — still present in the file
      const file = JSON.parse(readFileSync(path, 'utf8'))
      expect(file.nodes.some((n: { id: string }) => n.id === 'q1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('L2 — splitNode copies the original props onto the new node', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world', props: { color: 'red', level: 2 } }))
      const result = await splitNode({ store }, { nodeId: 'n1', at: 5 })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.nodes[1].props).toEqual({ color: 'red', level: 2 })
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('L3 — splitNode doc-child order is max(existing doc-child orders) + 1 (non-contiguous orders do not collide)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      await store.putNode(makeNode('c1'))
      await store.putNode(makeNode('c2'))
      await store.putEdge(makeEdge('e1', 'n1', 'c1', { kind: 'doc-child', order: 0 }))
      await store.putEdge(makeEdge('e2', 'n1', 'c2', { kind: 'doc-child', order: 5 }))
      const result = await splitNode({ store }, { nodeId: 'n1', at: 5 })
      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.edge.order).toBe(6) // max(0,5) + 1
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('L4 — mergeNode skips creating a duplicate parent-child edge when target already has the child', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target'))
      await store.putNode(makeNode('source'))
      await store.putNode(makeNode('child'))
      await store.putEdge(makeEdge('e1', 'target', 'child'))
      await store.putEdge(makeEdge('e2', 'source', 'child'))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result.ok).toBe(true)
      const edges = store.listEdges().filter((e) => e.kind === 'parent-child' && e.source === 'target' && e.target === 'child')
      expect(edges).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('L4 — mergeNode skips creating a duplicate doc-child edge when target already has the child', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target'))
      await store.putNode(makeNode('source'))
      await store.putNode(makeNode('child'))
      await store.putEdge(makeEdge('e1', 'target', 'child', { kind: 'doc-child', order: 0 }))
      await store.putEdge(makeEdge('e2', 'source', 'child', { kind: 'doc-child', order: 0 }))
      const result = await mergeNode({ store }, { sourceId: 'source', targetId: 'target' })
      expect(result.ok).toBe(true)
      const edges = store.listEdges().filter((e) => e.kind === 'doc-child' && e.source === 'target' && e.target === 'child')
      expect(edges).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// edit-controller.ts — M9, L5, L6
// ===========================================================================

describe('edit-controller adversarial fixes (M9/L5/L6)', () => {
  it('M9 — commit on a non-editable (dangling back-reference) node refuses WITHOUT calling the injected commit', async () => {
    let called = false
    const commit: (n: string, c: string) => Promise<CommitResult> = async () => {
      called = true
      return { ok: true, nodeId: 'n1' }
    }
    const backRefs = new Map<string, string[]>()
    const controller = makeController(backRefs, commit)
    const result: CommitResult = await controller.commit('n1', 'x')
    expect(result).toEqual({ ok: false, reason: 'deleted-node' })
    expect(called).toBe(false) // the IPC is NOT sent
  })

  it('M9 — commit on an editable node delegates to the injected commit', async () => {
    let called = false
    const commit: (n: string, c: string) => Promise<CommitResult> = async (n) => {
      called = true
      return { ok: true, nodeId: n }
    }
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, commit)
    const result: CommitResult = await controller.commit('n1', 'x')
    expect(result).toEqual({ ok: true, nodeId: 'n1' })
    expect(called).toBe(true)
  })

  it('M9 — commit on an editable node surfaces a store-error from the injected commit', async () => {
    const commit: (n: string, c: string) => Promise<CommitResult> = async () =>
      ({ ok: false, reason: 'store-error', error: 'disk full' })
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, commit)
    const result: CommitResult = await controller.commit('n1', 'x')
    expect(result).toEqual({ ok: false, reason: 'store-error', error: 'disk full' })
  })

  it('L5 — restoreCaret on a dangling node clears the saved caret (a later re-created node does not restore a stale caret)', () => {
    const backRefs = new Map<string, string[]>()
    const controller = makeController(backRefs, async (n) => ({ ok: true, nodeId: n }))
    controller.saveCaret('n1', { offset: 2, focused: true })
    expect(controller.restoreCaret('n1')).toBeUndefined() // dangling → cleared
    // the node is re-created (its id is a backRefs key again) → no stale caret
    backRefs.set('n1', ['provident-n1'])
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('L6 — commit clears the dirty flag on success (which may trigger a queued rebuild)', async () => {
    let rebuilds = 0
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, async (n) => ({ ok: true, nodeId: n }), () => { rebuilds++ })
    controller.markDirty('n1')
    controller.requestRebuild() // queued (dirty-edit guard)
    expect(controller.hasQueuedRebuild()).toBe(true)
    await controller.commit('n1', 'x') // success → clears dirty → queued rebuild executes
    expect(controller.isDirty('n1')).toBe(false)
    expect(controller.hasQueuedRebuild()).toBe(false)
    expect(rebuilds).toBe(1)
  })
})

// ===========================================================================
// mcp-server.ts handleEditTool — H1, H2, H3, M4, M5, M6, M7, H5
// ===========================================================================

describe('handleEditTool adversarial fixes (H1/H2/H3/M4/M5/M6/M7/H5)', () => {
  it('H1 — edit.set_content calls the setContent op and returns its JSON result (not inline logic)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const result = await handleEditTool(store, 'edit.set_content', { nodeId: 'n1', content: 'world' })
      expect(result).toEqual({ ok: true, node: expect.objectContaining({ id: 'n1', content: 'world' }) })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H1 — edit.create_node calls the createNode op and returns its JSON result (with the parent-child edge)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('parent'))
      const result = await handleEditTool(store, 'edit.create_node', { type: 'p', content: 'child', parentId: 'parent' })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const newId = result.node.id
        expect(store.getNode(newId)).toBeDefined()
        const edges = store.listEdges()
        expect(edges.some((e) => e.kind === 'parent-child' && e.source === 'parent' && e.target === newId)).toBe(true)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H1 — edit.set_content on a nonexistent node returns the op result (not a throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await handleEditTool(store, 'edit.set_content', { nodeId: 'ghost', content: 'x' })
      expect(result).toEqual({ ok: false, error: 'edit.set_content: node not found' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H2 — edit.split_node creates a doc-child edge (the tail node is not orphaned)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const result = await handleEditTool(store, 'edit.split_node', { nodeId: 'n1', at: 5 })
      expect(result.ok).toBe(true)
      if (result.ok) {
        const [, fresh] = result.nodes
        expect(result.edge.kind).toBe('doc-child')
        expect(result.edge.source).toBe('n1')
        expect(result.edge.target).toBe(fresh.id)
        expect(store.getNode(fresh.id)).toBeDefined() // not orphaned
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H3 — edit.merge_node re-parents source children to target and deletes source', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('target', { content: 'T' }))
      await store.putNode(makeNode('source', { content: 'S' }))
      await store.putNode(makeNode('child'))
      await store.putEdge(makeEdge('e1', 'source', 'child'))
      const result = await handleEditTool(store, 'edit.merge_node', { sourceId: 'source', targetId: 'target' })
      expect(result.ok).toBe(true)
      const edges = store.listEdges()
      expect(edges.some((e) => e.kind === 'parent-child' && e.source === 'target' && e.target === 'child')).toBe(true)
      expect(store.getNode('source')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M4 — edit.set_edge with a nonexistent edgeId returns "edge not found" (does not create a new edge)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const result = await handleEditTool(store, 'edit.set_edge', { kind: 'parent-child', source: 'n1', target: 'n2', edgeId: 'ghost' })
      expect(result).toEqual({ ok: false, error: 'edit.set_edge: edge not found' })
      expect(store.listEdges()).toHaveLength(0) // no new edge created
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M5 — edit.split_node validates the at bounds (invalid offset → domain result)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const result = await handleEditTool(store, 'edit.split_node', { nodeId: 'n1', at: 0 })
      expect(result).toEqual({ ok: false, error: 'edit.split_node: invalid offset' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M6 — edit.create_node validates the type (invalid type → domain result)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = await handleEditTool(store, 'edit.create_node', { type: 'bogus', content: 'x' })
      expect(result).toEqual({ ok: false, error: 'edit.create_node: invalid type' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('M7 — edit.set_edge validates kind/self-reference/order-on-non-doc-child (domain results)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      expect(await handleEditTool(store, 'edit.set_edge', { kind: 'bogus', source: 'n1', target: 'n2' })).toEqual({ ok: false, error: 'edit.set_edge: invalid kind' })
      expect(await handleEditTool(store, 'edit.set_edge', { kind: 'parent-child', source: 'n1', target: 'n1' })).toEqual({ ok: false, error: 'edit.set_edge: self-referential edge' })
      expect(await handleEditTool(store, 'edit.set_edge', { kind: 'parent-child', source: 'n1', target: 'n2', order: 1 })).toEqual({ ok: false, error: 'edit.set_edge: order only valid on doc-child' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H5 — edit.set_content broadcasts a content rag-store-changed payload on success', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const payloads: RagStoreChangedPayload[] = []
      await handleEditTool(store, 'edit.set_content', { nodeId: 'n1', content: 'world' }, (p) => payloads.push(p))
      expect(payloads).toEqual([{ kind: 'content', nodeIds: ['n1'], edgeIds: [] }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H5 — edit.split_node broadcasts a structural rag-store-changed payload (nodeIds + edgeIds)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello world' }))
      const payloads: RagStoreChangedPayload[] = []
      await handleEditTool(store, 'edit.split_node', { nodeId: 'n1', at: 5 }, (p) => payloads.push(p))
      expect(payloads).toHaveLength(1)
      expect(payloads[0].kind).toBe('structural')
      expect(payloads[0].nodeIds).toContain('n1')
      expect(payloads[0].edgeIds).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H5 — no rag-store-changed broadcast on a failed mutation', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const payloads: RagStoreChangedPayload[] = []
      await handleEditTool(store, 'edit.set_content', { nodeId: 'ghost', content: 'x' }, (p) => payloads.push(p))
      expect(payloads).toHaveLength(0)
    } finally {
      rmSyncSafe(dir)
    }
  })
})
