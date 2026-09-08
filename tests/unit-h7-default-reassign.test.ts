// tests/unit-h7-default-reassign.test.ts — Unit U-H7: the default REASSIGNMENT
// controller mechanism (`RagStoreRuntimeController.hotSetDefault(name):
// Promise<HotSetDefaultResult>` + the default's sanctioned RENAME via
// `hotRenameDefault(to)` + the NEW orchestration module
// `src/main/rag-store-default.ts` `releaseDefaultVectorBoot` / `createDefaultVectorBoot`).
//
// RED SET (RCA-1) — written BEFORE any U-H7 implementation exists. The new
// module `src/main/rag-store-default.ts` does NOT exist on the pre-U-H7 code,
// so this file cannot even LOAD (the `import { createDefaultVectorBoot,
// releaseDefaultVectorBoot }` at the top throws — the house red pattern,
// §5.9(i), mirror of U-H4's identical absent-module red); test M-new + P0 name
// the module + the `hotSetDefault`/`hotRenameDefault` methods + the write-module
// conveniences as the explicit red markers. On the red run the pre-U-H7
// `RagStoreRuntimeController` has NO `hotSetDefault` (`typeof === 'undefined'`)
// and the default `getDefaultName()/getDefaultStore()/getDefaultEngine()/
// getVectorBoot()` are NOT re-bindable (the default is STABLE), so every H1–H8
// body asserting the re-bound default would ALSO fail — but the suite fails
// EARLIER, at load, on the missing orchestration surface (§5.9).
//
// Every assertion derives from docs/specs/unit-h7-default-reassign.md ALONE +
// the LANDED homolog (docs/specs/unit-h6-hot-rename.md + tests/unit-h6-hot-
// rename.test.ts + the §7 Architect ruling 2026-09-08, Q1–Q11 all CONFIRMED):
//   §1/§4/§7       the slice (D5/A-P2-4): re-bind + vector re-warm + retain-old;
//                  Q1 hotSetDefault (13th), Q3 R1 hotRenameDefault (14th),
//                  Q4 RETAIN-old-store, Q6 add-2-kind write amendment,
//                  Q7 cache HAND OFF, Q8 noop, Q9 mechanism-only,
//                  Q10 UNBOUNDED drain, Q11 HOST-LOW-1 close
//   §5.1           the write-module amendment (setDefault / renameDefault kinds +
//                  setDefaultRegistryStore / renameDefaultRegistryStore +
//                  RegistryDelta.defaultChanged) — RED on the pre-U-H7 write module
//   §5.2           the NEW module (createDefaultVectorBoot /
//                  releaseDefaultVectorBoot) — the load-fail red marker
//   §5.3/§5.4      hotSetDefault exact ordering (arg guard → NO-OP → vector
//                  construct-first → write → drift-check → apply+re-bind →
//                  tear-down-old-LAST + start-new) + the A-P2-1 re-bind guarantee
//   §5.5           the byte-pinned error set (R-set-default-arg,
//                  R-set-default-through-hot-apply, R-default-changed,
//                  W-set-default-unknown, W-set-default-nop, W-set-default-arg)
//   §5.6 H1–H8     the happy-path states (lexical flip, re-bind A-P2-1/HOST-LOW-1,
//                  same-default NO-OP, vector re-warm + old-boot teardown,
//                  background build, D2 re-readable, old-default retained, rename)
//   §5.7 F1–F9     the fail-states (arg / unknown / fs / construct-throw /
//                  hot-apply-through / in-flight drain / legacy W-rename-default)
//   §5.8           the negative pins (D6/A-P2-4/A-P2-8/D3/D4/D5/D8 + the N1
//                  re-pin status: rag-store-runtime.ts keeps NO `teardown(` and
//                  references only `releaseDefaultVectorBoot(`/`createDefaultVectorBoot(`)
//
// Conventions follow tests/unit-h4-hot-remove.test.ts + tests/unit-h6-hot-rename.test.ts
// (vitest node environment, `.js` import suffix for the main-process ESM modules,
// temp dirs via node:fs mkdtempSync + rmSync, byte-exact message assertions,
// deterministic mock provider for the node-testable vector mode). NO test touches
// real repo/userData paths.
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
// U-H7 — the NEW orchestration module (does NOT exist on the pre-U-H7 code;
// this import throws at load — the §5.9(i) red marker, mirror of U-H4).
import { createDefaultVectorBoot, releaseDefaultVectorBoot } from '../src/main/rag-store-default.js'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { loadRagStoreRegistry, type LoadedRagStoreRegistry, type RagStoreConfig } from '../src/main/rag-store-registry.js'
import { writeRegistryMutation } from '../src/main/rag-store-registry-write.js'
import { buildRagStoreDirectory, type RagStoreDirectory, type RagStoreEntry } from '../src/main/rag-store-directory.js'
import type { Embedder, RetrievalEngine } from '../src/main/retrieval.js'
import type { EmbeddingProvider } from '../src/main/embeddings.js'
import { createVectorBootController, type VectorBootController } from '../src/main/vector-boot.js'
import { createVectorCache, contentHashOf } from '../src/main/vector-cache.js'

// ---------------------------------------------------------------------------
// The byte-pinned message set (§5.5 — U-H7's 5 NEW templates + the REUSED
// R-default-changed / W-rename-target-exists / W-rename-default).
// ---------------------------------------------------------------------------
const RT = 'rag-store-runtime:'
const WR = 'rag-store-registry-write:'

// R-set-default-arg — hotSetDefault's locally-thrown null/non-string/'' guard.
const R_SET_DEFAULT_ARG = `${RT} default store name required`
// R-set-default-through-hot-apply — the DEFENSIVE guard on hotApply given a
// setDefault mutation (hotApply is default-stable; the input narrows to exclude
// setDefault — §5.5 / §5.7 F6).
const R_SET_DEFAULT_THROUGH_HOT_APPLY = `${RT} default reassignment must use hotSetDefault`
// R-default-changed — REUSED (U-H2 byte-identical) defensive drift throw.
const R_DEFAULT_CHANGED = `${RT} default store changed by a hot-apply (default reassignment is a separate unit)`
// W-set-default-unknown / W-set-default-nop — the write module's new family.
const W_SET_DEFAULT_UNKNOWN = (name: string): string => `${WR} cannot set unknown store '${name}' as default`
const W_SET_DEFAULT_NOP = (name: string): string => `${WR} store '${name}' is already the default`
// W-set-default-arg — the write conveniences' requireName guard.
const W_SET_DEFAULT_ARG_NAME = `${WR} name required`
const W_SET_DEFAULT_ARG_TO = `${WR} to required`
// W-rename-target-exists — REUSED by renameDefault (the default's rename to an
// existing name / to its own name).
const W_RENAME_TARGET = (from: string, to: string): string => `${WR} store '${from}' cannot be renamed to '${to}': '${to}' already exists`
// W-rename-default — the LEGACY guard U-H7 does NOT relax (U-H2 F9 + U-H6 F4).
const W_RENAME_DEFAULT = `${WR} the default store cannot be renamed (default reassignment is a separate unit)`
// The runtime's statusOf error (U-H2 pinned).
const R_STATUS_UNKNOWN = (name: string): string => `${RT} unknown store '${name}'`
// U-H5 post-teardown serving throws (observed by a LATER caller of a torn-down
// old vector engine — NOT thrown by hotSetDefault/releaseDefaultVectorBoot).
const TD_ENGINE = 'retrieval engine: torn down'
const TD_VECTOR_BOOT = 'vector boot: torn down'

// HOST regressions — the byte-pinned messages the U-H7 adversarial pass surfaced
// (RCA-3 HOST-1..5). R-rename-ids-present is the REUSED legacy scan message; the
// `default reassignment already in progress` guard is the HOST-5 serialization.
const R_RENAME_IDS = (from: string): string =>
  `${RT} cannot rename store '${from}' — it has persisted '${from}:'-prefixed ids`
const R_REASSIGN_IN_FLIGHT = `${RT} default reassignment already in progress`

// ---------------------------------------------------------------------------
// The §5.1 / §5.3 ADDITIVE surface — local result SHAPES for the casts (the
// `HotSetDefaultResult` / `RenameDefaultResult` types do not exist yet; each red
// body names the shape via the cast).
// ---------------------------------------------------------------------------
interface HotSetDefaultResultShape {
  loaded: LoadedRagStoreRegistry
  delta: { added: string[]; removed: string[]; renamed: { from: string; to: string }[]; defaultChanged: string[] }
  drained: number
  noop: boolean
}
type HotSetDefaultShape = (name: string) => Promise<HotSetDefaultResultShape>
type HotSetDefaultLoose = (name: unknown) => Promise<unknown>
interface RenameDefaultResultShape {
  loaded: LoadedRagStoreRegistry
  delta: { added: string[]; removed: string[]; renamed: { from: string; to: string }[]; defaultChanged: string[] }
  drained: number
}
type HotRenameDefaultShape = (to: string) => Promise<RenameDefaultResultShape>
type HotRenameDefaultLoose = (to: unknown) => Promise<unknown>

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, byte-exact message assertions,
// deterministic mock provider).
// ---------------------------------------------------------------------------

/** Async helper — seeds stores before the directory is built, cleans up. */
async function withDirAsync(run: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h7-'))
  try {
    await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true, maxRetries: 3 })
  }
}

/** A deterministic leaf node (the ms2 makeNode idiom). */
function makeNode(id: string, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-08T00:00:00.000Z'
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

/** A deferred we control, so a query() can be held pending (resolved) or
 *  rejected — the deterministic interleaving point for the drain tests. */
function makeDeferred(): { promise: Promise<void>; resolve(): void; reject(e: Error): void } {
  let resolve!: () => void
  let reject!: (e: Error) => void
  const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

/** An embedder whose `score` is gated on a deferred — used to hold a query
 *  in-flight on the old default's vector engine so the drain gate's
 *  `inFlight()===0` is observable (A-P2-2). */
function makeDeferredEmbedder(d: { promise: Promise<void> }): Embedder {
  return {
    async score() { await d.promise; return [] },
    async place() { return { ok: false as const, reason: 'no-match' as const } },
  }
}

/** A deterministic bag-of-words → fixed-dimension embedding (the vector-boot
 *  test idiom, so the vector-mode boot is NODE-TESTABLE with no HTTP). */
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

/** The full `EmbeddingProvider` DOUBLE (§5.12 seam — no HTTP). `onEmbed` is the
 *  deterministic interleaving point (a gate to hold a build / count embeds). */
function makeProviderDouble(onEmbed?: (text: string) => void | Promise<void>): EmbeddingProvider & { embedTexts: string[] } {
  const embedTexts: string[] = []
  return {
    kind: 'ollama',
    model: 'embeddinggemma',
    baseUrl: 'http://127.0.0.1:11434',
    dimension: 4,
    embedTexts,
    async embed(text: string): Promise<number[]> {
      embedTexts.push(text)
      await onEmbed?.(text)
      return textEmbedding(text)
    },
    async embedBatch(texts: string[]): Promise<number[][]> {
      const out: number[][] = []
      for (const t of texts) {
        embedTexts.push(t)
        await onEmbed?.(t)
        out.push(textEmbedding(t))
      }
      return out
    },
  }
}

// ---------------------------------------------------------------------------
// The fixture registry: `main` (default) + `research-2026-09` (non-default
// [= TO-BE-DEFAULT]), on derived persistence files — the §5.6 2-store boot.
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

interface RuntimeFixture {
  controller: RagStoreRuntimeController
  directory: RagStoreDirectory
  defaultEntry: RagStoreEntry
  regPath: string
  registry: LoadedRagStoreRegistry
}

/** The exact §8 boot wiring (mirroring main.ts): write+load the registry, build
 *  the directory (LEXICAL — provider null), then wrap it in the runtime
 *  controller. */
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

/** Boot over a registry seeded with the non-default store's persistence file
 *  (so a real file exists for the strand byte-compare + the retained-entry
 *  node-load test) + the DEFAULT store's OWN file (the old-default strand in
 *  H1/H7). `seedIds` controls the NON store's node ids. */
async function bootSeeded(
  dir: string,
  seedIds: string[] = ['r1'],
  stores: RagStoreConfig[] = DEFAULT_STORES,
): Promise<RuntimeFixture & { orphan: RagStoreEntry; nonPath: string; mainPath: string }> {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const non = registry.stores.find((s) => s.name === NON)!
  // Seed EVERY non-default store's persistence file BEFORE the directory build
  // (so statusOf resolves 'loaded' per D7 for EACH non-default — including the
  // 3-store fixture's `research-2026-10`). The default store is seeded below.
  for (const cfg of registry.stores) {
    if (cfg.name === registry.defaultStoreName) continue
    const seed = createJsonRagStore({ path: cfg.persistenceFile })
    for (const id of seedIds) {
      await seed.putNode(makeNode(id, `content of ${id}`))
    }
  }
  // Seed the DEFAULT (main) store so its persistence file exists (the strand
  // byte-compare of the retained OLD default in H1/H7).
  const main = registry.stores.find((s) => s.name === DFLT)!
  const seedMain = createJsonRagStore({ path: main.persistenceFile })
  await seedMain.putNode(makeNode('m1', 'main content'))
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
  return { controller, directory, defaultEntry, regPath, registry, orphan, nonPath: non.persistenceFile, mainPath: main.persistenceFile }
}

/** The §8 boot wiring in VECTOR mode — the deterministic mock provider makes the
 *  vector boot node-testable. The default (main) store owns the ONE vector boot
 *  (A6/R10); all non-default entries are always lexical. */
function bootVector(
  dir: string,
  stores: RagStoreConfig[] = DEFAULT_STORES,
  opts?: { onEmbed?: (text: string) => void | Promise<void> },
): RuntimeFixture & { provider: EmbeddingProvider & { embedTexts: string[] }; oldBoot: VectorBootController | null; cachePath: string } {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  const provider = makeProviderDouble(opts?.onEmbed)
  const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'vector', provider })
  const directory = plan.directory
  const defaultEntry = directory.entries.get(directory.defaultName)!
  const controller = createRagStoreRuntimeController({
    registry,
    directory,
    defaultEntry,
    vectorBoot: plan.vectorBoot,
    registryPath: regPath,
    userDataPath: dir,
    embedderKind: 'vector',
    provider,
  })
  return {
    controller,
    directory,
    defaultEntry,
    regPath,
    registry,
    provider,
    oldBoot: plan.vectorBoot,
    cachePath: join(dir, 'provident-vector-cache.json'),
  }
}

/** Boot in VECTOR mode over a registry whose NON-default store has been SEEDED
 *  (a real file + nodes — the re-warm build embeds them + the retained-old
 *  strand byte-compare) and the DEFAULT store's own file seeded too. The store
 *  files are seeded BEFORE the directory build (RETAIN — the booted entries are
 *  never re-constructed), so the re-warmed NEW-default boot in H5 has content in
 *  memory to embed (`embedTexts` grows after the flip). */
async function bootVectorSeeded(
  dir: string,
  seedIds: string[] = ['r1'],
  stores: RagStoreConfig[] = DEFAULT_STORES,
  opts?: { onEmbed?: (text: string) => void | Promise<void> },
): Promise<ReturnType<typeof bootVector> & { orphan: RagStoreEntry; nonPath: string; mainPath: string }> {
  const regPath = join(dir, 'provident-rag-stores.json')
  writeFileSync(regPath, JSON.stringify({ version: 1, stores }))
  const registry = loadRagStoreRegistry({ path: regPath })
  // Seed EVERY non-default store's persistence file BEFORE the directory build.
  for (const cfg of registry.stores) {
    if (cfg.name === registry.defaultStoreName) continue
    const seed = createJsonRagStore({ path: cfg.persistenceFile })
    for (const id of seedIds) {
      await seed.putNode(makeNode(id, `content of ${id}`))
    }
  }
  const main = registry.stores.find((s) => s.name === DFLT)!
  const seedMain = createJsonRagStore({ path: main.persistenceFile })
  await seedMain.putNode(makeNode('m1', 'main content'))
  const provider = makeProviderDouble(opts?.onEmbed)
  const plan = buildRagStoreDirectory(registry, { userDataPath: dir, embedderKind: 'vector', provider })
  const directory = plan.directory
  const defaultEntry = directory.entries.get(directory.defaultName)!
  const controller = createRagStoreRuntimeController({
    registry,
    directory,
    defaultEntry,
    vectorBoot: plan.vectorBoot,
    registryPath: regPath,
    userDataPath: dir,
    embedderKind: 'vector',
    provider,
  })
  const orphan = directory.entries.get(NON)!
  const non = registry.stores.find((s) => s.name === NON)!
  return {
    controller,
    directory,
    defaultEntry,
    regPath,
    registry,
    provider,
    oldBoot: plan.vectorBoot,
    cachePath: join(dir, 'provident-vector-cache.json'),
    orphan,
    nonPath: non.persistenceFile,
    mainPath: main.persistenceFile,
  }
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
const WRITE_SRC = fileURLToPath(new URL('../src/main/rag-store-registry-write.ts', import.meta.url))
const DEFAULT_SRC = fileURLToPath(new URL('../src/main/rag-store-default.ts', import.meta.url))

// ---------------------------------------------------------------------------
// P0 — the RCA-1 red markers: the ADDITIVE U-H7 surface is ABSENT on the
// pre-U-H7 code. The suite LOAD-fails earlier on the missing orchestration
// module (§5.9(i)); these markers name the module + the absent methods +
// the non-re-bindable defaults that become the next red layers once that module
// lands.
// ---------------------------------------------------------------------------

describe('P0 — the U-H7 additive surface is ABSENT on the pre-U-H7 code (RCA-1 red markers)', () => {
  it('P0 — the runtime controller exposes hotSetDefault(name): Promise<HotSetDefaultResult> (ABSENT → fails: typeof undefined today)', async () => {
    await withDirAsync(async (dir) => {
      const { controller } = bootRuntime(dir)
      // §5.3 — the ADDITIVE async method (controller 12 → 13 members). `undefined`
      // today (red marker; the default is STABLE — there is NO default-rebind seam).
      expect(typeof (controller as RagStoreRuntimeController & { hotSetDefault?: unknown }).hotSetDefault).toBe('function')
      // §7 Q3 R1 — the sanctioned default-rename is the controller's 14th method.
      // `undefined` today (red marker).
      expect(typeof (controller as RagStoreRuntimeController & { hotRenameDefault?: unknown }).hotRenameDefault).toBe('function')
    })
  })

  it('M-new — the NEW orchestration module rag-store-default.ts EXISTS, exports createDefaultVectorBoot + releaseDefaultVectorBoot (ABSENT → load-fail red; §5.2)', () => {
    // §5.9(i) — the module ABSENT on the pre-U-H7 code; this top-level import
    // already threw, so this body is the named marker (runs once the module lands).
    expect(existsSync(DEFAULT_SRC)).toBe(true)
    expect(typeof createDefaultVectorBoot).toBe('function')
    expect(typeof releaseDefaultVectorBoot).toBe('function')
    // The helper's own D3 / D6 / A-P2-4 negative pins (§5.2) — carried by the module.
    const src = readSrc(DEFAULT_SRC, 'utf8')
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove|truncate)\s*\(/)
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    expect(src).not.toMatch(/console\./)
  })

  it('M-write — the write module gains setDefaultRegistryStore + renameDefaultRegistryStore (+ the setDefault/renameDefault kinds + RegistryDelta.defaultChanged) (ABSENT → fails: typeof undefined today on the pre-U-H7 write module; §5.1 / §5.9 / Q6)', async () => {
    // The write-module amendment (Q6) — RED on the pre-U-H7 write module. The
    // conveniences are resolved via the module namespace (DYNAMIC import) so this
    // file does not double-load-fail on a second absent named export — this
    // marker is reachable once the ORCHESTRATION module exists, and then names
    // the write-module surface as the next red layer.
    const write = await import('../src/main/rag-store-registry-write.js')
    expect(typeof (write as { setDefaultRegistryStore?: unknown }).setDefaultRegistryStore).toBe('function')
    expect(typeof (write as { renameDefaultRegistryStore?: unknown }).renameDefaultRegistryStore).toBe('function')
    // RegistryDelta gains the REQUIRED 4th member — observable on a setDefault
    // delta via the convenience (RED: the kind + member do not exist today).
    const { setDefaultRegistryStore } = write as unknown as {
      setDefaultRegistryStore: (parsed: unknown, dir: string, name: string) => { delta: { defaultChanged?: string[] } }
    }
    const result = setDefaultRegistryStore({ version: 1, stores: [{ name: DFLT, default: true }, { name: NON }] }, join(tmpdir(), 'h7-write'), NON)
    expect(result.delta.defaultChanged).toEqual([NON])
  })

  it('co-existence — the LANDED default-stable paths STAY green: hotApply({kind:"rename"}) on the DEFAULT still propagates W-rename-default (U-H2 F9/HOST-2 + U-H6 F4 — U-H7 does NOT relax it)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      // The legacy rename seam on the DEFAULT → W-rename-default, UNCHANGED.
      let caught: unknown
      try { controller.hotApply({ kind: 'rename', from: DFLT, to: 'x' }) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_RENAME_DEFAULT)
      // The legacy hotRename seam on the DEFAULT → W-rename-default, UNCHANGED.
      let caught2: unknown
      try { await (controller as unknown as { hotRename: (f: string, t: string) => Promise<unknown> }).hotRename(DFLT, 'x') } catch (e) { caught2 = e }
      expect(caught2).toBeInstanceOf(Error)
      expect((caught2 as Error).message).toBe(W_RENAME_DEFAULT)
      // live-untouched + the registry file byte-identical (the default name stays `main`).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H1–H3 — lexical mode default flip + re-bind + same-default NO-OP.
// ---------------------------------------------------------------------------

describe('§5.6 H1–H3 — hotSetDefault in LEXICAL mode re-binds the default, retains the old store (D3), and is a NO-OP on the current default (Q8)', () => {
  it('H1 — hotSetDefault("research-2026-09") resolves {loaded, delta:{added:[],removed:[],renamed:[],defaultChanged:["research-2026-09"]}, drained:0, noop:false}; the new default is bound EVERYWHERE (getDefaultName/getDefaultStore/getDefaultEngine/getDirectory/currentStores/persisted); the OLD default entry is RETAINED non-default with its persistence file BYTE-IDENTICAL', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, mainPath } = await bootSeeded(dir)
      const mainBytes = readFileSync(mainPath, 'utf8')

      // §5.3/§5.4 — the additive async default-flip (RED: undefined today).
      const result = await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)

      // Return shape (§5.3): delta.defaultChanged exactly [name]; drained 0; noop false.
      expect(result.delta).toEqual({ added: [], removed: [], renamed: [], defaultChanged: [NON] })
      expect(result.drained).toBe(0)
      expect(result.noop).toBe(false)
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)
      expect(result.loaded.stores.find((s) => s.name === NON)!.default).toBe(true)

      // UNREGISTER-EVERYWHERE (§4): every accessor reflects the NEW default.
      expect(controller.getDefaultName()).toBe(NON)
      expect(directory.defaultName).toBe(NON)
      const newDefault = directory.entries.get(NON)!
      expect(controller.getDefaultStore()).toBe(newDefault.store)
      expect(controller.getDefaultEngine()).toBe(newDefault.engine)
      expect(controller.getDefaultStore()).not.toBe(directory.entries.get(DFLT)!.store)
      // Lexical mode → getVectorBoot() stays null (there is never a boot).
      expect(controller.getVectorBoot()).toBeNull()
      expect(controller.getDirectory().defaultName).toBe(NON)
      // currentStores advances to `loaded` with the NEW default flagged.
      expect(controller.currentStores().map((s) => s.name).sort()).toEqual([DFLT, NON].sort())
      expect(controller.currentStores().find((s) => s.name === NON)!.default).toBe(true)
      expect(controller.currentStores().find((s) => s.name === DFLT)!.default).toBe(false)

      // D3 / Q4 RETAIN — the OLD default entry is STILL PRESENT as a retained
      // non-default; statusOf resolves; its persistence file is BYTE-IDENTICAL.
      expect(directory.entries.get(DFLT)).toBeDefined()
      expect(controller.statusOf(DFLT)).toBe('loaded')
      expect(readFileSync(mainPath, 'utf8')).toBe(mainBytes)
      // The OLD default entry retains its lexical engine (no teardown in lexical mode).
      expect(directory.entries.get(DFLT)!.engine).toBeDefined()
    })
  })

  it('H6 — the flip write is re-readable (D2): a FRESH loadRagStoreRegistry shows "research-2026-09" default:true and "main" non-default, implicit:false/corrupt:false (persisted == live)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, regPath } = await bootSeeded(dir)
      await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)
      const fresh = loadRagStoreRegistry({ path: regPath })
      expect(fresh.stores.find((s) => s.name === NON)!.default).toBe(true)
      expect(fresh.stores.find((s) => s.name === DFLT)!.default).toBe(false)
      expect(fresh.implicit).toBe(false)
      expect(fresh.corrupt).toBe(false)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
      expect(controller.getDirectory().entries.has(DFLT)).toBe(true)
    })
  })

  it('H2 — the re-bind PROPAGATES to a per-call closure re-reading the accessors (A-P2-1 / closes U-H2 HOST-LOW-1): a closure capturing runtime.getDefaultName()/getDefaultStore()/getDefaultEngine() PER CALL sees the NEW default after the flip, and a query through the default engine serves the NEW default\'s data while the OLD default stays reachable via the directory', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, orphan } = await bootSeeded(dir)
      // A per-call read closure — the shape of EVERY already-rewired U-H2b
      // closure (A-P2-1): it reads the accessors fresh on every invocation.
      const readDefault = () => ({
        name: controller.getDefaultName(),
        store: controller.getDefaultStore(),
        engine: controller.getDefaultEngine(),
        dirName: controller.getDirectory().defaultName,
      })
      expect(readDefault().name).toBe(DFLT)

      await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)

      // The SAME closure now reads the NEW default — ZERO re-rewiring (A-P2-1).
      const after = readDefault()
      expect(after.name).toBe(NON)
      expect(after.store).toBe(directory.entries.get(NON)!.store)
      expect(after.engine).toBe(directory.entries.get(NON)!.engine)
      expect(after.dirName).toBe(NON)
      // A query through the runtime default engine serves the NEW default's data
      // (the seeded `r1` node in research-2026-09).
      const q = await controller.getDefaultEngine().query('content')
      expect(q.ranked[0].nodeId).toBe('r1')
      // The OLD default is STILL reachable via the directory (retained non-default).
      expect(directory.entries.get(DFLT)).toBeDefined()
      expect(orphan.engine).toBeDefined()
      expect(orphan.engine.inFlight()).toBe(0)
    })
  })

  it('H3 — hotSetDefault("main") (the CURRENT default) is a NO-OP: resolves {loaded, delta:{...all-empty}, drained:0, noop:true}; NO write (registry BYTE-IDENTICAL), NO live mutation (default objects unchanged)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, defaultEntry } = await bootSeeded(dir)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const defaultStoreBefore = controller.getDefaultStore()
      const defaultEngineBefore = controller.getDefaultEngine()
      const before = entrySnapshot(directory)

      const result = await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(DFLT)

      // Q8 — the `noop` flag + the all-empty delta. `loaded` = the current registry.
      expect(result.delta).toEqual({ added: [], removed: [], renamed: [], defaultChanged: [] })
      expect(result.drained).toBe(0)
      expect(result.noop).toBe(true)
      expect(result.loaded.defaultStoreName).toBe(DFLT)

      // NO write — the registry file byte-identical; NO live mutation — the
      // default objects are IDENTITY-identical to before.
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
      expect(controller.getDefaultStore()).toBe(defaultStoreBefore)
      expect(controller.getDefaultEngine()).toBe(defaultEngineBefore)
      expect(controller.getDefaultEntry()).toBe(defaultEntry)
      // The live map/objects unchanged (nothing swapped/rebound).
      expectEntriesDeepEqual(before, controller.getDirectory())
    })
  })

  it('multi-store flip — from a 3-store registry, hotSetDefault("research-2026-09") re-binds ONLY the default; the OTHER non-default (research-2026-10) is RETAINED untouched; currentStores lists all three with the NEW default flagged', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, orphan } = await bootSeeded(dir, ['r1'], THREE_STORES)
      expect([...directory.entries.keys()].sort()).toEqual([DFLT, NON, 'research-2026-10'].sort())
      const tenBefore = controller.getDirectory().entries.get('research-2026-10')!

      const result = await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)

      expect(result.delta.defaultChanged).toEqual([NON])
      expect(controller.getDefaultName()).toBe(NON)
      // The other non-default is retained (same object identity — not rebuilt).
      expect(directory.entries.has('research-2026-10')).toBe(true)
      expect(directory.entries.get('research-2026-10')).toBe(tenBefore)
      expect(controller.statusOf('research-2026-10')).toBe('loaded')
      // currentStores lists all three, with the NEW default + the OLD default now
      // non-default.
      expect(controller.currentStores().map((s) => s.name).sort()).toEqual([DFLT, NON, 'research-2026-10'].sort())
      expect(controller.currentStores().find((s) => s.name === NON)!.default).toBe(true)
      expect(controller.currentStores().find((s) => s.name === DFLT)!.default).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H7 — the retained OLD default is a genuine non-default entry whose file
// (a fresh store over it) still loads the same nodes (D3/D4: stranded intact).
// ---------------------------------------------------------------------------

describe('§5.6 H7 — the OLD default is a retained non-default entry; its persistence file is stranded intact (D3/D4)', () => {
  it('H7 — after the flip, statusOf("main") still resolves; the retained main entry is present in the directory; a FRESH store over the retained main persistence file still loads the same nodes (the file was never deleted/rewritten)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, mainPath } = await bootSeeded(dir)
      const mainBytes = readFileSync(mainPath, 'utf8')

      await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)

      expect(controller.statusOf(DFLT)).toBe('loaded')
      const retained = directory.entries.get(DFLT)!
      expect(retained).toBeDefined()
      // The retained entry is an ordinary non-default lexical entry (serving).
      expect(retained.engine.inFlight()).toBe(0)
      expect(await retained.engine.query('main').then((r) => r.ranked.some((x) => x.nodeId === 'm1')).catch(() => false)).toBe(true)
      // The stranded file is byte-identical + a FRESH store over it loads the
      // same node (the data was never deleted/migrated — D3/D4).
      expect(readFileSync(mainPath, 'utf8')).toBe(mainBytes)
      const reloaded = createJsonRagStore({ path: mainPath })
      expect(reloaded.getNode('m1')?.id).toBe('m1')
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H8 — the DEFAULT's sanctioned RENAME (Q3 R1): hotRenameDefault keeps it
// default under the new name; the LEGACY path still rejects (F9).
// ---------------------------------------------------------------------------

describe('§5.6 H8 — the default\'s sanctioned rename keeps it default (D4 fold; the legacy W-rename-default is NOT relaxed)', () => {
  it('H8 — hotRenameDefault("main-new") keeps the store default: getDefaultName()="main-new", still default:true at the write level, delta.renamed===[{from:"main",to:"main-new"}], delta.defaultChanged===["main-new"]; the accessors follow the new name; a fresh load shows the renamed store default:true', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const beforeDefaultStore = controller.getDefaultStore()

      const result = await (controller as unknown as { hotRenameDefault: HotRenameDefaultShape }).hotRenameDefault('main-new')

      // D4 fold — the rename delta + the defaultChanged member.
      expect(result.delta.renamed).toEqual([{ from: DFLT, to: 'main-new' }])
      expect(result.delta.defaultChanged).toEqual(['main-new'])
      expect(result.drained).toBe(0)
      // The store is STILL default under the new name.
      expect(controller.getDefaultName()).toBe('main-new')
      expect(directory.defaultName).toBe('main-new')
      // The default store/engine object identities are RETAINED (a rename, not a
      // removal+re-add — the same store stays default).
      expect(directory.entries.get('main-new')).toBeDefined()
      expect(controller.getDefaultStore()).toBe(beforeDefaultStore)
      expect(directory.entries.has(DFLT)).toBe(false)
      // Persisted == live (D2).
      const fresh = loadRagStoreRegistry({ path: regPath })
      expect(fresh.stores.find((s) => s.name === 'main-new')!.default).toBe(true)
      expect(fresh.stores.some((s) => s.name === DFLT)).toBe(false)
    })
  })

  it('F9 — the LEGACY paths on the default STILL throw W-rename-default (Q3 R1: the sanctioned rename does NOT relax the legacy guard; U-H2 F9/HOST-2 + U-H6 F4 stay green)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      let caught: unknown
      try { controller.hotApply({ kind: 'rename', from: DFLT, to: 'x' }) } catch (e) { caught = e }
      expect((caught as Error)?.message).toBe(W_RENAME_DEFAULT)
      // live-untouched + disk byte-identical.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.6 H4–H5 — VECTOR mode: the flip re-warms the new default (construct-first)
// + tears down the OLD default's vector boot LAST (store retained). The new boot
// builds in the background (W1 parity).
// ---------------------------------------------------------------------------

describe('§5.6 H4–H5 — VECTOR mode: construct-new-before-teardown-old re-warm + old-boot teardown on a RETAINED store (D5/Q4/Q7)', () => {
  it('H4 — hotSetDefault("research-2026-09") in vector mode resolves {drained:0, noop:false}; getVectorBoot() is a NEW controller identity; getDefaultEngine() = the NEW boot\'s (born-lexical-pending) engine; the OLD default\'s vector engine query() throws "retrieval engine: torn down"; the OLD default store is RETAINED with a FRESH lexical engine; the vector-CACHE file is RE-READ via content-addressed reuse (never deleted by the teardown)', async () => {
    await withDirAsync(async (dir) => {
      // Gate the NEW boot's background build so it never reaches promotion/flush
      // during the assertions (deterministic cache byte-compare + pending state).
      const gate = makeDeferred()
      const { controller, directory, oldBoot, cachePath } = await bootVectorSeeded(dir, ['r1'], DEFAULT_STORES, {
        onEmbed: () => gate.promise,
      })
      const oldEngine: RetrievalEngine = oldBoot!.engine
      const oldBootIdentity = oldBoot
      expect(controller.getVectorBoot()).toBe(oldBoot)

      // Seed the shared content-addressed cache file + capture bytes (the Q7
      // hand-off target: never deleted/flushed by the OLD boot teardown).
      const cache = createVectorCache({ path: cachePath })
      cache.set({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: contentHashOf('main content') }, [0.5, 0.5, 0.5, 0.5])
      await cache.flush()
      const cacheBytes = readFileSync(cachePath, 'utf8')
      // The content-addressed cache (§5.13, immutable) stores the sha256
      // contentHash hex — NEVER the raw text. Verify the cache captured the
      // content's hash (computed the same way the cache does).
      expect(cacheBytes).toContain(contentHashOf('main content'))

      const result = await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)

      expect(result.drained).toBe(0)
      expect(result.noop).toBe(false)
      expect(result.delta.defaultChanged).toEqual([NON])
      expect(controller.getDefaultName()).toBe(NON)

      // Q7 — the NEW boot re-reads the SAME content-addressed cache file: the
      // file was NOT deleted by the OLD boot teardown (byte-identical while the
      // gated new build has not flushed) + a fresh cache still re-reads it.
      expect(readFileSync(cachePath, 'utf8')).toBe(cacheBytes)
      const reread = createVectorCache({ path: cachePath })
      expect(reread.get({ kind: 'ollama', model: 'embeddinggemma', dimension: 4, contentHash: contentHashOf('main content') })).toEqual([0.5, 0.5, 0.5, 0.5])

      // The NEW default serves via a NEW boot controller (a DIFFERENT identity).
      const newBoot = controller.getVectorBoot()
      expect(newBoot).not.toBe(null)
      expect(newBoot).not.toBe(oldBootIdentity)
      expect(controller.getDefaultEngine()).toBe(newBoot!.engine)
      // Born-lexical pending — the new default serves LEXICALLY until the
      // background build promotes (gated here, so still pending).
      expect(newBoot!.phase()).toBe('pending')

      // The OLD boot was torn down LAST: its captured engine query() throws.
      let qErr: unknown
      try { await oldEngine.query('x') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)

      // Q4 — the OLD default store is RETAINED as a non-default entry with a
      // FRESH LEXICAL engine (statusOf still resolves).
      const retained = directory.entries.get(DFLT)!
      expect(retained).toBeDefined()
      expect(controller.statusOf(DFLT)).toBe('loaded')
      // Its entry engine is a FRESH LEXICAL engine (NOT the torn-down old boot).
      expect(retained.engine).not.toBe(oldEngine)

      // Let the gated background build settle so no work is left dangling.
      gate.resolve()
      await new Promise((r) => setTimeout(r, 5))
    })
  })

  it('H5 — the re-warmed NEW-default boot builds in the background (W1 parity): after the flip the new boot PROMOTES, the provider is called, and the promoted engine serves VECTOR; the RUNTIME emits NO console (the boot logs its own milestones)', async () => {
    await withDirAsync(async (dir) => {
      const lines: string[] = []
      const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map((m) => vi.spyOn(console, m).mockImplementation((...args: unknown[]) => { lines.push(args.map((a) => String(a)).join(' ')) }))
      try {
        const { controller, provider, oldBoot } = await bootVectorSeeded(dir, ['r1'], DEFAULT_STORES)
        const oldBootIdentity = oldBoot
        const embedBefore = provider.embedTexts.length
        await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)
        const newBoot = controller.getVectorBoot()!
        expect(newBoot).not.toBe(oldBootIdentity)
        // The background build promotes (deterministic mock provider completes).
        await vi.waitFor(() => { expect(newBoot.phase()).toBe('promoted') })
        // The provider was called to embed the new default's content.
        expect(provider.embedTexts.length).toBeGreaterThan(embedBefore)
        // The promoted engine serves vector (the mock embedder's score is
        // deterministically non-empty for a content-matched query).
        const q = await controller.getDefaultEngine().query('content')
        expect(q.ranked.length).toBeGreaterThan(0)
        // A later post-teardown start() on the OLD boot would reject — but the
        // OLD boot is already STOPPED, so its start() rejects 'vector boot: torn down' (not re-tested here; the old boot object is dropped).
        // 0-runtime-console census: NO line is emitted by the RUNTIME module.
        expect(lines.some((l) => l.startsWith('rag-store-runtime'))).toBe(false)
      } finally {
        for (const s of spies) s.mockRestore()
      }
    })
  })
})

// ---------------------------------------------------------------------------
// §5.7 fail-states — hotSetDefault propagates WITHOUT any teardown / mutation
// (F1/F2/F4/F5/F6), and the drain gate is UNBOUNDED (F8) + legacy-closed (F9).
// ---------------------------------------------------------------------------

describe('§5.7 fail-states — hotSetDefault fails loud with live+disk UNTOUCHED + NO teardown (F1/F2/F4/F5/F6), UNBOUNDED drain (F8)', () => {
  it('F1 — hotSetDefault(null/5/""/no-arg) → R-set-default-arg "default store name required" (locally-thrown top-of-method guard); live-untouched; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotSetDefault = (controller as unknown as { hotSetDefault: HotSetDefaultLoose }).hotSetDefault.bind(controller)

      const bads: unknown[] = [null, 5, '', undefined]
      for (const bad of bads) {
        let e: unknown
        try { await hotSetDefault(bad) } catch (err) { e = err }
        expect((e as Error)?.message).toBe(R_SET_DEFAULT_ARG)
      }
      // live-untouched + the registry file byte-identical + NO teardown.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDirectory().entries.has(DFLT)).toBe(true)
    })
  })

  it('F2 — hotSetDefault("nope") (unknown) → the write module\'s W-set-default-unknown PROPAGATES byte-pinned; live-untouched; NO teardown; the default name unchanged', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const hotSetDefault = (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault.bind(controller)

      let caught: unknown
      try { await hotSetDefault('nope') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(W_SET_DEFAULT_UNKNOWN('nope'))
      // live-untouched + disk byte-identical + default unchanged.
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('F4 — hotSetDefault whose persist hits a native fs failure → the NATIVE Error PROPAGATES; live-untouched; the ORIGINAL registry file intact; NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBytes = readFileSync(regPath, 'utf8')
      // Make the temp write fail natively: `path + ".tmp"` becomes a DIRECTORY.
      mkdirSync(`${regPath}.tmp`, { recursive: true })
      const hotSetDefault = (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault.bind(controller)

      let caught: unknown
      try { await hotSetDefault(NON) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message.startsWith('EISDIR') || (caught as Error).message.startsWith('EACCES')).toBe(true)
      // live-untouched + the ORIGINAL registry file intact + NO teardown (the
      // default engine still serving).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(regBytes)
      expect(controller.getDefaultName()).toBe(DFLT)
      expect(controller.getDirectory().entries.has(NON)).toBe(true)
      expect(await controller.getDefaultEngine().query('still').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F5 — vector mode: the NEW default\'s vector boot CONSTRUCTION throws (a construct/factory failure) → the construct Error PROPAGATES before the write; disk+live UNTOUCHED; NO write, NO teardown', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, oldBoot } = await bootVector(dir)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      const defaultStoreBefore = controller.getDefaultStore()
      const oldEngine: RetrievalEngine = oldBoot!.engine
      // Force the NEW default's construct to throw: the new-default store's
      // `listNodes()` throws synchronously inside createDefaultVectorBoot /
      // createVectorBootController (before the write — construct-first, §5.4 step 4).
      const newDefault = directory.entries.get(NON)!
      ;(newDefault as RagStoreEntry).store = {
        listNodes: () => { throw new Error('construct boom') },
      } as unknown as RagStore

      const hotSetDefault = (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault.bind(controller)
      let caught: unknown
      try { await hotSetDefault(NON) } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe('construct boom')
      // Disk + live UNTOUCHED (the construct threw BEFORE the write): registry
      // byte-identical, the default unchanged, NO teardown.
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
      expect(controller.getDefaultStore()).toBe(defaultStoreBefore)
      // The OLD default's vector boot was NOT torn down (still serving).
      expect(await oldEngine.query('still').then(() => true).catch(() => false)).toBe(true)
    })
  })

  it('F6 — hotApply({kind:"setDefault", name}) (the default-stable seam given a setDefault) → R-set-default-through-hot-apply "default reassignment must use hotSetDefault"; live-untouched (hotApply stays default-stable)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')
      let caught: unknown
      try {
        controller.hotApply({ kind: 'setDefault', name: NON } as unknown as Parameters<typeof controller.hotApply>[0])
      } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_SET_DEFAULT_THROUGH_HOT_APPLY)
      // live-untouched + disk byte-identical (hotApply did NOT write a setDefault).
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(join(dir, 'provident-rag-stores.json'), 'utf8')).toBe(regBefore)
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('F8 — the OLD default\'s vector engine has an in-flight query at teardown → releaseDefaultVectorBoot\'s UNBOUNDED drain blocks on `inFlight()` until it settles; the engine is NEVER torn down mid-query (A-P2-2); drained resolves 0', async () => {
    await withDirAsync(async (dir) => {
      // Module-level on the NEW helper (RED on the absent module): hold the OLD
      // boot's engine next query pending via a gated embedder, call
      // releaseDefaultVectorBoot (not awaited), assert the drain blocks + the
      // engine is not marked stopped, then settle → drained:0.
      const { oldBoot } = await bootVector(dir)
      const d = makeDeferred()
      const engine: RetrievalEngine = oldBoot!.engine
      engine.setEmbedder(makeDeferredEmbedder(d))
      const pending = engine.query('hello')
      await vi.waitFor(() => { expect(engine.inFlight()).toBe(1) })

      let releaseErr: unknown
      let releaseP: Promise<unknown> | null = null
      try {
        releaseP = releaseDefaultVectorBoot(oldBoot!)
      } catch (e) { releaseErr = e }
      // On red releaseDefaultVectorBoot is absent → a synchronous load-fail red at
      // the top of the file; if reached here the module exists → assert no sync throw.
      expect(releaseErr).toBeUndefined()

      // The drain blocks while the query is in flight (UNBOUNDED — never settles,
      // never marked stopped).
      await new Promise((r) => setTimeout(r, 40))
      expect(engine.inFlight()).toBe(1)
      let settled = false
      releaseP!.then(() => { settled = true })
      await new Promise((r) => setTimeout(r, 20))
      expect(settled).toBe(false)

      // Settle the query → the drain proceeds → the boot fully releases.
      d.resolve()
      await pending
      const result = (await releaseP) as { drained: number }
      expect(result.drained).toBe(0)
      // The engine is now STOPPED (torn down only AFTER the query settled).
      let qErr: unknown
      try { await engine.query('after') } catch (e) { qErr = e }
      expect(qErr).toBeInstanceOf(Error)
      expect((qErr as Error).message).toBe(TD_ENGINE)
    })
  })

  it('F-hang — a genuinely never-settling in-flight query on the OLD default\'s vector engine blocks the UNBOUNDED drain (A-P2-2 correctness; F-H5-3 awareness) — it does NOT throw and does NOT settle until the query settles', async () => {
    await withDirAsync(async (dir) => {
      const { oldBoot } = await bootVector(dir)
      const never = new Promise<void>(() => {}) // never settles
      const engine: RetrievalEngine = oldBoot!.engine
      // makeDeferredEmbedder reads `d.promise` — pass the DEFERRED shape (a raw
      // Promise has `.promise === undefined`, so `await undefined` would settle
      // immediately and the never-stayed-in-flight query would NOT block the drain).
      engine.setEmbedder(makeDeferredEmbedder({ promise: never }))
      void engine.query('stuck')
      await vi.waitFor(() => { expect(engine.inFlight()).toBe(1) })

      // releaseDefaultVectorBoot MUST NOT settle while the query is stuck (the
      // drain is UNBOUNDED — it blocks, never throws, never tears down mid-query).
      let releaseErr: unknown
      let releaseP: Promise<unknown> | null = null
      try { releaseP = releaseDefaultVectorBoot(oldBoot!) } catch (e) { releaseErr = e }
      expect(releaseErr).toBeUndefined()
      await new Promise((r) => setTimeout(r, 40))
      expect(engine.inFlight()).toBe(1)
      let settled = false
      releaseP!.then(() => { settled = true })
      await new Promise((r) => setTimeout(r, 20))
      expect(settled).toBe(false)
      // (The test releases by abandoning the pending promise — the temp dir is
      // removed in withDirAsync; no settled-await here, per the §7 Q10 UNBOUNDED
      // contract that a never-settling query hangs, not the drain throwing.)
    })
  })
})

// ---------------------------------------------------------------------------
// §5.8 negative pins — D6 / A-P2-4 / A-P2-8 / D3 / D4 / D5 / D8 + the N1 status
// (STAYS GREEN on the pre-U-H7 code; U-H7 keeps the runtime N1/A-P2-8-clean).
// ---------------------------------------------------------------------------

describe('§5.8 negative pins — the runtime STAYS N1/A-P2-8-grep-clean + no-MCP/no-IPC/no-delete/no-console; the new orchestration module is the teardown holder', () => {
  it('N1/A-P2-8 — rag-store-runtime.ts STILL defines NO teardown/close/destroy literal (RED: it ALSO lacks the required releaseDefaultVectorBoot/createDefaultVectorBoot references — the identifiers the Implementer must add), and references no MCP/IPC/delete/console primitive', () => {
    expect(existsSync(RUNTIME_SRC)).toBe(true)
    const src = readSrc(RUNTIME_SRC, 'utf8')
    // The HARD §5.8 requirement: no comment/docstring/identifier in the runtime
    // may contain the literal `teardown(` (the teardown calls live ONLY in
    // rag-store-default.ts + the reused rag-store-remove.ts).
    expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)
    // The runtime references ONLY the helper identifiers (no lowercase teardown).
    // RED on the pre-U-H7 code: these are ABSENT (the default is not re-bindable).
    expect(src).toMatch(/releaseDefaultVectorBoot\s*\(/)
    expect(src).toMatch(/createDefaultVectorBoot\s*\(/)
    // N2 — no MCP / IPC / delete / console.
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove)\s*\(/)
    expect(src).not.toMatch(/console\./)
  })

  it('D6 / A-P2-4 — U-H7 adds NO MCP tool / NO IPC channel / NO stores:"all" fan-out change: the write module keeps its no-MCP/no-IPC pins and the runtime adds none (the mechanism is the CONTROLLER only; the operator trigger is U-H8)', () => {
    // The runtime pins (STAYS GREEN + asserted above). The write module (U-H1's
    // file, Q6-amended) keeps its structural no-delete / no-MCP / no-IPC pins.
    const src = readSrc(WRITE_SRC, 'utf8')
    expect(src).not.toMatch(/\bALL_TOOLS\b/)
    expect(src).not.toMatch(/\bRpcMethod\b/)
    expect(src).not.toMatch(/\bMUTATING_METHODS\b/)
    expect(src).not.toMatch(/\bIPC_[A-Z_]+\b/)
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove)\s*\(/)
    expect(src).not.toMatch(/console\./)
  })

  it('D3 — the teardown NEVER deletes: the new orchestration module imports NO delete/truncate primitive (the OLD default store + the vector-cache file STRAND byte-identical)', () => {
    // RED on the pre-U-H7 code — the module does not exist (load-fail red at the
    // top of the file); this body asserts the pin once it lands.
    expect(existsSync(DEFAULT_SRC)).toBe(true)
    const src = readSrc(DEFAULT_SRC, 'utf8')
    expect(src).not.toMatch(/\b(unlink|rm|rmdir|remove|truncate)\s*\(/)
  })
})

// ---------------------------------------------------------------------------
// RCA-3 HOST regressions (HOST-1..5) — the read-only adversarial pass findings
// on the U-H7 green. Each MUST HAVE FAILED on the pre-fix code (RED-first) and
// PASS after the fix. Regression-tested per host finding here.
// ---------------------------------------------------------------------------

describe('RCA-3 HOST regressions — HOST-1..5 (adversarial findings fixed + pinned)', () => {
  it('HOST-1 — after hotSetDefault re-binds the default, a post-reassignment hotRemove AND hotRename of a non-default SUCCEED (no stale-default drift throw, no live-map scramble, the re-bind survives hot-* ops)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory } = await bootSeeded(dir, ['r1'], THREE_STORES)
      // Reassign the default (main → research-2026-09).
      const result = await (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault(NON)
      expect(result.delta.defaultChanged).toEqual([NON])
      expect(controller.getDefaultName()).toBe(NON)
      const nonDefaultStore = directory.entries.get(NON)!.store

      // hotRemove of a non-default AFTER the reassignment must SUCCEED (the F15/
      // F16 drift guard compares the loaded default against the RE-BOUND default's
      // persistence file, NOT the stale boot default's — HOST-1).
      const hotRemove = (controller as unknown as { hotRemove: (n: string) => Promise<{ delta: { removed: string[] } }> }).hotRemove.bind(controller)
      const rem = await hotRemove('research-2026-10')
      expect(rem.delta.removed).toEqual(['research-2026-10'])
      expect(controller.getDefaultName()).toBe(NON)
      expect(directory.entries.has('research-2026-10')).toBe(false)
      expect(controller.getDefaultStore()).toBe(nonDefaultStore)

      // hotRename of a NON-default (the retained OLD default `main`) AFTER the
      // reassignment must SUCCEED too (no drift-throw / scramble).
      const hotRename = (controller as unknown as { hotRename: (f: string, t: string) => Promise<{ delta: { renamed: { from: string; to: string }[] } }> }).hotRename.bind(controller)
      const ren = await hotRename(DFLT, 'main-renamed')
      expect(ren.delta.renamed).toEqual([{ from: DFLT, to: 'main-renamed' }])
      // The reassigned default is still bound + its store identity is retained.
      expect(controller.getDefaultName()).toBe(NON)
      expect(controller.getDefaultStore()).toBe(nonDefaultStore)
      expect(controller.getDefaultStore()).toBe(directory.entries.get(NON)!.store)
      expect(directory.entries.has(DFLT)).toBe(false)
    })
  })

  it('HOST-2 — hotRenameDefault on a default whose data carries persisted `<from>:`-prefixed ids is DECLINED with R-rename-ids-present (D4/A-P2-5), BEFORE the write; disk + live UNTOUCHED', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(regPath, 'utf8')
      // Seed the CURRENT default (main) with a `main:`-prefixed node id so the
      // D4 persisted-id scan fires on the default-rename.
      await directory.entries.get(DFLT)!.store.putNode(makeNode(`${DFLT}:docid`, 'persisted'))

      const hotRenameDefault = (controller as unknown as { hotRenameDefault: HotRenameDefaultShape }).hotRenameDefault.bind(controller)
      let caught: unknown
      try { await hotRenameDefault('main-new') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_RENAME_IDS(DFLT))
      // Disk NOT written + live untouched (the decline fires BEFORE the write).
      expect(readFileSync(regPath, 'utf8')).toBe(regBefore)
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(controller.getDefaultName()).toBe(DFLT)
    })
  })

  it('HOST-3 — an external mid-run default edit surfaces fail-loud on hotRenameDefault (the F7 drift guard): the re-key is gated on the freshly-loaded default and the live directory is SYNCHRONIZED to `loaded` before the R-default-changed throw (D2 preserved)', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir, ['r1'], THREE_STORES)
      // Externally edit the registry on disk so research-2026-09 becomes the
      // default (the live directory.defaultName is still `main` — a drift the
      // hotRenameDefault must detect instead of blindly re-keying the live
      // default). Done through the write module (NOT the controller — a separate
      // "external" mid-run edit that preserves the derived persistenceFile so the
      // seeded research-2026-09 file keeps associating with research-2026-09).
      writeRegistryMutation({ path: regPath, mutation: { kind: 'setDefault', name: NON } })

      const hotRenameDefault = (controller as unknown as { hotRenameDefault: HotRenameDefaultShape }).hotRenameDefault.bind(controller)
      let caught: unknown
      try { await hotRenameDefault('main-new') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_DEFAULT_CHANGED)
      // Live SYNCHRONIZED to `loaded`: the default follows the newly-renamed
      // store (research-2026-09's data — the seeded `r1`), NOT the stale live
      // `main` — the re-key was correctly GATED (D2 persisted==live).
      expect(controller.getDefaultName()).toBe('main-new')
      expect(directory.defaultName).toBe('main-new')
      expect(directory.entries.has('main-new')).toBe(true)
      // The D2 discriminator: the SYNCHRONIZED live map follows `loaded` — the
      // formerly-default `main` is RETAINED as a non-default entry (rebuilt from
      // `loaded`). The PRE-FIX (unguarded) re-key instead DELETED `main` and
      // re-keyed its entry to `main-new`, which is the live/disk divergence this
      // guard prevents. (query-data assertions are avoided here: with a DERIVED
      // persistenceFile the rename re-derives the file under the new name, so the
      // old seeded file is not what `main-new` maps to — the structural synced-map
      // assertion is the correct D2 discriminator.)
      expect(directory.entries.has(DFLT)).toBe(true)
      expect(directory.entries.get(DFLT)!.name).toBe(DFLT)
      // The disk write (the renameDefault of the edited default) persisted:
      // D2 round-trip — a fresh load shows main-new default.
      const fresh = loadRagStoreRegistry({ path: regPath })
      expect(fresh.defaultStoreName).toBe('main-new')
    })
  })

  it('HOST-4 — hotRenameDefault with a WHITESPACE-ONLY `to` is rejected by the locally-thrown `to required` guard (no whitespace rename of the default); live + disk untouched', async () => {
    await withDirAsync(async (dir) => {
      const { controller, directory, regPath } = await bootSeeded(dir)
      const before = entrySnapshot(directory)
      const regBefore = readFileSync(regPath, 'utf8')
      const hotRenameDefault = (controller as unknown as { hotRenameDefault: HotRenameDefaultShape }).hotRenameDefault.bind(controller)

      let caught: unknown
      try { await hotRenameDefault('   ') } catch (e) { caught = e }
      expect((caught as Error)?.message).toBe(W_SET_DEFAULT_ARG_TO)
      expect(controller.getDefaultName()).toBe(DFLT)
      expectEntriesDeepEqual(before, controller.getDirectory())
      expect(readFileSync(regPath, 'utf8')).toBe(regBefore)
    })
  })

  it('HOST-5 — a SECOND hotSetDefault while one is in flight (draining the OLD default\'s vector boot) is REJECTED with `default reassignment already in progress` (no two concurrent reassignments / no second boot started)', async () => {
    await withDirAsync(async (dir) => {
      const gate = makeDeferred()
      const { controller, directory, oldBoot, regPath } = await bootVector(dir, THREE_STORES, { onEmbed: () => gate.promise })
      // Hold an in-flight query on the OLD default's boot engine so the FIRST
      // reassignment blocks at its UNBOUNDED drain (A-P2-2).
      const engine = oldBoot!.engine
      engine.setEmbedder(makeDeferredEmbedder(gate))
      const pending = engine.query('hello')
      await vi.waitFor(() => expect(engine.inFlight()).toBe(1))

      const hotSetDefault = (controller as unknown as { hotSetDefault: HotSetDefaultShape }).hotSetDefault.bind(controller)
      const p1 = hotSetDefault(NON)
      // Allow p1 to advance to the old-boot drain (blocked on the gated query).
      await new Promise((r) => setTimeout(r, 30))
      // A SECOND concurrent reassignment to a DIFFERENT store → rejected (the
      // guard fires BEFORE any write/construct — no second boot is started).
      let caught: unknown
      try { await hotSetDefault('research-2026-10') } catch (e) { caught = e }
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe(R_REASSIGN_IN_FLIGHT)

      // Settle the drain → p1 completes normally; ONLY the `NON` flip wrote
      // (research-2026-10 is untouched — the second reassignment was rejected).
      gate.resolve()
      await pending
      const r1 = await p1
      expect(r1.noop).toBe(false)
      expect(r1.delta.defaultChanged).toEqual([NON])
      expect(controller.getDefaultName()).toBe(NON)
      expect(controller.getDirectory().defaultName).toBe(NON)
      const fresh = loadRagStoreRegistry({ path: regPath })
      expect(fresh.stores.find((s) => s.name === NON)!.default).toBe(true)
      expect(fresh.stores.find((s) => s.name === 'research-2026-10')!.default).toBe(false)
      // The reassigned default's entry is the NEW boot's engine (one boot).
      const newBootEntry = directory.entries.get(NON)!
      expect(controller.getDefaultEngine()).toBe(newBootEntry.engine)
    })
  })
})

// ---------------------------------------------------------------------------
// Documented-not-authored (§5.7 / §5.5) — the defensive rows a RED test cannot
// deterministically REACH through the public seam on the pre/post code:
//   F3  — already covered as the happy-path NO-OP (H3); not re-stated as a fail.
//   F7  — R-default-changed is DEFENSIVE, reachable only through an EXTERNAL
//         mid-run registry default edit the setDefault re-read would pick up
//         (the write module guarantees defaultStoreName === name for a setDefault,
//         so no clean in-process trigger exists — recorded, not authored).
//   W-set-default-arg  — the write conveniences' requireName guard (the module
//         namespace resolution is exercised in M-write once the module lands).
//   R-set-default-through-hot-apply / W-set-default-nop — the write module's
//         defensive same-default no-op (the runtime pre-checks via Q8 NO-OP, so
//         W-set-default-nop is the write-module layer's defensive row; the runtime
//         never reaches it on the Q8 path).
// ---------------------------------------------------------------------------
