// tests/unit-ms1-store-registry.test.ts — Unit U-MS1: the multi-store RAG
// registry PURE module (docs/specs/unit-ms1-store-registry.md).
//
// RED SET (RCA-1) — written BEFORE any implementation exists. The module
// `src/main/rag-store-registry.ts` does NOT exist yet, so this file cannot
// even LOAD (missing-module import — the house red pattern); test 01 names
// the module as the explicit red marker. Every assertion below derives from
// the spec ALONE:
//   §5.2/§5.3  the pinned public surface (3 functions, 1 const, 6 types)
//   §5.4       byte-pinned errors: G-load/G-dir + F1–F13 + the LOG-1 census
//   §5.5       happy paths H1–H14
//   §5.6       fail-states FS1–FS32
//   §5.7       byte-equality acceptance rows B1–B5
//   §5.8       runtime export census + structural pins
//
// Conventions follow tests/unit-v1-store-adjacency.test.ts (vitest node
// environment, `.js` import suffix for the main-process ESM module, temp dirs
// via node:fs mkdtemp). NO test touches the repo's real userData paths —
// every file-touching case runs in its own mkdtemp temp dir.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { spawnSync } from 'node:child_process'
import {
  mkdtempSync,
  rmSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  mkdirSync,
  symlinkSync,
  statSync,
  chmodSync,
  existsSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  implicitRegistry,
  resolveRegistry,
  loadRagStoreRegistry,
  RAG_STORE_NAME_PATTERN,
  type RagStoreConfig,
  type RagStoreRegistryFile,
  type ResolvedRagStore,
  type ResolvedRagStoreRegistry,
  type RagStoreRegistryOptions,
  type LoadedRagStoreRegistry,
} from '../src/main/rag-store-registry.js'
import * as ragStoreRegistryModule from '../src/main/rag-store-registry.js'

// ---------------------------------------------------------------------------
// Helpers (house style: mkdtemp temp dirs, try/finally cleanup, byte-exact
// message assertions via catch + toBe — vitest's toThrow does substring
// matching, which is NOT enough for the §5.4 byte-pinned census).
// ---------------------------------------------------------------------------

function withDir(run: (dir: string) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms1-'))
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

// The §5.4 byte-pinned error strings (copied verbatim from the spec table;
// `<json>` renderings are taken from the spec's own FS examples).
const G_LOAD = 'rag-store-registry: path required'
const G_DIR = 'rag-store-registry: registryDir required'
const F1 = 'rag-store-registry: registry must be an object'
const f2 = (got: string): string => `rag-store-registry: unsupported registry version (got ${got})`
const F3 = 'rag-store-registry: stores must be an array'
const f4 = (i: number): string => `rag-store-registry: stores[${i}] must be an object`
const f5 = (i: number, got: string): string =>
  `rag-store-registry: stores[${i}].name must be a non-empty string (got ${got})`
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
// LOG-1 (§5.4): the module's ENTIRE log output — one console.error call site
// on the corrupt/unreadable fail-soft path; byte-pinned first argument.
const log1 = (path: string): string =>
  `[rag-store-registry] registry file unreadable (${path}); falling back to the implicit main store`

const REG_FILE_NAME = 'provident-rag-stores.json' // the pinned wiring file name (§5.2)

afterEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// RED marker
// ---------------------------------------------------------------------------
describe('U-MS1 RED marker — the pure module does not exist yet (§5.1, §6)', () => {
  // Data states enumerated (§5.3): the module must export exactly
  // implicitRegistry / resolveRegistry / loadRagStoreRegistry + the const.
  it('01. RED — src/main/rag-store-registry.ts (spec §5.1) is not implemented yet; this suite cannot load until it exists', () => {
    expect(typeof implicitRegistry).toBe('function')
    expect(typeof resolveRegistry).toBe('function')
    expect(typeof loadRagStoreRegistry).toBe('function')
    expect(RAG_STORE_NAME_PATTERN).toBeInstanceOf(RegExp)
  })
})

// ---------------------------------------------------------------------------
// implicitRegistry — MIGRATION-LEGACY-PATH (D3)
// ---------------------------------------------------------------------------
describe('implicitRegistry — the synthesized zero-config registry (§5.3.1, §5.5 H1-pure, §5.6 FS30)', () => {
  // Data states enumerated:
  //   valid: an absolute registryDir (temp dir) → the exact implicit shape;
  //          a relative non-empty dir (§3: absoluteness is a precondition,
  //          NOT validated — the guard only checks non-empty string);
  //          fresh result per call (§5.1 no memoization).
  //   guards: '' / undefined / 5 / null ⇒ G-dir (FS30).
  it('02. H1/B1(pure) — implicitRegistry(dir) returns EXACTLY { stores: [{ name: main, default: true, persistenceFile: <dir>/provident-rag.json }], defaultStoreName: "main" } — no corpusRoot key, fresh per call', () => {
    withDir((dir) => {
      const a: ResolvedRagStoreRegistry = implicitRegistry(dir)
      const b = implicitRegistry(dir)
      expect(a).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') }],
        defaultStoreName: 'main',
      })
      // B1 — the legacy path is join(registryDir, 'provident-rag.json')
      // (byte-equal to main.ts:119 when the wiring passes userData).
      expect(a.stores[0].persistenceFile).toBe(join(dir, 'provident-rag.json'))
      // B4 — corpusRoot is OMITTED (never filled with cwd).
      expect('corpusRoot' in a.stores[0]).toBe(false)
      // §5.1/§5.3.1 — freshly constructed per call, no memoization.
      expect(a).not.toBe(b)
      expect(a.stores[0]).not.toBe(b.stores[0])
      // §3 — registryDir absoluteness is a documented precondition, not
      // validated: any non-empty string passes the guard and is joined.
      expect(implicitRegistry('relative-dir')).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join('relative-dir', 'provident-rag.json') }],
        defaultStoreName: 'main',
      })
    })
  })

  it('03. FS30/G-dir — implicitRegistry with a non-string/empty registryDir throws exactly "rag-store-registry: registryDir required"', () => {
    expectThrow(() => implicitRegistry(''), G_DIR)
    expectThrow(() => implicitRegistry(undefined as unknown as string), G_DIR)
    expectThrow(() => implicitRegistry(5 as unknown as string), G_DIR)
    expectThrow(() => implicitRegistry(null as unknown as string), G_DIR)
  })
})

// ---------------------------------------------------------------------------
// resolveRegistry — happy paths
// ---------------------------------------------------------------------------
describe('resolveRegistry — pure validate+resolve happy paths (§5.5 H2–H12, §5.2, §5.3.2)', () => {
  // Data states enumerated (§5.5):
  //   H2  one explicit store, derived persistence file, registry order.
  //   H3  the D3 first-registry-write scenario: main ⇒ LEGACY path carve-out.
  //   H4  explicit main WITH persistenceFile ⇒ verbatim (no carve-out).
  //   H5  carve-out keys on the NAME ONLY (main + default:false is valid).
  //   H6  explicit corpusRoot + persistenceFile preserved verbatim.
  //   H7  explicit default:false materialized == non-flagged.
  //   H8  N stores, one default, all distinct derived paths, order kept.
  //   H9  name boundaries: 64-char valid; '-'/''_'/digits after first alnum.
  //   H10 unknown keys at both levels ignored and NOT re-exposed.
  //   H11 version 1.0 (JSON number) parses to 1 ⇒ valid.
  //   H12 pure resolveRegistry(fileText) ≡ loadRagStoreRegistry(path).
  it('04. H2 (+§5.3.3 step 6, §5.4 census) — one explicit store loads fail-loud-free: derived path, implicit:false, corrupt:false, path verbatim, ZERO log lines', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      const file: RagStoreRegistryFile = {
        version: 1,
        stores: [{ name: 'research-2026-09', default: true }],
      }
      writeFileSync(reg, JSON.stringify(file))
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const opts: RagStoreRegistryOptions = { path: reg }
      const loaded: LoadedRagStoreRegistry = loadRagStoreRegistry(opts)
      expect(loaded).toEqual({
        stores: [
          { name: 'research-2026-09', default: true, persistenceFile: join(dir, 'provident-rag-research-2026-09.json') },
        ],
        defaultStoreName: 'research-2026-09',
        path: reg,
        implicit: false,
        corrupt: false,
      })
      // §5.4 census — the valid path emits ZERO log lines on ANY channel.
      expect(errSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })

  it('05. H3 — the D3 first-registry-write: [{main,default:true},{research-2026-09}] ⇒ main derives the LEGACY provident-rag.json (NOT provident-rag-main.json)', () => {
    withDir((dir) => {
      const configs: RagStoreConfig[] = [{ name: 'main', default: true }, { name: 'research-2026-09' }]
      const resolved = resolveRegistry({ version: 1, stores: configs }, dir)
      expect(resolved.stores[0].persistenceFile).toBe(join(dir, 'provident-rag.json'))
      expect(resolved.stores[0].persistenceFile).not.toBe(join(dir, 'provident-rag-main.json'))
      expect(resolved.stores[1].persistenceFile).toBe(join(dir, 'provident-rag-research-2026-09.json'))
      expect(resolved.defaultStoreName).toBe('main')
      expect('corpusRoot' in resolved.stores[0]).toBe(false)
      expect('corpusRoot' in resolved.stores[1]).toBe(false)
    })
  })

  it('06. H4 — an explicit main entry WITH persistenceFile is honored verbatim (the carve-out never overrides an explicit path)', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        { version: 1, stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'custom-main.json') }] },
        dir,
      )
      expect(resolved.stores[0].persistenceFile).toBe(join(dir, 'custom-main.json'))
      expect(resolved.stores[0].persistenceFile).not.toBe(join(dir, 'provident-rag.json'))
      expect(resolved.defaultStoreName).toBe('main')
    })
  })

  it('07. H5 — the carve-out keys on the NAME only: [{main,default:false},{other,default:true}] is VALID and main STILL derives the legacy path', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        { version: 1, stores: [{ name: 'main', default: false }, { name: 'other', default: true }] },
        dir,
      )
      expect(resolved.stores[0].default).toBe(false)
      expect(resolved.stores[0].persistenceFile).toBe(join(dir, 'provident-rag.json'))
      expect(resolved.stores[1].persistenceFile).toBe(join(dir, 'provident-rag-other.json'))
      expect(resolved.defaultStoreName).toBe('other')
    })
  })

  it('08. H6 — explicit corpusRoot + persistenceFile are preserved EXACTLY as written (no normalization)', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        {
          version: 1,
          stores: [
            {
              name: 'scratch',
              default: true,
              corpusRoot: join(dir, 'corpus'),
              // A literal dot-segment proves verbatim-ness: a normalized
              // return would have collapsed '/./' (§5.5 H6 "no normalization").
              persistenceFile: dir + '/./scratch.json',
            },
          ],
        },
        dir,
      )
      const store: ResolvedRagStore = resolved.stores[0]
      expect(store.persistenceFile).toBe(dir + '/./scratch.json')
      expect(store.corpusRoot).toBe(join(dir, 'corpus'))
      expect('corpusRoot' in store).toBe(true)
      expect(resolved.defaultStoreName).toBe('scratch')
    })
  })

  it('09. H7 — a non-flagged store and one with explicit default: false materialize identically (default === false; the flag is a definite boolean)', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        { version: 1, stores: [{ name: 'main', default: true }, { name: 'a' }, { name: 'b', default: false }] },
        dir,
      )
      const storeA: ResolvedRagStore = resolved.stores[1]
      const storeB = resolved.stores[2]
      expect('default' in storeA).toBe(true) // materialized, not optional
      expect(storeA.default).toBe(false)
      expect(storeB.default).toBe(false)
      expect(resolved.stores[0].default).toBe(true)
      expect(resolved.defaultStoreName).toBe('main')
    })
  })

  it('10. H8 — N=5 stores, one default, all distinct derived paths, registry array order preserved', () => {
    withDir((dir) => {
      const names = ['store-1', 'store-2', 'store-3', 'store-4', 'store-5']
      const stores = names.map((n, i) => (i === 2 ? { name: n, default: true } : { name: n }))
      const resolved = resolveRegistry({ version: 1, stores }, dir)
      expect(resolved.stores.map((s: ResolvedRagStore) => s.name)).toEqual(names) // no reordering
      expect(resolved.stores.map((s: ResolvedRagStore) => s.persistenceFile)).toEqual(
        names.map((n) => join(dir, `provident-rag-${n}.json`)),
      )
      expect(resolved.defaultStoreName).toBe('store-3')
    })
  })

  it('11. H9 — name boundaries: the 64-char name and "-"/"_"/digit tails are VALID', () => {
    withDir((dir) => {
      const n64 = 'a' + 'b'.repeat(63) // 1 + 63 = 64 chars — valid
      expect(n64.length).toBe(64)
      const resolved = resolveRegistry({ version: 1, stores: [{ name: n64, default: true }] }, dir)
      expect(resolved.stores[0].persistenceFile).toBe(join(dir, `provident-rag-${n64}.json`))
      const resolved2 = resolveRegistry(
        { version: 1, stores: [{ name: 'a-_9', default: true }] },
        dir,
      )
      expect(resolved.stores[0].name).toBe(n64)
      expect(resolved.defaultStoreName).toBe(n64)
      expect(resolved2.stores[0].persistenceFile).toBe(join(dir, 'provident-rag-a-_9.json'))
    })
  })

  it('12. H10 — unknown keys at BOTH levels are tolerated and NOT re-exposed on the resolved store', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        { version: 1, stores: [{ name: 'a', default: true, custom: 'x' }], note: 'ignored' },
        dir,
      )
      expect(resolved.defaultStoreName).toBe('a')
      expect(resolved.stores).toEqual([
        { name: 'a', default: true, persistenceFile: join(dir, 'provident-rag-a.json') },
      ])
      expect('custom' in resolved.stores[0]).toBe(false)
      expect(Object.keys(resolved.stores[0]).sort()).toEqual(['default', 'name', 'persistenceFile'])
    })
  })

  it('13. H11 — version 1.0 (a JSON number) parses to 1 and PASSES the === 1 check', () => {
    withDir((dir) => {
      // The file text literally contains 1.0 (JSON.parse → 1).
      const parsed = JSON.parse('{"version":1.0,"stores":[{"name":"a","default":true}]}')
      const resolved = resolveRegistry(parsed, dir)
      expect(resolved.defaultStoreName).toBe('a')
    })
  })

  it('14. H12 — pure equivalence: resolveRegistry(JSON.parse(fileText), <d>) is deep-equal to loadRagStoreRegistry({path}) on stores/defaultStoreName; the loader adds ONLY path/implicit/corrupt', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      const file: RagStoreRegistryFile = {
        version: 1,
        stores: [{ name: 'research-2026-09', default: true }, { name: 'main' }],
      }
      writeFileSync(reg, JSON.stringify(file))
      const loaded = loadRagStoreRegistry({ path: reg })
      const pure = resolveRegistry(JSON.parse(readFileSync(reg, 'utf8')), dirname(reg))
      expect(pure.stores).toEqual(loaded.stores)
      expect(pure.defaultStoreName).toBe(loaded.defaultStoreName)
      expect(Object.keys(loaded).sort()).toEqual(['corrupt', 'defaultStoreName', 'implicit', 'path', 'stores'])
      expect(loaded.implicit).toBe(false)
      expect(loaded.corrupt).toBe(false)
      expect(loaded.path).toBe(reg)
    })
  })

  it('15. §5.2/§5.8 — RAG_STORE_NAME_PATTERN is the pinned RegExp ^[a-z0-9][a-z0-9_-]{0,63}$ (the F6 message embeds exactly this source)', () => {
    expect(RAG_STORE_NAME_PATTERN).toBeInstanceOf(RegExp)
    expect(RAG_STORE_NAME_PATTERN.source).toBe('^[a-z0-9][a-z0-9_-]{0,63}$')
    // Valid shapes (§5.3.2 item 3): start alnum, then alnum/-/_ up to 64 total.
    expect(RAG_STORE_NAME_PATTERN.test('a')).toBe(true)
    expect(RAG_STORE_NAME_PATTERN.test('9store')).toBe(true) // digits may lead
    expect(RAG_STORE_NAME_PATTERN.test('research-2026-09')).toBe(true)
    expect(RAG_STORE_NAME_PATTERN.test('a-_9')).toBe(true)
    expect(RAG_STORE_NAME_PATTERN.test('a' + 'b'.repeat(63))).toBe(true) // 64 chars
    // Invalid shapes: uppercase, dots, colons (STORE-ID-PREFIX exclusion),
    // leading -/_, empty, and 65 chars.
    expect(RAG_STORE_NAME_PATTERN.test('Main')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('a.b')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('a:b')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('-a')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('_a')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('')).toBe(false)
    expect(RAG_STORE_NAME_PATTERN.test('a' + 'b'.repeat(64))).toBe(false) // 65 chars
  })

  it('16. §5.3.2 field-presence rule — an explicit undefined is ABSENCE on the direct-JS pure path (derived path, omitted corpusRoot, embedder:undefined NOT rejected)', () => {
    withDir((dir) => {
      const resolved = resolveRegistry(
        {
          version: 1,
          stores: [
            // persistenceFile/corpusRoot/embedder explicitly undefined ⇒ absent.
            { name: 'a', default: true, persistenceFile: undefined, corpusRoot: undefined, embedder: undefined },
            { name: 'b', default: undefined },
          ],
        },
        dir,
      )
      expect(resolved.stores[0].persistenceFile).toBe(join(dir, 'provident-rag-a.json'))
      expect('corpusRoot' in resolved.stores[0]).toBe(false)
      expect(resolved.stores[0].default).toBe(true)
      expect(resolved.stores[1].default).toBe(false)
      expect(resolved.stores[1].persistenceFile).toBe(join(dir, 'provident-rag-b.json'))
      expect(resolved.defaultStoreName).toBe('a')
    })
  })
})

// ---------------------------------------------------------------------------
// resolveRegistry — fail-loud byte-pinned errors
// ---------------------------------------------------------------------------
describe('resolveRegistry — the §5.4 fail-loud error set F1–F13 (§5.6 FS5–FS28, FS30)', () => {
  // Data states enumerated (§5.4 + §5.6): the FIRST failing rule in the pinned
  // pass order (guard → A(entry fields, in field order) → B(dup names) →
  // C(exactly one default) → D(collision)) determines the thrown message.
  it('17. FS5/F1 — parsed not a non-null non-array object: null / [] / 5 / "x" / true ⇒ "registry must be an object"', () => {
    withDir((dir) => {
      for (const parsed of [null, [], 5, 'x', true]) {
        expectThrow(() => resolveRegistry(parsed, dir), F1)
      }
    })
  })

  it('18. FS6+FS7/F2 — version missing or !== 1: {} ⇒ (got undefined); 2 ⇒ (got 2); "1" ⇒ (got "1"); true ⇒ (got true)', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({}, dir), f2('undefined'))
      expectThrow(() => resolveRegistry({ version: 2, stores: [] }, dir), f2('2'))
      expectThrow(() => resolveRegistry({ version: '1', stores: [] }, dir), f2('"1"'))
      expectThrow(() => resolveRegistry({ version: true, stores: [] }, dir), f2('true'))
    })
  })

  it('19. FS8/F3 — stores missing or not an array: {version:1} and {version:1,stores:{}} ⇒ "stores must be an array"', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1 }, dir), F3)
      expectThrow(() => resolveRegistry({ version: 1, stores: {} }, dir), F3)
    })
  })

  it('20. FS9/F4 — a null/array entry fails at ITS index: [null]⇒stores[0]; [[]]⇒stores[0]; [valid,null]⇒stores[1]', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1, stores: [null] }, dir), f4(0))
      expectThrow(() => resolveRegistry({ version: 1, stores: [[]] }, dir), f4(0))
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'ok', default: true }, null] }, dir),
        f4(1),
      )
    })
  })

  it('21. FS10/F5 — name missing / "" / non-string ⇒ "stores[<i>].name must be a non-empty string (got <json>)"', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ default: true }] }, dir), f5(0, 'undefined'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: '', default: true }] }, dir), f5(0, '""'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 5, default: true }] }, dir), f5(0, '5'))
      // The index is the ENTRY's index in stores.
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'ok', default: true }, { default: true }] }, dir),
        f5(1, 'undefined'),
      )
    })
  })

  it('22. FS11/F6 — name charset violations: "Main" / "a.b" / "a:b" (STORE-ID-PREFIX) / "-a" / "_a" / 65 chars ⇒ the F6 message with the JSON-quoted name', () => {
    withDir((dir) => {
      const n65 = 'a' + 'b'.repeat(64)
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'Main', default: true }] }, dir), f6(0, '"Main"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a.b', default: true }] }, dir), f6(0, '"a.b"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a:b', default: true }] }, dir), f6(0, '"a:b"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: '-a', default: true }] }, dir), f6(0, '"-a"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: '_a', default: true }] }, dir), f6(0, '"_a"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: n65, default: true }] }, dir), f6(0, `"${n65}"`))
    })
  })

  it('23. FS12/F7 — default present but not boolean: "yes" / 1 / null ⇒ "stores[<i>].default must be a boolean (got <json>)"', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a', default: 'yes' }] }, dir), f7(0, '"yes"'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a', default: 1 }] }, dir), f7(0, '1'))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a', default: null }] }, dir), f7(0, 'null'))
    })
  })

  it('24. FS13/F8 — persistenceFile relative / empty / non-string ⇒ "stores[<i>].persistenceFile must be an absolute path (got <json>)"', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', persistenceFile: 'rel.json' }] }, dir),
        f8(0, '"rel.json"'),
      )
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', persistenceFile: '' }] }, dir),
        f8(0, '""'),
      )
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a', persistenceFile: 5 }] }, dir), f8(0, '5'))
    })
  })

  it('25. FS14/F9 — corpusRoot relative / empty / non-string ⇒ "stores[<i>].corpusRoot must be an absolute path (got <json>)"', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', corpusRoot: 'rel/dir' }] }, dir),
        f9(0, '"rel/dir"'),
      )
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', corpusRoot: '' }] }, dir),
        f9(0, '""'),
      )
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a', corpusRoot: 5 }] }, dir), f9(0, '5'))
    })
  })

  it('26. FS15/F10 — ANY present embedder value ({} / a provider shape / null) ⇒ EXACTLY "per-store embedder config is not supported yet" (no prefix, no index, no name)', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', default: true, embedder: {} }] }, dir),
        F10,
      )
      expectThrow(
        () =>
          resolveRegistry(
            { version: 1, stores: [{ name: 'a', default: true, embedder: { provider: 'ollama', model: 'nomic-embed-text' } }] },
            dir,
          ),
        F10,
      )
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', default: true, embedder: null }] }, dir),
        F10,
      )
    })
  })

  it('27. FS16/F11 — duplicate names ⇒ "duplicate store name \'<name>\'"; the FIRST name seen twice in array order is reported', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a' }, { name: 'a' }] }, dir),
        f11('a'),
      )
      expectThrow(
        () =>
          resolveRegistry(
            { version: 1, stores: [{ name: 'x' }, { name: 'a' }, { name: 'a' }, { name: 'b' }, { name: 'b' }] },
            dir,
          ),
        f11('a'),
      )
    })
  })

  it('28. FS17+FS18+FS19/F12 — the default count must be exactly 1: [] ⇒ found 0; no flagged entry ⇒ found 0; two defaults ⇒ found 2', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1, stores: [] }, dir), f12(0))
      expectThrow(() => resolveRegistry({ version: 1, stores: [{ name: 'a' }, { name: 'b' }] }, dir), f12(0))
      expectThrow(
        () =>
          resolveRegistry(
            { version: 1, stores: [{ name: 'a', default: true }, { name: 'b', default: true }] },
            dir,
          ),
        f12(2),
      )
    })
  })

  it('29. FS20/F13 — explicit-vs-explicit collision ⇒ "persistence file collision: <resolvedPath> (stores \'a\', \'b\')" (the printed path is path.resolve of the CURRENT entry)', () => {
    withDir((dir) => {
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [
                { name: 'a', default: true, persistenceFile: join(dir, 'f.json') },
                { name: 'b', persistenceFile: join(dir, 'f.json') },
              ],
            },
            dir,
          ),
        f13(resolve(join(dir, 'f.json')), 'a', 'b'),
      )
    })
  })

  it('30. FS21+FS22/F13 — derived-vs-explicit collisions in BOTH array orders report (earlier \'a\', current \'b\')', () => {
    withDir((dir) => {
      // FS21 — 'a' derives provident-rag-a.json; 'b' explicitly names it.
      // (Amended 2026-09-05: F13 requires exactly one default — the C-before-D
      // order (FS28) would otherwise yield F12 for a zero-default input.)
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [{ name: 'a', default: true }, { name: 'b', persistenceFile: join(dir, 'provident-rag-a.json') }],
            },
            dir,
          ),
        f13(resolve(join(dir, 'provident-rag-a.json')), 'a', 'b'),
      )
      // FS22 — reverse order: 'a' explicitly names 'b''s derived file.
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [{ name: 'a', default: true, persistenceFile: join(dir, 'provident-rag-b.json') }, { name: 'b' }],
            },
            dir,
          ),
        f13(resolve(join(dir, 'provident-rag-b.json')), 'a', 'b'),
      )
    })
  })

  it('31. FS23/F13 — the collision comparison is path.resolve-normalized: "<d>/f.json" vs "<d>/./f.json" collides', () => {
    withDir((dir) => {
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [
                { name: 'a', default: true, persistenceFile: join(dir, 'f.json') },
                { name: 'b', persistenceFile: dir + '/./f.json' },
              ],
            },
            dir,
          ),
        f13(resolve(dir + '/./f.json'), 'a', 'b'),
      )
    })
  })

  it('32. FS24/F13 — legacy-path collision: [{main},{x, <d>/provident-rag.json}] ⇒ (earlier \'main\', current \'x\')', () => {
    withDir((dir) => {
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [{ name: 'main', default: true }, { name: 'x', persistenceFile: join(dir, 'provident-rag.json') }],
            },
            dir,
          ),
        f13(resolve(join(dir, 'provident-rag.json')), 'main', 'x'),
      )
    })
  })

  it('33. FS25 — precedence WITHIN one entry: {name:"", embedder:{}} ⇒ F5 (the name check precedes the embedder check)', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: '', embedder: {} }] }, dir),
        f5(0, '""'),
      )
    })
  })

  it('34. FS26+FS27+FS28 — pass precedence A→B→C→D: embedder beats duplicate-name; duplicate-name beats zero-defaults; zero-defaults beats collision', () => {
    withDir((dir) => {
      // FS26 — ALL Pass A checks precede Pass B: the second entry has BOTH a
      // duplicate name AND an embedder; F10 must win.
      expectThrow(
        () =>
          resolveRegistry(
            { version: 1, stores: [{ name: 'a' }, { name: 'a', embedder: {} }] },
            dir,
          ),
        F10,
      )
      // FS27 — Pass B precedes Pass C: duplicate names AND zero defaults ⇒ F11.
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a' }, { name: 'a' }] }, dir),
        f11('a'),
      )
      // FS28 — Pass C precedes Pass D: zero defaults AND a collision ⇒ F12.
      expectThrow(
        () =>
          resolveRegistry(
            {
              version: 1,
              stores: [
                { name: 'a', persistenceFile: join(dir, 'f.json') },
                { name: 'b', persistenceFile: join(dir, 'f.json') },
              ],
            },
            dir,
          ),
        f12(0),
      )
    })
  })

  it('35. FS30/G-dir — resolveRegistry with a non-string/empty registryDir throws the G-dir guard (the guard precedes F1: parsed=null still throws G-dir)', () => {
    expectThrow(() => resolveRegistry(null, ''), G_DIR)
    expectThrow(() => resolveRegistry(null, undefined as unknown as string), G_DIR)
    expectThrow(() => resolveRegistry(null, 5 as unknown as string), G_DIR)
  })
})

// ---------------------------------------------------------------------------
// loadRagStoreRegistry — the boot-time entry point
// ---------------------------------------------------------------------------
describe('loadRagStoreRegistry — the boot split (§5.3.3; §5.5 H1/H13/H14; §5.6 FS1–FS4/FS29; §5.7 B1–B5)', () => {
  // Load outcomes enumerated (REGISTRY-BOOT-SPLIT, §4):
  //   absent file   ⇒ implicit synthesis, NO log, NO file/dir created (B2/B3).
  //   corrupt file  ⇒ implicit synthesis + the ONE pinned console.error (fail-soft).
  //   invalid file  ⇒ the byte-pinned resolveRegistry Error PROPAGATES (fail-loud).
  //   caller error  ⇒ the G-load guard throw (FS29).
  it('36. FS29/G-load — null / not-an-object opts / non-string or empty path ⇒ exactly "rag-store-registry: path required"', () => {
    expectThrow(() => loadRagStoreRegistry(null as unknown as RagStoreRegistryOptions), G_LOAD)
    expectThrow(() => loadRagStoreRegistry(undefined as unknown as RagStoreRegistryOptions), G_LOAD)
    expectThrow(() => loadRagStoreRegistry(5 as unknown as RagStoreRegistryOptions), G_LOAD)
    expectThrow(() => loadRagStoreRegistry({} as RagStoreRegistryOptions), G_LOAD)
    expectThrow(() => loadRagStoreRegistry({ path: 5 as unknown as string } as RagStoreRegistryOptions), G_LOAD)
    expectThrow(() => loadRagStoreRegistry({ path: '' }), G_LOAD)
  })

  it('37. H1/B1/B2/B3/B4 — absent registry file ⇒ the implicit main store: exact shape, ZERO log lines, NO file and NO directory created, corpusRoot omitted', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const listingBefore = readdirSync(dir)
      const opts: RagStoreRegistryOptions = { path: reg }
      const loaded: LoadedRagStoreRegistry = loadRagStoreRegistry(opts)
      expect(loaded).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') }],
        defaultStoreName: 'main',
        path: reg,
        implicit: true,
        corrupt: false,
      })
      // B1 — the implicit persistence path is join(registryDir, 'provident-rag.json')
      // (byte-equal to main.ts:119 under the userData wiring).
      expect(loaded.stores[0].persistenceFile).toBe(join(dir, 'provident-rag.json'))
      // B4 — corpusRoot is OMITTED, never filled with process.cwd().
      expect('corpusRoot' in loaded.stores[0]).toBe(false)
      // B3 — the absent-file path emits ZERO log lines on ANY console channel.
      expect(errSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      // B2 — NO file and NO directory are created (never written back).
      expect(readdirSync(dir)).toEqual(listingBefore)
      expect(existsSync(reg)).toBe(false)
      // B2 (the no-mkdir half) — a MISSING parent directory is also left uncreated.
      const nested = join(dir, 'missing-sub', REG_FILE_NAME)
      const nestedLoaded = loadRagStoreRegistry({ path: nested })
      expect(nestedLoaded.implicit).toBe(true)
      expect(nestedLoaded.corrupt).toBe(false)
      expect(nestedLoaded.stores[0].persistenceFile).toBe(join(dir, 'missing-sub', 'provident-rag.json'))
      expect(existsSync(join(dir, 'missing-sub'))).toBe(false)
      expect(errSpy).not.toHaveBeenCalled()
    })
  })

  it('38. FS1/B5 — byte-garbage registry file ("{not json") ⇒ fail-soft implicit + the ONE pinned LOG-1 console.error (arg1 byte-pinned, arg2 = the caught SyntaxError); NOTHING rewritten', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      writeFileSync(reg, '{not json')
      const listingBefore = readdirSync(dir)
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') }],
        defaultStoreName: 'main',
        path: reg,
        implicit: true,
        corrupt: true,
      })
      // LOG-1 — exactly ONE console.error call; the byte-pinned first argument
      // carries opts.path; the caught error is the SECOND argument (its text
      // is NOT byte-pinned) (§5.4).
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0]).toHaveLength(2)
      expect(errSpy.mock.calls[0][0]).toBe(
        `[rag-store-registry] registry file unreadable (${reg}); falling back to the implicit main store`,
      )
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(SyntaxError)
      expect(logSpy).not.toHaveBeenCalled()
      expect(infoSpy).not.toHaveBeenCalled()
      expect(warnSpy).not.toHaveBeenCalled()
      // B5 — fail-soft writes NOTHING: the corrupt bytes are untouched.
      expect(readFileSync(reg, 'utf8')).toBe('{not json')
      expect(readdirSync(dir)).toEqual(listingBefore)
    })
  })

  it('39. FS2 — an EMPTY registry file (JSON.parse("") throws) ⇒ identical fail-soft outcome to FS1', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      writeFileSync(reg, '')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') }],
        defaultStoreName: 'main',
        path: reg,
        implicit: true,
        corrupt: true,
      })
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0][0]).toBe(
        `[rag-store-registry] registry file unreadable (${reg}); falling back to the implicit main store`,
      )
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(SyntaxError)
    })
  })

  it('40. FS3 — the registry path is a DIRECTORY (the isFile probe trips first — F-MS1-5 mechanism; outcome unchanged: fail-soft, NOT fail-loud), identical to FS1', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      mkdirSync(reg)
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.implicit).toBe(true)
      expect(loaded.corrupt).toBe(true)
      expect(loaded.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
      ])
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0][0]).toBe(
        `[rag-store-registry] registry file unreadable (${reg}); falling back to the implicit main store`,
      )
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(Error) // the isFile-probe Error (pre-F-MS1-5: EISDIR from the read), not SyntaxError
    })
  })

  // SKIP REASON: the permission-denied fail-state is only reachable when the
  // process cannot bypass file modes; running as root (getuid() === 0) reads a
  // 0o000 file fine, so the trigger is unreachable and the test is skipped.
  it.runIf(typeof process.getuid === 'function' && process.getuid() !== 0)(
    '41. FS4 — a permission-denied (chmod 000) registry file ⇒ fail-soft, identical to FS1',
    () => {
      withDir((dir) => {
        const reg = join(dir, REG_FILE_NAME)
        writeFileSync(reg, '{"version":1,"stores":[{"name":"main","default":true}]}')
        chmodSync(reg, 0o000)
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const loaded = loadRagStoreRegistry({ path: reg })
        expect(loaded.implicit).toBe(true)
        expect(loaded.corrupt).toBe(true)
        expect(loaded.stores).toEqual([
          { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        ])
        expect(errSpy).toHaveBeenCalledTimes(1)
        expect(errSpy.mock.calls[0][0]).toBe(
          `[rag-store-registry] registry file unreadable (${reg}); falling back to the implicit main store`,
        )
        expect(errSpy.mock.calls[0][1]).toBeInstanceOf(Error) // EACCES
      })
    },
  )

  it('42. §5.3.3 step 3 — a DANGLING symlink behaves as ABSENT (existsSync is the probe): implicit, corrupt:false, NO log', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      symlinkSync(join(dir, 'missing-target.json'), reg)
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.implicit).toBe(true)
      expect(loaded.corrupt).toBe(false)
      expect(loaded.defaultStoreName).toBe('main')
      expect(loaded.stores[0].persistenceFile).toBe(join(dir, 'provident-rag.json'))
      expect(errSpy).not.toHaveBeenCalled()
    })
  })

  it('43. H13 — statelessness: repeated loadRagStoreRegistry calls return deep-equal results; mutating one result cannot affect another; pure calls are fresh per call', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      const first = loadRagStoreRegistry({ path: reg })
      const second = loadRagStoreRegistry({ path: reg })
      expect(second).toEqual(first)
      first.stores.push({ name: 'mutated', default: false, persistenceFile: '/mutated.json' })
      const third = loadRagStoreRegistry({ path: reg })
      expect(third).toEqual(second)
      // §5.3.2 — the pure resolve output is freshly constructed per call too.
      const p1 = resolveRegistry({ version: 1, stores: [{ name: 'a', default: true }] }, dir)
      const p2 = resolveRegistry({ version: 1, stores: [{ name: 'a', default: true }] }, dir)
      expect(p1).toEqual(p2)
      expect(p1).not.toBe(p2)
      expect(p1.stores[0]).not.toBe(p2.stores[0])
    })
  })

  it('44. H14 — the corrupt-path result is usable: deep-equal to the absent-file result on stores/defaultStoreName; ONLY corrupt differs; the pinned log fired once', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const absent = loadRagStoreRegistry({ path: reg })
      writeFileSync(reg, '{not json')
      const corrupt = loadRagStoreRegistry({ path: reg })
      expect(corrupt.stores).toEqual(absent.stores)
      expect(corrupt.defaultStoreName).toBe(absent.defaultStoreName)
      expect(absent.implicit).toBe(true)
      expect(corrupt.implicit).toBe(true)
      expect(absent.corrupt).toBe(false)
      expect(corrupt.corrupt).toBe(true)
      expect(errSpy).toHaveBeenCalledTimes(1) // the absent path is silent
    })
  })
})

// ---------------------------------------------------------------------------
// Module census + structural pins
// ---------------------------------------------------------------------------
describe('export census + structural pins (§5.3, §5.1, §5.4, §5.8; D8)', () => {
  // Data states enumerated: the runtime export surface (types are erased) must
  // be EXACTLY the 3 functions + 1 const; the absence of a mutation API is part
  // of the contract (D8); the import set contains no write primitive and no
  // Electron (§5.1's structural no-write enforcement); exactly ONE
  // console.error call site and ZERO other log channels (§5.4 census).
  it('45. §5.3/§5.8/D8 — the runtime exports are EXACTLY implicitRegistry/resolveRegistry/loadRagStoreRegistry + RAG_STORE_NAME_PATTERN; NO set/persist/reload/mutation API; derivePersistenceFile is NOT exported', () => {
    const mod = ragStoreRegistryModule as unknown as Record<string, unknown>
    expect(Object.keys(mod).sort()).toEqual([
      'RAG_STORE_NAME_PATTERN',
      'implicitRegistry',
      'loadRagStoreRegistry',
      'resolveRegistry',
    ])
    expect(typeof mod.implicitRegistry).toBe('function')
    expect(typeof mod.resolveRegistry).toBe('function')
    expect(typeof mod.loadRagStoreRegistry).toBe('function')
    expect(mod.RAG_STORE_NAME_PATTERN).toBeInstanceOf(RegExp)
    // D8 — "the absence is part of the contract": no mutation/persist/reload
    // surface, and the ONE internal helper (derivePersistenceFile) stays
    // non-exported (§5.3).
    for (const bannedExport of [
      'set',
      'persist',
      'save',
      'write',
      'reload',
      'refresh',
      'create',
      'remove',
      'delete',
      'derivePersistenceFile',
    ]) {
      expect(mod, `must not export '${bannedExport}' (D8: registry mutation is boot-time-only)`).not.toHaveProperty(
        bannedExport,
      )
    }
  })

  // NOTE (TestWriter): this is the ONE white-box test in the file. §5.1 makes
  // the no-write property STRUCTURAL ("the module's import set contains no
  // write primitive"), which is only observable by scanning the module source;
  // §5.4's "exactly ONE console.error call site / ZERO other log channels" is
  // likewise a source-level census. The behavioral halves (B2/B5 no writes on
  // disk; zero log lines on absent/valid; exactly one error call on corrupt)
  // are asserted in tests 37/38/04.
  it('46. §5.1/§5.4 — structural scan of the module source: no write/unlink primitives, no electron import, exactly ONE console.error site, ZERO console.log/info/warn', () => {
    const moduleFile = fileURLToPath(new URL('../src/main/rag-store-registry.ts', import.meta.url))
    const src = readFileSync(moduleFile, 'utf8')
    // §5.1 — "electron must NOT appear" (literal pin, comments included).
    expect(src).not.toContain('electron')
    // §5.1 — NO write/rm primitive may be imported.
    for (const banned of [
      'writeFileSync',
      'renameSync',
      'mkdirSync',
      'appendFileSync',
      'unlink',
      'unlinkSync',
      'rmdirSync',
      'rmSync',
      'cpSync',
      'truncateSync',
      'chmodSync',
    ]) {
      expect(src, `the pure module must not reference '${banned}' (§5.1 no-write)`).not.toMatch(
        new RegExp(`\\b${banned}\\b`),
      )
    }
    // §5.1 — the pinned read primitives ARE present.
    expect(src).toContain('node:fs')
    expect(src).toContain('node:path')
    expect(src).toContain('existsSync')
    expect(src).toContain('readFileSync')
    // §5.4 census — exactly ONE console.error call site; ZERO other channels.
    expect(src.match(/console\.error/g)).toHaveLength(1)
    expect(src.match(/console\.log/g)).toBeNull()
    expect(src.match(/console\.info/g)).toBeNull()
    expect(src.match(/console\.warn/g)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Adversarial fix batch F-MS1-1..F-MS1-7a (2026-09-05) — RED-FIRST regression
// tests (RCA-1: written and run RED against the PRE-FIX module BEFORE the
// module fixes). Sources: the Architect's rulings on the U-MS1 adversarial
// pass + the spec amendments (§3a registration; §5.3.2 Pass D + F8/F9; §5.3.3
// step 4; §5.4 <json> cap; new rows FS31/FS32; FS13/FS14 NUL examples). The
// 46 tests above stay byte-intact; numbering continues at 47.
// ---------------------------------------------------------------------------

/** F-MS1-2 helper — stub `process.platform` for the duration of `run`
 *  (defineProperty + try/finally restore of the ORIGINAL descriptor; the
 *  platform property is configurable in Node, so the restore always lands). */
function withPlatform(platform: NodeJS.Platform, run: () => void): void {
  const original = Object.getOwnPropertyDescriptor(process, 'platform')
  if (original === undefined) {
    throw new Error('process.platform descriptor unavailable')
  }
  try {
    Object.defineProperty(process, 'platform', { ...original, value: platform })
    run()
  } finally {
    Object.defineProperty(process, 'platform', original)
  }
}

const DEVICE_FILE_PATH = '/dev/null'

/** F-MS1-5 availability probe — a device file expressible WITHOUT root:
 *  /dev/null is a character device (`isFile() === false`) on unix-likes. */
const DEVICE_FILE_AVAILABLE: boolean = (() => {
  try {
    return existsSync(DEVICE_FILE_PATH) && !statSync(DEVICE_FILE_PATH).isFile()
  } catch {
    return false
  }
})()

/** F-MS1-5 availability probe — a real FIFO needs mkfifo(1); Linux-only per
 *  the ruling (probed once at load, in its own cleaned-up temp dir). */
const CAN_MKFIFO: boolean = (() => {
  if (process.platform !== 'linux') {
    return false
  }
  const probeDir = mkdtempSync(join(tmpdir(), 'provident-ms1-mkfifo-probe-'))
  try {
    return spawnSync('mkfifo', [join(probeDir, 'probe.fifo')]).status === 0
  } finally {
    rmSync(probeDir, { recursive: true, force: true })
  }
})()

describe('F-MS1-1 — BOM fail-soft: ONE leading U+FEFF is stripped before JSON.parse (§5.3.3 step 4, FS31)', () => {
  it('47. FS31 — a BOM-prefixed VALID registry loads NORMALLY (implicit:false, corrupt:false, ZERO log lines)', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      writeFileSync(reg, '\uFEFF{"version":1,"stores":[{"name":"main","default":true}]}')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.implicit).toBe(false)
      expect(loaded.corrupt).toBe(false)
      expect(loaded.defaultStoreName).toBe('main')
      expect(loaded.stores).toEqual([
        { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
      ])
      expect(errSpy).not.toHaveBeenCalled()
    })
  })

  it('48. FS31 — BOM + byte garbage ⇒ fail-soft exactly as pinned (implicit + corrupt + LOG-1, arg2 = the SyntaxError)', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      writeFileSync(reg, '\uFEFF{not json')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded).toEqual({
        stores: [{ name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') }],
        defaultStoreName: 'main',
        path: reg,
        implicit: true,
        corrupt: true,
      })
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0]).toHaveLength(2)
      expect(errSpy.mock.calls[0][0]).toBe(log1(reg))
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(SyntaxError)
    })
  })

  it('49. FS31 — a SECOND leading BOM (a BOM at the JSON after the ONE-BOM strip) is still a SyntaxError ⇒ fail-soft', () => {
    withDir((dir) => {
      const reg = join(dir, REG_FILE_NAME)
      writeFileSync(reg, '\uFEFF\uFEFF{"version":1,"stores":[{"name":"main","default":true}]}')
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: reg })
      expect(loaded.implicit).toBe(true)
      expect(loaded.corrupt).toBe(true)
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(SyntaxError)
    })
  })
})

describe('F-MS1-2 — Pass D collision key is platform-conditional: casefolded on darwin/win32, lexical elsewhere (§5.3.2 Pass D)', () => {
  it('50. F13 on darwin (stubbed platform) — case-differing persistence paths COLLIDE; the message prints the ORIGINAL resolved path', () => {
    withDir((dir) => {
      withPlatform('darwin', () => {
        expectThrow(
          () =>
            resolveRegistry(
              {
                version: 1,
                stores: [
                  { name: 'a', default: true, persistenceFile: join(dir, 'F.json') },
                  { name: 'b', persistenceFile: join(dir, 'f.json') },
                ],
              },
              dir,
            ),
          f13(resolve(join(dir, 'f.json')), 'a', 'b'),
        )
      })
    })
  })

  it('51. F13 on darwin (stubbed platform) — the F13 path is NOT casefolded: the current entry <d>/F.JSON prints UPPERCASE', () => {
    withDir((dir) => {
      withPlatform('darwin', () => {
        expectThrow(
          () =>
            resolveRegistry(
              {
                version: 1,
                stores: [
                  { name: 'a', default: true, persistenceFile: join(dir, 'f.json') },
                  { name: 'b', persistenceFile: join(dir, 'F.JSON') },
                ],
              },
              dir,
            ),
          f13(resolve(join(dir, 'F.JSON')), 'a', 'b'),
        )
      })
    })
  })

  it('52. F13 on darwin (stubbed platform) — derived-vs-explicit case collision: b names <d>/Provident-Rag-A.json', () => {
    withDir((dir) => {
      withPlatform('darwin', () => {
        expectThrow(
          () =>
            resolveRegistry(
              {
                version: 1,
                stores: [
                  { name: 'a', default: true },
                  { name: 'b', persistenceFile: join(dir, 'Provident-Rag-A.json') },
                ],
              },
              dir,
            ),
          f13(resolve(join(dir, 'Provident-Rag-A.json')), 'a', 'b'),
        )
      })
    })
  })

  // The DEFAULT platform (linux in this repo) keeps LEXICAL keys — a
  // case-differing pair resolves VALID (no false positive). Skipped on
  // darwin/win32, where the casefolded key makes the same pair a collision.
  it.skipIf(process.platform === 'darwin' || process.platform === 'win32')(
    '53. no false positive on the default platform — case-differing paths stay DISTINCT (lexical keys)',
    () => {
      withDir((dir) => {
        const resolved = resolveRegistry(
          {
            version: 1,
            stores: [
              { name: 'a', default: true, persistenceFile: join(dir, 'F.json') },
              { name: 'b', persistenceFile: join(dir, 'f.json') },
            ],
          },
          dir,
        )
        expect(resolved.stores.map((s: ResolvedRagStore) => s.name)).toEqual(['a', 'b'])
        expect(resolved.defaultStoreName).toBe('a')
      })
    },
  )
})

describe('F-MS1-3 — jsonOf is TOTAL: BigInt/cyclic inputs yield the pinned F-message, never a TypeError (§5.4)', () => {
  it('54. F2 with a BigInt version: {version:1n} ⇒ the pinned F2 message with the String()-ified value (got 1)', () => {
    withDir((dir) => {
      expectThrow(() => resolveRegistry({ version: 1n, stores: [] }, dir), f2('1'))
    })
  })

  it('55. F7 with a cyclic default ⇒ the pinned F7 message with the String()-ified value (got [object Object])', () => {
    withDir((dir) => {
      const cyclic: Record<string, unknown> = {}
      cyclic.self = cyclic
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', default: cyclic }] }, dir),
        f7(0, '[object Object]'),
      )
    })
  })
})

describe('F-MS1-4 — the exported RAG_STORE_NAME_PATTERN is frozen; validation reads an internal frozen copy (§5.3/§5.8)', () => {
  it('56. the export is Object.isFrozen — an own .test shadow on the export object is impossible', () => {
    expect(Object.isFrozen(RAG_STORE_NAME_PATTERN)).toBe(true)
  })

  it('57. tamper simulation: validation still rejects "../escape" via the internal copy (the F6 message is unchanged)', () => {
    withDir((dir) => {
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: '../escape', default: true }] }, dir),
        f6(0, '"../escape"'),
      )
    })
  })
})

describe('F-MS1-6 — the <json> rendering is capped: >200 chars ⇒ first 197 chars + "…" (§5.4)', () => {
  it('58. a 300-char store name ⇒ F6 whose embedded <json> is exactly 198 chars ending with "…"', () => {
    withDir((dir) => {
      const n300 = 'a' + 'b'.repeat(299)
      expect(n300.length).toBe(300)
      const rendered = JSON.stringify(n300).slice(0, 197) + '…'
      expect(rendered.length).toBe(198)
      expect(rendered.endsWith('…')).toBe(true)
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: n300, default: true }] }, dir),
        f6(0, rendered),
      )
    })
  })

  it('59. the byte-pinned 65-char F6 case stays byte-intact (67 rendered chars < the 200 cap — no ellipsis)', () => {
    withDir((dir) => {
      const n65 = 'a' + 'b'.repeat(64)
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: n65, default: true }] }, dir),
        f6(0, `"${n65}"`),
      )
    })
  })
})

describe('F-MS1-7a — NUL-byte paths are fail-loud authoring errors in F8/F9 (§5.3.2, §5.4 FS13/FS14)', () => {
  it('60. F8 — a persistenceFile containing U+0000 ⇒ the pinned F8 message (same shape, NUL JSON-escaped)', () => {
    withDir((dir) => {
      const nul = join(dir, 'a\u0000b.json')
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', persistenceFile: nul }] }, dir),
        f8(0, JSON.stringify(nul)),
      )
    })
  })

  it('61. F9 — a corpusRoot containing U+0000 ⇒ the pinned F9 message (same shape, NUL JSON-escaped)', () => {
    withDir((dir) => {
      const nul = join(dir, 'c\u0000d')
      expectThrow(
        () => resolveRegistry({ version: 1, stores: [{ name: 'a', corpusRoot: nul }] }, dir),
        f9(0, JSON.stringify(nul)),
      )
    })
  })
})

describe('F-MS1-5 — a non-regular file at the registry path fail-softs BEFORE readFileSync (§5.3.3, FS32)', () => {
  // SKIP REASON (per the ruling): a device file is only expressible without
  // root where a world-readable character device exists (/dev/null on
  // unix-likes); the test skips cleanly elsewhere.
  it.runIf(DEVICE_FILE_AVAILABLE)(
    '62. FS32 — a device file (character device /dev/null) ⇒ fail-soft + LOG-1 with the device path pinned',
    () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const loaded = loadRagStoreRegistry({ path: DEVICE_FILE_PATH })
      expect(loaded.implicit).toBe(true)
      expect(loaded.corrupt).toBe(true)
      expect(errSpy).toHaveBeenCalledTimes(1)
      expect(errSpy.mock.calls[0][0]).toBe(log1(DEVICE_FILE_PATH))
      expect(errSpy.mock.calls[0][1]).toBeInstanceOf(Error)
    },
  )

  // SKIP REASON (per the ruling): a real FIFO needs mkfifo(1) — Linux-only.
  // PLACED LAST deliberately: against the PRE-FIX module this test HANGS in
  // readFileSync (the F-MS1-5 defect itself), so it must not wedge the run
  // before the other results report. Short timeout keeps the red run finite.
  it.runIf(CAN_MKFIFO)(
    '63. FS32 — a FIFO at the registry path ⇒ fail-soft + LOG-1 (the isFile probe fires BEFORE the blocking read)',
    () => {
      withDir((dir) => {
        const reg = join(dir, REG_FILE_NAME)
        expect(spawnSync('mkfifo', [reg]).status).toBe(0)
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const loaded = loadRagStoreRegistry({ path: reg })
        expect(loaded.implicit).toBe(true)
        expect(loaded.corrupt).toBe(true)
        expect(loaded.stores).toEqual([
          { name: 'main', default: true, persistenceFile: join(dir, 'provident-rag.json') },
        ])
        expect(errSpy).toHaveBeenCalledTimes(1)
        expect(errSpy.mock.calls[0][0]).toBe(log1(reg))
        expect(errSpy.mock.calls[0][1]).toBeInstanceOf(Error)
      })
    },
    2000,
  )
})