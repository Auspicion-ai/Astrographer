// src/main/markdown-parse.ts — Unit T: the PURE markdown→RAG-node parser
// (docs/specs/unit-t-markdown-import.md §5.1/§5.2/§5.3). Mirrors the
// `sanitizePastedHtml` PURE-module pattern (src/main/paste-sanitize.ts — Unit S
// §5.1). It operates on a markdown string + a `documentId` and produces RAG
// nodes/edges. PURE (no Electron, no file I/O, no global state), DETERMINISTIC,
// and TOTAL (never throws on malformed markdown — the ONLY throw is a caller
// error: a non-string markdown or an empty documentId).
//
// Implements the parser grammar (§5.2), the importer's deterministic
// heading→section chunking rule (R1–R9), the inline-children parse (§5.3), the
// table rule (the additive table/thead/tr/td/th types), the URL-safety rules
// (§5.4 — inherited from Unit S), the raw-HTML drop (A8), the `data-doc-head`
// marker prop on the first section (R7), the deterministic node id scheme
// (R1a), and the `ownedNodeIds` population (R9).
import type { RagNode, RagEdge, RagNodeChild, RagNodeType } from './rag-store.js'

/** The parsed output of one markdown document: the RAG nodes + edges that
 *  represent it, plus the documentId they belong to. */
export interface ParsedMarkdown {
  /** The documentId (the document root node's id; the doc-flow edges' owner). */
  documentId: string
  /** The RAG nodes: the synthetic document root + the section nodes + the
   *  doc-child block nodes. */
  nodes: RagNode[]
  /** The RAG edges: the doc-flow edges (doc-head/next-section/doc-end) + the
   *  parent-child edges + the doc-child edges. */
  edges: RagEdge[]
}

// A fixed deterministic timestamp (A10 — the parser is DETERMINISTIC; the same
// markdown + documentId ALWAYS produces the same ParsedMarkdown, so the
// createdAt/updatedAt must not depend on the wall clock).
const FIXED_TIME = '1970-01-01T00:00:00.000Z'

// Depth caps — prevent a stack overflow (RangeError) on deeply nested
// blockquotes / inline elements, which would violate the TOTAL contract
// (A1: never throws on malformed markdown).
const MAX_BLOCK_DEPTH = 100
const MAX_INLINE_DEPTH = 100

// ---- URL safety (§5.4 — inherited from Unit S) ------------------------------

// Named HTML character references that can smuggle scheme-relevant characters
// past a naive scheme check (mirrors paste-sanitize.ts).
const NAMED_ENTITIES: Record<string, string> = {
  'amp': '&', 'lt': '<', 'gt': '>', 'quot': '"', 'apos': "'",
  'colon': ':', 'semi': ';', 'sol': '/', 'period': '.', 'plus': '+',
  'minus': '-', 'num': '#', 'quest': '?', 'equals': '=', 'commat': '@',
  'excl': '!', 'dollar': '$', 'percnt': '%', 'ast': '*', 'lpar': '(',
  'rpar': ')', 'lowbar': '_', 'vert': '|', 'verbar': '|', 'bsol': '\\',
  'grave': '`', 'tilde': '~', 'circ': '^', 'lbrace': '{', 'rbrace': '}',
  'lbrack': '[', 'rbrack': ']', 'comma': ',', 'nbsp': ' ', 'Tab': '\t',
  'NewLine': '\n',
}

/** Decode HTML character references (numeric + a curated named set) in a URL so
 *  the value is validated in its DECODED form (Unit S URL-F3). TOTAL. */
function decodeHtmlRefs(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);?/g, (m, body: string) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10)
      if (Number.isNaN(code)) return m
      // Guard the code point upper bound — String.fromCodePoint throws a
      // RangeError for values > 0x10FFFF (violates the TOTAL contract).
      if (code > 0x10ffff) return m
      return String.fromCodePoint(code)
    }
    return NAMED_ENTITIES[body] ?? m
  })
}

/** Normalize a URL for validation: decode HTML character references, then strip
 *  leading C0-control + space characters (Unit S URL-F1). */
function normalizeUrl(raw: string): string {
  return decodeHtmlRefs(raw).replace(/^[\u0000-\u0020]+/, '')
}

/** True if `url` is safe. `allowDataImage` permits the `data:image/*` carve-out
 *  (for `img` ONLY). The caller MUST pass the already-normalized URL. */
function isSafeUrl(url: string, allowDataImage: boolean): boolean {
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return true
  if (/^https?:\/\//i.test(url)) return true
  if (allowDataImage && /^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);/i.test(url)) return true
  return false
}

// ---- block grammar (§5.2) ---------------------------------------------------

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'blockquote'; inner: Block[] }
  | { type: 'code'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'hr' }
  | { type: 'html' }

/** Split a GFM pipe-table row into its cells (trimmed, empties dropped). */
function parseTableRow(line: string): string[] {
  return line
    .split('|')
    .map((c) => c.trim())
    .filter((c) => c !== '')
}

/** Parse a markdown string into a list of blocks. TOTAL — never throws. */
function parseBlocks(markdown: string, depth = 0): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (trimmed === '') { i++; continue }

    // fenced code block
    if (/^`{3,}/.test(trimmed)) {
      const fence = (trimmed.match(/^(`{3,})/) ?? ['', '```'])[1]
      const codeLines: string[] = []
      i++
      while (i < lines.length) {
        if (lines[i].trim().startsWith(fence)) { i++; break }
        codeLines.push(lines[i])
        i++
      }
      blocks.push({ type: 'code', text: codeLines.join('\n') })
      continue
    }

    // ATX heading
    const atx = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (atx) {
      blocks.push({ type: 'heading', level: atx[1].length, text: atx[2] })
      i++
      continue
    }

    // setext heading (current line is text, next line is === or ---)
    if (i + 1 < lines.length) {
      const next = lines[i + 1].trim()
      if (/^=+$/.test(next)) {
        blocks.push({ type: 'heading', level: 1, text: trimmed })
        i += 2
        continue
      }
      if (/^-+$/.test(next)) {
        blocks.push({ type: 'heading', level: 2, text: trimmed })
        i += 2
        continue
      }
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const innerLines: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        innerLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      // Depth cap — a blockquote nested beyond MAX_BLOCK_DEPTH is flattened to
      // a paragraph (prevents a stack overflow on deeply nested `> > > … > x`,
      // which would violate the TOTAL contract).
      if (depth >= MAX_BLOCK_DEPTH) {
        blocks.push({ type: 'paragraph', text: innerLines.join('\n') })
      } else {
        blocks.push({ type: 'blockquote', inner: parseBlocks(innerLines.join('\n'), depth + 1) })
      }
      continue
    }

    // list
    const listMatch = trimmed.match(/^([-*+]|\d+[.)])\s+(.*)$/)
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1])
      const items: string[] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        const m = t.match(/^([-*+]|\d+[.)])\s+(.*)$/)
        if (m && /^\d/.test(m[1]) === ordered) {
          items.push(m[2])
          i++
        } else if (t === '') {
          break
        } else {
          break
        }
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    // GFM pipe table (header row + separator row)
    if (trimmed.includes('|') && i + 1 < lines.length) {
      const sep = lines[i + 1].trim()
      if (/^\|?[\s:|-]+\|?$/.test(sep) && sep.includes('-')) {
        const header = parseTableRow(trimmed)
        const rows: string[][] = []
        i += 2
        while (i < lines.length && lines[i].trim().includes('|')) {
          rows.push(parseTableRow(lines[i].trim()))
          i++
        }
        blocks.push({ type: 'table', header, rows })
        continue
      }
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // raw HTML block — dropped entirely (element + content, A8)
    if (/^</.test(trimmed)) {
      // skip the whole element (and its content) up to the matching close tag
      const tagName = trimmed.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/)?.[1]?.toLowerCase() ?? ''
      i++
      if (tagName !== '' && !/\/>$/.test(trimmed)) {
        const closeTag = `</${tagName}`
        while (i < lines.length) {
          if (lines[i].toLowerCase().includes(closeTag)) { i++; break }
          i++
        }
      }
      blocks.push({ type: 'html' })
      continue
    }

    // paragraph: accumulate until a blank line or a block-start
    const paraLines: string[] = [trimmed]
    i++
    while (i < lines.length) {
      const t = lines[i].trim()
      if (t === '') break
      if (/^(#{1,6})\s/.test(t)) break
      if (/^`{3,}/.test(t)) break
      if (/^>\s?/.test(lines[i])) break
      if (/^([-*+]|\d+[.)])\s/.test(t)) break
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) break
      if (/^</.test(t)) break
      if (i + 1 < lines.length && (/^=+$/.test(lines[i + 1].trim()) || /^-+$/.test(lines[i + 1].trim()))) break
      paraLines.push(t)
      i++
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') })
  }
  return blocks
}

// ---- inline-children parse (§5.3) -------------------------------------------

/** Find the index of the `]` that closes the `[` at `open` (no nesting). */
function findClosingBracket(text: string, open: number): number {
  return text.indexOf(']', open + 1)
}

/** Find the index of the `)` that closes the `(` at `open` (no nesting). */
function findClosingParen(text: string, open: number): number {
  return text.indexOf(')', open + 1)
}

/** Parse inline markdown into a node's `content` (plain text) + `children`
 *  (the strong/em/a/img RagNodeChild[]). Nested inline is FLATTENED to siblings
 *  (the Unit S §5.5 discipline). Inline code is folded into the content. Raw
 *  HTML is dropped entirely (A8). TOTAL — never throws. */
function parseInline(text: string, depth = 0): { content: string; children: RagNodeChild[] } {
  const content: string[] = []
  const children: RagNodeChild[] = []
  let i = 0
  const n = text.length
  // Depth cap — a deeply nested inline (e.g. `**…**` / `*…*` / `[a[b](c)](d)`
  // thousands of levels deep) would overflow the stack; beyond the cap the
  // inner content is treated as plain text (prevents a RangeError, which would
  // violate the TOTAL contract).
  const recurse = (s: string): { content: string; children: RagNodeChild[] } =>
    depth >= MAX_INLINE_DEPTH ? { content: s, children: [] } : parseInline(s, depth + 1)
  while (i < n) {
    // image ![alt](src)
    if (text[i] === '!' && text[i + 1] === '[') {
      const close = findClosingBracket(text, i + 1)
      if (close !== -1 && text[close + 1] === '(') {
        const parenEnd = findClosingParen(text, close + 1)
        if (parenEnd !== -1) {
          const alt = text.slice(i + 2, close)
          const src = text.slice(close + 2, parenEnd)
          const normalized = normalizeUrl(src)
          if (isSafeUrl(normalized, true)) {
            children.push({ type: 'img', content: '', props: { src: normalized, alt } })
          }
          // unsafe/missing src → dropped entirely (A7)
          i = parenEnd + 1
          continue
        }
      }
    }
    // link [text](href)
    if (text[i] === '[') {
      const close = findClosingBracket(text, i)
      if (close !== -1 && text[close + 1] === '(') {
        const parenEnd = findClosingParen(text, close + 1)
        if (parenEnd !== -1) {
          const linkText = text.slice(i + 1, close)
          const href = text.slice(close + 2, parenEnd)
          const normalized = normalizeUrl(href)
          if (isSafeUrl(normalized, false)) {
            const inner = recurse(linkText)
            children.push({ type: 'a', content: inner.content, props: { href: normalized } })
            // flatten nested inline to siblings (Unit S §5.5)
            children.push(...inner.children)
          } else {
            // unsafe href → demoted to plain text (A7)
            content.push(linkText)
          }
          i = parenEnd + 1
          continue
        }
      }
    }
    // strong **text** / __text__
    if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
      const marker = text[i]
      const close = text.indexOf(marker + marker, i + 2)
      if (close !== -1) {
        const inner = recurse(text.slice(i + 2, close))
        children.push({ type: 'strong', content: inner.content })
        children.push(...inner.children)
        i = close + 2
        continue
      }
    }
    // em *text* / _text_
    if (text[i] === '*' || text[i] === '_') {
      const marker = text[i]
      const close = text.indexOf(marker, i + 1)
      if (close !== -1) {
        const inner = recurse(text.slice(i + 1, close))
        children.push({ type: 'em', content: inner.content })
        children.push(...inner.children)
        i = close + 1
        continue
      }
    }
    // inline code `code` — folded into the content (backticks stripped)
    if (text[i] === '`') {
      const close = text.indexOf('`', i + 1)
      if (close !== -1) {
        content.push(text.slice(i + 1, close))
        i = close + 1
        continue
      }
    }
    // raw HTML inline — dropped entirely (element + content, A8)
    if (text[i] === '<') {
      const gt = text.indexOf('>', i)
      if (gt !== -1) {
        const tagContent = text.slice(i + 1, gt)
        const tagName = tagContent.trim().match(/^[a-zA-Z][a-zA-Z0-9-]*/)?.[0]?.toLowerCase() ?? ''
        if (tagName !== '' && !tagContent.trim().startsWith('/') && !/\/\s*$/.test(tagContent)) {
          const closeTag = `</${tagName}`
          const closeIdx = text.toLowerCase().indexOf(closeTag, gt + 1)
          if (closeIdx !== -1) {
            const gt2 = text.indexOf('>', closeIdx)
            i = gt2 === -1 ? n : gt2 + 1
            continue
          }
          // Unclosed inline element — drop the content through end-of-input
          // (A8: the element AND its content are dropped entirely).
          i = n
          continue
        }
        i = gt + 1
        continue
      }
    }
    // plain text
    content.push(text[i])
    i++
  }
  return { content: content.join(''), children }
}

// ---- document construction (R1–R9) -------------------------------------------

/** Build the RAG nodes + edges for one document. DETERMINISTIC + TOTAL. */
function buildDocument(markdown: string, documentId: string): ParsedMarkdown {
  const blocks = parseBlocks(markdown)
  const nodes: RagNode[] = []
  const edges: RagEdge[] = []
  const counters = new Map<string, number>()
  let edgeCounter = 0

  const nextId = (type: string): string => {
    const n = (counters.get(type) ?? 0) + 1
    counters.set(type, n)
    return `${documentId}:${type}:${n}`
  }
  const nextEdgeId = (): string => {
    edgeCounter++
    return `e-${documentId}-${edgeCounter}`
  }
  const makeNode = (id: string, type: RagNodeType, content: string, extra: Partial<RagNode> = {}): RagNode => ({
    id,
    type,
    content,
    ownedNodeIds: [],
    createdAt: FIXED_TIME,
    updatedAt: FIXED_TIME,
    ...extra,
  })
  const addDocChild = (parentId: string, childId: string, order: number): void => {
    edges.push({ id: nextEdgeId(), kind: 'doc-child', source: parentId, target: childId, order, createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
    edges.push({ id: nextEdgeId(), kind: 'parent-child', source: parentId, target: childId, createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
  }

  // Process one block into a node subtree under `parentId`. Returns the block's
  // root node id, or '' if the block is dropped (hr/html). `order` is the
  // doc-child order within the parent.
  const processBlock = (block: Block, parentId: string, order: number): string => {
    switch (block.type) {
      case 'paragraph': {
        const id = nextId('p')
        const { content, children } = parseInline(block.text)
        nodes.push(makeNode(id, 'p', content, children.length > 0 ? { children } : {}))
        addDocChild(parentId, id, order)
        return id
      }
      case 'list': {
        const id = nextId(block.ordered ? 'ol' : 'ul')
        nodes.push(makeNode(id, block.ordered ? 'ol' : 'ul', ''))
        addDocChild(parentId, id, order)
        block.items.forEach((item, liOrder) => {
          const liId = nextId('li')
          const { content, children } = parseInline(item)
          nodes.push(makeNode(liId, 'li', content, children.length > 0 ? { children } : {}))
          addDocChild(id, liId, liOrder)
        })
        return id
      }
      case 'blockquote': {
        const id = nextId('blockquote')
        nodes.push(makeNode(id, 'blockquote', ''))
        addDocChild(parentId, id, order)
        let innerOrder = 0
        for (const inner of block.inner) {
          if (processBlock(inner, id, innerOrder) !== '') innerOrder++
        }
        return id
      }
      case 'code': {
        const id = nextId('pre')
        nodes.push(makeNode(id, 'pre', block.text))
        addDocChild(parentId, id, order)
        return id
      }
      case 'table': {
        const id = nextId('table')
        nodes.push(makeNode(id, 'table', ''))
        addDocChild(parentId, id, order)
        // thead from the header row
        const theadId = nextId('thead')
        nodes.push(makeNode(theadId, 'thead', ''))
        addDocChild(id, theadId, 0)
        block.header.forEach((cell, cellOrder) => {
          const thId = nextId('th')
          const { content, children } = parseInline(cell)
          nodes.push(makeNode(thId, 'th', content, children.length > 0 ? { children } : {}))
          addDocChild(theadId, thId, cellOrder)
        })
        // body rows → tr doc-children of the table
        block.rows.forEach((row, rowOrder) => {
          const trId = nextId('tr')
          nodes.push(makeNode(trId, 'tr', ''))
          addDocChild(id, trId, rowOrder + 1)
          row.forEach((cell, cellOrder) => {
            const tdId = nextId('td')
            const { content, children } = parseInline(cell)
            nodes.push(makeNode(tdId, 'td', content, children.length > 0 ? { children } : {}))
            addDocChild(trId, tdId, cellOrder)
          })
        })
        return id
      }
      case 'hr':
      case 'html':
        return '' // dropped — no node
      default:
        return '' // any other block type is dropped (no node)
    }
  }

  // Split the blocks into the preamble + sections (each heading starts a new
  // section; a section's body = the blocks until the next heading).
  const sections: { level: number; text: string; body: Block[] }[] = []
  const preamble: Block[] = []
  let current: { level: number; text: string; body: Block[] } | null = null
  for (const block of blocks) {
    if (block.type === 'heading') {
      if (current) sections.push(current)
      current = { level: block.level, text: block.text, body: [] }
    } else if (current) {
      current.body.push(block)
    } else {
      preamble.push(block)
    }
  }
  if (current) sections.push(current)

  // The synthetic document root (STRUCTURAL-ROOT div).
  const root = makeNode(documentId, 'div', '')
  nodes.push(root)

  // Build the section nodes.
  const sectionIds: string[] = []
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s]
    const id = `${documentId}:section:${s + 1}`
    sectionIds.push(id)
    const { content, children } = parseInline(sec.text)
    const props = s === 0 ? { 'data-doc-head': true } : undefined
    nodes.push(makeNode(id, `h${sec.level}` as RagNodeType, content, {
      ...(children.length > 0 ? { children } : {}),
      ...(props ? { props } : {}),
    }))
  }

  // R9 — the document root owns the section node ids (its family children).
  root.ownedNodeIds = [...sectionIds]

  // Process the preamble blocks as doc-children of the root.
  let preambleOrder = 0
  for (const block of preamble) {
    if (processBlock(block, documentId, preambleOrder) !== '') preambleOrder++
  }

  // Process each section's body blocks as doc-children of the section.
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s]
    const secId = sectionIds[s]
    let bodyOrder = 0
    for (const block of sec.body) {
      if (processBlock(block, secId, bodyOrder) !== '') bodyOrder++
    }
  }

  // R8 — the document root is the family parent of the first section.
  if (sectionIds.length > 0) {
    edges.push({ id: nextEdgeId(), kind: 'parent-child', source: documentId, target: sectionIds[0], createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
  }

  // R7 — the doc-flow edges (doc-head/next-section/doc-end), each with
  // documentIds: [<documentId>].
  if (sectionIds.length > 0) {
    edges.push({ id: nextEdgeId(), kind: 'doc-head', source: sectionIds[0], target: documentId, documentIds: [documentId], createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
    edges.push({ id: nextEdgeId(), kind: 'doc-end', source: sectionIds[sectionIds.length - 1], target: documentId, documentIds: [documentId], createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
    for (let s = 0; s < sectionIds.length - 1; s++) {
      edges.push({ id: nextEdgeId(), kind: 'next-section', source: sectionIds[s], target: sectionIds[s + 1], documentIds: [documentId], createdAt: FIXED_TIME, updatedAt: FIXED_TIME })
    }
  }

  return { documentId, nodes, edges }
}

/** Parse one markdown document into RAG nodes + edges per the parser grammar
 *  (§5.2) + the chunking rule (§5.2) + the inline-children parse (§5.3). PURE,
 *  DETERMINISTIC, TOTAL (never throws on malformed markdown). The ONLY throw is
 *  a caller error: a non-string `markdown` or a non-non-empty-string
 *  `documentId` → throws `Error('markdown parse: markdown/documentId required')`. */
export function parseMarkdown(markdown: string, documentId: string): ParsedMarkdown {
  if (typeof markdown !== 'string' || typeof documentId !== 'string' || documentId === '') {
    throw new Error('markdown parse: markdown/documentId required')
  }
  return buildDocument(markdown, documentId)
}
