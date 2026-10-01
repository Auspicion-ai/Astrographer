// tests/unit-u-shell-1-w2n4-operator-grid-area.test.ts — Wave-2 follow-up
// W2-N4 (adversarial AF-4): the operator-pane grid-area dead rule.
//
// Regression: `index.html` authored `.layout #operator-panes { grid-area: right }`
// (specificity 0,1,1,0 — id + class) which BEATS the later
// `#operator-panes { grid-column: 1 / -1 }` (specificity 0,1,0,0), so the
// operator pane occupied the app `right` pane zone. Operator panes are
// modal-confined (C3) and must NOT occupy an app pane zone.
//
// The contract (unit-u-shell-1-layout-zones.md §2.4/§2.7 AF-4): the dead
// `grid-area: right` rule is removed so the intended spanning rule wins.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const html = readFileSync(
  fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
  'utf8',
)
const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

interface CssRule {
  /** The individual selectors in the (comma-separated) selector list. */
  selectors: string[]
  /** Parsed `property: value` declarations. */
  decls: Array<{ prop: string; value: string }>
}

/** A deliberately tiny stylesheet parser (no dependency): strip comments, then
 *  read `selector{...}` blocks. Sufficient for the shell's flat style sheet. */
function parseRules(css: string): CssRule[] {
  const rules: CssRule[] = []
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const blockRe = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = blockRe.exec(noComments)) != null) {
    const selectors = m[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const decls = m[2]
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const idx = d.indexOf(':')
        return { prop: d.slice(0, idx).trim(), value: d.slice(idx + 1).trim() }
      })
    rules.push({ selectors, decls })
  }
  return rules
}

/** Every declaration that applies to `#operator-panes` (any selector in the
 *  rule's list targets it). */
function declarationsFor(id: string): Array<{ prop: string; value: string }> {
  const decls: Array<{ prop: string; value: string }> = []
  for (const rule of parseRules(style)) {
    const targets = rule.selectors.filter((s) => s.includes(`#${id}`))
    if (targets.length === 0) continue
    decls.push(...rule.decls)
  }
  return decls
}

describe('W2-N4 — the operator pane does not occupy the app `right` zone', () => {
  it('index.html declares NO `grid-area: right` rule for #operator-panes (the dead AF-4 rule is removed)', () => {
    const decls = declarationsFor('operator-panes')
    const gridAreaRight = decls.filter(
      (d) => d.prop === 'grid-area' && /(^|\s)right(\s|$)/.test(d.value),
    )
    expect(gridAreaRight).toEqual([])
  })

  it('the intended spanning rule for #operator-panes wins (grid-column: 1 / -1)', () => {
    const decls = declarationsFor('operator-panes')
    const spanning = decls.filter(
      (d) => d.prop === 'grid-column' && /1\s*\/\s*-1/.test(d.value),
    )
    expect(spanning.length).toBeGreaterThan(0)
  })
})
