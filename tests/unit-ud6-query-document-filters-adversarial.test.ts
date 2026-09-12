// tests/unit-ud6-query-document-filters-adversarial.test.ts — Unit U-D6
// POST-GREEN adversarial regression (RCA-3). Finding F1 (HIGH, HOST):
//
//   `edgeMatchesDocumentFilters` did not consult `hasDocumentFilters`, so a
//   graph-mode crosslink whose owning-document set is EMPTY (both endpoints
//   belong to no document) was REJECTED whenever `filters` was any
//   non-undefined object — e.g. `{}`, `{ nodeKind: 'fact' }`,
//   `{ documentPathPrefix: [] }`, `{ tags: [] }`. That breaks the pinned
//   "no constraint = true / byte-equal to pre-U-D6" rule (§5.5.2, A1) and the
//   flat/graph consistency rule (A11).
//
// This file is RED-FIRST (RCA-1): the no-constraint graph cases fail on the
// pre-fix build; the active-constraint guard passes both before and after.
// Harness derived from tests/unit-ud6-query-document-filters.test.ts.
import { describe, it, expect, afterAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  ragQuery,
  createLexicalIndex,
  createLexicalEmbedder,
  type LocalRagQueryFilters,
  type RagResult,
} from '../src/main/retrieval.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'

const tempDirs: string[] = []

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ud6-adv-'))
  tempDirs.push(dir)
  return dir
}

afterAll(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-11T00:00:00.000Z'
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

function makeEdge(id: string, source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = '2026-09-11T00:00:00.000Z'
  return {
    id,
    kind: 'parent-child',
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

/** Two nodes that belong to NO document, joined by an in-document-style
 *  crosslink: a reference seed (`refU`) resolving to a fact target (`factU`).
 *  `documentIdsForNode` returns `[]` for BOTH endpoints and the edge carries
 *  no `documentIds`. */
async function seedUnownedCrosslink(store: RagStore): Promise<void> {
  await store.putNode(makeNode('refU', { content: 'alpha', nodeKind: 'reference' }))
  await store.putNode(makeNode('factU', { content: 'fact U', nodeKind: 'fact' }))
  await store.putEdge(makeEdge('xU', 'refU', 'factU', { kind: 'crosslink', edgeType: 'link', state: 'RESOLVED' }))
}

function indexAndEmbedder(store: RagStore): {
  index: ReturnType<typeof createLexicalIndex>
  embedder: ReturnType<typeof createLexicalEmbedder>
} {
  const index = createLexicalIndex(store.listNodes())
  return { index, embedder: createLexicalEmbedder(index) }
}

async function graphWithFilters(store: RagStore, filters: LocalRagQueryFilters | undefined): Promise<RagResult> {
  const { index, embedder } = indexAndEmbedder(store)
  return ragQuery(store, embedder, index, 'alpha', { topK: 50, mode: 'graph', filters })
}

function resultNodeIds(r: RagResult): string[] {
  return r.results.map((x) => x.nodeId)
}

// ===========================================================================
// F1 (HIGH) — no document constraint must be byte-equal for an unowned edge
// ===========================================================================
describe('U-D6 adversarial — F1: an unowned crosslink is not excluded by a NON-document filter object', () => {
  it('graph mode over two UNOWNED nodes returns byte-equal results for no filters, {}, {nodeKind:fact}, {documentPathPrefix:[]}, {tags:[]}', async () => {
    const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await seedUnownedCrosslink(store)

    const base = await graphWithFilters(store, undefined)
    // Guard: with NO filters the unowned crosslink resolves the fact target —
    // so a difference below can only be the F1 rejection, not an empty fixture.
    expect(resultNodeIds(base)).toEqual(['factU'])

    const noConstraint: LocalRagQueryFilters[] = [
      {},
      { nodeKind: 'fact' },
      { documentPathPrefix: [] },
      { tags: [] },
      { documentPathPrefix: [], tags: [] },
    ]
    for (const filters of noConstraint) {
      const r = await graphWithFilters(store, filters)
      expect(
        JSON.stringify(r),
        `filters=${JSON.stringify(filters)} must be byte-equal to omitted filters`,
      ).toBe(JSON.stringify(base))
    }
  })

  it('an ACTIVE documentPathPrefix still EXCLUDES the unowned nodes (the fix must not over-include)', async () => {
    const store = createJsonRagStore({ path: join(freshDir(), 'rag.json') })
    await seedUnownedCrosslink(store)

    // Unconstrained: the unowned fact resolves.
    expect(resultNodeIds(await graphWithFilters(store, undefined))).toEqual(['factU'])
    // Active constraint: neither endpoint owns a document, so the seed is
    // filtered out and no target resolves.
    expect(resultNodeIds(await graphWithFilters(store, { documentPathPrefix: ['x'] }))).toEqual([])
    expect(resultNodeIds(await graphWithFilters(store, { tags: ['x'] }))).toEqual([])
    // A filter object carrying ONLY base fields is still not a document
    // constraint (nodeKind alone must not exclude the unowned edge).
    expect(resultNodeIds(await graphWithFilters(store, { edgeType: 'link' }))).toEqual(['factU'])
    expect(resultNodeIds(await graphWithFilters(store, { state: 'RESOLVED' }))).toEqual(['factU'])
  })
})
