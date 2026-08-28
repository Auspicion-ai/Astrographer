// tests/unit-m-children-field.test.ts — Unit M: the `children` field on `RagNode`
// (docs/specs/unit-m-children-field.md §5.6 happy-path states + §5.7 fail-states).
// This is the TestWriter RED set — the Unit M amendment does NOT exist yet:
//
//   - `src/main/rag-store.ts` `RagNode` does NOT have the optional
//     `children?: RagNodeChild[]` field; `RagNodeChildType`/`RagNodeChild` are
//     NOT exported.
//   - `nodeSource` does NOT include `children` in the fixed field order (a
//     `children` change does NOT produce a new hash).
//   - `validateNodeShape` does NOT validate `children` (a malformed `children`
//     array is NOT rejected at write and NOT skipped at boot).
//   - The journal content-entry `before`/`after` snapshot does NOT carry
//     `children`; `isContentSnapshot`/`isRagNode` do NOT validate it.
//   - The internal copy paths (`toPublicNode`/`insertNode`/`setNodeFields`/
//     `applyInverse`/`applyForward`) do NOT deep-copy `children`.
//
// The tests below are derived from the spec ALONE (§5.6/§5.7). The hash helpers
// `newNodeSource`/`newNodeHash` replicate the spec's amended `nodeSource` field
// order (`id, type, content, children, props, ownedNodeIds, createdAt,
// updatedAt`) so persisted-file fixtures can be authored with a hash that the
// post-Unit-M store will re-derive; `oldNodeSource`/`oldNodeHash` replicate the
// pre-Unit-M order (no `children`) for the additive-load / tamper fixtures.
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
  type RagNodeChild,
  type RagNodeChildType,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-m-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
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

/** The spec's amended `nodeSource` field order — `children` after `content`,
 *  before `props` (§5.2). */
function newNodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    children: n.children, props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function newNodeHash(n: RagNode): string { return sha256(newNodeSource(n)) }

/** The pre-Unit-M `nodeSource` field order — no `children` (§5.2 additive). */
function oldNodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function oldNodeHash(n: RagNode): string { return sha256(oldNodeSource(n)) }

// ===========================================================================
// §5.6 HAPPY-PATH STATES (12)
// ===========================================================================
describe('RagStore — Unit M children field (§5.6 happy-path states)', () => {
  it('1. the RagNode interface exposes children?: RagNodeChild[] — a node with children is accepted and returned with the field intact', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const node: RagNode = makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] })
      const returned = await store.putNode(node)
      expect(returned.children).toEqual([{ type: 'strong', content: 'bold' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. RagNodeChildType closed union: strong/em/a/img are all accepted child types', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const children: RagNodeChild[] = [
        { type: 'strong', content: 'b' },
        { type: 'em', content: 'i' },
        { type: 'a', content: 'l', props: { href: 'https://x' } },
        { type: 'img', content: '', props: { src: 'x.png', alt: 'x' } },
      ]
      await store.putNode(makeNode('n1', { children }))
      expect(store.getNode('n1')!.children).toEqual(children)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. node create with children: putNode returns the stored node; getNode returns children intact; listNodes has 1; file written atomically', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const node = makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] })
      const returned = await store.putNode(node)
      expect(returned.id).toBe('n1')
      expect(returned.children).toEqual([{ type: 'strong', content: 'bold' }])
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'bold' }])
      expect(store.listNodes()).toHaveLength(1)
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. node update changing children: replaced, updatedAt refreshed, content journal entry with before/after children, hash recomputed', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] }))
      const before = store.getNode('n1')!.updatedAt
      await store.putNode(makeNode('n1', { children: [{ type: 'em', content: 'italic' }] }))
      expect(store.getNode('n1')!.children).toEqual([{ type: 'em', content: 'italic' }])
      expect(store.getNode('n1')!.updatedAt).not.toBe(before)
      // a content edit records a `content` journal entry with before/after children
      const entries = store.journal()
      const contentEntry = entries.find((e) => e.kind === 'content' && e.nodeId === 'n1')
      expect(contentEntry).toBeDefined()
      if (contentEntry && contentEntry.kind === 'content') {
        expect(contentEntry.before.children).toEqual([{ type: 'strong', content: 'bold' }])
        expect(contentEntry.after.children).toEqual([{ type: 'em', content: 'italic' }])
      }
      // a children change → a new hash (nodeSource covers children)
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const stored = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      expect(stored.hash).toBe(newNodeHash(stored))
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. node WITHOUT children (plain-text, the v1 default): stored; getNode children undefined; hash matches the pre-Unit-M format (no quarantine)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'plain' }))
      expect(store.getNode('n1')!.children).toBeUndefined()
      const onDisk = JSON.parse(readFileSync(file, 'utf8'))
      const stored = onDisk.nodes.find((n: RagNode) => n.id === 'n1')
      expect(stored.hash).toBe(oldNodeHash(stored))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.getNode('n1')!.content).toBe('plain')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty children array: valid; the node is stored; getNode returns children: []', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [] }))
      expect(store.getNode('n1')!.children).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. children with props: valid; the child props round-trip', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }))
      expect(store.getNode('n1')!.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. hash covers children: a node with children hashes differently from the same node without children', async () => {
    const dir = freshDir()
    try {
      // The SAME node (same id/content/timestamps) in two stores — the only
      // difference is the `children` field. If nodeSource covers `children`,
      // the two persisted hashes differ.
      const fileA = join(dir, 'a.json')
      const fileB = join(dir, 'b.json')
      const storeA: RagStore = createJsonRagStore({ path: fileA })
      const storeB: RagStore = createJsonRagStore({ path: fileB })
      const base = makeNode('n1', { content: 'x' })
      await storeA.putNode({ ...base, children: [{ type: 'strong', content: 'bold' }] })
      await storeB.putNode(base)
      const hA = JSON.parse(readFileSync(fileA, 'utf8')).nodes.find((n: RagNode) => n.id === 'n1').hash
      const hB = JSON.parse(readFileSync(fileB, 'utf8')).nodes.find((n: RagNode) => n.id === 'n1').hash
      expect(hA).not.toBe(hB)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. additive load: a store file written BEFORE Unit M (records with no children) boots clean, all loaded, none quarantined', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a' })
      const n2 = makeNode('n2', { content: 'b' })
      const fileData = {
        version: 1,
        nodes: [
          { ...n1, hash: oldNodeHash(n1) },
          { ...n2, hash: oldNodeHash(n2) },
        ],
        edges: [],
        journal: [],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().quarantined).toEqual([])
      expect(store.status().loadedNodes).toEqual(expect.arrayContaining(['n1', 'n2']))
      expect(store.getNode('n1')!.content).toBe('a')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. round-trip with children: store A writes a node with children to P; store B boots from P → not corrupt; getNode returns children intact', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const storeA: RagStore = createJsonRagStore({ path: file })
      await storeA.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] }))
      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().corrupt).toBe(false)
      expect(storeB.status().quarantined).toEqual([])
      expect(storeB.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'bold' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. journal content undo/redo with children: undo restores the prior children; redo re-applies the new children', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] }))
      await store.putNode(makeNode('n1', { children: [{ type: 'em', content: 'italic' }] }))
      const undone = await store.undo()
      expect(undone).not.toBeNull()
      expect(store.getNode('n1')!.children).toEqual([{ type: 'strong', content: 'bold' }])
      const redone = await store.redo()
      expect(redone).not.toBeNull()
      expect(store.getNode('n1')!.children).toEqual([{ type: 'em', content: 'italic' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. deep-copy on read: mutating a returned node children does NOT change the store', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { children: [{ type: 'strong', content: 'bold' }] }))
      const first = store.getNode('n1')!
      first.children!.push({ type: 'em', content: 'x' })
      const second = store.getNode('n1')!
      expect(second.children).toEqual([{ type: 'strong', content: 'bold' }])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (10)
// ===========================================================================
describe('RagStore — Unit M children field (§5.7 fail-states)', () => {
  it('1. children is a non-array (object/string/number) → putNode throws "rag putNode: children required/invalid"; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: { type: 'strong' } as never }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: 'bold' as never }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n3', { children: 42 as never }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. a child is a non-object (null/string/number/array) → putNode throws; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: [null as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: ['x' as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n3', { children: [42 as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n4', { children: [[] as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. a child has an invalid type (span/unknown/non-string) → putNode throws; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: [{ type: 'span', content: 'x' } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: [{ type: 'bogus', content: 'x' } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n3', { children: [{ type: 42, content: 'x' } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. a child has a missing or non-string content → putNode throws; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: [{ type: 'strong' } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: [{ type: 'strong', content: 42 } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a child has a null/array/non-object props → putNode throws; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: [{ type: 'a', content: 'x', props: null } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: [{ type: 'a', content: 'x', props: [] } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n3', { children: [{ type: 'a', content: 'x', props: 'href' } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a child props contains a dangerous key (__proto__/constructor/prototype) → putNode throws; the store is unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { children: [{ type: 'a', content: 'x', props: { __proto__: {} } } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n2', { children: [{ type: 'a', content: 'x', props: { constructor: {} } } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      await expect(store.putNode(makeNode('n3', { children: [{ type: 'a', content: 'x', props: { prototype: {} } } as never] }))).rejects.toThrow('rag putNode: children required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. a persisted record with a malformed children array at boot → SKIPPED (never loaded, not quarantined)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', children: [{ type: 'span', content: 'x' } as never] })
      const fileData = {
        version: 1,
        nodes: [{ ...n1, hash: newNodeHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.status().quarantined).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. a persisted record whose children was tampered (changed without a hash update) at boot → QUARANTINED, not loaded', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', children: [{ type: 'strong', content: 'bold' }] })
      // the stored hash was computed WITHOUT children (the pre-Unit-M format) —
      // the children was added/tampered without a hash update
      const fileData = {
        version: 1,
        nodes: [{ ...n1, hash: oldNodeHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toContain('n1')
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. a journal content entry with a malformed children snapshot at boot → SKIPPED (isContentSnapshot rejects it)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const fileData = {
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          {
            kind: 'content',
            nodeId: 'n1',
            before: { content: 'a', children: [{ type: 'span', content: 'x' }] },
            after: { content: 'b' },
            at: new Date().toISOString(),
          },
        ],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. a journal structural entry carrying a node with a malformed children array at boot → SKIPPED (isRagNode rejects it)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const badNode = makeNode('n1', { children: [{ type: 'span', content: 'x' } as never] })
      const fileData = {
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-add', node: badNode }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }
      writeFileSync(file, JSON.stringify(fileData))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})
