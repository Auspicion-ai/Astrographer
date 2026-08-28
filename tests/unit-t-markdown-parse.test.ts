// tests/unit-t-markdown-parse.test.ts — Unit T: the markdown→RAG-node parser
// (docs/specs/unit-t-markdown-import.md §5.1/§5.2/§5.3). §5.6 happy-path states
// (parser-relevant: 1–15, 21, 22) + §5.7 fail-states (parser-relevant: 1, 8, 9,
// 10).
//
// This is the TestWriter RED set — the Unit T parser module does NOT exist yet:
//
//   - `src/main/markdown-parse.ts` does NOT exist, so the import of
//     `parseMarkdown`/`ParsedMarkdown` FAILS at module load → the WHOLE suite
//     is red (the expected red set).
//
// The tests are derived from the spec ALONE (§5.6/§5.7). The parser is PURE
// (no Electron, no file I/O — it operates on a markdown string), so the ENTIRE
// red set is node-testable — no `.skip` block is required.
import { describe, it, expect } from 'vitest'
import {
  parseMarkdown,
  type ParsedMarkdown,
} from '../src/main/markdown-parse.js'
import { validateDocFlow } from '../src/main/doc-flow.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'

function nodeById(p: ParsedMarkdown, id: string): RagNode {
  const n = p.nodes.find((n) => n.id === id)
  expect(n).toBeDefined()
  return n!
}

function edgesOfKind(p: ParsedMarkdown, kind: string): RagEdge[] {
  return p.edges.filter((e) => e.kind === kind)
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (parser-relevant)
// ===========================================================================
describe('markdown-parse — Unit T happy-path states (§5.6)', () => {
  it('RED — parseMarkdown is not exported yet (module does not exist)', () => {
    expect(typeof parseMarkdown).toBe('function')
  })

  it('1. single heading document: root div + one h1 section + doc-head/doc-end edges; validateDocFlow ok', () => {
    const p = parseMarkdown('# Title\n', 'title')
    expect(p.documentId).toBe('title')
    // the synthetic document root (STRUCTURAL-ROOT div)
    const root = nodeById(p, 'title')
    expect(root.type).toBe('div')
    expect(root.content).toBe('')
    // one h1 section node
    const h1 = nodeById(p, 'title:section:1')
    expect(h1.type).toBe('h1')
    expect(h1.content).toBe('Title')
    // the FIRST section carries the doc-head marker prop (R7)
    expect(h1.props).toMatchObject({ 'data-doc-head': true })
    // doc-flow edges: doc-head + doc-end, both source = h1, target = root
    const head = edgesOfKind(p, 'doc-head')
    expect(head).toHaveLength(1)
    expect(head[0]).toMatchObject({ source: 'title:section:1', target: 'title', documentIds: ['title'] })
    const end = edgesOfKind(p, 'doc-end')
    expect(end).toHaveLength(1)
    expect(end[0]).toMatchObject({ source: 'title:section:1', target: 'title', documentIds: ['title'] })
    // parent-child root → h1
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'title', target: 'title:section:1' }))
    // validateDocFlow passes
    const v = validateDocFlow(p.nodes, p.edges, 'title')
    expect(v).toEqual({ ok: true, order: ['title:section:1'] })
  })

  it('2. multi-heading document: three sections linked by next-section; doc-head=h1, doc-end=h3; validateDocFlow order [h1,h2,h3]', () => {
    const p = parseMarkdown('# A\n## B\n### C\n', 'doc')
    const h1 = nodeById(p, 'doc:section:1')
    const h2 = nodeById(p, 'doc:section:2')
    const h3 = nodeById(p, 'doc:section:3')
    expect(h1.type).toBe('h1')
    expect(h2.type).toBe('h2')
    expect(h3.type).toBe('h3')
    expect(h1.content).toBe('A')
    expect(h2.content).toBe('B')
    expect(h3.content).toBe('C')
    // next-section chain in heading order (A→B→C)
    const ns = edgesOfKind(p, 'next-section')
    expect(ns).toHaveLength(2)
    expect(ns).toContainEqual(expect.objectContaining({ source: 'doc:section:1', target: 'doc:section:2', documentIds: ['doc'] }))
    expect(ns).toContainEqual(expect.objectContaining({ source: 'doc:section:2', target: 'doc:section:3', documentIds: ['doc'] }))
    // doc-head source = h1, doc-end source = h3
    expect(edgesOfKind(p, 'doc-head')[0].source).toBe('doc:section:1')
    expect(edgesOfKind(p, 'doc-end')[0].source).toBe('doc:section:3')
    // ONLY the first section carries the doc-head marker (R7)
    expect(h1.props).toMatchObject({ 'data-doc-head': true })
    expect(h2.props?.['data-doc-head']).not.toBe(true)
    expect(h3.props?.['data-doc-head']).not.toBe(true)
    const v = validateDocFlow(p.nodes, p.edges, 'doc')
    expect(v).toEqual({ ok: true, order: ['doc:section:1', 'doc:section:2', 'doc:section:3'] })
  })

  it('3. paragraph body → p doc-child (order 0) with content; parent-child + doc-child edges', () => {
    const p = parseMarkdown('# A\n\nSome text.\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.type).toBe('p')
    expect(para.content).toBe('Some text.')
    // parent-child h1 → p
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'doc:section:1', target: 'doc:p:1' }))
    // doc-child h1 → p order 0
    expect(edgesOfKind(p, 'doc-child')).toContainEqual(expect.objectContaining({ source: 'doc:section:1', target: 'doc:p:1', order: 0 }))
  })

  it('4. list → ul doc-child of h1 + two li doc-children of the ul (DOC-CHILD)', () => {
    const p = parseMarkdown('# A\n\n- one\n- two\n', 'doc')
    const ul = nodeById(p, 'doc:ul:1')
    expect(ul.type).toBe('ul')
    const li1 = nodeById(p, 'doc:li:1')
    const li2 = nodeById(p, 'doc:li:2')
    expect(li1.type).toBe('li')
    expect(li2.type).toBe('li')
    // parent-child ul → li1, ul → li2
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'doc:ul:1', target: 'doc:li:1' }))
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'doc:ul:1', target: 'doc:li:2' }))
    // doc-child ul → li1 order 0, ul → li2 order 1
    expect(edgesOfKind(p, 'doc-child')).toContainEqual(expect.objectContaining({ source: 'doc:ul:1', target: 'doc:li:1', order: 0 }))
    expect(edgesOfKind(p, 'doc-child')).toContainEqual(expect.objectContaining({ source: 'doc:ul:1', target: 'doc:li:2', order: 1 }))
  })

  it('5. table → table/thead/tr/td/th doc-children (the additive RagNodeType members)', () => {
    const p = parseMarkdown('# A\n\n| h1 | h2 |\n|---|---|\n| a | b |\n', 'doc')
    const table = nodeById(p, 'doc:table:1')
    expect(table.type).toBe('table')
    const thead = nodeById(p, 'doc:thead:1')
    expect(thead.type).toBe('thead')
    const tr = nodeById(p, 'doc:tr:1')
    expect(tr.type).toBe('tr')
    // th cells under thead, td cells under tr
    expect(p.nodes.some((n) => n.type === 'th')).toBe(true)
    expect(p.nodes.some((n) => n.type === 'td')).toBe(true)
    // parent-child table → thead, table → tr
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'doc:table:1', target: 'doc:thead:1' }))
    expect(edgesOfKind(p, 'parent-child')).toContainEqual(expect.objectContaining({ source: 'doc:table:1', target: 'doc:tr:1' }))
  })

  it('6. inline formatting → inline children (strong/em hoisted to siblings; the plain text is the content)', () => {
    const p = parseMarkdown('# A\n\nSome **bold** and *em*.\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('Some  and .')
    expect(para.children).toEqual([
      { type: 'strong', content: 'bold' },
      { type: 'em', content: 'em' },
    ])
  })

  it('7. inline code folded: backticks stripped, code text folded into the content, NO code child', () => {
    const p = parseMarkdown('# A\n\nUse `code` here.\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('Use code here.')
    expect(para.children).toBeUndefined()
  })

  it('8. safe link → a child with props { href }', () => {
    const p = parseMarkdown('# A\n\n[link](https://x)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.children).toEqual([{ type: 'a', content: 'link', props: { href: 'https://x' } }])
  })

  it('9. safe image → img child with props { src, alt }', () => {
    const p = parseMarkdown('# A\n\n![alt](https://x/i.png)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.children).toEqual([{ type: 'img', content: '', props: { src: 'https://x/i.png', alt: 'alt' } }])
  })

  it('10. setext heading: === underline → h1 section', () => {
    const p = parseMarkdown('Title\n=====\n', 'doc')
    const h1 = nodeById(p, 'doc:section:1')
    expect(h1.type).toBe('h1')
    expect(h1.content).toBe('Title')
  })

  it('11. blockquote → blockquote doc-child of h1; its inner block → a doc-child of the blockquote', () => {
    const p = parseMarkdown('# A\n\n> quoted\n', 'doc')
    const bq = nodeById(p, 'doc:blockquote:1')
    expect(bq.type).toBe('blockquote')
    // the inner block is a doc-child of the blockquote
    const inner = p.nodes.find((n) => n.type === 'p')
    expect(inner).toBeDefined()
    expect(edgesOfKind(p, 'doc-child')).toContainEqual(expect.objectContaining({ source: 'doc:blockquote:1', target: inner!.id }))
  })

  it('12. fenced code block → pre doc-child with content, NO children', () => {
    const p = parseMarkdown('# A\n\n```\ncode\n```\n', 'doc')
    const pre = nodeById(p, 'doc:pre:1')
    expect(pre.type).toBe('pre')
    expect(pre.content).toBe('code')
    expect(pre.children).toBeUndefined()
  })

  it('13. horizontal rule dropped: --- produces NO node; the p is the only doc-child of h1', () => {
    const p = parseMarkdown('# A\n\n---\n\nText\n', 'doc')
    const h1 = nodeById(p, 'doc:section:1')
    const docChildren = edgesOfKind(p, 'doc-child').filter((e) => e.source === 'doc:section:1')
    expect(docChildren).toHaveLength(1)
    expect(docChildren[0].target).toBe('doc:p:1')
    expect(nodeById(p, 'doc:p:1').content).toBe('Text')
  })

  it('14. raw HTML dropped entirely: <div> produces NO node and NO text (A8)', () => {
    const p = parseMarkdown('# A\n\n<div>html</div>\n', 'doc')
    const h1 = nodeById(p, 'doc:section:1')
    expect(edgesOfKind(p, 'doc-child').filter((e) => e.source === 'doc:section:1')).toHaveLength(0)
    // no node carries the dropped HTML text
    expect(p.nodes.some((n) => n.content.includes('html'))).toBe(false)
  })

  it('15. empty preamble: no content before the first heading → the document root has NO doc-children', () => {
    const p = parseMarkdown('# A\n\nBody\n', 'doc')
    const root = nodeById(p, 'doc')
    expect(edgesOfKind(p, 'doc-child').filter((e) => e.source === 'doc')).toHaveLength(0)
  })

  it('21. determinism: parseMarkdown("# A\\n", "a") twice returns the SAME ParsedMarkdown (deep-equal)', () => {
    const a = parseMarkdown('# A\n', 'a')
    const b = parseMarkdown('# A\n', 'a')
    expect(a).toEqual(b)
  })

  it('22. totality on malformed markdown: an unclosed code fence returns a best-effort ParsedMarkdown (never throws)', () => {
    let p: ParsedMarkdown
    expect(() => { p = parseMarkdown('```unclosed', 'a') }).not.toThrow()
    expect(p!.documentId).toBe('a')
    expect(Array.isArray(p!.nodes)).toBe(true)
    expect(Array.isArray(p!.edges)).toBe(true)
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (parser-relevant)
// ===========================================================================
describe('markdown-parse — Unit T fail-states (§5.7)', () => {
  it('1. non-string markdown or an empty documentId → throws Error("markdown parse: markdown/documentId required") (the ONLY parser throw)', () => {
    expect(() => parseMarkdown(undefined as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown(null as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown(42 as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown('# A\n', '')).toThrow('markdown parse: markdown/documentId required')
  })

  it('8. an unsafe link href ([x](javascript:alert(1))) → the a is DEMOTED to plain text (no a child, no javascript: URL) (A7)', () => {
    const p = parseMarkdown('# A\n\n[x](javascript:alert(1))\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.children).toBeUndefined()
    expect(para.content).toContain('x')
    // no a child anywhere in the output
    expect(p.nodes.some((n) => n.children?.some((c) => c.type === 'a'))).toBe(false)
  })

  it('9. an unsafe image src (![x](data:text/html,y)) → the img is DROPPED (no img child) (A7)', () => {
    const p = parseMarkdown('# A\n\n![x](data:text/html,y)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.children).toBeUndefined()
    expect(p.nodes.some((n) => n.children?.some((c) => c.type === 'img'))).toBe(false)
  })

  it('10. raw HTML dropped: <script>alert(1)</script> → the script AND its content are dropped (no text, no child) (A8)', () => {
    const p = parseMarkdown('# A\n\n<script>alert(1)</script>\n', 'doc')
    expect(p.nodes.some((n) => n.content.includes('alert'))).toBe(false)
    const h1 = nodeById(p, 'doc:section:1')
    expect(edgesOfKind(p, 'doc-child').filter((e) => e.source === 'doc:section:1')).toHaveLength(0)
  })

  it('10a. UNCLOSED inline raw HTML dropped: Some <script>alert(1) (no close tag) → the content after the opening tag is dropped through end-of-input (A8)', () => {
    const p = parseMarkdown('# A\n\nSome <script>alert(1)\n', 'doc')
    // the text BEFORE the opening tag survives as plain text
    expect(p.nodes.some((n) => n.content.includes('Some'))).toBe(true)
    // the content AFTER the unclosed opening tag is dropped (no alert survives)
    expect(p.nodes.some((n) => n.content.includes('alert'))).toBe(false)
  })

  it('10b. a numeric HTML ref with a code point > 0x10FFFF in a URL does NOT throw (TOTAL — A1)', () => {
    // `&#xFFFFFFFF;` decodes to a code point > 0x10FFFF — String.fromCodePoint
    // would throw a RangeError; the parser must NOT throw (TOTAL).
    expect(() => parseMarkdown('# A\n\n[link](https://x/&#xFFFFFFFF;)\n', 'doc')).not.toThrow()
  })

  it('10c. a deeply nested blockquote does NOT throw (TOTAL — A1)', () => {
    const deep = '# A\n\n' + '> '.repeat(5000) + 'x\n'
    expect(() => parseMarkdown(deep, 'doc')).not.toThrow()
  })

  it('10d. a deeply nested inline does NOT throw (TOTAL — A1)', () => {
    const deep = '# A\n\n' + '**'.repeat(5000) + 'x' + '**'.repeat(5000) + '\n'
    expect(() => parseMarkdown(deep, 'doc')).not.toThrow()
  })
})
