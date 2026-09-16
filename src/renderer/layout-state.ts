// src/renderer/layout-state.ts — Unit U-SHELL-1: the serialized `LayoutState`
// model (docs/specs/unit-u-shell-1-layout-zones.md §2.1/§2.6 pin 1). The base
// module is PURE (no Electron/DOM): the `LayoutState` types + the total
// `defaultLayout`/`deriveLayout`/`coerceLayout` helpers. `coerceLayout` is the
// shared fail-soft coercion the operator-settings store mirrors for its `layout`
// slice (like `coerceTheme`/`coerceEditingMode`, but exported here because it is
// shared by the store + the app-graph assembler).
//
// W2-N3 (AF-3) — additive: `layoutCssVars`/`applyLayoutToRoot` project the
// serialized geometry onto the shell grid's CSS custom properties (§2.4). The
// projection is pure; the applier takes an injected root surface (no DOM
// import) so it stays node-testable, mirroring `theme.ts`'s `applyThemeToRoot`.
//
// F-3 (docs/defects.md EMPTY-ZONE-TRACK-NOT-COLLAPSED, 2026-09-15) — additive:
// `zoneTrackCssVars` projects the per-zone GRID TRACK (the persisted size, or
// `0px` when the enabled+placed census says the zone is empty) onto the shell
// grid. The census is duplicated here (see `isZoneEmpty`) rather than imported
// from `pane-graph.ts`: `enabledZonePaneCounts` lives in the pane-assembly
// module, which this pure geometry module is imported BY (and which is also
// loaded from the MAIN process via `operator-settings-store.ts`).
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

/** W2-N3 (AF-3) — project the serialized layout onto the shell grid's CSS
 *  custom properties (the shell chrome is NOT a provident node). The four pane
 *  zones + `topBar` project to px SIZES; `stage.size` is the serialized 1fr
 *  weight (§2.1) so it projects with an `fr` unit. TOTAL/fail-soft: the layout
 *  is re-coerced first, so a corrupt size can never emit `NaN`/`-Infinity`/
 *  negative geometry (a finite-positive track is always produced). PURE.
 *
 *  NOTE — the zone entries are the PERSISTED sizes, NOT the grid tracks: an
 *  empty zone's track is `0px` (F-3; see `zoneTrackCssVars`). */
export function layoutCssVars(layout: LayoutState): Record<string, string> {
  const l = coerceLayout(layout)
  return {
    '--zone-left-size': `${l.zones.left.size}px`,
    '--zone-right-size': `${l.zones.right.size}px`,
    '--zone-header-size': `${l.zones.header.size}px`,
    '--zone-footer-size': `${l.zones.footer.size}px`,
    '--stage-weight': `${l.stage.size}fr`,
    '--top-bar-size': `${l.topBar.size}px`,
  }
}

/** The §2.5 enabled+placed census for ONE zone — `true` when the zone holds
 *  ZERO enabled `app-graph` panes after placement resolution (the persisted
 *  overlay entry wins, else the pane's `defaultZone`, else `left`; §2.6 pin 7).
 *  This mirrors `enabledZonePaneCounts` (`pane-graph.ts`, H1) — the count the
 *  `is-empty` mirror is derived from — NOT the raw overlay, and NOT the runtime
 *  overlay class (which lags a toggle until the managed reconcile lands).
 *  TOTAL/fail-soft: a null/absent/malformed registry reads as "no panes". */
function isZoneEmpty(
  registry: PaneRegistry | null | undefined,
  layout: LayoutState,
  zone: LayoutZoneName,
): boolean {
  const reg = registry as PaneRegistry | null | undefined
  if (reg == null || typeof reg.listByScope !== 'function' || typeof reg.isEnabled !== 'function') {
    return true
  }
  let panes: unknown
  try {
    panes = reg.listByScope('app-graph')
  } catch {
    return true
  }
  if (!Array.isArray(panes)) return true
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
    if (resolved === zone) return false
  }
  return true
}

/** F-3 (docs/defects.md EMPTY-ZONE-TRACK-NOT-COLLAPSED) — project the shell
 *  grid's per-zone TRACK custom properties: `0px` for a zone with ZERO
 *  enabled+placed `app-graph` panes (the §2.5 census) that is NOT currently
 *  revealed as a drag drop target (the C11 carve-out), else the persisted
 *  `--zone-<zone>-size` value. `--stage-weight` stays the serialized `fr`
 *  weight, so the stage — the remaining-space track — reclaims the collapsed
 *  zone's space. Fail-soft (a null/malformed registry or layout never throws
 *  and never emits `NaN`/`Infinity`/negative geometry) and PURE. */
export function zoneTrackCssVars(
  registry: PaneRegistry | null | undefined,
  layout: LayoutState,
  opts?: { revealedZones?: readonly LayoutZoneName[] },
): Record<string, string> {
  const l = coerceLayout(layout)
  const revealed = Array.isArray(opts?.revealedZones) ? opts.revealedZones : []
  const vars: Record<string, string> = { '--stage-weight': `${l.stage.size}fr` }
  for (const zone of LAYOUT_PANE_ZONES) {
    const collapsed = isZoneEmpty(registry, l, zone) && !revealed.includes(zone)
    vars[`--zone-${zone}-track`] = collapsed ? '0px' : `${l.zones[zone].size}px`
  }
  return vars
}

/** The minimal root surface `applyLayoutToRoot` writes: anything whose `style`
 *  exposes `setProperty` (a real `document.documentElement` or a test double). */
export interface LayoutRoot {
  style?: { setProperty?: (name: string, value: string) => void }
}

/** W2-N3 (AF-3) — apply the layout CSS custom properties to a root (§2.4).
 *  TOTAL/fail-soft: a missing/frozen `style`/`setProperty` is left untouched and
 *  never throws (mirrors `theme.ts`'s `applyThemeToRoot`). Returns the vars so a
 *  caller can assert/inspect what was applied. */
export function applyLayoutToRoot(
  root: LayoutRoot | null | undefined,
  layout: LayoutState,
): Record<string, string> {
  const vars = layoutCssVars(layout)
  try {
    const style = root?.style
    if (style && typeof style.setProperty === 'function') {
      for (const [name, value] of Object.entries(vars)) style.setProperty(name, value)
    }
  } catch {
    // never throw — a frozen/absent root must not break boot
  }
  return vars
}
