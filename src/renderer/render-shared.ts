// src/renderer/render-shared.ts — Unit U-SHELL-6 (C6): the shared hover
// affordance authoring convention (docs/specs/unit-u-shell-6-hover-
// affordance.md §2, wave-1-open-decisions W1-Q8). Every provident node that
// carries a click/select handler authors the reserved token class
// `is-clickable` via `css.classes`; the global stylesheet rule in index.html
// (`.is-clickable` → `cursor: pointer`; `.is-clickable:hover` → the `--hover`
// appearance token) ships the visual affordance. A node WITHOUT a handler must
// NOT carry the class — presentation only, never a substitute for a handler.

/** The reserved clickable-affordance token class (W1-Q8 (a)). */
export const IS_CLICKABLE = 'is-clickable'

/** Build the css class list for a handler-bearing node: the node's existing
 *  classes (never dropped) plus the reserved `IS_CLICKABLE` token, deduped so a
 *  node already authoring the token is not double-classed. PURE. */
export function clickableClasses(extra: string[] = []): string[] {
  const classes = Array.isArray(extra) ? extra : []
  return classes.includes(IS_CLICKABLE) ? [...classes] : [...classes, IS_CLICKABLE]
}
