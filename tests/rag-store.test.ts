// tests/rag-store.test.ts — Unit A: the RAG store persistence module
// (docs/specs/unit-a-rag-store.md §5.8 happy-path states + §5.9 fail-states).
// Mirrors the module-store.test.ts conventions (temp dirs via node:fs, vitest
// node environment, `.js` import suffix for the main-process ESM module).
//
// The mutating methods (putNode/removeNode/putEdge/removeEdge/undo/redo) are
// async and route their work through the single-writer queue (§5.5), so every
// call is awaited here.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-'))
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
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

describe('RagStore — Unit A persistence (unit-a-rag-store.md §5.8/§5.9)', () => {
  it('RED — createJsonRagStore is not exported yet', () => {
    expect(typeof createJsonRagStore).toBe('function')
  })

  // =========================================================================
  // §5.8 HAPPY-PATH STATES (11)
  // =========================================================================

  it('1. fresh boot (missing file): not corrupt, empty loaded, no throw', () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(store.status()).toEqual({ corrupt: false, quarantined: [], loadedNodes: [], loadedEdges: [] })
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. node create: putNode returns the stored node; getNode/listNodes see it; file written atomically', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const node = makeNode('n1', { content: 'hello' })
      const returned = await store.putNode(node)
      expect(returned.id).toBe('n1')
      expect(returned.content).toBe('hello')
      expect(store.getNode('n1')).toBeDefined()
      expect(store.getNode('n1')!.content).toBe('hello')
      expect(store.listNodes()).toHaveLength(1)
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. node update: same id + new content replaces the node, refreshes updatedAt, records a content journal entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      const before = store.getNode('n1')!.updatedAt
      await store.putNode(makeNode('n1', { content: 'world' }))
      expect(store.getNode('n1')!.content).toBe('world')
      expect(store.getNode('n1')!.updatedAt).not.toBe(before)
      // a content edit records a `content` journal entry
      const entries = store.journal()
      expect(entries.some((e) => e.kind === 'content' && e.nodeId === 'n1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. edge create: putEdge returns the stored edge; getEdge/listEdges see it', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      const edge = makeEdge('e1', 'n1', 'n2')
      const returned = await store.putEdge(edge)
      expect(returned.id).toBe('e1')
      expect(store.getEdge('e1')).toBeDefined()
      expect(store.getEdge('e1')!.source).toBe('n1')
      expect(store.getEdge('e1')!.target).toBe('n2')
      expect(store.listEdges()).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. node remove cascade: removeNode removes the node AND any edge referencing it', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      expect(await store.removeNode('n1')).toBe(true)
      expect(store.getNode('n1')).toBeUndefined()
      expect(store.getEdge('e1')).toBeUndefined() // cascade
      expect(store.getNode('n2')).toBeDefined() // unrelated node survives
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. edge remove: removeEdge returns true and getEdge is undefined', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      expect(await store.removeEdge('e1')).toBe(true)
      expect(store.getEdge('e1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. queue serialization: two concurrent enqueue writes run in FIFO order', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const order: string[] = []
      const first = store.enqueue(async () => {
        await new Promise((r) => setTimeout(r, 20))
        order.push('first')
        // a direct mutation inside an enqueued write is itself serialized
        await store.putNode(makeNode('n1'))
      })
      const second = store.enqueue(async () => {
        order.push('second')
      })
      await Promise.all([first, second])
      expect(order).toEqual(['first', 'second'])
      // drain the queue so the nested putNode (enqueued after `second`) settles
      await store.enqueue(() => {})
      expect(store.getNode('n1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. content undo/redo: undo restores prior content/props; redo re-applies', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      await store.putNode(makeNode('n1', { content: 'world', props: { k: 'v' } }))
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('hello')
      expect(store.getNode('n1')!.props).toBeUndefined()
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.content).toBe('world')
      expect(store.getNode('n1')!.props).toEqual({ k: 'v' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. structural undo: after a node-add, undo removes the node (inverse); redo re-adds it', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      expect(store.undoDepth()).toBe(1)
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')).toBeUndefined() // inverse of node-add is node-delete
      expect(store.redoDepth()).toBe(1)
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')).toBeDefined() // re-applied node-add
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. boot with a valid file: all nodes/edges loaded, none quarantined', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await store.putEdge(makeEdge('e1', 'n1', 'n2'))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.status().loadedNodes).toEqual(expect.arrayContaining(['n1', 'n2']))
      expect(reloaded.status().loadedEdges).toEqual(['e1'])
      expect(reloaded.getNode('n1')).toBeDefined()
      expect(reloaded.getEdge('e1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. boot with a quarantined record: hash mismatch → quarantined, not loaded', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'hello' }))
      // Tamper the on-disk content WITHOUT updating the stored hash.
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const tampered = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      tampered.content = 'tampered!'
      writeFileSync(file, JSON.stringify(onDisk))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().quarantined).toContain('n1')
      expect(reloaded.status().loadedNodes).not.toContain('n1')
      expect(reloaded.status().loadedEdges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // §5.9 FAIL-STATES (11)
  // =========================================================================

  it('1. createJsonRagStore with null/undefined opts or empty path throws "rag store: path required"', () => {
    expect(() => createJsonRagStore(null as never)).toThrow('rag store: path required')
    expect(() => createJsonRagStore(undefined as never)).toThrow('rag store: path required')
    expect(() => createJsonRagStore({ path: '' })).toThrow('rag store: path required')
  })

  it('2. corrupt file boot: JSON.parse failure / non-object / non-1 version → corrupt:true, empty, never throws', () => {
    const dir = freshDir()
    try {
      // (a) invalid JSON
      const f1 = join(dir, 'bad-json.json')
      writeFileSync(f1, '{ not valid json !!!')
      expect(() => createJsonRagStore({ path: f1 })).not.toThrow()
      expect(createJsonRagStore({ path: f1 }).status().corrupt).toBe(true)
      expect(createJsonRagStore({ path: f1 }).status().loadedNodes).toEqual([])
      // (b) not an object (a bare array)
      const f2 = join(dir, 'not-object.json')
      writeFileSync(f2, JSON.stringify([1, 2, 3]))
      expect(createJsonRagStore({ path: f2 }).status().corrupt).toBe(true)
      // (c) non-1 version
      const f3 = join(dir, 'bad-version.json')
      writeFileSync(f3, JSON.stringify({ version: 2, nodes: [], edges: [], journal: [], cursor: 0 }))
      expect(createJsonRagStore({ path: f3 }).status().corrupt).toBe(true)
      expect(createJsonRagStore({ path: f3 }).status().loadedNodes).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. putNode with a malformed record rejects; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(null as never)).rejects.toThrow()
      await expect(store.putNode(42 as never)).rejects.toThrow()
      await expect(store.putNode(makeNode(''))).rejects.toThrow() // empty id
      await expect(store.putNode(makeNode('n1', { type: 'bogus' as never }))).rejects.toThrow() // invalid type
      await expect(store.putNode(makeNode('n1', { content: 42 as never }))).rejects.toThrow() // non-string content
      await expect(store.putNode(makeNode('n1', { ownedNodeIds: 'nope' as never }))).rejects.toThrow() // non-array ownedNodeIds
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. putEdge with a malformed record rejects; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.putNode(makeNode('n2'))
      await expect(store.putEdge(null as never)).rejects.toThrow()
      await expect(store.putEdge(42 as never)).rejects.toThrow()
      await expect(store.putEdge(makeEdge('', 'n1', 'n2'))).rejects.toThrow() // empty id
      await expect(store.putEdge(makeEdge('e1', 'n1', 'n2', { kind: 'bogus' as never }))).rejects.toThrow() // invalid kind
      await expect(store.putEdge(makeEdge('e1', '', 'n2'))).rejects.toThrow() // empty source
      await expect(store.putEdge(makeEdge('e1', 'n1', ''))).rejects.toThrow() // empty target
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. putEdge referencing a nonexistent node rejects; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await expect(store.putEdge(makeEdge('e1', 'n1', 'ghost'))).rejects.toThrow() // target missing
      await expect(store.putEdge(makeEdge('e2', 'ghost', 'n1'))).rejects.toThrow() // source missing
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. removeNode of a nonexistent id resolves false (no-op, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(await store.removeNode('ghost')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. removeEdge of a nonexistent id resolves false (no-op, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(await store.removeEdge('ghost')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. undo() at the base boundary resolves null (no-op, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(await store.undo()).toBeNull()
      expect(store.undoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. redo() at the redo boundary resolves null (no-op, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      expect(await store.redo()).toBeNull() // nothing undone yet → redo boundary
      expect(store.redoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. a write that throws inside the queue propagates; the next enqueued write still runs', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const failing = store.enqueue(() => {
        throw new Error('boom')
      })
      await expect(failing).rejects.toThrow('boom')
      const next = store.enqueue(async () => {
        await store.putNode(makeNode('n1'))
        return 'done'
      })
      await expect(next).resolves.toBe('done')
      expect(store.getNode('n1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. persist failure is non-fatal: in-memory reflects the write, no crash', async () => {
    const dir = freshDir()
    try {
      // Make the parent path unwritable: 'blocker' is a FILE, so mkdir of its
      // dirname fails → persist() throws internally → caught, non-fatal.
      const blocker = join(dir, 'blocker')
      writeFileSync(blocker, 'i am a file, not a dir')
      const store: RagStore = createJsonRagStore({ path: join(blocker, 'rag.json') })
      await expect(store.putNode(makeNode('n1'))).resolves.toBeDefined()
      expect(store.getNode('n1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
