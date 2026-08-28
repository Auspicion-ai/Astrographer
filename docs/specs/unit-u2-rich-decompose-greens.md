# Unit U2 — Contenteditable-Blur HTML → `RagNodeChild[]` Decomposition: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from
  `docs/specs/unit-u2-rich-decompose.md` — §1.1/§1.2 (signature + return shape +
  totality/fail-state), §1.4 (the closed accepted element set), §1.5 (attribute
  stripping + URL re-validation), §1.6 (child-producing normalization, `b`/`i`
  mapping, `a` demote / `img` drop), §1.7 (flattening + unwrapping + whitespace
  handling), §2.1 (happy-path states), §2.2 (fail-states), §3 (the round-trip
  invariant), §6 (adversarial must-hunt ADR-1..ADR-10 + the F1/F2/F3 host
  findings) — PLUS `docs/specs/editing-mode-toggle-review.md` decision **F**.
  NO implementation reading of `src/main/rich-decompose.ts` or
  `src/main/paste-sanitize.ts`, and NOT a copy of the 64 U2 test names.
- **Source contract:** `docs/specs/unit-u2-rich-decompose.md` §1–§6 + the
  `RagNodeChild`/`RagNodeChildType` data types (`src/main/rag-store.ts` lines
  45–58) + the `isValidChildren` children-shape validation (rag-store line 398:
  closed `strong`/`em`/`a`/`img` type, string `content`, object-or-absent `props`
  with no dangerous key). Scenarios were independently re-derived from the spec,
  not enumerated from the red-set names.
- **Module under test:** `src/main/rich-decompose.ts` — the PURE, TOTAL
  `decomposeRichHtml(rawHtml: string): DecomposeRichResult` function. The module
  was imported live to RUN the scenarios; it was NOT read to derive them.
- **Harness:** a standalone vitest scratch file
  (`tests/_scratch-u2-greens.test.ts`) importing
  `decomposeRichHtml` from `src/main/rich-decompose.js`. Each scenario asserts
  the spec-pinned fields of the returned `DecomposeRichResult` (and, where the
  spec pins it, the validity of the emitted `children` against the
  `RagNodeChild[]` shape). Run: `npx vitest run tests/_scratch-u2-greens.test.ts`.
- **Run:** 35 scenarios — all PASS, 0 fail, 0 skipped. The vitest scratch run
  carried 36 test assertions (the 35 scenarios below + one cross-cutting
  `RagNodeChild[]`-validity assertion across 8 varied inputs, §2.2 state 2). No
  spec-vs-impl drift observed. (The scratch file was deleted after the run.)

Each scenario lists: name, input, expected outcome (from the spec), actual
result, PASS/FAIL.

---

## A. Accepted elements + `b`/`i` mapping + unwrap (§1.4/§1.6/§1.7/§2.1)

### A-H1. Plain text only (§2.1 1)
- **Input:** `'Hello world'`
- **Expected:** `{ ok: true, content: 'Hello world', children: [] }`
- **Actual:** `{ ok: true, content: 'Hello world', children: [] }`
- **Result:** ✅ PASS

### A-H2. Empty input (§2.1 2)
- **Input:** `''`
- **Expected:** `{ ok: true, content: '', children: [] }`
- **Actual:** `{ ok: true, content: '', children: [] }`
- **Result:** ✅ PASS

### A-H3. Whitespace-only input (§2.1 3)
- **Input:** `'   '`
- **Expected:** `{ ok: true, content: '   ', children: [] }` (whitespace preserved as-is)
- **Actual:** `{ ok: true, content: '   ', children: [] }`
- **Result:** ✅ PASS

### A-H4. A single `strong` and a single `em` (§2.1 4/5)
- **Input:** `'<strong>bold</strong><em>italic</em>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }, { type: 'em', content: 'italic' }] }`
- **Actual:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }, { type: 'em', content: 'italic' }] }`
- **Result:** ✅ PASS

### A-H5. `b` → `strong` and `i` → `em` mapping (§2.1 6/7)
- **Input:** `'<b>bold</b><i>italic</i>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }, { type: 'em', content: 'italic' }] }` — NO `b`/`i` child ever emitted (closed `RagNodeChildType` union, §2.2 6).
- **Actual:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }, { type: 'em', content: 'italic' }] }`
- **Result:** ✅ PASS

### A-H6. Text + inline child (text between children folds into `content`) (§2.1 8)
- **Input:** `'Hello <strong>bold</strong> world'`
- **Expected:** `{ ok: true, content: 'Hello  world', children: [{ type: 'strong', content: 'bold' }] }` (text before AND after the child both fold into `content`)
- **Actual:** `{ ok: true, content: 'Hello  world', children: [{ type: 'strong', content: 'bold' }] }`
- **Result:** ✅ PASS

### A-H7. A safe `a` with `href` + `title` (§2.1 9/10)
- **Input:** `'<a href="https://x" title="t">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x', title: 't' }` (both kept; all other attributes stripped)
- **Actual:** the `a` child's `props` is `{ href: 'https://x', title: 't' }`
- **Result:** ✅ PASS

### A-H8. A relative `a` href (§2.1 11)
- **Input:** `'<a href="/path">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: '/path' }` (a relative URL is safe)
- **Actual:** the `a` child's `props` is `{ href: '/path' }`
- **Result:** ✅ PASS

### A-H9. A safe `img` (`src` + `alt`) (§2.1 12)
- **Input:** `'<img src="https://x/i.png" alt="pic">'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }] }` (the emitted `img` child's `content` is ALWAYS `''`, §1.6)
- **Actual:** `{ ok: true, content: '', children: [{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }] }`
- **Result:** ✅ PASS

### A-H10. A safe raster `data:image/*` `img` (§2.1 13)
- **Input:** `'<img src="data:image/png;base64,AAAA" alt="p">'`
- **Expected:** the `img` child's `props` is `{ src: 'data:image/png;base64,AAAA', alt: 'p' }` (the raster `data:image/*` carve-out, `img` only)
- **Actual:** the `img` child's `props` is `{ src: 'data:image/png;base64,AAAA', alt: 'p' }`
- **Result:** ✅ PASS

### A-H11. `u` and `font` unwrapped (§2.1 14/15)
- **Input:** `'<u>underline</u>'` and `'<font color="red">text</font>'`
- **Expected:** both → `{ ok: true, content: 'underline' / 'text', children: [] }` — NO `u`/`font` child; the `font`'s attributes are dropped
- **Actual:** `{ ok: true, content: 'underline', children: [] }` and `{ ok: true, content: 'text', children: [] }`
- **Result:** ✅ PASS

### A-H12. `span` unwrapped (text folded) (§2.1 16/20)
- **Input:** `'a <span>b</span> c'`
- **Expected:** `{ ok: true, content: 'a b c', children: [] }` — NO `span` child (a `span` is never a `RagNodeChild`)
- **Actual:** `{ ok: true, content: 'a b c', children: [] }`
- **Result:** ✅ PASS

### A-H13. `div` and `br` unwrapped (§2.1 17/18)
- **Input:** `'<div>text</div>'` and `'a<br>b'`
- **Expected:** `'<div>text</div>'` → `{ ok: true, content: 'text', children: [] }`; `'a<br>b'` → `{ ok: true, content: 'ab', children: [] }` (a `br` is a void element with no text content — dropped, no `br` child)
- **Actual:** `{ ok: true, content: 'text', children: [] }` and `{ ok: true, content: 'ab', children: [] }`
- **Result:** ✅ PASS

### A-H14. `div` with inline children (unwrap + hoist) (§2.1 19)
- **Input:** `'<div>a <strong>b</strong> c</div>'`
- **Expected:** `{ ok: true, content: 'a  c', children: [{ type: 'strong', content: 'b' }] }`
- **Actual:** `{ ok: true, content: 'a  c', children: [{ type: 'strong', content: 'b' }] }`
- **Result:** ✅ PASS

### A-H15. Nested inline flattening (§2.1 21)
- **Input:** `'<em>italic <strong>bold</strong> tail</em>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'em', content: 'italic  tail' }, { type: 'strong', content: 'bold' }] }` (the inner `strong` is hoisted to a sibling AFTER the outer `em`; the `em`'s content is its direct text nodes)
- **Actual:** `{ ok: true, content: '', children: [{ type: 'em', content: 'italic  tail' }, { type: 'strong', content: 'bold' }] }`
- **Result:** ✅ PASS

### A-H16. Recursive flattening (§2.1 22)
- **Input:** `'<em>a <strong>b <em>c</em></strong> d</em>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'em', content: 'a  d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }`
- **Actual:** `{ ok: true, content: '', children: [{ type: 'em', content: 'a  d' }, { type: 'strong', content: 'b ' }, { type: 'em', content: 'c' }] }`
- **Result:** ✅ PASS

### A-H17. `a` inside `strong` (§2.1 23)
- **Input:** `'<strong>bold <a href="/x">link</a></strong>'`
- **Expected:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold ' }, { type: 'a', content: 'link', props: { href: '/x' } }] }`
- **Actual:** `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold ' }, { type: 'a', content: 'link', props: { href: '/x' } }] }`
- **Result:** ✅ PASS

### A-H18. Outside-accepted element unwrapped to text + hoist (§2.1 38)
- **Input:** `'<p>Hello <strong>world</strong></p>'`
- **Expected:** `{ ok: true, content: 'Hello ', children: [{ type: 'strong', content: 'world' }] }` (the `p` wrapper is dropped, its text folded into `content`, its inline child preserved)
- **Actual:** `{ ok: true, content: 'Hello ', children: [{ type: 'strong', content: 'world' }] }`
- **Result:** ✅ PASS

### A-H19. Text between children (the round-trip case) (§2.1 36)
- **Input:** `'a <strong>b</strong> c <em>d</em> e'`
- **Expected:** `{ ok: true, content: 'a  c  e', children: [{ type: 'strong', content: 'b' }, { type: 'em', content: 'd' }] }` — ALL inter-child text folds into `content`, the inline children collect into `children` in document order
- **Actual:** `{ ok: true, content: 'a  c  e', children: [{ type: 'strong', content: 'b' }, { type: 'em', content: 'd' }] }`
- **Result:** ✅ PASS

### A-H20. `script` content dropped (RAW_TEXT) (§2.1 37 / ADR-3)
- **Input:** `'a<script>alert(1)</script>b'`
- **Expected:** `{ ok: true, content: 'ab', children: [] }` — the tokenizer skips the raw content of `script`, so the script text is NOT available and the element contributes nothing
- **Actual:** `{ ok: true, content: 'ab', children: [] }`
- **Result:** ✅ PASS

### A-H21. Single wrapping `div` root (plain-text round-trip base) (§2.1 35 / §3)
- **Input:** `'<div>plain content</div>'`
- **Expected:** `{ ok: true, content: 'plain content', children: [] }` (a wrapping `<div>` root unwraps like any unwrapped element without disturbing the round-trip)
- **Actual:** `{ ok: true, content: 'plain content', children: [] }`
- **Result:** ✅ PASS

### A-H22. `a` href HTML-entity `&amp;` round-trips decoded (§1.5/§3 idempotency)
- **Input:** `'<a href="/x?a=1&amp;b=2">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: '/x?a=1&b=2' }` — `normalizeUrl` decodes the `&amp;` ref; the NORMALIZED (decoded, unescaped) value is stored so the URL round-trips idempotently (§1.5 `escapeAttr` pin)
- **Actual:** the `a` child's `props` is `{ href: '/x?a=1&b=2' }`
- **Result:** ✅ PASS

---

## B. Fail-states (§2.2)

### B-F1. Non-string input (§2.2 1)
- **Input:** `undefined` / `null` / `42` / `{}`
- **Expected:** each returns `{ ok: false, error: 'decomposeRichHtml: input must be a string' }` (the pinned fail-state — the function guards against a non-string rather than throwing)
- **Actual:** each returns `{ ok: false, error: 'decomposeRichHtml: input must be a string' }`
- **Result:** ✅ PASS

### B-F2. Unsafe `a` href demotes to text (javascript) (§2.1 24 / ADR-2)
- **Input:** `'<a href="javascript:alert(1)">link</a>'`
- **Expected:** `{ ok: true, content: 'link', children: [] }` (no `a` child, no `javascript:` URL survives)
- **Actual:** `{ ok: true, content: 'link', children: [] }`
- **Result:** ✅ PASS

### B-F3. Unsafe `img` src drops the `img` (javascript) (§2.1 25)
- **Input:** `'<img src="javascript:alert(1)">'`
- **Expected:** `{ ok: true, content: '', children: [] }` (the `img` is dropped)
- **Actual:** `{ ok: true, content: '', children: [] }`
- **Result:** ✅ PASS

### B-F4. Missing `href` demotes an `a`; missing `src` drops an `img` (§2.1 26/27)
- **Input:** `'<a>link</a>'` and `'<img alt="p">'`
- **Expected:** `'<a>link</a>'` → `{ ok: true, content: 'link', children: [] }`; `'<img alt="p">'` → `{ ok: true, content: '', children: [] }`
- **Actual:** `{ ok: true, content: 'link', children: [] }` and `{ ok: true, content: '', children: [] }`
- **Result:** ✅ PASS

### B-F5. `on*` attribute NEVER survives (§2.1 28 / ADR-1 / §2.2 3)
- **Input:** `'<a href="https://x" onclick="alert(1)">link</a>'` and `'<img src="https://x/i.png" onerror="alert(1)">'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x' }`; the `img` child's `props` is `{ src: 'https://x/i.png' }` — the `onclick`/`onerror` are stripped (no `on*` attribute ever survives into `props`)
- **Actual:** `{ href: 'https://x' }` and `{ src: 'https://x/i.png' }`
- **Result:** ✅ PASS

### B-F6. `data:` scope (raster-only carve-out, `img` only) (§2.1 30/31 + ADR-8)
- **Input:** `'<a href="data:text/html,x">link</a>'` and `'<img src="data:text/html,x">'` and `'<img src="data:image/svg+xml;base64,AAAA">'`
- **Expected:** the `a` demotes → `{ content: 'link', children: [] }`; the non-image `img` drops → `{ content: '', children: [] }`; the script-capable `data:image/svg+xml` `img` drops → `{ content: '', children: [] }` — `data:` never on `a`, only RASTER `data:image/*` on `img`
- **Actual:** `{ content: 'link', children: [] }`, `{ content: '', children: [] }`, `{ content: '', children: [] }`
- **Result:** ✅ PASS

### B-F7. Dangerous-key attribute stripped (§2.1 29 / §2.2 5)
- **Input:** `'<a href="https://x" __proto__="p" constructor="c" prototype="r">link</a>'`
- **Expected:** the `a` child's `props` is `{ href: 'https://x' }` — no `__proto__`/`constructor`/`prototype` key survives
- **Actual:** the `a` child's `props` is `{ href: 'https://x' }`
- **Result:** ✅ PASS

---

## C. Adversarial / totality / round-trip (§3 + §6)

### C-A1. Determinism (§2.1 32)
- **Input:** `'<strong>bold</strong>'` called twice
- **Expected:** both calls return the SAME result (deep-equal)
- **Actual:** both calls return `{ ok: true, content: '', children: [{ type: 'strong', content: 'bold' }] }` — deep-equal
- **Result:** ✅ PASS

### C-A2. Totality on malformed / garbage / deeply-nested / huge inputs (§2.1 33/34 + ADR-4/5/6)
- **Input:** `'<strong>unclosed'`, `'<<<>>>'`, `'<strong>'.repeat(10000) + 'x' + '</strong>'.repeat(10000)`, `'x'.repeat(1000000)`
- **Expected:** each returns `{ ok: true, ... }` — the function NEVER throws for ANY string input (lenient tokenizer; iterative traversal must not throw a `RangeError`)
- **Actual:** all four return `{ ok: true, ... }` — no throw
- **Result:** ✅ PASS

### C-A3. `img` trailing-text recovery (F2) (§1.6 / F2 / ADR-12)
- **Input:** kept: `'Hello <img src="https://x/i.png"> world'`; dropped: `'Hello <img src="javascript:x"> world'`
- **Expected:** kept → `{ ok: true, content: 'Hello  world', children: [{ type: 'img', content: '', props: { src: 'https://x/i.png' } }] }`; dropped → `{ ok: true, content: 'Hello  world', children: [] }` — the tokenizer-attached trailing text is RECOVERED into the parent `content` in both cases (F2; a dropped `img` still recovers its attached text)
- **Actual:** `{ content: 'Hello  world', children: [img(...)] }` and `{ content: 'Hello  world', children: [] }`
- **Result:** ✅ PASS

### C-A4. Out-of-range HTML ref totality (F1 / ADR-11)
- **Input:** `'<a href="https://x?a=&#x110000;">link</a>'` (and a lone-surrogate `&#xD800;` variant)
- **Expected:** the function NEVER throws (`String.fromCodePoint` guard leaves the out-of-range/lone-surrogate ref literal un-decoded); `{ ok: true, ... }` with an `a` child whose `props.href` retains the `https://x?a=` form (the literal is preserved)
- **Actual:** `{ ok: true, ... }` — no throw; the `a` child's `props.href` is `'https://x?a=&#x110000;'` (literal preserved)
- **Result:** ✅ PASS

### C-A5. Round-trip invariant on a rich root (§3)
- **Input:** `'Hello<strong>bold</strong><a href="/x">link</a>'` (the CANONICAL render of a root with `content: 'Hello'` + `children: [strong('bold'), a('link',{href:'/x'})]`)
- **Expected:** `{ ok: true, content: 'Hello', children: [{ type: 'strong', content: 'bold' }, { type: 'a', content: 'link', props: { href: '/x' } }] }` — decompose reproduces the root's `content` + `children` EXACTLY (deep-equal), including text between children folding into `content`
- **Actual:** `{ ok: true, content: 'Hello', children: [{ type: 'strong', content: 'bold' }, { type: 'a', content: 'link', props: { href: '/x' } }] }`
- **Result:** ✅ PASS

### C-A6. Control characters in text preserved as-is (§6 ADR-10)
- **Input:** `'\u0000foo\u0001'`
- **Expected:** `{ ok: true, content: '\u0000foo\u0001', children: [] }` — control characters in TEXT NODES are preserved as-is (no stripping; the C0/space trim applies only to URL VALUES in `normalizeUrl`)
- **Actual:** `{ ok: true, content: '\u0000foo\u0001', children: [] }`
- **Result:** ✅ PASS

---

## D. Run record

| # | Scenario | Result |
| --- | --- | --- |
| A-H1 | Plain text only (§2.1 1) | ✅ PASS |
| A-H2 | Empty input (§2.1 2) | ✅ PASS |
| A-H3 | Whitespace-only input (§2.1 3) | ✅ PASS |
| A-H4 | `strong` + `em` (§2.1 4/5) | ✅ PASS |
| A-H5 | `b` → `strong` + `i` → `em` mapping (§2.1 6/7) | ✅ PASS |
| A-H6 | Text + inline child (§2.1 8) | ✅ PASS |
| A-H7 | Safe `a` (`href` + `title`) (§2.1 9/10) | ✅ PASS |
| A-H8 | Relative `a` href (§2.1 11) | ✅ PASS |
| A-H9 | Safe `img` (`src` + `alt`) (§2.1 12) | ✅ PASS |
| A-H10 | Raster `data:image/*` `img` (§2.1 13) | ✅ PASS |
| A-H11 | `u` + `font` unwrapped (§2.1 14/15) | ✅ PASS |
| A-H12 | `span` unwrapped (§2.1 16/20) | ✅ PASS |
| A-H13 | `div` + `br` unwrapped (§2.1 17/18) | ✅ PASS |
| A-H14 | `div` with inline children (§2.1 19) | ✅ PASS |
| A-H15 | Nested inline flattening (§2.1 21) | ✅ PASS |
| A-H16 | Recursive flattening (§2.1 22) | ✅ PASS |
| A-H17 | `a` inside `strong` (§2.1 23) | ✅ PASS |
| A-H18 | Outside-accepted unwrapped + hoist (§2.1 38) | ✅ PASS |
| A-H19 | Text between children (§2.1 36) | ✅ PASS |
| A-H20 | `script` RAW_TEXT dropped (§2.1 37 / ADR-3) | ✅ PASS |
| A-H21 | Single wrapping `div` root (§2.1 35 / §3) | ✅ PASS |
| A-H22 | `a` href `&amp;` decoded (idempotency, §1.5/§3) | ✅ PASS |
| B-F1 | Non-string input (§2.2 1) | ✅ PASS |
| B-F2 | Unsafe `a` href demotes (javascript, §2.1 24 / ADR-2) | ✅ PASS |
| B-F3 | Unsafe `img` src drops (javascript, §2.1 25) | ✅ PASS |
| B-F4 | Missing `href`/`src` (§2.1 26/27) | ✅ PASS |
| B-F5 | `on*` attribute stripped (§2.1 28 / ADR-1 / §2.2 3) | ✅ PASS |
| B-F6 | `data:` scope (§2.1 30/31 + ADR-8) | ✅ PASS |
| B-F7 | Dangerous-key attribute stripped (§2.1 29 / §2.2 5) | ✅ PASS |
| C-A1 | Determinism (§2.1 32) | ✅ PASS |
| C-A2 | Totality (malformed/garbage/deep/huge, §2.1 33/34 + ADR-4/5/6) | ✅ PASS |
| C-A3 | `img` trailing-text recovery (F2 / ADR-12) | ✅ PASS |
| C-A4 | Out-of-range HTML ref totality (F1 / ADR-11) | ✅ PASS |
| C-A5 | Round-trip invariant on a rich root (§3) | ✅ PASS |
| C-A6 | Control chars preserved as-is (ADR-10) | ✅ PASS |

**Run summary:** 35 scenarios — 35 pass, 0 fail, 0 skipped (plus the cross-cutting
`RagNodeChild[]`-validity assertion — 36 vitest assertions total, all pass).

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-u2-rich-decompose.md` §1–§6 (the closed accepted element set
  with `b`/`i`→`strong`/`em` mapping and `u`/`font`/`span`/`div`/`br` + outside
  unwrap, the attribute-stripping + URL re-validation with `data:` raster-only
  carve-out scoped to `img`, the `a` demote / `img` drop, the nested flattening +
  recursive hoisting, the text-between-children `content` fold, the RAW_TEXT
  `script` drop, the pinned non-string fail-state, and the totality contract)
  passed against the live `src/main/rich-decompose.ts`. The F2 `img` trailing-
  text recovery and the F1 out-of-range HTML-ref totality guard both behave as
  the §6 host-fix records pin. The rich-root round-trip invariant (§3) holds.
  The output `children` satisfies the `RagNodeChild[]` shape (closed
  `strong`/`em`/`a`/`img` type, string `content`, object-or-absent `props` with
  no dangerous key) per §2.2 state 2.

### Test-authoring notes (not drifts)

- **A-H4/A-H5 (combined element scenarios).** The happy-path states are grouped
  where multiple spec states share one input (e.g. a single input exercising
  both `strong` and `em`, or both `b`→`strong` and `i`→`em`); each asserted child
  matches the spec-pinned shape.
- **C-A4 (out-of-range ref).** The spec pins the F1 guard as "leave the literal
  un-decoded" (§6 F1), so the expected `props.href` is the literal
  `https://x?a=&#x110000;` (the https scheme keeps the `a` safe and non-demoted).
  The load-bearing assertion is totality (never throws) + the https `a` surviving.
- **B-F5/B-F6/B-F7 (combined fail-states).** Multiple inputs are asserted under
  one scenario header where they share the same pinned guarantee (no `on*` /
  no unsafe URL / no dangerous key / `data:` scope).
