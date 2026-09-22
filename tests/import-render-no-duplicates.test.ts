// tests/import-render-no-duplicates.test.ts — the USER-REQUIRED end-to-end
// contract (2026-09-16 report): "importing a document from /specs → the
// rendered text content matches 1-1 with NO duplicate elements".
//
// This is the RED set for the duplication defect (docs/defects.md LIVE-UF6
// DUPLICATE-EDITABLE-PARAGRAPH + report #1 I-3/I-4): every RAG node of an
// IMPORTED document must be materialized into the produced envelope EXACTLY
// ONCE, and the materialized text must equal the source markdown's text
// content 1-1.
//
// The pipeline under test is the REAL one: parseMarkdown (the importer's
// parser) → createJsonRagStore → buildTraversal (the document load) → count
// the occurrences of every node id in the produced content payloads, plus the
// rendered DOM text via the Runtime (the assembled half).
//
// RED today: an imported doc's first paragraph (and every section's following
// block) appears TWICE — once nested inside its section subtree and once as a
// standalone content payload (the MULTI-PARENT-DUPLICATE loop), because the
// standalone-materialization exclusion only recognises `doc-child` targets and
// the section's OWN child blocks are emitted both ways.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { parseMarkdown } from '../src/main/markdown-parse.js'
import { createJsonRagStore, type BatchOp, type RagStore } from '../src/main/rag-store.js'
import { buildTraversal } from '../src/main/traversal.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

const ROOT = join(import.meta.dirname, '..')

/** The real /specs source the user named (a large, table/list/heading-heavy doc). */
const SPEC_FILES = [
  join(ROOT, 'docs', 'specs', 'ui-overhaul.md'),
  join(ROOT, 'docs', 'specs', 'user-flow-audit.md'),
]

function freshStore(): { dir: string; store: RagStore } {
  const dir = mkdtempSync(join(tmpdir(), 'astrographer-import-dup-'))
  const store = createJsonRagStore({ path: join(dir, 'rag.json') })
  return { dir, store }
}

/** Import a markdown file through the REAL parser + store — the SAME path
 *  `edit.import_markdown` uses (parse → validate → apply), including its APPLY
 *  mechanism: ONE atomic `applyBatch` (src/main/markdown-import.ts:379-387),
 *  which lands the corpus as ONE journal entry + ONE full-store `persist()`.
 *  (docs/specs/unit-import-batch-persist.md §2a: driving the corpus through the
 *  per-op public API instead costs one `persist()` per record — 5 640 full-store
 *  serializations for docs/specs/ui-overhaul.md — which is what put the two rows
 *  below over the committed 15 000 ms budget. §2c item 1 keeps the bare per-op
 *  cadence unchanged; the fix is this driver's apply mechanism.) */
async function importFile(store: RagStore, file: string): Promise<{ documentId: string; nodeIds: string[] }> {
  const markdown = readFileSync(file, 'utf8')
  const documentId = `docs/specs/${file.split('/').pop()!.replace(/\.md$/, '')}`
  const parsed = parseMarkdown(markdown, documentId)
  // the importer's own op construction: ALL putNode ops (parse order), then ALL
  // putEdge ops — referential integrity, every edge's endpoints exist first.
  const ops: BatchOp[] = [
    ...parsed.nodes.map((node) => ({ op: 'putNode' as const, node })),
    ...parsed.edges.map((edge) => ({ op: 'putEdge' as const, edge })),
  ]
  const res = await store.applyBatch(ops)
  // §2a: the result is CHECKED — `applyBatch` never throws for a domain failure,
  // so an unchecked `{ok:false}` would make the two rows below vacuous.
  if (!res.ok) {
    throw new Error(
      `importFile(${documentId}): applyBatch failed — ${res.error} (failedIndex=${res.failedIndex}, ops=${ops.length})`,
    )
  }
  return { documentId, nodeIds: parsed.nodes.map((n) => n.id) }
}

/** Census the AUTHORED payloads: every node that is emitted with its own
 *  `id="rag-<ragId>"` element (a subtree root or a nested block). A rag id
 *  appearing more than once means the traversal authored the node twice. */
function payloadRagIdCounts(result: ReturnType<typeof buildTraversal>): Map<string, number> {
  const counts = new Map<string, number>()
  const walk = (node: unknown): void => {
    if (node == null || typeof node !== 'object') return
    const n = node as { props?: Record<string, unknown>; children?: unknown[] }
    const id = n.props?.['id']
    if (typeof id === 'string' && id.startsWith('rag-') && id.length > 4) {
      const ragId = id.slice(4)
      counts.set(ragId, (counts.get(ragId) ?? 0) + 1)
    }
    for (const c of n.children ?? []) walk(c)
  }
  for (const payload of result.envelope.content ?? []) {
    for (const child of (payload as { content?: unknown[] }).content ?? []) walk(child)
  }
  return counts
}

/** The plain text of the produced envelope, in authoring order. */
function envelopeText(result: ReturnType<typeof buildTraversal>): string {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (node == null || typeof node !== 'object') return
    const n = node as { type?: string; content?: string; children?: unknown[] }
    if (typeof n.content === 'string' && (n.type === 'text' || n.type === undefined)) out.push(n.content)
    else if (typeof n.content === 'string' && !(n.children ?? []).length) out.push(n.content)
    for (const c of n.children ?? []) walk(c)
  }
  for (const payload of result.envelope.content ?? []) {
    for (const child of (payload as { content?: unknown[] }).content ?? []) walk(child)
  }
  return out.join(' ')
}

describe('an IMPORTED document materializes each RAG node exactly ONCE (the user 1-1 requirement)', () => {
  for (const file of SPEC_FILES) {
    it(`${file.split('/').pop()} — the authored envelope emits each rag-<id> element exactly once`, async () => {
      installShim()
      const { dir, store } = freshStore()
      try {
        const { documentId, nodeIds } = await importFile(store, file)
        const result = buildTraversal({ store, documentIds: [documentId], zoneName: 'main' })
        const counts = payloadRagIdCounts(result)
        // every node that the traversal materializes must appear EXACTLY once
        const duplicated = [...counts.entries()].filter(([, c]) => c > 1)
        expect(
          duplicated.map(([id, c]) => `${id} ×${c}`),
          'each RAG node must be authored exactly once (a rag id appearing twice is the duplicate-element defect)',
        ).toEqual([])
        // sanity: the import really produced nodes and most of them materialize
        expect(nodeIds.length).toBeGreaterThan(5)
        expect(counts.size, 'the traversal must materialize the imported nodes').toBeGreaterThan(5)
      } finally {
        rmSync(dir, { recursive: true, force: true })
      }
    })
  }

  it('docs/specs/ui-overhaul.md — the RENDERED document has NO duplicate element ids (the user-visible 1-1 requirement)', async () => {
    installShim()
    const { dir, store } = freshStore()
    try {
      const file = SPEC_FILES[0]
      const { documentId } = await importFile(store, file)
      const result = buildTraversal({ store, documentIds: [documentId], zoneName: 'main' })
      const mount = mountEl() as never
      const runtime = new Runtime({
        mount,
        envelope: { template: result.envelope.template, content: [], clientConfig: { runInstantiation: true, runRendering: true } } as never,
      })
      runtime.loadEnvelope(result.envelope as never)
      const html = (mount as unknown as { innerHTML: string }).innerHTML
      // NOTE: the template wrapper (`wiki-root`) is excluded — the Runtime's
      // placeholder-boot mount coexists with the loaded mount (a separate,
      // pre-existing shell-cleanup defect), and it is not CONTENT. The user's
      // requirement is about the document's own elements.
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((id) => id !== 'wiki-root' && !id.startsWith('zone:'))
      const seen = new Map<string, number>()
      for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1)
      const duplicated = [...seen.entries()].filter(([, c]) => c > 1).map(([id, c]) => `${id} ×${c}`)
      expect(
        duplicated,
        'the rendered document must contain each element id exactly once — a repeated id IS a duplicated element',
      ).toEqual([])
      expect(ids.length, 'the rendered document must actually contain elements').toBeGreaterThan(20)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

// ---------------------------------------------------------------------------
// ADDED by unit IMPORT-BATCH-PERSIST (docs/specs/unit-import-batch-persist.md):
// the DRIVER SOURCE-CONTRACT pins. NOTHING above is weakened, renamed, skipped
// or re-scoped (§2c item 5) — these rows are ADDITIONAL, and the two rows above
// keep every assertion byte-identical.
//
// WHY THIS BLOCK IS HERE AND IS RED TODAY (§2a / §1.1 / FS4): the two rows above
// are ~19-21 s each because `importFile` drives the corpus through the store's
// PER-OP public API (`:52-53` — 1 895 `putNode` + 3 745 `putEdge` = 5 640
// `persist()` calls, each serializing the whole growing store). The production
// importer is ALREADY batched (`src/main/markdown-import.ts:379-387` → ONE
// `applyBatch` → ONE `persist()` at `src/main/rag-store.ts:1341`), so the fix is
// this driver's apply mechanism: ONE `await store.applyBatch(ops)` with
// `res.ok === true` checked. This pin is the SOURCE CONTRACT of that correction
// (the tests/unit-o-0-driver-contract.test.ts convention: a node-static
// assertion on the source text, never a claim about behavior).
//
// The census/budget/register pins for the unit live in
// tests/unit-import-batch-persist-contract.test.ts (spec §4/§5.1).
// ---------------------------------------------------------------------------
describe('ADDED (unit IMPORT-BATCH-PERSIST §2a) — the driver applies the corpus through ONE applyBatch', () => {
  const SELF_SRC = readFileSync(new URL(import.meta.url), 'utf8')
  /** The DRIVER region the two rows above actually run: everything ABOVE this
   *  added block. The scan is scoped so this block's own assertions (which must
   *  NAME the offending construct to report it) can never flag themselves. */
  const ADDED_MARKER = 'ADDED by unit IMPORT-BATCH-PERSIST'
  const DRIVER_SRC = SELF_SRC.split(ADDED_MARKER)[0]

  it('P-SM-2 / FS4 — importFile drives ONE applyBatch(…) and does NOT loop store.putNode/store.putEdge', () => {
    // §2e F2 — an empty scan is a FAILURE, not a vacuous pass
    expect(DRIVER_SRC.trim().length, 'the driver scan must be non-empty (F2: an empty scan may never pass)').toBeGreaterThan(0)
    expect(DRIVER_SRC.includes('importFile'), 'the scan must be reading the real driver (importFile is absent)').toBe(true)
    expect(
      /applyBatch\s*\(/.test(DRIVER_SRC),
      'FS4/§2a: tests/import-render-no-duplicates.test.ts must apply the corpus through ONE `store.applyBatch(ops)` (the same path the production importer uses, src/main/markdown-import.ts:379-387)',
    ).toBe(true)
    for (const method of ['putNode', 'putEdge'] as const) {
      const callRe = new RegExp(`store\\.${method}\\s*\\(`)
      const loopRe = /for\s*\([^)]*\)\s*(?:await\s+)?store\.(?:putNode|putEdge)\s*\(/
      expect(
        loopRe.test(DRIVER_SRC),
        `FS4/§2a: a per-op loop is STILL the driver’s apply mechanism — a bare per-op loop over the corpus costs ${method === 'putNode' ? '1 895 + 3 745 = 5 640 full-store writes' : '5 640 full-store writes'} for docs/specs/ui-overhaul.md (each serializing the whole growing store)`,
      ).toBe(false)
      expect(
        DRIVER_SRC.split('\n')
          .filter((l) => /for\s*\(/.test(l) && callRe.test(l))
          .map((l) => l.trim()),
        `FS4/§2a: a per-op ${method} call inside a loop is present in the driver`,
      ).toEqual([])
    }
  })

  it('§2c item 5 — no assertion of the two rows was relaxed, renamed, skipped or .only-ed (the driver’s own subject is intact)', () => {
    // §2c item 5 / F1's companion: the driver correction must not buy its green
    // by weakening the pin. The load-bearing assertions and markers must survive.
    for (const marker of [
      "join(ROOT, 'docs', 'specs', 'ui-overhaul.md')",
      "join(ROOT, 'docs', 'specs', 'user-flow-audit.md')",
      'expect(nodeIds.length).toBeGreaterThan(5)',
      'expect(counts.size, ',
      'toBeGreaterThan(20)',
      'duplicated.map(([id, c]) =>',
    ]) {
      expect(SELF_SRC.includes(marker), `§2c item 5: the driver no longer contains the load-bearing marker ${JSON.stringify(marker)} — the correction must not relax the 1-1 duplication contract`).toBe(true)
    }
    // built by concatenation so this assertion cannot match its own source text
    const skipTokens = [['it', 'only'], ['describe', 'only'], ['it', 'skip'], ['describe', 'skip']].map((p) => p.join('.'))
    for (const token of skipTokens) {
      expect(SELF_SRC.includes(token), `§2c item 5: the driver must not use ${token} — a green obtained by skipping a row is a review finding`).toBe(false)
    }
  })
})
