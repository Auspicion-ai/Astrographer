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

/** The gutter orientation: side columns are resized horizontally, the header/footer
 *  rows vertically. TOTAL: an unknown zone (`stage`/`top-bar` are REGIONS, never pane
 *  zones — `R-9`) reads `'columns'` and never throws. */
export type GutterAxis = 'columns' | 'rows'

export function gutterAxis(zone: unknown): GutterAxis {
  return zone === 'header' || zone === 'footer' ? 'rows' : 'columns'
}
