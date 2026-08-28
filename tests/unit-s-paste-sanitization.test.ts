// tests/unit-s-paste-sanitization.test.ts — Unit S: paste-time sanitization
// (safe inline rich-text from raw pasted HTML) — docs/specs/unit-s-paste-sanitization.md
// §5.6 happy-path states (32) + §5.7 fail-states (8).
//
// This is the TestWriter RED set — the Unit S module does NOT exist yet:
//
//   - `src/main/paste-sanitize.ts` does NOT exist, so the import of
//     `sanitizePastedHtml`/`SanitizePasteResult` FAILS at module load → the
//     WHOLE suite is red (the expected red set).
//
// The tests are derived from the spec ALONE (§5.6/§5.7). The function is PURE
// (no Electron, no DOM — it operates on an HTML string), so the ENTIRE red set
// is node-testable — no `.skip` block is required.
import { describe, it, expect } from 'vitest'
import {
  sanitizePastedHtml,
  type SanitizePasteResult,
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
// Unit M §5.4 children validation (mirrored from the spec — the sanitizer's
// output must ALWAYS pass this). `validateNodeShape` is not exported from
// rag-store.ts, so the test mirrors the pinned rules: closed child type, string
// content, object-or-absent props, no dangerous key anywhere.
// ===========================================================================
const CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])
const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])

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
// §5.6 HAPPY-PATH STATES (32)
// ===========================================================================
describe('paste-sanitize — Unit S happy-path states (§5.6)', () => {
  it('RED — sanitizePastedHtml is not exported yet (module does not exist)', () => {
    expect(typeof sanitizePastedHtml).toBe('function')
  })

  it('1. plain text only: html/content = the text, children = []', () => {
    const r = expectOk(sanitizePastedHtml('Hello world'))
    expect(r.html).toBe('Hello world')
    expect(r.content).toBe('Hello world')
    expect(r.children).toEqual([])
  })

  it('2. empty input: html/content = "", children = []', () => {
    const r = expectOk(sanitizePastedHtml(''))
    expect(r.html).toBe('')
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('3. whitespace-only input: whitespace preserved as-is, children = []', () => {
    const r = expectOk(sanitizePastedHtml('   '))
    expect(r.html).toBe('   ')
    expect(r.content).toBe('   ')
    expect(r.children).toEqual([])
  })

  it('4. a single strong → one strong child, content = ""', () => {
    const r = expectOk(sanitizePastedHtml('<strong>bold</strong>'))
    expect(r.html).toBe('<strong>bold</strong>')
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'strong', content: 'bold' }])
  })

  it('5. a single em → one em child, content = ""', () => {
    const r = expectOk(sanitizePastedHtml('<em>italic</em>'))
    expect(r.html).toBe('<em>italic</em>')
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'em', content: 'italic' }])
  })

  it('6. text + inline child: content folds the surrounding text, child preserved', () => {
    const r = expectOk(sanitizePastedHtml('Hello <strong>bold</strong> world'))
    expect(r.html).toBe('Hello <strong>bold</strong> world')
    expect(r.content).toBe('Hello  world')
    expect(r.children).toEqual([{ type: 'strong', content: 'bold' }])
  })

  it('7. a safe a → one a child with props { href }', () => {
    const r = expectOk(sanitizePastedHtml('<a href="https://x">link</a>'))
    expect(r.html).toBe('<a href="https://x">link</a>')
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('8. an a with title: props keeps href + title, all other attributes stripped', () => {
    const r = expectOk(sanitizePastedHtml('<a href="https://x" title="t">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x', title: 't' } }])
  })

  it('9. a relative a href is safe: props = { href: "/path" }', () => {
    const r = expectOk(sanitizePastedHtml('<a href="/path">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: '/path' } }])
  })

  it('10. a safe img → one img child (content "") with props { src, alt }', () => {
    const r = expectOk(sanitizePastedHtml('<img src="https://x/i.png" alt="pic">'))
    expect(r.html).toBe('<img src="https://x/i.png" alt="pic">')
    expect(r.content).toBe('')
    expect(r.children).toEqual([{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'pic' } }])
  })

  it('11. a safe data:image/* img survives (the data:image carve-out — A4)', () => {
    const r = expectOk(sanitizePastedHtml('<img src="data:image/png;base64,AAAA" alt="p">'))
    expect(r.children).toEqual([{ type: 'img', content: '', props: { src: 'data:image/png;base64,AAAA', alt: 'p' } }])
  })

  it('12. span folded into the parent text: NO span child (A6)', () => {
    const r = expectOk(sanitizePastedHtml('a <span>b</span> c'))
    expect(r.content).toBe('a b c')
    expect(r.children).toEqual([])
  })

  it('13. nested inline flattening: inner strong hoisted to a sibling (A7)', () => {
    const r = expectOk(sanitizePastedHtml('<em>italic <strong>bold</strong> tail</em>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([
      { type: 'em', content: 'italic  tail' },
      { type: 'strong', content: 'bold' },
    ])
  })

  it('14. recursive flattening: deeply-nested chain flattens to a flat sibling list (A7)', () => {
    const r = expectOk(sanitizePastedHtml('<em>a <strong>b <em>c</em></strong> d</em>'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([
      { type: 'em', content: 'a  d' },
      { type: 'strong', content: 'b ' },
      { type: 'em', content: 'c' },
    ])
  })

  it('15. unwrapped block element: p wrapper dropped, text + inline children preserved', () => {
    const r = expectOk(sanitizePastedHtml('<p>Hello <strong>world</strong></p>'))
    expect(r.content).toBe('Hello ')
    expect(r.children).toEqual([{ type: 'strong', content: 'world' }])
  })

  it('16. script removed entirely: script AND its content dropped (A1)', () => {
    const r = expectOk(sanitizePastedHtml('a<script>alert(1)</script>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('17. style removed entirely', () => {
    const r = expectOk(sanitizePastedHtml('a<style>body{}</style>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('18. iframe removed entirely', () => {
    const r = expectOk(sanitizePastedHtml('a<iframe src="https://x"></iframe>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('19. svg removed entirely, including a nested a (a-in-SVG-context)', () => {
    const r = expectOk(sanitizePastedHtml('a<svg><a href="https://x">s</a></svg>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('20. fe* wildcard removed: feGaussianBlur dropped entirely (A5)', () => {
    const r = expectOk(sanitizePastedHtml('a<feGaussianBlur>x</feGaussianBlur>b'))
    expect(r.content).toBe('ab')
    expect(r.children).toEqual([])
  })

  it('21. event-handler attribute stripped: onclick removed from the a (A2)', () => {
    const r = expectOk(sanitizePastedHtml('<a href="https://x" onclick="alert(1)">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('22. javascript: URL demotes an a to plain text (A3)', () => {
    const r = expectOk(sanitizePastedHtml('<a href="javascript:alert(1)">link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('23. vbscript: URL demotes an a to plain text', () => {
    const r = expectOk(sanitizePastedHtml('<a href="vbscript:msgbox(1)">link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('24. data: URL demotes an a to plain text (data: never allowed on a — A4)', () => {
    const r = expectOk(sanitizePastedHtml('<a href="data:text/html,x">link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('25. unsafe img src drops the img (A3)', () => {
    const r = expectOk(sanitizePastedHtml('<img src="javascript:alert(1)">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('26. non-image data: img src drops the img (A4)', () => {
    const r = expectOk(sanitizePastedHtml('<img src="data:text/html,x">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('27. missing href demotes an a to plain text', () => {
    const r = expectOk(sanitizePastedHtml('<a>link</a>'))
    expect(r.content).toBe('link')
    expect(r.children).toEqual([])
  })

  it('28. missing src drops an img', () => {
    const r = expectOk(sanitizePastedHtml('<img alt="p">'))
    expect(r.content).toBe('')
    expect(r.children).toEqual([])
  })

  it('29. dangerous-key attribute stripped: __proto__ removed from the a (A10)', () => {
    const r = expectOk(sanitizePastedHtml('<a href="https://x" __proto__="p">link</a>'))
    expect(r.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('30. determinism: the same input returns the SAME result (deep-equal) both times', () => {
    const a = sanitizePastedHtml('<strong>bold</strong>')
    const b = sanitizePastedHtml('<strong>bold</strong>')
    expect(a).toEqual(b)
  })

  it('31. totality on a malformed string: an unclosed tag returns { ok: true, ... } (never throws)', () => {
    const r = expectOk(sanitizePastedHtml('<strong>unclosed'))
    expect(typeof r.html).toBe('string')
    expect(typeof r.content).toBe('string')
    expect(Array.isArray(r.children)).toBe(true)
  })

  it('32. totality on garbage: "<<<>>>" returns { ok: true, ... } (never throws)', () => {
    const r = expectOk(sanitizePastedHtml('<<<>>>'))
    expect(typeof r.html).toBe('string')
    expect(typeof r.content).toBe('string')
    expect(Array.isArray(r.children)).toBe(true)
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (8)
// ===========================================================================
describe('paste-sanitize — Unit S fail-states (§5.7)', () => {
  it('1. non-string input → { ok: false, error: "sanitizePastedHtml: input must be a string" }', () => {
    for (const bad of [undefined, null, 42, {}]) {
      const r = expectFail(sanitizePastedHtml(bad as never))
      expect(r.error).toBe('sanitizePastedHtml: input must be a string')
    }
  })

  it('2. a span child is NEVER emitted (A6) — a pasted span is always folded into the parent text', () => {
    const inputs = [
      'a <span>b</span> c',
      '<span>text</span>',
      '<span><strong>bold</strong></span>',
      '<em>a <span>b</span> c</em>',
    ]
    for (const input of inputs) {
      const r = expectOk(sanitizePastedHtml(input))
      expect(r.children.some((c) => c.type === 'span')).toBe(false)
    }
  })

  it('3. an on* attribute NEVER survives (A2) — not in html, not in any child props', () => {
    const inputs = [
      '<a href="https://x" onclick="alert(1)">link</a>',
      '<a href="https://x" onerror="x" onload="y" onmouseover="z">link</a>',
      '<a href="https://x" OnClick="alert(1)">link</a>',
      '<img src="https://x/i.png" onerror="alert(1)">',
      '<strong onclick="alert(1)">bold</strong>',
    ]
    for (const input of inputs) {
      const r = expectOk(sanitizePastedHtml(input))
      expect(r.html.toLowerCase()).not.toMatch(/\son[a-z]*=/)
      for (const c of r.children) {
        if (c.props) {
          for (const key of Object.keys(c.props)) {
            expect(key.toLowerCase().startsWith('on')).toBe(false)
          }
        }
      }
    }
  })

  it('4. an unsafe URL NEVER survives (A3/A4) — no javascript:/vbscript:/data:(non-image) in html or child props', () => {
    const inputs = [
      '<a href="javascript:alert(1)">link</a>',
      '<a href="vbscript:msgbox(1)">link</a>',
      '<a href="data:text/html,x">link</a>',
      '<a href="JAVASCRIPT:alert(1)">link</a>',
      '<img src="javascript:alert(1)">',
      '<img src="data:text/html,x">',
    ]
    for (const input of inputs) {
      const r = expectOk(sanitizePastedHtml(input))
      expect(r.html.toLowerCase()).not.toMatch(/javascript:|vbscript:|data:(?!image\/)/)
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

  it('5. a dangerous-key attribute NEVER survives (A10) — no __proto__/constructor/prototype in child props', () => {
    const inputs = [
      '<a href="https://x" __proto__="p">link</a>',
      '<a href="https://x" constructor="c">link</a>',
      '<a href="https://x" prototype="p">link</a>',
      '<img src="https://x/i.png" __proto__="p">',
    ]
    for (const input of inputs) {
      const r = expectOk(sanitizePastedHtml(input))
      for (const c of r.children) {
        if (c.props) {
          for (const key of Object.keys(c.props)) {
            expect(['__proto__', 'constructor', 'prototype']).not.toContain(key)
          }
        }
      }
    }
  })

  it('6. a disallowed element\'s content NEVER survives (A1) — script/iframe/svg/etc. and their text are dropped', () => {
    const inputs = [
      'a<script>alert(1)</script>b',
      'a<style>body{}</style>b',
      'a<iframe>secret</iframe>b',
      'a<svg><a href="https://x">s</a></svg>b',
      'a<feGaussianBlur>x</feGaussianBlur>b',
      'a<form>secret</form>b',
    ]
    for (const input of inputs) {
      const r = expectOk(sanitizePastedHtml(input))
      expect(r.content).not.toMatch(/alert\(1\)|body\{\}|secret|feGaussianBlur/)
    }
  })

  it('7. the output is ALWAYS a valid RagNodeChild[] (A9) — passes the Unit M §5.4 validation', () => {
    const inputs = [
      'Hello world',
      '<strong>bold</strong>',
      '<em>italic</em>',
      '<a href="https://x" title="t">link</a>',
      '<img src="https://x/i.png" alt="pic">',
      '<img src="data:image/png;base64,AAAA" alt="p">',
      'a <span>b</span> c',
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
      const r = expectOk(sanitizePastedHtml(input))
      expect(isValidChildren(r.children)).toBe(true)
    }
  })

  it('8. the function NEVER throws for ANY string input (A8)', () => {
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
      let result: SanitizePasteResult
      expect(() => { result = sanitizePastedHtml(input) }).not.toThrow()
      expect(result!.ok).toBe(true)
    }
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (Unit S adversarial host findings)
// ===========================================================================
describe('paste-sanitize — adversarial regression (URL F1/F2/F3, Tokenizer F1/F4)', () => {
  it('URL F1. leading C0-control/space before a scheme is rejected (a demoted, img dropped)', () => {
    const prefixes = [' ', '\u0000', '\t', '\n', '\r']
    for (const p of prefixes) {
      const a = expectOk(sanitizePastedHtml(`<a href="${p}javascript:alert(1)">link</a>`))
      expect(a.content).toBe('link')
      expect(a.children.some((c) => c.type === 'a')).toBe(false)
      const img = expectOk(sanitizePastedHtml(`<img src="${p}javascript:alert(1)">`))
      expect(img.children.some((c) => c.type === 'img')).toBe(false)
    }
  })

  it('URL F2. script-capable data:image subtypes drop the img; raster subtypes survive', () => {
    for (const mime of ['svg+xml', 'html', 'xml', 'text']) {
      const r = expectOk(sanitizePastedHtml(`<img src="data:image/${mime};base64,AAAA">`))
      expect(r.children.some((c) => c.type === 'img')).toBe(false)
    }
    for (const mime of ['png', 'jpeg', 'jpg', 'gif', 'webp', 'bmp', 'avif']) {
      const r = expectOk(sanitizePastedHtml(`<img src="data:image/${mime};base64,AAAA">`))
      expect(r.children.some((c) => c.type === 'img')).toBe(true)
    }
  })

  it('URL F3. HTML character references in a URL are decoded before validation (all rejected)', () => {
    const hrefs = ['&#106;avascript:alert(1)', 'javascript&#58;alert(1)', '&#106;&#97;vascript:alert(1)']
    for (const h of hrefs) {
      const a = expectOk(sanitizePastedHtml(`<a href="${h}">link</a>`))
      expect(a.content).toBe('link')
      expect(a.children.some((c) => c.type === 'a')).toBe(false)
      const img = expectOk(sanitizePastedHtml(`<img src="${h}">`))
      expect(img.children.some((c) => c.type === 'img')).toBe(false)
    }
  })

  it('Tokenizer F1. deeply-nested inline input (10k deep) never throws (totality)', () => {
    const input = '<strong>'.repeat(10000) + 'x' + '</strong>'.repeat(10000)
    let result: SanitizePasteResult
    expect(() => { result = sanitizePastedHtml(input) }).not.toThrow()
    expect(result!.ok).toBe(true)
  })

  it('Tokenizer F4. noembed/noframes are disallowed — their content is dropped', () => {
    for (const tag of ['noembed', 'noframes']) {
      const r = expectOk(sanitizePastedHtml(`a<${tag}>secret</${tag}>b`))
      expect(r.content).toBe('ab')
      expect(r.content).not.toMatch(/secret/)
    }
  })
})
