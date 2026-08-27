// tests/traversal-e2e.test.ts — Unit C: the END-TO-END traversal scenarios
// (docs/specs/unit-c-rendering-spine.md §5.7 scenarios 9-10). These exercise
// the full spine (RAG store → document model → traversal → render) for the
// CROSS-DOCUMENT-SHARED cases. Imports `buildTraversal` from
// ../src/main/traversal.js (does NOT exist yet — RED).
//
// These tests are RED because src/main/traversal.ts does not exist yet: the
// import of ../src/main/traversal.js fails with "module not found". The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildTraversal,
  type TraversalResult,
} from '../src/main/traversal.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import type { LegacyInitialData, LegacyContentPayload } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

beforeAll(() => {
  installShim()
})

// ---- fixtures --------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-traversal-e2e-'))
}

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

async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

/** The shared-node fixtures for scenario 9: A's spec is called by both Class B
 *  and Class C. A has two parent-child edges (one from B's use-case node, one
 *  from C's) and a next-section edge in BOTH documents' flows (a separate edge
 *  per document, each with one documentIds owner). The A→D reference edge
 *  (the shared explanation of D's use in function A) has documentIds: [B, C]. */
function sharedNodeFixtures(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('docB', { type: 'div' }),
    makeNode('headB', { type: 'h1', content: 'B title' }),
    makeNode('A', { type: 'p', content: 'A spec' }),
    makeNode('D', { type: 'p', content: 'D shared explanation' }),
    makeNode('endB', { type: 'p', content: 'B end' }),
    makeNode('docC', { type: 'div' }),
    makeNode('headC', { type: 'h1', content: 'C title' }),
    makeNode('endC', { type: 'p', content: 'C end' }),
  ]
  const edges: RagEdge[] = [
    // B's flow: headB → A → D → endB
    makeEdge('b-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
    makeEdge('b-pc', 'parent-child', 'headB', 'A'),
    makeEdge('b-n1', 'next-section', 'headB', 'A', { documentIds: ['docB'] }),
    makeEdge('b-n2', 'next-section', 'A', 'D', { documentIds: ['docB', 'docC'] }), // shared A→D
    makeEdge('b-n3', 'next-section', 'D', 'endB', { documentIds: ['docB'] }),
    makeEdge('b-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
    // C's flow: headC → A → D → endC
    makeEdge('c-head', 'doc-head', 'headC', 'docC', { documentIds: ['docC'] }),
    makeEdge('c-pc', 'parent-child', 'headC', 'A'),
    makeEdge('c-n1', 'next-section', 'headC', 'A', { documentIds: ['docC'] }),
    makeEdge('c-n3', 'next-section', 'D', 'endC', { documentIds: ['docC'] }),
    makeEdge('c-end', 'doc-end', 'endC', 'docC', { documentIds: ['docC'] }),
  ]
  return { nodes, edges }
}

// ===========================================================================
// §5.7 SCENARIO 9 — cross-document shared node (B/C → A → D)
// ===========================================================================

describe('E2E scenario 9 — cross-document shared node (B/C → A → D)', () => {
  it('A is materialized as a duplicate subtree in each document, both sharing the RAG id in backRefs', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = sharedNodeFixtures()
      await seedStore(store, nodes, edges)

      // assemble document B separately
      const docB: TraversalResult = buildTraversal({ store, documentIds: ['docB'], zoneName: 'main' })
      expect(findPayloadByRootId(docB.envelope, 'A')).toBeDefined()
      expect(findPayloadByRootId(docB.envelope, 'D')).toBeDefined()
      expect(docB.backRefs.has('A')).toBe(true)
      expect(docB.backRefs.get('A')!.length).toBeGreaterThanOrEqual(1)

      // assemble document C separately
      const docC: TraversalResult = buildTraversal({ store, documentIds: ['docC'], zoneName: 'main' })
      expect(findPayloadByRootId(docC.envelope, 'A')).toBeDefined()
      expect(findPayloadByRootId(docC.envelope, 'D')).toBeDefined()
      expect(docC.backRefs.has('A')).toBe(true)
      expect(docC.backRefs.get('A')!.length).toBeGreaterThanOrEqual(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('a text change to A updates both documents (re-traversal re-materializes both consistently)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = sharedNodeFixtures()
      await seedStore(store, nodes, edges)

      // mutate A's text
      await store.putNode(makeNode('A', { content: 'A spec UPDATED' }))

      // re-traverse both documents
      const docB: TraversalResult = buildTraversal({ store, documentIds: ['docB'], zoneName: 'main' })
      const docC: TraversalResult = buildTraversal({ store, documentIds: ['docC'], zoneName: 'main' })

      // both documents' A subtrees carry the new text
      expect(findPayloadByRootId(docB.envelope, 'A')!.content[0].content).toBe('A spec UPDATED')
      expect(findPayloadByRootId(docC.envelope, 'A')!.content[0].content).toBe('A spec UPDATED')

      // both still share the RAG id in backRefs
      expect(docB.backRefs.has('A')).toBe(true)
      expect(docC.backRefs.has('A')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('the full spine renders: document B loads through the Runtime and renders A and D in the root-visible zone', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = sharedNodeFixtures()
      await seedStore(store, nodes, edges)

      const docB: TraversalResult = buildTraversal({ store, documentIds: ['docB'], zoneName: 'main' })
      const runtime = new Runtime({ mount: mountEl() as never, envelope: docB.envelope as never })
      const loaded = runtime.load({ kind: 'envelope', envelope: docB.envelope as never })
      expect(loaded.renderedHtml).toContain('A spec')
      expect(loaded.renderedHtml).toContain('D shared explanation')
      expect(loaded.renderedHtml).toContain('zone:main')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 SCENARIO 10 — two distinct A→D edges (differing explanations)
// ===========================================================================

describe('E2E scenario 10 — two distinct A→D edges (differing explanations)', () => {
  it('the traversal renders the B-specific explanation in document B and the C-specific explanation in document C', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // The use case of D DIFFERS between B and C → TWO distinct A→D edges,
      // each with its own content (a distinct D node) and each scoped to one
      // document (documentIds: [B] and documentIds: [C]).
      await seedStore(store, [
        makeNode('docB', { type: 'div' }),
        makeNode('headB', { type: 'h1', content: 'B title' }),
        makeNode('A', { type: 'p', content: 'A spec' }),
        makeNode('D_B', { type: 'p', content: 'D explanation for B' }),
        makeNode('endB', { type: 'p', content: 'B end' }),
        makeNode('docC', { type: 'div' }),
        makeNode('headC', { type: 'h1', content: 'C title' }),
        makeNode('D_C', { type: 'p', content: 'D explanation for C' }),
        makeNode('endC', { type: 'p', content: 'C end' }),
      ], [
        makeEdge('b-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
        makeEdge('b-pc', 'parent-child', 'headB', 'A'),
        makeEdge('b-n1', 'next-section', 'headB', 'A', { documentIds: ['docB'] }),
        makeEdge('b-n2', 'next-section', 'A', 'D_B', { documentIds: ['docB'] }), // B-specific A→D
        makeEdge('b-n3', 'next-section', 'D_B', 'endB', { documentIds: ['docB'] }),
        makeEdge('b-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
        makeEdge('c-head', 'doc-head', 'headC', 'docC', { documentIds: ['docC'] }),
        makeEdge('c-pc', 'parent-child', 'headC', 'A'),
        makeEdge('c-n1', 'next-section', 'headC', 'A', { documentIds: ['docC'] }),
        makeEdge('c-n2', 'next-section', 'A', 'D_C', { documentIds: ['docC'] }), // C-specific A→D
        makeEdge('c-n3', 'next-section', 'D_C', 'endC', { documentIds: ['docC'] }),
        makeEdge('c-end', 'doc-end', 'endC', 'docC', { documentIds: ['docC'] }),
      ])

      // document B renders the B-specific explanation, NOT the C-specific one
      const docB: TraversalResult = buildTraversal({ store, documentIds: ['docB'], zoneName: 'main' })
      expect(findPayloadByRootId(docB.envelope, 'D_B')).toBeDefined()
      expect(findPayloadByRootId(docB.envelope, 'D_C')).toBeUndefined()
      expect(findPayloadByRootId(docB.envelope, 'D_B')!.content[0].content).toBe('D explanation for B')

      // document C renders the C-specific explanation, NOT the B-specific one
      const docC: TraversalResult = buildTraversal({ store, documentIds: ['docC'], zoneName: 'main' })
      expect(findPayloadByRootId(docC.envelope, 'D_C')).toBeDefined()
      expect(findPayloadByRootId(docC.envelope, 'D_B')).toBeUndefined()
      expect(findPayloadByRootId(docC.envelope, 'D_C')!.content[0].content).toBe('D explanation for C')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
