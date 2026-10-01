// src/renderer/layout-vars.ts — ⟨Unit `U-ZONE-REPLACEMENT` / `PD-UI-14` §3 row 2⟩
// THE PROJECTION SEAM SUPPLIERS: the serialized `LayoutState` geometry → the shell
// grid's CSS custom properties, projected and applied by the VENDORED
// `layout-projection.ts` (`project` / `applyProjection`, whose `applyVarsToRoot` is
// the same function object). What stays FORK-side is exactly what the module declares
// it does not own: the token VOCABULARY (`--zone-<z>-size`, `--stage-weight`,
// `--top-bar-size` — the fork's names, present in no byte of the module), the units,
// the finite-positive COERCION (through `coerceLayout` before any projection) and the
// WRITE TARGET.
//
// WHY THIS FILE EXISTS, and it is a §3 row-2 obligation rather than a taste call: the
// two seam suppliers are NOT duplication of the vendored projection (every emitted
// byte and every write is the module's own), but §3 row 2 names them as the LOCAL
// DUPLICATE that `src/renderer/layout-state.ts` gives up — and §3 row 1 keeps them as
// NAMED SEAM SUPPLIERS, i.e. symbols that legitimately REMAIN in the renderer. Both
// clauses are satisfied at once by their being kept BY NAME and no longer being
// COMPUTATION inside `layout-state.ts`. The `removeProperty` question (§4 item (vi))
// is NOT answered by assumption here: this module has NO removal arm, and the one
// write site that needs an explicit removal keeps its own (`sidebar-panes.ts`'s
// synchronous census mirror).
import { applyProjection, project, type Projection, type VarSpec, type VarValues } from '../shared/layout-projection.js'
import { coerceLayout, type LayoutState } from './layout-state.js'

/** The caller's `VarSpec` record for the SIX projected geometry properties: the four
 *  zone SIZES and the top bar in `px`, the stage as the serialized `fr` weight. */
const LAYOUT_VAR_SPECS: Record<string, VarSpec> = {
  '--zone-left-size': { name: '--zone-left-size', unit: 'px' },
  '--zone-right-size': { name: '--zone-right-size', unit: 'px' },
  '--zone-header-size': { name: '--zone-header-size', unit: 'px' },
  '--zone-footer-size': { name: '--zone-footer-size', unit: 'px' },
  '--stage-weight': { name: '--stage-weight', unit: 'fr' },
  '--top-bar-size': { name: '--top-bar-size', unit: 'px' },
}

/** The caller's `VarValues` record: the COERCED serialized geometry, keyed by the same
 *  names the spec map declares. PURE. */
function layoutVarValues(layout: LayoutState): VarValues {
  const l = coerceLayout(layout)
  return {
    '--zone-left-size': l.zones.left.size,
    '--zone-right-size': l.zones.right.size,
    '--zone-header-size': l.zones.header.size,
    '--zone-footer-size': l.zones.footer.size,
    '--stage-weight': l.stage.size,
    '--top-bar-size': l.topBar.size,
  }
}

/** The minimal root surface the applier writes: anything whose `style` exposes
 *  `setProperty` (a real `document.documentElement` or a test double). */
export interface LayoutRoot {
  style?: { setProperty?: (name: string, value: string) => void }
}

/** W2-N3 (AF-3) — project the serialized layout onto the shell grid's CSS custom
 *  properties (the shell chrome is NOT a provident node). TOTAL/fail-soft: the layout
 *  is re-coerced first, so a corrupt size can never emit `NaN`/`-Infinity`/negative
 *  geometry, and the vendored `project` records a SKIP with its reason rather than
 *  throwing. PURE.
 *
 *  NOTE — the zone entries are the PERSISTED sizes, NOT the grid tracks: an empty
 *  zone's track is `0px` (`zoneTrackVars`). */
export function layoutCssVars(layout: LayoutState): Record<string, string> {
  const projection: Projection = project(layoutVarValues(layout), LAYOUT_VAR_SPECS)
  const applied: Record<string, string> = {}
  for (const [name, value] of Object.entries(projection.applied)) applied[name] = value
  return applied
}

/** W2-N3 (AF-3) — apply the layout CSS custom properties to a root (§2.4).
 *  TOTAL/fail-soft: an unusable sink is the vendored applier's own total skip and a
 *  refused write is logged per key, never a throw. Returns EXACTLY what landed — the
 *  write LOG, never the intent. */
export function applyLayoutToRoot(
  root: LayoutRoot | null | undefined,
  layout: LayoutState,
): Record<string, string> {
  const projection = project(layoutVarValues(layout), LAYOUT_VAR_SPECS)
  const result = applyProjection(projection, root)
  const applied: Record<string, string> = {}
  for (const [name, value] of Object.entries(result.applied)) applied[name] = value
  return applied
}
