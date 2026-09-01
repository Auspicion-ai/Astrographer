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

/** Unit M1 (§5.3) — splice-EXTRACTION (see paste-sanitize.js): the own
 *  non-child text of a subtree's FULL projection. Flattened nested siblings
 *  SHARE an offset (back-to-back), so equal-offset children are grouped into
 *  one contiguous run before the removal. */
function spliceOutInline(full: string, children: RagNodeChild[]): string {
  if (children.length === 0) return full
  // Group contiguous back-to-back (equal-offset) runs — flattened nested siblings.
  const runs: { off: number; text: string }[] = []
  for (const c of children) {
    const off = c.offset ?? 0
    const last = runs[runs.length - 1]
    if (last && last.off === off) last.text += c.content
    else runs.push({ off, text: c.content })
  }
  const out: string[] = []
  let cursor = 0
  for (const r of runs) {
    if (r.off > cursor) out.push(full.slice(cursor, r.off))
    cursor = r.off + r.text.length
  }
  if (cursor < full.length) out.push(full.slice(cursor))
  return out.join('')
}

/** Merge `r` into `target` in place (document-order concatenation). `r.content`
 *  is the FULL projection of `r`; `r.children` carry offsets RELATIVE to it, so
 *  each is rebased by the target's pre-append content length (§5.4). */
function merge(target: Processed, r: Processed): void {
  const base = target.content.length
  target.content += r.content
  for (const c of r.children) {
    target.children.push({ ...c, offset: (c.offset ?? 0) + base })
  }
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
    const own = spliceOutInline(inner.content, inner.children)
    return {
      content: own + inner.children.map((c) => c.content).join(''),
      children: [{ type: 'strong', content: own, offset: 0 }, ...inner.children.map((c) => ({ ...c, offset: 0 }))],
    }
  }
  if (tag === 'em' || tag === 'i') {
    const own = spliceOutInline(inner.content, inner.children)
    return {
      content: own + inner.children.map((c) => c.content).join(''),
      children: [{ type: 'em', content: own, offset: 0 }, ...inner.children.map((c) => ({ ...c, offset: 0 }))],
    }
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
    const own = spliceOutInline(inner.content, inner.children)
    return {
      content: own + inner.children.map((c) => c.content).join(''),
      children: [
        { type: 'a', content: own, props, offset: 0 },
        ...inner.children.map((c) => ({ ...c, offset: 0 })),
      ],
    }
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
    return { content: inner.content, children: [{ type: 'img', content: '', props, offset: 0 }] }
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
