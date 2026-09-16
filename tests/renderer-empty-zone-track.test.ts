// tests/renderer-empty-zone-track.test.ts — F-3 EMPTY-ZONE-TRACK-NOT-COLLAPSED
// (docs/defects.md row F-3, live-confirmed 2026-09-15, block `uf_layout_10`).
//
// TestWriter RED set written from the defect row + the pinned contract in
// docs/specs/unit-u-shell-1-layout-zones.md §2.4 ("an empty zone's track
// collapses (derived from `is-empty`)"; "zero panes overall → the stage reclaims
// all zone space") + §2.5 Empty + §2.6 pins 4/6/8, and the H6 claim in
// docs/specs/unit-u-shell-4-drag-relocate.md (~line 142, currently INACCURATE).
//
// THE DEFECT: `src/renderer/index.html` (~131-134) declares the collapsed track
// `--zone-<z>-track: 0px` under `.is-empty:not(.is-revealed)`, but the
// `#app > #wiki-root` grid template (line 107) consumes `var(--zone-left-size)`
// directly — so the collapsed-track variable is DEFINED BUT NEVER CONSUMED.
// Live: with ZERO enabled+placed panes in `left`, the zone gets `is-empty` +
// `display:none` and 0 `.pane-frame`s, but the grid columns stay
// `160px 853.86px 220px` and the stage stays x=193 w=854 (unchanged).
//
// ===========================================================================
// STATE ENUMERATION (valid/happy-path states — one test per reasonable state)
//   Zone census (enabled+placed, post overlay/fallback — §2.6 pin 8 / H1):
//     S1 all four zones EMPTY (zero enabled+placed panes overall) — the
//        degenerate boot state; every zone track is 0px.
//     S2 `left` EMPTY, `right`/`header`/`footer` POPULATED — the live uf_layout_10
//        state: one collapsed track, three retained tracks.
//     S3 all four zones POPULATED — the pre-fix baseline; every track is the
//        persisted `--zone-*-size` (must be unchanged by the fix).
//     S4 `left` populated but its panes DISABLED in the registry — the census
//        (NOT the overlay) drives emptiness, so the track collapses.
//     S5 `left` EMPTY and REVEALED as a drag drop target (`is-revealed`) — the
//        C11 carve-out: the track is RETAINED (not 0px) while revealing.
//   Geometry/collapse states:
//     S6 stage weight unchanged by the collapse (the stage is the `1fr` track
//        that absorbs the reclaimed space).
//     S7 grid wiring: 4 per-zone track variables consumed by the template + 4
//        `is-empty` rules resolving each to 0px.
//     S8 scope: header/footer ARE in scope for this unit (F-3's fix covers the
//        single template + the four existing empty rules).
//
// FIXTURE SEMANTICS (remand 2026-09-15 — see `registryOf`): a `def(...)` is
//   census-visible only when ENABLED, because the F-3 census (`isZoneEmpty` →
//   `enabledZonePaneCounts`) counts enabled `app-graph` panes only. `registryOf`
//   does `register` + `enable`; states that need an EMPTY zone pass `[]` (zero
//   panes at all) or call `registry.disable(...)` on an enabled-then-disabled
//   pane. So: S1/S3d/S6/S6c/S5/F5/F6 = empty via `[]`; S4/F3 = empty via
//   `disable`; S2/F3b = empty via no ENABLED app-graph pane in that zone (the
//   operator-scope pane in F3b is excluded by SCOPE, not by enabled-ness).
// ===========================================================================
// ASSERTION-STYLE MAP (see the report):
//   - PURE-SEAM (`zoneTrackCssVars` in src/renderer/layout-state.ts, driven with
//     `createPaneRegistry()`): every state/behavior about the VALUES.
//   - SOURCE-PIN (parsed `index.html` text): only the CSS wiring that has no
//     pure seam — the custom-property declaration vs consumption, and the
//     `:has(.is-empty:not(.is-revealed))` guard.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { LegacyNodeData } from 'provident-ssr'
import {
  LAYOUT_PANE_ZONES,
  LAYOUT_ZONE_MAX,
  LAYOUT_ZONE_MIN,
  applyLayoutToRoot,
  coerceLayout,
  defaultLayout,
  layoutCssVars,
  zoneTrackCssVars,
  type LayoutState,
  type LayoutZoneName,
} from '../src/renderer/layout-state.js'
import { createPaneRegistry, type PaneDefinition } from '../src/renderer/pane-registry.js'

// ---------------------------------------------------------------------------
// Source surfaces (source-pin half)
// ---------------------------------------------------------------------------
const html = readFileSync(
  fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
  'utf8',
)
const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

/** The `#app > #wiki-root` rule body — the grid template + the per-zone track
 *  declarations live here (unit-u-shell-1-layout-zones.md §2.6 pin 8). */
function wikiRootBlock(source: string): string {
  const start = source.indexOf('#app > #wiki-root')
  if (start < 0) throw new Error('#app > #wiki-root rule not found in index.html')
  const end = source.indexOf('}', start)
  if (end < 0) throw new Error('unterminated #app > #wiki-root rule')
  return source.slice(start, end)
}

/** The declaration value of `prop` inside a CSS block, or null when absent. */
function declOf(block: string, prop: string): string | null {
  const re = new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`, 'm')
  const m = block.match(re)
  return m ? m[1].trim() : null
}

/** One `grid-template-columns` / `grid-template-rows` declaration value. */
function gridTemplateValue(source: string, prop: string): string {
  const block = wikiRootBlock(source)
  const value = declOf(block, prop)
  if (value == null) throw new Error(`index.html #wiki-root declares no ${prop}`)
  return value.replace(/\s+/g, ' ').trim()
}

/** The declaration that RESOLVES a zone's track in the base template, i.e. the
 *  base custom-property value that the collapsed-track rule overrides. */
function baseTrackDecl(source: string, zone: LayoutZoneName): string | null {
  return declOf(wikiRootBlock(source), `--zone-${zone}-track`)
}

/** Every top-level CSS rule whose selector list mentions the zone's
 *  `data-zone` hook (the empty/collapse rules live at top level). */
function rulesTouchingZone(source: string, zone: LayoutZoneName): string[] {
  const out: string[] = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    if (m[1].includes(`data-zone='${zone}'`) || m[1].includes(`data-zone="${zone}"`)) {
      out.push(`${m[1].trim()} { ${m[2].trim()} }`)
    }
  }
  return out
}

/** The rules that set the zone's COLLAPSED track (a `--zone-<z>-track`
 *  declaration), joined — the C11 empty-collapse wiring. */
function collapseTrackRules(source: string, zone: LayoutZoneName): string {
  return rulesTouchingZone(source, zone)
    .filter((r) => new RegExp(`--zone-${zone}-track\\s*:`).test(r))
    .join('\n')
}

// ---------------------------------------------------------------------------
// Pure seams (fixtures)
// ---------------------------------------------------------------------------
function def(
  id: string,
  scope: PaneDefinition['scope'],
  defaultZone: LayoutZoneName,
  defaultOrder: number,
): PaneDefinition {
  return {
    id,
    title: id,
    scope,
    render: (): LegacyNodeData => ({ type: 'div', props: {} }),
    defaultZone,
    defaultOrder,
  }
}

/** `left` = 2 app-graph panes, `right` = 1, `header`/`footer` = 1 each. */
const ALL_ZONES_POPULATED: PaneDefinition[] = [
  def('p-left-a', 'app-graph', 'left', 0),
  def('p-left-b', 'app-graph', 'left', 1),
  def('p-right', 'app-graph', 'right', 0),
  def('p-header', 'app-graph', 'header', 0),
  def('p-footer', 'app-graph', 'footer', 0),
]

// FIXTURE REPAIR (F-3 one-pass remand, 2026-09-15): `register` + `enable`.
//
// `createPaneRegistry()` leaves a newly-registered pane DISABLED — a spec-pinned
// contract (docs/specs/unit-u-shell-8-view-menu-pane-visibility.md §2.7 H6:
// `register → disabled`; `src/renderer/pane-registry.ts` `enabled.set(def.id,
// false)` on register). The F-3 census in `isZoneEmpty` (`layout-state.ts`,
// mirroring `enabledZonePaneCounts`, `pane-graph.ts:145`) counts enabled
// `app-graph` panes ONLY, and that is what the app's assembler uses to author
// `.is-empty` — so it MUST stay enabled-only; counting registered panes would
// make the seam disagree with the rendered DOM and re-break the live fix.
//
// Therefore a `def(...)` fixture is only census-visible once ENABLED, and this
// helper now does `register` then `enable` (the sibling unit's convention —
// `tests/unit-u-shell-4-drag-relocate.test.ts` `makeRegistry`). The
// enabled-then-disabled path stays explicitly exercised by the tests that call
// `registry.disable(...)` themselves (S4/F3 below), so "disabled ⇒ empty zone"
// is still pinned against a pane that WAS enabled.
function registryOf(defs: readonly PaneDefinition[]) {
  const registry = createPaneRegistry()
  for (const d of defs) {
    registry.register(d)
    registry.enable(d.id)
  }
  return registry
}

/** The persisted (dragged) geometry used by the state tests. */
function draggedLayout(): LayoutState {
  return coerceLayout({
    version: 1,
    panes: [],
    zones: {
      left: { size: 333, minimized: false },
      right: { size: 444, minimized: false },
      header: { size: 48, minimized: false },
      footer: { size: 44, minimized: false },
    },
    stage: { size: 700 },
    topBar: { size: 44 },
  })
}

function trackOf(vars: Record<string, string>, zone: LayoutZoneName): string {
  return vars[`--zone-${zone}-track`]
}

/** A track value's px magnitude (+Infinity/NaN pass through so a fail-state
 *  test can see them rather than silently reading 0). */
function trackPx(value: string): number {
  return Number.parseFloat(String(value).replace('px', ''))
}

// ===========================================================================
describe('F-3 empty-zone track: a collapsed-track variable exists AND is consumed (point 1)', () => {
  it('S1 all four zones empty (zero enabled+placed panes) → every zone track is 0px (not the default size)', () => {
    const registry = registryOf([])
    const vars = zoneTrackCssVars(registry, defaultLayout())
    expect(Object.keys(vars)).toEqual(
      expect.arrayContaining(LAYOUT_PANE_ZONES.map((z) => `--zone-${z}-track`)),
    )
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(trackOf(vars, zone), `${zone} track collapses to 0px`).toBe('0px')
    }
  })

  it('S1b the collapsed-track variable names are exactly the per-zone --zone-<z>-track set (the DEFECTED variable is consumed)', () => {
    // The defect: `--zone-*-track` is DEFINED BUT NEVER CONSUMED. The pin is that
    // the same variable the empty rule declares is the one emitted/consumed.
    const registry = registryOf([])
    const vars = zoneTrackCssVars(registry, defaultLayout())
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(Object.keys(vars)).toContain(`--zone-${zone}-track`)
    }
    expect(Object.keys(vars)).not.toContain('--zone-left-size')
  })

  it('S7 the #wiki-root grid template consumes the per-zone collapsed track variable (source-pin: no pure seam for CSS consumption)', () => {
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(
        gridTemplateValue(style, 'grid-template-columns') +
          ' ' +
          gridTemplateValue(style, 'grid-template-rows'),
        `the grid template must consume --zone-${zone}-track`,
      ).toContain(`--zone-${zone}-track`)
    }
  })

  it('S7b the grid template consumes ALL FOUR zone track variables and the stage track (source-pin)', () => {
    const templates = [
      gridTemplateValue(style, 'grid-template-columns'),
      gridTemplateValue(style, 'grid-template-rows'),
    ].join(' ')
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(templates, `the template must RESOLVE var(--zone-${zone}-track)`).toMatch(
        new RegExp(`var\\(\\s*--zone-${zone}-track`),
      )
    }
    expect(templates, 'the stage track must resolve var(--stage-weight)').toMatch(
      /var\(\s*--stage-weight/,
    )
  })

  it('S7c the empty-zone rule resolves the zone track to 0px (source-pin, behavioural: `.is-empty:not(.is-revealed)`)', () => {
    for (const zone of LAYOUT_PANE_ZONES) {
      const collapse = collapseTrackRules(style, zone)
      expect(collapse, `no rule sets --zone-${zone}-track`).not.toBe('')
      expect(collapse, `${zone} collapse must be 0px`).toMatch(
        new RegExp(`--zone-${zone}-track\\s*:\\s*0px`),
      )
      expect(collapse, `${zone} collapse must be gated by .is-empty`).toMatch(/\.is-empty/)
      expect(collapse, `${zone} collapse must be gated by :not(.is-revealed)`).toMatch(
        /:not\(\.is-revealed\)/,
      )
    }
  })

  it('S7d the template does not consume --zone-*-size as the empty case (the defect: size was the ONLY thing consumed)', () => {
    // The template may reference `--zone-<z>-size` ONLY as the populated default
    // of the track variable, never as the track expression itself.
    const templates = [
      gridTemplateValue(style, 'grid-template-columns'),
      gridTemplateValue(style, 'grid-template-rows'),
    ].join(' ')
    expect(templates).not.toMatch(/--zone-left-size/)
    expect(templates).not.toMatch(/--zone-right-size/)
    expect(templates).not.toMatch(/--zone-header-size/)
    expect(templates).not.toMatch(/--zone-footer-size/)
  })

  it('S7e fail-state: the track variable is consumed, not merely declared (every declared track has a resolution)', () => {
    // Guard against the exact defect shape: a track var declared but with no
    // resolution for a populated zone. S1 (empty) and S3 (populated) below pin
    // the two resolutions behaviourally; this pins that the static wiring exists.
    for (const zone of LAYOUT_PANE_ZONES) {
      const declared = baseTrackDecl(style, zone) ?? gridTemplateValue(style, 'grid-template-columns')
      expect(declared, `--zone-${zone}-track is never declared in #wiki-root`).not.toBe('')
      expect(declared, `${zone} populated track must resolve the persisted size`).toMatch(
        new RegExp(`var\\(\\s*--zone-${zone}-size`),
      )
    }
  })

  it('S8 the four zones are ALL in scope for this unit (header/footer NOT silently dropped)', () => {
    expect([...LAYOUT_PANE_ZONES].sort()).toEqual(['footer', 'header', 'left', 'right'])
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(collapseTrackRules(style, zone), `${zone} has no empty-collapse rule`).not.toBe('')
    }
  })
})

// ===========================================================================
describe('F-3 empty-zone track: the stage reclaims the width (point 2)', () => {
  it('S2 left empty, right/header/footer populated → only the left track is 0px; the stage keeps its 1fr weight', () => {
    const registry = registryOf([
      def('p-right', 'app-graph', 'right', 0),
      def('p-header', 'app-graph', 'header', 0),
      def('p-footer', 'app-graph', 'footer', 0),
    ])
    const layout = draggedLayout()
    const vars = zoneTrackCssVars(registry, layout)
    expect(trackOf(vars, 'left')).toBe('0px')
    expect(trackOf(vars, 'right')).toBe('444px')
    expect(trackOf(vars, 'header')).toBe('48px')
    expect(trackOf(vars, 'footer')).toBe('44px')
  })

  it('S6 the stage is the remaining-space track: `--stage-weight` is unchanged by an empty zone (the stage absorbs the reclaimed width)', () => {
    const registry = registryOf([])
    const layout = draggedLayout()
    const vars = zoneTrackCssVars(registry, layout)
    expect(vars['--stage-weight']).toBe('700fr')
    // the stage is a WEIGHT track (`fr`) — never a fixed px pinned value
    expect(vars['--stage-weight']).not.toMatch(/px/)
  })

  it('S6b source-pin: the grid template keeps the stage track as the 1fr-weight variable (not a fixed value that ignores the collapsed zone)', () => {
    const columns = gridTemplateValue(style, 'grid-template-columns')
    expect(columns).toMatch(/var\(--stage-weight/)
    expect(columns).toMatch(/1fr/)
    // the stage track must not be a hardcoded px width (which would ignore the
    // collapsed zone and defeat the reclaim)
    expect(columns).not.toMatch(/\b\d+px\b/)
  })

  it('S6c fail-state: an empty zone must never leave a non-zero track behind (the live regression: 160px stayed)', () => {
    const registry = registryOf([])
    const vars = zoneTrackCssVars(registry, draggedLayout())
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(trackPx(trackOf(vars, zone)), `${zone} must not retain a px track`).toBe(0)
    }
  })
})

// ===========================================================================
describe('F-3 empty-zone track: non-empty zones are unchanged (point 3)', () => {
  it('S3 all four zones populated → every track is the persisted --zone-*-size (dragged/default), never 0px', () => {
    const registry = registryOf(ALL_ZONES_POPULATED)
    const layout = draggedLayout()
    const vars = zoneTrackCssVars(registry, layout)
    expect(trackOf(vars, 'left')).toBe('333px')
    expect(trackOf(vars, 'right')).toBe('444px')
    expect(trackOf(vars, 'header')).toBe('48px')
    expect(trackOf(vars, 'footer')).toBe('44px')
  })

  it('S3b the base track declaration resolves a populated zone to its persisted size (source-pin: the `--size` default is retained)', () => {
    for (const zone of LAYOUT_PANE_ZONES) {
      const declared = baseTrackDecl(style, zone) ?? gridTemplateValue(style, 'grid-template-columns')
      expect(declared, `${zone} populated track must resolve the persisted size`).toMatch(
        new RegExp(`var\\(\\s*--zone-${zone}-size`),
      )
    }
    // the persisted size declarations still exist (W2-N3 regression guard)
    const vars = layoutCssVars(draggedLayout())
    expect(vars['--zone-left-size']).toBe('333px')
    expect(vars['--zone-right-size']).toBe('444px')
  })

  it('S3c the zone min/max clamps are intact and a clamped size passes through un-collapsed (LAYOUT_ZONE_MIN/LAYOUT_ZONE_MAX)', () => {
    expect(LAYOUT_ZONE_MIN).toBe(160)
    expect(LAYOUT_ZONE_MAX).toBe(640)
    const registry = registryOf(ALL_ZONES_POPULATED)
    const layout = coerceLayout({
      version: 1,
      panes: [],
      zones: {
        left: { size: LAYOUT_ZONE_MIN, minimized: false },
        right: { size: LAYOUT_ZONE_MAX, minimized: false },
        header: { size: LAYOUT_ZONE_MIN, minimized: false },
        footer: { size: LAYOUT_ZONE_MAX, minimized: false },
      },
      stage: { size: 640 },
      topBar: { size: 36 },
    })
    const vars = zoneTrackCssVars(registry, layout)
    expect(trackOf(vars, 'left')).toBe('160px')
    expect(trackOf(vars, 'right')).toBe('640px')
    expect(trackOf(vars, 'header')).toBe('160px')
    expect(trackOf(vars, 'footer')).toBe('640px')
  })

  it('S3d the collapse only fires for an EMPTY zone: the same layout with panes present never emits 0px', () => {
    const layout = draggedLayout()
    const populated = zoneTrackCssVars(registryOf(ALL_ZONES_POPULATED), layout)
    const empty = zoneTrackCssVars(registryOf([]), layout)
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(trackOf(populated, zone)).not.toBe('0px')
      expect(trackOf(empty, zone)).toBe('0px')
    }
  })

  it('S5 a REVEALED empty zone retains its track (C11 drop-target carve-out: `.is-empty:not(.is-revealed)`)', () => {
    const layout = draggedLayout()
    const registry = registryOf([])
    const revealed = zoneTrackCssVars(registry, layout, { revealedZones: ['left'] })
    expect(trackOf(revealed, 'left')).toBe('333px')
    // the other zones stay collapsed (reveal is per-zone)
    expect(trackOf(revealed, 'right')).toBe('0px')
    expect(trackOf(revealed, 'header')).toBe('0px')
    expect(trackOf(revealed, 'footer')).toBe('0px')
  })

  it('S5b the collapse rule is gated by :not(.is-revealed) and a populated zone (no .is-empty) cannot match it (source-pin)', () => {
    for (const zone of LAYOUT_PANE_ZONES) {
      const collapse = collapseTrackRules(style, zone)
      expect(collapse).toMatch(/is-empty/)
      expect(collapse).toMatch(/:not\(\.is-revealed\)/)
      // the rule must require BOTH classes on the SAME element (`:has(...)`)
      expect(collapse).toMatch(/:has\(/)
    }
  })
})

// ===========================================================================
// §4-shaped fail-states (one per documented fail-state)
// ===========================================================================
describe('F-3 empty-zone track: fail-states', () => {
  it('F4 malformed layouts never throw and never emit NaN/Infinity/negative geometry', () => {
    const registry = registryOf(ALL_ZONES_POPULATED)
    const junk: unknown[] = [
      null,
      undefined,
      42,
      'layout',
      [],
      { version: 'x' },
      { version: 1, zones: { left: { size: Number.NaN }, right: { size: -5 } } },
      {
        version: 1,
        panes: [{ id: 'p-left-a', zone: 'stage', order: Number.NaN }],
        zones: { header: { size: Number.POSITIVE_INFINITY }, footer: { size: -Infinity } },
      },
    ]
    for (const value of junk) {
      const layout = coerceLayout(value)
      const vars = zoneTrackCssVars(registry, layout)
      for (const zone of LAYOUT_PANE_ZONES) {
        const raw = trackOf(vars, zone)
        expect(typeof raw, `${zone} track must be a string`).toBe('string')
        expect(raw).toMatch(/^\d+px$/)
        expect(Number.isFinite(trackPx(raw)), `${zone} track must be finite`).toBe(true)
        expect(trackPx(raw)).toBeGreaterThanOrEqual(0)
      }
      expect(vars['--stage-weight']).toMatch(/^\d+fr$/)
    }
  })

  it('F4b a malformed/absent layout falls soft to the defaults — never a collapsed non-empty zone or a NaN track', () => {
    const registry = registryOf(ALL_ZONES_POPULATED)
    const vars = zoneTrackCssVars(registry, coerceLayout(null))
    expect(trackOf(vars, 'left')).toBe('220px')
    expect(trackOf(vars, 'right')).toBe('220px')
    expect(trackOf(vars, 'header')).toBe('48px')
    expect(trackOf(vars, 'footer')).toBe('48px')
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(trackOf(vars, zone)).not.toBe('0px')
    }
  })

  it('F4c a corrupt persisted size never collapses a POPULATED zone (the fix must not over-collapse)', () => {
    const registry = registryOf(ALL_ZONES_POPULATED)
    const layout = coerceLayout({
      version: 1,
      zones: {
        left: { size: 0, minimized: false },
        right: { size: Number.NaN, minimized: false },
        header: { size: -1, minimized: false },
        footer: { size: Number.POSITIVE_INFINITY, minimized: false },
      },
    })
    const vars = zoneTrackCssVars(registry, layout)
    for (const zone of LAYOUT_PANE_ZONES) {
      expect(trackPx(trackOf(vars, zone)), `${zone} must keep a positive track`).toBeGreaterThan(0)
    }
  })

  it('F3 census, not the overlay, decides emptiness: S4 left panes DISABLED → track collapses to 0px', () => {
    const registry = registryOf([
      def('p-left-a', 'app-graph', 'left', 0),
      def('p-right', 'app-graph', 'right', 0),
    ])
    registry.disable('p-left-a')
    const vars = zoneTrackCssVars(registry, draggedLayout())
    expect(trackOf(vars, 'left')).toBe('0px')
    expect(trackOf(vars, 'right')).toBe('444px')
  })

  it('F3b an OPERATOR-scope pane never populates an app-graph zone (the census is app-graph only — C3/§2.5)', () => {
    const registry = registryOf([
      def('op-settings', 'operator', 'left', 0),
      def('p-right', 'app-graph', 'right', 0),
    ])
    // the operator pane must be ENABLED for this pin to be about SCOPE and not
    // about enabled-ness (a disabled pane would trivially not populate a zone)
    expect(registry.isEnabled('op-settings')).toBe(true)
    const vars = zoneTrackCssVars(registry, draggedLayout())
    expect(trackOf(vars, 'left')).toBe('0px')
    expect(trackOf(vars, 'right')).toBe('444px')
  })

  it('F5 a null/invalid registry argument fails soft (never throws, never a phantom populated zone)', () => {
    const layout = draggedLayout()
    const junkRegistries: unknown[] = [null, undefined, {}, 42]
    for (const registry of junkRegistries) {
      const vars = zoneTrackCssVars(
        registry as unknown as Parameters<typeof zoneTrackCssVars>[0],
        layout,
      )
      for (const zone of LAYOUT_PANE_ZONES) {
        expect(trackOf(vars, zone)).toMatch(/^\d+px$/)
        expect(Number.isFinite(trackPx(trackOf(vars, zone)))).toBe(true)
      }
    }
  })

  it('F6 applyLayoutToRoot/zoneTrackCssVars never throw on a frozen or absent root and still return the track vars', () => {
    const registry = registryOf([])
    const layout = draggedLayout()
    expect(() => applyLayoutToRoot(null, layout)).not.toThrow()
    expect(() => applyLayoutToRoot({}, layout)).not.toThrow()
    const frozen = Object.freeze({ style: Object.freeze({}) })
    expect(() =>
      applyLayoutToRoot(frozen as unknown as Parameters<typeof applyLayoutToRoot>[0], layout),
    ).not.toThrow()
    expect(trackOf(zoneTrackCssVars(registry, layout), 'left')).toBe('0px')
  })
})
