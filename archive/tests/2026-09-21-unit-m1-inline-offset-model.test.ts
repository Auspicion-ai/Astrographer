// tests/unit-m1-inline-offset-model.test.ts — Unit M1: the `offset?: number`
// model + the full-projection producers (docs/specs/unit-m1-inline-offset-model.md
// §5.6 happy-path states 1–17 + §5.7 fail-states 1–10).
//
// This is the TestWriter RED set — it pins the NEW model that the M1
// implementation does NOT yet satisfy:
//
//   - `RagNodeChild.offset?: number` does NOT exist on the current type/emitters
//     → every child-offset assertion fails (`offset` is `undefined`).
//   - `RagNode.content` is currently PARENT-ONLY text (child text excluded)
//     → the full-projection `content` assertions fail.
//   - The three producers (`parseMarkdown`→`parseInline`, `sanitizePastedHtml`,
//     `decomposeRichHtml`) currently emit parent-only `content` + offset-less
//     children → the §5.3/§5.4 full-projection + offset expectations fall.
//
// The tests derive the pinned expected values from the spec ALONE (§5.2/§5.3/§5.4
// + the §5.6/§5.7 worked numbers). All three producers are PURE (no Electron,
// no DOM), so the whole red set is node-testable — no `.skip` block.
//
// §5.6-1 TYPE assert (documented): the amended `RagNodeChild` exposes
// `offset?: number`. The CURRENT type has no `offset` member. The repo's
// `tsconfig.json` EXCLUDES `tests/`, so this is not surfaced by `npm run
// typecheck`; the runtime §5.6-1 test below ("offset present" + §5.7-1/2 bound)
// is the executable red for the field's absence.
const _M1OffsetKey: keyof RagNodeChild = 'offset'

import { describe, it, expect } from 'vitest'
import {
  parseMarkdown,
  type ParsedMarkdown,
} from '../src/main/markdown-parse.js'
import {
  sanitizePastedHtml,
} from '../src/main/paste-sanitize.js'
import { decomposeRichHtml } from '../src/main/rich-decompose.js'
import type { RagNode, RagNodeChild } from '../src/main/rag-store.js'

/** Narrow a `{ ok: true } | { ok: false }` result to its success arm. */
function expectOk<T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + (result as { error?: string }).error)
  return result as Extract<T, { ok: true }>
}

/** Find a produced node by id (asserting it exists). */
function nodeById(p: ParsedMarkdown, id: string): RagNode {
  const n = p.nodes.find((x) => x.id === id)
  expect(n).toBeDefined()
  return n!
}

/**
 * §5.2/§5.5 full-projection SPLICE reconstruction (the A7 gate statement:
 * "splice child contents at offsets"). Given the node's stored `content` (the
 * FULL plain-text projection) + its `children`, verifies each child run actually
 * occupies `content[offset, offset + child.content.length)`, grouping nested
 * back-to-back siblings (equal offsets) into one contiguous run (§5.3). Returns
 * `content` when consistent; throws otherwise (the §5.7-4 model-invariant
 * fail-state).
 */
function spliceProjection(content: string, children: RagNodeChild[] | undefined): string {
  if (children === undefined || children.length === 0) return content
  const groups: { offset: number; text: string }[] = []
  for (const c of children) {
    if (typeof c.offset !== 'number') {
      throw new Error(`splice: child '${c.type}' (${c.content}) has no offset`)
    }
    const last = groups[groups.length - 1]
    if (last && last.offset === c.offset) last.text += c.content
    else groups.push({ offset: c.offset, text: c.content })
  }
  for (const g of groups) {
    const run = content.slice(g.offset, g.offset + g.text.length)
    if (run !== g.text) {
      throw new Error(
        `splice: content[${g.offset}..${g.offset + g.text.length}) = '${run}' ` +
        `!= child contents '${g.text}'`,
      )
    }
  }
  return content
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (1–17) — the parser + the two HTML producers
// ===========================================================================
describe('unit-m1 — the offset model + full-projection producers (§5.6)', () => {
  it('1. RagNodeChild.offset is present on produced children: a non-negative integer in [0, content.length]', () => {
    // §5.6-1 (field present) + §5.7-1/§5.7-2 (the A1 bound) asserted at RUNTIME:
    // a produced child must carry a numeric offset within the §5.5 bound.
    const p = parseMarkdown('# A\n\npre **b** post\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(Array.isArray(para.children)).toBe(true)
    for (const c of para.children!) {
      expect(typeof c.offset).toBe('number')
      expect(Number.isInteger(c.offset)).toBe(true)
      expect(c.offset!).toBeGreaterThanOrEqual(0)
      expect(c.offset!).toBeLessThanOrEqual(para.content.length)
    }
  })

  it('2.  pre **b** post → full projection content + strong offset 4 (leading + child + trailing)', () => {
    const p = parseMarkdown('# A\n\npre **b** post\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('pre b post')
    expect(para.children).toEqual([{ type: 'strong', content: 'b', offset: 4 }])
  })

  it('3.  full-projection splice reconstruction reproduces content (§5.6-2 output)', () => {
    const p = parseMarkdown('# A\n\npre **b** post\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(spliceProjection(para.content, para.children)).toBe(para.content)
  })

  it('4.  reported defect: **Proposal:** Astrographer → proposal runs FIRST at offset 0', () => {
    const p = parseMarkdown('# A\n\n**Proposal:** Astrographer\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('Proposal: Astrographer')
    expect(para.children).toEqual([{ type: 'strong', content: 'Proposal:', offset: 0 }])
    expect(spliceProjection(para.content, para.children)).toBe(para.content)
  })

  it('5.  nested flatten: **bold *em* tail** → em inherits strong offset 0; content is the flattened splice', () => {
    const p = parseMarkdown('# A\n\n**bold *em* tail**\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('bold  tailem')
    expect(para.children).toEqual([
      { type: 'strong', content: 'bold  tail', offset: 0 },
      { type: 'em', content: 'em', offset: 0 },
    ])
    expect(spliceProjection(para.content, para.children)).toBe(para.content)
  })

  it('6.  inline code folded into the full projection with NO child/offset', () => {
    const p = parseMarkdown('# A\n\nUse `code` here.\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('Use code here.')
    expect(para.children).toBeUndefined()
  })

  it('7.  all four child types at distinct top-level offsets + full-projection splice', () => {
    const p = parseMarkdown('# A\n\nSome **bold**, [link](https://x) *em* ![alt](https://x/i.png)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('Some bold, link em ')
    expect(para.children).toEqual([
      { type: 'strong', content: 'bold', offset: 5 },
      { type: 'a', content: 'link', offset: 11, props: { href: 'https://x' } },
      { type: 'em', content: 'em', offset: 16 },
      { type: 'img', content: '', offset: 19, props: { src: 'https://x/i.png', alt: 'alt' } },
    ])
    // distinct, strictly-increasing top-level offsets
    const offs = para.children!.map((c) => c.offset!)
    expect([...offs].sort((a, b) => a - b)).toEqual(offs)
    expect(offs).toEqual([5, 11, 16, 19])
    expect(spliceProjection(para.content, para.children)).toBe(para.content)
  })

  it('8.  unsafe href demotes the a to plain text: text in content, NO a child/offset', () => {
    const p = parseMarkdown('# A\n\n[x](javascript:alert(1))\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toContain('x')
    expect(para.children ?? []).toEqual([])
    expect(p.nodes.some((n) => n.children?.some((c) => c.type === 'a'))).toBe(false)
  })

  it('9.  unsafe/missing img src drops the img: no img child, no text contributed', () => {
    const p = parseMarkdown('# A\n\n![x](data:text/html,y)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    expect(para.content).toBe('')
    expect(para.children ?? []).toEqual([])
    expect(p.nodes.some((n) => n.children?.some((c) => c.type === 'img'))).toBe(false)
  })

  it('10. sanitizePastedHtml: full-projection content + every child offset in [0, content.length] + splice', () => {
    const r = expectOk(sanitizePastedHtml('Hello <strong>bold</strong> and <em>em</em>!'))
    expect(r.content).toBe('Hello bold and em!')
    expect(r.children).toEqual([
      { type: 'strong', content: 'bold', offset: 6 },
      { type: 'em', content: 'em', offset: 15 },
    ])
    for (const c of r.children) {
      expect(c.offset!).toBeGreaterThanOrEqual(0)
      expect(c.offset!).toBeLessThanOrEqual(r.content.length)
    }
    expect(spliceProjection(r.content, r.children)).toBe(r.content)
  })

  it('11. sanitizePastedHtml span fold + hoist: hoisted child carries its rebased offset', () => {
    const r = expectOk(sanitizePastedHtml('<span>pre <strong>bold</strong> post</span>'))
    expect(r.content).toBe('pre bold post')
    // 'pre ' = 4 chars, so 'bold' starts at content offset 4 (NOT 5)
    expect(r.children).toEqual([{ type: 'strong', content: 'bold', offset: 4 }])
    expect(spliceProjection(r.content, r.children)).toBe(r.content)
  })

  it('12. sanitizePastedHtml image offset slot: an img child (empty content) still carries an offset at its document position', () => {
    const r = expectOk(sanitizePastedHtml('A <img src="https://x/i.png" alt="i"> B'))
    expect(r.content).toBe('A ')
    expect(r.children).toEqual([{ type: 'img', content: '', offset: 2, props: { src: 'https://x/i.png', alt: 'i' } }])
    expect(spliceProjection(r.content, r.children)).toBe(r.content)
  })

  it('13. decomposeRichHtml: full-projection content + every child offset in [0, content.length] + splice', () => {
    const r = expectOk(decomposeRichHtml('Hello <strong>bold</strong> and <em>em</em>!'))
    expect(r.content).toBe('Hello bold and em!')
    expect(r.children).toEqual([
      { type: 'strong', content: 'bold', offset: 6 },
      { type: 'em', content: 'em', offset: 15 },
    ])
    for (const c of r.children) {
      expect(c.offset!).toBeGreaterThanOrEqual(0)
      expect(c.offset!).toBeLessThanOrEqual(r.content.length)
    }
    expect(spliceProjection(r.content, r.children)).toBe(r.content)
  })

  it('14. decomposeRichHtml nested b→strong / i→em: the flattened sibling inherits the outer child offset', () => {
    const r = expectOk(decomposeRichHtml('<b>bold <i>italic</i> tail</b>'))
    expect(r.content).toBe('bold  tailitalic')
    expect(r.children).toEqual([
      { type: 'strong', content: 'bold  tail', offset: 0 },
      { type: 'em', content: 'italic', offset: 0 },
    ])
    expect(spliceProjection(r.content, r.children)).toBe(r.content)
  })

  it('15. decomposeRichHtml img void slot: safe img carries an offset at its position; a dropped img contributes nothing', () => {
    const safe = expectOk(decomposeRichHtml('A <img src="https://x/i.png" alt="i"> B'))
    expect(safe.content).toBe('A  B')
    expect(safe.children).toEqual([{ type: 'img', content: '', offset: 2, props: { src: 'https://x/i.png', alt: 'i' } }])
    // a dropped (unsafe src) img: no child, nothing contributed
    const dropped = expectOk(decomposeRichHtml('<img src="data:text/html,y">'))
    expect(dropped.children).toEqual([])
    expect(dropped.content).toBe('')
  })

  it('16. offset === content.length is allowed (a child whose run is the last slot, no throw)', () => {
    const r = expectOk(decomposeRichHtml('A <img src="https://x/i.png">'))
    expect(r.content).toBe('A ')
    expect(r.children[0].offset).toBe(r.content.length)
  })

  it('17. determinism: the same input to any producer produces the SAME content + offsets (deep-equal)', () => {
    const mk = parseMarkdown('# A\n\npre **b** post\n', 'doc')
    const m1 = nodeById(mk, 'doc:p:1').children
    const m2 = nodeById(parseMarkdown('# A\n\npre **b** post\n', 'doc'), 'doc:p:1').children
    expect(m1).toEqual(m2)
    expect(sanitizePastedHtml('<strong>bold</strong>')).toEqual(sanitizePastedHtml('<strong>bold</strong>'))
    expect(decomposeRichHtml('<strong>bold</strong>')).toEqual(decomposeRichHtml('<strong>bold</strong>'))
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (1–10)
// ===========================================================================
describe('unit-m1 — offset bound + producer invariants + the unchanged fail contracts (§5.7)', () => {
  // Representative outputs across all three producers — used for the invariant
  // fail-state assertions 1–4.
  const representative = (): { content: string; children: RagNodeChild[] }[] => {
    const s = expectOk(sanitizePastedHtml('Hello <strong>bold</strong> and <em>em</em>!'))
    const d = expectOk(decomposeRichHtml('<b>bold <i>italic</i> tail</b>'))
    const p = parseMarkdown('# A\n\nSome **bold**, [link](https://x) *em* ![alt](https://x/i.png)\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    return [
      { content: s.content, children: s.children },
      { content: d.content, children: d.children },
      { content: para.content, children: para.children ?? [] },
    ]
  }

  it('1.   a producer MUST NOT emit a negative offset (A1) — every emitted offset >= 0', () => {
    for (const { content, children } of representative()) {
      for (const c of children) {
        expect(typeof c.offset).toBe('number')
        expect(c.offset!).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('2.   a producer MUST NOT emit offset > content.length (A1) — every emitted offset <= content.length', () => {
    for (const { content, children } of representative()) {
      expect(content.length).toBeGreaterThanOrEqual(0)
      for (const c of children) {
        expect(typeof c.offset).toBe('number')
        expect(c.offset!).toBeLessThanOrEqual(content.length)
      }
    }
  })

  it('3.   a producer MUST emit offset on EVERY inline child it emits (A2) — no offset-less child among siblings', () => {
    const s = expectOk(sanitizePastedHtml('Hello <strong>bold</strong> and <em>em</em>!'))
    const d = expectOk(decomposeRichHtml('<b>bold <i>italic</i> tail</b>'))
    const p = parseMarkdown('# A\n\n**bold *em* tail**\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    for (const children of [s.children, d.children, para.children ?? []]) {
      for (const c of children) {
        expect(typeof c.offset).toBe('number')
      }
    }
  })

  it('4.   splice reconstruction === content for representative producer outputs (§5.2/§5.7-4)', () => {
    for (const { content, children } of representative()) {
      expect(spliceProjection(content, children)).toBe(content)
    }
  })

  it('5.   nested flatten inherits the OUTER slot (A3): the flattened sibling shares the outer offset (not a distinct mid-span offset)', () => {
    const p = parseMarkdown('# A\n\n**bold *em* tail**\n', 'doc')
    const [strong, em] = nodeById(p, 'doc:p:1').children ?? []
    expect(strong.offset).toBe(0)
    expect(em.offset).toBe(strong.offset) // shared back-to-back slot, NOT 5 (a mid-span offset)
  })

  it('6.   parseMarkdown non-string markdown or empty documentId → throws Error("markdown parse: markdown/documentId required") (UNCHANGED)', () => {
    expect(() => parseMarkdown(undefined as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown(null as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown(42 as never, 'a')).toThrow('markdown parse: markdown/documentId required')
    expect(() => parseMarkdown('# A\n', '')).toThrow('markdown parse: markdown/documentId required')
  })

  it('7.   sanitizePastedHtml on a non-string → { ok:false, error:"sanitizePastedHtml: input must be a string" } (UNCHANGED)', () => {
    for (const bad of [undefined, null, 42, {}]) {
      const r = sanitizePastedHtml(bad as never)
      expect(r.ok).toBe(false)
      expect((r as { error: string }).error).toBe('sanitizePastedHtml: input must be a string')
    }
  })

  it('8.   decomposeRichHtml on a non-string → { ok:false, error:"decomposeRichHtml: input must be a string" } (UNCHANGED)', () => {
    for (const bad of [undefined, null, 42, {}]) {
      const r = decomposeRichHtml(bad as never)
      expect(r.ok).toBe(false)
      expect((r as { error: string }).error).toBe('decomposeRichHtml: input must be a string')
    }
  })

  it('9.   depth-cap overflow flattens to plain text, never throws, the flattened text lands in content (TOTAL contract)', () => {
    const deep = '# A\n\n' + '**'.repeat(5000) + 'x' + '**'.repeat(5000) + '\n'
    let p: ParsedMarkdown
    expect(() => { p = parseMarkdown(deep, 'doc') }).not.toThrow()
    expect(nodeById(p!, 'doc:p:1').content).toContain('x')
  })

  it('10.  a span child type NEVER reaches the model (the closed RagNodeChildType union) — no producer emits one', () => {
    const s = expectOk(sanitizePastedHtml('<span><strong>bold</strong></span>'))
    const d = expectOk(decomposeRichHtml('<span>a <strong>b</strong> c</span>'))
    const p = parseMarkdown('# A\n\nSome **bold**\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    for (const children of [s.children, d.children, para.children ?? []]) {
      expect(children.some((c) => c.type === 'span')).toBe(false)
    }
  })
})

// ===========================================================================
// §5.4/§5.6-17 — the reported-defect ordering is covered via the offset model
// in the parse happy paths; this block confirms the three producers SHARE one
// model meaning (A5 producer consistency).
// ===========================================================================
describe('unit-m1 — A5 producer-consistency: all three producers emit full-projection content + offsets', () => {
  it('the full-projection invariant holds across parseMarkdown, sanitizePastedHtml and decomposeRichHtml for the equivalent "Hello <strong>bold</strong> world" shape', () => {
    const p = parseMarkdown('# A\n\nHello **bold** world\n', 'doc')
    const para = nodeById(p, 'doc:p:1')
    const s = expectOk(sanitizePastedHtml('Hello <strong>bold</strong> world'))
    const d = expectOk(decomposeRichHtml('Hello <strong>bold</strong> world'))
    // all three interpret the same content into the SAME full projection + same
    // leading child offset (child text inside content, offset = "Hello " length).
    const shared = { content: 'Hello bold world', children: [{ type: 'strong', content: 'bold', offset: 6 }] }
    expect(para.content).toBe(shared.content)
    expect(para.children).toEqual(shared.children)
    for (const r of [s, d]) {
      expect(r.content).toBe(shared.content)
      expect(r.children).toEqual(shared.children)
      expect(spliceProjection(r.content, r.children)).toBe(r.content)
    }
  })
})
