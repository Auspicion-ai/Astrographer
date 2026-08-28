// tests/unit-u2-rich-decompose.test.ts — Unit U2: contenteditable-blur HTML →
// `RagNodeChild[]` decomposition (pure) — docs/specs/unit-u2-rich-decompose.md
// §2.1 happy-path states (38) + §2.2 fail-states (8) + §1.3 additive exports (5)
// + §6 adversarial regression ADR-1..ADR-10 (10) + the module-existence RED (1).
//
// This is the TestWriter RED set — the U2 module does NOT exist yet:
//
//   - `src/main/rich-decompose.ts` does NOT exist, so the import of
//     `decomposeRichHtml`/`DecomposeRichResult` FAILS at module load → the
//     WHOLE suite is red (the expected red set).
//   - `src/main/paste-sanitize.ts` does NOT yet export `parseHtml`/`normalizeUrl`/
//     `isSafeUrl`/`escapeAttr`/`HtmlText`/`HtmlElement`/`HtmlNode` (they are
//     still PRIVATE), so the additive-export import also FAILS → those 5 tests
//     are red too.
//
// The tests are derived from the spec ALONE (§2/§1.3/§6). The function is PURE
// (no Electron, no DOM — it operates on an HTML string), so the ENTIRE red set
// is node-testable — no `.skip` block is required.
import { describe, it, expect } from 'vitest'
import {
  decomposeRichHtml,
  type DecomposeRichResult,
} from '../src/main/rich-decompose.js'
import {
  parseHtml,
  normalizeUrl,
  isSafeUrl,
  escapeAttr,
  sanitizePastedHtml,
  type HtmlNode,
  type HtmlText,
  type HtmlElement,
} from '../src/main/paste-sanitize.js'
import type { RagNodeChild } from '../src/main/rag-store.js'

/** Narrow a result to the success arm (asserting `ok === true`). */
function expectOk<T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + (result as { error?: string }).error)
  return result as Extract<T, { ok: true }>
}

/** Narrow a result to the failure arm (asserting `ok === false`). */
function expectFail<T extends { ok: boolean }>(result: T): Extract<T, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result as Extract<T, { ok: false }>
}

// ===========================================================================
// Unit M §5.4 children validation (mirrored from the spec — the decomposer's
// output must ALWAYS pass this; `isValidChildren`/`validateNodeShape` are not
// exported from rag-store.ts). Closed child type, string content, object-or-
// absent props, no dangerous key anywhere.
// ===========================================================================
const CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])
const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])
const UNWRAPPED_CHILD_TYPES = new Set<string>(['span', 'b', 'i', 'u', 'font', 'div', 'br'])

function hasDangerousKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasDangerousKey)
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true
      if (hasDangerousKey((value as Record<string, unknown>)[key])) return true
    }
  }
  return false
}

/** True if `children` is a valid `RagNodeChild[]` per Unit M §5.4. */
function isValidChildren(children: unknown): boolean {
  if (!Array.isArray(children)) return false
  for (const c of children) {
    if (c === null || typeof c !== 'object' || Array.isArray(c)) return false
    const child = c as { type?: unknown; content?: unknown; props?: unknown }
    if (hasDangerousKey(c)) return false
    if (typeof child.type !== 'string' || !CHILD_TYPES.has(child.type)) return false
    if (typeof child.content !== 'string') return false
    if (child.props !== undefined && (child.props === null || typeof child.props !== 'object' || Array.isArray(child.props))) return false
    if (child.props !== undefined && hasDangerousKey(child.props)) return false
  }
  return true
}

// ===========================================================================
// MODULE-EXISTENCE RED (1)
// ===========================================================================
describe('rich-decompose — module existence', () => {
  it('RED — decomposeRichHtml is not exported yet (module does not exist)', () => {
    expect(typeof decomposeRichHtml).toBe('function')
  })
})

// ===========================================================================
// §2.1 HAPPY-PATH STATES (38)
// ===========================================================================
describe('rich-decompose — Unit U2 happy-path states (§2.1)', () => {
  it('1. plain text only: content = the text, children = []', () => {
    const r = expectOk(decomposeRichHtml('Hello world'))
    expect(r.content).toBe('Hello world')
    expect(r.children).toEqual([])
  })

  it('2. empty input: content = "", children = []', () => {
    const r = expectOk(decomposeRichHtml(''))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('3. whitespace-only input: whitespace preserved as-is, children = []', () => {
    const r = expectOk(decomposeRichHtml('   '))
    expect(r.content).toBe('   ')
    expect(r.children).toEqual([])
  })

  it('4. a single strong → one strong child, content = ""', () => {
    const r = expectOk(decomposeRichHtml('<strong>bold</strong>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'strong', content: 'bold' }])
  })

  it('5. a single em → one em child, content = ""', () => {
    const r = expectOk(decomposeRichHtml('<em>italic</em>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'em', content: 'italic' }])
  })

  it('6. b is MAPPED to strong: one strong child, NO b child', () => {
    const r = expectOk(decomposeRichHtml('<b>bold</b>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'strong', content: 'bold' }])
    expect(r.children.some((c) => c.type === 'b')).toBe(false)
  })

  it('7. i is MAPPED to em: one em child, NO i child', () => {
    const r = expectOk(decomposeRichHtml('<i>italic</i>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'em', content: 'italic' }])
    expect(r.children.some((c) => c.type === 'i')).toBe(false)
  })

  it('8. text + inline child: text before AND after folds into content', () => {
    const r = expectOk(decomposeRichHtml('Hello <strong>bold</strong> world'))
    expect(r.content).toBe('Hello  world')
    expect(r.children).toEqual([{ type: 'strong', content: 'bold' }])
  })

  it('9. a safe a → one a child with props { href }', () => {
    const r = expectOk(decomposeRichHtml('<a href="https://x">link</a>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('10. an a with title: props keeps href + title, all other attributes stripped', () => {
    const r = expectOk(decomposeRichHtml('<a href="https://x" title="t">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x', title: 't' } }])
  })

  it('11. a relative a href is safe: props = { href: "/path" }', () => {
    const r = expectOk(decomposeRichHtml('<a href="/path">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: '/path' } }])
  })

  it('12. a safe img → one img child (content "") with props { src, alt }', () => {
    const r = expectOk(decomposeRichHtml('<img src="https://x/i.png" alt="pic">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }])
  })

  it('13. a safe raster data:image/* img survives (the data:image carve-out, img only)', () => {
    const r = expectOk(decomposeRichHtml('<img src="data:image/png;base64,AAAA" alt="p">'))
    expect(r.children).toEqual([{ type: 'img', content: '', props: { src: 'data:image/png;base64,AAAA', alt: 'p' } }])
  })

  it('14. u is unwrapped: text folded into content, NO u child', () => {
    const r = expectOk(decomposeRichHtml('<u>underline</u>'))
    expect(r.content).toBe('underline')
    expect(r.children).toEqual([])
  })

  it('15. font is unwrapped and its attributes stripped', () => {
    const r = expectOk(decomposeRichHtml('<font color="red">text</font>'))
    expect(r.content).toBe('text')
    expect(r.children).toEqual([])
  })

  it('16. span is unwrapped: text folded into content, NO span child', () => {
    const r = expectOk(decomposeRichHtml('a <span>b</span> c'))
    expect(r.content).toBe('a b c')
    expect(r.children).toEqual([])
  })

  it('17. div is unwrapped: text folded into content, NO div child', () => {
    const r = expectOk(decomposeRichHtml('<div>text</div>'))
    expect(r.content).toBe('text')
    expect(r.children).toEqual([])
  })

  it('18. br is unwrapped (void): dropped, NO br child', () => {
    const r = expectOk(decomposeRichHtml('a<br>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('19. div with inline children: unwrap + hoist the strong', () => {
    const r = expectOk(decomposeRichHtml('<div>a <strong>b</strong> c</div>'))
    expect(r.content).toBe('a  c')
    expect(r.children).toEqual([{ type: 'strong', content: 'b' }])
  })

  it('20. span with nested text folded: content = "a b c", children = []', () => {
    const r = expectOk(decomposeRichHtml('a <span>b</span> c'))
    expect(r.content).toBe('a b c')
    expect(r.children).toEqual([])
  })

  it('21. nested inline flattening: inner strong hoisted to a sibling AFTER the em', () => {
    const r = expectOk(decomposeRichHtml('<em>italic <strong>bold</strong> tail</em>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([
      { type: 'em', content: 'italic  tail' },
      { type: 'strong', content: 'bold' },
    ])
  })

  it('22. recursive flattening: deeply-nested chain flattens to a flat sibling list', () => {
    const r = expectOk(decomposeRichHtml('<em>a <strong>b <em>c</em></strong> d</em>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([
      { type: 'em', content: 'a  d' },
      { type: 'strong', content: 'b ' },
      { type: 'em', content: 'c' },
    ])
  })

  it('23. a inside strong: strong text folds, a hoisted to a sibling', () => {
    const r = expectOk(decomposeRichHtml('<strong>bold <a href="/x">link</a></strong>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([
      { type: 'strong', content: 'bold ' },
      { type: 'a', content: 'link', props: { href: '/x' } },
    ])
  })

  it('24. unsafe a href (javascript:) demotes the a to plain text', () => {
    const r = expectOk(decomposeRichHtml('<a href="javascript:alert(1)">link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('25. unsafe img src (javascript:) drops the img', () => {
    const r = expectOk(decomposeRichHtml('<img src="javascript:alert(1)">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('26. missing href demotes an a to plain text', () => {
    const r = expectOk(decomposeRichHtml('<a>link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('27. missing src drops an img', () => {
    const r = expectOk(decomposeRichHtml('<img alt="p">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('28. on* attribute stripped: onclick removed from the a', () => {
    const r = expectOk(decomposeRichHtml('<a href="https://x" onclick="alert(1)">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('29. dangerous-key attribute stripped: __proto__ removed from the a', () => {
    const r = expectOk(decomposeRichHtml('<a href="https://x" __proto__="p">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('30. data: on an a demotes (data: is NEVER allowed on a)', () => {
    const r = expectOk(decomposeRichHtml('<a href="data:text/html,x">link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('31. non-image data: img src drops the img', () => {
    const r = expectOk(decomposeRichHtml('<img src="data:text/html,x">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('32. determinism: the same input returns the SAME result (deep-equal) both times', () => {
    const a = decomposeRichHtml('<strong>bold</strong>')
    const b = decomposeRichHtml('<strong>bold</strong>')
    expect(a).toEqual(b)
  })

  it('33. totality on a malformed string: an unclosed tag returns { ok: true, ... } (never throws)', () => {
    const r = expectOk(decomposeRichHtml('<strong>unclosed'))
    expect(typeof r.content).toBe('string')
    expect(Array.isArray(r.children)).toBe(true)
  })

  it('34. totality on garbage: "<<<>>>" returns { ok: true, ... } (never throws)', () => {
    const r = expectOk(decomposeRichHtml('<<<>>>'))
    expect(typeof r.content).toBe('string')
    expect(Array.isArray(r.children)).toBe(true)
  })

  it('35. plain-text root round-trip base: a node with empty children decomposes to content + children: []', () => {
    const r = expectOk(decomposeRichHtml('plain'))
    expect(r.content).toBe('plain')
    expect(r.children).toEqual([])
  })

  it('36. text between children (the round-trip case): ALL inter-child text folds into content', () => {
    const r = expectOk(decomposeRichHtml('a <strong>b</strong> c <em>d</em> e'))
    expect(r.content).toBe('a  c  e')
    expect(r.children).toEqual([
      { type: 'strong', content: 'b' },
      { type: 'em', content: 'd' },
    ])
  })

  it('37. script content dropped (RAW_TEXT): content = "ab", no script text survives', () => {
    const r = expectOk(decomposeRichHtml('a<script>alert(1)</script>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
    expect(r.content).not.toMatch(/alert\(1\)/)
  })

  it('38. outside-accepted element (p) unwrapped to text + its inline child hoisted', () => {
    const r = expectOk(decomposeRichHtml('<p>Hello <strong>world</strong></p>'))
    expect(r.content).toBe('Hello ')
    expect(r.children).toEqual([{ type: 'strong', content: 'world' }])
  })
})

// ===========================================================================
// §2.2 FAIL-STATES (8)
// ===========================================================================
describe('rich-decompose — Unit U2 fail-states (§2.2)', () => {
  it('1. non-string input → { ok: false, error: "decomposeRichHtml: input must be a string" }', () => {
    for (const bad of [undefined, null, 42, {}]) {
      const r = expectFail(decomposeRichHtml(bad as never))
      expect(r.error).toBe('decomposeRichHtml: input must be a string')
    }
  })

  it('2. the output is ALWAYS a valid RagNodeChild[] (Unit M §5.4) for every state', () => {
    const inputs = [
      'Hello world',
      '',
      '   ',
      '<strong>bold</strong>',
      '<em>italic</em>',
      '<b>bold</b>',
      '<i>italic</i>',
      '<a href="https://x" title="t">link</a>',
      '<img src="https://x/i.png" alt="pic">',
      '<img src="data:image/png;base64,AAAA" alt="p">',
      '<u>underline</u>',
      '<font color="red">text</font>',
      'a <span>b</span> c',
      '<div>a <strong>b</strong> c</div>',
      '<em>italic <strong>bold</strong> tail</em>',
      '<em>a <strong>b <em>c</em></strong> d</em>',
      '<p>Hello <strong>world</strong></p>',
      'a<script>alert(1)</script>b',
      '<a href="javascript:alert(1)">link</a>',
      '<img src="data:text/html,x">',
      '<a href="https://x" __proto__="p">link</a>',
      '<strong>unclosed',
      '<<<>>>',
    ]
    for (const input of inputs) {
      const r = expectOk(decomposeRichHtml(input))
      expect(isValidChildren(r.children)).toBe(true)
    }
  })

  it('3. an on* attribute NEVER survives — not in any child props', () => {
    const inputs = [
      '<a href="https://x" onclick="alert(1)">link</a>',
      '<a href="https://x" onerror="x" onload="y" onmouseover="z">link</a>',
      '<a href="https://x" OnClick="alert(1)">link</a>',
      '<img src="https://x/i.png" onerror="alert(1)">',
      '<strong onclick="alert(1)">bold</strong>',
    ]
    for (const input of inputs) {
      const r = expectOk(decomposeRichHtml(input))
      for (const c of r.children) {
        if (c.props) {
          for (const key of Object.keys(c.props)) {
            expect(key.toLowerCase().startsWith('on')).toBe(false)
          }
        }
      }
    }
  })

  it('4. an unsafe URL NEVER survives — no javascript:/vbscript:/data:(non-image) in any child props', () => {
    const inputs = [
      '<a href="javascript:alert(1)">link</a>',
      '<a href="vbscript:msgbox(1)">link</a>',
      '<a href="data:text/html,x">link</a>',
      '<a href="JAVASCRIPT:alert(1)">link</a>',
      '<img src="javascript:alert(1)">',
      '<img src="data:text/html,x">',
    ]
    for (const input of inputs) {
      const r = expectOk(decomposeRichHtml(input))
      for (const c of r.children) {
        if (c.props) {
          for (const value of Object.values(c.props)) {
            if (typeof value === 'string') {
              expect(value.toLowerCase()).not.toMatch(/^javascript:|^vbscript:|^data:(?!image\/)/)
            }
          }
        }
      }
    }
  })

  it('5. a dangerous-key attribute NEVER survives — no __proto__/constructor/prototype in child props', () => {
    const inputs = [
      '<a href="https://x" __proto__="p">link</a>',
      '<a href="https://x" constructor="c">link</a>',
      '<a href="https://x" prototype="p">link</a>',
      '<img src="https://x/i.png" __proto__="p">',
    ]
    for (const input of inputs) {
      const r = expectOk(decomposeRichHtml(input))
      for (const c of r.children) {
        if (c.props) {
          for (const key of Object.keys(c.props)) {
            expect(['__proto__', 'constructor', 'prototype']).not.toContain(key)
          }
        }
      }
    }
  })

  it('6. no span/b/i/u/font/div/br child is EVER emitted (the RagNodeChildType union is closed)', () => {
    const inputs = [
      'a <span>b</span> c',
      '<span>text</span>',
      '<span><strong>bold</strong></span>',
      '<b>bold</b>',
      '<i>italic</i>',
      '<u>underline</u>',
      '<font color="red">text</font>',
      '<div>text</div>',
      'a<br>b',
      '<em>a <span>b</span> c</em>',
    ]
    for (const input of inputs) {
      const r = expectOk(decomposeRichHtml(input))
      for (const c of r.children) {
        expect(UNWRAPPED_CHILD_TYPES.has(c.type)).toBe(false)
        expect(CHILD_TYPES.has(c.type)).toBe(true)
      }
    }
  })

  it('7. the function NEVER throws for ANY string input', () => {
    const inputs = [
      '',
      '   ',
      'Hello world',
      '<strong>bold</strong>',
      '<strong>unclosed',
      '<<<>>>',
      '<a href="javascript:alert(1)">link</a>',
      '<img src="data:text/html,x">',
      'a<script>alert(1)</script>b',
      '<em>a <strong>b <em>c</em></strong> d</em>',
    ]
    for (const input of inputs) {
      let result: DecomposeRichResult
      expect(() => { result = decomposeRichHtml(input) }).not.toThrow()
      expect(result!.ok).toBe(true)
    }
  })

  it('8. sanitizePastedHtml behavior is UNCHANGED (non-regression — the pinned Unit S outputs are byte-identical)', () => {
    // The additive exports must NOT alter sanitizePastedHtml. These are the
    // pinned Unit S §5.6/§5.7 outputs for a representative sample of cases.
    expect(sanitizePastedHtml('Hello world').html).toBe('Hello world')
    expect(sanitizePastedHtml('<strong>bold</strong>').html).toBe('<strong>bold</strong>')
    expect(sanitizePastedHtml('<strong>bold</strong>').content).toBe('')
    expect(sanitizePastedHtml('<strong>bold</strong>').children).toEqual([{ type: 'strong', content: 'bold' }])
    expect(sanitizePastedHtml('Hello <strong>bold</strong> world').content).toBe('Hello  world')
    expect(sanitizePastedHtml('<a href="https://x" onclick="alert(1)">link</a>').children)
      .toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
    expect(sanitizePastedHtml('a<script>alert(1)</script>b').content).toBe('ab')
  })
})

// ===========================================================================
// §1.3 ADDITIVE EXPORTS ON paste-sanitize.ts (5)
// ===========================================================================
describe('rich-decompose — additive exports on paste-sanitize (§1.3)', () => {
  it('parseHtml is exported (the DOM-free tokenizer)', () => {
    expect(typeof parseHtml).toBe('function')
  })

  it('normalizeUrl is exported (decode refs + strip leading C0/space)', () => {
    expect(typeof normalizeUrl).toBe('function')
  })

  it('isSafeUrl is exported (scheme allow-list + data:image carve-out)', () => {
    expect(typeof isSafeUrl).toBe('function')
  })

  it('escapeAttr is exported (& → &amp;, " → &quot;)', () => {
    expect(typeof escapeAttr).toBe('function')
  })

  it('the HtmlNode AST types are exported and the tokenizer produces the documented node shape', () => {
    // The HtmlText/HtmlElement/HtmlNode types are imported above (`import type`).
    // At runtime, verify parseHtml returns nodes with the documented shape.
    // NOTE (additive-only): parseHtml is the SHARED tokenizer and is NOT
    // changed by U2 — `img` is a CONTAINER here (it absorbs following text into
    // its children). `img`-as-void is a decomposeRichHtml behavior (§1.6), not a
    // tokenizer behavior — see the decompose tests.
    const nodes: HtmlNode[] = parseHtml('<strong>a</strong><img src="x">text')
    const element = nodes.find((n): n is HtmlElement => n.type === 'element') as HtmlElement | undefined
    expect(element).toBeDefined()
    expect(element!.tag).toBe('strong')
    expect(element!.attrs).toEqual({})
    const img = nodes.find((n): n is HtmlElement => n.type === 'element' && n.tag === 'img') as HtmlElement | undefined
    expect(img).toBeDefined()
    expect(img!.attrs).toEqual({ src: 'x' })
    expect(Array.isArray(img!.children)).toBe(true)
    // Container behavior: the trailing 'text' node is INSIDE img.children, not
    // a root-level sibling (the tokenizer does not treat img as void).
    const inside = img!.children.filter((c): c is HtmlText => c.type === 'text')
    expect(inside.some((t) => t.text === 'text')).toBe(true)
  })
})

// ===========================================================================
// §6 ADVERSARIAL REGRESSION TESTS (ADR-1..ADR-10)
// ===========================================================================
describe('rich-decompose — adversarial regression (§6 ADR-1..ADR-10)', () => {
  it('ADR-1. on* XSS attributes never survive into props (img onerror)', () => {
    const r = expectOk(decomposeRichHtml('<img src="https://x/i.png" onerror="alert(1)">'))
    expect(r.children).toEqual([{ type: 'img', content: '', props: { src: 'https://x/i.png' } }])
    if (r.children[0].props) {
      expect(Object.keys(r.children[0].props).some((k) => k.toLowerCase().startsWith('on'))).toBe(false)
    }
  })

  it('ADR-2. javascript: XSS href demotes the a to text; no javascript: URL survives', () => {
    const r = expectOk(decomposeRichHtml('<a href="javascript:alert(1)">x</a>'))
    expect(r.content).toBe('x')
    expect(r.children).toEqual([])
  })

  it('ADR-3. script payload is dropped (RAW_TEXT tokenizer skip); content = "ab"', () => {
    const r = expectOk(decomposeRichHtml('a<script>alert(1)</script>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
    expect(r.content).not.toMatch(/alert\(1\)/)
  })

  it('ADR-4. deeply nested inline (10k deep) never throws (stack-safety / totality)', () => {
    const input = '<strong>'.repeat(10000) + 'x' + '</strong>'.repeat(10000)
    let result: DecomposeRichResult
    expect(() => { result = decomposeRichHtml(input) }).not.toThrow()
    expect(result!.ok).toBe(true)
  })

  it('ADR-5. huge input (~1 MB of text) never throws, never hangs unreasonably', () => {
    const input = 'x'.repeat(1024 * 1024)
    let result: DecomposeRichResult
    expect(() => { result = decomposeRichHtml(input) }).not.toThrow()
    expect(result!.ok).toBe(true)
  })

  it('ADR-6. mismatched/unclosed tags return { ok: true, ... } (lenient tokenizer, never throws)', () => {
    const inputs = [
      '</strong><strong>x</strong>',
      '<strong>unclosed',
      '<a href="x">unclosed',
      '<a href="x" title="unclosed>broken',
    ]
    for (const input of inputs) {
      let result: DecomposeRichResult
      expect(() => { result = decomposeRichHtml(input) }).not.toThrow()
      expect(result!.ok).toBe(true)
    }
  })

  it('ADR-7. file:/other unsafe schemes are never stored in props.href/props.src', () => {
    const img = expectOk(decomposeRichHtml('<img src="file:///etc/passwd">'))
    expect(img.children.some((c) => c.type === 'img')).toBe(false)
    const a = expectOk(decomposeRichHtml('<a href="file:///x">link</a>'))
    expect(a.content).toBe('link')
    expect(a.children.some((c) => c.type === 'a')).toBe(false)
    for (const scheme of ['ftp://x', 'blob://x', 'about:blank', 'mailto:x@y.z']) {
      const ra = expectOk(decomposeRichHtml(`<a href="${scheme}">link</a>`))
      expect(ra.children.some((c) => c.type === 'a')).toBe(false)
      const ri = expectOk(decomposeRichHtml(`<img src="${scheme}">`))
      expect(ri.children.some((c) => c.type === 'img')).toBe(false)
    }
  })

  it('ADR-8. data: scope — raster image kept on img, data: never on a, script-capable subtype dropped', () => {
    const imgPng = expectOk(decomposeRichHtml('<img src="data:image/png;base64,AAA">'))
    expect(imgPng.children.some((c) => c.type === 'img')).toBe(true)
    const aData = expectOk(decomposeRichHtml('<a href="data:image/png;base64,AAA">x</a>'))
    expect(aData.content).toBe('x')
    expect(aData.children.some((c) => c.type === 'a')).toBe(false)
    const imgSvg = expectOk(decomposeRichHtml('<img src="data:image/svg+xml;base64,AAAA">'))
    expect(imgSvg.children.some((c) => c.type === 'img')).toBe(false)
  })

  it('ADR-9. unescaped attribute quotes / malformed attributes never throw and never leak on* or unsafe URLs', () => {
    const inputs = [
      '"><img src=x onerror=alert(1)>',
      '<a href="https://x" onclick="alert(1)">link</a>',
      '<img src=x onerror=alert(1)>',
      '<a href=javascript:alert(1)>x</a>',
      '<a " href="https://x" >link</a>',
      '<img src="https://x/i.png" onerror="alert(1)" alt="broken>',
    ]
    for (const input of inputs) {
      let result: DecomposeRichResult
      expect(() => { result = decomposeRichHtml(input) }).not.toThrow()
      expect(result!.ok).toBe(true)
      for (const c of result!.children) {
        if (c.props) {
          for (const [key, value] of Object.entries(c.props)) {
            expect(key.toLowerCase().startsWith('on')).toBe(false)
            if (typeof value === 'string') {
              expect(value.toLowerCase()).not.toMatch(/^javascript:|^vbscript:/)
            }
          }
        }
      }
    }
  })

  it('ADR-10. control characters in text are preserved as-is in content (URL values still C0-trimmed)', () => {
    const r = expectOk(decomposeRichHtml('\u0000foo\u0001'))
    expect(r.content).toBe('\u0000foo\u0001')
    expect(r.children).toEqual([])
    // URL VALUES still have leading C0/space stripped + validated via normalizeUrl.
    const a = expectOk(decomposeRichHtml('<a href=" \u0000javascript:alert(1)">link</a>'))
    expect(a.content).toBe('link')
    expect(a.children.some((c) => c.type === 'a')).toBe(false)
    const img = expectOk(decomposeRichHtml('<img src="\t\u0000javascript:alert(1)">'))
    expect(img.children.some((c) => c.type === 'img')).toBe(false)
  })

  it('ADR-11 (adversarial F1). an out-of-range / lone-surrogate HTML ref does NOT throw — decomposeRichHtml is TOTAL for any string', () => {
    // `String.fromCodePoint` throws RangeError for a code point > 0x10FFFF or in
    // the surrogate range 0xD800–0xDFFF. A hostile `&#x110000;` / `&#xD800;`
    // ref in a URL must be tolerated (left literal), never turn decompose into a
    // throw. (Guard in paste-sanitize.ts decodeHtmlRefs.)
    const a = expectOk(decomposeRichHtml('<a href="&#x110000;">x</a>'))
    expect(a.children.some((c) => c.type === 'a')).toBe(true) // literal relative URL kept; no throw
    expect(() => decomposeRichHtml('<img src="&#xD800;">')).not.toThrow()
    expect(() => decomposeRichHtml('<a href="&#x10FFFF;">x</a>')).not.toThrow() // boundary — valid code point
  })

  it('ADR-12 (adversarial F2). img does NOT drop a following text run — the tokenizer-attached text is recovered into content', () => {
    // `parseHtml` treats img as a container (additive-only), so `' world'` after
    // `<img>` becomes img's child; decomposeRichHtml must fold it back into the
    // parent content rather than silently dropping user text (round-trip).
    const r = expectOk(decomposeRichHtml('Hello <img src="https://x/i.png"> world'))
    expect(r.content).toBe('Hello  world')
    expect(r.children).toHaveLength(1)
    expect(r.children[0].type).toBe('img')
    // A dropped img (unsafe src) still recovers its attached text.
    const d = expectOk(decomposeRichHtml('Hello <img src="javascript:alert(1)"> world'))
    expect(d.content).toBe('Hello  world')
    expect(d.children.some((c) => c.type === 'img')).toBe(false)
    // Inside an inline child, the trailing text recovers into that child's content.
    const s = expectOk(decomposeRichHtml('<strong>a <img src="https://x/i.png">b</strong>'))
    expect(s.children[0].type).toBe('strong')
    expect((s.children[0] as { content: string }).content).toBe('a b')
  })
})
