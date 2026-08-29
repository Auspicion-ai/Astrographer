// src/renderer/pane-graph.ts — Unit H: the app-graph pane assembly + the pure
// §5.3 data-flow helpers (docs/specs/unit-h-sidebar-panes.md §5.2-§5.3). A PURE
// module (no Electron). Merges the Unit C traversal envelope with the enabled
// app-graph panes (into the pane-inclusive app-graph envelope) and builds the
// operator isolated-scope envelope.
import type { LegacyInitialData, LegacyNodeData, LegacyContentPayload } from 'provident-ssr'
import type { BacklinkResult } from '../main/backlinks.js'
import type { RagQueryResult } from '../shared/types.js'
import type { PaneRegistry, PaneDefinition, PaneContext } from './pane-registry.js'

/** The root-visible sidebar zone the app-graph panes attach into. The assembler
 *  MUST emit a `container`-role producer for this zone (the Unit C HARD
 *  PRECONDITION — a `targetPlacement` naming a zone with no container producer
 *  leaves the root `unplaced`, silently not render-eligible). */
export const SIDEBAR_ZONE = 'sidebar'

/** Wrap a pane's render output into a sidebar content root: enforce the stable
 *  pane id (`pane-<id>`) and the sidebar targetPlacement, OVERWRITING whatever
 *  `render` returned. PURE. */
export function paneSubtreeRoot<C>(
  def: PaneDefinition<C>,
  ctx: C,
  sidebarZone: string,
): LegacyNodeData {
  if (def == null || ctx == null || typeof sidebarZone !== 'string' || sidebarZone === '') {
    throw new Error('paneSubtreeRoot: def/ctx/sidebarZone required')
  }
  const renderRoot = def.render(ctx)
  if (renderRoot == null) {
    throw new Error(`paneSubtreeRoot: pane "${def.id}" render returned nothing`)
  }
  return {
    ...renderRoot,
    props: { ...(renderRoot.props ?? {}), id: `pane-${def.id}` },
    placement: { targetPlacement: [sidebarZone] },
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
  /** The sidebar zone name (default SIDEBAR_ZONE). */
  sidebarZone?: string
}

export interface AppGraphAssemblyResult {
  /** The pane-inclusive envelope: the traversal content payloads + one
   *  ContentPayload per ENABLED app-graph pane, with a `sidebar` container
   *  producer in the template. */
  envelope: LegacyInitialData
  /** The enabled app-graph pane ids included (in registration order). */
  paneIds: string[]
}

/** Assemble the pane-inclusive app-graph envelope from the traversal envelope
 *  + the enabled app-graph panes. PURE. */
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
  const panePayloads: LegacyContentPayload[] = enabledAppGraph.map((p) => ({
    content: [paneSubtreeRoot(p, ctx, sidebarZone)],
  }))

  // Merge the traversal content payloads + the pane ContentPayloads (panes
  // appended after the traversal content).
  const content = [...(traversalEnvelope.content ?? []), ...panePayloads]

  // Ensure the envelope template's root has a `container`-role producer for the
  // sidebarZone (the HARD PRECONDITION). Keep an existing one; add it otherwise.
  const templateRoot = traversalEnvelope.template.root
  const children = [...(templateRoot.children ?? [])]
  const hasProducer = children.some(
    (c) => (c.placement as { placementName?: string } | undefined)?.placementName === sidebarZone,
  )
  if (!hasProducer) {
    children.push({
      type: 'div',
      props: { id: `zone:${sidebarZone}` },
      placement: { placementName: sidebarZone },
    })
  }

  const envelope: LegacyInitialData = {
    ...traversalEnvelope,
    template: { ...traversalEnvelope.template, root: { ...templateRoot, children } },
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
  docHeads: PaneContext['docHeads'],
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

/** The `doc-nav` pane content: a `ul` of `li` document entries. The current
 *  document's `li` carries `props['data-current'] = 'true'`. Empty list → a
 *  single `p` with content `(no documents)`. Unit V3 — reads `ctx.docHeads`. */
export function docNavContent(ctx: PaneContext): LegacyNodeData {
  // H1 (adversarial): a null ctx or a null/missing ctx.docHeads must survive →
  // the "(no documents)" empty state, never a TypeError.
  if (ctx == null || ctx.docHeads == null) {
    return { type: 'p', content: '(no documents)' }
  }
  const docs = deriveDocNavDocuments(ctx.docHeads)
  if (docs.length === 0) return { type: 'p', content: '(no documents)' }
  return {
    type: 'ul',
    children: docs.map((d) => ({
      type: 'li',
      props: {
        'data-document-id': d.documentId,
        ...(d.documentId === ctx.currentDocumentId ? { 'data-current': 'true' } : {}),
      },
      content: d.title ?? '', // LOW-4 (adversarial): a missing title → '' (never `content: undefined`)
    })),
  }
}

/** The `crosslinks` pane content: two `section`s — "Outgoing crosslinks" (one
 *  `li` per `ctx.crosslinks` entry, `data-target`) and "Backlinks / outlinks"
 *  (one `li` per `crosslinkBacklinks` + one per `crosslinkOutlinks`, each
 *  carrying `data-source`/`data-target`/`data-scope`). A `null` result or a
 *  `null` currentNodeId → the enumeration is skipped (the backlink list is
 *  empty, never a crash). */
export function crosslinksContent(
  ctx: PaneContext,
  result: BacklinkResult | null,
): LegacyNodeData {
  // H1 (adversarial): a null ctx or a null/missing ctx.crosslinks must survive →
  // the empty-state sections (the outgoing list shows "(none)"), never a
  // TypeError from `ctx.crosslinks.map`.
  const crosslinks = ctx == null || ctx.crosslinks == null ? [] : ctx.crosslinks
  const outgoingLis: LegacyNodeData[] = crosslinks.map((cl) => ({
    type: 'li',
    props: { 'data-target': cl.targetRagNodeId },
    content: cl.targetRagNodeId,
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

  return { type: 'div', children: [outgoingSection, backSection] }
}

/** The `search` pane content: a text `input` (`props.id = 'pane-search-input'`)
 *  + a results list (one `li` per `ranked` entry, `data-node-id` + the score).
 *  A `null` result → the input + an empty results list (never a throw). */
export function searchContent(ctx: PaneContext, result: RagQueryResult | null): LegacyNodeData {
  const input: LegacyNodeData = { type: 'input', props: { id: 'pane-search-input' } }
  const lis: LegacyNodeData[] = (result?.ranked ?? []).map((r) => ({
    type: 'li',
    props: { 'data-node-id': r.nodeId },
    content: `${r.nodeId} — ${String(r.score)}`,
  }))
  return { type: 'div', children: [input, ...lis] }
}
