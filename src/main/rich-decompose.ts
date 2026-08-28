// src/main/rich-decompose.ts — Unit U2: contenteditable-blur HTML →
// `RagNodeChild[]` decomposition (pure) — docs/specs/unit-u2-rich-decompose.md.
//
// A single PURE, node-testable function `decomposeRichHtml(rawHtml: string)`
// that turns a contenteditable root's `innerHTML` (browser-authored rich text)
// back into the RAG store's `{ content, children }` model — the plain-text
// `content` + the inline `RagNodeChild[]` `children` — so the host can write it
// back via the combined `setRichText` edit op after blur (Unit U5).
//
// It is DETERMINISTIC and TOTAL (never throws for a malformed string input). It
// REUSES the paste-sanitizer's tokenizer + URL-safety helpers, exported
// ADDITIVELY from `src/main/paste-sanitize.ts` with NO behavior change to
// `sanitizePastedHtml` (the pinned Unit S suite stays green).
//
// No Electron, no DOM, no network — it operates on an HTML string.
import type { RagNodeChild } from './rag-store.js'
import { parseHtml, normalizeUrl, isSafeUrl, type HtmlNode, type HtmlElement } from './paste-sanitize.js'

/** The result of decomposing a contenteditable root's innerHTML. A
 *  discriminated result: `{ ok: true, ... }` on success, `{ ok: false, error }`
 *  on the pinned fail-state. The function is TOTAL — it NEVER throws for a
 *  malformed string input. */
export type DecomposeRichResult =
  | {
      ok: true
      /** The node's plain-text `content` (the root's own text + the text of
       *  unwrapped elements + text BETWEEN inline children), in document order,
       *  concatenated. Written back as the RAG node's `content`. */
      content: string
      /** The inline rich-text children (`strong`/`em`/`a`/`img`), in document
       *  order. Written back as the RAG node's `children` — a valid
       *  `RagNodeChild[]` that passes `validateNodeShape` / `isValidChildren`. */
      children: RagNodeChild[]
    }
  | { ok: false; error: string }

// ---- the element policy (§1.4) ---------------------------------------------
// The CLOSED child-producing set (every member emits one `RagNodeChild`):
// `strong`/`em`/`a`/`img` (as-is) + `b`→`strong` + `i`→`em` (mapped, §1.6).
// Every other element (`u`/`font`/`span`/`div`/`br` + anything outside the
// accepted set) is UNWRAPPED to its text (§1.7).

// ---- normalization into RagNodeChild[] (§1.6/§1.7) -------------------------

interface Processed {
  content: string
  children: RagNodeChild[]
}

/** Merge `r` into `target` in place (document-order concatenation). */
function merge(target: Processed, r: Processed): void {
  target.content += r.content
  target.children = target.children.concat(r.children)
}

/** Compute a single element node's result from its already-processed children
 *  (`inner` = the concatenated result of `node.children`). */
function computeNodeResult(node: HtmlElement, inner: Processed): Processed {
  const tag = node.tag

  // Child-producing elements (§1.6). The nested-inline flattening rule (§1.7):
  // the outer child's content is its own text + the text of nested unwrapped /
  // outside elements (`inner.content`), and nested child-producing descendants
  // are hoisted to SIBLINGS after the outer child (`inner.children`).
  if (tag === 'strong' || tag === 'b') {
    return { content: '', children: [{ type: 'strong', content: inner.content }, ...inner.children] }
  }
  if (tag === 'em' || tag === 'i') {
    return { content: '', children: [{ type: 'em', content: inner.content }, ...inner.children] }
  }

  if (tag === 'a') {
    const href = node.attrs['href']
    if (href === undefined) {
      // missing href → DEMOTED to plain text (§1.6)
      return { content: inner.content, children: inner.children }
    }
    const normalizedHref = normalizeUrl(href)
    if (!isSafeUrl(normalizedHref, false)) {
      // unsafe href → DEMOTED to plain text (§1.6). `data:` is NEVER allowed
      // on `a`, even raster `data:image/*` (§1.5).
      return { content: inner.content, children: inner.children }
    }
    // `a` keeps ONLY `href` (required, normalized) + `title` (optional, raw) —
    // all other attributes (incl. on* / dangerous keys) are never read.
    const props: Record<string, unknown> = { href: normalizedHref }
    const title = node.attrs['title']
    if (title !== undefined) props.title = title
    return { content: '', children: [{ type: 'a', content: inner.content, props }, ...inner.children] }
  }

  if (tag === 'img') {
    const src = node.attrs['src']
    // `img` is a VOID element in the rich-text child model: it emits an `img`
    // child with `content: ''`. Because the SHARED tokenizer treats `img` as a
    // CONTAINER (additive-only — a following text run becomes `img`'s child),
    // any text the tokenizer attached to the `img` node (`inner.content`) is
    // RECOVERED into the parent's `content` rather than dropped — so
    // `'Hello <img src="x"> world'` keeps `' world'` (adversarial F2; mirrors
    // the `br` unwrap behavior). When `img` is dropped (missing/unsafe src) its
    // attached text is STILL recovered into the parent content.
    if (src === undefined) {
      // missing src → the `img` is DROPPED entirely (§1.6); its attached text survives.
      return { content: inner.content, children: [] }
    }
    const normalizedSrc = normalizeUrl(src)
    if (!isSafeUrl(normalizedSrc, true)) {
      // unsafe src → the `img` is DROPPED entirely (§1.6); its attached text survives.
      return { content: inner.content, children: [] }
    }
    // `img` keeps ONLY `src` (required, normalized) + `alt` (optional, raw).
    const props: Record<string, unknown> = { src: normalizedSrc }
    const alt = node.attrs['alt']
    if (alt !== undefined) props.alt = alt
    return { content: inner.content, children: [{ type: 'img', content: '', props }] }
  }

  // Any other element (`u`/`font`/`span`/`div`/`br` + anything outside the
  // accepted set) → UNWRAPPED (§1.7): the wrapper is dropped, its text folded
  // into the parent's `content`, its child-producing descendants hoisted to
  // siblings.
  return { content: inner.content, children: inner.children }
}

/** A work-stack frame for the iterative traversal (ADR-4 stack-safety).
 *  `target` is the accumulator this node's result is merged into (its parent's
 *  accumulator, or the root accumulator for top-level nodes). `acc` accumulates
 *  this element's children results. */
interface Frame {
  node: HtmlNode
  target: Processed
  expanded: boolean
  acc: Processed
}

/** Process a list of nodes into a single `Processed` result. ITERATIVE (explicit
 *  work stack) — never recurses, so deeply-nested input cannot overflow the call
 *  stack (ADR-4). Preserves document order exactly. */
function processNodes(nodes: HtmlNode[]): Processed {
  const root: Processed = { content: '', children: [] }
  const stack: Frame[] = []
  for (let k = nodes.length - 1; k >= 0; k--) {
    stack.push({ node: nodes[k], target: root, expanded: false, acc: { content: '', children: [] } })
  }

  while (stack.length > 0) {
    const frame = stack.pop()!
    const node = frame.node
    if (node.type === 'text') {
      // Text nodes survive as plain text in document order; whitespace and
      // control characters are preserved AS-IS (§1.7/ADR-10).
      merge(frame.target, { content: node.text, children: [] })
      continue
    }
    if (!frame.expanded) {
      // First visit: push the frame back (to finalize after children) and push
      // its children (reversed so they pop in document order).
      frame.expanded = true
      stack.push(frame)
      const kids = node.children
      for (let k = kids.length - 1; k >= 0; k--) {
        stack.push({ node: kids[k], target: frame.acc, expanded: false, acc: { content: '', children: [] } })
      }
      continue
    }
    // Second visit: all children have been merged into frame.acc.
    merge(frame.target, computeNodeResult(node, frame.acc))
  }
  return root
}

// ---- the public function ----------------------------------------------------

/** Decompose a contenteditable root's innerHTML into the RAG node's plain-text
 *  `content` + inline `children` (`RagNodeChild[]`). PURE, DETERMINISTIC, TOTAL
 *  — never throws for a malformed string input. The ONLY fail-state is a
 *  non-string input. */
export function decomposeRichHtml(rawHtml: string): DecomposeRichResult {
  if (typeof rawHtml !== 'string') {
    return { ok: false, error: 'decomposeRichHtml: input must be a string' }
  }
  const nodes = parseHtml(rawHtml)
  const { content, children } = processNodes(nodes)
  return { ok: true, content, children }
}
