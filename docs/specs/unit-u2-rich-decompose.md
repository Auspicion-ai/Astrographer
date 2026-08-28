# Spec — Unit U2: Contenteditable-Blur HTML → `RagNodeChild[]` Decomposition (Pure)

- **Status:** SPEC (the U2 unit of the editing-mode-toggle + contenteditable
  rich-text editor slice, decision **F** of `docs/specs/editing-mode-toggle-review.md`
  §4/§5). The pure, TOTAL, DOM-free converter that turns a contenteditable
  element's `innerHTML` (browser-authored rich text) back into the RAG store's
  `RagNodeChild[]` inline-children model + the node's plain-text `content`, so
  the host can write it back via the combined `setRichText` edit op after blur
  (Unit U5). The host calls `decomposeRichHtml` ONCE in `editorBlur` (decision
  **G**); this unit is the PURE decomposition contract that blur path builds on.
- **Scope:** a single PURE function
  `decomposeRichHtml(rawHtml: string): DecomposeRichResult` in a new node-testable
  module `src/main/rich-decompose.ts` (no Electron, no DOM, no network — it
  operates on an HTML string). It REUSES the internal tokenizer (`parseHtml`) and
  URL-safety helpers (`normalizeUrl`/`isSafeUrl`/`escapeAttr`) from
  `src/main/paste-sanitize.ts` by EXPORTING them ADDITIVELY from that file with
  **NO behavior change** to `sanitizePastedHtml` — the pinned Unit S tests must
  stay green. This unit does NOT implement the contenteditable UI, the `setRichText`
  edit op (Unit U5), the `IPC_EDIT_RICH_COMMIT` channel (Unit U5), the
  eligibility gate (Unit U3), or the blur/caret/IME host wiring (Unit U4). It is
  the PURE decomposition contract only.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the new
  `src/main/rich-decompose.ts` (the `decomposeRichHtml` function + the
  `DecomposeRichResult` type) AND the additive exports on
  `src/main/paste-sanitize.ts` from §2/§6/§1 before any implementation. The full
  red set is **64 tests**: 38 happy-path (§2) + 8 fail-state (§2) + 1
  module-existence RED + 5 additive-export (§1) + 12 adversarial regression
  (§6 ADR-1..ADR-12 — the original ADR-1..ADR-10 must-hunt + the F1 host-fix
  regression ADR-11 + the F2 host-fix regression ADR-12).
  The function is PURE (no Electron, no DOM), so the ENTIRE red set is
  node-testable — no `.skip` block is required.

---

## 1. Status + signature + return shape + element policy

### 1.1 What the proposal asks (U2)

When a user edits a node in `contenteditable` mode and blurs it, the host reads
the contenteditable root's `innerHTML` (browser-authored rich text) and must
decompose it back into the RAG node's `content` (plain text) + `children`
(`RagNodeChild[]`) so it can be written back via the combined `setRichText` edit
op (Unit U5, decision **A**). The decomposition happens ONCE in the host
`editorBlur` (decision **G**); the converter itself is PURE (no DOM, no network)
so it is node-testable in isolation. Decision **F** pins: `b`→`strong`,
`i`→`em`; unwrap `u`/`font`/`span`/`div`/`br` into the parent `content`; re-validate
`<a>` href and `<img>` src via `isSafeUrl`/`normalizeUrl`; emit `{ content,
children }` in document order; TOTAL (never throws); reuse the paste-sanitize
tokenizer + URL helpers exported additively.

### 1.2 The exported signature + return shape (pinned)

```ts
// src/main/rich-decompose.ts — the PURE contenteditable-blur decomposer. No
// Electron, no DOM, no network — it operates on an HTML string, so it is
// node-testable.
export function decomposeRichHtml(rawHtml: string): DecomposeRichResult

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
       *  `RagNodeChild[]` that passes the Unit M §5.4 `validateNodeShape` /
       *  `isValidChildren`. */
      children: RagNodeChild[]
    }
  | { ok: false; error: string }
```

**API rules (pinned):**

- **PURE:** the function has NO Electron, NO DOM, NO I/O, NO global state, NO
  network. It operates only on the `rawHtml` string and returns a value. It is
  node-testable in isolation (§6 PURE note).
- **DETERMINISTIC:** the same `rawHtml` input ALWAYS produces the same result
  (no randomness, no time, no environment dependence).
- **TOTAL (never throws):** the function NEVER throws for a malformed string
  input. For ANY string input (empty, garbage, unclosed tags, mismatched tags,
  well-formed, huge), it returns a decomposed result (`{ ok: true, content,
  children }`) — the tokenizer parses leniently and never throws (§6 ADR-4/5/6).
  The ONLY fail-state is a NON-STRING input.
- **The fail-state (pinned):** `decomposeRichHtml` with a non-string `rawHtml`
  (e.g. `undefined`, `null`, a number, an object) returns
  `{ ok: false, error: 'decomposeRichHtml: input must be a string' }`. For ANY
  string input, the function returns `{ ok: true, content, children }` —
  possibly empty (`{ ok: true, content: '', children: [] }` for an
  empty/whitespace-only input).
- **No `html` output field:** unlike `sanitizePastedHtml`, `DecomposeRichResult`
  carries ONLY `content` + `children`. The converter does NOT emit a re-serialized
  HTML string; there is therefore no surface for executable markup to survive.
  This is what makes the unwrap-to-text policy (§1.4) safe.
- **The `content` field** is the node's plain-text content — the root's own
  direct text + the text of unwrapped elements + text BETWEEN inline children —
  in document order, CONCATENATED into a single string. It is written back as the
  RAG node's `content`.
- **The `children` field** is the inline rich-text children (`strong`/`em`/`a`/
  `img`), in document order. It is written back as the RAG node's `children` — a
  valid `RagNodeChild[]` that passes `validateNodeShape` / `isValidChildren`
  (§2 fail-state 2).
- **The output is ALWAYS a valid `RagNodeChild[]`:** every child has a `type` in
  the closed `RagNodeChildType` union (`strong`/`em`/`a`/`img`), a string
  `content`, and an object-or-absent `props` with NO dangerous key
  (`__proto__`/`constructor`/`prototype`). NO child is ever emitted for
  `b`/`i`/`u`/`font`/`span`/`div`/`br` (§2 fail-state 7).

### 1.3 The additive exports on `src/main/paste-sanitize.ts` (pinned)

The converter REUSES the paste-sanitizer's internal tokenizer + URL-safety
helpers. These WERE PRIVATE (no `export`) in `src/main/paste-sanitize.ts`; this
unit EXPORTS them ADDITIVELY — the `export` keyword is added to the existing
definitions, with **NO behavior change** to `sanitizePastedHtml` (the pinned Unit
S tests must stay green; the additive exports have landed on
`src/main/paste-sanitize.ts`):

```ts
// src/main/paste-sanitize.ts — additive exports (NO behavior change):
export interface HtmlText { type: 'text'; text: string }
export interface HtmlElement { type: 'element'; tag: string; attrs: Record<string, string>; children: HtmlNode[] }
export type HtmlNode = HtmlText | HtmlElement
export function parseHtml(input: string): HtmlNode[]   // the DOM-free tokenizer
export function normalizeUrl(raw: string): string      // decode refs + strip leading C0/space
export function isSafeUrl(url: string, allowDataImage: boolean): boolean
export function escapeAttr(s: string): string          // & → &amp;, " → &quot;
```

- **`parseHtml`** — the DOM-free HTML tokenizer (now exported additively from
  `paste-sanitize.ts`, defined at line 106). Returns `HtmlNode[]`; lenient, never throws.
  It lowercases tag names, skips comments/declarations/processing instructions,
  and DROPS the raw content of the `RAW_TEXT` set (`script`, `style`, `textarea`,
  `title`, `xmp`, `plaintext`, `listing`, `noscript`, `iframe`, `noembed`,
  `noframes`, `template`) — the raw-text content is NOT tokenized into text nodes.
  This RAW_TEXT behavior carries into `decomposeRichHtml` (§2 state 37).
  **`parseHtml` is the SHARED, UNCHANGED tokenizer (additive-only export): it
  treats `img`/`br` as CONTAINERS** (a following text node becomes `img`'s
  child), because the Unit S `sanitizePastedHtml` contract must not change.
  **`img`-as-void is a `decomposeRichHtml` behavior, not a tokenizer behavior** —
  `decomposeRichHtml` treats an `img` element as self-closing and DROPS its
  (malformed) child content (§1.6).
- **`normalizeUrl`** — decode HTML character references + strip leading
  C0-control/space (`/^[\u0000-\u0020]+/`); the form that is validated AND stored.
- **`isSafeUrl(url, allowDataImage)`** — `true` for a relative URL (no scheme),
  `http:`/`https:`, and (when `allowDataImage` is `true`, i.e. `img` only) a
  RASTER `data:image/(png|jpeg|jpg|gif|webp|bmp|avif);` URL. Rejects `javascript:`,
  `vbscript:`, `data:` (non-raster), `mailto:`, `ftp:`, `file:`, `blob:`, `about:`,
  and any other scheme not in the safe set.
- **`escapeAttr`** — HTML-escape an attribute value for output (`&` → `&amp;`,
  `"` → `&quot;`). See §1.5 for exactly where it is (and is NOT) applied.
- **`HtmlText` / `HtmlElement` / `HtmlNode`** — the tokenizer's node AST types,
  exported so `rich-decompose.ts` can type its traversal over the `parseHtml`
  result.
- **Non-regression pin:** the additive exports MUST NOT alter the behavior of
  `sanitizePastedHtml`. The Unit S test count (46) stays green unchanged. This
  unit adds NO new behavior to `sanitizePastedHtml`; it only changes its
  private functions/types to `export`ed ones.

### 1.4 The exact element policy (pinned — the closed accepted set)

The converter accepts a CLOSED set of elements. Every element is classified into
exactly ONE of three buckets:

| Bucket | Elements | Behavior |
| --- | --- | --- |
| **Child-producing** | `strong`, `em`, `a`, `img`, `b`, `i` | Emits a `RagNodeChild` (§1.6). `b` is MAPPED to `strong`; `i` is MAPPED to `em`; `strong`/`em`/`a`/`img` stay as-is. |
| **Unwrapped** | `u`, `font`, `span`, `div`, `br` | Dropped as an element; its text is folded into the parent's `content`, its child-producing descendants preserved as `RagNodeChild[]` siblings (§1.7). |
| **Everything else** (outside the accepted set) | any other tag (e.g. `p`, `h1`–`h6`, `blockquote`, `pre`, `code`, `ul`, `ol`, `li`, `table`, `section`, `svg`, `math`, and disallowed tags like `script`/`style`/`iframe` via the RAW_TEXT drop, etc.) | UNWRAPPED to its text — element dropped, text folded into the parent `content`, child-producing descendants preserved as siblings (§1.7). Mirrors the sanitizer's conservative posture, adapted to a plain-text `content` (see the security rationale). |

- **The accepted set is CLOSED:** ONLY `strong`/`em`/`a`/`img`/`b`/`i`/`u`/
  `font`/`span`/`div`/`br` (11 element types) plus plain text. Anything else is
  unwrapped to its text.
- **Security rationale for unwrap-to-text (a documented, deliberate divergence
  from the sanitizer):** the sanitizer REMOVES disallowed elements ENTIRELY
  because its `html` output field is re-fed to a converter (executable markup
  could survive). `decomposeRichHtml` emits NO `html` field (§1.2) and its
  `content` is a plain-text string written back to the RAG store, which renders
  `content` as escaped text. Folding an outside-accepted element's text into
  `content` is therefore inert — no executable markup can survive. The `a`/`img`
  child URLs are STILL re-validated (§1.6), so the XSS surface is closed. This
  divergence is pinned and must not regress the sanitizer's stricter posture.

### 1.5 Attribute stripping + URL re-validation (pinned)

Applies to the child-producing elements (`a`/`img`; `strong`/`em`/`b`/`i` carry
no props) and is shared with the unwrapped-elements path (which carries no props):

- **`strong` / `em` / `b` / `i` carry NO props** — all attributes stripped.
- **`a` keeps ONLY `href` (required) + `title` (optional, benign)** — all other
  attributes (incl. `target`, `rel`, `class`, `id`, `style`, `on*`) are stripped.
  If `href` is MISSING or UNSAFE, the `a` is DEMOTED to plain text (§1.6).
- **`img` keeps ONLY `src` (required) + `alt` (optional, benign)** — all other
  attributes (incl. `width`, `height`, `class`, `id`, `style`, `on*`) are
  stripped. If `src` is MISSING or UNSAFE, the `img` is DROPPED (§1.6).
- **`on*` event-handler attributes are NEVER emitted** — no attribute whose name
  starts with `on` survives into any child `props` (§2 fail-state 3).
- **Dangerous-key attributes (`__proto__`/`constructor`/`prototype`) are NEVER
  emitted** — stripped from any kept attribute set (§2 fail-state 5).
- **URL re-validation:** `href`/`src` are validated in their NORMALIZED form —
  `normalizeUrl(raw)` (decoded + leading C0/space stripped) → `isSafeUrl(normalized,
  allowDataImage)`. `a` passes `allowDataImage = false` (`data:` is NEVER allowed
  on `a`); `img` passes `allowDataImage = true` (raster `data:image/*` allowed).
  The NORMALIZED value is what is STORED in `props.href`/`props.src`.
- **`escapeAttr` usage (pinned):** `escapeAttr` is exported additively (§1.3) and
  is available to the converter for any defensive/downstream HTML construction.
  However, it is **NOT applied to the values stored in child `props`** — `props.href`
  and `props.src` store the NORMALIZED (decoded + C0-trimmed) value UNESCAPED; the
  optional `props.alt`/`props.title` (no URL semantics) store the RAW attribute
  value UNESCAPED (neither decoded nor C0-trimmed — they are plain-text passthrough).
  This is a deliberate pin to preserve the round-trip invariant (§3):
  if an escaped value were stored, a URL containing `&` or `"` would not round-trip
  idempotently (the next `decomposeRichHtml`/`normalizeUrl` would decode it). The
  converter's output carries no `html` field, so no unescaped attribute quote can
  be emitted into HTML.

### 1.6 Child-producing normalization (pinned)

`strong`/`em`/`a`/`img`/`b`/`i` emit a single `RagNodeChild` in document order:

- **`strong` → `{ type: 'strong', content: <text>, props: undefined }`.** Its
  content is its text (nested child-producing elements flattened per §1.7).
- **`em` → `{ type: 'em', content: <text>, props: undefined }`.** Same as strong.
- **`b` → `{ type: 'strong', content: <text>, props: undefined }`** (MAPPED — the
  sanitizer does NOT do this; decompose does). Same content rule as strong.
- **`i` → `{ type: 'em', content: <text>, props: undefined }`** (MAPPED).
- **`a` → `{ type: 'a', content: <text>, props: { href, title? } }`.** `href`
  required + safe else DEMOTED; `title` kept if present. See §1.5.
- **`img` → `{ type: 'img', content: '', props: { src, alt? } }`.** A void
  element — the emitted `img` child's `content` is ALWAYS `''`. `src` required
  + safe else DROPPED; `alt` kept if present. See §1.5. **Because the shared
  tokenizer treats `img` as a CONTAINER (additive-only, §1.3), any text the
  tokenizer attached to the `img` node (a following text run, e.g. in
  `'Hello <img src="x"> world'`) is RECOVERED into the parent's `content`, NOT
  dropped** (adversarial F2; mirrors the `br` unwrap path). When the `img` is
  dropped (missing/unsafe `src`), its attached text is STILL recovered into the
  parent `content` — only the `img` child is omitted.
- **DEMOTE (`a`):** a missing or unsafe `href` folds the `a`'s text into the
  parent's `content` and its child-producing descendants become siblings — NO `a`
  child is emitted (§2 states 24/26/30).
- **DROP (`img`):** a missing or unsafe `src` removes the `img` entirely (it has
  no text content) — NO `img` child is emitted (§2 states 25/27/31).

### 1.7 Flattening + unwrapping (pinned)

- **Nested-inline flattening (identical to the Unit S §5.5 rule):** a
  child-producing element nested inside another child-producing element is
  FLATTENED by hoisting the inner element to a SIBLING of the outer element,
  preserving document order. The outer child's `content` is the concatenation of
  all text within it that is NOT inside a nested CHILD-PRODUCING element —
  i.e. its OWN direct text nodes PLUS the text of any nested UNWRAPPED / outside
  element (see the unwrapping rule: such text is folded into the enclosing
  child's content). A nested child-producing element's content is NOT included
  in the outer's content; the inner element becomes a sibling `RagNodeChild`
  AFTER the outer, at the position where it appeared. Applied RECURSIVELY.
  - Example `<strong>a <span>b</span></strong>` → `strong` content `"a b"`
    (the nested `span` is unwrapped and its text folds into the `strong`'s
    content), `children: []`.
  - Example: `<em>italic <strong>bold</strong> tail</em>` →
    `[em("italic  tail"), strong("bold")]`.
  - Example: `<strong>bold <a href="/x">link</a></strong>` →
    `[strong("bold "), a("link", { href: "/x" })]`.
  - Example: `<em>a <strong>b <em>c</em></strong> d</em>` →
    `[em("a  d"), strong("b "), em("c")]` (recursive).
- **Unwrapping (pinned):** an unwrapped element (`u`/`font`/`span`/`div`/`br`) or
  an outside-accepted element is UNWRAPPED — the element wrapper is dropped, its
  text is folded into the parent's `content`, and its child-producing descendants
  are preserved as sibling `RagNodeChild[]`. Its attributes are stripped (it
  carries no props).
  - Example: `<div>a <strong>b</strong> c</div>` → `content: "a  c"`,
    `children: [strong("b")]`.
  - Example: `a <span>b</span> c` → `content: "a b c"`, `children: []`.
- **Whitespace/text handling (pinned):** text nodes survive as plain text in
  document order; whitespace is preserved AS-IS (no trimming, no collapsing).
  Control characters in TEXT NODES are preserved as-is in `content` (§6 ADR-10).
  The only place control characters are stripped is the leading C0/space trim in
  `normalizeUrl` for URL VALUES (§1.5).
- **The root:** the input is the contenteditable root's `innerHTML`. Its direct
  children are processed in document order as the root level — a top-level text
  run → `content`; a top-level child-producing element → `children`; a top-level
  unwrapped/outside element → unwrapped (§1.7). A single wrapping `<div>` root is
  handled the same as any unwrapped element.
- **Document order invariant:** the output's `content` (text) and `children`
  (inline elements) are derived in a SINGLE document-order pass. `content` is the
  concatenation of all text that is NOT inside a child-producing element; each
  child-producing element yields one `children` entry at the position it appears
  (with nested children hoisted per the flattening rule).

---

## 2. Every state + fail-state (TestWriter red set)

### 2.1 Happy-path states (TestWriter red set — valid paths; 38 states)

1. **Plain text only (root with only plain text, no children):**
   `decomposeRichHtml('Hello world')` →
   `{ ok: true, content: 'Hello world', children: [] }`.
2. **Empty input:** `decomposeRichHtml('')` →
   `{ ok: true, content: '', children: [] }`.
3. **Whitespace-only input:** `decomposeRichHtml('   ')` →
   `{ ok: true, content: '   ', children: [] }` (whitespace preserved as-is).
4. **A single `strong`:** `decomposeRichHtml('<strong>bold</strong>')` →
   `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }] }`.
5. **A single `em`:** `decomposeRichHtml('<em>italic</em>')` →
   `{ ok: true, content: '', children: [{ type: 'em', content: 'italic' }] }`.
6. **`b` mapped to `strong`:** `decomposeRichHtml('<b>bold</b>')` →
   `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }] }`
   (NO `b` child — §1.6).
7. **`i` mapped to `em`:** `decomposeRichHtml('<i>italic</i>')` →
   `{ ok: true, content: '', children: [{ type: 'em', content: 'italic' }] }`
   (NO `i` child — §1.6).
8. **Text + inline child:** `decomposeRichHtml('Hello <strong>bold</strong> world')`
   → `{ ok: true, content: 'Hello  world', children: [{ type: 'strong', content:
   'bold' }] }` (text before AND after the child both fold into `content`).
9. **A safe `a`:** `decomposeRichHtml('<a href="https://x">link</a>')` →
   `{ ok: true, content: '', children: [{ type: 'a', content: 'link', props: {
   href: 'https://x' } }] }`.
10. **An `a` with `title`:** `decomposeRichHtml('<a href="https://x"
    title="t">link</a>')` → the `a` child's `props` is `{ href: 'https://x',
    title: 't' }` (both kept; all other attributes stripped).
11. **A relative `a` href:** `decomposeRichHtml('<a href="/path">link</a>')` →
    the `a` child's `props` is `{ href: '/path' }` (a relative URL is safe).
12. **A safe `img`:** `decomposeRichHtml('<img src="https://x/i.png" alt="pic">')`
    → `{ ok: true, content: '', children: [{ type: 'img', content: '', props: {
    src: 'https://x/i.png', alt: 'pic' } }] }`.
13. **A safe raster `data:image/*` `img`:** `decomposeRichHtml('<img
    src="data:image/png;base64,AAAA" alt="p">')` → the `img` child's `props` is
    `{ src: 'data:image/png;base64,AAAA', alt: 'p' }` (the raster `data:image/*`
    carve-out, `img` only).
14. **`u` unwrapped:** `decomposeRichHtml('<u>underline</u>')` →
    `{ ok: true, content: 'underline', children: [] }` (NO `u` child).
15. **`font` unwrapped (attrs stripped):** `decomposeRichHtml('<font
    color="red">text</font>')` → `{ ok: true, content: 'text', children: [] }`
    (the `font` wrapper + all its attributes are dropped).
16. **`span` unwrapped:** `decomposeRichHtml('a <span>b</span> c')` →
    `{ ok: true, content: 'a b c', children: [] }` (the `span`'s text is folded
    into the parent `content`, NO `span` child — a `span` is never a
    `RagNodeChild`, matching the Unit M closed union).
17. **`div` unwrapped:** `decomposeRichHtml('<div>text</div>')` →
    `{ ok: true, content: 'text', children: [] }` (NO `div` child).
18. **`br` unwrapped:** `decomposeRichHtml('a<br>b')` →
    `{ ok: true, content: 'ab', children: [] }` (a `br` is a void element with no
    text content — dropped, NO `br` child).
19. **`div` with inline children (unwrap + hoist):**
    `decomposeRichHtml('<div>a <strong>b</strong> c</div>')` →
    `{ ok: true, content: 'a  c', children: [{ type: 'strong', content: 'b' }] }`.
20. **`span` with nested text folded:** `decomposeRichHtml('a <span>b</span> c')`
    → `{ ok: true, content: 'a b c', children: [] }` (a `span` is never a child).
21. **Nested inline flattening:** `decomposeRichHtml('<em>italic <strong>bold</strong>
    tail</em>')` → `{ ok: true, content: '', children: [{ type: 'em', content:
    'italic  tail' }, { type: 'strong', content: 'bold' }] }` (the inner `strong`
    is hoisted to a sibling AFTER the outer `em`; the `em`'s content is the
    concatenation of its direct text nodes).
22. **Recursive flattening:** `decomposeRichHtml('<em>a <strong>b <em>c</em></strong>
    d</em>')` → `{ ok: true, content: '', children: [{ type: 'em', content: 'a
    d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }`.
23. **`a` inside `strong`:** `decomposeRichHtml('<strong>bold <a
    href="/x">link</a></strong>')` → `{ ok: true, content: '', children: [{
    type: 'strong', content: 'bold ' }, { type: 'a', content: 'link', props: {
    href: '/x' } }] }`.
24. **Unsafe `a` href demotes to text:** `decomposeRichHtml('<a
    href="javascript:alert(1)">link</a>')` → `{ ok: true, content: 'link',
    children: [] }` (no `a` child, no `javascript:` URL).
25. **Unsafe `img` src drops the `img`:** `decomposeRichHtml('<img
    src="javascript:alert(1)">')` → `{ ok: true, content: '', children: [] }`.
26. **Missing `href` demotes an `a`:** `decomposeRichHtml('<a>link</a>')` →
    `{ ok: true, content: 'link', children: [] }`.
27. **Missing `src` drops an `img`:** `decomposeRichHtml('<img alt="p">')` →
    `{ ok: true, content: '', children: [] }`.
28. **`on*` attribute stripped:** `decomposeRichHtml('<a href="https://x"
    onclick="alert(1)">link</a>')` → the `a` child's `props` is `{ href:
    'https://x' }` (the `onclick` is stripped).
29. **Dangerous-key attribute stripped:** `decomposeRichHtml('<a href="https://x"
    __proto__="p">link</a>')` → the `a` child's `props` is `{ href: 'https://x' }`
    (the `__proto__` attribute is stripped).
30. **`data:` on `a` demotes:** `decomposeRichHtml('<a href="data:text/html,x">link</a>')`
    → `{ ok: true, content: 'link', children: [] }` (`data:` is never allowed on
    `a`, even raster `data:image/*`).
31. **Non-image `data:` `img` src drops the `img`:** `decomposeRichHtml('<img
    src="data:text/html,x">')` → `{ ok: true, content: '', children: [] }`.
32. **Determinism:** `decomposeRichHtml('<strong>bold</strong>')` called twice
    returns the SAME result (deep-equal) both times.
33. **Totality on a malformed string:** `decomposeRichHtml('<strong>unclosed')`
    (an unclosed tag) → `{ ok: true, content, children }` (the function NEVER
    throws; the unclosed `strong` is handled leniently by `parseHtml`).
34. **Totality on garbage:** `decomposeRichHtml('<<<>>>')` →
    `{ ok: true, content, children }` (never throws).
35. **Root with only plain text (no children) — explicit round-trip base:** a node
    whose `children` is empty decomposes to `content` + `children: []` (see §3);
    `decomposeRichHtml('plain')` → `{ ok: true, content: 'plain', children: [] }`.
36. **Text between children (the round-trip case):**
    `decomposeRichHtml('a <strong>b</strong> c <em>d</em> e')` →
    `{ ok: true, content: 'a  c  e', children: [{ type: 'strong', content: 'b' },
    { type: 'em', content: 'd' }] }` — ALL inter-child text folds into `content`,
    the inline children collect into `children` in document order.
37. **`script` content dropped (RAW_TEXT):** `decomposeRichHtml('a<script>alert(1)</script>b')`
    → `{ ok: true, content: 'ab', children: [] }` — the tokenizer skips the raw
    content of `script` (a RAW_TEXT element), so the script text is NOT available
    and the element contributes nothing (a documented carry-over of `parseHtml`'s
    RAW_TEXT behavior — §1.3).
38. **Outside-accepted element unwrapped to text + hoist:** `decomposeRichHtml('<p>Hello
    <strong>world</strong></p>')` → `{ ok: true, content: 'Hello ', children: [{
    type: 'strong', content: 'world' }] }` (the `p` wrapper is dropped, its text
    folded into `content`, its inline child preserved).

### 2.2 Fail-states (TestWriter red set — documented fail-states; 8 states)

1. **Non-string input:** `decomposeRichHtml(undefined)` / `decomposeRichHtml(null)`
   / `decomposeRichHtml(42)` / `decomposeRichHtml({})` →
   `{ ok: false, error: 'decomposeRichHtml: input must be a string' }` (the pinned
   fail-state — the function guards against a non-string rather than throwing).
2. **The output is ALWAYS a valid `RagNodeChild[]`:** the output's `children`
   ALWAYS passes the Unit M §5.4 `validateNodeShape` / `isValidChildren` — every
   child has a closed `type`, a string `content`, an object-or-absent `props` with
   no dangerous key. (A TestWriter assertion the output does NOT violate.)
3. **An `on*` attribute NEVER survives:** every child's `props` NEVER contains an
   attribute whose name starts with `on` (A2-style).
4. **An unsafe URL NEVER survives:** every child's `props` NEVER contains a
   `javascript:`/`vbscript:`/`data:` (non-raster-image) `href`/`src` — and `data:`
   NEVER appears on an `a` (A3/A4-style).
5. **A dangerous-key attribute NEVER survives:** every child's `props` NEVER
   contains a `__proto__`/`constructor`/`prototype` key (A10-style).
6. **No `span`/`b`/`i`/`u`/`font`/`div`/`br` child is EVER emitted:** the
   output's `children` NEVER contains a child whose `type` is one of
   `span`/`b`/`i`/`u`/`font`/`div`/`br` — `b`→`strong`, `i`→`em`, and the rest are
   unwrapped (the `RagNodeChildType` union is closed, §1.6/§1.7).
7. **The function NEVER throws:** for ANY string input, the function returns a
   result — it NEVER throws an uncaught exception (A8-style). The TestWriter
   asserts no string input causes a throw.
8. **`sanitizePastedHtml` behavior is UNCHANGED (non-regression):** after the
   additive exports on `src/main/paste-sanitize.ts`, the pinned Unit S suite (46
   tests) still passes — `sanitizePastedHtml`'s output for the Unit S §5.6/§5.7
   cases is byte-identical to before the export change.

---

## 3. The round-trip invariant (precise)

**Pinned invariant:** for a RAG subtree rendered by `render(subtree)` into a
contenteditable root whose `innerHTML` is `H`,

```
decomposeRichHtml(H).ok === true
decomposeRichHtml(H).content === <the root node's content>
decomposeRichHtml(H).children === <the root node's children>   (deep-equal)
```

i.e. `decomposeRichHtml(render(subtree).innerHTML)` reproduces the root's
`content` + `children` exactly (deep-equal). This holds for:

- **A plain-text root** (`children` empty/undefined): `render` emits the content
  as a text run (optionally wrapped in the root element, e.g. `<div>content</div>`),
  and `decomposeRichHtml` folds it back into `content` with `children: []`
  (§2 state 35). Unwrapping a wrapping `<div>` root does not disturb this.
- **A rich root** (`children` non-empty): `render` emits each `RagNodeChild` as a
  single `strong`/`em`/`a`/`img` element and each text run as a text node, in
  document order. `decomposeRichHtml` re-separates them into `content`
  (concatenated text, including text BETWEEN children) + `children` (in order)
  (§2 states 8/36). The flattening rule (§1.7) is IDEMPOTENT on the flat model:
  because `render` emits child-producing elements as SIBLINGS (the model is flat),
  `decomposeRichHtml` of that sibling HTML reproduces the same flat `children`
  list.
- **The invariant is defined on the CANONICAL render (strong/em/a/img), not on
  `b`/`i` authoring.** The model holds `strong`/`em`; `render` emits those as-is.
  `b`/`i` mapping (§1.6) is a NORMALIZE-ON-DECOMPOSE behavior for authored input
  — it does not affect the canonical round-trip. `props.href`/`props.src`
  (normalized, §1.5) are stored UNESCAPED precisely so that a URL
  containing `&`/`"` round-trips idempotently; `props.alt`/`props.title` are raw
  passthrough (no URL semantics).
- **The invariant does NOT require `decomposeRichHtml(decomposeRichHtml(...))`
  to reproduce input HTML** — decompose emits no `html` field (§1.2) and is not
  expected to be an inverse of `sanitizePastedHtml`. It is the inverse of the
  RAG-node → contenteditable-root render direction ONLY.

---

## 4. Numeric / census claims

- **New pure function:** 1 — `decomposeRichHtml(rawHtml: string): DecomposeRichResult`
  in `src/main/rich-decompose.ts` (PURE — no Electron, no DOM, no network;
  node-testable).
- **New result type:** 1 — `DecomposeRichResult` (a discriminated union:
  `{ ok: true; content; children }` | `{ ok: false; error }`).
- **New module:** 1 — `src/main/rich-decompose.ts`.
- **Additive exports on `src/main/paste-sanitize.ts`:** 7 — `parseHtml`,
  `normalizeUrl`, `isSafeUrl`, `escapeAttr` (functions) + `HtmlText`/`HtmlElement`/
  `HtmlNode` (types). NO behavior change to `sanitizePastedHtml` (the pinned Unit S
  suite stays green).
- **Accepted element set (closed):** 11 element types — `strong`, `em`, `a`,
  `img`, `b`, `i`, `u`, `font`, `span`, `div`, `br` — plus plain text.
- **Child-producing elements:** 6 — `strong`/`em`/`a`/`img` (as-is) + `b`→`strong`
  + `i`→`em` (mapped). Emitted `RagNodeChildType`s: 4 (`strong`/`em`/`a`/`img`).
- **Unwrapped elements (text folded, no child):** 5 — `u`, `font`, `span`, `div`,
  `br`.
- **`a` kept attributes:** 2 — `href` (required) + `title` (optional). All other
  attributes stripped.
- **`img` kept attributes:** 2 — `src` (required) + `alt` (optional). All other
  attributes stripped.
- **`strong`/`em`/`b`/`i` kept attributes:** 0 — all attributes stripped (no props).
- **Return-shape fields (on `{ ok: true }`):** 2 — `content` (plain text) +
  `children` (`RagNodeChild[]`). NO `html` field.
- **`RagNodeChildType` union members:** 4 — UNCHANGED (the output emits only the
  closed union — Unit M §5.1).
- **`RagNodeType` union members:** 23 — UNCHANGED (this unit adds no node type).
- **Edit-op census:** 9 — UNCHANGED (this unit adds no edit op; the decomposed
  `content` + `children` flow into the NEW `setRichText` op in Unit U5, decision
  **A**).
- **`BatchOp` union members:** 7 — UNCHANGED (this unit adds no batch op;
  `applyBatch` is untouched — it still rejects the Unit O ops).
- **`Census` / other shared-type census:** UNCHANGED (this unit touches only
  `src/main/rich-decompose.ts` + additive exports on `src/main/paste-sanitize.ts`).
- **Test count:** 64 — 38 happy-path (§2.1) + 8 fail-state (§2.2) + 1
  module-existence RED + 5 additive-export (§1.3: parseHtml/normalizeUrl/
  isSafeUrl/escapeAttr + the HtmlNode AST types exported) + 12 adversarial
  regression (§6 ADR-1..ADR-12 — the original ADR-1..ADR-10 must-hunt + the F1
  host-fix regression ADR-11 + the F2 host-fix regression ADR-12). The Unit S
  46-test suite must remain green unchanged (non-regression, §2.2 state 8).

---

## 5. Cross-references

- `docs/specs/editing-mode-toggle-review.md` — §4 decision **F** (the PURE
  `decomposeRichHtml(rawHtml)` converter, reusing paste-sanitize's tokenizer +
  URL helpers exported additively; `b`/`i`→`strong`/`em`; unwrap
  `u`/`font`/`span`/`div`/`br`; re-validate `a` href / `img` src; emits
  `{content, children}` in document order; TOTAL), §4 decision **A** (the
  `setRichText` combined op the decomposed output flows into — Unit U5), §4
  decision **G** (decomposition ONCE in host `editorBlur`), §3 amendment 3 (the
  round-trip decompose invariant — pinned precisely in THIS spec §3), §5 unit plan
  (the **U2** row: `src/main/rich-decompose.ts`, `src/main/paste-sanitize.ts`
  additive exports).
- `src/main/paste-sanitize.ts` — the SOURCE of the additive exports (§1.3):
  `parseHtml`, `normalizeUrl`, `isSafeUrl`, `escapeAttr`, `HtmlText`/`HtmlElement`/
  `HtmlNode`. Its `sanitizePastedHtml` behavior is pinned unchanged (§2.2 state 8).
- `docs/specs/unit-s-paste-sanitization.md` — §5.1 (the `SanitizePasteResult`
  discriminated-result + totality convention this spec's `DecomposeRichResult`
  mirrors, minus the `html` field), §5.4 (URL-safety rules reused verbatim),
  §5.5 (the nested-inline flattening rule adopted by THIS spec §1.7), §3a (the
  adversarial pins A1–A10 whose spirit carries into THIS spec §2/§6), §5.8 (the
  test-count convention).
- `src/main/rag-store.ts` — §(types at lines 45–58) `RagNodeChild` /
  `RagNodeChildType` (the closed `strong`/`em`/`a`/`img` union the output must be),
  `RagNode.children` (line 71); `validateNodeShape` (line 332) + `isValidChildren`
  (line 398) — the write-time validation the output's `children` must pass
  (§2.2 state 2).
- `src/shared/types.ts` — `RagSnapshotPayload.nodes` `children?` field (the
  snapshot additive field; Unit U3 §4 supporting change) the decomposed children
  round-trip through after re-derive.
- `docs/specs/unit-m-children-field.md` — §5.1 (the `RagNodeChild`/`RagNodeChildType`
  closed union), §5.4 (the `children` shape validation — dangerous-key guard,
  string `content`, object-or-absent `props`).
- `docs/decisions.md` — rows **RICH-TEXT-EDITING-GATE** (inline `strong`/`em`/
  `a`/`img` on a NEW `children` field; `span` NOT a child type; plain-text default /
  rich-text opt-in), **RAG-AUTHORITATIVE** (the decomposed `content` + `children`
  are what is written into the RAG node; the provident graph is a transient
  render materialization), **SINGLE-WRITER-STORE** (the decomposed output flows
  into the store via the `setRichText` op — a single atomic write, Unit U5).

---

## 6. Adversarial findings (must-hunt) + PURE note

**PURE note (pinned):** `decomposeRichHtml` is PURE — no DOM, no Electron, no
network, no global state. It operates on an HTML string via the shared `parseHtml`
tokenizer and returns a value. The ENTIRE unit is unit-testable with plain strings
under Node (no `.skip` block). This is the load-bearing property that lets the
blur path run decomposition in the host without a DOM.

**Adversarial must-hunt list (the post-green adversarial reviewer MUST verify
these; the TestWriter writes the regression tests NOW from this list):**

- **ADR-1 — `on*` XSS attributes:** `<img src="https://x/i.png" onerror="alert(1)">`
  → the `img` child's `props` is `{ src: 'https://x/i.png' }` ONLY — `onerror`
  never survives into `props`. (§1.5/§2.2 state 3.)
- **ADR-2 — `javascript:` XSS href:** `<a href="javascript:alert(1)">x</a>` →
  the `a` is DEMOTED to text `'x'`; no `a` child, no `javascript:` URL survives.
  (§2.2 state 4.)
- **ADR-3 — `<script>` payload:** `a<script>alert(1)</script>b` → the script is
  dropped (RAW_TEXT tokenizer skip); `content` is `'ab'`; no script text, no
  executable markup survives. (§2.1 state 37.)
- **ADR-4 — deeply nested inline (stack-safety / totality):** a deeply-nested
  input (e.g. 10k-deep `<strong><strong>…x…`) → `{ ok: true, … }`, NEVER throws a
  `RangeError` (the traversal must be iterative, mirroring the Unit S TOK-F1 fix).
- **ADR-5 — huge input (totality):** a very large input (e.g. ~1 MB of text) →
  `{ ok: true, … }`, never throws, never hangs unreasonably.
- **ADR-6 — mismatched/unclosed tags (totality):** `</strong><strong>x</strong>`,
  `<strong>unclosed`, `<a href="x">unclosed` → `{ ok: true, … }`, never throws
  (lenient tokenizer).
- **ADR-7 — `file:`/other unsafe schemes:** `<img src="file:///etc/passwd">` →
  DROPPED; `<a href="file:///x">link</a>` → DEMOTED to text. Any scheme not in the
  safe set is never stored in `props.href`/`props.src`.
- **ADR-8 — `data:` scope:** `<img src="data:image/png;base64,AAA">` → KEPT
  (raster carve-out, `img` only); `<a href="data:image/png;base64,AAA">x</a>` →
  DEMOTED (`data:` never on `a`); `<img src="data:image/svg+xml,…">` → DROPPED
  (script-capable subtype rejected).
- **ADR-9 — unescaped attribute quotes / malformed attributes:**
  `"><img src=x onerror=alert(1)>` and other quote-injection strings → parsed
  leniently by the tokenizer (which respects quotes), NEVER throws, and no `on*`
  attribute / unsafe URL ever survives into `props`.
- **ADR-10 — control characters in text:** a text run containing control
  characters (e.g. `\u0000foo\u0001`) is preserved AS-IS in `content` (no
  stripping of text-node control chars); URL VALUES still have leading
  C0/space stripped via `normalizeUrl` (§1.5/§1.7).

### Adversarial findings (post-green, RCA-3) — HOST fixes, regression-tested

- **F1 (a-big, FIXED): totality — `String.fromCodePoint` threw `RangeError` on
  out-of-range / lone-surrogate HTML refs.** A hostile `&#x110000;` / `&#xD800;`
  ref in a URL made `decodeHtmlRefs` (paste-sanitize.ts) throw, so
  `decomposeRichHtml` was NOT total (violating §1.2/§2.2 fail-state 7). Fix:
  guard `code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)` → leave the
  literal un-decoded. Regression: ADR-11. (This also makes `sanitizePastedHtml`
  not throw on such inputs — a host defect fix, additive-safe.)
- **F2 (a-med, FIXED): `img` silently dropped a following text run (data loss).**
  The shared tokenizer treats `img` as a CONTAINER (additive-only), so a
  legitimate trailing text run (`'Hello <img src="x"> world'`) became `img`'s
  child and the `img`-as-void branch dropped it — breaking the §3 round-trip
  invariant in the primary blur use case. Fix: recover the tokenizer-attached
  text into the parent `content` (mirrors the `br` unwrap path); a dropped
  `img` (missing/unsafe src) still recovers its attached text. Regression:
  ADR-12.
- **F3 (minor, resolved by F2):** `br` and `img` now treat tokenizer-attached
  text consistently (both recover it into the parent `content`).

**Recording rule (RCA-3):** after the unit's green, the read-only adversarial
sub-agent runs the must-hunt list above plus any further edge cases. Every HOST
finding (in this repo's `src/`) is fixed here + regression-tested, and the finding
record is appended to this §6 (in the same style as Unit S §3a). Every PACKAGE
finding (in `node_modules/provident-ssr/` or the upstream `../Preempt-Providence/`)
is recorded in `docs/defects.md` + `docs/HANDOFF.md`, never patched here. All
findings expected are HOST findings; none are catalogued unless a package defect
surfaces.
