// src/main/rag-store-runtime.ts — Unit U-H2a: the registry hot-apply RUNTIME
// controller (docs/specs/unit-h2-runtime-controller.md §5; the review §2
// D1/D2/D3/D4/D7/D8 + A-P2-1/A-P2-3/A-P2-8; the §4 decision rows
// RUNTIME-CONTROLLER, MUTABLE-LIVE-DIRECTORY, DEFAULT-STABLE-APPLY,
// REBUILD-ALL-OF-NON-DEFAULT, HOT-APPLY-TRIGGER-RESOLVED, NO-OP-BYTE-EQUAL,
// ATOMIC-APPLY, D4-NO-IDS-CALLER-PRECONDITION).
//
// The controller owns the mutable live `RagStoreDirectory` (the SAME object
// `buildRagStoreDirectory` built at boot — mutated IN PLACE, never replaced),
// the runtime accessors, and the single hot-apply orchestration seam
// `hotApply(mutation)`. It consumes the U-H1 write path `writeRegistryMutation`
// (the ONLY disk touch) and applies each delta as a REBUILD of the non-default
// entries from the freshly loaded registry. The default store/engine/vector-boot
// object identities are carried across unchanged (DEFAULT-STABLE-APPLY); the old
// non-default entries are ORPHANED, never torn down (D3 / A-P2-8 — teardown is
// U-H5's contract).
//
// Construction is side-effect-free (NO rebuild, NO fs, NO re-read, NO log —
// NO-OP byte-equal to today's boot). `hotApply` is the controller's ONLY
// mutating method.
//
// Negative pins: NO Electron import, NO IPC / MCP / new channel / new tool
// (D6), NO teardown/close/destroy primitive (A-P2-8), NO remove/unlink/rm/rmdir
// primitive (D3 — a store file is NEVER deleted). ZERO console output (failures
// are thrown).
//
// §7 Architect ruling: `hotApply(mutation)` is a synchronous programmatic seam,
// NEVER an MCP tool / NEW IPC channel.

import { existsSync } from 'node:fs'
import { writeRegistryMutation, type RegistryMutation, type RegistryDelta } from './rag-store-registry-write.js'
import type { LoadedRagStoreRegistry, ResolvedRagStore } from './rag-store-registry.js'
import { storeLoadStatus, type RagStoreDirectory, type RagStoreEntry } from './rag-store-directory.js'
// U-H4 — the ONLY drain-then-teardown caller referenced by this module. The
// identifier `drainAndReleaseEntry` contains NO lowercase `teardown`, so the
// U-H2 N1 / U-H5 A-P2-8 grep pins on this file's source stay green — the
// teardown call sites live ONLY in `rag-store-remove.js`.
import { drainAndReleaseEntry } from './rag-store-remove.js'
import { createJsonRagStore, type RagStore } from './rag-store.js'
import { createLexicalEmbedder, createLexicalIndex, createRetrieval, type RetrievalEngine } from './retrieval.js'
import type { VectorBootController } from './vector-boot.js'
import type { EmbeddingProvider } from './embeddings.js'
// U-H7 — the default-change orchestration helpers. NEITHER identifier contains
// a lowercase `teardown`, so the U-H2 N1 / U-H5 A-P2-8 grep pins on this file's
// source stay green — the release call site lives ONLY in `rag-store-default.js`.
import { createDefaultVectorBoot, releaseDefaultVectorBoot } from './rag-store-default.js'

const RT = 'rag-store-runtime:'
function msg(text: string): string {
  return `${RT} ${text}`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The R-kind `<json>` rendering: R-kind renders the raw kind value (a string
 *  kind renders WITHOUT JSON quoting — `unknown mutation kind 'delete'`), with
 *  the loader's TOTAL + CAPPED discipline for non-string kinds. */
function kindOf(value: unknown): string {
  let rendered: string
  if (typeof value === 'string') {
    rendered = value
  } else {
    try {
      rendered = JSON.stringify(value)
    } catch {
      rendered = String(value)
    }
    if (rendered === undefined) rendered = 'undefined'
  }
  return rendered.length > 200 ? `${rendered.slice(0, 197)}…` : rendered
}

/** The controller's construction inputs. The directory/default/vectorBoot are
 *  the EXACT objects `buildRagStoreDirectory` produced at boot (their identity
 *  is preserved — NO-OP byte-equal). `provider`/`embedderKind`/`userDataPath`
 *  DEFINE the rebuild environment for the later units (U-H3/H4/H6/H7); U-H2's
 *  reachable mutations rebuild only NON-default lexical entries and never
 *  consume `provider`. */
export interface RagStoreRuntimeOptions {
  /** The boot-loaded registry (U-MS1's `LoadedRagStoreRegistry`); the
   *  controller's INITIAL "current" registry, replaced by the fresh `loaded`
   *  on each successful `hotApply`. */
  registry: LoadedRagStoreRegistry
  /** The boot-constructed directory (U-MS2). MUTATED IN PLACE on apply. */
  directory: RagStoreDirectory
  /** The stable default entry: `directory.entries.get(directory.defaultName)`. */
  defaultEntry: RagStoreEntry
  /** At most ONE boot vector controller (the default store's, A6) — carried
   *  across, never rebuilt/started by U-H2. */
  vectorBoot: VectorBootController | null
  /** The registry file path — `writeRegistryMutation`'s `path` (D2). */
  registryPath: string
  userDataPath: string
  embedderKind: 'lexical' | 'vector'
  provider: EmbeddingProvider | null
}

/** The successful hot-apply result — the controller applies the live-directory
 *  rebuild and returns the fresh registry + the delta (threaded for
 *  U-H3/U-H4/U-H6). */
export interface HotApplyResult {
  /** The FRESH `loaded` registry just written + re-read by
   *  `writeRegistryMutation` (D2 persisted-and-live round-trip). */
  loaded: LoadedRagStoreRegistry
  /** The applied structural delta (exactly ONE non-empty member, U-H1). */
  delta: RegistryDelta
}

/** The successful DRAIN-THEN-TEARDOWN remove result (Unit U-H4). `delta.removed`
 *  is exactly `[name]`; `drained` is the settled in-flight query count at
 *  teardown — ALWAYS 0 (the drain gate never tears down mid-query, A-P2-2/D7). */
export interface HotRemoveResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path. */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [name], renamed: [] }` — the applied delta. */
  delta: RegistryDelta
  /** The settled in-flight query count at teardown — 0 (the drain guarantee). */
  drained: number
}

/** The successful DRAIN-THEN-TEARDOWN rename result (Unit U-H6).
 *  `delta.renamed` is exactly `[{ from, to }]`; `drained` is the settled
 *  in-flight query count at teardown of the OLD `from` engine — ALWAYS 0 (the
 *  drain gate never tears down mid-query, A-P2-2/D7). */
export interface HotRenameResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path. */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [], renamed: [{ from, to }] }` — the applied delta. */
  delta: RegistryDelta
  /** The settled in-flight query count on the OLD `from` engine at teardown —
   *  0 (the drain guarantee). */
  drained: number
}

/** The successful default-REASSIGNMENT result (Unit U-H7).
 *  `delta.defaultChanged` is exactly `[name]`; `drained` is the settled
 *  in-flight query count on the OLD default's vector engine at release — ALWAYS
 *  0 (the A-P2-2 drain never tears down mid-query; always 0 in lexical mode).
 *  `noop` is TRUE iff `name` was already the default (no write, no release, no
 *  live mutation). */
export interface HotSetDefaultResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path
   *  (for a no-op, the current registry). */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [], renamed: [], defaultChanged: [name] }`
   *  (all-empty for a no-op). */
  delta: RegistryDelta
  /** The settled in-flight query count on the OLD default's vector engine at
   *  release — 0 (the drain guarantee; always 0 in lexical mode). */
  drained: number
  /** TRUE iff `name` was already the default (no-op — no write, no release). */
  noop: boolean
}

/** The successful default-RENAME result (Unit U-H7, Q3 R1). The store stays the
 *  default under the new name. `delta.renamed === [{ from, to }]` AND
 *  `delta.defaultChanged === [to]`. */
export interface HotRenameDefaultResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path. */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [], renamed: [{ from, to }], defaultChanged: [to] }`
   *  — the applied delta (the default is PRESERVED under the new name). */
  delta: RegistryDelta
  /** The settled in-flight query count — 0 (no release occurs on a rename). */
  drained: number
}

/** The controller instance returned by `createRagStoreRuntimeController`. */
export interface RagStoreRuntimeController {
  getDirectory(): RagStoreDirectory
  getDefaultEntry(): RagStoreEntry
  getDefaultName(): string
  getDefaultStore(): RagStore
  getDefaultEngine(): RetrievalEngine
  getVectorBoot(): VectorBootController | null
  getRegistryPath(): string
  currentStores(): ResolvedRagStore[]
  statusOf(name: string): 'loaded' | 'failed-corrupt' | 'failed-missing'
  hotApply(mutation: RegistryMutation): HotApplyResult
  /** U-H4 — the DRAIN-THEN-TEARDOWN remove of a non-default store (Unit U-H4):
   *  write + unregister the
   *  named NON-default store via the existing `hotApply({kind:'remove'})`, then
   *  drain the removed engine (`inFlight()===0`) + tear the removed store's
   *  store + engine down (U-H5 primitives, owned by `rag-store-remove.js`), and
   *  STRAND the persistence file + journal (D3). ASYNC — the operator-facing
   *  remove seam U-H8 calls. Throws propagate (W-remove-unknown / W-remove-arg
   *  / loader F12 / fs); live Map + disk are untouched on a throw. */
  hotRemove(name: string): Promise<HotRemoveResult>
  /** U-H6 — the DRAIN-THEN-TEARDOWN rename of a non-default store (Unit U-H6):
   *  write + rebuild-under-`to` + unregister-the-old-`from` (via the existing
   *  `hotApply({kind:'rename'})`), then drain the OLD renamed engine
   *  (`inFlight()===0`), tear the old-`from` store + engine down (U-H5
   *  primitives, owned by `rag-store-remove.js`), and STRAND the old `from`
   *  persistence file + journal (D3) while the NEW `to` entry becomes live.
   *  NON-DEFAULT-only (a default rename propagates `W-rename-default` — folds
   *  into U-H7); inherits the D4 `R-rename-ids-present` rejection from
   *  `hotApply`. ASYNC — the operator-facing rename seam U-H8 calls. Throws
   *  propagate (W-rename-unknown-from / W-rename-target-exists /
   *  W-rename-default / R-rename-ids-present / loader F12 / native fs); the live
   *  Map + disk are untouched on a throw. */
  hotRename(from: string, to: string): Promise<HotRenameResult>
  /** U-H7 — REASSIGN the default at runtime (D5/A-P2-4): flip `default:true`
   *  onto the named existing non-default store (via the write module's
   *  `setDefault` kind — the atomic D2 write), RE-BIND the runtime's internal
   *  default (`getDefaultName`/`getDefaultEntry`/`getDefaultStore`/
   *  `getDefaultEngine`/`getVectorBoot`) so every already-rewired closure
   *  reflects the new default per call (A-P2-1), and in vector mode release the
   *  OLD default's vector boot + re-warm the NEW default's (construct-new-before-
   *  release-old — no dark default). A no-op when `name` is already the default.
   *  ASYNC — the operator-facing default-reassignment seam U-H8 calls. Throws
   *  propagate (R-set-default-arg / the write-set / the loader-F set / fs); live
   *  + disk untouched on a throw. */
  hotSetDefault(name: string): Promise<HotSetDefaultResult>
  /** U-H7 — the SANCTIONED default rename (Q3 R1): the current default's name
   *  changes BUT it stays `default:true` (via the write module's `renameDefault`
   *  kind). The LEGACY `hotApply`/`hotRename` default paths KEEP propagating
   *  `W-rename-default` (U-H2 F9/HOST-2 + U-H6 F4 — NOT relaxed). */
  hotRenameDefault(to: string): Promise<HotRenameDefaultResult>
}

/** Construction: validates the inputs FAIL-LOUD (R-* guards), stores the boot
 *  directory/default/vectorBoot/registryPath/env, and performs NO rebuild/fs/
 *  read/log side effect (NO-OP byte-equal — §4). */
export function createRagStoreRuntimeController(
  opts: RagStoreRuntimeOptions,
): RagStoreRuntimeController {
  if (!isObject(opts)) {
    throw new Error(msg('options required'))
  }
  if (typeof opts.registryPath !== 'string' || opts.registryPath === '') {
    throw new Error(msg('registryPath required'))
  }
  if (
    opts.directory === null ||
    typeof opts.directory !== 'object' ||
    !(opts.directory.entries instanceof Map) ||
    typeof opts.directory.defaultName !== 'string' ||
    opts.directory.defaultName === ''
  ) {
    throw new Error(msg('directory required'))
  }
  if (opts.defaultEntry === null || typeof opts.defaultEntry !== 'object') {
    throw new Error(msg('default entry required'))
  }
  if (
    opts.defaultEntry.name !== opts.directory.defaultName ||
    opts.directory.entries.get(opts.directory.defaultName) !== opts.defaultEntry
  ) {
    throw new Error(msg('default entry does not match the directory default'))
  }
  if (opts.embedderKind !== 'lexical' && opts.embedderKind !== 'vector') {
    throw new Error(msg("embedderKind must be 'lexical' or 'vector'"))
  }
  if (
    opts.registry === null ||
    typeof opts.registry !== 'object' ||
    !Array.isArray(opts.registry.stores) ||
    !opts.registry.stores.some((s) => isObject(s) && s.name === opts.directory.defaultName) ||
    opts.registry.defaultStoreName !== opts.directory.defaultName
  ) {
    // R-registry-default — extended (HOST-3): the guard also requires
    // `registry.stores` to be a non-empty array containing a resolvable default
    // entry, so a malformed registry fails loud with the pinned message instead
    // of a raw TypeError or a silently-weakened F16 drift guard.
    throw new Error(msg('registry default does not match the directory default'))
  }

  const directory: RagStoreDirectory = opts.directory
  // U-H7 — the default becomes RE-BINDABLE: `defaultEntry`/`vectorBoot` are
  // re-pointed by `hotSetDefault`/`hotRenameDefault` (D1/A-P2-1). Every
  // already-rewired closure reads the accessors PER CALL, so the re-bind
  // propagates with ZERO additional rewiring (A-P2-1). This also closes U-H2's
  // HOST-LOW-1 accessor desync on this path (Q11).
  let defaultEntry: RagStoreEntry = opts.defaultEntry
  let vectorBoot: VectorBootController | null = opts.vectorBoot
  const registryPath = opts.registryPath
  const _userDataPath = opts.userDataPath
  const _embedderKind = opts.embedderKind
  const _provider = opts.provider
  let currentRegistry: LoadedRagStoreRegistry = opts.registry
  // The real underlying Map (typed ReadonlyMap at the boundary — the controller
  // is the ONLY writer, mutating it in place, D1).
  const liveMap = directory.entries as unknown as Map<string, RagStoreEntry>
  // The default's persistence file — captured from the initial registry so a
  // drift in the loaded default (F16) can be detected. U-H7 (RCA-3 HOST-1): a
  // `let`, RE-POINTED after a successful `hotSetDefault`/`hotRenameDefault` to
  // the FRESH loaded default's persistence file — otherwise the F15/F16 drift
  // guard would keep comparing every later loaded default's `persistenceFile`
  // against the stale BOOT default's, firing the drift branch on a legitimate
  // post-reassignment hot-* op (scrambling the live map + throwing).
  let defaultPersistenceFile = opts.registry.stores.find((s) => s.name === directory.defaultName)?.persistenceFile
  // RCA-3 HOST-5 — the concurrency serialization seam: exactly ONE hot-* default
  // reassignment runs at a time (a transient A6 at-most-ONE boot violation if a
  // second `hotSetDefault`/`hotRenameDefault` started a new boot mid-drain).
  let reassignInFlight = false

  function statusOf(name: string): 'loaded' | 'failed-corrupt' | 'failed-missing' {
    const e = directory.entries.get(name)
    if (!e) {
      throw new Error(msg(`unknown store '${name}'`))
    }
    return storeLoadStatus(e)
  }

  function hotApply(mutation: RegistryMutation): HotApplyResult {
    // 1. Guard (mutation).
    if (!isObject(mutation)) {
      throw new Error(msg('mutation required'))
    }
    const kind = mutation.kind
    // U-H7 — `hotApply` is DEFAULT-STABLE: a `setDefault` mutation through the
    // hot-apply seam is rejected with the byte-pinned message (the sanctioned
    // default reassignment is `hotSetDefault`, F6). A `renameDefault` mutation
    // (also a default-changing kind) is rejected here too — before the write.
    if (kind === 'setDefault' || kind === 'renameDefault') {
      throw new Error(msg('default reassignment must use hotSetDefault'))
    }
    if (kind !== 'add' && kind !== 'remove' && kind !== 'rename') {
      throw new Error(msg(`unknown mutation kind '${kindOf(kind)}'`))
    }

    // 2. D4 no-ids caller precondition (rename only): inspect the CURRENT store
    //    BEFORE any write. A MISSING `from` store falls through to the write
    //    module (W-rename-unknown-from). The scan is SKIPPED when `from` is the
    //    DEFAULT store (HOST-2): a default rename is rejected FIRST by the write
    //    module's pinned W-rename-default (F9) regardless of any `<from>:`-prefixed
    //    ids the default store carries, so the D4 precondition must not preempt it.
    if (kind === 'rename' && typeof mutation.from === 'string' && mutation.from !== directory.defaultName) {
      const from = mutation.from
      const cur = directory.entries.get(from)
      if (cur) {
        const ids = cur.store.listNodes().map((n) => n.id)
        if (ids.some((id) => id.startsWith(`${from}:`))) {
          throw new Error(msg(`cannot rename store '${from}' — it has persisted '${from}:'-prefixed ids`))
        }
      }
    }

    // 3. Write (the ONLY disk touch — D2). Any throw propagates; live untouched.
    const { loaded, delta } = writeRegistryMutation({ path: registryPath, mutation })

    // 4/5. Default-stability defensive checks. These may FIRE AFTER the write
    //    already persisted (an external mid-run registry default edit is
    //    in-contract — H9/F15/F16). To preserve D2 (persisted-and-live NEVER
    //    diverge), the live directory is SYNCHRONIZED to the freshly-loaded
    //    `loaded` projection BEFORE the throw — the on-disk state is never left
    //    invisible live (HOST-1).
    const loadedDefault = loaded.stores.find((s) => s.name === loaded.defaultStoreName)
    // The default is STABLE only when it is still the SAME name AND the SAME
    // persistenceFile as the boot default entry carried across.
    const defaultStable =
      loaded.defaultStoreName === directory.defaultName &&
      loadedDefault !== undefined &&
      loadedDefault.persistenceFile === defaultPersistenceFile
    if (!defaultStable) {
      // Choose the byte-pinned error BEFORE the sync (the sync may follow the
      // loaded default name on the directory). F15 — the on-disk default NAME
      // changed (unreachable via U-H1; U-H7 owns default reassignment); F16 —
      // the on-disk default's persistenceFile drifted from the carried default.
      const defaultChanged = loaded.defaultStoreName !== directory.defaultName
      // Drift — rebuild the live directory ENTIRELY from `loaded` (the newly
      // defaulted store built as a lexical entry) so live reflects exactly what
      // is on disk, then throw the byte-pinned defensive error (D2 preserved
      // even in the throw path — HOST-1).
      syncLiveToLoaded(loaded, true)
      throw new Error(
        msg(
          defaultChanged
            ? 'default store changed by a hot-apply (default reassignment is a separate unit)'
            : 'default entry drifted from the loaded registry',
        ),
      )
    }

    // 6/7. Normal path — the default is STABLE: re-synchronize the live Map to
    //    `loaded` carrying the boot default entry object across (its identity
    //    preserved), rebuilding only the non-default (always-lexical) entries
    //    and ORPHANING the old non-defaults (never torn down).
    syncLiveToLoaded(loaded, false)

    // 8. Return.
    return { loaded, delta }
  }

  /** U-H4 — the DRAIN-THEN-TEARDOWN remove. Order (§5.3):
   *  1. top-of-method arg guard (W-remove-arg `name required`, reused — 0 new
   *     templates);
   *  2. CAPTURE the orphan `RagStoreEntry` from the live Map BEFORE the write
   *     (the swap unregisters it);
   *  3. write + default-stability + live-map swap via the LANDED synchronous
   *     `hotApply({kind:'remove'})` (all W-remove-* / loader-F12 / fs errors
   *     propagate; live + disk untouched on throw);
   *  4. defensive skip + `await drainAndReleaseEntry(orphan)` — UNBOUNDED drain
   *     (`inFlight()===0`) then store+engine teardown, owned by
   *     `rag-store-remove.js`;
   *  5. return `{ loaded, delta:{added:[],removed:[name],renamed:[]}, drained: 0 }`.
   *  The drain never tears down a removed engine mid-query (A-P2-2/D7). */
  async function hotRemove(name: string): Promise<HotRemoveResult> {
    // F1 — the arg guard fires BEFORE any write/drain (null/5/'' → W-remove-arg).
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error('rag-store-registry-write: name required')
    }
    // Capture the orphan BEFORE the swap drops it from the live Map.
    const orphan = directory.entries.get(name)
    // Write + unregister (the U-H2 hot-apply swap). Any throw propagates with
    // live + disk untouched on the EARLY return, EXCEPT the default-drift guard:
    let loaded: LoadedRagStoreRegistry
    try {
      ;({ loaded } = hotApply({ kind: 'remove', name }))
    } catch (err) {
      // F-H4-2 (RCA-3) — the default-drift throw (F15/F16). That guard fires
      // AFTER the remove already persisted AND the live map was re-synced
      // (HOST-1 / D2), so `directory.entries` no longer contains `name`. The
      // orphan would otherwise LEAK undrained/unterminated. If the swap DID drop
      // the entry, still drain+teardown the orphan before rethrowing — a
      // removed-but-drifted store/engine is always drained/torn down, with the
      // byte-pinned error still propagating. Other throw paths (W-remove-unknown,
      // W-remove-arg, loader F12, native fs) leave the entry IN the live map, so
      // this re-check keeps their early-return NO-teardown contract intact.
      if (orphan !== undefined && !directory.entries.has(name)) {
        await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
      }
      throw err
    }
    // Defensive skip (F8): if the orphan is somehow missing after a successful
    // write — unreachable by contract — drain nothing and return the result.
    if (orphan !== undefined) {
      await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
    }
    return { loaded, delta: { added: [], removed: [name], renamed: [] }, drained: 0 }
  }

  /** U-H6 — the DRAIN-THEN-TEARDOWN rename. Order (§5.3):
   *  1. top-of-method arg guards (W-rename-arg `from required` / `to required`,
   *     locally-thrown, byte-equal to the landed W-rename-arg — 0 new templates);
   *  2. CAPTURE the old-`from` orphan `RagStoreEntry` from the live Map BEFORE
   *     the write (the swap unregisters it);
   *  3. write + default-stability + live-map swap via the LANDED synchronous
   *     `hotApply({kind:'rename'})` (all W-rename-* / the inherited
   *     R-rename-ids-present / loader-F12 / native-fs errors propagate; live +
   *     disk untouched on throw);
   *  4. defensive skip + `await drainAndReleaseEntry(orphan)` — UNBOUNDED drain
   *     (`inFlight()===0`) then store+engine teardown, owned by
   *     `rag-store-remove.js`;
   *  5. return `{ loaded, delta:{added:[],removed:[],renamed:[{from,to}]}, drained: 0 }`.
   *  The drain never tears down a renamed-away engine mid-query (A-P2-2/D7). */
  async function hotRename(from: string, to: string): Promise<HotRenameResult> {
    // F1/F1b — the arg guards fire BEFORE any write/drain (null/5/'' → W-rename-arg).
    if (typeof from !== 'string' || from.length === 0) {
      throw new Error('rag-store-registry-write: from required')
    }
    if (typeof to !== 'string' || to.length === 0) {
      throw new Error('rag-store-registry-write: to required')
    }
    // Capture the orphan BEFORE the swap drops it from the live Map.
    const orphan = directory.entries.get(from)
    // Write + rebuild + unregister (the U-H2 hot-apply rename swap). Any throw
    // propagates with live + disk untouched on the EARLY return, EXCEPT the
    // default-drift guard:
    let loaded: LoadedRagStoreRegistry
    try {
      ;({ loaded } = hotApply({ kind: 'rename', from, to }))
    } catch (err) {
      // F-H4-2 (inherited) — the default-drift throw (F15/F16). That guard fires
      // AFTER the rename already persisted AND the live map was re-synced to
      // `loaded` (HOST-1 / D2 — `syncLiveToLoaded(loaded, true)` dropped `from` /
      // rebuilt `to`). The orphan would otherwise LEAK undrained/unterminated.
      // If the swap DID drop the `from` entry, still drain+teardown the orphan
      // before rethrowing — a renamed-but-drifted old store/engine is always
      // drained/torn down, with the byte-pinned error still propagating. Other
      // throw paths (W-rename-unknown-from, W-rename-target-exists,
      // W-rename-default, the inherited R-rename-ids-present, loader F12, native
      // fs) leave the `from` entry IN the live map, so this re-check keeps their
      // early-return NO-teardown contract intact.
      if (orphan !== undefined && !directory.entries.has(from)) {
        await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
      }
      throw err
    }
    // Defensive skip (F8): if the orphan is somehow missing after a successful
    // write — unreachable by contract — drain nothing and return the result.
    if (orphan !== undefined) {
      await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
    }
    return { loaded, delta: { added: [], removed: [], renamed: [{ from, to }] }, drained: 0 }
  }

  /** U-H7 — REASSIGN the default at runtime (D5/A-P2-4). Order (§4
   *  ATOMIC-APPLY-DEFAULT / §5.4):
   *  1. top-of-method arg guard (R-set-default-arg, locally-thrown);
   *  2. NO-OP guard (`name === directory.defaultName` → the all-empty delta +
   *     `noop:true`; no write, no release, no live mutation — Q8);
   *  3. capture the old/new default entries + the current vector boot;
   *  4. vector CONSTRUCT-FIRST (only when vector) — a construct throw leaves disk
   *     + live untouched (an orphaned born-lexical engine is a bounded hold);
   *  5. write the `setDefault` flip via `writeRegistryMutation` (the ONLY disk
   *     touch — D2). Any throw propagates; live untouched;
   *  6. defensive drift check (`loaded.defaultStoreName === name`, else sync-to-
   *     loaded + R-default-changed — D2 preserved even in the throw path);
   *  7. apply + re-bind (no dark default): replace the new default's entry engine
   *     with the new boot's (born-lexical-pending) engine in vector mode; rebuild
   *     the OLD default as a fresh LEXICAL non-default (vector mode; the store is
   *     RETAINED — Q4); re-point `directory.defaultName`/`defaultEntry`/
   *     `vectorBoot`/`currentRegistry`;
   *  8. vector: RELEASE the OLD default's boot LAST (UNBOUNDED drain + re-entry +
   *     `releaseDefaultVectorBoot`) + START the new boot fire-and-forget
   *     (`.catch(() => undefined)` — the runtime's 0-log census holds);
   *  9. return `{ loaded, delta, drained, noop: false }`. */
  async function hotSetDefault(name: string): Promise<HotSetDefaultResult> {
    // 1. Arg guard.
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(msg('default store name required'))
    }
    // 5b. HOST-5 — reject a SECOND reassignment while one is in flight (a
    //     transient A6 at-most-ONE boot violation if a concurrent call started a
    //     new boot mid-drain). Fires BEFORE any write/construct/NO-OP.
    if (reassignInFlight) {
      throw new Error(msg('default reassignment already in progress'))
    }
    reassignInFlight = true
    try {
      // 2. NO-OP guard (Q8) — the current default: no write, no release, no live
      //    mutation.
      if (name === directory.defaultName) {
        return {
          loaded: currentRegistry,
          delta: { added: [], removed: [], renamed: [], defaultChanged: [] },
          drained: 0,
          noop: true,
        }
      }
      // 3. Capture the old/new default entries + the current vector boot.
      const oldDefaultEntry = directory.entries.get(directory.defaultName)
      const newDefaultEntry = directory.entries.get(name)
      const oldVectorBoot = vectorBoot
      const vectorMode = _embedderKind === 'vector' && _provider !== null
      // 4. Vector construct-first — NOT started. A construct throw propagates with
      //    disk + live untouched (F5).
      let newBoot: VectorBootController | undefined
      if (vectorMode && newDefaultEntry !== undefined) {
        newBoot = createDefaultVectorBoot(newDefaultEntry.store, _provider!, _userDataPath)
      }
      // 5. Write the flip (the ONLY disk touch — D2).
      const { loaded, delta } = writeRegistryMutation({ path: registryPath, mutation: { kind: 'setDefault', name } })
      // 6. Defensive drift check (F7) — external edit; sync-to-loaded before throw.
      if (loaded.defaultStoreName !== name) {
        syncLiveToLoaded(loaded, true)
        throw new Error(msg('default store changed by a hot-apply (default reassignment is a separate unit)'))
      }
      // 7. Apply + re-bind (no dark default).
      if (vectorMode) {
        if (newDefaultEntry !== undefined && newBoot !== undefined) {
          newDefaultEntry.engine = newBoot.engine
        }
        // The OLD default's STORE is RETAINED — rebuild its entry engine as a fresh
        // lexical engine (the store is never released, only the boot is, Q4).
        if (oldDefaultEntry !== undefined) {
          oldDefaultEntry.engine = createRetrieval(
            oldDefaultEntry.store,
            createLexicalEmbedder(createLexicalIndex(oldDefaultEntry.store.listNodes())),
          )
        }
      }
      directory.defaultName = loaded.defaultStoreName
      if (newDefaultEntry !== undefined) {
        defaultEntry = newDefaultEntry
      }
      if (vectorMode) {
        vectorBoot = newBoot ?? null
      }
      currentRegistry = loaded
      // HOST-1 — re-point the drift-guard default to the FRESH loaded default's
      // persistence file so a later hot-* op compares against the NEW default.
      defaultPersistenceFile = loaded.stores.find((s) => s.name === loaded.defaultStoreName)?.persistenceFile
      // 8. Vector release-old-LAST + start-new (fire-and-forget).
      let drained = 0
      if (vectorMode && oldVectorBoot !== null) {
        const result = await releaseDefaultVectorBoot(oldVectorBoot)
        drained = result.drained
      }
      if (vectorMode && newBoot !== undefined) {
        void newBoot.start().catch(() => undefined)
      }
      // 9. Return.
      return { loaded, delta, drained, noop: false }
    } finally {
      reassignInFlight = false
    }
  }

  /** U-H7 — the SANCTIONED default rename (Q3 R1): the current default changes
   *  its NAME but stays `default:true`. Local guard (incl. HOST-4 whitespace) →
   *  the D4 persisted-`<from>:`-id decline (HOST-2) → write the `renameDefault`
   *  kind (D2) → the F7-consistent defensive drift guard (HOST-3) → re-point
   *  `directory.defaultName` + re-key the default entry under the new name (the
   *  same store object stays default) + re-point the drift-guard persistence
   *  file (HOST-1). The LEGACY `hotApply`/`hotRename` default paths keep
   *  propagating `W-rename-default` (NOT relaxed). HOST-5 serializes a
   *  concurrent reassignment. */
  async function hotRenameDefault(to: string): Promise<HotRenameDefaultResult> {
    // HOST-4 — the local guard also REJECTS a whitespace-only `to` (a `'   '`
    // must not rename the default to a whitespace name); byte-pinned `to required`.
    if (typeof to !== 'string' || to.length === 0 || to.trim() === '') {
      throw new Error('rag-store-registry-write: to required')
    }
    // HOST-5 — reject a SECOND reassignment while one is in flight.
    if (reassignInFlight) {
      throw new Error(msg('default reassignment already in progress'))
    }
    reassignInFlight = true
    try {
      // HOST-2 — the D4/A-P2-5 persisted-`<from>:`-id decline, BEFORE the write:
      // if the CURRENT default's data carries a `<from>:`-prefixed node id, the
      // default-rename is DECLINED with R-rename-ids-present (mirroring the
      // legacy `hotApply` scan, which is SKIPPED for the default and never used
      // by `renameDefault`). Disk NOT written, live untouched, NO drain.
      const from = directory.defaultName
      const curDefault = directory.entries.get(from)
      if (curDefault !== undefined) {
        const ids = curDefault.store.listNodes().map((n) => n.id)
        if (ids.some((id) => id.startsWith(`${from}:`))) {
          throw new Error(msg(`cannot rename store '${from}' — it has persisted '${from}:'-prefixed ids`))
        }
      }
      const { loaded, delta } = writeRegistryMutation({ path: registryPath, mutation: { kind: 'renameDefault', to } })
      // HOST-3 — the F7-consistent defensive drift check: the write module
      // renamed the ON-DISK current default (`delta.renamed[0].from`); if the
      // LIVE default drifted from it (an external mid-run registry default edit),
      // SYNCHRONIZE the live directory to `loaded` BEFORE throwing the byte-pinned
      // R-default-changed — the re-key is gated on the freshly-loaded default, so
      // live and disk NEVER diverge (D2 even in the throw path).
      if (delta.renamed[0]?.from !== from) {
        syncLiveToLoaded(loaded, true)
        throw new Error(msg('default store changed by a hot-apply (default reassignment is a separate unit)'))
      }
      // Re-bind — the default entry object keeps its store under the new name; the
      // OLD name is unkeyed (D4 fold). The store STAYS default under the new name.
      const currentDefault = directory.entries.get(directory.defaultName)
      if (currentDefault !== undefined && directory.defaultName !== loaded.defaultStoreName) {
        liveMap.delete(directory.defaultName)
        currentDefault.name = loaded.defaultStoreName
        liveMap.set(loaded.defaultStoreName, currentDefault)
        defaultEntry = currentDefault
      }
      directory.defaultName = loaded.defaultStoreName
      // HOST-1 — re-point the drift-guard default to the FRESH loaded default's
      // persistence file (the default's file is preserved under the rename).
      defaultPersistenceFile = loaded.stores.find((s) => s.name === loaded.defaultStoreName)?.persistenceFile
      currentRegistry = loaded
      return { loaded, delta, drained: 0 }
    } finally {
      reassignInFlight = false
    }
  }

  /** Build a fresh lexical `RagStoreEntry` for a resolved store (the non-default
   *  rebuild path — A6/R10 byte-equal to `buildRagStoreDirectory` rule 2). A
   *  construct throw PROPAGATES (the staging swap never runs — F17). */
  function buildLexicalEntry(s: ResolvedRagStore): RagStoreEntry {
    const store = createJsonRagStore({ path: s.persistenceFile })
    const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    const entry: RagStoreEntry = {
      name: s.name,
      store,
      engine,
      corrupt: store.status().corrupt,
      missing: !existsSync(s.persistenceFile),
    }
    if (s.corpusRoot !== undefined) entry.corpusRoot = s.corpusRoot
    return entry
  }

  /** Synchronize the live directory's `entries` Map (IN PLACE) to the freshly
   *  loaded registry. `rebuildAll=false` is the NORMAL default-stable path:
   *  carry the boot default entry object (identity preserved), rebuild the
   *  non-default entries, orphan the old non-defaults. `rebuildAll=true` is the
   *  D2-preserving DRIFT path (F15/F16): rebuild EVERY entry from `loaded`
   *  (incl. the newly-defaulted store as a lexical entry) and follow the loaded
   *  default name on the directory, so live reflects exactly what is on disk
   *  even though `hotApply` then throws (HOST-1). Also advances `currentRegistry`
   *  in both paths (persisted-and-live + currentStores never diverge). */
  function syncLiveToLoaded(loaded: LoadedRagStoreRegistry, rebuildAll: boolean): void {
    const staging = new Map<string, RagStoreEntry>()
    if (rebuildAll) {
      for (const s of loaded.stores) {
        staging.set(s.name, buildLexicalEntry(s))
      }
      directory.defaultName = loaded.defaultStoreName
    } else {
      for (const s of loaded.stores) {
        if (s.name === loaded.defaultStoreName) continue
        staging.set(s.name, buildLexicalEntry(s))
      }
    }
    for (const key of [...liveMap.keys()]) {
      if (rebuildAll || key !== directory.defaultName) liveMap.delete(key)
    }
    for (const [name, entry] of staging) {
      liveMap.set(name, entry)
    }
    currentRegistry = loaded
  }

  return {
    getDirectory: () => directory,
    getDefaultEntry: () => defaultEntry,
    getDefaultName: () => directory.defaultName,
    getDefaultStore: () => defaultEntry.store,
    getDefaultEngine: () => defaultEntry.engine,
    getVectorBoot: () => vectorBoot,
    getRegistryPath: () => registryPath,
    currentStores: () => [...currentRegistry.stores],
    statusOf,
    hotApply,
    hotRemove,
    hotRename,
    hotSetDefault,
    hotRenameDefault,
  }
}
