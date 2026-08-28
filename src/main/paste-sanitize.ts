// src/main/paste-sanitize.ts — Unit S: paste-time sanitization (safe inline
// rich-text from raw pasted HTML) — docs/specs/unit-s-paste-sanitization.md.
//
// A single PURE, node-testable function `sanitizePastedHtml(rawHtml: string)`
// that turns RAW pasted HTML (from a contenteditable paste event) into a SAFE,
// NORMALIZED representation: a sanitized `html` string + a plain-text `content`
// + a `RagNodeChild[]` (the Unit M §5.1 closed union strong/em/a/img). It is
// DETERMINISTIC and TOTAL (never throws for a malformed string input).
//
// No Electron, no DOM — it operates on an HTML string via a small project-local
// tokenizer (no external parser dependency).
import type { RagNodeChild } from './rag-store.js'

/** The result of sanitizing raw pasted HTML. A discriminated result:
 *  `{ ok: true, ... }` on success, `{ ok: false, error }` on the pinned
 *  fail-state. The function is TOTAL — it NEVER throws for a malformed input. */
export type SanitizePasteResult =
  | {
      ok: true
      /** The SANITIZED HTML string — safe, order-preserving, containing ONLY
       *  `strong`/`em`/`a`/`img` + text (no script/iframe/svg/on* / unsafe-URL).
       *  Ready to feed to the `provident-editable@0.1.0` converter. */
      html: string
      /** The plain-text content (text nodes + unwrapped-element text), in
       *  document order. This is the RAG node's `content`. */
      content: string
      /** The normalized inline children (`strong`/`em`/`a`/`img`), in document
       *  order. This is the RAG node's `children` (a valid `RagNodeChild[]`). */
      children: RagNodeChild[]
    }
  | { ok: false; error: string }

// ---- the pinned disallowed-element list (§5.2) ------------------------------
// Tag names are stored lowercased (the tokenizer lowercases all tag names).
const DISALLOWED = new Set<string>([
  'script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base', 'form', 'input',
  'button', 'textarea', 'select', 'option', 'svg', 'math', 'template', 'noscript', 'frame',
  'frameset', 'applet', 'audio', 'video', 'source', 'track', 'canvas', 'map', 'area', 'param',
  'portal', 'dialog', 'details', 'summary', 'marquee', 'blink', 'xmp', 'plaintext', 'listing',
  'keygen', 'command', 'menuitem', 'slot', 'shadow', 'content', 'element', 'custom-element',
  'noembed', 'noframes', 'unknown', 'annotation', 'annotation-xml', 'foreignobject', 'desc', 'title', 'metadata',
  'defs', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text',
  'tspan', 'use', 'image', 'symbol', 'marker', 'clippath', 'mask', 'pattern', 'lineargradient',
  'radialgradient', 'stop', 'filter', 'view', 'switch',
])

// The allowed inline element types (§5.3) — the closed RagNodeChildType union.
const INLINE = new Set<string>(['strong', 'em', 'a', 'img'])

// Raw-text elements whose content may contain `<`/`>` that are not tags. Their
// content is dropped anyway (they are all disallowed), so the tokenizer skips
// straight to the matching close tag.
const RAW_TEXT = new Set<string>([
  'script', 'style', 'textarea', 'title', 'xmp', 'plaintext', 'listing', 'noscript',
  'iframe', 'noembed', 'noframes', 'template',
])

// ---- a minimal DOM-free HTML tokenizer -------------------------------------

interface HtmlText { type: 'text'; text: string }
interface HtmlElement { type: 'element'; tag: string; attrs: Record<string, string>; children: HtmlNode[] }
type HtmlNode = HtmlText | HtmlElement

/** Find the `>` that ends the tag starting at `start` (respecting quotes). */
function findTagEnd(input: string, start: number): number {
  let i = start + 1
  let quote: string | null = null
  while (i < input.length) {
    const c = input[i]
    if (quote) {
      if (c === quote) quote = null
    } else if (c === '"' || c === "'") {
      quote = c
    } else if (c === '>') {
      return i
    }
    i++
  }
  return input.length
}

/** Parse a tag's inner content (after `<`, before `>`) into name + attrs. */
function parseTag(content: string): { tag: string; attrs: Record<string, string>; selfClosing: boolean } {
  const trimmed = content.trim()
  const selfClosing = /\/\s*$/.test(trimmed)
  const nameMatch = trimmed.match(/^[a-zA-Z][a-zA-Z0-9-]*/)
  const tag = nameMatch ? nameMatch[0].toLowerCase() : ''
  const attrs: Record<string, string> = {}
  const attrRe = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g
  let m: RegExpExecArray | null
  while ((m = attrRe.exec(trimmed)) !== null) {
    const key = m[1]
    if (key === tag) continue // the tag name itself
    let value = m[2]
    if (value === undefined) {
      value = ''
    } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    attrs[key.toLowerCase()] = value
  }
  return { tag, attrs, selfClosing }
}

/** Parse an HTML string into a tree of nodes. Lenient — never throws. */
function parseHtml(input: string): HtmlNode[] {
  const root: HtmlNode[] = []
  const stack: HtmlElement[] = []
  let current: HtmlNode[] = root
  let i = 0
  const n = input.length
  // Lowercase ONCE up front so the RAW_TEXT skip (F2) does not re-lowercase the
  // entire input per raw-text element (O(n·m) → O(n)).
  const lower = input.toLowerCase()

  while (i < n) {
    const lt = input.indexOf('<', i)
    if (lt === -1) {
      if (i < n) current.push({ type: 'text', text: input.slice(i) })
      break
    }
    if (lt > i) current.push({ type: 'text', text: input.slice(i, lt) })

    // comment
    if (input.startsWith('<!--', lt)) {
      const end = input.indexOf('-->', lt + 4)
      i = end === -1 ? n : end + 3
      continue
    }
    // doctype / declaration / processing instruction
    if (input[lt + 1] === '!' || input[lt + 1] === '?') {
      const end = input.indexOf('>', lt)
      i = end === -1 ? n : end + 1
      continue
    }
    // closing tag
    if (input[lt + 1] === '/') {
      const gt = input.indexOf('>', lt)
      const tagName = input.slice(lt + 2, gt).trim().split(/[\s/]/)[0].toLowerCase()
      while (stack.length > 0) {
        const top = stack.pop()!
        if (top.tag === tagName) break
      }
      current = stack.length > 0 ? stack[stack.length - 1].children : root
      i = gt === -1 ? n : gt + 1
      continue
    }
    // opening tag
    const gt = findTagEnd(input, lt)
    const tagContent = input.slice(lt + 1, gt)
    const { tag, attrs, selfClosing } = parseTag(tagContent)
    const el: HtmlElement = { type: 'element', tag, attrs, children: [] }
    current.push(el)
    if (RAW_TEXT.has(tag)) {
      // skip the raw content up to the matching close tag (content is dropped)
      const closeTag = '</' + tag
      const closeIdx = lower.indexOf(closeTag, gt + 1)
      if (closeIdx === -1) {
        i = n
      } else {
        const gt2 = input.indexOf('>', closeIdx)
        i = gt2 === -1 ? n : gt2 + 1
      }
      continue
    }
    if (!selfClosing && tag !== '') {
      stack.push(el)
      current = el.children
    }
    i = gt === -1 ? n : gt + 1
  }
  return root
}

// ---- URL safety (§5.4) ------------------------------------------------------

// Named HTML character references that can smuggle scheme-relevant characters
// (letters, `:`, whitespace, `.`, `+`, `-`, `/`, etc.) past a naive scheme
// check. Numeric references (`&#106;`, `&#x6a;`) are decoded generically.
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
 *  the value is validated in its DECODED form (F3). TOTAL — never throws. */
function decodeHtmlRefs(s: string): string {
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);?/g, (m, body: string) => {
    if (body[0] === '#') {
      const hex = body[1] === 'x' || body[1] === 'X'
      const code = parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10)
      if (Number.isNaN(code)) return m
      return String.fromCodePoint(code)
    }
    return NAMED_ENTITIES[body] ?? m
  })
}

/** Normalize a URL for validation: decode HTML character references, then strip
 *  leading C0-control + space characters (the WHATWG URL parser strips these
 *  before scheme parsing, so a leading space/tab/NUL must not defeat the scheme
 *  check — F1). The returned value is the form that is validated AND stored. */
function normalizeUrl(raw: string): string {
  return decodeHtmlRefs(raw).replace(/^[\u0000-\u0020]+/, '')
}

/** True if `url` is safe. `allowDataImage` permits the `data:image/*` carve-out
 *  (for `img` ONLY). The caller MUST pass the already-normalized URL (decoded +
 *  leading C0-control/space stripped). */
function isSafeUrl(url: string, allowDataImage: boolean): boolean {
  // A relative URL (no scheme) is safe.
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return true
  // http: / https:
  if (/^https?:\/\//i.test(url)) return true
  // data:image/* — img only, RESTRICTED to raster MIME types (F2). Script-capable
  // subtypes (svg+xml, html, xml, text) are rejected.
  if (allowDataImage && /^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);/i.test(url)) return true
  return false
}

/** Escape an attribute value for the sanitized HTML output. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// ---- normalization into RagNodeChild[] (§5.3/§5.5) --------------------------

interface Processed {
  content: string
  children: RagNodeChild[]
  html: string
}

/** Merge `r` into `target` in place (document-order concatenation). */
function merge(target: Processed, r: Processed): void {
  target.content += r.content
  target.children = target.children.concat(r.children)
  target.html += r.html
}

/** Compute a single element node's result from its already-processed children
 *  (`inner` = the concatenated result of `node.children`). */
function computeNodeResult(node: HtmlElement, inner: Processed): Processed {
  const tag = node.tag
  // Disallowed element (or the fe* wildcard) → removed ENTIRELY (§5.2).
  if (DISALLOWED.has(tag) || tag.startsWith('fe')) {
    return { content: '', children: [], html: '' }
  }

  // span → folded into the parent (NOT a child type). Its direct text is folded
  // into the parent's content (RICH-TEXT-EDITING-GATE: span is a diff-matching
  // artifact folded into the parent's content); its inline children are hoisted
  // to siblings (§5.3).
  if (tag === 'span') {
    return { content: inner.content, children: inner.children, html: inner.html }
  }

  if (tag === 'strong' || tag === 'em') {
    return {
      content: '',
      children: [{ type: tag, content: inner.content }, ...inner.children],
      html: '<' + tag + '>' + inner.html + '</' + tag + '>',
    }
  }

  if (tag === 'a') {
    const href = node.attrs['href']
    if (href === undefined) {
      // missing href → demoted to plain text (§5.4)
      return { content: inner.content, children: inner.children, html: inner.html }
    }
    const normalizedHref = normalizeUrl(href)
    if (!isSafeUrl(normalizedHref, false)) {
      // unsafe href → demoted to plain text (§5.4)
      return { content: inner.content, children: inner.children, html: inner.html }
    }
    const props: Record<string, unknown> = { href: normalizedHref }
    const title = node.attrs['title']
    if (title !== undefined) props.title = title
    const attrHtml = title !== undefined
      ? ` href="${escapeAttr(normalizedHref)}" title="${escapeAttr(title)}"`
      : ` href="${escapeAttr(normalizedHref)}"`
    return {
      content: '',
      children: [{ type: 'a', content: inner.content, props }, ...inner.children],
      html: '<a' + attrHtml + '>' + inner.html + '</a>',
    }
  }

  if (tag === 'img') {
    const src = node.attrs['src']
    if (src === undefined) {
      // missing src → dropped entirely (§5.4)
      return { content: '', children: [], html: '' }
    }
    const normalizedSrc = normalizeUrl(src)
    if (!isSafeUrl(normalizedSrc, true)) {
      // unsafe src → dropped entirely (§5.4)
      return { content: '', children: [], html: '' }
    }
    const props: Record<string, unknown> = { src: normalizedSrc }
    const alt = node.attrs['alt']
    if (alt !== undefined) props.alt = alt
    const attrHtml = alt !== undefined
      ? ` src="${escapeAttr(normalizedSrc)}" alt="${escapeAttr(alt)}"`
      : ` src="${escapeAttr(normalizedSrc)}"`
    return {
      content: '',
      children: [{ type: 'img', content: '', props }],
      html: '<img' + attrHtml + '>',
    }
  }

  // Any other non-inline, non-disallowed element → unwrapped (§5.5): the tag is
  // dropped, its text + inline children are preserved.
  return { content: inner.content, children: inner.children, html: inner.html }
}

/** A work-stack frame for the iterative traversal (F1). `target` is the
 *  accumulator this node's result is merged into (its parent's accumulator, or
 *  the root accumulator for top-level nodes). `acc` accumulates this element's
 *  children results. */
interface Frame {
  node: HtmlNode
  target: Processed
  expanded: boolean
  acc: Processed
}

/** Process a list of nodes into a single `Processed` result. ITERATIVE (explicit
 *  work stack) — never recurses, so deeply-nested input cannot overflow the call
 *  stack (F1). Preserves document order exactly. */
function processNodes(nodes: HtmlNode[]): Processed {
  const root: Processed = { content: '', children: [], html: '' }
  const stack: Frame[] = []
  for (let k = nodes.length - 1; k >= 0; k--) {
    stack.push({ node: nodes[k], target: root, expanded: false, acc: { content: '', children: [], html: '' } })
  }

  while (stack.length > 0) {
    const frame = stack.pop()!
    const node = frame.node
    if (node.type === 'text') {
      merge(frame.target, { content: node.text, children: [], html: node.text })
      continue
    }
    if (!frame.expanded) {
      // First visit: push the frame back (to finalize after children) and push
      // its children (reversed so they pop in document order).
      frame.expanded = true
      stack.push(frame)
      const kids = node.children
      for (let k = kids.length - 1; k >= 0; k--) {
        stack.push({ node: kids[k], target: frame.acc, expanded: false, acc: { content: '', children: [], html: '' } })
      }
      continue
    }
    // Second visit: all children have been merged into frame.acc.
    merge(frame.target, computeNodeResult(node, frame.acc))
  }
  return root
}

// ---- the public function ----------------------------------------------------

/** Sanitize raw pasted HTML into a safe, normalized representation. PURE,
 *  DETERMINISTIC, TOTAL — never throws for a malformed string input. The ONLY
 *  fail-state is a non-string input. */
export function sanitizePastedHtml(rawHtml: string): SanitizePasteResult {
  if (typeof rawHtml !== 'string') {
    return { ok: false, error: 'sanitizePastedHtml: input must be a string' }
  }
  const nodes = parseHtml(rawHtml)
  const { content, children, html } = processNodes(nodes)
  return { ok: true, html, content, children }
}
