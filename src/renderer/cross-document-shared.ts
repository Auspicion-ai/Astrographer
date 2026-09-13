// src/renderer/cross-document-shared.ts — Unit U-SHELL-9b: the PURE
// cross-document-shared decision/planning surface
// (docs/specs/unit-u-shell-9b-cross-document-shared.md §2.2/§2.3/§2.4/§2.5).
//
// The CROSS-DOCUMENT-SHARED / SUBTREE-OWNERSHIP model: a RAG node owned by >1
// document is materialized as duplicate subtrees in each owning document. This
// module computes, WITHOUT touching the store or the DOM:
//   - the Option-C commit warn (detectSharedCommit) + `planFork`/`planMutateAll`
//     (the atomic batch the host applies through the single writer), and
//   - the C20 render-time materialization decoration (a token-driven
//     shared-subtree class + a collapsible owners box attached to the side of
//     the owned subtree).
//
// PURE — no Electron, no DOM, no store mutation. Mirrors `tab-state.ts` /
// `layout-state.ts` (the pure renderer-module convention). The sharing fact is
// always the authoritative reverse map (`rag.backlinks` / `backRefs`), never a
// stored flag on the RAG node.
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import type { RagNode, RagEdge, BatchOp } from '../main/rag-store.js'

/** The authoritative owner carrier: `ragNodeId → owning document ids`
 *  (`rag.backlinks` / `backRefs`, SUBTREE-OWNERSHIP). */
export interface SharedOwners {
  [ragNodeId: string]: string[]
}

/** The Option-C warning for a commit targeting a CROSS-DOCUMENT-SHARED node. */
export interface SharedCommitWarning {
  nodeId: string
  editingDocumentId: string
  owners: string[]
  options: Array<'fork' | 'mutate-all'>
  /** >2 owners — the fork modal must present the sharing-document checklist. */
  requireChecklist: boolean
  /** F8 — the reverse map is unavailable; block (never silent-mutate). */
  blocked?: boolean
  reason?: string
}

/** The input to `planFork` — X + its owned subtree + every scoped edge. */
export interface ForkPlanInput {
  root: RagNode
  /** X + its owned subtree (deep-copied by the plan). */
  subtree: RagNode[]
  /** Every edge whose source/target is in the subtree. */
  edges: RagEdge[]
  editingDocumentId: string
  owners: string[]
  /** >2 owners — the checklist selection; defaults to [editingDocumentId]. */
  migrateDocumentIds?: string[]
  mintNodeId: () => string
  mintEdgeId: () => string
}

/** The fork plan: ONE atomic `applyBatch` + the ownership bookkeeping. */
export interface ForkPlan {
  ops: BatchOp[]
  forkRootId: string
  /** old subtree id → the new fork id. */
  forkNodeIds: Record<string, string>
  originalOwners: string[]
  forkOwners: string[]
}

/** The C20 token-driven shared-subtree background class (spec §2.2/§2.5 pin 3). */
export const SHARED_SUBTREE_CLASS = 'rag-shared-subtree'

/** The C20 owners-box authored id (the side panel attached to a shared root). */
export const OWNERS_BOX_ID = 'rag-shared-owners-box'

/** The C20 owners-box collapse toggle handler name (`on:click`). */
export const OWNERS_BOX_TOGGLE_HANDLER = 'rag-shared-owners-toggle'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The owning documents of a RAG node from the reverse map (never a stored
 *  flag). An unknown/malformed entry yields `[]`. PURE. */
export function ownersFor(owners: SharedOwners | null | undefined, ragNodeId: string): string[] {
  if (!isRecord(owners)) return []
  const list = owners[ragNodeId]
  if (!Array.isArray(list)) return []
  return list.filter((d): d is string => typeof d === 'string' && d !== '')
}

/** True when the RAG node is owned by >1 document (CROSS-DOCUMENT-SHARED). PURE. */
export function isShared(owners: SharedOwners | null | undefined, ragNodeId: string): boolean {
  return ownersFor(owners, ragNodeId).length > 1
}

/** §2.2/§2.4 + §4 F8/F9b — detect a commit on a CROSS-DOCUMENT-SHARED node.
 *  Returns `null` for an unshared/unknown node; a warn (fork + mutate-all) for
 *  >1 owner; `blocked` (never silent-mutate) when the reverse map is
 *  unavailable. PURE. */
export function detectSharedCommit(input: {
  nodeId: string
  editingDocumentId: string
  owners: SharedOwners | null | undefined
}): SharedCommitWarning | null {
  const { nodeId, editingDocumentId } = input
  if (!isRecord(input.owners)) {
    return {
      nodeId,
      editingDocumentId,
      owners: [],
      options: [],
      requireChecklist: false,
      blocked: true,
      reason: 'reverse map (rag.backlinks) unavailable — cannot resolve owners',
    }
  }
  const owners = ownersFor(input.owners, nodeId)
  if (owners.length <= 1) return null
  return {
    nodeId,
    editingDocumentId,
    owners,
    options: ['fork', 'mutate-all'],
    requireChecklist: owners.length > 2,
  }
}

/** §2.2/§2.5 — the C20 owners box: a provident subtree (app-graph) listing the
 *  sharing articles from the reverse map, with an `on:click` collapse toggle.
 *  It is attached as a child of the shared subtree root (a side panel), NOT a
 *  fixed pane/zone: it carries no `placement`. PURE. */
export function ownersBoxContent(input: {
  ragNodeId: string
  owners: string[]
  expanded?: boolean
}): LegacyNodeData {
  const expanded = input.expanded !== false
  const ownerNodes: LegacyNodeData[] = input.owners.map((documentId) => ({
    type: 'li',
    props: { 'data-owner-document-id': documentId },
    content: documentId,
  }))
  return {
    type: 'aside',
    props: {
      id: OWNERS_BOX_ID,
      'data-rag-node-id': input.ragNodeId,
      'data-shared': 'true',
      'data-expanded': expanded ? 'true' : 'false',
    },
    css: { classes: ['rag-shared-owners-box'] },
    children: [
      {
        type: 'button',
        props: {
          id: `${OWNERS_BOX_ID}-toggle`,
          'data-rag-node-id': input.ragNodeId,
          'data-toggle': 'owners-box',
        },
        css: { classes: ['clickable'] },
        content: expanded ? '▾ Shared by' : `▸ Shared by (${input.owners.length})`,
        handlers: [
          {
            name: OWNERS_BOX_TOGGLE_HANDLER,
            event: 'click',
            body: `function (ctx) { var s = window && window.provident && window.provident.sidebar; if (s && s.toggleOwnersBox) { var n = ctx && ctx.node; s.toggleOwnersBox(n && n.props && n.props['data-rag-node-id']); } }`,
          },
        ],
      },
      {
        type: 'ul',
        props: { id: `${OWNERS_BOX_ID}-list` },
        children: ownerNodes,
      },
    ],
  }
}

/** Decorate a cloned envelope's node (in place — the clone is fresh): a shared
 *  `rag-<id>` root carries the C20 class + the owners box; recurse into nested
 *  `rag-` doc-children. PURE w.r.t. the source envelope. */
function decorateNodeInPlace(node: LegacyNodeData, owners: SharedOwners): void {
  if (node == null || typeof node !== 'object') return
  const id = node.props?.id
  if (typeof id === 'string' && id.startsWith('rag-') && id.length > 4) {
    const ragId = id.slice(4)
    if (isShared(owners, ragId)) {
      const css = node.css ?? {}
      const classes = Array.isArray(css.classes) ? css.classes.map(String) : []
      if (!classes.includes(SHARED_SUBTREE_CLASS)) classes.push(SHARED_SUBTREE_CLASS)
      css.classes = classes
      node.css = css
      const children = Array.isArray(node.children) ? node.children : (node.children = [])
      if (!children.some((c) => c?.props?.id === OWNERS_BOX_ID)) {
        children.push(ownersBoxContent({ ragNodeId: ragId, owners: ownersFor(owners, ragId), expanded: true }))
      }
    }
  }
  if (Array.isArray(node.children)) for (const c of node.children) decorateNodeInPlace(c, owners)
}

/** §2.2/§2.4 + §3.2/§3.4 — apply the C20 render-time materialization
 *  decoration to a DEEP COPY of the envelope (the input is never mutated; no
 *  RAG flag is stored): every shared `rag-<id>` subtree root gets the
 *  token-driven class + the owners box. PURE. */
export function applySharedSubtreeDecoration(
  envelope: LegacyInitialData,
  owners: SharedOwners,
): LegacyInitialData {
  const clone = JSON.parse(JSON.stringify(envelope)) as LegacyInitialData
  const payloads = Array.isArray(clone.content) ? clone.content : []
  for (const payload of payloads) {
    const nodes = (payload as { content?: unknown } | null | undefined)?.content
    if (!Array.isArray(nodes)) continue
    for (const node of nodes) decorateNodeInPlace(node as LegacyNodeData, owners)
  }
  return clone
}

/** §2.3 + §3.5/§3.6/§3.8 + §4 F7/F10b — the Option-C fork plan: ONE atomic
 *  `applyBatch` that deep-copies X + its owned subtree into the editing
 *  document's ownership, re-points the migrating documents' edges, and leaves
 *  the original owners' edges/ids unchanged. PURE (no store access). */
export function planFork(input: ForkPlanInput): ForkPlan {
  const { root, subtree, edges, owners, mintNodeId, mintEdgeId } = input
  const migrate = Array.isArray(input.migrateDocumentIds)
    ? input.migrateDocumentIds.filter((d): d is string => typeof d === 'string')
    : [input.editingDocumentId]
  const forkOwners = owners.filter((o) => migrate.includes(o))
  // F10b — no owner selected (or no overlap): no migration, the fork is a no-op.
  if (forkOwners.length === 0) {
    return { ops: [], forkRootId: '', forkNodeIds: {}, originalOwners: [...owners], forkOwners: [] }
  }
  const originalOwners = owners.filter((o) => !forkOwners.includes(o))

  const forkNodeIds: Record<string, string> = {}
  for (const n of subtree) forkNodeIds[n.id] = mintNodeId()
  const mapId = (id: string): string => forkNodeIds[id] ?? id

  const ops: BatchOp[] = []
  // 1. Deep-copy the owned subtree into the editing document's store ids.
  for (const n of subtree) {
    ops.push({
      op: 'putNode',
      node: {
        ...n,
        id: forkNodeIds[n.id],
        ownedNodeIds: (n.ownedNodeIds ?? []).map(mapId),
      },
    })
  }

  // 2. Re-point the migrating documents' edges. A relevant edge (an endpoint in
  //    the subtree) whose `documentIds` contains a migrating document: drop
  //    those docs and, when docs remain, keep the original as a shared edge; a
  //    per-document fork edge is always minted for the migrating docs.
  const subtreeIds = new Set(subtree.map((n) => n.id))
  for (const edge of edges) {
    if (!subtreeIds.has(edge.source) && !subtreeIds.has(edge.target)) continue
    if (!Array.isArray(edge.documentIds)) continue
    const included = edge.documentIds.filter((d) => forkOwners.includes(d))
    if (included.length === 0) continue
    const remaining = edge.documentIds.filter((d) => !forkOwners.includes(d))
    if (remaining.length === 0) {
      ops.push({ op: 'removeEdge', id: edge.id })
    } else {
      ops.push({ op: 'putEdge', edge: { ...edge, documentIds: remaining } })
    }
    ops.push({
      op: 'putEdge',
      edge: {
        ...edge,
        id: mintEdgeId(),
        source: mapId(edge.source),
        target: mapId(edge.target),
        documentIds: included,
      },
    })
  }

  return { ops, forkRootId: forkNodeIds[root.id], forkNodeIds, originalOwners, forkOwners }
}

/** §2.3 — mutate all owners: a single `putNode` on the SAME shared X (no fork,
 *  the id is unchanged; every owner re-derives). PURE. */
export function planMutateAll(input: { root: RagNode; content: string }): BatchOp[] {
  return [{ op: 'putNode', node: { ...input.root, content: input.content } }]
}
