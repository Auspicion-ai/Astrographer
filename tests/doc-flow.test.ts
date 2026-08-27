// tests/doc-flow.test.ts — Unit B: the doc-flow validation pure function
// (docs/specs/unit-b-document-model.md §5.2). Imports `validateDocFlow` from
// ../src/main/doc-flow.js (does NOT exist yet — RED) and the persisted
// RagNode/RagEdge shapes from ../src/main/rag-store.js (Unit A — EXISTS).
//
// These tests are RED because src/main/doc-flow.ts does not exist yet: the
// import of ../src/main/doc-flow.js fails with "module not found". The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { validateDocFlow, type DocFlowVerdict } from '../src/main/doc-flow.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'

// ---- fixtures (plain persisted shapes, Unit A §5.1) ------------------------

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeEdge(
  id: string,
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
  const now = new Date().toISOString()
  return {
    id,
    kind,
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** A valid single-document flow: head → s1 → s2 → end, all scoped to 'doc'. */
function validDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }), // document root = documentId
    makeNode('head', { type: 'h1' }),
    makeNode('s1', { type: 'p' }),
    makeNode('s2', { type: 'p' }),
    makeNode('end', { type: 'p' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
    makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
  ]
  return { nodes, edges }
}

// ===========================================================================
// §5.2 HAPPY PATHS
// ===========================================================================

describe('validateDocFlow — happy paths (§5.2 rule 5)', () => {
  it('a valid document (head exists, all nodes exist, acyclic next-section chain reaching doc-end) → ok:true, head-first order', () => {
    const { nodes, edges } = validDoc()
    const v = validateDocFlow(nodes, edges, 'doc')
    expect(v.ok).toBe(true)
    if (v.ok) expect(v.order).toEqual(['head', 's1', 's2', 'end'])
  })

  it('a valid document with acyclic doc-child nesting → ok:true', () => {
    const { nodes, edges } = validDoc()
    nodes.push(makeNode('ul', { type: 'ul' }), makeNode('li', { type: 'li' }))
    edges.push(makeEdge('e-child', 'doc-child', 'ul', 'li', { order: 0 }))
    const v = validateDocFlow(nodes, edges, 'doc')
    expect(v.ok).toBe(true)
  })

  it('cross-document: a shared node in multiple documents is validated independently per document (scoped by documentId)', () => {
    const nodes: RagNode[] = [
      makeNode('docA', { type: 'div' }),
      makeNode('headA', { type: 'h1' }),
      makeNode('s1', { type: 'p' }),
      makeNode('shared', { type: 'p' }),
      makeNode('endA', { type: 'p' }),
      makeNode('docB', { type: 'div' }),
      makeNode('headB', { type: 'h1' }),
      makeNode('endB', { type: 'p' }),
    ]
    const edges: RagEdge[] = [
      makeEdge('a-head', 'doc-head', 'headA', 'docA', { documentIds: ['docA'] }),
      makeEdge('a-n1', 'next-section', 'headA', 's1', { documentIds: ['docA'] }),
      makeEdge('a-n2', 'next-section', 's1', 'shared', { documentIds: ['docA'] }),
      makeEdge('a-n3', 'next-section', 'shared', 'endA', { documentIds: ['docA'] }),
      makeEdge('a-end', 'doc-end', 'endA', 'docA', { documentIds: ['docA'] }),
      makeEdge('b-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
      makeEdge('b-n1', 'next-section', 'headB', 'shared', { documentIds: ['docB'] }),
      makeEdge('b-n2', 'next-section', 'shared', 'endB', { documentIds: ['docB'] }),
      makeEdge('b-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
    ]
    const a = validateDocFlow(nodes, edges, 'docA')
    expect(a).toEqual({ ok: true, order: ['headA', 's1', 'shared', 'endA'] })
    const b = validateDocFlow(nodes, edges, 'docB')
    expect(b).toEqual({ ok: true, order: ['headB', 'shared', 'endB'] })
  })
})

// ===========================================================================
// §5.2 FAIL-STATES
// ===========================================================================

describe('validateDocFlow — fail-states (§5.2 rules 1-4, 6)', () => {
  it('missing-head: no doc-head edge for the document → { ok:false, reason:"missing-head" }', () => {
    const { nodes, edges } = validDoc()
    const noHead = edges.filter((e) => e.kind !== 'doc-head')
    const v = validateDocFlow(nodes, noHead, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-head')
  })

  it('missing-head: the doc-head edge exists but the head node is missing → { ok:false, reason:"missing-head" }', () => {
    const { nodes, edges } = validDoc()
    const withoutHead = nodes.filter((n) => n.id !== 'head')
    const v = validateDocFlow(withoutHead, edges, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-head')
  })

  it('missing-node: a next-section edge references a nonexistent node → { ok:false, reason:"missing-node" }', () => {
    const { nodes, edges } = validDoc()
    const bad = edges.map((e) =>
      e.id === 'e-n2' ? makeEdge('e-n2', 'next-section', 's1', 'ghost', { documentIds: ['doc'] }) : e,
    )
    const v = validateDocFlow(nodes, bad, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-node')
  })

  it('missing-node: a doc-end edge references a nonexistent node → { ok:false, reason:"missing-node" }', () => {
    const { nodes, edges } = validDoc()
    const bad = edges.map((e) =>
      e.id === 'e-end' ? makeEdge('e-end', 'doc-end', 'end', 'ghost', { documentIds: ['doc'] }) : e,
    )
    const v = validateDocFlow(nodes, bad, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-node')
  })

  it('missing-node: a doc-child edge references a nonexistent node → { ok:false, reason:"missing-node" }', () => {
    const { nodes, edges } = validDoc()
    const withUl = [...nodes, makeNode('ul', { type: 'ul' })]
    const withChild = [...edges, makeEdge('e-child', 'doc-child', 'ul', 'ghost', { order: 0 })]
    const v = validateDocFlow(withUl, withChild, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-node')
  })

  it('cycle: a next-section cycle (A→B→A) → { ok:false, reason:"cycle" }', () => {
    const nodes: RagNode[] = [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1' }),
      makeNode('s1', { type: 'p' }),
    ]
    const edges: RagEdge[] = [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
      makeEdge('e-n2', 'next-section', 's1', 'head', { documentIds: ['doc'] }),
    ]
    const v = validateDocFlow(nodes, edges, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('cycle')
  })

  it('cycle: a doc-child nesting cycle (A is a doc-child of B, B is a doc-child of A) → { ok:false, reason:"cycle" }', () => {
    const nodes: RagNode[] = [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1' }),
      makeNode('A', { type: 'p' }),
      makeNode('B', { type: 'p' }),
    ]
    const edges: RagEdge[] = [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c1', 'doc-child', 'A', 'B', { order: 0 }),
      makeEdge('e-c2', 'doc-child', 'B', 'A', { order: 0 }),
    ]
    const v = validateDocFlow(nodes, edges, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('cycle')
  })

  it('throws Error("validateDocFlow: nodes/edges/documentId required") on null/undefined nodes/edges/documentId', () => {
    const { nodes, edges } = validDoc()
    expect(() => validateDocFlow(null as never, edges, 'doc')).toThrow('validateDocFlow: nodes/edges/documentId required')
    expect(() => validateDocFlow(undefined as never, edges, 'doc')).toThrow('validateDocFlow: nodes/edges/documentId required')
    expect(() => validateDocFlow(nodes, null as never, 'doc')).toThrow('validateDocFlow: nodes/edges/documentId required')
    expect(() => validateDocFlow(nodes, undefined as never, 'doc')).toThrow('validateDocFlow: nodes/edges/documentId required')
    expect(() => validateDocFlow(nodes, edges, null as never)).toThrow('validateDocFlow: nodes/edges/documentId required')
    expect(() => validateDocFlow(nodes, edges, undefined as never)).toThrow('validateDocFlow: nodes/edges/documentId required')
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (HOST findings fixed in src/main/doc-flow.ts)
// ===========================================================================

describe('validateDocFlow — adversarial regressions (HOST findings)', () => {
  it('missing-end: a doc-head + next-section chain with NO doc-end edge → { ok:false, reason:"missing-end" }', () => {
    const { nodes, edges } = validDoc()
    const noEnd = edges.filter((e) => e.kind !== 'doc-end')
    const v = validateDocFlow(nodes, noEnd, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-end')
  })

  it('missing-end: a doc-end edge whose source is NOT the chain terminal → { ok:false, reason:"missing-end" }', () => {
    const { nodes, edges } = validDoc()
    // The chain is head → s1 → s2 → end (terminal 'end'), but the doc-end
    // edge's source is 's1' (not the terminal) → dangling chain.
    const bad = edges.map((e) =>
      e.id === 'e-end' ? makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }) : e,
    )
    const v = validateDocFlow(nodes, bad, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-end')
  })

  it('missing-node: a doc-head edge whose TARGET (ghostDoc) is not in nodes → { ok:false, reason:"missing-node" }', () => {
    const { nodes, edges } = validDoc()
    const bad = edges.map((e) =>
      e.id === 'e-head' ? makeEdge('e-head', 'doc-head', 'head', 'ghostDoc', { documentIds: ['doc'] }) : e,
    )
    const v = validateDocFlow(nodes, bad, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) expect(v.reason).toBe('missing-node')
  })

  it('cycle: two next-section edges from the same source (same document) → { ok:false, reason:"cycle", detail:"duplicate next-section" }', () => {
    const { nodes, edges } = validDoc()
    // head has TWO nexts in the same document (head→s1 and head→s2) — a
    // data-integrity violation (one next per document).
    const dup = [...edges, makeEdge('e-dup', 'next-section', 'head', 's2', { documentIds: ['doc'] })]
    const v = validateDocFlow(nodes, dup, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) {
      expect(v.reason).toBe('cycle')
      expect(v.detail).toBe('duplicate next-section')
    }
  })

  it('missing-head: two doc-head edges for the same document → { ok:false, reason:"missing-head", detail:"multiple heads" }', () => {
    const { nodes, edges } = validDoc()
    const dup = [...edges, makeEdge('e-head2', 'doc-head', 's1', 'doc', { documentIds: ['doc'] })]
    const v = validateDocFlow(nodes, dup, 'doc')
    expect(v.ok).toBe(false)
    if (!v.ok) {
      expect(v.reason).toBe('missing-head')
      expect(v.detail).toBe('multiple heads')
    }
  })
})
