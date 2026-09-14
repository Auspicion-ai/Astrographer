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
  // H5 — de-dupe (order-preserving): a repeated owner id must not inflate the
  // owner count (>1 ⇒ shared) or duplicate an owners-box/checklist entry.
  const out: string[] = []
  for (const d of list) {
    if (typeof d === 'string' && d !== '' && !out.includes(d)) out.push(d)
  }
  return out
}

/** True when the RAG node is owned by >1 document (CROSS-DOCUMENT-SHARED). PURE. */
export function isShared(owners: SharedOwners | null | undefined, ragNodeId: string): boolean {
  return ownersFor(owners, ragNodeId).length > 1
}

/** §2.8 — the synchronous authoritative owners reverse map from the snapshot
 *  edges: union (dedup) each edge's `documentIds` onto `owners[edge.target]`.
 *  Equivalent to the `rag.backlinks` reverse map (the snapshot is the same data,
 *  already cached as `lastSnapshot`). PURE + TOTAL: a malformed edge/id is
 *  ignored, the input is never mutated, and a non-array input yields `{}`. */
export function buildOwnersMap(edges: unknown): SharedOwners {
  const owners: SharedOwners = {}
  if (!Array.isArray(edges)) return owners
  for (const edge of edges) {
    if (!isRecord(edge)) continue
    const target = edge.target
    if (typeof target !== 'string' || target === '') continue
    const documentIds = edge.documentIds
    if (!Array.isArray(documentIds)) continue
    for (const d of documentIds) {
      // H5-style dedup semantics (order-preserving). The key is only minted
      // once a valid owner exists (an empty documentIds contributes nothing).
      if (typeof d === 'string' && d !== '') {
        const list = owners[target] ?? (owners[target] = [])
        if (!list.includes(d)) list.push(d)
      }
    }
  }
  return owners
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

/** §2.7 (H3/W2-N12) — true when `id` is the RAG subtree ROOT for `ragId`: the
 *  unscoped `rag-<ragId>` or the document-scoped `rag-<documentId>--<ragId>`.
 *  Guards against synthetic `rag-`-prefixed ids that merely carry a
 *  `data-rag-node-id` (e.g. the C20 owners box `rag-shared-owners-box`, which
 *  carries the owner ragId for its toggle handler but is NOT a RAG root). PURE. */
function matchesRagRootId(id: string, ragId: string): boolean {
  if (!id.startsWith('rag-') || id.length <= 4) return false
  const tail = id.slice(4)
  // The scope suffix is `--<ragId>`; a SUFFIX test (not `indexOf`) is robust to
  // the separator also appearing inside the document id or the RAG id itself
  // (`sanitizeDocumentId` permits `--`).
  return tail === ragId || tail.endsWith(`--${ragId}`)
}

/** §2.7 (H3/W2-N12) — recover a node's PLAIN RAG id from its
 *  `data-rag-node-id` prop when present AND consistent with the authored id
 *  (scoped-aware), falling back to the legacy `id.slice(4)` parse. The authored
 *  id may be document-scoped (`rag-<documentId>--<ragId>`) in the simultaneous
 *  multi-document path, so the data prop is the authoritative addressing key.
 *  Returns null for a non-`rag-` id. PURE. */
export function plainRagId(props: Record<string, unknown> | undefined): string | null {
  const id = props?.id
  if (typeof id !== 'string' || !id.startsWith('rag-') || id.length <= 4) return null
  const dataId = props?.['data-rag-node-id']
  if (typeof dataId === 'string' && dataId !== '' && matchesRagRootId(id, dataId)) return dataId
  return id.slice(4)
}

/** §2.7 (H3/W2-N12) — the per-document id-namespace scope carrier for the
 *  SIMULTANEOUS multi-document path. Returns a DEEP COPY of `envelope` with
 *  every `content` node's authored `props.id` rewritten per document:
 *  `rag-<ragId>` → `rag-<documentId>--<ragId>`, `textarea-<ragId>` →
 *  `textarea-<documentId>--<ragId>`, `inline-<ragId>-<i>` →
 *  `inline-<documentId>--<ragId>-<i>`. `data-rag-node-id` stays the PLAIN ragId
 *  (the addressing key) and every non-RAG id (`pane-…`, `zone:…`, template nodes)
 *  is unchanged. PURE + TOTAL: the input is never mutated; malformed input is
 *  returned as-is, never thrown. */
export function scopeDocumentIds(envelope: LegacyInitialData, documentId: string): LegacyInitialData {
  if (envelope == null || typeof envelope !== 'object') return envelope
  let clone: LegacyInitialData
  try {
    clone = JSON.parse(JSON.stringify(envelope)) as LegacyInitialData
  } catch {
    return envelope
  }
  if (clone == null || typeof clone !== 'object') return clone
  if (typeof documentId !== 'string' || documentId === '') return clone
  const scopeId = (id: string): string => {
    if (id.startsWith('rag-')) return `rag-${documentId}--${id.slice(4)}`
    if (id.startsWith('textarea-')) return `textarea-${documentId}--${id.slice(9)}`
    if (id.startsWith('inline-')) return `inline-${documentId}--${id.slice(7)}`
    return id
  }
  const walk = (nodes: unknown): void => {
    if (!Array.isArray(nodes)) return
    for (const node of nodes) {
      if (node == null || typeof node !== 'object') continue
      const n = node as LegacyNodeData
      const props = n.props as Record<string, unknown> | undefined
      if (props != null && typeof props === 'object') {
        const pid = props.id
        if (typeof pid === 'string') props.id = scopeId(pid)
      }
      walk(n.children)
    }
  }
  for (const payload of Array.isArray(clone.content) ? clone.content : []) {
    walk((payload as { content?: unknown } | null | undefined)?.content)
  }
  return clone
}

/** §2.8 (H2) — the optional collapsed-owners-box carrier: a set of PLAIN RAG
 *  ids, or a predicate. Absent ⇒ every box is expanded (today's default). PURE
 *  + TOTAL (a malformed set/callback never throws and reads as expanded). */
export type CollapsedOwnersBoxes = ReadonlySet<string> | ((ragId: string) => boolean)

function isCollapsed(collapsed: CollapsedOwnersBoxes | null | undefined, ragId: string): boolean {
  if (collapsed == null) return false
  if (typeof collapsed === 'function') {
    try {
      return collapsed(ragId) === true
    } catch {
      return false
    }
  }
  if (typeof (collapsed as ReadonlySet<string>).has === 'function') {
    return (collapsed as ReadonlySet<string>).has(ragId)
  }
  return false
}

/** Decorate a cloned envelope's node (in place — the clone is fresh): a shared
 *  `rag-<id>` root carries the C20 class + the owners box; recurse into nested
 *  `rag-` doc-children. PURE w.r.t. the source envelope. */
function decorateNodeInPlace(
  node: LegacyNodeData,
  owners: SharedOwners,
  collapsed?: CollapsedOwnersBoxes | null,
): void {
  if (node == null || typeof node !== 'object') return
  const id = node.props?.id
  if (typeof id === 'string' && id.startsWith('rag-') && id.length > 4) {
    const ragId = plainRagId(node.props as Record<string, unknown> | undefined) ?? id.slice(4)
    if (isShared(owners, ragId)) {
      const css = node.css ?? {}
      const classes = Array.isArray(css.classes) ? css.classes.map(String) : []
      if (!classes.includes(SHARED_SUBTREE_CLASS)) classes.push(SHARED_SUBTREE_CLASS)
      css.classes = classes
      node.css = css
      const children = Array.isArray(node.children) ? node.children : (node.children = [])
      // §2.10 (W2-N15) — idempotent: recognise an EXISTING owners box by its
      // `data-shared:'true'` marker, not the exact unscoped `OWNERS_BOX_ID`. The
      // stored scoped union's box id is document-scoped
      // (`rag-<documentId>--shared-owners-box`), so an id-only check would add a
      // second box when the load path decorates the union again.
      if (!children.some((c) => c?.props?.['data-shared'] === 'true')) {
        children.push(
          ownersBoxContent({ ragNodeId: ragId, owners: ownersFor(owners, ragId), expanded: !isCollapsed(collapsed, ragId) }),
        )
      }
    }
  }
  if (Array.isArray(node.children)) for (const c of node.children) decorateNodeInPlace(c, owners, collapsed)
}

/** §2.2/§2.4 + §3.2/§3.4 — apply the C20 render-time materialization
 *  decoration to a DEEP COPY of the envelope (the input is never mutated; no
 *  RAG flag is stored): every shared `rag-<id>` subtree root gets the
 *  token-driven class + the owners box. §2.8 — an optional `collapsed` set
 *  (or predicate) authors `data-expanded="false"`; omitted ⇒ expanded. PURE. */
export function applySharedSubtreeDecoration(
  envelope: LegacyInitialData,
  owners: SharedOwners,
  collapsed?: CollapsedOwnersBoxes | null,
): LegacyInitialData {
  const clone = JSON.parse(JSON.stringify(envelope)) as LegacyInitialData
  const payloads = Array.isArray(clone.content) ? clone.content : []
  for (const payload of payloads) {
    const nodes = (payload as { content?: unknown } | null | undefined)?.content
    if (!Array.isArray(nodes)) continue
    for (const node of nodes) decorateNodeInPlace(node as LegacyNodeData, owners, collapsed)
  }
  return clone
}

/** §2.3 + §3.5/§3.6/§3.8 + §4 F7/F10b — the Option-C fork plan: ONE atomic
 *  `applyBatch` that deep-copies X + its owned subtree into the editing
 *  document's ownership, re-points the migrating documents' edges, and leaves
 *  the original owners' edges/ids unchanged. PURE (no store access). */
export function planFork(input: ForkPlanInput): ForkPlan {
  const noop = (ownerList: string[]): ForkPlan => ({
    ops: [],
    forkRootId: '',
    forkNodeIds: {},
    originalOwners: [...ownerList],
    forkOwners: [],
  })
  // H4 — totality: a malformed input is a no-op plan, never a throw.
  if (input == null || typeof input !== 'object') return noop([])
  const ownerList = Array.isArray(input.owners)
    ? input.owners.filter((o): o is string => typeof o === 'string' && o !== '')
    : []
  // H4 — drop malformed subtree entries (null/undefined/id-less) up front.
  const subtree = (Array.isArray(input.subtree) ? input.subtree : []).filter(
    (n): n is RagNode => n != null && typeof n === 'object' && typeof (n as RagNode).id === 'string',
  )
  const root = input.root
  // H6 — the fork root MUST be a member of the subtree (whole-subtree copy);
  // an absent root is a malformed request, not a partial fork.
  if (root == null || typeof root.id !== 'string' || !subtree.some((n) => n.id === root.id)) {
    return noop(ownerList)
  }
  const edges = (Array.isArray(input.edges) ? input.edges : []).filter(
    (e): e is RagEdge => e != null && typeof e === 'object',
  )
  const migrate = Array.isArray(input.migrateDocumentIds)
    ? input.migrateDocumentIds.filter((d): d is string => typeof d === 'string')
    : [input.editingDocumentId]
  // H6 — only owners may migrate (a non-owner id is ignored, never a phantom).
  const forkOwners = ownerList.filter((o) => migrate.includes(o))
  // F10b — no owner selected (or no overlap): no migration, the fork is a no-op.
  if (forkOwners.length === 0) return noop(ownerList)
  const originalOwners = ownerList.filter((o) => !forkOwners.includes(o))
  // H6 — a fork must leave X owned by at least one document; migrating every
  // owner would orphan X, so it is rejected as a no-op.
  if (originalOwners.length === 0) return noop(ownerList)

  // H4 — the minters are required; a missing minter would mint colliding empty
  // ids (a corrupt plan), so the request is rejected as a no-op instead.
  if (typeof input.mintNodeId !== 'function' || typeof input.mintEdgeId !== 'function') {
    return noop(ownerList)
  }
  const mintNodeId = input.mintNodeId
  const mintEdgeId = input.mintEdgeId
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
        ownedNodeIds: (Array.isArray(n.ownedNodeIds) ? n.ownedNodeIds : []).map(mapId),
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

// ===========================================================================
// §2.9 (H1/W2-N13) — the Option-C confirmation strip: a provident-authored
// (app-graph, MCP-visible) content root with fork / mutate-all / cancel
// buttons + the >2-owner sharing-document checklist. The handler bodies reach
// the host through `window.provident.sidebar` (the M2 pattern — NEVER an MCP
// tool). PURE authoring (no host/store access).
// ===========================================================================

/** The strip's authored root id (a `pane-` prefix so the Runtime tracks it as
 *  a content root, like the other app-graph panes). */
export const SHARED_COMMIT_STRIP_ID = 'pane-shared-commit-strip'
export const SHARED_COMMIT_NOTICE_ID = 'pane-shared-commit-notice'
export const SHARED_COMMIT_FORK_ID = 'shared-commit-fork'
export const SHARED_COMMIT_MUTATE_ALL_ID = 'shared-commit-mutate-all'
export const SHARED_COMMIT_CANCEL_ID = 'shared-commit-cancel'
export const SHARED_COMMIT_OWNER_TOGGLE_ID_PREFIX = 'shared-commit-owner-'
export const SHARED_COMMIT_FORK_HANDLER = 'shared-commit-fork'
export const SHARED_COMMIT_MUTATE_ALL_HANDLER = 'shared-commit-mutate-all'
export const SHARED_COMMIT_CANCEL_HANDLER = 'shared-commit-cancel'
export const SHARED_COMMIT_OWNER_TOGGLE_HANDLER = 'shared-commit-owner-toggle'

/** The fork button body: collect the checklist's selected owner documents from
 *  the DOM (the host re-authors the permanent selection on toggle) and dispatch
 *  the fork. No checklist (exactly 2 owners) ⇒ no selection passed (the host
 *  defaults to the editing document). */
const SHARED_COMMIT_FORK_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || !s.sharedCommitFork) return;
  var ids = [];
  var doc = (typeof document !== 'undefined') ? document : null;
  if (doc && typeof doc.querySelectorAll === 'function') {
    var els = doc.querySelectorAll('[data-shared-commit-owner][data-selected="true"]');
    for (var i = 0; i < els.length; i++) {
      var v = els[i].getAttribute('data-owner-document-id');
      if (v) ids.push(v);
    }
  }
  s.sharedCommitFork(ids.length ? ids : undefined);
}`
const SHARED_COMMIT_MUTATE_ALL_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (s && s.sharedCommitMutateAll) s.sharedCommitMutateAll();
}`
const SHARED_COMMIT_CANCEL_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (s && s.sharedCommitCancel) s.sharedCommitCancel();
}`
const SHARED_COMMIT_OWNER_TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || !s.sharedCommitToggleOwner) return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-owner-document-id'];
  if (id) s.sharedCommitToggleOwner(id);
}`

/** §2.9 — the Option-C confirmation strip content (pure). Distinct authored
 *  ids for fork/mutate-all/cancel; when `warning.requireChecklist` (>2 owners)
 *  a checklist with one toggle per owner, the `selectedOwnerIds` (default: the
 *  editing document) marked `data-selected="true"`. PURE + TOTAL. */
export function sharedCommitStripContent(input: {
  warning: SharedCommitWarning
  selectedOwnerIds?: string[]
}): LegacyNodeData {
  const warning = input.warning
  const explicit = Array.isArray(input.selectedOwnerIds) ? input.selectedOwnerIds : null
  const selected =
    explicit != null && explicit.length > 0
      ? explicit
      : [warning.editingDocumentId]
  const children: LegacyNodeData[] = [
    {
      type: 'span',
      props: {
        id: `${SHARED_COMMIT_STRIP_ID}-message`,
        'data-role': 'shared-commit-message',
      },
      content: `"${warning.nodeId}" is shared by ${warning.owners.length} documents`,
    },
    {
      type: 'button',
      props: { id: SHARED_COMMIT_FORK_ID, 'data-action': 'fork', 'data-rag-node-id': warning.nodeId },
      css: { classes: ['clickable'] },
      content: 'Fork',
      handlers: [{ name: SHARED_COMMIT_FORK_HANDLER, event: 'click', body: SHARED_COMMIT_FORK_BODY }],
    },
    {
      type: 'button',
      props: {
        id: SHARED_COMMIT_MUTATE_ALL_ID,
        'data-action': 'mutate-all',
        'data-rag-node-id': warning.nodeId,
      },
      css: { classes: ['clickable'] },
      content: 'Mutate all',
      handlers: [{ name: SHARED_COMMIT_MUTATE_ALL_HANDLER, event: 'click', body: SHARED_COMMIT_MUTATE_ALL_BODY }],
    },
    {
      type: 'button',
      props: { id: SHARED_COMMIT_CANCEL_ID, 'data-action': 'cancel', 'data-rag-node-id': warning.nodeId },
      css: { classes: ['clickable'] },
      content: 'Cancel',
      handlers: [{ name: SHARED_COMMIT_CANCEL_HANDLER, event: 'click', body: SHARED_COMMIT_CANCEL_BODY }],
    },
  ]
  if (warning.requireChecklist) {
    const toggles: LegacyNodeData[] = warning.owners.map((ownerId) => ({
      type: 'li',
      props: {
        id: `${SHARED_COMMIT_OWNER_TOGGLE_ID_PREFIX}${ownerId}`,
        'data-shared-commit-owner': 'true',
        'data-owner-document-id': ownerId,
        'data-selected': selected.includes(ownerId) ? 'true' : 'false',
      },
      content: ownerId,
      handlers: [{ name: SHARED_COMMIT_OWNER_TOGGLE_HANDLER, event: 'click', body: SHARED_COMMIT_OWNER_TOGGLE_BODY }],
    }))
    children.push({ type: 'ul', props: { id: `${SHARED_COMMIT_STRIP_ID}-owners` }, children: toggles })
  }
  return {
    type: 'div',
    props: {
      id: SHARED_COMMIT_STRIP_ID,
      'data-role': 'shared-commit-strip',
      'data-rag-node-id': warning.nodeId,
      'data-shared-commit': 'true',
    },
    children,
  }
}

/** §2.9/F8 — the blocked-reverse-map notice (app-graph, MCP-visible). PURE. */
export function sharedCommitNoticeContent(reason: string): LegacyNodeData {
  return {
    type: 'div',
    props: { id: SHARED_COMMIT_NOTICE_ID, 'data-role': 'shared-commit-notice' },
    children: [
      {
        type: 'span',
        props: { id: `${SHARED_COMMIT_NOTICE_ID}-message` },
        content: reason,
      },
    ],
  }
}
