// src/main/rag-store.ts — Unit A: the RAG store persistence module
// (docs/specs/unit-a-rag-store.md). Mirrors the foundation's createModuleStore
// pattern (src/main/module-store.ts): read-on-boot / write-through JSON, atomic
// write (temp + rename), fail-disabled boot (corrupt/missing file → empty store
// + corrupt flag, never throws), and hash-verified source (SHA-256 always
// derived at write, re-verified on boot; mismatch → quarantined + excluded from
// loaded). Extends it with two record kinds (nodes + edges), a single-writer
// write queue (enqueue), and a persisted project journal with invertible
// entries.
//
// Adversarial hardening (HOST findings, fixed here + regression-tested):
//   - ALL mutating methods (putNode/removeNode/putEdge/removeEdge/undo/redo)
//     are async and route their work through the single-writer queue, so a
//     direct call cannot interleave with an in-flight enqueued write.
//   - props/documentIds are deep-copied on BOTH write and read (no aliasing;
//     a caller cannot mutate the store through a returned record).
//   - putEdge update journals kind/order/documentIds changes (doc-flow-role-
//     change for a pure kind change; edge-update for the general case).
//   - putNode update journals type/ownedNodeIds changes (node-update).
//   - Quarantined records are excluded from getNode/listNodes/getEdge/listEdges.
//   - An edge referencing a quarantined/missing node is itself quarantined at
//     boot; putEdge rejects quarantined endpoints.
//   - Boot validates journal-entry shapes and coerces cursor to an integer in
//     [0, journal.length].
//   - undo/redo do NOT advance the cursor when the inverse/forward op cannot be
//     applied (out-of-band record removal is surfaced, not swallowed).
//   - Per-kind order enforcement; documentIds allowed on ANY edge kind
//     (CROSS-DOCUMENT-SHARED — an edge can have multiple document owners);
//     createdAt preserved on update;
//     self-referential edges rejected; prototype-pollution keys rejected;
//     empty-string/duplicate ids rejected.
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs'
import { dirname } from 'node:path'
import { createHash } from 'node:crypto'

/** The RAG node element type — the provident element type the subtree root
 *  renders as. Closed union for the first slice. */
export type RagNodeType =
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'p' | 'ul' | 'ol' | 'li' | 'blockquote' | 'pre' | 'code'
  | 'strong' | 'em' | 'a' | 'img'
  | 'div'
  | 'table' | 'thead' | 'tr' | 'td' | 'th'

/** The inline rich-text child type — the closed union of inline formatting
 *  elements held on a RAG node's `children`. `span` is NOT here (a diff-matching
 *  artifact folded into the parent's `content`). */
export type RagNodeChildType = 'strong' | 'em' | 'a' | 'img'

/** An inline rich-text child of a RAG node. Held on the owning node's
 *  `children` field — NOT a separate RAG node, NOT part of `ownedNodeIds`. */
export interface RagNodeChild {
  type: RagNodeChildType
  /** The inline text content of the child. */
  content: string
  /** Arbitrary props (e.g. `href`/`src`/`alt` for `a`/`img`). Optional. */
  props?: Record<string, unknown>
}

/** A RAG node — one knowledge-graph object. OWNS a subtree of provident nodes
 *  (SUBTREE-OWNERSHIP). */
export interface RagNode {
  id: string
  type: RagNodeType
  content: string
  /** The inline rich-text children (strong/em/a/img) held ON this node — NOT
   *  separate RAG nodes (one-chunk-per-subtree preserved). OPTIONAL and
   *  ADDITIVE: a node without `children` is a plain-text node (the v1 default).
   *  `span` is NOT a child type — it is a diff-matching artifact folded into
   *  the parent's `content`. */
  children?: RagNodeChild[]
  props?: Record<string, unknown>
  ownedNodeIds: string[]
  createdAt: string
  updatedAt: string
}

/** The RAG edge kinds. Doc-flow kinds (doc-head/next-section/doc-end) are
 *  authoritative in the store; `doc-child` expresses hierarchical nesting;
 *  `crosslink` expresses a CROSS-DOCUMENT reference (a link from a node in one
 *  document to a node in another document). */
export type RagEdgeKind =
  | 'parent-child'
  | 'doc-head'
  | 'next-section'
  | 'doc-end'
  | 'doc-child'
  | 'crosslink'   // Unit G — a cross-document reference (source → target).

/** A RAG edge — a directed relationship between two RAG nodes. */
export interface RagEdge {
  id: string
  kind: RagEdgeKind
  source: string
  target: string
  order?: number
  documentIds?: string[]
  createdAt: string
  updatedAt: string
}

/** The invertible structural journal op. */
export type StructuralJournalOp =
  | { op: 'node-add'; node: RagNode }
  | { op: 'node-delete'; node: RagNode }
  | { op: 'node-update'; nodeId: string; before: RagNode; after: RagNode }
  | { op: 'edge-add'; edge: RagEdge }
  | { op: 'edge-remove'; edge: RagEdge }
  | { op: 'edge-retarget'; edgeId: string; before: { source: string; target: string }; after: { source: string; target: string } }
  | { op: 'edge-update'; edgeId: string; before: RagEdge; after: RagEdge }
  | { op: 'doc-flow-role-change'; edgeId: string; before: RagEdgeKind; after: RagEdgeKind }

/** A single edit operation a batch can carry. The four store primitives
 *  (putNode/removeNode/putEdge/removeEdge) are applied by THIS unit. The three
 *  rich-text ops (setProps/setSubtree/setType) are FORWARD-LOOKING (Unit O) —
 *  the batch op shape carries them so the rich-text machinery can apply a
 *  multi-op edit atomically, but their APPLICATION is Unit O; in THIS unit a
 *  batch containing one is a documented fail-state (§5.8). */
export type BatchOp =
  | { op: 'putNode'; node: RagNode }
  | { op: 'removeNode'; id: string }
  | { op: 'putEdge'; edge: RagEdge }
  | { op: 'removeEdge'; id: string }
  // Forward-looking rich-text ops (Unit O) — pinned in the TYPE now so Unit O
  // does not change the batch op shape; their application is Unit O.
  | { op: 'setProps'; nodeId: string; props: Record<string, unknown> }
  | { op: 'setSubtree'; nodeId: string; children: RagNodeChild[] }
  | { op: 'setType'; nodeId: string; type: RagNodeType }

/** The per-op result of a SUCCESSFUL batch — one entry per op, in order. The
 *  forward-looking rich-text ops (setProps/setSubtree/setType) never produce a
 *  result in THIS unit (a batch containing one is a fail-state). */
export type BatchOpResult =
  | { op: 'putNode'; node: RagNode }
  | { op: 'removeNode'; removed: boolean }
  | { op: 'putEdge'; edge: RagEdge }
  | { op: 'removeEdge'; removed: boolean }

/** The batch result — a DISCRIMINATED result. `applyBatch` NEVER throws for a
 *  domain failure (invalid op, malformed payload, referential failure,
 *  unsupported rich-text op, mid-batch failure); it returns `{ ok: false }`.
 *  On success, `results` has one `BatchOpResult` per op, in order. On failure,
 *  `failedIndex` is the index of the first failing op and `error` is the
 *  failure message; the store is rolled back to the pre-batch state. */
export type BatchResult =
  | { ok: true; results: BatchOpResult[] }
  | { ok: false; error: string; failedIndex: number }

/** A project journal entry — content (invertible by restore), structural
 *  (invertible by applying the inverse op), or batch (invertible by applying
 *  the reverse-ordered inverse ops). */
export type JournalEntry =
  | {
      kind: 'content'
      nodeId: string
      before: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      after: { content: string; children?: RagNodeChild[]; props?: Record<string, unknown> }
      at: string
    }
  | {
      kind: 'structural'
      op: StructuralJournalOp
      at: string
    }
  | {
      kind: 'batch'
      /** The forward ops (redo re-applies these, in order). */
      ops: BatchOp[]
      /** The inverse ops, in REVERSE order (undo applies these, in order). */
      inverse: BatchOp[]
      at: string
    }

export interface RagStoreStatus {
  corrupt: boolean
  quarantined: string[]
  loadedNodes: string[]
  loadedEdges: string[]
}

export interface RagStore {
  getNode(id: string): RagNode | undefined
  listNodes(): RagNode[]
  /** Create/update a node. Computes the hash from the record (never trusts
   *  input). Serialized through the write queue. */
  putNode(node: RagNode): Promise<RagNode>
  /** Remove a node. Returns true if it existed. Serialized. Also removes any
   *  edge whose source/target references the removed node (cascade). */
  removeNode(id: string): Promise<boolean>
  getEdge(id: string): RagEdge | undefined
  listEdges(): RagEdge[]
  /** Create/update an edge. Serialized. */
  putEdge(edge: RagEdge): Promise<RagEdge>
  /** Remove an edge. Returns true if it existed. Serialized. */
  removeEdge(id: string): Promise<boolean>
  status(): RagStoreStatus
  journal(): JournalEntry[]
  undo(): Promise<JournalEntry | null>
  redo(): Promise<JournalEntry | null>
  undoDepth(): number
  redoDepth(): number
  enqueue<T>(fn: () => T | Promise<T>): Promise<T>
  /** Apply a batch of edit operations ATOMICALLY (all or nothing). Serialized
   *  through the single-writer queue. A successful batch lands as a SINGLE
   *  `batch` journal entry and persists ONCE. On ANY op failure the WHOLE batch
   *  rolls back: the store's in-memory state is restored to the pre-batch
   *  state, the journal is not polluted, and no persist happens. Returns a
   *  discriminated result (NEVER throws for domain failures). Async. */
  applyBatch(ops: BatchOp[]): Promise<BatchResult>
}

export interface RagStoreOptions {
  path: string
  /** The project-journal cap (default 1000). When the journal exceeds this,
   *  the oldest entries are dropped (a boundary for `undo()`). */
  maxJournalLength?: number
}

// Internal stored records carry the SHA-256 hash + quarantine flag.
interface StoredNode extends RagNode { hash: string; quarantined?: boolean }
interface StoredEdge extends RagEdge { hash: string; quarantined?: boolean }

interface RagStoreFile {
  version: 1
  nodes: StoredNode[]
  edges: StoredEdge[]
  journal: JournalEntry[]
  cursor: number
}

const RAG_NODE_TYPES = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th'])
const RAG_NODE_CHILD_TYPES = new Set<string>(['strong', 'em', 'a', 'img'])
const RAG_EDGE_KINDS = new Set<string>(['parent-child', 'doc-head', 'next-section', 'doc-end', 'doc-child', 'crosslink'])
const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])
const DEFAULT_MAX_JOURNAL_LENGTH = 1000

function sha256(source: string): string {
  return createHash('sha256').update(source, 'utf8').digest('hex')
}

// A refreshed timestamp guaranteed to be strictly greater than `after` (so an
// update's updatedAt always differs from the prior value, even within the same
// millisecond).
function refreshTimestamp(after: string): string {
  const afterMs = Date.parse(after)
  const now = Date.now()
  const ms = Number.isFinite(afterMs) && now <= afterMs ? afterMs + 1 : now
  return new Date(ms).toISOString()
}

// ---- safe deep copy --------------------------------------------------------
// Returns a deep copy that can never be used to prototype-pollute: dangerous
// keys (__proto__/constructor/prototype) are dropped at every level. Used on
// BOTH write (store a copy) and read (return a copy) so a caller cannot mutate
// the store through a returned record.
function deepCopy<T>(value: T): T {
  if (Array.isArray(value)) return value.map((v) => deepCopy(v)) as unknown as T
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) continue
      out[key] = deepCopy((value as Record<string, unknown>)[key])
    }
    return out as T
  }
  return value
}

// True if any key anywhere in the value is a prototype-pollution key.
function hasDangerousKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasDangerousKey)
  if (value !== null && typeof value === 'object') {
    // A `__proto__` set via an object literal changes the object's prototype
    // away from Object.prototype (no own key is created), so it is invisible to
    // Object.keys. Detect that as a dangerous key too. F3 — scope the check to
    // actual `__proto__` pollution: only flag a PLAIN-object prototype that is
    // not Object.prototype (its constructor is Object). A legitimate non-plain
    // object (Date, class instance) has a non-plain prototype whose constructor
    // is not Object, so it is NOT flagged.
    const proto = Object.getPrototypeOf(value)
    if (proto !== null && proto !== Object.prototype) {
      const ctor = (proto as { constructor?: unknown }).constructor
      if (ctor === Object || ctor === undefined) return true
    }
    for (const key of Object.keys(value)) {
      if (DANGEROUS_KEYS.has(key)) return true
      if (hasDangerousKey((value as Record<string, unknown>)[key])) return true
    }
  }
  return false
}

function sameStringArray(a: string[] | undefined, b: string[] | undefined): boolean {
  if (a === undefined && b === undefined) return true
  if (a === undefined || b === undefined) return false
  if (a.length !== b.length) return false
  return a.every((x, i) => x === b[i])
}

// The hash is ALWAYS derived from the record's serialized source (never trusted
// from the caller). Field order is fixed so boot re-verification reproduces the
// exact source string.
function nodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    children: n.children, props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function nodeHash(n: RagNode): string { return sha256(nodeSource(n)) }

function edgeSource(e: RagEdge): string {
  return JSON.stringify({
    id: e.id, kind: e.kind, source: e.source, target: e.target,
    order: e.order, documentIds: e.documentIds,
    createdAt: e.createdAt, updatedAt: e.updatedAt,
  })
}
function edgeHash(e: RagEdge): string { return sha256(edgeSource(e)) }

// ---- shape validation ------------------------------------------------------

// True for a non-empty string that parses as a date (ISO-8601). The spec
// (§5.1) requires createdAt/updatedAt to be ISO-8601 strings; a record with a
// non-ISO value is rejected at write time and skipped at boot.
function isIso8601(v: unknown): v is string {
  return typeof v === 'string' && v !== '' && !Number.isNaN(Date.parse(v))
}

type NodeShapeResult = { ok: true; node: RagNode } | { ok: false; field: string }

function validateNodeShape(input: unknown): NodeShapeResult {
  if (input === null || typeof input !== 'object') return { ok: false, field: 'record' }
  const n = input as Partial<RagNode>
  if (typeof n.id !== 'string' || n.id === '') return { ok: false, field: 'id' }
  if (typeof n.type !== 'string' || !RAG_NODE_TYPES.has(n.type)) return { ok: false, field: 'type' }
  if (typeof n.content !== 'string') return { ok: false, field: 'content' }
  if (n.children !== undefined) {
    if (!Array.isArray(n.children)) return { ok: false, field: 'children' }
    for (const c of n.children) {
      if (c === null || typeof c !== 'object' || Array.isArray(c)) return { ok: false, field: 'children' }
      // F4 — reject a dangerous key on the child ITSELF (not just in its props),
      // so a `__proto__`-bearing child is rejected rather than silently stripped.
      if (hasDangerousKey(c)) return { ok: false, field: 'children' }
      if (typeof c.type !== 'string' || !RAG_NODE_CHILD_TYPES.has(c.type)) return { ok: false, field: 'children' }
      if (typeof c.content !== 'string') return { ok: false, field: 'children' }
      if (c.props !== undefined && (c.props === null || typeof c.props !== 'object' || Array.isArray(c.props))) return { ok: false, field: 'children' }
      if (c.props !== undefined && hasDangerousKey(c.props)) return { ok: false, field: 'children' }
    }
  }
  if (n.props !== undefined && (n.props === null || typeof n.props !== 'object' || Array.isArray(n.props))) return { ok: false, field: 'props' }
  if (n.props !== undefined && hasDangerousKey(n.props)) return { ok: false, field: 'props' }
  if (!Array.isArray(n.ownedNodeIds) || !n.ownedNodeIds.every((x) => typeof x === 'string')) return { ok: false, field: 'ownedNodeIds' }
  if (n.ownedNodeIds.some((x) => x === '')) return { ok: false, field: 'ownedNodeIds' }
  if (!isIso8601(n.createdAt)) return { ok: false, field: 'createdAt' }
  if (!isIso8601(n.updatedAt)) return { ok: false, field: 'updatedAt' }
  return {
    ok: true,
    node: {
      id: n.id, type: n.type as RagNodeType, content: n.content,
      children: n.children !== undefined ? deepCopy(n.children) : undefined,
      props: n.props !== undefined ? deepCopy(n.props) : undefined,
      ownedNodeIds: [...new Set(n.ownedNodeIds)],
      createdAt: n.createdAt, updatedAt: n.updatedAt,
    },
  }
}

type EdgeShapeResult = { ok: true; edge: RagEdge } | { ok: false; field: string }

function validateEdgeShape(input: unknown): EdgeShapeResult {
  if (input === null || typeof input !== 'object') return { ok: false, field: 'record' }
  const e = input as Partial<RagEdge>
  if (typeof e.id !== 'string' || e.id === '') return { ok: false, field: 'id' }
  if (typeof e.kind !== 'string' || !RAG_EDGE_KINDS.has(e.kind)) return { ok: false, field: 'kind' }
  if (typeof e.source !== 'string' || e.source === '') return { ok: false, field: 'source' }
  if (typeof e.target !== 'string' || e.target === '') return { ok: false, field: 'target' }
  if (e.source === e.target) return { ok: false, field: 'source' }
  if (e.order !== undefined && typeof e.order !== 'number') return { ok: false, field: 'order' }
  if (e.order !== undefined && e.kind !== 'doc-child') return { ok: false, field: 'order' }
  if (e.documentIds !== undefined && (!Array.isArray(e.documentIds) || !e.documentIds.every((x) => typeof x === 'string'))) return { ok: false, field: 'documentIds' }
  if (e.documentIds !== undefined && e.documentIds.some((x) => x === '')) return { ok: false, field: 'documentIds' }
  if (!isIso8601(e.createdAt)) return { ok: false, field: 'createdAt' }
  if (!isIso8601(e.updatedAt)) return { ok: false, field: 'updatedAt' }
  return {
    ok: true,
    edge: {
      id: e.id, kind: e.kind as RagEdgeKind, source: e.source, target: e.target,
      order: e.order, documentIds: e.documentIds !== undefined ? [...new Set(e.documentIds)] : undefined,
      createdAt: e.createdAt, updatedAt: e.updatedAt,
    },
  }
}

// ---- journal-entry shape validation (boot) ---------------------------------
// True for a valid RagNodeChild[] (or undefined). Mirrors the `children`
// validation branch of validateNodeShape.
function isValidChildren(v: unknown): boolean {
  if (v === undefined) return true
  if (!Array.isArray(v)) return false
  for (const c of v) {
    if (c === null || typeof c !== 'object' || Array.isArray(c)) return false
    const child = c as { type?: unknown; content?: unknown; props?: unknown }
    if (typeof child.type !== 'string' || !RAG_NODE_CHILD_TYPES.has(child.type)) return false
    if (typeof child.content !== 'string') return false
    if (child.props !== undefined && (child.props === null || typeof child.props !== 'object' || Array.isArray(child.props))) return false
    if (child.props !== undefined && hasDangerousKey(child.props)) return false
  }
  return true
}
function isContentSnapshot(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const s = v as { content?: unknown; children?: unknown; props?: unknown }
  if (typeof s.content !== 'string') return false
  if (!isValidChildren(s.children)) return false
  if (s.props !== undefined && (s.props === null || typeof s.props !== 'object' || Array.isArray(s.props))) return false
  // F1 — apply the prototype-pollution guard to the snapshot's `props` too, so
  // a journal content entry with a dangerous-key `props` is skipped at boot
  // (consistent with `validateNodeShape` at write).
  if (s.props !== undefined && hasDangerousKey(s.props)) return false
  return true
}
function isRagNode(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const n = v as Partial<RagNode>
  // F2 — mirror `validateNodeShape`: type in RAG_NODE_TYPES, non-empty id,
  // `props` object + dangerous-key guard, `ownedNodeIds` all non-empty strings.
  return typeof n.id === 'string' && n.id !== '' &&
    typeof n.type === 'string' && RAG_NODE_TYPES.has(n.type) &&
    typeof n.content === 'string' &&
    isValidChildren(n.children) &&
    (n.props === undefined || (typeof n.props === 'object' && !Array.isArray(n.props) && !hasDangerousKey(n.props))) &&
    Array.isArray(n.ownedNodeIds) && n.ownedNodeIds.every((x) => typeof x === 'string' && x !== '') &&
    isIso8601(n.createdAt) && isIso8601(n.updatedAt)
}
function isRagEdge(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const e = v as Partial<RagEdge>
  return typeof e.id === 'string' && typeof e.kind === 'string' && typeof e.source === 'string' &&
    typeof e.target === 'string' && isIso8601(e.createdAt) && isIso8601(e.updatedAt)
}
function isSrcTgt(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const s = v as { source?: unknown; target?: unknown }
  return typeof s.source === 'string' && typeof s.target === 'string'
}
function isValidStructuralOp(op: unknown): boolean {
  if (op === null || typeof op !== 'object') return false
  const o = op as { op?: unknown }
  switch (o.op) {
    case 'node-add': return isRagNode((op as { node?: unknown }).node)
    case 'node-delete': return isRagNode((op as { node?: unknown }).node)
    case 'node-update': {
      const u = op as { nodeId?: unknown; before?: unknown; after?: unknown }
      return typeof u.nodeId === 'string' && isRagNode(u.before) && isRagNode(u.after)
    }
    case 'edge-add': return isRagEdge((op as { edge?: unknown }).edge)
    case 'edge-remove': return isRagEdge((op as { edge?: unknown }).edge)
    case 'edge-retarget': {
      const r = op as { edgeId?: unknown; before?: unknown; after?: unknown }
      return typeof r.edgeId === 'string' && isSrcTgt(r.before) && isSrcTgt(r.after)
    }
    case 'edge-update': {
      const u = op as { edgeId?: unknown; before?: unknown; after?: unknown }
      return typeof u.edgeId === 'string' && isRagEdge(u.before) && isRagEdge(u.after)
    }
    case 'doc-flow-role-change': {
      const d = op as { edgeId?: unknown; before?: unknown; after?: unknown }
      return typeof d.edgeId === 'string' && typeof d.before === 'string' && typeof d.after === 'string'
    }
    default: return false
  }
}
function isValidBatchOp(op: unknown): boolean {
  if (op === null || typeof op !== 'object') return false
  const o = op as { op?: unknown }
  switch (o.op) {
    case 'putNode': return validateNodeShape((op as { node?: unknown }).node).ok
    case 'removeNode': {
      const id = (op as { id?: unknown }).id
      return typeof id === 'string' && id !== ''
    }
    case 'putEdge': return validateEdgeShape((op as { edge?: unknown }).edge).ok
    case 'removeEdge': {
      const id = (op as { id?: unknown }).id
      return typeof id === 'string' && id !== ''
    }
    case 'setProps': {
      const s = op as { nodeId?: unknown; props?: unknown }
      return typeof s.nodeId === 'string' && s.nodeId !== '' &&
        s.props !== null && typeof s.props === 'object' && !Array.isArray(s.props)
    }
    case 'setSubtree': {
      const s = op as { nodeId?: unknown; children?: unknown }
      return typeof s.nodeId === 'string' && s.nodeId !== '' && isValidChildren(s.children)
    }
    case 'setType': {
      const s = op as { nodeId?: unknown; type?: unknown }
      return typeof s.nodeId === 'string' && s.nodeId !== '' &&
        typeof s.type === 'string' && RAG_NODE_TYPES.has(s.type)
    }
    default: return false
  }
}
function isValidJournalEntry(input: unknown): input is JournalEntry {
  if (input === null || typeof input !== 'object') return false
  const e = input as Partial<JournalEntry>
  if (e.kind === 'content') {
    const c = e as { nodeId?: unknown; before?: unknown; after?: unknown; at?: unknown }
    return typeof c.nodeId === 'string' && c.nodeId !== '' && isContentSnapshot(c.before) && isContentSnapshot(c.after) && typeof c.at === 'string'
  }
  if (e.kind === 'structural') {
    const s = e as { op?: unknown; at?: unknown }
    return isValidStructuralOp(s.op) && typeof s.at === 'string'
  }
  if (e.kind === 'batch') {
    const b = e as { ops?: unknown; inverse?: unknown; at?: unknown }
    return Array.isArray(b.ops) && b.ops.every(isValidBatchOp) &&
      Array.isArray(b.inverse) && b.inverse.every(isValidBatchOp) &&
      typeof b.at === 'string'
  }
  return false
}

// ---- boot load ------------------------------------------------------------

function load(path: string): {
  nodes: Map<string, StoredNode>
  edges: Map<string, StoredEdge>
  journal: JournalEntry[]
  cursor: number
  corrupt: boolean
  quarantined: string[]
} {
  const nodes = new Map<string, StoredNode>()
  const edges = new Map<string, StoredEdge>()
  const quarantined: string[] = []
  let journal: JournalEntry[] = []
  let cursor = 0
  let corrupt = false
  if (existsSync(path)) {
    let parsed: unknown
    try {
      parsed = JSON.parse(readFileSync(path, 'utf8'))
    } catch {
      return { nodes, edges, journal, cursor, corrupt: true, quarantined }
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { nodes, edges, journal, cursor, corrupt: true, quarantined }
    }
    const file = parsed as Partial<RagStoreFile>
    if (file.version !== 1) {
      return { nodes, edges, journal, cursor, corrupt: true, quarantined }
    }
    if (Array.isArray(file.nodes)) {
      for (const raw of file.nodes) {
        const shape = validateNodeShape(raw)
        if (!shape.ok) continue // malformed → skipped at boot (never loaded)
        const derived = nodeHash(shape.node)
        const storedHash = (raw as { hash?: unknown }).hash
        const rec: StoredNode = { ...shape.node, hash: typeof storedHash === 'string' && storedHash !== '' ? storedHash : derived }
        // Boot re-verification: stored hash mismatch → QUARANTINED (kept, never loaded).
        if (rec.hash !== derived) {
          rec.quarantined = true
          quarantined.push(rec.id)
        }
        nodes.set(rec.id, rec)
      }
    }
    if (Array.isArray(file.edges)) {
      for (const raw of file.edges) {
        const shape = validateEdgeShape(raw)
        if (!shape.ok) continue
        const derived = edgeHash(shape.edge)
        const storedHash = (raw as { hash?: unknown }).hash
        const rec: StoredEdge = { ...shape.edge, hash: typeof storedHash === 'string' && storedHash !== '' ? storedHash : derived }
        if (rec.hash !== derived) {
          rec.quarantined = true
          quarantined.push(rec.id)
        }
        // An edge whose source/target is a missing or quarantined node is itself
        // quarantined (never reported active).
        const src = nodes.get(rec.source)
        const tgt = nodes.get(rec.target)
        if (!src || !tgt || src.quarantined || tgt.quarantined) {
          rec.quarantined = true
          if (!quarantined.includes(rec.id)) quarantined.push(rec.id)
        }
        edges.set(rec.id, rec)
      }
    }
    if (Array.isArray(file.journal)) {
      journal = file.journal.filter(isValidJournalEntry)
    }
    // Coerce cursor to a valid integer within [0, journal.length].
    if (typeof file.cursor === 'number' && Number.isFinite(file.cursor)) {
      const c = Math.floor(file.cursor)
      cursor = Math.min(Math.max(c, 0), journal.length)
    }
  }
  return { nodes, edges, journal, cursor, corrupt, quarantined }
}

export function createJsonRagStore(opts: RagStoreOptions): RagStore {
  if (opts === null || opts === undefined || typeof opts.path !== 'string' || opts.path === '') {
    throw new Error('rag store: path required')
  }
  const loaded = load(opts.path)
  const nodes = loaded.nodes
  const edges = loaded.edges
  const journal = loaded.journal
  let cursor = loaded.cursor
  const corrupt = loaded.corrupt
  const maxJournalLength = opts.maxJournalLength ?? DEFAULT_MAX_JOURNAL_LENGTH

  // ---- single-writer queue (promise-chain mutex) --------------------------
  let queueTail: Promise<unknown> = Promise.resolve()
  // True while a queued fn is executing (including its awaits). Mutating
  // methods check this so a call made FROM INSIDE the queue runs its work
  // directly (re-entrant) instead of enqueueing onto the tail — enqueueing
  // there would append after the current fn's continuation and deadlock.
  let inQueue = false
  function enqueue<T>(fn: () => T | Promise<T>): Promise<T> {
    const result = queueTail.then(async () => {
      inQueue = true
      try {
        return await fn()
      } finally {
        inQueue = false
      }
    })
    // Keep the chain alive even if fn throws (failure isolation).
    queueTail = result.then(() => undefined, () => undefined)
    return result
  }

  // ---- persistence --------------------------------------------------------
  function persist(): void {
    try {
      mkdirSync(dirname(opts.path), { recursive: true })
      const payload: RagStoreFile = {
        version: 1,
        nodes: [...nodes.values()],
        edges: [...edges.values()],
        journal,
        cursor,
      }
      const tmp = `${opts.path}.tmp`
      writeFileSync(tmp, JSON.stringify(payload, null, 2))
      renameSync(tmp, opts.path)
    } catch {
      // a persist failure is non-fatal for the process lifetime; never crash.
    }
  }

  // ---- journal ------------------------------------------------------------
  function pushJournal(entry: JournalEntry): void {
    journal.length = cursor // a new write discards the redo history
    journal.push(entry)
    cursor++
    if (journal.length > maxJournalLength) {
      const excess = journal.length - maxJournalLength
      journal.splice(0, excess)
      cursor -= excess
    }
  }

  // ---- public record copies (strip hash/quarantine, deep-copy mutable fields)
  function toPublicNode(n: StoredNode): RagNode {
    return { id: n.id, type: n.type, content: n.content, children: n.children !== undefined ? deepCopy(n.children) : undefined, props: n.props !== undefined ? deepCopy(n.props) : undefined, ownedNodeIds: [...n.ownedNodeIds], createdAt: n.createdAt, updatedAt: n.updatedAt }
  }
  function toPublicEdge(e: StoredEdge): RagEdge {
    return { id: e.id, kind: e.kind, source: e.source, target: e.target, order: e.order, documentIds: e.documentIds !== undefined ? [...e.documentIds] : undefined, createdAt: e.createdAt, updatedAt: e.updatedAt }
  }

  // ---- internal (non-journaled) mutations used by undo/redo ----------------
  function insertNode(node: RagNode): void {
    const base = { ...node, children: node.children !== undefined ? deepCopy(node.children) : undefined, props: node.props !== undefined ? deepCopy(node.props) : undefined, ownedNodeIds: [...node.ownedNodeIds] }
    const rec: StoredNode = { ...base, hash: nodeHash(base) }
    nodes.set(rec.id, rec)
  }
  function removeNodeInternal(id: string): void {
    for (const e of [...edges.values()]) {
      if (e.source === id || e.target === id) edges.delete(e.id)
    }
    nodes.delete(id)
  }
  function insertEdge(edge: RagEdge): void {
    const base = { ...edge, documentIds: edge.documentIds !== undefined ? [...edge.documentIds] : undefined }
    const rec: StoredEdge = { ...base, hash: edgeHash(base) }
    edges.set(rec.id, rec)
  }

  function setNodeFields(n: StoredNode, src: RagNode): void {
    n.type = src.type
    n.content = src.content
    n.children = src.children !== undefined ? deepCopy(src.children) : undefined
    n.props = src.props !== undefined ? deepCopy(src.props) : undefined
    n.ownedNodeIds = [...src.ownedNodeIds]
    n.createdAt = src.createdAt
    n.updatedAt = new Date().toISOString()
    n.hash = nodeHash(n)
  }
  function setEdgeFields(e: StoredEdge, src: RagEdge): void {
    e.kind = src.kind
    e.source = src.source
    e.target = src.target
    e.order = src.order
    e.documentIds = src.documentIds !== undefined ? [...src.documentIds] : undefined
    e.createdAt = src.createdAt
    e.updatedAt = new Date().toISOString()
    e.hash = edgeHash(e)
  }

  // Applies a single BatchOp via the NON-JOURNALING, NON-PERSISTING internal
  // mutation paths (used by batch undo/redo). Returns false when the op cannot
  // be applied (e.g. a putEdge whose source/target is missing — an out-of-band
  // record removal) so undo/redo can surface the desync without advancing the
  // cursor. A removeNode/removeEdge of a nonexistent id is a no-op (true).
  function applyBatchOpInternal(op: BatchOp): boolean {
    switch (op.op) {
      case 'putNode': {
        const shape = validateNodeShape(op.node)
        if (!shape.ok) return false
        insertNode(shape.node)
        return true
      }
      case 'removeNode': {
        const existing = nodes.get(op.id)
        if (!existing) return true // no-op
        removeNodeInternal(op.id)
        return true
      }
      case 'putEdge': {
        const shape = validateEdgeShape(op.edge)
        if (!shape.ok) return false
        const src = nodes.get(shape.edge.source)
        const tgt = nodes.get(shape.edge.target)
        if (!src || !tgt || src.quarantined || tgt.quarantined) return false
        insertEdge(shape.edge)
        return true
      }
      case 'removeEdge': {
        const existing = edges.get(op.id)
        if (!existing) return true // no-op
        edges.delete(op.id)
        return true
      }
      case 'setProps':
      case 'setSubtree':
      case 'setType':
        return false // not supported in this unit
    }
  }

  // Returns false when the referenced record is missing (out-of-band removal) so
  // undo/redo can surface the desync instead of silently advancing the cursor.
  function applyInverse(entry: JournalEntry): boolean {
    if (entry.kind === 'content') {
      const n = nodes.get(entry.nodeId)
      if (!n) return false
      n.content = entry.before.content
      n.children = entry.before.children !== undefined ? deepCopy(entry.before.children) : undefined
      n.props = entry.before.props !== undefined ? deepCopy(entry.before.props) : undefined
      n.updatedAt = new Date().toISOString()
      n.hash = nodeHash(n)
      return true
    }
    if (entry.kind === 'batch') {
      for (const op of entry.inverse) {
        if (!applyBatchOpInternal(op)) return false
      }
      return true
    }
    const op = entry.op
    switch (op.op) {
      case 'node-add': removeNodeInternal(op.node.id); return true
      case 'node-delete': insertNode(op.node); return true
      case 'node-update': {
        const n = nodes.get(op.nodeId)
        if (!n) return false
        setNodeFields(n, op.before)
        return true
      }
      case 'edge-add': edges.delete(op.edge.id); return true
      case 'edge-remove': insertEdge(op.edge); return true
      case 'edge-retarget': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        e.source = op.before.source
        e.target = op.before.target
        e.updatedAt = new Date().toISOString()
        e.hash = edgeHash(e)
        return true
      }
      case 'edge-update': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        setEdgeFields(e, op.before)
        return true
      }
      case 'doc-flow-role-change': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        e.kind = op.before
        e.updatedAt = new Date().toISOString()
        e.hash = edgeHash(e)
        return true
      }
    }
  }

  function applyForward(entry: JournalEntry): boolean {
    if (entry.kind === 'content') {
      const n = nodes.get(entry.nodeId)
      if (!n) return false
      n.content = entry.after.content
      n.children = entry.after.children !== undefined ? deepCopy(entry.after.children) : undefined
      n.props = entry.after.props !== undefined ? deepCopy(entry.after.props) : undefined
      n.updatedAt = new Date().toISOString()
      n.hash = nodeHash(n)
      return true
    }
    if (entry.kind === 'batch') {
      for (const op of entry.ops) {
        if (!applyBatchOpInternal(op)) return false
      }
      return true
    }
    const op = entry.op
    switch (op.op) {
      case 'node-add': insertNode(op.node); return true
      case 'node-delete': removeNodeInternal(op.node.id); return true
      case 'node-update': {
        const n = nodes.get(op.nodeId)
        if (!n) return false
        setNodeFields(n, op.after)
        return true
      }
      case 'edge-add': insertEdge(op.edge); return true
      case 'edge-remove': edges.delete(op.edge.id); return true
      case 'edge-retarget': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        e.source = op.after.source
        e.target = op.after.target
        e.updatedAt = new Date().toISOString()
        e.hash = edgeHash(e)
        return true
      }
      case 'edge-update': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        setEdgeFields(e, op.after)
        return true
      }
      case 'doc-flow-role-change': {
        const e = edges.get(op.edgeId)
        if (!e) return false
        e.kind = op.after
        e.updatedAt = new Date().toISOString()
        e.hash = edgeHash(e)
        return true
      }
    }
  }

  // ---- node CRUD ----------------------------------------------------------
  function getNode(id: string): RagNode | undefined {
    const n = nodes.get(id)
    if (!n || n.quarantined) return undefined
    return toPublicNode(n)
  }
  function listNodes(): RagNode[] {
    return [...nodes.values()].filter((n) => !n.quarantined).map(toPublicNode)
  }
  function putNodeSync(node: RagNode): RagNode {
    const shape = validateNodeShape(node)
    if (!shape.ok) throw new Error(`rag putNode: ${shape.field} required/invalid`)
    const existing = nodes.get(shape.node.id)
    if (existing) {
      // update → preserve createdAt, refresh updatedAt
      const updatedAt = refreshTimestamp(existing.updatedAt)
      const base = { ...shape.node, createdAt: existing.createdAt, updatedAt }
      const rec: StoredNode = { ...base, hash: nodeHash(base) }
      nodes.set(rec.id, rec)
      const at = new Date().toISOString()
      const typeChanged = existing.type !== rec.type
      const ownedChanged = !sameStringArray(existing.ownedNodeIds, rec.ownedNodeIds)
      if (typeChanged || ownedChanged) {
        // journal the full before/after node so undo restores type/ownedNodeIds
        pushJournal({ kind: 'structural', op: { op: 'node-update', nodeId: rec.id, before: toPublicNode(existing), after: toPublicNode(rec) }, at })
      } else {
        const before = { content: existing.content, children: existing.children !== undefined ? deepCopy(existing.children) : undefined, props: existing.props !== undefined ? deepCopy(existing.props) : undefined }
        const after = { content: rec.content, children: rec.children !== undefined ? deepCopy(rec.children) : undefined, props: rec.props !== undefined ? deepCopy(rec.props) : undefined }
        pushJournal({ kind: 'content', nodeId: rec.id, before, after, at })
      }
    } else {
      // new node → structural node-add entry
      const rec: StoredNode = { ...shape.node, hash: nodeHash(shape.node) }
      nodes.set(rec.id, rec)
      pushJournal({ kind: 'structural', op: { op: 'node-add', node: toPublicNode(rec) }, at: new Date().toISOString() })
    }
    persist()
    return toPublicNode(nodes.get(shape.node.id)!)
  }
  async function putNode(node: RagNode): Promise<RagNode> {
    if (inQueue) return putNodeSync(node)
    return enqueue(() => putNodeSync(node))
  }
  function removeNodeSync(id: string): boolean {
    const existing = nodes.get(id)
    if (!existing) return false
    // cascade: remove any edge whose source/target references the removed node
    const cascaded: StoredEdge[] = []
    for (const e of edges.values()) {
      if (e.source === id || e.target === id) cascaded.push(e)
    }
    for (const e of cascaded) edges.delete(e.id)
    nodes.delete(id)
    const at = new Date().toISOString()
    // edge-removes first, node-delete last → undo re-adds the node before its edges
    for (const e of cascaded) {
      pushJournal({ kind: 'structural', op: { op: 'edge-remove', edge: toPublicEdge(e) }, at })
    }
    pushJournal({ kind: 'structural', op: { op: 'node-delete', node: toPublicNode(existing) }, at })
    persist()
    return true
  }
  async function removeNode(id: string): Promise<boolean> {
    if (inQueue) return removeNodeSync(id)
    return enqueue(() => removeNodeSync(id))
  }

  // ---- edge CRUD ----------------------------------------------------------
  function getEdge(id: string): RagEdge | undefined {
    const e = edges.get(id)
    if (!e || e.quarantined) return undefined
    return toPublicEdge(e)
  }
  function listEdges(): RagEdge[] {
    return [...edges.values()].filter((e) => !e.quarantined).map(toPublicEdge)
  }
  function putEdgeSync(edge: RagEdge): RagEdge {
    const shape = validateEdgeShape(edge)
    if (!shape.ok) throw new Error(`rag putEdge: ${shape.field} required/invalid`)
    const src = nodes.get(shape.edge.source)
    const tgt = nodes.get(shape.edge.target)
    if (!src || !tgt || src.quarantined || tgt.quarantined) {
      throw new Error('rag putEdge: source/target node not found or quarantined')
    }
    const existing = edges.get(shape.edge.id)
    if (existing) {
      // update → preserve createdAt, refresh updatedAt
      const updatedAt = refreshTimestamp(existing.updatedAt)
      const base = { ...shape.edge, createdAt: existing.createdAt, updatedAt }
      const rec: StoredEdge = { ...base, hash: edgeHash(base) }
      edges.set(rec.id, rec)
      const at = new Date().toISOString()
      const kindChanged = existing.kind !== rec.kind
      const retargeted = existing.source !== rec.source || existing.target !== rec.target
      const orderChanged = existing.order !== rec.order
      const docIdsChanged = !sameStringArray(existing.documentIds, rec.documentIds)
      let op: StructuralJournalOp
      if (kindChanged && !retargeted && !orderChanged && !docIdsChanged) {
        op = { op: 'doc-flow-role-change', edgeId: rec.id, before: existing.kind, after: rec.kind }
      } else if (retargeted && !kindChanged && !orderChanged && !docIdsChanged) {
        op = { op: 'edge-retarget', edgeId: rec.id, before: { source: existing.source, target: existing.target }, after: { source: rec.source, target: rec.target } }
      } else {
        // general update (order/documentIds/multiple fields) → full before/after
        op = { op: 'edge-update', edgeId: rec.id, before: toPublicEdge(existing), after: toPublicEdge(rec) }
      }
      pushJournal({ kind: 'structural', op, at })
    } else {
      const rec: StoredEdge = { ...shape.edge, hash: edgeHash(shape.edge) }
      edges.set(rec.id, rec)
      pushJournal({ kind: 'structural', op: { op: 'edge-add', edge: toPublicEdge(rec) }, at: new Date().toISOString() })
    }
    persist()
    return toPublicEdge(edges.get(shape.edge.id)!)
  }
  async function putEdge(edge: RagEdge): Promise<RagEdge> {
    if (inQueue) return putEdgeSync(edge)
    return enqueue(() => putEdgeSync(edge))
  }
  function removeEdgeSync(id: string): boolean {
    const existing = edges.get(id)
    if (!existing) return false
    edges.delete(id)
    pushJournal({ kind: 'structural', op: { op: 'edge-remove', edge: toPublicEdge(existing) }, at: new Date().toISOString() })
    persist()
    return true
  }
  async function removeEdge(id: string): Promise<boolean> {
    if (inQueue) return removeEdgeSync(id)
    return enqueue(() => removeEdgeSync(id))
  }

  // ---- batch (atomic transaction) -----------------------------------------
  // Applies a single BatchOp against the in-memory store WITHOUT journaling or
  // persisting (the batch defers journal + persist to a single unit at the end).
  // Returns the per-op result and the inverse ops (in undo-application order)
  // for the SUCCESS path's journal entry. On failure returns the error message.
  type BatchOpOutcome =
    | { ok: true; result: BatchOpResult; inverse: BatchOp[] }
    | { ok: false; error: string }
  function applyBatchOp(op: BatchOp, index: number): BatchOpOutcome {
    const kind = (op as { op?: string }).op
    switch (kind) {
      case 'putNode': {
        const o = op as Extract<BatchOp, { op: 'putNode' }>
        const shape = validateNodeShape(o.node)
        if (!shape.ok) return { ok: false, error: `rag applyBatch: ${shape.field} required/invalid at index ${index}` }
        const existing = nodes.get(shape.node.id)
        if (existing) {
          // update → preserve createdAt, refresh updatedAt
          const updatedAt = refreshTimestamp(existing.updatedAt)
          const base = { ...shape.node, createdAt: existing.createdAt, updatedAt }
          const rec: StoredNode = { ...base, hash: nodeHash(base) }
          nodes.set(rec.id, rec)
          return { ok: true, result: { op: 'putNode', node: toPublicNode(rec) }, inverse: [{ op: 'putNode', node: toPublicNode(existing) }] }
        }
        const rec: StoredNode = { ...shape.node, hash: nodeHash(shape.node) }
        nodes.set(rec.id, rec)
        return { ok: true, result: { op: 'putNode', node: toPublicNode(rec) }, inverse: [{ op: 'removeNode', id: rec.id }] }
      }
      case 'removeNode': {
        const o = op as Extract<BatchOp, { op: 'removeNode' }>
        const existing = nodes.get(o.id)
        if (!existing) return { ok: true, result: { op: 'removeNode', removed: false }, inverse: [] }
        // cascade: remove any edge whose source/target references the removed node
        const cascaded: StoredEdge[] = []
        for (const e of edges.values()) {
          if (e.source === o.id || e.target === o.id) cascaded.push(e)
        }
        for (const e of cascaded) edges.delete(e.id)
        nodes.delete(o.id)
        // inverse restores the node AND its cascaded edges (node first, then
        // edges in REVERSE order — F4, matching the spec's pinned order)
        const inverse: BatchOp[] = [{ op: 'putNode', node: toPublicNode(existing) }]
        for (let i = cascaded.length - 1; i >= 0; i--) inverse.push({ op: 'putEdge', edge: toPublicEdge(cascaded[i]) })
        return { ok: true, result: { op: 'removeNode', removed: true }, inverse }
      }
      case 'putEdge': {
        const o = op as Extract<BatchOp, { op: 'putEdge' }>
        const shape = validateEdgeShape(o.edge)
        if (!shape.ok) return { ok: false, error: `rag applyBatch: ${shape.field} required/invalid at index ${index}` }
        const src = nodes.get(shape.edge.source)
        const tgt = nodes.get(shape.edge.target)
        if (!src || !tgt || src.quarantined || tgt.quarantined) {
          return { ok: false, error: `rag applyBatch: source/target node not found or quarantined at index ${index}` }
        }
        const existing = edges.get(shape.edge.id)
        if (existing) {
          const updatedAt = refreshTimestamp(existing.updatedAt)
          const base = { ...shape.edge, createdAt: existing.createdAt, updatedAt }
          const rec: StoredEdge = { ...base, hash: edgeHash(base) }
          edges.set(rec.id, rec)
          return { ok: true, result: { op: 'putEdge', edge: toPublicEdge(rec) }, inverse: [{ op: 'putEdge', edge: toPublicEdge(existing) }] }
        }
        const rec: StoredEdge = { ...shape.edge, hash: edgeHash(shape.edge) }
        edges.set(rec.id, rec)
        return { ok: true, result: { op: 'putEdge', edge: toPublicEdge(rec) }, inverse: [{ op: 'removeEdge', id: rec.id }] }
      }
      case 'removeEdge': {
        const o = op as Extract<BatchOp, { op: 'removeEdge' }>
        const existing = edges.get(o.id)
        if (!existing) return { ok: true, result: { op: 'removeEdge', removed: false }, inverse: [] }
        edges.delete(o.id)
        return { ok: true, result: { op: 'removeEdge', removed: true }, inverse: [{ op: 'putEdge', edge: toPublicEdge(existing) }] }
      }
      case 'setProps':
      case 'setSubtree':
      case 'setType':
        return { ok: false, error: `rag applyBatch: op not supported: ${String(kind)} at index ${index}` }
      default:
        return { ok: false, error: `rag applyBatch: invalid op at index ${index}` }
    }
  }

  function applyBatchSync(ops: BatchOp[]): BatchResult {
    // F2 — reject a non-array `ops` argument (never throw for a domain failure).
    if (!Array.isArray(ops)) return { ok: false, error: 'rag applyBatch: ops must be an array', failedIndex: 0 }
    // F5 — an empty batch is a valid no-op; skip the snapshot (nothing to roll back).
    if (ops.length === 0) return { ok: true, results: [] }

    // Snapshot the pre-batch in-memory state (deep copy) so a mid-batch failure
    // can restore it exactly — no partial mutations, no journal pollution.
    const snapshotNodes = new Map<string, StoredNode>()
    for (const [k, v] of nodes) snapshotNodes.set(k, deepCopy(v))
    const snapshotEdges = new Map<string, StoredEdge>()
    for (const [k, v] of edges) snapshotEdges.set(k, deepCopy(v))
    const snapshotJournal = journal.map((e) => deepCopy(e))
    const snapshotCursor = cursor

    const results: BatchOpResult[] = []
    const perOpInverse: BatchOp[][] = []

    try {
      for (let i = 0; i < ops.length; i++) {
        const outcome = applyBatchOp(ops[i], i)
        if (!outcome.ok) {
          // rollback: restore the pre-batch state (nodes/edges/journal/cursor)
          nodes.clear()
          for (const [k, v] of snapshotNodes) nodes.set(k, v)
          edges.clear()
          for (const [k, v] of snapshotEdges) edges.set(k, v)
          journal.length = 0
          journal.push(...snapshotJournal)
          cursor = snapshotCursor
          return { ok: false, error: outcome.error, failedIndex: i }
        }
        results.push(outcome.result)
        perOpInverse.push(outcome.inverse)
      }
    } catch (err) {
      // F1 — an unexpected throw (e.g. a null/undefined op) must still roll back
      // the WHOLE batch and return { ok: false }, never leak a partial mutation.
      nodes.clear()
      for (const [k, v] of snapshotNodes) nodes.set(k, v)
      edges.clear()
      for (const [k, v] of snapshotEdges) edges.set(k, v)
      journal.length = 0
      journal.push(...snapshotJournal)
      cursor = snapshotCursor
      return { ok: false, error: 'rag applyBatch: unexpected failure', failedIndex: -1 }
    }

    // success: land as a SINGLE `batch` journal entry + persist ONCE
    // inverse array is in REVERSE order of the forward ops (undo undoes the
    // last op first); each op's inverse keeps its undo-application order.
    const inverse: BatchOp[] = []
    for (let i = perOpInverse.length - 1; i >= 0; i--) inverse.push(...perOpInverse[i])
    // F3 — persist the APPLIED records as the forward ops (not the raw caller
    // ops), so redo() reproduces the exact applied record (createdAt preserved,
    // updatedAt refreshed, ownedNodeIds deduped) rather than the caller's raw
    // values. `removeNode`/`removeEdge` ids are unchanged, so the raw op is fine.
    const forward: BatchOp[] = ops.map((op, i) => {
      const r = results[i]
      if (r.op === 'putNode') return { op: 'putNode', node: r.node }
      if (r.op === 'putEdge') return { op: 'putEdge', edge: r.edge }
      return op
    })
    pushJournal({ kind: 'batch', ops: deepCopy(forward), inverse: deepCopy(inverse), at: new Date().toISOString() })
    persist()
    return { ok: true, results }
  }
  async function applyBatch(ops: BatchOp[]): Promise<BatchResult> {
    if (inQueue) return applyBatchSync(ops)
    return enqueue(() => applyBatchSync(ops))
  }

  // ---- status -------------------------------------------------------------
  function status(): RagStoreStatus {
    const loadedNodes: string[] = []
    const loadedEdges: string[] = []
    const quarantined: string[] = []
    for (const n of nodes.values()) {
      if (n.quarantined) quarantined.push(n.id)
      else loadedNodes.push(n.id)
    }
    for (const e of edges.values()) {
      if (e.quarantined) quarantined.push(e.id)
      else loadedEdges.push(e.id)
    }
    return { corrupt, quarantined, loadedNodes, loadedEdges }
  }

  // ---- project journal ----------------------------------------------------
  function journalSnapshot(): JournalEntry[] {
    return journal.map((e) => deepCopy(e))
  }
  function undoSync(): JournalEntry | null {
    if (cursor === 0) return null
    const entry = journal[cursor - 1]
    if (!applyInverse(entry)) return null // desync → do NOT advance the cursor
    cursor--
    persist()
    return { ...entry }
  }
  async function undo(): Promise<JournalEntry | null> {
    if (inQueue) return undoSync()
    return enqueue(() => undoSync())
  }
  function redoSync(): JournalEntry | null {
    if (cursor >= journal.length) return null
    const entry = journal[cursor]
    if (!applyForward(entry)) return null // desync → do NOT advance the cursor
    cursor++
    persist()
    return { ...entry }
  }
  async function redo(): Promise<JournalEntry | null> {
    if (inQueue) return redoSync()
    return enqueue(() => redoSync())
  }
  function undoDepth(): number { return cursor }
  function redoDepth(): number { return journal.length - cursor }

  return {
    getNode, listNodes, putNode, removeNode,
    getEdge, listEdges, putEdge, removeEdge,
    status,
    journal: journalSnapshot,
    undo, redo, undoDepth, redoDepth,
    enqueue,
    applyBatch,
  }
}
