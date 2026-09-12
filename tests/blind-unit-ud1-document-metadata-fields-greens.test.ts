// tests/blind-unit-ud1-document-metadata-fields-greens.test.ts — Unit U-D1
// BLIND green-scenario artifact (RCA-4).
//
// Derived from DOCUMENTATION ONLY:
//   - docs/specs/unit-ud1-document-metadata-fields.md
//     (§5.1 fields, §5.2 hash source, §5.3 additive load/copy paths,
//      §5.4 validation/normalization, §5.5 off-root, §5.6 happy states,
//      §5.7 fail-states, §3a adversarial findings A1–A7 + F1).
//   - The TestWriter file was consulted ONLY for harness conventions (the
//     `createJsonRagStore`/temp-file setup, the `RagStore`/`RagNode`/`BatchResult`
//     imports, and the spec-order hash fixture helpers). The scenarios below are
//     authored independently; `src/main/rag-store.ts` / `src/main/adjacency.ts`
//     were NOT read to decide expected behavior.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type BatchResult,
} from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// Harness helpers
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-blind-ud1-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
}

/** The U-D1 metadata fields, declared locally so the test is not coupled to
 *  whether the source type currently carries them. */
interface DocumentMeta {
  documentPath?: string[]
  tags?: string[]
}

function meta(n: RagNode | undefined): DocumentMeta {
  return (n ?? {}) as RagNode & DocumentMeta
}

function makeNode(id: string, overrides: Partial<RagNode> & DocumentMeta = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as RagNode
}

interface StoredNode extends RagNode {
  hash: string
}

/** The post-U-D1 `nodeSource` field order (§5.2, 11 fields, `nodeKind` KEPT
 *  after `content` per the RCA-10 resolution):
 *  id, type, content, nodeKind, children, documentPath, tags, props,
 *  ownedNodeIds, createdAt, updatedAt. */
function newSource(n: RagNode): string {
  const m = n as RagNode & DocumentMeta
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    nodeKind: m.nodeKind,
    children: m.children,
    documentPath: m.documentPath,
    tags: m.tags,
    props: m.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function newHash(n: RagNode): string { return sha256(newSource(n)) }

/** The PRE-U-D1 `nodeSource` order (no `documentPath`/`tags`), for the
 *  additive-load / tamper fixtures (§5.2/§5.3). */
function oldSource(n: RagNode): string {
  const m = n as RagNode & DocumentMeta
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    nodeKind: m.nodeKind,
    children: m.children, props: m.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function oldHash(n: RagNode): string { return sha256(oldSource(n)) }

function readOnDisk(file: string): {
  version: number
  nodes: StoredNode[]
  edges: unknown[]
  journal: unknown[]
  cursor: number
} {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function expectOk(result: BatchResult): Extract<BatchResult, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + result.error)
  return result
}

function expectFail(result: BatchResult): Extract<BatchResult, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result
}

const ISO = new Date().toISOString()

// ===========================================================================
// A. Round-trip / persistence (§5.3, §5.6 2/3/4/5/14/18)
// ===========================================================================
describe('blind U-D1 A — persistence + round-trip', () => {
  it('A1 both fields survive write→persist→fresh-boot→read with a matching hash (§5.6 2/14)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      await createJsonRagStore({ path: file }).putNode(makeNode('n1', {
        documentPath: ['dir', 'sub'],
        tags: ['alpha', 'beta'],
      }))
      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().corrupt).toBe(false)
      expect(storeB.status().quarantined).toEqual([])
      expect(storeB.status().loadedNodes).toContain('n1')
      expect(meta(storeB.getNode('n1')).documentPath).toEqual(['dir', 'sub'])
      expect(meta(storeB.getNode('n1')).tags).toEqual(['alpha', 'beta'])
      expect(storeB.listNodes()).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A2 documentPath-only and tags-only round-trip independently (§5.6 3/4)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('p-only', { documentPath: ['a'] }))
      await store.putNode(makeNode('t-only', { tags: ['x'] }))
      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().quarantined).toEqual([])
      expect(meta(fresh.getNode('p-only')).documentPath).toEqual(['a'])
      expect(meta(fresh.getNode('p-only')).tags).toBeUndefined()
      expect(meta(fresh.getNode('t-only')).tags).toEqual(['x'])
      expect(meta(fresh.getNode('t-only')).documentPath).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A3 neither field (v1 default): both undefined, keys omitted on disk, no quarantine (§5.6 5)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'plain' }))
      expect(meta(store.getNode('n1')).documentPath).toBeUndefined()
      expect(meta(store.getNode('n1')).tags).toBeUndefined()
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      expect('documentPath' in stored).toBe(false)
      expect('tags' in stored).toBe(false)
      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().corrupt).toBe(false)
      expect(fresh.status().quarantined).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('A4 off-root node: fields are stored/hashed but not stripped or rejected, and round-trip (§5.5/§5.6 18, A6)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('not-a-document-root', { documentPath: ['a'], tags: ['x'] }))
      expect(meta(store.getNode('not-a-document-root')).documentPath).toEqual(['a'])
      expect(meta(store.getNode('not-a-document-root')).tags).toEqual(['x'])
      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().quarantined).toEqual([])
      expect(meta(fresh.getNode('not-a-document-root')).documentPath).toEqual(['a'])
      expect(meta(fresh.getNode('not-a-document-root')).tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// B. Normalization (§5.4, §5.6 6/7/8/9, A4/A5)
// ===========================================================================
describe('blind U-D1 B — normalization', () => {
  it('B1 documentPath [] normalizes to undefined and hashes like the absent field (§5.6 6, A4)', async () => {
    const dir = freshDir()
    try {
      const fileEmpty = join(dir, 'empty.json')
      const fileAbsent = join(dir, 'absent.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileEmpty }).putNode({ ...base, documentPath: [] })
      await createJsonRagStore({ path: fileAbsent }).putNode(base)
      const hEmpty = readOnDisk(fileEmpty).nodes.find((n) => n.id === 'n1')!.hash
      const hAbsent = readOnDisk(fileAbsent).nodes.find((n) => n.id === 'n1')!.hash
      expect(hEmpty).toBe(hAbsent)
      const emptyRecord = readOnDisk(fileEmpty).nodes.find((n) => n.id === 'n1')!
      expect('documentPath' in emptyRecord).toBe(false)
      expect(meta(createJsonRagStore({ path: fileEmpty }).getNode('n1')).documentPath).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B2 tags [] normalizes to undefined and hashes like the absent field (§5.6 7, A4)', async () => {
    const dir = freshDir()
    try {
      const fileEmpty = join(dir, 'empty.json')
      const fileAbsent = join(dir, 'absent.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileEmpty }).putNode({ ...base, tags: [] })
      await createJsonRagStore({ path: fileAbsent }).putNode(base)
      const hEmpty = readOnDisk(fileEmpty).nodes.find((n) => n.id === 'n1')!.hash
      const hAbsent = readOnDisk(fileAbsent).nodes.find((n) => n.id === 'n1')!.hash
      expect(hEmpty).toBe(hAbsent)
      const emptyRecord = readOnDisk(fileEmpty).nodes.find((n) => n.id === 'n1')!
      expect('tags' in emptyRecord).toBe(false)
      expect(meta(createJsonRagStore({ path: fileEmpty }).getNode('n1')).tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B3 tags trim + dedupe + first-occurrence order + case-SENSITIVE (§5.6 8, A5)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: [' b ', 'a', 'b', 'A'] }))
      expect(meta(store.getNode('n1')).tags).toEqual(['b', 'a', 'A'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B4 documentPath does NOT dedupe and does NOT trim segments (§5.6 9, §3a F5)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('dup', { documentPath: ['a', 'a'] }))
      await store.putNode(makeNode('spaced', { documentPath: [' a ', '  '] }))
      expect(meta(store.getNode('dup')).documentPath).toEqual(['a', 'a'])
      expect(meta(store.getNode('spaced')).documentPath).toEqual([' a ', '  '])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('B5 a whitespace-only documentPath segment is accepted while a whitespace-only tag is not (§3a F5, §5.4)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('ok', { documentPath: ['  '] }))
      expect(meta(store.getNode('ok')).documentPath).toEqual(['  '])
      await expect(store.putNode(makeNode('bad', { tags: ['  '] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// C. Write-time validation (exact throw messages) (§5.7 1–6)
// ===========================================================================
describe('blind U-D1 C — write-time throw messages', () => {
  it('C1 malformed documentPath → exact "rag putNode: documentPath required/invalid"; store unchanged (§5.7 1–3)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const msg = 'rag putNode: documentPath required/invalid'
      await expect(store.putNode(makeNode('n1', { documentPath: {} as never }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n2', { documentPath: 'a' as never }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n3', { documentPath: [42 as never] }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n4', { documentPath: [''] }))).rejects.toThrow(msg)
      expect(store.listNodes()).toEqual([])
      await expect(store.putNode(makeNode('n5', { documentPath: ['ok', null as never] }))).rejects.toThrow(msg)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('C2 malformed tags → exact "rag putNode: tags required/invalid"; store unchanged (§5.7 4–6)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const msg = 'rag putNode: tags required/invalid'
      await expect(store.putNode(makeNode('n1', { tags: {} as never }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n2', { tags: 'x' as never }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n3', { tags: [42 as never] }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n4', { tags: [''] }))).rejects.toThrow(msg)
      await expect(store.putNode(makeNode('n5', { tags: ['   '] }))).rejects.toThrow(msg)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// D. Hash coverage + fixed field order (§5.2, §5.6 10/11/12)
// ===========================================================================
describe('blind U-D1 D — hash coverage + order', () => {
  it('D1 documentPath is covered by the hash (with vs without → different hash) (§5.6 10)', async () => {
    const dir = freshDir()
    try {
      const fileA = join(dir, 'a.json')
      const fileB = join(dir, 'b.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileA }).putNode({ ...base, documentPath: ['a'] })
      await createJsonRagStore({ path: fileB }).putNode(base)
      const storedA = readOnDisk(fileA).nodes.find((n) => n.id === 'n1')!
      const hB = readOnDisk(fileB).nodes.find((n) => n.id === 'n1')!.hash
      expect(storedA.hash).not.toBe(hB)
      expect(storedA.hash).toBe(newHash(storedA))
      expect(oldHash(storedA)).not.toBe(storedA.hash)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D2 tags is covered by the hash (with vs without → different hash) (§5.6 11)', async () => {
    const dir = freshDir()
    try {
      const fileA = join(dir, 'a.json')
      const fileB = join(dir, 'b.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileA }).putNode({ ...base, tags: ['x'] })
      await createJsonRagStore({ path: fileB }).putNode(base)
      const storedA = readOnDisk(fileA).nodes.find((n) => n.id === 'n1')!
      const hB = readOnDisk(fileB).nodes.find((n) => n.id === 'n1')!.hash
      expect(storedA.hash).not.toBe(hB)
      expect(storedA.hash).toBe(newHash(storedA))
      expect(oldHash(storedA)).not.toBe(storedA.hash)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('D3 persisted hash equals sha256 of the spec-pinned field order and NOT a swapped order (§5.6 12)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      await createJsonRagStore({ path: file }).putNode(makeNode('n1', {
        nodeKind: 'fact',
        documentPath: ['a'],
        tags: ['x'],
        props: { k: 'v' },
      }))
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      expect(stored.documentPath).toEqual(['a'])
      expect(stored.tags).toEqual(['x'])
      expect(stored.hash).toBe(newHash(stored))
      const swapped = sha256(JSON.stringify({
        id: stored.id, type: stored.type, content: stored.content,
        nodeKind: stored.nodeKind, children: stored.children,
        props: stored.props, documentPath: stored.documentPath, tags: stored.tags,
        ownedNodeIds: stored.ownedNodeIds,
        createdAt: stored.createdAt, updatedAt: stored.updatedAt,
      }))
      expect(stored.hash).not.toBe(swapped)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// E. Additive old-store byte-equality (§5.6 13, §5.7 13, A1)
// ===========================================================================
describe('blind U-D1 E — additive old-store load', () => {
  it('E1 a nodeKind-bearing old store re-derives byte-identical hashes and boots with zero quarantines (§5.6 13/§5.7 13)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', nodeKind: 'fact' })
      const n2 = makeNode('n2', { content: 'b', children: [{ type: 'strong', content: 'bold' }] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: oldHash(n1) }, { ...n2, hash: oldHash(n2) }],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().quarantined).toEqual([])
      expect(store.status().loadedNodes).toEqual(expect.arrayContaining(['n1', 'n2']))
      const disk = readOnDisk(file)
      expect(disk.nodes.find((n) => n.id === 'n1')!.hash).toBe(oldHash(n1))
      expect(disk.nodes.find((n) => n.id === 'n2')!.hash).toBe(oldHash(n2))
      expect(meta(store.getNode('n1')).documentPath).toBeUndefined()
      expect(meta(store.getNode('n1')).tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// F. Deep-copy on read + write (§5.6 15/16, A3)
// ===========================================================================
describe('blind U-D1 F — deep-copy', () => {
  it('F1 mutating a returned node\'s fields does NOT change the store (§5.6 15, A3)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['a'], tags: ['x'] }))
      const first = meta(store.getNode('n1'))
      first.documentPath!.push('mutated')
      first.tags!.push('mutated')
      const second = meta(store.getNode('n1'))
      expect(second.documentPath).toEqual(['a'])
      expect(second.tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F2 mutating the arrays passed to putNode afterward does NOT change the store (§5.6 16, A3)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const documentPath = ['a']
      const tags = ['x']
      await store.putNode(makeNode('n1', { documentPath, tags }))
      documentPath.push('mutated')
      tags.push('mutated')
      expect(meta(store.getNode('n1')).documentPath).toEqual(['a'])
      expect(meta(store.getNode('n1')).tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// G. M3 data-loss guard (§5.6 17, A7)
// ===========================================================================
describe('blind U-D1 G — M3 data-loss guard', () => {
  it('G1 getNode → putNode({ ...getNode(id)! }) preserves both fields without stripping (§5.6 17, A7)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { documentPath: ['a', 'b'], tags: ['x', 'y'] }))
      await store.putNode({ ...store.getNode('n1')! })
      expect(meta(store.getNode('n1')).documentPath).toEqual(['a', 'b'])
      expect(meta(store.getNode('n1')).tags).toEqual(['x', 'y'])
      const fresh: RagStore = createJsonRagStore({ path: file })
      expect(fresh.status().quarantined).toEqual([])
      expect(meta(fresh.getNode('n1')).documentPath).toEqual(['a', 'b'])
      expect(meta(fresh.getNode('n1')).tags).toEqual(['x', 'y'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// H. Tamper → quarantine (§5.7 10/11, A1)
// ===========================================================================
describe('blind U-D1 H — tampered field → quarantine', () => {
  it('H1 documentPath present but stored hash computed without it → QUARANTINED, not loaded (§5.7 10, A1)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', documentPath: ['a'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: oldHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toContain('n1')
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H2 tags present but stored hash computed without it → QUARANTINED, not loaded (§5.7 11, A1)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', tags: ['x'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: oldHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toContain('n1')
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// I. Malformed persisted record → skip at boot (§5.7 8/9, A2)
// ===========================================================================
describe('blind U-D1 I — malformed persisted record → skipped', () => {
  it('I1 a persisted non-string documentPath member is SKIPPED (not loaded, not quarantined) (§5.7 8, A2)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', documentPath: [42 as never] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: newHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.status().quarantined).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('I2 a persisted non-array tags value is SKIPPED (not loaded, not quarantined) (§5.7 9, A2)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', tags: {} as never })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: newHash(n1) }],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().loadedNodes).not.toContain('n1')
      expect(store.status().quarantined).not.toContain('n1')
      expect(store.getNode('n1')).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// J. Structural journal: shape acceptance + F1 replay normalization (§5.6 19,
//    §5.7 12, §3a F1)
// ===========================================================================
describe('blind U-D1 J — structural journal', () => {
  it('J1 a valid node-add journal entry carrying the fields survives boot (§5.6 19)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const node = makeNode('n1', { documentPath: ['a'], tags: ['x'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [{ kind: 'structural', op: { op: 'node-add', node }, at: ISO }],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('J2 a node-add journal entry with a malformed documentPath is SKIPPED at boot (§5.7 12)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const bad = makeNode('n1', { documentPath: {} as never })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [{ kind: 'structural', op: { op: 'node-add', node: bad }, at: ISO }],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('J3 F1 node-add replay normalizes BEFORE hashing/storing; the next boot has ZERO quarantines (§3a F1)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const raw = makeNode('n1', { documentPath: [], tags: [' b ', 'b'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [{ kind: 'structural', op: { op: 'node-add', node: raw }, at: ISO }],
        cursor: 0,
      }))
      const storeA: RagStore = createJsonRagStore({ path: file })
      expect(storeA.journal()).toHaveLength(1)
      await storeA.redo()
      const replayed = meta(storeA.getNode('n1'))
      expect(replayed.documentPath).toBeUndefined()
      expect(replayed.tags).toEqual(['b'])

      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().quarantined).toEqual([])
      expect(storeB.status().loadedNodes).toContain('n1')
      expect(meta(storeB.getNode('n1')).tags).toEqual(['b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('J4 F1 node-update replay normalizes BEFORE hashing/storing; the next boot has ZERO quarantines (§3a F1)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const before = makeNode('n1', { content: 'before' })
      const after = makeNode('n1', { content: 'after', documentPath: [], tags: [' x ', 'x'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...before, hash: oldHash(before) }],
        edges: [],
        journal: [{
          kind: 'structural',
          op: { op: 'node-update', nodeId: 'n1', before, after },
          at: ISO,
        }],
        cursor: 0,
      }))
      const storeA: RagStore = createJsonRagStore({ path: file })
      expect(storeA.getNode('n1')!.content).toBe('before')
      await storeA.redo()
      const replayed = meta(storeA.getNode('n1'))
      expect(storeA.getNode('n1')!.content).toBe('after')
      expect(replayed.documentPath).toBeUndefined()
      expect(replayed.tags).toEqual(['x'])

      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().quarantined).toEqual([])
      expect(meta(storeB.getNode('n1')).tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// K. applyBatch (§5.6 20, §5.7 7)
// ===========================================================================
describe('blind U-D1 K — applyBatch', () => {
  it('K1 a one-op applyBatch(putNode) stores the normalized fields and persists (§5.6 20)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const result = expectOk(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { documentPath: ['a'], tags: [' b ', 'b'] }) },
      ]))
      expect(result.results).toHaveLength(1)
      expect(meta(store.getNode('n1')).documentPath).toEqual(['a'])
      expect(meta(store.getNode('n1')).tags).toEqual(['b'])
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('K2 a malformed documentPath batch fails with the exact indexed error and rolls back (§5.7 7)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { documentPath: {} as never }) },
      ]))
      expect(result.error).toBe('rag applyBatch: documentPath required/invalid at index 0')
      expect(result.failedIndex).toBe(0)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('K3 a malformed tags at index 1 fails with index 1 and rolls back the already-applied op (§5.7 7)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const result = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('ok', { documentPath: ['a'] }) },
        { op: 'putNode', node: makeNode('bad', { tags: {} as never }) },
      ]))
      expect(result.error).toBe('rag applyBatch: tags required/invalid at index 1')
      expect(result.failedIndex).toBe(1)
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})
