// src/main/rag-store-registry.ts — Unit U-MS1: the multi-store RAG registry,
// the PURE store-registry module (docs/specs/unit-ms1-store-registry.md §5;
// the reviewed Phase-1 slice, review §2 D2/D3/D8; the decision rows this unit
// pins in §4: REGISTRY-BOOT-SPLIT, REGISTRY-DERIVED-PATHS, REGISTRY-NO-WRITE,
// REGISTRY-CWD-TRANSPARENCY).
//
// PURE by contract (§5.1): the import set holds ONLY the three READ primitives
// from node:fs plus the four path helpers from node:path — no write primitive
// and no removal primitive is imported, so the module is structurally unable
// to mutate the disk. The only disk operations in the whole module are ONE
// existsSync probe + ONE statSync().isFile() probe (F-MS1-5 — the FIFO/device
// guard; read-only) + at most ONE readFileSync(opts.path, 'utf8') per
// loadRagStoreRegistry call; every path — including the fail-soft corrupt-file
// path — writes NOTHING (the implicit entry is synthesized in memory, never
// written back, D3). The module holds NO state between calls: both pure
// functions are pure and the loader constructs a fresh result per call (no
// memoization, no cache — two calls with the same file state return
// deep-equal results).
//
// Adversarial fix batch F-MS1-1..F-MS1-7a (2026-09-05, spec §3a): the BOM
// strip (F-MS1-1), the platform-conditional collision key (F-MS1-2), the
// total + capped <json> renderer (F-MS1-3/F-MS1-6), the frozen name pattern
// (F-MS1-4), the statSync isFile probe (F-MS1-5), and the NUL-byte path
// rejection (F-MS1-7a) — each landed with a red-first regression test.
//
// F-MS2-1 (2026-09-05, the U-MS2 adversarial batch — spec §3a): Pass D's
// collision seed set is extended with the LOADER's own resolved registry path
// (threaded as the optional internal `reservedPath` param of resolveRegistry),
// and Pass D gains the byte-pinned F14 — any entry (derived or explicit)
// resolving onto the loaded registry file's own path fails loud instead of
// silently shadowing it (the first write destroyed the registry file and the
// next boot failed loud locked out). The direct-JS 2-arg resolveRegistry form
// and the implicit-entry synthesis are byte-unchanged.
//
// The boot split (D2, REGISTRY-BOOT-SPLIT) — exactly three load outcomes:
//   1. ABSENT registry file ⇒ the implicit MIGRATION-LEGACY-PATH synthesis,
//      emitted with NO log line (zero-config boot output stays byte-equal);
//   2. CORRUPT/unreadable file ⇒ the same synthesis + the module's ONE pinned
//      error-log line (LOG-1, fail-soft — boot continues);
//   3. present but INVALID registry ⇒ the byte-pinned resolveRegistry Error
//      PROPAGATES out of the loader (fail-loud abort before the window; the
//      boot wiring itself is U-MS2, precedent main.ts:156-158).
//
// Registry mutation is BOOT-TIME-ONLY (D8): no mutation, no reload, no
// persist surface exists here — the loaded registry is a stateless snapshot.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, resolve } from 'node:path'

/** The registry name charset (D2). Lowercase alnum + `-`/`_`, 1–64 chars,
 *  must START alnum. Filesystem-safe: no dots ⇒ no traversal; no colon ⇒ a
 *  registry name can never collide with U-MS4's `<name>:` id-prefix
 *  namespace (STORE-ID-PREFIX).
 *  F-MS1-4: the export is Object.frozen for consumers, and VALIDATION reads
 *  the INTERNAL frozen copy below — never this export — so no consumer can
 *  redirect validation by tampering with (or shadowing `.test` on) the
 *  exported object. */
const RAG_STORE_NAME_PATTERN_INTERNAL: RegExp = Object.freeze(/^[a-z0-9][a-z0-9_-]{0,63}$/)

export const RAG_STORE_NAME_PATTERN: RegExp = Object.freeze(/^[a-z0-9][a-z0-9_-]{0,63}$/)

/** One operator-authored store entry, EXACTLY as authored in
 *  provident-rag-stores.json — no derived values. */
export interface RagStoreConfig {
  /** Required, non-empty, must match RAG_STORE_NAME_PATTERN. */
  name: string
  /** Optional. When present it must be exactly `true` or `false`. */
  default?: boolean
  /** Optional. When present: a string and `path.isAbsolute` — the store's
   *  persistence file, verbatim. */
  persistenceFile?: string
  /** Optional. When present: a string and `path.isAbsolute` — the store's
   *  import containment root, verbatim. */
  corpusRoot?: string
  /** Phase 2 only (VECTOR-TOPOLOGY-PER-STORE (e)); the Phase-2 shape is
   *  `Omit<EmbeddingProviderConfig,'apiKey'> & { apiKeyEnv?: string }`.
   *  In Phase 1 ANY present value — including `null` — fails validation
   *  (D2, fail-loud). */
  embedder?: unknown
}

/** The on-disk registry file shape (provident-rag-stores.json). */
export interface RagStoreRegistryFile {
  version: 1
  stores: RagStoreConfig[]
}

/** One RESOLVED store — the registry module's output, consumed by the U-MS2
 *  wiring. Derived values are materialized; explicit values are preserved
 *  verbatim. */
export interface ResolvedRagStore {
  name: string
  /** Materialized (the config's optional flag becomes a definite boolean). */
  default: boolean
  /** The explicit `persistenceFile` when present (the EXACT operator string,
   *  no normalization), else the derived default (§5.3.2 resolution). */
  persistenceFile: string
  /** The explicit `corpusRoot` when present; the property is OMITTED
   *  otherwise. NEVER filled with `process.cwd()` — the importer's cwd default
   *  applies at import time (markdown-import.ts:66). */
  corpusRoot?: string
}

/** The pure validate+resolve output. `version` and `embedder` are validated
 *  and DROPPED (never re-exposed). */
export interface ResolvedRagStoreRegistry {
  /** The resolved stores in registry array order (no reordering). */
  stores: ResolvedRagStore[]
  /** The ONE `default === true` store's name. */
  defaultStoreName: string
}

export interface RagStoreRegistryOptions {
  /** The registry file path. In the wiring (U-MS2):
   *  `join(app.getPath('userData'), 'provident-rag-stores.json')` — the file
   *  name is pinned; the directory must be userData so the implicit entry's
   *  derived legacy path is byte-equal to `main.ts:119`. Derived store files
   *  resolve against `dirname(path)`. No `~`/env expansion — verbatim. */
  path: string
}

/** The loader result: the resolved registry + how it was obtained. */
export interface LoadedRagStoreRegistry extends ResolvedRagStoreRegistry {
  /** The `opts.path` the load read (verbatim). */
  path: string
  /** True when the entry was SYNTHESIZED (MIGRATION-LEGACY-PATH) because the
   *  file was absent OR corrupt. Invariants: `corrupt ⇒ implicit`; and
   *  `implicit ⇒ stores.length === 1 && stores[0].name === 'main' &&
   *  stores[0].default === true` with the legacy persistence path. */
  implicit: boolean
  /** True ONLY for the fail-soft corrupt/unreadable-file path (the pinned
   *  log was emitted). Never true together with a file-derived registry. */
  corrupt: boolean
}

// ---------------------------------------------------------------------------
// Non-exported internals (§5.8 census, F-MS1-8 amendment: exactly TWO helpers
// — `jsonOf` and `derivePersistenceFile` — plus ONE internal const, none
// exported).
// ---------------------------------------------------------------------------

/** The `<json>` rendering used by the §5.4 byte-pinned messages:
 *  `JSON.stringify(value)`, with `undefined` rendering as the bare word.
 *  F-MS1-3: the rendering is TOTAL — a throwing `JSON.stringify` (BigInt,
 *  cyclic structure, a throwing `toJSON`) renders `String(value)` instead of
 *  surfacing an unpinned TypeError, so the byte-pinned census holds.
 *  F-MS1-6: the rendering is CAPPED — anything longer than 200 chars renders
 *  as its first 197 chars + `…` (exactly 198 chars). The cap applies to the
 *  RENDERING only, never to validation. */
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

/** F-MS1-2 — the platforms whose filesystems do not distinguish case (an
 *  internal const, pinned by §5.3.2 Pass D). On these, Pass D's collision key
 *  is the resolved path CASEFOLDED; elsewhere the lexical resolved path is
 *  the key. The F13 message still prints the ORIGINAL resolved path. */
const CASE_INSENSITIVE_FS_PLATFORMS: readonly NodeJS.Platform[] = ['darwin', 'win32']

/** REGISTRY-DERIVED-PATHS: the persistence path for an OMITTED
 *  `persistenceFile` — the legacy `provident-rag.json` when `name === 'main'`
 *  (the MIGRATION-LEGACY-PATH carve-out, D3), else
 *  `provident-rag-<name>.json`. The carve-out keys on the NAME ONLY (not on
 *  the default flag, not on implicitness) — one carve-out, one
 *  implementation, shared by implicitRegistry and resolveRegistry. */
function derivePersistenceFile(name: string, registryDir: string): string {
  return join(registryDir, name === 'main' ? 'provident-rag.json' : `provident-rag-${name}.json`)
}

// ---------------------------------------------------------------------------
// Exported functions (§5.3 — exactly 3).
// ---------------------------------------------------------------------------

/** MIGRATION-LEGACY-PATH (D3) — the synthesized zero-config registry: exactly
 *  one entry `{ name: 'main', default: true }` whose persistenceFile is the
 *  LEGACY `provident-rag.json` in `registryDir` and whose corpusRoot is
 *  omitted. NEVER written back to disk. PURE (no fs). */
export function implicitRegistry(registryDir: string): ResolvedRagStoreRegistry {
  if (typeof registryDir !== 'string' || registryDir === '') {
    throw new Error('rag-store-registry: registryDir required')
  }
  return {
    stores: [
      {
        name: 'main',
        default: true,
        persistenceFile: derivePersistenceFile('main', registryDir),
      },
    ],
    defaultStoreName: 'main',
  }
}

/** PURE validate + resolve of an ALREADY-PARSED registry value — ALL the D2
 *  rules, in the pinned pass order (§5.3.2): guard → A (per-entry shape/
 *  field checks) → B (duplicate names) → C (exactly one default) → D
 *  (persistence collision over derived ∪ explicit). Throws the byte-pinned
 *  fail-loud error on the FIRST failing rule; later rules are not evaluated
 *  once one fails. Never touches the filesystem.
 *  F-MS2-1 (F14, the U-MS2 adversarial batch): the OPTIONAL third parameter is
 *  the LOADER-internal reserved-path seed — `loadRagStoreRegistry` threads its
 *  own `opts.path` so Pass D ALSO rejects any entry (derived or explicit)
 *  resolving onto the loaded registry file's own path (the first store write
 *  would destroy the registry file and lock the next boot out). The direct-JS
 *  2-arg form threads NO reserved path — byte-identical behavior (the U-MS1
 *  contract is unchanged; the implicit-entry synthesis is unaffected). */
export function resolveRegistry(parsed: unknown, registryDir: string, reservedPath?: string): ResolvedRagStoreRegistry {
  if (typeof registryDir !== 'string' || registryDir === '') {
    throw new Error('rag-store-registry: registryDir required')
  }
  // F1 — the parsed value must be a non-null, non-array object.
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('rag-store-registry: registry must be an object')
  }
  const registry = parsed as Record<string, unknown>
  // F2 — version must be exactly 1 (a JSON `1.0` parses to 1 and passes).
  if (registry.version !== 1) {
    throw new Error(`rag-store-registry: unsupported registry version (got ${jsonOf(registry.version)})`)
  }
  // F3 — stores must be an array.
  if (!Array.isArray(registry.stores)) {
    throw new Error('rag-store-registry: stores must be an array')
  }
  const stores = registry.stores as unknown[]

  // Pass A — per-entry shape/field checks, scanning `stores` in array order;
  // within one entry, fields in the pinned order (entry object → name string
  // → name charset → default boolean → persistenceFile absolute → corpusRoot
  // absolute → embedder rejected). Field-presence rule (uniform): a field is
  // PRESENT iff its value is not undefined (§5.3.2). Unknown keys at both
  // levels are ignored (documented tolerance, §3) — `embedder` is the ONE
  // pinned exception.
  for (let i = 0; i < stores.length; i++) {
    const entry: unknown = stores[i]
    // 1. entry object.
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new Error(`rag-store-registry: stores[${i}] must be an object`)
    }
    const fields = entry as Record<string, unknown>
    // 2. name string.
    const nameValue: unknown = fields.name
    if (typeof nameValue !== 'string' || nameValue === '') {
      throw new Error(`rag-store-registry: stores[${i}].name must be a non-empty string (got ${jsonOf(nameValue)})`)
    }
    // 3. name charset — F-MS1-4: the check reads the INTERNAL frozen copy,
    //    never the exported const.
    if (!RAG_STORE_NAME_PATTERN_INTERNAL.test(nameValue)) {
      throw new Error(
        `rag-store-registry: stores[${i}].name must match ${RAG_STORE_NAME_PATTERN_INTERNAL.source} (got ${jsonOf(nameValue)})`,
      )
    }
    // 4. default boolean (when present).
    const defaultValue: unknown = fields.default
    if (defaultValue !== undefined && defaultValue !== true && defaultValue !== false) {
      throw new Error(`rag-store-registry: stores[${i}].default must be a boolean (got ${jsonOf(defaultValue)})`)
    }
    // 5. persistenceFile absolute (when present) — F-MS1-7a: a string
    //    containing a NUL byte (U+0000) is ALSO rejected here (same message
    //    shape): a NUL is a fail-loud authoring error, not a deferred fs
    //    error at store-open.
    const persistenceFileValue: unknown = fields.persistenceFile
    if (
      persistenceFileValue !== undefined &&
      (typeof persistenceFileValue !== 'string' ||
        !isAbsolute(persistenceFileValue) ||
        persistenceFileValue.includes('\u0000'))
    ) {
      throw new Error(
        `rag-store-registry: stores[${i}].persistenceFile must be an absolute path (got ${jsonOf(persistenceFileValue)})`,
      )
    }
    // 6. corpusRoot absolute (when present) — F-MS1-7a: the NUL-byte rule
    //    applies identically (same message shape).
    const corpusRootValue: unknown = fields.corpusRoot
    if (
      corpusRootValue !== undefined &&
      (typeof corpusRootValue !== 'string' || !isAbsolute(corpusRootValue) || corpusRootValue.includes('\u0000'))
    ) {
      throw new Error(
        `rag-store-registry: stores[${i}].corpusRoot must be an absolute path (got ${jsonOf(corpusRootValue)})`,
      )
    }
    // 7. embedder rejected (Phase 1) — ANY present value, including null
    //    (the D2 verbatim message: no prefix, no index, no name).
    if (fields.embedder !== undefined) {
      throw new Error('per-store embedder config is not supported yet')
    }
  }

  // Pass B — duplicate names: the first name seen twice in array order.
  const seenNames = new Set<string>()
  for (const entry of stores) {
    const name = (entry as Record<string, unknown>).name as string
    if (seenNames.has(name)) {
      throw new Error(`rag-store-registry: duplicate store name '${name}'`)
    }
    seenNames.add(name)
  }

  // Pass C — exactly one default: true (an empty stores array fails here).
  const defaults = stores.filter((entry) => (entry as Record<string, unknown>).default === true)
  if (defaults.length !== 1) {
    throw new Error(`rag-store-registry: exactly one store must have default: true (found ${defaults.length})`)
  }
  const defaultStoreName = (defaults[0] as Record<string, unknown>).name as string

  // Pass D — persistence collision over derived ∪ explicit, compared on
  // path.resolve-normalized values; then the resolution, in array order.
  // F-MS2-1 (F14) — the seed set includes the LOADED registry file's own
  // resolved path (threaded by the loader as the optional internal
  // `reservedPath` param; the direct-JS 2-arg form seeds NOTHING): any entry
  // whose collision key equals the registry file's key fails loud with F14
  // BEFORE the F13 store-store check (the registry file is not a store, so the
  // two-name F13 shape cannot render it — and no entry is ever ADDED to
  // seenPaths under the reserved key, since the F14 check precedes the set).
  const reservedNorm =
    typeof reservedPath === 'string' && reservedPath !== '' ? resolve(reservedPath) : null
  const reservedKey =
    reservedNorm === null
      ? null
      : CASE_INSENSITIVE_FS_PLATFORMS.includes(process.platform)
        ? reservedNorm.toLowerCase()
        : reservedNorm
  const seenPaths = new Map<string, string>()
  const resolvedStores: ResolvedRagStore[] = []
  for (const entry of stores) {
    const fields = entry as Record<string, unknown>
    const name = fields.name as string
    const isDefault = fields.default === true
    const explicitPersistenceFile = fields.persistenceFile as string | undefined
    const persistenceFile =
      explicitPersistenceFile !== undefined
        ? explicitPersistenceFile
        : derivePersistenceFile(name, registryDir)
    // The collision key is the resolve-normalized persistence path —
    // F-MS1-2: PLATFORM-CONDITIONAL. On the case-insensitive-filesystem
    // platforms (CASE_INSENSITIVE_FS_PLATFORMS) the key is the resolved path
    // CASEFOLDED, so case-differing paths collide there; on other platforms
    // the lexical resolved path is the key (no false positive). The F13/F14
    // messages below still print the ORIGINAL resolved path, never the
    // casefolded key.
    const normalizedPath = resolve(persistenceFile)
    const collisionKey = CASE_INSENSITIVE_FS_PLATFORMS.includes(process.platform)
      ? normalizedPath.toLowerCase()
      : normalizedPath
    // F-MS2-1 (F14) — the registry-file self-collision: the entry's collision
    // key matches the LOADED registry file's own path ⇒ fail loud (the first
    // write to that store file would destroy the registry file; the next boot
    // would fail loud locked out). The message prints the REGISTRY file's
    // resolve-normalized path (the colliding counterpart the message names)
    // and the CURRENT entry's name.
    if (reservedNorm !== null && collisionKey === reservedKey) {
      throw new Error(
        `rag-store-registry: persistence file collision with the registry file: ${reservedNorm} (store '${name}')`,
      )
    }
    const earlierName = seenPaths.get(collisionKey)
    if (earlierName !== undefined) {
      throw new Error(
        `rag-store-registry: persistence file collision: ${normalizedPath} (stores '${earlierName}', '${name}')`,
      )
    }
    seenPaths.set(collisionKey, name)
    // Resolution — the explicit `persistenceFile` verbatim (the EXACT
    // operator string, no normalization) else the derived default; explicit
    // values verbatim, derived values materialized; `version`/`embedder`
    // dropped; `corpusRoot` OMITTED when absent (REGISTRY-CWD-TRANSPARENCY —
    // the importer's cwd default applies at import time, never filled in
    // here).
    const store: ResolvedRagStore = { name, default: isDefault, persistenceFile }
    const corpusRoot = fields.corpusRoot as string | undefined
    if (corpusRoot !== undefined) {
      store.corpusRoot = corpusRoot
    }
    resolvedStores.push(store)
  }
  return { stores: resolvedStores, defaultStoreName }
}

/** Load the registry from disk — the boot-time entry point (D8). Absent file
 *  ⇒ implicit synthesis (NO log, NO file created). Corrupt/unreadable file
 *  ⇒ fail-soft implicit synthesis + the pinned error-log line (§5.4 LOG-1).
 *  Present but invalid ⇒ the resolveRegistry Error PROPAGATES (fail-loud
 *  abort before the window; wiring = U-MS2, precedent main.ts:156-158).
 *  F-MS1-5: a statSync().isFile() probe precedes the read — a non-regular
 *  file (a FIFO would block the read forever) and a stat race both land on
 *  the same fail-soft path. F-MS1-1: exactly ONE leading U+FEFF is stripped
 *  before JSON.parse. */
export function loadRagStoreRegistry(opts: RagStoreRegistryOptions): LoadedRagStoreRegistry {
  // G-load guard — the `path required` idiom (template-store.ts:74-76).
  if (opts === null || opts === undefined || typeof opts.path !== 'string' || opts.path === '') {
    throw new Error('rag-store-registry: path required')
  }
  const registryPath = opts.path
  const registryDir = dirname(registryPath)
  // Absent file ⇒ the implicit synthesis — NO log, NO file and NO directory
  // created (B2/B3). A dangling symlink behaves as absent (existsSync is the
  // probe).
  if (!existsSync(registryPath)) {
    return { ...implicitRegistry(registryDir), path: registryPath, implicit: true, corrupt: false }
  }
  // Corrupt/unreadable file ⇒ fail-soft: read+parse inside ONE try/catch —
  // ANY throw from the probe, the read or the parse (a non-regular file
  // (FIFO/device — F-MS1-5), a stat race (e.g. a raced deletion), byte
  // garbage, an empty file, trailing garbage after the JSON, a directory path
  // (EISDIR), a permission-denied file) ⇒ the ONE pinned log line (the caught
  // error rides as the log call's second argument) + the implicit synthesis.
  // Boot continues; NOTHING is rewritten (B5).
  let parsed: unknown = undefined
  try {
    // F-MS1-5 — the FIFO/device probe: a non-regular file must NEVER reach
    // readFileSync (a FIFO would block the read forever). The probe throws
    // into the ONE catch below — matching the corrupt-file discipline and
    // keeping the module's single pinned error-log call site (§5.4 census).
    if (!statSync(registryPath).isFile()) {
      throw new Error('not a regular file (statSync().isFile() === false)')
    }
    // F-MS1-1 — strip exactly ONE leading U+FEFF before JSON.parse, so a
    // BOM-prefixed VALID registry loads normally; a BOM that survives the
    // strip (a second leading BOM, a BOM inside/at the JSON) stays a
    // SyntaxError ⇒ fail-soft as pinned (§5.3.3 step 4, FS31).
    const text = readFileSync(registryPath, 'utf8')
    const textSansBom = text.startsWith('\uFEFF') ? text.slice(1) : text
    parsed = JSON.parse(textSansBom)
  } catch (err) {
    console.error(`[rag-store-registry] registry file unreadable (${registryPath}); falling back to the implicit main store`, err)
    return { ...implicitRegistry(registryDir), path: registryPath, implicit: true, corrupt: true }
  }
  // Present but invalid ⇒ the resolveRegistry Error PROPAGATES out of the
  // loader unchanged (fail-loud — the loader adds NO context and does NOT
  // re-wrap the message). Present and valid ⇒ the resolved registry + the
  // load metadata. F-MS2-1 (F14): the loader threads its OWN path as the
  // Pass-D reserved-path seed, so an entry (derived or explicit) resolving
  // onto the registry file itself fails loud here — before any store could
  // shadow and destroy it. The absent/corrupt paths never reach resolveRegistry
  // (the implicit synthesis is unaffected).
  const resolved = resolveRegistry(parsed, registryDir, registryPath)
  return { ...resolved, path: registryPath, implicit: false, corrupt: false }
}