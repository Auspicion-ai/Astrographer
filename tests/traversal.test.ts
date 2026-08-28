// tests/traversal.test.ts — Unit C: the main-process traversal pure function
// (docs/specs/unit-c-rendering-spine.md §5.1-§5.8). Imports `buildTraversal`
// from ../src/main/traversal.js (does NOT exist yet — RED), the persisted
// RagNode/RagEdge shapes + createJsonRagStore from ../src/main/rag-store.js
// (Unit A — EXISTS), and the provident-ssr LegacyInitialData type.
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
  type TraversalInput,
  type TraversalResult,
  type LineNodeMap,
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

// ---- fixtures (persisted shapes, Unit A §5.1) ------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-traversal-'))
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

// ---- envelope helpers ------------------------------------------------------

/** The container producers in the template root's children (HARD PRECONDITION
 *  §5.2 rule 1): each offers a zone via placement.placementName. */
function containerProducers(env: LegacyInitialData): Array<{ placementName: string }> {
  const children = env.template.root.children ?? []
  return children
    .filter((c) => {
      const p = c.placement as { placementName?: string } | undefined
      return p !== undefined && typeof p.placementName === 'string'
    })
    .map((c) => ({ placementName: (c.placement as { placementName: string }).placementName }))
}

/** The ContentPayload whose subtree root carries the stable authored id
 *  `rag-<ragNodeId>` (§5.2 rule 2). */
function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

/** A valid single-document flow: head → s1 → s2 → end, all scoped to 'doc'. */
function validDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }), // document root = documentId
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('s1', { type: 'p', content: 'Section one' }),
    makeNode('s2', { type: 'p', content: 'Section two' }),
    makeNode('end', { type: 'p', content: 'End' }),
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
// §5.7 HAPPY-PATH STATES (1-8)
// ===========================================================================

describe('buildTraversal — happy paths (§5.7)', () => {
  it('1. single document, single zone → one container producer + one ContentPayload; backRefs one entry; lineMap one range', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // A single-section document: head is the only section (head → doc-end).
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'head', 'doc', { documentIds: ['doc'] }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // envelope: template root + one container producer for 'main'
      expect(result.envelope.template.root.type).toBe('div')
      expect(result.envelope.template.root.props?.id).toBe('wiki-root')
      expect(containerProducers(result.envelope)).toEqual([{ placementName: 'main' }])
      expect(result.envelope.clientConfig?.runInstantiation).toBe(true)
      expect(result.envelope.clientConfig?.runRendering).toBe(true)

      // one ContentPayload — the head subtree root with targetPlacement ['main']
      expect(result.envelope.content).toHaveLength(1)
      const root = result.envelope.content![0].content[0]
      expect(root.type).toBe('h1')
      expect(root.props?.id).toBe('rag-head')
      expect(root.content).toBe('Title')
      expect(root.placement?.targetPlacement).toEqual(['main'])

      // backRefs: one entry for head
      expect(result.backRefs.size).toBe(1)
      expect(result.backRefs.has('head')).toBe(true)
      expect(result.backRefs.get('head')!.length).toBeGreaterThanOrEqual(1)

      // lineMap: one range for head
      expect(result.lineMap.ranges).toHaveLength(1)
      expect(result.lineMap.ranges[0].ragNodeId).toBe('head')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. multiple documents, one zone → one container producer per distinct zone + one ContentPayload per RAG subtree; backRefs one entry per RAG object', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('docA', { type: 'div' }),
        makeNode('headA', { type: 'h1', content: 'A title' }),
        makeNode('sA', { type: 'p', content: 'A section' }),
        makeNode('endA', { type: 'p', content: 'A end' }),
        makeNode('docB', { type: 'div' }),
        makeNode('headB', { type: 'h1', content: 'B title' }),
        makeNode('sB', { type: 'p', content: 'B section' }),
        makeNode('endB', { type: 'p', content: 'B end' }),
      ], [
        makeEdge('a-head', 'doc-head', 'headA', 'docA', { documentIds: ['docA'] }),
        makeEdge('a-n1', 'next-section', 'headA', 'sA', { documentIds: ['docA'] }),
        makeEdge('a-n2', 'next-section', 'sA', 'endA', { documentIds: ['docA'] }),
        makeEdge('a-end', 'doc-end', 'endA', 'docA', { documentIds: ['docA'] }),
        makeEdge('b-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
        makeEdge('b-n1', 'next-section', 'headB', 'sB', { documentIds: ['docB'] }),
        makeEdge('b-n2', 'next-section', 'sB', 'endB', { documentIds: ['docB'] }),
        makeEdge('b-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['docA', 'docB'], zoneName: 'main' })

      // one container producer per distinct zone (both docs target 'main')
      expect(containerProducers(result.envelope)).toEqual([{ placementName: 'main' }])

      // one ContentPayload per RAG subtree (6 sections across both docs)
      expect(result.envelope.content).toHaveLength(6)
      for (const id of ['headA', 'sA', 'endA', 'headB', 'sB', 'endB']) {
        expect(findPayloadByRootId(result.envelope, id)).toBeDefined()
      }

      // backRefs: one entry per RAG object
      expect(result.backRefs.size).toBe(6)
      for (const id of ['headA', 'sA', 'endA', 'headB', 'sB', 'endB']) {
        expect(result.backRefs.has(id)).toBe(true)
        expect(result.backRefs.get(id)!.length).toBeGreaterThanOrEqual(1)
      }

      // lineMap: one range per RAG object
      expect(result.lineMap.ranges).toHaveLength(6)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. valid doc-flow → the head node subtree root carries props["data-doc-head"] = true', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      const headRoot = findPayloadByRootId(result.envelope, 'head')!.content[0]
      expect(headRoot.props?.['data-doc-head']).toBe(true)
      // non-head sections do NOT carry the marker
      const s1Root = findPayloadByRootId(result.envelope, 's1')!.content[0]
      expect(s1Root.props?.['data-doc-head']).toBeUndefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. doc-flow violation (next-section cycle) → falls back to family pre-order (no throw); envelope still renders', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'Section' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 'head', { documentIds: ['doc'] }), // cycle
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()

      // envelope still renders: container producers + ContentPayloads present
      expect(containerProducers(result!.envelope)).toEqual([{ placementName: 'main' }])
      expect(result!.envelope.content!.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. multi-parent node (two parent-child edges) → two duplicate subtrees, both sharing the RAG id in backRefs', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('a', { type: 'p', content: 'A' }),
        makeNode('b', { type: 'p', content: 'B' }),
        makeNode('shared', { type: 'p', content: 'Shared' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'a', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'a', 'b', { documentIds: ['doc'] }),
        makeEdge('e-n3', 'next-section', 'b', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        // shared has TWO parents
        makeEdge('e-p1', 'parent-child', 'a', 'shared'),
        makeEdge('e-p2', 'parent-child', 'b', 'shared'),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // two duplicate subtrees for 'shared' (two distinct content roots)
      const sharedPayloads = (result.envelope.content ?? []).filter(
        (p) => p.content[0]?.props?.id === 'rag-shared',
      )
      expect(sharedPayloads).toHaveLength(2)

      // both share the RAG id in backRefs (≥2 owned node ids — one per duplicate root)
      expect(result.backRefs.has('shared')).toBe(true)
      expect(result.backRefs.get('shared')!.length).toBeGreaterThanOrEqual(2)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. render path → envelope loads through provident.load (MCP) and loadEnvelope (UI); RAG subtrees render in the root-visible zone', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // MCP path: provident.load with kind 'envelope'
      const mcpRuntime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      const mcp = mcpRuntime.load({ kind: 'envelope', envelope: result.envelope as never })
      expect(mcp.renderedHtml).toContain('Title')
      expect(mcp.renderedHtml).toContain('zone:main') // the container producer renders

      // UI path: loadEnvelope
      const uiRuntime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      uiRuntime.loadEnvelope(result.envelope as never)
      const ui = uiRuntime.renderedHtmlResult()
      expect(ui.renderedHtml).toContain('Title')
      expect(ui.renderedHtml).toContain('zone:main')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. MCP/UI equivalence → same envelope + backRefs reachable through both; rendered output identical', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // MCP path
      const mcpRuntime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      const mcp = mcpRuntime.load({ kind: 'envelope', envelope: result.envelope as never })

      // UI path
      const uiRuntime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      uiRuntime.loadEnvelope(result.envelope as never)
      const ui = uiRuntime.renderedHtmlResult()

      // identical rendered output — structurally. Each Runtime calls
      // translateLegacy separately, minting DIFFERENT data-node-id values
      // (node-66 vs node-78), so compare modulo the minted node ids.
      const stripNodeIds = (html: string) => html.replace(/\sdata-node-id="[^"]*"/g, '')
      expect(stripNodeIds(mcp.renderedHtml)).toBe(stripNodeIds(ui.renderedHtml))
      expect(stripNodeIds(mcp.ssrHtml)).toBe(stripNodeIds(ui.ssrHtml))

      // the backRefs map is available to both (a property of the traversal result)
      expect(result.backRefs.has('head')).toBe(true)
      expect(result.backRefs.get('head')!.length).toBeGreaterThanOrEqual(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. doc-child nesting → a ul with four li doc-children nested at their order positions; backRefs one entry for ul (excluding the lis) + one per li; lineMap maps each li to its own doc-child RAG object', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('ul', { type: 'ul', content: 'List' }),
        makeNode('li1', { type: 'li', content: 'Item one' }),
        makeNode('li2', { type: 'li', content: 'Item two' }),
        makeNode('li3', { type: 'li', content: 'Item three' }),
        makeNode('li4', { type: 'li', content: 'Item four' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'ul', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'ul', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'ul', 'li1', { order: 0 }),
        makeEdge('e-c2', 'doc-child', 'ul', 'li2', { order: 1 }),
        makeEdge('e-c3', 'doc-child', 'ul', 'li3', { order: 2 }),
        makeEdge('e-c4', 'doc-child', 'ul', 'li4', { order: 3 }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // ONE ContentPayload for the ul subtree (the li doc-children are nested
      // WITHIN it, not separate ContentPayloads — §5.9). The fixture also has
      // head + end as sections, so the envelope has 3 ContentPayloads total;
      // the ul is exactly one, and no li is a separate ContentPayload.
      const ulPayload = findPayloadByRootId(result.envelope, 'ul')
      expect(ulPayload).toBeDefined()
      expect(result.envelope.content.filter((p) => p.content[0]?.props?.id === 'rag-ul')).toHaveLength(1)
      expect(result.envelope.content.filter((p) => p.content[0]?.props?.id?.startsWith('rag-li'))).toHaveLength(0)

      // the ul content root carries the four li doc-child subtrees at their
      // order positions (li1, li2, li3, li4)
      const ulRoot = ulPayload!.content[0]
      expect(ulRoot.type).toBe('ul')
      expect(ulRoot.props?.id).toBe('rag-ul')
      const childIds = (ulRoot.children ?? []).map((c) => c.props?.id)
      // Unit L — the textarea editing overlay is the FIRST child of each RAG
      // subtree root (render-only, `textarea-<ragId>`), then the doc-children.
      expect(childIds).toEqual(['textarea-ul', 'rag-li1', 'rag-li2', 'rag-li3', 'rag-li4'])

      // backRefs: one entry for the ul (its owned nodes, excluding the lis) +
      // one per li doc-child RAG object
      expect(result.backRefs.has('ul')).toBe(true)
      expect(result.backRefs.get('ul')!.length).toBeGreaterThanOrEqual(1)
      for (const li of ['li1', 'li2', 'li3', 'li4']) {
        expect(result.backRefs.has(li)).toBe(true)
        expect(result.backRefs.get(li)!.length).toBeGreaterThanOrEqual(1)
      }

      // lineMap: one range per RAG object; each li maps to its own doc-child
      const liRanges = result.lineMap.ranges.filter((r) => r.ragNodeId.startsWith('li'))
      expect(liRanges).toHaveLength(4)
      expect(result.lineMap.ranges.some((r) => r.ragNodeId === 'ul')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.8 FAIL-STATES (1-8)
// ===========================================================================

describe('buildTraversal — fail-states (§5.8)', () => {
  it('1. null/undefined input or missing required field → throws Error("traversal: store/documentIds/zoneName required")', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      expect(() => buildTraversal(null as never)).toThrow('traversal: store/documentIds/zoneName required')
      expect(() => buildTraversal(undefined as never)).toThrow('traversal: store/documentIds/zoneName required')
      expect(() => buildTraversal({ store, documentIds: [], zoneName: '' })).toThrow('traversal: store/documentIds/zoneName required')
      expect(() => buildTraversal({ store: undefined, documentIds: [], zoneName: 'main' })).toThrow('traversal: store/documentIds/zoneName required')
      expect(() => buildTraversal({ store, documentIds: undefined, zoneName: 'main' })).toThrow('traversal: store/documentIds/zoneName required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. HARD PRECONDITION → the traversal ALWAYS emits a container producer for every targeted zone', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      // for any zoneName passed, the envelope's template has a container producer for it
      for (const zone of ['main', 'sidebar', 'footer']) {
        const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: zone })
        expect(containerProducers(result.envelope).some((p) => p.placementName === zone)).toBe(true)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. empty document (no RAG nodes) → no ContentPayload for it (no throw); envelope still has the container producers', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      // 'ghost' is a documentId with no RAG nodes in the store
      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['ghost'], zoneName: 'main' })
      }).not.toThrow()

      // no ContentPayload for the empty document
      expect(result!.envelope.content ?? []).toHaveLength(0)
      // the container producers are still emitted
      expect(containerProducers(result!.envelope)).toEqual([{ placementName: 'main' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. dangling back-reference (RAG node deleted) → the backRefs map does NOT include the deleted node after a re-traversal', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const before: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      expect(before.backRefs.has('head')).toBe(true)

      // delete the head node (cascades its edges)
      await store.removeNode('head')

      const after: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      expect(after.backRefs.has('head')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. doc-flow validation failure → falls back to family pre-order (no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'Section' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 'head', { documentIds: ['doc'] }), // cycle
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()
      expect(result!.envelope.content!.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. a RAG node with no ownedNodeIds → the traversal derives the owned set from the subtree structure; backRefs still records the RAG object → its subtree node ids', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      // the head node has ownedNodeIds: [] (the traversal must derive the set)
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      expect(result.backRefs.has('head')).toBe(true)
      expect(result.backRefs.get('head')!.length).toBeGreaterThanOrEqual(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. malformed envelope → the traversal must emit well-formed targetPlacement: string[]', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      for (const payload of result.envelope.content ?? []) {
        const root = payload.content[0]
        expect(Array.isArray(root.placement?.targetPlacement)).toBe(true)
        for (const t of root.placement!.targetPlacement!) expect(typeof t).toBe('string')
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. doc-child nesting cycle → falls back to family pre-order (no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('A', { type: 'p', content: 'A' }),
        makeNode('B', { type: 'p', content: 'B' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'A', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'A', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'A', 'B', { order: 0 }),
        makeEdge('e-c2', 'doc-child', 'B', 'A', { order: 0 }), // nesting cycle
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()
      expect(result!.envelope.content!.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// ADVERSARIAL REGRESSION TESTS (HOST findings fixed in src/main/traversal.ts)
// ===========================================================================

describe('buildTraversal — adversarial regression tests (HOST findings)', () => {
  it('1. a ul with 4 li doc-children has a REAL markdown range spanning >1 line, and each li maps to its own doc-child RAG object', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('ul', { type: 'ul', content: 'List' }),
        makeNode('li1', { type: 'li', content: 'Item one' }),
        makeNode('li2', { type: 'li', content: 'Item two' }),
        makeNode('li3', { type: 'li', content: 'Item three' }),
        makeNode('li4', { type: 'li', content: 'Item four' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'ul', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'ul', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'ul', 'li1', { order: 0 }),
        makeEdge('e-c2', 'doc-child', 'ul', 'li2', { order: 1 }),
        makeEdge('e-c3', 'doc-child', 'ul', 'li3', { order: 2 }),
        makeEdge('e-c4', 'doc-child', 'ul', 'li4', { order: 3 }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // the ul range spans the whole list (>1 line) — NOT a synthetic 1-line span
      const ulRange = result.lineMap.ranges.find((r) => r.ragNodeId === 'ul')!
      expect(ulRange.endLine - ulRange.startLine).toBeGreaterThan(1)

      // each li maps to its own doc-child RAG object (its own range)
      for (const li of ['li1', 'li2', 'li3', 'li4']) {
        const liRange = result.lineMap.ranges.find((r) => r.ragNodeId === li)!
        expect(liRange.endLine - liRange.startLine).toBeGreaterThanOrEqual(1)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. a parent back-reference EXCLUDES its doc-children node ids', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('ul', { type: 'ul', content: 'List' }),
        makeNode('li1', { type: 'li', content: 'Item one' }),
        makeNode('li2', { type: 'li', content: 'Item two' }),
        makeNode('li3', { type: 'li', content: 'Item three' }),
        makeNode('li4', { type: 'li', content: 'Item four' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'ul', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'ul', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'ul', 'li1', { order: 0 }),
        makeEdge('e-c2', 'doc-child', 'ul', 'li2', { order: 1 }),
        makeEdge('e-c3', 'doc-child', 'ul', 'li3', { order: 2 }),
        makeEdge('e-c4', 'doc-child', 'ul', 'li4', { order: 3 }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // the ul's owned set does NOT include the li node ids
      const ulIds = result.backRefs.get('ul')!
      const liIds = ['li1', 'li2', 'li3', 'li4'].flatMap((li) => result.backRefs.get(li)!)
      for (const liId of liIds) {
        expect(ulIds).not.toContain(liId)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. a node that is a doc-child target in doc A but a multi-parent shared node in doc B is materialized in B', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('docA', { type: 'div' }),
        makeNode('headA', { type: 'h1', content: 'A title' }),
        makeNode('PA', { type: 'p', content: 'Parent A' }),
        makeNode('X', { type: 'p', content: 'Shared X' }),
        makeNode('endA', { type: 'p', content: 'A end' }),
        makeNode('docB', { type: 'div' }),
        makeNode('headB', { type: 'h1', content: 'B title' }),
        makeNode('s1', { type: 'p', content: 'S1' }),
        makeNode('s2', { type: 'p', content: 'S2' }),
        makeNode('endB', { type: 'p', content: 'B end' }),
      ], [
        // A's flow: headA → PA → endA
        makeEdge('a-head', 'doc-head', 'headA', 'docA', { documentIds: ['docA'] }),
        makeEdge('a-n1', 'next-section', 'headA', 'PA', { documentIds: ['docA'] }),
        makeEdge('a-n2', 'next-section', 'PA', 'endA', { documentIds: ['docA'] }),
        makeEdge('a-end', 'doc-end', 'endA', 'docA', { documentIds: ['docA'] }),
        // A: X is a doc-child of PA
        makeEdge('a-c', 'doc-child', 'PA', 'X', { order: 0 }),
        // B's flow: headB → s1 → s2 → endB
        makeEdge('b-head', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
        makeEdge('b-n1', 'next-section', 'headB', 's1', { documentIds: ['docB'] }),
        makeEdge('b-n2', 'next-section', 's1', 's2', { documentIds: ['docB'] }),
        makeEdge('b-n3', 'next-section', 's2', 'endB', { documentIds: ['docB'] }),
        makeEdge('b-end', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
        // B: X has two parent-child parents (s1, s2)
        makeEdge('b-p1', 'parent-child', 's1', 'X'),
        makeEdge('b-p2', 'parent-child', 's2', 'X'),
      ])

      // document B: X is a multi-parent shared node → materialized as duplicates
      const docB: TraversalResult = buildTraversal({ store, documentIds: ['docB'], zoneName: 'main' })
      const xPayloads = (docB.envelope.content ?? []).filter((p) => p.content[0]?.props?.id === 'rag-X')
      expect(xPayloads).toHaveLength(2)
      expect(docB.backRefs.has('X')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. duplicate documentIds do not double-materialize sections', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const single: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const dup: TraversalResult = buildTraversal({ store, documentIds: ['doc', 'doc'], zoneName: 'main' })

      // the duplicate documentIds produce the SAME envelope content (no double-materialization)
      expect(dup.envelope.content).toHaveLength(single.envelope.content.length)
      expect(dup.backRefs.size).toBe(single.backRefs.size)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. a RAG node props (href) are propagated to the subtree root and render', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('link', { type: 'a', content: 'Example', props: { href: 'https://example.com' } }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'link', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'link', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // the subtree root carries the RAG node's href prop
      const linkRoot = findPayloadByRootId(result.envelope, 'link')!.content[0]
      expect(linkRoot.props?.href).toBe('https://example.com')
      // the stable authored id still takes precedence
      expect(linkRoot.props?.id).toBe('rag-link')

      // the rendered markdown includes the href
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      expect(runtime.markdown()).toContain('https://example.com')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
