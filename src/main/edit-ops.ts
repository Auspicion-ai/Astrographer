// src/main/edit-ops.ts — Unit D: the edit ops (docs/specs/unit-d-editing.md
// §5.1). Pure async functions over the RagStore INTERFACE (Unit A §5.4 —
// SOURCE-SWITCHABLE), never the concrete JSON store. Each op returns a
// discriminated result: `{ ok: true, ... }` on success, `{ ok: false, error }`
// on a domain failure. Ops NEVER throw for domain failures; the ONLY throw
// path is a store-level failure the op does not catch (e.g. a malformed record
// reaching putNode), which propagates to the caller (the MCP handler).
import { randomUUID } from 'node:crypto'
import type { RagStore, RagNode, RagEdge, RagNodeType, RagEdgeKind, RagNodeChild, BatchResult, BatchOp, BatchOpResult } from './rag-store.js'
import type { EditCommitResult, EditBatchPayload, RichCommitResult, EditRichCommitPayload } from '../shared/types.js'
import type { RagStoreChangedPayload } from './preload.js'

// Unit P (docs/specs/unit-p-ipc-edit-batch.md §5.1) — re-export the batch
// channel's payload + result types so the shared handler's callers (the IPC
// handler in main.ts, the preload bridge) import them from one place.
export type { EditBatchPayload, BatchResult }

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
// Unit O — the three rich-text edit-op result types (docs/specs/unit-o-edit-ops.md
// §5.1). Each is a discriminated result: `{ ok: true, node }` on success,
// `{ ok: false, error }` on a domain failure.
export type SetPropsResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type SetSubtreeResult = { ok: true; node: RagNode } | { ok: false; error: string }
export type SetTypeResult = { ok: true; node: RagNode } | { ok: false; error: string }
// Unit U5 §1.2 — the atomic rich-text write-back result.
export type SetRichTextResult = { ok: true; node: RagNode } | { ok: false; error: string }

// The closed unions (Unit A §5.1). Duplicated here as runtime sets because the
// store does not export them; the store validates the same unions at write time.
const RAG_NODE_TYPES = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div'])
const RAG_EDGE_KINDS = new Set<string>(['parent-child', 'doc-head', 'next-section', 'doc-end', 'doc-child', 'crosslink'])
// Unit M §5.1 — the inline rich-text child types (strong/em/a/img). `span` is
// NOT a child type (a diff-matching artifact folded into the parent's content).
const RAG_NODE_CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])
// Unit A §5.1 / Unit M §5.4 — the prototype-pollution keys the store rejects.
const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])

// True if any key anywhere in the value is a prototype-pollution key — mirrors
// the store's `hasDangerousKey` (Unit A §5.1 / Unit M §5.4) so the ops surface
// a dangerous-key prop/child as a domain result instead of an uncaught store
// throw at write time.
function hasDangerousKey(value: unknown, depth = 0): boolean {
  // F4 — bounded recursion: a deeply-nested props/children object must not
  // overflow the call stack (a RangeError would violate the never-throw rule).
  // At the depth limit, treat the value as dangerous (reject) — conservative.
  if (depth > 100) return true
  if (Array.isArray(value)) return value.some((v) => hasDangerousKey(v, depth + 1))
  if (value !== null && typeof value === 'object') {
    const proto = Object.getPrototypeOf(value)
    if (proto !== null && proto !== Object.prototype) {
      const ctor = (proto as { constructor?: unknown }).constructor
      if (ctor === Object || ctor === undefined) return true
    }
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true
      if (hasDangerousKey((value as Record<string, unknown>)[key], depth + 1)) return true
    }
  }
  return false
}

// True for a valid `RagNodeChild[]` (or undefined) — mirrors the store's
// `children` validation branch (Unit M §5.4): a non-array, a non-object child,
// a `span`/unknown/non-string child `type`, a missing/non-string child
// `content`, a null/array/non-object child `props`, or a dangerous key in a
// child's `props`/on the child itself is invalid.
function isValidChildren(v: unknown): boolean {
  if (v === undefined) return true
  if (!Array.isArray(v)) return false
  for (const c of v) {
    if (c === null || typeof c !== 'object' || Array.isArray(c)) return false
    if (hasDangerousKey(c)) return false
    const child = c as { type?: unknown; content?: unknown; props?: unknown }
    if (typeof child.type !== 'string' || !RAG_NODE_CHILD_TYPES.has(child.type)) return false
    if (typeof child.content !== 'string') return false
    if (child.props !== undefined && (child.props === null || typeof child.props !== 'object' || Array.isArray(child.props))) return false
    if (child.props !== undefined && hasDangerousKey(child.props)) return false
  }
  return true
}

// Deep structural equality (used to detect a no-op setProps — an empty merge
// that changes no key, and the `setRichText`/`setSubtree` no-op + broadcast
// children comparison). F4 — bounded recursion: a pathologically deep props /
// children object must not overflow the call stack (a RangeError out of the op
// would violate the never-throw rule). At the depth limit, treat the pair as
// UNEQUAL (conservative — a no-op comparison yields "changed", so the op
// proceeds with a write rather than mis-declaring equality on a deep structure),
// mirroring `hasDangerousKey`'s depth cap at 100.
function deepEqual(a: unknown, b: unknown, depth = 0): boolean {
  if (a === b) return true
  if (depth > 100) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((x, i) => deepEqual(x, b[i], depth + 1))
  }
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as Record<string, unknown>)
    const kb = Object.keys(b as Record<string, unknown>)
    if (ka.length !== kb.length) return false
    return ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], depth + 1))
  }
  return false
}

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
  // G1 — `documentIds` elements must be NON-EMPTY strings (the store's
  // `validateEdgeShape` rejects empty strings, which would throw an uncaught
  // store error on write). Return a domain result (never throw), mirroring the
  // store's rule.
  if (params.documentIds !== undefined && params.documentIds.some((x) => x === '')) {
    return { ok: false, error: 'edit.set_edge: documentIds must be a non-empty string array' }
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

/** Unit P §5.1 — the shared `IPC_EDIT_BATCH` handler. Validates the payload
 *  (a non-object payload or a non-array `ops` is a domain result, never a
 *  throw — A1) and calls `ragStore.applyBatch(payload.ops)` (Unit N — the SAME
 *  transaction primitive as the MCP `edit.batch` tool, MCP/UI equivalence
 *  §8.2 BINDING), returning the `BatchResult` verbatim. NEVER throws for a
 *  domain failure. PURE — no Electron; the caller (main) performs the broadcast
 *  + index reconcile on success. */
export async function handleEditBatch(
  store: RagStore,
  payload: EditBatchPayload,
): Promise<BatchResult> {
  if (!payload || !Array.isArray(payload.ops)) {
    return { ok: false, error: 'edit-batch: ops must be an array', failedIndex: 0 }
  }
  return store.applyBatch(payload.ops)
}

// ---- Unit O: the rich-text edit ops (docs/specs/unit-o-edit-ops.md) ---------

/** Set a RAG node's props by MERGE — only the named keys in `props` are
 *  updated; the node's existing props (including the `data-doc-head` marker)
 *  are preserved. A CONTENT op → journaled as a `content` entry (the content
 *  snapshot includes `props` — Unit A §5.6) → re-traversal. An empty `setProps`
 *  (no keys changed) is a NO-OP — no write, no journal entry. */
export async function setProps(ctx: EditOpContext, params: { nodeId: string; props: Record<string, unknown> }): Promise<SetPropsResult> {
  if (params.props === null || typeof params.props !== 'object' || Array.isArray(params.props)) {
    return { ok: false, error: 'edit.set_props: props must be an object' }
  }
  if (hasDangerousKey(params.props)) {
    return { ok: false, error: 'edit.set_props: props contains a dangerous key' }
  }
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_props: node not found' }
  }
  const merged = { ...node.props, ...params.props }
  // A no-op merge (no keys changed) performs NO write and records NO journal
  // entry (F1/F6). F1 — an empty merge is a no-op even when the node has no
  // props (merged `{}` vs `undefined` would not deep-equal).
  if (Object.keys(params.props).length === 0 || deepEqual(merged, node.props)) {
    return { ok: true, node }
  }
  // putNode preserves createdAt and refreshes updatedAt (Unit A §5.1); the
  // store's validateNodeShape re-validates the merged props at write time
  // (throw — the ONLY throw path).
  const updated = await ctx.store.putNode({ ...node, props: merged })
  return { ok: true, node: updated }
}

/** Replace a RAG node's inline `children` (the `RagNodeChild[]` field added in
 *  Unit M) with a new array. A CONTENT op → journaled as a `content` entry (the
 *  content snapshot includes `children` — Unit M §5.5) → re-traversal. */
export async function setSubtree(ctx: EditOpContext, params: { nodeId: string; children: RagNodeChild[] }): Promise<SetSubtreeResult> {
  // F2 — `children` is REQUIRED (a `RagNodeChild[]`); `undefined` is a non-array
  // and is a fail-state (only `[]` clears children). `isValidChildren` treats
  // `undefined` as "no children", so reject it explicitly here.
  if (params.children === undefined || !isValidChildren(params.children)) {
    return { ok: false, error: 'edit.set_subtree: children required/invalid' }
  }
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_subtree: node not found' }
  }
  // putNode preserves createdAt and refreshes updatedAt (Unit A §5.1); the
  // store's validateNodeShape re-validates the children at write time (throw —
  // the ONLY throw path).
  const updated = await ctx.store.putNode({ ...node, children: params.children })
  return { ok: true, node: updated }
}

/** Change a RAG node's `type`. NEVER delete+create: the node's id, content,
 *  children, props, and ownedNodeIds are all preserved; only `type` changes. A
 *  STRUCTURAL op → journaled as a `node-update` entry (the type change — Unit A
 *  §5.6) → re-traversal. A same-type `setType` is a NO-OP — no write, no journal
 *  entry. */
export async function setType(ctx: EditOpContext, params: { nodeId: string; type: RagNodeType }): Promise<SetTypeResult> {
  if (typeof params.type !== 'string' || !RAG_NODE_TYPES.has(params.type)) {
    return { ok: false, error: 'edit.set_type: invalid type' }
  }
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_type: node not found' }
  }
  // A same-type setType is a NO-OP — no write, no journal entry (F1/F6).
  if (node.type === params.type) {
    return { ok: true, node }
  }
  // putNode preserves createdAt and refreshes updatedAt (Unit A §5.1); the
  // store's validateNodeShape re-validates the type at write time (throw — the
  // ONLY throw path). The node id is STABLE — no delete+create.
  const updated = await ctx.store.putNode({ ...node, type: params.type })
  return { ok: true, node: updated }
}

// ---- Unit P: the batch broadcast derivation (docs/specs/unit-p-ipc-edit-batch.md
// §5.4) — a PURE helper (exported for direct unit testing). Derives the
// `rag-store-changed` payload from a successful batch. Deterministic (A6): the
// same batch + pre-batch snapshot always produces the same payload. Lives here
// (not main.ts) so it is node-testable without importing electron. ------------

function sameOwned(a: string[] | undefined, b: string[] | undefined): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  if (a.length !== b.length) return false
  return a.every((x, i) => x === b[i])
}

export function deriveBatchBroadcast(
  ops: BatchOp[],
  results: BatchOpResult[],
  preBatchNodes: Map<string, RagNode>,
): RagStoreChangedPayload {
  const nodeIds: string[] = []
  const edgeIds: string[] = []
  let structural = false
  const pushNode = (id: string) => { if (!nodeIds.includes(id)) nodeIds.push(id) }
  const pushEdge = (id: string) => { if (!edgeIds.includes(id)) edgeIds.push(id) }
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i]
    const result = results[i]
    switch (op.op) {
      case 'putNode': {
        pushNode(op.node.id)
        const pre = preBatchNodes.get(op.node.id)
        // F2 — guard `result` (a successful batch returns one result per op, but
        // the helper is exported for direct unit testing and must not throw on a
        // short/null results array).
        const after = result && result.op === 'putNode' ? result.node : op.node
        // A putNode is structural when it CREATES a node (no pre-batch node) or
        // changes type/ownedNodeIds; otherwise it is content.
        if (!pre || pre.type !== after.type || !sameOwned(pre.ownedNodeIds, after.ownedNodeIds)) {
          structural = true
        }
        break
      }
      case 'removeNode':
        pushNode(op.id)
        structural = true
        break
      case 'putEdge':
        pushNode(op.edge.source)
        pushNode(op.edge.target)
        if (result && result.op === 'putEdge') pushEdge(result.edge.id)
        structural = true
        break
      case 'removeEdge':
        pushEdge(op.id)
        structural = true
        break
      case 'setProps':
      case 'setSubtree':
      case 'setType':
        // Forward-looking rich-text ops — never reach a successful batch in the
        // current code (applyBatch rejects them, §5.2). If one did, treat it as
        // structural (conservative).
        structural = true
        break
    }
  }
  return { kind: structural ? 'structural' : 'content', nodeIds, edgeIds }
}

// ---- Unit U5: the atomic rich-text write-back op + broadcast helper
// (docs/specs/unit-u5-set-rich-text.md §1.2) ------------------------------

/** The `undefined` ≡ `[]` children equivalence used for the no-op guard AND the
 *  broadcast derivation (stored `undefined` and `[]` are both "no children"). */
function sameChildren(a: RagNodeChild[] | undefined, b: RagNodeChild[] | undefined): boolean {
  return deepEqual(a ?? [], b ?? [])
}

/** Unit U5 §1.2 — the SINGLE atomic rich-text write-back op. Writes BOTH
 *  `content` AND `children` for a node in ONE `putNode` (one record write, one
 *  `content` journal entry). Content-only / children-only ops (Unit O) cannot
 *  write the pair atomically — this op can. A CONTENT op → journaled as a
 *  `content` entry (the content snapshot includes `children`+`props`) → the
 *  main handler derives the broadcast via `deriveRichCommitBroadcast`. */
export async function setRichText(
  ctx: EditOpContext,
  params: { nodeId: string; content: string; children: RagNodeChild[] },
): Promise<SetRichTextResult> {
  if (typeof params.content !== 'string') {
    return { ok: false, error: 'edit.set_rich_text: content must be a string' }
  }
  // `children` is REQUIRED (a `RagNodeChild[]`) — `undefined`/absent is a
  // fail-state (only `[]` clears); the deeper shape is validated by
  // `isValidChildren` (mirrors `setSubtree` Unit O F2).
  if (params.children === undefined || !isValidChildren(params.children)) {
    return { ok: false, error: 'edit.set_rich_text: children required/invalid' }
  }
  const node = ctx.store.getNode(params.nodeId)
  if (!node) {
    return { ok: false, error: 'edit.set_rich_text: node not found' }
  }
  const contentChanged = node.content !== params.content
  const childrenChanged = !sameChildren(node.children, params.children)
  // Idempotent no-op (content AND children both unchanged, `undefined` ≡ `[]`):
  // NO write, NO journal entry, NO `updatedAt` refresh, NO broadcast (the
  // redundant blur does not re-derive). Short-circuits BEFORE putNode.
  if (!contentChanged && !childrenChanged) {
    return { ok: true, node }
  }
  // When the children are EQUIVALENT but content changed, preserve the stored
  // children representation (a node with `children: undefined` stays undefined;
  // no `undefined`→`[]` normalization noise on a content-only edit).
  const nextChildren = childrenChanged ? params.children : node.children
  // ONE `putNode` carries BOTH `content` and `children` — atomic (decision A).
  // The ONLY throw path is a store-level validateNodeShape failure (unreachable
  // in practice), which propagates — the write is atomic, so NEITHER field is
  // applied on a throw (fail-closed).
  const updated = await ctx.store.putNode({ ...node, content: params.content, children: nextChildren })
  return { ok: true, node: updated }
}

/** Unit U5 §1.2 — derive the `rag-store-changed` payload from a successful
 *  `setRichText`. Returns null for a no-op commit (content AND children both
 *  unchanged → NO broadcast → no redundant re-derive). A `children` change is
 *  tagged `structural` (children → traversal re-derives the inline subtree —
 *  mirrors `deriveBatchBroadcast`'s conservative `structural` tag for
 *  `setSubtree`); a content-only change is `content`. A combined change is
 *  `structural` (the structural reconcile re-indexes content too — so BOTH the
 *  content change AND the structural children change are reflected). */
export function deriveRichCommitBroadcast(
  before: RagNode,
  after: RagNode,
): RagStoreChangedPayload | null {
  const contentChanged = before.content !== after.content
  const childrenChanged = !sameChildren(before.children, after.children)
  if (!contentChanged && !childrenChanged) {
    return null // no-op — no broadcast
  }
  const kind = childrenChanged ? 'structural' : 'content'
  return { kind, nodeIds: [after.id], edgeIds: [] }
}

/** Unit U5 §1.3 — the shared `IPC_EDIT_RICH_COMMIT` handler. Calls the SAME
 *  `setRichText` op as the bridge (MCP/UI-equivalent by construction — though
 *  there is NO MCP rich tool yet, amendment 7) and maps the op's domain result
 *  to the `RichCommitResult` shape. `setRichText`'s documented
 *  `'edit.set_rich_text: node not found'` fail-state (a deleted-node race)
 *  surfaces as `reason:'deleted-node'` (NOT `store-error`), mirroring
 *  `handleEditCommit`. PURE — the caller (main) performs the broadcast + index
 *  reconcile on success. */
export async function handleRichCommit(
  store: RagStore,
  payload: EditRichCommitPayload,
): Promise<RichCommitResult> {
  const result = await setRichText({ store }, { nodeId: payload.nodeId, content: payload.content, children: payload.children })
  if (result.ok) {
    return { ok: true, nodeId: payload.nodeId, node: result.node }
  }
  if (result.error === 'edit.set_rich_text: node not found') {
    return { ok: false, reason: 'deleted-node', error: result.error }
  }
  return { ok: false, reason: 'store-error', error: result.error }
}

/** The Electron boundary the `IPC_EDIT_RICH_COMMIT` handler injects into
 *  `handleRichCommitIpc`: the retrieval-index reconcile + the
 *  `rag-store-changed` broadcast (Unit U5 §1.3 — §2.1 states 24-27). Both
 *  consume the SAME `{kind, nodeIds, edgeIds}` derived from
 *  `deriveRichCommitBroadcast`. */
export interface RichCommitIpcDeps {
  /** Reconcile the maintained retrieval index (main passes
   *  `retrievalEngine.onStoreChanged`). This wrapper `.catch`es a rejection —
   *  reconcile failure is NON-FATAL: the broadcast still fires, never an
   *  unhandled rejection (ADR-11 / §2.1 state 27). */
  reconcile: (kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]) => Promise<void>
  /** Broadcast `rag-store-changed` (main passes `backend.broadcast`). */
  broadcast: (kind: 'content' | 'structural', nodeIds: string[], edgeIds: string[]) => void
}

/** Unit U5 §1.3/F1 — a node-testable extraction of the `IPC_EDIT_RICH_COMMIT`
 *  handler's derive→reconcile→broadcast-once body (docs/specs/unit-u5-set-rich-text.md
 *  §2.1 states 24-27 + ADR-2/3/11). PURE-ish — no Electron: the Electron
 *  boundary (`retrievalEngine.onStoreChanged` + `backend.broadcast`) is
 *  injected as the `reconcile`/`broadcast` callbacks. This is the F1
 *  handler-broadcast regression surface:
 *   - a REAL change → reconcile + broadcast EXACTLY ONCE (kind routed
 *     structural vs content by `deriveRichCommitBroadcast`);
 *   - a no-op / failed / malformed commit → 0 reconciles, 0 broadcasts;
 *   - a rejecting `reconcile` is NON-FATAL — the broadcast still fires (never
 *     an unhandled rejection);
 *   - F2 (ADR-9) — an exotic node-absent→recreated race that makes `before`
 *     undefined while `result.ok` NEVER throws: the derive is guarded so the
 *     handler falls back to NO broadcast instead of a TypeError.
 * The A1 boundary check is KEPT here (a malformed payload is a domain result,
 * never a throw). */
export async function handleRichCommitIpc(
  store: RagStore,
  payload: EditRichCommitPayload,
  deps: RichCommitIpcDeps,
): Promise<RichCommitResult> {
  // A1 — a malformed payload is a domain result, never a throw. The boundary
  // check covers nodeId/content/children-presence; the deeper children SHAPE is
  // validated inside setRichText (isValidChildren) and mapped to store-error.
  if (!payload || typeof payload.nodeId !== 'string' || typeof payload.content !== 'string' || !Array.isArray(payload.children)) {
    return { ok: false, reason: 'store-error', error: 'edit-rich-commit: nodeId, content, and children array required' }
  }
  // Capture the pre-commit node for the broadcast derivation (idempotence + kind).
  const before = store.getNode(payload.nodeId)
  const result = await handleRichCommit(store, payload)
  if (result.ok) {
    // F2 (ADR-9) — the `before`-guard: an exotic node-absent→recreated race can
    // make `before` undefined while `result.ok` (the node was recreated between
    // the entry capture and `setRichText`). Guard the derive so the handler
    // NEVER throws a TypeError in that window — it falls back to NO broadcast
    // (the store change still landed; the redundant re-derive trigger is
    // skipped, conservative).
    const broadcast = before ? deriveRichCommitBroadcast(before as RagNode, result.node) : null
    if (broadcast) {
      // ADR-11 / state 27 — reconcile failure is NON-FATAL: caught + logged,
      // the broadcast still fires, never an unhandled rejection.
      void deps.reconcile(broadcast.kind, broadcast.nodeIds, broadcast.edgeIds).catch((e) => {
        console.error('[provident-main] retrieval index reconcile failed:', e)
      })
      deps.broadcast(broadcast.kind, broadcast.nodeIds, broadcast.edgeIds)
    }
  }
  return result
}
