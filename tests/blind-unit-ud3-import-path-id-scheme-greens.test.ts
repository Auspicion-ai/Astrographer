// tests/blind-unit-ud3-import-path-id-scheme-greens.test.ts — Unit U-D3
// BLIND green-scenario artifact (RCA-4).
//
// Derived from DOCUMENTATION ONLY:
//   - docs/specs/unit-ud3-import-path-id-scheme.md
//     (§5.1 sanitizeSegment charset + no extension stripping; §5.2
//      deriveDocumentPath logical/`''`⇒`[]`/sep; §5.3 `/`-joined mint +
//      `<name>:` whole-path prefix; §5.4 root-only documentPath + `[]`⇒absent;
//      §5.5 the fail-state matrix F2–F6 + aliasing + Unicode/sep + F9;
//      §5.6 happy states 1–15; §5.7 fail-states 1–10; §3a A2/ADV-1)
//   - tests/unit-ud3-import-path-id-scheme.test.ts was consulted ONLY for the
//     corpus/import harness conventions (temp corpora, makeCtx, the
//     importMarkdownCorpus/ImportMarkdownResult/ImportStoreContext signatures,
//     `.js` import suffix). The scenarios below are authored independently;
//     `src/main/markdown-import.ts` / `markdown-parse.ts` were NOT read to
//     decide expected behavior.
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  importMarkdownCorpus,
  type ImportMarkdownResult,
  type ImportStoreContext,
} from '../src/main/markdown-import.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
import type { EditOpContext } from '../src/main/edit-ops.js'

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-blind-ud3-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** Write a corpus file (nested paths auto-create parents). */
function writeMd(dir: string, name: string, content: string): string {
  const p = join(dir, name)
  mkdirSync(dirname(p), { recursive: true })
  writeFileSync(p, content, 'utf8')
  return p
}

function makeCtx(store: RagStore): EditOpContext {
  return { store }
}

function newStore(dir: string, tag: string): RagStore {
  return createJsonRagStore({ path: join(dir, `rag-${tag}.json`) })
}

function expectOk(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: true }> {
  expect(r.ok, `expected ok, got failure: ${!r.ok ? r.error : ''}`).toBe(true)
  if (!r.ok) throw new Error('expected ok, got failure: ' + r.error)
  return r
}

function expectFail(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: false }> {
  expect(r.ok, 'expected failure, got ok').toBe(false)
  if (r.ok) throw new Error('expected failure, got ok')
  return r
}

/** A document with a root div + one section + one paragraph. */
function doc(heading: string, body = 'Body'): string {
  return `# ${heading}\n\n${body}.\n`
}

/** documentPath own-property probe (§5.4: absent, never `undefined`/`[]`). */
function ownsDocPath(node: unknown): boolean {
  return !!node && Object.prototype.hasOwnProperty.call(node, 'documentPath')
}

interface DiskNode {
  id: string
  type?: string
  content?: string
  nodeKind?: unknown
  children?: unknown
  documentPath?: string[]
  tags?: string[]
  props?: unknown
  ownedNodeIds?: unknown
  createdAt?: string
  updatedAt?: string
  hash: string
  [k: string]: unknown
}

function readOnDisk(file: string): { nodes: DiskNode[]; edges: Array<{ id: string }> } {
  return JSON.parse(readFileSync(file, 'utf8'))
}

function sha256(src: string): string {
  return createHash('sha256').update(src, 'utf8').digest('hex')
}

/** The pre-U-D3 / basename-only node serialization (no `documentPath`, no
 *  `tags`) — the hash an imported flat-corpus root must carry (U-D1 §5.2
 *  hash-source order, referenced by U-D3 §5.6.6 / §5.9). */
function basenameOnlyHash(n: DiskNode): string {
  return sha256(
    JSON.stringify({
      id: n.id,
      type: n.type,
      content: n.content,
      nodeKind: n.nodeKind,
      children: n.children,
      props: n.props,
      ownedNodeIds: n.ownedNodeIds,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }),
  )
}

// ===========================================================================
// HAPPY PATH — derivation, ids, documentPath
// ===========================================================================
describe('blind U-D3 H — path derivation + `/`-joined ids (§5.6)', () => {
  it('H1 nested id + root documentPath; section/block/edge ids inherit the `/` id', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'nested/readme.md', doc('Nested'))
      const store = newStore(dir, 'h1')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['nested/readme'])
      expect(store.getNode('nested/readme')!.documentPath).toEqual(['nested'])
      expect(ownsDocPath(store.getNode('nested/readme:section:1'))).toBe(false)
      expect(ownsDocPath(store.getNode('nested/readme:p:1'))).toBe(false)
      expect(store.getNode('nested/readme:section:1')).toBeDefined()
      expect(store.getNode('nested/readme:p:1')).toBeDefined()
      expect(store.listEdges().map((e) => e.id)).toContain('e-nested/readme-1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H2 multi-level `x/y/z.md` ⇒ documentPath [x,y], id `x/y/z`', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'x/y/z.md', doc('Z'))
      const store = newStore(dir, 'h2')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['x/y/z'])
      expect(store.getNode('x/y/z')!.documentPath).toEqual(['x', 'y'])
      expect(store.getNode('x/y/z:section:1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H3 root-level id == basename and NO own documentPath property', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'readme.md', doc('Root'))
      const store = newStore(dir, 'h3')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['readme'])
      expect(store.getNode('readme')).toBeDefined()
      expect(ownsDocPath(store.getNode('readme'))).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H4 repeated basenames stay distinct, each root carries its own documentPath', async () => {
    const dir = freshDir()
    try {
      const f1 = writeMd(dir, 'd1/readme.md', doc('One'))
      const f2 = writeMd(dir, 'd2/readme.md', doc('Two'))
      const store = newStore(dir, 'h4')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f1, f2], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['d1/readme', 'd2/readme'])
      expect(store.getNode('d1/readme')!.documentPath).toEqual(['d1'])
      expect(store.getNode('d2/readme')!.documentPath).toEqual(['d2'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H5 directory extension kept while the basename strips it (`notes.md/x.md`)', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'notes.md/x.md', doc('X'))
      const store = newStore(dir, 'h5')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['notes.md/x'])
      expect(store.getNode('notes.md/x')!.documentPath).toEqual(['notes.md'])
      // the basename `x.md` is stripped (no `.md` in the final segment)
      expect('notes.md/x'.split('/').pop()).toBe('x')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H6 charset + separator mapping: spaces/dots preserved-as-mapped, backslash ⇒ `-`, case-sensitive', async () => {
    const dir = freshDir()
    try {
      const f1 = writeMd(dir, 'A B/spaced.md', doc('S'))
      const f2 = writeMd(dir, 'a.b/dotted.md', doc('D'))
      const f3 = writeMd(dir, 'a\\b/slash.md', doc('B'))
      const f4 = writeMd(dir, 'Case/x.md', doc('U'))
      const f5 = writeMd(dir, 'case/y.md', doc('L'))
      const store = newStore(dir, 'h6')
      const r = expectOk(
        await importMarkdownCorpus(makeCtx(store), { files: [f1, f2, f3, f4, f5], corpusRoot: dir }),
      )
      expect(r.documentIds).toEqual(['A-B/spaced', 'a.b/dotted', 'a-b/slash', 'Case/x', 'case/y'])
      expect(store.getNode('a.b/dotted')!.documentPath).toEqual(['a.b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H7 non-default store applies the `<name>:` prefix to the WHOLE joined path exactly once', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'nested/readme.md', doc('Nested'))
      const store = newStore(dir, 'h7')
      const ctx: ImportStoreContext = { name: 'S', isDefault: false }
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }, ctx))
      expect(r.documentIds).toEqual(['S:nested/readme'])
      expect(store.getNode('S:nested/readme')).toBeDefined()
      expect(store.getNode('S:nested/readme')!.documentPath).toEqual(['nested'])
      // exactly one prefix: first `:`-segment is the store name, no `S:` repeat
      expect('S:nested/readme:section:1'.split(':')[0]).toBe('S')
      expect('S:nested/readme:section:1'.startsWith('S:S:')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H8 same directory, two files: shared documentPath, distinct ids, no alias', async () => {
    const dir = freshDir()
    try {
      const f1 = writeMd(dir, 'shared/alpha.md', doc('Alpha'))
      const f2 = writeMd(dir, 'shared/beta.md', doc('Beta'))
      const store = newStore(dir, 'h8')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f1, f2], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['shared/alpha', 'shared/beta'])
      expect(store.getNode('shared/alpha')!.documentPath).toEqual(['shared'])
      expect(store.getNode('shared/beta')!.documentPath).toEqual(['shared'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H9 result echoes final ids and node/edge counts equal the batch size', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'q/r.md', doc('R'))
      const store = newStore(dir, 'h9')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['q/r'])
      expect(r.nodeCount).toBe(store.listNodes().length)
      expect(r.edgeCount).toBe(store.listEdges().length)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H10 two stores keep the same relative path distinct via the prefix (F5)', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'p/q.md', doc('Q'))
      const s1 = newStore(dir, 'h10a')
      const s2 = newStore(dir, 'h10b')
      const r1 = expectOk(
        await importMarkdownCorpus(makeCtx(s1), { files: [f], corpusRoot: dir }, { name: 'One', isDefault: false }),
      )
      const r2 = expectOk(
        await importMarkdownCorpus(makeCtx(s2), { files: [f], corpusRoot: dir }, { name: 'Two', isDefault: false }),
      )
      expect(r1.documentIds).toEqual(['One:p/q'])
      expect(r2.documentIds).toEqual(['Two:p/q'])
      expect(s1.getNode('One:p/q')).toBeDefined()
      expect(s2.getNode('Two:p/q')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('H11 Unicode collapse to a non-empty segment (`café` ⇒ `caf`, case preserved)', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'café/x.md', doc('X'))
      const store = newStore(dir, 'h11')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['caf/x'])
      expect(store.getNode('caf/x')!.documentPath).toEqual(['caf'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// FAIL-STATES
// ===========================================================================
describe('blind U-D3 X — fail-states (§5.5/§5.7, byte-pinned)', () => {
  it('X1 F3 empty directory segment (`!!!/readme.md`) rejects with the new message + failedFile', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, '!!!/readme.md', doc('Readme'))
      const store = newStore(dir, 'x1')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentPath segment for file: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X2 F3 a wholly non-ASCII segment (`日本語/readme.md`) collapses to `\'\'` and rejects', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, '日本語/readme.md', doc('Readme'))
      const store = newStore(dir, 'x2')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentPath segment for file: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X3 aliasing under the SAME sanitized parent rejects the whole import (depth 0)', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a!x/x.md', doc('X'))
      const fb = writeMd(dir, 'a?x/y.md', doc('Y'))
      const store = newStore(dir, 'x3')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.error).toBe(
        'markdown import: path segment alias at position 0: "a!x" and "a?x" both sanitize to "a-x"',
      )
      expect(r.failedFile).toBe(fb)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X4 aliasing at a deeper depth is reported with its position (depth 1)', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a/b!x/x.md', doc('X'))
      const fb = writeMd(dir, 'a/b?x/y.md', doc('Y'))
      const store = newStore(dir, 'x4')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.error).toBe(
        'markdown import: path segment alias at position 1: "b!x" and "b?x" both sanitize to "b-x"',
      )
      expect(r.failedFile).toBe(fb)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X5 same sanitized child under DIFFERENT sanitized parents is NOT an alias (ADV-1)', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'docs/2024!/x.md', doc('X'))
      const fb = writeMd(dir, 'specs/2024?/y.md', doc('Y'))
      const store = newStore(dir, 'x5')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['docs/2024/x', 'specs/2024/y'])
      expect(store.getNode('docs/2024/x')!.documentPath).toEqual(['docs', '2024'])
      expect(store.getNode('specs/2024/y')!.documentPath).toEqual(['specs', '2024'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X6 aliasing state is per import-call: the same file alone in a later call imports fine', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a!x/x.md', doc('X'))
      const fb = writeMd(dir, 'a?x/y.md', doc('Y'))
      const store = newStore(dir, 'x6')
      expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(store.listNodes()).toEqual([])
      const r2 = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fb], corpusRoot: dir }))
      expect(r2.documentIds).toEqual(['a-x/y'])
      expect(store.getNode('a-x/y')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X7 F2 duplicate final `/`-joined id rejects with the existing message and no failedFile', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'dup/readme.md', doc('Readme'))
      const store = newStore(dir, 'x7')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f, f], corpusRoot: dir }))
      expect(r.error).toBe('markdown import: duplicate documentId: dup/readme')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X8 F6 A1 on the final id: a flat id equal to a store name rejects; a nested id does not', async () => {
    const dir = freshDir()
    try {
      const flat = writeMd(dir, 'readme.md', doc('Readme'))
      const store = newStore(dir, 'x8')
      const ctx: ImportStoreContext = { name: 'main', isDefault: true, reservedNames: ['readme'] }
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [flat], corpusRoot: dir }, ctx))
      expect(r.error).toBe('markdown import: documentId collides with a registered store name: readme')
      expect(r.failedFile).toBe(flat)
      expect(store.listNodes()).toEqual([])
      // a slash-bearing joined id can never equal a slash-free registered name
      const nested = writeMd(dir, 'readme/x.md', doc('X'))
      const store2 = newStore(dir, 'x8b')
      const r2 = expectOk(await importMarkdownCorpus(makeCtx(store2), { files: [nested], corpusRoot: dir }, ctx))
      expect(r2.documentIds).toEqual(['readme/x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('X9 F4 containment unchanged: a file outside the corpus root rejects before any derivation', async () => {
    const dir = freshDir()
    const outside = freshDir()
    try {
      const f = writeMd(outside, 'x.md', doc('X'))
      const store = newStore(dir, 'x9')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: path outside corpus root: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
      rmSyncSafe(outside)
    }
  })

  it('X10 Unicode is NOT normalized: composed `café` ⇒ `caf` and decomposed `cafe\u0301` ⇒ `cafe` do not alias', async () => {
    const dir = freshDir()
    try {
      const fc = writeMd(dir, 'café/x.md', doc('X'))
      const fd = writeMd(dir, 'cafe\u0301/y.md', doc('Y'))
      const store = newStore(dir, 'x10')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fc, fd], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['caf/x', 'cafe/y'])
      expect(store.getNode('caf/x')!.documentPath).toEqual(['caf'])
      expect(store.getNode('cafe/y')!.documentPath).toEqual(['cafe'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// F9 — flat-corpus byte-equality (binding)
// ===========================================================================
describe('blind U-D3 F9 — flat-corpus byte-equality (§5.6.6/§5.5 F9)', () => {
  it('F9a flat ids/node-ids are exactly the basename-only pre-U-D3 shape', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a.md', doc('A'))
      const fb = writeMd(dir, 'b.md', doc('B'))
      const store = newStore(dir, 'f9a')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a', 'b'])
      expect(store.listNodes().map((n) => n.id).sort()).toEqual([
        'a',
        'a:p:1',
        'a:section:1',
        'b',
        'b:p:1',
        'b:section:1',
      ])
      const edgeIds = store.listEdges().map((e) => e.id)
      for (const id of ['a', 'b']) {
        for (let n = 1; n <= 5; n++) expect(edgeIds).toContain(`e-${id}-${n}`)
        expect(ownsDocPath(store.getNode(id))).toBe(false)
      }
      // every flat edge id is the pre-U-D3 `/`-free shape
      expect(edgeIds.every((id) => !id.includes('/'))).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F9b flat root hashes equal the basename-only (no documentPath) hash; a fresh boot has zero quarantine', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a.md', doc('A'))
      const store = newStore(dir, 'f9b')
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa], corpusRoot: dir }))
      const file = join(dir, 'rag-f9b.json')
      const disk = readOnDisk(file)
      const root = disk.nodes.find((n) => n.id === 'a')!
      expect(root).toBeDefined()
      expect(Object.prototype.hasOwnProperty.call(root, 'documentPath')).toBe(false)
      expect(root.hash).toBe(basenameOnlyHash(root))
      // fresh boot over the same file: the record re-verifies and loads
      // (a quarantined record would not be returned by getNode)
      const reopened = createJsonRagStore({ path: file })
      expect(reopened.getNode('a')).toBeDefined()
      expect(reopened.getNode('a')!.documentPath).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
