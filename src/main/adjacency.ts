// src/main/adjacency.ts — Unit V1: the shared PURE adjacency core +
// `createSnapshotStore` (docs/specs/unit-v1-store-adjacency.md §5.1/§5.4).
//
// This module is NODE-FREE (no `node:fs`/`node:path`/`node:crypto` builtins) so
// it can be imported by the RENDERER bundle (which imports `buildTraversal` from
// `traversal.ts` via `sidebar-panes.ts`). The adjacency semantics are implemented
// ONCE here as a pure data structure over `RagEdge[]`; both the JSON store's
// adjacency methods (`src/main/rag-store.ts`) and `createSnapshotStore` delegate
// to these functions (amendment 3 — the renderer's traversal cannot diverge from
// main's). PURE — no Electron, no store state; importable in main and renderer.
//
// It imports ONLY types from `rag-store.ts` (never the node-builtin-importing
// runtime), so pulling this module into a browser bundle does not drag in the
// main-process builtins.
import type { RagNode, RagEdge, RagEdgeKind, RagStore } from './rag-store.js'

/** The prototype-pollution keys dropped at every level of `deepCopy` (and
 *  rejected by the store's shape validation). */
export const DANGEROUS_KEYS = new Set<string>(['__proto__', 'constructor', 'prototype'])

// ---- safe deep copy --------------------------------------------------------
// Returns a deep copy that can never be used to prototype-pollute: dangerous
// keys (__proto__/constructor/prototype) are dropped at every level. Used on
// BOTH write (store a copy) and read (return a copy) so a caller cannot mutate
// the store through a returned record.
export function deepCopy<T>(value: T): T {
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

/** The closed set of valid `RagEdgeKind` values (the runtime mirror of the
 *  `RagEdgeKind` union). */
export const RAG_EDGE_KINDS = new Set<string>(['parent-child', 'doc-head', 'next-section', 'doc-end', 'doc-child', 'crosslink'])

// ---- public record copies (shallow copies of the public record shapes) -----
function copyNode(n: RagNode): RagNode {
  return { id: n.id, type: n.type, content: n.content, children: n.children !== undefined ? deepCopy(n.children) : undefined, props: n.props !== undefined ? deepCopy(n.props) : undefined, ownedNodeIds: [...n.ownedNodeIds], createdAt: n.createdAt, updatedAt: n.updatedAt }
}
function copyEdge(e: RagEdge): RagEdge {
  return { id: e.id, kind: e.kind, source: e.source, target: e.target, order: e.order, documentIds: e.documentIds !== undefined ? [...e.documentIds] : undefined, createdAt: e.createdAt, updatedAt: e.updatedAt }
}

// ---- shared PURE adjacency core (Unit V1) ----------------------------------
// The adjacency semantics are implemented ONCE as a pure data structure over
// `RagEdge[]`. Both the JSON store's adjacency methods and `createSnapshotStore`
// delegate to these functions (amendment 3 — the renderer's traversal cannot
// diverge from main's). PURE — no Electron, no store state.

/** The lazy adjacency index — a pure projection of the store's edges. Built in
 *  one O(E) pass. */
export interface AdjacencyIndex {
  /** source → the edges whose `source` is that id (store order). */
  from: Map<string, RagEdge[]>
  /** target → the edges whose `target` is that id (store order). */
  to: Map<string, RagEdge[]>
  /** kind → the edges of that kind (store order). */
  kind: Map<RagEdgeKind, RagEdge[]>
  /** documentId → the edges scoped to that document (store order): the
   *  doc-flow edges (doc-head/next-section/doc-end) whose `documentIds`
   *  includes the id + ALL `doc-child` edges (hierarchical nesting, no
   *  documentIds — Unit B §5.2 Finding 7 scopes them globally). */
  document: Map<string, RagEdge[]>
  /** documentId → the head node id (the source of the FIRST `doc-head` edge
   *  whose `documentIds` includes the id, in store order). Absent when the
   *  document has no `doc-head` edge. */
  docHead: Map<string, string>
}

function pushIndex<T>(map: Map<T, RagEdge[]>, key: T, edge: RagEdge): void {
  const list = map.get(key)
  if (list) list.push(edge)
  else map.set(key, [edge])
}

/** Build the adjacency index from the store's edges in ONE O(E) pass. PURE. */
export function buildAdjacencyIndex(edges: RagEdge[]): AdjacencyIndex {
  if (!Array.isArray(edges)) throw new Error('buildAdjacencyIndex: edges must be an array')
  const from = new Map<string, RagEdge[]>()
  const to = new Map<string, RagEdge[]>()
  const kind = new Map<RagEdgeKind, RagEdge[]>()
  const document = new Map<string, RagEdge[]>()
  const docHead = new Map<string, string>()

  // Collect every document key (from the doc-flow edges' `documentIds`) so the
  // global `doc-child` edges (no documentIds) can be scoped to every document.
  const docKeys = new Set<string>()
  for (const e of edges) {
    if (e.documentIds) for (const d of e.documentIds) docKeys.add(d)
  }

  for (const e of edges) {
    pushIndex(from, e.source, e)
    pushIndex(to, e.target, e)
    pushIndex(kind, e.kind, e)
    if (e.documentIds) {
      // MED-2 — dedupe `documentIds` so a duplicate array does not push the edge
      // twice to the same document (parity with the JSON store, which dedupes
      // `documentIds` on write via validateEdgeShape).
      for (const d of new Set(e.documentIds)) pushIndex(document, d, e)
    }
    if (e.kind === 'doc-child') {
      for (const d of docKeys) pushIndex(document, d, e)
    }
    if (e.kind === 'doc-head' && e.documentIds) {
      for (const d of new Set(e.documentIds)) {
        if (!docHead.has(d)) docHead.set(d, e.source)
      }
    }
  }
  return { from, to, kind, document, docHead }
}

function requireIndex(index: AdjacencyIndex | null | undefined, name: string): AdjacencyIndex {
  if (index === null || index === undefined) throw new Error(`${name}: index required`)
  return index
}
export function requireNonEmptyString(v: unknown, name: string, arg: string): string {
  if (typeof v !== 'string' || v === '') throw new Error(`${name}: ${arg} must be a non-empty string`)
  return v
}

/** The edges whose `source` is `source`, in store order. PURE. */
export function edgesFromIndex(index: AdjacencyIndex, source: string): RagEdge[] {
  const i = requireIndex(index, 'edgesFromIndex')
  const s = requireNonEmptyString(source, 'edgesFromIndex', 'source')
  return [...(i.from.get(s) ?? [])]
}
/** The edges whose `target` is `target`, in store order. PURE. */
export function edgesToIndex(index: AdjacencyIndex, target: string): RagEdge[] {
  const i = requireIndex(index, 'edgesToIndex')
  const t = requireNonEmptyString(target, 'edgesToIndex', 'target')
  return [...(i.to.get(t) ?? [])]
}
/** The edges of `kind`, in store order. PURE. */
export function edgesByKindIndex(index: AdjacencyIndex, kind: RagEdgeKind): RagEdge[] {
  const i = requireIndex(index, 'edgesByKindIndex')
  if (typeof kind !== 'string' || !RAG_EDGE_KINDS.has(kind)) throw new Error('edgesByKindIndex: invalid kind')
  return [...(i.kind.get(kind) ?? [])]
}
/** The edges scoped to `documentId` (the doc-flow edges whose `documentIds`
 *  includes it + ALL `doc-child` edges), in store order. PURE. */
export function edgesForDocumentIndex(index: AdjacencyIndex, documentId: string): RagEdge[] {
  const i = requireIndex(index, 'edgesForDocumentIndex')
  const d = requireNonEmptyString(documentId, 'edgesForDocumentIndex', 'documentId')
  return [...(i.document.get(d) ?? [])]
}
/** The head node id for `documentId` (the source of the FIRST `doc-head` edge
 *  whose `documentIds` includes it), or `undefined` if none. PURE. */
export function docHeadForDocumentIndex(index: AdjacencyIndex, documentId: string): string | undefined {
  const i = requireIndex(index, 'docHeadForDocumentIndex')
  const d = requireNonEmptyString(documentId, 'docHeadForDocumentIndex', 'documentId')
  return i.docHead.get(d)
}

// ---- createSnapshotStore (Unit V1) — the read-only adapter ----------------
/** A read-only `RagStore` adapter over a snapshot (nodes + edges). Implements
 *  the FULL `RagStore` interface so `buildTraversal` (which reads
 *  `listNodes`/`listEdges` + the adjacency methods) can run against it. The
 *  adjacency methods delegate to the SAME pure adjacency functions the JSON
 *  store uses (amendment 3). The mutating methods THROW (fail-closed — a
 *  read-only adapter must not silently accept a write). */
export function createSnapshotStore(nodes: RagNode[], edges: RagEdge[]): RagStore {
  if (!Array.isArray(nodes) || !Array.isArray(edges)) {
    throw new Error('createSnapshotStore: nodes/edges must be arrays')
  }
  // MED-1 — defensively copy the caller's arrays at construction so the snapshot
  // is a captured, immutable view: a caller mutating the source arrays after
  // construction cannot make the read methods and the adjacency methods diverge.
  const nodesCopy = nodes.map(copyNode)
  const edgesCopy = edges.map(copyEdge)
  const nodeMap = new Map<string, RagNode>()
  for (const n of nodesCopy) nodeMap.set(n.id, n)
  const edgeMap = new Map<string, RagEdge>()
  for (const e of edgesCopy) edgeMap.set(e.id, e)
  // Eagerly at construction (spec §5.4 pins eager for determinism).
  const index = buildAdjacencyIndex(edgesCopy)

  const readOnly = (): never => { throw new Error('createSnapshotStore: read-only') }

  return {
    getNode(id) {
      const n = nodeMap.get(id)
      return n ? copyNode(n) : undefined
    },
    listNodes() { return nodesCopy.map(copyNode) },
    putNode: readOnly,
    removeNode: readOnly,
    getEdge(id) {
      const e = edgeMap.get(id)
      return e ? copyEdge(e) : undefined
    },
    listEdges() { return edgesCopy.map(copyEdge) },
    putEdge: readOnly,
    removeEdge: readOnly,
    status() {
      return { corrupt: false, quarantined: [], loadedNodes: nodesCopy.map((n) => n.id), loadedEdges: edgesCopy.map((e) => e.id) }
    },
    journal() { return [] },
    undo: readOnly,
    redo: readOnly,
    undoDepth() { return 0 },
    redoDepth() { return 0 },
    enqueue: readOnly,
    applyBatch: readOnly,
    // LOW-4 — validate with the `rag <method>` prefix (matching the JSON store)
    // before delegating to the pure helpers, so the two stores throw identical
    // caller-error messages.
    edgesFrom(source) {
      const s = requireNonEmptyString(source, 'rag edgesFrom', 'source')
      return edgesFromIndex(index, s).map(copyEdge)
    },
    edgesTo(target) {
      const t = requireNonEmptyString(target, 'rag edgesTo', 'target')
      return edgesToIndex(index, t).map(copyEdge)
    },
    edgesByKind(kind) {
      if (typeof kind !== 'string' || !RAG_EDGE_KINDS.has(kind)) throw new Error('rag edgesByKind: invalid kind')
      return edgesByKindIndex(index, kind).map(copyEdge)
    },
    edgesForDocument(documentId) {
      const d = requireNonEmptyString(documentId, 'rag edgesForDocument', 'documentId')
      return edgesForDocumentIndex(index, d).map(copyEdge)
    },
    docHeadForDocument(documentId) {
      const d = requireNonEmptyString(documentId, 'rag docHeadForDocument', 'documentId')
      return docHeadForDocumentIndex(index, d)
    },
  }
}
