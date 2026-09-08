// tests/unit-f1-merge-store-results.test.ts — Unit F1: the pure
// `mergeStoreResults` module (cross-store fan-out)
// (docs/specs/unit-f1-merge-store-results.md §5.8 happy-path states + §5.9
// fail-states + §5.3 score-floor + §5.7 determinism). The RED set for the NEW:
//   - src/main/merge-store-results.ts
//     - the rank-based round-robin interleave (D1, §5.2)
//     - the `score > 0` floor NOT re-applied (§5.3)
//     - the skip-failed/empty behavior (D6, §5.4)
//     - the merged result shape (D2/D4, §5.5)
//     - the fail-states (§5.6/§5.9)
//
// Follows the retrieval.test.ts / rag-store.test.ts / unit-x-... conventions
// (vitest node environment, `.js` import suffix for the main-process ESM
// module). The merge is PURE — it takes `{ name, result }` inputs, not stores,
// so per-store `RagResult` objects are constructed directly from the `RagResult`
// / `RagResultItem` / `FlatTrace` / `ScoredNode` / `RagNode` / `LineNodeMap`
// shapes imported from `src/main/retrieval.js`.
//
// DATA STATES COVERED (from §5.8):
//   1. two stores, equal lengths                 → [a1,b1,a2,b2] round-robin
//   2. two stores, unequal lengths               → [a1,b1,a2,a3] (B exhausted)
//   3. three stores, one empty                   → [a1,c1,a2] (B → zero, D6)
//   4. a failed store (null result)              → [a1,c1] (B SKIPPED, no throw, D6)
//   5. citations dedup across stores             → (d1,n1) cited ONCE
//   6. the default store's block                 → ranked/context/markdown/lineMap/k = index-0's
//   7. the merged flat trace                     → { mode:'flat', engine:'local', topK, source:'local' }
//   8. the merged engine                         → 'local'
//   9. the merged query                          → the default store's query
//   10. no `blockedBy`                           → flat-only (D4)
//   11. merged length bound                      → ≤ N×topK (D1)
//   12. determinism                              → same input → same merged result (twice)
//   13. `opts` omitted / `opts` null             → merged trace topK = 5
//   14. a single store                           → results/block/citations preserved
//   §5.3 score floor                             → a score ≤ 0 item interleaved verbatim
//   D6 pinned non-throws                         → null-result non-default store & empty results → no throw
//
// FAIL-STATES COVERED (from §5.9):
//   1. stores null/undefined                     → 'mergeStoreResults: stores required'
//   2. stores not an array                       → 'mergeStoreResults: stores required'
//   3. stores empty                              → 'mergeStoreResults: stores must not be empty'
//   4. a stores element null/undefined           → 'mergeStoreResults: store entry required'
//   5. name not a non-empty string               → 'mergeStoreResults: store name must be a non-empty string'
//   6. result present but results not an array   → 'mergeStoreResults: store results must be an array'
//   7. default store result null/undefined       → 'mergeStoreResults: default store result required'
//   8. opts.topK not a positive int in [1, 50]   → 'mergeStoreResults: topK must be an integer in [1, 50]'
//
// RED: `src/main/merge-store-results.ts` does NOT exist yet, so this file FAILS
// TO LOAD (the static import resolves to nothing) — the entire test set is the
// red set for the not-yet-implemented module.
import { describe, it, expect } from 'vitest'
import {
  mergeStoreResults,
  type StoreResultInput,
} from '../src/main/merge-store-results.js'
import {
  type RagResult,
  type RagResultItem,
  type RagNode,
  type ScoredNode,
  type LineNodeMap,
} from '../src/main/retrieval.js'

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

function makeItem(documentId: string, nodeId: string, overrides: Partial<RagResultItem> = {}): RagResultItem {
  return {
    documentId,
    nodeId,
    score: 1,
    snippet: `snippet-${nodeId}`,
    source: 'local',
    ...overrides,
  }
}

function makeLineMap(nodeId: string): LineNodeMap {
  return { ranges: [{ nodeId, startLine: 1, endLine: 3 }] }
}

// A per-store `RagResult`, constructed directly (the merge is pure — it takes
// `{ name, result }` inputs, not stores). The defaults mirror a flat-mode
// `ragQuery` output (§5.2 of unit-x + §5.5 of unit-f1).
function makeStoreResult(overrides: Partial<RagResult> = {}): RagResult {
  return {
    query: 'shared query',
    results: [],
    engine: 'local',
    citations: [],
    trace: { mode: 'flat', engine: 'local', topK: 5, source: 'local' },
    ranked: [],
    context: [],
    markdown: '',
    lineMap: { ranges: [] },
    k: 5,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// The interleave (§5.2) — happy-path states 1, 2, 3, 11 + the §5.3 floor
// ---------------------------------------------------------------------------
describe('Unit F1 — the rank-based interleave (§5.2)', () => {
  it('§5.8-1. two stores, equal lengths → round-robin by rank: [a1,b1,a2,b2]', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2')],
    })
    const b = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'b1'), makeItem('d2', 'b2')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
    const merged = mergeStoreResults(stores)
    expect(merged.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'b2'])
  })

  it('§5.8-2. two stores, unequal lengths → [a1,b1,a2,a3] (B exhausted after rank 1)', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2'), makeItem('d1', 'a3')],
    })
    const b = makeStoreResult({
      results: [makeItem('d2', 'b1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
    const merged = mergeStoreResults(stores)
    expect(merged.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'a3'])
  })

  it('§5.8-3. three stores, one empty → [a1,c1,a2] (the empty store contributes zero, D6)', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2')],
    })
    const b = makeStoreResult({
      query: 'shared query',
      results: [],
    })
    const c = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d3', 'c1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
      { name: 'storeC', result: c },
    ]
    const merged = mergeStoreResults(stores)
    expect(merged.results.map((i) => i.nodeId)).toEqual(['a1', 'c1', 'a2'])
  })

  it('§5.8-11. merged length bound: with N stores each ≤ topK results, the merged length ≤ N×topK', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2')],
    })
    const b = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'b1'), makeItem('d2', 'b2')],
    })
    const c = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d3', 'c1'), makeItem('d3', 'c2')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
      { name: 'storeC', result: c },
    ]
    const merged = mergeStoreResults(stores, { topK: 2 })
    const N = stores.length
    expect(merged.results.length).toBeLessThanOrEqual(N * 2)
  })

  it('§5.3 score floor NOT re-applied: a per-store item with score ≤ 0 is interleaved verbatim', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2', { score: -0.5 }), makeItem('d1', 'a3', { score: 0 })],
    })
    const b = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'b1'), makeItem('d2', 'b2')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
    const merged = mergeStoreResults(stores)
    // all five items survive the merge — the merge NEVER filters on score
    expect(merged.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2', 'b2', 'a3'])
    const low = merged.results.find((i) => i.nodeId === 'a2')
    expect(low!.score).toBe(-0.5)
    const zero = merged.results.find((i) => i.nodeId === 'a3')
    expect(zero!.score).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Skip-failed/empty (D6, §5.4) — the happy-path state 4 + the pinned non-throws
// ---------------------------------------------------------------------------
describe('Unit F1 — skip-failed/empty (§5.4)', () => {
  it('§5.8-4. a failed store (null result) → [a1,c1]; the null-result store is SKIPPED, no throw', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1')],
    })
    const c = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d3', 'c1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: null },
      { name: 'storeC', result: c },
    ]
    const merged = mergeStoreResults(stores)
    expect(merged.results.map((i) => i.nodeId)).toEqual(['a1', 'c1'])
  })

  it('§5.9 pinned non-throw: an `undefined` result on a NON-default store is ALSO skipped (not a throw)', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: undefined },
    ]
    expect(() => mergeStoreResults(stores)).not.toThrow()
    expect(mergeStoreResults(stores).results.map((i) => i.nodeId)).toEqual(['a1'])
  })

  it('§5.9 pinned non-throw: a store with an empty `results` array contributes zero (no throw)', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: makeStoreResult({ query: 'shared query', results: [] }) },
    ]
    expect(() => mergeStoreResults(stores)).not.toThrow()
    expect(mergeStoreResults(stores).results.map((i) => i.nodeId)).toEqual(['a1'])
  })
})

// ---------------------------------------------------------------------------
// The merged result shape (§5.5) — the happy-path states 5–10, 14
// ---------------------------------------------------------------------------
describe('Unit F1 — the merged result shape (§5.5)', () => {
  const fixture = (): StoreResultInput[] => {
    const a = makeStoreResult({
      query: 'query-A',
      results: [makeItem('d1', 'n1'), makeItem('d2', 'n2')],
      ranked: [{ nodeId: 'n1', score: 1 }] as ScoredNode[],
      context: [makeNode('n1')],
      markdown: 'markdown-A',
      lineMap: makeLineMap('n1'),
      k: 3,
    })
    const b = makeStoreResult({
      query: 'query-B',
      results: [makeItem('d1', 'n1'), makeItem('d3', 'n3')],
      ranked: [{ nodeId: 'nX', score: 0.5 }] as ScoredNode[],
      context: [makeNode('nX')],
      markdown: 'markdown-B',
      lineMap: makeLineMap('nX'),
      k: 7,
    })
    return [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
  }

  it('§5.8-9. the merged `query` = the default store\'s (first entry\'s) query', () => {
    const merged = mergeStoreResults(fixture())
    expect(merged.query).toBe('query-A')
  })

  it('§5.8-8. the merged `engine` = "local"', () => {
    const merged = mergeStoreResults(fixture())
    expect(merged.engine).toBe('local')
  })

  it('§5.8-5. citations dedup across stores: (d1,n1) appears in both → cited ONCE (first appearance)', () => {
    const merged = mergeStoreResults(fixture())
    // interleaved: [a(d1,n1), b(d1,n1), a(d2,n2), b(d3,n3)] → dedup (d1,n1),(d2,n2),(d3,n3)
    expect(merged.citations).toEqual([
      { documentId: 'd1', nodeId: 'n1' },
      { documentId: 'd2', nodeId: 'n2' },
      { documentId: 'd3', nodeId: 'n3' },
    ])
  })

  it('§5.8-6. the default store\'s block: ranked/context/markdown/lineMap/k = the FIRST entry\'s', () => {
    const merged = mergeStoreResults(fixture())
    expect(merged.ranked).toEqual([{ nodeId: 'n1', score: 1 }])
    expect(merged.context).toEqual([expect.objectContaining({ id: 'n1' })])
    expect(merged.markdown).toBe('markdown-A')
    expect(merged.lineMap).toEqual({ ranges: [{ nodeId: 'n1', startLine: 1, endLine: 3 }] })
    expect(merged.k).toBe(3)
  })

  it('§5.8-7. the merged flat trace = { mode: "flat", engine: "local", topK: 5, source: "local" }', () => {
    const merged = mergeStoreResults(fixture(), { topK: 5 })
    expect(merged.trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
  })

  it('§5.8-10. the merged result carries NO `blockedBy` (flat-only, D4)', () => {
    const merged = mergeStoreResults(fixture())
    expect((merged as Record<string, unknown>).blockedBy).toBeUndefined()
  })

  it('§5.8-14. a single store → the merged results/block/citations/trace preserve the single store (deduped)', () => {
    const a = makeStoreResult({
      query: 'query-A',
      results: [makeItem('d1', 'n1'), makeItem('d1', 'n1'), makeItem('d2', 'n2')],
      markdown: 'markdown-A',
      k: 4,
    })
    const merged = mergeStoreResults([{ name: 'storeA', result: a }], { topK: 4 })
    expect(merged.results).toHaveLength(3)
    expect(merged.results.map((i) => i.nodeId)).toEqual(['n1', 'n1', 'n2'])
    expect(merged.query).toBe('query-A')
    expect(merged.markdown).toBe('markdown-A')
    expect(merged.k).toBe(4)
    expect(merged.citations).toEqual([{ documentId: 'd1', nodeId: 'n1' }, { documentId: 'd2', nodeId: 'n2' }])
    expect(merged.trace).toEqual({ mode: 'flat', engine: 'local', topK: 4, source: 'local' })
  })
})

// ---------------------------------------------------------------------------
// `opts` handling — the happy-path state 13
// ---------------------------------------------------------------------------
describe('Unit F1 — `opts` handling (opts optional, default topK)', () => {
  it("§5.8-13. `opts` omitted → the merged trace's topK = 5 (the default)", () => {
    const a = makeStoreResult({ results: [makeItem('d1', 'a1')] })
    const merged = mergeStoreResults([{ name: 'storeA', result: a }])
    expect(merged.trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
  })

  it("§5.8-13. `opts` null/undefined → treated as {} → the merged trace's topK = 5", () => {
    const a = makeStoreResult({ results: [makeItem('d1', 'a1')] })
    const stores: StoreResultInput[] = [{ name: 'storeA', result: a }]
    expect(mergeStoreResults(stores, null as never).trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
    expect(mergeStoreResults(stores, undefined).trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
  })
})

// ---------------------------------------------------------------------------
// Determinism (§5.7) — the happy-path state 12
// ---------------------------------------------------------------------------
describe('Unit F1 — determinism (§5.7)', () => {
  it('§5.8-12. the same input → the same merged result (twice)', () => {
    const a = makeStoreResult({
      results: [makeItem('d1', 'a1'), makeItem('d1', 'a2')],
      markdown: 'markdown-A',
      k: 5,
    })
    const b = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'b1')],
    })
    const c = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d3', 'c1')],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
      { name: 'storeC', result: c },
    ]
    const first = mergeStoreResults(stores, { topK: 5 })
    const second = mergeStoreResults(stores, { topK: 5 })
    expect(first).toEqual(second)
  })
})

// ---------------------------------------------------------------------------
// Fail-states (§5.6/§5.9) — the 8 documented throws
// ---------------------------------------------------------------------------
describe('Unit F1 — fail-states (§5.6/§5.9)', () => {
  it('§5.9-1. `stores` null/undefined → throws "mergeStoreResults: stores required"', () => {
    expect(() => mergeStoreResults(null as never)).toThrow('mergeStoreResults: stores required')
    expect(() => mergeStoreResults(undefined as never)).toThrow('mergeStoreResults: stores required')
  })

  it('§5.9-2. `stores` not an array → throws "mergeStoreResults: stores required"', () => {
    expect(() => mergeStoreResults(42 as never)).toThrow('mergeStoreResults: stores required')
    expect(() => mergeStoreResults({} as never)).toThrow('mergeStoreResults: stores required')
  })

  it('§5.9-3. `stores` an empty array → throws "mergeStoreResults: stores must not be empty"', () => {
    expect(() => mergeStoreResults([])).toThrow('mergeStoreResults: stores must not be empty')
  })

  it('§5.9-4. a `stores` element null/undefined → throws "mergeStoreResults: store entry required"', () => {
    const good = { name: 'storeA', result: makeStoreResult() }
    expect(() => mergeStoreResults([null as never])).toThrow('mergeStoreResults: store entry required')
    expect(() => mergeStoreResults([undefined as never])).toThrow('mergeStoreResults: store entry required')
    expect(() => mergeStoreResults([good, null as never])).toThrow('mergeStoreResults: store entry required')
  })

  it('§5.9-5. a store element\'s `name` not a non-empty string → throws "mergeStoreResults: store name must be a non-empty string"', () => {
    const entry = makeStoreResult()
    expect(() => mergeStoreResults([{ name: '', result: entry }])).toThrow('mergeStoreResults: store name must be a non-empty string')
    expect(() => mergeStoreResults([{ name: '   ', result: entry }])).toThrow('mergeStoreResults: store name must be a non-empty string')
    expect(() => mergeStoreResults([{ name: 42 as never, result: entry }])).toThrow('mergeStoreResults: store name must be a non-empty string')
    expect(() => mergeStoreResults([{ name: null as never, result: entry }])).toThrow('mergeStoreResults: store name must be a non-empty string')
  })

  it('§5.9-6. a store element\'s `result` present but `results` not an array → throws "mergeStoreResults: store results must be an array"', () => {
    const bad = makeStoreResult({ results: 42 as never } as Partial<RagResult>)
    expect(() => mergeStoreResults([{ name: 'storeA', result: bad }])).toThrow('mergeStoreResults: store results must be an array')
  })

  it('§5.9-7. the default store (first entry) has a null/undefined `result` → throws "mergeStoreResults: default store result required"', () => {
    expect(() => mergeStoreResults([{ name: 'storeA', result: null }])).toThrow('mergeStoreResults: default store result required')
    expect(() => mergeStoreResults([{ name: 'storeA', result: undefined }])).toThrow('mergeStoreResults: default store result required')
  })

  it('§5.9-8. `opts.topK` present but not a positive integer in [1, 50] → throws "mergeStoreResults: topK must be an integer in [1, 50]"', () => {
    const a = makeStoreResult()
    const stores: StoreResultInput[] = [{ name: 'storeA', result: a }]
    expect(() => mergeStoreResults(stores, { topK: 0 })).toThrow('mergeStoreResults: topK must be an integer in [1, 50]')
    expect(() => mergeStoreResults(stores, { topK: 51 })).toThrow('mergeStoreResults: topK must be an integer in [1, 50]')
    expect(() => mergeStoreResults(stores, { topK: 1.5 })).toThrow('mergeStoreResults: topK must be an integer in [1, 50]')
    expect(() => mergeStoreResults(stores, { topK: -3 })).toThrow('mergeStoreResults: topK must be an integer in [1, 50]')
  })
})

// ---------------------------------------------------------------------------
// Adversarial-regression findings (F-F1-2 + F-F1-3) — fixed + regression-tested
// ---------------------------------------------------------------------------
describe('Unit F1 — adversarial regressions (F-F1-2 default-block + F-F1-3 sparse skip)', () => {
  it('F-F1-2. the default store result with a valid `results` array but MISSING ranked/context → defensive throw', () => {
    const badDefault = {
      ...makeStoreResult({ results: [makeItem('d1', 'a1')] }),
      ranked: undefined,
      context: undefined,
    } as unknown as RagResult
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: badDefault },
      { name: 'storeB', result: makeStoreResult({ query: 'shared query', results: [makeItem('d2', 'b1')] }) },
    ]
    expect(() => mergeStoreResults(stores)).toThrow()
  })

  it('F-F1-2. the default store result with a valid `results` array but MISSING markdown → defensive throw', () => {
    const badDefault = {
      ...makeStoreResult({ results: [makeItem('d1', 'a1')] }),
      markdown: undefined,
    } as unknown as RagResult
    expect(() => mergeStoreResults([{ name: 'storeA', result: badDefault }])).toThrow()
  })

  it('F-F1-2. the default store result with all block fields present → NO throw (guard does not fire on a valid default)', () => {
    const goodDefault = makeStoreResult({ results: [makeItem('d1', 'a1')] })
    expect(() => mergeStoreResults([{ name: 'storeA', result: goodDefault }])).not.toThrow()
  })

  it('F-F1-3. a non-default store with a `null` element in `results` → the null is SKIPPED, later items are still reached', () => {
    const a = makeStoreResult({ results: [makeItem('d1', 'a1'), makeItem('d1', 'a2')] })
    const b = makeStoreResult({
      query: 'shared query',
      results: [
        makeItem('d2', 'b1'),
        null,
        makeItem('d2', 'b2'),
      ] as unknown as RagResultItem[],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
    const merged = mergeStoreResults(stores)
    const ids = merged.results.map((i) => i.nodeId)
    // round-robin: rank0 → a1, b1; rank1 → a2, (null SKIPPED); rank2 → b2
    expect(ids).toEqual(['a1', 'b1', 'a2', 'b2'])
    expect(merged.results).toHaveLength(4)
  })

  it('F-F1-3. a non-default store with a `undefined` element in `results` → the undefined is SKIPPED, no `undefined` leaks', () => {
    const a = makeStoreResult({ results: [makeItem('d1', 'a1')] })
    const b = makeStoreResult({
      query: 'shared query',
      results: [
        undefined,
        makeItem('d2', 'b1'),
      ] as unknown as RagResultItem[],
    })
    const stores: StoreResultInput[] = [
      { name: 'storeA', result: a },
      { name: 'storeB', result: b },
    ]
    const merged = mergeStoreResults(stores)
    const ids = merged.results.map((i) => i.nodeId)
    expect(ids).toEqual(['a1', 'b1'])
    expect(merged.results.every((i) => i != null)).toBe(true)
  })
})
