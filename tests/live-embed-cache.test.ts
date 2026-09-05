// tests/live-embed-cache.test.ts — Unit F / W5: the LIVE embed cache
// (docs/specs/unit-f-embeddings.md §5.13 "W5 amendment (2026-09-05)" + the
// §5.5 `cache?: VectorCache` amendment + §5.12 the promote step).
//
// CONTRACT (spec text ALONE — no src/ reading):
//   §5.13 W5 amendment: the memoizing wrapper applies to ALL vector-embed
//   paths of the PROMOTED embedder when a cache is supplied — not only the
//   boot build. `createVectorEmbedder` gains an optional `cache?: VectorCache`
//   (§5.5 amendment):
//     (a) the promoted embedder's `score` query-embeds route through a
//         single-text memoizer;
//     (b) its `onStoreChanged` maintenance embeds (`addToVectorIndex`/
//         `updateVectorIndex`) route through it — a live embed whose content
//         matches a cached hash adopts with NO HTTP call; a live embed of
//         NEW/CHANGED content embeds through the provider AND writes through
//         to the persisted cache immediately (the cache's own debounced queue
//         persists it — no explicit flush is needed post-promotion; flush()
//         forces the pending write — the F-W4-1 pin);
//     (c) the promote step passes the SAME `VectorCache` instance it used for
//         the build (the shared in-memory map makes build-time entries
//         live-hittable);
//     (d) absent cache → byte-identical W1–W3 behavior.
//   Hash discipline (§5.13 + VECTOR-CACHE-CONTENT-HASH-KEY): contentHash =
//   lowercase-hex SHA-256 of the EXACT embedded text (no normalization).
//   Write-through timing (§5.13): write-through AFTER each SUCCESSFUL embed;
//   the entry rides the cache's single-writer COALESCING debounce
//   (CACHE_WRITE_DEBOUNCE_MS = 500, exported from src/main/vector-cache.ts);
//   a failed embed writes nothing.
//
// MOCK PATTERNS ONLY: tests/vector-cache.test.ts + tests/embeddings-
// failure-policy.test.ts (the real-JSON-store double `createJsonRagStore`,
// the stubbed global `fetch` over the REAL ollama provider, temp-dir cache
// paths via mkdtemp, the prebuilt-index adoption of `createVectorEmbedder`,
// the boot-controller cache wiring, the deterministic textEmbedding double).
// NO contract was derived from src/ — the red set below is expected because
// the current `createVectorEmbedder` has NO `cache?` option and NO live
// memoizer.
//
// ============================================================================
// STATE ENUMERATION (one valid/happy-path test per reasonable data state, one
// fail-safe test per documented fail-state):
//
//   Happy states:
//     L1  LIVE-MISS-WRITE-THROUGH (W5b, update route): a promoted vector
//         embedder (createVectorEmbedder with a cache + a fetch-stubbed
//         provider) whose node's content is CHANGED → the onStoreChanged
//         touch makes the embed HTTP call HAPPEN (new content — exactly one
//         call, only for the new text) → after cache.flush() the cache file
//         contains the new contentHash entry (kind/model/dimension + the
//         embedded vector + savedAt). (§5.13 W5b; the §5.8 #41 live analogue.)
//     L1b the live miss write-through is visible IN-MEMORY immediately after
//         the hook resolves — cache.get(newHash) returns the vector with NO
//         flush (the shared in-memory map is the W5c mechanism).
//     L2  LIVE-HIT (W5b, update route): a touch whose (identical) content
//         already has a cache entry (pre-seeded via the SAME VectorCache
//         instance) → NO embed HTTP call at all; the CACHED vector is stored
//         in the index (a re-embed would have stored the provider's vector —
//         made observable by a distinctive cached vector + a controlled query).
//     L2b LIVE-HIT (W5b, add route): a NEW node (not yet in the index) whose
//         content is pre-seeded on the same instance → NO embed HTTP call;
//         the cached vector stored (the addToVectorIndex route).
//     L3  SHARED-INSTANCE (W5c, the promote step): an entry written during a
//         BUILD with the same VectorCache instance (the boot controller's
//         build → the SAME instance handed to the promoted embedder) is a
//         live HIT on a subsequent maintenance touch — NO HTTP call and the
//         build-time vector stays in the index (a post-build provider "model
//         state" change would replace it on a re-embed).
//     L4  QUERY-EMBED-CACHE (W5a): score('same text') twice → exactly ONE
//         provider HTTP call total (the second query adopts IN-MEMORY); a
//         different query text → exactly one more call. Same-text scores are
//         identical (adoption). F1/F2 amendment (RCA-3 pass 2, the
//         Architect ruling): the query misses are adopted IN-MEMORY ONLY —
//         session-scoped, NOT persisted (the file and the VectorCache map
//         are untouched); ONLY maintenance (node-content) embeds write
//         through. (The original L4 tail — "query misses write through" —
//         is SUPERSEDED by that ruling and is re-pinned to the non-persisted
//         contract here.)
//     L5  NO-CACHE PASSTHROUGH (W5d): the same maintenance touch with NO
//         cache → byte-identical W3 behavior (the embed happens, the hook
//         resolves — no throw, the node is re-indexed with the fresh vector,
//         and NO cache file is created).
//     L7a FLUSH-FORCES (W5b + the F-W4-1 pin): after the hook resolves the
//         entry is NOT yet on disk (the cache's debounced queue — never a
//         synchronous per-set write); cache.flush() FORCES the file to
//         reflect the entry.
//     L7b DEBOUNCE AUTO-PERSIST (W5b: "no explicit flush is needed
//         post-promotion"): after the hook resolves, waiting out
//         CACHE_WRITE_DEBOUNCE_MS persists the entry with NO flush call.
//
//   Fail/edge states:
//     L6  FAILED-EMBED (§5.13 write-through happens "after each SUCCESSFUL
//         embed"): a live embed that REJECTS does NOT write through — the
//         cache file is BYTE-UNCHANGED after flush (the hook itself resolves:
//         the W3 transient-skip policy is unchanged); CONTRAST: a subsequent
//         SUCCESSFUL live embed DOES write through and the failed text's
//         hash never appears in the file.
//
//   RCA-3 PASS-2 regressions (the F1/F2/F3/F6 fix shapes — the supervisor
//   ruling; F5 in-flight dedup NOT approved, note-only, unpinned):
//     R1  QUERY-MISS-NO-PERSIST (F1/F2): a query-only session leaves a
//         pre-seeded cache file BYTE-UNCHANGED after flush; the second
//         identical query adopts with ZERO additional HTTP calls and the
//         provider's (correct) vector; no query hash reaches the disk OR the
//         VectorCache map (the adoption is the memoizer's SESSION map).
//     R2  QUERY-MISS-NO-CREATE (F1/F2): a query-only session NEVER CREATES
//         the cache file (an absent file stays absent — immediately AND
//         after the coalescing window: no write is ever scheduled).
//     R3  QUERY-MAINTENANCE-CONTRAST (F1/F2): in ONE session the query-only
//         phase leaves the file byte-unchanged while the maintenance hook
//         embed (new node content) DOES write through; the query text stays
//         off-disk while remaining in-memory adopted.
//     R4  PER-EMBED-DIMENSION (F3): a getter-backed provider double whose
//         `dimension` latches (0 at memoizer creation → 4 after the first
//         embed) is NOT permanently hit-ineligible — the second
//         identical-text embed is a HIT (exactly ONE provider embed total).
//     R5  INPUT-GUARD (F6): a non-string text rejects with the pinned
//         'cache memoizer: text must be a string' message (never a raw
//         crypto TypeError from the hash helper).
//
//   RED EXPECTATION (W5 not implemented yet): L1/L1b/L2/L2b/L3/L4/L6/L7a/L7b
//   RED (the live embeds do not consult the cache: extra HTTP calls, no
//   in-memory entry, no persisted entry, re-embedded query texts); L5 pins
//   UNCHANGED W3 behavior and is expected GREEN on arrival (it guards the W5d
//   byte-identical clause against the W5 implementation).
//
//   RCA-3 PASS-2 RED (run BEFORE the F1/F2/F3/F6 fix): R1/R2/R3/R4/R5 FAIL
//   (the current memoizer persists query misses — the file is modified/
//   created; `provider.dimension` is latched at creation — the latching
//   double is hit-ineligible forever; a non-string text throws a raw crypto
//   TypeError) AND the re-pinned L4 tail (the query path is NOT persisted)
//   FAILS against the current code. The 9 untouched siblings stay green.
//   (Deviation note: the supervisor's red expectation was "the existing 10
//   stay green" on the premise that L4 asserted only the HTTP-call count —
//   the actual L4 tail also asserted query-path file persistence, which the
//   approved F1/F2 ruling supersedes, so L4 is re-pinned and joins the red
//   set; its HTTP-call pins are kept verbatim.)
//
// QUESTION (spec-untestable-as-written — reported to the supervisor, NOT
// invented):
//   Q1 §5.13 W5 names the memoizer for the `score` query-embeds AND the
//      `onStoreChanged` maintenance embeds ONLY. `place()`'s content-embed
//      (§5.5) is NOT named in the amendment — whether the placement embed
//      routes through the memoizer is UNPINNED, so no test here pins it (a
//      pin would invent the contract). If place() should memoize too, the
//      spec needs a sentence.
//   Q2 the `cache?` option's DEFAULT-path wiring (createVectorCache() without
//      opts.path → Electron userData) is main.ts-owned (the §5.12 module-seam
//      note — the same limitation as the W4 QUESTION 2 in
//      tests/vector-cache.test.ts); only an explicit `opts.path` cache is
//      node-testable here.
// ============================================================================
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  existsSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import {
  createVectorCache,
  createSingleTextMemoizer,
  type CacheKey,
} from '../src/main/vector-cache.js'
// The namespace form (the tests/vector-cache.test.ts idiom): a namespace
// access degrades to `undefined` when the export is missing, so a drift fails
// the ASSERTION (with the 500 fallback) instead of the module load.
import * as vectorCacheModule from '../src/main/vector-cache.js'
import { createVectorBootController } from '../src/main/vector-boot.js'
import {
  createVectorEmbedder,
  createEmbeddingProvider,
  createVectorIndex,
} from '../src/main/embeddings.js'
import { createJsonRagStore, type RagNode } from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// helpers (the tests/vector-cache.test.ts + tests/embeddings-failure-policy.test.ts
// idioms — borrowed verbatim where possible)
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-live-embed-cache-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** The cache path for a test — ALWAYS inside a mkdtemp tmpdir (never real
 *  userData). */
function cachePathIn(dir: string): string {
  return join(dir, 'provident-vector-cache.json')
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

/** contentHash = the lowercase-hex SHA-256 of the EXACT embedded text
 *  (§5.13 — plain SHA-256 of the embedded TEXT, no normalization). */
function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/** The memoizer key for the test provider tuple (ollama / embeddinggemma /
 *  dim 4 — the §5.13 key discipline). */
function keyOf(contentHash: string, dimension = 4): CacheKey {
  return { kind: 'ollama', model: 'embeddinggemma', dimension, contentHash }
}

/** A deterministic bag-of-words → fixed-dimension embedding (the mock's
 *  algorithm shape — same idiom as the sibling test files). */
function textEmbedding(text: string, dim = 4): number[] {
  const vec = new Array(dim).fill(0)
  const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  for (const t of tokens) {
    let h = 0
    for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0
    vec[h % dim] += 1
  }
  return vec
}

/** A LOCAL EmbedTextFn double for building PREBUILT indexes (no HTTP — the
 *  prebuilt-index adoption means createVectorEmbedder makes NO build embeds). */
function localEmbedOf(vec: number[]): (text: string) => Promise<number[]> {
  return async (_text: string) => [...vec]
}

/** A deterministic LOCAL embed (the mock's algorithm — no HTTP). */
function textLocalEmbed(text: string): Promise<number[]> {
  return Promise.resolve(textEmbedding(text))
}

type CacheSeed = {
  kind: string
  model: string
  dimension: number
  contentHash: string
  vector: number[]
  savedAt: number
}

/** A well-formed cache entry (the §5.13 pinned format) with defaults that
 *  match the test provider tuple (ollama / embeddinggemma / dim 4). */
function seedEntry(over: Partial<CacheSeed> = {}): CacheSeed {
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    dimension: 4,
    contentHash: sha256Hex('seed-text'),
    vector: [0, 0, 0, 1],
    savedAt: 1700000000000,
    ...over,
  }
}

function writeCacheFile(path: string, entries: unknown[], version: unknown = 1): void {
  writeFileSync(path, JSON.stringify({ version, entries }), 'utf8')
}

function readCacheFile(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** Capture every console line regardless of stream (the sibling idiom) — used
 *  to keep the pinned absent-file cache-load log out of the runner output. */
function captureConsole(): { lines: string[] } {
  const lines: string[] = []
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      lines.push(args.map((a) => String(a)).join(' '))
    })
  }
  return { lines }
}

function parseBody(init: RequestInit): any {
  const b = init.body
  if (typeof b === 'string') return JSON.parse(b)
  return b
}

/** Stub the global `fetch` with a responder; records URL/init/parsed body. */
function stubFetch(
  responder: (url: string, init: RequestInit) => { ok: boolean; status: number; json: () => Promise<unknown> },
): Array<{ url: string; init: RequestInit; body: any }> {
  const calls: Array<{ url: string; init: RequestInit; body: any }> = []
  vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
    const body = parseBody(init)
    calls.push({ url, init, body })
    return responder(url, init)
  }))
  return calls
}

/** The texts carried by a recorded fetch call (a single-text embed posts
 *  `input: <string>`; a batch posts `input: [t1..tn]`). */
function callTexts(call: { body: any }): string[] {
  return Array.isArray(call.body?.input) ? call.body.input : [call.body?.input]
}

/** The `input` field of an ollama embed request body (a single-text embed
 *  posts `input: <string>`; a batch posts `input: [t1..tn]`). */
function vectorsInputOf(init: RequestInit): string {
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : (init.body as any)
  return Array.isArray(body?.input) ? body.input[0] : body?.input
}

/** Stub fetch with a PER-TEXT vector map + a mutable fallback (the ollama
 *  single-text request shape `{ model, input: <text> }` →
 *  `{ embeddings: [<vector>] }`). All live-path calls here are single-text
 *  (no embedBatchFn is supplied anywhere in this file). */
function stubOllama(
  vectors: Record<string, number[]>,
  fallback: () => number[],
): Array<{ url: string; init: RequestInit; body: any }> {
  return stubFetch((_url, init) => {
    const input: string = vectorsInputOf(init)
    const vec = vectors[input] ?? fallback()
    return { ok: true, status: 200, json: async () => ({ embeddings: [vec] }) }
  })
}

/** The REAL ollama provider (dimension pinned to 4) over the stubbed fetch —
 *  the §5.2 provider seam, so every embed is a REAL (stubbed) HTTP call that
 *  the `calls` array counts (the "HTTP call HAPPENS / does NOT happen"
 *  observables). */
function makeFetchProvider() {
  return createEmbeddingProvider({
    provider: 'ollama',
    baseUrl: 'http://127.0.0.1:11434',
    model: 'embeddinggemma',
    dimension: 4,
  })
}

function makeStore(dir: string) {
  return createJsonRagStore({ path: join(dir, 'rag.json') })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// the suite
// ---------------------------------------------------------------------------

describe('Unit F / W5 — the live embed cache (unit-f-embeddings.md §5.13 W5 amendment + §5.5 `cache?` + §5.12 promote step)', () => {

  // =========================================================================
  // (1) LIVE-MISS-WRITE-THROUGH — W5(b), the update route
  // =========================================================================

  describe('§5.13 W5(b) LIVE-MISS-WRITE-THROUGH — a changed node content embeds + writes through', () => {
    it('L1. a promoted embedder (cache + fetch-stubbed provider) whose node content CHANGED → the onStoreChanged touch makes the embed HTTP call HAPPEN (new content) and after cache.flush() the cache file contains the new contentHash entry', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole() // silence the pinned absent-file cache-load log
        const store = makeStore(dir)
        await store.putNode(makeNode('node-x', { content: 'old content text' }))
        // prebuilt index: node-x at its OLD content (a LOCAL embed — no HTTP)
        const prebuilt = await createVectorIndex(
          [makeNode('node-x', { content: 'old content text' })],
          textLocalEmbed,
        )
        const calls = stubOllama({ 'brand new text': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        // the node's content changes; the hook touch is the only embed
        await store.putNode(makeNode('node-x', { content: 'brand new text' }))
        await embedder.onStoreChanged!('content', ['node-x'], [])
        // the embed HTTP call HAPPENED (new content) — exactly one, only for
        // the new text (the old content is never re-sent)
        expect(calls.length).toBe(1)
        expect(callTexts(calls[0])).toEqual(['brand new text'])
        // after flush() the cache file contains the new contentHash entry
        await cache.flush()
        expect(existsSync(path)).toBe(true)
        const disk = readCacheFile(path)
        const entry = disk.entries.find((e: any) => e.contentHash === sha256Hex('brand new text'))
        expect(entry).toBeDefined()
        expect(entry).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4 })
        expect(entry.vector).toEqual([0, 0, 0, 1]) // what the provider returned
        expect(typeof entry.savedAt).toBe('number')
        // the old content was never embedded through the cache path — only
        // the touched text was written through
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('old content text'))).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('L1b. the live miss write-through is visible IN-MEMORY immediately after the hook resolves (cache.get, NO flush) — the shared in-memory map', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-x', { content: 'old content text' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-x', { content: 'old content text' })],
          textLocalEmbed,
        )
        stubOllama({ 'brand new text': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        await store.putNode(makeNode('node-x', { content: 'brand new text' }))
        await embedder.onStoreChanged!('content', ['node-x'], [])
        // the SAME VectorCache instance the embedder was handed already holds
        // the entry — no flush needed for the in-memory map
        expect(cache.get(keyOf(sha256Hex('brand new text')))).toEqual([0, 0, 0, 1])
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (2) LIVE-HIT — W5(b), the update + add routes
  // =========================================================================

  describe('§5.13 W5(b) LIVE-HIT — a live embed whose content is already cached adopts with NO HTTP call', () => {
    it('L2. a touch whose (identical) content is pre-seeded on the SAME VectorCache instance (update route) → NO embed HTTP call + the CACHED vector stored in the index', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-h', { content: 'cached content text' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-h', { content: 'cached content text' })],
          textLocalEmbed,
        )
        const cache = createVectorCache({ path })
        // pre-seeded via the SAME VectorCache instance (in-memory, not the file)
        const CACHED = [0, 1, 0, 0]
        cache.set(keyOf(sha256Hex('cached content text')), CACHED)
        cache.set(keyOf(sha256Hex('qh')), CACHED) // the query text too → the whole test makes ZERO calls
        const calls = stubOllama({ 'cached content text': [0, 0, 1, 0] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        // the touch: the node's content is IDENTICAL to the cached entry
        await embedder.onStoreChanged!('content', ['node-h'], [])
        // NO embed HTTP call at all
        expect(calls.length).toBe(0)
        // the CACHED vector is stored in the index: the query 'qh' (also a
        // cache hit → [0,1,0,0]) must score node-h ≈ 1 against the ADOPTED
        // vector; a re-embed would have stored the provider's [0,0,1,0] and
        // scored 0
        const ranked = await embedder.score('qh', store.listNodes())
        const hit = ranked.find((s) => s.nodeId === 'node-h')
        expect(hit).toBeDefined()
        expect(hit!.score).toBeGreaterThan(0.99)
        await cache.flush() // settle the pre-seed queue before the cleanup
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('L2b. a NEW node whose content is pre-seeded on the same instance (add route) → NO embed HTTP call + the cached vector stored', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-base', { content: 'base text' }))
        await store.putNode(makeNode('node-new', { content: 'cached add text' }))
        // prebuilt index holds ONLY node-base → the node-new touch is an ADD
        const prebuilt = await createVectorIndex(
          [makeNode('node-base', { content: 'base text' })],
          textLocalEmbed,
        )
        const cache = createVectorCache({ path })
        const CACHED = [0, 1, 0, 0]
        cache.set(keyOf(sha256Hex('cached add text')), CACHED)
        cache.set(keyOf(sha256Hex('qh2')), CACHED)
        const calls = stubOllama({ 'cached add text': [0, 0, 1, 0] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        await embedder.onStoreChanged!('content', ['node-new'], [])
        // NO embed HTTP call (the add adopted the cached vector)
        expect(calls.length).toBe(0)
        const ranked = await embedder.score('qh2', store.listNodes())
        const hit = ranked.find((s) => s.nodeId === 'node-new')
        expect(hit).toBeDefined()
        expect(hit!.score).toBeGreaterThan(0.99) // the CACHED vector was stored
        await cache.flush()
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (3) SHARED-INSTANCE — W5(c), the promote step passes the SAME cache
  // =========================================================================

  describe('§5.13 W5(c) SHARED-INSTANCE: build-time entries are live-hittable on a maintenance touch', () => {
    it('L3. an entry written during a BUILD with the same VectorCache instance is a live HIT on a subsequent maintenance touch (NO HTTP; the build-time vector stays)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-a', { content: 'shared build text' }))
        await store.putNode(makeNode('node-b', { content: 'other build text' }))
        // the provider's "model state" CHANGES after the build: any post-build
        // re-embed would return [0,0,0,1] instead of the build-time [1,0,0,0]
        let postBuild = false
        const vectors: Record<string, number[]> = {}
        const calls = stubFetch((_url, init) => {
          const input: string = vectorsInputOf(init)
          const vec = vectors[input] ?? (postBuild ? [0, 0, 0, 1] : [1, 0, 0, 0])
          return { ok: true, status: 200, json: async () => ({ embeddings: [vec] }) }
        })
        const provider = makeFetchProvider()
        // the SAME instance is used for the build AND (per W5c) handed to the
        // promoted embedder
        const cache = createVectorCache({ path })
        const boot = createVectorBootController(store, provider, { cache })
        const report = await boot.start()
        expect(boot.phase()).toBe('promoted')
        expect(report.embedded).toBe(2) // a cold cache → both nodes embedded
        expect(report.cacheHits).toBe(0)
        const buildCalls = calls.length
        expect(buildCalls).toBe(2)
        postBuild = true // flip the provider's answer for ANY post-build embed
        vectors['qpost'] = [2, 1, 0, 0] // the controlled query vector
        // a maintenance touch of node-a whose content is UNCHANGED — the
        // build-time entry (written through the SAME instance) must be a
        // live HIT: NO HTTP call
        await boot.engine.onStoreChanged('content', ['node-a'], [])
        expect(calls.length).toBe(buildCalls)
        // the index still holds the BUILD-TIME vector: qpost → [2,1,0,0]
        // scores [1,0,0,0] at ≈0.894 and [0,0,0,1] at 0 — a re-embed would
        // EXCLUDE node-a from ranked entirely
        const r = await boot.engine.query('qpost', { k: 10 })
        expect(r.ranked.map((s: { nodeId: string }) => s.nodeId)).toEqual(['node-a', 'node-b'])
        expect(calls.length).toBe(buildCalls + 1) // +1 = the query embed only
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (4) QUERY-EMBED-CACHE — W5(a)
  // =========================================================================

  describe('§5.13 W5(a) QUERY-EMBED-CACHE: the score query-embeds route through the memoizer', () => {
    it('L4. score(same text) twice → exactly ONE provider HTTP call total (the second query adopts IN-MEMORY — F1/F2: the query path is session-adopted, NOT persisted); a different query text → exactly one more call', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-q', { content: 'indexed node text' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-q', { content: 'indexed node text' })],
          textLocalEmbed,
        )
        const calls = stubOllama({ 'same query text': [0, 1, 0, 0] }, () => [1, 0, 0, 0]) // the pinned query → [0,1,0,0]; other texts → the fallback
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        const r1 = await embedder.score('same query text', store.listNodes())
        expect(calls.length).toBe(1) // the first query embed is a MISS → one call
        expect(callTexts(calls[0])).toEqual(['same query text'])
        const r2 = await embedder.score('same query text', store.listNodes())
        expect(calls.length).toBe(1) // the SECOND query ADOPTS — still exactly ONE call
        expect(r2).toEqual(r1) // the same ranked result (adoption + determinism)
        // the correct ADOPTED vector: the stub returns [0,1,0,0] for
        // 'same query text' — cos([0,1,0,0], local('indexed node text') =
        // [0,2,1,0]) = 2/√5 ≈ 0.894
        expect(r1[0]?.nodeId).toBe('node-q')
        expect(r1[0]!.score).toBeCloseTo(2 / Math.sqrt(5), 3)
        await embedder.score('a different query', store.listNodes())
        expect(calls.length).toBe(2) // a different text → exactly one more call
        expect(callTexts(calls[1])).toEqual(['a different query'])
        // F1/F2 (the RCA-3 pass-2 ruling): the query misses are adopted
        // IN-MEMORY ONLY — nothing reaches the disk or the VectorCache map
        await cache.flush()
        expect(existsSync(path)).toBe(false) // the query path never schedules a write
        expect(cache.get(keyOf(sha256Hex('same query text')))).toBeUndefined()
        expect(cache.get(keyOf(sha256Hex('a different query')))).toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (5) NO-CACHE PASSTHROUGH — W5(d)
  // =========================================================================

  describe('§5.13 W5(d) NO-CACHE passthrough: absent cache → byte-identical W1–W3 behavior', () => {
    it('L5. the same maintenance touch with NO cache → the embed happens, the hook resolves (no throw), the node is re-indexed, and NO cache file is created', async () => {
      const dir = freshDir()
      try {
        const store = makeStore(dir)
        await store.putNode(makeNode('node-y', { content: 'passthrough old' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-y', { content: 'passthrough old' })],
          textLocalEmbed,
        )
        const calls = stubOllama({ 'passthrough new': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        // NO cache option — the W1–W3 behavior, unchanged
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt })
        await store.putNode(makeNode('node-y', { content: 'passthrough new' }))
        await expect(embedder.onStoreChanged!('content', ['node-y'], [])).resolves.toBeUndefined()
        expect(calls.length).toBe(1) // the embed happens (W3)
        expect(callTexts(calls[0])).toEqual(['passthrough new'])
        // the node is re-indexed with the freshly embedded vector
        const ranked = await embedder.score('passthrough new', store.listNodes())
        expect(ranked[0]?.nodeId).toBe('node-y')
        expect(ranked[0]!.score).toBeGreaterThan(0.99)
        // NO cache file was created anywhere in the test dir
        expect(existsSync(join(dir, 'provident-vector-cache.json'))).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (6) THE FAILED-EMBED RULE — write-through happens only AFTER success
  // =========================================================================

  describe('§5.13 failed-embed rule: a live embed that REJECTS does NOT write through', () => {
    it('L6. a rejecting live embed leaves the cache file BYTE-UNCHANGED after flush (the hook resolves — the W3 transient policy); a subsequent SUCCESSFUL live embed DOES write through and the failed text is never cached', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const store = makeStore(dir)
        await store.putNode(makeNode('node-f', { content: 'failed old' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-f', { content: 'failed old' })],
          textLocalEmbed,
        )
        // a well-formed PRE-SEEDED file so "unchanged" is meaningful (it loads
        // silently — no load-failed log for a well-formed file)
        writeCacheFile(path, [seedEntry({ contentHash: sha256Hex('seeded sibling'), vector: [1, 1, 1, 1] })])
        const cache = createVectorCache({ path })
        const calls = stubFetch((_url, init) => {
          const input: string = vectorsInputOf(init)
          if (input === 'doomed new') {
            return { ok: false, status: 500, json: async () => ({ error: 'boom' }) }
          }
          return { ok: true, status: 200, json: async () => ({ embeddings: [[0, 0, 0, 1]] }) }
        })
        const provider = makeFetchProvider()
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        const before = readFileSync(path)
        // the live embed REJECTS (HTTP 500) → the W3 transient policy resolves
        // the hook (§5.9 #46, unchanged) and NOTHING is written through
        await store.putNode(makeNode('node-f', { content: 'doomed new' }))
        await embedder.onStoreChanged!('content', ['node-f'], [])
        expect(calls.length).toBe(1) // the embed was ATTEMPTED (the provider was reached)
        await cache.flush()
        expect(readFileSync(path).equals(before)).toBe(true) // byte-unchanged
        // CONTRAST: the next touch with NEW content embeds successfully and
        // DOES write through — while the failed text's hash never appears
        await store.putNode(makeNode('node-f', { content: 'recovered text' }))
        await embedder.onStoreChanged!('content', ['node-f'], [])
        expect(calls.length).toBe(2)
        await cache.flush()
        const disk = readCacheFile(path)
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('recovered text'))).toBe(true)
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('doomed new'))).toBe(false)
        // the seeded sibling survives the whole-map write
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('seeded sibling'))).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (7) THE DEBOUNCE + FLUSH PINS — the live write-through rides the cache's
  //     own single-writer queue (F-W4-1)
  // =========================================================================

  describe('§5.13 W5(b) write timing: the debounced queue persists the live entry; flush() forces it', () => {
    it('L7a. FLUSH-FORCES: after the hook resolves the entry is NOT yet on disk (the debounced queue — never a synchronous per-set write); cache.flush() forces the file to reflect the entry', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-d', { content: 'debounce old' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-d', { content: 'debounce old' })],
          textLocalEmbed,
        )
        stubOllama({ 'debounce new': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        await store.putNode(makeNode('node-d', { content: 'debounce new' }))
        await embedder.onStoreChanged!('content', ['node-d'], [])
        // the live write-through went through the cache's DEBOUNCED queue —
        // the file does NOT yet reflect the entry
        const onDiskYet = existsSync(path) &&
          readCacheFile(path).entries.some((e: any) => e.contentHash === sha256Hex('debounce new'))
        expect(onDiskYet).toBe(false)
        // flush() FORCES the pending write
        await cache.flush()
        expect(existsSync(path)).toBe(true)
        const disk = readCacheFile(path)
        const entry = disk.entries.find((e: any) => e.contentHash === sha256Hex('debounce new'))
        expect(entry).toBeDefined()
        expect(entry.vector).toEqual([0, 0, 0, 1])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('L7b. DEBOUNCE AUTO-PERSIST: after the hook resolves, waiting out CACHE_WRITE_DEBOUNCE_MS persists the entry with NO flush call (§5.13 W5b: "no explicit flush is needed post-promotion")', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole()
        const store = makeStore(dir)
        await store.putNode(makeNode('node-w', { content: 'autoflush old' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-w', { content: 'autoflush old' })],
          textLocalEmbed,
        )
        stubOllama({ 'autoflush new': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        await store.putNode(makeNode('node-w', { content: 'autoflush new' }))
        await embedder.onStoreChanged!('content', ['node-w'], [])
        // NO flush() call — the cache's own debounced queue persists the entry
        const debounceMs = (vectorCacheModule as { CACHE_WRITE_DEBOUNCE_MS?: unknown }).CACHE_WRITE_DEBOUNCE_MS
        const waitMs = (typeof debounceMs === 'number' ? debounceMs : 500) + 300
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        expect(existsSync(path)).toBe(true)
        const disk = readCacheFile(path)
        const entry = disk.entries.find((e: any) => e.contentHash === sha256Hex('autoflush new'))
        expect(entry).toBeDefined()
        expect(entry.vector).toEqual([0, 0, 0, 1])
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // (8) RCA-3 PASS-2 REGRESSIONS — F1/F2 (query misses are adopted in-memory
  //     only), F3 (the dimension is read per embed), F6 (the input guard)
  // =========================================================================

  describe('§5.13 W5 F1/F2/F3/F6 regressions (RCA-3 pass 2): query misses are session-adopted, the dimension is per-embed, the input is validated', () => {

    it('R1. QUERY-MISS-NO-PERSIST: a query-only session leaves a PRE-SEEDED cache file BYTE-UNCHANGED after flush; the second identical query adopts with ZERO additional HTTP calls and the provider\'s (correct) vector; no query hash reaches the disk or the VectorCache map', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        // a well-formed PRE-SEEDED file so "byte-unchanged" is meaningful
        writeCacheFile(path, [seedEntry({ contentHash: sha256Hex('seeded sibling'), vector: [1, 1, 1, 1] })])
        const cache = createVectorCache({ path })
        const store = makeStore(dir)
        await store.putNode(makeNode('node-q', { content: 'indexed node text' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-q', { content: 'indexed node text' })],
          textLocalEmbed,
        )
        // 'same query text' → [0,1,0,0]; any other text → the fallback
        const calls = stubOllama({ 'same query text': [0, 1, 0, 0] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        const before = readFileSync(path)
        // the query-only session: two identical queries + a different one
        const r1 = await embedder.score('same query text', store.listNodes())
        expect(calls.length).toBe(1) // the first query MISS → one HTTP call
        expect(callTexts(calls[0])).toEqual(['same query text'])
        // the correct vector: cos([0,1,0,0], local('indexed node text') =
        // [0,2,1,0]) = 2/√5 ≈ 0.894
        expect(r1[0]?.nodeId).toBe('node-q')
        expect(r1[0]!.score).toBeCloseTo(2 / Math.sqrt(5), 3)
        const r2 = await embedder.score('same query text', store.listNodes())
        expect(calls.length).toBe(1) // the second query ADOPTS IN-MEMORY — zero additional calls
        expect(r2).toEqual(r1)
        await embedder.score('a different query', store.listNodes())
        expect(calls.length).toBe(2) // a different text → exactly one more call
        // nothing was written through: the file is BYTE-UNCHANGED after flush
        await cache.flush()
        expect(readFileSync(path).equals(before)).toBe(true)
        const disk = readCacheFile(path)
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('same query text'))).toBe(false)
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('a different query'))).toBe(false)
        // the adoption is the memoizer's SESSION map, not a cache entry
        expect(cache.get(keyOf(sha256Hex('same query text')))).toBeUndefined()
        expect(cache.get(keyOf(sha256Hex('a different query')))).toBeUndefined()
        // the seeded sibling survived untouched
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('seeded sibling'))).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R2. QUERY-MISS-NO-CREATE: a query-only session NEVER CREATES the cache file (an absent file stays absent — immediately AND after the coalescing window: no write is ever scheduled)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole() // silence the pinned absent-file cache-load log
        const store = makeStore(dir)
        await store.putNode(makeNode('node-q', { content: 'indexed node text' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-q', { content: 'indexed node text' })],
          textLocalEmbed,
        )
        const calls = stubOllama({}, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const cache = createVectorCache({ path })
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        await embedder.score('same query text', store.listNodes())
        await embedder.score('same query text', store.listNodes()) // in-memory adoption
        expect(calls.length).toBe(1)
        await cache.flush()
        // no write was ever scheduled: the file does not exist now...
        expect(existsSync(path)).toBe(false)
        // ...and still does not exist after the coalescing window (nothing
        // pending — the query path never schedules a write)
        const debounceMs = (vectorCacheModule as { CACHE_WRITE_DEBOUNCE_MS?: unknown }).CACHE_WRITE_DEBOUNCE_MS
        const waitMs = (typeof debounceMs === 'number' ? debounceMs : 500) + 300
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        expect(existsSync(path)).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R3. QUERY-MAINTENANCE-CONTRAST: in ONE session the query-only phase leaves the file byte-unchanged while the maintenance hook embed (new node content) DOES write through; the query text stays off-disk while remaining in-memory adopted', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        writeCacheFile(path, [seedEntry({ contentHash: sha256Hex('seeded sibling'), vector: [1, 1, 1, 1] })])
        const cache = createVectorCache({ path })
        const store = makeStore(dir)
        await store.putNode(makeNode('node-m', { content: 'maintenance old' }))
        const prebuilt = await createVectorIndex(
          [makeNode('node-m', { content: 'maintenance old' })],
          textLocalEmbed,
        )
        const calls = stubOllama({ 'maintenance new': [0, 0, 0, 1] }, () => [1, 0, 0, 0])
        const provider = makeFetchProvider()
        const embedder = await createVectorEmbedder(store, { provider, index: prebuilt, cache })
        // the query-only phase: misses → in-memory ONLY, the file byte-unchanged
        const before = readFileSync(path)
        await embedder.score('query only text', store.listNodes())
        await embedder.score('query only text', store.listNodes()) // session adoption
        expect(calls.length).toBe(1)
        await cache.flush()
        expect(readFileSync(path).equals(before)).toBe(true)
        // the maintenance phase: the hook embed of NEW content DOES write through
        await store.putNode(makeNode('node-m', { content: 'maintenance new' }))
        await embedder.onStoreChanged!('content', ['node-m'], [])
        expect(calls.length).toBe(2) // exactly one embed call, for the new content
        expect(callTexts(calls[1])).toEqual(['maintenance new'])
        await cache.flush()
        const disk = readCacheFile(path)
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('maintenance new'))).toBe(true)
        // the query text is STILL absent from the file (in-memory only)...
        expect(disk.entries.some((e: any) => e.contentHash === sha256Hex('query only text'))).toBe(false)
        // ...while a repeat query still adopts (no additional call)
        const callsBefore = calls.length
        await embedder.score('query only text', store.listNodes())
        expect(calls.length).toBe(callsBefore)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R4. PER-EMBED-DIMENSION: a getter-backed provider double whose dimension LATCHES (0 at memoizer creation → 4 after the first embed) is not permanently hit-ineligible — the second identical-text embed is a HIT (exactly ONE provider embed total)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole() // silence the pinned absent-file cache-load log
        const cache = createVectorCache({ path })
        let embedCalls = 0
        // the getter-backed double: `dimension` latches — 0 at memoizer
        // creation, 4 after the first embed (a cold auto-detect provider)
        const providerDouble = {
          kind: 'ollama',
          model: 'embeddinggemma',
          get dimension(): number {
            return embedCalls > 0 ? 4 : 0
          },
          embed(_text: string): Promise<number[]> {
            embedCalls++
            return Promise.resolve([1, 0, 0, 0])
          },
        }
        const memoizer = createSingleTextMemoizer(providerDouble, cache)
        const v1 = await memoizer.embed('latch text') // cold: dim 0 → cache-ineligible → embeds
        expect(v1).toEqual([1, 0, 0, 0])
        expect(embedCalls).toBe(1)
        // the SECOND identical-text embed: the live dimension is now 4 → the
        // session tuple matches → a HIT (no second provider embed)
        const v2 = await memoizer.embed('latch text')
        expect(v2).toEqual([1, 0, 0, 0])
        expect(embedCalls).toBe(1) // RED with a creation-time dimension latch: 2 calls
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R5. INPUT-GUARD: a non-string text rejects with the pinned message (never a raw crypto TypeError from the hash helper)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole() // silence the pinned absent-file cache-load log
        const cache = createVectorCache({ path })
        const providerDouble = {
          kind: 'ollama',
          model: 'embeddinggemma',
          dimension: 4,
          embed: async (_text: string): Promise<number[]> => [1, 0, 0, 0],
        }
        const memoizer = createSingleTextMemoizer(providerDouble, cache)
        await expect(memoizer.embed(undefined as unknown as string)).rejects.toThrow('cache memoizer: text must be a string')
        await expect(memoizer.embed(null as unknown as string)).rejects.toThrow('cache memoizer: text must be a string')
        // the guard fires BEFORE the hash helper (which would throw the raw
        // crypto TypeError) and before any provider/cache interaction
      } finally {
        rmSyncSafe(dir)
      }
    })
  })
})