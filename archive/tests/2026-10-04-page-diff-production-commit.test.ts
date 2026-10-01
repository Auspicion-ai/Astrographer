// tests/page-diff-production-commit.test.ts — NEW RED rows for the RCA-3
// SECOND REMAND on `C9 U-EDIT-1`, finding **N2: page deletions never commit in
// production**.
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md (the spec text is
// the contract; `src/**` was read for symbol names / call signatures and for the
// PRODUCTION SHAPE of the authored edges, never for an expectation):
//   - §3.3 item 8 "**A deleted block** (a block whose RAG node existed before the
//     blur and no longer appears on the page) is expressed as
//     `{ op: 'removeEdge', id }` for its now-absent containment edge, plus
//     `{ op: 'removeNode', id }` for the node. … A `removeNode` for a node the
//     user did not empty is `FS14`."
//   - §3.2's compared-field set + §3.3 item 8's new-block shape (a `doc-child`
//     edge from the containing section, carrying `documentIds`).
//   - §3.1's mapping row `nodeChanges.remove[j]` → `removeEdge` + `removeNode`,
//     **only** when the block is genuinely gone from the page.
//   - §3.3 item 2 the channel is the existing `IPC_EDIT_BATCH` →
//     `handleEditBatch(store, payload)` → `store.applyBatch(ops)`.
//   - §4.4/"the re-traversal the commit triggers (kept)": the committed store is
//     re-derived, and the deleted block must be GONE from the re-derivation.
//
// THE PRODUCTION SHAPE THE OLD ROWS MISSED (the finding, stated as a fact and
// re-read at this pass):
//   - production `doc-child` edges are authored WITHOUT `documentIds`
//     (`src/main/markdown-parse.ts` `addDocChild`; `src/main/edit-ops.ts`'s
//     `splitNode` mints its `doc-child` edge without them), while
//     `src/main/adjacency.ts` deliberately scopes such a global `doc-child` edge
//     to EVERY document key (`buildAdjacencyIndex`'s `if (e.kind === 'doc-child')
//     for (const d of docKeys) …`);
//   - the adapter's removal scan (`src/main/page-diff.ts` `documentBlocks`)
//     REQUIRES `edge.documentIds !== undefined && edge.documentIds.includes(documentId)`.
//   ⇒ on the production shape `documentBlocks` is EMPTY, so no deletion ever
//     emits `removeNode`, and the deleted block reappears after the re-derive.
//
// FICTION REPLACED (the header comment the remand requires): the previously
// green deletion rows (`tests/page-diff.test.ts`'s "state S10 — a block gone from
// the page is expressed as its containment-edge removal + the node removal")
// seed TEST-LOCAL edges that carry `documentIds: [documentId]`. That shape is not
// what the importer authors, so the branch was green against a shape production
// never produces. Row `SC0` below keeps that shape as this file's CONTROL (it
// must stay green — it proves the oracle discriminates), and `SP1`/`SP2` drive
// the PRODUCTION shape end to end.
//
// States enumerated (the state machine this file covers):
//   SP1  the production shape: an imported document, one paragraph removed from
//        the page, committed through `handleEditBatch` ⇒ the block is gone
//   SP2  the production shape: the re-derive after that commit ⇒ the removed
//        block's node id / text is absent from the traversal envelope
//   SP3  the production shape: a block the page still renders ⇒ NO removal
//        (the `FS14` guard — the removal scan must not read a rendered block)
//   SP4  the production shape: a NEW block typed into the page ⇒ the minted
//        putNode + its `doc-child` edge (the sibling half of the same scan)
//   SC0  the CONTROL: the test-local SCOPED-edge shape does emit the removal
//        pair today (green — the old rows' fiction, kept as the discriminator)
//   SC1  the CONTROL: an unchanged page on the production shape ⇒ ZERO ops
// Fail-states covered: `FS14`'s neighbour (a committed deletion that never
//   happens — the block survives the commit and the re-derive), and the
//   containment-edge half of §3.3 item 8 (an orphaned `doc-child` edge left
//   behind by a removal that only removed the node).
import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseMarkdown } from '../src/main/markdown-parse.js'
import { handleEditBatch } from '../src/main/edit-ops.js'
import { buildTraversal } from '../src/main/traversal.js'
import { decodePage, buildPageOps, type PageDiffSnapshot } from '../src/main/page-diff.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'

const DOC = 'docs/prod-shape'
const MARKDOWN = '# Title\n\nfirst paragraph\n\nsecond paragraph\n'

function freshStore(): RagStore {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-prod-')), 'rag.json')
  return createJsonRagStore({ path: file })
}

/** The store's read-only node/edge view — the adapter's snapshot seam (§3.1). */
function snapshotOf(store: RagStore): PageDiffSnapshot {
  const payload: RagSnapshotPayload = {
    store: 'main',
    nodes: store.listNodes().map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      props: n.props,
      children: n.children,
      ownedNodeIds: n.ownedNodeIds,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    edges: store.listEdges().map((e) => ({
      id: e.id,
      kind: e.kind,
      source: e.source,
      target: e.target,
      order: e.order,
      documentIds: e.documentIds,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  }
  return payload as unknown as PageDiffSnapshot
}

/** Seed through the REAL import path (parseMarkdown → one atomic applyBatch, the
 *  mechanism `src/main/markdown-import.ts` uses). */
async function importDocument(store: RagStore, markdown = MARKDOWN, documentId = DOC): Promise<{ nodes: RagNode[]; edges: RagEdge[] }> {
  const parsed = parseMarkdown(markdown, documentId)
  const ops: BatchOp[] = [
    ...parsed.nodes.map((node) => ({ op: 'putNode' as const, node })),
    ...parsed.edges.map((edge) => ({ op: 'putEdge' as const, edge })),
  ]
  const result = await handleEditBatch(store, { ops })
  expect(result.ok, `the import must land (handleEditBatch): ${result.ok ? '' : result.error}`).toBe(true)
  return { nodes: parsed.nodes, edges: parsed.edges }
}

/** The page the single surface renders for a document: the surface root (§2.1)
 *  plus one element per rendered block, in document order. `omit` drops a block
 *  (the user deleted it); `extra` appends a block the user typed. */
function pageFor(nodes: RagNode[], omit: string[] = [], extra = ''): string {
  const body = nodes
    .filter((n) => n.id !== DOC && !omit.includes(n.id))
    .map((n) => `<${n.type} data-rag-node-id="${n.id}">${n.content}</${n.type}>`)
    .join('')
  return `<div id="page-edit-surface" data-edit-surface="${DOC}" contenteditable="true">${body}${extra}</div>`
}

function removeNodeOps(ops: BatchOp[], id: string): BatchOp[] {
  return ops.filter((op) => (op.op === 'removeNode' && op.id === id) || (op.op === 'removeEdge' && op.id !== undefined && op.id.includes(id)))
}

/** The `doc-child` edges the PRODUCTION import authored, read as the fact this
 *  finding turns on: they carry NO `documentIds`. */
function productionDocChildEdges(edges: RagEdge[]): RagEdge[] {
  return edges.filter((e) => e.kind === 'doc-child')
}

describe('N2 — a page deletion must commit on the PRODUCTION edge shape (the imported document)', () => {
  it('SP1 — a block removed from the page is committed as removeEdge + removeNode through handleEditBatch', async () => {
    const store = freshStore()
    const { nodes, edges } = await importDocument(store)

    // THE FICTION, MEASURED RATHER THAN ASSUMED: the production `doc-child` edges
    // carry no `documentIds` (the adapter's removal scan requires them).
    const docChild = productionDocChildEdges(edges)
    expect(docChild.length, 'the import authors doc-child containment edges').toBeGreaterThan(0)
    expect(
      docChild.every((e) => e.documentIds === undefined),
      'PRODUCTION SHAPE: the importer authors `doc-child` edges WITHOUT `documentIds` (this is what makes `documentBlocks` empty)',
    ).toBe(true)

    const removed = nodes.find((n) => n.type === 'p' && n.content === 'second paragraph')
    expect(removed, 'the drawn document really has the paragraph this row deletes').toBeDefined()
    const removedId = removed!.id

    const built = buildPageOps(decodePage(pageFor(nodes, [removedId])), snapshotOf(store), DOC)
    expect(built.ok, `the page must produce an op list: ${built.ok ? '' : built.message}`).toBe(true)
    if (!built.ok) return

    const ops = built.ops
    expect(
      ops.some((op) => op.op === 'removeNode' && op.id === removedId),
      `a block gone from the page must commit a removeNode for ${removedId} (§3.3 item 8) — got ${JSON.stringify(ops)}`,
    ).toBe(true)
    const chain = store.listEdges().find((e) => e.kind === 'doc-child' && e.target === removedId)
    expect(chain, 'the removed block had a containment edge').toBeDefined()
    expect(
      ops.some((op) => op.op === 'removeEdge' && op.id === chain!.id),
      `the now-absent containment edge ${chain!.id} must be removed too (§3.3 item 8)`,
    ).toBe(true)

    // the commit itself: ONE `handleEditBatch` payload (the production channel)
    const result = await handleEditBatch(store, { ops })
    expect(result.ok, `the deletion must commit: ${result.ok ? '' : result.error}`).toBe(true)
    expect(store.getNode(removedId), 'the deleted block must be GONE from the store after the commit').toBeUndefined()
    expect(store.getEdge(chain!.id), 'its containment edge is gone with it').toBeUndefined()
  })

  it('SP2 — after the commit the re-derive no longer renders the deleted block', async () => {
    const store = freshStore()
    const { nodes } = await importDocument(store)
    const removed = nodes.find((n) => n.type === 'p' && n.content === 'second paragraph')!
    const built = buildPageOps(decodePage(pageFor(nodes, [removed.id])), snapshotOf(store), DOC)
    expect(built.ok).toBe(true)
    if (!built.ok) return
    await handleEditBatch(store, { ops: built.ops })

    // §4.4 — the commit's re-traversal (the documented follow-up path)
    const reDerived = buildTraversal({ store, documentIds: [DOC], zoneName: 'main' })
    const authored = JSON.stringify(reDerived.envelope)
    expect(
      authored.includes(removed.id),
      `the deleted block ${removed.id} reappeared in the re-derive — the deletion never committed`,
    ).toBe(false)
    expect(authored.includes('second paragraph'), 'the deleted block\'s TEXT reappeared in the re-derive').toBe(false)
    // NON-VACUITY: the re-derive really materialized the surviving document
    expect(authored.includes('first paragraph'), 'the surviving block IS rendered (the census is not empty)').toBe(true)
  })

  it('SP3 — a block the page still renders is NEVER expressed as a removal (the FS14 guard on the production shape)', async () => {
    const store = freshStore()
    const { nodes } = await importDocument(store)
    const built = buildPageOps(decodePage(pageFor(nodes)), snapshotOf(store), DOC)
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(
      built.ops.filter((op) => op.op === 'removeNode'),
      'an unchanged page renders every block ⇒ NO removeNode at all (§3.3 item 8, FS14)',
    ).toEqual([])
    expect(built.ops, 'the unchanged production page is a complete no-op').toEqual([])
    // the discriminator for the empty list above is `SC0` (the scoped-edge shape
    // DOES emit the pair), so this row's empty list is not a dead scan.
    expect(removeNodeOps(built.ops, nodes[2].id)).toEqual([])
  })

  it('SP4 — a block the user typed into the page is minted with its `doc-child` edge on the production shape', async () => {
    const store = freshStore()
    const { nodes } = await importDocument(store)
    const typed = '<p data-rag-node-id="docs/prod-shape:p:typed-probe">a typed block</p>'
    const built = buildPageOps(decodePage(pageFor(nodes, [], typed)), snapshotOf(store), DOC)
    expect(built.ok, `the typed block must map: ${built.ok ? '' : built.message}`).toBe(true)
    if (!built.ok) return
    const minted = built.ops.find((op) => op.op === 'putNode' && op.node.content === 'a typed block')
    expect(minted, 'a typed block commits a minted putNode (§3.3 item 8)').toBeDefined()
    const edge = built.ops.find((op) => op.op === 'putEdge' && op.edge.target === (minted as { node: RagNode }).node.id)
    expect(edge, 'the minted block carries its `doc-child` containment edge (§3.3 item 8)').toBeDefined()
    expect(
      (edge as { edge: RagEdge }).edge.kind,
      'the containment edge is a `doc-child` edge',
    ).toBe('doc-child')
    expect(
      (edge as { edge: RagEdge }).edge.documentIds,
      'the MINTED edge carries `documentIds` (the same field the PRODUCTION import omits — the asymmetry this finding turns on)',
    ).toEqual([DOC])
  })

  it('SC0 (CONTROL) — the TEST-LOCAL scoped-edge shape DOES emit the removal pair (the old rows\' fiction)', async () => {
    const store = freshStore()
    const { nodes, edges } = await importDocument(store)
    const removed = nodes.find((n) => n.type === 'p' && n.content === 'second paragraph')!
    // the shape the previously-green rows seeded: the doc-child edge carries
    // `documentIds: [documentId]`. It is re-authored HERE so the control proves
    // the row's oracle discriminates (and names the fiction it replaces).
    for (const edge of edges) {
      if (edge.kind !== 'doc-child') continue
      await store.removeEdge(edge.id)
      await store.putEdge({ ...edge, documentIds: [DOC] })
    }
    const built = buildPageOps(decodePage(pageFor(nodes, [removed.id])), snapshotOf(store), DOC)
    expect(built.ok).toBe(true)
    if (!built.ok) return
    expect(
      built.ops.some((op) => op.op === 'removeNode' && op.id === removed.id),
      'with `documentIds` present the removal IS emitted — so SP1/SP2 measure the edge shape, not a dead scan',
    ).toBe(true)
  })
})
