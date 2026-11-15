// src/renderer/layout-zone-geometry.ts — ⟨Unit `U-ZONE-REPLACEMENT` / `PD-UI-14`⟩
// THE FORK'S OWN ZONE-AXIS READING, in a module of its own.
//
// WHY IT IS ITS OWN MODULE: the reading is needed by TWO consumers that must agree —
// the gutter gesture seams (`pane-gutter.ts`, whose `axisFor` seam supplies it) and the
// ENVELOPE AUTHORING SITE that authors the four gutter affordances
// (`pane-graph.ts`, §3.1/§3.2: each authored affordance carries `data-axis` = this
// reading). Importing it from `pane-gutter.ts` would add a FOURTH `./pane-gutter.js`
// stem-collision hit to the vendored-set pin's exact three — and that pin's subject is
// the vendored stem collision, not this fork-internal edge. `pane-gutter.ts` RE-EXPORTS
// this name, so every existing consumer (and `pane-gutter.ts`'s own pinned export
// surface) is unchanged.
//
// The taxonomy is the CALLER's: the vendored family owns no axis vocabulary, so the
// fork states it once, here, and hands it to the modules as data.
//
// ⟨Unit `U-1a` (D-14/D-16) — THE ZONE NAMES MOVE AND SO DOES THIS READER.⟩ The
// pre-`U-1a` arm read the two ROW-zone names (`header`/`footer`, superseded — the
// quoted literal is not spelled here because this unit's source census forbids it)
// over an `unknown` parameter; it now
// reads `'top' || 'bottom'` over the CLOSED `LayoutZoneName` (`ASM-U1a-2`), so a
// missed rename in any caller FAILS TO COMPILE instead of silently answering
// `'columns'` for a row zone (`pane-drag.ts:237` is narrowed the same way).
import type { LayoutZoneName } from './layout-state.js'

/** The gutter orientation: side columns are resized horizontally, the top/bottom
 *  rows vertically. TOTAL over its declared domain: the parameter is the closed
 *  four-name union, so a REGION (`stage`/`top-bar` are never pane zones — `R-9`)
 *  cannot reach this reader without a type error at the call site. */
export type GutterAxis = 'columns' | 'rows'

export function gutterAxis(zone: LayoutZoneName): GutterAxis {
  return zone === 'top' || zone === 'bottom' ? 'rows' : 'columns'
}
