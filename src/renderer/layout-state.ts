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
 *  regions (serialized geometry), NOT pane zones (W2-Q2). ⟨Unit `U-1a` — D-14/D-16:
 *  the FOUNDATION'S vocabulary. The pre-`U-1a` spelling named the two row zones
 *  `header`/`footer` (superseded; the literal is not spelled in `src/` because this
 *  unit's source census forbids it — the superseded values stay visible in the docs
 *  and the registers, `RCA-8(c)`), and it is superseded here, never aliased
 *  (`ASM-U1a-3`: no dual read).⟩ */
export type LayoutZoneName = 'top' | 'bottom' | 'left' | 'right'

/** The two shell regions that are serialized but are never pane drop targets. */
export type RegionName = 'stage' | 'top-bar'

/** One pane's placement overlay entry. `collapsed` is PER-PANE (C5); `index`
 *  is the pane's position within its zone (W2-Q1) — ⟨`U-1a`: D-16's spelling move,
 *  `order` → `index`, over a settled meaning; the pre-`U-1a` member name was
 *  `order` (superseded, kept visible).⟩
 *
 *  ⟨Unit `U-3` `C-1` / `ASM-U3-2` — **ABSENCE IS STORABLE** (`D-262`).⟩ `index`
 *  is OPTIONAL and an ABSENT member is a meaning, not a hole: *"sort me at my
 *  DECLARED place"* (`PaneDefinition.defaultOrder` when finite, else the pane's
 *  registration `seq` — the ONE law is `panePlace` below). The member is the
 *  precedent `collapsed`'s absence-preserving shape applied one member over: a
 *  malformed/junk `index` and an absent one BOTH end ABSENT at the coercion
 *  boundary, and `coerceLayout` NEVER substitutes the reading's array position
 *  (that substitution WAS the defect `D-262` names — the read position is a
 *  fact of the serialized array, never of the pane). Every arithmetic reader
 *  goes through `panePlace`, so `number | undefined` is never subtracted. */
export interface PaneLayoutEntry {
  id: string
  zone: LayoutZoneName
  index?: number
  collapsed: boolean
}

/** One zone's geometry: `size` is PER-ZONE (C7) and `collapsed` is the
 *  PER-ZONE operator STATEMENT (C12) (W2-Q1).
 *
 *  ⟨Unit `U-1b` — D-22 (1): ONE collapsed state, TWO ways to reach it.⟩
 *  `collapsed` is OPTIONAL and ABSENCE is the storable "nothing stated": where
 *  the record states nothing, the zone's state is DERIVED (`zoneCollapsedOf`
 *  below — collapsed iff no enabled+placed pane names the zone), and where the
 *  record states a boolean, the operator's word wins. The act writes an explicit
 *  boolean and NEVER deletes (`ASM-U1b-1`); `size` is REQUIRED and is the one
 *  thing a collapse never touches (forking §7.1 lines 480-481). */
export interface ZoneLayout {
  size: number
  collapsed?: boolean
}

/** The serialized layout state (the C9 `OperatorSettings.layout` slice). The
 *  serialized state is authoritative; the graph mirrors the derived facts
 *  (`is-empty`/`is-revealed`/`is-collapsed` on the zone container, and the
 *  per-pane `is-collapsed` frame class). */
export interface LayoutState {
  version: number
  panes: PaneLayoutEntry[]
  zones: { left: ZoneLayout; right: ZoneLayout; top: ZoneLayout; bottom: ZoneLayout }
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

/** The four pane zones, in the assembler's payload order — ⟨`U-1a` `ASM-U1a-1`:
 *  re-grained **BY POSITION** (`header`→`top`, `footer`→`bottom` in place), so the
 *  payload order and every order-sensitive assertion keep their meaning. The
 *  foundation's own `top|bottom|left|right` order is its demo census and is NOT
 *  copied (`forking.md` §9).⟩ */
export const LAYOUT_PANE_ZONES: readonly LayoutZoneName[] = ['left', 'right', 'top', 'bottom']

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
  top: 48,
  bottom: 48,
}
const DEFAULT_STAGE_SIZE = 640
const DEFAULT_TOPBAR_SIZE = 36

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** True when `value` is a known pane zone name (spec §2.6 pin 7 unknown-zone
 *  coercion relies on this). */
export function isLayoutZoneName(value: unknown): value is LayoutZoneName {
  return value === 'top' || value === 'bottom' || value === 'left' || value === 'right'
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
 *  that zone's default. ⟨Unit `U-1b` — ABSENCE-PRESERVING (`ASM-U1b-1`):⟩ the
 *  `collapsed` statement is copied ONLY when it is exactly `true` or `false`;
 *  every other value — a junk member, a legacy profile's superseded zone-state
 *  member, an absent key — is OMITTED, so an old/malformed profile DERIVES its
 *  zone state instead of being silently read as "the operator expanded it".
 *  An omitted member is never written as `undefined` (see the conditional
 *  spread): absence is the meaning, so `exactOptionalPropertyTypes` off still
 *  never sees a present-but-undefined key. */
function coerceZoneLayout(value: unknown, fallbackSize: number): ZoneLayout {
  if (!isRecord(value)) return { size: fallbackSize }
  const size = coerceSize(value.size, fallbackSize)
  const stated = value.collapsed
  return typeof stated === 'boolean' ? { size, collapsed: stated } : { size }
}

/** THE ONE DERIVATION of a zone's collapsed state — the foundation's predicate,
 *  PURE and TOTAL over `(boolean | undefined, number)` (`forking.md` §11's last
 *  row; `ASM-U1b-11`).
 *
 *  A stated boolean IS the answer (the operator's word overturns the derivation
 *  on the same member); where nothing is stated, a zone is collapsed IFF no
 *  enabled+placed pane names it — the census the `is-empty` mirror already
 *  reads (`ASM-U1b-3`). It never throws: a non-finite/negative `paneCount`
 *  simply never equals `0` and reads `false`.
 *
 *  ⟨`ASM-U1b-11` — WHERE IT LIVES.⟩ DEFINED here (`layout-state.ts`), because
 *  the projection arm below (`zoneTrackVars`, `C-4`) must call it and
 *  `operator-settings-store.ts` imports this module into the MAIN bundle —
 *  defining it in `pane-graph.ts` would make this module import the assembler
 *  (an import cycle that drags `pane-graph.ts` into the main bundle). It is
 *  RE-EXPORTED from `pane-graph.ts` for the sidebar/assembler callers, so the
 *  import graph stays one-way and every site calls THIS expression. */
export function zoneCollapsedOf(stated: boolean | undefined, paneCount: number): boolean {
  return typeof stated === 'boolean' ? stated : paneCount === 0
}

/** The pinned default layout: zero panes, the default zone/region geometry.
 *  ⟨Unit `U-1b` — `ASM-U1b-2`:⟩ the four zone seeds OMIT the `collapsed` member.
 *  A seeded `false` would state "the operator expanded this zone" for every
 *  zone of every fresh profile and switch the derivation off. */
export function defaultLayout(): LayoutState {
  return {
    version: LAYOUT_VERSION,
    panes: [],
    zones: {
      left: { size: DEFAULT_ZONE_SIZE.left },
      right: { size: DEFAULT_ZONE_SIZE.right },
      top: { size: DEFAULT_ZONE_SIZE.top },
      bottom: { size: DEFAULT_ZONE_SIZE.bottom },
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
    index:
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
      // ⟨Unit `U-3` `C-1` / `ASM-U3-2` — ABSENCE-PRESERVING (`D-262`).⟩ The
      // member is copied ONLY when it is a FINITE NUMBER; a junk value (`'x'`,
      // `NaN`, `±Infinity`) and an absent key both leave the key OFF the entry
      // (the conditional spread — never a present-but-`undefined` key, the same
      // discipline `coerceZoneLayout` uses one member over). The superseded
      // reading is KEPT VISIBLE and NEVER re-introduced (`RCA-8(c)`):
      // `index: typeof raw.index === 'number' && Number.isFinite(raw.index) ?
      // raw.index : index` — the loop's array POSITION — which is exactly the
      // `D-262` defect (the pane would sort at the reading's slot, not at its
      // declared place).
      ...(typeof raw.index === 'number' && Number.isFinite(raw.index) ? { index: raw.index } : {}),
      collapsed: raw.collapsed === true,
    })
  }

  const rawZones = isRecord(value.zones) ? value.zones : {}
  const zones = {
    left: coerceZoneLayout(rawZones.left, DEFAULT_ZONE_SIZE.left),
    right: coerceZoneLayout(rawZones.right, DEFAULT_ZONE_SIZE.right),
    top: coerceZoneLayout(rawZones.top, DEFAULT_ZONE_SIZE.top),
    bottom: coerceZoneLayout(rawZones.bottom, DEFAULT_ZONE_SIZE.bottom),  }
  const rawStage = isRecord(value.stage) ? value.stage : {}
  const rawTopBar = isRecord(value.topBar) ? value.topBar : {}
  const stage = { size: coerceSize(rawStage.size, DEFAULT_STAGE_SIZE) }
  const topBar = { size: coerceSize(rawTopBar.size, DEFAULT_TOPBAR_SIZE) }

  return { version: LAYOUT_VERSION, panes, zones, stage, topBar }
}

/** ⟨Unit `U-3` `C-1` — THE ONE PLACEMENT LAW.⟩ A pane's **declared place** is
 *  `defaultOrder` when that is a finite number, else its registration `seq`, else
 *  `0`; its **effective place** is the entry's STATED finite `index` when one is
 *  stated, else the declared place. ONE expression, ONE home: the assembler
 *  (`pane-graph.ts` → `resolveEnabledZonePanes`) reads it for ORDER, the act
 *  (`pane-drag.ts` → `panePlacementOf`/`movePane`) for the WORD and the two
 *  sibling SORTS, and NO site re-spells `defaultOrder ?? seq` or `index ??
 *  declared` (`L2` §4 invariant 2 — the two would drift apart).
 *
 *  PURE + TOTAL (`L2` §3: *"TOTAL/fail-soft"*): every input arm — an absent
 *  entry, a junk `defaultOrder`/`seq` (`'x'`, `NaN`, `±Infinity`), an absent
 *  `input` itself — answers two FINITE numbers and never throws, so no
 *  comparison downstream can be `NaN`-poisoned and no caller needs a guard. */
export function panePlace(input: {
  entry?: PaneLayoutEntry
  defaultOrder?: unknown
  seq?: unknown
}): { declared: number; effective: number } {
  const finite = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value)
  const source = input ?? {}
  const declared = finite(source.defaultOrder)
    ? source.defaultOrder
    : finite(source.seq)
      ? source.seq
      : 0
  const stated = source.entry?.index
  const effective = finite(stated) ? stated : declared
  return { declared, effective }
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
 *  revealed as a drag drop target (the C11 carve-out), `auto` for a COLLAPSED
 *  occupied zone (`U-1b` `C-4`), else the persisted `--zone-<zone>-size` value.
 *  `--stage-weight` stays the serialized `fr` weight, so the stage — the
 *  remaining-space track — reclaims the collapsed zone's space. Fail-soft (a
 *  null/malformed registry or layout never throws and never emits
 *  `NaN`/`Infinity`/negative geometry) and PURE.
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
    // fork's census, so a zone that is NOT empty never takes the empty token.
    //
    // AN EMPTY zone carries the MODULE's own answer for that member, verbatim, and the
    // two reachable answers are the contract's two write rules (`§3` row 1): `'0px'`
    // (the caller's `emptyToken`, an empty zone the predicate did NOT decline) is the
    // COLLAPSE WRITE, and `''` (the DECLINED member, the C11 carve-out — an empty zone
    // the fork IS revealing) is the REMOVAL PATH, which the write site turns into
    // `removeProperty` so the stylesheet fallback supplies the persisted size. A member
    // the record does not carry falls back to the collapse token.
    //
    // ⟨Unit `U-1b` — `C-4` / `ASM-U1b-10`: THE COLLAPSED OCCUPIED ARM.⟩ An OCCUPIED zone
    // takes `'auto'` when its state is collapsed (so the grid area, the fixed
    // container's insets and the track all take their extent from CONTENT — the tab
    // strip's own box), and `String(size)+unit` when it is expanded (the persisted size,
    // the one thing a collapse never touches). The state is read through the SAME
    // `zoneCollapsedOf` predicate the assembler calls — never re-spelled here — and the
    // empty case keeps F-3's authority unchanged (`ASM-U1b-4`/`-8`: the two extents
    // coexist, the `0px` rule governing the empty case). NO `size` is written on the
    // collapsed arm and no collapsed-size constant exists anywhere (`G`).
    const declaredEmpty = isEmpty(counts, zone)
    const collapsed = zoneCollapsedOf(l.zones[zone].collapsed, counts[zone] ?? 0)
    vars[name] = declaredEmpty
      ? typeof memberTrack === 'string'
        ? memberTrack
        : '0px'
      : collapsed
        ? 'auto'
        : `${l.zones[zone].size}px`
  }
  return vars
}

