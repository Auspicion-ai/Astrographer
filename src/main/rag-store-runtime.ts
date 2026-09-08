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
import { createJsonRagStore, type RagStore } from './rag-store.js'
import { createLexicalEmbedder, createLexicalIndex, createRetrieval, type RetrievalEngine } from './retrieval.js'
import type { VectorBootController } from './vector-boot.js'
import type { EmbeddingProvider } from './embeddings.js'

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
  const defaultEntry: RagStoreEntry = opts.defaultEntry
  const vectorBoot: VectorBootController | null = opts.vectorBoot
  const registryPath = opts.registryPath
  const _userDataPath = opts.userDataPath
  const _embedderKind = opts.embedderKind
  const _provider = opts.provider
  let currentRegistry: LoadedRagStoreRegistry = opts.registry
  // The real underlying Map (typed ReadonlyMap at the boundary — the controller
  // is the ONLY writer, mutating it in place, D1).
  const liveMap = directory.entries as unknown as Map<string, RagStoreEntry>
  // The boot default's persistence file — captured once from the initial
  // registry so a drift in the loaded default (F16) can be detected.
  const defaultPersistenceFile = opts.registry.stores.find((s) => s.name === directory.defaultName)?.persistenceFile

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
  }
}
