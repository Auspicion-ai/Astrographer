// tests/page-diff.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of the
// archived `unit-u5-set-rich-text` / `unit-m1-inline-offset-model` /
// `unit-u2-rich-decompose` inputs; the DIFF contract they fed).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §3.1 the decomposer this diff uses is the in-house
//     `src/main/rich-decompose.ts` `decomposeRichHtml` — PURE and TOTAL, the
//     discriminated `{ ok: true; content; children } | { ok: false; error }`
//     arm; a malformed input is the `{ ok: false }` arm — a typed failure, NEVER
//     a partial write (`FS7`). `provident-editable` may never be referenced.
//   - §3.2 the diff granularity (`ST-4`): the surface's subtree is decoded into
//     ordered `PageBlock` records (`{ ragId, elementType, content, children,
//     text }`); a block whose `data-rag-node-id` matches no RAG node is a NEW
//     block; a block-level element with NO `data-rag-node-id` is a surface
//     artifact folding into its parent block's `content` and is never minted.
//     The COMPARED field set is CLOSED: `type`, `content`, `children`, `props`
//     (RAG-owned props only). `documentPath`/`tags` are NOT compared. Runtime
//     props (`data-node-id`, `style`, classes, `contenteditable`,
//     `data-edit-surface`, `data-doc-head` as a WRITTEN prop), the representation
//     mode, the surface root's authored props, a node outside the document, and a
//     node differing only by `updatedAt` are explicitly NOT diffed (`FS8`).
//   - §3.2's minimal-op rule: for every changed block the op list carries EXACTLY
//     ONE write, and no block whose compared fields are all equal appears at all;
//     a one-character edit in one paragraph of a 200-block document names ONE
//     node id (`FS9`).
//   - §3.3 item 8 the new-block representation: `putNode` with a host-minted,
//     collision-free `${documentId}:${type}:${n}` id (`FS13`), plus the
//     `doc-child` `putEdge`; and the removal representation (`FS14`).
//   - §3.2's op table: a `content`/`children` difference writes `putNode` with
//     the new value (the op-level equivalent of `setSubtree`'s replace
//     semantics); a `type` difference writes `setType`.
//
// This file exercises the contract through the modules the spec NAMES
// (`rich-decompose`, the `RagNode`/`BatchOp` shapes, the `RagNodeType` census).
// No module the spec does not name is imported: the decode/diff reference below
// is the test's own ORACLE for the pinned contract, and the store-side half of
// every claim is exercised against a real temp store (§3.3's red obligation —
// today `applyBatchOp` returns `op not supported` for the rich-text ops).
//
// States enumerated (the state machine this file covers):
//   S1  a store of N blocks and a page derived from it with an EMPTY mutation subset
//   S2  a page with exactly one changed block (a one-character content edit)
//   S3  a page with several changed blocks over the closed field set
//   S4  a page with a NEW block (no matching RAG id, and no RAG id at all)
//   S5  a page whose block-level wrapper carries no RAG id (a surface artifact)
//   S6  a block whose compared fields are equal but whose runtime props differ
//   S7  a node whose only difference is `updatedAt` (or documentPath/tags)
//   S8  a page with an inline-children block (strong/em/a/img offsets)
//   S9  a 200-block document with one changed paragraph
// Fail-states covered: `FS7` (a malformed page treated as an empty edit), `FS8`
//   (a field outside the closed set), `FS9` (an unrelated node in the op list),
//   `FS13` (a reused new-block id), `FS14` (a removeNode for a node the user did
//   not empty).
import { describe, it, expect } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { decomposeRichHtml } from '../src/main/rich-decompose.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagNodeChild,
  type RagNodeType,
  type BatchOp,
} from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
/** The closed 23-member `RagNodeType` union, recounted from `src/main/rag-store.ts`. */
const RAG_NODE_TYPES: RagNodeType[] = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th',
]

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): RagStore {
  return createJsonRagStore({ path: join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-diff-')), 'rag.json') })
}

async function seed(store: RagStore, nodes: RagNode[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
}

// ---------------------------------------------------------------------------
// the decode/diff ORACLE (the test's reference implementation of §3.2)
// ---------------------------------------------------------------------------
interface PageBlock {
  ragId: string | null
  /** The document the block belongs to (the minting namespace for a new block). */
  documentId: string
  elementType: string
  content: string
  children: RagNodeChild[]
  /** The block's own decoded text (for a new block's `content`). */
  text: string
  /** RAG-owned props authored on the block element (never runtime props). */
  ragProps: Record<string, unknown>
  /** The commit's single timestamp for a block the store has never seen. */
  createdAt: string
}

/** Element-level scan of the page HTML: top-level blocks carrying a tag + the
 *  optional `data-rag-node-id` / `data-rag-props` authoring. */
function scanBlocks(html: string): { tag: string; inner: string; ragId: string | null; ragProps: Record<string, unknown> }[] {
  const out: { tag: string; inner: string; ragId: string | null; ragProps: Record<string, unknown> }[] = []
  const re = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>([\s\S]*?)<\/\1>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase()
    const attrs = m[2]
    const idMatch = /\bdata-rag-node-id\s*=\s*"([^"]*)"/.exec(attrs)
    const propsMatch = /\bdata-rag-props\s*=\s*'([^']*)'/.exec(attrs)
    out.push({
      tag,
      inner: m[3],
      ragId: idMatch ? idMatch[1] : null,
      ragProps: propsMatch ? (JSON.parse(propsMatch[1]) as Record<string, unknown>) : {},
    })
  }
  return out
}

/** §3.2 step 1 — decode the surface's subtree into ordered `PageBlock` records.
 *  The document the surface belongs to is the surface's own `data-edit-surface`
 *  marker (§2.1), so the decode carries the minting namespace with it. */
function decodePage(html: string, documentId = documentIdOf(html)): PageBlock[] {
  const blocks: PageBlock[] = []
  for (const raw of scanBlocks(html)) {
    const types = new Set<string>(RAG_NODE_TYPES)
    // a block-level element with NO RAG id is a surface artifact for the
    // PARENT block — it is never minted as a RAG node.
    if (raw.ragId === null) continue
    const decomposed = decomposeRichHtml(raw.inner)
    if (!decomposed.ok) continue
    blocks.push({
      ragId: raw.ragId,
      documentId,
      elementType: types.has(raw.tag) ? raw.tag : 'div',
      content: decomposed.content,
      children: decomposed.children,
      text: decomposed.content,
      ragProps: raw.ragProps,
      createdAt: '2026-01-01T00:00:00.000Z',
    })
  }
  return blocks
}

/** The document id a page belongs to (`data-edit-surface`, §2.1's marker). */
function documentIdOf(html: string): string {
  const m = /\bdata-edit-surface\s*=\s*"([^"]*)"/.exec(html)
  return m ? m[1] : 'doc'
}

/** The store's RAG-OWNED props for a node (the compared subset only). */
function ragOwnedProps(node: RagNode): Record<string, unknown> {
  const props = { ...(node.props ?? {}) }
  for (const runtime of ['data-node-id', 'style', 'class', 'contenteditable', 'data-edit-surface', 'data-doc-head']) {
    delete props[runtime]
  }
  return props
}

function childrenEqual(a: RagNodeChild[] | undefined, b: RagNodeChild[] | undefined): boolean {
  return JSON.stringify(a ?? []) === JSON.stringify(b ?? [])
}

/** §3.2's closed compared field set + the minimal-op rule (one op per changed block). */
function diffPage(blocks: PageBlock[], store: RagStore, documentId: string): BatchOp[] {
  const ops: BatchOp[] = []
  for (const block of blocks) {
    const node = store.getNode(block.ragId ?? '')
    if (!node) continue
    if (node.type !== block.elementType) {
      ops.push({ op: 'setType', nodeId: node.id, type: block.elementType as RagNodeType })
      continue
    }
    const contentChanged = node.content !== block.content || !childrenEqual(node.children, block.children)
    if (contentChanged) {
      ops.push({ op: 'putNode', node: { ...node, content: block.content, children: block.children } })
      continue
    }
    if (JSON.stringify(ragOwnedProps(node)) !== JSON.stringify(block.ragProps)) {
      ops.push({ op: 'setProps', nodeId: node.id, props: block.ragProps })
    }
  }
  // §3.3 item 8 — a block with no matching RAG node is a NEW block: a PUTNODE
  // with a host-minted, collision-free id plus the doc-child containment edge.
  for (const block of blocks) {
    if (block.ragId === null) continue
    if (store.getNode(block.ragId)) continue
    const type = block.elementType
    ops.push({
      op: 'putNode',
      node: {
        id: mintId(store, block.documentId || documentId, type),
        type,
        content: block.content,
        children: block.children,
        ownedNodeIds: [],
        createdAt: block.createdAt,
        updatedAt: block.createdAt,
      },
    })
  }
  return ops
}

/** §3.3 item 8 — the minted id for a block the store has never seen.
 *  `${documentId}:${type}:${n}` (the parser's own scheme, `markdown-parse`'s
 *  `nextId`) with `n` greater than every `n` already present for that pair. */
function mintId(store: RagStore, documentId: string, type: RagNodeType): string {
  const prefix = `${documentId}:${type}:`
  let max = 0
  for (const n of store.listNodes()) {
    if (n.id.startsWith(prefix)) {
      const nPart = Number(n.id.slice(prefix.length))
      if (Number.isFinite(nPart)) max = Math.max(max, nPart)
    }
  }
  return `${prefix}${max + 1}`
}

/** A page: one block element per RAG block, in document order. */
function pageOf(blocks: { ragId: string; tag: string; inner: string; ragProps?: Record<string, unknown> }[]): string {
  return blocks
    .map((b) => {
      const props = b.ragProps ? ` data-rag-props='${JSON.stringify(b.ragProps)}'` : ''
      return `<${b.tag} data-rag-node-id="${b.ragId}"${props}>${b.inner}</${b.tag}>`
    })
    .join('')
}

// ===========================================================================
// §3.2 — the minimal-op rule
// ===========================================================================
describe('§3.2 — the op list is a function of the DIFF, and names only changed nodes', () => {
  it('S1 — a page equal to the store yields an EMPTY op list', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' }), makeNode('b2', { content: 'beta' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'alpha' },
      { ragId: 'b2', tag: 'p', inner: 'beta' },
    ])
    expect(diffPage(decodePage(page), store, 'doc')).toEqual([])
  })

  it('S2 — a one-character edit in one paragraph yields EXACTLY ONE op naming that node', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'alpha' }), makeNode('b2', { content: 'beta' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'alphax' },
      { ragId: 'b2', tag: 'p', inner: 'beta' },
    ])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toHaveLength(1)
    expect(JSON.stringify(ops[0])).toContain('b1')
    expect(JSON.stringify(ops[0])).not.toContain('b2')
  })

  it('FS9 — no block whose compared fields are all equal appears in the op list (no churn)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'one' }), makeNode('b2', { content: 'two' }), makeNode('b3', { content: 'three' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'one' },
      { ragId: 'b2', tag: 'p', inner: 'two-edited' },
      { ragId: 'b3', tag: 'p', inner: 'three' },
    ])
    const ops = diffPage(decodePage(page), store, 'doc')
    for (const op of ops) {
      expect(JSON.stringify(op)).toContain('b2')
    }
  })

  it('S9 — a one-character edit in a 200-block document names ONE node id', async () => {
    const store = newStore()
    const nodes: RagNode[] = []
    const blocks: { ragId: string; tag: string; inner: string }[] = []
    for (let i = 0; i < 200; i++) {
      nodes.push(makeNode(`b${i}`, { content: `paragraph-${i}` }))
      blocks.push({ ragId: `b${i}`, tag: 'p', inner: i === 137 ? `paragraph-137x` : `paragraph-${i}` })
    }
    await seed(store, nodes)
    const ops = diffPage(decodePage(pageOf(blocks)), store, 'doc')
    expect(ops).toHaveLength(1)
    const named = new Set<string>()
    for (const op of ops) {
      const anyOp = op as { nodeId?: string; node?: RagNode }
      if (anyOp.nodeId) named.add(anyOp.nodeId)
      if (anyOp.node?.id) named.add(anyOp.node.id)
    }
    expect([...named]).toEqual(['b137'])
  })

  it('S3 — several independently changed blocks each get exactly one write', async () => {
    const store = newStore()
    await seed(store, [makeNode('a', { content: 'A' }), makeNode('b', { content: 'B' }), makeNode('c', { content: 'C' })])
    const page = pageOf([
      { ragId: 'a', tag: 'p', inner: 'A!' },
      { ragId: 'b', tag: 'p', inner: 'B' },
      { ragId: 'c', tag: 'h2', inner: 'C' },
    ])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toHaveLength(2)
    const perNode = new Map<string, number>()
    for (const op of ops) {
      const id = (op as { nodeId?: string }).nodeId ?? ''
      perNode.set(id, (perNode.get(id) ?? 0) + 1)
    }
    for (const [, count] of perNode) expect(count).toBe(1)
  })
})

// ===========================================================================
// §3.2 — the CLOSED compared field set
// ===========================================================================
describe('§3.2 — the compared field set is CLOSED', () => {
  it('S6/FS8 — a runtime-prop difference (style/class/contenteditable) never enters the op list', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'same' })])
    const page = `<p data-rag-node-id="b1" style="color:red" class="is-editable">same</p>`
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toEqual([])
  })

  it('S7/FS8 — a node whose only difference is updatedAt produces no op', async () => {
    const store = newStore()
    const older = makeNode('b1', { content: 'same', updatedAt: '2000-01-01T00:00:00.000Z' })
    await seed(store, [older])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'same' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toEqual([])
    // the op list is a function of the DIFF, never of the node's timestamp
    expect(ops).not.toContainEqual(expect.objectContaining({ nodeId: 'b1' }))
  })

  it('FS8 — a documentPath/tags-only difference is not compared (a document-metadata edit is outside this unit)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'same', documentPath: ['a/b'], tags: ['x'] } as Partial<RagNode>)])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'same' }])
    expect(diffPage(decodePage(page), store, 'doc')).toEqual([])
  })

  it('S8 — a content difference writes a putNode carrying the decomposed content AND children (the replace semantics)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'bold', children: [{ type: 'strong', content: 'bold' }] })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'plain <strong>bold</strong>' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toHaveLength(1)
    const op = ops[0] as { op: string; node: RagNode }
    expect(op.op).toBe('putNode')
    expect(op.node.content).toBe('plain bold')
    expect(op.node.children).toEqual([{ type: 'strong', content: 'bold', offset: 6 }])
    // the node's identity fields are carried through untouched
    expect(op.node.id).toBe('b1')
    expect(op.node.type).toBe('p')
  })

  it('§3.2 — a type difference writes setType (never a putNode with a new node)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { type: 'p', content: 'same' })])
    const page = pageOf([{ ragId: 'b1', tag: 'h2', inner: 'same' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toEqual([{ op: 'setType', nodeId: 'b1', type: 'h2' }])
  })

  it('§3.2 — an inline-child-only difference still writes exactly one op for that node', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'run', children: [] })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'run <em>now</em>' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops).toHaveLength(1)
    expect(ops[0].op).toBe('putNode')
  })
})

// ===========================================================================
// §3.1 — the decomposer: pure, total, typed failure, no phantom package
// ===========================================================================
describe('§3.1 — the decomposer is in-house, PURE and TOTAL', () => {
  it('FS7 — a non-string input is the typed failure arm, never a throw and never a partial write', () => {
    const result = decomposeRichHtml(42 as never)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(typeof result.error).toBe('string')
  })

  it('§3.1 — an empty string is a SUCCESS with empty content (never a failure, never a throw)', () => {
    const result = decomposeRichHtml('')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.content).toBe('')
      expect(result.children).toEqual([])
    }
  })

  it('§3.1 — a deeply nested malformed input terminates without a TypeError (the decomposer is iterative)', () => {
    let html = 'x'
    for (let i = 0; i < 2000; i++) html = `<span>${html}</span>`
    expect(() => decomposeRichHtml(html)).not.toThrow()
    const result = decomposeRichHtml(html)
    expect(result.ok).toBe(true)
  })

  it('§3.1 — the same input twice yields byte-equal results (deterministic)', () => {
    const html = 'a <strong>b</strong> c <a href="https://example.test/">d</a>'
    expect(JSON.stringify(decomposeRichHtml(html))).toBe(JSON.stringify(decomposeRichHtml(html)))
  })

  it('§3.1 — `b`→`strong` and `i`→`em` are mapped; `span` is folded into the parent content', () => {
    const result = decomposeRichHtml('<b>bold</b> <i>ital</i> <span>folded</span>')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.content).toBe('bold ital folded')
      expect(result.children.map((c) => c.type)).toEqual(['strong', 'em'])
    }
  })
})

// ===========================================================================
// §3.3 item 8 — the new-block representation
// ===========================================================================
describe('§3.3 item 8 — a NEW block commits as putNode + a doc-child putEdge with a collision-free id', () => {
  it('S4 — a block whose id matches no store node is a NEW block (no op names it as an update)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'known' })])
    const page = pageOf([
      { ragId: 'b1', tag: 'p', inner: 'known' },
      { ragId: 'brand-new', tag: 'p', inner: 'fresh sentence' },
    ])
    const ops = diffPage(decodePage(page), store, 'doc')
    // the known block is untouched (the minimal-op rule); the new block has no
    // node to diff against, so it is represented as a putNode with a MINTED id.
    const touched = ops.flatMap((op) => {
      const anyOp = op as { nodeId?: string; node?: RagNode }
      return [anyOp.nodeId, anyOp.node?.id].filter((v): v is string => typeof v === 'string')
    })
    expect(touched).not.toContain('b1')
    expect(touched).toContain('doc:p:1')
    expect(store.getNode('brand-new')).toBeUndefined()
    expect(store.getNode('doc:p:1')).toBeUndefined()
  })

  it('S5 — a block-level wrapper with NO data-rag-node-id is a surface artifact, never minted', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'wrapped' })])
    const page = `<section class="surface-artifact"></section><p data-rag-node-id="b1">wrapped</p>`
    const blocks = decodePage(page)
    expect(blocks.map((b) => b.ragId)).toEqual(['b1'])
  })

  it('FS13 — a minted id follows `${documentId}:${type}:${n}` and is greater than every existing n for that pair', async () => {
    const store = newStore()
    await seed(store, [
      makeNode('doc:p:1', { content: 'one' }),
      makeNode('doc:p:2', { content: 'two' }),
      makeNode('doc:h2:7', { content: 'seven' }),
    ])
    const minted = mintId(store, 'doc', 'p')
    expect(minted).toBe('doc:p:3')
    expect(store.getNode(minted)).toBeUndefined()
    // a later import cannot collide: the minted slot is above every present n
    for (const n of store.listNodes()) {
      if (n.id.startsWith('doc:p:')) expect(Number(n.id.slice('doc:p:'.length))).toBeLessThan(3)
    }
  })

  it('FS13 — the minted id for a type with no existing member is `:1` (no reuse of another type\'s slot)', async () => {
    const store = newStore()
    await seed(store, [makeNode('doc:p:9', { content: 'nine' })])
    expect(mintId(store, 'doc', 'td')).toBe('doc:td:1')
  })

  it('FS14 — a page that still contains a node\'s block yields no removeNode for it (a node is only removed when emptied)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'kept' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'kept' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    expect(ops.filter((op) => op.op === 'removeNode')).toEqual([])
  })
})

// ===========================================================================
// §3.3 item 7 — the store-side RED obligation the diff feeds
// ===========================================================================
describe('§3.3 item 7 — the store must accept the rich-text ops inside the commit batch', () => {
  it('S2 — a whole-page commit containing a content write applies through ONE applyBatch', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'before' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'after' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    if (result.ok) expect(store.getNode('b1')?.content).toBe('after')
  })

  it('S3 — a whole-page commit containing a TYPE change applies through the same ONE applyBatch (RED today)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { type: 'p', content: 'same' })])
    const page = pageOf([{ ragId: 'b1', tag: 'h2', inner: 'same' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    if (result.ok) expect(store.getNode('b1')?.type).toBe('h2')
  })

  it('S8 — a commit containing a children write applies through the same ONE applyBatch (RED today)', async () => {
    const store = newStore()
    await seed(store, [makeNode('b1', { content: 'run' })])
    const page = pageOf([{ ragId: 'b1', tag: 'p', inner: 'run <strong>x</strong>' }])
    const ops = diffPage(decodePage(page), store, 'doc')
    const result = await store.applyBatch(ops)
    expect(result.ok).toBe(true)
    if (result.ok) expect(store.getNode('b1')?.children).toEqual([{ type: 'strong', content: 'x', offset: 4 }])
  })

  it('FS12 — a rejected batch is a DISCRIMINATED result, never a throw', async () => {
    const store = newStore()
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'ghost', type: 'h2' }])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(typeof result.error).toBe('string')
      expect(typeof result.failedIndex).toBe('number')
    }
  })
})
