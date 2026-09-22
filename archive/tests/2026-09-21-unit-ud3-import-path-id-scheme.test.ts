// tests/unit-ud3-import-path-id-scheme.test.ts — Unit U-D3: import path
// derivation + the path-qualified `/`-joined `documentId` scheme
// (docs/specs/unit-ud3-import-path-id-scheme.md).
//
// RED SET (RCA-1) — written BEFORE any U-D3 implementation exists. The module
// `src/main/markdown-import.ts` EXISTS (Unit T/U-MS4) but still mints
// `documentId = sanitizeDocumentId(basename(file))` with no `documentPath`
// derivation, so every path-qualified assertion below fails against the legacy
// (basename-only) behavior at RUNTIME. vitest does not typecheck; the file runs.
//
// Every assertion derives from docs/specs/unit-ud3-import-path-id-scheme.md
// ALONE (the corrected post-RCA-10 spec):
//   §5.1 sanitizeSegment (charset rule, NO extension stripping, strips
//        leading/trailing `-`), the UNCHANGED basename sanitizeDocumentId
//   §5.2 deriveDocumentPath (logical-path dir segments, `''`⇒`[]`, path.sep→`/`)
//   §5.3 the `/`-joined mint; default `<joined>` / non-default `${name}:${joined}`
//        applied to the WHOLE joined path exactly once; A1 on joinedId; F2 on the
//        final id; the alias message order PRIOR-raw then CURRENT-raw
//   §5.4 documentPath set on the ROOT node only; `[]`⇒absent
//   §5.5 the fail-state matrix
//   §5.6 happy-path states 1–15
//   §5.7 fail-states 1–10 (incl. the corrected a!x/a?x ⇒ a-x alias example and
//        the composed/decomposed café/cafe\u0301 non-alias)
//   §5.8 the importer mint census (root/section/block/edge id shapes)
//
// Conventions follow tests/unit-t-markdown-import.test.ts +
// tests/unit-ms4-id-prefixing.test.ts (temp corpora via mkdtemp + writeMd,
// makeCtx, importMarkdownCorpus, expectOk/expectFail, byte-exact messages,
// `.js` import suffix for the main-process ESM modules). NO Electron, NO
// registry wiring.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
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
// Harness (Unit T fixture pattern)
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-ud3-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** Write a corpus file; creates any missing parent directories (nested corpora). */
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

/** `documentPath` own-property probe (§5.4: absent, never `undefined`/`[]`). */
function hasDocPath(node: { documentPath?: string[] } | undefined): boolean {
  return !!node && Object.prototype.hasOwnProperty.call(node, 'documentPath')
}

/** The minimal document: root `div` + one `section:1` + one `p:1`; 5 edges. */
function md(heading: string, body = 'Body'): string {
  return `# ${heading}\n\n${body}.\n`
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES
// ===========================================================================
describe('U-D3 §5.6 — happy-path states (path-qualified id + documentPath)', () => {
  it('1. nested `a/readme.md` ⇒ documentId `a/readme`, root documentPath [a], section/block/edge ids inherit the `/` id', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store = newStore(dir, 'h1')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/readme'])
      const root = store.getNode('a/readme')
      expect(root).toBeDefined()
      expect(root!.documentPath).toEqual(['a'])
      expect(store.getNode('a/readme:section:1')).toBeDefined()
      expect(store.getNode('a/readme:p:1')).toBeDefined()
      expect(store.listEdges().map((e) => e.id)).toContain('e-a/readme-1')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. multi-level `a/b/c.md` ⇒ documentPath [a,b], id `a/b/c`, ids `a/b/c:section:1`', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/b/c.md', md('C'))
      const store = newStore(dir, 'h2')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/b/c'])
      expect(store.getNode('a/b/c')!.documentPath).toEqual(['a', 'b'])
      expect(store.getNode('a/b/c:section:1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. root-level `readme.md` is unchanged: id `readme`, NO root documentPath own-property', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'readme.md', md('Readme'))
      const store = newStore(dir, 'h3')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['readme'])
      const root = store.getNode('readme')
      expect(root).toBeDefined()
      expect(hasDocPath(root)).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. repeated basenames `a/readme.md` + `b/readme.md` ⇒ distinct ids `a/readme`/`b/readme`; both roots carry their own documentPath', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a/readme.md', md('A'))
      const fb = writeMd(dir, 'b/readme.md', md('B'))
      const store = newStore(dir, 'h4')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/readme', 'b/readme'])
      expect(store.getNode('a/readme')!.documentPath).toEqual(['a'])
      expect(store.getNode('b/readme')!.documentPath).toEqual(['b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. non-default store `S` ⇒ documentId `S:a/readme`, root documentPath [a]; first `:`-segment is S (INV-3)', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store = newStore(dir, 'h5')
      const ctx: ImportStoreContext = { name: 'S', isDefault: false }
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }, ctx))
      expect(r.documentIds).toEqual(['S:a/readme'])
      expect(store.getNode('S:a/readme')!.documentPath).toEqual(['a'])
      expect(store.getNode('S:a/readme:section:1')).toBeDefined()
      expect('S:a/readme:section:1'.split(':')[0]).toBe('S')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. F9 flat corpus `a.md`+`b.md` ⇒ ids [a,b], no root documentPath, exact pre-U-D3 node/edge ids', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a.md', md('A'))
      const fb = writeMd(dir, 'b.md', md('B'))
      const store = newStore(dir, 'h6')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a', 'b'])
      for (const id of ['a', 'b']) {
        const root = store.getNode(id)
        expect(hasDocPath(root)).toBe(false)
        expect(store.getNode(`${id}:section:1`)).toBeDefined()
        expect(store.getNode(`${id}:p:1`)).toBeDefined()
        for (let n = 1; n <= 5; n++) {
          expect(store.listEdges().map((e) => e.id)).toContain(`e-${id}-${n}`)
        }
      }
      // byte-exact pre-U-D3 node id set (no documentPath-bearing extras)
      expect(store.listNodes().map((n) => n.id).sort()).toEqual([
        'a',
        'a:p:1',
        'a:section:1',
        'b',
        'b:p:1',
        'b:section:1',
      ])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. segment charset: `A B`⇒`A-B`, `a.b`⇒`a.b`, case preserved (`A` ≠ `a`)', async () => {
    const dir = freshDir()
    try {
      const f1 = writeMd(dir, 'A B/c.md', md('C'))
      const f2 = writeMd(dir, 'a.b/c.md', md('C'))
      const f3 = writeMd(dir, 'A/x.md', md('X'))
      const f4 = writeMd(dir, 'a/x.md', md('X'))
      const store = newStore(dir, 'h7')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f1, f2, f3, f4], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['A-B/c', 'a.b/c', 'A/x', 'a/x'])
      expect(store.getNode('A/x')!.documentPath).toEqual(['A'])
      expect(store.getNode('a/x')!.documentPath).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. directory extension preserved (M4): `notes.md/x.md` ⇒ documentPath [notes.md], id `notes.md/x`', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'notes.md/x.md', md('X'))
      const store = newStore(dir, 'h8')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['notes.md/x'])
      expect(store.getNode('notes.md/x')!.documentPath).toEqual(['notes.md'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. Unicode collapse (non-empty): `café/x.md` ⇒ documentPath [caf], id `caf/x`; `A/x` ≠ `a/x`', async () => {
    const dir = freshDir()
    try {
      const f1 = writeMd(dir, 'café/x.md', md('X'))
      const f2 = writeMd(dir, 'A/y.md', md('Y'))
      const f3 = writeMd(dir, 'a/y.md', md('Y'))
      const store = newStore(dir, 'h9')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f1, f2, f3], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['caf/x', 'A/y', 'a/y'])
      expect(store.getNode('caf/x')!.documentPath).toEqual(['caf'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. separator mapping (POSIX): dir name `a\\b` ⇒ segment `a-b`', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a\\b/x.md', md('X'))
      const store = newStore(dir, 'h10')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a-b/x'])
      expect(store.getNode('a-b/x')!.documentPath).toEqual(['a-b'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. documentPath on the ROOT only: nested section + block nodes carry NO documentPath', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store = newStore(dir, 'h11')
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(hasDocPath(store.getNode('a/readme:section:1'))).toBe(false)
      expect(hasDocPath(store.getNode('a/readme:p:1'))).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. same directory, two files `a/x.md`+`a/y.md`: both roots documentPath [a], ids a/x,a/y, no alias', async () => {
    const dir = freshDir()
    try {
      const fx = writeMd(dir, 'a/x.md', md('X'))
      const fy = writeMd(dir, 'a/y.md', md('Y'))
      const store = newStore(dir, 'h12')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fx, fy], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/x', 'a/y'])
      expect(store.getNode('a/x')!.documentPath).toEqual(['a'])
      expect(store.getNode('a/y')!.documentPath).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. result echoes the final `/`-joined ids; nodeCount/edgeCount are the batch size', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store = newStore(dir, 'h13')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/readme'])
      expect(r.nodeCount).toBe(store.listNodes().length)
      expect(r.edgeCount).toBe(store.listEdges().length)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. deduping across directories does NOT fire F2 (`a/readme.md` + `b/readme.md` import together)', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a/readme.md', md('A'))
      const fb = writeMd(dir, 'b/readme.md', md('B'))
      const store = newStore(dir, 'h14')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/readme', 'b/readme'])
      expect(store.listNodes().length).toBe(r.nodeCount)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. documentPath rides the batch: store.getNode(joinedId).documentPath equals the sanitized segments', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/b/c.md', md('C'))
      const store = newStore(dir, 'h15')
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(store.getNode('a/b/c')!.documentPath).toEqual(['a', 'b'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES
// ===========================================================================
describe('U-D3 §5.7 — fail-states (byte-pinned messages)', () => {
  it('1. F2 duplicate final id: `a/readme.md` twice ⇒ `duplicate documentId: a/readme` (no failedFile); nothing applied', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store = newStore(dir, 'f1')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f, f], corpusRoot: dir }))
      expect(r.error).toBe('markdown import: duplicate documentId: a/readme')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. F3 empty directory segment: `!!!/readme.md` ⇒ `empty documentPath segment for file: <file>` + failedFile; nothing applied', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, '!!!/readme.md', md('Readme'))
      const store = newStore(dir, 'f2')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentPath segment for file: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. F3 non-ASCII segment collapsing to `\'\'`: `日本語/readme.md` ⇒ the F3 empty-segment message', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, '日本語/readme.md', md('Readme'))
      const store = newStore(dir, 'f3')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentPath segment for file: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. F3b empty basename: `a/!!!.md` ⇒ `empty documentId for file: <file>` + failedFile; nothing applied', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/!!!.md', md('X'))
      const store = newStore(dir, 'f4')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [f], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentId for file: ${f}`)
      expect(r.failedFile).toBe(f)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. F4 containment unchanged: a file outside the corpus root ⇒ `path outside corpus root: <file>` + failedFile', async () => {
    const dir = freshDir()
    const outsideDir = freshDir()
    try {
      const outside = writeMd(outsideDir, 'x.md', md('X'))
      const store = newStore(dir, 'f5')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [outside], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: path outside corpus root: ${outside}`)
      expect(r.failedFile).toBe(outside)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
      rmSyncSafe(outsideDir)
    }
  })

  it('6. aliasing depth 0: `a!x/x.md` (prior) + `a?x/y.md` (current) ⇒ position 0, `"a!x" and "a?x" both sanitize to "a-x"`; whole import rejected', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a!x/x.md', md('X'))
      const fb = writeMd(dir, 'a?x/y.md', md('Y'))
      const store = newStore(dir, 'f6')
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

  it('7. alias at a deeper position: `a/b!x/x.md` + `a/b?x/y.md` ⇒ position 1, `"b-x"`; depth-0 distinct pair unaffected', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a/b!x/x.md', md('X'))
      const fb = writeMd(dir, 'a/b?x/y.md', md('Y'))
      const store = newStore(dir, 'f7')
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

  it('8. F6 A1 collision on a flat joined id (reservedNames ["readme"] + `readme.md`); a nested `a/readme.md` does NOT collide', async () => {
    const dir = freshDir()
    try {
      const flat = writeMd(dir, 'readme.md', md('Readme'))
      const store = newStore(dir, 'f8')
      const ctx: ImportStoreContext = { name: 'main', isDefault: true, reservedNames: ['readme'] }
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [flat], corpusRoot: dir }, ctx))
      expect(r.error).toBe('markdown import: documentId collides with a registered store name: readme')
      expect(r.failedFile).toBe(flat)
      expect(store.listNodes()).toEqual([])
      // the slash-bearing nested id can never equal a slash-free store name
      const nested = writeMd(dir, 'a/readme.md', md('Readme'))
      const store2 = newStore(dir, 'f8b')
      const r2 = expectOk(await importMarkdownCorpus(makeCtx(store2), { files: [nested], corpusRoot: dir }, ctx))
      expect(r2.documentIds).toEqual(['a/readme'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. Unicode no normalization: composed `café` ⇒ `caf`, decomposed `cafe\\u0301` ⇒ `cafe`; distinct ⇒ no alias, both import', async () => {
    const dir = freshDir()
    try {
      const fc = writeMd(dir, 'café/x.md', md('X'))
      const fd = writeMd(dir, 'cafe\u0301/y.md', md('Y'))
      const store = newStore(dir, 'f9')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fc, fd], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['caf/x', 'cafe/y'])
      expect(store.getNode('caf/x')!.documentPath).toEqual(['caf'])
      expect(store.getNode('cafe/y')!.documentPath).toEqual(['cafe'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. alias state is per-call: importing one of the aliasing files alone (same store, later call) does NOT fail', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a!x/x.md', md('X'))
      const fb = writeMd(dir, 'a?x/y.md', md('Y'))
      const store = newStore(dir, 'f10')
      expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(store.listNodes()).toEqual([])
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fb], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a-x/y'])
      expect(store.getNode('a-x/y')!.documentPath).toEqual(['a-x'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F5. two stores importing the same relative path stay DISTINCT via the whole-path prefix (`a/readme` vs `S:a/readme`)', async () => {
    const dir = freshDir()
    try {
      const f = writeMd(dir, 'a/readme.md', md('Readme'))
      const store1 = newStore(dir, 'f5a')
      const store2 = newStore(dir, 'f5b')
      const r1 = expectOk(
        await importMarkdownCorpus(makeCtx(store1), { files: [f], corpusRoot: dir }, { name: 'S1', isDefault: false }),
      )
      const r2 = expectOk(
        await importMarkdownCorpus(makeCtx(store2), { files: [f], corpusRoot: dir }, { name: 'S2', isDefault: false }),
      )
      expect(r1.documentIds).toEqual(['S1:a/readme'])
      expect(r2.documentIds).toEqual(['S2:a/readme'])
      expect(store1.getNode('S1:a/readme')).toBeDefined()
      expect(store2.getNode('S2:a/readme')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
