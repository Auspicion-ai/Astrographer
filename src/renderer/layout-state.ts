// src/renderer/layout-state.ts — Unit U-SHELL-1: the serialized `LayoutState`
// model (docs/specs/unit-u-shell-1-layout-zones.md §2.1/§2.6 pin 1). The base
// module is PURE (no Electron/DOM): the `LayoutState` types + the total
// `defaultLayout`/`deriveLayout`/`coerceLayout` helpers. `coerceLayout` is the
// shared fail-soft coercion the operator-settings store mirrors for its `layout`
// slice (like `coerceTheme`/`coerceEditingMode`, but exported here because it is
// shared by the store + the app-graph assembler).
//
// W2-N3 (AF-3) — the serialized geometry is projected onto the shell grid's CSS
// custom properties (§2.4) by this module's `zoneTrackVars` and by the projection
// seam module (`layout-vars.ts`); the applier takes an injected root surface (no
// DOM import) so it stays node-testable, mirroring `theme.ts`'s `applyThemeToRoot`.
//
// F-3 (docs/defects.md EMPTY-ZONE-TRACK-NOT-COLLAPSED, 2026-09-15) — additive:
// `zoneTrackVars` projects the per-zone GRID TRACK (the persisted size, or
// `0px` when the enabled+placed census says the zone is empty) onto the shell
// grid.
//
// ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — the ADOPTION (§3 rows 1/2 of
// `docs/specs/unit-zone-replacement.md`).⟩ The per-zone TRACK ARITHMETIC and
// the token FORMATTING are the vendored `census.ts` → `computeTrackVars` over
// the vendored `zones.ts` → `trackFor`/`isEmpty`; the geometry → CSS
// custom-property PROJECTION and its one write are the vendored
// `layout-projection.ts` → `project`/`applyProjection`. What STAYS here is the
// caller's own data and policy: the zone enumeration, the token vocabulary and
// units, the census (the fork's own enabled+placed emptiness rule), the
// empty-track collapse policy (a reveal carve-out), the finite-positive
// coercion and the write target. The local duplicates this replaces — the TRACK
// RECORD COMPUTER and its private per-zone emptiness helper, and the
// hand-rolled var formatting — are GONE as computation; the projection half is
// kept only as the NAMED SEAM SUPPLIERS in `layout-vars.ts`
// (now supplied by the projection seam module `layout-vars.ts`), which
// `P-IM-zone-repl-1`'s witnesses expect (`§3`, `D-2`/`D-3`).
import { computeTrackVars } from '../shared/census.js'
import { isEmpty } from '../shared/zones.js'
import type { TrackSpec } from '../shared/zones.js'
import type { PaneRegistry } from './pane-registry.js'

/** The four pane zones a pane can be placed into (C4). `stage`/`top-bar` are
 *  regions (serialized geometry), NOT pane zones (W2-Q2). */
export type LayoutZoneName = 'left' | 'right' | 'header' | 'footer'

/** The two shell regions that are serialized but are never pane drop targets. */
export type RegionName = 'stage' | 'top-bar'

/** One pane's placement overlay entry. `collapsed` is PER-PANE (C5); `order`
 *  is the pane's position within its zone (W2-Q1). */
export interface PaneLayoutEntry {
  id: string
  zone: LayoutZoneName
  order: number
  collapsed: boolean
}

/** One zone's geometry: `size` is PER-ZONE (C7) and `minimized` is PER-ZONE
 *  (C12) (W2-Q1). */
export interface ZoneLayout {
  size: number
  minimized: boolean
}

/** The serialized layout state (the C9 `OperatorSettings.layout` slice). The
 *  serialized state is authoritative; the graph mirrors the derived facts
 *  (`is-empty`/`is-revealed`/`is-minimized`/`is-collapsed`). */
export interface LayoutState {
  version: number
  panes: PaneLayoutEntry[]
  zones: { left: ZoneLayout; right: ZoneLayout; header: ZoneLayout; footer: ZoneLayout }
  stage: { size: number }
  topBar: { size: number }
}

/** The pane's additive default-placement input (W2-Q4) — the assembler reads
 *  `defaultZone`/`defaultOrder` off each `PaneDefinition`. */
export interface LayoutPaneSpec {
  id: string
  defaultZone?: LayoutZoneName
  defaultOrder?: number
}

/** The current `LayoutState` schema version (W2-Q16). */
export const LAYOUT_VERSION = 1

/** The four pane zones, in the assembler's payload order. */
export const LAYOUT_PANE_ZONES: readonly LayoutZoneName[] = ['left', 'right', 'header', 'footer']

/** The serialized regions (NOT pane zones — W2-Q2). */
export const LAYOUT_REGIONS: readonly RegionName[] = ['stage', 'top-bar']

/** The pinned zone-size clamp bounds (spec §2.6 pin 5). */
export const LAYOUT_ZONE_MIN = 160
export const LAYOUT_ZONE_MAX = 640
/** The pinned region-size clamp bounds (spec §2.6 pin 5). */
export const LAYOUT_REGION_MIN = 120
export const LAYOUT_REGION_MAX = 1200

const DEFAULT_ZONE_SIZE: Record<LayoutZoneName, number> = {
  left: 220,
  right: 220,
  header: 48,
  footer: 48,
}
const DEFAULT_STAGE_SIZE = 640
const DEFAULT_TOPBAR_SIZE = 36

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** True when `value` is a known pane zone name (spec §2.6 pin 7 unknown-zone
 *  coercion relies on this). */
export function isLayoutZoneName(value: unknown): value is LayoutZoneName {
  return value === 'left' || value === 'right' || value === 'header' || value === 'footer'
}

/** A total size coercion: a finite positive number passes through; any other
 *  value (NaN/Infinity/negative/string/null) falls back. Never a negative/NaN
 *  track (F4). The pinned min/max bounds are the UI/drag contract (U-SHELL-5);
 *  the fail-soft load path only rejects non-finite/non-positive values so a
 *  valid serialized geometry round-trips byte-for-byte (spec §2.6 pin 5). */
function coerceSize(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback
}

/** Per-zone fail-soft coercion (W2-Q16): a malformed zone value falls back to
 *  that zone's default. */
function coerceZoneLayout(value: unknown, fallbackSize: number): ZoneLayout {
  if (!isRecord(value)) return { size: fallbackSize, minimized: false }
  return {
    size: coerceSize(value.size, fallbackSize),
    minimized: value.minimized === true,
  }
}

/** The pinned default layout: zero panes, the default zone/region geometry. */
export function defaultLayout(): LayoutState {
  return {
    version: LAYOUT_VERSION,
    panes: [],
    zones: {
      left: { size: DEFAULT_ZONE_SIZE.left, minimized: false },
      right: { size: DEFAULT_ZONE_SIZE.right, minimized: false },
      header: { size: DEFAULT_ZONE_SIZE.header, minimized: false },
      footer: { size: DEFAULT_ZONE_SIZE.footer, minimized: false },
    },
    stage: { size: DEFAULT_STAGE_SIZE },
    topBar: { size: DEFAULT_TOPBAR_SIZE },
  }
}

/** Derive the default placement overlay from the registry defaults (W2-Q4):
 *  `defaultZone ?? 'left'` (the legacy `[sidebar]` maps to `left`) and
 *  `defaultOrder ?? registration order`. PURE. */
export function deriveLayout(specs: ReadonlyArray<LayoutPaneSpec>): LayoutState {
  const base = defaultLayout()
  const panes: PaneLayoutEntry[] = specs.map((spec, index) => ({
    id: spec.id,
    zone: isLayoutZoneName(spec.defaultZone) ? spec.defaultZone : 'left',
    order:
      typeof spec.defaultOrder === 'number' && Number.isFinite(spec.defaultOrder)
        ? spec.defaultOrder
        : index,
    collapsed: false,
  }))
  return { ...base, panes }
}

/** TOTAL fail-soft coercion for the C9 `layout` slice (spec §2.2/§2.6 pin 1,
 *  F1/F3/F4/F5/F6, W2-Q16). Junk input never throws. A malformed `version` — a
 *  non-integer, negative, non-finite, or newer-than-known value (spec §2.6
 *  pin 9) — fails soft to the pinned defaults (never a newer-schema crash).
 *  Only known fields survive (deep sanitize) — credentials and unknown fields
 *  are NEVER copied. Unknown zone values coerce to `left` (the legacy sidebar
 *  default); stages/regions are not pane zones. PURE. */
export function coerceLayout(value: unknown): LayoutState {
  if (!isRecord(value)) return defaultLayout()

  const rawVersion = value.version
  if (
    typeof rawVersion !== 'number' ||
    !Number.isInteger(rawVersion) ||
    rawVersion < 1 ||
    rawVersion > LAYOUT_VERSION
  ) {
    return defaultLayout()
  }

  const seen = new Set<string>()
  const panes: PaneLayoutEntry[] = []
  const rawPanes = Array.isArray(value.panes) ? value.panes : []
  for (let index = 0; index < rawPanes.length; index++) {
    const raw = rawPanes[index]
    if (!isRecord(raw)) continue
    const id = raw.id
    if (typeof id !== 'string' || id === '') continue
    if (seen.has(id)) continue // F5 — first wins (mirrors the registry dedupe)
    seen.add(id)
    panes.push({
      id,
      zone: isLayoutZoneName(raw.zone) ? raw.zone : 'left', // F3/W2-Q2 — unknown/stage/top-bar → left
      order: typeof raw.order === 'number' && Number.isFinite(raw.order) ? raw.order : index,
      collapsed: raw.collapsed === true,
    })
  }

  const rawZones = isRecord(value.zones) ? value.zones : {}
  const zones = {
    left: coerceZoneLayout(rawZones.left, DEFAULT_ZONE_SIZE.left),
    right: coerceZoneLayout(rawZones.right, DEFAULT_ZONE_SIZE.right),
    header: coerceZoneLayout(rawZones.header, DEFAULT_ZONE_SIZE.header),
    footer: coerceZoneLayout(rawZones.footer, DEFAULT_ZONE_SIZE.footer),
  }
  const rawStage = isRecord(value.stage) ? value.stage : {}
  const rawTopBar = isRecord(value.topBar) ? value.topBar : {}
  const stage = { size: coerceSize(rawStage.size, DEFAULT_STAGE_SIZE) }
  const topBar = { size: coerceSize(rawTopBar.size, DEFAULT_TOPBAR_SIZE) }

  return { version: LAYOUT_VERSION, panes, zones, stage, topBar }
}

/** The §2.5 enabled+placed census for ONE zone — `true` when the zone holds
 *  ZERO enabled `app-graph` panes after placement resolution (the persisted
 *  overlay entry wins, else the pane's `defaultZone`, else `left`; §2.6 pin 7).
 *  This mirrors `enabledZonePaneCounts` (`pane-graph.ts`, H1) — the count the
 *  `is-empty` mirror is derived from — NOT the raw overlay, and NOT the runtime
 *  overlay class (which lags a toggle until the managed reconcile lands).
 *  TOTAL/fail-soft: a null/absent/malformed registry reads as "no panes".
 *
 *  ⟨`PD-UI-14` §3 row 1 — reduced to the CENSUS SOURCE.⟩ The COUNT is the fork's own
 *  fact (`D-4`): this function derives the per-zone enabled+placed count from the
 *  registry, and the census is handed to the module as DATA. The emptiness READING
 *  over that census is the vendored `zones.isEmpty` — called at `zoneTrackVars`
 *  through the module's own `trackFor(spec, size, isEmpty(census, member))` limb — and
 *  this function does NOT decide emptiness; it only supplies the counts for the
 *  `LAYOUT_PANE_ZONES` enumeration so no module recomputes them. */
function enabledPlacedCounts(registry: PaneRegistry | null | undefined, layout: LayoutState): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const zone of LAYOUT_PANE_ZONES) counts[zone] = 0
  const reg = registry as PaneRegistry | null | undefined
  if (reg == null || typeof reg.listByScope !== 'function' || typeof reg.isEnabled !== 'function') {
    return counts
  }
  let panes: unknown
  try {
    panes = reg.listByScope('app-graph')
  } catch {
    return counts
  }
  if (!Array.isArray(panes)) return counts
  const placed = new Map<string, LayoutZoneName>()
  for (const entry of layout.panes) placed.set(entry.id, entry.zone)
  for (const pane of panes as ReadonlyArray<{ id?: unknown; defaultZone?: unknown }>) {
    const id = pane?.id
    if (typeof id !== 'string' || id === '') continue
    let enabled = false
    try {
      enabled = reg.isEnabled(id) === true
    } catch {
      enabled = false
    }
    if (!enabled) continue
    const resolved = placed.get(id) ?? (isLayoutZoneName(pane.defaultZone) ? pane.defaultZone : 'left')
    counts[resolved] = (counts[resolved] ?? 0) + 1
  }
  return counts
}

/** The caller's `specOf` record for the four zone TRACKS (`§3` row 1): `trackProp`
 *  `--zone-<z>-track`, `unit` `'px'`, `emptyToken` `'0px'` — CALLER DATA, never module
 *  literals (the module holds no token, unit or empty token of its own). PURE. */
function zoneTrackSpecs(): Record<string, TrackSpec> {
  const specs: Record<string, TrackSpec> = {}
  for (const zone of LAYOUT_PANE_ZONES) {
    specs[zone] = { trackProp: `--zone-${zone}-track`, unit: 'px', emptyToken: '0px' }
  }
  return specs
}

/**
 * §4 item (ii) — THE MANDATORY CLOSURE ADAPTER. `census.computeTrackVars`'s
 * `revealed` position is CALLABLE-ONLY: a non-callable argument makes it return the
 * EMPTY record — for every zone, with no key at all (`Object.create(null)`, returned
 * before any member is enumerated). The fork holds an ARRAY, so the array must never
 * reach that position: this factory closes over it, AT THE WRITE SITE, and answers the
 * module's one question. It creates no module-level mutable and holds no state of its
 * own.
 *
 * THE DECISION'S POLARITY IS THE CALLER'S OWN POLICY (`§3` row 1's policy column: the
 * empty-track collapse policy is the fork's), AND IT IS THE INVERSE OF THE MODULE'S OWN
 * VOCABULARY (`§3` row 1's annotated binding clause; `§11.3` defect 1, whose predicate-
 * polarity question is `OWED` to the architect): in the MODULE's terms
 * `revealed(id) === true` means "this member EMITS a track value" — which, for an EMPTY
 * member, is the caller's `emptyToken`, i.e. a COLLAPSE — while the fork's `revealedZones`
 * ARRAY names the drop targets that must NOT collapse. This adapter therefore INVERTS: it
 * answers `true` (emit) for a zone the fork is NOT revealing — so an empty zone collapses
 * to `'0px'` — and `false` (the DECLINED member, whose key is kept carrying `''`) for a
 * zone that IS being revealed, which is the C11 carve-out. The `''` is NOT converted back
 * to a size here: `§3` row 1 makes `''` the REMOVAL PATH, and the fork's removal arm is the
 * write site's own (`sidebar-panes.ts` → `applyZoneTracks`), so the stylesheet fallback
 * supplies the persisted size for a merely-revealed drop target.
 */
function revealedPredicate(revealedZones: readonly LayoutZoneName[]): (id: unknown) => boolean {
  return (id: unknown): boolean => !(typeof id === 'string' && (revealedZones as readonly string[]).includes(id))
}

/** F-3 (docs/defects.md EMPTY-ZONE-TRACK-NOT-COLLAPSED) — project the shell
 *  grid's per-zone TRACK custom properties: `0px` for a zone with ZERO
 *  enabled+placed `app-graph` panes (the §2.5 census) that is NOT currently
 *  revealed as a drag drop target (the C11 carve-out), else the persisted
 *  `--zone-<zone>-size` value. `--stage-weight` stays the serialized `fr`
 *  weight, so the stage — the remaining-space track — reclaims the collapsed
 *  zone's space. Fail-soft (a null/malformed registry or layout never throws
 *  and never emits `NaN`/`Infinity`/negative geometry) and PURE.
 *
 *  ⟨`PD-UI-14` §3 row 1 / §4 item (ii) — THE ADOPTION.⟩ The record is the
 *  vendored `census.computeTrackVars`'s own output, over the fork's five caller
 *  positions: the zone enumeration, the fork's census, the coerced per-zone
 *  size lookup, the MANDATORY CALLABLE `revealed` closure over the fork's
 *  ARRAY (never the array itself — a non-callable yields the module's EMPTY
 *  record), and the caller's `TrackSpec` map. A zone the predicate declines
 *  keeps its key carrying `''`; the write site is what turns a declined member
 *  into a removal.
 *
 *  THIS REPLACES the removed local track-record computer (`PD-UI-14` row-1
 *  witness: that symbol is absent from this file). */
export function zoneTrackVars(
  registry: PaneRegistry | null | undefined,
  layout: LayoutState,
  opts?: { revealedZones?: readonly LayoutZoneName[] },
): Record<string, string> {
  const l = coerceLayout(layout)
  const revealedZones = Array.isArray(opts?.revealedZones) ? opts.revealedZones : []
  const revealed = revealedPredicate(revealedZones)
  const counts = enabledPlacedCounts(registry, l)
  const sizes = (id: unknown): unknown => {
    if (typeof id !== 'string' || !(LAYOUT_PANE_ZONES as readonly string[]).includes(id)) return undefined
    return l.zones[id as LayoutZoneName].size
  }
  const trackRecord = computeTrackVars(LAYOUT_PANE_ZONES, counts, sizes, revealed, zoneTrackSpecs())
  // §3 row 2 — the projection HALF (`layoutCssVars`/`applyLayoutToRoot`) is the named
  // SEAM SUPPLIER and lives in its own module (`layout-vars.ts`): this file keeps only
  // the TRACK record, and the stage weight the grid consumes is the caller's own token
  // written here. The write site that needs BOTH records composes them
  // (`sidebar-panes.ts`'s `applyZoneTracks`), so the token vocabulary stays ONE.
  const vars: Record<string, string> = { '--stage-weight': `${l.stage.size}fr` }
  for (const zone of LAYOUT_PANE_ZONES) {
    const name = `--zone-${zone}-track`
    // ⟨THE KEYING RULE (`§3` row 1's annotated binding clause; `§11.3` defect 1).⟩
    // `computeTrackVars`' returned record is keyed by THE CALLER'S ZONE/MEMBER NAMES —
    // the enumerated members, in first-seen order — and NEVER by the CSS custom-property
    // names: each member's `TrackSpec.trackProp` (`'--zone-<z>-track'`) is a VALUE the
    // spec carries, not a key. So the read is `trackRecord[zone]` (the ZONE MEMBER) and
    // never `trackRecord[name]`; a token-keyed read ALWAYS misses, and every zone then
    // silently reads the fallback.
    const memberTrack = trackRecord[zone]
    // The CALLER'S OWN collapse policy, never the module's: `zones.isEmpty` reads the
    // fork's census, so a zone that is NOT empty never collapses — it carries its
    // persisted `String(size)+unit` whatever the predicate answered.
    //
    // AN EMPTY zone carries the MODULE's own answer for that member, verbatim, and the
    // two reachable answers are the contract's two write rules (`§3` row 1): `'0px'`
    // (the caller's `emptyToken`, an empty zone the predicate did NOT decline) is the
    // COLLAPSE WRITE, and `''` (the DECLINED member, the C11 carve-out — an empty zone
    // the fork IS revealing) is the REMOVAL PATH, which the write site turns into
    // `removeProperty` so the stylesheet fallback supplies the persisted size. A member
    // the record does not carry falls back to the collapse token.
    const declaredEmpty = isEmpty(counts, zone)
    vars[name] = declaredEmpty
      ? typeof memberTrack === 'string'
        ? memberTrack
        : '0px'
      : `${l.zones[zone].size}px`
  }
  return vars
}

