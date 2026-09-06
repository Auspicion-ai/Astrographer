// src/main/rag-store-directory.ts — Unit U-MS2: the PURE store-directory module
// (docs/specs/unit-ms2-store-wiring.md §5.1). It hosts BOTH the resolution logic
// (the extracted pure resolver — the U5-F1 extraction precedent) AND the boot
// directory construction, so the Electron wiring in main.ts stays thin (the
// review §7 context-budget condition).
//
// PURE and node-testable by contract (§5.1): NO Electron import — the module
// imports only the RagStore/RetrievalEngine types, the store/retrieval/
// vector-boot/cache constructors, the EmbeddingProvider type, and `existsSync`
// from node:fs (the boot-captured per-store missing flag, §5.1 rule 3 — the
// module's ONLY direct fs call; the store constructors perform their own file
// I/O).
//
// F-MS1-15(c) downstream pin (U-MS1): the directory's entries are Map-keyed by
// name, never a plain object.
//
// Adversarial fix batch F-MS2-5/F-MS2-7 (2026-09-05, spec §3a): the M2
// unknown-store echo is CAPPED at 200 chars (the F-MS1-6 idiom) and
// buildRagStoreDirectory fails loud on an embedderKind that is neither
// 'lexical' nor 'vector' BEFORE any construction (the F-MS2-2 store-side
// isFile probe lives in rag-store.ts's load() — this module's fs surface is
// unchanged). Each landed with a red-first regression test (tests 60–63 of
// tests/unit-ms2-store-wiring.test.ts).
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createJsonRagStore, type RagStore } from './rag-store.js'
import { createLexicalEmbedder, createLexicalIndex, createRetrieval, type RetrievalEngine } from './retrieval.js'
import { createVectorBootController, type VectorBootController } from './vector-boot.js'
import { createVectorCache } from './vector-cache.js'
import type { EmbeddingProvider } from './embeddings.js'

/** The RESOLVED registry view U-MS2 consumes (produced by U-MS1's loader —
 *  docs/specs/unit-ms1-store-registry.md; U-MS1's exported surface is ITS
 *  contract). The TOP-LEVEL view is STRUCTURALLY U-MS1's
 *  `ResolvedRagStoreRegistry` — `stores` + `defaultStoreName` (F5): U-MS1's
 *  loader validates and DROPS `version` (unit-ms1-store-registry.md §5.2), so
 *  the consumed view carries NO `version` field. */
export interface ResolvedRegistryStore {
  /** charset-validated by U-MS1 */
  name: string
  /** exactly one true (U-MS1) */
  default: boolean
  /** The RESOLVED persistence file (absolute). The implicit entry and an
   *  explicit `main` without persistenceFile derive the legacy
   *  `provident-rag.json` (U-MS1's MIGRATION-LEGACY-PATH). */
  persistenceFile: string
  /** The configured corpus root (absolute when present; undefined otherwise —
   *  then the importer's `process.cwd()` default applies, byte-equal today). */
  corpusRoot?: string
}
export interface ResolvedRegistry {
  stores: ResolvedRegistryStore[]
  /** The ONE `default === true` store's name — U-MS1's resolved
   *  `defaultStoreName` (its validation guarantees exactly one). */
  defaultStoreName: string
}

/** One wired store: the store instance + its engine + its import root + its
 *  boot status. The presentation view U-MS5's settings listing reads
 *  (name/corpusRoot/status — the D7 status via the exported `storeLoadStatus`
 *  accessor below). */
export interface RagStoreEntry {
  name: string
  store: RagStore
  engine: RetrievalEngine
  /** The store's configured corpus root (absolute when configured);
   *  `undefined` ⇒ the importer's `process.cwd()` default
   *  (markdown-import.ts:66) — the zero-config byte-equal case. */
  corpusRoot?: string
  /** The store's own fail-disabled status flag, captured ONCE at boot from
   *  `store.status().corrupt` (rag-store.ts:1231-1243). `corrupt` is a
   *  construction-time const (rag-store.ts:641), so the snapshot cannot
   *  drift from `status().corrupt`. */
  corrupt: boolean
  /** The BOOT-CAPTURED per-store missing flag (F6): `!existsSync(
   *  cfg.persistenceFile)` evaluated ONCE at construction — the registry
   *  entry's persistence-file existence at boot, never re-probed (D8). The
   *  D7 discriminator: `corrupt` alone cannot distinguish `loaded` from
   *  `failed-missing` (both false); `missing` ⇒ `failed-missing`. */
  missing: boolean
}

/** The addressing surface injected into the rag/edit tool handlers. */
export interface RagStoreDirectory {
  entries: ReadonlyMap<string, RagStoreEntry>
  defaultName: string
}

/** The resolution result. `requested` is the RAW caller input — `null` when
 *  the `store` argument was omitted. */
export interface ResolvedStoreRef {
  requested: string | null
  name: string
}

/** The extracted PURE resolver (§5.1). Throws the byte-pinned fail messages:
 *  M1 `` `${tool}: store must be a non-empty string` `` (a present raw that is
 *  not a non-empty string), M2 `` `${tool}: unknown store '${raw}'` `` (a
 *  non-empty string that no directory entry holds — echoing ONLY the caller's
 *  input, never enumerating the registry — B9/A9), M3
 *  `rag-store-directory: default store not found` (raw omitted against a
 *  malformed directory whose default entry is absent — a wiring bug).
 *  Ordering: M1 (type/emptiness) is checked BEFORE M2 (membership) — a
 *  malformed value never leaks membership information. M3 is checked on the
 *  omitted path only.
 *
 *  Returns `null` ONLY for the legacy directory-less + omitted-store case
 *  (S3 — no resolution performed; the handler uses its passed store param
 *  unchanged, byte-equal to today). */
export function resolveStoreArg(
  tool: string,
  raw: unknown,
  dir: RagStoreDirectory | null | undefined,
): ResolvedStoreRef | null {
  if (raw !== undefined) {
    // M1 — type/emptiness FIRST (never leaks membership information).
    if (typeof raw !== 'string' || raw === '') {
      throw new Error(`${tool}: store must be a non-empty string`)
    }
    // M2 — membership (a non-empty string with no directory entry, or no
    // directory at all). The raw string is interpolated WITHOUT escaping.
    // F-MS2-5 — the echo is CAPPED at 200 chars (the F-MS1-6 idiom: longer
    // than 200 chars renders as its first 197 + '…', exactly 198 chars; the
    // ≤200-char case stays byte-exact — the cap applies to the RENDERING only,
    // never to membership, so a long raw is still M2, never M1).
    if (dir == null || !dir.entries.has(raw)) {
      const echoed = raw.length > 200 ? `${raw.slice(0, 197)}…` : raw
      throw new Error(`${tool}: unknown store '${echoed}'`)
    }
    // S2 — a known non-empty store name resolves to itself.
    return { requested: raw, name: raw }
  }
  // raw omitted (the key absent, or explicitly undefined — same S1 state).
  if (dir == null) {
    // S3 — the LEGACY sentinel: no resolution; the handler uses its passed
    // store param unchanged (byte-equal to today).
    return null
  }
  // M3 — a malformed directory (a wiring bug; U-MS1 never produces one).
  if (!dir.entries.has(dir.defaultName)) {
    throw new Error('rag-store-directory: default store not found')
  }
  // S1 — the omitted ⇒ default-entry rule.
  return { requested: null, name: dir.defaultName }
}

/** The F-MS2-7 `<json>` renderer for the embedderKind guard — the U-MS1
 *  `jsonOf` idiom: TOTAL (a throwing `JSON.stringify` — BigInt, cyclic
 *  structure, a throwing `toJSON` — renders `String(value)` instead of
 *  surfacing an unpinned TypeError) and CAPPED (longer than 200 chars renders
 *  as its first 197 chars + `…`, exactly 198 chars). Internal — not exported. */
function jsonOf(value: unknown): string {
  let rendered: string
  try {
    rendered = JSON.stringify(value)
  } catch {
    rendered = String(value)
  }
  if (rendered === undefined) {
    return 'undefined'
  }
  return rendered.length > 200 ? `${rendered.slice(0, 197)}…` : rendered
}

/** The boot plan: N stores + N engines (one per registry entry) + at most ONE
 *  vector boot controller (the DEFAULT store's — A6/R10). */
export interface RagStoreBootPlan {
  directory: RagStoreDirectory
  /** Non-null IFF the DEFAULT store took the vector branch — at most ONE. */
  vectorBoot: VectorBootController | null
  defaultName: string
}

/** The boot construction (§5.1 rules 1–6): N `createJsonRagStore` instances
 *  (each with its OWN single-writer queue — SINGLE-WRITER-STORE-PER-STORE) +
 *  N engines (ENGINE-PER-STORE, created ONCE at boot — the Unit E F1
 *  no-per-call-rebuild property holds per store), keyed by name in REGISTRY
 *  INSERTION ORDER (F-MS1-15(c): Map-keyed, never a plain object).
 *
 *  Rule 2 — the engine branch: the DEFAULT store follows today's exact
 *  lexical/vector branch (main.ts:145-173); ALL non-default stores are ALWAYS
 *  lexical EVEN in vector mode (A6/R10 — no per-store warm-up, no per-store
 *  cache, the §5.12 class-2 abort unreachable for them). The vector cache is
 *  constructed with the EXPLICIT `join(opts.userDataPath,
 *  'provident-vector-cache.json')` path — byte-equal to today's Electron
 *  default file (vector-cache.ts:114-133 resolves the SAME path through the
 *  app); the NO-ARG form throws outside Electron (F8), so the explicit path
 *  keeps the vector plan node-runnable.
 *
 *  Rule 5 — the defensive one-default cross-check (a wiring bug; U-MS1 never
 *  produces one) runs BEFORE any store is constructed, so an invalid registry
 *  view never creates a store file. */
export function buildRagStoreDirectory(
  registry: ResolvedRegistry,
  opts: {
    userDataPath: string
    embedderKind: 'lexical' | 'vector'
    /** The ALREADY-WARMED provider (main.ts:159 ran before this call) —
     *  required iff `embedderKind === 'vector'`, else null. */
    provider: EmbeddingProvider | null
  },
): RagStoreBootPlan {
  // F-MS2-7 — the embedderKind runtime guard, BEFORE any construction (it
  // precedes even the rule-5 defensive cross-check, which itself precedes any
  // store construction). opts.embedderKind comes from the wiring (main.ts
  // args/env); a kind that is neither 'lexical' nor 'vector' (a wiring bug or
  // an any-holed caller) would otherwise silently take the lexical branch for
  // every store — fail loud instead. The `<json>` rendering is the TOTAL +
  // CAPPED jsonOf idiom (above).
  if (opts.embedderKind !== 'lexical' && opts.embedderKind !== 'vector') {
    throw new Error(`rag-store-directory: embedderKind must be 'lexical' or 'vector' (got ${jsonOf(opts.embedderKind)})`)
  }
  // Rule 5 — exactly one `default === true` entry, and its name IS the
  // consumed view's defaultStoreName.
  const defaults = registry.stores.filter((s) => s.default === true)
  const defaultEntry = defaults.length === 1 ? defaults[0] : undefined
  if (defaultEntry === undefined || defaultEntry.name !== registry.defaultStoreName) {
    throw new Error('rag-store-directory: registry must contain exactly one default store')
  }
  const entries = new Map<string, RagStoreEntry>()
  let vectorBoot: VectorBootController | null = null
  // Rules 1–4 — per registry entry, in registry insertion order.
  for (const cfg of registry.stores) {
    // Rule 1 — each instance carries its OWN single-writer queue.
    const store = createJsonRagStore({ path: cfg.persistenceFile })
    let engine: RetrievalEngine
    if (cfg.name === registry.defaultStoreName && opts.embedderKind === 'vector') {
      // Defense-in-depth re-guard — byte-identical to the main.ts:157 guard,
      // which stays UNCHANGED and fires first in the wired main.
      if (opts.provider == null) {
        throw new Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')
      }
      // Rule 2 (vector) — the ONE vector boot (the default store's): the
      // born-lexical pending controller owns the shared engine (W1). The
      // explicit cache path is byte-equal to the Electron default file (F8).
      const boot = createVectorBootController(store, opts.provider, {
        embedBatchFn: opts.provider.embedBatch,
        cache: createVectorCache({ path: join(opts.userDataPath, 'provident-vector-cache.json') }),
      })
      engine = boot.engine
      vectorBoot = boot
    } else {
      // Rule 2 (lexical) — byte-equal to main.ts:172. ALL non-default stores
      // take this branch EVEN in vector mode (A6/R10); they create NO cache
      // file and never participate in the vector boot.
      engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    }
    // Rule 3 — the per-store boot flags, captured ONCE at construction
    // (D8: the missing flag is never re-probed).
    const entry: RagStoreEntry = {
      name: cfg.name,
      store,
      engine,
      corrupt: store.status().corrupt,
      missing: !existsSync(cfg.persistenceFile),
    }
    // Rule 4 — the corpus root passthrough (undefined ⇒ the importer's
    // process.cwd() default — the zero-config byte-equal case).
    if (cfg.corpusRoot !== undefined) entry.corpusRoot = cfg.corpusRoot
    entries.set(cfg.name, entry)
  }
  // Rule 6 — the plan: the directory + at most one vector boot.
  const directory: RagStoreDirectory = { entries, defaultName: registry.defaultStoreName }
  return { directory, vectorBoot, defaultName: registry.defaultStoreName }
}

/** The per-store boot-status derivation — ONE exported PURE accessor (F6); the
 *  exact surface U-MS5's settings listing consumes (unit-ms5-settings-listing.md
 *  §5.4 wires `(name) => storeLoadStatus(entries.get(name)!)`). The precedence
 *  is pinned: `missing` ⇒ 'failed-missing' (an absent persistence file = the
 *  first-run empty store — NOT an error state, D7), else `corrupt` ⇒
 *  'failed-corrupt', else 'loaded'. The returned union's members are EXACTLY
 *  U-MS5's shared `RagStoreLoadStatus` (declared in src/shared/types.ts when
 *  U-MS5 lands — the A3/RCA-6 coordination its §5.1 pins); until then this
 *  inline union is the derivation's contract. */
export function storeLoadStatus(
  entry: Pick<RagStoreEntry, 'missing' | 'corrupt'>,
): 'loaded' | 'failed-corrupt' | 'failed-missing' {
  if (entry.missing) return 'failed-missing'
  if (entry.corrupt) return 'failed-corrupt'
  return 'loaded'
}