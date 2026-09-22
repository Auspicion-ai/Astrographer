// tests/unit-ud1-document-metadata-fields-adversarial.test.ts — Unit U-D1
// adversarial finding F1 (MEDIUM, HOST): the structural-journal REPLAY path
// (`insertNode` / `setNodeFields` in `src/main/rag-store.ts`) copies
// `documentPath`/`tags` but does NOT NORMALIZE them. A persisted/tampered
// structural journal entry (`node-add` / `node-update`) carrying
// `documentPath: []` or untrimmed/duplicated `tags` stores the raw value (and
// hashes it), so on the next boot `validateNodeShape` normalizes differently
// and the record self-QUARANTINES — violating the U-D1 invariant "a stored `[]`
// cannot diverge from absent" (docs/specs/unit-ud1-document-metadata-fields.md
// §5.1 / §5.2 / §5.4 / A4).
//
// These tests reproduce F1 from the SPEC/invariant ALONE (not from the fix):
// a structural `node-add`/`node-update` entry with `documentPath: []` and
// unnormalized `tags`, replayed via `redo()`, must store NORMALIZED values and
// a fresh boot must have ZERO quarantines. The `applyBatch` replay path is
// already safe (it re-validates); only the structural path is exposed.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-ud1-f1-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
}

/** The U-D1 metadata fields, declared INDEPENDENTLY of `src/` so the test file
 *  compiles/transpiles whether or not the source type carries them. */
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

/** The spec's AMENDED `nodeSource` field order (§5.2) — used to author valid
 *  persisted fixtures that the post-U-D1 store re-derives. */
function specNodeSource(n: RagNode): string {
  const m = n as DocumentMeta & RagNode
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
function specNodeHash(n: RagNode): string { return sha256(specNodeSource(n)) }

function readOnDisk(file: string): { nodes: Array<RagNode & { hash: string }> } {
  return JSON.parse(readFileSync(file, 'utf8'))
}

// ===========================================================================
// F1 — structural replay must normalize before hashing/storing
// ===========================================================================
describe('RagStore — Unit U-D1 adversarial F1 (structural replay normalization)', () => {
  it('node-add replay: documentPath [] → undefined and tags trimmed/deduped (first-occurrence, case-sensitive)', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const raw = makeNode('n1', {
        content: 'a',
        documentPath: [],
        tags: [' b ', 'b', 'A', 'a', 'A'],
      })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-add', node: raw }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toEqual([])
      const entry = await store.redo()
      expect(entry).not.toBeNull()
      expect(store.getNode('n1')!.documentPath).toBeUndefined()
      expect(store.getNode('n1')!.tags).toEqual(['b', 'A', 'a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('node-add replay: persisted record re-derives the normalized hash — a fresh boot has ZERO quarantines', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const raw = makeNode('n1', {
        content: 'a',
        documentPath: [],
        tags: [' b ', 'b', 'A', 'a', 'A'],
      })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-add', node: raw }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      await store.redo()
      // the stored record must carry the normalized values + a hash that the
      // boot re-verification (which normalizes) re-derives.
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      expect(stored.documentPath).toBeUndefined()
      expect(stored.tags).toEqual(['b', 'A', 'a'])
      expect(stored.hash).toBe(specNodeHash(stored))

      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.status().loadedNodes).toContain('n1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('node-update replay: documentPath [] → undefined and tags normalized', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const before = makeNode('n1', { content: 'a' })
      const rawAfter = makeNode('n1', {
        content: 'a',
        documentPath: [],
        tags: [' x ', 'x', 'y'],
      })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...before, hash: specNodeHash(before) }],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-update', nodeId: 'n1', before, after: rawAfter }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      expect(store.status().quarantined).toEqual([])
      const entry = await store.redo()
      expect(entry).not.toBeNull()
      expect(store.getNode('n1')!.documentPath).toBeUndefined()
      expect(store.getNode('n1')!.tags).toEqual(['x', 'y'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('node-update replay: persisted record re-derives the normalized hash — a fresh boot has ZERO quarantines', async () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'rag.json')
      const before = makeNode('n1', { content: 'a' })
      const rawAfter = makeNode('n1', {
        content: 'a',
        documentPath: [],
        tags: [' x ', 'x', 'y'],
      })
      writeFileSync(file, JSON.stringify({
        version: 1,
        nodes: [{ ...before, hash: specNodeHash(before) }],
        edges: [],
        journal: [
          { kind: 'structural', op: { op: 'node-update', nodeId: 'n1', before, after: rawAfter }, at: new Date().toISOString() },
        ],
        cursor: 0,
      }))
      const store: RagStore = createJsonRagStore({ path: file })
      await store.redo()
      const stored = readOnDisk(file).nodes.find((n) => n.id === 'n1')!
      expect(stored.documentPath).toBeUndefined()
      expect(stored.tags).toEqual(['x', 'y'])
      expect(stored.hash).toBe(specNodeHash(stored))

      const reloaded: RagStore = createJsonRagStore({ path: file })
      expect(reloaded.status().corrupt).toBe(false)
      expect(reloaded.status().quarantined).toEqual([])
      expect(reloaded.status().loadedNodes).toContain('n1')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
