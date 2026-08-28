// src/main/traversal.ts — Unit C: the main-process traversal pure function
// (docs/specs/unit-c-rendering-spine.md §5.1-§5.8). Compiles the relevant RAG
// nodes/edges into a provident `LegacyInitialData` envelope (shipped to the
// renderer for translateLegacy → renderProducingProcess), the back-reference
// `Map<ragNodeId, nodeId[]>` (the SOLE authoritative carrier), and the coarse
// line→node map. PURE — no Electron; importable in main and renderer.
//
// RAG-AUTHORITATIVE: the RAG store is authoritative; the provident graph is a
// transient render materialization. SUBTREE-OWNERSHIP: each RAG object owns a
// subtree; the back-reference is many-to-one. MULTI-PARENT-DUPLICATE: a
// multi-parent RAG node is materialized as duplicate subtrees sharing the RAG
// id. DERIVED-DOC-FLOW: doc-flow edges map to family order + a doc-head marker
// prop, falling back to family pre-order on validation failure (no throw).
// DOC-CHILD: a parent's subtree CONTAINS its doc-children's subtrees at the
// doc-child `order` position.
//
// Adversarial hardening (HOST findings, fixed here + regression-tested):
//   - The coarse line→node map is REAL markdown line ranges (rendered via
//     renderProducingProcess + MarkdownAdapter), not a synthetic 1-line span
//     per RAG object. A `ul` with 4 `li` doc-children maps to a range spanning
//     the whole list; a doc-child's lines map to the doc-child, not the parent.
//   - A parent's back-reference EXCLUDES its doc-children's node ids (§5.2
//     rule 6 / §5.9): collectSubtreeIds stops at each doc-child subtree root.
//   - The doc-child exclusion is scoped to the CURRENT document's doc-child
//     edges (per document, not global): a node that is a doc-child target in
//     document A but a multi-parent shared node in document B is materialized
//     in B.
//   - `documentIds` is deduped at the top (a duplicate id no longer
//     double-materializes every section).
//   - A RAG node's own `props` (e.g. `href`/`src` for `a`/`img`) are merged
//     into the subtree root's props (`id` and `data-doc-head` take precedence).
import type { RagStore, RagNode, RagEdge } from './rag-store.js'
import { validateDocFlow } from './doc-flow.js'
import { translateLegacy, renderProducingProcess, MarkdownAdapter } from 'provident-ssr'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from './template-shape.js'
import type {
  LegacyInitialData,
  LegacyNodeData,
  LegacyContentPayload,
  CompiledState,
  LinkConfig,
} from 'provident-ssr'

export interface TraversalInput {
  /** The RAG store (Unit A) — the `RagStore` INTERFACE (the abstraction layer). */
  store: RagStore
  /** The documents to materialize (RAG document ids). */
  documentIds: string[]
  /** The root-visible zone to attach the RAG subtrees into. */
  zoneName: string
  /** Unit I — the content-window template. When provided, the envelope's
   *  `template` is built from it (replacing the default); when absent, the
   *  default `DEFAULT_CONTENT_WINDOW_TEMPLATE` is used. The traversal ENSURES
   *  the `zoneName` container producer exists (adding it if the template lacks
   *  it — the zone-consistency defense-in-depth, §5.6). */
  template?: ContentWindowTemplate
}

/** The coarse line→node map: each RAG object → its line range in the rendered
 *  markdown (0-based, inclusive start, exclusive end). */
export interface LineNodeMap {
  ranges: Array<{ ragNodeId: string; startLine: number; endLine: number }>
}

/** Unit G — the custom crosslink LinkConfig. `name: 'crosslink'` is a custom
 *  name in the engine's OPEN `LinkConfig.name` union ('parent-child' |
 *  'component' | 'placement' | (string & {})). `roles: ['source', 'target']`
 *  MUST be set explicitly — the `Link` constructor's `baseFor(name)` returns
 *  DEFAULT_PARENT_CHILD (roles ['parent','child']) for an unknown name, and the
 *  custom config overrides it. The inherited `parent`/`children` constraints
 *  are inert for a source/target link (they only apply to `parent`/`child`
 *  role anchors). */
export const CROSSLINK_LINK_CONFIG: LinkConfig = {
  name: 'crosslink',
  roles: ['source', 'target'],
}

/** Unit G — one crosslink wiring entry: a `crosslink` RAG edge whose SOURCE
 *  RAG node is materialized in the current traversal. The renderer
 *  materializes the `Link`/`Anchor` from this wiring after `translateLegacy`. */
export interface CrosslinkWiring {
  /** The crosslink RAG edge id. */
  edgeId: string
  /** The source RAG node id (in the current materialization). */
  sourceRagNodeId: string
  /** The target RAG node id (may be in a DIFFERENT document — not materialized
   *  in the single-document view). */
  targetRagNodeId: string
}

export interface TraversalResult {
  /** The envelope shipped to the renderer for translateLegacy →
   *  renderProducingProcess. */
  envelope: LegacyInitialData
  /** The back-reference map: RAG object id → its owned provident node ids. */
  backRefs: Map<string, string[]>
  /** The coarse line→node map (first-class assembly output). */
  lineMap: LineNodeMap
  /** Unit G — the crosslink wiring: one entry per `crosslink` edge whose SOURCE
   *  RAG node is materialized in the current traversal. The renderer
   *  materializes the `Link`/`Anchor` from this wiring after `translateLegacy`. */
  crosslinks: CrosslinkWiring[]
}

/** True when the RAG node is a document head for the given document (a
 *  `doc-head` edge whose source is the node and whose documentIds include the
 *  document). */
function isDocHead(ragId: string, documentId: string, edges: RagEdge[]): boolean {
  return edges.some(
    (e) => e.kind === 'doc-head' && e.source === ragId && e.documentIds?.includes(documentId),
  )
}

/** Collect a translated node's subtree node ids (root-first, tree order),
 *  STOPPING at each doc-child subtree root (a child carrying the stable
 *  authored `rag-<id>` id — §5.2 rule 6 / §5.9: the parent's owned set
 *  EXCLUDES its doc-children's nodes). The doc-child's own entry is collected
 *  separately (its own backRefs entry). */
function collectSubtreeIds(
  node: { id: string; children: unknown[]; base?: { props?: { id?: unknown } } },
  out: string[],
): void {
  out.push(node.id)
  for (const c of node.children) {
    const pid = (c as { base?: { props?: { id?: unknown } } }).base?.props?.id
    // A child with a `rag-` id is a doc-child subtree root — do NOT descend
    // into it (its nodes belong to the doc-child's own backRefs entry).
    if (typeof pid === 'string' && pid.startsWith('rag-')) continue
    collectSubtreeIds(c as { id: string; children: unknown[]; base?: { props?: { id?: unknown } } }, out)
  }
}

/** Render a `LegacyInitialData` envelope to markdown via the canonical re-emit
 *  loop (renderProducingProcess + MarkdownAdapter). The envelope is
 *  placement-routed (content roots with `targetPlacement`), so the
 *  path-enumeration `compilePath` pass bootstraps it (the same path the
 *  renderer's Runtime uses). */
function renderEnvelopeMarkdown(envelope: LegacyInitialData): string {
  const translated = translateLegacy(envelope)
  const actionable: CompiledState[] = []
  for (const n of translated.nodes) actionable.push(...(n.compilePath().actionable as CompiledState[]))
  const byNode = new Map(translated.nodes.map((n) => [n.id, n]))
  const md = new MarkdownAdapter()
  renderProducingProcess(actionable, byNode, md, null)
  return md.toString()
}

/** Render a single RAG subtree (a LegacyNodeData content root) to markdown.
 *  The mini-envelope uses the SAME template root as the real envelope (so the
 *  content root is placed in the same zone and renders — the HARD PRECONDITION;
 *  a zone mismatch leaves the root unplaced and the markdown empty). The
 *  template root's own lines (if any) are included in the returned markdown and
 *  are subtracted by the caller (`assignSubtreeRanges`) so each subtree's OWN
 *  line count is isolated. */
function renderSubtreeMarkdown(subtree: LegacyNodeData, templateRoot: LegacyNodeData): string {
  const miniEnvelope: LegacyInitialData = {
    template: { root: templateRoot },
    content: [{ content: [subtree] }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  return renderEnvelopeMarkdown(miniEnvelope)
}

/** The template root's OWN markdown line count (rendered with NO content
 *  payloads). In the real envelope this is rendered exactly ONCE, at the top of
 *  the markdown, so it must be subtracted from every standalone subtree render
 *  (which re-includes it) and the lineMap cursor must start AFTER it. */
function renderTemplateLines(templateRoot: LegacyNodeData): number {
  const miniEnvelope: LegacyInitialData = {
    template: { root: templateRoot },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const md = renderEnvelopeMarkdown(miniEnvelope)
  return md === '' ? 0 : md.split('\n').length
}

/** Recursively assign REAL markdown line ranges to a RAG subtree and its
 *  nested doc-children. The subtree's own lines come BEFORE its doc-children's
 *  lines in the markdown (the parent renders its own content first, then
 *  recurses children), so the doc-children start after the parent's own lines.
 *  Every standalone render re-includes the template root's lines, so each line
 *  count is reduced by `templateLines` — the ranges are anchored to the single
 *  full-envelope render (the template root counted once, at the top), NOT to a
 *  sum of standalone renders (which would over-count the template root per
 *  subtree). Returns the next free line index. */
function assignSubtreeRanges(
  subtree: LegacyNodeData,
  start: number,
  ranges: Array<{ ragNodeId: string; startLine: number; endLine: number }>,
  templateRoot: LegacyNodeData,
  templateLines: number,
): number {
  const pid = subtree.props?.id
  const ragId = typeof pid === 'string' && pid.startsWith('rag-') ? pid.slice(4) : String(pid ?? '')
  const md = renderSubtreeMarkdown(subtree, templateRoot)
  const lineCount = Math.max(0, (md === '' ? 0 : md.split('\n').length) - templateLines)
  ranges.push({ ragNodeId: ragId, startLine: start, endLine: start + lineCount })
  const children = (subtree.children ?? []).filter((c) => {
    // Only recurse into RAG subtree roots (a `rag-`-prefixed authored id). The
    // textarea editing overlay (`textarea-<ragId>`) is a render-only child and
    // must NOT mint a lineMap range (Conflict C resolution).
    const cid = (c as LegacyNodeData).props?.id
    return typeof cid === 'string' && cid.startsWith('rag-')
  })
  // Each doc-child's own line count (rendered standalone, template subtracted).
  const childCounts = children.map((c) => {
    const cMd = renderSubtreeMarkdown(c as LegacyNodeData, templateRoot)
    return Math.max(0, (cMd === '' ? 0 : cMd.split('\n').length) - templateLines)
  })
  const sumChildLines = childCounts.reduce((a, b) => a + b, 0)
  const childStart = start + (lineCount - sumChildLines)
  let offset = 0
  for (let i = 0; i < children.length; i++) {
    assignSubtreeRanges(children[i] as LegacyNodeData, childStart + offset, ranges, templateRoot, templateLines)
    offset += childCounts[i]
  }
  return start + lineCount
}

export function buildTraversal(input: TraversalInput): TraversalResult {
  if (
    input == null ||
    input.store == null ||
    !Array.isArray(input.documentIds) ||
    input.documentIds.length === 0 ||
    typeof input.zoneName !== 'string' ||
    input.zoneName === ''
  ) {
    throw new Error('traversal: store/documentIds/zoneName required')
  }
  const { store, zoneName } = input
  // Dedup documentIds (preserve order) — a duplicate id would otherwise
  // double-materialize every section (finding 6).
  const documentIds = [...new Set(input.documentIds)]
  const nodes = store.listNodes()
  const edges = store.listEdges()
  const nodeById = new Map(nodes.map((n) => [n.id, n]))

  const content: LegacyContentPayload[] = []
  // Every RAG object that gets a content root (sections + nested doc-children +
  // multi-parent duplicates) — the reconciliation set for backRefs + lineMap.
  const materialized = new Set<string>()

  for (const documentId of documentIds) {
    // The current document's node set: the doc root + nodes referenced by its
    // scoped doc-flow edges + their doc-children (transitively). Used for the
    // fallback section set AND to scope the doc-child exclusion to THIS
    // document (finding 3 — a node that is a doc-child target in another
    // document must not be excluded here).
    const docNodeIds = new Set<string>([documentId])
    for (const e of edges) {
      if (e.documentIds?.includes(documentId)) {
        docNodeIds.add(e.source)
        docNodeIds.add(e.target)
      }
    }
    let changed = true
    while (changed) {
      changed = false
      for (const e of edges) {
        if (e.kind === 'doc-child' && docNodeIds.has(e.source) && !docNodeIds.has(e.target)) {
          docNodeIds.add(e.target)
          changed = true
        }
      }
    }

    const verdict = validateDocFlow(nodes, edges, documentId)
    let sections: string[]
    let nestDocChildren: boolean
    if (verdict.ok) {
      sections = verdict.order.filter((id) => id !== documentId)
      nestDocChildren = true
    } else {
      // Family pre-order fallback: the document's node set, excluding the doc
      // root. NOTE (finding 5): this "family pre-order" is STORE INSERTION
      // ORDER, not a tree pre-order — the node SET is correct per the spec's
      // definition, but the ordering is deterministic (insertion order), not a
      // pre-order. Documented as known behavior; not changed.
      sections = nodes.filter((n) => docNodeIds.has(n.id) && n.id !== documentId).map((n) => n.id)
      nestDocChildren = false
    }

    // Build one RAG object's subtree: its content root + its doc-children's
    // subtrees nested at their `order` positions.
    const buildSubtree = (ragId: string): LegacyNodeData => {
      materialized.add(ragId)
      const node = nodeById.get(ragId)!
      const children: LegacyNodeData[] = []
      if (nestDocChildren) {
        const docChildren = edges
          .filter((e) => e.kind === 'doc-child' && e.source === ragId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        for (const dc of docChildren) children.push(buildSubtree(dc.target))
      }
      // Merge the RAG node's own props (e.g. `href`/`src` for `a`/`img`) into
      // the subtree root's props, with the stable authored `id`, the
      // `data-rag-node-id` prop, and the `data-doc-head` marker taking
      // precedence (finding 7). Unit L — the subtree root's `content` is KEPT
      // (Conflict C resolution: the markdown/line→node map renders the root's
      // text; the textarea is a RENDER-ONLY editing overlay present in the DOM
      // render view, NOT in the markdown — docs/specs/unit-l-textarea-editing-ui.md §5.1).
      const props: Record<string, unknown> = {
        ...(node.props ?? {}),
        id: `rag-${ragId}`,
        'data-rag-node-id': ragId,
      }
      if (isDocHead(ragId, documentId, edges)) props['data-doc-head'] = true
      return {
        type: node.type,
        props,
        content: node.content,
        placement: { targetPlacement: [zoneName] },
        children: [
          // Unit L — the textarea child bound to the RAG node's content. Its
          // OWN authored id is `textarea-<ragId>` (NOT `rag-`-prefixed —
          // `collectSubtreeIds` treats a `rag-`-prefixed child as a doc-child
          // subtree root and would exclude the textarea from the backRefs map).
          // The `readOnly` prop is OMITTED (editable by default) — emitting
          // `readOnly: false` would render as the `readonly` boolean attribute
          // and make the textarea uneditable in a real DOM (adversarial H1).
          // The HOST sets `readOnly: true` at render time when `!isEditable(ragId)`
          // (§5.3).
          {
            type: 'textarea',
            props: {
              id: `textarea-${ragId}`,
              'data-rag-node-id': ragId,
              value: node.content,
            },
            handlers: [
              { name: 'rag-textarea-input', event: 'input' },
              { name: 'rag-textarea-blur', event: 'blur' },
            ],
          },
          ...children,
        ],
      }
    }

    // One ContentPayload per section (the doc-flow order, head-first). NOTE
    // (finding 8): a node that is BOTH a section AND a doc-child of another
    // section is materialized TWICE — once as its own section ContentPayload
    // and once nested within its parent's subtree. The doc-child nesting and
    // section roles are treated as mutually exclusive; documented as known
    // behavior, not changed.
    for (const sectionId of sections) {
      content.push({ content: [buildSubtree(sectionId)] })
    }

    // MULTI-PARENT-DUPLICATE: a non-section, non-doc-child RAG node with ≥2
    // in-scope parent-child parents is materialized as a duplicate subtree per
    // parent (distinct content roots sharing the RAG id via the map). NOTE
    // (finding 4): a SINGLE-parent, non-section, non-doc-child RAG node is
    // NEVER materialized as its own content root — it is expected to be
    // reached via its parent's subtree or a later unit. Documented as known
    // behavior; not changed.
    const sectionSet = new Set(sections)
    const docChildTargets = new Set(
      edges.filter((e) => e.kind === 'doc-child' && docNodeIds.has(e.source)).map((e) => e.target),
    )
    for (const node of nodes) {
      if (node.id === documentId) continue
      if (sectionSet.has(node.id)) continue
      if (docChildTargets.has(node.id)) continue
      const parents = edges
        .filter((e) => e.kind === 'parent-child' && e.target === node.id && sectionSet.has(e.source))
        .map((e) => e.source)
      if (parents.length >= 2) {
        for (let i = 0; i < parents.length; i++) {
          content.push({ content: [buildSubtree(node.id)] })
        }
      }
    }
  }

  // The envelope: template root with one container producer per targeted zone
  // (the HARD PRECONDITION) + one ContentPayload per RAG subtree. Unit I — the
  // template is the provided `input.template` (or the default), and the
  // traversal ENSURES the `zoneName` producer exists (the zone-consistency
  // defense-in-depth — a missing producer would leave the subtree unplaced).
  const templateRoot = (input.template ?? DEFAULT_CONTENT_WINDOW_TEMPLATE).root
  const templateChildren = [...(templateRoot.children ?? [])]
  const hasZoneProducer = templateChildren.some(
    (c) => (c.placement as { placementName?: string } | undefined)?.placementName === zoneName,
  )
  if (!hasZoneProducer) {
    templateChildren.push({
      type: 'div',
      props: { id: `zone:${zoneName}` },
      placement: { placementName: zoneName },
    })
  }
  const envelopeTemplateRoot: LegacyNodeData = { ...templateRoot, children: templateChildren }
  const envelope: LegacyInitialData = {
    template: {
      root: envelopeTemplateRoot,
    },
    content,
    clientConfig: { runInstantiation: true, runRendering: true },
  }

  // Back-reference map: run translateLegacy to obtain the minted node ids, then
  // map each RAG subtree root (by its stable authored id `rag-<ragNodeId>`) to
  // the minted ids of its subtree.
  const backRefs = new Map<string, string[]>()
  const translated = translateLegacy(envelope)
  const rootsByRagId = new Map<string, Array<{ id: string; children: unknown[]; base?: { props?: { id?: unknown } } }>>()
  for (const n of translated.nodes) {
    const pid = n.base.props?.id
    if (typeof pid === 'string' && pid.startsWith('rag-')) {
      const ragId = pid.slice(4)
      const arr = rootsByRagId.get(ragId) ?? []
      arr.push(n)
      rootsByRagId.set(ragId, arr)
    }
  }
  for (const ragId of materialized) {
    const ids: string[] = []
    for (const root of rootsByRagId.get(ragId) ?? []) collectSubtreeIds(root, ids)
    backRefs.set(ragId, ids)
  }

  // Coarse line→node map: render the envelope to markdown (the REAL markdown,
  // via renderProducingProcess + MarkdownAdapter), then map each RAG subtree's
  // line span to its RAG object. Ranges are 0-based, inclusive start, exclusive
  // end, and COARSE (a `ul` with 4 `li` doc-children maps to a range spanning
  // the whole list; a doc-child's lines map to the doc-child, not the parent).
  // The ranges are anchored to the SINGLE full-envelope render: the template
  // root's lines (if any) are counted ONCE at the top (the cursor starts after
  // them), and each subtree's own lines follow in content order. Each subtree's
  // own line count is its standalone render minus the template root's lines —
  // NOT a sum of standalone renders (which would over-count the template root
  // once per subtree — L5).
  const templateLines = renderTemplateLines(envelopeTemplateRoot)
  const ranges: Array<{ ragNodeId: string; startLine: number; endLine: number }> = []
  let cursor = templateLines
  for (const payload of content) {
    cursor = assignSubtreeRanges(payload.content[0], cursor, ranges, envelopeTemplateRoot, templateLines)
  }
  const lineMap: LineNodeMap = { ranges }

  // Unit G — the crosslink wiring. OUTGOING-ONLY materialization (pinned): emit
  // a wiring entry ONLY for a `crosslink` edge whose SOURCE RAG node is
  // materialized in the current traversal. A crosslink whose source is in a
  // DIFFERENT document (an incoming crosslink) is NOT materialized here — it is
  // visible via the backlink enumeration (§5.3). A missing target (a dangling
  // reference) is valid — no throw.
  const crosslinks: CrosslinkWiring[] = edges
    .filter((e) => e.kind === 'crosslink' && materialized.has(e.source))
    .map((e) => ({ edgeId: e.id, sourceRagNodeId: e.source, targetRagNodeId: e.target }))

  return { envelope, backRefs, lineMap, crosslinks }
}

/** Finding 3 — the renderer re-traversal re-materialization. Given a RAG store
 *  SNAPSHOT (nodes + edges — the renderer has no store access; it fetches this
 *  over the `rag-snapshot` IPC), re-derive the graph via `buildTraversal` and
 *  return the resulting back-reference `Map<ragNodeId, nodeId[]>` (Unit C §5.3
 *  — the SOLE authoritative carrier). The document ids are derived from the
 *  `doc-head` edges' targets (the document roots). PURE — no Electron; the
 *  renderer's `onRebuild` feeds the returned map back into the edit controller.
 *  An empty snapshot (no doc-head edges → no documents) returns an empty map
 *  (never throws). */
export function rebuildBackRefs(nodes: RagNode[], edges: RagEdge[], zoneName: string): Map<string, string[]> {
  const documentIds = [...new Set(edges.filter((e) => e.kind === 'doc-head').map((e) => e.target))]
  if (documentIds.length === 0) return new Map<string, string[]>()
  // buildTraversal only reads listNodes()/listEdges() — a minimal read-only
  // adapter over the snapshot satisfies the RagStore interface.
  const store = { listNodes: () => nodes, listEdges: () => edges } as unknown as RagStore
  const result = buildTraversal({ store, documentIds, zoneName })
  return result.backRefs
}
