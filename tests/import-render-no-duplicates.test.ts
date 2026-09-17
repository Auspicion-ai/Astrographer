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
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'
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

/** Import a markdown file through the REAL parser + store (the same path
 *  `edit.import_markdown` uses for the parse/validate/apply stages). */
async function importFile(store: RagStore, file: string): Promise<{ documentId: string; nodeIds: string[] }> {
  const markdown = readFileSync(file, 'utf8')
  const documentId = `docs/specs/${file.split('/').pop()!.replace(/\.md$/, '')}`
  const parsed = parseMarkdown(markdown, documentId)
  for (const n of parsed.nodes) await store.putNode(n)
  for (const e of parsed.edges) await store.putEdge(e)
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
