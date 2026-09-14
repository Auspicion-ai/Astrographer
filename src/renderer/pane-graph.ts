// src/renderer/pane-graph.ts — Unit H: the app-graph pane assembly + the pure
// §5.3 data-flow helpers (docs/specs/unit-h-sidebar-panes.md §5.2-§5.3). A PURE
// module (no Electron). Merges the Unit C traversal envelope with the enabled
// app-graph panes (into the pane-inclusive app-graph envelope) and builds the
// operator isolated-scope envelope.
import type { LegacyInitialData, LegacyNodeData, LegacyContentPayload } from 'provident-ssr'
import type { BacklinkResult } from '../main/backlinks.js'
import type { RagQueryResult } from '../shared/types.js'
import type { EngineRagResult, HealthReport, ConflictError } from '../main/engine-rag-store.js'
import type { Document, DocumentList, Wiki } from '../main/engine-crud-rag-store.js'
import type { PaneRegistry, PaneDefinition, PaneContext } from './pane-registry.js'
import { clickableClasses } from './render-shared.js'
import {
  HOVER_PREVIEW_ENTER_BODY,
  HOVER_PREVIEW_ENTER_HANDLER,
  HOVER_PREVIEW_LEAVE_BODY,
  HOVER_PREVIEW_LEAVE_HANDLER,
  hoverPreviewPopup,
  resolveHoverPreview,
} from './hover-preview.js'
import type { EditingMode, RagJournalPayload } from '../shared/types.js'
import {
  buildDocumentTree,
  selectDocumentIdsByPathPrefix,
  type DocumentTreeNode,
} from '../shared/document-tree.js'
import {
  LAYOUT_PANE_ZONES,
  coerceLayout,
  deriveLayout,
  isLayoutZoneName,
  type LayoutPaneSpec,
  type LayoutState,
  type LayoutZoneName,
  type PaneLayoutEntry,
} from './layout-state.js'
import { zoneOrientation } from './pane-drag.js'

/** The root-visible sidebar zone the app-graph panes attach into. The assembler
 *  MUST emit a `container`-role producer for this zone (the Unit C HARD
 *  PRECONDITION — a `targetPlacement` naming a zone with no container producer
 *  leaves the root `unplaced`, silently not render-eligible). */
export const SIDEBAR_ZONE = 'sidebar'

/** U-SHELL-3 (C5) — the ONE shared collapse-toggle handler name every pane
 *  frame's control carries (spec §2.5 pin 2). The body is authored INLINE on
 *  the control node (the `docNavContent` folder-toggle convention) so a DOM
 *  click and `provident.dispatch` are equivalent; it routes to the SAME
 *  `window.provident.sidebar.togglePaneCollapse` host seam. */
export const PANE_COLLAPSE_HANDLER = 'togglePaneCollapse'

/** The inline collapse-toggle body (a full function-expression string, the
 *  same form `docNavContent`'s toggle body uses). It reads the pane's authored
 *  `data-pane-id` and routes it to the host seam (which flips
 *  `PaneLayoutEntry.collapsed` + persists `layout`). A malformed node is a
 *  no-op — never a throw. */
const PANE_COLLAPSE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.togglePaneCollapse !== 'function') return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-pane-id'];
  if (id) s.togglePaneCollapse(String(id));
}`

/** The pane-frame body marker class (the collapsed frame chrome's hook). */
export const PANE_FRAME_CLASS = 'pane-frame'
/** The U-SHELL-3 `is-collapsed` mirror class (spec §2.5 pin 3). */
export const PANE_COLLAPSED_CLASS = 'is-collapsed'

/** U-SHELL-4 (C12) — the shared zone minimize/expand toggle handler name. The
 *  body is authored INLINE on the zone container's control (mirrors the
 *  U-SHELL-3 `PANE_COLLAPSE_HANDLER` convention) and routes to the SAME
 *  `window.provident.sidebar.zoneMinimizeToggle` host seam, so a DOM click and
 *  `provident.dispatch` are equivalent. */
export const PANE_MINIMIZE_TOGGLE_HANDLER = 'pane-zone-minimize-toggle'

/** The inline zone minimize/expand toggle body. It reads the zone from the
 *  control's authored `data-zone` and routes it to the host seam. A malformed
 *  node is a no-op — never a throw. */
const PANE_MINIMIZE_TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.zoneMinimizeToggle !== 'function') return;
  var zone = ctx && ctx.node && ctx.node.props && ctx.node.props['data-zone'];
  if (zone) s.zoneMinimizeToggle(String(zone));
}`

/** U-SHELL-4 (C12) — the shared zone-tab expand/select handler name. Each tab
 *  carries the SAME name (spec §2.4 "1 handler def per strip"); its inline body
 *  reads the authored `data-zone`/`data-pane-id` and routes to the
 *  `window.provident.sidebar.paneTabExpand` host seam, which expands the zone
 *  (`minimized:false`) + identifies the selected pane. */
export const PANE_TAB_EXPAND_HANDLER = 'pane-tab-expand'

/** The inline tab expand/select body (a full function-expression string). A
 *  malformed node is a no-op — never a throw. */
const PANE_TAB_EXPAND_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.paneTabExpand !== 'function') return;
  var props = ctx && ctx.node && ctx.node.props;
  var zone = props && props['data-zone'];
  var paneId = props && props['data-pane-id'];
  if (zone && paneId) s.paneTabExpand(String(zone), String(paneId));
}`

/** A zone's contained pane (the assembler's resolved per-zone entry). */
interface ZonePane {
  def: PaneDefinition
  order: number
  collapsed: boolean
  seq: number
}

/** U-SHELL-4 (C11, H1/H2) — resolve the enabled app-graph panes into their
 *  placement zones, POST overlay + fallback: a persisted `PaneLayoutEntry` wins,
 *  else the pane's additive `defaultZone`, else `left` (registration order as
 *  the default order). This is the SINGLE enabled+placed census backing the
 *  `is-empty` mirror (H1), the minimize acceptance (H2), and the C12 tab count
 *  (spec §2.5 pin 8) — NOT the raw overlay. PURE. */
function resolveEnabledZonePanes(
  enabledAppGraph: ReadonlyArray<PaneDefinition>,
  layout: LayoutState,
): Record<LayoutZoneName, ZonePane[]> {
  const byId = new Map<string, PaneLayoutEntry>()
  for (const entry of layout.panes) byId.set(entry.id, entry)
  const zonePanes: Record<LayoutZoneName, ZonePane[]> = { left: [], right: [], header: [], footer: [] }
  enabledAppGraph.forEach((def, seq) => {
    const entry = byId.get(def.id)
    const zone: LayoutZoneName = entry?.zone ?? (isLayoutZoneName(def.defaultZone) ? def.defaultZone : 'left')
    const order =
      entry?.order ??
      (typeof def.defaultOrder === 'number' && Number.isFinite(def.defaultOrder) ? def.defaultOrder : seq)
    const collapsed = entry?.collapsed ?? false
    zonePanes[zone].push({ def, order, collapsed, seq })
  })
  for (const zone of LAYOUT_PANE_ZONES) {
    zonePanes[zone].sort((a, b) => a.order - b.order || a.seq - b.seq)
  }
  return zonePanes
}

/** U-SHELL-4 (C11/C12, H1/H2) — the per-zone enabled+placed pane census: the
 *  count of enabled app-graph panes actually emitted into each zone AFTER the
 *  overlay + default fallback resolution. This is the SINGLE census backing the
 *  `is-empty` mirror, `zoneMinimizeToggle`'s acceptance, and the C12 tab count
 *  (spec §2.5 pin 8). PURE. */
export function enabledZonePaneCounts(
  registry: PaneRegistry,
  layout: LayoutState,
): Record<LayoutZoneName, number> {
  const enabledAppGraph = registry.listByScope('app-graph').filter((p) => registry.isEnabled(p.id))
  const resolved = resolveEnabledZonePanes(enabledAppGraph, coerceLayout(layout))
  const counts: Record<LayoutZoneName, number> = { left: 0, right: 0, header: 0, footer: 0 }
  for (const zone of LAYOUT_PANE_ZONES) counts[zone] = resolved[zone].length
  return counts
}

/** U-SHELL-4 (C12) — author the zone container's provident children. A
 *  non-empty zone carries a minimize/expand toggle; a MINIMIZED non-empty zone
 *  REPLACES its pane stack with a tab strip (one `data-pane-id` tab per
 *  contained pane + a shared `on:click` expand handler). An empty zone has no
 *  children (C11 empty-hidden wins — F5). PURE. */
function zoneContainerChildren(
  zone: LayoutZoneName,
  panes: ZonePane[],
  minimized: boolean,
): LegacyNodeData[] {
  if (panes.length === 0) return []
  const toggle: LegacyNodeData = {
    type: 'button',
    props: { id: `zone-minimize-${zone}`, 'data-zone': zone, 'data-minimized': minimized ? 'true' : 'false' },
    css: { classes: clickableClasses(['pane-zone-minimize']) },
    content: minimized ? '▸' : '▾',
    handlers: [{ name: PANE_MINIMIZE_TOGGLE_HANDLER, event: 'click', body: PANE_MINIMIZE_TOGGLE_BODY }],
  }
  if (!minimized) return [toggle]
  const tabs: LegacyNodeData[] = panes.map((p) => ({
    type: 'button',
    props: { id: `zone-tab-${zone}-${p.def.id}`, 'data-pane-id': p.def.id, 'data-zone': zone },
    css: { classes: clickableClasses(['pane-tab']) },
    content: p.def.title,
    handlers: [{ name: PANE_TAB_EXPAND_HANDLER, event: 'click', body: PANE_TAB_EXPAND_BODY }],
  }))
  return [toggle, ...tabs]
}

/** Wrap a pane's render output into a zone content root. The stable pane id
 * (`pane-<id>`) + the zone `targetPlacement` always land on the FRAME root,
 * OVERWRITING whatever `render` returned.
 *
 * U-SHELL-3 (C5) — when `collapsed` is supplied (a boolean), the frame also
 * authors the provident collapse control (ONE shared `PANE_COLLAPSE_HANDLER`
 * name) and the body. When `collapsed === true` the body nodes are NOT
 * authored (header/handle only — spec §2.2/§2.5 pin 1); the frame root carries
 * `is-collapsed` and keeps its stable identity so expanding restores the body.
 *
 * Backward compatibility: a caller that omits `collapsed` gets the pre-
 * U-SHELL-3 shape (the render root IS the pane root — the Unit H
 * `paneSubtreeRoot` contract). The app-graph assembler always supplies the
 * boolean, so every assembled pane frame carries the control. PURE. */
export function paneSubtreeRoot<C>(
  def: PaneDefinition<C>,
  ctx: C,
  sidebarZone: string,
  collapsed?: boolean,
): LegacyNodeData {
  if (def == null || ctx == null || typeof sidebarZone !== 'string' || sidebarZone === '') {
    throw new Error('paneSubtreeRoot: def/ctx/sidebarZone required')
  }
  const renderRoot = def.render(ctx)
  if (renderRoot == null) {
    throw new Error(`paneSubtreeRoot: pane "${def.id}" render returned nothing`)
  }

  // Pre-U-SHELL-3 shape (no collapse frame opted into): the render root IS the
  // pane root (the Unit H `paneSubtreeRoot` contract).
  if (collapsed === undefined) {
    const existingCss = (renderRoot as { css?: { classes?: string[] } }).css
    return {
      ...renderRoot,
      props: { ...(renderRoot.props ?? {}), id: `pane-${def.id}` },
      placement: { targetPlacement: [sidebarZone] },
      ...(existingCss !== undefined ? { css: existingCss } : {}),
    }
  }

  // U-SHELL-3 (C5) pane frame: a header/handle control + the body (expanded).
  const control: LegacyNodeData = {
    type: 'button',
    props: {
      // H2 (adversarial) — a STABLE authored id (unique per pane, preserved
      // across re-derives) so the control is addressable, not just by the
      // volatile engine nodeId.
      id: `pane-collapse-${def.id}`,
      'data-pane-id': def.id,
      'data-pane-collapse': collapsed === true ? 'true' : 'false',
    },
    css: { classes: clickableClasses(['pane-collapse-toggle']) },
    content: collapsed === true ? '▸' : '▾',
    handlers: [{ name: PANE_COLLAPSE_HANDLER, event: 'click', body: PANE_COLLAPSE_BODY }],
  }
  const body: LegacyNodeData = {
    ...renderRoot,
    props: { ...(renderRoot.props ?? {}) },
  }
  const frameClasses = collapsed === true ? [PANE_FRAME_CLASS, PANE_COLLAPSED_CLASS] : [PANE_FRAME_CLASS]
  return {
    type: 'div',
    props: { id: `pane-${def.id}` },
    placement: { targetPlacement: [sidebarZone] },
    css: { classes: frameClasses },
    // Collapsed = header/handle only: the body nodes are NOT authored.
    children: collapsed === true ? [control] : [control, body],
  }
}

export interface AppGraphAssemblyInput {
  /** The Unit C traversal envelope (the wiki content — buildTraversal's
   *  `TraversalResult.envelope`). */
  traversalEnvelope: LegacyInitialData
  /** The pane registry. The enabled app-graph panes are assembled in. */
  registry: PaneRegistry
  /** The pane data context (the host supplies it). */
  ctx: PaneContext
  /** The legacy sidebar zone name (default SIDEBAR_ZONE). Kept for backward
   *  compatibility: the traversal content may still target it, and the legacy
   *  tests pin its producer. Panes no longer target it — they target the
   *  layout zones. */
  sidebarZone?: string
  /** Unit U-SHELL-1 §2.3/§2.6 pin 2 — the serialized layout overlay. Optional;
   *  omitted → the default is derived from the registry (`deriveLayout`). */
  layout?: LayoutState
  /** U-SHELL-4 (C11) — the provisional drop-target zones the shell drag
   *  controller currently reveals. Marked `is-revealed` on the zone container.
   *  Optional; omitted/empty → no zone reveals. */
  revealedZones?: LayoutZoneName[]
}

export interface AppGraphAssemblyResult {
  /** The pane-inclusive envelope: the traversal content payloads + one
   *  ContentPayload per ENABLED app-graph pane (grouped by zone, ordered by
   *  `PaneLayoutEntry.order`), with one `zone:<name>` container producer per
   *  pane zone + one ContentPayload per pane in the template. */
  envelope: LegacyInitialData
  /** The enabled app-graph pane ids included (in registration order). */
  paneIds: string[]
}

interface ZoneContainerNode {
  type?: string
  props?: { id?: unknown; [key: string]: unknown }
  placement?: { placementName?: unknown; [key: string]: unknown }
  css?: { classes?: string[]; [key: string]: unknown }
  [key: string]: unknown
}

/** The `zone:<name>` container producer anchored by `placement.placementName`
 *  — the ONLY anchor the engine resolves a `targetPlacement` against, or
 *  undefined. PURE. */
function findZoneContainerByPlacement(
  children: ZoneContainerNode[],
  name: string,
): ZoneContainerNode | undefined {
  return children.find((c) => c.placement?.placementName === name)
}

/** The `zone:<name>` node matched by `props.id` alone. Such a node is NOT a
 *  resolvable anchor (no `placementName`), so the assembler must repair it
 *  rather than mistake it for the zone container (H1). PURE. */
function findZoneContainerById(children: ZoneContainerNode[], name: string): ZoneContainerNode | undefined {
  return children.find((c) => c.props?.id === `zone:${name}`)
}

/** The container node for `name` preferring the authoritative `placementName`
 *  anchor, else the `props.id` match for repair. PURE. */
function findZoneContainer(children: ZoneContainerNode[], name: string): ZoneContainerNode | undefined {
  return findZoneContainerByPlacement(children, name) ?? findZoneContainerById(children, name)
}

/** The mirror classes a zone container carries (spec §2.6 pin 4): `is-empty`
 *  when the zone has zero panes (C11), `is-minimized` when the zone is
 *  minimized (C12) and `is-revealed` when the shell drag controller currently
 *  reveals it as a provisional drop target (U-SHELL-4/C11). */
function zoneMirrorClasses(paneCount: number, minimized: boolean, revealed: boolean): string[] {
  const classes: string[] = []
  if (paneCount === 0) classes.push('is-empty')
  if (minimized) classes.push('is-minimized')
  if (revealed) classes.push('is-revealed')
  return classes
}

/** Assemble the pane-inclusive app-graph envelope from the traversal envelope
 *  + the enabled app-graph panes. Every pane zone always gets a stable
 *  `zone:<name>` container producer (W2-Q3); panes are placed into their zone
 *  in `PaneLayoutEntry.order` (spec §2.6 pin 3). PURE. */
export function assembleAppGraphEnvelope(input: AppGraphAssemblyInput): AppGraphAssemblyResult {
  if (
    input == null ||
    input.registry == null ||
    input.ctx == null ||
    input.traversalEnvelope == null ||
    // H2 (adversarial): a malformed traversal envelope with a null/missing
    // `template` or `template.root` must throw the DOCUMENTED guard error
    // (not a raw TypeError from dereferencing `template.root.children`).
    input.traversalEnvelope.template?.root == null
  ) {
    throw new Error('assembleAppGraphEnvelope: input/registry/ctx/traversalEnvelope required')
  }
  const { registry, ctx, traversalEnvelope } = input
  const sidebarZone = input.sidebarZone ?? SIDEBAR_ZONE

  // The ENABLED app-graph panes, in registration order. Operator panes are
  // EXCLUDED — they never enter the app graph.
  const enabledAppGraph = registry
    .listByScope('app-graph')
    .filter((p) => registry.isEnabled(p.id))
  const paneIds = enabledAppGraph.map((p) => p.id)

  // The serialized layout overlay is authoritative; omitted → derive the
  // default from the registry (W2-Q4). The overlay never invents panes: only
  // enabled+registered panes are placed.
  const layout: LayoutState =
    input.layout != null ? coerceLayout(input.layout) : deriveLayout(enabledAppGraph as LayoutPaneSpec[])

  // F2 — a persisted entry naming an unregistered pane is dropped (no phantom
  // node) and reported over the host `console.warn` channel (spec §2.6 pin 6).
  const registeredIds = new Set(registry.list().map((p) => p.id))
  for (const entry of layout.panes) {
    if (!registeredIds.has(entry.id)) {
      if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn(
          `assembleAppGraphEnvelope: dropping layout entry for unregistered pane "${entry.id}"`,
        )
      }
    }
  }

  // U-SHELL-4 (C11, H1/H2) — resolve each enabled pane's zone/order/collapsed
  // into the SINGLE enabled+placed census (post overlay + default fallback).
  // `is-empty` derives from THIS (`zonePanes[zone].length`), NOT the raw overlay:
  // a fallback-placed pane makes its zone non-empty (spec §2.5 pin 8).
  const zonePanes = resolveEnabledZonePanes(enabledAppGraph, layout)

  // U-SHELL-4 (C11) — the shell's provisional drop-target zones (filtered to
  // known zone names; junk entries are ignored).
  const revealedSet = new Set<LayoutZoneName>(
    Array.isArray(input.revealedZones) ? input.revealedZones.filter(isLayoutZoneName) : [],
  )

  // One ContentPayload per pane, grouped by zone (payload order is the
  // `PaneLayoutEntry.order` observable — spec §2.6 pin 3). U-SHELL-4 (C12) — a
  // MINIMIZED non-empty zone REPLACES its pane stack with the tab strip (below),
  // so its pane payloads are not emitted.
  const panePayloads: LegacyContentPayload[] = []
  for (const zone of LAYOUT_PANE_ZONES) {
    if (layout.zones[zone].minimized === true && zonePanes[zone].length > 0) continue
    for (const p of zonePanes[zone]) {
      panePayloads.push({ content: [paneSubtreeRoot(p.def, ctx, zone, p.collapsed)] })
    }
  }

  // Merge the traversal content payloads + the pane ContentPayloads (panes
  // appended after the traversal content).
  const content = [...(traversalEnvelope.content ?? []), ...panePayloads]

  // Ensure the template root has one `container`-role producer per pane zone
  // (the HARD PRECONDITION) with the state-derived mirror classes + the C12
  // minimize/tab-strip subtree. Keep an existing producer for the same zone;
  // add it otherwise.
  const templateRoot = traversalEnvelope.template.root
  const children = [...((templateRoot.children ?? []) as ZoneContainerNode[])]
  for (const zone of LAYOUT_PANE_ZONES) {
    const minimized = layout.zones[zone].minimized === true
    const classes = zoneMirrorClasses(zonePanes[zone].length, minimized, revealedSet.has(zone))
    const authoredChildren = zoneContainerChildren(zone, zonePanes[zone], minimized)
    // H1 — prefer the authoritative `placementName` anchor. A node matched only
    // by `props.id` is NOT resolvable by the engine, so synthesize the missing
    // `placementName` on it (the HARD PRECONDITION) rather than keeping it as-is.
    const anchored = findZoneContainerByPlacement(children, zone)
    const existing = findZoneContainer(children, zone)
    if (existing != null) {
      const existingClasses = existing.css?.classes ?? []
      const merged = [...new Set([...existingClasses, ...classes])]
      const repaired =
        anchored != null
          ? existing
          : { ...existing, placement: { ...(existing.placement ?? {}), placementName: zone } }
      const existingChildren = (existing.children ?? []) as LegacyNodeData[]
      children[children.indexOf(existing)] = {
        ...repaired,
        props: { ...(repaired.props ?? {}), 'data-zone': zone, 'data-orientation': zoneOrientation(zone) },
        css: { ...(existing.css ?? {}), classes: merged },
        ...(authoredChildren.length > 0
          ? { children: [...existingChildren, ...authoredChildren] }
          : {}),
      }
    } else {
      children.push({
        type: 'div',
        props: { id: `zone:${zone}`, 'data-zone': zone, 'data-orientation': zoneOrientation(zone) },
        placement: { placementName: zone },
        ...(classes.length > 0 ? { css: { classes } } : {}),
        ...(authoredChildren.length > 0 ? { children: authoredChildren } : {}),
      })
    }
  }

  // Backward compatibility: keep/add the legacy sidebar producer (the traversal
  // content may still target it; the legacy assembler tests pin it). An id-only
  // `zone:sidebar` node gets its `placementName` synthesized too (H1).
  if (findZoneContainerByPlacement(children, sidebarZone) == null) {
    const byId = findZoneContainerById(children, sidebarZone)
    if (byId != null) {
      children[children.indexOf(byId)] = {
        ...byId,
        placement: { ...(byId.placement ?? {}), placementName: sidebarZone },
      }
    } else {
      children.push({
        type: 'div',
        props: { id: `zone:${sidebarZone}` },
        placement: { placementName: sidebarZone },
      })
    }
  }

  const envelope: LegacyInitialData = {
    ...traversalEnvelope,
    template: { ...traversalEnvelope.template, root: { ...templateRoot, children: children as LegacyNodeData[] } },
    content,
  }
  return { envelope, paneIds }
}

/** Build the operator isolated-scope envelope from the enabled 'operator'
 *  panes (each `render(ctx)` → a section mounted as a family child of the
 *  template root). PURE. */
export function buildOperatorEnvelope(
  registry: PaneRegistry,
  ctx: PaneContext,
): LegacyInitialData {
  if (registry == null || ctx == null) {
    throw new Error('buildOperatorEnvelope: registry/ctx required')
  }
  const enabledOperator = registry
    .listByScope('operator')
    .filter((p) => registry.isEnabled(p.id))
  const sections = enabledOperator.map((p) => {
    const section = p.render(ctx)
    if (section == null) {
      throw new Error(`buildOperatorEnvelope: operator pane "${p.id}" render returned nothing`)
    }
    return { ...section, props: { ...(section.props ?? {}), id: `operator-pane-${p.id}` } }
  })
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'operator-panes' },
        children: sections,
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ===========================================================================
// §5.3 data-flow helpers (PURE)
// ===========================================================================

/** The doc-nav document list, derived from the `doc-head` edges. Each document
 *  = the `doc-head` edge's target (the document root id); its title = the
 *  `doc-head` edge's SOURCE node's content. Sorted by document root id
 *  (lexicographic ascending, deterministic). Unit V3 — the input is the
 *  `docHeads` list (from the `rag-doc-heads` IPC), NOT the full snapshot. */
export function deriveDocNavDocuments(
  docHeads: ReadonlyArray<{ documentId: string; title: string }> | null,
): Array<{ documentId: string; title: string }> {
  // H1 (adversarial): a null/missing docHeads must survive (return the empty
  // list → the "(no documents)" empty state), never a TypeError.
  if (docHeads == null) return []
  // LOW-2 (adversarial): a truthy NON-ARRAY docHeads (a malformed bridge
  // payload) must coerce to [] — never a TypeError from `.map`.
  if (!Array.isArray(docHeads)) return []
  // LOW-3 (adversarial): restore the defensive sort-by-documentId + dedupe-by-
  // target so a malformed/unsorted/duplicated docHeads from the bridge renders
  // a sorted, deduped doc-nav. A missing/empty documentId or a missing title is
  // coerced (LOW-4) — never a phantom entry or a `content: undefined`.
  const seen = new Set<string>()
  const docs: Array<{ documentId: string; title: string }> = []
  for (const d of docHeads) {
    if (d == null || d.documentId == null || d.documentId === '') continue
    if (seen.has(d.documentId)) continue // dedupe by target (first head wins)
    seen.add(d.documentId)
    docs.push({ documentId: d.documentId, title: d.title ?? '' })
  }
  docs.sort((a, b) => a.documentId.localeCompare(b.documentId))
  return docs
}

// ===========================================================================
// U-PARITY-DOCNAV (G2) — the doc-nav DERIVED tree + dispatchable nodes.
// PG14 (W1-Q16): every item carries a handler so `provident.dispatch` and a DOM
// click are equivalent. The C15 `buildDocumentTree`/`selectDocumentIdsByPathPrefix`
// helpers supply the folder/leaf derivation (the U-D4 data model is reused
// UNCHANGED). PURE (no Electron/fs/store/DOM).
// ===========================================================================

/** The doc-nav folder-toggle handler name. The body is authored INLINE on the
 *  folder node (below) and calls the SAME `window.provident.sidebar.docNavToggle`
 *  host seam the DOM click uses — `provident.dispatch` and a DOM click are
 *  equivalent (PG14 / W1-Q16). */
export const DOC_NAV_TOGGLE_HANDLER = 'pane-doc-nav-toggle'

/** The doc-nav leaf-select handler name (registered in `sidebar-panes.ts`). Its
 *  body calls the SAME `window.provident.sidebar.selectDocument(id)`
 *  application seam the DOM click uses (PG14 / W1-Q16). */
export const DOC_NAV_SELECT_HANDLER = 'pane-doc-nav-select'

/** The inline folder-toggle body (a full function-expression string, the same
 *  form the gnosis pane bodies use). It reads the folder's authored
 *  `data-folder-path` key and routes it to the host seam, which flips the
 *  expanded set + re-derives. A malformed node is a no-op — never a throw. */
const DOC_NAV_TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.docNavToggle !== 'function') return;
  var key = ctx && ctx.node && ctx.node.props && ctx.node.props['data-folder-path'];
  if (key) s.docNavToggle(String(key));
}`

/** The doc-nav tree render options. `expandedPaths` is the host's expanded
 *  folder set (each entry a `JSON.stringify(path[]))` key) — a folder renders
 *  its children only when its key is present (expand/collapse). `pathPrefix`
 *  narrows via the C15 `selectDocumentIdsByPathPrefix`; `tags` keeps only
 *  leaves carrying ALL the requested tags. Filters are AND-combined;
 *  omitted/`[]` is a no-op. */
export interface DocNavRenderOptions {
  expandedPaths?: ReadonlyArray<string>
  pathPrefix?: string[]
  tags?: string[]
}

type DocHeadList = NonNullable<PaneContext['docHeads']>

/** Normalize + dedupe (first wins) the doc-heads list, coercing the display
 *  fields. PURE + TOTAL — never throws on malformed input. */
function normalizeDocNavHeads(docHeads: unknown): DocHeadList {
  if (!Array.isArray(docHeads)) return []
  const seen = new Set<string>()
  const docs: DocHeadList = []
  for (const raw of docHeads) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) continue
    const d = raw as { documentId?: unknown; title?: unknown; path?: unknown; tags?: unknown }
    if (typeof d.documentId !== 'string' || d.documentId === '') continue
    if (seen.has(d.documentId)) continue
    seen.add(d.documentId)
    docs.push({
      documentId: d.documentId,
      title: typeof d.title === 'string' ? d.title : '',
      path: Array.isArray(d.path) ? (d.path as string[]) : [],
      tags: Array.isArray(d.tags) ? (d.tags as string[]) : [],
    })
  }
  return docs
}

/** Apply the optional tree filter (state 3). PURE. */
function filterDocNavHeads(docs: DocHeadList, options?: DocNavRenderOptions): DocHeadList {
  if (options == null) return docs
  let out = docs
  const prefix = options.pathPrefix
  if (Array.isArray(prefix) && prefix.length > 0) {
    const ids = new Set(selectDocumentIdsByPathPrefix(docs, prefix))
    out = out.filter((d) => ids.has(d.documentId))
  }
  const tags = options.tags
  if (Array.isArray(tags) && tags.length > 0) {
    out = out.filter((d) => tags.every((t) => d.tags.includes(t)))
  }
  return out
}

/** Render ONE derived tree node to provident data. Folders carry the
 *  `pane-doc-nav-toggle` handler + `is-clickable`; leaves carry the
 *  `pane-doc-nav-select` handler + `is-clickable`. An EXPANDED folder renders a
 *  nested `<ul>` of its children; a collapsed folder renders none (the toggle
 *  handler flips the host's expanded set → re-derive). PURE. */
function renderDocNavNode(
  node: DocumentTreeNode,
  currentDocumentId: string | null,
  expanded: ReadonlySet<string>,
): LegacyNodeData {
  if (node.kind === 'folder') {
    const key = JSON.stringify(node.path)
    const isExpanded = expanded.has(key)
    return {
      type: 'li',
      props: {
        'data-folder-path': key,
        'data-folder-label': node.label,
        'data-expanded': isExpanded ? 'true' : 'false',
      },
      css: { classes: clickableClasses() },
      content: node.label,
      handlers: [{ name: DOC_NAV_TOGGLE_HANDLER, event: 'click', body: DOC_NAV_TOGGLE_BODY }],
      ...(isExpanded
        ? { children: [{ type: 'ul', props: { 'data-folder-children': key }, children: [] }] }
        : {}),
    }
  }
  return {
    type: 'li',
    props: {
      'data-document-id': node.documentId,
      ...(node.documentId === currentDocumentId ? { 'data-current': 'true' } : {}),
    },
    css: { classes: clickableClasses() },
    content: node.title ?? '', // LOW-4 (adversarial): a missing title → '' (never `content: undefined`)
    handlers: [{ name: DOC_NAV_SELECT_HANDLER, event: 'click' }],
  }
}

/** Flatten the derived tree into nested provident `li`/`ul` data using an
 *  EXPLICIT STACK (depth-safe — a path of any finite depth renders without a
 *  call-stack overflow, mirroring `buildDocumentTree`'s iterative walk). PURE. */
function renderDocNavTree(
  nodes: DocumentTreeNode[],
  currentDocumentId: string | null,
  expanded: ReadonlySet<string>,
): LegacyNodeData[] {
  const root: LegacyNodeData[] = []
  const stack: Array<{ nodes: DocumentTreeNode[]; out: LegacyNodeData[] }> = [{ nodes, out: root }]
  while (stack.length > 0) {
    const frame = stack.pop() as { nodes: DocumentTreeNode[]; out: LegacyNodeData[] }
    for (const node of frame.nodes) {
      const rendered = renderDocNavNode(node, currentDocumentId, expanded)
      frame.out.push(rendered)
      if (node.kind === 'folder' && Array.isArray(rendered.children) && rendered.children.length > 0) {
        const childUl = rendered.children[0] as LegacyNodeData
        stack.push({ nodes: node.children, out: childUl.children as LegacyNodeData[] })
      }
    }
  }
  return root
}

/** The `doc-nav` pane content (U-PARITY-DOCNAV): a DERIVED folder/leaf tree
 *  from the C15 `RagDocHeadsPayload.documents[].path` (via `buildDocumentTree`).
 *  Folder toggles are dispatchable (`pane-doc-nav-toggle`); leaves select via
 *  the shared `selectDocument` seam (`pane-doc-nav-select`). The current
 *  document's leaf carries `props['data-current'] = 'true'`. A null/malformed
 *  list OR an empty corpus → a single `p` with content `(no documents)`. When
 *  the tree helper yields nothing for a non-empty list, the pre-U-PARITY flat
 *  render is preserved (defensive fallback). `options.expandedPaths` expands
 *  folders. PURE + TOTAL. */
export function docNavContent(ctx: PaneContext, options?: DocNavRenderOptions): LegacyNodeData {
  // H1 (adversarial): a null ctx or a null/missing ctx.docHeads must survive →
  // the "(no documents)" empty state, never a TypeError.
  if (ctx == null || ctx.docHeads == null) {
    return { type: 'p', content: '(no documents)' }
  }
  const docs = filterDocNavHeads(normalizeDocNavHeads(ctx.docHeads), options)
  if (docs.length === 0) return { type: 'p', content: '(no documents)' }
  const tree = buildDocumentTree(docs)
  if (tree.length === 0) {
    // Defensive flat fallback — preserve the flat render when the C15 tree
    // helper yields nothing for a non-empty (but malformed) list.
    return {
      type: 'ul',
      children: deriveDocNavDocuments(docs).map((d) => ({
        type: 'li',
        props: {
          'data-document-id': d.documentId,
          ...(d.documentId === ctx.currentDocumentId ? { 'data-current': 'true' } : {}),
        },
        css: { classes: clickableClasses() },
        content: d.title ?? '',
        handlers: [{ name: DOC_NAV_SELECT_HANDLER, event: 'click' }],
      })),
    }
  }
  const expanded = new Set(options?.expandedPaths ?? [])
  return { type: 'ul', children: renderDocNavTree(tree, ctx.currentDocumentId, expanded) }
}

/** U-PARITY-C19 — the crosslinks pane's hover-preview render options. The host
 *  passes the shell controller's active target id (null when no popup) + the
 *  computed position (F3). */
export interface CrosslinksRenderOptions {
  hoverPreviewId?: string | null
  hoverPreviewPosition?: 'above' | 'below'
}

/** The `crosslinks` pane content: two `section`s — "Outgoing crosslinks" (one
 *  `li` per `ctx.crosslinks` entry, `data-target`, with the C19
 *  `on:mouseover`/`on:mouseout` hover-preview pair) and "Backlinks / outlinks"
 *  (one `li` per `crosslinkBacklinks` + one per `crosslinkOutlinks`, each
 *  carrying `data-source`/`data-target`/`data-scope`). A `null` result or a
 *  `null` currentNodeId → the enumeration is skipped (the backlink list is
 *  empty, never a crash). When `options.hoverPreviewId` resolves to a known
 *  target, the C19 popup subtree is appended ABOVE the link (one popup at a
 *  time — F2); a dangling target authors no popup (F1). */
export function crosslinksContent(
  ctx: PaneContext,
  result: BacklinkResult | null,
  options?: CrosslinksRenderOptions,
): LegacyNodeData {
  // H1 (adversarial): a null ctx or a null/missing ctx.crosslinks must survive →
  // the empty-state sections (the outgoing list shows "(none)"), never a
  // TypeError from `ctx.crosslinks.map`.
  const crosslinks = ctx == null || ctx.crosslinks == null ? [] : ctx.crosslinks
  const outgoingLis: LegacyNodeData[] = crosslinks.map((cl) => ({
    type: 'li',
    props: { 'data-target': cl.targetRagNodeId, 'data-hover-target': cl.targetRagNodeId },
    css: { classes: clickableClasses() },
    content: cl.targetRagNodeId,
    handlers: [
      { name: HOVER_PREVIEW_ENTER_HANDLER, event: 'mouseover', body: HOVER_PREVIEW_ENTER_BODY },
      { name: HOVER_PREVIEW_LEAVE_HANDLER, event: 'mouseout', body: HOVER_PREVIEW_LEAVE_BODY },
    ],
  }))
  const outgoingSection: LegacyNodeData = {
    type: 'section',
    children: [
      { type: 'strong', content: 'Outgoing crosslinks' },
      ...(outgoingLis.length > 0 ? outgoingLis : [{ type: 'p', content: '(none)' }]),
    ],
  }

  // H3 (adversarial): a non-null but PARTIAL result (missing
  // `crosslinkBacklinks`/`crosslinkOutlinks`) must coerce the missing fields to
  // [] — never a TypeError from spreading `undefined`.
  const backEntries = result
    ? [...(result.crosslinkBacklinks ?? []), ...(result.crosslinkOutlinks ?? [])]
    : []
  const backLis: LegacyNodeData[] = backEntries.map((l) => ({
    type: 'li',
    props: { 'data-source': l.source, 'data-target': l.target, 'data-scope': l.scope },
    content: `${l.source} → ${l.target}`,
  }))
  const backSection: LegacyNodeData = {
    type: 'section',
    children: [
      { type: 'strong', content: 'Backlinks / outlinks' },
      ...(backLis.length > 0 ? backLis : [{ type: 'p', content: '(none)' }]),
    ],
  }

  const previewId = options?.hoverPreviewId
  const preview =
    typeof previewId === 'string' && previewId !== ''
      ? resolveHoverPreview(previewId, {
          nodes: ctx?.snapshot?.nodes ?? null,
          docHeads: ctx?.docHeads ?? null,
        })
      : null
  const popup = hoverPreviewPopup(preview, { position: options?.hoverPreviewPosition })

  return { type: 'div', children: [outgoingSection, backSection, ...(popup ? [popup] : [])] }
}

// ===========================================================================
// U-PARITY-C18 (C18/G4) — the advanced-search disclosure sub-pane
// (docs/specs/unit-u-parity-c18-advanced-search.md §2; W1-Q9 RESOLVED).
//
// The `search` pane gains a collapsed-by-default disclosure exposing the full
// `rag.query` argument surface: mode/maxHops/expand/maxParentContext/filters
// (nodeKind/edgeType/target/state)/stores:'all' + the C15-only
// `documentPathPrefix`/`tags` when present. Submitting routes the SAME payload
// as `rag.query` through the shared `window.provident.sidebar.submitAdvancedQuery`
// seam (the SAME `bridge.rag.query` the basic submit uses — MCP/UI equivalence).
// The result detail renders citations/trace/blockedBy/results. PURE.
// ===========================================================================

/** The disclosure toggle handler name. The body is authored INLINE on the
 *  toggle (below) and calls the SAME `window.provident.sidebar.searchAdvancedToggle`
 *  host seam — `provident.dispatch` and a DOM click are equivalent. */
export const ADVANCED_SEARCH_TOGGLE_HANDLER = 'pane-search-advanced-toggle'

/** The advanced-search submit handler name. Its inline body collects the
 *  field values + routes them through the shared
 *  `window.provident.sidebar.submitAdvancedQuery` seam. */
export const ADVANCED_SEARCH_SUBMIT_HANDLER = 'pane-search-advanced-submit'

/** U-SHELL-9a §2.6/§2.9 pin 8 — the pane-first expand-to-tab control: a SECOND
 *  `on:click` control in `searchContent` (distinct from the advanced-search
 *  disclosure toggle) that opens the current query as a full search tab. */
export const SEARCH_EXPAND_TAB_HANDLER = 'pane-search-expand-tab'
export const SEARCH_EXPAND_TAB_ID = 'pane-search-expand-tab'

/** §2.6/HOST-4 — the search-result click handler: opens the result's document
 *  in a NEW `document` tab (the search tab stays) through the host
 *  `openDocumentTab` seam. */
export const SEARCH_RESULT_OPEN_HANDLER = 'pane-search-result-open'

/** §2.6/HOST-5 — the in-tab search body: the query input + the reuse-the-tab
 *  submit control. */
export const SEARCH_TAB_INPUT_ID = 'search-tab-input'
export const SEARCH_TAB_SUBMIT_ID = 'search-tab-submit'
export const SEARCH_TAB_SUBMIT_HANDLER = 'pane-search-tab-submit'

/** The advanced-search authored ids (single source of truth for the render
 *  helpers + the submit body + the tests). */
export const ADVANCED_SEARCH_IDS = {
  toggle: 'advanced-search-toggle',
  fields: 'advanced-search-fields',
  mode: 'advanced-search-mode',
  maxHops: 'advanced-search-max-hops',
  expand: 'advanced-search-expand',
  maxParentContext: 'advanced-search-max-parent-context',
  nodeKind: 'advanced-search-filter-node-kind',
  edgeType: 'advanced-search-filter-edge-type',
  targetDocumentId: 'advanced-search-filter-target-document-id',
  targetNodeId: 'advanced-search-filter-target-node-id',
  state: 'advanced-search-filter-state',
  stores: 'advanced-search-stores',
  documentPathPrefix: 'advanced-search-document-path-prefix',
  tags: 'advanced-search-tags',
  submit: 'advanced-search-submit',
  error: 'advanced-search-error',
  citations: 'advanced-search-citations',
  trace: 'advanced-search-trace',
  blockedBy: 'advanced-search-blocked-by',
} as const

/** The advanced-search disclosure render options. `expanded` is the host's
 *  disclosure state (collapsed by default); `documentFilters` gates the two
 *  C15-only controls (`documentPathPrefix`/`tags`) — false/omitted → a pre-C15
 *  host renders no broken control (F2); `error` surfaces an engine fail-state
 *  inline (F1). */
export interface AdvancedSearchRenderOptions {
  expanded?: boolean
  documentFilters?: boolean
  error?: string | null
}

/** The engine's result-detail fields (Unit X) the search pane renders when
 *  present. ADDITIVE to the `RagQueryResult` IPC shape. */
export interface SearchResultDetail {
  citations?: Array<{ documentId: string; nodeId: string; store?: string }>
  trace?: { mode?: string; engine?: string; topK?: number; source?: string } | unknown[]
  blockedBy?: Array<{ documentId: string; nodeId: string; state: string; store?: string }>
  results?: Array<{ documentId: string; nodeId: string; score: number; snippet?: string; store?: string }>
}

/** The search result the pane renders: the `RagQueryResult` fields (ranked et
 *  al.) + the optional Unit X result-detail fields. */
export type SearchResult = Partial<RagQueryResult> & SearchResultDetail

// The inline disclosure-toggle body (a full function-expression string). It
// routes to the host seam (which flips the state + re-derives). A malformed
// node/bridge is a no-op — never a throw.
const ADVANCED_SEARCH_TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.searchAdvancedToggle !== 'function') return;
  s.searchAdvancedToggle();
}`

// U-SHELL-9a §2.6 — the pane-first expand-to-tab control's inline body. It
// reads the `search` pane's query input and routes it to the host seam, which
// opens the SAME query as a full search tab (a NEW tab — §2.6). A malformed
// node/bridge is a no-op — never a throw.
const SEARCH_EXPAND_TAB_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.expandSearchTab !== 'function') return;
  var el = document.getElementById('pane-search-input');
  s.expandSearchTab(el && el.value != null ? String(el.value) : '');
}`

// HOST-4 — a result click routes the result's `data-document-id` to the host
// `openDocumentTab` seam (a NEW `document` tab; the search tab stays). A
// malformed node/bridge is a no-op.
const SEARCH_RESULT_OPEN_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.openDocumentTab !== 'function') return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (id) s.openDocumentTab(String(id));
}`

// HOST-5 — an in-tab query edit routes through the host `searchTabQuery` seam,
// which REUSES the tab's own entry (`setSearchParams`) rather than opening a
// new tab. The tab id travels on the button's `data-tab-id`; the query is read
// from the in-tab input.
const SEARCH_TAB_SUBMIT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.searchTabQuery !== 'function') return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-tab-id'];
  var el = document.getElementById(${JSON.stringify(SEARCH_TAB_INPUT_ID)});
  var q = el && el.value != null ? String(el.value) : '';
  if (id) s.searchTabQuery(String(id), q);
}`

// The inline submit body (a full function-expression string). It reads the
// query input + every advanced control from the DOM (the UI path — the typed
// values live in the DOM), builds the SAME `rag.query` payload shape the MCP
// tool accepts, and routes it through the shared host seam. Empty/absent
// fields are OMITTED (never junk); a partial target is dropped. `id`-only
// bindings come from `ADVANCED_SEARCH_IDS` so the body can never drift.
const ADVANCED_SEARCH_SUBMIT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.submitAdvancedQuery !== 'function') return;
  function val(id) { var el = document.getElementById(id); return el && el.value != null ? String(el.value) : ''; }
  var query = val('pane-search-input');
  var opts = {};
  var mode = val(${JSON.stringify(ADVANCED_SEARCH_IDS.mode)});
  if (mode === 'flat' || mode === 'graph') opts.mode = mode;
  var expand = val(${JSON.stringify(ADVANCED_SEARCH_IDS.expand)});
  if (expand === 'none' || expand === 'parent') opts.expand = expand;
  var stores = val(${JSON.stringify(ADVANCED_SEARCH_IDS.stores)});
  if (stores === 'all') opts.stores = 'all';
  var mh = val(${JSON.stringify(ADVANCED_SEARCH_IDS.maxHops)});
  if (mh !== '') { var n = Number(mh); if (isFinite(n)) opts.maxHops = n; }
  var mp = val(${JSON.stringify(ADVANCED_SEARCH_IDS.maxParentContext)});
  if (mp !== '') { var p = Number(mp); if (isFinite(p)) opts.maxParentContext = p; }
  var f = {};
  var nodeKind = val(${JSON.stringify(ADVANCED_SEARCH_IDS.nodeKind)});
  if (nodeKind) f.nodeKind = nodeKind;
  var edgeType = val(${JSON.stringify(ADVANCED_SEARCH_IDS.edgeType)});
  if (edgeType) f.edgeType = edgeType;
  var state = val(${JSON.stringify(ADVANCED_SEARCH_IDS.state)});
  if (state) f.state = state;
  var docId = val(${JSON.stringify(ADVANCED_SEARCH_IDS.targetDocumentId)});
  var nodeId = val(${JSON.stringify(ADVANCED_SEARCH_IDS.targetNodeId)});
  if (docId && nodeId) f.target = { documentId: docId, nodeId: nodeId };
  var dp = val(${JSON.stringify(ADVANCED_SEARCH_IDS.documentPathPrefix)});
  if (dp) f.documentPathPrefix = dp.split('/').filter(Boolean);
  var tags = val(${JSON.stringify(ADVANCED_SEARCH_IDS.tags)});
  if (tags) f.tags = tags.split(',').map(function (t) { return t.trim(); }).filter(Boolean);
  if (Object.keys(f).length > 0) opts.filters = f;
  s.submitAdvancedQuery(query, opts);
}`

/** A labelled `select` control. PURE. */
function advancedSelect(
  id: string,
  label: string,
  options: Array<{ value: string; label: string }>,
): LegacyNodeData {
  return {
    type: 'label',
    content: label,
    children: [
      {
        type: 'select',
        props: { id },
        children: options.map((o) => ({ type: 'option', props: { value: o.value }, content: o.label })),
      },
    ],
  }
}

/** A labelled `input` control. PURE. */
function advancedInput(id: string, label: string, type: string, extra: Record<string, unknown> = {}): LegacyNodeData {
  return {
    type: 'label',
    content: label,
    children: [{ type: 'input', props: { id, type, ...extra } }],
  }
}

/** The advanced-search fieldset. The two C15-only controls render only when
 *  `documentFilters` is true (F2 — a pre-C15 host omits them, never breaks). */
function advancedSearchFields(documentFilters: boolean): LegacyNodeData {
  return {
    type: 'fieldset',
    props: { id: ADVANCED_SEARCH_IDS.fields },
    children: [
      advancedSelect(ADVANCED_SEARCH_IDS.mode, 'Mode', [
        { value: '', label: '(default)' },
        { value: 'flat', label: 'flat' },
        { value: 'graph', label: 'graph' },
      ]),
      advancedInput(ADVANCED_SEARCH_IDS.maxHops, 'Max hops', 'number', { min: '1', max: '5' }),
      advancedSelect(ADVANCED_SEARCH_IDS.expand, 'Expand', [
        { value: '', label: '(default)' },
        { value: 'none', label: 'none' },
        { value: 'parent', label: 'parent' },
      ]),
      advancedInput(ADVANCED_SEARCH_IDS.maxParentContext, 'Max parent context', 'number', { min: '1' }),
      advancedSelect(ADVANCED_SEARCH_IDS.nodeKind, 'Filter: node kind', [
        { value: '', label: '(any)' },
        { value: 'content', label: 'content' },
        { value: 'fact', label: 'fact' },
        { value: 'reference', label: 'reference' },
      ]),
      advancedSelect(ADVANCED_SEARCH_IDS.edgeType, 'Filter: edge type', [
        { value: '', label: '(any)' },
        { value: 'link', label: 'link' },
        { value: 'embed', label: 'embed' },
      ]),
      advancedInput(ADVANCED_SEARCH_IDS.targetDocumentId, 'Filter: target document id', 'text'),
      advancedInput(ADVANCED_SEARCH_IDS.targetNodeId, 'Filter: target node id', 'text'),
      advancedSelect(ADVANCED_SEARCH_IDS.state, 'Filter: state', [
        { value: '', label: '(any)' },
        { value: 'FRESH', label: 'FRESH' },
        { value: 'RESOLVED', label: 'RESOLVED' },
        { value: 'STALE', label: 'STALE' },
        { value: 'BROKEN', label: 'BROKEN' },
      ]),
      advancedSelect(ADVANCED_SEARCH_IDS.stores, 'Stores', [
        { value: '', label: '(default store)' },
        { value: 'all', label: 'all (fan-out)' },
      ]),
      ...(documentFilters
        ? [
            advancedInput(ADVANCED_SEARCH_IDS.documentPathPrefix, 'Filter: document path prefix', 'text'),
            advancedInput(ADVANCED_SEARCH_IDS.tags, 'Filter: tags (comma-separated)', 'text'),
          ]
        : []),
      {
        type: 'button',
        props: { id: ADVANCED_SEARCH_IDS.submit },
        css: { classes: clickableClasses() },
        content: 'Run advanced search',
        handlers: [{ name: ADVANCED_SEARCH_SUBMIT_HANDLER, event: 'click', body: ADVANCED_SEARCH_SUBMIT_BODY }],
      },
    ],
  }
}

/** The `search` pane content (U-PARITY-C18): the text `input`
 *  (`props.id = 'pane-search-input'`) + the advanced-search disclosure sub-pane
 *  (collapsed by default; `options.expanded` reveals the W1-Q9 fields) + the
 *  result detail. The detail renders the `results`/`ranked` list + (when
 *  present) `citations`/`trace`/`blockedBy`; an engine error
 *  (`options.error`) renders inline (F1); an empty result renders the empty
 *  state (F3). A `null` result → the input + the disclosure + the empty state
 *  (never a throw). */
export function searchContent(
  ctx: PaneContext,
  result: SearchResult | null,
  options?: AdvancedSearchRenderOptions,
): LegacyNodeData {
  const expanded = options?.expanded === true
  const input: LegacyNodeData = { type: 'input', props: { id: 'pane-search-input' } }
  const toggle: LegacyNodeData = {
    type: 'button',
    props: { id: ADVANCED_SEARCH_IDS.toggle, 'data-expanded': expanded ? 'true' : 'false' },
    css: { classes: clickableClasses() },
    content: expanded ? 'Hide advanced search' : 'Advanced search',
    handlers: [{ name: ADVANCED_SEARCH_TOGGLE_HANDLER, event: 'click', body: ADVANCED_SEARCH_TOGGLE_BODY }],
  }
  const advanced: LegacyNodeData[] = expanded ? [advancedSearchFields(options?.documentFilters === true)] : []
  // §2.6 — the pane-first expand-to-tab control (a second `on:click` control,
  // distinct from the disclosure toggle; §2.9 pin 8).
  const expandTab: LegacyNodeData = {
    type: 'button',
    props: { id: SEARCH_EXPAND_TAB_ID },
    css: { classes: clickableClasses() },
    content: 'Open in a tab',
    handlers: [{ name: SEARCH_EXPAND_TAB_HANDLER, event: 'click', body: SEARCH_EXPAND_TAB_BODY }],
  }

  // ---- result detail ----
  // Prefer the engine's `results` (documentId/nodeId/snippet); fall back to the
  // local `ranked` list. Both keep the top-level `li` + `data-node-id` shape.
  const children: LegacyNodeData[] = [input, toggle, expandTab, ...advanced]
  const resultItems: unknown[] = (result?.results ?? result?.ranked ?? []) as unknown[]
  const lis: LegacyNodeData[] = resultItems.map((raw) => {
    const r = raw as { documentId?: string; nodeId?: string; score?: unknown; snippet?: string }
    if (r.documentId !== undefined) {
      return {
        type: 'li',
        props: { 'data-document-id': r.documentId, 'data-node-id': r.nodeId ?? '', 'data-score': String(r.score) },
        css: { classes: clickableClasses() },
        // §2.6/HOST-4 — a result click opens the document in a NEW tab.
        handlers: [{ name: SEARCH_RESULT_OPEN_HANDLER, event: 'click', body: SEARCH_RESULT_OPEN_BODY }],
        content: `${r.documentId}/${r.nodeId ?? ''} — ${String(r.score)} — ${String(r.snippet ?? '')}`,
      }
    }
    return { type: 'li', props: { 'data-node-id': r.nodeId ?? '' }, content: `${r.nodeId ?? ''} — ${String(r.score)}` }
  })
  if (lis.length === 0) {
    children.push({ type: 'p', props: { 'data-empty': 'true' }, content: '(no results)' })
  } else {
    children.push(...lis)
  }

  const citations = result?.citations ?? []
  if (citations.length > 0) {
    children.push({ type: 'strong', content: 'Citations' })
    children.push({
      type: 'ul',
      props: { id: ADVANCED_SEARCH_IDS.citations },
      children: citations.map((c) => ({
        type: 'li',
        props: { 'data-document-id': c.documentId, 'data-node-id': c.nodeId },
        content: `${c.documentId}:${c.nodeId}`,
      })),
    })
  }

  const trace = result?.trace
  if (trace !== undefined && trace !== null) {
    if (Array.isArray(trace)) {
      children.push({ type: 'strong', content: 'Trace' })
      children.push({
        type: 'ul',
        props: { id: ADVANCED_SEARCH_IDS.trace },
        children: trace.map((t) => {
          const e = t as { from?: { documentId?: string; nodeId?: string }; to?: { documentId?: string; nodeId?: string }; edge?: string; state?: string }
          return {
            type: 'li',
            props: { 'data-edge': e.edge ?? '', 'data-state': e.state ?? '' },
            content: `${e.from?.documentId ?? ''}:${e.from?.nodeId ?? ''} → ${e.to?.documentId ?? ''}:${e.to?.nodeId ?? ''} (${e.edge ?? ''})`,
          }
        }),
      })
    } else {
      const t = trace as { mode?: string }
      children.push({
        type: 'p',
        props: { id: ADVANCED_SEARCH_IDS.trace, 'data-trace-mode': t.mode ?? 'flat' },
        content: `Trace mode: ${t.mode ?? 'flat'}`,
      })
    }
  }

  const blockedBy = result?.blockedBy ?? []
  if (blockedBy.length > 0) {
    children.push({ type: 'strong', content: 'Blocked by' })
    children.push({
      type: 'ul',
      props: { id: ADVANCED_SEARCH_IDS.blockedBy },
      children: blockedBy.map((b) => ({
        type: 'li',
        props: { 'data-document-id': b.documentId, 'data-node-id': b.nodeId, 'data-state': b.state },
        content: `Blocked by ${b.documentId}:${b.nodeId} (${b.state})`,
      })),
    })
  }

  const error = options?.error
  if (error != null && error !== '') {
    children.push({ type: 'p', props: { id: ADVANCED_SEARCH_IDS.error }, content: String(error) })
  }

  return { type: 'div', children }
}

// ===========================================================================
// U-SHELL-9a §2.3/§2.6 (HOST-1/HOST-5) — the active-tab stage bodies. The
// `mountTab` host seam renders exactly ONE of these into the central stage:
// the landing/wikis listing (`other:landing`), the search-tab body (query input
// + derived results), or the parked placeholder. Document targets reuse the
// existing scoped single-document render. PURE.
// ===========================================================================

/** HOST-1 — the landing/wikis listing body (`other:landing`). Lists the
 *  configured stores when present, else the document titles, degrading to
 *  "Getting started" when neither exists. PURE. */
export function landingContent(input?: {
  documents?: Array<{ documentId: string; title?: string }>
  stores?: Array<{ name: string }>
}): LegacyNodeData {
  const stores = input?.stores ?? []
  const documents = input?.documents ?? []
  const items: LegacyNodeData[] =
    stores.length > 0
      ? stores.map((s) => ({ type: 'li', props: { 'data-store-name': s.name }, content: s.name }))
      : documents.map((d) => ({
          type: 'li',
          props: { 'data-document-id': d.documentId },
          content: d.title ?? d.documentId,
        }))
  return {
    type: 'div',
    props: { id: 'stage-landing', 'data-stage': 'landing' },
    children: [
      { type: 'h2', content: stores.length > 0 ? 'Available wikis' : 'Getting started' },
      ...(items.length > 0
        ? [{ type: 'ul', children: items } as LegacyNodeData]
        : [{ type: 'p', content: 'No documents yet.' } as LegacyNodeData]),
    ],
  }
}

/** HOST-5 — the search-tab body. Renders the tab's OWN stored query plus its
 *  derived results; the submit control routes an in-tab edit through the host
 *  `searchTabQuery` seam, which reuses this same tab (`setSearchParams`). PURE. */
export function searchTabContent(
  entry: { id: string; search?: { query?: string } },
  opts?: { results?: unknown[]; error?: string | null },
): LegacyNodeData {
  const query = entry.search?.query ?? ''
  const resultItems = opts?.results ?? []
  const lis: LegacyNodeData[] = resultItems.map((raw) => {
    const r = raw as { documentId?: string; nodeId?: string; score?: unknown; snippet?: string }
    return {
      type: 'li',
      props: { 'data-document-id': r.documentId ?? '', 'data-node-id': r.nodeId ?? '' },
      css: { classes: clickableClasses() },
      handlers: [{ name: SEARCH_RESULT_OPEN_HANDLER, event: 'click', body: SEARCH_RESULT_OPEN_BODY }],
      content: r.documentId !== undefined ? `${r.documentId}/${r.nodeId ?? ''}` : `${r.nodeId ?? ''}`,
    }
  })
  const children: LegacyNodeData[] = [
    { type: 'h2', content: 'Search results' },
    { type: 'input', props: { id: SEARCH_TAB_INPUT_ID, value: query } },
    {
      type: 'button',
      props: { id: SEARCH_TAB_SUBMIT_ID, 'data-tab-id': entry.id },
      css: { classes: clickableClasses() },
      content: 'Search',
      handlers: [{ name: SEARCH_TAB_SUBMIT_HANDLER, event: 'click', body: SEARCH_TAB_SUBMIT_BODY }],
    },
  ]
  if (lis.length === 0) {
    children.push({ type: 'p', props: { 'data-empty': 'true' }, content: '(no results)' })
  } else {
    children.push(...lis)
  }
  if (opts?.error != null && opts.error !== '') {
    children.push({ type: 'p', props: { id: 'stage-search-error' }, content: String(opts.error) })
  }
  return { type: 'div', props: { id: 'stage-search-tab', 'data-stage': 'search', 'data-tab-id': entry.id }, children }
}

// ===========================================================================
// Unit U-EDIT-1 (C8) — the central-stage editor-toolbar markdown/html toggle
// (docs/specs/unit-u-edit-1-markdown-html-toggle.md §2). The control is
// APP-GRAPH authored (MCP-visible) — unlike the OPERATOR-scoped settings
// button. It reflects the CURRENT `editingMode` (`data-mode`/label) and its
// `on:click` handler (registered in the host) FLIPS the mode through the
// existing operator-settings seam. PURE.
// ===========================================================================

/** The app-graph editor-toolbar css/props ids + the registered toggle handler
 *  name (the host registers the body via `registerHandlerDef`). */
export const EDITOR_TOOLBAR_ID = 'editor-toolbar'
export const EDITOR_TOOLBAR_TOGGLE_ID = 'editor-toolbar-toggle'
export const EDITOR_TOOLBAR_TOGGLE_HANDLER = 'editor-toolbar-editing-mode-toggle'

/** Unit U-EDIT-2 (C16) §2.1 — the Undo/Redo control ids + handler names. These
 *  are APP-GRAPH provident nodes authored with INLINE bodies (the `docNavContent`
 *  folder-toggle convention), so `provident.dispatch` and a DOM click reach the
 *  SAME `window.provident.sidebar.historyUndo`/`historyRedo` host seam. */
export const EDITOR_TOOLBAR_UNDO_ID = 'editor-toolbar-undo'
export const EDITOR_TOOLBAR_REDO_ID = 'editor-toolbar-redo'
export const EDITOR_TOOLBAR_UNDO_HANDLER = 'editor-toolbar-undo'
export const EDITOR_TOOLBAR_REDO_HANDLER = 'editor-toolbar-redo'

/** Unit U-EDIT-2 (C16) §2.2 — the history sub-pane root id + the entry-click
 *  handler name + the entry id prefix. */
export const HISTORY_PANE_ID = 'pane-history'
export const HISTORY_ENTRY_HANDLER = 'pane-history-entry'
export const HISTORY_ENTRY_ID_PREFIX = 'pane-history-entry-'

/** §2.1 — the inline Undo body. Routes to the project-journal seam; a missing
 *  bridge method is a no-op (never a throw). */
const EDITOR_TOOLBAR_UNDO_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.historyUndo !== 'function') return;
  s.historyUndo();
}`

/** §2.1 — the inline Redo body. */
const EDITOR_TOOLBAR_REDO_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.historyRedo !== 'function') return;
  s.historyRedo();
}`

/** §2.2 — the inline history-entry body. Reads the entry's authored
 *  `data-history-index` and routes it to the host's click-to-undo-to-point
 *  seam; a malformed/missing index is a no-op (never a throw — F8). */
const HISTORY_ENTRY_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.historyEntryClick !== 'function') return;
  var idx = ctx && ctx.node && ctx.node.props && ctx.node.props['data-history-index'];
  if (idx === undefined || idx === null || idx === '') return;
  s.historyEntryClick(idx);
}`

/** The `editingMode` → representation label (W1-Q6: Markdown↔textarea,
 *  HTML↔contenteditable). PURE + TOTAL (junk coerces to the contenteditable
 *  default, mirroring the host/store coercion). */
export function editingModeLabel(editingMode: EditingMode): 'Markdown' | 'HTML' {
  return editingMode === 'textarea' ? 'Markdown' : 'HTML'
}

/** The central-stage editor toolbar content (app-graph). A `div` toolbar
 *  carrying a mode readout (`editor-toolbar-mode`) + the C16 Undo/Redo controls
 *  (`editor-toolbar-undo`/`editor-toolbar-redo`, disabled from the project-journal
 *  `undoDepth`/`redoDepth`) + a `button` (`editor-toolbar-toggle`) whose
 *  `data-mode` reflects the CURRENT mode and whose click handler flips it. The
 *  appended `data-target-mode` documents the flip for agents. `replay` is NOT
 *  offered (§2.2). PURE. */
export function editorToolbarContent(editingMode: EditingMode, zone = 'main', journal?: RagJournalPayload | null): LegacyNodeData {
  const current: EditingMode = editingMode === 'textarea' ? 'textarea' : 'contenteditable'
  const label = editingModeLabel(current)
  const next: EditingMode = current === 'contenteditable' ? 'textarea' : 'contenteditable'
  const undoDepth = journal != null && typeof journal.undoDepth === 'number' ? journal.undoDepth : 0
  const redoDepth = journal != null && typeof journal.redoDepth === 'number' ? journal.redoDepth : 0
  return {
    type: 'div',
    props: { id: EDITOR_TOOLBAR_ID, 'data-mode': current, 'data-role': 'editor-toolbar' },
    placement: { targetPlacement: [zone] },
    children: [
      { type: 'span', props: { id: 'editor-toolbar-mode' }, content: `Editing: ${label}` },
      {
        type: 'button',
        props: { id: EDITOR_TOOLBAR_UNDO_ID, 'data-role': 'history-undo', disabled: undoDepth <= 0 },
        css: { classes: clickableClasses() },
        content: 'Undo',
        handlers: [{ name: EDITOR_TOOLBAR_UNDO_HANDLER, event: 'click', body: EDITOR_TOOLBAR_UNDO_BODY }],
      },
      {
        type: 'button',
        props: { id: EDITOR_TOOLBAR_REDO_ID, 'data-role': 'history-redo', disabled: redoDepth <= 0 },
        css: { classes: clickableClasses() },
        content: 'Redo',
        handlers: [{ name: EDITOR_TOOLBAR_REDO_HANDLER, event: 'click', body: EDITOR_TOOLBAR_REDO_BODY }],
      },
      {
        type: 'button',
        props: { id: EDITOR_TOOLBAR_TOGGLE_ID, 'data-mode': current, 'data-target-mode': next },
        css: { classes: clickableClasses() },
        content: label,
        handlers: [{ name: EDITOR_TOOLBAR_TOGGLE_HANDLER, event: 'click' }],
      },
    ],
  }
}

/** Unit U-EDIT-2 (C16) §2.2/§2.5 — the interactive history sub-pane content
 *  (app-graph + MCP-visible). Lists the SANITIZED project-journal entries in
 *  order; each `li` carries `data-history-index` and a `pane-history-entry`
 *  on:click handler (click-to-undo-to-point). The entry at `cursor - 1` is
 *  marked `data-current`; entries at/after `cursor` are marked `data-redo`.
 *  PURE + TOTAL: a null payload / malformed entry renders the kind/index
 *  fallback and never throws (F6); an empty journal → `(no history)`. */
export function historyPaneContent(payload: RagJournalPayload | null, zone = 'main'): LegacyNodeData {
  const raw = payload != null && Array.isArray((payload as { entries?: unknown }).entries)
    ? (payload as { entries: unknown[] }).entries
    : []
  const cursor = payload != null && typeof payload.cursor === 'number' && Number.isFinite(payload.cursor) ? payload.cursor : 0
  const entries: LegacyNodeData[] = raw.map((item, i) => {
    const e = item != null && typeof item === 'object' ? (item as { index?: unknown; kind?: unknown; at?: unknown }) : {}
    const index = typeof e.index === 'number' && Number.isFinite(e.index) ? e.index : i
    const kind = typeof e.kind === 'string' && e.kind !== '' ? e.kind : 'content'
    const at = typeof e.at === 'string' ? e.at : ''
    return {
      type: 'li',
      props: {
        id: `${HISTORY_ENTRY_ID_PREFIX}${index}`,
        'data-history-index': String(index),
        'data-history-kind': kind,
        'data-at': at,
        ...(index >= cursor ? { 'data-redo': 'true' } : {}),
        ...(index === cursor - 1 ? { 'data-current': 'true' } : {}),
      },
      css: { classes: clickableClasses() },
      content: `${kind} #${index}`,
      handlers: [{ name: HISTORY_ENTRY_HANDLER, event: 'click', body: HISTORY_ENTRY_BODY }],
    }
  })
  return {
    type: 'div',
    props: {
      id: HISTORY_PANE_ID,
      'data-role': 'history',
      ...(entries.length === 0 ? { 'data-empty': 'true' } : {}),
    },
    placement: { targetPlacement: [zone] },
    children: [
      { type: 'strong', content: 'History' },
      ...(entries.length === 0
        ? [{ type: 'p', content: '(no history)' } as LegacyNodeData]
        : [{ type: 'ul', children: entries } as LegacyNodeData]),
    ],
  }
}

// ===========================================================================
// Unit GN-MCP-UI §5.5 — the D4 parity GUI render helpers (PURE, provident-
// authored LegacyNodeData). The `gnosis-query` app-graph pane + the `gnosis-status`
// operator pane both render through these; neither ever references the local
// `RagResult` fields (ranked/context/markdown/lineMap/k).
// ===========================================================================

/** The `gnosis-status` operator pane content: renders the engine `HealthReport`
 *  (state/version/subsystems/lastError). A null report → the unavailable state
 *  (D2 engine-absent), never a TypeError. PURE. */
export function gnosisStatusContent(ctx: PaneContext, report: HealthReport | null): LegacyNodeData {
  if (report == null) {
    return {
      type: 'div',
      props: { 'data-gnosis-pane': 'status', 'data-gnosis-state': 'unavailable' },
      children: [
        { type: 'strong', content: 'Gnosis engine' },
        { type: 'p', content: 'Engine unavailable — not connected or absent' },
      ],
    }
  }
  const subsystemLis: LegacyNodeData[] = Object.entries(report.subsystems ?? {}).map(([name, ok]) => ({
    type: 'li',
    props: { 'data-subsystem': name, 'data-ok': ok ? 'true' : 'false' },
    content: `${name}: ${ok ? 'up' : 'down'}`,
  }))
  return {
    type: 'div',
    props: { 'data-gnosis-pane': 'status', 'data-gnosis-state': report.state, 'data-engine-version': report.version },
    children: [
      { type: 'strong', content: 'Gnosis engine' },
      { type: 'p', content: `State: ${report.state}` },
      { type: 'p', content: `Version: ${report.version}` },
      { type: 'ul', children: subsystemLis },
      { type: 'p', content: `lastError: ${report.lastError ?? 'null'}` },
    ],
  }
}

/** The `gnosis-query` app-graph pane content: renders the proxy-specific
 *  `EngineRagResult` (query/results/citations/trace mode/blockedBy). DISTINCT
 *  from `searchContent` (which renders the local `RagQueryResult`). A null
 *  result → the empty state, never a TypeError. PURE. */
export function gnosisQueryContent(ctx: PaneContext, result: EngineRagResult | null): LegacyNodeData {
  if (result == null) {
    return {
      type: 'div',
      props: { 'data-gnosis-pane': 'query', 'data-gnosis-query': '' },
      children: [{ type: 'p', content: '(no engine results)' }],
    }
  }
  const resultLis: LegacyNodeData[] = (result.results ?? []).map((r) => ({
    type: 'li',
    props: {
      'data-document-id': r.documentId,
      'data-node-id': r.nodeId,
      'data-score': String(r.score),
      ...(r.stale !== undefined ? { 'data-stale': r.stale ? 'true' : 'false' } : {}),
    },
    content: `${r.documentId}/${r.nodeId} — score ${String(r.score)} — ${String(r.snippet ?? '')}`,
  }))
  const citationLis: LegacyNodeData[] = (result.citations ?? []).map((c) => ({
    type: 'li',
    props: { 'data-document-id': c.documentId, 'data-node-id': c.nodeId },
    content: `${c.documentId}:${c.nodeId}`,
  }))
  const blockedByLis: LegacyNodeData[] = (result.blockedBy ?? []).map((b) => ({
    type: 'li',
    props: { 'data-document-id': b.documentId, 'data-node-id': b.nodeId, 'data-state': b.state },
    content: `Blocked by ${b.documentId}:${b.nodeId} (${b.state})`,
  }))
  return {
    type: 'div',
    props: {
      'data-gnosis-pane': 'query',
      'data-gnosis-query': result.query,
      'data-engine': result.engine ?? 'gnosis',
      'data-trace-mode': result.trace.mode ?? 'flat',
    },
    children: [
      { type: 'strong', content: `Query: ${result.query}` },
      { type: 'ul', children: resultLis },
      { type: 'strong', content: 'Citations' },
      { type: 'ul', children: citationLis },
      { type: 'p', content: `Trace mode: ${result.trace.mode ?? 'flat'}` },
      ...(blockedByLis.length > 0
        ? [{ type: 'strong' as const, content: 'Blocked by' }, { type: 'ul' as const, children: blockedByLis }]
        : []),
    ],
  }
}

/** Unit GN-MCP-UI §5.6 — the status-pane HANDLER: awaits the `getEngineStatus`
 *  bridge; on success renders `gnosisStatusContent(ctx, report)`; on a REJECTED
 *  bridge (the D2 engine-absent `EngineUnavailable`) renders the UNAVAILABLE
 *  state (`gnosisStatusContent(ctx, null)`) — the handler NEVER throws on an
 *  engine rejection (§5.6: the bridge rejection is caught → unavailable, never
 *  a crash). Exported here (the render-helpers module) so the pane host + the
 *  D2 parity tests share it. */
export async function gnosisStatusPaneHandler(
  ctx: PaneContext,
  bridge: () => Promise<HealthReport>,
): Promise<LegacyNodeData> {
  try {
    const report = await bridge()
    return gnosisStatusContent(ctx, report)
  } catch {
    // §5.6 — the engine is absent / the bridge rejected (EngineUnavailable):
    // the pure helper's unavailable state, never a throw.
    return gnosisStatusContent(ctx, null)
  }
}

// ===========================================================================
// Unit A2 §5.5 — the D4-parity document-editor/wiki GUI render helpers (PURE,
// provident-authored LegacyNodeData). The `gnosis-documents`/`gnosis-wikis`
// app-graph panes render through these over the typed Document/DocumentList/Wiki
// shapes (DISTINCT from the local `RagResult` render path). A null result → the
// empty/unavailable state (never a TypeError). H1: these screens are the
// document surface over the engine — they NEVER fall back to the local
// `createJsonRagStore`.
//
// H-1 (adversarial — the D4-parity gap): the list items are rendered WITH the
// `handlers` field bound so a user can CLICK a wiki/document list item to select
// it. The render helpers are PURE and their signatures are spec-pinned to
// `(ctx, state)` — they CANNOT receive the handler bodies as args — so the
// select-handler body strings are hardcoded HERE as module constants (the
// provident-ssr `handlers` field carries the body inline; translate.js
// instantiates a string body via `new Function`). The mutating editor controls
// (create/update/delete/publish/unpublish/archive) are bound in the HOST
// (`GnosisCrudPanes.documentsContent`/`wikisContent`), which wraps this PURE
// output with the interactive controls carrying the host's body strings.
// ===========================================================================

/** H-1 — the wiki-select handler body (a wiki list item click → list the wiki's
 *  documents). Hardcoded here (the PURE helper cannot receive it as an arg). */
const GNOSIS_DOCUMENTS_SELECT_WIKI_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var wikiId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-wiki-id'];
  if (wikiId) s.gnosisDocuments('gnosis.document.list', { wikiId: wikiId });
}`
/** H-1 — the document-select handler body (a document list item click → get the
 *  document). Hardcoded here (the PURE helper cannot receive it as an arg). */
const GNOSIS_DOCUMENTS_SELECT_DOC_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.get', { documentId: documentId });
}`
/** H-1 — the wiki-select handler body (a wiki list item click → get the wiki).
 *  Hardcoded here (the PURE helper cannot receive it as an arg). */
const GNOSIS_WIKIS_SELECT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var wikiId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-wiki-id'];
  if (wikiId) s.gnosisWikis('gnosis.wiki.get', { wikiId: wikiId });
}`

/** Unit A2 §5.5 — the gnosis-documents pane content: renders the document
 *  surface (wiki selector + document list + document editor) over the typed
 *  Document/DocumentList/Wiki shapes. A null result → the empty state (never a
 *  TypeError). A `conflict` set → the conflict state (the optimistic-concurrency
 *  409 UX, H2 — the conflict message + the current revision). PURE. */
export function gnosisDocumentsContent(
  ctx: PaneContext,
  state: {
    wikis: Wiki[] | null
    documents: DocumentList | null
    document: Document | null
    conflict: ConflictError | null
  },
): LegacyNodeData {
  // H2 — the optimistic-concurrency 409 UX: a ConflictError renders the conflict
  // state (the conflict message + the current revision), never a crash. Checked
  // BEFORE the null/unavailable state so a conflict surfaces even when the
  // cached list is null (a re-read prompt).
  if (state != null && state.conflict != null) {
    return {
      type: 'div',
      props: { 'data-gnosis-pane': 'documents', 'data-gnosis-state': 'conflict' },
      children: [
        { type: 'strong', content: 'Document conflict (409)' },
        { type: 'p', content: `Conflict: ${state.conflict.message}` },
        { type: 'p', content: 'Re-read the document and re-apply your changes against the current revision.' },
      ],
    }
  }
  // H1 (adversarial) + HOST-GUI-DOCS-PANE-DEADLOCK (re-derived 2026-09-11): a
  // null state (or a null wikis) → the whole-pane unavailable/engine-absent
  // state, never a TypeError. This is checked BEFORE the wiki selector so the
  // no-wikis/engine-absent case keeps its pinned message, but is INDEPENDENT of
  // `documents` — a null `documents` with a present `wikis` is NOT the
  // engine-absent case (it is the empty doc-list state, below).
  if (state == null || state.wikis == null) {
    return {
      type: 'div',
      props: { 'data-gnosis-pane': 'documents', 'data-gnosis-state': 'unavailable' },
      children: [
        { type: 'strong', content: 'Gnosis documents' },
        { type: 'p', content: 'Documents unavailable — engine not connected or absent' },
      ],
    }
  }
  // HARDENING (adversarial — P-IM-4 "NEVER a TypeError"): a non-array `wikis`
  // (a malformed bridge payload — a string/object/number) must coerce to [] →
  // the empty-wiki-selector path (the "No wikis" placeholder), never a native
  // TypeError from `.map`. Only a literal `null` wikis is the engine-absent case
  // (kept unchanged above).
  const wikis = Array.isArray(state.wikis) ? state.wikis : []
  // H-1 — the wiki/document list items carry the `handlers` field so a user can
  // CLICK an item to select it (the select handler bodies are hardcoded above —
  // the PURE helper cannot receive them as args). The `data-wiki-id`/
  // `data-document-id`/`data-revision` props feed the handler bodies.
  const wikiLis: LegacyNodeData[] = wikis.map((w) => ({
    type: 'li',
    props: { 'data-wiki-id': w.wikiId },
    css: { classes: clickableClasses() },
    content: w.name,
    handlers: [{ name: 'gnosis-documents-select-wiki', event: 'click', body: GNOSIS_DOCUMENTS_SELECT_WIKI_BODY }],
  }))
  // The wiki selector list renders ALWAYS (independent of `documents`/`document`),
  // so the clickable <li> items that trigger gnosis.document.list are never
  // gated behind a non-null `documents` (deadlock fix). When `wikis` is an empty
  // list (still non-null — the engine is present), render a wiki-selector
  // placeholder <li> carrying the same `data-wiki-id` + select handler shape so
  // the selector surface is always present (P-IM-4: "wiki selector present
  // whenever `state.wikis != null`").
  if (wikiLis.length === 0) {
    wikiLis.push({
      type: 'li',
      props: { 'data-wiki-id': '' },
      css: { classes: clickableClasses() },
      content: 'No wikis',
      handlers: [{ name: 'gnosis-documents-select-wiki', event: 'click', body: GNOSIS_DOCUMENTS_SELECT_WIKI_BODY }],
    })
  }
  const children: LegacyNodeData[] = [
    { type: 'strong', content: 'Wikis' },
    { type: 'ul', children: wikiLis },
  ]
  // The Documents section: when `documents` is null OR its.items is empty → the
  // empty doc-list state (data-gnosis-docstate="empty"); otherwise the populated
  // doc <ul> + the document-editor fields when `document` is present. Never
  // dereference `.items`/`.map` on a null `documents`; never throw.
  // HARDENING (adversarial — P-IM-4 "NEVER a TypeError"): a non-array
  // `documents` or a non-array `.items` (a malformed bridge payload —
  // `{}`/`{items:null}`/`{items:{}}`/`{items:5}`) must coerce to [] → the empty
  // doc-list state (data-gnosis-docstate="empty"), NEVER `.length`/`.map` on a
  // non-array. Guard with `Array.isArray` before any deref.
  const docItems =
    state.documents != null && Array.isArray(state.documents.items) ? (state.documents.items as Document[]) : []
  if (docItems.length === 0) {
    children.push({
      type: 'div',
      props: { 'data-gnosis-docstate': 'empty' },
      children: [
        { type: 'strong', content: 'Documents' },
        { type: 'p', content: 'No documents — select a wiki' },
      ],
    })
  } else {
    const docLis: LegacyNodeData[] = docItems.map((d) => ({
      type: 'li',
      props: { 'data-document-id': d.documentId, 'data-revision': String(d.revision ?? 0) },
      css: { classes: clickableClasses() },
      content: `${d.title ?? ''} (${d.state ?? ''})`,
      handlers: [{ name: 'gnosis-documents-select-doc', event: 'click', body: GNOSIS_DOCUMENTS_SELECT_DOC_BODY }],
    }))
    children.push(
      { type: 'strong', content: 'Documents' },
      { type: 'ul', children: docLis },
    )
    const doc = state.document
    if (doc) {
      children.push(
        { type: 'strong' as const, content: `Document: ${doc.title}` },
        { type: 'p' as const, content: `Revision: ${doc.revision} — state: ${doc.state}` },
      )
    }
  }
  return {
    type: 'div',
    props: { 'data-gnosis-pane': 'documents' },
    children,
  }
}

/** Unit A2 §5.5 — the gnosis-wikis pane content: renders the wiki surface (wiki
 *  list + wiki view + wiki create) over the typed Wiki/Wiki[] shapes. A null
 *  result → the empty state (never a TypeError). PURE. */
export function gnosisWikisContent(
  ctx: PaneContext,
  state: { wikis: Wiki[] | null; wiki: Wiki | null },
): LegacyNodeData {
  // H1 (adversarial): a null state (or a null wikis) → the unavailable/empty
  // state, never a TypeError.
  if (state == null || state.wikis == null) {
    return {
      type: 'div',
      props: { 'data-gnosis-pane': 'wikis', 'data-gnosis-state': 'unavailable' },
      children: [
        { type: 'strong', content: 'Gnosis wikis' },
        { type: 'p', content: 'Wikis unavailable — engine not connected or absent' },
      ],
    }
  }
  // H-1 — the wiki list items carry the `handlers` field so a user can CLICK an
  // item to select it (the select handler body is hardcoded above — the PURE
  // helper cannot receive it as an arg). The `data-wiki-id` prop feeds the body.
  const wikiLis: LegacyNodeData[] = state.wikis.map((w) => ({
    type: 'li',
    props: { 'data-wiki-id': w.wikiId },
    css: { classes: clickableClasses() },
    content: w.name,
    handlers: [{ name: 'gnosis-wikis-select', event: 'click', body: GNOSIS_WIKIS_SELECT_BODY }],
  }))
  const wiki = state.wiki
  return {
    type: 'div',
    props: { 'data-gnosis-pane': 'wikis' },
    children: [
      { type: 'strong', content: 'Wikis' },
      { type: 'ul', children: wikiLis },
      ...(wiki ? [{ type: 'strong' as const, content: `Wiki: ${wiki.name}` }] : []),
    ],
  }
}
