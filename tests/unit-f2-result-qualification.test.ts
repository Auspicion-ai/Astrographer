// tests/unit-f2-result-qualification.test.ts — Unit F2: result qualification +
// `storeContexts` (cross-store fan-out)
// (docs/specs/unit-f2-result-qualification.md §5.8 happy-path states + §5.9
// fail-states + §5.7 determinism + §5.3 purity/A-F1 gating). The RED set for the
// NEW additive shape + the NEW pure builder in `src/main/retrieval.ts`:
//   - qualifyStoreResult(merged, stores, { qualified })
//     - the A-F1 gate: `qualified: false` returns `merged` UNCHANGED (OBJECT-
//       and byte-equal, no `store` on items/entries, no `storeContexts`; `stores`
//       is NOT read)
//     - `qualified: true` stamps the per-item/per-entry `store` (§5.3 D3)
//     - `qualified: true` re-derives `citations` with `store` (first-appearance
//       dedup, §5.3.2)
//     - `storeContexts` (D2): one block per VALID store in `stores` array order,
//       default block first; a null/undefined-result store is SKIPPED (D6)
//     - `store` = the producing store's REGISTRY name, bare (no `<name>:` prefix);
//       the default store's `store` = its registry name, NEVER `''`
//     - the top-level `context`/`markdown`/`lineMap` stay the DEFAULT store's
//       block (unchanged); `trace`/`engine`/`ranked`/`k`/`query` passed through
//     - `blockedBy` ABSENT in a qualified result (FLAT-only, D4)
//     - PURE + DETERMINISTIC (no mutation, deterministic output)
//   - the `StoreResultInput` type is imported from U-F1's
//     `src/main/merge-store-results.ts` (per-store { name, result } inputs).
//
// Convention: follows the sibling `tests/unit-f1-merge-store-results.test.ts`
// (vitest node environment, `.js` import suffix for the main-process ESM
// module). Per-store `RagResult` objects are constructed directly. The merged
// `RagResult` is constructed directly with `merged.results` containing the SAME
// item-object REFERENCES as the per-store results (U-F1 §5.2 interleaves BY
// REFERENCE — the reference-identity attribution basis for §5.3.1).
//
// DATA STATES COVERED (§5.8):
//   1. `qualified: false` pass-through            → returns the EXACT `merged`
//                                                   object (toBe), no `store`,
//                                                   no `storeContexts`, `stores`
//                                                   null/undefined/empty OK
//   2. `qualified: true` item stamps              → [a1,b1,a2] → each item's
//                                                   `store` = producing store
//   3. citations re-derived with store            → deduped, first-appearance
//                                                   store wins
//   4. `storeContexts` built                       → [A-block, B-block] array order
//   5. a failed (null-result) store SKIPPED        → [A-block, C-block] (B → none)
//   6. default store's `store` = registry name     → 'main', NEVER ''
//   7. bare registry name (no `name:` prefix)      → 'wiki', NOT 'wiki:'
//   8. top-level block unchanged                   → context/markdown/lineMap stay
//                                                   `merged`'s (default store's block)
//   9. trace/engine/ranked/k/query passed through  → flat trace with NO `store`
//   10. no `blockedBy` in a qualified result        → absent (FLAT-only, D4)
//   11. purity                                     → input merged/items unmutated
//   12. determinism                                → same input → same output (twice)
//   13. single store qualified                     → store = <name>; storeContexts
//                                                   = [ { store: <name>, …block } ]
//
// FAIL-STATES COVERED (§5.9):
//   1. merged null/undefined      → 'qualifyStoreResult: merged result required'
//   2. opts null/undefined        → 'qualifyStoreResult: opts required'
//   3. opts.qualified not boolean → 'qualifyStoreResult: qualified must be a boolean'
//   4. qualified + stores null/undef / not array → 'qualifyStoreResult: stores required when qualified'
//   6. qualified + stores element null/undef      → 'qualifyStoreResult: store entry required'
//   7. qualified + name not non-empty string      → 'qualifyStoreResult: store name must be a non-empty string'
//   8. qualified + valid result missing ctx/lineMap/markdown → 'qualifyStoreResult: store result must have context, markdown and lineMap'
//   9. qualified + unattributable item            → 'qualifyStoreResult: unattributable result item'
//   (pinned non-throws: `qualified: false` does NOT validate `stores`; a null/
//    undefined-result store is SKIPPED, never a throw)
//
// RED: `src/main/retrieval.ts` does NOT export `qualifyStoreResult` yet (no
// `store`/`storeContexts` additive fields either), so this file FAILS TO LOAD
// (the static import resolves to no such export) — the entire test set is the
// red set for the not-yet-implemented builder.
import { describe, it, expect } from 'vitest'
import {
  qualifyStoreResult,
  type RagResult,
  type RagResultItem,
  type RagNode,
  type ScoredNode,
  type LineNodeMap,
  type StoreContextBlock,
} from '../src/main/retrieval.js'
import type { StoreResultInput } from '../src/main/merge-store-results.js'

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

function makeItem(
  documentId: string,
  nodeId: string,
  overrides: Partial<RagResultItem> = {},
): RagResultItem {
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

// A per-store `RagResult`, constructed directly (the builder consumes pure
// `{ name, result }` inputs + a pure merged result). The defaults mirror a
// flat-mode `ragQuery` output.
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
// A-F1 gating — the `qualified: false` pass-through (the happy-path state 1)
// ---------------------------------------------------------------------------
describe('Unit F2 — the A-F1 gate: `qualified: false` pass-through (§5.3/§5.8-1)', () => {
  it('§5.8-1. returns the EXACT `merged` object (object-equal) with NO `store` and NO `storeContexts`', () => {
    const a1 = makeItem('d1', 'n1')
    const merged = makeStoreResult({
      results: [a1],
      citations: [{ documentId: 'd1', nodeId: 'n1' }],
      k: 5,
    })
    const out = qualifyStoreResult(merged, null, { qualified: false })
    // object-equal — the exact same value is returned (A-F1)
    expect(out).toBe(merged)
    // byte-equal — no added keys, items untouched
    expect(out).toEqual(merged)
    // gated additions absent
    expect((out as Record<string, unknown>).storeContexts).toBeUndefined()
    expect(out.results[0]).not.toHaveProperty('store')
    expect(out.citations[0]).not.toHaveProperty('store')
  })

  it('§5.8-1. `stores` is null/undefined/empty with `qualified: false` → NOT validated, returns `merged` unchanged (pinned non-throw)', () => {
    const merged = makeStoreResult({ results: [makeItem('d1', 'n1')] })
    expect(() => qualifyStoreResult(merged, null as never, { qualified: false })).not.toThrow()
    expect(() => qualifyStoreResult(merged, undefined as never, { qualified: false })).not.toThrow()
    expect(() => qualifyStoreResult(merged, [], { qualified: false })).not.toThrow()
    for (const stores of [null, undefined, []] as never[]) {
      expect(qualifyStoreResult(merged, stores, { qualified: false })).toBe(merged)
    }
  })

  it('§5.8-1. with `qualified: false` the top-level passthrough is the input, byte-for-byte (no `storeContexts`, flat trace, no `store` on the flat trace)', () => {
    const merged = makeStoreResult({
      results: [],
      context: [makeNode('n1')],
      markdown: 'markdown-A',
      k: 3,
    })
    const out = qualifyStoreResult(merged, [{ name: 'main', result: merged }], {
      qualified: false,
    })
    expect(out).toEqual(merged)
    expect(JSON.stringify(out)).toBe(JSON.stringify(merged))
  })

  it('§5.8-1. `qualified: false` is the sole switch — a single-store path stays byte-equal (A-F1 preserves Phase-1 A4)', () => {
    const a1 = makeItem('d1', 'n1')
    const merged = makeStoreResult({
      results: [a1],
      citations: [{ documentId: 'd1', nodeId: 'n1' }],
      k: 5,
    })
    const out = qualifyStoreResult(merged, [{ name: 'main', result: merged }], {
      qualified: false,
    })
    expect(out).toEqual({
      query: 'shared query',
      results: [{ documentId: 'd1', nodeId: 'n1', score: 1, snippet: 'snippet-n1', source: 'local' }],
      engine: 'local',
      citations: [{ documentId: 'd1', nodeId: 'n1' }],
      trace: { mode: 'flat', engine: 'local', topK: 5, source: 'local' },
      ranked: [],
      context: [],
      markdown: '',
      lineMap: { ranges: [] },
      k: 5,
    })
  })
})

// ---------------------------------------------------------------------------
// The `qualified: true` stamps — item stamps + the citation re-derivation
// (the happy-path states 2, 3, 6, 7, 13)
// ---------------------------------------------------------------------------
describe('Unit F2 — `qualified: true`: the per-item/per-entry store stamps (§5.3/§5.8)', () => {
  it('§5.8-2. two stores A[default] ([a1,a2]) + B ([b1]), merged = [a1,b1,a2] → each item stamped with its producing registry name, interleaved order preserved', () => {
    const a1 = makeItem('d1', 'a1', { score: 1.0 })
    const a2 = makeItem('d1', 'a2', { score: 0.8 })
    const b1 = makeItem('d2', 'b1', { score: 0.9 })
    const storeA = makeStoreResult({ results: [a1, a2] })
    const storeB = makeStoreResult({ query: 'shared query', results: [b1] })
    const merged = makeStoreResult({
      // same item REFERENCE objects, interleaved (U-F1 §5.2 interleaves by ref)
      results: [a1, b1, a2],
    })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.results.map((i) => i.nodeId)).toEqual(['a1', 'b1', 'a2'])
    expect(out.results.map((i) => i.store)).toEqual(['A', 'B', 'A'])
    expect(out.results[0]).toEqual({ ...a1, store: 'A' })
    expect(out.results[1]).toEqual({ ...b1, store: 'B' })
    expect(out.results[2]).toEqual({ ...a2, store: 'A' })
  })

  it('§5.8-3. citations re-derived with store: items (d1,n1) from A first then B → cited ONCE, first-appearance store wins', () => {
    const a1 = makeItem('d1', 'n1')
    const b1 = makeItem('d1', 'n1')
    const a2 = makeItem('d2', 'n2')
    const storeA = makeStoreResult({ results: [a1, a2] })
    const storeB = makeStoreResult({ query: 'shared query', results: [b1] })
    const merged = makeStoreResult({
      results: [a1, b1, a2], // interleaved: A(d1,n1), B(d1,n1), A(d2,n2)
    })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.citations).toEqual([
      { documentId: 'd1', nodeId: 'n1', store: 'A' },
      { documentId: 'd2', nodeId: 'n2', store: 'A' },
    ])
  })

  it('§5.8-3. citations count with the qualified result == the first-appearance dedup of the stamped items', () => {
    const a1 = makeItem('d1', 'a1')
    const a2 = makeItem('d2', 'a2')
    const b1 = makeItem('d1', 'a1') // same tuple as a1, from store B
    const b2 = makeItem('d3', 'b2')
    const storeA = makeStoreResult({ results: [a1, a2] })
    const storeB = makeStoreResult({ query: 'shared query', results: [b1, b2] })
    const merged = makeStoreResult({ results: [a1, b2, b1, a2] })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.citations).toEqual([
      { documentId: 'd1', nodeId: 'a1', store: 'A' },
      { documentId: 'd3', nodeId: 'b2', store: 'B' },
      { documentId: 'd2', nodeId: 'a2', store: 'A' },
    ])
  })

  it('§5.8-6. the default store\'s `store` = its REGISTRY name (never \'\')', () => {
    const a1 = makeItem('d1', 'n1')
    const storeMain = makeStoreResult({ results: [a1] })
    const storeOther = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'x1')],
    })
    const merged = makeStoreResult({ results: [a1] })
    const stores: StoreResultInput[] = [
      { name: 'main', result: storeMain },
      { name: 'wiki', result: storeOther },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.results[0].store).toBe('main')
    expect(out.results[0].store).not.toBe('')
    expect(out.storeContexts![0].store).toBe('main')
  })

  it('§5.8-7. the store field carries the BARE registry name — a `wiki` store with `wiki:<id>` ids → `store:\'wiki\'`, NOT \'wiki:\'', () => {
    const w1 = makeItem('wiki:doc1', 'wiki:n1')
    // the default (FIRST) store is valid but carries zero results (still a
    // valid block); the `wiki` store produces the only item (a `wiki:`-prefixed id)
    const storeWiki = makeStoreResult({ query: 'q', results: [w1], markdown: 'm-wiki' })
    const merged = makeStoreResult({
      results: [w1],
      markdown: 'm-default',
      k: 5,
    })
    const out = qualifyStoreResult(
      merged,
      [
        { name: 'main', result: makeStoreResult({ query: 'q', results: [] }) },
        { name: 'wiki', result: storeWiki },
      ],
      { qualified: true },
    )
    expect(out.results[0].store).toBe('wiki')
    expect(out.results[0].store).not.toBe('wiki:')
  })

  it('§5.8-13. single store qualified: every item/citation carries `store: <name>` and `storeContexts` = [ { store: <name>, …block } ]', () => {
    const n1 = makeItem('d1', 'n1', { score: 1.0 })
    const n2 = makeItem('d2', 'n2', { score: 0.5 })
    const store = makeStoreResult({
      results: [n1, n2],
      markdown: 'markdown-only',
      k: 7,
    })
    const merged = makeStoreResult({
      results: [n1, n2],
      markdown: 'markdown-only',
      k: 7,
    })
    const stores: StoreResultInput[] = [{ name: 'only', result: store }]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.results.map((i) => i.store)).toEqual(['only', 'only'])
    expect(out.citations).toEqual([
      { documentId: 'd1', nodeId: 'n1', store: 'only' },
      { documentId: 'd2', nodeId: 'n2', store: 'only' },
    ])
    expect(out.storeContexts).toEqual([
      {
        store: 'only',
        context: store.context,
        markdown: 'markdown-only',
        lineMap: store.lineMap,
      },
    ])
  })

  it('§5.8-2. every item is a SPREAD COPY — the stamped item is a fresh object, not the input reference (purity on the item level)', () => {
    const a1 = makeItem('d1', 'n1')
    const store = makeStoreResult({ results: [a1] })
    const merged = makeStoreResult({ results: [a1] })
    const out = qualifyStoreResult(merged, [{ name: 'main', result: store }], {
      qualified: true,
    })
    expect(out.results[0]).not.toBe(a1)
    expect(out.results[0].store).toBe('main')
    expect(a1).not.toHaveProperty('store')
  })
})

// ---------------------------------------------------------------------------
// The `storeContexts` build (D2) — the happy-path states 4, 5, 8
// ---------------------------------------------------------------------------
describe('Unit F2 — `qualified: true`: the `storeContexts` build (§5.3.3/§5.5/§5.8)', () => {
  it('§5.8-4. two valid stores A (default) + B → [ {store:A, ctx, md, lm}, {store:B, ctx, md, lm} ] in `stores` array order', () => {
    const storeA = makeStoreResult({
      results: [makeItem('d1', 'a1')],
      context: [makeNode('a1')],
      markdown: 'markdown-A',
      lineMap: makeLineMap('a1'),
      k: 4,
    })
    const storeB = makeStoreResult({
      query: 'shared query',
      results: [makeItem('d2', 'b1')],
      context: [makeNode('b1')],
      markdown: 'markdown-B',
      lineMap: makeLineMap('b1'),
    })
    const merged = makeStoreResult({
      results: [storeA.results[0], storeB.results[0]],
      markdown: 'markdown-A',
    })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.storeContexts).toEqual([
      { store: 'A', context: storeA.context, markdown: 'markdown-A', lineMap: storeA.lineMap },
      { store: 'B', context: storeB.context, markdown: 'markdown-B', lineMap: storeB.lineMap },
    ])
    // default block is FIRST (index 0)
    expect(out.storeContexts![0].store).toBe('A')
    expect(out.storeContexts![1].store).toBe('B')
  })

  it('§5.8-5. a failed (null-result) store is SKIPPED (D6); a valid-but-empty-results store still contributes a (possibly empty) block', () => {
    const a1 = makeItem('d1', 'a1')
    const c1 = makeItem('d3', 'c1')
    const storeA = makeStoreResult({
      results: [a1],
      context: [makeNode('a1')],
      markdown: 'markdown-A',
      lineMap: makeLineMap('a1'),
    })
    // storeB: result null (failed — no items, no block)
    const storeC = makeStoreResult({
      query: 'shared query',
      results: [c1], // c1 is an empty-ish item but keeps C attributable + block included
      context: [],
      markdown: 'markdown-C',
      lineMap: { ranges: [] },
    })
    const merged = makeStoreResult({ results: [a1, c1] })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: null },
      { name: 'C', result: storeC },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.storeContexts).toEqual([
      { store: 'A', context: storeA.context, markdown: 'markdown-A', lineMap: storeA.lineMap },
      { store: 'C', context: storeC.context, markdown: 'markdown-C', lineMap: storeC.lineMap },
    ])
    expect(out.storeContexts!.map((b) => b.store)).toEqual(['A', 'C'])
    // the null-result store contributed NO item stamp + NO block
    expect(out.results.map((i) => i.store)).toEqual(['A', 'C'])
  })

  it('§5.9 pinned non-throw: an `undefined`-result store is ALSO skipped (never a throw)', () => {
    const a1 = makeItem('d1', 'a1')
    const storeA = makeStoreResult({ results: [a1] })
    const merged = makeStoreResult({ results: [a1] })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: undefined },
    ]
    expect(() => qualifyStoreResult(merged, stores, { qualified: true })).not.toThrow()
    expect(qualifyStoreResult(merged, stores, { qualified: true }).storeContexts!.map((b) => b.store)).toEqual(['A'])
  })

  it('§5.8-5. a store with a VALID result but an EMPTY `results` array still contributes a (possibly empty) block — NOT an error', () => {
    const a1 = makeItem('d1', 'a1')
    const storeA = makeStoreResult({ results: [a1] })
    const storeEmpty = makeStoreResult({ query: 'shared query', results: [], context: [], markdown: '', lineMap: { ranges: [] } })
    const merged = makeStoreResult({ results: [a1] })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'Empty', result: storeEmpty },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.storeContexts!.map((b) => b.store)).toEqual(['A', 'Empty'])
    expect(out.storeContexts![1]).toEqual({
      store: 'Empty',
      context: [],
      markdown: '',
      lineMap: { ranges: [] },
    })
  })

  it('§5.8-8. the top-level block stays the DEFAULT store\'s block (unchanged); `storeContexts` carries the per-store blocks alongside', () => {
    const a1 = makeItem('d1', 'a1')
    const b1 = makeItem('d2', 'b1')
    const storeA = makeStoreResult({
      results: [a1],
      context: [makeNode('a1')],
      markdown: 'markdown-A',
      lineMap: makeLineMap('a1'),
      k: 4,
    })
    const storeB = makeStoreResult({
      query: 'shared query',
      results: [b1],
      context: [makeNode('b1')],
      markdown: 'markdown-B',
      lineMap: makeLineMap('b1'),
    })
    // the merged block is the DEFAULT store's block (A) — D2
    const merged = makeStoreResult({
      results: [a1, b1],
      context: [makeNode('a1')],
      markdown: 'markdown-A',
      lineMap: makeLineMap('a1'),
      k: 4,
    })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    // top-level block is UNCHANGED from `merged` (the default block)
    expect(out.context).toBe(merged.context)
    expect(out.markdown).toBe(merged.markdown)
    expect(out.lineMap).toBe(merged.lineMap)
    // the per-store blocks are alongside it
    expect(out.storeContexts![1].markdown).toBe('markdown-B')
    expect(out.storeContexts![1].context).toEqual([expect.objectContaining({ id: 'b1' })])
  })
})

// ---------------------------------------------------------------------------
// The passthrough + `blockedBy` — the happy-path states 9, 10
// ---------------------------------------------------------------------------
describe('Unit F2 — the passthrough + `blockedBy` (§5.3.4/§5.8)', () => {
  it('§5.8-9. trace/engine/ranked/k/query passed through unchanged; the flat trace has NO `store`; engine === \'local\'', () => {
    const a1 = makeItem('d1', 'n1')
    const storeA = makeStoreResult({
      results: [a1],
      ranked: [{ nodeId: 'n1', score: 1 }] as ScoredNode[],
      k: 3,
    })
    const merged = makeStoreResult({
      query: 'the-query',
      results: [a1],
      ranked: [{ nodeId: 'n1', score: 1 }] as ScoredNode[],
      k: 3,
    })
    const out = qualifyStoreResult(merged, [{ name: 'main', result: storeA }], {
      qualified: true,
    })
    expect(out.query).toBe('the-query')
    expect(out.engine).toBe('local')
    expect(out.ranked).toBe(merged.ranked)
    expect(out.k).toBe(3)
    expect(out.trace).toEqual({ mode: 'flat', engine: 'local', topK: 5, source: 'local' })
    expect(out.trace).not.toHaveProperty('store')
    expect((out.trace as object)).not.toHaveProperty('store')
  })

  it('§5.8-10. `blockedBy` is ABSENT in the qualified result (flat-only, D4)', () => {
    const a1 = makeItem('d1', 'n1')
    const storeA = makeStoreResult({ results: [a1] })
    const merged = makeStoreResult({ results: [a1] })
    const out = qualifyStoreResult(merged, [{ name: 'main', result: storeA }], {
      qualified: true,
    })
    expect((out as Record<string, unknown>).blockedBy).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// Purity + determinism — the happy-path states 11, 12
// ---------------------------------------------------------------------------
describe('Unit F2 — purity + determinism (§5.3.5/§5.7/§5.8)', () => {
  it('§5.8-11. purity: `merged` and every per-store result/item is UNCHANGED after qualification (spread-copied)', () => {
    const a1 = makeItem('d1', 'a1')
    const a2 = makeItem('d1', 'a2')
    const b1 = makeItem('d2', 'b1')
    const storeA = makeStoreResult({ results: [a1, a2] })
    const storeB = makeStoreResult({ query: 'shared query', results: [b1] })
    const merged = makeStoreResult({ results: [a1, b1, a2] })

    const mergedSnapshot = makeStoreResult({
      results: [a1, b1, a2],
      citations: [], // merged.citations is [] here; re-derivation produces the citing array
    })
    const itemJsonBefore = JSON.stringify([a1, a2, b1])

    qualifyStoreResult(merged, [{ name: 'A', result: storeA }, { name: 'B', result: storeB }], {
      qualified: true,
    })

    // the input merged value is unchanged
    expect(merged).toEqual(mergedSnapshot)
    // the input item objects were not mutated (no `store` stamped onto the originals)
    expect(a1).not.toHaveProperty('store')
    expect(a2).not.toHaveProperty('store')
    expect(b1).not.toHaveProperty('store')
    expect(JSON.stringify([a1, a2, b1])).toBe(itemJsonBefore)
    // the per-store results carry no `storeContexts`/`store`
    expect(storeA).not.toHaveProperty('storeContexts')
    expect(storeB).not.toHaveProperty('storeContexts')
  })

  it('§5.8-12. determinism: the same input + same `stores` + same `{qualified:true}` → the same qualified output (twice)', () => {
    const a1 = makeItem('d1', 'a1')
    const a2 = makeItem('d1', 'a2')
    const b1 = makeItem('d2', 'b1')
    const storeA = makeStoreResult({ results: [a1, a2] })
    const storeB = makeStoreResult({ query: 'shared query', results: [b1] })
    const merged = makeStoreResult({ results: [a1, b1, a2] })
    const stores: StoreResultInput[] = [
      { name: 'A', result: storeA },
      { name: 'B', result: storeB },
    ]
    const first = qualifyStoreResult(merged, stores, { qualified: true })
    const second = qualifyStoreResult(merged, stores, { qualified: true })
    expect(first).toEqual(second)
    expect(first.storeContexts).toEqual(second.storeContexts)
    expect(first.citations).toEqual(second.citations)
  })
})

// ---------------------------------------------------------------------------
// Fail-states (§5.6/§5.9) — the 9 documented throws
// ---------------------------------------------------------------------------
describe('Unit F2 — fail-states (§5.6/§5.9)', () => {
  it('§5.9-1. `merged` null/undefined → throws "qualifyStoreResult: merged result required"', () => {
    expect(() => qualifyStoreResult(null as never, [], { qualified: false })).toThrow(
      'qualifyStoreResult: merged result required',
    )
    expect(() => qualifyStoreResult(undefined as never, [], { qualified: false })).toThrow(
      'qualifyStoreResult: merged result required',
    )
  })

  it('§5.9-2. `opts` null/undefined → throws "qualifyStoreResult: opts required"', () => {
    const merged = makeStoreResult()
    expect(() => qualifyStoreResult(merged, [], null as never)).toThrow(
      'qualifyStoreResult: opts required',
    )
    expect(() => qualifyStoreResult(merged, [], undefined as never)).toThrow(
      'qualifyStoreResult: opts required',
    )
  })

  it('§5.9-3. `opts.qualified` not a boolean → throws "qualifyStoreResult: qualified must be a boolean"', () => {
    const merged = makeStoreResult()
    expect(() => qualifyStoreResult(merged, [], { qualified: 'yes' as never })).toThrow(
      'qualifyStoreResult: qualified must be a boolean',
    )
    expect(() => qualifyStoreResult(merged, [], { qualified: 1 as never })).toThrow(
      'qualifyStoreResult: qualified must be a boolean',
    )
    expect(() => qualifyStoreResult(merged, [], { qualified: null as never })).toThrow(
      'qualifyStoreResult: qualified must be a boolean',
    )
    expect(() => qualifyStoreResult(merged, [], {} as never)).toThrow(
      'qualifyStoreResult: qualified must be a boolean',
    )
  })

  it('§5.9-4. `qualified: true` + `stores` null/undefined → throws "qualifyStoreResult: stores required when qualified"', () => {
    const merged = makeStoreResult()
    expect(() => qualifyStoreResult(merged, null as never, { qualified: true })).toThrow(
      'qualifyStoreResult: stores required when qualified',
    )
    expect(() => qualifyStoreResult(merged, undefined as never, { qualified: true })).toThrow(
      'qualifyStoreResult: stores required when qualified',
    )
  })

  it('§5.9-5. `qualified: true` + `stores` not an array → throws "qualifyStoreResult: stores required when qualified"', () => {
    const merged = makeStoreResult()
    expect(() => qualifyStoreResult(merged, 42 as never, { qualified: true })).toThrow(
      'qualifyStoreResult: stores required when qualified',
    )
    expect(() => qualifyStoreResult(merged, {} as never, { qualified: true })).toThrow(
      'qualifyStoreResult: stores required when qualified',
    )
  })

  it('§5.9-6. `qualified: true` + a `stores` element null/undefined → throws "qualifyStoreResult: store entry required"', () => {
    const a1 = makeItem('d1', 'n1')
    const good = { name: 'A', result: makeStoreResult({ results: [a1] }) }
    const merged = makeStoreResult({ results: [a1] })
    expect(() => qualifyStoreResult(merged, [null as never], { qualified: true })).toThrow(
      'qualifyStoreResult: store entry required',
    )
    expect(() => qualifyStoreResult(merged, [undefined as never], { qualified: true })).toThrow(
      'qualifyStoreResult: store entry required',
    )
    expect(() => qualifyStoreResult(merged, [good, null as never], { qualified: true })).toThrow(
      'qualifyStoreResult: store entry required',
    )
  })

  it('§5.9-7. `qualified: true` + a `stores` element\'s `name` not a non-empty string → throws "qualifyStoreResult: store name must be a non-empty string"', () => {
    const a1 = makeItem('d1', 'n1')
    const merged = makeStoreResult({ results: [a1] })
    const entry = makeStoreResult({ results: [a1] })
    expect(() =>
      qualifyStoreResult(merged, [{ name: '', result: entry }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store name must be a non-empty string')
    expect(() =>
      qualifyStoreResult(merged, [{ name: '   ', result: entry }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store name must be a non-empty string')
    expect(() =>
      qualifyStoreResult(merged, [{ name: 42 as never, result: entry }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store name must be a non-empty string')
    expect(() =>
      qualifyStoreResult(merged, [{ name: null as never, result: entry }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store name must be a non-empty string')
  })

  it('§5.9-8. `qualified: true` + a store\'s VALID result missing context/markdown/lineMap → throws "qualifyStoreResult: store result must have context, markdown and lineMap"', () => {
    const a1 = makeItem('d1', 'n1')
    const good = makeStoreResult({ results: [a1], context: [makeNode('n1')], markdown: 'md-A', lineMap: makeLineMap('n1') })
    const merged = makeStoreResult({ results: [a1] })

    // missing context
    const noCtx = makeStoreResult({
      query: 'q',
      results: [],
      context: undefined,
      markdown: 'md',
      lineMap: { ranges: [] },
    } as unknown as RagResult)
    expect(() =>
      qualifyStoreResult(merged, [{ name: 'A', result: good }, { name: 'B', result: noCtx }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store result must have context, markdown and lineMap')

    // missing markdown
    const noMd = makeStoreResult({ query: 'q', results: [] })
    delete (noMd as Record<string, unknown>).markdown
    expect(() =>
      qualifyStoreResult(merged, [{ name: 'A', result: good }, { name: 'B', result: noMd as RagResult }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store result must have context, markdown and lineMap')

    // missing lineMap
    const noLm = makeStoreResult({ query: 'q', results: [] })
    delete (noLm as Record<string, unknown>).lineMap
    expect(() =>
      qualifyStoreResult(merged, [{ name: 'A', result: good }, { name: 'B', result: noLm as RagResult }], { qualified: true }),
    ).toThrow('qualifyStoreResult: store result must have context, markdown and lineMap')
  })

  it('§5.9-9. `qualified: true` + a `merged.results` item attributable to NO store (its reference is in no result.results) → throws "qualifyStoreResult: unattributable result item"', () => {
    const a1 = makeItem('d1', 'a1')
    const orphan = makeItem('d9', 'orphan')
    const storeA = makeStoreResult({ results: [a1] })
    // the orphan object is NOT in storeA.results — it was not produced by A
    const merged = makeStoreResult({ results: [a1, orphan] })
    const stores: StoreResultInput[] = [{ name: 'A', result: storeA }]
    expect(() => qualifyStoreResult(merged, stores, { qualified: true })).toThrow(
      'qualifyStoreResult: unattributable result item',
    )
  })

  // F-F2-1 regression — adversarial pass: a `stores` entry with a valid
  // (non-null) `result` carrying context/markdown/lineMap but an ABSENT/
  // undefined (or non-array) `results` must be rejected in the §5.6 validation
  // pass with the pinned message, NOT crash later with an unpinned
  // `entry.result.results is not iterable`.
  it('F-F2-1 regression: qualified + a store\'s valid result missing/undefined `results` → throws "qualifyStoreResult: store results must be an array"', () => {
    const a1 = makeItem('d1', 'n1')
    const good = makeStoreResult({
      results: [a1],
      context: [makeNode('n1')],
      markdown: 'md-A',
      lineMap: makeLineMap('n1'),
    })
    const merged = makeStoreResult({ results: [a1] })

    // absent `results` (deleted key) — context/markdown/lineMap ARE present
    const noResults = makeStoreResult({
      query: 'q',
      context: [makeNode('n1')],
      markdown: 'md-A',
      lineMap: makeLineMap('n1'),
    })
    delete (noResults as Record<string, unknown>).results
    expect(() =>
      qualifyStoreResult(
        merged,
        [{ name: 'A', result: good }, { name: 'B', result: noResults as RagResult }],
        { qualified: true },
      ),
    ).toThrow('qualifyStoreResult: store results must be an array')

    // undefined `results` (explicit undefined value)
    const undefResults = makeStoreResult({
      query: 'q',
      context: [makeNode('n1')],
      markdown: 'md-A',
      lineMap: makeLineMap('n1'),
      results: undefined as never,
    })
    expect(() =>
      qualifyStoreResult(
        merged,
        [{ name: 'A', result: good }, { name: 'B', result: undefResults as RagResult }],
        { qualified: true },
      ),
    ).toThrow('qualifyStoreResult: store results must be an array')

    // non-array `results` (a plain object would also survive §5.6 unguarded)
    const notArr = makeStoreResult({
      query: 'q',
      context: [makeNode('n1')],
      markdown: 'md-A',
      lineMap: makeLineMap('n1'),
    })
    ;(notArr as unknown as Record<string, unknown>).results = 42
    expect(() =>
      qualifyStoreResult(
        merged,
        [{ name: 'A', result: good }, { name: 'B', result: notArr as unknown as RagResult }],
        { qualified: true },
      ),
    ).toThrow('qualifyStoreResult: store results must be an array')
  })

  // F-F2-2 regression — adversarial pass: a `null`/`undefined` element in
  // `merged.results` must be SKIPPED (consistent with U-F1's null skip), NOT
  // silently spread to `{}` and then mischaracterized as
  // `unattributable result item`. No throw; the null/undefined is omitted.
  it('F-F2-2 regression: a `null`/`undefined` element in `merged.results` → SKIPPED (no silent `{}`)', () => {
    const a1 = makeItem('d1', 'a1')
    const storeA = makeStoreResult({ results: [a1] })
    const merged = makeStoreResult({
      results: [null, a1, undefined] as unknown as RagResult['results'],
    })
    const stores: StoreResultInput[] = [{ name: 'A', result: storeA }]
    const out = qualifyStoreResult(merged, stores, { qualified: true })
    expect(out.results).toEqual([{ ...a1, store: 'A' }])
    // no silent empty `{}` object leaked from `{...null}` → `{}`
    expect(out.results.every((it) => it !== null && typeof it === 'object')).toBe(true)
  })
})
