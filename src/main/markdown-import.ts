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

/** The SERVER-SIDE store context for one import — NEVER derived from MCP
 *  tool args (ADV-1 discipline: the seam is fed by U-MS2's wiring from the
 *  registry, not by the caller). Optional; omitted ⇒ the legacy
 *  (unprefixed, default-store) behavior, byte-equal to today. */
export interface ImportStoreContext {
  /** The addressed store's registry name. Used ONLY as the `<name>:` prefix
   *  source for non-default stores; UNUSED when `isDefault` is true. The
   *  registry charset (U-MS1, review §2 D2) guarantees `[a-z0-9][a-z0-9_-]{0,63}` —
   *  in particular colon-free; U-MS4 defends only the namespace-critical
   *  properties (§5.4 SC2/SC3), it does NOT re-validate the charset. */
  name: string
  /** True when the addressed store IS the default store: its import output
   *  is UNPREFIXED (byte-equal today). REQUIRED on the type; at runtime the
   *  defensive rule is `isDefault !== true` ⇒ prefix mode (§5.2). */
  isDefault: boolean
  /** The names of the OTHER registered (non-default) stores — the reserved
   *  `<name>:` prefix namespace. Consulted ONLY for the default store's A1
   *  collision rejection (§5.4). Omit (or pass []) when there are no other
   *  stores. U-MS4 treats the list as OPAQUE strings (no charset re-check). */
  reservedNames?: readonly string[]
}

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

/** F-MS4-3 — the `<json>` rendering for the corpusRoot guard's byte-pinned
 *  message: the F-MS1-6 `jsonOf` idiom (as in `rag-store-registry.ts`). TOTAL
 *  — a throwing `JSON.stringify` (BigInt, cyclic structure, a throwing
 *  `toJSON`) renders `String(value)` instead of surfacing an unpinned
 *  TypeError; `undefined` renders the bare word. CAPPED — a rendering longer
 *  than 200 chars renders as its first 197 chars + `…` (exactly 198 chars).
 *  The cap applies to the RENDERING only, never to validation. */
function jsonOf(value: unknown): string {
  let rendered: string
  try {
    rendered = JSON.stringify(value)
  } catch {
    rendered = String(value)
  }
  if (rendered === undefined) {
    return 'undefined'
  }
  return rendered.length > 200 ? `${rendered.slice(0, 197)}…` : rendered
}

/** Import a corpus of markdown files into the RAG store as a ONE-WAY SNAPSHOT.
 *  Reads each file, parses it, validates each document's doc-flow, and applies
 *  the whole corpus via applyBatch as ONE atomic batch journal entry. Async.
 *
 *  U-MS4 (docs/specs/unit-ms4-id-prefixing.md §5.1/§5.2) — the OPTIONAL third
 *  `store` parameter carries the server-side `ImportStoreContext`: a
 *  NON-default store mints `<name>:`-prefixed documentIds (§5.2 step 4g), the
 *  default store's output stays UNPREFIXED and byte-equal to the two-parameter
 *  call (A4), with the A1 prefix-namespace rejection on the default seam only
 *  (§5.4). Omitted/null ⇒ the legacy shape. NEVER throws for a domain
 *  failure — every fail-state (including the new SC/A1 classes) returns
 *  `{ ok: false, ... }`. */
export async function importMarkdownCorpus(
  ctx: EditOpContext,
  params: ImportMarkdownParams,
  store?: ImportStoreContext,
): Promise<ImportMarkdownResult> {
  if (!params || !Array.isArray(params.files) || params.files.length === 0) {
    return { ok: false, error: 'markdown import: files must be a non-empty array' }
  }
  // U-MS4 §5.2 step 2 — the store-context validation (SC1–SC5). Runs ONCE per
  // call, immediately AFTER the files guard and BEFORE the corpus-root
  // resolution (fail-fast: an invalid context never touches the filesystem).
  // `store == null` (undefined or null) SKIPS validation entirely — the
  // legacy shape. Every SC fail-state ⇒ the byte-pinned error, NO failedFile.
  if (store != null) {
    // SC1 — not a plain object (a string, number, boolean, array, or other
    // non-object; a function is typeof 'function').
    if (typeof store !== 'object' || Array.isArray(store)) {
      return { ok: false, error: 'markdown import: invalid store context' }
    }
    // The defensive runtime rule (§5.1): `isDefault !== true` ⇒ prefix mode.
    const prefixMode = store.isDefault !== true
    // SC2 — prefix mode with a non-string/empty name.
    if (prefixMode && (typeof store.name !== 'string' || store.name === '')) {
      return { ok: false, error: 'markdown import: invalid store context' }
    }
    // SC3 — prefix mode with a colon-bearing name (namespace-critical, INV-3).
    if (prefixMode && store.name.includes(':')) {
      return { ok: false, error: 'markdown import: invalid store context' }
    }
    // SC4 — a provided-but-non-array reservedNames (fail-loud; a
    // silently-ignored reservation would re-open A1). Unconditional on mode.
    if (store.reservedNames !== undefined && !Array.isArray(store.reservedNames)) {
      return { ok: false, error: 'markdown import: invalid store context' }
    }
    // SC5 — an array reservedNames containing a non-string element.
    if (Array.isArray(store.reservedNames) && store.reservedNames.some((n) => typeof n !== 'string')) {
      return { ok: false, error: 'markdown import: invalid store context' }
    }
  }
  // F-MS4-2 (docs/specs/unit-ms4-id-prefixing.md §3a, the adversarial fix
  // batch) — the SC-validated SNAPSHOT: the A1 gate (§5.2 step 4f) and the
  // prefix mint (§5.2 step 4g) read THESE consts — never the live context by
  // property access again. A getter/Proxy context can desync between reads
  // (a different value per property read), so the SC battery could validate
  // one shape while the gate/mint act on another; snapshotting at ONE fixed
  // point (immediately after the SC battery) makes the gate + the mint agree
  // deterministically.
  const storePresent = store != null
  const snapIsDefault = store != null && store.isDefault === true
  const snapName = store != null ? store.name : undefined
  const snapReservedNames = store != null ? store.reservedNames : undefined
  // F-MS4-3 — the malformed-corpusRoot guard (§5.2 step 3): a non-string
  // `params.corpusRoot` would throw an uncaught TypeError (ERR_INVALID_ARG_TYPE)
  // at the `resolve` below, contradicting the NEVER-throws-for-a-domain-failure
  // pin. The fail-state is byte-pinned with the jsonOf rendering above (capped
  // per the F-MS1-6 idiom), NO failedFile. `''` is pinned as a CALLER ERROR
  // too — the nullish coalescing keeps '' (an empty root is never a valid
  // corpus root), so it is rejected here for consistency; `null`/`undefined`
  // keep the `process.cwd()` default (the nullish coalescing is unchanged).
  const rawCorpusRoot = params.corpusRoot
  if (
    rawCorpusRoot !== undefined &&
    rawCorpusRoot !== null &&
    (typeof rawCorpusRoot !== 'string' || rawCorpusRoot === '')
  ) {
    return {
      ok: false,
      error: `markdown import: corpusRoot must be a string (got ${jsonOf(rawCorpusRoot)})`,
    }
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
    // U-MS4 §5.3 (A5 / IMPORT-ROOT-PER-STORE, importer half) — a RELATIVE
    // file resolves against the ADDRESSED store's corpus root (was
    // `resolve(file)`, the cwd rule); an ABSOLUTE file ignores the root
    // (path.resolve semantics — identical behavior to today). Byte-identical
    // for the default store when the effective root is process.cwd().
    const abs = resolve(corpusRoot, file)
    // Path containment (logical): an absolute path outside the corpus root is
    // rejected. This uses the LOGICAL root (not the realpath'd root) so a file
    // path as given is checked against the root as given.
    if (!isWithin(abs, corpusRoot)) {
      return { ok: false, error: `markdown import: path outside corpus root: ${file}`, failedFile: file }
    }
    // F-MS4-4 — the explicit NUL-byte probe: a path containing a NUL is
    // unreadable by the OS; pre-fix the failure surfaced only as a host
    // `statSync` TypeError (ERR_INVALID_ARG_VALUE) that the catch happened to
    // absorb. Fail CLOSED deterministically with the EXISTING cannot-read
    // message (NO new string) — byte-identical to the statSync-thrown
    // outcome, host-independent. AFTER the containment check (a NUL path
    // outside the root keeps the outside-corpus-root error, byte-identical).
    if (file.includes('\0')) {
      return { ok: false, error: `markdown import: cannot read file: ${file}`, failedFile: file }
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
    const base = sanitizeDocumentId(basename(file))
    // §5.2 step 4e — the empty-documentId check runs on the sanitized base
    // BEFORE any prefixing (never a prefixed-empty id like `<name>:`).
    if (base === '') {
      return { ok: false, error: `markdown import: empty documentId for file: ${file}`, failedFile: file }
    }
    // §5.2 step 4f — the A1 prefix-namespace collision check (resolution (a),
    // DEFAULT-store imports ONLY): a documentId exactly equal to a registered
    // NON-default store name is REJECTED here — after the sanitize and the
    // empty-documentId check, BEFORE the prefix mint and the duplicate check.
    // Exact-equality is the ONLY predicate (`sanitizeDocumentId` strips `:`,
    // so a first-`:`-segment collision reduces to whole-string equality); the
    // list is taken as GIVEN (A1-S7 — the seam does not second-guess it).
    // F-MS4-2: the gate reads the SC-validated SNAPSHOT (snapIsDefault /
    // snapReservedNames), never the live context — a getter/Proxy context
    // cannot desync the gate from the battery.
    if (snapIsDefault && Array.isArray(snapReservedNames) && snapReservedNames.includes(base)) {
      return {
        ok: false,
        error: `markdown import: documentId collides with a registered store name: ${base}`,
        failedFile: file,
      }
    }
    // §5.2 step 4g — the prefix mint: NON-default stores prefix the documentId
    // with `<name>:`; the default path (`store == null` or `isDefault ===
    // true`) yields `documentId === base` — byte-equal to today (A4). The
    // prefix is uniform across the corpus (it derives from the store context,
    // not the file). F-MS4-2: the mint reads the SC-validated SNAPSHOT
    // (storePresent / snapIsDefault / snapName), never the live context — a
    // getter/Proxy context cannot desync the mint from the battery.
    const documentId = store != null && !snapIsDefault ? `${snapName}:${base}` : base
    // §5.2 step 4h — the duplicate-documentId check runs on the FINAL
    // (prefixed) documentId; the message echoes the FINAL id.
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
