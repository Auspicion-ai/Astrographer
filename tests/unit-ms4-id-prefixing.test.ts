// tests/unit-ms4-id-prefixing.test.ts — Unit U-MS4: the store-id prefixing at
// the import minting seam (docs/specs/unit-ms4-id-prefixing.md).
//
// RED SET (RCA-1) — written BEFORE any implementation exists. The module
// `src/main/markdown-import.ts` EXISTS (Unit T) but WITHOUT the optional third
// `store?: ImportStoreContext` parameter and WITHOUT the A1 rejection, so this
// red set is a SIGNATURE/behavior red, NOT a suite-load failure:
//
//   - TYPE-LEVEL red (tsc): TS2305 — `ImportStoreContext` is not exported yet;
//     TS2554 — every 3-arg `importMarkdownCorpus(ctx, params, store)` call.
//     vitest itself does not typecheck, so the file RUNS.
//   - RUNTIME red: JavaScript ignores the extra third argument today, so the
//     store context is silently dropped — every prefix/A1/SC assertion below
//     fails against the legacy (unprefixed, unchecked) behavior. Test 01 pins
//     the marker (`importMarkdownCorpus.length === 3`, the §5.1 signature).
//
// Every assertion derives from docs/specs/unit-ms4-id-prefixing.md ALONE:
//
//   §5.1        the signature delta: +1 OPTIONAL third parameter
//               `store?: ImportStoreContext` (the 2-arg call stays valid);
//               `ImportMarkdownParams`/`ImportMarkdownResult`/`EditOpContext`
//               UNCHANGED; the SC fail-state class (`markdown import: invalid
//               store context`, byte-pinned, no failedFile)
//   §5.2        the per-call pipeline order (files guard → SC validation →
//               corpus-root → per-file: empty-path → resolve(corpusRoot, file)
//               → containment/TOCTOU → sanitize → empty-documentId → A1 →
//               prefix mint → duplicate → parseMarkdown), the prefix rule
//               (`store && store.isDefault !== true ? \`${name}:${base}\` :
//               base`), the minting-class table, and the FOUR-site id-minting
//               census in markdown-parse.ts (block `:444`, section `:565`,
//               edge `:448` — dash-separated with the colon SURVIVING inside
//               the edge id, doc-root `:558`) — the parser takes the
//               documentId as an INPUT and is NOT changed
//   §5.3        the per-store path resolution (`resolve(corpusRoot, file)` at
//               markdown-import.ts:84; byte-identical for the default store
//               only when the effective root is process.cwd()); the
//               containment/TOCTOU discipline reused UNCHANGED per store root;
//               the R7 pin — the store context carries NO path data
//   §5.4        the A1 resolution (a): the DEFAULT store's import seam REJECTS
//               a documentId exactly equal to a registered NON-default store
//               name — byte-pinned message `markdown import: documentId
//               collides with a registered store name: <id>` with failedFile,
//               checked after sanitize/empty-check and before prefix/duplicate;
//               the full state matrix A1-S1…S10 (+ the legacy-residue carve-out
//               is documented-only — no store scan, untestable at this seam)
//   §5.5        INV-1/INV-2 (cross-store documentId/node-id uniqueness),
//               INV-4 (the foreign-id miss), INV-5 (per-store isolation). INV-6
//               (the cross-store edge-id equality non-hazard) is pinned by the
//               POST-GREEN adversarial regression (§3a probe iv,
//               tests/unit-ms4-id-prefixing-adversarial.test.ts) — NOT authored
//               here (see the report's skip reasons)
//   §5.6        the nine default-store byte-equality acceptance criteria (A4)
//   §5.7        per-store one-shot/upsert + ONE-WAY-SNAPSHOT per store + the
//               no-batch/no-journal atomicity of every new fail-state
//   §5.8        happy paths H1–H13
//   §5.9        fail-states F1–F14
//
// FLAGGED SPEC AMBIGUITY (not guessed — resolution rationale inline at test 23):
// §5.4 state A1-S7's outcome cell reads "IMPORTS or REJECTS per S6's rule"
// while its own tail pins "U-MS4's predicate is includes(base) on whatever list
// it is GIVEN (it does not second-guess the list)". This suite pins the EXACT
// §5.4 predicate (a given list containing the default store's own name ⇒
// REJECT); S6 (own name NOT in the given list ⇒ IMPORT) is pinned at test 22.
// The supervisor may re-pin test 23 if the A1-S7 row is amended.
//
// Conventions follow tests/unit-ms2-store-wiring.test.ts +
// tests/unit-t-markdown-import.test.ts (vitest node environment, `.js` import
// suffix for the main-process ESM modules, temp dirs via node:fs mkdtemp,
// byte-exact message assertions, malformed store values cast through unknown —
// the defensive runtime fail-states are deliberately off-type). NO registry
// module, NO Electron, NO U-MS2 wiring (§6: the unit is contractually
// independent — the store context is a pure injected input). The U-MS2 staged
// red (its test 56) is U-MS2's test file, NOT this one.
import { describe, it, expect } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
  readFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import {
  importMarkdownCorpus,
  type ImportMarkdownParams,
  type ImportMarkdownResult,
  // ← INTENTIONAL TYPE-LEVEL RED: `ImportStoreContext` is the NEW exported
  // interface (§5.1) — it does not exist yet (TS2305 until U-MS4 lands).
  type ImportStoreContext,
} from '../src/main/markdown-import.js'
import { parseMarkdown } from '../src/main/markdown-parse.js'
import { setContent } from '../src/main/edit-ops.js'
import type { EditOpContext } from '../src/main/edit-ops.js'
import { createJsonRagStore, type RagStore, type RagEdge } from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// message assertions).
// ---------------------------------------------------------------------------

function withDir<T>(run: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms4-'))
  try {
    return run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

async function withDirAsync<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms4-'))
  try {
    return await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** A transient mkdtemp dir INSIDE process.cwd() — for the importer's pinned
 *  `process.cwd()` default (markdown-import.ts:66). Removed in finally. */
async function withCwdDir<T>(run: (relFile: string, absFile: string) => Promise<T>): Promise<T> {
  const abs = mkdtempSync(join(process.cwd(), 'provident-ms4-cwd-'))
  const rel = relative(process.cwd(), abs)
  try {
    return await run(join(rel, 'note.md'), join(abs, 'note.md'))
  } finally {
    rmSync(abs, { recursive: true, force: true })
  }
}

function writeMd(dir: string, name: string, content: string): string {
  const p = join(dir, name)
  writeFileSync(p, content, 'utf8')
  return p
}

function makeCtx(store: RagStore): EditOpContext {
  return { store }
}

function freshStore(dir: string, name: string): RagStore {
  return createJsonRagStore({ path: join(dir, `rag-${name}.json`) })
}

/** The malformed store-context casting seam: the SC fail-states are RUNTIME
 *  defensive rules for deliberately off-type values (§5.1 "the defensive
 *  rule"; §5.9 F1–F5) — cast through unknown, house style. */
function storeCtx(value: unknown): ImportStoreContext {
  return value as ImportStoreContext
}

/** The §5.1 legacy-null shape: `store == null` SKIPS validation entirely. The
 *  pinned type is `store?: ImportStoreContext` (null is not assignable), so
 *  the null probe casts through unknown too. */
const NULL_STORE = null as unknown as ImportStoreContext

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

/** The SC fail-state shape (§5.1/§5.9): byte-pinned message, NO failedFile. */
function expectInvalidStoreContext(r: ImportMarkdownResult): void {
  expect(r.ok).toBe(false)
  if (r.ok) throw new Error('expected failure, got ok')
  expect(r.error).toBe('markdown import: invalid store context')
  expect(r.failedFile).toBeUndefined()
}

function idsOf(store: RagStore): string[] {
  return store.listNodes().map((n) => n.id)
}

function edgesOf(store: RagStore): RagEdge[] {
  return store.listEdges()
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const DEFAULT_NAME = 'main'
const OTHER_NAME = 'research-2026-09' // a valid U-MS1 charset name
const KB_NAME = 'kb'

/** The small census document ('# Note\n\nBody note.'): root + 1 section + 1
 *  paragraph; edges e-<doc>-1..5 = doc-child, parent-child (sec→p),
 *  parent-child (root→sec, R8), doc-head, doc-end. */
const SMALL_MD = '# Note\n\nBody note.\n'

/** The full census document — mints ALL 10 `nextId` type segments (§5.2):
 *  p (paragraphs ×3), ul, ol, li (×4), blockquote (+ its inner p), pre (code
 *  fence), table, thead, th (×2), tr, td (×2); sections ×2. */
const CENSUS_MD = [
  '# Readme',
  '',
  'Intro paragraph.',
  '',
  '- item one',
  '- item two',
  '',
  '1. first',
  '2. second',
  '',
  '> quoted text',
  '',
  '```',
  'code fence',
  '```',
  '',
  '| h1 | h2 |',
  '| --- | --- |',
  '| a | b |',
  '',
  '## Section two',
  '',
  'Second section body.',
].join('\n')

/** The per-type block-id census counts for CENSUS_MD (§5.2, the 10 `nextId`
 *  mint call sites + section/root): p×3, ul×1, ol×1, li×4, blockquote×1,
 *  pre×1, table×1, thead×1, th×2, tr×1, td×2; sections ×2. */
const CENSUS_TYPE_COUNTS: Record<string, number> = {
  p: 3,
  ul: 1,
  ol: 1,
  li: 4,
  blockquote: 1,
  pre: 1,
  table: 1,
  thead: 1,
  th: 2,
  tr: 1,
  td: 2,
}

/** Assert the FULL §5.2 id-shape census for a document whose documentId is
 *  `docId` in `store` — root (verbatim), sections, every block type, the
 *  dash-separated edge ids (the colon surviving inside), the 3 doc-flow
 *  documentIds owners, and the root ownedNodeIds. Store-class agnostic: the
 *  same assertions serve the default column (`readme`) and the prefixed
 *  column (`S:readme`). */
function expectCensus(store: RagStore, docId: string, sections = 2): void {
  const ids = idsOf(store)
  // The document root node id = the documentId verbatim (markdown-parse.ts:558).
  const root = store.getNode(docId)
  expect(root, `root node ${docId} must exist`).toBeDefined()
  expect(root!.type).toBe('div')
  // Section node ids `${documentId}:section:${n}` (markdown-parse.ts:565).
  const sectionIds = ids.filter((id) => id.startsWith(`${docId}:section:`))
  expect(sectionIds).toEqual(
    Array.from({ length: sections }, (_, s) => `${docId}:section:${s + 1}`),
  )
  // Root ownedNodeIds = the section ids in order (markdown-parse.ts:576).
  expect(root!.ownedNodeIds).toEqual(
    Array.from({ length: sections }, (_, s) => `${docId}:section:${s + 1}`),
  )
  // Block node ids `${documentId}:${type}:${n}` (markdown-parse.ts:444) — the
  // per-type counters.
  for (const [type, count] of Object.entries(CENSUS_TYPE_COUNTS)) {
    const blockIds = ids.filter((id) => id.startsWith(`${docId}:${type}:`))
    expect(blockIds, `type ${type} census`).toHaveLength(count)
    for (let n = 1; n <= count; n++) expect(blockIds).toContain(`${docId}:${type}:${n}`)
  }
  // Edge ids `e-${documentId}-${n}` (markdown-parse.ts:448) — DASH-separated;
  // the documentId (and its colon) is embedded VERBATIM.
  const edges = edgesOf(store)
  for (const e of edges) expect(e.id).toMatch(new RegExp(`^e-${escapeRe(docId)}-\\d+$`))
  // Edge documentIds owners (markdown-parse.ts:602-605): EXACTLY the doc-head,
  // doc-end, and next-section edges carry documentIds: [documentId].
  const owners = edges.filter((e) => (e as { documentIds?: string[] }).documentIds !== undefined)
  expect(owners.map((e) => e.kind).sort()).toEqual(['doc-end', 'doc-head', 'next-section'])
  for (const e of owners) expect((e as { documentIds?: string[] }).documentIds).toEqual([docId])
  // Root parent-child edge source = the documentId (markdown-parse.ts:596).
  const rootEdge = edges.find((e) => e.kind === 'parent-child' && e.target === `${docId}:section:1`)
  expect(rootEdge, 'the R8 root parent-child edge').toBeDefined()
  expect(rootEdge!.source).toBe(docId)
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Assert the EXACT small-document census (SMALL_MD) for documentId `docId`. */
function expectSmallCensus(store: RagStore, docId: string): void {
  const ids = idsOf(store).sort()
  expect(ids).toEqual([`${docId}`, `${docId}:p:1`, `${docId}:section:1`])
  expect(store.getNode(`${docId}`)!.ownedNodeIds).toEqual([`${docId}:section:1`])
  expect(store.getNode(`${docId}:section:1`)!.type).toBe('h1')
  expect((store.getNode(`${docId}:section:1`)!.props as Record<string, unknown>)['data-doc-head']).toBe(true)
  expect(store.getNode(`${docId}:p:1`)!.content).toBe('Body note.')
  const edges = edgesOf(store)
  expect(edges.map((e) => e.id)).toEqual([
    `e-${docId}-1`,
    `e-${docId}-2`,
    `e-${docId}-3`,
    `e-${docId}-4`,
    `e-${docId}-5`,
  ])
  expect(edges.map((e) => e.kind)).toEqual([
    'doc-child',
    'parent-child',
    'parent-child',
    'doc-head',
    'doc-end',
  ])
  expect(edges[2].source).toBe(docId) // R8: root parent-child source
  expect(edges[3].source).toBe(`${docId}:section:1`)
  expect(edges[3].target).toBe(docId)
  expect((edges[3] as { documentIds?: string[] }).documentIds).toEqual([docId])
  expect((edges[4] as { documentIds?: string[] }).documentIds).toEqual([docId])
}

function journalBatchCount(store: RagStore): number {
  return store.journal().filter((e) => e.kind === 'batch').length
}

// ===========================================================================
// RED marker (§5.1, §6 — the signature delta)
// ===========================================================================
describe('U-MS4 RED marker — the optional third parameter does not exist yet (§5.1, §6)', () => {
  it('01. RED — importMarkdownCorpus has no third `store?: ImportStoreContext` parameter yet (§5.1 pins the signature `(ctx, params, store?)`, so Function.length is 3 once landed; it is 2 today). The type-level import of `ImportStoreContext` above is the second intentional delta (TS2305).', () => {
    expect(importMarkdownCorpus.length).toBe(3)
  })
})

// ===========================================================================
// §5.2 — the id-minting census, verified at the PARSER seam (green-on-arrival
// guards: markdown-parse.ts takes the documentId as an INPUT and is NOT
// changed — the prefix rides on the input, §5.2 step 4i)
// ===========================================================================
describe('§5.2 — the markdown-parse.ts id-minting census derives EVERY id from the documentId INPUT (guards)', () => {
  // Data states enumerated (§5.2 census table, non-default column with S): the
  // four mint sites (block `:444`, section `:565`, edge `:448`, doc-root
  // `:558`) + the documentId embeddings (`:576` ownedNodeIds, `:596` root
  // parent-child source, `:602-605` edge documentIds, `:609` the return).
  it('02. GUARD (green-on-arrival) — parseMarkdown(SMALL_MD, "S:note") mints the four census sites with the colon SURVIVING inside the dash-separated edge id', () => {
    const parsed = parseMarkdown(SMALL_MD, 'S:note')
    expect(parsed.documentId).toBe('S:note') // :609 — the return
    expect(idsOf({ listNodes: () => parsed.nodes } as unknown as RagStore).sort()).toEqual([
      'S:note',
      'S:note:p:1',
      'S:note:section:1',
    ])
    expect(parsed.nodes[0].id).toBe('S:note') // :558 — the document root = the documentId verbatim
    expect(parsed.nodes[1].id).toBe('S:note:section:1') // :565 — the section template
    expect(parsed.nodes[2].id).toBe('S:note:p:1') // :444 — the block template
    expect(parsed.nodes[0].ownedNodeIds).toEqual(['S:note:section:1']) // :576
    expect(parsed.edges.map((e) => e.id)).toEqual([
      'e-S:note-1',
      'e-S:note-2',
      'e-S:note-3',
      'e-S:note-4',
      'e-S:note-5',
    ]) // :448 — `e-${documentId}-${n}`; the COLON survives inside the edge id
    expect(parsed.edges[2].source).toBe('S:note') // :596 — root parent-child source
    expect((parsed.edges[3] as { documentIds?: string[] }).documentIds).toEqual(['S:note']) // :602-605
    expect((parsed.edges[4] as { documentIds?: string[] }).documentIds).toEqual(['S:note'])
  })

  it('03. GUARD (green-on-arrival) — parseMarkdown mints ALL 10 `nextId` type segments from a colon-bearing documentId (the §5.2 census as a parser-seam pin)', () => {
    const parsed = parseMarkdown(CENSUS_MD, 'S:readme')
    const ids = parsed.nodes.map((n) => n.id)
    for (const [type, count] of Object.entries(CENSUS_TYPE_COUNTS)) {
      const blockIds = ids.filter((id) => id.startsWith(`S:readme:${type}:`))
      expect(blockIds, `type ${type}`).toHaveLength(count)
      for (let n = 1; n <= count; n++) expect(blockIds).toContain(`S:readme:${type}:${n}`)
    }
    expect(ids).toContain('S:readme:section:1')
    expect(ids).toContain('S:readme:section:2')
    for (const e of parsed.edges) expect(e.id).toMatch(/^e-S:readme-\d+$/)
  })

  it('10. GUARD (§5.6 criterion 9, green-on-arrival) — the parser is untouched: parseMarkdown is DETERMINISTIC for the same (markdown, documentId) input', () => {
    expect(parseMarkdown(CENSUS_MD, 'S:readme')).toEqual(parseMarkdown(CENSUS_MD, 'S:readme'))
    expect(parseMarkdown(SMALL_MD, 'note')).toEqual(parseMarkdown(SMALL_MD, 'note'))
  })
})

// ===========================================================================
// §5.8 H1 + §5.6 — the default-store byte-equality baseline (A4; the legacy
// two-parameter call — green-on-arrival guards: the default column is TODAY's
// output and must stay byte-equal)
// ===========================================================================
describe('§5.8 H1 + §5.6 — the default-store legacy import is byte-equal (A4 baseline, guards)', () => {
  it('04. H1/§5.6(1–4) — the 2-ARG legacy import of the small doc mints the exact default-column ids + the unchanged result shape', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'a')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: dir }))
      // §5.6 criterion 1 — documentIds: exactly `note`, never prefixed.
      expect(r.documentIds).toEqual(['note'])
      // §5.6 criterion 4 — the result shape (unchanged).
      expect(r.nodeCount).toBe(3)
      expect(r.edgeCount).toBe(5)
      // §5.6 criteria 2+3 — node ids, edge ids, owners.
      expectSmallCensus(store, 'note')
    })
  })

  it('05. H1/§5.6(1–4) — the 2-ARG legacy import of the census doc mints EVERY §5.2 default-column id shape (all 10 block types + sections + edges + owners)', async () => {
    await withDirAsync(async (dir) => {
      const readme = writeMd(dir, 'readme.md', CENSUS_MD)
      const store = freshStore(dir, 'b')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [readme], corpusRoot: dir }))
      expect(r.documentIds).toEqual(['readme'])
      expectCensus(store, 'readme')
    })
  })

  it('06. §5.6(5) — ONE `batch` journal entry with ALL putNode ops preceding ALL putEdge ops; counts are the BATCH SIZE', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'c')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: dir }))
      const entries = store.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
      expect(store.undoDepth()).toBe(1)
      const batch = entries[0] as { kind: 'batch'; ops: { op: string }[] }
      const kinds = batch.ops.map((o) => o.op)
      expect(kinds.filter((k) => k === 'putNode')).toHaveLength(r.nodeCount)
      expect(kinds.filter((k) => k === 'putEdge')).toHaveLength(r.edgeCount)
      expect(kinds.lastIndexOf('putNode')).toBeLessThan(kinds.indexOf('putEdge'))
    })
  })

  it('07. §5.6(7) + A1-S10 — an OMITTED corpusRoot resolves a relative file against process.cwd() (byte-equal `abs === resolve(file)`)', async () => {
    await withCwdDir(async (relFile, absNote) => {
      writeFileSync(absNote, SMALL_MD, 'utf8')
      await withDirAsync(async (dir) => {
        const store = freshStore(dir, 'd')
        const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [relFile] }))
        expect(r.documentIds).toEqual(['note'])
        expect(store.getNode('note:p:1')!.content).toBe('Body note.')
      })
    })
  })

  it('08. H2/§5.6(8) — an EXPLICIT default context { name: "main", isDefault: true, reservedNames: ["other-store"] } is output-NEUTRAL: deep-equal to the legacy call (3-ARG call — TS-red today, runtime-green)', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const legacy = freshStore(dir, 'e')
      const explicit = freshStore(dir, 'f')
      const r1 = expectOk(await importMarkdownCorpus(makeCtx(legacy), { files: [note], corpusRoot: dir }))
      const r2 = expectOk(
        await importMarkdownCorpus(makeCtx(explicit), { files: [note], corpusRoot: dir }, {
          name: DEFAULT_NAME,
          isDefault: true,
          reservedNames: [OTHER_NAME],
        }),
      )
      expect(r2).toEqual(r1)
      // BYTE-EQUAL store content (the parser stamps are fixed ⇒ no normalization).
      expect(JSON.stringify(explicit.listNodes())).toBe(JSON.stringify(legacy.listNodes()))
      expect(JSON.stringify(explicit.listEdges())).toBe(JSON.stringify(legacy.listEdges()))
    })
  })
})

// ===========================================================================
// §5.9 F13 + §5.6(6) — the eight inherited fail-states stay byte-equal on the
// legacy path (green-on-arrival guard; the Unit T suite is THE regression —
// this is the compact in-specie mirror, §5.9 F13)
// ===========================================================================
describe('§5.9 F13 — the inherited fail-states are byte-equal on the legacy path (guard)', () => {
  // Fail-states enumerated (§5.6 criterion 6): files-array (:64), empty file
  // path (:82), cannot read (:96/:99/:112/:118 — incl. the directory case),
  // outside corpus root (:89/:109), duplicate documentId (:125), empty
  // documentId (:122), doc-flow (:138), batch failure (:156).
  it('09. F13 — all eight inherited fail-states byte-equal via the 2-ARG call', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'g')
      // (1) files-array.
      const r1 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [] }))
      expect(r1.error).toBe('markdown import: files must be a non-empty array')
      expect(r1.failedFile).toBeUndefined()
      // (2) empty file path.
      const r2 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [''] }))
      expect(r2.error).toBe('markdown import: empty file path')
      expect(r2.failedFile).toBeUndefined()
      // (3) cannot read (nonexistent).
      const missing = join(dir, 'missing.md')
      const r3 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [missing], corpusRoot: dir }))
      expect(r3.error).toBe(`markdown import: cannot read file: ${missing}`)
      expect(r3.failedFile).toBe(missing)
      // (4) cannot read (a DIRECTORY — :99).
      const sub = join(dir, 'subdir')
      mkdirSync(sub)
      const r4 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [sub], corpusRoot: dir }))
      expect(r4.error).toBe(`markdown import: cannot read file: ${sub}`)
      expect(r4.failedFile).toBe(sub)
      // (5) outside corpus root (logical).
      const outsideDir = mkdtempSync(join(tmpdir(), 'provident-ms4-out-'))
      try {
        const outside = writeMd(outsideDir, 'x.md', '# X\n')
        const r5 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [outside], corpusRoot: dir }))
        expect(r5.error).toBe(`markdown import: path outside corpus root: ${outside}`)
        expect(r5.failedFile).toBe(outside)
      } finally {
        rmSync(outsideDir, { recursive: true, force: true })
      }
      // (6) duplicate documentId.
      const a1 = writeMd(dir, 'a.md', '# A\n')
      const a2 = writeMd(dir, 'a.markdown', '# A\n')
      const r6 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [a1, a2], corpusRoot: dir }))
      expect(r6.error).toBe('markdown import: duplicate documentId: a')
      expect(r6.failedFile).toBeUndefined()
      // (7) empty documentId.
      const blank = writeMd(dir, '   .md', '# X\n')
      const r7 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [blank], corpusRoot: dir }))
      expect(r7.error).toBe(`markdown import: empty documentId for file: ${blank}`)
      expect(r7.failedFile).toBe(blank)
      // (8) doc-flow failure.
      const headless = writeMd(dir, 'headless.md', 'Some text with no heading.\n')
      const r8 = expectFail(await importMarkdownCorpus(makeCtx(store), { files: [headless], corpusRoot: dir }))
      expect(r8.error).toBe('markdown import: doc-flow validation failed for headless: missing-head')
      expect(r8.failedFile).toBe(headless)
      // (9) batch failure — the error passes through, no failedFile.
      const ok2 = writeMd(dir, 'ok2.md', '# Ok2\n\nBody.\n')
      const fakeStore = {
        applyBatch: async () =>
          ({ ok: false as const, error: 'rag applyBatch: source/target node not found or quarantined at index 0', failedIndex: 0 }),
      } as unknown as RagStore
      const r9 = expectFail(await importMarkdownCorpus(makeCtx(fakeStore), { files: [ok2], corpusRoot: dir }))
      expect(r9.error).toBe('rag applyBatch: source/target node not found or quarantined at index 0')
      expect(r9.failedFile).toBeUndefined()
      // The legacy path applied NOTHING across all nine failures.
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    })
  })
})

// ===========================================================================
// §5.1/§5.2 step 2 + §5.9 F1–F5 — the invalid store context (SC1–SC5)
// ===========================================================================
describe('§5.1/§5.2 SC1–SC5 + §5.9 F1–F5 — the invalid store context (byte-pinned, fail-fast)', () => {
  // Fail-states enumerated (§5.2 step 2 + §5.9 F1–F5): all five ⇒
  // `{ ok: false, error: 'markdown import: invalid store context' }`, NO
  // failedFile, NO file I/O. Precedence: AFTER the files guard (:63-65),
  // BEFORE the corpus-root resolution (:66) — fail-fast.
  it('11. F1/SC1 — `store` truthy non-objects (and falsy non-null non-objects) ⇒ invalid store context; NO file read (the SC error wins over a nonexistent file); the FILES guard still precedes it', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'h')
      const missing = join(dir, 'missing.md')
      for (const bad of ['main', 42, true, [], 0, false, () => 'x']) {
        const r = await importMarkdownCorpus(
          makeCtx(store),
          { files: [missing], corpusRoot: dir },
          storeCtx(bad),
        )
        expectInvalidStoreContext(r)
      }
      // Precedence: the files guard (:63-65) runs BEFORE the SC validation
      // (§5.2 step 2 "immediately AFTER the files guard").
      const r2 = await importMarkdownCorpus(makeCtx(store), { files: [] }, storeCtx('main'))
      expect(r2.ok).toBe(false)
      if (r2.ok) throw new Error('expected failure')
      expect(r2.error).toBe('markdown import: files must be a non-empty array')
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    })
  })

  it('12. §5.2 step 2 — `store == null` (explicit null) SKIPS validation entirely: the byte-equal LEGACY shape', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'i')
      const r = expectOk(
        await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: dir }, NULL_STORE),
      )
      expect(r.documentIds).toEqual(['note'])
      expectSmallCensus(store, 'note')
    })
  })

  it('13. F2/SC2 — prefix mode (`isDefault !== true`) with a non-string/empty name ⇒ invalid store context; the boundary: isDefault === true needs NO name at all (name is UNUSED on the default path)', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'j')
      for (const bad of [{ isDefault: false }, { isDefault: false, name: '' }, { isDefault: false, name: 42 }, { isDefault: false, name: null }]) {
        const r = await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: dir }, storeCtx(bad))
        expectInvalidStoreContext(r)
      }
      // SC2 is a per-call guard: the store stays empty after the failures.
      // (Supervisor arbitration 2026-09-05: this assertion was originally
      // placed AFTER the successful boundary import below, where it
      // contradicted the test's own expectOk(r2) + §5.2 step 6/§5.7 (a
      // successful import persists). Moved here, where it pins §5.7's
      // failed-import atomicity.)
      expect(store.listNodes()).toEqual([])
      // Boundary (§5.1: name is "UNUSED when isDefault is true"; SC2 is
      // prefix-mode-only): a nameless DEFAULT context is VALID.
      const r2 = await importMarkdownCorpus(
        makeCtx(store),
        { files: [note], corpusRoot: dir },
        storeCtx({ isDefault: true }),
      )
      expectOk(r2)
      expect(r2.ok && r2.documentIds).toEqual(['note'])
    })
  })

  it('14. F3/SC3 — prefix mode with a colon-bearing name ⇒ invalid store context (the namespace-critical guard, INV-3); the boundary: a colon name on the DEFAULT path is NOT an SC3 state', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'k')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [note], corpusRoot: dir },
        storeCtx({ name: 'a:b', isDefault: false }),
      )
      expectInvalidStoreContext(r)
      // Boundary: SC3 is prefix-mode-only — `isDefault: true` never consults
      // the name (§5.1: UNUSED when isDefault is true).
      const r2 = await importMarkdownCorpus(
        makeCtx(store),
        { files: [note], corpusRoot: dir },
        storeCtx({ name: 'a:b', isDefault: true }),
      )
      expectOk(r2)
      expect(r2.ok && r2.documentIds).toEqual(['note'])
    })
  })

  it('15. F4/SC4 — a provided-but-non-array reservedNames ⇒ invalid store context (fail-loud; a silently-ignored reservation re-opens A1) — on PREFIX-mode AND DEFAULT-mode contexts alike (SC4 is unconditional)', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'l')
      for (const reserved of ['research-2026-09', null, 42, {}]) {
        const r = await importMarkdownCorpus(
          makeCtx(store),
          { files: [note], corpusRoot: dir },
          storeCtx({ name: 'S', isDefault: false, reservedNames: reserved }),
        )
        expectInvalidStoreContext(r)
        const r2 = await importMarkdownCorpus(
          makeCtx(store),
          { files: [note], corpusRoot: dir },
          storeCtx({ name: DEFAULT_NAME, isDefault: true, reservedNames: reserved }),
        )
        expectInvalidStoreContext(r2)
      }
      expect(store.listNodes()).toEqual([])
    })
  })

  it('16. F5/SC5 — an array reservedNames containing a non-string element ⇒ invalid store context', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'm')
      for (const reserved of [['ok', 42], ['ok', null], [42]]) {
        const r = await importMarkdownCorpus(
          makeCtx(store),
          { files: [note], corpusRoot: dir },
          storeCtx({ name: 'S', isDefault: false, reservedNames: reserved }),
        )
        expectInvalidStoreContext(r)
      }
      expect(store.listNodes()).toEqual([])
    })
  })
})

// ===========================================================================
// §5.4 — the A1 resolution (a): the default store's prefix-namespace rejection
// ===========================================================================
describe('§5.4 — the A1 collision rejection (resolution (a))', () => {
  // Fail-states enumerated (§5.4 predicate): per file, AFTER the sanitize
  // (:120) and the empty-documentId check (:121-123), BEFORE the prefix mint
  // and the duplicate check — `store != null && store.isDefault === true &&
  // Array.isArray(store.reservedNames) && store.reservedNames.includes(base)`
  // ⇒ { ok: false, error: 'markdown import: documentId collides with a
  // registered store name: <base>', failedFile: file }; NO batch, NO journal
  // entry, NOTHING persisted.
  it('17. F6/A1-S3 — the exact collision ⇒ the byte-pinned message + failedFile; NO batch, NO journal entry, the store is unchanged', async () => {
    await withDirAsync(async (dir) => {
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const store = freshStore(dir, 'm')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [research], corpusRoot: dir },
        { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe(`markdown import: documentId collides with a registered store name: ${OTHER_NAME}`)
      expect(r.failedFile).toBe(research)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toHaveLength(0)
      // ONE-WAY-SNAPSHOT: the source file is untouched.
      expect(readFileSync(research, 'utf8')).toBe('# Research\n\nBody.\n')
    })
  })

  it('18. F7/A1-S9 — a MULTI-file corpus with a collision ⇒ the WHOLE import is rejected (no partial application); failedFile names the FIRST colliding file in `files` order', async () => {
    await withDirAsync(async (dir) => {
      const kb = writeMd(dir, 'kb.md', '# Kb\n\nKb body.\n')
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const store = freshStore(dir, 'n')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [kb, research], corpusRoot: dir },
        { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME, KB_NAME] },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe(`markdown import: documentId collides with a registered store name: ${KB_NAME}`)
      expect(r.failedFile).toBe(kb)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toHaveLength(0)
    })
  })

  it('19. F8/A1-S1 — the SAME colliding basename via the legacy call (store omitted) ⇒ IMPORTS byte-equal today (no reservation is knowable without a context)', async () => {
    await withDirAsync(async (dir) => {
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const store = freshStore(dir, 'o')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [research], corpusRoot: dir }))
      expect(r.documentIds).toEqual([OTHER_NAME])
      expect(store.getNode(OTHER_NAME)).toBeDefined()
    })
  })

  it('20. F9/A1-S4+S5 — A1 is EXACT-equality: dash-extension / case / underscore variants do NOT collide', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'p')
      const ctx = { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] } as ImportStoreContext
      const variants = ['research-2026-09-notes.md', 'Research.md', 'research_2026_09.md']
      const files = variants.map((name) => writeMd(dir, name, `# ${name}\n\nBody.\n`))
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files, corpusRoot: dir }, ctx))
      expect(r.documentIds).toEqual(['research-2026-09-notes', 'Research', 'research_2026_09'])
    })
  })

  it('21. A1-S2 — the default store with reservedNames [] / OMITTED imports the would-be-colliding name (nothing reserved)', async () => {
    await withDirAsync(async (dir) => {
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const storeA = freshStore(dir, 'q')
      const storeB = freshStore(dir, 'r')
      const emptyList = expectOk(
        await importMarkdownCorpus(
          makeCtx(storeA),
          { files: [research], corpusRoot: dir },
          { name: DEFAULT_NAME, isDefault: true, reservedNames: [] },
        ),
      )
      expect(emptyList.documentIds).toEqual([OTHER_NAME])
      const omitted = expectOk(
        await importMarkdownCorpus(
          makeCtx(storeB),
          { files: [research], corpusRoot: dir },
          { name: DEFAULT_NAME, isDefault: true },
        ),
      )
      expect(omitted.documentIds).toEqual([OTHER_NAME])
    })
  })

  it('22. A1-S6 — a default store named `kb` (non-main) with reservedNames = the OTHER stores imports `kb.md` (the reserved set is every NON-default store; a doc named like its OWN store is not a collision)', async () => {
    await withDirAsync(async (dir) => {
      const kb = writeMd(dir, 'kb.md', '# Kb\n\nKb body.\n')
      const store = freshStore(dir, 's')
      const r = expectOk(
        await importMarkdownCorpus(
          makeCtx(store),
          { files: [kb], corpusRoot: dir },
          { name: KB_NAME, isDefault: true, reservedNames: [OTHER_NAME] },
        ),
      )
      expect(r.documentIds).toEqual([KB_NAME])
      expect(store.getNode(KB_NAME)).toBeDefined()
    })
  })

  it('23. A1-S7 (FLAGGED — see the header) — reservedNames INCLUDING the default store\'s own name + a file named exactly that ⇒ REJECTED: the §5.4 predicate is `includes(base)` on whatever list it is GIVEN (it does not second-guess the list)', async () => {
    await withDirAsync(async (dir) => {
      const kb = writeMd(dir, 'kb.md', '# Kb\n\nKb body.\n')
      const store = freshStore(dir, 't')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [kb], corpusRoot: dir },
        { name: KB_NAME, isDefault: true, reservedNames: [KB_NAME] },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe(`markdown import: documentId collides with a registered store name: ${KB_NAME}`)
      expect(r.failedFile).toBe(kb)
      expect(store.listNodes()).toEqual([])
    })
  })

  it('24. A1-S8/H12 — a NON-default store may import a file named like ITSELF: the A1 check is default-store-only (reservedNames never consulted when isDefault !== true)', async () => {
    await withDirAsync(async (dir) => {
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const store = freshStore(dir, 'u')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [research], corpusRoot: dir },
        { name: OTHER_NAME, isDefault: false, reservedNames: [OTHER_NAME] },
      )
      expectOk(r)
      expect(r.ok && r.documentIds).toEqual([`${OTHER_NAME}:${OTHER_NAME}`])
      expect(store.getNode(`${OTHER_NAME}:${OTHER_NAME}`)).toBeDefined()
    })
  })

  it('25. §5.2 step 4e→4f→4h ordering — the empty-documentId check precedes the A1 check (a reserved `""` still yields the empty-documentId error), and the A1 check precedes the duplicate check (a colliding file mid-corpus rejects BEFORE a later duplicate pair fires)', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'v')
      // (e before f): `''` in reservedNames + a file sanitizing to '' ⇒ the
      // empty-documentId error — NEVER the A1 error.
      const blank = writeMd(dir, '   .md', '# X\n')
      const r1 = await importMarkdownCorpus(
        makeCtx(store),
        { files: [blank], corpusRoot: dir },
        { name: DEFAULT_NAME, isDefault: true, reservedNames: [''] },
      )
      expect(r1.ok).toBe(false)
      if (r1.ok) throw new Error('expected failure')
      expect(r1.error).toBe(`markdown import: empty documentId for file: ${blank}`)
      expect(r1.failedFile).toBe(blank)
      // (f before h): files [a.md, research-2026-09.md, a.markdown] — the A1
      // collision on file 2 fires BEFORE the a/a duplicate on file 3.
      const a1 = writeMd(dir, 'a.md', '# A\n\nBody a.\n')
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const a2 = writeMd(dir, 'a.markdown', '# A\n')
      const r2 = await importMarkdownCorpus(
        makeCtx(store),
        { files: [a1, research, a2], corpusRoot: dir },
        { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] },
      )
      expect(r2.ok).toBe(false)
      if (r2.ok) throw new Error('expected failure')
      expect(r2.error).toBe(`markdown import: documentId collides with a registered store name: ${OTHER_NAME}`)
      expect(r2.failedFile).toBe(research)
      expect(store.listNodes()).toEqual([])
    })
  })
})

// ===========================================================================
// §5.8 H3/H13 — the prefix minting at the seam (non-default stores)
// ===========================================================================
describe('§5.8 H3/H13 — the `<name>:` prefix mint for non-default stores (§5.2 step 4g)', () => {
  // Data states enumerated (§5.2 minting-class table): non-default ⇒
  // `S:<base>`; default explicit ⇒ `<base>` (the A1 check may reject);
  // legacy omitted/null ⇒ `<base>`; malformed ⇒ SC-rejected. The prefix is
  // uniform across the corpus (it derives from the store context, not the
  // file). The defensive runtime rule: `isDefault !== true` ⇒ prefix mode.
  it('26. H3 — a non-default import mints EVERY prefixed id shape (the §5.2 census table as a test) with unchanged count semantics', async () => {
    await withDirAsync(async (dir) => {
      const readme = writeMd(dir, 'readme.md', CENSUS_MD)
      const store = freshStore(dir, 'v2')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [readme], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expectOk(r)
      // Result: the PREFIXED documentIds; nodeCount/edgeCount stay the BATCH SIZE.
      expect(r.ok && r.documentIds).toEqual(['S:readme'])
      expect(r.ok && r.nodeCount).toBe(store.listNodes().length)
      expect(r.ok && r.edgeCount).toBe(store.listEdges().length)
      // The FULL prefixed census (root/sections/blocks/edges/owners).
      expectCensus(store, 'S:readme')
    })
  })

  it('27. H13 — the SC-pass shapes: { name: "S", isDefault: false } (no reservedNames) prefixes normally; { name: "main", isDefault: true } (no reservedNames) imports UNPREFIXED without any A1 consult; the defensive rule `isDefault !== true` ⇒ prefix mode (e.g. isDefault: 1)', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const storeS = freshStore(dir, 'w')
      const storeMain = freshStore(dir, 'x')
      const storeOne = freshStore(dir, 'y')
      const r1 = await importMarkdownCorpus(
        makeCtx(storeS),
        { files: [note], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expectOk(r1)
      expect(r1.ok && r1.documentIds).toEqual(['S:note'])
      const r2 = await importMarkdownCorpus(
        makeCtx(storeMain),
        { files: [note], corpusRoot: dir },
        { name: DEFAULT_NAME, isDefault: true },
      )
      expectOk(r2)
      expect(r2.ok && r2.documentIds).toEqual(['note'])
      // The defensive runtime rule (§5.1): isDefault !== true ⇒ PREFIX mode.
      const r3 = await importMarkdownCorpus(
        makeCtx(storeOne),
        { files: [note], corpusRoot: dir },
        storeCtx({ name: 'S', isDefault: 1 }),
      )
      expectOk(r3)
      expect(r3.ok && r3.documentIds).toEqual(['S:note'])
    })
  })
})

// ===========================================================================
// §5.3 — the per-store path resolution (IMPORT-ROOT-PER-STORE, importer half)
// ===========================================================================
describe('§5.3 — per-store path resolution: resolve(corpusRoot, file) (A5)', () => {
  // Data states enumerated (§5.3): ABSOLUTE file ⇒ ignores the root (unchanged);
  // RELATIVE file ⇒ resolves against the STORE root (THE behavior change — RED
  // today, resolves against cwd); the containment/TOCTOU discipline reused
  // UNCHANGED per store root; the store context carries NO path data (R7).
  it('28. H5 — a RELATIVE file with a NON-cwd corpusRoot resolves against the STORE root (RED today: cwd resolution cannot find the file)', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(storeRoot)
      const doc = writeMd(storeRoot, 'ms4-store-root-doc.md', '# Store Root Doc\n\nResolved against the store root.\n')
      const store = freshStore(dir, 'y')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: ['ms4-store-root-doc.md'], corpusRoot: storeRoot },
        { name: 'S', isDefault: false },
      )
      expectOk(r)
      expect(r.ok && r.documentIds).toEqual(['S:ms4-store-root-doc'])
      // The CONTENT proves WHICH file was read (the store-root one).
      expect(store.getNode('S:ms4-store-root-doc:p:1')!.content).toBe('Resolved against the store root.')
      expect(doc).toBeDefined()
    })
  })

  it('29. H6 — a RELATIVE SUBDIRECTORY path under the store root ⇒ ok, containment holding against the store root', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(join(storeRoot, 'sub'), { recursive: true })
      writeMd(storeRoot, join('sub', 'note.md'), '# Sub Note\n\nSubdir body.\n')
      const store = freshStore(dir, 'z')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: ['sub/note.md'], corpusRoot: storeRoot },
        { name: 'S', isDefault: false },
      )
      expectOk(r)
      expect(r.ok && r.documentIds).toEqual(['S:note'])
      expect(store.getNode('S:note:p:1')!.content).toBe('Subdir body.')
    })
  })

  it('30. H7 — an ABSOLUTE path within the store root ⇒ ok (unchanged behavior; path.resolve ignores the root)', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(storeRoot)
      const abs = writeMd(storeRoot, 'absdoc.md', '# Absdoc\n\nBody.\n')
      const store = freshStore(dir, 'aa')
      const r = expectOk(await importMarkdownCorpus(makeCtx(store), { files: [abs], corpusRoot: storeRoot }))
      expect(r.documentIds).toEqual(['absdoc'])
      expect(store.getNode('absdoc')).toBeDefined()
    })
  })

  it('31. H8 — per-store-root containment discipline (UNCHANGED code, per-store root): a symlink INSIDE the store root pointing OUTSIDE is REJECTED with the byte-equal message', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(storeRoot)
      const outsideDir = mkdtempSync(join(tmpdir(), 'provident-ms4-out-'))
      try {
        const outside = writeMd(outsideDir, 'outside.md', '# Outside\n')
        const link = join(storeRoot, 'link.md')
        symlinkSync(outside, link)
        const store = freshStore(dir, 'ab')
        const r = await importMarkdownCorpus(makeCtx(store), { files: [link], corpusRoot: storeRoot })
        expect(r.ok).toBe(false)
        if (r.ok) throw new Error('expected failure')
        expect(r.error).toBe(`markdown import: path outside corpus root: ${link}`)
        expect(r.failedFile).toBe(link)
        expect(store.listNodes()).toEqual([])
      } finally {
        rmSync(outsideDir, { recursive: true, force: true })
      }
    })
  })

  it('32. F12 — a RELATIVE path escaping the STORE root ⇒ the byte-equal `path outside corpus root: ../outside.md` with failedFile (the message format is unchanged; containment is now against the store root)', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(storeRoot)
      writeMd(dir, 'outside.md', '# Outside\n') // the escape TARGET, sibling of store-root
      const store = freshStore(dir, 'ac')
      const r = await importMarkdownCorpus(makeCtx(store), { files: ['../outside.md'], corpusRoot: storeRoot })
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe('markdown import: path outside corpus root: ../outside.md')
      expect(r.failedFile).toBe('../outside.md')
      expect(store.listNodes()).toEqual([])
    })
  })

  it('33. §5.3 R7 pin — the store context carries NO path data: a hostile store NAME cannot influence which file is read (identical ok/error outcomes for a hostile vs a plain name; the store name is opaque except SC3\'s colon ban)', async () => {
    await withDirAsync(async (dir) => {
      const storeRoot = join(dir, 'store-root')
      mkdirSync(storeRoot)
      const doc = writeMd(storeRoot, 'doc.md', '# Doc\n\nBody.\n')
      const storeHostile = freshStore(dir, 'ad')
      const storePlain = freshStore(dir, 'ae')
      // Existing file: both contexts read the SAME file (ok for both).
      const okHostile = await importMarkdownCorpus(
        makeCtx(storeHostile),
        { files: ['doc.md'], corpusRoot: storeRoot },
        storeCtx({ name: '../evil', isDefault: false }),
      )
      const okPlain = await importMarkdownCorpus(
        makeCtx(storePlain),
        { files: ['doc.md'], corpusRoot: storeRoot },
        { name: 'S', isDefault: false },
      )
      expectOk(okHostile)
      expectOk(okPlain)
      // Missing file: the path error is byte-identical for both names — the
      // path resolution depends ONLY on params.corpusRoot + params.files.
      const errHostile = await importMarkdownCorpus(
        makeCtx(storeHostile),
        { files: ['missing.md'], corpusRoot: storeRoot },
        storeCtx({ name: '../evil', isDefault: false }),
      )
      const errPlain = await importMarkdownCorpus(
        makeCtx(storePlain),
        { files: ['missing.md'], corpusRoot: storeRoot },
        { name: 'S', isDefault: false },
      )
      expect(errHostile.ok).toBe(false)
      expect(errPlain.ok).toBe(false)
      if (errHostile.ok || errPlain.ok) throw new Error('expected failures')
      expect(errHostile.error).toBe('markdown import: cannot read file: missing.md')
      expect(errPlain.error).toBe(errHostile.error)
      expect(doc).toBeDefined()
    })
  })
})

// ===========================================================================
// §5.5 — the cross-store uniqueness invariants (INV-1/INV-2/INV-4/INV-5)
// ===========================================================================
describe('§5.5 — cross-store uniqueness invariants (INV-1/INV-2/INV-4/INV-5)', () => {
  // Data states enumerated (§5.5): INV-1/INV-2 — two stores × the same file
  // mint distinct document/node ids; INV-4 — a foreign prefixed id passed to
  // the DEFAULT store MISSES (never a silent mutation of a same-named node);
  // INV-5 — two concurrent imports (Promise.all, distinct ctx.stores) cannot
  // interfere. INV-6 (the edge-id equality non-hazard) is the POST-GREEN
  // adversarial regression (§3a probe iv) — NOT authored here.
  it('34. H4/INV-1+2+5 — two stores importing readme.md SIMULTANEOUSLY (Promise.all): both ok; `readme` vs `S:readme`; the minted node-id sets are DISJOINT; neither import interferes with the other', async () => {
    await withDirAsync(async (dir) => {
      const corpus = join(dir, 'corpus')
      mkdirSync(corpus)
      const readme = writeMd(corpus, 'readme.md', SMALL_MD)
      const storeDefault = freshStore(dir, 'ae2')
      const storeS = freshStore(dir, 'af')
      const [rDefault, rS] = await Promise.all([
        importMarkdownCorpus(makeCtx(storeDefault), { files: [readme], corpusRoot: corpus }),
        importMarkdownCorpus(
          makeCtx(storeS),
          { files: [readme], corpusRoot: corpus },
          { name: 'S', isDefault: false },
        ),
      ])
      expectOk(rDefault)
      expectOk(rS)
      // INV-1 — documentId uniqueness across stores.
      expect(rDefault.ok && rDefault.documentIds).toEqual(['readme'])
      expect(rS.ok && rS.documentIds).toEqual(['S:readme'])
      // INV-2 — node-id uniqueness across stores (disjoint sets).
      const defaultIds = new Set(idsOf(storeDefault))
      const sIds = idsOf(storeS)
      for (const id of sIds) expect(defaultIds.has(id), `id ${id} must be store-local`).toBe(false)
      expect(sIds).toContain('S:readme')
      expect(sIds).toContain('S:readme:section:1')
      expect(defaultIds.has('readme')).toBe(true)
      // INV-5 — each import landed ONLY in its own store.
      expect(idsOf(storeDefault).every((id) => !id.startsWith('S:'))).toBe(true)
    })
  })

  it('35. H11/INV-4 — a foreign prefixed id passed to the DEFAULT store\'s edit.set_content MISSES ("edit.set_content: node not found") and NEVER silently mutates the default store\'s same-named node (the B3 regression)', async () => {
    await withDirAsync(async (dir) => {
      const corpus = join(dir, 'corpus')
      mkdirSync(corpus)
      const readme = writeMd(corpus, 'readme.md', SMALL_MD)
      const storeDefault = freshStore(dir, 'ag')
      const storeS = freshStore(dir, 'ah')
      // Seed the DEFAULT store with the same-named document (the hazard setup).
      expectOk(await importMarkdownCorpus(makeCtx(storeDefault), { files: [readme], corpusRoot: corpus }))
      // Import the SAME file into the non-default store S.
      const rS = await importMarkdownCorpus(
        makeCtx(storeS),
        { files: [readme], corpusRoot: corpus },
        { name: 'S', isDefault: false },
      )
      expectOk(rS)
      expect(rS.ok && rS.documentIds).toEqual(['S:readme'])
      // INV-4 — the foreign id misses in the default store.
      const before = storeDefault.getNode('readme:section:1')!.content
      const miss = await setContent(makeCtx(storeDefault), { nodeId: 'S:readme:section:1', content: 'hijacked' })
      expect(miss.ok).toBe(false)
      if (miss.ok) throw new Error('expected a miss')
      expect(miss.error).toBe('edit.set_content: node not found')
      // …and the default store's same-named node is UNCHANGED.
      expect(storeDefault.getNode('readme:section:1')!.content).toBe(before)
    })
  })
})

// ===========================================================================
// §5.7 — per-store one-shot/upsert + ONE-WAY-SNAPSHOT per store
// ===========================================================================
describe('§5.7 — per-store one-shot/upsert + ONE-WAY-SNAPSHOT per store', () => {
  it('36. H9 — a re-import into the SAME non-default store re-mints the SAME PREFIXED ids and OVERWRITES (upsert, one-shot not idempotent)', async () => {
    await withDirAsync(async (dir) => {
      const readme = writeMd(dir, 'readme.md', SMALL_MD)
      const store = freshStore(dir, 'ai')
      const ctx = { name: 'S', isDefault: false } as ImportStoreContext
      const params: ImportMarkdownParams = { files: [readme], corpusRoot: dir }
      const r1 = await importMarkdownCorpus(makeCtx(store), params, ctx)
      expectOk(r1)
      expect(r1.ok && r1.documentIds).toEqual(['S:readme'])
      const countAfterFirst = store.listNodes().length
      const r2 = await importMarkdownCorpus(makeCtx(store), params, ctx)
      expectOk(r2)
      expect(r2.ok && r2.documentIds).toEqual(['S:readme'])
      // Deterministic re-mint + upsert — no second set, no refusal.
      expect(store.listNodes().length).toBe(countAfterFirst)
      expect(store.getNode('S:readme')).toBeDefined()
      expect(store.getNode('S:readme:section:1')).toBeDefined()
      expect(store.getNode('S:readme:p:1')).toBeDefined()
    })
  })

  it('37. §5.7 ONE-WAY-SNAPSHOT per store — a non-default-context import writes NOTHING to the source file and lands its OWN one-shot batch journal entry (guard)', async () => {
    await withDirAsync(async (dir) => {
      const readme = writeMd(dir, 'readme.md', CENSUS_MD)
      const store = freshStore(dir, 'aj')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [readme], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expectOk(r)
      expect(readFileSync(readme, 'utf8')).toBe(CENSUS_MD)
      const entries = store.journal()
      expect(entries).toHaveLength(1)
      expect(entries[0].kind).toBe('batch')
    })
  })
})

// ===========================================================================
// §5.9 F10/F11/F14 — the doc-flow/duplicate/empty fail-states under the prefix
// ===========================================================================
describe('§5.9 F10/F11/F14 — the inherited fail-states under a non-default store context', () => {
  // Fail-states enumerated (§5.9): F10 — the doc-flow failure echoes the FINAL
  // (prefixed) id (:138); F11 — the duplicate-documentId error echoes the
  // FINAL id, NO failedFile (:125); F14 — the empty-documentId check runs
  // BEFORE the prefix (never a prefixed-empty id, §5.2 step 4e).
  it('38. F10 — a doc-flow failure echoes the PREFIXED id (missing-head)', async () => {
    await withDirAsync(async (dir) => {
      const raw = writeMd(dir, 'rawdoc.md', 'Some text with no heading.\n')
      const store = freshStore(dir, 'ak')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [raw], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe('markdown import: doc-flow validation failed for S:rawdoc: missing-head')
      expect(r.failedFile).toBe(raw)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    })
  })

  it('39. F11 — a duplicate-documentId error echoes the PREFIXED id with NO failedFile (shape unchanged)', async () => {
    await withDirAsync(async (dir) => {
      const a1 = writeMd(dir, 'a.md', '# A\n')
      const a2 = writeMd(dir, 'a.markdown', '# A\n')
      const store = freshStore(dir, 'al')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [a1, a2], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe('markdown import: duplicate documentId: S:a')
      expect(r.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
    })
  })

  it('40. F14 — the empty-documentId precedence BEFORE the prefix: a file sanitizing to "" in a NON-default store ⇒ the byte-equal empty-documentId error, NEVER a prefixed-empty id', async () => {
    await withDirAsync(async (dir) => {
      const blank = writeMd(dir, '   .md', '# X\n')
      const store = freshStore(dir, 'am')
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [blank], corpusRoot: dir },
        { name: 'S', isDefault: false },
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure')
      expect(r.error).toBe(`markdown import: empty documentId for file: ${blank}`)
      expect(r.failedFile).toBe(blank)
      expect(r.error.startsWith('S:')).toBe(false)
      expect(r.error.includes('invalid store context')).toBe(false)
      expect(store.listNodes()).toEqual([])
    })
  })
})