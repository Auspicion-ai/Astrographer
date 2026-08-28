# Spec — Unit S: Paste-Time Sanitization (Safe Inline Rich-Text from Raw Pasted HTML)

- **Status:** SPEC (the paste-time sanitization must-fix item of the
  RICH-TEXT-EDITING-GATE — the pure, node-testable function that turns RAW
  pasted HTML from a contenteditable paste event into a SAFE, NORMALIZED
  `RagNodeChild[]` + plain-text representation that is safe to convert into the
  RAG store's `children` field). Gate reference: `docs/decisions.md` row
  **RICH-TEXT-EDITING-GATE** (the resolved design: inline `strong`/`em`/`a`/
  `img` are held by a NEW `children` field on `RagNode`; `span` is NOT a child
  type — a diff-matching artifact folded into the parent's `content`; plain-text
  is the DEFAULT for all nodes in v1, rich-text opt-in per-node-type). This unit
  is the **paste-time sanitization** must-fix item. It does NOT implement the
  contenteditable UI (a later slice), the retrieval indexing of inline
  `children` text (Unit Q), the traversal disambiguation of inline vs
  doc-children (Unit R), or the `provident-editable@0.1.0` converter/diff
  integration (a later slice). It is the PURE, DOM-free sanitization contract the
  contenteditable paste path builds on.
- **Scope:** a single PURE function `sanitizePastedHtml(rawHtml: string):
  SanitizePasteResult` in a new node-testable module `src/main/paste-sanitize.ts`
  (no Electron, no DOM — it operates on an HTML string). The function REMOVES
  dangerous content (script, event-handler attributes, unsafe URLs, the pinned
  disallowed-element list), NORMALIZES the surviving content into the
  `RagNodeChild[]` shape (the Unit M `RagNodeChild`/`RagNodeChildType` types) +
  a plain-text `content` string, and is DETERMINISTIC and TOTAL (never throws for
  a malformed input — it returns a sanitized result or a pinned fail-state). This
  unit does NOT change the `RagStore` interface, the `RagNode`/`RagNodeChild`
  types (Unit M), the edit ops (Unit O), the `IPC_EDIT_BATCH` channel (Unit P),
  the traversal, or the renderer.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the new `src/main/paste-sanitize.ts`
  (the `sanitizePastedHtml` function + the `SanitizePasteResult` type + the
  internal helpers) from §5.6/§5.7 before any implementation. The full red set is
  **46 tests**: 32 happy-path (§5.6) + 8 fail-state (§5.7) + 1 module-existence
  RED + 5 adversarial regression (§3a URL-F1/F2/F3, TOK-F1/F4). The function is
  PURE (no Electron, no DOM), so the ENTIRE red set is node-testable — no `.skip`
  block is required.

---

## 1. What the proposal asks

The rich-text contenteditable machinery (the RICH-TEXT-EDITING-GATE resolved
design) needs a paste-time sanitization step: when a user pastes HTML into a
contenteditable, the RAW pasted HTML must be made SAFE and NORMALIZED before it
is converted into the RAG store's `children` field. The resolved design pins
inline `strong`/`em`/`a`/`img` on a NEW `children` field on `RagNode` (Unit M),
so the sanitizer must produce a `RagNodeChild[]` + plain-text representation
that is safe to store.

1. **A PURE paste-time sanitization function** that takes RAW pasted HTML (from
   a contenteditable paste event) and returns a SAFE, NORMALIZED representation
   (sanitized HTML + a `RagNodeChild[]` + a plain-text `content` string) that is
   safe to convert into the RAG store's `children` field. The function is PURE
   (no Electron, no DOM dependency — it operates on an HTML string) so it is
   node-testable.
2. **Dangerous content is REMOVED:** `<script>`, event-handler attributes
   (`on*`), `javascript:`/`vbscript:`/`data:` URLs (except safe `data:image/*`
   for `img`), and the pinned disallowed-element list (iframe, object, embed,
   style, link, meta, base, form, input, button, textarea, select, option, svg,
   math, template, noscript, frame, frameset, applet, audio, video, source,
   track, canvas, map, area, param, portal, dialog, details, summary, marquee,
   blink, xmp, plaintext, listing, keygen, command, menuitem, slot, shadow,
   content, element, custom-element, unknown, annotation, annotation-xml,
   foreignObject, desc, title, metadata, defs, g, path, rect, circle, ellipse,
   line, polyline, polygon, text, tspan, use, image, symbol, marker, clipPath,
   mask, pattern, linearGradient, radialGradient, stop, filter, `fe*`, view,
   switch, `a` in SVG context). Only the inline formatting elements
   `strong`/`em`/`a`/`img` (and plain text) survive.
3. **The surviving content is NORMALIZED** into the `RagNodeChild[]` shape (or a
   shape the converter can consume): `strong`/`em`/`a`/`img` → `RagNodeChild`;
   `span` is folded into the parent's text (per the RICH-TEXT-EDITING-GATE
   design — `span` is NOT a child type); nested inline elements are flattened
   per a pinned rule; `a` keeps only `href` (and `title`) — all other attributes
   stripped; `img` keeps only `src`/`alt` — all other attributes stripped;
   `href`/`src` must be safe (no `javascript:`/`vbscript:`/`data:` except safe
   `data:image/*`).
4. **The function is deterministic and total** — it never throws for a malformed
   input; it returns a sanitized result or a pinned fail-state.

## 2. Feasibility verdict

**Feasible — a single PURE, node-testable function with no Electron/DOM
dependency.** The sanitizer operates on an HTML string and produces a
`RagNodeChild[]` + plain-text representation. The machinery it needs is already
landed:

- **The `RagNodeChild`/`RagNodeChildType` types** (Unit M §5.1) are the closed
  inline-child union (`strong`/`em`/`a`/`img`) the sanitizer normalizes into.
  The sanitizer emits ONLY these four child types — `span` is folded into the
  parent's text, so the output is always a valid `RagNodeChild[]` that passes
  the Unit M §5.4 `validateNodeShape` at write time.
- **The `setSubtree` edit op** (Unit O §5.3) is the write path the sanitized
  `children` flows into — a full replace of a node's inline `children`. The
  sanitizer's output is the `RagNodeChild[]` `setSubtree` accepts.
- **The `provident-editable@0.1.0` converter** (the RICH-TEXT-EDITING-GATE
  adopted package) consumes the SANITIZED HTML (the `html` field of the result)
  to build the provident tree; the sanitizer's `html` output is safe to feed to
  it. The converter/diff integration is a LATER slice — this unit pins the
  sanitizer contract the paste path builds on.
- **A pure-JS HTML parser** (e.g. `htmlparser2`/`parse5`-style, or a
  project-local tokenizer) is the only new dependency — a node-testable,
  DOM-free parser. The sanitizer does NOT use the browser DOM (no
  `DOMParser`/`document`), so it is node-testable without Electron.

No engine/foundation gap blocks this unit. The sanitizer is **project-specific**
(the RAG data model + the `children` field are host-side, per
`docs/decisions.md` ENGINE-GAP-HANDOFF). No handoff item is opened by this unit.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The PURE `sanitizePastedHtml` function | Project-specific (a new `src/main/paste-sanitize.ts` module) | Low cost; the paste-time sanitization must-fix — safe, normalized inline rich-text from raw pasted HTML. |
| The disallowed-element removal (the pinned list + the `fe*` wildcard) | Project-specific | Low cost; removes script/iframe/svg/math/form/etc. so only `strong`/`em`/`a`/`img` + text survive. |
| The event-handler (`on*`) + unsafe-URL stripping | Project-specific | Low cost; removes XSS vectors (`onclick`, `javascript:`/`vbscript:`/`data:` URLs). |
| The normalization into `RagNodeChild[]` (span folding, nested flattening, `a`/`img` attribute pinning) | Project-specific | Low cost; the output is always a valid `RagNodeChild[]` that passes the Unit M §5.4 validation. |
| The determinism + totality guarantee (never throws) | Project-specific | Low cost; a malformed input returns a sanitized result or a pinned fail-state, never an uncaught throw. |
| The pure-JS HTML parser dependency | Project-specific (a node-testable, DOM-free parser) | Low cost; the only new dependency — enables node-testing without Electron/DOM. |

No engine gap. The contenteditable UI, the `provident-editable@0.1.0`
converter/diff integration, the retrieval indexing of inline `children` text
(Unit Q), and the traversal disambiguation of inline vs doc-children (Unit R)
are LATER slices (the remaining RICH-TEXT-EDITING-GATE must-fix items) — NOT
this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — `<script>` and its CONTENT are removed entirely** (§5.2). A pasted
  `<script>alert(1)</script>` yields NO text and NO child — the script body is
  NOT preserved as text. The adversarial pass must confirm a script's content is
  dropped, not escaped-and-kept.
- **A2 — event-handler attributes (`on*`) are stripped** (§5.4). An `onclick`/
  `onerror`/`onload`/`onmouseover` attribute on ANY element (allowed or
  unwrapped) is removed. The adversarial pass must confirm an `on*` attribute
  never survives into the output.
- **A3 — `javascript:`/`vbscript:`/`data:` URLs are neutralized** (§5.4). An `a`
  with `href="javascript:alert(1)"` is DEMOTED to plain text (no `a` child, no
  `javascript:` URL in the output); an `img` with `src="data:text/html,..."` is
  DROPPED. The adversarial pass must confirm no unsafe URL survives in the
  sanitized `html` or in a child's `props`.
- **A4 — safe `data:image/*` is the ONLY allowed `data:` URL, and only for
  `img`** (§5.4). An `img` with `src="data:image/png;base64,..."` survives; an
  `img` with `src="data:text/html,..."` is dropped; an `a` with
  `href="data:image/png;base64,..."` is demoted (data: is never allowed on
  `a`). The adversarial pass must confirm the `data:image/*` carve-out is
  scoped to `img` only.
- **A5 — the disallowed-element list is exhaustive and the `fe*` wildcard
  catches SVG filter primitives** (§5.2). A pasted `<feGaussianBlur>`/`<feBlend>`
  (any element whose tag starts with `fe`) is removed entirely. The adversarial
  pass must confirm the `fe*` wildcard and every named disallowed element are
  removed.
- **A6 — `span` is folded into the parent's text, never a child** (§5.3). A
  pasted `<span>text</span>` yields the text "text" in the parent's `content`
  and NO `span` child. The adversarial pass must confirm a `span` never appears
  as a `RagNodeChild` (the Unit M §5.4 validation would reject it).
- **A7 — nested inline elements are flattened per the pinned rule** (§5.5). A
  pasted `<em>italic <strong>bold</strong> tail</em>` yields the flattened
  sibling list `[em("italic  tail"), strong("bold")]` — the inner `strong` is
  hoisted to a sibling, the outer `em`'s content is the concatenation of its
  direct text nodes. The adversarial pass must confirm the flattening is
  deterministic and order-preserving.
- **A8 — the function is TOTAL (never throws)** (§5.1). A malformed HTML string
  (unclosed tags, garbage, an empty string, a non-string) returns a sanitized
  result or the pinned fail-state — it NEVER throws. The adversarial pass must
  confirm no input causes an uncaught throw.
- **A9 — the output is always a valid `RagNodeChild[]`** (§5.1/§5.3). The
  sanitizer emits ONLY `strong`/`em`/`a`/`img` children with string `content`
  and object-or-absent `props` — so the output always passes the Unit M §5.4
  `validateNodeShape` and the Unit O §5.3 `setSubtree` validation. The
  adversarial pass must confirm the output never carries a `span` child, a
  dangerous key, or a non-string `content`.
- **A10 — prototype-pollution keys in a child's `props` are never emitted**
  (§5.4). The sanitizer strips `__proto__`/`constructor`/`prototype` from any
  attribute it keeps (the Unit M §5.4 dangerous-key guard). The adversarial pass
  must confirm a pasted `__proto__`/`constructor`/`prototype` attribute never
  survives into a child's `props`.

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (2026-08-28, Unit S — two focused passes: URL/attribute
security + tokenizer robustness):** all findings are HOST findings, fixed +
regression-tested in the same pass:

- **URL-F1 (CRITICAL) — leading C0-control/space scheme bypass → XSS in the
  `html` output.** `isSafeUrl` treated any string that did not START with a
  scheme as a safe relative URL, so a leading space/tab/newline/CR/form-feed/NUL
  defeated the scheme check (`href=" javascript:alert(1)"` was kept — the WHATWG
  URL parser strips leading C0-control/space before scheme parsing → XSS on
  click). Fixed: a new `normalizeUrl()` strips leading C0-control + space
  (`/^[\u0000-\u0020]+/`) BEFORE the scheme test; the normalized value is what is
  validated AND stored. Regression-tested for ` javascript:`, `\u0000javascript:`,
  `\t`, `\n`, `\r` on both `a` and `img`.
- **URL-F2 (MEDIUM) — the `data:image/*` carve-out admitted script-capable
  subtypes.** The regex `/^data:image\/[a-zA-Z0-9+.-]+;/i` admitted
  `data:image/svg+xml`, `data:image/html`, `data:image/xml`, `data:image/text`.
  Fixed: the carve-out is now raster-only
  (`^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);`); `svg+xml`/`html`/`xml`/
  `text` are rejected → the `img` is dropped. Regression-tested.
- **URL-F3 (MEDIUM) — HTML character-reference smuggling survived in
  `props.href`.** The tokenizer did not decode HTML character references, so
  `&#106;avascript:` was classified as a relative URL and kept raw in `props`
  (a latent XSS if a downstream renderer emits it unescaped). Fixed: a new
  `decodeHtmlRefs()` decodes numeric references (`&#106;`, `&#x6a;`) + a curated
  named-entity set before validation; `normalizeUrl()` = decode → trim.
  Regression-tested for `&#106;avascript:`, `javascript&#58;`,
  `&#106;&#97;vascript:`.
- **TOK-F1 (MEDIUM) — recursive normalization overflowed the stack on
  deeply-nested input, violating the totality contract.** `processNode`/
  `processNodes` was recursive and threw `RangeError` on a ~10k-deep nested input
  (the tokenizer was iterative, but the normalization was not). Fixed: replaced
  the recursion with an iterative post-order traversal using an explicit work
  stack (`Frame` with `target`/`acc` accumulators); document order and output
  are preserved. Regression-tested for a 10k-deep nested input (no throw).
- **TOK-F2 (LOW) — the `RAW_TEXT` skip re-lowercased the whole input per
  raw-text element (O(n·m)).** Fixed: `parseHtml` lowercases the input once up
  front and the skip uses the cached copy.
- **TOK-F4 (LOW) — `noembed`/`noframes` were in `RAW_TEXT` but not
  `DISALLOWED`.** Fixed: added both to `DISALLOWED` for consistency (their
  content was already skipped by the raw-text path, so this is defense-in-depth).
- **INFORMATIONAL (no fix):** internal-whitespace scheme misclassification
  (`java\tscript:` parses as an inert unknown scheme in modern browsers); null
  bytes pass through unescaped; text nodes are not HTML-escaped in the `html`
  output field. None require a fix.

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the rich-text editing proposal
(`docs/decisions.md` row **RICH-TEXT-EDITING-GATE**, 2026-08-28). The
consolidated verdicts:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

The resolved design amendments that THIS unit pins (each cross-referenced to the
section that resolves it):

- **S1 — inline `strong`/`em`/`a`/`img` are held by a NEW `children` field on
  `RagNode`** (§5.1/§5.3): the sanitizer normalizes the surviving content into
  the `RagNodeChild[]` shape (the Unit M field), NOT separate RAG nodes.
- **S2 — `span` is NOT a child type** (§5.3): the sanitizer folds `span` into
  the parent's text — a `span` is never emitted as a `RagNodeChild` (the Unit M
  §5.4 validation would reject it).
- **S3 — plain-text is the DEFAULT; rich-text is opt-in per-node-type** (§5.1):
  the sanitizer's output is a plain-text `content` string + an optional
  `children` array — a node with no inline formatting has `children: []` (or
  `undefined`), matching the plain-text default.
- **S4 — the paste-time sanitization must-fix** (§5.1–§5.5): the pure, total,
  deterministic sanitizer that removes dangerous content and normalizes the
  surviving content into the `RagNodeChild[]` shape.

## 4. Design decisions pinned by this spec

- **RICH-TEXT-EDITING-GATE (consumed):** the resolved design pins inline
  `strong`/`em`/`a`/`img` on a NEW `children` field on `RagNode` (not separate
  RAG nodes); `span` is NOT added to `RagNodeType` (a diff-matching artifact
  folded into the parent's `content`); plain-text is the DEFAULT for all nodes
  in v1, rich-text opt-in per-node-type. This unit lands the paste-time
  sanitization must-fix.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. The sanitizer's output (a `RagNodeChild[]` + plain-text `content`) is
  what is written into the RAG node's `children`/`content`; the provident graph
  is a transient render materialization.
- **SUBTREE-OWNERSHIP (consumed):** the inline `children` are NOT separate RAG
  nodes and NOT part of `ownedNodeIds` — the sanitizer produces inline children
  held on the owning node (one-chunk-per-subtree preserved).
- **SINGLE-WRITER-STORE (consumed):** the sanitized `children` flows into the
  store via the `setSubtree` edit op (Unit O §5.3) — a single atomic write
  serialized through the single-writer queue. The sanitizer itself is PURE and
  performs NO store write.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** the sanitized `children`
  written via `setSubtree` is covered by the SHA-256 hash (Unit M §5.2 — the
  `nodeSource` field order includes `children`).
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the sanitizer is a PURE
  function reachable from the UI paste path (and, forward-looking, any MCP
  paste-equivalent path) — the same sanitization applies regardless of the
  entry surface.

## 5. The exhaustive contract

### 5.1 The function signature + return shape

The sanitizer is a single PURE function in a new node-testable module
`src/main/paste-sanitize.ts`. It operates on an HTML string (no Electron, no
DOM) and is DETERMINISTIC and TOTAL (never throws for a malformed input).

**The function signature (pinned):**

```ts
// src/main/paste-sanitize.ts — the PURE paste-time sanitizer. No Electron, no
// DOM — it operates on an HTML string, so it is node-testable.
export function sanitizePastedHtml(rawHtml: string): SanitizePasteResult
```

**The return type (pinned):**

```ts
/** The result of sanitizing raw pasted HTML. A discriminated result: `{ ok:
 *  true, ... }` on success, `{ ok: false, error }` on the pinned fail-state.
 *  The function is TOTAL — it NEVER throws for a malformed input. */
export type SanitizePasteResult =
  | {
      ok: true
      /** The SANITIZED HTML string — safe, order-preserving, containing ONLY
       *  `strong`/`em`/`a`/`img` + text (no script/iframe/svg/on*/unsafe-URL).
       *  Ready to feed to the `provident-editable@0.1.0` converter. */
      html: string
      /** The plain-text content (text nodes + folded `span` + unwrapped-element
       *  text), in document order. This is the RAG node's `content`. */
      content: string
      /** The normalized inline children (`strong`/`em`/`a`/`img`), in document
       *  order. This is the RAG node's `children` (a valid `RagNodeChild[]`). */
      children: RagNodeChild[]
    }
  | { ok: false; error: string }
```

**API rules (pinned):**

- **PURE:** the function has NO Electron, NO DOM, NO I/O, NO global state. It
  operates only on the `rawHtml` string and returns a value. It is node-testable
  in isolation.
- **DETERMINISTIC:** the same `rawHtml` input ALWAYS produces the same result
  (no randomness, no time, no environment dependence).
- **TOTAL (never throws):** the function NEVER throws for a malformed input. For
  ANY string input (empty, garbage, unclosed tags, well-formed), it returns a
  sanitized result (`{ ok: true, ... }`) or the pinned fail-state
  (`{ ok: false, error }`). The ONLY fail-state is a NON-STRING input (a
  defensive guard — the signature is `rawHtml: string`, so a non-string is a
  caller error the function guards against rather than throwing).
- **The fail-state (pinned):** `sanitizePastedHtml` with a non-string `rawHtml`
  (e.g. `undefined`, `null`, a number, an object) returns
  `{ ok: false, error: 'sanitizePastedHtml: input must be a string' }`. For ANY
  string input, the function returns `{ ok: true, ... }` (a sanitized result,
  possibly empty — `{ ok: true, html: '', content: '', children: [] }` for an
  empty/whitespace-only input).
- **The `html` field** is the sanitized HTML string — safe, order-preserving,
  containing ONLY `strong`/`em`/`a`/`img` + text. It is the input to the
  `provident-editable@0.1.0` converter (a later slice).
- **The `content` field** is the plain-text content (text nodes + folded `span`
  + unwrapped-element text), in document order. It is the RAG node's `content`.
- **The `children` field** is the normalized inline children (`strong`/`em`/
  `a`/`img`), in document order. It is the RAG node's `children` — a valid
  `RagNodeChild[]` that passes the Unit M §5.4 `validateNodeShape` and the Unit
  O §5.3 `setSubtree` validation (A9).
- **The output is always a valid `RagNodeChild[]`:** every child has a `type` in
  the closed `RagNodeChildType` union (`strong`/`em`/`a`/`img`), a string
  `content`, and an object-or-absent `props` with NO dangerous key
  (`__proto__`/`constructor`/`prototype`) anywhere (A10). A `span` child is NEVER
  emitted (A6).

### 5.2 Disallowed-element removal

The sanitizer REMOVES dangerous content. A disallowed element is removed
ENTIRELY — the element AND its content (text + children) are dropped (no text,
no child is emitted for it or its subtree).

**The disallowed-element list (pinned — the closed set):**

`script`, `iframe`, `object`, `embed`, `style`, `link`, `meta`, `base`, `form`,
`input`, `button`, `textarea`, `select`, `option`, `svg`, `math`, `template`,
`noscript`, `frame`, `frameset`, `applet`, `audio`, `video`, `source`, `track`,
`canvas`, `map`, `area`, `param`, `portal`, `dialog`, `details`, `summary`,
`marquee`, `blink`, `xmp`, `plaintext`, `listing`, `keygen`, `command`,
`menuitem`, `slot`, `shadow`, `content`, `element`, `custom-element`, `noembed`,
`noframes`, `unknown`, `annotation`, `annotation-xml`, `foreignObject`, `desc`,
`title`, `metadata`,
`defs`, `g`, `path`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`,
`text`, `tspan`, `use`, `image`, `symbol`, `marker`, `clipPath`, `mask`,
`pattern`, `linearGradient`, `radialGradient`, `stop`, `filter`, `view`,
`switch`.

**The `fe*` wildcard (pinned):** ANY element whose tag name starts with `fe`
(case-insensitive) is disallowed — e.g. `feGaussianBlur`, `feBlend`, `feOffset`,
`feColorMatrix`, `feFlood`, `feMerge`, `feComposite`, `feDropShadow`. This
catches the SVG filter-primitive family (A5).

**The `a`-in-SVG-context rule (pinned):** an `a` element that is a DESCENDANT of
an `svg` element is disallowed (removed entirely). This is subsumed by the `svg`
removal (an `svg` is removed entirely, so any `a` inside it is removed with it),
but is pinned explicitly for the adversarial pass. An `a` OUTSIDE an `svg` is an
ALLOWED inline element (§5.3).

**Removal rules (pinned):**

- **A disallowed element is removed ENTIRELY** — the element AND its content
  (text + children) are dropped. A `<script>alert(1)</script>` yields NO text
  and NO child (A1). A `<style>body{...}</style>` yields NO text. An
  `<iframe>...</iframe>` yields NO text.
- **The removal is recursive:** a disallowed element's entire subtree is dropped,
  including any allowed inline elements nested inside it (e.g. a `<strong>`
  inside a `<script>` is dropped with the script).
- **The `fe*` wildcard is case-insensitive** — `feGaussianBlur`, `FEGaussianBlur`,
  `fegaussianblur` are all disallowed.
- **The disallowed-element list is CLOSED** — an element NOT in the list and NOT
  matching the `fe*` wildcard is NOT removed by this rule (it is either an
  allowed inline element §5.3 or an unwrapped element §5.5).

### 5.3 Allowed-inline normalization (`strong`/`em`/`a`/`img`)

The surviving inline formatting elements are normalized into `RagNodeChild`
values. `span` is folded into the parent's text (NOT a child type).

**The allowed inline elements (pinned):** `strong`, `em`, `a`, `img` — the
closed `RagNodeChildType` union (Unit M §5.1). ONLY these four element types
produce a `RagNodeChild`.

**Normalization rules (pinned):**

- **`strong` → `RagNodeChild { type: 'strong', content: <text>, props: undefined }`.**
  The `strong`'s content is its text (nested inline elements flattened per §5.5).
  All attributes are STRIPPED (a `strong` carries no props).
- **`em` → `RagNodeChild { type: 'em', content: <text>, props: undefined }`.**
  The `em`'s content is its text (nested inline elements flattened per §5.5).
  All attributes are STRIPPED.
- **`a` → `RagNodeChild { type: 'a', content: <text>, props: { href, title? } }`.**
  The `a`'s content is its text (nested inline elements flattened per §5.5). The
  `a` keeps ONLY `href` (required) and `title` (optional, benign) — ALL other
  attributes are STRIPPED (§5.4). If `href` is missing or unsafe, the `a` is
  DEMOTED to plain text (§5.4).
- **`img` → `RagNodeChild { type: 'img', content: '', props: { src, alt? } }`.**
  The `img` is a void element — its `content` is ALWAYS `''`. The `img` keeps
  ONLY `src` (required) and `alt` (optional, benign) — ALL other attributes are
  STRIPPED (§5.4). If `src` is missing or unsafe, the `img` is DROPPED (§5.4).
- **`span` is folded into the parent's text** (S2/A6): a `span`'s content (text +
  inline children) is folded into the parent's `content`/`children` — the `span`
  wrapper is dropped, NO `span` child is emitted. A `span`'s attributes are
  STRIPPED (a `span` carries no props).
- **The output is always a valid `RagNodeChild[]`** (A9): every child has a
  `type` in the closed union, a string `content`, and an object-or-absent
  `props` with NO dangerous key. A `span` child is NEVER emitted.

### 5.4 Attribute stripping + URL safety

Attributes are stripped to a minimal safe set, and URLs are validated for
safety.

**Attribute-stripping rules (pinned):**

- **Event-handler attributes (`on*`) are STRIPPED** (A2): any attribute whose
  name starts with `on` (case-insensitive — `onclick`, `onerror`, `onload`,
  `onmouseover`, `onfocus`, `onblur`, `OnClick`, etc.) is removed from ANY
  element (allowed or unwrapped). An `on*` attribute NEVER survives into the
  output.
- **Dangerous-key attributes are STRIPPED** (A10): any attribute named
  `__proto__`/`constructor`/`prototype` is removed (the Unit M §5.4
  prototype-pollution guard). A dangerous-key attribute NEVER survives into a
  child's `props`.
- **`strong`/`em` carry NO props** — all their attributes are stripped.
- **`a` keeps ONLY `href` and `title`** — all other attributes (including
  `target`, `rel`, `class`, `id`, `style`, `on*`) are stripped.
- **`img` keeps ONLY `src` and `alt`** — all other attributes (including `width`,
  `height`, `class`, `id`, `style`, `on*`) are stripped.
- **`span` and unwrapped elements carry NO props** — their attributes are
  stripped (the wrapper is dropped anyway, §5.5).

**URL-safety rules (pinned):**

- **A URL is SAFE if it matches one of:**
  - `http:` or `https:` — `^https?://` (case-insensitive scheme).
  - A RELATIVE URL — does NOT start with a scheme (does NOT match
    `^[a-zA-Z][a-zA-Z0-9+.-]*:`). E.g. `/path`, `path`, `#anchor`, `?query`,
    `../x`.
  - (for `img` ONLY) a RASTER `data:image/*` URL — matches
    `^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);` (a data URL with a raster
    image MIME type; the script-capable subtypes `svg+xml`/`html`/`xml`/`text`
    are REJECTED — URL-F2).
- **A URL is UNSAFE if it starts with any scheme NOT in the safe set** — e.g.
  `javascript:`, `vbscript:`, `data:` (non-image), `mailto:`, `ftp:`, `file:`,
  `blob:`, `about:`. An unsafe URL is NEVER emitted.
- **`a` with an unsafe or missing `href` is DEMOTED to plain text** (A3): the
  `a`'s content (text + inline children) is folded into the parent's
  `content`/`children`, and NO `a` child is emitted. `data:` is NEVER allowed on
  `a` (A4) — even `data:image/*` demotes an `a`.
- **`img` with an unsafe or missing `src` is DROPPED** (A3/A4): the `img` is
  removed entirely (it has no text content). RASTER `data:image/*` IS allowed on
  `img` (A4/URL-F2); any other `data:` (e.g. `data:text/html`,
  `data:image/svg+xml`) drops the `img`.
- **The URL check is case-insensitive on the scheme** — `JAVASCRIPT:`,
  `JavaScript:`, `javascript:` are all unsafe.

### 5.5 Flattening + unwrapping rules

Nested inline elements are flattened, and non-inline, non-disallowed elements are
unwrapped.

**Nested-inline flattening rule (pinned, A7):** a nested inline element
(`strong`/`em`/`a`/`img` inside another inline element) is FLATTENED by hoisting
the inner element to a SIBLING of the outer element, preserving document order.
The outer element's `content` is the concatenation of its DIRECT text nodes (the
inner element's content is NOT included in the outer's content). The inner
element becomes a sibling `RagNodeChild` at the position where it appeared. This
is applied RECURSIVELY (a deeply-nested chain flattens to a flat sibling list).

- Example: `<em>italic <strong>bold</strong> tail</em>` →
  `[em("italic  tail"), strong("bold")]` — the `em`'s content is the
  concatenation of its direct text nodes ("italic " + " tail" = "italic  tail"),
  and the `strong` is hoisted to a sibling.
- Example: `<strong>bold <em>italic</em></strong>` →
  `[strong("bold "), em("italic")]`.
- Example: `<em>a <strong>b <em>c</em></strong> d</em>` →
  `[em("a  d"), strong("b "), em("c")]` (recursive — the inner `em` is hoisted
  out of the `strong`, which is hoisted out of the outer `em`).

**Unwrapping rule (pinned):** an element that is NOT an allowed inline element
(§5.3) and NOT a disallowed element (§5.2) is UNWRAPPED — the element's content
(text + inline children) is preserved, and the element wrapper is dropped. The
element's text is folded into the parent's `content`; its inline children are
preserved as siblings. This applies to block/other elements such as `div`, `p`,
`ul`, `ol`, `li`, `h1`–`h6`, `blockquote`, `pre`, `code`, `section`, `article`,
`header`, `footer`, `nav`, `main`, `aside`, `figure`, `figcaption`, `table`,
`tr`, `td`, `th`, `thead`, `tbody`, `tfoot`, `caption`, `col`, `colgroup`, `dl`,
`dt`, `dd`, `br`, `hr`, `wbr`, `b`, `i`, `u`, `s`, `strike`, `sub`, `sup`,
`small`, `big`, `mark`, `abbr`, `cite`, `q`, `dfn`, `kbd`, `samp`, `var`, `time`,
`data`, `bdi`, `bdo`, `ruby`, `rt`, `rp`, `ins`, `del`, `label`, `legend`,
`fieldset`, `output`, `progress`, `meter`, `picture`, `summary` (when NOT a
`details` child — `details` is disallowed), etc.

- Example: `<p>Hello <strong>world</strong></p>` → `content: "Hello "`,
  `children: [strong("world")]` — the `p` wrapper is dropped, its text and
  inline children are preserved.
- Example: `<div>a <em>b</em> c</div>` → `content: "a  c"`,
  `children: [em("b")]`.

**Whitespace/text handling (pinned):**

- **Text nodes survive as plain text** — the text is folded into the parent's
  `content` in document order.
- **Whitespace is preserved as-is** (no trimming, no collapsing) — the sanitizer
  does NOT normalize whitespace. `"a  b"` stays `"a  b"`.
- **An empty/whitespace-only input** returns `{ ok: true, html: '', content: '',
  children: [] }`.

### 5.6 Happy-path states (TestWriter red set — valid paths; 32 states)

1. **Plain text only:** `sanitizePastedHtml('Hello world')` →
   `{ ok: true, html: 'Hello world', content: 'Hello world', children: [] }`.
2. **Empty input:** `sanitizePastedHtml('')` →
   `{ ok: true, html: '', content: '', children: [] }`.
3. **Whitespace-only input:** `sanitizePastedHtml('   ')` →
   `{ ok: true, html: '   ', content: '   ', children: [] }` (whitespace
   preserved as-is).
4. **A single `strong`:** `sanitizePastedHtml('<strong>bold</strong>')` →
   `{ ok: true, html: '<strong>bold</strong>', content: '', children: [{ type:
   'strong', content: 'bold' }] }`.
5. **A single `em`:** `sanitizePastedHtml('<em>italic</em>')` →
   `{ ok: true, html: '<em>italic</em>', content: '', children: [{ type: 'em',
   content: 'italic' }] }`.
6. **Text + inline child:** `sanitizePastedHtml('Hello <strong>bold</strong>
   world')` → `{ ok: true, html: 'Hello <strong>bold</strong> world', content:
   'Hello  world', children: [{ type: 'strong', content: 'bold' }] }`.
7. **A safe `a`:** `sanitizePastedHtml('<a href="https://x">link</a>')` →
   `{ ok: true, html: '<a href="https://x">link</a>', content: '', children:
   [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }`.
8. **An `a` with `title`:** `sanitizePastedHtml('<a href="https://x"
   title="t">link</a>')` → the `a` child's `props` is `{ href: 'https://x',
   title: 't' }` (both kept; all other attributes stripped).
9. **A relative `a` href:** `sanitizePastedHtml('<a href="/path">link</a>')` →
   the `a` child's `props` is `{ href: '/path' }` (a relative URL is safe).
10. **A safe `img`:** `sanitizePastedHtml('<img src="https://x/i.png"
    alt="pic">')` → `{ ok: true, html: '<img src="https://x/i.png"
    alt="pic">', content: '', children: [{ type: 'img', content: '', props: {
    src: 'https://x/i.png', alt: 'pic' } }] }`.
11. **A safe raster `data:image/*` `img`:** `sanitizePastedHtml('<img
    src="data:image/png;base64,AAAA" alt="p">')` → the `img` child's `props` is
    `{ src: 'data:image/png;base64,AAAA', alt: 'p' }` (the raster `data:image/*`
    carve-out — A4/URL-F2).
12. **`span` folded into the parent's text:** `sanitizePastedHtml('a
    <span>b</span> c')` → `{ ok: true, content: 'a b c', children: [] }` (the
    `span`'s text is folded into the parent's `content`, NO `span` child — A6).
13. **Nested inline flattening:** `sanitizePastedHtml('<em>italic <strong>bold</strong>
    tail</em>')` → `{ ok: true, content: '', children: [{ type: 'em', content:
    'italic  tail' }, { type: 'strong', content: 'bold' }] }` (A7 — the inner
    `strong` is hoisted to a sibling, the outer `em`'s content is the
    concatenation of its direct text nodes).
14. **Recursive flattening:** `sanitizePastedHtml('<em>a <strong>b <em>c</em></strong>
    d</em>')` → `{ ok: true, content: '', children: [{ type: 'em', content: 'a
    d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }`
    (A7 — recursive).
15. **Unwrapped block element:** `sanitizePastedHtml('<p>Hello <strong>world</strong></p>')`
    → `{ ok: true, content: 'Hello ', children: [{ type: 'strong', content:
    'world' }] }` (the `p` wrapper is dropped, its text + inline children
    preserved).
16. **`script` removed entirely:** `sanitizePastedHtml('a<script>alert(1)</script>b')`
    → `{ ok: true, content: 'ab', children: [] }` (A1 — the script AND its
    content are dropped).
17. **`style` removed entirely:** `sanitizePastedHtml('a<style>body{}</style>b')`
    → `{ ok: true, content: 'ab', children: [] }`.
18. **`iframe` removed entirely:** `sanitizePastedHtml('a<iframe src="https://x"></iframe>b')`
    → `{ ok: true, content: 'ab', children: [] }`.
19. **`svg` removed entirely (including nested `a`):** `sanitizePastedHtml('a<svg><a
    href="https://x">s</a></svg>b')` → `{ ok: true, content: 'ab', children: [] }`
    (the `a`-in-SVG-context rule — subsumed by the `svg` removal).
20. **`fe*` wildcard removed:** `sanitizePastedHtml('a<feGaussianBlur>x</feGaussianBlur>b')`
    → `{ ok: true, content: 'ab', children: [] }` (A5).
21. **Event-handler attribute stripped:** `sanitizePastedHtml('<a href="https://x"
    onclick="alert(1)">link</a>')` → the `a` child's `props` is `{ href:
    'https://x' }` (the `onclick` is stripped — A2).
22. **`javascript:` URL demotes an `a`:** `sanitizePastedHtml('<a
    href="javascript:alert(1)">link</a>')` → `{ ok: true, content: 'link',
    children: [] }` (A3 — the `a` is demoted to plain text, no `a` child, no
    `javascript:` URL).
23. **`vbscript:` URL demotes an `a`:** `sanitizePastedHtml('<a
    href="vbscript:msgbox(1)">link</a>')` → `{ ok: true, content: 'link',
    children: [] }`.
24. **`data:` URL demotes an `a`:** `sanitizePastedHtml('<a
    href="data:text/html,x">link</a>')` → `{ ok: true, content: 'link',
    children: [] }` (A4 — `data:` is never allowed on `a`).
25. **Unsafe `img` `src` drops the `img`:** `sanitizePastedHtml('<img
    src="javascript:alert(1)">')` → `{ ok: true, content: '', children: [] }`
    (A3 — the `img` is dropped).
26. **Non-image `data:` `img` `src` drops the `img`:** `sanitizePastedHtml('<img
    src="data:text/html,x">')` → `{ ok: true, content: '', children: [] }`
    (A4).
27. **Missing `href` demotes an `a`:** `sanitizePastedHtml('<a>link</a>')` →
    `{ ok: true, content: 'link', children: [] }`.
28. **Missing `src` drops an `img`:** `sanitizePastedHtml('<img alt="p">')` →
    `{ ok: true, content: '', children: [] }`.
29. **Dangerous-key attribute stripped:** `sanitizePastedHtml('<a href="https://x"
    __proto__="p">link</a>')` → the `a` child's `props` is `{ href: 'https://x' }`
    (the `__proto__` attribute is stripped — A10).
30. **Determinism:** `sanitizePastedHtml('<strong>bold</strong>')` called twice
    returns the SAME result (deep-equal) both times.
31. **Totality on a malformed string:** `sanitizePastedHtml('<strong>unclosed')`
    (an unclosed tag) → `{ ok: true, ... }` (a sanitized result — the function
    NEVER throws; the unclosed `strong` is handled leniently, e.g. its text
    survives as plain text or as a `strong` child per the parser's lenient
    interpretation).
32. **Totality on garbage:** `sanitizePastedHtml('<<<>>>')` → `{ ok: true, ... }`
    (a sanitized result — never throws).

### 5.7 Fail-states (TestWriter red set — documented fail-states; 8 states)

1. **Non-string input:** `sanitizePastedHtml(undefined)` /
   `sanitizePastedHtml(null)` / `sanitizePastedHtml(42)` /
   `sanitizePastedHtml({})` → `{ ok: false, error: 'sanitizePastedHtml: input
   must be a string' }` (the pinned fail-state — the function guards against a
   non-string rather than throwing).
2. **A `span` child is NEVER emitted:** the output's `children` NEVER contains a
   child with `type: 'span'` (A6) — a pasted `span` is always folded into the
   parent's text. (This is a fail-state the TestWriter asserts the output does
   NOT hit.)
3. **An `on*` attribute NEVER survives:** the output's `html` and every child's
   `props` NEVER contain an attribute whose name starts with `on` (A2).
4. **An unsafe URL NEVER survives:** the output's `html` and every child's
   `props` NEVER contain a `javascript:`/`vbscript:`/`data:` (non-image) URL
   (A3/A4).
5. **A dangerous-key attribute NEVER survives:** the output's children's `props`
   NEVER contain a `__proto__`/`constructor`/`prototype` key (A10).
6. **A disallowed element's content NEVER survives:** a disallowed element
   (script/iframe/svg/etc.) and its content are dropped — the output's `content`
   NEVER includes the disallowed element's text (A1).
7. **The output is ALWAYS a valid `RagNodeChild[]`:** the output's `children`
   ALWAYS passes the Unit M §5.4 `validateNodeShape` (every child has a closed
   `type`, a string `content`, an object-or-absent `props` with no dangerous
   key) and the Unit O §5.3 `setSubtree` validation (A9).
8. **The function NEVER throws:** for ANY string input, the function returns a
   result — it NEVER throws an uncaught exception (A8). The TestWriter asserts
   no string input causes a throw.

### 5.8 Census / numeric claims

- **New pure function:** 1 — `sanitizePastedHtml(rawHtml: string):
  SanitizePasteResult` in `src/main/paste-sanitize.ts`.
- **New result type:** 1 — `SanitizePasteResult` (a discriminated union:
  `{ ok: true; html; content; children }` | `{ ok: false; error }`).
- **New module:** 1 — `src/main/paste-sanitize.ts` (PURE — no Electron, no DOM;
  node-testable).
- **Allowed inline element types:** 4 — `strong`, `em`, `a`, `img` (the closed
  `RagNodeChildType` union, Unit M §5.1). `span` is NOT a child type.
- **Named disallowed elements:** 79 — the closed list in §5.2 (script, iframe,
  object, embed, style, link, meta, base, form, input, button, textarea, select,
  option, svg, math, template, noscript, frame, frameset, applet, audio, video,
  source, track, canvas, map, area, param, portal, dialog, details, summary,
  marquee, blink, xmp, plaintext, listing, keygen, command, menuitem, slot,
  shadow, content, element, custom-element, noembed, noframes, unknown,
  annotation, annotation-xml, foreignObject, desc, title, metadata, defs, g,
  path, rect, circle, ellipse, line, polyline, polygon, text, tspan, use, image,
  symbol, marker, clipPath, mask, pattern, linearGradient, radialGradient, stop,
  filter, view, switch).
- **Disallowed wildcard rules:** 2 — the `fe*` wildcard (any tag starting with
  `fe`, case-insensitive) + the `a`-in-SVG-context rule (subsumed by the `svg`
  removal).
- **`a` kept attributes:** 2 — `href` (required) + `title` (optional). All other
  attributes stripped.
- **`img` kept attributes:** 2 — `src` (required) + `alt` (optional). All other
  attributes stripped.
- **`strong`/`em` kept attributes:** 0 — all attributes stripped (no props).
- **Safe URL schemes:** 3 — `http:`, `https:`, and relative (no scheme). Plus
  the RASTER `data:image/*` carve-out for `img` ONLY (png/jpeg/jpg/gif/webp/bmp/
  avif — URL-F2).
- **Unsafe URL schemes (never emitted):** `javascript:`, `vbscript:`, `data:`
  (non-image), `mailto:`, `ftp:`, `file:`, `blob:`, `about:` (and any other
  scheme not in the safe set).
- **Return-shape fields (on `{ ok: true }`):** 3 — `html` (sanitized HTML),
  `content` (plain text), `children` (`RagNodeChild[]`).
- **`RagNodeChildType` union members:** 4 — UNCHANGED (the sanitizer emits only
  the closed union; `span` is NOT a member — Unit M §5.1).
- **`RagNodeType` union members:** 18 — UNCHANGED (this unit adds no node type).
- **Edit-op census:** 9 — UNCHANGED (this unit adds no edit op; the sanitized
  `children` flows into the existing `setSubtree` op — Unit O).
- **`BatchOp` union members:** 7 — UNCHANGED (this unit adds no batch op).
- **Test count:** 46 — 32 happy-path (§5.6) + 8 fail-state (§5.7) + 1
  module-existence RED + 5 adversarial regression (§3a URL-F1/F2/F3, TOK-F1/F4).

### 5.9 Cross-references

- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types the sanitizer normalizes into — the closed union
  `strong`/`em`/`a`/`img`; `span` NOT a member), §5.4 (the `children` shape
  validation the sanitizer's output must pass — the dangerous-key guard, the
  string `content`, the object-or-absent `props`), §5.2 (the hash-source — the
  sanitized `children` written via `setSubtree` is covered by the SHA-256 hash).
- Unit O: `docs/specs/unit-o-edit-ops.md` §5.3 (the `setSubtree` edit op the
  sanitized `children` flows into — a full replace of a node's inline
  `children`), §5.8 (the `setSubtree` validation the sanitizer's output must
  pass).
- Unit P: `docs/specs/unit-p-ipc-edit-batch.md` (the `IPC_EDIT_BATCH` channel
  the rich-text machinery uses to apply a batch of edits — the sanitized
  `children` is one such edit).
- Unit L: `docs/specs/unit-l-textarea-editing-ui.md` (the plain-text textarea
  editing UI — the current editing surface; the rich-text contenteditable is the
  NEXT step after the textarea, and the paste-time sanitizer is part of that
  machinery).
- Gate: `docs/decisions.md` row **RICH-TEXT-EDITING-GATE** (the resolved design
  this unit pins: inline `strong`/`em`/`a`/`img` on a NEW `children` field;
  `span` NOT a child type; plain-text default / rich-text opt-in; the
  paste-time sanitization must-fix).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SINGLE-WRITER-STORE** (the sanitized `children` flows into the store via the
  `setSubtree` op — a single atomic write), **SUBTREE-OWNERSHIP** (the inline
  `children` are NOT separate RAG nodes), **MCP-UI-EQUIVALENCE** (the sanitizer
  is a PURE function reachable from the UI paste path and any MCP paste-equivalent
  path).
- Pending: `docs/pending.md` (the remaining RICH-TEXT-EDITING-GATE must-fix
  items — retrieval indexing of inline `children` text (Unit Q), traversal
  disambiguation of inline vs doc-children (Unit R), the contenteditable UI +
  the `provident-editable@0.1.0` converter/diff integration — LATER slices, NOT
  this unit).
- Host patterns: `src/main/paste-sanitize.ts` (the NEW pure module — the
  `sanitizePastedHtml` function + the `SanitizePasteResult` type + the internal
  helpers), `src/main/rag-store.ts` (the `RagNodeChild`/`RagNodeChildType` types
  the sanitizer emits), `src/main/edit-ops.ts` (the `setSubtree` op the sanitized
  `children` flows into).
