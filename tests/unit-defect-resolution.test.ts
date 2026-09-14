// tests/unit-defect-resolution.test.ts — TestWriter RED pass for the six open
// HOST defects (the HOST-* findings). One `describe` block per defect, each a
// regression-first group: every group MUST be RED against the CURRENT code and
// GREEN after the matched fix lands. This file NEVER touches src/.
//
// Convention: mirrors `tests/unit-u-import-1-import-surface.test.ts` (vitest,
// `import ... from '../src/main/*.js'`, `node:fs` mkdtemp temp-dir fixtures,
// `node:fs` readFileSync source-pins for module-private seams).
//
// RED CONTRACT per defect:
//   1. HOST-MS4-10  — the MCP `edit.import_markdown` handler pre-filters
//      non-string `files` and never lets the importer's fail-loud reject them.
//      The PURE importer (`importMarkdownCorpus`) already fails-loud on a
//      non-string element (this part is green-on-arrival and documents the safe
//      importer); the actual HOST gap is the handler pre-filter, pinned via a
//      source-pin that the import case must NOT pre-filter `args.files`.
//   2. HOST-SNAPSHOT-COPY-NODEKIND — `createSnapshotStore`'s internal `copyNode`
//      drops `nodeKind`.
//   3. HOST-JOURNAL-CHILD-DANGEROUS-KEY — `isValidChildren` (rag-store, module-
//      private) rejects a dangerous key in `child.props` but NOT on the child
//      object itself (`__proto__`/`constructor`/`prototype`).
//   4. HOST-NODEKIND-JOURNAL-INVERTIBILITY — a `nodeKind`-only edit takes the
//      `content` journal branch (not `structural`), so `undo()` cannot restore
//      `nodeKind`.
//   5. HOST-DOCID-DOT-SEGMENT — `sanitizeDocumentId` mints all-dot ids
//      (`...md` → `..`, `..md` → `.`) instead of rejecting them as empty.
//   6. HOST-RAG-GROUP-LABEL-STALE — `GROUP_LABELS.rag` is missing
//      `list_documents`, `rag-stream`, and `get_query_audit_log`.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { importMarkdownCorpus, type ImportMarkdownResult } from '../src/main/markdown-import.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
import type { EditOpContext } from '../src/main/edit-ops.js'
import { createSnapshotStore } from '../src/main/adjacency.js'

// ---- temp-dir helpers (repo convention, contained to the repo) -------------

function freshDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), `def-${prefix}-`))
}
function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

const iso = new Date().toISOString()

// ===========================================================================
// 1 · HOST-MS4-10 — edit.import_markdown must NOT silently drop non-string `files`
// ===========================================================================
describe('HOST-MS4-10 · edit.import_markdown must not silently pre-filter non-string files', () => {
  // Two-part pin: (a) the PURE importer already fails-loud on a non-string
  // element (importer-level safety — green-on-arrival); (b) the MCP handler's
  // pre-filter must be REMOVED so the importer actually sees the mixed array
  // (the source-pin that is RED today and turns green when the handler stops
  // pre-filtering to the string subset).
  it('importer-level: a non-string element fails-loud with the empty-file-path error (never a silent partial ingest)', async () => {
    // A mixed array must reach the importer UNFILTERED. Put a VALID a.md at the
    // corpus root so the loop passes it and the next element (42) hits the
    // importer's non-string guard → fail-loud `empty file path`.
    const dir = freshDir('ms410-imp')
    writeFileSync(join(dir, 'a.md'), '# A\n\nBody a.\n', 'utf8')
    try {
      const ctx: EditOpContext = { store: createJsonRagStore({ path: join(dir, 'rag.json') }) }
      const r: ImportMarkdownResult = await importMarkdownCorpus(ctx, {
        files: ['a.md', 42 as never],
        corpusRoot: dir,
      })
      expect(r).toEqual({ ok: false, error: 'markdown import: empty file path' })
      expect(r).not.toMatchObject({ ok: true })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('source-pin: the edit.import_markdown case must pass args.files WITHOUT a string pre-filter', () => {
    const mcpSrc = readFileSync(join(process.cwd(), 'src/main/mcp-server.ts'), 'utf8')
    // The import case currently binds `const files = Array.isArray(args.files)
    // ? (args.files as unknown[]).filter(...) : []` (~1488), silently dropping
    // non-string elements so the importer's `markdown import: empty file path`
    // fail-loud is bypassed. RED today; GREEN only when the handler stops
    // pre-filtering and lets the importer reject the mixed array.
    expect(mcpSrc, 'the import handler must NOT pre-filter args.files to strings (HOST-MS4-10)').not.toContain('(args.files as unknown[]).filter')
  })
})

// ===========================================================================
// 2 · HOST-SNAPSHOT-COPY-NODEKIND — copyNode must copy nodeKind
// ===========================================================================
describe('HOST-SNAPSHOT-COPY-NODEKIND · createSnapshotStore/copyNode must preserve nodeKind', () => {
  it('a node read back from createSnapshotStore keeps its nodeKind', () => {
    const store = createSnapshotStore(
      [{ id: 'x', type: 'p', content: 'c', nodeKind: 'fact', ownedNodeIds: [], createdAt: iso, updatedAt: iso }],
      [],
    )
    const n = store.getNode('x')
    expect(n).toBeDefined()
    // RED today: `copyNode` (~adjacency.ts:44) copies the public record but NOT
    // `nodeKind`, so this is `undefined`; GREEN after it copies `nodeKind`.
    expect(n?.nodeKind).toBe('fact')
  })

  it('listNodes from the snapshot also preserves nodeKind', () => {
    const store = createSnapshotStore(
      [{ id: 'y', type: 'em', content: 'i', nodeKind: 'reference', ownedNodeIds: [], createdAt: iso, updatedAt: iso }],
      [],
    )
    expect(store.listNodes()[0]?.nodeKind).toBe('reference')
  })
})

// ===========================================================================
// 3 · HOST-JOURNAL-CHILD-DANGEROUS-KEY — isValidChildren must reject a
//     dangerous key on the child OBJECT itself
// ===========================================================================
describe('HOST-JOURNAL-CHILD-DANGEROUS-KEY · isValidChildren rejects a dangerous key on the child itself', () => {
  // `isValidChildren` (src/main/rag-store.ts ~506) is module-private. The write
  // path (`validateNodeShape`) already rejects a `__proto__`-bearing child
  // (~433), so the gap is observable only through the journal/boot validator.
  // Pin via a source-pin mirroring `validateNodeShape`'s child guard: the
  // function must check `hasDangerousKey(child)` (the child own-object), not
  // just `hasDangerousKey(child.props)`.
  it('source-pin: isValidChildren applies the dangerous-key guard to the child OBJECT, mirroring validateNodeShape', () => {
    const ragSrc = readFileSync(join(process.cwd(), 'src/main/rag-store.ts'), 'utf8')
    expect(ragSrc, 'isValidChildren must reject a dangerous key on the child itself (HOST-JOURNAL-…-KEY)').toContain('hasDangerousKey(child)')
  })

  it('source-pin: the props-level guard is still present (a dangerous key in child.props keeps rejecting)', () => {
    const ragSrc = readFileSync(join(process.cwd(), 'src/main/rag-store.ts'), 'utf8')
    expect(ragSrc, 'the child.props dangerous-key guard must be retained').toContain('hasDangerousKey(child.props)')
  })
})

// ===========================================================================
// 4 · HOST-NODEKIND-JOURNAL-INVERTIBILITY — a nodeKind-only edit must take the
//     `structural` journal branch and be undo-invertible
// ===========================================================================
describe('HOST-NODEKIND-JOURNAL-INVERTIBILITY · nodeKind-only edit is journal-invertible', () => {
  it('a nodeKind-only edit lands as a structural entry and undo() restores nodeKind', async () => {
    const dir = freshDir('nodekind')
    const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
    try {
      await store.putNode({ id: 'n1', type: 'p', content: 'x', ownedNodeIds: [], createdAt: iso, updatedAt: iso })
      // nodeKind-only change (nodeKind undefined → 'fact'); nothing else moves.
      await store.putNode({ id: 'n1', type: 'p', content: 'x', nodeKind: 'fact', ownedNodeIds: [], createdAt: iso, updatedAt: iso })

      const journal = store.journal()
      const lastEdit = journal[journal.length - 1]
      // RED today: the structural-branch condition (~rag-store.ts:1052) omits
      // nodeKindChanged, so this lands as `content`; GREEN after the structural
      // branch also triggers on nodeKindChanged.
      expect(lastEdit.kind, 'a nodeKind-only edit must be a structural (node-update) journal entry').toBe('structural')

      await store.undo()
      const n = store.getNode('n1')
      // RED today: a `content` undo only restores content/children/props, so
      // nodeKind stays 'fact'; GREEN when undo (structural) restores it.
      expect(n?.nodeKind, 'undo() must restore nodeKind to its pre-edit (undefined) value').toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// 5 · HOST-DOCID-DOT-SEGMENT — sanitizeDocumentId must reject all-dot basenames
// ===========================================================================
describe('HOST-DOCID-DOT-SEGMENT · all-dot document ids are rejected as empty (never minted)', () => {
  // `sanitizeDocumentId` (src/main/markdown-import.ts ~69) is module-private;
  // the seam is the exported `importMarkdownCorpus`: a `...md`/`..md` basename
  // mints `..`/`.` today and imports OK; the fix maps the all-dot sanitized
  // result to '' so it takes the `empty documentId` reject. RED today (import
  // succeeds), GREEN after the fix (rejected).
  async function importDotFile(name: string): Promise<ImportMarkdownResult> {
    const dir = freshDir('docid-dot')
    writeFileSync(join(dir, name), '# A\n\nBody a.\n', 'utf8')
    const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
    try {
      return await importMarkdownCorpus({ store }, { files: [join(dir, name)], corpusRoot: dir })
    } finally {
      rmSyncSafe(dir)
    }
  }

  it('sanitize of `...md` must collapse to the empty reject (minted `..` today)', async () => {
    const r = await importDotFile('...md')
    // RED today: `sanitizeDocumentId('...md')` → `..` (non-empty) so the import
    // succeeds (ok:true); GREEN after an all-dot result maps to '' (the
    // empty-documentId reject).
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('empty documentId')
  })

  it('sanitize of `..md` must collapse to the empty reject (minted `.` today)', async () => {
    const r = await importDotFile('..md')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toContain('empty documentId')
  })
})

// ===========================================================================
// 6 · HOST-RAG-GROUP-LABEL-STALE — GROUP_LABELS.rag under-describes the group
// ===========================================================================
describe('HOST-RAG-GROUP-LABEL-STALE · GROUP_LABELS.rag lists every rag-gated tool', () => {
  // `GROUP_LABELS` (src/renderer/secure-panels.ts ~94) is module-private →
  // source-pin. The `rag` label currently enumerates only
  // `rag.query, get_document, list_nodes, get_edges, backlinks` and MISSES
  // `list_documents`, `rag-stream`, `get_query_audit_log`. RED on all three.
  it('source-pin: the rag label names list_documents, rag-stream, and get_query_audit_log', () => {
    const src = readFileSync(join(process.cwd(), 'src/renderer/secure-panels.ts'), 'utf8')
    expect(src, 'GROUP_LABELS.rag must mention list_documents').toContain('list_documents')
    expect(src, 'GROUP_LABELS.rag must mention rag-stream').toContain('rag-stream')
    expect(src, 'GROUP_LABELS.rag must mention get_query_audit_log').toContain('get_query_audit_log')
  })
})
