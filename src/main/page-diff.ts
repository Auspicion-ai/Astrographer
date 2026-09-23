// src/main/page-diff.ts — `C9 U-EDIT-1` (§3.1/§3.2/§3.3) THE PAGE DIFF ADAPTER.
//
// `docs/specs/unit-u-edit-1-whole-page-editing.md` §3.1 (as AMENDED by §11
// amendment `11.9` item 1): the decomposer is the ADOPTED package
// `provident-editable@0.2.0` — `htmlToTree` for the decode and `diffTrees` for
// the diff — and the mapping onto C9's closed `BatchOp` op set is THIS module.
// It is the ONLY module in the repo that imports the package: every other
// consumer (the commit seam, the tests) goes through `decodePage` /
// `buildPageOps`. The package supplies the tree and the structural diff; it
// supplies NO RAG op set, no `BatchOp`, no `applyBatch` and no journal
// semantics — those are C9's and live here + in `rag-store.ts`.
//
// PURE: no I/O, no clock, no store access. The snapshot is the document's
// read-only node/edge view (`RagSnapshotPayload`, the `RAG-SNAPSHOT-PRESERVED`
// seam — the adapter adds no `RagStore` member). The same (decoded, snapshot)
// draw yields the same op list (`P-TP-1`).
//
// The closed change-kind -> op mapping (§3.1) this module implements:
//   type difference                -> { op: 'setType', nodeId, type } (one op;
//                                     id/createdAt/children/props/ownedNodeIds
//                                     untouched — `FS6`, the `P-IM-3` row)
//   props difference               -> { op: 'setProps', nodeId, props } with the
//                                     CHANGED RAG-OWNED KEYS only (the store's
//                                     `setProps` MERGES, so `data-doc-head`
//                                     survives — `FS3`)
//   content / run / inline-children -> the block's single `putNode` carrying the
//     difference                      projected `content` AND `children` — ONE op
//                                     for that node (the minimal-op rule, `FS9`)
//   a block with no matching RAG id -> id-minted `putNode` + the `doc-child`
//                                     `putEdge` from the containing section
//                                     (§3.3 item 8; `FS13`)
//   a document block gone from the  -> `removeEdge` for its containment edge +
//     page                            `removeNode` (never a transiently unmounted
//                                     block — `FS14`)
//   anything unmappable / a throw  -> REFUSED, never a silent partial write:
//                                     `{ ok: false, kind: 'decompose-failed' }`
//                                     (the `FS5`/`ST-5` warning class, `FS7`)
//
// The compared field set is CLOSED (§3.2): `type`/`content`/`children`/`props`.
// `documentPath`/`tags` are not compared (a document-metadata edit is
// `edit.set_doc_meta`'s, outside this unit), and the renderer-minted runtime
// props (`contenteditable`, `data-edit-surface`, `data-node-id`, `data-doc-head`,
// `style`, class lists) plus an `updatedAt`-only difference never enter (the
// ADAPTER's own filter — the package's props update carries the FULL object).
//
// The `text`-run semantics (§3.1): the package's `text` leaves carry the runs
// BETWEEN inline children and are flattened into the owning block's `content`
// (never a RAG node, never an `RagNodeChild`, never an op id). The raw package
// `content` is NEVER compared: a block with inline children carries `content: ''`
// under the package's per-node XOR rule, so a raw comparison would emit a
// spurious op on every such block (`FS9`) — the projection builds a block whose
// package-side tree is the run structure the store's own `(content, children)`
// pair denotes.
import { diffTrees, htmlToTree, providentPlainText } from 'provident-editable'
import type { ProvidentNode, ProvidentNodeType, ProvidentTree } from 'provident-editable'
import type { BatchOp, RagEdge, RagNode, RagNodeChild, RagNodeChildType, RagNodeType } from './rag-store.js'

/** The closed `RagNodeType` union, recounted from `src/main/rag-store.ts`
 *  `type RagNodeType` (23 members — §2.4 item 1: the census is a READING of the
 *  union, never a copied literal). A page element whose tag is outside it is
 *  refused (`FS4`'s class). */
const RAG_NODE_TYPES: readonly RagNodeType[] = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
  'pre', 'code', 'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th',
]
const RAG_NODE_TYPE_SET = new Set<string>(RAG_NODE_TYPES)

/** The package's own BLOCK tag set (`provident-editable` `BLOCK_TAGS`). */
const PACKAGE_BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'div'])
/** The page ELEMENT tags this adapter reads as surface-level RAG blocks: the
 *  package's block set + `code` (a `RagNodeType` member the package decodes as
 *  a content-only leaf) + the table CELL tags `td`/`th` (leaf cells — the
 *  cell's own text decodes). */
const PAGE_BLOCK_TAGS = new Set<string>([...PACKAGE_BLOCK_TAGS, 'code', 'td', 'th'])
/** §3.2's RECORDED CAPABILITY GAP — the block-level CONTAINER tags the
 *  package's closed tag set cannot express (`table`/`thead`/`tr` are flattened
 *  into a paragraph by the converter). A page carrying one is REFUSED rather
 *  than retyped, removed or flattened (the `FS14` data-loss case). */
const UNEXPRESSIBLE_BLOCK_TAGS = new Set(['table', 'thead', 'tr'])

/** §3.3 item 8 — the tags a block the user CREATED by typing carries: a
 *  text-bearing block leaf with NO `data-rag-node-id` is a NEW block (the
 *  id-minted `putNode` + its containment edge). A rag-id-less CONTAINER
 *  (`div`/`ul`/`ol`) is a surface artifact instead (§3.2: the mode's rendering
 *  wrapper — it contributes to its parent block's `content`, never a RAG node),
 *  exactly like the `textarea`/`section` artifacts. */
const NEW_BLOCK_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'blockquote', 'pre', 'code', 'td', 'th'])

/** The inline child types a RAG node holds (`src/main/rag-store.ts`
 *  `RAG_NODE_CHILD_TYPES`). */
const RAG_CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])

/** §3.1/§3.2 — the runtime props the renderer mints: NEVER compared, NEVER
 *  written back (a difference that survives this filter is `FS8`). */
const RUNTIME_PROP_KEYS = ['contenteditable', 'data-edit-surface', 'data-node-id', 'data-doc-head', 'style', 'class']

/** The authored markers this adapter reads off the page's HTML. */
const ATTR_RAG_ID = 'data-rag-node-id'
const ATTR_RAG_PROPS = 'data-rag-props'
const ATTR_EDIT_SURFACE = 'data-edit-surface'
const ATTR_ID = 'id'

/** §2.1/§11.7 — the pinned authored id of the ONE page-edit surface ROOT: the
 *  element that carries `data-edit-surface = <documentId>` (`id =
 *  page-edit-surface` + `contenteditable`). The decode reads the document id off
 *  THAT root, never off a marker anywhere else on the page. */
const PAGE_EDIT_SURFACE_ROOT_ID = 'page-edit-surface'

/** The deterministic timestamp a minted block carries (§3.3 item 8: "the
 *  commit's single timestamp"). The adapter takes NO clock argument, so the
 *  timestamp is derived from the snapshot itself — the latest `updatedAt` the
 *  document's own read-only view holds (a pure, deterministic draw). */
const EPOCH = '1970-01-01T00:00:00.000Z'

/** A decoded surface block — the C9 projection of the package's decode (§3.1).
 *  The key set is CLOSED: all six keys are always present. */
export type PageBlock = {
  /** The block element's `data-rag-node-id`. */
  ragId: string
  /** The block element's tag, intersected with `RagNodeType`. */
  elementType: RagNodeType
  /** The run text AROUND the block's inline children (the C9 `content`). */
  content: string
  /** The block's inline children (the projection's inline set). */
  children: RagNodeChild[]
  /** `providentPlainText` of the block's package node — the `FS14` "did the
   *  user empty it?" read and the live battery's text compare; NEVER a compared
   *  field (§3.1/`FS8`). */
  text: string
  /** The block's RAG-OWNED props only (§3.2: `data-rag-props`, minus every
   *  runtime prop). */
  props: Record<string, unknown>
}

/** The typed refusal arm — the `FS5`/`ST-5` warning class (§3.1). It carries no
 *  `blocks` (decode) and no `ops` (op build): a refused page has nothing to
 *  write (`FS7`). */
export type PageRefusal = { ok: false; kind: 'decompose-failed'; message: string }

export type PageDecodeResult =
  | { ok: true; blocks: PageBlock[]; documentId: string }
  | PageRefusal

export type PageOpsResult = { ok: true; ops: BatchOp[] } | PageRefusal

/** The document's READ-ONLY node/edge view (§3.1) — the store's own snapshot
 *  seam (`RagSnapshotPayload`) shape, structurally compatible so the host can
 *  pass its cached snapshot directly. */
export interface PageDiffSnapshot {
  store?: string
  nodes: Array<{
    id: string
    type: string
    content: string
    props?: Record<string, unknown>
    children?: Array<{ type: string; content: string; props?: Record<string, unknown>; offset?: number }>
    ownedNodeIds?: string[]
    createdAt?: string
    updatedAt?: string
  }>
  edges: Array<{ id: string; kind: string; source: string; target: string; order?: number; documentIds?: string[]; createdAt?: string; updatedAt?: string }>
}

type SnapshotNode = PageDiffSnapshot['nodes'][number]

// ---------------------------------------------------------------------------
// the page's HTML scan — the element boundaries + the RAG attributes
//
// The package's converter is attribute-blind (it keeps `href`/`src`/`alt` only),
// so `data-rag-node-id`/`data-rag-props`/`data-edit-surface` are read off the
// page source and paired with the package's decode of the SAME element (each
// block element is decoded from its own fragment, so a surface artifact between
// two blocks can never shift a block's projection — the `textarea` case, §3.2).
// ---------------------------------------------------------------------------

interface ScannedElement {
  tag: string
  attrs: Record<string, string>
  start: number
  /** Exclusive end of the element's outer HTML (the element's close tag, or the
   *  end of input for an unclosed element). */
  end: number
}

/** Parse an element's attribute source into a plain map. Total: a malformed
 *  attribute is skipped, never a throw. */
function parseAttrs(source: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    const value = m[2] ?? m[3] ?? m[4] ?? ''
    attrs[m[1].toLowerCase()] = value
  }
  return attrs
}

/** The exclusive end of the element whose (possibly self-closing) open tag ends
 *  at `from`. An unclosed element runs to the end of the input (the converter
 *  tolerates unclosed HTML — `S12`'s malformed-page shape). Total. */
function findElementEnd(html: string, tag: string, from: number): number {
  const re = new RegExp(`<(/?)${tag}\\b((?:"[^"]*"|'[^']*'|[^>"'])*)>`, 'gi')
  re.lastIndex = from
  let depth = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const selfClosing = /\/\s*$/.test(m[2])
    if (m[1] === '/') {
      if (depth === 0) return m.index + m[0].length
      depth -= 1
      continue
    }
    if (selfClosing) {
      if (depth === 0) return m.index + m[0].length
      continue
    }
    depth += 1
  }
  return html.length
}

/** Every element start tag on the page, in document order, with its attributes
 *  and its outer-HTML span. Total. */
function scanPageElements(html: string): ScannedElement[] {
  const out: ScannedElement[] = []
  const re = /<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase()
    const attrText = m[2]
    const start = m.index
    const openEnd = start + m[0].length
    const selfClosing = /\/\s*$/.test(attrText)
    out.push({
      tag,
      attrs: parseAttrs(attrText),
      start,
      end: selfClosing ? openEnd : findElementEnd(html, tag, openEnd),
    })
    // never rescan the attribute source of the tag just consumed
    re.lastIndex = openEnd
  }
  return out
}

/** The package's own pinned recursion guard (`provident-editable`'s converter
 *  `MAX_DEPTH`): content nested beyond it is DROPPED deterministically by the
 *  converter, so a page beyond it cannot be decoded faithfully. §7's `P-TP-1`
 *  row pins the boundary — the deep draw "must terminate through the adapter's
 *  typed failure arm, never a stack exhaustion" — so the adapter REFUSES a page
 *  that crosses the guard instead of reading a silently truncated tree (the
 *  `FS7` class). */
const PACKAGE_MAX_DEPTH = 512

/** The element tags that never open a nesting level. */
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/** The maximum element-nesting depth inside an HTML fragment (the fragment's
 *  outermost element is depth 1). Linear in the fragment's length; total. */
function maxNestingDepth(fragment: string): number {
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
  let depth = 0
  let max = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(fragment)) !== null) {
    const tag = m[2].toLowerCase()
    if (m[1] === '/') {
      if (depth > 0) depth -= 1
      continue
    }
    if (VOID_TAGS.has(tag) || /\/\s*$/.test(m[3])) continue
    depth += 1
    if (depth > max) max = depth
  }
  return max
}

// ---------------------------------------------------------------------------
// the C9 projection of the package's decode
// ---------------------------------------------------------------------------

/** Collect a block's inline children in document order, with each child's
 *  offset in the block's plain text (`providentPlainText`), advancing the cursor
 *  over every run. A `text` run and a non-inline leaf contribute text only; an
 *  inline child (strong/em/a/img) is recorded whole (its own text is its
 *  `content`). */
function collectInline(nodes: readonly ProvidentNode[], cursor: { i: number }, out: RagNodeChild[]): void {
  for (const node of nodes) {
    if (RAG_CHILD_TYPES.has(node.type)) {
      const text = providentPlainText(node)
      out.push({
        type: node.type as RagNodeChildType,
        content: text,
        ...(node.props !== undefined ? { props: node.props } : {}),
        offset: cursor.i,
      })
      cursor.i += text.length
      continue
    }
    if (Array.isArray(node.children)) {
      collectInline(node.children, cursor, out)
      continue
    }
    cursor.i += typeof node.content === 'string' ? node.content.length : 0
  }
}

/** The C9 `(content, children)` projection of a block's package node (§3.1's
 *  `text`-run semantics): `text` is the plain projection, `children` the inline
 *  set at their plain-text offsets, and `content` the run text AROUND them (the
 *  raw package `content` is never used — a block with inline children carries
 *  `''` there under the XOR rule). */
function projectBlock(node: ProvidentNode): { content: string; children: RagNodeChild[]; text: string } {
  const text = providentPlainText(node)
  const children: RagNodeChild[] = []
  collectInline(Array.isArray(node.children) ? node.children : [], { i: 0 }, children)
  if (children.length === 0) return { content: text, children, text }
  let content = ''
  let cursor = 0
  for (const child of children) {
    const offset = child.offset ?? 0
    if (offset > cursor) content += text.slice(cursor, offset)
    cursor = offset + child.content.length
  }
  if (cursor < text.length) content += text.slice(cursor)
  return { content, children, text }
}

/** The block's RAG-OWNED props: every key except the renderer-minted runtime
 *  props (§3.1/§3.2 — the adapter's own filter). */
function ragOwnedProps(props: Record<string, unknown> | undefined): Record<string, unknown> {
  const owned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props ?? {})) {
    if (RUNTIME_PROP_KEYS.includes(key)) continue
    owned[key] = value
  }
  return owned
}

function refusal(message: string): PageRefusal {
  return { ok: false, kind: 'decompose-failed', message }
}

function describeInput(value: unknown): string {
  if (value === null) return 'null'
  return typeof value
}

/**
 * §3.1 item 1 — `decodePage(html)`: the package's `htmlToTree` decode of the
 * page, projected onto the closed `PageBlock` shape. TOTAL: a non-string input
 * or a package throw is the TYPED refusal arm, never a native throw, and a
 * refused decode carries no `blocks` (`FS7`).
 */
export function decodePage(html: string): PageDecodeResult {
  if (typeof html !== 'string') {
    return refusal(`page decomposer refused: the page html must be a string (received ${describeInput(html)})`)
  }
  let elements: ScannedElement[]
  try {
    elements = scanPageElements(html)
  } catch (err) {
    return refusal(`page decomposer refused: ${(err as Error).message}`)
  }
  let documentId = ''
  for (const element of elements) {
    const marker = element.attrs[ATTR_EDIT_SURFACE]
    if (typeof marker !== 'string' || marker === '') continue
    // §2.1/§11.7 — the SURFACE ROOT is the authority: the page's document id is
    // the root's own marker. A marker on any other element is only a fallback
    // for a page that does not author the root (the §3.2 test-local shape) —
    // never an override of the root's id.
    if (element.attrs[ATTR_ID] === PAGE_EDIT_SURFACE_ROOT_ID) {
      documentId = marker
      break
    }
    if (documentId === '') documentId = marker
  }
  const blocks: PageBlock[] = []
  for (const element of elements) {
    const rawId = element.attrs[ATTR_RAG_ID]
    const ragId = typeof rawId === 'string' ? rawId : ''
    if (ragId === '') {
      // §3.2 — a rag-id-less element is a surface ARTIFACT unless it is a
      // text-bearing block leaf, which is a block the user created (§3.3 item 8)
      if (!NEW_BLOCK_TAGS.has(element.tag)) continue
    } else if (UNEXPRESSIBLE_BLOCK_TAGS.has(element.tag)) {
      return refusal(
        `page decomposer refused: a <${element.tag}> block cannot be expressed by the adopted decomposer` +
          ` (recorded capability gap — a stored ${element.tag} node must not be retyped, removed or flattened)`,
      )
    }
    if (!PAGE_BLOCK_TAGS.has(element.tag) || !RAG_NODE_TYPE_SET.has(element.tag)) {
      return refusal(`page decomposer refused: the block element <${element.tag}> is outside the closed RagNodeType set`)
    }
    let props: Record<string, unknown> = {}
    const rawProps = element.attrs[ATTR_RAG_PROPS]
    if (typeof rawProps === 'string' && rawProps !== '') {
      let parsed: unknown
      try {
        parsed = JSON.parse(rawProps)
      } catch (err) {
        return refusal(`page decomposer refused: ${ATTR_RAG_PROPS} is not valid JSON (${(err as Error).message})`)
      }
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return refusal(`page decomposer refused: ${ATTR_RAG_PROPS} must be a JSON object`)
      }
      props = ragOwnedProps(parsed as Record<string, unknown>)
    }
    let content = ''
    let children: RagNodeChild[] = []
    let text = ''
    const fragment = html.slice(element.start, element.end)
    if (maxNestingDepth(fragment) > PACKAGE_MAX_DEPTH) {
      return refusal(
        `page decomposer refused: <${element.tag}> nests beyond the decomposer's depth guard (${PACKAGE_MAX_DEPTH})` +
          ` — the content past it would be dropped silently`,
      )
    }
    try {
      const tree: ProvidentTree = htmlToTree(fragment)
      const node = Array.isArray(tree.root.children) ? tree.root.children[0] : undefined
      if (node !== undefined) {
        const projected = projectBlock(node)
        content = projected.content
        children = projected.children
        text = projected.text
      }
    } catch (err) {
      return refusal(`page decomposer refused: ${(err as Error).message}`)
    }
    blocks.push({ ragId, elementType: element.tag as RagNodeType, content, children, text, props })
  }
  return { ok: true, blocks, documentId }
}

// ---------------------------------------------------------------------------
// the package-side canonical trees (§3.1: "builds the package-side next tree
// from the decoded page and the prev tree from that snapshot")
// ---------------------------------------------------------------------------

/** The run convention this adapter compares in: `content` is the text AROUND the
 *  inline children and each child's `offset` is a position in that text. A
 *  stored node written under the SPLICE convention (the child's text is a slice
 *  of `content` — `src/main/markdown-parse.ts`'s `appendOuter`) is converted:
 *  the children's slices are excised and their offsets rebased onto the run
 *  text, so an unchanged block compares EQUAL on both conventions (`FS9`). */
function toRunConvention(content: string, children: RagNodeChild[]): { content: string; children: RagNodeChild[] } {
  if (children.length === 0) return { content, children }
  const spliced = children.every((child) => {
    const offset = child.offset ?? 0
    return content.slice(offset, offset + child.content.length) === child.content
  })
  if (!spliced) return { content, children }
  const rebased: RagNodeChild[] = []
  let removed = 0
  for (const child of children) {
    const offset = child.offset ?? 0
    rebased.push({ ...child, offset: offset - removed })
    removed += child.content.length
  }
  let run = ''
  let cursor = 0
  for (const child of children) {
    const offset = child.offset ?? 0
    if (offset > cursor) run += content.slice(cursor, offset)
    cursor = offset + child.content.length
  }
  if (cursor < content.length) run += content.slice(cursor)
  return { content: run, children: rebased }
}

/** A block's package-side node: a leaf carrying the run text, or a container
 *  carrying the run structure (the runs + the inline children) under the
 *  package's per-node XOR rule. One builder for BOTH sides, so equality is
 *  decided by the compared fields alone (`P-TP-1`'s determinism, §3.2's
 *  minimal-op rule).
 *
 *  The whitespace IMMEDIATELY ADJACENT to an inline child is not part of the
 *  block's own text: the page side derives its run text from the package's
 *  `providentPlainText` (so `<p>alpha <strong>bold</strong> tail</p>` projects
 *  `'alpha  tail'` — §3.1's pinned decode, and the live battery's text compare
 *  relies on that exact string), while a stored node's `content` holds the run
 *  text with the child's gap written once (`'alpha tail'`). Both denote the SAME
 *  text, so each run is compared TRIMMED — otherwise every block with an inline
 *  child would emit a spurious op (`FS9`). A block with NO inline children is
 *  compared EXACTLY (its run text is its whole `content`), so a text edit on a
 *  leaf block is never masked. */
function canonicalBlockNode(id: string, type: string, content: string, children: RagNodeChild[], props: Record<string, unknown>): ProvidentNode {
  const run = toRunConvention(content, children)
  const owned = ragOwnedProps(props)
  const hasProps = Object.keys(owned).length > 0
  if (run.children.length === 0) {
    return { id, type: type as ProvidentNodeType, content: run.content, ...(hasProps ? { props: owned } : {}) }
  }
  const kids: ProvidentNode[] = []
  let cursor = 0
  let k = 0
  for (const child of run.children) {
    const offset = Math.max(0, Math.min(child.offset ?? 0, run.content.length))
    if (offset > cursor) {
      const text = run.content.slice(cursor, offset).trim()
      if (text !== '') kids.push({ id: `${id}-r${k++}`, type: 'text', content: text })
    }
    kids.push({
      id: `${id}-c${k++}`,
      type: child.type as ProvidentNodeType,
      content: child.content,
      ...(child.props !== undefined ? { props: child.props } : {}),
    })
    cursor = offset
  }
  if (cursor < run.content.length) {
    const text = run.content.slice(cursor).trim()
    if (text !== '') kids.push({ id: `${id}-r${k++}`, type: 'text', content: text })
  }
  return { id, type: type as ProvidentNodeType, content: '', children: kids, ...(hasProps ? { props: owned } : {}) }
}

const TREE_ROOT_ID = 'page-root'

function treeOf(children: ProvidentNode[]): ProvidentTree {
  return { root: { id: TREE_ROOT_ID, type: 'div', content: '', children } }
}

/** Register every node id of a canonical block subtree against its page index. */
function registerOwner(node: ProvidentNode, index: number, owner: Map<string, number>): void {
  owner.set(node.id, index)
  for (const child of node.children ?? []) registerOwner(child, index, owner)
}

// ---------------------------------------------------------------------------
// the op build (§3.2's minimal-op rule over the diff)
// ---------------------------------------------------------------------------

function snapshotTimestamp(snapshot: PageDiffSnapshot): string {
  let latest = ''
  for (const node of snapshot.nodes ?? []) {
    const at = node?.updatedAt
    if (typeof at === 'string' && at > latest) latest = at
  }
  return latest === '' ? EPOCH : latest
}

/** The document's own data blocks: the targets of its `doc-child` containment
 *  edges, in `order` (`FS14`: only these can be REMOVED — a section or any node
 *  outside the rendered document is never read as a deletion).
 *
 *  The document's MEMBERSHIP is derived the way `src/main/traversal.ts`
 *  `computeDocumentSubgraph` derives it (the traversal's own shared derivation):
 *  the document root + the endpoints of the edges this snapshot SCOPES to the
 *  document (the `documentIds`-carrying doc-flow edges the importer authors),
 *  then the transitive `doc-child` closure from those nodes. The closure is what
 *  makes the removal scan work on the PRODUCTION shape: the importer
 *  (`src/main/markdown-parse.ts` `addDocChild`) and `src/main/edit-ops.ts`
 *  `splitNode` author their `doc-child` edges WITHOUT `documentIds` (adjacency
 *  scopes such a global edge to every document key), so a filter on
 *  `documentIds` alone reads an imported document as block-less and a deletion
 *  is NEVER committed — the block reappears after the re-derive. An
 *  `documentIds`-scoped `doc-child` edge stays a block of the document it names
 *  (the legacy/test-local shape), and an unscoped `doc-child` edge whose SOURCE
 *  is outside the document's closure (another document's section) is NOT one of
 *  this document's blocks: a global `doc-child` edge must never make another
 *  document's blocks deletable here (`FS14`'s data-loss class). */
function documentBlocks(snapshot: PageDiffSnapshot, documentId: string): Array<{ id: string; edge: PageDiffSnapshot['edges'][number] }> {
  const edges = Array.isArray(snapshot.edges) ? snapshot.edges : []
  const scopedToDocument = (edge: PageDiffSnapshot['edges'][number]): boolean =>
    edge.documentIds !== undefined && edge.documentIds.includes(documentId)
  const documentNodeIds = new Set<string>([documentId])
  for (const edge of edges) {
    if (edge == null || edge.kind === 'doc-child' || !scopedToDocument(edge)) continue
    documentNodeIds.add(edge.source)
    documentNodeIds.add(edge.target)
  }
  let changed = true
  while (changed) {
    changed = false
    for (const edge of edges) {
      if (edge == null || edge.kind !== 'doc-child' || !documentNodeIds.has(edge.source)) continue
      if (documentNodeIds.has(edge.target)) continue
      documentNodeIds.add(edge.target)
      changed = true
    }
  }
  return edges
    .filter((edge) => edge != null && edge.kind === 'doc-child' && (scopedToDocument(edge) || documentNodeIds.has(edge.source)))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((edge) => ({ id: edge.target, edge }))
}

/** The containing section a minted block hangs from (§3.3 item 8: a `doc-child`
 *  edge from the containing section, carrying `order` + `documentIds` — the
 *  `parent-child` alternative is unreachable, so it is not minted). */
function containingSection(edges: PageDiffSnapshot['edges'], pageRagIds: Set<string>): string | undefined {
  for (const edge of edges) {
    if (edge == null || edge.kind !== 'doc-child') continue
    if (pageRagIds.has(edge.target)) return edge.source
  }
  for (const edge of edges) {
    if (edge != null && edge.kind === 'doc-child') return edge.source
  }
  return undefined
}

/** §3.3 item 8's minted id: `${documentId}:${type}:${n}` with `n` greater than
 *  every `n` already present for that `(documentId, type)` pair (`FS13` — never
 *  a collision, never another type's slot). */
function mintBlockId(documentId: string, type: string, presentIds: Set<string>, counters: Map<string, number>): string {
  const prefix = `${documentId}:${type}:`
  let next = counters.get(prefix)
  if (next === undefined) {
    next = 0
    for (const id of presentIds) {
      if (!id.startsWith(prefix)) continue
      const tail = id.slice(prefix.length)
      if (/^\d+$/.test(tail)) next = Math.max(next, Number.parseInt(tail, 10))
    }
  }
  next += 1
  counters.set(prefix, next)
  return `${prefix}${next}`
}

/** The snapshot node a `putNode` writes: the snapshot node with the block's
 *  projected `content`/`children` (§3.1's mapping row — one op for the node). */
function updatedNode(store: SnapshotNode, block: PageBlock): RagNode {
  return {
    ...(store as unknown as RagNode),
    content: block.content,
    children: block.children,
  }
}

/** The snapshot node's inline children as RAG children (the snapshot's own
 *  shape is `type: string`): a child outside the closed inline set is dropped —
 *  it is not a `RagNodeChild` and can never be compared as one. */
function snapshotChildren(children: SnapshotNode['children']): RagNodeChild[] {
  const out: RagNodeChild[] = []
  for (const child of children ?? []) {
    if (child == null || typeof child.type !== 'string' || typeof child.content !== 'string') continue
    if (!RAG_CHILD_TYPES.has(child.type)) continue
    out.push({
      type: child.type as RagNodeChildType,
      content: child.content,
      ...(child.props !== undefined ? { props: child.props } : {}),
      ...(typeof child.offset === 'number' ? { offset: child.offset } : {}),
    })
  }
  return out
}

interface BlockPlan {
  index: number
  block: PageBlock
  store?: SnapshotNode
  prevNodeId?: string
  nextNodeId: string
}

/** §3.1/§3.2 — the node ids the snapshot PROVES belong to a document OTHER than
 *  the committing one. The snapshot's own seam payload is the WHOLE store
 *  (`RAG-SNAPSHOT-PRESERVED`), so a foreign document's nodes are IN it: pairing a
 *  page block by `ragId` alone would write another document's node. The evidence
 *  is the snapshot's own:
 *    - every edge whose `documentIds` scope names a different document scopes its
 *      two endpoints to that document (the containment + document-link edges the
 *      traversal/import author);
 *    - the id-prefix convention `${documentId}:` for a document id the snapshot
 *      itself names (`FS13`'s mint scheme).
 *  An id the snapshot cannot corroborate as foreign is NOT foreign: the adapter
 *  never invents an owner from a name alone (a test-local/short-form ragId with
 *  no scoping evidence stays mappable). */
function foreignNodeIds(snapshot: PageDiffSnapshot, documentId: string): Set<string> {
  const edges = Array.isArray(snapshot.edges) ? snapshot.edges : []
  const nodes = Array.isArray(snapshot.nodes) ? snapshot.nodes : []
  const knownDocuments = new Set<string>()
  for (const edge of edges) {
    for (const id of edge?.documentIds ?? []) if (typeof id === 'string' && id !== '') knownDocuments.add(id)
  }
  const foreign = new Set<string>()
  for (const edge of edges) {
    if (edge == null) continue
    const scopes = (edge.documentIds ?? []).filter((id): id is string => typeof id === 'string' && id !== '')
    if (scopes.length === 0 || (scopes.length === 1 && scopes[0] === documentId)) continue
    foreign.add(edge.source)
    foreign.add(edge.target)
  }
  for (const node of nodes) {
    if (node == null || typeof node.id !== 'string') continue
    const cut = node.id.indexOf(':')
    if (cut <= 0) continue
    const prefix = node.id.slice(0, cut)
    if (prefix === documentId || !knownDocuments.has(prefix)) continue
    foreign.add(node.id)
  }
  return foreign
}

/** §3.2's `content` row — does the page's projected run text differ from the
 *  store node's? A block whose TYPE and CONTENT both changed must carry the
 *  content write too (the silent-drop class the F3 row pins), while a TYPE-ONLY
 *  edit leaves `content`/`children` untouched (`FS6`, the `P-IM-3` row): the
 *  compared value is the store field a content write replaces. */
function contentDiffers(store: SnapshotNode, block: PageBlock): boolean {
  return typeof store.content === 'string' ? block.content !== store.content : true
}

function buildOps(blocks: PageBlock[], snapshot: PageDiffSnapshot, documentId: string): PageOpsResult {
  const nodes = Array.isArray(snapshot.nodes) ? snapshot.nodes : []
  const edges = Array.isArray(snapshot.edges) ? snapshot.edges : []
  const storeNodes = new Map<string, SnapshotNode>()
  for (const node of nodes) if (node != null && typeof node.id === 'string') storeNodes.set(node.id, node)
  const timestamp = snapshotTimestamp(snapshot)
  // §3.1/§3.2 — the OWNERSHIP guard: a block naming a node of ANOTHER document is
  // REFUSED (typed, no op list), never mapped onto a write (`FS7`).
  const foreign = foreignNodeIds(snapshot, documentId)

  // ---- the page's blocks, paired with the store's nodes by ragId (§3.3 item 8)
  const plans: BlockPlan[] = []
  const prevNodes: ProvidentNode[] = []
  const nextNodes: ProvidentNode[] = []
  const prevOwner = new Map<string, number>()
  const nextOwner = new Map<string, number>()
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.ragId !== '' && foreign.has(block.ragId)) {
      return refusal(
        `page ops refused: the block ${block.ragId} belongs to another document —` +
          ` a page commits only the nodes of the document it was authored for (${
            documentId === '' ? '(no document scope)' : documentId
          })`,
      )
    }
    const store = storeNodes.get(block.ragId)
    const nextNodeId = `next-${i}`
    nextNodes.push(canonicalBlockNode(nextNodeId, block.elementType, block.content, block.children, block.props))
    registerOwner(nextNodes[nextNodes.length - 1], i, nextOwner)
    let prevNodeId: string | undefined
    if (store !== undefined) {
      prevNodeId = `prev-${i}`
      prevNodes.push(canonicalBlockNode(prevNodeId, store.type, store.content, snapshotChildren(store.children), store.props ?? {}))
      registerOwner(prevNodes[prevNodes.length - 1], i, prevOwner)
    }
    plans.push({ index: i, block, store, prevNodeId, nextNodeId })
  }

  // ---- the package's structural diff (the ONLY change detector, §3.1)
  const diff = diffTrees(treeOf(prevNodes), treeOf(nextNodes))
  const changed = new Set<number>()
  const mark = (index: number | undefined): boolean => {
    if (index === undefined) return false
    changed.add(index)
    return true
  }
  for (const update of diff.nodeChanges.update) {
    const index = prevOwner.get(update.prevId)
    if (index === undefined) {
      return refusal(`page ops refused: the decomposer reported an update outside the page's blocks (${update.prevId})`)
    }
    // an update on the block itself is a content/shape change; an update on one
    // of its nodes (a run/inline child) belongs to the same block
    if (update.content !== undefined || update.type !== undefined) mark(index)
  }
  for (const added of diff.nodeChanges.add) {
    const index = nextOwner.get(added.id)
    if (index === undefined) {
      return refusal(`page ops refused: the decomposer reported an addition outside the page's blocks (${added.id})`)
    }
    // a root-level addition is the block itself: a NEW block (minted below) or a
    // matched block the structural match could not pair — both are a change
    mark(index)
  }
  for (const removed of diff.nodeChanges.remove) {
    const index = prevOwner.get(removed.id)
    if (index === undefined) {
      return refusal(`page ops refused: the decomposer reported a removal outside the page's blocks (${removed.id})`)
    }
    mark(index)
  }
  for (const edge of diff.edgeChanges.add) {
    if (!mark(nextOwner.get(edge.parentId) ?? nextOwner.get(edge.childId))) {
      return refusal(`page ops refused: the decomposer reported an edge addition outside the page's blocks (${edge.parentId})`)
    }
  }
  for (const edge of diff.edgeChanges.remove) {
    if (!mark(prevOwner.get(edge.parentId) ?? prevOwner.get(edge.childId))) {
      return refusal(`page ops refused: the decomposer reported an edge removal outside the page's blocks (${edge.parentId})`)
    }
  }

  // ---- the op list, in document order
  const presentIds = new Set(storeNodes.keys())
  const counters = new Map<string, number>()
  const pageRagIds = new Set(blocks.map((block) => block.ragId))
  const section = containingSection(edges, pageRagIds)
  const ops: BatchOp[] = []
  for (const plan of plans) {
    const block = plan.block
    if (plan.store === undefined) {
      // a NEW block (§3.3 item 8): the id-minted `putNode` + its containment edge
      const id = mintBlockId(documentId, block.elementType, presentIds, counters)
      presentIds.add(id)
      const owned = ragOwnedProps(block.props)
      ops.push({
        op: 'putNode',
        node: {
          id,
          type: block.elementType,
          content: block.content,
          children: block.children,
          ownedNodeIds: [],
          createdAt: timestamp,
          updatedAt: timestamp,
          ...(Object.keys(owned).length > 0 ? { props: owned } : {}),
        },
      })
      if (section !== undefined) {
        ops.push({
          op: 'putEdge',
          edge: {
            id: `e-${section}-${id}`,
            kind: 'doc-child',
            source: section,
            target: id,
            order: plan.index,
            documentIds: [documentId],
            createdAt: timestamp,
            updatedAt: timestamp,
          } as RagEdge,
        })
      }
      continue
    }
    // a TYPE difference is a `setType` with everything else untouched (`FS6`,
    // `P-IM-3`) — EXCEPT when the block's CONTENT changed too: the type-only
    // `continue` silently dropped the user's text (the `FS19`-class data loss the
    // §11.9-remanded row pins), so a simultaneous type+content edit carries the
    // content/children write AND the type write in the ONE op list (the batch is
    // applied in order, so the `putNode` first — with the store's own type — and
    // the `setType` last leaves the new type with the new run text, identity,
    // `createdAt`, props and edges untouched).
    if (plan.store.type !== block.elementType) {
      if (contentDiffers(plan.store, block)) ops.push({ op: 'putNode', node: updatedNode(plan.store, block) })
      ops.push({ op: 'setType', nodeId: block.ragId, type: block.elementType })
      continue
    }
    // a PROPS difference sends the changed RAG-OWNED keys only (the store MERGES)
    const owned = ragOwnedProps(plan.store.props)
    const delta: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(ragOwnedProps(block.props))) {
      if (JSON.stringify(value) !== JSON.stringify(owned[key])) delta[key] = value
    }
    if (Object.keys(delta).length > 0) {
      ops.push({ op: 'setProps', nodeId: block.ragId, props: delta })
      continue
    }
    // a content / run / inline-children difference is ONE `putNode` (minimal-op)
    if (changed.has(plan.index)) {
      ops.push({ op: 'putNode', node: updatedNode(plan.store, block) })
    }
  }

  // ---- removals: a document block the page no longer renders (§3.3 item 8)
  for (const gone of documentBlocks(snapshot, documentId)) {
    if (pageRagIds.has(gone.id)) continue
    ops.push({ op: 'removeEdge', id: gone.edge.id })
    ops.push({ op: 'removeNode', id: gone.id })
  }
  return { ok: true, ops }
}

/**
 * §3.1 item 2 — `buildPageOps(decoded, snapshot, documentId)`: the package's
 * `diffTrees` over the page's decoded blocks and the snapshot's document
 * blocks, mapped onto the closed `BatchOp` set. Pure and deterministic; an
 * unmappable change or a package throw is the TYPED refusal arm with the store
 * untouched (`FS7`).
 */
export function buildPageOps(decoded: PageDecodeResult, snapshot: PageDiffSnapshot, documentId: string): PageOpsResult {
  if (!decoded.ok) return refusal(decoded.message)
  // §3.1/§3.6 — the page's OWN surface marker must agree with the committing
  // document: a page authored for another document is REFUSED (typed, with no op
  // list), never written into the committing document's store (`FS7`).
  if (decoded.documentId !== '' && decoded.documentId !== documentId) {
    return refusal(
      `page ops refused: the page's edit surface names ${decoded.documentId} but the commit is scoped to` +
        ` ${documentId === '' ? '(no document scope)' : documentId} — a foreign page is never written`,
    )
  }
  try {
    return buildOps(decoded.blocks, snapshot, documentId)
  } catch (err) {
    return refusal(`page ops refused: ${(err as Error).message}`)
  }
}
