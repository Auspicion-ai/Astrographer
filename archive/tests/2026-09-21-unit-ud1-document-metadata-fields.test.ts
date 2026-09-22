// tests/unit-ud1-document-metadata-fields.test.ts — Unit U-D1: the
// `documentPath` / `tags` document-metadata fields on `RagNode`
// (docs/specs/unit-ud1-document-metadata-fields.md §5.6 happy-path states 1-20
// + §5.7 fail-states 1-13).
//
// This is the TestWriter RED set — the U-D1 amendment does NOT exist yet:
//
//   - `src/main/rag-store.ts` `RagNode` does NOT have the optional
//     `documentPath?: string[]` / `tags?: string[]` fields.
//   - `nodeSource` does NOT cover `documentPath`/`tags` (a metadata change does
//     NOT produce a new hash).
//   - `validateNodeShape` does NOT validate/normalize the fields (a malformed
//     array is NOT rejected at write and NOT skipped at boot; `[]` is not
//     normalized away; `tags` is not trimmed/deduped).
//   - The internal copy paths (`toPublicNode`/`insertNode`/`setNodeFields`/
//     `adjacency.copyNode`) do NOT deep-copy the fields.
//   - The structural-op journal validator `isRagNode` does NOT accept the fields.
//
// The tests below are derived from the spec ALONE (§5.6/§5.7). `specNodeSource`/
// `specNodeHash` replicate the spec's AMENDED `nodeSource` field order
// (`id, type, content, nodeKind, children, documentPath, tags, props,
// ownedNodeIds, createdAt, updatedAt` — §5.2) so persisted-file fixtures can be
// authored with a hash the post-U-D1 store will re-derive; `oldNodeSource`/
// `oldNodeHash` replicate the PRE-U-D1 order (no `documentPath`/`tags`) for the
// additive-load / tamper fixtures.
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

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-ud1-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
}

/** The U-D1 metadata fields, declared INDEPENDENTLY of `src/` so the test file
 *  compiles/transpiles whether or not the source type carries them yet. */
interface DocumentMeta {
  documentPath?: string[]
  tags?: string[]
}

function makeNode(id: string, overrides: Partial<RagNode> & DocumentMeta = {}): RagNode {
  const now = new Date().toISOString()
  const node = {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
  return node as RagNode
}

interface StoredNode extends RagNode {
  hash: string
}

/** The spec's AMENDED `nodeSource` field order — `documentPath`/`tags` after
 *  `children`, before `props`, WITH `nodeKind` after `content` (§5.2, the
 *  RCA-10-resolved 11-field order). */
function specNodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    nodeKind: (n as DocumentMeta & RagNode).nodeKind,
    children: (n as DocumentMeta & RagNode).children,
    documentPath: (n as DocumentMeta & RagNode).documentPath,
    tags: (n as DocumentMeta & RagNode).tags,
    props: (n as DocumentMeta & RagNode).props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function specNodeHash(n: RagNode): string { return sha256(specNodeSource(n)) }

/** The PRE-U-D1 `nodeSource` field order — no `documentPath`/`tags` (§5.2/§5.3
 *  additive). For a record that HAS the fields, this is the hash a pre-U-D1
 *  writer would have stored (the tamper fixture). */
function oldNodeSource(n: RagNode): string {
  const m = n as DocumentMeta & RagNode
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    nodeKind: m.nodeKind,
    children: m.children, props: m.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function oldNodeHash(n: RagNode): string { return sha256(oldNodeSource(n)) }

function readOnDisk(file: string): {
  version: number
  nodes: StoredNode[]
  edges: unknown[]
  journal: unknown[]
  cursor: number
} {
  return JSON.parse(readFileSync(file, 'utf8'))
}

/** Narrow a `BatchResult` to the success arm (asserting `ok === true`). */
function expectOk(result: BatchResult): Extract<BatchResult, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + result.error)
  return result
}

/** Narrow a `BatchResult` to the failure arm (asserting `ok === false`). */
function expectFail(result: BatchResult): Extract<BatchResult, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (20)
// ===========================================================================
describe('RagStore — Unit U-D1 document metadata fields (§5.6 happy-path states)', () => {
  it('1. fields present on RagNode: documentPath/tags are optional — a node with them and a node without both round-trip', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('with', { documentPath: ['a'], tags: ['x'] }))
      await store.putNode(makeNode('without'))
      expect(store.getNode('with')!.documentPath).toEqual(['a'])
      expect(store.getNode('with')!.tags).toEqual(['x'])
      expect(store.getNode('without')!.documentPath).toBeUndefined()
      expect(store.getNode('without')!.tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. create with both fields: returned node + getNode have both arrays intact; listNodes has 1; file written atomically', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const returned = await store.putNode(makeNode('n1', { documentPath: ['a', 'b'], tags: ['x', 'y'] }))
      expect(returned.documentPath).toEqual(['a', 'b'])
      expect(returned.tags).toEqual(['x', 'y'])
      expect(store.getNode('n1')!.documentPath).toEqual(['a', 'b'])
      expect(store.getNode('n1')!.tags).toEqual(['x', 'y'])
      expect(store.listNodes()).toHaveLength(1)
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. create with documentPath only: getNode returns documentPath [a]; tags undefined', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['a'] }))
      expect(store.getNode('n1')!.documentPath).toEqual(['a'])
      expect(store.getNode('n1')!.tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. create with tags only: getNode returns tags [x]; documentPath undefined', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: ['x'] }))
      expect(store.getNode('n1')!.tags).toEqual(['x'])
      expect(store.getNode('n1')!.documentPath).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. node WITHOUT the fields (v1 default): stored; getNode both undefined; hash matches the pre-U-D1 format (no quarantine)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', { content: 'plain' }))
      expect(store.getNode('n1')!.documentPath).toBeUndefined()
      expect(store.getNode('n1')!.tags).toBeUndefined()
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      expect(stored.hash).toBe(oldNodeHash(stored))
      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.getNode('n1')!.content).toBe('plain')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty documentPath normalizes away: getNode documentPath undefined; hash equals the absent-field hash', async () => {
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
      expect(createJsonRagStore({ path: fileEmpty }).getNode('n1')!.documentPath).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. empty tags normalizes away: getNode tags undefined; hash equals the absent-field hash', async () => {
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
      expect(createJsonRagStore({ path: fileEmpty }).getNode('n1')!.tags).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. tags trim + dedupe + first-occurrence order + case-sensitivity: [\' b \',\'a\',\'b\',\'A\'] → [\'b\',\'a\',\'A\']', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { tags: [' b ', 'a', 'b', 'A'] }))
      expect(store.getNode('n1')!.tags).toEqual(['b', 'a', 'A'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. documentPath no dedupe: [a, a] stores as [a, a]', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['a', 'a'] }))
      expect(store.getNode('n1')!.documentPath).toEqual(['a', 'a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. hash covers documentPath: the same node with vs without documentPath [a] yields different hashes', async () => {
    const dir = freshDir()
    try {
      const fileA = join(dir, 'a.json')
      const fileB = join(dir, 'b.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileA }).putNode({ ...base, documentPath: ['a'] })
      await createJsonRagStore({ path: fileB }).putNode(base)
      const hA = readOnDisk(fileA).nodes.find((n) => n.id === 'n1')!.hash
      const hB = readOnDisk(fileB).nodes.find((n) => n.id === 'n1')!.hash
      expect(hA).not.toBe(hB)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. hash covers tags: the same node with vs without tags [x] yields different hashes', async () => {
    const dir = freshDir()
    try {
      const fileA = join(dir, 'a.json')
      const fileB = join(dir, 'b.json')
      const base = makeNode('n1', { content: 'x' })
      await createJsonRagStore({ path: fileA }).putNode({ ...base, tags: ['x'] })
      await createJsonRagStore({ path: fileB }).putNode(base)
      const hA = readOnDisk(fileA).nodes.find((n) => n.id === 'n1')!.hash
      const hB = readOnDisk(fileB).nodes.find((n) => n.id === 'n1')!.hash
      expect(hA).not.toBe(hB)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. nodeSource fixed field order: persisted hash matches the SPEC-PINNED order (id, type, content, nodeKind, children, documentPath, tags, props, ownedNodeIds, createdAt, updatedAt)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      await store.putNode(makeNode('n1', {
        nodeKind: 'fact',
        documentPath: ['a'],
        tags: ['x'],
        props: { k: 'v' },
      }))
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      // the fields must actually be persisted for an order assertion to bite
      expect(stored.documentPath).toEqual(['a'])
      expect(stored.tags).toEqual(['x'])
      // `nodeSource`/`nodeHash` is NOT exported from `src/main/rag-store.ts`, so
      // a DIRECT `Object.keys(nodeSource(...))` assertion is impossible here
      // (comment-documented limitation). Observable consequence: the persisted
      // hash equals sha256 of the spec's PINNED serialization ORDER, and is NOT
      // equal to a hash that serializes the same fields in any swapped order
      // (e.g. `props` before `documentPath`). JSON key order changes the source
      // string, hence the hash.
      const wrongOrderHash = sha256(JSON.stringify({
        id: stored.id, type: stored.type, content: stored.content,
        nodeKind: stored.nodeKind, children: stored.children,
        props: stored.props, documentPath: stored.documentPath, tags: stored.tags,
        ownedNodeIds: stored.ownedNodeIds,
        createdAt: stored.createdAt, updatedAt: stored.updatedAt,
      }))
      expect(stored.hash).toBe(specNodeHash(stored))
      expect(stored.hash).not.toBe(wrongOrderHash)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. additive load: a store file written BEFORE U-D1 (records with no fields) boots clean, all loaded, none quarantined', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a' })
      const n2 = makeNode('n2', { content: 'b' })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [
          { ...n1, hash: oldNodeHash(n1) },
          { ...n2, hash: oldNodeHash(n2) },
        ],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().quarantined).toEqual([])
      expect(store.status().loadedNodes).toEqual(expect.arrayContaining(['n1', 'n2']))
      expect(store.getNode('n1')!.content).toBe('a')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. round-trip with the fields: store A writes to P; fresh store B boots from P → not corrupt; getNode returns both arrays intact', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      await createJsonRagStore({ path: file }).putNode(makeNode('n1', {
        documentPath: ['a', 'b'],
        tags: ['x', 'y'],
      }))
      const storeB: RagStore = createJsonRagStore({ path: file })
      expect(storeB.status().corrupt).toBe(false)
      expect(storeB.status().quarantined).toEqual([])
      expect(storeB.getNode('n1')!.documentPath).toEqual(['a', 'b'])
      expect(storeB.getNode('n1')!.tags).toEqual(['x', 'y'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. deep-copy on read: mutating a returned node documentPath/tags does NOT change the store', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['a'], tags: ['x'] }))
      const first = store.getNode('n1')!
      first.documentPath!.push('mutated')
      first.tags!.push('mutated')
      const second = store.getNode('n1')!
      expect(second.documentPath).toEqual(['a'])
      expect(second.tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('16. deep-copy on write: mutating the arrays passed to putNode after the call returns does NOT change the store', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const documentPath = ['a']
      const tags = ['x']
      await store.putNode(makeNode('n1', { documentPath, tags }))
      documentPath.push('mutated')
      tags.push('mutated')
      expect(store.getNode('n1')!.documentPath).toEqual(['a'])
      expect(store.getNode('n1')!.tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('17. M3 data-loss guard: getNode → putNode({ ...getNode(id)! }) preserves documentPath/tags (not stripped)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { documentPath: ['a', 'b'], tags: ['x', 'y'] }))
      await store.putNode({ ...store.getNode('n1')! })
      expect(store.getNode('n1')!.documentPath).toEqual(['a', 'b'])
      expect(store.getNode('n1')!.tags).toEqual(['x', 'y'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('18. off-root node: a non-root node carrying the fields validates, stores, and round-trips unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('some-child-node', { documentPath: ['a'], tags: ['x'] }))
      expect(store.getNode('some-child-node')!.documentPath).toEqual(['a'])
      expect(store.getNode('some-child-node')!.tags).toEqual(['x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('19. structural journal node accepted: a node-add entry carrying valid documentPath/tags survives boot (isRagNode accepts it)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const node = makeNode('n1', { documentPath: ['a'], tags: ['x'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-add', node }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('20. applyBatch(putNode) with the fields: a one-op batch applies, stores the normalized fields, and persists once', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const result = expectOk(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { documentPath: ['a'], tags: [' b ', 'b'] }) },
      ]))
      expect(result.results).toHaveLength(1)
      expect(store.getNode('n1')!.documentPath).toEqual(['a'])
      expect(store.getNode('n1')!.tags).toEqual(['b'])
      expect(existsSync(file)).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (13)
// ===========================================================================
describe('RagStore — Unit U-D1 document metadata fields (§5.7 fail-states)', () => {
  it('1. documentPath is a non-array (object/string/number) → putNode throws "rag putNode: documentPath required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { documentPath: {} as never })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      await expect(store.putNode(makeNode('n2', { documentPath: 'a' as never })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      await expect(store.putNode(makeNode('n3', { documentPath: 42 as never })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. a documentPath member is a non-string → putNode throws "rag putNode: documentPath required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { documentPath: [42 as never] })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      await expect(store.putNode(makeNode('n2', { documentPath: [{} as never] })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      await expect(store.putNode(makeNode('n3', { documentPath: [null as never] })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. a documentPath member is an empty string → putNode throws "rag putNode: documentPath required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { documentPath: [''] })))
        .rejects.toThrow('rag putNode: documentPath required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. tags is a non-array (object/string/number) → putNode throws "rag putNode: tags required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { tags: {} as never })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('n2', { tags: 'x' as never })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('n3', { tags: 42 as never })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a tags member is a non-string → putNode throws "rag putNode: tags required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { tags: [42 as never] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('n2', { tags: [{} as never] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('n3', { tags: [null as never] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a tags member is an empty or whitespace-only string → putNode throws "rag putNode: tags required/invalid"; store unchanged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await expect(store.putNode(makeNode('n1', { tags: [''] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      await expect(store.putNode(makeNode('n2', { tags: ['   '] })))
        .rejects.toThrow('rag putNode: tags required/invalid')
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. applyBatch(putNode) with a malformed array → { ok:false, error: "rag applyBatch: documentPath|tags required/invalid at index N", failedIndex: N }; rolled back (never throws)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const store: RagStore = createJsonRagStore({ path: file })
      const badDocPath = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n1', { documentPath: {} as never }) },
      ]))
      expect(badDocPath.error).toBe('rag applyBatch: documentPath required/invalid at index 0')
      expect(badDocPath.failedIndex).toBe(0)

      const badTags = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n2', { tags: [''] }) },
      ]))
      expect(badTags.error).toBe('rag applyBatch: tags required/invalid at index 0')
      expect(badTags.failedIndex).toBe(0)

      // failure at a NON-ZERO index — the first (valid) op must be rolled back
      const badAtOne = expectFail(await store.applyBatch([
        { op: 'putNode', node: makeNode('n3', { documentPath: ['a'] }) },
        { op: 'putNode', node: makeNode('n4', { tags: {} as never }) },
      ]))
      expect(badAtOne.error).toBe('rag applyBatch: tags required/invalid at index 1')
      expect(badAtOne.failedIndex).toBe(1)

      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. persisted record with a malformed documentPath at boot → SKIPPED (never loaded, not quarantined)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', documentPath: {} as never })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: specNodeHash(n1) }],
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

  it('9. persisted record with a malformed tags at boot → SKIPPED (never loaded, not quarantined)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', tags: [42 as never] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: specNodeHash(n1) }],
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

  it('10. persisted record whose documentPath was tampered (no hash update) at boot → QUARANTINED, not loaded', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', documentPath: ['a'] })
      // the stored hash was computed WITHOUT documentPath (the pre-U-D1 format)
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: oldNodeHash(n1) }],
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

  it('11. persisted record whose tags was tampered (no hash update) at boot → QUARANTINED, not loaded', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a', tags: ['x'] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...n1, hash: oldNodeHash(n1) }],
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

  it('12. a structural journal entry carrying a node with a malformed documentPath/tags at boot → SKIPPED (isRagNode rejects it)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const badDocPath = makeNode('n1', { documentPath: {} as never })
      const badTags = makeNode('n2', { tags: [''] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-add', node: badDocPath }, at: new Date().toISOString() },
          { kind: 'structural', op: { op: 'node-update', nodeId: 'n2', before: makeNode('n2'), after: badTags }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.journal()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. byte-equality on an old store (F10): records with no fields re-derive byte-identical hashes and load with zero quarantines', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const n1 = makeNode('n1', { content: 'a' })
      const n2 = makeNode('n2', { content: 'b', children: [{ type: 'strong', content: 'bold' }] })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [
          { ...n1, hash: oldNodeHash(n1) },
          { ...n2, hash: oldNodeHash(n2) },
        ],
        edges: [],
        journal: [],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().corrupt).toBe(false)
      expect(store.status().quarantined).toEqual([])
      expect(store.status().loadedNodes).toEqual(expect.arrayContaining(['n1', 'n2']))
      const disk = readOnDisk(file)
      for (const stored of disk.nodes) {
        expect(stored.hash).toBe(oldNodeHash(stored))
      }
    } finally {
      rmSyncSafe(dir)
    }
  })
})
