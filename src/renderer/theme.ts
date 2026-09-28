// src/renderer/theme.ts — unit `PD-UI-1` §2.1: the fork's THEME ADAPTER.
//
// The foundation's `U-THEME` DECLARATION + ENV READING are ADOPTED here; the fork's
// tri-state PRECEDENCE RULE is KEPT as this adapter (§1.2 (a)/(b), ruling `R-1`).
// `resolveTheme` obtains the OS reading THROUGH the vendored resolver's returned
// record (never from a directly-passed boolean decision), and `applyThemeToRoot`
// obtains the write AS DATA from the vendored `applyThemeDeclaration` with the
// fork's own attribute-name token (`'theme'`), performing it at the ONE write site.
//
// The one import below is the adoption's consumer edge (`§2.1`'s import census:
// EXACTLY one statement, resolving to `src/shared/theme.ts`, declared per row in
// `tests/pd-vendor-set.test.ts`'s `DECLARED_CONSUMER_EDGES`). The vendored bytes are
// digest-pinned: this module WRAPS them and never edits them (`R-4`).
import { resolveTheme as adoptedResolveTheme, applyThemeDeclaration } from '../shared/theme.js'

export type ResolvedTheme = 'light' | 'dark'

/** Resolve the effective theme for an operator `theme` setting. `prefersDark` is the
 *  live `matchMedia('(prefers-color-scheme: dark)')` result. An explicit `'light'`/`'dark'`
 *  overrides the OS; every other value (including `'system'`) follows it.
 *
 *  The OS reading is obtained from the adopted ENV READING: the raw reading is handed to
 *  the vendored resolver as the `env` record's single member, and the appearance decision
 *  is taken from the member the vendored RESOLVED record carries. `prefersDark`
 *  therefore only ever enters the rule as that record's strict boolean, so a
 *  non-boolean runtime value is never read as `true` (§2.1 clause 4 / §3.2 item 7: only a
 *  strict `true` yields `'dark'`) — the two layers cannot disagree. */
export function resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme {
  const resolution = adoptedResolveTheme(setting, { prefersDark })
  const followsOs: ResolvedTheme = resolution.prefersDark === true ? 'dark' : 'light'
  if (setting === 'light') return 'light'
  if (setting === 'dark') return 'dark'
  return followsOs
}

/** The minimal root surface `applyThemeToRoot` writes: anything with a
 *  `data-theme`-capable `dataset` (a real `document.documentElement` or the
 *  test dom-shim element). */
export interface ThemeRoot {
  dataset: { theme?: string }
}

/** Unit U-SHELL-2 §2.3/§2.4 (W1-N1) / PD-UI-1 §2.1 — apply the resolved theme to a
 *  root's `data-theme`. `prefersDark` is passed in (never read here), so the helper is
 *  pure + node-testable. The write is obtained AS DATA from the vendored
 *  `applyThemeDeclaration(attributeName, resolved)` — the fork supplies the attribute
 *  name, the mechanism owns no name. TOTAL/fail-soft (F2): a missing or frozen `dataset`
 *  is left untouched and never throws. Returns the resolved theme so the caller can
 *  decide whether the OS listener is live. */
export function applyThemeToRoot(root: ThemeRoot, setting: unknown, prefersDark: boolean): ResolvedTheme {
  const resolved = resolveTheme(setting, prefersDark)
  const write = applyThemeDeclaration('theme', resolved)
  try {
    // The record's decision, applied at the ONE write site — `root.dataset.theme`, the member
    // of the root this adapter was HANDED, and the only element a write here may touch. Its
    // `removal` member is HONOURED with the meaning the contract RULES (`A-7` RULED 2026-09-28,
    // `§2.1` item 6): a removal record means THE ATTRIBUTE IS REMOVED — the record's own
    // outcome, not a third outcome it does not declare — so the SAME member carries the removal
    // instead of the assignment, and only ever one of the two arms runs. The element-level
    // attribute-removal mechanic is NOT taken: it would require WIDENING `ThemeRoot`, and this
    // adapter removes only from the root it owns. Both arms sit inside this one guarded path, so
    // a frozen/absent/refusing root is still absorbed below and can never break boot. On the
    // REACHABLE path the member is always `false` (`§3.2` item 5: `resolveTheme` returns
    // `'light'`/`'dark'`, always non-empty), so a reachable call always writes `write.value`.
    if (write.removal) {
      delete root.dataset.theme
    } else {
      root.dataset.theme = write.value
    }
  } catch {
    // never throw — a frozen/absent root must not break boot, and a refused removal is absorbed here
  }
  return resolved
}
