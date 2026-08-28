// src/main/markdown-import.ts — Unit T: the markdown file importer
// (docs/specs/unit-t-markdown-import.md §5.1/§5.4/§5.5). Reads the corpus files
// (with the path-containment seam — `params.corpusRoot`), parses each via
// `parseMarkdown`, validates each document's doc-flow via `validateDocFlow`
// BEFORE commit, and applies the whole corpus via `applyBatch` as ONE atomic
// batch journal entry (putNode ops before putEdge ops). NEVER throws for a
// domain failure; returns `{ ok: false, error, failedFile? }`.
import { readFileSync, statSync, realpathSync } from 'node:fs'
import { basename, resolve, sep } from 'node:path'
import type { EditOpContext } from './edit-ops.js'
import { parseMarkdown, type ParsedMarkdown } from './markdown-parse.js'
import { validateDocFlow } from './doc-flow.js'
import type { BatchOp } from './rag-store.js'

/** The import parameters: the markdown file paths to import (a corpus). */
export interface ImportMarkdownParams {
  /** The markdown file paths to import (a corpus). Each is read from disk. */
  files: string[]
  /** The corpus root — the base directory the path-containment seam resolves
   *  paths against. A path that escapes this root is rejected. Optional;
   *  defaults to the project root. The importer tests set it to a temp corpus
   *  dir. */
  corpusRoot?: string
}

/** The import result — a DISCRIMINATED result. `importMarkdownCorpus` NEVER
 *  throws for a domain failure (empty files, unreadable file, duplicate
 *  documentId, doc-flow violation, batch failure); it returns `{ ok: false }`.
 *  On success, `documentIds` lists the imported documents, `nodeCount`/
 *  `edgeCount` are the BATCH SIZE — the number of nodes/edges applied in the
 *  ONE atomic batch (NOT the resulting store totals). */
export type ImportMarkdownResult =
  | { ok: true; documentIds: string[]; nodeCount: number; edgeCount: number }
  | { ok: false; error: string; failedFile?: string }

/** True if `p` is within `root` (path containment). Handles the root-is-`/`
 *  case (root + sep would be `//`). */
function isWithin(p: string, root: string): boolean {
  if (p === root) return true
  if (root === sep) return p.startsWith(sep)
  return p.startsWith(root + sep)
}

/** Sanitize a filename (basename without the `.md` extension) to a valid RAG
 *  node id: non-empty; whitespace and characters invalid in an id are removed
 *  or replaced with `-`. Returns '' when the result is empty. */
function sanitizeDocumentId(basenameNoExt: string): string {
  const cleaned = basenameNoExt
    .replace(/\.markdown$/i, '')
    .replace(/\.md$/i, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned
}

/** Import a corpus of markdown files into the RAG store as a ONE-WAY SNAPSHOT.
 *  Reads each file, parses it, validates each document's doc-flow, and applies
 *  the whole corpus via applyBatch as ONE atomic batch journal entry. Async. */
export async function importMarkdownCorpus(
  ctx: EditOpContext,
  params: ImportMarkdownParams,
): Promise<ImportMarkdownResult> {
  if (!params || !Array.isArray(params.files) || params.files.length === 0) {
    return { ok: false, error: 'markdown import: files must be a non-empty array' }
  }
  const corpusRoot = resolve(params.corpusRoot ?? process.cwd())
  // Realpath the corpus root so the containment check compares canonical paths
  // (on macOS /tmp is a symlink to /private/tmp — a realpath'd file would
  // otherwise fail the containment check against a non-realpath'd root).
  let corpusRootReal: string
  try {
    corpusRootReal = realpathSync(corpusRoot)
  } catch {
    corpusRootReal = corpusRoot
  }

  // Read + parse each file, deriving its documentId.
  const documents: { documentId: string; parsed: ParsedMarkdown; file: string }[] = []
  const seenIds = new Set<string>()
  for (const file of params.files) {
    if (typeof file !== 'string' || file === '') {
      return { ok: false, error: 'markdown import: empty file path' }
    }
    const abs = resolve(file)
    // Path containment (logical): an absolute path outside the corpus root is
    // rejected. This uses the LOGICAL root (not the realpath'd root) so a file
    // path as given is checked against the root as given.
    if (!isWithin(abs, corpusRoot)) {
      return { ok: false, error: `markdown import: path outside corpus root: ${file}`, failedFile: file }
    }
    // A symlink or a directory is rejected (never read).
    let st
    try {
      st = statSync(abs)
    } catch {
      return { ok: false, error: `markdown import: cannot read file: ${file}`, failedFile: file }
    }
    if (st.isDirectory()) {
      return { ok: false, error: `markdown import: cannot read file: ${file}`, failedFile: file }
    }
    // Realpath the file, verify containment against the realpath'd root, and
    // READ THE REALPATH'D PATH (not the logical path) — this closes the TOCTOU
    // window where the file is swapped for a symlink between the check and the
    // read.
    let real: string
    try {
      real = realpathSync(abs)
      if (!isWithin(real, corpusRootReal)) {
        return { ok: false, error: `markdown import: path outside corpus root: ${file}`, failedFile: file }
      }
    } catch {
      return { ok: false, error: `markdown import: cannot read file: ${file}`, failedFile: file }
    }
    let content: string
    try {
      content = readFileSync(real, 'utf8')
    } catch {
      return { ok: false, error: `markdown import: cannot read file: ${file}`, failedFile: file }
    }
    const documentId = sanitizeDocumentId(basename(file))
    if (documentId === '') {
      return { ok: false, error: `markdown import: empty documentId for file: ${file}`, failedFile: file }
    }
    if (seenIds.has(documentId)) {
      return { ok: false, error: `markdown import: duplicate documentId: ${documentId}` }
    }
    seenIds.add(documentId)
    const parsed = parseMarkdown(content, documentId)
    documents.push({ documentId, parsed, file })
  }

  // Validate each document's doc-flow BEFORE submitting the batch (A5).
  for (const doc of documents) {
    const v = validateDocFlow(doc.parsed.nodes, doc.parsed.edges, doc.documentId)
    if (!v.ok) {
      return {
        ok: false,
        error: `markdown import: doc-flow validation failed for ${doc.documentId}: ${v.reason}`,
        failedFile: doc.file,
      }
    }
  }

  // Build the batch: ALL putNode ops precede ALL putEdge ops (referential
  // integrity — every edge's source/target node exists before the edge).
  const ops: BatchOp[] = []
  for (const doc of documents) {
    for (const node of doc.parsed.nodes) ops.push({ op: 'putNode', node })
  }
  for (const doc of documents) {
    for (const edge of doc.parsed.edges) ops.push({ op: 'putEdge', edge })
  }

  const result = await ctx.store.applyBatch(ops)
  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  return {
    ok: true,
    documentIds: documents.map((d) => d.documentId),
    nodeCount: ops.filter((o) => o.op === 'putNode').length,
    edgeCount: ops.filter((o) => o.op === 'putEdge').length,
  }
}
