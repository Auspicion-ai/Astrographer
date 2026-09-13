// tests/unit-u-shell-1-w2n3-zone-size-grid.test.ts — Wave-2 follow-up W2-N3
// (adversarial AF-3): apply `ZoneLayout.size` (and `stage.size`/`topBar.size`)
// to the shell grid. `index.html` hardcoded the tracks; §2.4 says geometry reads
// the serialized sizes. The fix projects the layout onto CSS custom properties
// consumed by the grid tracks (the shell chrome is not a provident node).
//
// Regression contract (unit-u-shell-1-layout-zones.md §2.4/§2.7 AF-3):
//   - a persisted size is reflected in the applied CSS var / track geometry;
//   - invalid sizes fail soft (finite-positive preserved, never NaN/negative).
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  coerceLayout,
  defaultLayout,
  layoutCssVars,
  applyLayoutToRoot,
} from '../src/renderer/layout-state.js'

const html = readFileSync(
  fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
  'utf8',
)
const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

describe('W2-N3 — ZoneLayout.size drives the shell grid (CSS custom properties)', () => {
  it('projects a persisted zone/stage/topBar size onto the shell CSS custom properties', () => {
    const layout = coerceLayout({
      version: 1,
      zones: {
        left: { size: 333, minimized: false },
        right: { size: 444, minimized: false },
        header: { size: 48, minimized: false },
        footer: { size: 48, minimized: false },
      },
      stage: { size: 700 },
      topBar: { size: 44 },
    })
    const vars = layoutCssVars(layout)
    expect(vars['--zone-left-size']).toBe('333px')
    expect(vars['--zone-right-size']).toBe('444px')
    expect(vars['--zone-header-size']).toBe('48px')
    expect(vars['--zone-footer-size']).toBe('48px')
    expect(vars['--stage-weight']).toBe('700fr')
    expect(vars['--top-bar-size']).toBe('44px')
  })

  it('falls soft on invalid sizes: a finite-positive track is always produced (never NaN/Infinity/negative)', () => {
    const layout = coerceLayout({
      version: 1,
      zones: {
        left: { size: -5, minimized: false },
        right: { size: Number.NaN, minimized: false },
        header: { size: Number.POSITIVE_INFINITY, minimized: false },
        footer: { size: -Number.POSITIVE_INFINITY, minimized: false },
      },
      stage: { size: Number.NaN },
      topBar: { size: Number.POSITIVE_INFINITY },
    })
    const vars = layoutCssVars(layout)
    for (const [name, value] of Object.entries(vars)) {
      const n = Number.parseFloat(value)
      expect(Number.isFinite(n), `${name} must be finite`).toBe(true)
      expect(n, `${name} must be positive`).toBeGreaterThan(0)
    }
  })

  it('applyLayoutToRoot writes every CSS custom property to the injected root (fail-soft)', () => {
    const setProperty = vi.fn()
    const root = { style: { setProperty } }
    const layout = defaultLayout()
    applyLayoutToRoot(root, layout)
    expect(setProperty).toHaveBeenCalled()
    const names = setProperty.mock.calls.map((c) => c[0])
    expect(names).toContain('--zone-left-size')
    expect(names).toContain('--stage-weight')
    expect(names).toContain('--top-bar-size')
  })

  it('index.html consumes the layout CSS vars in the grid tracks (the persisted size drives geometry)', () => {
    expect(style).toMatch(/var\(--zone-left-size/)
    expect(style).toMatch(/var\(--zone-right-size/)
    expect(style).toMatch(/var\(--stage-weight/)
    expect(style).toMatch(/var\(--top-bar-size/)
  })
})
