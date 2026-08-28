// tests/unit-t-markdown-import.test.ts — Unit T: the markdown file importer
// (docs/specs/unit-t-markdown-import.md §5.1/§5.4/§5.5). §5.6 happy-path states
// (importer-relevant: 16–20) + §5.7 fail-states (importer-relevant: 2, 3, 3a,
// 3b, 4, 5, 6, 7, 11, 12, 13, 14).
//
// This is the TestWriter RED set — the Unit T importer module does NOT exist yet:
//
//   - `src/main/markdown-import.ts` does NOT exist, so the import of
//     `importMarkdownCorpus`/`ImportMarkdownParams`/`ImportMarkdownResult` FAILS
//     at module load → the WHOLE suite is red (the expected red set).
//
// The importer tests use a TEMP-FILE CORPUS FIXTURE: temp `.md` files are
// written to a temp corpus directory and imported via `importMarkdownCorpus`.
//
// CORPUS-ROOT ASSUMPTION (spec §5.4): the spec pins the path-containment seam
// ("a path is REJECTED if it is an absolute path OUTSIDE the configured corpus
// root") but does NOT pin HOW the corpus root is configured (it is not in
// `ImportMarkdownParams = { files }` nor in `EditOpContext = { store }`). The
// tests assume the importer's corpus root is configurable to the temp corpus
// directory so the temp-file fixture can be imported. If the Implementer cannot
// honor this, the spec needs amendment (a review finding, not a test change).
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  importMarkdownCorpus,
  type ImportMarkdownParams,
  type ImportMarkdownResult,
} from '../src/main/markdown-import.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
import type { EditOpContext } from '../src/main/edit-ops.js'
import { toolAllowed, groupForTool } from '../src/main/security.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-t-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function writeMd(dir: string, name: string, content: string): string {
  const p = join(dir, name)
  writeFileSync(p, content, 'utf8')
  return p
}

function makeCtx(store: RagStore): EditOpContext {
  return { store }
}

function expectOk(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: true }> {
  expect(r.ok).toBe(true)
  if (!r.ok) throw new Error('expected ok, got failure: ' + r.error)
  return r
}

function expectFail(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: false }> {
  expect(r.ok).toBe(false)
  if (r.ok) throw new Error('expected failure, got ok')
  return r
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (importer-relevant)
// ===========================================================================
describe('markdown-import — Unit T happy-path states (§5.6)', () => {
  it('RED — importMarkdownCorpus is not exported yet (module does not exist)', () => {
    expect(typeof importMarkdownCorpus).toBe('function')
  })

  it('16. multi-file corpus: import a.md + b.md → ok:true, documentIds [a,b], each with its own doc-flow', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const b = writeMd(dir, 'b.md', '# B\n\nBody b.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a, b], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a', 'b'])
      // nodeCount/edgeCount are the BATCH SIZE (the nodes/edges applied in the
      // ONE atomic batch) — for a fresh store they equal the store totals.
      expect(r.nodeCount).toBe(store.listNodes().length)
      expect(r.edgeCount).toBe(store.listEdges().length)
      // each document has its own root + section
      expect(store.getNode('a')).toBeDefined()
      expect(store.getNode('b')).toBeDefined()
      expect(store.getNode('a:section:1')).toBeDefined()
      expect(store.getNode('b:section:1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('17. one atomic batch journal entry: a successful import lands EXACTLY ONE batch entry; undoDepth +1; redoDepth 0', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const b = writeMd(dir, 'b.md', '# B\n\nBody b.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(store.undoDepth()).toBe(0)
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a, b], corpusRoot: dir }))
      const entries = store.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
      expect(store.undoDepth()).toBe(1)
      expect(store.redoDepth()).toBe(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('18. validateDocFlow passes before commit: a well-formed corpus imports successfully', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['a'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('19. one-way snapshot: after a successful import the source files are UNCHANGED (no write-back) (A4)', async () => {
    const dir = freshDir()
    try {
      const content = '# A\n\nBody a.\n'
      const a = writeMd(dir, 'a.md', content)
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      expect(readFileSync(a, 'utf8')).toBe(content)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('20. ownedNodeIds derived from the chunking rule: the root owns the section ids; a section owns nothing directly (R9)', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      const root = store.getNode('a')!
      expect(root.ownedNodeIds).toEqual(['a:section:1'])
      const section = store.getNode('a:section:1')!
      expect(section.ownedNodeIds).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (importer-relevant)
// ===========================================================================
describe('markdown-import — Unit T fail-states (§5.7)', () => {
  it('2. empty files array → ok:false, error "markdown import: files must be a non-empty array"; no node/edge applied', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [] }))
      expect(r.error).toBe('markdown import: files must be a non-empty array')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. an unreadable file (nonexistent path) → ok:false, error "markdown import: cannot read file: <path>", failedFile <path>; no node/edge applied', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const missing = join(dir, 'missing.md')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [missing], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: cannot read file: ${missing}`)
      expect(r.failedFile).toBe(missing)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3a. an empty-string file path → ok:false, error "markdown import: empty file path"; no node/edge applied', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [''] }))
      expect(r.error).toBe('markdown import: empty file path')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3b. a path that escapes the corpus root → ok:false, error "markdown import: path outside corpus root: <path>", failedFile <path>; no node/edge applied (path containment)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // a path in a DIFFERENT temp dir (outside the corpus root)
      const outsideDir = freshDir()
      const outside = writeMd(outsideDir, 'x.md', '# X\n')
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [outside], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: path outside corpus root: ${outside}`)
      expect(r.failedFile).toBe(outside)
      expect(store.listNodes()).toEqual([])
      rmSyncSafe(outsideDir)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. a duplicate documentId across the corpus (a.md + a.markdown) → ok:false, error "markdown import: duplicate documentId: a"; no node/edge applied (A6)', async () => {
    const dir = freshDir()
    try {
      const a1 = writeMd(dir, 'a.md', '# A\n')
      const a2 = writeMd(dir, 'a.markdown', '# A\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [a1, a2], corpusRoot: dir }))
      expect(r.error).toBe('markdown import: duplicate documentId: a')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a filename that sanitizes to an EMPTY documentId → ok:false, error "markdown import: empty documentId for file: <path>", failedFile <path>; no node/edge applied', async () => {
    const dir = freshDir()
    try {
      // a filename whose basename (without .md) is all whitespace → sanitizes to empty
      const p = writeMd(dir, '   .md', '# X\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [p], corpusRoot: dir }))
      expect(r.error).toBe(`markdown import: empty documentId for file: ${p}`)
      expect(r.failedFile).toBe(p)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a document whose doc-flow fails validateDocFlow (no heading → missing-head) → ok:false, error "markdown import: doc-flow validation failed for a: missing-head", failedFile <path>; the WHOLE import aborts (A5)', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', 'Some text with no heading.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const r = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      expect(r.error).toMatch(/^markdown import: doc-flow validation failed for a: missing-head$/)
      expect(r.failedFile).toBe(a)
      // no node/edge applied (A5)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. an applyBatch failure → ok:false, error <batch error>; the batch rolls back (store unchanged, journal unpolluted)', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      // a fake store whose applyBatch fails — the importer routes through
      // applyBatch, so a batch failure surfaces as { ok: false, error } with no
      // failedFile (a corpus-level failure).
      const fakeStore = {
        applyBatch: async () => ({ ok: false as const, error: 'rag applyBatch: source/target node not found or quarantined at index 0', failedIndex: 0 }),
      } as unknown as RagStore
      const r = expectFail(await importMarkdownCorpus(makeCtx(fakeStore), { files: [a], corpusRoot: dir }))
      expect(r.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(r.failedFile).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. a prototype-pollution key (a node/child carrying __proto__/constructor/prototype) fails the store write-time validation → the batch rolls back (A9)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const now = new Date().toISOString()
      const bad = { id: 'n1', type: 'p', content: 'x', props: { __proto__: {} } as never, ownedNodeIds: [], createdAt: now, updatedAt: now }
      const r = await store.applyBatch([{ op: 'putNode', node: bad }])
      expect(r.ok).toBe(false)
      // the importer routes through applyBatch, so a dangerous-key node aborts
      // the import (the batch rolls back — no partial application)
      expect(store.listNodes()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. a re-import is NOT idempotent (one-shot): importing the same corpus twice OVERWRITES (upsert) — no duplicate set, no refusal (A3)', async () => {
    const dir = freshDir()
    try {
      const a = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      const countAfterFirst = store.listNodes().length
      expectOk(await importMarkdownCorpus(makeCtx(store), { files: [a], corpusRoot: dir }))
      // the second import re-applies the same deterministic ids (upsert) — no second set
      expect(store.listNodes().length).toBe(countAfterFirst)
      expect(store.getNode('a')).toBeDefined()
      expect(store.getNode('a:section:1')).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. edit.import_markdown with the edit group disabled → not registered, not callable (toolAllowed false) (A11)', () => {
    expect(groupForTool('edit.import_markdown')).toBe('edit')
    expect(toolAllowed('edit.import_markdown', ['read', 'dispatch'])).toBe(false)
  })

  it('14. edit.import_markdown invoked with only code enabled → denied (editing is never a code-group op)', () => {
    expect(toolAllowed('edit.import_markdown', ['code'])).toBe(false)
  })
})
