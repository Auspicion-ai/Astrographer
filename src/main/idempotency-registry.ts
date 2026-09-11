// src/main/idempotency-registry.ts — Unit A2 §5.4 (docs/specs/unit-a2-document-
// crud-wiring.md): the caller-side idempotency registry (P4 —
// GNOSIS-IDEMPOTENCY-DEDUP). P1a's frozen wire carries NO idempotency-key field,
// so the dedup is caller-side: the mutating create tools cache their results
// under a (callerId, requestId) key; a duplicate (callerId, requestId) returns
// the first result WITHOUT issuing a new create. Bounded (LRU).

/** Unit A2 §5.4 — the caller-side idempotency registry (P4). P1a's frozen wire
 *  carries NO idempotency-key field, so the dedup is caller-side: the mutating
 *  create tools cache their results under a (callerId, requestId) key; a
 *  duplicate (callerId, requestId) returns the first result WITHOUT issuing a
 *  new create. Bounded (LRU). */
export interface IdempotencyRegistry {
  /** Look up a prior result for a (callerId, requestId) pair. Returns the
   *  cached result, or undefined if the pair is new. */
  get(callerId: string, requestId: string): unknown | undefined
  /** Record a completed result for a (callerId, requestId) pair. */
  set(callerId: string, requestId: string, result: unknown): void
}

/** Create the registry. Bounded by `maxEntries` (default 100) with LRU
 *  eviction — never unbounded. */
export function createIdempotencyRegistry(opts?: { maxEntries?: number }): IdempotencyRegistry {
  const maxEntries = opts?.maxEntries ?? 100
  // The key is the (callerId, requestId) PAIR — a caller can never receive
  // another caller's cached result, and a caller reusing their OWN requestId
  // gets their own first result. The Map preserves insertion order (the LRU
  // order: the oldest entry is the first key).
  const cache = new Map<string, unknown>()
  return {
    get(callerId, requestId) {
      return cache.get(`${callerId}\u0000${requestId}`)
    },
    set(callerId, requestId, result) {
      const key = `${callerId}\u0000${requestId}`
      // A re-set refreshes the LRU position (delete + re-insert).
      if (cache.has(key)) cache.delete(key)
      cache.set(key, result)
      // LRU eviction — never unbounded. Evict the oldest entries beyond
      // maxEntries (a maxEntries <= 0 is clamped to 1 so the registry is
      // always bounded).
      const cap = maxEntries > 0 ? maxEntries : 1
      while (cache.size > cap) {
        const oldest = cache.keys().next().value
        if (oldest === undefined) break
        cache.delete(oldest)
      }
    },
  }
}
