// src/main/edit-ops.ts — Unit D: the edit ops (docs/specs/unit-d-editing.md
// §5.1). Pure async functions over the RagStore INTERFACE (Unit A §5.4 —
// SOURCE-SWITCHABLE), never the concrete JSON store. Each op returns a
// discriminated result: `{ ok: true, ... }` on success, `{ ok: false, error }`
// on a domain failure. Ops NEVER throw for domain failures; the ONLY throw
// path is a store-level failure the op does not catch (e.g. a malformed record
// reaching putNode), which propagates to the caller (the MCP handler).
import { randomUUID } from 'node:crypto'
import type { RagStore, RagNode, RagEdge, RagNodeType, RagEdgeKind } from './rag-store.js'
import type { EditCommitResult } from '../shared/types.js'

export interface EditOpContext {
  /** The RAG store (Unit A) — the `RagStore` INTERFACE (the abstraction layer,
   *  Unit A §5.4). The edit ops depend on the interface, NOT the concrete JSON
   *  store, so the source is switchable. */
  store: RagStore
}

// ---- result types (JSON-serializable; the MCP tools return these) ----------

export type SetContentResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type CreateNodeResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type DeleteNodeResult = { ok: true; removed: boolean } | { ok: false; error: string }
export type SplitNodeResult = { ok: true; nodes: [RagNode, RagNode]; edge: RagEdge } | { ok: false; error: string }
export type MergeNodeResult = { ok: true; target: RagNode } | { ok: false; error: string }
export type SetEdgeResult = { ok: true; edge: RagEdge } | { ok: false; error: string }

// The closed unions (Unit A §5.1). Duplicated here as runtime sets because the
// store does not export them; the store validates the same unions at write time.
const RAG_NODE_TYPES = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div'])
const RAG_EDGE_KINDS = new Set<string>(['parent-child', 'doc-head', 'next-section', 'doc-end', 'doc-child'])

function sameDocIds(a: string[] | undefined, b: string[] | undefined): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  if (a.length !== b.length) return false
  return a.every((x, i) => x === b[i])
}

/** Whether `targetId` is a descendant of `sourceId` in the subtree graph
 *  (parent-child / doc-child edges). Used by `mergeNode` to reject a merge
 *  that would create a self-referential edge (H4). */
function isDescendant(store: RagStore, sourceId: string, targetId: string): boolean {
  const children = new Map<string, string[]>()
  for (const e of store.listEdges()) {
    if (e.kind === 'parent-child' || e.kind === 'doc-child') {
      const list = children.get(e.source) ?? []
      list.push(e.target)
      children.set(e.source, list)
    }
  }
  const visited = new Set<string>()
  const stack = [sourceId]
  while (stack.length > 0) {
    const cur = stack.pop()!
    if (cur === targetId) return true
    if (visited.has(cur)) continue
    visited.add(cur)
    for (const c of children.get(cur) ?? []) {
      if (!visited.has(c)) stack.push(c)
    }
  }
  return false
}

/** Set a RAG node's content. A CONTENT op → journaled as a `content` entry
 *  (Unit A §5.6). The renderer's response to the store change is a re-traversal
 *  (CONTENT-EDIT-RE-TRAVERSAL). */
export async function setContent(ctx: EditOpContext, params: { nodeId: string; content: string }): Promise<SetContentResult> {
  if (typeof params.content !== 'string') {
    return { ok: false, error: 'edit.set_content: content must be a string' }
  }
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_content: node not found' }
  }
  // putNode preserves createdAt and refreshes updatedAt (Unit A §5.1).
  const updated = await ctx.store.putNode({ ...node, content: params.content })
  return { ok: true, node: updated }
}

/** Create a RAG node. A STRUCTURAL op → journaled as a `node-add` entry →
 *  re-traversal. When `parentId` is given, ALSO create a `parent-child` edge
 *  (source=`parentId`, target=new node) so the created node is not orphaned
 *  (Unit B §5.4 finding 3). */
export async function createNode(ctx: EditOpContext, params: { type: string; content: string; parentId?: string; props?: Record<string, unknown> }): Promise<CreateNodeResult> {
  if (!RAG_NODE_TYPES.has(params.type)) {
    return { ok: false, error: 'edit.create_node: invalid type' }
  }
  if (typeof params.content !== 'string') {
    return { ok: false, error: 'edit.create_node: content must be a string' }
  }
  if (params.parentId !== undefined) {
    if (!ctx.store.getNode(params.parentId)) {
      return { ok: false, error: 'edit.create_node: parent not found' }
    }
  }
  const id = `n-${randomUUID()}`
  const now = new Date().toISOString()
  const node: RagNode = {
    id,
    type: params.type as RagNodeType,
    content: params.content,
    props: params.props,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
  }
  await ctx.store.putNode(node)
  if (params.parentId !== undefined) {
    const edge: RagEdge = {
      id: `e-${randomUUID()}`,
      kind: 'parent-child',
      source: params.parentId,
      target: id,
      createdAt: now,
      updatedAt: now,
    }
    await ctx.store.putEdge(edge)
  }
  return { ok: true, node }
}

/** Delete a RAG node + cascade its edges. A STRUCTURAL op → journaled as a
 *  `node-delete` entry → re-traversal. */
export async function deleteNode(ctx: EditOpContext, params: { nodeId: string }): Promise<DeleteNodeResult> {
  // Existence check FIRST (L1): a nonexistent OR quarantined node (getNode
  // returns undefined for both) is a no-op — never physically removed.
  if (!ctx.store.getNode(params.nodeId)) {
    return { ok: true, removed: false }
  }
  const removed = await ctx.store.removeNode(params.nodeId)
  return { ok: true, removed }
}

/** Split a RAG node at character offset `at`. A STRUCTURAL op → journaled →
 *  re-traversal. The original keeps `content[0..at]`; a new node gets
 *  `content[at..]` and becomes a `doc-child` of the original (appended at the
 *  end of the original's doc-children). */
export async function splitNode(ctx: EditOpContext, params: { nodeId: string; at: number }): Promise<SplitNodeResult> {
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.split_node: node not found' }
  }
  if (!Number.isInteger(params.at) || params.at < 1 || params.at >= node.content.length) {
    return { ok: false, error: 'edit.split_node: invalid offset' }
  }
  const originalContent = node.content.slice(0, params.at)
  const newContent = node.content.slice(params.at)
  const now = new Date().toISOString()
  const original = await ctx.store.putNode({ ...node, content: originalContent })
  const newId = `n-${randomUUID()}`
  const fresh: RagNode = {
    id: newId,
    type: node.type,
    content: newContent,
    // L2 — preserve the original's props on the new node (the split keeps the
    // original's metadata; the spec §5.1.5 does not forbid it).
    props: node.props,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
  }
  await ctx.store.putNode(fresh)
  const docChildren = ctx.store.listEdges().filter((e) => e.kind === 'doc-child' && e.source === params.nodeId)
  // L3 — the new doc-child order is max(existing doc-child orders) + 1, so a
  // non-contiguous existing order set does not collide.
  const order = docChildren.reduce((max, e) => Math.max(max, e.order ?? 0), -1) + 1
  const edge: RagEdge = {
    id: `e-${randomUUID()}`,
    kind: 'doc-child',
    source: params.nodeId,
    target: newId,
    order,
    createdAt: now,
    updatedAt: now,
  }
  await ctx.store.putEdge(edge)
  return { ok: true, nodes: [original, fresh], edge }
}

/** Merge `sourceId` into `targetId`. A STRUCTURAL op → journaled → re-traversal.
 *  Target content = `target.content + source.content`; source's children are
 *  re-parented to target; source is deleted. */
export async function mergeNode(ctx: EditOpContext, params: { sourceId: string; targetId: string }): Promise<MergeNodeResult> {
  if (params.sourceId === params.targetId) {
    return { ok: false, error: 'edit.merge_node: cannot merge a node into itself' }
  }
  const source = ctx.store.getNode(params.sourceId)
  const target = ctx.store.getNode(params.targetId)
  if (!source || !target) {
    return { ok: false, error: 'edit.merge_node: source/target not found' }
  }
  // H4 — validate BEFORE mutating: if target is a descendant of source (or a
  // doc-child of source), re-parenting source's children to target would create
  // a self-referential edge. Return a domain result (never throw) and leave the
  // store untouched (no partial mutation).
  if (isDescendant(ctx.store, params.sourceId, params.targetId)) {
    return { ok: false, error: 'edit.merge_node: cannot merge a node into its own subtree' }
  }
  // Finding 2 (Unit B) — reject a merge whose source carries a doc-flow role
  // (the source of a `doc-head`/`doc-end` edge) or is mid-chain (the target of
  // a `next-section` edge). Merging such a source would break the document's
  // next-section chain (a predecessor's next-section would dangle at the
  // deleted source) or leave the document headless/endless. The transfer of
  // incoming next-section + doc-head/doc-end role edges is NOT attempted (a
  // chain rewire is error-prone); a domain rejection is the safe, documented
  // fail-state. Validate BEFORE mutating — no partial mutation.
  const docFlowRole = ctx.store.listEdges().some(
    (e) => (e.kind === 'doc-head' || e.kind === 'doc-end') && e.source === params.sourceId,
  )
  const midChain = ctx.store.listEdges().some(
    (e) => e.kind === 'next-section' && e.target === params.sourceId,
  )
  if (docFlowRole || midChain) {
    return { ok: false, error: 'edit.merge_node: cannot merge a node that carries a doc-flow role or is mid-chain' }
  }
  // 1. target content = target.content + source.content
  const updatedTarget = await ctx.store.putNode({ ...target, content: target.content + source.content })
  // 2. re-parent source's parent-child children to target (L4 — skip if target
  //    already has an edge to the same child)
  for (const e of ctx.store.listEdges().filter((x) => x.kind === 'parent-child' && x.source === params.sourceId)) {
    const targetHasChild = ctx.store.listEdges().some((te) => te.kind === 'parent-child' && te.source === params.targetId && te.target === e.target)
    if (!targetHasChild) {
      await ctx.store.putEdge({ id: `e-${randomUUID()}`, kind: 'parent-child', source: params.targetId, target: e.target, createdAt: e.createdAt, updatedAt: new Date().toISOString() })
    }
    await ctx.store.removeEdge(e.id)
  }
  // 3. re-parent source's doc-child children to target (appended at the end of
  //    target's doc-children; L4 — skip if target already has the child)
  let order = ctx.store.listEdges().filter((x) => x.kind === 'doc-child' && x.source === params.targetId).reduce((max, e) => Math.max(max, e.order ?? 0), -1) + 1
  for (const e of ctx.store.listEdges().filter((x) => x.kind === 'doc-child' && x.source === params.sourceId)) {
    const targetHasChild = ctx.store.listEdges().some((te) => te.kind === 'doc-child' && te.source === params.targetId && te.target === e.target)
    if (!targetHasChild) {
      await ctx.store.putEdge({ id: `e-${randomUUID()}`, kind: 'doc-child', source: params.targetId, target: e.target, order, createdAt: e.createdAt, updatedAt: new Date().toISOString() })
      order++
    }
    await ctx.store.removeEdge(e.id)
  }
  // 4. transfer source's next-section edges to target (target's wins if it has
  //    one in the same document; otherwise the source's is transferred)
  for (const e of ctx.store.listEdges().filter((x) => x.kind === 'next-section' && x.source === params.sourceId)) {
    const targetHasNext = ctx.store.listEdges().some((te) => te.kind === 'next-section' && te.source === params.targetId && sameDocIds(te.documentIds, e.documentIds))
    if (!targetHasNext) {
      await ctx.store.putEdge({ id: `e-${randomUUID()}`, kind: 'next-section', source: params.targetId, target: e.target, documentIds: e.documentIds, createdAt: e.createdAt, updatedAt: new Date().toISOString() })
    }
    await ctx.store.removeEdge(e.id)
  }
  // 5. delete source + cascade its remaining edges
  await ctx.store.removeNode(params.sourceId)
  return { ok: true, target: updatedTarget }
}

/** Create/update a RAG edge. A STRUCTURAL op → journaled → re-traversal. */
export async function setEdge(ctx: EditOpContext, params: { kind: string; source: string; target: string; edgeId?: string; order?: number; documentIds?: string[] }): Promise<SetEdgeResult> {
  if (!RAG_EDGE_KINDS.has(params.kind)) {
    return { ok: false, error: 'edit.set_edge: invalid kind' }
  }
  if (params.source === params.target) {
    return { ok: false, error: 'edit.set_edge: self-referential edge' }
  }
  // M3 — `order` must be a number when given (a non-number would throw an
  // uncaught store error on write).
  if (params.order !== undefined && typeof params.order !== 'number') {
    return { ok: false, error: 'edit.set_edge: order must be a number' }
  }
  if (params.order !== undefined && params.kind !== 'doc-child') {
    return { ok: false, error: 'edit.set_edge: order only valid on doc-child' }
  }
  // M1 — `documentIds` must be a string array when given (a non-array would
  // throw an uncaught store error on write).
  if (params.documentIds !== undefined && (!Array.isArray(params.documentIds) || params.documentIds.some((x) => typeof x !== 'string'))) {
    return { ok: false, error: 'edit.set_edge: documentIds must be a string array' }
  }
  if (!ctx.store.getNode(params.source) || !ctx.store.getNode(params.target)) {
    return { ok: false, error: 'edit.set_edge: source/target node not found or quarantined' }
  }
  if (params.edgeId !== undefined) {
    const existing = ctx.store.getEdge(params.edgeId)
    if (!existing) {
      return { ok: false, error: 'edit.set_edge: edge not found' }
    }
    const updated: RagEdge = {
      ...existing,
      kind: params.kind as RagEdgeKind,
      source: params.source,
      target: params.target,
      order: params.order,
      documentIds: params.documentIds,
      updatedAt: new Date().toISOString(),
    }
    const result = await ctx.store.putEdge(updated)
    return { ok: true, edge: result }
  }
  const now = new Date().toISOString()
  const edge: RagEdge = {
    id: `e-${randomUUID()}`,
    kind: params.kind as RagEdgeKind,
    source: params.source,
    target: params.target,
    order: params.order,
    documentIds: params.documentIds,
    createdAt: now,
    updatedAt: now,
  }
  const result = await ctx.store.putEdge(edge)
  return { ok: true, edge: result }
}

/** Unit D §5.1.10 — the UI commit-on-blur write-back result. Calls the SAME
 *  edit op (`setContent`) as the MCP tool (MCP/UI equivalence — §5.7) and maps
 *  the op's domain result to the `EditCommitResult` shape the renderer's
 *  injected commit surfaces. Finding 4: a deleted-node race (the renderer's M9
 *  guard prevents the common case, but the race window is unhandled) surfaces
 *  as `reason:'deleted-node'` (NOT `store-error`) when `setContent` returns its
 *  documented `'edit.set_content: node not found'` fail-state. PURE — no
 *  Electron; the caller (main) performs the broadcast + index reconcile on
 *  success. */
export async function handleEditCommit(
  store: RagStore,
  payload: { nodeId: string; content: string },
): Promise<EditCommitResult> {
  const result = await setContent({ store }, { nodeId: payload.nodeId, content: payload.content })
  if (result.ok) {
    return { ok: true, nodeId: payload.nodeId }
  }
  if (result.error === 'edit.set_content: node not found') {
    return { ok: false, reason: 'deleted-node', error: result.error }
  }
  return { ok: false, reason: 'store-error', error: result.error }
}
