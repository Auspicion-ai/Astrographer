// src/renderer/theme.ts — Unit U-SHELL-2 §2.2 (C1). The pure tri-state theme
// resolver: an explicit `'light'`/`'dark'` setting wins; anything else
// (`'system'`, undefined, corrupt) resolves to the OS preference. TOTAL —
// never throws for any input, so the renderer boot can apply the result
// unconditionally (`document.documentElement.dataset.theme`).
export type ResolvedTheme = 'light' | 'dark'

/** Resolve the effective theme for an operator `theme` setting. `prefersDark`
 *  is the live `matchMedia('(prefers-color-scheme: dark)')` result. An
 *  explicit `'light'`/`'dark'` overrides the OS; every other value (including
 *  `'system'`) follows it. */
export function resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme {
  if (setting === 'light') return 'light'
  if (setting === 'dark') return 'dark'
  return prefersDark ? 'dark' : 'light'
}

/** The minimal root surface `applyThemeToRoot` writes: anything with a
 *  `data-theme`-capable `dataset` (a real `document.documentElement` or the
 *  test dom-shim element). */
export interface ThemeRoot {
  dataset: { theme?: string }
}

/** Unit U-SHELL-2 §2.3/§2.4 (W1-N1) — apply the resolved theme to a root's
 *  `data-theme`. `prefersDark` is passed in (never read here), so the helper is
 *  pure + node-testable. TOTAL/fail-soft (F2): a missing or frozen `dataset`
 *  is left untouched and never throws. Returns the resolved theme so the caller
 *  can decide whether the OS listener is live. */
export function applyThemeToRoot(root: ThemeRoot, setting: unknown, prefersDark: boolean): ResolvedTheme {
  const resolved = resolveTheme(setting, prefersDark)
  try {
    root.dataset.theme = resolved
  } catch {
    // never throw — a frozen/absent root must not break boot
  }
  return resolved
}
