// src/main/merge-store-results.ts — Unit F1: the pure cross-store merge
// (docs/specs/unit-f1-merge-store-results.md). No Electron, no I/O. Takes the
// per-store `RagResult` outputs (one per store, in canonical registry-insertion
// order) and merges them into a single cross-store `RagResult` by rank-based
// interleave (D1). Deterministic (D7). The per-store `score > 0` floor is
// applied upstream and is NOT re-applied here (§5.3).
import { RAG_ENGINE_ID, type RagResult } from './retrieval.js'

/** The per-store input: the store name + its per-store RagResult. A store
 *  whose ragQuery threw (failed-corrupt) is passed as `{ name, result: null }`
 *  and is SKIPPED (D6). The array is in canonical (registry insertion) order;
 *  the FIRST entry is the default store (the caller passes defaultName first). */
export interface StoreResultInput {
  name: string
  result: RagResult | null | undefined
}

type Citation = { documentId: string; nodeId: string }

const MSG = {
  storesRequired: 'mergeStoreResults: stores required',
  storesEmpty: 'mergeStoreResults: stores must not be empty',
  entryRequired: 'mergeStoreResults: store entry required',
  nameRequired: 'mergeStoreResults: store name must be a non-empty string',
  resultsArray: 'mergeStoreResults: store results must be an array',
  defaultRequired: 'mergeStoreResults: default store result required',
  defaultBlock:
    'mergeStoreResults: default store result must carry ranked/context/markdown/lineMap/k',
  topKBound: 'mergeStoreResults: topK must be an integer in [1, 50]',
} as const

/** Merge the per-store RagResult outputs into one cross-store RagResult by
 *  rank-based interleave (D1). Deterministic (D7). Pure — no Electron, no I/O. */
export function mergeStoreResults(
  stores: Array<StoreResultInput>,
  opts?: { topK?: number },
): RagResult {
  if (stores == null || !Array.isArray(stores)) {
    throw new Error(MSG.storesRequired)
  }
  if (stores.length === 0) {
    throw new Error(MSG.storesEmpty)
  }

  // A non-object `opts` (null, undefined, a string, a number) is coerced to
  // `{}` (Architect arbitration 2026-09-08 #2); only a present-but-invalid
  // `opts.topK` throws.
  const options: { topK?: number } =
    opts !== null && typeof opts === 'object' ? opts : {}

  const topK = options.topK
  if (topK !== undefined) {
    if (
      typeof topK !== 'number' ||
      !Number.isInteger(topK) ||
      topK < 1 ||
      topK > 50
    ) {
      throw new Error(MSG.topKBound)
    }
  }
  const topKValue = topK ?? 5

  // ---- validation pass (arbitration #3: presence → name → results-array →
  // default-store result, per element) ----
  for (let i = 0; i < stores.length; i++) {
    const entry = stores[i]
    if (entry == null) throw new Error(MSG.entryRequired)
    if (typeof entry.name !== 'string' || entry.name.trim().length === 0) {
      throw new Error(MSG.nameRequired)
    }
    if (entry.result != null && !Array.isArray(entry.result.results)) {
      throw new Error(MSG.resultsArray)
    }
    if (i === 0 && entry.result == null) {
      throw new Error(MSG.defaultRequired)
    }
    // F-F1-2: the default (FIRST) store must carry the block that becomes the
    // merged result's top-level block (D2). A non-null default `result` whose
    // `results` is a valid array but that is missing any of the required block
    // fields (ranked/context/markdown/lineMap/k) would otherwise leak
    // `undefined` into the merged output — assert them defensively here.
    if (
      i === 0 &&
      (entry.result == null ||
        entry.result.ranked == null ||
        entry.result.context == null ||
        entry.result.markdown == null ||
        entry.result.lineMap == null ||
        entry.result.k == null)
    ) {
      throw new Error(MSG.defaultBlock)
    }
  }

  // The default store (first entry) is valid here — it is the FIRST entry with
  // a non-null result (checked above).
  const defaultResult = stores[0].result as RagResult

  // ---- rank-based interleave (§5.2, D1) ----
  const active = stores
    .map((e) => e.result)
    .filter((r): r is RagResult => r != null)

  const mergedResults: RagResult['results'] = []
  let rank = 0
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let contributed = false
    for (const result of active) {
      if (rank < result.results.length) {
        // F-F1-3: skip a `null`/`undefined` element (a sparse-array hole or an
        // explicit null) rather than leaking `undefined` into the merged
        // `results` — consistent with the D6 zero-contributor skip. The store
        // still occupies this rank position (contributed stays true) so that
        // any non-null items beyond a hole are still reached.
        const item = result.results[rank]
        if (item != null) {
          mergedResults.push(item)
        }
        contributed = true
      }
    }
    if (!contributed) break
    rank++
  }

  // ---- citations: deduped across ALL stores by (documentId, nodeId), first
  // appearance in the interleaved results (§5.5) ----
  const citations: Citation[] = []
  const seen = new Set<string>()
  for (const item of mergedResults) {
    if (item == null) continue
    const key = `${item.documentId}\u0000${item.nodeId}`
    if (seen.has(key)) continue
    seen.add(key)
    citations.push({ documentId: item.documentId, nodeId: item.nodeId })
  }

  // ---- merged result shape (§5.5) ----
  return {
    query: defaultResult.query,
    results: mergedResults,
    engine: RAG_ENGINE_ID,
    citations,
    trace: {
      mode: 'flat',
      engine: RAG_ENGINE_ID,
      topK: topKValue,
      source: 'local',
    },
    // the default store's block (D2)
    ranked: defaultResult.ranked,
    context: defaultResult.context,
    markdown: defaultResult.markdown,
    lineMap: defaultResult.lineMap,
    k: defaultResult.k,
    // no `blockedBy` — flat-only (D4)
  }
}
