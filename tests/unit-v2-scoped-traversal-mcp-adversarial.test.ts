// tests/unit-v2-scoped-traversal-mcp-adversarial.test.ts — the HOST adversarial
// regression tests for Unit V2 (docs/specs/unit-v2-scoped-traversal-mcp.md §3a).
// Each test pins a HOST test-gap finding the adversarial reviewer surfaced:
//
//   HOST-2 (MED) — the amendment-1 equivalence test did NOT cover the
//     cross-document shared fixture (B/C → A → D, §5.6 happy 7). This file adds
//     a regression test asserting the scoped walk's `materialized` set equals
//     the old all-edges walk's for a node shared across two documents.
//   HOST-3 (MED) — `computeDocumentSubgraph` malformed-input cases were
//     untested (doc-head edge with a missing target, doc-child edge with a
//     missing target, a document id not in the store, an empty document with
//     doc-child edges present elsewhere). Each is pinned here (missing-node →
//     `validateDocFlow` fallback; unknown id → `{documentId}` + `[]`; no crash).
//   HOST-4 (LOW) — the edit-surface-change test used a `stray` node NOT
//     materialized by EITHER walk, so it did not exercise the accepted shrink.
//     This file constructs a node the OLD all-edges walk materializes but the
//     scoped walk drops (reachable only via a path not reachable from the head)
//     and asserts it is absent from backRefs/envelope/crosslinks in the scoped
//     walk.
//   HOST-5 (LOW) — the `seen`-set cycle protection is effectively unreachable:
//     `validateDocFlow` Rule 4 detects ANY doc-child nesting cycle and falls
//     back to family pre-order (nestDocChildren = false) before the `seen` set
//     is consulted. This file pins that a doc-child cycle terminates via the
//     fallback (no infinite loop) and the spec §5.1 step 9 is reconciled.
//   HOST-6 (LOW) — `rag.get_document` with a document id not in the store
//     returns `nodes: []`, not `[<doc root>]`. Pinned here + documented in the
//     spec.
//   HOST-8 (LOW) — `rebuildBackRefs` empty-snapshot path was untested. Pinned
//     here: `rebuildBackRefs([], [], 'main')` returns an empty `Map` (never
//     throws).
//
// HOST-1 (tracker staleness) and HOST-7 (informational) are handled by the
// supervisor/doc-review — NOT fixed here.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildTraversal,
  rebuildBackRefs,
  type TraversalResult,
} from '../src/main/traversal.js'
import {
  createJsonRagStore,
  createSnapshotStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import { validateDocFlow } from '../src/main/doc-flow.js'
import { handleRagTool } from '../src/main/mcp-server.js'
import type { LegacyInitialData, LegacyContentPayload } from 'provident-ssr'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

// ---- fixtures (persisted shapes, Unit A §5.1) ------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-v2-adv-'))
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

/** The ContentPayload whose subtree root carries the stable authored id
 *  `rag-<ragNodeId>` (§5.2 rule 2). */
function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

// ---- the reference "old all-edges walk" materialized set --------------------
// A faithful re-derivation of the CURRENT (pre-scoped) buildTraversal's
// `materialized` set (the RAG ids that get a content root: sections + nested
// doc-children + multi-parent duplicates) from the FULL-edge logic. Used by the
// HOST-2/HOST-4 tests to pin the scoped walk against the old walk.
function referenceAllEdgesMaterialized(nodes: RagNode[], edges: RagEdge[], documentId: string): Set<string> {
  const docNodeIds = new Set<string>([documentId])
  for (const e of edges) {
    if (e.documentIds?.includes(documentId)) {
      docNodeIds.add(e.source)
      docNodeIds.add(e.target)
    }
  }
  let changed = true
  while (changed) {
    changed = false
    for (const e of edges) {
      if (e.kind === 'doc-child' && docNodeIds.has(e.source) && !docNodeIds.has(e.target)) {
        docNodeIds.add(e.target)
        changed = true
      }
    }
  }
  const verdict = validateDocFlow(nodes, edges, documentId)
  let sections: string[]
  let nestDocChildren: boolean
  if (verdict.ok) {
    sections = verdict.order.filter((id) => id !== documentId)
    nestDocChildren = true
  } else {
    sections = nodes.filter((n) => docNodeIds.has(n.id) && n.id !== documentId).map((n) => n.id)
    nestDocChildren = false
  }
  const materialized = new Set<string>()
  const buildSubtree = (ragId: string): void => {
    materialized.add(ragId)
    if (nestDocChildren) {
      const docChildren = edges
        .filter((e) => e.kind === 'doc-child' && e.source === ragId)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      for (const dc of docChildren) buildSubtree(dc.target)
    }
  }
  for (const s of sections) buildSubtree(s)
  const sectionSet = new Set(sections)
  const docChildTargets = new Set(
    edges.filter((e) => e.kind === 'doc-child' && docNodeIds.has(e.source)).map((e) => e.target),
  )
  for (const node of nodes) {
    if (node.id === documentId) continue
    if (sectionSet.has(node.id)) continue
    if (docChildTargets.has(node.id)) continue
    const parents = edges
      .filter((e) => e.kind === 'parent-child' && e.target === node.id && sectionSet.has(e.source))
      .map((e) => e.source)
    if (parents.length >= 2) {
      for (let i = 0; i < parents.length; i++) buildSubtree(node.id)
    }
  }
  return materialized
}

// ===========================================================================
// HOST-2 (MED) — cross-document shared fixture (B/C → A → D, §5.6 happy 7)
// ===========================================================================

describe('HOST-2 — cross-document shared fixture equivalence (amendment 1)', () => {
  it('the scoped walk\'s materialized set equals the old all-edges walk\'s for a node shared across two documents', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // B/C → A → D: A is a SECTION in BOTH document B and document C (a shared
      // node); D is a doc-child of A. A is materialized as a duplicate subtree
      // in each document, both sharing the RAG id in the backRefs map (§5.6
      // happy 7).
      const nodes: RagNode[] = [
        makeNode('docB', { type: 'div' }),
        makeNode('headB', { type: 'h1', content: 'B title' }),
        makeNode('A', { type: 'p', content: 'Shared A' }),
        makeNode('endB', { type: 'p', content: 'B end' }),
        makeNode('docC', { type: 'div' }),
        makeNode('headC', { type: 'h1', content: 'C title' }),
        makeNode('endC', { type: 'p', content: 'C end' }),
        makeNode('D', { type: 'p', content: 'D' }),
      ]
      const edges: RagEdge[] = [
        makeEdge('e-headB', 'doc-head', 'headB', 'docB', { documentIds: ['docB'] }),
        makeEdge('e-nB1', 'next-section', 'headB', 'A', { documentIds: ['docB'] }),
        makeEdge('e-nB2', 'next-section', 'A', 'endB', { documentIds: ['docB'] }),
        makeEdge('e-endB', 'doc-end', 'endB', 'docB', { documentIds: ['docB'] }),
        makeEdge('e-headC', 'doc-head', 'headC', 'docC', { documentIds: ['docC'] }),
        makeEdge('e-nC1', 'next-section', 'headC', 'A', { documentIds: ['docC'] }),
        makeEdge('e-nC2', 'next-section', 'A', 'endC', { documentIds: ['docC'] }),
        makeEdge('e-endC', 'doc-end', 'endC', 'docC', { documentIds: ['docC'] }),
        makeEdge('e-d', 'doc-child', 'A', 'D', { order: 0 }),
      ]
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({ store, documentIds: ['docB', 'docC'], zoneName: 'main' })
      const scopedMaterialized = new Set(result.backRefs.keys())

      // The old all-edges walk's materialized set, per document, unioned.
      const refB = referenceAllEdgesMaterialized(nodes, edges, 'docB')
      const refC = referenceAllEdgesMaterialized(nodes, edges, 'docC')
      const reference = new Set<string>([...refB, ...refC])

      expect(scopedMaterialized).toEqual(reference)
      // A is materialized (shared across both documents — the duplicate subtree
      // per parent, both sharing the RAG id in the backRefs map).
      expect(scopedMaterialized.has('A')).toBe(true)
      // D (A's doc-child) is materialized in BOTH documents.
      expect(scopedMaterialized.has('D')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// HOST-3 (MED) — computeDocumentSubgraph malformed-input cases
// ===========================================================================

describe('HOST-3 — computeDocumentSubgraph malformed-input cases', () => {
  it('a doc-head edge with a missing target → no crash; buildTraversal falls back to family pre-order', async () => {
    // The doc-head edge's TARGET (the document root 'doc') does not exist.
    // createSnapshotStore allows edges referencing missing nodes (the JSON
    // store's putEdge rejects them at seed time).
    const nodes: RagNode[] = [makeNode('head', { type: 'h1', content: 'Title' })]
    const edges: RagEdge[] = [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    ]
    const store = createSnapshotStore(nodes, edges)

    // computeDocumentSubgraph does not crash: docNodeIds = {doc, head}.
    const subgraph = (await import('../src/main/traversal.js')).computeDocumentSubgraph(store, 'doc')
    expect(subgraph.docNodeIds).toEqual(new Set(['doc', 'head']))

    // buildTraversal falls back (validateDocFlow → missing-node on the doc-head
    // target) — no crash, the envelope still renders.
    let result: TraversalResult
    expect(() => {
      result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
    }).not.toThrow()
    expect(result!.envelope.content!.length).toBeGreaterThan(0)
  })

  it('a doc-child edge with a missing target → no crash; the missing target is still in docNodeIds', async () => {
    const nodes: RagNode[] = [
      makeNode('doc', { type: 'div' }),
      makeNode('head', { type: 'h1', content: 'Title' }),
      makeNode('ul', { type: 'ul', content: 'List' }),
    ]
    const edges: RagEdge[] = [
      makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-n1', 'next-section', 'head', 'ul', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 'ul', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-c', 'doc-child', 'ul', 'li', { order: 0 }), // 'li' node missing
    ]
    const store = createSnapshotStore(nodes, edges)

    const subgraph = (await import('../src/main/traversal.js')).computeDocumentSubgraph(store, 'doc')
    // The doc-child closure adds the missing target 'li' to docNodeIds (no crash).
    expect(subgraph.docNodeIds).toEqual(new Set(['doc', 'head', 'ul', 'li']))
    // The doc-child edge is kept (both endpoints in docNodeIds).
    expect(subgraph.edges.some((e) => e.id === 'e-c')).toBe(true)
  })

  it('a document id not in the store → { documentId } + [] (no crash)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const nodes: RagNode[] = [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'S1' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ]
      const edges: RagEdge[] = [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      ]
      await seedStore(store, nodes, edges)

      const subgraph = (await import('../src/main/traversal.js')).computeDocumentSubgraph(store, 'ghost')
      expect(subgraph.docNodeIds).toEqual(new Set(['ghost']))
      expect(subgraph.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('an empty document with doc-child edges present elsewhere → { documentId } + [] (no leak)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // 'doc' is an empty document (no edges). A doc-child edge exists in the
      // store but belongs to ANOTHER document (otherUl → otherLi).
      const nodes: RagNode[] = [
        makeNode('doc', { type: 'div' }),
        makeNode('otherDoc', { type: 'div' }),
        makeNode('otherHead', { type: 'h1', content: 'Other' }),
        makeNode('otherUl', { type: 'ul', content: 'Other list' }),
        makeNode('otherLi', { type: 'li', content: 'Other item' }),
      ]
      const edges: RagEdge[] = [
        makeEdge('e-head', 'doc-head', 'otherHead', 'otherDoc', { documentIds: ['otherDoc'] }),
        makeEdge('e-n1', 'next-section', 'otherHead', 'otherUl', { documentIds: ['otherDoc'] }),
        makeEdge('e-end', 'doc-end', 'otherUl', 'otherDoc', { documentIds: ['otherDoc'] }),
        makeEdge('e-c', 'doc-child', 'otherUl', 'otherLi', { order: 0 }),
      ]
      await seedStore(store, nodes, edges)

      const subgraph = (await import('../src/main/traversal.js')).computeDocumentSubgraph(store, 'doc')
      // The doc-child edge elsewhere does NOT leak into the empty document.
      expect(subgraph.docNodeIds).toEqual(new Set(['doc']))
      expect(subgraph.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// HOST-4 (LOW) — the edit-surface change exercises the accepted shrink
// ===========================================================================

describe('HOST-4 — the edit-surface change drops a node the OLD walk materializes', () => {
  it('a node reachable only via a path not reachable from the head is dropped from backRefs/envelope/crosslinks in the scoped walk', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // A document with a MISSING doc-end (so validateDocFlow fails → family
      // pre-order fallback). 'ghost' is reachable ONLY via a doc-child edge
      // (ghost → orphan) that carries documentIds ['doc'] — a path NOT
      // reachable from the head. The OLD all-edges walk's docNodeIds includes
      // ghost/orphan (the doc-child edge's documentIds pull them in), so the
      // fallback materializes them as sections. The scoped walk's
      // computeDocumentSubgraph does NOT pull them in (the doc-child edge is
      // skipped in the first loop and ghost is not reachable from the head), so
      // the scoped walk drops them — the accepted edit-surface shrink.
      const nodes: RagNode[] = [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'S1' }),
        makeNode('ghost', { type: 'p', content: 'Ghost' }),
        makeNode('orphan', { type: 'p', content: 'Orphan' }),
      ]
      const edges: RagEdge[] = [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        // NO doc-end → validateDocFlow fails (missing-end) → fallback.
        makeEdge('e-dc', 'doc-child', 'ghost', 'orphan', { documentIds: ['doc'] }),
        makeEdge('e-x', 'crosslink', 'ghost', 'head'),
      ]
      await seedStore(store, nodes, edges)

      // The OLD all-edges walk materializes ghost AND orphan (the fallback
      // treats every docNodeIds member as a section).
      const reference = referenceAllEdgesMaterialized(nodes, edges, 'doc')
      expect(reference.has('ghost')).toBe(true)
      expect(reference.has('orphan')).toBe(true)

      // The scoped walk drops them (the accepted shrink).
      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      expect(result.backRefs.has('ghost')).toBe(false)
      expect(result.backRefs.has('orphan')).toBe(false)
      expect(findPayloadByRootId(result.envelope, 'ghost')).toBeUndefined()
      expect(findPayloadByRootId(result.envelope, 'orphan')).toBeUndefined()
      // The crosslink whose SOURCE is ghost (not materialized) is dropped
      // (outgoing-only wiring).
      expect(result.crosslinks.some((c) => c.sourceRagNodeId === 'ghost')).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// HOST-5 (LOW) — the seen-set cycle protection is effectively unreachable
// ===========================================================================

describe('HOST-5 — a doc-child cycle terminates via the family-pre-order fallback', () => {
  it('a doc-child nesting cycle short-circuits to the fallback (no infinite loop, no throw)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // A doc-child nesting cycle A → B → A. validateDocFlow Rule 4 detects the
      // cycle and returns the `cycle` verdict, so the traversal falls back to
      // family pre-order (nestDocChildren = false) — the `seen` set is never
      // consulted. The traversal must terminate (no infinite loop) and render.
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
      // The fallback materializes the doc-child nodes as SEPARATE sections
      // (nestDocChildren = false) — both A and B get their own backRefs entry.
      expect(result!.backRefs.has('A')).toBe(true)
      expect(result!.backRefs.has('B')).toBe(true)
      expect(result!.envelope.content!.length).toBeGreaterThan(0)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// HOST-6 (LOW) — rag.get_document with a document id not in the store
// ===========================================================================

describe('HOST-6 — rag.get_document with an unknown document id', () => {
  it('returns { documentId, nodes: [], edges: [] } (not [<doc root>])', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('s1', { type: 'p', content: 'S1' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 's1', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
      ])

      const result = await handleRagTool(store, 'rag.get_document', { documentId: 'ghost' }) as {
        documentId: string
        nodes: RagNode[]
        edges: RagEdge[]
      }
      expect(result.documentId).toBe('ghost')
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// HOST-8 (LOW) — rebuildBackRefs empty-snapshot path
// ===========================================================================

describe('HOST-8 — rebuildBackRefs empty-snapshot path', () => {
  it('rebuildBackRefs([], [], "main") returns an empty Map (never throws)', () => {
    const backRefs = rebuildBackRefs([], [], 'main')
    expect(backRefs).toBeInstanceOf(Map)
    expect(backRefs.size).toBe(0)
  })
})
