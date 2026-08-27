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

/** A RAG node — one knowledge-graph object. OWNS a subtree of provident nodes
 *  (SUBTREE-OWNERSHIP). */
export interface RagNode {
  id: string
  type: RagNodeType
  content: string
  props?: Record<string, unknown>
  ownedNodeIds: string[]
  createdAt: string
  updatedAt: string
}

/** The RAG edge kinds. Doc-flow kinds (doc-head/next-section/doc-end) are
 *  authoritative in the store; `doc-child` expresses hierarchical nesting. */
export type RagEdgeKind =
  | 'parent-child'
  | 'doc-head'
  | 'next-section'
  | 'doc-end'
  | 'doc-child'

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

/** A project journal entry — content (invertible by restore) or structural
 *  (invertible by applying the inverse op). */
export type JournalEntry =
  | {
      kind: 'content'
      nodeId: string
      before: { content: string; props?: Record<string, unknown> }
      after: { content: string; props?: Record<string, unknown> }
      at: string
    }
  | {
      kind: 'structural'
      op: StructuralJournalOp
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

const RAG_NODE_TYPES = new Set<string>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div'])
const RAG_EDGE_KINDS = new Set<string>(['parent-child', 'doc-head', 'next-section', 'doc-end', 'doc-child'])
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
    props: n.props, ownedNodeIds: n.ownedNodeIds,
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
function isContentSnapshot(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const s = v as { content?: unknown; props?: unknown }
  if (typeof s.content !== 'string') return false
  if (s.props !== undefined && (s.props === null || typeof s.props !== 'object' || Array.isArray(s.props))) return false
  return true
}
function isRagNode(v: unknown): boolean {
  if (v === null || typeof v !== 'object') return false
  const n = v as Partial<RagNode>
  return typeof n.id === 'string' && typeof n.type === 'string' && typeof n.content === 'string' &&
    Array.isArray(n.ownedNodeIds) && isIso8601(n.createdAt) && isIso8601(n.updatedAt)
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
    return { id: n.id, type: n.type, content: n.content, props: n.props !== undefined ? deepCopy(n.props) : undefined, ownedNodeIds: [...n.ownedNodeIds], createdAt: n.createdAt, updatedAt: n.updatedAt }
  }
  function toPublicEdge(e: StoredEdge): RagEdge {
    return { id: e.id, kind: e.kind, source: e.source, target: e.target, order: e.order, documentIds: e.documentIds !== undefined ? [...e.documentIds] : undefined, createdAt: e.createdAt, updatedAt: e.updatedAt }
  }

  // ---- internal (non-journaled) mutations used by undo/redo ----------------
  function insertNode(node: RagNode): void {
    const base = { ...node, props: node.props !== undefined ? deepCopy(node.props) : undefined, ownedNodeIds: [...node.ownedNodeIds] }
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

  // Returns false when the referenced record is missing (out-of-band removal) so
  // undo/redo can surface the desync instead of silently advancing the cursor.
  function applyInverse(entry: JournalEntry): boolean {
    if (entry.kind === 'content') {
      const n = nodes.get(entry.nodeId)
      if (!n) return false
      n.content = entry.before.content
      n.props = entry.before.props !== undefined ? deepCopy(entry.before.props) : undefined
      n.updatedAt = new Date().toISOString()
      n.hash = nodeHash(n)
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
      n.props = entry.after.props !== undefined ? deepCopy(entry.after.props) : undefined
      n.updatedAt = new Date().toISOString()
      n.hash = nodeHash(n)
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
        const before = { content: existing.content, props: existing.props !== undefined ? deepCopy(existing.props) : undefined }
        const after = { content: rec.content, props: rec.props !== undefined ? deepCopy(rec.props) : undefined }
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
  }
}
