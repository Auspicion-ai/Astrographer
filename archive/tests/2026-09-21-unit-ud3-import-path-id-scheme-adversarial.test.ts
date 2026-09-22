// tests/unit-ud3-import-path-id-scheme-adversarial.test.ts — Unit U-D3
// adversarial regression set (ADV-1, HOST).
//
// ADV-1: the alias map in `src/main/markdown-import.ts` was keyed by DEPTH
// only (`Map<number, Map<string, string>>`), so two different raw directory
// segments at the same depth but under DIFFERENT parent paths (e.g.
// `docs/2024/` and `specs/2024/`) were wrongly treated as an alias and the
// WHOLE import was rejected — even though their final ids differ
// (`docs/2024/x` ≠ `specs/2024/y`) and no derived-tree merge occurs.
//
// The fix scopes the alias to the SAME sanitized PARENT PATH: two distinct
// raws alias only when they sanitize to the same segment UNDER THE SAME
// SANITIZED ANCESTOR PATH. This file pins:
//   (a) `docs/2024/x.md` + `specs/2024/y.md` import OK (different parents);
//   (b) the SAME-parent alias still rejects (`a/2024!/x.md` + `a/2024?/y.md`
//       → the depth-1 alias message);
//   (c) the depth-0 alias still rejects (`2024!/x.md` + `2024?/y.md`);
//   (d) two files in the SAME raw dir do not alias.
//
// Harness derived from tests/unit-ud3-import-path-id-scheme.test.ts. NO
// Electron, NO registry wiring.
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

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-ud3-adv-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

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

function md(heading: string, body = 'Body'): string {
  return `# ${heading}\n\n${body}.\n`
}

describe('U-D3 adversarial ADV-1 — alias scoped to the SAME sanitized parent path', () => {
  it('(a) same depth, DIFFERENT parents (`docs/2024` vs `specs/2024`) do NOT alias and both import', async () => {
    const dir = freshDir()
    try {
      const fx = writeMd(dir, 'docs/2024/x.md', md('X'))
      const fy = writeMd(dir, 'specs/2024/y.md', md('Y'))
      const store = newStore(dir, 'adv-a')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fx, fy], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['docs/2024/x', 'specs/2024/y'])
      expect(store.getNode('docs/2024/x')!.documentPath).toEqual(['docs', '2024'])
      expect(store.getNode('specs/2024/y')!.documentPath).toEqual(['specs', '2024'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('(b) SAME parent alias still rejects: `a/2024!/x.md` + `a/2024?/y.md` → depth-1 alias message', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, 'a/2024!/x.md', md('X'))
      const fb = writeMd(dir, 'a/2024?/y.md', md('Y'))
      const store = newStore(dir, 'adv-b')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.error).toBe(
        'markdown import: path segment alias at position 1: "2024!" and "2024?" both sanitize to "2024"',
      )
      expect(r.failedFile).toBe(fb)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('(c) depth-0 alias still rejects: `2024!/x.md` + `2024?/y.md` → position 0', async () => {
    const dir = freshDir()
    try {
      const fa = writeMd(dir, '2024!/x.md', md('X'))
      const fb = writeMd(dir, '2024?/y.md', md('Y'))
      const store = newStore(dir, 'adv-c')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      expect(r.error).toBe(
        'markdown import: path segment alias at position 0: "2024!" and "2024?" both sanitize to "2024"',
      )
      expect(r.failedFile).toBe(fb)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('(d) two files in the SAME raw dir do NOT alias', async () => {
    const dir = freshDir()
    try {
      const fx = writeMd(dir, 'a/x.md', md('X'))
      const fy = writeMd(dir, 'a/y.md', md('Y'))
      const store = newStore(dir, 'adv-d')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fx, fy], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a/x', 'a/y'])
      expect(store.getNode('a/x')!.documentPath).toEqual(['a'])
      expect(store.getNode('a/y')!.documentPath).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('(e) same sanitized child under the SAME sanitized parent rejects, but a DIFFERENT sanitized parent with the identical sanitized child does not', async () => {
    const dir = freshDir()
    try {
      const store = newStore(dir, 'adv-e')
      // depth-0 distinct parents `a!x`→`a-x` and `a?x`→`a-x` alias (unchanged).
      const fa = writeMd(dir, 'a!x/x.md', md('X'))
      const fb = writeMd(dir, 'a?x/y.md', md('Y'))
      expectFail(await importMarkdownCorpus(makeCtx(store), { files: [fa, fb], corpusRoot: dir }))
      // but `a-x/2024!` and `b-x/2024?` (different sanitized parents) do not.
      const fc = writeMd(dir, 'a-x/2024!/x.md', md('X'))
      const fd = writeMd(dir, 'b-x/2024?/y.md', md('Y'))
      const store2 = newStore(dir, 'adv-e2')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store2), { files: [fc, fd], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a-x/2024/x', 'b-x/2024/y'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('(f) non-default store: scoped alias behavior is preserved through the `<name>:` mint', async () => {
    const dir = freshDir()
    try {
      const fx = writeMd(dir, 'docs/2024/x.md', md('X'))
      const fy = writeMd(dir, 'specs/2024/y.md', md('Y'))
      const store = newStore(dir, 'adv-f')
      const ctx: ImportStoreContext = { name: 'S', isDefault: false }
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [fx, fy], corpusRoot: dir }, ctx))
      expect(r.documentIds).toEqual(['S:docs/2024/x', 'S:specs/2024/y'])
      // same-parent alias still rejects under a non-default store.
      const fa = writeMd(dir, 'p/2024!/x.md', md('X'))
      const fb = writeMd(dir, 'p/2024?/y.md', md('Y'))
      const store2 = newStore(dir, 'adv-f2')
      const r2 = expectFail(await importMarkdownCorpus(makeCtx(store2), { files: [fa, fb], corpusRoot: dir }, ctx))
      expect(r2.error).toBe(
        'markdown import: path segment alias at position 1: "2024!" and "2024?" both sanitize to "2024"',
      )
    } finally {
      rmSyncSafe(dir)
    }
  })
})
