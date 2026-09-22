# Unit S — Paste-Time Sanitization: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-s-paste-sanitization.md` + `docs/specs/unit-m-children-field.md`
  ONLY — no implementation reading of `src/main/paste-sanitize.ts`).
- **Source contract:** `docs/specs/unit-s-paste-sanitization.md` §5.6 (the 32
  happy-path states) + §5.7 (the 8 fail-states) + §5.1 (the signature + return
  shape + totality/fail-state) + §5.2 (disallowed-element removal) + §5.3
  (allowed-inline normalization) + §5.4 (attribute stripping + URL safety) +
  §5.5 (flattening + unwrapping) + §3a (the adversarial pins A1–A10 the contract
  pins + the adversarial regression findings URL-F1/F2/F3, TOK-F1/F4). The
  output's `children` must also pass the Unit M §5.1/§5.4
  `RagNodeChild` shape + `children` validation (the closed
  `strong`/`em`/`a`/`img` union, string `content`, object-or-absent `props`,
  no dangerous key, no `span` child).
- **Modules under test:** `src/main/paste-sanitize.ts` (the PURE
  `sanitizePastedHtml(rawHtml: string): SanitizePasteResult` function). The
  module was imported live to RUN the scenarios; it was NOT read to derive them.
- **Harness:** a standalone ESM script importing
  `sanitizePastedHtml` from `src/main/paste-sanitize.ts` (Node 24 type-stripping
  runs the `.ts` directly). Each scenario asserts the spec-pinned fields of the
  returned `SanitizePasteResult`.
- **Run:** 46 scenarios — 46 pass, 0 fail, 0 skipped. No spec-vs-impl drift
  observed.

Each scenario lists: name, input, expected outcome (from the spec), actual
result, PASS/FAIL.

---

## A. §5.6 Happy-path states (32)

### H1. Plain text only (§5.6 1)
- **Input:** `'Hello world'`
- **Expected:** `{ ok: true, html: 'Hello world', content: 'Hello world', children: [] }`
- **Actual:** `{ ok: true, html: 'Hello world', content: 'Hello world', children: [] }`
- **Result:** ✅ PASS

### H2. Empty input (§5.6 2)
- **Input:** `''`
- **Expected:** `{ ok: true, html: '', content: '', children: [] }`
- **Actual:** `{ ok: true, html: '', content: '', children: [] }`
- **Result:** ✅ PASS

### H3. Whitespace-only input (§5.6 3)
- **Input:** `'   '`
- **Expected:** `{ ok: true, html: '   ', content: '   ', children: [] }` (whitespace preserved as-is)
- **Actual:** `{ ok: true, html: '   ', content: '   ', children: [] }`
- **Result:** ✅ PASS

### H4. A single `strong` (§5.6 4)
- **Input:** `'<strong>bold</strong>'`
- **Expected:** `{ ok: true, html: '<strong>bold</strong>', content: '', children: [{ type: 'strong', content: 'bold' }] }`
- **Actual:** `{ ok: true, html: '<strong>bold</strong>', content: '', children: [{ type: 'strong', content: 'bold' }] }`
- **Result:** ✅ PASS

### H5. A single `em` (§5.6 5)
- **Input:** `'<em>italic</em>'`
- **Expected:** `{ ok: true, html: '<em>italic</em>', content: '', children: [{ type: 'em', content: 'italic' }] }`
- **Actual:** `{ ok: true, html: '<em>italic</em>', content: '', children: [{ type: 'em', content: 'italic' }] }`
- **Result:** ✅ PASS

### H6. Text + inline child (§5.6 6)
- **Input:** `'Hello <strong>bold</strong> world'`
- **Expected:** `{ ok: true, html: 'Hello <strong>bold</strong> world', content: 'Hello  world', children: [{ type: 'strong', content: 'bold' }] }`
- **Actual:** `{ ok: true, html: 'Hello <strong>bold</strong> world', content: 'Hello  world', children: [{ type: 'strong', content: 'bold' }] }`
- **Result:** ✅ PASS

### H7. A safe `a` (§5.6 7)
- **Input:** `'<a href="https://x">link</a>'`
- **Expected:** `{ ok: true, html: '<a href="https://x">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }`
- **Actual:** `{ ok: true, html: '<a href="https://x">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }`
- **Result:** ✅ PASS

### H8. An `a` with `title` (§5.6 8)
- **Input:** `'<a href="https://x" title="t">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x', title: 't' }` (both kept; all other attributes stripped)
- **Actual:** `{ ok: true, html: '<a href="https://x" title="t">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x', title: 't' } }] }`
- **Result:** ✅ PASS

### H9. A relative `a` href (§5.6 9)
- **Input:** `'<a href="/path">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: '/path' }` (a relative URL is safe)
- **Actual:** `{ ok: true, html: '<a href="/path">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: '/path' } }] }`
- **Result:** ✅ PASS

### H10. A safe `img` (§5.6 10)
- **Input:** `'<img src="https://x/i.png" alt="pic">'`
- **Expected:** `{ ok: true, html: '<img src="https://x/i.png" alt="pic">', content: '', children: [{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }] }`
- **Actual:** `{ ok: true, html: '<img src="https://x/i.png" alt="pic">', content: '', children: [{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }] }`
- **Result:** ✅ PASS

### H11. A safe `data:image/*` `img` (§5.6 11)
- **Input:** `'<img src="data:image/png;base64,AAAA" alt="p">'`
- **Expected:** the `img` child's `props` is `{ src: 'data:image/png;base64,AAAA', alt: 'p' }` (the `data:image/*` carve-out — A4)
- **Actual:** `{ ok: true, html: '<img src="data:image/png;base64,AAAA" alt="p">', content: '', children: [{ type: 'img', content: '', props: { src: 'data:image/png;base64,AAAA', alt: 'p' } }] }`
- **Result:** ✅ PASS

### H12. `span` folded into the parent's text (§5.6 12)
- **Input:** `'a <span>b</span> c'`
- **Expected:** `{ ok: true, content: 'a b c', children: [] }` (the `span`'s text is folded into the parent's `content`, NO `span` child — A6). The spec pins `content` + `children` only; the `html` field is not pinned here.
- **Actual:** `{ ok: true, html: 'a b c', content: 'a b c', children: [] }` (the `span` wrapper is dropped; the `html` is text-only, consistent with §5.1)
- **Result:** ✅ PASS

### H13. Nested inline flattening (§5.6 13)
- **Input:** `'<em>italic <strong>bold</strong> tail</em>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'em', content: 'italic  tail' }, { type: 'strong', content: 'bold' }] }` (A7 — the inner `strong` is hoisted to a sibling, the outer `em`'s content is the concatenation of its direct text nodes)
- **Actual:** `{ ok: true, html: '<em>italic <strong>bold</strong> tail</em>', content: '', children: [{ type: 'em', content: 'italic  tail' }, { type: 'strong', content: 'bold' }] }`
- **Result:** ✅ PASS

### H14. Recursive flattening (§5.6 14)
- **Input:** `'<em>a <strong>b <em>c</em></strong> d</em>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'em', content: 'a  d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }` (A7 — recursive)
- **Actual:** `{ ok: true, html: '<em>a <strong>b <em>c</em></strong> d</em>', content: '', children: [{ type: 'em', content: 'a  d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }`
- **Result:** ✅ PASS

### H15. Unwrapped block element (§5.6 15)
- **Input:** `'<p>Hello <strong>world</strong></p>'`
- **Expected:** `{ ok: true, content: 'Hello ', children: [{ type: 'strong', content: 'world' }] }` (the `p` wrapper is dropped, its text + inline children preserved). The spec pins `content` + `children` only; the `html` field is not pinned here.
- **Actual:** `{ ok: true, html: 'Hello <strong>world</strong>', content: 'Hello ', children: [{ type: 'strong', content: 'world' }] }` (the `p` wrapper is dropped; the `html` is text + `strong`, consistent with §5.1)
- **Result:** ✅ PASS

### H16. `script` removed entirely (§5.6 16)
- **Input:** `'a<script>alert(1)</script>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }` (A1 — the script AND its content are dropped)
- **Actual:** `{ ok: true, html: 'ab', content: 'ab', children: [] }`
- **Result:** ✅ PASS

### H17. `style` removed entirely (§5.6 17)
- **Input:** `'a<style>body{}</style>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }`
- **Actual:** `{ ok: true, html: 'ab', content: 'ab', children: [] }`
- **Result:** ✅ PASS

### H18. `iframe` removed entirely (§5.6 18)
- **Input:** `'a<iframe src="https://x"></iframe>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }`
- **Actual:** `{ ok: true, html: 'ab', content: 'ab', children: [] }`
- **Result:** ✅ PASS

### H19. `svg` removed entirely (including nested `a`) (§5.6 19)
- **Input:** `'a<svg><a href="https://x">s</a></svg>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }` (the `a`-in-SVG-context rule — subsumed by the `svg` removal)
- **Actual:** `{ ok: true, html: 'ab', content: 'ab', children: [] }`
- **Result:** ✅ PASS

### H20. `fe*` wildcard removed (§5.6 20)
- **Input:** `'a<feGaussianBlur>x</feGaussianBlur>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }` (A5)
- **Actual:** `{ ok: true, html: 'ab', content: 'ab', children: [] }`
- **Result:** ✅ PASS

### H21. Event-handler attribute stripped (§5.6 21)
- **Input:** `'<a href="https://x" onclick="alert(1)">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x' }` (the `onclick` is stripped — A2)
- **Actual:** `{ ok: true, html: '<a href="https://x">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }`
- **Result:** ✅ PASS

### H22. `javascript:` URL demotes an `a` (§5.6 22)
- **Input:** `'<a href="javascript:alert(1)">link</a>'`
- **Expected:** `{ ok: true, content: 'link', children: [] }` (A3 — the `a` is demoted to plain text, no `a` child, no `javascript:` URL)
- **Actual:** `{ ok: true, html: 'link', content: 'link', children: [] }`
- **Result:** ✅ PASS

### H23. `vbscript:` URL demotes an `a` (§5.6 23)
- **Input:** `'<a href="vbscript:msgbox(1)">link</a>'`
- **Expected:** `{ ok: true, content: 'link', children: [] }`
- **Actual:** `{ ok: true, html: 'link', content: 'link', children: [] }`
- **Result:** ✅ PASS

### H24. `data:` URL demotes an `a` (§5.6 24)
- **Input:** `'<a href="data:text/html,x">link</a>'`
- **Expected:** `{ ok: true, content: 'link', children: [] }` (A4 — `data:` is never allowed on `a`)
- **Actual:** `{ ok: true, html: 'link', content: 'link', children: [] }`
- **Result:** ✅ PASS

### H25. Unsafe `img` `src` drops the `img` (§5.6 25)
- **Input:** `'<img src="javascript:alert(1)">'`
- **Expected:** `{ ok: true, content: '', children: [] }` (A3 — the `img` is dropped)
- **Actual:** `{ ok: true, html: '', content: '', children: [] }`
- **Result:** ✅ PASS

### H26. Non-image `data:` `img` `src` drops the `img` (§5.6 26)
- **Input:** `'<img src="data:text/html,x">'`
- **Expected:** `{ ok: true, content: '', children: [] }` (A4)
- **Actual:** `{ ok: true, html: '', content: '', children: [] }`
- **Result:** ✅ PASS

### H27. Missing `href` demotes an `a` (§5.6 27)
- **Input:** `'<a>link</a>'`
- **Expected:** `{ ok: true, content: 'link', children: [] }`
- **Actual:** `{ ok: true, html: 'link', content: 'link', children: [] }`
- **Result:** ✅ PASS

### H28. Missing `src` drops an `img` (§5.6 28)
- **Input:** `'<img alt="p">'`
- **Expected:** `{ ok: true, content: '', children: [] }`
- **Actual:** `{ ok: true, html: '', content: '', children: [] }`
- **Result:** ✅ PASS

### H29. Dangerous-key attribute stripped (§5.6 29)
- **Input:** `'<a href="https://x" __proto__="p">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x' }` (the `__proto__` attribute is stripped — A10)
- **Actual:** `{ ok: true, html: '<a href="https://x">link</a>', content: '', children: [{ type: 'a', content: 'link', props: { href: 'https://x' } }] }`
- **Result:** ✅ PASS

### H30. Determinism (§5.6 30)
- **Input:** `'<strong>bold</strong>'` called twice
- **Expected:** both calls return the SAME result (deep-equal)
- **Actual:** both calls return `{ ok: true, html: '<strong>bold</strong>', content: '', children: [{ type: 'strong', content: 'bold' }] }` — deep-equal
- **Result:** ✅ PASS

### H31. Totality on a malformed string (§5.6 31)
- **Input:** `'<strong>unclosed'` (an unclosed tag)
- **Expected:** `{ ok: true, ... }` (a sanitized result — the function NEVER throws; the unclosed `strong` is handled leniently)
- **Actual:** `{ ok: true, ... }` — no throw
- **Result:** ✅ PASS

### H32. Totality on garbage (§5.6 32)
- **Input:** `'<<<>>>'`
- **Expected:** `{ ok: true, ... }` (a sanitized result — never throws)
- **Actual:** `{ ok: true, ... }` — no throw
- **Result:** ✅ PASS

---

## B. §5.7 Fail-states (8)

### F1. Non-string input (§5.7 1)
- **Input:** `undefined` / `null` / `42` / `{}`
- **Expected:** each returns `{ ok: false, error: 'sanitizePastedHtml: input must be a string' }` (the pinned fail-state — the function guards against a non-string rather than throwing)
- **Actual:** each returns `{ ok: false, error: 'sanitizePastedHtml: input must be a string' }`
- **Result:** ✅ PASS

### F2. A `span` child is NEVER emitted (§5.7 2)
- **Input:** `'a <span>b</span> c'`
- **Expected:** the output's `children` NEVER contains a child with `type: 'span'` (A6) — a pasted `span` is always folded into the parent's text
- **Actual:** `children` is `[]` — no `span` child
- **Result:** ✅ PASS

### F3. An `on*` attribute NEVER survives (§5.7 3)
- **Input:** `'<a href="https://x" onclick="a" onerror="b">link</a>'`
- **Expected:** the output's `html` and every child's `props` NEVER contain an attribute whose name starts with `on` (A2)
- **Actual:** `html` is `'<a href="https://x">link</a>'`; the child's `props` is `{ href: 'https://x' }` — no `on*` attribute survives
- **Result:** ✅ PASS

### F4. An unsafe URL NEVER survives (§5.7 4)
- **Input:** `'<a href="javascript:alert(1)">x</a><img src="data:text/html,y">'`
- **Expected:** the output's `html` and every child's `props` NEVER contain a `javascript:`/`vbscript:`/`data:` (non-image) URL (A3/A4)
- **Actual:** the `a` is demoted to text, the `img` is dropped — no unsafe URL in `html` or `props`
- **Result:** ✅ PASS

### F5. A dangerous-key attribute NEVER survives (§5.7 5)
- **Input:** `'<a href="https://x" __proto__="p" constructor="c" prototype="r">link</a>'`
- **Expected:** the output's children's `props` NEVER contain a `__proto__`/`constructor`/`prototype` key (A10)
- **Actual:** the child's `props` is `{ href: 'https://x' }` — no dangerous key survives
- **Result:** ✅ PASS

### F6. A disallowed element's content NEVER survives (§5.7 6)
- **Input:** `'a<script>alert(1)</script><style>body{}</style><iframe>f</iframe>b'`
- **Expected:** a disallowed element (script/iframe/svg/etc.) and its content are dropped — the output's `content` NEVER includes the disallowed element's text (A1)
- **Actual:** `content` is `'ab'` — no disallowed element's text survives
- **Result:** ✅ PASS

### F7. The output is ALWAYS a valid `RagNodeChild[]` (§5.7 7)
- **Input:** `'<em>a <strong>b</strong></em><a href="https://x">l</a><img src="https://x/i.png" alt="p">'`
- **Expected:** the output's `children` ALWAYS passes the Unit M §5.4 `validateNodeShape` (every child has a closed `type`, a string `content`, an object-or-absent `props` with no dangerous key) and the Unit O §5.3 `setSubtree` validation (A9)
- **Actual:** every child has a `type` in `{strong, em, a, img}`, a string `content`, and an object-or-absent `props` — valid `RagNodeChild[]`
- **Result:** ✅ PASS

### F8. The function NEVER throws (§5.7 8)
- **Input:** 8 varied string inputs — `''`, `'   '`, `'<<<>>>'`, `'<strong>unclosed'`, `'<script>alert(1)</script>'`, `'a<b>c'`, `'<a href="javascript:x">y</a>'`, `'x'.repeat(100000)`
- **Expected:** for ANY string input, the function returns a result — it NEVER throws an uncaught exception (A8)
- **Actual:** no input caused a throw
- **Result:** ✅ PASS

---

## C. Adversarial regression + RED scenarios (§3a)

### AR1. URL-F1 — leading C0-control/space before a scheme is rejected
- **Input:** `'<a href=" javascript:alert(1)">link</a>'` (and `\u0000`/`\t`/`\n`/`\r` prefixes) + the same prefixes on an `img` `src`
- **Expected:** the `a` is demoted to plain text (content `'link'`, no `a` child); the `img` is dropped (no `img` child) — URL-F1
- **Actual:** the `a` demotes to text, the `img` drops — no unsafe URL survives
- **Result:** ✅ PASS

### AR2. URL-F2 — script-capable `data:image` subtypes drop the `img`; raster subtypes survive
- **Input:** `'<img src="data:image/svg+xml;base64,AAAA">'` (and `html`/`xml`/`text`) → dropped; `'<img src="data:image/png;base64,AAAA">'` (and `jpeg`/`jpg`/`gif`/`webp`/`bmp`/`avif`) → survives
- **Expected:** script-capable subtypes drop the `img`; raster subtypes survive — URL-F2
- **Actual:** `svg+xml`/`html`/`xml`/`text` drop the `img`; `png`/`jpeg`/`jpg`/`gif`/`webp`/`bmp`/`avif` survive
- **Result:** ✅ PASS

### AR3. URL-F3 — HTML character references in a URL are decoded before validation (all rejected)
- **Input:** `'<a href="&#106;avascript:alert(1)">link</a>'` (and `javascript&#58;`, `&#106;&#97;vascript:`) + the same on an `img` `src`
- **Expected:** the `a` is demoted to plain text, the `img` is dropped — all rejected — URL-F3
- **Actual:** all rejected — no `a`/`img` child survives
- **Result:** ✅ PASS

### AR4. TOK-F1 — deeply-nested inline input (10k deep) never throws (totality)
- **Input:** `'<strong>'.repeat(10000) + 'x' + '</strong>'.repeat(10000)`
- **Expected:** returns `{ ok: true, ... }` — no throw — TOK-F1
- **Actual:** `{ ok: true, ... }` — no throw
- **Result:** ✅ PASS

### AR5. TOK-F4 — `noembed`/`noframes` are disallowed; their content is dropped
- **Input:** `'a<noembed>secret</noembed>b'` and `'a<noframes>secret</noframes>b'`
- **Expected:** content is `'ab'`, no `'secret'` — TOK-F4
- **Actual:** content is `'ab'` — no `'secret'`
- **Result:** ✅ PASS

### RED. Module-existence test
- **Input:** `sanitizePastedHtml` imported from `src/main/paste-sanitize.ts`
- **Expected:** `typeof sanitizePastedHtml === 'function'` (the module exists)
- **Actual:** `typeof sanitizePastedHtml === 'function'`
- **Result:** ✅ PASS

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Plain text only (§5.6 1) | ✅ PASS |
| H2 | Empty input (§5.6 2) | ✅ PASS |
| H3 | Whitespace-only input (§5.6 3) | ✅ PASS |
| H4 | A single `strong` (§5.6 4) | ✅ PASS |
| H5 | A single `em` (§5.6 5) | ✅ PASS |
| H6 | Text + inline child (§5.6 6) | ✅ PASS |
| H7 | A safe `a` (§5.6 7) | ✅ PASS |
| H8 | An `a` with `title` (§5.6 8) | ✅ PASS |
| H9 | A relative `a` href (§5.6 9) | ✅ PASS |
| H10 | A safe `img` (§5.6 10) | ✅ PASS |
| H11 | A safe `data:image/*` `img` (§5.6 11) | ✅ PASS |
| H12 | `span` folded into the parent's text (§5.6 12) | ✅ PASS |
| H13 | Nested inline flattening (§5.6 13) | ✅ PASS |
| H14 | Recursive flattening (§5.6 14) | ✅ PASS |
| H15 | Unwrapped block element (§5.6 15) | ✅ PASS |
| H16 | `script` removed entirely (§5.6 16) | ✅ PASS |
| H17 | `style` removed entirely (§5.6 17) | ✅ PASS |
| H18 | `iframe` removed entirely (§5.6 18) | ✅ PASS |
| H19 | `svg` removed entirely (incl. nested `a`) (§5.6 19) | ✅ PASS |
| H20 | `fe*` wildcard removed (§5.6 20) | ✅ PASS |
| H21 | Event-handler attribute stripped (§5.6 21) | ✅ PASS |
| H22 | `javascript:` URL demotes an `a` (§5.6 22) | ✅ PASS |
| H23 | `vbscript:` URL demotes an `a` (§5.6 23) | ✅ PASS |
| H24 | `data:` URL demotes an `a` (§5.6 24) | ✅ PASS |
| H25 | Unsafe `img` `src` drops the `img` (§5.6 25) | ✅ PASS |
| H26 | Non-image `data:` `img` `src` drops the `img` (§5.6 26) | ✅ PASS |
| H27 | Missing `href` demotes an `a` (§5.6 27) | ✅ PASS |
| H28 | Missing `src` drops an `img` (§5.6 28) | ✅ PASS |
| H29 | Dangerous-key attribute stripped (§5.6 29) | ✅ PASS |
| H30 | Determinism (§5.6 30) | ✅ PASS |
| H31 | Totality on a malformed string (§5.6 31) | ✅ PASS |
| H32 | Totality on garbage (§5.6 32) | ✅ PASS |
| F1 | Non-string input (§5.7 1) | ✅ PASS |
| F2 | A `span` child is NEVER emitted (§5.7 2) | ✅ PASS |
| F3 | An `on*` attribute NEVER survives (§5.7 3) | ✅ PASS |
| F4 | An unsafe URL NEVER survives (§5.7 4) | ✅ PASS |
| F5 | A dangerous-key attribute NEVER survives (§5.7 5) | ✅ PASS |
| F6 | A disallowed element's content NEVER survives (§5.7 6) | ✅ PASS |
| F7 | The output is ALWAYS a valid `RagNodeChild[]` (§5.7 7) | ✅ PASS |
| F8 | The function NEVER throws (§5.7 8) | ✅ PASS |
| AR1 | URL-F1 — leading C0-control/space scheme bypass rejected (§3a) | ✅ PASS |
| AR2 | URL-F2 — raster-only `data:image/*` carve-out (§3a) | ✅ PASS |
| AR3 | URL-F3 — HTML character-reference decoding before validation (§3a) | ✅ PASS |
| AR4 | TOK-F1 — 10k-deep nested input never throws (§3a) | ✅ PASS |
| AR5 | TOK-F4 — `noembed`/`noframes` disallowed (§3a) | ✅ PASS |
| RED | Module-existence test | ✅ PASS |

**Run summary:** 46 scenarios — 46 pass, 0 fail, 0 skipped.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-s-paste-sanitization.md` §5.6/§5.7 (plus the §5.1 signature +
  return shape + totality/fail-state, the §5.2 disallowed-element removal, the
  §5.3 allowed-inline normalization, the §5.4 attribute stripping + URL safety,
  the §5.5 flattening + unwrapping, and the §3a adversarial pins A1–A10) passed
  against the live `src/main/paste-sanitize.ts`. The function is PURE and TOTAL
  (§5.6 31/32, §5.7 8), returns the pinned fail-state for a non-string input
  (§5.7 1), removes script/style/iframe/svg/`fe*` entirely (§5.6 16–20, §5.7 6),
  normalizes `strong`/`em`/`a`/`img` into a valid `RagNodeChild[]` with the
  closed union + string `content` + object-or-absent `props` (§5.6 4–11, §5.7 7),
  folds `span` into the parent's text with no `span` child (§5.6 12, §5.7 2),
  flattens nested inline elements per the pinned rule (§5.6 13/14), unwraps
  block elements (§5.6 15), strips `on*`/dangerous-key attributes (§5.6 21/29,
  §5.7 3/5), and neutralizes `javascript:`/`vbscript:`/`data:` URLs with the
  `data:image/*` carve-out scoped to `img` only (§5.6 22–26, §5.7 4). The
  adversarial regression scenarios (AR1–AR5) confirm the §3a fixes: leading
  C0-control/space scheme bypass rejected (URL-F1), the raster-only
  `data:image/*` carve-out (URL-F2), HTML character-reference decoding before
  validation (URL-F3), the iterative 10k-deep normalization that never throws
  (TOK-F1), and `noembed`/`noframes` disallowed (TOK-F4). No spec-vs-impl drift
  was observed.

### Test-authoring notes (not drifts)

- **H12/H15 (`html` field not pinned).** The spec §5.6 12/15 pins only the
  `content` + `children` fields for the `span`-fold and unwrapped-block
  scenarios — it does NOT pin the `html` field. The actual `html` output
  (`'a b c'` for the `span` fold; `'Hello <strong>world</strong>'` for the
  unwrapped `p`) is consistent with §5.1 ("the sanitized HTML string — safe,
  order-preserving, containing ONLY `strong`/`em`/`a`/`img` + text"): the
  `span`/`p` wrappers are dropped, leaving only text + allowed inline elements.
  These scenarios are asserted on the spec-pinned fields only.
- **F7 (valid `RagNodeChild[]`).** The output's `children` is checked against
  the Unit M §5.1/§5.4 shape — every child has a `type` in the closed
  `strong`/`em`/`a`/`img` union, a string `content`, and an object-or-absent
  `props` with no dangerous key, and no `span` child is emitted (A9).
- **F8 (never throws).** The throw-check covers a broad set of string inputs
  (empty, whitespace, garbage, unclosed tags, disallowed elements, unsafe URLs,
  and a 100k-char string) to exercise the totality contract (A8).
- **H30 (determinism).** Two calls with the same input are deep-compared — the
  direct node-testable proxy for the §5.1 determinism claim.
