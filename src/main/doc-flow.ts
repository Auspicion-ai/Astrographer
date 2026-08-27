// src/main/doc-flow.ts — Unit B: the doc-flow validation pure function
// (docs/specs/unit-b-document-model.md §5.2). Validates ONE document's
// doc-flow edges (scoped by `documentId`) and produces the head-first
// document order. PURE — no Electron. On any violation the caller falls back
// to family pre-order.
import type { RagNode, RagEdge } from './rag-store.js'

export type DocFlowVerdict =
  | { ok: true; order: string[] } // the document order (RAG node ids), head-first
  | { ok: false; reason: 'cycle' | 'missing-node' | 'missing-head' | 'missing-end'; detail: string }

/** Validate the doc-flow edges for one document and produce the document
 *  order. On any violation, the caller falls back to family pre-order. */
export function validateDocFlow(
  nodes: RagNode[],
  edges: RagEdge[],
  documentId: string,
): DocFlowVerdict {
  if (nodes == null || edges == null || documentId == null) {
    throw new Error('validateDocFlow: nodes/edges/documentId required')
  }
  const nodeIds = new Set(nodes.map((n) => n.id))

  // Scope the doc-flow edges (doc-head/next-section/doc-end) to those whose
  // `documentIds` includes the given documentId. The `doc-child` edges are
  // hierarchical-nesting edges (no documentIds) and are validated globally.
  //
  // Finding 7 (known behavior, no code change): a doc-flow edge with
  // missing/empty `documentIds` is silently scoped OUT — it belongs to no
  // document (correct scoping per the spec: an edge with no owner belongs to
  // no document). A malformed next-section edge is dropped with no signal.
  const scoped = edges.filter((e) => {
    if (e.kind === 'doc-child') return true
    return Array.isArray(e.documentIds) && e.documentIds.includes(documentId)
  })

  // Rule 1 — missing-head (checked FIRST). A doc-head edge referencing a
  // nonexistent node is missing-head, NOT missing-node. A document has exactly
  // one head (Finding 6): two doc-head edges for the same document is a
  // structural violation → missing-head with detail 'multiple heads'.
  const headEdges = scoped.filter((e) => e.kind === 'doc-head')
  if (headEdges.length === 0) {
    return { ok: false, reason: 'missing-head', detail: `no doc-head edge for document ${documentId}` }
  }
  if (headEdges.length > 1) {
    return { ok: false, reason: 'missing-head', detail: 'multiple heads' }
  }
  const headEdge = headEdges[0]
  const headId = headEdge.source
  if (!nodeIds.has(headId)) {
    return { ok: false, reason: 'missing-head', detail: `doc-head node ${headId} does not exist` }
  }

  // Rule 2 — missing-node. Any next-section/doc-end/doc-child edge (NOT
  // doc-head — handled by rule 1) referencing a nonexistent node. The
  // doc-head edge's TARGET (the document root) is also checked here (Finding 2):
  // a nonexistent target is missing-node.
  for (const e of scoped) {
    if (e.kind === 'doc-head') {
      if (!nodeIds.has(e.target)) {
        return { ok: false, reason: 'missing-node', detail: `doc-head edge ${e.id} references a missing target ${e.target}` }
      }
      continue
    }
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      return { ok: false, reason: 'missing-node', detail: `edge ${e.id} references a missing node` }
    }
  }

  // Rule 3 — next-section cycle. Follow the document's next-section edges
  // (scoped by documentId) from the head; a revisit is a cycle. Per
  // CROSS-DOCUMENT-SHARED a node has ONE next per document (Finding 5): two
  // next-section edges from the same source in the same document is a
  // data-integrity violation → cycle with detail 'duplicate next-section'.
  const nextBySource = new Map<string, string>()
  for (const e of scoped) {
    if (e.kind === 'next-section') {
      if (nextBySource.has(e.source)) {
        return { ok: false, reason: 'cycle', detail: 'duplicate next-section' }
      }
      nextBySource.set(e.source, e.target)
    }
  }
  const order: string[] = []
  const seen = new Set<string>()
  let cur: string | undefined = headId
  while (cur !== undefined) {
    if (seen.has(cur)) {
      return { ok: false, reason: 'cycle', detail: `next-section cycle at ${cur}` }
    }
    seen.add(cur)
    order.push(cur)
    cur = nextBySource.get(cur)
  }

  // Rule 4 — doc-child nesting cycle. The doc-child edges form a directed
  // containment graph (source contains target); a cycle is a structural
  // violation.
  const childAdj = new Map<string, string[]>()
  for (const e of scoped) {
    if (e.kind !== 'doc-child') continue
    if (!childAdj.has(e.source)) childAdj.set(e.source, [])
    childAdj.get(e.source)!.push(e.target)
  }
  const state = new Map<string, number>() // 0=unvisited, 1=in-stack, 2=done
  const hasCycle = (n: string): boolean => {
    const s = state.get(n) ?? 0
    if (s === 1) return true
    if (s === 2) return false
    state.set(n, 1)
    for (const t of childAdj.get(n) ?? []) {
      if (hasCycle(t)) return true
    }
    state.set(n, 2)
    return false
  }
  for (const n of childAdj.keys()) {
    if (hasCycle(n)) {
      return { ok: false, reason: 'cycle', detail: 'doc-child nesting cycle' }
    }
  }

  // Rule 6 — missing-end (Finding 1). The next-section chain is acyclic; it
  // must reach the doc-end. A dangling chain — no doc-end edge, or the
  // doc-end edge's source is not the chain's terminal node — is a structural
  // violation.
  const endEdge = scoped.find((e) => e.kind === 'doc-end')
  const terminal = order[order.length - 1]
  if (!endEdge || endEdge.source !== terminal) {
    return { ok: false, reason: 'missing-end', detail: `next-section chain does not reach the doc-end (terminal ${terminal})` }
  }

  // Rule 5 — happy path: head exists, all referenced nodes exist, acyclic
  // next-section chain, acyclic doc-child nesting, chain reaches the doc-end.
  return { ok: true, order }
}
