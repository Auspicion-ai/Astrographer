// tests/unit-h4-hot-remove.test.ts — Unit U-H4: the DRAIN-THEN-TEARDOWN hot-
// remove (`RagStoreRuntimeController.hotRemove(name)` + the new orchestration
// module `src/main/rag-store-remove.ts` `drainAndReleaseEntry`).
//
// RED SET (RCA-1) — written BEFORE any U-H4 implementation exists. The new
// module `src/main/rag-store-remove.ts` does NOT exist, so this file cannot
// even LOAD (the `import { drainAndReleaseEntry }` at the top throws — the
// house red pattern, §5.9(i)); test M-new + P0 name the module and the
// `hotRemove` method as the explicit red markers. On the red run, the pre-U-H4
// `hotApply({kind:'remove'})` ORPHANS (it never drains/tears down), so every
// H1–H6 body that asserts teardown/unregister/strand would ALSO fail — but the
// suite fails EARLIER, at load, on the missing orchestration surface (§5.9).
//
// Every assertion derives from docs/specs/unit-h4-hot-remove.md ALONE:
//   §5.1        the ADDITIVE surface (RagStoreRuntimeController.hotRemove +
//               HotRemoveResult)
//   §5.2        the NEW module (drainAndReleaseEntry, RemovedEntry,
//               RemovedEntryReleaseResult)
//   §5.3        hotRemove exact ordering (capture BEFORE write → hotApply →
//               defensive skip → drain+teardown → return)
//   §5.4        drainAndReleaseEntry exact behavior (inFlight()===0 gate →
//               store.teardown() → engine.teardown(); D3 strand)
//   §5.5        the byte-pinned propagated error set (W-remove-unknown,
//               W-remove-arg, loader F12, native fs)
//   §5.6 H1–H6  the happy-path states
//   §5.7 F1–F8  the fail-states
//   §5.8        the negative pins D6/A-P2-7/A-P2-8/D3 (incl. the N1 re-pin:
//               rag-store-runtime.ts keeps NO `teardown(` literal)
//   §7          Architect ruling — Q1 option (b): separate module + additive
//               `hotRemove`; the runtime references only `drainAndReleaseEntry(`
//               (no lowercase `teardown`), so N1/A-P2-8 STAY GREEN. Q4 — the
//               drain is UNBOUNDED.
//
// Conventions follow tests/unit-h2-runtime-controller.test.ts +
// tests/unit-h5-teardown.test.ts (vitest node environment, `.js` import suffix
// for the main-process ESM modules, temp dirs via node:fs mkdtempSync +
// rmSync, byte-exact message assertions). NO test touches real repo/userData
// paths.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync as readSrc } from 'node:fs'
import {
  createRagStoreRuntimeController,
  type HotApplyResult,
  type RagStoreRuntimeController,
} from '../src/main/rag-store-runtime.js'
// U-H4 — the NEW orchestration module (does NOT exist on the pre-U-H4 code;
// this import throws at load — the §5.9(i) red marker).
import { drainAndReleaseEntry, type RemovedEntryReleaseResult } from '../src/main/rag-store-remove.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { loadRagStoreRegistry, type LoadedRagStoreRegistry, type RagStoreConfig } from '../src/main/rag-store-registry.js'
import { buildRagStoreDirectory, type RagStoreDirectory, type RagStoreEntry } from '../src/main/rag-store-directory.js'
import type { Embedder, RetrievalEngine } from '../src/main/retrieval.js'

// ---------------------------------------------------------------------------
// The byte-pinned message set (§5.5 — ALL propagated from LANDED sets; U-H4
// introduces ZERO new message templates).
// ---------------------------------------------------------------------------
const RT = 'rag-store-runtime:'
const WR = 'rag-store-registry-write:'
const REG = 'rag-store-registry:'

const W_REMOVE_UNKNOWN = (name: string): string => `${WR} cannot remove unknown store '${name}'`
// W-remove-arg — the write module's `name required` (the U-H4 §5.7 F1 pin).
const W_REMOVE_ARG = `${WR} name required`
// Loader F12 — removing the ONLY default:true store leaves zero → the loader's
// exactly-one-default rule (there is NO dedicated `W-remove-default` message).
const LOADER_F12_ZERO_DEFAULTS = `${REG} exactly one store must have default: true (found 0)`
const R_STATUS_UNKNOWN = (name: string): string => `${RT} unknown store '${name}'`
// §5.4/§5.7 HOST-1 — the default-drift defensive throws (F15/F16), the F-H4-2
// orphan-leak throw path (the swap already applied + the live map was synced).
const R_DEFAULT_CHANGED = `${RT} default store changed by a hot-apply (default reassignment is a separate unit)`
const R_DEFAULT_MISMATCH2 = `${RT} default entry drifted from the loaded registry`
const TD_STORE = 'rag store: torn down'
const TD_ENGINE = 'retrieval engine: torn down'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, byte-exact message assertions).
// ---------------------------------------------------------------------------

/** Async helper — seeds stores before the directory is built, cleans up. */
async function withDirAsync(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h4-'))
  try {
    await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Assert `run` throws SYNC an Error whose message is EXACTLY `exactMessage`. */
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

/** Assert `run` throws SOME Error (the native fs family — only the throw path
 *  is pinned). */
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
  const now = '2026-09-08T00:00:00.000Z'
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

/** A deferred we control, so a `query()` can be held pending (resolved) or
 *  rejected — the deterministic interleaving point for the drain tests. */
function makeDeferred(): { promise: Promise<void>; resolve(): void; reject(e: Error): void } {
  let resolve!: () => void
  let reject!: (e: Error) => void
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

/** An embedder whose `score` is gated on a deferred — used to hold a query
 *  in-flight on the orphan engine so the drain gate's `inFlight()===0` is
 *  observable (A-P2-2). */
function makeDeferredEmbedder(d: { promise: Promise<void> }): Embedder {
  return {
    async score() { await d.promise; return [] },
    async place() { return { ok: false as const, reason: 'no-match' as const } },
  }
}

// ---------------------------------------------------------------------------
// The fixture registry: `main` (default) + `research-2026-09` (non-default),
// on derived persistence files — the §5.6 2-store boot. H4 uses a 3-store
// variant by appending `research-2026-10`.
// ---------------------------------------------------------------------------
const DEFAULT_STORES: RagStoreConfig[] = [
  { name: 'main', default: true },
  { name: 'research-2026-09' },
]
const THREE_STORES: RagStoreConfig[] = [
  { name: 'main', default: true },
  { name: 'research-2026-09' },
  { name: 'research-2026-10' },
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

/** Boot over a registry whose NON-default store has been SEEDED (so a real
 *  persistence file exists — the §5.6 strand byte-compare), returning the
 *  fixture + the seeded non-default entry (the orphan H1/H2/H3 drain). */
async function bootSeeded(
  dir: string,
  seedId = 'r1',
  stores: RagStoreConfig[] = DEFAULT_STORES,
): Promise<RuntimeFixture & { orphan: RagStoreEntry; nonPath: string }> {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const non = registry.stores.find((s) => s.name === NON)!
  await createJsonRagStore({ path: non.persistenceFile }).putNode(makeNode(seedId, 'seeded content'))
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
  const orphan = directory.entries.get(NON)!
  return { controller, directory, defaultEntry, regPath, registry, orphan, nonPath: non.persistenceFile }
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

/** The module + source-file markers for the §5.8 negative pins. */
const RUNTIME_SRC = fileURLToPath(new URL('../src/main/rag-store-runtime.ts', import.meta.url))
const REMOVE_SRC = fileURLToPath(new URL('../src/main/rag-store-remove.ts', import.meta.url))

// ---------------------------------------------------------------------------
// P0 + M-new — the RCA-1 red markers (the module is absent → the suite fails
// to LOAD before any body; these name the missing surface explicitly).
// ---------------------------------------------------------------------------

describe('P0 — the U-H4 additive orchestration surface is ABSENT on the pre-U-H4 code (RCA-1 red marker)', () => {
  it('P0 — the runtime controller exposes hotRemove(name): Promise<HotRemoveResult> (ABSENT → fails)', () => {
    withDirAsync(async (dir) => {
      const { controller } = bootRuntime(dir)
      // §5.1 — the ADDITIVE async method. `undefined` today (red marker; the
      // U-H2 orphan `hotApply({kind:"remove"})` is the ONLY remove path).
      expect(typeof (controller as RagStoreRuntimeController & { hotRemove?: unknown }).hotRemove).toBe('function')
    })
  })

  it('M-new — the U-H4 drain+teardown module rag-store-remove.ts EXISTS, exports drainAndReleaseEntry, and carries the D3/D6 negative pins (ABSENT → fails)', () => {
    // §5.2 — the NEW module. `existsSync` is false today (red marker ii/iii).
    expect(existsSync(REMOVE_SRC)).toBe(true)
    const src = readSrc(REMOVE_SRC, 'utf8')
    expect(src).toMatch(/export\s+async\s+function\s+drainAndReleaseEntry/)
    // D3 — the module imports NO delete primitive (the file is NEVER deleted).
    expect(src).not.toMatch(/\b(unlink|rmdir|rm|remove)\s*\(/)
    // D6 / A-P2-7 — no MCP tool / IPC surface in the orchestration module.
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    // §5.5 — ZERO console output.
    expect(src).not.toMatch(/console\./)
  })

  it('co-existence — hotApply({kind:"remove"}) (U-H2 ORPHAN) STILL WORKS unchanged (delta.removed, entry unregistered, file stranded)', async () => {
    // §7 Q2 — co-existence: the landed synchronous orphan path is UNCHANGED.
    // This must stay GREEN both on the red run (U-H2 behavior) and post-
    // implementation (U-H4 keeps it untouched).
    await withDirAsync(async (dir) => {
      const { controller, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      const defaultBefore = controller.getDefaultStore()
      const result: HotApplyResult = controller.hotApply({ kind: 'remove', name: NON })
      expect(result.delta).toEqual({ added: [], removed: [NON], renamed: [] })
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
      // D3 orphan — the store's persistence file is UNTOUCHED (byte-compare).
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1–H2 — remove a present, IDLE non-default → drained + teardown +
// unregistered + file stranded.
// ---------------------------------------------------------------------------

describe('§5.6 H1–H2 — hotRemove drains + tears down + unregisters an idle non-default; the file strands (D7/D3)', () => {
  it('H1 — hotRemove("research-2026-09") resolves {loaded, delta:{added:[],removed:[name],renamed:[]}, drained:0}; the entry is gone from EVERY accessor; the file STRANDED byte-identical; the default UNCHANGED', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      const defaultBefore = controller.getDefaultStore()
      const defaultEngineBefore = controller.getDefaultEngine()

      const result = await (controller as unknown as { hotRemove(name: string): Promise<{ loaded: LoadedRagStoreRegistry; delta: { added: string[]; removed: string[]; renamed: { from: string; to: string }[] }; drained: number }> }).hotRemove(NON)

      // §5.1/§7 Q3 return shape.
      expect(result.delta).toEqual({ added: [], removed: [NON], renamed: [] })
      expect(result.drained).toBe(0)
      // The fresh `loaded` (D2 round-trip) no longer lists the removed store.
      expect(result.loaded.stores.map((s) => s.name)).toEqual([DFLT])
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)

      // UNREGISTER-EVERYWHERE: live entries Map + every runtime accessor.
      expect(directory.entries.get(NON)).toBeUndefined()
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
      expect(controller.currentStores().map((s) => s.name)).toEqual([DFLT])
      expect(() => controller.statusOf(NON)).toThrow(R_STATUS_UNKNOWN(NON))

      // D3 — the persistence file is STRANDED byte-identical (never deleted).
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
      expect(readdirSync(dir).includes('provident-rag-research-2026-09.json')).toBe(true)

      // The DEFAULT entry is untouched (DEFAULT-STABLE) — SAME object identity.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultEngine()).toBe(defaultEngineBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('H2 — the removed engine + store are GENUINELY torn down: query throws "retrieval engine: torn down"; putNode throws "rag store: torn down"; reads still resolve; the stranded file still loads', async () => {
    await withDirAsync(async (dir) => {
      const { orphan, nonPath } = await bootSeeded(dir)
      const engine: RetrievalEngine = orphan.engine
      const store: RagStore = orphan.store
      const before = readFileSync(nonPath, 'utf8')

      // Drain + teardown the orphan directly (module-level §5.4 behavior).
      const release = await drainAndReleaseEntry({ store, engine })
      expect((release as RemovedEntryReleaseResult).drained).toBe(0)

      // ENGINE-STOP-SERVING — post-teardown query fails loud.
      let qErr: unknown
      try { await engine.query('x') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)

      // STORE-TEARDOWN-REVOKES-MUTATION-ONLY — mutations fail loud...
      let pErr: unknown
      try { await store.putNode(makeNode('x2', 'nope')) } catch (e) { pErr = e }
      expect(pErr).toBeInstanceOf(Error)
      expect((pErr as Error).message).toBe(TD_STORE)

      // ...reads STILL resolve (read-safe teardown).
      expect(store.getNode('r1')?.id).toBe('r1')

      // The stranded file is byte-identical and a FRESH store over it still
      // serves the same nodes (the data was never deleted — D3).
      expect(readFileSync(nonPath, 'utf8')).toBe(before)
      const reloaded = createJsonRagStore({ path: nonPath })
      expect(reloaded.getNode('r1')?.id).toBe('r1')
    })
  })

  it('H6 — a torn-down store/engine teardown() is a safe NO-OP (removal is idempotent at the DRAIN/teardown layer even though the write is not)', async () => {
    await withDirAsync(async (dir) => {
      const { orphan } = await bootSeeded(dir)
      await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
      // Idempotent NO-OP — a repeat teardown resolves immediately (U-H5).
      await expect(orphan.store.teardown()).resolves.toBeUndefined()
      await expect(orphan.engine.teardown()).resolves.toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H3 — remove with an in-flight query DRAINS first (A-P2-2): the engine
// is never torn down while `inFlight() > 0`.
// ---------------------------------------------------------------------------

describe('§5.6 H3 — the DRAIN gate: hotRemove never tears down an engine mid-query (A-P2-2)', () => {
  it('H3 — a pending query delays the teardown until it settles; then the drain proceeds and hotRemove resolves {drained:0}; the file is byte-identical', async () => {
    await withDirAsync(async (dir) => {
      const { controller, orphan, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      // Hold the orphan engine's NEXT query pending via a gated embedder.
      const d = makeDeferred()
      orphan.engine.setEmbedder(makeDeferredEmbedder(d))
      const pending = orphan.engine.query('hello')
      await vi.waitFor(() => { expect(orphan.engine.inFlight()).toBe(1) })

      // hotRemove is NOT awaited — on the green code the drain gate blocks on
      // `inFlight()===0`; on the red code hotRemove is undefined → throws (RED).
      let hotErr: unknown
      let hotP: Promise<unknown> | null = null
      try {
        hotP = (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove(NON)
      } catch (e) {
        hotErr = e
      }
      // If hotRemove is undefined, this is the red marker — a synchronous throw.
      expect(hotErr).toBeUndefined()

      // Give the drain a chance to start; the engine must NOT be torn down
      // while the query is in flight. The gate is still blocked on
      // `inFlight()===0` (inFlight() is still 1) and hotRemove has NOT yet
      // resolved — the removed engine is never torn down mid-query (A-P2-2).
      await new Promise((r) => setTimeout(r, 50))
      expect(orphan.engine.inFlight()).toBe(1)
      let hotSettled = false
      hotP!.then(() => { hotSettled = true })
      await new Promise((r) => setTimeout(r, 20))
      expect(hotSettled).toBe(false)

      // Settle the gated query → the drain proceeds → teardown runs.
      d.resolve()
      await pending
      const result = await hotP as { drained: number }

      // The drain guarantee: drained === 0 at teardown.
      expect(result.drained).toBe(0)
      // The engine is now STOPPED (torn down only AFTER the query settled).
      let qErr: unknown
      try { await orphan.engine.query('after') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)
      // D3 — the store file is byte-identical throughout.
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H4–H5 — multi-store survival + the re-readable (D2) write.
// ---------------------------------------------------------------------------

describe('§5.6 H4–H5 — multi-store unregister + re-readable write (D2)', () => {
  it('H4 — from a 3-store registry, hotRemove("research-2026-09") unregisters ONLY it; the surviving non-default (research-2026-10) remains; the default is untouched', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir, 'r1', THREE_STORES)
      expect([...directory.entries.keys()]).toEqual([DFLT, NON, 'research-2026-10'])
      const before10 = directory.entries.get('research-2026-10')!
      const defaultBefore = controller.getDefaultStore()

      const result = await (controller as unknown as { hotRemove(name: string): Promise<{ delta: { added: string[]; removed: string[]; renamed: { from: string; to: string }[] }; loaded: { stores: { name: string }[] } }> }).hotRemove(NON)

      expect(result.delta.removed).toEqual([NON])
      // Only research-2026-09 is unregistered.
      expect(directory.entries.has(NON)).toBe(false)
      expect(directory.entries.has('research-2026-10')).toBe(true)
      expect(controller.currentStores().map((s) => s.name)).toEqual([DFLT, 'research-2026-10'])
      // The default is untouched.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
      void before10
    })
  })

  it('H5 — the write is re-readable (D2): a FRESH loadRagStoreRegistry shows the removed store gone with implicit:false/corrupt:false (persisted == live)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, regPath } = await bootSeeded(dir)
      await (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove(NON)
      const fresh = loadRagStoreRegistry({ path: regPath })
      expect(fresh.stores.map((s) => s.name)).toEqual([DFLT])
      expect(fresh.implicit).toBe(false)
      expect(fresh.corrupt).toBe(false)
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 F1–F4 — the fail-loud remove paths (live-untouched + disk untouched +
// NO teardown on a write throw — §5.3 step 2 EARLY return).
// ---------------------------------------------------------------------------

describe('§5.7 fail-states — hotRemove propagates WITHOUT any drain/teardown (F1–F4)', () => {
  it('F1 — hotRemove(null) / hotRemove(5) / hotRemove("") → W-remove-arg "name required" (locally-thrown by the top-method guard, byte-equal to W-remove-arg — F-H4-3); live-untouched; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotRemove = (controller as unknown as { hotRemove(name: unknown): Promise<unknown> }).hotRemove.bind(controller)

      let e1: unknown, e2: unknown, e3: unknown
      try { await hotRemove(null) } catch (e) { e1 = e }
      try { await hotRemove(5) } catch (e) { e2 = e }
      try { await hotRemove('') } catch (e) { e3 = e }
      expect((e1 as Error)?.message).toBe(W_REMOVE_ARG)
      expect((e2 as Error)?.message).toBe(W_REMOVE_ARG)
      expect((e3 as Error)?.message).toBe(W_REMOVE_ARG)

      // live-untouched (the research-2026-09 entry is still present + not torn
      // down) + the registry file byte-identical.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
    })
  })

  it('F2 — hotRemove("nope") (unknown / already-removed) → W-remove-unknown PROPAGATES; live-untouched; NO teardown (remove is NOT a silent no-op at the write level)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotRemove = (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove.bind(controller)

      let caught: unknown
      try { await hotRemove('nope') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_REMOVE_UNKNOWN('nope'))

      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
      // A SECOND hotRemove of an ALREADY-REMOVED name fails loud (W-remove-unknown).
      // Sanctioned fixture fix (2026-09-08): the prior successful removal MUST
      // actually run first — otherwise NON is still PRESENT and hotRemove(NON)
      // succeeds (H1/H4/H5), it does not throw. This reconciles the second-call
      // assertion with the spec §5.7 F2 intent (a second remove of a gone name).
      await (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove(NON)
      let caught2: unknown
      try { await hotRemove(NON).then(async () => {}) } catch (e) { caught2 = e }
      expect((caught2 as Error)?.message).toBe(W_REMOVE_UNKNOWN(NON))
    })
  })

  it('F3 — hotRemove("main") (the DEFAULT) → the loader F12 (zero defaults) PROPAGATES BEFORE any drain; live-untouched; disk untouched; NO teardown; NO W-remove-default message exists', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      // The orphan we will NOT drain (removing the default must not reach it).
      const orphan = directory.entries.get(NON)!
      const hotRemove = (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove.bind(controller)

      let caught: unknown
      try { await hotRemove(DFLT) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(LOADER_F12_ZERO_DEFAULTS)

      // live-untouched + disk byte-identical + the default is still the default.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
      // NO teardown ran — the non-default engine is STILL SERVING (NOT torn down).
      expect(orphan.engine.inFlight()).toBe(0)
      expect(await orphan.engine.query('still-serving').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F4 — hotRemove whose persist hits a native fs failure (EISDIR) → the NATIVE Error PROPAGATES; live-untouched; the ORIGINAL file intact; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBytes = readFileSync(regPath, 'utf8')
      const orphan = directory.entries.get(NON)!
      // Make the temp write fail natively: `path + ".tmp"` becomes a DIRECTORY.
      mkdirSync(`${regPath}.tmp`, { recursive: true })
      const hotRemove = (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove.bind(controller)

      let caught: unknown
      try { await hotRemove(NON) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message.startsWith('EISDIR') || (caught as Error).message.startsWith('EACCES')).toBe(true)

      // live-untouched + the ORIGINAL registry file intact + NO teardown.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(regBytes)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
      // The engine is NOT torn down (the drain never ran on the early return).
      expect(await orphan.engine.query('still').then(() => true).catch(() => false)).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 F5–F7 — drainAndReleaseEntry (module-level): UNBOUNDED drain behavior
// (F-H5-3 / A-P2-2 awareness; §7 Q4 — no bounded timeout, no pinned message).
// ---------------------------------------------------------------------------

describe('§5.7 F5–F7 — drainAndReleaseEntry UNBOUNDED-drain behavior (module-level)', () => {
  it('F5 — a store.teardown() that HANGS blocks drainAndReleaseEntry (never settles; F-H5-3 awareness, NOT a bounded fail-state)', async () => {
    const neverSettles = new Promise<void>(() => {})
    const hangStore = { teardown: () => neverSettles } as unknown as RagStore
    const fakeEngine = { inFlight: () => 0, teardown: async () => {} } as unknown as RetrievalEngine

    const settled = await Promise.race([
      drainAndReleaseEntry({ store: hangStore, engine: fakeEngine }).then(() => 'resolved' as const),
      new Promise<never>((res) => setTimeout(() => res('timeout' as never), 80)),
    ])
    // The UNBOUNDED await means the drain does NOT settle: the timeout fires.
    expect(settled).toBe('timeout')
  })

  it('F6 — a NEVER-settling in-flight query blocks the drain gate (inFlight() never reaches 0; UNBOUNDED — §7 Q4)', async () => {
    const alwaysInflight = { inFlight: () => 1, teardown: async () => {} } as unknown as RetrievalEngine
    const store = { teardown: async () => {} } as unknown as RagStore

    const settled = await Promise.race([
      drainAndReleaseEntry({ store, engine: alwaysInflight }).then(() => 'resolved' as const),
      new Promise<never>((res) => setTimeout(() => res('timeout' as never), 80)),
    ])
    expect(settled).toBe('timeout')
  })

  it('F7 — an in-flight query that SETTLES during the drain lets teardown run AFTER (store then engine); drained is the settled count (0); the drain is the guarantee (A-P2-2)', async () => {
    let inflight = 1
    const order: string[] = []
    const fakeEngine = {
      inFlight: () => inflight,
      teardown: async () => { order.push('engine') },
    } as unknown as RetrievalEngine
    const fakeStore = { teardown: async () => { order.push('store') } } as unknown as RagStore

    const resultP = drainAndReleaseEntry({ store: fakeStore, engine: fakeEngine })
    // Flip the in-flight count after a tick so the drain gate observes it 0.
    setTimeout(() => { inflight = 0 }, 15)
    const result = await resultP
    expect((result as RemovedEntryReleaseResult).drained).toBe(0)
    // Order is pinned: store THEN engine (§5.4).
    expect(order).toEqual(['store', 'engine'])
  })
})

// ---------------------------------------------------------------------------
// §5.8 negative pins — D6 / A-P2-7 / A-P2-8 / D3 + the N1 re-pin status.
// ---------------------------------------------------------------------------

describe('§5.8 negative pins — D6/D3/A-P2-7/A-P2-8 + the N1 re-pin (the runtime keeps NO `teardown(` literal)', () => {
  it('N1/A-P2-8 — rag-store-runtime.ts STILL defines NO teardown/close/destroy primitive and references only drainAndReleaseEntry (STAYS GREEN — not re-pinned)', () => {
    expect(existsSync(RUNTIME_SRC)).toBe(true)
    const src = readSrc(RUNTIME_SRC, 'utf8')
    expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)
    // U-H4 references the helper by name — an identifier with NO lowercase
    // `teardown`, preserving the grep pin.
    expect(src).toMatch(/drainAndReleaseEntry\s*\(/)
  })

  it('N2/D3 — rag-store-runtime.ts keeps its no-MCP/no-IPC/no-delete/0-console pins', () => {
    const src = readSrc(RUNTIME_SRC, 'utf8')
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove)\s*\(/)
    expect(src).not.toMatch(/console\./)
  })
})

// ---------------------------------------------------------------------------
// RCA-3 adversarial host-finding regressions (F-H4-1 drain-gate TOCTOU +
// F-H4-2 default-drift orphan leak). Each FAILS on the pre-fix code and PASSES
// after the fix (§3a).
// ---------------------------------------------------------------------------

describe('§3a RCA-3 adversarial regressions — F-H4-1 drain-gate TOCTOU + F-H4-2 default-drift orphan leak', () => {
  it('F-H4-1 — a NEW query entered DURING the store-teardown window (the single-poll drain-gate TOCTOU) is NEVER torn down mid-flight: the engine is marked STOPPED only AFTER inFlight() drops back to 0 (A-P2-2)', async () => {
    // A caller holding a captured reference to the removed engine can enter
    // engine.query() DURING `await store.teardown()` (which yields to the event
    // loop). The single-poll gate observed inFlight()===0 BEFORE the store
    // teardown, but the new query makes inFlight() 1 AFTER the gate passed — a
    // naive `while (inFlight() !== 0) sleep(1) → store.teardown() →
    // engine.teardown()` then marks the engine STOPPED MID-QUERY. The fix
    // RE-ENTERS the drain gate immediately before engine.teardown() (in the
    // same synchronous block, so the re-check closes the window — teardown()
    // synchronously marks STOPPED).
    let inflight = 0
    const teardownOrder: string[] = []
    const engine = {
      inFlight: () => inflight,
      teardown: async () => { teardownOrder.push('engine-teardown') },
    } as unknown as RetrievalEngine
    // A store whose teardown YIELDS — the controlled event-loop window during
    // which a captured-reference caller can start a NEW query on the engine.
    const tdGate = makeDeferred()
    const store = { teardown: async () => { await tdGate.promise } } as unknown as RagStore

    const drainP = drainAndReleaseEntry({ store, engine })
    // The drain gate passes (inFlight 0) and blocks on the gated store teardown.
    await new Promise((r) => setTimeout(r, 5))
    // The captured-reference caller starts a NEW query during the store-teardown
    // window → the count becomes 1 AFTER the gate's zero-pass (the TOCTOU).
    inflight = 1
    // Let the store teardown resolve; the drain proceeds past it.
    tdGate.resolve()
    // Give the drain a chance to act. On the BUGGY single-poll gate the engine
    // teardown runs immediately (mid-query); on the FIXED re-entry gate it must
    // block until the query settles.
    await new Promise((r) => setTimeout(r, 20))
    // The engine must NOT have been torn down while the query is in flight.
    expect(teardownOrder).toEqual([])
    expect(engine.inFlight()).toBe(1)
    // The drain must NOT settle while the query is still in flight.
    let settled = false
    drainP.then(() => { settled = true })
    await new Promise((r) => setTimeout(r, 20))
    expect(settled).toBe(false)
    // Settle the query → the drain proceeds → teardown runs ONLY AFTER 0.
    inflight = 0
    const result = await drainP
    expect((result as RemovedEntryReleaseResult).drained).toBe(0)
    expect(teardownOrder).toEqual(['engine-teardown'])
  })

  it('F-H4-2 — a default-drift throw during hotRemove (F16) STILL drains + tears down the removed store\'s engine before rethrowing (no orphan leak; the byte-pinned throw propagates)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, orphan, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      // External mid-run default edit: the on-disk `main` default now resolves
      // onto a DIFFERENT persistence file → the next hotRemove re-reads it,
      // persists the removal, then the F16 defensive throw FIRES AFTER the live
      // map was already synchronized (HOST-1 / D2) and the removed entry dropped.
      writeFileSync(
        join(dir, 'provident-rag-stores.json'),
        JSON.stringify({
          version: 1,
          stores: [
            { name: DFLT, default: true, persistenceFile: join(dir, 'other-main.json') },
            { name: NON },
          ],
        }),
      )
      const hotRemove = (controller as unknown as { hotRemove(name: string): Promise<unknown> }).hotRemove.bind(controller)

      // The default-drift throw propagates byte-pinned (unchanged contract).
      let caught: unknown
      try { await hotRemove(NON) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_DEFAULT_MISMATCH2)

      // The removal DID apply live (the D2 sync in the throw path) — the entry
      // is gone so the drain must still have run on the captured orphan.
      expect(directory.entries.has(NON)).toBe(false)
      // The removed store's engine + store are STILL torn down (no orphan leak).
      let qErr: unknown
      try { await orphan.engine.query('after') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)
      let pErr: unknown
      try { await orphan.store.putNode(makeNode('x3', 'nope')) } catch (e) { pErr = e }
      expect(pErr).toBeInstanceOf(Error)
      expect((pErr as Error).message).toBe(TD_STORE)
      // D3 — the store file strands byte-identical throughout the throw path.
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 F8 — the defensive `orphan === undefined` after a SUCCESSFUL write
// (D2-invariant bug — unreachable by contract; §5.3 step 3). Per §5.3 step 3
// this is a defensive no-op guard RECORDED but NEVER asserted as reachable
// behavior, so no it() is authored for it.
// ---------------------------------------------------------------------------
