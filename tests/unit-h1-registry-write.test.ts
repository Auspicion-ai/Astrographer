// tests/unit-h1-registry-write.test.ts — Unit U-H1: the registry WRITE module
// (docs/specs/unit-h1-registry-write.md §5.1–§5.10, §6).
//
// RED SET (RCA-1) — written BEFORE any implementation exists. The module
// `src/main/rag-store-registry-write.ts` does NOT exist yet, so this file
// cannot even LOAD (missing-module import — the house red pattern); test 01
// names the module as the explicit red marker. Every assertion below derives
// from the spec ALONE:
//   §5.3       the pinned 6-function export surface + 4 types
//   §5.4       the write-module W-* messages + F1–F14/G-dir propagation order
//   §5.6 H1–H14  pure-mutator happy states (+ H6 double-validation + H13 rp)
//   §5.6 F1–F26  the write-module fail-state set (exact byte-pinned messages)
//   §5.7 R1–R5  atomicity / round-trip / never-diverge / never-hot-mutate
//   §5.9        the structural no-REMOVE pin + D6 no-IPC/MCP negative
//
// Conventions follow tests/unit-ms1-store-registry.test.ts (vitest node
// environment, `.js` import suffix for main-process ESM modules, temp dirs via
// node:fs mkdtempSync + rmSync, byte-exact catch + toBe assertions). The
// loader (`rag-store-registry.js`) is already green; the RED here is the
// MISSING write module. NO test touches real repo/userData paths.
import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  statSync,
  chmodSync,
  existsSync,
} from 'node:fs'

// REGRESSION (F-H1-2): module-wide fs passthrough mock so the stat-race
// regression test can make `statSync` throw ENOENT (as if the file vanished
// between `existsSync` and `statSync`) WITHOUT touching the real fs. Default
// is passthrough to the real node:fs; the race test flips the flag.
const fsStatsState: { statThrowsENOENT: boolean } = { statThrowsENOENT: false }
vi.mock('node:fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:fs')>()
  return {
    ...actual,
    statSync: vi.fn((p: string, opts?: Parameters<typeof actual.statSync>[1]) => {
      if (fsStatsState.statThrowsENOENT) {
        throw Object.assign(new Error(`ENOENT: no such file or directory, stat '${p}'`), { code: 'ENOENT' })
      }
      return actual.statSync(p, opts)
    }),
  }
})
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyRegistryMutation,
  addRegistryStore,
  removeRegistryStore,
  renameRegistryStore,
  setDefaultRegistryStore,
  renameDefaultRegistryStore,
  persistRagStoreRegistry,
  writeRegistryMutation,
  type RegistryMutation,
  type RegistryMutationResult,
  type RegistryWriteResult,
} from '../src/main/rag-store-registry-write.js'
import {
  loadRagStoreRegistry,
  resolveRegistry,
  type RagStoreConfig,
} from '../src/main/rag-store-registry.js'
import * as writeModule from '../src/main/rag-store-registry-write.js'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// message assertions via catch + toBe — vitest's toThrow does substring
// matching, which is NOT enough for the §5.5 byte-pinned census).
// ---------------------------------------------------------------------------

function withDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'provident-h1-'))
  try {
    run(dir)
  } finally {
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

/** Assert `run` throws SOME Error whose message has the given prefix.
 *  Used for the NATIVE fs-error family (F22/F23/R1), where the message is
 *  NOT byte-pinned — only the throw path is. */
function expectThrowAny(run: () => unknown, prefix?: string): void {
  let caught: unknown
  try {
    run()
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a native fs throw${prefix ? ` (prefix ${prefix})` : ''}`).toBeInstanceOf(Error)
  if (prefix !== undefined) {
    expect((caught as Error).message.startsWith(prefix)).toBe(true)
  }
}

const REG_FILE = 'provident-rag-stores.json'

// The write-module's OWN pinned messages (§5.5, W-* family).
const WRITE = 'rag-store-registry-write:'
const W_PATH = `${WRITE} path required`
const W_CONFIGS = `${WRITE} configs required`
const W_MUTATION = `${WRITE} mutation required`
const W_ADD_STORE = `${WRITE} add store required`
const W_addExisting = (name: string): string => `${WRITE} store '${name}' already exists`
const W_removeUnknown = (name: string): string => `${WRITE} cannot remove unknown store '${name}'`
const W_renameUnknownFrom = (from: string): string => `${WRITE} cannot rename unknown store '${from}'`
const W_renameTargetExists = (from: string, to: string): string =>
  `${WRITE} store '${from}' cannot be renamed to '${to}': '${to}' already exists`
const W_RENAME_DEFAULT = `${WRITE} the default store cannot be renamed (default reassignment is a separate unit)`
const W_unreadable = (path: string): string =>
  `${WRITE} registry file unreadable (${path}); refusing to mutate a corrupt registry`
const W_argRequired = (param: string): string => `${WRITE} ${param} required`
// W-kind: the `<kind>` is rendered via the loader's total+capped jsonOf — a
// string kind renders as its JSON-quoted form (§5.5).
const W_kind = (kindJson: string): string => `${WRITE} unknown mutation kind '${kindJson}'`

// The loader's byte-pinned messages (§5.4 — copied verbatim from
// tests/unit-ms1-store-registry.test.ts; NOT re-listed in the H1 spec).
const F1 = 'rag-store-registry: registry must be an object'
const f2 = (got: string): string => `rag-store-registry: unsupported registry version (got ${got})`
const F3 = 'rag-store-registry: stores must be an array'
const f6 = (i: number, got: string): string =>
  `rag-store-registry: stores[${i}].name must match ^[a-z0-9][a-z0-9_-]{0,63}$ (got ${got})`
const f7 = (i: number, got: string): string =>
  `rag-store-registry: stores[${i}].default must be a boolean (got ${got})`
const f8 = (i: number, got: string): string =>
  `rag-store-registry: stores[${i}].persistenceFile must be an absolute path (got ${got})`
const f9 = (i: number, got: string): string =>
  `rag-store-registry: stores[${i}].corpusRoot must be an absolute path (got ${got})`
const F10 = 'per-store embedder config is not supported yet'
const f11 = (name: string): string => `rag-store-registry: duplicate store name '${name}'`
const f12 = (n: number): string =>
  `rag-store-registry: exactly one store must have default: true (found ${n})`
const f13 = (resolvedPath: string, earlier: string, current: string): string =>
  `rag-store-registry: persistence file collision: ${resolvedPath} (stores '${earlier}', '${current}')`
const f14 = (resolvedPath: string, name: string): string =>
  `rag-store-registry: persistence file collision with the registry file: ${resolvedPath} (store '${name}')`
const G_DIR = 'rag-store-registry: registryDir required'

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// RED marker
// ---------------------------------------------------------------------------
describe('U-H1 RED marker — the write module does not exist yet (§5.1, §6)', () => {
  // Data states enumerated (§5.3): the module must export exactly the 6
  // functions. Type-only imports erase, so the runtime census is the 6 bodies.
  it('01. RED — src/main/rag-store-registry-write.ts (spec §5.1/§5.3) is not implemented yet; this suite cannot load until it exists', () => {
    expect(typeof applyRegistryMutation).toBe('function')
    expect(typeof addRegistryStore).toBe('function')
    expect(typeof removeRegistryStore).toBe('function')
    expect(typeof renameRegistryStore).toBe('function')
    expect(typeof persistRagStoreRegistry).toBe('function')
    expect(typeof writeRegistryMutation).toBe('function')
  })

  it('02. §5.3/§5.8 — the runtime export surface is the 6 functions + the two U-H7 additions (NO exported consts — RAG_STORE_NAME_PATTERN is not re-exported)', () => {
    const mod = writeModule as unknown as Record<string, unknown>
    expect(Object.keys(mod).sort()).toEqual([
      'addRegistryStore',
      'applyRegistryMutation',
      'persistRagStoreRegistry',
      'removeRegistryStore',
      'renameDefaultRegistryStore',
      'renameRegistryStore',
      'setDefaultRegistryStore',
      'writeRegistryMutation',
    ])
  })
})

// ---------------------------------------------------------------------------
// Pure mutators — happy paths H1–H5, H6, H14 (§5.6)
// ---------------------------------------------------------------------------
describe('pure mutators — happy paths (§5.6 H1–H5, H6 double-validation, H14 delta)', () => {
  it('03. H1 — pure add appends last, order preserved, configs keep persisted-file omitted on BOTH, delta single-member', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      const result: RegistryMutationResult = applyRegistryMutation(parsed, dir, {
        kind: 'add',
        store: { name: 'research-2026-09' },
      })
      expect(result.registry.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        { name: 'research-2026-09', default: false, persistenceFile: join(dir, 'provident-rag-research-2026-09.json') },
      ])
      expect(result.registry.defaultStoreName).toBe('main')
      expect(result.configs).toEqual([{ name: 'main', default: true }, { name: 'research-2026-09' }])
      expect(result.delta).toEqual({ added: ['research-2026-09'], removed: [], renamed: [] })
    })
  })

  it('04. H2 — pure add with explicit persistenceFile/corpusRoot preserved VERBATIM (no normalization); resolved store carries them verbatim', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      const result = addRegistryStore(parsed, dir, {
        name: 'scratch-2',
        persistenceFile: dir + '/./scratch-2.json',
        corpusRoot: join(dir, 'corpus'),
      })
      expect(result.configs[1]).toEqual({
        name: 'scratch-2',
        persistenceFile: dir + '/./scratch-2.json',
        corpusRoot: join(dir, 'corpus'),
      })
      expect(result.registry.stores[1].persistenceFile).toBe(dir + '/./scratch-2.json')
      expect(result.registry.stores[1].corpusRoot).toBe(join(dir, 'corpus'))
    })
  })

  it('05. H3 — pure remove drops only the named store, survivor byte-verbatim, delta single-member', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09' }],
      }
      const result = removeRegistryStore(parsed, dir, 'research-2026-09')
      expect(result.registry.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
      ])
      expect(result.registry.defaultStoreName).toBe('main')
      expect(result.configs).toEqual([{ name: 'main', default: true }])
      expect(result.delta).toEqual({ added: [], removed: ['research-2026-09'], renamed: [] })
    })
  })

  it('06. H4 — pure rename (non-default): name changed IN PLACE, default:false preserved, omitted persistenceFile stays omitted (re-derived), order preserved', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      const result = renameRegistryStore(parsed, dir, 'research-2026-09', 'research-2026-10')
      expect(result.registry.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        { name: 'research-2026-10', default: false, persistenceFile: join(dir, 'provident-rag-research-2026-10.json') },
      ])
      expect(result.registry.defaultStoreName).toBe('main')
      expect(result.configs).toEqual([
        { name: 'main', default: true },
        { name: 'research-2026-10', default: false },
      ])
      expect(result.delta).toEqual({
        added: [],
        removed: [],
        renamed: [{ from: 'research-2026-09', to: 'research-2026-10' }],
      })
    })
  })

  it('07. H5 — rename a non-default WITH an explicit persistenceFile: the explicit path is VERBATIM (rename changes only the name, no re-derive)', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [
          { name: 'main', default: true },
          { name: 'b', default: false, persistenceFile: join(dir, 'custom-b.json') },
        ],
      }
      const result = renameRegistryStore(parsed, dir, 'b', 'c')
      expect(result.configs[1]).toEqual({
        name: 'c',
        default: false,
        persistenceFile: join(dir, 'custom-b.json'),
      })
      expect(result.registry.stores[1]).toEqual({
        name: 'c',
        default: false,
        persistenceFile: join(dir, 'custom-b.json'),
      })
    })
  })

  it('08. H6 — double-validation: EVERY H1–H5 candidate configs array re-passes resolveRegistry(..., dir, <registry-path>) (the candidate is always valid)', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const base = { version: 1, stores: [{ name: 'main', default: true }] }
      const addR = addRegistryStore(base, dir, { name: 'research-2026-09' })
      expect(resolveRegistry({ version: 1, stores: addR.configs }, dir, reg)).toEqual(addR.registry)
      const explicitR = addRegistryStore(base, dir, { name: 'z', persistenceFile: join(dir, 'z.json') })
      expect(resolveRegistry({ version: 1, stores: explicitR.configs }, dir, reg)).toEqual(explicitR.registry)
      const removeR = removeRegistryStore(addR.configs, dir, 'research-2026-09')
      expect(resolveRegistry({ version: 1, stores: removeR.configs }, dir, reg)).toEqual(removeR.registry)
      const renameR = renameRegistryStore(
        { version: 1, stores: [{ name: 'main', default: true }, { name: 'b', default: false }] },
        dir,
        'b',
        'c',
      )
      expect(resolveRegistry({ version: 1, stores: renameR.configs }, dir, reg)).toEqual(renameR.registry)
    })
  })

  it('09. H14 + field normalization — every H1–H5 delta has EXACTLY ONE non-empty member; existing unknown keys/embedder are dropped from configs (pinned fields only)', () => {
    withDir((dir) => {
      const base = { version: 1, stores: [{ name: 'main', default: true, custom: 'x' }] }
      const results: RegistryMutationResult[] = [
        addRegistryStore(base, dir, { name: 'a' }),
        removeRegistryStore({ version: 1, stores: [{ name: 'main', default: true }, { name: 'a' }] }, dir, 'a'),
        renameRegistryStore({ version: 1, stores: [{ name: 'main', default: true }, { name: 'b' }] }, dir, 'b', 'c'),
      ]
      for (const r of results) {
        const nonEmpty = [r.delta.added, r.delta.removed, r.delta.renamed].filter((m) => m.length === 1)
        expect(nonEmpty).toHaveLength(1) // exactly ONE non-empty member
      }
      // The existing entry's unknown key 'custom' is dropped from configs.
      expect(results[0].configs[0]).toEqual({ name: 'main', default: true })
    })
  })
})

// ---------------------------------------------------------------------------
// Unit U-H7 additive — the default reassignment + sanctioned default rename.
// (docs/specs/unit-h7-default-reassign.md §5.1 — Q6 additive amendment; NONE of
// the existing add/remove/rename rows is re-pinned.)
// ---------------------------------------------------------------------------
describe('U-H7 additive — setDefault + renameDefault kinds (Q6: additive; existing rows unchanged)', () => {
  it('SH1 — pure setDefault flips `default:true` onto the named store; delta.defaultChanged === [name], all other members empty', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      const result = setDefaultRegistryStore(parsed, dir, 'research-2026-09')
      expect(result.delta).toEqual({ added: [], removed: [], renamed: [], defaultChanged: ['research-2026-09'] })
      // Exactly ONE default — the candidate re-validates cleanly.
      expect(result.registry.defaultStoreName).toBe('research-2026-09')
      expect(result.configs.find((c) => c.name === 'main')!.default).toBe(false)
      expect(result.configs.find((c) => c.name === 'research-2026-09')!.default).toBe(true)
    })
  })

  it('SH2 — setDefault UNKNOWN name → W-set-default-unknown; the current default STILL the default (no mutation)', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      expectThrow(() => setDefaultRegistryStore(parsed, dir, 'nope'), `${WRITE} cannot set unknown store 'nope' as default`)
    })
  })

  it('SH3 — setDefault to the CURRENT default → W-set-default-nop (defensive; the runtime pre-checks no-op)', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      expectThrow(() => setDefaultRegistryStore(parsed, dir, 'main'), `${WRITE} store 'main' is already the default`)
    })
  })

  it('SH4 — renameDefault renames the CURRENT default preserving `default:true`; delta.renamed === [{from,to}] AND defaultChanged === [to]', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      const result = renameDefaultRegistryStore(parsed, dir, 'main-new')
      expect(result.delta).toEqual({
        added: [],
        removed: [],
        renamed: [{ from: 'main', to: 'main-new' }],
        defaultChanged: ['main-new'],
      })
      expect(result.registry.defaultStoreName).toBe('main-new')
      expect(result.configs.find((c) => c.name === 'main-new')!.default).toBe(true)
      expect(result.configs.some((c) => c.name === 'main')).toBe(false)
    })
  })

  it('SH5 — renameDefault onto an EXISTING name / to its OWN name → W-rename-target-exists (reused)', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
      }
      expectThrow(
        () => renameDefaultRegistryStore(parsed, dir, 'research-2026-09'),
        W_renameTargetExists('main', 'research-2026-09'),
      )
      expectThrow(() => renameDefaultRegistryStore(parsed, dir, 'main'), W_renameTargetExists('main', 'main'))
    })
  })
})

// ---------------------------------------------------------------------------
// Purity / determinism — H12, H13 (§5.6; §5.1 requirement 6)
// ---------------------------------------------------------------------------
describe('purity/determinism — no input mutation, fresh results, reservedPath (H12/H13)', () => {
  it('10. H12 — repeated calls on the SAME input are deep-equal; the input parsed + its stores array are UNCHANGED; a frozen input is accepted; mutating a returned result cannot affect a second call', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      const before = JSON.parse(JSON.stringify(parsed))
      const resultA = addRegistryStore(parsed, dir, { name: 'a' })
      const resultB = addRegistryStore(parsed, dir, { name: 'a' })
      expect(resultB).toEqual(resultA)
      expect(resultB).not.toBe(resultA)
      // Input untouched (deep-equal to the snapshot).
      expect(parsed).toEqual(before)
      expect(parsed.stores).toEqual(before.stores)
      expect(parsed.stores).not.toBe(before.stores) // but it is a snapshot, not identity
      // A frozen input is accepted (the mutator must never write into it).
      const frozen = Object.freeze({
        version: 1,
        stores: Object.freeze([Object.freeze({ name: 'main', default: true })]),
      })
      expect(() => addRegistryStore(frozen, dir, { name: 'b' })).not.toThrow()
      // Mutating a returned registry.stores does not perturb a second call.
      const r1 = addRegistryStore(parsed, dir, { name: 'c' })
      r1.registry.stores.push({ name: 'tampered', default: false, persistenceFile: '/t.json' })
      const r2 = addRegistryStore(parsed, dir, { name: 'c' })
      expect(r2.registry.stores).toHaveLength(2)
      expect(r2.registry.stores.map((s: { name: string }) => s.name)).toEqual(['main', 'c'])
    })
  })

  it('11. H13 — reservedPath propagation: a derived/explicit file equal to resolve(rp) fails F14 (before F13); WITHOUT rp (pure 2-arg) the same config is VALID', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      const rp = join(dir, REG_FILE)
      const colliding = { name: 'w', persistenceFile: rp }
      // No reserved path — main derives provident-rag.json; w != that; VALID.
      const plain = addRegistryStore(parsed, dir, colliding)
      expect(plain.configs[1]).toEqual({ name: 'w', persistenceFile: rp })
      // reservedPath threaded → the candidate fails F14 (store 'w').
      expectThrow(
        () => addRegistryStore(parsed, dir, colliding, rp),
        f14(resolve(rp), 'w'),
      )
      // The same threading via applyRegistryMutation.
      expectThrow(
        () => applyRegistryMutation(parsed, dir, { kind: 'add', store: colliding }, rp),
        f14(resolve(rp), 'w'),
      )
    })
  })
})

// ---------------------------------------------------------------------------
// persistRagStoreRegistry — H7, R1/R3/R5 (§5.6 H7, §5.7)
// ---------------------------------------------------------------------------
describe('persistRagStoreRegistry — atomic write + round-trip (§5.6 H7, §5.7 R1–R3)', () => {
  it('12. H7/R2/R3 — persist writes the EXACT bytes (version:1, 2-space indent), round-trips via loadRagStoreRegistry, and leaves NO .tmp residue', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const configs: RagStoreConfig[] = [{ name: 'main', default: true }, { name: 'research-2026-09' }]
      persistRagStoreRegistry(reg, configs)
      const expectedText = JSON.stringify({ version: 1, stores: configs }, null, 2)
      expect(readFileSync(reg, 'utf8')).toBe(expectedText)
      // No .tmp residue.
      expect(existsSync(reg + '.tmp')).toBe(false)
      expect(readdirSync(dir).filter((f) => f.endsWith('.tmp'))).toEqual([])
      // R2 round-trip.
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.implicit).toBe(false)
      expect(loaded.corrupt).toBe(false)
      expect(loaded.defaultStoreName).toBe('main')
      expect(loaded.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        { name: 'research-2026-09', default: false, persistenceFile: join(dir, 'provident-rag-research-2026-09.json') },
      ])
    })
  })

  it('13. R1 — a persist that fails at the temp write (tmp path is an existing DIRECTORY) leaves the ORIGINAL file bytes intact and re-readable', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const original = JSON.stringify(
        { version: 1, stores: [{ name: 'old', default: true }] },
        null,
        2,
      )
      writeFileSync(reg, original)
      // Make the pinned tmp name an existing directory → writeFileSync EISDIR.
      mkdirSync(reg + '.tmp')
      expectThrowAny(() => persistRagStoreRegistry(reg, [{ name: 'new', default: true }]))
      // The original file is untouched and still loads.
      expect(readFileSync(reg, 'utf8')).toBe(original)
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.defaultStoreName).toBe('old')
      expect(loaded.implicit).toBe(false)
    })
  })

  it('14. R1/F23 — a persist whose target path is a DIRECTORY (rename onto a dir) THROWS a native fs Error; the (empty) dir is untouched', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      mkdirSync(reg) // target is an empty directory
      expectThrowAny(() => persistRagStoreRegistry(reg, [{ name: 'main', default: true }]))
      expect(statSync(reg).isDirectory()).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// writeRegistryMutation — H8–H11, R4 (§5.6, §5.7)
// ---------------------------------------------------------------------------
describe('writeRegistryMutation — combined load→mutate→persist→re-load (D2; §5.6 H8–H11, §5.7 R4)', () => {
  it('15. H8/R4 — on an ABSENT file (the D3 first-write): reads the implicit main, adds, writes, RE-LOADS with implicit:false, corrupt:false', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const result: RegistryWriteResult = writeRegistryMutation({
        path: reg,
        mutation: { kind: 'add', store: { name: 'research-2026-09' } },
      })
      expect(result.delta).toEqual({ added: ['research-2026-09'], removed: [], renamed: [] })
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)
      expect(result.loaded.defaultStoreName).toBe('main')
      // main derives the LEGACY provident-rag.json (name carve-out).
      expect(result.loaded.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        { name: 'research-2026-09', default: false, persistenceFile: join(dir, 'provident-rag-research-2026-09.json') },
      ])
      // The file now exists on disk and re-loads identically.
      expect(existsSync(reg)).toBe(true)
      expect(loadRagStoreRegistry({ path: reg })).toEqual(result.loaded)
      expect(existsSync(reg + '.tmp')).toBe(false)
    })
  })

  it('16. H9 — add onto an existing multi-store file: survivors preserved in order, added store appends LAST, loaded matches disk order', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      writeFileSync(
        reg,
        JSON.stringify({
          version: 1,
          stores: [{ name: 'main', default: true }, { name: 'existing', default: false }],
        }),
      )
      const result = writeRegistryMutation({
        path: reg,
        mutation: { kind: 'add', store: { name: 'newstore' } },
      })
      expect(result.loaded.stores.map((s: { name: string }) => s.name)).toEqual(['main', 'existing', 'newstore'])
      expect(result.delta.added).toEqual(['newstore'])
      expect(result.loaded.implicit).toBe(false)
      expect(result.loaded.corrupt).toBe(false)
      // The written file round-trips.
      expect(loadRagStoreRegistry({ path: reg }).stores).toEqual(result.loaded.stores)
    })
  })

  it('17. H10/D3 — remove UNREGISTERS THE ENTRY ONLY; the store persistence file + journal on disk are byte-UNTOUCHED', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const storeFile = join(dir, 'provident-rag-research-2026-09.json')
      const journalFile = join(dir, 'provident-rag-research-2026-09.json.journal')
      writeFileSync(
        reg,
        JSON.stringify({
          version: 1,
          stores: [{ name: 'main', default: true }, { name: 'research-2026-09' }],
        }),
      )
      writeFileSync(storeFile, '{}') // the orphan store's persistence bytes
      writeFileSync(journalFile, '[journal]') // the orphan store's journal bytes
      const result = writeRegistryMutation({
        path: reg,
        mutation: { kind: 'remove', name: 'research-2026-09' },
      })
      expect(result.delta).toEqual({ added: [], removed: ['research-2026-09'], renamed: [] })
      expect(result.loaded.stores.map((s: { name: string }) => s.name)).toEqual(['main'])
      // The store's files were NEVER touched (D3 orphan pin — behavioral half).
      expect(readFileSync(storeFile, 'utf8')).toBe('{}')
      expect(readFileSync(journalFile, 'utf8')).toBe('[journal]')
      expect(existsSync(storeFile)).toBe(true)
      expect(existsSync(journalFile)).toBe(true)
    })
  })

  it('18. H11 — rename a non-default via the combined entry; a follow-up load shows the new name, same default:false and re-derived/verbatim path', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      writeFileSync(
        reg,
        JSON.stringify({
          version: 1,
          stores: [{ name: 'main', default: true }, { name: 'research-2026-09', default: false }],
        }),
      )
      const result = writeRegistryMutation({
        path: reg,
        mutation: { kind: 'rename', from: 'research-2026-09', to: 'research-2026-10' },
      })
      expect(result.delta).toEqual({
        added: [],
        removed: [],
        renamed: [{ from: 'research-2026-09', to: 'research-2026-10' }],
      })
      expect(result.loaded.stores[1]).toEqual({
        name: 'research-2026-10',
        default: false,
        persistenceFile: join(dir, 'provident-rag-research-2026-10.json'),
      })
      const later = loadRagStoreRegistry({ path: reg })
      expect(later.stores[1].name).toBe('research-2026-10')
      expect(later.stores[1].default).toBe(false)
      expect(later.stores[1].persistenceFile).toBe(join(dir, 'provident-rag-research-2026-10.json'))
    })
  })
})

// ---------------------------------------------------------------------------
// Fail-states F1–F26 (§5.6) — validation, semantics, guards
// ---------------------------------------------------------------------------
describe('fail-states — existing-registry validation + guards (§5.6 F1–F4, F17, F18, F21)', () => {
  it('19. F1 — applyRegistryMutation with a non-object parsed (null/5/[]/"x"/true) propagates the loader F1 EXACTLY', () => {
    withDir((dir) => {
      const m: RegistryMutation = { kind: 'remove', name: 'x' }
      for (const parsed of [null, 5, [], 'x', true]) {
        expectThrow(() => applyRegistryMutation(parsed, dir, m), F1)
      }
    })
  })

  it('20. F2 — existing registry invalid: {} → f2(undefined); {version:2,...} → f2(2); {version:1} (no stores) → F3', () => {
    withDir((dir) => {
      const m: RegistryMutation = { kind: 'remove', name: 'x' }
      expectThrow(() => applyRegistryMutation({}, dir, m), f2('undefined'))
      expectThrow(() => applyRegistryMutation({ version: 2, stores: [] }, dir, m), f2('2'))
      expectThrow(() => applyRegistryMutation({ version: 1 }, dir, m), F3)
    })
  })

  it('21. F3 — applyRegistryMutation/wrappers with a non-string/empty registryDir propagate the loader G-dir EXACTLY (guards precede mutation semantics)', () => {
    withDir((dir) => {
      const m: RegistryMutation = { kind: 'remove', name: 'x' }
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => applyRegistryMutation(parsed, '', m), G_DIR)
      expectThrow(() => applyRegistryMutation(parsed, undefined as unknown as string, m), G_DIR)
      expectThrow(() => addRegistryStore(parsed, '', { name: 'a' }), G_DIR)
      expectThrow(() => removeRegistryStore(parsed, '', 'main'), G_DIR)
      expectThrow(() => renameRegistryStore(parsed, '', 'a', 'b'), G_DIR)
    })
  })

  it('22. F4 — a current entry that fails a loader rule (charset / duplicate / relative corpusRoot) throws at step 2 BEFORE any mutation', () => {
    withDir((dir) => {
      const m: RegistryMutation = { kind: 'add', store: { name: 'a' } }
      // Charset-invalid CURRENT store.
      expectThrow(
        () => applyRegistryMutation({ version: 1, stores: [{ name: 'main', default: true }, { name: 'Main' }] }, dir, m),
        f6(1, '"Main"'),
      )
      // Duplicate CURRENT store (Pass B).
      expectThrow(
        () => applyRegistryMutation({ version: 1, stores: [{ name: 'a' }, { name: 'a' }] }, dir, m),
        f11('a'),
      )
      // Relative corpusRoot CURRENT store.
      expectThrow(
        () =>
          applyRegistryMutation(
            { version: 1, stores: [{ name: 'main', default: true, corpusRoot: 'rel/dir' }] },
            dir,
            m,
          ),
        f9(0, '"rel/dir"'),
      )
    })
  })

  it('23. F17 — mutation null → W-mutation; {kind:"delete"} → W-kind (jsonOf render of the kind string); the add-store guard via the wrapper', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => applyRegistryMutation(parsed, dir, null as unknown as RegistryMutation), W_MUTATION)
      expectThrow(
        () => applyRegistryMutation(parsed, dir, { kind: 'delete' } as unknown as RegistryMutation),
        W_kind('"delete"'),
      )
      expectThrow(() => addRegistryStore(parsed, dir, null as unknown as RagStoreConfig), W_ADD_STORE)
      expectThrow(() => addRegistryStore(parsed, dir, undefined as unknown as RagStoreConfig), W_ADD_STORE)
    })
  })

  it('24. F18 — removeRegistryStore/renameRegistryStore with a non-string/empty/undefined param name/from/to → W-remove-arg / W-rename-arg', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => removeRegistryStore(parsed, dir, ''), W_argRequired('name'))
      expectThrow(() => removeRegistryStore(parsed, dir, undefined as unknown as string), W_argRequired('name'))
      expectThrow(() => removeRegistryStore(parsed, dir, 5 as unknown as string), W_argRequired('name'))
      expectThrow(() => renameRegistryStore(parsed, dir, '', 'b'), W_argRequired('from'))
      expectThrow(() => renameRegistryStore(parsed, dir, 'a', ''), W_argRequired('to'))
      expectThrow(() => renameRegistryStore(parsed, dir, 'a', undefined as unknown as string), W_argRequired('to'))
    })
  })

  it('25. F21 — persistRagStoreRegistry("", configs) → W-path; (path, null) → W-configs; non-array configs → W-configs', () => {
    withDir((dir) => {
      expectThrow(() => persistRagStoreRegistry('', [{ name: 'main', default: true }]), W_PATH)
      expectThrow(() => persistRagStoreRegistry(join(dir, REG_FILE), null as unknown as RagStoreConfig[]), W_CONFIGS)
      expectThrow(() => persistRagStoreRegistry(join(dir, REG_FILE), {} as unknown as RagStoreConfig[]), W_CONFIGS)
    })
  })
})

describe('fail-states — mutation semantics (W-add-existing, W-remove/rename) + candidate validation (§5.6 F5–F16)', () => {
  it('26. F5 — add a store whose name is already present → W-add-existing', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'a', default: true }] }
      expectThrow(() => addRegistryStore(parsed, dir, { name: 'a' }), W_addExisting('a'))
      expectThrow(
        () => applyRegistryMutation(parsed, dir, { kind: 'add', store: { name: 'a' } }),
        W_addExisting('a'),
      )
    })
  })

  it('27. F6 — add a store with a charset name / relative corpusRoot / non-boolean default / present embedder → candidate f6/f9/f7/F10', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => addRegistryStore(parsed, dir, { name: 'Main' }), f6(1, '"Main"'))
      expectThrow(() => addRegistryStore(parsed, dir, { name: 'a', corpusRoot: 'rel/dir' }), f9(1, '"rel/dir"'))
      expectThrow(() => addRegistryStore(parsed, dir, { name: 'a', default: 'yes' } as unknown as RagStoreConfig), f7(1, '"yes"'))
      expectThrow(
        () => addRegistryStore(parsed, dir, { name: 'a', embedder: {} } as unknown as RagStoreConfig),
        F10,
      )
    })
  })

  it('28. F7 — add a store with default:true when one already exists → candidate f12(2)', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => addRegistryStore(parsed, dir, { name: 'b', default: true }), f12(2))
    })
  })

  it('29. F8 — add a store whose derived/explicit file collides with another → candidate f13 (<earlier>, <current> in array order)', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      // 'a' explicitly collides with main's derived LEGACY provident-rag.json.
      expectThrow(
        () => addRegistryStore(parsed, dir, { name: 'a', persistenceFile: join(dir, 'provident-rag.json') }),
        f13(resolve(join(dir, 'provident-rag.json')), 'main', 'a'),
      )
    })
  })

  it('30. F9/F20 — a NEW store whose file resolves onto the REGISTRY file itself fails F14 when the write path threads reservedPath (persist variant)', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      // persistRagStoreRegistry threads dirname(path)+path ⇒ F14 (store "main").
      expectThrow(
        () =>
          persistRagStoreRegistry(reg, [
            { name: 'main', default: true, persistenceFile: reg },
          ] as unknown as RagStoreConfig[]),
        f14(resolve(reg), 'main'),
      )
    })
  })

  it('31. F10 — remove an UNKNOWN name → W-remove-unknown', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => removeRegistryStore(parsed, dir, 'x'), W_removeUnknown('x'))
    })
  })

  it('32. F11/F12 — remove the ONLY default store leaves zero defaults → candidate f12(0); removal of a non-default keeps the count at 1 (valid)', () => {
    withDir((dir) => {
      const single = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => removeRegistryStore(single, dir, 'main'), f12(0))
      // Non-default removal leaves EXACTLY one default ⇒ valid, not an f12.
      const multi = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'a', default: false }],
      }
      const result = removeRegistryStore(multi, dir, 'a')
      expect(result.configs).toEqual([{ name: 'main', default: true }])
      expect(result.delta).toEqual({ added: [], removed: ['a'], renamed: [] })
    })
  })

  it('33. F13 — rename an UNKNOWN from → W-rename-unknown-from', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      expectThrow(() => renameRegistryStore(parsed, dir, 'x', 'y'), W_renameUnknownFrom('x'))
    })
  })

  it('34. F14 — rename onto an EXISTING to → W-rename-target-exists', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'a' }, { name: 'b', default: false }],
      }
      // 'a' → 'b'; 'b' exists ⇒ W-rename-target-exists.
      expectThrow(() => renameRegistryStore(parsed, dir, 'a', 'b'), W_renameTargetExists('a', 'b'))
    })
  })

  it('35. F15/D5 — rename the CURRENT default store → W-rename-default', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }, { name: 'a' }] }
      expectThrow(() => renameRegistryStore(parsed, dir, 'main', 'newmain'), W_RENAME_DEFAULT)
      expectThrow(
        () => applyRegistryMutation(parsed, dir, { kind: 'rename', from: 'main', to: 'newmain' }),
        W_RENAME_DEFAULT,
      )
    })
  })

  it('36. F16 — rename whose to is charset-invalid → candidate f6 for the renamed IN-PLACE entry', () => {
    withDir((dir) => {
      const parsed = {
        version: 1,
        stores: [{ name: 'main', default: true }, { name: 'a', default: false }],
      }
      expectThrow(() => renameRegistryStore(parsed, dir, 'a', 'Main'), f6(1, '"Main"'))
    })
  })
})

describe('fail-states — persist guards + native fs family (§5.6 F19–F23, §5.7 R1)', () => {
  it('37. F19 — persistRagStoreRegistry(path, []) (zero stores) → loader f12(0); NEVER persists an empty registry', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      expectThrow(() => persistRagStoreRegistry(reg, []), f12(0))
      expect(existsSync(reg)).toBe(false)
    })
  })

  describe('F22 — native fs Error propagates on an unwritable target (runs only when not root; root bypasses file modes)', () => {
    // Data states enumerated: an unwritable PARENT dir (EACCES on the temp
    // write) — the throw path is pinned; the message is the native one.
    it.runIf(typeof process.getuid === 'function' && process.getuid() !== 0)(
      '38. F22 — persistRagStoreRegistry into a chmod-000 parent dir throws a native fs Error; nothing written',
      () => {
        withDir((dir) => {
          const sub = join(dir, 'locked')
          mkdirSync(sub)
          chmodSync(sub, 0o000)
          const reg = join(sub, REG_FILE)
          try {
            expectThrowAny(() => persistRagStoreRegistry(reg, [{ name: 'main', default: true }]))
            expect(existsSync(reg)).toBe(false)
            expect(existsSync(reg + '.tmp')).toBe(false)
          } finally {
            chmodSync(sub, 0o700) // restore so withDir's rmSync can clean up
          }
        })
      },
    )
  })

  it('39. F22 via writeRegistryMutation — an unresolvable parent (a path that is an existing file) is a native fs throw, not a swallow', () => {
    withDir((dir) => {
      // Make dirname(path) a REGULAR FILE so mkdirSync(recursive) throws ENOTDIR/EEXIST.
      const reg = join(dir, 'notdir', REG_FILE)
      writeFileSync(join(dir, 'notdir'), 'i am a file')
      expectThrowAny(() =>
        writeRegistryMutation({ path: reg, mutation: { kind: 'add', store: { name: 'a' } } }),
      )
    })
  })
})

describe('fail-states — writeRegistryMutation read/mutate paths (§5.6 F24–F26, §5.7 R5)', () => {
  it('40. F24/R5 — on a CORRUPT registry file, writeRegistryMutation FAILS LOUD (W-unreadable) and NEVER clobbers from the implicit form', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      writeFileSync(reg, '{not json')
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: { kind: 'add', store: { name: 'a' } } }),
        W_unreadable(reg),
      )
      // The corrupt bytes were NOT rewritten (R5 — never hot-mutates a corrupt registry).
      expect(readFileSync(reg, 'utf8')).toBe('{not json')
    })
  })

  it('41. F24 — an EMPTY file is equally unreadable (parse throws) → W-unreadable', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      writeFileSync(reg, '')
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: { kind: 'add', store: { name: 'a' } } }),
        W_unreadable(reg),
      )
    })
  })

  it('42. F24 — the registry path is a DIRECTORY (the isFile probe trips) → W-unreadable', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      mkdirSync(reg)
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: { kind: 'add', store: { name: 'a' } } }),
        W_unreadable(reg),
      )
    })
  })

  it('43. F25 — writeRegistryMutation on a PRESENT but INVALID registry file propagates the loader F-message (never mutated from an invalid start)', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      writeFileSync(reg, JSON.stringify({ version: 2, stores: [] }))
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: { kind: 'add', store: { name: 'a' } } }),
        f2('2'),
      )
      writeFileSync(reg, JSON.stringify({ version: 1, stores: [{ name: 'main', default: true }, { name: 'Main' }] }))
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: { kind: 'remove', name: 'main' } }),
        f6(1, '"Main"'),
      )
    })
  })

  it('44. F26 — writeRegistryMutation(null) / ({path:""}) → W-path; ({path}: valid, mutation:null) → W-mutation; bad kind → W-kind', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      expectThrow(() => writeRegistryMutation(null as unknown as RegistryWriteResult), W_PATH)
      expectThrow(() => writeRegistryMutation({ path: '' } as unknown as RegistryWriteResult), W_PATH)
      expectThrow(
        () => writeRegistryMutation({ path: reg, mutation: null as unknown as RegistryMutation }),
        W_MUTATION,
      )
      expectThrow(
        () =>
          writeRegistryMutation({
            path: reg,
            mutation: { kind: 'banana' } as unknown as RegistryMutation,
          }),
        W_kind('"banana"'),
      )
    })
  })
})

// ---------------------------------------------------------------------------
// Structural negative pins (§5.9 negative pins; §5.1 import set)
// ---------------------------------------------------------------------------
describe('structural pins — no-REMOVE (D3) + no-write/const census + D6 (§5.1, §5.5, §5.9)', () => {
  // NOTE (TestWriter): these are white-box scans of the NEW module source.
  // The module does not exist yet, so reading the file THROWS (ENOENT) — the
  // test FAILS RED. The pins themselves: §5.1's no-REMOVE import pin (D3), the
  // census (0 exported consts, 0 console.* calls), and the D6 no-IPC/MCP
  // negative.
  it('45. §5.9 negative pin — the WRITE module source contains NO removal or truncate primitive (structural D3 orphan guarantee)', () => {
    const moduleFile = fileURLToPath(new URL('../src/main/rag-store-registry-write.ts', import.meta.url))
    const src = readFileSync(moduleFile, 'utf8')
    for (const banned of [
      'unlinkSync',
      'rmSync',
      'rmdirSync',
      'truncateSync',
      'chmodSync',
    ]) {
      // Word-bounded so `rmSync`/`rmdirSync` are NOT also matched by `rm`.
      expect(src, `the write module must not reference '${banned}' (§5.1 no-remove)`).not.toMatch(
        new RegExp(`\\b${banned}\\b`),
      )
    }
    // The bare `rm` (without a Sync suffix) must also be absent.
    expect(src).not.toMatch(/\brm\b/)
    // The write primitives ARE present (the atomic persist idiom).
    for (const present of ['writeFileSync', 'renameSync', 'mkdirSync', 'openSync', 'fsyncSync', 'closeSync']) {
      expect(src).toContain(present)
    }
    // §5.1 — electron must NOT appear.
    expect(src).not.toContain('electron')
  })

  it('46. §5.5 census + §5.1 — the write module emits ZERO console.* output and imports no shared/types constant (D6)', () => {
    const moduleFile = fileURLToPath(new URL('../src/main/rag-store-registry-write.ts', import.meta.url))
    const src = readFileSync(moduleFile, 'utf8')
    expect(src.match(/console\./g)).toBeNull() // failure is thrown, never logged
    expect(src).not.toContain('shared/types') // no IPC-constant import (D6)
    expect(src).not.toContain('RpcMethod')
  })
})

// ---------------------------------------------------------------------------
// REGRESSION TESTS — adversarial findings F-H1-1 / F-H1-2
// ---------------------------------------------------------------------------
describe('regression F-H1-1 — an ADDED store with unknown keys is normalized (pinned-fields-only), not raw-spread', () => {
  it('R-F-H1-1a — the PURE add (applyRegistryMutation) drops any unknown key on the ADDED store from configs; the persistence round-trip never sees it', () => {
    withDir((dir) => {
      const parsed = { version: 1, stores: [{ name: 'main', default: true }] }
      const result = applyRegistryMutation(parsed, dir, {
        kind: 'add',
        // 'custom' (and 'bogus') are NOT pinned fields; they must be dropped.
        store: { name: 'research-2026-09', custom: 'x', bogus: 42 } as unknown as RagStoreConfig,
      })
      // The added entry in configs is normalized — unknown keys gone.
      expect(result.configs[1]).toEqual({ name: 'research-2026-09' })
      // Both entries carry ONLY pinned fields.
      expect(result.configs).toEqual([{ name: 'main', default: true }, { name: 'research-2026-09' }])
      // The resolved registry (what the runtime consumes) carries no unknown key either.
      expect(Object.prototype.hasOwnProperty.call(result.registry.stores[1], 'custom')).toBe(false)
      expect(Object.prototype.hasOwnProperty.call(result.registry.stores[1], 'bogus')).toBe(false)
    })
  })

  it('R-F-H1-1b — through the COMBINED write (writeRegistryMutation), an added store with an unknown key is persisted WITHOUT it; the re-loaded registry never contains it', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      const result = writeRegistryMutation({
        path: reg,
        mutation: {
          kind: 'add',
          store: { name: 'research-2026-09', custom: 'x' } as unknown as RagStoreConfig,
        },
      })
      expect(result.delta).toEqual({ added: ['research-2026-09'], removed: [], renamed: [] })
      expect(result.loaded.stores[1].name).toBe('research-2026-09')
      // The persisted/loaded entry carries NO unknown key.
      expect(Object.prototype.hasOwnProperty.call(result.loaded.stores[1], 'custom')).toBe(false)
      // The registry FILE on disk is verbatim the pinned-fields only form.
      expect(readFileSync(reg, 'utf8')).toBe(
        JSON.stringify(
          {
            version: 1,
            stores: [{ name: 'main', default: true }, { name: 'research-2026-09' }],
          },
          null,
          2,
        ),
      )
      // And it round-trips identically.
      expect(loadRagStoreRegistry({ path: reg }).stores[1].name).toBe('research-2026-09')
    })
  })
})

describe('regression F-H1-2 — a stat RACE (file deleted between existsSync and statSync) lands on W-unreadable, not a raw native ENOENT', () => {
  it('R-F-H1-2a — when existsSync reports the registry present but statSync then throws ENOENT, writeRegistryMutation throws the pinned W-unreadable message', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE)
      // existsSync(path) → true (a real file on disk).
      writeFileSync(reg, JSON.stringify({ version: 1, stores: [{ name: 'main', default: true }] }))
      // statSync (inside the module) is forced to throw ENOENT — the race.
      fsStatsState.statThrowsENOENT = true
      try {
        expectThrow(
          () => writeRegistryMutation({ path: reg, mutation: { kind: 'remove', name: 'main' } }),
          W_unreadable(reg),
        )
      } finally {
        fsStatsState.statThrowsENOENT = false
      }
    })
  })
})
