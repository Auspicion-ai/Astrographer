// tests/rag-store-adversarial.test.ts — Unit A: regression tests for the HOST
// findings fixed in src/main/rag-store.ts. Each test FAILS on the pre-fix
// behavior and PASSES on the fixed behavior.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-adv-'))
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

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

describe('RagStore — adversarial regression (HOST findings)', () => {
  it('queue serialization of direct mutations: concurrent putNode calls are serialized', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // Fire two direct mutations without awaiting — both must be serialized
      // through the single-writer queue and both must land.
      const p1 = store.putNode(makeNode('n1'))
      const p2 = store.putNode(makeNode('n2'))
      await Promise.all([p1, p2])
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n2')).toBeDefined()
      expect(store.listNodes()).toHaveLength(2)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('aliasing: mutating a returned node does not corrupt the store', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { props: { a: { b: 1 } }, ownedNodeIds: ['x'] }))
      const got = store.getNode('n1')!
      got.props!.a.b = 999
      got.props!.evil = 'injected'
      got.ownedNodeIds.push('y')
      got.content = 'mutated'
      const fresh = store.getNode('n1')!
      expect(fresh.props!.a.b).toBe(1)
      expect(fresh.props!.evil).toBeUndefined()
      expect(fresh.ownedNodeIds).toEqual(['x'])
      expect(fresh.content).toBe('content-n1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('aliasing: mutating a returned edge does not corrupt the store', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-head', documentIds: ['d1'] }))
      const got = store.getEdge('e1')!
      got.documentIds!.push('d2')
      got.source = 'n2'
      got.kind = 'doc-end'
      const fresh = store.getEdge('e1')!
      expect(fresh.documentIds).toEqual(['d1'])
      expect(fresh.source).toBe('n1')
      expect(fresh.kind).toBe('doc-head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('kind-change undo: a kind change is journaled and restored on undo', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'parent-child' }))
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-head' }))
      expect(store.getEdge('e1')!.kind).toBe('doc-head')
      await store.undo()
      expect(store.getEdge('e1')!.kind).toBe('parent-child')
      await store.redo()
      expect(store.getEdge('e1')!.kind).toBe('doc-head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('order-change undo: an order change is journaled and restored on undo', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-child', order: 1 }))
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-child', order: 2 }))
      expect(store.getEdge('e1')!.order).toBe(2)
      await store.undo()
      expect(store.getEdge('e1')!.order).toBe(1)
      await store.redo()
      expect(store.getEdge('e1')!.order).toBe(2)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('type-change undo: a type change is journaled and restored on undo', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { type: 'p' }))
      await store.putNode(makeNode('n1', { type: 'h1' }))
      expect(store.getNode('n1')!.type).toBe('h1')
      await store.undo()
      expect(store.getNode('n1')!.type).toBe('p')
      await store.redo()
      expect(store.getNode('n1')!.type).toBe('h1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('quarantined records are excluded from getNode/listNodes/getEdge/listEdges', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      // Tamper n1's content WITHOUT updating its stored hash → quarantined on boot.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const tampered = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      tampered.content = 'tampered!'
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().quarantined).toContain('n1')
      expect(reloaded.getNode('n1')).toBeUndefined()
      expect(reloaded.listNodes().map((n) => n.id)).not.toContain('n1')
      expect(reloaded.listNodes().map((n) => n.id)).toContain('n2')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('edge to a quarantined node is itself quarantined at boot; putEdge rejects quarantined endpoints', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      // Tamper n1 → quarantined on boot; e1 references n1 → must also be quarantined.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const tampered = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      tampered.content = 'tampered!'
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().quarantined).toContain('n1')
      expect(reloaded.status().quarantined).toContain('e1')
      expect(reloaded.getEdge('e1')).toBeUndefined()
      expect(reloaded.listEdges()).toEqual([])
      // putEdge referencing a quarantined endpoint rejects.
      await expect(reloaded.putEdge(makeEdge('e2', 'n1', 'n2'))).rejects.toThrow()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('malformed journal entries are skipped at boot; cursor is coerced to an integer', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      // Inject a malformed journal entry + a non-integer cursor.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      onDisk.journal.unshift({ kind: 'bogus', at: 'x' })
      onDisk.cursor = 1.7
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.journal()).toHaveLength(1) // malformed entry skipped
      expect(reloaded.undoDepth()).toBe(1) // cursor coerced to integer in [0, len]
      expect(reloaded.redoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('out-of-band record removal: undo does NOT advance the cursor (desync surfaced)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      await store.putNode(makeNode('n1', { content: 'world' }))
      // Out-of-band removal: delete n1 from the on-disk nodes array. The journal
      // still holds a content entry for n1, but the record is gone.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      onDisk.nodes = onDisk.nodes.filter((n: RagNode) => n.id !== 'n1')
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      const before = reloaded.undoDepth()
      const undone = await reloaded.undo()
      expect(undone).toBeNull() // desync surfaced, not silently swallowed
      expect(reloaded.undoDepth()).toBe(before) // cursor NOT advanced
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('per-kind enforcement: order only on doc-child; documentIds only on doc-flow kinds', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      // order on a non-doc-child kind → reject
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { order: 1 }))).rejects.toThrow()
      // order on doc-child → ok
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-child', order: 1 }))).resolves.toBeDefined()
      // documentIds on a non-doc-flow kind → reject
      await expect(store.putEdge(makeEdge('e2', 'n1', 'n2', { documentIds: ['d1'] }))).rejects.toThrow()
      // documentIds on a doc-flow kind → ok
      await expect(store.putEdge(makeEdge('e2', 'n1', 'n2', { kind: 'doc-head', documentIds: ['d1'] }))).resolves.toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('createdAt is preserved on update (only updatedAt refreshes)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const createdAt = store.getNode('n1')!.createdAt
      await store.putNode(makeNode('n1', { content: 'world', createdAt: '2000-01-01T00:00:00.000Z' }))
      expect(store.getNode('n1')!.createdAt).toBe(createdAt)
      expect(store.getNode('n1')!.content).toBe('world')

      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const edgeCreatedAt = store.getEdge('e1')!.createdAt
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { createdAt: '2000-01-01T00:00:00.000Z' }))
      expect(store.getEdge('e1')!.createdAt).toBe(edgeCreatedAt)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('self-referential edges (source === target) are rejected', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n1'))).rejects.toThrow()
      await expect(store.putEdge(makeEdge('e2', 'n1', 'n1', { kind: 'doc-child' }))).rejects.toThrow()
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('prototype-pollution via props keys is rejected on write', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { props: { ['__proto__']: { polluted: true } } }))).rejects.toThrow()
      await expect(store.putNode(makeNode('n1', { props: { constructor: { polluted: true } } }))).rejects.toThrow()
      await expect(store.putNode(makeNode('n1', { props: { prototype: { polluted: true } } }))).rejects.toThrow()
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('maxJournalLength bounds the journal: oldest entries dropped, undo past the base is a guarded no-op', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json'), maxJournalLength: 3 })
      // Perform enough writes to exceed the cap (4 writes > 3).
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putNode(makeNode('n3'))
      await store.putNode(makeNode('n4'))
      // Journal is bounded to the cap; the oldest entry (n1's node-add) is dropped.
      expect(store.journal()).toHaveLength(3)
      expect(store.undoDepth()).toBe(3)
      // Undo the 3 retained entries (n4, n3, n2) — each returns the inverted entry.
      expect(await store.undo()).not.toBeNull()
      expect(await store.undo()).not.toBeNull()
      expect(await store.undo()).not.toBeNull()
      // Undo past the dropped base is a guarded no-op returning null.
      expect(await store.undo()).toBeNull()
      expect(store.undoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('maxJournalLength defaults to 1000 when absent', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // 1001 writes exceed the default cap of 1000 → oldest dropped, journal bounded.
      for (let i = 0; i < 1001; i++) {
        await store.putNode(makeNode(`n${i}`))
      }
      expect(store.journal()).toHaveLength(1000)
      expect(store.undoDepth()).toBe(1000)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('ownedNodeIds/documentIds reject empty strings and dedupe duplicates', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // empty string in ownedNodeIds → reject
      await expect(store.putNode(makeNode('n1', { ownedNodeIds: [''] }))).rejects.toThrow()
      // duplicates in ownedNodeIds → deduped
      await store.putNode(makeNode('n1', { ownedNodeIds: ['a', 'a', 'b'] }))
      expect(store.getNode('n1')!.ownedNodeIds).toEqual(['a', 'b'])

      await store.putNode(makeNode('n2'))
      // empty string in documentIds → reject
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-head', documentIds: [''] }))).rejects.toThrow()
      // duplicates in documentIds → deduped
      await store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'doc-head', documentIds: ['d1', 'd1', 'd2'] }))
      expect(store.getEdge('e1')!.documentIds).toEqual(['d1', 'd2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('non-ISO-8601 createdAt/updatedAt is rejected at write time and skipped at boot', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      // putNode with a non-ISO createdAt/updatedAt → throws; store unchanged.
      await expect(store.putNode(makeNode('n1', { createdAt: 'not-a-date' }))).rejects.toThrow()
      await expect(store.putNode(makeNode('n1', { updatedAt: 'not-a-date' }))).rejects.toThrow()
      expect(store.listNodes()).toEqual([])

      // putEdge with a non-ISO createdAt/updatedAt → throws; store unchanged.
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { createdAt: 'not-a-date' }))).rejects.toThrow()
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { updatedAt: 'not-a-date' }))).rejects.toThrow()
      expect(store.listEdges()).toEqual([])

      // Boot-skip: a persisted node/edge with a non-ISO createdAt is skipped at
      // boot (never loaded), consistent with the shape-rule discipline.
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      onDisk.nodes.find((n: RagNode) => n.id === 'n1').createdAt = 'not-a-date'
      onDisk.edges.find((e: RagEdge) => e.id === 'e1').createdAt = 'not-a-date'
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.getNode('n1')).toBeUndefined()
      expect(reloaded.getEdge('e1')).toBeUndefined()
      expect(reloaded.listNodes().map((n) => n.id)).toContain('n2')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
