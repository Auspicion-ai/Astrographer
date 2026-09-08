// tests/unit-h2-runtime-controller.test.ts — Unit U-H2a: the registry hot-apply
// RUNTIME controller (`src/main/rag-store-runtime.ts`).
//
// RED SET (RCA-1) — written BEFORE any implementation exists. The module
// `src/main/rag-store-runtime.ts` does NOT exist yet, so this file cannot even
// LOAD (missing-module import — the house red pattern); test P0 names the
// module as the explicit red marker. Every assertion below derives from
// docs/specs/unit-h2-runtime-controller.md ALONE:
//   §5.2        the exported types (RagStoreRuntimeOptions, HotApplyResult,
//               RagStoreRuntimeController)
//   §5.3        the factory createRagStoreRuntimeController(opts) + R-* guards
//   §5.4        the 10 accessors + hotApply(mutation) pinned ordering
//   §5.5        the byte-pinned R-* message set + the 0-log census
//   §5.6 H1–H12  the happy-path states (valid paths)
//   §5.7 F1–F18  the fail-states (byte-pinned messages / propagated W-set /
//               native fs family / live-untouched)
//   §4          ATOMIC-APPLY / REBUILD-ALL-OF-NON-DEFAULT / DEFAULT-STABLE /
//               NO-OP-BYTE-EQUAL / D4-NO-IDS-CALLER-PRECONDITION
//   §7          Architect ruling (hotApply seam, rebuild-all-of-non-default
//               + orphan, D4 no-ids rename precondition, refresh-on-apply)
//
// This is the U-H2a red set ONLY. The U-H2b closure-rewiring red set
// (§5.8–§5.9) is a SEPARATE cycle and is NOT authored here.
//
// Conventions follow tests/unit-h1-registry-write.test.ts and
// tests/unit-ms2-store-wiring.test.ts (vitest node environment, `.js` import
// suffix for main-process ESM modules, temp dirs via node:fs mkdtempSync +
// rmSync, byte-exact catch + toBe assertions via expectThrow). The consumed
// modules (rag-store-registry.js, rag-store-directory.js, rag-store.js,
// rag-store-registry-write.js) are already green; the RED here is the MISSING
// runtime controller. NO test touches real repo/userData paths.
//
// F17 forces the (documented unreachable) step-5 construct throw via a
// flag-passthrough createJsonRagStore mock (the h1 statSync-race idiom):
// default passthrough to the real store, flipped per-test so a staged non-
// default construct aborts the rebuild and the live Map is never swapped.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  existsSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createRagStoreRuntimeController,
  type RagStoreRuntimeOptions,
  type HotApplyResult,
  type RagStoreRuntimeController,
} from '../src/main/rag-store-runtime.js' // ← does NOT exist yet (the red marker)
import { readFileSync as readSrc } from 'node:fs'

// ---------------------------------------------------------------------------
// F17 — flag-passthrough createJsonRagStore mock (house idiom, h1 statSync).
// Default: the REAL store constructor. A test flips `throwOnConstruct` to make
// the step-5 non-default staging rebuild throw, pinning that the live Map is
// NOT swapped (staging never swapped).
// ---------------------------------------------------------------------------
const storeCtl: { throwOnConstruct: boolean; injectedMsg: string } = { throwOnConstruct: false, injectedMsg: '' }
vi.mock('../src/main/rag-store.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/main/rag-store.js')>()
  return {
    ...actual,
    createJsonRagStore: vi.fn((opts: Parameters<typeof actual.createJsonRagStore>[0]) => {
      if (storeCtl.throwOnConstruct) throw new Error(storeCtl.injectedMsg)
      return actual.createJsonRagStore(opts)
    }),
  }
})
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'
import { loadRagStoreRegistry, type LoadedRagStoreRegistry, type RagStoreConfig } from '../src/main/rag-store-registry.js'
import {
  buildRagStoreDirectory,
  type RagStoreDirectory,
  type RagStoreEntry,
} from '../src/main/rag-store-directory.js'

afterEach(() => {
  storeCtl.throwOnConstruct = false
  storeCtl.injectedMsg = ''
})

// ---------------------------------------------------------------------------
// The byte-pinned message set (§5.5) — the controller's OWN R-* family.
// ---------------------------------------------------------------------------
const RT = 'rag-store-runtime:'
const R_OPTIONS = `${RT} options required`
const R_PATH = `${RT} registryPath required`
const R_DIRECTORY = `${RT} directory required`
const R_DEFAULT_ENTRY = `${RT} default entry required`
const R_DEFAULT_MISMATCH = `${RT} default entry does not match the directory default`
const R_REGISTRY_DEFAULT = `${RT} registry default does not match the directory default`
const R_EMBEDDER = `${RT} embedderKind must be 'lexical' or 'vector'`
const R_MUTATION = `${RT} mutation required`
const R_KIND_PREFIX = `${RT} unknown mutation kind '`
const R_RENAME_IDS_PREFIX = `${RT} cannot rename store '`
const R_DEFAULT_CHANGED = `${RT} default store changed by a hot-apply (default reassignment is a separate unit)`
const R_DEFAULT_MISMATCH2 = `${RT} default entry drifted from the loaded registry`
const R_STATUS_PREFIX = `${RT} unknown store '`

// The write module's W-* family that PROPAGATES unchanged (§5.5).
const WR = 'rag-store-registry-write:'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, byte-exact message assertions).
// ---------------------------------------------------------------------------

function withDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h2-'))
  try {
    run(dir)
  } finally {
    storeCtl.throwOnConstruct = false
    storeCtl.injectedMsg = ''
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Async variant — for tests that seed a store via the async `putNode` before
 *  building the directory (the persisted file must exist before construction). */
async function withDirAsync(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h2-'))
  try {
    await run(dir)
  } finally {
    storeCtl.throwOnConstruct = false
    storeCtl.injectedMsg = ''
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Assert `run` throws an Error whose message is EXACTLY `exactMessage`. */
function expectThrow(run: () => unknown, exactMessage: string): void {
  let caught: unknown
  try {
    run()
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a throw with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

/** Assert `run` throws SOME Error (the native fs family / propagated set where
 *  the message is not byte-pinned — only the throw path is). */
function expectThrowAny(run: () => unknown, prefix?: string): void {
  let caught: unknown
  try {
    run()
  } catch (err) {
    caught = err
  }
  expect(caught).toBeInstanceOf(Error)
  if (prefix !== undefined) {
    expect((caught as Error).message.startsWith(prefix)).toBe(true)
  }
}

/** A deterministic leaf node (the ms2 makeNode idiom). */
function makeNode(id: string, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-05T00:00:00.000Z'
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

/** Write the registry file and load it through U-MS1's loader — the consumed
 *  `LoadedRagStoreRegistry` view. */
function loadRegistry(dir: string, stores: RagStoreConfig[]): LoadedRagStoreRegistry {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  return loadRagStoreRegistry({ path: regPath })
}

/** The fixture registry: `main` (default) + `research-2026-09` (non-default),
 *  on derived persistence files — the §5.6 2-store boot. */
const DEFAULT_STORES: RagStoreConfig[] = [
  { name: 'main', default: true },
  { name: 'research-2026-09' },
]
const DFLT = 'main'
const NON = 'research-2026-09'

interface RuntimeFixture {
  controller: RagStoreRuntimeController
  directory: RagStoreDirectory
  defaultEntry: RagStoreEntry
  regPath: string
  registry: LoadedRagStoreRegistry
}

/** The exact §8 boot wiring (mirroring main.ts): write+load the registry, build
 *  the directory, then wrap it in the runtime controller. */
function bootRuntime(dir: string, stores: RagStoreConfig[] = DEFAULT_STORES): RuntimeFixture {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'lexical', provider: null })
  const directory = plan.directory
  const defaultEntry = directory.entries.get(directory.defaultName)!
  const controller = createRagStoreRuntimeController({
    registry,
    directory,
    defaultEntry,
    vectorBoot: plan.vectorBoot,
    registryPath: regPath,
    userDataPath: dir,
    embedderKind: 'lexical',
    provider: null,
  })
  return { controller, directory, defaultEntry, regPath, registry }
}

/** Build a controller over a REAL non-default store that carries the given
 *  seeded node ids (persisted to the store's file). Used to seed `main` (so it
 *  is a present+clean store → 'loaded') and to seed a `<from>:`-prefixed id for
 *  the F10 D4 rename precondition. */
async function bootRuntimeWithSeededNonDefault(
  dir: string,
  seedId: string,
  stores: RagStoreConfig[] = DEFAULT_STORES,
): Promise<RuntimeFixture> {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const non = registry.stores.find((s) => s.name === NON)!
  const store: RagStore = createJsonRagStore({ path: non.persistenceFile })
  await store.putNode(makeNode(seedId, 'seeded content'))
  const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'lexical', provider: null })
  const directory = plan.directory
  const defaultEntry = directory.entries.get(directory.defaultName)!
  const controller = createRagStoreRuntimeController({
    registry,
    directory,
    defaultEntry,
    vectorBoot: plan.vectorBoot,
    registryPath: regPath,
    userDataPath: dir,
    embedderKind: 'lexical',
    provider: null,
  })
  return { controller, directory, defaultEntry, regPath, registry }
}

function entrySnapshot(dir: RagStoreDirectory): { keys: string[]; ids: Map<string, RagStoreEntry> } {
  const keys = [...dir.entries.keys()]
  const ids = new Map<string, RagStoreEntry>()
  for (const k of keys) ids.set(k, dir.entries.get(k)!)
  return { keys, ids }
}

/** Assert two entry-maps are byte-equal (same key set + same ENTRY OBJECT
 *  identity per key — a failed apply swaps nothing). */
function expectEntriesDeepEqual(a: ReturnType<typeof entrySnapshot>, dir: RagStoreDirectory): void {
  const b = entrySnapshot(dir)
  expect([...b.keys].sort()).toEqual([...a.keys].sort())
  for (const k of a.keys) {
    expect(b.ids.get(k)).toBe(a.ids.get(k))
  }
}

// ---------------------------------------------------------------------------
// §5.3 — the factory + the controller surface (P0 = the red marker).
// ---------------------------------------------------------------------------

describe('createRagStoreRuntimeController — the module + factory (§5.2/§5.3)', () => {
  it('P0 — the module exists and exports the factory (the red marker; the suite fails to LOAD before this body if the module is missing)', () => {
    // The import at the top of this file throws when `rag-store-runtime.ts`
    // does not exist, so this body never executes on the red run — naming the
    // module as the explicit RCA-1 marker.
    expect(typeof createRagStoreRuntimeController).toBe('function')
  })
})

// ---------------------------------------------------------------------------
// §5.4 — the construction guards (R-*): F1–F7.
// ---------------------------------------------------------------------------

describe('§5.4 construction guards — createRagStoreRuntimeController fails loud (F1–F7)', () => {
  it('F1 — null / 5 / "x" opts → R-options (byte-pinned)', () => {
    expectThrow(() => createRagStoreRuntimeController(null as unknown as RagStoreRuntimeOptions), R_OPTIONS)
    expectThrow(() => createRagStoreRuntimeController(5 as unknown as RagStoreRuntimeOptions), R_OPTIONS)
    expectThrow(() => createRagStoreRuntimeController('x' as unknown as RagStoreRuntimeOptions), R_OPTIONS)
  })

  it('F2 — registryPath missing or "" → R-path', () => {
    withDir((dir) => {
      const { directory, defaultEntry, registry } = bootRuntime(dir)
      for (const registryPath of [undefined as unknown as string, '']) {
        expectThrow(
          () =>
            createRagStoreRuntimeController({
              registry,
              directory,
              defaultEntry,
              vectorBoot: null,
              registryPath,
              userDataPath: dir,
              embedderKind: 'lexical',
              provider: null,
            }),
          R_PATH,
        )
      }
    })
  })

  it('F3 — null / array directory, non-Map entries, or empty defaultName → R-directory', () => {
    withDir((dir) => {
      const { directory, defaultEntry, registry, regPath } = bootRuntime(dir)
      // null directory
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory: null as unknown as RagStoreDirectory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DIRECTORY,
      )
      // array directory
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory: [] as unknown as RagStoreDirectory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DIRECTORY,
      )
      // non-Map entries
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory: { entries: {} as unknown as ReadonlyMap<string, RagStoreEntry>, defaultName: DFLT },
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DIRECTORY,
      )
      // empty defaultName
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory: { ...directory, defaultName: '' },
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DIRECTORY,
      )
    })
  })

  it('F4 — null defaultEntry → R-default-entry (byte-pinned)', () => {
    withDir((dir) => {
      const { directory, registry, regPath } = bootRuntime(dir)
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory,
            defaultEntry: null as unknown as RagStoreEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DEFAULT_ENTRY,
      )
    })
  })

  it('F5 — defaultEntry.name !== directory.defaultName, or the defaultKey maps elsewhere → R-default-mismatch', () => {
    withDir((dir) => {
      const { directory, registry, regPath } = bootRuntime(dir)
      const nonEntry = directory.entries.get(NON)!
      // defaultEntry is a DIFFERENT store entry (its name !== 'main').
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory,
            defaultEntry: nonEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DEFAULT_MISMATCH,
      )
      // Name matches but the map does not map 'main' → that object: make 'main'
      // point at the research entry in a fresh Map (the key absent/maps-elsewhere
      // half of R-default-mismatch).
      const tampered: RagStoreDirectory = {
        entries: new Map<string, RagStoreEntry>().set(DFLT, nonEntry),
        defaultName: DFLT,
      }
      const lookAlike: RagStoreEntry = { ...nonEntry, name: DFLT }
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory: tampered,
            defaultEntry: lookAlike,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_DEFAULT_MISMATCH,
      )
    })
  })

  it('F6 — registry.defaultStoreName !== directory.defaultName → R-registry-default', () => {
    withDir((dir) => {
      const { directory, defaultEntry, regPath } = bootRuntime(dir)
      const shiftedRegistry: LoadedRagStoreRegistry = {
        stores: [],
        defaultStoreName: 'research-2026-09',
        path: regPath,
        implicit: true,
        corrupt: false,
      }
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry: shiftedRegistry,
            directory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_REGISTRY_DEFAULT,
      )
    })
  })

  it('F7 — embedderKind not lexical/vector → R-embedder (byte-pinned, §5.5 table)', () => {
    withDir((dir) => {
      const { directory, defaultEntry, registry, regPath } = bootRuntime(dir)
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry,
            directory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'hybrid' as 'lexical' | 'vector',
            provider: null,
          }),
        R_EMBEDDER,
      )
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1 + H2 — NO-OP construction is byte-equal + the same live object.
// ---------------------------------------------------------------------------

describe('§5.4 accessors — NO-OP byte-equal construction (H1/H2)', () => {
  it('H1 — NO-OP construction is byte-equal: same directory/default/vectorBoot identities, no file, no log', () => {
    withDir((dir) => {
      const spies = (['log', 'info', 'warn', 'error'] as const).map((m) => vi.spyOn(console, m).mockImplementation(() => {}))
      try {
        const { controller, directory, defaultEntry } = bootRuntime(dir)
        // Baseline is snapshotted AFTER the harness `bootRuntime(dir)` writes the
        // registry file itself (the harness's own action, not the controller's),
        // so it measures that CONTROLLER CONSTRUCTION + the test body create no
        // file — the §5.6 H1 "no file" claim. (Sanctioned fixture fix, 2026-09-08.)
        const beforeFiles = readdirSync(dir).sort()
        // Identity claims (§5.6 H1).
        expect(controller.getDirectory()).toBe(directory)
        expect(controller.getDefaultEntry()).toBe(defaultEntry)
        expect(controller.getDefaultName()).toBe('main')
        expect(controller.getDefaultStore()).toBe(defaultEntry.store)
        expect(controller.getDefaultEngine()).toBe(defaultEntry.engine)
        expect(controller.getVectorBoot()).toBeNull()
        // The registry path is returned verbatim.
        expect(controller.getRegistryPath()).toBe(join(dir, 'provident-rag-stores.json'))
        // NO log line (the 0-log census — §5.5).
        expect(spies.flatMap((s) => s.mock.calls as string[][]).length).toBe(0)
        // NO file created/touched in <d> by the controller construction or the
        // accessor calls (beyond the harness-written registry file).
        expect(readdirSync(dir).sort()).toEqual(beforeFiles)
      } finally {
        for (const s of spies) s.mockRestore()
      }
    })
  })

  it('H2 — getDirectory().entries is the SAME live Map; a hotApply is visible through BOTH references without re-pointing', () => {
    withDir((dir) => {
      const { controller, directory, regPath } = bootRuntime(dir)
      const refA = controller.getDirectory()
      expect(refA).toBe(directory)
      expect(refA.entries).toBe(directory.entries)
      const before = refA.entries.has(NON)
      expect(before).toBe(true)
      // A second reader holding the captured map reference.
      const capturedEntries = directory.entries
      const result = controller.hotApply({ kind: 'remove', name: NON })
      expect(result.delta.removed).toEqual([NON])
      // Both references observe the removal WITHOUT re-pointing (D1).
      expect(refA.entries.has(NON)).toBe(false)
      expect(capturedEntries.has(NON)).toBe(false)
      expect(controller.getDirectory()).toBe(directory)
      void regPath
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H3–H12 — the happy-path states.
// ---------------------------------------------------------------------------

describe('§5.6 happy paths — hotApply add/remove/rename + accessors (H3–H12)', () => {
  it('H3 — hotAdd applies + persists + reloads (D2): loaded 3 stores, delta.added, fresh non-default objects, default identity unchanged', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const defaultBefore = controller.getDefaultStore()
      const engineBefore = controller.getDefaultEngine()
      const result: HotApplyResult = controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } })
      // Write `loaded` round-trip (D2).
      expect(result.loaded.stores.map((s) => s.name)).toEqual(['main', 'research-2026-09', 'research-2026-10'])
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)
      expect(result.delta).toEqual({ added: ['research-2026-10'], removed: [], renamed: [] })
      // The live directory now has 3 stores.
      const entries = controller.getDirectory().entries
      expect([...entries.keys()]).toEqual(['main', 'research-2026-09', 'research-2026-10'])
      expect(entries.get('research-2026-10')!.name).toBe('research-2026-10')
      // The new entry's store/engine are FRESH objects (rebuilt, not reused).
      expect(entries.get('research-2026-10')!.store).not.toBe(entries.get(NON)!.store)
      expect(typeof entries.get('research-2026-10')!.engine.query).toBe('function')
      // The DEFAULT store/engine identity is UNCHANGED (H5's invariant).
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultEngine()).toBe(engineBefore)
      // A freshly hot-ADDED store has no persisted FILE yet (the add writes only
      // the registry; createJsonRagStore opens an empty store without persisting),
      // so D7 statusOf is 'failed-missing' — NOT 'loaded'. (§5.4 / §4 D7; sanctioned
      // fixture fix, 2026-09-08 — the H3 prose only promises the add "resolves".)
      expect(controller.statusOf('research-2026-10')).toBe('failed-missing')
    })
  })

  it('H4 — hotRemove ORPHANS the non-default (D3): delta.removed, no directory entry, persistence file + journal byte-untouched on disk, default unchanged', async () => {
    await withDirAsync(async (dir) => {
      const { controller } = bootRuntime(dir)
      // Seed a node so a real persistence file exists (to byte-compare it).
      const nonPath = join(dir, 'provident-rag-research-2026-09.json')
      await createJsonRagStore({ path: nonPath }).putNode(makeNode('r1', 'orphan me'))
      const fileBefore = readFileSync(nonPath, 'utf8')
      const defaultBefore = controller.getDefaultStore()
      const result = controller.hotApply({ kind: 'remove', name: NON })
      expect(result.delta).toEqual({ added: [], removed: [NON], renamed: [] })
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
      // The store's persistence file is UNTOUCHED (byte-compare — D3 orphan; the
      // U-H1 write module structurally cannot delete it).
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
      expect(readdirSync(dir).includes('provident-rag-research-2026-09.json')).toBe(true)
      // Default entry unchanged.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe('main')
    })
  })

  it('H5 — default survives every reachable apply (add/remove/rename of NON-default): name/store/engine/vectorBoot SAME identities, default entry loaded', async () => {
    await withDirAsync(async (dir) => {
      // Seed `main`'s store file BEFORE the directory build (the H8 idiom: a
      // present+clean default store → 'loaded'), so §5.6 H5's "default entry is a
      // 'loaded' store" prose is reconciled with §4 D7 / §5.4 statusOf.
      // (Sanctioned fixture fix, 2026-09-08.)
      const regPath = join(dir, 'provident-rag-stores.json')
      writeFileSync(regPath, JSON.stringify({ version: 1, stores: DEFAULT_STORES }))
      const registry = loadRagStoreRegistry({ path: regPath })
      const mainPath = registry.stores.find((s) => s.name === 'main')!.persistenceFile
      await createJsonRagStore({ path: mainPath }).putNode(makeNode('d-main', 'main'))
      const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'lexical', provider: null })
      const directory = plan.directory
      const defaultEntry = directory.entries.get(directory.defaultName)!
      const controller = createRagStoreRuntimeController({
        registry,
        directory,
        defaultEntry,
        vectorBoot: plan.vectorBoot,
        registryPath: regPath,
        userDataPath: dir,
        embedderKind: 'lexical',
        provider: null,
      })
      const defStore = controller.getDefaultStore()
      const defEngine = controller.getDefaultEngine()
      const defBoot = controller.getVectorBoot()
      const defEntryObj = controller.getDefaultEntry()
      // add → remove → rename, all of NON-default stores.
      controller.hotApply({ kind: 'add', store: { name: 'tmp-x' } })
      controller.hotApply({ kind: 'remove', name: 'tmp-x' })
      controller.hotApply({ kind: 'rename', from: NON, to: 'research-2026-10' })
      expect(controller.getDefaultName()).toBe('main')
      expect(controller.getDefaultStore()).toBe(defStore)
      expect(controller.getDefaultEngine()).toBe(defEngine)
      expect(controller.getVectorBoot()).toBe(defBoot)
      expect(controller.getDefaultEntry()).toBe(defEntryObj)
      expect(defaultEntry.store).toBe(defStore)
      expect(controller.statusOf('main')).toBe('loaded')
    })
  })

  it('H6 — hotRename rebuilds the non-default under the new name (no <from>: ids): delta.renamed, new entry on the NEW derived file, not the old, default untouched', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const defaultBefore = controller.getDefaultStore()
      const result = controller.hotApply({ kind: 'rename', from: NON, to: 'research-2026-10' })
      expect(result.delta.renamed).toEqual([{ from: NON, to: 'research-2026-10' }])
      expect(result.delta.added).toEqual([])
      expect(result.delta.removed).toEqual([])
      const entries = controller.getDirectory().entries
      expect(entries.has('research-2026-10')).toBe(true)
      expect(entries.has(NON)).toBe(false)
      // The renamed store was REBUILT on the NEW derived persistence file.
      const renamed = result.loaded.stores.find((s) => s.name === 'research-2026-10')!
      expect(renamed.persistenceFile).toBe(join(dir, 'provident-rag-research-2026-10.json'))
      expect(renamed.default).toBe(false)
      // The default untouched.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe('main')
    })
  })

  it('H7 — currentStores reflects the current registry (A-P2-3 source): a FRESH array each call that mutating cannot affect, values match the loaded slice', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      // Boot projection.
      const bootSlice = controller.currentStores()
      expect(bootSlice.map((s) => s.name)).toEqual(['main', NON])
      const bootEntry = bootSlice.find((s) => s.name === NON)!
      expect(bootEntry.name).toBe(NON)
      expect(bootEntry.default).toBe(false)
      expect(bootEntry.persistenceFile).toBe(join(dir, 'provident-rag-research-2026-09.json'))
      // After an apply, the fresh `loaded` projection.
      controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } })
      const freshSlice = controller.currentStores()
      expect(freshSlice.map((s) => s.name)).toEqual(['main', NON, 'research-2026-10'])
      // FRESH array each call: mutating one slice cannot affect the controller.
      const s1 = controller.currentStores()
      s1.push({ name: 'evil', default: false, persistenceFile: '/evil' })
      expect(controller.currentStores().map((s) => s.name)).toEqual(['main', NON, 'research-2026-10'])
      void bootSlice
    })
  })

  it('H8 — statusOf matrix over the live entries: loaded / failed-missing / failed-corrupt', async () => {
    await withDirAsync(async (dir) => {
      // A 3-store boot: main (present+clean store → loaded), a missing-file
      // store (→ failed-missing), a corrupt-file store (→ failed-corrupt).
      const regPath = join(dir, 'provident-rag-stores.json')
      writeFileSync(
        regPath,
        JSON.stringify({
          version: 1,
          stores: [
            { name: 'main', default: true },
            { name: 'missing-store' },
            { name: 'corrupt-store' },
          ],
        }),
      )
      const registry = loadRagStoreRegistry({ path: regPath })
      // main → present + clean (await so the persistence file exists before the
      // directory build reads it).
      await createJsonRagStore({ path: registry.stores[0].persistenceFile }).putNode(makeNode('n-main', 'main'))
      // corrupt-store → present but corrupt.
      writeFileSync(registry.stores[2].persistenceFile, '{garbage')
      const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'lexical', provider: null })
      const directory = plan.directory
      const controller = createRagStoreRuntimeController({
        registry,
        directory,
        defaultEntry: directory.entries.get(directory.defaultName)!,
        vectorBoot: plan.vectorBoot,
        registryPath: regPath,
        userDataPath: dir,
        embedderKind: 'lexical',
        provider: null,
      })
      // The live-entry flags drive the D7 storeLoadStatus matrix.
      expect(directory.entries.get('main')!.missing).toBe(false)
      expect(controller.statusOf('main')).toBe('loaded')
      expect(directory.entries.get('missing-store')!.missing).toBe(true)
      expect(controller.statusOf('missing-store')).toBe('failed-missing')
      expect(directory.entries.get('corrupt-store')!.corrupt).toBe(true)
      expect(controller.statusOf('corrupt-store')).toBe('failed-corrupt')
    })
  })

  it('H9 — writeRegistryMutation re-reads the CURRENT disk and applies it (D2/D8): an external edit is NOT observed until a hotApply, then it is', () => {
    withDir((dir) => {
      const { controller, regPath } = bootRuntime(dir)
      // External tool edits the registry file (adds a store) — the idle runtime
      // re-reads NOTHING (D8).
      writeFileSync(
        regPath,
        JSON.stringify({ version: 1, stores: [...DEFAULT_STORES, { name: 'research-2026-10' }] }),
      )
      expect(controller.currentStores().map((s) => s.name)).toEqual(['main', NON])
      // A hotApply reads the CURRENT disk state and applies it on top.
      const result = controller.hotApply({ kind: 'add', store: { name: 'alpha-2026' } })
      expect(result.loaded.stores.map((s) => s.name)).toEqual(['main', NON, 'research-2026-10', 'alpha-2026'])
      expect(controller.currentStores().map((s) => s.name)).toEqual(['main', NON, 'research-2026-10', 'alpha-2026'])
      expect(controller.getDirectory().entries.has('research-2026-10')).toBe(true)
    })
  })

  it('H10 — HotApplyResult shape: loaded implicit:false/corrupt:false, delta has exactly ONE non-empty member', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const result = controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } })
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)
      expect(result.loaded.path).toBe(join(dir, 'provident-rag-stores.json'))
      const nonEmpty = [result.delta.added.length, result.delta.removed.length, result.delta.renamed.length].filter(
        (n) => n > 0,
      )
      expect(nonEmpty.length).toBe(1)
      expect(result.delta.added).toEqual(['research-2026-10'])
    })
  })

  it('H11 — a FAILED hotApply (write-module throw) leaves the live map AND the registry file byte-identical (R1/D2)', () => {
    withDir((dir) => {
      const { controller, directory } = bootRuntime(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      // W-rename-default (the default cannot be renamed — U-H1 rejects first).
      let caught: unknown
      try {
        controller.hotApply({ kind: 'rename', from: DFLT, to: 'x' })
      } catch (err) {
        caught = err
      }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(
        `${WR} the default store cannot be renamed (default reassignment is a separate unit)`,
      )
      // Live untouched + disk untouched.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
    })
  })

  it('H12 — determinism / no-live-mutation-of-inputs: equivalent mutations yield equivalent results and the mutation object is never mutated', () => {
    withDir((dir) => {
      const mutation = { kind: 'add' as const, store: { name: 'research-2026-10' } }
      const snapshotBefore = JSON.stringify(mutation)
      const { controller } = bootRuntime(dir)
      const r1 = controller.hotApply({ kind: 'add', store: { name: 'research-2026-11' } })
      const r2 = controller.hotApply({ kind: 'add', store: { name: 'research-2026-12' } })
      // Equivalent SHAPE of results (each a valid write round-trip).
      expect(r1.delta).toEqual({ added: ['research-2026-11'], removed: [], renamed: [] })
      expect(r2.delta).toEqual({ added: ['research-2026-12'], removed: [], renamed: [] })
      // The mutation argument object was never mutated by the controller.
      expect(JSON.stringify(mutation)).toBe(snapshotBefore)
      expect(mutation.kind).toBe('add')
      expect(mutation.store).toEqual({ name: 'research-2026-10' })
      // Two applications against the SAME current disk state are deterministic.
      expect(r1.loaded.stores.map((s) => s.name)).toEqual(['main', NON, 'research-2026-11'])
      expect(r2.loaded.stores.map((s) => s.name)).toEqual(['main', NON, 'research-2026-11', 'research-2026-12'])
    })
  })
})

// ---------------------------------------------------------------------------
// §5.4 hotApply ordering (validate → D4 inspect → writeRegistryMutation →
// construct-fully-then-insert → one-pass swap → { loaded, delta }).
// ---------------------------------------------------------------------------

describe('§4 ATOMIC-APPLY order — validate → D4 inspect → write → construct-all → swap', () => {
  it('P1 — validation and the D4 inspect run BEFORE writeRegistryMutation (disk never touched), and write errors propagate leaving disk+live untouched', () => {
    withDir((dir) => {
      const { controller, regPath } = bootRuntime(dir)
      const regBefore = readFileSync(regPath, 'utf8')
      const before = entrySnapshot(controller.getDirectory())
      // (1) VALIDATE first: an invalid kind is rejected with the disk untouched.
      expectThrow(() => controller.hotApply({ kind: 'delete' } as never), `${R_KIND_PREFIX}delete'`)
      expect(readFileSync(regPath, 'utf8')).toBe(regBefore)
      expectEntriesDeepEqual(before, controller.getDirectory())
      // (2) D4 inspect second: a rename of the DEFAULT store never reaches the
      // write's disk; the runtime rejects it as R-rename-ids-present only when
      // `from` has <from>:-prefixed ids — the MISSING `from` store falls through
      // to the write module's W-rename-unknown-from, which still leaves disk
      // untouched. Here we rename an EXISTING clean non-default → the write runs
      // and returns a result (writeRegistryMutation IS reached on a clean rename).
      const r = controller.hotApply({ kind: 'rename', from: NON, to: 'research-2026-10' })
      expect(r.delta.renamed).toEqual([{ from: NON, to: 'research-2026-10' }])
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 F8–F18 — the fail-states (byte-pinned messages + propagated W-set).
// ---------------------------------------------------------------------------

describe('§5.7 fail-states — hotApply mutation guards + propagated W-set (F8–F13, F18)', () => {
  it('F8 — hotApply(null)/hotApply({kind:"delete"}) → R-mutation / R-kind; live-untouched', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const before = entrySnapshot(controller.getDirectory())
      expectThrow(() => controller.hotApply(null as never), R_MUTATION)
      expectThrow(() => controller.hotApply({ kind: 'delete' } as never), `${R_KIND_PREFIX}delete'`)
      expectEntriesDeepEqual(before, controller.getDirectory())
    })
  })

  it('F9 — rename of the DEFAULT store → W-rename-default PROPAGATES; live-untouched; disk untouched', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const before = entrySnapshot(controller.getDirectory())
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      expectThrow(
        () => controller.hotApply({ kind: 'rename', from: DFLT, to: 'x' }),
        `${WR} the default store cannot be renamed (default reassignment is a separate unit)`,
      )
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
    })
  })

  it('F10 — rename whose CURRENT store has <from>:-prefixed ids → R-rename-ids-present (D4 caller precondition, BEFORE any disk write)', async () => {
    await withDirAsync(async (dir) => {
      // Seed the non-default store with a node id carrying the `research-2026-09:`
      // prefix — the STORE-DATA probe the D4 precondition inspects.
      const { controller, directory, regPath } = await bootRuntimeWithSeededNonDefault(
        dir,
        'research-2026-09:doc-1',
      )
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(regPath, 'utf8')
      expectThrow(
        () => controller.hotApply({ kind: 'rename', from: NON, to: 'z' }),
        `${R_RENAME_IDS_PREFIX}${NON}' — it has persisted '${NON}:'-prefixed ids`,
      )
      // DISK NOT WRITTEN (byte-compare — the D4 check ran before the write).
      expect(readFileSync(regPath, 'utf8')).toBe(regBefore)
      // live-untouched; the non-default entry is still present under its old name.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(directory.entries.has(NON)).toBe(true)
      expect(directory.entries.has('z')).toBe(false)
    })
  })

  it('F11 — hotApply remove of an UNKNOWN store → W-remove-unknown PROPAGATES; live-untouched; disk untouched', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const before = entrySnapshot(controller.getDirectory())
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      expectThrow(() => controller.hotApply({ kind: 'remove', name: 'nope' }), `${WR} cannot remove unknown store 'nope'`)
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
    })
  })

  it('F12 — hotApply add of an ALREADY-PRESENT store → W-add-existing PROPAGATES; live-untouched; disk untouched', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      const before = entrySnapshot(controller.getDirectory())
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      expectThrow(
        () => controller.hotApply({ kind: 'add', store: { name: NON } }),
        `${WR} store '${NON}' already exists`,
      )
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
    })
  })

  it('F13 — hotApply against a CORRUPT registry file → W-unreadable PROPAGATES; live-untouched; disk untouched', () => {
    withDir((dir) => {
      const { controller, directory, regPath } = bootRuntime(dir)
      const before = entrySnapshot(directory)
      // Corrupt the registry file AFTER construction (the idle runtime re-reads
      // nothing; the next write hits the corrupt file).
      writeFileSync(regPath, '{not json')
      const beforeBytes = readFileSync(regPath, 'utf8')
      expectThrow(
        () => controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } }),
        `${WR} registry file unreadable (${regPath}); refusing to mutate a corrupt registry`,
      )
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(beforeBytes)
    })
  })

  it('F14 — hotApply whose persist hits a native fs failure (EACCES/EISDIR) → the NATIVE Error PROPAGATES; live-untouched; original file intact', () => {
    withDir((dir) => {
      const { controller, directory, regPath } = bootRuntime(dir)
      const before = entrySnapshot(directory)
      const beforeBytes = readFileSync(regPath, 'utf8')
      // Make the temp write fail natively: `path + ".tmp"` becomes an existing
      // DIRECTORY, so writeFileSync on it throws a native fs Error (EISDIR).
      mkdirSync(`${regPath}.tmp`, { recursive: true })
      let caught: unknown
      try {
        controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } })
      } catch (err) {
        caught = err
      }
      // A NATIVE fs error propagates (message native — NOT a pinned R-* / W-*).
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message.startsWith('EISDIR') || (caught as Error).message.startsWith('EACCES')).toBe(true)
      // live-untouched + the ORIGINAL file intact (R1).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(beforeBytes)
    })
  })

  it('F18 — statusOf(gone) → R-status-unknown (byte-pinned)', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      expectThrow(() => controller.statusOf('gone'), `${R_STATUS_PREFIX}gone'`)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 F15–F17 — the defensive / unreachable-by-construction fail-states.
// ---------------------------------------------------------------------------

describe('§5.7 fail-states — defensive + construct-throw (F15–F17)', () => {
  it('F15 — a hotApply whose loaded.defaultStoreName differs → R-default-changed (defensive, unreachable via U-H1)', () => {
    withDir((dir) => {
      const { controller, regPath } = bootRuntime(dir)
      // Force the disk default to differ from the boot directory default: an
      // external edit makes `research-2026-09` the default. The next hotApply
      // writes it through (writeRegistryMutation re-reads the disk) and the
      // controller's step-4 defensive check fires.
      writeFileSync(
        regPath,
        JSON.stringify({ version: 1, stores: [{ name: 'main' }, { name: 'research-2026-09', default: true }] }),
      )
      expectThrow(() => controller.hotApply({ kind: 'add', store: { name: 'x1-2026' } }), R_DEFAULT_CHANGED)
    })
  })

  it('F16 — the carried default entry drifts from the loaded default → R-default-mismatch2 (defensive)', () => {
    withDir((dir) => {
      const { controller, regPath } = bootRuntime(dir)
      // Force the loaded default store to resolve onto a DIFFERENT persistence
      // file than the boot default entry carried across.
      writeFileSync(
        regPath,
        JSON.stringify({
          version: 1,
          stores: [
            { name: 'main', default: true, persistenceFile: join(dir, 'other-main.json') },
            { name: 'research-2026-09' },
          ],
        }),
      )
      expectThrow(() => controller.hotApply({ kind: 'add', store: { name: 'x2-2026' } }), R_DEFAULT_MISMATCH2)
    })
  })

  it('F17 — a non-default construct throws during the staging rebuild → the underlying Error PROPAGATES; the live Map is NOT mutated (staging never swapped)', () => {
    withDir((dir) => {
      const { controller, directory } = bootRuntime(dir)
      const before = entrySnapshot(directory)
      // Flip the store-construct mock so the step-5 staged non-default rebuild
      // throws (the documented unreachable-by-construction path — R-construct).
      storeCtl.throwOnConstruct = true
      storeCtl.injectedMsg = 'F17 injected store construct failure'
      let caught: unknown
      try {
        controller.hotApply({ kind: 'add', store: { name: 'research-2026-10' } })
      } catch (err) {
        caught = err
      } finally {
        storeCtl.throwOnConstruct = false
        storeCtl.injectedMsg = ''
      }
      // The native/constructor Error PROPAGATES (R-construct — not pinned).
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe('F17 injected store construct failure')
      // The live Map is NOT mutated (the staging swap never happened).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(controller.getDirectory().entries.has('research-2026-10')).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// The D6 / A-P2-8 negative pins (grep/structure level — the module defines NO
// MCP tool, NO IPC channel, NO teardown/close/destroy primitive, NO electron
// import, and emits ZERO console output).
// ---------------------------------------------------------------------------

describe('§5.1/§5.7 negative pins — D6, A-P2-8, no-electron, 0-log (structure scans)', () => {
  const RUNTIME_SRC = fileURLToPath(new URL('../src/main/rag-store-runtime.ts', import.meta.url))

  it('N1 — the module exists, exports the factory, and defines NO teardown/close/destroy primitive and NO electron import', () => {
    const src = readSrc(RUNTIME_SRC, 'utf8')
    // The exported factory must exist.
    expect(src).toMatch(/export\s+function\s+createRagStoreRuntimeController/)
    // No electron import (structural — §5.1 "NO Electron import").
    expect(src).not.toMatch(/['"]electron['"]/)
    // No teardown primitive (A-P2-8 — U-H5 owns teardown).
    expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)
  })

  it('N2 — the module defines NO MCP tool name, NO IPC channel, no import of no-remove primitives, and emits ZERO console output', () => {
    const src = readSrc(RUNTIME_SRC, 'utf8')
    // No MCP / IPC surface (D6).
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    // No removal/teardown fs primitive (D3 — the store file is NEVER deleted).
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove)\s*\(/)
    // ZERO console output (the 0-log census, §5.5).
    expect(src).not.toMatch(/console\./)
  })
})

// ---------------------------------------------------------------------------
// RCA-3 host findings regression (2026-09-08): HOST-1 (D2 divergence after the
// post-write F15/F16 defensive throws), HOST-2 (D4 no-ids scan must not preempt
// the default-rename W-rename-default), HOST-3 (R-registry-default guard gap for
// malformed `registry.stores`).
// ---------------------------------------------------------------------------

describe('§5.4/§5.7 RCA-3 host-findings regression — D2 preservation, default-rename priority, R-registry-default guard (HOST-1/2/3)', () => {
  it('HOST-1a — a default-NAME-drift apply (F15) throws R-default-changed but SYNCHRONIZES the live directory to the freshly-loaded `loaded` (D2: persisted==live even in the throw path)', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      // External mid-run default edit: `research-2026-09` becomes the on-disk
      // default. The next hotApply writes it through, then the step-4 defensive
      // check FIRES AFTER the write persisted — so the live directory MUST be
      // synced to `loaded` before the throw (D2).
      writeFileSync(
        join(dir, 'provident-rag-stores.json'),
        JSON.stringify({
          version: 1,
          stores: [{ name: 'main' }, { name: 'research-2026-09', default: true }],
        }),
      )
      let caught: unknown
      try {
        controller.hotApply({ kind: 'add', store: { name: 'x1-2026' } })
      } catch (err) {
        caught = err
      }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_DEFAULT_CHANGED)
      // The live directory reflects the on-disk `loaded` projection — the added
      // store AND the new on-disk default are now visible live, even though the
      // apply THREW (persisted-and-live never diverge).
      expect([...controller.getDirectory().entries.keys()]).toEqual(['main', 'research-2026-09', 'x1-2026'])
      expect(controller.getDefaultName()).toBe('research-2026-09')
      expect(controller.getDirectory().entries.has('x1-2026')).toBe(true)
      // The default-driven status resolves against the on-disk default store
      // (no matching persistence file, so a rebuilt-empty store → failed-missing).
      expect(controller.statusOf('research-2026-09')).toBe('failed-missing')
      // currentStores() follows the fresh `loaded` registry too.
      expect(controller.currentStores().map((s) => s.name)).toEqual(['main', 'research-2026-09', 'x1-2026'])
    })
  })

  it('HOST-1b — a default persistenceFile drift (F16) throws R-default-mismatch2 but SYNCHRONIZES the live directory to `loaded` (D2 preserved)', () => {
    withDir((dir) => {
      const { controller } = bootRuntime(dir)
      // External edit: the on-disk `main` default now resolves onto a DIFFERENT
      // persistence file than the boot default entry carried across.
      writeFileSync(
        join(dir, 'provident-rag-stores.json'),
        JSON.stringify({
          version: 1,
          stores: [
            { name: 'main', default: true, persistenceFile: join(dir, 'other-main.json') },
            { name: 'research-2026-09' },
          ],
        }),
      )
      let caught: unknown
      try {
        controller.hotApply({ kind: 'add', store: { name: 'x2-2026' } })
      } catch (err) {
        caught = err
      }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_DEFAULT_MISMATCH2)
      // Live directory synchronized to the on-disk loaded projection.
      expect(controller.getDefaultName()).toBe('main')
      expect([...controller.getDirectory().entries.keys()]).toEqual(['main', 'research-2026-09', 'x2-2026'])
      expect(controller.getDirectory().entries.has('x2-2026')).toBe(true)
      expect(controller.currentStores().map((s) => s.name)).toEqual(['main', 'research-2026-09', 'x2-2026'])
    })
  })

  it('HOST-2 — a rename of a POPULATED default store (seeded `<default>:`-prefixed id) throws the write module\'s W-rename-default, NOT R-rename-ids-present (the D4 no-ids scan is skipped for the default rename)', async () => {
    await withDirAsync(async (dir) => {
      const regPath = join(dir, 'provident-rag-stores.json')
      writeFileSync(regPath, JSON.stringify({ version: 1, stores: DEFAULT_STORES }))
      const registry = loadRagStoreRegistry({ path: regPath })
      const mainPath = registry.stores.find((s) => s.name === DFLT)!.persistenceFile
      // Seed the DEFAULT store with a `main:`-prefixed id so a naive D4 scan
      // would (wrongly) preempt the default-rename with R-rename-ids-present.
      await createJsonRagStore({ path: mainPath }).putNode(makeNode('main:doc-1', 'default id'))
      const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'lexical', provider: null })
      const directory = plan.directory
      const controller = createRagStoreRuntimeController({
        registry,
        directory,
        defaultEntry: directory.entries.get(directory.defaultName)!,
        vectorBoot: plan.vectorBoot,
        registryPath: regPath,
        userDataPath: dir,
        embedderKind: 'lexical',
        provider: null,
      })
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(regPath, 'utf8')
      expectThrow(
        () => controller.hotApply({ kind: 'rename', from: DFLT, to: 'x' }),
        `${WR} the default store cannot be renamed (default reassignment is a separate unit)`,
      )
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(regBefore)
    })
  })

  it('HOST-3 — construction with a malformed `registry.stores` (undefined or []) → R-registry-default (fail-loud, never a raw TypeError)', () => {
    withDir((dir) => {
      const { directory, defaultEntry, registry, regPath } = bootRuntime(dir)
      // stores: undefined (defaultStoreName still matches — isolates the
      // Array.isArray stores guard).
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry: { ...registry, stores: undefined as unknown as LoadedRagStoreRegistry['stores'] },
            directory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_REGISTRY_DEFAULT,
      )
      // stores: [] (defaultStoreName matches, but no resolvable default entry —
      // isolates the resolvable-default requirement).
      expectThrow(
        () =>
          createRagStoreRuntimeController({
            registry: { ...registry, stores: [] as unknown as LoadedRagStoreRegistry['stores'] },
            directory,
            defaultEntry,
            vectorBoot: null,
            registryPath: regPath,
            userDataPath: dir,
            embedderKind: 'lexical',
            provider: null,
          }),
        R_REGISTRY_DEFAULT,
      )
    })
  })
})
