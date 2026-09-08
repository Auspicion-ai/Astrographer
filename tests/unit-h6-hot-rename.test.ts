// tests/unit-h6-hot-rename.test.ts — Unit U-H6: the DRAIN-THEN-TEARDOWN hot-
// rename (`RagStoreRuntimeController.hotRename(from, to): Promise<HotRenameResult>`)
// that upgrades the rename path from U-H2's REBUILD+ORPHAN to a real
// drain-then-teardown, mirroring U-H4's `hotRemove` via the SAME reused
// `src/main/rag-store-remove.ts` `drainAndReleaseEntry`.
//
// RED SET (RCA-1) — written BEFORE any U-H6 implementation exists. The reused
// module `src/main/rag-store-remove.ts` EXISTS (U-H4 landed it), so this suite
// LOADS cleanly; the red is the ABSENT method + the drain/strand bodies failing,
// NOT a suite-load failure (§5.9). The P0 marker names the missing surface: on
// the pre-U-H6 code `RagStoreRuntimeController` has NO `hotRename`
// (`typeof controller.hotRename === 'undefined'`), and the existing
// `hotApply({kind:'rename'})` REBUILDS + ORPHANS but never drains/tears down, so
// every H1–H6 body that asserts teardown/strand/unregister FAILS on the
// absent/behaviorless `hotRename`. `hotApply({kind:'rename'})` itself is
// UNCHANGED (the U-H2 H6 rebuild+orphan path must STAY GREEN — the §7 Q3 two-path
// co-existence). §5.8's N-pins are STAYS-GREEN absence pins (U-H4 already left
// `rag-store-runtime.ts` N1/A-P2-8-clean; U-H6 reuses, never re-pins).
//
// Every assertion derives from docs/specs/unit-h6-hot-rename.md ALONE + the
// LANDED homolog (docs/specs/unit-h4-hot-remove.md + its test):
//   §4/§5.1     the ADDITIVE surface (RagStoreRuntimeController.hotRename +
//               HotRenameResult; controller 11 → 12 members)
//   §5.2        the REUSED drainAndReleaseEntry (EXISTS — the suite LOADS)
//   §5.3/§5.4   hotRename exact ordering (capture BEFORE write → hotApply rename
//               → defensive skip → drainAndReleaseEntry on the old-`from` orphan
//               → return { loaded, delta, drained: 0 })
//   §5.5        the byte-pinned PROPAGATED error set (W-rename-arg from|to /
//               W-rename-unknown-from / W-rename-target-exists / W-rename-default
//               / R-rename-ids-present [INHERITED] / native fs) — 0 new templates
//   §5.6 H1–H6  the happy-path states
//   §5.7 F1–F8  the fail-states (incl. the F-H4-1 TOCTOU + F-H4-2 drift mirror)
//   §5.8        the negative pins D6/A-P2-5/A-P2-8/D3/D4/D5 + the N1 re-pin status
//   §7          the Architect ruling — Q1 reuse + additive async `hotRename`;
//               Q2 INHERITS R-rename-ids-present; Q3 two-path co-existence +
//               the from|to arg guards; Q4 UNBOUNDED drain.
//
// Conventions follow tests/unit-h4-hot-remove.test.ts + tests/unit-h5-teardown.test.ts
// (vitest node environment, `.js` import suffix for the main-process ESM modules,
// temp dirs via node:fs mkdtempSync + rmSync, byte-exact message assertions).
// NO test touches real repo/userData paths.
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
// U-H4 — the REUSED drain-then-teardown module. This import LOADS (the module
// EXISTS — U-H4 landed it); the red is the ABSENT `hotRename`, NOT a load
// failure (§5.9). `hotRename` must reference ONLY `drainAndReleaseEntry(` — never
// a literal `teardown(` (the N1/A-P2-8 pin, §5.8).
import { drainAndReleaseEntry, type RemovedEntryReleaseResult } from '../src/main/rag-store-remove.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { loadRagStoreRegistry, type LoadedRagStoreRegistry, type RagStoreConfig } from '../src/main/rag-store-registry.js'
import { buildRagStoreDirectory, type RagStoreDirectory, type RagStoreEntry } from '../src/main/rag-store-directory.js'
import type { Embedder, RetrievalEngine } from '../src/main/retrieval.js'

// ---------------------------------------------------------------------------
// The byte-pinned message set (§5.5 — ALL propagated from LANDED sets / the
// W-rename-arg template reused by the top-method arg guard; U-H6 introduces
// ZERO new message templates).
// ---------------------------------------------------------------------------
const RT = 'rag-store-runtime:'
const WR = 'rag-store-registry-write:'

// W-rename-arg — the `from required` / `to required` guards (LOCALLY-THROWN at
// the top of `hotRename`, byte-equal to the landed W-rename-arg template — the
// U-H4 F-H4-3 addendum mirror, §5.3 step 1 / §5.7 F1/F1b).
const W_RENAME_ARG_FROM = `${WR} from required`
const W_RENAME_ARG_TO = `${WR} to required`
const W_RENAME_UNKNOWN = (from: string): string => `${WR} cannot rename unknown store '${from}'`
const W_RENAME_TARGET = (from: string, to: string): string => `${WR} store '${from}' cannot be renamed to '${to}': '${to}' already exists`
const W_RENAME_DEFAULT = `${WR} the default store cannot be renamed (default reassignment is a separate unit)`
// R-rename-ids-present — INHERITED from `hotApply` (the D4 no-ids caller
// precondition; U-H6 performs NO id rewrite and NO re-inspect — §7 Q2).
const R_RENAME_IDS = (from: string): string => `${RT} cannot rename store '${from}' — it has persisted '${from}:'-prefixed ids`
const R_STATUS_UNKNOWN = (name: string): string => `${RT} unknown store '${name}'`
// The default-drift defensive throws (F15/F16) — the F-H4-2 orphan-drain throw
// path (the swap already applied + the live map was synced to `loaded`).
const R_DEFAULT_MISMATCH2 = `${RT} default entry drifted from the loaded registry`
// U-H5 post-teardown serving throws (observed by a LATER caller of a torn-down
// old-`from` store/engine — NOT thrown by `hotRename`/`drainAndReleaseEntry`).
const TD_STORE = 'rag store: torn down'
const TD_ENGINE = 'retrieval engine: torn down'

// ---------------------------------------------------------------------------
// The §5.1 ADDITIVE surface — the local result shape for the casts (the
// `HotRenameResult` does not exist yet; each red body names it via the cast).
// ---------------------------------------------------------------------------
interface HotRenameResultShape {
  loaded: LoadedRagStoreRegistry
  delta: { added: string[]; removed: string[]; renamed: { from: string; to: string }[] }
  drained: number
}
type HotRenameShape = (from: string, to: string) => Promise<HotRenameResultShape>
type HotRenameLoose = (from: unknown, to: unknown) => Promise<unknown>

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, byte-exact message assertions).
// ---------------------------------------------------------------------------

/** Async helper — seeds stores before the directory is built, cleans up. */
async function withDirAsync(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h6-'))
  try {
    await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
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
// The fixture registry: `main` (default) + `research-2026-09` (non-default
// [= FROM]), on derived persistence files — the §5.6 2-store boot. H4/F4 use a
// 3-store variant by appending `research-2026-10`.
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
const TO = 'research-2026-10'
const TO11 = 'research-2026-11'

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
 *  persistence file exists — the §5.6 strand byte-compare + the D4 inspect
 *  pass), returning the fixture + the seeded non-default entry (the orphan the
 *  H1/H2/H3 drain). `seedIds` controls which node ids the `from` store carries
 *  (a `<from>:`-prefixed id makes the D4 precondition fire — §5.7 F2). */
async function bootSeeded(
  dir: string,
  seedIds: string[] = ['r1'],
  stores: RagStoreConfig[] = DEFAULT_STORES,
): Promise<RuntimeFixture & { orphan: RagStoreEntry; nonPath: string }> {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const non = registry.stores.find((s) => s.name === NON)!
  const seed = createJsonRagStore({ path: non.persistenceFile })
  for (const id of seedIds) {
    await seed.putNode(makeNode(id, `content of ${id}`))
  }
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
// P0 — the RCA-1 red markers: the ADDITIVE `hotRename` surface is ABSENT on the
// pre-U-H6 code. The reused `rag-store-remove.ts` EXISTS (the suite LOADS); the
// red is the method-absence marker + the absent-behavior bodies (§5.9).
// ---------------------------------------------------------------------------

describe('P0 — the U-H6 additive surface is ABSENT on the pre-U-H6 code (RCA-1 red marker)', () => {
  it('P0 — the runtime controller exposes hotRename(from, to): Promise<HotRenameResult> (ABSENT → fails)', async () => {
    await withDirAsync(async (dir) => {
      const { controller } = bootRuntime(dir)
      // §5.1 — the ADDITIVE async method (controller 11 → 12 members). `undefined`
      // today (red marker; the U-H2 `hotApply({kind:"rename"})` REBUILD+ORPHAN is
      // the ONLY rename path — it never drains/tears down).
      expect(typeof (controller as RagStoreRuntimeController & { hotRename?: unknown }).hotRename).toBe('function')
    })
  })

  it('M-reuse — the REUSED drain-then-teardown module rag-store-remove.ts EXISTS, exports drainAndReleaseEntry, and carries the D3/D6 negative pins (GREEN — the suite LOADS)', () => {
    // §5.2 — the module is REUSED verbatim (U-H4 landed it). This is a GREEN
    // load companion to the P0 red marker: the suite MUST LOAD, so the red is
    // the absent `hotRename`, not a load failure (§5.9).
    expect(existsSync(REMOVE_SRC)).toBe(true)
    const src = readSrc(REMOVE_SRC, 'utf8')
    expect(src).toMatch(/export\s+async\s+function\s+drainAndReleaseEntry/)
    // D3 — the module imports NO delete primitive (the old `from` file is never
    // deleted — the strand).
    expect(src).not.toMatch(/\b(unlink|rmdir|rm|remove)\s*\(/)
    // D6 / A-P2-7 — no MCP tool / IPC surface in the orchestration module.
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    expect(src).not.toMatch(/console\./)
  })

  it('co-existence — hotApply({kind:"rename"}) (U-H2 REBUILD+ORPHAN) STILL WORKS unchanged (delta.renamed, new entry rebuilt, old from dropped, default untouched)', async () => {
    // §7 Q3 / §3 — two-path co-existence: the landed synchronous orphan path is
    // UNCHANGED. This must stay GREEN both on the red run (U-H2 behavior) and
    // post-implementation (U-H6 keeps it untouched).
    await withDirAsync(async (dir) => {
      const { controller, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      const defaultBefore = controller.getDefaultStore()
      const result: HotApplyResult = controller.hotApply({ kind: 'rename', from: NON, to: TO })
      expect(result.delta).toEqual({ added: [], removed: [], renamed: [{ from: NON, to: TO }] })
      // REBUILD + ORPHAN: the new entry lives under `to`, the old `from` is
      // DROPPED from the live Map WITHOUT teardown (U-H2 semantics — U-H6 does
      // not change this path).
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
      expect(controller.getDirectory().entries.has(TO)).toBe(true)
      // D3 orphan — the old `from` store's persistence file is UNTOUCHED.
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1–H2 — rename a present, IDLE, CLEAN non-default → drained + teardown +
// unregistered + old file stranded (D7/D3/D4).
// ---------------------------------------------------------------------------

describe('§5.6 H1–H2 — hotRename drains + tears down + unregisters an idle non-default; the old file strands (D7/D3/D4)', () => {
  it('H1 — hotRename("research-2026-09","research-2026-10") resolves {loaded, delta:{added:[],removed:[],renamed:[{from,to}]}, drained:0}; the old entry is gone from EVERY accessor; the old file STRANDED byte-identical; the NEW `to` rebuilt; the default UNCHANGED', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      const defaultBefore = controller.getDefaultStore()
      const defaultEngineBefore = controller.getDefaultEngine()

      // §5.1/§5.3 — the additive drain-then-teardown rename (RED: undefined today).
      const result = await (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO)

      // §7 Q3 return shape — the applied delta + the drained old engine count (0).
      expect(result.delta).toEqual({ added: [], removed: [], renamed: [{ from: NON, to: TO }] })
      expect(result.drained).toBe(0)
      // The fresh `loaded` (D2 round-trip) lists `to`, NOT `from`.
      expect(result.loaded.stores.map((s) => s.name).sort()).toEqual([DFLT, TO].sort())
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)

      // UNREGISTER-EVERYWHERE: live entries Map + every runtime accessor.
      expect(directory.entries.get(NON)).toBeUndefined()
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
      expect(controller.currentStores().map((s) => s.name).sort()).toEqual([DFLT, TO].sort())
      expect(() => controller.statusOf(NON)).toThrow(R_STATUS_UNKNOWN(NON))

      // The NEW `to` entry is REBUILT live (a FRESH store on the NEW derived file).
      const rebuilt = directory.entries.get(TO)
      expect(rebuilt).toBeDefined()
      expect(rebuilt!.name).toBe(TO)

      // D3 — the OLD `from` persistence file is STRANDED byte-identical + still
      // present (never deleted/touched).
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
      expect(readdirSync(dir).includes('provident-rag-research-2026-09.json')).toBe(true)

      // The DEFAULT entry is untouched (DEFAULT-STABLE) — SAME object identity.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultEngine()).toBe(defaultEngineBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('H2 — the old renamed engine + store are GENUINELY torn down: query throws "retrieval engine: torn down"; putNode throws "rag store: torn down"; reads STILL resolve; the stranded old file still loads the same nodes', async () => {
    await withDirAsync(async (dir) => {
      const { controller, orphan, nonPath } = await bootSeeded(dir)
      const engine: RetrievalEngine = orphan.engine
      const store: RagStore = orphan.store
      const before = readFileSync(nonPath, 'utf8')

      // The drain-then-teardown rename REACHES the orphan (RED: hotRename absent).
      await (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO)

      // ENGINE-STOP-SERVING — post-rename query on the OLD engine fails loud.
      let qErr: unknown
      try { await engine.query('x') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)

      // STORE-TEARDOWN-REVOKES-MUTATION-ONLY — mutations on the OLD store fail
      // loud...
      let pErr: unknown
      try { await store.putNode(makeNode('x2', 'nope')) } catch (e) { pErr = e }
      expect(pErr).toBeInstanceOf(Error)
      expect((pErr as Error).message).toBe(TD_STORE)

      // ...reads STILL resolve (read-safe teardown).
      expect(store.getNode('r1')?.id).toBe('r1')

      // The stranded old file is byte-identical and a FRESH store over it still
      // serves the same nodes (the data was never deleted/migrated — D3/D4).
      expect(readFileSync(nonPath, 'utf8')).toBe(before)
      const reloaded = createJsonRagStore({ path: nonPath })
      expect(reloaded.getNode('r1')?.id).toBe('r1')
    })
  })

  it('H6 — a torn-down old store/engine teardown() is a safe NO-OP (the rename is IDEMPOTENT at the DRAIN/teardown layer even though the write is not — W-rename-unknown-from for a repeat `from`)', async () => {
    await withDirAsync(async (dir) => {
      const { orphan } = await bootSeeded(dir)
      // drainAndReleaseEntry is the REUSED helper `hotRename` awaits on the old-
      // `from` orphan (§5.2/§5.4). This module-level body is GREEN even on red
      // (the helper + the U-H5 primitives are LANDED) — the primitive-layer
      // idempotency the rename inherits.
      const release = await drainAndReleaseEntry({ store: orphan.store, engine: orphan.engine })
      expect((release as RemovedEntryReleaseResult).drained).toBe(0)
      // Idempotent NO-OP — a repeat teardown resolves immediately (U-H5).
      await expect(orphan.store.teardown()).resolves.toBeUndefined()
      await expect(orphan.engine.teardown()).resolves.toBeUndefined()
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H3 — rename with an in-flight query on the OLD engine DRAINS first
// (A-P2-2): the engine is never torn down while `inFlight() > 0`.
// ---------------------------------------------------------------------------

describe('§5.6 H3 — the DRAIN gate: hotRename never tears down the old engine mid-query (A-P2-2/D7)', () => {
  it('H3 — a pending query delays the teardown until it settles; then the drain proceeds and hotRename resolves {drained:0}; the old file is byte-identical', async () => {
    await withDirAsync(async (dir) => {
      const { controller, orphan, nonPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      // Hold the orphan engine's NEXT query pending via a gated embedder.
      const d = makeDeferred()
      orphan.engine.setEmbedder(makeDeferredEmbedder(d))
      const pending = orphan.engine.query('hello')
      await vi.waitFor(() => { expect(orphan.engine.inFlight()).toBe(1) })

      // hotRename is NOT awaited — on the green code the drain gate blocks on
      // `inFlight()===0`; on the red code hotRename is undefined → throws (RED).
      let hotErr: unknown
      let hotP: Promise<unknown> | null = null
      try {
        hotP = (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO)
      } catch (e) {
        hotErr = e
      }
      // If hotRename is undefined, this is the red marker — a synchronous throw.
      expect(hotErr).toBeUndefined()

      // Give the drain a chance to start; the engine must NOT be torn down
      // while the query is in flight. The gate is still blocked on
      // `inFlight()===0` (still 1) and hotRename has NOT yet resolved — the old
      // renamed engine is NEVER torn down mid-query (A-P2-2).
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
      // The OLD engine is now STOPPED (torn down only AFTER the query settled).
      let qErr: unknown
      try { await orphan.engine.query('after') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)
      // D3 — the old `from` store file is byte-identical throughout.
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H4–H5 — multi-store survival + the re-readable (D2) write.
// ---------------------------------------------------------------------------

describe('§5.6 H4–H5 — multi-store unregister + re-readable write (D2)', () => {
  it('H4 — from a 3-store registry, hotRename("research-2026-09","research-2026-11") unregisters ONLY it (drained+teardown), rebuilds research-2026-11, and the surviving non-default (research-2026-10) remains (rebuilt fresh per the U-H2 coarse path); the default is untouched', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir, ['r1'], THREE_STORES)
      expect([...directory.entries.keys()].sort()).toEqual([DFLT, NON, 'research-2026-10'].sort())
      const defaultBefore = controller.getDefaultStore()

      const result = await (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO11)

      expect(result.delta.renamed).toEqual([{ from: NON, to: TO11 }])
      // Only research-2026-09 is unregistered + its new `to` rebuilt.
      expect(directory.entries.has(NON)).toBe(false)
      expect(directory.entries.has('research-2026-10')).toBe(true)
      expect(directory.entries.has(TO11)).toBe(true)
      expect(controller.currentStores().map((s) => s.name).sort()).toEqual([DFLT, TO11, 'research-2026-10'].sort())
      // The default is untouched.
      expect(controller.getDefaultStore()).toBe(defaultBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('H5 — the write is re-readable (D2): a FRESH loadRagStoreRegistry shows the new name on its NEW derived file and the OLD name gone, with implicit:false/corrupt:false (persisted == live)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, regPath } = await bootSeeded(dir)
      await (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO)
      const fresh = loadRagStoreRegistry({ path: regPath })
      // `TO` is present on its NEW derived file; `NON` is gone.
      expect(fresh.stores.map((s) => s.name).sort()).toEqual([DFLT, TO].sort())
      const renamed = fresh.stores.find((s) => s.name === TO)!
      expect(renamed.persistenceFile).toBe(join(dir, 'provident-rag-research-2026-10.json'))
      expect(fresh.stores.some((s) => s.name === NON)).toBe(false)
      expect(fresh.implicit).toBe(false)
      expect(fresh.corrupt).toBe(false)
      expect(controller.getDirectory().entries.has(NON)).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 fail-states — hotRename propagates WITHOUT any drain/teardown (F1–F6;
// F7's F-H4-2 orphan-drain mirror). live+disk UNTOUCHED + NO teardown on a
// write throw except the default-drift path (F-H4-2).
// ---------------------------------------------------------------------------

describe('§5.7 fail-states — hotRename propagates without drain/teardown (F1–F6), with the F-H4-2 drift mirror (F7)', () => {
  it('F1 — bad `from` (null/5/""/no-arg) → W-rename-arg "from required" (locally-thrown by the top-method guard, byte-equal to W-rename-arg — §5.3 step 1); live-untouched; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotRename = (controller as unknown as { hotRename: HotRenameLoose }).hotRename.bind(controller)

      let e1: unknown, e2: unknown, e3: unknown, e4: unknown
      try { await hotRename(null, 'b') } catch (e) { e1 = e }
      try { await hotRename(5, 'b') } catch (e) { e2 = e }
      try { await hotRename('', 'b') } catch (e) { e3 = e }
      try { await hotRename(undefined, 'b') } catch (e) { e4 = e }
      expect((e1 as Error)?.message).toBe(W_RENAME_ARG_FROM)
      expect((e2 as Error)?.message).toBe(W_RENAME_ARG_FROM)
      expect((e3 as Error)?.message).toBe(W_RENAME_ARG_FROM)
      expect((e4 as Error)?.message).toBe(W_RENAME_ARG_FROM)

      // live-untouched (research-2026-09 still present + not torn down) + the
      // registry file byte-identical.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
    })
  })

  it('F1b — bad `to` (null/5/""/no-arg) → W-rename-arg "to required" (locally-thrown, byte-equal to W-rename-arg — §5.3 step 1); live-untouched; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotRename = (controller as unknown as { hotRename: HotRenameLoose }).hotRename.bind(controller)

      let e1: unknown, e2: unknown, e3: unknown, e4: unknown
      try { await hotRename('a', null) } catch (e) { e1 = e }
      try { await hotRename('a', 5) } catch (e) { e2 = e }
      try { await hotRename('a', '') } catch (e) { e3 = e }
      try { await hotRename('a', undefined) } catch (e) { e4 = e }
      expect((e1 as Error)?.message).toBe(W_RENAME_ARG_TO)
      expect((e2 as Error)?.message).toBe(W_RENAME_ARG_TO)
      expect((e3 as Error)?.message).toBe(W_RENAME_ARG_TO)
      expect((e4 as Error)?.message).toBe(W_RENAME_ARG_TO)

      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
    })
  })

  it('F2 — a rename whose CURRENT `from` store carries persisted <from>:-prefixed ids → R-rename-ids-present (INHERITED from hotApply — D4, §7 Q2); DISK NOT WRITTEN; live-untouched; NO drain/teardown — NO id rewrite, NO re-inspect by hotRename', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, nonPath } = await bootSeeded(dir, [`${NON}:persisted`])
      const before = entrySnapshot(directory)
      const nonBytes = readFileSync(nonPath, 'utf8')
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const orphan = directory.entries.get(NON)!

      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)
      let caught: unknown
      try { await hotRename(NON, 'z') } catch (e) { caught = e }

      // R-rename-ids-present — propagated from the underlying `hotApply` rename
      // (the D4 inspect runs FIRST, before any write — §5.3 step 3 / §5.5).
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_RENAME_IDS(NON))

      // DISK NOT WRITTEN (registry + the from file byte-identical) + live-untouched
      // (the `from` entry is STILL present under `from`, NO `z` entry).
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(readFileSync(nonPath, 'utf8')).toBe(nonBytes)
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(directory.entries.has(NON)).toBe(true)
      expect(directory.entries.has('z')).toBe(false)
      // NO drain/teardown (the swap never ran) — the engine is STILL SERVING.
      expect(orphan.engine.inFlight()).toBe(0)
      expect(await orphan.engine.query('still-serving').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F3 — hotRename("main","x") (the DEFAULT) → W-rename-default PROPAGATES (NOT R-rename-ids-present even for a populated default — HOST-2 skips the D4 inspect); live-untouched; NO teardown (folds into U-H7/D5)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      // The orphan we will NOT drain (renaming the default must not reach it).
      const orphan = directory.entries.get(NON)!
      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)

      let caught: unknown
      try { await hotRename(DFLT, 'x') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_RENAME_DEFAULT)

      // live-untouched + disk byte-identical + the default is still the default.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
      // NO teardown ran — the non-default engine is STILL SERVING (NOT torn down).
      expect(orphan.engine.inFlight()).toBe(0)
      expect(await orphan.engine.query('still-serving').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F4 — hotRename("research-2026-09","research-2026-10") where `to` already exists (3-store registry) → W-rename-target-exists PROPAGATES; live-untouched; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir, ['r1'], THREE_STORES)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const orphan = directory.entries.get(NON)!
      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)

      let caught: unknown
      try { await hotRename(NON, TO) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_RENAME_TARGET(NON, TO))

      // live-untouched + disk byte-identical + NO teardown (engine still serving).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(directory.entries.has(NON)).toBe(true)
      expect(directory.entries.has(TO)).toBe(true)
      // A second rename of the SAME from onto a present to still fails loud.
      expect(await orphan.engine.query('still').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F5 — hotRename("nope","b") (unknown `from`) → W-rename-unknown-from PROPAGATES; live-untouched; NO teardown; a SECOND hotRename of an ALREADY-RENAMED-AWAY `from` fails loud too (rename is NOT a silent no-op at the WRITE level)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)

      let caught: unknown
      try { await hotRename('nope', 'b') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_RENAME_UNKNOWN('nope'))

      // live-untouched + disk byte-identical + no teardown (the swap never ran).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)

      // A SECOND hotRename of an ALREADY-RENAMED-AWAY `from` fails loud with
      // W-rename-unknown-from (`from` is gone from the registry after the first
      // SUCCESSFUL rename — §3a). The first rename must genuinely run.
      await (controller as unknown as { hotRename: HotRenameShape }).hotRename(NON, TO)
      let caught2: unknown
      try { await hotRename(NON, TO11) } catch (e) { caught2 = e }
      expect((caught2 as Error)?.message).toBe(W_RENAME_UNKNOWN(NON))
    })
  })

  it('F6 — hotRename whose persist hits a native fs failure → the NATIVE Error PROPAGATES; live-untouched; the ORIGINAL file intact; NO teardown (the non-drift EARLY return)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBytes = readFileSync(regPath, 'utf8')
      const orphan = directory.entries.get(NON)!
      // Make the temp write fail natively: `path + ".tmp"` becomes a DIRECTORY.
      mkdirSync(`${regPath}.tmp`, { recursive: true })

      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)
      let caught: unknown
      try { await hotRename(NON, TO) } catch (e) { caught = e }
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

  it('F7 (F-H4-2 mirror) — a DEFAULT-DRIFT throw (F16) during hotRename STILL drains + tears down the renamed-away old `from` store/engine before rethrowing (no orphan leak; the byte-pinned throw propagates; the `to` entry is live from the drift sync)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, orphan, nonPath, regPath } = await bootSeeded(dir)
      const fileBefore = readFileSync(nonPath, 'utf8')
      // The `from` name we will rename away (the drift path drops it live).
      const from = NON
      // External mid-run default edit: the on-disk `main` default now resolves
      // onto a DIFFERENT persistence file → the next hotRename re-reads it,
      // persists the rename, then the F16 defensive throw FIRES AFTER the live
      // map was already synchronized (HOST-1 / D2) and the `from` entry dropped.
      writeFileSync(
        regPath,
        JSON.stringify({
          version: 1,
          stores: [
            { name: DFLT, default: true, persistenceFile: join(dir, 'other-main.json') },
            { name: from },
          ],
        }),
      )
      const hotRename = (controller as unknown as { hotRename: HotRenameShape }).hotRename.bind(controller)

      // The default-drift throw propagates byte-pinned (unchanged contract).
      let caught: unknown
      try { await hotRename(from, TO) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_DEFAULT_MISMATCH2)

      // The `from` entry is gone live (the D2 sync in the throw path dropped it)
      // so the captured orphan must STILL have been drained + torn down (F-H4-2).
      expect(directory.entries.has(from)).toBe(false)
      let qErr: unknown
      try { await orphan.engine.query('after') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)
      let pErr: unknown
      try { await orphan.store.putNode(makeNode('x3', 'nope')) } catch (e) { pErr = e }
      expect(pErr).toBeInstanceOf(Error)
      expect((pErr as Error).message).toBe(TD_STORE)
      // The `to` entry is live from the drift sync (rebuildAll) — no orphan leak.
      expect(directory.entries.has(TO)).toBe(true)
      // D3 — the old `from` store file strands byte-identical throughout.
      expect(readFileSync(nonPath, 'utf8')).toBe(fileBefore)
    })
  })
})

// ---------------------------------------------------------------------------
// §3a RCA-3 adversarial regression — F-H4-1 (the inherited drain-gate TOCTOU
// re-entry inside the REUSED helper). This exercises the SAME helper `hotRename`
// awaits on a RENAME orphan; because the helper is LANDED + already F-H4-1-fixed
// (U-H4), this module-level body is GREEN even on the red run — the U-H6 green
// must keep it green (§5.4 inherited contract).
// ---------------------------------------------------------------------------

describe('§3a RCA-3 regression — F-H4-1 (inherited) drain-gate TOCTOU re-entry on the reused helper', () => {
  it('F-H4-1 — a NEW query entered DURING the store-teardown window is NEVER torn down mid-flight: the engine is marked STOPPED only AFTER inFlight() drops back to 0 (A-P2-2)', async () => {
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
    tdGate.resolve()
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
})

// ---------------------------------------------------------------------------
// §5.8 negative pins — D6 / A-P2-5 / A-P2-8 / D3 / D4 / D5 + the N1 status.
// These STAY GREEN on the pre-U-H6 code (U-H4 already left the runtime
// N1/A-P2-8-clean; U-H6 reuses, never re-pins) — the §5.9 N-pin companions.
// ---------------------------------------------------------------------------

describe('§5.8 negative pins — D6/A-P2-5/A-P2-8/D3/D4/D5 + the N1 re-pin status (STAYS GREEN, not re-pinned)', () => {
  it('N1/A-P2-8 — rag-store-runtime.ts STILL defines NO teardown/close/destroy literal and references only drainAndReleaseEntry (the U-H6 green must keep this green — §7 Q1: NO literal `teardown(`)', () => {
    // The HARD §5.8 requirement: no comment/docstring/identifier in
    // rag-store-runtime.ts may contain the literal `teardown(` — `hotRename`
    // references ONLY `drainAndReleaseEntry(`, whose identifier has no lowercase
    // `teardown`. On the green, this pin must NOT be re-pinned or relaxed.
    expect(existsSync(RUNTIME_SRC)).toBe(true)
    const src = readSrc(RUNTIME_SRC, 'utf8')
    expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)
    expect(src).toMatch(/drainAndReleaseEntry\s*\(/)
  })

  it('N2/D3/D6/D5 — rag-store-runtime.ts keeps its no-MCP/no-IPC/no-delete/no-console pins; the reused rename path never deletes (D3), is non-default-only (D5/A-P2-5)', () => {
    const src = readSrc(RUNTIME_SRC, 'utf8')
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    // D3 — no remove/unlink/rm/rmdir primitive reaches the runtime (hotRename's
    // capital-R "Rename" + the lowercase regex do NOT match).
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove)\s*\(/)
    // 0-console census.
    expect(src).not.toMatch(/console\./)
    // The REUSED drain module keeps the SAME no-delete / no-IPC / no-MCP pins
    // (D3/D6/A-P2-7 — §5.5 census).
    const remSrc = readSrc(REMOVE_SRC, 'utf8')
    expect(remSrc).not.toMatch(/\b(unlink|rmdir|rm|remove)\s*\(/)
    expect(remSrc).not.toMatch(/\bALL_TOOLS\b/)
    expect(remSrc).not.toMatch(/\bRpcMethod\b/)
    expect(remSrc).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(remSrc).not.toMatch(/\bIPC_[A-Z_]+\b/)
  })
})

// ---------------------------------------------------------------------------
// §5.7 F8 / F8h — the defensive absent-entry skip + the UNBOUNDED-drain hang.
// F8 (§5.3 step 4) is a defensive no-op guard for an D2-invariant bug —
// RECORDED but NEVER asserted as reachable (no it() authored). F8h (a genuinely
// never-settling in-flight query hangs the drain — §7 Q4 UNBOUNDED) is exercised
// at the module level by the U-H4 F6 companion; the UNBOUNDED await means the
// drain blocks rather than throwing. Because `hotRename` itself is ABSENT today
// (RED), no reachable it() asserts the hang through the rename seam until the
// Implementer lands it — the module-level drain hangs remain in the REUSED
// helper's own suite (unit-h4-hot-remove.test.ts F6).
// ---------------------------------------------------------------------------

// (Intentionally no it() for F8/F8h here — documented, not authored as reachable:
//   F8  — the defensive `orphan == null` after a successful write (D2 bug guard);
//   F8h — a never-settling query hangs the UNBOUNDED drain (A-P2-2 correctness).)
