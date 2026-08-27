// src/main/backlinks.ts — Unit G: the host-side backlink/outlink enumeration
// (docs/specs/unit-g-crosslink-backlink.md §5.3). Reads the RAG store edges
// (the authoritative layer — RAG-AUTHORITATIVE) + the doc-flow edges for
// document membership. PURE — no Electron; operates on the `RagStore` interface
// (Unit A §5.4, SOURCE-SWITCHABLE). The enumeration is read-only and lock-free.
import type { RagStore, RagEdge, RagEdgeKind } from './rag-store.js'

/** The scope classification of a link: cross-document (source and target in
 *  DIFFERENT documents), intra-document (source and target in the SAME
 *  document), or unscoped (a node with no document membership — indeterminate). */
export type LinkScope = 'cross-document' | 'intra-document' | 'unscoped'

/** One enumerated link (a RAG edge + its scope classification). */
export interface LinkEntry {
  /** The RAG edge that links to/from the node (a shallow copy — never the
   *  internal record). */
  edge: RagEdge
  /** The edge kind. */
  kind: RagEdgeKind
  /** The edge's source RAG node id. */
  source: string
  /** The edge's target RAG node id. */
  target: string
  /** The documents that OWN/USE the edge (CROSS-DOCUMENT-SHARED). Absent if the
   *  edge has no document owners. */
  documentIds?: string[]
  /** The scope classification. */
  scope: LinkScope
}

/** The combined enumeration result. */
export interface BacklinkResult {
  /** The queried node id. */
  nodeId: string
  /** The edges that TARGET nodeId (backlinks), in store order. */
  backlinks: LinkEntry[]
  /** The edges that nodeId SOURCES (outlinks/crosslinks), in store order. */
  outlinks: LinkEntry[]
  /** The crosslink backlinks (the backlinks whose edge kind is `crosslink`). */
  crosslinkBacklinks: LinkEntry[]
  /** The crosslink outlinks (the outlinks whose edge kind is `crosslink`). */
  crosslinkOutlinks: LinkEntry[]
}

/** The set of document root node ids whose flow includes the node. A node with
 *  none of the doc-flow memberships belongs to NO document (an empty set). */
export function documentOf(store: RagStore, nodeId: string): string[] {
  if (store == null) throw new Error('documentOf: store/nodeId required')
  if (typeof nodeId !== 'string' || nodeId === '') throw new Error('documentOf: store/nodeId required')
  const docs = new Set<string>()
  for (const e of store.listEdges()) {
    if (!Array.isArray(e.documentIds)) continue
    // The node is D's head (doc-head source), D's document root (doc-head
    // target), D's end (doc-end source), or a section in D's linear flow
    // (next-section source or target).
    const isHead = e.kind === 'doc-head' && (e.source === nodeId || e.target === nodeId)
    const isEnd = e.kind === 'doc-end' && e.source === nodeId
    const isSection = e.kind === 'next-section' && (e.source === nodeId || e.target === nodeId)
    if (isHead || isEnd || isSection) {
      for (const d of e.documentIds) docs.add(d)
    }
  }
  return [...docs]
}

/** The scope classification of an edge: cross-document (source and target in
 *  DIFFERENT documents), intra-document (they share at least one document), or
 *  unscoped (either has no document membership — indeterminate). */
function scopeOf(store: RagStore, edge: RagEdge): LinkScope {
  const s = documentOf(store, edge.source)
  const t = documentOf(store, edge.target)
  if (s.length > 0 && t.length > 0) {
    const shared = s.some((d) => t.includes(d))
    return shared ? 'intra-document' : 'cross-document'
  }
  return 'unscoped'
}

function toLinkEntry(store: RagStore, edge: RagEdge): LinkEntry {
  return {
    edge: { ...edge },
    kind: edge.kind,
    source: edge.source,
    target: edge.target,
    documentIds: edge.documentIds,
    scope: scopeOf(store, edge),
  }
}

/** The edges that TARGET nodeId (backlinks), across all documents. */
export function listBacklinks(store: RagStore, nodeId: string): LinkEntry[] {
  if (store == null) throw new Error('backlinks: store required')
  if (typeof nodeId !== 'string' || nodeId === '') throw new Error('backlinks: nodeId required')
  return store.listEdges().filter((e) => e.target === nodeId).map((e) => toLinkEntry(store, e))
}

/** The edges that nodeId SOURCES (outlinks/crosslinks). */
export function listOutlinks(store: RagStore, nodeId: string): LinkEntry[] {
  if (store == null) throw new Error('backlinks: store required')
  if (typeof nodeId !== 'string' || nodeId === '') throw new Error('backlinks: nodeId required')
  return store.listEdges().filter((e) => e.source === nodeId).map((e) => toLinkEntry(store, e))
}

/** The combined enumeration (backlinks + outlinks + the crosslink subsets). */
export function enumerateLinks(store: RagStore, nodeId: string): BacklinkResult {
  if (store == null) throw new Error('backlinks: store required')
  if (typeof nodeId !== 'string' || nodeId === '') throw new Error('backlinks: nodeId required')
  const backlinks = listBacklinks(store, nodeId)
  const outlinks = listOutlinks(store, nodeId)
  return {
    nodeId,
    backlinks,
    outlinks,
    crosslinkBacklinks: backlinks.filter((l) => l.kind === 'crosslink'),
    crosslinkOutlinks: outlinks.filter((l) => l.kind === 'crosslink'),
  }
}
