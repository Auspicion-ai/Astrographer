// src/main/vector-cache.ts — Unit F / W4: the persisted embedding cache
// (docs/specs/unit-f-embeddings.md §5.13 — the cache-inclusive variant;
// §5.9 #49–51). Pure + injectable module seam: NO Electron import — the
// default path resolves through the RUNNING Electron app (the module-store
// idiom: same userData directory, atomic temp+rename write, one main-process
// writer) and falls outside Electron it throws a clear error; every
// node-testable caller supplies opts.path explicitly.
//
// - The file is read SYNCHRONOUSLY at creation (§5.13 load ownership: the
//   cache is fully loaded before the background build starts).
// - ANY load failure — an ABSENT file, an unreadable file, invalid JSON, a
//   non-object root, a wrong/absent version (§5.9 #49, which groups the
//   absent first-run file with the corrupt cases under "+ logged") — leaves
//   an EMPTY in-memory cache + the pinned log
//   `vector cache: load failed (treating as empty): <error>`; the load
//   NEVER throws and boot NEVER crashes on the cache.
// - Malformed entries (§5.9 #51) are DROPPED at load (treated as a miss,
//   never thrown); well-formed siblings still load.
// - set() is WRITE-THROUGH on a COALESCING single-writer queue (RCA-3 F1):
//   it mutates the in-memory map, marks a dirty flag, and schedules AT MOST
//   ONE trailing write — a CACHE_WRITE_DEBOUNCE_MS debounce timer whose
//   pending write executes with the map state AT EXECUTION TIME (later sets
//   need no new job), so a whole embed loop collapses into one whole-map
//   atomic temp+rename write instead of one per embed. A failed write is
//   NON-FATAL (§5.9 #50): the pinned
//   `vector cache: write failed (non-fatal): <error>` log fires, the
//   in-memory state continues, and the next successful write — which
//   serializes the WHOLE map — recovers the file. flush() cancels the
//   pending timer, forces the write when dirty, and resolves when the file
//   reflects every set() (the drain-before-report pin).
// - prune(keepKeys) compacts: entries with a FOREIGN provider tuple (≠ the
//   tuple observed by the cache's get()/set() traffic) or whose contentHash
//   is outside keepKeys are dropped; the file is rewritten ONCE (one queued
//   write after the drain) and the pinned `vector cache: pruned to N
//   entries` census is logged by the prune method.
import { lstatSync, readFileSync, writeFileSync, renameSync, type Stats } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'

/** The cache key (§5.13 — the decision VECTOR-CACHE-CONTENT-HASH-KEY). */
export interface CacheKey {
  /** The provider kind (config.provider). */
  kind: string
  /** The configured model name. */
  model: string
  /** The established embedding dimension. */
  dimension: number
  /** The lowercase-hex SHA-256 of the EXACT embedded text. */
  contentHash: string
}

/** The persisted embedding cache seam (§5.13 — the type referenced by
 *  `VectorBootOptions.cache?`). */
export interface VectorCache {
  /** A HIT returns the cached vector (no HTTP call); a MISS returns
   *  undefined (the caller embeds + writes through). */
  get(key: CacheKey): number[] | undefined
  /** Write-through: marks the entry dirty + schedules the COALESCED
   *  single-writer write (at most ONE trailing whole-map atomic temp+rename
   *  per CACHE_WRITE_DEBOUNCE_MS window; never awaited by the embed loop). */
  set(key: CacheKey, vector: number[]): void
  /** At promotion: drop entries outside `keepKeys` (contentHash strings for
   *  the current provider tuple) or with a foreign provider tuple, then
   *  rewrite the file ONCE. */
  prune(keepKeys: Set<string>): void
  /** Drain the write queue; resolves when the file reflects every set(). */
  flush(): Promise<void>
}

/** One persisted cache entry (the §5.13 pinned file format). */
interface CacheEntry {
  kind: string
  model: string
  dimension: number
  contentHash: string
  vector: number[]
  savedAt: number
}

const FILE_VERSION = 1
const DEFAULT_BASENAME = 'provident-vector-cache.json'

/** §5.13 (RCA-3 F1 pin) — the coalescing window for set()-triggered writes:
 *  at most ONE trailing whole-map write per window. Exported for the
 *  regression pin (tests/vector-cache.test.ts R2). */
export const CACHE_WRITE_DEBOUNCE_MS = 500

/** RCA-3 F3 — a V8 JSON SyntaxError interpolates ~30 chars of the corrupt
 *  file head into its message (attacker-chosen bytes straight into the log):
 *  strip every double-quoted snippet before logging. The pinned log PREFIX is
 *  unchanged. */
function sanitizeErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  return msg.replace(/"[\s\S]*?"/g, '"…"')
}

/** RCA-3 F4 — special-file guard: `p` must be a REGULAR file or ABSENT.
 *  lstat (never follows links, never opens) so a symlink/FIFO/directory at
 *  the cache or tmp path is rejected BEFORE any read or write — a FIFO open
 *  would block the main thread forever, a symlinked tmp would be written
 *  through, and a symlinked cache path would be silently replaced. An ABSENT
 *  path (ENOENT) is fine; any other lstat failure is rethrown. */
function regularFileOrAbsent(p: string): void {
  let st: Stats
  try {
    st = lstatSync(p)
  } catch (e) {
    if ((e as NodeJS.ErrnoException | undefined)?.code === 'ENOENT') return
    throw e
  }
  if (!st.isFile()) throw new Error(`cache path is not a regular file: ${p}`)
}

/** The default cache path — `join(app.getPath('userData'),
 *  'provident-vector-cache.json')` — resolved through the running Electron
 *  app (lazy, NO module-level Electron import: the seam stays node-pure).
 *  Outside Electron (no require / no app) it throws a clear error. */
function defaultCachePath(): string {
  try {
    if (typeof require === 'function') {
      const electron = (require('electron') as unknown) as {
        app?: { getPath?: (name: string) => string }
      }
      const userData = electron?.app?.getPath?.('userData')
      if (typeof userData === 'string' && userData !== '') {
        return join(userData, DEFAULT_BASENAME)
      }
    }
  } catch {
    // fall through to the explicit error below
  }
  throw new Error('createVectorCache: path required (no Electron app available for the default)')
}

/** The Map key for a cache entry — the EXACT four-field tuple (§5.13
 *  invalidation: a hash mismatch OR a key mismatch is a MISS). */
function keyOf(key: CacheKey): string {
  return `${key.kind}\u0000${key.model}\u0000${key.dimension}\u0000${key.contentHash}`
}

/** §5.9 #51 — a well-formed entry: every key field present + right-typed and
 *  the vector an array of finite numbers whose length === the entry's own
 *  dimension. Anything else is DROPPED at load (a miss, never thrown). */
function validEntry(raw: unknown): CacheEntry | undefined {
  if (typeof raw !== 'object' || raw === null) return undefined
  const r = raw as Record<string, unknown>
  if (typeof r.kind !== 'string') return undefined
  if (typeof r.model !== 'string') return undefined
  if (typeof r.dimension !== 'number' || !Number.isFinite(r.dimension)) return undefined
  if (typeof r.contentHash !== 'string') return undefined
  const vector = r.vector
  if (!Array.isArray(vector)) return undefined
  if (vector.length !== r.dimension) return undefined
  for (const n of vector) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return undefined
  }
  return {
    kind: r.kind,
    model: r.model,
    dimension: r.dimension,
    contentHash: r.contentHash,
    vector,
    savedAt: typeof r.savedAt === 'number' ? r.savedAt : 0,
  }
}

/** Create the persisted embedding cache (§5.13). Reads the file
 *  SYNCHRONOUSLY at creation; any load failure leaves an EMPTY cache + the
 *  pinned log, NEVER a throw. */
export function createVectorCache(opts?: { path?: string }): VectorCache {
  const path =
    opts?.path !== undefined && opts?.path !== null && opts?.path !== ''
      ? opts.path
      : defaultCachePath()
  // The in-memory cache, loaded synchronously at creation (§5.13 load
  // ownership). keyOf(tuple) → entry; last-wins on duplicate tuples.
  const entries = new Map<string, CacheEntry>()
  // The CURRENT provider tuple, latched from the get()/set() traffic (the
  // wrapper always asks with the live tuple) — what prune() treats as
  // "current" (a foreign tuple is dropped).
  let currentTuple: { kind: string; model: string; dimension: number } | undefined
  try {
    // RCA-3 F4 — lstat BEFORE any read: a non-regular file (symlink, FIFO,
    // directory, device) at `path` is a load failure — the file is never
    // opened (a FIFO open would block forever; a symlinked cache would be
    // read through). An ABSENT path throws ENOENT here and lands in the same
    // pinned catch as every other load failure (§5.9 #49).
    regularFileOrAbsent(path)
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      throw new Error('cache root is not a JSON object')
    }
    const root = parsed as { version?: unknown; entries?: unknown }
    if (root.version !== FILE_VERSION) {
      throw new Error(`unsupported cache version (${String(root.version)})`)
    }
    if (!Array.isArray(root.entries)) throw new Error('cache entries is not an array')
    for (const rawEntry of root.entries) {
      const entry = validEntry(rawEntry)
      if (entry !== undefined) entries.set(keyOf(entry), entry)
    }
  } catch (e) {
    // §5.9 #49 — absent/unreadable/invalid-JSON/non-object/wrong-version (and
    // RCA-3 F4: a non-regular file at `path`) → EMPTY + the pinned log; the
    // load NEVER throws. The interpolated error is SANITIZED (RCA-3 F3) — a
    // V8 SyntaxError quotes ~30 chars of the file head (attacker-chosen
    // bytes) and the quoted snippets are stripped.
    console.error(`vector cache: load failed (treating as empty): ${sanitizeErrorMessage(e)}`)
    entries.clear()
  }

  // The COALESCING SINGLE-WRITER queue (RCA-3 F1). set() only mutates the
  // map + marks dirty + schedules AT MOST ONE trailing write (the debounce
  // timer below); the pending write executes with the map state AT EXECUTION
  // TIME, so a whole embed loop collapses into ONE whole-map atomic
  // temp+rename write. Every write still runs on the serialized promise
  // chain (never concurrent); a failed write is NON-FATAL (§5.9 #50) and the
  // next successful write recovers the file.
  let queue: Promise<void> = Promise.resolve()
  let dirty = false // the map has changes not yet on disk
  let writeQueued = false // a write is scheduled (timer) or queued (chain)
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  function writeNow(): void {
    dirty = false
    try {
      // RCA-3 F4 — lstat BOTH targets before touching anything: a
      // non-regular file at `path` or the tmp path (a symlinked tmp would be
      // written through; a FIFO would block) → the pinned non-fatal skip.
      regularFileOrAbsent(path)
      regularFileOrAbsent(`${path}.tmp`)
      const payload = JSON.stringify({ version: FILE_VERSION, entries: [...entries.values()] })
      writeFileSync(`${path}.tmp`, payload, { encoding: 'utf8', mode: 0o600 })
      renameSync(`${path}.tmp`, path)
    } catch (e) {
      // §5.9 #50 — a failed persist is NON-FATAL: logged; the in-memory
      // state continues; the next successful write recovers the file.
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`vector cache: write failed (non-fatal): ${msg}`)
    }
  }
  function enqueueWrite(): void {
    writeQueued = true
    queue = queue.then(() => {
      writeQueued = false
      writeNow()
    })
  }
  /** Schedule the ONE trailing write for the current coalescing window. */
  function scheduleCoalescedWrite(): void {
    if (debounceTimer !== undefined) return // at most one pending write
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined
      if (dirty) enqueueWrite()
    }, CACHE_WRITE_DEBOUNCE_MS)
  }

  return {
    get(key: CacheKey): number[] | undefined {
      // The CURRENT tuple is what the caller asks with (the wrapper asks
      // with the live provider tuple) — latched on every get, hit or miss.
      currentTuple = { kind: key.kind, model: key.model, dimension: key.dimension }
      const entry = entries.get(keyOf(key))
      if (entry === undefined) return undefined
      return [...entry.vector]
    },
    set(key: CacheKey, vector: number[]): void {
      const entry: CacheEntry = {
        kind: key.kind,
        model: key.model,
        dimension: key.dimension,
        contentHash: key.contentHash,
        vector: [...vector],
        savedAt: Date.now(),
      }
      entries.set(keyOf(key), entry)
      currentTuple = { kind: key.kind, model: key.model, dimension: key.dimension }
      // RCA-3 F1 — coalescing: mark dirty + schedule the ONE trailing write;
      // the pending write serializes the map AT EXECUTION TIME, so later
      // sets inside the window need no new job (no per-embed disk write).
      dirty = true
      scheduleCoalescedWrite()
    },
    prune(keepKeys: Set<string>): void {
      for (const [k, entry] of entries) {
        if (
          currentTuple !== undefined &&
          (entry.kind !== currentTuple.kind ||
            entry.model !== currentTuple.model ||
            entry.dimension !== currentTuple.dimension)
        ) {
          entries.delete(k) // foreign provider tuple
          continue
        }
        if (!keepKeys.has(entry.contentHash)) entries.delete(k) // absent hash
      }
      console.error(`vector cache: pruned to ${entries.size} entries`)
      enqueueWrite() // the file is rewritten ONCE per prune
    },
    flush(): Promise<void> {
      // RCA-3 F1 — the drain-before-report pin: cancel the pending debounce
      // timer and FORCE the trailing write when the map is dirty (unless a
      // write is already queued — it executes with the same whole-map state),
      // so flush() resolves only when the file reflects every set().
      if (debounceTimer !== undefined) {
        clearTimeout(debounceTimer)
        debounceTimer = undefined
      }
      if (dirty && !writeQueued) enqueueWrite()
      return queue
    },
  }
}

/** §5.13 (the decision VECTOR-CACHE-CONTENT-HASH-KEY) — contentHash = the
 *  lowercase-hex SHA-256 of the EXACT embedded text (the raw string bytes, no
 *  normalization — AMENDMENT-REVIEW note 9: NOT the nodeSource record
 *  serialization). THE one hash helper of the cache discipline: the boot
 *  wrapper (vector-boot.ts) and the W5 live memoizer below both hash through
 *  THIS — no duplicated hash logic. */
export function contentHashOf(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/** W5 (§5.13 amendment) — the source the live memoizer is built over: the
 *  §5.13 key tuple (kind/model/dimension) PLUS the `embed` fn a MISS routes
 *  through. The embedder hands its provider instance here (structural: every
 *  EmbeddingProvider satisfies it). NOTE: the MISS path REQUIRES `embed` — a
 *  bare kind/model/dimension tuple cannot perform a MISS embed. */
export interface SingleTextMemoizerProvider {
  /** The provider kind (config.provider). */
  kind: string
  /** The configured model name. */
  model: string
  /** The established embedding dimension. */
  dimension: number
  /** The MISS embed route (the provider's single-text embed). */
  embed(text: string): Promise<number[]>
}

/** W5 (§5.13 amendment) — the SINGLE-TEXT memoizer the PROMOTED embedder
 *  routes ALL its single-text embeds through when a cache is supplied (not
 *  only the boot build): a HIT (exact tuple kind+model+dimension+contentHash,
 *  the dimension being read PER EMBED from the live `provider` object — F3 —
 *  so a cold auto-detect provider becomes hit-eligible as soon as its first
 *  embed latches the dimension) adopts the cached vector with NO HTTP call +
 *  fires `onHit`; a MISS embeds through `provider.embed` and — on SUCCESS —
 *  fires `onMiss` + persists per the caller:
 *
 *  - F1/F2 (the RCA-3 pass-2 ruling): a QUERY-embed miss (`embed(text)` —
 *    the default `persistMisses: false`) is adopted IN-MEMORY ONLY: the
 *    vector is REMEMBERED in a session map keyed by the SAME four-field
 *    tuple, so a repeated identical text still adopts with no HTTP call, but
 *    NOTHING is written to disk (the entries map + file stay untouched —
 *    closing the inter-prune growth bound and query-hash disk retention).
 *  - A MAINTENANCE (node-content) miss (`embed(text, { persist: true })`)
 *    ALSO writes through on the cache's existing debounced single-writer
 *    queue (NEVER awaited by the caller; flush() forces the pending write) —
 *    the live-upload write-through the user ordered.
 *
 *  A FAILED embed writes NOTHING (neither disk nor session — write-through/
 *  remembering happens only AFTER each successful embed) and propagates the
 *  rejection. A 0 `provider.dimension` (an auto-detect provider still cold,
 *  read per embed — F3) is CACHE-INELIGIBLE: straight to the provider (a
 *  persisting miss still writes through with the vector's own length, like
 *  the boot wrapper; a non-persisting miss session-remembers it). A
 *  non-string text is rejected with the pinned
 *  `cache memoizer: text must be a string` (F6 — never a raw crypto
 *  TypeError from the hash helper). The hash is the module's `contentHashOf`
 *  — the lowercase-hex SHA-256 of the EXACT text, shared with the boot
 *  wrapper. */
export function createSingleTextMemoizer(
  provider: SingleTextMemoizerProvider,
  cache: VectorCache,
  opts?: {
    onHit?: (hash: string) => void
    onMiss?: (hash: string) => void
    /** F1/F2 — the DEFAULT for a MISS: FALSE (the default) = in-memory
     *  session adoption only (no disk write); TRUE = the miss also writes
     *  through. A per-call `{ persist: true }` overrides for that call. */
    persistMisses?: boolean
  },
): { embed(text: string, callOpts?: { persist?: boolean }): Promise<number[]> } {
  // F1/F2 — the in-memory SESSION map for non-persisted (query) misses:
  // keyOf(tuple) → a COPY of the adopted vector. Session-scoped (lives with
  // the memoizer), never written to disk, never pruned.
  const session = new Map<string, number[]>()
  const persistDefault = opts?.persistMisses ?? false
  // F3 — the hit-check dimension is read PER EMBED from the LIVE provider
  // object (the boot wrapper's keyDimension() shape): a cold auto-detect
  // provider reports 0 until its first embed latches the dimension; a
  // creation-time latch would keep it permanently hit-ineligible while its
  // misses write entries it can never hit.
  function hitDimension(): number {
    return provider.dimension > 0 ? provider.dimension : 0
  }
  return {
    async embed(text: string, callOpts?: { persist?: boolean }): Promise<number[]> {
      // F6 — validate the input BEFORE hashing (a non-string text used to
      // throw a raw crypto TypeError out of contentHashOf).
      if (typeof text !== 'string') throw new Error('cache memoizer: text must be a string')
      const hash = contentHashOf(text)
      const dim = hitDimension()
      if (dim > 0) {
        const hit = cache.get({ kind: provider.kind, model: provider.model, dimension: dim, contentHash: hash })
        if (hit !== undefined) {
          opts?.onHit?.(hash)
          return hit
        }
        // F1/F2 — the session map: a repeated identical (non-persisted) text
        // adopts with NO HTTP call and does not re-embed.
        const remembered = session.get(keyOf({ kind: provider.kind, model: provider.model, dimension: dim, contentHash: hash }))
        if (remembered !== undefined) {
          opts?.onHit?.(hash)
          return [...remembered]
        }
      }
      // MISS (or cache-ineligible) — embed through the provider; the
      // rejection propagates BEFORE any write-through/remembering (no
      // cache.set and no session entry on failure). On success: onMiss + the
      // caller-routed persist (F1/F2): a persisting miss writes through
      // keyed with the vector's own length (the boot wrapper's discipline —
      // so an auto-detect provider's first embed still seeds the cache); a
      // non-persisting miss is REMEMBERED IN-MEMORY under the same tuple.
      const vec = await provider.embed(text)
      opts?.onMiss?.(hash)
      if (callOpts?.persist ?? persistDefault) {
        cache.set({ kind: provider.kind, model: provider.model, dimension: vec.length, contentHash: hash }, vec)
      } else {
        session.set(keyOf({ kind: provider.kind, model: provider.model, dimension: vec.length, contentHash: hash }), [...vec])
      }
      return vec
    },
  }
}