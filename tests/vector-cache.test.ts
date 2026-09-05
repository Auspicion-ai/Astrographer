// tests/vector-cache.test.ts — Unit F / W4: the persisted embedding cache
// (docs/specs/unit-f-embeddings.md §5.13 — the cache-inclusive variant;
// §5.8 #40–42; §5.9 #49–51; §5.12 VectorBootOptions.cache + the
// PromotionReport.cacheHits census).
//
// Mirrors tests/vector-boot.test.ts / tests/embeddings.test.ts conventions
// (vitest node environment, `.js` import suffix for the main-process ESM
// modules, temp dirs via node:fs mkdtemp, a stubbed global `fetch` for the
// REAL provider HTTP path and full provider DOUBLES for the injected-provider
// controller path — NO live network anywhere). EVERY cache path in this file
// is join(freshDir(), ...) under a mkdtemp tmpdir — NO test touches real
// Electron userData.
//
// The primary module under test is `src/main/vector-cache.ts` (the W4 module
// seam: pure + injectable, NO Electron) — it DOES NOT EXIST yet, so this
// whole file is RED (the static import fails to resolve). The boot-path tests
// additionally pin the W4 `VectorBootOptions.cache?` option on the EXISTING
// `src/main/vector-boot.ts` seam — those are expected to surface their own
// controller-option reds once the module lands.
//
// ============================================================================
// STATE ENUMERATION (derived from the spec text ALONE — §5.13 + §5.8 #40–42 +
// §5.9 #49–51 + §5.12; one valid/happy-path test per reasonable data state,
// one fail-safe test per documented fail-state):
//
//   The module seam (§5.13 "The VectorCache seam"):
//     CacheKey   { kind, model, dimension, contentHash }
//     VectorCache{ get(key) → number[] | undefined (HIT = cached vector,
//                  MISS = undefined), set(key, vector) (write-through enqueue,
//                  single-writer, atomic temp+rename, serialized, never
//                  awaited by the embed loop), prune(keepKeys: Set<string>)
//                  (drop entries outside keepKeys or with a foreign provider
//                  tuple, rewrite the file ONCE), flush() (drain; resolves
//                  when the file reflects every set) }
//     createVectorCache(opts?: { path?: string }) — reads the file
//     SYNCHRONOUSLY at creation; opts.path defaults to
//     join(app.getPath('userData'), 'provident-vector-cache.json') (the
//     default-path wiring is Electron/main.ts-owned — OUT of this
//     node-testable seam, see the QUESTION block).
//
//   §5.8 happy states under test here:
//     #40 cache hit adoption — a node whose (kind, model, dimension,
//         contentHash) is in the persisted cache adopts the cached vector
//         with NO HTTP call (the memoizing wrapper; createVectorIndex stays
//         cache-agnostic).
//     #41 cache miss embed + write-through — a miss embeds through the
//         provider and the entry is persisted (write-through, queued) after
//         the embed succeeds.
//     #42 cache prune — at promotion, entries whose key tuple ≠ the current
//         provider tuple, or whose contentHash matches no current store
//         node's embedded text, are dropped and the file is rewritten ONCE.
//     (1) load happy — a well-formed file loads; get() returns the cached
//         vector for the matching key. The file is read SYNCHRONOUSLY at
//         createVectorCache call time (§5.13 load ownership).
//     (4) key-tuple hit/miss — an exact tuple HITs; changing ANY of the four
//         tuple fields (contentHash / model / dimension / kind) is a MISS
//         (§5.13 invalidation: a hash mismatch OR a key mismatch).
//     (10) flush() resolves when the file reflects every set(); a same-key
//         set() overwrites on write-through (§5.13: "the new entry overwrites
//         on write-through"); flush() with an empty queue resolves.
//     (5) the memoizing wrapper through the BOOT PATH — the controller wraps
//         the embed fns it supplies to createVectorIndex; the W4 wiring
//         constructs the cache AT controller creation
//         (`createVectorBootController(ragStore, provider, { cache:
//         createVectorCache() })`); report.cacheHits ≥ 1 (§5.12 census).
//     (6) write-through timing — the single-writer queue is DRAINED before
//         the promotion report resolves (the persisted cache reflects the
//         promoted index; no explicit flush needed by the caller).
//     (7) the batch wrapper — positional alignment preserved: hits adopted in
//         place, misses batch-embedded, the assembled array length === 
//         texts.length; the W2 per-item fallback routes through the SAME
//         wrapper (a fallback-embedded text is a cache write-through like any
//         other embed).
//
//   §5.9 fail-states under test here:
//     #49 corrupt/unreadable cache file — an absent file, invalid JSON, a
//         non-object root, or a wrong/absent `version` → the cache is treated
//         as EMPTY (a full re-embed) + logged
//         `vector cache: load failed (treating as empty): <error>`; the load
//         NEVER throws and boot NEVER crashes on the cache. (Also covers the
//         unreadable-file case — permission-denied.)
//     #50 cache write failure — NON-FATAL: logged
//         `vector cache: write failed (non-fatal): <error>`; the in-memory
//         index and the promotion continue; the next successful write
//         recovers the file.
//     #51 malformed cache entries — an entry whose vector is not an array of
//         finite numbers, whose length ≠ its key's dimension, or whose fields
//         are missing/wrong-typed is DROPPED (treated as a miss), never
//         thrown; well-formed sibling entries still load.
//
//   Pinned log strings (§5.13): `vector cache: load failed (treating as
//   empty): <error>` · `vector cache: write failed (non-fatal): <error>` ·
//   `vector cache: pruned to N entries` (the promotion prune, after the
//   drain, the file rewritten ONCE).
//
// QUESTION (spec-untestable-as-written at this seam — reported to the
// supervisor, NOT invented):
//   1. §5.13 `prune(keepKeys: Set<string>)` — the ELEMENT FORMAT of the
//      keepKeys strings is unpinned (a contentHash? a serialized key tuple?
//      some `kind|model|dimension|hash` form?). The controller builds the
//      keep set and the cache consumes it, so the ONLY spec-derivable test is
//      through the BOOT PATH (test 9a below), where the observable is the
//      pruned FILE + the pinned log. A DIRECT prune() unit test cannot be
//      written without inventing the string format. If a direct-seam test is
//      wanted, the SpecWriter must pin the element format first.
//   2. §5.13 `opts.path` DEFAULT (`join(app.getPath('userData'),
//      'provident-vector-cache.json')`) — `app.getPath` is Electron; the
//      §5.12 module-seam note excludes main.ts/Electron wiring from the
//      node-testable seam (the same limitation as the W1 #38 QUESTION in
//      tests/vector-boot.test.ts). Only `opts.path` is tested here.
//   3. §5.9 #49 "an absent/unreadable file … + logged" is tested LITERALLY:
//      the ABSENT-file case also logs `vector cache: load failed (treating as
//      empty)` (the brief + §5.9 #49 group absent with the corrupt cases under
//      "+ logged"). If the Architect intends a silent first boot (absent file
//      = the normal cold start), test 2a's log assertion is the row to amend.
//   4. §5.9 #50's fail-state needs "a cache whose write fails". A
//      chmod-unwritable directory is user-dependent (root ignores file
//      modes), so the deterministic constructors used here are (a) a cache
//      path whose PARENT DIRECTORY DOES NOT EXIST (every write of the atomic
//      temp file fails) and (b) a DIRECTORY created AT the cache path after
//      load (the temp+rename target is invalid). Both construct the pinned
//      observable (the write-failed log + a continuing promotion) without
//      depending on the invoking user.
// ============================================================================
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  renameSync,
  mkdirSync,
  chmodSync,
  symlinkSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  createVectorCache,
  type CacheKey,
  type VectorCache,
} from '../src/main/vector-cache.js'
// The namespace form (NOT a named import) for the F1 debounce-constant pin:
// a namespace access degrades to `undefined` when the export is missing, so
// the pre-fix red run fails the ASSERTION instead of failing the module load
// (which would take the existing 27 greens down with it).
import * as vectorCacheModule from '../src/main/vector-cache.js'
import { createVectorBootController } from '../src/main/vector-boot.js'
import { createEmbeddingProvider, type EmbeddingProvider } from '../src/main/embeddings.js'
import { createJsonRagStore, type RagNode } from '../src/main/rag-store.js'

// RCA-3 F1 — the write-observability seam: node:fs is mocked FILE-WIDE with
// PASS-THROUGH SPIES (each delegating to the real implementation), so the
// coalescing pin (exactly ONE writeFileSync + ONE renameSync per trailing
// whole-map write) is countable without changing any behavior. Every other
// test in this file keeps its exact semantics — its reads/writes flow through
// the delegating spies.
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    writeFileSync: vi.fn(actual.writeFileSync),
    renameSync: vi.fn(actual.renameSync),
  }
})

// ---------------------------------------------------------------------------
// helpers (the tests/embeddings.test.ts + tests/vector-boot.test.ts idioms)
// ---------------------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-vector-cache-'))
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

function writeRawFile(path: string, text: string): void {
  writeFileSync(path, text, 'utf8')
}

function readCacheFile(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

/** Capture every console line regardless of stream (the spec pins the LOG
 *  strings, not which console method carries them — the vector-boot idiom). */
function captureConsole(): { lines: string[] } {
  const lines: string[] = []
  for (const m of ['log', 'info', 'warn', 'error'] as const) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      lines.push(args.map((a) => String(a)).join(' '))
    })
  }
  return { lines }
}

function logHas(lines: string[], needle: string): boolean {
  return lines.some((l) => l.includes(needle))
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

const KEY: CacheKey = {
  kind: 'ollama',
  model: 'embeddinggemma',
  dimension: 4,
  contentHash: sha256Hex('seed-text'),
}

/** The provider DOUBLE for the boot-path tests (the §5.12 seam injects the
 *  provider — no HTTP). Sequential per-item embed only; records every text. */
function makeProviderDouble(dim = 4): EmbeddingProvider & { embedTexts: string[] } {
  const embedTexts: string[] = []
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: dim,
    embedTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      return textEmbedding(text, dim)
    },
  }
}

/** A batch-capable provider DOUBLE: records batch calls, can reject (the W2
 *  per-chunk fallback trigger) and can serve per-text query-time vectors
 *  (the post-promotion engine queries embed the QUERY through provider.embed,
 *  so a controlled query vector makes the promoted index's node→vector
 *  assignment observable through the ranked order). */
function makeBatchProviderDouble(opts: {
  batchVector?: number[]
  embedVectors?: Record<string, number[]>
  rejectBatch?: Error
} = {}): EmbeddingProvider & { embedTexts: string[]; batchTexts: string[][] } {
  const embedTexts: string[] = []
  const batchTexts: string[][] = []
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedTexts,
    batchTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      return opts.embedVectors?.[text] ?? textEmbedding(text)
    },
    async embedBatch(texts: string[]): Promise<number[][]> {
      batchTexts.push([...texts])
      if (opts.rejectBatch) throw opts.rejectBatch
      return texts.map(() => [...(opts.batchVector ?? textEmbedding('batch'))])
    },
  }
}

/** POSIX permission bits only bite for a non-root user on a POSIX fs. */
const POSIX_PERMS_APPLY =
  process.platform !== 'win32' &&
  typeof (process as unknown as { getuid?: () => number }).getuid === 'function' &&
  (process as unknown as { getuid: () => number }).getuid() !== 0

/** mkfifo exists on POSIX (coreutils); Node has no FIFO-creation API. */
const MKFIFO_APPLY =
  process.platform !== 'win32' &&
  (() => {
    try {
      execFileSync('mkfifo', ['--version'], { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  })()

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// the suite
// ---------------------------------------------------------------------------

describe('Unit F / W4 — the persisted embedding cache (unit-f-embeddings.md §5.13 + §5.8 #40–42 + §5.9 #49–51 + §5.12)', () => {
  it('RED — the vector-cache module is not exported yet (src/main/vector-cache.ts does not exist)', () => {
    expect(typeof createVectorCache).toBe('function')
  })

  // =========================================================================
  // §5.13 LOAD — the pinned file format, read SYNCHRONOUSLY at creation
  // =========================================================================

  describe('§5.13 createVectorCache: load (the pinned format, synchronous at creation)', () => {
    it('1a. a well-formed file → get() returns the cached vector for the matching key (no throw)', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const vector = [0.25, 0.5, -0.75, 1]
        writeCacheFile(path, [
          seedEntry({ contentHash: sha256Hex('hello world'), vector, savedAt: 1700000000123 }),
        ])
        const cache = createVectorCache({ path })
        const hit = cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('hello world') })
        expect(hit).toEqual(vector)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('1b. the FILE is read SYNCHRONOUSLY at createVectorCache call time (§5.13 load ownership: the cache is fully loaded before the background build starts)', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const vector = [1, 2, 3, 4]
        writeCacheFile(path, [seedEntry({ contentHash: sha256Hex('exact text'), vector })])
        const cache = createVectorCache({ path })
        // the file is deleted AFTER creation — the load already happened
        rmSync(path)
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('exact text') })).toEqual(vector)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.9 #49 — LOAD FAIL-STATES: EMPTY cache + pinned log, NEVER a throw
  // =========================================================================

  describe('§5.9 #49 load fail-states (empty + logged, never a throw)', () => {
    it('2a. an ABSENT file → an empty cache + the pinned load-failed log (the load never throws)', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir) // never written
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('2b. INVALID JSON → an empty cache + the pinned load-failed log (never a throw)', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        writeRawFile(path, '{ this is not json')
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('2c. a NON-OBJECT root (a JSON string / null) → an empty cache + the pinned load-failed log (never a throw)', () => {
      const dir = freshDir()
      try {
        for (const raw of ['"hello"', 'null']) {
          const path = cachePathIn(dir)
          writeRawFile(path, raw)
          const console_ = captureConsole()
          let cache: VectorCache | undefined
          expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
          expect(cache!.get(KEY)).toBeUndefined()
          expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
        }
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('2d. a WRONG version (2) / an ABSENT version → an empty cache + the pinned load-failed log (never a throw)', () => {
      const dir = freshDir()
      try {
        // wrong version
        const wrong = cachePathIn(dir)
        writeCacheFile(wrong, [seedEntry()], 2)
        const consoleWrong = captureConsole()
        let c1: VectorCache | undefined
        expect(() => { c1 = createVectorCache({ path: wrong }) }).not.toThrow()
        expect(c1!.get(KEY)).toBeUndefined()
        expect(logHas(consoleWrong.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
        // absent version
        const absent = join(dir, 'absent-version.json')
        writeFileSync(absent, JSON.stringify({ entries: [seedEntry()] }), 'utf8')
        const consoleAbsent = captureConsole()
        let c2: VectorCache | undefined
        expect(() => { c2 = createVectorCache({ path: absent }) }).not.toThrow()
        expect(c2!.get(KEY)).toBeUndefined()
        expect(logHas(consoleAbsent.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('2e. an UNREADABLE file (permission-denied) → an empty cache + the pinned load-failed log (never a throw)', { skip: !POSIX_PERMS_APPLY }, () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        writeCacheFile(path, [seedEntry()])
        chmodSync(path, 0o000)
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
        chmodSync(path, 0o644) // restore so the tmpdir cleanup can unlink
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.9 #51 — MALFORMED-ENTRY DROP RULE (dropped = a miss, never thrown)
  // =========================================================================

  describe('§5.9 #51 malformed-entry drop rule', () => {
    it('3a. a vector that is not an array of finite numbers (a string element / a null element / a non-array vector) → the entry DROPPED, the good sibling loaded', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const hString = sha256Hex('entry-string-element')
        const hNull = sha256Hex('entry-null-element')
        const hNotArray = sha256Hex('entry-not-an-array')
        const hGood = sha256Hex('entry-good')
        writeCacheFile(path, [
          seedEntry({ contentHash: hString, vector: [1, 'not-a-number', 3, 4] }),
          seedEntry({ contentHash: hNull, vector: [1, null, 3, 4] }),
          seedEntry({ contentHash: hNotArray, vector: 'not-an-array' as unknown as number[] }),
          seedEntry({ contentHash: hGood, vector: [7, 7, 7, 7] }),
        ])
        const cache = createVectorCache({ path })
        const keyOf = (h: string): CacheKey => ({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h })
        expect(cache.get(keyOf(hString))).toBeUndefined()
        expect(cache.get(keyOf(hNull))).toBeUndefined()
        expect(cache.get(keyOf(hNotArray))).toBeUndefined()
        expect(cache.get(keyOf(hGood))).toEqual([7, 7, 7, 7])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('3b. a vector whose length ≠ its dimension → the entry DROPPED (treated as a miss), the good sibling loaded', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const hShort = sha256Hex('entry-short-vector')
        const hGood = sha256Hex('entry-good-2')
        writeCacheFile(path, [
          seedEntry({ contentHash: hShort, dimension: 4, vector: [1, 2, 3] }), // length 3 ≠ dimension 4
          seedEntry({ contentHash: hGood, dimension: 4, vector: [1, 2, 3, 4] }),
        ])
        const cache = createVectorCache({ path })
        const keyOf = (h: string): CacheKey => ({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h })
        expect(cache.get(keyOf(hShort))).toBeUndefined()
        expect(cache.get(keyOf(hGood))).toEqual([1, 2, 3, 4])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('3c. entries with MISSING / WRONG-TYPED fields → dropped; the well-formed sibling still loads', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const hKind = sha256Hex('bad-kind')
        const hDim = sha256Hex('bad-dimension')
        const hHash = sha256Hex('missing-content-hash')
        const hModel = sha256Hex('bad-model')
        const hGood = sha256Hex('good-entry')
        writeCacheFile(path, [
          seedEntry({ contentHash: hKind, kind: 123 as unknown as string }), // non-string kind
          seedEntry({ contentHash: hDim, dimension: '4' as unknown as number }), // non-number dimension
          { ...seedEntry({ contentHash: hHash }), contentHash: undefined }, // missing contentHash
          seedEntry({ contentHash: hModel, model: 42 as unknown as string }), // non-string model
          seedEntry({ contentHash: hGood, vector: [3, 1, 4, 1] }),
        ])
        const cache = createVectorCache({ path })
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: hKind })).toBeUndefined()
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: hDim })).toBeUndefined()
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: hHash })).toBeUndefined()
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: hModel })).toBeUndefined()
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: hGood })).toEqual([3, 1, 4, 1])
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.13 KEY TUPLE — hit / miss (the invalidation rules)
  // =========================================================================

  describe('§5.13 key tuple: an exact tuple HITs; any tuple-field change is a MISS', () => {
    const VECTOR = [0.5, -0.5, 0.25, 0.125]
    const HASH = sha256Hex('the exact embedded text')

    function seededCache(path: string): VectorCache {
      writeCacheFile(path, [
        seedEntry({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: HASH, vector: VECTOR }),
      ])
      return createVectorCache({ path })
    }

    it('4a. an exact key tuple (kind, model, dimension, contentHash) → the cached vector', () => {
      const dir = freshDir()
      try {
        const cache = seededCache(cachePathIn(dir))
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: HASH })).toEqual(VECTOR)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('4b. a CHANGED contentHash (the content changed) → undefined (MISS → re-embed)', () => {
      const dir = freshDir()
      try {
        const cache = seededCache(cachePathIn(dir))
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('the CHANGED text') })).toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('4c. a CHANGED model → undefined (MISS → re-embed)', () => {
      const dir = freshDir()
      try {
        const cache = seededCache(cachePathIn(dir))
        expect(cache.get({ kind: 'ollama', model: 'some-other-model', dimension: 4, contentHash: HASH })).toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('4d. a CHANGED dimension → undefined (MISS → re-embed)', () => {
      const dir = freshDir()
      try {
        const cache = seededCache(cachePathIn(dir))
        expect(cache.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 768, contentHash: HASH })).toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('4e. a CHANGED provider kind → undefined (MISS → re-embed)', () => {
      const dir = freshDir()
      try {
        const cache = seededCache(cachePathIn(dir))
        expect(cache.get({ kind: 'openai', model: 'embeddinggemma', dimension: 4, contentHash: HASH })).toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.13 WRITE-THROUGH + flush() — the single-writer queue
  // =========================================================================

  describe('§5.13 write-through + flush (the single-writer queue)', () => {
    it('10a. set() ×2 then flush() → the file reflects EVERY set in the pinned format {version:1, entries:[{kind, model, dimension, contentHash, vector, savedAt}]}', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const cache = createVectorCache({ path })
        const h1 = sha256Hex('first text')
        const h2 = sha256Hex('second text')
        cache.set({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h1 }, [1, 1, 1, 1])
        cache.set({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h2 }, [2, 2, 2, 2])
        await cache.flush()
        const disk = readCacheFile(path)
        expect(disk.version).toBe(1)
        expect(Array.isArray(disk.entries)).toBe(true)
        const e1 = disk.entries.find((e: any) => e.contentHash === h1)
        const e2 = disk.entries.find((e: any) => e.contentHash === h2)
        expect(e1).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h1, vector: [1, 1, 1, 1] })
        expect(e2).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h2, vector: [2, 2, 2, 2] })
        expect(typeof e1.savedAt).toBe('number')
        expect(typeof e2.savedAt).toBe('number')
        // and the round trip: a NEW cache over the same file gets the entries
        const reloaded = createVectorCache({ path })
        expect(reloaded.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h1 })).toEqual([1, 1, 1, 1])
        expect(reloaded.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h2 })).toEqual([2, 2, 2, 2])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('10b. a set() of an ALREADY-CACHED key OVERWRITES on write-through (§5.13: "the new entry overwrites on write-through")', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const cache = createVectorCache({ path })
        const key: CacheKey = { kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('same text') }
        cache.set(key, [1, 1, 1, 1])
        cache.set(key, [9, 9, 9, 9]) // the re-embed after an invalidation
        await cache.flush()
        const disk = readCacheFile(path)
        const matching = disk.entries.filter((e: any) => e.contentHash === key.contentHash)
        expect(matching).toHaveLength(1)
        expect(matching[0].vector).toEqual([9, 9, 9, 9])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('10c. flush() with NOTHING pending resolves; flush() twice resolves', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const cache = createVectorCache({ path })
        await expect(cache.flush()).resolves.toBeUndefined()
        await expect(cache.flush()).resolves.toBeUndefined()
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #40/#41 — THE MEMOIZING WRAPPER THROUGH THE BOOT PATH
  // (createVectorBootController(ragStore, provider, { cache: createVectorCache() }))
  // =========================================================================

  describe('§5.8 #40/#41 the memoizing wrapper through the boot path (W4 wiring)', () => {
    it('5a. a PRE-SEEDED node adopts the cached vector with NO HTTP call (the fetch stub observes zero calls for it) and report.cacheHits ≥ 1', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const ALPHA = 'alpha-content'
        const cachedAlpha = [0, 1, 0, 0] // DISTINCTIVE — the stub would never return this
        writeCacheFile(path, [seedEntry({ contentHash: sha256Hex(ALPHA), vector: cachedAlpha })])
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('node-a', { content: ALPHA }))
        store.putNode(makeNode('node-b', { content: 'beta-content' })) // the MISS
        // the REAL ollama provider (dimension pinned to 4) over a stubbed
        // fetch — every embed would return [1,0,0,0]
        const calls = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ embeddings: [[1, 0, 0, 0]] }) }))
        const provider = createEmbeddingProvider({
          provider: 'ollama',
          baseUrl: 'http://127.0.0.1:11434',
          model: 'embeddinggemma',
          dimension: 4,
        })
        // the W4 wiring pin: the cache is constructed AT controller creation
        const cache = createVectorCache({ path })
        const boot = createVectorBootController(store, provider, { cache })
        const report = await boot.start()
        expect(boot.phase()).toBe('promoted')
        // §5.8 #40: the hit node made NO HTTP call — zero fetch calls carry
        // its text (single OR batch)
        expect(calls.length).toBeGreaterThanOrEqual(1) // the miss node DID embed
        expect(calls.some((c) => callTexts(c).includes(ALPHA))).toBe(false)
        // §5.12 census: exactly one node was adopted from the cache, the
        // other embedded
        expect(report.cacheHits).toBeGreaterThanOrEqual(1)
        expect(report.embedded).toBe(1)
        // §5.13 write-through (brief: read the file after flush) — the miss
        // node's entry is persisted
        await cache.flush()
        const disk = readCacheFile(path)
        const betaEntry = disk.entries.find((e: any) => e.contentHash === sha256Hex('beta-content'))
        expect(betaEntry).toBeDefined()
        expect(betaEntry).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4 })
        expect(betaEntry.vector).toEqual([1, 0, 0, 0]) // what the stub returned
        // ADOPTION of the cached vector: post-promotion, a query embedding of
        // [1,0,0,0] (the stub's answer for everything) must score node-b
        // (cos 1) and OMIT node-a — whose index vector is the CACHED
        // [0,1,0,0] (cos 0). Had node-a been re-embedded, its vector would be
        // the stub's [1,0,0,0] and it would appear in ranked.
        const r = await boot.engine.query('q', { k: 10 })
        expect(r.ranked.map((s: { nodeId: string }) => s.nodeId)).toEqual(['node-b'])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('5b. a MISS node embeds through the provider AND the entry is persisted (read the file after flush → the new entry exists)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('solo', { content: 'only-node-text' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider, { cache: createVectorCache({ path }) })
        const report = await boot.start()
        expect(report.embedded).toBe(1) // the miss was embedded
        expect(report.cacheHits).toBe(0) // nothing was seeded
        const disk = readCacheFile(path)
        const entry = disk.entries.find((e: any) => e.contentHash === sha256Hex('only-node-text'))
        expect(entry).toBeDefined()
        expect(entry).toMatchObject({
          kind: 'ollama',
          model: 'embeddinggemma',
          dimension: 4,
          contentHash: sha256Hex('only-node-text'),
          vector: textEmbedding('only-node-text'),
        })
        expect(typeof entry.savedAt).toBe('number')
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.13 WRITE-THROUGH TIMING — the queue is DRAINED before the promotion
  // report resolves
  // =========================================================================

  describe('§5.13 write-through timing: drained before the promotion report resolves', () => {
    it('6a. after start() resolves, the file ALREADY reflects every set (no explicit flush by the caller)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('n1', { content: 'first content' }))
        store.putNode(makeNode('n2', { content: 'second content' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider, { cache: createVectorCache({ path }) })
        await boot.start() // resolves ⇒ the queue was drained
        // NO flush() call here — the drain-before-report pin
        const disk = readCacheFile(path)
        expect(disk.version).toBe(1)
        const hashes = disk.entries.map((e: any) => e.contentHash)
        expect(hashes).toContain(sha256Hex('first content'))
        expect(hashes).toContain(sha256Hex('second content'))
        for (const e of disk.entries) {
          expect(e).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4 })
          expect(typeof e.savedAt).toBe('number')
          expect(Array.isArray(e.vector)).toBe(true)
        }
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.13 THE BATCH WRAPPER — positional alignment + the W2 fallback route
  // =========================================================================

  describe('§5.13 the batch wrapper (positional alignment; the W2 per-item fallback routes through the SAME wrapper)', () => {
    it('7a. a batch of [hit, miss, hit] → ONE batch call containing ONLY the miss; hits adopted in place; positional alignment preserved (assembled length === texts.length)', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const ALPHA = 'alpha-content'
        const BETA = 'beta-content'
        const GAMMA = 'gamma-content'
        // distinctive cached vectors: alpha → [1,0,0,0], gamma → [0,1,0,0]
        writeCacheFile(path, [
          seedEntry({ contentHash: sha256Hex(ALPHA), vector: [1, 0, 0, 0] }),
          seedEntry({ contentHash: sha256Hex(GAMMA), vector: [0, 1, 0, 0] }),
        ])
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('node-a', { content: ALPHA }))
        store.putNode(makeNode('node-b', { content: BETA }))
        store.putNode(makeNode('node-c', { content: GAMMA }))
        // every BATCH-embedded text gets [0,0,0,1]; the query-time embeds are
        // controlled per query text
        const provider = makeBatchProviderDouble({
          batchVector: [0, 0, 0, 1],
          embedVectors: { q1: [2, 1, 0, 0], q2: [0, 0, 0, 1] },
        })
        const boot = createVectorBootController(store, provider, {
          cache: createVectorCache({ path }),
          embedBatchFn: provider.embedBatch.bind(provider),
        })
        const report = await boot.start()
        // census: two hits, one miss
        expect(report.cacheHits).toBe(2)
        expect(report.embedded).toBe(1)
        // hits adopted IN PLACE: no per-item embed call happened at all, and
        // ONE batch call carrying ONLY the miss text
        expect(provider.embedTexts).toEqual([])
        expect(provider.batchTexts).toEqual([[BETA]])
        // positional alignment: the promoted index must hold the CACHED
        // vector for node-a and node-c and the BATCH vector for node-b.
        // q1 → [2,1,0,0]: alpha ≈ 0.894, gamma ≈ 0.447, beta = 0 (omitted) —
        // a shifted/misaligned assembly would not rank [a, c] in that order.
        const r1 = await boot.engine.query('q1', { k: 10 })
        expect(r1.ranked.map((s: { nodeId: string }) => s.nodeId)).toEqual(['node-a', 'node-c'])
        // q2 → [0,0,0,1]: only beta (the miss, at its own position) scores —
        // a short/shifted assembly would drop node-b from the index entirely.
        const r2 = await boot.engine.query('q2', { k: 10 })
        expect(r2.ranked.map((s: { nodeId: string }) => s.nodeId)).toEqual(['node-b'])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('7b. the W2 per-item fallback routes through the SAME wrapper: a rejected batch → hits STILL adopted (no re-embed) + the fallback-embedded miss write-through', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const ALPHA = 'alpha-content'
        const BETA = 'beta-content'
        const GAMMA = 'gamma-content'
        writeCacheFile(path, [
          seedEntry({ contentHash: sha256Hex(ALPHA), vector: [1, 0, 0, 0] }),
          seedEntry({ contentHash: sha256Hex(GAMMA), vector: [0, 1, 0, 0] }),
        ])
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('node-a', { content: ALPHA }))
        store.putNode(makeNode('node-b', { content: BETA }))
        store.putNode(makeNode('node-c', { content: GAMMA }))
        // the batch REJECTS → createVectorIndex falls back per-item for that
        // chunk's texts — THROUGH THE WRAPPER: alpha/gamma are cache hits
        // (adopted, NO provider.embed call), beta embeds per-item
        const provider = makeBatchProviderDouble({ rejectBatch: new Error('batch exploded') })
        const boot = createVectorBootController(store, provider, {
          cache: createVectorCache({ path }),
          embedBatchFn: provider.embedBatch.bind(provider),
        })
        const report = await boot.start()
        // the hits were STILL adopted through the wrapper on the fallback
        // path (a raw-provider fallback would re-embed all three)
        expect(report.cacheHits).toBe(2)
        expect(report.embedded).toBe(1)
        expect(provider.embedTexts).toEqual([BETA])
        expect(provider.batchTexts.length).toBe(1) // the rejected attempt
        // the fallback-embedded text is a cache WRITE-THROUGH like any other
        // embed — the entry is persisted (drained before the report resolved)
        const disk = readCacheFile(path)
        const betaEntry = disk.entries.find((e: any) => e.contentHash === sha256Hex(BETA))
        expect(betaEntry).toBeDefined()
        expect(betaEntry.vector).toEqual(textEmbedding(BETA))
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.9 #50 — WRITE FAILURE IS NON-FATAL
  // =========================================================================

  describe('§5.9 #50 write failure (non-fatal)', () => {
    it('8a. direct: a failing write logs the PINNED non-fatal string, flush() still resolves, and the next successful write recovers the file', async () => {
      const dir = freshDir()
      try {
        // the parent directory does not exist → the atomic temp write can
        // never succeed (deterministic; see the QUESTION block note 4)
        const path = join(dir, 'nope', 'provident-vector-cache.json')
        const console_ = captureConsole()
        const cache = createVectorCache({ path })
        const k1: CacheKey = { kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('first text') }
        cache.set(k1, [1, 2, 3, 4])
        // the write fails → NON-FATAL: logged, flush() RESOLVES (never throws)
        await expect(cache.flush()).resolves.toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: write failed (non-fatal)')).toBe(true)
        // "the next successful write recovers the file" — create the parent,
        // write again, the file reflects the cache
        mkdirSync(join(dir, 'nope'))
        const k2: CacheKey = { kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('second text') }
        cache.set(k2, [5, 6, 7, 8])
        await cache.flush()
        const disk = readCacheFile(path)
        const e2 = disk.entries.find((e: any) => e.contentHash === k2.contentHash)
        expect(e2).toBeDefined()
        expect(e2.vector).toEqual([5, 6, 7, 8])
        // the earlier entry is still in the in-memory cache, and every write
        // serializes the WHOLE cache (the module-store idiom), so it is
        // recovered too
        const e1 = disk.entries.find((e: any) => e.contentHash === k1.contentHash)
        expect(e1).toBeDefined()
        expect(e1.vector).toEqual([1, 2, 3, 4])
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('8b. boot path: a failing cache write is NON-FATAL — the pinned log fires and the build + promotion CONTINUE', async () => {
      const dir = freshDir()
      try {
        const path = join(dir, 'missing-dir', 'provident-vector-cache.json')
        const console_ = captureConsole()
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('n1', { content: 'first content' }))
        store.putNode(makeNode('n2', { content: 'second content' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider, { cache: createVectorCache({ path }) })
        // the promotion CONTINUES despite every write failing
        const report = await boot.start()
        expect(boot.phase()).toBe('promoted')
        expect(report.embedded).toBe(2)
        expect(logHas(console_.lines, 'vector cache: write failed (non-fatal)')).toBe(true)
        // the in-memory index still works post-promotion: the node is scored
        // by its own (freshly embedded) vector
        const r = await boot.engine.query('first content', { k: 10 })
        expect(r.ranked[0]?.nodeId).toBe('n1')
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // §5.8 #42 — PRUNE AT PROMOTION (compaction bounded by the live corpus)
  // =========================================================================

  describe('§5.8 #42 prune at promotion', () => {
    it('9a. foreign-tuple entries + hashes matching no live node are dropped; the survivors are intact; the file is rewritten ONCE after the drain; the pinned `vector cache: pruned to N entries` log fires', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const ALPHA = 'alpha-content'
        const BETA = 'beta-content'
        const liveA: CacheSeed = seedEntry({ contentHash: sha256Hex(ALPHA), vector: [1, 1, 0, 0], savedAt: 1700000000001 })
        const liveB: CacheSeed = seedEntry({ contentHash: sha256Hex(BETA), vector: [0, 1, 1, 0], savedAt: 1700000000002 })
        const foreignTuple: CacheSeed = seedEntry({
          kind: 'openai',
          model: 'text-embedding-3-small',
          contentHash: sha256Hex(ALPHA), // even a LIVE hash — the tuple is foreign
          vector: [9, 9, 9, 9],
          savedAt: 1700000000003,
        })
        const deadHash: CacheSeed = seedEntry({
          contentHash: sha256Hex('a text no store node has'),
          vector: [8, 8, 8, 8],
          savedAt: 1700000000004,
        })
        writeCacheFile(path, [liveA, liveB, foreignTuple, deadHash])
        const console_ = captureConsole()
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('node-a', { content: ALPHA }))
        store.putNode(makeNode('node-b', { content: BETA }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider, { cache: createVectorCache({ path }) })
        const report = await boot.start()
        expect(report.cacheHits).toBe(2) // both live entries were adopted
        // the pinned log, with the FINAL count, exactly once (one prune pass →
        // the file rewritten ONCE after the drain)
        const prunedLogs = console_.lines.filter((l) => l.includes('vector cache: pruned to'))
        expect(prunedLogs).toHaveLength(1)
        expect(prunedLogs[0]).toContain('vector cache: pruned to 2 entries')
        // the file holds EXACTLY the survivors, intact
        const disk = readCacheFile(path)
        expect(disk.version).toBe(1)
        expect(disk.entries).toHaveLength(2)
        const byHash = new Map<string, any>(disk.entries.map((e: any) => [e.contentHash, e]))
        const keptA = byHash.get(sha256Hex(ALPHA))
        const keptB = byHash.get(sha256Hex(BETA))
        expect(keptA).toBeDefined()
        expect(keptB).toBeDefined()
        expect(keptA).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, vector: [1, 1, 0, 0], savedAt: 1700000000001 })
        expect(keptB).toMatchObject({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, vector: [0, 1, 1, 0], savedAt: 1700000000002 })
        expect(byHash.get(sha256Hex('a text no store node has'))).toBeUndefined()
        // no foreign-tuple entry survived
        expect(disk.entries.some((e: any) => e.kind === 'openai')).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })

  // =========================================================================
  // RCA-3 ADVERSARIAL REGRESSIONS (findings F1/F3/F4/F6) — the coalescing
  // write queue, the sanitized load-failed log, the special-file guards, and
  // the directory-at-path cases. RED-FIRST set: R1–R4 + R7 (R5/R6 pin F6
  // coverage that already held; the F4 FIFO case is added with the fix — its
  // pre-fix red is the WEDGE itself, unrunnable without losing the report).
  // =========================================================================

  describe('RCA-3 adversarial regressions (F1 coalescing / F3 log hygiene / F4 special files / F6 directories)', () => {
    it('R1. F1 COALESCING: 25 synchronous set()s + flush() → exactly ONE writeFileSync + ONE renameSync (one trailing whole-map write), the file reflecting ALL 25 entries', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        captureConsole() // silence the pinned absent-file load log
        vi.mocked(writeFileSync).mockClear()
        vi.mocked(renameSync).mockClear()
        const cache = createVectorCache({ path })
        const hashes: string[] = []
        for (let i = 0; i < 25; i++) {
          const h = sha256Hex(`coalesced text ${i}`)
          hashes.push(h)
          cache.set({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: h }, [i, i, i, i])
        }
        await cache.flush()
        // the COALESCING pin: N sets → ONE trailing write, not N writes
        expect(vi.mocked(writeFileSync).mock.calls).toHaveLength(1)
        expect(vi.mocked(renameSync).mock.calls).toHaveLength(1)
        // and the ONE write serializes the WHOLE map at execution time —
        // every one of the 25 entries is on disk
        const disk = readCacheFile(path)
        expect(disk.version).toBe(1)
        for (let i = 0; i < 25; i++) {
          const e = disk.entries.find((x: any) => x.contentHash === hashes[i])
          expect(e).toBeDefined()
          expect(e.vector).toEqual([i, i, i, i])
        }
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R2. F1 PIN: CACHE_WRITE_DEBOUNCE_MS is exported from src/main/vector-cache.ts and pinned to 500', () => {
      expect(
        (vectorCacheModule as { CACHE_WRITE_DEBOUNCE_MS?: unknown }).CACHE_WRITE_DEBOUNCE_MS,
      ).toBe(500)
    })

    it('R3. F3 LOG HYGIENE: the load-failed log SANITIZES the V8 quoted source snippet — a marker string in quotes in the corrupt body never reaches the log', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        // invalid JSON whose "Unexpected token" error QUOTES ~13 chars of the
        // file head inside double quotes — the quoted span carries the
        // attacker-chosen marker "LEAK" (verified against V8's snippet shape)
        writeRawFile(path, '{"version":1,"entries":[{"v":"LEAK","w":BAD}]}')
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
        // the SANITIZATION pin: the quoted marker is stripped before logging
        // (the pinned prefix itself is unchanged)
        expect(console_.lines.some((l) => l.includes('LEAK'))).toBe(false)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R4. F4 SPECIAL FILE AT PATH (load): a SYMLINK at the cache path is NOT read through — the pinned load-failed log + an EMPTY cache (lstat guard, no read)', () => {
      const dir = freshDir()
      try {
        const target = join(dir, 'target.json')
        writeCacheFile(target, [seedEntry({ contentHash: sha256Hex('link-target-text'), vector: [1, 2, 3, 4] })])
        const path = join(dir, 'link.json')
        symlinkSync(target, path)
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        // the link target's entry MUST NOT load — the link is never followed
        expect(cache!.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: sha256Hex('link-target-text') })).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R5. F6a DIRECTORY AT PATH (load): a directory created AT the cache path before creation → the pinned load-failed log + an EMPTY cache, never a throw', () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        mkdirSync(path) // a directory AT the cache path
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R6. F6b DIRECTORY AT PATH (write): a directory created AT the cache path after creation → set + flush → the pinned write-failed log, flush() RESOLVES, and the promotion path is unaffected', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const console_ = captureConsole()
        const cache = createVectorCache({ path }) // absent at creation
        mkdirSync(path) // a directory AT the cache path AFTER creation
        cache.set(KEY, [1, 2, 3, 4])
        await expect(cache.flush()).resolves.toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: write failed (non-fatal)')).toBe(true)
        // the promotion path is unaffected: a full boot over the SAME (now a
        // directory) path still promotes with every write failing non-fatally
        const store = createJsonRagStore({ path: join(dir, 'rag.json') })
        store.putNode(makeNode('n1', { content: 'first content' }))
        const provider = makeProviderDouble()
        const boot = createVectorBootController(store, provider, { cache: createVectorCache({ path }) })
        const report = await boot.start()
        expect(boot.phase()).toBe('promoted')
        expect(report.embedded).toBe(1)
        const r = await boot.engine.query('first content', { k: 10 })
        expect(r.ranked[0]?.nodeId).toBe('n1')
      } finally {
        rmSyncSafe(dir)
      }
    })

    it('R7. F4 SPECIAL FILE AT TMP (write): a SYMLINK at the tmp path is NOT written through — the pinned write-failed log, the link target untouched', async () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        const victim = join(dir, 'victim.txt')
        writeRawFile(victim, 'do-not-touch')
        symlinkSync(victim, `${path}.tmp`) // a symlink AT the tmp path
        const console_ = captureConsole()
        const cache = createVectorCache({ path })
        cache.set(KEY, [1, 2, 3, 4])
        await expect(cache.flush()).resolves.toBeUndefined()
        // pre-fix the temp write goes THROUGH the link (the victim is
        // clobbered with cache JSON); the guard pins the non-fatal skip
        expect(logHas(console_.lines, 'vector cache: write failed (non-fatal)')).toBe(true)
        expect(readFileSync(victim, 'utf8')).toBe('do-not-touch')
      } finally {
        rmSyncSafe(dir)
      }
    })

    // RED NOTE (RCA-1 deviation, probe-evidenced): R8 was NOT runnable pre-fix
    // — the F4 bug IS the wedge (readFileSync OPENs the FIFO and blocks the
    // worker synchronously; a probe run with the unfixed module wedged the
    // vitest run past a 90s kill, producing no report at all), so its red is
    // the hang itself. It is added with the fix and runs green in ~1 ms.
    it('R8. F4 SPECIAL FILE AT PATH (load): a FIFO at the cache path NEVER HANGS the loader — the pinned load-failed log + an EMPTY cache (lstat guard, the FIFO is never opened)', { timeout: 2000, skip: !MKFIFO_APPLY }, () => {
      const dir = freshDir()
      try {
        const path = cachePathIn(dir)
        execFileSync('mkfifo', [path])
        const console_ = captureConsole()
        let cache: VectorCache | undefined
        expect(() => { cache = createVectorCache({ path }) }).not.toThrow()
        expect(cache!.get(KEY)).toBeUndefined()
        expect(logHas(console_.lines, 'vector cache: load failed (treating as empty)')).toBe(true)
      } finally {
        rmSyncSafe(dir)
      }
    })
  })
})