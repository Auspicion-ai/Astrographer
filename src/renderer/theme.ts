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

/** The minimal root surface `applyThemeToRoot` writes. Two faces, BOTH OPTIONAL so every root a
 *  caller already hands this module stays legal (a real `document.documentElement` carries both;
 *  the layout-less test dom-shim carries the legacy one):
 *
 *  - **`setAttribute` / `removeAttribute`** — the ELEMENT-LEVEL attribute face, and the ONLY face
 *    this adapter writes. A value record is `setAttribute(write.name, write.value)`; a removal
 *    record is `removeAttribute(write.name)`.
 *  - **`dataset`** — the legacy `data-` prefixed face the fork used to write. It is KEPT in the
 *    contract (a root offering only this is still a legal `ThemeRoot`, so boot stays fail-soft) and
 *    it is NO LONGER WRITTEN: the `data-` prefixed theme carrier was superseded by the foundation's
 *    bare `theme` attribute (unit `U-1c`, D-14; the superseded spelling is spelled out in the two
 *    theme censuses' own notes — `tests/pd-ui-1-theme-register.test.ts` and
 *    `tests/unit-zone-replacement-register.test.ts` — and in the owning contract §2.1 item 6,
 *    because `src/**` may carry exactly ONE carrier spelling from this unit on). */
export interface ThemeRoot {
  setAttribute?: (name: string, value: string) => void
  removeAttribute?: (name: string) => void
  dataset?: { theme?: string }
}

/** Unit U-SHELL-2 §2.3/§2.4 (W1-N1) / PD-UI-1 §2.1 / **unit `U-1c` (D-14)** — apply the resolved
 *  theme to a root's **`theme`** attribute. `prefersDark` is passed in (never read here), so the
 *  helper is pure + node-testable. The write is obtained AS DATA from the vendored
 *  `applyThemeDeclaration(attributeName, resolved)` — the fork supplies the attribute name, the
 *  mechanism owns no name — and the record's own `name` is what the write applies, so this module
 *  holds no second copy of the token. TOTAL/fail-soft (F2): a root whose face is absent, frozen or
 *  throwing is left untouched and nothing throws. Returns the resolved theme; the caller currently
 *  DISCARDS that return, and per `docs/specs/unit-pd-ui-1-theme.md` the liveness predicate stays
 *  SETTING-based — a return-based predicate would be a weaker second authority, so the return is
 *  redundant by construction rather than the liveness input. */
export function applyThemeToRoot(root: ThemeRoot, setting: unknown, prefersDark: boolean): ResolvedTheme {
  const resolved = resolveTheme(setting, prefersDark)
  const write = applyThemeDeclaration('theme', resolved)
  try {
    // The record's decision, applied at the ONE write site — an ELEMENT-LEVEL attribute write on the
    // root this adapter was HANDED, and the only element a write here may touch. Its `removal`
    // member is HONOURED with the meaning the contract RULES (`A-7` RULED 2026-09-28): a removal
    // record means THE ATTRIBUTE IS REMOVED — the record's own outcome, not a third outcome it does
    // not declare — so the SAME member carries the removal instead of the assignment, and only ever
    // one of the two arms runs. Both arms are the RECORD's (`write.name`/`write.value`); a record
    // that echoes no name (a non-string/empty caller argument) declares no target, so nothing is
    // written and nothing throws. ⟨SUPERSEDED IN PLACE `2026-11-15` BY UNIT `U-1c` (`RCA-8(c)`,
    // annotate-beside — the clause above is KEPT as its pass's reading): the `A-7` ruling STANDS
    // whole; what `A-7` declined was the ELEMENT-LEVEL attribute-removal MECHANIC, *"because it
    // would require WIDENING `ThemeRoot`"* — and D-14 takes that widening now that the carrier is
    // the foundation's bare `[theme="dark"]` (`strata/decisions.md` D-14;
    // `docs/specs/foundation-import-u1-change-analysis.md` §2.4). So the write moved from the
    // legacy `dataset.theme` face to `setAttribute`/`removeAttribute`, and `dataset` is no longer
    // written on any arm. The arm stays UNREACHABLE through the fork's own resolver (`resolveTheme`
    // returns `'light'`/`'dark'`, always non-empty), exactly as `§3.2` item 5 states.⟩ Both arms sit
    // inside this one guarded path, so a frozen/absent/refusing root is still absorbed below and can
    // never break boot.
    if (typeof write.name === 'string' && write.name !== '') {
      if (write.removal) {
        if (typeof root.removeAttribute === 'function') root.removeAttribute(write.name)
      } else if (typeof root.setAttribute === 'function') {
        root.setAttribute(write.name, write.value)
      }
    }
  } catch {
    // never throw — a frozen/absent root must not break boot, and a refused write is absorbed here
  }
  return resolved
}
