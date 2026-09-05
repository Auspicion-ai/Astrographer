// src/main/vector-boot.ts — Unit F / W1: the vector-boot controller
// (docs/specs/unit-f-embeddings.md §5.12 — BOOT MODEL B: warm-up gate →
// born-lexical pending → background build → reconcile → atomic one-way
// promotion).
//
// Pure + injectable module seam (review A3 — node-testable): NO Electron —
// the store and the ALREADY-WARMED provider are injected. Logs go to
// console.error (the spec pins the LOG MILESTONE strings, not the stream).
import { createLexicalIndex, createLexicalEmbedder, createRetrieval, type RetrievalEngine } from './retrieval.js'
import { createEmbeddingProvider, createVectorEmbedder, createVectorIndex, addToVectorIndex, updateVectorIndex, type EmbeddingProvider, type EmbeddingProviderConfig, type VectorIndex } from './embeddings.js'
import { contentHashOf, type VectorCache } from './vector-cache.js'
import type { RagStore } from './rag-store.js'

/** The boot phase of the shared engine. */
export type VectorBootPhase = 'pending' | 'promoted'

/** The warm-up probe text (a fixed non-empty string; pinned for determinism
 *  of the warm-up request). */
export const VECTOR_BOOT_WARMUP_TEXT = 'provident warm-up'

/** W1 fail-fast warm-up gate (failure class 2). Performs ONE REAL
 *  `POST /api/embed` — a single-text embed of VECTOR_BOOT_WARMUP_TEXT via
 *  `createEmbeddingProvider(config)` — NOT `isOllamaAvailable` (a tags-only
 *  probe does NOT load the model). Resolves with the warmed provider (the
 *  model is loaded; the SAME provider instance is reused for the background
 *  build). REJECTS with `Error('vector boot warm-up: <underlying message>')`
 *  on ANY total failure — INCLUDING a provider-CONSTRUCTION failure from a
 *  present-but-invalid config (F-W1-5: the construction sits INSIDE the try
 *  so every warm-up failure gets the same class-2 wrap + milestone) → the
 *  caller aborts boot BEFORE the window. */
export async function warmUpEmbeddingProvider(config: EmbeddingProviderConfig): Promise<EmbeddingProvider> {
  try {
    const provider = createEmbeddingProvider(config)
    await provider.embed(VECTOR_BOOT_WARMUP_TEXT)
    return provider
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`vector boot: warm-up failed: ${msg}`)
    throw new Error(`vector boot warm-up: ${msg}`)
  }
}

/** The promotion report (the promotion log census). */
export interface PromotionReport {
  /** Nodes embedded by the background build (cache misses once W4 lands). */
  embedded: number
  /** Nodes adopted from the persisted cache with no HTTP call (W4; 0 until W4). */
  cacheHits: number
  /** Nodes re-embedded by the reconcile pass (updatedAt > embedAt). */
  reEmbedded: number
  /** F-W1-2 (RCA-3, §5.12 amendment) — nodes ADDED during the build window
   *  (after the listNodes snapshot) that the reconcile pass embedded + added
   *  to the built index before the swap. */
  adopted: number
  /** The skipped census at promotion: never-indexed 'empty' +
   *  never-edited 'transient' counts. W1 pins: `empty` = the build's
   *  empty-content skip count, `transient` = 0 (the transient class does
   *  not exist until W3). */
  skipped: { empty: number; transient: number }
  /** The promotion timestamp (Date.now() at the swap). */
  promotedAt: number
}

/** The W1 boot controller. Created SYNCHRONOUSLY after a successful
 *  warm-up. The controller OWNS engine creation: constructing it
 *  SYNCHRONOUSLY creates the ONE shared `RetrievalEngine` instance
 *  (born-lexical, pending — `createRetrieval` with the lexical embedder
 *  runs inside the factory) that main hands to the MCP server AND the IPC
 *  handlers. AMENDMENT-REVIEW finding 1: main never creates the engine in
 *  vector mode. */
export interface VectorBootController {
  /** The shared engine (pending → promoted in place). */
  readonly engine: RetrievalEngine
  /** 'pending' until the promotion swap completes, then 'promoted'. */
  phase(): VectorBootPhase
  /** The live skipped map of the background build. */
  skipped(): Map<string, 'empty' | 'transient'>
  /** Background: build the vector index → reconcile → atomic one-way
   *  promotion. Resolves with the promotion report; REJECTS only on a TOTAL
   *  build failure (the engine STAYS pending — lexical-served — and the
   *  rejection is logged by main's fire-and-forget `.catch`).
   *  SINGLE-SHOT: a second `start()` call — while a build is running, after
   *  it resolved, or after it rejected — REJECTS with
   *  `Error('vector boot: start already called')`; the original promise's
   *  settlement is authoritative. */
  start(): Promise<PromotionReport>
}

export interface VectorBootOptions {
  /** W2 seam — the provider's `embedBatch`, when available. W3: the
   *  background build routes through `createVectorIndex(nodes, provider.embed,
   *  opts.embedBatchFn)` — the production boot build is BATCHED when the
   *  provider exposes the seam (the F-W2-3 wiring); omitted → the sequential
   *  per-item default. */
  embedBatchFn?: (texts: string[]) => Promise<number[][]>
  /** W4 (§5.13) — the loaded persisted cache. When supplied, the controller
   *  wraps the embed fns it hands `createVectorIndex` in the MEMOIZING
   *  wrapper (a key HIT adopts the cached vector with NO HTTP call; a MISS
   *  embeds through the provider + writes through on the cache's
   *  single-writer queue), drains the queue + prunes the cache at promotion
   *  (the file rewritten once after the drain), and reports the `cacheHits`
   *  census. Absent (ALL W1–W3 callers/tests) → a NO-OP passthrough: the raw
   *  provider fns, zero census, zero cache I/O. */
  cache?: VectorCache
}

/** Create the W1 boot controller. SYNCHRONOUSLY creates the ONE shared
 *  engine born-lexical (pending) and returns the controller that owns the
 *  background build → reconcile → atomic one-way promotion. */
export function createVectorBootController(store: RagStore, provider: EmbeddingProvider, opts?: VectorBootOptions): VectorBootController {
  console.error('vector boot: pending (born-lexical)')
  // Born-lexical pending: the lexical default path, moved inside the
  // controller (the ONE shared engine instance, created here).
  const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
  let phase: VectorBootPhase = 'pending'
  // The pre-build skipped map (the controller's skipped() before the
  // background build hands back the index whose OWN skipped map — the W3
  // authoritative record — takes over).
  const pendingSkips = new Map<string, 'empty' | 'transient'>()
  let builtIndex: VectorIndex | undefined
  let started = false

  // W4 (§5.13) — the memoizing wrapper state. Absent cache → every piece
  // below is a no-op (the W1–W3 behavior byte-identical).
  const cache = opts?.cache
  // The cacheHits census — deduped by contentHash (the W2 per-chunk fallback
  // re-lookups a rejected batch's texts; each distinct adopted text counts
  // exactly once).
  const hitHashes = new Set<string>()
  // Actual provider embeds (cache misses) through the wrapper.
  let missEmbeds = 0
  // The established dimension: latched from the first embed (auto-detect);
  // a cache HIT also establishes it (§5.13). 0 = not yet established.
  let establishedDim = 0

  // §5.13 — contentHashOf (the lowercase-hex SHA-256 of the EXACT embedded
  // text, no normalization — AMENDMENT-REVIEW note 9) is the SHARED cache
  // helper imported from vector-cache.ts (the W5 consolidation: the boot
  // wrapper and the live memoizer hash through the ONE function).

  /** The key dimension for a cache lookup: the established dimension, else
   *  the provider's (0 while an auto-detect provider is still cold — a cold
   *  provider cannot form a valid tuple, so it is cache-ineligible until its
   *  first embed latches the dimension). */
  function keyDimension(): number {
    if (establishedDim > 0) return establishedDim
    return provider.dimension > 0 ? provider.dimension : 0
  }

  /** A HIT adopts the cached vector (no HTTP call) + counts the census; a
   *  MISS (or a cache-ineligible cold provider) returns undefined. */
  function lookup(text: string): number[] | undefined {
    if (!cache) return undefined
    const dim = keyDimension()
    if (dim === 0) return undefined
    const vector = cache.get({ kind: provider.kind, model: provider.model, dimension: dim, contentHash: contentHashOf(text) })
    if (vector === undefined) return undefined
    hitHashes.add(contentHashOf(text))
    if (establishedDim === 0) establishedDim = vector.length
    return vector
  }

  /** §5.8 #40/#41 — the memoizing single-text embed: a HIT adopts the cached
   *  vector with NO HTTP call; a MISS embeds through the provider then
   *  writes through (queued, never awaited by the embed loop). */
  async function wrappedEmbed(text: string): Promise<number[]> {
    const hit = lookup(text)
    if (hit !== undefined) return hit
    const vec = await provider.embed(text)
    missEmbeds++
    if (establishedDim === 0) establishedDim = vec.length
    cache?.set({ kind: provider.kind, model: provider.model, dimension: vec.length, contentHash: contentHashOf(text) }, vec)
    return vec
  }

  /** §5.13 — the memoizing BATCH wrapper: hits adopted IN PLACE, misses
   *  batch-embedded in ONE call (positional order preserved; the assembled
   *  array length === texts.length). A batch rejection PROPAGATES —
   *  createVectorIndex's W2 per-chunk fallback then re-runs THIS wrapper
   *  per-item, so a fallback hit is still adopted (counted once, deduped by
   *  hash) and a fallback miss is still a write-through (§5.13 pinned). */
  async function wrappedBatch(texts: string[]): Promise<number[][]> {
    const out: Array<number[] | undefined> = new Array(texts.length)
    const missIdx: number[] = []
    for (let i = 0; i < texts.length; i++) {
      const hit = lookup(texts[i])
      if (hit !== undefined) out[i] = hit
      else missIdx.push(i)
    }
    if (missIdx.length > 0) {
      const batchFn = opts?.embedBatchFn
      if (!batchFn) throw new Error('vector boot: batch cache wrapper requires embedBatchFn')
      const vectors = await batchFn(missIdx.map((i) => texts[i]))
      for (let j = 0; j < missIdx.length; j++) {
        const vec = vectors[j]
        missEmbeds++
        if (establishedDim === 0) establishedDim = vec.length
        cache?.set({ kind: provider.kind, model: provider.model, dimension: vec.length, contentHash: contentHashOf(texts[missIdx[j]]) }, vec)
        out[missIdx[j]] = vec
      }
    }
    return out as number[][]
  }

  async function build(): Promise<PromotionReport> {
    try {
      // Background build: routed through createVectorIndex (W3) — the INDEX's
      // skipped map + embed-failure policy are authoritative (the controller's
      // own parallel build map/loop collapsed into the index's; a per-node
      // embed failure is a 'transient' skip recorded there, NOT a build
      // failure). `embedAt` (AMENDMENT-REVIEW finding 2) = the node's
      // updatedAt AS READ from the node list the build consumed (snapshotted
      // from the listed node — no injectable clock; listNodes hands out
      // copies, so a mid-embed edit lands on a fresh record the snapshot does
      // not observe).
      // Let the store's ALREADY-ENQUEUED mutations settle before the
      // snapshot: a caller may fire putNode WITHOUT awaiting immediately
      // before controller creation (the W4 boot wiring), and the store's
      // own single-writer queue lands those ops on the microtask chain —
      // this no-op op is chained AFTER every pending one. The reconcile +
      // adopt passes still own anything that changes DURING the build
      // window (embedAt semantics unchanged).
      await store.enqueue(() => undefined)
      const snapshotNodes = store.listNodes()
      const embedAt = new Map<string, string>()
      for (const node of snapshotNodes) {
        if (typeof node.content === 'string' && node.content.trim() !== '') embedAt.set(node.id, node.updatedAt)
      }
      // W4 — with a cache the build routes through the MEMOIZING wrapper
      // (hit = adopt, no HTTP; miss = embed + write-through); without one the
      // raw provider fns pass through byte-identically (W1–W3 unchanged).
      const buildEmbedFn = cache ? wrappedEmbed : provider.embed
      const buildBatchFn = cache && opts?.embedBatchFn ? wrappedBatch : opts?.embedBatchFn
      const index = await createVectorIndex(snapshotNodes, buildEmbedFn, buildBatchFn)
      builtIndex = index
      // §5.12 census: with a cache, `embedded` counts the provider embeds
      // (the cache MISSES — adopted hits made no embed call); without one,
      // the indexed-node count (the W1–W3 semantics, unchanged).
      const embedded = cache ? missEmbeds : index.nodeIds.length
      // Reconcile (before the swap): a node whose current updatedAt strictly
      // POSTDATES its build-time snapshot is RE-EMBEDDED with its LIVE
      // content; `updatedAt === embedAt` (tie) → UNCHANGED; `<` is impossible
      // and ignored.
      let reEmbedded = 0
      for (const id of [...index.nodeIds]) {
        const live = store.getNode(id)
        if (!live) continue // deleted mid-build — the ghost vector is never scored (scoring walks live nodes)
        const snapshot = embedAt.get(id)
        if (snapshot === undefined || live.updatedAt <= snapshot) continue
        // F-W1-1 (RCA-3): the content became empty/whitespace during the
        // build window — updateVectorIndex's UNIT-F-SKIP-EMPTY guard removes
        // the stale vector + records the 'empty' skip WITHOUT an embed call.
        // W3: a per-node embed rejection here is a 'transient' skip recorded
        // on the index (the flip) — the promotion continues either way.
        await updateVectorIndex(index, live, provider.embed)
        if (index.nodeIds.includes(id)) reEmbedded++
      }
      // F-W1-2 (RCA-3, §5.12 amendment): nodes ADDED during the build window
      // (after the listNodes snapshot — not in embedAt, not in the built
      // index) are ADOPTED here — the reconcile pass walks the LIVE node list
      // and every such node is embedded + added BEFORE the swap (an empty/
      // whitespace addition follows the UNIT-F-SKIP-EMPTY 'empty' skip path
      // inside addToVectorIndex — no embed call).
      let adopted = 0
      for (const node of store.listNodes()) {
        if (index.nodeIds.includes(node.id) || embedAt.has(node.id)) continue
        await addToVectorIndex(index, node, provider.embed)
        if (index.nodeIds.includes(node.id)) adopted++
      }
      // The promotion report's skipped census reads the INDEX's skipped map
      // (the W3 authoritative record).
      let empty = 0
      let transient = 0
      for (const kind of index.skipped.values()) {
        if (kind === 'empty') empty++
        else transient++
      }
      // W4 (§5.13 write timing + prune) — the single-writer queue is DRAINED
      // before the promotion report resolves; the prune (compaction bounded
      // by the live corpus) drops foreign-tuple entries + hashes matching no
      // current store node's non-empty embedded text and rewrites the file
      // ONCE after the drain. keepKeys = contentHash STRINGS for the CURRENT
      // provider tuple.
      if (cache) {
        await cache.flush()
        const keepKeys = new Set<string>()
        for (const node of store.listNodes()) {
          if (typeof node.content === 'string' && node.content.trim() !== '') keepKeys.add(contentHashOf(node.content))
        }
        cache.prune(keepKeys)
        await cache.flush()
      }
      const cacheHits = hitHashes.size
      console.error(`vector boot: build complete (embedded ${embedded}, cacheHits ${cacheHits}, re-embedded ${reEmbedded}, skipped empty ${empty} / transient ${transient})`)
      // Atomic ONE-WAY promotion: the vector embedder ADOPTS the background-
      // built index (§5.5 `opts.index` — zero build embeds inside
      // createVectorEmbedder) and is swapped INTO the same engine instance.
      // W5 (§5.13 amendment) — the SAME VectorCache instance the build used
      // is handed to the promoted embedder (the shared in-memory map makes
      // the build-time entries live-hittable; absent cache → undefined, the
      // W1–W3 passthrough unchanged).
      const vectorEmbedder = await createVectorEmbedder(store, { provider, index, cache })
      const promotedAt = Date.now()
      engine.setEmbedder(vectorEmbedder)
      phase = 'promoted'
      console.error('vector boot: promoted')
      return { embedded, cacheHits, reEmbedded, adopted, skipped: { empty, transient }, promotedAt }
    } catch (e) {
      // F1 discipline — a total build failure is LOGGED and the engine STAYS
      // pending (lexical-served); the rejection propagates to main's
      // fire-and-forget `.catch`. Never an unhandled rejection, never a
      // demotion.
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`vector boot: build failed (staying pending): ${msg}`)
      throw e
    }
  }

  return {
    engine,
    phase: () => phase,
    skipped: () => (builtIndex ? builtIndex.skipped : pendingSkips),
    start(): Promise<PromotionReport> {
      if (started) return Promise.reject(new Error('vector boot: start already called'))
      started = true
      return build()
    },
  }
}