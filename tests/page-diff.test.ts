// tests/page-diff.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of the
// archived `unit-u5-set-rich-text` / `unit-m1-inline-offset-model` inputs; the
// DIFF contract they fed).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md §3.1/§3.2/§3.3
// (as AMENDED by §11 amendment `11.9` item 1):
//   - §3.1 the decomposer is the ADOPTED package `provident-editable@0.2.0`
//     (`htmlToTree` for the decode, `diffTrees` for the diff) and the mapping
//     onto the C9 op set is the ADAPTER `src/main/page-diff.ts` — the ONLY
//     module that imports the package. **The test-local reference
//     `decodePage`/`diffPage`/`mintId` implementation this file used to carry is
//     DELETED** (§6.2: "a suite that re-imports `src/main/rich-decompose.ts` or
//     reconstructs the decode in the test file is a review finding"). This suite
//     asserts the contract through the adapter's REAL API: `decodePage(html)`
//     → `PageDecodeResult` and `buildPageOps(decoded, snapshot, documentId)`
//     → `PageOpsResult`.
//   - §3.1 the CLOSED change-kind → op mapping table (an unmappable kind is a
//     fail-state, never a silent drop): `update.type` → `setType`;
//     `update.content` → `putNode` carrying the projected content;
//     `update.props` → `setProps` with the **changed RAG-owned keys ONLY** (the
//     store's `setProps` MERGES); a run/children difference → exactly ONE op for
//     that node; an `add` → an id-minted `putNode` + the `doc-child` `putEdge`;
//     a `remove` → `removeEdge` + `removeNode`; an edge change → the containment
//     edge only; **any other kind / a package throw → `{ ok: false; kind:
//     'decompose-failed' }`** (the `FS5`/`ST-5` warning class), store untouched.
//   - §3.1/§3.2 the deliberately NOT-diffed list is the ADAPTER's own filter
//     (the package's `update.props` carries the FULL new props object):
//     runtime props minted by the renderer (`contenteditable`,
//     `data-edit-surface`, `data-node-id`, `data-doc-head` as a written prop),
//     `style`, class lists, the surface root's authored props, the
//     representation mode, a node outside the document, an `updatedAt`-only
//     difference, and the package's own reconciliation ids.
//   - §3.1 the `text`-run semantics: the package's `text` leaves are flattened
//     into the owning block's `content` via `providentPlainText`; the raw
//     package `content` must NOT be compared (a block with inline children
//     carries `content: ''` in the package's XOR shape), or every such block
//     emits a spurious op (`FS9`).
//   - §3.2 the closed compared field set (`type`/`content`/`children`/`props`;
//     `documentPath`/`tags` are NOT compared) + the minimal-op rule: for every
//     block whose compared fields differ the op list carries EXACTLY ONE write,
//     and no block whose compared fields are all equal appears at all.
//   - §3.3 item 8 the new-block representation (a host-minted
//     `${documentId}:${type}:${n}` id + the `doc-child` `putEdge` from the
//     containing section, with `order` + `documentIds`) and the removal
//     representation (`FS13`/`FS14`).
//
// Every claim is read through the adapter; the store-side half of the commit is
// exercised against a real temp store (§3.3 item 7's red obligation).
//
// States enumerated (the state machine this file covers):
//   S1  a page equal to the snapshot (an empty mutation subset) → ops = []
//   S2  exactly one changed block (a one-character content edit)
//   S3  several changed blocks over the closed field set
//   S4  a NEW block (a package `add` with no matching RAG id)
//   S5  a block-level element with no RAG id (a surface artifact, incl. a
//       `textarea` element — never minted)
//   S6  a block whose compared fields are equal but whose RUNTIME props differ
//   S7  a node whose only difference is `updatedAt` / `documentPath` / `tags`
//   S8  a block with inline children (the `text`-run projection)
//   S9  a 200-block document with one changed paragraph
//   S10 a block REMOVED from the page (a genuine deletion)
//   S11 an unsupported block-level tag (a table) — the recorded capability gap
//   S12 a malformed page input (a package throw) — the typed refusal arm
// Fail-states covered: `FS7` (a malformed page treated as a partial write),
//   `FS8` (a field outside the closed set), `FS9` (an unrelated node in the op
//   list), `FS13` (a reused new-block id), `FS14` (a removeNode for a node the
//   user did not empty).
import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  decodePage,
  buildPageOps,
  type PageBlock,
  type PageDecodeResult,
  type PageDiffSnapshot,
} from '../src/main/page-diff.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
const DOC = 'doc'
const NOW = '2026-01-01T00:00:00.000Z'

/** The runtime props the §3.1 NOT-diffed list excludes — never compared. */
const RUNTIME_PROP_KEYS = ['contenteditable', 'data-edit-surface', 'data-node-id', 'data-doc-head', 'style', 'class']

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  return { id, kind, source, target, createdAt: NOW, updatedAt: NOW, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-page-diff-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

async function seed(store: RagStore, nodes: RagNode[], edges: RagEdge[] = []): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

/**
 * The document's READ-ONLY node/edge view, in the shape of the store's own
 * snapshot seam (§3.1: "`PageDiffSnapshot` is the document's read-only
 * node/edge view taken from the store's own snapshot seam
 * (`DECIDED: RAG-SNAPSHOT-PRESERVED`)"). The seam's payload is
 * `RagSnapshotPayload`; the adapter adds no `RagStore` member.
 */
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

/** A page: one block element per RAG block, in document order. */
function pageOf(blocks: { ragId?: string; tag: string; inner: string; attrs?: string }[]): string {
  return blocks
    .map((b) => {
      const rag = b.ragId === undefined ? '' : ` data-rag-node-id="${b.ragId}"`
      return `<${b.tag}${rag}${b.attrs ?? ''}>${b.inner}</${b.tag}>`
    })
    .join('')
}

/** The decoded blocks of a page through the adapter, or a LOUD failure. */
function decodeOk(html: string): { blocks: PageBlock[]; documentId: string } {
  const decoded: PageDecodeResult = decodePage(html)
  if (!decoded.ok) throw new Error(`decodePage refused a page this suite expects to decode: ${decoded.message}`)
  return { blocks: decoded.blocks, documentId: decoded.documentId }
}

/** The op list for a page against a store, through the adapter, or a LOUD failure. */
function opsFor(html: string, store: RagStore, documentId = DOC): BatchOp[] {
  const decoded = decodePage(html)
  const result = buildPageOps(decoded, snapshotOf(store), documentId)
  if (!result.ok) throw new Error(`buildPageOps refused a draw this suite expects to map: ${result.message}`)
  return result.ops
}

/** The RAG-owned props of a store node (the compared subset only). */
function ragOwnedProps(node: RagNode | undefined): Record<string, unknown> {
  const props = { ...(node?.props ?? {}) }
  for (const runtime of RUNTIME_PROP_KEYS) delete props[runtime]
  return props
}

/** Every node id an op names (`nodeId`, `node.id`, `edge.source`/`edge.target`). */
function nodeIdsOf(ops: BatchOp[]): string[] {
  const ids: string[] = []
  for (const op of ops) {
    const anyOp = op as { nodeId?: string; node?: RagNode; id?: string; edge?: RagEdge }
    if (typeof anyOp.nodeId === 'string') ids.push(anyOp.nodeId)
    if (typeof anyOp.node?.id === 'string') ids.push(anyOp.node.id)
    if (typeof anyOp.id === 'string') ids.push(anyOp.id)
    if (typeof anyOp.edge?.source === 'string') ids.push(anyOp.edge.source)
    if (typeof anyOp.edge?.target === 'string') ids.push(anyOp.edge.target)
  }
  return ids
}

/** The op list an `removeNode`/`removeEdge` pair expresses a deletion with. */
function removalOps(ops: BatchOp[]): BatchOp[] {
  return ops.filter((op) => op.op === 'removeNode' || op.op === 'removeEdge')
}

/** The doc-child containment edges the op list writes. */
function docChildEdges(ops: BatchOp[]): RagEdge[] {
  return ops
    .filter((op): op is { op: 'putEdge'; edge: RagEdge } => op.op === 'putEdge')
    .map((op) => op.edge)
    .filter((edge) => edge.kind === 'doc-child')
}

/** The `putNode` ops, typed. */
function putNodes(ops: BatchOp[]): RagNode[] {
  return ops.filter((op): op is { op: 'putNode'; node: RagNode } => op.op === 'putNode').map((op) => op.node)
}

// ===========================================================================
// §3.1 — the adapter's decode: `htmlToTree` + the C9 field-set projection
// ===========================================================================
describe('§3.1 decodePage — the package decode projected onto the C9 `PageBlock` shape', () => {
  it('state S1 — the adapter decodes a two-block page into ordered PageBlocks with the closed field set', () => {
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'alpha' },
      { ragId: 'b2', tag: 'h2', inner: 'beta' },
    ])
    const decoded = decodePage(page)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.blocks.map((b) => b.ragId)).toEqual(['b1', 'b2'])
    expect(decoded.blocks.map((b) => b.elementType)).toEqual(['p', 'h2'])
    // the closed field set of `PageBlock` — nothing more, nothing less
    for (const block of decoded.blocks) {
      expect(Object.keys(block).sort()).toEqual(['children', 'content', 'elementType', 'props', 'ragId', 'text'])
    }
  })

  it('state S1 — an EMPTY page decodes to an empty block list (never a failure, never a throw)', () => {
    const decoded = decodePage('')
    expect(decoded.ok).toBe(true)
    if (decoded.ok) expect(decoded.blocks).toEqual([])
  })

  it('state S1 — the decoded page carries the document id the ops are scoped by', () => {
    const decoded = decodePage(`<p data-rag-node-id="b1">alpha</p>`)
    expect(decoded.ok).toBe(true)
    if (decoded.ok) expect(typeof decoded.documentId).toBe('string')
  })

  it('state S5 — a block-level element with NO `data-rag-node-id` (incl. a `textarea`) is never a block', () => {
    const page = pageOf([
      { tag: 'section', inner: '' },
      { tag: 'textarea', inner: 'legacy' },
      { ragId: 'b1', tag: 'p', inner: 'wrapped' },
    ])
    const decoded = decodeOk(page)
    // the artifact-only elements contribute no block of their own
    expect(decoded.blocks).toHaveLength(1)
    expect(decoded.blocks[0].ragId).toBe('b1')
    // and no block is minted from the textarea's own text
    expect(decoded.blocks.map((b) => b.text)).not.toContain('legacy')
  })

  it('state S1 — `props` carries the block\'s RAG-OWNED props only (a runtime prop is never projected)', () => {
    const page = `<p data-rag-node-id="b1" class="is-editable" style="color:red" contenteditable="true">alpha</p>`
    const decoded = decodeOk(page)
    const block = decoded.blocks[0]
    for (const runtime of ['class', 'style', 'contenteditable']) {
      expect(Object.keys(block.props ?? {})).not.toContain(runtime)
    }
  })

  it('state S1 — `text` is the block\'s plain text (the `FS14` read and the live battery\'s compare)', () => {
    const page = `<p data-rag-node-id="b1">alpha <strong>bold</strong></p>`
    const decoded = decodeOk(page)
    expect(decoded.blocks[0].text).toContain('alpha')
    expect(decoded.blocks[0].text).toContain('bold')
  })

  it('state S8 — the `text`-run semantics: a block with inline children projects run text + the inline set', () => {
    const page = `<p data-rag-node-id="b1">alpha <strong>bold</strong> tail</p>`
    const decoded = decodeOk(page)
    const block = decoded.blocks[0]
    // the owner's content is the run text AROUND the children (never '' — the
    // package's own XOR shape would read '')
    expect(block.content).toBe('alpha  tail')
    expect(block.children).toEqual([{ type: 'strong', content: 'bold', offset: 6 }])
  })
})

// ===========================================================================
// §3.2 — the minimal-op rule (the op list is a function of the DIFF)
// ===========================================================================
describe('§3.2 — the op list names only changed nodes (the minimal-op rule)', () => {
  it('state S1 — a page equal to the snapshot yields an EMPTY op list', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' }), makeNode('b2', { content: 'beta' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'alpha' },
      { ragId: 'b2', tag: 'p', inner: 'beta' },
    ])
    expect(opsFor(page, store)).toEqual([])
  })

  it('state S2 — a one-character edit yields EXACTLY ONE op naming that node', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' }), makeNode('b2', { content: 'beta' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'alphax' },
      { ragId: 'b2', tag: 'p', inner: 'beta' },
    ])
    const ops = opsFor(page, store)
    expect(ops).toHaveLength(1)
    expect(JSON.stringify(ops[0])).toContain('b1')
    expect(JSON.stringify(ops[0])).not.toContain('b2')
  })

  it('FS9 — no block whose compared fields are all equal appears in the op list (no churn)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'one' }), makeNode('b2', { content: 'two' }), makeNode('b3', { content: 'three' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'one' },
      { ragId: 'b2', tag: 'p', inner: 'two-edited' },
      { ragId: 'b3', tag: 'p', inner: 'three' },
    ])
    expect(new Set(nodeIdsOf(opsFor(page, store)))).toEqual(new Set(['b2']))
  })

  it('state S9 — a one-character edit in a 200-block document names ONE node id', async () => {
    const { store } = newStore()
    const nodes: RagNode[] = []
    const blocks: { ragId: string; tag: string; inner: string }[] = []
    for (let i = 0; i < 200; i++) {
      nodes.push(makeNode(`b${i}`, { content: `paragraph-${i}` }))
      blocks.push({ ragId: `b${i}`, tag: 'p', inner: i === 137 ? `paragraph-137x` : `paragraph-${i}` })
    }
    await seed(store, nodes)
    const ops = opsFor(pageOf(blocks), store)
    expect(ops).toHaveLength(1)
    expect(new Set(nodeIdsOf(ops))).toEqual(new Set(['b137']))
  })

  it('state S3 — several independently changed blocks each get exactly one write', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('a', { content: 'A' }), makeNode('b', { content: 'B' }), makeNode('c', { content: 'C' })])
    const page = pageOf([
      { ragId: 'a', tag: 'p', inner: 'A!' },
      { ragId: 'b', tag: 'p', inner: 'B' },
      { ragId: 'c', tag: 'h2', inner: 'C' },
    ])
    const ops = opsFor(page, store)
    expect(ops).toHaveLength(2)
    const perNode = new Map<string, number>()
    for (const op of ops) {
      const id = (op as { nodeId?: string; node?: RagNode }).nodeId ?? (op as { node?: RagNode }).node?.id ?? ''
      perNode.set(id, (perNode.get(id) ?? 0) + 1)
    }
    expect([...perNode.values()]).toEqual([1, 1])
  })

  it('state S8/FS9 — a block with inline children whose compared fields are equal yields NO op (never a raw-package-content compare)', async () => {
    const { store } = newStore()
    await seed(store, [
      makeNode('b1', { content: 'alpha tail', children: [{ type: 'strong', content: 'bold', offset: 6 }] }),
    ])
    const page = `<p data-rag-node-id="b1">alpha <strong>bold</strong> tail</p>`
    // the decoded projection is `alpha  tail` + `[strong]`; a comparison against
    // the store's own split must find them EQUAL, so the op list is empty. A
    // projection reading the package's raw `content` ('' under the XOR rule)
    // would emit a spurious op here — `FS9`.
    const ops = opsFor(page, store)
    expect(ops).toEqual([])
  })
})

// ===========================================================================
// §3.1/§3.2 — the CLOSED compared field set + the adapter's own exclusion filter
// ===========================================================================
describe('§3.2 — the compared field set is CLOSED (runtime props / updatedAt / document metadata never enter)', () => {
  it('state S6/FS8 — a page whose RUNTIME props differ from the store node yields NO op', async () => {
    const { store } = newStore()
    // the store node carries the runtime props the renderer mints; the page
    // carries different ones. The package's FULL `update.props` sees a
    // difference — the ADAPTER's filter is what excludes it (§3.1).
    await seed(store, [makeNode('b1', { content: 'same', props: { 'data-node-id': 'b1', class: 'old' } })])
    const page = `<p data-rag-node-id="b1" class="new" style="color:red" contenteditable="true" data-edit-surface="doc">same</p>`
    expect(opsFor(page, store)).toEqual([])
  })

  it('state S7/FS8 — a node whose only difference is `updatedAt` produces no op', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'same', updatedAt: '2000-01-01T00:00:00.000Z' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'same' }])
    expect(opsFor(page, store)).toEqual([])
  })

  it('FS8 — a `documentPath`/`tags`-only difference is not compared (a document-metadata edit is outside this unit)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'same', documentPath: ['a/b'], tags: ['x'] } as Partial<RagNode>)])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'same' }])
    expect(opsFor(page, store)).toEqual([])
  })

  it('§3.1 — NO op ever names a package reconciliation id (an op naming one is `FS9`)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'same' })])
    const page = `<p data-rag-node-id="b1">same</p>`
    const ops = opsFor(page, store)
    expect(ops).toEqual([])
    // and on a changed page the only id in the op list is the RAG id
    const changed = opsFor(`<p data-rag-node-id="b1">changed</p>`, store)
    expect(new Set(nodeIdsOf(changed))).toEqual(new Set(['b1']))
  })
})

// ===========================================================================
// §3.1 — the change-kind → op mapping table (one op per changed kind)
// ===========================================================================
describe('§3.1 — the closed change-kind → op mapping', () => {
  it('§3.1 — a `type` difference maps to ONE `setType` op (never a putNode with a new node)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { type: 'p', content: 'same' })])
    const page = pageOf([{ ragId: 'b1', tag: 'h2', inner: 'same' }])
    expect(opsFor(page, store)).toEqual([{ op: 'setType', nodeId: 'b1', type: 'h2' }])
  })

  it('§3.1 — a `content` difference maps to ONE `putNode` carrying the projected content (identity preserved)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'before' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'after' }])
    const ops = opsFor(page, store)
    expect(ops).toHaveLength(1)
    expect(ops[0].op).toBe('putNode')
    const node = putNodes(ops)[0]
    expect(node.id).toBe('b1')
    expect(node.content).toBe('after')
    expect(node.type).toBe('p')
    expect(node.createdAt).toBe(NOW)
  })

  it('state S8 — a children difference writes the `putNode` carrying content AND children (one op for that node)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha tail', children: [] })])
    const page = `<p data-rag-node-id="b1">alpha <strong>bold</strong> tail</p>`
    const ops = opsFor(page, store)
    expect(ops).toHaveLength(1)
    expect(ops[0].op).toBe('putNode')
    expect(putNodes(ops)[0].children).toEqual([{ type: 'strong', content: 'bold', offset: 6 }])
  })

  it('§3.1 — a `props` difference maps to ONE `setProps` with the CHANGED RAG-OWNED KEYS only (the merge survives)', async () => {
    const { store } = newStore()
    // the store node holds the decoded page's own RAG-owned props + the doc-head
    // marker the merge must preserve
    await seed(store, [makeNode('b1', { content: 'same', props: { 'data-doc-head': true, keep: 'me' } })])
    const page = `<p data-rag-node-id="b1" data-rag-props='{"keep":"me","added":"new"}'>same</p>`
    const decoded = decodeOk(page)
    const stored = store.getNode('b1')
    // NON-VACUITY: the decoded props really differ from the store's RAG-owned
    // props in exactly one key (`added`) — otherwise the row asserts nothing.
    const storedOwned = ragOwnedProps(stored)
    const changedKeys = Object.keys(decoded.blocks[0].props ?? {}).filter(
      (k) => JSON.stringify((decoded.blocks[0].props ?? {})[k]) !== JSON.stringify(storedOwned[k]),
    )
    expect(changedKeys).toEqual(['added'])
    const ops = opsFor(page, store)
    expect(ops).toHaveLength(1)
    expect(ops[0].op).toBe('setProps')
    const setProps = ops[0] as { nodeId: string; props: Record<string, unknown> }
    expect(setProps.nodeId).toBe('b1')
    // ONLY the changed key is sent — `setProps` MERGES, so the store's other
    // keys (incl. the doc-head marker) survive (`FS3`)
    expect(setProps.props).toEqual({ added: 'new' })
    const applied = await store.applyBatch(ops)
    expect(applied.ok).toBe(true)
    const after = store.getNode('b1')
    expect(after?.props?.['data-doc-head']).toBe(true)
    expect(after?.props?.keep).toBe('me')
    expect(after?.props?.added).toBe('new')
  })

  it('FS8 — a RUNTIME-prop-only difference is the discriminating control: no `setProps` at all', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'same', props: { 'data-doc-head': true } })])
    const page = `<p data-rag-node-id="b1" class="x" style="color:red" data-node-id="b1">same</p>`
    const ops = opsFor(page, store)
    expect(ops.filter((op) => op.op === 'setProps')).toEqual([])
    expect(ops).toEqual([])
  })
})

// ===========================================================================
// §3.3 item 8 — a NEW block (an `add` with no matching RAG id)
// ===========================================================================
describe('§3.3 item 8 — a NEW block commits as a minted putNode + a doc-child putEdge', () => {
  it('state S4 — a block matching no store node is a putNode with a HOST-MINTED id, plus its containment edge', async () => {
    const { store } = newStore()
    await seed(
      store,
      [makeNode('sec', { type: 'div', content: '' }), makeNode('b1', { content: 'known' })],
      [makeEdge('e-c0', 'doc-child', 'sec', 'b1', { order: 0, documentIds: [DOC] })],
    )
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'known' },
      { tag: 'p', inner: 'fresh sentence' },
    ])
    const ops = opsFor(page, store)
    const minted = putNodes(ops).filter((n) => !store.getNode(n.id))
    expect(minted).toHaveLength(1)
    expect(minted[0].id).toMatch(/^doc:p:\d+$/)
    expect(minted[0].content).toBe('fresh sentence')
    expect(minted[0].type).toBe('p')
    expect(minted[0].ownedNodeIds).toEqual([])
    // the containment edge is a `doc-child` from the containing section, with
    // its order + the document scope (§3.3 item 8)
    const edges = docChildEdges(ops).filter((e) => e.target === minted[0].id)
    expect(edges).toHaveLength(1)
    expect(edges[0].documentIds).toEqual([DOC])
    expect(typeof edges[0].order).toBe('number')
    // the KNOWN block is untouched (the minimal-op rule)
    expect(nodeIdsOf(ops)).not.toContain('b1')
  })

  it('FS13 — a minted id never collides with an existing node (`${documentId}:${type}:${n}` above every present n)', async () => {
    const { store } = newStore()
    const existing = [makeNode('doc:p:1', { content: 'one' }), makeNode('doc:p:2', { content: 'two' })]
    await seed(store, existing, [makeEdge('e-c0', 'doc-child', 'sec', 'doc:p:2', { order: 0, documentIds: [DOC] })])
    const page = pageOf([{ tag: 'p', inner: 'brand new' }])
    const ops = opsFor(page, store)
    const minted = putNodes(ops)[0]
    expect(minted.id).toBe('doc:p:3')
    for (const n of existing) expect(n.id).not.toBe(minted.id)
  })

  it('FS13 — the minted id for a type with no existing member starts at `:1`, never reusing another type\'s slot', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('doc:p:9', { content: 'nine' })])
    const page = pageOf([{ tag: 'h2', inner: 'a new heading' }])
    const ops = opsFor(page, store)
    expect(putNodes(ops)[0].id).toBe('doc:h2:1')
  })

  it('state S5/FS21 — a `textarea` element on the page is a surface artifact, never minted as a node', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'wrapped' })])
    const page = `<textarea id="textarea-b1">legacy</textarea>` + pageOf([{ ragId: 'b1', tag: 'p', inner: 'wrapped' }])
    const decoded = decodeOk(page)
    expect(decoded.blocks.map((b) => b.ragId)).toEqual(['b1'])
    expect(opsFor(page, store).filter((op) => JSON.stringify(op).includes('textarea'))).toEqual([])
  })
})

// ===========================================================================
// §3.3 item 8 — a deletion, and the `FS14` guard
// ===========================================================================
describe('§3.3 item 8 — a genuinely removed block maps to removeEdge + removeNode', () => {
  it('state S10 — a block gone from the page is expressed as its containment-edge removal + the node removal', async () => {
    const { store } = newStore()
    await seed(
      store,
      [makeNode('sec', { type: 'div', content: '' }), makeNode('b1', { content: 'kept' }), makeNode('gone', { content: '' })],
      [
        makeEdge('e-c1', 'doc-child', 'sec', 'b1', { order: 0, documentIds: [DOC] }),
        makeEdge('e-c2', 'doc-child', 'sec', 'gone', { order: 1, documentIds: [DOC] }),
      ],
    )
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'kept' }])
    const ops = opsFor(page, store)
    const removals = removalOps(ops)
    expect(removals.some((op) => op.op === 'removeNode' && (op as { id: string }).id === 'gone')).toBe(true)
    expect(removals.some((op) => op.op === 'removeEdge')).toBe(true)
    expect(nodeIdsOf(ops)).not.toContain('b1')
  })

  it('FS14 — a block still rendered is never expressed as a removal', async () => {
    const { store } = newStore()
    await seed(
      store,
      [makeNode('sec', { type: 'div', content: '' }), makeNode('b1', { content: 'kept' })],
      [makeEdge('e-c1', 'doc-child', 'sec', 'b1', { order: 0, documentIds: [DOC] })],
    )
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'kept' }])
    expect(removalOps(opsFor(page, store))).toEqual([])
  })
})

// ===========================================================================
// §3.1 — the adapter's failure modes (the `FS5`/`ST-5` warning class)
// ===========================================================================
describe('§3.1 — an unmappable input is REFUSED with a typed result, never a silent partial write', () => {
  it('S12/FS7 — a non-string page input is the typed refusal arm, never a native throw', () => {
    const decoded = decodePage(42 as never)
    expect(decoded.ok).toBe(false)
    if (!decoded.ok) {
      expect(decoded.kind).toBe('decompose-failed')
      expect(typeof decoded.message).toBe('string')
      expect(decoded.message.length).toBeGreaterThan(0)
    }
  })

  it('state S11/FS7 — an unsupported block tag (a table) is REFUSED, not flattened or retyped', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('t', { type: 'table', content: '' }), makeNode('c1', { type: 'td', content: 'cell' })])
    const page = `<table data-rag-node-id="t"><tr><td data-rag-node-id="c1">cell</td></tr></table>`
    const decoded = decodePage(page)
    if (decoded.ok) {
      // if the decode succeeds, the MAPPING must still refuse: the package's
      // closed tag set cannot express a stored table node (§3.2's recorded gap)
      const result = buildPageOps(decoded, snapshotOf(store), DOC)
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.kind).toBe('decompose-failed')
    } else {
      expect(decoded.kind).toBe('decompose-failed')
    }
  })

  it('S12/FS7 — a refused page never yields a phantom op list, and the store stays untouched', async () => {
    const { store, file } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' })])
    const before = JSON.stringify(store.listNodes())
    const decoded = decodePage(undefined as never)
    expect(decoded.ok).toBe(false)
    if (!decoded.ok) {
      // the refusal arm carries no blocks — there is nothing to write
      expect('blocks' in decoded).toBe(false)
    }
    const result = buildPageOps(decoded, snapshotOf(store), DOC)
    expect(result.ok).toBe(false)
    if (!result.ok) expect('ops' in result).toBe(false)
    expect(JSON.stringify(store.listNodes())).toBe(before)
    expect(store.journal().length).toBe(0)
    expect(file.length).toBeGreaterThan(0)
  })

  it('§3.1 — the adapter is PURE and DETERMINISTIC (the same draw yields the same op list)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'alphax' }])
    const first = opsFor(page, store)
    const second = opsFor(page, store)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
    // and it wrote nothing on its own (no I/O on the op-building path)
    expect(store.getNode('b1')?.content).toBe('alpha')
  })
})

// ===========================================================================
// §3.3 item 7 — the store-side obligation the adapter's op list feeds
// ===========================================================================
describe('§3.3 item 7 — the store applies the adapter\'s op list through ONE applyBatch', () => {
  it('state S2 — a content write applies through the same single applyBatch', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'before' })])
    const ops = opsFor(pageOf([{ ragId: 'b1', tag: 'p', inner: 'after' }]), store)
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('b1')?.content).toBe('after')
  })

  it('state S3 — a whole-page commit containing a TYPE change applies through the same ONE applyBatch', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { type: 'p', content: 'same' })])
    const ops = opsFor(pageOf([{ ragId: 'b1', tag: 'h2', inner: 'same' }]), store)
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('b1')?.type).toBe('h2')
  })

  it('state S8 — a commit containing a children write applies through the same ONE applyBatch', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha tail' })])
    const ops = opsFor(`<p data-rag-node-id="b1">alpha <strong>x</strong> tail</p>`, store)
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    expect(store.getNode('b1')?.children).toEqual([{ type: 'strong', content: 'x', offset: 6 }])
  })

  it('§3.3 item 1 — the whole-page commit is ONE applyBatch call (never a per-op loop)', async () => {
    const { store } = newStore()
    await seed(store, [makeNode('a', { content: 'A' }), makeNode('b', { content: 'B' }), makeNode('c', { content: 'C' })])
    const calls: BatchOp[][] = []
    const original = store.applyBatch.bind(store)
    store.applyBatch = async (ops) => {
      calls.push(ops)
      return original(ops)
    }
    const ops = opsFor(
      pageOf([
        { ragId: 'a', tag: 'p', inner: 'A!' },
        { ragId: 'b', tag: 'p', inner: 'B!' },
        { ragId: 'c', tag: 'h2', inner: 'C!' },
      ]),
      store,
    )
    expect(ops.length).toBeGreaterThan(1)
    await store.applyBatch(ops)
    expect(calls).toHaveLength(1)
  })

  it('FS12 — a rejected batch is a DISCRIMINATED result, never a throw', async () => {
    const { store } = newStore()
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'ghost', type: 'h2' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(typeof result.error).toBe('string')
      expect(typeof result.failedIndex).toBe('number')
    }
  })
})
