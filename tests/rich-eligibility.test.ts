// tests/rich-eligibility.test.ts — Unit U3: the PURE rich-text editing
// eligibility gate `isRichEditableRoot` + the closed `EDITABLE_TYPES` set
// (docs/specs/unit-u3-rich-eligibility-splice.md §1.2/§2/§3).
//
// This is the TestWriter RED set — `src/renderer/rich-eligibility.ts` does NOT
// exist yet, so the import at the bottom FAILS at module load → the WHOLE
// suite is red (the expected red set: "module does not exist").
//
// The function is PURE (no Electron, no DOM, no host state) — the ENTIRE
// contract is node-testable with NO `.skip`:
//   - all 23 `RagNodeType` members × `ownsDocChildren` true/false (§2.1 states
//     1-9);
//   - the primary rich-text case — a node with INLINE children (ownsDocChildren
//     false) is eligible (§2.1 state 10);
//   - `EDITABLE_TYPES` membership/census: exactly 9 members (§3: 9, NOT the
//     miscounted "7");
//   - the §2.2 fail-states (non-member type → false; totality — never throws).
//
// The test file is derived from the spec ALONE. The Implementer makes this file
// green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import type { RagNodeType } from '../src/main/rag-store.js'
import {
  isRichEditableRoot,
  EDITABLE_TYPES,
} from '../src/renderer/rich-eligibility.js'

/** The pinned `EDITABLE_TYPES` members (spec §1.2 decision E, §3 — 9 members). */
const EDITABLE_MEMBERS: RagNodeType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'div']
/** The pinned NON-eligible `RagNodeType` members (spec §3 — 14 members). */
const NON_EDITABLE_MEMBERS: RagNodeType[] = [
  'ul', 'ol', 'li', 'pre', 'code',
  'strong', 'em', 'a', 'img',
  'table', 'thead', 'tr', 'td', 'th',
]
/** The closed `RagNodeType` union (spec §3 — 23 members). */
const ALL_MEMBERS: RagNodeType[] = [...EDITABLE_MEMBERS, ...NON_EDITABLE_MEMBERS]

// ===========================================================================
// MODULE-EXISTENCE RED (1)
// ===========================================================================
describe('rich-eligibility — module existence', () => {
  it('RED — isRichEditableRoot is not exported yet (module does not exist)', () => {
    expect(typeof isRichEditableRoot).toBe('function')
  })

  it('RED — EDITABLE_TYPES is not exported yet (module does not exist)', () => {
    expect(typeof EDITABLE_TYPES).toBe('object')
  })
})

// ===========================================================================
// §3 CENSUS — the closed set + membership
// ===========================================================================
describe('rich-eligibility — EDITABLE_TYPES census (§3)', () => {
  it('EDITABLE_TYPES is a ReadonlySet<RagNodeType> with EXACTLY the 9 pinned members (h1–h6, p, blockquote, div)', () => {
    expect(EDITABLE_TYPES).toBeInstanceOf(Set)
    expect(EDITABLE_TYPES.size).toBe(9)
    for (const t of EDITABLE_MEMBERS) expect(EDITABLE_TYPES.has(t)).toBe(true)
  })

  it('the 14 NON-editable members are NOT in EDITABLE_TYPES (9 + 14 = 23)', () => {
    for (const t of NON_EDITABLE_MEMBERS) expect(EDITABLE_TYPES.has(t)).toBe(false)
  })

  it('EDITABLE_TYPES covers exactly the closed 23-member RagNodeType union (no extra, none missing)', () => {
    // Every RagNodeType member is accounted for; the set holds only members.
    for (const t of ALL_MEMBERS) expect(EDITABLE_TYPES.has(t)).toBe(Boolean(EDITABLE_MEMBERS.includes(t)))
  })
})

// ===========================================================================
// §2.1 HAPPY-PATH STATES (1-10)
// ===========================================================================
describe('rich-eligibility — eligible: ownsDocChildren=false (§2.1 states 1-4)', () => {
  it('1. h1..h6 (no doc-children) → true (each of the 6 heading types)', () => {
    for (const t of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const) {
      expect(isRichEditableRoot(t, false)).toBe(true)
    }
  })

  it('2. p (no doc-children) → true', () => {
    expect(isRichEditableRoot('p', false)).toBe(true)
  })

  it('3. blockquote (no doc-children) → true', () => {
    expect(isRichEditableRoot('blockquote', false)).toBe(true)
  })

  it('4. div (no doc-children) → true', () => {
    expect(isRichEditableRoot('div', false)).toBe(true)
  })
})

describe('rich-eligibility — NOT eligible: ownsDocChildren=false (§2.1 states 5-7)', () => {
  it('5. ul/ol/li/pre/code (no doc-children) → false (each)', () => {
    for (const t of ['ul', 'ol', 'li', 'pre', 'code'] as const) {
      expect(isRichEditableRoot(t, false)).toBe(false)
    }
  })

  it('6. strong/em/a/img (no doc-children) → false (each)', () => {
    for (const t of ['strong', 'em', 'a', 'img'] as const) {
      expect(isRichEditableRoot(t, false)).toBe(false)
    }
  })

  it('7. table/thead/tr/td/th (no doc-children) → false (each)', () => {
    for (const t of ['table', 'thead', 'tr', 'td', 'th'] as const) {
      expect(isRichEditableRoot(t, false)).toBe(false)
    }
  })
})

describe('rich-eligibility — ownsDocChildren=true (§2.1 states 8-9, all 23 → false)', () => {
  it('8. an EDITABLE_TYPES type WITH doc-children → false (a doc-child owner is never a rich-text leaf)', () => {
    for (const t of EDITABLE_MEMBERS) {
      expect(isRichEditableRoot(t, true)).toBe(false)
    }
  })

  it('9. a non-EDITABLE_TYPES type WITH doc-children → false', () => {
    for (const t of NON_EDITABLE_MEMBERS) {
      expect(isRichEditableRoot(t, true)).toBe(false)
    }
  })

  it('9b. EVERY RagNodeType member with ownsDocChildren=true → false (0 eligible doc-child owners, §3 census)', () => {
    for (const t of ALL_MEMBERS) expect(isRichEditableRoot(t, true)).toBe(false)
  })
})

describe('rich-eligibility — the primary rich-text case (§2.1 state 10)', () => {
  it('10. a node with INLINE children (strong/em/a/img RagNodeChilds) and NO doc-children → true (inline children are NOT rag-prefixed, so ownsDocChildren stays false)', () => {
    // The caller computes ownsDocChildren from the root's children: an INLINE
    // child (id `inline-<ragId>-<n>`) is not `rag-`-prefixed, so it never sets
    // ownsDocChildren → the rich node is eligible. This is the case the
    // contenteditable editor is built for.
    expect(isRichEditableRoot('p', false)).toBe(true)
    // A strong/em/a/img inline child never makes the parent a doc-child owner.
    for (const inline of ['strong', 'em', 'a', 'img'] as const) {
      expect(isRichEditableRoot(inline, false)).toBe(false) // the inline itself is not rich-editable
    }
  })
})

// ===========================================================================
// §2.2 FAIL-STATES (1) + totality + purity
// ===========================================================================
describe('rich-eligibility — fail-states + purity (§1.2 API rules)', () => {
  it('§2.2 fail-state 1 — a non-member type (NOT in the RagNodeType union) → false (not in EDITABLE_TYPES)', () => {
    expect(isRichEditableRoot('section' as never, false)).toBe(false)
    expect(isRichEditableRoot('section' as never, true)).toBe(false)
  })

  it('the function is TOTAL for ANY string type — never throws (a defensive caller passing a real RagNodeType value)', () => {
    for (const s of ['', 'section', 'aside', 'article', 'textarea', 'h7', 'HEADING']) {
      expect(() => isRichEditableRoot(s as never, false)).not.toThrow()
      expect(isRichEditableRoot(s as never, false)).toBe(false)
    }
  })

  it('PURE + DETERMINISTIC — the same (type, ownsDocChildren) pair ALWAYS returns the same boolean', () => {
    for (const t of ALL_MEMBERS) {
      const a = isRichEditableRoot(t, false)
      const b = isRichEditableRoot(t, false)
      expect(a).toBe(b)
      const c = isRichEditableRoot(t, true)
      const d = isRichEditableRoot(t, true)
      expect(c).toBe(d)
    }
  })

  it('return shape is ALWAYS a boolean (no throw path, no other return)', () => {
    for (const t of ALL_MEMBERS) {
      expect(typeof isRichEditableRoot(t, false)).toBe('boolean')
      expect(typeof isRichEditableRoot(t, true)).toBe('boolean')
    }
  })
})
